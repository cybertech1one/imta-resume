import { eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	LinkedInChecklistItem,
	LinkedInHeadlineSuggestion,
	LinkedInIndustry,
	LinkedInPhotoTip,
	LinkedInSummarySuggestion,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Default photo tips
const defaultPhotoTips: LinkedInPhotoTip[] = [
	{
		id: "professional",
		title: "Professional photo",
		description: "Use a recent, high-quality photo, taken by a professional if possible",
		iconName: "CameraIcon",
		checked: false,
	},
	{
		id: "face-visible",
		title: "Face clearly visible",
		description: "Your face should take up 60% of the image, with natural lighting",
		iconName: "UserCircleIcon",
		checked: false,
	},
	{
		id: "background",
		title: "Neutral background",
		description: "Choose a solid or simple background that doesn't distract",
		iconName: "ImageIcon",
		checked: false,
	},
	{
		id: "dress-code",
		title: "Appropriate attire",
		description: "Wear clothing consistent with your industry",
		iconName: "BriefcaseIcon",
		checked: false,
	},
	{
		id: "smile",
		title: "Welcoming expression",
		description: "A slight smile projects confidence and approachability",
		iconName: "StarIcon",
		checked: false,
	},
	{
		id: "recent",
		title: "Recent photo",
		description: "Update your photo every 2-3 years or after a significant change",
		iconName: "ArrowsClockwiseIcon",
		checked: false,
	},
];

// Industry-specific keywords
const industryKeywords: Record<
	LinkedInIndustry,
	{ keyword: string; searchVolume: string; competition: string; recommended: boolean }[]
> = {
	technology: [
		{ keyword: "Full Stack Developer", searchVolume: "high", competition: "high", recommended: true },
		{ keyword: "Cloud Architecture", searchVolume: "high", competition: "medium", recommended: true },
		{ keyword: "DevOps Engineer", searchVolume: "high", competition: "medium", recommended: true },
		{ keyword: "Data Scientist", searchVolume: "high", competition: "high", recommended: true },
		{ keyword: "Cybersecurity", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Agile Coach", searchVolume: "medium", competition: "low", recommended: true },
		{ keyword: "Tech Lead", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "AI/ML Engineer", searchVolume: "high", competition: "medium", recommended: true },
	],
	finance: [
		{ keyword: "Financial Analyst", searchVolume: "high", competition: "high", recommended: true },
		{ keyword: "Risk Manager", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Investment Banking", searchVolume: "high", competition: "high", recommended: false },
		{ keyword: "Financial Auditor", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Compliance Officer", searchVolume: "medium", competition: "low", recommended: true },
		{ keyword: "CFO", searchVolume: "medium", competition: "high", recommended: false },
		{ keyword: "Private Equity", searchVolume: "medium", competition: "high", recommended: false },
		{ keyword: "Financial Controller", searchVolume: "medium", competition: "medium", recommended: true },
	],
	healthcare: [
		{ keyword: "Healthcare Professional", searchVolume: "high", competition: "medium", recommended: true },
		{ keyword: "Clinical Research", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Healthcare Management", searchVolume: "high", competition: "medium", recommended: true },
		{ keyword: "Medical Affairs", searchVolume: "medium", competition: "low", recommended: true },
		{ keyword: "Patient Care", searchVolume: "high", competition: "low", recommended: true },
		{ keyword: "Health Informatics", searchVolume: "medium", competition: "low", recommended: true },
		{ keyword: "Pharmaceutical", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Biotechnology", searchVolume: "medium", competition: "medium", recommended: true },
	],
	marketing: [
		{ keyword: "Digital Marketing Manager", searchVolume: "high", competition: "high", recommended: true },
		{ keyword: "Content Strategist", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "SEO Specialist", searchVolume: "high", competition: "medium", recommended: true },
		{ keyword: "Brand Manager", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Growth Hacker", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Social Media Manager", searchVolume: "high", competition: "high", recommended: true },
		{ keyword: "Marketing Director", searchVolume: "high", competition: "high", recommended: false },
		{ keyword: "Performance Marketing", searchVolume: "medium", competition: "medium", recommended: true },
	],
	engineering: [
		{ keyword: "Production Engineer", searchVolume: "high", competition: "medium", recommended: true },
		{ keyword: "Industrial Project Manager", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Quality Engineer", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Lean Manager", searchVolume: "medium", competition: "low", recommended: true },
		{ keyword: "Process Engineer", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "R&D Engineer", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Technical Director", searchVolume: "medium", competition: "high", recommended: false },
		{ keyword: "Operations Manager", searchVolume: "high", competition: "medium", recommended: true },
	],
	education: [
		{ keyword: "Trainer", searchVolume: "high", competition: "medium", recommended: true },
		{ keyword: "E-Learning Designer", searchVolume: "medium", competition: "low", recommended: true },
		{ keyword: "Education Consultant", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Curriculum Developer", searchVolume: "low", competition: "low", recommended: true },
		{ keyword: "Academic Director", searchVolume: "low", competition: "medium", recommended: false },
		{ keyword: "EdTech", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Learning & Development", searchVolume: "high", competition: "medium", recommended: true },
		{ keyword: "Corporate Trainer", searchVolume: "medium", competition: "medium", recommended: true },
	],
	consulting: [
		{ keyword: "Management Consultant", searchVolume: "high", competition: "high", recommended: true },
		{ keyword: "Strategy Consultant", searchVolume: "medium", competition: "high", recommended: false },
		{ keyword: "Business Analyst", searchVolume: "high", competition: "medium", recommended: true },
		{ keyword: "Change Management", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Digital Transformation", searchVolume: "high", competition: "medium", recommended: true },
		{ keyword: "Operations Consulting", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Partner", searchVolume: "low", competition: "high", recommended: false },
		{ keyword: "Senior Consultant", searchVolume: "medium", competition: "medium", recommended: true },
	],
	general: [
		{ keyword: "Project Manager", searchVolume: "high", competition: "high", recommended: true },
		{ keyword: "Manager", searchVolume: "high", competition: "high", recommended: false },
		{ keyword: "Team Leader", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Business Developer", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Account Manager", searchVolume: "high", competition: "medium", recommended: true },
		{ keyword: "Operations", searchVolume: "medium", competition: "medium", recommended: true },
		{ keyword: "Coordinator", searchVolume: "medium", competition: "low", recommended: true },
		{ keyword: "Specialist", searchVolume: "medium", competition: "low", recommended: true },
	],
};

export type UpdateLinkedInProfileInput = {
	userId: string;
	industry?: LinkedInIndustry;
	currentRole?: string;
	currentHeadline?: string;
	currentSummary?: string;
	yearsExperience?: number;
	hasProfilePhoto?: boolean;
	skillsCount?: number;
	experienceCount?: number;
	connectionsCount?: number;
	photoTips?: LinkedInPhotoTip[];
	checklist?: LinkedInChecklistItem[];
	headlineSuggestions?: LinkedInHeadlineSuggestion[];
	summarySuggestions?: LinkedInSummarySuggestion[];
};

// Generate headline suggestions based on role and industry
function generateHeadlineSuggestions(currentRole: string, industry: LinkedInIndustry): LinkedInHeadlineSuggestion[] {
	const roleKeywords = industryKeywords[industry].filter((k) => k.recommended).slice(0, 3);

	return [
		{
			id: generateId(),
			headline: `${currentRole || "Expert"} | ${roleKeywords[0]?.keyword || "Specialist"} | Passionate about innovation and results`,
			keywords: [currentRole, roleKeywords[0]?.keyword || "Innovation"].filter(Boolean),
			tone: "professional",
		},
		{
			id: generateId(),
			headline: `Turn your challenges into opportunities | ${currentRole || "Consultant"} ${industry === "technology" ? "Tech" : ""} | 10+ years of experience`,
			keywords: [currentRole, "Transformation", "Experience"].filter(Boolean),
			tone: "creative",
		},
		{
			id: generateId(),
			headline: `${currentRole || "Director"} | ${roleKeywords[1]?.keyword || "Industry"} Expert | Leader | Strategy & Execution`,
			keywords: [currentRole, roleKeywords[1]?.keyword || "Leadership", "Strategy"].filter(Boolean),
			tone: "executive",
		},
	];
}

// Generate summary suggestions
function generateSummarySuggestions(
	currentRole: string,
	industry: LinkedInIndustry,
	yearsExperience: number,
): LinkedInSummarySuggestion[] {
	const keywords = industryKeywords[industry].filter((k) => k.recommended).slice(0, 4);
	const industryLabel = {
		technology: "Technology / IT",
		finance: "Finance / Banking",
		healthcare: "Healthcare / Medical",
		marketing: "Marketing / Communication",
		engineering: "Engineering",
		education: "Education",
		consulting: "Consulting",
		general: "General",
	}[industry];

	return [
		{
			id: generateId(),
			summary: `Passionate ${currentRole || "Professional"} with ${yearsExperience}+ years of experience in ${industryLabel}.

My expertise covers ${keywords
				.slice(0, 2)
				.map((k) => k.keyword)
				.join(
					", ",
				)}. I have supported numerous organizations in their transformation, delivering measurable and lasting results.

What drives me: solving complex problems, developing talent, and creating value. I firmly believe that collaboration and innovation are the keys to success.

Open to conversations and new opportunities - feel free to reach out!`,
			wordCount: 85,
			keywords: keywords.map((k) => k.keyword),
		},
		{
			id: generateId(),
			summary: `"Success is not a destination, it's a constant journey of learning and improvement."

With ${yearsExperience} years in ${industryLabel}, I have had the privilege to:

- Lead strategic projects from A to Z
- Build high-performing teams
- Implement innovative solutions in ${keywords[0]?.keyword || "my field"}

Specialties: ${keywords.map((k) => k.keyword).join(" | ")}

Always ready for an enriching conversation about industry trends or collaboration opportunities.`,
			wordCount: 90,
			keywords: keywords.map((k) => k.keyword),
		},
	];
}

// Generate checklist items based on current profile state
function generateChecklistItems(
	photoTips: LinkedInPhotoTip[],
	currentHeadline: string,
	currentSummary: string,
	skillsCount: number,
	connectionsCount: number,
	industry: LinkedInIndustry,
): LinkedInChecklistItem[] {
	const keywords = industryKeywords[industry];

	return [
		// Photo items
		...photoTips.map((tip) => ({
			id: tip.id,
			category: "Profile Photo",
			item: tip.title,
			completed: tip.checked,
			priority: "high" as const,
		})),
		// Headline items
		{
			id: "headline-length",
			category: "Professional Headline",
			item: "Headline of 120 characters maximum with keywords",
			completed: currentHeadline.length >= 50 && currentHeadline.length <= 120,
			priority: "high",
		},
		{
			id: "headline-keywords",
			category: "Professional Headline",
			item: "Include keywords searched by recruiters",
			completed: keywords.some((k) => currentHeadline.toLowerCase().includes(k.keyword.toLowerCase())),
			priority: "high",
		},
		// Summary items
		{
			id: "summary-length",
			category: "Professional Summary",
			item: "Summary of 1500-2000 characters",
			completed: currentSummary.length >= 500,
			priority: "high",
		},
		{
			id: "summary-cta",
			category: "Professional Summary",
			item: "Include a call to action",
			completed: currentSummary.toLowerCase().includes("contact") || currentSummary.toLowerCase().includes("reach"),
			priority: "medium",
		},
		// Skills items
		{
			id: "skills-count",
			category: "Skills",
			item: "Add at least 30 skills",
			completed: skillsCount >= 30,
			priority: "medium",
		},
		{
			id: "skills-endorsements",
			category: "Skills",
			item: "Get endorsements for your top 5 skills",
			completed: false,
			priority: "low",
		},
		// Connections
		{
			id: "connections-500",
			category: "Network",
			item: "Reach 500+ connections",
			completed: connectionsCount >= 500,
			priority: "medium",
		},
		// Engagement
		{
			id: "posting",
			category: "Engagement",
			item: "Post regularly (2-3x per week)",
			completed: false,
			priority: "medium",
		},
		{
			id: "commenting",
			category: "Engagement",
			item: "Comment on posts in your industry",
			completed: false,
			priority: "low",
		},
	];
}

export const linkedinService = {
	// Get or create profile for user
	getOrCreate: async (userId: string) => {
		const [existing] = await db.select().from(schema.linkedinProfile).where(eq(schema.linkedinProfile.userId, userId));

		if (existing) {
			return existing;
		}

		// Create new profile with defaults
		const id = generateId();
		await db.insert(schema.linkedinProfile).values({
			id,
			userId,
			industry: "general",
			currentRole: "",
			currentHeadline: "",
			currentSummary: "",
			yearsExperience: 5,
			hasProfilePhoto: true,
			skillsCount: 10,
			experienceCount: 3,
			connectionsCount: 200,
			photoTips: defaultPhotoTips,
			checklist: [],
			headlineSuggestions: [],
			summarySuggestions: [],
		});

		const [newProfile] = await db
			.select()
			.from(schema.linkedinProfile)
			.where(eq(schema.linkedinProfile.userId, userId));

		// The newProfile should always exist after the insert
		if (!newProfile) {
			throw new Error("Failed to create LinkedIn profile");
		}

		return newProfile;
	},

	// Update profile
	update: async (input: UpdateLinkedInProfileInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.linkedinProfile.id })
			.from(schema.linkedinProfile)
			.where(eq(schema.linkedinProfile.userId, input.userId));

		if (!existing) {
			// Create if not exists
			const id = generateId();
			await db.insert(schema.linkedinProfile).values({
				id,
				userId: input.userId,
				industry: input.industry ?? "general",
				currentRole: input.currentRole ?? "",
				currentHeadline: input.currentHeadline ?? "",
				currentSummary: input.currentSummary ?? "",
				yearsExperience: input.yearsExperience ?? 5,
				hasProfilePhoto: input.hasProfilePhoto ?? true,
				skillsCount: input.skillsCount ?? 10,
				experienceCount: input.experienceCount ?? 3,
				connectionsCount: input.connectionsCount ?? 200,
				photoTips: input.photoTips ?? defaultPhotoTips,
				checklist: input.checklist ?? [],
				headlineSuggestions: input.headlineSuggestions ?? [],
				summarySuggestions: input.summarySuggestions ?? [],
			});
			return;
		}

		await db
			.update(schema.linkedinProfile)
			.set({
				industry: input.industry,
				currentRole: input.currentRole,
				currentHeadline: input.currentHeadline,
				currentSummary: input.currentSummary,
				yearsExperience: input.yearsExperience,
				hasProfilePhoto: input.hasProfilePhoto,
				skillsCount: input.skillsCount,
				experienceCount: input.experienceCount,
				connectionsCount: input.connectionsCount,
				photoTips: input.photoTips,
				checklist: input.checklist,
				headlineSuggestions: input.headlineSuggestions,
				summarySuggestions: input.summarySuggestions,
			})
			.where(eq(schema.linkedinProfile.userId, input.userId));
	},

	// Toggle photo tip checked state
	togglePhotoTip: async (input: { userId: string; tipId: string }): Promise<LinkedInPhotoTip[]> => {
		const profile = await linkedinService.getOrCreate(input.userId);
		const photoTips = profile.photoTips.map((tip) =>
			tip.id === input.tipId ? { ...tip, checked: !tip.checked } : tip,
		);

		await db.update(schema.linkedinProfile).set({ photoTips }).where(eq(schema.linkedinProfile.userId, input.userId));

		return photoTips;
	},

	// Generate headline suggestions
	generateHeadlines: async (input: {
		userId: string;
		currentRole: string;
		industry: LinkedInIndustry;
	}): Promise<LinkedInHeadlineSuggestion[]> => {
		const suggestions = generateHeadlineSuggestions(input.currentRole, input.industry);

		// Save to profile
		await db
			.update(schema.linkedinProfile)
			.set({ headlineSuggestions: suggestions })
			.where(eq(schema.linkedinProfile.userId, input.userId));

		return suggestions;
	},

	// Generate summary suggestions
	generateSummaries: async (input: {
		userId: string;
		currentRole: string;
		industry: LinkedInIndustry;
		yearsExperience: number;
	}): Promise<LinkedInSummarySuggestion[]> => {
		const suggestions = generateSummarySuggestions(input.currentRole, input.industry, input.yearsExperience);

		// Save to profile
		await db
			.update(schema.linkedinProfile)
			.set({ summarySuggestions: suggestions })
			.where(eq(schema.linkedinProfile.userId, input.userId));

		return suggestions;
	},

	// Generate checklist
	generateChecklist: async (input: { userId: string }): Promise<LinkedInChecklistItem[]> => {
		const profile = await linkedinService.getOrCreate(input.userId);

		const checklist = generateChecklistItems(
			profile.photoTips,
			profile.currentHeadline ?? "",
			profile.currentSummary ?? "",
			profile.skillsCount,
			profile.connectionsCount,
			profile.industry,
		);

		// Save to profile
		await db.update(schema.linkedinProfile).set({ checklist }).where(eq(schema.linkedinProfile.userId, input.userId));

		return checklist;
	},

	// Toggle checklist item
	toggleChecklistItem: async (input: { userId: string; itemId: string }): Promise<LinkedInChecklistItem[]> => {
		const profile = await linkedinService.getOrCreate(input.userId);
		const checklist = profile.checklist.map((item) =>
			item.id === input.itemId ? { ...item, completed: !item.completed } : item,
		);

		await db.update(schema.linkedinProfile).set({ checklist }).where(eq(schema.linkedinProfile.userId, input.userId));

		return checklist;
	},

	// Get industry keywords
	getIndustryKeywords: async (input: { industry: LinkedInIndustry }) => {
		return industryKeywords[input.industry];
	},

	// Get skill recommendations for an industry
	getIndustrySkills: async (input: { industry: LinkedInIndustry }) => {
		const industrySkillsData: Record<
			LinkedInIndustry,
			{
				skill: string;
				category: "technical" | "soft" | "industry";
				relevance: "high" | "medium" | "low";
				inDemand: boolean;
			}[]
		> = {
			technology: [
				{ skill: "JavaScript", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Python", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Cloud Computing", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Machine Learning", category: "technical", relevance: "high", inDemand: true },
				{ skill: "DevOps", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Agile Methodologies", category: "industry", relevance: "medium", inDemand: true },
				{ skill: "Problem Solving", category: "soft", relevance: "high", inDemand: false },
				{ skill: "Team Leadership", category: "soft", relevance: "medium", inDemand: false },
			],
			finance: [
				{ skill: "Financial Analysis", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Risk Management", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Excel/VBA", category: "technical", relevance: "medium", inDemand: false },
				{ skill: "Bloomberg Terminal", category: "technical", relevance: "medium", inDemand: true },
				{ skill: "Financial Modeling", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Regulatory Compliance", category: "industry", relevance: "high", inDemand: true },
				{ skill: "Analytical Thinking", category: "soft", relevance: "high", inDemand: false },
				{ skill: "Attention to Detail", category: "soft", relevance: "medium", inDemand: false },
			],
			healthcare: [
				{ skill: "Patient Care", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Medical Records (EMR)", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Clinical Research", category: "technical", relevance: "medium", inDemand: true },
				{ skill: "Healthcare Management", category: "industry", relevance: "high", inDemand: true },
				{ skill: "HIPAA Compliance", category: "industry", relevance: "high", inDemand: true },
				{ skill: "Empathy", category: "soft", relevance: "high", inDemand: false },
				{ skill: "Communication", category: "soft", relevance: "high", inDemand: false },
				{ skill: "Crisis Management", category: "soft", relevance: "medium", inDemand: false },
			],
			marketing: [
				{ skill: "Digital Marketing", category: "technical", relevance: "high", inDemand: true },
				{ skill: "SEO/SEM", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Content Strategy", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Social Media Marketing", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Google Analytics", category: "technical", relevance: "medium", inDemand: true },
				{ skill: "Brand Management", category: "industry", relevance: "high", inDemand: true },
				{ skill: "Creativity", category: "soft", relevance: "high", inDemand: false },
				{ skill: "Storytelling", category: "soft", relevance: "medium", inDemand: false },
			],
			engineering: [
				{ skill: "CAD/CAM", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Project Management", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Lean Manufacturing", category: "industry", relevance: "high", inDemand: true },
				{ skill: "Quality Control", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Six Sigma", category: "industry", relevance: "medium", inDemand: true },
				{ skill: "Technical Documentation", category: "technical", relevance: "medium", inDemand: false },
				{ skill: "Problem Solving", category: "soft", relevance: "high", inDemand: false },
				{ skill: "Collaboration", category: "soft", relevance: "medium", inDemand: false },
			],
			education: [
				{ skill: "Curriculum Development", category: "technical", relevance: "high", inDemand: true },
				{ skill: "E-Learning", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Student Assessment", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Educational Technology", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Classroom Management", category: "industry", relevance: "high", inDemand: false },
				{ skill: "Communication", category: "soft", relevance: "high", inDemand: false },
				{ skill: "Patience", category: "soft", relevance: "high", inDemand: false },
				{ skill: "Adaptability", category: "soft", relevance: "medium", inDemand: false },
			],
			consulting: [
				{ skill: "Business Strategy", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Data Analysis", category: "technical", relevance: "high", inDemand: true },
				{ skill: "PowerPoint/Presentations", category: "technical", relevance: "medium", inDemand: false },
				{ skill: "Stakeholder Management", category: "industry", relevance: "high", inDemand: true },
				{ skill: "Change Management", category: "industry", relevance: "high", inDemand: true },
				{ skill: "Critical Thinking", category: "soft", relevance: "high", inDemand: false },
				{ skill: "Client Relations", category: "soft", relevance: "high", inDemand: false },
				{ skill: "Influence", category: "soft", relevance: "medium", inDemand: false },
			],
			general: [
				{ skill: "Microsoft Office", category: "technical", relevance: "medium", inDemand: false },
				{ skill: "Project Management", category: "technical", relevance: "high", inDemand: true },
				{ skill: "Communication", category: "soft", relevance: "high", inDemand: false },
				{ skill: "Leadership", category: "soft", relevance: "high", inDemand: false },
				{ skill: "Problem Solving", category: "soft", relevance: "high", inDemand: false },
				{ skill: "Time Management", category: "soft", relevance: "medium", inDemand: false },
				{ skill: "Teamwork", category: "soft", relevance: "medium", inDemand: false },
				{ skill: "Adaptability", category: "soft", relevance: "medium", inDemand: false },
			],
		};
		return industrySkillsData[input.industry];
	},

	// Get connection strategies
	getConnectionStrategies: async () => {
		return [
			{
				id: "second-degree",
				title: "2nd Degree Connections",
				description: "Connect with people who already know your contacts",
				tips: [
					"Mention the mutual contact in your message",
					"Customize each connection request",
					"Briefly explain why you want to connect",
				],
				priority: "high" as const,
			},
			{
				id: "alumni",
				title: "Alumni Network",
				description: "Reconnect with former classmates and professors",
				tips: ["Join your school/university groups", "Participate in alumni events", "Share your class's successes"],
				priority: "high" as const,
			},
			{
				id: "industry-events",
				title: "Industry Events",
				description: "Connect with attendees after conferences and webinars",
				tips: [
					"Mention the event in your request",
					"Propose to continue the discussion",
					"Send the request within 48 hours of the event",
				],
				priority: "medium" as const,
			},
			{
				id: "thought-leaders",
				title: "Thought Leaders",
				description: "Follow and interact with influencers in your industry",
				tips: [
					"Regularly comment on their publications",
					"Share their content with your own insights",
					"Wait until you've established a presence before connecting",
				],
				priority: "medium" as const,
			},
			{
				id: "recruiters",
				title: "Targeted Recruiters",
				description: "Identify and connect with recruiters in your industry",
				tips: [
					"Search for recruiters by company or industry",
					"Clearly state your professional intentions",
					"Maintain regular but non-intrusive communication",
				],
				priority: "high" as const,
			},
			{
				id: "content-engagement",
				title: "Content Engagement",
				description: "Connect after interacting on publications",
				tips: [
					"Comment substantively before connecting",
					"Reference their content in your message",
					"Show that you bring value",
				],
				priority: "low" as const,
			},
		];
	},

	// Get engagement tips
	getEngagementTips: async () => {
		return [
			{
				id: "post-regularly",
				category: "posting" as const,
				title: "Post regularly",
				description: "Share valuable content 2-3 times per week to maintain your visibility",
				frequency: "2-3 times/week",
				iconName: "PencilSimpleIcon",
			},
			{
				id: "best-times",
				category: "posting" as const,
				title: "Optimal times",
				description: "Post between 8-10 AM or 5-6 PM on weekdays to maximize engagement",
				frequency: "Morning or end of day",
				iconName: "TargetIcon",
			},
			{
				id: "use-hashtags",
				category: "posting" as const,
				title: "Strategic hashtags",
				description: "Use 3-5 relevant hashtags per post to improve discoverability",
				frequency: "3-5 per post",
				iconName: "HashIcon",
			},
			{
				id: "comment-early",
				category: "commenting" as const,
				title: "Comment first",
				description: "Be among the first to comment on popular posts in your industry",
				frequency: "5-10 comments/day",
				iconName: "ChatCircleIcon",
			},
			{
				id: "add-value",
				category: "commenting" as const,
				title: "Valuable comments",
				description: "Add insights, questions, or experiences rather than simple reactions",
				frequency: "Quality > Quantity",
				iconName: "LightbulbIcon",
			},
			{
				id: "share-insights",
				category: "sharing" as const,
				title: "Share with context",
				description: "Add your personal perspective when sharing content",
				frequency: "1-2 times/week",
				iconName: "ShareNetworkIcon",
			},
			{
				id: "engage-back",
				category: "networking" as const,
				title: "Reciprocity",
				description: "Reply to comments on your posts and engage with those who interact",
				frequency: "Within 24h",
				iconName: "ArrowsClockwiseIcon",
			},
			{
				id: "dm-strategy",
				category: "networking" as const,
				title: "Strategic direct messages",
				description: "Send personalized messages to deepen professional relationships",
				frequency: "2-3 per week",
				iconName: "MegaphoneIcon",
			},
		];
	},

	// Get industries list
	getIndustries: async () => {
		return [
			{ value: "technology" as const, label: "Technology / IT" },
			{ value: "finance" as const, label: "Finance / Banking" },
			{ value: "healthcare" as const, label: "Healthcare / Medical" },
			{ value: "marketing" as const, label: "Marketing / Communication" },
			{ value: "engineering" as const, label: "Engineering" },
			{ value: "education" as const, label: "Education" },
			{ value: "consulting" as const, label: "Consulting" },
			{ value: "general" as const, label: "General" },
		];
	},

	// Calculate profile score
	calculateScore: (profile: {
		hasProfilePhoto: boolean;
		currentHeadline: string;
		currentSummary: string;
		skillsCount: number;
		experienceCount: number;
		connectionsCount: number;
	}) => {
		const photo = profile.hasProfilePhoto ? 100 : 0;
		const headline = Math.min(100, ((profile.currentHeadline?.length ?? 0) / 120) * 100);
		const summary = Math.min(100, ((profile.currentSummary?.length ?? 0) / 2000) * 100);
		const skills = Math.min(100, (profile.skillsCount / 50) * 100);
		const experience = Math.min(100, (profile.experienceCount / 5) * 100);
		const connections = Math.min(100, (profile.connectionsCount / 500) * 100);
		const engagement = 60; // Default value

		const overall = Math.round((photo + headline + summary + skills + experience + connections + engagement) / 7);

		return {
			overall,
			photo,
			headline: Math.round(headline),
			summary: Math.round(summary),
			experience: Math.round(experience),
			skills: Math.round(skills),
			connections: Math.round(connections),
			engagement,
		};
	},
};
