import { t } from "@lingui/core/macro";
import { BriefcaseIcon, ClipboardTextIcon, GlobeIcon, GraduationCapIcon, UsersIcon } from "@phosphor-icons/react";

import { fieldIcons } from "./assessment-config";
import type {
	CareerMatch,
	NextStep,
	PersonalityProfile,
	ProgramData,
	QuizAnswer,
	QuizQuestion,
	TrainingRecommendation,
} from "./assessment-types";

// ============================================================================
// Helper Functions
// ============================================================================

export function calculatePersonalityProfile(answers: QuizAnswer[], questions: QuizQuestion[]): PersonalityProfile {
	const profile: PersonalityProfile = {
		patient_care: 0,
		technical_aptitude: 0,
		safety_focus: 0,
		leadership: 0,
		teamwork: 0,
		analytical: 0,
		communication: 0,
		stress_tolerance: 0,
		physical_endurance: 0,
		attention_to_detail: 0,
	};

	// Maximum possible score per trait = total questions * 3 (max score per question)
	const maxPossiblePerTrait = questions.length * 3;

	for (const answer of answers) {
		const question = questions.find((q) => q.id === answer.questionId);
		if (!question) continue;

		if (question.type === "multiple_choice" && answer.optionId) {
			const option = question.options?.find((o) => o.id === answer.optionId);
			if (option) {
				for (const [trait, score] of Object.entries(option.scores)) {
					if (trait in profile) {
						profile[trait as keyof PersonalityProfile] += score;
					}
				}
			}
		} else if (question.type === "scale" && answer.scaleValue !== undefined) {
			// Scale questions: value 0-100, normalize to 0-3 for scoring
			const normalizedScore = (answer.scaleValue / 100) * 3;
			const trait = question.trait;
			if (trait in profile) {
				profile[trait as keyof PersonalityProfile] += normalizedScore;
			}
			// Also add to related traits based on question category
			if (question.category === "personality") {
				profile.stress_tolerance += normalizedScore * 0.3;
			} else if (question.category === "skills") {
				profile.attention_to_detail += normalizedScore * 0.3;
			}
		}
	}

	// Normalize to 0-100 percentage scale
	for (const key of Object.keys(profile) as (keyof PersonalityProfile)[]) {
		profile[key] = Math.round(Math.min(100, (profile[key] / maxPossiblePerTrait) * 100));
	}

	return profile;
}

export function calculateCareerMatches(profile: PersonalityProfile, programsList: ProgramData[]): CareerMatch[] {
	const matches: CareerMatch[] = [];

	// Weight matrices for different fields
	const fieldWeights: Record<string, Record<keyof PersonalityProfile, number>> = {
		healthcare: {
			patient_care: 0.25,
			communication: 0.15,
			teamwork: 0.15,
			stress_tolerance: 0.15,
			attention_to_detail: 0.1,
			leadership: 0.05,
			analytical: 0.05,
			technical_aptitude: 0.05,
			safety_focus: 0.03,
			physical_endurance: 0.02,
		},
		industrial: {
			technical_aptitude: 0.25,
			physical_endurance: 0.15,
			attention_to_detail: 0.15,
			safety_focus: 0.15,
			analytical: 0.1,
			teamwork: 0.08,
			stress_tolerance: 0.05,
			leadership: 0.03,
			communication: 0.02,
			patient_care: 0.02,
		},
		hse: {
			safety_focus: 0.25,
			leadership: 0.15,
			communication: 0.15,
			analytical: 0.15,
			attention_to_detail: 0.1,
			technical_aptitude: 0.08,
			teamwork: 0.05,
			stress_tolerance: 0.03,
			patient_care: 0.02,
			physical_endurance: 0.02,
		},
	};

	// Reason thresholds
	const HIGH_THRESHOLD = 65;
	const MEDIUM_THRESHOLD = 50;

	for (const program of programsList) {
		if (program.id === "other") continue;

		const weights = fieldWeights[program.field] || fieldWeights.industrial;
		let score = 0;
		const reasons: string[] = [];

		// Calculate weighted score
		for (const [trait, weight] of Object.entries(weights)) {
			const traitValue = profile[trait as keyof PersonalityProfile] || 0;
			score += traitValue * weight;
		}

		// Generate reasons based on high traits
		if (program.field === "healthcare") {
			if (profile.patient_care > HIGH_THRESHOLD) {
				reasons.push(t`Strong interest in patient care`);
			}
			if (profile.communication > MEDIUM_THRESHOLD) {
				reasons.push(t`Excellent communication skills`);
			}
			if (profile.teamwork > MEDIUM_THRESHOLD) {
				reasons.push(t`Good team spirit`);
			}
			if (profile.stress_tolerance > MEDIUM_THRESHOLD) {
				reasons.push(t`Good stress management`);
			}
		} else if (program.field === "industrial") {
			if (profile.technical_aptitude > HIGH_THRESHOLD) {
				reasons.push(t`Strong technical aptitude`);
			}
			if (profile.physical_endurance > MEDIUM_THRESHOLD) {
				reasons.push(t`Good physical endurance`);
			}
			if (profile.attention_to_detail > MEDIUM_THRESHOLD) {
				reasons.push(t`Attention to detail`);
			}
			if (profile.safety_focus > MEDIUM_THRESHOLD) {
				reasons.push(t`Safety awareness`);
			}
		} else if (program.field === "hse") {
			if (profile.safety_focus > HIGH_THRESHOLD) {
				reasons.push(t`Excellent prevention awareness`);
			}
			if (profile.leadership > MEDIUM_THRESHOLD) {
				reasons.push(t`Leadership abilities`);
			}
			if (profile.communication > MEDIUM_THRESHOLD) {
				reasons.push(t`Awareness skills`);
			}
			if (profile.analytical > MEDIUM_THRESHOLD) {
				reasons.push(t`Analytical mindset`);
			}
		}

		const CompassIcon = fieldIcons.general;
		const FieldIcon = fieldIcons[program.field] || CompassIcon;

		matches.push({
			programId: program.id,
			name: program.name,
			nameFr: program.nameFr,
			matchPercentage: Math.min(100, Math.round(score)),
			field: program.field,
			reasons: reasons.slice(0, 4),
			icon: FieldIcon,
			duration: program.durationFr ?? "",
			salary: String(program.avgSalary ?? t`Variable`),
			employmentRate: program.employmentRate ?? undefined,
		});
	}

	return matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

export function getTrainingRecommendations(
	matches: CareerMatch[],
	_profile: PersonalityProfile,
	programsList: ProgramData[],
): TrainingRecommendation[] {
	const topMatches = matches.slice(0, 5);
	return topMatches.map((match) => {
		const program = programsList.find((p) => p.id === match.programId);
		return {
			programId: match.programId,
			name: match.name,
			nameFr: match.nameFr,
			description: program?.descriptionFr || "",
			duration: program?.durationFr || "",
			requirements: program?.requirementsFr || "",
			skills: program?.skills || [],
			matchScore: match.matchPercentage,
		};
	});
}

export function getNextSteps(topMatch: CareerMatch, _profile: PersonalityProfile): NextStep[] {
	const steps: NextStep[] = [
		{
			id: "step1",
			title: t`Explore the recommended program`,
			description: t`Discover the ${topMatch.name || topMatch.nameFr} program and its career opportunities in detail.`,
			icon: GraduationCapIcon,
			link: `/dashboard/resources/programs/${topMatch.programId}`,
			priority: "high",
		},
		{
			id: "step2",
			title: t`Prepare your resume`,
			description: t`Create a resume tailored to your target industry with our smart builder.`,
			icon: ClipboardTextIcon,
			link: "/dashboard/resumes",
			priority: "high",
		},
		{
			id: "step3",
			title: t`Practice interviews`,
			description: t`Practice interview questions specific to your field.`,
			icon: UsersIcon,
			link: "/dashboard/interview",
			priority: "medium",
		},
		{
			id: "step4",
			title: t`Browse job listings`,
			description: t`Explore available opportunities in your industry.`,
			icon: BriefcaseIcon,
			link: "/dashboard/jobs",
			priority: "medium",
		},
		{
			id: "step5",
			title: t`Contact IMTA`,
			description: t`Get in touch with the admissions team for more information.`,
			icon: GlobeIcon,
			priority: "low",
		},
	];

	return steps;
}
