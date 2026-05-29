import pg from "pg";
const { Client } = pg;

const client = new Client({ connectionString: "postgresql://postgres:postgres@localhost:5432/postgres" });
await client.connect();

const partnerId = crypto.randomUUID();
const partnerUserId = "019c6d2a-bf6f-75f4-b6ea-576c6760485a"; // partner@test.com

// Create a demo partner profile (one profile per user)
try {
  await client.query(
    `INSERT INTO partner_profile (id, user_id, company_name, company_name_fr, partner_type, industry, industry_fr, description, description_fr, headquarters, contact_email, status, size)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     ON CONFLICT (user_id) DO UPDATE SET status = 'approved'`,
    [partnerId, partnerUserId, "OCP Group", "Groupe OCP", "employer", "Mining & Chemicals", "Mines & Chimie",
     "World leader in phosphate and its derivatives, OCP Group is a major player in the global fertilizer market.",
     "Leader mondial du phosphate et de ses dérivés, le Groupe OCP est un acteur majeur du marché mondial des engrais.",
     "Casablanca", "recrutement@ocpgroup.ma", "approved", "large"]
  );
  console.log("Partner profile created/updated");
} catch (e) {
  console.log(`Partner profile error: ${e.message.slice(0, 100)}`);
}

// Get the actual partner profile ID (in case it was already created)
const profileResult = await client.query("SELECT id FROM partner_profile WHERE user_id = $1", [partnerUserId]);
const actualPartnerId = profileResult.rows[0]?.id || partnerId;
console.log(`Using partner profile ID: ${actualPartnerId}`);

// Create demo job postings
const jobs = [
  {
    title: "Senior Software Engineer",
    titleFr: "Ingénieur Logiciel Senior",
    description: "Join our engineering team to build scalable cloud solutions for phosphate processing systems.",
    descriptionFr: "Rejoignez notre équipe d'ingénierie pour construire des solutions cloud évolutives pour les systèmes de traitement du phosphate.",
    location: "Casablanca",
    region: "casablanca-settat",
    jobType: "cdi",
    experienceLevel: "senior",
    field: "it",
    skills: ["Python", "AWS", "Docker", "Kubernetes", "PostgreSQL"],
    salaryMin: 180000,
    salaryMax: 300000,
    salaryCurrency: "MAD",
    status: "published",
  },
  {
    title: "Process Engineer",
    titleFr: "Ingénieur Procédés",
    description: "Optimize chemical processing operations and ensure quality standards in phosphate production.",
    descriptionFr: "Optimiser les opérations de traitement chimique et garantir les normes de qualité dans la production de phosphate.",
    location: "Khouribga",
    region: "beni-mellal-khenifra",
    jobType: "cdi",
    experienceLevel: "mid",
    field: "engineering",
    skills: ["Process Engineering", "Quality Control", "AutoCAD", "Six Sigma"],
    salaryMin: 150000,
    salaryMax: 250000,
    salaryCurrency: "MAD",
    status: "published",
  },
  {
    title: "Data Analyst Intern",
    titleFr: "Stagiaire Data Analyst",
    description: "6-month internship in our data analytics team working on production optimization dashboards.",
    descriptionFr: "Stage de 6 mois dans notre équipe data analytics travaillant sur les tableaux de bord d'optimisation de la production.",
    location: "Casablanca",
    region: "casablanca-settat",
    jobType: "stage",
    experienceLevel: "entry",
    field: "it",
    skills: ["Python", "SQL", "Power BI", "Excel"],
    salaryMin: 4000,
    salaryMax: 6000,
    salaryCurrency: "MAD",
    status: "published",
  },
  {
    title: "Mechanical Engineer",
    titleFr: "Ingénieur Mécanique",
    description: "Design and maintain automotive production line equipment at our Tanger facility.",
    descriptionFr: "Concevoir et maintenir les équipements de la ligne de production automobile dans notre usine de Tanger.",
    location: "Tanger",
    region: "tanger-tetouan-al-hoceima",
    jobType: "cdi",
    experienceLevel: "junior",
    field: "engineering",
    skills: ["SolidWorks", "Lean Manufacturing", "FMEA", "French", "English"],
    salaryMin: 120000,
    salaryMax: 180000,
    salaryCurrency: "MAD",
    status: "published",
  },
  {
    title: "Quality Control Specialist",
    titleFr: "Spécialiste Contrôle Qualité",
    description: "Ensure automotive parts meet ISO standards and customer specifications.",
    descriptionFr: "S'assurer que les pièces automobiles respectent les normes ISO et les spécifications clients.",
    location: "Tanger",
    region: "tanger-tetouan-al-hoceima",
    jobType: "cdi",
    experienceLevel: "mid",
    field: "engineering",
    skills: ["ISO 9001", "IATF 16949", "SPC", "Metrology"],
    salaryMin: 140000,
    salaryMax: 220000,
    salaryCurrency: "MAD",
    status: "published",
  },
  {
    title: "Full-Stack Developer",
    titleFr: "Développeur Full-Stack",
    description: "Build and maintain internal tools and client-facing applications using modern web technologies.",
    descriptionFr: "Développer et maintenir des outils internes et des applications clients utilisant les technologies web modernes.",
    location: "Rabat",
    region: "rabat-sale-kenitra",
    jobType: "cdi",
    experienceLevel: "mid",
    field: "it",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
    salaryMin: 160000,
    salaryMax: 280000,
    salaryCurrency: "MAD",
    status: "published",
  },
  {
    title: "DevOps Engineer",
    titleFr: "Ingénieur DevOps",
    description: "Manage CI/CD pipelines and cloud infrastructure for enterprise applications.",
    descriptionFr: "Gérer les pipelines CI/CD et l'infrastructure cloud pour les applications d'entreprise.",
    location: "Rabat",
    region: "rabat-sale-kenitra",
    jobType: "cdi",
    experienceLevel: "senior",
    field: "it",
    skills: ["Kubernetes", "Terraform", "Jenkins", "Azure", "Linux"],
    salaryMin: 200000,
    salaryMax: 350000,
    salaryCurrency: "MAD",
    status: "published",
  },
  {
    title: "Marketing Analyst",
    titleFr: "Analyste Marketing",
    description: "Analyze market trends and customer behavior to drive marketing strategy for phosphate derivatives.",
    descriptionFr: "Analyser les tendances du marché et le comportement des clients pour orienter la stratégie marketing des dérivés de phosphate.",
    location: "Casablanca",
    region: "casablanca-settat",
    jobType: "cdi",
    experienceLevel: "junior",
    field: "marketing",
    skills: ["Google Analytics", "CRM", "Market Research", "French", "English"],
    salaryMin: 100000,
    salaryMax: 160000,
    salaryCurrency: "MAD",
    status: "published",
  },
  {
    title: "Alternance - Electrical Engineering",
    titleFr: "Alternance - Génie Électrique",
    description: "12-month work-study program in our electrical systems division working on industrial automation.",
    descriptionFr: "Programme alternance de 12 mois dans notre division systèmes électriques travaillant sur l'automatisation industrielle.",
    location: "Jorf Lasfar",
    region: "casablanca-settat",
    jobType: "alternance",
    experienceLevel: "entry",
    field: "engineering",
    skills: ["PLC Programming", "Electrical Design", "AutoCAD Electrical"],
    salaryMin: 5000,
    salaryMax: 8000,
    salaryCurrency: "MAD",
    status: "published",
  },
  {
    title: "Supply Chain Manager",
    titleFr: "Responsable Supply Chain",
    description: "Manage end-to-end supply chain operations for automotive parts distribution across North Africa.",
    descriptionFr: "Gérer les opérations supply chain de bout en bout pour la distribution de pièces automobiles en Afrique du Nord.",
    location: "Tanger",
    region: "tanger-tetouan-al-hoceima",
    jobType: "cdi",
    experienceLevel: "senior",
    field: "logistics",
    skills: ["SAP", "Lean Supply Chain", "S&OP", "French", "English", "Arabic"],
    salaryMin: 250000,
    salaryMax: 400000,
    salaryCurrency: "MAD",
    status: "published",
  },
];

let jobCount = 0;
for (let i = 0; i < jobs.length; i++) {
  const j = jobs[i];
  const pId = actualPartnerId;
  try {
    await client.query(
      `INSERT INTO partner_job_posting (id, partner_id, title, title_fr, description, description_fr, location, region, job_type, experience_level, field, skills, salary_min, salary_max, salary_currency, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())`,
      [crypto.randomUUID(), pId, j.title, j.titleFr, j.description, j.descriptionFr, j.location, j.region, j.jobType, j.experienceLevel, j.field, JSON.stringify(j.skills), j.salaryMin, j.salaryMax, j.salaryCurrency, j.status]
    );
    jobCount++;
  } catch (e) {
    console.log(`Job skip: ${e.message.slice(0, 80)}`);
  }
}
console.log(`Inserted ${jobCount} job postings`);

// Create a partner event
try {
  await client.query(
    `INSERT INTO partner_event (id, partner_id, title, title_fr, description, description_fr, event_type, format, location, city, start_date, end_date, capacity, is_free, status, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())`,
    [
      crypto.randomUUID(), actualPartnerId,
      "IMTA Career Fair 2026", "Forum Carrières IMTA 2026",
      "Annual career fair connecting IMTA graduates with top Moroccan and international employers.",
      "Forum annuel des carrières reliant les diplômés de l'IMTA aux meilleurs employeurs marocains et internationaux.",
      "job_fair", "in_person", "IMTA Campus, Marrakech", "Marrakech",
      "2026-06-15T09:00:00Z", "2026-06-15T18:00:00Z",
      500, true, "published"
    ]
  );
  console.log("Inserted 1 partner event");
} catch (e) {
  console.log(`Event skip: ${e.message.slice(0, 80)}`);
}

// Summary
const counts = await Promise.all([
  client.query("SELECT count(*) FROM partner_profile"),
  client.query("SELECT count(*) FROM partner_job_posting"),
  client.query("SELECT count(*) FROM partner_event"),
]);
console.log(`\nPartner data summary:`);
console.log(`  Profiles: ${counts[0].rows[0].count}`);
console.log(`  Jobs: ${counts[1].rows[0].count}`);
console.log(`  Events: ${counts[2].rows[0].count}`);

await client.end();
