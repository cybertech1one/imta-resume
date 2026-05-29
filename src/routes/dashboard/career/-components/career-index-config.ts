import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	BriefcaseIcon,
	BuildingsIcon,
	CompassIcon,
	CurrencyCircleDollarIcon,
	FirstAidKitIcon,
	GearIcon,
	GraduationCapIcon,
	HandshakeIcon,
	HardHatIcon,
	HeartIcon,
	LightbulbIcon,
	RocketLaunchIcon,
	ShieldCheckIcon,
	SparkleIcon,
	TargetIcon,
	TrendUpIcon,
	UserIcon,
	UsersIcon,
	WrenchIcon,
} from "@phosphor-icons/react";
import type {
	CareerMatch,
	ExtendedPersonalityProfile,
	PersonalityProfile,
	ProgramData,
	QuizAnswer,
	QuizQuestion,
	StorageMatch,
} from "./career-index-types";

// Icon name to component mapping for database-driven questions
const iconNameToComponent: Record<string, Icon> = {
	BuildingsIcon,
	HardHatIcon,
	WrenchIcon,
	CompassIcon,
	UsersIcon,
	UserIcon,
	HandshakeIcon,
	TargetIcon,
	HeartIcon,
	GearIcon,
	ShieldCheckIcon,
	RocketLaunchIcon,
	SparkleIcon,
	LightbulbIcon,
	FirstAidKitIcon,
	BriefcaseIcon,
	GraduationCapIcon,
	TrendUpIcon,
	CurrencyCircleDollarIcon,
};

// Helper to get icon component from string name
export function getIconFromName(iconName: string | null | undefined): Icon {
	if (!iconName) return CompassIcon;
	const normalizedName = iconName.endsWith("Icon") ? iconName : `${iconName}Icon`;
	return iconNameToComponent[normalizedName] || CompassIcon;
}

// Field icon mapping
export const fieldIcons: Record<string, Icon> = {
	healthcare: FirstAidKitIcon,
	industrial: GearIcon,
	hse: HardHatIcon,
	general: CompassIcon,
};

// Field color mapping
export const fieldColors: Record<string, string> = {
	healthcare: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	industrial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	hse: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	general: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
};

// Maximum score per question option (highest trait score in any option)
const MAX_SCORE_PER_QUESTION = 3;

// Trait weight constants for career matching algorithm
// Weights represent importance of each trait for a given field (must sum to 1.0)
const HEALTHCARE_WEIGHTS = {
	patient_care: 0.4, // Most important: direct patient interaction
	teamwork: 0.3, // Second: healthcare requires team coordination
	safety_focus: 0.2, // Third: patient safety protocols
	leadership: 0.1, // Least: management roles come later
};

const INDUSTRIAL_WEIGHTS = {
	technical_aptitude: 0.4, // Most important: technical skills
	safety_focus: 0.25, // Second: industrial safety
	leadership: 0.2, // Third: team supervision
	teamwork: 0.15, // Fourth: collaborative work
};

const HSE_WEIGHTS = {
	safety_focus: 0.35, // Most important: safety management
	leadership: 0.3, // Second: coordinating safety initiatives
	technical_aptitude: 0.2, // Third: understanding technical risks
	teamwork: 0.15, // Fourth: cross-team collaboration
};

// Threshold percentages for highlighting strengths in career matches
const STRENGTH_THRESHOLD_HIGH = 60; // 60%: considered a strong trait
const STRENGTH_THRESHOLD_MEDIUM = 50; // 50%: considered a notable trait

// Maximum number of reasons to show per career match
const MAX_REASONS_PER_MATCH = 3;

// Helper functions

/**
 * Calculates a personality profile from quiz answers
 * Each answer contributes trait scores (0-3 per trait per question)
 * Final scores are normalized to 0-100 percentage scale
 * @param answers - User's quiz answers
 * @param questions - Quiz questions (from database)
 */
export function calculatePersonalityProfile(answers: QuizAnswer[], questions: QuizQuestion[]): PersonalityProfile {
	const profile: PersonalityProfile = {
		teamwork: 0,
		technical_aptitude: 0,
		patient_care: 0,
		safety_focus: 0,
		leadership: 0,
	};

	for (const answer of answers) {
		const question = questions.find((q) => q.id === answer.questionId);
		if (!question) continue;

		const option = question.options.find((o) => o.id === answer.optionId);
		if (!option) continue;

		for (const [trait, score] of Object.entries(option.scores)) {
			if (trait in profile) {
				profile[trait as keyof PersonalityProfile] += score;
			}
		}
	}

	// Normalize to 0-100 percentage scale
	// maxPossible = number of questions * max score per question (3)
	const maxPossible = questions.length * MAX_SCORE_PER_QUESTION;
	if (maxPossible === 0) return profile;
	for (const key of Object.keys(profile) as (keyof PersonalityProfile)[]) {
		profile[key] = Math.round((profile[key] / maxPossible) * 100);
	}

	return profile;
}

export function calculateCareerMatches(profile: PersonalityProfile, programs: ProgramData[]): CareerMatch[] {
	const matches: CareerMatch[] = [];

	for (const program of programs) {
		if (program.id === "other") continue;

		let score = 0;
		const reasons: string[] = [];

		// Calculate match based on field and traits using weighted scoring
		if (program.field === "healthcare") {
			score += profile.patient_care * HEALTHCARE_WEIGHTS.patient_care;
			score += profile.teamwork * HEALTHCARE_WEIGHTS.teamwork;
			score += profile.safety_focus * HEALTHCARE_WEIGHTS.safety_focus;
			score += profile.leadership * HEALTHCARE_WEIGHTS.leadership;
			if (profile.patient_care > STRENGTH_THRESHOLD_HIGH) reasons.push(t`Strong interest in patient care`);
			if (profile.teamwork > STRENGTH_THRESHOLD_MEDIUM) reasons.push(t`Good team spirit`);
		} else if (program.field === "industrial") {
			score += profile.technical_aptitude * INDUSTRIAL_WEIGHTS.technical_aptitude;
			score += profile.safety_focus * INDUSTRIAL_WEIGHTS.safety_focus;
			score += profile.leadership * INDUSTRIAL_WEIGHTS.leadership;
			score += profile.teamwork * INDUSTRIAL_WEIGHTS.teamwork;
			if (profile.technical_aptitude > STRENGTH_THRESHOLD_HIGH) reasons.push(t`Strong technical aptitude`);
			if (profile.safety_focus > STRENGTH_THRESHOLD_MEDIUM) reasons.push(t`Safety awareness`);
		} else if (program.field === "hse") {
			score += profile.safety_focus * HSE_WEIGHTS.safety_focus;
			score += profile.leadership * HSE_WEIGHTS.leadership;
			score += profile.technical_aptitude * HSE_WEIGHTS.technical_aptitude;
			score += profile.teamwork * HSE_WEIGHTS.teamwork;
			if (profile.safety_focus > STRENGTH_THRESHOLD_HIGH) reasons.push(t`Excellent prevention skills`);
			if (profile.leadership > STRENGTH_THRESHOLD_MEDIUM) reasons.push(t`Leadership capabilities`);
		}

		const FieldIcon = fieldIcons[program.field] || CompassIcon;

		matches.push({
			programId: program.id,
			name: program.name,
			nameFr: program.nameFr,
			matchPercentage: Math.min(100, Math.round(score)), // Cap at 100%
			field: program.field,
			reasons: reasons.slice(0, MAX_REASONS_PER_MATCH),
			icon: FieldIcon,
		});
	}

	return matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

// Helper function to convert PersonalityProfile to ExtendedPersonalityProfile for database
export function toExtendedProfile(profile: PersonalityProfile): ExtendedPersonalityProfile {
	return {
		...profile,
		analytical: Math.round((profile.technical_aptitude + profile.safety_focus) / 2),
		communication: Math.round((profile.teamwork + profile.leadership) / 2),
		stress_tolerance: Math.round((profile.safety_focus + profile.leadership) / 2),
		physical_endurance: Math.round(profile.technical_aptitude * 0.8),
		attention_to_detail: Math.round((profile.safety_focus + profile.technical_aptitude) / 2),
	};
}

// Helper function to convert CareerMatch to storage format (without Icon)
export function toStorageMatch(match: CareerMatch, programs: ProgramData[]): StorageMatch {
	const program = programs.find((p) => p.id === match.programId);
	return {
		programId: match.programId,
		name: match.name,
		nameFr: match.nameFr,
		matchPercentage: match.matchPercentage,
		field: match.field,
		reasons: match.reasons,
		duration: program?.durationFr || "Variable",
		salary: String(program?.avgSalary || "Variable"),
		employmentRate: program?.employmentRate ?? undefined,
	};
}
