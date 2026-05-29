/**
 * Unit Tests for src/utils/resume/move-item.ts
 *
 * Tests cover:
 * - getSourceSectionTitle: Get section title
 * - getCompatibleMoveTargets: Find compatible sections for moving items
 * - removeItemFromSource: Remove item from source section
 * - addItemToSection: Add item to target section
 * - createCustomSectionWithItem: Create new custom section with item
 * - createPageWithSection: Create new page with section
 */

import { produce } from "immer";
import { describe, expect, it } from "vitest";
import type { ResumeData } from "@/schema/resume/data";
import { defaultResumeData } from "@/schema/resume/data";
import {
	addItemToSection,
	createCustomSectionWithItem,
	createPageWithSection,
	getCompatibleMoveTargets,
	getSourceSectionTitle,
	removeItemFromSource,
} from "@/utils/resume/move-item";

describe("move-item utilities", () => {
	// Helper to create a resume with some data
	function createTestResume(): ResumeData {
		return produce(defaultResumeData, (draft) => {
			// Add experience items
			draft.sections.experience.items = [
				{
					id: "exp-1",
					hidden: false,
					company: "Company A",
					position: "Developer",
					location: "",
					period: "2020-2022",
					website: { url: "", label: "" },
					description: "",
				},
				{
					id: "exp-2",
					hidden: false,
					company: "Company B",
					position: "Senior Developer",
					location: "",
					period: "2022-Present",
					website: { url: "", label: "" },
					description: "",
				},
			];

			// Add a custom section of type experience
			draft.customSections = [
				{
					id: "custom-exp-1",
					type: "experience",
					title: "Freelance Work",
					columns: 1,
					hidden: false,
					items: [
						{
							id: "custom-exp-item-1",
							hidden: false,
							company: "Freelance",
							position: "Consultant",
							location: "",
							period: "2019-2020",
							website: { url: "", label: "" },
							description: "",
						},
					],
				},
			];

			// Update layout to include custom section
			draft.metadata.layout.pages[0].main = ["profiles", "experience", "custom-exp-1", "education"];
			draft.metadata.layout.pages[0].sidebar = ["skills", "languages"];
		});
	}

	// ==========================================================================
	// getSourceSectionTitle Tests
	// ==========================================================================
	describe("getSourceSectionTitle", () => {
		it("should return default section title for standard section", () => {
			const resume = createTestResume();
			const title = getSourceSectionTitle(resume, "experience");
			expect(typeof title).toBe("string");
			expect(title.length).toBeGreaterThan(0);
		});

		it("should return custom section title for custom section", () => {
			const resume = createTestResume();
			const title = getSourceSectionTitle(resume, "experience", "custom-exp-1");
			expect(title).toBe("Freelance Work");
		});

		it("should return default title if custom section not found", () => {
			const resume = createTestResume();
			const title = getSourceSectionTitle(resume, "experience", "non-existent");
			expect(typeof title).toBe("string");
		});
	});

	// ==========================================================================
	// getCompatibleMoveTargets Tests
	// ==========================================================================
	describe("getCompatibleMoveTargets", () => {
		it("should find compatible sections on the same page", () => {
			const resume = createTestResume();
			const targets = getCompatibleMoveTargets(resume, "experience", undefined);

			// Should find the custom-exp-1 section but not the experience section itself
			expect(targets.length).toBeGreaterThan(0);
			const page0Sections = targets[0].sections;
			expect(page0Sections.some((s) => s.sectionId === "custom-exp-1")).toBe(true);
			expect(page0Sections.some((s) => s.sectionId === "experience")).toBe(false);
		});

		it("should not include source section in targets", () => {
			const resume = createTestResume();
			const targets = getCompatibleMoveTargets(resume, "experience", "custom-exp-1");

			const allSections = targets.flatMap((t) => t.sections);
			expect(allSections.some((s) => s.sectionId === "custom-exp-1")).toBe(false);
		});

		it("should only find sections of matching type", () => {
			const resume = createTestResume();
			const targets = getCompatibleMoveTargets(resume, "skills", undefined);

			const allSections = targets.flatMap((t) => t.sections);
			// Should not find experience sections when looking for skills
			expect(allSections.some((s) => s.sectionId === "experience")).toBe(false);
			expect(allSections.some((s) => s.sectionId === "custom-exp-1")).toBe(false);
		});
	});

	// ==========================================================================
	// removeItemFromSource Tests
	// ==========================================================================
	describe("removeItemFromSource", () => {
		it("should remove item from standard section", () => {
			const resume = createTestResume();
			const result = produce(resume, (draft) => {
				const removed = removeItemFromSource(draft, "exp-1", "experience");
				expect(removed).not.toBeNull();
				expect((removed as { company: string }).company).toBe("Company A");
			});

			expect(result.sections.experience.items.length).toBe(1);
			expect(result.sections.experience.items[0].id).toBe("exp-2");
		});

		it("should remove item from custom section", () => {
			const resume = createTestResume();
			const result = produce(resume, (draft) => {
				const removed = removeItemFromSource(draft, "custom-exp-item-1", "experience", "custom-exp-1");
				expect(removed).not.toBeNull();
			});

			expect(result.customSections[0].items.length).toBe(0);
		});

		it("should return null if item not found", () => {
			const resume = createTestResume();
			produce(resume, (draft) => {
				const removed = removeItemFromSource(draft, "non-existent", "experience");
				expect(removed).toBeNull();
			});
		});

		it("should return null if custom section not found", () => {
			const resume = createTestResume();
			produce(resume, (draft) => {
				const removed = removeItemFromSource(draft, "custom-exp-item-1", "experience", "non-existent");
				expect(removed).toBeNull();
			});
		});
	});

	// ==========================================================================
	// addItemToSection Tests
	// ==========================================================================
	describe("addItemToSection", () => {
		it("should add item to standard section", () => {
			const resume = createTestResume();
			const newItem = {
				id: "new-exp",
				hidden: false,
				company: "New Company",
				position: "New Position",
				location: "",
				period: "",
				website: { url: "", label: "" },
				description: "",
			};

			const result = produce(resume, (draft) => {
				addItemToSection(draft, newItem, "experience", "experience");
			});

			expect(result.sections.experience.items.length).toBe(3);
			expect(result.sections.experience.items[2].id).toBe("new-exp");
		});

		it("should add item to custom section", () => {
			const resume = createTestResume();
			const newItem = {
				id: "new-custom-exp",
				hidden: false,
				company: "Freelance Project",
				position: "Contractor",
				location: "",
				period: "",
				website: { url: "", label: "" },
				description: "",
			};

			const result = produce(resume, (draft) => {
				addItemToSection(draft, newItem, "custom-exp-1", "experience");
			});

			expect(result.customSections[0].items.length).toBe(2);
		});
	});

	// ==========================================================================
	// createCustomSectionWithItem Tests
	// ==========================================================================
	describe("createCustomSectionWithItem", () => {
		it("should create new custom section with item", () => {
			const resume = createTestResume();
			const item = {
				id: "exp-1",
				hidden: false,
				company: "Company A",
				position: "Developer",
				location: "",
				period: "",
				website: { url: "", label: "" },
				description: "",
			};

			let newSectionId: string;
			const result = produce(resume, (draft) => {
				newSectionId = createCustomSectionWithItem(draft, item, "experience", "More Experience", 0);
			});

			expect(result.customSections.length).toBe(2);
			const newSection = result.customSections.find((s) => s.id === newSectionId!);
			expect(newSection).toBeDefined();
			expect(newSection?.title).toBe("More Experience");
			expect(newSection?.items.length).toBe(1);
		});

		it("should add section to specified page", () => {
			const resume = produce(createTestResume(), (draft) => {
				// Add a second page
				draft.metadata.layout.pages.push({
					fullWidth: false,
					main: [],
					sidebar: [],
				});
			});

			const item = {
				id: "exp-1",
				hidden: false,
				company: "Company A",
				position: "Developer",
				location: "",
				period: "",
				website: { url: "", label: "" },
				description: "",
			};

			let newSectionId: string;
			const result = produce(resume, (draft) => {
				newSectionId = createCustomSectionWithItem(draft, item, "experience", "Page 2 Experience", 1);
			});

			expect(result.metadata.layout.pages[1].main).toContain(newSectionId!);
		});
	});

	// ==========================================================================
	// createPageWithSection Tests
	// ==========================================================================
	describe("createPageWithSection", () => {
		it("should create new page with custom section", () => {
			const resume = createTestResume();
			const item = {
				id: "exp-1",
				hidden: false,
				company: "Company A",
				position: "Developer",
				location: "",
				period: "",
				website: { url: "", label: "" },
				description: "",
			};

			const result = produce(resume, (draft) => {
				createPageWithSection(draft, item, "experience", "New Page Section");
			});

			expect(result.metadata.layout.pages.length).toBe(2);
			expect(result.customSections.length).toBe(2);

			const newPage = result.metadata.layout.pages[1];
			expect(newPage.main.length).toBe(1);
			expect(newPage.sidebar.length).toBe(0);
		});
	});
});
