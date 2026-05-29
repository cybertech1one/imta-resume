import type { ImtaProgram, InterviewField } from "@/schema/interview";

const PROGRAM_TO_FIELD: Record<ImtaProgram, InterviewField> = {
	sage_femme: "healthcare",
	infirmier_polyvalent: "healthcare",
	aide_soignant: "healthcare",
	infirmier_auxiliaire: "healthcare",
	conducteur_engins: "industrial",
	mecanique_engins: "industrial",
	tourneur_industriel: "industrial",
	cariste: "industrial",
	electromecanique: "industrial",
	soudure: "industrial",
	hse_specialist: "hse",
	other: "general",
};

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
