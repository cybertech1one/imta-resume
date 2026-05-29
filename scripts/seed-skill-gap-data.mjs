/**
 * Seed Skill Gap Market Data Tables
 * Seeds: job_demand_indicator, industry_trend, skills_heatmap
 *
 * Aligned with IMTA Morocco fields: healthcare, industrial, hse
 * All skill names in French (primary) — used for market demand display.
 *
 * Usage: node scripts/seed-skill-gap-data.mjs
 *
 * Idempotent: uses ON CONFLICT DO NOTHING on unique constraints.
 */

import pg from "pg";

const { Client } = pg;
const DATABASE_URL =
	process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/postgres";

// ============================================================================
// JOB DEMAND INDICATORS
// skill + industry must be unique (see schema constraint)
// ============================================================================

const JOB_DEMAND_INDICATORS = [
	// ── HEALTHCARE ──────────────────────────────────────────────────────────────
	{ skill: "Soins infirmiers", industry: "healthcare", demand_score: 95, growth_rate: 12, total_jobs: 8500, avg_salary_premium: 15, hotness: "fire" },
	{ skill: "Obstétrique", industry: "healthcare", demand_score: 92, growth_rate: 10, total_jobs: 3200, avg_salary_premium: 18, hotness: "fire" },
	{ skill: "Aide soignante", industry: "healthcare", demand_score: 88, growth_rate: 8, total_jobs: 12000, avg_salary_premium: 5, hotness: "hot" },
	{ skill: "Soins d'urgence", industry: "healthcare", demand_score: 85, growth_rate: 15, total_jobs: 2800, avg_salary_premium: 20, hotness: "hot" },
	{ skill: "Pharmacie clinique", industry: "healthcare", demand_score: 80, growth_rate: 9, total_jobs: 1500, avg_salary_premium: 22, hotness: "hot" },
	{ skill: "Imagerie médicale", industry: "healthcare", demand_score: 78, growth_rate: 14, total_jobs: 900, avg_salary_premium: 25, hotness: "hot" },
	{ skill: "Kinésithérapie", industry: "healthcare", demand_score: 75, growth_rate: 11, total_jobs: 1200, avg_salary_premium: 20, hotness: "warm" },
	{ skill: "Anesthésie", industry: "healthcare", demand_score: 72, growth_rate: 7, total_jobs: 600, avg_salary_premium: 30, hotness: "warm" },
	{ skill: "Pédiatrie", industry: "healthcare", demand_score: 70, growth_rate: 8, total_jobs: 2200, avg_salary_premium: 15, hotness: "warm" },
	{ skill: "Gestion des dossiers médicaux", industry: "healthcare", demand_score: 60, growth_rate: 5, total_jobs: 1800, avg_salary_premium: 8, hotness: "warm" },

	// ── INDUSTRIAL ───────────────────────────────────────────────────────────────
	{ skill: "Soudage", industry: "industrial", demand_score: 91, growth_rate: 9, total_jobs: 15000, avg_salary_premium: 12, hotness: "fire" },
	{ skill: "Conduite d'engins", industry: "industrial", demand_score: 89, growth_rate: 7, total_jobs: 9000, avg_salary_premium: 10, hotness: "fire" },
	{ skill: "Électricité industrielle", industry: "industrial", demand_score: 87, growth_rate: 11, total_jobs: 11000, avg_salary_premium: 14, hotness: "hot" },
	{ skill: "Maintenance industrielle", industry: "industrial", demand_score: 85, growth_rate: 10, total_jobs: 13000, avg_salary_premium: 13, hotness: "hot" },
	{ skill: "Tuyauterie industrielle", industry: "industrial", demand_score: 82, growth_rate: 8, total_jobs: 7500, avg_salary_premium: 11, hotness: "hot" },
	{ skill: "Automatismes industriels", industry: "industrial", demand_score: 80, growth_rate: 13, total_jobs: 5500, avg_salary_premium: 18, hotness: "hot" },
	{ skill: "Chaudronnerie", industry: "industrial", demand_score: 75, growth_rate: 5, total_jobs: 6000, avg_salary_premium: 9, hotness: "warm" },
	{ skill: "Logistique et manutention", industry: "industrial", demand_score: 72, growth_rate: 6, total_jobs: 18000, avg_salary_premium: 5, hotness: "warm" },
	{ skill: "Instrumentation", industry: "industrial", demand_score: 70, growth_rate: 9, total_jobs: 4200, avg_salary_premium: 16, hotness: "warm" },
	{ skill: "Contrôle qualité industriel", industry: "industrial", demand_score: 68, growth_rate: 7, total_jobs: 5000, avg_salary_premium: 12, hotness: "warm" },

	// ── HSE ───────────────────────────────────────────────────────────────────────
	{ skill: "Gestion des risques HSE", industry: "hse", demand_score: 93, growth_rate: 14, total_jobs: 4500, avg_salary_premium: 22, hotness: "fire" },
	{ skill: "Audit sécurité", industry: "hse", demand_score: 88, growth_rate: 12, total_jobs: 3200, avg_salary_premium: 20, hotness: "fire" },
	{ skill: "Plan d'urgence et évacuation", industry: "hse", demand_score: 84, growth_rate: 10, total_jobs: 2800, avg_salary_premium: 18, hotness: "hot" },
	{ skill: "Conformité réglementaire", industry: "hse", demand_score: 82, growth_rate: 9, total_jobs: 3500, avg_salary_premium: 16, hotness: "hot" },
	{ skill: "ISO 45001", industry: "hse", demand_score: 80, growth_rate: 15, total_jobs: 2200, avg_salary_premium: 25, hotness: "hot" },
	{ skill: "Enquête accidents", industry: "hse", demand_score: 76, growth_rate: 8, total_jobs: 2000, avg_salary_premium: 15, hotness: "warm" },
	{ skill: "Formation sécurité", industry: "hse", demand_score: 74, growth_rate: 7, total_jobs: 2500, avg_salary_premium: 12, hotness: "warm" },
	{ skill: "Gestion environnementale", industry: "hse", demand_score: 70, growth_rate: 11, total_jobs: 1800, avg_salary_premium: 18, hotness: "warm" },
	{ skill: "Permis de travail", industry: "hse", demand_score: 68, growth_rate: 6, total_jobs: 1500, avg_salary_premium: 10, hotness: "warm" },
	{ skill: "EPI et équipements de protection", industry: "hse", demand_score: 65, growth_rate: 5, total_jobs: 1200, avg_salary_premium: 8, hotness: "cold" },

	// ── TECH (supporting cross-field digital skills) ─────────────────────────────
	{ skill: "Informatique de base", industry: "tech", demand_score: 78, growth_rate: 8, total_jobs: 25000, avg_salary_premium: 10, hotness: "hot" },
	{ skill: "Logiciels de gestion (ERP)", industry: "tech", demand_score: 72, growth_rate: 12, total_jobs: 8000, avg_salary_premium: 15, hotness: "warm" },
];

// ============================================================================
// INDUSTRY TRENDS
// industry must be unique
// ============================================================================

const INDUSTRY_TRENDS = [
	{
		industry: "healthcare",
		current_demand: 88,
		change_percent: 11,
		trend: "up",
		open_positions: 28000,
		avg_time_to_hire: 25,
		competition_level: "medium",
	},
	{
		industry: "industrial",
		current_demand: 82,
		change_percent: 8,
		trend: "up",
		open_positions: 45000,
		avg_time_to_hire: 18,
		competition_level: "medium",
	},
	{
		industry: "hse",
		current_demand: 85,
		change_percent: 13,
		trend: "up",
		open_positions: 12000,
		avg_time_to_hire: 22,
		competition_level: "low",
	},
	{
		industry: "tech",
		current_demand: 90,
		change_percent: 18,
		trend: "up",
		open_positions: 35000,
		avg_time_to_hire: 30,
		competition_level: "high",
	},
	{
		industry: "automotive",
		current_demand: 75,
		change_percent: 5,
		trend: "stable",
		open_positions: 18000,
		avg_time_to_hire: 20,
		competition_level: "medium",
	},
	{
		industry: "services",
		current_demand: 70,
		change_percent: 4,
		trend: "stable",
		open_positions: 60000,
		avg_time_to_hire: 15,
		competition_level: "high",
	},
];

// ============================================================================
// SKILLS HEATMAP
// skill must be unique; industries is a JSONB map of industry→score (0-100)
// ============================================================================

const SKILLS_HEATMAP = [
	// Healthcare-dominant skills
	{
		skill: "Soins infirmiers",
		industries: { healthcare: 95, industrial: 10, hse: 15, tech: 5, automotive: 5, services: 20 },
		overall_demand: 85,
		trend: "rising",
	},
	{
		skill: "Obstétrique",
		industries: { healthcare: 92, industrial: 0, hse: 0, tech: 0, automotive: 0, services: 5 },
		overall_demand: 80,
		trend: "rising",
	},
	{
		skill: "Aide soignante",
		industries: { healthcare: 88, industrial: 5, hse: 5, tech: 0, automotive: 0, services: 15 },
		overall_demand: 75,
		trend: "stable",
	},
	{
		skill: "Soins d'urgence",
		industries: { healthcare: 85, industrial: 20, hse: 30, tech: 0, automotive: 10, services: 10 },
		overall_demand: 72,
		trend: "rising",
	},
	{
		skill: "Kinésithérapie",
		industries: { healthcare: 75, industrial: 15, hse: 20, tech: 0, automotive: 10, services: 25 },
		overall_demand: 65,
		trend: "stable",
	},

	// Industrial-dominant skills
	{
		skill: "Soudage",
		industries: { healthcare: 0, industrial: 91, hse: 25, tech: 5, automotive: 85, services: 5 },
		overall_demand: 82,
		trend: "stable",
	},
	{
		skill: "Conduite d'engins",
		industries: { healthcare: 0, industrial: 89, hse: 30, tech: 0, automotive: 60, services: 10 },
		overall_demand: 78,
		trend: "stable",
	},
	{
		skill: "Électricité industrielle",
		industries: { healthcare: 10, industrial: 87, hse: 40, tech: 55, automotive: 70, services: 20 },
		overall_demand: 80,
		trend: "rising",
	},
	{
		skill: "Maintenance industrielle",
		industries: { healthcare: 5, industrial: 85, hse: 45, tech: 30, automotive: 75, services: 15 },
		overall_demand: 78,
		trend: "rising",
	},
	{
		skill: "Automatismes industriels",
		industries: { healthcare: 5, industrial: 80, hse: 30, tech: 65, automotive: 80, services: 10 },
		overall_demand: 76,
		trend: "rising",
	},
	{
		skill: "Logistique et manutention",
		industries: { healthcare: 20, industrial: 72, hse: 35, tech: 15, automotive: 65, services: 70 },
		overall_demand: 68,
		trend: "stable",
	},

	// HSE-dominant skills
	{
		skill: "Gestion des risques HSE",
		industries: { healthcare: 60, industrial: 85, hse: 93, tech: 30, automotive: 75, services: 40 },
		overall_demand: 84,
		trend: "rising",
	},
	{
		skill: "Audit sécurité",
		industries: { healthcare: 55, industrial: 80, hse: 88, tech: 25, automotive: 70, services: 35 },
		overall_demand: 78,
		trend: "rising",
	},
	{
		skill: "ISO 45001",
		industries: { healthcare: 40, industrial: 75, hse: 80, tech: 30, automotive: 65, services: 30 },
		overall_demand: 72,
		trend: "rising",
	},
	{
		skill: "Plan d'urgence et évacuation",
		industries: { healthcare: 70, industrial: 78, hse: 84, tech: 20, automotive: 60, services: 50 },
		overall_demand: 74,
		trend: "stable",
	},
	{
		skill: "Formation sécurité",
		industries: { healthcare: 60, industrial: 75, hse: 74, tech: 20, automotive: 65, services: 45 },
		overall_demand: 68,
		trend: "stable",
	},

	// Cross-field skills
	{
		skill: "Communication professionnelle",
		industries: { healthcare: 80, industrial: 65, hse: 70, tech: 75, automotive: 60, services: 90 },
		overall_demand: 74,
		trend: "stable",
	},
	{
		skill: "Travail en équipe",
		industries: { healthcare: 85, industrial: 75, hse: 80, tech: 80, automotive: 75, services: 85 },
		overall_demand: 78,
		trend: "stable",
	},
	{
		skill: "Informatique de base",
		industries: { healthcare: 70, industrial: 60, hse: 65, tech: 78, automotive: 55, services: 75 },
		overall_demand: 70,
		trend: "rising",
	},
	{
		skill: "Français professionnel",
		industries: { healthcare: 75, industrial: 60, hse: 65, tech: 70, automotive: 55, services: 80 },
		overall_demand: 68,
		trend: "stable",
	},
	{
		skill: "Rédaction de rapports",
		industries: { healthcare: 65, industrial: 55, hse: 70, tech: 65, automotive: 50, services: 70 },
		overall_demand: 62,
		trend: "stable",
	},
];

// ============================================================================
// MAIN
// ============================================================================

async function main() {
	const client = new Client({ connectionString: DATABASE_URL });
	await client.connect();
	console.log("Connected to PostgreSQL:", DATABASE_URL.replace(/:[^:@]+@/, ":***@"));

	try {
		// ── job_demand_indicator ────────────────────────────────────────────────
		console.log("\nSeeding job_demand_indicator...");
		let jdiInserted = 0;
		for (const row of JOB_DEMAND_INDICATORS) {
			const res = await client.query(
				`INSERT INTO job_demand_indicator (id, skill, industry, demand_score, growth_rate, total_jobs, avg_salary_premium, hotness, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2::insights_industry, $3, $4, $5, $6, $7::insights_hotness, NOW(), NOW())
         ON CONFLICT (skill, industry) DO NOTHING`,
				[row.skill, row.industry, row.demand_score, row.growth_rate, row.total_jobs, row.avg_salary_premium, row.hotness],
			);
			jdiInserted += res.rowCount ?? 0;
		}
		const jdiTotal = (await client.query("SELECT COUNT(*) FROM job_demand_indicator")).rows[0].count;
		console.log(`  Inserted ${jdiInserted} new rows. Total: ${jdiTotal}`);

		// ── industry_trend ──────────────────────────────────────────────────────
		console.log("\nSeeding industry_trend...");
		let itInserted = 0;
		for (const row of INDUSTRY_TRENDS) {
			const res = await client.query(
				`INSERT INTO industry_trend (id, industry, current_demand, change_percent, trend, open_positions, avg_time_to_hire, competition_level, created_at, updated_at)
         VALUES (gen_random_uuid(), $1::insights_industry, $2, $3, $4::insights_trend, $5, $6, $7::insights_competition, NOW(), NOW())
         ON CONFLICT (industry) DO NOTHING`,
				[row.industry, row.current_demand, row.change_percent, row.trend, row.open_positions, row.avg_time_to_hire, row.competition_level],
			);
			itInserted += res.rowCount ?? 0;
		}
		const itTotal = (await client.query("SELECT COUNT(*) FROM industry_trend")).rows[0].count;
		console.log(`  Inserted ${itInserted} new rows. Total: ${itTotal}`);

		// ── skills_heatmap ──────────────────────────────────────────────────────
		console.log("\nSeeding skills_heatmap...");
		let shInserted = 0;
		for (const row of SKILLS_HEATMAP) {
			const res = await client.query(
				`INSERT INTO skills_heatmap (id, skill, industries, overall_demand, trend, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2::jsonb, $3, $4::insights_skill_trend, NOW(), NOW())
         ON CONFLICT (skill) DO NOTHING`,
				[row.skill, JSON.stringify(row.industries), row.overall_demand, row.trend],
			);
			shInserted += res.rowCount ?? 0;
		}
		const shTotal = (await client.query("SELECT COUNT(*) FROM skills_heatmap")).rows[0].count;
		console.log(`  Inserted ${shInserted} new rows. Total: ${shTotal}`);

		console.log("\nDone. Summary:");
		console.log(`  job_demand_indicator: ${jdiTotal} rows`);
		console.log(`  industry_trend: ${itTotal} rows`);
		console.log(`  skills_heatmap: ${shTotal} rows`);
	} finally {
		await client.end();
	}
}

main().catch((err) => {
	console.error("Seed failed:", err.message);
	process.exit(1);
});
