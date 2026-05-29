// seed-salary-skills-extra.mjs
// Adds 80+ market_salary_data, 80+ skill_demand, 30+ success_story entries
// Uses ON CONFLICT (id) DO NOTHING to avoid duplicates
// Database: postgresql://postgres:postgres@localhost:5432/postgres

import pg from "pg";
import crypto from "crypto";

const { Client } = pg;

const client = new Client("postgresql://postgres:postgres@localhost:5432/postgres");

// ============================================================================
// MARKET SALARY DATA (80+ entries)
// Salary values are ANNUAL in MAD
// Junior: 48000-96000 (4000-8000/mo)
// Mid: 96000-180000 (8000-15000/mo)
// Senior: 180000-360000 (15000-30000/mo)
// Manager/Director: 300000-600000+ (25000-50000+/mo)
// ============================================================================

const marketSalaryData = [
  // === IT / Technology ===
  // Frontend Developer
  { role: "Frontend Developer", role_fr: "Developpeur Frontend", field: "IT", region: "Casablanca-Settat", experience_level: "0-2 years", salary_min: 54000, salary_median: 72000, salary_max: 96000, demand_score: 88, growth_rate: 12.5, source: "ReKrute 2025" },
  { role: "Frontend Developer", role_fr: "Developpeur Frontend", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 96000, salary_median: 132000, salary_max: 168000, demand_score: 90, growth_rate: 14.0, source: "ReKrute 2025" },
  { role: "Frontend Developer", role_fr: "Developpeur Frontend", field: "IT", region: "Rabat-Sale-Kenitra", experience_level: "2-5 years", salary_min: 84000, salary_median: 120000, salary_max: 156000, demand_score: 85, growth_rate: 11.0, source: "Emploi.ma 2025" },
  // Backend Developer
  { role: "Backend Developer", role_fr: "Developpeur Backend", field: "IT", region: "Casablanca-Settat", experience_level: "0-2 years", salary_min: 60000, salary_median: 78000, salary_max: 102000, demand_score: 85, growth_rate: 10.0, source: "ReKrute 2025" },
  { role: "Backend Developer", role_fr: "Developpeur Backend", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 108000, salary_median: 144000, salary_max: 192000, demand_score: 88, growth_rate: 13.0, source: "ReKrute 2025" },
  { role: "Backend Developer", role_fr: "Developpeur Backend", field: "IT", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 192000, salary_median: 252000, salary_max: 336000, demand_score: 82, growth_rate: 8.0, source: "LinkedIn Salary 2025" },
  // System Administrator
  { role: "System Administrator", role_fr: "Administrateur Systeme", field: "IT", region: "Casablanca-Settat", experience_level: "0-2 years", salary_min: 48000, salary_median: 66000, salary_max: 84000, demand_score: 72, growth_rate: 5.0, source: "Emploi.ma 2025" },
  { role: "System Administrator", role_fr: "Administrateur Systeme", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 84000, salary_median: 114000, salary_max: 156000, demand_score: 75, growth_rate: 6.0, source: "Emploi.ma 2025" },
  { role: "System Administrator", role_fr: "Administrateur Systeme", field: "IT", region: "Rabat-Sale-Kenitra", experience_level: "5-10 years", salary_min: 156000, salary_median: 204000, salary_max: 264000, demand_score: 70, growth_rate: 4.0, source: "Glassdoor 2025" },
  // Database Administrator
  { role: "Database Administrator", role_fr: "Administrateur Base de Donnees", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 96000, salary_median: 132000, salary_max: 168000, demand_score: 78, growth_rate: 7.0, source: "ReKrute 2025" },
  { role: "Database Administrator", role_fr: "Administrateur Base de Donnees", field: "IT", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 168000, salary_median: 228000, salary_max: 300000, demand_score: 75, growth_rate: 5.5, source: "LinkedIn Salary 2025" },
  // IT Project Manager
  { role: "IT Project Manager", role_fr: "Chef de Projet IT", field: "IT", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 216000, salary_median: 300000, salary_max: 420000, demand_score: 80, growth_rate: 9.0, source: "Michael Page 2025" },
  { role: "IT Project Manager", role_fr: "Chef de Projet IT", field: "IT", region: "Rabat-Sale-Kenitra", experience_level: "5-10 years", salary_min: 192000, salary_median: 264000, salary_max: 372000, demand_score: 78, growth_rate: 8.5, source: "Michael Page 2025" },
  // IT Director
  { role: "IT Director", role_fr: "Directeur IT", field: "IT", region: "Casablanca-Settat", experience_level: "10+", salary_min: 360000, salary_median: 480000, salary_max: 720000, demand_score: 65, growth_rate: 6.0, source: "Hays Morocco 2025" },
  // Business Intelligence Analyst
  { role: "BI Analyst", role_fr: "Analyste BI", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 96000, salary_median: 132000, salary_max: 180000, demand_score: 82, growth_rate: 15.0, source: "ReKrute 2025" },
  { role: "BI Analyst", role_fr: "Analyste BI", field: "IT", region: "Rabat-Sale-Kenitra", experience_level: "0-2 years", salary_min: 60000, salary_median: 78000, salary_max: 96000, demand_score: 80, growth_rate: 14.0, source: "Emploi.ma 2025" },
  // ERP Consultant
  { role: "ERP Consultant", role_fr: "Consultant ERP/SAP", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 120000, salary_median: 168000, salary_max: 228000, demand_score: 85, growth_rate: 10.0, source: "Hays Morocco 2025" },
  { role: "ERP Consultant", role_fr: "Consultant ERP/SAP", field: "IT", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 228000, salary_median: 312000, salary_max: 420000, demand_score: 82, growth_rate: 8.0, source: "Hays Morocco 2025" },
  // Network Engineer
  { role: "Network Engineer", role_fr: "Ingenieur Reseaux", field: "IT", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 96000, salary_median: 126000, salary_max: 168000, demand_score: 76, growth_rate: 6.0, source: "Emploi.ma 2025" },
  { role: "Network Engineer", role_fr: "Ingenieur Reseaux", field: "IT", region: "Tanger-Tetouan-Al Hoceima", experience_level: "2-5 years", salary_min: 84000, salary_median: 108000, salary_max: 144000, demand_score: 72, growth_rate: 5.5, source: "Emploi.ma 2025" },

  // === Engineering ===
  // Civil Engineer
  { role: "Civil Engineer", role_fr: "Ingenieur Genie Civil", field: "Engineering", region: "Casablanca-Settat", experience_level: "0-2 years", salary_min: 60000, salary_median: 78000, salary_max: 102000, demand_score: 80, growth_rate: 7.0, source: "Emploi.ma 2025" },
  { role: "Civil Engineer", role_fr: "Ingenieur Genie Civil", field: "Engineering", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 108000, salary_median: 144000, salary_max: 192000, demand_score: 82, growth_rate: 8.0, source: "ReKrute 2025" },
  { role: "Civil Engineer", role_fr: "Ingenieur Genie Civil", field: "Engineering", region: "Tanger-Tetouan-Al Hoceima", experience_level: "2-5 years", salary_min: 96000, salary_median: 132000, salary_max: 168000, demand_score: 85, growth_rate: 10.0, source: "Emploi.ma 2025" },
  { role: "Civil Engineer", role_fr: "Ingenieur Genie Civil", field: "Engineering", region: "Marrakech-Safi", experience_level: "5-10 years", salary_min: 168000, salary_median: 228000, salary_max: 312000, demand_score: 78, growth_rate: 6.0, source: "Emploi.ma 2025" },
  // Mechanical Engineer
  { role: "Mechanical Engineer", role_fr: "Ingenieur Mecanique", field: "Engineering", region: "Tanger-Tetouan-Al Hoceima", experience_level: "0-2 years", salary_min: 60000, salary_median: 78000, salary_max: 96000, demand_score: 85, growth_rate: 9.0, source: "Renault Tanger careers" },
  { role: "Mechanical Engineer", role_fr: "Ingenieur Mecanique", field: "Engineering", region: "Tanger-Tetouan-Al Hoceima", experience_level: "2-5 years", salary_min: 108000, salary_median: 150000, salary_max: 204000, demand_score: 88, growth_rate: 11.0, source: "Renault Tanger careers" },
  { role: "Mechanical Engineer", role_fr: "Ingenieur Mecanique", field: "Engineering", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 180000, salary_median: 252000, salary_max: 336000, demand_score: 80, growth_rate: 7.0, source: "Michael Page 2025" },
  // Electrical Engineer
  { role: "Electrical Engineer", role_fr: "Ingenieur Electrique", field: "Engineering", region: "Casablanca-Settat", experience_level: "0-2 years", salary_min: 60000, salary_median: 78000, salary_max: 96000, demand_score: 82, growth_rate: 8.0, source: "Emploi.ma 2025" },
  { role: "Electrical Engineer", role_fr: "Ingenieur Electrique", field: "Engineering", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 108000, salary_median: 144000, salary_max: 192000, demand_score: 84, growth_rate: 9.5, source: "Lydec careers" },
  { role: "Electrical Engineer", role_fr: "Ingenieur Electrique", field: "Engineering", region: "Rabat-Sale-Kenitra", experience_level: "5-10 years", salary_min: 180000, salary_median: 240000, salary_max: 324000, demand_score: 78, growth_rate: 7.0, source: "ONEE careers" },
  // Production Manager
  { role: "Production Manager", role_fr: "Responsable Production", field: "Engineering", region: "Tanger-Tetouan-Al Hoceima", experience_level: "5-10 years", salary_min: 216000, salary_median: 300000, salary_max: 420000, demand_score: 80, growth_rate: 8.0, source: "Renault Tanger" },
  { role: "Production Manager", role_fr: "Responsable Production", field: "Engineering", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 228000, salary_median: 312000, salary_max: 432000, demand_score: 78, growth_rate: 7.5, source: "Michael Page 2025" },

  // === Finance / Banking ===
  // Bank Teller / Charge de Clientele
  { role: "Bank Relationship Manager", role_fr: "Charge de Clientele Bancaire", field: "Finance", region: "Casablanca-Settat", experience_level: "0-2 years", salary_min: 48000, salary_median: 66000, salary_max: 84000, demand_score: 75, growth_rate: 4.0, source: "Attijariwafa Bank careers" },
  { role: "Bank Relationship Manager", role_fr: "Charge de Clientele Bancaire", field: "Finance", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 84000, salary_median: 114000, salary_max: 156000, demand_score: 78, growth_rate: 5.0, source: "Attijariwafa Bank careers" },
  { role: "Bank Relationship Manager", role_fr: "Charge de Clientele Bancaire", field: "Finance", region: "Fes-Meknes", experience_level: "2-5 years", salary_min: 72000, salary_median: 96000, salary_max: 132000, demand_score: 72, growth_rate: 4.0, source: "BMCE Bank careers" },
  // Credit Analyst
  { role: "Credit Analyst", role_fr: "Analyste Credit", field: "Finance", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 108000, salary_median: 144000, salary_max: 192000, demand_score: 80, growth_rate: 7.0, source: "CIH Bank careers" },
  { role: "Credit Analyst", role_fr: "Analyste Credit", field: "Finance", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 180000, salary_median: 240000, salary_max: 324000, demand_score: 76, growth_rate: 6.0, source: "BMCE Bank careers" },
  // Insurance Actuary
  { role: "Insurance Actuary", role_fr: "Actuaire Assurance", field: "Finance", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 132000, salary_median: 180000, salary_max: 252000, demand_score: 70, growth_rate: 8.0, source: "Wafa Assurance careers" },
  { role: "Insurance Actuary", role_fr: "Actuaire Assurance", field: "Finance", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 252000, salary_median: 360000, salary_max: 504000, demand_score: 68, growth_rate: 7.5, source: "Wafa Assurance careers" },
  // Finance Director
  { role: "Finance Director", role_fr: "Directeur Financier", field: "Finance", region: "Casablanca-Settat", experience_level: "10+", salary_min: 360000, salary_median: 504000, salary_max: 720000, demand_score: 60, growth_rate: 5.0, source: "Hays Morocco 2025" },
  // Treasury Manager
  { role: "Treasury Manager", role_fr: "Responsable Tresorerie", field: "Finance", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 192000, salary_median: 264000, salary_max: 372000, demand_score: 72, growth_rate: 6.0, source: "ReKrute 2025" },

  // === Healthcare (additional) ===
  { role: "Hospital Administrator", role_fr: "Administrateur Hospitalier", field: "Healthcare", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 180000, salary_median: 252000, salary_max: 360000, demand_score: 70, growth_rate: 6.0, source: "CHU Casablanca" },
  { role: "Clinical Pharmacist", role_fr: "Pharmacien Clinicien", field: "Healthcare", region: "Rabat-Sale-Kenitra", experience_level: "2-5 years", salary_min: 120000, salary_median: 156000, salary_max: 204000, demand_score: 82, growth_rate: 9.0, source: "CHU Ibn Sina" },
  { role: "Physical Therapist", role_fr: "Kinesitherapeute", field: "Healthcare", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 96000, salary_median: 132000, salary_max: 180000, demand_score: 85, growth_rate: 10.0, source: "Emploi.ma 2025" },
  { role: "Physical Therapist", role_fr: "Kinesitherapeute", field: "Healthcare", region: "Marrakech-Safi", experience_level: "0-2 years", salary_min: 60000, salary_median: 78000, salary_max: 96000, demand_score: 80, growth_rate: 9.0, source: "Emploi.ma 2025" },
  { role: "Radiologist", role_fr: "Radiologue", field: "Healthcare", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 300000, salary_median: 420000, salary_max: 600000, demand_score: 75, growth_rate: 7.0, source: "Clinique Privee 2025" },

  // === Logistics / Supply Chain ===
  { role: "Logistics Coordinator", role_fr: "Coordinateur Logistique", field: "Logistics", region: "Tanger-Tetouan-Al Hoceima", experience_level: "0-2 years", salary_min: 48000, salary_median: 66000, salary_max: 84000, demand_score: 82, growth_rate: 12.0, source: "Tanger Med 2025" },
  { role: "Logistics Coordinator", role_fr: "Coordinateur Logistique", field: "Logistics", region: "Tanger-Tetouan-Al Hoceima", experience_level: "2-5 years", salary_min: 84000, salary_median: 120000, salary_max: 156000, demand_score: 85, growth_rate: 13.0, source: "Tanger Med 2025" },
  { role: "Supply Chain Manager", role_fr: "Responsable Supply Chain", field: "Logistics", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 192000, salary_median: 264000, salary_max: 372000, demand_score: 80, growth_rate: 10.0, source: "Marjane careers" },
  { role: "Supply Chain Manager", role_fr: "Responsable Supply Chain", field: "Logistics", region: "Tanger-Tetouan-Al Hoceima", experience_level: "5-10 years", salary_min: 180000, salary_median: 252000, salary_max: 348000, demand_score: 82, growth_rate: 11.0, source: "Tanger Med 2025" },
  { role: "Warehouse Manager", role_fr: "Responsable Entrepot", field: "Logistics", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 84000, salary_median: 114000, salary_max: 156000, demand_score: 78, growth_rate: 8.0, source: "Emploi.ma 2025" },
  { role: "Customs Officer", role_fr: "Declarant en Douane", field: "Logistics", region: "Tanger-Tetouan-Al Hoceima", experience_level: "2-5 years", salary_min: 96000, salary_median: 126000, salary_max: 168000, demand_score: 80, growth_rate: 9.0, source: "Tanger Med 2025" },
  { role: "Freight Forwarder", role_fr: "Transitaire", field: "Logistics", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 72000, salary_median: 102000, salary_max: 144000, demand_score: 76, growth_rate: 7.0, source: "Emploi.ma 2025" },

  // === Marketing / Digital ===
  { role: "Community Manager", role_fr: "Community Manager", field: "Marketing", region: "Casablanca-Settat", experience_level: "0-2 years", salary_min: 42000, salary_median: 60000, salary_max: 78000, demand_score: 80, growth_rate: 15.0, source: "ReKrute 2025" },
  { role: "Community Manager", role_fr: "Community Manager", field: "Marketing", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 72000, salary_median: 102000, salary_max: 144000, demand_score: 82, growth_rate: 14.0, source: "ReKrute 2025" },
  { role: "Marketing Director", role_fr: "Directeur Marketing", field: "Marketing", region: "Casablanca-Settat", experience_level: "10+", salary_min: 300000, salary_median: 420000, salary_max: 600000, demand_score: 65, growth_rate: 5.0, source: "Michael Page 2025" },
  { role: "Content Manager", role_fr: "Responsable Contenu", field: "Marketing", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 72000, salary_median: 102000, salary_max: 144000, demand_score: 78, growth_rate: 12.0, source: "Emploi.ma 2025" },
  { role: "E-commerce Manager", role_fr: "Responsable E-commerce", field: "Marketing", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 96000, salary_median: 138000, salary_max: 192000, demand_score: 85, growth_rate: 18.0, source: "Jumia Morocco careers" },

  // === Human Resources ===
  { role: "HR Officer", role_fr: "Charge de Ressources Humaines", field: "HR", region: "Casablanca-Settat", experience_level: "0-2 years", salary_min: 48000, salary_median: 66000, salary_max: 84000, demand_score: 75, growth_rate: 5.0, source: "Emploi.ma 2025" },
  { role: "HR Officer", role_fr: "Charge de Ressources Humaines", field: "HR", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 84000, salary_median: 114000, salary_max: 156000, demand_score: 78, growth_rate: 6.0, source: "ReKrute 2025" },
  { role: "HR Director", role_fr: "Directeur des Ressources Humaines", field: "HR", region: "Casablanca-Settat", experience_level: "10+", salary_min: 300000, salary_median: 420000, salary_max: 600000, demand_score: 62, growth_rate: 4.0, source: "Hays Morocco 2025" },
  { role: "Payroll Specialist", role_fr: "Specialiste Paie", field: "HR", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 72000, salary_median: 96000, salary_max: 132000, demand_score: 74, growth_rate: 5.0, source: "Emploi.ma 2025" },
  { role: "Training Manager", role_fr: "Responsable Formation", field: "HR", region: "Rabat-Sale-Kenitra", experience_level: "5-10 years", salary_min: 156000, salary_median: 216000, salary_max: 300000, demand_score: 70, growth_rate: 7.0, source: "ReKrute 2025" },
  { role: "Talent Acquisition Specialist", role_fr: "Specialiste Acquisition de Talents", field: "HR", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 84000, salary_median: 120000, salary_max: 168000, demand_score: 80, growth_rate: 10.0, source: "ManpowerGroup Morocco" },

  // === Management / General ===
  { role: "General Manager", role_fr: "Directeur General", field: "Management", region: "Casablanca-Settat", experience_level: "10+", salary_min: 420000, salary_median: 600000, salary_max: 900000, demand_score: 55, growth_rate: 3.0, source: "Hays Morocco 2025" },
  { role: "Operations Manager", role_fr: "Responsable Operations", field: "Management", region: "Casablanca-Settat", experience_level: "5-10 years", salary_min: 192000, salary_median: 264000, salary_max: 372000, demand_score: 76, growth_rate: 7.0, source: "Michael Page 2025" },
  { role: "Operations Manager", role_fr: "Responsable Operations", field: "Management", region: "Tanger-Tetouan-Al Hoceima", experience_level: "5-10 years", salary_min: 180000, salary_median: 240000, salary_max: 336000, demand_score: 80, growth_rate: 9.0, source: "Renault Tanger" },
  { role: "Business Development Manager", role_fr: "Responsable Developpement Commercial", field: "Management", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 108000, salary_median: 156000, salary_max: 228000, demand_score: 82, growth_rate: 11.0, source: "ReKrute 2025" },
  { role: "Business Development Manager", role_fr: "Responsable Developpement Commercial", field: "Management", region: "Rabat-Sale-Kenitra", experience_level: "5-10 years", salary_min: 180000, salary_median: 264000, salary_max: 372000, demand_score: 78, growth_rate: 9.0, source: "ReKrute 2025" },

  // === Automotive Industry (Tanger) ===
  { role: "Automotive Quality Engineer", role_fr: "Ingenieur Qualite Automobile", field: "Automotive", region: "Tanger-Tetouan-Al Hoceima", experience_level: "0-2 years", salary_min: 60000, salary_median: 78000, salary_max: 102000, demand_score: 88, growth_rate: 14.0, source: "Renault Tanger careers" },
  { role: "Automotive Quality Engineer", role_fr: "Ingenieur Qualite Automobile", field: "Automotive", region: "Tanger-Tetouan-Al Hoceima", experience_level: "2-5 years", salary_min: 108000, salary_median: 156000, salary_max: 216000, demand_score: 90, growth_rate: 15.0, source: "Renault Tanger careers" },
  { role: "Automotive Line Technician", role_fr: "Technicien Ligne Automobile", field: "Automotive", region: "Tanger-Tetouan-Al Hoceima", experience_level: "0-2 years", salary_min: 48000, salary_median: 60000, salary_max: 78000, demand_score: 85, growth_rate: 12.0, source: "PSA Kenitra" },
  { role: "Automotive Line Technician", role_fr: "Technicien Ligne Automobile", field: "Automotive", region: "Rabat-Sale-Kenitra", experience_level: "2-5 years", salary_min: 72000, salary_median: 96000, salary_max: 132000, demand_score: 82, growth_rate: 10.0, source: "PSA Kenitra" },

  // === Agri-food / Agriculture ===
  { role: "Agronomist", role_fr: "Ingenieur Agronome", field: "Agriculture", region: "Souss-Massa", experience_level: "0-2 years", salary_min: 54000, salary_median: 72000, salary_max: 96000, demand_score: 78, growth_rate: 8.0, source: "Emploi.ma 2025" },
  { role: "Agronomist", role_fr: "Ingenieur Agronome", field: "Agriculture", region: "Souss-Massa", experience_level: "2-5 years", salary_min: 96000, salary_median: 132000, salary_max: 180000, demand_score: 80, growth_rate: 9.0, source: "Emploi.ma 2025" },
  { role: "Food Quality Manager", role_fr: "Responsable Qualite Agroalimentaire", field: "Agriculture", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 96000, salary_median: 138000, salary_max: 192000, demand_score: 82, growth_rate: 10.0, source: "Lesieur Cristal careers" },
  { role: "Food Quality Manager", role_fr: "Responsable Qualite Agroalimentaire", field: "Agriculture", region: "Fes-Meknes", experience_level: "5-10 years", salary_min: 168000, salary_median: 228000, salary_max: 312000, demand_score: 78, growth_rate: 8.0, source: "Cevital Morocco" },

  // === Tourism / Hospitality ===
  { role: "Hotel Manager", role_fr: "Directeur d'Hotel", field: "Tourism", region: "Marrakech-Safi", experience_level: "5-10 years", salary_min: 180000, salary_median: 264000, salary_max: 420000, demand_score: 72, growth_rate: 8.0, source: "Accor Morocco" },
  { role: "Hotel Manager", role_fr: "Directeur d'Hotel", field: "Tourism", region: "Souss-Massa", experience_level: "5-10 years", salary_min: 168000, salary_median: 240000, salary_max: 384000, demand_score: 70, growth_rate: 7.0, source: "Emploi.ma 2025" },
  { role: "Tour Guide", role_fr: "Guide Touristique", field: "Tourism", region: "Marrakech-Safi", experience_level: "0-2 years", salary_min: 36000, salary_median: 48000, salary_max: 72000, demand_score: 65, growth_rate: 10.0, source: "ONMT 2025" },
  { role: "Revenue Manager", role_fr: "Revenue Manager", field: "Tourism", region: "Marrakech-Safi", experience_level: "2-5 years", salary_min: 108000, salary_median: 144000, salary_max: 204000, demand_score: 75, growth_rate: 12.0, source: "Accor Morocco" },

  // === Energy (additional) ===
  { role: "Solar Energy Technician", role_fr: "Technicien Energie Solaire", field: "Energy", region: "Ouarzazate-Midelt", experience_level: "0-2 years", salary_min: 48000, salary_median: 66000, salary_max: 84000, demand_score: 85, growth_rate: 18.0, source: "MASEN careers" },
  { role: "Solar Energy Technician", role_fr: "Technicien Energie Solaire", field: "Energy", region: "Ouarzazate-Midelt", experience_level: "2-5 years", salary_min: 84000, salary_median: 114000, salary_max: 156000, demand_score: 88, growth_rate: 20.0, source: "MASEN careers" },
  { role: "Wind Farm Engineer", role_fr: "Ingenieur Parc Eolien", field: "Energy", region: "Tanger-Tetouan-Al Hoceima", experience_level: "2-5 years", salary_min: 120000, salary_median: 168000, salary_max: 228000, demand_score: 82, growth_rate: 15.0, source: "Nareva Holding" },
  { role: "Energy Auditor", role_fr: "Auditeur Energetique", field: "Energy", region: "Casablanca-Settat", experience_level: "2-5 years", salary_min: 96000, salary_median: 132000, salary_max: 180000, demand_score: 78, growth_rate: 12.0, source: "AMISOLE 2025" },
];


// ============================================================================
// SKILL DEMAND DATA (80+ entries)
// demand_score: 1-100, growth_trend: declining/stable/rising
// ============================================================================

const skillDemandData = [
  // === Programming Languages ===
  { skill: "Go/Golang", skill_fr: "Go/Golang", field: "IT", category: "Programming", demand_score: 72, growth_trend: "rising", growth_percent: 18.0, job_count: 320, average_salary_boost: 12000, competition_level: "medium", time_to_learn: "6 months", related_skills: ["Docker", "Kubernetes", "Microservices"] },
  { skill: "Rust", skill_fr: "Rust", field: "IT", category: "Programming", demand_score: 58, growth_trend: "rising", growth_percent: 25.0, job_count: 85, average_salary_boost: 15000, competition_level: "low", time_to_learn: "12 months", related_skills: ["Systems Programming", "C++", "WebAssembly"] },
  { skill: "Swift", skill_fr: "Swift", field: "IT", category: "Programming", demand_score: 55, growth_trend: "stable", growth_percent: 5.0, job_count: 120, average_salary_boost: 8000, competition_level: "medium", time_to_learn: "6 months", related_skills: ["iOS", "Xcode", "Objective-C"] },
  { skill: "Kotlin", skill_fr: "Kotlin", field: "IT", category: "Programming", demand_score: 62, growth_trend: "rising", growth_percent: 14.0, job_count: 180, average_salary_boost: 9000, competition_level: "medium", time_to_learn: "4 months", related_skills: ["Android", "Java", "Spring"] },
  { skill: "R Language", skill_fr: "Langage R", field: "IT", category: "Programming", demand_score: 55, growth_trend: "stable", growth_percent: 4.0, job_count: 95, average_salary_boost: 6000, competition_level: "low", time_to_learn: "4 months", related_skills: ["Statistics", "Data Science", "ggplot2"] },
  { skill: "C/C++", skill_fr: "C/C++", field: "IT", category: "Programming", demand_score: 68, growth_trend: "stable", growth_percent: 3.0, job_count: 250, average_salary_boost: 8000, competition_level: "high", time_to_learn: "12 months", related_skills: ["Embedded Systems", "Linux", "Algorithms"] },
  { skill: "Scala", skill_fr: "Scala", field: "IT", category: "Programming", demand_score: 50, growth_trend: "stable", growth_percent: 2.0, job_count: 60, average_salary_boost: 14000, competition_level: "low", time_to_learn: "8 months", related_skills: ["Spark", "Big Data", "JVM"] },

  // === Frontend Frameworks ===
  { skill: "Vue.js", skill_fr: "Vue.js", field: "IT", category: "Framework", demand_score: 72, growth_trend: "rising", growth_percent: 12.0, job_count: 280, average_salary_boost: 7000, competition_level: "medium", time_to_learn: "3 months", related_skills: ["JavaScript", "Nuxt.js", "Vuex"] },
  { skill: "Next.js", skill_fr: "Next.js", field: "IT", category: "Framework", demand_score: 78, growth_trend: "rising", growth_percent: 22.0, job_count: 220, average_salary_boost: 10000, competition_level: "medium", time_to_learn: "3 months", related_skills: ["React", "Node.js", "Vercel"] },
  { skill: "Tailwind CSS", skill_fr: "Tailwind CSS", field: "IT", category: "Framework", demand_score: 70, growth_trend: "rising", growth_percent: 28.0, job_count: 350, average_salary_boost: 4000, competition_level: "low", time_to_learn: "1 month", related_skills: ["CSS", "React", "HTML"] },
  { skill: "Django", skill_fr: "Django", field: "IT", category: "Framework", demand_score: 65, growth_trend: "stable", growth_percent: 6.0, job_count: 180, average_salary_boost: 7000, competition_level: "medium", time_to_learn: "4 months", related_skills: ["Python", "PostgreSQL", "REST API"] },
  { skill: "Express.js", skill_fr: "Express.js", field: "IT", category: "Backend", demand_score: 74, growth_trend: "stable", growth_percent: 5.0, job_count: 320, average_salary_boost: 6000, competition_level: "medium", time_to_learn: "2 months", related_skills: ["Node.js", "JavaScript", "MongoDB"] },

  // === Cloud & Infrastructure ===
  { skill: "Google Cloud Platform", skill_fr: "Google Cloud Platform", field: "IT", category: "Cloud", demand_score: 68, growth_trend: "rising", growth_percent: 16.0, job_count: 180, average_salary_boost: 12000, competition_level: "medium", time_to_learn: "6 months", related_skills: ["Cloud Architecture", "BigQuery", "Kubernetes"] },
  { skill: "VMware/Virtualization", skill_fr: "VMware/Virtualisation", field: "IT", category: "Cloud", demand_score: 65, growth_trend: "stable", growth_percent: 2.0, job_count: 220, average_salary_boost: 8000, competition_level: "medium", time_to_learn: "4 months", related_skills: ["ESXi", "vSphere", "Networking"] },
  { skill: "Ansible", skill_fr: "Ansible", field: "IT", category: "DevOps", demand_score: 70, growth_trend: "rising", growth_percent: 12.0, job_count: 160, average_salary_boost: 9000, competition_level: "medium", time_to_learn: "3 months", related_skills: ["Linux", "Automation", "Terraform"] },
  { skill: "Jenkins", skill_fr: "Jenkins", field: "IT", category: "DevOps", demand_score: 72, growth_trend: "stable", growth_percent: 4.0, job_count: 250, average_salary_boost: 7000, competition_level: "medium", time_to_learn: "2 months", related_skills: ["CI/CD", "Docker", "Maven"] },
  { skill: "Linux Administration", skill_fr: "Administration Linux", field: "IT", category: "DevOps", demand_score: 80, growth_trend: "stable", growth_percent: 5.0, job_count: 400, average_salary_boost: 8000, competition_level: "high", time_to_learn: "6 months", related_skills: ["Bash", "Networking", "Security"] },

  // === Data & Analytics ===
  { skill: "Apache Spark", skill_fr: "Apache Spark", field: "IT", category: "Data", demand_score: 70, growth_trend: "rising", growth_percent: 14.0, job_count: 120, average_salary_boost: 12000, competition_level: "medium", time_to_learn: "6 months", related_skills: ["Hadoop", "Python", "Scala"] },
  { skill: "Tableau", skill_fr: "Tableau", field: "IT", category: "Data", demand_score: 72, growth_trend: "stable", growth_percent: 6.0, job_count: 200, average_salary_boost: 7000, competition_level: "medium", time_to_learn: "3 months", related_skills: ["SQL", "Data Visualization", "Business Intelligence"] },
  { skill: "ETL/Data Pipelines", skill_fr: "ETL/Pipelines de Donnees", field: "IT", category: "Data", demand_score: 75, growth_trend: "rising", growth_percent: 15.0, job_count: 160, average_salary_boost: 10000, competition_level: "medium", time_to_learn: "6 months", related_skills: ["SQL", "Python", "Airflow"] },
  { skill: "NoSQL Databases", skill_fr: "Bases NoSQL", field: "IT", category: "Database", demand_score: 70, growth_trend: "rising", growth_percent: 10.0, job_count: 220, average_salary_boost: 7000, competition_level: "medium", time_to_learn: "3 months", related_skills: ["MongoDB", "Redis", "Cassandra"] },
  { skill: "Data Warehousing", skill_fr: "Entreposage de Donnees", field: "IT", category: "Data", demand_score: 68, growth_trend: "rising", growth_percent: 11.0, job_count: 140, average_salary_boost: 9000, competition_level: "medium", time_to_learn: "6 months", related_skills: ["SQL", "Snowflake", "Redshift"] },

  // === Cybersecurity ===
  { skill: "Penetration Testing", skill_fr: "Tests d'Intrusion", field: "IT", category: "Security", demand_score: 78, growth_trend: "rising", growth_percent: 20.0, job_count: 120, average_salary_boost: 14000, competition_level: "low", time_to_learn: "12 months", related_skills: ["Kali Linux", "OWASP", "Network Security"] },
  { skill: "SOC Operations", skill_fr: "Operations SOC", field: "IT", category: "Security", demand_score: 75, growth_trend: "rising", growth_percent: 18.0, job_count: 100, average_salary_boost: 11000, competition_level: "low", time_to_learn: "8 months", related_skills: ["SIEM", "Incident Response", "Splunk"] },
  { skill: "ISO 27001", skill_fr: "ISO 27001", field: "IT", category: "Security", demand_score: 72, growth_trend: "rising", growth_percent: 14.0, job_count: 90, average_salary_boost: 10000, competition_level: "low", time_to_learn: "4 months", related_skills: ["Information Security", "Audit", "GDPR"] },

  // === Soft Skills (additional) ===
  { skill: "Arabic (Darija + MSA)", skill_fr: "Arabe (Darija + MSA)", field: null, category: "language", demand_score: 90, growth_trend: "stable", growth_percent: 2.0, job_count: 5000, average_salary_boost: 3000, competition_level: "low", time_to_learn: "Native", related_skills: ["French", "English", "Translation"] },
  { skill: "Spanish", skill_fr: "Espagnol", field: null, category: "language", demand_score: 55, growth_trend: "rising", growth_percent: 8.0, job_count: 350, average_salary_boost: 5000, competition_level: "low", time_to_learn: "12 months", related_skills: ["French", "Portuguese", "Translation"] },
  { skill: "German", skill_fr: "Allemand", field: null, category: "language", demand_score: 52, growth_trend: "rising", growth_percent: 10.0, job_count: 200, average_salary_boost: 7000, competition_level: "low", time_to_learn: "18 months", related_skills: ["English", "Technical Translation", "Export"] },
  { skill: "Negotiation", skill_fr: "Negociation", field: null, category: "soft", demand_score: 82, growth_trend: "stable", growth_percent: 3.0, job_count: 3000, average_salary_boost: 6000, competition_level: "high", time_to_learn: "6 months", related_skills: ["Communication", "Sales", "Leadership"] },
  { skill: "Public Speaking", skill_fr: "Prise de Parole en Public", field: null, category: "soft", demand_score: 75, growth_trend: "rising", growth_percent: 8.0, job_count: 2000, average_salary_boost: 5000, competition_level: "medium", time_to_learn: "6 months", related_skills: ["Communication", "Leadership", "Presentation"] },
  { skill: "Critical Thinking", skill_fr: "Pensee Critique", field: null, category: "soft", demand_score: 80, growth_trend: "rising", growth_percent: 10.0, job_count: 4000, average_salary_boost: 5000, competition_level: "medium", time_to_learn: "Ongoing", related_skills: ["Problem Solving", "Analysis", "Decision Making"] },
  { skill: "Time Management", skill_fr: "Gestion du Temps", field: null, category: "soft", demand_score: 78, growth_trend: "stable", growth_percent: 3.0, job_count: 5000, average_salary_boost: 3000, competition_level: "high", time_to_learn: "3 months", related_skills: ["Organization", "Productivity", "Prioritization"] },
  { skill: "Conflict Resolution", skill_fr: "Gestion des Conflits", field: null, category: "soft", demand_score: 72, growth_trend: "stable", growth_percent: 4.0, job_count: 2500, average_salary_boost: 4000, competition_level: "medium", time_to_learn: "6 months", related_skills: ["Communication", "Empathy", "Mediation"] },
  { skill: "Emotional Intelligence", skill_fr: "Intelligence Emotionnelle", field: null, category: "soft", demand_score: 76, growth_trend: "rising", growth_percent: 12.0, job_count: 3000, average_salary_boost: 5000, competition_level: "medium", time_to_learn: "Ongoing", related_skills: ["Leadership", "Empathy", "Self-awareness"] },

  // === Industry-Specific / Certifications ===
  { skill: "HACCP", skill_fr: "HACCP", field: "Agriculture", category: "certification", demand_score: 80, growth_trend: "stable", growth_percent: 5.0, job_count: 300, average_salary_boost: 6000, competition_level: "medium", time_to_learn: "2 months", related_skills: ["Food Safety", "ISO 22000", "Quality Management"] },
  { skill: "ISO 9001", skill_fr: "ISO 9001", field: "Engineering", category: "certification", demand_score: 82, growth_trend: "stable", growth_percent: 4.0, job_count: 450, average_salary_boost: 7000, competition_level: "medium", time_to_learn: "3 months", related_skills: ["Quality Management", "Auditing", "Process Improvement"] },
  { skill: "ISO 14001", skill_fr: "ISO 14001", field: "Engineering", category: "certification", demand_score: 72, growth_trend: "rising", growth_percent: 8.0, job_count: 200, average_salary_boost: 6000, competition_level: "low", time_to_learn: "3 months", related_skills: ["Environmental Management", "HSE", "Sustainability"] },
  { skill: "Lean Manufacturing", skill_fr: "Lean Manufacturing", field: "Engineering", category: "Methodology", demand_score: 78, growth_trend: "stable", growth_percent: 5.0, job_count: 280, average_salary_boost: 8000, competition_level: "medium", time_to_learn: "6 months", related_skills: ["Six Sigma", "Kaizen", "5S"] },
  { skill: "PRINCE2", skill_fr: "PRINCE2", field: null, category: "certification", demand_score: 65, growth_trend: "stable", growth_percent: 3.0, job_count: 180, average_salary_boost: 8000, competition_level: "medium", time_to_learn: "3 months", related_skills: ["Project Management", "Governance", "Risk Management"] },
  { skill: "ITIL", skill_fr: "ITIL", field: "IT", category: "certification", demand_score: 70, growth_trend: "stable", growth_percent: 4.0, job_count: 220, average_salary_boost: 7000, competition_level: "medium", time_to_learn: "2 months", related_skills: ["ITSM", "ServiceNow", "IT Operations"] },
  { skill: "BIM (Building Information Modeling)", skill_fr: "BIM (Modelisation des Donnees du Batiment)", field: "Engineering", category: "Technical", demand_score: 72, growth_trend: "rising", growth_percent: 18.0, job_count: 150, average_salary_boost: 8000, competition_level: "low", time_to_learn: "6 months", related_skills: ["AutoCAD", "Revit", "Architecture"] },
  { skill: "MATLAB/Simulink", skill_fr: "MATLAB/Simulink", field: "Engineering", category: "Technical", demand_score: 60, growth_trend: "stable", growth_percent: 3.0, job_count: 120, average_salary_boost: 6000, competition_level: "low", time_to_learn: "4 months", related_skills: ["Signal Processing", "Control Systems", "Simulation"] },

  // === Finance / Accounting specific ===
  { skill: "Sage 100/Sage X3", skill_fr: "Sage 100/Sage X3", field: "Finance", category: "Software", demand_score: 75, growth_trend: "stable", growth_percent: 3.0, job_count: 350, average_salary_boost: 5000, competition_level: "medium", time_to_learn: "3 months", related_skills: ["Accounting", "ERP", "Financial Reporting"] },
  { skill: "Bloomberg Terminal", skill_fr: "Terminal Bloomberg", field: "Finance", category: "Software", demand_score: 55, growth_trend: "stable", growth_percent: 2.0, job_count: 50, average_salary_boost: 15000, competition_level: "low", time_to_learn: "2 months", related_skills: ["Financial Analysis", "Trading", "Risk Management"] },
  { skill: "Financial Auditing", skill_fr: "Audit Financier", field: "Finance", category: "Accounting", demand_score: 78, growth_trend: "stable", growth_percent: 5.0, job_count: 300, average_salary_boost: 8000, competition_level: "medium", time_to_learn: "12 months", related_skills: ["IFRS", "Internal Controls", "Compliance"] },
  { skill: "Tax Law Morocco", skill_fr: "Droit Fiscal Marocain", field: "Finance", category: "Accounting", demand_score: 76, growth_trend: "stable", growth_percent: 4.0, job_count: 250, average_salary_boost: 7000, competition_level: "medium", time_to_learn: "12 months", related_skills: ["Accounting", "Corporate Law", "TVA"] },

  // === HR / Management specific ===
  { skill: "GPEC/Workforce Planning", skill_fr: "GPEC/Planification Effectifs", field: "HR", category: "Management", demand_score: 68, growth_trend: "rising", growth_percent: 8.0, job_count: 180, average_salary_boost: 6000, competition_level: "low", time_to_learn: "6 months", related_skills: ["HR Strategy", "Talent Management", "Analytics"] },
  { skill: "Labour Law Morocco", skill_fr: "Droit du Travail Marocain", field: "HR", category: "certification", demand_score: 80, growth_trend: "stable", growth_percent: 3.0, job_count: 400, average_salary_boost: 5000, competition_level: "medium", time_to_learn: "6 months", related_skills: ["HR Management", "Compliance", "Social Dialogue"] },
  { skill: "HRIS/Workday", skill_fr: "SIRH/Workday", field: "HR", category: "Software", demand_score: 65, growth_trend: "rising", growth_percent: 15.0, job_count: 120, average_salary_boost: 8000, competition_level: "low", time_to_learn: "4 months", related_skills: ["HR Management", "Data Analysis", "Payroll"] },

  // === Logistics / Supply Chain specific ===
  { skill: "Incoterms/International Trade", skill_fr: "Incoterms/Commerce International", field: "Logistics", category: "certification", demand_score: 76, growth_trend: "stable", growth_percent: 5.0, job_count: 300, average_salary_boost: 6000, competition_level: "medium", time_to_learn: "3 months", related_skills: ["Customs", "Import/Export", "Freight"] },
  { skill: "WMS (Warehouse Management)", skill_fr: "WMS (Gestion d'Entrepot)", field: "Logistics", category: "Software", demand_score: 72, growth_trend: "rising", growth_percent: 12.0, job_count: 180, average_salary_boost: 7000, competition_level: "medium", time_to_learn: "3 months", related_skills: ["Supply Chain", "Inventory", "ERP"] },
  { skill: "TMS (Transport Management)", skill_fr: "TMS (Gestion de Transport)", field: "Logistics", category: "Software", demand_score: 68, growth_trend: "rising", growth_percent: 10.0, job_count: 150, average_salary_boost: 6000, competition_level: "low", time_to_learn: "3 months", related_skills: ["Logistics", "Route Optimization", "Fleet Management"] },

  // === Marketing / Digital specific ===
  { skill: "Google Ads/SEM", skill_fr: "Google Ads/SEM", field: "Marketing", category: "Technical", demand_score: 80, growth_trend: "rising", growth_percent: 14.0, job_count: 350, average_salary_boost: 6000, competition_level: "medium", time_to_learn: "3 months", related_skills: ["SEO", "Analytics", "Digital Marketing"] },
  { skill: "Social Media Marketing", skill_fr: "Marketing Reseaux Sociaux", field: "Marketing", category: "Technical", demand_score: 82, growth_trend: "rising", growth_percent: 16.0, job_count: 500, average_salary_boost: 5000, competition_level: "high", time_to_learn: "3 months", related_skills: ["Content Creation", "Analytics", "Community Management"] },
  { skill: "Adobe Creative Suite", skill_fr: "Suite Adobe Creative", field: "Marketing", category: "Design", demand_score: 78, growth_trend: "stable", growth_percent: 4.0, job_count: 400, average_salary_boost: 5000, competition_level: "high", time_to_learn: "6 months", related_skills: ["Photoshop", "Illustrator", "InDesign"] },
  { skill: "Figma/UI Design", skill_fr: "Figma/Design UI", field: "IT", category: "Design", demand_score: 76, growth_trend: "rising", growth_percent: 20.0, job_count: 250, average_salary_boost: 6000, competition_level: "medium", time_to_learn: "3 months", related_skills: ["UX Design", "Prototyping", "CSS"] },
  { skill: "Google Analytics", skill_fr: "Google Analytics", field: "Marketing", category: "Data", demand_score: 78, growth_trend: "stable", growth_percent: 6.0, job_count: 400, average_salary_boost: 4000, competition_level: "medium", time_to_learn: "2 months", related_skills: ["SEO", "Digital Marketing", "Data Visualization"] },
  { skill: "HubSpot", skill_fr: "HubSpot", field: "Marketing", category: "CRM", demand_score: 65, growth_trend: "rising", growth_percent: 14.0, job_count: 150, average_salary_boost: 6000, competition_level: "low", time_to_learn: "2 months", related_skills: ["CRM", "Email Marketing", "Inbound Marketing"] },
  { skill: "Copywriting FR/EN", skill_fr: "Redaction FR/EN", field: "Marketing", category: "soft", demand_score: 76, growth_trend: "rising", growth_percent: 10.0, job_count: 350, average_salary_boost: 5000, competition_level: "medium", time_to_learn: "6 months", related_skills: ["Content Strategy", "SEO", "Storytelling"] },

  // === Emerging Tech ===
  { skill: "Prompt Engineering", skill_fr: "Ingenierie de Prompts", field: "IT", category: "Emerging", demand_score: 68, growth_trend: "rising", growth_percent: 45.0, job_count: 80, average_salary_boost: 10000, competition_level: "low", time_to_learn: "2 months", related_skills: ["LLMs", "AI", "NLP"] },
  { skill: "Computer Vision", skill_fr: "Vision par Ordinateur", field: "IT", category: "AI/ML", demand_score: 65, growth_trend: "rising", growth_percent: 18.0, job_count: 60, average_salary_boost: 12000, competition_level: "low", time_to_learn: "12 months", related_skills: ["Python", "TensorFlow", "OpenCV"] },
  { skill: "NLP/Text Mining", skill_fr: "NLP/Fouille de Texte", field: "IT", category: "AI/ML", demand_score: 68, growth_trend: "rising", growth_percent: 20.0, job_count: 75, average_salary_boost: 11000, competition_level: "low", time_to_learn: "9 months", related_skills: ["Python", "BERT", "spaCy"] },
  { skill: "Robotic Process Automation", skill_fr: "RPA (Automatisation de Processus)", field: "IT", category: "Automation", demand_score: 70, growth_trend: "rising", growth_percent: 22.0, job_count: 130, average_salary_boost: 9000, competition_level: "low", time_to_learn: "4 months", related_skills: ["UiPath", "Python", "Business Process"] },
  { skill: "Edge Computing", skill_fr: "Edge Computing", field: "IT", category: "Emerging", demand_score: 52, growth_trend: "rising", growth_percent: 20.0, job_count: 40, average_salary_boost: 12000, competition_level: "low", time_to_learn: "6 months", related_skills: ["IoT", "Cloud", "5G"] },

  // === Healthcare specific ===
  { skill: "Telemedicine Systems", skill_fr: "Systemes de Telemedecine", field: "Healthcare", category: "Technical", demand_score: 68, growth_trend: "rising", growth_percent: 22.0, job_count: 80, average_salary_boost: 8000, competition_level: "low", time_to_learn: "4 months", related_skills: ["Healthcare IT", "Digital Health", "Patient Care"] },
  { skill: "Biomedical Equipment Maintenance", skill_fr: "Maintenance Equipements Biomedicaux", field: "Healthcare", category: "Technical", demand_score: 75, growth_trend: "rising", growth_percent: 10.0, job_count: 150, average_salary_boost: 7000, competition_level: "low", time_to_learn: "12 months", related_skills: ["Electronics", "Medical Devices", "Calibration"] },

  // === Energy specific ===
  { skill: "Photovoltaic Systems", skill_fr: "Systemes Photovoltaiques", field: "Energy", category: "Technical", demand_score: 80, growth_trend: "rising", growth_percent: 25.0, job_count: 200, average_salary_boost: 8000, competition_level: "low", time_to_learn: "6 months", related_skills: ["Electrical Engineering", "Renewable Energy", "Grid Integration"] },
  { skill: "Energy Management (ISO 50001)", skill_fr: "Management de l'Energie (ISO 50001)", field: "Energy", category: "certification", demand_score: 70, growth_trend: "rising", growth_percent: 15.0, job_count: 100, average_salary_boost: 8000, competition_level: "low", time_to_learn: "4 months", related_skills: ["Energy Audit", "Sustainability", "ISO 14001"] },
  { skill: "Smart Grid Technology", skill_fr: "Technologie Reseau Intelligent", field: "Energy", category: "Emerging", demand_score: 60, growth_trend: "rising", growth_percent: 20.0, job_count: 50, average_salary_boost: 10000, competition_level: "low", time_to_learn: "8 months", related_skills: ["IoT", "Electrical Engineering", "Data Analytics"] },
];


// ============================================================================
// SUCCESS STORIES (30+ entries)
// id format: story_{firstname}_{keyword}
// ============================================================================

const successStoryData = [
  {
    id: "story_imane_frontend",
    graduate_name: "Imane El Mansouri",
    graduation_year: 2024,
    program_id: "developpement_digital",
    program_name: "Developpement Digital",
    current_role: "Developpeuse Frontend",
    current_role_en: "Frontend Developer",
    company: "Sqli Group",
    location: "Rabat",
    salary_range: "10000-14000 MAD",
    story_fr: "Issue d'un milieu modeste a Sidi Kacem, j'ai integre l'IMTA en Developpement Digital. Mon stage de fin d'etudes chez Sqli m'a permis de decouvrir React et Next.js. En 4 mois, j'ai ete embauchee en CDI. Aujourd'hui, je developpe des interfaces pour des clients europeens et je mentorise 3 stagiaires.",
    story_en: "Coming from a modest background in Sidi Kacem, I joined IMTA for Digital Development. My final internship at Sqli introduced me to React and Next.js. Within 4 months, I was hired permanently. Today, I develop interfaces for European clients and mentor 3 interns.",
    key_achievement: "Led the redesign of a client portal serving 50,000 users",
    key_achievement_fr: "Dirige la refonte d'un portail client de 50 000 utilisateurs",
    advice_fr: "Apprenez React et TypeScript. C'est ce que cherchent toutes les entreprises au Maroc en ce moment.",
    advice_en: "Learn React and TypeScript. That's what every company in Morocco is looking for right now.",
    tags: ["frontend", "react", "sqli", "rabat"],
    field: "technology",
    is_featured: true,
  },
  {
    id: "story_yassine_cloud",
    graduate_name: "Yassine Bouazza",
    graduation_year: 2023,
    program_id: "genie_informatique_reseaux",
    program_name: "Genie Informatique et Reseaux",
    current_role: "Architecte Cloud",
    current_role_en: "Cloud Architect",
    company: "CGI Morocco",
    location: "Casablanca",
    salary_range: "18000-24000 MAD",
    story_fr: "Apres mon diplome IMTA, j'ai obtenu les certifications AWS Solutions Architect et Azure Administrator. CGI m'a recrute pour un projet de migration cloud d'une banque marocaine. En 2 ans, je suis passe de consultant junior a architecte cloud, gerant une equipe de 5 ingenieurs.",
    story_en: "After my IMTA degree, I earned AWS Solutions Architect and Azure Administrator certifications. CGI recruited me for a cloud migration project at a Moroccan bank. In 2 years, I went from junior consultant to cloud architect, managing a team of 5 engineers.",
    key_achievement: "Migrated 200+ servers to AWS, reducing infrastructure costs by 40%",
    key_achievement_fr: "Migration de 200+ serveurs vers AWS, reduction des couts d'infra de 40%",
    advice_fr: "Les certifications cloud font toute la difference sur le marche marocain. Investissez-y.",
    advice_en: "Cloud certifications make all the difference in the Moroccan market. Invest in them.",
    tags: ["cloud", "aws", "azure", "cgi", "architecture"],
    field: "technology",
    is_featured: true,
  },
  {
    id: "story_houda_qualite_auto",
    graduate_name: "Houda Bennani",
    graduation_year: 2022,
    program_id: "genie_mecanique",
    program_name: "Genie Mecanique et Productique",
    current_role: "Responsable Qualite",
    current_role_en: "Quality Manager",
    company: "Renault Tanger Med",
    location: "Tanger",
    salary_range: "14000-18000 MAD",
    story_fr: "J'etais la seule femme de ma promotion en Genie Mecanique. Mon PFE chez Renault sur l'optimisation de la ligne de peinture a ete remarque par la direction. Embauchee comme ingenieuse qualite, j'ai rapidement evolue vers le poste de responsable. Mon equipe a reduit le taux de retouche de 12% a 3%.",
    story_en: "I was the only woman in my Mechanical Engineering class. My thesis at Renault on paint line optimization caught management's attention. Hired as a quality engineer, I quickly moved up to manager. My team reduced the rework rate from 12% to 3%.",
    key_achievement: "Rework rate reduced from 12% to 3%, saving 1.8M MAD/year",
    key_achievement_fr: "Taux de retouche reduit de 12% a 3%, economie de 1,8M MAD/an",
    advice_fr: "N'ayez pas peur des secteurs masculins. Votre rigueur et vos competences parleront pour vous.",
    advice_en: "Don't be afraid of male-dominated sectors. Your rigor and skills will speak for themselves.",
    tags: ["quality", "automotive", "renault", "women-in-engineering"],
    field: "automotive",
    is_featured: true,
  },
  {
    id: "story_amine_startup",
    graduate_name: "Amine Kettani",
    graduation_year: 2021,
    program_id: "genie_informatique_reseaux",
    program_name: "Genie Informatique et Reseaux",
    current_role: "Co-fondateur & CTO",
    current_role_en: "Co-founder & CTO",
    company: "DabaDoc (startup sante)",
    location: "Casablanca",
    salary_range: "25000-35000 MAD",
    story_fr: "Apres 3 ans chez un editeur de logiciel, j'ai co-fonde une startup de telemedecine avec un ami medecin. Notre plateforme connecte 500 medecins a 80 000 patients. Nous avons leve 2M de dollars aupres d'investisseurs marocains et francais. L'IMTA m'a appris a penser systeme, pas juste code.",
    story_en: "After 3 years at a software company, I co-founded a telemedicine startup with a doctor friend. Our platform connects 500 doctors with 80,000 patients. We raised $2M from Moroccan and French investors. IMTA taught me to think systems, not just code.",
    key_achievement: "Raised $2M seed funding, 500 doctors on the platform",
    key_achievement_fr: "Levee de fonds de 2M$, 500 medecins sur la plateforme",
    advice_fr: "L'entrepreneuriat au Maroc est difficile mais possible. Trouvez un co-fondateur complementaire.",
    advice_en: "Entrepreneurship in Morocco is tough but possible. Find a complementary co-founder.",
    tags: ["startup", "entrepreneurship", "healthtech", "telemedicine"],
    field: "technology",
    is_featured: true,
  },
  {
    id: "story_salma_finance",
    graduate_name: "Salma Rami",
    graduation_year: 2023,
    program_id: "gestion_comptabilite",
    program_name: "Gestion et Comptabilite",
    current_role: "Analyste Financiere",
    current_role_en: "Financial Analyst",
    company: "Attijariwafa Bank",
    location: "Casablanca",
    salary_range: "12000-16000 MAD",
    story_fr: "Mon parcours IMTA en gestion m'a ouvert les portes du secteur bancaire. Recrutee par Attijariwafa lors d'un forum emploi, j'ai commence par l'analyse de credit PME. Ma rigueur et ma maitrise d'Excel avance m'ont valu une promotion en salle des marches apres 18 mois.",
    story_en: "My IMTA management track opened doors to the banking sector. Recruited by Attijariwafa at a job fair, I started in SME credit analysis. My thoroughness and advanced Excel skills earned me a promotion to the trading floor after 18 months.",
    key_achievement: "Promoted to capital markets team in 18 months",
    key_achievement_fr: "Promue en salle des marches en 18 mois",
    advice_fr: "Le secteur bancaire recrute massivement. Maitrisez Excel, la modelisation financiere et le francais des affaires.",
    advice_en: "The banking sector is hiring massively. Master Excel, financial modeling, and business French.",
    tags: ["finance", "banking", "attijariwafa", "excel"],
    field: "finance",
    is_featured: false,
  },
  {
    id: "story_zakaria_logistique",
    graduate_name: "Zakaria Berrada",
    graduation_year: 2022,
    program_id: "logistique_transport",
    program_name: "Logistique et Transport",
    current_role: "Responsable Operations Portuaires",
    current_role_en: "Port Operations Manager",
    company: "Tanger Med Port Authority",
    location: "Tanger",
    salary_range: "16000-22000 MAD",
    story_fr: "Tanger Med est l'un des plus grands ports d'Afrique et j'ai la chance d'y travailler. Apres mon stage en logistique portuaire, j'ai ete integre dans l'equipe operations. Ma connaissance des Incoterms et du dedouanement m'a permis de gravir les echelons rapidement. Je gere maintenant le flux de 2000 conteneurs/jour.",
    story_en: "Tanger Med is one of Africa's largest ports and I'm lucky to work there. After my internship in port logistics, I joined the operations team. My knowledge of Incoterms and customs procedures helped me climb the ranks fast. I now manage the flow of 2,000 containers/day.",
    key_achievement: "Optimized container throughput by 15% using lean methodology",
    key_achievement_fr: "Optimisation du debit de conteneurs de 15% via la methodologie lean",
    advice_fr: "La logistique est un secteur d'avenir au Maroc avec Tanger Med. Apprenez l'anglais et les Incoterms.",
    advice_en: "Logistics is a sector with a future in Morocco thanks to Tanger Med. Learn English and Incoterms.",
    tags: ["logistics", "port", "tanger-med", "operations"],
    field: "logistics",
    is_featured: true,
  },
  {
    id: "story_meryem_rh",
    graduate_name: "Meryem Chafik",
    graduation_year: 2023,
    program_id: "gestion_comptabilite",
    program_name: "Gestion des Entreprises",
    current_role: "Responsable RH",
    current_role_en: "HR Manager",
    company: "Marjane Holding",
    location: "Casablanca",
    salary_range: "14000-18000 MAD",
    story_fr: "J'ai rejoint Marjane comme assistante RH juste apres mon diplome. La grande distribution au Maroc emploie des milliers de personnes, et la gestion RH y est un vrai defi. En 2 ans, j'ai digitalise le processus de recrutement, passant de 45 a 12 jours en moyenne pour pourvoir un poste.",
    story_en: "I joined Marjane as an HR assistant right after graduating. Retail in Morocco employs thousands, and HR management is a real challenge. In 2 years, I digitized the recruitment process, reducing average time-to-fill from 45 to 12 days.",
    key_achievement: "Reduced time-to-fill from 45 to 12 days through digital transformation",
    key_achievement_fr: "Reduction du delai de recrutement de 45 a 12 jours par la transformation digitale",
    advice_fr: "Les RH ne sont pas un metier secondaire. C'est strategique, surtout dans la grande distribution.",
    advice_en: "HR isn't a secondary profession. It's strategic, especially in retail.",
    tags: ["hr", "retail", "marjane", "digital-transformation"],
    field: "management",
    is_featured: false,
  },
  {
    id: "story_said_energie",
    graduate_name: "Said Ouazzani",
    graduation_year: 2021,
    program_id: "genie_electrique",
    program_name: "Genie Electrique et Energies Renouvelables",
    current_role: "Ingenieur Projet Solaire",
    current_role_en: "Solar Project Engineer",
    company: "MASEN",
    location: "Ouarzazate",
    salary_range: "15000-20000 MAD",
    story_fr: "Travailler sur Noor, la plus grande centrale solaire du monde, c'etait mon reve. Apres mon stage chez MASEN, j'ai ete affecte au suivi de performance de Noor III. Je contribue a la transition energetique du Maroc et j'en suis fier. Mon salaire a double en 3 ans.",
    story_en: "Working on Noor, the world's largest solar plant, was my dream. After my internship at MASEN, I was assigned to performance monitoring of Noor III. I contribute to Morocco's energy transition and I'm proud of it. My salary doubled in 3 years.",
    key_achievement: "Improved Noor III plant efficiency by 4.2% through monitoring optimization",
    key_achievement_fr: "Amelioration de 4,2% du rendement de Noor III par l'optimisation du suivi",
    advice_fr: "Les energies renouvelables sont l'avenir du Maroc. Formez-vous en solaire et eolien.",
    advice_en: "Renewable energy is Morocco's future. Train in solar and wind.",
    tags: ["solar", "renewable-energy", "masen", "ouarzazate"],
    field: "energy",
    is_featured: true,
  },
  {
    id: "story_asmae_marketing",
    graduate_name: "Asmae Hajji",
    graduation_year: 2024,
    program_id: "commerce_marketing",
    program_name: "Commerce et Marketing Digital",
    current_role: "Digital Marketing Manager",
    current_role_en: "Digital Marketing Manager",
    company: "Jumia Morocco",
    location: "Casablanca",
    salary_range: "11000-15000 MAD",
    story_fr: "Le e-commerce explose au Maroc et j'ai saute dans le train a temps. Mon stage chez Jumia s'est transforme en CDI en 2 mois. Je gere les campagnes Facebook et Google Ads pour le Black Friday marocain, qui genere 30% du chiffre annuel. Mon equipe a multiplie le ROI des campagnes par 3.",
    story_en: "E-commerce is booming in Morocco and I jumped on the train at the right time. My Jumia internship turned into a permanent contract in 2 months. I manage Facebook and Google Ads campaigns for the Moroccan Black Friday, generating 30% of annual revenue. My team tripled campaign ROI.",
    key_achievement: "Tripled digital campaign ROI during Black Friday 2024",
    key_achievement_fr: "ROI des campagnes digitales triple pendant le Black Friday 2024",
    advice_fr: "Le marketing digital, c'est l'avenir. Google Ads et Meta Ads sont des competences indispensables.",
    advice_en: "Digital marketing is the future. Google Ads and Meta Ads are essential skills.",
    tags: ["marketing", "e-commerce", "jumia", "google-ads"],
    field: "marketing",
    is_featured: false,
  },
  {
    id: "story_khalid_cybersec",
    graduate_name: "Khalid Fassi Fihri",
    graduation_year: 2022,
    program_id: "genie_informatique_reseaux",
    program_name: "Genie Informatique et Reseaux",
    current_role: "Consultant Cybersecurite",
    current_role_en: "Cybersecurity Consultant",
    company: "Dataprotect",
    location: "Casablanca",
    salary_range: "16000-22000 MAD",
    story_fr: "La cybersecurite est un domaine en pleine croissance au Maroc, surtout avec la loi 09-08. Apres mes certifications CEH et CISSP, Dataprotect m'a recrute. Je realise des audits de securite pour des banques et des ministeres. C'est un travail passionnant ou chaque jour est different.",
    story_en: "Cybersecurity is a booming field in Morocco, especially with the 09-08 data protection law. After earning CEH and CISSP certifications, Dataprotect recruited me. I conduct security audits for banks and government ministries. It's an exciting job where every day is different.",
    key_achievement: "Conducted 25+ security audits for Moroccan financial institutions",
    key_achievement_fr: "Realisation de 25+ audits de securite pour des institutions financieres marocaines",
    advice_fr: "La cybersecurite est le domaine le plus porteur de l'IT au Maroc. Les certifications sont cle.",
    advice_en: "Cybersecurity is the most promising IT field in Morocco. Certifications are key.",
    tags: ["cybersecurity", "audit", "dataprotect", "certifications"],
    field: "technology",
    is_featured: false,
  },
  {
    id: "story_zineb_pharma",
    graduate_name: "Zineb Lahlou",
    graduation_year: 2023,
    program_id: "infirmier_polyvalent",
    program_name: "Infirmier Polyvalent",
    current_role: "Infirmiere Coordinatrice",
    current_role_en: "Nurse Coordinator",
    company: "Clinique Internationale de Marrakech",
    location: "Marrakech",
    salary_range: "8000-12000 MAD",
    story_fr: "Apres mes etudes d'infirmiere, j'ai travaille 2 ans en clinique privee. Ma double competence en soins et en gestion m'a permis de devenir coordinatrice. Je supervise une equipe de 12 infirmieres et je gere les plannings. La sante au Maroc offre de belles opportunites pour ceux qui s'investissent.",
    story_en: "After nursing school, I worked 2 years at a private clinic. My dual expertise in care and management helped me become coordinator. I supervise a team of 12 nurses and manage scheduling. Healthcare in Morocco offers great opportunities for those who invest in themselves.",
    key_achievement: "Improved patient satisfaction scores from 72% to 91%",
    key_achievement_fr: "Amelioration de la satisfaction patients de 72% a 91%",
    advice_fr: "Les infirmiers au Maroc sont tres demandes. Formez-vous en gestion pour evoluer plus vite.",
    advice_en: "Nurses are in high demand in Morocco. Get management training to advance faster.",
    tags: ["nursing", "healthcare", "management", "marrakech"],
    field: "healthcare",
    is_featured: false,
  },
  {
    id: "story_omar_sap",
    graduate_name: "Omar El Amrani",
    graduation_year: 2021,
    program_id: "genie_informatique_reseaux",
    program_name: "Genie Informatique et Reseaux",
    current_role: "Consultant SAP Senior",
    current_role_en: "Senior SAP Consultant",
    company: "Accenture Morocco",
    location: "Casablanca",
    salary_range: "22000-28000 MAD",
    story_fr: "SAP est le logiciel ERP le plus deploye au Maroc, et les consultants sont rares. Apres ma formation IMTA et une certification SAP S/4HANA, j'ai rejoint Accenture. En 4 ans, je suis devenu consultant senior. Je voyage entre le Maroc et l'Afrique de l'Ouest pour des deploiements. C'est tres bien paye.",
    story_en: "SAP is the most deployed ERP in Morocco, and consultants are rare. After IMTA and SAP S/4HANA certification, I joined Accenture. In 4 years, I became senior consultant. I travel between Morocco and West Africa for deployments. The pay is excellent.",
    key_achievement: "Led 3 SAP implementations across Morocco and West Africa",
    key_achievement_fr: "Dirige 3 implementations SAP au Maroc et en Afrique de l'Ouest",
    advice_fr: "Le consulting SAP est la voie royale pour un salaire eleve au Maroc. La demande depasse largement l'offre.",
    advice_en: "SAP consulting is the golden path to a high salary in Morocco. Demand far exceeds supply.",
    tags: ["sap", "erp", "accenture", "consulting"],
    field: "technology",
    is_featured: true,
  },
  {
    id: "story_chaimae_agro",
    graduate_name: "Chaimae Berrahma",
    graduation_year: 2022,
    program_id: "qualite_agroalimentaire",
    program_name: "Qualite en Agroalimentaire",
    current_role: "Responsable Qualite HACCP",
    current_role_en: "HACCP Quality Manager",
    company: "Centrale Danone",
    location: "Meknes",
    salary_range: "12000-16000 MAD",
    story_fr: "L'agroalimentaire est le premier secteur industriel du Maroc. Chez Centrale Danone, je veille a la conformite HACCP et ISO 22000 de toute la chaine de production. Mon diplome IMTA et ma certification HACCP m'ont directement placee comme responsable qualite. C'est un metier exigeant mais gratifiant.",
    story_en: "Agri-food is Morocco's leading industrial sector. At Centrale Danone, I ensure HACCP and ISO 22000 compliance across the production chain. My IMTA degree and HACCP certification directly placed me as quality manager. It's demanding but rewarding.",
    key_achievement: "Zero non-conformities during 2023 ISO 22000 audit",
    key_achievement_fr: "Zero non-conformites lors de l'audit ISO 22000 de 2023",
    advice_fr: "HACCP et ISO 22000 sont des certifications essentielles dans l'agroalimentaire. Ne les negligez pas.",
    advice_en: "HACCP and ISO 22000 are essential certifications in agri-food. Don't overlook them.",
    tags: ["quality", "haccp", "agri-food", "danone"],
    field: "agriculture",
    is_featured: false,
  },
  {
    id: "story_ayoub_mobile",
    graduate_name: "Ayoub Ziani",
    graduation_year: 2024,
    program_id: "developpement_digital",
    program_name: "Developpement Digital",
    current_role: "Developpeur Mobile Senior",
    current_role_en: "Senior Mobile Developer",
    company: "Inwi (Wana Corporate)",
    location: "Rabat",
    salary_range: "14000-18000 MAD",
    story_fr: "L'application mobile de mon operateur telecom, c'est moi qui l'ai redesignee ! Chez Inwi, j'ai pris en charge le developpement de l'app client sous Flutter. Avec 2 millions d'utilisateurs, chaque bug a un impact enorme. C'est stressant mais extremement formateur.",
    story_en: "I redesigned my telecom operator's mobile app! At Inwi, I took charge of developing the customer app with Flutter. With 2 million users, every bug has a huge impact. It's stressful but incredibly educational.",
    key_achievement: "Redesigned Inwi app used by 2M+ subscribers, 4.5 star rating",
    key_achievement_fr: "Refonte de l'app Inwi utilisee par 2M+ abonnes, note de 4,5 etoiles",
    advice_fr: "Flutter permet de creer des apps iOS et Android avec un seul code. C'est tres demande au Maroc.",
    advice_en: "Flutter lets you create iOS and Android apps with one codebase. It's in high demand in Morocco.",
    tags: ["mobile", "flutter", "inwi", "telecom"],
    field: "technology",
    is_featured: false,
  },
  {
    id: "story_karima_transition",
    graduate_name: "Karima Belhaj",
    graduation_year: 2020,
    program_id: "gestion_comptabilite",
    program_name: "Gestion et Comptabilite",
    current_role: "Data Analyst",
    current_role_en: "Data Analyst",
    company: "BMCE Bank (Bank of Africa)",
    location: "Casablanca",
    salary_range: "13000-17000 MAD",
    story_fr: "Comptable de formation, j'ai fait une reconversion vers la data. Apres 2 ans en cabinet comptable, j'ai suivi une formation Python et SQL en ligne. BMCE m'a recrutee pour analyser les donnees de risque credit. Ma double competence finance+data est tres recherchee.",
    story_en: "Trained as an accountant, I transitioned to data. After 2 years at an accounting firm, I took online Python and SQL courses. BMCE recruited me to analyze credit risk data. My dual finance+data expertise is highly sought after.",
    key_achievement: "Built credit risk dashboard used by 50 relationship managers daily",
    key_achievement_fr: "Creation d'un dashboard de risque credit utilise par 50 charges de clientele",
    advice_fr: "La reconversion est possible et valorisee. Le combo comptabilite+data est une pepite.",
    advice_en: "Career transitions are possible and valued. The accounting+data combo is a goldmine.",
    tags: ["career-change", "data", "banking", "reconversion"],
    field: "finance",
    is_featured: true,
  },
  {
    id: "story_redouane_btp",
    graduate_name: "Redouane Tahiri",
    graduation_year: 2022,
    program_id: "genie_civil",
    program_name: "Genie Civil et BTP",
    current_role: "Chef de Chantier",
    current_role_en: "Site Manager",
    company: "SGTM (Societe Generale de Travaux du Maroc)",
    location: "Casablanca",
    salary_range: "12000-16000 MAD",
    story_fr: "Le BTP au Maroc est en plein boom avec les projets du Mondial 2030. Chez SGTM, je supervise un chantier de construction d'un stade olympique. C'est un defi technique et humain : 200 ouvriers, des delais serres et des normes internationales. Mon diplome IMTA m'a prepare a cette responsabilite.",
    story_en: "Construction in Morocco is booming with World Cup 2030 projects. At SGTM, I supervise the construction of an Olympic stadium. It's a technical and human challenge: 200 workers, tight deadlines, and international standards. My IMTA degree prepared me for this responsibility.",
    key_achievement: "Supervised stadium construction project worth 120M MAD",
    key_achievement_fr: "Supervision d'un chantier de stade d'une valeur de 120M MAD",
    advice_fr: "Le BTP offre des carrieres passionnantes avec le Mondial 2030. Formez-vous en gestion de projet.",
    advice_en: "Construction offers exciting careers with World Cup 2030. Train in project management.",
    tags: ["construction", "civil-engineering", "mondial-2030", "sgtm"],
    field: "engineering",
    is_featured: true,
  },
  {
    id: "story_fatima_z_hse",
    graduate_name: "Fatima Zohra Amrani",
    graduation_year: 2023,
    program_id: "hse",
    program_name: "Hygiene, Securite et Environnement",
    current_role: "Responsable HSE",
    current_role_en: "HSE Manager",
    company: "LafargeHolcim Maroc",
    location: "Fes",
    salary_range: "13000-17000 MAD",
    story_fr: "La securite industrielle n'est plus une option au Maroc, c'est une obligation legale. Chez LafargeHolcim, je suis responsable de la securite de 3 carrieres dans la region Fes-Meknes. Mon diplome IMTA en HSE et ma certification NEBOSH m'ont ouvert les portes d'un secteur en pleine croissance.",
    story_en: "Industrial safety is no longer optional in Morocco, it's a legal obligation. At LafargeHolcim, I'm responsible for safety at 3 quarries in the Fes-Meknes region. My IMTA HSE degree and NEBOSH certification opened doors to a booming sector.",
    key_achievement: "Achieved 365 days without lost-time incidents across 3 sites",
    key_achievement_fr: "365 jours sans accident avec arret de travail sur 3 sites",
    advice_fr: "Le HSE est un secteur porteur au Maroc. NEBOSH et ISO 45001 sont des must-have.",
    advice_en: "HSE is a growth sector in Morocco. NEBOSH and ISO 45001 are must-haves.",
    tags: ["hse", "safety", "lafargeholcim", "nebosh"],
    field: "engineering",
    is_featured: false,
  },
  {
    id: "story_mouad_ai",
    graduate_name: "Mouad Chraibi",
    graduation_year: 2024,
    program_id: "data_science_ia",
    program_name: "Data Science et Intelligence Artificielle",
    current_role: "Ingenieur IA",
    current_role_en: "AI Engineer",
    company: "OCP Group (UM6P)",
    location: "Benguerir",
    salary_range: "18000-24000 MAD",
    story_fr: "L'IA au service de l'agriculture marocaine, c'est mon quotidien. A UM6P/OCP, je developpe des modeles de prediction de rendement agricole bases sur des images satellites. Notre modele a ameliore les recommandations d'engrais de 18%. Le Maroc investit massivement dans l'IA appliquee.",
    story_en: "AI serving Moroccan agriculture is my daily reality. At UM6P/OCP, I develop crop yield prediction models using satellite imagery. Our model improved fertilizer recommendations by 18%. Morocco is investing heavily in applied AI.",
    key_achievement: "AI model improved fertilizer recommendations by 18%, serving 5,000 farmers",
    key_achievement_fr: "Modele IA ayant ameliore les recommandations d'engrais de 18%, servant 5 000 agriculteurs",
    advice_fr: "L'IA appliquee a l'agriculture est un domaine d'avenir au Maroc. OCP et UM6P recrutent activement.",
    advice_en: "Applied AI in agriculture is a future-proof field in Morocco. OCP and UM6P are actively hiring.",
    tags: ["ai", "agriculture", "ocp", "um6p", "machine-learning"],
    field: "technology",
    is_featured: true,
  },
  {
    id: "story_oumaima_audit",
    graduate_name: "Oumaima Kabbaj",
    graduation_year: 2022,
    program_id: "gestion_comptabilite",
    program_name: "Gestion et Comptabilite",
    current_role: "Auditrice Senior",
    current_role_en: "Senior Auditor",
    company: "Deloitte Morocco",
    location: "Casablanca",
    salary_range: "14000-20000 MAD",
    story_fr: "Le Big Four au Maroc, c'est une ecole de la vie. Chez Deloitte, j'ai audite des entreprises de tous secteurs : banques, telecoms, agroalimentaire. Apres 3 ans, je suis passee auditrice senior. Les horaires sont intenses mais l'apprentissage est incomparable. Ma certification ACCA a fait la difference.",
    story_en: "The Big Four in Morocco is a school of life. At Deloitte, I've audited companies across sectors: banks, telecoms, agri-food. After 3 years, I became senior auditor. The hours are intense but the learning is unmatched. My ACCA certification made the difference.",
    key_achievement: "Audited 15+ major Moroccan companies across 4 sectors",
    key_achievement_fr: "Audit de 15+ grandes entreprises marocaines dans 4 secteurs",
    advice_fr: "Commencer en Big Four est le meilleur investissement de carriere. Les portes s'ouvrent ensuite facilement.",
    advice_en: "Starting at a Big Four is the best career investment. Doors open easily afterwards.",
    tags: ["audit", "deloitte", "big-four", "acca"],
    field: "finance",
    is_featured: false,
  },
  {
    id: "story_adam_eolien",
    graduate_name: "Adam Benkirane",
    graduation_year: 2023,
    program_id: "genie_electrique",
    program_name: "Genie Electrique",
    current_role: "Technicien Eolien Senior",
    current_role_en: "Senior Wind Turbine Technician",
    company: "Nareva Holding",
    location: "Tanger",
    salary_range: "10000-14000 MAD",
    story_fr: "Monter a 100 metres de hauteur pour reparer une eolienne, ca fait partie de mon quotidien. Chez Nareva, je maintiens les turbines du parc eolien de Khalladi pres de Tanger. C'est physique et technique. Depuis ma formation en continu, je maitrise les systemes Siemens Gamesa et Vestas.",
    story_en: "Climbing 100 meters high to repair a wind turbine is part of my daily routine. At Nareva, I maintain turbines at the Khalladi wind farm near Tanger. It's physical and technical. Through continuous training, I've mastered Siemens Gamesa and Vestas systems.",
    key_achievement: "99.2% turbine availability rate across 40 turbines",
    key_achievement_fr: "Taux de disponibilite de 99,2% sur 40 turbines",
    advice_fr: "L'eolien recrute et paie bien au Maroc. Les formations constructeurs sont indispensables.",
    advice_en: "Wind energy is hiring and paying well in Morocco. Manufacturer training programs are essential.",
    tags: ["wind-energy", "renewable", "nareva", "tanger"],
    field: "energy",
    is_featured: false,
  },
  {
    id: "story_najat_tourisme",
    graduate_name: "Najat El Ouardi",
    graduation_year: 2021,
    program_id: "hotellerie_tourisme",
    program_name: "Hotellerie et Tourisme",
    current_role: "Directrice d'Hotel",
    current_role_en: "Hotel Director",
    company: "Accor (Novotel Marrakech)",
    location: "Marrakech",
    salary_range: "20000-28000 MAD",
    story_fr: "De receptionniste a directrice d'hotel en 5 ans, mon parcours est atypique. J'ai commence chez Accor comme stagiaire, puis je suis passee par tous les services : reception, restauration, evenementiel. Ma connaissance du terrain et ma maitrise de 4 langues m'ont propulsee directrice a 28 ans.",
    story_en: "From receptionist to hotel director in 5 years, my journey is atypical. I started at Accor as an intern, then rotated through every department: front desk, restaurant, events. My field knowledge and fluency in 4 languages made me director at 28.",
    key_achievement: "Youngest hotel director in Accor Morocco at age 28",
    key_achievement_fr: "Plus jeune directrice d'hotel Accor au Maroc a 28 ans",
    advice_fr: "Le tourisme offre des promotions rapides a ceux qui sont polyvalents. Les langues sont un atout majeur.",
    advice_en: "Tourism offers rapid promotions to versatile people. Languages are a major asset.",
    tags: ["tourism", "hospitality", "accor", "marrakech"],
    field: "tourism",
    is_featured: true,
  },
  {
    id: "story_hamza_ocp",
    graduate_name: "Hamza Bouhaddou",
    graduation_year: 2022,
    program_id: "genie_mecanique",
    program_name: "Genie des Procedes Industriels",
    current_role: "Ingenieur Procedes",
    current_role_en: "Process Engineer",
    company: "OCP Group",
    location: "Khouribga",
    salary_range: "15000-20000 MAD",
    story_fr: "OCP est le plus grand employeur industriel du Maroc et les opportunites sont enormes. En tant qu'ingenieur procedes dans l'usine de transformation de phosphates, j'optimise la granulation. Mon equipe a augmente le rendement de la ligne de 8% en un an. OCP finance aussi ma formation continue.",
    story_en: "OCP is Morocco's largest industrial employer and opportunities are enormous. As a process engineer at the phosphate processing plant, I optimize granulation. My team increased line yield by 8% in one year. OCP also funds my continuing education.",
    key_achievement: "Increased phosphate granulation yield by 8%, saving 4M MAD annually",
    key_achievement_fr: "Augmentation du rendement de granulation de 8%, economie de 4M MAD/an",
    advice_fr: "OCP est l'entreprise la plus stable du Maroc. Les ingenieurs y sont tres bien traites.",
    advice_en: "OCP is Morocco's most stable company. Engineers are treated very well there.",
    tags: ["ocp", "phosphate", "process-engineering", "khouribga"],
    field: "engineering",
    is_featured: false,
  },
  {
    id: "story_sara_freelance",
    graduate_name: "Sara Idrissi",
    graduation_year: 2023,
    program_id: "developpement_digital",
    program_name: "Developpement Digital",
    current_role: "Developpeuse Freelance Full Stack",
    current_role_en: "Full Stack Freelance Developer",
    company: "Independante (clients internationaux)",
    location: "Casablanca (remote)",
    salary_range: "20000-35000 MAD",
    story_fr: "Le freelance depuis le Maroc pour des clients europeens et americains, c'est possible et tres rentable. Apres 1 an en entreprise, j'ai lance mon activite sur Upwork. Avec React, Node.js et un bon niveau d'anglais, je gagne plus qu'un senior en CDI. Le cout de la vie au Maroc est un avantage enorme.",
    story_en: "Freelancing from Morocco for European and American clients is possible and very profitable. After 1 year at a company, I started on Upwork. With React, Node.js and good English, I earn more than a senior employee. Morocco's cost of living is a huge advantage.",
    key_achievement: "Top-rated freelancer on Upwork with $100K+ in earnings",
    key_achievement_fr: "Freelance top-rated sur Upwork avec 100K$+ de revenus",
    advice_fr: "Le freelance international est la meilleure option financiere pour un dev marocain. Soignez votre profil Upwork.",
    advice_en: "International freelancing is the best financial option for a Moroccan developer. Polish your Upwork profile.",
    tags: ["freelance", "remote", "upwork", "full-stack"],
    field: "technology",
    is_featured: true,
  },
  {
    id: "story_abdelhak_maintenance",
    graduate_name: "Abdelhak Moussaid",
    graduation_year: 2021,
    program_id: "electromecanique",
    program_name: "Electromecanique Industrielle",
    current_role: "Responsable Maintenance",
    current_role_en: "Maintenance Manager",
    company: "Lesieur Cristal",
    location: "Casablanca",
    salary_range: "13000-17000 MAD",
    story_fr: "La maintenance industrielle n'est pas glamour mais c'est un pilier de l'industrie marocaine. Chez Lesieur Cristal, j'ai mis en place un programme de maintenance preventive qui a reduit les pannes de 60%. Aujourd'hui, je dirige une equipe de 15 techniciens. C'est un metier d'avenir sous-estime.",
    story_en: "Industrial maintenance isn't glamorous but it's a pillar of Moroccan industry. At Lesieur Cristal, I implemented a preventive maintenance program that reduced breakdowns by 60%. Today, I lead a team of 15 technicians. It's an underrated future-proof career.",
    key_achievement: "Reduced equipment breakdowns by 60% through preventive maintenance program",
    key_achievement_fr: "Reduction de 60% des pannes par un programme de maintenance preventive",
    advice_fr: "La maintenance preventive est l'avenir. Apprenez les GMAO et la MTBF/MTTR.",
    advice_en: "Preventive maintenance is the future. Learn CMMS and MTBF/MTTR concepts.",
    tags: ["maintenance", "industrial", "lesieur", "preventive"],
    field: "engineering",
    is_featured: false,
  },
  {
    id: "story_hanae_telecom",
    graduate_name: "Hanae Rachidi",
    graduation_year: 2024,
    program_id: "genie_informatique_reseaux",
    program_name: "Genie Informatique et Reseaux",
    current_role: "Ingenieur 5G",
    current_role_en: "5G Network Engineer",
    company: "Maroc Telecom",
    location: "Rabat",
    salary_range: "12000-16000 MAD",
    story_fr: "Le deploiement de la 5G au Maroc commence et j'y participe ! Chez Maroc Telecom, je travaille sur le dimensionnement et le deploiement des stations de base 5G. C'est un domaine ou les competences sont rares et la demande explose. Mon stage PFE sur la virtualisation des reseaux m'a ouvert cette porte.",
    story_en: "5G deployment in Morocco is starting and I'm part of it! At Maroc Telecom, I work on 5G base station dimensioning and deployment. It's a field where skills are scarce and demand is exploding. My thesis on network virtualization opened this door.",
    key_achievement: "Part of the team deploying Morocco's first 50 5G base stations",
    key_achievement_fr: "Membre de l'equipe deployant les 50 premieres stations 5G du Maroc",
    advice_fr: "La 5G va creer des milliers d'emplois au Maroc. Formez-vous en reseaux et virtualisation.",
    advice_en: "5G will create thousands of jobs in Morocco. Train in networking and virtualization.",
    tags: ["5g", "telecom", "maroc-telecom", "networking"],
    field: "technology",
    is_featured: false,
  },
  {
    id: "story_taha_douane",
    graduate_name: "Taha Senhaji",
    graduation_year: 2023,
    program_id: "logistique_transport",
    program_name: "Logistique et Transport",
    current_role: "Responsable Douane",
    current_role_en: "Customs Manager",
    company: "Bollore Logistics Morocco",
    location: "Tanger",
    salary_range: "11000-15000 MAD",
    story_fr: "Le dedouanement est un metier technique qui necessite une connaissance precise du code douanier marocain. Chez Bollore, je gere les operations import/export de clients multinationaux. Chaque erreur de classification peut couter des millions. La rigueur apprise a l'IMTA est mon meilleur atout.",
    story_en: "Customs clearance is a technical profession requiring precise knowledge of Moroccan customs code. At Bollore, I manage import/export operations for multinational clients. Every classification error can cost millions. The rigor learned at IMTA is my best asset.",
    key_achievement: "Zero customs penalties in 2 years handling 500+ declarations monthly",
    key_achievement_fr: "Zero penalites douanieres en 2 ans avec 500+ declarations par mois",
    advice_fr: "La douane est un metier stable et bien paye. Apprenez le systeme BADR et les accords de libre-echange.",
    advice_en: "Customs work is stable and well-paid. Learn the BADR system and free trade agreements.",
    tags: ["customs", "logistics", "bollore", "import-export"],
    field: "logistics",
    is_featured: false,
  },
  {
    id: "story_wiam_biomedical",
    graduate_name: "Wiam Sekkat",
    graduation_year: 2024,
    program_id: "biomedical",
    program_name: "Maintenance Biomedicale",
    current_role: "Ingenieur Biomedical",
    current_role_en: "Biomedical Engineer",
    company: "Philips Healthcare Morocco",
    location: "Casablanca",
    salary_range: "12000-16000 MAD",
    story_fr: "Les hopitaux marocains investissent massivement dans l'equipement medical et ont besoin de techniciens specialises. Chez Philips, j'installe et maintiens des scanners IRM et CT dans les cliniques du Maroc. C'est un metier passionnant a l'intersection de la technologie et de la sante.",
    story_en: "Moroccan hospitals are investing heavily in medical equipment and need specialized technicians. At Philips, I install and maintain MRI and CT scanners in clinics across Morocco. It's an exciting career at the intersection of technology and healthcare.",
    key_achievement: "Installed 8 MRI systems across Morocco with 99.5% uptime",
    key_achievement_fr: "Installation de 8 systemes IRM au Maroc avec 99,5% de disponibilite",
    advice_fr: "Le biomedical est une niche en or au Maroc. Les fabricants internationaux recrutent activement.",
    advice_en: "Biomedical is a golden niche in Morocco. International manufacturers are actively recruiting.",
    tags: ["biomedical", "philips", "medical-equipment", "healthcare"],
    field: "healthcare",
    is_featured: false,
  },
  {
    id: "story_mehdi_data_eng",
    graduate_name: "Mehdi Benabdallah",
    graduation_year: 2023,
    program_id: "data_science_ia",
    program_name: "Data Science et Intelligence Artificielle",
    current_role: "Data Engineer",
    current_role_en: "Data Engineer",
    company: "Lydec",
    location: "Casablanca",
    salary_range: "14000-18000 MAD",
    story_fr: "Lydec gere l'eau et l'electricite de Casablanca pour 4 millions d'habitants. En tant que data engineer, j'ai construit le pipeline de donnees qui detecte les fuites d'eau en temps reel via des capteurs IoT. Notre systeme a reduit les pertes d'eau de 12%. La data au service du service public, c'est gratifiant.",
    story_en: "Lydec manages water and electricity for 4 million people in Casablanca. As a data engineer, I built the data pipeline that detects water leaks in real-time via IoT sensors. Our system reduced water losses by 12%. Data serving public utilities is gratifying.",
    key_achievement: "Built real-time leak detection system, reducing water losses by 12%",
    key_achievement_fr: "Construction d'un systeme de detection de fuites en temps reel, reduction des pertes de 12%",
    advice_fr: "Le data engineering est plus demande que la data science au Maroc. Apprenez Spark et Airflow.",
    advice_en: "Data engineering is more in demand than data science in Morocco. Learn Spark and Airflow.",
    tags: ["data-engineering", "iot", "lydec", "utilities"],
    field: "technology",
    is_featured: true,
  },
  {
    id: "story_noura_entrepreneuriat",
    graduate_name: "Noura Benamour",
    graduation_year: 2020,
    program_id: "commerce_marketing",
    program_name: "Commerce et Marketing",
    current_role: "Fondatrice & CEO",
    current_role_en: "Founder & CEO",
    company: "Noura Cosmetics (marque propre)",
    location: "Casablanca",
    salary_range: "25000-40000 MAD",
    story_fr: "Apres 3 ans en marketing chez L'Oreal Maroc, j'ai lance ma propre marque de cosmetiques naturels. Avec les huiles d'argan et de figue de Barbarie du Maroc, j'exporte vers la France et les Emirats. Mon chiffre d'affaires a depasse 5M MAD en 2 ans. L'IMTA m'a appris le business, le terrain m'a appris le reste.",
    story_en: "After 3 years in marketing at L'Oreal Morocco, I launched my own natural cosmetics brand. Using Moroccan argan and prickly pear oils, I export to France and the UAE. Revenue exceeded 5M MAD in 2 years. IMTA taught me business, the field taught me the rest.",
    key_achievement: "Built cosmetics brand to 5M MAD revenue in 2 years, exporting to 3 countries",
    key_achievement_fr: "Marque cosmetique atteignant 5M MAD de CA en 2 ans, export vers 3 pays",
    advice_fr: "Le Made in Morocco a une valeur internationale. Osez entreprendre avec des produits locaux.",
    advice_en: "Made in Morocco has international value. Dare to build businesses with local products.",
    tags: ["entrepreneurship", "cosmetics", "export", "women-entrepreneurship"],
    field: "business",
    is_featured: true,
  },
  {
    id: "story_youssef_devops_oujda",
    graduate_name: "Youssef Benslimane",
    graduation_year: 2023,
    program_id: "genie_informatique_reseaux",
    program_name: "Genie Informatique et Reseaux",
    current_role: "Ingenieur DevOps",
    current_role_en: "DevOps Engineer",
    company: "Atos Morocco",
    location: "Oujda (remote depuis)",
    salary_range: "13000-17000 MAD",
    story_fr: "On peut travailler pour une multinationale depuis Oujda ! Chez Atos, je travaille a distance sur les pipelines CI/CD de clients bancaires. Le teletravail a change la donne pour les ingenieurs des villes secondaires. Mes certifications Kubernetes et AWS m'ont permis de decrocher ce poste sans demenager.",
    story_en: "You can work for a multinational from Oujda! At Atos, I work remotely on CI/CD pipelines for banking clients. Remote work has been a game-changer for engineers in secondary cities. My Kubernetes and AWS certifications helped me land this job without relocating.",
    key_achievement: "Manages CI/CD pipelines for 3 major banking clients remotely from Oujda",
    key_achievement_fr: "Gestion des pipelines CI/CD de 3 clients bancaires majeurs a distance depuis Oujda",
    advice_fr: "Le teletravail libere les ingenieurs de l'axe Casablanca-Rabat. Les certifications cloud sont votre passeport.",
    advice_en: "Remote work frees engineers from the Casablanca-Rabat axis. Cloud certifications are your passport.",
    tags: ["devops", "remote-work", "oujda", "atos"],
    field: "technology",
    is_featured: false,
  },
  {
    id: "story_ghita_scm",
    graduate_name: "Ghita El Moutawakil",
    graduation_year: 2022,
    program_id: "logistique_transport",
    program_name: "Logistique et Supply Chain",
    current_role: "Supply Chain Analyst",
    current_role_en: "Supply Chain Analyst",
    company: "OCP Group",
    location: "Jorf Lasfar",
    salary_range: "14000-18000 MAD",
    story_fr: "La supply chain de OCP est l'une des plus complexes du Maroc : mines, usines, ports, export mondial. En tant qu'analyste, j'optimise les flux logistiques entre Khouribga et Jorf Lasfar. Mon travail a reduit les delais de livraison de 20%. C'est un metier strategique et bien remunere.",
    story_en: "OCP's supply chain is one of Morocco's most complex: mines, factories, ports, global export. As an analyst, I optimize logistics flows between Khouribga and Jorf Lasfar. My work reduced delivery times by 20%. It's a strategic and well-paid career.",
    key_achievement: "Reduced phosphate delivery times by 20% through route optimization",
    key_achievement_fr: "Reduction de 20% des delais de livraison de phosphates par l'optimisation des routes",
    advice_fr: "La supply chain est au coeur de l'industrie marocaine. Apprenez SAP MM et les Incoterms.",
    advice_en: "Supply chain is at the heart of Moroccan industry. Learn SAP MM and Incoterms.",
    tags: ["supply-chain", "ocp", "logistics", "optimization"],
    field: "logistics",
    is_featured: false,
  },
];

// ============================================================================
// INSERTION LOGIC
// ============================================================================

async function insertBatch(client, table, rows, columns, conflictCol = "id") {
  let inserted = 0;
  const batchSize = 20;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const values = [];
    const placeholders = [];
    let paramIdx = 1;

    for (const row of batch) {
      const rowPlaceholders = [];
      for (const col of columns) {
        const val = row[col];
        if (val === undefined || val === null) {
          rowPlaceholders.push("NULL");
        } else if (typeof val === "object") {
          values.push(JSON.stringify(val));
          rowPlaceholders.push(`$${paramIdx++}`);
        } else {
          values.push(val);
          rowPlaceholders.push(`$${paramIdx++}`);
        }
      }
      placeholders.push(`(${rowPlaceholders.join(", ")})`);
    }

    const conflictCols = Array.isArray(conflictCol) ? conflictCol : [conflictCol];
    const quotedColumns = columns.map(c => `"${c}"`).join(", ");
    const quotedConflict = conflictCols.map(c => `"${c}"`).join(", ");
    const query = `INSERT INTO ${table} (${quotedColumns}) VALUES ${placeholders.join(", ")} ON CONFLICT (${quotedConflict}) DO NOTHING`;
    const result = await client.query(query, values);
    inserted += result.rowCount;
  }
  return inserted;
}


async function main() {
  try {
    await client.connect();
    console.log("Connected to database.\n");

    // === Get before counts ===
    const beforeSalary = (await client.query("SELECT count(*) FROM market_salary_data")).rows[0].count;
    const beforeSkill = (await client.query("SELECT count(*) FROM skill_demand")).rows[0].count;
    const beforeStory = (await client.query("SELECT count(*) FROM success_story")).rows[0].count;

    console.log(`BEFORE counts:`);
    console.log(`  market_salary_data: ${beforeSalary}`);
    console.log(`  skill_demand: ${beforeSkill}`);
    console.log(`  success_story: ${beforeStory}`);
    console.log("");

    // === Insert market_salary_data ===
    console.log(`Inserting ${marketSalaryData.length} market_salary_data entries...`);
    const salaryRows = marketSalaryData.map(d => ({
      id: crypto.randomUUID(),
      role: d.role,
      role_fr: d.role_fr,
      field: d.field,
      region: d.region || null,
      experience_level: d.experience_level,
      salary_min: d.salary_min,
      salary_median: d.salary_median,
      salary_max: d.salary_max,
      sample_size: d.sample_size || null,
      last_updated: new Date().toISOString(),
      growth_rate: d.growth_rate || null,
      demand_score: d.demand_score || null,
      source: d.source || null,
    }));
    const salaryColumns = ["id", "role", "role_fr", "field", "region", "experience_level", "salary_min", "salary_median", "salary_max", "sample_size", "last_updated", "growth_rate", "demand_score", "source"];
    const salaryInserted = await insertBatch(client, "market_salary_data", salaryRows, salaryColumns, ["role", "region", "experience_level"]);
    console.log(`  -> Inserted: ${salaryInserted}\n`);

    // === Insert skill_demand ===
    // First, remove duplicate NULL-field entries from previous runs
    await client.query(`
      DELETE FROM skill_demand WHERE id IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY skill ORDER BY created_at ASC) as rn
          FROM skill_demand WHERE field IS NULL
        ) sub WHERE rn > 1
      )
    `);

    // Pre-check: get existing skills with NULL fields to avoid re-inserting
    const existingNullFieldSkills = (await client.query(
      "SELECT skill FROM skill_demand WHERE field IS NULL"
    )).rows.map(r => r.skill);

    const filteredSkillData = skillDemandData.filter(d => {
      if (d.field === null || d.field === undefined) {
        return !existingNullFieldSkills.includes(d.skill);
      }
      return true;
    });

    console.log(`Inserting ${filteredSkillData.length} skill_demand entries (${skillDemandData.length - filteredSkillData.length} skipped as existing NULL-field duplicates)...`);
    const skillRows = filteredSkillData.map(d => ({
      id: crypto.randomUUID(),
      skill: d.skill,
      skill_fr: d.skill_fr,
      field: d.field || null,
      category: d.category,
      demand_score: d.demand_score,
      growth_trend: d.growth_trend,
      growth_percent: d.growth_percent || null,
      job_count: d.job_count || null,
      average_salary_boost: d.average_salary_boost || null,
      competition_level: d.competition_level || null,
      time_to_learn: d.time_to_learn || null,
      resources: d.resources || null,
      related_skills: d.related_skills || null,
      last_updated: new Date().toISOString(),
    }));
    const skillColumns = ["id", "skill", "skill_fr", "field", "category", "demand_score", "growth_trend", "growth_percent", "job_count", "average_salary_boost", "competition_level", "time_to_learn", "resources", "related_skills", "last_updated"];
    const skillInserted = skillRows.length > 0 ? await insertBatch(client, "skill_demand", skillRows, skillColumns, ["skill", "field"]) : 0;
    console.log(`  -> Inserted: ${skillInserted}\n`);

    // === Insert success_story ===
    console.log(`Inserting ${successStoryData.length} success_story entries...`);
    const storyRows = successStoryData.map(d => ({
      id: d.id,
      graduate_name: d.graduate_name,
      graduation_year: d.graduation_year,
      program_id: d.program_id || null,
      program_name: d.program_name,
      current_role: d.current_role,
      current_role_en: d.current_role_en || null,
      company: d.company,
      location: d.location,
      salary_range: d.salary_range || null,
      story_fr: d.story_fr,
      story_en: d.story_en || null,
      key_achievement: d.key_achievement || null,
      key_achievement_fr: d.key_achievement_fr || null,
      advice_fr: d.advice_fr || null,
      advice_en: d.advice_en || null,
      tags: d.tags || [],
      field: d.field || null,
      is_featured: d.is_featured || false,
      is_active: true,
      sort_order: 0,
    }));
    const storyColumns = ["id", "graduate_name", "graduation_year", "program_id", "program_name", "current_role", "current_role_en", "company", "location", "salary_range", "story_fr", "story_en", "key_achievement", "key_achievement_fr", "advice_fr", "advice_en", "tags", "field", "is_featured", "is_active", "sort_order"];
    const storyInserted = await insertBatch(client, "success_story", storyRows, storyColumns);
    console.log(`  -> Inserted: ${storyInserted}\n`);

    // === Get after counts ===
    const afterSalary = (await client.query("SELECT count(*) FROM market_salary_data")).rows[0].count;
    const afterSkill = (await client.query("SELECT count(*) FROM skill_demand")).rows[0].count;
    const afterStory = (await client.query("SELECT count(*) FROM success_story")).rows[0].count;

    console.log("=".repeat(60));
    console.log("SEED SUMMARY");
    console.log("=".repeat(60));
    console.log(`market_salary_data: ${beforeSalary} -> ${afterSalary} (+${afterSalary - beforeSalary})`);
    console.log(`skill_demand:       ${beforeSkill} -> ${afterSkill} (+${afterSkill - beforeSkill})`);
    console.log(`success_story:      ${beforeStory} -> ${afterStory} (+${afterStory - beforeStory})`);
    console.log("=".repeat(60));
    console.log("\nSeed completed successfully!");

  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
