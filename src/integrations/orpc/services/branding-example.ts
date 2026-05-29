import { and, asc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";

export type BrandingExampleCategory = "profession" | "audience" | "strength" | "value" | "personality";

export type BrandingExample = {
	id: string;
	category: string;
	value: string;
	valueFr: string | null;
	field: string | null;
	isActive: boolean;
	sortOrder: number | null;
};

// Fallback data for when database is empty
const FALLBACK_DATA: Record<BrandingExampleCategory, string[]> = {
	profession: [
		"Developpeur Web",
		"Designer UX/UI",
		"Chef de Projet",
		"Consultant Marketing",
		"Data Scientist",
		"Infirmier",
		"Technicien HSE",
		"Electromecanicien",
	],
	audience: [
		"Startups Tech",
		"PME Industrielles",
		"Hopitaux et Cliniques",
		"Agences de Communication",
		"Grandes Entreprises",
		"Entrepreneurs",
	],
	strength: [
		"Resolution de problemes complexes",
		"Communication empathique",
		"Innovation creative",
		"Leadership naturel",
		"Attention aux details",
		"Adaptabilite rapide",
	],
	value: [
		"Augmenter la productivite",
		"Reduire les couts",
		"Ameliorer l'experience client",
		"Garantir la securite",
		"Accelerer la croissance",
		"Optimiser les processus",
	],
	personality: [
		"Professionnel et serieux",
		"Creatif et innovant",
		"Chaleureux et accessible",
		"Dynamique et energique",
		"Calme et reflechi",
		"Audacieux et ambitieux",
	],
};

export const brandingExampleService = {
	// List examples by category
	list: async (category: BrandingExampleCategory, field?: string): Promise<string[]> => {
		const conditions = [eq(schema.brandingExample.category, category), eq(schema.brandingExample.isActive, true)];

		if (field) {
			conditions.push(eq(schema.brandingExample.field, field));
		}

		const examples = await db
			.select()
			.from(schema.brandingExample)
			.where(and(...conditions))
			.orderBy(asc(schema.brandingExample.sortOrder));

		// Return database values, or fallback if empty
		if (examples.length === 0) {
			return FALLBACK_DATA[category] || [];
		}

		return examples.map((e) => e.value);
	},

	// List all examples (for admin)
	listAll: async (): Promise<BrandingExample[]> => {
		const examples = await db
			.select()
			.from(schema.brandingExample)
			.orderBy(asc(schema.brandingExample.category), asc(schema.brandingExample.sortOrder));

		return examples;
	},

	// Get single example
	get: async (id: string): Promise<BrandingExample | null> => {
		const [example] = await db.select().from(schema.brandingExample).where(eq(schema.brandingExample.id, id));

		return example || null;
	},

	// Create example (admin only)
	create: async (data: {
		id: string;
		category: string;
		value: string;
		valueFr?: string;
		field?: string;
		isActive?: boolean;
		sortOrder?: number;
	}): Promise<BrandingExample> => {
		const [example] = await db
			.insert(schema.brandingExample)
			.values({
				id: data.id,
				category: data.category,
				value: data.value,
				valueFr: data.valueFr,
				field: data.field,
				isActive: data.isActive ?? true,
				sortOrder: data.sortOrder,
			})
			.returning();

		return example;
	},

	// Update example (admin only)
	update: async (
		id: string,
		data: Partial<{
			value: string;
			valueFr: string;
			field: string | null;
			isActive: boolean;
			sortOrder: number;
		}>,
	): Promise<BrandingExample | null> => {
		const [example] = await db
			.update(schema.brandingExample)
			.set(data)
			.where(eq(schema.brandingExample.id, id))
			.returning();

		return example || null;
	},

	// Delete example (admin only)
	delete: async (id: string): Promise<boolean> => {
		const result = await db.delete(schema.brandingExample).where(eq(schema.brandingExample.id, id));

		return (result.rowCount ?? 0) > 0;
	},

	// Seed initial data
	seed: async (): Promise<number> => {
		let count = 0;

		for (const [category, values] of Object.entries(FALLBACK_DATA)) {
			for (let i = 0; i < values.length; i++) {
				const value = values[i];
				const id = `${category}_${i + 1}`;

				// Check if exists
				const [existing] = await db.select().from(schema.brandingExample).where(eq(schema.brandingExample.id, id));

				if (!existing) {
					await db.insert(schema.brandingExample).values({
						id,
						category,
						value,
						valueFr: value, // Same as value for French examples
						isActive: true,
						sortOrder: i + 1,
					});
					count++;
				}
			}
		}

		return count;
	},
};
