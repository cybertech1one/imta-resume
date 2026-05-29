/**
 * Unit Tests for src/integrations/orpc/services/skill-gap.ts
 *
 * Tests cover:
 * - Gap analysis between user skills and target role
 * - Market demand skill ranking
 * - Skill prioritization by employability impact
 * - Learning resource suggestions
 * - Time-to-close estimations
 * - Industry benchmark retrieval
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database client
const { mockWhere, chainableMock } = vi.hoisted(() => {
	const mockSelect = vi.fn();
	const mockFrom = vi.fn();
	const mockWhere = vi.fn();
	const mockOrderBy = vi.fn();
	const mockLimit = vi.fn();

	const chainableMock: Record<string, ReturnType<typeof vi.fn>> = {
		select: mockSelect,
		from: mockFrom,
		where: mockWhere,
		orderBy: mockOrderBy,
		limit: mockLimit,
	};

	// Set up chainable returns
	for (const fn of Object.values(chainableMock)) {
		fn.mockReturnValue(chainableMock);
	}

	return {
		mockWhere,
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

// Mock user settings service
vi.mock("@/integrations/orpc/services/user-settings", () => ({
	userSettingsService: {
		getPreferredAiLanguage: vi.fn().mockResolvedValue("fr"),
	},
}));

// Mock AI SDK
vi.mock("ai", () => ({
	generateText: vi.fn().mockResolvedValue({
		text: JSON.stringify([
			{
				id: "res_1",
				title: "JavaScript Course",
				titleFr: "Cours JavaScript",
				type: "course",
				platform: "Coursera",
				url: "https://coursera.org/js",
				duration: "4 weeks",
				cost: "subscription",
				difficulty: "intermediate",
				rating: 4.5,
				relevanceScore: 85,
			},
		]),
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
import { skillGapService } from "@/integrations/orpc/services/skill-gap";

// Test fixtures
const mockUserId = "user-123";

const mockRole = {
	id: "role-1",
	role: "Full Stack Developer",
	roleFr: "Developpeur Full Stack",
	field: "technology",
	description: "Build web applications",
	descriptionFr: "Construire des applications web",
	experienceYears: 2,
	isActive: true,
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-15"),
};

const mockRequiredSkills = [
	{
		id: "skill-1",
		roleId: "role-1",
		skillName: "JavaScript",
		skillNameFr: "JavaScript",
		category: "technical",
		importance: "critical",
		requiredLevel: 4,
		industryBenchmark: "3.5",
		createdAt: new Date("2026-01-01"),
	},
	{
		id: "skill-2",
		roleId: "role-1",
		skillName: "React",
		skillNameFr: "React",
		category: "technical",
		importance: "important",
		requiredLevel: 3,
		industryBenchmark: "3.0",
		createdAt: new Date("2026-01-01"),
	},
	{
		id: "skill-3",
		roleId: "role-1",
		skillName: "Communication",
		skillNameFr: "Communication",
		category: "soft",
		importance: "nice-to-have",
		requiredLevel: 3,
		industryBenchmark: "3.5",
		createdAt: new Date("2026-01-01"),
	},
];

const mockUserGapData = {
	id: "gap-1",
	userId: mockUserId,
	currentSkills: [
		{
			id: "us-1",
			name: "JavaScript",
			nameFr: "JavaScript",
			category: "technical",
			currentLevel: 2,
		},
		{
			id: "us-2",
			name: "React",
			nameFr: "React",
			category: "technical",
			currentLevel: 3,
		},
	],
	targetRole: null,
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-15"),
};

const mockDemandData = [
	{
		id: "demand-1",
		skill: "JavaScript",
		industry: "tech",
		demandScore: 90,
		growthRate: 15,
		totalJobs: 5000,
		avgSalaryPremium: 20,
		hotness: "fire",
		createdAt: new Date("2026-01-01"),
	},
	{
		id: "demand-2",
		skill: "React",
		industry: "tech",
		demandScore: 85,
		growthRate: 25,
		totalJobs: 4000,
		avgSalaryPremium: 25,
		hotness: "hot",
		createdAt: new Date("2026-01-01"),
	},
];

const mockHeatmapData = [
	{
		id: "heat-1",
		skill: "JavaScript",
		industries: { tech: 95, services: 70 },
		overallDemand: 90,
		trend: "rising",
		createdAt: new Date("2026-01-01"),
	},
];

const mockSkillLibrary = [
	{
		id: "lib-1",
		name: "JavaScript",
		nameFr: "JavaScript",
		category: "technical",
		isActive: true,
		isRecommended: true,
		createdAt: new Date("2026-01-01"),
	},
];

const mockIndustryTrends = [
	{
		id: "trend-1",
		industry: "tech",
		openPositions: 10000,
		changePercent: 15,
		competitionLevel: "high",
		createdAt: new Date("2026-01-01"),
	},
];

// Helper to set mock return values
const setMockResult = (result: unknown[]) => {
	chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(result));
};

describe("skill gap service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("analyzeGap", () => {
		it("should return gap analysis for user and target role", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockRole]);
				} else if (callCount === 2) {
					resolve(mockRequiredSkills);
				} else if (callCount === 3) {
					resolve([mockUserGapData]);
				} else if (callCount === 4) {
					resolve(mockDemandData);
				} else {
					resolve([]);
				}
			});

			const result = await skillGapService.analyzeGap(mockUserId, "role-1");

			expect(result.userId).toBe(mockUserId);
			expect(result.targetRoleId).toBe("role-1");
			expect(result.targetRoleName).toBe("Full Stack Developer");
			expect(result.gaps).toHaveLength(3);
		});

		it("should calculate readiness score correctly", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockRole]);
				} else if (callCount === 2) {
					resolve(mockRequiredSkills);
				} else if (callCount === 3) {
					resolve([mockUserGapData]);
				} else if (callCount === 4) {
					resolve(mockDemandData);
				} else {
					resolve([]);
				}
			});

			const result = await skillGapService.analyzeGap(mockUserId, "role-1");

			// User has JS level 2/4, React 3/3, Communication 0/3
			// Total current: 2+3+0=5, Total required: 4+3+3=10
			// Readiness: 5/10 = 50%
			expect(result.readinessScore).toBe(50);
		});

		it("should identify critical gaps", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockRole]);
				} else if (callCount === 2) {
					resolve(mockRequiredSkills);
				} else if (callCount === 3) {
					resolve([mockUserGapData]);
				} else if (callCount === 4) {
					resolve(mockDemandData);
				} else {
					resolve([]);
				}
			});

			const result = await skillGapService.analyzeGap(mockUserId, "role-1");

			// JavaScript is critical with a gap (level 2 vs required 4)
			expect(result.criticalGaps).toBe(1);
		});

		it("should throw error if role not found", async () => {
			setMockResult([]);

			await expect(skillGapService.analyzeGap(mockUserId, "non-existent")).rejects.toThrow("Target role not found");
		});

		it("should generate recommendations", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockRole]);
				} else if (callCount === 2) {
					resolve(mockRequiredSkills);
				} else if (callCount === 3) {
					resolve([mockUserGapData]);
				} else if (callCount === 4) {
					resolve(mockDemandData);
				} else {
					resolve([]);
				}
			});

			const result = await skillGapService.analyzeGap(mockUserId, "role-1");

			expect(result.recommendations).toBeDefined();
			expect(result.recommendations.length).toBeGreaterThan(0);
		});

		it("should sort gaps by priority", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockRole]);
				} else if (callCount === 2) {
					resolve(mockRequiredSkills);
				} else if (callCount === 3) {
					resolve([mockUserGapData]);
				} else if (callCount === 4) {
					resolve(mockDemandData);
				} else {
					resolve([]);
				}
			});

			const result = await skillGapService.analyzeGap(mockUserId, "role-1");

			// Gaps should be sorted by priority (highest first)
			for (let i = 1; i < result.gaps.length; i++) {
				expect(result.gaps[i - 1].priority).toBeGreaterThanOrEqual(result.gaps[i].priority);
			}
		});
	});

	describe("getMarketDemand", () => {
		it("should return skills sorted by demand score", async () => {
			// The service does: await demandQuery.then((results) => results.sort(...))
			// So the mock's then() receives a callback that transforms the data
			// We need to call that callback with our mock data and return the result

			let callCount = 0;
			chainableMock.then = vi.fn((callback: (v: unknown) => unknown) => {
				callCount++;
				if (callCount === 1) {
					// First call: demandQuery.then((results) => results.sort(...))
					// Call the callback with our mock data and return the sorted result
					const result = callback(mockDemandData);
					return result;
				} else {
					// Second call: direct await on heatmap query
					return callback(mockHeatmapData);
				}
			});

			const result = await skillGapService.getMarketDemand();

			expect(result).toHaveLength(2);
			expect(result[0].demandScore).toBeGreaterThanOrEqual(result[1].demandScore);
		});

		it("should filter by field", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((callback: (v: unknown) => unknown) => {
				callCount++;
				if (callCount === 1) {
					return callback([mockDemandData[0]]);
				} else {
					return callback(mockHeatmapData);
				}
			});

			await skillGapService.getMarketDemand("tech");

			expect(mockWhere).toHaveBeenCalled();
		});

		it("should include trend data from heatmap", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((callback: (v: unknown) => unknown) => {
				callCount++;
				if (callCount === 1) {
					return callback(mockDemandData);
				} else {
					return callback(mockHeatmapData);
				}
			});

			const result = await skillGapService.getMarketDemand();

			expect(result[0].trend).toBeDefined();
			expect(result[0].industries).toBeDefined();
		});

		it("should map hotness levels correctly", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((callback: (v: unknown) => unknown) => {
				callCount++;
				if (callCount === 1) {
					return callback(mockDemandData);
				} else {
					return callback(mockHeatmapData);
				}
			});

			const result = await skillGapService.getMarketDemand();

			expect(["fire", "hot", "warm", "cold"]).toContain(result[0].hotness);
		});
	});

	describe("prioritizeSkills", () => {
		it("should return prioritized skills for user", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockUserGapData]);
				} else if (callCount === 2) {
					resolve(mockDemandData);
				} else {
					resolve(mockSkillLibrary);
				}
			});

			const result = await skillGapService.prioritizeSkills(mockUserId);

			expect(result).toHaveLength(2);
			expect(result[0].priorityRank).toBe(1);
		});

		it("should calculate priority scores", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockUserGapData]);
				} else if (callCount === 2) {
					resolve(mockDemandData);
				} else {
					resolve(mockSkillLibrary);
				}
			});

			const result = await skillGapService.prioritizeSkills(mockUserId);

			expect(result[0].priorityScore).toBeGreaterThan(0);
		});

		it("should include reasons for priority", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockUserGapData]);
				} else if (callCount === 2) {
					resolve(mockDemandData);
				} else {
					resolve(mockSkillLibrary);
				}
			});

			const result = await skillGapService.prioritizeSkills(mockUserId);

			// JavaScript has high demand so should have reasons
			const jsSkill = result.find((s) => s.skillName === "JavaScript");
			expect(jsSkill?.reasons.length).toBeGreaterThan(0);
		});

		it("should return empty array if no skills", async () => {
			setMockResult([{ ...mockUserGapData, currentSkills: [] }]);

			const result = await skillGapService.prioritizeSkills(mockUserId);

			expect(result).toEqual([]);
		});

		it("should assign impact on employability", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockUserGapData]);
				} else if (callCount === 2) {
					resolve(mockDemandData);
				} else {
					resolve(mockSkillLibrary);
				}
			});

			const result = await skillGapService.prioritizeSkills(mockUserId);

			expect(["high", "medium", "low"]).toContain(result[0].impactOnEmployability);
		});
	});

	describe("suggestResources", () => {
		it("should suggest learning resources for a skill", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockUserGapData]);
				} else {
					resolve(mockSkillLibrary);
				}
			});

			const result = await skillGapService.suggestResources("us-1", mockUserId);

			expect(result).toHaveLength(1);
			expect(result[0].title).toBe("JavaScript Course");
		});

		it("should sort resources by relevance score", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockUserGapData]);
				} else {
					resolve(mockSkillLibrary);
				}
			});

			const result = await skillGapService.suggestResources("us-1", mockUserId);

			for (let i = 1; i < result.length; i++) {
				expect(result[i - 1].relevanceScore).toBeGreaterThanOrEqual(result[i].relevanceScore);
			}
		});

		it("should throw error if skill not found", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([{ ...mockUserGapData, currentSkills: [] }]);
				} else {
					resolve([]);
				}
			});

			await expect(skillGapService.suggestResources("non-existent", mockUserId)).rejects.toThrow("Skill not found");
		});
	});

	describe("estimateTimeToClose", () => {
		it("should estimate time to close skill gap", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockUserGapData]);
				} else {
					resolve(mockSkillLibrary);
				}
			});

			const result = await skillGapService.estimateTimeToClose(mockUserId, "us-1");

			expect(result.skillName).toBe("JavaScript");
			expect(result.currentLevel).toBe(2);
			expect(result.targetLevel).toBe(5);
			expect(result.estimatedWeeks).toBeGreaterThan(0);
			expect(result.estimatedHours).toBeGreaterThan(0);
		});

		it("should calculate time factors", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockUserGapData]);
				} else {
					resolve(mockSkillLibrary);
				}
			});

			const result = await skillGapService.estimateTimeToClose(mockUserId, "us-1");

			expect(result.factors.baseTime).toBeGreaterThan(0);
			expect(result.factors.categoryMultiplier).toBeGreaterThan(0);
			expect(result.factors.gapMultiplier).toBeGreaterThan(0);
		});

		it("should generate milestones", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockUserGapData]);
				} else {
					resolve(mockSkillLibrary);
				}
			});

			const result = await skillGapService.estimateTimeToClose(mockUserId, "us-1");

			// Gap is 3 levels (2 to 5), so should have 3 milestones
			expect(result.milestones).toHaveLength(3);
			expect(result.milestones[0].level).toBe(3);
		});

		it("should assign confidence level", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([mockUserGapData]);
				} else {
					resolve(mockSkillLibrary);
				}
			});

			const result = await skillGapService.estimateTimeToClose(mockUserId, "us-1");

			expect(["high", "medium", "low"]).toContain(result.confidenceLevel);
		});

		it("should throw error if skill not found", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve([{ ...mockUserGapData, currentSkills: [] }]);
				} else {
					resolve([]);
				}
			});

			await expect(skillGapService.estimateTimeToClose(mockUserId, "non-existent")).rejects.toThrow("Skill not found");
		});
	});

	describe("getIndustryBenchmarks", () => {
		it("should return industry benchmarks", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve(mockIndustryTrends);
				} else if (callCount === 2) {
					resolve(mockDemandData);
				} else {
					resolve(mockHeatmapData);
				}
			});

			const result = await skillGapService.getIndustryBenchmarks();

			expect(result).toHaveLength(1);
			expect(result[0].industry).toBe("tech");
		});

		it("should include top skills for industry", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve(mockIndustryTrends);
				} else if (callCount === 2) {
					resolve(mockDemandData);
				} else {
					resolve(mockHeatmapData);
				}
			});

			const result = await skillGapService.getIndustryBenchmarks();

			expect(result[0].topSkills).toBeDefined();
			expect(result[0].topSkills.length).toBeGreaterThan(0);
		});

		it("should filter by specific industry", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve(mockIndustryTrends);
				} else if (callCount === 2) {
					resolve(mockDemandData);
				} else {
					resolve(mockHeatmapData);
				}
			});

			await skillGapService.getIndustryBenchmarks("tech");

			expect(mockWhere).toHaveBeenCalled();
		});

		it("should include growth rate and competition level", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve(mockIndustryTrends);
				} else if (callCount === 2) {
					resolve(mockDemandData);
				} else {
					resolve(mockHeatmapData);
				}
			});

			const result = await skillGapService.getIndustryBenchmarks();

			expect(result[0].growthRate).toBe(15);
			expect(result[0].competitionLevel).toBe("high");
		});

		it("should include French industry name", async () => {
			let callCount = 0;
			chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
				callCount++;
				if (callCount === 1) {
					resolve(mockIndustryTrends);
				} else if (callCount === 2) {
					resolve(mockDemandData);
				} else {
					resolve(mockHeatmapData);
				}
			});

			const result = await skillGapService.getIndustryBenchmarks();

			expect(result[0].industryFr).toBe("Technologie");
		});
	});
});

describe("skill gap service - edge cases", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		for (const fn of Object.values(chainableMock)) {
			fn.mockReturnValue(chainableMock);
		}
	});

	it("should handle user with no existing skills", async () => {
		let callCount = 0;
		chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
			callCount++;
			if (callCount === 1) {
				resolve([mockRole]);
			} else if (callCount === 2) {
				resolve(mockRequiredSkills);
			} else if (callCount === 3) {
				resolve([{ ...mockUserGapData, currentSkills: [] }]);
			} else if (callCount === 4) {
				resolve(mockDemandData);
			} else {
				resolve([]);
			}
		});

		const result = await skillGapService.analyzeGap(mockUserId, "role-1");

		// All skills should have currentLevel 0
		expect(result.gaps.every((g) => g.currentLevel === 0)).toBe(true);
		expect(result.readinessScore).toBe(0);
	});

	it("should handle missing demand data gracefully", async () => {
		let callCount = 0;
		chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
			callCount++;
			if (callCount === 1) {
				resolve([mockRole]);
			} else if (callCount === 2) {
				resolve(mockRequiredSkills);
			} else if (callCount === 3) {
				resolve([mockUserGapData]);
			} else if (callCount === 4) {
				resolve([]);
			} else {
				resolve([]);
			}
		});

		const result = await skillGapService.analyzeGap(mockUserId, "role-1");

		// Should still work with default demand scores
		expect(result.gaps).toHaveLength(3);
		expect(result.gaps[0].demandScore).toBe(50); // Default
	});

	it("should handle skill already at required level", async () => {
		const userWithFullSkill = {
			...mockUserGapData,
			currentSkills: [
				{
					id: "us-1",
					name: "JavaScript",
					nameFr: "JavaScript",
					category: "technical",
					currentLevel: 5, // Already at mastery
				},
			],
		};

		let callCount = 0;
		chainableMock.then = vi.fn((resolve: (v: unknown) => void) => {
			callCount++;
			if (callCount === 1) {
				resolve([mockRole]);
			} else if (callCount === 2) {
				resolve([mockRequiredSkills[0]]); // Only JS
			} else if (callCount === 3) {
				resolve([userWithFullSkill]);
			} else if (callCount === 4) {
				resolve(mockDemandData);
			} else {
				resolve([]);
			}
		});

		const result = await skillGapService.analyzeGap(mockUserId, "role-1");

		const jsGap = result.gaps.find((g) => g.skillName === "JavaScript");
		expect(jsGap?.gapSize).toBe(0);
		expect(result.skillsCovered).toBe(1);
	});
});
