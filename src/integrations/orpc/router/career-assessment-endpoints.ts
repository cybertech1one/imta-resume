import z from "zod";
import { protectedProcedure } from "../context";
import {
	type CareerAssessmentAnswer,
	type CareerAssessmentMatch,
	type CareerPersonalityProfile,
	careerAssessmentService,
} from "../services/career-assessment";

export const careerAssessmentEndpoints = {
	// Get current assessment (progress or completed)
	get: protectedProcedure
		.route({
			method: "GET",
			path: "/career/assessment",
			tags: ["Career Assessment"],
			summary: "Get current career assessment",
		})
		.output(
			z
				.object({
					id: z.string().uuid(),
					userId: z.string(),
					status: z.enum(["in_progress", "completed"]),
					currentQuestion: z.number(),
					answers: z.array(
						z.object({
							questionId: z.string(),
							optionId: z.string().optional(),
							scaleValue: z.number().optional(),
						}),
					),
					personalityProfile: z
						.object({
							patient_care: z.number(),
							technical_aptitude: z.number(),
							safety_focus: z.number(),
							leadership: z.number(),
							teamwork: z.number(),
							analytical: z.number(),
							communication: z.number(),
							stress_tolerance: z.number(),
							physical_endurance: z.number(),
							attention_to_detail: z.number(),
						})
						.nullable(),
					careerMatches: z
						.array(
							z.object({
								programId: z.string(),
								name: z.string(),
								nameFr: z.string(),
								matchPercentage: z.number(),
								field: z.string(),
								reasons: z.array(z.string()),
								duration: z.string(),
								salary: z.string(),
								employmentRate: z.number().optional(),
							}),
						)
						.nullable(),
					version: z.string(),
					completedAt: z.coerce.date().nullable(),
					createdAt: z.coerce.date(),
					updatedAt: z.coerce.date(),
				})
				.nullable(),
		)
		.handler(async ({ context }) => {
			return await careerAssessmentService.get({ userId: context.user.id });
		}),

	// Save assessment progress
	saveProgress: protectedProcedure
		.route({
			method: "POST",
			path: "/career/assessment/progress",
			tags: ["Career Assessment"],
			summary: "Save assessment progress",
		})
		.input(
			z.object({
				currentQuestion: z.number(),
				answers: z.array(
					z.object({
						questionId: z.string(),
						optionId: z.string().optional(),
						scaleValue: z.number().optional(),
					}),
				),
			}),
		)
		.output(
			z.object({
				id: z.string().uuid(),
				userId: z.string(),
				status: z.enum(["in_progress", "completed"]),
				currentQuestion: z.number(),
				answers: z.array(
					z.object({
						questionId: z.string(),
						optionId: z.string().optional(),
						scaleValue: z.number().optional(),
					}),
				),
				personalityProfile: z
					.object({
						patient_care: z.number(),
						technical_aptitude: z.number(),
						safety_focus: z.number(),
						leadership: z.number(),
						teamwork: z.number(),
						analytical: z.number(),
						communication: z.number(),
						stress_tolerance: z.number(),
						physical_endurance: z.number(),
						attention_to_detail: z.number(),
					})
					.nullable(),
				careerMatches: z
					.array(
						z.object({
							programId: z.string(),
							name: z.string(),
							nameFr: z.string(),
							matchPercentage: z.number(),
							field: z.string(),
							reasons: z.array(z.string()),
							duration: z.string(),
							salary: z.string(),
							employmentRate: z.number().optional(),
						}),
					)
					.nullable(),
				version: z.string(),
				completedAt: z.coerce.date().nullable(),
				createdAt: z.coerce.date(),
				updatedAt: z.coerce.date(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await careerAssessmentService.saveProgress({
				userId: context.user.id,
				currentQuestion: input.currentQuestion,
				answers: input.answers as CareerAssessmentAnswer[],
			});
		}),

	// Complete assessment with results
	complete: protectedProcedure
		.route({
			method: "POST",
			path: "/career/assessment/complete",
			tags: ["Career Assessment"],
			summary: "Complete assessment with results",
		})
		.input(
			z.object({
				answers: z.array(
					z.object({
						questionId: z.string(),
						optionId: z.string().optional(),
						scaleValue: z.number().optional(),
					}),
				),
				personalityProfile: z.object({
					patient_care: z.number(),
					technical_aptitude: z.number(),
					safety_focus: z.number(),
					leadership: z.number(),
					teamwork: z.number(),
					analytical: z.number(),
					communication: z.number(),
					stress_tolerance: z.number(),
					physical_endurance: z.number(),
					attention_to_detail: z.number(),
				}),
				careerMatches: z.array(
					z.object({
						programId: z.string(),
						name: z.string(),
						nameFr: z.string(),
						matchPercentage: z.number(),
						field: z.string(),
						reasons: z.array(z.string()),
						duration: z.string(),
						salary: z.string(),
						employmentRate: z.number().optional(),
					}),
				),
			}),
		)
		.output(
			z.object({
				id: z.string().uuid(),
				userId: z.string(),
				status: z.enum(["in_progress", "completed"]),
				currentQuestion: z.number(),
				answers: z.array(
					z.object({
						questionId: z.string(),
						optionId: z.string().optional(),
						scaleValue: z.number().optional(),
					}),
				),
				personalityProfile: z
					.object({
						patient_care: z.number(),
						technical_aptitude: z.number(),
						safety_focus: z.number(),
						leadership: z.number(),
						teamwork: z.number(),
						analytical: z.number(),
						communication: z.number(),
						stress_tolerance: z.number(),
						physical_endurance: z.number(),
						attention_to_detail: z.number(),
					})
					.nullable(),
				careerMatches: z
					.array(
						z.object({
							programId: z.string(),
							name: z.string(),
							nameFr: z.string(),
							matchPercentage: z.number(),
							field: z.string(),
							reasons: z.array(z.string()),
							duration: z.string(),
							salary: z.string(),
							employmentRate: z.number().optional(),
						}),
					)
					.nullable(),
				version: z.string(),
				completedAt: z.coerce.date().nullable(),
				createdAt: z.coerce.date(),
				updatedAt: z.coerce.date(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await careerAssessmentService.complete({
				userId: context.user.id,
				answers: input.answers as CareerAssessmentAnswer[],
				personalityProfile: input.personalityProfile as CareerPersonalityProfile,
				careerMatches: input.careerMatches as CareerAssessmentMatch[],
			});
		}),

	// Reset assessment
	reset: protectedProcedure
		.route({
			method: "DELETE",
			path: "/career/assessment",
			tags: ["Career Assessment"],
			summary: "Reset/delete career assessment",
		})
		.output(z.void())
		.handler(async ({ context }) => {
			return await careerAssessmentService.reset({ userId: context.user.id });
		}),
};
