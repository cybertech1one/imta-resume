/**
 * Unit Tests for src/schema/resume/data.ts
 *
 * Tests cover:
 * - Schema validation for resume data structures
 * - Default values and optional fields
 * - Type inference correctness
 */

import { describe, expect, it } from "vitest";
import {
	basicsSchema,
	customFieldSchema,
	defaultResumeData,
	educationItemSchema,
	experienceItemSchema,
	internshipItemSchema,
	languageItemSchema,
	militaryServiceStatusSchema,
	resumeDataSchema,
	skillItemSchema,
	summarySchema,
	urlSchema,
} from "@/schema/resume/data";

describe("resume data schema", () => {
	// ==========================================================================
	// urlSchema Tests
	// ==========================================================================
	describe("urlSchema", () => {
		it("should validate a valid URL object", () => {
			const result = urlSchema.safeParse({
				url: "https://example.com",
				label: "My Website",
			});
			expect(result.success).toBe(true);
		});

		it("should validate empty URL and label", () => {
			const result = urlSchema.safeParse({
				url: "",
				label: "",
			});
			expect(result.success).toBe(true);
		});

		it("should fail without required fields", () => {
			const result = urlSchema.safeParse({});
			expect(result.success).toBe(false);
		});
	});

	// ==========================================================================
	// customFieldSchema Tests
	// ==========================================================================
	describe("customFieldSchema", () => {
		it("should validate a valid custom field", () => {
			const result = customFieldSchema.safeParse({
				id: "test-id",
				icon: "phone",
				text: "123-456-7890",
				link: "",
			});
			expect(result.success).toBe(true);
		});

		it("should validate custom field with link", () => {
			const result = customFieldSchema.safeParse({
				id: "test-id",
				icon: "envelope",
				text: "Contact Me",
				link: "https://example.com/contact",
			});
			expect(result.success).toBe(true);
		});
	});

	// ==========================================================================
	// militaryServiceStatusSchema Tests
	// ==========================================================================
	describe("militaryServiceStatusSchema", () => {
		it("should validate all valid statuses", () => {
			const statuses = ["not-applicable", "completed", "exempted", "pending", "in-service"];
			for (const status of statuses) {
				const result = militaryServiceStatusSchema.safeParse(status);
				expect(result.success).toBe(true);
			}
		});

		it("should reject invalid status", () => {
			const result = militaryServiceStatusSchema.safeParse("invalid");
			expect(result.success).toBe(false);
		});
	});

	// ==========================================================================
	// basicsSchema Tests
	// ==========================================================================
	describe("basicsSchema", () => {
		it("should validate complete basics object", () => {
			const result = basicsSchema.safeParse({
				name: "John Doe",
				headline: "Software Engineer",
				email: "john@example.com",
				phone: "+1234567890",
				location: "New York, NY",
				website: { url: "https://johndoe.com", label: "Portfolio" },
				customFields: [],
				cin: "",
				militaryServiceStatus: "not-applicable",
				dateOfBirth: "",
				nationality: "",
				maritalStatus: "",
			});
			expect(result.success).toBe(true);
		});

		it("should apply defaults for Morocco-specific fields", () => {
			const result = basicsSchema.parse({
				name: "John Doe",
				headline: "Developer",
				email: "john@example.com",
				phone: "",
				location: "",
				website: { url: "", label: "" },
				customFields: [],
			});
			expect(result.cin).toBe("");
			expect(result.militaryServiceStatus).toBe("not-applicable");
			expect(result.dateOfBirth).toBe("");
			expect(result.nationality).toBe("");
			expect(result.maritalStatus).toBe("");
		});
	});

	// ==========================================================================
	// summarySchema Tests
	// ==========================================================================
	describe("summarySchema", () => {
		it("should validate a valid summary", () => {
			const result = summarySchema.safeParse({
				title: "Summary",
				columns: 1,
				hidden: false,
				content: "<p>Experienced software engineer...</p>",
			});
			expect(result.success).toBe(true);
		});
	});

	// ==========================================================================
	// Item Schema Tests
	// ==========================================================================
	describe("experienceItemSchema", () => {
		it("should validate a valid experience item", () => {
			const result = experienceItemSchema.safeParse({
				id: "exp-1",
				hidden: false,
				company: "Tech Corp",
				position: "Senior Developer",
				location: "San Francisco, CA",
				period: "2020 - Present",
				website: { url: "https://techcorp.com", label: "" },
				description: "<p>Led development of...</p>",
			});
			expect(result.success).toBe(true);
		});

		it("should require company name", () => {
			const result = experienceItemSchema.safeParse({
				id: "exp-1",
				hidden: false,
				company: "",
				position: "Developer",
				location: "",
				period: "",
				website: { url: "", label: "" },
				description: "",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("educationItemSchema", () => {
		it("should validate a valid education item", () => {
			const result = educationItemSchema.safeParse({
				id: "edu-1",
				hidden: false,
				school: "MIT",
				degree: "Bachelor of Science",
				area: "Computer Science",
				grade: "3.8 GPA",
				location: "Cambridge, MA",
				period: "2016 - 2020",
				website: { url: "https://mit.edu", label: "" },
				description: "",
			});
			expect(result.success).toBe(true);
		});

		it("should require school name", () => {
			const result = educationItemSchema.safeParse({
				id: "edu-1",
				hidden: false,
				school: "",
				degree: "BS",
				area: "",
				grade: "",
				location: "",
				period: "",
				website: { url: "", label: "" },
				description: "",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("skillItemSchema", () => {
		it("should validate a valid skill item", () => {
			const result = skillItemSchema.safeParse({
				id: "skill-1",
				hidden: false,
				icon: "",
				name: "TypeScript",
				proficiency: "Advanced",
				level: 4,
				keywords: ["JavaScript", "Frontend"],
			});
			expect(result.success).toBe(true);
		});

		it("should clamp level between 0 and 5", () => {
			const resultHigh = skillItemSchema.parse({
				id: "skill-1",
				hidden: false,
				icon: "",
				name: "Test",
				proficiency: "",
				level: 10,
				keywords: [],
			});
			// Zod's catch means it returns default if validation fails
			expect(resultHigh.level).toBeLessThanOrEqual(5);

			const resultLow = skillItemSchema.parse({
				id: "skill-1",
				hidden: false,
				icon: "",
				name: "Test",
				proficiency: "",
				level: -1,
				keywords: [],
			});
			expect(resultLow.level).toBeGreaterThanOrEqual(0);
		});
	});

	describe("languageItemSchema", () => {
		it("should validate a valid language item", () => {
			const result = languageItemSchema.safeParse({
				id: "lang-1",
				hidden: false,
				language: "English",
				fluency: "Native",
				level: 5,
			});
			expect(result.success).toBe(true);
		});
	});

	describe("internshipItemSchema", () => {
		it("should validate a valid internship item", () => {
			const result = internshipItemSchema.safeParse({
				id: "intern-1",
				hidden: false,
				company: "Tech Startup",
				position: "Software Intern",
				supervisor: "Jane Smith",
				location: "Casablanca",
				period: "Summer 2024",
				type: "application",
				website: { url: "", label: "" },
				tasksPerformed: "<p>Developed features...</p>",
				skillsAcquired: ["React", "Node.js"],
				evaluation: "",
			});
			expect(result.success).toBe(true);
		});

		it("should validate all internship types", () => {
			const types = ["observation", "application", "end-of-studies", "professional", "other"];
			for (const type of types) {
				const result = internshipItemSchema.safeParse({
					id: "intern-1",
					hidden: false,
					company: "Company",
					position: "Intern",
					supervisor: "",
					location: "",
					period: "",
					type,
					website: { url: "", label: "" },
					tasksPerformed: "",
					skillsAcquired: [],
					evaluation: "",
				});
				expect(result.success).toBe(true);
			}
		});
	});

	// ==========================================================================
	// Default Resume Data Tests
	// ==========================================================================
	describe("defaultResumeData", () => {
		it("should be valid according to resumeDataSchema", () => {
			const result = resumeDataSchema.safeParse(defaultResumeData);
			expect(result.success).toBe(true);
		});

		it("should have empty arrays for all section items", () => {
			expect(defaultResumeData.sections.profiles.items).toEqual([]);
			expect(defaultResumeData.sections.experience.items).toEqual([]);
			expect(defaultResumeData.sections.education.items).toEqual([]);
			expect(defaultResumeData.sections.skills.items).toEqual([]);
			expect(defaultResumeData.sections.internships.items).toEqual([]);
		});

		it("should have default metadata values", () => {
			expect(defaultResumeData.metadata.template).toBe("onyx");
			expect(defaultResumeData.metadata.page.format).toBe("a4");
			expect(defaultResumeData.metadata.page.locale).toBe("en-US");
		});

		it("should have empty custom sections", () => {
			expect(defaultResumeData.customSections).toEqual([]);
		});
	});

	// ==========================================================================
	// Full Resume Data Schema Tests
	// ==========================================================================
	describe("resumeDataSchema", () => {
		it("should validate a complete resume", () => {
			const fullResume = {
				...defaultResumeData,
				basics: {
					...defaultResumeData.basics,
					name: "John Doe",
					email: "john@example.com",
				},
				sections: {
					...defaultResumeData.sections,
					experience: {
						...defaultResumeData.sections.experience,
						items: [
							{
								id: "exp-1",
								hidden: false,
								company: "Tech Corp",
								position: "Developer",
								location: "",
								period: "2020 - Present",
								website: { url: "", label: "" },
								description: "",
							},
						],
					},
				},
			};

			const result = resumeDataSchema.safeParse(fullResume);
			expect(result.success).toBe(true);
		});
	});
});
