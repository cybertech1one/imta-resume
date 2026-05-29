import { z } from "zod";

// Career field schema
export const careerFieldSchema = z.enum(["healthcare", "industrial", "hse"]);
export type CareerField = z.infer<typeof careerFieldSchema>;

// Career experience level schema
export const careerExperienceLevelSchema = z.enum(["entry", "junior", "mid", "senior", "expert"]);
export type CareerExperienceLevel = z.infer<typeof careerExperienceLevelSchema>;

// Career assessment question category
export const questionCategorySchema = z.enum([
	"environment",
	"interests",
	"stress",
	"work_style",
	"goals",
	"skills",
	"values",
	"personality",
]);
export type QuestionCategory = z.infer<typeof questionCategorySchema>;

// Personality trait schema
export const personalityTraitSchema = z.enum([
	"teamwork",
	"technical_aptitude",
	"patient_care",
	"safety_focus",
	"leadership",
	"problem_solving",
	"communication",
	"attention_to_detail",
	"adaptability",
	"creativity",
]);
export type PersonalityTrait = z.infer<typeof personalityTraitSchema>;

// Quiz option schema
export const quizOptionSchema = z.object({
	id: z.string(),
	text: z.string(),
	traits: z.record(personalityTraitSchema, z.number()).optional(),
});
export type QuizOption = z.infer<typeof quizOptionSchema>;

// Quiz question schema
export const quizQuestionSchema = z.object({
	id: z.string(),
	question: z.string(),
	questionFr: z.string().optional(),
	category: questionCategorySchema,
	options: z.array(quizOptionSchema),
	order: z.number().default(0),
});
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

// Quiz response schema
export const quizResponseSchema = z.object({
	questionId: z.string(),
	selectedOptionId: z.string(),
	timestamp: z.string().datetime().optional(),
});
export type QuizResponse = z.infer<typeof quizResponseSchema>;

// Personality profile schema
export const personalityProfileSchema = z.record(personalityTraitSchema, z.number());
export type PersonalityProfile = z.infer<typeof personalityProfileSchema>;

// Career recommendation schema
export const careerRecommendationSchema = z.object({
	programId: z.string(),
	programName: z.string(),
	programNameFr: z.string().optional(),
	field: careerFieldSchema,
	matchScore: z.number().min(0).max(100),
	matchingTraits: z.array(personalityTraitSchema),
	description: z.string().optional(),
	salaryRange: z
		.object({
			min: z.number(),
			max: z.number(),
			currency: z.string().default("DH"),
		})
		.optional(),
	employmentRate: z.number().min(0).max(100).optional(),
});
export type CareerRecommendation = z.infer<typeof careerRecommendationSchema>;

// Assessment result schema
export const assessmentResultSchema = z.object({
	id: z.string(),
	userId: z.string().optional(),
	responses: z.array(quizResponseSchema),
	personalityProfile: personalityProfileSchema,
	recommendations: z.array(careerRecommendationSchema),
	completedAt: z.string().datetime(),
	version: z.string().default("1.0"),
});
export type AssessmentResult = z.infer<typeof assessmentResultSchema>;

// Market insight schema
export const marketInsightSchema = z.object({
	id: z.string(),
	title: z.string(),
	value: z.string(),
	change: z.string().optional(),
	trend: z.enum(["up", "down", "stable"]),
	description: z.string().optional(),
	field: careerFieldSchema.optional(),
	updatedAt: z.string().datetime().optional(),
});
export type MarketInsight = z.infer<typeof marketInsightSchema>;

// Career pathway stage schema
export const careerStageSchema = z.object({
	level: careerExperienceLevelSchema,
	title: z.string(),
	titleFr: z.string().optional(),
	yearsExperience: z.string(),
	salaryRange: z.object({
		min: z.number(),
		max: z.number(),
		currency: z.string().default("DH"),
	}),
	responsibilities: z.array(z.string()).optional(),
	certifications: z.array(z.string()).optional(),
});
export type CareerStage = z.infer<typeof careerStageSchema>;

// Career pathway schema
export const careerPathwaySchema = z.object({
	id: z.string(),
	field: careerFieldSchema,
	name: z.string(),
	nameFr: z.string().optional(),
	description: z.string().optional(),
	stages: z.array(careerStageSchema),
	relatedPrograms: z.array(z.string()).optional(),
});
export type CareerPathway = z.infer<typeof careerPathwaySchema>;

// Top employer schema
export const topEmployerSchema = z.object({
	id: z.string(),
	name: z.string(),
	industry: z.string(),
	location: z.string(),
	openPositions: z.number(),
	fields: z.array(careerFieldSchema),
	featured: z.boolean().default(false),
});
export type TopEmployer = z.infer<typeof topEmployerSchema>;

// Salary statistics schema
export const salaryStatisticsSchema = z.object({
	field: careerFieldSchema,
	level: careerExperienceLevelSchema,
	region: z.string().optional(),
	median: z.number(),
	min: z.number(),
	max: z.number(),
	currency: z.string().default("DH"),
	sampleSize: z.number().optional(),
	updatedAt: z.string().datetime().optional(),
});
export type SalaryStatistics = z.infer<typeof salaryStatisticsSchema>;

// Input schemas for API endpoints
export const getAssessmentQuestionsInputSchema = z.object({
	language: z.enum(["fr", "en", "ar"]).default("fr"),
	category: questionCategorySchema.optional(),
});
export type GetAssessmentQuestionsInput = z.infer<typeof getAssessmentQuestionsInputSchema>;

export const submitAssessmentInputSchema = z.object({
	responses: z.array(quizResponseSchema),
	language: z.enum(["fr", "en", "ar"]).default("fr"),
});
export type SubmitAssessmentInput = z.infer<typeof submitAssessmentInputSchema>;

export const getCareerPathwaysInputSchema = z.object({
	field: careerFieldSchema.optional(),
	language: z.enum(["fr", "en", "ar"]).default("fr"),
});
export type GetCareerPathwaysInput = z.infer<typeof getCareerPathwaysInputSchema>;

export const getSalaryStatisticsInputSchema = z.object({
	field: careerFieldSchema.optional(),
	level: careerExperienceLevelSchema.optional(),
	region: z.string().optional(),
});
export type GetSalaryStatisticsInput = z.infer<typeof getSalaryStatisticsInputSchema>;

export const getMarketInsightsInputSchema = z.object({
	field: careerFieldSchema.optional(),
	language: z.enum(["fr", "en", "ar"]).default("fr"),
});
export type GetMarketInsightsInput = z.infer<typeof getMarketInsightsInputSchema>;

// Export all schemas as a group for easy importing
export const careerSchemas = {
	careerField: careerFieldSchema,
	careerExperienceLevel: careerExperienceLevelSchema,
	questionCategory: questionCategorySchema,
	personalityTrait: personalityTraitSchema,
	quizOption: quizOptionSchema,
	quizQuestion: quizQuestionSchema,
	quizResponse: quizResponseSchema,
	personalityProfile: personalityProfileSchema,
	careerRecommendation: careerRecommendationSchema,
	assessmentResult: assessmentResultSchema,
	marketInsight: marketInsightSchema,
	careerStage: careerStageSchema,
	careerPathway: careerPathwaySchema,
	topEmployer: topEmployerSchema,
	salaryStatistics: salaryStatisticsSchema,
};
