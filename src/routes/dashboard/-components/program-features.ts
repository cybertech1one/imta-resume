import type { ImtaProgram, InterviewField } from "@/schema/interview";

// Canonical program -> field map. Kept exhaustive over `ImtaProgram` (the enum
// in src/schema/interview) which mirrors the production `imta_program` table
// (33 active programs across 5 fields) plus retained legacy ids. If a new
// program id is added to the enum, TypeScript will force a new entry here.
const PROGRAM_TO_FIELD: Record<ImtaProgram, InterviewField> = {
	// Healthcare
	sage_femme: "healthcare",
	infirmier_polyvalent: "healthcare",
	aide_soignant: "healthcare",
	infirmier_auxiliaire: "healthcare",
	auxiliaire_puericulture: "healthcare",
	genie_biomedical: "healthcare",
	sciences_infirmieres_sante: "healthcare",
	technicien_anesthesie: "healthcare",
	technicien_laboratoire: "healthcare",
	// HSE
	hse_specialist: "hse",
	hse_advanced: "hse",
	// Industrial
	conducteur_engins: "industrial",
	mecanique_engins: "industrial",
	tourneur_industriel: "industrial",
	cariste: "industrial",
	electromecanique: "industrial",
	soudure: "industrial",
	maintenance_industrielle: "industrial",
	maintenance_industrielle_avancee: "industrial",
	automatique_informatique_industrielle: "industrial",
	energies_renouvelables_dd: "industrial",
	genie_civil_btp: "industrial",
	genie_electrique_energies: "industrial",
	genie_industriel_logistique: "industrial",
	genie_procedes_environnement: "industrial",
	qualite_amelioration_continue: "industrial",
	technicien_froid: "industrial",
	// Management
	commerce_marketing_digital: "management",
	finance_comptabilite: "management",
	management_projets_industriels: "management",
	ressources_humaines_droit: "management",
	supply_chain_logistique: "management",
	// Technology
	cybersecurite_confiance: "technology",
	data_science_ia: "technology",
	genie_informatique_reseaux: "technology",
	telecommunications_reseaux: "technology",
	// Other/Custom
	other: "general",
};

// Routes hidden per field. The streamlined "industrial" experience hides
// white-collar tooling (LinkedIn, networking, ATS, AI writer, etc.). All other
// fields — healthcare, hse, management, technology and general — get the full
// experience. Kept exhaustive over `InterviewField`: adding a field to the enum
// forces an entry here, so no field silently falls through to a broken state.
const HIDDEN_ROUTES_BY_FIELD: Record<InterviewField, readonly string[]> = {
	industrial: [
		"/dashboard/networking",
		"/dashboard/linkedin",
		"/dashboard/tools/ai-writer",
		"/dashboard/tools/keywords",
		"/dashboard/tools/elevator-pitch",
		"/dashboard/tools/ats-checker",
		"/dashboard/resumes/scoring",
		"/dashboard/resumes/experience-optimizer",
		"/dashboard/career/quiz",
		"/dashboard/career/roadmap",
		"/dashboard/career/coaching",
		"/dashboard/interview/mock-ai",
		"/dashboard/interview/question-bank",
		"/dashboard/interview/notes",
		"/dashboard/interview/scheduler",
		"/dashboard/jobs/recommendations",
	],
	healthcare: [],
	hse: [],
	management: [],
	technology: [],
	general: [],
};

export function getProgramField(program: string | null | undefined): InterviewField {
	if (!program) return "general";
	return PROGRAM_TO_FIELD[program as ImtaProgram] ?? "general";
}

export function getHiddenRoutes(program: string | null | undefined): readonly string[] {
	const field = getProgramField(program);
	return HIDDEN_ROUTES_BY_FIELD[field];
}

export function isRouteHidden(program: string | null | undefined, route: string): boolean {
	const hiddenRoutes = getHiddenRoutes(program);
	return hiddenRoutes.some((hidden) => route === hidden || route.startsWith(`${hidden}/`));
}
