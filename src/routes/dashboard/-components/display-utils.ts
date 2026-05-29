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
