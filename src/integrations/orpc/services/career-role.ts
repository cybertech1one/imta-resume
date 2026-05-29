import { ORPCError } from "@orpc/client";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";

export type CareerRoleRequirement = {
	id: string;
	role: string;
	roleFr: string | null;
	field: string;
	experienceLevel: string | null;
	description: string | null;
	descriptionFr: string | null;
	salaryMin: number | null;
	salaryMax: number | null;
	demandLevel: string | null;
	isActive: boolean;
	sortOrder: number | null;
	createdAt: Date;
	updatedAt: Date;
};

export type CareerRoleSkill = {
	id: string;
	roleId: string;
	skillName: string;
	skillNameFr: string | null;
	category: string | null;
	requiredLevel: number | null;
	importance: string | null;
	industryBenchmark: string | null;
	isRequired: boolean | null;
	sortOrder: number | null;
	createdAt: Date;
};

export type RoleWithSkills = CareerRoleRequirement & {
	skills: CareerRoleSkill[];
};

export type CreateRoleInput = {
	id: string;
	role: string;
	roleFr?: string;
	field: string;
	experienceLevel?: string;
	description?: string;
	descriptionFr?: string;
	salaryMin?: number;
	salaryMax?: number;
	demandLevel?: string;
	isActive?: boolean;
	sortOrder?: number;
};

export type CreateSkillInput = {
	id: string;
	roleId: string;
	skillName: string;
	skillNameFr?: string;
	category?: string;
	requiredLevel?: number;
	importance?: string;
	industryBenchmark?: number;
	isRequired?: boolean;
	sortOrder?: number;
};

export type UpdateRoleInput = Partial<CreateRoleInput> & { id: string };

// Default seed data from TARGET_ROLES in gap-analysis.tsx
const SEED_ROLES: CreateRoleInput[] = [
	{
		id: "nursing",
		role: "Nurse",
		roleFr: "Infirmier/Infirmiere",
		field: "healthcare",
		experienceLevel: "entry",
		description: "Provide patient care in healthcare facilities",
		descriptionFr: "Fournir des soins aux patients dans les etablissements de sante",
		salaryMin: 4500,
		salaryMax: 8000,
		demandLevel: "high",
		isActive: true,
		sortOrder: 1,
	},
	{
		id: "medical_assistant",
		role: "Medical Assistant",
		roleFr: "Aide-Soignant",
		field: "healthcare",
		experienceLevel: "entry",
		description: "Assist nurses and doctors with patient care",
		descriptionFr: "Assister les infirmieres et medecins dans les soins aux patients",
		salaryMin: 3500,
		salaryMax: 5500,
		demandLevel: "high",
		isActive: true,
		sortOrder: 2,
	},
	{
		id: "maintenance_tech",
		role: "Maintenance Technician",
		roleFr: "Technicien de Maintenance",
		field: "industrial",
		experienceLevel: "mid",
		description: "Maintain and repair industrial equipment",
		descriptionFr: "Entretenir et reparer les equipements industriels",
		salaryMin: 5000,
		salaryMax: 9000,
		demandLevel: "high",
		isActive: true,
		sortOrder: 3,
	},
	{
		id: "hse_coordinator",
		role: "HSE Coordinator",
		roleFr: "Coordinateur HSE",
		field: "hse",
		experienceLevel: "mid",
		description: "Coordinate health, safety, and environmental programs",
		descriptionFr: "Coordonner les programmes sante, securite et environnement",
		salaryMin: 7000,
		salaryMax: 15000,
		demandLevel: "high",
		isActive: true,
		sortOrder: 4,
	},
	{
		id: "safety_officer",
		role: "Safety Officer",
		roleFr: "Agent de Securite",
		field: "hse",
		experienceLevel: "entry",
		description: "Ensure workplace safety and compliance",
		descriptionFr: "Assurer la securite et la conformite au travail",
		salaryMin: 5000,
		salaryMax: 10000,
		demandLevel: "medium",
		isActive: true,
		sortOrder: 5,
	},
	{
		id: "industrial_operator",
		role: "Industrial Operator",
		roleFr: "Operateur Industriel",
		field: "industrial",
		experienceLevel: "entry",
		description: "Operate industrial machinery and production lines",
		descriptionFr: "Operer les machines industrielles et lignes de production",
		salaryMin: 4000,
		salaryMax: 7000,
		demandLevel: "medium",
		isActive: true,
		sortOrder: 6,
	},
];

// Skills for each role
const SEED_SKILLS: Record<string, CreateSkillInput[]> = {
	nursing: [
		{
			id: "nursing_patient_care",
			roleId: "nursing",
			skillName: "Patient Care",
			skillNameFr: "Soins aux Patients",
			category: "technical",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.2,
			isRequired: true,
			sortOrder: 1,
		},
		{
			id: "nursing_medical_terminology",
			roleId: "nursing",
			skillName: "Medical Terminology",
			skillNameFr: "Terminologie Medicale",
			category: "technical",
			requiredLevel: 4,
			importance: "critical",
			industryBenchmark: 3.8,
			isRequired: true,
			sortOrder: 2,
		},
		{
			id: "nursing_first_aid",
			roleId: "nursing",
			skillName: "First Aid",
			skillNameFr: "Premiers Secours",
			category: "technical",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.5,
			isRequired: true,
			sortOrder: 3,
		},
		{
			id: "nursing_medication",
			roleId: "nursing",
			skillName: "Medication Administration",
			skillNameFr: "Administration Medicaments",
			category: "technical",
			requiredLevel: 4,
			importance: "critical",
			industryBenchmark: 4.0,
			isRequired: true,
			sortOrder: 4,
		},
		{
			id: "nursing_communication",
			roleId: "nursing",
			skillName: "Communication",
			skillNameFr: "Communication",
			category: "soft",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.5,
			sortOrder: 5,
		},
		{
			id: "nursing_empathy",
			roleId: "nursing",
			skillName: "Empathy",
			skillNameFr: "Empathie",
			category: "soft",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.0,
			sortOrder: 6,
		},
		{
			id: "nursing_teamwork",
			roleId: "nursing",
			skillName: "Teamwork",
			skillNameFr: "Travail d'Equipe",
			category: "soft",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.7,
			sortOrder: 7,
		},
		{
			id: "nursing_stress",
			roleId: "nursing",
			skillName: "Stress Management",
			skillNameFr: "Gestion du Stress",
			category: "soft",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.3,
			sortOrder: 8,
		},
		{
			id: "nursing_french",
			roleId: "nursing",
			skillName: "French",
			skillNameFr: "Francais",
			category: "languages",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.5,
			isRequired: true,
			sortOrder: 9,
		},
		{
			id: "nursing_english",
			roleId: "nursing",
			skillName: "English",
			skillNameFr: "Anglais",
			category: "languages",
			requiredLevel: 3,
			importance: "nice-to-have",
			industryBenchmark: 2.5,
			sortOrder: 10,
		},
		{
			id: "nursing_bls",
			roleId: "nursing",
			skillName: "BLS Certification",
			skillNameFr: "Certification BLS",
			category: "certifications",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.8,
			isRequired: true,
			sortOrder: 11,
		},
	],
	medical_assistant: [
		{
			id: "ma_patient_care",
			roleId: "medical_assistant",
			skillName: "Patient Care",
			skillNameFr: "Soins aux Patients",
			category: "technical",
			requiredLevel: 4,
			importance: "critical",
			industryBenchmark: 3.8,
			isRequired: true,
			sortOrder: 1,
		},
		{
			id: "ma_first_aid",
			roleId: "medical_assistant",
			skillName: "First Aid",
			skillNameFr: "Premiers Secours",
			category: "technical",
			requiredLevel: 4,
			importance: "critical",
			industryBenchmark: 4.0,
			isRequired: true,
			sortOrder: 2,
		},
		{
			id: "ma_hygiene",
			roleId: "medical_assistant",
			skillName: "Hygiene Protocols",
			skillNameFr: "Protocoles Hygiene",
			category: "technical",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.2,
			isRequired: true,
			sortOrder: 3,
		},
		{
			id: "ma_communication",
			roleId: "medical_assistant",
			skillName: "Communication",
			skillNameFr: "Communication",
			category: "soft",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.5,
			sortOrder: 4,
		},
		{
			id: "ma_teamwork",
			roleId: "medical_assistant",
			skillName: "Teamwork",
			skillNameFr: "Travail d'Equipe",
			category: "soft",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.6,
			sortOrder: 5,
		},
		{
			id: "ma_french",
			roleId: "medical_assistant",
			skillName: "French",
			skillNameFr: "Francais",
			category: "languages",
			requiredLevel: 4,
			importance: "critical",
			industryBenchmark: 4.0,
			isRequired: true,
			sortOrder: 6,
		},
	],
	maintenance_tech: [
		{
			id: "mt_machine",
			roleId: "maintenance_tech",
			skillName: "Machine Operation",
			skillNameFr: "Utilisation des Machines",
			category: "technical",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.3,
			isRequired: true,
			sortOrder: 1,
		},
		{
			id: "mt_technical_reading",
			roleId: "maintenance_tech",
			skillName: "Technical Reading",
			skillNameFr: "Lecture Technique",
			category: "technical",
			requiredLevel: 4,
			importance: "critical",
			industryBenchmark: 3.8,
			isRequired: true,
			sortOrder: 2,
		},
		{
			id: "mt_electrical",
			roleId: "maintenance_tech",
			skillName: "Electrical Systems",
			skillNameFr: "Systemes Electriques",
			category: "technical",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.5,
			sortOrder: 3,
		},
		{
			id: "mt_preventive",
			roleId: "maintenance_tech",
			skillName: "Preventive Maintenance",
			skillNameFr: "Maintenance Preventive",
			category: "technical",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.0,
			isRequired: true,
			sortOrder: 4,
		},
		{
			id: "mt_problem_solving",
			roleId: "maintenance_tech",
			skillName: "Problem-Solving",
			skillNameFr: "Resolution de Problemes",
			category: "soft",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.0,
			sortOrder: 5,
		},
		{
			id: "mt_attention",
			roleId: "maintenance_tech",
			skillName: "Attention to Detail",
			skillNameFr: "Attention aux Details",
			category: "soft",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.7,
			sortOrder: 6,
		},
		{
			id: "mt_french",
			roleId: "maintenance_tech",
			skillName: "French",
			skillNameFr: "Francais",
			category: "languages",
			requiredLevel: 4,
			importance: "critical",
			industryBenchmark: 3.8,
			isRequired: true,
			sortOrder: 7,
		},
		{
			id: "mt_technical_english",
			roleId: "maintenance_tech",
			skillName: "Technical English",
			skillNameFr: "Anglais Technique",
			category: "languages",
			requiredLevel: 3,
			importance: "important",
			industryBenchmark: 2.8,
			sortOrder: 8,
		},
		{
			id: "mt_iso9001",
			roleId: "maintenance_tech",
			skillName: "ISO 9001",
			skillNameFr: "ISO 9001",
			category: "certifications",
			requiredLevel: 3,
			importance: "nice-to-have",
			industryBenchmark: 2.5,
			sortOrder: 9,
		},
	],
	hse_coordinator: [
		{
			id: "hse_risk",
			roleId: "hse_coordinator",
			skillName: "Risk Assessment",
			skillNameFr: "Evaluation des Risques",
			category: "technical",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.5,
			isRequired: true,
			sortOrder: 1,
		},
		{
			id: "hse_compliance",
			roleId: "hse_coordinator",
			skillName: "Regulatory Compliance",
			skillNameFr: "Conformite Reglementaire",
			category: "technical",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.2,
			isRequired: true,
			sortOrder: 2,
		},
		{
			id: "hse_investigation",
			roleId: "hse_coordinator",
			skillName: "Incident Investigation",
			skillNameFr: "Investigation d'Incidents",
			category: "technical",
			requiredLevel: 4,
			importance: "critical",
			industryBenchmark: 3.8,
			isRequired: true,
			sortOrder: 3,
		},
		{
			id: "hse_auditing",
			roleId: "hse_coordinator",
			skillName: "Safety Auditing",
			skillNameFr: "Audit Securite",
			category: "technical",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.5,
			sortOrder: 4,
		},
		{
			id: "hse_leadership",
			roleId: "hse_coordinator",
			skillName: "Leadership",
			skillNameFr: "Leadership",
			category: "soft",
			requiredLevel: 4,
			importance: "critical",
			industryBenchmark: 3.8,
			sortOrder: 5,
		},
		{
			id: "hse_communication",
			roleId: "hse_coordinator",
			skillName: "Communication",
			skillNameFr: "Communication",
			category: "soft",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.0,
			sortOrder: 6,
		},
		{
			id: "hse_training",
			roleId: "hse_coordinator",
			skillName: "Training Skills",
			skillNameFr: "Competences en Formation",
			category: "soft",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.5,
			sortOrder: 7,
		},
		{
			id: "hse_french",
			roleId: "hse_coordinator",
			skillName: "French",
			skillNameFr: "Francais",
			category: "languages",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.5,
			isRequired: true,
			sortOrder: 8,
		},
		{
			id: "hse_english",
			roleId: "hse_coordinator",
			skillName: "English",
			skillNameFr: "Anglais",
			category: "languages",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.5,
			sortOrder: 9,
		},
		{
			id: "hse_iso45001",
			roleId: "hse_coordinator",
			skillName: "ISO 45001",
			skillNameFr: "ISO 45001",
			category: "certifications",
			requiredLevel: 4,
			importance: "critical",
			industryBenchmark: 3.8,
			isRequired: true,
			sortOrder: 10,
		},
		{
			id: "hse_nebosh",
			roleId: "hse_coordinator",
			skillName: "NEBOSH",
			skillNameFr: "NEBOSH",
			category: "certifications",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.2,
			sortOrder: 11,
		},
	],
	safety_officer: [
		{
			id: "so_risk",
			roleId: "safety_officer",
			skillName: "Risk Assessment",
			skillNameFr: "Evaluation des Risques",
			category: "technical",
			requiredLevel: 4,
			importance: "critical",
			industryBenchmark: 3.8,
			isRequired: true,
			sortOrder: 1,
		},
		{
			id: "so_safety_procedures",
			roleId: "safety_officer",
			skillName: "Safety Procedures",
			skillNameFr: "Procedures de Securite",
			category: "technical",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.2,
			isRequired: true,
			sortOrder: 2,
		},
		{
			id: "so_emergency",
			roleId: "safety_officer",
			skillName: "Emergency Response",
			skillNameFr: "Reponse d'Urgence",
			category: "technical",
			requiredLevel: 4,
			importance: "critical",
			industryBenchmark: 3.5,
			isRequired: true,
			sortOrder: 3,
		},
		{
			id: "so_training",
			roleId: "safety_officer",
			skillName: "Training Skills",
			skillNameFr: "Competences en Formation",
			category: "soft",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.3,
			sortOrder: 4,
		},
		{
			id: "so_communication",
			roleId: "safety_officer",
			skillName: "Communication",
			skillNameFr: "Communication",
			category: "soft",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.5,
			sortOrder: 5,
		},
		{
			id: "so_french",
			roleId: "safety_officer",
			skillName: "French",
			skillNameFr: "Francais",
			category: "languages",
			requiredLevel: 4,
			importance: "critical",
			industryBenchmark: 4.0,
			isRequired: true,
			sortOrder: 6,
		},
		{
			id: "so_osha30",
			roleId: "safety_officer",
			skillName: "OSHA 30",
			skillNameFr: "OSHA 30",
			category: "certifications",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.0,
			sortOrder: 7,
		},
	],
	industrial_operator: [
		{
			id: "io_machine",
			roleId: "industrial_operator",
			skillName: "Machine Operation",
			skillNameFr: "Utilisation des Machines",
			category: "technical",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.5,
			isRequired: true,
			sortOrder: 1,
		},
		{
			id: "io_safety",
			roleId: "industrial_operator",
			skillName: "Safety Procedures",
			skillNameFr: "Procedures de Securite",
			category: "technical",
			requiredLevel: 4,
			importance: "critical",
			industryBenchmark: 3.8,
			isRequired: true,
			sortOrder: 2,
		},
		{
			id: "io_quality",
			roleId: "industrial_operator",
			skillName: "Quality Control",
			skillNameFr: "Controle Qualite",
			category: "technical",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.5,
			sortOrder: 3,
		},
		{
			id: "io_attention",
			roleId: "industrial_operator",
			skillName: "Attention to Detail",
			skillNameFr: "Attention aux Details",
			category: "soft",
			requiredLevel: 5,
			importance: "critical",
			industryBenchmark: 4.0,
			sortOrder: 4,
		},
		{
			id: "io_time",
			roleId: "industrial_operator",
			skillName: "Time Management",
			skillNameFr: "Gestion du Temps",
			category: "soft",
			requiredLevel: 4,
			importance: "important",
			industryBenchmark: 3.5,
			sortOrder: 5,
		},
		{
			id: "io_french",
			roleId: "industrial_operator",
			skillName: "French",
			skillNameFr: "Francais",
			category: "languages",
			requiredLevel: 4,
			importance: "critical",
			industryBenchmark: 3.8,
			isRequired: true,
			sortOrder: 6,
		},
	],
};

export const careerRoleService = {
	// List all roles with optional filters
	listRoles: async (input: {
		field?: string;
		demandLevel?: string;
		activeOnly?: boolean;
		search?: string;
	}): Promise<CareerRoleRequirement[]> => {
		const conditions = [];

		if (input.field) {
			conditions.push(eq(schema.careerRoleRequirement.field, input.field));
		}

		if (input.demandLevel) {
			conditions.push(eq(schema.careerRoleRequirement.demandLevel, input.demandLevel));
		}

		if (input.activeOnly !== false) {
			conditions.push(eq(schema.careerRoleRequirement.isActive, true));
		}

		if (input.search) {
			const searchTerm = `%${input.search}%`;
			conditions.push(
				or(
					ilike(schema.careerRoleRequirement.role, searchTerm),
					ilike(schema.careerRoleRequirement.roleFr, searchTerm),
					ilike(schema.careerRoleRequirement.description, searchTerm),
				),
			);
		}

		const roles = await db
			.select()
			.from(schema.careerRoleRequirement)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(asc(schema.careerRoleRequirement.sortOrder), asc(schema.careerRoleRequirement.role));

		return roles;
	},

	// Get role by ID
	getById: async (id: string): Promise<CareerRoleRequirement> => {
		const [role] = await db.select().from(schema.careerRoleRequirement).where(eq(schema.careerRoleRequirement.id, id));

		if (!role) {
			throw new ORPCError("NOT_FOUND", { message: "Career role not found" });
		}

		return role;
	},

	// Get role with all skills
	getRoleWithSkills: async (roleId: string): Promise<RoleWithSkills> => {
		const [role] = await db
			.select()
			.from(schema.careerRoleRequirement)
			.where(eq(schema.careerRoleRequirement.id, roleId));

		if (!role) {
			throw new ORPCError("NOT_FOUND", { message: "Career role not found" });
		}

		const skills = await db
			.select()
			.from(schema.careerRoleSkill)
			.where(eq(schema.careerRoleSkill.roleId, roleId))
			.orderBy(asc(schema.careerRoleSkill.sortOrder), asc(schema.careerRoleSkill.skillName));

		return { ...role, skills };
	},

	// Get skills for a role
	getSkillsForRole: async (roleId: string): Promise<CareerRoleSkill[]> => {
		const skills = await db
			.select()
			.from(schema.careerRoleSkill)
			.where(eq(schema.careerRoleSkill.roleId, roleId))
			.orderBy(asc(schema.careerRoleSkill.sortOrder), asc(schema.careerRoleSkill.skillName));

		return skills;
	},

	// Calculate skill gap for a user against a role
	calculateGap: async (input: {
		userSkills: Array<{ name: string; nameFr: string; currentLevel: number }>;
		roleId: string;
	}): Promise<{
		roleId: string;
		readinessScore: number;
		totalGaps: number;
		criticalGaps: number;
		skillGaps: Array<{
			skillName: string;
			skillNameFr: string | null;
			category: string | null;
			requiredLevel: number | null;
			currentLevel: number;
			gapSize: number;
			importance: string | null;
			industryBenchmark: string | null;
		}>;
	}> => {
		const roleSkills = await careerRoleService.getSkillsForRole(input.roleId);

		let totalRequired = 0;
		let totalCurrent = 0;
		let criticalGaps = 0;
		const skillGaps: Array<{
			skillName: string;
			skillNameFr: string | null;
			category: string | null;
			requiredLevel: number | null;
			currentLevel: number;
			gapSize: number;
			importance: string | null;
			industryBenchmark: string | null;
		}> = [];

		for (const required of roleSkills) {
			const userSkill = input.userSkills.find(
				(s) =>
					s.name.toLowerCase() === required.skillName.toLowerCase() ||
					(required.skillNameFr && s.nameFr.toLowerCase() === required.skillNameFr.toLowerCase()),
			);

			const currentLevel = userSkill?.currentLevel || 0;
			const requiredLevel = required.requiredLevel || 3;
			const gapSize = Math.max(0, requiredLevel - currentLevel);

			totalRequired += requiredLevel;
			totalCurrent += Math.min(currentLevel, requiredLevel);

			if (gapSize > 0) {
				if (required.importance === "critical") {
					criticalGaps++;
				}

				skillGaps.push({
					skillName: required.skillName,
					skillNameFr: required.skillNameFr,
					category: required.category,
					requiredLevel: required.requiredLevel,
					currentLevel,
					gapSize,
					importance: required.importance,
					industryBenchmark: required.industryBenchmark,
				});
			}
		}

		const readinessScore = totalRequired > 0 ? Math.round((totalCurrent / totalRequired) * 100) : 0;

		return {
			roleId: input.roleId,
			readinessScore,
			totalGaps: skillGaps.length,
			criticalGaps,
			skillGaps,
		};
	},

	// Create a role
	create: async (input: CreateRoleInput): Promise<CareerRoleRequirement> => {
		const [role] = await db
			.insert(schema.careerRoleRequirement)
			.values({
				id: input.id,
				role: input.role,
				roleFr: input.roleFr,
				field: input.field,
				experienceLevel: input.experienceLevel ?? "entry",
				description: input.description,
				descriptionFr: input.descriptionFr,
				salaryMin: input.salaryMin,
				salaryMax: input.salaryMax,
				demandLevel: input.demandLevel ?? "medium",
				isActive: input.isActive ?? true,
				sortOrder: input.sortOrder,
			})
			.returning();

		return role;
	},

	// Update a role
	update: async (input: UpdateRoleInput): Promise<CareerRoleRequirement> => {
		const [existing] = await db
			.select({ id: schema.careerRoleRequirement.id })
			.from(schema.careerRoleRequirement)
			.where(eq(schema.careerRoleRequirement.id, input.id));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Career role not found" });
		}

		const [role] = await db
			.update(schema.careerRoleRequirement)
			.set({
				role: input.role,
				roleFr: input.roleFr,
				field: input.field,
				experienceLevel: input.experienceLevel,
				description: input.description,
				descriptionFr: input.descriptionFr,
				salaryMin: input.salaryMin,
				salaryMax: input.salaryMax,
				demandLevel: input.demandLevel,
				isActive: input.isActive,
				sortOrder: input.sortOrder,
			})
			.where(eq(schema.careerRoleRequirement.id, input.id))
			.returning();

		return role;
	},

	// Delete a role (cascades to skills)
	delete: async (id: string): Promise<void> => {
		await db.delete(schema.careerRoleRequirement).where(eq(schema.careerRoleRequirement.id, id));
	},

	// Create a skill for a role
	createSkill: async (input: CreateSkillInput): Promise<CareerRoleSkill> => {
		const [skill] = await db
			.insert(schema.careerRoleSkill)
			.values({
				id: input.id,
				roleId: input.roleId,
				skillName: input.skillName,
				skillNameFr: input.skillNameFr,
				category: input.category ?? "technical",
				requiredLevel: input.requiredLevel ?? 3,
				importance: input.importance ?? "important",
				industryBenchmark: input.industryBenchmark?.toString(),
				isRequired: input.isRequired ?? false,
				sortOrder: input.sortOrder,
			})
			.returning();

		return skill;
	},

	// Update a skill
	updateSkill: async (input: Partial<CreateSkillInput> & { id: string }): Promise<CareerRoleSkill> => {
		const [existing] = await db
			.select({ id: schema.careerRoleSkill.id })
			.from(schema.careerRoleSkill)
			.where(eq(schema.careerRoleSkill.id, input.id));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Skill not found" });
		}

		const [skill] = await db
			.update(schema.careerRoleSkill)
			.set({
				skillName: input.skillName,
				skillNameFr: input.skillNameFr,
				category: input.category,
				requiredLevel: input.requiredLevel,
				importance: input.importance,
				industryBenchmark: input.industryBenchmark?.toString(),
				isRequired: input.isRequired,
				sortOrder: input.sortOrder,
			})
			.where(eq(schema.careerRoleSkill.id, input.id))
			.returning();

		return skill;
	},

	// Delete a skill
	deleteSkill: async (id: string): Promise<void> => {
		await db.delete(schema.careerRoleSkill).where(eq(schema.careerRoleSkill.id, id));
	},

	// Seed roles and skills with default data
	seed: async (): Promise<{ rolesSeeded: number; rolesSkipped: number; skillsSeeded: number }> => {
		let rolesSeeded = 0;
		let rolesSkipped = 0;
		let skillsSeeded = 0;

		for (const role of SEED_ROLES) {
			// Check if role already exists
			const [existing] = await db
				.select({ id: schema.careerRoleRequirement.id })
				.from(schema.careerRoleRequirement)
				.where(eq(schema.careerRoleRequirement.id, role.id));

			if (existing) {
				rolesSkipped++;
				continue;
			}

			// Create role
			await db.insert(schema.careerRoleRequirement).values({
				id: role.id,
				role: role.role,
				roleFr: role.roleFr,
				field: role.field,
				experienceLevel: role.experienceLevel ?? "entry",
				description: role.description,
				descriptionFr: role.descriptionFr,
				salaryMin: role.salaryMin,
				salaryMax: role.salaryMax,
				demandLevel: role.demandLevel ?? "medium",
				isActive: role.isActive ?? true,
				sortOrder: role.sortOrder,
			});

			rolesSeeded++;

			// Seed skills for this role
			const skills = SEED_SKILLS[role.id];
			if (skills) {
				for (const skill of skills) {
					await db.insert(schema.careerRoleSkill).values({
						id: skill.id,
						roleId: skill.roleId,
						skillName: skill.skillName,
						skillNameFr: skill.skillNameFr,
						category: skill.category ?? "technical",
						requiredLevel: skill.requiredLevel ?? 3,
						importance: skill.importance ?? "important",
						industryBenchmark: skill.industryBenchmark?.toString(),
						isRequired: skill.isRequired ?? false,
						sortOrder: skill.sortOrder,
					});
					skillsSeeded++;
				}
			}
		}

		return { rolesSeeded, rolesSkipped, skillsSeeded };
	},

	// Get all roles with their skills count
	listRolesWithSkillCount: async (input: {
		field?: string;
		activeOnly?: boolean;
	}): Promise<Array<CareerRoleRequirement & { skillCount: number }>> => {
		const roles = await careerRoleService.listRoles(input);

		const rolesWithCount = await Promise.all(
			roles.map(async (role) => {
				const skills = await db
					.select({ id: schema.careerRoleSkill.id })
					.from(schema.careerRoleSkill)
					.where(eq(schema.careerRoleSkill.roleId, role.id));
				return { ...role, skillCount: skills.length };
			}),
		);

		return rolesWithCount;
	},
};
