import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	BriefcaseIcon,
	CertificateIcon,
	FirstAidKitIcon,
	GearIcon,
	GlobeIcon,
	HardHatIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import type { GapAnalysisData, LearningResource, SkillCategory } from "./gap-analysis-types";

// Category configuration
function getCategoryConfig(): Record<SkillCategory, { label: string; labelFr: string; icon: Icon; color: string }> {
	return {
		technical: {
			label: t`Technical Skills`,
			labelFr: "Compétences Techniques",
			icon: GearIcon,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		soft: {
			label: t`Soft Skills`,
			labelFr: "Compétences Relationnelles",
			icon: UsersIcon,
			color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		},
		languages: {
			label: t`Languages`,
			labelFr: "Langues",
			icon: GlobeIcon,
			color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		},
		certifications: {
			label: t`Certifications`,
			labelFr: "Certifications",
			icon: CertificateIcon,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
		tools: {
			label: t`Tools & Software`,
			labelFr: "Outils & Logiciels",
			icon: GearIcon,
			color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
		},
	};
}

export const CATEGORY_CONFIG: Record<SkillCategory, { label: string; labelFr: string; icon: Icon; color: string }> =
	new Proxy({} as Record<SkillCategory, { label: string; labelFr: string; icon: Icon; color: string }>, {
		get(_target, prop: string) {
			return getCategoryConfig()[prop as SkillCategory];
		},
		ownKeys() {
			return Object.keys(getCategoryConfig());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getCategoryConfig();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as SkillCategory] };
			}
			return undefined;
		},
	});

// Industry configuration
function getIndustryConfig(): Record<string, { label: string; labelFr: string; icon: Icon; color: string }> {
	return {
		healthcare: {
			label: t`Healthcare`,
			labelFr: "Santé",
			icon: FirstAidKitIcon,
			color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		},
		industrial: {
			label: t`Industrial`,
			labelFr: "Industrie",
			icon: GearIcon,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		hse: {
			label: "HSE",
			labelFr: "HSE",
			icon: HardHatIcon,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
		technology: {
			label: t`Technology`,
			labelFr: "Technologie",
			icon: GearIcon,
			color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		},
		general: {
			label: t`General`,
			labelFr: "Général",
			icon: BriefcaseIcon,
			color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
		},
	};
}

export const INDUSTRY_CONFIG: Record<string, { label: string; labelFr: string; icon: Icon; color: string }> = new Proxy(
	{} as Record<string, { label: string; labelFr: string; icon: Icon; color: string }>,
	{
		get(_target, prop: string) {
			return getIndustryConfig()[prop];
		},
		ownKeys() {
			return Object.keys(getIndustryConfig());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getIndustryConfig();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as keyof typeof data] };
			}
			return undefined;
		},
	},
);

// NOTE: Target roles are now fetched from the database via orpc.careerRole.listWithSkillCount
// The old hardcoded TARGET_ROLES constant has been removed.
// Roles include: nursing, medical_assistant, maintenance_tech, hse_coordinator, safety_officer, industrial_operator
// Use the admin panel at /dashboard/admin/reference-data to seed and manage these roles.

// Learning resources database
const LEARNING_RESOURCES: Record<string, LearningResource[]> = {
	"Patient Care": [
		{
			id: "pc1",
			title: "Patient Care Fundamentals",
			titleFr: "Fondamentaux des Soins aux Patients",
			type: "course",
			platform: "Coursera",
			url: "https://coursera.org",
			duration: "8 weeks",
			cost: "subscription",
			difficulty: "beginner",
			rating: 4.7,
		},
		{
			id: "pc2",
			title: "Clinical Practice Guide",
			titleFr: "Guide de Pratique Clinique",
			type: "book",
			platform: "Amazon",
			url: "https://amazon.com",
			duration: "Self-paced",
			cost: "paid",
			difficulty: "intermediate",
			rating: 4.5,
		},
		{
			id: "pc3",
			title: "Hands-on Patient Care Training",
			titleFr: "Formation Pratique Soins Patients",
			type: "practice",
			platform: "IMTA",
			url: "#",
			duration: "40 hours",
			cost: "paid",
			difficulty: "intermediate",
			rating: 4.8,
		},
	],
	"First Aid": [
		{
			id: "fa1",
			title: "First Aid Certification",
			titleFr: "Certification Premiers Secours",
			type: "certification",
			platform: "Red Cross",
			url: "https://redcross.org",
			duration: "2 days",
			cost: "paid",
			difficulty: "beginner",
			rating: 4.9,
		},
		{
			id: "fa2",
			title: "Emergency First Response",
			titleFr: "Premiers Secours d'Urgence",
			type: "course",
			platform: "Udemy",
			url: "https://udemy.com",
			duration: "12 hours",
			cost: "paid",
			difficulty: "beginner",
			rating: 4.6,
		},
	],
	"Risk Assessment": [
		{
			id: "ra1",
			title: "Risk Assessment Masterclass",
			titleFr: "Masterclass Évaluation des Risques",
			type: "course",
			platform: "LinkedIn Learning",
			url: "https://linkedin.com/learning",
			duration: "6 hours",
			cost: "subscription",
			difficulty: "intermediate",
			rating: 4.5,
		},
		{
			id: "ra2",
			title: "Hazard Identification Workshop",
			titleFr: "Atelier Identification des Dangers",
			type: "practice",
			platform: "IMTA",
			url: "#",
			duration: "2 days",
			cost: "paid",
			difficulty: "intermediate",
			rating: 4.7,
		},
		{
			id: "ra3",
			title: "ISO 31000 Risk Management",
			titleFr: "ISO 31000 Gestion des Risques",
			type: "certification",
			platform: "BSI",
			url: "https://bsigroup.com",
			duration: "3 days",
			cost: "paid",
			difficulty: "advanced",
			rating: 4.8,
		},
	],
	"Machine Operation": [
		{
			id: "mo1",
			title: "Industrial Machinery Basics",
			titleFr: "Bases Machines Industrielles",
			type: "course",
			platform: "Skillshare",
			url: "https://skillshare.com",
			duration: "20 hours",
			cost: "subscription",
			difficulty: "beginner",
			rating: 4.3,
		},
		{
			id: "mo2",
			title: "CNC Operation Certification",
			titleFr: "Certification Opération CNC",
			type: "certification",
			platform: "FANUC",
			url: "https://fanuc.com",
			duration: "1 week",
			cost: "paid",
			difficulty: "intermediate",
			rating: 4.6,
		},
	],
	Communication: [
		{
			id: "co1",
			title: "Professional Communication Skills",
			titleFr: "Compétences Communication Professionnelle",
			type: "course",
			platform: "Coursera",
			url: "https://coursera.org",
			duration: "4 weeks",
			cost: "subscription",
			difficulty: "beginner",
			rating: 4.5,
		},
		{
			id: "co2",
			title: "Effective Workplace Communication",
			titleFr: "Communication Efficace au Travail",
			type: "tutorial",
			platform: "YouTube",
			url: "https://youtube.com",
			duration: "3 hours",
			cost: "free",
			difficulty: "beginner",
			rating: 4.2,
		},
	],
	Leadership: [
		{
			id: "ld1",
			title: "Leadership Foundations",
			titleFr: "Fondamentaux du Leadership",
			type: "course",
			platform: "LinkedIn Learning",
			url: "https://linkedin.com/learning",
			duration: "10 hours",
			cost: "subscription",
			difficulty: "intermediate",
			rating: 4.6,
		},
		{
			id: "ld2",
			title: "Executive Leadership Program",
			titleFr: "Programme Leadership Exécutif",
			type: "mentorship",
			platform: "IMTA",
			url: "#",
			duration: "3 months",
			cost: "paid",
			difficulty: "advanced",
			rating: 4.9,
		},
	],
	"ISO 45001": [
		{
			id: "is1",
			title: "ISO 45001 Lead Auditor",
			titleFr: "Auditeur Principal ISO 45001",
			type: "certification",
			platform: "TUV",
			url: "https://tuv.com",
			duration: "5 days",
			cost: "paid",
			difficulty: "advanced",
			rating: 4.8,
		},
		{
			id: "is2",
			title: "ISO 45001 Implementation Guide",
			titleFr: "Guide Implémentation ISO 45001",
			type: "course",
			platform: "Udemy",
			url: "https://udemy.com",
			duration: "8 hours",
			cost: "paid",
			difficulty: "intermediate",
			rating: 4.4,
		},
	],
	French: [
		{
			id: "fr1",
			title: "Professional French",
			titleFr: "Français Professionnel",
			type: "course",
			platform: "Alliance Francaise",
			url: "https://alliancefrancaise.org",
			duration: "3 months",
			cost: "paid",
			difficulty: "intermediate",
			rating: 4.7,
		},
		{
			id: "fr2",
			title: "French for Healthcare",
			titleFr: "Français Médical",
			type: "course",
			platform: "Babbel",
			url: "https://babbel.com",
			duration: "Self-paced",
			cost: "subscription",
			difficulty: "intermediate",
			rating: 4.3,
		},
	],
	English: [
		{
			id: "en1",
			title: "Business English",
			titleFr: "Anglais des Affaires",
			type: "course",
			platform: "British Council",
			url: "https://britishcouncil.org",
			duration: "3 months",
			cost: "paid",
			difficulty: "intermediate",
			rating: 4.6,
		},
		{
			id: "en2",
			title: "Technical English for Industry",
			titleFr: "Anglais Technique Industriel",
			type: "course",
			platform: "Coursera",
			url: "https://coursera.org",
			duration: "6 weeks",
			cost: "subscription",
			difficulty: "intermediate",
			rating: 4.4,
		},
	],
};

// Default resources for skills not in database
const DEFAULT_RESOURCES: LearningResource[] = [
	{
		id: "def1",
		title: "Online Course",
		titleFr: "Cours en Ligne",
		type: "course",
		platform: "Various",
		url: "#",
		duration: "Self-paced",
		cost: "paid",
		difficulty: "beginner",
		rating: 4.0,
	},
	{
		id: "def2",
		title: "Self-Study Materials",
		titleFr: "Matériaux Auto-Formation",
		type: "tutorial",
		platform: "Various",
		url: "#",
		duration: "Self-paced",
		cost: "free",
		difficulty: "beginner",
		rating: 3.8,
	},
];

// Helper functions
export function getDefaultGapAnalysisData(): GapAnalysisData {
	return {
		currentSkills: [],
		selectedRoleId: null,
		progressRecords: [],
		weeklyGoalHours: 10,
		lastAnalysisDate: new Date().toISOString(),
		exportHistory: [],
	};
}

export function calculateGapSize(currentLevel: number, requiredLevel: number): number {
	return Math.max(0, requiredLevel - currentLevel);
}

export function calculatePriority(gap: number, importance: "critical" | "important" | "nice-to-have"): number {
	const importanceWeight = importance === "critical" ? 3 : importance === "important" ? 2 : 1;
	return gap * importanceWeight;
}

export function estimateTimeToClose(gapSize: number, category: SkillCategory): number {
	// Estimate weeks needed based on gap size and skill category
	const baseWeeksPerLevel: Record<SkillCategory, number> = {
		technical: 8,
		soft: 6,
		languages: 12,
		certifications: 4,
		tools: 4,
	};
	return Math.ceil(gapSize * baseWeeksPerLevel[category]);
}

export function getResourcesForSkill(skillName: string): LearningResource[] {
	return LEARNING_RESOURCES[skillName] || DEFAULT_RESOURCES;
}

export function formatSalary(amount: number): string {
	return `${amount.toLocaleString()} DH`;
}
