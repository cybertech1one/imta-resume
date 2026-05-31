/**
 * Normalize the legacy `field` taxonomy on interview_common_question and
 * resume_gallery to the canonical 5 program-fields + "general", and backfill
 * `program` / `sub_field` for the legacy tags that map 1:1 to an IMTA program.
 *
 * WHY: content was tagged with an inconsistent legacy taxonomy (accented vs not:
 * "génie-informatique" vs "genie-informatique"; specialties like "medecine",
 * "tourisme", "finance"). The app queries by the canonical field, so the
 * `technology` field returned ZERO rows (its content was stranded under
 * "genie-informatique"), and the gallery facet showed ~25 messy duplicate tags.
 *
 * Target: PG_TARGET_URL (local) or PG_PUBLIC_URL (prod). SSL off for localhost.
 * Run:  PG_TARGET_URL=... node scripts/normalize-content-taxonomy.mjs [--apply]
 * Without --apply it does a DRY RUN (prints what would change).
 */
import fs from "node:fs";
import pg from "pg";

const { Client } = pg;
const APPLY = process.argv.includes("--apply");

// legacy field value -> { field: canonical, program?: imta_program id (1:1 only) }
const MAP = {
	// healthcare
	healthcare: { field: "healthcare" },
	medecine: { field: "healthcare" },
	"médecine": { field: "healthcare" },
	pharmacie: { field: "healthcare" },
	// hse
	hse: { field: "hse" },
	environnement: { field: "hse" },
	// industrial (field-only where ambiguous)
	industrial: { field: "industrial" },
	"genie-mecanique": { field: "industrial" },
	"génie-mécanique": { field: "industrial" },
	architecture: { field: "industrial" },
	agriculture: { field: "industrial" },
	// industrial (1:1 program)
	"genie-electrique": { field: "industrial", program: "genie_electrique_energies" },
	"génie-électrique": { field: "industrial", program: "genie_electrique_energies" },
	"genie-civil": { field: "industrial", program: "genie_civil_btp" },
	"génie-civil": { field: "industrial", program: "genie_civil_btp" },
	"genie-industriel": { field: "industrial", program: "genie_industriel_logistique" },
	"génie-industriel": { field: "industrial", program: "genie_industriel_logistique" },
	// technology (1:1 program)
	"genie-informatique": { field: "technology", program: "genie_informatique_reseaux" },
	"génie-informatique": { field: "technology", program: "genie_informatique_reseaux" },
	// management (field-only where ambiguous)
	management: { field: "management" },
	communication: { field: "management" },
	tourisme: { field: "management" },
	design: { field: "management" },
	// management (1:1 program)
	finance: { field: "management", program: "finance_comptabilite" },
	marketing: { field: "management", program: "commerce_marketing_digital" },
	commerce: { field: "management", program: "commerce_marketing_digital" },
	"commerce-international": { field: "management", program: "commerce_marketing_digital" },
	"ressources-humaines": { field: "management", program: "ressources_humaines_droit" },
	droit: { field: "management", program: "ressources_humaines_droit" },
	logistique: { field: "management", program: "supply_chain_logistique" },
	// general
	general: { field: "general" },
	"général": { field: "general" },
};

function resolveConnection() {
	let conn = process.env.PG_TARGET_URL || process.env.PG_PUBLIC_URL;
	if (!conn) {
		const env = fs.readFileSync(new URL("../.env", import.meta.url), "utf8");
		conn = env.match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/m)?.[1];
	}
	if (!conn) throw new Error("Set PG_TARGET_URL / PG_PUBLIC_URL or have .env DATABASE_URL");
	const isLocal = /localhost|127\.0\.0\.1/.test(conn);
	return { connectionString: conn, ssl: isLocal ? false : { rejectUnauthorized: false } };
}

async function normalizeTable(c, table, fieldCol) {
	const before = await c.query(`SELECT ${fieldCol} AS f, count(*)::int n FROM ${table} GROUP BY ${fieldCol} ORDER BY 1`);
	const unmapped = before.rows.filter((r) => r.f != null && !MAP[r.f]);
	console.log(`\n[${table}] ${before.rowCount} distinct field values. Unmapped (left as-is): ${unmapped.map((r) => `${r.f}(${r.n})`).join(", ") || "none"}`);

	let fieldUpdates = 0;
	for (const [legacy, m] of Object.entries(MAP)) {
		if (APPLY) {
			const r = await c.query(`UPDATE ${table} SET ${fieldCol}=$1 WHERE ${fieldCol}=$2 AND ${fieldCol} <> $1`, [m.field, legacy]);
			fieldUpdates += r.rowCount;
		} else {
			const r = await c.query(`SELECT count(*)::int n FROM ${table} WHERE ${fieldCol}=$1 AND ${fieldCol} <> $2`, [legacy, m.field]);
			fieldUpdates += r.rows[0].n;
		}
	}

	const after = await c.query(`SELECT ${fieldCol} AS f, count(*)::int n FROM ${table} GROUP BY ${fieldCol} ORDER BY 1`);
	console.log(`[${table}] ${APPLY ? "APPLIED" : "WOULD UPDATE"} ${fieldUpdates} field rows. Now: ${after.rows.map((r) => `${r.f}(${r.n})`).join(", ")}`);
}

async function main() {
	const c = new Client(resolveConnection());
	await c.connect();
	console.log(APPLY ? "=== APPLY MODE ===" : "=== DRY RUN (pass --apply to write) ===");

	// PROGRAM BACKFILL must run BEFORE field collapse, keyed on legacy field value.
	const progPass = async (table, fieldCol, programCol) => {
		let n = 0;
		for (const [legacy, m] of Object.entries(MAP)) {
			if (!m.program) continue;
			if (APPLY) {
				const r = await c.query(
					`UPDATE ${table} SET ${programCol}=$1 WHERE ${fieldCol}=$2 AND (${programCol} IS NULL OR ${programCol}='')`,
					[m.program, legacy],
				);
				n += r.rowCount;
			} else {
				const r = await c.query(
					`SELECT count(*)::int n FROM ${table} WHERE ${fieldCol}=$1 AND (${programCol} IS NULL OR ${programCol}='')`,
					[legacy],
				);
				n += r.rows[0].n;
			}
		}
		console.log(`[${table}] ${APPLY ? "APPLIED" : "WOULD BACKFILL"} ${n} ${programCol} values (1:1 legacy->program).`);
	};

	await progPass("interview_common_question", "field", "program");
	await progPass("resume_gallery", "field", "sub_field");

	await normalizeTable(c, "interview_common_question", "field");
	await normalizeTable(c, "resume_gallery", "field");

	await c.end();
	console.log("\nDONE" + (APPLY ? "" : " (dry run — nothing written)"));
}
main().catch((e) => {
	console.error(e.message);
	process.exit(1);
});
