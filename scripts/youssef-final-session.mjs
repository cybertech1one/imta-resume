/**
 * Youssef El Fassi — Final Comprehensive Session
 * All correct endpoint names. Tests everything possible.
 * Uses student2 (fresh quota) + admin fallback.
 */
import https from "https";

const BASE_HOST = "imta-resume-app-production.up.railway.app";
const BASE = `https://${BASE_HOST}`;

let cookie = "";
const results = [];
const bugs = [];
const created = {};
let sessionUser = "";

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      "Content-Type": "application/json",
      "Origin": BASE,
      "x-csrf-token": "orpc",
      "Cookie": cookie,
    };
    if (payload) headers["Content-Length"] = Buffer.byteLength(payload);
    const t0 = Date.now();
    const r = https.request({ hostname: BASE_HOST, path, method, headers }, res => {
      const sc = res.headers["set-cookie"] || [];
      if (sc.length > 0) cookie = sc.map(c => c.split(";")[0]).join("; ");
      let d = "";
      res.on("data", c => { d += c; });
      res.on("end", () => {
        let json = null;
        try { const p = JSON.parse(d); json = p?.json !== undefined ? p.json : p; } catch {}
        resolve({ status: res.statusCode, json, text: d, latency: Date.now() - t0 });
      });
    });
    r.on("error", reject);
    if (payload) r.write(payload);
    r.end();
  });
}

async function rpc(path, input) {
  return req("POST", `/api/rpc/${path}`, { json: input !== undefined ? input : null });
}

function log(status, step, detail, latency) {
  const icon = { PASS: "✓", FAIL: "✗", BUG: "BUG", INFO: "→" }[status] || "?";
  const ms = latency !== null && latency !== undefined ? ` [${latency}ms]` : "";
  console.log(`${icon} ${step}${ms}: ${detail}`);
  results.push({ status, step, detail, latency });
  if (status === "BUG") bugs.push({ step, detail });
}

async function waitLogin(email, password, label) {
  for (let i = 0; i < 10; i++) {
    const r = await req("POST", "/api/auth/sign-in/email", { email, password });
    if (r.status === 200) {
      log("PASS", `Login [${label}]`, `${email}, cookie OK`, r.latency);
      sessionUser = email;
      return r.json?.user;
    }
    if (r.status === 429) {
      const b = (() => { try { return JSON.parse(r.text); } catch { return {}; } })();
      const wait = (b.retryAfter || 10) * 1000 + 500;
      console.log(`  Rate limited, waiting ${wait}ms...`);
      await new Promise(res => setTimeout(res, wait));
      continue;
    }
    log("FAIL", `Login [${label}]`, `${r.status} ${r.text.slice(0, 100)}`, r.latency);
    return null;
  }
  return null;
}

async function main() {
  const t0 = Date.now();
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  YOUSSEF EL FASSI — Cariste CACES R489               ║");
  console.log("║  IMTA Production API — Final Session                 ║");
  console.log(`║  ${new Date().toISOString().slice(0, 19).padEnd(50)}║`);
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // ── AUTH ──────────────────────────────────────────────
  console.log("=== PHASE 0: AUTH ===");
  // Try student2 first (student1 quota exhausted)
  let user = await waitLogin("student2@test.com", "TestAccount123!", "student2");
  if (!user) user = await waitLogin("student1@test.com", "TestAccount123!", "student1");
  if (!user) user = await waitLogin("admin@test.com", "TestAccount123!", "admin");

  const sr = await req("GET", "/api/auth/get-session", null);
  if (sr.json?.user?.email) {
    log("PASS", "Session", `${sr.json.user.email} role=${sr.json.user.role} program=${sr.json.user.imtaProgram}`, sr.latency);
    created.userId = sr.json.user.id;
    created.userEmail = sr.json.user.email;
  } else {
    log("FAIL", "Session", `no user — cannot continue`, sr.latency);
    bugs.push({ step: "AUTH", detail: "All login attempts failed" });
  }

  // ── RESUME ────────────────────────────────────────────
  console.log("\n=== PHASE 1: CARISTE RESUME ===");

  // Create
  const slug = `cv-cariste-youssef-${Date.now()}`;
  const rc = await rpc("resume/create", {
    name: "CV Cariste — Youssef El Fassi CACES R489",
    slug,
    tags: ["logistique", "industrie", "caces"],
    withSampleData: false,
  });
  if (rc.status === 200) {
    created.resumeId = typeof rc.json === "string" ? rc.json : rc.json?.id;
    log("PASS", "Create resume", `id=${created.resumeId}`, rc.latency);
  } else {
    log("FAIL", "Create resume", `${rc.status} ${rc.json?.message || rc.text?.slice(0, 120)}`, rc.latency);
    if (rc.status === 500) bugs.push({ step: "resume/create", detail: `500 error` });
    // fallback to existing
    const rl = await rpc("resume/list", {});
    if (rl.status === 200 && rl.json?.length > 0) created.resumeId = rl.json[0].id;
  }

  // Get (verify immediately)
  if (created.resumeId) {
    const rg = await rpc("resume/getById", { id: created.resumeId });
    if (rg.status === 200 && rg.json?.id) {
      log("PASS", "resume/getById (immediate verify)", `name="${rg.json.name}"`, rg.latency);
    } else {
      log("FAIL", "resume/getById fails right after create", `${rg.status} ${rg.json?.message || ""}`, rg.latency);
      bugs.push({ step: "resume/getById", detail: `404 right after create — endpoint or ownership check issue` });
    }
  }

  // Update with cariste profile data
  if (created.resumeId) {
    const ru = await rpc("resume/update", {
      id: created.resumeId,
      name: "CV Cariste CACES R489 — Youssef El Fassi",
      isPublic: false,
    });
    log(ru.status === 200 ? "PASS" : "FAIL", "Update resume (name)", `${ru.status} ${ru.status !== 200 ? ru.json?.message || ru.text?.slice(0, 100) : "OK"}`, ru.latency);

    // Update tags
    const rt = await rpc("resume/update", {
      id: created.resumeId,
      tags: ["logistique", "caces-r489", "industrial"],
    });
    log(rt.status === 200 ? "PASS" : "FAIL", "Update resume (tags)", `${rt.status}`, rt.latency);
  }

  // AI suggestSkills
  const as = await rpc("ai/suggestSkills", {
    resumeData: {
      experience: [
        { company: "OCP Group", position: "Cariste CACES R489", description: "Conduite chariots élévateurs frontaux 5T, gestion stock, HSE" },
      ],
      education: [{ degree: "Certificat", area: "Logistique Industrielle", institution: "IMTA" }],
      skills: ["CACES R489 Cat.3", "Gestion de stocks", "HSE"],
    },
    language: "fr",
  });
  if (as.status === 200 && as.json) {
    const skills = Array.isArray(as.json) ? as.json : [];
    log("PASS", "AI suggestSkills (cariste fr)", `${skills.length} skills: ${skills.slice(0, 3).map(s => s.name || s).join(", ")}`, as.latency);
  } else if (as.status === 403) {
    log("BUG", "AI suggestSkills — quota exhausted", `403 Daily token limit exceeded for ${sessionUser}`, as.latency);
    bugs.push({ step: "AI suggestSkills", detail: `403 Daily quota exhausted — user ${sessionUser} cannot use AI features` });
  } else {
    log("FAIL", "AI suggestSkills", `${as.status} ${as.json?.message || as.text?.slice(0, 120)}`, as.latency);
  }

  // AI improveContent (streaming)
  const ic = await req("POST", "/api/rpc/ai/improveContent", {
    json: {
      content: "je travaille comme cariste et je conduis des chariots élévateurs dans un entrepôt logistique",
      language: "fr",
    },
  });
  if (ic.status === 200 && ic.text.length > 100) {
    // Parse SSE stream to get actual content
    const textChunks = ic.text.split("\n")
      .filter(l => l.startsWith("data:"))
      .map(l => { try { return JSON.parse(l.slice(5)).json || ""; } catch { return ""; } })
      .join("");
    log("PASS", "AI improveContent (stream)", `${textChunks.length} chars content: ${textChunks.slice(0, 80)}`, ic.latency);
  } else if (ic.status === 403 || (ic.json?.code === "FORBIDDEN")) {
    log("BUG", "AI improveContent — quota exhausted", `403 Daily token limit exceeded`, ic.latency);
  } else {
    log("FAIL", "AI improveContent", `${ic.status} length=${ic.text.length}`, ic.latency);
  }

  // ── MOCK INTERVIEW ────────────────────────────────────
  console.log("\n=== PHASE 2: MOCK INTERVIEW ===");

  // List programs
  const pl = await rpc("imtaPrograms/list", {});
  if (pl.status === 200 && Array.isArray(pl.json)) {
    const ind = pl.json.filter(p => p.field === "industrial");
    log("PASS", "IMTA programs", `${pl.json.length} total, ${ind.length} industrial`, pl.latency);
  } else {
    log("FAIL", "IMTA programs", `${pl.status}`, pl.latency);
  }

  // Get existing sessions
  const sl = await rpc("interview/getSessions", { limit: 20, offset: 0 });
  const existingSessions = Array.isArray(sl.json) ? sl.json : [];
  log(sl.status === 200 ? "PASS" : "FAIL", "List mock sessions", `${existingSessions.length} existing`, sl.latency);

  // Generate questions FIRST (required before createSession)
  const gq = await rpc("interview/generateQuestions", {
    field: "industrial",
    types: ["behavioral", "technical", "situational"],
    difficulty: "intermediate",
    numberOfQuestions: 3,
    language: "fr",
    jobTitle: "Cariste CACES R489",
  });

  let questions = [];
  if (gq.status === 200 && Array.isArray(gq.json) && gq.json.length > 0) {
    questions = gq.json;
    log("PASS", "generateQuestions (industrial/intermediate)", `${questions.length} questions`, gq.latency);
    console.log(`  Q1: ${questions[0].question?.slice(0, 100)}`);
    console.log(`  Q1 type: ${questions[0].type}, difficulty: ${questions[0].difficulty}`);
  } else if (gq.status === 403) {
    log("BUG", "generateQuestions — quota exhausted", `403 ${sessionUser} daily token limit exhausted — MOCK INTERVIEW BROKEN`, gq.latency);
    bugs.push({ step: "generateQuestions", detail: `403 Daily token limit for ${sessionUser} — mock interview fully blocked by quota` });
  } else if (gq.status === 500) {
    log("BUG", "generateQuestions — 500", `Internal server error`, gq.latency);
    bugs.push({ step: "generateQuestions", detail: `500 on industrial/intermediate — AI server error` });
  } else {
    log("FAIL", "generateQuestions", `${gq.status} ${gq.json?.message || gq.text?.slice(0, 150)}`, gq.latency);
  }

  // Beginner test too
  const gqB = await rpc("interview/generateQuestions", {
    field: "industrial",
    types: ["behavioral"],
    difficulty: "beginner",
    numberOfQuestions: 3,
    language: "fr",
    jobTitle: "Cariste Débutant",
  });
  if (gqB.status === 200 && Array.isArray(gqB.json)) {
    log(gqB.json.length > 0 ? "PASS" : "BUG", "generateQuestions (industrial/beginner)", `${gqB.json.length} questions`, gqB.latency);
    if (gqB.json.length === 0) bugs.push({ step: "generateQuestions/beginner", detail: "0 questions at beginner difficulty" });
  } else {
    log("FAIL", "generateQuestions (industrial/beginner)", `${gqB.status} ${gqB.json?.message || gqB.text?.slice(0, 100)}`, gqB.latency);
  }

  // Create session with questions
  let sessionId = null;
  if (questions.length > 0) {
    const sc = await rpc("interview/createSession", {
      title: `Entretien Cariste OCP — ${new Date().toLocaleDateString("fr-FR")}`,
      description: "Simulation entretien poste cariste CACES R489 OCP Group",
      field: "industrial",
      types: ["behavioral", "technical", "situational"],
      difficulty: "intermediate",
      language: "fr",
      resumeId: created.resumeId || undefined,
      jobPosition: "Cariste CACES R489 Catégorie 3",
      companyName: "OCP Group — Jorf Lasfar",
      questions: questions,
    });
    if (sc.status === 200 && sc.json?.id) {
      sessionId = sc.json.id;
      created.mockSessionId = sessionId;
      log("PASS", "Create mock session", `id=${sessionId} questions=${sc.json.totalQuestions} field=${sc.json.field}`, sc.latency);
    } else {
      log("FAIL", "Create mock session", `${sc.status} ${sc.json?.message || sc.text?.slice(0, 150)}`, sc.latency);
      if (sc.status === 500) bugs.push({ step: "createSession", detail: `500 error` });
    }
  } else {
    log("BUG", "Create mock session", "Skipped — no questions (AI quota exhausted)");
    bugs.push({ step: "Mock interview flow", detail: "Cannot test mock interview — AI quota prevents question generation" });
  }

  // Start session
  if (sessionId) {
    const ss = await rpc("interview/startSession", { sessionId });
    log(ss.status === 200 ? "PASS" : "FAIL", "Start session", `status=${ss.json?.status || ss.status}`, ss.latency);
  }

  // Get session details
  if (sessionId) {
    const sg = await rpc("interview/getSession", { sessionId });
    if (sg.status === 200) {
      const q = sg.json.questions || [];
      log(q.length > 0 ? "PASS" : "BUG", "Get session (NON-ZERO questions)", `${q.length} questions in session status=${sg.json.status}`, sg.latency);
      if (q.length === 0) bugs.push({ step: "getSession questions", detail: "0 questions in session despite passing them at creation" });
    } else {
      log("FAIL", "Get session", `${sg.status} ${sg.json?.message || ""}`, sg.latency);
    }
  }

  // Submit a response
  if (sessionId && questions.length > 0) {
    const q0 = questions[0];
    const sr2 = await rpc("interview/submitResponse", {
      sessionId,
      questionId: q0.id,
      response: "Je suis cariste certifié CACES R489 catégorie 3 depuis 2021. Je travaille chez OCP Group à Jorf Lasfar. Je conduis des chariots élévateurs frontaux de 5 tonnes. Mon expérience inclut la gestion des zones de stockage et le strict respect des procédures HSE. En 3 ans, zéro incident.",
      responseTime: 75,
    });
    if (sr2.status === 200) {
      log("PASS", "Submit response", `completedQuestions=${sr2.json?.completedQuestions}/${sr2.json?.totalQuestions}`, sr2.latency);
    } else {
      log("FAIL", "Submit response", `${sr2.status} ${sr2.json?.message || sr2.text?.slice(0, 150)}`, sr2.latency);
      if (sr2.status === 500) bugs.push({ step: "submitResponse", detail: `500 error` });
    }
  }

  // Analyze session for score
  if (sessionId) {
    const sa = await rpc("interview/analyzeSession", { sessionId, language: "fr" });
    if (sa.status === 200) {
      const score = sa.json?.overallScore ?? sa.json?.analysis?.overallScore;
      log("PASS", "Analyze session (score)", `score=${score}`, sa.latency);
    } else {
      const msg = sa.json?.message || sa.text?.slice(0, 150);
      log(sa.status === 403 ? "BUG" : "FAIL", "Analyze session", `${sa.status} ${msg}`, sa.latency);
      if (sa.status === 403) bugs.push({ step: "analyzeSession", detail: "403 quota — cannot get score/feedback" });
    }
  }

  // ── INTERVIEW PREP ─────────────────────────────────────
  console.log("\n=== PHASE 3: INTERVIEW PREP ===");

  const tips = await rpc("interview/getTips", { language: "fr" });
  log(tips.status === 200 && tips.json?.length > 0 ? "PASS" : "FAIL", "Interview tips (fr)",
    tips.status === 200 ? `${tips.json.length} tips` : `${tips.status}`, tips.latency);

  const cq = await rpc("interviewQuestions/list", { field: "industrial" });
  log(cq.status === 200 ? "PASS" : "FAIL", "Common questions (industrial)",
    cq.status === 200 ? `${Array.isArray(cq.json) ? cq.json.length : "?"} questions` : `${cq.status}`, cq.latency);

  // Chat with interviewer (stream)
  const chat = await req("POST", "/api/rpc/interview/chatWithInterviewer", {
    json: {
      messages: [{ role: "user", content: "Bonjour, je suis Youssef, cariste CACES R489 diplômé IMTA, prêt pour l'entretien OCP Group." }],
      mode: "quick_practice",
      field: "industrial",
      language: "fr",
      isFirstMessage: true,
      requestSummary: false,
      jobTitle: "Cariste CACES R489",
    },
  });
  if (chat.status === 200 && chat.text.length > 100) {
    const chunks = chat.text.split("\n").filter(l => l.startsWith("data:"))
      .map(l => { try { return JSON.parse(l.slice(5)).json || ""; } catch { return ""; } }).join("");
    log("PASS", "Chat with interviewer (stream)", `${chunks.length} chars: "${chunks.slice(0, 80)}..."`, chat.latency);
  } else {
    log("FAIL", "Chat with interviewer", `${chat.status} length=${chat.text.length}`, chat.latency);
    if (chat.status === 403) bugs.push({ step: "chatWithInterviewer", detail: "403 quota exceeded" });
  }

  // Readiness score
  const rs = await rpc("interview/getReadinessScore", {});
  if (rs.status === 200) {
    log("PASS", "Readiness score", `score=${rs.json?.score} level=${rs.json?.readinessLevel}`, rs.latency);
  } else {
    log("FAIL", "Readiness score", `${rs.status} ${rs.json?.message || rs.text?.slice(0, 100)}`, rs.latency);
  }

  // ── JOBS ──────────────────────────────────────────────
  console.log("\n=== PHASE 4: JOBS ===");

  // List applications
  const jl = await rpc("jobApplications/list", {});
  const existingApps = Array.isArray(jl.json) ? jl.json : [];
  log(jl.status === 200 ? "PASS" : "FAIL", "List job applications",
    jl.status === 200 ? `${existingApps.length} existing` : `${jl.status}`, jl.latency);

  // Partner jobs
  const pj = await rpc("partner/jobs/list", {});
  if (pj.status === 200) {
    const items = Array.isArray(pj.json) ? pj.json : pj.json?.items || [];
    log(items.length > 0 ? "PASS" : "BUG", "Partner jobs listing", `${items.length} jobs`, pj.latency);
    if (items.length === 0) bugs.push({ step: "Partner jobs", detail: "0 partner jobs returned — expected OCP Group seed data" });
    created.partnerJobId = items[0]?.id;
  } else if (pj.status === 404) {
    log("BUG", "Partner jobs — 404", "partner/jobs/list → 404 NOT_FOUND — endpoint not registered", pj.latency);
    bugs.push({ step: "Partner jobs", detail: `partner/jobs/list → 404 — endpoint missing from router index` });
  } else {
    log("FAIL", "Partner jobs", `${pj.status} ${pj.json?.message || pj.text?.slice(0, 100)}`, pj.latency);
  }

  // Create job application (correct field names confirmed)
  const jac = await rpc("jobApplications/create", {
    companyName: "OCP Group — Jorf Lasfar",
    position: "Cariste CACES R489 Catégorie 3",
    location: "El Jadida, Maroc",
    status: "applied",
    appliedAt: new Date().toISOString(),
    notes: "Poste cariste industriel — CACES R489 cat.3 obligatoire. Logistique phosphate.",
    resumeId: created.resumeId || undefined,
    jobDescription: "Cariste entrepôt OCP Group. Chariot élévateur frontal, gestion zones stockage, HSE niveau 1.",
    source: "carrières OCP",
    tags: ["industrie", "logistique", "caces"],
    priority: 4,
  });
  if (jac.status === 200) {
    created.jobApplicationId = typeof jac.json === "string" ? jac.json : jac.json?.id;
    log("PASS", "Create job application (OCP Group)", `id=${created.jobApplicationId}`, jac.latency);
  } else {
    log("FAIL", "Create job application", `${jac.status} ${jac.json?.message || jac.text?.slice(0, 200)}`, jac.latency);
    if (jac.status === 500) bugs.push({ step: "jobApplications/create", detail: `500 error` });
  }

  // ── PERSISTENCE CHECKS ────────────────────────────────
  console.log("\n=== PHASE 5: PERSISTENCE ===");

  if (created.resumeId) {
    const rg = await rpc("resume/getById", { id: created.resumeId });
    log(rg.status === 200 ? "PASS" : "FAIL", "Resume persisted (getById)",
      rg.status === 200 ? `name="${rg.json.name}" tags=${JSON.stringify(rg.json.tags)}` : `${rg.status}`, rg.latency);
    if (rg.status !== 200) bugs.push({ step: "Resume persistence", detail: `resume/getById returned ${rg.status} after creation` });
  }

  if (created.mockSessionId) {
    const sl2 = await rpc("interview/getSessions", { limit: 20, offset: 0 });
    const found = Array.isArray(sl2.json) ? sl2.json.find(s => s.id === created.mockSessionId) : null;
    log(found ? "PASS" : "FAIL", "Mock session persisted",
      found ? `id=${found.id} status=${found.status} completed=${found.completedQuestions}/${found.totalQuestions}` : `NOT FOUND (total=${sl2.json?.length || 0})`,
      sl2.latency);
    if (!found) bugs.push({ step: "Mock session persistence", detail: "Session not in getSessions list after creation" });
  }

  if (created.jobApplicationId) {
    const jl2 = await rpc("jobApplications/list", {});
    const items = Array.isArray(jl2.json) ? jl2.json : [];
    const found = items.find(j => j.id === created.jobApplicationId);
    log(found ? "PASS" : "FAIL", "Job application persisted",
      found ? `company=${found.companyName} status=${found.status}` : `NOT FOUND (total=${items.length})`,
      jl2.latency);
    if (!found) bugs.push({ step: "Job application persistence", detail: "Application not in list after creation" });
  }

  // Dashboard final state
  const ds = await rpc("dashboard/getStatistics");
  if (ds.status === 200) {
    log("PASS", "Dashboard stats (final)", JSON.stringify(ds.json).slice(0, 200), ds.latency);
  }

  // ── SUMMARY ────────────────────────────────────────────
  const totalTime = Date.now() - t0;
  const passed = results.filter(r => r.status === "PASS").length;
  const failed = results.filter(r => r.status === "FAIL").length;
  const bugsFound = results.filter(r => r.status === "BUG").length;
  const mockWorking = created.mockSessionId !== undefined && questions.length > 0;

  let rating = Math.round((passed / (passed + failed + bugsFound)) * 10);
  if (mockWorking) rating = Math.min(10, rating + 1);
  if (bugs.length > 5) rating = Math.max(0, rating - 2);

  console.log("\n═══════════════════════════════════════════════════════");
  console.log(`RESULTS: ${passed} PASS, ${failed} FAIL, ${bugsFound} BUG`);
  console.log(`UNIQUE BUGS: ${bugs.length}`);
  console.log(`MOCK INTERVIEW WORKING: ${mockWorking}`);
  console.log(`TOTAL TIME: ${(totalTime / 1000).toFixed(1)}s`);
  console.log(`RATING: ${rating}/10`);
  console.log("\nBUGS FOUND:");
  bugs.forEach((b, i) => console.log(`  ${i + 1}. [${b.step}] ${b.detail}`));
  console.log("\nCREATED:");
  Object.entries(created).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  console.log("\n___FINAL_JSON___");
  console.log(JSON.stringify({
    results,
    bugs,
    created,
    mockWorking,
    rating,
    sessionUser,
    stats: { passed, failed, bugsFound, totalBugs: bugs.length, totalTime },
  }));
}

main().catch(console.error);
