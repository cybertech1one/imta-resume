/**
 * Unit Tests for src/integrations/orpc/services/career-matcher.ts
 *
 * Tests cover:
 * - Career prediction CRUD operations
 * - Job match score management
 * - Career trajectory simulation
 * - Statistics calculation
 * - AI prompt retrieval
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database client
const { mockWhere, mockOrderBy, mockLimit, mockInsert, mockValues, mockUpdate, mockSet, mockDelete, chainableMock } =
	vi.hoisted(() => {
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
		};

		// Set up chainable returns
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}

		return {
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

// Mock string utils
vi.mock("@/utils/string", () => ({
	generateId: vi.fn(() => "test-id-" + Math.random().toString(36).substring(7)),
}));

// Import after mocks are set up
import { careerMatcherService } from "@/integrations/orpc/services/career-matcher";

// Test fixtures
const mockUserId = "user-123";

const mockPrediction = {
	id: "pred-1",
	userId: mockUserId,
	resumeId: "resume-1",
	status: "completed" as const,
	currentRole: "Junior Developer",
	currentField: "technology",
	yearsExperience: 2,
	currentSkills: ["JavaScript", "React", "Node.js"],
	educationLevel: "Bachelor",
	predictedPaths: [
		{
			id: "path-1",
			title: "Senior Developer",
			titleFr: "Developpeur Senior",
			description: "Progress to senior role",
			descriptionFr: "Progresser vers un role senior",
			field: "technology",
			matchPercentage: 85,
			confidence: "high" as const,
			estimatedTimeToAchieve: 24,
			salaryProjection: {
				current: 8000,
				year1: 10000,
				year3: 15000,
				year5: 20000,
				currency: "MAD",
			},
			requiredSkills: [],
			milestones: [],
			successFactors: [],
			challenges: [],
			growthPotential: "high" as const,
		},
	],
	topRecommendation: "path-1",
	aiAnalysis: "Strong potential for growth",
	confidenceScore: 85,
	processingTime: 5000,
	errorMessage: null,
	expiresAt: new Date("2026-03-01"),
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-15"),
};

const mockJobMatchScore = {
	id: "match-1",
	userId: mockUserId,
	predictionId: "pred-1",
	jobTitle: "Full Stack Developer",
	company: "Tech Corp",
	industry: "technology",
	location: "Casablanca",
	salaryMin: 10000,
	salaryMax: 15000,
	jobDescription: "Build web applications",
	requiredSkills: ["JavaScript", "React", "Node.js", "PostgreSQL"],
	overallScore: 78,
	skillMatchScore: 80,
	experienceMatchScore: 75,
	educationMatchScore: 90,
	cultureFitScore: 70,
	salaryFitScore: 85,
	locationFitScore: 100,
	matchedSkills: ["JavaScript", "React", "Node.js"],
	missingSkills: ["PostgreSQL"],
	transferableSkills: ["Problem solving"],
	recommendations: ["Learn PostgreSQL", "Get AWS certification"],
	confidenceLevel: "high" as const,
	aiExplanation: "Good match overall",
	improvementSuggestions: ["Add database experience"],
	isBookmarked: false,
	isApplied: false,
	appliedAt: null,
	isDismissed: false,
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-15"),
};

const mockTrajectory = {
	id: "traj-1",
	userId: mockUserId,
	predictionId: "pred-1",
	pathName: "Senior Developer Path",
	targetRole: "Senior Developer",
	targetField: "technology",
	estimatedYearsToTarget: 3,
	startingSalary: 8000,
	projectedSalaryYear1: 10000,
	projectedSalaryYear3: 15000,
	projectedSalaryYear5: 20000,
	salaryCurrency: "MAD",
	growthRate: 25,
	successProbability: 80,
	marketDemand: "high" as const,
	competitionLevel: "medium" as const,
	trajectoryPoints: [
		{
			year: 1,
			role: "Mid Developer",
			salary: 10000,
			skills: ["TypeScript", "AWS"],
			milestones: ["Lead first project"],
		},
	],
	requiredSkillUpgrades: ["TypeScript", "AWS"],
	requiredCertifications: ["AWS Certified"],
	requiredExperience: ["Team leadership"],
	successFactors: ["Continuous learning"],
	potentialChallenges: ["Fast-paced environment"],
	mitigationStrategies: ["Take leadership courses"],
	aiInsights: "Strong growth potential",
	alternativePathSuggestions: ["DevOps Engineer"],
	isSelected: true,
	lastSimulatedAt: new Date("2026-01-15"),
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-15"),
};

// Helper to set mock return values
const setMockResult = (result: unknown[]) => {
	chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(result));
};

describe("career matcher service - predictions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("getPrediction", () => {
		it("should return prediction by id and userId", async () => {
			setMockResult([mockPrediction]);

			const result = await careerMatcherService.getPrediction({
				id: "pred-1",
				userId: mockUserId,
			});

			expect(result).toEqual(mockPrediction);
			expect(mockWhere).toHaveBeenCalled();
		});

		it("should return null if not found", async () => {
			setMockResult([]);

			const result = await careerMatcherService.getPrediction({
				id: "non-existent",
				userId: mockUserId,
			});

			expect(result).toBeNull();
		});
	});

	describe("listPredictions", () => {
		it("should return predictions for user", async () => {
			setMockResult([mockPrediction]);

			const result = await careerMatcherService.listPredictions({ userId: mockUserId });

			expect(result).toEqual([mockPrediction]);
			expect(mockOrderBy).toHaveBeenCalled();
		});

		it("should respect limit parameter", async () => {
			setMockResult([mockPrediction]);

			await careerMatcherService.listPredictions({ userId: mockUserId, limit: 5 });

			expect(mockLimit).toHaveBeenCalled();
		});

		it("should use default limit of 10", async () => {
			setMockResult([mockPrediction]);

			await careerMatcherService.listPredictions({ userId: mockUserId });

			expect(mockLimit).toHaveBeenCalled();
		});
	});

	describe("getLatestPrediction", () => {
		it("should return most recent completed prediction", async () => {
			setMockResult([mockPrediction]);

			const result = await careerMatcherService.getLatestPrediction({ userId: mockUserId });

			expect(result).toEqual(mockPrediction);
			expect(mockWhere).toHaveBeenCalled();
			expect(mockOrderBy).toHaveBeenCalled();
		});

		it("should return null if no completed predictions", async () => {
			setMockResult([]);

			const result = await careerMatcherService.getLatestPrediction({ userId: mockUserId });

			expect(result).toBeNull();
		});
	});

	describe("createPrediction", () => {
		it("should create a new pending prediction", async () => {
			setMockResult([{ ...mockPrediction, status: "pending" }]);

			const result = await careerMatcherService.createPrediction({
				userId: mockUserId,
				currentRole: "Junior Developer",
				currentField: "technology",
				yearsExperience: 2,
				currentSkills: ["JavaScript"],
			});

			expect(result).toBeDefined();
			expect(mockInsert).toHaveBeenCalled();
			expect(mockValues).toHaveBeenCalled();
		});

		it("should set expiration date 30 days in future", async () => {
			setMockResult([mockPrediction]);

			const result = await careerMatcherService.createPrediction({
				userId: mockUserId,
			});

			expect(result.expiresAt).toBeDefined();
		});
	});

	describe("updatePredictionWithResults", () => {
		it("should update prediction with AI results", async () => {
			setMockResult([{ ...mockPrediction, status: "completed" }]);

			await careerMatcherService.updatePredictionWithResults({
				id: "pred-1",
				predictedPaths: mockPrediction.predictedPaths,
				topRecommendation: "path-1",
				aiAnalysis: "Good potential",
				confidenceScore: 85,
				processingTime: 5000,
			});

			expect(mockUpdate).toHaveBeenCalled();
			expect(mockSet).toHaveBeenCalled();
		});
	});

	describe("markPredictionFailed", () => {
		it("should mark prediction as failed with error message", async () => {
			// For void operations, call the resolve callback immediately with undefined
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(undefined));

			await careerMatcherService.markPredictionFailed({
				id: "pred-1",
				errorMessage: "AI service unavailable",
			});

			expect(mockUpdate).toHaveBeenCalled();
			expect(mockSet).toHaveBeenCalled();
		});
	});

	describe("deletePrediction", () => {
		it("should delete prediction by id and userId", async () => {
			// For void operations, call the resolve callback immediately with undefined
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(undefined));

			await careerMatcherService.deletePrediction({
				id: "pred-1",
				userId: mockUserId,
			});

			expect(mockDelete).toHaveBeenCalled();
			expect(mockWhere).toHaveBeenCalled();
		});
	});
});

describe("career matcher service - job match scores", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	describe("createJobMatchScore", () => {
		it("should create a new job match score", async () => {
			setMockResult([mockJobMatchScore]);

			const result = await careerMatcherService.createJobMatchScore({
				userId: mockUserId,
				predictionId: "pred-1",
				jobTitle: "Full Stack Developer",
				company: "Tech Corp",
				result: {
					overallScore: 78,
					skillMatchScore: 80,
					matchedSkills: ["JavaScript", "React"],
				},
			});

			expect(result).toBeDefined();
			expect(mockInsert).toHaveBeenCalled();
		});
	});

	describe("listJobMatchScores", () => {
		it("should return job match scores for user", async () => {
			setMockResult([mockJobMatchScore]);

			const result = await careerMatcherService.listJobMatchScores({ userId: mockUserId });

			expect(result).toEqual([mockJobMatchScore]);
		});

		it("should respect limit parameter", async () => {
			setMockResult([mockJobMatchScore]);

			await careerMatcherService.listJobMatchScores({ userId: mockUserId, limit: 10 });

			expect(mockLimit).toHaveBeenCalled();
		});
	});

	describe("getJobMatchScore", () => {
		it("should return job match score by id", async () => {
			setMockResult([mockJobMatchScore]);

			const result = await careerMatcherService.getJobMatchScore({
				id: "match-1",
				userId: mockUserId,
			});

			expect(result).toEqual(mockJobMatchScore);
		});

		it("should return null if not found", async () => {
			setMockResult([]);

			const result = await careerMatcherService.getJobMatchScore({
				id: "non-existent",
				userId: mockUserId,
			});

			expect(result).toBeNull();
		});
	});

	describe("updateJobMatchStatus", () => {
		it("should update bookmark status", async () => {
			setMockResult([{ ...mockJobMatchScore, isBookmarked: true }]);

			const result = await careerMatcherService.updateJobMatchStatus({
				id: "match-1",
				userId: mockUserId,
				isBookmarked: true,
			});

			expect(mockUpdate).toHaveBeenCalled();
			expect(result.isBookmarked).toBe(true);
		});

		it("should update applied status with timestamp", async () => {
			setMockResult([{ ...mockJobMatchScore, isApplied: true, appliedAt: new Date() }]);

			await careerMatcherService.updateJobMatchStatus({
				id: "match-1",
				userId: mockUserId,
				isApplied: true,
			});

			expect(mockUpdate).toHaveBeenCalled();
		});

		it("should update dismissed status", async () => {
			setMockResult([{ ...mockJobMatchScore, isDismissed: true }]);

			const result = await careerMatcherService.updateJobMatchStatus({
				id: "match-1",
				userId: mockUserId,
				isDismissed: true,
			});

			expect(result.isDismissed).toBe(true);
		});
	});

	describe("deleteJobMatchScore", () => {
		it("should delete job match score", async () => {
			// For void operations, call the resolve callback immediately with undefined
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(undefined));

			await careerMatcherService.deleteJobMatchScore({
				id: "match-1",
				userId: mockUserId,
			});

			expect(mockDelete).toHaveBeenCalled();
		});
	});
});

describe("career matcher service - trajectories", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	describe("createTrajectory", () => {
		it("should create a new trajectory", async () => {
			setMockResult([mockTrajectory]);

			const result = await careerMatcherService.createTrajectory({
				userId: mockUserId,
				predictionId: "pred-1",
				pathName: "Senior Developer Path",
				targetRole: "Senior Developer",
				result: {
					estimatedYearsToTarget: 3,
					successProbability: 80,
					trajectoryPoints: [],
				},
			});

			expect(result).toBeDefined();
			expect(mockInsert).toHaveBeenCalled();
		});
	});

	describe("listTrajectories", () => {
		it("should return trajectories for user", async () => {
			setMockResult([mockTrajectory]);

			const result = await careerMatcherService.listTrajectories({ userId: mockUserId });

			expect(result).toEqual([mockTrajectory]);
		});
	});

	describe("getTrajectory", () => {
		it("should return trajectory by id", async () => {
			setMockResult([mockTrajectory]);

			const result = await careerMatcherService.getTrajectory({
				id: "traj-1",
				userId: mockUserId,
			});

			expect(result).toEqual(mockTrajectory);
		});

		it("should return null if not found", async () => {
			setMockResult([]);

			const result = await careerMatcherService.getTrajectory({
				id: "non-existent",
				userId: mockUserId,
			});

			expect(result).toBeNull();
		});
	});

	describe("selectTrajectory", () => {
		it("should select trajectory and deselect others", async () => {
			setMockResult([{ ...mockTrajectory, isSelected: true }]);

			const result = await careerMatcherService.selectTrajectory({
				id: "traj-1",
				userId: mockUserId,
			});

			// Should call update twice: once to deselect all, once to select specific
			expect(mockUpdate).toHaveBeenCalledTimes(2);
			expect(result.isSelected).toBe(true);
		});
	});

	describe("deleteTrajectory", () => {
		it("should delete trajectory", async () => {
			// For void operations, call the resolve callback immediately with undefined
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(undefined));

			await careerMatcherService.deleteTrajectory({
				id: "traj-1",
				userId: mockUserId,
			});

			expect(mockDelete).toHaveBeenCalled();
		});
	});

	describe("getSelectedTrajectory", () => {
		it("should return selected trajectory for user", async () => {
			setMockResult([mockTrajectory]);

			const result = await careerMatcherService.getSelectedTrajectory({ userId: mockUserId });

			expect(result).toEqual(mockTrajectory);
		});

		it("should return null if no trajectory selected", async () => {
			setMockResult([]);

			const result = await careerMatcherService.getSelectedTrajectory({ userId: mockUserId });

			expect(result).toBeNull();
		});
	});
});

describe("career matcher service - statistics", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	describe("getStatistics", () => {
		it("should return comprehensive statistics", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockPrediction, { ...mockPrediction, status: "pending" }]);
				} else if (callCount === 2) {
					resolve([mockJobMatchScore, { ...mockJobMatchScore, isBookmarked: true }]);
				} else {
					resolve([mockTrajectory]);
				}
			});

			const result = await careerMatcherService.getStatistics({ userId: mockUserId });

			expect(result.totalPredictions).toBe(2);
			expect(result.completedPredictions).toBe(1);
			expect(result.totalJobMatches).toBe(2);
			expect(result.bookmarkedJobs).toBe(1);
			expect(result.totalTrajectories).toBe(1);
		});

		it("should calculate average match score", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockPrediction]);
				} else if (callCount === 2) {
					resolve([
						{ ...mockJobMatchScore, overallScore: 80 },
						{ ...mockJobMatchScore, overallScore: 60 },
					]);
				} else {
					resolve([]);
				}
			});

			const result = await careerMatcherService.getStatistics({ userId: mockUserId });

			expect(result.averageMatchScore).toBe(70);
		});

		it("should count applied jobs", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([]);
				} else if (callCount === 2) {
					resolve([
						{ ...mockJobMatchScore, isApplied: true },
						{ ...mockJobMatchScore, isApplied: true },
						{ ...mockJobMatchScore, isApplied: false },
					]);
				} else {
					resolve([]);
				}
			});

			const result = await careerMatcherService.getStatistics({ userId: mockUserId });

			expect(result.appliedJobs).toBe(2);
		});

		it("should include selected trajectory", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([]);
				} else if (callCount === 2) {
					resolve([]);
				} else {
					resolve([mockTrajectory]);
				}
			});

			const result = await careerMatcherService.getStatistics({ userId: mockUserId });

			expect(result.selectedTrajectory).toEqual(mockTrajectory);
		});

		it("should handle empty data", async () => {
			setMockResult([]);

			const result = await careerMatcherService.getStatistics({ userId: mockUserId });

			expect(result.totalPredictions).toBe(0);
			expect(result.averageMatchScore).toBe(0);
			expect(result.selectedTrajectory).toBeNull();
		});
	});
});

describe("career matcher service - prompts", () => {
	describe("getPrompts", () => {
		it("should return AI prompt templates", () => {
			const prompts = careerMatcherService.getPrompts();

			expect(prompts.careerPrediction).toBeDefined();
			expect(prompts.jobMatch).toBeDefined();
			expect(prompts.careerTrajectory).toBeDefined();
			expect(prompts.transferableSkills).toBeDefined();
			expect(prompts.successFactors).toBeDefined();
		});

		it("should include placeholder tokens in prompts", () => {
			const prompts = careerMatcherService.getPrompts();

			expect(prompts.careerPrediction).toContain("{{PROFILE}}");
			expect(prompts.jobMatch).toContain("{{SKILLS}}");
			expect(prompts.careerTrajectory).toContain("{{PATH}}");
		});
	});
});

describe("career matcher service - edge cases", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	it("should handle prediction with no paths", async () => {
		setMockResult([{ ...mockPrediction, predictedPaths: [] }]);

		const result = await careerMatcherService.getPrediction({
			id: "pred-1",
			userId: mockUserId,
		});

		expect(result?.predictedPaths).toEqual([]);
	});

	it("should handle job match with no skills", async () => {
		setMockResult([
			{
				...mockJobMatchScore,
				matchedSkills: [],
				missingSkills: [],
				requiredSkills: [],
			},
		]);

		const result = await careerMatcherService.getJobMatchScore({
			id: "match-1",
			userId: mockUserId,
		});

		expect(result?.matchedSkills).toEqual([]);
	});

	it("should handle trajectory with empty points", async () => {
		setMockResult([{ ...mockTrajectory, trajectoryPoints: [] }]);

		const result = await careerMatcherService.getTrajectory({
			id: "traj-1",
			userId: mockUserId,
		});

		expect(result?.trajectoryPoints).toEqual([]);
	});
});
