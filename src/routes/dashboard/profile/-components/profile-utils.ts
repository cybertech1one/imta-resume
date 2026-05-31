import { t } from "@lingui/core/macro";
import { ACHIEVEMENTS, GOAL_TEMPLATES } from "./profile-config";
import type { AchievementWithStatus, ActivityItem, GoalTemplate, ProfileStats } from "./profile-types";

export function formatDate(date: Date): string {
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};
	return date.toLocaleDateString("fr-FR", options);
}

export function formatRelativeTime(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMins < 60) {
		return t`${diffMins} minutes ago`;
	}
	if (diffHours < 24) {
		return t`${diffHours} hours ago`;
	}
	if (diffDays === 1) {
		return t`Yesterday`;
	}
	if (diffDays < 7) {
		return t`${diffDays} days ago`;
	}
	return date.toLocaleDateString("fr-FR");
}

export function deriveActivities(
	resumes: Array<{ id: string; name: string; updatedAt: string | Date; createdAt: string | Date }> | undefined,
	sessions: Array<{ id: string; status: string; overallScore: number | null; createdAt: string | Date }> | undefined,
): ActivityItem[] {
	const activities: ActivityItem[] = [];

	for (const r of resumes ?? []) {
		activities.push({
			id: `resume-${r.id}`,
			type: "resume_edit",
			title: "Resume updated",
			details: r.name,
			timestamp: new Date(r.updatedAt),
		});
	}

	for (const s of sessions ?? []) {
		if (s.status === "completed") {
			activities.push({
				id: `interview-${s.id}`,
				type: "interview_complete",
				title: "Interview session completed",
				details: s.overallScore ? `Score: ${s.overallScore}/100` : "Completed",
				timestamp: new Date(s.createdAt),
			});
		}
	}

	activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
	return activities.slice(0, 10);
}

export function computeStats(
	resumes: Array<unknown> | undefined,
	interviewSessions: Array<{ status: string; overallScore: number | null }> | undefined,
	trainingStats: { totalInterests?: number; completedCount?: number; inProgressCount?: number } | undefined,
): ProfileStats {
	const resumeCount = resumes?.length ?? 0;
	const completedInterviews = interviewSessions?.filter((s) => s.status === "completed").length ?? 0;
	const totalInterviews = interviewSessions?.length ?? 0;
	const totalTrainings = trainingStats?.totalInterests ?? 0;
	const completedTrainings = trainingStats?.completedCount ?? 0;
	const inProgressTrainings = trainingStats?.inProgressCount ?? 0;

	const completedWithScores = interviewSessions?.filter((s) => s.status === "completed" && s.overallScore) ?? [];
	const averageScore =
		completedWithScores.length > 0
			? Math.round(completedWithScores.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / completedWithScores.length)
			: 0;

	const highestScore =
		completedWithScores.length > 0 ? Math.max(...completedWithScores.map((s) => s.overallScore ?? 0)) : 0;

	const resumeCompletion = Math.min(resumeCount * 50, 100);
	const interviewCompletion = Math.min(completedInterviews * 20, 100);
	const trainingCompletion = Math.min(totalTrainings * 20, 100);
	const careerAssessmentCompletion = 0;

	const overallProgress = Math.round(
		(resumeCompletion + interviewCompletion + trainingCompletion + careerAssessmentCompletion) / 4,
	);

	return {
		resumeCount,
		completedInterviews,
		totalInterviews,
		totalTrainings,
		completedTrainings,
		inProgressTrainings,
		averageScore,
		highestScore,
		resumeCompletion,
		interviewCompletion,
		trainingCompletion,
		careerAssessmentCompletion,
		overallProgress,
	};
}

export function computeAchievementsStatus(stats: ProfileStats): AchievementWithStatus[] {
	return ACHIEVEMENTS.map((achievement) => {
		let progress = 0;
		let isUnlocked = false;

		switch (achievement.id) {
			case "premier-cv":
				progress = stats.resumeCount;
				isUnlocked = stats.resumeCount >= achievement.requiredValue;
				break;
			case "entretien-pratique":
				progress = stats.completedInterviews;
				isUnlocked = stats.completedInterviews >= achievement.requiredValue;
				break;
			case "quiz-complete":
				progress = 0;
				isUnlocked = false;
				break;
			case "dix-sessions":
				progress = stats.completedInterviews;
				isUnlocked = stats.completedInterviews >= achievement.requiredValue;
				break;
			case "score-parfait":
				progress = stats.highestScore;
				isUnlocked = stats.highestScore >= achievement.requiredValue;
				break;
			case "explorateur":
				progress = stats.totalTrainings;
				isUnlocked = stats.totalTrainings >= achievement.requiredValue;
				break;
			case "cv-master":
				progress = stats.resumeCount;
				isUnlocked = stats.resumeCount >= achievement.requiredValue;
				break;
			case "formation-complete":
				progress = stats.completedTrainings;
				isUnlocked = stats.completedTrainings >= achievement.requiredValue;
				break;
		}

		return { ...achievement, progress, isUnlocked };
	});
}

export function computeSuggestedGoals(stats: ProfileStats): GoalTemplate[] {
	const goals: (GoalTemplate | undefined)[] = [];

	if (stats.resumeCount === 0) {
		goals.push(GOAL_TEMPLATES.find((g) => g.id === "create-cv"));
	}
	if (stats.completedInterviews < 5) {
		goals.push(GOAL_TEMPLATES.find((g) => g.id === "practice-interviews"));
	}
	if (stats.averageScore < 80) {
		goals.push(GOAL_TEMPLATES.find((g) => g.id === "achieve-80-score"));
	}
	if (stats.totalTrainings < 3) {
		goals.push(GOAL_TEMPLATES.find((g) => g.id === "explore-programs"));
	}

	return goals.filter((g): g is GoalTemplate => g !== undefined).slice(0, 3);
}
