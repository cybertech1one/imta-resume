import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	DataExportOperation,
	DataExportStatus,
	ExportableDataType,
	ExportMetadata,
	ImportMetadata,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// App version for export metadata
const EXPORT_VERSION = "1.0.0";
const APP_NAME = "IMTA Resume";

// Type for the complete export data structure
export type ExportData = {
	version: string;
	app: string;
	exportedAt: string;
	userId: string;
	dataTypes: ExportableDataType[];
	data: {
		resumes?: Array<{
			id: string;
			name: string;
			slug: string;
			tags: string[];
			data: unknown;
			isPublic: boolean;
			createdAt: Date;
			updatedAt: Date;
		}>;
		job_applications?: Array<{
			id: string;
			companyName: string;
			position: string;
			location: string | null;
			jobUrl: string | null;
			jobDescription: string | null;
			salary: string | null;
			salaryMin: number | null;
			salaryMax: number | null;
			salaryCurrency: string | null;
			status: string;
			appliedAt: Date | null;
			deadline: Date | null;
			source: string | null;
			contactName: string | null;
			contactEmail: string | null;
			contactPhone: string | null;
			notes: string | null;
			tags: string[];
			priority: number;
			isRemote: boolean | null;
			workType: string | null;
			createdAt: Date;
			updatedAt: Date;
		}>;
		contacts?: Array<{
			id: string;
			name: string;
			email: string | null;
			phone: string | null;
			company: string | null;
			position: string | null;
			linkedinUrl: string | null;
			relationship: string;
			relationshipStrength: string | null;
			howMet: string | null;
			notes: string | null;
			tags: string[] | null;
			lastContactedAt: Date | null;
			nextFollowUpAt: Date | null;
			isFavorite: boolean | null;
			createdAt: Date;
			updatedAt: Date;
		}>;
		career_goals?: Array<{
			id: string;
			title: string;
			description: string | null;
			category: string;
			status: string;
			priority: number;
			targetDate: Date | null;
			completedAt: Date | null;
			progress: number;
			tags: string[] | null;
			metrics: unknown;
			createdAt: Date;
			updatedAt: Date;
			milestones?: Array<{
				id: string;
				title: string;
				description: string | null;
				isCompleted: boolean;
				completedAt: Date | null;
				dueDate: Date | null;
				order: number;
			}>;
		}>;
		cover_letters?: Array<{
			id: string;
			name: string;
			companyName: string | null;
			position: string | null;
			template: string | null;
			tone: string | null;
			content: string;
			tags: string[] | null;
			createdAt: Date;
			updatedAt: Date;
		}>;
		certifications?: Array<{
			id: string;
			name: string;
			issuer: string;
			category: string | null;
			status: string;
			credentialId: string | null;
			credentialUrl: string | null;
			issueDate: Date | null;
			expiryDate: Date | null;
			cost: number | null;
			currency: string | null;
			notes: string | null;
			reminderDays: number | null;
			createdAt: Date;
			updatedAt: Date;
		}>;
		salary_history?: Array<{
			id: string;
			companyName: string;
			position: string;
			baseSalary: number;
			currency: string;
			bonus: number | null;
			commission: number | null;
			otherCompensation: number | null;
			totalCompensation: number;
			payFrequency: string;
			startDate: Date;
			endDate: Date | null;
			isCurrent: boolean;
			notes: string | null;
			benefits: string[] | null;
			location: string | null;
			industry: string | null;
			createdAt: Date;
			updatedAt: Date;
		}>;
		journal_entries?: Array<{
			id: string;
			date: string;
			title: string | null;
			content: string | null;
			mood: string | null;
			applicationsSubmitted: number | null;
			interviewsCompleted: number | null;
			networkingActivities: number | null;
			wins: string[] | null;
			challenges: string[] | null;
			learnings: string[] | null;
			tomorrowGoals: string[] | null;
			tags: string[] | null;
			createdAt: Date;
			updatedAt: Date;
		}>;
		interview_notes?: Array<{
			id: string;
			companyName: string;
			position: string;
			interviewDate: Date | null;
			interviewType: string | null;
			interviewerName: string | null;
			interviewerRole: string | null;
			notes: string | null;
			status: string;
			createdAt: Date;
			updatedAt: Date;
		}>;
		skills?: Array<{
			id: string;
			category: string;
			totalQuestions: number;
			correctAnswers: number;
			score: number;
			level: string;
			timeSpent: number;
			skillBreakdown: unknown;
			badges: string[];
			createdAt: Date;
		}>;
	};
};

// Import data validation result
export type ImportValidationResult = {
	isValid: boolean;
	errors: string[];
	preview: {
		dataTypes: ExportableDataType[];
		recordCounts: Record<string, number>;
		exportedAt: string;
		version: string;
	};
};

export const dataExportService = {
	// Export user data
	exportData: async (input: { userId: string; dataTypes: ExportableDataType[] }): Promise<ExportData> => {
		const exportData: ExportData = {
			version: EXPORT_VERSION,
			app: APP_NAME,
			exportedAt: new Date().toISOString(),
			userId: input.userId,
			dataTypes: input.dataTypes,
			data: {},
		};

		// Export resumes
		if (input.dataTypes.includes("resumes")) {
			const resumes = await db
				.select({
					id: schema.resume.id,
					name: schema.resume.name,
					slug: schema.resume.slug,
					tags: schema.resume.tags,
					data: schema.resume.data,
					isPublic: schema.resume.isPublic,
					createdAt: schema.resume.createdAt,
					updatedAt: schema.resume.updatedAt,
				})
				.from(schema.resume)
				.where(eq(schema.resume.userId, input.userId));
			exportData.data.resumes = resumes;
		}

		// Export job applications
		if (input.dataTypes.includes("job_applications")) {
			const applications = await db
				.select({
					id: schema.jobApplication.id,
					companyName: schema.jobApplication.companyName,
					position: schema.jobApplication.position,
					location: schema.jobApplication.location,
					jobUrl: schema.jobApplication.jobUrl,
					jobDescription: schema.jobApplication.jobDescription,
					salary: schema.jobApplication.salary,
					salaryMin: schema.jobApplication.salaryMin,
					salaryMax: schema.jobApplication.salaryMax,
					salaryCurrency: schema.jobApplication.salaryCurrency,
					status: schema.jobApplication.status,
					appliedAt: schema.jobApplication.appliedAt,
					deadline: schema.jobApplication.deadline,
					source: schema.jobApplication.source,
					contactName: schema.jobApplication.contactName,
					contactEmail: schema.jobApplication.contactEmail,
					contactPhone: schema.jobApplication.contactPhone,
					notes: schema.jobApplication.notes,
					tags: schema.jobApplication.tags,
					priority: schema.jobApplication.priority,
					isRemote: schema.jobApplication.isRemote,
					workType: schema.jobApplication.workType,
					createdAt: schema.jobApplication.createdAt,
					updatedAt: schema.jobApplication.updatedAt,
				})
				.from(schema.jobApplication)
				.where(eq(schema.jobApplication.userId, input.userId));
			exportData.data.job_applications = applications;
		}

		// Export contacts
		if (input.dataTypes.includes("contacts")) {
			const contacts = await db
				.select({
					id: schema.networkingContact.id,
					name: schema.networkingContact.name,
					email: schema.networkingContact.email,
					phone: schema.networkingContact.phone,
					company: schema.networkingContact.company,
					position: schema.networkingContact.position,
					linkedinUrl: schema.networkingContact.linkedinUrl,
					relationship: schema.networkingContact.relationship,
					relationshipStrength: schema.networkingContact.relationshipStrength,
					howMet: schema.networkingContact.howMet,
					notes: schema.networkingContact.notes,
					tags: schema.networkingContact.tags,
					lastContactedAt: schema.networkingContact.lastContactedAt,
					nextFollowUpAt: schema.networkingContact.nextFollowUpAt,
					isFavorite: schema.networkingContact.isFavorite,
					createdAt: schema.networkingContact.createdAt,
					updatedAt: schema.networkingContact.updatedAt,
				})
				.from(schema.networkingContact)
				.where(eq(schema.networkingContact.userId, input.userId));
			exportData.data.contacts = contacts;
		}

		// Export career goals with milestones
		if (input.dataTypes.includes("career_goals")) {
			const goals = await db
				.select({
					id: schema.careerGoal.id,
					title: schema.careerGoal.title,
					description: schema.careerGoal.description,
					category: schema.careerGoal.category,
					status: schema.careerGoal.status,
					priority: schema.careerGoal.priority,
					targetDate: schema.careerGoal.targetDate,
					completedAt: schema.careerGoal.completedAt,
					progress: schema.careerGoal.progress,
					tags: schema.careerGoal.tags,
					metrics: schema.careerGoal.metrics,
					createdAt: schema.careerGoal.createdAt,
					updatedAt: schema.careerGoal.updatedAt,
				})
				.from(schema.careerGoal)
				.where(eq(schema.careerGoal.userId, input.userId));

			// Get milestones for each goal
			const goalsWithMilestones = await Promise.all(
				goals.map(async (goal) => {
					const milestones = await db
						.select({
							id: schema.goalMilestone.id,
							title: schema.goalMilestone.title,
							description: schema.goalMilestone.description,
							isCompleted: schema.goalMilestone.isCompleted,
							completedAt: schema.goalMilestone.completedAt,
							dueDate: schema.goalMilestone.dueDate,
							order: schema.goalMilestone.order,
						})
						.from(schema.goalMilestone)
						.where(eq(schema.goalMilestone.goalId, goal.id));
					return { ...goal, milestones };
				}),
			);
			exportData.data.career_goals = goalsWithMilestones;
		}

		// Export cover letters
		if (input.dataTypes.includes("cover_letters")) {
			const coverLetters = await db
				.select({
					id: schema.coverLetter.id,
					name: schema.coverLetter.name,
					companyName: schema.coverLetter.companyName,
					position: schema.coverLetter.position,
					template: schema.coverLetter.template,
					tone: schema.coverLetter.tone,
					content: schema.coverLetter.content,
					tags: schema.coverLetter.tags,
					createdAt: schema.coverLetter.createdAt,
					updatedAt: schema.coverLetter.updatedAt,
				})
				.from(schema.coverLetter)
				.where(eq(schema.coverLetter.userId, input.userId));
			exportData.data.cover_letters = coverLetters;
		}

		// Export certifications
		if (input.dataTypes.includes("certifications")) {
			const certifications = await db
				.select({
					id: schema.certification.id,
					name: schema.certification.name,
					issuer: schema.certification.issuer,
					category: schema.certification.category,
					status: schema.certification.status,
					credentialId: schema.certification.credentialId,
					credentialUrl: schema.certification.credentialUrl,
					issueDate: schema.certification.issueDate,
					expiryDate: schema.certification.expiryDate,
					cost: schema.certification.cost,
					currency: schema.certification.currency,
					notes: schema.certification.notes,
					reminderDays: schema.certification.reminderDays,
					createdAt: schema.certification.createdAt,
					updatedAt: schema.certification.updatedAt,
				})
				.from(schema.certification)
				.where(eq(schema.certification.userId, input.userId));
			exportData.data.certifications = certifications;
		}

		// Export salary history
		if (input.dataTypes.includes("salary_history")) {
			const salaryRecords = await db
				.select({
					id: schema.salaryRecord.id,
					companyName: schema.salaryRecord.companyName,
					position: schema.salaryRecord.position,
					baseSalary: schema.salaryRecord.baseSalary,
					currency: schema.salaryRecord.currency,
					bonus: schema.salaryRecord.bonus,
					commission: schema.salaryRecord.commission,
					otherCompensation: schema.salaryRecord.otherCompensation,
					totalCompensation: schema.salaryRecord.totalCompensation,
					payFrequency: schema.salaryRecord.payFrequency,
					startDate: schema.salaryRecord.startDate,
					endDate: schema.salaryRecord.endDate,
					isCurrent: schema.salaryRecord.isCurrent,
					notes: schema.salaryRecord.notes,
					benefits: schema.salaryRecord.benefits,
					location: schema.salaryRecord.location,
					industry: schema.salaryRecord.industry,
					createdAt: schema.salaryRecord.createdAt,
					updatedAt: schema.salaryRecord.updatedAt,
				})
				.from(schema.salaryRecord)
				.where(eq(schema.salaryRecord.userId, input.userId));
			exportData.data.salary_history = salaryRecords;
		}

		// Export journal entries
		if (input.dataTypes.includes("journal_entries")) {
			const entries = await db
				.select({
					id: schema.journalEntry.id,
					date: schema.journalEntry.date,
					title: schema.journalEntry.title,
					content: schema.journalEntry.content,
					mood: schema.journalEntry.mood,
					applicationsSubmitted: schema.journalEntry.applicationsSubmitted,
					interviewsCompleted: schema.journalEntry.interviewsCompleted,
					networkingActivities: schema.journalEntry.networkingActivities,
					wins: schema.journalEntry.wins,
					challenges: schema.journalEntry.challenges,
					learnings: schema.journalEntry.learnings,
					tomorrowGoals: schema.journalEntry.tomorrowGoals,
					tags: schema.journalEntry.tags,
					createdAt: schema.journalEntry.createdAt,
					updatedAt: schema.journalEntry.updatedAt,
				})
				.from(schema.journalEntry)
				.where(eq(schema.journalEntry.userId, input.userId));
			exportData.data.journal_entries = entries;
		}

		// Export interview notes/checklists
		if (input.dataTypes.includes("interview_notes")) {
			const checklists = await db
				.select({
					id: schema.interviewChecklist.id,
					companyName: schema.interviewChecklist.companyName,
					position: schema.interviewChecklist.position,
					interviewDate: schema.interviewChecklist.interviewDate,
					interviewType: schema.interviewChecklist.interviewType,
					interviewerName: schema.interviewChecklist.interviewerName,
					interviewerRole: schema.interviewChecklist.interviewerRole,
					notes: schema.interviewChecklist.notes,
					status: schema.interviewChecklist.status,
					createdAt: schema.interviewChecklist.createdAt,
					updatedAt: schema.interviewChecklist.updatedAt,
				})
				.from(schema.interviewChecklist)
				.where(eq(schema.interviewChecklist.userId, input.userId));
			exportData.data.interview_notes = checklists;
		}

		// Export skills quiz results
		if (input.dataTypes.includes("skills")) {
			const skills = await db
				.select({
					id: schema.skillsQuizResult.id,
					category: schema.skillsQuizResult.category,
					totalQuestions: schema.skillsQuizResult.totalQuestions,
					correctAnswers: schema.skillsQuizResult.correctAnswers,
					score: schema.skillsQuizResult.score,
					level: schema.skillsQuizResult.level,
					timeSpent: schema.skillsQuizResult.timeSpent,
					skillBreakdown: schema.skillsQuizResult.skillBreakdown,
					badges: schema.skillsQuizResult.badges,
					createdAt: schema.skillsQuizResult.createdAt,
				})
				.from(schema.skillsQuizResult)
				.where(eq(schema.skillsQuizResult.userId, input.userId));
			exportData.data.skills = skills;
		}

		return exportData;
	},

	// Validate import data structure
	validateImportData: (data: unknown): ImportValidationResult => {
		const errors: string[] = [];

		// Check basic structure
		if (!data || typeof data !== "object") {
			return {
				isValid: false,
				errors: ["Invalid data format: expected an object"],
				preview: { dataTypes: [], recordCounts: {}, exportedAt: "", version: "" },
			};
		}

		const exportData = data as Partial<ExportData>;

		// Check required fields
		if (!exportData.version) {
			errors.push("Missing version field");
		}
		if (!exportData.app || exportData.app !== APP_NAME) {
			errors.push("Invalid app field: data was not exported from IMTA Resume");
		}
		if (!exportData.exportedAt) {
			errors.push("Missing exportedAt field");
		}
		if (!exportData.dataTypes || !Array.isArray(exportData.dataTypes)) {
			errors.push("Missing or invalid dataTypes field");
		}
		if (!exportData.data || typeof exportData.data !== "object") {
			errors.push("Missing or invalid data field");
		}

		// Calculate record counts
		const recordCounts: Record<string, number> = {};
		if (exportData.data) {
			if (exportData.data.resumes) recordCounts.resumes = exportData.data.resumes.length;
			if (exportData.data.job_applications) recordCounts.job_applications = exportData.data.job_applications.length;
			if (exportData.data.contacts) recordCounts.contacts = exportData.data.contacts.length;
			if (exportData.data.career_goals) recordCounts.career_goals = exportData.data.career_goals.length;
			if (exportData.data.cover_letters) recordCounts.cover_letters = exportData.data.cover_letters.length;
			if (exportData.data.certifications) recordCounts.certifications = exportData.data.certifications.length;
			if (exportData.data.salary_history) recordCounts.salary_history = exportData.data.salary_history.length;
			if (exportData.data.journal_entries) recordCounts.journal_entries = exportData.data.journal_entries.length;
			if (exportData.data.interview_notes) recordCounts.interview_notes = exportData.data.interview_notes.length;
			if (exportData.data.skills) recordCounts.skills = exportData.data.skills.length;
		}

		return {
			isValid: errors.length === 0,
			errors,
			preview: {
				dataTypes: exportData.dataTypes ?? [],
				recordCounts,
				exportedAt: exportData.exportedAt ?? "",
				version: exportData.version ?? "",
			},
		};
	},

	// Import user data
	importData: async (input: {
		userId: string;
		data: ExportData;
		duplicateHandling: "skip" | "overwrite" | "create_new";
		selectedDataTypes: ExportableDataType[];
	}): Promise<ImportMetadata> => {
		const importedCounts: Record<string, number> = {};
		const skippedCounts: Record<string, number> = {};
		const errors: string[] = [];

		// Import resumes
		if (input.selectedDataTypes.includes("resumes") && input.data.data.resumes) {
			let imported = 0;
			let skipped = 0;

			for (const resume of input.data.data.resumes) {
				try {
					// Check for existing resume with same slug
					const [existing] = await db
						.select({ id: schema.resume.id })
						.from(schema.resume)
						.where(and(eq(schema.resume.userId, input.userId), eq(schema.resume.slug, resume.slug)));

					if (existing) {
						if (input.duplicateHandling === "skip") {
							skipped++;
							continue;
						}
						if (input.duplicateHandling === "overwrite") {
							await db
								.update(schema.resume)
								.set({
									name: resume.name,
									tags: resume.tags,
									data: resume.data as typeof schema.resume.$inferSelect.data,
									isPublic: resume.isPublic,
								})
								.where(eq(schema.resume.id, existing.id));
							imported++;
							continue;
						}
						// create_new - modify slug
						resume.slug = `${resume.slug}-${Date.now()}`;
					}

					await db.insert(schema.resume).values({
						id: generateId(),
						userId: input.userId,
						name: resume.name,
						slug: resume.slug,
						tags: resume.tags,
						data: resume.data as typeof schema.resume.$inferSelect.data,
						isPublic: resume.isPublic,
					});
					imported++;
				} catch (error) {
					errors.push(
						`Failed to import resume "${resume.name}": ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}
			importedCounts.resumes = imported;
			skippedCounts.resumes = skipped;
		}

		// Import job applications
		if (input.selectedDataTypes.includes("job_applications") && input.data.data.job_applications) {
			let imported = 0;
			let skipped = 0;

			for (const app of input.data.data.job_applications) {
				try {
					// Check for existing application with same company and position
					const [existing] = await db
						.select({ id: schema.jobApplication.id })
						.from(schema.jobApplication)
						.where(
							and(
								eq(schema.jobApplication.userId, input.userId),
								eq(schema.jobApplication.companyName, app.companyName),
								eq(schema.jobApplication.position, app.position),
							),
						);

					if (existing) {
						if (input.duplicateHandling === "skip") {
							skipped++;
							continue;
						}
						if (input.duplicateHandling === "overwrite") {
							await db
								.update(schema.jobApplication)
								.set({
									location: app.location,
									jobUrl: app.jobUrl,
									jobDescription: app.jobDescription,
									salary: app.salary,
									salaryMin: app.salaryMin,
									salaryMax: app.salaryMax,
									salaryCurrency: app.salaryCurrency,
									status: app.status as typeof schema.jobApplication.$inferSelect.status,
									appliedAt: app.appliedAt,
									deadline: app.deadline,
									source: app.source,
									contactName: app.contactName,
									contactEmail: app.contactEmail,
									contactPhone: app.contactPhone,
									notes: app.notes,
									tags: app.tags,
									priority: app.priority,
									isRemote: app.isRemote,
									workType: app.workType,
								})
								.where(eq(schema.jobApplication.id, existing.id));
							imported++;
							continue;
						}
					}

					await db.insert(schema.jobApplication).values({
						id: generateId(),
						userId: input.userId,
						companyName: app.companyName,
						position: app.position,
						location: app.location,
						jobUrl: app.jobUrl,
						jobDescription: app.jobDescription,
						salary: app.salary,
						salaryMin: app.salaryMin,
						salaryMax: app.salaryMax,
						salaryCurrency: app.salaryCurrency,
						status: app.status as typeof schema.jobApplication.$inferSelect.status,
						appliedAt: app.appliedAt,
						deadline: app.deadline,
						source: app.source,
						contactName: app.contactName,
						contactEmail: app.contactEmail,
						contactPhone: app.contactPhone,
						notes: app.notes,
						tags: app.tags,
						priority: app.priority,
						isRemote: app.isRemote,
						workType: app.workType,
					});
					imported++;
				} catch (error) {
					errors.push(
						`Failed to import job application "${app.companyName} - ${app.position}": ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}
			importedCounts.job_applications = imported;
			skippedCounts.job_applications = skipped;
		}

		// Import contacts
		if (input.selectedDataTypes.includes("contacts") && input.data.data.contacts) {
			let imported = 0;
			let skipped = 0;

			for (const contact of input.data.data.contacts) {
				try {
					// Check for existing contact with same name and email
					const [existing] = await db
						.select({ id: schema.networkingContact.id })
						.from(schema.networkingContact)
						.where(
							and(eq(schema.networkingContact.userId, input.userId), eq(schema.networkingContact.name, contact.name)),
						);

					if (existing) {
						if (input.duplicateHandling === "skip") {
							skipped++;
							continue;
						}
						if (input.duplicateHandling === "overwrite") {
							await db
								.update(schema.networkingContact)
								.set({
									email: contact.email,
									phone: contact.phone,
									company: contact.company,
									position: contact.position,
									linkedinUrl: contact.linkedinUrl,
									relationship: contact.relationship as typeof schema.networkingContact.$inferSelect.relationship,
									relationshipStrength: contact.relationshipStrength,
									howMet: contact.howMet,
									notes: contact.notes,
									tags: contact.tags,
									lastContactedAt: contact.lastContactedAt,
									nextFollowUpAt: contact.nextFollowUpAt,
									isFavorite: contact.isFavorite,
								})
								.where(eq(schema.networkingContact.id, existing.id));
							imported++;
							continue;
						}
					}

					await db.insert(schema.networkingContact).values({
						id: generateId(),
						userId: input.userId,
						name: contact.name,
						email: contact.email,
						phone: contact.phone,
						company: contact.company,
						position: contact.position,
						linkedinUrl: contact.linkedinUrl,
						relationship: contact.relationship as typeof schema.networkingContact.$inferSelect.relationship,
						relationshipStrength: contact.relationshipStrength,
						howMet: contact.howMet,
						notes: contact.notes,
						tags: contact.tags,
						lastContactedAt: contact.lastContactedAt,
						nextFollowUpAt: contact.nextFollowUpAt,
						isFavorite: contact.isFavorite,
					});
					imported++;
				} catch (error) {
					errors.push(
						`Failed to import contact "${contact.name}": ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}
			importedCounts.contacts = imported;
			skippedCounts.contacts = skipped;
		}

		// Import career goals
		if (input.selectedDataTypes.includes("career_goals") && input.data.data.career_goals) {
			let imported = 0;
			let skipped = 0;

			for (const goal of input.data.data.career_goals) {
				try {
					// Check for existing goal with same title
					const [existing] = await db
						.select({ id: schema.careerGoal.id })
						.from(schema.careerGoal)
						.where(and(eq(schema.careerGoal.userId, input.userId), eq(schema.careerGoal.title, goal.title)));

					if (existing) {
						if (input.duplicateHandling === "skip") {
							skipped++;
							continue;
						}
						if (input.duplicateHandling === "overwrite") {
							await db
								.update(schema.careerGoal)
								.set({
									description: goal.description,
									category: goal.category,
									status: goal.status as typeof schema.careerGoal.$inferSelect.status,
									priority: goal.priority,
									targetDate: goal.targetDate,
									completedAt: goal.completedAt,
									progress: goal.progress,
									tags: goal.tags,
									metrics: goal.metrics as typeof schema.careerGoal.$inferSelect.metrics,
								})
								.where(eq(schema.careerGoal.id, existing.id));

							// Update milestones
							if (goal.milestones) {
								await db.delete(schema.goalMilestone).where(eq(schema.goalMilestone.goalId, existing.id));
								for (const milestone of goal.milestones) {
									await db.insert(schema.goalMilestone).values({
										id: generateId(),
										goalId: existing.id,
										title: milestone.title,
										description: milestone.description,
										isCompleted: milestone.isCompleted,
										completedAt: milestone.completedAt,
										dueDate: milestone.dueDate,
										order: milestone.order,
									});
								}
							}
							imported++;
							continue;
						}
					}

					const goalId = generateId();
					await db.insert(schema.careerGoal).values({
						id: goalId,
						userId: input.userId,
						title: goal.title,
						description: goal.description,
						category: goal.category,
						status: goal.status as typeof schema.careerGoal.$inferSelect.status,
						priority: goal.priority,
						targetDate: goal.targetDate,
						completedAt: goal.completedAt,
						progress: goal.progress,
						tags: goal.tags,
						metrics: goal.metrics as typeof schema.careerGoal.$inferSelect.metrics,
					});

					// Insert milestones
					if (goal.milestones) {
						for (const milestone of goal.milestones) {
							await db.insert(schema.goalMilestone).values({
								id: generateId(),
								goalId,
								title: milestone.title,
								description: milestone.description,
								isCompleted: milestone.isCompleted,
								completedAt: milestone.completedAt,
								dueDate: milestone.dueDate,
								order: milestone.order,
							});
						}
					}
					imported++;
				} catch (error) {
					errors.push(
						`Failed to import career goal "${goal.title}": ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}
			importedCounts.career_goals = imported;
			skippedCounts.career_goals = skipped;
		}

		// Import cover letters
		if (input.selectedDataTypes.includes("cover_letters") && input.data.data.cover_letters) {
			let imported = 0;
			let skipped = 0;

			for (const letter of input.data.data.cover_letters) {
				try {
					const [existing] = await db
						.select({ id: schema.coverLetter.id })
						.from(schema.coverLetter)
						.where(and(eq(schema.coverLetter.userId, input.userId), eq(schema.coverLetter.name, letter.name)));

					if (existing) {
						if (input.duplicateHandling === "skip") {
							skipped++;
							continue;
						}
						if (input.duplicateHandling === "overwrite") {
							await db
								.update(schema.coverLetter)
								.set({
									companyName: letter.companyName,
									position: letter.position,
									template: letter.template,
									tone: letter.tone,
									content: letter.content,
									tags: letter.tags,
								})
								.where(eq(schema.coverLetter.id, existing.id));
							imported++;
							continue;
						}
					}

					await db.insert(schema.coverLetter).values({
						id: generateId(),
						userId: input.userId,
						name: letter.name,
						companyName: letter.companyName,
						position: letter.position,
						template: letter.template,
						tone: letter.tone,
						content: letter.content,
						tags: letter.tags,
					});
					imported++;
				} catch (error) {
					errors.push(
						`Failed to import cover letter "${letter.name}": ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}
			importedCounts.cover_letters = imported;
			skippedCounts.cover_letters = skipped;
		}

		// Import certifications
		if (input.selectedDataTypes.includes("certifications") && input.data.data.certifications) {
			let imported = 0;
			let skipped = 0;

			for (const cert of input.data.data.certifications) {
				try {
					const [existing] = await db
						.select({ id: schema.certification.id })
						.from(schema.certification)
						.where(
							and(
								eq(schema.certification.userId, input.userId),
								eq(schema.certification.name, cert.name),
								eq(schema.certification.issuer, cert.issuer),
							),
						);

					if (existing) {
						if (input.duplicateHandling === "skip") {
							skipped++;
							continue;
						}
						if (input.duplicateHandling === "overwrite") {
							await db
								.update(schema.certification)
								.set({
									category: cert.category,
									status: cert.status as typeof schema.certification.$inferSelect.status,
									credentialId: cert.credentialId,
									credentialUrl: cert.credentialUrl,
									issueDate: cert.issueDate,
									expiryDate: cert.expiryDate,
									cost: cert.cost,
									currency: cert.currency,
									notes: cert.notes,
									reminderDays: cert.reminderDays,
								})
								.where(eq(schema.certification.id, existing.id));
							imported++;
							continue;
						}
					}

					await db.insert(schema.certification).values({
						id: generateId(),
						userId: input.userId,
						name: cert.name,
						issuer: cert.issuer,
						category: cert.category,
						status: cert.status as typeof schema.certification.$inferSelect.status,
						credentialId: cert.credentialId,
						credentialUrl: cert.credentialUrl,
						issueDate: cert.issueDate,
						expiryDate: cert.expiryDate,
						cost: cert.cost,
						currency: cert.currency,
						notes: cert.notes,
						reminderDays: cert.reminderDays,
					});
					imported++;
				} catch (error) {
					errors.push(
						`Failed to import certification "${cert.name}": ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}
			importedCounts.certifications = imported;
			skippedCounts.certifications = skipped;
		}

		// Import salary history
		if (input.selectedDataTypes.includes("salary_history") && input.data.data.salary_history) {
			let imported = 0;
			let skipped = 0;

			for (const salary of input.data.data.salary_history) {
				try {
					const [existing] = await db
						.select({ id: schema.salaryRecord.id })
						.from(schema.salaryRecord)
						.where(
							and(
								eq(schema.salaryRecord.userId, input.userId),
								eq(schema.salaryRecord.companyName, salary.companyName),
								eq(schema.salaryRecord.position, salary.position),
							),
						);

					if (existing) {
						if (input.duplicateHandling === "skip") {
							skipped++;
							continue;
						}
						if (input.duplicateHandling === "overwrite") {
							await db
								.update(schema.salaryRecord)
								.set({
									baseSalary: salary.baseSalary,
									currency: salary.currency,
									bonus: salary.bonus,
									commission: salary.commission,
									otherCompensation: salary.otherCompensation,
									totalCompensation: salary.totalCompensation,
									payFrequency: salary.payFrequency,
									startDate: salary.startDate,
									endDate: salary.endDate,
									isCurrent: salary.isCurrent,
									notes: salary.notes,
									benefits: salary.benefits,
									location: salary.location,
									industry: salary.industry,
								})
								.where(eq(schema.salaryRecord.id, existing.id));
							imported++;
							continue;
						}
					}

					await db.insert(schema.salaryRecord).values({
						id: generateId(),
						userId: input.userId,
						companyName: salary.companyName,
						position: salary.position,
						baseSalary: salary.baseSalary,
						currency: salary.currency,
						bonus: salary.bonus,
						commission: salary.commission,
						otherCompensation: salary.otherCompensation,
						totalCompensation: salary.totalCompensation,
						payFrequency: salary.payFrequency,
						startDate: salary.startDate,
						endDate: salary.endDate,
						isCurrent: salary.isCurrent,
						notes: salary.notes,
						benefits: salary.benefits,
						location: salary.location,
						industry: salary.industry,
					});
					imported++;
				} catch (error) {
					errors.push(
						`Failed to import salary record "${salary.companyName}": ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}
			importedCounts.salary_history = imported;
			skippedCounts.salary_history = skipped;
		}

		// Import journal entries
		if (input.selectedDataTypes.includes("journal_entries") && input.data.data.journal_entries) {
			let imported = 0;
			let skipped = 0;

			for (const entry of input.data.data.journal_entries) {
				try {
					const [existing] = await db
						.select({ id: schema.journalEntry.id })
						.from(schema.journalEntry)
						.where(and(eq(schema.journalEntry.userId, input.userId), eq(schema.journalEntry.date, entry.date)));

					if (existing) {
						if (input.duplicateHandling === "skip") {
							skipped++;
							continue;
						}
						if (input.duplicateHandling === "overwrite") {
							await db
								.update(schema.journalEntry)
								.set({
									title: entry.title,
									content: entry.content,
									mood: entry.mood,
									applicationsSubmitted: entry.applicationsSubmitted,
									interviewsCompleted: entry.interviewsCompleted,
									networkingActivities: entry.networkingActivities,
									wins: entry.wins,
									challenges: entry.challenges,
									learnings: entry.learnings,
									tomorrowGoals: entry.tomorrowGoals,
									tags: entry.tags,
								})
								.where(eq(schema.journalEntry.id, existing.id));
							imported++;
							continue;
						}
					}

					await db.insert(schema.journalEntry).values({
						id: generateId(),
						userId: input.userId,
						date: entry.date,
						title: entry.title,
						content: entry.content,
						mood: entry.mood,
						applicationsSubmitted: entry.applicationsSubmitted,
						interviewsCompleted: entry.interviewsCompleted,
						networkingActivities: entry.networkingActivities,
						wins: entry.wins,
						challenges: entry.challenges,
						learnings: entry.learnings,
						tomorrowGoals: entry.tomorrowGoals,
						tags: entry.tags,
					});
					imported++;
				} catch (error) {
					errors.push(
						`Failed to import journal entry "${entry.date}": ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}
			importedCounts.journal_entries = imported;
			skippedCounts.journal_entries = skipped;
		}

		// Import interview notes
		if (input.selectedDataTypes.includes("interview_notes") && input.data.data.interview_notes) {
			let imported = 0;
			let skipped = 0;

			for (const note of input.data.data.interview_notes) {
				try {
					const [existing] = await db
						.select({ id: schema.interviewChecklist.id })
						.from(schema.interviewChecklist)
						.where(
							and(
								eq(schema.interviewChecklist.userId, input.userId),
								eq(schema.interviewChecklist.companyName, note.companyName),
								eq(schema.interviewChecklist.position, note.position),
							),
						);

					if (existing) {
						if (input.duplicateHandling === "skip") {
							skipped++;
							continue;
						}
						if (input.duplicateHandling === "overwrite") {
							await db
								.update(schema.interviewChecklist)
								.set({
									interviewDate: note.interviewDate,
									interviewType: note.interviewType,
									interviewerName: note.interviewerName,
									interviewerRole: note.interviewerRole,
									notes: note.notes,
									status: note.status,
								})
								.where(eq(schema.interviewChecklist.id, existing.id));
							imported++;
							continue;
						}
					}

					await db.insert(schema.interviewChecklist).values({
						id: generateId(),
						userId: input.userId,
						companyName: note.companyName,
						position: note.position,
						interviewDate: note.interviewDate,
						interviewType: note.interviewType,
						interviewerName: note.interviewerName,
						interviewerRole: note.interviewerRole,
						notes: note.notes,
						status: note.status,
					});
					imported++;
				} catch (error) {
					errors.push(
						`Failed to import interview note "${note.companyName}": ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}
			importedCounts.interview_notes = imported;
			skippedCounts.interview_notes = skipped;
		}

		return {
			dataTypes: input.selectedDataTypes,
			recordCounts: Object.fromEntries(
				input.selectedDataTypes.map((type) => [
					type,
					(input.data.data as Record<string, unknown[]>)[type]?.length ?? 0,
				]),
			),
			duplicateHandling: input.duplicateHandling,
			importedCounts,
			skippedCounts,
			errors,
		};
	},

	// Create export history record
	createHistoryRecord: async (input: {
		userId: string;
		operation: DataExportOperation;
		status?: DataExportStatus;
		exportMetadata?: ExportMetadata;
		importMetadata?: ImportMetadata;
	}): Promise<string> => {
		const id = generateId();

		await db.insert(schema.dataExportHistory).values({
			id,
			userId: input.userId,
			operation: input.operation,
			status: input.status ?? "pending",
			exportMetadata: input.exportMetadata,
			importMetadata: input.importMetadata,
			startedAt: new Date(),
		});

		return id;
	},

	// Update export history record
	updateHistoryRecord: async (input: {
		id: string;
		userId: string;
		status: DataExportStatus;
		exportMetadata?: ExportMetadata;
		importMetadata?: ImportMetadata;
		errorMessage?: string;
	}): Promise<void> => {
		await db
			.update(schema.dataExportHistory)
			.set({
				status: input.status,
				exportMetadata: input.exportMetadata,
				importMetadata: input.importMetadata,
				errorMessage: input.errorMessage,
				completedAt: input.status === "completed" || input.status === "failed" ? new Date() : undefined,
			})
			.where(and(eq(schema.dataExportHistory.id, input.id), eq(schema.dataExportHistory.userId, input.userId)));
	},

	// Get export history
	getHistory: async (input: { userId: string; limit?: number; offset?: number }) => {
		return await db
			.select({
				id: schema.dataExportHistory.id,
				operation: schema.dataExportHistory.operation,
				status: schema.dataExportHistory.status,
				exportMetadata: schema.dataExportHistory.exportMetadata,
				importMetadata: schema.dataExportHistory.importMetadata,
				errorMessage: schema.dataExportHistory.errorMessage,
				startedAt: schema.dataExportHistory.startedAt,
				completedAt: schema.dataExportHistory.completedAt,
				createdAt: schema.dataExportHistory.createdAt,
			})
			.from(schema.dataExportHistory)
			.where(eq(schema.dataExportHistory.userId, input.userId))
			.orderBy(desc(schema.dataExportHistory.createdAt))
			.limit(input.limit ?? 20)
			.offset(input.offset ?? 0);
	},

	// Get single history record
	getHistoryById: async (input: { id: string; userId: string }) => {
		const [record] = await db
			.select()
			.from(schema.dataExportHistory)
			.where(and(eq(schema.dataExportHistory.id, input.id), eq(schema.dataExportHistory.userId, input.userId)));

		if (!record) {
			throw new ORPCError("NOT_FOUND", { message: "Export history record not found" });
		}

		return record;
	},
};
