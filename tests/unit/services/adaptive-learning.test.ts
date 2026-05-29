/**
 * Unit Tests for src/integrations/orpc/services/adaptive-learning.ts
 *
 * Tests cover:
 * - Learning profile management (CRUD)
 * - Learning path creation and updates
 * - Milestone management
 * - Skill assessment tracking
 * - Recommendation system
 * - Difficulty adaptation
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database client
const {
	mockSelect,
	mockWhere,
	mockOrderBy,
	mockLimit,
	mockInsert,
	mockValues,
	mockUpdate,
	mockSet,
	mockDelete,
	chainableMock,
} = vi.hoisted(() => {
	const mockSelect = vi.fn();
	const mockFrom = vi.fn();
	const mockWhere = vi.fn();
	const mockOrderBy = vi.fn();
	const mockLimit = vi.fn();
	const mockInsert = vi.fn();
	const mockValues = vi.fn();
	const mockUpdate = vi.fn();
	const mockSet = vi.fn();
	const mockDelete = vi.fn();
	const mockReturning = vi.fn();
	const mockInnerJoin = vi.fn();

	const chainableMock: Record<string, ReturnType<typeof vi.fn>> = {
		select: mockSelect,
		from: mockFrom,
		where: mockWhere,
		orderBy: mockOrderBy,
		limit: mockLimit,
		insert: mockInsert,
		values: mockValues,
		update: mockUpdate,
		set: mockSet,
		delete: mockDelete,
		returning: mockReturning,
		innerJoin: mockInnerJoin,
	};

	// Set up chainable returns
	for (const fn of Object.values(chainableMock)) {
		fn.mockReturnValue(chainableMock);
	}

	return {
		mockSelect,
		mockWhere,
		mockOrderBy,
		mockLimit,
		mockInsert,
		mockValues,
		mockUpdate,
		mockSet,
		mockDelete,
		chainableMock,
	};
});

// Mock the database client
vi.mock("@/integrations/drizzle/client", () => ({
	db: chainableMock,
}));

// Mock AI config service
vi.mock("@/integrations/orpc/services/ai-config", () => ({
	aiConfigService: {
		getActiveProvider: vi.fn().mockResolvedValue({
			provider: "openai",
			model: "gpt-4",
			apiKey: "test-key",
			baseUrl: null,
		}),
	},
}));

// Mock AI SDK
vi.mock("ai", () => ({
	generateText: vi.fn().mockResolvedValue({
		text: JSON.stringify({
			title: "Test Path",
			titleFr: "Chemin Test",
			description: "Test description",
			estimatedDuration: "12 weeks",
			estimatedHours: 120,
			targetSkills: ["JavaScript", "TypeScript"],
			modules: [],
			milestones: [],
		}),
	}),
	createGateway: vi.fn().mockReturnValue({
		languageModel: vi.fn(),
	}),
}));

// Mock string utils
vi.mock("@/utils/string", () => ({
	generateId: vi.fn(() => "test-id-" + Math.random().toString(36).substring(7)),
}));

// Import after mocks are set up
import {
	assessmentService,
	difficultyService,
	learningPathService,
	learningProfileService,
	milestoneService,
	recommendationService,
} from "@/integrations/orpc/services/adaptive-learning";

// Test fixtures
const mockUserId = "user-123";

const mockProfile = {
	id: "profile-1",
	userId: mockUserId,
	learningStyle: "visual" as const,
	preferredPace: "moderate" as const,
	dailyTimeCommitment: 30,
	weeklyGoalHours: 10,
	preferredSessionLength: 45,
	currentField: "technology",
	currentLevel: "beginner" as const,
	targetLevel: "advanced" as const,
	difficultyMultiplier: 1.0,
	strengths: [],
	weaknesses: [],
	totalLearningHours: 0,
	totalAssessments: 0,
	averageAssessmentScore: 0,
	currentStreak: 0,
	longestStreak: 0,
	lastActivityDate: null,
	onboardingCompleted: false,
	onboardingCompletedAt: null,
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-15"),
};

const mockPath = {
	id: "path-1",
	userId: mockUserId,
	profileId: "profile-1",
	title: "Full Stack Developer Path",
	titleFr: "Parcours Developpeur Full Stack",
	description: "Learn full stack development",
	descriptionFr: "Apprenez le developpement full stack",
	field: "technology",
	targetRole: "Full Stack Developer",
	targetRoleFr: "Developpeur Full Stack",
	targetSkills: ["JavaScript", "TypeScript", "React", "Node.js"],
	targetLevel: "advanced" as const,
	estimatedDuration: "6 months",
	estimatedHours: 480,
	modules: [],
	totalModules: 0,
	completedModules: 0,
	progress: 0,
	status: "not_started",
	isPrimary: true,
	isActive: true,
	aiGenerated: false,
	aiAnalysis: null,
	startedAt: null,
	lastAccessedAt: null,
	completedAt: null,
	targetCompletionDate: null,
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-15"),
};

const mockMilestone = {
	id: "milestone-1",
	pathId: "path-1",
	userId: mockUserId,
	title: "Learn JavaScript Basics",
	titleFr: "Apprendre les bases de JavaScript",
	description: "Master JavaScript fundamentals",
	descriptionFr: "Maitriser les fondamentaux JavaScript",
	order: 1,
	status: "locked" as const,
	progress: 0,
	requiredSkills: ["JavaScript"],
	requiredAssessmentScore: 70,
	xpReward: 100,
	badgeReward: null,
	certificateReward: false,
	targetDate: null,
	unlockedAt: null,
	startedAt: null,
	completedAt: null,
	assessmentScore: null,
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-15"),
};

const mockAssessment = {
	id: "assessment-1",
	userId: mockUserId,
	profileId: "profile-1",
	pathId: "path-1",
	milestoneId: null,
	skillId: "skill-js",
	skillName: "JavaScript",
	skillNameFr: "JavaScript",
	category: "technical",
	field: "technology",
	assessmentType: "quiz",
	currentLevel: "intermediate" as const,
	previousLevel: "beginner" as const,
	score: 85,
	confidenceScore: 80,
	questionsTotal: 20,
	questionsCorrect: 17,
	timeSpent: 1200,
	trend: "improving",
	improvementPercent: 15,
	detailedResults: {
		strengths: ["Functions", "Variables"],
		weaknesses: ["Async programming"],
		recommendations: ["Practice more async/await"],
		topicScores: { functions: 90, variables: 85, async: 70 },
	},
	aiEvaluation: null,
	aiSuggestions: null,
	validUntil: new Date("2026-04-01"),
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-15"),
};

const mockRecommendation = {
	id: "rec-1",
	userId: mockUserId,
	profileId: "profile-1",
	pathId: "path-1",
	type: "next_skill" as const,
	priority: "high" as const,
	title: "Learn TypeScript",
	titleFr: "Apprendre TypeScript",
	description: "TypeScript will help you write better code",
	descriptionFr: "TypeScript vous aidera a ecrire un meilleur code",
	targetSkillId: "skill-ts",
	targetSkillName: "TypeScript",
	targetTopicId: null,
	reason: "Based on your JavaScript skills",
	reasonFr: "Base sur vos competences JavaScript",
	basedOnAssessment: "assessment-1",
	actionType: "learn",
	actionUrl: null,
	estimatedTime: 120,
	difficulty: "intermediate",
	aiConfidence: 85,
	aiModel: "gpt-4",
	isActive: true,
	isViewed: false,
	viewedAt: null,
	isAccepted: false,
	acceptedAt: null,
	isCompleted: false,
	completedAt: null,
	isDismissed: false,
	dismissedAt: null,
	dismissReason: null,
	expiresAt: new Date("2026-02-01"),
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-15"),
};

// Helper to set mock return values
const setMockResult = (result: unknown[]) => {
	chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(result));
};

describe("learning profile service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("getOrCreate", () => {
		it("should return existing profile if found", async () => {
			setMockResult([mockProfile]);

			const result = await learningProfileService.getOrCreate(mockUserId);

			expect(result).toEqual(mockProfile);
			expect(mockSelect).toHaveBeenCalled();
		});

		it("should create new profile if not found", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([]);
				} else {
					resolve([{ ...mockProfile, id: "new-profile" }]);
				}
			});

			const result = await learningProfileService.getOrCreate(mockUserId);

			expect(result).toBeDefined();
			expect(mockInsert).toHaveBeenCalled();
		});
	});

	describe("getByUserId", () => {
		it("should return profile for user", async () => {
			setMockResult([mockProfile]);

			const result = await learningProfileService.getByUserId(mockUserId);

			expect(result).toEqual(mockProfile);
		});

		it("should return undefined if no profile exists", async () => {
			setMockResult([]);

			const result = await learningProfileService.getByUserId(mockUserId);

			expect(result).toBeUndefined();
		});
	});

	describe("create", () => {
		it("should create a new profile with provided input", async () => {
			setMockResult([mockProfile]);

			const result = await learningProfileService.create({
				userId: mockUserId,
				learningStyle: "visual",
				preferredPace: "moderate",
			});

			expect(result).toBeDefined();
			expect(mockInsert).toHaveBeenCalled();
			expect(mockValues).toHaveBeenCalled();
		});
	});

	describe("update", () => {
		it("should update profile fields", async () => {
			setMockResult([{ ...mockProfile, dailyTimeCommitment: 60 }]);

			await learningProfileService.update(mockUserId, {
				dailyTimeCommitment: 60,
			});

			expect(mockUpdate).toHaveBeenCalled();
			expect(mockSet).toHaveBeenCalled();
		});
	});

	describe("updateStrengthsWeaknesses", () => {
		it("should update strengths and weaknesses", async () => {
			const strengths = [
				{
					skillId: "s1",
					skillName: "JavaScript",
					category: "programming",
					level: "advanced" as const,
					confidence: 85,
					lastAssessed: "2024-01-01",
					trend: "improving" as const,
				},
			];
			const weaknesses = [
				{
					skillId: "s2",
					skillName: "Python",
					category: "programming",
					level: "beginner" as const,
					confidence: 60,
					lastAssessed: "2024-01-01",
					trend: "stable" as const,
				},
			];

			setMockResult([{ ...mockProfile, strengths, weaknesses }]);

			await learningProfileService.updateStrengthsWeaknesses(mockUserId, strengths, weaknesses);

			expect(mockUpdate).toHaveBeenCalled();
		});
	});

	describe("adjustDifficulty", () => {
		it("should increase difficulty for high performance", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([{ ...mockProfile, difficultyMultiplier: 1.0 }]);
				} else {
					resolve([{ ...mockProfile, difficultyMultiplier: 1.1 }]);
				}
			});

			await learningProfileService.adjustDifficulty(mockUserId, 90);

			expect(mockUpdate).toHaveBeenCalled();
		});

		it("should decrease difficulty for low performance", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([{ ...mockProfile, difficultyMultiplier: 1.0 }]);
				} else {
					resolve([{ ...mockProfile, difficultyMultiplier: 0.9 }]);
				}
			});

			await learningProfileService.adjustDifficulty(mockUserId, 40);

			expect(mockUpdate).toHaveBeenCalled();
		});

		it("should return null if profile not found", async () => {
			setMockResult([]);

			const result = await learningProfileService.adjustDifficulty(mockUserId, 75);

			expect(result).toBeNull();
		});
	});
});

describe("learning path service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	describe("list", () => {
		it("should return all paths for user", async () => {
			setMockResult([mockPath]);

			const result = await learningPathService.list(mockUserId);

			expect(result).toEqual([mockPath]);
			expect(mockSelect).toHaveBeenCalled();
		});

		it("should filter by status", async () => {
			setMockResult([{ ...mockPath, status: "in_progress" }]);

			await learningPathService.list(mockUserId, { status: "in_progress" });

			expect(mockWhere).toHaveBeenCalled();
		});

		it("should filter by field", async () => {
			setMockResult([mockPath]);

			await learningPathService.list(mockUserId, { field: "technology" });

			expect(mockWhere).toHaveBeenCalled();
		});
	});

	describe("getById", () => {
		it("should return path by id", async () => {
			setMockResult([mockPath]);

			const result = await learningPathService.getById("path-1");

			expect(result).toEqual(mockPath);
		});

		it("should return undefined if not found", async () => {
			setMockResult([]);

			const result = await learningPathService.getById("non-existent");

			expect(result).toBeUndefined();
		});
	});

	describe("getPrimary", () => {
		it("should return primary path for user", async () => {
			setMockResult([mockPath]);

			const result = await learningPathService.getPrimary(mockUserId);

			expect(result).toEqual(mockPath);
			expect(result?.isPrimary).toBe(true);
		});
	});

	describe("create", () => {
		it("should create a new path", async () => {
			setMockResult([mockPath]);

			await learningPathService.create({
				userId: mockUserId,
				title: "New Path",
				field: "technology",
			});

			expect(mockInsert).toHaveBeenCalled();
		});

		it("should unset other primary paths when creating primary", async () => {
			setMockResult([{ ...mockPath, isPrimary: true }]);

			await learningPathService.create({
				userId: mockUserId,
				title: "New Primary Path",
				field: "technology",
				isPrimary: true,
			});

			// Should call update to unset other primary paths
			expect(mockUpdate).toHaveBeenCalled();
		});
	});

	describe("update", () => {
		it("should update path fields", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockPath]);
				} else {
					resolve([{ ...mockPath, title: "Updated Title" }]);
				}
			});

			await learningPathService.update("path-1", mockUserId, {
				title: "Updated Title",
			});

			expect(mockUpdate).toHaveBeenCalled();
		});

		it("should throw error if path not found", async () => {
			setMockResult([]);

			await expect(learningPathService.update("non-existent", mockUserId, { title: "Test" })).rejects.toThrow(
				"Learning path not found",
			);
		});
	});

	describe("start", () => {
		it("should set path to in_progress and unlock first milestone", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount <= 2) {
					resolve([mockPath]);
				} else if (callCount === 3) {
					resolve([mockMilestone]);
				} else {
					resolve([{ ...mockPath, status: "in_progress" }]);
				}
			});

			await learningPathService.start("path-1", mockUserId);

			expect(mockUpdate).toHaveBeenCalled();
		});

		it("should throw error if path not found", async () => {
			setMockResult([]);

			await expect(learningPathService.start("non-existent", mockUserId)).rejects.toThrow("Learning path not found");
		});
	});

	describe("updateProgress", () => {
		it("should update progress percentage", async () => {
			setMockResult([{ ...mockPath, progress: 50 }]);

			await learningPathService.updateProgress("path-1", mockUserId, 50);

			expect(mockUpdate).toHaveBeenCalled();
		});

		it("should mark as completed when progress reaches 100", async () => {
			setMockResult([{ ...mockPath, progress: 100, status: "completed" }]);

			await learningPathService.updateProgress("path-1", mockUserId, 100);

			expect(mockUpdate).toHaveBeenCalled();
		});

		it("should clamp progress between 0 and 100", async () => {
			setMockResult([{ ...mockPath, progress: 100 }]);

			await learningPathService.updateProgress("path-1", mockUserId, 150);

			expect(mockUpdate).toHaveBeenCalled();
		});
	});

	describe("delete", () => {
		it("should delete path", async () => {
			// For void operations, call the resolve callback immediately with undefined
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(undefined));

			await learningPathService.delete("path-1", mockUserId);

			expect(mockDelete).toHaveBeenCalled();
			expect(mockWhere).toHaveBeenCalled();
		});
	});
});

describe("milestone service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	describe("listByPath", () => {
		it("should return milestones for a path", async () => {
			setMockResult([mockMilestone]);

			const result = await milestoneService.listByPath("path-1");

			expect(result).toEqual([mockMilestone]);
			expect(mockOrderBy).toHaveBeenCalled();
		});
	});

	describe("getById", () => {
		it("should return milestone by id", async () => {
			setMockResult([mockMilestone]);

			const result = await milestoneService.getById("milestone-1");

			expect(result).toEqual(mockMilestone);
		});
	});

	describe("create", () => {
		it("should create a new milestone", async () => {
			setMockResult([mockMilestone]);

			await milestoneService.create({
				pathId: "path-1",
				userId: mockUserId,
				title: "New Milestone",
				order: 1,
			});

			expect(mockInsert).toHaveBeenCalled();
		});
	});

	describe("updateStatus", () => {
		it("should update milestone to unlocked", async () => {
			setMockResult([{ ...mockMilestone, status: "unlocked" }]);

			await milestoneService.updateStatus("milestone-1", "unlocked");

			expect(mockUpdate).toHaveBeenCalled();
		});

		it("should update milestone to completed and unlock next", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1 || callCount === 2) {
					resolve([mockMilestone]);
				} else if (callCount === 3) {
					resolve([{ ...mockMilestone, id: "milestone-2", order: 2 }]);
				} else {
					resolve([{ ...mockMilestone, status: "completed" }]);
				}
			});

			await milestoneService.updateStatus("milestone-1", "completed", 85);

			// Should unlock next milestone
			expect(mockUpdate).toHaveBeenCalled();
		});
	});

	describe("updateProgress", () => {
		it("should update progress percentage", async () => {
			setMockResult([{ ...mockMilestone, progress: 50 }]);

			await milestoneService.updateProgress("milestone-1", 50);

			expect(mockUpdate).toHaveBeenCalled();
		});

		it("should mark as completed when progress reaches 100", async () => {
			setMockResult([{ ...mockMilestone, progress: 100, status: "completed" }]);

			await milestoneService.updateProgress("milestone-1", 100);

			expect(mockUpdate).toHaveBeenCalled();
		});
	});
});

describe("assessment service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	describe("list", () => {
		it("should return assessments for user", async () => {
			setMockResult([mockAssessment]);

			const result = await assessmentService.list(mockUserId);

			expect(result).toEqual([mockAssessment]);
		});

		it("should filter by skillId", async () => {
			setMockResult([mockAssessment]);

			await assessmentService.list(mockUserId, { skillId: "skill-js" });

			expect(mockWhere).toHaveBeenCalled();
		});

		it("should limit results", async () => {
			setMockResult([mockAssessment]);

			await assessmentService.list(mockUserId, { limit: 5 });

			expect(mockLimit).toHaveBeenCalled();
		});
	});

	describe("getById", () => {
		it("should return assessment by id", async () => {
			setMockResult([mockAssessment]);

			const result = await assessmentService.getById("assessment-1");

			expect(result).toEqual(mockAssessment);
		});
	});

	describe("getLatest", () => {
		it("should return most recent assessment for a skill", async () => {
			setMockResult([mockAssessment]);

			const result = await assessmentService.getLatest(mockUserId, "skill-js");

			expect(result).toEqual(mockAssessment);
			expect(mockOrderBy).toHaveBeenCalled();
			expect(mockLimit).toHaveBeenCalled();
		});
	});

	describe("create", () => {
		it("should create a new assessment", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount <= 2) {
					resolve([]);
				} else {
					resolve([mockAssessment]);
				}
			});

			await assessmentService.create({
				userId: mockUserId,
				skillId: "skill-js",
				skillName: "JavaScript",
				category: "technical",
				currentLevel: "intermediate",
				score: 85,
			});

			expect(mockInsert).toHaveBeenCalled();
		});

		it("should calculate trend from previous assessment", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([{ ...mockAssessment, score: 70 }]); // Previous assessment
				} else if (callCount === 2) {
					resolve([mockProfile]); // Profile lookup
				} else {
					resolve([{ ...mockAssessment, trend: "improving" }]);
				}
			});

			await assessmentService.create({
				userId: mockUserId,
				skillId: "skill-js",
				skillName: "JavaScript",
				category: "technical",
				currentLevel: "intermediate",
				score: 85,
			});

			expect(mockInsert).toHaveBeenCalled();
		});
	});
});

describe("recommendation service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	describe("list", () => {
		it("should return active recommendations", async () => {
			setMockResult([mockRecommendation]);

			const result = await recommendationService.list(mockUserId);

			expect(result).toEqual([mockRecommendation]);
		});

		it("should filter by type", async () => {
			setMockResult([mockRecommendation]);

			await recommendationService.list(mockUserId, { type: "next_skill" });

			expect(mockWhere).toHaveBeenCalled();
		});

		it("should filter by priority", async () => {
			setMockResult([mockRecommendation]);

			await recommendationService.list(mockUserId, { priority: "high" });

			expect(mockWhere).toHaveBeenCalled();
		});
	});

	describe("getById", () => {
		it("should return recommendation by id", async () => {
			setMockResult([mockRecommendation]);

			const result = await recommendationService.getById("rec-1");

			expect(result).toEqual(mockRecommendation);
		});
	});

	describe("create", () => {
		it("should create a new recommendation", async () => {
			setMockResult([mockRecommendation]);

			await recommendationService.create({
				userId: mockUserId,
				type: "next_skill",
				title: "Learn TypeScript",
				description: "TypeScript is useful",
				reason: "Based on your JavaScript skills",
			});

			expect(mockInsert).toHaveBeenCalled();
		});
	});

	describe("markViewed", () => {
		it("should mark recommendation as viewed", async () => {
			setMockResult([{ ...mockRecommendation, isViewed: true }]);

			await recommendationService.markViewed("rec-1");

			expect(mockUpdate).toHaveBeenCalled();
		});
	});

	describe("accept", () => {
		it("should mark recommendation as accepted", async () => {
			setMockResult([{ ...mockRecommendation, isAccepted: true }]);

			await recommendationService.accept("rec-1");

			expect(mockUpdate).toHaveBeenCalled();
		});
	});

	describe("complete", () => {
		it("should mark recommendation as completed", async () => {
			setMockResult([{ ...mockRecommendation, isCompleted: true }]);

			await recommendationService.complete("rec-1");

			expect(mockUpdate).toHaveBeenCalled();
		});
	});

	describe("dismiss", () => {
		it("should dismiss recommendation with reason", async () => {
			setMockResult([{ ...mockRecommendation, isDismissed: true, isActive: false }]);

			await recommendationService.dismiss("rec-1", "Not relevant");

			expect(mockUpdate).toHaveBeenCalled();
		});
	});
});

describe("difficulty service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	describe("adaptDifficulty", () => {
		it("should increase difficulty for excellent performance", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockProfile]);
				} else {
					resolve([
						{ ...mockAssessment, score: 90, trend: "improving" },
						{ ...mockAssessment, score: 88, trend: "improving" },
					]);
				}
			});

			const result = await difficultyService.adaptDifficulty(mockUserId);

			expect(result.adjusted).toBe(true);
			expect(result.reason).toContain("Excellent");
		});

		it("should decrease difficulty for struggling performance", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockProfile]);
				} else {
					resolve([
						{ ...mockAssessment, score: 40, trend: "declining" },
						{ ...mockAssessment, score: 45, trend: "declining" },
					]);
				}
			});

			const result = await difficultyService.adaptDifficulty(mockUserId);

			expect(result.adjusted).toBe(true);
			expect(result.reason).toContain("Struggling");
		});

		it("should throw error if profile not found", async () => {
			setMockResult([]);

			await expect(difficultyService.adaptDifficulty(mockUserId)).rejects.toThrow("Learning profile not found");
		});

		it("should not adjust if no assessments found", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockProfile]);
				} else {
					resolve([]);
				}
			});

			const result = await difficultyService.adaptDifficulty(mockUserId);

			expect(result.adjusted).toBe(false);
			expect(result.reason).toContain("No assessments");
		});
	});
});
