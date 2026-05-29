// =============================================================================
// KEYWORDS OPTIMIZER - CONFIG & HELPERS
// =============================================================================

import { t } from "@lingui/core/macro";

import type { AnalysisResult, Industry, KeywordDensity, KeywordMatch } from "./keywords-types";

// =============================================================================
// INDUSTRY KEYWORDS REFERENCE DATA
// =============================================================================

const INDUSTRY_KEYWORDS_DATABASE: Record<Industry, { technical: string[]; soft: string[]; certifications: string[] }> =
	{
		technology: {
			technical: [
				"JavaScript",
				"TypeScript",
				"Python",
				"React",
				"Node.js",
				"AWS",
				"Docker",
				"Kubernetes",
				"CI/CD",
				"Git",
				"SQL",
				"NoSQL",
				"MongoDB",
				"PostgreSQL",
				"REST API",
				"GraphQL",
				"Microservices",
				"Cloud Computing",
				"DevOps",
				"Agile",
				"Machine Learning",
				"AI",
				"Data Analysis",
				"Linux",
				"Security",
			],
			soft: [
				"Leadership",
				"Communication",
				"Problem Solving",
				"Team Collaboration",
				"Time Management",
				"Adaptability",
				"Critical Thinking",
				"Innovation",
				"Mentoring",
				"Project Management",
			],
			certifications: [
				"AWS Certified",
				"Azure Certified",
				"Google Cloud",
				"Scrum Master",
				"PMP",
				"CISSP",
				"CompTIA",
				"Kubernetes Certified",
			],
		},
		healthcare: {
			technical: [
				"Patient Care",
				"Clinical Skills",
				"Medical Records",
				"HIPAA",
				"EMR",
				"EHR",
				"Nursing",
				"First Aid",
				"Emergency Response",
				"Healthcare Management",
				"Patient Safety",
				"Infection Control",
				"Vital Signs",
				"Medication Administration",
				"Care Coordination",
			],
			soft: [
				"Empathy",
				"Communication",
				"Attention to Detail",
				"Stress Management",
				"Team Collaboration",
				"Patient Education",
				"Cultural Sensitivity",
				"Problem Solving",
			],
			certifications: ["RN License", "BLS", "ACLS", "PALS", "CNA", "LPN", "CCRN", "Board Certified"],
		},
		finance: {
			technical: [
				"Financial Analysis",
				"Risk Management",
				"Due Diligence",
				"Compliance",
				"Fintech",
				"Trading",
				"Portfolio Management",
				"Excel",
				"Bloomberg Terminal",
				"Financial Modeling",
				"Budgeting",
				"Forecasting",
				"Accounting",
				"Audit",
				"Tax",
			],
			soft: [
				"Analytical Skills",
				"Attention to Detail",
				"Communication",
				"Integrity",
				"Decision Making",
				"Client Relations",
				"Negotiation",
				"Strategic Thinking",
			],
			certifications: ["CFA", "CPA", "FRM", "Series 7", "Series 63", "ACCA", "MBA", "CFP"],
		},
		marketing: {
			technical: [
				"SEO",
				"SEM",
				"Content Marketing",
				"Social Media",
				"Google Analytics",
				"Email Marketing",
				"PPC",
				"Marketing Automation",
				"CRM",
				"Brand Management",
				"Market Research",
				"Digital Marketing",
				"Copywriting",
				"A/B Testing",
				"Conversion Optimization",
			],
			soft: [
				"Creativity",
				"Communication",
				"Strategic Thinking",
				"Analytical Skills",
				"Collaboration",
				"Adaptability",
				"Presentation Skills",
				"Storytelling",
			],
			certifications: ["Google Ads", "HubSpot", "Facebook Blueprint", "Google Analytics", "Hootsuite", "Salesforce"],
		},
		engineering: {
			technical: [
				"CAD",
				"CAM",
				"SolidWorks",
				"AutoCAD",
				"Lean Manufacturing",
				"Six Sigma",
				"R&D",
				"Quality Control",
				"Project Management",
				"Technical Drawing",
				"Prototyping",
				"Testing",
				"Simulation",
				"Product Development",
				"Systems Engineering",
			],
			soft: [
				"Problem Solving",
				"Analytical Skills",
				"Attention to Detail",
				"Communication",
				"Team Collaboration",
				"Innovation",
				"Critical Thinking",
				"Leadership",
			],
			certifications: ["PE License", "Six Sigma", "PMP", "LEED", "ASQ", "ISO Certified"],
		},
		education: {
			technical: [
				"Curriculum Development",
				"Lesson Planning",
				"Assessment",
				"E-learning",
				"LMS",
				"Educational Technology",
				"Student Engagement",
				"Classroom Management",
				"Differentiated Instruction",
				"Special Education",
				"IEP",
				"Data Analysis",
			],
			soft: [
				"Communication",
				"Patience",
				"Creativity",
				"Adaptability",
				"Leadership",
				"Empathy",
				"Organization",
				"Collaboration",
			],
			certifications: [
				"Teaching License",
				"TESOL",
				"TEFL",
				"Google Educator",
				"Microsoft Educator",
				"National Board Certified",
			],
		},
		industrial: {
			technical: [
				"Maintenance",
				"Quality Control",
				"Safety Protocols",
				"Equipment Operation",
				"Troubleshooting",
				"Preventive Maintenance",
				"Technical Drawings",
				"Welding",
				"CNC",
				"PLC",
				"Hydraulics",
				"Pneumatics",
				"Electrical Systems",
				"Mechanical Systems",
			],
			soft: [
				"Attention to Detail",
				"Problem Solving",
				"Team Collaboration",
				"Communication",
				"Time Management",
				"Safety Awareness",
				"Adaptability",
			],
			certifications: ["OSHA", "Forklift Certified", "Welding Certification", "Electrical License", "HVAC Certified"],
		},
		general: {
			technical: [
				"Microsoft Office",
				"Data Entry",
				"Research",
				"Reporting",
				"Analysis",
				"Documentation",
				"Process Improvement",
				"Database Management",
			],
			soft: [
				"Communication",
				"Problem Solving",
				"Team Collaboration",
				"Time Management",
				"Organization",
				"Adaptability",
				"Critical Thinking",
				"Leadership",
			],
			certifications: ["Project Management", "Microsoft Certified", "Google Workspace"],
		},
	};

// =============================================================================
// CHART COLORS
// =============================================================================

export const CHART_COLORS = {
	technical: "#3b82f6",
	soft: "#8b5cf6",
	certification: "#10b981",
	industry: "#f59e0b",
};

export const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function analyzeKeywords(jobDescription: string, resumeContent: string, industry: Industry): AnalysisResult {
	const normalizedJob = jobDescription.toLowerCase();
	const normalizedResume = resumeContent.toLowerCase();
	const industryData = INDUSTRY_KEYWORDS_DATABASE[industry];

	const allKeywords = [
		...industryData.technical.map((k) => ({ keyword: k, category: "technical" as const, importance: "high" as const })),
		...industryData.soft.map((k) => ({ keyword: k, category: "soft" as const, importance: "medium" as const })),
		...industryData.certifications.map((k) => ({
			keyword: k,
			category: "certification" as const,
			importance: "high" as const,
		})),
	];

	// Find keywords from job description
	const matchedKeywords: KeywordMatch[] = [];
	const missingKeywords: KeywordMatch[] = [];

	for (const item of allKeywords) {
		const keywordLower = item.keyword.toLowerCase();
		const inJob = normalizedJob.includes(keywordLower);
		const inResume = normalizedResume.includes(keywordLower);
		const count = (normalizedResume.match(new RegExp(keywordLower, "g")) || []).length;

		if (inJob) {
			if (inResume) {
				matchedKeywords.push({ ...item, found: true, count });
			} else {
				missingKeywords.push({ ...item, found: false, count: 0 });
			}
		}
	}

	// Calculate keyword density
	const resumeWords = normalizedResume.split(/\s+/).length;
	const keywordDensity: KeywordDensity[] = matchedKeywords.slice(0, 10).map((k) => {
		const density = (k.count / resumeWords) * 100;
		let status: "optimal" | "low" | "high" = "optimal";
		if (density < 0.5) status = "low";
		else if (density > 3) status = "high";
		return { keyword: k.keyword, count: k.count, density: Math.round(density * 100) / 100, status };
	});

	// Calculate scores
	const technicalMatched = matchedKeywords.filter((k) => k.category === "technical").length;
	const technicalTotal = allKeywords.filter((k) => k.category === "technical").length;
	const softMatched = matchedKeywords.filter((k) => k.category === "soft").length;
	const softTotal = allKeywords.filter((k) => k.category === "soft").length;
	const certMatched = matchedKeywords.filter((k) => k.category === "certification").length;
	const certTotal = allKeywords.filter((k) => k.category === "certification").length;

	const scoreBreakdown = {
		technicalSkills: technicalTotal > 0 ? Math.round((technicalMatched / technicalTotal) * 100) : 0,
		softSkills: softTotal > 0 ? Math.round((softMatched / softTotal) * 100) : 0,
		certifications: certTotal > 0 ? Math.round((certMatched / certTotal) * 100) : 0,
		industryTerms: Math.min(100, Math.round((matchedKeywords.length / 15) * 100)),
		overall: 0,
	};
	scoreBreakdown.overall = Math.round(
		scoreBreakdown.technicalSkills * 0.4 +
			scoreBreakdown.softSkills * 0.25 +
			scoreBreakdown.certifications * 0.2 +
			scoreBreakdown.industryTerms * 0.15,
	);

	// Generate suggestions
	const suggestions: string[] = [];
	if (missingKeywords.filter((k) => k.category === "technical").length > 3) {
		suggestions.push(t`Add more technical skills mentioned in the job posting`);
	}
	if (missingKeywords.filter((k) => k.category === "soft").length > 2) {
		suggestions.push(
			t`Include soft skills such as ${missingKeywords
				.filter((k) => k.category === "soft")
				.slice(0, 2)
				.map((k) => k.keyword)
				.join(", ")}`,
		);
	}
	if (missingKeywords.filter((k) => k.category === "certification").length > 0) {
		suggestions.push(t`Mention your relevant certifications if you have any`);
	}
	if (keywordDensity.some((k) => k.status === "low")) {
		suggestions.push(t`Increase the frequency of important keywords in your resume`);
	}
	if (keywordDensity.some((k) => k.status === "high")) {
		suggestions.push(t`Avoid over-optimization - vary your vocabulary`);
	}

	// Get industry-specific suggestions
	const industryKeywords = [...industryData.technical.slice(0, 5), ...industryData.soft.slice(0, 3)];

	const matchPercentage =
		matchedKeywords.length + missingKeywords.length > 0
			? Math.round((matchedKeywords.length / (matchedKeywords.length + missingKeywords.length)) * 100)
			: 0;

	return {
		matchPercentage,
		scoreBreakdown,
		matchedKeywords,
		missingKeywords,
		keywordDensity,
		suggestions,
		industryKeywords,
	};
}

export function getScoreColor(score: number): string {
	if (score >= 80) return "text-green-600 dark:text-green-400";
	if (score >= 60) return "text-amber-600 dark:text-amber-400";
	return "text-red-600 dark:text-red-400";
}

export function getScoreBgColor(score: number): string {
	if (score >= 80) return "bg-green-500";
	if (score >= 60) return "bg-amber-500";
	return "bg-red-500";
}

export function getScoreLabel(score: number): string {
	if (score >= 80) return "Excellent";
	if (score >= 60) return "Good";
	if (score >= 40) return "Average";
	return "Poor";
}

export function getCategoryColor(category: string): string {
	switch (category) {
		case "technical":
			return "border-blue-500/50 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400";
		case "soft":
			return "border-purple-500/50 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400";
		case "certification":
			return "border-green-500/50 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400";
		default:
			return "border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
	}
}

export function getDensityColor(status: string): string {
	switch (status) {
		case "optimal":
			return "bg-green-500";
		case "low":
			return "bg-amber-500";
		case "high":
			return "bg-red-500";
		default:
			return "bg-gray-500";
	}
}
