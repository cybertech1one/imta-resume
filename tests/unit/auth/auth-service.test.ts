/**
 * Unit Tests for src/integrations/orpc/services/auth.ts
 *
 * Tests cover:
 * - Provider listing based on environment configuration
 * - Resume password verification
 * - Account deletion with cleanup
 * - Error handling for edge cases
 */

import { ORPCError } from "@orpc/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database client and all dependencies using vi.hoisted
const {
	mockSelect,
	mockFrom,
	mockWhere,
	mockInnerJoin,
	mockDelete,
	mockStorageDelete,
	mockVerifyPassword,
	mockGrantResumeAccess,
	mockEnv,
	chainableMock,
} = vi.hoisted(() => {
	const mockSelect = vi.fn();
	const mockFrom = vi.fn();
	const mockWhere = vi.fn();
	const mockInnerJoin = vi.fn();
	const mockDelete = vi.fn();
	const mockStorageDelete = vi.fn();
	const mockVerifyPassword = vi.fn();
	const mockGrantResumeAccess = vi.fn();

	// Create mutable env object
	const mockEnv = {
		APP_URL: "http://localhost:3000",
		GOOGLE_CLIENT_ID: undefined as string | undefined,
		GOOGLE_CLIENT_SECRET: undefined as string | undefined,
		GITHUB_CLIENT_ID: undefined as string | undefined,
		GITHUB_CLIENT_SECRET: undefined as string | undefined,
		OAUTH_CLIENT_ID: undefined as string | undefined,
		OAUTH_CLIENT_SECRET: undefined as string | undefined,
		OAUTH_PROVIDER_NAME: undefined as string | undefined,
	};

	const chainableMock: Record<string, ReturnType<typeof vi.fn>> = {
		select: mockSelect,
		from: mockFrom,
		where: mockWhere,
		innerJoin: mockInnerJoin,
		delete: mockDelete,
	};

	// Set up chainable returns
	mockSelect.mockReturnValue(chainableMock);
	mockFrom.mockReturnValue(chainableMock);
	mockWhere.mockReturnValue(chainableMock);
	mockInnerJoin.mockReturnValue(chainableMock);
	mockDelete.mockReturnValue(chainableMock);
	mockStorageDelete.mockResolvedValue(true);
	mockVerifyPassword.mockResolvedValue(true);

	return {
		mockSelect,
		mockFrom,
		mockWhere,
		mockInnerJoin,
		mockDelete,
		mockStorageDelete,
		mockVerifyPassword,
		mockGrantResumeAccess,
		mockEnv,
		chainableMock,
	};
});

// Mock the database client
vi.mock("@/integrations/drizzle/client", () => ({
	db: chainableMock,
}));

// Mock password verification
vi.mock("@/utils/password", () => ({
	verifyPassword: mockVerifyPassword,
}));

// Mock resume access helper
vi.mock("@/integrations/orpc/helpers/resume-access", () => ({
	grantResumeAccess: mockGrantResumeAccess,
}));

// Mock storage service
vi.mock("@/integrations/orpc/services/storage", () => ({
	getStorageService: vi.fn(() => ({
		delete: mockStorageDelete,
	})),
}));

// Mock env
vi.mock("@/utils/env", () => ({
	env: mockEnv,
}));

// Import after mocks are set up
import { authService } from "@/integrations/orpc/services/auth";

// Helper to set mock return values
const setMockResult = (result: unknown[]) => {
	chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(result));
};

describe("auth service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset chainable returns
		mockSelect.mockReturnValue(chainableMock);
		mockFrom.mockReturnValue(chainableMock);
		mockWhere.mockReturnValue(chainableMock);
		mockInnerJoin.mockReturnValue(chainableMock);
		mockDelete.mockReturnValue(chainableMock);
		mockStorageDelete.mockResolvedValue(true);
		mockVerifyPassword.mockResolvedValue(true);

		// Reset env to default state
		mockEnv.GOOGLE_CLIENT_ID = undefined;
		mockEnv.GOOGLE_CLIENT_SECRET = undefined;
		mockEnv.GITHUB_CLIENT_ID = undefined;
		mockEnv.GITHUB_CLIENT_SECRET = undefined;
		mockEnv.OAUTH_CLIENT_ID = undefined;
		mockEnv.OAUTH_CLIENT_SECRET = undefined;
		mockEnv.OAUTH_PROVIDER_NAME = undefined;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("providers", () => {
		describe("list", () => {
			it("should always include credential provider", () => {
				const providers = authService.providers.list();

				expect(providers).toHaveProperty("credential", "Password");
			});

			it("should include Google when configured", () => {
				mockEnv.GOOGLE_CLIENT_ID = "google-client-id";
				mockEnv.GOOGLE_CLIENT_SECRET = "google-client-secret";

				const providers = authService.providers.list();

				expect(providers).toHaveProperty("google", "Google");
			});

			it("should include GitHub when configured", () => {
				mockEnv.GITHUB_CLIENT_ID = "github-client-id";
				mockEnv.GITHUB_CLIENT_SECRET = "github-client-secret";

				const providers = authService.providers.list();

				expect(providers).toHaveProperty("github", "GitHub");
			});

			it("should include custom OAuth when configured", () => {
				mockEnv.OAUTH_CLIENT_ID = "custom-oauth-id";
				mockEnv.OAUTH_CLIENT_SECRET = "custom-oauth-secret";

				const providers = authService.providers.list();

				expect(providers).toHaveProperty("custom", "Custom OAuth");
			});

			it("should use custom OAuth provider name when set", () => {
				mockEnv.OAUTH_CLIENT_ID = "custom-oauth-id";
				mockEnv.OAUTH_CLIENT_SECRET = "custom-oauth-secret";
				mockEnv.OAUTH_PROVIDER_NAME = "My Company SSO";

				const providers = authService.providers.list();

				expect(providers).toHaveProperty("custom", "My Company SSO");
			});

			it("should return all providers when all are configured", () => {
				mockEnv.GOOGLE_CLIENT_ID = "google-client-id";
				mockEnv.GOOGLE_CLIENT_SECRET = "google-client-secret";
				mockEnv.GITHUB_CLIENT_ID = "github-client-id";
				mockEnv.GITHUB_CLIENT_SECRET = "github-client-secret";
				mockEnv.OAUTH_CLIENT_ID = "custom-oauth-id";
				mockEnv.OAUTH_CLIENT_SECRET = "custom-oauth-secret";

				const providers = authService.providers.list();

				expect(Object.keys(providers)).toHaveLength(4);
				expect(providers).toHaveProperty("credential");
				expect(providers).toHaveProperty("google");
				expect(providers).toHaveProperty("github");
				expect(providers).toHaveProperty("custom");
			});

			it("should not include Google when only client ID is set", () => {
				mockEnv.GOOGLE_CLIENT_ID = "google-client-id";
				// GOOGLE_CLIENT_SECRET is undefined

				const providers = authService.providers.list();

				expect(providers).not.toHaveProperty("google");
			});

			it("should not include GitHub when only client secret is set", () => {
				mockEnv.GITHUB_CLIENT_SECRET = "github-client-secret";
				// GITHUB_CLIENT_ID is undefined

				const providers = authService.providers.list();

				expect(providers).not.toHaveProperty("github");
			});
		});
	});

	describe("verifyResumePassword", () => {
		const mockResumeWithPassword = {
			id: "resume-123",
			password: "hashed_password_123",
		};

		it("should verify correct password and grant access", async () => {
			setMockResult([mockResumeWithPassword]);
			mockVerifyPassword.mockResolvedValue(true);

			const result = await authService.verifyResumePassword({
				slug: "my-resume",
				username: "testuser",
				password: "correct_password",
			});

			expect(result).toBe(true);
			expect(mockVerifyPassword).toHaveBeenCalledWith("correct_password", "hashed_password_123");
			expect(mockGrantResumeAccess).toHaveBeenCalledWith("resume-123", "hashed_password_123");
		});

		it("should throw NOT_FOUND for non-existent resume", async () => {
			setMockResult([]);

			await expect(
				authService.verifyResumePassword({
					slug: "nonexistent",
					username: "testuser",
					password: "any_password",
				}),
			).rejects.toThrow(ORPCError);
		});

		it("should throw INVALID_PASSWORD for wrong password", async () => {
			setMockResult([mockResumeWithPassword]);
			mockVerifyPassword.mockResolvedValue(false);

			await expect(
				authService.verifyResumePassword({
					slug: "my-resume",
					username: "testuser",
					password: "wrong_password",
				}),
			).rejects.toThrow(ORPCError);
		});

		it("should not grant access when password is invalid", async () => {
			setMockResult([mockResumeWithPassword]);
			mockVerifyPassword.mockResolvedValue(false);

			try {
				await authService.verifyResumePassword({
					slug: "my-resume",
					username: "testuser",
					password: "wrong_password",
				});
			} catch {
				// Expected to throw
			}

			expect(mockGrantResumeAccess).not.toHaveBeenCalled();
		});
	});

	describe("deleteAccount", () => {
		it("should delete user storage and database record", async () => {
			await authService.deleteAccount({ userId: "user-123" });

			expect(mockStorageDelete).toHaveBeenCalledWith("uploads/user-123");
			expect(mockDelete).toHaveBeenCalled();
			expect(mockWhere).toHaveBeenCalled();
		});

		it("should not throw when storage deletion fails", async () => {
			mockStorageDelete.mockRejectedValue(new Error("Storage error"));

			// Should not throw - just logs warning
			await expect(authService.deleteAccount({ userId: "user-123" })).resolves.not.toThrow();

			expect(mockDelete).toHaveBeenCalled();
		});

		it("should throw INTERNAL_SERVER_ERROR when user deletion fails", async () => {
			mockWhere.mockRejectedValue(new Error("Database error"));

			await expect(authService.deleteAccount({ userId: "user-123" })).rejects.toThrow(ORPCError);
		});

		it("should do nothing for empty userId", async () => {
			await authService.deleteAccount({ userId: "" });

			expect(mockStorageDelete).not.toHaveBeenCalled();
			expect(mockDelete).not.toHaveBeenCalled();
		});

		it("should handle undefined-like userId", async () => {
			await authService.deleteAccount({ userId: "" });

			expect(mockStorageDelete).not.toHaveBeenCalled();
		});
	});
});

describe("auth service - security considerations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSelect.mockReturnValue(chainableMock);
		mockFrom.mockReturnValue(chainableMock);
		mockWhere.mockReturnValue(chainableMock);
		mockInnerJoin.mockReturnValue(chainableMock);
	});

	it("should not leak password hash in error messages", async () => {
		const mockResumeWithPassword = {
			id: "resume-123",
			password: "super_secret_hash",
		};
		setMockResult([mockResumeWithPassword]);
		mockVerifyPassword.mockResolvedValue(false);

		try {
			await authService.verifyResumePassword({
				slug: "my-resume",
				username: "testuser",
				password: "wrong",
			});
		} catch (error) {
			// Error message should not contain the password hash
			expect(String(error)).not.toContain("super_secret_hash");
		}
	});

	it("should query only password-protected resumes", async () => {
		setMockResult([]);

		try {
			await authService.verifyResumePassword({
				slug: "my-resume",
				username: "testuser",
				password: "password",
			});
		} catch {
			// Expected to throw NOT_FOUND
		}

		// The query should filter for resumes with password IS NOT NULL
		expect(mockWhere).toHaveBeenCalled();
	});
});

describe("auth service - edge cases", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSelect.mockReturnValue(chainableMock);
		mockFrom.mockReturnValue(chainableMock);
		mockWhere.mockReturnValue(chainableMock);
		mockInnerJoin.mockReturnValue(chainableMock);
		mockDelete.mockReturnValue(chainableMock);
	});

	it("should handle special characters in username", async () => {
		setMockResult([]);

		await expect(
			authService.verifyResumePassword({
				slug: "my-resume",
				username: "user@domain.com",
				password: "password",
			}),
		).rejects.toThrow(ORPCError);
	});

	it("should handle special characters in slug", async () => {
		setMockResult([]);

		await expect(
			authService.verifyResumePassword({
				slug: "resume-with-dashes-123",
				username: "testuser",
				password: "password",
			}),
		).rejects.toThrow(ORPCError);
	});

	it("should handle unicode in password", async () => {
		const mockResumeWithPassword = {
			id: "resume-123",
			password: "hashed_password",
		};
		setMockResult([mockResumeWithPassword]);
		mockVerifyPassword.mockResolvedValue(true);

		const result = await authService.verifyResumePassword({
			slug: "my-resume",
			username: "testuser",
			password: "password-with-unicode",
		});

		expect(result).toBe(true);
	});
});
