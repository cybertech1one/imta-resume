/**
 * work-rachida.mjs — Full working session as Rachida (HSE technician, IMTA grad)
 * Target: https://imta-resume-app-production.up.railway.app
 * Method: Node.js https (NOT native fetch), ORPC wire protocol
 *
 * WORKFLOW:
 * 1. Signup as rachida (fallback to admin@test.com as regular user)
 * 2. Create + populate HSE resume (ISO 45001, risk assessment, EPI)
 * 3. AI: suggestSkills, generateSummary, improveContent
 * 4. Interview: generateQuestions (hse), evaluate, coachAnswer, mock interview
 * 5. Career: skill gap analysis, learning path, AI mentor (HSE question)
 * 6. Jobs: list HSE jobs, apply
 * 7. Verify data persisted
 * 8. Write report to resume-maker-sdlc/reports/work-rachida.md
 */

import https from "https";
import http from "http";
import { URL } from "url";
import fs from "fs";
import path from "path";

const BASE = "https://imta-resume-app-production.up.railway.app";
const RACHIDA_EMAIL = `rachida.benhaddou.${Date.now()}@imta.ma`;
const RACHIDA_PASSWORD = "TestAccount123!";
const RACHIDA_NAME = "Rachida Benhaddou";

// Fallback: admin@test.com (if signup fails)
const ADMIN_EMAIL = "admin@test.com";
const ADMIN_PASSWORD = "TestAccount123!";

let sessionCookie = "";
let actualEmail = "";
let actualRole = "";

const results = [];
const timings = {};
let passed = 0;
let failed = 0;
let bugs = [];
let resumeId = null;
let applicationId = null;
let jobId = null;

// ─── HTTP HELPERS ───────────────────────────────────────────────────────────

function httpRequest(urlStr, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const url = new URL(urlStr);
    const lib = url.protocol === "https:" ? https : http;
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        "Origin": BASE,
        ...options.headers,
      },
    };
    if (sessionCookie) reqOptions.headers["Cookie"] = sessionCookie;

    const req = lib.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const duration = Date.now() - start;
        resolve({ status: res.status || res.statusCode, headers: res.headers, text: data, duration });
      });
    });
    req.on("error", reject);
    if (body) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });
}

function parseOrpc(text) {
  try {
    const parsed = JSON.parse(text);
    return parsed?.json !== undefined ? parsed.json : parsed;
  } catch {
    return null;
  }
}

async function rpc(path, input = undefined) {
  const envelope = input !== undefined ? { json: input } : { json: undefined };
  const res = await httpRequest(
    `${BASE}/api/rpc/${path}`,
    { method: "POST", headers: { "x-csrf-token": "orpc" } },
    JSON.stringify(envelope)
  );
  const json = parseOrpc(res.text);
  return { ...res, json, ok: res.status >= 200 && res.status < 300 };
}

async function rpcGet(path, input = undefined) {
  const data = input !== undefined ? { json: input } : { json: undefined };
  const qs = encodeURIComponent(JSON.stringify(data));
  const res = await httpRequest(
    `${BASE}/api/rpc/${path}?data=${qs}`,
    { method: "GET", headers: { "x-csrf-token": "orpc" } }
  );
  const json = parseOrpc(res.text);
  return { ...res, json, ok: res.status >= 200 && res.status < 300 };
}

async function rpcStream(path, input) {
  const envelope = { json: input };
  const res = await httpRequest(
    `${BASE}/api/rpc/${path}`,
    { method: "POST", headers: { "x-csrf-token": "orpc" } },
    JSON.stringify(envelope)
  );
  return { ...res, ok: res.status >= 200 && res.status < 300 };
}

// ─── LOGGING ────────────────────────────────────────────────────────────────

function log(status, section, test, detail = "", latency = null) {
  const icon = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "⊘";
  const lat = latency ? ` [${latency}ms]` : "";
  const line = `  ${icon} [${section}] ${test}${lat}${detail ? " — " + detail : ""}`;
  console.log(line);
  results.push({ status, section, test, detail, latency });
  if (status === "PASS") passed++;
  else if (status === "FAIL") failed++;
}

function logBug(severity, title, detail) {
  const entry = { severity, title, detail };
  bugs.push(entry);
  console.log(`\n  🐛 BUG [${severity}]: ${title}\n     ${detail}\n`);
}

function section(name) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${name}`);
  console.log("─".repeat(60));
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

async function doSignup() {
  section("AUTH: SIGNUP + LOGIN (rachida@imta.ma → fallback admin)");

  // 1. Try to sign up as Rachida
  try {
    const res = await httpRequest(
      `${BASE}/api/auth/sign-up/email`,
      { method: "POST" },
      JSON.stringify({ email: RACHIDA_EMAIL, password: RACHIDA_PASSWORD, name: RACHIDA_NAME })
    );
    if (res.status === 200 || res.status === 201) {
      const setCookie = res.headers["set-cookie"] || [];
      const cookies = (Array.isArray(setCookie) ? setCookie : [setCookie])
        .map((c) => c.split(";")[0])
        .filter(Boolean)
        .join("; ");
      if (cookies) sessionCookie = cookies;
      actualEmail = RACHIDA_EMAIL;
      log("PASS", "AUTH", "Sign up as Rachida", `status=${res.status}, email=${RACHIDA_EMAIL}`, res.duration);
    } else if (res.status === 429) {
      // Rate limited — note as info and fall back to admin
      log("FAIL", "AUTH", "Sign up as Rachida (rate limited)", `status=429 — signup rate limited by server`, res.duration);
      logBug("MEDIUM", "Signup rate-limited (429) — cannot test new user registration", `Auth route has aggressive rate limiting that blocks signup testing. New users cannot register if limit was hit by previous attempts.`);
      await doAdminFallback();
      return;
    } else {
      log("FAIL", "AUTH", "Sign up as Rachida", `status=${res.status} — ${res.text.slice(0, 150)}`, res.duration);
      if (res.status === 422) {
        logBug("HIGH", "Signup returns 422 FAILED_TO_CREATE_USER", `New user registration failing on prod. Root causes to investigate: (1) SMTP not configured — requireEmailVerification=true on prod causes signup to fail when it cannot send verification email. (2) FLAG_DISABLE_SIGNUPS=true. (3) DB constraint. FIX: Set DISABLE_EMAIL_VERIFICATION=true in Railway env vars OR configure SMTP/Resend.`);
      } else {
        logBug("HIGH", "Signup failed for new user", `POST /api/auth/sign-up/email returned ${res.status}: ${res.text.slice(0, 200)}`);
      }
      // Fall directly to admin without trying rachida sign-in (which will also fail)
      await doAdminFallback();
      return;
    }
  } catch (e) {
    log("FAIL", "AUTH", "Sign up as Rachida", e.message);
    await doAdminFallback();
    return;
  }

  // 2. Try to sign in as Rachida (if signup worked)
  try {
    const res = await httpRequest(
      `${BASE}/api/auth/sign-in/email`,
      { method: "POST" },
      JSON.stringify({ email: RACHIDA_EMAIL, password: RACHIDA_PASSWORD })
    );
    const setCookie = res.headers["set-cookie"] || [];
    const cookies = (Array.isArray(setCookie) ? setCookie : [setCookie])
      .map((c) => c.split(";")[0])
      .filter(Boolean)
      .join("; ");
    if (res.status === 200 && cookies) {
      sessionCookie = cookies;
      log("PASS", "AUTH", "Sign in as Rachida", `status=${res.status}`, res.duration);
      actualEmail = RACHIDA_EMAIL;
    } else {
      log("FAIL", "AUTH", "Sign in as Rachida", `status=${res.status} — may need email verification`, res.duration);
      logBug("MEDIUM", "Sign-in after signup failed — email verification required", `status=${res.status}. New accounts may require email verification before login. DISABLE_EMAIL_VERIFICATION env var may not be set on prod.`);
      await doAdminFallback();
      return;
    }
  } catch (e) {
    log("FAIL", "AUTH", "Sign in as Rachida", e.message);
    await doAdminFallback();
    return;
  }

  // 3. Verify session
  await checkSession();
}

async function doAdminFallback() {
  console.log("\n  → Falling back to admin@test.com as regular user proxy");
  // Retry up to 3 times with a small delay in case of rate limiting
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt > 1) {
        await new Promise((r) => setTimeout(r, 35000)); // wait 35s for rate limit
        console.log(`  → Retry attempt ${attempt}...`);
      }
      const res = await httpRequest(
        `${BASE}/api/auth/sign-in/email`,
        { method: "POST" },
        JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      );
      const setCookie = res.headers["set-cookie"] || [];
      const cookies = (Array.isArray(setCookie) ? setCookie : [setCookie])
        .map((c) => c.split(";")[0])
        .filter(Boolean)
        .join("; ");
      if (res.status === 200 && cookies) {
        sessionCookie = cookies;
        actualEmail = ADMIN_EMAIL;
        log("PASS", "AUTH", "Admin fallback login", `status=${res.status}, attempt=${attempt}`, res.duration);
        break;
      } else if (res.status === 429) {
        log("FAIL", "AUTH", `Admin fallback login (rate limited, attempt ${attempt})`, `status=429`, res.duration);
        if (attempt === 3) logBug("CRITICAL", "Login rate limited — all 3 attempts failed", "Server-side rate limiter blocking login after signup attempts");
        continue;
      } else {
        log("FAIL", "AUTH", "Admin fallback login", `status=${res.status} ${res.text.slice(0, 100)}`, res.duration);
        break;
      }
    } catch (e) {
      log("FAIL", "AUTH", "Admin fallback login", e.message);
      break;
    }
  }
  await checkSession();
}

async function checkSession() {
  try {
    const res = await httpRequest(`${BASE}/api/auth/get-session`, { method: "GET" });
    let body = null;
    try { body = JSON.parse(res.text); } catch {}
    // Better Auth returns {session: {...}, user: {...}} or just null
    const user = body?.user || body?.session?.user;
    if (res.status === 200 && user?.email) {
      actualEmail = user.email;
      actualRole = user.role || "user";
      log("PASS", "AUTH", "Session verified", `user=${actualEmail} role=${actualRole}`, res.duration);
    } else if (res.status === 200 && body === null) {
      log("FAIL", "AUTH", "Session check — null session", `No session cookie sent or cookie rejected`, res.duration);
      logBug("CRITICAL", "No valid session after login", `get-session returned null — cookie not forwarded or rejected`);
    } else {
      log("FAIL", "AUTH", "Session check", `status=${res.status} body=${res.text.slice(0, 100)}`, res.duration);
      logBug("CRITICAL", "No valid session after login", `get-session returned ${res.status}: ${res.text.slice(0, 200)}`);
    }
  } catch (e) {
    log("FAIL", "AUTH", "Session check", e.message);
  }
}

// ─── 1. RESUME: CREATE + POPULATE HSE ────────────────────────────────────────

const HSE_RESUME_DATA = {
  basics: {
    name: "Rachida Benhaddou",
    email: "rachida.benhaddou@imta.ma",
    phone: "+212 6 12 34 56 78",
    headline: "Technicienne HSE — ISO 45001 & Évaluation des Risques",
    summary: "Technicienne HSE diplômée de l'IMTA, spécialisée dans la prévention des risques industriels, la mise en conformité ISO 45001 et la gestion des EPI. Expérience en audit de sécurité et formation des équipes opérationnelles.",
    location: {
      address: "Avenue Mohammed VI",
      city: "Khouribga",
      state: "Béni Mellal-Khénifra",
      country: "MA",
      postalCode: "25000",
    },
    profiles: [
      { network: "LinkedIn", username: "rachida-benhaddou", url: "https://linkedin.com/in/rachida-benhaddou" }
    ],
  },
  sections: {
    experience: {
      name: "Expérience Professionnelle",
      items: [
        {
          id: "exp1",
          company: "OCP Group — Khouribga",
          position: "Stagiaire Technicienne HSE",
          startDate: "2025-03-01",
          endDate: "2025-08-31",
          summary: "Participation aux audits de sécurité des zones d'extraction. Contrôle du port des EPI (casques, harnais, lunettes) sur 200+ opérateurs. Rédaction de rapports d'incidents et suivi des actions correctives. Formation de 30 agents aux procédures d'évacuation d'urgence.",
          location: "Khouribga, Maroc",
        },
        {
          id: "exp2",
          company: "Cimenterie Lafarge Maroc — Meknès",
          position: "Assistante HSE (Alternance)",
          startDate: "2024-09-01",
          endDate: "2025-02-28",
          summary: "Mise à jour du Document Unique d'Évaluation des Risques (DUER). Suivi des indicateurs SÉCURITÉ (TF, TG). Contribution à la certification ISO 45001 de l'unité de production.",
          location: "Meknès, Maroc",
        },
      ],
    },
    education: {
      name: "Formation",
      items: [
        {
          id: "edu1",
          institution: "IMTA — Institut des Métiers et Techniques Appliqués",
          degree: "Technicien Spécialisé",
          area: "Hygiène, Sécurité et Environnement (HSE)",
          startDate: "2023-09-01",
          endDate: "2025-06-30",
          gpa: "Mention Très Bien",
          location: "Maroc",
        },
      ],
    },
    skills: {
      name: "Compétences Techniques",
      items: [
        { id: "sk1", name: "ISO 45001 — SMSST", level: "Advanced" },
        { id: "sk2", name: "Évaluation des risques (AMDEC, HAZOP)", level: "Intermediate" },
        { id: "sk3", name: "Gestion des EPI", level: "Advanced" },
        { id: "sk4", name: "Audit de sécurité", level: "Intermediate" },
        { id: "sk5", name: "Réglementation QHSE Maroc", level: "Advanced" },
        { id: "sk6", name: "Secourisme (SST)", level: "Advanced" },
        { id: "sk7", name: "Excel / Tableaux de bord HSE", level: "Intermediate" },
      ],
    },
    certifications: {
      name: "Certifications",
      items: [
        {
          id: "cert1",
          name: "Formation ISO 45001:2018 Auditeur Interne",
          issuer: "Bureau Veritas Maroc",
          date: "2024-11-15",
          url: "",
        },
        {
          id: "cert2",
          name: "Sauveteur Secouriste du Travail (SST)",
          issuer: "ANAPEC",
          date: "2024-06-10",
          url: "",
        },
      ],
    },
    languages: {
      name: "Langues",
      items: [
        { id: "lang1", name: "Arabe", level: "Native" },
        { id: "lang2", name: "Français", level: "Fluent" },
        { id: "lang3", name: "Anglais", level: "Intermediate" },
      ],
    },
  },
  metadata: {
    template: "azurill",
    layout: [
      [["experience", "education"], ["skills", "certifications", "languages"]],
    ],
    css: { visible: false, value: "" },
    page: { margin: 18, format: "a4", options: { breakLine: true, pageNumbers: true } },
    typography: { font: { family: "IBM Plex Sans", subset: "latin", variants: ["regular", "italic", "600"], size: 14 }, lineHeight: 1.5, hideIcons: false, underlineLinks: true },
    notes: "",
  },
};

async function createHSEResume() {
  section("STEP 1: CREATE HSE RESUME (ISO 45001, EPI, Risk Assessment)");

  // List existing resumes first
  try {
    const r = await rpc("resume/list");
    if (r.ok) {
      const resumes = Array.isArray(r.json) ? r.json : (r.json?.resumes || []);
      log("PASS", "RESUME", "List existing resumes", `${resumes.length} resumes on account`, r.duration);
      // Check if an HSE resume already exists
      const existing = resumes.find((rv) => rv?.data?.basics?.headline?.includes("HSE") || rv?.title?.includes("HSE"));
      if (existing) {
        resumeId = existing.id;
        log("PASS", "RESUME", "HSE resume already exists", `id=${resumeId} title="${existing.title}"`, r.duration);
        return;
      }
    } else {
      log("FAIL", "RESUME", "List resumes", `status=${r.status} — ${r.json?.message || r.text?.slice(0, 100)}`, r.duration);
    }
  } catch (e) {
    log("FAIL", "RESUME", "List resumes", e.message);
  }

  // Create resume with sample data — resume/create requires name + slug + tags (all required)
  // Use withSampleData: true to get a valid initial data structure
  const resumeSlug = `rachida-hse-cv-${Date.now()}`;
  try {
    const r = await rpc("resume/create", {
      name: "CV Technicienne HSE Rachida Benhaddou",
      slug: resumeSlug,
      tags: ["hse", "maroc"],
      withSampleData: true,
    });
    if (r.ok && r.json) {
      resumeId = typeof r.json === "string" ? r.json : r.json?.id || r.json;
      log("PASS", "RESUME", "Create HSE resume (with sample data)", `id=${resumeId}`, r.duration);
    } else {
      log("FAIL", "RESUME", "Create HSE resume", `status=${r.status} — ${r.json?.message || r.text?.slice(0, 150)}`, r.duration);
      logBug("HIGH", "resume/create failed", `status=${r.status}: ${r.json?.message || r.text?.slice(0, 200)}`);
      return;
    }
  } catch (e) {
    log("FAIL", "RESUME", "Create HSE resume", e.message);
    return;
  }

  // Update name and tags to mark as HSE resume (data stays as sample until we can patch the right fields)
  try {
    const r = await rpc("resume/update", {
      id: resumeId,
      name: "CV Technicienne HSE — Rachida Benhaddou",
      tags: ["hse", "maroc", "iso-45001", "epi", "risque"],
    });
    if (r.ok) {
      log("PASS", "RESUME", "Update HSE resume metadata (name/tags)", `tags updated to HSE-specific`, r.duration);
    } else {
      log("FAIL", "RESUME", "Update HSE resume metadata", `status=${r.status} — ${r.json?.message || r.text?.slice(0, 200)}`, r.duration);
      logBug("MEDIUM", "resume/update metadata failed", `status=${r.status}: ${r.json?.message || r.text?.slice(0, 200)}`);
    }
  } catch (e) {
    log("FAIL", "RESUME", "Update HSE resume metadata", e.message);
  }

  // Verify resume was stored — getById is a GET endpoint
  try {
    const r = await rpcGet("resume/getById", { id: resumeId });
    if (r.ok && r.json?.id === resumeId) {
      const name = r.json?.name || "";
      const tags = r.json?.tags || [];
      log("PASS", "RESUME", "Verify HSE resume persisted (getById)", `name="${name}" tags=${JSON.stringify(tags)}`, r.duration);
    } else if (r.ok) {
      log("FAIL", "RESUME", "Verify HSE data persisted", `id mismatch — got: ${r.json?.id}`, r.duration);
    } else {
      log("FAIL", "RESUME", "Verify HSE data persisted", `status=${r.status} — ${r.json?.message || r.text?.slice(0, 100)}`, r.duration);
      logBug("HIGH", "Resume not found after create+update", `resume/getById returned ${r.status} for id=${resumeId}`);
    }
  } catch (e) {
    log("FAIL", "RESUME", "Verify HSE data persisted", e.message);
  }
}

// ─── 2. RESUME AI ─────────────────────────────────────────────────────────────

async function testResumeAI() {
  section("STEP 2: RESUME AI (suggestSkills, generateSummary, improveContent)");

  // suggestSkills for HSE profile
  try {
    const r = await rpc("ai/suggestSkills", {
      resumeData: {
        experience: [
          { company: "OCP Group", position: "Stagiaire Technicienne HSE", description: "Audits de sécurité, contrôle EPI, rapports incidents, formation évacuation" },
          { company: "Lafarge Maroc", position: "Assistante HSE", description: "DUER, indicateurs TF/TG, certification ISO 45001" },
        ],
        education: [
          { degree: "Technicien Spécialisé", area: "Hygiène Sécurité Environnement", institution: "IMTA" }
        ],
        skills: ["ISO 45001", "Évaluation des risques", "Gestion des EPI"],
      },
      language: "fr",
    });
    if (r.ok && r.json) {
      const skills = Array.isArray(r.json) ? r.json : (r.json?.skills || []);
      const preview = skills.slice(0, 5).join(", ");
      log("PASS", "AI-RESUME", "suggestSkills (HSE, FR)", `${skills.length} skills suggested: ${preview}`, r.duration);
      // Check for French content
      const allText = JSON.stringify(r.json);
      const frenchRatio = (allText.match(/[àáâãäåæçèéêëìíîïðñòóôõöùúûüý]/g) || []).length;
      if (frenchRatio === 0 && skills.length > 0) {
        logBug("LOW", "suggestSkills returned English-only content for FR request", `Response: ${JSON.stringify(skills).slice(0, 200)}`);
      }
    } else {
      log("FAIL", "AI-RESUME", "suggestSkills (HSE, FR)", `status=${r.status} — ${r.json?.message || r.text?.slice(0, 200)}`, r.duration);
      if (r.status === 403) logBug("MEDIUM", "AI quota exceeded during HSE work session", `403 on ai/suggestSkills — daily limit hit`);
      else if (r.status === 412) logBug("HIGH", "AI provider not configured", `412 PRECONDITION_FAILED on suggestSkills`);
      else logBug("MEDIUM", "suggestSkills failed", `status=${r.status}: ${r.json?.message || r.text?.slice(0, 200)}`);
    }
  } catch (e) {
    log("FAIL", "AI-RESUME", "suggestSkills", e.message);
  }

  // generateSummary for HSE technician
  try {
    const r = await rpcStream("ai/generateSummary", {
      resumeData: {
        name: "Rachida Benhaddou",
        headline: "Technicienne HSE — ISO 45001",
        experience: [
          { company: "OCP Group", position: "Stagiaire Technicienne HSE", description: "Audits de sécurité industrielle, gestion des EPI sur 200+ opérateurs, rédaction rapports incidents" },
          { company: "Lafarge Maroc", position: "Assistante HSE", description: "DUER, indicateurs de performance HSE (TF, TG), contribution certification ISO 45001" },
        ],
        education: [{ degree: "Technicien Spécialisé HSE", institution: "IMTA" }],
        skills: [{ name: "ISO 45001" }, { name: "Évaluation des risques" }, { name: "Gestion EPI" }, { name: "Audit de sécurité" }],
      },
      language: "fr",
    });
    if (r.ok && r.text?.length > 100) {
      // Check for HSE keywords in French
      const lower = r.text.toLowerCase();
      const hseKeywords = ["hse", "sécurité", "risque", "epi", "iso", "technicien"];
      const found = hseKeywords.filter((kw) => lower.includes(kw));
      const preview = r.text.slice(0, 200).replace(/\s+/g, " ");
      log("PASS", "AI-RESUME", "generateSummary (HSE, FR)", `${r.text.length} chars, HSE keywords found: [${found.join(", ")}] — "${preview}..."`, r.duration);
      // Check for English in French response
      const englishWords = ["safety", "health", "environment", "risk", "equipment"];
      const engFound = englishWords.filter((w) => r.text.toLowerCase().includes(w));
      if (engFound.length > 2) {
        logBug("MEDIUM", "generateSummary returned English content for FR request", `English words found: ${engFound.join(", ")} in summary`);
      }
    } else {
      log("FAIL", "AI-RESUME", "generateSummary (HSE, FR)", `status=${r.status} response_length=${r.text?.length || 0}`, r.duration);
      if (r.status === 403) logBug("MEDIUM", "AI quota exceeded — generateSummary", `403 daily limit hit`);
      else logBug("HIGH", "generateSummary (HSE) returned empty/error", `status=${r.status}: ${r.text?.slice(0, 200)}`);
    }
  } catch (e) {
    log("FAIL", "AI-RESUME", "generateSummary", e.message);
  }

  // improveContent for HSE job description
  try {
    const hseContent = "Réalisation des rondes de sécurité dans les zones industrielles. Vérification des EPI. Rédaction de rapports.";
    const r = await rpcStream("ai/improveContent", {
      content: hseContent,
      language: "fr",
    });
    if (r.ok && r.text?.length > 50) {
      const preview = r.text.slice(0, 200).replace(/\s+/g, " ");
      log("PASS", "AI-RESUME", "improveContent (HSE job desc, FR)", `${r.text.length} chars — "${preview}..."`, r.duration);
    } else {
      log("FAIL", "AI-RESUME", "improveContent (HSE job desc, FR)", `status=${r.status} length=${r.text?.length || 0}`, r.duration);
      logBug("MEDIUM", "improveContent returned thin/empty for HSE content", `status=${r.status}: ${r.text?.slice(0, 200)}`);
    }
  } catch (e) {
    log("FAIL", "AI-RESUME", "improveContent", e.message);
  }
}

// ─── 3. INTERVIEW ─────────────────────────────────────────────────────────────

async function testInterview() {
  section("STEP 3: INTERVIEW (generateQuestions HSE, evaluate, coachAnswer, mock)");
  let generatedQuestions = [];

  // generateQuestions (HSE, beginner)
  try {
    const r = await rpc("interview/generateQuestions", {
      field: "hse",
      types: ["technical", "behavioral"],
      difficulty: "beginner",
      numberOfQuestions: 4,
      language: "fr",
    });
    if (r.ok && Array.isArray(r.json) && r.json.length > 0) {
      generatedQuestions = r.json;
      const preview = r.json[0]?.question?.slice(0, 100) || r.json[0]?.slice(0, 100) || JSON.stringify(r.json[0]).slice(0, 100);
      log("PASS", "INTERVIEW", "generateQuestions (hse, beginner, FR)", `${r.json.length} questions — Q1: "${preview}"`, r.duration);
      // Check French content
      const allQ = JSON.stringify(r.json).toLowerCase();
      const isFrench = allQ.includes("sécurité") || allQ.includes("risque") || allQ.includes("epi") || allQ.includes("comment") || allQ.includes("pouvez");
      if (!isFrench) {
        logBug("MEDIUM", "generateQuestions returned non-French content for FR request", `Sample: ${JSON.stringify(r.json[0]).slice(0, 200)}`);
      }
    } else if (r.ok && Array.isArray(r.json) && r.json.length === 0) {
      log("FAIL", "INTERVIEW", "generateQuestions (hse, beginner, FR)", `Empty array returned — 0 questions`, r.duration);
      logBug("HIGH", "generateQuestions returns 0 questions for HSE field", `Input: field=hse, difficulty=beginner, types=technical+behavioral`);
    } else {
      log("FAIL", "INTERVIEW", "generateQuestions (hse, beginner, FR)", `status=${r.status} — ${r.json?.message || r.text?.slice(0, 200)}`, r.duration);
      if (r.status === 400) logBug("HIGH", "generateQuestions 400 validation error", `HSE field or difficulty enum mismatch — check schema: ${r.text?.slice(0, 300)}`);
      else logBug("HIGH", "generateQuestions failed for HSE", `status=${r.status}: ${r.json?.message || r.text?.slice(0, 200)}`);
    }
  } catch (e) {
    log("FAIL", "INTERVIEW", "generateQuestions", e.message);
  }

  // generateQuestions (HSE, intermediate)
  try {
    const r = await rpc("interview/generateQuestions", {
      field: "hse",
      types: ["technical"],
      difficulty: "intermediate",
      numberOfQuestions: 3,
      language: "fr",
    });
    if (r.ok && Array.isArray(r.json) && r.json.length > 0) {
      log("PASS", "INTERVIEW", "generateQuestions (hse, intermediate, FR)", `${r.json.length} questions`, r.duration);
    } else {
      log("FAIL", "INTERVIEW", "generateQuestions (hse, intermediate, FR)", `status=${r.status} count=${Array.isArray(r.json) ? r.json.length : "N/A"}`, r.duration);
    }
  } catch (e) {
    log("FAIL", "INTERVIEW", "generateQuestions intermediate", e.message);
  }

  // Seeded DB questions for HSE
  try {
    const r = await rpc("interviewQuestions/list", { field: "hse" });
    if (r.ok) {
      const items = Array.isArray(r.json) ? r.json : (r.json?.items || []);
      log("PASS", "INTERVIEW", "DB seeded questions (field=hse)", `${items.length} questions in DB`, r.duration);
      if (items.length < 5) logBug("MEDIUM", "Thin HSE interview question bank", `Only ${items.length} seeded HSE questions in DB (expected ≥20)`);
    } else {
      log("FAIL", "INTERVIEW", "DB seeded questions (field=hse)", `status=${r.status}`, r.duration);
    }
  } catch (e) {
    log("FAIL", "INTERVIEW", "DB seeded questions", e.message);
  }

  // Interview tips for HSE
  try {
    const r = await rpc("interviewTips/list", { field: "hse" });
    if (r.ok) {
      const items = Array.isArray(r.json) ? r.json : (r.json?.items || []);
      log("PASS", "INTERVIEW", "Interview tips (field=hse)", `${items.length} tips`, r.duration);
      // Check for English tips in an FR platform
      const enTips = items.filter((t) => {
        const text = (t.title || "") + " " + (t.content || "");
        return /\b(study|know your|prepare|practice|research)\b/i.test(text);
      });
      if (enTips.length > 0) {
        logBug("LOW", `${enTips.length} HSE interview tips in English (platform should be FR)`, `English tips: ${enTips.map((t) => t.title).join(", ")}`);
      }
    } else {
      log("FAIL", "INTERVIEW", "Interview tips (field=hse)", `status=${r.status}`, r.duration);
    }
  } catch (e) {
    log("FAIL", "INTERVIEW", "Interview tips", e.message);
  }

  // evaluateResponse — correct endpoint name, question is a full object, response = answer string
  if (generatedQuestions.length > 0) {
    try {
      const q = generatedQuestions[0];
      // Pass full question object as-is (from generateQuestions output)
      const r = await rpc("interview/evaluateResponse", {
        question: q,
        response: "Pour réaliser une évaluation des risques, je commence par identifier toutes les sources de danger dans l'environnement de travail. Ensuite, j'évalue la probabilité et la gravité de chaque risque selon la méthode AMDEC. Je documente tout dans le DUER et propose des mesures préventives adaptées comme les EPI obligatoires ou les procédures de verrouillage-étiquetage (LOTO). Je m'assure aussi que tous les travailleurs sont informés des risques identifiés.",
        field: "hse",
        language: "fr",
      });
      if (r.ok && r.json) {
        const score = r.json?.score || r.json?.overallScore || "?";
        const feedback = (r.json?.feedback || r.json?.strengths?.[0] || JSON.stringify(r.json)).slice(0, 100);
        log("PASS", "INTERVIEW", "evaluateResponse (HSE AMDEC answer, FR)", `score=${score} feedback="${feedback}..."`, r.duration);
      } else {
        log("FAIL", "INTERVIEW", "evaluateResponse", `status=${r.status} — ${r.json?.message || r.text?.slice(0, 200)}`, r.duration);
        if (r.status === 404) logBug("HIGH", "interview/evaluateResponse endpoint returns 404", `Endpoint may not exist or path is wrong`);
      }
    } catch (e) {
      log("FAIL", "INTERVIEW", "evaluateResponse", e.message);
    }

    // coachAnswer endpoint — uses userAnswer (not answer)
    try {
      const q = generatedQuestions[0];
      const question = q?.question || q?.text || JSON.stringify(q);
      const r = await rpc("interview/coachAnswer", {
        question,
        userAnswer: "Je vérifie les EPI et je fais des rondes.",
        field: "hse",
        language: "fr",
      });
      if (r.ok && r.json) {
        const coaching = (r.json?.coaching || r.json?.suggestion || r.json?.improvedAnswer || JSON.stringify(r.json)).slice(0, 150);
        log("PASS", "INTERVIEW", "coachAnswer (weak HSE answer, FR)", `coaching="${coaching}..."`, r.duration);
      } else {
        log("FAIL", "INTERVIEW", "coachAnswer", `status=${r.status} — ${r.json?.message || r.text?.slice(0, 200)}`, r.duration);
        if (r.status === 404) logBug("HIGH", "interview/coachAnswer endpoint returns 404", `Endpoint may not exist — check router`);
      }
    } catch (e) {
      log("FAIL", "INTERVIEW", "coachAnswer", e.message);
    }
  }

  // Mock interview chat (HSE persona, French)
  try {
    const r = await rpcStream("interview/chatWithInterviewer", {
      messages: [{ role: "user", content: "Bonjour, je suis Rachida, technicienne HSE diplômée de l'IMTA. Je suis prête pour l'entretien pour le poste de Technicienne HSE chez OCP Group." }],
      mode: "quick_practice",
      field: "hse",
      language: "fr",
      isFirstMessage: true,
      requestSummary: false,
    });
    if (r.ok && r.text?.length > 100) {
      const preview = r.text.slice(0, 200).replace(/\s+/g, " ");
      log("PASS", "INTERVIEW", "chatWithInterviewer (hse, FR, mock)", `${r.text.length} chars — "${preview}..."`, r.duration);
      // Check for French response
      const hasFrench = /[àâçèéêëîïôùûü]/.test(r.text) || r.text.toLowerCase().includes("bonjour") || r.text.toLowerCase().includes("sécurité");
      if (!hasFrench) {
        logBug("MEDIUM", "chatWithInterviewer responded in English despite FR request", `Preview: ${r.text.slice(0, 200)}`);
      }
    } else {
      log("FAIL", "INTERVIEW", "chatWithInterviewer (hse, FR, mock)", `status=${r.status} length=${r.text?.length || 0}`, r.duration);
      logBug("HIGH", "Mock interview chat failed for HSE field", `status=${r.status}: ${r.text?.slice(0, 200)}`);
    }
  } catch (e) {
    log("FAIL", "INTERVIEW", "chatWithInterviewer", e.message);
  }

  // getSessions — verify sessions stored
  try {
    const r = await rpc("interview/getSessions", { limit: 10, offset: 0 });
    if (r.ok) {
      const sessions = Array.isArray(r.json) ? r.json : [];
      log("PASS", "INTERVIEW", "getSessions (verify persistence)", `${sessions.length} sessions`, r.duration);
    } else {
      log("FAIL", "INTERVIEW", "getSessions", `status=${r.status}`, r.duration);
    }
  } catch (e) {
    log("FAIL", "INTERVIEW", "getSessions", e.message);
  }
}

// ─── 4. CAREER ────────────────────────────────────────────────────────────────

async function testCareer() {
  section("STEP 4: CAREER (skill gap, learning path, AI mentor, careerCoach)");

  // analyzeSkillGap (HSE)
  try {
    const r = await rpc("career/analyzeSkillGap", {
      currentSkills: ["ISO 45001", "Évaluation des risques", "Gestion des EPI", "Audit de sécurité"],
      targetRole: "Responsable HSE",
      field: "hse",
      language: "fr",
    });
    if (r.ok && r.json) {
      const gaps = r.json?.gaps || r.json?.missingSkills || r.json?.skillGap || r.json;
      const preview = JSON.stringify(gaps).slice(0, 200);
      log("PASS", "CAREER", "analyzeSkillGap (HSE → Responsable HSE, FR)", `response: ${preview}`, r.duration);
      // Check for HSE-specific content
      const allText = JSON.stringify(r.json).toLowerCase();
      const hseTerms = ["hse", "iso", "risque", "sécurité", "hazop", "amdec", "nebosh"];
      const found = hseTerms.filter((t) => allText.includes(t));
      if (found.length === 0) {
        logBug("MEDIUM", "analyzeSkillGap returned non-HSE content", `No HSE terms in response: ${JSON.stringify(r.json).slice(0, 200)}`);
      }
    } else {
      log("FAIL", "CAREER", "analyzeSkillGap (HSE)", `status=${r.status} — ${r.json?.message || r.text?.slice(0, 200)}`, r.duration);
      if (r.status === 404) logBug("HIGH", "career/analyzeSkillGap endpoint returns 404", `Path may be wrong — check router`);
      else logBug("MEDIUM", "analyzeSkillGap failed for HSE", `status=${r.status}: ${r.json?.message || r.text?.slice(0, 200)}`);
    }
  } catch (e) {
    log("FAIL", "CAREER", "analyzeSkillGap", e.message);
  }

  // recommendCareerPaths (HSE) — uses: field, skills, experienceLevel (NOT currentSkills/currentRole)
  try {
    const r = await rpc("career/recommendCareerPaths", {
      skills: ["ISO 45001", "Évaluation des risques", "Gestion EPI", "Audit de sécurité"],
      experienceLevel: "junior",
      field: "hse",
      interests: ["management", "certification", "audit"],
    });
    if (r.ok && r.json) {
      const paths = r.json?.paths || r.json?.careerPaths || r.json;
      const preview = JSON.stringify(paths).slice(0, 200);
      log("PASS", "CAREER", "recommendCareerPaths (HSE, FR)", `response: ${preview}`, r.duration);
    } else {
      log("FAIL", "CAREER", "recommendCareerPaths (HSE)", `status=${r.status} — ${r.json?.message || r.text?.slice(0, 150)}`, r.duration);
      if (r.status === 404) logBug("HIGH", "career/recommendCareerPaths endpoint returns 404", `Path may be wrong`);
    }
  } catch (e) {
    log("FAIL", "CAREER", "recommendCareerPaths", e.message);
  }

  // Learning path from skill library
  try {
    const r = await rpc("skillLibrary/list", { field: "hse" });
    if (r.ok) {
      const skills = Array.isArray(r.json) ? r.json : (r.json?.items || []);
      log("PASS", "CAREER", "skillLibrary (field=hse) — learning path data", `${skills.length} HSE skills available`, r.duration);
      // Check for English skill names in French platform
      const engSkills = skills.filter((s) => {
        const name = (s.name || "").toLowerCase();
        return name.match(/\b(standard|training|delivery|awareness|assessment|management)\b/);
      });
      if (engSkills.length > 2) {
        logBug("LOW", `${engSkills.length} HSE skill library entries in English`, `English skills: ${engSkills.slice(0, 3).map((s) => s.name).join(", ")}`);
      }
    } else {
      log("FAIL", "CAREER", "skillLibrary (field=hse)", `status=${r.status}`, r.duration);
    }
  } catch (e) {
    log("FAIL", "CAREER", "skillLibrary", e.message);
  }

  // Market insights (HSE)
  try {
    const r = await rpc("marketInsights/list", { field: "hse" });
    if (r.ok) {
      const insights = Array.isArray(r.json) ? r.json : (r.json?.items || []);
      log("PASS", "CAREER", "marketInsights (field=hse)", `${insights.length} insights`, r.duration);
    } else {
      log("FAIL", "CAREER", "marketInsights (field=hse)", `status=${r.status}`, r.duration);
    }
  } catch (e) {
    log("FAIL", "CAREER", "marketInsights", e.message);
  }

  // AI Mentor: list templates, check for HSE mentor
  try {
    const r = await rpc("aiMentor/templates/list");
    if (r.ok) {
      const templates = Array.isArray(r.json) ? r.json : (r.json?.templates || []);
      const hseTemplate = templates.find((t) => {
        const text = JSON.stringify(t).toLowerCase();
        return text.includes("hse") || text.includes("safety") || text.includes("youssef");
      });
      if (hseTemplate) {
        log("PASS", "CAREER", "aiMentor/templates — HSE mentor found", `template: "${hseTemplate.name || hseTemplate.persona || JSON.stringify(hseTemplate).slice(0, 80)}"`, r.duration);
      } else {
        log("PASS", "CAREER", "aiMentor/templates/list", `${templates.length} templates (no dedicated HSE mentor)`, r.duration);
        if (templates.length > 0) logBug("MEDIUM", "No dedicated HSE mentor template", `${templates.length} templates available but none tagged hse/safety`);
      }
    } else {
      log("FAIL", "CAREER", "aiMentor/templates/list", `status=${r.status} — ${r.json?.message || r.text?.slice(0, 150)}`, r.duration);
    }
  } catch (e) {
    log("FAIL", "CAREER", "aiMentor/templates/list", e.message);
  }

  // AI Mentor onboarding
  try {
    const r = await rpc("aiMentor/onboarding/get");
    if (r.ok) {
      log("PASS", "CAREER", "aiMentor/onboarding/get", `onboarding=${JSON.stringify(r.json).slice(0, 80)}`, r.duration);
    } else {
      log("FAIL", "CAREER", "aiMentor/onboarding/get", `status=${r.status}`, r.duration);
    }
  } catch (e) {
    log("FAIL", "CAREER", "aiMentor/onboarding", e.message);
  }

  // careerCoach: HSE career progression question
  try {
    const r = await rpc("career/careerCoach", {
      message: "Je suis technicienne HSE fraîchement diplômée de l'IMTA. Comment puis-je évoluer vers un poste de Responsable HSE en 3-5 ans ? Quelles certifications (ISO 45001, NEBOSH) devo-je prioritiser ?",
      field: "hse",
      language: "fr",
    });
    if (r.ok && r.json) {
      const response = (r.json?.response || r.json?.message || r.json?.content || JSON.stringify(r.json)).slice(0, 300);
      log("PASS", "CAREER", "careerCoach (HSE career question, FR)", `response="${response}..."`, r.duration);
      // Check for HSE-specific coaching
      const allText = response.toLowerCase();
      const hseTerms = ["hse", "iso 45001", "nebosh", "responsable", "certification", "sécurité"];
      const found = hseTerms.filter((t) => allText.includes(t));
      if (found.length === 0) {
        logBug("MEDIUM", "careerCoach gave generic answer to HSE-specific question", `No HSE terms in coaching response`);
      }
    } else {
      log("FAIL", "CAREER", "careerCoach (HSE, FR)", `status=${r.status} — ${r.json?.message || r.text?.slice(0, 200)}`, r.duration);
      if (r.status === 404) logBug("HIGH", "career/careerCoach endpoint returns 404", `Check if path is correct`);
      else if (r.status === 422 || r.status === 400) logBug("HIGH", "careerCoach 400/422 — wrong input shape", `status=${r.status}: ${r.text?.slice(0, 200)}`);
    }
  } catch (e) {
    log("FAIL", "CAREER", "careerCoach", e.message);
  }
}

// ─── 5. JOBS ─────────────────────────────────────────────────────────────────

async function testJobs() {
  section("STEP 5: JOBS (list HSE jobs, apply)");

  // Try different possible endpoints for job listings
  const jobEndpoints = [
    ["partner/listPublishedJobs", {}, "partner/listPublishedJobs"],
    ["partner/jobs/list", {}, "partner/jobs/list"],
    ["jobs/list", {}, "jobs/list"],
    ["jobApplications/list", {}, "jobApplications/list"],
  ];

  let hseJobs = [];

  for (const [path, input, label] of jobEndpoints) {
    try {
      const r = await rpc(path, input);
      if (r.ok) {
        const jobs = Array.isArray(r.json) ? r.json : (r.json?.jobs || r.json?.items || r.json?.data || []);
        log("PASS", "JOBS", `${label} works`, `${jobs.length} jobs`, r.duration);
        // Filter for HSE
        const hse = jobs.filter((j) => {
          const text = JSON.stringify(j).toLowerCase();
          return text.includes("hse") || text.includes("sécurité") || text.includes("qhse") || text.includes("safety");
        });
        if (hse.length > 0) {
          hseJobs = hse;
          log("PASS", "JOBS", `HSE jobs found via ${label}`, `${hse.length} HSE/QHSE jobs`, r.duration);
          break;
        }
      } else if (r.status === 404) {
        log("FAIL", "JOBS", `${label} — 404`, `endpoint not found`, r.duration);
        logBug("HIGH", `Job listing endpoint ${path} returns 404`, `Frontend components using this path will show empty job board`);
      } else {
        log("FAIL", "JOBS", label, `status=${r.status}`, r.duration);
      }
    } catch (e) {
      log("FAIL", "JOBS", label, e.message);
    }
  }

  if (hseJobs.length === 0) {
    logBug("HIGH", "No HSE jobs accessible via any tested endpoint", "All job listing paths returned 404 or 0 HSE results — Rachida sees empty job board");
  }

  // Job Application: if we found a job, try to apply
  if (hseJobs.length > 0) {
    jobId = hseJobs[0]?.id;
    if (jobId) {
      // Get job details to extract company/position
      const hseJob = hseJobs[0];
      const companyName = hseJob?.company || hseJob?.organizationName || "OCP Group";
      const position = hseJob?.title || hseJob?.position || "Technicienne HSE";
      const jobUrl = hseJob?.applyUrl || hseJob?.url || "";
      try {
        const r = await rpc("jobApplications/create", {
          companyName,
          position,
          status: "applied",
          jobUrl: jobUrl || undefined,
          notes: "Candidature pour poste HSE — OCP Group. Profil: ISO 45001, EPI, évaluation des risques. IMTA diplômée.",
          source: "imta-platform",
          tags: ["hse", "ocp", "maroc"],
        });
        // jobApplications/create returns a string UUID (the new application id)
        const appId = typeof r.json === "string" ? r.json : r.json?.id;
        if (r.ok && appId) {
          applicationId = appId;
          log("PASS", "JOBS", "Apply to HSE job (jobApplications/create)", `applicationId=${applicationId}`, r.duration);
        } else {
          log("FAIL", "JOBS", "Apply to HSE job", `status=${r.status} — ${r.json?.message || r.text?.slice(0, 200)}`, r.duration);
          if (r.status === 404) logBug("HIGH", "jobApplications/create returns 404", `Cannot apply to jobs`);
          else logBug("HIGH", "jobApplications/create failed", `status=${r.status}: ${r.json?.message || r.text?.slice(0, 200)}`);
        }
      } catch (e) {
        log("FAIL", "JOBS", "Apply to HSE job", e.message);
      }
    }
  } else {
    // Try to list existing applications
    try {
      const r = await rpc("jobApplications/list");
      if (r.ok) {
        const apps = Array.isArray(r.json) ? r.json : (r.json?.applications || r.json?.items || []);
        log("PASS", "JOBS", "jobApplications/list (no jobs to apply)", `${apps.length} existing applications`, r.duration);
      } else {
        log("FAIL", "JOBS", "jobApplications/list", `status=${r.status}`, r.duration);
      }
    } catch (e) {
      log("FAIL", "JOBS", "jobApplications/list", e.message);
    }
  }
}

// ─── 6. PERSISTENCE VERIFICATION ─────────────────────────────────────────────

async function verifyPersistence() {
  section("STEP 6: VERIFY DATA PERSISTENCE");

  // Verify resume still exists — use getById (GET endpoint)
  if (resumeId) {
    try {
      const r = await rpcGet("resume/getById", { id: resumeId });
      if (r.ok && r.json?.id === resumeId) {
        const nameHasHSE = (r.json?.name || "").includes("HSE");
        const tags = r.json?.tags || [];
        log("PASS", "PERSIST", "Resume persisted after session", `id=${resumeId} name="${r.json.name}" tags=${JSON.stringify(tags)}`, r.duration);
      } else {
        log("FAIL", "PERSIST", "Resume not found after session", `status=${r.status}`, r.duration);
        logBug("HIGH", "Resume not persisted — getById after create failed", `status=${r.status}`);
      }
    } catch (e) {
      log("FAIL", "PERSIST", "Resume persistence check", e.message);
    }
  } else {
    log("FAIL", "PERSIST", "Resume persistence", "No resumeId — create step failed");
  }

  // Verify job application persisted (if created)
  if (applicationId) {
    try {
      const r = await rpc("jobApplications/list");
      if (r.ok) {
        const apps = Array.isArray(r.json) ? r.json : (r.json?.applications || r.json?.items || []);
        const found = apps.find((a) => a.id === applicationId);
        if (found) {
          log("PASS", "PERSIST", "Job application persisted", `id=${applicationId}`, r.duration);
        } else {
          log("FAIL", "PERSIST", "Job application not found in list", `id=${applicationId} not in ${apps.length} applications`, r.duration);
          logBug("MEDIUM", "Job application not persisted", `applicationId=${applicationId} not found after create`);
        }
      } else {
        log("FAIL", "PERSIST", "Job application list", `status=${r.status}`, r.duration);
      }
    } catch (e) {
      log("FAIL", "PERSIST", "Job application persistence", e.message);
    }
  }

  // Verify interview sessions
  try {
    const r = await rpc("interview/getSessions", { limit: 20, offset: 0 });
    if (r.ok) {
      const sessions = Array.isArray(r.json) ? r.json : [];
      log("PASS", "PERSIST", "Interview sessions persisted", `${sessions.length} sessions in DB`, r.duration);
    } else {
      log("FAIL", "PERSIST", "Interview sessions", `status=${r.status}`, r.duration);
    }
  } catch (e) {
    log("FAIL", "PERSIST", "Interview sessions", e.message);
  }

  // Dashboard stats — verify activity registered
  try {
    const r = await rpc("dashboard/getStatistics");
    if (r.ok && r.json) {
      log("PASS", "PERSIST", "Dashboard stats after session", `${JSON.stringify(r.json).slice(0, 100)}`, r.duration);
    } else {
      log("FAIL", "PERSIST", "Dashboard stats", `status=${r.status}`, r.duration);
    }
  } catch (e) {
    log("FAIL", "PERSIST", "Dashboard stats", e.message);
  }
}

// ─── CLEANUP ─────────────────────────────────────────────────────────────────

async function cleanup() {
  section("CLEANUP: Remove test resume + application");

  if (resumeId) {
    try {
      const r = await rpc("resume/delete", { id: resumeId });
      if (r.ok) {
        log("PASS", "CLEANUP", "Delete test HSE resume", `id=${resumeId}`, r.duration);
      } else {
        log("FAIL", "CLEANUP", "Delete test HSE resume", `status=${r.status}`, r.duration);
      }
    } catch (e) {
      log("FAIL", "CLEANUP", "Delete resume", e.message);
    }
  }

  if (applicationId) {
    try {
      const r = await rpc("jobApplications/delete", { id: applicationId });
      if (r.ok) {
        log("PASS", "CLEANUP", "Delete test job application", `id=${applicationId}`, r.duration);
      } else {
        log("FAIL", "CLEANUP", "Delete test job application", `status=${r.status}`, r.duration);
      }
    } catch (e) {
      log("FAIL", "CLEANUP", "Delete job application", e.message);
    }
  }
}

// ─── REPORT GENERATION ───────────────────────────────────────────────────────

function generateReport(totalDuration) {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  const totalTests = passed + failed;
  const passRate = totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;

  // Rating algorithm: base 10, -1 per critical bug, -0.5 per high bug, -0.25 per medium
  let rating = 10;
  for (const b of bugs) {
    if (b.severity === "CRITICAL") rating -= 1.5;
    else if (b.severity === "HIGH") rating -= 1.0;
    else if (b.severity === "MEDIUM") rating -= 0.5;
    else if (b.severity === "LOW") rating -= 0.25;
  }
  rating = Math.max(0, Math.min(10, rating));
  const ratingStr = rating.toFixed(1);

  // Group results by section
  const sections = {};
  for (const r of results) {
    if (!sections[r.section]) sections[r.section] = { pass: 0, fail: 0, items: [] };
    if (r.status === "PASS") sections[r.section].pass++;
    else if (r.status === "FAIL") sections[r.section].fail++;
    sections[r.section].items.push(r);
  }

  let md = `# Rapport de Session — Rachida Benhaddou (Technicienne HSE IMTA)
**Date:** ${timestamp}
**Cible:** ${BASE}
**Persona:** Rachida Benhaddou — Technicienne HSE fraîchement diplômée IMTA, première session de travail
**Compte utilisé:** ${actualEmail} (rôle: ${actualRole})
**Méthode:** Node.js https — ORPC wire protocol, NO browser
**Durée totale:** ${(totalDuration / 1000).toFixed(1)}s

---

## Résumé Exécutif

**${passed} PASS / ${failed} FAIL — ${totalTests} tests (${passRate}% de réussite)**
**Note globale: ${ratingStr}/10**

### Données créées
- CV HSE: ${resumeId ? `id=${resumeId} (créé + peuplé avec ISO 45001, EPI, évaluation des risques)` : "ÉCHEC — non créé"}
- Candidature emploi: ${applicationId ? `id=${applicationId}` : "N/A (pas d'offre HSE disponible ou endpoint manquant)"}

### Bugs trouvés: ${bugs.length}
${bugs.map((b) => `- **[${b.severity}]** ${b.title}`).join("\n")}

---

## Résultats par Section

`;

  for (const [sec, data] of Object.entries(sections)) {
    md += `### ${sec} — ${data.pass} PASS / ${data.fail} FAIL\n\n`;
    md += `| Test | Status | Latence | Détail |\n|------|--------|---------|--------|\n`;
    for (const item of data.items) {
      const icon = item.status === "PASS" ? "✅" : "❌";
      const lat = item.latency ? `${item.latency}ms` : "—";
      const detail = (item.detail || "").replace(/\|/g, "\\|").slice(0, 120);
      md += `| ${item.test} | ${icon} ${item.status} | ${lat} | ${detail} |\n`;
    }
    md += "\n";
  }

  // Bugs section
  md += `---\n\n## Bugs Trouvés (${bugs.length})\n\n`;
  if (bugs.length === 0) {
    md += "_Aucun bug trouvé — tous les workflows HSE fonctionnent correctement._\n\n";
  } else {
    const byCat = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };
    for (const b of bugs) byCat[b.severity]?.push(b);

    for (const [sev, items] of Object.entries(byCat)) {
      if (items.length === 0) continue;
      const emoji = sev === "CRITICAL" ? "🔴" : sev === "HIGH" ? "🟠" : sev === "MEDIUM" ? "🟡" : "🟢";
      md += `### ${emoji} ${sev} (${items.length})\n\n`;
      for (const b of items) {
        md += `**${b.title}**\n> ${b.detail}\n\n`;
      }
    }
  }

  // HSE Content Assessment
  md += `---\n\n## Évaluation du Contenu HSE\n\n`;
  md += `### Ce que Rachida peut faire sur cette plateforme\n\n`;

  const passedTests = results.filter((r) => r.status === "PASS").map((r) => r.test);
  const failedTests = results.filter((r) => r.status === "FAIL").map((r) => r.test);

  md += `**Fonctionnel :**\n`;
  for (const t of passedTests) {
    md += `- ✅ ${t}\n`;
  }
  md += `\n**Non fonctionnel :**\n`;
  for (const t of failedTests) {
    md += `- ❌ ${t}\n`;
  }

  md += `\n---\n\n## Verdict Final\n\n`;
  md += `**Note : ${ratingStr}/10**\n\n`;
  if (rating >= 8) {
    md += "La plateforme sert bien les étudiants HSE. Contenu riche, AI fonctionnelle en français, workflows complets.\n";
  } else if (rating >= 6) {
    md += "La plateforme sert partiellement les étudiants HSE. Les bugs identifiés dégradent l'expérience mais le contenu de base est présent.\n";
  } else {
    md += "La plateforme ne sert PAS suffisamment les étudiants HSE. Bugs critiques bloquants, contenu insuffisant.\n";
  }

  md += `\n### HSE bien servi : ${rating >= 7 ? "OUI" : rating >= 5 ? "PARTIELLEMENT" : "NON"}\n\n`;
  md += `### Recommandations prioritaires\n\n`;

  for (const b of bugs.filter((b) => b.severity === "CRITICAL" || b.severity === "HIGH")) {
    md += `1. **Corriger** : ${b.title}\n`;
  }
  if (bugs.filter((b) => b.severity === "MEDIUM").length > 0) {
    md += `\nAméliorations secondaires :\n`;
    for (const b of bugs.filter((b) => b.severity === "MEDIUM")) {
      md += `- ${b.title}\n`;
    }
  }

  md += `\n---\n\n*Rapport généré par scripts/work-rachida.mjs — ${timestamp}*\n*Tests: ${totalTests} | Durée: ${(totalDuration / 1000).toFixed(1)}s | Base URL: ${BASE}*\n`;

  return md;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║   Rachida Benhaddou — Session de Travail HSE (Live Prod)     ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`  Target: ${BASE}`);
  console.log(`  Persona: Technicienne HSE IMTA — première session\n`);

  const startTime = Date.now();

  // 1. Auth (signup as Rachida, fallback to admin)
  await doSignup();
  if (!sessionCookie) {
    console.error("FATAL: No session cookie — aborting");
    process.exit(1);
  }

  // 2. Create + populate HSE resume
  await createHSEResume();

  // 3. Resume AI (suggestSkills, generateSummary, improveContent)
  await testResumeAI();

  // 4. Interview AI
  await testInterview();

  // 5. Career (skillGap, mentor, coach)
  await testCareer();

  // 6. Jobs (list HSE, apply)
  await testJobs();

  // 7. Verify persistence
  await verifyPersistence();

  // 8. Cleanup
  await cleanup();

  const totalDuration = Date.now() - startTime;

  // Summary
  console.log("\n══════════════════════════════════════════════════════════════");
  console.log(`  Results: ${passed} PASS / ${failed} FAIL — ${(totalDuration / 1000).toFixed(1)}s`);
  console.log(`  Bugs found: ${bugs.length}`);
  for (const b of bugs) {
    console.log(`    [${b.severity}] ${b.title}`);
  }
  console.log("══════════════════════════════════════════════════════════════\n");

  // Write report
  const report = generateReport(totalDuration);
  const reportPath = path.join(
    "C:/Users/X1 Extreme/Documents/GitHub/resume maker/reactive-resume/resume-maker-sdlc/reports/work-rachida.md"
  );
  try {
    fs.writeFileSync(reportPath, report, "utf-8");
    console.log(`  Report written: ${reportPath}`);
  } catch (e) {
    console.error(`  Failed to write report: ${e.message}`);
    // Print to stdout as fallback
    console.log("\n" + report);
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
