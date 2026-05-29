import { ORPCError } from "@orpc/client";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";

export type CertificationLibraryLevel = "beginner" | "intermediate" | "advanced";

export type CertificationLibraryItem = {
	id: string;
	name: string;
	nameFr: string | null;
	provider: string;
	field: string;
	level: string | null;
	duration: string | null;
	cost: string | null;
	description: string | null;
	descriptionFr: string | null;
	skills: string[] | null;
	prerequisites: string[] | null;
	url: string | null;
	isRecommended: boolean | null;
	isActive: boolean;
	sortOrder: number | null;
	createdAt: Date;
	updatedAt: Date;
};

export type CreateCertificationLibraryInput = {
	id: string;
	name: string;
	nameFr?: string;
	provider: string;
	field: string;
	level?: string;
	duration?: string;
	cost?: string;
	description?: string;
	descriptionFr?: string;
	skills?: string[];
	prerequisites?: string[];
	url?: string;
	isRecommended?: boolean;
	isActive?: boolean;
	sortOrder?: number;
};

export type UpdateCertificationLibraryInput = Partial<CreateCertificationLibraryInput> & { id: string };

// Default seed data from the RECOMMENDED_CERTIFICATIONS array
const SEED_CERTIFICATIONS: CreateCertificationLibraryInput[] = [
	{
		id: "cert_osha_30",
		name: "OSHA 30-Hour",
		nameFr: "OSHA 30 Heures",
		provider: "OSHA",
		field: "hse",
		level: "intermediate",
		duration: "30 hours",
		cost: "200 USD",
		description: "Comprehensive workplace safety training for supervisors and managers.",
		descriptionFr: "Formation approfondie en securite au travail pour les superviseurs et gestionnaires.",
		skills: ["Workplace Safety", "Risk Assessment", "OSHA Regulations"],
		prerequisites: [],
		url: "https://www.osha.gov/training",
		isRecommended: true,
		isActive: true,
		sortOrder: 1,
	},
	{
		id: "cert_csp",
		name: "Certified Safety Professional",
		nameFr: "Professionnel Certifie en Securite",
		provider: "BCSP",
		field: "hse",
		level: "advanced",
		duration: "6 months preparation",
		cost: "500 USD",
		description: "Advanced certification for safety professionals in the workplace.",
		descriptionFr: "Certification avancee pour les professionnels de la securite au travail.",
		skills: ["Safety Management", "Risk Analysis", "Regulatory Compliance"],
		prerequisites: ["Bachelor's degree or equivalent experience"],
		url: "https://www.bcsp.org/CSP",
		isRecommended: true,
		isActive: true,
		sortOrder: 2,
	},
	{
		id: "cert_bls",
		name: "BLS Provider",
		nameFr: "Fournisseur BLS",
		provider: "American Heart Association",
		field: "healthcare",
		level: "beginner",
		duration: "4-8 hours",
		cost: "100 USD",
		description: "Basic Life Support certification including CPR and AED use.",
		descriptionFr: "Reanimation cardio-pulmonaire et utilisation du defibrillateur.",
		skills: ["CPR", "AED", "First Aid"],
		prerequisites: [],
		url: "https://cpr.heart.org/en/courses/bls-provider",
		isRecommended: true,
		isActive: true,
		sortOrder: 3,
	},
	{
		id: "cert_iso_9001",
		name: "ISO 9001 Lead Auditor",
		nameFr: "Auditeur Principal ISO 9001",
		provider: "IRCA",
		field: "industrial",
		level: "advanced",
		duration: "5 days",
		cost: "2000 EUR",
		description: "Certification for auditing quality management systems.",
		descriptionFr: "Certification pour auditer les systemes de management de la qualite.",
		skills: ["Quality Management", "Auditing", "ISO Standards"],
		prerequisites: ["ISO 9001 Foundation knowledge"],
		url: "https://www.irca.org/",
		isRecommended: true,
		isActive: true,
		sortOrder: 4,
	},
	{
		id: "cert_cmrp",
		name: "Certified Maintenance & Reliability Professional",
		nameFr: "Professionnel Certifie en Maintenance",
		provider: "SMRP",
		field: "technical",
		level: "intermediate",
		duration: "Self-paced",
		cost: "400 USD",
		description: "Expertise in predictive maintenance and asset management.",
		descriptionFr: "Expertise en maintenance predictive et gestion des actifs.",
		skills: ["Maintenance Planning", "Reliability Engineering", "Asset Management"],
		prerequisites: ["2+ years maintenance experience"],
		url: "https://smrp.org/CMRP",
		isRecommended: true,
		isActive: true,
		sortOrder: 5,
	},
	{
		id: "cert_prince2",
		name: "PRINCE2 Practitioner",
		nameFr: "Praticien PRINCE2",
		provider: "AXELOS",
		field: "management",
		level: "intermediate",
		duration: "3-5 days",
		cost: "600 EUR",
		description: "Internationally recognized project management methodology.",
		descriptionFr: "Methodologie de gestion de projet reconnue internationalement.",
		skills: ["Project Management", "Risk Management", "Stakeholder Management"],
		prerequisites: ["PRINCE2 Foundation certification"],
		url: "https://www.axelos.com/certifications/prince2",
		isRecommended: true,
		isActive: true,
		sortOrder: 6,
	},
];

export const certificationLibraryService = {
	// List certifications with optional filters
	list: async (input: {
		field?: string;
		level?: string;
		isRecommended?: boolean;
		activeOnly?: boolean;
		search?: string;
	}): Promise<CertificationLibraryItem[]> => {
		const conditions = [];

		if (input.field) {
			conditions.push(eq(schema.certificationLibrary.field, input.field));
		}

		if (input.level) {
			conditions.push(eq(schema.certificationLibrary.level, input.level));
		}

		if (input.isRecommended !== undefined) {
			conditions.push(eq(schema.certificationLibrary.isRecommended, input.isRecommended));
		}

		if (input.activeOnly !== false) {
			conditions.push(eq(schema.certificationLibrary.isActive, true));
		}

		if (input.search) {
			const searchTerm = `%${input.search}%`;
			conditions.push(
				or(
					ilike(schema.certificationLibrary.name, searchTerm),
					ilike(schema.certificationLibrary.nameFr, searchTerm),
					ilike(schema.certificationLibrary.provider, searchTerm),
					ilike(schema.certificationLibrary.description, searchTerm),
				),
			);
		}

		const certifications = await db
			.select()
			.from(schema.certificationLibrary)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(asc(schema.certificationLibrary.sortOrder), asc(schema.certificationLibrary.name));

		return certifications;
	},

	// Get certification by ID
	getById: async (id: string): Promise<CertificationLibraryItem> => {
		const [certification] = await db
			.select()
			.from(schema.certificationLibrary)
			.where(eq(schema.certificationLibrary.id, id));

		if (!certification) {
			throw new ORPCError("NOT_FOUND", { message: "Certification not found in library" });
		}

		return certification;
	},

	// Create a certification
	create: async (input: CreateCertificationLibraryInput): Promise<CertificationLibraryItem> => {
		const [certification] = await db
			.insert(schema.certificationLibrary)
			.values({
				id: input.id,
				name: input.name,
				nameFr: input.nameFr,
				provider: input.provider,
				field: input.field,
				level: input.level ?? "intermediate",
				duration: input.duration,
				cost: input.cost,
				description: input.description,
				descriptionFr: input.descriptionFr,
				skills: input.skills,
				prerequisites: input.prerequisites,
				url: input.url,
				isRecommended: input.isRecommended ?? false,
				isActive: input.isActive ?? true,
				sortOrder: input.sortOrder,
			})
			.returning();

		return certification;
	},

	// Update a certification
	update: async (input: UpdateCertificationLibraryInput): Promise<CertificationLibraryItem> => {
		const [existing] = await db
			.select({ id: schema.certificationLibrary.id })
			.from(schema.certificationLibrary)
			.where(eq(schema.certificationLibrary.id, input.id));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Certification not found in library" });
		}

		const [certification] = await db
			.update(schema.certificationLibrary)
			.set({
				name: input.name,
				nameFr: input.nameFr,
				provider: input.provider,
				field: input.field,
				level: input.level,
				duration: input.duration,
				cost: input.cost,
				description: input.description,
				descriptionFr: input.descriptionFr,
				skills: input.skills,
				prerequisites: input.prerequisites,
				url: input.url,
				isRecommended: input.isRecommended,
				isActive: input.isActive,
				sortOrder: input.sortOrder,
			})
			.where(eq(schema.certificationLibrary.id, input.id))
			.returning();

		return certification;
	},

	// Delete a certification
	delete: async (id: string): Promise<void> => {
		await db.delete(schema.certificationLibrary).where(eq(schema.certificationLibrary.id, id));
	},

	// Seed the certification library with default data
	seed: async (): Promise<{ seeded: number; skipped: number }> => {
		let seeded = 0;
		let skipped = 0;

		for (const cert of SEED_CERTIFICATIONS) {
			// Check if certification already exists
			const [existing] = await db
				.select({ id: schema.certificationLibrary.id })
				.from(schema.certificationLibrary)
				.where(eq(schema.certificationLibrary.id, cert.id));

			if (existing) {
				skipped++;
				continue;
			}

			await db.insert(schema.certificationLibrary).values({
				id: cert.id,
				name: cert.name,
				nameFr: cert.nameFr,
				provider: cert.provider,
				field: cert.field,
				level: cert.level ?? "intermediate",
				duration: cert.duration,
				cost: cert.cost,
				description: cert.description,
				descriptionFr: cert.descriptionFr,
				skills: cert.skills,
				prerequisites: cert.prerequisites,
				url: cert.url,
				isRecommended: cert.isRecommended ?? false,
				isActive: cert.isActive ?? true,
				sortOrder: cert.sortOrder,
			});

			seeded++;
		}

		return { seeded, skipped };
	},

	// Get recommended certifications for a specific field
	getRecommendedForField: async (field: string): Promise<CertificationLibraryItem[]> => {
		const certifications = await db
			.select()
			.from(schema.certificationLibrary)
			.where(
				and(
					eq(schema.certificationLibrary.isActive, true),
					eq(schema.certificationLibrary.isRecommended, true),
					or(
						eq(schema.certificationLibrary.field, field),
						eq(schema.certificationLibrary.field, "general"), // Also include general certs
					),
				),
			)
			.orderBy(asc(schema.certificationLibrary.sortOrder), asc(schema.certificationLibrary.name));

		return certifications;
	},
};
