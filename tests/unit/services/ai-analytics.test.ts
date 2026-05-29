/**
 * Unit Tests for src/integrations/orpc/services/ai-analytics.ts
 *
 * Tests cover:
 * - Model performance metrics calculation
 * - Feature usage matrix generation
 * - Cost analysis with token pricing
 * - Quality scores and success rates
 * - Student progress metrics
 * - Predictive insights and forecasting
 * - Export data generation
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database client
const { mockWhere, mockGroupBy, chainableMock } = vi.hoisted(() => {
	const mockSelect = vi.fn();
	const mockSelectDistinct = vi.fn();
	const mockFrom = vi.fn();
	const mockWhere = vi.fn();
	const mockOrderBy = vi.fn();
	const mockLimit = vi.fn();
	const mockGroupBy = vi.fn();
	const mockInnerJoin = vi.fn();
	const mockLeftJoin = vi.fn();

	const chainableMock: Record<string, ReturnType<typeof vi.fn>> = {
		select: mockSelect,
		selectDistinct: mockSelectDistinct,
		from: mockFrom,
		where: mockWhere,
		orderBy: mockOrderBy,
		limit: mockLimit,
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
		mockGroupBy,
		chainableMock,
	};
});

// Mock the database client
vi.mock("@/integrations/drizzle/client", () => ({
	db: chainableMock,
}));

// Import after mocks are set up
import { aiAnalyticsService } from "@/integrations/orpc/services/ai-analytics";

// Test fixtures
const mockUserId = "user-123";

const mockModelMetrics = [
	{
		provider: "openai",
		model: "gpt-4o",
		totalRequests: BigInt(100),
		successCount: 95,
		errorCount: 3,
		quotaExceededCount: 2,
		avgLatency: "1500.5",
		minLatency: 500,
		maxLatency: 5000,
		p95Latency: 3500,
		totalInputTokens: "50000",
		totalOutputTokens: "25000",
		totalTokens: "75000",
		avgTokensPerRequest: "750",
	},
	{
		provider: "anthropic",
		model: "claude-3-sonnet",
		totalRequests: BigInt(50),
		successCount: 48,
		errorCount: 2,
		quotaExceededCount: 0,
		avgLatency: "2000.0",
		minLatency: 800,
		maxLatency: 6000,
		p95Latency: 4500,
		totalInputTokens: "30000",
		totalOutputTokens: "15000",
		totalTokens: "45000",
		avgTokensPerRequest: "900",
	},
];

const mockFeatureUsage = [
	{
		feature: "resume_improvement",
		totalRequests: BigInt(80),
		successCount: 75,
		errorCount: 5,
		totalTokens: "40000",
		avgLatency: "1200.0",
		uniqueUsers: 25,
	},
	{
		feature: "interview_practice",
		totalRequests: BigInt(60),
		successCount: 58,
		errorCount: 2,
		totalTokens: "30000",
		avgLatency: "1800.0",
		uniqueUsers: 20,
	},
];

const mockCostByFeature = [
	{
		feature: "resume_improvement",
		model: "gpt-4o",
		inputTokens: "20000",
		outputTokens: "10000",
		totalTokens: "30000",
		requestCount: BigInt(50),
	},
	{
		feature: "interview_practice",
		model: "claude-3-sonnet",
		inputTokens: "15000",
		outputTokens: "8000",
		totalTokens: "23000",
		requestCount: BigInt(30),
	},
];

const mockCostOverTime = [
	{
		period: "2026-02-01",
		inputTokens: "10000",
		outputTokens: "5000",
		totalTokens: "15000",
		requestCount: BigInt(20),
	},
	{
		period: "2026-02-02",
		inputTokens: "12000",
		outputTokens: "6000",
		totalTokens: "18000",
		requestCount: BigInt(25),
	},
];

const mockQualityStats = {
	totalRequests: BigInt(150),
	successCount: 140,
	errorCount: 8,
	quotaExceededCount: 2,
};

const mockQualityByFeature = [
	{
		feature: "resume_improvement",
		totalRequests: BigInt(80),
		successCount: 75,
		avgLatency: "1200.0",
	},
];

const mockInterviewStats = {
	totalSessions: BigInt(50),
	completedSessions: 40,
	avgScore: "75.5",
	avgCompletionRate: "80.0",
};

const mockLearningStats = {
	totalPaths: BigInt(20),
	completedPaths: 8,
	inProgressPaths: 10,
	avgProgress: "45.0",
};

const mockSkillStats = [
	{
		category: "technical",
		totalSkills: BigInt(30),
		avgProgress: "60.0",
		avgCurrentLevel: "3.5",
		avgTargetLevel: "4.5",
		totalHoursInvested: "120",
	},
];

const mockUsageTrend = [
	{
		date: "2026-02-01",
		requestCount: BigInt(20),
		tokenCount: "15000",
		uniqueUsers: 10,
	},
	{
		date: "2026-02-02",
		requestCount: BigInt(25),
		tokenCount: "18000",
		uniqueUsers: 12,
	},
];

// Helper to set mock return values
const setMockResult = (result: unknown[]) => {
	chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(result));
};

describe("ai analytics service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("getModelPerformanceMetrics", () => {
		it("should return model performance metrics", async () => {
			setMockResult(mockModelMetrics);

			const result = await aiAnalyticsService.getModelPerformanceMetrics();

			expect(result).toHaveLength(2);
			expect(result[0].provider).toBe("openai");
			expect(result[0].model).toBe("gpt-4o");
			expect(result[0].totalRequests).toBe(100);
			expect(result[0].successRate).toBe(95);
		});

		it("should calculate latency stats correctly", async () => {
			setMockResult(mockModelMetrics);

			const result = await aiAnalyticsService.getModelPerformanceMetrics();

			expect(result[0].latency.avg).toBe(1501);
			expect(result[0].latency.min).toBe(500);
			expect(result[0].latency.max).toBe(5000);
			expect(result[0].latency.p95).toBe(3500);
		});

		it("should calculate token stats correctly", async () => {
			setMockResult(mockModelMetrics);

			const result = await aiAnalyticsService.getModelPerformanceMetrics();

			expect(result[0].tokens.input).toBe(50000);
			expect(result[0].tokens.output).toBe(25000);
			expect(result[0].tokens.total).toBe(75000);
			expect(result[0].tokens.avgPerRequest).toBe(750);
		});

		it("should estimate costs based on model", async () => {
			setMockResult(mockModelMetrics);

			const result = await aiAnalyticsService.getModelPerformanceMetrics();

			// GPT-4o: input $2.5/1M, output $10/1M
			// 50000 input tokens = $0.125, 25000 output tokens = $0.25
			expect(result[0].estimatedCost.total).toBeGreaterThan(0);
		});

		it("should filter by userId", async () => {
			setMockResult(mockModelMetrics);

			await aiAnalyticsService.getModelPerformanceMetrics({ userId: mockUserId });

			expect(mockWhere).toHaveBeenCalled();
		});

		it("should filter by date range", async () => {
			setMockResult(mockModelMetrics);

			await aiAnalyticsService.getModelPerformanceMetrics({
				startDate: new Date("2026-01-01"),
				endDate: new Date("2026-02-01"),
			});

			expect(mockWhere).toHaveBeenCalled();
		});

		it("should return empty array when no data", async () => {
			setMockResult([]);

			const result = await aiAnalyticsService.getModelPerformanceMetrics();

			expect(result).toEqual([]);
		});
	});

	describe("getFeatureUsageMatrix", () => {
		it("should return feature usage breakdown", async () => {
			setMockResult(mockFeatureUsage);

			const result = await aiAnalyticsService.getFeatureUsageMatrix();

			expect(result.features).toHaveLength(2);
			expect(result.features[0].feature).toBe("resume_improvement");
			expect(result.features[0].totalRequests).toBe(80);
			expect(result.features[0].uniqueUsers).toBe(25);
		});

		it("should calculate success rate per feature", async () => {
			setMockResult(mockFeatureUsage);

			const result = await aiAnalyticsService.getFeatureUsageMatrix();

			// 75 success out of 80 = 94%
			expect(result.features[0].successRate).toBe(94);
		});

		it("should filter by userId", async () => {
			setMockResult(mockFeatureUsage);

			await aiAnalyticsService.getFeatureUsageMatrix({ userId: mockUserId });

			expect(mockWhere).toHaveBeenCalled();
		});
	});

	describe("getCostAnalysis", () => {
		it("should return cost breakdown by feature", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve(mockCostByFeature);
				} else if (callCount === 2) {
					resolve(mockCostOverTime);
				} else {
					resolve([]);
				}
			});

			const result = await aiAnalyticsService.getCostAnalysis();

			expect(result.byFeature).toHaveLength(2);
			expect(result.byFeature[0].feature).toBe("resume_improvement");
			expect(result.byFeature[0].inputTokens).toBe(20000);
		});

		it("should return cost over time", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve(mockCostByFeature);
				} else if (callCount === 2) {
					resolve(mockCostOverTime);
				} else {
					resolve([]);
				}
			});

			const result = await aiAnalyticsService.getCostAnalysis();

			expect(result.byTime).toHaveLength(2);
			expect(result.byTime[0].period).toBe("2026-02-01");
		});

		it("should calculate total cost summary", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve(mockCostByFeature);
				} else if (callCount === 2) {
					resolve(mockCostOverTime);
				} else {
					resolve([]);
				}
			});

			const result = await aiAnalyticsService.getCostAnalysis();

			expect(result.summary.totalInputTokens).toBeGreaterThan(0);
			expect(result.summary.totalRequests).toBeGreaterThan(0);
		});

		it("should support groupBy parameter", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve(mockCostByFeature);
				} else if (callCount === 2) {
					resolve(mockCostOverTime);
				} else {
					resolve([]);
				}
			});

			await aiAnalyticsService.getCostAnalysis({ groupBy: "month" });

			expect(mockGroupBy).toHaveBeenCalled();
		});
	});

	describe("getQualityScores", () => {
		it("should return overall quality stats", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockQualityStats]);
				} else if (callCount === 2) {
					resolve(mockQualityByFeature);
				} else {
					resolve([mockInterviewStats]);
				}
			});

			const result = await aiAnalyticsService.getQualityScores();

			expect(result.overall.totalRequests).toBe(150);
			expect(result.overall.successCount).toBe(140);
			expect(result.overall.successRate).toBe(93);
		});

		it("should return quality by feature", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockQualityStats]);
				} else if (callCount === 2) {
					resolve(mockQualityByFeature);
				} else {
					resolve([mockInterviewStats]);
				}
			});

			const result = await aiAnalyticsService.getQualityScores();

			expect(result.byFeature).toHaveLength(1);
			expect(result.byFeature[0].successRate).toBe(94);
		});

		it("should return interview stats", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockQualityStats]);
				} else if (callCount === 2) {
					resolve(mockQualityByFeature);
				} else {
					resolve([mockInterviewStats]);
				}
			});

			const result = await aiAnalyticsService.getQualityScores();

			expect(result.interviews.totalSessions).toBe(50);
			expect(result.interviews.completedSessions).toBe(40);
			expect(result.interviews.avgScore).toBe(76);
		});
	});

	describe("getStudentProgressMetrics", () => {
		it("should return learning path stats", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockLearningStats]);
				} else if (callCount === 2) {
					resolve(mockSkillStats);
				} else if (callCount === 3) {
					resolve([{ totalSessions: BigInt(20), completedSessions: 15, avgScore: "80.0" }]);
				} else {
					resolve([{ totalInterests: BigInt(10), inProgress: 5, completed: 3 }]);
				}
			});

			const result = await aiAnalyticsService.getStudentProgressMetrics();

			expect(result.learning.totalPaths).toBe(20);
			expect(result.learning.completedPaths).toBe(8);
			expect(result.learning.avgProgress).toBe(45);
		});

		it("should return skill progress by category", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockLearningStats]);
				} else if (callCount === 2) {
					resolve(mockSkillStats);
				} else if (callCount === 3) {
					resolve([{ totalSessions: BigInt(20), completedSessions: 15, avgScore: "80.0" }]);
				} else {
					resolve([{ totalInterests: BigInt(10), inProgress: 5, completed: 3 }]);
				}
			});

			const result = await aiAnalyticsService.getStudentProgressMetrics();

			expect(result.skills.byCategory).toHaveLength(1);
			expect(result.skills.byCategory[0].category).toBe("technical");
			expect(result.skills.byCategory[0].avgProgress).toBe(60);
		});

		it("should filter by userId", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockLearningStats]);
				} else if (callCount === 2) {
					resolve(mockSkillStats);
				} else if (callCount === 3) {
					resolve([{ totalSessions: BigInt(20), completedSessions: 15, avgScore: "80.0" }]);
				} else {
					resolve([{ totalInterests: BigInt(10), inProgress: 5, completed: 3 }]);
				}
			});

			await aiAnalyticsService.getStudentProgressMetrics({ userId: mockUserId });

			expect(mockWhere).toHaveBeenCalled();
		});
	});

	describe("getPredictiveInsights", () => {
		it("should return usage trend data", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve(mockUsageTrend);
				} else if (callCount <= 3) {
					resolve([{ userId: "user-1" }, { userId: "user-2" }]);
				} else {
					resolve([]);
				}
			});

			const result = await aiAnalyticsService.getPredictiveInsights();

			expect(result.usageTrend).toHaveLength(2);
			expect(result.usageTrend[0].date).toBe("2026-02-01");
		});

		it("should calculate growth rate", async () => {
			let callCount = 0;
			const extendedTrend = Array.from({ length: 14 }, (_, i) => ({
				date: `2026-02-${String(i + 1).padStart(2, "0")}`,
				requestCount: BigInt(20 + i * 2),
				tokenCount: String(15000 + i * 1000),
				uniqueUsers: 10 + i,
			}));

			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve(extendedTrend);
				} else if (callCount <= 3) {
					resolve([{ userId: "user-1" }]);
				} else {
					resolve([]);
				}
			});

			const result = await aiAnalyticsService.getPredictiveInsights();

			expect(result.forecast.growthRate).toBeDefined();
			expect(result.forecast.trend).toBeDefined();
		});

		it("should generate forecast for next 7 days", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve(mockUsageTrend);
				} else if (callCount <= 3) {
					resolve([{ userId: "user-1" }]);
				} else {
					resolve([]);
				}
			});

			const result = await aiAnalyticsService.getPredictiveInsights();

			expect(result.forecast.predictedUsage).toHaveLength(7);
			expect(result.forecast.predictedUsage[0].date).toBeDefined();
			expect(result.forecast.predictedUsage[0].predictedRequests).toBeDefined();
		});

		it("should identify engagement metrics", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve(mockUsageTrend);
				} else if (callCount === 2) {
					resolve([{ userId: "user-1" }, { userId: "user-2" }, { userId: "user-3" }]);
				} else if (callCount === 3) {
					resolve([{ userId: "user-1" }, { userId: "user-2" }]);
				} else {
					resolve([]);
				}
			});

			const result = await aiAnalyticsService.getPredictiveInsights();

			expect(result.engagement.activeUsersLast30).toBeDefined();
			expect(result.engagement.activeUsersLast7).toBeDefined();
			expect(result.engagement.retentionRate).toBeDefined();
		});
	});

	describe("generateExportData", () => {
		it("should include selected sections in export", async () => {
			setMockResult(mockModelMetrics);

			const result = await aiAnalyticsService.generateExportData({
				startDate: new Date("2026-01-01"),
				endDate: new Date("2026-02-01"),
				sections: ["performance"],
			});

			expect(result.exportedAt).toBeDefined();
			expect(result.dateRange).toBeDefined();
			expect(result.modelPerformance).toBeDefined();
		});

		it("should include multiple sections", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount <= 5) {
					resolve(mockModelMetrics);
				} else {
					resolve([]);
				}
			});

			const result = await aiAnalyticsService.generateExportData({
				startDate: new Date("2026-01-01"),
				endDate: new Date("2026-02-01"),
				sections: ["performance", "features"],
			});

			expect(result.modelPerformance).toBeDefined();
		});

		it("should respect userId filter", async () => {
			setMockResult(mockModelMetrics);

			await aiAnalyticsService.generateExportData({
				userId: mockUserId,
				startDate: new Date("2026-01-01"),
				endDate: new Date("2026-02-01"),
				sections: ["performance"],
			});

			expect(mockWhere).toHaveBeenCalled();
		});

		it("should skip predictions for user-specific exports", async () => {
			setMockResult(mockModelMetrics);

			const result = await aiAnalyticsService.generateExportData({
				userId: mockUserId,
				startDate: new Date("2026-01-01"),
				endDate: new Date("2026-02-01"),
				sections: ["predictions"],
			});

			expect(result.predictiveInsights).toBeUndefined();
		});
	});
});

describe("ai analytics service - edge cases", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	it("should handle zero requests gracefully", async () => {
		setMockResult([
			{
				...mockModelMetrics[0],
				totalRequests: BigInt(0),
				successCount: 0,
			},
		]);

		const result = await aiAnalyticsService.getModelPerformanceMetrics();

		expect(result[0].successRate).toBe(0);
	});

	it("should handle unknown model for cost calculation", async () => {
		setMockResult([
			{
				...mockModelMetrics[0],
				model: "unknown-model",
			},
		]);

		const result = await aiAnalyticsService.getModelPerformanceMetrics();

		// Should use default cost
		expect(result[0].estimatedCost.total).toBeGreaterThan(0);
	});

	it("should handle null/undefined values in metrics", async () => {
		setMockResult([
			{
				provider: "openai",
				model: "gpt-4o",
				totalRequests: BigInt(10),
				successCount: null,
				errorCount: null,
				quotaExceededCount: null,
				avgLatency: null,
				minLatency: null,
				maxLatency: null,
				p95Latency: null,
				totalInputTokens: null,
				totalOutputTokens: null,
				totalTokens: null,
				avgTokensPerRequest: null,
			},
		]);

		const result = await aiAnalyticsService.getModelPerformanceMetrics();

		expect(result[0].successCount).toBe(0);
		expect(result[0].latency.avg).toBe(0);
		expect(result[0].tokens.total).toBe(0);
	});
});
