import z from "zod";
import { resumeDataSchema } from "@/schema/resume/data";
import { protectedProcedure } from "../context";

// ---- Scoring helper types ----

interface SectionResult {
	name: string;
	score: number;
	issues: string[];
	suggestions: string[];
}

interface KeywordResult {
	found: string[];
	missing: string[];
	matchRate: number;
}

interface FormattingResult {
	score: number;
	issues: string[];
	suggestions: string[];
}

interface MoroccanResult {
	score: number;
	tips: string[];
}

// ---- Text utilities ----

function stripHtml(html: string): string {
	return html
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function countWords(text: string): number {
	const stripped = stripHtml(text);
	if (!stripped) return 0;
	return stripped.split(/\s+/).filter(Boolean).length;
}

const ACTION_VERBS = new Set([
	"achieved",
	"administered",
	"analyzed",
	"applied",
	"built",
	"collaborated",
	"completed",
	"conducted",
	"coordinated",
	"created",
	"decreased",
	"delivered",
	"designed",
	"developed",
	"directed",
	"drove",
	"enabled",
	"established",
	"evaluated",
	"executed",
	"expanded",
	"generated",
	"grew",
	"identified",
	"implemented",
	"improved",
	"increased",
	"initiated",
	"introduced",
	"launched",
	"led",
	"managed",
	"mentored",
	"negotiated",
	"optimized",
	"organized",
	"oversaw",
	"performed",
	"planned",
	"produced",
	"reduced",
	"resolved",
	"restructured",
	"secured",
	"simplified",
	"spearheaded",
	"streamlined",
	"supervised",
	"trained",
	"transformed",
	// French action verbs common in Moroccan CVs
	"analyse",
	"ameliore",
	"concu",
	"coordonne",
	"cree",
	"developpe",
	"dirige",
	"elabore",
	"etabli",
	"evalue",
	"forme",
	"gere",
	"implemente",
	"lance",
	"mene",
	"mis en place",
	"optimise",
	"organise",
	"pilote",
	"planifie",
	"produit",
	"realise",
	"reduit",
	"resolu",
	"restructure",
	"supervise",
]);

const MEASURABLE_PATTERNS = [
	/\d+%/,
	/\d+\s*(percent|pour cent)/i,
	/\$\d+/,
	/\d+\s*(million|billion|thousand|mille|milliard)/i,
	/\d+\s*(users|clients|customers|utilisateurs|employes|students)/i,
	/increased?\s+by\s+\d+/i,
	/reduced?\s+by\s+\d+/i,
	/saved?\s+\d+/i,
	/augmente\s+de\s+\d+/i,
	/reduit\s+de\s+\d+/i,
];

// ---- Section checkers ----

function checkContactInfo(basics: z.infer<typeof resumeDataSchema>["basics"]): SectionResult {
	const issues: string[] = [];
	const suggestions: string[] = [];
	let score = 100;

	if (!basics.name?.trim()) {
		issues.push("Full name is missing");
		score -= 30;
	}
	if (!basics.email?.trim()) {
		issues.push("Email address is missing");
		score -= 25;
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basics.email)) {
		issues.push("Email format appears invalid");
		score -= 10;
	}
	if (!basics.phone?.trim()) {
		issues.push("Phone number is missing");
		score -= 20;
	}
	if (!basics.location?.trim()) {
		issues.push("Location is missing");
		score -= 15;
	}
	if (!basics.headline?.trim()) {
		suggestions.push("Add a professional headline/title for better ATS matching");
		score -= 10;
	}

	return { name: "Contact Information", score: Math.max(0, score), issues, suggestions };
}

function checkSummary(summary: z.infer<typeof resumeDataSchema>["summary"]): SectionResult {
	const issues: string[] = [];
	const suggestions: string[] = [];
	let score = 100;

	const content = stripHtml(summary?.content || "");

	if (!content) {
		issues.push("Summary/objective section is empty");
		score = 0;
		return { name: "Summary / Objective", score, issues, suggestions };
	}

	const wordCount = countWords(content);

	if (wordCount < 30) {
		issues.push(`Summary is too short (${wordCount} words). Aim for 50-200 words`);
		score -= 30;
	} else if (wordCount < 50) {
		suggestions.push(`Summary could be longer (${wordCount} words). Aim for 50-200 words`);
		score -= 15;
	} else if (wordCount > 200) {
		issues.push(`Summary is too long (${wordCount} words). Keep it under 200 words for better ATS scanning`);
		score -= 20;
	}

	if (summary.hidden) {
		issues.push("Summary section is hidden - ATS cannot read hidden sections");
		score -= 40;
	}

	return { name: "Summary / Objective", score: Math.max(0, score), issues, suggestions };
}

function checkExperience(sections: z.infer<typeof resumeDataSchema>["sections"]): SectionResult {
	const issues: string[] = [];
	const suggestions: string[] = [];
	let score = 100;

	const experience = sections.experience;
	if (!experience || experience.items.length === 0) {
		issues.push("No work experience entries found");
		return { name: "Work Experience", score: 0, issues, suggestions };
	}

	if (experience.hidden) {
		issues.push("Experience section is hidden - ATS cannot read hidden sections");
		score -= 40;
	}

	const visibleItems = experience.items.filter((item) => !item.hidden);
	if (visibleItems.length === 0) {
		issues.push("All experience entries are hidden");
		score -= 40;
	}

	let actionVerbCount = 0;
	let measurableCount = 0;
	let missingDateCount = 0;
	let missingDescriptionCount = 0;

	for (const item of visibleItems) {
		// Check for dates
		if (!item.period?.trim()) {
			missingDateCount++;
		}

		// Check description
		const desc = stripHtml(item.description || "");
		if (!desc) {
			missingDescriptionCount++;
			continue;
		}

		// Check for action verbs
		const words = desc.toLowerCase().split(/\s+/);
		const hasActionVerb = words.some((w) => ACTION_VERBS.has(w));
		if (hasActionVerb) actionVerbCount++;

		// Check for measurable results
		const hasMeasurable = MEASURABLE_PATTERNS.some((pattern) => pattern.test(desc));
		if (hasMeasurable) measurableCount++;
	}

	if (missingDateCount > 0) {
		issues.push(`${missingDateCount} experience entries are missing date/period information`);
		score -= missingDateCount * 8;
	}

	if (missingDescriptionCount > 0) {
		issues.push(`${missingDescriptionCount} experience entries have no description`);
		score -= missingDescriptionCount * 10;
	}

	if (visibleItems.length > 0) {
		const actionVerbRate = actionVerbCount / visibleItems.length;
		if (actionVerbRate < 0.5) {
			suggestions.push(
				"Use more action verbs to start bullet points (e.g., Developed, Managed, Implemented, Coordonne, Pilote)",
			);
			score -= 15;
		}

		const measurableRate = measurableCount / visibleItems.length;
		if (measurableRate < 0.3) {
			suggestions.push(
				"Add measurable results and metrics (e.g., 'Increased efficiency by 25%', 'Managed team of 10')",
			);
			score -= 15;
		}
	}

	return { name: "Work Experience", score: Math.max(0, score), issues, suggestions };
}

function checkSkills(sections: z.infer<typeof resumeDataSchema>["sections"]): SectionResult {
	const issues: string[] = [];
	const suggestions: string[] = [];
	let score = 100;

	const skills = sections.skills;
	if (!skills || skills.items.length === 0) {
		issues.push("No skills section found");
		return { name: "Skills", score: 0, issues, suggestions };
	}

	if (skills.hidden) {
		issues.push("Skills section is hidden - ATS cannot read hidden sections");
		score -= 40;
	}

	const visibleSkills = skills.items.filter((item) => !item.hidden);
	if (visibleSkills.length === 0) {
		issues.push("All skills are hidden");
		score -= 40;
	}

	if (visibleSkills.length < 5) {
		suggestions.push(`Only ${visibleSkills.length} skills listed. Most ATS systems look for 8-15 relevant skills`);
		score -= 15;
	}

	// Check for keyword-enriched skills (skills with keywords array)
	const skillsWithKeywords = visibleSkills.filter((s) => s.keywords && s.keywords.length > 0);
	if (skillsWithKeywords.length < visibleSkills.length * 0.3) {
		suggestions.push("Add keyword tags to your skills for better ATS matching (e.g., Python: Django, Flask, FastAPI)");
		score -= 10;
	}

	return { name: "Skills", score: Math.max(0, score), issues, suggestions };
}

function checkEducation(sections: z.infer<typeof resumeDataSchema>["sections"]): SectionResult {
	const issues: string[] = [];
	const suggestions: string[] = [];
	let score = 100;

	const education = sections.education;
	if (!education || education.items.length === 0) {
		issues.push("No education section found");
		return { name: "Education", score: 0, issues, suggestions };
	}

	if (education.hidden) {
		issues.push("Education section is hidden - ATS cannot read hidden sections");
		score -= 40;
	}

	const visibleItems = education.items.filter((item) => !item.hidden);
	if (visibleItems.length === 0) {
		issues.push("All education entries are hidden");
		score -= 40;
	}

	let missingDegree = 0;
	let missingSchool = 0;
	let missingDate = 0;

	for (const item of visibleItems) {
		if (!item.degree?.trim()) missingDegree++;
		if (!item.school?.trim()) missingSchool++;
		if (!item.period?.trim()) missingDate++;
	}

	if (missingSchool > 0) {
		issues.push(`${missingSchool} education entries are missing school/institution name`);
		score -= missingSchool * 15;
	}
	if (missingDegree > 0) {
		issues.push(`${missingDegree} education entries are missing degree/qualification`);
		score -= missingDegree * 10;
	}
	if (missingDate > 0) {
		suggestions.push(`${missingDate} education entries are missing dates`);
		score -= missingDate * 5;
	}

	return { name: "Education", score: Math.max(0, score), issues, suggestions };
}

function checkFormatting(data: z.infer<typeof resumeDataSchema>): FormattingResult {
	const issues: string[] = [];
	const suggestions: string[] = [];
	let score = 100;

	// Check layout for multi-column (some ATS struggle with sidebars)
	const layout = data.metadata?.layout;
	if (layout?.pages) {
		const hasSidebar = layout.pages.some((page) => !page.fullWidth && page.sidebar && page.sidebar.length > 0);
		if (hasSidebar) {
			suggestions.push(
				"Your resume uses a sidebar layout. Some ATS systems cannot parse multi-column layouts correctly. Consider a single-column layout for maximum compatibility.",
			);
			score -= 10;
		}
	}

	// Check for custom CSS (ATS strips CSS)
	if (data.metadata?.css?.enabled && data.metadata.css.value?.trim()) {
		suggestions.push("Custom CSS is enabled. ATS systems strip CSS - ensure your resume is readable without it.");
		score -= 5;
	}

	// Check for picture (some ATS choke on images)
	if (data.picture && !data.picture.hidden && data.picture.url) {
		suggestions.push("Profile picture is visible. Many ATS systems cannot process images and may misparse the layout.");
		score -= 10;
	}

	// Check page format
	if (data.metadata?.page?.format === "free-form") {
		issues.push("Free-form page format detected. Use A4 or Letter for ATS compatibility.");
		score -= 15;
	}

	// Check if section headings are standard
	const sections = data.sections;
	const standardHeadings = new Set([
		"experience",
		"education",
		"skills",
		"summary",
		"objective",
		"projects",
		"certifications",
		"awards",
		"languages",
		"volunteer",
		"references",
		"internships",
		"profiles",
		"publications",
		"interests",
		// French equivalents
		"experience professionnelle",
		"formation",
		"competences",
		"resume",
		"objectif",
		"projets",
		"certifications",
		"langues",
		"stages",
		"references",
		"benevolat",
		"publications",
	]);

	const nonStandardSections: string[] = [];
	for (const [key, section] of Object.entries(sections)) {
		if (section && typeof section === "object" && "title" in section) {
			const title = ((section.title as string) || "").toLowerCase().trim();
			if (title && !standardHeadings.has(title) && !standardHeadings.has(key)) {
				nonStandardSections.push(title);
			}
		}
	}

	if (nonStandardSections.length > 0) {
		suggestions.push(
			`Non-standard section headings detected: "${nonStandardSections.join('", "')}". ATS may not recognize custom headings. Use standard names like Experience, Education, Skills.`,
		);
		score -= nonStandardSections.length * 3;
	}

	return { score: Math.max(0, score), issues, suggestions };
}

function extractKeywords(jobDescription: string): string[] {
	if (!jobDescription?.trim()) return [];

	const text = jobDescription.toLowerCase();

	// Remove common stop words
	const stopWords = new Set([
		"a",
		"an",
		"the",
		"and",
		"or",
		"but",
		"in",
		"on",
		"at",
		"to",
		"for",
		"of",
		"with",
		"by",
		"from",
		"is",
		"are",
		"was",
		"were",
		"be",
		"been",
		"being",
		"have",
		"has",
		"had",
		"do",
		"does",
		"did",
		"will",
		"would",
		"could",
		"should",
		"may",
		"might",
		"shall",
		"can",
		"need",
		"must",
		"ought",
		"it",
		"its",
		"this",
		"that",
		"these",
		"those",
		"i",
		"we",
		"you",
		"he",
		"she",
		"they",
		"me",
		"us",
		"him",
		"her",
		"them",
		"my",
		"our",
		"your",
		"his",
		"their",
		"what",
		"which",
		"who",
		"whom",
		"if",
		"then",
		"than",
		"so",
		"no",
		"not",
		"only",
		"very",
		"just",
		"about",
		"also",
		"as",
		"such",
		"all",
		"each",
		"every",
		"both",
		"few",
		"more",
		"most",
		"other",
		"some",
		"any",
		"no",
		"nor",
		"own",
		"same",
		"too",
		"s",
		"t",
		"re",
		"ll",
		"ve",
		"d",
		"m",
		// French stop words
		"le",
		"la",
		"les",
		"un",
		"une",
		"des",
		"du",
		"de",
		"et",
		"ou",
		"mais",
		"donc",
		"car",
		"ni",
		"que",
		"qui",
		"quoi",
		"dont",
		"dans",
		"sur",
		"sous",
		"avec",
		"pour",
		"par",
		"en",
		"au",
		"aux",
		"ce",
		"cette",
		"ces",
		"il",
		"elle",
		"ils",
		"elles",
		"nous",
		"vous",
		"je",
		"tu",
		"on",
		"se",
		"son",
		"sa",
		"ses",
		"notre",
		"votre",
		"leur",
		"est",
		"sont",
		"etre",
		"avoir",
		"fait",
		"faire",
		"plus",
		"tres",
	]);

	// Extract meaningful words (min 3 chars)
	const words = text
		.replace(/[^a-zA-ZÀ-ÿ0-9\s\-+#.]/g, " ")
		.split(/\s+/)
		.filter((w) => w.length >= 3 && !stopWords.has(w));

	// Count frequency
	const freq = new Map<string, number>();
	for (const word of words) {
		freq.set(word, (freq.get(word) || 0) + 1);
	}

	// Also extract multi-word phrases (bigrams)
	const tokens = text
		.replace(/[^a-zA-ZÀ-ÿ0-9\s\-+#.]/g, " ")
		.split(/\s+/)
		.filter(Boolean);
	for (let i = 0; i < tokens.length - 1; i++) {
		const bigram = `${tokens[i]} ${tokens[i + 1]}`;
		if (bigram.length >= 5 && !stopWords.has(tokens[i]) && !stopWords.has(tokens[i + 1])) {
			freq.set(bigram, (freq.get(bigram) || 0) + 1);
		}
	}

	// Return keywords sorted by frequency (at least 2 occurrences, or bigrams)
	return Array.from(freq.entries())
		.filter(([keyword, count]) => count >= 2 || keyword.includes(" "))
		.sort((a, b) => b[1] - a[1])
		.map(([keyword]) => keyword)
		.slice(0, 50);
}

function checkKeywordMatch(data: z.infer<typeof resumeDataSchema>, jobDescription: string): KeywordResult {
	const keywords = extractKeywords(jobDescription);
	if (keywords.length === 0) {
		return { found: [], missing: [], matchRate: 0 };
	}

	// Build a corpus from all resume text
	const parts: string[] = [];

	// Basics
	if (data.basics.headline) parts.push(data.basics.headline);

	// Summary
	if (data.summary?.content) parts.push(stripHtml(data.summary.content));

	// Experience
	for (const item of data.sections.experience?.items || []) {
		if (item.position) parts.push(item.position);
		if (item.company) parts.push(item.company);
		if (item.description) parts.push(stripHtml(item.description));
	}

	// Education
	for (const item of data.sections.education?.items || []) {
		if (item.degree) parts.push(item.degree);
		if (item.school) parts.push(item.school);
		if (item.area) parts.push(item.area);
		if (item.description) parts.push(stripHtml(item.description));
	}

	// Skills
	for (const item of data.sections.skills?.items || []) {
		if (item.name) parts.push(item.name);
		if (item.keywords) parts.push(item.keywords.join(" "));
	}

	// Projects
	for (const item of data.sections.projects?.items || []) {
		if (item.name) parts.push(item.name);
		if (item.description) parts.push(stripHtml(item.description));
	}

	// Certifications
	for (const item of data.sections.certifications?.items || []) {
		if (item.title) parts.push(item.title);
		if (item.issuer) parts.push(item.issuer);
	}

	// Internships (Morocco-specific)
	for (const item of data.sections.internships?.items || []) {
		if (item.position) parts.push(item.position);
		if (item.company) parts.push(item.company);
		if (item.tasksPerformed) parts.push(stripHtml(item.tasksPerformed));
		if (item.skillsAcquired) parts.push(item.skillsAcquired.join(" "));
	}

	// Custom sections
	for (const section of data.customSections || []) {
		for (const item of section.items || []) {
			if ("description" in item && typeof item.description === "string") {
				parts.push(stripHtml(item.description));
			}
			if ("name" in item && typeof item.name === "string") {
				parts.push(item.name);
			}
			if ("title" in item && typeof item.title === "string") {
				parts.push(item.title);
			}
		}
	}

	const corpus = parts.join(" ").toLowerCase();

	const found: string[] = [];
	const missing: string[] = [];

	for (const keyword of keywords) {
		if (corpus.includes(keyword)) {
			found.push(keyword);
		} else {
			missing.push(keyword);
		}
	}

	const matchRate = keywords.length > 0 ? Math.round((found.length / keywords.length) * 100) : 0;

	return { found, missing, matchRate };
}

function checkMoroccanSpecific(data: z.infer<typeof resumeDataSchema>): MoroccanResult {
	const tips: string[] = [];
	let score = 100;

	// Check for bilingual content (French is essential in Moroccan job market)
	const allText = [
		data.basics.headline || "",
		stripHtml(data.summary?.content || ""),
		...data.sections.experience.items.map((i) => stripHtml(i.description || "")),
		...data.sections.education.items.map((i) => stripHtml(i.description || "")),
	]
		.join(" ")
		.toLowerCase();

	const frenchIndicators = [
		"experience",
		"formation",
		"competences",
		"objectif",
		"stage",
		"entreprise",
		"responsable",
		"gestion",
		"developpement",
		"projet",
		"equipe",
		"mise en place",
		"realisation",
		"analyse",
	];
	const hasFrench = frenchIndicators.some((word) => allText.includes(word));

	if (!hasFrench) {
		tips.push(
			"Consider adding French content to your CV. Most Moroccan employers expect bilingual (French/English or French/Arabic) resumes.",
		);
		score -= 15;
	}

	// Check for CIN field (common in Moroccan CVs)
	if (!data.basics.cin?.trim()) {
		tips.push(
			"CIN (Carte d'Identite Nationale) is often expected on Moroccan CVs. Consider adding it in the personal details section.",
		);
		score -= 5;
	}

	// Check for internships section (important for IMTA/vocational grads)
	const internships = data.sections.internships;
	const hasInternships = internships && internships.items.length > 0 && !internships.hidden;

	// Check if user seems to be a student/recent grad (few experience entries)
	const experienceCount = data.sections.experience?.items.filter((i) => !i.hidden).length || 0;
	if (experienceCount <= 2 && !hasInternships) {
		tips.push(
			"For recent graduates and IMTA students, including an Internships (Stages) section is highly recommended. Moroccan employers value practical training experience.",
		);
		score -= 10;
	}

	// Check for languages section (important in Morocco's multilingual context)
	const languages = data.sections.languages;
	const visibleLanguages = languages?.items.filter((i) => !i.hidden) || [];
	if (visibleLanguages.length === 0) {
		tips.push(
			"Add a Languages section. Morocco's job market values multilingual candidates (Arabic, French, English, Amazigh).",
		);
		score -= 10;
	} else if (visibleLanguages.length < 2) {
		tips.push(
			"Consider listing all languages you speak. Moroccan employers often require proficiency in at least French and Arabic.",
		);
		score -= 5;
	}

	// Check for date of birth (common in Moroccan CVs)
	if (!data.basics.dateOfBirth?.trim()) {
		tips.push("Date of birth is commonly included on Moroccan CVs. While optional, many local employers expect it.");
		// No score penalty - it's a cultural preference, not a strict requirement
	}

	// Check for nationality (common in Moroccan CVs)
	if (!data.basics.nationality?.trim()) {
		tips.push("Nationality is commonly included on Moroccan CVs, especially for positions in multinational companies.");
	}

	// Check IMTA branding if applicable
	if (data.metadata?.imtaBranding?.enabled) {
		if (!data.metadata.imtaBranding.program || data.metadata.imtaBranding.program === "general") {
			tips.push(
				"You have IMTA branding enabled but no specific program selected. Specify your program (healthcare, industrial, HSE) for better employer recognition.",
			);
			score -= 5;
		}
	}

	return { score: Math.max(0, score), tips };
}

function checkLength(data: z.infer<typeof resumeDataSchema>): SectionResult {
	const issues: string[] = [];
	const suggestions: string[] = [];
	let score = 100;

	// Count total content
	const experienceCount = data.sections.experience?.items.filter((i) => !i.hidden).length || 0;
	const totalSections = Object.entries(data.sections).filter(
		([, section]) =>
			section &&
			typeof section === "object" &&
			"items" in section &&
			!section.hidden &&
			Array.isArray(section.items) &&
			section.items.filter((i: { hidden?: boolean }) => !i.hidden).length > 0,
	).length;

	// Estimate page count based on content density
	const totalItems = Object.entries(data.sections).reduce((sum, [, section]) => {
		if (section && typeof section === "object" && "items" in section && Array.isArray(section.items)) {
			return sum + section.items.filter((i: { hidden?: boolean }) => !i.hidden).length;
		}
		return sum;
	}, 0);

	if (totalItems === 0) {
		issues.push("Resume appears to be empty. Add content to at least 3-4 sections.");
		score = 0;
	} else if (totalSections < 3) {
		issues.push(`Only ${totalSections} sections have content. Aim for at least 4-5 sections.`);
		score -= 20;
	}

	// For entry-level (0-2 experience items), warn if too long
	if (experienceCount <= 2 && totalItems > 20) {
		suggestions.push(
			"For entry-level candidates, keep your resume to 1 page. You have many items which may push it to 2+ pages.",
		);
		score -= 10;
	}

	// Warn if resume seems too sparse
	if (experienceCount > 0 && totalItems < 8) {
		suggestions.push(
			"Your resume seems sparse. Consider adding more details to your experience descriptions, skills, or projects.",
		);
		score -= 10;
	}

	return { name: "Length & Completeness", score: Math.max(0, score), issues, suggestions };
}

function checkParseability(data: z.infer<typeof resumeDataSchema>): SectionResult {
	const issues: string[] = [];
	const suggestions: string[] = [];
	let score = 100;

	// Check if basics are parseable
	if (!data.basics) {
		issues.push("Resume data structure is missing the basics section");
		score -= 30;
	}

	// Check if sections exist
	if (!data.sections) {
		issues.push("Resume data structure is missing the sections object");
		score -= 30;
	}

	// Check for excessively long HTML content that might confuse ATS
	const allDescriptions = [
		...(data.sections.experience?.items || []).map((i) => i.description || ""),
		...(data.sections.education?.items || []).map((i) => i.description || ""),
		...(data.sections.projects?.items || []).map((i) => i.description || ""),
	];

	for (const desc of allDescriptions) {
		// Check for complex HTML
		if (/<table|<img|<iframe|<canvas|<svg/i.test(desc)) {
			issues.push(
				"Complex HTML elements (tables, images, iframes) detected in descriptions. ATS systems cannot parse these.",
			);
			score -= 20;
			break;
		}
	}

	// Check for special characters that might cause parsing issues
	const fullText = [data.basics.name, data.basics.headline, stripHtml(data.summary?.content || "")].join(" ");

	// Detect zero-width spaces, soft hyphens, and other invisible control characters by char code
	for (let i = 0; i < fullText.length; i++) {
		const code = fullText.charCodeAt(i);
		// Zero-width space (0x200B), zero-width non-joiner (0x200C), zero-width joiner (0x200D),
		// soft hyphen (0x00AD), word joiner (0x2060), BOM (0xFEFF)
		if (
			code === 0x200b ||
			code === 0x200c ||
			code === 0x200d ||
			code === 0x00ad ||
			code === 0x2060 ||
			code === 0xfeff
		) {
			issues.push("Special control characters detected that may cause ATS parsing errors");
			score -= 10;
			break;
		}
	}

	return { name: "File Parseability", score: Math.max(0, score), issues, suggestions };
}

// ---- Output schema ----

const atsScoreOutputSchema = z.object({
	overallScore: z.number().min(0).max(100),
	sections: z.array(
		z.object({
			name: z.string(),
			score: z.number(),
			issues: z.array(z.string()),
			suggestions: z.array(z.string()),
		}),
	),
	keywords: z.object({
		found: z.array(z.string()),
		missing: z.array(z.string()),
		matchRate: z.number(),
	}),
	formatting: z.object({
		score: z.number(),
		issues: z.array(z.string()),
		suggestions: z.array(z.string()),
	}),
	moroccanSpecific: z.object({
		score: z.number(),
		tips: z.array(z.string()),
	}),
});

// ---- Router definition ----

export const atsCheckerRouter = {
	checkAtsScore: protectedProcedure
		.route({
			method: "POST",
			path: "/ats-checker",
			tags: ["ATS Checker"],
			summary: "Analyze resume data against ATS best practices and return a score with recommendations",
		})
		.input(
			z.object({
				resumeData: resumeDataSchema,
				jobDescription: z.string().optional().default(""),
			}),
		)
		.output(atsScoreOutputSchema)
		.handler(async ({ input }) => {
			const { resumeData, jobDescription } = input;

			// Run all section checks
			const contactResult = checkContactInfo(resumeData.basics);
			const summaryResult = checkSummary(resumeData.summary);
			const experienceResult = checkExperience(resumeData.sections);
			const skillsResult = checkSkills(resumeData.sections);
			const educationResult = checkEducation(resumeData.sections);
			const lengthResult = checkLength(resumeData);
			const parseabilityResult = checkParseability(resumeData);

			const sectionResults = [
				contactResult,
				summaryResult,
				experienceResult,
				skillsResult,
				educationResult,
				lengthResult,
				parseabilityResult,
			];

			// Formatting check
			const formattingResult = checkFormatting(resumeData);

			// Keyword match (only if job description is provided)
			const keywordResult = jobDescription?.trim()
				? checkKeywordMatch(resumeData, jobDescription)
				: { found: [], missing: [], matchRate: 0 };

			// Morocco-specific checks
			const moroccanResult = checkMoroccanSpecific(resumeData);

			// Calculate overall score as weighted average
			const weights = {
				contact: 15,
				summary: 10,
				experience: 20,
				skills: 15,
				education: 10,
				length: 10,
				parseability: 5,
				formatting: 10,
				moroccan: 5,
			};

			const weightedSum =
				contactResult.score * weights.contact +
				summaryResult.score * weights.summary +
				experienceResult.score * weights.experience +
				skillsResult.score * weights.skills +
				educationResult.score * weights.education +
				lengthResult.score * weights.length +
				parseabilityResult.score * weights.parseability +
				formattingResult.score * weights.formatting +
				moroccanResult.score * weights.moroccan;

			const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

			// If job description is provided, factor in keyword match
			let overallScore: number;
			if (jobDescription?.trim()) {
				const keywordWeight = 15;
				overallScore = Math.round(
					(weightedSum + keywordResult.matchRate * keywordWeight) / (totalWeight + keywordWeight),
				);
			} else {
				overallScore = Math.round(weightedSum / totalWeight);
			}

			return {
				overallScore: Math.max(0, Math.min(100, overallScore)),
				sections: sectionResults,
				keywords: keywordResult,
				formatting: formattingResult,
				moroccanSpecific: moroccanResult,
			};
		}),
};
