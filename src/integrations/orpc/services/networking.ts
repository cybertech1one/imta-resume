import { ORPCError } from "@orpc/client";
import { and, count, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type ContactRelationship =
	| "colleague"
	| "mentor"
	| "recruiter"
	| "hiring_manager"
	| "industry_peer"
	| "alumni"
	| "referral"
	| "other";

export type RelationshipStrength = "strong" | "moderate" | "weak" | "dormant";

export type CreateContactInput = {
	userId: string;
	name: string;
	email?: string;
	phone?: string;
	company?: string;
	position?: string;
	linkedinUrl?: string;
	relationship?: ContactRelationship;
	relationshipStrength?: RelationshipStrength;
	howMet?: string;
	notes?: string;
	tags?: string[];
	lastContactedAt?: Date;
	nextFollowUpAt?: Date;
	isFavorite?: boolean;
};

export type UpdateContactInput = {
	id: string;
	userId: string;
	name?: string;
	email?: string;
	phone?: string;
	company?: string;
	position?: string;
	linkedinUrl?: string;
	relationship?: ContactRelationship;
	relationshipStrength?: RelationshipStrength;
	howMet?: string;
	notes?: string;
	tags?: string[];
	lastContactedAt?: Date;
	nextFollowUpAt?: Date;
	isFavorite?: boolean;
};

export type CreateInteractionInput = {
	contactId: string;
	interactionType: string;
	description?: string;
	outcome?: string;
	followUpNeeded?: boolean;
	followUpDate?: Date;
	interactedAt?: Date;
};

export const networkingService = {
	// Create a new contact
	create: async (input: CreateContactInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.networkingContact).values({
			id,
			userId: input.userId,
			name: input.name,
			email: input.email,
			phone: input.phone,
			company: input.company,
			position: input.position,
			linkedinUrl: input.linkedinUrl,
			relationship: input.relationship ?? "other",
			relationshipStrength: input.relationshipStrength ?? "moderate",
			howMet: input.howMet,
			notes: input.notes,
			tags: input.tags ?? [],
			lastContactedAt: input.lastContactedAt,
			nextFollowUpAt: input.nextFollowUpAt,
			isFavorite: input.isFavorite ?? false,
		});

		return id;
	},

	// Get contact by ID
	getById: async (input: { id: string; userId: string }) => {
		const [contact] = await db
			.select()
			.from(schema.networkingContact)
			.where(and(eq(schema.networkingContact.id, input.id), eq(schema.networkingContact.userId, input.userId)));

		if (!contact) {
			throw new ORPCError("NOT_FOUND", { message: "Contact not found" });
		}

		// Get interactions
		const interactions = await db
			.select()
			.from(schema.contactInteraction)
			.where(eq(schema.contactInteraction.contactId, contact.id))
			.orderBy(desc(schema.contactInteraction.interactedAt))
			.limit(20);

		return { ...contact, interactions };
	},

	// List contacts
	list: async (input: {
		userId: string;
		search?: string;
		relationship?: ContactRelationship;
		relationshipStrength?: RelationshipStrength;
		company?: string;
		tags?: string[];
		favoritesOnly?: boolean;
		needsFollowUp?: boolean;
		limit?: number;
		offset?: number;
	}) => {
		const conditions = [eq(schema.networkingContact.userId, input.userId)];

		if (input.search) {
			const searchCondition = or(
				ilike(schema.networkingContact.name, `%${input.search}%`),
				ilike(schema.networkingContact.company, `%${input.search}%`),
				ilike(schema.networkingContact.position, `%${input.search}%`),
				ilike(schema.networkingContact.email, `%${input.search}%`),
			);
			if (searchCondition) conditions.push(searchCondition);
		}

		if (input.relationship) {
			conditions.push(eq(schema.networkingContact.relationship, input.relationship));
		}

		if (input.relationshipStrength) {
			conditions.push(eq(schema.networkingContact.relationshipStrength, input.relationshipStrength));
		}

		if (input.company) {
			conditions.push(ilike(schema.networkingContact.company, `%${input.company}%`));
		}

		if (input.favoritesOnly) {
			conditions.push(eq(schema.networkingContact.isFavorite, true));
		}

		if (input.needsFollowUp) {
			conditions.push(lte(schema.networkingContact.nextFollowUpAt, new Date()));
		}

		return await db
			.select()
			.from(schema.networkingContact)
			.where(and(...conditions))
			.orderBy(desc(schema.networkingContact.isFavorite), desc(schema.networkingContact.lastContactedAt))
			.limit(input.limit ?? 50)
			.offset(input.offset ?? 0);
	},

	// Update contact
	update: async (input: UpdateContactInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.networkingContact.id })
			.from(schema.networkingContact)
			.where(and(eq(schema.networkingContact.id, input.id), eq(schema.networkingContact.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Contact not found" });
		}

		await db
			.update(schema.networkingContact)
			.set({
				name: input.name,
				email: input.email,
				phone: input.phone,
				company: input.company,
				position: input.position,
				linkedinUrl: input.linkedinUrl,
				relationship: input.relationship,
				relationshipStrength: input.relationshipStrength,
				howMet: input.howMet,
				notes: input.notes,
				tags: input.tags,
				lastContactedAt: input.lastContactedAt,
				nextFollowUpAt: input.nextFollowUpAt,
				isFavorite: input.isFavorite,
			})
			.where(and(eq(schema.networkingContact.id, input.id), eq(schema.networkingContact.userId, input.userId)));
	},

	// Toggle favorite
	toggleFavorite: async (input: { id: string; userId: string }): Promise<boolean> => {
		const [existing] = await db
			.select({ isFavorite: schema.networkingContact.isFavorite })
			.from(schema.networkingContact)
			.where(and(eq(schema.networkingContact.id, input.id), eq(schema.networkingContact.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Contact not found" });
		}

		const newFavorite = !existing.isFavorite;

		await db
			.update(schema.networkingContact)
			.set({ isFavorite: newFavorite })
			.where(and(eq(schema.networkingContact.id, input.id), eq(schema.networkingContact.userId, input.userId)));

		return newFavorite;
	},

	// Delete contact
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.networkingContact)
			.where(and(eq(schema.networkingContact.id, input.id), eq(schema.networkingContact.userId, input.userId)));
	},

	// Interaction methods
	interactions: {
		// Add interaction
		add: async (input: CreateInteractionInput): Promise<string> => {
			const id = generateId();

			await db.transaction(async (tx) => {
				await tx.insert(schema.contactInteraction).values({
					id,
					contactId: input.contactId,
					interactionType: input.interactionType,
					description: input.description,
					outcome: input.outcome,
					followUpNeeded: input.followUpNeeded ?? false,
					followUpDate: input.followUpDate,
					interactedAt: input.interactedAt ?? new Date(),
				});

				// Update last contacted date on contact
				await tx
					.update(schema.networkingContact)
					.set({
						lastContactedAt: input.interactedAt ?? new Date(),
						nextFollowUpAt: input.followUpDate,
					})
					.where(eq(schema.networkingContact.id, input.contactId));
			});

			return id;
		},

		// List interactions for a contact
		list: async (input: { contactId: string; limit?: number }) => {
			return await db
				.select()
				.from(schema.contactInteraction)
				.where(eq(schema.contactInteraction.contactId, input.contactId))
				.orderBy(desc(schema.contactInteraction.interactedAt))
				.limit(input.limit ?? 50);
		},

		// Delete interaction
		delete: async (input: { id: string; contactId: string }): Promise<void> => {
			await db
				.delete(schema.contactInteraction)
				.where(
					and(eq(schema.contactInteraction.id, input.id), eq(schema.contactInteraction.contactId, input.contactId)),
				);
		},
	},

	// Get contacts needing follow-up
	getFollowUpReminders: async (input: { userId: string; daysAhead?: number }) => {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + (input.daysAhead ?? 7));

		// Also consider contacts with no nextFollowUpAt whose last interaction was over 30 days ago
		const staleDate = new Date();
		staleDate.setDate(staleDate.getDate() - 30);

		return await db
			.select()
			.from(schema.networkingContact)
			.where(
				and(
					eq(schema.networkingContact.userId, input.userId),
					or(
						// Contacts with a scheduled follow-up that's due
						lte(schema.networkingContact.nextFollowUpAt, futureDate),
						// Contacts with no scheduled follow-up but stale (last contact > 30 days ago or never contacted)
						and(
							isNull(schema.networkingContact.nextFollowUpAt),
							or(
								lte(schema.networkingContact.lastContactedAt, staleDate),
								isNull(schema.networkingContact.lastContactedAt),
							),
						),
					),
				),
			)
			.orderBy(schema.networkingContact.nextFollowUpAt);
	},

	// Get dormant contacts (not contacted in X days)
	getDormantContacts: async (input: { userId: string; daysSinceContact?: number }) => {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - (input.daysSinceContact ?? 60));

		return await db
			.select()
			.from(schema.networkingContact)
			.where(
				and(
					eq(schema.networkingContact.userId, input.userId),
					or(
						lte(schema.networkingContact.lastContactedAt, cutoffDate),
						sql`${schema.networkingContact.lastContactedAt} IS NULL`,
					),
				),
			)
			.orderBy(schema.networkingContact.lastContactedAt);
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		// Use SQL GROUP BY for aggregations instead of fetching all contacts and counting in JS
		const userCondition = eq(schema.networkingContact.userId, input.userId);

		// Get total count
		const [totalResult] = await db.select({ count: count() }).from(schema.networkingContact).where(userCondition);
		const total = Number(totalResult?.count ?? 0);

		// Get favorites count
		const [favoritesResult] = await db
			.select({ count: count() })
			.from(schema.networkingContact)
			.where(and(userCondition, eq(schema.networkingContact.isFavorite, true)));
		const favorites = Number(favoritesResult?.count ?? 0);

		// Get counts by relationship using GROUP BY
		const relationshipCounts = await db
			.select({
				relationship: schema.networkingContact.relationship,
				count: count(),
			})
			.from(schema.networkingContact)
			.where(userCondition)
			.groupBy(schema.networkingContact.relationship);

		const byRelationship: Record<string, number> = {};
		for (const row of relationshipCounts) {
			byRelationship[row.relationship] = Number(row.count);
		}

		// Get counts by relationship strength using GROUP BY
		const strengthCounts = await db
			.select({
				strength: schema.networkingContact.relationshipStrength,
				count: count(),
			})
			.from(schema.networkingContact)
			.where(and(userCondition, sql`${schema.networkingContact.relationshipStrength} IS NOT NULL`))
			.groupBy(schema.networkingContact.relationshipStrength);

		const byStrength: Record<string, number> = {};
		for (const row of strengthCounts) {
			if (row.strength) {
				byStrength[row.strength] = Number(row.count);
			}
		}

		// Get top companies using GROUP BY with ORDER BY and LIMIT
		const companyCounts = await db
			.select({
				company: schema.networkingContact.company,
				count: count(),
			})
			.from(schema.networkingContact)
			.where(and(userCondition, sql`${schema.networkingContact.company} IS NOT NULL`))
			.groupBy(schema.networkingContact.company)
			.orderBy(sql`count(*) DESC`)
			.limit(5);

		const topCompanies = companyCounts
			.filter((row) => row.company)
			.map((row) => ({
				company: row.company as string,
				count: Number(row.count),
			}));

		// Get recent interactions count
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);

		const [recentInteractionsResult] = await db
			.select({ count: count() })
			.from(schema.contactInteraction)
			.innerJoin(schema.networkingContact, eq(schema.contactInteraction.contactId, schema.networkingContact.id))
			.where(
				and(eq(schema.networkingContact.userId, input.userId), gte(schema.contactInteraction.interactedAt, weekAgo)),
			);

		// Count needing follow-up using SQL
		const [needsFollowUpResult] = await db
			.select({ count: count() })
			.from(schema.networkingContact)
			.where(and(userCondition, lte(schema.networkingContact.nextFollowUpAt, new Date())));

		return {
			total,
			favorites,
			byRelationship,
			byStrength,
			topCompanies,
			recentInteractions: Number(recentInteractionsResult?.count ?? 0),
			needsFollowUp: Number(needsFollowUpResult?.count ?? 0),
		};
	},
};
