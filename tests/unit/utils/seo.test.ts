/**
 * Unit Tests for src/utils/seo.ts
 *
 * Tests cover:
 * - generateMetaTags: SEO meta tag generation
 * - generateOrganizationSchema: JSON-LD organization schema
 * - generateWebsiteSchema: JSON-LD website schema
 * - generateSoftwareApplicationSchema: JSON-LD software application schema
 * - generateResumeSchema: JSON-LD person/resume schema
 * - generateCanonicalLink: Canonical URL generation
 * - defaultSEO: Default SEO configuration
 */

import { describe, expect, it } from "vitest";
import {
	defaultSEO,
	generateCanonicalLink,
	generateMetaTags,
	generateOrganizationSchema,
	generateResumeSchema,
	generateSoftwareApplicationSchema,
	generateWebsiteSchema,
} from "@/utils/seo";

describe("SEO utilities", () => {
	// ==========================================================================
	// generateMetaTags Tests
	// ==========================================================================
	describe("generateMetaTags", () => {
		it("should generate title tag", () => {
			const tags = generateMetaTags({ title: "Test Page" });
			const titleTag = tags.find((tag) => "title" in tag);
			expect(titleTag).toEqual({ title: "Test Page" });
		});

		it("should generate description meta tag", () => {
			const tags = generateMetaTags({
				title: "Test",
				description: "This is a test description",
			});
			const descTag = tags.find((tag) => "name" in tag && tag.name === "description");
			expect(descTag).toEqual({ name: "description", content: "This is a test description" });
		});

		it("should generate Open Graph tags", () => {
			const tags = generateMetaTags({
				title: "Test Page",
				description: "Test description",
				image: "https://example.com/image.jpg",
				url: "https://example.com/page",
			});

			const ogTitle = tags.find((tag) => "property" in tag && tag.property === "og:title");
			const ogDesc = tags.find((tag) => "property" in tag && tag.property === "og:description");
			const ogImage = tags.find((tag) => "property" in tag && tag.property === "og:image");
			const ogUrl = tags.find((tag) => "property" in tag && tag.property === "og:url");

			expect(ogTitle).toEqual({ property: "og:title", content: "Test Page" });
			expect(ogDesc).toEqual({ property: "og:description", content: "Test description" });
			expect(ogImage).toEqual({ property: "og:image", content: "https://example.com/image.jpg" });
			expect(ogUrl).toEqual({ property: "og:url", content: "https://example.com/page" });
		});

		it("should generate og:type with default website", () => {
			const tags = generateMetaTags({ title: "Test" });
			const ogType = tags.find((tag) => "property" in tag && tag.property === "og:type");
			expect(ogType).toEqual({ property: "og:type", content: "website" });
		});

		it("should allow custom og:type", () => {
			const tags = generateMetaTags({ title: "Test", type: "article" });
			const ogType = tags.find((tag) => "property" in tag && tag.property === "og:type");
			expect(ogType).toEqual({ property: "og:type", content: "article" });
		});

		it("should generate og:site_name with default", () => {
			const tags = generateMetaTags({ title: "Test" });
			const ogSiteName = tags.find((tag) => "property" in tag && tag.property === "og:site_name");
			expect(ogSiteName).toEqual({ property: "og:site_name", content: "IMTA Resume" });
		});

		it("should allow custom og:site_name", () => {
			const tags = generateMetaTags({ title: "Test", siteName: "Custom Site" });
			const ogSiteName = tags.find((tag) => "property" in tag && tag.property === "og:site_name");
			expect(ogSiteName).toEqual({ property: "og:site_name", content: "Custom Site" });
		});

		it("should generate Twitter Card tags", () => {
			const tags = generateMetaTags({
				title: "Test Page",
				description: "Test description",
				image: "https://example.com/image.jpg",
			});

			const twCard = tags.find((tag) => "property" in tag && tag.property === "twitter:card");
			const twTitle = tags.find((tag) => "property" in tag && tag.property === "twitter:title");
			const twDesc = tags.find((tag) => "property" in tag && tag.property === "twitter:description");
			const twImage = tags.find((tag) => "property" in tag && tag.property === "twitter:image");

			expect(twCard).toEqual({ property: "twitter:card", content: "summary_large_image" });
			expect(twTitle).toEqual({ property: "twitter:title", content: "Test Page" });
			expect(twDesc).toEqual({ property: "twitter:description", content: "Test description" });
			expect(twImage).toEqual({ property: "twitter:image", content: "https://example.com/image.jpg" });
		});

		it("should use summary card type when no image", () => {
			const tags = generateMetaTags({ title: "Test" });
			const twCard = tags.find((tag) => "property" in tag && tag.property === "twitter:card");
			expect(twCard).toEqual({ property: "twitter:card", content: "summary" });
		});

		it("should generate noindex robots tag when specified", () => {
			const tags = generateMetaTags({ title: "Test", noIndex: true });
			const robots = tags.find((tag) => "name" in tag && tag.name === "robots");
			expect(robots).toEqual({ name: "robots", content: "noindex, nofollow" });
		});

		it("should not generate robots tag when noIndex is false", () => {
			const tags = generateMetaTags({ title: "Test", noIndex: false });
			const robots = tags.find((tag) => "name" in tag && tag.name === "robots");
			expect(robots).toBeUndefined();
		});

		it("should omit optional tags when not provided", () => {
			const tags = generateMetaTags({ title: "Test" });

			const desc = tags.find((tag) => "name" in tag && tag.name === "description");
			const ogDesc = tags.find((tag) => "property" in tag && tag.property === "og:description");
			const ogImage = tags.find((tag) => "property" in tag && tag.property === "og:image");
			const ogUrl = tags.find((tag) => "property" in tag && tag.property === "og:url");

			expect(desc).toBeUndefined();
			expect(ogDesc).toBeUndefined();
			expect(ogImage).toBeUndefined();
			expect(ogUrl).toBeUndefined();
		});
	});

	// ==========================================================================
	// generateOrganizationSchema Tests
	// ==========================================================================
	describe("generateOrganizationSchema", () => {
		it("should generate valid JSON-LD organization schema", () => {
			const schema = generateOrganizationSchema({
				name: "IMTA Resume",
				url: "https://imta-resume.com",
			}) as Record<string, unknown>;

			expect(schema["@context"]).toBe("https://schema.org");
			expect(schema["@type"]).toBe("Organization");
			expect(schema.name).toBe("IMTA Resume");
			expect(schema.url).toBe("https://imta-resume.com");
		});

		it("should include optional logo", () => {
			const schema = generateOrganizationSchema({
				name: "Test Org",
				url: "https://example.com",
				logo: "https://example.com/logo.png",
			}) as Record<string, unknown>;

			expect(schema.logo).toBe("https://example.com/logo.png");
		});

		it("should include optional description", () => {
			const schema = generateOrganizationSchema({
				name: "Test Org",
				url: "https://example.com",
				description: "A great organization",
			}) as Record<string, unknown>;

			expect(schema.description).toBe("A great organization");
		});

		it("should include optional sameAs (social links)", () => {
			const schema = generateOrganizationSchema({
				name: "Test Org",
				url: "https://example.com",
				sameAs: ["https://twitter.com/testorg", "https://linkedin.com/company/testorg"],
			});

			expect(schema.sameAs).toEqual(["https://twitter.com/testorg", "https://linkedin.com/company/testorg"]);
		});

		it("should omit optional fields when not provided", () => {
			const schema = generateOrganizationSchema({
				name: "Test Org",
				url: "https://example.com",
			});

			expect("logo" in schema).toBe(false);
			expect("description" in schema).toBe(false);
			expect("sameAs" in schema).toBe(false);
		});
	});

	// ==========================================================================
	// generateWebsiteSchema Tests
	// ==========================================================================
	describe("generateWebsiteSchema", () => {
		it("should generate valid JSON-LD website schema", () => {
			const schema = generateWebsiteSchema({
				name: "IMTA Resume",
				url: "https://imta-resume.com",
			});

			expect(schema["@context"]).toBe("https://schema.org");
			expect(schema["@type"]).toBe("WebSite");
			expect(schema.name).toBe("IMTA Resume");
			expect(schema.url).toBe("https://imta-resume.com");
		});

		it("should include optional description", () => {
			const schema = generateWebsiteSchema({
				name: "Test Site",
				url: "https://example.com",
				description: "A test website",
			});

			expect(schema.description).toBe("A test website");
		});

		it("should include search action when provided", () => {
			const schema = generateWebsiteSchema({
				name: "Test Site",
				url: "https://example.com",
				potentialAction: {
					type: "SearchAction",
					target: "https://example.com/search?q={search_term}",
					queryInput: "required name=search_term",
				},
			});

			expect(schema.potentialAction).toBeDefined();
			expect(schema.potentialAction!["@type"]).toBe("SearchAction");
			expect(schema.potentialAction!.target).toBe("https://example.com/search?q={search_term}");
			expect(schema.potentialAction!["query-input"]).toBe("required name=search_term");
		});
	});

	// ==========================================================================
	// generateSoftwareApplicationSchema Tests
	// ==========================================================================
	describe("generateSoftwareApplicationSchema", () => {
		it("should generate valid JSON-LD software application schema", () => {
			const schema = generateSoftwareApplicationSchema({
				name: "IMTA Resume",
				url: "https://imta-resume.com",
			});

			expect(schema["@context"]).toBe("https://schema.org");
			expect(schema["@type"]).toBe("SoftwareApplication");
			expect(schema.name).toBe("IMTA Resume");
			expect(schema.url).toBe("https://imta-resume.com");
		});

		it("should have default operating system as Web", () => {
			const schema = generateSoftwareApplicationSchema({
				name: "Test App",
				url: "https://example.com",
			});

			expect(schema.operatingSystem).toBe("Web");
		});

		it("should have default application category as BusinessApplication", () => {
			const schema = generateSoftwareApplicationSchema({
				name: "Test App",
				url: "https://example.com",
			});

			expect(schema.applicationCategory).toBe("BusinessApplication");
		});

		it("should include default free offers", () => {
			const schema = generateSoftwareApplicationSchema({
				name: "Test App",
				url: "https://example.com",
			});

			expect(schema.offers).toBeDefined();
			expect(schema.offers["@type"]).toBe("Offer");
			expect(schema.offers.price).toBe("0");
			expect(schema.offers.priceCurrency).toBe("USD");
		});

		it("should allow custom offers", () => {
			const schema = generateSoftwareApplicationSchema({
				name: "Test App",
				url: "https://example.com",
				offers: {
					price: "9.99",
					priceCurrency: "EUR",
				},
			});

			expect(schema.offers.price).toBe("9.99");
			expect(schema.offers.priceCurrency).toBe("EUR");
		});

		it("should include optional description", () => {
			const schema = generateSoftwareApplicationSchema({
				name: "Test App",
				url: "https://example.com",
				description: "A great application",
			});

			expect(schema.description).toBe("A great application");
		});

		it("should allow custom operating system and category", () => {
			const schema = generateSoftwareApplicationSchema({
				name: "Test App",
				url: "https://example.com",
				operatingSystem: "iOS, Android",
				applicationCategory: "ProductivityApplication",
			});

			expect(schema.operatingSystem).toBe("iOS, Android");
			expect(schema.applicationCategory).toBe("ProductivityApplication");
		});
	});

	// ==========================================================================
	// generateResumeSchema Tests
	// ==========================================================================
	describe("generateResumeSchema", () => {
		it("should generate valid JSON-LD person schema", () => {
			const schema = generateResumeSchema({
				name: "John Doe",
			});

			expect(schema["@context"]).toBe("https://schema.org");
			expect(schema["@type"]).toBe("Person");
			expect(schema.name).toBe("John Doe");
		});

		it("should include optional headline as description", () => {
			const schema = generateResumeSchema({
				name: "John Doe",
				headline: "Senior Software Engineer",
			});

			expect(schema.description).toBe("Senior Software Engineer");
		});

		it("should include optional email", () => {
			const schema = generateResumeSchema({
				name: "John Doe",
				email: "john@example.com",
			});

			expect(schema.email).toBe("john@example.com");
		});

		it("should include optional URL", () => {
			const schema = generateResumeSchema({
				name: "John Doe",
				url: "https://johndoe.com",
			});

			expect(schema.url).toBe("https://johndoe.com");
		});

		it("should include optional image", () => {
			const schema = generateResumeSchema({
				name: "John Doe",
				image: "https://example.com/photo.jpg",
			});

			expect(schema.image).toBe("https://example.com/photo.jpg");
		});

		it("should include optional jobTitle", () => {
			const schema = generateResumeSchema({
				name: "John Doe",
				jobTitle: "Software Engineer",
			});

			expect(schema.jobTitle).toBe("Software Engineer");
		});

		it("should include all fields when provided", () => {
			const schema = generateResumeSchema({
				name: "John Doe",
				headline: "Senior Engineer",
				email: "john@example.com",
				url: "https://johndoe.com",
				image: "https://example.com/photo.jpg",
				jobTitle: "Software Engineer",
			});

			expect(schema.name).toBe("John Doe");
			expect(schema.description).toBe("Senior Engineer");
			expect(schema.email).toBe("john@example.com");
			expect(schema.url).toBe("https://johndoe.com");
			expect(schema.image).toBe("https://example.com/photo.jpg");
			expect(schema.jobTitle).toBe("Software Engineer");
		});
	});

	// ==========================================================================
	// generateCanonicalLink Tests
	// ==========================================================================
	describe("generateCanonicalLink", () => {
		it("should generate canonical link object", () => {
			const link = generateCanonicalLink("https://example.com/page");

			expect(link.rel).toBe("canonical");
			expect(link.href).toBe("https://example.com/page");
		});

		it("should work with different URLs", () => {
			const link1 = generateCanonicalLink("https://example.com");
			const link2 = generateCanonicalLink("https://example.com/path/to/page");

			expect(link1.href).toBe("https://example.com");
			expect(link2.href).toBe("https://example.com/path/to/page");
		});
	});

	// ==========================================================================
	// defaultSEO Tests
	// ==========================================================================
	describe("defaultSEO", () => {
		it("should have appName", () => {
			expect(defaultSEO.appName).toBe("IMTA Resume");
		});

		it("should have tagline", () => {
			expect(defaultSEO.tagline).toBe("Build Your Career - Free Resume Builder");
		});

		it("should have description", () => {
			expect(defaultSEO.description).toContain("IMTA Resume");
			expect(defaultSEO.description).toContain("resume builder");
		});

		it("should generate title from appName and tagline", () => {
			expect(defaultSEO.title).toContain(defaultSEO.appName);
			expect(defaultSEO.title).toContain(defaultSEO.tagline);
		});
	});
});
