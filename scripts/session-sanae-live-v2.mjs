/**
 * Sanae Live Session v2 — Corrected input shapes
 * Midwife (sage-femme) full working session against production
 * Target: https://imta-resume-app-production.up.railway.app
 */

import https from "https";
import { URL } from "url";

const BASE = "https://imta-resume-app-production.up.railway.app";
const REPORT_TIME = new Date().toISOString();

let sessionCookie = "";
let actualEmail = "";
let createdResumeId = null;
const results = [];
let pass = 0, fail = 0, warn = 0;

// ─── HTTP helper ───────────────────────────────────────────────────────────

function httpRequest(method, urlStr, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const u = new URL(urlStr);
    const opts = {
      hostname: u.hostname,
      port: u.port || (u.protocol === "https:" ? 443 : 80),
      path: u.pathname + u.search,
      method,
      headers: { ...headers },
      timeout: 45000,
    };
    if (body) {
      const buf = typeof body === "string" ? body : JSON.stringify(body);
      opts.headers["Content-Length"] = Buffer.byteLength(buf);
      if (!opts.headers["Content-Type"])
        opts.headers["Content-Type"] = "application/json";
    }
    const req = https.request(opts, (res) => {
      const sc = res.headers["set-cookie"] || [];
      if (sc.length) sessionCookie = sc.map(c => c.split(";")[0]).join("; ");
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString();
        const ms = Date.now() - t0;
        resolve({ status: res.statusCode, headers: res.headers, text, ms });
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout after 45s")); });
    if (body) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });
}

function parseOrpc(text) {
  try {
    const p = JSON.parse(text);
    return p?.json !== undefined ? p.json : p;
  } catch { return null; }
}

async function rpc(path, input = undefined) {
  const url = `${BASE}/api/rpc/${path}`;
  const envelope = input !== undefined ? { json: input } : { json: undefined };
  const headers = {
    "Content-Type": "application/json",
    Origin: BASE,
    Cookie: sessionCookie,
    "x-csrf-token": "orpc",
  };
  const res = await httpRequest("POST", url, headers, JSON.stringify(envelope));
  const json = parseOrpc(res.text);
  return { status: res.status, json, text: res.text, ok: res.status >= 200 && res.status < 300, ms: res.ms };
}

async function rpcGet(path, input = undefined) {
  const data = input !== undefined ? { json: input } : { json: undefined };
  const url = `${BASE}/api/rpc/${path}?data=${encodeURIComponent(JSON.stringify(data))}`;
  const headers = { Origin: BASE, Cookie: sessionCookie, "x-csrf-token": "orpc" };
  const res = await httpRequest("GET", url, headers);
  const json = parseOrpc(res.text);
  return { status: res.status, json, text: res.text, ok: res.status >= 200 && res.status < 300, ms: res.ms };
}

function log(status, section, name, detail = "", ms = null) {
  const icon = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "⚠";
  const msStr = ms !== null ? ` [${ms}ms]` : "";
  console.log(`${icon} [${section}] ${name}${msStr}${detail ? " — " + detail : ""}`);
  results.push({ status, section, name, detail, ms });
  if (status === "PASS") pass++;
  else if (status === "FAIL") fail++;
  else warn++;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

async function doAuth() {
  console.log("\n══ PHASE 1: AUTHENTICATION ══");

  // Try accounts in order of preference
  const accounts = [
    { email: "student2@test.com", password: "TestAccount123!" },
    { email: "partner@test.com", password: "TestAccount123!" },
    { email: "student1@test.com", password: "TestAccount123!" },
  ];

  for (const cred of accounts) {
    try {
      const res = await httpRequest("POST", `${BASE}/api/auth/sign-in/email`, {
        "Content-Type": "application/json",
        Origin: BASE,
      }, cred);
      if (res.status === 200) {
        actualEmail = cred.email;
        log("PASS", "AUTH", `Login as ${cred.email}`, `status=${res.status} cookies=${(res.headers["set-cookie"] || []).length}`, res.ms);
        break;
      } else if (res.status === 429) {
        log("WARN", "AUTH", `${cred.email} rate-limited`, "trying next account");
        continue;
      } else {
        log("WARN", "AUTH", `${cred.email} failed`, `status=${res.status}`);
      }
    } catch (e) {
      log("WARN", "AUTH", `${cred.email} error`, e.message);
    }
  }

  // Verify session
  try {
    const res = await httpRequest("GET", `${BASE}/api/auth/get-session`, {
      Cookie: sessionCookie, Origin: BASE,
    });
    const body = JSON.parse(res.text);
    if (body?.user?.email) {
      log("PASS", "AUTH", "Session verified", `user=${body.user.email} role=${body.user.role}`, res.ms);
      return body.user;
    } else {
      log("FAIL", "AUTH", "No session", `status=${res.status}`);
      return null;
    }
  } catch (e) {
    log("FAIL", "AUTH", "Session check error", e.message);
    return null;
  }
}

// ─── Resume ────────────────────────────────────────────────────────────────

async function doResume() {
  console.log("\n══ PHASE 2: RESUME (SAGE-FEMME) ══");

  // AI status
  try {
    const r = await rpc("aiConfig/status/check");
    log(r.ok ? "PASS" : "FAIL", "RESUME", "AI status", `available=${r.json?.available}`, r.ms);
  } catch (e) { log("FAIL", "RESUME", "AI status error", e.message); }

  // Create resume — correct schema: {name, slug, tags, withSampleData}
  const slug = `sage-femme-${Date.now()}`;
  try {
    const r = await rpc("resume/create", {
      name: "CV Sage-Femme — Sanae Ouazzani",
      slug,
      tags: ["sage-femme", "maternite", "healthcare"],
      withSampleData: false,
    });
    if (r.ok && r.json) {
      createdResumeId = r.json; // returns the ID string
      log("PASS", "RESUME", "Create resume", `id=${createdResumeId}`, r.ms);
    } else {
      log("FAIL", "RESUME", "Create resume", `status=${r.status} ${r.json?.message || r.text?.slice(0, 150)}`, r.ms);
    }
  } catch (e) { log("FAIL", "RESUME", "Create resume error", e.message); }

  // List resumes to verify
  try {
    const r = await rpc("resume/list");
    const list = Array.isArray(r.json) ? r.json : [];
    const found = list.some(rv => rv.id === createdResumeId);
    log(r.ok ? "PASS" : "FAIL", "RESUME", "List resumes", `total=${list.length} created_found=${found}`, r.ms);
  } catch (e) { log("FAIL", "RESUME", "List resumes error", e.message); }

  // AI generateSummary — streaming endpoint
  try {
    const r = await rpc("ai/generateSummary", {
      resumeData: {
        name: "Sanae Ouazzani",
        headline: "Sage-Femme Diplômée | IMTA Maroc",
        experience: [
          { company: "Maternité Souissi — CHU de Rabat", position: "Sage-Femme Stagiaire",
            description: "Suivi des accouchements, monitoring fœtal, soins néonataux, urgences obstétricales" }
        ],
        education: [{ degree: "Diplôme", area: "Maïeutique / Sage-Femme", institution: "IMTA" }],
        skills: ["Accouchement", "Monitoring fœtal", "Soins néonataux", "Suivi prénatal"],
      },
      language: "fr",
    });
    if (r.ok) {
      // Streaming SSE — extract text from events
      const eventMatches = r.text.matchAll(/data:\s*(\{[^\n]+\})/g);
      let fullText = "";
      for (const m of eventMatches) {
        try {
          const parsed = JSON.parse(m[1]);
          const chunk = parsed?.json;
          if (typeof chunk === "string") fullText += chunk;
        } catch {}
      }
      const inFrench = /sage|soins|maternit|obstétr|néonatal|prénatal|diplômé/i.test(fullText);
      const inEnglish = /midwife|healthcare|clinical|certified|dedicated/i.test(fullText);
      log("PASS", "RESUME", "AI generateSummary (streaming)",
        `sse_len=${r.text.length} extracted_text_len=${fullText.length} fr=${inFrench} en=${inEnglish}`, r.ms);
      if (!inFrench && fullText.length > 50) log("WARN", "RESUME", "Summary language", `Text appears English: "${fullText.slice(0, 100)}"`);
      if (fullText.length < 50) log("WARN", "RESUME", "Summary text extraction", `Short/empty extracted text from SSE — may need better parsing`);
    } else {
      log("FAIL", "RESUME", "AI generateSummary", `status=${r.status} ${r.text?.slice(0, 150)}`, r.ms);
    }
  } catch (e) { log("FAIL", "RESUME", "AI generateSummary error", e.message); }

  // AI suggestSkills
  try {
    const r = await rpc("ai/suggestSkills", {
      resumeData: {
        experience: [
          { company: "Maternité Souissi", position: "Sage-Femme",
            description: "Accouchements eutociques et dystociques, monitoring fœtal, soins néonataux" }
        ],
        education: [{ degree: "Diplôme", area: "Maïeutique", institution: "IMTA" }],
        skills: ["Accouchement"],
      },
      language: "fr",
    });
    if (r.ok && Array.isArray(r.json)) {
      const skills = r.json.map(s => typeof s === "string" ? s : s.name || "?");
      const hasMidwifery = skills.some(s => /accouche|obstétr|néonatal|prénatal|maternit|suivi|soin/i.test(s));
      log("PASS", "RESUME", "AI suggestSkills",
        `${r.json.length} skills: [${skills.slice(0, 5).join(", ")}] midwifery=${hasMidwifery}`, r.ms);
    } else {
      log("FAIL", "RESUME", "AI suggestSkills", `status=${r.status} ${r.json?.message}`, r.ms);
    }
  } catch (e) { log("FAIL", "RESUME", "AI suggestSkills error", e.message); }
}

// ─── Career Tools ──────────────────────────────────────────────────────────

async function doCareer() {
  console.log("\n══ PHASE 3: CAREER TOOLS ══");

  // careerCoach — correct schema: {message, field?, context?} where context is STRING
  try {
    const r = await rpc("career/careerCoach", {
      message: "Je suis sage-femme diplômée de l'IMTA. Je veux devenir cadre de santé en maternité. Quelles sont les étapes clés ?",
      field: "healthcare",
      context: "Diplômée IMTA 2024, sage-femme, objectif cadre de santé en maternité",
    });
    if (r.ok) {
      const resp = r.json?.response || (typeof r.json === "string" ? r.json : JSON.stringify(r.json));
      const inFrench = /sage.femme|maternit|cadre|soins|étape|formation/i.test(resp);
      const followUps = r.json?.followUpQuestions || r.json?.suggestions || [];
      log("PASS", "CAREER", "careerCoach (sage-femme → cadre)",
        `len=${resp.length} fr=${inFrench} followUps=${followUps.length} preview="${resp.slice(0, 80)}"`, r.ms);
      if (!inFrench) log("WARN", "CAREER", "careerCoach language", "Response lacks French medical terms");
    } else {
      log("FAIL", "CAREER", "careerCoach", `status=${r.status} ${r.json?.message || r.text?.slice(0, 200)}`, r.ms);
    }
  } catch (e) { log("FAIL", "CAREER", "careerCoach error", e.message); }

  // recommendCareerPaths — correct schema: {currentRole, skills, field, experienceYears, language}
  try {
    const r = await rpc("career/recommendCareerPaths", {
      currentRole: "Sage-Femme",
      skills: ["Accouchement", "Monitoring fœtal", "Soins néonataux", "Suivi prénatal"],
      field: "healthcare",
      language: "fr",
    });
    if (r.ok) {
      const paths = Array.isArray(r.json) ? r.json : (r.json?.paths || []);
      const healthPaths = paths.filter(p => /santé|maternit|obstétr|sage|soins|médic|infirm/i.test(JSON.stringify(p)));
      log("PASS", "CAREER", "recommendCareerPaths",
        `${paths.length} paths, ${healthPaths.length} health-related, first="${JSON.stringify(paths[0])?.slice(0, 80)}"`, r.ms);
      if (paths.length === 0) log("WARN", "CAREER", "recommendCareerPaths", "No paths returned");
    } else {
      log("FAIL", "CAREER", "recommendCareerPaths", `status=${r.status} ${r.json?.message || r.text?.slice(0, 200)}`, r.ms);
    }
  } catch (e) { log("FAIL", "CAREER", "recommendCareerPaths error", e.message); }

  // analyzeSkillGap — correct schema: {targetRole, currentSkills, field} (no currentRole/language)
  try {
    const r = await rpc("career/analyzeSkillGap", {
      targetRole: "Cadre de Santé en Maternité",
      currentSkills: ["Accouchement", "Monitoring fœtal", "Soins néonataux", "Suivi prénatal"],
      field: "healthcare",
    });
    if (r.ok) {
      const res = r.json;
      const matchPct = res?.matchPercentage ?? res?.matchScore ?? "N/A";
      const gaps = res?.missingSkills || [];
      const recs = res?.recommendations || [];
      log("PASS", "CAREER", "analyzeSkillGap",
        `match=${matchPct}% gaps=${gaps.length} recs=${recs.length} first_gap="${gaps[0]?.skill || "N/A"}"`, r.ms);
    } else {
      log("FAIL", "CAREER", "analyzeSkillGap", `status=${r.status} ${r.json?.message || r.text?.slice(0, 200)}`, r.ms);
    }
  } catch (e) { log("FAIL", "CAREER", "analyzeSkillGap error", e.message); }

  // Career assessment — correct schema: {} (empty object)
  try {
    const r = await rpc("career/getAssessmentQuestions", {});
    if (r.ok) {
      const qs = Array.isArray(r.json) ? r.json : [];
      const genericCount = qs.filter(q => /environment|style|prefer|environnement|apprenez/i.test(q?.question || "")).length;
      const healthCount = qs.filter(q => /patient|soins|urgence|clinique|maternit|infirm|sage/i.test(q?.question || "")).length;
      log(qs.length > 0 ? "PASS" : "WARN", "CAREER", "getAssessmentQuestions",
        `${qs.length} questions, generic=${genericCount}, health-specific=${healthCount}`, r.ms);
      if (healthCount === 0 && qs.length > 0) {
        log("WARN", "CAREER", "Assessment questions GENERIC-ONLY BUG",
          `All ${qs.length} questions are generic (work style/environment) — ZERO clinical/midwifery content`);
      }
    } else {
      log("FAIL", "CAREER", "getAssessmentQuestions", `status=${r.status} ${r.text?.slice(0, 150)}`, r.ms);
    }
  } catch (e) { log("FAIL", "CAREER", "getAssessmentQuestions error", e.message); }

  // Skills quiz
  try {
    const r = await rpc("career/skillsQuiz/list", { field: "healthcare" });
    const items = r.ok ? (Array.isArray(r.json) ? r.json : []) : [];
    if (!r.ok) {
      log("FAIL", "CAREER", "skillsQuiz/list", `status=${r.status}`, r.ms);
    } else if (items.length === 0) {
      log("WARN", "CAREER", "skillsQuiz/list (healthcare) — EMPTY BUG", "0 quiz questions — healthcare skills quiz not seeded", r.ms);
    } else {
      log("PASS", "CAREER", "skillsQuiz/list", `${items.length} questions`, r.ms);
    }
  } catch (e) { log("FAIL", "CAREER", "skillsQuiz/list error", e.message); }

  // Reference data
  try {
    const r = await rpc("marketInsights/list", { field: "healthcare" });
    const items = r.ok ? (Array.isArray(r.json) ? r.json : []) : [];
    log(r.ok ? "PASS" : "FAIL", "CAREER", "marketInsights (healthcare)", `${items.length} insights`, r.ms);
  } catch (e) { log("FAIL", "CAREER", "marketInsights error", e.message); }

  try {
    const r = await rpc("employers/list", { field: "healthcare" });
    const items = r.ok ? (Array.isArray(r.json) ? r.json : []) : [];
    const maternity = items.filter(e => /maternit|gynécol|CHU|obstétr|hôpital|clinique|hopital/i.test(JSON.stringify(e)));
    log(r.ok ? "PASS" : "FAIL", "CAREER", "employers (healthcare)",
      `${items.length} employers, ${maternity.length} maternity/hospital-specific`, r.ms);
  } catch (e) { log("FAIL", "CAREER", "employers error", e.message); }
}

// ─── Learning ──────────────────────────────────────────────────────────────

async function doLearning() {
  console.log("\n══ PHASE 4: ADAPTIVE LEARNING ══");

  // Get or create profile — correct endpoint
  try {
    const r = await rpc("adaptiveLearning/profile/getOrCreate");
    if (r.ok) {
      log("PASS", "LEARN", "Get/create learning profile", `field=${r.json?.currentField} level=${r.json?.currentLevel}`, r.ms);
    } else {
      log("FAIL", "LEARN", "getOrCreate profile", `status=${r.status} ${r.json?.message}`, r.ms);
    }
  } catch (e) { log("FAIL", "LEARN", "learning profile error", e.message); }

  // Update profile
  try {
    const r = await rpc("adaptiveLearning/profile/update", {
      currentField: "healthcare",
      currentLevel: "beginner",
      targetLevel: "intermediate",
      learningStyle: "mixed",
      preferredPace: "moderate",
    });
    log(r.ok ? "PASS" : "WARN", "LEARN", "Update learning profile", `field=healthcare`, r.ms);
  } catch (e) { log("WARN", "LEARN", "Update profile error", e.message); }

  // List learning paths
  try {
    const r = await rpc("adaptiveLearning/paths/list", {});
    const paths = r.ok ? (Array.isArray(r.json) ? r.json : []) : [];
    log(r.ok ? "PASS" : "FAIL", "LEARN", "List learning paths", `${paths.length} existing paths`, r.ms);
  } catch (e) { log("FAIL", "LEARN", "List paths error", e.message); }

  // Generate AI path — correct schema: {field, targetRole, targetLevel}
  try {
    const r = await rpc("adaptiveLearning/paths/generate", {
      field: "healthcare",
      targetRole: "Cadre de Santé en Maternité",
      targetLevel: "intermediate",
    });
    if (r.ok) {
      const path = r.json;
      const title = path?.title || path?.name || "(no title)";
      const titleFr = path?.titleFr || "";
      const modules = path?.modules || [];
      const titleEN = /beginner|foundations|essentials|learning path|structured|from.*to/i.test(title) && !/gestion|fondements|compétences|soins|cadre/i.test(title);
      const titleFrField = /maternit|sage|santé|cadre|soins|formation|santé/i.test(titleFr || title);
      const engModules = modules.filter(m => {
        const t = (m?.title || "").toLowerCase();
        return /foundations|essentials|care and|management|midwifery/i.test(t) && !/gestion|fondements|compétences|soins/i.test(t);
      });
      log("PASS", "LEARN", "Generate AI learning path",
        `modules=${modules.length} title="${title.slice(0, 60)}" titleFr="${titleFr?.slice(0, 60)}" titleEN=${titleEN}`, r.ms);
      if (titleEN) {
        log("WARN", "LEARN", "Learning path title in ENGLISH — BUG",
          `Title "${title}" is English despite healthcare/French context. titleFr field: "${titleFr}"`);
      }
      if (engModules.length > 0) {
        log("WARN", "LEARN", "Learning path modules in ENGLISH — BUG",
          `${engModules.length}/${modules.length} modules have English titles: ${engModules.map(m=>m.title).slice(0,3).join(", ")}`);
      }
    } else {
      log("FAIL", "LEARN", "Generate learning path", `status=${r.status} ${r.json?.message || r.text?.slice(0, 200)}`, r.ms);
    }
  } catch (e) { log("FAIL", "LEARN", "Generate path error", e.message); }

  // Career assessment quiz — submit
  try {
    const rq = await rpc("career/getAssessmentQuestions", {});
    const qs = rq.ok ? (Array.isArray(rq.json) ? rq.json : []) : [];
    if (qs.length > 0) {
      const answers = qs.map(q => ({
        questionId: q.id,
        selectedOptionId: q.options?.[0]?.id,
        value: q.options?.[0]?.value ?? 1,
      })).filter(a => a.questionId && a.selectedOptionId);

      const rs = await rpc("career/submitAssessment", { answers });
      if (rs.ok) {
        log("PASS", "LEARN", "Submit career assessment", `topField=${rs.json?.topCareer || rs.json?.result || "N/A"}`, rs.ms);
      } else {
        log("FAIL", "LEARN", "Submit assessment", `status=${rs.status} ${rs.json?.message}`, rs.ms);
      }
    } else {
      log("WARN", "LEARN", "Career assessment", "No questions — cannot submit");
    }
  } catch (e) { log("FAIL", "LEARN", "Career assessment error", e.message); }

  // Skills quiz empty check
  try {
    const r = await rpc("career/skillsQuiz/list", { field: "healthcare", limit: 5 });
    const items = r.ok ? (Array.isArray(r.json) ? r.json : []) : [];
    log(items.length > 0 ? "PASS" : "WARN", "LEARN", "Skills quiz check",
      `${items.length} questions — ${items.length === 0 ? "EMPTY (BUG)" : "populated"}`, r.ms);
  } catch (e) { log("WARN", "LEARN", "Skills quiz check error", e.message); }
}

// ─── AI Mentor ─────────────────────────────────────────────────────────────

async function doAIMentor() {
  console.log("\n══ PHASE 5: AI MENTOR ══");

  // List templates
  let healthTemplate = null;
  try {
    const r = await rpc("aiMentor/templates/list");
    const templates = r.ok ? (Array.isArray(r.json) ? r.json : []) : [];
    healthTemplate = templates.find(t =>
      /health|santé|médic|amina|nurse|sage|infirm/i.test(JSON.stringify(t))
    ) || templates[0];
    log(r.ok ? "PASS" : "FAIL", "MENTOR", "List templates",
      `${templates.length} templates, healthcare="${healthTemplate?.name || "N/A"}"`, r.ms);
  } catch (e) { log("FAIL", "MENTOR", "List templates error", e.message); }

  // Onboarding status
  try {
    const r = await rpc("aiMentor/onboarding/get");
    log(r.ok ? "PASS" : "FAIL", "MENTOR", "Onboarding status", `completed=${r.json?.completed}`, r.ms);
  } catch (e) { log("FAIL", "MENTOR", "Onboarding error", e.message); }

  // List user mentors
  let existingMentor = null;
  try {
    const r = await rpc("aiMentor/user/list");
    const mentors = r.ok ? (Array.isArray(r.json) ? r.json : []) : [];
    existingMentor = mentors.find(m => /health|santé|amina/i.test(JSON.stringify(m))) || mentors[0];
    log(r.ok ? "PASS" : "FAIL", "MENTOR", "List user mentors",
      `${mentors.length} configured, using="${existingMentor?.name || "N/A"}"`, r.ms);
  } catch (e) { log("FAIL", "MENTOR", "List user mentors error", e.message); }

  let mentorId = existingMentor?.id;

  // Create mentor if needed
  if (!mentorId && healthTemplate) {
    try {
      const r = await rpc("aiMentor/user/create", {
        templateId: healthTemplate.id,
        language: "fr",
      });
      if (r.ok) {
        mentorId = r.json?.id;
        log("PASS", "MENTOR", "Create healthcare mentor", `id=${mentorId}`, r.ms);
      } else {
        log("FAIL", "MENTOR", "Create mentor", `status=${r.status} ${r.json?.message}`, r.ms);
      }
    } catch (e) { log("FAIL", "MENTOR", "Create mentor error", e.message); }
  }

  // Start a conversation — correct schema: {mentorId, topic?, context?}
  let conversationId = null;
  if (mentorId) {
    try {
      const r = await rpc("aiMentor/conversations/create", {
        mentorId,
        topic: "Évolution sage-femme → cadre de santé en maternité",
      });
      if (r.ok) {
        conversationId = r.json?.id;
        log("PASS", "MENTOR", "Create conversation", `id=${conversationId}`, r.ms);
      } else {
        log("FAIL", "MENTOR", "Create conversation", `status=${r.status} ${r.json?.message}`, r.ms);
      }
    } catch (e) { log("FAIL", "MENTOR", "Create conversation error", e.message); }
  }

  // Send messages
  if (conversationId) {
    const msgs = [
      "Bonjour, je suis sage-femme diplômée de l'IMTA. Je veux devenir cadre de santé en maternité. Par où commencer ?",
      "Quelles compétences en management dois-je développer en priorité ?",
      "Y a-t-il des formations au Maroc pour les sage-femmes qui veulent progresser en gestion hospitalière ?",
    ];
    for (const msg of msgs) {
      try {
        const r = await rpc("aiMentor/conversations/sendMessage", {
          conversationId,
          content: msg,
        });
        if (r.ok) {
          const reply = r.json?.message?.content || r.json?.response || JSON.stringify(r.json).slice(0, 200);
          const inFrench = /sage.femme|maternit|cadre|soins|formation|compétence|Maroc/i.test(reply);
          log("PASS", "MENTOR", "Mentor message", `reply_len=${reply.length} fr=${inFrench} "${reply.slice(0, 80)}..."`, r.ms);
        } else {
          log("FAIL", "MENTOR", "Mentor message", `status=${r.status} ${r.json?.message}`, r.ms);
        }
      } catch (e) { log("FAIL", "MENTOR", "Mentor message error", e.message); }
    }

    // Fetch conversation history
    try {
      const r = await rpc("aiMentor/conversations/getById", { id: conversationId });
      if (r.ok) {
        const convMsgs = r.json?.messages || [];
        log(convMsgs.length >= 4 ? "PASS" : "WARN", "MENTOR", "Conversation persistence",
          `${convMsgs.length} messages stored (expected 6: 3 user + 3 AI)`, r.ms);
      } else {
        log("FAIL", "MENTOR", "Get conversation", `status=${r.status}`, r.ms);
      }
    } catch (e) { log("FAIL", "MENTOR", "Get conversation error", e.message); }
  }

  // AI history — check for source=undefined bug
  try {
    const r = await rpc("aiHistory/list", { limit: 20 });
    const items = r.ok ? (Array.isArray(r.json) ? r.json : []) : [];
    const undefinedSource = items.filter(i => i.source === undefined || i.source === null).length;
    log(r.ok ? "PASS" : "FAIL", "MENTOR", "AI history",
      `${items.length} entries, undefined_source=${undefinedSource}`, r.ms);
    if (undefinedSource > 0) {
      log("WARN", "MENTOR", "AI history source=undefined BUG",
        `${undefinedSource}/${items.length} entries have null/undefined source field — data integrity issue`);
    }
  } catch (e) { log("FAIL", "MENTOR", "AI history error", e.message); }
}

// ─── Goals ─────────────────────────────────────────────────────────────────

async function doGoals() {
  console.log("\n══ PHASE 6: GOALS ══");

  // Correct schema: {title, description?, category (enum: career|skill|education|networking|financial|other), status?, priority?, targetDate?, progress?, tags?, metrics?}
  const goalsToCreate = [
    {
      title: "Obtenir diplôme de cadre de santé en maternité",
      description: "Formation en management de la santé, parcours cadre après IMTA",
      category: "education",
      targetDate: new Date("2027-06-01"),
    },
    {
      title: "Maîtriser la gestion des urgences obstétricales",
      description: "Formation hémorragie post-partum, éclampsie, dystocie",
      category: "skill",
      targetDate: new Date("2026-12-01"),
    },
    {
      title: "Trouver un poste de sage-femme en maternité niveau III",
      description: "CHU ou clinique privée à Casablanca ou Rabat",
      category: "career",
      targetDate: new Date("2026-09-01"),
    },
  ];

  const createdIds = [];
  for (const goal of goalsToCreate) {
    try {
      const r = await rpc("goals/create", goal);
      if (r.ok && r.json) {
        createdIds.push(r.json);
        log("PASS", "GOALS", `Create: ${goal.title.slice(0, 40)}`, `id=${r.json}`, r.ms);
      } else {
        log("FAIL", "GOALS", `Create: ${goal.title.slice(0, 40)}`, `status=${r.status} ${r.json?.message}`, r.ms);
      }
    } catch (e) { log("FAIL", "GOALS", "Create goal error", e.message); }
  }

  // List goals — verify persistence
  try {
    const r = await rpc("goals/list");
    const allGoals = r.ok ? (Array.isArray(r.json) ? r.json : []) : [];
    const ourGoals = allGoals.filter(g => createdIds.includes(g.id));
    log(ourGoals.length === createdIds.length ? "PASS" : "WARN", "GOALS", "Verify persistence",
      `total=${allGoals.length} created=${createdIds.length} found_back=${ourGoals.length}`, r.ms);
  } catch (e) { log("FAIL", "GOALS", "List goals error", e.message); }

  return createdIds;
}

// ─── Cleanup ───────────────────────────────────────────────────────────────

async function doCleanup(goalIds) {
  console.log("\n══ PHASE 7: CLEANUP ══");

  if (createdResumeId) {
    try {
      const r = await rpc("resume/delete", { id: createdResumeId });
      log(r.ok ? "PASS" : "WARN", "CLEANUP", "Delete resume", `id=${createdResumeId}`, r.ms);
    } catch (e) { log("WARN", "CLEANUP", "Delete resume error", e.message); }
  }

  for (const id of goalIds) {
    try {
      const r = await rpc("goals/delete", { id });
      log(r.ok ? "PASS" : "WARN", "CLEANUP", `Delete goal ${id.slice(0, 8)}...`, "", r.ms);
    } catch (e) { log("WARN", "CLEANUP", "Delete goal error", e.message); }
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  SESSION SANAE v2 — Sage-Femme IMTA — Live Production API   ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`Target: ${BASE}`);
  console.log(`Time: ${REPORT_TIME}\n`);

  const user = await doAuth();
  if (!sessionCookie) { console.error("FATAL: No session."); process.exit(1); }

  await doResume();
  await doCareer();
  await doLearning();
  await doAIMentor();
  const goalIds = await doGoals();
  await doCleanup(goalIds);

  console.log("\n══════════════════════════════════════════");
  console.log(`Results: ${pass} PASS, ${fail} FAIL, ${warn} WARN — Total: ${pass+fail+warn}`);

  return {
    timestamp: REPORT_TIME,
    email: actualEmail,
    results,
    summary: { pass, fail, warn, total: pass + fail + warn }
  };
}

main().then(data => {
  process.stdout.write("\n__RESULTS_JSON__\n" + JSON.stringify(data, null, 2) + "\n__END_RESULTS_JSON__\n");
}).catch(e => { console.error("Fatal:", e); process.exit(1); });
