import {
	ArrowsClockwiseIcon,
	BriefcaseIcon,
	ChartBarIcon,
	EnvelopeIcon,
	GlobeIcon,
	LightbulbIcon,
	LinkedinLogoIcon,
	ListBulletsIcon,
	RocketLaunchIcon,
	StarIcon,
	TagIcon,
	TextAaIcon,
	ThumbsUpIcon,
	UserIcon,
} from "@phosphor-icons/react";

import type { AiWriterIndustry } from "@/integrations/drizzle/schema";

import type { IndustryOption, IndustryTerms, ToneOption, ToolConfig } from "./ai-writer-types";

export const toneOptions: ToneOption[] = [
	{
		value: "professional",
		label: "Professional",
		description: "Balanced and formal tone",
		icon: BriefcaseIcon,
	},
	{
		value: "confident",
		label: "Confident",
		description: "Assertive and impactful",
		icon: RocketLaunchIcon,
	},
	{
		value: "friendly",
		label: "Approachable",
		description: "Warm and engaging",
		icon: ThumbsUpIcon,
	},
	{
		value: "executive",
		label: "Executive",
		description: "Leadership and vision",
		icon: StarIcon,
	},
	{
		value: "creative",
		label: "Creative",
		description: "Original and dynamic",
		icon: LightbulbIcon,
	},
];

export const industries: IndustryOption[] = [
	{ value: "technology", label: "Technology / IT" },
	{ value: "healthcare", label: "Healthcare" },
	{ value: "finance", label: "Finance / Banking" },
	{ value: "marketing", label: "Marketing / Communication" },
	{ value: "engineering", label: "Engineering" },
	{ value: "education", label: "Education" },
	{ value: "general", label: "General" },
];

export const actionVerbs: Record<string, string[]> = {
	leadership: ["Led", "Supervised", "Coordinated", "Drove", "Mobilized", "United", "Managed", "Facilitated"],
	achievement: ["Achieved", "Accomplished", "Attained", "Exceeded", "Obtained", "Won", "Secured"],
	creation: ["Created", "Developed", "Designed", "Crafted", "Innovated", "Envisioned", "Launched", "Initiated"],
	improvement: ["Improved", "Optimized", "Strengthened", "Increased", "Enhanced", "Modernized", "Streamlined"],
	analysis: ["Analyzed", "Evaluated", "Examined", "Identified", "Diagnosed", "Measured", "Audited"],
	communication: ["Presented", "Communicated", "Negotiated", "Persuaded", "Convinced", "Trained", "Advised"],
	management: ["Managed", "Administered", "Organized", "Planned", "Budgeted", "Controlled", "Oversaw"],
	technical: ["Implemented", "Configured", "Deployed", "Integrated", "Automated", "Programmed", "Tested"],
};

export const toolsConfig: ToolConfig[] = [
	{
		id: "bullet-generator",
		icon: ListBulletsIcon,
		title: "Bullet Point Generator",
		description: "Transform your responsibilities into impactful achievements",
		gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
		iconBg: "bg-blue-100 dark:bg-blue-900/30",
		iconColor: "text-blue-600 dark:text-blue-400",
	},
	{
		id: "summary-writer",
		icon: UserIcon,
		title: "Summary Writer",
		description: "Create a compelling professional summary",
		gradient: "from-purple-500/20 via-violet-500/10 to-transparent",
		iconBg: "bg-purple-100 dark:bg-purple-900/30",
		iconColor: "text-purple-600 dark:text-purple-400",
	},
	{
		id: "achievement-quantifier",
		icon: ChartBarIcon,
		title: "Achievement Quantifier",
		description: "Add metrics to your accomplishments",
		gradient: "from-green-500/20 via-emerald-500/10 to-transparent",
		iconBg: "bg-green-100 dark:bg-green-900/30",
		iconColor: "text-green-600 dark:text-green-400",
	},
	{
		id: "action-verbs",
		icon: RocketLaunchIcon,
		title: "Action Verbs",
		description: "Powerful verb suggestions for your sentences",
		gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
		iconBg: "bg-amber-100 dark:bg-amber-900/30",
		iconColor: "text-amber-600 dark:text-amber-400",
	},
	{
		id: "skills-extractor",
		icon: TagIcon,
		title: "Skills Extractor",
		description: "Extract key skills from job postings",
		gradient: "from-cyan-500/20 via-teal-500/10 to-transparent",
		iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
		iconColor: "text-cyan-600 dark:text-cyan-400",
	},
	{
		id: "cover-letter",
		icon: EnvelopeIcon,
		title: "Cover Letter Generator",
		description: "Create a personalized cover letter",
		gradient: "from-rose-500/20 via-pink-500/10 to-transparent",
		iconBg: "bg-rose-100 dark:bg-rose-900/30",
		iconColor: "text-rose-600 dark:text-rose-400",
	},
	{
		id: "linkedin-optimizer",
		icon: LinkedinLogoIcon,
		title: "LinkedIn Optimizer",
		description: "Optimize your LinkedIn summary for more visibility",
		gradient: "from-sky-500/20 via-blue-500/10 to-transparent",
		iconBg: "bg-sky-100 dark:bg-sky-900/30",
		iconColor: "text-sky-600 dark:text-sky-400",
	},
	{
		id: "industry-language",
		icon: GlobeIcon,
		title: "Industry Language",
		description: "Term suggestions specific to your industry",
		gradient: "from-indigo-500/20 via-purple-500/10 to-transparent",
		iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
		iconColor: "text-indigo-600 dark:text-indigo-400",
	},
	{
		id: "grammar-checker",
		icon: TextAaIcon,
		title: "Style Checker",
		description: "Check grammar and improve clarity",
		gradient: "from-red-500/20 via-rose-500/10 to-transparent",
		iconBg: "bg-red-100 dark:bg-red-900/30",
		iconColor: "text-red-600 dark:text-red-400",
	},
	{
		id: "comparison-view",
		icon: ArrowsClockwiseIcon,
		title: "Before/After Comparison",
		description: "Visualize the improvements made",
		gradient: "from-slate-500/20 via-gray-500/10 to-transparent",
		iconBg: "bg-slate-100 dark:bg-slate-900/30",
		iconColor: "text-slate-600 dark:text-slate-400",
	},
];

export const industryTerms: Record<AiWriterIndustry, IndustryTerms> = {
	technology: {
		keywords: ["Agile", "DevOps", "Cloud-native", "Microservices", "CI/CD", "Scalability", "API-first"],
		phrases: ["Scalable solutions architect", "Technology innovation champion", "Digital transformation expert"],
	},
	healthcare: {
		keywords: ["Patient-centered", "Evidence-based", "Clinical protocols", "Quality of care", "Compliance"],
		phrases: ["Patient-centered approach", "Excellence in medical care", "Recognized clinical leadership"],
	},
	finance: {
		keywords: ["ROI", "Due diligence", "Risk management", "Compliance", "Fintech", "Algorithmic trading"],
		phrases: ["Profitability optimization", "Rigorous risk management", "Financial analysis expert"],
	},
	marketing: {
		keywords: ["ROI", "KPIs", "Growth hacking", "Content strategy", "Brand awareness", "Conversion"],
		phrases: ["Data-driven growth strategy", "Client acquisition expert", "Digital marketing specialist"],
	},
	engineering: {
		keywords: ["CAD", "Lean manufacturing", "Six Sigma", "R&D", "Industrialization", "Total quality"],
		phrases: ["Operational excellence", "Industrial process optimization", "Continuous product innovation"],
	},
	education: {
		keywords: ["Pedagogy", "Curriculum", "E-learning", "Assessment", "Inclusion", "Competencies"],
		phrases: ["Innovative pedagogical approach", "Academic excellence", "Learner-centered training"],
	},
	general: {
		keywords: ["Results", "Performance", "Collaboration", "Innovation", "Excellence", "Optimization"],
		phrases: ["Results-oriented", "Strong team spirit", "Proven adaptability"],
	},
};
