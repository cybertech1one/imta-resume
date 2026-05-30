// Fields options
export const FIELDS = [
	{ id: "healthcare", name: "Santé", nameFr: "Santé" },
	{ id: "industrial", name: "Industrie", nameFr: "Industriel" },
	{ id: "hse", name: "HSE", nameFr: "HSE (Hygiène, Sécurité, Environnement)" },
	{ id: "general", name: "Général", nameFr: "Général" },
];

// Regions options (Morocco)
export const REGIONS = [
	{ id: "casablanca-settat", name: "Casablanca-Settat" },
	{ id: "rabat-sale-kenitra", name: "Rabat-Salé-Kénitra" },
	{ id: "tanger-tetouan-al-hoceima", name: "Tanger-Tétouan-Al Hoceima" },
	{ id: "marrakech-safi", name: "Marrakech-Safi" },
	{ id: "fes-meknes", name: "Fès-Meknès" },
	{ id: "souss-massa", name: "Souss-Massa" },
	{ id: "oriental", name: "Oriental" },
	{ id: "beni-mellal-khenifra", name: "Béni Mellal-Khénifra" },
	{ id: "draa-tafilalet", name: "Drâa-Tafilalet" },
	{ id: "guelmim-oued-noun", name: "Guelmim-Oued Noun" },
	{ id: "laayoune-sakia-el-hamra", name: "Laayoune-Sakia El Hamra" },
	{ id: "dakhla-oued-ed-dahab", name: "Dakhla-Oued Ed Dahab" },
];

// Job types
export const JOB_TYPES = [
	{ id: "full_time", name: "Temps plein" },
	{ id: "part_time", name: "Temps partiel" },
	{ id: "contract", name: "Contrat" },
	{ id: "internship", name: "Stage" },
];

// Experience levels
export const EXPERIENCE_LEVELS = [
	{ id: "entry", name: "Débutant (0-2 ans)" },
	{ id: "mid", name: "Intermédiaire (3-5 ans)" },
	{ id: "senior", name: "Senior (6+ ans)" },
	{ id: "executive", name: "Direction" },
];

// Remote preferences
export const REMOTE_OPTIONS = [
	{ id: "onsite", name: "Sur site" },
	{ id: "hybrid", name: "Hybride" },
	{ id: "remote", name: "À distance" },
];

// Match score color helper
export function getScoreColor(score: number): string {
	if (score >= 80) return "text-green-600 dark:text-green-400";
	if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
	if (score >= 40) return "text-orange-600 dark:text-orange-400";
	return "text-red-600 dark:text-red-400";
}

export function getScoreBgColor(score: number): string {
	if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
	if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
	if (score >= 40) return "bg-orange-100 dark:bg-orange-900/30";
	return "bg-red-100 dark:bg-red-900/30";
}
