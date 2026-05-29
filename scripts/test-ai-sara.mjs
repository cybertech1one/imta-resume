/**
 * Sara Mernissi's Comprehensive AI Feature Test
 * Tests every AI endpoint in the IMTA Resume platform
 */

const BASE = "http://localhost:3040";
let cookies = "";

// ============ AUTH ============
async function signIn() {
  console.log("\n========================================");
  console.log("  STEP 0: SIGNING IN AS SARA (student1)");
  console.log("========================================\n");

  const res = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE },
    body: JSON.stringify({ email: "student1@test.com", password: "TestAccount123!" }),
    redirect: "manual",
  });

  const setCookies = res.headers.getSetCookie?.() || [];
  cookies = setCookies.map(c => c.split(";")[0]).join("; ");
  const body = await res.json().catch(() => null);
  console.log(`  Status: ${res.status}`);
  console.log(`  Cookie: ${cookies ? cookies.substring(0, 60) + "..." : "NONE"}`);
  console.log(`  Body: ${JSON.stringify(body)?.substring(0, 200)}`);

  if (!cookies) {
    console.log("  FATAL: No cookies received. Cannot continue.");
    process.exit(1);
  }
  return body;
}

// ============ HELPERS ============
function hdrs(extra = {}) {
  return {
    "Content-Type": "application/json",
    "Cookie": cookies,
    "Origin": BASE,
    ...extra,
  };
}

async function rpcGet(path) {
  const url = `${BASE}/api/rpc/${path}`;
  const res = await fetch(url, { headers: hdrs() });
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

async function rpcPost(path, input, method = "POST") {
  const url = `${BASE}/api/rpc/${path}`;
  const res = await fetch(url, {
    method: method,
    headers: hdrs(),
    body: JSON.stringify({ json: input }),
  });
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

async function rpcPut(path, input) {
  return rpcPost(path, input, "PUT");
}

async function rpcPostSSE(path, input) {
  const url = `${BASE}/api/rpc/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: hdrs({ "Accept": "text/event-stream" }),
    body: JSON.stringify({ json: input }),
  });

  if (!res.ok) {
    const text = await res.text();
    try { return { status: res.status, data: JSON.parse(text), streamed: false }; }
    catch { return { status: res.status, data: text, streamed: false }; }
  }

  // Read SSE stream
  const text = await res.text();
  let chunks = [];
  for (const line of text.split("\n")) {
    if (line.startsWith("data: ")) {
      try {
        const parsed = JSON.parse(line.slice(6));
        if (parsed.json !== undefined) chunks.push(parsed.json);
        else chunks.push(parsed);
      } catch {
        chunks.push(line.slice(6));
      }
    }
  }

  return { status: res.status, data: chunks.join(""), streamed: true, rawChunks: chunks.length };
}

// ============ RESULTS TRACKER ============
const results = [];
function record(name, status, detail) {
  results.push({ name, status, detail: typeof detail === "string" ? detail : JSON.stringify(detail).substring(0, 300) });
  const icon = status === "PASS" ? "+" : status === "FAIL" ? "X" : "!";
  console.log(`  [${icon}] ${name}: ${status}`);
  if (detail) console.log(`      ${typeof detail === "string" ? detail.substring(0, 200) : JSON.stringify(detail).substring(0, 200)}`);
}

// ============ STEP 1: CREATE RESUME ============
async function createResume() {
  console.log("\n========================================");
  console.log("  STEP 1: CREATE RESUME");
  console.log("========================================\n");

  const res = await rpcPost("resume/create", {
    name: "CV Sara Mernissi - Conductrice d Engins",
    slug: "cv-sara-mernissi-conductrice-engins-" + Date.now(),
    tags: ["conducteur-engins", "IMTA", "BTP"],
  });

  // create returns { json: "uuid-string" }
  const resumeId = res.data?.json;
  if (res.status !== 200 || !resumeId || typeof resumeId !== "string") {
    console.log("  Resume creation response:", JSON.stringify(res.data).substring(0, 300));
    record("Create Resume", "FAIL", `Status ${res.status}: ${JSON.stringify(res.data).substring(0, 200)}`);
    return null;
  }

  console.log(`  Resume created: ${resumeId}`);
  record("Create Resume", "PASS", `ID: ${resumeId}`);

  // Now update with full data
  const resumeData = {
    basics: {
      name: "Sara Mernissi",
      headline: "Conductrice d'Engins de Chantier | Diplomee IMTA",
      email: "sara.mernissi@email.com",
      phone: "+212 6 12 34 56 78",
      location: "Berrechid, Maroc",
      url: { label: "", url: "" },
      picture: { url: "", size: 64, effects: { hidden: false, border: false, grayscale: false } },
      website: { url: "", label: "" },
      customFields: [],
    },
    summary: {
      title: "Resume",
      hidden: false,
      content: "je suis une conductrice d engins je sais conduire les bulldozers et les excavateurs j ai fait un stage chez Ciments du Maroc pendant 6 mois",
    },
    sections: {
      profiles: { title: "Profiles", hidden: false, items: [] },
      experience: {
        title: "Experience",
        hidden: false,
        items: [
          {
            id: "exp-1",
            company: "Ciments du Maroc",
            position: "Stagiaire Conductrice d'Engins",
            location: "Settat, Maroc",
            period: "Jan 2025 - Juin 2025",
            date: "2025",
            url: { label: "", url: "" },
            summary: "",
            description: "Conduite de bulldozers et excavateurs sur chantier. Maintenance preventive des engins. Respect des normes de securite HSE. Lecture et interpretation des plans topographiques.",
            visible: true,
          },
        ],
      },
      education: {
        title: "Formation",
        hidden: false,
        items: [
          {
            id: "edu-1",
            school: "IMTA - Institut Marocain des Travaux Appliques",
            degree: "BTS",
            area: "Conducteur d'Engins de Chantier",
            grade: "Bien",
            location: "Berrechid, Maroc",
            period: "2024 - 2026",
            date: "2026",
            url: { label: "", url: "" },
            summary: "",
            description: "Formation professionnelle en conduite d engins lourds, maintenance, securite et topographie.",
            visible: true,
          },
        ],
      },
      skills: {
        title: "Competences",
        hidden: false,
        items: [
          { id: "s1", name: "Conduite engins lourds", level: 4, keywords: ["bulldozer", "excavateur", "chargeuse"] },
          { id: "s2", name: "Maintenance preventive", level: 3, keywords: ["entretien", "diagnostic"] },
          { id: "s3", name: "Securite chantier", level: 4, keywords: ["HSE", "EPI", "signalisation"] },
          { id: "s4", name: "Lecture de plans", level: 3, keywords: ["topographie", "genie civil"] },
          { id: "s5", name: "Topographie", level: 3, keywords: ["nivellement", "implantation"] },
          { id: "s6", name: "CACES equivalent", level: 4, keywords: ["certification", "engins cat 1-9"] },
        ],
      },
      languages: { title: "Langues", hidden: false, items: [
        { id: "l1", language: "Arabe", fluency: "Langue maternelle", level: 5 },
        { id: "l2", language: "Francais", fluency: "Courant", level: 4 },
        { id: "l3", language: "Anglais", fluency: "Intermediaire", level: 2 },
      ]},
      certifications: { title: "Certifications", hidden: false, items: [] },
      projects: { title: "Projets", hidden: false, items: [] },
      awards: { title: "Prix", hidden: false, items: [] },
      volunteer: { title: "Benevolat", hidden: false, items: [] },
      interests: { title: "Centres d interet", hidden: false, items: [
        { id: "i1", name: "Technologies", keywords: ["IA", "robotique", "drones"] },
        { id: "i2", name: "Sport", keywords: ["athletisme", "natation"] },
      ]},
      references: { title: "References", hidden: false, items: [] },
      publications: { title: "Publications", hidden: false, items: [] },
    },
    metadata: {
      template: "azurill",
      layout: [[["summary", "experience", "education"], ["skills", "languages", "interests"]]],
      css: { value: "", visible: false },
      locale: "fr",
      date: { format: "DD/MM/YYYY" },
      page: { margin: 18, format: "a4", options: { breakLine: true, pageNumbers: true } },
      theme: { background: "#ffffff", text: "#000000", primary: "#059669" },
      typography: { font: { family: "Open Sans", subset: "latin", variants: ["regular"], size: 13 }, lineHeight: 1.5, hideIcons: false, underlineLinks: true },
      notes: "",
    },
    customSections: [],
    picture: { url: "", size: 64, effects: { hidden: true, border: false, grayscale: false } },
  };

  const updateRes = await rpcPut("resume/update", {
    id: resumeId,
    data: resumeData,
  });

  if (updateRes.status === 200) {
    record("Update Resume Data", "PASS", "Full resume data with experience, education, skills, languages");
  } else {
    record("Update Resume Data", "FAIL", `Status ${updateRes.status}: ${JSON.stringify(updateRes.data).substring(0, 200)}`);
  }

  return resumeId;
}

// ============ STEP 2: TEST AI FEATURES ============
async function testAiFeatures(resumeId) {
  console.log("\n========================================");
  console.log("  STEP 2: TEST AI FEATURES");
  console.log("========================================\n");

  // 1. AI Status Check
  console.log("\n--- 2.1: AI Status Check ---");
  const statusRes = await rpcGet("aiConfig/status/check");
  if (statusRes.status === 200 && statusRes.data?.json?.available) {
    record("AI Status Check", "PASS", `Available: ${statusRes.data.json.available}, Provider: ${statusRes.data.json.provider?.displayName || "unknown"}`);
  } else if (statusRes.status === 200) {
    record("AI Status Check", "WARN", `AI not available: ${JSON.stringify(statusRes.data)}`);
  } else {
    record("AI Status Check", "FAIL", `Status ${statusRes.status}: ${JSON.stringify(statusRes.data).substring(0, 200)}`);
  }

  // 2. Generate Headline (SSE streaming)
  console.log("\n--- 2.2: Generate Headline ---");
  const headlineInput = {
    resumeData: {
      name: "Sara Mernissi",
      currentHeadline: "Conductrice d'Engins de Chantier | Diplomee IMTA",
      experience: [
        { company: "Ciments du Maroc", position: "Stagiaire Conductrice d'Engins" },
      ],
      skills: ["Conduite engins lourds", "Maintenance preventive", "Securite chantier", "Lecture de plans", "Topographie"],
    },
    language: "fr",
  };
  if (resumeId) headlineInput.resumeId = resumeId;
  const headlineRes = await rpcPostSSE("ai/generateHeadline", headlineInput);
  if (headlineRes.status === 200 && headlineRes.data) {
    record("Generate Headline", "PASS", `Generated: "${headlineRes.data}"`);
  } else {
    record("Generate Headline", "FAIL", headlineRes.data);
  }

  // 3. Improve Content (SSE streaming)
  console.log("\n--- 2.3: Improve Content ---");
  const improveInput = {
    content: "je suis une conductrice d engins je sais conduire les bulldozers et les excavateurs j ai fait un stage chez Ciments du Maroc pendant 6 mois et j ai appris beaucoup de choses",
    language: "fr",
  };
  if (resumeId) improveInput.resumeId = resumeId;
  const improveRes = await rpcPostSSE("ai/improveContent", improveInput);
  if (improveRes.status === 200 && improveRes.data) {
    record("Improve Content", "PASS", `Improved text (${improveRes.data.length} chars): "${improveRes.data.substring(0, 150)}..."`);
  } else {
    record("Improve Content", "FAIL", improveRes.data);
  }

  // 4. Fix Grammar (SSE streaming)
  console.log("\n--- 2.4: Fix Grammar ---");
  const grammarInput = {
    content: "j ai travaille dans le chantier pendant 6 mois et j ai appris beaucoup de chose sur la conduite des engin lourd et la maintenance preventive des machine",
    language: "fr",
  };
  if (resumeId) grammarInput.resumeId = resumeId;
  const grammarRes = await rpcPostSSE("ai/fixGrammar", grammarInput);
  if (grammarRes.status === 200 && grammarRes.data) {
    record("Fix Grammar", "PASS", `Fixed (${grammarRes.data.length} chars): "${grammarRes.data.substring(0, 150)}..."`);
  } else {
    record("Fix Grammar", "FAIL", grammarRes.data);
  }

  // 5. Suggest Skills (non-streaming)
  console.log("\n--- 2.5: Suggest Skills ---");
  const skillsInput = {
    resumeData: {
      experience: [
        { company: "Ciments du Maroc", position: "Stagiaire Conductrice d'Engins", description: "Conduite de bulldozers et excavateurs. Maintenance preventive. Securite HSE." },
      ],
      education: [
        { institution: "IMTA", degree: "BTS", area: "Conducteur d'Engins de Chantier" },
      ],
      existingSkills: ["Conduite engins lourds", "Maintenance preventive", "Securite chantier"],
    },
    language: "fr",
  };
  if (resumeId) skillsInput.resumeId = resumeId;
  const skillsRes = await rpcPost("ai/suggestSkills", skillsInput);
  if (skillsRes.status === 200 && skillsRes.data?.json) {
    const skills = skillsRes.data.json;
    record("Suggest Skills", "PASS", `Got ${Array.isArray(skills) ? skills.length : 0} suggestions: ${JSON.stringify(skills).substring(0, 200)}`);
  } else {
    record("Suggest Skills", "FAIL", skillsRes.data);
  }

  // 6. Generate Summary (SSE streaming)
  console.log("\n--- 2.6: Generate Summary ---");
  const summaryInput = {
    resumeData: {
      name: "Sara Mernissi",
      headline: "Conductrice d'Engins de Chantier | Diplomee IMTA",
      experience: [
        { company: "Ciments du Maroc", position: "Stagiaire Conductrice d'Engins", description: "Conduite de bulldozers et excavateurs sur chantier." },
      ],
      education: [
        { institution: "IMTA", degree: "BTS", area: "Conducteur d'Engins de Chantier" },
      ],
      skills: [{ name: "Conduite engins lourds" }, { name: "Maintenance preventive" }, { name: "Securite chantier" }, { name: "Topographie" }],
    },
    language: "fr",
  };
  if (resumeId) summaryInput.resumeId = resumeId;
  const summaryRes = await rpcPostSSE("ai/generateSummary", summaryInput);
  if (summaryRes.status === 200 && summaryRes.data) {
    record("Generate Summary", "PASS", `Generated (${summaryRes.data.length} chars): "${summaryRes.data.substring(0, 150)}..."`);
  } else {
    record("Generate Summary", "FAIL", summaryRes.data);
  }

  // 7. Analyze Resume (non-streaming, structured output)
  console.log("\n--- 2.7: Analyze Resume ---");
  const analyzeInput = {
    resumeData: {
      picture: { hidden: true, url: "" },
      basics: {
        name: "Sara Mernissi",
        headline: "Conductrice d'Engins de Chantier | Diplomee IMTA",
        email: "sara.mernissi@email.com",
        phone: "+212 6 12 34 56 78",
        location: "Berrechid, Maroc",
        website: { url: "", label: "" },
        customFields: [],
      },
      summary: {
        title: "Resume",
        hidden: false,
        content: "Jeune diplomee de l IMTA en conduite d engins de chantier, j ai realise un stage de 6 mois chez Ciments du Maroc ou j ai opere bulldozers et excavateurs tout en respectant les normes HSE.",
      },
      sections: {
        profiles: { title: "Profiles", hidden: false, items: [] },
        experience: {
          title: "Experience",
          hidden: false,
          items: [{
            company: "Ciments du Maroc",
            position: "Stagiaire Conductrice d'Engins",
            location: "Settat, Maroc",
            period: "Jan 2025 - Juin 2025",
            description: "Conduite de bulldozers et excavateurs. Maintenance preventive. Securite HSE. Lecture de plans topographiques.",
          }],
        },
        education: {
          title: "Formation",
          hidden: false,
          items: [{
            school: "IMTA",
            degree: "BTS",
            area: "Conducteur d'Engins de Chantier",
            grade: "Bien",
            location: "Berrechid, Maroc",
            period: "2024 - 2026",
            description: "Formation professionnelle en conduite d engins lourds.",
          }],
        },
        skills: {
          title: "Competences",
          hidden: false,
          items: [
            { name: "Conduite engins lourds", level: 4, keywords: ["bulldozer", "excavateur"] },
            { name: "Maintenance preventive", level: 3, keywords: ["entretien"] },
            { name: "Securite chantier", level: 4, keywords: ["HSE"] },
            { name: "Lecture de plans", level: 3, keywords: ["topographie"] },
            { name: "Topographie", level: 3, keywords: ["nivellement"] },
            { name: "CACES equivalent", level: 4, keywords: ["certification"] },
          ],
        },
        languages: {
          title: "Langues",
          hidden: false,
          items: [
            { language: "Arabe", fluency: "Langue maternelle", level: 5 },
            { language: "Francais", fluency: "Courant", level: 4 },
            { language: "Anglais", fluency: "Intermediaire", level: 2 },
          ],
        },
        certifications: { title: "Certifications", hidden: false, items: [] },
        projects: { title: "Projets", hidden: false, items: [] },
        awards: { title: "Prix", hidden: false, items: [] },
        volunteer: { title: "Benevolat", hidden: false, items: [] },
        interests: {
          title: "Centres d interet",
          hidden: false,
          items: [
            { name: "Technologies", keywords: ["IA", "robotique"] },
            { name: "Sport", keywords: ["athletisme"] },
          ],
        },
        references: { title: "References", hidden: false, items: [] },
        publications: { title: "Publications", hidden: false, items: [] },
      },
    },
    language: "fr",
  };
  if (resumeId) analyzeInput.resumeId = resumeId;
  const analyzeRes = await rpcPost("ai/analyzeResume", analyzeInput);
  if (analyzeRes.status === 200 && analyzeRes.data?.json) {
    const analysis = analyzeRes.data.json;
    record("Analyze Resume", "PASS", `Score: ${analysis.overallScore}/100, Keys: ${Object.keys(analysis).join(", ")}`);
  } else {
    record("Analyze Resume", "FAIL", analyzeRes.data);
  }

  // 8. Interview Question Generation
  console.log("\n--- 2.8: Interview Question Generation ---");
  const interviewRes = await rpcPost("interview/generateQuestions", {
    field: "industrial",
    types: ["behavioral", "technical", "situational"],
    difficulty: "intermediate",
    numberOfQuestions: 5,
    language: "fr",
    resumeContext: {
      name: "Sara Mernissi",
      headline: "Conductrice d'Engins de Chantier",
      experience: [
        { company: "Ciments du Maroc", position: "Stagiaire Conductrice d'Engins", description: "Conduite bulldozers et excavateurs" },
      ],
      education: [
        { school: "IMTA", degree: "BTS", area: "Conducteur d'Engins" },
      ],
      skills: ["Conduite engins lourds", "Maintenance preventive", "Securite chantier"],
    },
  });
  if (interviewRes.status === 200 && interviewRes.data?.json) {
    const questions = interviewRes.data.json;
    record("Interview Question Generation", "PASS", `Got ${Array.isArray(questions) ? questions.length : 0} questions: ${JSON.stringify(questions).substring(0, 200)}`);
  } else {
    record("Interview Question Generation", "FAIL", interviewRes.data);
  }

  // 9. AI Quota Check
  console.log("\n--- 2.9: AI Quota Check ---");
  const quotaRes = await rpcGet("aiConfig/usage/getMyUsage");
  if (quotaRes.status === 200) {
    record("AI Quota Check (getMyUsage)", "PASS", quotaRes.data);
  } else {
    record("AI Quota Check (getMyUsage)", "FAIL", quotaRes.data);
  }

  // Also try getMyQuota
  const quotaLimitsRes = await rpcGet("aiConfig/usage/getMyQuota");
  if (quotaLimitsRes.status === 200) {
    record("AI Quota Limits (getMyQuota)", "PASS", quotaLimitsRes.data);
  } else {
    record("AI Quota Limits (getMyQuota)", "FAIL", quotaLimitsRes.data);
  }

  return interviewRes.data?.json; // Return questions for session creation
}

// ============ STEP 3: EDGE CASES ============
async function testEdgeCases(resumeId) {
  console.log("\n========================================");
  console.log("  STEP 3: AI EDGE CASES");
  console.log("========================================\n");

  // 3.1: Darija (Moroccan Arabic)
  console.log("\n--- 3.1: Darija Input ---");
  const darijaRes = await rpcPostSSE("ai/improveContent", {
    content: "ana khdama f chantier dial ciments du maroc, kansoug les bulldozers w les excavateurs, dert stage 6 chhor w t3elemt bzaf dial les techniques dial la conduite w la maintenance",
    language: "fr",
  });
  if (darijaRes.status === 200 && darijaRes.data) {
    record("Darija Input", "PASS", `AI handled Darija: "${darijaRes.data.substring(0, 150)}..."`);
  } else {
    record("Darija Input", "FAIL", darijaRes.data);
  }

  // 3.2: Empty input
  console.log("\n--- 3.2: Empty Input ---");
  const emptyRes = await rpcPostSSE("ai/improveContent", {
    content: "",
    language: "fr",
  });
  record("Empty Input", emptyRes.status !== 200 ? "PASS" : "WARN",
    `Status ${emptyRes.status}: ${typeof emptyRes.data === "string" ? emptyRes.data.substring(0, 200) : JSON.stringify(emptyRes.data).substring(0, 200)}`);

  // 3.3: Very long input (500+ chars)
  console.log("\n--- 3.3: Very Long Input ---");
  const longText = "Conductrice d engins de chantier diplomee de l IMTA Berrechid, j ai acquis une solide formation en conduite de bulldozers Cat D6, excavateurs Komatsu PC200, chargeuses sur pneus Volvo L120, et compacteurs BOMAG. Durant mon stage de 6 mois chez Ciments du Maroc a Settat, j ai participe aux operations de terrassement, nivellement, chargement de materiaux, et transport sur site. J ai egalement developpe des competences en maintenance preventive des engins, incluant les verifications quotidiennes d huile, de liquide de refroidissement, de pression des pneus, et de fonctionnement des systemes hydrauliques. Ma formation m a aussi permis d acquerir des connaissances approfondies en topographie, lecture de plans, securite sur chantier HSE, et reglementation des engins de travaux publics au Maroc.";
  const longRes = await rpcPostSSE("ai/improveContent", {
    content: longText,
    language: "fr",
  });
  if (longRes.status === 200 && longRes.data) {
    record("Very Long Input (700+ chars)", "PASS", `Processed ${longText.length} chars -> ${longRes.data.length} chars output`);
  } else {
    record("Very Long Input (700+ chars)", "FAIL", longRes.data);
  }

  // 3.4: Mixed French/Arabic with special characters
  console.log("\n--- 3.4: Mixed French/Arabic ---");
  const mixedRes = await rpcPostSSE("ai/improveContent", {
    content: "Sara Mernissi, IMTA Conducteur d Engins. Ciments du Maroc 6 mois. bulldozer excavateurs hydrauliques.",
    language: "fr",
  });
  if (mixedRes.status === 200 && mixedRes.data) {
    record("Mixed Content", "PASS", `AI handled mixed: "${mixedRes.data.substring(0, 150)}..."`);
  } else {
    record("Mixed Content", "FAIL", mixedRes.data);
  }

  // 3.5: Fix Grammar with Darija-influenced French
  console.log("\n--- 3.5: Darija-influenced French Grammar ---");
  const darijaFrRes = await rpcPostSSE("ai/fixGrammar", {
    content: "moi j ai fait le stage dans la societe Ciments du Maroc et normalement j ai fait la conduite des engins comme le bulldozer et l excavateur et aussi j ai fait la maintenance preventive et tout ca",
    language: "fr",
  });
  if (darijaFrRes.status === 200 && darijaFrRes.data) {
    record("Darija-influenced French Fix", "PASS", `Fixed: "${darijaFrRes.data.substring(0, 150)}..."`);
  } else {
    record("Darija-influenced French Fix", "FAIL", darijaFrRes.data);
  }
}

// ============ STEP 4: CREATE INTERVIEW SESSIONS ============
async function createInterviewSessions(questions) {
  console.log("\n========================================");
  console.log("  STEP 4: CREATE INTERVIEW SESSIONS");
  console.log("========================================\n");

  // 4.1: Behavioral interview session
  console.log("\n--- 4.1: Behavioral Interview Session ---");
  let behavQuestions = questions && Array.isArray(questions)
    ? questions.filter(q => q.type === "behavioral").slice(0, 3)
    : [];

  // If not enough behavioral questions, generate some
  if (behavQuestions.length < 3) {
    const genRes = await rpcPost("interview/generateQuestions", {
      field: "industrial",
      types: ["behavioral"],
      difficulty: "intermediate",
      numberOfQuestions: 5,
      language: "fr",
      resumeContext: {
        name: "Sara Mernissi",
        headline: "Conductrice d'Engins de Chantier",
        skills: ["Conduite engins lourds", "Securite chantier"],
      },
    });
    if (genRes.status === 200 && genRes.data?.json && Array.isArray(genRes.data.json)) {
      behavQuestions = genRes.data.json;
    }
  }

  if (behavQuestions.length > 0) {
    const sessionRes = await rpcPost("interview/createSession", {
      title: "Entretien Comportemental - Sara Mernissi",
      description: "Session d entretien comportemental pour poste de conductrice d engins",
      field: "industrial",
      types: ["behavioral"],
      difficulty: "intermediate",
      language: "fr",
      questions: behavQuestions.slice(0, 5),
    });

    if (sessionRes.status === 200 && sessionRes.data?.json) {
      record("Create Behavioral Session", "PASS", `Session ID: ${sessionRes.data.json.id}, Questions: ${behavQuestions.length}`);
    } else {
      record("Create Behavioral Session", "FAIL", sessionRes.data);
    }
  } else {
    record("Create Behavioral Session", "FAIL", "No behavioral questions available");
  }

  // 4.2: Technical interview session
  console.log("\n--- 4.2: Technical Interview Session ---");
  const techRes = await rpcPost("interview/generateQuestions", {
    field: "industrial",
    types: ["technical"],
    difficulty: "advanced",
    numberOfQuestions: 5,
    language: "fr",
    resumeContext: {
      name: "Sara Mernissi",
      headline: "Conductrice d'Engins de Chantier",
      experience: [
        { company: "Ciments du Maroc", position: "Stagiaire Conductrice d'Engins", description: "Conduite bulldozers, excavateurs. Maintenance preventive." },
      ],
      skills: ["Conduite engins lourds", "Maintenance preventive", "CACES equivalent", "Topographie"],
    },
    jobPosition: "Conductrice d'Engins",
    companyName: "LafargeHolcim Maroc",
  });

  if (techRes.status === 200 && techRes.data?.json) {
    const techQuestions = Array.isArray(techRes.data.json) ? techRes.data.json : [];
    record("Generate Technical Questions", "PASS", `Got ${techQuestions.length} technical questions`);

    if (techQuestions.length > 0) {
      const techSessionRes = await rpcPost("interview/createSession", {
        title: "Entretien Technique - Conductrice Engins - LafargeHolcim",
        description: "Session d entretien technique avance pour poste de conductrice d engins chez LafargeHolcim Maroc",
        field: "industrial",
        types: ["technical"],
        difficulty: "advanced",
        language: "fr",
        jobPosition: "Conductrice d'Engins",
        companyName: "LafargeHolcim Maroc",
        questions: techQuestions,
      });

      if (techSessionRes.status === 200 && techSessionRes.data?.json) {
        record("Create Technical Session", "PASS", `Session ID: ${techSessionRes.data.json.id}`);
      } else {
        record("Create Technical Session", "FAIL", techSessionRes.data);
      }
    }
  } else {
    record("Generate Technical Questions", "FAIL", techRes.data);
  }

  // Check existing sessions
  console.log("\n--- 4.3: List My Sessions ---");
  const sessionsRes = await rpcPost("interview/getSessions", {
    limit: 10,
    offset: 0,
  });
  if (sessionsRes.status === 200) {
    const sessions = sessionsRes.data?.json;
    record("List Sessions", "PASS", `Found ${Array.isArray(sessions) ? sessions.length : 0} sessions`);
  } else {
    record("List Sessions", "FAIL", sessionsRes.data);
  }
}

// ============ MAIN ============
async function main() {
  console.log("========================================================");
  console.log("  SARA MERNISSI - AI FEATURE COMPREHENSIVE TEST");
  console.log("  Testing Every AI Endpoint in IMTA Resume");
  console.log("========================================================");

  // Sign in
  await signIn();

  // Step 1: Create resume
  const resumeId = await createResume();

  // Step 2: Test AI features
  const questions = await testAiFeatures(resumeId);

  // Step 3: Edge cases
  await testEdgeCases(resumeId);

  // Step 4: Interview sessions
  await createInterviewSessions(questions);

  // ============ FINAL REPORT ============
  console.log("\n\n========================================================");
  console.log("              SARA'S AI FEATURE REPORT");
  console.log("========================================================\n");

  const passed = results.filter(r => r.status === "PASS").length;
  const failed = results.filter(r => r.status === "FAIL").length;
  const warned = results.filter(r => r.status === "WARN").length;

  console.log(`  TOTAL TESTS: ${results.length}`);
  console.log(`  + PASSED: ${passed}`);
  console.log(`  X FAILED: ${failed}`);
  console.log(`  ! WARNINGS: ${warned}`);
  console.log("");

  console.log("  DETAILED RESULTS:");
  console.log("  ---------------------------------------------------------");
  for (const r of results) {
    const icon = r.status === "PASS" ? "+" : r.status === "FAIL" ? "X" : "!";
    console.log(`  [${icon}] ${r.name}: ${r.status}`);
    console.log(`      ${r.detail.substring(0, 250)}`);
    console.log("");
  }

  console.log("\n  =========================================================");
  console.log("  END OF TEST RUN");
  console.log("  =========================================================\n");
}

main().catch(err => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
