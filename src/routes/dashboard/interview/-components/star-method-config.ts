// Configuration data for the STAR method interview trainer

import { t } from "@lingui/core/macro";
import type { ScenarioCategory, StarExample, StarScenario } from "./star-method-types";

// Category display labels - use function + Proxy
function getCategoryLabels(): Record<ScenarioCategory, string> {
	return {
		conflict: t`Conflict Resolution`,
		leadership: t`Leadership`,
		teamwork: t`Teamwork`,
		"problem-solving": t`Problem Solving`,
		stress: t`Stress Management`,
		communication: t`Communication`,
		adaptability: t`Adaptability`,
		"customer-service": t`Customer Service`,
		"time-management": t`Time Management`,
		innovation: t`Innovation`,
	};
}

export const CATEGORY_LABELS: Record<ScenarioCategory, string> = new Proxy({} as Record<ScenarioCategory, string>, {
	get(_target, prop: string) {
		return getCategoryLabels()[prop as ScenarioCategory];
	},
	ownKeys() {
		return Object.keys(getCategoryLabels());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getCategoryLabels();
		if (prop in data) {
			return { configurable: true, enumerable: true, value: data[prop as ScenarioCategory] };
		}
		return undefined;
	},
});

// Educational content for the STAR method introduction - use function + Proxy
function getStarEducation() {
	return {
		title: t`The STAR Method`,
		subtitle: t`Structure your interview answers like a professional`,
		description: t`The STAR method is a structured response technique used to answer behavioral questions during job interviews. It helps you present your experiences in a clear, concise, and compelling way.`,
		components: [
			{
				letter: "S",
				label: t`Situation`,
				color: "emerald",
				description: t`Describe the context and specific situation you were in.`,
				example: t`E.g.: 'During my nursing internship, our team was short-staffed one weekend...'`,
				tips: [t`Be specific and concise`, t`Provide enough context`, t`Stay relevant to the question`],
			},
			{
				letter: "T",
				label: t`Task`,
				color: "blue",
				description: t`Explain what your responsibility or mission was in that situation.`,
				example: t`E.g.: 'I was responsible for coordinating care for 8 patients while training an intern...'`,
				tips: [t`Clarify your specific role`, t`Distinguish your task from the team's`, t`Mention any constraints`],
			},
			{
				letter: "A",
				label: t`Action`,
				color: "gold",
				description: t`Describe the concrete actions YOU took to accomplish the task.`,
				example: t`E.g.: 'I first prioritized the critical patients, then delegated routine tasks...'`,
				tips: [t`Use 'I' not 'We'`, t`Be specific about your actions`, t`Show your skills`],
			},
			{
				letter: "R",
				label: t`Result`,
				color: "emerald",
				description: t`Share the concrete results of your actions. Quantify if possible.`,
				example: t`E.g.: 'All patients received their care on time, and the intern gained confidence...'`,
				tips: [t`Quantify results if possible`, t`Mention what you learned`, t`Connect to the target role`],
			},
		],
		benefits: [
			t`Clear structure that's easy for the recruiter to follow`,
			t`Demonstrates real skills with concrete evidence`,
			t`Reduces stress by having a prepared response framework`,
			t`Increases your chances of interview success`,
		],
	};
}

export const STAR_EDUCATION = new Proxy({} as ReturnType<typeof getStarEducation>, {
	get(_target, prop: string) {
		return getStarEducation()[prop as keyof ReturnType<typeof getStarEducation>];
	},
});

// Scenario questions for the interactive trainer
export const STAR_SCENARIOS: StarScenario[] = [
	{
		id: "conflict-1",
		category: "conflict",
		questionFr: "Décrivez une situation où vous avez dû résoudre un conflit avec un collègue ou un supérieur.",
		questionEn: "Describe a time you had to resolve a conflict with a colleague or supervisor.",
		hints: {
			situation: "What was the disagreement? What was the professional context?",
			task: "What was your role in the resolution? Were you a mediator?",
			action: "What concrete steps did you take to resolve the conflict?",
			result: "How did the conflict end? Did the relationship improve?",
		},
	},
	{
		id: "leadership-1",
		category: "leadership",
		questionFr: "Parlez-moi d'un moment où vous avez pris l'initiative sur un projet ou dans une situation difficile.",
		questionEn: "Tell me about a time you took initiative on a project or in a difficult situation.",
		hints: {
			situation: "What was the context? Why was initiative needed?",
			task: "What did you need to accomplish? What was at stake?",
			action: "How did you mobilize resources and motivate others?",
			result: "What was the impact of your leadership on the project?",
		},
	},
	{
		id: "teamwork-1",
		category: "teamwork",
		questionFr:
			"Donnez un exemple où vous avez travaillé efficacement au sein d'une équipe pour atteindre un objectif commun.",
		questionEn: "Give an example of when you worked effectively as part of a team to achieve a common goal.",
		hints: {
			situation: "What was the team project? How many people? What was the deadline?",
			task: "What was your specific role in the team?",
			action: "How did you contribute and collaborate with other members?",
			result: "Did the team achieve its goal? What was your personal contribution?",
		},
	},
	{
		id: "problem-solving-1",
		category: "problem-solving",
		questionFr: "Décrivez un problème complexe que vous avez rencontré et comment vous l'avez résolu.",
		questionEn: "Describe a complex problem you encountered and how you solved it.",
		hints: {
			situation: "What was the problem? What was its impact on the work?",
			task: "Were you solely responsible or working as a team to find the solution?",
			action: "What approach did you follow to analyze and solve the problem?",
			result: "Was the solution effective? What did you learn?",
		},
	},
	{
		id: "stress-1",
		category: "stress",
		questionFr: "Racontez une situation où vous avez dû gérer une forte pression ou un stress intense au travail.",
		questionEn: "Tell me about a time you had to manage intense pressure or stress at work.",
		hints: {
			situation: "What was causing the stress? Tight deadline? Understaffing?",
			task: "What was your responsibility in this stressful situation?",
			action: "What strategies did you use to manage stress and stay effective?",
			result: "How did you overcome the situation? Did you maintain quality?",
		},
	},
	{
		id: "communication-1",
		category: "communication",
		questionFr: "Parlez d'une situation où vous avez dû communiquer une information difficile ou complexe.",
		questionEn: "Tell me about a time you had to communicate difficult or complex information.",
		hints: {
			situation: "What was the difficult information? Who did you need to communicate it to?",
			task: "Why was it your responsibility to communicate this information?",
			action: "How did you prepare and deliver your message?",
			result: "How did your audience react? Was the communication effective?",
		},
	},
	{
		id: "adaptability-1",
		category: "adaptability",
		questionFr: "Décrivez un moment où vous avez dû vous adapter rapidement à un changement important.",
		questionEn: "Describe a time you had to quickly adapt to a significant change.",
		hints: {
			situation: "What change occurred? Was it planned or unexpected?",
			task: "What was your responsibility in the face of this change?",
			action: "How did you adapt? What new skills did you acquire?",
			result: "Were you able to maintain your performance despite the change?",
		},
	},
	{
		id: "customer-service-1",
		category: "customer-service",
		questionFr: "Donnez un exemple d'une situation où vous avez dépassé les attentes d'un patient ou client.",
		questionEn: "Give an example of a time you exceeded a patient's or client's expectations.",
		hints: {
			situation: "What was the patient/client's need? Why was it important?",
			task: "What was normally expected of you in this situation?",
			action: "What extra steps did you take to meet or exceed expectations?",
			result: "How did the patient/client react? What positive outcomes resulted?",
		},
	},
	{
		id: "time-management-1",
		category: "time-management",
		questionFr: "Décrivez comment vous avez géré plusieurs tâches prioritaires simultanément.",
		questionEn: "Describe how you managed multiple competing priorities simultaneously.",
		hints: {
			situation: "What were the different tasks? What were their deadlines?",
			task: "Were you solely responsible for all these tasks?",
			action: "How did you prioritize and organize your time?",
			result: "Did you meet all deadlines? What method do you use now?",
		},
	},
	{
		id: "innovation-1",
		category: "innovation",
		questionFr: "Parlez d'une idée innovante que vous avez proposée et mise en œuvre dans votre travail ou formation.",
		questionEn: "Tell me about an innovative idea you proposed and implemented in your work or training.",
		hints: {
			situation: "What problem or opportunity did you identify that called for an innovative solution?",
			task: "What was your mandate? Did you have creative freedom?",
			action: "How did you develop and convince others of your idea?",
			result: "How was your idea received? What benefits did it bring?",
		},
	},
];

// Pre-built STAR examples for the example bank
export const STAR_EXAMPLES: StarExample[] = [
	{
		id: "example-teamwork-1",
		category: "teamwork",
		questionFr: "Donnez un exemple où vous avez travaillé efficacement en équipe.",
		situation:
			"During my nursing internship at the regional hospital, our department was receiving 20% more patients during a seasonal epidemic in January 2024.",
		task: "As a 3rd-year intern, I was responsible for assisting 3 certified nurses and providing basic care for 6 patients under supervision.",
		action:
			"I suggested a buddy system with another intern to optimize rounds. We created a simple dashboard to track administered care and anticipated supply needs. I also took the initiative to proactively communicate with the medical team about patient status.",
		result:
			"Our team reduced average call response time by 30%. All care was administered within scheduled timeframes. My internship supervisor cited our initiative as a best practice example for future classes.",
		keyPoints: [
			"Specificity of the situation (epidemic, dates, numbers)",
			"Clearly defined role (3rd-year intern)",
			"Concrete and measurable actions (dashboard, buddy system)",
			"Quantified results (30% reduction)",
			"External recognition (internship supervisor)",
		],
	},
	{
		id: "example-leadership-1",
		category: "leadership",
		questionFr: "Parlez-moi d'un moment où vous avez pris l'initiative.",
		situation:
			"During my industrial maintenance training, our 4-person project group lost its project leader 2 weeks before the final presentation.",
		task: "Without designated leadership, our project risked not being completed on time. As the most advanced member in the relevant subject, I decided to coordinate the team.",
		action:
			"I organized an emergency meeting to assess progress. I redistributed tasks based on each person's strengths, set up daily 15-minute check-ins, and served as the liaison between the team and the instructor. I also personally took charge of the final documentation.",
		result:
			"The project was submitted on time and received a grade of 16/20. The team maintained exemplary cohesion. This experience confirmed my interest in coordination roles, and I was subsequently appointed project leader for 2 other modules.",
		keyPoints: [
			"Initiative in a crisis situation",
			"Pragmatic leadership based on skills",
			"Regular and structured communication",
			"Concrete results (16/20, deadlines met)",
			"Positive learning and follow-up (future roles)",
		],
	},
	{
		id: "example-conflict-1",
		category: "conflict",
		questionFr: "Décrivez une situation où vous avez dû résoudre un conflit.",
		situation:
			"During an HSE internship at an industrial company, I was working with a fellow intern on a safety audit of a workshop. We had diverging views on the criticality of a ventilation-related risk.",
		task: "As co-auditors, we had to submit a single report with consistent recommendations. The disagreement was blocking progress on our shared report.",
		action:
			"I suggested a meeting with our HSE mentor to present both viewpoints objectively. I prepared a factual analysis based on EN standards and available measurement data. Instead of defending my position, I tried to understand my colleague's arguments. Together, we identified that our analyses were complementary.",
		result:
			"We submitted a report that integrated both perspectives and proposed tiered recommendations. The report was highlighted by the supervisor as 'particularly comprehensive'. Collaboration with this colleague improved for the rest of the internship.",
		keyPoints: [
			"Professional disagreement, not personal",
			"Factual and objective approach",
			"Seeking compromise rather than victory",
			"Resolution through mediation and dialogue",
			"Positive outcome for both parties",
		],
	},
	{
		id: "example-stress-1",
		category: "stress",
		questionFr: "Racontez une situation où vous avez dû gérer une forte pression.",
		situation:
			"On the night of my last internship shift at the pediatric emergency room, we simultaneously received 3 serious emergencies while the senior nurse had just gone on break.",
		task: "As a nursing intern nearing the end of training, I was alone with a nursing assistant for 20 minutes, responsible for initial stabilization of patients while awaiting the doctor.",
		action:
			"I applied the established triage protocol, took vital signs of the 3 patients in order of severity, communicated clearly with the nursing assistant about priorities, and immediately contacted the on-call doctor by radio. I maintained my composure by focusing on the protocols I had learned.",
		result:
			"All 3 patients were stabilized before the doctor arrived. No serious incidents occurred. The doctor commended the professionalism of my management. That night taught me the value of protocols and stress management through methodology.",
		keyPoints: [
			"Real and concrete crisis situation",
			"Application of protocols under pressure",
			"Clear communication and prioritization",
			"Composure maintained through methodology",
			"Lesson learned and mentioned (meta-reflection)",
		],
	},
];

// Step labels for the progress stepper - use function + Proxy
function getStarSteps() {
	return [
		{
			key: "situation" as const,
			letter: "S",
			label: t`Situation`,
			placeholder: t`Describe the context of the situation. Where were you? When did it happen? Who was involved?`,
			minLength: 50,
			guidance: t`Be specific: mention the location, approximate date, people involved, and general context.`,
		},
		{
			key: "task" as const,
			letter: "T",
			label: t`Task`,
			placeholder: t`What was your specific responsibility? What was your role or mission?`,
			minLength: 30,
			guidance: t`Clarify what was personally expected of you in this situation.`,
		},
		{
			key: "action" as const,
			letter: "A",
			label: t`Action`,
			placeholder: t`What concrete actions did you take? Describe step by step what YOU did.`,
			minLength: 80,
			guidance: t`Use 'I did...' not 'We did...'. Be specific about your individual actions.`,
		},
		{
			key: "result" as const,
			letter: "R",
			label: t`Result`,
			placeholder: t`What was the result? Quantify if possible. What did you learn?`,
			minLength: 40,
			guidance: t`Mention measurable results and what you took away from this experience.`,
		},
	];
}

export const STAR_STEPS = new Proxy([] as ReturnType<typeof getStarSteps>, {
	get(_target, prop) {
		const data = getStarSteps();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

// Color mapping for STAR components
export const STAR_COMPONENT_COLORS: Record<string, string> = {
	S: "bg-emerald-500",
	T: "bg-blue-500",
	A: "bg-amber-500",
	R: "bg-emerald-600",
};

export const STAR_COMPONENT_BORDER_COLORS: Record<string, string> = {
	S: "border-emerald-500",
	T: "border-blue-500",
	A: "border-amber-500",
	R: "border-emerald-600",
};

export const STAR_COMPONENT_TEXT_COLORS: Record<string, string> = {
	S: "text-emerald-600",
	T: "text-blue-600",
	A: "text-amber-600",
	R: "text-emerald-700",
};
