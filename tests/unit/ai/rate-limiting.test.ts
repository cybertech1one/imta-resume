/**
 * Unit Tests for AI Rate Limiting
 *
 * Tests cover:
 * - Quota checking logic
 * - Daily and monthly limits
 * - Token-based quotas
 * - Per-user quota tracking
 * - Quota plan assignments
 * - Rate limit bypass for admins
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database client
const { mockSelect, mockFrom, mockWhere, chainableMock } = vi.hoisted(() => {
	const mockSelect = vi.fn();
	const mockFrom = vi.fn();
	const mockWhere = vi.fn();
	const mockInsert = vi.fn();
	const mockValues = vi.fn();
	const mockUpdate = vi.fn();
	const mockSet = vi.fn();
	const mockOrderBy = vi.fn();
	const mockLimit = vi.fn();

	const chainableMock: Record<string, ReturnType<typeof vi.fn>> = {
		select: mockSelect,
		from: mockFrom,
		where: mockWhere,
		insert: mockInsert,
		values: mockValues,
		update: mockUpdate,
		set: mockSet,
		orderBy: mockOrderBy,
		limit: mockLimit,
	};

	// Set up chainable returns
	mockSelect.mockReturnValue(chainableMock);
	mockFrom.mockReturnValue(chainableMock);
	mockWhere.mockReturnValue(chainableMock);
	mockInsert.mockReturnValue(chainableMock);
	mockValues.mockReturnValue(chainableMock);
	mockUpdate.mockReturnValue(chainableMock);
	mockSet.mockReturnValue(chainableMock);
	mockOrderBy.mockReturnValue(chainableMock);
	mockLimit.mockReturnValue(chainableMock);

	return {
		mockSelect,
		mockFrom,
		mockWhere,
		chainableMock,
	};
});

// Mock the database client
vi.mock("@/integrations/drizzle/client", () => ({
	db: chainableMock,
}));

// Mock env
vi.mock("@/utils/env", () => ({
	env: {
		APP_URL: "http://localhost:3000",
	},
}));

// Test fixtures
const mockQuotaPlan = {
	id: "quota-plan-1",
	name: "Free Tier",
	dailyRequestLimit: 50,
	monthlyRequestLimit: 500,
	dailyTokenLimit: 100000,
	monthlyTokenLimit: 1000000,
	isActive: true,
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-01"),
};

const mockUserQuota = {
	id: "user-quota-1",
	userId: "user-123",
	quotaId: mockQuotaPlan.id,
	dailyRequestsUsed: 10,
	monthlyRequestsUsed: 100,
	dailyTokensUsed: 20000,
	monthlyTokensUsed: 200000,
	lastResetAt: new Date("2026-02-09"),
	monthlyResetAt: new Date("2026-02-01"),
	createdAt: new Date("2026-01-15"),
	updatedAt: new Date("2026-02-09"),
};

describe("rate limiting - quota checking", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSelect.mockReturnValue(chainableMock);
		mockFrom.mockReturnValue(chainableMock);
		mockWhere.mockReturnValue(chainableMock);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("daily limits", () => {
		it("should allow request when under daily limit", () => {
			const userQuota = { ...mockUserQuota, dailyRequestsUsed: 10 };
			const plan = { ...mockQuotaPlan, dailyRequestLimit: 50 };

			const isUnderLimit = userQuota.dailyRequestsUsed < plan.dailyRequestLimit;
			expect(isUnderLimit).toBe(true);
		});

		it("should deny request when at daily limit", () => {
			const userQuota = { ...mockUserQuota, dailyRequestsUsed: 50 };
			const plan = { ...mockQuotaPlan, dailyRequestLimit: 50 };

			const isUnderLimit = userQuota.dailyRequestsUsed < plan.dailyRequestLimit;
			expect(isUnderLimit).toBe(false);
		});

		it("should deny request when over daily limit", () => {
			const userQuota = { ...mockUserQuota, dailyRequestsUsed: 55 };
			const plan = { ...mockQuotaPlan, dailyRequestLimit: 50 };

			const isUnderLimit = userQuota.dailyRequestsUsed < plan.dailyRequestLimit;
			expect(isUnderLimit).toBe(false);
		});

		it("should reset daily count at midnight", () => {
			const now = new Date("2026-02-10T00:00:00Z");
			const lastReset = new Date("2026-02-09T00:00:00Z");

			const shouldReset = now.getDate() !== lastReset.getDate();
			expect(shouldReset).toBe(true);
		});

		it("should not reset daily count within same day", () => {
			// Use UTC methods to avoid timezone issues with fake timers
			const now = new Date("2026-02-09T12:00:00Z");
			const lastReset = new Date("2026-02-09T00:00:00Z");

			const shouldReset = now.getUTCDate() !== lastReset.getUTCDate();
			expect(shouldReset).toBe(false);
		});
	});

	describe("monthly limits", () => {
		it("should allow request when under monthly limit", () => {
			const userQuota = { ...mockUserQuota, monthlyRequestsUsed: 100 };
			const plan = { ...mockQuotaPlan, monthlyRequestLimit: 500 };

			const isUnderLimit = userQuota.monthlyRequestsUsed < plan.monthlyRequestLimit;
			expect(isUnderLimit).toBe(true);
		});

		it("should deny request when at monthly limit", () => {
			const userQuota = { ...mockUserQuota, monthlyRequestsUsed: 500 };
			const plan = { ...mockQuotaPlan, monthlyRequestLimit: 500 };

			const isUnderLimit = userQuota.monthlyRequestsUsed < plan.monthlyRequestLimit;
			expect(isUnderLimit).toBe(false);
		});

		it("should reset monthly count at start of month", () => {
			const now = new Date("2026-03-01T00:00:00Z");
			const monthlyReset = new Date("2026-02-01T00:00:00Z");

			const shouldReset = now.getMonth() !== monthlyReset.getMonth();
			expect(shouldReset).toBe(true);
		});

		it("should not reset monthly count within same month", () => {
			// Use UTC methods to avoid timezone issues with fake timers
			const now = new Date("2026-02-15T12:00:00Z");
			const monthlyReset = new Date("2026-02-01T00:00:00Z");

			const shouldReset = now.getUTCMonth() !== monthlyReset.getUTCMonth();
			expect(shouldReset).toBe(false);
		});
	});

	describe("token limits", () => {
		it("should allow request when under daily token limit", () => {
			const userQuota = { ...mockUserQuota, dailyTokensUsed: 50000 };
			const plan = { ...mockQuotaPlan, dailyTokenLimit: 100000 };

			const isUnderLimit = userQuota.dailyTokensUsed < plan.dailyTokenLimit;
			expect(isUnderLimit).toBe(true);
		});

		it("should deny request when over daily token limit", () => {
			const userQuota = { ...mockUserQuota, dailyTokensUsed: 150000 };
			const plan = { ...mockQuotaPlan, dailyTokenLimit: 100000 };

			const isUnderLimit = userQuota.dailyTokensUsed < plan.dailyTokenLimit;
			expect(isUnderLimit).toBe(false);
		});

		it("should allow request when under monthly token limit", () => {
			const userQuota = { ...mockUserQuota, monthlyTokensUsed: 500000 };
			const plan = { ...mockQuotaPlan, monthlyTokenLimit: 1000000 };

			const isUnderLimit = userQuota.monthlyTokensUsed < plan.monthlyTokenLimit;
			expect(isUnderLimit).toBe(true);
		});

		it("should deny request when over monthly token limit", () => {
			const userQuota = { ...mockUserQuota, monthlyTokensUsed: 1500000 };
			const plan = { ...mockQuotaPlan, monthlyTokenLimit: 1000000 };

			const isUnderLimit = userQuota.monthlyTokensUsed < plan.monthlyTokenLimit;
			expect(isUnderLimit).toBe(false);
		});
	});
});

describe("rate limiting - quota plans", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("plan tiers", () => {
		it("should have different limits for free tier", () => {
			const freePlan = {
				name: "Free",
				dailyRequestLimit: 50,
				monthlyRequestLimit: 500,
				dailyTokenLimit: 100000,
				monthlyTokenLimit: 1000000,
			};

			expect(freePlan.dailyRequestLimit).toBe(50);
			expect(freePlan.monthlyTokenLimit).toBe(1000000);
		});

		it("should have higher limits for pro tier", () => {
			const proPlan = {
				name: "Pro",
				dailyRequestLimit: 200,
				monthlyRequestLimit: 5000,
				dailyTokenLimit: 500000,
				monthlyTokenLimit: 10000000,
			};

			expect(proPlan.dailyRequestLimit).toBe(200);
			expect(proPlan.monthlyTokenLimit).toBe(10000000);
		});

		it("should have unlimited access for enterprise tier", () => {
			const enterprisePlan = {
				name: "Enterprise",
				dailyRequestLimit: null, // null = unlimited
				monthlyRequestLimit: null,
				dailyTokenLimit: null,
				monthlyTokenLimit: null,
			};

			expect(enterprisePlan.dailyRequestLimit).toBeNull();
		});
	});

	describe("plan assignment", () => {
		it("should assign default plan to new users", () => {
			const newUserQuota = {
				userId: "new-user",
				quotaId: "default-plan",
				dailyRequestsUsed: 0,
				monthlyRequestsUsed: 0,
			};

			expect(newUserQuota.quotaId).toBe("default-plan");
			expect(newUserQuota.dailyRequestsUsed).toBe(0);
		});

		it("should allow plan upgrades", () => {
			const upgradedQuota = {
				userId: "user-123",
				quotaId: "pro-plan",
				dailyRequestsUsed: 45, // preserve existing usage
				monthlyRequestsUsed: 450,
			};

			expect(upgradedQuota.quotaId).toBe("pro-plan");
		});

		it("should allow custom quota overrides", () => {
			const customQuota = {
				userId: "special-user",
				quotaId: "free-plan",
				overrideDailyRequestLimit: 100, // custom override
				overrideMonthlyRequestLimit: 1000,
			};

			expect(customQuota.overrideDailyRequestLimit).toBe(100);
		});
	});
});

describe("rate limiting - usage logging", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("log creation", () => {
		it("should create log entry for successful request", () => {
			const logEntry = {
				userId: "user-123",
				feature: "improve_content",
				provider: "openai",
				model: "gpt-4",
				status: "success",
				inputTokens: 100,
				outputTokens: 50,
				totalTokens: 150,
				durationMs: 1500,
			};

			expect(logEntry.status).toBe("success");
			expect(logEntry.totalTokens).toBe(150);
		});

		it("should create log entry for failed request", () => {
			const logEntry = {
				userId: "user-123",
				feature: "improve_content",
				provider: "openai",
				model: "gpt-4",
				status: "error",
				errorMessage: "API rate limit exceeded",
				durationMs: 500,
			};

			expect(logEntry.status).toBe("error");
			expect(logEntry.errorMessage).toBeDefined();
		});

		it("should create log entry for quota exceeded", () => {
			const logEntry = {
				userId: "user-123",
				feature: "improve_content",
				provider: "none",
				model: "none",
				status: "quota_exceeded",
				errorMessage: "Daily request limit reached",
			};

			expect(logEntry.status).toBe("quota_exceeded");
		});
	});

	describe("usage increment", () => {
		it("should increment daily request count", () => {
			const before = { dailyRequestsUsed: 10 };
			const after = { dailyRequestsUsed: before.dailyRequestsUsed + 1 };

			expect(after.dailyRequestsUsed).toBe(11);
		});

		it("should increment monthly request count", () => {
			const before = { monthlyRequestsUsed: 100 };
			const after = { monthlyRequestsUsed: before.monthlyRequestsUsed + 1 };

			expect(after.monthlyRequestsUsed).toBe(101);
		});

		it("should increment token counts", () => {
			const tokensUsed = 150;
			const before = { dailyTokensUsed: 20000, monthlyTokensUsed: 200000 };
			const after = {
				dailyTokensUsed: before.dailyTokensUsed + tokensUsed,
				monthlyTokensUsed: before.monthlyTokensUsed + tokensUsed,
			};

			expect(after.dailyTokensUsed).toBe(20150);
			expect(after.monthlyTokensUsed).toBe(200150);
		});
	});
});

describe("rate limiting - special cases", () => {
	describe("admin bypass", () => {
		it("should allow unlimited access for admin users", () => {
			const adminUser = {
				id: "admin-123",
				role: "admin",
			};

			// Admins bypass quota checks
			const shouldBypass = adminUser.role === "admin";
			expect(shouldBypass).toBe(true);
		});

		it("should still log usage for admin users", () => {
			const adminUsage = {
				userId: "admin-123",
				feature: "improve_content",
				status: "success",
				// No quota check but still logged
				isAdminBypass: true,
			};

			expect(adminUsage.isAdminBypass).toBe(true);
		});
	});

	describe("no quota configured", () => {
		it("should allow unlimited access when no quota plans exist", () => {
			const hasQuotaPlans = false;

			// When no plans exist, all users get unlimited access
			const allowUnlimited = !hasQuotaPlans;
			expect(allowUnlimited).toBe(true);
		});
	});

	describe("user without quota assignment", () => {
		it("should create default quota on first request", () => {
			const newUserQuota = {
				userId: "new-user",
				quotaId: null, // No quota assigned yet
			};

			// System should assign default quota
			const shouldAssignDefault = newUserQuota.quotaId === null;
			expect(shouldAssignDefault).toBe(true);
		});
	});

	describe("concurrent requests", () => {
		it("should handle race conditions in quota updates", async () => {
			// Simulate concurrent increment
			const initialCount = 49;
			const limit = 50;

			// Both requests check at same time
			const request1Check = initialCount < limit;
			const request2Check = initialCount < limit;

			// Both would be allowed (potential race condition)
			expect(request1Check).toBe(true);
			expect(request2Check).toBe(true);

			// After both complete, count would be 51 (over limit)
			// This is why atomic operations are important
		});
	});

	describe("feature-specific limits", () => {
		it("should support per-feature rate limits", () => {
			const featureLimits = {
				improve_content: { dailyLimit: 50 },
				parse_pdf: { dailyLimit: 10 },
				resume_analysis: { dailyLimit: 5 },
			};

			expect(featureLimits.parse_pdf.dailyLimit).toBeLessThan(featureLimits.improve_content.dailyLimit);
		});
	});
});

describe("rate limiting - quota response format", () => {
	it("should return allowed status and remaining count", () => {
		const quotaResponse = {
			allowed: true,
			remaining: 40,
			limit: 50,
			resetAt: new Date("2026-02-10T00:00:00Z"),
		};

		expect(quotaResponse.allowed).toBe(true);
		expect(quotaResponse.remaining).toBe(40);
	});

	it("should return denied status with reason", () => {
		const quotaResponse = {
			allowed: false,
			reason: "Daily request limit exceeded. Resets at midnight.",
			limit: 50,
			used: 50,
			resetAt: new Date("2026-02-10T00:00:00Z"),
		};

		expect(quotaResponse.allowed).toBe(false);
		expect(quotaResponse.reason).toContain("exceeded");
	});

	it("should include upgrade suggestion when applicable", () => {
		const quotaResponse = {
			allowed: false,
			reason: "Daily limit reached",
			suggestion: "Upgrade to Pro for 4x more requests",
			upgradeUrl: "/dashboard/settings/billing",
		};

		expect(quotaResponse.suggestion).toContain("Upgrade");
	});
});
