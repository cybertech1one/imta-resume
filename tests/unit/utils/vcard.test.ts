/**
 * Unit Tests for src/utils/vcard.ts
 *
 * Tests cover:
 * - generateVCard: Full vCard 3.0 generation from resume data
 * - generateCompactVCard: Compact vCard for QR codes
 *
 * Note: downloadVCard requires browser DOM and is tested in e2e tests.
 */

import { describe, expect, it } from "vitest";
import type { ResumeData } from "@/schema/resume/data";
import { generateCompactVCard, generateVCard } from "@/utils/vcard";

// Helper to create minimal resume data for testing
function createMockResumeData(overrides: Partial<ResumeData["basics"]> = {}): ResumeData {
	return {
		basics: {
			name: "John Doe",
			email: "john@example.com",
			phone: "+1-555-123-4567",
			headline: "Software Engineer",
			location: "New York, NY",
			website: { url: "https://johndoe.com", label: "Website" },
			...overrides,
		} as ResumeData["basics"],
		sections: {
			profiles: {
				items: [],
				hidden: false,
				columns: 1,
			},
		} as unknown as ResumeData["sections"],
		customSections: [],
		summary: "",
		metadata: {} as ResumeData["metadata"],
		picture: {
			url: "",
			hidden: true,
			size: 100,
			rotation: 0,
			aspectRatio: 1,
			borderRadius: 0,
			borderColor: "",
			borderWidth: 0,
			shadowColor: "",
			shadowWidth: 0,
		},
	} as unknown as ResumeData;
}

describe("vcard utilities", () => {
	// ==========================================================================
	// generateVCard Tests
	// ==========================================================================
	describe("generateVCard", () => {
		describe("vCard structure", () => {
			it("should start with BEGIN:VCARD", () => {
				const data = createMockResumeData();
				const vcard = generateVCard(data);
				expect(vcard.startsWith("BEGIN:VCARD")).toBe(true);
			});

			it("should end with END:VCARD", () => {
				const data = createMockResumeData();
				const vcard = generateVCard(data);
				expect(vcard.trim().endsWith("END:VCARD")).toBe(true);
			});

			it("should include VERSION:3.0", () => {
				const data = createMockResumeData();
				const vcard = generateVCard(data);
				expect(vcard).toContain("VERSION:3.0");
			});

			it("should use CRLF line endings", () => {
				const data = createMockResumeData();
				const vcard = generateVCard(data);
				expect(vcard).toContain("\r\n");
			});
		});

		describe("required fields", () => {
			it("should include FN (formatted name)", () => {
				const data = createMockResumeData({ name: "Jane Smith" });
				const vcard = generateVCard(data);
				expect(vcard).toContain("FN:Jane Smith");
			});

			it("should include N (structured name)", () => {
				const data = createMockResumeData({ name: "John Doe" });
				const vcard = generateVCard(data);
				expect(vcard).toContain("N:Doe;John;;;");
			});

			it("should handle single name", () => {
				const data = createMockResumeData({ name: "Madonna" });
				const vcard = generateVCard(data);
				expect(vcard).toContain("N:Madonna;;;;");
			});

			it("should handle name with middle names", () => {
				const data = createMockResumeData({ name: "John Michael David Doe" });
				const vcard = generateVCard(data);
				expect(vcard).toContain("N:Doe;John;Michael David;;");
			});
		});

		describe("optional fields", () => {
			it("should include TITLE (headline)", () => {
				const data = createMockResumeData({ headline: "Senior Developer" });
				const vcard = generateVCard(data);
				expect(vcard).toContain("TITLE:Senior Developer");
			});

			it("should include EMAIL", () => {
				const data = createMockResumeData({ email: "test@test.com" });
				const vcard = generateVCard(data);
				expect(vcard).toContain("EMAIL;TYPE=INTERNET:test@test.com");
			});

			it("should include TEL (phone)", () => {
				const data = createMockResumeData({ phone: "+33-6-12-34-56-78" });
				const vcard = generateVCard(data);
				expect(vcard).toContain("TEL;TYPE=CELL:+33-6-12-34-56-78");
			});

			it("should include URL (website)", () => {
				const data = createMockResumeData({
					website: { url: "https://mysite.com", label: "Personal Site" },
				});
				const vcard = generateVCard(data);
				expect(vcard).toContain("URL:https://mysite.com");
			});

			it("should include ADR (address from location)", () => {
				const data = createMockResumeData({ location: "Paris, France" });
				const vcard = generateVCard(data);
				expect(vcard).toContain("ADR;TYPE=HOME:;;Paris\\, France;;;;");
			});
		});

		describe("resume URL", () => {
			it("should include resume URL when provided", () => {
				const data = createMockResumeData();
				const vcard = generateVCard(data, "https://resume.example.com/john");
				expect(vcard).toContain("URL;TYPE=WORK;X-ABLabel=Resume:https://resume.example.com/john");
			});

			it("should not include resume URL when not provided", () => {
				const data = createMockResumeData();
				const vcard = generateVCard(data);
				expect(vcard).not.toContain("X-ABLabel=Resume");
			});
		});

		describe("photo", () => {
			it("should include PHOTO when visible", () => {
				const data = createMockResumeData();
				data.picture = {
					url: "https://example.com/photo.jpg",
					hidden: false,
					size: 100,
					rotation: 0,
					aspectRatio: 1,
					borderRadius: 0,
					borderColor: "",
					borderWidth: 0,
					shadowColor: "",
					shadowWidth: 0,
				};
				const vcard = generateVCard(data);
				expect(vcard).toContain("PHOTO;VALUE=URI:https://example.com/photo.jpg");
			});

			it("should not include PHOTO when hidden", () => {
				const data = createMockResumeData();
				data.picture = {
					url: "https://example.com/photo.jpg",
					hidden: true,
					size: 100,
					rotation: 0,
					aspectRatio: 1,
					borderRadius: 0,
					borderColor: "",
					borderWidth: 0,
					shadowColor: "",
					shadowWidth: 0,
				};
				const vcard = generateVCard(data);
				expect(vcard).not.toContain("PHOTO");
			});
		});

		describe("social profiles", () => {
			it("should include social profiles", () => {
				const data = createMockResumeData();
				data.sections.profiles = {
					items: [
						{
							id: "1",
							network: "LinkedIn",
							website: { url: "https://linkedin.com/in/johndoe", label: "LinkedIn" },
							hidden: false,
						},
						{
							id: "2",
							network: "GitHub",
							website: { url: "https://github.com/johndoe", label: "GitHub" },
							hidden: false,
						},
					],
					hidden: false,
					columns: 1,
				} as unknown as ResumeData["sections"]["profiles"];
				const vcard = generateVCard(data);
				expect(vcard).toContain("X-SOCIALPROFILE;TYPE=LinkedIn:https://linkedin.com/in/johndoe");
				expect(vcard).toContain("X-SOCIALPROFILE;TYPE=GitHub:https://github.com/johndoe");
			});

			it("should skip hidden profiles", () => {
				const data = createMockResumeData();
				data.sections.profiles = {
					items: [
						{
							id: "1",
							network: "LinkedIn",
							website: { url: "https://linkedin.com/in/johndoe", label: "LinkedIn" },
							hidden: true,
						},
					],
					hidden: false,
					columns: 1,
				} as unknown as ResumeData["sections"]["profiles"];
				const vcard = generateVCard(data);
				expect(vcard).not.toContain("X-SOCIALPROFILE");
			});
		});

		describe("Morocco-specific fields", () => {
			it("should include BDAY (date of birth)", () => {
				const data = createMockResumeData({ dateOfBirth: "1990/05/15" } as unknown as Partial<ResumeData["basics"]>);
				const vcard = generateVCard(data);
				expect(vcard).toContain("BDAY:1990-05-15");
			});

			it("should include CIN in NOTE field", () => {
				const data = createMockResumeData({ cin: "AB123456" } as unknown as Partial<ResumeData["basics"]>);
				const vcard = generateVCard(data);
				expect(vcard).toContain("NOTE:");
				expect(vcard).toContain("CIN: AB123456");
			});

			it("should include nationality in NOTE field", () => {
				const data = createMockResumeData({ nationality: "Moroccan" } as unknown as Partial<ResumeData["basics"]>);
				const vcard = generateVCard(data);
				expect(vcard).toContain("Nationalite: Moroccan");
			});

			it("should include marital status in NOTE field", () => {
				const data = createMockResumeData({ maritalStatus: "Single" } as unknown as Partial<ResumeData["basics"]>);
				const vcard = generateVCard(data);
				expect(vcard).toContain("Situation familiale: Single");
			});

			it("should include military service status in NOTE field", () => {
				const data = createMockResumeData({
					militaryServiceStatus: "completed",
				} as unknown as Partial<ResumeData["basics"]>);
				const vcard = generateVCard(data);
				expect(vcard).toContain("Service militaire: Accompli");
			});

			it("should not include military service when not applicable", () => {
				const data = createMockResumeData({
					militaryServiceStatus: "not-applicable",
				} as unknown as Partial<ResumeData["basics"]>);
				const vcard = generateVCard(data);
				expect(vcard).not.toContain("Service militaire");
			});
		});

		describe("special character escaping", () => {
			it("should escape commas", () => {
				const data = createMockResumeData({ location: "Paris, France" });
				const vcard = generateVCard(data);
				expect(vcard).toContain("Paris\\, France");
			});

			it("should escape semicolons", () => {
				const data = createMockResumeData({ headline: "Developer; Designer" });
				const vcard = generateVCard(data);
				expect(vcard).toContain("Developer\\; Designer");
			});

			it("should escape backslashes", () => {
				const data = createMockResumeData({ headline: "Dev\\Ops" });
				const vcard = generateVCard(data);
				expect(vcard).toContain("Dev\\\\Ops");
			});
		});

		describe("metadata", () => {
			it("should include PRODID", () => {
				const data = createMockResumeData();
				const vcard = generateVCard(data);
				expect(vcard).toContain("PRODID:-//Reactive Resume//EN");
			});

			it("should include REV (revision date)", () => {
				const data = createMockResumeData();
				const vcard = generateVCard(data);
				expect(vcard).toMatch(/REV:\d{8}T\d{6}Z/);
			});
		});
	});

	// ==========================================================================
	// generateCompactVCard Tests
	// ==========================================================================
	describe("generateCompactVCard", () => {
		it("should generate valid vCard structure", () => {
			const data = createMockResumeData();
			const vcard = generateCompactVCard(data);

			expect(vcard.startsWith("BEGIN:VCARD")).toBe(true);
			expect(vcard.trim().endsWith("END:VCARD")).toBe(true);
			expect(vcard).toContain("VERSION:3.0");
		});

		it("should include essential fields only", () => {
			const data = createMockResumeData({
				name: "John Doe",
				email: "john@example.com",
				phone: "+1-555-123-4567",
				headline: "Developer",
			});
			const vcard = generateCompactVCard(data);

			expect(vcard).toContain("FN:John Doe");
			expect(vcard).toContain("EMAIL:john@example.com");
			expect(vcard).toContain("TEL:+1-555-123-4567");
			expect(vcard).toContain("TITLE:Developer");
		});

		it("should prefer resume URL over personal website", () => {
			const data = createMockResumeData({
				website: { url: "https://personal.com", label: "Personal" },
			});
			const vcard = generateCompactVCard(data, "https://resume.example.com");

			expect(vcard).toContain("URL:https://resume.example.com");
			expect(vcard).not.toContain("personal.com");
		});

		it("should use personal website when no resume URL", () => {
			const data = createMockResumeData({
				website: { url: "https://personal.com", label: "Personal" },
			});
			const vcard = generateCompactVCard(data);

			expect(vcard).toContain("URL:https://personal.com");
		});

		it("should include CIN in NOTE if present", () => {
			const data = createMockResumeData({ cin: "AB123456" } as unknown as Partial<ResumeData["basics"]>);
			const vcard = generateCompactVCard(data);

			expect(vcard).toContain("NOTE:CIN: AB123456");
		});

		it("should be smaller than full vCard", () => {
			const data = createMockResumeData({
				name: "John Doe",
				email: "john@example.com",
				phone: "+1-555-123-4567",
				headline: "Senior Software Engineer",
				location: "New York, NY",
			});
			data.sections.profiles = {
				items: [
					{
						id: "1",
						network: "LinkedIn",
						website: { url: "https://linkedin.com/in/johndoe", label: "LinkedIn" },
						hidden: false,
					},
				],
				hidden: false,
				columns: 1,
			} as unknown as ResumeData["sections"]["profiles"];

			const fullVcard = generateVCard(data);
			const compactVcard = generateCompactVCard(data);

			expect(compactVcard.length).toBeLessThan(fullVcard.length);
		});

		it("should not include social profiles", () => {
			const data = createMockResumeData();
			data.sections.profiles = {
				items: [
					{
						id: "1",
						network: "LinkedIn",
						website: { url: "https://linkedin.com/in/johndoe", label: "LinkedIn" },
						hidden: false,
					},
				],
				hidden: false,
				columns: 1,
			} as unknown as ResumeData["sections"]["profiles"];
			const vcard = generateCompactVCard(data);

			expect(vcard).not.toContain("X-SOCIALPROFILE");
		});

		it("should not include photo", () => {
			const data = createMockResumeData();
			data.picture = {
				url: "https://example.com/photo.jpg",
				hidden: false,
				size: 100,
				rotation: 0,
				aspectRatio: 1,
				borderRadius: 0,
				borderColor: "",
				borderWidth: 0,
				shadowColor: "",
				shadowWidth: 0,
			};
			const vcard = generateCompactVCard(data);

			expect(vcard).not.toContain("PHOTO");
		});

		it("should not include location", () => {
			const data = createMockResumeData({ location: "Paris, France" });
			const vcard = generateCompactVCard(data);

			expect(vcard).not.toContain("ADR");
		});
	});
});
