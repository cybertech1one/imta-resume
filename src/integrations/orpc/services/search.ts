import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { SearchResultType } from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Search result item type
export type SearchResultItem = {
	id: string;
	type: SearchResultType;
	title: string;
	subtitle?: string;
	path?: string;
	icon?: string;
	metadata?: Record<string, unknown>;
};

// Global search input type
export type GlobalSearchInput = {
	userId: string;
	query: string;
	limit?: number;
};

// Recent search input type
export type SaveRecentSearchInput = {
	userId: string;
	query: string;
	resultType: SearchResultType;
	resultId?: string;
	resultTitle: string;
	resultPath?: string;
};

// Calculate match score for sorting
function calculateMatchScore(text: string, query: string): number {
	if (!text || !query) return 0;
	const normalizedText = text.toLowerCase();
	const normalizedQuery = query.toLowerCase();

	// Exact match gets highest score
	if (normalizedText === normalizedQuery) return 100;

	// Starts with query gets high score
	if (normalizedText.startsWith(normalizedQuery)) return 80;

	// Contains exact query gets medium score
	if (normalizedText.includes(normalizedQuery)) return 60;

	// Fuzzy match gets lower score
	const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
	const matchedWords = queryWords.filter((word) => normalizedText.includes(word));
	return (matchedWords.length / queryWords.length) * 40;
}

export const searchService = {
	// Search across all user data
	globalSearch: async (input: GlobalSearchInput): Promise<SearchResultItem[]> => {
		const { userId, query, limit = 20 } = input;

		if (!query.trim()) {
			return [];
		}

		const searchPattern = `%${query}%`;
		const results: SearchResultItem[] = [];

		// Search resumes
		const resumes = await db
			.select({
				id: schema.resume.id,
				name: schema.resume.name,
				slug: schema.resume.slug,
				tags: schema.resume.tags,
				updatedAt: schema.resume.updatedAt,
			})
			.from(schema.resume)
			.where(
				and(
					eq(schema.resume.userId, userId),
					or(
						ilike(schema.resume.name, searchPattern),
						ilike(schema.resume.slug, searchPattern),
						sql`EXISTS (SELECT 1 FROM unnest(${schema.resume.tags}) AS tag WHERE tag ILIKE ${searchPattern})`,
					),
				),
			)
			.orderBy(desc(schema.resume.updatedAt))
			.limit(limit);

		for (const resume of resumes) {
			results.push({
				id: resume.id,
				type: "resume",
				title: resume.name,
				subtitle: resume.tags.length > 0 ? resume.tags.join(", ") : undefined,
				path: `/builder/${resume.id}`,
				icon: "ReadCvLogo",
				metadata: { slug: resume.slug },
			});
		}

		// Search job applications
		const applications = await db
			.select({
				id: schema.jobApplication.id,
				companyName: schema.jobApplication.companyName,
				position: schema.jobApplication.position,
				status: schema.jobApplication.status,
				updatedAt: schema.jobApplication.updatedAt,
			})
			.from(schema.jobApplication)
			.where(
				and(
					eq(schema.jobApplication.userId, userId),
					or(
						ilike(schema.jobApplication.companyName, searchPattern),
						ilike(schema.jobApplication.position, searchPattern),
					),
				),
			)
			.orderBy(desc(schema.jobApplication.updatedAt))
			.limit(limit);

		for (const app of applications) {
			results.push({
				id: app.id,
				type: "job_application",
				title: app.position,
				subtitle: `${app.companyName} - ${app.status.replace("_", " ")}`,
				path: `/dashboard/jobs/applications`,
				icon: "Briefcase",
				metadata: { status: app.status, companyName: app.companyName },
			});
		}

		// Search contacts
		const contacts = await db
			.select({
				id: schema.networkingContact.id,
				name: schema.networkingContact.name,
				company: schema.networkingContact.company,
				position: schema.networkingContact.position,
				relationship: schema.networkingContact.relationship,
			})
			.from(schema.networkingContact)
			.where(
				and(
					eq(schema.networkingContact.userId, userId),
					or(
						ilike(schema.networkingContact.name, searchPattern),
						ilike(schema.networkingContact.company, searchPattern),
						ilike(schema.networkingContact.position, searchPattern),
					),
				),
			)
			.orderBy(desc(schema.networkingContact.updatedAt))
			.limit(limit);

		for (const contact of contacts) {
			results.push({
				id: contact.id,
				type: "contact",
				title: contact.name,
				subtitle: contact.company
					? `${contact.position || ""} at ${contact.company}`.trim()
					: contact.position || undefined,
				path: `/dashboard/networking/contacts`,
				icon: "AddressBook",
				metadata: { relationship: contact.relationship },
			});
		}

		// Search user skills
		const skills = await db
			.select({
				id: schema.userSkill.id,
				name: schema.userSkill.name,
				nameFr: schema.userSkill.nameFr,
				category: schema.userSkill.category,
				rating: schema.userSkill.rating,
			})
			.from(schema.userSkill)
			.where(
				and(
					eq(schema.userSkill.userId, userId),
					or(ilike(schema.userSkill.name, searchPattern), ilike(schema.userSkill.nameFr, searchPattern)),
				),
			)
			.orderBy(desc(schema.userSkill.updatedAt))
			.limit(limit);

		for (const skill of skills) {
			results.push({
				id: skill.id,
				type: "skill",
				title: skill.name,
				subtitle: `${skill.category} - Level ${skill.rating}/5`,
				path: `/dashboard/career/skills`,
				icon: "Target",
				metadata: { category: skill.category, rating: skill.rating },
			});
		}

		// Sort all results by match score
		results.sort((a, b) => {
			const scoreA =
				calculateMatchScore(a.title, query) + (a.subtitle ? calculateMatchScore(a.subtitle, query) * 0.5 : 0);
			const scoreB =
				calculateMatchScore(b.title, query) + (b.subtitle ? calculateMatchScore(b.subtitle, query) * 0.5 : 0);
			return scoreB - scoreA;
		});

		return results.slice(0, limit);
	},

	// Get recent searches for a user
	getRecentSearches: async (input: { userId: string; limit?: number }): Promise<SearchResultItem[]> => {
		const { userId, limit = 10 } = input;

		const searches = await db
			.select()
			.from(schema.recentSearch)
			.where(eq(schema.recentSearch.userId, userId))
			.orderBy(desc(schema.recentSearch.createdAt))
			.limit(limit);

		return searches.map((search) => ({
			id: search.id,
			type: search.resultType,
			title: search.resultTitle,
			path: search.resultPath || undefined,
			icon: getIconForType(search.resultType),
			metadata: { query: search.query, resultId: search.resultId },
		}));
	},

	// Save a recent search
	saveRecentSearch: async (input: SaveRecentSearchInput): Promise<string> => {
		const id = generateId();

		// First, delete any existing recent search with the same resultId or resultTitle to avoid duplicates
		if (input.resultId) {
			await db
				.delete(schema.recentSearch)
				.where(and(eq(schema.recentSearch.userId, input.userId), eq(schema.recentSearch.resultId, input.resultId)));
		} else {
			await db
				.delete(schema.recentSearch)
				.where(
					and(
						eq(schema.recentSearch.userId, input.userId),
						eq(schema.recentSearch.resultTitle, input.resultTitle),
						eq(schema.recentSearch.resultType, input.resultType),
					),
				);
		}

		// Insert the new recent search
		await db.insert(schema.recentSearch).values({
			id,
			userId: input.userId,
			query: input.query,
			resultType: input.resultType,
			resultId: input.resultId,
			resultTitle: input.resultTitle,
			resultPath: input.resultPath,
		});

		// Clean up old searches, keeping only the most recent 50
		const oldSearches = await db
			.select({ id: schema.recentSearch.id })
			.from(schema.recentSearch)
			.where(eq(schema.recentSearch.userId, input.userId))
			.orderBy(desc(schema.recentSearch.createdAt))
			.offset(50);

		if (oldSearches.length > 0) {
			// Use batch delete with IN clause instead of N individual DELETE queries
			const idsToDelete = oldSearches.map((s) => s.id);
			await db.delete(schema.recentSearch).where(inArray(schema.recentSearch.id, idsToDelete));
		}

		return id;
	},

	// Clear all recent searches for a user
	clearRecentSearches: async (input: { userId: string }): Promise<void> => {
		await db.delete(schema.recentSearch).where(eq(schema.recentSearch.userId, input.userId));
	},

	// Delete a specific recent search
	deleteRecentSearch: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.recentSearch)
			.where(and(eq(schema.recentSearch.id, input.id), eq(schema.recentSearch.userId, input.userId)));
	},
};

// Helper function to get icon name for result type
function getIconForType(type: SearchResultType): string {
	switch (type) {
		case "route":
			return "NavigationArrow";
		case "resume":
			return "ReadCvLogo";
		case "job_application":
			return "Briefcase";
		case "contact":
			return "AddressBook";
		case "skill":
			return "Target";
		default:
			return "MagnifyingGlass";
	}
}
