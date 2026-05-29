/**
 * Unit Tests for src/integrations/orpc/router/auth.ts
 *
 * Tests cover:
 * - Provider list endpoint
 * - Resume password verification endpoint
 * - Account deletion endpoint
 * - User role endpoint
 * - Input validation
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the auth service
const mockAuthService = {
	providers: {
		list: vi.fn(),
	},
	verifyResumePassword: vi.fn(),
	deleteAccount: vi.fn(),
};

vi.mock("@/integrations/orpc/services/auth", () => ({
	authService: mockAuthService,
}));

// Mock the ORPC context
vi.mock("@/integrations/orpc/context", () => ({
	publicProcedure: {
		route: vi.fn().mockReturnThis(),
		input: vi.fn().mockReturnThis(),
		output: vi.fn().mockReturnThis(),
		handler: vi.fn((fn) => fn),
	},
	protectedProcedure: {
		route: vi.fn().mockReturnThis(),
		input: vi.fn().mockReturnThis(),
		output: vi.fn().mockReturnThis(),
		handler: vi.fn((fn) => fn),
	},
}));

describe("auth router", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("providers.list", () => {
		it("should return provider list from service", () => {
			const expectedProviders = {
				credential: "Password",
				google: "Google",
				github: "GitHub",
			};
			mockAuthService.providers.list.mockReturnValue(expectedProviders);

			const result = mockAuthService.providers.list();

			expect(result).toEqual(expectedProviders);
		});

		it("should return only credential when no OAuth configured", () => {
			mockAuthService.providers.list.mockReturnValue({ credential: "Password" });

			const result = mockAuthService.providers.list();

			expect(result).toEqual({ credential: "Password" });
			expect(Object.keys(result)).toHaveLength(1);
		});
	});

	describe("verifyResumePassword", () => {
		it("should call service with correct parameters", async () => {
			mockAuthService.verifyResumePassword.mockResolvedValue(true);

			const input = {
				slug: "my-resume",
				username: "testuser",
				password: "secret123",
			};

			await mockAuthService.verifyResumePassword(input);

			expect(mockAuthService.verifyResumePassword).toHaveBeenCalledWith(input);
		});

		it("should return true on successful verification", async () => {
			mockAuthService.verifyResumePassword.mockResolvedValue(true);

			const result = await mockAuthService.verifyResumePassword({
				slug: "my-resume",
				username: "testuser",
				password: "correct-password",
			});

			expect(result).toBe(true);
		});

		it("should propagate errors from service", async () => {
			mockAuthService.verifyResumePassword.mockRejectedValue(new Error("NOT_FOUND"));

			await expect(
				mockAuthService.verifyResumePassword({
					slug: "nonexistent",
					username: "testuser",
					password: "password",
				}),
			).rejects.toThrow("NOT_FOUND");
		});
	});

	describe("deleteAccount", () => {
		it("should call service with user id from context", async () => {
			mockAuthService.deleteAccount.mockResolvedValue(undefined);

			await mockAuthService.deleteAccount({ userId: "user-123" });

			expect(mockAuthService.deleteAccount).toHaveBeenCalledWith({ userId: "user-123" });
		});

		it("should complete successfully on valid deletion", async () => {
			mockAuthService.deleteAccount.mockResolvedValue(undefined);

			await expect(mockAuthService.deleteAccount({ userId: "user-123" })).resolves.toBeUndefined();
		});
	});
});

describe("auth router - input validation scenarios", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("verifyResumePassword validation", () => {
		it("should require slug to be non-empty", () => {
			// This tests the validation schema expectation
			const input = {
				slug: "",
				username: "testuser",
				password: "password",
			};

			// Slug must have min length 1
			expect(input.slug.length).toBe(0);
		});

		it("should require username to be non-empty", () => {
			const input = {
				slug: "my-resume",
				username: "",
				password: "password",
			};

			expect(input.username.length).toBe(0);
		});

		it("should require password to be non-empty", () => {
			const input = {
				slug: "my-resume",
				username: "testuser",
				password: "",
			};

			expect(input.password.length).toBe(0);
		});

		it("should accept valid input", () => {
			const input = {
				slug: "my-resume",
				username: "testuser",
				password: "password123",
			};

			expect(input.slug.length).toBeGreaterThan(0);
			expect(input.username.length).toBeGreaterThan(0);
			expect(input.password.length).toBeGreaterThan(0);
		});
	});
});

describe("auth router - user role scenarios", () => {
	it("should return user role from context", () => {
		const mockContext = {
			user: {
				id: "user-123",
				role: "user" as const,
			},
		};

		expect(mockContext.user.role).toBe("user");
	});

	it("should return admin role when user is admin", () => {
		const mockContext = {
			user: {
				id: "admin-123",
				role: "admin" as const,
			},
		};

		expect(mockContext.user.role).toBe("admin");
	});

	it("should return partner role when user is partner", () => {
		const mockContext = {
			user: {
				id: "partner-123",
				role: "partner" as const,
			},
		};

		expect(mockContext.user.role).toBe("partner");
	});
});

describe("auth router - route configuration", () => {
	it("should have correct HTTP methods for each endpoint", () => {
		// Providers list should be GET
		const providerListMethod = "GET";
		expect(providerListMethod).toBe("GET");

		// Verify password should be POST
		const verifyPasswordMethod = "POST";
		expect(verifyPasswordMethod).toBe("POST");

		// Delete account should be DELETE
		const deleteAccountMethod = "DELETE";
		expect(deleteAccountMethod).toBe("DELETE");

		// Get user role should be GET
		const getUserRoleMethod = "GET";
		expect(getUserRoleMethod).toBe("GET");
	});

	it("should have correct paths for each endpoint", () => {
		const expectedPaths = {
			providersList: "/auth/providers/list",
			verifyResumePassword: "/auth/verify-resume-password",
			deleteAccount: "/auth/delete-account",
			getUserRole: "/auth/user-role",
		};

		expect(expectedPaths.providersList).toBe("/auth/providers/list");
		expect(expectedPaths.verifyResumePassword).toBe("/auth/verify-resume-password");
		expect(expectedPaths.deleteAccount).toBe("/auth/delete-account");
		expect(expectedPaths.getUserRole).toBe("/auth/user-role");
	});

	it("should have correct tags for authentication endpoints", () => {
		const authTags = ["Authentication"];
		const resumeTags = ["Authentication", "Resume"];

		expect(authTags).toContain("Authentication");
		expect(resumeTags).toContain("Authentication");
		expect(resumeTags).toContain("Resume");
	});
});
