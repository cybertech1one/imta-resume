import pg from "pg";
const { Client } = pg;
const c = new Client("postgresql://postgres:postgres@localhost:5432/postgres");

function genId() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

await c.connect();

// 1. Seed market_salary_data
const salaries = [
	["Infirmier Polyvalent", "Infirmier Polyvalent", "healthcare", "entry", 42000, 54000, 72000, 95],
	["Infirmier Polyvalent", "Infirmier Polyvalent", "healthcare", "mid", 60000, 84000, 120000, 95],
	["Infirmier Polyvalent", "Infirmier Polyvalent", "healthcare", "senior", 96000, 144000, 216000, 90],
	["Sage-Femme", "Sage-Femme", "healthcare", "entry", 48000, 60000, 84000, 98],
	["Sage-Femme", "Sage-Femme", "healthcare", "mid", 72000, 96000, 144000, 98],
	["Aide Soignant", "Aide Soignant", "healthcare", "entry", 30000, 42000, 54000, 90],
	["Technicien HSE", "Technicien HSE", "hse", "entry", 48000, 72000, 96000, 85],
	["Technicien HSE", "Technicien HSE", "hse", "mid", 84000, 120000, 180000, 88],
	["Responsable HSE", "Responsable HSE", "hse", "senior", 180000, 264000, 400000, 92],
	["Ingenieur HSE", "Ingénieur HSE", "hse", "mid", 144000, 220000, 336000, 90],
	["Soudeur", "Soudeur", "industrial", "entry", 36000, 48000, 66000, 80],
	["Soudeur", "Soudeur", "industrial", "mid", 54000, 72000, 108000, 82],
	["Conducteur Engins", "Conducteur d'Engins", "industrial", "entry", 48000, 72000, 96000, 88],
	["Conducteur Engins", "Conducteur d'Engins", "industrial", "mid", 72000, 96000, 144000, 90],
	["Mecanicien Industriel", "Mécanicien Industriel", "industrial", "entry", 42000, 60000, 84000, 85],
	["Mecanicien Industriel", "Mécanicien Industriel", "industrial", "mid", 72000, 108000, 156000, 87],
	["Technicien Electromecanique", "Technicien Électromécanique", "industrial", "entry", 48000, 66000, 90000, 88],
	["Technicien Electromecanique", "Technicien Électromécanique", "industrial", "mid", 78000, 108000, 156000, 90],
];

let salaryCount = 0;
for (const s of salaries) {
	const existing = await c.query("SELECT id FROM market_salary_data WHERE role=$1 AND experience_level=$2", [s[0], s[3]]);
	if (existing.rows.length === 0) {
		await c.query(
			"INSERT INTO market_salary_data(id,role,role_fr,field,experience_level,salary_min,salary_median,salary_max,demand_score,last_updated) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())",
			[genId(), s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7]],
		);
		salaryCount++;
	}
}
console.log(`Salary data: inserted ${salaryCount} rows`);

// 2. Seed skill_demand
const skills = [
	["Patient Care", "Soins aux Patients", "healthcare", "technical", 95, "rising", 8, 5000],
	["Emergency Care", "Soins d'Urgence", "healthcare", "technical", 92, "rising", 12, 8000],
	["Medical Equipment", "Équipement Médical", "healthcare", "technical", 85, "stable", 3, 4000],
	["Obstetrics", "Obstétrique", "healthcare", "technical", 90, "rising", 6, 10000],
	["Risk Assessment", "Évaluation des Risques", "hse", "technical", 95, "rising", 15, 12000],
	["ISO 45001", "ISO 45001", "hse", "certification", 92, "rising", 20, 15000],
	["NEBOSH", "NEBOSH", "hse", "certification", 88, "rising", 18, 18000],
	["Safety Audits", "Audits Sécurité", "hse", "technical", 90, "stable", 5, 10000],
	["Environmental Compliance", "Conformité Environnementale", "hse", "technical", 85, "rising", 22, 8000],
	["Welding", "Soudure", "industrial", "technical", 88, "stable", 4, 6000],
	["CNC Operation", "Opération CNC", "industrial", "technical", 85, "rising", 10, 8000],
	["Hydraulic Systems", "Systèmes Hydrauliques", "industrial", "technical", 82, "stable", 3, 5000],
	["PLC Programming", "Programmation PLC", "industrial", "technical", 90, "rising", 15, 12000],
	["Preventive Maintenance", "Maintenance Préventive", "industrial", "technical", 92, "rising", 8, 7000],
	["CACES Certification", "Certification CACES", "industrial", "certification", 95, "stable", 5, 10000],
	["Communication", "Communication", null, "soft", 90, "stable", 2, 3000],
	["Teamwork", "Travail d'Équipe", null, "soft", 88, "stable", 1, 2000],
	["French", "Français", null, "language", 98, "stable", 0, 5000],
	["English", "Anglais", null, "language", 85, "rising", 10, 8000],
];

let skillCount = 0;
for (const s of skills) {
	const existing = await c.query("SELECT id FROM skill_demand WHERE skill=$1", [s[0]]);
	if (existing.rows.length === 0) {
		await c.query(
			"INSERT INTO skill_demand(id,skill,skill_fr,field,category,demand_score,growth_trend,growth_percent,average_salary_boost,last_updated) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())",
			[genId(), s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7]],
		);
		skillCount++;
	}
}
console.log(`Skill demand: inserted ${skillCount} rows`);

// 3. Seed regional_job_stats
const regions = [
	["casablanca-settat", "Casablanca-Settat", 45000, 12, 8500, '["industrial","healthcare"]', '["OCP","Renault"]', '["Welding","PLC Programming"]', 9.5, 75, 72],
	["rabat-sale-kenitra", "Rabat-Salé-Kénitra", 28000, 10, 8200, '["healthcare","hse"]', '["CHU Ibn Rochd","ONCF"]', '["Patient Care","Risk Assessment"]', 10.2, 80, 78],
	["tanger-tetouan-al-hoceima", "Tanger-Tétouan-Al Hoceïma", 22000, 18, 7800, '["industrial","hse"]', '["Renault Tanger","Tanger Med"]', '["CNC Operation","ISO 45001"]', 11.0, 65, 70],
	["marrakech-safi", "Marrakech-Safi", 15000, 8, 7000, '["healthcare","industrial"]', '["CHU Marrakech","CIM"]', '["Emergency Care","Maintenance"]', 12.5, 60, 75],
	["fes-meknes", "Fès-Meknès", 12000, 6, 6800, '["healthcare","industrial"]', '["CHU Hassan II"]', '["Patient Care","Welding"]', 13.0, 55, 68],
	["souss-massa", "Souss-Massa", 10000, 12, 7200, '["hse","industrial"]', '["IRESEN","Vivo Energy"]', '["Safety Audits","NEBOSH"]', 11.5, 58, 74],
	["oriental", "Oriental", 8000, 15, 7500, '["industrial","hse"]', '["Sonasid"]', '["Welding","HSE"]', 14.0, 50, 65],
	["beni-mellal-khenifra", "Béni Mellal-Khénifra", 5000, 5, 6500, '["industrial","healthcare"]', '["OCP Khouribga"]', '["Heavy Equipment","Patient Care"]', 15.0, 48, 62],
];

let regionCount = 0;
for (const r of regions) {
	const existing = await c.query("SELECT id FROM regional_job_stats WHERE region=$1", [r[0]]);
	if (existing.rows.length === 0) {
		await c.query(
			"INSERT INTO regional_job_stats(id,region,region_fr,total_jobs,job_growth,average_salary,top_industries,top_employers,skills_in_demand,unemployment_rate,cost_of_living,quality_of_life,last_updated) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())",
			[genId(), r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10]],
		);
		regionCount++;
	}
}
console.log(`Regional stats: inserted ${regionCount} rows`);

// 4. Seed employer_database
const employers = [
	{ name: "OCP Group", nameFr: "Groupe OCP", industry: "industrial", industryFr: "Industriel", size: "enterprise", employeeCount: 21000, headquarters: "Casablanca", locations: '["Jorf Lasfar","Safi","Khouribga"]', description: "World leader in phosphates mining and fertilizers", descriptionFr: "Leader mondial des phosphates et engrais", website: "https://www.ocpgroup.ma", fields: '["industrial","hse"]', rating: 4.2, hiringTrend: "growing" },
	{ name: "Renault Maroc", nameFr: "Renault Maroc", industry: "industrial", industryFr: "Industriel", size: "enterprise", employeeCount: 9000, headquarters: "Tanger", locations: '["Tanger Med","Casablanca"]', description: "Major automotive manufacturer in Morocco", descriptionFr: "Constructeur automobile majeur au Maroc", website: "https://www.renault.ma", fields: '["industrial"]', rating: 4.0, hiringTrend: "stable" },
	{ name: "CHU Ibn Rochd", nameFr: "CHU Ibn Rochd", industry: "healthcare", industryFr: "Santé", size: "large", employeeCount: 5000, headquarters: "Casablanca", locations: '["Casablanca"]', description: "Leading university hospital center", descriptionFr: "Centre hospitalier universitaire de référence", website: "https://www.chuibnrochd.ma", fields: '["healthcare"]', rating: 3.8, hiringTrend: "growing" },
	{ name: "Managem Group", nameFr: "Groupe Managem", industry: "industrial", industryFr: "Industriel", size: "large", employeeCount: 7500, headquarters: "Casablanca", locations: '["Marrakech","Ouarzazate","Guelmim"]', description: "Mining and hydrometallurgy leader", descriptionFr: "Leader dans les mines et l'hydrométallurgie", website: "https://www.managemgroup.com", fields: '["industrial","hse"]', rating: 4.1, hiringTrend: "growing" },
	{ name: "ONCF", nameFr: "ONCF", industry: "industrial", industryFr: "Industriel", size: "enterprise", employeeCount: 8000, headquarters: "Rabat", locations: '["Nationwide"]', description: "National railway operator", descriptionFr: "Office national des chemins de fer", website: "https://www.oncf.ma", fields: '["industrial","hse"]', rating: 3.9, hiringTrend: "stable" },
	{ name: "IRESEN", nameFr: "IRESEN", industry: "hse", industryFr: "HSE", size: "small", employeeCount: 200, headquarters: "Rabat", locations: '["Rabat","Ben Guerir"]', description: "Institute for research in solar energy and new energies", descriptionFr: "Institut de recherche en énergie solaire et énergies nouvelles", website: "https://www.iresen.org", fields: '["hse","industrial"]', rating: 4.5, hiringTrend: "growing" },
	{ name: "Vivo Energy Maroc", nameFr: "Vivo Energy Maroc", industry: "hse", industryFr: "HSE", size: "large", employeeCount: 1200, headquarters: "Casablanca", locations: '["Nationwide"]', description: "Fuel distribution with HSE excellence", descriptionFr: "Distribution de carburant avec excellence HSE", website: "https://www.vivoenergy.com", fields: '["hse","industrial"]', rating: 4.0, hiringTrend: "stable" },
	{ name: "Lydec", nameFr: "Lydec", industry: "industrial", industryFr: "Industriel", size: "large", employeeCount: 3500, headquarters: "Casablanca", locations: '["Grand Casablanca"]', description: "Utility services - water and electricity distribution", descriptionFr: "Services publics - distribution eau et électricité", website: "https://www.lydec.ma", fields: '["industrial","hse"]', rating: 3.7, hiringTrend: "stable" },
];

let employerCount = 0;
for (const e of employers) {
	const existing = await c.query("SELECT id FROM employer_database WHERE name=$1", [e.name]);
	if (existing.rows.length === 0) {
		await c.query(
			`INSERT INTO employer_database(id,name,name_fr,industry,industry_fr,size,employee_count,headquarters,locations,description,description_fr,website,fields,rating,hiring_trend,is_active,is_verified,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,true,true,NOW(),NOW())`,
			[genId(), e.name, e.nameFr, e.industry, e.industryFr, e.size, e.employeeCount, e.headquarters, e.locations, e.description, e.descriptionFr, e.website, e.fields, e.rating, e.hiringTrend],
		);
		employerCount++;
	}
}
console.log(`Employers: inserted ${employerCount} rows`);

// Verify
for (const t of ["market_salary_data", "skill_demand", "regional_job_stats", "employer_database"]) {
	const r = await c.query(`SELECT count(*) FROM ${t}`);
	console.log(`${t}: ${r.rows[0].count} total rows`);
}

await c.end();
console.log("\nDone! Market intelligence data seeded successfully.");
