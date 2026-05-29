// Fields options
export const FIELDS = [
	{ id: "healthcare", name: "Healthcare", nameFr: "Santé" },
	{ id: "industrial", name: "Industrial", nameFr: "Industriel" },
	{ id: "hse", name: "HSE", nameFr: "HSE (Hygiène, Sécurité, Environnement)" },
	{ id: "general", name: "General", nameFr: "Général" },
];

// Regions options (Morocco)
export const REGIONS = [
	{ id: "casablanca-settat", name: "Casablanca-Settat" },
	{ id: "rabat-sale-kenitra", name: "Rabat-Sale-Kenitra" },
	{ id: "tanger-tetouan-al-hoceima", name: "Tanger-Tetouan-Al Hoceima" },
	{ id: "marrakech-safi", name: "Marrakech-Safi" },
	{ id: "fes-meknes", name: "Fes-Meknes" },
	{ id: "souss-massa", name: "Souss-Massa" },
	{ id: "oriental", name: "Oriental" },
	{ id: "beni-mellal-khenifra", name: "Beni Mellal-Khenifra" },
	{ id: "draa-tafilalet", name: "Draa-Tafilalet" },
	{ id: "guelmim-oued-noun", name: "Guelmim-Oued Noun" },
	{ id: "laayoune-sakia-el-hamra", name: "Laayoune-Sakia El Hamra" },
	{ id: "dakhla-oued-ed-dahab", name: "Dakhla-Oued Ed Dahab" },
];

// Job types
export const JOB_TYPES = [
	{ id: "full_time", name: "Full Time" },
	{ id: "part_time", name: "Part Time" },
	{ id: "contract", name: "Contract" },
	{ id: "internship", name: "Internship" },
];

// Experience levels
export const EXPERIENCE_LEVELS = [
	{ id: "entry", name: "Entry Level (0-2 yrs)" },
	{ id: "mid", name: "Intermediate (3-5 yrs)" },
	{ id: "senior", name: "Senior (6+ yrs)" },
	{ id: "executive", name: "Executive" },
];

// Remote preferences
export const REMOTE_OPTIONS = [
	{ id: "onsite", name: "On-site" },
	{ id: "hybrid", name: "Hybrid" },
	{ id: "remote", name: "Remote" },
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
