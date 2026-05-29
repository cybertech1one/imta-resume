import z from "zod";

export const atsIssueSchema = z.object({
	type: z.enum(["critical", "warning"]),
	message: z.string(),
	fix: z.string(),
});

export const atsCompatibilitySchema = z.object({
	score: z.number().min(0).max(100),
	issues: z.array(atsIssueSchema),
});

export const moroccoMarketInsightSchema = z.object({
	category: z.enum(["language", "photo", "certifications", "experience", "personalInfo", "coverLetter"]),
	status: z.enum(["good", "warning", "missing"]),
	message: z.string(),
});

export const moroccoMarketFitSchema = z.object({
	score: z.number().min(0).max(100),
	insights: z.array(moroccoMarketInsightSchema),
});

export const swotSchema = z.object({
	strengths: z.array(z.string()),
	weaknesses: z.array(z.string()),
	opportunities: z.array(z.string()),
	threats: z.array(z.string()),
});

export const sectionSuggestionSchema = z.object({
	section: z.string(),
	priority: z.enum(["high", "medium", "low"]),
	suggestions: z.array(z.string()),
});

export const quickFixSchema = z.object({
	action: z.enum(["add", "remove", "update"]),
	target: z.string(),
	description: z.string(),
});

export const resumeAnalysisSchema = z.object({
	overallScore: z.number().min(0).max(100),
	swot: swotSchema,
	atsCompatibility: atsCompatibilitySchema,
	moroccoMarketFit: moroccoMarketFitSchema,
	sectionSuggestions: z.array(sectionSuggestionSchema),
	quickFixes: z.array(quickFixSchema),
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;
export type ATSIssue = z.infer<typeof atsIssueSchema>;
export type MoroccoMarketInsight = z.infer<typeof moroccoMarketInsightSchema>;
export type SWOT = z.infer<typeof swotSchema>;
export type SectionSuggestion = z.infer<typeof sectionSuggestionSchema>;
export type QuickFix = z.infer<typeof quickFixSchema>;
