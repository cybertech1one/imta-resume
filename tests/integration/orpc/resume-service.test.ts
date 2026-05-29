/**
 * Integration Tests for src/integrations/orpc/services/resume.ts
 *
 * These tests use mocked database client to test the resume service logic.
 * For true integration tests with real database, use testcontainers.
 *
 * Tests cover:
 * - Resume CRUD operations
 * - Tags management
 * - Statistics tracking
 * - Access control
 * - Slug uniqueness
 */

import { ORPCError } from "@orpc/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database client - using vi.hoisted to create values that can be used in mocks
const {
	mockSelect,
	mockFrom,
	mockWhere,
	mockOrderBy,
	mockInnerJoin,
	mockRightJoin,
	mockInsert,
	mockValues,
	mockUpdate,
	mockSet,
	mockDelete,
	mockOnConflictDoUpdate,
	mockReturning,
	mockHasResumeAccess,
	mockStorageDelete,
	chainableMock,
} = vi.hoisted(() => {
	const mockSelect = vi.fn();
	const mockFrom = vi.fn();
	const mockWhere = vi.fn();
	const mockOrderBy = vi.fn();
	const mockInnerJoin = vi.fn();
	const mockRightJoin = vi.fn();
	const mockInsert = vi.fn();
	const mockValues = vi.fn();
	const mockUpdate = vi.fn();
	const mockSet = vi.fn();
	const mockDelete = vi.fn();
	const mockOnConflictDoUpdate = vi.fn();
	const mockReturning = vi.fn();
	const mockHasResumeAccess = vi.fn();
	const mockStorageDelete = vi.fn();

	const chainableMock: Record<string, ReturnType<typeof vi.fn>> = {
		select: mockSelect,
		from: mockFrom,
		where: mockWhere,
		orderBy: mockOrderBy,
		innerJoin: mockInnerJoin,
		rightJoin: mockRightJoin,
		insert: mockInsert,
		values: mockValues,
		update: mockUpdate,
		set: mockSet,
		delete: mockDelete,
		onConflictDoUpdate: mockOnConflictDoUpdate,
		returning: mockReturning,
	};

	// Set up chainable returns
	mockSelect.mockReturnValue(chainableMock);
	mockFrom.mockReturnValue(chainableMock);
	mockWhere.mockReturnValue(chainableMock);
	mockOrderBy.mockReturnValue(chainableMock);
	mockInnerJoin.mockReturnValue(chainableMock);
	mockRightJoin.mockReturnValue(chainableMock);
	mockInsert.mockReturnValue(chainableMock);
	mockValues.mockReturnValue(chainableMock);
	mockUpdate.mockReturnValue(chainableMock);
	mockSet.mockReturnValue(chainableMock);
	mockDelete.mockReturnValue(chainableMock);
	mockReturning.mockReturnValue(chainableMock);
	mockOnConflictDoUpdate.mockResolvedValue(undefined);
	mockStorageDelete.mockResolvedValue(true);
	mockHasResumeAccess.mockReturnValue(false);

	return {
		mockSelect,
		mockFrom,
		mockWhere,
		mockOrderBy,
		mockInnerJoin,
		mockRightJoin,
		mockInsert,
		mockValues,
		mockUpdate,
		mockSet,
		mockDelete,
		mockOnConflictDoUpdate,
		mockReturning,
		mockHasResumeAccess,
		mockStorageDelete,
		chainableMock,
	};
});

// Mock the database client
vi.mock("@/integrations/drizzle/client", () => ({
	db: chainableMock,
}));

// Mock the storage service
vi.mock("@/integrations/orpc/services/storage", () => ({
	getStorageService: vi.fn(() => ({
		delete: mockStorageDelete,
	})),
}));

// Mock the resume-access helper
vi.mock("@/integrations/orpc/helpers/resume-access", () => ({
	hasResumeAccess: mockHasResumeAccess,
}));

// Mock password hashing
vi.mock("@/utils/password", () => ({
	hashPassword: vi.fn((password: string) => Promise.resolve(`hashed_${password}`)),
}));

// Mock ID generation
vi.mock("@/utils/string", () => ({
	generateId: vi.fn(() => "test-generated-id"),
}));

// Mock env
vi.mock("@/utils/env", () => ({
	env: {
		APP_URL: "http://localhost:3000",
	},
}));

// Import after mocks are set up
import { resumeService } from "@/integrations/orpc/services/resume";

// Test data fixtures
const mockUser = {
	id: "user-123",
	email: "test@example.com",
	username: "testuser",
};

const mockResumeData = {
	basics: { name: "Test User", email: "test@example.com" },
	metadata: { page: { locale: "en-US" } },
	picture: { url: "", hidden: false },
	summary: { title: "Summary", content: "", hidden: false },
	sections: {},
	customSections: [],
};

const mockResume = {
	id: "resume-123",
	name: "My Resume",
	slug: "my-resume",
	tags: ["professional", "tech"],
	data: mockResumeData,
	isPublic: true,
	isLocked: false,
	userId: mockUser.id,
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-15"),
	password: null,
};

// Helper to set mock return values - makes tests read better
const setMockResult = (result: unknown[]) => {
	// Make the chainable mock thenable with the result
	chainableMock.then = vi.fn((resolve: (v: unknown) => void) => resolve(result));
};

describe("resume service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset chainable returns
		mockSelect.mockReturnValue(chainableMock);
		mockFrom.mockReturnValue(chainableMock);
		mockWhere.mockReturnValue(chainableMock);
		mockOrderBy.mockReturnValue(chainableMock);
		mockInnerJoin.mockReturnValue(chainableMock);
		mockRightJoin.mockReturnValue(chainableMock);
		mockInsert.mockReturnValue(chainableMock);
		mockValues.mockReturnValue(chainableMock);
		mockUpdate.mockReturnValue(chainableMock);
		mockSet.mockReturnValue(chainableMock);
		mockDelete.mockReturnValue(chainableMock);
		mockReturning.mockReturnValue(chainableMock);
		mockOnConflictDoUpdate.mockResolvedValue(undefined);
		mockHasResumeAccess.mockReturnValue(false);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("tags", () => {
		describe("list", () => {
			it("should return unique sorted tags for a user", async () => {
				setMockResult([{ tags: ["javascript", "react"] }, { tags: ["typescript", "react", "node"] }]);

				const result = await resumeService.tags.list({ userId: mockUser.id });

				expect(result).toEqual(["javascript", "node", "react", "typescript"]);
				expect(mockSelect).toHaveBeenCalled();
				expect(mockWhere).toHaveBeenCalled();
			});

			it("should return empty array if user has no resumes", async () => {
				setMockResult([]);

				const result = await resumeService.tags.list({ userId: mockUser.id });

				expect(result).toEqual([]);
			});
		});
	});

	describe("statistics", () => {
		describe("getById", () => {
			it("should return statistics for a resume", async () => {
				setMockResult([
					{
						isPublic: true,
						views: 100,
						downloads: 25,
						lastViewedAt: new Date("2026-01-10"),
						lastDownloadedAt: new Date("2026-01-08"),
					},
				]);

				const result = await resumeService.statistics.getById({
					id: "resume-123",
					userId: mockUser.id,
				});

				expect(result).toEqual({
					isPublic: true,
					views: 100,
					downloads: 25,
					lastViewedAt: expect.any(Date),
					lastDownloadedAt: expect.any(Date),
				});
			});

			it("should return zero counts for resume without statistics", async () => {
				setMockResult([
					{
						isPublic: true,
						views: null,
						downloads: null,
						lastViewedAt: null,
						lastDownloadedAt: null,
					},
				]);

				const result = await resumeService.statistics.getById({
					id: "resume-123",
					userId: mockUser.id,
				});

				expect(result.views).toBe(0);
				expect(result.downloads).toBe(0);
			});
		});

		describe("increment", () => {
			it("should increment views count", async () => {
				await resumeService.statistics.increment({ id: "resume-123", views: true });

				expect(mockInsert).toHaveBeenCalled();
				expect(mockValues).toHaveBeenCalled();
				expect(mockOnConflictDoUpdate).toHaveBeenCalled();
			});

			it("should increment downloads count", async () => {
				await resumeService.statistics.increment({ id: "resume-123", downloads: true });

				expect(mockInsert).toHaveBeenCalled();
				expect(mockOnConflictDoUpdate).toHaveBeenCalled();
			});
		});
	});

	describe("list", () => {
		it("should return all resumes for a user", async () => {
			const resumes = [{ ...mockResume }, { ...mockResume, id: "resume-456", name: "Another Resume" }];
			setMockResult(resumes);

			const result = await resumeService.list({
				userId: mockUser.id,
				tags: [],
				sort: "lastUpdatedAt",
			});

			expect(result).toHaveLength(2);
			expect(mockSelect).toHaveBeenCalled();
			expect(mockFrom).toHaveBeenCalled();
			expect(mockWhere).toHaveBeenCalled();
			expect(mockOrderBy).toHaveBeenCalled();
		});

		it("should filter resumes by tags", async () => {
			setMockResult([mockResume]);

			const result = await resumeService.list({
				userId: mockUser.id,
				tags: ["tech"],
				sort: "lastUpdatedAt",
			});

			expect(result).toHaveLength(1);
			expect(mockWhere).toHaveBeenCalled();
		});

		it("should sort by name ascending", async () => {
			setMockResult([mockResume]);

			await resumeService.list({
				userId: mockUser.id,
				tags: [],
				sort: "name",
			});

			expect(mockOrderBy).toHaveBeenCalled();
		});
	});

	describe("getById", () => {
		it("should return resume for valid id and userId", async () => {
			setMockResult([{ ...mockResume, hasPassword: false }]);

			const result = await resumeService.getById({
				id: mockResume.id,
				userId: mockUser.id,
			});

			expect(result.id).toBe(mockResume.id);
			expect(result.name).toBe(mockResume.name);
		});

		it("should throw NOT_FOUND for invalid id", async () => {
			setMockResult([]);

			await expect(resumeService.getById({ id: "invalid-id", userId: mockUser.id })).rejects.toThrow(ORPCError);
		});
	});

	describe("create", () => {
		it("should create a new resume with default data", async () => {
			setMockResult([]);

			const result = await resumeService.create({
				userId: mockUser.id,
				name: "New Resume",
				slug: "new-resume",
				tags: ["test"],
				locale: "en-US",
			});

			expect(result).toBe("test-generated-id");
			expect(mockInsert).toHaveBeenCalled();
			expect(mockValues).toHaveBeenCalled();
		});

		it("should create resume with provided data", async () => {
			setMockResult([]);

			const customData = {
				...mockResumeData,
				basics: { name: "Custom Name", email: "custom@test.com" },
			};

			const result = await resumeService.create({
				userId: mockUser.id,
				name: "Custom Resume",
				slug: "custom-resume",
				tags: [],
				locale: "en-US",
				data: customData as unknown as Parameters<typeof resumeService.create>[0]["data"],
			});

			expect(result).toBe("test-generated-id");
		});

		it("should throw RESUME_SLUG_ALREADY_EXISTS for duplicate slug", async () => {
			const constraintError = new Error("Unique constraint violation");
			(constraintError as unknown as { cause: { constraint: string } }).cause = {
				constraint: "resume_slug_user_id_unique",
			};

			mockValues.mockRejectedValue(constraintError);

			await expect(
				resumeService.create({
					userId: mockUser.id,
					name: "Duplicate",
					slug: "existing-slug",
					tags: [],
					locale: "en-US",
				}),
			).rejects.toThrow(ORPCError);
		});
	});

	describe("update", () => {
		it("should update resume name", async () => {
			setMockResult([{ isLocked: false }]);

			await resumeService.update({
				id: mockResume.id,
				userId: mockUser.id,
				name: "Updated Name",
			});

			expect(mockUpdate).toHaveBeenCalled();
			expect(mockSet).toHaveBeenCalled();
		});

		it("should throw RESUME_LOCKED for locked resume", async () => {
			setMockResult([{ isLocked: true }]);

			await expect(
				resumeService.update({
					id: mockResume.id,
					userId: mockUser.id,
					name: "Updated Name",
				}),
			).rejects.toThrow(ORPCError);
		});

		it("should throw RESUME_SLUG_ALREADY_EXISTS for duplicate slug", async () => {
			// First call returns the resume (not locked) - for the initial select check
			setMockResult([{ isLocked: false }]);

			const constraintError = new Error("Unique constraint violation");
			(constraintError as unknown as { cause: { constraint: string } }).cause = {
				constraint: "resume_slug_user_id_unique",
			};

			// The update chain ends with where() which should throw
			// But update happens after the first select, so we need to mock the second where call
			let whereCallCount = 0;
			mockWhere.mockImplementation(() => {
				whereCallCount++;
				if (whereCallCount > 1) {
					throw constraintError;
				}
				return chainableMock;
			});

			await expect(
				resumeService.update({
					id: mockResume.id,
					userId: mockUser.id,
					slug: "duplicate-slug",
				}),
			).rejects.toThrow(ORPCError);
		});
	});

	describe("delete", () => {
		it("should delete resume and associated files", async () => {
			await resumeService.delete({
				id: mockResume.id,
				userId: mockUser.id,
			});

			expect(mockDelete).toHaveBeenCalled();
			expect(mockWhere).toHaveBeenCalled();
		});
	});

	describe("getBySlug", () => {
		it("should return public resume by username and slug", async () => {
			setMockResult([
				{
					...mockResume,
					hasPassword: false,
					passwordHash: null,
				},
			]);

			const result = await resumeService.getBySlug({
				username: mockUser.username,
				slug: mockResume.slug,
			});

			expect(result.id).toBe(mockResume.id);
			expect(result.hasPassword).toBe(false);
		});

		it("should throw NOT_FOUND for non-existent resume", async () => {
			setMockResult([]);

			await expect(
				resumeService.getBySlug({
					username: mockUser.username,
					slug: "nonexistent",
				}),
			).rejects.toThrow(ORPCError);
		});

		it("should throw NEED_PASSWORD for password-protected resume without access", async () => {
			setMockResult([
				{
					...mockResume,
					hasPassword: true,
					passwordHash: "hashed_password",
				},
			]);

			mockHasResumeAccess.mockReturnValue(false);

			await expect(
				resumeService.getBySlug({
					username: mockUser.username,
					slug: mockResume.slug,
				}),
			).rejects.toThrow(ORPCError);
		});

		it("should return resume if password access is validated", async () => {
			setMockResult([
				{
					...mockResume,
					hasPassword: true,
					passwordHash: "hashed_password",
				},
			]);

			mockHasResumeAccess.mockReturnValue(true);

			const result = await resumeService.getBySlug({
				username: mockUser.username,
				slug: mockResume.slug,
			});

			expect(result.id).toBe(mockResume.id);
			expect(result.hasPassword).toBe(true);
		});
	});

	describe("setLocked", () => {
		it("should lock a resume", async () => {
			await resumeService.setLocked({
				id: mockResume.id,
				userId: mockUser.id,
				isLocked: true,
			});

			expect(mockUpdate).toHaveBeenCalled();
			expect(mockSet).toHaveBeenCalled();
		});

		it("should unlock a resume", async () => {
			await resumeService.setLocked({
				id: mockResume.id,
				userId: mockUser.id,
				isLocked: false,
			});

			expect(mockUpdate).toHaveBeenCalled();
		});
	});

	describe("setPassword", () => {
		it("should set password for resume", async () => {
			await resumeService.setPassword({
				id: mockResume.id,
				userId: mockUser.id,
				password: "secret123",
			});

			expect(mockUpdate).toHaveBeenCalled();
			expect(mockSet).toHaveBeenCalled();
		});
	});

	describe("removePassword", () => {
		it("should remove password from resume", async () => {
			await resumeService.removePassword({
				id: mockResume.id,
				userId: mockUser.id,
			});

			expect(mockUpdate).toHaveBeenCalled();
		});
	});
});
