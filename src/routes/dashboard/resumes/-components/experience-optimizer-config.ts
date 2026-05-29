// =============================================================================
// Experience Optimizer - Static Configuration Data
// =============================================================================

import type {
	AchievementTip,
	ActionVerb,
	BeforeAfterExample,
	BulletRefinement,
	Industry,
	IndustryOptimization,
	QuantificationSuggestion,
	VerbCategory,
} from "./experience-optimizer-types";

export const defaultBeforeAfterExamples: BeforeAfterExample[] = [
	{
		id: "1",
		before: "I was responsible for managing a team",
		after:
			"Led and motivated a cross-functional team of 12 members, achieving 125% of annual targets with a 95% retention rate",
		improvement: "Added quantifiable metrics and strong action verb",
		category: "leadership",
	},
	{
		id: "2",
		before: "I worked on IT projects",
		after:
			"Spearheaded 8 digital transformation projects with a combined value of 2.5M EUR, delivered 15% ahead of schedule and 10% under budget",
		improvement: "Quantified results and financial impact",
		category: "technical",
	},
	{
		id: "3",
		before: "I improved company processes",
		after:
			"Optimized operational processes through automation, reducing processing time by 40% and generating 200K EUR in annual savings",
		improvement: "Specified the method and quantified impact",
		category: "technical",
	},
	{
		id: "4",
		before: "I communicated with clients",
		after:
			"Developed and maintained strategic relationships with 35+ key clients, increasing satisfaction rate from 78% to 94% and renewal rate to 85%",
		improvement: "Measurable results and client impact",
		category: "communication",
	},
	{
		id: "5",
		before: "I trained employees",
		after:
			"Designed and delivered a training program for 50+ employees, improving team productivity by 30% and reducing onboarding time by 3 weeks",
		improvement: "Program scale and tangible results",
		category: "leadership",
	},
	{
		id: "6",
		before: "I helped increase sales",
		after:
			"Implemented a consultative sales strategy generating +45% revenue growth and 12 new major accounts representing 1.8M EUR in recurring revenue",
		improvement: "Specific strategy and detailed financial impact",
		category: "communication",
	},
];

export const actionVerbsByCategory: Record<VerbCategory, ActionVerb[]> = {
	leadership: [
		{
			verb: "Led",
			description: "Taking charge of a team or project",
			example: "Led a team of 15 engineers on a critical project",
		},
		{
			verb: "Supervised",
			description: "Ensuring oversight and control",
			example: "Supervised daily operations of 3 departments",
		},
		{
			verb: "Coordinated",
			description: "Organizing and aligning efforts",
			example: "Coordinated activities across 5 international teams",
		},
		{
			verb: "Spearheaded",
			description: "Leading a project or initiative",
			example: "Spearheaded the company's digital transformation",
		},
		{
			verb: "Mobilized",
			description: "Rallying and motivating teams",
			example: "Mobilized 50+ collaborators around a common goal",
		},
		{
			verb: "United",
			description: "Bringing people together around a shared project",
			example: "United teams around a new strategic vision",
		},
		{
			verb: "Mentored",
			description: "Training and guiding",
			example: "Mentored 8 junior managers in their professional development",
		},
		{
			verb: "Inspired",
			description: "Motivating by example",
			example: "Inspired an innovation culture resulting in 15 patents filed",
		},
	],
	technical: [
		{
			verb: "Developed",
			description: "Creating or building",
			example: "Developed a scalable microservices architecture",
		},
		{
			verb: "Implemented",
			description: "Putting a solution in place",
			example: "Implemented a CI/CD system reducing deployments from 4h to 15min",
		},
		{
			verb: "Optimized",
			description: "Improving performance",
			example: "Optimized SQL queries, improving response times by 60%",
		},
		{
			verb: "Automated",
			description: "Making a process automatic",
			example: "Automated 85% of regression tests",
		},
		{
			verb: "Architected",
			description: "Designing a structure",
			example: "Architected a cloud solution supporting 1M+ users",
		},
		{ verb: "Deployed", description: "Putting into production", example: "Deployed 200+ microservices on Kubernetes" },
		{
			verb: "Integrated",
			description: "Connecting systems",
			example: "Integrated 12 third-party APIs into the existing ecosystem",
		},
		{
			verb: "Migrated",
			description: "Transferring to a new platform",
			example: "Migrated 500TB of data to the cloud with zero downtime",
		},
	],
	communication: [
		{
			verb: "Negotiated",
			description: "Obtaining favorable agreements",
			example: "Negotiated contracts worth a total of 5M EUR",
		},
		{
			verb: "Presented",
			description: "Presenting to an audience",
			example: "Presented the annual strategy to the executive committee",
		},
		{
			verb: "Persuaded",
			description: "Convincing stakeholders",
			example: "Persuaded the board to invest 2M EUR in innovation",
		},
		{
			verb: "Collaborated",
			description: "Working as a team",
			example: "Collaborated with 8 departments to launch a new product",
		},
		{
			verb: "Advised",
			description: "Providing recommendations",
			example: "Advised 25+ clients on their digital strategy",
		},
		{
			verb: "Trained",
			description: "Transmitting knowledge",
			example: "Trained 100+ users on new tools",
		},
		{
			verb: "Authored",
			description: "Producing documents",
			example: "Authored technical documentation for 15 products",
		},
		{
			verb: "Facilitated",
			description: "Leading meetings or workshops",
			example: "Facilitated design thinking workshops with 200+ participants",
		},
	],
};

export const quantificationSuggestions: QuantificationSuggestion[] = [
	{
		metric: "Percentages",
		example: "+35% productivity, -25% costs, 98% satisfaction",
		tip: "Use percentages to show relative improvement",
	},
	{
		metric: "Financial amounts",
		example: "2.5M EUR revenue, 500K EUR savings, 1.2M EUR budget",
		tip: "Include financial impact to demonstrate business value",
	},
	{
		metric: "Volumes and scale",
		example: "15 projects, 50+ clients, 1M+ users, 200 deployments",
		tip: "Quantify the scale of your responsibilities",
	},
	{
		metric: "Timelines and speed",
		example: "3-week reduction, delivered 15% ahead of schedule, within 6 months",
		tip: "Show your efficiency with time savings",
	},
	{
		metric: "Rates and ratios",
		example: "95% retention rate, 0.1% defect ratio, NPS of 72",
		tip: "Use rates for performance indicators",
	},
	{
		metric: "Rankings",
		example: "Top 5% performers, #1 in client satisfaction, 3rd best team",
		tip: "Position yourself relative to your peers",
	},
];

export const bulletRefinementExamples: BulletRefinement[] = [
	{
		original: "Responsible for sales management",
		refined: "Drove B2B sales strategy, generating 3.2M EUR in new contracts and exceeding targets by 28%",
		changes: ["Strong action verb", "B2B specification", "Financial metrics", "Comparison to targets"],
	},
	{
		original: "Participated in team meetings",
		refined:
			"Facilitated weekly coordination meetings with 12 stakeholders, improving cross-team communication and reducing decision timelines by 40%",
		changes: ["Active role instead of passive", "Quantified participants", "Measurable process impact"],
	},
	{
		original: "Worked on quality improvement",
		refined:
			"Deployed a Six Sigma program reducing defect rate from 5% to 0.8%, saving 150K EUR in annual quality costs",
		changes: ["Specific methodology", "Before/after metrics", "Quantified financial impact"],
	},
];

export const achievementTips: AchievementTip[] = [
	{
		id: "1",
		title: "Use the CAR method",
		description:
			"Challenge - Action - Result: Structure your achievements by presenting the challenge, your action, and the result obtained",
		example:
			"Facing a 20% sales decline (Challenge), I deployed a new omnichannel strategy (Action), increasing revenue by 35% in 6 months (Result)",
	},
	{
		id: "2",
		title: "Quantify systematically",
		description: "Every achievement should include at least one number: percentage, amount, volume, or timeline",
		example: "Transform 'Improved processes' into 'Reduced processing time by 40%, saving 200 hours/month'",
	},
	{
		id: "3",
		title: "Show business impact",
		description: "Link your actions to the company's strategic goals: revenue, costs, customer satisfaction, growth",
		example:
			"Instead of 'Project management', write 'Delivered 12 strategic projects generating 5M EUR in new revenue'",
	},
	{
		id: "4",
		title: "Avoid job descriptions",
		description: "Don't list your responsibilities; highlight your unique accomplishments and their impact",
		example: "Replace 'Responsible for customer support' with 'Increased NPS from 45 to 72, reducing churn by 25%'",
	},
	{
		id: "5",
		title: "Use varied action verbs",
		description: "Start each bullet point with a different, powerful verb to maintain attention",
		example: "Alternate between: Led, Developed, Implemented, Optimized, Negotiated, Spearheaded, Transformed",
	},
	{
		id: "6",
		title: "Be specific and precise",
		description: "Avoid vague terms like 'many', 'several', 'improved'. Give concrete details",
		example:
			"Instead of 'Managed several projects', write 'Simultaneously managed 8 projects with a combined budget of 2.3M EUR'",
	},
];

export const industryOptimizations: Record<Industry, IndustryOptimization> = {
	technology: {
		industry: "Technology / IT",
		keywords: [
			"Agile",
			"DevOps",
			"Cloud",
			"Microservices",
			"CI/CD",
			"Scalability",
			"API",
			"Full-stack",
			"Machine Learning",
			"Cybersecurity",
		],
		phrases: [
			"Architect of scalable cloud-native solutions",
			"Expert in digital transformation and IT modernization",
			"Champion of technological innovation and technical excellence",
			"Specialist in automation and process optimization",
		],
		tips: [
			"Mention specific technologies and frameworks used",
			"Quantify performance (response time, availability, users)",
			"Include methodologies (Agile, Scrum, Kanban, DevOps)",
			"Highlight migration and transformation projects",
		],
	},
	healthcare: {
		industry: "Healthcare / Medical",
		keywords: [
			"Patient-centered",
			"Clinical protocols",
			"Quality of care",
			"Compliance",
			"Health data privacy",
			"Pharmacovigilance",
			"Patient journey",
			"E-health",
		],
		phrases: [
			"Expert in continuous quality of care improvement",
			"Specialist in risk management and patient safety",
			"Leader in digital transformation of healthcare facilities",
			"Champion of patient experience and medical innovation",
		],
		tips: [
			"Use proper medical and regulatory terminology",
			"Highlight certifications and accreditations",
			"Quantify patient outcome improvements",
			"Emphasize regulatory compliance (HAS, ANSM, GDPR)",
		],
	},
	finance: {
		industry: "Finance / Banking",
		keywords: [
			"ROI",
			"Due diligence",
			"Risk management",
			"Compliance",
			"Fintech",
			"P&L",
			"AUM",
			"Regulatory",
			"KYC/AML",
			"Trading",
		],
		phrases: [
			"Expert in profitability optimization and risk management",
			"Specialist in digital transformation of financial services",
			"Leader in investment strategy and asset allocation",
			"Champion of regulatory compliance and operational excellence",
		],
		tips: [
			"Quantify financial performance (ROI, AUM, P&L)",
			"Mention mastered regulations (Basel, MiFID, GDPR)",
			"Include professional certifications (CFA, FRM)",
			"Highlight portfolio management or trading experience",
		],
	},
	marketing: {
		industry: "Marketing / Communication",
		keywords: [
			"ROI",
			"KPIs",
			"Growth hacking",
			"Content strategy",
			"Brand awareness",
			"Conversion",
			"SEO/SEA",
			"Social media",
			"CRM",
			"Data-driven",
		],
		phrases: [
			"Expert in growth strategy and customer acquisition",
			"Specialist in digital marketing and conversion optimization",
			"Leader in brand management and content strategy",
			"Champion of analytics and marketing performance",
		],
		tips: [
			"Quantify campaign results (CPL, CPA, ROAS)",
			"Mention mastered tools and platforms",
			"Include performance metrics (traffic, conversion, engagement)",
			"Highlight managed budgets and ROI achieved",
		],
	},
	engineering: {
		industry: "Engineering / Industry",
		keywords: [
			"Lean manufacturing",
			"Six Sigma",
			"R&D",
			"Industrialization",
			"Total quality",
			"FMEA",
			"Supply chain",
			"Continuous improvement",
			"HSE",
		],
		phrases: [
			"Expert in operational excellence and industrial optimization",
			"Specialist in R&D and product innovation",
			"Leader in Lean transformation and continuous improvement",
			"Champion of quality and industrial safety",
		],
		tips: [
			"Mention methodologies (Lean, Six Sigma, Kaizen)",
			"Quantify productivity gains and cost savings",
			"Include technical certifications and standards (ISO, HSE)",
			"Highlight industrialization and production launch projects",
		],
	},
	education: {
		industry: "Education / Training",
		keywords: [
			"Pedagogy",
			"Curriculum",
			"E-learning",
			"Assessment",
			"Inclusion",
			"Competencies",
			"Instructional design",
			"Blended learning",
			"MOOC",
		],
		phrases: [
			"Expert in instructional design and training development",
			"Specialist in digital transformation of learning",
			"Leader in educational innovation and active pedagogy",
			"Champion of inclusion and learner success",
		],
		tips: [
			"Quantify success rates and learner satisfaction",
			"Mention innovative teaching methods",
			"Include the number of training programs created and people trained",
			"Highlight academic and professional partnerships",
		],
	},
	general: {
		industry: "General / Multi-sector",
		keywords: [
			"Leadership",
			"Project management",
			"Strategy",
			"Innovation",
			"Transformation",
			"Performance",
			"Excellence",
			"Collaboration",
			"Agility",
		],
		phrases: [
			"Results-oriented leader with a proven track record",
			"Expert in change management and organizational transformation",
			"Strategic professional combining vision and execution",
			"Experienced manager blending leadership and technical expertise",
		],
		tips: [
			"Adapt your vocabulary to the target company's sector",
			"Highlight your transferable skills",
			"Systematically quantify your achievements",
			"Emphasize your adaptability and versatility",
		],
	},
};
