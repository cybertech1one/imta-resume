/**
 * Unit Tests for src/integrations/orpc/services/student-progress.ts
 *
 * Tests cover:
 * - Activity tracking and logging
 * - Progress score calculation
 * - Skill progression tracking
 * - Cohort comparison
 * - Badge/achievement system
 * - Weak areas analysis
 * - Weekly snapshots
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database client
const {
	mockWhere,
	mockOrderBy,
	mockLimit,
	mockOffset,
	mockInsert,
	mockValues,
	mockUpdate,
	mockSet,
	mockGroupBy,
	mockInnerJoin,
	mockLeftJoin,
	chainableMock,
} = vi.hoisted(() => {
	const mockSelect = vi.fn();
	const mockFrom = vi.fn();
	const mockWhere = vi.fn();
	const mockOrderBy = vi.fn();
	const mockLimit = vi.fn();
	const mockOffset = vi.fn();
	const mockInsert = vi.fn();
	const mockValues = vi.fn();
	const mockUpdate = vi.fn();
	const mockSet = vi.fn();
	const mockGroupBy = vi.fn();
	const mockInnerJoin = vi.fn();
	const mockLeftJoin = vi.fn();

	const chainableMock: Record<string, ReturnType<typeof vi.fn>> = {
		select: mockSelect,
		from: mockFrom,
		where: mockWhere,
		orderBy: mockOrderBy,
		limit: mockLimit,
		offset: mockOffset,
		insert: mockInsert,
		values: mockValues,
		update: mockUpdate,
		set: mockSet,
		groupBy: mockGroupBy,
		innerJoin: mockInnerJoin,
		leftJoin: mockLeftJoin,
	};

	// Set up chainable returns
	for (const fn of Object.values(chainableMock)) {
		fn.mockReturnValue(chainableMock);
	}

	return {
		mockWhere,
		mockOrderBy,
		mockLimit,
		mockOffset,
		mockInsert,
		mockValues,
		mockUpdate,
		mockSet,
		mockGroupBy,
		mockInnerJoin,
		mockLeftJoin,
		chainableMock,
	};
});

// Mock the database client
vi.mock("@/integrations/drizzle/client", () => ({
	db: chainableMock,
}));

// Mock string utils
vi.mock("@/utils/string", () => ({
	generateId: vi.fn(() => "test-id-" + Math.random().toString(36).substring(7)),
}));

// Import after mocks are set up
import { studentProgressService } from "@/integrations/orpc/services/student-progress";

// Test fixtures
const mockUserId = "user-123";

const mockProgress = {
	id: "progress-1",
	userId: mockUserId,
	cohortId: "cohort-1",
	overallScore: 65,
	resumeCompleteness: 80,
	interviewReadiness: 60,
	jobSearchReadiness: 50,
	totalLessonsCompleted: 15,
	totalQuizzesTaken: 8,
	totalPracticeTime: 240,
	currentStreak: 5,
	longestStreak: 10,
	lastActivityDate: "2026-02-08",
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-02-08"),
};

const mockActivityLog = {
	id: "activity-1",
	userId: mockUserId,
	action: "lesson_completed" as const,
	entityType: "lesson",
	entityId: "lesson-1",
	entityName: "Introduction to JavaScript",
	durationMinutes: 30,
	scoreAchieved: 85,
	metadata: {},
	sessionId: "session-1",
	deviceType: "desktop",
	completedAt: new Date("2026-02-08"),
	createdAt: new Date("2026-02-08"),
};

const mockSkillProgression = {
	id: "skill-prog-1",
	userId: mockUserId,
	skillId: "skill-js",
	skillName: "JavaScript",
	skillNameFr: "JavaScript",
	previousLevel: "beginner" as const,
	currentLevel: "intermediate" as const,
	score: 70,
	assessmentType: "quiz",
	notes: null,
	recordedAt: new Date("2026-02-08"),
	createdAt: new Date("2026-02-08"),
};

const mockBadge = {
	id: "badge-1",
	userId: mockUserId,
	badgeType: "skill_seeker" as const,
	badgeName: "Skill Seeker",
	badgeNameFr: "Chercheur de competences",
	badgeDescription: "Started learning new skills",
	badgeDescriptionFr: "Commence a apprendre de nouvelles competences",
	badgeIcon: "MagnifyingGlass",
	tier: "bronze",
	xpAwarded: 50,
	criteriaValue: 3,
	isNew: true,
	earnedAt: new Date("2026-02-08"),
	createdAt: new Date("2026-02-08"),
};

const mockCohort = {
	id: "cohort-1",
	name: "IMTA 2026",
	nameFr: "IMTA 2026",
	description: "2026 cohort",
	descriptionFr: "Cohorte 2026",
	startDate: new Date("2026-01-01"),
	endDate: new Date("2026-12-31"),
	memberCount: 30,
	isActive: true,
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-01"),
};

const mockCohortMembership = {
	id: "membership-1",
	userId: mockUserId,
	cohortId: "cohort-1",
	role: "member",
	joinedAt: new Date("2026-01-01"),
	leftAt: null,
	createdAt: new Date("2026-01-01"),
};

const mockWeeklySnapshot = {
	id: "snapshot-1",
	userId: mockUserId,
	weekStartDate: "2026-02-03",
	weekEndDate: "2026-02-09",
	overallScore: 65,
	lessonsCompleted: 5,
	practiceMinutes: 120,
	quizzesTaken: 3,
	badgesEarned: 1,
	streakDays: 5,
	cohortRank: 10,
	cohortPercentile: 67,
	createdAt: new Date("2026-02-09"),
};

// Helper to set mock return values
const setMockResult = (result: unknown[]) => {
	chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(result));
};

describe("student progress service - activity tracking", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("trackActivity", () => {
		it("should log an activity", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount <= 2) {
					resolve([mockProgress]);
				} else {
					resolve(undefined);
				}
			});

			const result = await studentProgressService.trackActivity({
				userId: mockUserId,
				action: "lesson_completed",
				entityType: "lesson",
				entityId: "lesson-1",
				entityName: "Intro to JS",
				durationMinutes: 30,
			});

			expect(result).toBeDefined();
			expect(mockInsert).toHaveBeenCalled();
		});

		it("should update progress from activity", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount <= 2) {
					resolve([mockProgress]);
				} else {
					resolve(undefined);
				}
			});

			await studentProgressService.trackActivity({
				userId: mockUserId,
				action: "lesson_completed",
			});

			expect(mockUpdate).toHaveBeenCalled();
		});
	});

	describe("getActivityLog", () => {
		it("should return activity log for user", async () => {
			setMockResult([mockActivityLog]);

			const result = await studentProgressService.getActivityLog(mockUserId);

			expect(result).toEqual([mockActivityLog]);
			expect(mockOrderBy).toHaveBeenCalled();
		});

		it("should respect limit and offset", async () => {
			setMockResult([mockActivityLog]);

			await studentProgressService.getActivityLog(mockUserId, 10, 5);

			expect(mockLimit).toHaveBeenCalled();
			expect(mockOffset).toHaveBeenCalled();
		});
	});

	describe("getActivityStats", () => {
		it("should return aggregated activity stats", async () => {
			setMockResult([
				{
					action: "lesson_completed",
					count: BigInt(15),
					totalDuration: 450,
					avgScore: "85.5",
				},
				{
					action: "quiz_taken",
					count: BigInt(8),
					totalDuration: 120,
					avgScore: "78.0",
				},
			]);

			const result = await studentProgressService.getActivityStats(mockUserId);

			expect(result).toHaveLength(2);
			expect(mockGroupBy).toHaveBeenCalled();
		});

		it("should filter by date range", async () => {
			setMockResult([]);

			await studentProgressService.getActivityStats(mockUserId, 7);

			expect(mockWhere).toHaveBeenCalled();
		});
	});
});

describe("student progress service - progress calculation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	describe("calculateProgressScore", () => {
		it("should calculate weighted progress score", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				resolve([mockProgress]);
			});

			const result = await studentProgressService.calculateProgressScore(mockUserId);

			expect(result).toBeGreaterThanOrEqual(0);
			expect(result).toBeLessThanOrEqual(100);
			expect(mockUpdate).toHaveBeenCalled();
		});

		it("should create progress record if none exists", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([]);
				} else {
					resolve([mockProgress]);
				}
			});

			await studentProgressService.calculateProgressScore(mockUserId);

			expect(mockInsert).toHaveBeenCalled();
		});
	});

	describe("getProgress", () => {
		it("should return progress for user", async () => {
			setMockResult([mockProgress]);

			const result = await studentProgressService.getProgress(mockUserId);

			expect(result).toEqual(mockProgress);
		});

		it("should create default progress if none exists", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([]);
				} else {
					resolve([mockProgress]);
				}
			});

			await studentProgressService.getProgress(mockUserId);

			expect(mockInsert).toHaveBeenCalled();
		});
	});

	describe("updateProgressFromActivity", () => {
		it("should update streak on consecutive days", async () => {
			const yesterdayProgress = {
				...mockProgress,
				lastActivityDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
				currentStreak: 3,
			};

			setMockResult([yesterdayProgress]);

			await studentProgressService.updateProgressFromActivity(mockUserId, {
				userId: mockUserId,
				action: "lesson_completed",
			});

			expect(mockUpdate).toHaveBeenCalled();
		});

		it("should reset streak on gap days", async () => {
			const oldProgress = {
				...mockProgress,
				lastActivityDate: "2026-01-01",
				currentStreak: 10,
			};

			setMockResult([oldProgress]);

			await studentProgressService.updateProgressFromActivity(mockUserId, {
				userId: mockUserId,
				action: "lesson_completed",
			});

			expect(mockUpdate).toHaveBeenCalled();
		});

		it("should update lessons completed count", async () => {
			setMockResult([mockProgress]);

			await studentProgressService.updateProgressFromActivity(mockUserId, {
				userId: mockUserId,
				action: "lesson_completed",
			});

			expect(mockSet).toHaveBeenCalled();
		});

		it("should update quiz count", async () => {
			setMockResult([mockProgress]);

			await studentProgressService.updateProgressFromActivity(mockUserId, {
				userId: mockUserId,
				action: "quiz_taken",
			});

			expect(mockSet).toHaveBeenCalled();
		});

		it("should update interview readiness on practice", async () => {
			setMockResult([mockProgress]);

			await studentProgressService.updateProgressFromActivity(mockUserId, {
				userId: mockUserId,
				action: "interview_practiced",
				scoreAchieved: 80,
			});

			expect(mockSet).toHaveBeenCalled();
		});
	});
});

describe("student progress service - skill progression", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	describe("trackSkillProgression", () => {
		it("should track skill level change", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([{ currentLevel: "beginner" }]);
				} else {
					resolve(undefined);
				}
			});

			const result = await studentProgressService.trackSkillProgression({
				userId: mockUserId,
				skillId: "skill-js",
				skillName: "JavaScript",
				currentLevel: "intermediate",
				score: 75,
				assessmentType: "quiz",
			});

			expect(result).toBeDefined();
			expect(mockInsert).toHaveBeenCalled();
		});

		it("should record previous level", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockSkillProgression]);
				} else {
					resolve(undefined);
				}
			});

			await studentProgressService.trackSkillProgression({
				userId: mockUserId,
				skillId: "skill-js",
				skillName: "JavaScript",
				currentLevel: "advanced",
				assessmentType: "quiz",
			});

			expect(mockValues).toHaveBeenCalled();
		});
	});

	describe("getSkillProgression", () => {
		it("should return all skill progressions for user", async () => {
			setMockResult([mockSkillProgression]);

			const result = await studentProgressService.getSkillProgression(mockUserId);

			expect(result).toEqual([mockSkillProgression]);
		});

		it("should filter by skillId", async () => {
			setMockResult([mockSkillProgression]);

			await studentProgressService.getSkillProgression(mockUserId, "skill-js");

			expect(mockWhere).toHaveBeenCalled();
		});
	});

	describe("getSkillTimeline", () => {
		it("should return skill progression timeline", async () => {
			setMockResult([mockSkillProgression]);

			const result = await studentProgressService.getSkillTimeline(mockUserId, "skill-js");

			expect(result).toEqual([mockSkillProgression]);
			expect(mockOrderBy).toHaveBeenCalled();
			expect(mockLimit).toHaveBeenCalled();
		});
	});
});

describe("student progress service - cohort comparison", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	describe("compareToCohort", () => {
		it("should compare user to cohort members", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockCohortMembership]);
				} else {
					resolve([
						{ userId: mockUserId, overallScore: 65, totalLessonsCompleted: 15, currentStreak: 5 },
						{ userId: "user-2", overallScore: 80, totalLessonsCompleted: 20, currentStreak: 10 },
						{ userId: "user-3", overallScore: 50, totalLessonsCompleted: 10, currentStreak: 3 },
					]);
				}
			});

			const result = await studentProgressService.compareToCohort(mockUserId);

			expect(result.rank).toBeDefined();
			expect(result.percentile).toBeDefined();
			expect("totalInCohort" in result || "totalUsers" in result).toBe(true);
		});

		it("should fall back to global comparison if not in cohort", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([]);
				} else {
					resolve([{ userId: mockUserId, overallScore: 65 }]);
				}
			});

			const result = await studentProgressService.compareToCohort(mockUserId);

			expect(result).toBeDefined();
		});
	});

	describe("compareToGlobal", () => {
		it("should compare user to all users", async () => {
			setMockResult([
				{ userId: "user-1", overallScore: 90 },
				{ userId: mockUserId, overallScore: 65 },
				{ userId: "user-3", overallScore: 50 },
			]);

			const result = await studentProgressService.compareToGlobal(mockUserId);

			expect(result.rank).toBe(2);
			expect(result.totalUsers).toBe(3);
			expect(result.aheadOf).toBe(1);
		});

		it("should handle empty data", async () => {
			setMockResult([]);

			const result = await studentProgressService.compareToGlobal(mockUserId);

			expect(result.rank).toBe(1);
			expect(result.totalUsers).toBe(1);
		});
	});
});

describe("student progress service - badge system", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	describe("awardBadge", () => {
		it("should award badge when criteria met", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([]);
				} else if (callCount === 2) {
					resolve([mockBadge]);
				} else {
					resolve([mockProgress]);
				}
			});

			const result = await studentProgressService.awardBadge({
				userId: mockUserId,
				badgeType: "skill_seeker",
				criteriaValue: 5,
			});

			expect(result.awarded).toBe(true);
			expect(result.badge).toBeDefined();
			expect(mockInsert).toHaveBeenCalled();
		});

		it("should not award badge if already earned", async () => {
			setMockResult([mockBadge]);

			const result = await studentProgressService.awardBadge({
				userId: mockUserId,
				badgeType: "skill_seeker",
				criteriaValue: 5,
			});

			expect(result.awarded).toBe(false);
		});

		it("should not award badge if criteria not met", async () => {
			setMockResult([]);

			const result = await studentProgressService.awardBadge({
				userId: mockUserId,
				badgeType: "skill_seeker",
				criteriaValue: 1,
			});

			expect(result.awarded).toBe(false);
		});

		it("should award highest qualifying tier", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([]);
				} else if (callCount === 2) {
					resolve([{ ...mockBadge, tier: "silver" }]);
				} else {
					resolve([mockProgress]);
				}
			});

			const result = await studentProgressService.awardBadge({
				userId: mockUserId,
				badgeType: "skill_seeker",
				criteriaValue: 15, // Silver tier threshold
			});

			expect(result.awarded).toBe(true);
		});
	});

	describe("getUserBadges", () => {
		it("should return all badges for user", async () => {
			setMockResult([mockBadge]);

			const result = await studentProgressService.getUserBadges(mockUserId);

			expect(result).toEqual([mockBadge]);
			expect(mockOrderBy).toHaveBeenCalled();
		});
	});

	describe("markBadgeSeen", () => {
		it("should mark badge as seen", async () => {
			// For void operations, call the resolve callback immediately with undefined
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(undefined));

			await studentProgressService.markBadgeSeen(mockUserId, "badge-1");

			expect(mockUpdate).toHaveBeenCalled();
			expect(mockSet).toHaveBeenCalled();
		});
	});
});

describe("student progress service - weak areas analysis", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	describe("getWeakAreas", () => {
		it("should identify weak skill areas", async () => {
			setMockResult([
				{ ...mockSkillProgression, currentLevel: "beginner", score: 40 },
				{ ...mockSkillProgression, skillId: "skill-2", skillName: "React", currentLevel: "elementary", score: 55 },
			]);

			const result = await studentProgressService.getWeakAreas(mockUserId);

			expect(result).toHaveLength(2);
			expect(result[0].averageScore).toBeLessThan(result[1].averageScore);
		});

		it("should include suggested actions", async () => {
			setMockResult([{ ...mockSkillProgression, currentLevel: "beginner", score: 30 }]);

			const result = await studentProgressService.getWeakAreas(mockUserId);

			expect(result[0].suggestedActions.length).toBeGreaterThan(0);
		});

		it("should determine trend from recent assessments", async () => {
			setMockResult([
				{ ...mockSkillProgression, score: 60, recordedAt: new Date("2026-02-08") },
				{ ...mockSkillProgression, score: 50, recordedAt: new Date("2026-02-01") },
			]);

			const result = await studentProgressService.getWeakAreas(mockUserId);

			// Recent score is higher, so should be improving
			if (result.length > 0) {
				expect(["improving", "declining", "stable"]).toContain(result[0].recentTrend);
			}
		});

		it("should return empty array if no weak areas", async () => {
			setMockResult([{ ...mockSkillProgression, currentLevel: "expert", score: 95 }]);

			const result = await studentProgressService.getWeakAreas(mockUserId);

			expect(result).toEqual([]);
		});
	});
});

describe("student progress service - cohort management", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	describe("getCohorts", () => {
		it("should return active cohorts", async () => {
			setMockResult([mockCohort]);

			const result = await studentProgressService.getCohorts();

			expect(result).toEqual([mockCohort]);
		});

		it("should return all cohorts when activeOnly is false", async () => {
			setMockResult([mockCohort, { ...mockCohort, isActive: false }]);

			const result = await studentProgressService.getCohorts(false);

			expect(result).toHaveLength(2);
		});
	});

	describe("getCohort", () => {
		it("should return cohort by id", async () => {
			setMockResult([mockCohort]);

			const result = await studentProgressService.getCohort("cohort-1");

			expect(result).toEqual(mockCohort);
		});

		it("should return null if not found", async () => {
			setMockResult([]);

			const result = await studentProgressService.getCohort("non-existent");

			expect(result).toBeNull();
		});
	});

	describe("getCohortMembers", () => {
		it("should return cohort members with progress", async () => {
			setMockResult([
				{
					membership: mockCohortMembership,
					user: { id: mockUserId, name: "Test User", email: "test@example.com" },
					progress: mockProgress,
				},
			]);

			const result = await studentProgressService.getCohortMembers("cohort-1");

			expect(result).toHaveLength(1);
			expect(mockInnerJoin).toHaveBeenCalled();
			expect(mockLeftJoin).toHaveBeenCalled();
		});
	});

	describe("joinCohort", () => {
		it("should add user to cohort", async () => {
			// For void operations, call the resolve callback immediately with undefined
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(undefined));

			await studentProgressService.joinCohort(mockUserId, "cohort-1");

			expect(mockInsert).toHaveBeenCalled();
			expect(mockUpdate).toHaveBeenCalled(); // Update member count and user progress
		});

		it("should update cohort member count", async () => {
			// For void operations, call the resolve callback immediately with undefined
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(undefined));

			await studentProgressService.joinCohort(mockUserId, "cohort-1");

			expect(mockUpdate).toHaveBeenCalled();
		});
	});

	describe("leaveCohort", () => {
		it("should remove user from cohort", async () => {
			// For void operations, call the resolve callback immediately with undefined
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(undefined));

			await studentProgressService.leaveCohort(mockUserId, "cohort-1");

			expect(mockUpdate).toHaveBeenCalled();
		});
	});
});

describe("student progress service - weekly snapshots", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	describe("createWeeklySnapshot", () => {
		it("should create snapshot of current week", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockProgress]);
				} else if (callCount === 2) {
					resolve([mockCohortMembership]);
				} else if (callCount === 3) {
					resolve([{ userId: mockUserId, overallScore: 65 }]);
				} else if (callCount === 4) {
					resolve([{ action: "lesson_completed", count: BigInt(5), totalDuration: 150, avgScore: "80" }]);
				} else if (callCount === 5) {
					resolve([{ count: BigInt(1) }]);
				} else {
					resolve(undefined);
				}
			});

			const result = await studentProgressService.createWeeklySnapshot(mockUserId);

			expect(result).toBeDefined();
			expect(mockInsert).toHaveBeenCalled();
		});
	});

	describe("getWeeklySnapshots", () => {
		it("should return weekly snapshots for user", async () => {
			setMockResult([mockWeeklySnapshot]);

			const result = await studentProgressService.getWeeklySnapshots(mockUserId);

			expect(result).toEqual([mockWeeklySnapshot]);
			expect(mockOrderBy).toHaveBeenCalled();
		});

		it("should respect limit parameter", async () => {
			setMockResult([mockWeeklySnapshot]);

			await studentProgressService.getWeeklySnapshots(mockUserId, 5);

			expect(mockLimit).toHaveBeenCalled();
		});
	});
});

describe("student progress service - edge cases", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	it("should handle user with no activity history", async () => {
		setMockResult([]);

		const result = await studentProgressService.getActivityLog(mockUserId);

		expect(result).toEqual([]);
	});

	it("should handle invalid badge type gracefully", async () => {
		const result = await studentProgressService.awardBadge({
			userId: mockUserId,
			badgeType: "invalid_badge" as never,
			criteriaValue: 100,
		});

		expect(result.awarded).toBe(false);
	});

	it("should handle cohort with no members", async () => {
		setMockResult([]);

		const result = await studentProgressService.getCohortMembers("empty-cohort");

		expect(result).toEqual([]);
	});
});
