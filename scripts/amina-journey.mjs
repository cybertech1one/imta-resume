/**
 * Amina Benali's User Journey - Full simulation of a real IMTA nursing graduate
 * building her first resume and using the career platform.
 *
 * ORPC URL pattern: POST /api/rpc/{router}/{method} with body {json: <input>}
 * For nested routers: /api/rpc/{parent}/{child}/{method}
 */

const BASE = "http://localhost:3040";
let cookies = "";

async function signIn() {
  console.log("\n=== STEP 0: Signing in as student1@test.com ===");
  const res = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE },
    body: JSON.stringify({ email: "student1@test.com", password: "TestAccount123!" }),
    redirect: "manual",
  });
  const raw = res.headers.get("set-cookie");
  cookies = raw ? raw.split(";")[0] : "";
  const body = await res.json().catch(() => null);
  console.log(`  Status: ${res.status}`);
  console.log(`  User: ${body?.user?.name} (${body?.user?.email})`);
  if (!cookies) {
    console.error("  ERROR: No cookies. Is the server running?");
    process.exit(1);
  }
  return body;
}

/**
 * ORPC wire format helper: finds Date values in input and builds meta array.
 * Meta format: [[1, ...pathSegments]] where 1 = DATE type constant.
 */
function buildMeta(input, path = []) {
  const meta = [];
  if (input === null || input === undefined) return meta;
  if (typeof input !== "object") return meta;
  for (const [key, val] of Object.entries(input)) {
    if (val instanceof Date) {
      meta.push([1, ...path, key]);
    } else if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val) && key.match(/Date|At$/i)) {
      // Auto-detect ISO date strings in fields ending with Date or At
      meta.push([1, ...path, key]);
    } else if (Array.isArray(val)) {
      val.forEach((item, i) => {
        meta.push(...buildMeta(item, [...path, key, i]));
      });
    } else if (typeof val === "object") {
      meta.push(...buildMeta(val, [...path, key]));
    }
  }
  return meta;
}

async function rpc(path, input) {
  const url = `${BASE}/api/rpc/${path}`;
  const meta = buildMeta(input);
  const body = { json: input };
  if (meta.length > 0) body.meta = meta;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: BASE,
      Cookie: cookies,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function rpcGet(path, input) {
  let url = `${BASE}/api/rpc/${path}`;
  if (input) url += `?data=${encodeURIComponent(JSON.stringify({ json: input }))}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Origin: BASE, Cookie: cookies },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

// ========================================
// STEP 1: Build Resume
// ========================================
async function step1_buildResume() {
  console.log("\n" + "=".repeat(60));
  console.log("STEP 1: Building Amina's Resume");
  console.log("=".repeat(60));

  // Check if resume already exists
  console.log("\n--- 1a. Checking for existing resumes ---");
  const listResult = await rpcGet("resume/list");
  let resumeId;
  if (listResult.data?.json) {
    const existing = listResult.data.json.find(r => r.slug === "cv-amina-benali-infirmiere");
    if (existing) {
      resumeId = existing.id;
      console.log(`  Found existing resume: ${resumeId} (${existing.name})`);
    }
  }

  if (!resumeId) {
    console.log("\n--- 1a. Creating resume ---");
    const createResult = await rpc("resume/create", {
      name: "CV Amina Benali - Infirmiere",
      slug: "cv-amina-benali-infirmiere",
      tags: ["nursing", "healthcare", "internship"],
      withSampleData: false,
    });
    console.log(`  Create status: ${createResult.status}`);
    if (createResult.status === 200 && createResult.data?.json) {
      resumeId = createResult.data.json;
      console.log(`  Resume ID: ${resumeId}`);
    } else {
      console.error("  ERROR creating resume:", JSON.stringify(createResult.data));
      process.exit(1);
    }
  }

  // 1b. Update with full data
  console.log("\n--- 1b. Updating resume with Amina's data ---");
  const resumeData = {
    picture: {
      hidden: false, url: "", size: 80, rotation: 0, aspectRatio: 1,
      borderRadius: 50, borderColor: "rgba(0, 0, 0, 0.1)", borderWidth: 2,
      shadowColor: "rgba(0, 0, 0, 0.1)", shadowWidth: 0,
    },
    basics: {
      name: "Amina Benali",
      headline: "Infirmiere Polyvalente Diplomee | Soins aux Patients | IMTA Casablanca",
      email: "amina.benali@gmail.com",
      phone: "+212 661 234 567",
      location: "Casablanca, Maroc",
      website: { url: "", label: "" },
      customFields: [],
      cin: "",
      militaryServiceStatus: "not-applicable",
      dateOfBirth: "15/03/2004",
      nationality: "Marocaine",
      maritalStatus: "Celibataire",
    },
    summary: {
      title: "Profil",
      columns: 1,
      hidden: false,
      content: "<p>Jeune diplomee du programme Infirmier Polyvalent de l'IMTA Casablanca, je suis passionnee par les soins aux patients et la promotion de la sante. Mon stage de six mois au CHU Ibn Rochd m'a permis de developper des competences solides en soins de base, gestion des urgences et education therapeutique des patients. Rigoureuse, empathique et motivee, je recherche un poste d'infirmiere polyvalente pour mettre mes connaissances au service du bien-etre des patients.</p>",
    },
    sections: {
      profiles: { title: "Reseaux", columns: 1, hidden: true, items: [] },
      experience: {
        title: "Experience Professionnelle",
        columns: 1,
        hidden: false,
        items: [{
          id: "exp-chu-ibn-rochd",
          hidden: false,
          company: "CHU Ibn Rochd",
          position: "Stagiaire Infirmiere Polyvalente",
          location: "Casablanca, Maroc",
          period: "Janvier 2026 - Juin 2026",
          website: { url: "https://www.chuibnrochd.ma", label: "CHU Ibn Rochd" },
          description: "<ul><li>Prise en charge quotidienne de 15 a 20 patients dans le service de medecine interne</li><li>Realisation de soins de base : prise de tension, prelevements sanguins, injections, perfusions</li><li>Participation a la surveillance post-operatoire de patients en chirurgie generale</li><li>Education therapeutique des patients diabetiques sur l'autosurveillance glycemique</li><li>Collaboration avec l'equipe pluridisciplinaire (medecins, aides-soignants, kinesitherapeutes)</li><li>Gestion et distribution des medicaments selon les prescriptions medicales</li></ul>",
        }],
      },
      education: {
        title: "Formation",
        columns: 1,
        hidden: false,
        items: [
          {
            id: "edu-imta",
            hidden: false,
            school: "IMTA - Institut Medi Technology Avicenne",
            degree: "Diplome d'Infirmier Polyvalent",
            area: "Sciences Infirmieres",
            grade: "Bien",
            location: "Casablanca, Maroc",
            period: "2024 - 2026",
            website: { url: "", label: "" },
            description: "<ul><li>Formation theorique et pratique en soins infirmiers polyvalents</li><li>Modules : anatomie, pharmacologie, soins d'urgence, hygiene hospitaliere, ethique medicale</li><li>Projet de fin d'etudes : L'education therapeutique du patient diabetique en milieu hospitalier</li></ul>",
          },
          {
            id: "edu-bac",
            hidden: false,
            school: "Lycee Mohammed V",
            degree: "Baccalaureat Sciences de la Vie et de la Terre",
            area: "SVT",
            grade: "Assez Bien",
            location: "Casablanca, Maroc",
            period: "2021 - 2024",
            website: { url: "", label: "" },
            description: "",
          },
        ],
      },
      skills: {
        title: "Competences",
        columns: 2,
        hidden: false,
        items: [
          { id: "sk-1", hidden: false, icon: "", name: "Soins de base", proficiency: "Avance", level: 4, keywords: ["pansements", "injections", "perfusions", "toilette"] },
          { id: "sk-2", hidden: false, icon: "", name: "Prise de sang", proficiency: "Avance", level: 4, keywords: ["prelevements", "bilan sanguin", "NFS"] },
          { id: "sk-3", hidden: false, icon: "", name: "Urgences", proficiency: "Intermediaire", level: 3, keywords: ["premiers secours", "reanimation", "triage"] },
          { id: "sk-4", hidden: false, icon: "", name: "Hygiene hospitaliere", proficiency: "Avance", level: 4, keywords: ["protocoles", "asepsie", "sterilisation"] },
          { id: "sk-5", hidden: false, icon: "", name: "Education therapeutique", proficiency: "Intermediaire", level: 3, keywords: ["diabete", "observance", "prevention"] },
        ],
      },
      languages: {
        title: "Langues",
        columns: 2,
        hidden: false,
        items: [
          { id: "lang-ar", hidden: false, language: "Arabe", fluency: "Langue maternelle", level: 5 },
          { id: "lang-fr", hidden: false, language: "Francais", fluency: "Courant (C1)", level: 4 },
          { id: "lang-en", hidden: false, language: "Anglais", fluency: "Intermediaire (B1)", level: 3 },
          { id: "lang-am", hidden: false, language: "Amazighe", fluency: "Conversationnel", level: 3 },
        ],
      },
      interests: {
        title: "Centres d'interet",
        columns: 2,
        hidden: false,
        items: [
          { id: "int-1", hidden: false, icon: "", name: "Benevolat medical", keywords: ["Croissant-Rouge", "caravanes medicales"] },
          { id: "int-2", hidden: false, icon: "", name: "Lecture", keywords: ["sciences de la sante", "developpement personnel"] },
          { id: "int-3", hidden: false, icon: "", name: "Randonnee", keywords: ["Atlas", "plein air"] },
        ],
      },
      projects: { title: "Projets", columns: 1, hidden: true, items: [] },
      awards: { title: "Prix", columns: 1, hidden: true, items: [] },
      certifications: {
        title: "Certifications",
        columns: 1,
        hidden: false,
        items: [{
          id: "cert-secourisme",
          hidden: false,
          title: "Attestation de Secourisme (PSC1)",
          issuer: "Croissant-Rouge Marocain",
          date: "Mars 2025",
          website: { url: "", label: "" },
          description: "Formation aux gestes de premiers secours : reanimation cardio-pulmonaire, mise en position laterale de securite, utilisation du defibrillateur.",
        }],
      },
      publications: { title: "Publications", columns: 1, hidden: true, items: [] },
      volunteer: {
        title: "Benevolat",
        columns: 1,
        hidden: false,
        items: [{
          id: "vol-cr",
          hidden: false,
          organization: "Croissant-Rouge Marocain - Section Casablanca",
          location: "Casablanca, Maroc",
          period: "2024 - Present",
          website: { url: "", label: "" },
          description: "<ul><li>Participation a 3 caravanes medicales dans les zones rurales de la region de Casablanca-Settat</li><li>Prise de tension arterielle et glycemie capillaire pour plus de 200 beneficiaires</li><li>Sensibilisation a l'hygiene et a la prevention des maladies chroniques</li></ul>",
        }],
      },
      references: {
        title: "References",
        columns: 1,
        hidden: false,
        items: [{
          id: "ref-1",
          hidden: false,
          name: "Pr. Fatima Zahrae El Amrani",
          position: "Cadre Infirmier - CHU Ibn Rochd, Service de Medecine Interne",
          website: { url: "", label: "" },
          phone: "+212 522 123 456",
          description: "Reference professionnelle - Encadrante de stage pendant 6 mois au service de medecine interne.",
        }],
      },
      internships: {
        title: "Stages",
        columns: 1,
        hidden: false,
        items: [{
          id: "stage-chu",
          hidden: false,
          company: "CHU Ibn Rochd",
          position: "Stagiaire Infirmiere",
          supervisor: "Pr. Fatima Zahrae El Amrani",
          location: "Casablanca, Maroc",
          period: "Janvier 2026 - Juin 2026",
          type: "end-of-studies",
          website: { url: "https://www.chuibnrochd.ma", label: "CHU Ibn Rochd" },
          tasksPerformed: "<ul><li>Soins de base et surveillance des parametres vitaux</li><li>Administration de medicaments et gestion des perfusions</li><li>Prelevements sanguins et urinaires</li><li>Accompagnement des patients et soutien psychologique</li><li>Participation aux transmissions infirmieres</li></ul>",
          skillsAcquired: ["Soins infirmiers", "Communication patient", "Travail en equipe", "Gestion du stress", "Protocoles d'hygiene"],
          evaluation: "Tres bon stage. Amina fait preuve de serieux, d'empathie et d'une grande capacite d'apprentissage. Elle s'integre facilement dans l'equipe soignante.",
        }],
      },
    },
    customSections: [],
    metadata: {
      template: "onyx",
      layout: {
        sidebarWidth: 35,
        pages: [{
          fullWidth: false,
          main: ["summary", "experience", "internships", "education", "volunteer"],
          sidebar: ["skills", "languages", "certifications", "interests", "references"],
        }],
      },
      css: { enabled: false, value: "" },
      page: { gapX: 4, gapY: 6, marginX: 14, marginY: 12, format: "a4", locale: "fr-FR", hideIcons: false },
      design: {
        colors: { primary: "rgba(0, 105, 92, 1)", text: "rgba(0, 0, 0, 1)", background: "rgba(255, 255, 255, 1)" },
        level: { icon: "star", type: "circle" },
      },
      typography: {
        body: { fontFamily: "Inter", fontWeights: ["400", "500"], fontSize: 10, lineHeight: 1.5 },
        heading: { fontFamily: "Inter", fontWeights: ["600", "700"], fontSize: 14, lineHeight: 1.4 },
      },
      notes: "",
      businessCard: {
        enabled: false, showPhoto: true, showHeadline: true, showEmail: true, showPhone: false,
        showLocation: true, showSocialLinks: true, showWebsite: true, theme: "professional",
        accentColor: "#00695c", qrCodeMode: "url", showSummary: false,
      },
    },
  };

  const updateResult = await rpc("resume/update", { id: resumeId, data: resumeData });
  console.log(`  Update status: ${updateResult.status}`);
  if (updateResult.status !== 200) {
    console.log("  Error:", JSON.stringify(updateResult.data)?.slice(0, 500));
  } else {
    console.log("  Resume data updated successfully!");
    console.log("  - Name: Amina Benali");
    console.log("  - Headline: Infirmiere Polyvalente Diplomee | Soins aux Patients | IMTA Casablanca");
    console.log("  - Location: Casablanca, Maroc");
    console.log("  - Experience: CHU Ibn Rochd (6 months internship)");
    console.log("  - Education: IMTA (Diplome Infirmier Polyvalent) + Bac SVT");
    console.log("  - Skills: 5 nursing skills (Soins de base, Prise de sang, Urgences, Hygiene, Education therapeutique)");
    console.log("  - Languages: Arabe, Francais, Anglais, Amazighe");
    console.log("  - Certification: PSC1 Secourisme");
    console.log("  - Volunteer: Croissant-Rouge Marocain");
    console.log("  - Internship: CHU Ibn Rochd (stage de fin d'etudes)");
  }

  return resumeId;
}

// ========================================
// STEP 2: Try Different Templates
// ========================================
async function step2_tryTemplates(resumeId) {
  console.log("\n" + "=".repeat(60));
  console.log("STEP 2: Trying Different Templates");
  console.log("=".repeat(60));

  // 2a. Read the current resume
  console.log("\n--- 2a. Reading current resume ---");
  const readResult = await rpcGet("resume/getById", { id: resumeId });
  if (readResult.status !== 200) {
    console.log("  Error reading resume:", readResult.status);
    return;
  }
  const currentData = readResult.data?.json?.data;
  const currentTemplate = currentData?.metadata?.template;
  console.log(`  Current template: ${currentTemplate}`);

  // 2b. Switch to chikorita
  console.log("\n--- 2b. Switching to 'chikorita' template ---");
  const chikoData = JSON.parse(JSON.stringify(currentData));
  chikoData.metadata.template = "chikorita";
  const chiko = await rpc("resume/update", { id: resumeId, data: chikoData });
  console.log(`  Switch to chikorita: ${chiko.status === 200 ? "SUCCESS" : "FAILED (" + chiko.status + ")"}`);

  // Verify
  const v1 = await rpcGet("resume/getById", { id: resumeId });
  console.log(`  Verified template: ${v1.data?.json?.data?.metadata?.template}`);

  // 2c. Switch to casablanca
  console.log("\n--- 2c. Switching to 'casablanca' template ---");
  const casaData = JSON.parse(JSON.stringify(v1.data?.json?.data));
  casaData.metadata.template = "casablanca";
  const casa = await rpc("resume/update", { id: resumeId, data: casaData });
  console.log(`  Switch to casablanca: ${casa.status === 200 ? "SUCCESS" : "FAILED (" + casa.status + ")"}`);

  // Verify
  const v2 = await rpcGet("resume/getById", { id: resumeId });
  console.log(`  Verified template: ${v2.data?.json?.data?.metadata?.template}`);

  console.log("\n  TEMPLATE VERDICT (Amina's perspective):");
  console.log("  - onyx: Clean and professional but a bit generic for healthcare.");
  console.log("  - chikorita: More colorful, nice design, but too playful for a nursing CV.");
  console.log("  - casablanca: Perfect! Named after my city, elegant two-column layout,");
  console.log("    professional look that suits the medical field. Keeping this one!");
  console.log("  CHOICE: casablanca");
}

// ========================================
// STEP 3: Create Job Applications
// ========================================
async function step3_createApplications(resumeId) {
  console.log("\n" + "=".repeat(60));
  console.log("STEP 3: Creating Job Applications");
  console.log("=".repeat(60));

  const apps = [
    {
      label: "CHU Ibn Rochd Casablanca - Applied",
      data: {
        companyName: "CHU Ibn Rochd Casablanca",
        position: "Infirmiere Polyvalente",
        location: "Casablanca, Maroc",
        jobDescription: "Poste d'infirmiere polyvalente au service de medecine interne. CDI apres periode d'essai de 3 mois. Horaires : 3x8. Avantages : mutuelle, prime de garde.",
        status: "applied",
        source: "Candidature directe aupres du service RH",
        contactName: "Mme Khadija Lahlou",
        contactEmail: "rh@chuibnrochd.ma",
        notes: "J'ai fait mon stage ici pendant 6 mois, l'equipe me connait deja. Ma superviseure Pr. El Amrani m'a encouragee a postuler. Entretien prevu la semaine prochaine inchallah.",
        tags: ["hopital public", "medecine interne", "priorite"],
        priority: 5,
        isRemote: false,
        workType: "on-site",
        resumeId: resumeId,
      },
    },
    {
      label: "Clinique Cheikh Zayd - Wishlist",
      data: {
        companyName: "Clinique Cheikh Zayd",
        position: "Infirmiere de Nuit",
        location: "Rabat, Maroc",
        jobDescription: "Poste d'infirmiere de nuit dans une clinique privee de renom. Salaire attractif avec primes de nuit. Formation continue assuree.",
        status: "saved",
        source: "Annonce sur Emploi.ma",
        notes: "Belle clinique a Rabat mais il faudrait que je demenage. Le salaire est meilleur qu'au public. Je garde en favoris pour l'instant, je vais d'abord voir si j'ai le poste au CHU.",
        tags: ["clinique privee", "nuit", "Rabat"],
        priority: 3,
        isRemote: false,
        workType: "on-site",
      },
    },
    {
      label: "Hopital Militaire Mohammed V - Interview",
      data: {
        companyName: "Hopital Militaire Mohammed V",
        position: "Infirmiere Urgences",
        location: "Rabat, Maroc",
        jobDescription: "Poste d'infirmiere au service des urgences de l'Hopital Militaire. Contrat de la fonction publique. Concours d'entree suivi d'un entretien.",
        status: "interview",
        source: "Concours public - annonce au ministere de la Sante",
        contactName: "Service des Ressources Humaines",
        notes: "J'ai passe le concours ecrit la semaine derniere et je suis convoquee pour l'oral le 2 juin. Il faut que je prepare les questions sur les urgences et les protocoles. Tres stressee mais tres motivee, c'est un poste stable!",
        tags: ["hopital militaire", "urgences", "concours", "fonction publique"],
        priority: 4,
        isRemote: false,
        workType: "on-site",
      },
    },
  ];

  for (const app of apps) {
    console.log(`\n--- ${app.label} ---`);
    const result = await rpc("jobApplications/create", app.data);
    console.log(`  Status: ${result.status}, ID: ${result.data?.json || "error"}`);
    if (result.status !== 200) {
      console.log("  Error:", JSON.stringify(result.data)?.slice(0, 300));
    }
  }
}

// ========================================
// STEP 4: Set Career Goals
// ========================================
async function step4_createGoals() {
  console.log("\n" + "=".repeat(60));
  console.log("STEP 4: Setting Career Goals");
  console.log("=".repeat(60));

  // Goal 1: First nursing job
  console.log("\n--- 4a. Goal: Obtenir mon premier emploi d'infirmiere ---");
  const goal1 = await rpc("goals/create", {
    title: "Obtenir mon premier emploi d'infirmiere",
    description: "Decrocher un poste d'infirmiere polyvalente dans un hopital ou une clinique au Maroc dans les 3 mois suivant l'obtention de mon diplome. Priorite : Casablanca ou Rabat.",
    category: "career",
    status: "in_progress",
    priority: 5,
    targetDate: new Date("2026-08-26").toISOString(),
    progress: 40,
    tags: ["emploi", "infirmiere", "priorite"],
    metrics: [
      { name: "Candidatures envoyees", target: 10, current: 3 },
      { name: "Entretiens obtenus", target: 3, current: 1 },
      { name: "Offres recues", target: 1, current: 0 },
    ],
  });
  console.log(`  Status: ${goal1.status}, ID: ${goal1.data?.json || "error"}`);
  if (goal1.status !== 200) console.log("  Error:", JSON.stringify(goal1.data)?.slice(0, 300));
  const goal1Id = goal1.data?.json;

  // Goal 2: Emergency certification
  console.log("\n--- 4b. Goal: Obtenir la certification en soins d'urgence ---");
  const goal2 = await rpc("goals/create", {
    title: "Obtenir la certification en soins d'urgence",
    description: "Passer la certification AFGSU (Attestation de Formation aux Gestes et Soins d'Urgence) niveau 2, indispensable pour travailler aux urgences. Formation de 3 jours proposee par le CHU.",
    category: "education",
    status: "not_started",
    priority: 4,
    targetDate: new Date("2026-11-26").toISOString(),
    progress: 0,
    tags: ["certification", "urgences", "formation"],
    metrics: [
      { name: "Modules theoriques completes", target: 4, current: 0 },
      { name: "Heures de pratique", target: 21, current: 0 },
    ],
  });
  console.log(`  Status: ${goal2.status}, ID: ${goal2.data?.json || "error"}`);
  if (goal2.status !== 200) console.log("  Error:", JSON.stringify(goal2.data)?.slice(0, 300));

  // Add milestones to goal 1
  if (goal1Id) {
    console.log("\n--- 4c. Adding milestones to Goal 1 ---");
    const milestones = [
      { goalId: goal1Id, title: "Finaliser mon CV et ma lettre de motivation", description: "Creer un CV professionnel sur la plateforme et rediger une lettre de motivation type adaptable pour chaque candidature.", order: 1 },
      { goalId: goal1Id, title: "Postuler a 5 hopitaux et cliniques a Casablanca", description: "Envoyer des candidatures spontanees et repondre aux offres sur Emploi.ma, ReKrute, et les sites des hopitaux.", order: 2 },
      { goalId: goal1Id, title: "Preparer l'entretien a l'Hopital Militaire", description: "Reviser les protocoles d'urgence, les gestes de premiers secours, et preparer les reponses aux questions frequentes en entretien.", order: 3 },
      { goalId: goal1Id, title: "Demander des lettres de recommandation", description: "Contacter Pr. El Amrani et le responsable du Croissant-Rouge pour des lettres de recommandation officielles.", order: 4 },
      { goalId: goal1Id, title: "Accepter une offre d'emploi", description: "Comparer les offres recues (salaire, horaires, avantages, localisation) et accepter la meilleure proposition.", order: 5 },
    ];

    for (const ms of milestones) {
      const r = await rpc("goals/milestones/create", ms);
      console.log(`  Milestone: "${ms.title.slice(0, 45)}..." => ${r.status === 200 ? "OK" : "FAILED (" + r.status + ")"}`);
      if (r.status !== 200) console.log("    Error:", JSON.stringify(r.data)?.slice(0, 200));
    }

    // Toggle first milestone as completed (CV done!)
    console.log("\n  Marking first milestone as completed (CV is done!)...");
    const goalDetail = await rpcGet("goals/getById", { id: goal1Id });
    if (goalDetail.data?.json?.milestones?.length > 0) {
      const firstMs = goalDetail.data.json.milestones.find(m => m.order === 1) || goalDetail.data.json.milestones[0];
      if (firstMs) {
        const toggle = await rpc("goals/milestones/toggle", { id: firstMs.id, goalId: goal1Id });
        console.log(`  Toggle milestone "${firstMs.title.slice(0, 30)}...": ${toggle.status === 200 ? "COMPLETED" : "FAILED"}`);
      }
    }
  }
}

// ========================================
// STEP 5: Track Skills
// ========================================
async function step5_trackSkills() {
  console.log("\n" + "=".repeat(60));
  console.log("STEP 5: Tracking Skills");
  console.log("=".repeat(60));

  const skills = [
    { name: "Patient Care", nameFr: "Soins aux patients", category: "technical", rating: 4, targetRating: 5 },
    { name: "Venipuncture", nameFr: "Ponction veineuse / Prise de sang", category: "technical", rating: 4, targetRating: 5 },
    { name: "Emergency Response", nameFr: "Gestion des urgences", category: "technical", rating: 3, targetRating: 5 },
    { name: "Patient Communication", nameFr: "Communication avec le patient", category: "soft", rating: 4, targetRating: 5 },
  ];

  for (const skill of skills) {
    console.log(`\n  Adding: ${skill.nameFr} (${skill.category}, ${skill.rating}/5 -> target ${skill.targetRating}/5)`);
    const result = await rpc("career/userSkills/create", skill);
    console.log(`  Status: ${result.status}, ID: ${result.data?.json || "error"}`);
    if (result.status !== 200) console.log("    Error:", JSON.stringify(result.data)?.slice(0, 200));
  }

  // Verify
  console.log("\n  Verifying tracked skills...");
  const listResult = await rpcGet("career/userSkills/list");
  if (listResult.data?.json) {
    console.log(`  Total skills tracked: ${listResult.data.json.length}`);
    for (const s of listResult.data.json) {
      console.log(`  - ${s.nameFr}: ${s.rating}/${s.targetRating} (${s.category})`);
    }
  } else {
    console.log("  Could not verify skills:", listResult.status);
  }
}

// ========================================
// STEP 6: Amina's Experience Report
// ========================================
function step6_report() {
  console.log("\n" + "=".repeat(60));
  console.log("STEP 6: AMINA'S EXPERIENCE REPORT");
  console.log("=".repeat(60));

  console.log(`
========================================
RAPPORT D'EXPERIENCE - Amina Benali
Etudiante en soins infirmiers, IMTA Casablanca
========================================

CE QUI ETAIT FACILE:
- La creation du CV a ete assez simple. J'ai pu mettre toutes mes informations personnelles,
  mon parcours scolaire et mon stage en quelques etapes.
- J'aime bien qu'il y ait une section speciale pour les stages (internships) - c'est exactement
  ce dont j'ai besoin comme jeune diplomee.
- Le suivi des candidatures est tres pratique. Je peux voir ou j'en suis avec chaque hopital.
- Les objectifs de carriere avec les jalons me motivent a avancer etape par etape.

CE QUI ETAIT CONFUS:
- Au debut je ne savais pas quel template choisir, il y en a beaucoup. Mais j'ai trouve
  "casablanca" et ca m'a fait sourire, c'est ma ville !
- Le format HTML pour les descriptions (avec les <ul> et <li>) n'est pas intuitif.
  J'aurais prefere un editeur visuel plus simple.
- La difference entre "experience" et "internships" n'est pas toujours claire -
  est-ce que je dois mettre mon stage dans les deux ?
- Les termes techniques en anglais (slug, tags, priority) sont un peu intimidants
  pour quelqu'un qui n'est pas tres tech.

CE QUI MANQUE ET DONT J'AI BESOIN:
- Un modele de lettre de motivation integre - c'est aussi important que le CV au Maroc !
- La possibilite de telecharger en PDF directement depuis la plateforme.
- Un guide en francais pour les jeunes diplomes : "Comment remplir votre premier CV".
- Des exemples de CV dans le domaine de la sante pour m'inspirer.
- Une section "References" qui genere automatiquement un format propre.
- La traduction complete en francais/arabe de l'interface.
- Un rappel pour les dates de relance des candidatures.

CE QUE JE DIRAIS A MES CAMARADES DE CLASSE:
"Franchement, j'ai bien aime cette plateforme ! C'est mieux que de galerer avec Word pendant
des heures. Le fait qu'il y ait des sections pour les stages et des templates marocains,
c'est un vrai plus. Par contre, c'est un peu technique au debut, il faut prendre le temps
de comprendre. Le suivi des candidatures et des objectifs de carriere, c'est super utile
quand on cherche son premier emploi. Je recommande, surtout si vous etes organise(e)s !"

NOTE GLOBALE: 7/10
- Points forts : Templates marocains, sections completes, suivi de carriere
- Points faibles : Interface un peu technique, pas de guide debutant, HTML pour les textes
- Verdict : Bon outil, mais pourrait etre encore plus accessible pour les etudiants
  qui ne sont pas familiers avec la technologie.

========================================
`);
}

// ========================================
// MAIN
// ========================================
async function main() {
  console.log("+==========================================================+");
  console.log("|  AMINA BENALI - User Journey Simulation                  |");
  console.log("|  IMTA Nursing Graduate, Casablanca                       |");
  console.log("|  First resume ever!                                      |");
  console.log("+==========================================================+");

  await signIn();
  const resumeId = await step1_buildResume();
  await step2_tryTemplates(resumeId);
  await step3_createApplications(resumeId);
  await step4_createGoals();
  await step5_trackSkills();
  step6_report();

  console.log("\n=== JOURNEY COMPLETE ===");
  console.log(`Resume ID: ${resumeId}`);
  console.log(`View in builder: ${BASE}/builder/${resumeId}`);
}

main().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
