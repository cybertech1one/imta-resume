import { calculateSuccessProbability, generateId } from "./roadmap-config";
import type { AlternativePath, CareerGoal, Milestone, Resource, RoadmapStep, SkillRequirement } from "./roadmap-types";

// AI Generation functions (simulated)
export function generateAIRoadmaps(goal: CareerGoal): AlternativePath[] {
	const {
		targetRole,
		industry,
		yearsExperience: _yearsExperience,
		timeline,
		priorities: _priorities,
		constraints,
	} = goal;

	// Generate skills based on industry and role
	const skillSets: Record<
		string,
		{ name: string; category: SkillRequirement["category"]; priority: SkillRequirement["priority"] }[]
	> = {
		healthcare: [
			{ name: "Patient Care", category: "technical", priority: "critical" },
			{ name: "Medical Terminology", category: "technical", priority: "critical" },
			{ name: "Healthcare IT Systems", category: "tool", priority: "important" },
			{ name: "Communication", category: "soft", priority: "critical" },
			{ name: "Empathy & Compassion", category: "soft", priority: "important" },
			{ name: "First Aid Certification", category: "certification", priority: "critical" },
			{ name: "Medical French", category: "language", priority: "important" },
		],
		technology: [
			{ name: "Programming Languages", category: "technical", priority: "critical" },
			{ name: "System Design", category: "technical", priority: "important" },
			{ name: "Cloud Platforms (AWS/GCP/Azure)", category: "tool", priority: "critical" },
			{ name: "Agile Methodology", category: "soft", priority: "important" },
			{ name: "Problem Solving", category: "soft", priority: "critical" },
			{ name: "Technical English", category: "language", priority: "important" },
			{ name: "Industry Certifications", category: "certification", priority: "nice-to-have" },
		],
		industrial: [
			{ name: "Machine Operation", category: "technical", priority: "critical" },
			{ name: "Quality Control", category: "technical", priority: "critical" },
			{ name: "Safety Procedures", category: "technical", priority: "critical" },
			{ name: "Lean Manufacturing", category: "technical", priority: "important" },
			{ name: "CAD/CAM Software", category: "tool", priority: "important" },
			{ name: "ISO Standards", category: "certification", priority: "important" },
			{ name: "Team Leadership", category: "soft", priority: "nice-to-have" },
		],
		hse: [
			{ name: "Risk Assessment", category: "technical", priority: "critical" },
			{ name: "Safety Management Systems", category: "technical", priority: "critical" },
			{ name: "Incident Investigation", category: "technical", priority: "important" },
			{ name: "ISO 45001", category: "certification", priority: "critical" },
			{ name: "NEBOSH", category: "certification", priority: "important" },
			{ name: "Leadership & Influence", category: "soft", priority: "important" },
			{ name: "Technical Reporting", category: "soft", priority: "important" },
		],
		finance: [
			{ name: "Financial Analysis", category: "technical", priority: "critical" },
			{ name: "Excel & Financial Modeling", category: "tool", priority: "critical" },
			{ name: "Risk Management", category: "technical", priority: "important" },
			{ name: "Regulatory Compliance", category: "technical", priority: "important" },
			{ name: "CFA/CPA", category: "certification", priority: "important" },
			{ name: "Analytical Thinking", category: "soft", priority: "critical" },
			{ name: "Business English", category: "language", priority: "important" },
		],
		marketing: [
			{ name: "Digital Marketing", category: "technical", priority: "critical" },
			{ name: "Content Strategy", category: "technical", priority: "important" },
			{ name: "Analytics Tools", category: "tool", priority: "critical" },
			{ name: "SEO/SEM", category: "technical", priority: "important" },
			{ name: "Creativity", category: "soft", priority: "critical" },
			{ name: "Communication", category: "soft", priority: "critical" },
			{ name: "Google/Meta Certifications", category: "certification", priority: "nice-to-have" },
		],
	};

	const industrySkills = skillSets[industry] || [
		{ name: "Industry Knowledge", category: "technical" as const, priority: "critical" as const },
		{ name: "Communication", category: "soft" as const, priority: "critical" as const },
		{ name: "Problem Solving", category: "soft" as const, priority: "important" as const },
		{ name: "Leadership", category: "soft" as const, priority: "nice-to-have" as const },
		{ name: "Professional English", category: "language" as const, priority: "important" as const },
	];

	// Generate resources for skills
	const generateResources = (skillName: string): Resource[] => [
		{
			id: generateId(),
			title: `${skillName} Complete Course`,
			type: "course",
			platform: "Coursera",
			url: "https://coursera.org",
			duration: "40 hours",
			cost: "subscription",
			rating: 4.5,
			recommended: true,
		},
		{
			id: generateId(),
			title: `${skillName} Practical Guide`,
			type: "book",
			platform: "O'Reilly",
			url: "https://oreilly.com",
			duration: "15 hours",
			cost: "paid",
			rating: 4.2,
			recommended: false,
		},
		{
			id: generateId(),
			title: `${skillName} Tutorial Series`,
			type: "video",
			platform: "YouTube",
			url: "https://youtube.com",
			duration: "5 hours",
			cost: "free",
			rating: 4.0,
			recommended: true,
		},
	];

	// Generate skill requirements
	const generateSkillRequirements = (): SkillRequirement[] =>
		industrySkills.map((skill, _index) => ({
			id: generateId(),
			name: skill.name,
			category: skill.category,
			currentLevel: Math.floor(Math.random() * 3), // 0-2 current level
			requiredLevel: skill.priority === "critical" ? 5 : skill.priority === "important" ? 4 : 3,
			priority: skill.priority,
			resources: generateResources(skill.name),
		}));

	// Generate milestones
	const generateMilestones = (stepTitle: string, weekOffset: number): Milestone[] => [
		{
			id: generateId(),
			title: `Begin ${stepTitle}`,
			description: `Start working on ${stepTitle.toLowerCase()}`,
			targetDate: new Date(Date.now() + weekOffset * 7 * 24 * 60 * 60 * 1000).toISOString(),
			completed: false,
			type: "checkpoint",
		},
		{
			id: generateId(),
			title: `Complete ${stepTitle} Assessment`,
			description: "Validate your progress through assessment",
			targetDate: new Date(Date.now() + (weekOffset + 4) * 7 * 24 * 60 * 60 * 1000).toISOString(),
			completed: false,
			type: "achievement",
		},
	];

	// Generate standard path steps
	const generateStandardSteps = (): RoadmapStep[] => {
		const skills = generateSkillRequirements();
		const totalWeeks = timeline * 4;
		const weeksPerStep = Math.floor(totalWeeks / 5);
		// Pre-calculate offsets for each step
		const step1Offset = 0;
		const step2Offset = weeksPerStep;
		const step3Offset = weeksPerStep * 2;
		const step4Offset = weeksPerStep * 3;

		return [
			{
				id: generateId(),
				order: 1,
				title: "Foundation Building",
				description: "Establish core knowledge and fundamental skills required for your target role.",
				type: "skill",
				duration: weeksPerStep,
				skills: skills.filter((s) => s.priority === "critical"),
				milestones: generateMilestones("Foundation Building", step1Offset),
				resources: skills.flatMap((s) => s.resources).slice(0, 5),
				completed: false,
			},
			{
				id: generateId(),
				order: 2,
				title: "Skill Enhancement",
				description: "Develop advanced skills and gain practical experience through projects.",
				type: "experience",
				duration: weeksPerStep,
				skills: skills.filter((s) => s.priority === "important"),
				milestones: generateMilestones("Skill Enhancement", step2Offset),
				resources: skills.flatMap((s) => s.resources).slice(5, 10),
				estimatedSalary: { min: 5000, max: 8000 },
				completed: false,
			},
			{
				id: generateId(),
				order: 3,
				title: "Certification & Validation",
				description: "Obtain relevant certifications to validate your expertise.",
				type: "certification",
				duration: weeksPerStep,
				skills: skills.filter((s) => s.category === "certification"),
				milestones: generateMilestones("Certification", step3Offset),
				resources: skills.flatMap((s) => s.resources).slice(0, 3),
				completed: false,
			},
			{
				id: generateId(),
				order: 4,
				title: "Network & Brand Building",
				description: "Build professional network and establish your personal brand.",
				type: "networking",
				duration: weeksPerStep,
				skills: skills.filter((s) => s.category === "soft"),
				milestones: generateMilestones("Networking", step4Offset),
				resources: [
					{
						id: generateId(),
						title: "LinkedIn Profile Optimization",
						type: "article",
						platform: "LinkedIn",
						url: "https://linkedin.com",
						duration: "2 hours",
						cost: "free",
						recommended: true,
					},
					{
						id: generateId(),
						title: "Professional Networking Guide",
						type: "course",
						platform: "Coursera",
						url: "https://coursera.org",
						duration: "10 hours",
						cost: "free",
						recommended: true,
					},
				],
				completed: false,
			},
			{
				id: generateId(),
				order: 5,
				title: "Target Role Preparation",
				description: `Final preparation and job search for ${targetRole} position.`,
				type: "project",
				duration: weeksPerStep,
				skills,
				milestones: [
					{
						id: generateId(),
						title: "Portfolio Complete",
						description: "Finalize your professional portfolio",
						targetDate: new Date(Date.now() + (totalWeeks - 2) * 7 * 24 * 60 * 60 * 1000).toISOString(),
						completed: false,
						type: "achievement",
					},
					{
						id: generateId(),
						title: `${targetRole} Position Secured`,
						description: "Successfully land your target role",
						targetDate: new Date(Date.now() + totalWeeks * 7 * 24 * 60 * 60 * 1000).toISOString(),
						completed: false,
						type: "achievement",
					},
				],
				resources: [],
				estimatedSalary: { min: 8000, max: 15000 },
				completed: false,
			},
		];
	};

	// Generate accelerated path
	const generateAcceleratedSteps = (): RoadmapStep[] => {
		const baseSteps = generateStandardSteps();
		return baseSteps.map((step) => ({
			...step,
			id: generateId(),
			duration: Math.ceil(step.duration * 0.6),
			milestones: step.milestones.map((m) => ({ ...m, id: generateId() })),
		}));
	};

	// Generate comprehensive path
	const generateComprehensiveSteps = (): RoadmapStep[] => {
		const baseSteps = generateStandardSteps();
		const additionalStep: RoadmapStep = {
			id: generateId(),
			order: 3,
			title: "Formal Education Enhancement",
			description: "Pursue additional formal education or advanced training programs.",
			type: "education",
			duration: Math.floor(timeline * 4 * 0.2),
			skills: generateSkillRequirements().slice(0, 3),
			milestones: generateMilestones("Education", timeline * 2),
			resources: [
				{
					id: generateId(),
					title: "Professional Development Program",
					type: "course",
					platform: "University",
					url: "#",
					duration: "6 months",
					cost: "paid",
					recommended: true,
				},
			],
			completed: false,
		};

		return [
			...baseSteps.slice(0, 2),
			additionalStep,
			...baseSteps.slice(2).map((s, _i) => ({ ...s, order: s.order + 1, id: generateId() })),
		];
	};

	const standardSteps = generateStandardSteps();
	const acceleratedSteps = generateAcceleratedSteps();
	const comprehensiveSteps = generateComprehensiveSteps();

	return [
		{
			id: generateId(),
			name: "Standard Path",
			description: "A balanced approach with steady progression towards your goal.",
			duration: timeline * 4,
			steps: standardSteps,
			successProbability: calculateSuccessProbability(goal, standardSteps, constraints),
			advantages: ["Balanced workload", "Time for skill absorption", "Lower stress levels", "Sustainable pace"],
			challenges: ["Longer timeline", "May miss immediate opportunities"],
			estimatedCost: "5,000 - 15,000 DH",
			isSelected: true,
		},
		{
			id: generateId(),
			name: "Accelerated Path",
			description: "An intensive approach for faster results with higher commitment.",
			duration: Math.ceil(timeline * 4 * 0.6),
			steps: acceleratedSteps,
			successProbability: calculateSuccessProbability(goal, acceleratedSteps, constraints) - 10,
			advantages: ["Faster goal achievement", "Quick market entry", "Momentum driven"],
			challenges: ["Higher intensity", "Risk of burnout", "Less time for networking", "Steeper learning curve"],
			estimatedCost: "8,000 - 20,000 DH",
			isSelected: false,
		},
		{
			id: generateId(),
			name: "Comprehensive Path",
			description: "A thorough approach with additional education and deeper skill development.",
			duration: Math.ceil(timeline * 4 * 1.4),
			steps: comprehensiveSteps,
			successProbability: calculateSuccessProbability(goal, comprehensiveSteps, constraints) + 5,
			advantages: ["Stronger foundation", "Higher success rate", "Better long-term prospects", "More credentials"],
			challenges: ["Longer timeline", "Higher investment", "Delayed market entry"],
			estimatedCost: "15,000 - 35,000 DH",
			isSelected: false,
		},
	];
}
