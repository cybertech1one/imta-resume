import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	BankIcon,
	BriefcaseIcon,
	CodeIcon,
	FactoryIcon,
	GraduationCapIcon,
	HospitalIcon,
	TargetIcon,
	UserIcon,
} from "@phosphor-icons/react";

import type { DifficultyLevel, Industry, Question, QuestionCategory } from "./question-bank-types";

// Category configuration - use function + Proxy to avoid Lingui race condition at module level
function getCategoryConfig(): Record<
	QuestionCategory,
	{
		label: string;
		labelFr: string;
		description: string;
		icon: Icon;
		color: string;
		bgColor: string;
		gradient: string;
	}
> {
	return {
		behavioral: {
			label: t`Behavioral`,
			labelFr: t`Behavioral`,
			description: t`Questions about your past experiences and behaviors`,
			icon: UserIcon,
			color: "text-purple-600 dark:text-purple-400",
			bgColor: "bg-purple-100 dark:bg-purple-900/30",
			gradient: "from-purple-500/20 to-violet-500/10",
		},
		technical: {
			label: t`Technical`,
			labelFr: t`Technical`,
			description: t`Questions about your specific technical skills`,
			icon: CodeIcon,
			color: "text-blue-600 dark:text-blue-400",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
			gradient: "from-blue-500/20 to-cyan-500/10",
		},
		situational: {
			label: t`Situational`,
			labelFr: t`Situational`,
			description: t`Hypothetical scenarios to assess your judgment`,
			icon: TargetIcon,
			color: "text-green-600 dark:text-green-400",
			bgColor: "bg-green-100 dark:bg-green-900/30",
			gradient: "from-green-500/20 to-emerald-500/10",
		},
		competency: {
			label: t`Competency`,
			labelFr: t`Competency`,
			description: t`Questions to assess your key competencies`,
			icon: GraduationCapIcon,
			color: "text-orange-600 dark:text-orange-400",
			bgColor: "bg-orange-100 dark:bg-orange-900/30",
			gradient: "from-orange-500/20 to-amber-500/10",
		},
	};
}

export const categoryConfig = new Proxy(
	{} as Record<
		QuestionCategory,
		{
			label: string;
			labelFr: string;
			description: string;
			icon: Icon;
			color: string;
			bgColor: string;
			gradient: string;
		}
	>,
	{
		get(_target, prop: string) {
			return getCategoryConfig()[prop as QuestionCategory];
		},
		ownKeys() {
			return Object.keys(getCategoryConfig());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getCategoryConfig();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as QuestionCategory] };
			}
			return undefined;
		},
	},
);

// Difficulty configuration - use function + Proxy
function getDifficultyConfig(): Record<
	DifficultyLevel,
	{ label: string; labelFr: string; color: string; bgColor: string; textColor: string }
> {
	return {
		easy: {
			label: t`Easy`,
			labelFr: t`Easy`,
			color: "text-green-600 dark:text-green-400",
			bgColor: "bg-green-100 dark:bg-green-900/30",
			textColor: "text-green-700 dark:text-green-300",
		},
		medium: {
			label: t`Medium`,
			labelFr: t`Medium`,
			color: "text-amber-600 dark:text-amber-400",
			bgColor: "bg-amber-100 dark:bg-amber-900/30",
			textColor: "text-amber-700 dark:text-amber-300",
		},
		hard: {
			label: t`Hard`,
			labelFr: t`Hard`,
			color: "text-red-600 dark:text-red-400",
			bgColor: "bg-red-100 dark:bg-red-900/30",
			textColor: "text-red-700 dark:text-red-300",
		},
	};
}

export const difficultyConfig = new Proxy(
	{} as Record<DifficultyLevel, { label: string; labelFr: string; color: string; bgColor: string; textColor: string }>,
	{
		get(_target, prop: string) {
			return getDifficultyConfig()[prop as DifficultyLevel];
		},
		ownKeys() {
			return Object.keys(getDifficultyConfig());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getDifficultyConfig();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as DifficultyLevel] };
			}
			return undefined;
		},
	},
);

// Industry configuration - use function + Proxy
function getIndustryConfig(): Record<
	Industry,
	{ label: string; labelFr: string; icon: Icon; color: string; bgColor: string }
> {
	return {
		healthcare: {
			label: t`Healthcare`,
			labelFr: t`Healthcare`,
			icon: HospitalIcon,
			color: "text-red-600 dark:text-red-400",
			bgColor: "bg-red-100 dark:bg-red-900/30",
		},
		technology: {
			label: t`Technology`,
			labelFr: t`Technology`,
			icon: CodeIcon,
			color: "text-blue-600 dark:text-blue-400",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
		},
		industrial: {
			label: t`Industrial`,
			labelFr: t`Industrial`,
			icon: FactoryIcon,
			color: "text-slate-600 dark:text-slate-400",
			bgColor: "bg-slate-100 dark:bg-slate-900/30",
		},
		finance: {
			label: t`Finance`,
			labelFr: t`Finance`,
			icon: BankIcon,
			color: "text-emerald-600 dark:text-emerald-400",
			bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
		},
		general: {
			label: t`General`,
			labelFr: t`General`,
			icon: BriefcaseIcon,
			color: "text-gray-600 dark:text-gray-400",
			bgColor: "bg-gray-100 dark:bg-gray-800/30",
		},
	};
}

export const industryConfig = new Proxy(
	{} as Record<Industry, { label: string; labelFr: string; icon: Icon; color: string; bgColor: string }>,
	{
		get(_target, prop: string) {
			return getIndustryConfig()[prop as Industry];
		},
		ownKeys() {
			return Object.keys(getIndustryConfig());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getIndustryConfig();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as Industry] };
			}
			return undefined;
		},
	},
);

// STAR Method explanation - use function + Proxy
function getStarMethodSteps() {
	return [
		{
			letter: "S",
			title: t`Situation`,
			titleFr: t`Situation`,
			description: t`Describe the context and circumstances of the situation`,
			color: "text-blue-600 dark:text-blue-400",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
		},
		{
			letter: "T",
			title: t`Task`,
			titleFr: t`Task`,
			description: t`Explain your role and specific responsibilities`,
			color: "text-purple-600 dark:text-purple-400",
			bgColor: "bg-purple-100 dark:bg-purple-900/30",
		},
		{
			letter: "A",
			title: t`Action`,
			titleFr: t`Action`,
			description: t`Detail the concrete actions you took`,
			color: "text-amber-600 dark:text-amber-400",
			bgColor: "bg-amber-100 dark:bg-amber-900/30",
		},
		{
			letter: "R",
			title: t`Result`,
			titleFr: t`Result`,
			description: t`Present the results obtained and lessons learned`,
			color: "text-green-600 dark:text-green-400",
			bgColor: "bg-green-100 dark:bg-green-900/30",
		},
	];
}

export const starMethodSteps = new Proxy([] as ReturnType<typeof getStarMethodSteps>, {
	get(_target, prop) {
		const data = getStarMethodSteps();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

// INTERVIEW QUESTION REFERENCE DATA
export const INTERVIEW_QUESTIONS: Question[] = [
	// Behavioral Questions
	{
		id: "beh-1",
		question: "Tell me about a situation where you had to manage a conflict at work.",
		category: "behavioral",
		difficulty: "medium",
		industry: "general",
		sampleAnswer:
			"In my previous position, two colleagues had differing opinions on the approach for a project. I organized a meeting to allow each person to express their point of view, then proposed a compromise incorporating the best ideas from both parties. The project was delivered successfully and working relationships improved.",
		starExample: {
			situation:
				"In my team of 5 people, two colleagues had a persistent disagreement about the methodology for an important client project.",
			task: "As project manager, I had to resolve this conflict while maintaining team cohesion and meeting deadlines.",
			action:
				"I organized a private meeting with each person to understand their concerns, then a joint session where I facilitated constructive dialogue. I proposed a hybrid approach combining the strengths of both methodologies.",
			result:
				"The project was delivered 2 days early, client satisfaction reached 95%, and the two colleagues now collaborate effectively on other projects.",
		},
		tips: [
			"Stay neutral and factual in your account",
			"Show your ability for active listening",
			"Highlight the positive results achieved",
			"Avoid criticizing the people involved",
		],
		keywords: ["conflict", "mediation", "resolution", "communication", "collaboration"],
	},
	{
		id: "beh-2",
		question: "Describe a situation where you had to work under pressure.",
		category: "behavioral",
		difficulty: "easy",
		industry: "general",
		sampleAnswer:
			"During an urgent project with a tight deadline, I prioritized critical tasks, communicated regularly with my team, and stayed focused on the objectives. We delivered the project on time while maintaining the expected quality.",
		starExample: {
			situation: "Our main client requested an early delivery by 3 weeks for a major development project.",
			task: "I had to reorganize the team's priorities and ensure we met this new deadline without compromising quality.",
			action:
				"I created a detailed schedule with daily checkpoints, redistributed tasks based on skills, and set up focused work sessions. I also communicated transparently with the client about our progress.",
			result:
				"The project was delivered 2 days before the new deadline with all tests passing. The client extended their contract by 2 years following this performance.",
		},
		tips: [
			"Show your organizational ability",
			"Describe your stress management strategies",
			"Quantify results if possible",
			"Mention how you supported your team",
		],
		keywords: ["pressure", "deadline", "organization", "priorities", "stress"],
	},
	{
		id: "beh-3",
		question: "Give an example where you demonstrated leadership.",
		category: "behavioral",
		difficulty: "medium",
		industry: "general",
		sampleAnswer:
			"I took the initiative to lead an internal process improvement project. I mobilized a cross-functional team, defined a clear vision, and guided the group toward concrete results that improved our productivity by 25%.",
		starExample: {
			situation:
				"Our department was facing inefficiencies in validation processes that were slowing down client deliveries.",
			task: "Without a formal mandate, I decided to take the initiative to propose and implement improvements.",
			action:
				"I analyzed bottlenecks, presented a proposal to management, recruited 4 volunteers for a working group, and piloted the implementation of new automated workflows over 3 months.",
			result:
				"Validation time was reduced from 5 days to 1.5 days, productivity increased by 25%, and I was promoted to team leader following this initiative.",
		},
		tips: [
			"Illustrate your vision and ability to inspire",
			"Show how you involved others",
			"Describe obstacles overcome",
			"Present measurable results",
		],
		keywords: ["leadership", "initiative", "vision", "team", "motivation"],
	},
	{
		id: "beh-4",
		question: "Tell me about a professional mistake and what you learned from it.",
		category: "behavioral",
		difficulty: "hard",
		industry: "general",
		sampleAnswer:
			"I underestimated the time needed for a project, which caused a delay. I learned the importance of better risk assessment and building in safety margins. Since then, I use more rigorous estimation techniques and have had no significant delays.",
		starExample: {
			situation: "I launched a pilot project without sufficiently consulting end users, thinking I knew their needs.",
			task: "I had to deliver a new feature to improve the user experience of our internal application.",
			action:
				"After realizing my mistake at launch, I immediately organized feedback sessions, documented all issues, and redid the development involving users at every stage.",
			result:
				"The final version had a 92% adoption rate compared to 34% for the first. I institutionalized a user validation process that I now use systematically.",
		},
		tips: [
			"Choose a real but not catastrophic mistake",
			"Take responsibility without being too hard on yourself",
			"Emphasize the lessons learned",
			"Show the concrete changes you implemented",
		],
		keywords: ["mistake", "learning", "improvement", "responsibility", "growth"],
	},
	{
		id: "beh-5",
		question: "How did you handle a situation where you disagreed with your supervisor?",
		category: "behavioral",
		difficulty: "hard",
		industry: "general",
		sampleAnswer:
			"I expressed my disagreement respectfully and constructively, presenting data and alternatives. Even though my suggestion was not initially adopted, I accepted the decision while documenting my concerns. Later, my concerns proved justified and my proactivity was appreciated.",
		starExample: {
			situation:
				"My manager wanted to launch a marketing campaign that I thought was premature because we didn't have enough customer data.",
			task: "I had to express my disagreement while maintaining a positive professional relationship and respecting the hierarchy.",
			action:
				"I requested a private meeting, prepared an analysis with concrete data on the risks, and proposed an alternative timeline with validation milestones. I listened to their arguments and proposed a compromise.",
			result:
				"My manager agreed to delay the launch by 3 weeks to collect more data. The final campaign had a 40% higher ROI than previous ones. My relationship with my supervisor strengthened.",
		},
		tips: [
			"Stay professional and respectful",
			"Support your case with facts and data",
			"Propose constructive alternatives",
			"Show that you accept final decisions",
		],
		keywords: ["disagreement", "hierarchy", "diplomacy", "assertiveness", "respect"],
	},
	// Technical Questions
	{
		id: "tech-1",
		question: "What are your main technical skills and how do you keep them up to date?",
		category: "technical",
		difficulty: "easy",
		industry: "technology",
		sampleAnswer:
			"My main skills include Python and JavaScript programming, database management, and cloud computing. I continuously train through online courses, certifications, and personal projects. I dedicate about 5 hours per week to learning.",
		starExample: {
			situation:
				"The technology sector evolves rapidly and my cloud computing skills were becoming outdated against new solutions.",
			task: "I needed to update my skills while continuing to perform in my current role.",
			action:
				"I created a 6-month training plan including AWS and Azure certifications, joined technical communities, and applied my learnings on internal projects. I also set up knowledge-sharing sessions with my team.",
			result:
				"I obtained 2 cloud certifications, reduced our infrastructure costs by 30% thanks to my new skills, and became the cloud reference person in my department.",
		},
		tips: [
			"Be specific about your technologies",
			"Mention your recent certifications",
			"Show your curiosity and proactivity",
			"Give concrete examples of application",
		],
		keywords: ["skills", "training", "certification", "monitoring", "technology"],
	},
	{
		id: "tech-2",
		question: "How do you approach troubleshooting a complex technical problem?",
		category: "technical",
		difficulty: "medium",
		industry: "technology",
		sampleAnswer:
			"I use a methodical approach: first reproduce the problem, then isolate variables, analyze logs, and test hypotheses one by one. I document each step and don't hesitate to consult colleagues or external resources if necessary.",
		starExample: {
			situation:
				"Our production application was experiencing intermittent slowdowns affecting 20% of users with no apparent cause.",
			task: "As a senior developer, I had to identify and resolve this critical issue within 48 hours.",
			action:
				"I set up detailed monitoring, analyzed load patterns, examined logs over several weeks, and identified a memory leak in a third-party module. I then developed a temporary patch followed by a permanent solution.",
			result:
				"The problem was resolved in 36 hours. Performance improved by 45% and we documented the process for future incidents. I presented this case study to the team for knowledge sharing.",
		},
		tips: [
			"Describe your structured methodology",
			"Show your analytical ability",
			"Mention the tools you use",
			"Illustrate your perseverance",
		],
		keywords: ["troubleshooting", "diagnosis", "methodology", "analysis", "resolution"],
	},
	{
		id: "tech-3",
		question: "How do you ensure the quality of your code or technical work?",
		category: "technical",
		difficulty: "medium",
		industry: "technology",
		sampleAnswer:
			"I apply several practices: peer code review, automated testing, clear documentation, and adherence to coding standards. I always ensure my work is maintainable and understandable by other developers.",
		starExample: {
			situation: "Our team had a high rate of production bugs impacting client satisfaction and our productivity.",
			task: "I was tasked with improving our quality practices to reduce incidents.",
			action:
				"I implemented a mandatory code review process, configured a CI/CD pipeline with automated tests, created documentation templates, and trained the team on best practices. I also set up tracking metrics.",
			result:
				"In 4 months, production bugs decreased by 70%, code review time was reduced by 50%, and client satisfaction increased by 15 points.",
		},
		tips: [
			"Mention the tools and processes used",
			"Talk about unit and integration tests",
			"Highlight the importance of documentation",
			"Show your commitment to quality work",
		],
		keywords: ["quality", "tests", "review", "standards", "documentation"],
	},
	// Situational Questions
	{
		id: "sit-1",
		question: "What would you do if you discovered a colleague not following safety procedures?",
		category: "situational",
		difficulty: "medium",
		industry: "industrial",
		sampleAnswer:
			"I would start by having a private conversation with the colleague to understand the reasons and remind them of the importance of procedures. If the behavior persists, I would inform my supervisor factually, as everyone's safety is an absolute priority.",
		starExample: {
			situation:
				"Imagine I discover a colleague regularly bypassing the wearing of protective equipment in a risk zone.",
			task: "I need to ensure the safety of my colleague and the team while maintaining good working relationships.",
			action:
				"I would take the colleague aside to discuss, explain the concrete risks with examples of accidents, offer to help if they have issues with the equipment, and if necessary, inform the HSE manager.",
			result:
				"The goal is to achieve a lasting behavior change, strengthen the team's safety culture, and prevent any potential accident.",
		},
		tips: [
			"Show that you prioritize dialogue first",
			"Emphasize the importance of safety",
			"Explain appropriate escalation if necessary",
			"Stay constructive and non-accusatory",
		],
		keywords: ["safety", "procedures", "ethics", "communication", "responsibility"],
	},
	{
		id: "sit-2",
		question: "How would you react to a disgruntled customer who raises their voice?",
		category: "situational",
		difficulty: "medium",
		industry: "general",
		sampleAnswer:
			"I would stay calm and professional, actively listen to their concerns without interrupting, then rephrase to show I understood. Next, I would propose concrete solutions and follow-up. The goal is to turn a negative situation into a loyalty-building opportunity.",
		starExample: {
			situation:
				"Imagine an important client calls furious because an important delivery is 3 days late and threatens to cancel their contract.",
			task: "I need to defuse the situation, find an acceptable solution, and preserve the business relationship.",
			action:
				"I would listen to the client completely, acknowledge the problem without making impossible promises, immediately check the order status, and propose concrete compensation (free express delivery, discount). I would follow up in writing with an action plan.",
			result:
				"The goal is to calm the client, resolve their immediate problem, and strengthen their confidence by demonstrating our ability to handle difficult situations.",
		},
		tips: [
			"Show your emotional composure",
			"Describe your active listening process",
			"Propose concrete solutions",
			"Emphasize the importance of follow-up",
		],
		keywords: ["client", "management", "emotion", "solution", "loyalty"],
	},
	{
		id: "sit-3",
		question: "What would you do if you had too many tasks and not enough time?",
		category: "situational",
		difficulty: "easy",
		industry: "general",
		sampleAnswer:
			"I would assess the urgency and importance of each task, then prioritize accordingly. I would proactively communicate with my supervisor about the constraints and propose realistic adjustments. If necessary, I would delegate or request additional support.",
		starExample: {
			situation:
				"Imagine I have 5 urgent projects to deliver this week with limited resources and it is impossible to do everything.",
			task: "I need to determine priorities, manage stakeholder expectations, and deliver maximum value.",
			action:
				"I would classify projects by business impact and urgency, organize a meeting with my supervisor to align priorities, communicate realistic new deadlines to internal clients, and identify delegable tasks.",
			result:
				"The goal is to deliver the most critical projects on time, maintain stakeholder trust through transparent communication, and avoid burnout.",
		},
		tips: [
			"Show your prioritization ability",
			"Emphasize the importance of communication",
			"Mention organizational tools",
			"Talk about delegation if relevant",
		],
		keywords: ["priorities", "organization", "communication", "delegation", "time management"],
	},
	// Competency Questions
	{
		id: "comp-1",
		question: "How do you demonstrate your ability to adapt in a changing environment?",
		category: "competency",
		difficulty: "medium",
		industry: "general",
		sampleAnswer:
			"I stay open to new ideas and methods, learn new tools quickly, and see change as an opportunity rather than a threat. During our last reorganization, I helped my colleagues adapt by sharing my knowledge.",
		starExample: {
			situation:
				"Our company merged with a competitor, requiring the adoption of new tools and processes within 3 months.",
			task: "I needed to adapt quickly while maintaining my productivity and helping my team through this transition.",
			action:
				"I took accelerated training on the new systems, created reference guides for the team, organized peer-support sessions, and maintained a positive attitude toward the challenges.",
			result:
				"I was operational on the new tools in 4 weeks versus the average of 8, and 80% of my team achieved the required competency thanks to my support initiatives.",
		},
		tips: [
			"Give concrete examples of changes you've experienced",
			"Show your mental flexibility",
			"Describe how you help others",
			"Highlight positive results",
		],
		keywords: ["adaptation", "flexibility", "change", "learning", "resilience"],
	},
	{
		id: "comp-2",
		question: "How do you work effectively as part of a team?",
		category: "competency",
		difficulty: "easy",
		industry: "general",
		sampleAnswer:
			"I communicate clearly and regularly, actively listen to others' ideas, and contribute positively to shared goals. I respect each person's skills and offer my help when it's needed.",
		starExample: {
			situation:
				"Our team of 6 had to deliver a complex project in 2 months with members located across 3 different time zones.",
			task: "I needed to contribute effectively while facilitating remote collaboration.",
			action:
				"I proposed short daily meetings at compatible times, created a shared documentation space, made efforts to get to know each colleague personally, and offered my help on tasks where I had expertise.",
			result:
				"The project was delivered on time with a team satisfaction score of 9/10. Three members spontaneously thanked me for my contribution to the group's cohesion.",
		},
		tips: [
			"Talk about communication and listening",
			"Mention respect for differences",
			"Give examples of successful collaboration",
			"Show how you handle conflicts",
		],
		keywords: ["team", "collaboration", "communication", "mutual aid", "synergy"],
	},
	{
		id: "comp-3",
		question: "How do you manage multiple projects simultaneously?",
		category: "competency",
		difficulty: "medium",
		industry: "general",
		sampleAnswer:
			"I use project management tools to track deadlines and priorities. I break large projects into smaller tasks, plan regular reviews, and stay flexible to readjust for urgent matters. Constant communication with stakeholders is key.",
		starExample: {
			situation: "I was managing 4 development projects simultaneously with different teams and clients.",
			task: "I had to track each project, meet deadlines, and maintain quality without sacrificing my personal balance.",
			action:
				"I set up a centralized dashboard, defined time blocks dedicated to each project, automated progress reports, and established clear communication rituals with each stakeholder.",
			result:
				"All 4 projects were delivered on time, with an average client satisfaction of 4.7/5. I documented my method which is now used by 3 colleagues.",
		},
		tips: [
			"Describe your organizational tools and methods",
			"Show how you prioritize",
			"Talk about communication and tracking",
			"Mention how you handle the unexpected",
		],
		keywords: ["management", "projects", "organization", "planning", "tracking"],
	},
	// Healthcare specific
	{
		id: "health-1",
		question: "How do you handle an emergency situation with a patient?",
		category: "situational",
		difficulty: "hard",
		industry: "healthcare",
		sampleAnswer:
			"I stay calm and apply emergency protocols: secure the patient, alert the medical team, administer first aid if authorized, and document all actions. Clear and rapid communication with the team is essential.",
		starExample: {
			situation: "A patient had a cardiac episode in my section during my night shift with a reduced team.",
			task: "I had to stabilize the patient, alert emergency responders, and ensure the safety of other patients.",
			action:
				"I immediately called a code blue, started first aid measures, positioned the crash cart, assigned a colleague to monitor other patients, and prepared the medical file for the resuscitation team.",
			result:
				"The patient was stabilized and transferred to intensive care in 4 minutes. They made a full recovery. My intervention was cited as an example during staff training.",
		},
		tips: [
			"Show your knowledge of protocols",
			"Emphasize the importance of staying calm and methodical",
			"Talk about teamwork in emergencies",
			"Mention the importance of documentation",
		],
		keywords: ["emergency", "protocols", "first aid", "coordination", "patient"],
	},
	{
		id: "health-2",
		question: "How do you ensure patient dignity and comfort?",
		category: "competency",
		difficulty: "easy",
		industry: "healthcare",
		sampleAnswer:
			"I treat every patient with respect and empathy, respect their privacy, explain care before providing it, and listen to their concerns. I adapt to their individual and cultural needs.",
		starExample: {
			situation: "I was caring for an elderly, anxious, and modest patient who needed intimate care.",
			task: "I had to provide the necessary care while preserving her dignity and reducing her anxiety.",
			action:
				"I took the time to explain each step, asked for her consent, used privacy screens, spoke calmly to reassure her, and respected her pace. I made sure she maintained maximum control over the situation.",
			result:
				"The patient thanked me for my attention and asked that I be her primary caregiver. Her family wrote a thank-you letter to the management.",
		},
		tips: [
			"Illustrate your respect for the person",
			"Talk about compassionate communication",
			"Mention adaptation to individual needs",
			"Emphasize the importance of consent",
		],
		keywords: ["dignity", "respect", "empathy", "care", "patient"],
	},
	// Industrial specific
	{
		id: "ind-1",
		question: "How do you apply safety procedures in your daily work?",
		category: "competency",
		difficulty: "medium",
		industry: "industrial",
		sampleAnswer:
			"I systematically follow procedures: wearing PPE, checking equipment before use, reporting anomalies, and actively participating in training. I consider safety a collective responsibility.",
		starExample: {
			situation: "I was working in a factory where safety procedures were sometimes neglected out of habit.",
			task: "I had to maintain a high level of safety for myself and positively influence my colleagues.",
			action:
				"I always followed procedures even under production pressure, reported dangerous situations, proposed improvements during safety meetings, and helped newcomers understand the importance of the rules.",
			result:
				"My section had zero accidents over 18 months. I was named safety ambassador and contributed to reducing incidents by 40% across the entire workshop.",
		},
		tips: [
			"Show your commitment to safety",
			"Give concrete examples of application",
			"Talk about your positive influence on others",
			"Mention the training you've completed",
		],
		keywords: ["safety", "PPE", "procedures", "prevention", "vigilance"],
	},
	{
		id: "ind-2",
		question: "How do you diagnose a fault on industrial equipment?",
		category: "technical",
		difficulty: "hard",
		industry: "industrial",
		sampleAnswer:
			"I follow a structured methodology: gather information (symptoms, history), do visual and sensory checks, systematically test hypotheses, consult technical documentation, and document my interventions.",
		starExample: {
			situation: "A production line stopped suddenly without a clear alarm, causing significant production loss.",
			task: "I had to diagnose and repair the fault as quickly as possible while ensuring safety.",
			action:
				"I first secured the area, interviewed the operators, checked the last recorded parameters, performed systematic tests on suspect components, identified a faulty sensor, and completed the replacement according to procedures.",
			result:
				"The fault was resolved in 45 minutes compared to the average 2 hours for this type of problem. I documented the cause and proposed preventive sensor maintenance that now prevents this type of failure.",
		},
		tips: [
			"Describe your diagnostic methodology",
			"Show your knowledge of equipment",
			"Talk about using documentation",
			"Emphasize the importance of safety",
		],
		keywords: ["diagnosis", "fault", "maintenance", "equipment", "methodology"],
	},
];
