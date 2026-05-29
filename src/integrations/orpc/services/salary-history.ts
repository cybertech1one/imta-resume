import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type CreateSalaryRecordInput = {
	userId: string;
	companyName: string;
	position: string;
	baseSalary: number;
	currency?: string;
	bonus?: number;
	commission?: number;
	otherCompensation?: number;
	payFrequency?: string;
	startDate: Date;
	endDate?: Date;
	isCurrent?: boolean;
	notes?: string;
	benefits?: string[];
	location?: string;
	industry?: string;
};

export type UpdateSalaryRecordInput = {
	id: string;
	userId: string;
	companyName?: string;
	position?: string;
	baseSalary?: number;
	currency?: string;
	bonus?: number;
	commission?: number;
	otherCompensation?: number;
	payFrequency?: string;
	startDate?: Date;
	endDate?: Date;
	isCurrent?: boolean;
	notes?: string;
	benefits?: string[];
	location?: string;
	industry?: string;
};

const calculateTotalCompensation = (input: {
	baseSalary: number;
	bonus?: number;
	commission?: number;
	otherCompensation?: number;
	payFrequency?: string;
}) => {
	// Convert to annual if needed
	let annualBase = input.baseSalary;
	if (input.payFrequency === "monthly") {
		annualBase = input.baseSalary * 12;
	} else if (input.payFrequency === "hourly") {
		annualBase = input.baseSalary * 40 * 52; // 40 hours/week, 52 weeks
	}

	return annualBase + (input.bonus ?? 0) + (input.commission ?? 0) + (input.otherCompensation ?? 0);
};

export const salaryHistoryService = {
	// Create a new salary record
	create: async (input: CreateSalaryRecordInput): Promise<string> => {
		const id = generateId();

		// If this is marked as current, unmark any existing current record
		if (input.isCurrent) {
			await db
				.update(schema.salaryRecord)
				.set({ isCurrent: false, endDate: input.startDate })
				.where(and(eq(schema.salaryRecord.userId, input.userId), eq(schema.salaryRecord.isCurrent, true)));
		}

		const totalCompensation = calculateTotalCompensation(input);

		await db.insert(schema.salaryRecord).values({
			id,
			userId: input.userId,
			companyName: input.companyName,
			position: input.position,
			baseSalary: input.baseSalary,
			currency: input.currency ?? "MAD",
			bonus: input.bonus,
			commission: input.commission,
			otherCompensation: input.otherCompensation,
			totalCompensation,
			payFrequency: input.payFrequency ?? "monthly",
			startDate: input.startDate,
			endDate: input.endDate,
			isCurrent: input.isCurrent ?? false,
			notes: input.notes,
			benefits: input.benefits ?? [],
			location: input.location,
			industry: input.industry,
		});

		return id;
	},

	// Get salary record by ID
	getById: async (input: { id: string; userId: string }) => {
		const [record] = await db
			.select()
			.from(schema.salaryRecord)
			.where(and(eq(schema.salaryRecord.id, input.id), eq(schema.salaryRecord.userId, input.userId)));

		if (!record) {
			throw new ORPCError("NOT_FOUND", { message: "Salary record not found" });
		}

		return record;
	},

	// List all salary records for a user
	list: async (input: { userId: string }) => {
		return await db
			.select()
			.from(schema.salaryRecord)
			.where(eq(schema.salaryRecord.userId, input.userId))
			.orderBy(desc(schema.salaryRecord.startDate));
	},

	// Update salary record
	update: async (input: UpdateSalaryRecordInput): Promise<void> => {
		const [existing] = await db
			.select()
			.from(schema.salaryRecord)
			.where(and(eq(schema.salaryRecord.id, input.id), eq(schema.salaryRecord.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Salary record not found" });
		}

		// If this is being marked as current, unmark any existing current record
		if (input.isCurrent && !existing.isCurrent) {
			await db
				.update(schema.salaryRecord)
				.set({ isCurrent: false, endDate: input.startDate ?? existing.startDate })
				.where(and(eq(schema.salaryRecord.userId, input.userId), eq(schema.salaryRecord.isCurrent, true)));
		}

		const totalCompensation = calculateTotalCompensation({
			baseSalary: input.baseSalary ?? existing.baseSalary,
			bonus: input.bonus ?? existing.bonus ?? undefined,
			commission: input.commission ?? existing.commission ?? undefined,
			otherCompensation: input.otherCompensation ?? existing.otherCompensation ?? undefined,
			payFrequency: input.payFrequency ?? existing.payFrequency,
		});

		await db
			.update(schema.salaryRecord)
			.set({
				companyName: input.companyName,
				position: input.position,
				baseSalary: input.baseSalary,
				currency: input.currency,
				bonus: input.bonus,
				commission: input.commission,
				otherCompensation: input.otherCompensation,
				totalCompensation,
				payFrequency: input.payFrequency,
				startDate: input.startDate,
				endDate: input.endDate,
				isCurrent: input.isCurrent,
				notes: input.notes,
				benefits: input.benefits,
				location: input.location,
				industry: input.industry,
			})
			.where(and(eq(schema.salaryRecord.id, input.id), eq(schema.salaryRecord.userId, input.userId)));
	},

	// Delete salary record
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.salaryRecord)
			.where(and(eq(schema.salaryRecord.id, input.id), eq(schema.salaryRecord.userId, input.userId)));
	},

	// Get salary statistics and analytics
	getStatistics: async (input: { userId: string }) => {
		const records = await db
			.select()
			.from(schema.salaryRecord)
			.where(eq(schema.salaryRecord.userId, input.userId))
			.orderBy(desc(schema.salaryRecord.startDate));

		if (records.length === 0) {
			return {
				currentSalary: null,
				totalRecords: 0,
				averageSalary: 0,
				highestSalary: 0,
				lowestSalary: 0,
				salaryGrowth: 0,
				salaryGrowthPercentage: 0,
				timeline: [],
			};
		}

		const currentRecord = records.find((r) => r.isCurrent) ?? records[0];
		const salaries = records.map((r) => r.totalCompensation);
		const averageSalary = Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length);
		const highestSalary = Math.max(...salaries);
		const lowestSalary = Math.min(...salaries);

		// Calculate growth from first to current
		const firstRecord = records[records.length - 1];
		const salaryGrowth = currentRecord.totalCompensation - firstRecord.totalCompensation;
		const salaryGrowthPercentage =
			firstRecord.totalCompensation > 0 ? Math.round((salaryGrowth / firstRecord.totalCompensation) * 100) : 0;

		// Create timeline for chart
		const timeline = records
			.map((r) => ({
				date: r.startDate.toISOString().split("T")[0],
				company: r.companyName,
				position: r.position,
				salary: r.totalCompensation,
				currency: r.currency,
			}))
			.reverse();

		return {
			currentSalary: {
				company: currentRecord.companyName,
				position: currentRecord.position,
				baseSalary: currentRecord.baseSalary,
				totalCompensation: currentRecord.totalCompensation,
				currency: currentRecord.currency,
			},
			totalRecords: records.length,
			averageSalary,
			highestSalary,
			lowestSalary,
			salaryGrowth,
			salaryGrowthPercentage,
			timeline,
		};
	},
};
