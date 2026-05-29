import { ORPCError } from "@orpc/client";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type CertificationStatus = "planned" | "in_progress" | "completed" | "expired";
export type CertificationCategory = "healthcare" | "industrial" | "hse" | "technology" | "management" | "language";

export type CreateCertificationInput = {
	userId: string;
	name: string;
	issuer: string;
	category?: string;
	status?: CertificationStatus;
	credentialId?: string;
	credentialUrl?: string;
	issueDate?: Date;
	expiryDate?: Date;
	cost?: number;
	currency?: string;
	notes?: string;
	reminderDays?: number;
};

export type UpdateCertificationInput = {
	id: string;
	userId: string;
	name?: string;
	issuer?: string;
	category?: string;
	status?: CertificationStatus;
	credentialId?: string;
	credentialUrl?: string;
	issueDate?: Date;
	expiryDate?: Date;
	cost?: number;
	currency?: string;
	notes?: string;
	reminderDays?: number;
};

export const certificationsService = {
	// Create a new certification
	create: async (input: CreateCertificationInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.certification).values({
			id,
			userId: input.userId,
			name: input.name,
			issuer: input.issuer,
			category: input.category,
			status: input.status ?? "planned",
			credentialId: input.credentialId,
			credentialUrl: input.credentialUrl,
			issueDate: input.issueDate,
			expiryDate: input.expiryDate,
			cost: input.cost,
			currency: input.currency ?? "MAD",
			notes: input.notes,
			reminderDays: input.reminderDays ?? 30,
		});

		return id;
	},

	// Get certification by ID
	getById: async (input: { id: string; userId: string }) => {
		const [certification] = await db
			.select()
			.from(schema.certification)
			.where(and(eq(schema.certification.id, input.id), eq(schema.certification.userId, input.userId)));

		if (!certification) {
			throw new ORPCError("NOT_FOUND", { message: "Certification not found" });
		}

		return certification;
	},

	// List certifications
	list: async (input: { userId: string; status?: CertificationStatus; category?: string }) => {
		const conditions = [eq(schema.certification.userId, input.userId)];

		if (input.status) {
			conditions.push(eq(schema.certification.status, input.status));
		}

		if (input.category) {
			conditions.push(eq(schema.certification.category, input.category));
		}

		const certifications = await db
			.select()
			.from(schema.certification)
			.where(and(...conditions))
			.orderBy(desc(schema.certification.updatedAt));

		return certifications;
	},

	// Update certification
	update: async (input: UpdateCertificationInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.certification.id })
			.from(schema.certification)
			.where(and(eq(schema.certification.id, input.id), eq(schema.certification.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Certification not found" });
		}

		await db
			.update(schema.certification)
			.set({
				name: input.name,
				issuer: input.issuer,
				category: input.category,
				status: input.status,
				credentialId: input.credentialId,
				credentialUrl: input.credentialUrl,
				issueDate: input.issueDate,
				expiryDate: input.expiryDate,
				cost: input.cost,
				currency: input.currency,
				notes: input.notes,
				reminderDays: input.reminderDays,
			})
			.where(and(eq(schema.certification.id, input.id), eq(schema.certification.userId, input.userId)));
	},

	// Delete certification
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.certification)
			.where(and(eq(schema.certification.id, input.id), eq(schema.certification.userId, input.userId)));
	},

	// Get certifications expiring soon
	getExpiringSoon: async (input: { userId: string; days?: number }) => {
		const daysAhead = input.days ?? 90;
		const now = new Date();
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + daysAhead);

		const certifications = await db
			.select()
			.from(schema.certification)
			.where(
				and(
					eq(schema.certification.userId, input.userId),
					eq(schema.certification.status, "completed"),
					gte(schema.certification.expiryDate, now),
					lte(schema.certification.expiryDate, futureDate),
				),
			)
			.orderBy(schema.certification.expiryDate);

		return certifications;
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const certifications = await db
			.select()
			.from(schema.certification)
			.where(eq(schema.certification.userId, input.userId));

		const total = certifications.length;
		const byStatus: Record<string, number> = {};
		const byCategory: Record<string, number> = {};
		let totalCost = 0;

		const now = new Date();
		let expiringSoon = 0;

		for (const cert of certifications) {
			byStatus[cert.status] = (byStatus[cert.status] ?? 0) + 1;
			if (cert.category) {
				byCategory[cert.category] = (byCategory[cert.category] ?? 0) + 1;
			}
			if (cert.cost) {
				totalCost += cert.cost;
			}

			// Check if expiring within 90 days
			if (cert.status === "completed" && cert.expiryDate) {
				const daysUntilExpiry = Math.ceil((cert.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
				if (daysUntilExpiry > 0 && daysUntilExpiry <= 90) {
					expiringSoon++;
				}
			}
		}

		return {
			total,
			byStatus,
			byCategory,
			totalCost,
			expiringSoon,
			active: byStatus.completed ?? 0,
			inProgress: byStatus.in_progress ?? 0,
			planned: byStatus.planned ?? 0,
			expired: byStatus.expired ?? 0,
		};
	},
};
