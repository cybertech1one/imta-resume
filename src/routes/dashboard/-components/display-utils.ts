export function formatFieldName(field: string): string {
	const map: Record<string, string> = {
		"genie-informatique": "Génie Informatique",
		"genie-civil": "Génie Civil",
		"genie-electrique": "Génie Électrique",
		"genie-mecanique": "Génie Mécanique",
		"genie-industriel": "Génie Industriel",
		logistique: "Logistique",
		management: "Management",
		commerce: "Commerce",
		finance: "Finance",
		marketing: "Marketing",
		"ressources-humaines": "Ressources Humaines",
		droit: "Droit",
		medecine: "Médecine",
		pharmacie: "Pharmacie",
		architecture: "Architecture",
		design: "Design",
		communication: "Communication",
		journalisme: "Journalisme",
		tourisme: "Tourisme",
		agriculture: "Agriculture",
		environnement: "Environnement",
		general: "Général",
		healthcare: "Santé",
		industrial: "Industrie",
		hse: "HSE",
		tech: "Tech / IT",
		automotive: "Automobile",
		services: "Services",
		technology: "Technologie",
	};
	return (
		map[field] ||
		field
			.split("-")
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ")
	);
}

export function formatDifficulty(difficulty: string): string {
	const map: Record<string, string> = {
		beginner: "Débutant",
		intermediate: "Intermédiaire",
		advanced: "Avancé",
		easy: "Facile",
		medium: "Moyen",
		hard: "Difficile",
	};
	return map[difficulty] || difficulty;
}

/**
 * Humanize a raw machine key (snake/kebab case) into a readable, capitalized string.
 * Used as a safe fallback when no explicit French label exists for a value.
 */
function humanizeKey(value: string): string {
	return value
		.split(/[_-]/)
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

/**
 * French display labels for user_activity.activity_type values.
 * Covers values stored by the activity tracking service; unknown values
 * fall back to a humanized version so raw keys never reach the UI.
 */
const ACTIVITY_ACTION_LABELS: Record<string, string> = {
	feature_used: "Fonctionnalité utilisée",
	login: "Connexion",
	logout: "Déconnexion",
	signup: "Inscription",
	ai_used: "IA utilisée",
	resume_created: "CV créé",
	resume_updated: "CV mis à jour",
	resume_deleted: "CV supprimé",
	resume_downloaded: "CV téléchargé",
	resume_viewed: "CV consulté",
	job_application_created: "Candidature ajoutée",
	job_application_updated: "Candidature mise à jour",
	job_application_status_changed: "Statut de candidature modifié",
	interview_scheduled: "Entretien planifié",
	interview_completed: "Entretien terminé",
	interview_practice_started: "Entraînement commencé",
	interview_practice_completed: "Entraînement terminé",
	skill_added: "Compétence ajoutée",
	skill_updated: "Compétence mise à jour",
	goal_created: "Objectif créé",
	goal_completed: "Objectif atteint",
	contact_added: "Contact ajouté",
	training_started: "Formation commencée",
	training_completed: "Formation terminée",
	deadline_created: "Échéance créée",
	deadline_completed: "Échéance terminée",
	quiz_completed: "Quiz terminé",
	assessment_completed: "Évaluation terminée",
	mentor_selected: "Mentor sélectionné",
	mentor_chat: "Discussion avec le mentor",
	profile_updated: "Profil mis à jour",
};

/**
 * Returns the French label for a user_activity activity_type, falling back
 * to a humanized version of the raw key.
 */
export function formatActivityAction(action: string | null | undefined): string {
	if (!action) return "";
	return ACTIVITY_ACTION_LABELS[action] || humanizeKey(action);
}

/**
 * French display labels for user_activity.category values.
 */
const ACTIVITY_CATEGORY_LABELS: Record<string, string> = {
	resume: "CV",
	cv: "CV",
	job: "Emploi",
	job_application: "Candidature",
	application: "Candidature",
	interview: "Entretien",
	skill: "Compétence",
	skills: "Compétences",
	goal: "Objectif",
	goals: "Objectifs",
	career: "Carrière",
	networking: "Réseautage",
	contact: "Contact",
	training: "Formation",
	learning: "Apprentissage",
	deadline: "Échéance",
	ai: "Intelligence artificielle",
	ai_mentor: "Mentor IA",
	mentor: "Mentor",
	quiz: "Quiz",
	assessment: "Évaluation",
	profile: "Profil",
	account: "Compte",
	feature: "Fonctionnalité",
	general: "Général",
	test: "Test",
};

/**
 * Returns the French label for a user_activity category, falling back
 * to a humanized version of the raw key.
 */
export function formatActivityCategory(category: string | null | undefined): string {
	if (!category) return "";
	return ACTIVITY_CATEGORY_LABELS[category] || humanizeKey(category);
}

/**
 * French display labels for AI mentor expertise tags.
 * Keys are lowercased so matching is case-insensitive; underlying values are
 * preserved and only translated for display. Unknown tags fall back to a
 * humanized version of the raw tag.
 */
const EXPERTISE_TAG_LABELS: Record<string, string> = {
	// Healthcare
	nursing: "Soins infirmiers",
	"patient care": "Soins aux patients",
	"healthcare management": "Gestion des soins de santé",
	"clinical skills": "Compétences cliniques",
	"medical certifications": "Certifications médicales",
	// HSE / Safety
	"safety audits": "Audits de sécurité",
	"iso 45001": "ISO 45001",
	"risk assessment": "Évaluation des risques",
	"environmental compliance": "Conformité environnementale",
	nebosh: "NEBOSH",
	safety: "Sécurité",
	hse: "QHSE",
	// Industrial / Mechanical
	mechanics: "Mécanique",
	welding: "Soudure",
	"heavy equipment": "Engins lourds",
	"cnc operation": "Conduite de machines CNC",
	maintenance: "Maintenance",
	// Interview
	"interview preparation": "Préparation aux entretiens",
	"body language": "Langage corporel",
	"salary negotiation": "Négociation salariale",
	"behavioral questions": "Questions comportementales",
	"star method": "Méthode STAR",
	// Career strategy
	"career planning": "Planification de carrière",
	"skill gap analysis": "Analyse des lacunes de compétences",
	"job market trends": "Tendances du marché de l'emploi",
	networking: "Réseautage",
	"personal branding": "Marque personnelle",
};

/**
 * Returns the French label for an AI mentor expertise tag (case-insensitive),
 * falling back to a humanized version of the raw tag. The underlying value is
 * never modified — this is for display only.
 */
export function translateExpertiseTag(tag: string | null | undefined): string {
	if (!tag) return "";
	return EXPERTISE_TAG_LABELS[tag.trim().toLowerCase()] || humanizeKey(tag);
}

/**
 * French display labels for skill categories used by the skill library and
 * skill assessments (skill_library.category, adaptive_skill_assessment.category).
 */
const SKILL_CATEGORY_LABELS: Record<string, string> = {
	technical: "Technique",
	soft: "Savoir-être",
	soft_skills: "Savoir-être",
	language: "Langues",
	languages: "Langues",
	tool: "Outils",
	tools: "Outils",
	certification: "Certification",
	certifications: "Certifications",
	business: "Gestion",
	management: "Management",
	creative: "Créatif",
	digital: "Numérique",
	other: "Autre",
};

/**
 * Returns the French label for a skill category. Known machine keys
 * (technical, soft, language, tool, certification...) map to French; any other
 * value (e.g. proper nouns like "ERP", "DevOps", "AI/ML") is returned verbatim
 * to avoid corrupting already display-ready labels.
 */
export function formatSkillCategory(category: string | null | undefined): string {
	if (!category) return "";
	return SKILL_CATEGORY_LABELS[category.trim().toLowerCase()] || category;
}

export function formatCategoryName(category: string): string {
	const map: Record<string, string> = {
		job_board: "Offres d'emploi",
		recruitment_agency: "Agences de recrutement",
		career_center: "Centres de carrière",
		training: "Formation & Certification",
		networking: "Réseautage",
		government: "Ressources gouvernementales",
		startup: "Startups & Entrepreneuriat",
		freelance: "Plateformes freelance",
		mentorship: "Mentorat",
		scholarship: "Bourses & Subventions",
		preparation: "Préparation",
		cultural: "Culture",
		technical: "Technique",
		salary: "Salaire",
		remote: "Travail à distance",
		body_language: "Langage corporel",
		follow_up: "Suivi",
		behavioral: "Comportemental",
		during: "Pendant l'entretien",
		after: "Après l'entretien",
		field_specific: "Conseils spécifiques",
		situational: "Situationnel",
		competency: "Compétences",
	};
	return (
		map[category] ||
		category
			.split("_")
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ")
	);
}
