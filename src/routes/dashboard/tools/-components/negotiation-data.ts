import type { Icon } from "@phosphor-icons/react";
import {
	BriefcaseIcon,
	ChartLineUpIcon,
	CoinIcon,
	HeartIcon,
	HouseIcon,
	LightbulbIcon,
	MedalIcon,
	MicrophoneIcon,
	RocketIcon,
	StarIcon,
	TrophyIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import type {
	BenefitItem,
	EmployerQuestion,
	ExperienceLevel,
	IndustryBenchmark,
	NegotiationScript,
	RedFlag,
	RolePlayScenario,
	SuccessStory,
	TimingStrategy,
} from "./negotiation-types";

// Negotiation Scripts Data
export const negotiationScripts: NegotiationScript[] = [
	{
		id: "initial-salary",
		title: "Initial Salary Request",
		description: "Script for presenting your salary expectations during the first negotiation",
		stage: "initial",
		script: `Thank you for this exciting opportunity. After researching the market and considering my [X] years of experience in [field], along with my skills in [key competencies], I am looking for compensation in the range of [min amount] to [max amount].

This range reflects the value I can bring to your team, particularly [specific achievements]. I am confident we can reach an agreement that benefits both parties.`,
		tips: [
			"Always give a range, not a single number",
			"Base your figures on concrete market data",
			"Mention your quantifiable achievements",
			"Stay confident but flexible",
		],
	},
	{
		id: "counter-offer",
		title: "Strategic Counter-Offer",
		description: "Script for presenting a professional counter-offer",
		stage: "counter",
		script: `Thank you for the offer of [offered amount]. I am very enthusiastic about joining [company].

After careful consideration and taking into account [specific factors: cost of living, rare skills, experience], I would like to discuss compensation of [counter-offer amount].

This request is based on [justification: market research, added value, comparison with similar offers]. I am open to discussing other forms of compensation that could bring us closer together.`,
		tips: [
			"Always express your enthusiasm for the position",
			"Justify your counter-offer with facts",
			"Suggest alternatives (bonuses, benefits)",
			"Never apologize for negotiating",
		],
	},
	{
		id: "benefits-negotiation",
		title: "Benefits Negotiation",
		description: "Script for negotiating beyond base salary",
		stage: "counter",
		script: `I understand the salary budget is limited to [amount]. However, I would like to explore other ways to reach a satisfactory overall package.

Would it be possible to discuss:
- A signing bonus of [amount]
- [X] additional vacation days
- A salary review after [period] months
- [Other specific benefit]

These elements would allow me to accept this offer enthusiastically while acknowledging the budget constraints.`,
		tips: [
			"Prepare a prioritized list of benefits",
			"Be creative in your requests",
			"Show that you understand the constraints",
			"Ask for a quick salary review if the base salary is fixed",
		],
	},
	{
		id: "final-acceptance",
		title: "Final Acceptance",
		description: "Script for accepting an offer professionally",
		stage: "final",
		script: `I am delighted to accept this offer for the [title] position at [company].

To confirm, the package includes:
- Base salary: [amount]
- [Other negotiated elements]
- Start date: [date]

Could you please send me the official offer letter with these details? I look forward to contributing to the team's success.`,
		tips: [
			"Confirm all details in writing",
			"Express your enthusiasm",
			"Request written confirmation",
			"Set a clear start date",
		],
	},
	{
		id: "decline-gracefully",
		title: "Declining Gracefully",
		description: "Script for declining an offer while maintaining the relationship",
		stage: "final",
		script: `Thank you sincerely for this offer and the time you have dedicated to me during this process.

After careful consideration, I have decided to pursue another opportunity that better aligns with my current goals [or: salary expectations].

I have an excellent memory of our exchanges and hope our paths will cross again. I wish you great success in your recruitment efforts.`,
		tips: [
			"Always remain professional and positive",
			"Never burn bridges",
			"Be vague about specific reasons",
			"Sincerely thank them for their time",
		],
	},
];

// Benefits Checklist Data
export const initialBenefits: BenefitItem[] = [
	{
		id: "base-salary",
		name: "Base Salary",
		category: "monetary",
		description: "Fixed monthly or annual compensation",
		negotiable: true,
		typicalValue: "Varies by position and experience",
		checked: false,
	},
	{
		id: "signing-bonus",
		name: "Signing Bonus",
		category: "monetary",
		description: "One-time bonus paid upon hire",
		negotiable: true,
		typicalValue: "1-3 months of salary",
		checked: false,
	},
	{
		id: "performance-bonus",
		name: "Performance Bonus",
		category: "monetary",
		description: "Annual bonus based on objectives",
		negotiable: true,
		typicalValue: "10-30% of annual salary",
		checked: false,
	},
	{
		id: "health-insurance",
		name: "Health Insurance",
		category: "perks",
		description: "Medical coverage for you and your family",
		negotiable: false,
		typicalValue: "Employer-sponsored plan",
		checked: false,
	},
	{
		id: "vacation-days",
		name: "Vacation Days",
		category: "time-off",
		description: "Annual paid time off",
		negotiable: true,
		typicalValue: "18-30 days/year",
		checked: false,
	},
	{
		id: "remote-work",
		name: "Remote Work",
		category: "flexibility",
		description: "Ability to work from home",
		negotiable: true,
		typicalValue: "2-5 days/week",
		checked: false,
	},
	{
		id: "flexible-hours",
		name: "Flexible Hours",
		category: "flexibility",
		description: "Autonomy over working hours",
		negotiable: true,
		typicalValue: "Varies",
		checked: false,
	},
	{
		id: "training-budget",
		name: "Training Budget",
		category: "growth",
		description: "Funds for courses and certifications",
		negotiable: true,
		typicalValue: "Varies by company",
		checked: false,
	},
	{
		id: "conference-attendance",
		name: "Conference Attendance",
		category: "growth",
		description: "Participation in professional events",
		negotiable: true,
		typicalValue: "1-3 conferences/year",
		checked: false,
	},
	{
		id: "transport-allowance",
		name: "Transport Allowance",
		category: "perks",
		description: "Reimbursement of commuting expenses",
		negotiable: false,
		typicalValue: "Varies by location",
		checked: false,
	},
	{
		id: "meal-vouchers",
		name: "Meal Vouchers",
		category: "perks",
		description: "Daily lunch allowance",
		negotiable: false,
		typicalValue: "Varies by company",
		checked: false,
	},
	{
		id: "relocation-assistance",
		name: "Relocation Assistance",
		category: "monetary",
		description: "Coverage of relocation expenses",
		negotiable: true,
		typicalValue: "Varies by distance",
		checked: false,
	},
	{
		id: "equity-stock",
		name: "Stock Options",
		category: "monetary",
		description: "Equity participation in the company",
		negotiable: true,
		typicalValue: "Varies by company",
		checked: false,
	},
	{
		id: "salary-review",
		name: "Salary Review",
		category: "growth",
		description: "Periodic salary reassessment",
		negotiable: true,
		typicalValue: "Every 6-12 months",
		checked: false,
	},
	{
		id: "title-upgrade",
		name: "Job Title",
		category: "growth",
		description: "Official title of your position",
		negotiable: true,
		typicalValue: "Based on experience level",
		checked: false,
	},
];

// Role-Play Scenarios Data
export const rolePlayScenarios: RolePlayScenario[] = [
	{
		id: "lowball-offer",
		type: "initial-offer",
		title: "The Lowball Offer",
		description: "The employer proposes a salary well below your expectations and market rate.",
		difficulty: "medium",
		employerResponse: "Our budget for this position is $50,000. That's our best offer.",
		idealResponse:
			"Thank you for this offer. However, my market research and 5 years of experience in this field position me in a range of $65,000-$75,000. I would be happy to explore how we can bridge this gap, whether through salary or other benefits.",
		tips: [
			"Don't show disappointment or frustration",
			"Reaffirm your interest in the position",
			"Present objective market data",
			"Suggest creative alternatives",
		],
	},
	{
		id: "salary-history",
		type: "initial-offer",
		title: "The Salary History Question",
		description: "The employer asks for your current salary to base their offer on.",
		difficulty: "easy",
		employerResponse: "What is your current salary?",
		idealResponse:
			"I prefer to focus on the value I can bring to this new role. Based on my skills, experience, and market standards, I am looking for compensation between $X and $Y. Can you tell me if that aligns with your budget?",
		tips: [
			"You are not obligated to reveal your current salary",
			"Redirect toward your value and the market",
			"Ask questions about their budget range",
			"Stay polite but firm",
		],
	},
	{
		id: "no-negotiation",
		type: "counter-offer",
		title: "The Refusal to Negotiate",
		description: "The employer claims the offer is non-negotiable.",
		difficulty: "hard",
		employerResponse: "This salary is set by our pay scale. It is non-negotiable.",
		idealResponse:
			"I understand you have constraints. However, I am confident my contribution justifies a discussion. If the base salary is truly fixed, could we explore other options such as a signing bonus, an early review in 6 months, or additional vacation days?",
		tips: [
			"Never take 'no' as a final answer",
			"Explore alternatives to base salary",
			"Ask for a quick salary review",
			"Show your flexibility and creativity",
		],
	},
	{
		id: "competing-offer",
		type: "counter-offer",
		title: "Using a Competing Offer",
		description: "You have another offer and want to use it as leverage.",
		difficulty: "medium",
		employerResponse: "We are offering you $60,000 for this position.",
		idealResponse:
			"I truly appreciate this offer and [company] remains my first choice. However, I must be transparent: I have received another offer at $72,000. I would prefer to work with you - would it be possible to close the gap?",
		tips: [
			"Be honest - don't bluff about fictional offers",
			"Show your preference for this company",
			"Don't give too many details about the other offer",
			"Give them a chance to match",
		],
	},
	{
		id: "promotion-request",
		type: "promotion",
		title: "Promotion Request",
		description: "You are requesting a raise or promotion after several years.",
		difficulty: "medium",
		employerResponse: "Raises follow our standard annual process.",
		idealResponse:
			"I understand the standard process. However, since I joined 2 years ago, I have [specific achievements with numbers]. My contribution has exceeded the expectations of my current role. I would like to discuss a move to [new title] with compensation of [amount], reflecting my current responsibilities.",
		tips: [
			"Document all your achievements",
			"Use concrete numbers and metrics",
			"Propose a specific title and salary",
			"Timing: after a major success",
		],
	},
	{
		id: "remote-negotiation",
		type: "remote-work",
		title: "Negotiating Remote Work",
		description: "You want more flexibility to work remotely.",
		difficulty: "easy",
		employerResponse: "Our policy is 5 days in the office per week.",
		idealResponse:
			"I understand the importance of office presence. My proposal would be to start with 3 days in the office, 2 remote. I am more productive with this flexibility - in my current role, my productivity increased by 20% with this model. Could we try this for 3 months?",
		tips: [
			"Propose a trial period",
			"Show proof of remote productivity",
			"Be ready to compromise",
			"Highlight the benefits for the company",
		],
	},
];

// Industry Benchmarks Data
export const industryBenchmarks: IndustryBenchmark[] = [
	{
		industry: "Technology / IT",
		icon: ChartLineUpIcon,
		entryRange: { min: 8000, max: 12000 },
		midRange: { min: 15000, max: 25000 },
		seniorRange: { min: 30000, max: 50000 },
		executiveRange: { min: 60000, max: 100000 },
		growthRate: 15,
		demandLevel: "high",
	},
	{
		industry: "Finance / Banking",
		icon: CoinIcon,
		entryRange: { min: 7000, max: 10000 },
		midRange: { min: 12000, max: 20000 },
		seniorRange: { min: 25000, max: 45000 },
		executiveRange: { min: 50000, max: 90000 },
		growthRate: 10,
		demandLevel: "high",
	},
	{
		industry: "Healthcare / Medical",
		icon: HeartIcon,
		entryRange: { min: 5500, max: 8000 },
		midRange: { min: 10000, max: 18000 },
		seniorRange: { min: 20000, max: 35000 },
		executiveRange: { min: 40000, max: 70000 },
		growthRate: 12,
		demandLevel: "high",
	},
	{
		industry: "Industry / Manufacturing",
		icon: BriefcaseIcon,
		entryRange: { min: 5000, max: 7500 },
		midRange: { min: 9000, max: 15000 },
		seniorRange: { min: 18000, max: 30000 },
		executiveRange: { min: 35000, max: 60000 },
		growthRate: 8,
		demandLevel: "medium",
	},
	{
		industry: "Marketing / Communications",
		icon: MicrophoneIcon,
		entryRange: { min: 6000, max: 9000 },
		midRange: { min: 12000, max: 18000 },
		seniorRange: { min: 22000, max: 35000 },
		executiveRange: { min: 40000, max: 65000 },
		growthRate: 11,
		demandLevel: "medium",
	},
	{
		industry: "Human Resources",
		icon: UsersIcon,
		entryRange: { min: 5500, max: 8000 },
		midRange: { min: 10000, max: 16000 },
		seniorRange: { min: 20000, max: 32000 },
		executiveRange: { min: 38000, max: 60000 },
		growthRate: 9,
		demandLevel: "medium",
	},
	{
		industry: "Consulting",
		icon: LightbulbIcon,
		entryRange: { min: 8000, max: 12000 },
		midRange: { min: 18000, max: 28000 },
		seniorRange: { min: 35000, max: 55000 },
		executiveRange: { min: 70000, max: 120000 },
		growthRate: 14,
		demandLevel: "high",
	},
	{
		industry: "Commerce / Retail",
		icon: HouseIcon,
		entryRange: { min: 4500, max: 6500 },
		midRange: { min: 8000, max: 13000 },
		seniorRange: { min: 15000, max: 25000 },
		executiveRange: { min: 30000, max: 50000 },
		growthRate: 6,
		demandLevel: "medium",
	},
];

// Success Stories Data
export const successStories: SuccessStory[] = [
	{
		id: "sarah-tech",
		name: "Sara M.",
		role: "Senior Developer",
		industry: "Technology",
		originalOffer: 18000,
		finalOffer: 25000,
		strategy: "Market research + Competing offer",
		quote: "I took the time to do my research and dared to ask. The worst that could happen was a 'no'.",
		tips: [
			"Used data from Glassdoor and LinkedIn Salary",
			"Presented a competing offer ethically",
			"Also negotiated 5 additional vacation days",
		],
	},
	{
		id: "karim-finance",
		name: "Karim B.",
		role: "Financial Analyst",
		industry: "Finance",
		originalOffer: 12000,
		finalOffer: 16000,
		strategy: "Highlighting certifications + Timing",
		quote: "My CFA certification gave me considerable leverage. I waited until I obtained it before negotiating.",
		tips: [
			"Obtained certification before negotiating",
			"Asked after closing a successful project",
			"Proposed a 2-year development plan",
		],
	},
	{
		id: "amina-marketing",
		name: "Amina L.",
		role: "Marketing Manager",
		industry: "Marketing",
		originalOffer: 14000,
		finalOffer: 18500,
		strategy: "Creative negotiation + Total package",
		quote:
			"When they said the salary was fixed, I negotiated everything else. In the end, the package was worth 30% more.",
		tips: [
			"Negotiated a 15% performance bonus",
			"Obtained a training budget of 15,000/year",
			"Secured a salary review at 6 months",
		],
	},
	{
		id: "youssef-industry",
		name: "Youssef A.",
		role: "Project Manager",
		industry: "Industry",
		originalOffer: 15000,
		finalOffer: 19000,
		strategy: "Value demonstration + Patience",
		quote: "I took my time, asked to think it over, and came back with a solid case showing my added value.",
		tips: [
			"Asked for 48 hours to think about the offer",
			"Prepared a document with quantified achievements",
			"Did not accept the first counter-offer",
		],
	},
];

// Red Flags Data
export const redFlags: RedFlag[] = [
	{
		id: "pressure-tactics",
		title: "Pressure Tactics",
		description: "The employer pressures you to accept immediately or threatens to withdraw the offer.",
		severity: "danger",
		action: "Always ask for 24-48 hours to think. A serious company will understand.",
	},
	{
		id: "vague-compensation",
		title: "Vague Compensation",
		description: "The details of salary, bonuses, or benefits remain unclear even after asking questions.",
		severity: "warning",
		action: "Insist on getting all details in writing before accepting.",
	},
	{
		id: "negative-comments",
		title: "Negative Comments",
		description: "The employer makes negative remarks about your request or expectations.",
		severity: "warning",
		action: "This may indicate a problematic company culture. Stay vigilant.",
	},
	{
		id: "bait-switch",
		title: "Bait and Switch",
		description: "The discussed conditions change significantly in the final offer.",
		severity: "danger",
		action: "Politely confront the differences and request written clarifications.",
	},
	{
		id: "no-written-offer",
		title: "No Written Offer",
		description: "The company refuses or hesitates to put the offer in writing.",
		severity: "danger",
		action: "Never accept a purely verbal offer. Require an official document.",
	},
	{
		id: "below-market",
		title: "Far Below Market Rate",
		description: "The offer is significantly below market standards without justification.",
		severity: "warning",
		action: "Present market data and ask for a justification.",
	},
	{
		id: "excessive-questions",
		title: "Intrusive Questions",
		description: "Repeated requests about your current salary, family situation, or finances.",
		severity: "warning",
		action: "You are not obligated to answer. Redirect toward your skills and the role's value.",
	},
	{
		id: "unrealistic-promises",
		title: "Unrealistic Promises",
		description: "Promises of rapid raises or promotions without written commitment.",
		severity: "danger",
		action: "Request written commitments with specific deadlines and conditions.",
	},
];

// Questions to Ask Data
export const employerQuestions: EmployerQuestion[] = [
	{
		id: "salary-range",
		question: "What is the expected salary range for this position?",
		purpose: "Understand the available budget and calibrate your expectations",
		category: "compensation",
		whenToAsk: "From the first interview or when the salary topic is raised",
	},
	{
		id: "performance-review",
		question: "How and when are performance reviews and salary adjustments conducted?",
		purpose: "Understand opportunities for salary growth",
		category: "compensation",
		whenToAsk: "During the final negotiation",
	},
	{
		id: "bonus-structure",
		question: "What is the bonus structure? What criteria are bonuses based on?",
		purpose: "Evaluate the potential for variable compensation",
		category: "compensation",
		whenToAsk: "During the compensation discussion",
	},
	{
		id: "benefits-package",
		question: "Can you detail the complete benefits package?",
		purpose: "Evaluate the total value of the offer beyond salary",
		category: "benefits",
		whenToAsk: "Once the offer is received",
	},
	{
		id: "team-structure",
		question: "How is the team structured and what would my specific role be?",
		purpose: "Understand the actual responsibilities and context",
		category: "expectations",
		whenToAsk: "During technical interviews",
	},
	{
		id: "growth-path",
		question: "What are the growth opportunities within the company?",
		purpose: "Evaluate long-term career potential",
		category: "growth",
		whenToAsk: "During advanced interviews",
	},
	{
		id: "training-budget",
		question: "What budget is allocated for training and professional development?",
		purpose: "Understand the investment in employees",
		category: "growth",
		whenToAsk: "During benefits negotiation",
	},
	{
		id: "work-flexibility",
		question: "What is the company's policy on remote work and flexibility?",
		purpose: "Understand work-life balance",
		category: "culture",
		whenToAsk: "During culture-fit interviews",
	},
	{
		id: "success-metrics",
		question: "How will my success be measured at 6 months and 1 year?",
		purpose: "Understand concrete and measurable expectations",
		category: "expectations",
		whenToAsk: "During final interviews",
	},
	{
		id: "challenges",
		question: "What are the biggest challenges the team is currently facing?",
		purpose: "Identify potential problems and show your interest",
		category: "expectations",
		whenToAsk: "During interviews with the manager",
	},
	{
		id: "decision-timeline",
		question: "What is the expected timeline for the final decision?",
		purpose: "Plan your other opportunities and follow-ups",
		category: "expectations",
		whenToAsk: "At the end of each stage of the process",
	},
	{
		id: "company-values",
		question: "How do the company's values translate into day-to-day work?",
		purpose: "Evaluate the real culture vs marketing",
		category: "culture",
		whenToAsk: "During culture-fit interviews",
	},
];

// Timing Strategies Data
export const timingStrategies: TimingStrategy[] = [
	{
		id: "wait-for-offer",
		title: "Wait for the Formal Offer",
		description: "Don't discuss salary before receiving a concrete job offer.",
		bestTime: "After receiving a written or firm verbal offer",
		avoidTime: "During first interviews or before the employer is convinced",
		tips: [
			"The employer has invested more and is less inclined to lose you",
			"You have more leverage once they've specifically chosen you",
			"Tactfully deflect early questions about salary",
		],
	},
	{
		id: "after-success",
		title: "After a Major Success",
		description: "Negotiate a raise right after a significant achievement.",
		bestTime: "Within 2 weeks of completing a successful project",
		avoidTime: "During a difficult period or layoffs",
		tips: [
			"Your contribution is fresh in everyone's mind",
			"You can quantify your recent impact",
			"Psychological momentum works in your favor",
		],
	},
	{
		id: "market-timing",
		title: "Market Timing",
		description: "Take advantage of periods of high demand in your sector.",
		bestTime: "When your skill set is in high demand on the market",
		avoidTime: "During a recession or hiring freeze",
		tips: [
			"Monitor job market trends",
			"Take advantage of talent shortages in your field",
			"The start of the fiscal year often has more budget",
		],
	},
	{
		id: "before-review",
		title: "Before the Annual Review",
		description: "Initiate the discussion well before the official evaluation cycle.",
		bestTime: "2-3 months before annual evaluations",
		avoidTime: "Right after budgets are finalized",
		tips: [
			"Give your manager time to prepare the ground",
			"Budgets are not yet locked in",
			"You can influence the decision rather than just receive it",
		],
	},
	{
		id: "competing-offer",
		title: "With a Competing Offer",
		description: "Use another offer as negotiation leverage.",
		bestTime: "When you have a concrete offer from another company",
		avoidTime: "Never bluff - only use real offers",
		tips: [
			"Be transparent and ethical about the offer's existence",
			"Don't give all the details of the other offer",
			"Show your preference to stay if possible",
		],
	},
	{
		id: "thursday-friday",
		title: "Weekly Timing",
		description: "Some days are better than others for negotiating.",
		bestTime: "Thursday or Friday, preferably in the morning",
		avoidTime: "Monday morning or Friday end of day",
		tips: [
			"People are more relaxed toward the end of the week",
			"Avoid the stress of the beginning of the week",
			"In the morning, people are fresher and more receptive",
		],
	},
];

// Experience Level Tips
export const experienceLevelTips: Record<
	ExperienceLevel,
	{ label: string; icon: Icon; color: string; tips: string[]; leverage: string[]; pitfalls: string[] }
> = {
	entry: {
		label: "Entry Level (0-2 years)",
		icon: RocketIcon,
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		tips: [
			"Focus on learning and growth",
			"Negotiate a clear path to a raise",
			"Ask for a mentor or training program",
			"Accept a competitive salary but not excessively low",
		],
		leverage: [
			"Recent degrees and specific training",
			"Relevant internships or projects",
			"In-demand technical skills",
			"Enthusiasm and adaptability",
		],
		pitfalls: [
			"Accepting the first offer without negotiating",
			"Not asking about career progression",
			"Undervaluing your technical skills",
			"Ignoring non-salary benefits",
		],
	},
	mid: {
		label: "Mid-Level (3-5 years)",
		icon: StarIcon,
		color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		tips: [
			"Highlight your quantifiable achievements",
			"Negotiate increased responsibilities with the salary",
			"Ask for leadership opportunities",
			"Compare with market standards",
		],
		leverage: [
			"Proven experience in the field",
			"Successful projects with measurable results",
			"Established professional network",
			"Developed specialized skills",
		],
		pitfalls: [
			"Staying at the same level too long",
			"Not documenting your achievements",
			"Accepting more work without compensation",
			"Ignoring your market value",
		],
	},
	senior: {
		label: "Senior (6-10 years)",
		icon: MedalIcon,
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		tips: [
			"Negotiate a complete package (salary + equity + bonus)",
			"Ask for a title reflecting your seniority",
			"Include fair non-compete clauses",
			"Negotiate flexibility and autonomy",
		],
		leverage: [
			"Track record of leadership and results",
			"Recognized expertise in the industry",
			"Ability to train and mentor",
			"Strategic client/partner relationships",
		],
		pitfalls: [
			"Under-negotiating stock options",
			"Ignoring contractual clauses",
			"Not negotiating the job title",
			"Accepting unwritten promises",
		],
	},
	executive: {
		label: "Executive (10+ years)",
		icon: TrophyIcon,
		color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		tips: [
			"Have a lawyer or agent represent you",
			"Negotiate a severance package",
			"Include bonuses tied to overall performance",
			"Ensure a stock option acceleration clause",
		],
		leverage: [
			"Strategic vision and track record",
			"High-level network",
			"Ability to transform organizations",
			"Industry reputation",
		],
		pitfalls: [
			"Ignoring severance package details",
			"Not negotiating accelerated vesting",
			"Underestimating equity value",
			"Accepting unrealistic targets",
		],
	},
};

// Categories for filtering
export const benefitCategories = [
	{ id: "all", label: "All" },
	{ id: "monetary", label: "Monetary" },
	{ id: "time-off", label: "Time Off" },
	{ id: "growth", label: "Development" },
	{ id: "flexibility", label: "Flexibility" },
	{ id: "perks", label: "Perks" },
];
