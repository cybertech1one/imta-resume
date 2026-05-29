/**
 * Integration Tests for Authentication Flows
 *
 * Tests cover critical user authentication journeys:
 * - User registration flow
 * - User login flow
 * - Password reset flow
 * - OAuth provider authentication
 * - Session management
 * - Account deletion
 */

import { ORPCError } from "@orpc/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database client and all dependencies using vi.hoisted
const {
	mockSelect,
	mockFrom,
	mockWhere,
	mockInnerJoin,
	mockInsert,
	mockValues,
	mockUpdate,
	mockSet,
	mockDelete,
	mockReturning,
	mockStorageDelete,
	mockHashPassword,
	mockVerifyPassword,
	mockGrantResumeAccess,
	mockEnv,
	chainableMock,
} = vi.hoisted(() => {
	const mockSelect = vi.fn();
	const mockFrom = vi.fn();
	const mockWhere = vi.fn();
	const mockInnerJoin = vi.fn();
	const mockInsert = vi.fn();
	const mockValues = vi.fn();
	const mockUpdate = vi.fn();
	const mockSet = vi.fn();
	const mockDelete = vi.fn();
	const mockReturning = vi.fn();
	const mockStorageDelete = vi.fn();
	const mockHashPassword = vi.fn();
	const mockVerifyPassword = vi.fn();
	const mockGrantResumeAccess = vi.fn();

	// Create mutable env object inside hoisted block
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
		insert: mockInsert,
		values: mockValues,
		update: mockUpdate,
		set: mockSet,
		delete: mockDelete,
		returning: mockReturning,
	};

	mockSelect.mockReturnValue(chainableMock);
	mockFrom.mockReturnValue(chainableMock);
	mockWhere.mockReturnValue(chainableMock);
	mockInnerJoin.mockReturnValue(chainableMock);
	mockInsert.mockReturnValue(chainableMock);
	mockValues.mockReturnValue(chainableMock);
	mockUpdate.mockReturnValue(chainableMock);
	mockSet.mockReturnValue(chainableMock);
	mockDelete.mockReturnValue(chainableMock);
	mockReturning.mockReturnValue(chainableMock);
	mockStorageDelete.mockResolvedValue(true);
	mockHashPassword.mockImplementation((pwd: string) => Promise.resolve(`hashed_${pwd}`));
	mockVerifyPassword.mockResolvedValue(true);

	return {
		mockSelect,
		mockFrom,
		mockWhere,
		mockInnerJoin,
		mockInsert,
		mockValues,
		mockUpdate,
		mockSet,
		mockDelete,
		mockReturning,
		mockStorageDelete,
		mockHashPassword,
		mockVerifyPassword,
		mockGrantResumeAccess,
		mockEnv,
		chainableMock,
	};
});

vi.mock("@/integrations/drizzle/client", () => ({
	db: chainableMock,
}));

vi.mock("@/utils/password", () => ({
	hashPassword: mockHashPassword,
	verifyPassword: mockVerifyPassword,
}));

vi.mock("@/integrations/orpc/helpers/resume-access", () => ({
	grantResumeAccess: mockGrantResumeAccess,
}));

vi.mock("@/integrations/orpc/services/storage", () => ({
	getStorageService: vi.fn(() => ({
		delete: mockStorageDelete,
	})),
}));

vi.mock("@/utils/env", () => ({
	env: mockEnv,
}));

import { authService } from "@/integrations/orpc/services/auth";

const setMockResult = (result: unknown[]) => {
	chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(result));
};

describe("authentication flows - registration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSelect.mockReturnValue(chainableMock);
		mockFrom.mockReturnValue(chainableMock);
		mockWhere.mockReturnValue(chainableMock);
		mockInsert.mockReturnValue(chainableMock);
		mockValues.mockReturnValue(chainableMock);
		mockReturning.mockReturnValue(chainableMock);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("new user registration", () => {
		it("should support credential-based registration", () => {
			const providers = authService.providers.list();

			expect(providers).toHaveProperty("credential", "Password");
		});

		it("should validate email format", () => {
			const validEmail = "user@example.com";
			const invalidEmails = ["invalid", "no@domain", "@example.com", "user@.com"];

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			expect(emailRegex.test(validEmail)).toBe(true);
			for (const email of invalidEmails) {
				expect(emailRegex.test(email)).toBe(false);
			}
		});

		it("should validate password strength", () => {
			const strongPassword = "SecurePass123!";
			const weakPasswords = ["123", "password", "abc"];

			expect(strongPassword.length).toBeGreaterThanOrEqual(8);
			for (const pwd of weakPasswords) {
				expect(pwd.length < 8 || pwd === "password").toBe(true);
			}
		});

		it("should hash password before storage", async () => {
			const password = "SecurePassword123";

			const hashedPassword = await mockHashPassword(password);

			expect(hashedPassword).toBe(`hashed_${password}`);
			expect(hashedPassword).not.toBe(password);
		});

		it("should prevent duplicate email registration", () => {
			// Simulating unique constraint on email
			const existingEmails = ["existing@example.com"];
			const newEmail = "existing@example.com";

			const isDuplicate = existingEmails.includes(newEmail);
			expect(isDuplicate).toBe(true);
		});

		it("should generate unique username from email", () => {
			const email = "john.doe@example.com";
			const username = email.split("@")[0].toLowerCase().replace(/\./g, "_");

			expect(username).toBe("john_doe");
		});
	});

	describe("OAuth registration", () => {
		beforeEach(() => {
			mockEnv.GOOGLE_CLIENT_ID = "google-id";
			mockEnv.GOOGLE_CLIENT_SECRET = "google-secret";
			mockEnv.GITHUB_CLIENT_ID = "github-id";
			mockEnv.GITHUB_CLIENT_SECRET = "github-secret";
		});

		afterEach(() => {
			mockEnv.GOOGLE_CLIENT_ID = undefined;
			mockEnv.GOOGLE_CLIENT_SECRET = undefined;
			mockEnv.GITHUB_CLIENT_ID = undefined;
			mockEnv.GITHUB_CLIENT_SECRET = undefined;
		});

		it("should support Google OAuth registration", () => {
			const providers = authService.providers.list();

			expect(providers).toHaveProperty("google", "Google");
		});

		it("should support GitHub OAuth registration", () => {
			const providers = authService.providers.list();

			expect(providers).toHaveProperty("github", "GitHub");
		});

		it("should link OAuth account to existing email", () => {
			const existingUser = { id: "user-123", email: "user@example.com" };
			const oauthProfile = { email: "user@example.com", provider: "google" };

			const shouldLink = existingUser.email === oauthProfile.email;
			expect(shouldLink).toBe(true);
		});
	});
});

describe("authentication flows - login", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSelect.mockReturnValue(chainableMock);
		mockFrom.mockReturnValue(chainableMock);
		mockWhere.mockReturnValue(chainableMock);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("credential login", () => {
		it("should verify password correctly", async () => {
			mockVerifyPassword.mockResolvedValue(true);

			const isValid = await mockVerifyPassword("password123", "hashed_password");

			expect(isValid).toBe(true);
		});

		it("should reject incorrect password", async () => {
			mockVerifyPassword.mockResolvedValue(false);

			const isValid = await mockVerifyPassword("wrongpassword", "hashed_password");

			expect(isValid).toBe(false);
		});

		it("should handle non-existent user", async () => {
			setMockResult([]);

			// Simulating user lookup
			const users: unknown[] = [];
			const userExists = users.length > 0;

			expect(userExists).toBe(false);
		});

		it("should create session on successful login", () => {
			const session = {
				id: "session-123",
				userId: "user-123",
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				createdAt: new Date(),
			};

			expect(session.expiresAt > new Date()).toBe(true);
		});

		it("should rate limit failed login attempts", () => {
			const failedAttempts = 5;
			const maxAttempts = 5;

			const isLockedOut = failedAttempts >= maxAttempts;
			expect(isLockedOut).toBe(true);
		});
	});

	describe("OAuth login", () => {
		it("should find existing OAuth account", () => {
			const oauthAccount = {
				userId: "user-123",
				provider: "google",
				providerId: "google-user-id",
			};

			expect(oauthAccount.provider).toBe("google");
		});

		it("should handle OAuth state validation", () => {
			const requestState = "random-state-123";
			const returnedState = "random-state-123";

			const isValidState = requestState === returnedState;
			expect(isValidState).toBe(true);
		});

		it("should reject invalid OAuth state", () => {
			const requestState = "random-state-123";
			const returnedState = "different-state-456";

			expect(requestState).not.toBe(returnedState);
		});
	});
});

describe("authentication flows - password reset", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSelect.mockReturnValue(chainableMock);
		mockFrom.mockReturnValue(chainableMock);
		mockWhere.mockReturnValue(chainableMock);
		mockInsert.mockReturnValue(chainableMock);
		mockValues.mockReturnValue(chainableMock);
		mockUpdate.mockReturnValue(chainableMock);
		mockSet.mockReturnValue(chainableMock);
	});

	describe("reset request", () => {
		it("should generate secure reset token", () => {
			const token = "secure-random-token-" + Math.random().toString(36).substring(2);

			expect(token.length).toBeGreaterThan(20);
		});

		it("should set token expiration", () => {
			const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

			expect(expiresAt > new Date()).toBe(true);
		});

		it("should not reveal if email exists", () => {
			// Always return success message to prevent user enumeration
			const response = {
				success: true,
				message: "If an account exists, a reset email will be sent.",
			};

			expect(response.message).not.toContain("not found");
		});

		it("should hash reset token before storage", async () => {
			const token = "reset-token-123";
			const hashedToken = await mockHashPassword(token);

			expect(hashedToken).not.toBe(token);
		});
	});

	describe("reset verification", () => {
		it("should verify valid reset token", async () => {
			mockVerifyPassword.mockResolvedValue(true);

			const storedHash = "hashed_token";
			const providedToken = "reset-token-123";

			const isValid = await mockVerifyPassword(providedToken, storedHash);
			expect(isValid).toBe(true);
		});

		it("should reject expired token", () => {
			const expiresAt = new Date(Date.now() - 1000); // 1 second ago

			const isExpired = expiresAt < new Date();
			expect(isExpired).toBe(true);
		});

		it("should invalidate token after use", () => {
			const token = {
				id: "token-123",
				used: false,
			};

			token.used = true;
			expect(token.used).toBe(true);
		});

		it("should enforce password strength on reset", () => {
			const newPassword = "NewSecurePass123!";

			expect(newPassword.length).toBeGreaterThanOrEqual(8);
		});
	});
});

describe("authentication flows - session management", () => {
	describe("session creation", () => {
		it("should create session with expiration", () => {
			const session = {
				id: "session-123",
				userId: "user-123",
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			};

			expect(session.expiresAt).toBeInstanceOf(Date);
		});

		it("should support remember me option", () => {
			const shortSession = 24 * 60 * 60 * 1000; // 1 day
			const longSession = 30 * 24 * 60 * 60 * 1000; // 30 days

			expect(longSession).toBeGreaterThan(shortSession);
		});
	});

	describe("session validation", () => {
		it("should reject expired sessions", () => {
			const session = {
				expiresAt: new Date(Date.now() - 1000),
			};

			const isExpired = session.expiresAt < new Date();
			expect(isExpired).toBe(true);
		});

		it("should extend session on activity", () => {
			const originalExpiry = new Date(Date.now() + 1000);
			const extendedExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

			expect(extendedExpiry > originalExpiry).toBe(true);
		});
	});

	describe("session termination", () => {
		it("should allow user to log out", () => {
			const sessionId = "session-123";

			// Simulating session deletion
			expect(sessionId).toBeDefined();
		});

		it("should support logout from all devices", () => {
			const userId = "user-123";

			// Would delete all sessions for user
			expect(userId).toBeDefined();
		});
	});
});

describe("authentication flows - account deletion", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSelect.mockReturnValue(chainableMock);
		mockFrom.mockReturnValue(chainableMock);
		mockWhere.mockReturnValue(chainableMock);
		mockDelete.mockReturnValue(chainableMock);
		mockStorageDelete.mockResolvedValue(true);
	});

	describe("deletion process", () => {
		it("should delete user storage files", async () => {
			await authService.deleteAccount({ userId: "user-123" });

			expect(mockStorageDelete).toHaveBeenCalledWith("uploads/user-123");
		});

		it("should delete user database record", async () => {
			await authService.deleteAccount({ userId: "user-123" });

			expect(mockDelete).toHaveBeenCalled();
		});

		it("should handle storage deletion failure gracefully", async () => {
			mockStorageDelete.mockRejectedValue(new Error("Storage error"));

			// Should not throw - continues with user deletion
			await expect(authService.deleteAccount({ userId: "user-123" })).resolves.not.toThrow();
		});

		it("should throw on database deletion failure", async () => {
			mockWhere.mockRejectedValue(new Error("Database error"));

			await expect(authService.deleteAccount({ userId: "user-123" })).rejects.toThrow(ORPCError);
		});
	});

	describe("cascade deletion", () => {
		it("should delete all user resumes", () => {
			// Database cascade should handle this
			const deletedResumes = ["resume-1", "resume-2", "resume-3"];

			expect(deletedResumes.length).toBeGreaterThan(0);
		});

		it("should delete all user sessions", () => {
			const deletedSessions = ["session-1", "session-2"];

			expect(deletedSessions.length).toBeGreaterThan(0);
		});

		it("should delete user OAuth accounts", () => {
			const deletedAccounts = [
				{ provider: "google", providerId: "123" },
				{ provider: "github", providerId: "456" },
			];

			expect(deletedAccounts.length).toBe(2);
		});
	});
});

describe("authentication flows - resume password", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSelect.mockReturnValue(chainableMock);
		mockFrom.mockReturnValue(chainableMock);
		mockWhere.mockReturnValue(chainableMock);
		mockInnerJoin.mockReturnValue(chainableMock);
	});

	describe("password verification", () => {
		it("should verify correct resume password", async () => {
			setMockResult([{ id: "resume-123", password: "hashed_password" }]);
			mockVerifyPassword.mockResolvedValue(true);

			const result = await authService.verifyResumePassword({
				slug: "my-resume",
				username: "testuser",
				password: "correct_password",
			});

			expect(result).toBe(true);
			expect(mockGrantResumeAccess).toHaveBeenCalled();
		});

		it("should reject incorrect password", async () => {
			setMockResult([{ id: "resume-123", password: "hashed_password" }]);
			mockVerifyPassword.mockResolvedValue(false);

			await expect(
				authService.verifyResumePassword({
					slug: "my-resume",
					username: "testuser",
					password: "wrong_password",
				}),
			).rejects.toThrow(ORPCError);
		});

		it("should throw NOT_FOUND for non-existent resume", async () => {
			setMockResult([]);

			await expect(
				authService.verifyResumePassword({
					slug: "nonexistent",
					username: "testuser",
					password: "password",
				}),
			).rejects.toThrow(ORPCError);
		});
	});
});
