/**
 * AI Endpoint Audit Script - Cycle 25
 * Uses correct CSRF header: x-csrf-token: orpc
 * Run: node scripts/audit-ai-endpoints.mjs
 */

const BASE_URL = process.env.APP_URL || "http://localhost:3040";
const CREDENTIALS = { email: "admin@test.com", password: "TestAccount123!" };
let sessionCookie = "";
let passed = 0, failed = 0, skipped = 0;
const results = [];

function log(status, name, detail = "") {
  const icon = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "⊘";
  console.log(`${icon} ${name}${detail ? " — " + detail : ""}`);
  results.push({ status, name, detail });
  if (status === "PASS") passed++;
  else if (status === "FAIL") failed++;
  else skipped++;
}

async function rpc(path, input = undefined) {
  const url = `${BASE_URL}/api/rpc/${path}`;
  const envelope = input !== undefined ? { json: input } : { json: undefined };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": BASE_URL,
      "Cookie": sessionCookie,
      "x-csrf-token": "orpc",
    },
    body: JSON.stringify(envelope),
  });
  const text = await res.text();
  let json = null;
  try {
    const parsed = JSON.parse(text);
    json = parsed?.json !== undefined ? parsed.json : parsed;
  } catch {}
  return { status: res.status, json, text, ok: res.ok };
}

async function rpcStream(path, input) {
  const url = `${BASE_URL}/api/rpc/${path}`;
  const envelope = { json: input };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": BASE_URL,
      "Cookie": sessionCookie,
      "x-csrf-token": "orpc",
    },
    body: JSON.stringify(envelope),
  });
  const text = await res.text();
  return { status: res.status, text, ok: res.ok };
}

async function rpcGet(path, input = undefined) {
  const data = input !== undefined ? { json: input } : { json: undefined };
  const url = `${BASE_URL}/api/rpc/${path}?data=${encodeURIComponent(JSON.stringify(data))}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Origin": BASE_URL,
      "Cookie": sessionCookie,
      "x-csrf-token": "orpc",
    },
  });
  const text = await res.text();
  let json = null;
  try {
    const parsed = JSON.parse(text);
    json = parsed?.json !== undefined ? parsed.json : parsed;
  } catch {}
  return { status: res.status, json, text, ok: res.ok };
}

async function testAuth() {
  console.log("\n=== AUTH ===");
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": BASE_URL },
      body: JSON.stringify(CREDENTIALS),
      redirect: "manual",
    });
    const cookies = res.headers.getSetCookie?.() || [];
    sessionCookie = cookies.map(c => c.split(";")[0]).join("; ");
    if (res.ok || res.status === 302) log("PASS", "Login", `status=${res.status}, cookies=${cookies.length}`);
    else log("FAIL", "Login", `status=${res.status}`);
  } catch (e) { log("FAIL", "Login", e.message); }

  try {
    const res = await fetch(`${BASE_URL}/api/auth/get-session`, {
      headers: { Cookie: sessionCookie, Origin: BASE_URL }
    });
    const body = await res.json();
    if (res.ok && body?.user?.email) log("PASS", "Session check", `user=${body.user.email} role=${body.user.role}`);
    else log("FAIL", "Session check", "no user");
  } catch (e) { log("FAIL", "Session check", e.message); }
}

async function testDashboard() {
  console.log("\n=== DASHBOARD ===");
  for (const [path, label] of [
    ["dashboard/getStatistics", "Dashboard stats"],
    ["resume/list", "List resumes"],
    ["flags/get", "Feature flags"],
    ["goals/list", "List goals"],
  ]) {
    try {
      const r = await rpc(path);
      if (r.ok) log("PASS", label, JSON.stringify(r.json).slice(0, 80));
      else log("FAIL", label, `status=${r.status} ${r.json?.message || r.text?.slice(0, 100)}`);
    } catch (e) { log("FAIL", label, e.message); }
  }
}

async function testAiConfig() {
  console.log("\n=== AI CONFIG ===");
  try {
    const r = await rpc("aiConfig/status/check");
    if (r.ok) log("PASS", "AI Config Status", JSON.stringify(r.json).slice(0, 120));
    else log("FAIL", "AI Config Status", `status=${r.status} ${r.text.slice(0, 100)}`);
  } catch (e) { log("FAIL", "AI Config Status", e.message); }

  try {
    const r = await rpc("aiConfig/providers/list");
    if (r.ok) {
      const providers = Array.isArray(r.json) ? r.json : [];
      log("PASS", "AI Providers list", `${providers.length} providers, active: ${providers.filter(p => p.isEnabled).map(p => p.provider).join(", ") || "none"}`);
    } else {
      log("FAIL", "AI Providers list", `status=${r.status} ${r.text.slice(0, 100)}`);
    }
  } catch (e) { log("FAIL", "AI Providers list", e.message); }
}

async function testAiGeneration() {
  console.log("\n=== AI GENERATION (resume builder AI) ===");

  try {
    const r = await rpc("ai/testConnection");
    if (r.ok) log("PASS", "ai/testConnection", JSON.stringify(r.json).slice(0, 100));
    else log("FAIL", "ai/testConnection", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "ai/testConnection", e.message); }

  try {
    const r = await rpcStream("ai/improveContent", {
      content: "i worked at a company doing stuff with computers and helping people",
      language: "en",
    });
    if (r.ok) log("PASS", "ai/improveContent (stream)", `length=${r.text.length} preview: ${r.text.slice(0, 80)}`);
    else log("FAIL", "ai/improveContent", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "ai/improveContent", e.message); }

  try {
    const r = await rpcStream("ai/fixGrammar", {
      content: "i has good experience working with teams and managing projects",
      language: "en",
    });
    if (r.ok) log("PASS", "ai/fixGrammar (stream)", `length=${r.text.length} preview: ${r.text.slice(0, 80)}`);
    else log("FAIL", "ai/fixGrammar", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "ai/fixGrammar", e.message); }

  try {
    const r = await rpcStream("ai/generateSummary", {
      resumeData: {
        name: "Fatima Zahra",
        headline: "Infirmiere Polyvalente",
        experience: [{ company: "CHU Casablanca", position: "Infirmiere", description: "Soins aux patients" }],
        skills: [{ name: "Soins infirmiers" }, { name: "Urgences" }],
      },
      language: "fr",
    });
    if (r.ok) log("PASS", "ai/generateSummary (stream)", `length=${r.text.length} preview: ${r.text.slice(0, 80)}`);
    else log("FAIL", "ai/generateSummary", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "ai/generateSummary", e.message); }

  try {
    const r = await rpcStream("ai/generateHeadline", {
      resumeData: {
        name: "Ahmed Bennani",
        currentHeadline: "Infirmier",
        experience: [{ company: "Clinique Al Amal", position: "Infirmier Polyvalent" }],
        skills: ["Soins", "Urgences", "Patient care"],
      },
      language: "fr",
    });
    if (r.ok) log("PASS", "ai/generateHeadline (stream)", `length=${r.text.length} preview: ${r.text.slice(0, 80)}`);
    else log("FAIL", "ai/generateHeadline", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "ai/generateHeadline", e.message); }

  try {
    const r = await rpc("ai/suggestSkills", {
      resumeData: {
        experience: [{ company: "CHU", position: "Infirmier", description: "Soins aux patients en chirurgie" }],
        education: [{ degree: "Licence", area: "Soins Infirmiers", institution: "IMTA" }],
        existingSkills: ["Soins de base"],
      },
      language: "fr",
    });
    if (r.ok) log("PASS", "ai/suggestSkills", `${Array.isArray(r.json) ? r.json.length : 0} skills: ${JSON.stringify(r.json).slice(0, 100)}`);
    else log("FAIL", "ai/suggestSkills", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "ai/suggestSkills", e.message); }

  try {
    const r = await rpc("ai/resumeGapAnalysis", {
      resumeData: { basics: { name: "Test User" }, sections: {}, summary: {} },
      targetRole: "Infirmier Polyvalent",
      field: "healthcare",
    });
    if (r.ok) log("PASS", "ai/resumeGapAnalysis", `score=${r.json?.overallScore} gaps=${r.json?.gaps?.length}`);
    else log("FAIL", "ai/resumeGapAnalysis", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "ai/resumeGapAnalysis", e.message); }

  try {
    const r = await rpc("ai/adaptResumeToJob", {
      resumeData: { basics: { name: "Test" }, sections: {}, summary: {} },
      jobDescription: "Recherche un(e) infirmier(e) polyvalent(e) pour rejoindre notre equipe. Competences requises: soins aux patients, travail en equipe, urgences.",
      language: "fr",
    });
    if (r.ok) log("PASS", "ai/adaptResumeToJob", `matchScore=${r.json?.matchScore} keywords=${r.json?.keywordsMatched?.length}`);
    else log("FAIL", "ai/adaptResumeToJob", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "ai/adaptResumeToJob", e.message); }

  try {
    const r = await rpc("ai/resumeWizardChat", {
      message: "Aidez-moi a creer un CV pour un poste infirmier",
      step: "basics",
    });
    if (r.ok) log("PASS", "ai/resumeWizardChat", `response length=${JSON.stringify(r.json).length}`);
    else log("FAIL", "ai/resumeWizardChat", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "ai/resumeWizardChat", e.message); }

  try {
    const r = await rpc("ai/generateResume", {
      fullName: "Fatima Zahra Alami",
      targetJob: "Infirmiere Polyvalente",
      skills: ["Soins infirmiers", "Urgences", "Travail en equipe"],
      language: "fr",
    });
    if (r.ok) log("PASS", "ai/generateResume", `resumeData keys: ${Object.keys(r.json?.resumeData || {}).join(", ")}`);
    else log("FAIL", "ai/generateResume", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "ai/generateResume", e.message); }
}

async function testInterviewAi() {
  console.log("\n=== INTERVIEW AI ===");

  try {
    const r = await rpc("interview/generateQuestions", {
      field: "healthcare",
      types: ["behavioral"],
      difficulty: "beginner",
      numberOfQuestions: 2,
      language: "fr",
    });
    if (r.ok && Array.isArray(r.json)) log("PASS", "interview/generateQuestions", `${r.json.length} questions generated`);
    else log("FAIL", "interview/generateQuestions", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "interview/generateQuestions", e.message); }

  try {
    const r = await rpc("interview/getSessions", { limit: 5, offset: 0 });
    if (r.ok) log("PASS", "interview/getSessions", `${Array.isArray(r.json) ? r.json.length : 0} sessions`);
    else log("FAIL", "interview/getSessions", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "interview/getSessions", e.message); }

  try {
    const r = await rpc("interview/getTips", { language: "fr" });
    if (r.ok && Array.isArray(r.json)) log("PASS", "interview/getTips", `${r.json.length} tips`);
    else log("FAIL", "interview/getTips", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "interview/getTips", e.message); }

  try {
    const r = await rpcStream("interview/chatWithInterviewer", {
      messages: [{ role: "user", content: "Bonjour, je suis pret pour la simulation d'entretien" }],
      mode: "quick_practice",
      field: "healthcare",
      language: "fr",
      isFirstMessage: true,
      requestSummary: false,
    });
    if (r.ok && r.text.length > 50) log("PASS", "interview/chatWithInterviewer (stream)", `length=${r.text.length}`);
    else log("FAIL", "interview/chatWithInterviewer", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "interview/chatWithInterviewer", e.message); }

  try {
    const r = await rpc("interview/coachAnswer", {
      question: "Parlez-moi de vous",
      answer: "Je suis infirmier avec 2 ans d'experience",
      field: "healthcare",
    });
    if (r.ok) log("PASS", "interview/coachAnswer", JSON.stringify(r.json).slice(0, 100));
    else log("FAIL", "interview/coachAnswer", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "interview/coachAnswer", e.message); }

  try {
    const r = await rpc("interview/improveAnswer", {
      question: "Parlez-moi de vous",
      answer: "Je suis infirmier",
      field: "healthcare",
    });
    if (r.ok) log("PASS", "interview/improveAnswer", JSON.stringify(r.json).slice(0, 100));
    else log("FAIL", "interview/improveAnswer", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "interview/improveAnswer", e.message); }

  try {
    const r = await rpc("interview/getReadinessScore", {
      sessions: [],
      targetRole: "Infirmier",
      field: "healthcare",
    });
    if (r.ok) log("PASS", "interview/getReadinessScore", JSON.stringify(r.json).slice(0, 100));
    else log("FAIL", "interview/getReadinessScore", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "interview/getReadinessScore", e.message); }
}

async function testAiMentor() {
  console.log("\n=== AI MENTOR ===");

  try {
    const r = await rpc("aiMentor/templates/list");
    if (r.ok) log("PASS", "aiMentor/templates/list", `${Array.isArray(r.json) ? r.json.length : 0} templates`);
    else log("FAIL", "aiMentor/templates/list", `status=${r.status} ${r.text.slice(0, 100)}`);
  } catch (e) { log("FAIL", "aiMentor/templates/list", e.message); }

  try {
    const r = await rpc("aiMentor/user/list");
    if (r.ok) log("PASS", "aiMentor/user/list", `${Array.isArray(r.json) ? r.json.length : 0} mentors`);
    else log("FAIL", "aiMentor/user/list", `status=${r.status} ${r.text.slice(0, 100)}`);
  } catch (e) { log("FAIL", "aiMentor/user/list", e.message); }

  try {
    const r = await rpc("aiMentor/onboarding/get");
    if (r.ok) log("PASS", "aiMentor/onboarding/get", JSON.stringify(r.json).slice(0, 100));
    else log("FAIL", "aiMentor/onboarding/get", `status=${r.status} ${r.text.slice(0, 100)}`);
  } catch (e) { log("FAIL", "aiMentor/onboarding/get", e.message); }

  try {
    const r = await rpc("aiMentor/conversations/list");
    if (r.ok) log("PASS", "aiMentor/conversations/list", `${Array.isArray(r.json) ? r.json.length : 0} conversations`);
    else log("FAIL", "aiMentor/conversations/list", `status=${r.status} ${r.text.slice(0, 100)}`);
  } catch (e) { log("FAIL", "aiMentor/conversations/list", e.message); }
}

async function testCareerAI() {
  console.log("\n=== CAREER AI ===");

  try {
    const r = await rpc("career/analyzeSkillGap", {
      targetRole: "Infirmiere",
      currentSkills: ["soins de base"],
    });
    if (r.ok) log("PASS", "career/analyzeSkillGap", JSON.stringify(r.json).slice(0, 100));
    else log("FAIL", "career/analyzeSkillGap", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "career/analyzeSkillGap", e.message); }

  try {
    const r = await rpc("career/recommendCareerPaths", {
      interests: ["healthcare", "patient care"],
      skills: ["soins infirmiers"],
      program: "infirmier_polyvalent",
    });
    if (r.ok) log("PASS", "career/recommendCareerPaths", JSON.stringify(r.json).slice(0, 100));
    else log("FAIL", "career/recommendCareerPaths", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "career/recommendCareerPaths", e.message); }

  try {
    const r = await rpcStream("career/careerCoach", {
      messages: [{ role: "user", content: "Quelles sont les opportunites de carriere pour une infirmiere au Maroc?" }],
    });
    if (r.ok) log("PASS", "career/careerCoach (stream)", `length=${r.text.length}`);
    else log("FAIL", "career/careerCoach", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "career/careerCoach", e.message); }
}

async function testCareerMatcher() {
  console.log("\n=== CAREER MATCHER AI ===");

  try {
    const r = await rpc("careerMatcher/predict", {
      skills: ["soins infirmiers", "urgences", "travail en equipe"],
      program: "infirmier_polyvalent",
      interests: ["healthcare"],
    });
    if (r.ok) log("PASS", "careerMatcher/predict", JSON.stringify(r.json).slice(0, 100));
    else log("FAIL", "careerMatcher/predict", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "careerMatcher/predict", e.message); }
}

async function testLearningPath() {
  console.log("\n=== LEARNING PATH AI ===");

  try {
    const r = await rpc("learningPath/list");
    if (r.ok) log("PASS", "learningPath/list", `${Array.isArray(r.json) ? r.json.length : 0} paths`);
    else log("FAIL", "learningPath/list", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "learningPath/list", e.message); }

  try {
    const r = await rpc("learningPath/generate", {
      targetRole: "Infirmier Specialise",
      currentSkills: ["soins de base"],
      program: "infirmier_polyvalent",
    });
    if (r.ok) log("PASS", "learningPath/generate", JSON.stringify(r.json).slice(0, 100));
    else log("FAIL", "learningPath/generate", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "learningPath/generate", e.message); }
}

async function testVoiceInterview() {
  console.log("\n=== VOICE INTERVIEW ===");

  try {
    const r = await rpc("voiceInterview/list");
    if (r.ok) log("PASS", "voiceInterview/list", `${Array.isArray(r.json) ? r.json.length : 0} sessions`);
    else log("FAIL", "voiceInterview/list", `status=${r.status} ${r.text.slice(0, 200)}`);
  } catch (e) { log("FAIL", "voiceInterview/list", e.message); }
}

async function testReferenceData() {
  console.log("\n=== REFERENCE DATA ===");
  for (const [path, label] of [
    ["imtaPrograms/list", "IMTA Programs"],
    ["interviewTips/list", "Interview Tips"],
    ["interviewQuestions/list", "Interview Questions"],
    ["marketInsights/list", "Market Insights"],
    ["employers/list", "Employers"],
    ["skillLibrary/list", "Skill Library"],
  ]) {
    try {
      const r = await rpc(path, {});
      if (r.ok) log("PASS", label, `${Array.isArray(r.json) ? r.json.length : "?"} items`);
      else log("FAIL", label, `status=${r.status} ${r.json?.message || r.text?.slice(0, 100)}`);
    } catch (e) { log("FAIL", label, e.message); }
  }
}

async function testAdmin() {
  console.log("\n=== ADMIN ===");

  try {
    const r = await rpcGet("admin/users/list", { page: 1, limit: 5 });
    if (r.ok) log("PASS", "admin/users/list", JSON.stringify(r.json).slice(0, 80));
    else log("FAIL", "admin/users/list", `status=${r.status} ${r.text.slice(0, 100)}`);
  } catch (e) { log("FAIL", "admin/users/list", e.message); }

  for (const [path, label] of [
    ["admin/analytics/getOverview", "Admin analytics overview"],
    ["admin/system/getHealth", "System health"],
    ["aiConfig/usage/getGlobalStats", "AI global stats"],
  ]) {
    try {
      const r = await rpc(path);
      if (r.ok) log("PASS", label, JSON.stringify(r.json).slice(0, 80));
      else log("FAIL", label, `status=${r.status} ${r.json?.message || r.text?.slice(0, 100)}`);
    } catch (e) { log("FAIL", label, e.message); }
  }
}

async function main() {
  console.log("=== IMTA Resume AI Endpoint Audit — Cycle 25 ===");
  console.log(`Server: ${BASE_URL}\n`);

  await testAuth();
  await testDashboard();
  await testAiConfig();
  await testAiGeneration();
  await testInterviewAi();
  await testAiMentor();
  await testCareerAI();
  await testCareerMatcher();
  await testLearningPath();
  await testVoiceInterview();
  await testReferenceData();
  await testAdmin();

  console.log("\n=== SUMMARY ===");
  console.log(`PASSED: ${passed}  FAILED: ${failed}  SKIPPED: ${skipped}`);
  console.log(`Total: ${passed + failed + skipped}`);

  if (failed > 0) {
    console.log("\nFailed endpoints:");
    results.filter(r => r.status === "FAIL").forEach(r => console.log(`  ✗ ${r.name}: ${r.detail}`));
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
