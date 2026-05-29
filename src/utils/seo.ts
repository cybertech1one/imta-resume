/**
 * SEO Utility Functions
 *
 * Provides helpers for generating meta tags, Open Graph tags,
 * Twitter Card tags, and JSON-LD structured data.
 */

export type MetaTagOptions = {
	title: string;
	description?: string;
	image?: string;
	url?: string;
	noIndex?: boolean;
	type?: "website" | "article" | "profile";
	siteName?: string;
};

export type MetaTag = { title: string } | { name: string; content: string } | { property: string; content: string };

/**
 * Generate an array of meta tags for SEO, Open Graph, and Twitter Cards.
 *
 * @param options - Configuration for meta tags
 * @returns Array of meta tag objects compatible with TanStack Router head
 */
export function generateMetaTags(options: MetaTagOptions): MetaTag[] {
	const { title, description, image, url, noIndex, type = "website", siteName = "IMTA Resume" } = options;

	const tags: (MetaTag | false | undefined | null)[] = [
		// Basic meta
		{ title },
		description ? { name: "description", content: description } : null,

		// Robots
		noIndex ? { name: "robots", content: "noindex, nofollow" } : null,

		// Open Graph
		{ property: "og:title", content: title },
		description ? { property: "og:description", content: description } : null,
		image ? { property: "og:image", content: image } : null,
		url ? { property: "og:url", content: url } : null,
		{ property: "og:type", content: type },
		{ property: "og:site_name", content: siteName },

		// Twitter Card
		{ property: "twitter:card", content: image ? "summary_large_image" : "summary" },
		{ property: "twitter:title", content: title },
		description ? { property: "twitter:description", content: description } : null,
		image ? { property: "twitter:image", content: image } : null,
	];

	return tags.filter(Boolean) as MetaTag[];
}

/**
 * Generate JSON-LD structured data for the organization/website.
 *
 * @param options - Configuration for structured data
 * @returns JSON-LD script tag content
 */
export type OrganizationSchema = {
	"@context": string;
	"@type": string;
	name: string;
	url: string;
	logo?: string;
	description?: string;
	sameAs?: string[];
};

export function generateOrganizationSchema(options: {
	name: string;
	url: string;
	logo?: string;
	description?: string;
	sameAs?: string[];
}): OrganizationSchema {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: options.name,
		url: options.url,
		...(options.logo && { logo: options.logo }),
		...(options.description && { description: options.description }),
		...(options.sameAs && { sameAs: options.sameAs }),
	};
}

/**
 * Generate JSON-LD structured data for the website.
 *
 * @param options - Configuration for structured data
 * @returns JSON-LD script tag content
 */
export type WebsiteSchema = {
	"@context": string;
	"@type": string;
	name: string;
	url: string;
	description?: string;
	potentialAction?: {
		"@type": string;
		target: string;
		"query-input": string;
	};
};

export function generateWebsiteSchema(options: {
	name: string;
	url: string;
	description?: string;
	potentialAction?: {
		type: "SearchAction";
		target: string;
		queryInput: string;
	};
}): WebsiteSchema {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: options.name,
		url: options.url,
		...(options.description && { description: options.description }),
		...(options.potentialAction && {
			potentialAction: {
				"@type": options.potentialAction.type,
				target: options.potentialAction.target,
				"query-input": options.potentialAction.queryInput,
			},
		}),
	};
}

/**
 * Generate JSON-LD structured data for a software application (the resume builder).
 *
 * @param options - Configuration for structured data
 * @returns JSON-LD script tag content
 */
export type SoftwareApplicationSchema = {
	"@context": string;
	"@type": string;
	name: string;
	url: string;
	description?: string;
	operatingSystem: string;
	applicationCategory: string;
	offers: {
		"@type": string;
		price: string;
		priceCurrency: string;
	};
};

export function generateSoftwareApplicationSchema(options: {
	name: string;
	url: string;
	description?: string;
	operatingSystem?: string;
	applicationCategory?: string;
	offers?: {
		price: string;
		priceCurrency: string;
	};
}): SoftwareApplicationSchema {
	return {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: options.name,
		url: options.url,
		...(options.description && { description: options.description }),
		operatingSystem: options.operatingSystem ?? "Web",
		applicationCategory: options.applicationCategory ?? "BusinessApplication",
		offers: {
			"@type": "Offer",
			price: options.offers?.price ?? "0",
			priceCurrency: options.offers?.priceCurrency ?? "USD",
		},
	};
}

/**
 * Generate JSON-LD structured data for a resume/CV page.
 *
 * @param options - Configuration for structured data
 * @returns JSON-LD script tag content
 */
export type ResumeSchema = {
	"@context": string;
	"@type": string;
	name: string;
	description?: string;
	email?: string;
	url?: string;
	image?: string;
	jobTitle?: string;
};

export function generateResumeSchema(options: {
	name: string;
	headline?: string;
	email?: string;
	url?: string;
	image?: string;
	jobTitle?: string;
}): ResumeSchema {
	return {
		"@context": "https://schema.org",
		"@type": "Person",
		name: options.name,
		...(options.headline && { description: options.headline }),
		...(options.email && { email: options.email }),
		...(options.url && { url: options.url }),
		...(options.image && { image: options.image }),
		...(options.jobTitle && { jobTitle: options.jobTitle }),
	};
}

/**
 * Generate a canonical URL meta tag.
 *
 * @param url - The canonical URL
 * @returns Link tag object
 */
export function generateCanonicalLink(url: string): { rel: "canonical"; href: string } {
	return { rel: "canonical", href: url };
}

/**
 * Generate JSON-LD structured data for FAQ page.
 * Enables rich snippets in search results showing FAQ questions and answers.
 *
 * @param questions - Array of FAQ question/answer pairs
 * @returns JSON-LD FAQPage schema
 */
export type FAQSchema = {
	"@context": string;
	"@type": string;
	mainEntity: Array<{
		"@type": string;
		name: string;
		acceptedAnswer: {
			"@type": string;
			text: string;
		};
	}>;
};

export function generateFAQSchema(questions: Array<{ question: string; answer: string }>): FAQSchema {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: questions.map((q) => ({
			"@type": "Question",
			name: q.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: q.answer,
			},
		})),
	};
}

/**
 * Generate JSON-LD structured data for breadcrumb navigation.
 * Helps search engines understand site structure.
 *
 * @param items - Array of breadcrumb items with name and url
 * @returns JSON-LD BreadcrumbList schema
 */
export type BreadcrumbSchema = {
	"@context": string;
	"@type": string;
	itemListElement: Array<{
		"@type": string;
		position: number;
		name: string;
		item?: string;
	}>;
};

export function generateBreadcrumbSchema(items: Array<{ name: string; url?: string }>): BreadcrumbSchema {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			...(item.url && { item: item.url }),
		})),
	};
}

/**
 * Generate JSON-LD structured data for a ProfilePage (resume/portfolio page).
 * More specific than Person schema for profile-type pages.
 *
 * @param options - Configuration for profile page
 * @returns JSON-LD ProfilePage schema
 */
export type ProfilePageSchema = {
	"@context": string;
	"@type": string;
	mainEntity: {
		"@type": string;
		name: string;
		description?: string;
		email?: string;
		telephone?: string;
		url?: string;
		image?: string;
		jobTitle?: string;
		address?: {
			"@type": string;
			addressLocality?: string;
			addressCountry?: string;
		};
		worksFor?: Array<{
			"@type": string;
			name: string;
		}>;
		alumniOf?: Array<{
			"@type": string;
			name: string;
		}>;
		knowsAbout?: string[];
		sameAs?: string[];
	};
	dateModified?: string;
};

export function generateProfilePageSchema(options: {
	name: string;
	headline?: string;
	email?: string;
	phone?: string;
	url?: string;
	image?: string;
	jobTitle?: string;
	location?: { city?: string; country?: string };
	employers?: string[];
	education?: string[];
	skills?: string[];
	socialLinks?: string[];
	dateModified?: string;
}): ProfilePageSchema {
	return {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		mainEntity: {
			"@type": "Person",
			name: options.name,
			...(options.headline && { description: options.headline }),
			...(options.email && { email: options.email }),
			...(options.phone && { telephone: options.phone }),
			...(options.url && { url: options.url }),
			...(options.image && { image: options.image }),
			...(options.jobTitle && { jobTitle: options.jobTitle }),
			...(options.location &&
				(options.location.city || options.location.country) && {
					address: {
						"@type": "PostalAddress",
						...(options.location.city && { addressLocality: options.location.city }),
						...(options.location.country && { addressCountry: options.location.country }),
					},
				}),
			...(options.employers &&
				options.employers.length > 0 && {
					worksFor: options.employers.map((name) => ({
						"@type": "Organization",
						name,
					})),
				}),
			...(options.education &&
				options.education.length > 0 && {
					alumniOf: options.education.map((name) => ({
						"@type": "EducationalOrganization",
						name,
					})),
				}),
			...(options.skills && options.skills.length > 0 && { knowsAbout: options.skills }),
			...(options.socialLinks && options.socialLinks.length > 0 && { sameAs: options.socialLinks }),
		},
		...(options.dateModified && { dateModified: options.dateModified }),
	};
}

/**
 * Generate JSON-LD structured data for a digital business card (ContactPage).
 *
 * @param options - Configuration for business card
 * @returns JSON-LD ContactPage schema
 */
export type BusinessCardSchema = {
	"@context": string;
	"@type": string;
	name: string;
	description?: string;
	mainEntity: {
		"@type": string;
		name: string;
		email?: string;
		telephone?: string;
		url?: string;
		image?: string;
		jobTitle?: string;
	};
};

export function generateBusinessCardSchema(options: {
	name: string;
	description?: string;
	email?: string;
	phone?: string;
	url?: string;
	image?: string;
	jobTitle?: string;
}): BusinessCardSchema {
	return {
		"@context": "https://schema.org",
		"@type": "ContactPage",
		name: `${options.name} - Digital Business Card`,
		...(options.description && { description: options.description }),
		mainEntity: {
			"@type": "Person",
			name: options.name,
			...(options.email && { email: options.email }),
			...(options.phone && { telephone: options.phone }),
			...(options.url && { url: options.url }),
			...(options.image && { image: options.image }),
			...(options.jobTitle && { jobTitle: options.jobTitle }),
		},
	};
}

/**
 * Generate JSON-LD structured data for HowTo content (process/steps).
 *
 * @param options - Configuration for how-to content
 * @returns JSON-LD HowTo schema
 */
export type HowToSchema = {
	"@context": string;
	"@type": string;
	name: string;
	description?: string;
	step: Array<{
		"@type": string;
		position: number;
		name: string;
		text?: string;
	}>;
};

export function generateHowToSchema(options: {
	name: string;
	description?: string;
	steps: Array<{ name: string; text?: string }>;
}): HowToSchema {
	return {
		"@context": "https://schema.org",
		"@type": "HowTo",
		name: options.name,
		...(options.description && { description: options.description }),
		step: options.steps.map((step, index) => ({
			"@type": "HowToStep",
			position: index + 1,
			name: step.name,
			...(step.text && { text: step.text }),
		})),
	};
}

/**
 * Generate JSON-LD structured data for an article page.
 *
 * @param options - Configuration for article structured data
 * @returns JSON-LD Article schema
 */
export type ArticleSchema = {
	"@context": string;
	"@type": string;
	headline: string;
	description?: string;
	dateModified?: string;
	publisher: {
		"@type": string;
		name: string;
	};
	mainEntityOfPage?: {
		"@type": string;
		"@id": string;
	};
};

export function generateArticleSchema(options: {
	headline: string;
	description?: string;
	dateModified?: string;
	url?: string;
	publisherName?: string;
}): ArticleSchema {
	return {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: options.headline,
		...(options.description && { description: options.description }),
		...(options.dateModified && { dateModified: options.dateModified }),
		publisher: {
			"@type": "Organization",
			name: options.publisherName ?? "IMTA Resume",
		},
		...(options.url && {
			mainEntityOfPage: {
				"@type": "WebPage",
				"@id": options.url,
			},
		}),
	};
}

/**
 * Default SEO configuration for the application.
 */
export const defaultSEO = {
	appName: "IMTA Resume",
	tagline: "Construisez Votre Carrière - Créateur de CV Gratuit",
	description:
		"IMTA Resume est le créateur de CV gratuit officiel pour les étudiants et professionnels de l'école IMTA au Maroc. Créez des CV professionnels et optimisés ATS en quelques minutes.",
	get title() {
		return `${this.appName} \u2014 ${this.tagline}`;
	},
};
