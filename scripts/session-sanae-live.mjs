/**
 * Sanae Live Session Script
 * Midwife (sage-femme) IMTA graduate — full working session against production
 * Target: https://imta-resume-app-production.up.railway.app
 *
 * Protocol:
 * 1. Try sign-up with unique email → fallback to student2@test.com
 * 2. Full ORPC session: resume, career tools, learning, AI mentor, goals
 * 3. Record success/fail + latency for every call
 * 4. Hunt bugs: 500s, English learning paths, empty quizzes, persistence
 */

import https from "https";
import http from "http";
import { URL } from "url";

const BASE = "https://imta-resume-app-production.up.railway.app";
const REPORT_TIME = new Date().toISOString();

// Unique email for signup attempt
const SIGNUP_EMAIL = `sanae.ouazzani.${Date.now()}@imta-test.ma`;
const SIGNUP_PASS = "SanaeIMTA2026!";
const SIGNUP_NAME = "Sanae Ouazzani";

// Fallback credentials — use partner@test.com first to avoid student2 rate limiting
const FALLBACK_EMAIL = "partner@test.com";
const FALLBACK_PASS = "TestAccount123!";

let sessionCookie = "";
let csrfToken = "orpc"; // ORPC requires this header
let actualEmail = "";
let createdResumeId = null;

const results = [];
let pass = 0, fail = 0, warn = 0;

// ─── HTTP helpers ──────────────────────────────────────────────────────────

function httpRequest(method, urlStr, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const u = new URL(urlStr);
    const mod = u.protocol === "https:" ? https : http;
    const opts = {
      hostname: u.hostname,
      port: u.port || (u.protocol === "https:" ? 443 : 80),
      path: u.pathname + u.search,
      method,
      headers: { ...headers },
      timeout: 30000,
    };
    if (body) {
      const buf = typeof body === "string" ? body : JSON.stringify(body);
      opts.headers["Content-Length"] = Buffer.byteLength(buf);
      if (!opts.headers["Content-Type"])
        opts.headers["Content-Type"] = "application/json";
    }
    const req = mod.request(opts, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString();
        const ms = Date.now() - t0;
        resolve({ status: res.statusCode, headers: res.headers, text, ms });
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
    if (body) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });
}

function parseOrpcResponse(text) {
  try {
    const parsed = JSON.parse(text);
    return parsed?.json !== undefined ? parsed.json : parsed;
  } catch {
    return null;
  }
}

async function rpc(path, input = undefined) {
  const url = `${BASE}/api/rpc/${path}`;
  const envelope = input !== undefined ? { json: input } : { json: undefined };
  const headers = {
    "Content-Type": "application/json",
    Origin: BASE,
    Cookie: sessionCookie,
    "x-csrf-token": csrfToken,
  };
  const res = await httpRequest("POST", url, headers, JSON.stringify(envelope));
  const json = parseOrpcResponse(res.text);
  return { status: res.status, json, text: res.text, ok: res.status >= 200 && res.status < 300, ms: res.ms };
}

async function rpcGet(path, input = undefined) {
  const data = input !== undefined ? { json: input } : { json: undefined };
  const encoded = encodeURIComponent(JSON.stringify(data));
  const url = `${BASE}/api/rpc/${path}?data=${encoded}`;
  const headers = {
    Origin: BASE,
    Cookie: sessionCookie,
    "x-csrf-token": csrfToken,
  };
  const res = await httpRequest("GET", url, headers);
  const json = parseOrpcResponse(res.text);
  return { status: res.status, json, text: res.text, ok: res.status >= 200 && res.status < 300, ms: res.ms };
}

// ─── Logging ───────────────────────────────────────────────────────────────

function log(status, section, name, detail = "", ms = null) {
  const icon = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "⚠";
  const msStr = ms !== null ? ` [${ms}ms]` : "";
  const line = `${icon} [${section}] ${name}${msStr}${detail ? " — " + detail : ""}`;
  console.log(line);
  results.push({ status, section, name, detail, ms });
  if (status === "PASS") pass++;
  else if (status === "FAIL") fail++;
  else warn++;
}

// ─── PHASE 1: Authentication ───────────────────────────────────────────────

async function phase1Auth() {
  console.log("\n══ PHASE 1: AUTHENTICATION ══");

  // Try sign-up
  try {
    const res = await httpRequest("POST", `${BASE}/api/auth/sign-up/email`, {
      "Content-Type": "application/json",
      Origin: BASE,
    }, { email: SIGNUP_EMAIL, password: SIGNUP_PASS, name: SIGNUP_NAME });

    if (res.status === 200 || res.status === 201) {
      const body = JSON.parse(res.text);
      const rawCookies = res.headers["set-cookie"] || [];
      sessionCookie = rawCookies.map(c => c.split(";")[0]).join("; ");
      actualEmail = SIGNUP_EMAIL;
      log("PASS", "AUTH", "Signup new account", `email=${SIGNUP_EMAIL} status=${res.status}`, res.ms);
    } else {
      log("WARN", "AUTH", "Signup failed (expected for existing)", `status=${res.status} — falling back to student2`, res.ms);
      // Fallback to student2
      const res2 = await httpRequest("POST", `${BASE}/api/auth/sign-in/email`, {
        "Content-Type": "application/json",
        Origin: BASE,
      }, { email: FALLBACK_EMAIL, password: FALLBACK_PASS });
      const rawCookies = res2.headers["set-cookie"] || [];
      sessionCookie = rawCookies.map(c => c.split(";")[0]).join("; ");
      actualEmail = FALLBACK_EMAIL;
      if (res2.status === 200 || res2.status === 302) {
        log("PASS", "AUTH", "Login fallback (student2)", `status=${res2.status}, cookies=${rawCookies.length}`, res2.ms);
      } else {
        log("FAIL", "AUTH", "Login fallback (student2)", `status=${res2.status} ${res2.text.slice(0, 100)}`, res2.ms);
      }
    }
  } catch (e) {
    log("FAIL", "AUTH", "Signup/login error", e.message);
    // Try fallback directly
    try {
      const res2 = await httpRequest("POST", `${BASE}/api/auth/sign-in/email`, {
        "Content-Type": "application/json",
        Origin: BASE,
      }, { email: FALLBACK_EMAIL, password: FALLBACK_PASS });
      const rawCookies = res2.headers["set-cookie"] || [];
      sessionCookie = rawCookies.map(c => c.split(";")[0]).join("; ");
      actualEmail = FALLBACK_EMAIL;
      log("PASS", "AUTH", "Login fallback after error", `status=${res2.status}`, res2.ms);
    } catch (e2) {
      log("FAIL", "AUTH", "All auth attempts failed", e2.message);
    }
  }

  // Session check
  try {
    const res = await httpRequest("GET", `${BASE}/api/auth/get-session`, {
      Cookie: sessionCookie,
      Origin: BASE,
    });
    const body = JSON.parse(res.text);
    if (body?.user?.email) {
      log("PASS", "AUTH", "Session verified", `user=${body.user.email} role=${body.user.role}`, res.ms);
      return body.user;
    } else {
      log("FAIL", "AUTH", "Session check: no user", `status=${res.status}`, res.ms);
      return null;
    }
  } catch (e) {
    log("FAIL", "AUTH", "Session check error", e.message);
    return null;
  }
}

// ─── PHASE 2: Create Resume ────────────────────────────────────────────────

async function phase2Resume() {
  console.log("\n══ PHASE 2: CREATE SAGE-FEMME RESUME ══");

  // Check AI status first
  try {
    const r = await rpc("aiConfig/status/check");
    if (r.ok && r.json?.available) {
      log("PASS", "RESUME", "AI status check", `available=${r.json.available} provider=${r.json.provider || "configured"}`, r.ms);
    } else {
      log("WARN", "RESUME", "AI status check", `available=${r.json?.available} — AI may not work`, r.ms);
    }
  } catch (e) {
    log("FAIL", "RESUME", "AI status check", e.message);
  }

  // Create resume
  const resumeData = {
    title: "CV Sage-Femme — Sanae Ouazzani",
    slug: `sage-femme-sanae-${Date.now()}`,
    visibility: "private",
    data: {
      basics: {
        name: "Sanae Ouazzani",
        headline: "Sage-Femme Diplômée | IMTA Maroc",
        email: "sanae.ouazzani@imta.ma",
        phone: "+212 6 12 34 56 78",
        location: { address: "Casablanca, Maroc" },
        summary: "",
        photo: { url: "", filters: { size: 64, aspectRatio: 1, borderRadius: 0, grayscale: false }, visible: true, effects: {} },
        url: { label: "", href: "" },
        customFields: [],
        picture: {}
      },
      sections: {
        summary: { name: "Résumé", columns: 1, separateLinks: true, visible: true, id: "summary", items: [] },
        experience: {
          name: "Expérience Professionnelle",
          columns: 1, separateLinks: true, visible: true, id: "experience",
          items: [
            {
              id: "exp1",
              company: "Maternité Souissi — CHU de Rabat",
              position: "Stagiaire Sage-Femme",
              location: "Rabat, Maroc",
              date: "2023 – 2024",
              summary: "Stage clinique en salle d'accouchement, suivi prénatal, soins postnataux et néonataux. Participation aux urgences obstétricales sous supervision.",
              url: { label: "", href: "" },
              visible: true
            }
          ]
        },
        education: {
          name: "Formation",
          columns: 1, separateLinks: true, visible: true, id: "education",
          items: [
            {
              id: "edu1",
              institution: "IMTA — Institut des Métiers et Techniques Appliqués",
              studyType: "Diplôme",
              area: "Maïeutique / Sage-Femme",
              score: "",
              date: "2021 – 2024",
              summary: "Formation professionnelle en soins obstétricaux, gynécologie, néonatologie et santé maternelle.",
              url: { label: "", href: "" },
              visible: true
            }
          ]
        },
        skills: {
          name: "Compétences",
          columns: 1, separateLinks: true, visible: true, id: "skills",
          items: [
            { id: "sk1", name: "Accouchement et soins obstétricaux", description: "Avancé", level: 4, keywords: [], visible: true },
            { id: "sk2", name: "Monitoring fœtal", description: "Intermédiaire", level: 3, keywords: [], visible: true },
            { id: "sk3", name: "Soins néonataux", description: "Intermédiaire", level: 3, keywords: [], visible: true },
            { id: "sk4", name: "Suivi prénatal", description: "Intermédiaire", level: 3, keywords: [], visible: true }
          ]
        },
        languages: {
          name: "Langues",
          columns: 1, separateLinks: true, visible: true, id: "languages",
          items: [
            { id: "lang1", name: "Arabe", description: "Langue maternelle", level: 5, visible: true },
            { id: "lang2", name: "Français", description: "Courant", level: 4, visible: true },
            { id: "lang3", name: "Darija", description: "Courant", level: 5, visible: true }
          ]
        },
        certifications: { name: "Certifications", columns: 1, separateLinks: true, visible: true, id: "certifications", items: [] },
        awards: { name: "Prix et Distinctions", columns: 1, separateLinks: true, visible: true, id: "awards", items: [] },
        profiles: { name: "Profils", columns: 1, separateLinks: true, visible: true, id: "profiles", items: [] },
        projects: { name: "Projets", columns: 1, separateLinks: true, visible: true, id: "projects", items: [] },
        volunteer: { name: "Bénévolat", columns: 1, separateLinks: true, visible: true, id: "volunteer", items: [] },
        interests: { name: "Intérêts", columns: 1, separateLinks: true, visible: true, id: "interests", items: [] },
        publications: { name: "Publications", columns: 1, separateLinks: true, visible: true, id: "publications", items: [] },
        references: { name: "Références", columns: 1, separateLinks: true, visible: true, id: "references", items: [] },
        customSections: []
      },
      metadata: {
        template: "azurill",
        layout: [[[]]],
        css: { value: "", visible: false },
        page: { margin: 18, format: "a4", options: { breakLine: true, pageNumbers: true } },
        theme: { background: "#ffffff", text: "#000000", primary: "#0f766e" },
        typography: { font: { family: "IBM Plex Serif", subset: "latin", variants: ["regular", "italic", "600"], size: 14 }, lineHeight: 1.5, hideIcons: false, underlineLinks: true },
        notes: ""
      }
    }
  };

  try {
    const r = await rpc("resume/create", resumeData);
    if (r.ok && r.json?.id) {
      createdResumeId = r.json.id;
      log("PASS", "RESUME", "Create sage-femme resume", `id=${createdResumeId} title=${r.json.title}`, r.ms);
    } else {
      log("FAIL", "RESUME", "Create resume", `status=${r.status} ${r.json?.message || r.text?.slice(0, 100)}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "RESUME", "Create resume error", e.message);
  }

  // List resumes to verify
  try {
    const r = await rpc("resume/list");
    if (r.ok && Array.isArray(r.json)) {
      const myResume = r.json.find(rv => rv.id === createdResumeId);
      log("PASS", "RESUME", "List resumes (verify created)", `total=${r.json.length} created_found=${!!myResume}`, r.ms);
    } else {
      log("FAIL", "RESUME", "List resumes", `status=${r.status}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "RESUME", "List resumes error", e.message);
  }

  // AI: Generate professional summary (streaming)
  try {
    const r = await rpc("ai/generateSummary", {
      resumeData: {
        name: "Sanae Ouazzani",
        headline: "Sage-Femme Diplômée | IMTA Maroc",
        experience: [
          { company: "Maternité Souissi", position: "Stagiaire Sage-Femme", description: "Accouchements, soins prénataux, néonataux, urgences obstétricales" }
        ],
        education: [
          { degree: "Diplôme", area: "Maïeutique / Sage-Femme", institution: "IMTA" }
        ],
        skills: ["Accouchement", "Monitoring fœtal", "Soins néonataux", "Suivi prénatal"],
      },
      language: "fr",
    });
    // Note: generateSummary is a streaming SSE endpoint. The raw response contains SSE data.
    if (r.ok) {
      const hasFrench = r.text.includes("sage") || r.text.includes("soins") || r.text.includes("maternité") || r.text.includes("obstét") || r.text.includes("professionnelle");
      const hasEnglish = r.text.includes('"Midwife"') || r.text.includes('"healthcare"') || r.text.includes("clinical");
      log("PASS", "RESUME", "AI generateSummary (streaming)", `len=${r.text.length} french_terms=${hasFrench} english_terms=${hasEnglish} | RAW SSE (expected)`, r.ms);
      if (!hasFrench) {
        log("WARN", "RESUME", "generateSummary language check", "No obvious French medical terms found in SSE response — possible English content");
      }
    } else {
      log("FAIL", "RESUME", "AI generateSummary", `status=${r.status} ${r.text?.slice(0, 150)}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "RESUME", "AI generateSummary error", e.message);
  }

  // AI: Suggest skills
  try {
    const r = await rpc("ai/suggestSkills", {
      resumeData: {
        experience: [
          { company: "Maternité Souissi", position: "Sage-Femme", description: "Accouchements, suivi prénatal, soins néonataux, urgences obstétricales" }
        ],
        education: [
          { degree: "Diplôme", area: "Maïeutique", institution: "IMTA" }
        ],
        skills: ["Accouchement"],
      },
      language: "fr",
    });
    if (r.ok && Array.isArray(r.json)) {
      const skills = r.json.map(s => (typeof s === "string" ? s : s.name || JSON.stringify(s)));
      const hasMidwifery = skills.some(s => /accouche|obstétr|néonatal|prénatal|maternit|soins/i.test(s));
      log("PASS", "RESUME", "AI suggestSkills", `${r.json.length} skills returned: [${skills.slice(0, 5).join(", ")}] midwifery_terms=${hasMidwifery}`, r.ms);
      if (!hasMidwifery) {
        log("WARN", "RESUME", "suggestSkills relevance", `Skills don't appear midwifery-specific: ${skills.join(", ")}`);
      }
    } else {
      log("FAIL", "RESUME", "AI suggestSkills", `status=${r.status} json=${JSON.stringify(r.json)?.slice(0, 100)}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "RESUME", "AI suggestSkills error", e.message);
  }
}

// ─── PHASE 3: Career Tools ─────────────────────────────────────────────────

async function phase3Career() {
  console.log("\n══ PHASE 3: CAREER TOOLS ══");

  // careerCoach — sage-femme → cadre de santé
  try {
    const r = await rpc("career/careerCoach", {
      message: "Je suis sage-femme diplômée de l'IMTA. Je veux devenir cadre de santé en maternité. Quelles sont les étapes pour y parvenir ?",
      context: {
        currentRole: "Sage-Femme",
        targetRole: "Cadre de Santé en Maternité",
        field: "healthcare",
        language: "fr"
      }
    });
    if (r.ok) {
      const txt = typeof r.json === "string" ? r.json : JSON.stringify(r.json);
      const inFrench = /sage.femme|maternit|cadre|soins|obstétr|santé/i.test(txt);
      const hasRecommendations = /étape|formation|expérience|recommand/i.test(txt);
      log("PASS", "CAREER", "careerCoach (sage-femme → cadre)", `len=${txt.length} french=${inFrench} has_recs=${hasRecommendations}`, r.ms);
      if (!inFrench) log("WARN", "CAREER", "careerCoach language", "Response doesn't contain French medical terms");
      if (txt.length < 200) log("WARN", "CAREER", "careerCoach brevity", `Response only ${txt.length} chars — may be too short`);
    } else {
      log("FAIL", "CAREER", "careerCoach", `status=${r.status} ${r.json?.message || r.text?.slice(0, 200)}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "CAREER", "careerCoach error", e.message);
  }

  // recommendCareerPaths
  try {
    const r = await rpc("career/recommendCareerPaths", {
      currentRole: "Sage-Femme",
      skills: ["Accouchement", "Monitoring fœtal", "Soins néonataux", "Suivi prénatal", "Urgences obstétricales"],
      field: "healthcare",
      experienceYears: 1,
      language: "fr"
    });
    if (r.ok) {
      const paths = Array.isArray(r.json) ? r.json : (r.json?.paths || []);
      const healthPaths = paths.filter(p => {
        const text = JSON.stringify(p).toLowerCase();
        return /santé|maternit|infirm|obstétr|sage|soins|médic/i.test(text);
      });
      log("PASS", "CAREER", "recommendCareerPaths", `${paths.length} paths returned, ${healthPaths.length} health-related`, r.ms);
      if (paths.length === 0) log("WARN", "CAREER", "recommendCareerPaths", "No paths returned — feature may be broken");
      if (healthPaths.length === 0 && paths.length > 0) log("WARN", "CAREER", "recommendCareerPaths relevance", "None of the paths are health-sector related for a midwife");
    } else {
      log("FAIL", "CAREER", "recommendCareerPaths", `status=${r.status} ${r.json?.message || r.text?.slice(0, 200)}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "CAREER", "recommendCareerPaths error", e.message);
  }

  // analyzeSkillGap
  try {
    const r = await rpc("career/analyzeSkillGap", {
      currentRole: "Sage-Femme",
      targetRole: "Cadre de Santé en Maternité",
      currentSkills: ["Accouchement", "Monitoring fœtal", "Soins néonataux", "Suivi prénatal"],
      field: "healthcare",
      language: "fr"
    });
    if (r.ok) {
      const result = r.json;
      const txt = JSON.stringify(result);
      const hasGaps = /gap|manqu|competenc|formation|management|leadership/i.test(txt);
      const matchScore = result?.matchScore || result?.match_score || result?.score;
      log("PASS", "CAREER", "analyzeSkillGap", `matchScore=${matchScore || "N/A"} hasGaps=${hasGaps} len=${txt.length}`, r.ms);
      if (!hasGaps) log("WARN", "CAREER", "analyzeSkillGap quality", "No gap keywords found — analysis may be empty/generic");
    } else {
      log("FAIL", "CAREER", "analyzeSkillGap", `status=${r.status} ${r.json?.message || r.text?.slice(0, 200)}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "CAREER", "analyzeSkillGap error", e.message);
  }

  // Career assessment questions
  try {
    const r = await rpc("career/getAssessmentQuestions");
    if (r.ok) {
      const questions = Array.isArray(r.json) ? r.json : [];
      const genericCount = questions.filter(q => {
        const text = (q.question || q.text || "").toLowerCase();
        return /environment|style|prefer|apprenez|environnement/i.test(text);
      }).length;
      const healthCount = questions.filter(q => {
        const text = (q.question || q.text || "").toLowerCase();
        return /patient|soins|urgence|clinique|maternit|obstétr|infirm/i.test(text);
      }).length;
      log("PASS", "CAREER", "getAssessmentQuestions", `${questions.length} questions, generic=${genericCount}, health-specific=${healthCount}`, r.ms);
      if (healthCount === 0 && questions.length > 0) {
        log("WARN", "CAREER", "Assessment questions not midwifery-specific", `All ${questions.length} questions are generic career style — no clinical/obstetric content`);
      }
    } else {
      log("FAIL", "CAREER", "getAssessmentQuestions", `status=${r.status} ${r.json?.message || r.text?.slice(0, 100)}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "CAREER", "getAssessmentQuestions error", e.message);
  }

  // Skills quiz
  try {
    const r = await rpc("career/skillsQuiz/list", { field: "healthcare" });
    if (r.ok) {
      const items = Array.isArray(r.json) ? r.json : [];
      log(items.length > 0 ? "PASS" : "WARN", "CAREER", "skillsQuiz/list (healthcare)", `${items.length} quiz items — ${items.length === 0 ? "EMPTY — BUG" : "populated"}`, r.ms);
    } else {
      log("FAIL", "CAREER", "skillsQuiz/list", `status=${r.status} ${r.json?.message || r.text?.slice(0, 100)}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "CAREER", "skillsQuiz/list error", e.message);
  }

  // Market insights for healthcare
  try {
    const r = await rpc("marketInsights/list", { field: "healthcare" });
    if (r.ok) {
      const items = Array.isArray(r.json) ? r.json : [];
      log(items.length > 0 ? "PASS" : "WARN", "CAREER", "marketInsights/list (healthcare)", `${items.length} insights`, r.ms);
    } else {
      log("FAIL", "CAREER", "marketInsights/list", `status=${r.status}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "CAREER", "marketInsights/list error", e.message);
  }

  // Employers for healthcare
  try {
    const r = await rpc("employers/list", { field: "healthcare" });
    if (r.ok) {
      const items = Array.isArray(r.json) ? r.json : [];
      const maternityEmployers = items.filter(e => {
        const text = JSON.stringify(e).toLowerCase();
        return /maternit|gynécol|obstétr|CHU|hôpital|clinique/i.test(text);
      });
      log(items.length > 0 ? "PASS" : "WARN", "CAREER", "employers/list (healthcare)", `${items.length} employers, ${maternityEmployers.length} maternity/hospital-specific`, r.ms);
    } else {
      log("FAIL", "CAREER", "employers/list", `status=${r.status}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "CAREER", "employers/list error", e.message);
  }
}

// ─── PHASE 4: Learning ─────────────────────────────────────────────────────

async function phase4Learning() {
  console.log("\n══ PHASE 4: ADAPTIVE LEARNING ══");

  let profileId = null;

  // Get/create learning profile
  try {
    const r = await rpc("adaptiveLearning/profile/get");
    if (r.ok) {
      profileId = r.json?.id;
      log("PASS", "LEARN", "Get learning profile", `id=${profileId} field=${r.json?.field}`, r.ms);
    } else if (r.status === 404) {
      // Create profile
      const r2 = await rpc("adaptiveLearning/profile/create", {
        field: "healthcare",
        currentLevel: "beginner",
        targetRole: "Cadre de Santé en Maternité",
        language: "fr"
      });
      if (r2.ok) {
        profileId = r2.json?.id;
        log("PASS", "LEARN", "Create learning profile", `id=${profileId}`, r2.ms);
      } else {
        log("FAIL", "LEARN", "Create learning profile", `status=${r2.status} ${r2.json?.message}`, r2.ms);
      }
    } else {
      log("FAIL", "LEARN", "Get learning profile", `status=${r.status} ${r.json?.message}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "LEARN", "Learning profile error", e.message);
  }

  // Update profile for healthcare
  if (profileId) {
    try {
      const r = await rpc("adaptiveLearning/profile/update", {
        field: "healthcare",
        currentLevel: "beginner",
        targetRole: "Cadre de Santé en Maternité",
        language: "fr"
      });
      if (r.ok) {
        log("PASS", "LEARN", "Update learning profile", `field=healthcare lang=fr`, r.ms);
      } else {
        log("WARN", "LEARN", "Update learning profile", `status=${r.status}`, r.ms);
      }
    } catch (e) {
      log("WARN", "LEARN", "Update learning profile error", e.message);
    }
  }

  // List existing learning paths
  try {
    const r = await rpc("adaptiveLearning/paths/list");
    if (r.ok) {
      const paths = Array.isArray(r.json) ? r.json : [];
      log("PASS", "LEARN", "List learning paths", `${paths.length} paths found`, r.ms);
    } else {
      log("FAIL", "LEARN", "List learning paths", `status=${r.status}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "LEARN", "List learning paths error", e.message);
  }

  // Generate a learning path
  try {
    const r = await rpc("adaptiveLearning/paths/generate", {
      targetRole: "Cadre de Santé en Maternité",
      currentSkills: ["Accouchement", "Soins néonataux", "Monitoring fœtal"],
      field: "healthcare",
      durationWeeks: 12,
      language: "fr"
    });
    if (r.ok) {
      const path = r.json;
      const title = path?.title || path?.name || "";
      const modules = path?.modules || path?.steps || [];
      const titleInFrench = /maternit|sage|santé|cadre|soins|formation/i.test(title);
      const titleInEnglish = /beginner|foundations|essentials|learning path|structured/i.test(title);
      const modulesInEnglish = modules.some(m => {
        const t = (m?.title || m?.name || "").toLowerCase();
        return /foundations|essentials|care and|skills|management/i.test(t) && !/gestion|fondements|compétences|soins/i.test(t);
      });

      log("PASS", "LEARN", "Generate learning path", `title="${title}" modules=${modules.length} titleFR=${titleInFrench} titleEN=${titleInEnglish}`, r.ms);

      if (titleInEnglish) {
        log("WARN", "LEARN", "Learning path title in ENGLISH", `BUG: Title "${title}" is English despite language=fr`);
      }
      if (modulesInEnglish) {
        const engModules = modules.filter(m => /foundations|essentials|care and|management/i.test(m?.title || m?.name || ""));
        log("WARN", "LEARN", "Learning path modules in ENGLISH", `BUG: ${engModules.length} modules have English titles: [${engModules.map(m => m?.title || m?.name).join(", ")}]`);
      }
    } else {
      log("FAIL", "LEARN", "Generate learning path", `status=${r.status} ${r.json?.message || r.text?.slice(0, 200)}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "LEARN", "Generate learning path error", e.message);
  }

  // Career assessment quiz — submit answers
  try {
    const r = await rpc("career/getAssessmentQuestions");
    if (r.ok && Array.isArray(r.json) && r.json.length > 0) {
      const questions = r.json;
      // Submit answers (select first option for each)
      const answers = questions.map(q => ({
        questionId: q.id,
        selectedOptionId: q.options?.[0]?.id || q.choices?.[0]?.id,
        value: q.options?.[0]?.value || 1
      })).filter(a => a.questionId);

      const submitR = await rpc("career/submitAssessment", { answers });
      if (submitR.ok) {
        log("PASS", "LEARN", "Submit career assessment", `result=${JSON.stringify(submitR.json)?.slice(0, 100)}`, submitR.ms);
      } else {
        log("FAIL", "LEARN", "Submit career assessment", `status=${submitR.status} ${submitR.json?.message}`, submitR.ms);
      }
    } else {
      log("WARN", "LEARN", "Career assessment quiz", "No questions returned — cannot submit assessment");
    }
  } catch (e) {
    log("FAIL", "LEARN", "Career assessment error", e.message);
  }

  // Skills quiz for healthcare
  try {
    const r = await rpc("career/skillsQuiz/list", { field: "healthcare", limit: 5 });
    if (r.ok) {
      const items = Array.isArray(r.json) ? r.json : [];
      if (items.length === 0) {
        log("WARN", "LEARN", "Skills quiz (healthcare)", "0 items — quiz is EMPTY (known bug)");
      } else {
        log("PASS", "LEARN", "Skills quiz (healthcare)", `${items.length} questions available`);
        // Try taking the quiz
        const firstQ = items[0];
        const answer = await rpc("career/skillsQuiz/submit", {
          questionId: firstQ.id,
          answerId: firstQ.options?.[0]?.id || firstQ.choices?.[0]?.id,
          field: "healthcare"
        });
        if (answer.ok) {
          log("PASS", "LEARN", "Skills quiz answer submitted", `correct=${answer.json?.correct}`, answer.ms);
        } else {
          log("FAIL", "LEARN", "Skills quiz answer submit", `status=${answer.status}`, answer.ms);
        }
      }
    } else {
      log("FAIL", "LEARN", "Skills quiz list", `status=${r.status}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "LEARN", "Skills quiz error", e.message);
  }
}

// ─── PHASE 5: AI Mentor ────────────────────────────────────────────────────

async function phase5AIMentor() {
  console.log("\n══ PHASE 5: AI MENTOR ══");

  // Get available templates
  let healthcareTemplate = null;
  try {
    const r = await rpc("aiMentor/templates/list");
    if (r.ok) {
      const templates = Array.isArray(r.json) ? r.json : [];
      healthcareTemplate = templates.find(t =>
        /health|santé|médic|amina|nurse|sage|infirm/i.test(JSON.stringify(t))
      ) || templates[0];
      log("PASS", "MENTOR", "List mentor templates", `${templates.length} templates, healthcare=${!!healthcareTemplate} (${healthcareTemplate?.name || "N/A"})`, r.ms);
    } else {
      log("FAIL", "MENTOR", "List mentor templates", `status=${r.status}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "MENTOR", "List mentor templates error", e.message);
  }

  // Get onboarding status
  try {
    const r = await rpc("aiMentor/onboarding/get");
    if (r.ok) {
      log("PASS", "MENTOR", "Get onboarding status", `completed=${r.json?.completed || false}`, r.ms);
    } else {
      log("FAIL", "MENTOR", "Get onboarding status", `status=${r.status}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "MENTOR", "Get onboarding status error", e.message);
  }

  // Get user mentors
  let existingMentor = null;
  try {
    const r = await rpc("aiMentor/user/list");
    if (r.ok) {
      const mentors = Array.isArray(r.json) ? r.json : [];
      existingMentor = mentors.find(m =>
        /health|santé|amina|nurse/i.test(JSON.stringify(m))
      ) || mentors[0];
      log("PASS", "MENTOR", "List user mentors", `${mentors.length} mentors configured`, r.ms);
    } else {
      log("FAIL", "MENTOR", "List user mentors", `status=${r.status}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "MENTOR", "List user mentors error", e.message);
  }

  // Create/use a mentor
  let mentorId = existingMentor?.id;
  if (!mentorId && healthcareTemplate) {
    try {
      const r = await rpc("aiMentor/user/create", {
        templateId: healthcareTemplate.id,
        customName: "Dr. Amina — Santé Maternelle",
        language: "fr"
      });
      if (r.ok) {
        mentorId = r.json?.id;
        log("PASS", "MENTOR", "Create healthcare mentor", `id=${mentorId}`, r.ms);
      } else {
        log("FAIL", "MENTOR", "Create healthcare mentor", `status=${r.status} ${r.json?.message}`, r.ms);
      }
    } catch (e) {
      log("FAIL", "MENTOR", "Create mentor error", e.message);
    }
  }

  if (!mentorId && healthcareTemplate) {
    // Try using template ID directly for conversation
    mentorId = healthcareTemplate.id;
  }

  // Create a conversation
  let conversationId = null;
  if (mentorId) {
    try {
      const r = await rpc("aiMentor/conversation/create", {
        mentorId,
        title: "Carrière sage-femme → cadre de santé"
      });
      if (r.ok) {
        conversationId = r.json?.id;
        log("PASS", "MENTOR", "Create conversation", `id=${conversationId}`, r.ms);
      } else {
        log("FAIL", "MENTOR", "Create conversation", `status=${r.status} ${r.json?.message}`, r.ms);
      }
    } catch (e) {
      log("FAIL", "MENTOR", "Create conversation error", e.message);
    }
  }

  // Send messages in the conversation
  if (conversationId) {
    const messages = [
      "Bonjour, je suis sage-femme diplômée de l'IMTA. Je souhaite évoluer vers un poste de cadre de santé en maternité. Quels conseils me donneriez-vous ?",
      "Quelles compétences en management dois-je développer en priorité en tant que sage-femme voulant devenir cadre de santé ?",
      "Y a-t-il des formations spécifiques au Maroc pour les sage-femmes qui veulent progresser vers la gestion ?"
    ];

    for (const msg of messages) {
      try {
        const r = await rpc("aiMentor/conversation/message", {
          conversationId,
          content: msg,
          role: "user"
        });
        if (r.ok) {
          const reply = r.json?.content || r.json?.message || JSON.stringify(r.json);
          const inFrench = /sage.femme|maternit|cadre|soins|formation|compétence/i.test(reply);
          log("PASS", "MENTOR", "Mentor message exchange", `reply_len=${reply.length} french=${inFrench} preview="${reply.slice(0, 80)}..."`, r.ms);
        } else {
          log("FAIL", "MENTOR", "Mentor message", `status=${r.status} ${r.json?.message}`, r.ms);
        }
      } catch (e) {
        log("FAIL", "MENTOR", "Mentor message error", e.message);
      }
    }

    // List conversation history
    try {
      const r = await rpc("aiMentor/conversation/messages", { conversationId });
      if (r.ok) {
        const msgs = Array.isArray(r.json) ? r.json : [];
        log("PASS", "MENTOR", "Get conversation history", `${msgs.length} messages persisted`, r.ms);
        if (msgs.length < 3) {
          log("WARN", "MENTOR", "Conversation persistence", `Expected 3+ messages, got ${msgs.length} — possible persistence issue`);
        }
      } else {
        log("FAIL", "MENTOR", "Get conversation history", `status=${r.status}`, r.ms);
      }
    } catch (e) {
      log("FAIL", "MENTOR", "Get conversation history error", e.message);
    }
  }

  // Check AI history
  try {
    const r = await rpc("aiHistory/list", { limit: 10 });
    if (r.ok) {
      const items = Array.isArray(r.json) ? r.json : [];
      const undefinedSource = items.filter(i => i.source === undefined || i.source === null).length;
      log("PASS", "MENTOR", "AI history", `${items.length} entries, undefined_source=${undefinedSource}`, r.ms);
      if (undefinedSource > 0) {
        log("WARN", "MENTOR", "AI history source=undefined", `${undefinedSource}/${items.length} entries have undefined source — data integrity bug`);
      }
    } else {
      log("FAIL", "MENTOR", "AI history", `status=${r.status}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "MENTOR", "AI history error", e.message);
  }
}

// ─── PHASE 6: Goals ────────────────────────────────────────────────────────

async function phase6Goals() {
  console.log("\n══ PHASE 6: GOALS ══");

  const goals = [
    {
      title: "Obtenir le diplôme de cadre de santé",
      description: "Poursuivre une formation en management de la santé après l'IMTA",
      category: "career",
      targetDate: "2027-06-01",
      status: "active"
    },
    {
      title: "Maîtriser la gestion des urgences obstétricales",
      description: "Formation complémentaire en hémorragie du post-partum et éclampsie",
      category: "skills",
      targetDate: "2026-12-01",
      status: "active"
    },
    {
      title: "Pratiquer 100 accouchements en autonomie",
      description: "Stage pratique en maternité de niveau III",
      category: "experience",
      targetDate: "2026-09-01",
      status: "active"
    }
  ];

  const createdGoalIds = [];

  for (const goal of goals) {
    try {
      const r = await rpc("goals/create", goal);
      if (r.ok && r.json?.id) {
        createdGoalIds.push(r.json.id);
        log("PASS", "GOALS", `Create goal: ${goal.title.slice(0, 40)}`, `id=${r.json.id}`, r.ms);
      } else {
        log("FAIL", "GOALS", `Create goal: ${goal.title.slice(0, 40)}`, `status=${r.status} ${r.json?.message}`, r.ms);
      }
    } catch (e) {
      log("FAIL", "GOALS", "Create goal error", e.message);
    }
  }

  // List goals to verify persistence
  try {
    const r = await rpc("goals/list");
    if (r.ok) {
      const allGoals = Array.isArray(r.json) ? r.json : [];
      const ourGoals = allGoals.filter(g => createdGoalIds.includes(g.id));
      log(ourGoals.length === createdGoalIds.length ? "PASS" : "WARN", "GOALS", "Verify goals persistence",
        `total=${allGoals.length}, our_created=${createdGoalIds.length}, found_back=${ourGoals.length}`, r.ms);
      if (ourGoals.length < createdGoalIds.length) {
        log("WARN", "GOALS", "Goal persistence issue", `Created ${createdGoalIds.length} but only found ${ourGoals.length} back`);
      }
    } else {
      log("FAIL", "GOALS", "List goals", `status=${r.status}`, r.ms);
    }
  } catch (e) {
    log("FAIL", "GOALS", "List goals error", e.message);
  }

  return createdGoalIds;
}

// ─── PHASE 7: Cleanup ──────────────────────────────────────────────────────

async function phase7Cleanup(goalIds) {
  console.log("\n══ PHASE 7: CLEANUP ══");

  // Delete created resume
  if (createdResumeId) {
    try {
      const r = await rpc("resume/delete", { id: createdResumeId });
      if (r.ok) {
        log("PASS", "CLEANUP", "Delete created resume", `id=${createdResumeId}`, r.ms);
      } else {
        log("WARN", "CLEANUP", "Delete resume", `status=${r.status} — manual cleanup may be needed`);
      }
    } catch (e) {
      log("WARN", "CLEANUP", "Delete resume error", e.message);
    }
  }

  // Delete created goals
  for (const goalId of goalIds) {
    try {
      const r = await rpc("goals/delete", { id: goalId });
      if (r.ok) {
        log("PASS", "CLEANUP", `Delete goal ${goalId}`, "", r.ms);
      } else {
        log("WARN", "CLEANUP", `Delete goal ${goalId}`, `status=${r.status}`);
      }
    } catch (e) {
      log("WARN", "CLEANUP", "Delete goal error", e.message);
    }
  }
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║   SESSION SANAE — Sage-Femme IMTA — Live API Simulation     ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`Target: ${BASE}`);
  console.log(`Time: ${REPORT_TIME}\n`);

  const user = await phase1Auth();
  if (!sessionCookie) {
    console.error("FATAL: No session established. Aborting.");
    process.exit(1);
  }

  await phase2Resume();
  await phase3Career();
  await phase4Learning();
  await phase5AIMentor();
  const goalIds = await phase6Goals();
  await phase7Cleanup(goalIds);

  // ── Summary ──
  console.log("\n══════════════════════════════════════════");
  console.log(`Results: ${pass} PASS, ${fail} FAIL, ${warn} WARN`);
  console.log(`Total: ${pass + fail + warn} checks\n`);

  // Return structured results for report
  return {
    timestamp: REPORT_TIME,
    email: actualEmail,
    results,
    summary: { pass, fail, warn, total: pass + fail + warn }
  };
}

main().then(data => {
  // Write JSON results for the report writer
  process.stdout.write("\n__RESULTS_JSON__\n" + JSON.stringify(data, null, 2) + "\n__END_RESULTS_JSON__\n");
}).catch(e => {
  console.error("Fatal error:", e);
  process.exit(1);
});
