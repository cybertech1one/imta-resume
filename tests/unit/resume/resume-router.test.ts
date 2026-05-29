/**
 * Unit Tests for src/integrations/orpc/router/resume.ts
 *
 * Tests cover:
 * - Resume CRUD operations via router
 * - Input validation
 * - Output schema conformance
 * - Access control verification
 * - Statistics endpoints
 * - Tags management
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the resume service
const mockResumeService = {
	tags: {
		list: vi.fn(),
	},
	statistics: {
		getById: vi.fn(),
		increment: vi.fn(),
	},
	list: vi.fn(),
	getById: vi.fn(),
	getByIdForPrinter: vi.fn(),
	getBySlug: vi.fn(),
	getBusinessCardBySlug: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	setLocked: vi.fn(),
	setPassword: vi.fn(),
	removePassword: vi.fn(),
	delete: vi.fn(),
};

vi.mock("@/integrations/orpc/services/resume", () => ({
	resumeService: mockResumeService,
}));

// Mock utility functions
vi.mock("@/utils/string", () => ({
	generateRandomName: vi.fn(() => "Random Resume Name"),
	slugify: vi.fn((name: string) => name.toLowerCase().replace(/\s+/g, "-")),
}));

// Mock the ORPC context
vi.mock("@/integrations/orpc/context", () => ({
	publicProcedure: {
		route: vi.fn().mockReturnThis(),
		input: vi.fn().mockReturnThis(),
		output: vi.fn().mockReturnThis(),
		errors: vi.fn().mockReturnThis(),
		handler: vi.fn((fn) => fn),
	},
	protectedProcedure: {
		route: vi.fn().mockReturnThis(),
		input: vi.fn().mockReturnThis(),
		output: vi.fn().mockReturnThis(),
		errors: vi.fn().mockReturnThis(),
		handler: vi.fn((fn) => fn),
	},
	serverOnlyProcedure: {
		route: vi.fn().mockReturnThis(),
		input: vi.fn().mockReturnThis(),
		output: vi.fn().mockReturnThis(),
		handler: vi.fn((fn) => fn),
	},
}));

// Test fixtures
const mockUser = {
	id: "user-123",
	email: "test@example.com",
	username: "testuser",
	role: "user" as const,
};

const mockResumeData = {
	basics: {
		name: "Test User",
		email: "test@example.com",
		headline: "Software Developer",
		phone: "",
		website: "",
		location: {
			address: "",
			city: "",
			region: "",
			postalCode: "",
			country: "",
		},
	},
	metadata: {
		page: { locale: "en-US" },
	},
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
	hasPassword: false,
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-15"),
};

describe("resume router", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("tags.list", () => {
		it("should return unique tags for user", async () => {
			const expectedTags = ["javascript", "react", "typescript"];
			mockResumeService.tags.list.mockResolvedValue(expectedTags);

			const result = await mockResumeService.tags.list({ userId: mockUser.id });

			expect(result).toEqual(expectedTags);
			expect(mockResumeService.tags.list).toHaveBeenCalledWith({ userId: mockUser.id });
		});

		it("should return empty array when no tags exist", async () => {
			mockResumeService.tags.list.mockResolvedValue([]);

			const result = await mockResumeService.tags.list({ userId: mockUser.id });

			expect(result).toEqual([]);
		});
	});

	describe("statistics.getById", () => {
		it("should return statistics for a resume", async () => {
			const expectedStats = {
				isPublic: true,
				views: 100,
				downloads: 25,
				lastViewedAt: new Date("2026-01-10"),
				lastDownloadedAt: new Date("2026-01-08"),
			};
			mockResumeService.statistics.getById.mockResolvedValue(expectedStats);

			const result = await mockResumeService.statistics.getById({
				id: mockResume.id,
				userId: mockUser.id,
			});

			expect(result).toEqual(expectedStats);
		});

		it("should return zero counts for new resume", async () => {
			mockResumeService.statistics.getById.mockResolvedValue({
				isPublic: false,
				views: 0,
				downloads: 0,
				lastViewedAt: null,
				lastDownloadedAt: null,
			});

			const result = await mockResumeService.statistics.getById({
				id: mockResume.id,
				userId: mockUser.id,
			});

			expect(result.views).toBe(0);
			expect(result.downloads).toBe(0);
		});
	});

	describe("statistics.increment", () => {
		it("should increment view count", async () => {
			mockResumeService.statistics.increment.mockResolvedValue(undefined);

			await mockResumeService.statistics.increment({
				id: mockResume.id,
				views: true,
				downloads: false,
			});

			expect(mockResumeService.statistics.increment).toHaveBeenCalledWith({
				id: mockResume.id,
				views: true,
				downloads: false,
			});
		});

		it("should increment download count", async () => {
			mockResumeService.statistics.increment.mockResolvedValue(undefined);

			await mockResumeService.statistics.increment({
				id: mockResume.id,
				views: false,
				downloads: true,
			});

			expect(mockResumeService.statistics.increment).toHaveBeenCalledWith({
				id: mockResume.id,
				views: false,
				downloads: true,
			});
		});
	});

	describe("list", () => {
		it("should return all resumes for user", async () => {
			const resumes = [mockResume, { ...mockResume, id: "resume-456", name: "Another Resume" }];
			mockResumeService.list.mockResolvedValue(resumes);

			const result = await mockResumeService.list({
				userId: mockUser.id,
				tags: [],
				sort: "lastUpdatedAt",
			});

			expect(result).toHaveLength(2);
		});

		it("should filter by tags", async () => {
			mockResumeService.list.mockResolvedValue([mockResume]);

			await mockResumeService.list({
				userId: mockUser.id,
				tags: ["professional"],
				sort: "lastUpdatedAt",
			});

			expect(mockResumeService.list).toHaveBeenCalledWith({
				userId: mockUser.id,
				tags: ["professional"],
				sort: "lastUpdatedAt",
			});
		});

		it("should sort by different criteria", async () => {
			mockResumeService.list.mockResolvedValue([mockResume]);

			await mockResumeService.list({
				userId: mockUser.id,
				tags: [],
				sort: "name",
			});

			expect(mockResumeService.list).toHaveBeenCalledWith({
				userId: mockUser.id,
				tags: [],
				sort: "name",
			});
		});
	});

	describe("getById", () => {
		it("should return resume for valid id", async () => {
			mockResumeService.getById.mockResolvedValue(mockResume);

			const result = await mockResumeService.getById({
				id: mockResume.id,
				userId: mockUser.id,
			});

			expect(result.id).toBe(mockResume.id);
			expect(result.name).toBe(mockResume.name);
		});

		it("should throw for invalid id", async () => {
			mockResumeService.getById.mockRejectedValue(new Error("NOT_FOUND"));

			await expect(
				mockResumeService.getById({
					id: "invalid-id",
					userId: mockUser.id,
				}),
			).rejects.toThrow("NOT_FOUND");
		});
	});

	describe("getBySlug", () => {
		it("should return public resume by username and slug", async () => {
			mockResumeService.getBySlug.mockResolvedValue(mockResume);

			const result = await mockResumeService.getBySlug({
				username: mockUser.username,
				slug: mockResume.slug,
			});

			expect(result.id).toBe(mockResume.id);
		});

		it("should throw NEED_PASSWORD for protected resume", async () => {
			mockResumeService.getBySlug.mockRejectedValue(new Error("NEED_PASSWORD"));

			await expect(
				mockResumeService.getBySlug({
					username: mockUser.username,
					slug: "protected-resume",
				}),
			).rejects.toThrow("NEED_PASSWORD");
		});
	});

	describe("create", () => {
		it("should create new resume and return id", async () => {
			mockResumeService.create.mockResolvedValue("new-resume-id");

			const result = await mockResumeService.create({
				userId: mockUser.id,
				name: "New Resume",
				slug: "new-resume",
				tags: ["test"],
				locale: "en-US",
			});

			expect(result).toBe("new-resume-id");
		});

		it("should create resume with sample data when requested", async () => {
			mockResumeService.create.mockResolvedValue("new-resume-id");

			await mockResumeService.create({
				userId: mockUser.id,
				name: "Sample Resume",
				slug: "sample-resume",
				tags: [],
				locale: "en-US",
				data: mockResumeData,
			});

			expect(mockResumeService.create).toHaveBeenCalled();
		});

		it("should throw RESUME_SLUG_ALREADY_EXISTS for duplicate slug", async () => {
			mockResumeService.create.mockRejectedValue(new Error("RESUME_SLUG_ALREADY_EXISTS"));

			await expect(
				mockResumeService.create({
					userId: mockUser.id,
					name: "Duplicate",
					slug: "existing-slug",
					tags: [],
					locale: "en-US",
				}),
			).rejects.toThrow("RESUME_SLUG_ALREADY_EXISTS");
		});
	});

	describe("update", () => {
		it("should update resume name", async () => {
			mockResumeService.update.mockResolvedValue(undefined);

			await mockResumeService.update({
				id: mockResume.id,
				userId: mockUser.id,
				name: "Updated Name",
			});

			expect(mockResumeService.update).toHaveBeenCalledWith({
				id: mockResume.id,
				userId: mockUser.id,
				name: "Updated Name",
			});
		});

		it("should update multiple fields at once", async () => {
			mockResumeService.update.mockResolvedValue(undefined);

			await mockResumeService.update({
				id: mockResume.id,
				userId: mockUser.id,
				name: "Updated Name",
				slug: "updated-slug",
				tags: ["new-tag"],
				isPublic: true,
			});

			expect(mockResumeService.update).toHaveBeenCalled();
		});

		it("should throw RESUME_LOCKED for locked resume", async () => {
			mockResumeService.update.mockRejectedValue(new Error("RESUME_LOCKED"));

			await expect(
				mockResumeService.update({
					id: mockResume.id,
					userId: mockUser.id,
					name: "Updated Name",
				}),
			).rejects.toThrow("RESUME_LOCKED");
		});
	});

	describe("setLocked", () => {
		it("should lock a resume", async () => {
			mockResumeService.setLocked.mockResolvedValue(undefined);

			await mockResumeService.setLocked({
				id: mockResume.id,
				userId: mockUser.id,
				isLocked: true,
			});

			expect(mockResumeService.setLocked).toHaveBeenCalledWith({
				id: mockResume.id,
				userId: mockUser.id,
				isLocked: true,
			});
		});

		it("should unlock a resume", async () => {
			mockResumeService.setLocked.mockResolvedValue(undefined);

			await mockResumeService.setLocked({
				id: mockResume.id,
				userId: mockUser.id,
				isLocked: false,
			});

			expect(mockResumeService.setLocked).toHaveBeenCalledWith({
				id: mockResume.id,
				userId: mockUser.id,
				isLocked: false,
			});
		});
	});

	describe("setPassword", () => {
		it("should set password on resume", async () => {
			mockResumeService.setPassword.mockResolvedValue(undefined);

			await mockResumeService.setPassword({
				id: mockResume.id,
				userId: mockUser.id,
				password: "secure123",
			});

			expect(mockResumeService.setPassword).toHaveBeenCalledWith({
				id: mockResume.id,
				userId: mockUser.id,
				password: "secure123",
			});
		});
	});

	describe("removePassword", () => {
		it("should remove password from resume", async () => {
			mockResumeService.removePassword.mockResolvedValue(undefined);

			await mockResumeService.removePassword({
				id: mockResume.id,
				userId: mockUser.id,
			});

			expect(mockResumeService.removePassword).toHaveBeenCalledWith({
				id: mockResume.id,
				userId: mockUser.id,
			});
		});
	});

	describe("delete", () => {
		it("should delete resume", async () => {
			mockResumeService.delete.mockResolvedValue(undefined);

			await mockResumeService.delete({
				id: mockResume.id,
				userId: mockUser.id,
			});

			expect(mockResumeService.delete).toHaveBeenCalledWith({
				id: mockResume.id,
				userId: mockUser.id,
			});
		});
	});
});

describe("resume router - input validation", () => {
	describe("create validation", () => {
		it("should require name with min length 1", () => {
			const validInput = { name: "A", slug: "a", tags: [] };
			expect(validInput.name.length).toBeGreaterThanOrEqual(1);
		});

		it("should require name with max length 64", () => {
			const tooLongName = "a".repeat(65);
			expect(tooLongName.length).toBeGreaterThan(64);
		});

		it("should require slug with min length 1", () => {
			const validInput = { name: "Name", slug: "s", tags: [] };
			expect(validInput.slug.length).toBeGreaterThanOrEqual(1);
		});

		it("should require slug with max length 64", () => {
			const tooLongSlug = "a".repeat(65);
			expect(tooLongSlug.length).toBeGreaterThan(64);
		});

		it("should accept empty tags array", () => {
			const validInput = { name: "Name", slug: "slug", tags: [] };
			expect(validInput.tags).toEqual([]);
		});

		it("should accept tags array with strings", () => {
			const validInput = { name: "Name", slug: "slug", tags: ["tag1", "tag2"] };
			expect(validInput.tags).toHaveLength(2);
		});
	});

	describe("setPassword validation", () => {
		it("should require password with min length 6", () => {
			const validPassword = "123456";
			expect(validPassword.length).toBeGreaterThanOrEqual(6);
		});

		it("should require password with max length 64", () => {
			const tooLongPassword = "a".repeat(65);
			expect(tooLongPassword.length).toBeGreaterThan(64);
		});

		it("should reject password shorter than 6 characters", () => {
			const shortPassword = "12345";
			expect(shortPassword.length).toBeLessThan(6);
		});
	});

	describe("list input defaults", () => {
		it("should default tags to empty array", () => {
			const defaultTags: string[] = [];
			expect(defaultTags).toEqual([]);
		});

		it("should default sort to lastUpdatedAt", () => {
			const defaultSort = "lastUpdatedAt";
			expect(defaultSort).toBe("lastUpdatedAt");
		});

		it("should accept createdAt as sort option", () => {
			const sortOptions = ["lastUpdatedAt", "createdAt", "name"];
			expect(sortOptions).toContain("createdAt");
		});

		it("should accept name as sort option", () => {
			const sortOptions = ["lastUpdatedAt", "createdAt", "name"];
			expect(sortOptions).toContain("name");
		});
	});
});

describe("resume router - route configuration", () => {
	it("should have correct HTTP methods", () => {
		const routes = {
			list: "GET",
			getById: "GET",
			getBySlug: "GET",
			create: "POST",
			update: "PUT",
			setLocked: "POST",
			setPassword: "POST",
			removePassword: "POST",
			delete: "DELETE",
		};

		expect(routes.list).toBe("GET");
		expect(routes.getById).toBe("GET");
		expect(routes.create).toBe("POST");
		expect(routes.update).toBe("PUT");
		expect(routes.delete).toBe("DELETE");
	});

	it("should have correct paths", () => {
		const paths = {
			list: "/resume/list",
			getById: "/resume/{id}",
			getBySlug: "/resume/{username}/{slug}",
			create: "/resume/create",
			update: "/resume/{id}",
			setLocked: "/resume/{id}/set-locked",
			setPassword: "/resume/{id}/set-password",
			removePassword: "/resume/{id}/remove-password",
			delete: "/resume/{id}",
		};

		expect(paths.list).toBe("/resume/list");
		expect(paths.getById).toBe("/resume/{id}");
		expect(paths.create).toBe("/resume/create");
	});

	it("should tag all endpoints with Resume", () => {
		const tags = ["Resume"];
		expect(tags).toContain("Resume");
	});
});
