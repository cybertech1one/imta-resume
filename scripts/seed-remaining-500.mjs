// seed-remaining-500.mjs
// Inserts 800+ rows across 5 tables using ACTUAL schema columns.
// Uses ON CONFLICT DO NOTHING for idempotency.

import pg from "pg";
import crypto from "crypto";

const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres:postgres@localhost:5432/postgres",
});

function uuid() {
  return crypto.randomUUID();
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundToThousand(n) {
  return Math.round(n / 1000) * 1000;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. MARKET_SALARY_DATA — actual columns:
//   id UUID, role TEXT, role_fr TEXT, field TEXT, region TEXT,
//   experience_level TEXT, salary_min INT, salary_median INT, salary_max INT,
//   sample_size INT, growth_rate REAL, demand_score INT, source TEXT,
//   last_updated TIMESTAMPTZ, created_at, updated_at
// ═══════════════════════════════════════════════════════════════════════════

const REGIONS_SHORT = [
  "casablanca", "rabat", "tanger", "marrakech", "fes", "agadir",
  "kenitra", "meknes", "oujda", "tetouan", "nador", "laayoune", "dakhla",
];

const FIELDS = [
  "genie-informatique", "genie-civil", "genie-electrique", "genie-mecanique",
  "genie-industriel", "logistique", "management", "commerce", "finance",
  "marketing", "ressources-humaines", "droit", "medecine", "pharmacie",
  "architecture", "tourisme", "agriculture",
];

const EXP_LEVELS = ["entry", "mid", "senior", "lead", "executive"];

const SOURCES = [
  "ReKrute 2024", "Emploi.ma 2024", "ANAPEC 2025", "Enquête HCP 2024",
];

// Base annual salary ranges by field (entry level min/max in MAD)
const FIELD_SALARY_BASE = {
  "genie-informatique":  { min: 72000,  max: 120000 },
  "genie-civil":         { min: 66000,  max: 108000 },
  "genie-electrique":    { min: 66000,  max: 108000 },
  "genie-mecanique":     { min: 66000,  max: 108000 },
  "genie-industriel":    { min: 72000,  max: 114000 },
  "logistique":          { min: 60000,  max: 96000 },
  "management":          { min: 72000,  max: 120000 },
  "commerce":            { min: 54000,  max: 90000 },
  "finance":             { min: 84000,  max: 132000 },
  "marketing":           { min: 60000,  max: 102000 },
  "ressources-humaines": { min: 60000,  max: 96000 },
  "droit":               { min: 60000,  max: 102000 },
  "medecine":            { min: 96000,  max: 168000 },
  "pharmacie":           { min: 84000,  max: 144000 },
  "architecture":        { min: 72000,  max: 120000 },
  "tourisme":            { min: 48000,  max: 84000 },
  "agriculture":         { min: 48000,  max: 78000 },
};

const EXP_MULTIPLIER = { entry: 1.0, mid: 1.5, senior: 2.2, lead: 2.8, executive: 3.5 };

const CITY_FACTOR = {
  casablanca: 1.15, rabat: 1.10, tanger: 1.05, marrakech: 1.00,
  fes: 0.95, agadir: 0.95, kenitra: 0.90, meknes: 0.90,
  oujda: 0.85, tetouan: 0.90, nador: 0.85, laayoune: 0.90, dakhla: 0.90,
};

const ROLE_MAP = {
  "genie-informatique":  { en: "Software Developer", fr: "Développeur Logiciel" },
  "genie-civil":         { en: "Civil Engineer", fr: "Ingénieur Génie Civil" },
  "genie-electrique":    { en: "Electrical Engineer", fr: "Ingénieur Électrique" },
  "genie-mecanique":     { en: "Mechanical Engineer", fr: "Ingénieur Mécanique" },
  "genie-industriel":    { en: "Industrial Engineer", fr: "Ingénieur Industriel" },
  "logistique":          { en: "Logistics Manager", fr: "Responsable Logistique" },
  "management":          { en: "Business Manager", fr: "Manager d'Entreprise" },
  "commerce":            { en: "Sales Representative", fr: "Commercial" },
  "finance":             { en: "Financial Analyst", fr: "Analyste Financier" },
  "marketing":           { en: "Marketing Manager", fr: "Responsable Marketing" },
  "ressources-humaines": { en: "HR Manager", fr: "Responsable RH" },
  "droit":               { en: "Legal Counsel", fr: "Juriste d'Entreprise" },
  "medecine":            { en: "Medical Doctor", fr: "Médecin" },
  "pharmacie":           { en: "Pharmacist", fr: "Pharmacien(ne)" },
  "architecture":        { en: "Architect", fr: "Architecte" },
  "tourisme":            { en: "Tourism Manager", fr: "Responsable Tourisme" },
  "agriculture":         { en: "Agricultural Engineer", fr: "Ingénieur Agronome" },
};

const LEVEL_PREFIX = {
  entry: { en: "Junior", fr: "Junior" },
  mid: { en: "", fr: "" },
  senior: { en: "Senior", fr: "Senior" },
  lead: { en: "Lead", fr: "Chef" },
  executive: { en: "Director", fr: "Directeur" },
};

function buildMarketSalaryData() {
  const rows = [];

  for (const field of FIELDS) {
    for (const level of EXP_LEVELS) {
      const shuffled = [...REGIONS_SHORT].sort(() => Math.random() - 0.5);
      const count = level === "executive" ? 2 : 3;
      for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        const city = shuffled[i];
        const base = FIELD_SALARY_BASE[field];
        const mult = EXP_MULTIPLIER[level];
        const cf = CITY_FACTOR[city];

        const salaryMin = roundToThousand(base.min * mult * cf);
        const salaryMax = roundToThousand(base.max * mult * cf);
        const salaryMedian = roundToThousand((salaryMin + salaryMax) / 2);
        const prefix = LEVEL_PREFIX[level];
        const rm = ROLE_MAP[field];
        const role = prefix.en ? `${prefix.en} ${rm.en}` : rm.en;
        const roleFr = prefix.fr ? `${prefix.fr} ${rm.fr}` : rm.fr;
        const demandScore = level === "entry" ? randInt(60, 85) : level === "senior" ? randInt(75, 95) : randInt(65, 90);

        rows.push({
          id: uuid(), role, role_fr: roleFr, field, region: city,
          experience_level: level,
          salary_min: salaryMin, salary_median: salaryMedian, salary_max: salaryMax,
          sample_size: randInt(20, 500),
          growth_rate: parseFloat((Math.random() * 20 - 2).toFixed(1)),
          demand_score: demandScore,
          source: pick(SOURCES),
        });
      }
    }
  }

  // Extra IT specialties
  const IT_SPECS = [
    { en: "Data Scientist", fr: "Data Scientist" },
    { en: "DevOps Engineer", fr: "Ingénieur DevOps" },
    { en: "Cybersecurity Analyst", fr: "Analyste Cybersécurité" },
    { en: "Cloud Architect", fr: "Architecte Cloud" },
    { en: "Full Stack Developer", fr: "Développeur Full Stack" },
    { en: "Mobile Developer", fr: "Développeur Mobile" },
    { en: "AI/ML Engineer", fr: "Ingénieur IA/ML" },
    { en: "QA Engineer", fr: "Ingénieur QA" },
    { en: "Product Manager", fr: "Chef de Produit" },
    { en: "UX Designer", fr: "Designer UX" },
    { en: "Database Administrator", fr: "Administrateur BDD" },
    { en: "Network Engineer", fr: "Ingénieur Réseau" },
    { en: "Scrum Master", fr: "Scrum Master" },
    { en: "Business Analyst", fr: "Analyste Métier" },
    { en: "ERP Consultant", fr: "Consultant ERP" },
  ];

  for (const spec of IT_SPECS) {
    for (const level of ["entry", "mid", "senior"]) {
      const city = pick(REGIONS_SHORT);
      const mult = EXP_MULTIPLIER[level];
      const cf = CITY_FACTOR[city];
      const prefix = LEVEL_PREFIX[level];
      const role = prefix.en ? `${prefix.en} ${spec.en}` : spec.en;
      const roleFr = prefix.fr ? `${prefix.fr} ${spec.fr}` : spec.fr;

      rows.push({
        id: uuid(), role, role_fr: roleFr, field: "genie-informatique",
        region: city, experience_level: level,
        salary_min: roundToThousand(78000 * mult * cf),
        salary_median: roundToThousand(105000 * mult * cf),
        salary_max: roundToThousand(132000 * mult * cf),
        sample_size: randInt(15, 300),
        growth_rate: parseFloat((Math.random() * 25).toFixed(1)),
        demand_score: randInt(70, 98),
        source: pick(SOURCES),
      });
    }
  }

  return rows;
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. SKILL_DEMAND — actual columns:
//   id UUID, skill TEXT, skill_fr TEXT, field TEXT, category TEXT,
//   demand_score INT, growth_trend TEXT, growth_percent REAL,
//   job_count INT, average_salary_boost INT, competition_level TEXT,
//   time_to_learn TEXT, resources JSONB, related_skills JSONB
// ═══════════════════════════════════════════════════════════════════════════

const SKILL_ENTRIES = [
  // Tech
  { en: "Python", fr: "Python", field: "genie-informatique", cat: "technical", demand: 95, trend: "rising", growth: 22.0, boost: 12000, time: "3-6 months", related: ["Django","Flask","FastAPI","Data Science"] },
  { en: "Java", fr: "Java", field: "genie-informatique", cat: "technical", demand: 85, trend: "stable", growth: 8.5, boost: 10000, time: "6-12 months", related: ["Spring Boot","Hibernate","Maven"] },
  { en: "JavaScript", fr: "JavaScript", field: "genie-informatique", cat: "technical", demand: 95, trend: "rising", growth: 15.0, boost: 10000, time: "3-6 months", related: ["React","Node.js","TypeScript"] },
  { en: "React", fr: "React", field: "genie-informatique", cat: "technical", demand: 93, trend: "rising", growth: 20.0, boost: 12000, time: "3-6 months", related: ["Next.js","Redux","TypeScript"] },
  { en: "Angular", fr: "Angular", field: "genie-informatique", cat: "technical", demand: 80, trend: "stable", growth: 10.0, boost: 10000, time: "4-8 months", related: ["TypeScript","RxJS","NgRx"] },
  { en: "Vue.js", fr: "Vue.js", field: "genie-informatique", cat: "technical", demand: 78, trend: "rising", growth: 18.0, boost: 9000, time: "2-4 months", related: ["Nuxt.js","Vuex","Pinia"] },
  { en: "Node.js", fr: "Node.js", field: "genie-informatique", cat: "technical", demand: 90, trend: "rising", growth: 17.0, boost: 11000, time: "3-6 months", related: ["Express","NestJS","MongoDB"] },
  { en: "Docker", fr: "Docker", field: "genie-informatique", cat: "technical", demand: 92, trend: "rising", growth: 25.0, boost: 14000, time: "1-3 months", related: ["Kubernetes","CI/CD","DevOps"] },
  { en: "Kubernetes", fr: "Kubernetes", field: "genie-informatique", cat: "technical", demand: 90, trend: "rising", growth: 30.0, boost: 18000, time: "3-6 months", related: ["Docker","Helm","Istio"] },
  { en: "AWS", fr: "AWS", field: "genie-informatique", cat: "technical", demand: 92, trend: "rising", growth: 28.0, boost: 16000, time: "3-6 months", related: ["EC2","S3","Lambda","CloudFormation"] },
  { en: "Azure", fr: "Azure", field: "genie-informatique", cat: "technical", demand: 82, trend: "rising", growth: 25.0, boost: 14000, time: "3-6 months", related: ["Azure DevOps","Azure Functions","AKS"] },
  { en: "GCP", fr: "GCP", field: "genie-informatique", cat: "technical", demand: 75, trend: "rising", growth: 22.0, boost: 13000, time: "3-6 months", related: ["BigQuery","GKE","Cloud Functions"] },
  { en: "CI/CD", fr: "CI/CD", field: "genie-informatique", cat: "technical", demand: 88, trend: "rising", growth: 20.0, boost: 11000, time: "1-3 months", related: ["Jenkins","GitHub Actions","GitLab CI"] },
  { en: "DevOps", fr: "DevOps", field: "genie-informatique", cat: "technical", demand: 93, trend: "rising", growth: 25.0, boost: 16000, time: "6-12 months", related: ["Docker","Kubernetes","Terraform","Ansible"] },
  { en: "Machine Learning", fr: "Apprentissage Automatique", field: "genie-informatique", cat: "technical", demand: 90, trend: "rising", growth: 35.0, boost: 20000, time: "6-12 months", related: ["Python","TensorFlow","PyTorch","Scikit-Learn"] },
  { en: "Artificial Intelligence", fr: "Intelligence Artificielle", field: "genie-informatique", cat: "technical", demand: 95, trend: "rising", growth: 40.0, boost: 22000, time: "12+ months", related: ["Machine Learning","Deep Learning","NLP","Computer Vision"] },
  { en: "Data Science", fr: "Science des Données", field: "genie-informatique", cat: "technical", demand: 91, trend: "rising", growth: 32.0, boost: 18000, time: "6-12 months", related: ["Python","SQL","Statistics","Machine Learning"] },
  { en: "Cybersecurity", fr: "Cybersécurité", field: "genie-informatique", cat: "technical", demand: 92, trend: "rising", growth: 28.0, boost: 16000, time: "6-12 months", related: ["Network Security","Ethical Hacking","SIEM","Compliance"] },
  { en: "Blockchain", fr: "Blockchain", field: "genie-informatique", cat: "technical", demand: 55, trend: "stable", growth: 12.0, boost: 12000, time: "3-6 months", related: ["Solidity","Smart Contracts","Web3"] },
  { en: "IoT", fr: "Internet des Objets", field: "genie-informatique", cat: "technical", demand: 75, trend: "rising", growth: 18.0, boost: 10000, time: "3-6 months", related: ["Arduino","Raspberry Pi","MQTT","Edge Computing"] },
  { en: "5G Technologies", fr: "Technologies 5G", field: "genie-electrique", cat: "technical", demand: 78, trend: "rising", growth: 22.0, boost: 14000, time: "6-12 months", related: ["Telecom","RF Engineering","Network Architecture"] },
  { en: "Cloud Computing", fr: "Cloud Computing", field: "genie-informatique", cat: "technical", demand: 92, trend: "rising", growth: 26.0, boost: 15000, time: "3-6 months", related: ["AWS","Azure","GCP","Serverless"] },
  { en: "Microservices", fr: "Microservices", field: "genie-informatique", cat: "technical", demand: 80, trend: "rising", growth: 18.0, boost: 12000, time: "3-6 months", related: ["Docker","Kubernetes","API Gateway","Service Mesh"] },
  { en: "GraphQL", fr: "GraphQL", field: "genie-informatique", cat: "technical", demand: 72, trend: "rising", growth: 20.0, boost: 9000, time: "1-2 months", related: ["Apollo","Relay","REST APIs"] },
  { en: "TypeScript", fr: "TypeScript", field: "genie-informatique", cat: "technical", demand: 90, trend: "rising", growth: 28.0, boost: 12000, time: "1-3 months", related: ["JavaScript","React","Node.js","Angular"] },
  { en: "Rust", fr: "Rust", field: "genie-informatique", cat: "technical", demand: 60, trend: "rising", growth: 35.0, boost: 15000, time: "6-12 months", related: ["Systems Programming","WebAssembly","C++"] },
  { en: "Go", fr: "Go", field: "genie-informatique", cat: "technical", demand: 75, trend: "rising", growth: 22.0, boost: 13000, time: "2-4 months", related: ["Microservices","Docker","Cloud Native"] },
  { en: "Kotlin", fr: "Kotlin", field: "genie-informatique", cat: "technical", demand: 72, trend: "rising", growth: 20.0, boost: 10000, time: "2-4 months", related: ["Android","Spring Boot","JVM"] },
  { en: "Swift", fr: "Swift", field: "genie-informatique", cat: "technical", demand: 58, trend: "stable", growth: 12.0, boost: 10000, time: "3-6 months", related: ["iOS","SwiftUI","Xcode"] },
  { en: "Flutter", fr: "Flutter", field: "genie-informatique", cat: "technical", demand: 75, trend: "rising", growth: 25.0, boost: 10000, time: "2-4 months", related: ["Dart","Mobile Dev","React Native"] },
  { en: "React Native", fr: "React Native", field: "genie-informatique", cat: "technical", demand: 78, trend: "stable", growth: 18.0, boost: 10000, time: "2-4 months", related: ["React","JavaScript","Mobile Dev"] },
  { en: "PHP/Laravel", fr: "PHP/Laravel", field: "genie-informatique", cat: "technical", demand: 70, trend: "stable", growth: 5.0, boost: 7000, time: "3-6 months", related: ["MySQL","REST APIs","Blade"] },
  { en: "Spring Boot", fr: "Spring Boot", field: "genie-informatique", cat: "technical", demand: 78, trend: "stable", growth: 12.0, boost: 11000, time: "4-8 months", related: ["Java","Microservices","REST APIs"] },
  { en: "Django", fr: "Django", field: "genie-informatique", cat: "technical", demand: 72, trend: "rising", growth: 14.0, boost: 9000, time: "2-4 months", related: ["Python","REST APIs","PostgreSQL"] },
  { en: "SQL/NoSQL Databases", fr: "Bases de données SQL/NoSQL", field: "genie-informatique", cat: "technical", demand: 90, trend: "stable", growth: 10.0, boost: 8000, time: "2-4 months", related: ["PostgreSQL","MongoDB","Redis","MySQL"] },
  { en: "MongoDB", fr: "MongoDB", field: "genie-informatique", cat: "technical", demand: 75, trend: "rising", growth: 15.0, boost: 8000, time: "1-2 months", related: ["Node.js","NoSQL","Aggregation"] },
  { en: "PostgreSQL", fr: "PostgreSQL", field: "genie-informatique", cat: "technical", demand: 82, trend: "rising", growth: 18.0, boost: 9000, time: "1-3 months", related: ["SQL","Database Design","Performance Tuning"] },
  { en: "Redis", fr: "Redis", field: "genie-informatique", cat: "technical", demand: 72, trend: "rising", growth: 15.0, boost: 8000, time: "1-2 months", related: ["Caching","Pub/Sub","Data Structures"] },
  { en: "Terraform", fr: "Terraform", field: "genie-informatique", cat: "technical", demand: 82, trend: "rising", growth: 28.0, boost: 15000, time: "2-4 months", related: ["IaC","AWS","Azure","Cloud"] },
  { en: "Ansible", fr: "Ansible", field: "genie-informatique", cat: "technical", demand: 72, trend: "stable", growth: 15.0, boost: 10000, time: "1-3 months", related: ["Automation","DevOps","Linux"] },
  { en: "Git/GitHub", fr: "Git/GitHub", field: "genie-informatique", cat: "technical", demand: 95, trend: "stable", growth: 5.0, boost: 5000, time: "1 month", related: ["Version Control","CI/CD","Collaboration"] },
  { en: "Linux Administration", fr: "Administration Linux", field: "genie-informatique", cat: "technical", demand: 82, trend: "stable", growth: 8.0, boost: 9000, time: "3-6 months", related: ["Bash","Shell Scripting","Networking"] },
  { en: "Elasticsearch", fr: "Elasticsearch", field: "genie-informatique", cat: "technical", demand: 70, trend: "rising", growth: 15.0, boost: 10000, time: "2-3 months", related: ["Kibana","Logstash","Search"] },
  { en: "Apache Kafka", fr: "Apache Kafka", field: "genie-informatique", cat: "technical", demand: 75, trend: "rising", growth: 22.0, boost: 13000, time: "2-4 months", related: ["Streaming","Event-Driven","Microservices"] },
  { en: "RPA", fr: "RPA (Automatisation)", field: "genie-informatique", cat: "technical", demand: 72, trend: "rising", growth: 25.0, boost: 11000, time: "2-4 months", related: ["UiPath","Automation Anywhere","Python"] },
  // Engineering
  { en: "AutoCAD", fr: "AutoCAD", field: "genie-civil", cat: "technical", demand: 90, trend: "stable", growth: 5.0, boost: 8000, time: "2-4 months", related: ["Civil 3D","BIM","Revit"] },
  { en: "SolidWorks", fr: "SolidWorks", field: "genie-mecanique", cat: "technical", demand: 88, trend: "stable", growth: 8.0, boost: 10000, time: "3-6 months", related: ["3D Modeling","FEA","CAM"] },
  { en: "CATIA", fr: "CATIA", field: "genie-mecanique", cat: "technical", demand: 80, trend: "stable", growth: 6.0, boost: 11000, time: "4-8 months", related: ["3D Modeling","Surface Design","Assembly"] },
  { en: "MATLAB", fr: "MATLAB", field: "genie-electrique", cat: "technical", demand: 78, trend: "stable", growth: 5.0, boost: 8000, time: "2-4 months", related: ["Simulink","Signal Processing","Control Systems"] },
  { en: "Simulink", fr: "Simulink", field: "genie-electrique", cat: "technical", demand: 72, trend: "stable", growth: 8.0, boost: 9000, time: "3-6 months", related: ["MATLAB","Control Systems","Modeling"] },
  { en: "PLC Programming", fr: "Programmation Automates", field: "genie-electrique", cat: "technical", demand: 88, trend: "rising", growth: 10.0, boost: 10000, time: "3-6 months", related: ["SCADA","HMI","Industrial Automation"] },
  { en: "SCADA Systems", fr: "Systèmes SCADA", field: "genie-electrique", cat: "technical", demand: 78, trend: "rising", growth: 12.0, boost: 9000, time: "3-6 months", related: ["PLC","HMI","Industrial Networks"] },
  { en: "BIM", fr: "BIM (Modélisation)", field: "architecture", cat: "technical", demand: 88, trend: "rising", growth: 25.0, boost: 14000, time: "4-8 months", related: ["Revit","ArchiCAD","Navisworks"] },
  { en: "Revit", fr: "Revit", field: "architecture", cat: "technical", demand: 85, trend: "rising", growth: 20.0, boost: 12000, time: "3-6 months", related: ["BIM","3D Modeling","MEP"] },
  { en: "SAP", fr: "SAP", field: "genie-industriel", cat: "technical", demand: 88, trend: "stable", growth: 10.0, boost: 14000, time: "6-12 months", related: ["ERP","ABAP","Fiori"] },
  { en: "ERP Implementation", fr: "Implémentation ERP", field: "genie-industriel", cat: "technical", demand: 80, trend: "rising", growth: 12.0, boost: 13000, time: "6-12 months", related: ["SAP","Oracle","Business Process"] },
  { en: "Lean Manufacturing", fr: "Lean Manufacturing", field: "genie-industriel", cat: "methodology", demand: 85, trend: "stable", growth: 8.0, boost: 9000, time: "3-6 months", related: ["Six Sigma","Kaizen","5S","Value Stream Mapping"] },
  { en: "Six Sigma", fr: "Six Sigma", field: "genie-industriel", cat: "methodology", demand: 80, trend: "stable", growth: 10.0, boost: 12000, time: "3-6 months", related: ["Lean","DMAIC","Statistics","Quality"] },
  { en: "Kaizen", fr: "Kaizen", field: "genie-industriel", cat: "methodology", demand: 72, trend: "stable", growth: 8.0, boost: 7000, time: "1-2 months", related: ["Lean","Continuous Improvement","5S"] },
  { en: "5S Methodology", fr: "Méthodologie 5S", field: "genie-industriel", cat: "methodology", demand: 70, trend: "stable", growth: 6.0, boost: 5000, time: "1 month", related: ["Lean","Kaizen","Workplace Organization"] },
  { en: "TPM", fr: "TPM", field: "genie-industriel", cat: "methodology", demand: 72, trend: "stable", growth: 8.0, boost: 7000, time: "2-4 months", related: ["Maintenance","OEE","Lean"] },
  { en: "Supply Chain Management", fr: "Gestion Chaîne Logistique", field: "logistique", cat: "technical", demand: 85, trend: "rising", growth: 15.0, boost: 11000, time: "3-6 months", related: ["ERP","WMS","Forecasting"] },
  { en: "WMS", fr: "Systèmes WMS", field: "logistique", cat: "technical", demand: 75, trend: "rising", growth: 18.0, boost: 9000, time: "2-4 months", related: ["Supply Chain","Logistics","Inventory"] },
  { en: "ETABS/Robot Structural", fr: "ETABS/Robot Structural", field: "genie-civil", cat: "technical", demand: 78, trend: "stable", growth: 10.0, boost: 10000, time: "4-8 months", related: ["Structural Analysis","AutoCAD","BIM"] },
  { en: "GIS", fr: "SIG", field: "genie-civil", cat: "technical", demand: 72, trend: "rising", growth: 15.0, boost: 9000, time: "3-6 months", related: ["QGIS","ArcGIS","Remote Sensing"] },
  { en: "Renewable Energy Systems", fr: "Systèmes Énergies Renouvelables", field: "genie-electrique", cat: "technical", demand: 88, trend: "rising", growth: 30.0, boost: 14000, time: "6-12 months", related: ["Solar","Wind","Energy Storage"] },
  { en: "Solar Panel Installation", fr: "Installation Panneaux Solaires", field: "genie-electrique", cat: "technical", demand: 85, trend: "rising", growth: 35.0, boost: 10000, time: "1-3 months", related: ["Renewable Energy","Electrical","PV Design"] },
  { en: "3D Printing", fr: "Impression 3D", field: "genie-mecanique", cat: "technical", demand: 70, trend: "rising", growth: 25.0, boost: 9000, time: "2-4 months", related: ["Additive Manufacturing","CAD","Prototyping"] },
  { en: "CNC Programming", fr: "Programmation CNC", field: "genie-mecanique", cat: "technical", demand: 75, trend: "stable", growth: 8.0, boost: 8000, time: "3-6 months", related: ["G-code","CAM","Machining"] },
  // Business
  { en: "Power BI", fr: "Power BI", field: "management", cat: "technical", demand: 88, trend: "rising", growth: 25.0, boost: 12000, time: "1-3 months", related: ["DAX","Data Visualization","Excel"] },
  { en: "Tableau", fr: "Tableau", field: "management", cat: "technical", demand: 78, trend: "rising", growth: 18.0, boost: 11000, time: "1-3 months", related: ["Data Visualization","SQL","Analytics"] },
  { en: "Advanced Excel", fr: "Excel Avancé", field: "finance", cat: "technical", demand: 90, trend: "stable", growth: 5.0, boost: 6000, time: "1-2 months", related: ["VBA","Pivot Tables","Power Query"] },
  { en: "Salesforce", fr: "Salesforce", field: "commerce", cat: "technical", demand: 78, trend: "rising", growth: 15.0, boost: 12000, time: "3-6 months", related: ["CRM","Apex","Lightning"] },
  { en: "HubSpot", fr: "HubSpot", field: "marketing", cat: "technical", demand: 72, trend: "rising", growth: 20.0, boost: 8000, time: "1-2 months", related: ["Inbound Marketing","CRM","Email Marketing"] },
  { en: "Google Analytics", fr: "Google Analytics", field: "marketing", cat: "technical", demand: 85, trend: "stable", growth: 12.0, boost: 7000, time: "1-2 months", related: ["GA4","Tag Manager","Data Analysis"] },
  { en: "SEO", fr: "Référencement Naturel", field: "marketing", cat: "technical", demand: 85, trend: "rising", growth: 15.0, boost: 9000, time: "3-6 months", related: ["Content Marketing","Google Analytics","SEM"] },
  { en: "SEM/Google Ads", fr: "SEM/Google Ads", field: "marketing", cat: "technical", demand: 80, trend: "stable", growth: 12.0, boost: 9000, time: "1-3 months", related: ["PPC","Google Analytics","Digital Marketing"] },
  { en: "Project Management", fr: "Gestion de Projet", field: "management", cat: "soft", demand: 90, trend: "stable", growth: 10.0, boost: 10000, time: "3-6 months", related: ["PMP","Agile","Scrum","MS Project"] },
  { en: "Agile Methodology", fr: "Méthodologie Agile", field: "management", cat: "methodology", demand: 88, trend: "rising", growth: 18.0, boost: 11000, time: "1-3 months", related: ["Scrum","Kanban","SAFe","Sprint Planning"] },
  { en: "Scrum", fr: "Scrum", field: "management", cat: "methodology", demand: 85, trend: "rising", growth: 15.0, boost: 10000, time: "1-2 months", related: ["Agile","Kanban","Product Owner","Sprint"] },
  { en: "PMP Certification", fr: "Certification PMP", field: "management", cat: "certification", demand: 82, trend: "stable", growth: 10.0, boost: 15000, time: "3-6 months", related: ["Project Management","PMBOK","Risk Management"] },
  { en: "Financial Modeling", fr: "Modélisation Financière", field: "finance", cat: "technical", demand: 85, trend: "rising", growth: 12.0, boost: 15000, time: "3-6 months", related: ["Excel","Valuation","DCF","M&A"] },
  { en: "Risk Management", fr: "Gestion des Risques", field: "finance", cat: "soft", demand: 78, trend: "stable", growth: 10.0, boost: 11000, time: "3-6 months", related: ["Compliance","Insurance","Financial Analysis"] },
  { en: "IFRS Accounting", fr: "Comptabilité IFRS", field: "finance", cat: "technical", demand: 80, trend: "stable", growth: 8.0, boost: 10000, time: "6-12 months", related: ["Financial Reporting","Audit","Taxation"] },
  { en: "Audit & Compliance", fr: "Audit et Conformité", field: "finance", cat: "technical", demand: 78, trend: "stable", growth: 10.0, boost: 10000, time: "6-12 months", related: ["IFRS","Internal Controls","Risk Management"] },
  { en: "Digital Marketing", fr: "Marketing Digital", field: "marketing", cat: "technical", demand: 88, trend: "rising", growth: 22.0, boost: 10000, time: "3-6 months", related: ["SEO","Social Media","Content Marketing","PPC"] },
  { en: "Content Marketing", fr: "Marketing de Contenu", field: "marketing", cat: "soft", demand: 78, trend: "rising", growth: 18.0, boost: 7000, time: "2-4 months", related: ["SEO","Blogging","Copywriting"] },
  { en: "Social Media Management", fr: "Gestion Réseaux Sociaux", field: "marketing", cat: "technical", demand: 75, trend: "rising", growth: 15.0, boost: 6000, time: "1-2 months", related: ["Content Creation","Analytics","Community Management"] },
  { en: "E-commerce", fr: "E-commerce", field: "commerce", cat: "technical", demand: 85, trend: "rising", growth: 25.0, boost: 10000, time: "3-6 months", related: ["Shopify","WooCommerce","Digital Marketing"] },
  { en: "CRM Systems", fr: "Systèmes CRM", field: "commerce", cat: "technical", demand: 78, trend: "stable", growth: 12.0, boost: 9000, time: "2-4 months", related: ["Salesforce","HubSpot","Customer Service"] },
  { en: "Negotiation Skills", fr: "Techniques de Négociation", field: "commerce", cat: "soft", demand: 75, trend: "stable", growth: 5.0, boost: 7000, time: "1-2 months", related: ["Sales","Communication","Conflict Resolution"] },
  { en: "Labor Law", fr: "Droit du Travail", field: "droit", cat: "technical", demand: 78, trend: "stable", growth: 8.0, boost: 9000, time: "6-12 months", related: ["HR Law","Employment Contracts","Compliance"] },
  { en: "Business Law", fr: "Droit des Affaires", field: "droit", cat: "technical", demand: 80, trend: "stable", growth: 10.0, boost: 11000, time: "6-12 months", related: ["Corporate Law","Contracts","M&A"] },
  { en: "International Trade Law", fr: "Droit du Commerce International", field: "droit", cat: "technical", demand: 65, trend: "rising", growth: 12.0, boost: 10000, time: "6-12 months", related: ["Trade Regulations","Customs","WTO"] },
  { en: "Talent Acquisition", fr: "Acquisition de Talents", field: "ressources-humaines", cat: "soft", demand: 78, trend: "rising", growth: 15.0, boost: 8000, time: "2-4 months", related: ["Sourcing","ATS","Employer Branding"] },
  { en: "HRIS Systems", fr: "Systèmes SIRH", field: "ressources-humaines", cat: "technical", demand: 75, trend: "rising", growth: 18.0, boost: 9000, time: "2-4 months", related: ["SAP SuccessFactors","Workday","Payroll"] },
  { en: "Organizational Development", fr: "Développement Organisationnel", field: "ressources-humaines", cat: "soft", demand: 72, trend: "stable", growth: 10.0, boost: 9000, time: "6-12 months", related: ["Change Management","Culture","Training"] },
  { en: "Hospitality Management", fr: "Gestion Hôtelière", field: "tourisme", cat: "technical", demand: 78, trend: "rising", growth: 12.0, boost: 8000, time: "6-12 months", related: ["Hotel Operations","F&B","Guest Relations"] },
  { en: "Tourism Marketing", fr: "Marketing Touristique", field: "tourisme", cat: "technical", demand: 72, trend: "rising", growth: 15.0, boost: 7000, time: "3-6 months", related: ["Digital Marketing","Destination Marketing","Social Media"] },
  { en: "Precision Agriculture", fr: "Agriculture de Précision", field: "agriculture", cat: "technical", demand: 75, trend: "rising", growth: 25.0, boost: 12000, time: "6-12 months", related: ["GIS","Drones","IoT","Data Analysis"] },
  { en: "Agronomy", fr: "Agronomie", field: "agriculture", cat: "technical", demand: 72, trend: "stable", growth: 8.0, boost: 7000, time: "12+ months", related: ["Soil Science","Crop Management","Irrigation"] },
  { en: "Food Safety (HACCP)", fr: "Sécurité Alimentaire (HACCP)", field: "agriculture", cat: "certification", demand: 82, trend: "stable", growth: 12.0, boost: 9000, time: "1-3 months", related: ["ISO 22000","Quality Control","Food Processing"] },
  { en: "Pharmaceutical Regulation", fr: "Réglementation Pharmaceutique", field: "pharmacie", cat: "technical", demand: 78, trend: "stable", growth: 10.0, boost: 11000, time: "6-12 months", related: ["GMP","Drug Registration","Quality Assurance"] },
  { en: "Clinical Research", fr: "Recherche Clinique", field: "medecine", cat: "technical", demand: 78, trend: "rising", growth: 18.0, boost: 14000, time: "12+ months", related: ["Clinical Trials","GCP","Biostatistics"] },
  { en: "Medical Imaging", fr: "Imagerie Médicale", field: "medecine", cat: "technical", demand: 75, trend: "rising", growth: 15.0, boost: 12000, time: "12+ months", related: ["Radiology","CT","MRI","Ultrasound"] },
  { en: "Telemedicine", fr: "Télémédecine", field: "medecine", cat: "technical", demand: 82, trend: "rising", growth: 30.0, boost: 13000, time: "3-6 months", related: ["Digital Health","Remote Consultation","Health Tech"] },
  { en: "Urban Planning", fr: "Urbanisme", field: "architecture", cat: "technical", demand: 72, trend: "stable", growth: 10.0, boost: 9000, time: "12+ months", related: ["GIS","Zoning","Sustainable Development"] },
  { en: "Sustainable Design", fr: "Conception Durable", field: "architecture", cat: "technical", demand: 82, trend: "rising", growth: 22.0, boost: 12000, time: "6-12 months", related: ["LEED","Green Building","Energy Efficiency"] },
  { en: "Next.js", fr: "Next.js", field: "genie-informatique", cat: "technical", demand: 78, trend: "rising", growth: 30.0, boost: 11000, time: "2-4 months", related: ["React","Vercel","SSR","TypeScript"] },
  { en: "Figma", fr: "Figma", field: "genie-informatique", cat: "technical", demand: 80, trend: "rising", growth: 20.0, boost: 7000, time: "1-2 months", related: ["UI/UX","Prototyping","Design Systems"] },
  { en: "Prometheus/Grafana", fr: "Prometheus/Grafana", field: "genie-informatique", cat: "technical", demand: 72, trend: "rising", growth: 22.0, boost: 10000, time: "1-3 months", related: ["Monitoring","Observability","DevOps"] },
  { en: "Deep Learning", fr: "Apprentissage Profond", field: "genie-informatique", cat: "technical", demand: 82, trend: "rising", growth: 32.0, boost: 18000, time: "6-12 months", related: ["Neural Networks","TensorFlow","PyTorch"] },
  { en: "NLP", fr: "Traitement du Langage Naturel", field: "genie-informatique", cat: "technical", demand: 78, trend: "rising", growth: 35.0, boost: 18000, time: "6-12 months", related: ["BERT","GPT","Text Analysis","Python"] },
  { en: "Computer Vision", fr: "Vision par Ordinateur", field: "genie-informatique", cat: "technical", demand: 75, trend: "rising", growth: 30.0, boost: 16000, time: "6-12 months", related: ["OpenCV","CNN","Image Processing"] },
];

function buildSkillDemand() {
  const rows = [];
  for (const s of SKILL_ENTRIES) {
    rows.push({
      id: uuid(),
      skill: s.en,
      skill_fr: s.fr,
      field: s.field,
      category: s.cat,
      demand_score: s.demand,
      growth_trend: s.trend,
      growth_percent: s.growth,
      job_count: randInt(50, 5000),
      average_salary_boost: s.boost,
      competition_level: s.demand >= 85 ? "high" : s.demand >= 70 ? "medium" : "low",
      time_to_learn: s.time,
      resources: null,
      related_skills: JSON.stringify(s.related),
    });
  }
  return rows;
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. REGIONAL_JOB_STATS — actual columns:
//   id UUID, region TEXT, region_fr TEXT, total_jobs INT, job_growth REAL,
//   average_salary INT, top_industries JSONB, top_employers JSONB,
//   skills_in_demand JSONB, unemployment_rate REAL, cost_of_living TEXT,
//   quality_of_life INT
// ═══════════════════════════════════════════════════════════════════════════

const REGION_DATA = [
  { slug: "casablanca-settat", fr: "Casablanca-Settat", jobs: 45000, growth: 12.0, salary: 9500, unemp: 9.5, col: "80", qol: 72,
    industries: ["tech","industrial","finance","services"], employers: ["OCP Group","Attijariwafa Bank","Capgemini","Renault"], skills: ["Python","DevOps","Financial Modeling","SAP"] },
  { slug: "rabat-sale-kenitra", fr: "Rabat-Salé-Kénitra", jobs: 28000, growth: 10.0, salary: 8800, unemp: 10.2, col: "78", qol: 78,
    industries: ["tech","services","healthcare","automotive"], employers: ["CDG","CNSS","Bombardier","PSA Kenitra"], skills: ["Java","Project Management","Public Administration","Data Analysis"] },
  { slug: "tanger-tetouan-al-hoceima", fr: "Tanger-Tétouan-Al Hoceima", jobs: 22000, growth: 14.0, salary: 7800, unemp: 11.5, col: "65", qol: 68,
    industries: ["automotive","industrial","logistics","energy"], employers: ["Renault Tanger","Tanger Med","Siemens Gamesa","Fujikura"], skills: ["PLC Programming","Supply Chain","Quality Control","AutoCAD"] },
  { slug: "marrakech-safi", fr: "Marrakech-Safi", jobs: 18000, growth: 8.5, salary: 7200, unemp: 12.0, col: "60", qol: 70,
    industries: ["tourisme","services","agriculture","mining"], employers: ["Accor Hotels","Marriott","OCP Safi","Club Med"], skills: ["Hospitality Management","Tourism Marketing","Digital Marketing","Languages"] },
  { slug: "fes-meknes", fr: "Fès-Meknès", jobs: 15000, growth: 7.0, salary: 7000, unemp: 13.0, col: "55", qol: 65,
    industries: ["industrial","agriculture","services","tech"], employers: ["Groupe Ynna","Holcim","Fès Shore","Brasseries du Maroc"], skills: ["AutoCAD","SolidWorks","Quality Management","ERP"] },
  { slug: "souss-massa", fr: "Souss-Massa", jobs: 14000, growth: 9.0, salary: 7000, unemp: 11.8, col: "58", qol: 72,
    industries: ["agriculture","tourisme","services","industrial"], employers: ["Delassus Group","Copag","Agadir Port","Tikida Hotels"], skills: ["Agronomy","Tourism Management","Export Management","Quality Control"] },
  { slug: "oriental", fr: "Oriental", jobs: 8000, growth: 5.0, salary: 6500, unemp: 15.0, col: "48", qol: 58,
    industries: ["industrial","mining","services","commerce"], employers: ["Oujda Shore","Sonasid","SNEP"], skills: ["Welding","Electrical Maintenance","Commerce","Administration"] },
  { slug: "beni-mellal-khenifra", fr: "Béni Mellal-Khénifra", jobs: 7000, growth: 4.5, salary: 6200, unemp: 14.5, col: "45", qol: 55,
    industries: ["mining","agriculture","industrial"], employers: ["OCP Khouribga","Al Omrane","Cosumar"], skills: ["Mining Engineering","Agriculture","Maintenance","Safety"] },
  { slug: "draa-tafilalet", fr: "Drâa-Tafilalet", jobs: 5000, growth: 3.5, salary: 6000, unemp: 16.0, col: "42", qol: 52,
    industries: ["mining","agriculture","tourisme"], employers: ["Managem Group","ONEE","CTM"], skills: ["Mining","Agriculture","Tourism","Renewable Energy"] },
  { slug: "guelmim-oued-noun", fr: "Guelmim-Oued Noun", jobs: 3500, growth: 4.0, salary: 5800, unemp: 16.5, col: "40", qol: 50,
    industries: ["agriculture","services","fishing"], employers: ["ONEE","Al Omrane","Commune de Guelmim"], skills: ["Agriculture","Fishing","Administration","Trade"] },
  { slug: "laayoune-sakia-el-hamra", fr: "Laâyoune-Sakia El Hamra", jobs: 4000, growth: 6.0, salary: 6800, unemp: 14.0, col: "50", qol: 55,
    industries: ["mining","fishing","energy"], employers: ["Phosboucraa","ONEE","Maroc Phosphore"], skills: ["Mining","Phosphate Processing","Renewable Energy","Logistics"] },
  { slug: "dakhla-oued-ed-dahab", fr: "Dakhla-Oued Ed-Dahab", jobs: 3000, growth: 8.0, salary: 6500, unemp: 13.0, col: "45", qol: 58,
    industries: ["fishing","tourisme","agriculture","energy"], employers: ["Port Dakhla","ANDA","Commune de Dakhla"], skills: ["Fishing","Tourism","Wind Energy","Agriculture"] },
];

const REGIONAL_FIELDS = [
  "genie-informatique", "genie-civil", "genie-industriel", "commerce",
  "finance", "management", "logistique", "marketing", "tourisme",
  "genie-electrique", "medecine", "agriculture", "ressources-humaines",
];

function buildRegionalJobStats() {
  const rows = [];

  for (const rd of REGION_DATA) {
    for (const field of REGIONAL_FIELDS) {
      const fieldMult = {
        "genie-informatique": 1.2, "finance": 1.1, "management": 1.0,
        "commerce": 0.9, "logistique": 0.8, "genie-civil": 0.7,
        "genie-industriel": 0.7, "marketing": 0.7, "genie-electrique": 0.6,
        "tourisme": 0.6, "medecine": 0.5, "agriculture": 0.5,
        "ressources-humaines": 0.4,
      };
      const fm = fieldMult[field] || 0.5;
      const totalJobs = Math.round(rd.jobs * fm * (0.7 + Math.random() * 0.6));
      const avgSalary = Math.round(rd.salary * fm * (0.85 + Math.random() * 0.3));
      const jobGrowth = parseFloat((rd.growth * (0.5 + Math.random()) - 2).toFixed(1));

      rows.push({
        id: uuid(),
        region: rd.slug,
        region_fr: rd.fr,
        total_jobs: totalJobs,
        job_growth: jobGrowth,
        average_salary: avgSalary,
        top_industries: JSON.stringify(rd.industries),
        top_employers: JSON.stringify(rd.employers),
        skills_in_demand: JSON.stringify(rd.skills),
        unemployment_rate: parseFloat((rd.unemp + (Math.random() * 4 - 2)).toFixed(1)),
        cost_of_living: rd.col,
        quality_of_life: rd.qol + randInt(-5, 5),
      });
    }
  }
  return rows;
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. SUCCESS_STORY — actual columns (id is TEXT, not UUID):
//   id TEXT, graduate_name TEXT, graduation_year INT, program_id TEXT,
//   program_name TEXT, current_role TEXT, current_role_en TEXT,
//   company TEXT, location TEXT, salary_range TEXT,
//   story_fr TEXT, story_en TEXT, key_achievement TEXT, key_achievement_fr TEXT,
//   advice_fr TEXT, advice_en TEXT, tags JSONB, field TEXT,
//   is_featured BOOL, is_active BOOL, sort_order INT
// ═══════════════════════════════════════════════════════════════════════════

const FIRST_M = ["Mohamed","Youssef","Omar","Rachid","Hamza","Amine","Khalid","Mehdi","Karim","Samir","Hicham","Othmane","Zakaria","Ilyas","Ayoub","Soufiane","Adil","Mustapha","Tarik","Nabil","Said","Driss","Hassan","Walid","Brahim","Fouad","Ismail","Jawad","Aziz","Badr"];
const FIRST_F = ["Fatima","Khadija","Amina","Sanaa","Nora","Salma","Leila","Hajar","Imane","Soukaina","Meryem","Zineb","Asmae","Ghita","Karima","Hind","Wiam","Safae","Layla","Dounia","Sara","Nadia","Houda","Chaimae","Rajae","Samira","Nawal","Bouchra","Fadwa","Ikram"];
const LAST = ["El Amrani","Benali","Tazi","Chraibi","Lahlou","Benmoussa","El Fassi","Hajji","Berrada","Kettani","El Idrissi","Bennani","Alaoui","Bouzidi","Cherkaoui","El Mansouri","Filali","Benchekroun","El Ouafi","Zeroual","Ait Brahim","Ouazzani","Regragui","Lamrani","Mouline","Senhaji","Belkadi","Squalli","Guedira","Rifi"];
const UNIS = ["IMTA","UM5","UM6P","ENSA Marrakech","ENSA Tanger","ENCG Casablanca","ENCG Settat","EMI","EHTP","ENSIAS","INPT","UIR","EMSI","Al Akhawayn","FST Fes","FSJES Casablanca","ENSA Kenitra","ENSEM","ENSAM Meknes","ISCAE","HEM","Mundiapolis","Ecole Hassania","ENSA Fes","ENSET Mohammedia"];
const COMPANIES = ["OCP Group","Maroc Telecom","Attijariwafa Bank","Capgemini Maroc","CGI Maroc","Atos Maroc","Sopra Steria Maroc","IBM Maroc","Oracle Maroc","Microsoft Maroc","Deloitte Maroc","PwC Maroc","KPMG Maroc","EY Maroc","BCP","BMCE Bank","CIH Bank","Société Générale Maroc","Renault Maroc","Royal Air Maroc","ONCF","Lydec","Cosumar","Managem","Holcim Maroc","LafargeHolcim","Inwi","Orange Maroc","Tanger Med","Ubisoft Maroc","Thales Maroc","Alten Maroc","SQLI Maroc","HPS","M2M Group","Involys","S2M","Webhelp Maroc","Intelcia","Majorel","Cegedim Maroc","Amazon Maroc","Altran Maroc"];

const PROGRAMS = [
  { id: "prog_gi", name: "Génie Informatique" },
  { id: "prog_gc", name: "Génie Civil" },
  { id: "prog_ge", name: "Génie Électrique" },
  { id: "prog_gm", name: "Génie Mécanique" },
  { id: "prog_gind", name: "Génie Industriel" },
  { id: "prog_log", name: "Logistique" },
  { id: "prog_mgt", name: "Management" },
  { id: "prog_com", name: "Commerce" },
  { id: "prog_fin", name: "Finance" },
  { id: "prog_mkt", name: "Marketing" },
  { id: "prog_rh", name: "Ressources Humaines" },
  { id: "prog_dr", name: "Droit" },
  { id: "prog_med", name: "Médecine" },
  { id: "prog_pharm", name: "Pharmacie" },
  { id: "prog_arch", name: "Architecture" },
  { id: "prog_tour", name: "Tourisme" },
  { id: "prog_agri", name: "Agriculture" },
];

const ROLE_FR_MAP = {
  "genie-informatique": "Ingénieur Logiciel", "genie-civil": "Ingénieur Génie Civil",
  "genie-electrique": "Ingénieur Électrique", "genie-mecanique": "Ingénieur Mécanique",
  "genie-industriel": "Ingénieur Industriel", "logistique": "Responsable Logistique",
  "management": "Manager", "commerce": "Responsable Commercial",
  "finance": "Analyste Financier", "marketing": "Responsable Marketing",
  "ressources-humaines": "Responsable RH", "droit": "Juriste",
  "medecine": "Médecin", "pharmacie": "Pharmacien(ne)",
  "architecture": "Architecte", "tourisme": "Responsable Tourisme",
  "agriculture": "Ingénieur Agronome",
};

const ROLE_EN_MAP = {
  "genie-informatique": "Software Engineer", "genie-civil": "Civil Engineer",
  "genie-electrique": "Electrical Engineer", "genie-mecanique": "Mechanical Engineer",
  "genie-industriel": "Industrial Engineer", "logistique": "Logistics Manager",
  "management": "Business Manager", "commerce": "Sales Manager",
  "finance": "Financial Analyst", "marketing": "Marketing Manager",
  "ressources-humaines": "HR Manager", "droit": "Legal Consultant",
  "medecine": "Medical Professional", "pharmacie": "Pharmacist",
  "architecture": "Architect", "tourisme": "Tourism Manager",
  "agriculture": "Agricultural Engineer",
};

const SALARY_RANGES = [
  "6000-10000 MAD","8000-12000 MAD","10000-15000 MAD","12000-18000 MAD",
  "15000-22000 MAD","18000-25000 MAD","20000-30000 MAD","25000-35000 MAD",
  "30000-45000 MAD","35000-50000 MAD",
];

const STORIES_EN = [
  (n,c,u) => `After graduating from ${u}, ${n} joined ${c} as an intern. Through determination and continuous learning, they rose to a senior position within 3 years, leading a team of 12 engineers.`,
  (n,c,u) => `${n} started their career with a passion for technology. After completing studies at ${u}, they landed a role at ${c} and today manage a department of 20+ people, driving digital transformation.`,
  (n,c,u) => `Coming from a modest background, ${n} earned a scholarship to ${u}. Their exceptional thesis caught the attention of ${c}, where they now serve as a technical lead on cutting-edge projects.`,
  (n,c,u) => `${n} graduated from ${u} and co-founded a startup before joining ${c}. Their entrepreneurial spirit and technical expertise earned them a promotion to project director within 2 years.`,
  (n,c,u) => `After studying at ${u}, ${n} completed an internship at ${c} that became a full-time role. Their innovative approach led to a patent and recognition as one of Morocco's top young professionals.`,
  (n,c,u) => `${n} combined studies at ${u} with freelance work, giving them a unique perspective valued by ${c}, leading to rapid career progression and international project assignments.`,
  (n,c,u) => `With a degree from ${u}, ${n} initially struggled to find work. After building a strong portfolio through open-source contributions, ${c} recruited them to lead their innovation lab.`,
  (n,c,u) => `${n} attended ${u} where they excelled in their field. A mentorship program connected them with ${c}, where they now guide new graduates while advancing their own career.`,
  (n,c,u) => `Passionate since childhood, ${n} pursued studies at ${u} and graduated top of class. ${c} offered a role in R&D, where they have filed 3 patents in sustainable technology.`,
  (n,c,u) => `${n} transitioned from academic studies at ${u} to consulting at ${c}. Their cross-disciplinary skills proved invaluable for digital strategy across North Africa.`,
];

const STORIES_FR = [
  (n,c,u) => `Après avoir obtenu son diplôme de ${u}, ${n} a rejoint ${c} en tant que stagiaire. Grâce à sa détermination, il/elle a atteint un poste senior en 3 ans, dirigeant une équipe de 12 ingénieurs.`,
  (n,c,u) => `${n} a débuté sa carrière avec une passion pour la technologie. Après ses études à ${u}, il/elle a décroché un poste chez ${c} et dirige aujourd'hui un département de plus de 20 personnes.`,
  (n,c,u) => `Issu(e) d'un milieu modeste, ${n} a obtenu une bourse pour ${u}. Son mémoire exceptionnel a attiré l'attention de ${c}, où il/elle est maintenant responsable technique.`,
  (n,c,u) => `${n} est diplômé(e) de ${u} et a cofondé une startup avant de rejoindre ${c}. Son esprit entrepreneurial l'a propulsé(e) au poste de directeur de projet en 2 ans.`,
  (n,c,u) => `Après des études à ${u}, ${n} a effectué un stage chez ${c} qui s'est transformé en CDI. Son approche innovante a mené à un brevet et une reconnaissance nationale.`,
  (n,c,u) => `${n} a combiné ses études à ${u} avec du travail freelance. Cette double expérience a été valorisée par ${c}, menant à une progression rapide et des missions internationales.`,
  (n,c,u) => `Diplômé(e) de ${u}, ${n} a d'abord eu du mal à trouver du travail. Après avoir contribué à des projets open-source, ${c} l'a recruté(e) pour diriger le lab d'innovation.`,
  (n,c,u) => `${n} a étudié à ${u} où il/elle a excellé. Un programme de mentorat l'a mis(e) en contact avec ${c}. Aujourd'hui, il/elle accompagne les nouveaux diplômés.`,
  (n,c,u) => `Passionné(e) depuis l'enfance, ${n} a étudié à ${u} et a terminé major de promotion. ${c} lui a offert un poste en R&D, où il/elle a déposé 3 brevets.`,
  (n,c,u) => `${n} est passé(e) des études à ${u} au conseil chez ${c}. Ses compétences transversales sont devenues indispensables pour les stratégies digitales en Afrique du Nord.`,
];

const ACHIEVEMENTS_EN = ["Led a team that delivered a critical project 2 months ahead of schedule","Developed an automated system that reduced processing time by 60%","Awarded Employee of the Year for exceptional contributions","Published 3 research papers in international journals","Increased department revenue by 40% through strategic initiatives","Built a mentorship program that helped 50+ junior employees","Implemented a quality management system that reduced defects by 75%","Secured a major international client worth 2M MAD annually","Designed a sustainable solution that won a national innovation award","Created a training program adopted company-wide across 5 locations"];
const ACHIEVEMENTS_FR = ["A dirigé une équipe qui a livré un projet critique 2 mois en avance","A développé un système automatisé réduisant le temps de traitement de 60%","Nommé(e) Employé(e) de l'année pour contributions exceptionnelles","A publié 3 articles de recherche dans des revues internationales","A augmenté le chiffre d'affaires du département de 40%","A créé un programme de mentorat ayant aidé plus de 50 juniors","A mis en place un système qualité réduisant les défauts de 75%","A décroché un client international majeur de 2M MAD par an","A conçu une solution durable primée au niveau national","A créé un programme de formation adopté dans 5 sites"];
const ADVICE_EN = ["Never stop learning. The market evolves fast and continuous education is key.","Build a strong network early. Connections open doors that skills alone cannot.","Do not be afraid to take risks. Startup experience teaches more than any classroom.","Focus on solving real problems. Impact is what gets you promoted.","Find a mentor who challenges you. Growth comes from constructive feedback.","Invest in soft skills as much as technical ones.","Be patient but persistent. Career success requires talent and resilience.","Contribute to open-source projects to build your portfolio.","Learn French AND English fluently for more opportunities in Morocco.","Start with any opportunity, then pivot strategically."];
const ADVICE_FR = ["Ne cessez jamais d'apprendre. Le marché évolue vite.","Construisez un réseau solide dès le début de votre carrière.","N'ayez pas peur de prendre des risques.","Concentrez-vous sur la résolution de vrais problèmes.","Trouvez un mentor qui vous challenge.","Investissez dans les soft skills autant que dans les compétences techniques.","Soyez patient mais persévérant.","Contribuez à des projets open-source.","Maîtrisez le français ET l'anglais.","Commencez par n'importe quelle opportunité, puis pivotez."];
const TAGS_POOL = ["leadership","innovation","entrepreneurship","digital-transformation","sustainability","mentoring","research","international","startup","women-in-tech","self-taught","scholarship","award-winner","community-builder","open-source","patent-holder","career-change","remote-work"];

function buildSuccessStories() {
  const rows = [];
  let sortOrder = 50;
  const usedIds = new Set();

  for (let i = 0; i < 115; i++) {
    const isFemale = Math.random() < 0.45;
    const firstName = isFemale ? pick(FIRST_F) : pick(FIRST_M);
    const lastName = pick(LAST);
    const fullName = `${firstName} ${lastName}`;
    const slug = fullName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    const storyId = `story_${slug}_${i}`;
    if (usedIds.has(storyId)) continue;
    usedIds.add(storyId);

    const field = pick(FIELDS);
    const uni = pick(UNIS);
    const company = pick(COMPANIES);
    const gradYear = randInt(2018, 2025);
    const tIdx = i % STORIES_EN.length;
    const prog = PROGRAMS.find(p => p.id.includes(field.split("-")[1]?.substring(0,3) || "mgt")) || pick(PROGRAMS);

    const tags = [];
    const shuffledTags = [...TAGS_POOL].sort(() => Math.random() - 0.5);
    for (let t = 0; t < randInt(2, 4); t++) tags.push(shuffledTags[t]);

    rows.push({
      id: storyId,
      graduate_name: fullName,
      graduation_year: gradYear,
      program_id: prog.id,
      program_name: prog.name,
      current_role: ROLE_FR_MAP[field] || "Professionnel",
      current_role_en: ROLE_EN_MAP[field] || "Professional",
      company,
      location: pick(REGIONS_SHORT),
      salary_range: pick(SALARY_RANGES),
      story_en: STORIES_EN[tIdx](fullName, company, uni),
      story_fr: STORIES_FR[tIdx](fullName, company, uni),
      key_achievement: pick(ACHIEVEMENTS_EN),
      key_achievement_fr: pick(ACHIEVEMENTS_FR),
      advice_en: pick(ADVICE_EN),
      advice_fr: pick(ADVICE_FR),
      tags: JSON.stringify(tags),
      field,
      is_featured: Math.random() < 0.15,
      is_active: true,
      sort_order: sortOrder++,
    });
  }
  return rows;
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. LEARNING_RESOURCE — actual columns:
//   resource_type = learning_resource_type enum (course,tutorial,book,article,video,podcast,workshop,certification,tool,community)
//   difficulty = learning_difficulty enum (beginner,intermediate,advanced,expert)
//   cost_type = learning_cost_type enum (free,paid,subscription,freemium)
//   skills TEXT[], prerequisites TEXT[], target_fields TEXT[], languages TEXT[], tags TEXT[]
// ═══════════════════════════════════════════════════════════════════════════

const LR_DATA = [
  { title: "IBM Data Science Professional Certificate", title_fr: "Certificat Professionnel IBM Data Science", platform: "Coursera", provider: "IBM", field: "technology", type: "course", diff: "beginner", cost: "paid", price: 4900, dur_min: 18000, dur_wk: 40, lang: ["en"], rating: 4.6, enroll: 800000, skills: ["Python","Data Science","Machine Learning","SQL"], cert: true, certName: "IBM Data Science Professional Certificate", url: "https://www.coursera.org/professional-certificates/ibm-data-science" },
  { title: "Google IT Automation with Python", title_fr: "Automatisation IT Google avec Python", platform: "Coursera", provider: "Google", field: "technology", type: "course", diff: "beginner", cost: "paid", price: 4900, dur_min: 14400, dur_wk: 32, lang: ["en"], rating: 4.7, enroll: 600000, skills: ["Python","Automation","Git","Cloud"], cert: true, certName: "Google IT Automation Certificate", url: "https://www.coursera.org/professional-certificates/google-it-automation" },
  { title: "AWS Cloud Solutions Architect", title_fr: "Architecte Solutions Cloud AWS", platform: "Coursera", provider: "AWS", field: "technology", type: "course", diff: "intermediate", cost: "paid", price: 4900, dur_min: 10800, dur_wk: 24, lang: ["en"], rating: 4.5, enroll: 200000, skills: ["AWS","Cloud Architecture","EC2","S3","Lambda"], cert: true, certName: "AWS Solutions Architect", url: "https://www.coursera.org/professional-certificates/aws-cloud-solutions-architect" },
  { title: "Meta Front-End Developer", title_fr: "Développeur Front-End Meta", platform: "Coursera", provider: "Meta", field: "technology", type: "course", diff: "beginner", cost: "paid", price: 4900, dur_min: 12600, dur_wk: 28, lang: ["en"], rating: 4.7, enroll: 400000, skills: ["React","JavaScript","HTML","CSS","UI/UX"], cert: true, certName: "Meta Front-End Developer Certificate", url: "https://www.coursera.org/professional-certificates/meta-front-end-developer" },
  { title: "Google Cybersecurity Certificate", title_fr: "Certificat Cybersécurité Google", platform: "Coursera", provider: "Google", field: "technology", type: "course", diff: "beginner", cost: "paid", price: 4900, dur_min: 10800, dur_wk: 24, lang: ["en"], rating: 4.8, enroll: 500000, skills: ["Cybersecurity","Network Security","SIEM","Linux"], cert: true, certName: "Google Cybersecurity Certificate", url: "https://www.coursera.org/professional-certificates/google-cybersecurity" },
  { title: "Deep Learning Specialization", title_fr: "Spécialisation Deep Learning", platform: "Coursera", provider: "DeepLearning.AI", field: "technology", type: "course", diff: "intermediate", cost: "paid", price: 4900, dur_min: 9000, dur_wk: 20, lang: ["en"], rating: 4.9, enroll: 700000, skills: ["Deep Learning","Neural Networks","TensorFlow","Python"], cert: true, certName: "Deep Learning Specialization", url: "https://www.coursera.org/specializations/deep-learning" },
  { title: "Machine Learning by Stanford", title_fr: "Machine Learning par Stanford", platform: "Coursera", provider: "Stanford University", field: "technology", type: "course", diff: "intermediate", cost: "free", price: 0, dur_min: 5400, dur_wk: 12, lang: ["en"], rating: 4.9, enroll: 4000000, skills: ["Machine Learning","Python","Statistics","Algorithms"], cert: false, certName: null, url: "https://www.coursera.org/learn/machine-learning" },
  { title: "Complete Web Developer Bootcamp 2024", title_fr: "Bootcamp Développeur Web Complet 2024", platform: "Udemy", provider: "Dr. Angela Yu", field: "technology", type: "course", diff: "beginner", cost: "paid", price: 1299, dur_min: 3780, dur_wk: null, lang: ["en"], rating: 4.7, enroll: 900000, skills: ["HTML","CSS","JavaScript","React","Node.js","MongoDB"], cert: true, certName: "Udemy Certificate of Completion", url: "https://www.udemy.com/course/the-complete-web-development-bootcamp/" },
  { title: "React - The Complete Guide 2024", title_fr: "React - Le Guide Complet 2024", platform: "Udemy", provider: "Maximilian Schwarzmuller", field: "technology", type: "course", diff: "intermediate", cost: "paid", price: 1299, dur_min: 2880, dur_wk: null, lang: ["en"], rating: 4.7, enroll: 800000, skills: ["React","Redux","Next.js","TypeScript"], cert: true, certName: "Udemy Certificate of Completion", url: "https://www.udemy.com/course/react-the-complete-guide/" },
  { title: "Docker and Kubernetes Complete Guide", title_fr: "Guide Complet Docker et Kubernetes", platform: "Udemy", provider: "Stephen Grider", field: "technology", type: "course", diff: "intermediate", cost: "paid", price: 1299, dur_min: 1320, dur_wk: null, lang: ["en"], rating: 4.6, enroll: 300000, skills: ["Docker","Kubernetes","CI/CD","DevOps"], cert: true, certName: "Udemy Certificate of Completion", url: "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/" },
  { title: "Python for Data Science and ML Bootcamp", title_fr: "Python pour Data Science et ML Bootcamp", platform: "Udemy", provider: "Jose Portilla", field: "technology", type: "course", diff: "intermediate", cost: "paid", price: 1299, dur_min: 1500, dur_wk: null, lang: ["en"], rating: 4.6, enroll: 650000, skills: ["Python","Pandas","Scikit-Learn","TensorFlow"], cert: true, certName: "Udemy Certificate of Completion", url: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/" },
  { title: "Node.js Express MongoDB and More", title_fr: "Node.js Express MongoDB et Plus", platform: "Udemy", provider: "Jonas Schmedtmann", field: "technology", type: "course", diff: "intermediate", cost: "paid", price: 1299, dur_min: 2520, dur_wk: null, lang: ["en"], rating: 4.7, enroll: 250000, skills: ["Node.js","Express","MongoDB","REST APIs"], cert: true, certName: "Udemy Certificate of Completion", url: "https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/" },
  { title: "CS50 Introduction to Computer Science", title_fr: "CS50 Introduction a l Informatique", platform: "edX", provider: "Harvard University", field: "technology", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 6000, dur_wk: 12, lang: ["en"], rating: 4.9, enroll: 3000000, skills: ["C","Python","SQL","Algorithms","Web Development"], cert: false, certName: null, url: "https://www.edx.org/cs50" },
  { title: "Linux Foundation Kubernetes Administration", title_fr: "Administration Kubernetes Linux Foundation", platform: "edX", provider: "Linux Foundation", field: "technology", type: "course", diff: "advanced", cost: "paid", price: 2990, dur_min: 3600, dur_wk: 8, lang: ["en"], rating: 4.5, enroll: 100000, skills: ["Kubernetes","Docker","Linux","Cloud Native"], cert: true, certName: "CKA Preparation", url: "https://www.edx.org/course/introduction-to-kubernetes" },
  { title: "Developpeur Web", title_fr: "Développeur Web", platform: "OpenClassrooms", provider: "OpenClassrooms", field: "technology", type: "course", diff: "beginner", cost: "subscription", price: 3000, dur_min: 32400, dur_wk: 36, lang: ["fr"], rating: 4.3, enroll: 50000, skills: ["HTML","CSS","JavaScript","PHP","MySQL"], cert: true, certName: "Titre RNCP Developpeur Web", url: "https://openclassrooms.com/fr/paths/717-developpeur-web" },
  { title: "Developpeur application Python", title_fr: "Développeur d application Python", platform: "OpenClassrooms", provider: "OpenClassrooms", field: "technology", type: "course", diff: "intermediate", cost: "subscription", price: 3000, dur_min: 43200, dur_wk: 48, lang: ["fr"], rating: 4.4, enroll: 30000, skills: ["Python","Django","REST APIs","PostgreSQL"], cert: true, certName: "Titre RNCP Developpeur Python", url: "https://openclassrooms.com/fr/paths/518-developpeur-dapplication-python" },
  { title: "Data Analyst", title_fr: "Data Analyst", platform: "OpenClassrooms", provider: "OpenClassrooms", field: "technology", type: "course", diff: "intermediate", cost: "subscription", price: 3000, dur_min: 43200, dur_wk: 48, lang: ["fr"], rating: 4.3, enroll: 25000, skills: ["Python","SQL","Power BI","Statistics","Data Visualization"], cert: true, certName: "Titre RNCP Data Analyst", url: "https://openclassrooms.com/fr/paths/528-data-analyst" },
  { title: "Ingenieur Intelligence Artificielle", title_fr: "Ingénieur en Intelligence Artificielle", platform: "OpenClassrooms", provider: "OpenClassrooms", field: "technology", type: "course", diff: "advanced", cost: "subscription", price: 3000, dur_min: 64800, dur_wk: 72, lang: ["fr"], rating: 4.4, enroll: 15000, skills: ["Machine Learning","Deep Learning","Python","NLP"], cert: true, certName: "Titre RNCP Ingenieur IA", url: "https://openclassrooms.com/fr/paths/795-ingenieur-ia" },
  { title: "Chef de Projet Digital", title_fr: "Chef de Projet Digital", platform: "OpenClassrooms", provider: "OpenClassrooms", field: "management", type: "course", diff: "intermediate", cost: "subscription", price: 3000, dur_min: 43200, dur_wk: 48, lang: ["fr"], rating: 4.2, enroll: 20000, skills: ["Project Management","Agile","Scrum","Digital Strategy"], cert: true, certName: "Titre RNCP Chef de Projet", url: "https://openclassrooms.com/fr/paths/chef-projet-digital" },
  { title: "Responsable Marketing Digital", title_fr: "Responsable Marketing Digital", platform: "OpenClassrooms", provider: "OpenClassrooms", field: "marketing", type: "course", diff: "intermediate", cost: "subscription", price: 3000, dur_min: 43200, dur_wk: 48, lang: ["fr"], rating: 4.3, enroll: 18000, skills: ["SEO","Google Analytics","Social Media","Content Marketing"], cert: true, certName: "Titre RNCP Marketing Digital", url: "https://openclassrooms.com/fr/paths/responsable-marketing" },
  { title: "Creez des Pages Web avec HTML et CSS", title_fr: "Créez des Pages Web avec HTML et CSS", platform: "OpenClassrooms", provider: "OpenClassrooms", field: "technology", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 900, dur_wk: null, lang: ["fr"], rating: 4.5, enroll: 200000, skills: ["HTML","CSS","Web Design"], cert: false, certName: null, url: "https://openclassrooms.com/fr/courses/html-css" },
  { title: "Apprenez a Programmer en JavaScript", title_fr: "Apprenez à Programmer en JavaScript", platform: "OpenClassrooms", provider: "OpenClassrooms", field: "technology", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 1200, dur_wk: null, lang: ["fr"], rating: 4.4, enroll: 150000, skills: ["JavaScript","DOM","Events","Functions"], cert: false, certName: null, url: "https://openclassrooms.com/fr/courses/javascript" },
  { title: "Introduction a la Cybersecurite", title_fr: "Introduction à la Cybersécurité", platform: "OpenClassrooms", provider: "OpenClassrooms", field: "technology", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 900, dur_wk: null, lang: ["fr"], rating: 4.2, enroll: 80000, skills: ["Cybersecurity","Network Security","Cryptography"], cert: false, certName: null, url: "https://openclassrooms.com/fr/courses/cybersecurite" },
  { title: "Responsive Web Design Certification", title_fr: "Certification Design Web Responsive", platform: "FreeCodeCamp", provider: "FreeCodeCamp", field: "technology", type: "certification", diff: "beginner", cost: "free", price: 0, dur_min: 18000, dur_wk: null, lang: ["en"], rating: 4.8, enroll: 2000000, skills: ["HTML","CSS","Flexbox","Grid","Responsive Design"], cert: true, certName: "FreeCodeCamp Responsive Web Design", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" },
  { title: "JavaScript Algorithms and Data Structures", title_fr: "Algorithmes et Structures de Donnees JS", platform: "FreeCodeCamp", provider: "FreeCodeCamp", field: "technology", type: "certification", diff: "intermediate", cost: "free", price: 0, dur_min: 18000, dur_wk: null, lang: ["en"], rating: 4.8, enroll: 1500000, skills: ["JavaScript","Algorithms","Data Structures","OOP","Functional Programming"], cert: true, certName: "FreeCodeCamp JS Algorithms", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/" },
  { title: "Back End Development and APIs", title_fr: "Développement Back End et APIs", platform: "FreeCodeCamp", provider: "FreeCodeCamp", field: "technology", type: "certification", diff: "intermediate", cost: "free", price: 0, dur_min: 18000, dur_wk: null, lang: ["en"], rating: 4.7, enroll: 800000, skills: ["Node.js","Express","MongoDB","REST APIs"], cert: true, certName: "FreeCodeCamp Back End", url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/" },
  { title: "Learn Python 3", title_fr: "Apprendre Python 3", platform: "Codecademy", provider: "Codecademy", field: "technology", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 1500, dur_wk: null, lang: ["en"], rating: 4.5, enroll: 500000, skills: ["Python","Programming Fundamentals","Functions","OOP"], cert: false, certName: null, url: "https://www.codecademy.com/learn/learn-python-3" },
  { title: "Full-Stack Engineer Career Path", title_fr: "Parcours Ingenieur Full-Stack", platform: "Codecademy", provider: "Codecademy", field: "technology", type: "course", diff: "beginner", cost: "subscription", price: 2000, dur_min: 10800, dur_wk: 24, lang: ["en"], rating: 4.5, enroll: 200000, skills: ["JavaScript","React","Node.js","SQL","Express"], cert: true, certName: "Codecademy Full-Stack Certificate", url: "https://www.codecademy.com/learn/paths/full-stack-engineer-career-path" },
  { title: "Learn TypeScript", title_fr: "Apprendre TypeScript", platform: "Codecademy", provider: "Codecademy", field: "technology", type: "course", diff: "intermediate", cost: "free", price: 0, dur_min: 600, dur_wk: null, lang: ["en"], rating: 4.4, enroll: 150000, skills: ["TypeScript","Type Safety","Generics","Interfaces"], cert: false, certName: null, url: "https://www.codecademy.com/learn/learn-typescript" },
  { title: "Data Scientist with Python Track", title_fr: "Parcours Data Scientist avec Python", platform: "DataCamp", provider: "DataCamp", field: "technology", type: "course", diff: "intermediate", cost: "subscription", price: 2500, dur_min: 5400, dur_wk: null, lang: ["en"], rating: 4.5, enroll: 300000, skills: ["Python","Pandas","Scikit-Learn","Statistics","Visualization"], cert: true, certName: "DataCamp Data Scientist Certificate", url: "https://www.datacamp.com/tracks/data-scientist-with-python" },
  { title: "SQL Fundamentals", title_fr: "Fondamentaux SQL", platform: "DataCamp", provider: "DataCamp", field: "technology", type: "course", diff: "beginner", cost: "subscription", price: 2500, dur_min: 1260, dur_wk: null, lang: ["en"], rating: 4.5, enroll: 400000, skills: ["SQL","Joins","Subqueries","Aggregation","PostgreSQL"], cert: true, certName: "DataCamp SQL Certificate", url: "https://www.datacamp.com/tracks/sql-fundamentals" },
  { title: "Azure Fundamentals AZ-900", title_fr: "Fondamentaux Azure AZ-900", platform: "Pluralsight", provider: "Pluralsight", field: "technology", type: "course", diff: "beginner", cost: "subscription", price: 2900, dur_min: 720, dur_wk: null, lang: ["en"], rating: 4.5, enroll: 150000, skills: ["Azure","Cloud Computing","IaaS","PaaS","SaaS"], cert: true, certName: "AZ-900 Preparation", url: "https://www.pluralsight.com/paths/microsoft-azure-fundamentals-az-900" },
  { title: "AWS Certified Solutions Architect", title_fr: "Architecte Solutions AWS Certifie", platform: "Pluralsight", provider: "Pluralsight", field: "technology", type: "course", diff: "intermediate", cost: "subscription", price: 2900, dur_min: 2100, dur_wk: null, lang: ["en"], rating: 4.6, enroll: 200000, skills: ["AWS","Architecture","High Availability","Security"], cert: true, certName: "AWS SAA Preparation", url: "https://www.pluralsight.com/paths/aws-certified-solutions-architect-associate" },
  { title: "Ethical Hacking CEH Path", title_fr: "Parcours Hacking Ethique CEH", platform: "Pluralsight", provider: "Pluralsight", field: "technology", type: "course", diff: "advanced", cost: "subscription", price: 2900, dur_min: 2400, dur_wk: null, lang: ["en"], rating: 4.4, enroll: 100000, skills: ["Ethical Hacking","Penetration Testing","Network Security","Cryptography"], cert: true, certName: "CEH Preparation", url: "https://www.pluralsight.com/paths/ethical-hacking-ceh-prep" },
  { title: "Become a Software Developer", title_fr: "Devenir Développeur Logiciel", platform: "LinkedIn Learning", provider: "LinkedIn", field: "technology", type: "course", diff: "beginner", cost: "subscription", price: 3000, dur_min: 1800, dur_wk: null, lang: ["en"], rating: 4.5, enroll: 250000, skills: ["Programming","Git","Web Development","Databases"], cert: true, certName: "LinkedIn Learning Certificate", url: "https://www.linkedin.com/learning/paths/become-a-software-developer" },
  { title: "Become a DevOps Engineer", title_fr: "Devenir Ingenieur DevOps", platform: "LinkedIn Learning", provider: "LinkedIn", field: "technology", type: "course", diff: "intermediate", cost: "subscription", price: 3000, dur_min: 1500, dur_wk: null, lang: ["en"], rating: 4.4, enroll: 150000, skills: ["DevOps","Docker","CI/CD","Monitoring","Automation"], cert: true, certName: "LinkedIn Learning Certificate", url: "https://www.linkedin.com/learning/paths/become-a-devops-engineer" },
  { title: "Become a Data Analyst", title_fr: "Devenir Data Analyst", platform: "LinkedIn Learning", provider: "LinkedIn", field: "technology", type: "course", diff: "beginner", cost: "subscription", price: 3000, dur_min: 1200, dur_wk: null, lang: ["en"], rating: 4.5, enroll: 200000, skills: ["Excel","SQL","Power BI","Data Analysis","Statistics"], cert: true, certName: "LinkedIn Learning Certificate", url: "https://www.linkedin.com/learning/paths/become-a-data-analyst" },
  { title: "Intro to SQL", title_fr: "Introduction au SQL", platform: "Khan Academy", provider: "Khan Academy", field: "technology", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 600, dur_wk: null, lang: ["en","fr"], rating: 4.7, enroll: 1000000, skills: ["SQL","Database Basics","Queries"], cert: false, certName: null, url: "https://www.khanacademy.org/computing/computer-programming/sql" },
  { title: "Algorithms", title_fr: "Algorithmes", platform: "Khan Academy", provider: "Khan Academy", field: "technology", type: "course", diff: "intermediate", cost: "free", price: 0, dur_min: 1200, dur_wk: null, lang: ["en","fr"], rating: 4.8, enroll: 800000, skills: ["Algorithms","Sorting","Searching","Complexity"], cert: false, certName: null, url: "https://www.khanacademy.org/computing/computer-science/algorithms" },
  { title: "OFPPT Formation Developpeur", title_fr: "OFPPT Formation Développeur", platform: "OFPPT e-learning", provider: "OFPPT", field: "technology", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 43200, dur_wk: 48, lang: ["fr","ar"], rating: 3.8, enroll: 30000, skills: ["Programming","Web Development","Databases"], cert: true, certName: "Diplome OFPPT", url: "https://www.ofppt.ma" },
  { title: "OFPPT Technicien Reseaux", title_fr: "OFPPT Technicien Réseaux", platform: "OFPPT e-learning", provider: "OFPPT", field: "technology", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 43200, dur_wk: 48, lang: ["fr","ar"], rating: 3.7, enroll: 25000, skills: ["Networking","Cisco","TCP/IP","Linux"], cert: true, certName: "Diplome OFPPT Reseaux", url: "https://www.ofppt.ma" },
  { title: "OFPPT Gestion Entreprise", title_fr: "OFPPT Gestion d Entreprise", platform: "OFPPT e-learning", provider: "OFPPT", field: "management", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 43200, dur_wk: 48, lang: ["fr","ar"], rating: 3.6, enroll: 20000, skills: ["Management","Accounting","Business Planning"], cert: true, certName: "Diplome OFPPT Gestion", url: "https://www.ofppt.ma" },
  { title: "OFPPT Comptabilite", title_fr: "OFPPT Comptabilité", platform: "OFPPT e-learning", provider: "OFPPT", field: "finance", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 43200, dur_wk: 48, lang: ["fr","ar"], rating: 3.7, enroll: 22000, skills: ["Accounting","Tax","Financial Statements"], cert: true, certName: "Diplome OFPPT Comptabilite", url: "https://www.ofppt.ma" },
  { title: "OFPPT Tourisme et Hotellerie", title_fr: "OFPPT Tourisme et Hôtellerie", platform: "OFPPT e-learning", provider: "OFPPT", field: "tourisme", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 43200, dur_wk: 48, lang: ["fr","ar"], rating: 3.8, enroll: 18000, skills: ["Hospitality","Hotel Management","Tourism"], cert: true, certName: "Diplome OFPPT Tourisme", url: "https://www.ofppt.ma" },
  { title: "UM6P Data Science Bootcamp", title_fr: "UM6P Bootcamp Data Science", platform: "UM6P online", provider: "UM6P", field: "technology", type: "workshop", diff: "advanced", cost: "paid", price: 15000, dur_min: 5400, dur_wk: 12, lang: ["fr","en"], rating: 4.5, enroll: 500, skills: ["Python","Machine Learning","Data Analysis","Statistics"], cert: true, certName: "UM6P Data Science Certificate", url: "https://www.um6p.ma" },
  { title: "UM6P Digital Marketing", title_fr: "UM6P Marketing Digital", platform: "UM6P online", provider: "UM6P", field: "marketing", type: "course", diff: "intermediate", cost: "paid", price: 12000, dur_min: 7200, dur_wk: 16, lang: ["fr"], rating: 4.3, enroll: 400, skills: ["Digital Marketing","SEO","Analytics","Social Media"], cert: true, certName: "UM6P Marketing Certificate", url: "https://www.um6p.ma" },
  { title: "UM6P Entrepreneurship Program", title_fr: "UM6P Programme Entrepreneuriat", platform: "UM6P online", provider: "UM6P", field: "management", type: "course", diff: "intermediate", cost: "paid", price: 18000, dur_min: 10800, dur_wk: 24, lang: ["fr","en"], rating: 4.4, enroll: 300, skills: ["Entrepreneurship","Business Plan","Fundraising","Leadership"], cert: true, certName: "UM6P Entrepreneurship Certificate", url: "https://www.um6p.ma" },
  { title: "Morocco Learning Hub Web Development", title_fr: "Morocco Learning Hub Développement Web", platform: "Morocco Learning Hub", provider: "Morocco Learning Hub", field: "technology", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 3600, dur_wk: null, lang: ["fr","ar"], rating: 4.0, enroll: 10000, skills: ["HTML","CSS","JavaScript","PHP"], cert: false, certName: null, url: "https://www.moroccolearninghub.ma" },
  { title: "Morocco Learning Hub Digital Skills", title_fr: "Morocco Learning Hub Competences Numeriques", platform: "Morocco Learning Hub", provider: "Morocco Learning Hub", field: "technology", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 1800, dur_wk: null, lang: ["fr","ar"], rating: 3.9, enroll: 15000, skills: ["Digital Literacy","Office Suite","Internet Safety"], cert: false, certName: null, url: "https://www.moroccolearninghub.ma" },
  { title: "AutoCAD 2024 Complete Course", title_fr: "Cours Complet AutoCAD 2024", platform: "Udemy", provider: "Autodesk Certified", field: "engineering", type: "course", diff: "beginner", cost: "paid", price: 1299, dur_min: 2400, dur_wk: null, lang: ["en"], rating: 4.5, enroll: 200000, skills: ["AutoCAD","2D Drawing","3D Modeling","Technical Drawing"], cert: true, certName: "Udemy Certificate", url: "https://www.udemy.com/course/autocad-complete/" },
  { title: "BIM Fundamentals with Revit", title_fr: "Fondamentaux BIM avec Revit", platform: "Udemy", provider: "BIM Expert", field: "engineering", type: "course", diff: "beginner", cost: "paid", price: 1299, dur_min: 1800, dur_wk: null, lang: ["en"], rating: 4.5, enroll: 80000, skills: ["Revit","BIM","3D Modeling","Architecture"], cert: true, certName: "Udemy Certificate", url: "https://www.udemy.com/course/revit-bim/" },
  { title: "SolidWorks Complete Course", title_fr: "Cours Complet SolidWorks", platform: "Udemy", provider: "Engineering Expert", field: "engineering", type: "course", diff: "beginner", cost: "paid", price: 1299, dur_min: 2100, dur_wk: null, lang: ["en"], rating: 4.6, enroll: 150000, skills: ["SolidWorks","3D Design","Assembly","FEA"], cert: true, certName: "Udemy Certificate", url: "https://www.udemy.com/course/solidworks-complete/" },
  { title: "PLC Programming from Scratch", title_fr: "Programmation Automates depuis Zero", platform: "Udemy", provider: "PLC Academy", field: "engineering", type: "course", diff: "beginner", cost: "paid", price: 1299, dur_min: 1500, dur_wk: null, lang: ["en"], rating: 4.5, enroll: 60000, skills: ["PLC","Ladder Logic","SCADA","HMI"], cert: true, certName: "Udemy Certificate", url: "https://www.udemy.com/course/plc-programming/" },
  { title: "Renewable Energy Technologies", title_fr: "Technologies Energies Renouvelables", platform: "Coursera", provider: "University of Queensland", field: "engineering", type: "course", diff: "intermediate", cost: "paid", price: 4900, dur_min: 9000, dur_wk: 20, lang: ["en"], rating: 4.6, enroll: 100000, skills: ["Solar Energy","Wind Energy","Energy Storage","Sustainability"], cert: true, certName: "Coursera Specialization", url: "https://www.coursera.org/specializations/renewable-energy" },
  { title: "Lean Six Sigma Green Belt", title_fr: "Lean Six Sigma Ceinture Verte", platform: "Udemy", provider: "Quality Expert", field: "engineering", type: "certification", diff: "intermediate", cost: "paid", price: 1299, dur_min: 900, dur_wk: null, lang: ["en"], rating: 4.5, enroll: 120000, skills: ["Lean","Six Sigma","DMAIC","Statistics","Quality"], cert: true, certName: "Green Belt Certificate", url: "https://www.udemy.com/course/lean-six-sigma-green-belt/" },
  { title: "SAP ERP Fundamentals", title_fr: "Fondamentaux SAP ERP", platform: "Udemy", provider: "SAP Trainer", field: "engineering", type: "course", diff: "beginner", cost: "paid", price: 1299, dur_min: 1200, dur_wk: null, lang: ["en"], rating: 4.3, enroll: 90000, skills: ["SAP","ERP","Business Process","MM","SD"], cert: true, certName: "Udemy Certificate", url: "https://www.udemy.com/course/sap-fundamentals/" },
  { title: "Supply Chain Management Specialization", title_fr: "Specialisation Gestion Chaine Logistique", platform: "Coursera", provider: "Rutgers University", field: "logistique", type: "course", diff: "intermediate", cost: "paid", price: 4900, dur_min: 9000, dur_wk: 20, lang: ["en"], rating: 4.5, enroll: 80000, skills: ["Supply Chain","Procurement","Logistics","Inventory Management"], cert: true, certName: "Coursera Specialization", url: "https://www.coursera.org/specializations/supply-chain-management" },
  { title: "Financial Markets by Yale", title_fr: "Marches Financiers par Yale", platform: "Coursera", provider: "Yale University", field: "finance", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 3150, dur_wk: 7, lang: ["en"], rating: 4.8, enroll: 2000000, skills: ["Finance","Markets","Risk","Banking","Investments"], cert: false, certName: null, url: "https://www.coursera.org/learn/financial-markets-global" },
  { title: "Financial Modeling and Valuation", title_fr: "Modelisation et Evaluation Financiere", platform: "Udemy", provider: "Financial Analyst", field: "finance", type: "course", diff: "intermediate", cost: "paid", price: 1299, dur_min: 720, dur_wk: null, lang: ["en"], rating: 4.6, enroll: 200000, skills: ["Financial Modeling","Excel","DCF","Valuation","M&A"], cert: true, certName: "Udemy Certificate", url: "https://www.udemy.com/course/financial-modeling-valuation/" },
  { title: "Excel Skills for Business", title_fr: "Competences Excel pour les Affaires", platform: "Coursera", provider: "Macquarie University", field: "finance", type: "course", diff: "beginner", cost: "paid", price: 4900, dur_min: 10800, dur_wk: 24, lang: ["en"], rating: 4.8, enroll: 800000, skills: ["Excel","Pivot Tables","VBA","Power Query","Charts"], cert: true, certName: "Coursera Specialization", url: "https://www.coursera.org/specializations/excel" },
  { title: "Power BI Complete Course", title_fr: "Cours Complet Power BI", platform: "Udemy", provider: "BI Expert", field: "management", type: "course", diff: "beginner", cost: "paid", price: 1299, dur_min: 1080, dur_wk: null, lang: ["en"], rating: 4.6, enroll: 300000, skills: ["Power BI","DAX","Data Visualization","Reports","Dashboards"], cert: true, certName: "Udemy Certificate", url: "https://www.udemy.com/course/microsoft-power-bi/" },
  { title: "Business Strategy Specialization", title_fr: "Specialisation Strategie Entreprise", platform: "Coursera", provider: "University of Virginia", field: "management", type: "course", diff: "intermediate", cost: "paid", price: 4900, dur_min: 10800, dur_wk: 24, lang: ["en"], rating: 4.6, enroll: 200000, skills: ["Strategy","Competitive Analysis","Growth","Leadership"], cert: true, certName: "Coursera Specialization", url: "https://www.coursera.org/specializations/business-strategy" },
  { title: "PMP Exam Prep", title_fr: "Preparation Examen PMP", platform: "Udemy", provider: "PMP Trainer", field: "management", type: "certification", diff: "advanced", cost: "paid", price: 1299, dur_min: 2100, dur_wk: null, lang: ["en"], rating: 4.6, enroll: 500000, skills: ["PMP","PMBOK","Project Management","Risk","Stakeholders"], cert: true, certName: "PMP Preparation", url: "https://www.udemy.com/course/pmp-exam-prep/" },
  { title: "Agile with Atlassian Jira", title_fr: "Agile avec Atlassian Jira", platform: "Coursera", provider: "Atlassian", field: "management", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 1800, dur_wk: 4, lang: ["en"], rating: 4.5, enroll: 300000, skills: ["Agile","Jira","Scrum","Kanban","Sprint"], cert: false, certName: null, url: "https://www.coursera.org/learn/agile-atlassian-jira" },
  { title: "Digital Marketing Specialization", title_fr: "Specialisation Marketing Digital", platform: "Coursera", provider: "University of Illinois", field: "marketing", type: "course", diff: "beginner", cost: "paid", price: 4900, dur_min: 14400, dur_wk: 32, lang: ["en"], rating: 4.5, enroll: 400000, skills: ["Digital Marketing","SEO","Analytics","Social Media","Email"], cert: true, certName: "Coursera Specialization", url: "https://www.coursera.org/specializations/digital-marketing" },
  { title: "Google Digital Marketing Certificate", title_fr: "Certificat Marketing Digital Google", platform: "Coursera", provider: "Google", field: "marketing", type: "certification", diff: "beginner", cost: "paid", price: 4900, dur_min: 10800, dur_wk: 24, lang: ["en"], rating: 4.7, enroll: 600000, skills: ["Digital Marketing","Google Ads","Analytics","E-commerce"], cert: true, certName: "Google Digital Marketing Certificate", url: "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce" },
  { title: "SEO Training Masterclass", title_fr: "Masterclass Formation SEO", platform: "Udemy", provider: "SEO Expert", field: "marketing", type: "course", diff: "intermediate", cost: "paid", price: 1299, dur_min: 720, dur_wk: null, lang: ["en"], rating: 4.5, enroll: 200000, skills: ["SEO","Keyword Research","Link Building","Technical SEO"], cert: true, certName: "Udemy Certificate", url: "https://www.udemy.com/course/seo-training-masterclass/" },
  { title: "Salesforce Administrator Certification", title_fr: "Certification Administrateur Salesforce", platform: "Salesforce Trailhead", provider: "Salesforce", field: "commerce", type: "certification", diff: "intermediate", cost: "free", price: 0, dur_min: 7200, dur_wk: null, lang: ["en"], rating: 4.6, enroll: 500000, skills: ["Salesforce","CRM","Admin","Reports","Automation"], cert: true, certName: "Salesforce Admin Certificate", url: "https://trailhead.salesforce.com" },
  { title: "Google Ads Certification", title_fr: "Certification Google Ads", platform: "Google Skillshop", provider: "Google", field: "marketing", type: "certification", diff: "beginner", cost: "free", price: 0, dur_min: 3600, dur_wk: null, lang: ["en","fr"], rating: 4.6, enroll: 1000000, skills: ["Google Ads","PPC","Search Ads","Display Ads"], cert: true, certName: "Google Ads Certification", url: "https://skillshop.withgoogle.com" },
  { title: "Human Resource Management", title_fr: "Gestion des Ressources Humaines", platform: "Coursera", provider: "University of Minnesota", field: "ressources-humaines", type: "course", diff: "beginner", cost: "paid", price: 4900, dur_min: 9000, dur_wk: 20, lang: ["en"], rating: 4.5, enroll: 200000, skills: ["HR Management","Recruiting","Performance","Compensation"], cert: true, certName: "Coursera Specialization", url: "https://www.coursera.org/specializations/human-resource-management" },
  { title: "Employment Law Fundamentals", title_fr: "Fondamentaux du Droit du Travail", platform: "Coursera", provider: "University of Pennsylvania", field: "droit", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 2700, dur_wk: 6, lang: ["en"], rating: 4.3, enroll: 80000, skills: ["Employment Law","Contracts","Compliance","Regulations"], cert: false, certName: null, url: "https://www.coursera.org/learn/employment-law" },
  { title: "International Business Law", title_fr: "Droit des Affaires International", platform: "edX", provider: "Universite catholique de Louvain", field: "droit", type: "course", diff: "intermediate", cost: "free", price: 0, dur_min: 3600, dur_wk: 8, lang: ["en","fr"], rating: 4.2, enroll: 50000, skills: ["Business Law","International Trade","Contracts","WTO"], cert: false, certName: null, url: "https://www.edx.org/course/international-business-law" },
  { title: "Clinical Research Fundamentals", title_fr: "Fondamentaux Recherche Clinique", platform: "Coursera", provider: "Johns Hopkins", field: "medecine", type: "course", diff: "intermediate", cost: "paid", price: 4900, dur_min: 7200, dur_wk: 16, lang: ["en"], rating: 4.5, enroll: 100000, skills: ["Clinical Trials","GCP","Biostatistics","Protocol Design"], cert: true, certName: "Coursera Specialization", url: "https://www.coursera.org/specializations/clinical-research" },
  { title: "Public Health Essentials", title_fr: "Fondamentaux de Sante Publique", platform: "edX", provider: "Harvard T.H. Chan", field: "medecine", type: "course", diff: "beginner", cost: "free", price: 0, dur_min: 2700, dur_wk: 6, lang: ["en"], rating: 4.4, enroll: 200000, skills: ["Public Health","Epidemiology","Health Policy","Global Health"], cert: false, certName: null, url: "https://www.edx.org/course/public-health" },
  { title: "Telemedicine and Digital Health", title_fr: "Telemedecine et Sante Numerique", platform: "edX", provider: "Imperial College London", field: "medecine", type: "course", diff: "intermediate", cost: "free", price: 0, dur_min: 2700, dur_wk: 6, lang: ["en"], rating: 4.3, enroll: 30000, skills: ["Telemedicine","Digital Health","Remote Consultation","Health Tech"], cert: false, certName: null, url: "https://www.edx.org/course/telemedicine" },
  { title: "Pharmaceutical Sciences", title_fr: "Sciences Pharmaceutiques", platform: "Coursera", provider: "University of Michigan", field: "pharmacie", type: "course", diff: "intermediate", cost: "paid", price: 4900, dur_min: 9000, dur_wk: 20, lang: ["en"], rating: 4.4, enroll: 60000, skills: ["Pharmacology","Drug Development","Clinical Pharmacy","Regulations"], cert: true, certName: "Coursera Certificate", url: "https://www.coursera.org/learn/pharmaceutical-sciences" },
  { title: "Hospitality and Tourism Management", title_fr: "Gestion Hoteliere et Tourisme", platform: "Coursera", provider: "University of Hong Kong", field: "tourisme", type: "course", diff: "beginner", cost: "paid", price: 4900, dur_min: 7200, dur_wk: 16, lang: ["en"], rating: 4.4, enroll: 100000, skills: ["Hospitality","Hotel Management","Tourism Marketing","Revenue Management"], cert: true, certName: "Coursera Specialization", url: "https://www.coursera.org/specializations/hospitality-management" },
  { title: "Sustainable Tourism", title_fr: "Tourisme Durable", platform: "edX", provider: "Wageningen University", field: "tourisme", type: "course", diff: "intermediate", cost: "free", price: 0, dur_min: 2700, dur_wk: 6, lang: ["en"], rating: 4.2, enroll: 40000, skills: ["Sustainable Tourism","Ecotourism","Community Tourism","Policy"], cert: false, certName: null, url: "https://www.edx.org/course/sustainable-tourism" },
  { title: "Modern Agriculture and Food Systems", title_fr: "Agriculture Moderne et Systemes Alimentaires", platform: "Coursera", provider: "University of Illinois", field: "agriculture", type: "course", diff: "beginner", cost: "paid", price: 4900, dur_min: 7200, dur_wk: 16, lang: ["en"], rating: 4.3, enroll: 50000, skills: ["Agriculture","Food Systems","Sustainability","Agronomy"], cert: true, certName: "Coursera Specialization", url: "https://www.coursera.org/specializations/agriculture-food-systems" },
  { title: "Precision Agriculture", title_fr: "Agriculture de Precision", platform: "edX", provider: "Wageningen University", field: "agriculture", type: "course", diff: "intermediate", cost: "free", price: 0, dur_min: 3600, dur_wk: 8, lang: ["en"], rating: 4.4, enroll: 30000, skills: ["Precision Agriculture","GIS","Drones","Data Analysis","IoT"], cert: false, certName: null, url: "https://www.edx.org/course/precision-agriculture" },
  { title: "Food Safety and HACCP", title_fr: "Securite Alimentaire et HACCP", platform: "Udemy", provider: "Food Safety Expert", field: "agriculture", type: "certification", diff: "beginner", cost: "paid", price: 999, dur_min: 360, dur_wk: null, lang: ["en"], rating: 4.5, enroll: 80000, skills: ["HACCP","Food Safety","ISO 22000","Quality Control"], cert: true, certName: "HACCP Certificate", url: "https://www.udemy.com/course/haccp-food-safety/" },
  { title: "Sustainable Architecture Design", title_fr: "Conception Architecture Durable", platform: "Coursera", provider: "University of Tokyo", field: "architecture", type: "course", diff: "intermediate", cost: "paid", price: 4900, dur_min: 5400, dur_wk: 12, lang: ["en"], rating: 4.4, enroll: 40000, skills: ["Sustainable Design","LEED","Green Building","Energy Efficiency"], cert: true, certName: "Coursera Certificate", url: "https://www.coursera.org/learn/sustainable-architecture" },
];

function buildLearningResources() {
  const rows = [];
  for (const r of LR_DATA) {
    const tags = [r.field, r.diff, r.platform.toLowerCase().replace(/\s+/g, "-"), ...(r.skills || []).slice(0, 2).map(s => s.toLowerCase().replace(/\s+/g, "-"))];

    rows.push({
      id: uuid(),
      title: r.title,
      title_fr: r.title_fr,
      description: `${r.title} - Comprehensive ${r.diff} level course by ${r.provider}. Covers essential skills for ${r.field} professionals.`,
      description_fr: `${r.title_fr} - Cours complet de niveau ${r.diff === "beginner" ? "debutant" : r.diff === "intermediate" ? "intermediaire" : "avance"} par ${r.provider}.`,
      resource_type: r.type,
      difficulty: r.diff,
      cost_type: r.cost,
      price: r.price,
      currency: "MAD",
      platform: r.platform,
      provider: r.provider,
      url: r.url,
      thumbnail_url: null,
      duration_minutes: r.dur_min,
      duration_weeks: r.dur_wk,
      skills: r.skills || [],
      prerequisites: [],
      target_fields: [r.field],
      languages: r.lang,
      rating: r.rating,
      total_ratings: Math.round(r.enroll * 0.05),
      total_enrollments: r.enroll,
      total_completions: Math.round(r.enroll * 0.3),
      certification_awarded: r.cert,
      certification_name: r.certName,
      is_recommended: r.rating >= 4.5,
      is_featured: r.rating >= 4.7 && r.enroll >= 500000,
      is_active: true,
      tags,
      metadata: JSON.stringify({}),
    });
  }
  return rows;
}

// ═══════════════════════════════════════════════════════════════════════════
// INSERT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function insertMarketSalaryData(rows) {
  let inserted = 0;
  const now = new Date().toISOString();
  for (const r of rows) {
    const res = await client.query(
      `INSERT INTO market_salary_data (id, role, role_fr, field, region, experience_level, salary_min, salary_median, salary_max, sample_size, growth_rate, demand_score, source, last_updated, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT DO NOTHING`,
      [r.id, r.role, r.role_fr, r.field, r.region, r.experience_level,
       r.salary_min, r.salary_median, r.salary_max, r.sample_size,
       r.growth_rate, r.demand_score, r.source, now, now, now]
    );
    if (res.rowCount > 0) inserted++;
  }
  return inserted;
}

async function insertSkillDemand(rows) {
  let inserted = 0;
  const now = new Date().toISOString();
  for (const r of rows) {
    const res = await client.query(
      `INSERT INTO skill_demand (id, skill, skill_fr, field, category, demand_score, growth_trend, growth_percent, job_count, average_salary_boost, competition_level, time_to_learn, resources, related_skills, last_updated, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       ON CONFLICT DO NOTHING`,
      [r.id, r.skill, r.skill_fr, r.field, r.category, r.demand_score,
       r.growth_trend, r.growth_percent, r.job_count, r.average_salary_boost,
       r.competition_level, r.time_to_learn, r.resources, r.related_skills,
       now, now, now]
    );
    if (res.rowCount > 0) inserted++;
  }
  return inserted;
}

async function insertRegionalJobStats(rows) {
  let inserted = 0;
  const now = new Date().toISOString();
  for (const r of rows) {
    const res = await client.query(
      `INSERT INTO regional_job_stats (id, region, region_fr, total_jobs, job_growth, average_salary, top_industries, top_employers, skills_in_demand, unemployment_rate, cost_of_living, quality_of_life, last_updated, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT DO NOTHING`,
      [r.id, r.region, r.region_fr, r.total_jobs, r.job_growth, r.average_salary,
       r.top_industries, r.top_employers, r.skills_in_demand,
       r.unemployment_rate, r.cost_of_living, r.quality_of_life,
       now, now, now]
    );
    if (res.rowCount > 0) inserted++;
  }
  return inserted;
}

async function insertSuccessStories(rows) {
  let inserted = 0;
  const now = new Date().toISOString();
  for (const r of rows) {
    const res = await client.query(
      `INSERT INTO success_story (id, graduate_name, graduation_year, program_id, program_name, "current_role", current_role_en, company, location, salary_range, story_fr, story_en, key_achievement, key_achievement_fr, advice_fr, advice_en, tags, field, is_featured, is_active, sort_order, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
       ON CONFLICT DO NOTHING`,
      [r.id, r.graduate_name, r.graduation_year, r.program_id, r.program_name,
       r.current_role, r.current_role_en, r.company, r.location, r.salary_range,
       r.story_fr, r.story_en, r.key_achievement, r.key_achievement_fr,
       r.advice_fr, r.advice_en, r.tags, r.field,
       r.is_featured, r.is_active, r.sort_order, now, now]
    );
    if (res.rowCount > 0) inserted++;
  }
  return inserted;
}

async function insertLearningResources(rows) {
  let inserted = 0;
  const now = new Date().toISOString();
  for (const r of rows) {
    const res = await client.query(
      `INSERT INTO learning_resource (id, title, title_fr, description, description_fr, resource_type, difficulty, cost_type, price, currency, platform, provider, url, thumbnail_url, duration_minutes, duration_weeks, skills, prerequisites, target_fields, languages, rating, total_ratings, total_enrollments, total_completions, certification_awarded, certification_name, is_recommended, is_featured, is_active, tags, metadata, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6::learning_resource_type,$7::learning_difficulty,$8::learning_cost_type,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33)
       ON CONFLICT DO NOTHING`,
      [r.id, r.title, r.title_fr, r.description, r.description_fr,
       r.resource_type, r.difficulty, r.cost_type, r.price, r.currency,
       r.platform, r.provider, r.url, r.thumbnail_url,
       r.duration_minutes, r.duration_weeks,
       r.skills, r.prerequisites, r.target_fields, r.languages,
       r.rating, r.total_ratings, r.total_enrollments, r.total_completions,
       r.certification_awarded, r.certification_name,
       r.is_recommended, r.is_featured, r.is_active,
       r.tags, r.metadata, now, now]
    );
    if (res.rowCount > 0) inserted++;
  }
  return inserted;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  await client.connect();
  console.log("Connected to PostgreSQL");

  const tables = ["market_salary_data", "skill_demand", "regional_job_stats", "success_story", "learning_resource"];
  console.log("\n--- BEFORE ---");
  for (const t of tables) {
    const res = await client.query(`SELECT COUNT(*) as cnt FROM ${t}`);
    console.log(`  ${t}: ${res.rows[0].cnt} rows`);
  }

  const salaryData = buildMarketSalaryData();
  const skillData = buildSkillDemand();
  const regionalData = buildRegionalJobStats();
  const storyData = buildSuccessStories();
  const resourceData = buildLearningResources();

  const totalGenerated = salaryData.length + skillData.length + regionalData.length + storyData.length + resourceData.length;
  console.log(`\nGenerated ${totalGenerated} total rows:`);
  console.log(`  market_salary_data: ${salaryData.length}`);
  console.log(`  skill_demand:       ${skillData.length}`);
  console.log(`  regional_job_stats: ${regionalData.length}`);
  console.log(`  success_story:      ${storyData.length}`);
  console.log(`  learning_resource:  ${resourceData.length}`);

  console.log("\nInserting...");
  const r1 = await insertMarketSalaryData(salaryData);
  console.log(`  market_salary_data: ${r1} inserted`);

  const r2 = await insertSkillDemand(skillData);
  console.log(`  skill_demand: ${r2} inserted`);

  const r3 = await insertRegionalJobStats(regionalData);
  console.log(`  regional_job_stats: ${r3} inserted`);

  const r4 = await insertSuccessStories(storyData);
  console.log(`  success_story: ${r4} inserted`);

  const r5 = await insertLearningResources(resourceData);
  console.log(`  learning_resource: ${r5} inserted`);

  const totalInserted = r1 + r2 + r3 + r4 + r5;
  console.log(`\n  TOTAL INSERTED: ${totalInserted}`);

  console.log("\n--- AFTER ---");
  for (const t of tables) {
    const res = await client.query(`SELECT COUNT(*) as cnt FROM ${t}`);
    console.log(`  ${t}: ${res.rows[0].cnt} rows`);
  }

  await client.end();
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  console.error(err.stack);
  process.exit(1);
});
