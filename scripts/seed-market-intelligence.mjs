/**
 * seed-market-intelligence.mjs
 *
 * Seeds comprehensive Moroccan job market intelligence data (2025-2026)
 * into four tables: market_salary_data, skill_demand, regional_job_stats, employer_database.
 *
 * Usage: node scripts/seed-market-intelligence.mjs
 */

import pg from "pg";
const { Client } = pg;

const client = new Client({
  host: "localhost",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "postgres",
});

// ---------------------------------------------------------------------------
// 1. MARKET SALARY DATA  (60+ entries)
// ---------------------------------------------------------------------------
const salaryData = [
  // ---- IT SECTOR ----
  // Junior Developer
  { role: "Junior Developer", role_fr: "Developpeur Junior", field: "IT", region: "Casablanca-Settat", experience_level: "0-2 years", salary_min: 9600, salary_median: 11000, salary_max: 14400, sample_size: 420, growth_rate: 8.5, demand_score: 82, source: "ReKrute/Emploi.ma 2025" },
  { role: "Junior Developer", role_fr: "Developpeur Junior", field: "IT", region: "Rabat-Sale-Kenitra", experience_level: "0-2 years", salary_min: 8500, salary_median: 10000, salary_max: 13200, sample_size: 280, growth_rate: 7.0, demand_score: 78, source: "ReKrute/Emploi.ma 2025" },
  { role: "Junior Developer", role_fr: "Developpeur Junior", field: "IT", region: "Tanger-Tetouan-Al Hoceima", experience_level: "0-2 years", salary_min: 8000, salary_median: 9500, salary_max: 12000, sample_size: 140, growth_rate: 12.0, demand_score: 75, source: "ReKrute/Emploi.ma 2025" },
  { role: "Junior Developer", role_fr: "Developpeur Junior", field: "IT", region: "Marrakech-Safi", experience_level: "0-2 years", salary_min: 7500, salary_median: 9000, salary_max: 11000, sample_size: 85, growth_rate: 6.0, demand_score: 60, source: "ReKrute/Emploi.ma 2025" },
  { role: "Junior Developer", role_fr: "Developpeur Junior", field: "IT", region: "Fes-Meknes", experience_level: "0-2 years", salary_min: 7200, salary_median: 8800, salary_max: 10500, sample_size: 65, growth_rate: 5.5, demand_score: 55, source: "ReKrute/Emploi.ma 2025" },

  // Senior Developer
  { role: "Senior Developer", role_fr: "Developpeur Senior", field: "IT", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 21600, salary_median: 27000, salary_max: 36000, sample_size: 310, growth_rate: 10.2, demand_score: 91, source: "ReKrute/Emploi.ma 2025" },
  { role: "Senior Developer", role_fr: "Developpeur Senior", field: "IT", region: "Rabat-Sale-Kenitra", experience_level: "5-10 years", salary_min: 19500, salary_median: 24000, salary_max: 32000, sample_size: 180, growth_rate: 9.0, demand_score: 86, source: "ReKrute/Emploi.ma 2025" },
  { role: "Senior Developer", role_fr: "Developpeur Senior", field: "IT", region: "Tanger-Tetouan-Al Hoceima", experience_level: "5-10 years", salary_min: 18000, salary_median: 22000, salary_max: 28000, sample_size: 75, growth_rate: 14.0, demand_score: 80, source: "ReKrute/Emploi.ma 2025" },
  { role: "Senior Developer", role_fr: "Developpeur Senior", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 15000, salary_median: 19000, salary_max: 25000, sample_size: 350, growth_rate: 9.5, demand_score: 88, source: "ReKrute/Emploi.ma 2025" },

  // Data Scientist
  { role: "Data Scientist", role_fr: "Scientifique des Donnees", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 18000, salary_median: 22000, salary_max: 30000, sample_size: 120, growth_rate: 22.0, demand_score: 88, source: "ReKrute/LinkedIn 2025" },
  { role: "Data Scientist", role_fr: "Scientifique des Donnees", field: "IT", region: "Rabat-Sale-Kenitra", experience_level: "2-5 years", salary_min: 16000, salary_median: 20000, salary_max: 27000, sample_size: 70, growth_rate: 18.0, demand_score: 84, source: "ReKrute/LinkedIn 2025" },
  { role: "Data Scientist", role_fr: "Scientifique des Donnees", field: "IT", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 25000, salary_median: 30000, salary_max: 40000, sample_size: 60, growth_rate: 25.0, demand_score: 93, source: "ReKrute/LinkedIn 2025" },
  { role: "Data Scientist", role_fr: "Scientifique des Donnees", field: "IT", region: "Casablanca-Settat", experience_level: "0-2 years", salary_min: 12000, salary_median: 15000, salary_max: 19000, sample_size: 90, growth_rate: 20.0, demand_score: 80, source: "ReKrute/LinkedIn 2025" },

  // DevOps Engineer
  { role: "DevOps Engineer", role_fr: "Ingenieur DevOps", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 16800, salary_median: 20000, salary_max: 26400, sample_size: 95, growth_rate: 30.0, demand_score: 87, source: "ReKrute/LinkedIn 2025" },
  { role: "DevOps Engineer", role_fr: "Ingenieur DevOps", field: "IT", region: "Rabat-Sale-Kenitra", experience_level: "2-5 years", salary_min: 15000, salary_median: 18500, salary_max: 24000, sample_size: 55, growth_rate: 28.0, demand_score: 83, source: "ReKrute/LinkedIn 2025" },
  { role: "DevOps Engineer", role_fr: "Ingenieur DevOps", field: "IT", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 22000, salary_median: 27000, salary_max: 35000, sample_size: 40, growth_rate: 32.0, demand_score: 92, source: "ReKrute/LinkedIn 2025" },

  // Cybersecurity
  { role: "Cybersecurity Analyst", role_fr: "Analyste Cybersecurite", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 16000, salary_median: 21000, salary_max: 28000, sample_size: 75, growth_rate: 38.0, demand_score: 90, source: "DGSSI/LinkedIn 2025" },
  { role: "Cybersecurity Analyst", role_fr: "Analyste Cybersecurite", field: "IT", region: "Rabat-Sale-Kenitra", experience_level: "2-5 years", salary_min: 15000, salary_median: 20000, salary_max: 26000, sample_size: 60, growth_rate: 35.0, demand_score: 88, source: "DGSSI/LinkedIn 2025" },
  { role: "Cybersecurity Analyst", role_fr: "Analyste Cybersecurite", field: "IT", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 24000, salary_median: 30000, salary_max: 38000, sample_size: 30, growth_rate: 40.0, demand_score: 95, source: "DGSSI/LinkedIn 2025" },

  // Tech Lead
  { role: "Tech Lead", role_fr: "Responsable Technique", field: "IT", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 30000, salary_median: 35000, salary_max: 45000, sample_size: 85, growth_rate: 12.0, demand_score: 89, source: "ReKrute/LinkedIn 2025" },
  { role: "Tech Lead", role_fr: "Responsable Technique", field: "IT", region: "Rabat-Sale-Kenitra", experience_level: "5-10 years", salary_min: 27000, salary_median: 32000, salary_max: 40000, sample_size: 45, growth_rate: 10.0, demand_score: 85, source: "ReKrute/LinkedIn 2025" },
  { role: "Tech Lead", role_fr: "Responsable Technique", field: "IT", region: "Casablanca-Settat", experience_level: "10+ years", salary_min: 35000, salary_median: 42000, salary_max: 55000, sample_size: 35, growth_rate: 15.0, demand_score: 94, source: "ReKrute/LinkedIn 2025" },

  // Cloud Architect
  { role: "Cloud Architect", role_fr: "Architecte Cloud", field: "IT", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 28000, salary_median: 35000, salary_max: 48000, sample_size: 40, growth_rate: 35.0, demand_score: 92, source: "LinkedIn/AWS Morocco 2025" },
  { role: "Cloud Architect", role_fr: "Architecte Cloud", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 18000, salary_median: 24000, salary_max: 32000, sample_size: 55, growth_rate: 33.0, demand_score: 86, source: "LinkedIn/AWS Morocco 2025" },

  // Full Stack Developer
  { role: "Full Stack Developer", role_fr: "Developpeur Full Stack", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 14000, salary_median: 18000, salary_max: 24000, sample_size: 290, growth_rate: 15.0, demand_score: 85, source: "ReKrute/Emploi.ma 2025" },
  { role: "Full Stack Developer", role_fr: "Developpeur Full Stack", field: "IT", region: "Rabat-Sale-Kenitra", experience_level: "2-5 years", salary_min: 12500, salary_median: 16000, salary_max: 21000, sample_size: 170, growth_rate: 12.0, demand_score: 80, source: "ReKrute/Emploi.ma 2025" },
  { role: "Full Stack Developer", role_fr: "Developpeur Full Stack", field: "IT", region: "Tanger-Tetouan-Al Hoceima", experience_level: "2-5 years", salary_min: 11000, salary_median: 14500, salary_max: 19000, sample_size: 80, growth_rate: 18.0, demand_score: 76, source: "ReKrute/Emploi.ma 2025" },

  // Mobile Developer
  { role: "Mobile Developer", role_fr: "Developpeur Mobile", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 14000, salary_median: 18000, salary_max: 24000, sample_size: 110, growth_rate: 20.0, demand_score: 82, source: "ReKrute 2025" },
  { role: "Mobile Developer", role_fr: "Developpeur Mobile", field: "IT", region: "Casablanca-Settat", experience_level: "0-2 years", salary_min: 9000, salary_median: 11000, salary_max: 14000, sample_size: 130, growth_rate: 18.0, demand_score: 75, source: "ReKrute 2025" },

  // QA Engineer
  { role: "QA Engineer", role_fr: "Ingenieur Qualite Logiciel", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 12000, salary_median: 15000, salary_max: 20000, sample_size: 95, growth_rate: 10.0, demand_score: 72, source: "ReKrute 2025" },

  // ---- ENGINEERING ----
  // Process Engineer
  { role: "Process Engineer", role_fr: "Ingenieur Procedes", field: "Engineering", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 12000, salary_median: 15000, salary_max: 19000, sample_size: 85, growth_rate: 6.0, demand_score: 70, source: "ReKrute/OCP 2025" },
  { role: "Process Engineer", role_fr: "Ingenieur Procedes", field: "Engineering", region: "Khouribga", experience_level: "2-5 years", salary_min: 13000, salary_median: 16000, salary_max: 21000, sample_size: 50, growth_rate: 8.0, demand_score: 75, source: "OCP Group 2025" },
  { role: "Process Engineer", role_fr: "Ingenieur Procedes", field: "Engineering", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 16000, salary_median: 20000, salary_max: 26000, sample_size: 55, growth_rate: 7.0, demand_score: 74, source: "ReKrute/OCP 2025" },

  // Quality Engineer
  { role: "Quality Engineer", role_fr: "Ingenieur Qualite", field: "Engineering", region: "Tanger-Tetouan-Al Hoceima", experience_level: "2-5 years", salary_min: 10000, salary_median: 13000, salary_max: 16500, sample_size: 90, growth_rate: 9.0, demand_score: 73, source: "Renault/Stellantis 2025" },
  { role: "Quality Engineer", role_fr: "Ingenieur Qualite", field: "Engineering", region: "Kenitra", experience_level: "2-5 years", salary_min: 9500, salary_median: 12500, salary_max: 16000, sample_size: 65, growth_rate: 11.0, demand_score: 71, source: "PSA/Stellantis 2025" },

  // Maintenance Engineer
  { role: "Maintenance Engineer", role_fr: "Ingenieur Maintenance", field: "Engineering", region: "Tanger-Tetouan-Al Hoceima", experience_level: "2-5 years", salary_min: 9000, salary_median: 11500, salary_max: 15000, sample_size: 75, growth_rate: 5.0, demand_score: 65, source: "ReKrute 2025" },
  { role: "Maintenance Engineer", role_fr: "Ingenieur Maintenance", field: "Engineering", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 12000, salary_median: 15000, salary_max: 19000, sample_size: 60, growth_rate: 4.5, demand_score: 62, source: "ReKrute 2025" },

  // HSE Engineer
  { role: "HSE Engineer", role_fr: "Ingenieur HSE", field: "Engineering", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 12000, salary_median: 15000, salary_max: 20000, sample_size: 55, growth_rate: 12.0, demand_score: 74, source: "ReKrute/OCP 2025" },
  { role: "HSE Engineer", role_fr: "Ingenieur HSE", field: "Engineering", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 17000, salary_median: 22000, salary_max: 28000, sample_size: 30, growth_rate: 14.0, demand_score: 78, source: "ReKrute/OCP 2025" },

  // Project Manager (Engineering)
  { role: "Project Manager", role_fr: "Chef de Projet", field: "Engineering", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 20000, salary_median: 26000, salary_max: 35000, sample_size: 70, growth_rate: 8.0, demand_score: 80, source: "ReKrute 2025" },
  { role: "Project Manager", role_fr: "Chef de Projet", field: "Engineering", region: "Rabat-Sale-Kenitra", experience_level: "5-10 years", salary_min: 18000, salary_median: 23000, salary_max: 30000, sample_size: 45, growth_rate: 7.0, demand_score: 76, source: "ReKrute 2025" },
  { role: "Project Manager", role_fr: "Chef de Projet", field: "Engineering", region: "Tanger-Tetouan-Al Hoceima", experience_level: "5-10 years", salary_min: 16000, salary_median: 21000, salary_max: 28000, sample_size: 35, growth_rate: 10.0, demand_score: 72, source: "ReKrute 2025" },

  // Industrial Engineer
  { role: "Industrial Engineer", role_fr: "Ingenieur Industriel", field: "Engineering", region: "Tanger-Tetouan-Al Hoceima", experience_level: "2-5 years", salary_min: 11000, salary_median: 14000, salary_max: 18000, sample_size: 80, growth_rate: 10.0, demand_score: 76, source: "AMICA/ReKrute 2025" },
  { role: "Industrial Engineer", role_fr: "Ingenieur Industriel", field: "Engineering", region: "Kenitra", experience_level: "0-2 years", salary_min: 8000, salary_median: 10500, salary_max: 13500, sample_size: 55, growth_rate: 15.0, demand_score: 72, source: "AMICA/ReKrute 2025" },

  // ---- HEALTHCARE ----
  { role: "Registered Nurse", role_fr: "Infirmier(e) Diplome(e)", field: "Healthcare", region: "Casablanca-Settat", experience_level: "0-2 years", salary_min: 6500, salary_median: 8000, salary_max: 10500, sample_size: 200, growth_rate: 5.0, demand_score: 68, source: "Ministere Sante 2025" },
  { role: "Registered Nurse", role_fr: "Infirmier(e) Diplome(e)", field: "Healthcare", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 9000, salary_median: 11500, salary_max: 14000, sample_size: 150, growth_rate: 4.5, demand_score: 70, source: "Ministere Sante 2025" },
  { role: "General Practitioner", role_fr: "Medecin Generaliste", field: "Healthcare", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 18000, salary_median: 24000, salary_max: 32000, sample_size: 90, growth_rate: 3.5, demand_score: 72, source: "CNOM 2025" },
  { role: "Specialist Doctor", role_fr: "Medecin Specialiste", field: "Healthcare", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 28000, salary_median: 38000, salary_max: 55000, sample_size: 40, growth_rate: 4.0, demand_score: 85, source: "CNOM 2025" },
  { role: "Lab Technician", role_fr: "Technicien de Laboratoire", field: "Healthcare", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 8000, salary_median: 10000, salary_max: 13000, sample_size: 70, growth_rate: 6.0, demand_score: 60, source: "CHU 2025" },
  { role: "Lab Technician", role_fr: "Technicien de Laboratoire", field: "Healthcare", region: "Rabat-Sale-Kenitra", experience_level: "2-5 years", salary_min: 7500, salary_median: 9500, salary_max: 12000, sample_size: 55, growth_rate: 5.5, demand_score: 58, source: "CHU 2025" },
  { role: "Pharmacist", role_fr: "Pharmacien(ne)", field: "Healthcare", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 14000, salary_median: 17000, salary_max: 22000, sample_size: 65, growth_rate: 4.0, demand_score: 65, source: "CNOP 2025" },
  { role: "Pharmacist", role_fr: "Pharmacien(ne)", field: "Healthcare", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 18000, salary_median: 23000, salary_max: 30000, sample_size: 35, growth_rate: 5.0, demand_score: 70, source: "CNOP 2025" },
  { role: "Dentist", role_fr: "Dentiste", field: "Healthcare", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 15000, salary_median: 20000, salary_max: 28000, sample_size: 45, growth_rate: 3.0, demand_score: 62, source: "CNOM 2025" },

  // ---- FINANCE ----
  { role: "Accountant", role_fr: "Comptable", field: "Finance", region: "Casablanca-Settat", experience_level: "0-2 years", salary_min: 8000, salary_median: 10000, salary_max: 13000, sample_size: 300, growth_rate: 3.0, demand_score: 65, source: "ReKrute/OEC 2025" },
  { role: "Accountant", role_fr: "Comptable", field: "Finance", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 10500, salary_median: 13500, salary_max: 17000, sample_size: 250, growth_rate: 4.0, demand_score: 68, source: "ReKrute/OEC 2025" },
  { role: "Accountant", role_fr: "Comptable", field: "Finance", region: "Rabat-Sale-Kenitra", experience_level: "2-5 years", salary_min: 9000, salary_median: 12000, salary_max: 15500, sample_size: 150, growth_rate: 3.5, demand_score: 63, source: "ReKrute/OEC 2025" },
  { role: "Financial Analyst", role_fr: "Analyste Financier", field: "Finance", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 14000, salary_median: 17500, salary_max: 22000, sample_size: 85, growth_rate: 7.0, demand_score: 78, source: "CFA/ReKrute 2025" },
  { role: "Financial Analyst", role_fr: "Analyste Financier", field: "Finance", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 20000, salary_median: 26000, salary_max: 34000, sample_size: 45, growth_rate: 8.0, demand_score: 82, source: "CFA/ReKrute 2025" },
  { role: "Auditor", role_fr: "Auditeur", field: "Finance", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 12000, salary_median: 15000, salary_max: 20000, sample_size: 110, growth_rate: 5.0, demand_score: 72, source: "Big4/ReKrute 2025" },
  { role: "Auditor", role_fr: "Auditeur", field: "Finance", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 18000, salary_median: 24000, salary_max: 32000, sample_size: 50, growth_rate: 6.0, demand_score: 76, source: "Big4/ReKrute 2025" },
  { role: "Risk Manager", role_fr: "Gestionnaire de Risques", field: "Finance", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 22000, salary_median: 28000, salary_max: 38000, sample_size: 30, growth_rate: 12.0, demand_score: 84, source: "BAM/ReKrute 2025" },
  { role: "Compliance Officer", role_fr: "Responsable Conformite", field: "Finance", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 20000, salary_median: 26000, salary_max: 35000, sample_size: 25, growth_rate: 15.0, demand_score: 80, source: "AMMC/ReKrute 2025" },

  // ---- ENERGY / RENEWABLES ----
  { role: "Renewable Energy Engineer", role_fr: "Ingenieur Energies Renouvelables", field: "Energy", region: "Ouarzazate-Midelt", experience_level: "2-5 years", salary_min: 13000, salary_median: 17000, salary_max: 23000, sample_size: 40, growth_rate: 25.0, demand_score: 82, source: "MASEN/Nareva 2025" },
  { role: "Renewable Energy Engineer", role_fr: "Ingenieur Energies Renouvelables", field: "Energy", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 20000, salary_median: 26000, salary_max: 35000, sample_size: 25, growth_rate: 28.0, demand_score: 86, source: "MASEN/Nareva 2025" },
  { role: "Electrical Engineer", role_fr: "Ingenieur Electrique", field: "Energy", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 11000, salary_median: 14000, salary_max: 18000, sample_size: 70, growth_rate: 8.0, demand_score: 70, source: "ONEE/ReKrute 2025" },

  // ---- MARKETING / DIGITAL ----
  { role: "Digital Marketing Manager", role_fr: "Responsable Marketing Digital", field: "Marketing", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 12000, salary_median: 16000, salary_max: 22000, sample_size: 120, growth_rate: 18.0, demand_score: 78, source: "ReKrute/LinkedIn 2025" },
  { role: "SEO/SEM Specialist", role_fr: "Specialiste SEO/SEM", field: "Marketing", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 10000, salary_median: 13000, salary_max: 17000, sample_size: 80, growth_rate: 15.0, demand_score: 72, source: "ReKrute 2025" },
  { role: "UX/UI Designer", role_fr: "Designer UX/UI", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 12000, salary_median: 16000, salary_max: 22000, sample_size: 90, growth_rate: 20.0, demand_score: 80, source: "ReKrute/LinkedIn 2025" },
];

// ---------------------------------------------------------------------------
// 2. SKILL DEMAND  (50+ entries)
// ---------------------------------------------------------------------------
const skillDemandData = [
  // Technical / IT
  { skill: "Python", skill_fr: "Python", field: "IT", category: "Programming", demand_score: 92, growth_trend: "rising", growth_percent: 28.0, job_count: 3200, average_salary_boost: 3500, competition_level: "high", time_to_learn: "3-6 months", resources: JSON.stringify(["Coursera", "UM6P", "ENSIAS"]), related_skills: JSON.stringify(["Django", "FastAPI", "Data Science"]) },
  { skill: "JavaScript", skill_fr: "JavaScript", field: "IT", category: "Programming", demand_score: 95, growth_trend: "stable", growth_percent: 12.0, job_count: 4100, average_salary_boost: 3000, competition_level: "very high", time_to_learn: "3-6 months", resources: JSON.stringify(["freeCodeCamp", "EMSI", "1337"]), related_skills: JSON.stringify(["React", "Node.js", "TypeScript"]) },
  { skill: "React", skill_fr: "React", field: "IT", category: "Framework", demand_score: 90, growth_trend: "rising", growth_percent: 22.0, job_count: 2800, average_salary_boost: 3200, competition_level: "high", time_to_learn: "2-4 months", resources: JSON.stringify(["React docs", "EMSI", "Udemy"]), related_skills: JSON.stringify(["JavaScript", "TypeScript", "Next.js"]) },
  { skill: "TypeScript", skill_fr: "TypeScript", field: "IT", category: "Programming", demand_score: 85, growth_trend: "rising", growth_percent: 35.0, job_count: 1900, average_salary_boost: 3800, competition_level: "medium", time_to_learn: "1-3 months", resources: JSON.stringify(["TypeScript docs", "1337"]), related_skills: JSON.stringify(["JavaScript", "React", "Node.js"]) },
  { skill: "Node.js", skill_fr: "Node.js", field: "IT", category: "Backend", demand_score: 84, growth_trend: "stable", growth_percent: 15.0, job_count: 2200, average_salary_boost: 2800, competition_level: "high", time_to_learn: "2-4 months", resources: JSON.stringify(["Node.js docs", "ENSIAS"]), related_skills: JSON.stringify(["JavaScript", "Express", "MongoDB"]) },
  { skill: "Java", skill_fr: "Java", field: "IT", category: "Programming", demand_score: 82, growth_trend: "stable", growth_percent: 5.0, job_count: 2500, average_salary_boost: 2500, competition_level: "high", time_to_learn: "4-6 months", resources: JSON.stringify(["Oracle", "ENSA", "EMI"]), related_skills: JSON.stringify(["Spring Boot", "Microservices", "Kotlin"]) },
  { skill: "SQL/Database", skill_fr: "SQL/Base de donnees", field: "IT", category: "Database", demand_score: 88, growth_trend: "stable", growth_percent: 8.0, job_count: 3500, average_salary_boost: 2000, competition_level: "medium", time_to_learn: "1-3 months", resources: JSON.stringify(["PostgreSQL docs", "ENSIAS"]), related_skills: JSON.stringify(["PostgreSQL", "MySQL", "MongoDB"]) },
  { skill: "AWS", skill_fr: "AWS", field: "IT", category: "Cloud", demand_score: 88, growth_trend: "rising", growth_percent: 35.0, job_count: 1800, average_salary_boost: 5000, competition_level: "medium", time_to_learn: "3-6 months", resources: JSON.stringify(["AWS Training", "Cloud Guru"]), related_skills: JSON.stringify(["Docker", "Kubernetes", "Terraform"]) },
  { skill: "Azure", skill_fr: "Azure", field: "IT", category: "Cloud", demand_score: 80, growth_trend: "rising", growth_percent: 32.0, job_count: 1200, average_salary_boost: 4500, competition_level: "medium", time_to_learn: "3-6 months", resources: JSON.stringify(["Microsoft Learn", "AZ-900"]), related_skills: JSON.stringify(["AWS", "DevOps", ".NET"]) },
  { skill: "Docker", skill_fr: "Docker", field: "IT", category: "DevOps", demand_score: 83, growth_trend: "rising", growth_percent: 30.0, job_count: 1600, average_salary_boost: 3500, competition_level: "medium", time_to_learn: "1-2 months", resources: JSON.stringify(["Docker docs", "KodeKloud"]), related_skills: JSON.stringify(["Kubernetes", "CI/CD", "AWS"]) },
  { skill: "Kubernetes", skill_fr: "Kubernetes", field: "IT", category: "DevOps", demand_score: 78, growth_trend: "rising", growth_percent: 40.0, job_count: 900, average_salary_boost: 5500, competition_level: "low", time_to_learn: "3-6 months", resources: JSON.stringify(["CNCF", "KodeKloud"]), related_skills: JSON.stringify(["Docker", "Helm", "AWS EKS"]) },
  { skill: "Machine Learning", skill_fr: "Apprentissage Automatique", field: "IT", category: "AI/ML", demand_score: 86, growth_trend: "rising", growth_percent: 45.0, job_count: 850, average_salary_boost: 6000, competition_level: "low", time_to_learn: "6-12 months", resources: JSON.stringify(["Andrew Ng", "UM6P-CS", "ENSIAS"]), related_skills: JSON.stringify(["Python", "TensorFlow", "Statistics"]) },
  { skill: "Deep Learning", skill_fr: "Apprentissage Profond", field: "IT", category: "AI/ML", demand_score: 75, growth_trend: "rising", growth_percent: 42.0, job_count: 400, average_salary_boost: 7000, competition_level: "low", time_to_learn: "6-12 months", resources: JSON.stringify(["fast.ai", "UM6P-CS"]), related_skills: JSON.stringify(["PyTorch", "TensorFlow", "Computer Vision"]) },
  { skill: "Generative AI", skill_fr: "IA Generative", field: "IT", category: "AI/ML", demand_score: 82, growth_trend: "rising", growth_percent: 120.0, job_count: 350, average_salary_boost: 8000, competition_level: "low", time_to_learn: "3-6 months", resources: JSON.stringify(["OpenAI", "Hugging Face", "LangChain"]), related_skills: JSON.stringify(["Python", "LLMs", "Prompt Engineering"]) },
  { skill: "Cybersecurity", skill_fr: "Cybersecurite", field: "IT", category: "Security", demand_score: 87, growth_trend: "rising", growth_percent: 38.0, job_count: 1100, average_salary_boost: 5000, competition_level: "low", time_to_learn: "6-12 months", resources: JSON.stringify(["DGSSI", "CompTIA", "CEH"]), related_skills: JSON.stringify(["Network Security", "SIEM", "Pentesting"]) },
  { skill: "CI/CD", skill_fr: "CI/CD", field: "IT", category: "DevOps", demand_score: 80, growth_trend: "rising", growth_percent: 25.0, job_count: 1400, average_salary_boost: 3000, competition_level: "medium", time_to_learn: "1-3 months", resources: JSON.stringify(["Jenkins", "GitLab CI", "GitHub Actions"]), related_skills: JSON.stringify(["Docker", "Git", "Terraform"]) },
  { skill: "Angular", skill_fr: "Angular", field: "IT", category: "Framework", demand_score: 72, growth_trend: "declining", growth_percent: -5.0, job_count: 1400, average_salary_boost: 2200, competition_level: "medium", time_to_learn: "3-6 months", resources: JSON.stringify(["Angular docs", "EMSI"]), related_skills: JSON.stringify(["TypeScript", "RxJS", "NgRx"]) },
  { skill: "PHP/Laravel", skill_fr: "PHP/Laravel", field: "IT", category: "Backend", demand_score: 70, growth_trend: "declining", growth_percent: -8.0, job_count: 1800, average_salary_boost: 1500, competition_level: "very high", time_to_learn: "2-4 months", resources: JSON.stringify(["Laravel docs", "Laracasts"]), related_skills: JSON.stringify(["MySQL", "JavaScript", "WordPress"]) },
  { skill: "Flutter", skill_fr: "Flutter", field: "IT", category: "Mobile", demand_score: 74, growth_trend: "rising", growth_percent: 28.0, job_count: 600, average_salary_boost: 3000, competition_level: "medium", time_to_learn: "2-4 months", resources: JSON.stringify(["Flutter docs", "Dart"]), related_skills: JSON.stringify(["Dart", "React Native", "Firebase"]) },
  { skill: "Power BI", skill_fr: "Power BI", field: "IT", category: "Data", demand_score: 79, growth_trend: "rising", growth_percent: 22.0, job_count: 1500, average_salary_boost: 2500, competition_level: "medium", time_to_learn: "1-2 months", resources: JSON.stringify(["Microsoft Learn", "DataCamp"]), related_skills: JSON.stringify(["SQL", "Excel", "Tableau"]) },
  { skill: "Scrum/Agile", skill_fr: "Scrum/Agile", field: "IT", category: "Methodology", demand_score: 81, growth_trend: "stable", growth_percent: 10.0, job_count: 2200, average_salary_boost: 2000, competition_level: "medium", time_to_learn: "1-2 months", resources: JSON.stringify(["Scrum.org", "PSM I"]), related_skills: JSON.stringify(["Jira", "Kanban", "SAFe"]) },

  // Engineering skills
  { skill: "AutoCAD", skill_fr: "AutoCAD", field: "Engineering", category: "Design", demand_score: 76, growth_trend: "stable", growth_percent: 3.0, job_count: 1200, average_salary_boost: 1500, competition_level: "medium", time_to_learn: "2-4 months", resources: JSON.stringify(["Autodesk", "EHTP"]), related_skills: JSON.stringify(["SolidWorks", "CATIA", "Revit"]) },
  { skill: "SolidWorks", skill_fr: "SolidWorks", field: "Engineering", category: "Design", demand_score: 74, growth_trend: "stable", growth_percent: 5.0, job_count: 900, average_salary_boost: 2000, competition_level: "medium", time_to_learn: "3-6 months", resources: JSON.stringify(["Dassault", "ENSAM"]), related_skills: JSON.stringify(["CATIA", "AutoCAD", "3D Printing"]) },
  { skill: "CATIA", skill_fr: "CATIA", field: "Engineering", category: "Design", demand_score: 72, growth_trend: "stable", growth_percent: 4.0, job_count: 700, average_salary_boost: 2500, competition_level: "low", time_to_learn: "4-6 months", resources: JSON.stringify(["Dassault", "EMI"]), related_skills: JSON.stringify(["SolidWorks", "Aerospace", "Automotive"]) },
  { skill: "Six Sigma", skill_fr: "Six Sigma", field: "Engineering", category: "Quality", demand_score: 68, growth_trend: "stable", growth_percent: 6.0, job_count: 600, average_salary_boost: 3000, competition_level: "low", time_to_learn: "3-6 months", resources: JSON.stringify(["ASQ", "Lean Six Sigma"]), related_skills: JSON.stringify(["Lean", "Kaizen", "Process Improvement"]) },
  { skill: "PLC Programming", skill_fr: "Programmation Automates", field: "Engineering", category: "Automation", demand_score: 70, growth_trend: "rising", growth_percent: 15.0, job_count: 550, average_salary_boost: 2500, competition_level: "low", time_to_learn: "4-6 months", resources: JSON.stringify(["Siemens TIA", "EHTP"]), related_skills: JSON.stringify(["SCADA", "HMI", "Industrial IoT"]) },
  { skill: "SAP", skill_fr: "SAP", field: "Engineering", category: "ERP", demand_score: 77, growth_trend: "stable", growth_percent: 8.0, job_count: 800, average_salary_boost: 4000, competition_level: "medium", time_to_learn: "4-8 months", resources: JSON.stringify(["SAP Learning Hub", "Capgemini"]), related_skills: JSON.stringify(["ABAP", "S/4HANA", "Business Process"]) },

  // Finance skills
  { skill: "Financial Modeling", skill_fr: "Modelisation Financiere", field: "Finance", category: "Analysis", demand_score: 78, growth_trend: "rising", growth_percent: 12.0, job_count: 500, average_salary_boost: 4000, competition_level: "medium", time_to_learn: "3-6 months", resources: JSON.stringify(["CFA Institute", "ISCAE"]), related_skills: JSON.stringify(["Excel", "VBA", "Bloomberg"]) },
  { skill: "IFRS/Accounting Standards", skill_fr: "Normes IFRS/Comptables", field: "Finance", category: "Accounting", demand_score: 75, growth_trend: "stable", growth_percent: 5.0, job_count: 1800, average_salary_boost: 2000, competition_level: "medium", time_to_learn: "6-12 months", resources: JSON.stringify(["OEC", "ISCAE"]), related_skills: JSON.stringify(["Auditing", "Tax", "Sage"]) },
  { skill: "Risk Management", skill_fr: "Gestion des Risques", field: "Finance", category: "Risk", demand_score: 80, growth_trend: "rising", growth_percent: 18.0, job_count: 400, average_salary_boost: 5000, competition_level: "low", time_to_learn: "6-12 months", resources: JSON.stringify(["FRM", "GARP", "BAM"]), related_skills: JSON.stringify(["Basel III", "Credit Risk", "Market Risk"]) },
  { skill: "Sage/Compta", skill_fr: "Sage/Comptabilite", field: "Finance", category: "Software", demand_score: 72, growth_trend: "declining", growth_percent: -3.0, job_count: 2200, average_salary_boost: 1000, competition_level: "high", time_to_learn: "1-2 months", resources: JSON.stringify(["Sage", "OFPPT"]), related_skills: JSON.stringify(["Excel", "IFRS", "Tax"]) },

  // Healthcare skills
  { skill: "Clinical Research", skill_fr: "Recherche Clinique", field: "Healthcare", category: "Research", demand_score: 65, growth_trend: "rising", growth_percent: 20.0, job_count: 250, average_salary_boost: 3000, competition_level: "low", time_to_learn: "12+ months", resources: JSON.stringify(["ICH-GCP", "Sothema"]), related_skills: JSON.stringify(["Biostatistics", "Pharmacovigilance", "GCP"]) },
  { skill: "Medical Imaging", skill_fr: "Imagerie Medicale", field: "Healthcare", category: "Technical", demand_score: 68, growth_trend: "stable", growth_percent: 8.0, job_count: 300, average_salary_boost: 2500, competition_level: "low", time_to_learn: "12+ months", resources: JSON.stringify(["CHU", "FMPM"]), related_skills: JSON.stringify(["Radiology", "CT/MRI", "Ultrasound"]) },

  // Cross-sector
  { skill: "Project Management (PMP)", skill_fr: "Gestion de Projet (PMP)", field: null, category: "Management", demand_score: 83, growth_trend: "rising", growth_percent: 12.0, job_count: 2800, average_salary_boost: 4000, competition_level: "medium", time_to_learn: "3-6 months", resources: JSON.stringify(["PMI", "ISCAE", "HEM"]), related_skills: JSON.stringify(["Scrum", "MS Project", "Risk Management"]) },
  { skill: "French Business Writing", skill_fr: "Redaction Professionnelle Francais", field: null, category: "Soft Skill", demand_score: 85, growth_trend: "stable", growth_percent: 2.0, job_count: 5000, average_salary_boost: 1000, competition_level: "high", time_to_learn: "Ongoing", resources: JSON.stringify(["Alliance Francaise", "DELF/DALF"]), related_skills: JSON.stringify(["Communication", "Report Writing", "Presentation"]) },
  { skill: "English Proficiency", skill_fr: "Maitrise de l'Anglais", field: null, category: "Soft Skill", demand_score: 90, growth_trend: "rising", growth_percent: 15.0, job_count: 6000, average_salary_boost: 3000, competition_level: "high", time_to_learn: "6-12 months", resources: JSON.stringify(["British Council", "IELTS", "TOEFL"]), related_skills: JSON.stringify(["Business English", "Technical Writing", "Presentation"]) },
  { skill: "Data Analysis", skill_fr: "Analyse de Donnees", field: null, category: "Data", demand_score: 86, growth_trend: "rising", growth_percent: 25.0, job_count: 2000, average_salary_boost: 3500, competition_level: "medium", time_to_learn: "3-6 months", resources: JSON.stringify(["Google Analytics", "DataCamp"]), related_skills: JSON.stringify(["Excel", "SQL", "Python", "Power BI"]) },
  { skill: "Excel Advanced", skill_fr: "Excel Avance", field: null, category: "Software", demand_score: 88, growth_trend: "stable", growth_percent: 3.0, job_count: 8000, average_salary_boost: 1500, competition_level: "very high", time_to_learn: "1-2 months", resources: JSON.stringify(["Microsoft", "OFPPT"]), related_skills: JSON.stringify(["VBA", "Power BI", "Data Analysis"]) },
  { skill: "Git/Version Control", skill_fr: "Git/Gestion de Versions", field: "IT", category: "DevOps", demand_score: 86, growth_trend: "stable", growth_percent: 8.0, job_count: 3500, average_salary_boost: 1000, competition_level: "medium", time_to_learn: "1-2 weeks", resources: JSON.stringify(["GitHub", "GitLab"]), related_skills: JSON.stringify(["CI/CD", "GitHub Actions", "Code Review"]) },
  { skill: "Terraform", skill_fr: "Terraform", field: "IT", category: "DevOps", demand_score: 72, growth_trend: "rising", growth_percent: 38.0, job_count: 450, average_salary_boost: 5000, competition_level: "low", time_to_learn: "2-4 months", resources: JSON.stringify(["HashiCorp", "AWS"]), related_skills: JSON.stringify(["AWS", "Docker", "Ansible"]) },
  { skill: "Blockchain", skill_fr: "Blockchain", field: "IT", category: "Emerging", demand_score: 55, growth_trend: "stable", growth_percent: 5.0, job_count: 120, average_salary_boost: 6000, competition_level: "low", time_to_learn: "6-12 months", resources: JSON.stringify(["Ethereum", "UM6P"]), related_skills: JSON.stringify(["Solidity", "Web3", "Cryptography"]) },
  { skill: "IoT", skill_fr: "Internet des Objets", field: "Engineering", category: "Emerging", demand_score: 65, growth_trend: "rising", growth_percent: 22.0, job_count: 350, average_salary_boost: 3500, competition_level: "low", time_to_learn: "4-8 months", resources: JSON.stringify(["Arduino", "Raspberry Pi", "EHTP"]), related_skills: JSON.stringify(["Embedded Systems", "Python", "MQTT"]) },
  { skill: "Salesforce", skill_fr: "Salesforce", field: "IT", category: "CRM", demand_score: 68, growth_trend: "rising", growth_percent: 18.0, job_count: 400, average_salary_boost: 4000, competition_level: "low", time_to_learn: "3-6 months", resources: JSON.stringify(["Trailhead", "Salesforce Morocco"]), related_skills: JSON.stringify(["CRM", "Apex", "Lightning"]) },
  { skill: "ServiceNow", skill_fr: "ServiceNow", field: "IT", category: "ITSM", demand_score: 62, growth_trend: "rising", growth_percent: 25.0, job_count: 300, average_salary_boost: 5000, competition_level: "low", time_to_learn: "3-6 months", resources: JSON.stringify(["ServiceNow", "NowLearning"]), related_skills: JSON.stringify(["ITIL", "JavaScript", "Workflow"]) },
  { skill: "Spring Boot", skill_fr: "Spring Boot", field: "IT", category: "Backend", demand_score: 78, growth_trend: "stable", growth_percent: 8.0, job_count: 1600, average_salary_boost: 2500, competition_level: "medium", time_to_learn: "3-6 months", resources: JSON.stringify(["Spring docs", "EMI"]), related_skills: JSON.stringify(["Java", "Microservices", "REST API"]) },
  { skill: ".NET/C#", skill_fr: ".NET/C#", field: "IT", category: "Backend", demand_score: 73, growth_trend: "stable", growth_percent: 6.0, job_count: 1100, average_salary_boost: 2200, competition_level: "medium", time_to_learn: "4-6 months", resources: JSON.stringify(["Microsoft Learn", "CGI"]), related_skills: JSON.stringify(["Azure", "SQL Server", "Entity Framework"]) },
  { skill: "MongoDB", skill_fr: "MongoDB", field: "IT", category: "Database", demand_score: 71, growth_trend: "rising", growth_percent: 18.0, job_count: 950, average_salary_boost: 2000, competition_level: "medium", time_to_learn: "1-2 months", resources: JSON.stringify(["MongoDB University"]), related_skills: JSON.stringify(["Node.js", "Express", "Mongoose"]) },
];

// ---------------------------------------------------------------------------
// 3. REGIONAL JOB STATS  (20+ entries)
// ---------------------------------------------------------------------------
const regionalData = [
  {
    region: "Casablanca-Settat",
    region_fr: "Casablanca-Settat",
    total_jobs: 128000,
    job_growth: 6.5,
    average_salary: 14500,
    top_industries: JSON.stringify(["IT/Offshoring", "Finance/Banking", "Services", "Automotive", "Logistics"]),
    top_employers: JSON.stringify(["Capgemini", "Attijariwafa Bank", "OCP", "Intelcia", "Sofrecom", "HPS", "CGI"]),
    skills_in_demand: JSON.stringify(["JavaScript", "Python", "Java", "SQL", "AWS", "Financial Modeling"]),
    unemployment_rate: 11.2,
    cost_of_living: "high",
    quality_of_life: 72,
  },
  {
    region: "Rabat-Sale-Kenitra",
    region_fr: "Rabat-Sale-Kenitra",
    total_jobs: 68000,
    job_growth: 4.8,
    average_salary: 13200,
    top_industries: JSON.stringify(["Government/Admin", "IT/Telecom", "Education", "Defense", "Consulting"]),
    top_employers: JSON.stringify(["Ministeres", "ONCF", "Maroc Telecom", "Capgemini Rabat", "Atos"]),
    skills_in_demand: JSON.stringify(["French Business Writing", "Project Management", "Java", "SAP", "Cybersecurity"]),
    unemployment_rate: 12.8,
    cost_of_living: "medium-high",
    quality_of_life: 76,
  },
  {
    region: "Tanger-Tetouan-Al Hoceima",
    region_fr: "Tanger-Tetouan-Al Hoceima",
    total_jobs: 52000,
    job_growth: 8.2,
    average_salary: 11800,
    top_industries: JSON.stringify(["Automotive", "Aerospace", "Logistics/Port", "Textile", "Offshoring"]),
    top_employers: JSON.stringify(["Renault", "Stellantis", "Tanger Med", "Safran", "Hands", "Lear Corporation"]),
    skills_in_demand: JSON.stringify(["Quality Management", "Lean/Six Sigma", "AutoCAD", "PLC", "Supply Chain"]),
    unemployment_rate: 10.5,
    cost_of_living: "medium",
    quality_of_life: 70,
  },
  {
    region: "Marrakech-Safi",
    region_fr: "Marrakech-Safi",
    total_jobs: 38000,
    job_growth: 5.5,
    average_salary: 10200,
    top_industries: JSON.stringify(["Tourism/Hospitality", "Artisanal", "Agriculture", "Real Estate", "Services"]),
    top_employers: JSON.stringify(["Accor", "Marriott", "OCP Safi", "Marjane", "ONCF"]),
    skills_in_demand: JSON.stringify(["Hotel Management", "English", "Digital Marketing", "Customer Service", "French"]),
    unemployment_rate: 13.5,
    cost_of_living: "medium",
    quality_of_life: 74,
  },
  {
    region: "Fes-Meknes",
    region_fr: "Fes-Meknes",
    total_jobs: 32000,
    job_growth: 3.8,
    average_salary: 9800,
    top_industries: JSON.stringify(["Textile", "Agri-Food", "Artisanal", "Education", "Manufacturing"]),
    top_employers: JSON.stringify(["USMBA", "Groupe Ynna", "Bel Maroc", "Centrale Laitiere", "OFPPT"]),
    skills_in_demand: JSON.stringify(["Industrial Engineering", "Quality Control", "AutoCAD", "Agri-business", "Teaching"]),
    unemployment_rate: 15.2,
    cost_of_living: "low-medium",
    quality_of_life: 68,
  },
  {
    region: "Souss-Massa",
    region_fr: "Souss-Massa",
    total_jobs: 28000,
    job_growth: 4.2,
    average_salary: 10500,
    top_industries: JSON.stringify(["Agriculture/Export", "Fishing", "Tourism", "Agri-Food Processing", "Mining"]),
    top_employers: JSON.stringify(["Les Domaines Agricoles", "Marjane", "Copag", "Unimer", "COMAPRIM"]),
    skills_in_demand: JSON.stringify(["Agricultural Engineering", "Quality Control", "Export Management", "Logistics", "English"]),
    unemployment_rate: 12.0,
    cost_of_living: "medium",
    quality_of_life: 73,
  },
  {
    region: "Oriental",
    region_fr: "Oriental",
    total_jobs: 18000,
    job_growth: 5.0,
    average_salary: 10000,
    top_industries: JSON.stringify(["Mining", "Energy/Solar", "Agriculture", "Logistics", "Cross-border Trade"]),
    top_employers: JSON.stringify(["Managem", "OCP", "MASEN", "ONEE", "Oriental Hydrocarbon"]),
    skills_in_demand: JSON.stringify(["Mining Engineering", "Renewable Energy", "HSE", "Electrical Engineering", "Arabic"]),
    unemployment_rate: 16.5,
    cost_of_living: "low",
    quality_of_life: 62,
  },
  {
    region: "Beni Mellal-Khenifra",
    region_fr: "Beni Mellal-Khenifra",
    total_jobs: 14000,
    job_growth: 3.2,
    average_salary: 8800,
    top_industries: JSON.stringify(["Agriculture", "Mining/Phosphate", "Agri-Food", "Education", "Public Sector"]),
    top_employers: JSON.stringify(["OCP Khouribga", "COSUMAR", "USMS", "OFPPT", "CHR"]),
    skills_in_demand: JSON.stringify(["Chemical Engineering", "Mining", "Agriculture", "Quality Control", "Maintenance"]),
    unemployment_rate: 14.8,
    cost_of_living: "low",
    quality_of_life: 60,
  },
  {
    region: "Draa-Tafilalet",
    region_fr: "Draa-Tafilalet",
    total_jobs: 12000,
    job_growth: 7.5,
    average_salary: 11000,
    top_industries: JSON.stringify(["Renewable Energy", "Tourism", "Mining", "Agriculture/Dates", "Construction"]),
    top_employers: JSON.stringify(["MASEN Ouarzazate", "Nareva", "ONEE", "Hotels/Riads", "Managem"]),
    skills_in_demand: JSON.stringify(["Solar Energy", "Electrical Engineering", "Tourism Management", "HSE", "Project Management"]),
    unemployment_rate: 13.0,
    cost_of_living: "low",
    quality_of_life: 65,
  },
  {
    region: "Kenitra (Atlantic Free Zone)",
    region_fr: "Kenitra (Zone Franche Atlantique)",
    total_jobs: 22000,
    job_growth: 12.5,
    average_salary: 11500,
    top_industries: JSON.stringify(["Automotive", "Aerospace", "Electronics", "Agri-Food", "Offshoring"]),
    top_employers: JSON.stringify(["Stellantis Kenitra", "Aptiv", "Valeo", "Yazaki", "Sumitomo"]),
    skills_in_demand: JSON.stringify(["Automotive Engineering", "Quality (IATF)", "Lean Manufacturing", "PLC", "Supply Chain"]),
    unemployment_rate: 11.0,
    cost_of_living: "low-medium",
    quality_of_life: 66,
  },
  {
    region: "Laayoune-Sakia El Hamra",
    region_fr: "Laayoune-Sakia El Hamra",
    total_jobs: 8000,
    job_growth: 6.0,
    average_salary: 12000,
    top_industries: JSON.stringify(["Fishing/Seafood", "Phosphate", "Energy", "Construction", "Public Sector"]),
    top_employers: JSON.stringify(["OCP", "ONEE", "Phosboucraa", "Ministere Peche"]),
    skills_in_demand: JSON.stringify(["Marine Engineering", "Mining", "HSE", "Electrical", "Logistics"]),
    unemployment_rate: 18.0,
    cost_of_living: "medium",
    quality_of_life: 58,
  },
  {
    region: "Dakhla-Oued Ed-Dahab",
    region_fr: "Dakhla-Oued Ed-Dahab",
    total_jobs: 5000,
    job_growth: 9.0,
    average_salary: 12500,
    top_industries: JSON.stringify(["Fishing/Aquaculture", "Tourism/Kitesurf", "Agriculture", "Renewable Energy", "Port"]),
    top_employers: JSON.stringify(["Dakhla Port", "ANDA", "Hotels", "MASEN", "ONEE"]),
    skills_in_demand: JSON.stringify(["Aquaculture", "Tourism", "Renewable Energy", "Marine Biology", "Project Management"]),
    unemployment_rate: 15.0,
    cost_of_living: "medium",
    quality_of_life: 64,
  },
  {
    region: "Guelmim-Oued Noun",
    region_fr: "Guelmim-Oued Noun",
    total_jobs: 6000,
    job_growth: 3.5,
    average_salary: 9000,
    top_industries: JSON.stringify(["Agriculture", "Fishing", "Artisanal", "Public Sector", "Mining"]),
    top_employers: JSON.stringify(["OFPPT", "CHR", "Commune", "Cooperatives"]),
    skills_in_demand: JSON.stringify(["Agricultural Engineering", "Teaching", "Healthcare", "Maintenance", "Arabic"]),
    unemployment_rate: 17.5,
    cost_of_living: "low",
    quality_of_life: 55,
  },
  {
    region: "Casablanca Finance City (CFC)",
    region_fr: "Casablanca Finance City (CFC)",
    total_jobs: 15000,
    job_growth: 10.0,
    average_salary: 22000,
    top_industries: JSON.stringify(["Finance/Banking", "Insurance", "Asset Management", "Fintech", "Consulting"]),
    top_employers: JSON.stringify(["Attijariwafa", "CDG Capital", "Deloitte", "PwC", "McKinsey Morocco"]),
    skills_in_demand: JSON.stringify(["Financial Modeling", "Risk Management", "CFA", "English", "Python"]),
    unemployment_rate: 5.0,
    cost_of_living: "very high",
    quality_of_life: 80,
  },
  {
    region: "Tangier Tech",
    region_fr: "Tangier Tech",
    total_jobs: 8500,
    job_growth: 15.0,
    average_salary: 13500,
    top_industries: JSON.stringify(["IT/Digital", "Smart City", "IoT", "Automotive Tech", "R&D"]),
    top_employers: JSON.stringify(["Huawei", "Tech Companies", "Startups", "Renault R&D"]),
    skills_in_demand: JSON.stringify(["Python", "IoT", "Cloud", "AI/ML", "DevOps"]),
    unemployment_rate: 8.0,
    cost_of_living: "medium",
    quality_of_life: 72,
  },
  {
    region: "Technopark Casablanca",
    region_fr: "Technopark Casablanca",
    total_jobs: 12000,
    job_growth: 11.0,
    average_salary: 16000,
    top_industries: JSON.stringify(["Startups", "Fintech", "E-commerce", "SaaS", "Digital Agency"]),
    top_employers: JSON.stringify(["Chari", "WafaCash", "Hmizate", "Avito", "DabaDoc"]),
    skills_in_demand: JSON.stringify(["React", "Node.js", "Python", "Product Management", "Growth Hacking"]),
    unemployment_rate: 7.0,
    cost_of_living: "high",
    quality_of_life: 75,
  },
  {
    region: "Mohammed VI Tangier Tech City",
    region_fr: "Cite Mohammed VI Tanger Tech",
    total_jobs: 3500,
    job_growth: 25.0,
    average_salary: 14000,
    top_industries: JSON.stringify(["Chinese Tech Companies", "Manufacturing 4.0", "Logistics", "R&D"]),
    top_employers: JSON.stringify(["BYD", "CITIC Dicastal", "Haite Group", "Various Chinese firms"]),
    skills_in_demand: JSON.stringify(["Mandarin", "Industrial Engineering", "Quality", "Supply Chain", "English"]),
    unemployment_rate: 6.0,
    cost_of_living: "medium",
    quality_of_life: 68,
  },
  {
    region: "Nouaceur Aeropole",
    region_fr: "Aeropole Nouaceur",
    total_jobs: 18000,
    job_growth: 8.0,
    average_salary: 13000,
    top_industries: JSON.stringify(["Aerospace", "Defense", "Electronics", "Composites", "MRO"]),
    top_employers: JSON.stringify(["Safran", "Bombardier", "UTC Aerospace", "Stelia", "Matis Aerospace"]),
    skills_in_demand: JSON.stringify(["Aerospace Engineering", "Composites", "Quality (EN 9100)", "CNC", "NDT"]),
    unemployment_rate: 8.5,
    cost_of_living: "medium-high",
    quality_of_life: 70,
  },
  {
    region: "Tamesna-Temara",
    region_fr: "Tamesna-Temara",
    total_jobs: 9000,
    job_growth: 5.5,
    average_salary: 11000,
    top_industries: JSON.stringify(["Offshoring/BPO", "IT Services", "Education", "Healthcare"]),
    top_employers: JSON.stringify(["Intelcia", "Webhelp", "Majorel", "Cliniques privees"]),
    skills_in_demand: JSON.stringify(["French", "Customer Service", "IT Support", "Telecom", "English"]),
    unemployment_rate: 13.0,
    cost_of_living: "low-medium",
    quality_of_life: 64,
  },
  {
    region: "Oujda-Angad",
    region_fr: "Oujda-Angad",
    total_jobs: 10000,
    job_growth: 4.0,
    average_salary: 9500,
    top_industries: JSON.stringify(["Energy/Solar", "Education", "Healthcare", "Cross-border Trade", "Mining"]),
    top_employers: JSON.stringify(["Universite Mohammed Premier", "CHU Oujda", "ONEE", "MASEN", "Managem"]),
    skills_in_demand: JSON.stringify(["Renewable Energy", "Healthcare", "Teaching", "Mining Engineering", "Arabic/French"]),
    unemployment_rate: 16.0,
    cost_of_living: "low",
    quality_of_life: 60,
  },
];

// ---------------------------------------------------------------------------
// 4. EMPLOYER DATABASE  (50+ entries)
// ---------------------------------------------------------------------------
const employerData = [
  // --- TECH / IT / OFFSHORING ---
  { name: "Capgemini Morocco", name_fr: "Capgemini Maroc", industry: "IT Services/Consulting", industry_fr: "Services IT/Conseil", size: "large", employee_count: "5000-10000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Rabat", "Fes"]), founded: 2006, description: "Global IT services and consulting firm with major nearshore delivery centers in Morocco serving European clients.", description_fr: "Societe mondiale de services IT et conseil avec des centres nearshore majeurs au Maroc.", culture: JSON.stringify({ values: ["Innovation", "Diversity", "Collaboration"], perks: ["Training budget", "Health insurance", "Remote work options"], work_life: "Good" }), fields: JSON.stringify(["IT", "Consulting", "Digital"]), open_positions: 120, average_salary: 16000, rating: 3.8, review_count: 450, hiring_trend: "growing", is_verified: true },
  { name: "CGI Morocco", name_fr: "CGI Maroc", industry: "IT Services", industry_fr: "Services IT", size: "large", employee_count: "3000-5000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Rabat"]), founded: 2008, description: "Canadian IT consulting firm with significant operations in Morocco, specializing in enterprise solutions and outsourcing.", description_fr: "Societe canadienne de conseil IT avec des operations importantes au Maroc.", culture: JSON.stringify({ values: ["Client focus", "Quality", "Integrity"], perks: ["Career development", "Stock purchase plan", "Health benefits"], work_life: "Good" }), fields: JSON.stringify(["IT", "Consulting"]), open_positions: 85, average_salary: 15500, rating: 3.7, review_count: 320, hiring_trend: "growing", is_verified: true },
  { name: "Atos Morocco", name_fr: "Atos Maroc", industry: "IT Services", industry_fr: "Services IT", size: "large", employee_count: "2000-4000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Rabat"]), founded: 2005, description: "European IT company focused on cybersecurity, cloud, and digital workplace solutions for Moroccan and international clients.", description_fr: "Entreprise IT europeenne specialisee en cybersecurite, cloud et solutions digitales.", culture: JSON.stringify({ values: ["Decarbonization", "Innovation", "Trust"], perks: ["Training", "Health insurance", "Flexible hours"], work_life: "Moderate" }), fields: JSON.stringify(["IT", "Cybersecurity", "Cloud"]), open_positions: 60, average_salary: 14500, rating: 3.5, review_count: 210, hiring_trend: "stable", is_verified: true },
  { name: "Sofrecom Morocco", name_fr: "Sofrecom Maroc", industry: "Telecom/IT", industry_fr: "Telecom/IT", size: "medium", employee_count: "500-1000", headquarters: "Rabat", locations: JSON.stringify(["Rabat"]), founded: 2014, description: "Orange Group subsidiary providing IT and telecom consulting, strong in network engineering and digital transformation.", description_fr: "Filiale du groupe Orange, conseil en IT et telecoms.", culture: JSON.stringify({ values: ["Orange Group culture", "Innovation", "International"], perks: ["Orange benefits", "International mobility", "Training"], work_life: "Good" }), fields: JSON.stringify(["Telecom", "IT"]), open_positions: 35, average_salary: 15000, rating: 3.9, review_count: 85, hiring_trend: "growing", is_verified: true },
  { name: "Intelcia", name_fr: "Intelcia", industry: "BPO/Outsourcing", industry_fr: "BPO/Externalisation", size: "large", employee_count: "20000-35000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Rabat", "Fes", "Marrakech", "Tanger"]), founded: 2000, description: "Morocco's largest BPO company with global reach, providing customer experience, IT outsourcing, and consulting services.", description_fr: "Plus grande entreprise BPO du Maroc avec une presence mondiale.", culture: JSON.stringify({ values: ["Customer Excellence", "People First", "Agility"], perks: ["Career growth", "Health insurance", "Transport"], work_life: "Moderate" }), fields: JSON.stringify(["BPO", "IT", "Customer Service"]), open_positions: 500, average_salary: 7500, rating: 3.3, review_count: 1200, hiring_trend: "growing", is_verified: true },
  { name: "Majorel Morocco", name_fr: "Majorel Maroc", industry: "BPO/CX", industry_fr: "BPO/Experience Client", size: "large", employee_count: "8000-12000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Rabat", "Fes"]), founded: 2019, description: "Global customer experience company (Teleperformance group) with major Moroccan operations serving European markets.", description_fr: "Entreprise mondiale d'experience client (groupe Teleperformance) avec des operations majeures au Maroc.", culture: JSON.stringify({ values: ["Creativity", "Excellence", "Respect"], perks: ["Training", "Health insurance", "Meal vouchers"], work_life: "Moderate" }), fields: JSON.stringify(["BPO", "Customer Service", "Digital"]), open_positions: 300, average_salary: 7000, rating: 3.2, review_count: 800, hiring_trend: "stable", is_verified: true },
  { name: "Webhelp Morocco", name_fr: "Webhelp Maroc", industry: "BPO/CX", industry_fr: "BPO/Experience Client", size: "large", employee_count: "6000-10000", headquarters: "Rabat", locations: JSON.stringify(["Rabat", "Casablanca", "Meknes", "Kenitra"]), founded: 2010, description: "French-origin BPO group now part of Concentrix, offering multilingual customer support and digital services.", description_fr: "Groupe BPO d'origine francaise, partie de Concentrix, offrant du support client multilingue.", culture: JSON.stringify({ values: ["Think Human", "Innovation", "Integrity"], perks: ["Training academy", "Health insurance", "Team events"], work_life: "Moderate" }), fields: JSON.stringify(["BPO", "Customer Service"]), open_positions: 250, average_salary: 6800, rating: 3.4, review_count: 650, hiring_trend: "stable", is_verified: true },
  { name: "S2M", name_fr: "S2M", industry: "Fintech/IT", industry_fr: "Fintech/IT", size: "medium", employee_count: "500-1000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca"]), founded: 1983, description: "Moroccan leader in electronic payment solutions, cards, and digital banking technology across Africa.", description_fr: "Leader marocain des solutions de paiement electronique et de technologie bancaire.", culture: JSON.stringify({ values: ["Innovation", "Security", "Pan-African expansion"], perks: ["Competitive salary", "Health insurance", "Profit sharing"], work_life: "Good" }), fields: JSON.stringify(["Fintech", "IT", "Banking"]), open_positions: 20, average_salary: 17000, rating: 3.8, review_count: 45, hiring_trend: "growing", is_verified: true },
  { name: "HPS", name_fr: "HPS", industry: "Fintech/Payment", industry_fr: "Fintech/Paiement", size: "medium", employee_count: "500-1000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Dubai", "Paris"]), founded: 1995, description: "Global payment solutions provider headquartered in Morocco, powering transactions for banks and fintechs worldwide.", description_fr: "Fournisseur mondial de solutions de paiement base au Maroc.", culture: JSON.stringify({ values: ["Innovation", "Global mindset", "Excellence"], perks: ["International exposure", "Stock options", "Training"], work_life: "Good" }), fields: JSON.stringify(["Fintech", "IT", "Payments"]), open_positions: 30, average_salary: 18000, rating: 4.0, review_count: 60, hiring_trend: "growing", is_verified: true },
  { name: "Involys", name_fr: "Involys", industry: "IT/Software", industry_fr: "IT/Logiciel", size: "medium", employee_count: "200-500", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca"]), founded: 1986, description: "Moroccan software company specializing in document management, archiving, and enterprise content solutions.", description_fr: "Editeur marocain de logiciels specialise dans la gestion documentaire.", culture: JSON.stringify({ values: ["Moroccan innovation", "Expertise", "Reliability"], perks: ["Competitive salary", "Health benefits"], work_life: "Good" }), fields: JSON.stringify(["IT", "Software"]), open_positions: 10, average_salary: 14000, rating: 3.5, review_count: 25, hiring_trend: "stable", is_verified: true },
  { name: "SQLI Morocco", name_fr: "SQLI Maroc", industry: "IT/Digital", industry_fr: "IT/Digital", size: "medium", employee_count: "500-1000", headquarters: "Rabat", locations: JSON.stringify(["Rabat", "Casablanca"]), founded: 2008, description: "French digital agency with Moroccan development center, specializing in e-commerce, CMS, and digital transformation.", description_fr: "Agence digitale francaise avec un centre de developpement au Maroc.", culture: JSON.stringify({ values: ["Digital craft", "Teamwork", "Learning"], perks: ["Training", "Team events", "Remote options"], work_life: "Good" }), fields: JSON.stringify(["IT", "Digital", "E-commerce"]), open_positions: 40, average_salary: 14500, rating: 3.6, review_count: 90, hiring_trend: "growing", is_verified: true },

  // --- INDUSTRIAL ---
  { name: "OCP Group", name_fr: "Groupe OCP", industry: "Mining/Chemicals", industry_fr: "Mines/Chimie", size: "enterprise", employee_count: "20000-25000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Khouribga", "Jorf Lasfar", "Safi", "Laayoune"]), founded: 1920, description: "World's largest phosphate producer and Morocco's biggest employer, driving industrial innovation and Africa's food security.", description_fr: "Premier producteur mondial de phosphate et plus grand employeur industriel du Maroc.", culture: JSON.stringify({ values: ["Sustainability", "Innovation", "African development"], perks: ["Excellent benefits", "Housing", "Education support", "Medical"], work_life: "Good" }), fields: JSON.stringify(["Mining", "Chemical", "Engineering"]), open_positions: 200, average_salary: 18000, rating: 4.2, review_count: 800, hiring_trend: "growing", is_verified: true },
  { name: "Renault Morocco", name_fr: "Renault Maroc", industry: "Automotive", industry_fr: "Automobile", size: "large", employee_count: "6000-8000", headquarters: "Tanger", locations: JSON.stringify(["Tanger", "Casablanca"]), founded: 2012, description: "Renault's Moroccan manufacturing hub in Tanger producing Dacia and Renault vehicles for export and domestic market.", description_fr: "Pole de fabrication de Renault au Maroc, produisant des vehicules Dacia et Renault.", culture: JSON.stringify({ values: ["Quality", "Efficiency", "Innovation"], perks: ["Good salary", "Transport", "Cafeteria", "Health"], work_life: "Moderate" }), fields: JSON.stringify(["Automotive", "Manufacturing", "Engineering"]), open_positions: 80, average_salary: 13000, rating: 3.7, review_count: 350, hiring_trend: "stable", is_verified: true },
  { name: "Stellantis Morocco", name_fr: "Stellantis Maroc", industry: "Automotive", industry_fr: "Automobile", size: "large", employee_count: "4000-6000", headquarters: "Kenitra", locations: JSON.stringify(["Kenitra", "Casablanca"]), founded: 2019, description: "Stellantis (PSA/FCA) manufacturing plant in Kenitra, producing Peugeot and Opel vehicles for global markets.", description_fr: "Usine Stellantis a Kenitra, produisant des vehicules Peugeot et Opel.", culture: JSON.stringify({ values: ["Performance", "Sustainability", "Teamwork"], perks: ["Competitive package", "Health", "Training"], work_life: "Moderate" }), fields: JSON.stringify(["Automotive", "Manufacturing"]), open_positions: 65, average_salary: 12500, rating: 3.6, review_count: 180, hiring_trend: "growing", is_verified: true },
  { name: "Safran Morocco", name_fr: "Safran Maroc", industry: "Aerospace", industry_fr: "Aeronautique", size: "large", employee_count: "3000-5000", headquarters: "Casablanca (Nouaceur)", locations: JSON.stringify(["Casablanca", "Nouaceur"]), founded: 2001, description: "French aerospace giant's Moroccan subsidiary producing aircraft engine components, wiring, and nacelles.", description_fr: "Filiale marocaine du geant aeronautique francais, produisant des composants moteurs.", culture: JSON.stringify({ values: ["Excellence", "Safety", "Innovation"], perks: ["Good salary", "Training in France", "Health", "Retirement"], work_life: "Good" }), fields: JSON.stringify(["Aerospace", "Engineering", "Manufacturing"]), open_positions: 50, average_salary: 14000, rating: 4.0, review_count: 120, hiring_trend: "growing", is_verified: true },
  { name: "Bombardier Morocco", name_fr: "Bombardier Maroc", industry: "Aerospace", industry_fr: "Aeronautique", size: "large", employee_count: "1500-2500", headquarters: "Casablanca (Nouaceur)", locations: JSON.stringify(["Casablanca"]), founded: 2013, description: "Canadian aerospace company's Moroccan production facility for aircraft structural components and electrical systems.", description_fr: "Installation de production marocaine de Bombardier pour composants aeronautiques.", culture: JSON.stringify({ values: ["Safety", "Quality", "Teamwork"], perks: ["Competitive salary", "Health insurance", "Training"], work_life: "Moderate" }), fields: JSON.stringify(["Aerospace", "Engineering"]), open_positions: 30, average_salary: 13500, rating: 3.8, review_count: 75, hiring_trend: "stable", is_verified: true },
  { name: "ALTEN Morocco", name_fr: "ALTEN Maroc", industry: "Engineering Consulting", industry_fr: "Conseil en Ingenierie", size: "large", employee_count: "2000-3500", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Rabat", "Fes"]), founded: 2008, description: "French engineering and technology consulting firm with Moroccan offices serving automotive, aerospace, and IT sectors.", description_fr: "Societe francaise de conseil en ingenierie et technologie.", culture: JSON.stringify({ values: ["Technical excellence", "Career growth", "Diversity"], perks: ["Training", "Health insurance", "International projects"], work_life: "Moderate" }), fields: JSON.stringify(["Engineering", "IT", "Automotive"]), open_positions: 90, average_salary: 13000, rating: 3.4, review_count: 250, hiring_trend: "growing", is_verified: true },
  { name: "Altran Morocco", name_fr: "Altran Maroc", industry: "Engineering Consulting", industry_fr: "Conseil en Ingenierie", size: "large", employee_count: "1500-2500", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Rabat"]), founded: 2010, description: "Now part of Capgemini Engineering, providing R&D and engineering services for automotive, telecom, and energy.", description_fr: "Partie de Capgemini Engineering, services R&D et ingenierie.", culture: JSON.stringify({ values: ["Innovation", "Responsibility", "Learning"], perks: ["Capgemini benefits", "Training", "Health"], work_life: "Moderate" }), fields: JSON.stringify(["Engineering", "R&D", "Automotive"]), open_positions: 55, average_salary: 13500, rating: 3.5, review_count: 150, hiring_trend: "stable", is_verified: true },

  // --- BANKING / FINANCE ---
  { name: "Attijariwafa Bank", name_fr: "Attijariwafa Bank", industry: "Banking", industry_fr: "Banque", size: "enterprise", employee_count: "15000-20000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Rabat", "All major cities", "25+ African countries"]), founded: 2003, description: "Morocco's largest bank and leading financial group in Africa, offering retail, corporate, and investment banking.", description_fr: "Premiere banque du Maroc et groupe financier leader en Afrique.", culture: JSON.stringify({ values: ["Leadership", "Pan-African vision", "Innovation"], perks: ["Housing loan", "Health", "Performance bonus", "Retirement plan"], work_life: "Moderate" }), fields: JSON.stringify(["Banking", "Finance", "Insurance"]), open_positions: 150, average_salary: 16000, rating: 3.9, review_count: 600, hiring_trend: "growing", is_verified: true },
  { name: "BMCE Bank of Africa", name_fr: "BMCE Bank of Africa", industry: "Banking", industry_fr: "Banque", size: "enterprise", employee_count: "12000-15000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Rabat", "All major cities", "20+ African countries"]), founded: 1959, description: "Major Moroccan bank with strong pan-African presence, known for sustainability and youth employment initiatives.", description_fr: "Grande banque marocaine avec une forte presence panafricaine.", culture: JSON.stringify({ values: ["Sustainability", "Youth", "Africa"], perks: ["Health insurance", "Training", "Housing loan"], work_life: "Moderate" }), fields: JSON.stringify(["Banking", "Finance"]), open_positions: 100, average_salary: 15000, rating: 3.7, review_count: 450, hiring_trend: "stable", is_verified: true },
  { name: "Banque Centrale Populaire", name_fr: "Banque Centrale Populaire", industry: "Banking", industry_fr: "Banque", size: "enterprise", employee_count: "10000-15000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "All major cities"]), founded: 1961, description: "Cooperative banking group with the largest branch network in Morocco, serving retail and SME clients.", description_fr: "Groupe bancaire cooperatif avec le plus grand reseau d'agences au Maroc.", culture: JSON.stringify({ values: ["Proximity", "Solidarity", "Cooperation"], perks: ["Job security", "Health benefits", "Retirement"], work_life: "Good" }), fields: JSON.stringify(["Banking", "Finance", "Microfinance"]), open_positions: 80, average_salary: 14000, rating: 3.6, review_count: 380, hiring_trend: "stable", is_verified: true },
  { name: "CDG Group", name_fr: "Groupe CDG", industry: "Finance/Investment", industry_fr: "Finance/Investissement", size: "large", employee_count: "5000-8000", headquarters: "Rabat", locations: JSON.stringify(["Rabat", "Casablanca"]), founded: 1959, description: "Morocco's premier institutional investor managing pension funds, real estate, and strategic investments.", description_fr: "Premier investisseur institutionnel du Maroc.", culture: JSON.stringify({ values: ["Public service", "Excellence", "Long-term vision"], perks: ["Excellent benefits", "Job security", "Housing", "Retirement"], work_life: "Very Good" }), fields: JSON.stringify(["Finance", "Investment", "Real Estate"]), open_positions: 40, average_salary: 18000, rating: 4.1, review_count: 150, hiring_trend: "stable", is_verified: true },
  { name: "CIH Bank", name_fr: "CIH Bank", industry: "Banking", industry_fr: "Banque", size: "large", employee_count: "2000-3000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Major cities"]), founded: 1920, description: "Moroccan bank known for digital innovation, mobile banking, and competitive housing loans.", description_fr: "Banque marocaine connue pour l'innovation digitale et les credits immobiliers.", culture: JSON.stringify({ values: ["Digital first", "Innovation", "Customer focus"], perks: ["Housing loans", "Health", "Digital tools"], work_life: "Good" }), fields: JSON.stringify(["Banking", "Fintech"]), open_positions: 35, average_salary: 14000, rating: 3.7, review_count: 120, hiring_trend: "growing", is_verified: true },
  { name: "Societe Generale Morocco", name_fr: "Societe Generale Maroc", industry: "Banking", industry_fr: "Banque", size: "large", employee_count: "3000-5000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Rabat", "Major cities"]), founded: 1913, description: "French banking group's Moroccan subsidiary, strong in corporate banking, trade finance, and international operations.", description_fr: "Filiale marocaine du groupe bancaire francais Societe Generale.", culture: JSON.stringify({ values: ["Team spirit", "Responsibility", "Innovation"], perks: ["French company benefits", "International exposure", "Training"], work_life: "Moderate" }), fields: JSON.stringify(["Banking", "Finance"]), open_positions: 45, average_salary: 15500, rating: 3.8, review_count: 200, hiring_trend: "stable", is_verified: true },

  // --- ENERGY ---
  { name: "ONEE", name_fr: "ONEE", industry: "Energy/Utilities", industry_fr: "Energie/Services publics", size: "enterprise", employee_count: "10000-15000", headquarters: "Rabat", locations: JSON.stringify(["Rabat", "All regions"]), founded: 1963, description: "Morocco's national electricity and water utility, managing power generation, distribution, and water supply across the country.", description_fr: "Office national de l'electricite et de l'eau potable du Maroc.", culture: JSON.stringify({ values: ["Public service", "Reliability", "Sustainability"], perks: ["Job security", "Housing", "Medical", "Retirement"], work_life: "Very Good" }), fields: JSON.stringify(["Energy", "Engineering", "Water"]), open_positions: 60, average_salary: 13000, rating: 3.8, review_count: 250, hiring_trend: "stable", is_verified: true },
  { name: "MASEN", name_fr: "MASEN", industry: "Renewable Energy", industry_fr: "Energies Renouvelables", size: "medium", employee_count: "200-500", headquarters: "Rabat", locations: JSON.stringify(["Rabat", "Ouarzazate", "Midelt", "Tanger", "Laayoune"]), founded: 2010, description: "Moroccan Agency for Sustainable Energy, managing Africa's largest solar complex (Noor) and Morocco's renewable energy transition.", description_fr: "Agence marocaine pour l'energie durable, gerant le complexe Noor.", culture: JSON.stringify({ values: ["Sustainability", "Innovation", "National service"], perks: ["Mission-driven work", "Good salary", "Training", "International projects"], work_life: "Good" }), fields: JSON.stringify(["Energy", "Renewable", "Engineering"]), open_positions: 15, average_salary: 17000, rating: 4.3, review_count: 30, hiring_trend: "growing", is_verified: true },
  { name: "Nareva Holding", name_fr: "Nareva Holding", industry: "Energy/Renewables", industry_fr: "Energie/Renouvelables", size: "medium", employee_count: "200-500", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Tanger", "Tarfaya", "Essaouira"]), founded: 2005, description: "Al Mada group's energy company, leading wind energy developer with major wind farms across Morocco.", description_fr: "Entreprise energetique du groupe Al Mada, leader de l'eolien au Maroc.", culture: JSON.stringify({ values: ["Clean energy", "Innovation", "Growth"], perks: ["Competitive salary", "Dynamic sector", "International partners"], work_life: "Good" }), fields: JSON.stringify(["Energy", "Wind", "Renewable"]), open_positions: 10, average_salary: 16000, rating: 4.0, review_count: 20, hiring_trend: "growing", is_verified: true },
  { name: "ENGIE Morocco", name_fr: "ENGIE Maroc", industry: "Energy", industry_fr: "Energie", size: "medium", employee_count: "300-600", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Jorf Lasfar"]), founded: 2015, description: "French energy group's Moroccan operations focused on independent power production and energy services.", description_fr: "Operations marocaines du groupe energetique francais ENGIE.", culture: JSON.stringify({ values: ["Safety", "Sustainability", "Performance"], perks: ["French company benefits", "Training", "Health"], work_life: "Good" }), fields: JSON.stringify(["Energy", "Power", "Services"]), open_positions: 12, average_salary: 15000, rating: 3.9, review_count: 35, hiring_trend: "stable", is_verified: true },
  { name: "Siemens Gamesa Morocco", name_fr: "Siemens Gamesa Maroc", industry: "Wind Energy", industry_fr: "Energie Eolienne", size: "medium", employee_count: "200-400", headquarters: "Tanger", locations: JSON.stringify(["Tanger"]), founded: 2017, description: "Wind turbine blade manufacturing facility in Tanger Free Zone, serving European and African wind projects.", description_fr: "Usine de fabrication de pales d'eoliennes dans la zone franche de Tanger.", culture: JSON.stringify({ values: ["Green energy", "Safety", "Quality"], perks: ["International company", "Training", "Health", "Transport"], work_life: "Good" }), fields: JSON.stringify(["Energy", "Manufacturing", "Wind"]), open_positions: 20, average_salary: 12000, rating: 3.7, review_count: 45, hiring_trend: "growing", is_verified: true },

  // --- PHARMA / HEALTH ---
  { name: "Sothema", name_fr: "Sothema", industry: "Pharmaceutical", industry_fr: "Pharmaceutique", size: "large", employee_count: "2000-3000", headquarters: "Casablanca (Bouskoura)", locations: JSON.stringify(["Casablanca", "Bouskoura"]), founded: 1976, description: "Morocco's largest pharmaceutical manufacturer, producing generics, biosimilars, and vaccines under license for Africa.", description_fr: "Plus grand fabricant pharmaceutique du Maroc, produisant generiques et biosimilaires.", culture: JSON.stringify({ values: ["Health access", "Quality", "African development"], perks: ["Competitive salary", "Health benefits", "Career growth"], work_life: "Good" }), fields: JSON.stringify(["Pharma", "Healthcare", "Manufacturing"]), open_positions: 25, average_salary: 14000, rating: 3.8, review_count: 80, hiring_trend: "growing", is_verified: true },
  { name: "Cooper Pharma", name_fr: "Cooper Pharma", industry: "Pharmaceutical", industry_fr: "Pharmaceutique", size: "large", employee_count: "1500-2500", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca"]), founded: 1933, description: "Historic Moroccan pharmaceutical company manufacturing and distributing a wide range of generic medications.", description_fr: "Entreprise pharmaceutique historique du Maroc.", culture: JSON.stringify({ values: ["Health access", "Innovation", "Quality"], perks: ["Good salary", "Benefits", "Stability"], work_life: "Good" }), fields: JSON.stringify(["Pharma", "Healthcare"]), open_positions: 15, average_salary: 13000, rating: 3.6, review_count: 55, hiring_trend: "stable", is_verified: true },
  { name: "Maphar (Sanofi)", name_fr: "Maphar (Sanofi)", industry: "Pharmaceutical", industry_fr: "Pharmaceutique", size: "large", employee_count: "1000-1500", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca"]), founded: 1951, description: "Sanofi's Moroccan manufacturing and distribution subsidiary, producing pharmaceutical products for the North African market.", description_fr: "Filiale de fabrication et distribution de Sanofi au Maroc.", culture: JSON.stringify({ values: ["French pharma culture", "Quality", "Safety"], perks: ["Sanofi benefits", "Training", "International exposure"], work_life: "Good" }), fields: JSON.stringify(["Pharma", "Healthcare"]), open_positions: 10, average_salary: 14500, rating: 3.9, review_count: 40, hiring_trend: "stable", is_verified: true },
  { name: "CHU Ibn Sina", name_fr: "CHU Ibn Sina", industry: "Healthcare", industry_fr: "Sante", size: "large", employee_count: "5000-8000", headquarters: "Rabat", locations: JSON.stringify(["Rabat"]), founded: 1954, description: "Morocco's premier university hospital center providing tertiary care, medical education, and clinical research.", description_fr: "Premier centre hospitalier universitaire du Maroc.", culture: JSON.stringify({ values: ["Patient care", "Medical excellence", "Education"], perks: ["Job security", "Medical training", "Public sector benefits"], work_life: "Demanding" }), fields: JSON.stringify(["Healthcare", "Research", "Education"]), open_positions: 40, average_salary: 12000, rating: 3.5, review_count: 100, hiring_trend: "growing", is_verified: true },

  // --- PUBLIC / TRANSPORT ---
  { name: "ONCF", name_fr: "ONCF", industry: "Transport/Rail", industry_fr: "Transport/Ferroviaire", size: "enterprise", employee_count: "8000-10000", headquarters: "Rabat", locations: JSON.stringify(["Rabat", "Casablanca", "Tanger", "Marrakech", "Fes"]), founded: 1963, description: "Morocco's national railway operator, managing Africa's first high-speed rail (Al Boraq) and nationwide freight/passenger services.", description_fr: "Operateur ferroviaire national du Maroc, gerant le TGV Al Boraq.", culture: JSON.stringify({ values: ["Public service", "Safety", "Modernization"], perks: ["Job security", "Housing", "Free travel", "Medical"], work_life: "Good" }), fields: JSON.stringify(["Transport", "Engineering", "Infrastructure"]), open_positions: 50, average_salary: 13000, rating: 3.7, review_count: 200, hiring_trend: "growing", is_verified: true },
  { name: "ADM (Autoroutes du Maroc)", name_fr: "ADM (Autoroutes du Maroc)", industry: "Infrastructure", industry_fr: "Infrastructures", size: "large", employee_count: "2000-3000", headquarters: "Rabat", locations: JSON.stringify(["Rabat", "All regions"]), founded: 1989, description: "Morocco's highway concession company managing the national motorway network (1,800+ km).", description_fr: "Societe concessionnaire des autoroutes du Maroc.", culture: JSON.stringify({ values: ["Safety", "Service", "Infrastructure development"], perks: ["Stability", "Benefits", "Highway access"], work_life: "Good" }), fields: JSON.stringify(["Infrastructure", "Engineering", "Transport"]), open_positions: 20, average_salary: 14000, rating: 3.7, review_count: 60, hiring_trend: "stable", is_verified: true },
  { name: "ANP (Agence Nationale des Ports)", name_fr: "ANP", industry: "Maritime/Ports", industry_fr: "Maritime/Ports", size: "large", employee_count: "1000-2000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Tanger", "Agadir", "Nador", "Jorf Lasfar"]), founded: 2006, description: "National ports agency regulating and managing Morocco's commercial ports and maritime infrastructure.", description_fr: "Agence nationale regulant et gerant les ports commerciaux du Maroc.", culture: JSON.stringify({ values: ["Maritime excellence", "Regulation", "Development"], perks: ["Good salary", "Benefits", "Stability"], work_life: "Good" }), fields: JSON.stringify(["Maritime", "Logistics", "Infrastructure"]), open_positions: 15, average_salary: 15000, rating: 3.8, review_count: 40, hiring_trend: "stable", is_verified: true },
  { name: "Tanger Med", name_fr: "Tanger Med", industry: "Port/Logistics", industry_fr: "Port/Logistique", size: "large", employee_count: "5000-8000", headquarters: "Tanger", locations: JSON.stringify(["Tanger"]), founded: 2004, description: "Africa's largest port by container capacity, a strategic logistics hub connecting Morocco to 180+ ports worldwide.", description_fr: "Plus grand port d'Afrique par capacite conteneurs, hub logistique strategique.", culture: JSON.stringify({ values: ["World-class operations", "Innovation", "Growth"], perks: ["Dynamic environment", "Training", "Good salary"], work_life: "Moderate" }), fields: JSON.stringify(["Logistics", "Maritime", "Infrastructure"]), open_positions: 45, average_salary: 14000, rating: 4.0, review_count: 150, hiring_trend: "growing", is_verified: true },
  { name: "Royal Air Maroc", name_fr: "Royal Air Maroc", industry: "Aviation", industry_fr: "Aviation", size: "enterprise", employee_count: "4000-6000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Rabat", "International"]), founded: 1957, description: "Morocco's national airline and oneworld alliance member, connecting Morocco to 100+ destinations globally.", description_fr: "Compagnie aerienne nationale du Maroc, membre oneworld.", culture: JSON.stringify({ values: ["Hospitality", "Safety", "National pride"], perks: ["Flight benefits", "Medical", "Retirement", "Housing loan"], work_life: "Variable" }), fields: JSON.stringify(["Aviation", "Tourism", "Logistics"]), open_positions: 30, average_salary: 14500, rating: 3.5, review_count: 300, hiring_trend: "growing", is_verified: true },

  // --- TELECOM ---
  { name: "Maroc Telecom", name_fr: "Maroc Telecom", industry: "Telecommunications", industry_fr: "Telecommunications", size: "enterprise", employee_count: "7000-10000", headquarters: "Rabat", locations: JSON.stringify(["Rabat", "Casablanca", "All regions"]), founded: 1998, description: "Morocco's largest telecom operator (Etisalat group), providing fixed, mobile, and internet services with pan-African operations.", description_fr: "Premier operateur telecom du Maroc (groupe Etisalat).", culture: JSON.stringify({ values: ["Connectivity", "Innovation", "Customer service"], perks: ["Good salary", "Phone benefits", "Health", "Retirement"], work_life: "Good" }), fields: JSON.stringify(["Telecom", "IT", "Digital"]), open_positions: 40, average_salary: 15000, rating: 3.8, review_count: 350, hiring_trend: "stable", is_verified: true },
  { name: "Orange Morocco", name_fr: "Orange Maroc", industry: "Telecommunications", industry_fr: "Telecommunications", size: "large", employee_count: "2000-3000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Rabat"]), founded: 1999, description: "Morocco's second-largest mobile operator (Orange group), known for competitive pricing and digital services.", description_fr: "Deuxieme operateur mobile du Maroc (groupe Orange).", culture: JSON.stringify({ values: ["French company culture", "Innovation", "Connectivity"], perks: ["Orange group benefits", "Training", "International mobility"], work_life: "Good" }), fields: JSON.stringify(["Telecom", "Digital"]), open_positions: 25, average_salary: 14000, rating: 3.7, review_count: 120, hiring_trend: "stable", is_verified: true },

  // --- CONSULTING ---
  { name: "Deloitte Morocco", name_fr: "Deloitte Maroc", industry: "Consulting/Audit", industry_fr: "Conseil/Audit", size: "large", employee_count: "500-1000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca"]), founded: 1990, description: "Big Four firm's Moroccan practice providing audit, tax, consulting, and financial advisory services.", description_fr: "Cabinet Big Four offrant audit, fiscalite, conseil et advisory.", culture: JSON.stringify({ values: ["Excellence", "Leadership", "Integrity"], perks: ["Brand name", "Training", "International exposure", "Fast career growth"], work_life: "Demanding" }), fields: JSON.stringify(["Consulting", "Audit", "Finance"]), open_positions: 40, average_salary: 16000, rating: 3.8, review_count: 150, hiring_trend: "growing", is_verified: true },
  { name: "PwC Morocco", name_fr: "PwC Maroc", industry: "Consulting/Audit", industry_fr: "Conseil/Audit", size: "medium", employee_count: "300-600", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca"]), founded: 1985, description: "Big Four firm in Morocco providing assurance, tax, and advisory services to local and multinational clients.", description_fr: "Cabinet Big Four au Maroc offrant assurance, fiscalite et conseil.", culture: JSON.stringify({ values: ["Trust", "Transparency", "Reimagining the possible"], perks: ["International brand", "Training", "CPA/CFA support"], work_life: "Demanding" }), fields: JSON.stringify(["Consulting", "Audit", "Finance"]), open_positions: 30, average_salary: 15500, rating: 3.7, review_count: 90, hiring_trend: "growing", is_verified: true },
  { name: "EY Morocco", name_fr: "EY Maroc", industry: "Consulting/Audit", industry_fr: "Conseil/Audit", size: "medium", employee_count: "300-600", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca"]), founded: 1992, description: "Big Four firm providing audit, advisory, tax, and transaction services with a strong Moroccan practice.", description_fr: "Cabinet Big Four offrant audit, conseil, fiscalite et transactions.", culture: JSON.stringify({ values: ["Building a better working world", "Teamwork", "Integrity"], perks: ["Brand value", "Training abroad", "Networking"], work_life: "Demanding" }), fields: JSON.stringify(["Consulting", "Audit", "Finance"]), open_positions: 25, average_salary: 15000, rating: 3.6, review_count: 80, hiring_trend: "growing", is_verified: true },

  // --- RETAIL / DISTRIBUTION ---
  { name: "Marjane Holding", name_fr: "Marjane Holding", industry: "Retail", industry_fr: "Distribution", size: "enterprise", employee_count: "10000-15000", headquarters: "Casablanca", locations: JSON.stringify(["All major cities"]), founded: 1990, description: "Morocco's largest retail group operating Marjane hypermarkets, Acima supermarkets, and Electroplanet stores.", description_fr: "Plus grand groupe de distribution au Maroc.", culture: JSON.stringify({ values: ["Proximity", "Value", "Moroccan identity"], perks: ["Employee discounts", "Health", "Stability"], work_life: "Variable" }), fields: JSON.stringify(["Retail", "Logistics", "E-commerce"]), open_positions: 100, average_salary: 8000, rating: 3.3, review_count: 400, hiring_trend: "stable", is_verified: true },

  // --- AGRIBUSINESS ---
  { name: "Cosumar", name_fr: "Cosumar", industry: "Agri-Food", industry_fr: "Agro-alimentaire", size: "large", employee_count: "3000-5000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Beni Mellal", "Larache", "Berkane"]), founded: 1929, description: "Morocco's sole sugar producer and refiner, processing sugar beets and imported raw sugar for the national market.", description_fr: "Unique producteur et raffineur de sucre au Maroc.", culture: JSON.stringify({ values: ["Sustainability", "Moroccan heritage", "Quality"], perks: ["Stable employment", "Benefits", "Sugar products"], work_life: "Good" }), fields: JSON.stringify(["Agri-food", "Manufacturing", "Agriculture"]), open_positions: 20, average_salary: 12000, rating: 3.6, review_count: 70, hiring_trend: "stable", is_verified: true },
  { name: "Centrale Danone", name_fr: "Centrale Danone", industry: "Dairy/Food", industry_fr: "Produits Laitiers", size: "large", employee_count: "3000-5000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Sale", "Meknes", "Fqih Ben Salah"]), founded: 1940, description: "Danone's Moroccan subsidiary and leading dairy company, producing Centrale, Danone, and Activia branded products.", description_fr: "Filiale marocaine de Danone et leader des produits laitiers.", culture: JSON.stringify({ values: ["Health through food", "Sustainability", "Local sourcing"], perks: ["Danone benefits", "Training", "Product discounts"], work_life: "Good" }), fields: JSON.stringify(["Food", "Manufacturing", "Agriculture"]), open_positions: 25, average_salary: 12500, rating: 3.5, review_count: 100, hiring_trend: "stable", is_verified: true },

  // --- STARTUPS / TECH ---
  { name: "Chari", name_fr: "Chari", industry: "E-commerce/Fintech", industry_fr: "E-commerce/Fintech", size: "small", employee_count: "100-300", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca"]), founded: 2020, description: "Moroccan B2B e-commerce and fintech startup digitizing the traditional retail supply chain for neighborhood shops.", description_fr: "Startup marocaine B2B e-commerce et fintech pour les epiceries de quartier.", culture: JSON.stringify({ values: ["Disruption", "Speed", "Impact"], perks: ["Startup culture", "Equity options", "Fast growth"], work_life: "Demanding" }), fields: JSON.stringify(["E-commerce", "Fintech", "Logistics"]), open_positions: 15, average_salary: 14000, rating: 3.8, review_count: 20, hiring_trend: "growing", is_verified: true },
  { name: "DabaDoc", name_fr: "DabaDoc", industry: "HealthTech", industry_fr: "Sante Digitale", size: "small", employee_count: "50-100", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca"]), founded: 2014, description: "Morocco's leading healthtech platform for doctor appointment booking and telemedicine, expanding across Africa.", description_fr: "Plateforme leader de prise de rendez-vous medicaux et de telemedecine.", culture: JSON.stringify({ values: ["Health access", "Tech for good", "Pan-African vision"], perks: ["Mission-driven", "Startup culture", "Health tech impact"], work_life: "Moderate" }), fields: JSON.stringify(["HealthTech", "IT"]), open_positions: 8, average_salary: 14000, rating: 3.9, review_count: 15, hiring_trend: "growing", is_verified: true },
  { name: "Avito.ma", name_fr: "Avito.ma", industry: "Marketplace", industry_fr: "Place de marche", size: "medium", employee_count: "200-400", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca"]), founded: 2012, description: "Morocco's leading classified ads marketplace (OLX/Adevinta group), connecting buyers and sellers across all categories.", description_fr: "Premiere place de marche de petites annonces au Maroc.", culture: JSON.stringify({ values: ["User focus", "Data-driven", "Innovation"], perks: ["Competitive salary", "Equity", "Modern office", "Flexibility"], work_life: "Good" }), fields: JSON.stringify(["E-commerce", "IT", "Marketplace"]), open_positions: 12, average_salary: 16000, rating: 4.0, review_count: 50, hiring_trend: "growing", is_verified: true },

  // --- ADDITIONAL TECH ---
  { name: "Sopra Banking Software Morocco", name_fr: "Sopra Banking Software Maroc", industry: "Banking Software", industry_fr: "Logiciel Bancaire", size: "medium", employee_count: "500-800", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca"]), founded: 2012, description: "Sopra Steria subsidiary developing core banking software solutions for financial institutions in Africa and Europe.", description_fr: "Filiale Sopra Steria developpant des solutions bancaires.", culture: JSON.stringify({ values: ["Innovation", "Banking expertise", "Quality"], perks: ["Sopra benefits", "Training", "International projects"], work_life: "Moderate" }), fields: JSON.stringify(["IT", "Banking", "Software"]), open_positions: 35, average_salary: 15000, rating: 3.6, review_count: 70, hiring_trend: "growing", is_verified: true },
  { name: "Logisticienne/Managem Group", name_fr: "Groupe Managem", industry: "Mining", industry_fr: "Mines", size: "large", employee_count: "5000-8000", headquarters: "Casablanca", locations: JSON.stringify(["Casablanca", "Guelmim", "Marrakech", "Oriental", "Sub-Saharan Africa"]), founded: 1928, description: "Morocco's leading diversified mining group producing cobalt, zinc, copper, gold, and silver across Morocco and Africa.", description_fr: "Premier groupe minier diversifie du Maroc.", culture: JSON.stringify({ values: ["Sustainability", "Mining excellence", "African expansion"], perks: ["Good salary", "Remote site allowances", "Health", "Housing"], work_life: "Moderate" }), fields: JSON.stringify(["Mining", "Engineering", "Geology"]), open_positions: 35, average_salary: 15000, rating: 3.7, review_count: 90, hiring_trend: "growing", is_verified: true },
];

// ---------------------------------------------------------------------------
// UPSERT FUNCTIONS
// ---------------------------------------------------------------------------

async function seedSalaryData() {
  let inserted = 0;
  let skipped = 0;
  for (const row of salaryData) {
    try {
      const res = await client.query(
        `INSERT INTO market_salary_data (role, role_fr, field, region, experience_level, salary_min, salary_median, salary_max, sample_size, growth_rate, demand_score, source, last_updated)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, NOW())
         ON CONFLICT (role, region, experience_level) DO NOTHING`,
        [row.role, row.role_fr, row.field, row.region, row.experience_level, row.salary_min, row.salary_median, row.salary_max, row.sample_size, row.growth_rate, row.demand_score, row.source]
      );
      if (res.rowCount > 0) inserted++;
      else skipped++;
    } catch (e) {
      console.error(`  ERROR on salary row "${row.role}" (${row.region}/${row.experience_level}):`, e.message);
      skipped++;
    }
  }
  console.log(`  market_salary_data: ${inserted} inserted, ${skipped} skipped (already existed or error)`);
}

async function seedSkillDemand() {
  let inserted = 0;
  let skipped = 0;
  for (const row of skillDemandData) {
    try {
      const res = await client.query(
        `INSERT INTO skill_demand (skill, skill_fr, field, category, demand_score, growth_trend, growth_percent, job_count, average_salary_boost, competition_level, time_to_learn, resources, related_skills, last_updated)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, NOW())
         ON CONFLICT (skill, field) DO NOTHING`,
        [row.skill, row.skill_fr, row.field, row.category, row.demand_score, row.growth_trend, row.growth_percent, row.job_count, row.average_salary_boost, row.competition_level, row.time_to_learn, row.resources, row.related_skills]
      );
      if (res.rowCount > 0) inserted++;
      else skipped++;
    } catch (e) {
      console.error(`  ERROR on skill "${row.skill}" (${row.field}):`, e.message);
      skipped++;
    }
  }
  console.log(`  skill_demand: ${inserted} inserted, ${skipped} skipped`);
}

async function seedRegionalData() {
  let inserted = 0;
  let skipped = 0;
  for (const row of regionalData) {
    try {
      const res = await client.query(
        `INSERT INTO regional_job_stats (region, region_fr, total_jobs, job_growth, average_salary, top_industries, top_employers, skills_in_demand, unemployment_rate, cost_of_living, quality_of_life, last_updated)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, NOW())
         ON CONFLICT (region) DO NOTHING`,
        [row.region, row.region_fr, row.total_jobs, row.job_growth, row.average_salary, row.top_industries, row.top_employers, row.skills_in_demand, row.unemployment_rate, row.cost_of_living, row.quality_of_life]
      );
      if (res.rowCount > 0) inserted++;
      else skipped++;
    } catch (e) {
      console.error(`  ERROR on region "${row.region}":`, e.message);
      skipped++;
    }
  }
  console.log(`  regional_job_stats: ${inserted} inserted, ${skipped} skipped`);
}

async function seedEmployerData() {
  let inserted = 0;
  let skipped = 0;
  for (const row of employerData) {
    try {
      const res = await client.query(
        `INSERT INTO employer_database (name, name_fr, industry, industry_fr, size, employee_count, headquarters, locations, founded, description, description_fr, culture, fields, open_positions, average_salary, rating, review_count, hiring_trend, is_verified, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         ON CONFLICT (name) DO NOTHING`,
        [row.name, row.name_fr, row.industry, row.industry_fr, row.size, row.employee_count, row.headquarters, row.locations, row.founded, row.description, row.description_fr, row.culture, row.fields, row.open_positions, row.average_salary, row.rating, row.review_count, row.hiring_trend, row.is_verified, true]
      );
      if (res.rowCount > 0) inserted++;
      else skipped++;
    } catch (e) {
      console.error(`  ERROR on employer "${row.name}":`, e.message);
      skipped++;
    }
  }
  console.log(`  employer_database: ${inserted} inserted, ${skipped} skipped`);
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
async function main() {
  console.log("=== Moroccan Job Market Intelligence Seeder ===\n");
  console.log(`Data prepared:`);
  console.log(`  market_salary_data:  ${salaryData.length} entries`);
  console.log(`  skill_demand:        ${skillDemandData.length} entries`);
  console.log(`  regional_job_stats:  ${regionalData.length} entries`);
  console.log(`  employer_database:   ${employerData.length} entries`);
  console.log(`  TOTAL:               ${salaryData.length + skillDemandData.length + regionalData.length + employerData.length} entries\n`);

  await client.connect();
  console.log("Connected to PostgreSQL (localhost:5432/postgres)\n");

  // Get current counts
  const before = {};
  for (const t of ["market_salary_data", "skill_demand", "regional_job_stats", "employer_database"]) {
    const res = await client.query(`SELECT COUNT(*) as cnt FROM ${t}`);
    before[t] = parseInt(res.rows[0].cnt);
  }
  console.log("Current row counts:");
  for (const [t, c] of Object.entries(before)) {
    console.log(`  ${t}: ${c}`);
  }
  console.log("\nSeeding...\n");

  await seedSalaryData();
  await seedSkillDemand();
  await seedRegionalData();
  await seedEmployerData();

  // Get final counts
  console.log("\n--- FINAL ROW COUNTS ---");
  for (const t of ["market_salary_data", "skill_demand", "regional_job_stats", "employer_database"]) {
    const res = await client.query(`SELECT COUNT(*) as cnt FROM ${t}`);
    const after = parseInt(res.rows[0].cnt);
    console.log(`  ${t}: ${before[t]} -> ${after} (+${after - before[t]})`);
  }

  await client.end();
  console.log("\nDone! Moroccan job market intelligence data seeded successfully.");
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
