/**
 * seed-gallery-300.mjs
 * Inserts 210 NEW resume gallery entries into resume_gallery table.
 * Uses ON CONFLICT (id) DO NOTHING to avoid duplicates.
 * Also checks name uniqueness before inserting.
 */
import { Client } from "pg";
import crypto from "crypto";

const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";

const TEMPLATES = [
  "azurill", "bronzor", "chikorita", "ditto", "gengar", "glalie",
  "kakuna", "leafeon", "nosepass", "onyx", "pikachu", "rhyhorn",
  "casablanca", "rabat", "marrakech", "fes", "tanger", "agadir",
  "meknes", "oujda", "tetouan", "essaouira", "kenitra", "nador",
  "safi", "eljadida", "beni-mellal", "khouribga", "settat", "taza",
];

const FIELDS = [
  "genie-informatique", "genie-civil", "genie-electrique", "genie-mecanique",
  "genie-industriel", "logistique", "management", "commerce", "finance",
  "marketing", "ressources-humaines", "droit", "medecine", "pharmacie",
  "architecture", "design", "communication", "tourisme", "agriculture",
  "environnement",
];

const LANGUAGES = ["fr", "en", "ar"];

// Moroccan first names and last names for generating realistic gallery entries
const FIRST_NAMES = [
  "Youssef", "Fatima", "Ahmed", "Amina", "Omar", "Salma", "Khalid", "Nadia",
  "Hassan", "Khadija", "Mohamed", "Laila", "Rachid", "Zineb", "Karim",
  "Houda", "Mehdi", "Sara", "Hamza", "Meryem", "Anas", "Soukaina", "Ayoub",
  "Imane", "Bilal", "Sanaa", "Adil", "Hiba", "Zakaria", "Rim", "Tarik",
  "Ghita", "Reda", "Hajar", "Othman", "Asmae", "Driss", "Loubna", "Saad",
  "Wiam", "Younes", "Ikram", "Walid", "Chaima", "Nabil", "Mariam", "Jamal",
  "Narjis", "Mustapha", "Safaa",
];

const LAST_NAMES = [
  "Benali", "El Amrani", "Tazi", "Bouziane", "Alaoui", "Cherkaoui",
  "Fassi", "Berrada", "Idrissi", "Benjelloun", "Kettani", "Sekkat",
  "Benkirane", "Benhima", "Lahlou", "Chraibi", "Tahiri", "Bouazza",
  "Ziani", "Kabbaj", "Sqalli", "Rachidi", "El Khalfi", "Bernoussi",
  "Tounsi", "Lamrani", "El Ouafi", "Mansouri", "Dahmani", "Sabri",
  "Hariri", "Zerhouni", "Belkadi", "Qadiri", "Naciri", "El Fassi",
  "Bennani", "Guedira", "Mekouar", "Slimani",
];

const LOCATIONS = [
  "Casablanca", "Rabat", "Marrakech", "Fes", "Tanger", "Agadir",
  "Meknes", "Oujda", "Tetouan", "Kenitra", "El Jadida", "Safi",
  "Beni Mellal", "Nador", "Khouribga", "Settat", "Taza", "Mohammedia",
  "Ksar El Kebir", "Larache",
];

const SCHOOLS = [
  "ENSIAS Rabat", "EMI Rabat", "ENSA Marrakech", "ENSA Kenitra",
  "ENSA Fes", "ENSA Tanger", "FST Fes", "FST Mohammedia",
  "FST Settat", "FST Beni Mellal", "ENCG Casablanca", "ENCG Tanger",
  "ENCG Settat", "ENCG Marrakech", "EHTP Casablanca", "ISCAE Casablanca",
  "INPT Rabat", "AIAC Casablanca", "ESITH Casablanca", "ENSAM Meknes",
  "ENSAM Casablanca", "EST Safi", "Faculte de Droit Rabat",
  "Faculte de Medecine Casablanca", "Ecole Hassania Casablanca",
  "UM6P Ben Guerir", "EMINES Ben Guerir", "Universite Al Akhawayn Ifrane",
];

const COMPANIES = [
  "OCP Group", "Maroc Telecom", "Inwi", "Orange Maroc", "Attijariwafa Bank",
  "BMCE Bank", "Banque Populaire", "CIH Bank", "Capgemini Maroc",
  "Atos Maroc", "CGI Maroc", "Renault Maroc", "PSA Kenitra",
  "Safran Morocco", "Boeing Morocco", "SQLI Maroc", "Sopra HR Software",
  "Deloitte Maroc", "PwC Maroc", "KPMG Maroc", "EY Maroc",
  "Managem Group", "MASEN", "ONCF", "Royal Air Maroc",
  "LafargeHolcim Maroc", "Cosumar", "Centrale Danone", "Marjane Group",
  "Label'Vie", "Wafa Assurance", "Saham Assurance", "Sanofi Maroc",
  "TotalEnergies Maroc", "Lydec", "ONEE", "Sonasid",
];

const FIELD_META = {
  "genie-informatique": {
    label: "Computer Engineering",
    labelFr: "Genie Informatique",
    degrees: ["Diplome d'Ingenieur", "Master en Informatique", "Licence en Genie Informatique"],
    degreesEn: ["Engineering Diploma", "Master in Computer Science", "BS in Computer Engineering"],
    headlines: ["Developpeur Full-Stack", "Ingenieur DevOps", "Data Scientist", "Ingenieur Cloud", "Developpeur Mobile", "Architecte Logiciel", "Ingenieur QA"],
    headlinesEn: ["Full-Stack Developer", "DevOps Engineer", "Data Scientist", "Cloud Engineer", "Mobile Developer", "Software Architect", "QA Engineer"],
    skills: ["React", "Node.js", "Python", "Java", "Docker", "Kubernetes", "AWS", "TypeScript", "PostgreSQL", "MongoDB", "Git", "CI/CD", "Linux", "REST API", "GraphQL", "TensorFlow"],
    descFr: "Ingenieur en informatique specialise dans le developpement logiciel et les systemes distribues",
    descEn: "Computer engineer specialized in software development and distributed systems",
  },
  "genie-civil": {
    label: "Civil Engineering",
    labelFr: "Genie Civil",
    degrees: ["Diplome d'Ingenieur en Genie Civil", "Master en Genie Civil"],
    degreesEn: ["Civil Engineering Diploma", "Master in Civil Engineering"],
    headlines: ["Ingenieur Structure", "Chef de Projet BTP", "Ingenieur Geotechnique", "Conducteur de Travaux"],
    headlinesEn: ["Structural Engineer", "Construction Project Manager", "Geotechnical Engineer", "Site Manager"],
    skills: ["AutoCAD", "Revit", "SAP2000", "ETABS", "Robot Structural", "BIM", "MS Project", "Excel", "MATLAB"],
    descFr: "Ingenieur en genie civil avec expertise en conception structurelle et gestion de projets BTP",
    descEn: "Civil engineer with expertise in structural design and construction project management",
  },
  "genie-electrique": {
    label: "Electrical Engineering",
    labelFr: "Genie Electrique",
    degrees: ["Diplome d'Ingenieur en Genie Electrique", "Master en Electronique"],
    degreesEn: ["Electrical Engineering Diploma", "Master in Electronics"],
    headlines: ["Ingenieur Electrique", "Ingenieur Automatisme", "Ingenieur Energie", "Ingenieur Electronique"],
    headlinesEn: ["Electrical Engineer", "Automation Engineer", "Energy Engineer", "Electronics Engineer"],
    skills: ["MATLAB", "Simulink", "PLC Programming", "SCADA", "AutoCAD Electrical", "LabVIEW", "VHDL", "Arduino"],
    descFr: "Ingenieur electrique specialise dans les systemes de puissance et l'automatisation industrielle",
    descEn: "Electrical engineer specialized in power systems and industrial automation",
  },
  "genie-mecanique": {
    label: "Mechanical Engineering",
    labelFr: "Genie Mecanique",
    degrees: ["Diplome d'Ingenieur en Genie Mecanique", "Master en Mecanique"],
    degreesEn: ["Mechanical Engineering Diploma", "Master in Mechanical Engineering"],
    headlines: ["Ingenieur Mecanique", "Ingenieur Production", "Ingenieur Maintenance", "Ingenieur R&D"],
    headlinesEn: ["Mechanical Engineer", "Production Engineer", "Maintenance Engineer", "R&D Engineer"],
    skills: ["SolidWorks", "CATIA", "AutoCAD", "ANSYS", "MATLAB", "SAP", "Six Sigma", "Lean Manufacturing"],
    descFr: "Ingenieur mecanique avec expertise en conception, production et maintenance industrielle",
    descEn: "Mechanical engineer with expertise in design, production and industrial maintenance",
  },
  "genie-industriel": {
    label: "Industrial Engineering",
    labelFr: "Genie Industriel",
    degrees: ["Diplome d'Ingenieur en Genie Industriel", "Master en Management Industriel"],
    degreesEn: ["Industrial Engineering Diploma", "Master in Industrial Management"],
    headlines: ["Ingenieur Industriel", "Ingenieur Qualite", "Ingenieur Methodes", "Supply Chain Manager"],
    headlinesEn: ["Industrial Engineer", "Quality Engineer", "Methods Engineer", "Supply Chain Manager"],
    skills: ["Lean Manufacturing", "Six Sigma", "SAP", "MS Project", "Excel", "Minitab", "AutoCAD", "ERP"],
    descFr: "Ingenieur industriel specialise dans l'optimisation des processus et la gestion de la qualite",
    descEn: "Industrial engineer specialized in process optimization and quality management",
  },
  logistique: {
    label: "Logistics & Supply Chain",
    labelFr: "Logistique et Supply Chain",
    degrees: ["Master en Logistique", "Licence en Supply Chain Management"],
    degreesEn: ["Master in Logistics", "BS in Supply Chain Management"],
    headlines: ["Responsable Logistique", "Supply Chain Analyst", "Chef de Projet Logistique", "Coordinateur Transport"],
    headlinesEn: ["Logistics Manager", "Supply Chain Analyst", "Logistics Project Manager", "Transport Coordinator"],
    skills: ["SAP", "WMS", "TMS", "Excel", "Power BI", "SQL", "ERP", "Lean"],
    descFr: "Specialiste en logistique et supply chain avec expertise en optimisation des flux",
    descEn: "Logistics and supply chain specialist with expertise in flow optimization",
  },
  management: {
    label: "Management",
    labelFr: "Management",
    degrees: ["MBA", "Master en Management", "Diplome de Grande Ecole de Commerce"],
    degreesEn: ["MBA", "Master in Management", "Business School Diploma"],
    headlines: ["Chef de Projet", "Consultant en Management", "Directeur des Operations", "Business Analyst"],
    headlinesEn: ["Project Manager", "Management Consultant", "Operations Director", "Business Analyst"],
    skills: ["MS Project", "Excel", "Power BI", "SAP", "Agile", "Scrum", "Leadership", "Strategy"],
    descFr: "Manager experimente avec competences en gestion de projets et strategie d'entreprise",
    descEn: "Experienced manager with expertise in project management and business strategy",
  },
  commerce: {
    label: "Business & Trade",
    labelFr: "Commerce et Affaires",
    degrees: ["Master en Commerce International", "Licence en Commerce"],
    degreesEn: ["Master in International Business", "BS in Business"],
    headlines: ["Charge d'Affaires", "Commercial Export", "Business Developer", "Key Account Manager"],
    headlinesEn: ["Business Executive", "Export Sales Manager", "Business Developer", "Key Account Manager"],
    skills: ["CRM", "Salesforce", "Excel", "Negociation", "SAP", "ERP", "Marketing", "Trade Finance"],
    descFr: "Professionnel du commerce avec expertise en developpement commercial et relations clients",
    descEn: "Business professional with expertise in commercial development and client relations",
  },
  finance: {
    label: "Finance",
    labelFr: "Finance",
    degrees: ["Master en Finance", "Diplome d'Expert Comptable", "Licence en Finance"],
    degreesEn: ["Master in Finance", "CPA Diploma", "BS in Finance"],
    headlines: ["Analyste Financier", "Controleur de Gestion", "Auditeur", "Tresorier", "Comptable Senior"],
    headlinesEn: ["Financial Analyst", "Management Controller", "Auditor", "Treasurer", "Senior Accountant"],
    skills: ["Excel", "SAP", "Power BI", "Bloomberg", "SQL", "VBA", "IFRS", "Financial Modeling"],
    descFr: "Expert financier avec competences en analyse, audit et controle de gestion",
    descEn: "Finance expert with skills in analysis, audit and management control",
  },
  marketing: {
    label: "Marketing",
    labelFr: "Marketing",
    degrees: ["Master en Marketing", "Licence en Marketing Digital"],
    degreesEn: ["Master in Marketing", "BS in Digital Marketing"],
    headlines: ["Chef de Produit", "Digital Marketing Manager", "Community Manager", "Brand Manager"],
    headlinesEn: ["Product Manager", "Digital Marketing Manager", "Community Manager", "Brand Manager"],
    skills: ["Google Analytics", "SEO", "SEM", "Social Media", "Photoshop", "Canva", "HubSpot", "CRM"],
    descFr: "Specialiste marketing avec expertise en strategie digitale et gestion de marque",
    descEn: "Marketing specialist with expertise in digital strategy and brand management",
  },
  "ressources-humaines": {
    label: "Human Resources",
    labelFr: "Ressources Humaines",
    degrees: ["Master en GRH", "Licence en Ressources Humaines"],
    degreesEn: ["Master in HRM", "BS in Human Resources"],
    headlines: ["Responsable RH", "Charge de Recrutement", "Gestionnaire Paie", "HR Business Partner"],
    headlinesEn: ["HR Manager", "Recruitment Officer", "Payroll Manager", "HR Business Partner"],
    skills: ["SAP HR", "Excel", "GPEC", "Droit du Travail", "Paie", "Recrutement", "Formation"],
    descFr: "Professionnel RH avec expertise en recrutement, gestion des talents et droit social",
    descEn: "HR professional with expertise in recruitment, talent management and labor law",
  },
  droit: {
    label: "Law",
    labelFr: "Droit",
    degrees: ["Master en Droit des Affaires", "Licence en Droit", "Doctorat en Droit"],
    degreesEn: ["Master in Business Law", "Law Degree", "PhD in Law"],
    headlines: ["Juriste d'Entreprise", "Avocat", "Conseiller Juridique", "Notaire"],
    headlinesEn: ["Corporate Lawyer", "Attorney", "Legal Advisor", "Notary"],
    skills: ["Droit Commercial", "Droit Social", "Contentieux", "Redaction Juridique", "Mediation", "Compliance"],
    descFr: "Juriste specialise en droit des affaires et conformite reglementaire",
    descEn: "Legal professional specialized in business law and regulatory compliance",
  },
  medecine: {
    label: "Medicine",
    labelFr: "Medecine",
    degrees: ["Doctorat en Medecine", "Specialite Medicale", "Residanat"],
    degreesEn: ["Medical Doctorate", "Medical Specialty", "Medical Residency"],
    headlines: ["Medecin Generaliste", "Medecin Specialiste", "Chirurgien", "Pharmacien Clinicien"],
    headlinesEn: ["General Practitioner", "Medical Specialist", "Surgeon", "Clinical Pharmacist"],
    skills: ["Diagnostic", "Recherche Clinique", "Echographie", "Imagerie Medicale", "Urgences", "Pediatrie"],
    descFr: "Professionnel de sante avec expertise clinique et engagement envers les soins aux patients",
    descEn: "Healthcare professional with clinical expertise and commitment to patient care",
  },
  pharmacie: {
    label: "Pharmacy",
    labelFr: "Pharmacie",
    degrees: ["Doctorat en Pharmacie", "Master en Sciences Pharmaceutiques"],
    degreesEn: ["Doctor of Pharmacy", "Master in Pharmaceutical Sciences"],
    headlines: ["Pharmacien", "Responsable Assurance Qualite", "Chef de Produit Pharma", "Pharmacovigilance"],
    headlinesEn: ["Pharmacist", "QA Manager", "Pharma Product Manager", "Pharmacovigilance Officer"],
    skills: ["BPF", "Pharmacovigilance", "Assurance Qualite", "Reglementation", "HPLC", "GMP"],
    descFr: "Pharmacien avec expertise en assurance qualite et reglementation pharmaceutique",
    descEn: "Pharmacist with expertise in quality assurance and pharmaceutical regulation",
  },
  architecture: {
    label: "Architecture",
    labelFr: "Architecture",
    degrees: ["Diplome d'Architecte", "Master en Architecture"],
    degreesEn: ["Architecture Diploma", "Master in Architecture"],
    headlines: ["Architecte", "Urbaniste", "Chef de Projet Architecture", "BIM Manager"],
    headlinesEn: ["Architect", "Urban Planner", "Architecture Project Manager", "BIM Manager"],
    skills: ["AutoCAD", "Revit", "SketchUp", "3ds Max", "Photoshop", "Illustrator", "BIM", "ArchiCAD"],
    descFr: "Architecte avec expertise en conception durable et urbanisme",
    descEn: "Architect with expertise in sustainable design and urban planning",
  },
  design: {
    label: "Design",
    labelFr: "Design",
    degrees: ["Master en Design", "Licence en Design Graphique"],
    degreesEn: ["Master in Design", "BS in Graphic Design"],
    headlines: ["Designer UX/UI", "Directeur Artistique", "Graphiste", "Motion Designer"],
    headlinesEn: ["UX/UI Designer", "Art Director", "Graphic Designer", "Motion Designer"],
    skills: ["Figma", "Photoshop", "Illustrator", "After Effects", "InDesign", "Sketch", "Premiere Pro"],
    descFr: "Designer creatif avec expertise en UX/UI et direction artistique",
    descEn: "Creative designer with expertise in UX/UI and art direction",
  },
  communication: {
    label: "Communication",
    labelFr: "Communication",
    degrees: ["Master en Communication", "Licence en Journalisme"],
    degreesEn: ["Master in Communication", "BS in Journalism"],
    headlines: ["Charge de Communication", "Journaliste", "Responsable RP", "Content Manager"],
    headlinesEn: ["Communications Officer", "Journalist", "PR Manager", "Content Manager"],
    skills: ["Redaction", "Community Management", "RP", "Evenementiel", "Photoshop", "WordPress", "SEO"],
    descFr: "Professionnel de la communication avec expertise en relations publiques et contenu digital",
    descEn: "Communication professional with expertise in PR and digital content",
  },
  tourisme: {
    label: "Tourism & Hospitality",
    labelFr: "Tourisme et Hotellerie",
    degrees: ["Master en Tourisme", "Licence en Hotellerie", "BTS Tourisme"],
    degreesEn: ["Master in Tourism", "BS in Hospitality", "Tourism Diploma"],
    headlines: ["Responsable Tourisme", "Directeur d'Hotel", "Chef de Reception", "Guide Touristique"],
    headlinesEn: ["Tourism Manager", "Hotel Director", "Front Desk Manager", "Tour Guide"],
    skills: ["Opera PMS", "Fidelio", "Amadeus", "Gestion Hoteliere", "Evenementiel", "Service Client"],
    descFr: "Professionnel du tourisme avec expertise en hotellerie et gestion evenementielle",
    descEn: "Tourism professional with expertise in hospitality and event management",
  },
  agriculture: {
    label: "Agriculture",
    labelFr: "Agriculture",
    degrees: ["Diplome d'Ingenieur Agronome", "Master en Agronomie"],
    degreesEn: ["Agronomy Engineering Diploma", "Master in Agronomy"],
    headlines: ["Ingenieur Agronome", "Responsable Production Agricole", "Technicien Agricole"],
    headlinesEn: ["Agricultural Engineer", "Agricultural Production Manager", "Agricultural Technician"],
    skills: ["Agronomie", "Irrigation", "SIG", "Gestion de Cultures", "Phytosanitaire", "Excel"],
    descFr: "Ingenieur agronome avec expertise en production agricole et developpement rural",
    descEn: "Agricultural engineer with expertise in crop production and rural development",
  },
  environnement: {
    label: "Environment",
    labelFr: "Environnement",
    degrees: ["Master en Environnement", "Diplome d'Ingenieur en Environnement"],
    degreesEn: ["Master in Environmental Science", "Environmental Engineering Diploma"],
    headlines: ["Ingenieur Environnement", "Responsable HSE", "Charge d'Etudes Environnementales"],
    headlinesEn: ["Environmental Engineer", "HSE Manager", "Environmental Studies Officer"],
    skills: ["EIE", "ISO 14001", "HSE", "SIG", "Traitement des Eaux", "Gestion des Dechets", "Audit Environnemental"],
    descFr: "Ingenieur environnement avec expertise en HSE et developpement durable",
    descEn: "Environmental engineer with expertise in HSE and sustainable development",
  },
};

const EXP_LEVELS = [
  { years: 0, label: "Stage", labelEn: "Intern" },
  { years: 1, label: "Junior", labelEn: "Junior" },
  { years: 2, label: "Junior", labelEn: "Junior" },
  { years: 3, label: "Confirme", labelEn: "Mid-Level" },
  { years: 5, label: "Senior", labelEn: "Senior" },
  { years: 7, label: "Senior", labelEn: "Senior" },
  { years: 10, label: "Expert", labelEn: "Expert" },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function generatePhone() {
  const prefix = pick(["0661", "0662", "0670", "0671", "0622", "0623", "0666", "0667"]);
  const num = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  return `${prefix}-${num}`;
}

function generateEmail(first, last) {
  const domain = pick(["gmail.com", "live.fr", "outlook.com", "yahoo.fr", "hotmail.com"]);
  const clean = last.toLowerCase().replace(/[' ]/g, "");
  return `${first.toLowerCase()}.${clean}@${domain}`;
}

function generateResumeData(firstName, lastName, field, meta, exp, lang) {
  const isFr = lang === "fr";
  const isAr = lang === "ar";
  const headline = isFr ? pick(meta.headlines) : (isAr ? pick(meta.headlines) : pick(meta.headlinesEn));
  const degree = isFr ? pick(meta.degrees) : (isAr ? pick(meta.degrees) : pick(meta.degreesEn));
  const school = pick(SCHOOLS);
  const company1 = pick(COMPANIES);
  const company2 = pick(COMPANIES.filter((c) => c !== company1));
  const location = pick(LOCATIONS);
  const skills = pickN(meta.skills, Math.min(meta.skills.length, Math.floor(Math.random() * 4) + 5));
  const proficiencies = ["Expert", "Advanced", "Intermediate"];
  const startYear = 2024 - exp.years - 4;
  const gradYear = startYear + 4;

  return {
    basics: {
      cin: "",
      name: `${firstName} ${lastName}`,
      email: generateEmail(firstName, lastName),
      phone: generatePhone(),
      headline,
      location,
    },
    summary: {
      content: isFr ? meta.descFr : meta.descEn,
    },
    sections: {
      skills: {
        items: skills.map((s) => ({
          name: s,
          proficiency: pick(proficiencies),
        })),
      },
      education: {
        items: [
          {
            field: meta.labelFr,
            grade: "",
            degree,
            period: `${startYear} - ${gradYear}`,
            school,
          },
        ],
      },
      languages: {
        items: [
          { name: isAr ? "العربية" : "Arabe", proficiency: "Native" },
          { name: isAr ? "الفرنسية" : "Francais", proficiency: "Fluent" },
          { name: isAr ? "الإنجليزية" : "Anglais", proficiency: isFr ? "Intermediaire" : "Advanced" },
        ],
      },
      experience: {
        items: exp.years > 0
          ? [
              {
                period: `${gradYear + Math.floor(exp.years / 2)} - Present`,
                company: company1,
                position: headline,
                description: isFr
                  ? "- Gestion de projets et coordination d'equipe\n- Amelioration des processus et indicateurs de performance\n- Collaboration avec les parties prenantes internes et externes"
                  : "- Project management and team coordination\n- Process improvement and performance metrics\n- Collaboration with internal and external stakeholders",
              },
              {
                period: `${gradYear} - ${gradYear + Math.floor(exp.years / 2)}`,
                company: company2,
                position: isFr ? pick(meta.headlines) : pick(meta.headlinesEn),
                description: isFr
                  ? "- Mise en oeuvre de solutions techniques\n- Suivi des KPI et reporting\n- Formation des equipes junior"
                  : "- Technical solution implementation\n- KPI tracking and reporting\n- Junior team training and mentoring",
              },
            ]
          : [
              {
                period: `${gradYear} - ${gradYear}`,
                company: company1,
                position: isFr ? "Stagiaire" : "Intern",
                description: isFr
                  ? "- Stage de fin d'etudes\n- Participation aux projets d'equipe\n- Redaction de rapports techniques"
                  : "- End-of-studies internship\n- Team project participation\n- Technical report writing",
              },
            ],
      },
    },
  };
}

async function main() {
  const client = new Client(DATABASE_URL);
  await client.connect();
  console.log("Connected to PostgreSQL");

  // Get existing names to avoid conflicts
  const existingResult = await client.query("SELECT name FROM resume_gallery");
  const existingNames = new Set(existingResult.rows.map((r) => r.name));
  console.log(`Found ${existingNames.size} existing gallery entries`);

  const entries = [];
  const usedNames = new Set([...existingNames]);
  let counter = 0;

  // Generate 210 entries: cycle through fields and templates
  for (const field of FIELDS) {
    const meta = FIELD_META[field];
    if (!meta) continue;

    // Generate ~10-11 entries per field to reach 210+
    for (let i = 0; i < 11; i++) {
      if (entries.length >= 210) break;

      const firstName = pick(FIRST_NAMES);
      const lastName = pick(LAST_NAMES);
      const template = pick(TEMPLATES);
      const lang = pick(LANGUAGES);
      const exp = pick(EXP_LEVELS);

      const langLabel = lang === "fr" ? "FR" : lang === "en" ? "EN" : "AR";
      const nameBase = `${firstName} ${lastName} — ${exp.labelEn} ${meta.label} Resume (${langLabel})`;

      // Make name unique
      let name = nameBase;
      let suffix = 2;
      while (usedNames.has(name)) {
        name = `${nameBase} ${suffix}`;
        suffix++;
      }
      usedNames.add(name);

      const nameFr = `${firstName} ${lastName} — CV ${exp.label} en ${meta.labelFr} (${langLabel})`;

      const resumeData = generateResumeData(firstName, lastName, field, meta, exp, lang);
      const tags = pickN(meta.skills, Math.min(meta.skills.length, Math.floor(Math.random() * 4) + 3));
      const atsScore = Math.floor(Math.random() * 20) + 78; // 78-97
      const viewCount = Math.floor(Math.random() * 500) + 10;
      const useCount = Math.floor(Math.random() * 100) + 1;
      const isFeatured = Math.random() < 0.15; // 15% featured

      entries.push({
        id: crypto.randomUUID(),
        name,
        name_fr: nameFr,
        field,
        sub_field: null,
        experience_years: exp.years,
        template_name: template,
        language: lang,
        description: `${meta.descEn}. ${exp.labelEn}-level professional with ${exp.years} years of experience.`,
        description_fr: `${meta.descFr}. Professionnel ${exp.label.toLowerCase()} avec ${exp.years} ans d'experience.`,
        resume_data: resumeData,
        tags,
        ats_score: atsScore,
        is_featured: isFeatured,
        view_count: viewCount,
        use_count: useCount,
        is_active: true,
      });

      counter++;
    }
  }

  console.log(`Generated ${entries.length} new gallery entries`);

  // Insert in batches of 25
  let inserted = 0;
  let skipped = 0;
  const batchSize = 25;

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const values = [];
    const params = [];
    let paramIndex = 1;

    for (const entry of batch) {
      const placeholders = [];
      for (let j = 0; j < 16; j++) {
        placeholders.push(`$${paramIndex++}`);
      }
      values.push(`(${placeholders.join(", ")})`);
      params.push(
        entry.id,
        entry.name,
        entry.name_fr,
        entry.field,
        entry.sub_field,
        entry.experience_years,
        entry.template_name,
        entry.language,
        entry.description,
        entry.description_fr,
        JSON.stringify(entry.resume_data),
        entry.tags,
        entry.ats_score,
        entry.is_featured,
        entry.view_count,
        entry.use_count,
      );
    }

    const query = `
      INSERT INTO resume_gallery (id, name, name_fr, field, sub_field, experience_years, template_name, language, description, description_fr, resume_data, tags, ats_score, is_featured, view_count, use_count)
      VALUES ${values.join(",\n")}
      ON CONFLICT (id) DO NOTHING
    `;

    try {
      const result = await client.query(query, params);
      inserted += result.rowCount;
      if (result.rowCount < batch.length) {
        skipped += batch.length - result.rowCount;
      }
    } catch (err) {
      // If batch fails due to name uniqueness, insert one by one
      console.log(`Batch ${Math.floor(i / batchSize) + 1} failed, inserting individually...`);
      for (const entry of batch) {
        try {
          await client.query(
            `INSERT INTO resume_gallery (id, name, name_fr, field, sub_field, experience_years, template_name, language, description, description_fr, resume_data, tags, ats_score, is_featured, view_count, use_count)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
             ON CONFLICT (id) DO NOTHING`,
            [
              entry.id, entry.name, entry.name_fr, entry.field, entry.sub_field,
              entry.experience_years, entry.template_name, entry.language,
              entry.description, entry.description_fr, JSON.stringify(entry.resume_data),
              entry.tags, entry.ats_score, entry.is_featured, entry.view_count, entry.use_count,
            ],
          );
          inserted++;
        } catch (innerErr) {
          skipped++;
          if (innerErr.message.includes("unique")) {
            // Name collision - skip
          } else {
            console.error(`  Error inserting ${entry.name}: ${innerErr.message}`);
          }
        }
      }
    }
  }

  // Final count
  const finalCount = await client.query("SELECT COUNT(*) FROM resume_gallery");
  console.log(`\n--- Gallery Seed Results ---`);
  console.log(`Generated: ${entries.length}`);
  console.log(`Inserted:  ${inserted}`);
  console.log(`Skipped:   ${skipped}`);
  console.log(`Total gallery entries now: ${finalCount.rows[0].count}`);

  // Show distribution
  const fieldDist = await client.query("SELECT field, COUNT(*) as cnt FROM resume_gallery GROUP BY field ORDER BY cnt DESC");
  console.log(`\nField distribution:`);
  for (const row of fieldDist.rows) {
    console.log(`  ${row.field}: ${row.cnt}`);
  }

  const templateDist = await client.query("SELECT template_name, COUNT(*) as cnt FROM resume_gallery GROUP BY template_name ORDER BY cnt DESC LIMIT 10");
  console.log(`\nTop 10 templates:`);
  for (const row of templateDist.rows) {
    console.log(`  ${row.template_name}: ${row.cnt}`);
  }

  await client.end();
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
