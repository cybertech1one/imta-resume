import http from "http";

function get(path, cookie) {
  return new Promise((resolve, reject) => {
    const url = new URL("http://localhost:3040" + path);
    const req = http.request({
      method: "GET", hostname: url.hostname, port: url.port,
      path: url.pathname + url.search,
      headers: { "Origin": "http://localhost:3040", ...(cookie ? { "Cookie": cookie } : {}) }
    }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });
    req.on("error", reject);
    req.end();
  });
}

function post(path, body, cookie, method = "POST") {
  return new Promise((resolve, reject) => {
    const postBody = JSON.stringify({ json: body });
    const req = http.request({
      method, hostname: "localhost", port: 3040, path,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postBody),
        "Origin": "http://localhost:3040",
        ...(cookie ? { "Cookie": cookie } : {})
      }
    }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve({ status: res.statusCode, data, cookies: res.headers["set-cookie"] || [] }));
    });
    req.on("error", reject);
    req.write(postBody);
    req.end();
  });
}

function login(email, password) {
  const body = JSON.stringify({ email, password });
  return new Promise((resolve) => {
    const req = http.request({
      method: "POST", hostname: "localhost", port: 3040, path: "/api/auth/sign-in/email",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body), "Origin": "http://localhost:3040" }
    }, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => {
        const sessionCookie = (res.headers["set-cookie"] || []).find(c => c.includes("better-auth"));
        resolve(sessionCookie ? sessionCookie.split(";")[0] : "");
      });
    });
    req.write(body); req.end();
  });
}

async function test() {
  let pass = 0, fail = 0;
  function check(name, condition) {
    if (condition) { pass++; console.log("  PASS:", name); }
    else { fail++; console.log("  FAIL:", name); }
  }

  // Login
  console.log("\n=== Auth ===");
  const cookie = await login("student1@test.com", "TestAccount123!");
  check("Login successful", !!cookie);

  // Create resume
  console.log("\n=== Resume CRUD ===");
  const slug = "test-" + Date.now();
  const createRes = await post("/api/rpc/resume/create", {
    name: "CV Ahmed El Fassi",
    slug,
    tags: ["ingenieur", "casablanca"],
    withSampleData: false
  }, cookie);
  check("Create resume returns 200", createRes.status === 200);
  const resumeId = JSON.parse(createRes.data)?.json;
  check("Resume ID returned", !!resumeId);
  console.log("  Resume ID:", resumeId);

  // Fetch resume
  const getUrl = "/api/rpc/resume/getById?data=" + encodeURIComponent(JSON.stringify({ json: { id: resumeId } }));
  const getRes = await get(getUrl, cookie);
  check("Get resume returns 200", getRes.status === 200);
  const resume = JSON.parse(getRes.data)?.json;
  check("Resume has data object", !!resume?.data);

  // Update with realistic data
  const updatedData = JSON.parse(JSON.stringify(resume.data));
  updatedData.basics.name = "Ahmed El Fassi";
  updatedData.basics.headline = "Ingénieur Logiciel Senior";
  updatedData.basics.email = "ahmed.elfassi@example.com";
  updatedData.basics.phone = "+212 612345678";
  updatedData.basics.location = "Casablanca, Maroc";
  updatedData.basics.summary = "Ingénieur logiciel passionné avec 5 ans d'expérience en développement web full-stack.";

  if (updatedData.sections?.experience) {
    updatedData.sections.experience.items = [{
      id: "exp-1", hidden: false, company: "OCP Group", position: "Développeur Full-Stack Senior",
      location: "Casablanca, Maroc", period: "Jan 2022 - Présent",
      description: "<p>Développement d'applications web pour la gestion de la chaîne d'approvisionnement.</p>",
      website: { label: "", url: "" }
    }];
  }

  if (updatedData.sections?.education) {
    updatedData.sections.education.items = [{
      id: "edu-1", hidden: false, school: "IMTA - Institut Mines-Télécom Atlantique",
      degree: "Diplôme d'Ingénieur", area: "Informatique et Télécommunications",
      location: "Nantes, France", period: "2017 - 2020",
      description: "<p>Spécialisation en génie logiciel et systèmes distribués.</p>",
      grade: "Mention Bien", website: { label: "", url: "" }
    }];
  }

  if (updatedData.sections?.skills) {
    updatedData.sections.skills.items = [
      { id: "sk-1", hidden: false, icon: "", name: "React & TypeScript", proficiency: "Expert", level: 5, keywords: ["React", "TypeScript", "Next.js"] },
      { id: "sk-2", hidden: false, icon: "", name: "Node.js & Express", proficiency: "Advanced", level: 4, keywords: ["Node.js", "Express"] },
      { id: "sk-3", hidden: false, icon: "", name: "PostgreSQL", proficiency: "Advanced", level: 4, keywords: ["PostgreSQL", "MongoDB", "Redis"] },
    ];
  }

  const updateRes = await post("/api/rpc/resume/update", { id: resumeId, data: updatedData }, cookie, "PUT");
  check("Update resume returns 200", updateRes.status === 200);
  if (updateRes.status !== 200) console.log("  Update error:", updateRes.data.substring(0, 200));

  // Verify update
  const verifyRes = await get(getUrl, cookie);
  const verified = JSON.parse(verifyRes.data)?.json;
  check("Basics name updated", verified?.data?.basics?.name === "Ahmed El Fassi");
  check("Headline updated", verified?.data?.basics?.headline === "Ingénieur Logiciel Senior");
  check("Experience has items", (verified?.data?.sections?.experience?.items?.length || 0) > 0);
  check("Education has items", (verified?.data?.sections?.education?.items?.length || 0) > 0);
  check("Skills has items", (verified?.data?.sections?.skills?.items?.length || 0) > 0);

  // List resumes
  const listUrl = "/api/rpc/resume/list?data=" + encodeURIComponent(JSON.stringify({ json: undefined }));
  const listRes = await get(listUrl, cookie);
  check("List resumes returns 200", listRes.status === 200);
  const items = JSON.parse(listRes.data)?.json;
  check("Resume list has items", Array.isArray(items) && items.length > 0);
  console.log("  Total resumes:", items?.length);

  // AI Status
  console.log("\n=== AI Features ===");
  const aiUrl = "/api/rpc/aiConfig/status/check?data=" + encodeURIComponent(JSON.stringify({ json: undefined }));
  const aiRes = await get(aiUrl, cookie);
  check("AI status returns 200", aiRes.status === 200);
  const aiData = JSON.parse(aiRes.data)?.json;
  check("AI is available", aiData?.available === true);
  console.log("  Provider:", aiData?.provider?.displayName);

  // AI Grammar Fix (streaming endpoint - just check it accepts the request)
  const grammarRes = await post("/api/rpc/ai/fixGrammar", {
    content: "je suis developeur avec beaucoup experience en programation web."
  }, cookie);
  check("Grammar fix returns 200", grammarRes.status === 200);
  if (grammarRes.status === 200) {
    console.log("  Response length:", grammarRes.data.length, "chars (streaming)");
  } else {
    console.log("  Grammar error:", grammarRes.data.substring(0, 200));
  }

  // AI Improve Content (streaming endpoint)
  const improveRes = await post("/api/rpc/ai/improveContent", {
    content: "j'ai codé des sites web et des apps mobile pour des clients"
  }, cookie);
  check("Improve content returns 200", improveRes.status === 200);
  if (improveRes.status === 200) {
    console.log("  Response length:", improveRes.data.length, "chars (streaming)");
  } else {
    console.log("  Improve error:", improveRes.data.substring(0, 200));
  }

  // Page rendering tests
  console.log("\n=== Page Rendering ===");
  const pages = [
    "/", "/dashboard", "/dashboard/interview", "/dashboard/career",
    "/dashboard/career/assessment", "/dashboard/career/skills", "/dashboard/career/roadmap",
    "/dashboard/jobs", "/dashboard/jobs/follow-up", "/dashboard/analytics",
    "/dashboard/networking", "/dashboard/portfolio", "/dashboard/resources",
    "/dashboard/settings/ai", "/dashboard/help",
    "/builder/" + resumeId,
  ];

  for (const page of pages) {
    const res = await get(page, cookie);
    const ok = res.status === 200 || res.status === 307;
    const hasError = res.data.includes("TypeError") || res.data.includes("Cannot read") || res.data.includes("ReferenceError");
    check(`${page} (${res.status})`, ok && !hasError);
    if (hasError) {
      const match = res.data.match(/(TypeError|ReferenceError|Cannot read)[^<]*/);
      if (match) console.log("    Error:", match[0].substring(0, 150));
    }
  }

  // Admin tests
  console.log("\n=== Admin ===");
  const adminCookie = await login("admin@test.com", "TestAccount123!");
  check("Admin login", !!adminCookie);

  const adminPages = ["/dashboard/admin", "/dashboard/admin/ai-providers", "/dashboard/admin/ai-quotas"];
  for (const page of adminPages) {
    const res = await get(page, adminCookie);
    check(`${page} (${res.status})`, res.status === 200);
  }

  // Summary
  console.log("\n" + "=".repeat(40));
  console.log(`Results: ${pass} passed, ${fail} failed out of ${pass + fail} tests`);
  console.log("=".repeat(40));

  process.exit(fail > 0 ? 1 : 0);
}

test().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
