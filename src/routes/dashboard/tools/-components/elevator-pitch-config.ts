import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	BookmarkSimpleIcon,
	BriefcaseIcon,
	ClockIcon,
	GlobeIcon,
	GraduationCapIcon,
	HeartIcon,
	LightbulbIcon,
	MagnifyingGlassIcon,
	MegaphoneIcon,
	RocketLaunchIcon,
	SparkleIcon,
	SpeakerHighIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	UserIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import type {
	ContextType,
	DeliveryTip,
	ExamplePitch,
	IndustryTemplate,
	PitchLength,
	PitchStep,
} from "./elevator-pitch-types";

// Constants
const WORDS_PER_MINUTE = 150;

export const pitchLengthConfig: Record<
	PitchLength,
	{ label: string; seconds: number; words: number; description: string }
> = {
	"30s": {
		label: "30 seconds",
		seconds: 30,
		words: 75,
		description: "Perfect for quick encounters",
	},
	"60s": {
		label: "60 seconds",
		seconds: 60,
		words: 150,
		description: "Ideal for networking",
	},
	"2min": {
		label: "2 minutes",
		seconds: 120,
		words: 300,
		description: "For in-depth interviews",
	},
};

export const contextConfig: Record<ContextType, { label: string; icon: Icon; description: string; color: string }> = {
	interview: {
		label: "Job Interview",
		icon: BriefcaseIcon,
		description: "Formal and structured",
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	networking: {
		label: "Networking",
		icon: UsersIcon,
		description: "Engaging and memorable",
		color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	},
	"cold-outreach": {
		label: "Cold Outreach",
		icon: MegaphoneIcon,
		description: "Concise and impactful",
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	},
};

export const pitchSteps: PitchStep[] = [
	{
		id: "hook",
		title: "Hook",
		description: "Start with an attention-grabbing sentence",
		placeholder: "E.g.: Have you ever noticed that companies waste 30% of their time in inefficient meetings?",
		tip: "Ask a question, share a surprising statistic, or start with a common challenge",
		icon: TargetIcon,
	},
	{
		id: "who",
		title: "Who You Are",
		description: "Introduce yourself and your current role",
		placeholder: "E.g.: I'm Jane Smith, a process optimization specialist with 5 years of experience...",
		tip: "Be specific about your title and area of expertise",
		icon: UserIcon,
	},
	{
		id: "what",
		title: "What You Do",
		description: "Explain your unique value proposition",
		placeholder: "E.g.: I help SMBs reduce their meeting time by 40% through agile methodologies...",
		tip: "Use action verbs and quantify your results",
		icon: RocketLaunchIcon,
	},
	{
		id: "why",
		title: "Why It Matters",
		description: "Show the impact of your work",
		placeholder: "E.g.: This allows my clients to reclaim 10 hours per week to focus on their growth...",
		tip: "Connect your skills to concrete benefits for the employer",
		icon: StarIcon,
	},
	{
		id: "cta",
		title: "Call to Action",
		description: "End with an invitation to continue the conversation",
		placeholder: "E.g.: I would love to discuss how I could bring this value to your team.",
		tip: "Adapt your call to action to the context (interview, networking, etc.)",
		icon: ArrowRightIcon,
	},
];

export const industryTemplates: IndustryTemplate[] = [
	{
		industry: "technology",
		label: "Technology / IT",
		icon: GlobeIcon,
		color: "from-cyan-500/20 via-blue-500/10 to-transparent",
		templates: {
			"30s":
				"I'm [Name], a [specialty] developer with [X] years of experience. I transform complex ideas into elegant software solutions that improve user experience. My latest project increased engagement by 40%. How can I help you?",
			"60s":
				"Hello, I'm [Name], a specialist in [tech domain]. For [X] years, I've been helping companies solve complex technical challenges. Recently, I led the development of an application that helped a startup triple its user base in 6 months. My passion? Creating solutions that truly make a difference. I'd love to discuss your technology projects.",
			"2min":
				"My name is [Name], and I've been passionate about technology my whole life. With [X] years of experience in [specialty], I've had the opportunity to work on varied projects, from innovative startups to large enterprises. What sets me apart? My ability to understand business needs and translate them into high-performing technical solutions. For example, in my last role at [Company], I led a complete architecture overhaul that reduced infrastructure costs by 35% while improving performance. I'm particularly interested in [specific domain] and would be enthusiastic about bringing my expertise to an ambitious team like yours.",
		},
	},
	{
		industry: "finance",
		label: "Finance / Banking",
		icon: TrendUpIcon,
		color: "from-green-500/20 via-emerald-500/10 to-transparent",
		templates: {
			"30s":
				"I'm [Name], a certified financial analyst. I help companies optimize their cash flow and reduce costs. My analysis recently saved a client 2M EUR. How can I create value for you?",
			"60s":
				"Hello, [Name], corporate finance expert with [X] years of experience. My specialty: transforming complex financial data into actionable insights. At [Company], I developed a predictive model that improved forecast accuracy by 30%. I'm passionate about the intersection of finance and technology. Let's talk about your financial challenges.",
			"2min":
				"My name is [Name], a finance professional with expertise in [specialty]. Over my [X] years in the sector, I've supported companies of all sizes in their financial transformation. What drives me? Using numbers to tell a story and guide strategic decisions. Recently, I led a restructuring project that improved a division's profitability by 25% in 18 months. I'm proficient with modern tools like [tools] and certified in [certifications]. I'm looking for an opportunity where I can combine analytical rigor and strategic vision to create lasting value.",
		},
	},
	{
		industry: "healthcare",
		label: "Healthcare",
		icon: HeartIcon,
		color: "from-rose-500/20 via-pink-500/10 to-transparent",
		templates: {
			"30s":
				"I'm [Name], a healthcare professional specializing in [domain]. My mission: improving quality of care while optimizing resources. I helped reduce wait times by 25% in my last position.",
			"60s":
				"Hello, I'm [Name], with [X] years of experience in the healthcare sector. My passion is improving patient experience through innovation. In my previous role, I implemented a new protocol that increased patient satisfaction by 35%. I firmly believe that technology can transform care. Let's discuss your healthcare initiatives.",
			"2min":
				"My name is [Name], and I've dedicated my career to improving healthcare systems. With [X] years of experience in [specialty], I've had the privilege of contributing to projects that truly impacted patients' lives. For example, I led the implementation of a management system that reduced medication errors by 40%. What sets me apart? My dual expertise in clinical care and project management. I understand the realities on the ground while having the strategic vision needed to drive change. I'm particularly enthusiastic about joining an organization that places innovation and the patient at the heart of its mission.",
		},
	},
	{
		industry: "marketing",
		label: "Marketing / Communication",
		icon: MegaphoneIcon,
		color: "from-orange-500/20 via-amber-500/10 to-transparent",
		templates: {
			"30s":
				"I'm [Name], a digital marketing specialist. I turn audiences into loyal customers. My latest campaign generated a 300% ROI. Ready to boost your growth?",
			"60s":
				"Hello, [Name] here, marketing strategy expert with [X] years of experience. I create campaigns that connect brands to their audience authentically. Recently, I helped a startup grow from 0 to 50K followers in 6 months on a limited budget. My secret? Combining creativity and data. Let's talk about your marketing goals.",
			"2min":
				"My name is [Name], and marketing has been my passion for [X] years. I've had the chance to work with brands of all sizes, from startups to Fortune 500 companies. What sets me apart? My ability to deeply understand consumers and create stories that resonate. For example, I recently orchestrated an integrated campaign that increased brand awareness by 45% and sales by 28% in one quarter. I'm equally skilled in strategic aspects and execution, from content marketing to growth hacking. I'm now looking for an opportunity where I can have a significant impact on the growth of an ambitious company.",
		},
	},
	{
		industry: "consulting",
		label: "Consulting",
		icon: LightbulbIcon,
		color: "from-indigo-500/20 via-purple-500/10 to-transparent",
		templates: {
			"30s":
				"I'm [Name], a consultant in [specialty]. I help leaders transform their challenges into opportunities. My last client doubled their productivity in 6 months. How can I support you?",
			"60s":
				"Hello, I'm [Name], a senior consultant with [X] years of experience in business transformation. My specialty: identifying hidden performance levers and building actionable roadmaps. Recently, I supported an SMB in its digital transformation, resulting in a 30% cost reduction. Let's discuss your strategic challenges.",
			"2min":
				"My name is [Name], and I've been supporting organizations in their transformations for [X] years. My approach? Combining analytical rigor and emotional intelligence to drive change. I've worked with clients across various sectors, from industry to services, on issues ranging from strategy to operational excellence. A recent example: I led a restructuring mission that saved an industrial group 15M EUR annually while improving team morale. What excites me about consulting is the diversity of challenges and the opportunity to have a concrete impact. I'm looking for an opportunity where I can continue solving complex problems alongside ambitious leaders.",
		},
	},
	{
		industry: "education",
		label: "Education / Training",
		icon: GraduationCapIcon,
		color: "from-blue-500/20 via-sky-500/10 to-transparent",
		templates: {
			"30s":
				"I'm [Name], a training specialist with [X] years of experience. I transform complex concepts into engaging learning experiences. My training programs have a 95% satisfaction rate.",
			"60s":
				"Hello, I'm [Name], an expert in pedagogy and skills development. My passion: creating learning experiences that truly transform people. I've trained over 500 professionals and designed programs that improved team performance by 40%. Let's talk about your training needs.",
			"2min":
				"My name is [Name], and education has been my calling for [X] years. I've had the privilege of training thousands of people, from students to senior executives. What sets me apart? My ability to adapt my pedagogical approach to each audience and create content that sticks. For example, I designed a leadership program that was deployed in 5 countries and trained over 1,000 managers. The results? A 50% improvement in team engagement scores. I'm skilled in both traditional methods and digital learning. I'm looking for an opportunity where I can have a large-scale impact on talent development.",
		},
	},
	{
		industry: "general",
		label: "General",
		icon: StarIcon,
		color: "from-slate-500/20 via-gray-500/10 to-transparent",
		templates: {
			"30s":
				"I'm [Name], a [domain] professional with [X] years of experience. I bring [key skill] that has delivered [concrete result]. How can I create value for you?",
			"60s":
				"Hello, I'm [Name]. For [X] years, I've been specializing in [domain]. What sets me apart? My ability to [unique skill] which has enabled my previous employers to [measurable result]. I'm passionate about [passion/interest] and I'm looking for an opportunity where I can [goal]. Let's talk!",
			"2min":
				"My name is [Name], and I'm a [title] with [X] years of experience in [sector]. Throughout my career, I've developed unique expertise in [areas of expertise]. What motivates me? [Motivation/passion]. In my last role at [Company], I had the opportunity to [main achievement with numbers]. This experience taught me [key learning]. I'm particularly proud of [accomplishment]. Today, I'm looking for an opportunity that will allow me to [career goal] within an organization that values [values]. I'd love to discuss how my background could benefit your team.",
		},
	},
];

export const deliveryTips: DeliveryTip[] = [
	{
		id: "pace",
		title: "Pace and Pauses",
		description: "Speak at a moderate pace (150 words/min) and use strategic pauses for impact",
		icon: ClockIcon,
		category: "vocal",
	},
	{
		id: "tone",
		title: "Tone Variation",
		description: "Vary your intonation to avoid monotony and emphasize key points",
		icon: SpeakerHighIcon,
		category: "vocal",
	},
	{
		id: "posture",
		title: "Open Posture",
		description: "Stand straight, shoulders back, hands visible to project confidence",
		icon: UserIcon,
		category: "body",
	},
	{
		id: "eye-contact",
		title: "Eye Contact",
		description: "Maintain natural eye contact to create an authentic connection",
		icon: MagnifyingGlassIcon,
		category: "body",
	},
	{
		id: "story",
		title: "Tell a Story",
		description: "Structure your pitch like a mini-story with a beginning, middle, and end",
		icon: BookmarkSimpleIcon,
		category: "content",
	},
	{
		id: "specificity",
		title: "Be Specific",
		description: "Use numbers and concrete examples rather than generalities",
		icon: TargetIcon,
		category: "content",
	},
	{
		id: "breathe",
		title: "Breathe",
		description: "Take a deep breath before starting to calm your nerves",
		icon: HeartIcon,
		category: "mental",
	},
	{
		id: "visualize",
		title: "Visualize Success",
		description: "Imagine a positive reaction from your listener before you begin",
		icon: SparkleIcon,
		category: "mental",
	},
];

export const examplePitches: ExamplePitch[] = [
	{
		id: "tech-30s",
		title: "Full Stack Developer",
		context: "interview",
		industry: "technology",
		length: "30s",
		content:
			"Hello, I'm Thomas Martin, a Full Stack developer with 4 years of experience in React and Node.js. My specialty? Creating high-performance applications that transform user experience. My latest project reduced load time by 60% and increased conversion by 25%. I'd love to discuss how I could bring this expertise to your team.",
		highlights: ["Concrete numbers", "Clear specialty", "Call to action"],
	},
	{
		id: "marketing-60s",
		title: "Marketing Manager",
		context: "networking",
		industry: "marketing",
		length: "60s",
		content:
			"Nice to meet you! I'm Sophie Leroy, a digital marketing manager for 6 years. What excites me? Understanding what truly motivates consumers and creating campaigns that resonate. Recently, I orchestrated a new product launch that exceeded sales targets by 150% using an innovative micro-influencer strategy. What sets me apart is my ability to combine creativity and data for measurable results. I'm currently open to opportunities in the tech or e-commerce sector. What brings you to this event?",
		highlights: ["Engaging opening", "Specific example", "Return question"],
	},
	{
		id: "finance-2min",
		title: "Senior Financial Analyst",
		context: "interview",
		industry: "finance",
		length: "2min",
		content:
			"Thank you for seeing me. I'm Alexandre Dubois, a senior financial analyst with 8 years of experience in banking and asset management. My career has been guided by a passion for transforming complex data into clear strategic decisions. At BNP Paribas, I led a team of 5 analysts responsible for a 500M euro portfolio. Our innovative predictive analysis approach identified investment opportunities that outperformed the market by 12% over 3 years. What sets me apart is my dual expertise in quantitative analysis and strategic communication. I don't just produce reports - I translate insights into actionable recommendations for decision-makers. I've also trained over 50 colleagues on our methodology, which has become a standard in the division. I'm particularly enthusiastic about joining your team because your ESG approach aligns with my values and my conviction that finance can be a lever for positive change. How do you currently integrate ESG criteria into your analyses?",
		highlights: ["Clear structure", "Quantified results", "Relevant question"],
	},
	{
		id: "consulting-networking",
		title: "Transformation Consultant",
		context: "networking",
		industry: "consulting",
		length: "60s",
		content:
			"Hello! Marie Chen, digital transformation consultant. Did you know that 70% of transformation projects fail? That's exactly the problem I solve. For 5 years, I've been supporting mid-size companies in their digital evolution with an 85% success rate. My secret? I don't focus on the technology but on the people. The last project I led not only met its technical objectives but also improved employee engagement by 40%. I'm curious - what's the biggest transformation challenge you're facing right now?",
		highlights: ["Hook statistic", "Clear differentiation", "Open question"],
	},
	{
		id: "healthcare-cold",
		title: "Healthcare Project Manager",
		context: "cold-outreach",
		industry: "healthcare",
		length: "30s",
		content:
			"Hello, I'm Dr. Emma Rousseau, specializing in improving patient pathways. I recently read your article on care coordination challenges and I have direct experience in this area - my last project reduced readmissions by 30%. Would you be available for a 15-minute conversation next week?",
		highlights: ["Personalized reference", "Impactful result", "Specific request"],
	},
];

// Helper functions
export function countWords(text: string): number {
	return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateTime(words: number): number {
	return Math.round((words / WORDS_PER_MINUTE) * 60);
}
