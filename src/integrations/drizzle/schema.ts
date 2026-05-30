import * as pg from "drizzle-orm/pg-core";
import { defaultResumeData, type ResumeData } from "@/schema/resume/data";
import { generateId } from "@/utils/string";

// User role enum for admin and partner functionality
export const userRoleEnum = pg.pgEnum("user_role", ["user", "admin", "partner"]);

export const user = pg.pgTable(
	"user",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		image: pg.text("image"),
		name: pg.text("name").notNull(),
		email: pg.text("email").notNull().unique(),
		emailVerified: pg.boolean("email_verified").notNull().default(false),
		username: pg.text("username").notNull().unique(),
		displayUsername: pg.text("display_username").notNull().unique(),
		twoFactorEnabled: pg.boolean("two_factor_enabled").notNull().default(false),
		role: userRoleEnum("role").notNull().default("user"),
		imtaProgram: pg.text("imta_program"),
		onboardingCompleted: pg.boolean("onboarding_completed").notNull().default(false),
		preferredAiLanguage: pg.text("preferred_ai_language").default("fr"),
		// Admin moderation: ban / suspension
		banned: pg.boolean("banned").notNull().default(false),
		banReason: pg.text("ban_reason"),
		banExpiresAt: pg.timestamp("ban_expires_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
	},
	(t) => [pg.index().on(t.email), pg.index().on(t.username)],
);

export const session = pg.pgTable(
	"session",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		token: pg.text("token").notNull().unique(),
		ipAddress: pg.text("ip_address"),
		userAgent: pg.text("user_agent"),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		expiresAt: pg.timestamp("expires_at", { withTimezone: true }).notNull(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
	},
	(t) => [
		pg.index().on(t.token, t.userId),
		pg.index().on(t.expiresAt),
		pg
			.index("session_token_idx")
			.on(t.token), // Separate index for token-only lookups
	],
);

export const account = pg.pgTable(
	"account",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		accountId: pg.text("account_id").notNull(),
		providerId: pg.text("provider_id").notNull().default("credential"),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		scope: pg.text("scope"),
		idToken: pg.text("id_token"),
		password: pg.text("password"),
		accessToken: pg.text("access_token"),
		refreshToken: pg.text("refresh_token"),
		accessTokenExpiresAt: pg.timestamp("access_token_expires_at", { withTimezone: true }),
		refreshTokenExpiresAt: pg.timestamp("refresh_token_expires_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg
			.index("account_provider_account_idx")
			.on(t.providerId, t.accountId), // Index for OAuth provider lookups
	],
);

export const verification = pg.pgTable(
	"verification",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		identifier: pg.text("identifier").notNull().unique(),
		value: pg.text("value").notNull(),
		expiresAt: pg.timestamp("expires_at", { withTimezone: true }).notNull(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
	},
	(t) => [pg.index().on(t.identifier)],
);

export const twoFactor = pg.pgTable(
	"two_factor",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		secret: pg.text("secret"),
		backupCodes: pg.text("backup_codes"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.secret)],
);

export const passkey = pg.pgTable(
	"passkey",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		name: pg.text("name"),
		aaguid: pg.text("aaguid"),
		publicKey: pg.text("public_key").notNull(),
		credentialID: pg.text("credential_id").notNull(),
		counter: pg.integer("counter").notNull(),
		deviceType: pg.text("device_type").notNull(),
		backedUp: pg.boolean("backed_up").notNull().default(false),
		transports: pg.text("transports").notNull(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

export const resume = pg.pgTable(
	"resume",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		name: pg.text("name").notNull(),
		slug: pg.text("slug").notNull(),
		tags: pg.text("tags").array().notNull().default([]),
		isPublic: pg.boolean("is_public").notNull().default(false),
		isLocked: pg.boolean("is_locked").notNull().default(false),
		password: pg.text("password"),
		data: pg
			.jsonb("data")
			.notNull()
			.$type<ResumeData>()
			.$defaultFn(() => defaultResumeData),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
	},
	(t) => [
		pg.unique().on(t.slug, t.userId),
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.updatedAt.desc()),
		pg.index().on(t.isPublic, t.slug, t.userId),
	],
);

export const resumeStatistics = pg.pgTable(
	"resume_statistics",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		views: pg.integer("views").notNull().default(0),
		downloads: pg.integer("downloads").notNull().default(0),
		lastViewedAt: pg.timestamp("last_viewed_at", { withTimezone: true }),
		lastDownloadedAt: pg.timestamp("last_downloaded_at", { withTimezone: true }),
		resumeId: pg
			.uuid("resume_id")
			.unique()
			.notNull()
			.references(() => resume.id, { onDelete: "cascade" }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
	},
	(t) => [pg.index().on(t.resumeId)],
);

export const apikey = pg.pgTable(
	"apikey",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		name: pg.text("name"),
		start: pg.text("start"),
		prefix: pg.text("prefix"),
		key: pg.text("key").notNull(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		refillInterval: pg.integer("refill_interval"),
		refillAmount: pg.integer("refill_amount"),
		lastRefillAt: pg.timestamp("last_refill_at", { withTimezone: true }),
		enabled: pg.boolean("enabled").notNull().default(true),
		rateLimitEnabled: pg.boolean("rate_limit_enabled").notNull().default(false),
		rateLimitTimeWindow: pg.integer("rate_limit_time_window"),
		rateLimitMax: pg.integer("rate_limit_max"),
		requestCount: pg.integer("request_count").notNull().default(0),
		remaining: pg.integer("remaining"),
		lastRequest: pg.timestamp("last_request", { withTimezone: true }),
		expiresAt: pg.timestamp("expires_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
		permissions: pg.text("permissions"),
		metadata: pg.jsonb("metadata"),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.key), pg.index().on(t.enabled, t.userId)],
);

// Audit log for tracking admin actions
export const auditLog = pg.pgTable(
	"audit_log",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		adminId: pg.uuid("admin_id").references(() => user.id, { onDelete: "set null" }),
		action: pg.text("action").notNull(), // e.g., "delete_user", "change_role", "delete_resume"
		targetType: pg.text("target_type"), // "user", "resume"
		targetId: pg.uuid("target_id"),
		metadata: pg.jsonb("metadata"), // Additional context (old values, new values, etc.)
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.adminId), pg.index().on(t.createdAt.desc())],
);

// ============================================
// SKILLS QUIZ TABLES
// ============================================

// Skills quiz category enum
export const skillsQuizCategoryEnum = pg.pgEnum("skills_quiz_category", ["technical", "soft_skills", "leadership"]);

// Skills quiz level enum
export const skillsQuizLevelEnum = pg.pgEnum("skills_quiz_level", ["beginner", "intermediate", "advanced", "expert"]);

// TypeScript types for skills quiz
export type SkillsQuizCategory = "technical" | "soft_skills" | "leadership";
export type SkillsQuizLevel = "beginner" | "intermediate" | "advanced" | "expert";

// Skill breakdown type for storing per-skill results
export type SkillBreakdown = Record<string, { correct: number; total: number }>;

// Skills quiz result table
export const skillsQuizResult = pg.pgTable(
	"skills_quiz_result",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		category: skillsQuizCategoryEnum("category").notNull(),
		totalQuestions: pg.integer("total_questions").notNull(),
		correctAnswers: pg.integer("correct_answers").notNull(),
		score: pg.integer("score").notNull(), // Percentage 0-100
		level: skillsQuizLevelEnum("level").notNull(),
		timeSpent: pg.integer("time_spent").notNull(), // In seconds
		skillBreakdown: pg.jsonb("skill_breakdown").notNull().$type<SkillBreakdown>().default({}),
		badges: pg.text("badges").array().notNull().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.category), pg.index().on(t.userId, t.createdAt.desc())],
);

// ============================================
// INTERVIEW SYSTEM TABLES
// ============================================

// Interview field specialization enum
export const interviewFieldEnum = pg.pgEnum("interview_field", ["healthcare", "industrial", "hse", "general"]);

// Interview difficulty enum
export const interviewDifficultyEnum = pg.pgEnum("interview_difficulty", ["beginner", "intermediate", "advanced"]);

// IMTA Program enum for specific career programs
export const imtaProgramEnum = pg.pgEnum("imta_program", [
	"sage_femme",
	"infirmier_polyvalent",
	"aide_soignant",
	"infirmier_auxiliaire",
	"conducteur_engins",
	"mecanique_engins",
	"tourneur_industriel",
	"cariste",
	"electromecanique",
	"soudure",
	"hse_specialist",
	"other",
]);

// Interview session status enum
export const interviewSessionStatusEnum = pg.pgEnum("interview_session_status", [
	"pending",
	"in_progress",
	"completed",
	"abandoned",
]);

// Interview type (stored as JSON array in session)
export type InterviewType = "behavioral" | "technical" | "situational" | "motivational" | "general";

// Interview question type
export type InterviewQuestion = {
	id: string;
	question: string;
	questionFr?: string;
	type: InterviewType;
	// Aligned with interviewFieldSchema (src/schema/interview) which now covers all IMTA fields.
	field: "healthcare" | "industrial" | "hse" | "general" | "technology" | "management";
	difficulty: "beginner" | "intermediate" | "advanced";
	expectedPoints?: string[];
	followUpQuestions?: string[];
	tips?: string;
	order: number;
};

// Interview response type
export type InterviewResponse = {
	questionId: string;
	response: string;
	responseTime?: number;
	audioUrl?: string;
	timestamp: string;
};

// Response evaluation type
export type ResponseEvaluation = {
	questionId: string;
	score: number;
	strengths: string[];
	areasForImprovement: string[];
	suggestions: string[];
	sampleAnswer?: string;
	keyPointsCovered: string[];
	keyPointsMissed: string[];
	overallFeedback: string;
};

// IMTA Program type for TypeScript
export type ImtaProgramType =
	| "sage_femme"
	| "infirmier_polyvalent"
	| "aide_soignant"
	| "infirmier_auxiliaire"
	| "conducteur_engins"
	| "mecanique_engins"
	| "tourneur_industriel"
	| "cariste"
	| "electromecanique"
	| "soudure"
	| "hse_specialist"
	| "other";

// Interview session table
export const interviewSession = pg.pgTable(
	"interview_session",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		resumeId: pg.uuid("resume_id").references(() => resume.id, { onDelete: "set null" }),
		title: pg.text("title").notNull(),
		description: pg.text("description"),
		field: interviewFieldEnum("field").notNull().default("general"),
		program: imtaProgramEnum("program"), // Specific IMTA program (optional)
		types: pg.jsonb("types").notNull().$type<InterviewType[]>().default(["behavioral", "technical"]),
		difficulty: interviewDifficultyEnum("difficulty").notNull().default("intermediate"),
		language: pg.text("language").notNull().default("fr"),
		status: interviewSessionStatusEnum("status").notNull().default("pending"),
		questions: pg.jsonb("questions").notNull().$type<InterviewQuestion[]>().default([]),
		responses: pg.jsonb("responses").notNull().$type<InterviewResponse[]>().default([]),
		evaluations: pg.jsonb("evaluations").notNull().$type<ResponseEvaluation[]>().default([]),
		totalQuestions: pg.integer("total_questions").notNull().default(0),
		completedQuestions: pg.integer("completed_questions").notNull().default(0),
		overallScore: pg.integer("overall_score"),
		jobPosition: pg.text("job_position"), // Target position
		companyName: pg.text("company_name"), // Target company
		startedAt: pg.timestamp("started_at", { withTimezone: true }),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.resumeId),
		pg.index().on(t.program),
	],
);

// ============================================
// USER TRAINING INTERESTS TABLES
// ============================================

// Training program type enum
export const trainingProgramTypeEnum = pg.pgEnum("training_program_type", [
	"imta_program",
	"external_course",
	"certification",
	"bootcamp",
	"self_learning",
]);

// Training category enum
export const trainingCategoryEnum = pg.pgEnum("training_category", [
	"healthcare",
	"industrial",
	"hse",
	"technology",
	"business",
	"other",
]);

// Training interest status enum
export const trainingInterestStatusEnum = pg.pgEnum("training_interest_status", [
	"interested",
	"in_progress",
	"completed",
]);

// TypeScript types for training enums
export type TrainingProgramType = "imta_program" | "external_course" | "certification" | "bootcamp" | "self_learning";

export type TrainingCategory = "healthcare" | "industrial" | "hse" | "technology" | "business" | "other";

export type TrainingInterestStatus = "interested" | "in_progress" | "completed";

// User training interests table
export const userTrainingInterests = pg.pgTable(
	"user_training_interests",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		programId: pg.text("program_id").notNull(), // Can be IMTA program ID or custom
		programName: pg.text("program_name").notNull(),
		programType: trainingProgramTypeEnum("program_type").notNull(),
		category: trainingCategoryEnum("category").notNull(),
		status: trainingInterestStatusEnum("status").notNull().default("interested"),
		startDate: pg.timestamp("start_date", { withTimezone: true }),
		completionDate: pg.timestamp("completion_date", { withTimezone: true }),
		notes: pg.text("notes"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.category),
		pg.index().on(t.programId),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// Interview session analysis (stored separately for quick access)
export const interviewAnalysis = pg.pgTable(
	"interview_analysis",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		sessionId: pg
			.uuid("session_id")
			.unique()
			.notNull()
			.references(() => interviewSession.id, { onDelete: "cascade" }),
		overallScore: pg.integer("overall_score").notNull(),
		scoreBreakdown: pg
			.jsonb("score_breakdown")
			.notNull()
			.$type<{
				behavioral?: number;
				technical?: number;
				situational?: number;
				motivational?: number;
				general?: number;
			}>()
			.default({}),
		topStrengths: pg.jsonb("top_strengths").notNull().$type<string[]>().default([]),
		topWeaknesses: pg.jsonb("top_weaknesses").notNull().$type<string[]>().default([]),
		recommendations: pg.jsonb("recommendations").notNull().$type<string[]>().default([]),
		readinessLevel: pg.text("readiness_level").notNull().default("needs_practice"),
		summary: pg.text("summary").notNull(),
		nextSteps: pg.jsonb("next_steps").notNull().$type<string[]>().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.sessionId)],
);

// ============================================
// JOB APPLICATION TRACKING TABLES
// ============================================

// Application status enum
export const applicationStatusEnum = pg.pgEnum("application_status", [
	"saved",
	"applied",
	"phone_screen",
	"interview",
	"offer",
	"rejected",
	"withdrawn",
	"accepted",
]);

// Job application table
export const jobApplication = pg.pgTable(
	"job_application",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		resumeId: pg.uuid("resume_id").references(() => resume.id, { onDelete: "set null" }),
		companyName: pg.text("company_name").notNull(),
		position: pg.text("position").notNull(),
		location: pg.text("location"),
		jobUrl: pg.text("job_url"),
		jobDescription: pg.text("job_description"),
		salary: pg.text("salary"),
		salaryMin: pg.integer("salary_min"),
		salaryMax: pg.integer("salary_max"),
		salaryCurrency: pg.text("salary_currency").default("MAD"),
		status: applicationStatusEnum("status").notNull().default("saved"),
		appliedAt: pg.timestamp("applied_at", { withTimezone: true }),
		deadline: pg.timestamp("deadline", { withTimezone: true }),
		source: pg.text("source"), // linkedin, indeed, company website, referral, etc.
		contactName: pg.text("contact_name"),
		contactEmail: pg.text("contact_email"),
		contactPhone: pg.text("contact_phone"),
		notes: pg.text("notes"),
		tags: pg.text("tags").array().notNull().default([]),
		priority: pg.integer("priority").notNull().default(0), // 0-5
		isRemote: pg.boolean("is_remote").default(false),
		workType: pg.text("work_type"), // full-time, part-time, contract, internship
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.userId, t.companyName),
	],
);

// Application activity/timeline table
export const applicationActivity = pg.pgTable(
	"application_activity",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		applicationId: pg
			.uuid("application_id")
			.notNull()
			.references(() => jobApplication.id, { onDelete: "cascade" }),
		activityType: pg.text("activity_type").notNull(), // status_change, note, interview_scheduled, follow_up, etc.
		description: pg.text("description"),
		oldStatus: applicationStatusEnum("old_status"),
		newStatus: applicationStatusEnum("new_status"),
		scheduledAt: pg.timestamp("scheduled_at", { withTimezone: true }),
		metadata: pg.jsonb("metadata"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.applicationId), pg.index().on(t.applicationId, t.createdAt.desc())],
);

// ============================================
// SALARY HISTORY TABLES
// ============================================

// Salary record table
export const salaryRecord = pg.pgTable(
	"salary_record",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		companyName: pg.text("company_name").notNull(),
		position: pg.text("position").notNull(),
		baseSalary: pg.integer("base_salary").notNull(),
		currency: pg.text("currency").notNull().default("MAD"),
		bonus: pg.integer("bonus"),
		commission: pg.integer("commission"),
		otherCompensation: pg.integer("other_compensation"),
		totalCompensation: pg.integer("total_compensation").notNull(),
		payFrequency: pg.text("pay_frequency").notNull().default("monthly"), // monthly, yearly, hourly
		startDate: pg.timestamp("start_date", { withTimezone: true }).notNull(),
		endDate: pg.timestamp("end_date", { withTimezone: true }),
		isCurrent: pg.boolean("is_current").notNull().default(false),
		notes: pg.text("notes"),
		benefits: pg.text("benefits").array().default([]),
		location: pg.text("location"),
		industry: pg.text("industry"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.startDate.desc()), pg.index().on(t.userId, t.isCurrent)],
);

// ============================================
// JOB SEARCH JOURNAL TABLES
// ============================================

// Journal entry table
export const journalEntry = pg.pgTable(
	"journal_entry",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		date: pg.date("date").notNull(),
		title: pg.text("title"),
		content: pg.text("content"),
		mood: pg.text("mood"), // great, good, neutral, frustrated, stressed
		applicationsSubmitted: pg.integer("applications_submitted").default(0),
		interviewsCompleted: pg.integer("interviews_completed").default(0),
		networkingActivities: pg.integer("networking_activities").default(0),
		wins: pg.text("wins").array().default([]),
		challenges: pg.text("challenges").array().default([]),
		learnings: pg.text("learnings").array().default([]),
		tomorrowGoals: pg.text("tomorrow_goals").array().default([]),
		tags: pg.text("tags").array().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.unique().on(t.userId, t.date),
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.date.desc()),
		pg.index().on(t.userId, t.mood),
	],
);

// ============================================
// CAREER GOALS TABLES
// ============================================

// Career goal status enum
export const goalStatusEnum = pg.pgEnum("goal_status", [
	"not_started",
	"in_progress",
	"completed",
	"on_hold",
	"cancelled",
]);

// Career goal table
export const careerGoal = pg.pgTable(
	"career_goal",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		description: pg.text("description"),
		category: pg.text("category").notNull(), // career, skill, education, networking, financial, other
		status: goalStatusEnum("status").notNull().default("not_started"),
		priority: pg.integer("priority").notNull().default(0), // 0-5
		targetDate: pg.timestamp("target_date", { withTimezone: true }),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		progress: pg.integer("progress").notNull().default(0), // 0-100
		tags: pg.text("tags").array().default([]),
		metrics: pg.jsonb("metrics").$type<{ name: string; target: number; current: number }[]>(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.category),
		pg.index().on(t.userId, t.targetDate),
	],
);

// Goal milestone table
export const goalMilestone = pg.pgTable(
	"goal_milestone",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		goalId: pg
			.uuid("goal_id")
			.notNull()
			.references(() => careerGoal.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		description: pg.text("description"),
		isCompleted: pg.boolean("is_completed").notNull().default(false),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		dueDate: pg.timestamp("due_date", { withTimezone: true }),
		order: pg.integer("order").notNull().default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.goalId), pg.index().on(t.goalId, t.order)],
);

// ============================================
// PERFORMANCE REVIEW PREP TABLES
// ============================================

// Accomplishment category enum
export const accomplishmentCategoryEnum = pg.pgEnum("accomplishment_category", [
	"project",
	"achievement",
	"skill",
	"recognition",
	"improvement",
]);

// Accomplishment impact enum
export const accomplishmentImpactEnum = pg.pgEnum("accomplishment_impact", ["high", "medium", "low"]);

// TypeScript types for accomplishments
export type AccomplishmentCategory = "project" | "achievement" | "skill" | "recognition" | "improvement";
export type AccomplishmentImpact = "high" | "medium" | "low";

// User accomplishments table
export const reviewAccomplishment = pg.pgTable(
	"review_accomplishment",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		date: pg.date("date").notNull(),
		title: pg.text("title").notNull(),
		description: pg.text("description").notNull(),
		category: accomplishmentCategoryEnum("category").notNull(),
		impact: accomplishmentImpactEnum("impact").notNull(),
		metrics: pg.text("metrics"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.date.desc()), pg.index().on(t.userId, t.category)],
);

// Review goal category enum
export const reviewGoalCategoryEnum = pg.pgEnum("review_goal_category", [
	"performance",
	"development",
	"career",
	"collaboration",
]);

// Review goal status enum
export const reviewGoalStatusEnum = pg.pgEnum("review_goal_status", [
	"on_track",
	"at_risk",
	"completed",
	"not_started",
]);

// TypeScript types for review goals
export type ReviewGoalCategory = "performance" | "development" | "career" | "collaboration";
export type ReviewGoalStatus = "on_track" | "at_risk" | "completed" | "not_started";

// Review goal milestone type
export type ReviewGoalMilestone = {
	title: string;
	completed: boolean;
};

// User review goals table
export const reviewGoal = pg.pgTable(
	"review_goal",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		description: pg.text("description").notNull(),
		category: reviewGoalCategoryEnum("category").notNull(),
		targetDate: pg.date("target_date").notNull(),
		progress: pg.integer("progress").notNull().default(0), // 0-100
		status: reviewGoalStatusEnum("status").notNull().default("not_started"),
		milestones: pg.jsonb("milestones").notNull().$type<ReviewGoalMilestone[]>().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.category),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.targetDate),
	],
);

// Salary market trend enum
export const salaryMarketTrendEnum = pg.pgEnum("salary_market_trend", ["up", "stable", "down"]);

// TypeScript type for salary market trend
export type SalaryMarketTrend = "up" | "stable" | "down";

// Salary research data table
export const salaryResearch = pg.pgTable(
	"salary_research",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: pg.text("role").notNull(),
		level: pg.text("level").notNull(),
		minSalary: pg.integer("min_salary").notNull(),
		maxSalary: pg.integer("max_salary").notNull(),
		avgSalary: pg.integer("avg_salary").notNull(),
		marketTrend: salaryMarketTrendEnum("market_trend").notNull(),
		source: pg.text("source").notNull(),
		lastUpdated: pg.text("last_updated").notNull(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.role)],
);

// ============================================
// INTERVIEW PREP TABLES
// ============================================

// Interview prep checklist table
export const interviewChecklist = pg.pgTable(
	"interview_checklist",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		applicationId: pg.uuid("application_id").references(() => jobApplication.id, { onDelete: "set null" }),
		companyName: pg.text("company_name").notNull(),
		position: pg.text("position").notNull(),
		interviewDate: pg.timestamp("interview_date", { withTimezone: true }),
		interviewType: pg.text("interview_type"), // phone, video, in-person, technical, behavioral, panel
		interviewerName: pg.text("interviewer_name"),
		interviewerRole: pg.text("interviewer_role"),
		notes: pg.text("notes"),
		status: pg.text("status").notNull().default("preparing"), // preparing, ready, completed
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.interviewDate), pg.index().on(t.applicationId)],
);

// Checklist item table
export const checklistItem = pg.pgTable(
	"checklist_item",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		checklistId: pg
			.uuid("checklist_id")
			.notNull()
			.references(() => interviewChecklist.id, { onDelete: "cascade" }),
		category: pg.text("category").notNull(), // research, preparation, logistics, questions, follow-up
		title: pg.text("title").notNull(),
		description: pg.text("description"),
		isCompleted: pg.boolean("is_completed").notNull().default(false),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		order: pg.integer("order").notNull().default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.checklistId), pg.index().on(t.checklistId, t.category)],
);

// ============================================
// NETWORKING CONTACTS TABLES
// ============================================

// Contact relationship type enum
export const contactRelationshipEnum = pg.pgEnum("contact_relationship", [
	"colleague",
	"mentor",
	"recruiter",
	"hiring_manager",
	"industry_peer",
	"alumni",
	"referral",
	"other",
]);

// Networking contact table
export const networkingContact = pg.pgTable(
	"networking_contact",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		email: pg.text("email"),
		phone: pg.text("phone"),
		company: pg.text("company"),
		position: pg.text("position"),
		linkedinUrl: pg.text("linkedin_url"),
		relationship: contactRelationshipEnum("relationship").notNull().default("other"),
		relationshipStrength: pg.text("relationship_strength").default("moderate"), // strong, moderate, weak, dormant
		howMet: pg.text("how_met"),
		notes: pg.text("notes"),
		tags: pg.text("tags").array().default([]),
		lastContactedAt: pg.timestamp("last_contacted_at", { withTimezone: true }),
		nextFollowUpAt: pg.timestamp("next_follow_up_at", { withTimezone: true }),
		isFavorite: pg.boolean("is_favorite").default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.relationship),
		pg.index().on(t.userId, t.company),
		pg.index().on(t.userId, t.lastContactedAt.desc()),
		pg.index().on(t.userId, t.nextFollowUpAt),
	],
);

// Contact interaction table
export const contactInteraction = pg.pgTable(
	"contact_interaction",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		contactId: pg
			.uuid("contact_id")
			.notNull()
			.references(() => networkingContact.id, { onDelete: "cascade" }),
		interactionType: pg.text("interaction_type").notNull(), // email, call, meeting, linkedin, event, coffee_chat, referral
		description: pg.text("description"),
		outcome: pg.text("outcome"),
		followUpNeeded: pg.boolean("follow_up_needed").default(false),
		followUpDate: pg.timestamp("follow_up_date", { withTimezone: true }),
		interactedAt: pg.timestamp("interacted_at", { withTimezone: true }).notNull().defaultNow(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.contactId), pg.index().on(t.contactId, t.interactedAt.desc())],
);

// ============================================
// COVER LETTERS TABLE
// ============================================

// Cover letter table
export const coverLetter = pg.pgTable(
	"cover_letter",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		applicationId: pg.uuid("application_id").references(() => jobApplication.id, { onDelete: "set null" }),
		resumeId: pg.uuid("resume_id").references(() => resume.id, { onDelete: "set null" }),
		name: pg.text("name").notNull(),
		companyName: pg.text("company_name"),
		position: pg.text("position"),
		template: pg.text("template").default("formal"), // formal, creative, tech, executive
		tone: pg.text("tone").default("professional"), // professional, friendly, confident, enthusiastic
		content: pg.text("content").notNull(),
		tags: pg.text("tags").array().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.applicationId),
		pg.index().on(t.resumeId),
	],
);

// ============================================
// SKILL CERTIFICATIONS TABLE
// ============================================

// Certification status enum
export const certificationStatusEnum = pg.pgEnum("certification_status", [
	"planned",
	"in_progress",
	"completed",
	"expired",
]);

// Certification table
export const certification = pg.pgTable(
	"certification",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		issuer: pg.text("issuer").notNull(),
		category: pg.text("category"), // healthcare, industrial, hse, technology, management, language
		status: certificationStatusEnum("status").notNull().default("planned"),
		credentialId: pg.text("credential_id"),
		credentialUrl: pg.text("credential_url"),
		issueDate: pg.timestamp("issue_date", { withTimezone: true }),
		expiryDate: pg.timestamp("expiry_date", { withTimezone: true }),
		cost: pg.integer("cost"),
		currency: pg.text("currency").default("MAD"),
		notes: pg.text("notes"),
		reminderDays: pg.integer("reminder_days").default(30), // Days before expiry to remind
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.expiryDate),
		pg.index().on(t.userId, t.category),
	],
);

// ============================================
// CAREER ROADMAP TABLES
// ============================================

// Roadmap step type enum
export const roadmapStepTypeEnum = pg.pgEnum("roadmap_step_type", [
	"skill",
	"experience",
	"certification",
	"networking",
	"education",
	"project",
]);

// TypeScript types for roadmap
export type RoadmapStepType = "skill" | "experience" | "certification" | "networking" | "education" | "project";

// Roadmap skill requirement type
export type RoadmapSkillRequirement = {
	id: string;
	name: string;
	category: "technical" | "soft" | "language" | "tool" | "certification";
	currentLevel: number;
	requiredLevel: number;
	priority: "critical" | "important" | "nice-to-have";
};

// Roadmap milestone type
export type RoadmapMilestone = {
	id: string;
	title: string;
	description: string;
	targetDate: string;
	completed: boolean;
	completedDate?: string;
	type: "checkpoint" | "achievement" | "certification" | "project";
};

// Roadmap resource type
export type RoadmapResource = {
	id: string;
	title: string;
	type: "course" | "book" | "video" | "article" | "certification" | "tool" | "community";
	platform: string;
	url: string;
	duration: string;
	cost: "free" | "paid" | "subscription";
	rating?: number;
	recommended: boolean;
};

// Roadmap step type
export type RoadmapStep = {
	id: string;
	order: number;
	title: string;
	description: string;
	type: RoadmapStepType;
	duration: number;
	skills: RoadmapSkillRequirement[];
	milestones: RoadmapMilestone[];
	resources: RoadmapResource[];
	estimatedSalary?: { min: number; max: number };
	completed: boolean;
	completedDate?: string;
	startDate?: string;
};

// Alternative path type
export type RoadmapAlternativePath = {
	id: string;
	name: string;
	description: string;
	duration: number;
	steps: RoadmapStep[];
	successProbability: number;
	advantages: string[];
	challenges: string[];
	estimatedCost: string;
	isSelected: boolean;
};

// Roadmap progress type
export type RoadmapProgress = {
	overallProgress: number;
	currentStepId: string | null;
	completedSteps: number;
	totalSteps: number;
	completedMilestones: number;
	totalMilestones: number;
	completedSkills: number;
	totalSkills: number;
	startDate: string;
	estimatedCompletionDate: string;
	actualProgress: number;
	streakDays: number;
	lastActivityDate: string;
};

// Career goal for roadmap
export type RoadmapCareerGoal = {
	id: string;
	currentRole: string;
	targetRole: string;
	industry: string;
	yearsExperience: number;
	timeline: number;
	priorities: string[];
	constraints: string[];
	createdAt: string;
};

// Career roadmap table
export const careerRoadmap = pg.pgTable(
	"career_roadmap",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		goal: pg.jsonb("goal").notNull().$type<RoadmapCareerGoal>(),
		selectedPath: pg.jsonb("selected_path").notNull().$type<RoadmapAlternativePath>(),
		progress: pg.jsonb("progress").notNull().$type<RoadmapProgress>(),
		isShared: pg.boolean("is_shared").notNull().default(false),
		shareCode: pg.text("share_code"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.updatedAt.desc()), pg.index().on(t.shareCode)],
);

// ============================================
// SCHEDULED INTERVIEW TABLES
// ============================================

// Interview type enum for scheduling
export const scheduledInterviewTypeEnum = pg.pgEnum("scheduled_interview_type", ["phone", "video", "in_person"]);

// Interview status enum for scheduling
export const scheduledInterviewStatusEnum = pg.pgEnum("scheduled_interview_status", [
	"scheduled",
	"completed",
	"cancelled",
	"rescheduled",
	"no_show",
]);

// Interview outcome enum
export const scheduledInterviewOutcomeEnum = pg.pgEnum("scheduled_interview_outcome", [
	"pending",
	"passed",
	"failed",
	"on_hold",
	"offer_received",
]);

// Recurrence type enum
export const recurrenceTypeEnum = pg.pgEnum("recurrence_type", ["none", "daily", "weekly", "biweekly", "monthly"]);

// Reminder type enum
export const reminderTypeEnum = pg.pgEnum("reminder_type", ["preparation", "followup"]);

// TypeScript types
export type ScheduledInterviewType = "phone" | "video" | "in_person";
export type ScheduledInterviewStatus = "scheduled" | "completed" | "cancelled" | "rescheduled" | "no_show";
export type ScheduledInterviewOutcome = "pending" | "passed" | "failed" | "on_hold" | "offer_received";
export type RecurrenceType = "none" | "daily" | "weekly" | "biweekly" | "monthly";
export type ReminderType = "preparation" | "followup";

// Scheduled Interview table
export const scheduledInterview = pg.pgTable(
	"scheduled_interview",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		applicationId: pg.uuid("application_id").references(() => jobApplication.id, { onDelete: "set null" }),
		title: pg.text("title").notNull(),
		company: pg.text("company").notNull(),
		role: pg.text("role").notNull(),
		type: scheduledInterviewTypeEnum("type").notNull().default("video"),
		status: scheduledInterviewStatusEnum("status").notNull().default("scheduled"),
		outcome: scheduledInterviewOutcomeEnum("outcome").notNull().default("pending"),
		date: pg.date("date").notNull(),
		startTime: pg.text("start_time").notNull(),
		endTime: pg.text("end_time").notNull(),
		timezone: pg.text("timezone").notNull().default("Africa/Casablanca"),
		location: pg.text("location"),
		meetingLink: pg.text("meeting_link"),
		contactName: pg.text("contact_name"),
		contactEmail: pg.text("contact_email"),
		contactPhone: pg.text("contact_phone"),
		notes: pg.text("notes"),
		preparationMaterials: pg.text("preparation_materials"),
		interviewerNames: pg.text("interviewer_names").array().default([]),
		round: pg.integer("round").notNull().default(1),
		recurrence: recurrenceTypeEnum("recurrence").notNull().default("none"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.date),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.company),
		pg.index().on(t.applicationId),
	],
);

// Interview reminder table
export const interviewReminder = pg.pgTable(
	"interview_reminder",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		interviewId: pg
			.uuid("interview_id")
			.notNull()
			.references(() => scheduledInterview.id, { onDelete: "cascade" }),
		type: reminderTypeEnum("type").notNull().default("preparation"),
		date: pg.date("date").notNull(),
		time: pg.text("time").notNull(),
		message: pg.text("message").notNull(),
		completed: pg.boolean("completed").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.interviewId), pg.index().on(t.interviewId, t.completed)],
);

// Availability slot table
export const availabilitySlot = pg.pgTable(
	"availability_slot",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		dayOfWeek: pg.integer("day_of_week").notNull(), // 0 = Sunday, 6 = Saturday
		startTime: pg.text("start_time").notNull(),
		endTime: pg.text("end_time").notNull(),
		isRecurring: pg.boolean("is_recurring").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.dayOfWeek)],
);

// ============================================
// JOB ALERTS TABLES
// ============================================

// Alert notification frequency enum
export const alertFrequencyEnum = pg.pgEnum("alert_frequency", ["instant", "daily", "weekly"]);

// Alert work preference enum
export const alertWorkPreferenceEnum = pg.pgEnum("alert_work_preference", ["remote", "hybrid", "onsite", "any"]);

// Alert status enum
export const alertStatusEnum = pg.pgEnum("alert_status", ["active", "paused"]);

// Match quality enum
export const matchQualityEnum = pg.pgEnum("match_quality", ["excellent", "good", "fair"]);

// TypeScript types
export type AlertFrequency = "instant" | "daily" | "weekly";
export type AlertWorkPreference = "remote" | "hybrid" | "onsite" | "any";
export type AlertStatus = "active" | "paused";
export type MatchQuality = "excellent" | "good" | "fair";

// Job alert table
export const jobAlert = pg.pgTable(
	"job_alert",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		keywords: pg.text("keywords").array().notNull().default([]),
		locations: pg.text("locations").array().notNull().default([]),
		salaryMin: pg.integer("salary_min").notNull().default(0),
		salaryMax: pg.integer("salary_max").notNull().default(0),
		industries: pg.text("industries").array().notNull().default([]),
		companySizes: pg.text("company_sizes").array().notNull().default([]),
		workPreference: alertWorkPreferenceEnum("work_preference").notNull().default("any"),
		frequency: alertFrequencyEnum("frequency").notNull().default("daily"),
		status: alertStatusEnum("status").notNull().default("active"),
		lastTriggered: pg.timestamp("last_triggered", { withTimezone: true }),
		matchCount: pg.integer("match_count").notNull().default(0),
		viewedCount: pg.integer("viewed_count").notNull().default(0),
		appliedCount: pg.integer("applied_count").notNull().default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.status), pg.index().on(t.userId, t.createdAt.desc())],
);

// Job alert match table
export const jobAlertMatch = pg.pgTable(
	"job_alert_match",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		alertId: pg
			.uuid("alert_id")
			.notNull()
			.references(() => jobAlert.id, { onDelete: "cascade" }),
		jobId: pg.text("job_id").notNull(),
		jobTitle: pg.text("job_title").notNull(),
		company: pg.text("company").notNull(),
		location: pg.text("location"),
		salary: pg.text("salary"),
		matchScore: pg.integer("match_score").notNull().default(0),
		matchQuality: matchQualityEnum("match_quality").notNull().default("fair"),
		matchedKeywords: pg.text("matched_keywords").array().notNull().default([]),
		postedDate: pg.date("posted_date"),
		matchedDate: pg.date("matched_date").notNull(),
		isViewed: pg.boolean("is_viewed").notNull().default(false),
		isApplied: pg.boolean("is_applied").notNull().default(false),
		isDuplicate: pg.boolean("is_duplicate").notNull().default(false),
		duplicateOf: pg.text("duplicate_of"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.alertId),
		pg.index().on(t.alertId, t.matchedDate.desc()),
		pg.index().on(t.alertId, t.isViewed),
		pg.index().on(t.alertId, t.matchQuality),
	],
);

// ============================================
// CAREER ASSESSMENT TABLES
// ============================================

// Assessment status enum
export const assessmentStatusEnum = pg.pgEnum("assessment_status", ["in_progress", "completed"]);

// TypeScript types for career assessment
export type AssessmentStatus = "in_progress" | "completed";

// Quiz answer type stored in JSONB
export type CareerAssessmentAnswer = {
	questionId: string;
	optionId?: string;
	scaleValue?: number;
};

// Personality profile type stored in JSONB
export type CareerPersonalityProfile = {
	patient_care: number;
	technical_aptitude: number;
	safety_focus: number;
	leadership: number;
	teamwork: number;
	analytical: number;
	communication: number;
	stress_tolerance: number;
	physical_endurance: number;
	attention_to_detail: number;
};

// Career match type stored in JSONB
export type CareerAssessmentMatch = {
	programId: string;
	name: string;
	nameFr: string;
	matchPercentage: number;
	field: string;
	reasons: string[];
	duration: string;
	salary: string;
	employmentRate?: number;
};

// Career assessment table
export const careerAssessment = pg.pgTable(
	"career_assessment",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		status: assessmentStatusEnum("status").notNull().default("in_progress"),
		currentQuestion: pg.integer("current_question").notNull().default(0),
		answers: pg.jsonb("answers").notNull().$type<CareerAssessmentAnswer[]>().default([]),
		personalityProfile: pg.jsonb("personality_profile").$type<CareerPersonalityProfile>(),
		careerMatches: pg.jsonb("career_matches").$type<CareerAssessmentMatch[]>(),
		version: pg.text("version").notNull().default("v2"),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.status), pg.index().on(t.userId, t.updatedAt.desc())],
);

// ============================================
// STUDY PLAN TABLES
// ============================================

// TypeScript types for study plan data
export type StudyPlanCareerGoal = {
	id: string;
	targetRole: string;
	industry: string;
	timeline: number; // months
	description: string;
	createdAt: string;
};

export type StudyPlanSkill = {
	id: string;
	name: string;
	category: "technical" | "soft" | "language" | "certification";
	currentLevel: number; // 1-5
	targetLevel: number; // 1-5
	priority: "high" | "medium" | "low";
};

export type StudyPlanResource = {
	id: string;
	title: string;
	type: "course" | "book" | "tutorial" | "certification" | "video";
	platform: string;
	url: string;
	duration: string;
	skillId: string;
	completed: boolean;
	rating?: number;
};

export type StudyPlanTask = {
	id: string;
	title: string;
	description: string;
	skillId: string;
	resourceId?: string;
	scheduledDate: string;
	duration: number; // minutes
	completed: boolean;
	type: "study" | "practice" | "review" | "assessment";
};

export type StudyPlanMilestone = {
	id: string;
	title: string;
	description: string;
	targetDate: string;
	completed: boolean;
	completedDate?: string;
	skillIds: string[];
};

export type StudyPlanFlashcard = {
	id: string;
	skillId: string;
	question: string;
	answer: string;
	nextReview: string;
	interval: number; // days
	easeFactor: number;
	repetitions: number;
};

export type StudyPlanBadge = {
	id: string;
	name: string;
	description: string;
	icon: string;
	earnedDate: string;
};

export type StudyPlanStreak = {
	currentStreak: number;
	longestStreak: number;
	lastStudyDate: string;
	totalStudyDays: number;
	totalStudyMinutes: number;
	weeklyGoal: number; // minutes per week
	badges: StudyPlanBadge[];
};

export type StudyPlanData = {
	careerGoal: StudyPlanCareerGoal | null;
	skills: StudyPlanSkill[];
	resources: StudyPlanResource[];
	tasks: StudyPlanTask[];
	milestones: StudyPlanMilestone[];
	flashcards: StudyPlanFlashcard[];
	streak: StudyPlanStreak;
	lastUpdated: string;
};

// Default study plan data
export const defaultStudyPlanData: StudyPlanData = {
	careerGoal: null,
	skills: [],
	resources: [],
	tasks: [],
	milestones: [],
	flashcards: [],
	streak: {
		currentStreak: 0,
		longestStreak: 0,
		lastStudyDate: "",
		totalStudyDays: 0,
		totalStudyMinutes: 0,
		weeklyGoal: 300, // 5 hours per week
		badges: [],
	},
	lastUpdated: new Date().toISOString(),
};

// Study plan table - stores entire study plan as JSONB for flexibility
export const studyPlan = pg.pgTable(
	"study_plan",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		data: pg
			.jsonb("data")
			.notNull()
			.$type<StudyPlanData>()
			.$defaultFn(() => defaultStudyPlanData),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================
// CAREER TIMELINE TABLES
// ============================================

// Timeline event type enum
export const timelineEventTypeEnum = pg.pgEnum("timeline_event_type", [
	"job",
	"promotion",
	"education",
	"certification",
	"achievement",
	"skill",
	"goal",
]);

// TypeScript types for timeline
export type TimelineEventType = "job" | "promotion" | "education" | "certification" | "achievement" | "skill" | "goal";

// Timeline event table
export const careerTimelineEvent = pg.pgTable(
	"career_timeline_event",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: timelineEventTypeEnum("type").notNull(),
		title: pg.text("title").notNull(),
		organization: pg.text("organization").notNull().default(""),
		description: pg.text("description").notNull().default(""),
		startDate: pg.date("start_date").notNull(),
		endDate: pg.date("end_date"), // null for ongoing
		salary: pg.integer("salary"),
		skills: pg.text("skills").array().default([]),
		achievements: pg.text("achievements").array().default([]),
		isGoal: pg.boolean("is_goal").notNull().default(false),
		targetDate: pg.date("target_date"),
		completed: pg.boolean("completed").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.type), pg.index().on(t.userId, t.startDate.desc())],
);

// Timeline skill category enum
export const timelineSkillCategoryEnum = pg.pgEnum("timeline_skill_category", [
	"technical",
	"soft",
	"language",
	"tool",
]);

// TypeScript types for skill categories
export type TimelineSkillCategory = "technical" | "soft" | "language" | "tool";

// Timeline skill table
export const careerTimelineSkill = pg.pgTable(
	"career_timeline_skill",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		level: pg.integer("level").notNull().default(3), // 1-5
		acquiredDate: pg.date("acquired_date").notNull(),
		source: pg.text("source").notNull().default("manual"), // event ID or "manual"
		category: timelineSkillCategoryEnum("category").notNull().default("technical"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.category), pg.index().on(t.userId, t.acquiredDate.desc())],
);

// Timeline goal category enum
export const timelineGoalCategoryEnum = pg.pgEnum("timeline_goal_category", [
	"position",
	"salary",
	"skill",
	"certification",
	"other",
]);

// TypeScript types for goal categories
export type TimelineGoalCategory = "position" | "salary" | "skill" | "certification" | "other";

// Timeline goal table
export const careerTimelineGoal = pg.pgTable(
	"career_timeline_goal",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		description: pg.text("description").notNull().default(""),
		targetDate: pg.date("target_date").notNull(),
		category: timelineGoalCategoryEnum("category").notNull().default("other"),
		targetValue: pg.integer("target_value"),
		currentValue: pg.integer("current_value"),
		completed: pg.boolean("completed").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.category),
		pg.index().on(t.userId, t.completed),
		pg.index().on(t.userId, t.targetDate),
	],
);

// ============================================
// GAP ANALYSIS TABLES
// ============================================

// Skill category enum
export const gapAnalysisSkillCategoryEnum = pg.pgEnum("gap_analysis_skill_category", [
	"technical",
	"soft",
	"languages",
	"certifications",
	"tools",
]);

// TypeScript types for gap analysis
export type GapAnalysisSkillCategory = "technical" | "soft" | "languages" | "certifications" | "tools";

// Current skill type stored in JSONB
export type GapAnalysisCurrentSkill = {
	id: string;
	name: string;
	nameFr: string;
	category: GapAnalysisSkillCategory;
	currentLevel: number;
	yearsExperience: number;
	lastUsed: string;
	notes: string;
	createdAt: string;
	updatedAt: string;
};

// Progress record type stored in JSONB
export type GapAnalysisProgressRecord = {
	skillId: string;
	skillName: string;
	date: string;
	previousLevel: number;
	newLevel: number;
	notes: string;
};

// Export history entry type
export type GapAnalysisExportHistory = {
	date: string;
	format: string;
};

// Gap analysis data table
export const gapAnalysis = pg.pgTable(
	"gap_analysis",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		currentSkills: pg.jsonb("current_skills").notNull().$type<GapAnalysisCurrentSkill[]>().default([]),
		selectedRoleId: pg.text("selected_role_id"),
		progressRecords: pg.jsonb("progress_records").notNull().$type<GapAnalysisProgressRecord[]>().default([]),
		weeklyGoalHours: pg.integer("weekly_goal_hours").notNull().default(10),
		lastAnalysisDate: pg.timestamp("last_analysis_date", { withTimezone: true }).notNull().defaultNow(),
		exportHistory: pg.jsonb("export_history").notNull().$type<GapAnalysisExportHistory[]>().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================
// OUTFIT CHECKLIST TABLES
// ============================================

// Outfit checklist item table - stores user's checked items for interview outfit preparation
export const outfitChecklistItem = pg.pgTable(
	"outfit_checklist_item",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		itemId: pg.text("item_id").notNull(), // References the static checklist item ID (e.g., "outfit-1", "outfit-2")
		isChecked: pg.boolean("is_checked").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.unique().on(t.userId, t.itemId), pg.index().on(t.userId)],
);

// ============================================
// QUICK INTERVIEW CHECKLIST TABLES
// ============================================

// Quick checklist state table - stores which static items are checked and reminder
export const quickInterviewChecklist = pg.pgTable(
	"quick_interview_checklist",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		checkedItems: pg.text("checked_items").array().notNull().default([]),
		reminderDate: pg.date("reminder_date"),
		reminderTime: pg.text("reminder_time"),
		reminderCompany: pg.text("reminder_company"),
		reminderNotificationScheduled: pg.boolean("reminder_notification_scheduled").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================
// PERSONAL BRANDING TABLES
// ============================================

// Personal branding data table - stores all branding elements
export const personalBranding = pg.pgTable(
	"personal_branding",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		// Brand Statement Data
		profession: pg.text("profession").notNull().default(""),
		targetAudience: pg.text("target_audience").notNull().default(""),
		uniqueStrength: pg.text("unique_strength").notNull().default(""),
		valueProvided: pg.text("value_provided").notNull().default(""),
		personality: pg.text("personality").notNull().default(""),
		generatedStatement: pg.text("generated_statement").notNull().default(""),
		// UVP Data
		uvpProblem: pg.text("uvp_problem").notNull().default(""),
		uvpSolution: pg.text("uvp_solution").notNull().default(""),
		uvpBenefit: pg.text("uvp_benefit").notNull().default(""),
		uvpDifferentiator: pg.text("uvp_differentiator").notNull().default(""),
		// Visual Identity
		selectedLogo: pg.text("selected_logo"),
		selectedPalette: pg.text("selected_palette"),
		// Voice & Tone
		selectedVoice: pg.text("selected_voice"),
		// Checklists
		socialCheckedItems: pg.text("social_checked_items").array().notNull().default([]),
		websiteCheckedItems: pg.text("website_checked_items").array().notNull().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================
// USER SKILLS TRACKING TABLES
// ============================================

// User skill category enum
export const userSkillCategoryEnum = pg.pgEnum("user_skill_category", [
	"technical",
	"soft",
	"languages",
	"certifications",
]);

// TypeScript types for user skills
export type UserSkillCategory = "technical" | "soft" | "languages" | "certifications";

// Progress entry type stored in JSONB
export type SkillProgressEntry = {
	date: string;
	rating: number;
};

// User skill table
export const userSkill = pg.pgTable(
	"user_skill",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		nameFr: pg.text("name_fr").notNull(),
		category: userSkillCategoryEnum("category").notNull(),
		rating: pg.integer("rating").notNull().default(1), // 1-5
		targetRating: pg.integer("target_rating").notNull().default(5), // 1-5
		progress: pg.jsonb("progress").notNull().$type<SkillProgressEntry[]>().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.category), pg.index().on(t.userId, t.updatedAt.desc())],
);

// User skills data table (for selected career path)
export const userSkillsData = pg.pgTable(
	"user_skills_data",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		selectedCareerPath: pg.text("selected_career_path"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================
// INTERVIEW TIP FAVORITES TABLE
// ============================================

// Interview tip favorite table - stores user's favorite interview tips
export const interviewTipFavorite = pg.pgTable(
	"interview_tip_favorite",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		tipId: pg.text("tip_id").notNull(), // The ID of the tip (e.g., "prep-1", "during-2", etc.)
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.unique().on(t.userId, t.tipId), pg.index().on(t.userId)],
);

// ============================================
// QUESTION BANK FAVORITES TABLE
// ============================================

// Question bank favorite table - stores user's favorite interview questions from the question bank
export const questionBankFavorite = pg.pgTable(
	"question_bank_favorite",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		questionId: pg.text("question_id").notNull(), // The ID of the question (e.g., "beh-1", "tech-2", etc.)
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.unique().on(t.userId, t.questionId), pg.index().on(t.userId)],
);

// ============================================
// CONFIDENCE EXERCISES TABLES
// ============================================

// Exercise category enum
export const confidenceExerciseCategoryEnum = pg.pgEnum("confidence_exercise_category", [
	"breathing",
	"affirmations",
	"power_poses",
	"visualization",
	"anxiety_management",
]);

// TypeScript types for confidence exercises
export type ConfidenceExerciseCategory =
	| "breathing"
	| "affirmations"
	| "power_poses"
	| "visualization"
	| "anxiety_management";

// Completed exercise record
export const confidenceCompletedExercise = pg.pgTable(
	"confidence_completed_exercise",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		exerciseId: pg.text("exercise_id").notNull(),
		completedDate: pg.date("completed_date").notNull(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.unique().on(t.userId, t.exerciseId, t.completedDate),
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.completedDate),
	],
);

// Daily routine item
export const confidenceDailyRoutineItem = pg.pgTable(
	"confidence_daily_routine_item",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		exerciseId: pg.text("exercise_id").notNull(),
		scheduledTime: pg.text("scheduled_time"),
		order: pg.integer("order").notNull().default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.unique().on(t.userId, t.exerciseId), pg.index().on(t.userId), pg.index().on(t.userId, t.order)],
);

// Exercise statistics
export const confidenceExerciseStats = pg.pgTable(
	"confidence_exercise_stats",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		totalCompleted: pg.integer("total_completed").notNull().default(0),
		streak: pg.integer("streak").notNull().default(0),
		lastCompletedDate: pg.date("last_completed_date"),
		categoryProgress: pg
			.jsonb("category_progress")
			.notNull()
			.$type<Record<ConfidenceExerciseCategory, number>>()
			.default({
				breathing: 0,
				affirmations: 0,
				power_poses: 0,
				visualization: 0,
				anxiety_management: 0,
			}),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================
// MOCK AI INTERVIEW TABLES
// ============================================

// Practice interview (mock AI) field enum
export const mockAiFieldEnum = pg.pgEnum("mock_ai_field", ["healthcare", "industrial", "hse"]);

// Practice interview (mock AI) difficulty enum
export const mockAiDifficultyEnum = pg.pgEnum("mock_ai_difficulty", ["debutant", "intermediaire", "avance"]);

// TypeScript types for practice (mock AI) interviews
export type MockAiField = "healthcare" | "industrial" | "hse";
export type MockAiDifficulty = "debutant" | "intermediaire" | "avance";

// Message feedback type stored in JSONB
export type MockAiMessageFeedback = {
	score: number;
	strengths: string[];
	improvements: string[];
	tip?: string;
};

// Message type stored in JSONB
export type MockAiMessage = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: string;
	feedback?: MockAiMessageFeedback;
};

// Practice interview (mock AI) session table
export const mockAiSession = pg.pgTable(
	"mock_ai_session",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		field: mockAiFieldEnum("field").notNull(),
		program: pg.text("program").notNull(),
		difficulty: mockAiDifficultyEnum("difficulty").notNull(),
		messages: pg.jsonb("messages").notNull().$type<MockAiMessage[]>().default([]),
		currentQuestionIndex: pg.integer("current_question_index").notNull().default(0),
		totalQuestions: pg.integer("total_questions").notNull(),
		scores: pg.jsonb("scores").notNull().$type<number[]>().default([]),
		overallScore: pg.integer("overall_score"),
		startedAt: pg.timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.completedAt.desc()),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// ============================================
// INTERVIEW NOTES TABLES
// ============================================

// Interview note type enum
export const interviewNoteTypeEnum = pg.pgEnum("interview_note_type", [
	"phone",
	"video",
	"in_person",
	"technical",
	"panel",
]);

// Interview note status enum
export const interviewNoteStatusEnum = pg.pgEnum("interview_note_status", ["scheduled", "completed", "cancelled"]);

// Interview note overall impression enum
export const interviewNoteImpressionEnum = pg.pgEnum("interview_note_impression", ["positive", "neutral", "negative"]);

// Follow-up action priority enum
export const followUpPriorityEnum = pg.pgEnum("follow_up_priority", ["high", "medium", "low"]);

// TypeScript types for interview notes
export type InterviewNoteType = "phone" | "video" | "in_person" | "technical" | "panel";
export type InterviewNoteStatus = "scheduled" | "completed" | "cancelled";
export type InterviewNoteImpression = "positive" | "neutral" | "negative";
export type FollowUpPriority = "high" | "medium" | "low";

// Key point type stored in JSONB
export type InterviewNoteKeyPoint = {
	id: string;
	text: string;
	checked: boolean;
};

// Follow-up action type stored in JSONB
export type InterviewNoteFollowUpAction = {
	id: string;
	text: string;
	dueDate?: string;
	completed: boolean;
	priority: FollowUpPriority;
};

// Question response type stored in JSONB
export type InterviewNoteQuestionResponse = {
	id: string;
	timestamp: string;
	question: string;
	response: string;
	rating?: number;
	notes?: string;
};

// Interviewer info type stored in JSONB
export type InterviewNoteInterviewerInfo = {
	name: string;
	title: string;
	email?: string;
	phone?: string;
	linkedIn?: string;
	notes?: string;
};

// Interview note table
export const interviewNote = pg.pgTable(
	"interview_note",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		applicationId: pg.uuid("application_id").references(() => jobApplication.id, { onDelete: "set null" }),
		title: pg.text("title").notNull(),
		company: pg.text("company").notNull(),
		position: pg.text("position").notNull(),
		date: pg.date("date").notNull(),
		startTime: pg.text("start_time").notNull(),
		endTime: pg.text("end_time"),
		location: pg.text("location"),
		type: interviewNoteTypeEnum("type").notNull().default("in_person"),
		status: interviewNoteStatusEnum("status").notNull().default("scheduled"),
		interviewers: pg.jsonb("interviewers").notNull().$type<InterviewNoteInterviewerInfo[]>().default([]),
		keyPoints: pg.jsonb("key_points").notNull().$type<InterviewNoteKeyPoint[]>().default([]),
		followUpActions: pg.jsonb("follow_up_actions").notNull().$type<InterviewNoteFollowUpAction[]>().default([]),
		questionResponses: pg.jsonb("question_responses").notNull().$type<InterviewNoteQuestionResponse[]>().default([]),
		generalNotes: pg.text("general_notes").notNull().default(""),
		tags: pg.text("tags").array().notNull().default([]),
		overallImpression: interviewNoteImpressionEnum("overall_impression"),
		nextSteps: pg.text("next_steps"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.company),
		pg.index().on(t.userId, t.date.desc()),
		pg.index().on(t.applicationId),
	],
);

// ============================================
// INTERVIEW FEEDBACK TRACKING TABLES
// ============================================

// Feedback category enum
export const feedbackCategoryEnum = pg.pgEnum("feedback_category", [
	"technical",
	"behavioral",
	"communication",
	"problem_solving",
	"leadership",
	"cultural_fit",
]);

// Feedback type enum
export const feedbackTypeEnum = pg.pgEnum("feedback_type", ["strength", "improvement"]);

// Feedback priority enum
export const feedbackPriorityEnum = pg.pgEnum("feedback_priority", ["high", "medium", "low"]);

// Goal status enum for interview feedback goals
export const interviewGoalStatusEnum = pg.pgEnum("interview_goal_status", ["not_started", "in_progress", "completed"]);

// Pattern type enum
export const patternTypeEnum = pg.pgEnum("pattern_type", [
	"recurring_strength",
	"recurring_weakness",
	"improvement_trend",
	"decline_trend",
]);

// TypeScript types for interview feedback
export type FeedbackCategory =
	| "technical"
	| "behavioral"
	| "communication"
	| "problem_solving"
	| "leadership"
	| "cultural_fit";
export type FeedbackType = "strength" | "improvement";
export type FeedbackPriority = "high" | "medium" | "low";
export type InterviewGoalStatus = "not_started" | "in_progress" | "completed";
export type InterviewGoalPrepStatus = "not_started" | "preparing" | "practicing" | "ready" | "completed";
export type PatternType = "recurring_strength" | "recurring_weakness" | "improvement_trend" | "decline_trend";

// Goal milestone type stored in JSONB
export type InterviewFeedbackGoalMilestone = {
	title: string;
	completed: boolean;
};

// Trend data point type stored in JSONB
export type InterviewFeedbackTrendDataPoint = {
	date: string;
	technical: number;
	behavioral: number;
	communication: number;
	problem_solving: number;
	leadership: number;
	cultural_fit: number;
	overall: number;
};

// Interview feedback item table
export const interviewFeedbackItem = pg.pgTable(
	"interview_feedback_item",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		sessionId: pg.uuid("session_id").references(() => interviewSession.id, { onDelete: "set null" }),
		sessionTitle: pg.text("session_title"),
		date: pg.date("date").notNull(),
		category: feedbackCategoryEnum("category").notNull(),
		type: feedbackTypeEnum("type").notNull(),
		content: pg.text("content").notNull(),
		source: pg.text("source").notNull(), // Interviewer name or "AI Feedback"
		actionItems: pg.text("action_items").array().notNull().default([]),
		isResolved: pg.boolean("is_resolved").notNull().default(false),
		priority: feedbackPriorityEnum("priority").notNull().default("medium"),
		tags: pg.text("tags").array().notNull().default([]),
		notes: pg.text("notes"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.category),
		pg.index().on(t.userId, t.type),
		pg.index().on(t.userId, t.isResolved),
		pg.index().on(t.userId, t.date.desc()),
		pg.index().on(t.sessionId),
	],
);

// Interview feedback goal table
export const interviewFeedbackGoal = pg.pgTable(
	"interview_feedback_goal",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		description: pg.text("description").notNull(),
		category: feedbackCategoryEnum("category").notNull(),
		targetDate: pg.date("target_date").notNull(),
		progress: pg.integer("progress").notNull().default(0), // 0-100
		status: interviewGoalStatusEnum("status").notNull().default("not_started"),
		relatedFeedbackIds: pg.text("related_feedback_ids").array().notNull().default([]),
		milestones: pg.jsonb("milestones").notNull().$type<InterviewFeedbackGoalMilestone[]>().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.category),
		pg.index().on(t.userId, t.targetDate),
	],
);

// Interview feedback trend data table (stores periodic snapshots)
export const interviewFeedbackTrend = pg.pgTable(
	"interview_feedback_trend",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		date: pg.date("date").notNull(),
		technical: pg.integer("technical").notNull().default(0),
		behavioral: pg.integer("behavioral").notNull().default(0),
		communication: pg.integer("communication").notNull().default(0),
		problemSolving: pg.integer("problem_solving").notNull().default(0),
		leadership: pg.integer("leadership").notNull().default(0),
		culturalFit: pg.integer("cultural_fit").notNull().default(0),
		overall: pg.integer("overall").notNull().default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.unique().on(t.userId, t.date), pg.index().on(t.userId), pg.index().on(t.userId, t.date.desc())],
);

// Interview feedback pattern table (AI-detected patterns)
export const interviewFeedbackPattern = pg.pgTable(
	"interview_feedback_pattern",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: patternTypeEnum("type").notNull(),
		category: feedbackCategoryEnum("category").notNull(),
		description: pg.text("description").notNull(),
		frequency: pg.integer("frequency").notNull().default(1),
		confidence: pg.integer("confidence").notNull().default(50), // 0-100
		recommendations: pg.text("recommendations").array().notNull().default([]),
		relatedFeedbackIds: pg.text("related_feedback_ids").array().notNull().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.type), pg.index().on(t.userId, t.category)],
);

// ============================================
// REMOTE READINESS TABLES
// ============================================

// Remote readiness skill category enum
export const remoteReadinessCategoryEnum = pg.pgEnum("remote_readiness_category", [
	"communication",
	"time_management",
	"tech_proficiency",
	"self_discipline",
	"home_office",
]);

// Remote readiness level enum
export const remoteReadinessLevelEnum = pg.pgEnum("remote_readiness_level", [
	"beginner",
	"developing",
	"competent",
	"proficient",
	"expert",
]);

// TypeScript types for remote readiness
export type RemoteReadinessCategory =
	| "communication"
	| "time_management"
	| "tech_proficiency"
	| "self_discipline"
	| "home_office";

export type RemoteReadinessLevel = "beginner" | "developing" | "competent" | "proficient" | "expert";

// Category scores type for storing per-category results
export type RemoteReadinessCategoryScores = Record<
	RemoteReadinessCategory,
	{ score: number; maxScore: number; percentage: number }
>;

// Remote readiness quiz result table
export const remoteReadinessResult = pg.pgTable(
	"remote_readiness_result",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		totalScore: pg.integer("total_score").notNull(),
		maxScore: pg.integer("max_score").notNull(),
		percentage: pg.integer("percentage").notNull(), // 0-100
		level: remoteReadinessLevelEnum("level").notNull(),
		categoryScores: pg.jsonb("category_scores").notNull().$type<RemoteReadinessCategoryScores>(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.createdAt.desc())],
);

// Remote readiness checklist table (per-user state)
export const remoteReadinessChecklist = pg.pgTable(
	"remote_readiness_checklist",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.unique()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		checkedItems: pg.text("checked_items").array().notNull().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// Remote readiness home office items table (per-user state)
export const remoteReadinessOffice = pg.pgTable(
	"remote_readiness_office",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.unique()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		checkedItems: pg.text("checked_items").array().notNull().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// Remote readiness improvement tasks table
export const remoteReadinessImprovement = pg.pgTable(
	"remote_readiness_improvement",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		category: remoteReadinessCategoryEnum("category").notNull(),
		title: pg.text("title").notNull(),
		description: pg.text("description").notNull(),
		completed: pg.boolean("completed").notNull().default(false),
		priority: pg.text("priority").notNull().default("medium"), // high, medium, low
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.completed)],
);

// ============================================
// JOB MATCH CALCULATOR TABLES
// ============================================

// TypeScript types for job match data stored in JSONB

// Keyword match result type
export type JobMatchKeywordResult = {
	score: number;
	matched: string[];
	missing: string[];
	partial: string[];
};

// Skill match type
export type JobMatchSkillMatch = {
	skill: string;
	resumeLevel: number;
	requiredLevel: "basic" | "intermediate" | "advanced" | "expert";
	match: "exact" | "above" | "below";
};

// Skills alignment result type
export type JobMatchSkillsResult = {
	score: number;
	matched: JobMatchSkillMatch[];
	missing: string[];
	additional: string[];
};

// Experience comparison result type
export type JobMatchExperienceResult = {
	score: number;
	requiredYears: number;
	candidateYears: number;
	relevantExperience: string[];
	gaps: string[];
};

// Suggestion type
export type JobMatchSuggestion = {
	id: string;
	category: "keyword" | "skill" | "experience" | "content";
	priority: "high" | "medium" | "low";
	title: string;
	description: string;
	actionable: boolean;
};

// Full match result type stored in JSONB
export type JobMatchResult = {
	overallScore: number;
	keywordMatch: JobMatchKeywordResult;
	skillsAlignment: JobMatchSkillsResult;
	experienceComparison: JobMatchExperienceResult;
	missingRequirements: string[];
	suggestions: JobMatchSuggestion[];
	analyzedAt: string;
};

// Saved job description table
export const savedJobDescription = pg.pgTable(
	"saved_job_description",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		company: pg.text("company").notNull(),
		description: pg.text("description").notNull(),
		lastScore: pg.integer("last_score"),
		lastAnalyzedAt: pg.timestamp("last_analyzed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.createdAt.desc())],
);

// Job match analysis history table
export const jobMatchAnalysis = pg.pgTable(
	"job_match_analysis",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		savedJobId: pg.uuid("saved_job_id").references(() => savedJobDescription.id, { onDelete: "set null" }),
		resumeId: pg
			.uuid("resume_id")
			.notNull()
			.references(() => resume.id, { onDelete: "cascade" }),
		resumeName: pg.text("resume_name").notNull(),
		jobTitle: pg.text("job_title").notNull(),
		company: pg.text("company").notNull(),
		jobDescription: pg.text("job_description").notNull(),
		score: pg.integer("score").notNull(),
		result: pg.jsonb("result").notNull().$type<JobMatchResult>(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.resumeId),
		pg.index().on(t.savedJobId),
	],
);

// ============================================
// INTERVIEW RECORDING REVIEW TABLES
// ============================================

// Recording status enum
export const recordingStatusEnum = pg.pgEnum("recording_status", ["pending", "processing", "analyzed", "failed"]);

// Body language tip category enum
export const bodyLanguageCategoryEnum = pg.pgEnum("body_language_category", [
	"posture",
	"eye_contact",
	"gestures",
	"facial",
	"movement",
]);

// Body language tip severity enum
export const bodyLanguageSeverityEnum = pg.pgEnum("body_language_severity", ["minor", "moderate", "major"]);

// TypeScript types for interview recording
export type RecordingStatus = "pending" | "processing" | "analyzed" | "failed";
export type BodyLanguageCategory = "posture" | "eye_contact" | "gestures" | "facial" | "movement";
export type BodyLanguageSeverity = "minor" | "moderate" | "major";

// Filler word type stored in JSONB
export type RecordingFillerWord = {
	word: string;
	count: number;
	timestamps: number[];
};

// Answer structure type stored in JSONB
export type RecordingAnswerStructure = {
	hasIntro: boolean;
	hasBody: boolean;
	hasConclusion: boolean;
	usesSTAR: boolean;
};

// Answer segment type stored in JSONB
export type RecordingAnswerSegment = {
	id: string;
	question: string;
	startTime: number;
	endTime: number;
	transcript: string;
	score: number;
	feedback: string[];
	idealAnswer?: string;
	fillerWords: RecordingFillerWord[];
	speakingPace: number;
	clarity: number;
	structure: RecordingAnswerStructure;
};

// Body language tip type stored in JSONB
export type RecordingBodyLanguageTip = {
	id: string;
	category: BodyLanguageCategory;
	issue: string;
	suggestion: string;
	timestamp?: number;
	severity: BodyLanguageSeverity;
};

// Interview recording table
export const interviewRecording = pg.pgTable(
	"interview_recording",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		date: pg.date("date").notNull(),
		duration: pg.integer("duration").notNull(), // seconds
		status: recordingStatusEnum("status").notNull().default("pending"),
		thumbnailUrl: pg.text("thumbnail_url"),
		videoUrl: pg.text("video_url"),
		field: interviewFieldEnum("field").notNull().default("general"),
		program: imtaProgramEnum("program"),
		overallScore: pg.integer("overall_score").notNull().default(0),
		speakingPaceScore: pg.integer("speaking_pace_score").notNull().default(0),
		clarityScore: pg.integer("clarity_score").notNull().default(0),
		contentQualityScore: pg.integer("content_quality_score").notNull().default(0),
		bodyLanguageScore: pg.integer("body_language_score").notNull().default(0),
		answerStructureScore: pg.integer("answer_structure_score").notNull().default(0),
		fillerWordCount: pg.integer("filler_word_count").notNull().default(0),
		segments: pg.jsonb("segments").notNull().$type<RecordingAnswerSegment[]>().default([]),
		bodyLanguageTips: pg.jsonb("body_language_tips").notNull().$type<RecordingBodyLanguageTip[]>().default([]),
		improvementSuggestions: pg.text("improvement_suggestions").array().notNull().default([]),
		strengths: pg.text("strengths").array().notNull().default([]),
		areasToImprove: pg.text("areas_to_improve").array().notNull().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.field),
		pg.index().on(t.userId, t.date.desc()),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// Interview recording progress tracking table (for progress chart)
export const interviewRecordingProgress = pg.pgTable(
	"interview_recording_progress",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		date: pg.date("date").notNull(),
		overallScore: pg.integer("overall_score").notNull().default(0),
		speakingPace: pg.integer("speaking_pace").notNull().default(0),
		clarity: pg.integer("clarity").notNull().default(0),
		contentQuality: pg.integer("content_quality").notNull().default(0),
		bodyLanguage: pg.integer("body_language").notNull().default(0),
		fillerWords: pg.integer("filler_words").notNull().default(0), // Inverted score (lower is better)
		recordingId: pg.uuid("recording_id").references(() => interviewRecording.id, { onDelete: "set null" }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.unique().on(t.userId, t.date),
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.date.desc()),
		pg.index().on(t.recordingId),
	],
);

// ============================================
// CULTURE MATCH ASSESSMENT TABLES
// ============================================

// TypeScript types for culture match data stored in JSONB

// Personal culture profile type
export type CultureMatchPersonalProfile = {
	workLifeBalance: number;
	innovation: number;
	collaboration: number;
	growth: number;
	diversity: number;
	transparency: number;
};

// Default personal profile
export const defaultCultureMatchProfile: CultureMatchPersonalProfile = {
	workLifeBalance: 50,
	innovation: 50,
	collaboration: 50,
	growth: 50,
	diversity: 50,
	transparency: 50,
};

// Culture match assessment table - stores user's assessment progress and results
export const cultureMatchAssessment = pg.pgTable(
	"culture_match_assessment",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		workStyleAnswers: pg.jsonb("work_style_answers").notNull().$type<Record<string, string>>().default({}),
		valuesScores: pg.jsonb("values_scores").notNull().$type<Record<string, number>>().default({}),
		redFlagsChecked: pg.text("red_flags_checked").array().notNull().default([]),
		personalProfile: pg.jsonb("personal_profile").$type<CultureMatchPersonalProfile>(),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================
// AI WRITER TABLES
// ============================================

// AI Writer content type enum
export const aiWriterContentTypeEnum = pg.pgEnum("ai_writer_content_type", [
	"bullet_point",
	"summary",
	"achievement",
	"cover_letter",
	"linkedin_summary",
	"skill_extraction",
]);

// AI Content Source enum - tracks which AI feature generated the content
export const aiContentSourceEnum = pg.pgEnum("ai_content_source", [
	// AI Writer sources (existing functionality)
	"ai_writer_bullet_point",
	"ai_writer_summary",
	"ai_writer_achievement",
	"ai_writer_cover_letter",
	"ai_writer_linkedin_summary",
	"ai_writer_skill_extraction",
	// Resume AI sources (from router/ai.ts)
	"improve_content",
	"generate_summary",
	"fix_grammar",
	"suggest_skills",
	"generate_headline",
	"analyze_resume",
	"parse_pdf",
	"parse_docx",
	// Interview AI sources
	"interview_questions",
	"interview_evaluation",
	"interview_chat",
	"interview_analysis",
	// Career matcher AI sources
	"career_prediction",
	"job_match",
	"career_trajectory",
	"transferable_skills",
	"success_factors",
	// AI Mentor sources
	"ai_mentor_chat",
	// Learning path AI sources
	"learning_path_generate",
	"learning_path_recommend",
	// Voice interview AI sources
	"voice_interview",
	// Adaptive quiz AI sources
	"adaptive_quiz",
	// Interview coaching AI sources
	"interview_coach",
	"interview_improve",
	// Resume wizard AI sources
	"resume_gap_analysis",
	"resume_adapt_job",
	"resume_wizard_chat",
	"generate_resume",
	"apply_gap_fixes",
]);

export type AiContentSource = (typeof aiContentSourceEnum.enumValues)[number];

// AI Writer tone enum
export const aiWriterToneEnum = pg.pgEnum("ai_writer_tone", [
	"professional",
	"confident",
	"friendly",
	"executive",
	"creative",
]);

// AI Writer industry enum
export const aiWriterIndustryEnum = pg.pgEnum("ai_writer_industry", [
	"technology",
	"healthcare",
	"finance",
	"marketing",
	"engineering",
	"education",
	"general",
]);

// TypeScript types for AI Writer
export type AiWriterContentType =
	| "bullet_point"
	| "summary"
	| "achievement"
	| "cover_letter"
	| "linkedin_summary"
	| "skill_extraction";
export type AiWriterTone = "professional" | "confident" | "friendly" | "executive" | "creative";
export type AiWriterIndustry =
	| "technology"
	| "healthcare"
	| "finance"
	| "marketing"
	| "engineering"
	| "education"
	| "general";

// Bullet point type stored in JSONB
export type AiWriterBulletPoint = {
	id: string;
	original: string;
	enhanced: string;
	metrics?: string;
};

// Skill extraction type stored in JSONB
export type AiWriterSkillExtraction = {
	hardSkills: string[];
	softSkills: string[];
	certifications: string[];
	tools: string[];
};

// Grammar issue type stored in JSONB
export type AiWriterGrammarIssue = {
	text: string;
	suggestion: string;
	type: "grammar" | "clarity" | "style" | "spelling";
	position: number;
};

// AI Writer saved content table (extended for all AI history)
export const aiWriterContent = pg.pgTable(
	"ai_writer_content",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: aiWriterContentTypeEnum("type"),
		name: pg.text("name").notNull(),
		originalInput: pg.text("original_input"),
		generatedContent: pg.text("generated_content"),
		tone: aiWriterToneEnum("tone"),
		industry: aiWriterIndustryEnum("industry"),
		experienceYears: pg.integer("experience_years"),
		bulletPoints: pg.jsonb("bullet_points").$type<AiWriterBulletPoint[]>(),
		skillExtraction: pg.jsonb("skill_extraction").$type<AiWriterSkillExtraction>(),
		grammarIssues: pg.jsonb("grammar_issues").$type<AiWriterGrammarIssue[]>(),
		jobTitle: pg.text("job_title"),
		companyName: pg.text("company_name"),
		linkedinKeywords: pg.text("linkedin_keywords").array(),
		isFavorite: pg.boolean("is_favorite").notNull().default(false),
		tags: pg.text("tags").array().notNull().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
		// NEW: AI History extension columns
		resumeId: pg.uuid("resume_id").references(() => resume.id, { onDelete: "set null" }),
		contentSource: aiContentSourceEnum("content_source"),
		inputData: pg.jsonb("input_data").$type<Record<string, unknown>>(),
		outputData: pg.jsonb("output_data").$type<Record<string, unknown>>(),
		appliedAt: pg.timestamp("applied_at", { withTimezone: true }),
		expiresAt: pg.timestamp("expires_at", { withTimezone: true }).$defaultFn(() => {
			const date = new Date();
			date.setDate(date.getDate() + 90);
			return date;
		}),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.type),
		pg.index().on(t.userId, t.isFavorite),
		pg.index().on(t.userId, t.createdAt.desc()),
		// NEW: Indexes for AI history
		pg
			.index()
			.on(t.resumeId),
		pg.index().on(t.contentSource),
		pg.index().on(t.expiresAt),
	],
);

// AI Writer Content type export
export type AiWriterContentItem = typeof aiWriterContent.$inferSelect;

// ============================================
// LINKEDIN PROFILE OPTIMIZER TABLES
// ============================================

// LinkedIn industry enum
export const linkedinIndustryEnum = pg.pgEnum("linkedin_industry", [
	"technology",
	"finance",
	"healthcare",
	"marketing",
	"engineering",
	"education",
	"consulting",
	"general",
]);

// TypeScript type for LinkedIn industry
export type LinkedInIndustry =
	| "technology"
	| "finance"
	| "healthcare"
	| "marketing"
	| "engineering"
	| "education"
	| "consulting"
	| "general";

// TypeScript types for JSON columns
export type LinkedInPhotoTip = {
	id: string;
	title: string;
	description: string;
	iconName: string;
	checked: boolean;
};

export type LinkedInChecklistItem = {
	id: string;
	category: string;
	item: string;
	completed: boolean;
	priority: "high" | "medium" | "low";
};

export type LinkedInHeadlineSuggestion = {
	id: string;
	headline: string;
	keywords: string[];
	tone: "professional" | "creative" | "executive";
};

export type LinkedInSummarySuggestion = {
	id: string;
	summary: string;
	wordCount: number;
	keywords: string[];
};

// LinkedIn profile optimizer table
export const linkedinProfile = pg.pgTable(
	"linkedin_profile",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		industry: linkedinIndustryEnum("industry").notNull().default("general"),
		currentRole: pg.text("current_role").default(""),
		currentHeadline: pg.text("current_headline").default(""),
		currentSummary: pg.text("current_summary").default(""),
		yearsExperience: pg.integer("years_experience").notNull().default(5),
		hasProfilePhoto: pg.boolean("has_profile_photo").notNull().default(true),
		skillsCount: pg.integer("skills_count").notNull().default(10),
		experienceCount: pg.integer("experience_count").notNull().default(3),
		connectionsCount: pg.integer("connections_count").notNull().default(200),
		photoTips: pg.jsonb("photo_tips").notNull().$type<LinkedInPhotoTip[]>().default([]),
		checklist: pg.jsonb("checklist").notNull().$type<LinkedInChecklistItem[]>().default([]),
		headlineSuggestions: pg.jsonb("headline_suggestions").notNull().$type<LinkedInHeadlineSuggestion[]>().default([]),
		summarySuggestions: pg.jsonb("summary_suggestions").notNull().$type<LinkedInSummarySuggestion[]>().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================
// THANK YOU LETTER TABLES
// ============================================

// Thank you letter template style enum
export const thankYouTemplateStyleEnum = pg.pgEnum("thank_you_template_style", ["formal", "warm", "enthusiastic"]);

// Thank you letter interview type enum
export const thankYouInterviewTypeEnum = pg.pgEnum("thank_you_interview_type", [
	"phone",
	"video",
	"inperson",
	"panel",
	"technical",
]);

// Thank you letter send method enum
export const thankYouSendMethodEnum = pg.pgEnum("thank_you_send_method", ["email", "physical", "linkedin"]);

// Thank you letter suggestion category enum
export const thankYouSuggestionCategoryEnum = pg.pgEnum("thank_you_suggestion_category", [
	"opening",
	"body",
	"closing",
	"personalization",
]);

// TypeScript types for thank you letters
export type ThankYouTemplateStyle = "formal" | "warm" | "enthusiastic";
export type ThankYouInterviewType = "phone" | "video" | "inperson" | "panel" | "technical";
export type ThankYouSendMethod = "email" | "physical" | "linkedin";
export type ThankYouSuggestionCategory = "opening" | "body" | "closing" | "personalization";

// Thank you letter table
export const thankYouLetter = pg.pgTable(
	"thank_you_letter",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		recipientName: pg.text("recipient_name").notNull(),
		recipientCompany: pg.text("recipient_company").notNull(),
		recipientPosition: pg.text("recipient_position"),
		recipientEmail: pg.text("recipient_email"),
		interviewDate: pg.text("interview_date").notNull(), // stored as YYYY-MM-DD string
		interviewType: thankYouInterviewTypeEnum("interview_type").notNull().default("inperson"),
		discussionPoints: pg.text("discussion_points").array().notNull().default([]),
		jobPosition: pg.text("job_position").notNull(),
		template: thankYouTemplateStyleEnum("template").notNull().default("warm"),
		content: pg.text("content").notNull(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.userId, t.recipientCompany),
	],
);

// Thank you letter send tracking table
export const thankYouLetterSendTracking = pg.pgTable(
	"thank_you_letter_send_tracking",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		letterId: pg
			.uuid("letter_id")
			.notNull()
			.references(() => thankYouLetter.id, { onDelete: "cascade" }),
		sentDate: pg.text("sent_date").notNull(), // stored as YYYY-MM-DD string
		method: thankYouSendMethodEnum("method").notNull().default("email"),
		followUpDate: pg.text("follow_up_date"), // stored as YYYY-MM-DD string
		notes: pg.text("notes"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.letterId), pg.index().on(t.letterId, t.sentDate.desc())],
);

// Thank you letter AI suggestion table
export const thankYouLetterSuggestion = pg.pgTable(
	"thank_you_letter_suggestion",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		letterId: pg
			.uuid("letter_id")
			.notNull()
			.references(() => thankYouLetter.id, { onDelete: "cascade" }),
		category: thankYouSuggestionCategoryEnum("category").notNull(),
		text: pg.text("text").notNull(),
		applied: pg.boolean("applied").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.letterId), pg.index().on(t.letterId, t.category)],
);

// ============================================
// COMPANY RESEARCH TABLES
// ============================================

// Company research industry enum
export const companyIndustryEnum = pg.pgEnum("company_industry", [
	"healthcare",
	"industrial",
	"manufacturing",
	"mining",
	"automotive",
	"services",
	"energy",
	"tech",
]);

// TypeScript types for company research
export type CompanyIndustry =
	| "healthcare"
	| "industrial"
	| "manufacturing"
	| "mining"
	| "automotive"
	| "services"
	| "energy"
	| "tech";

// Culture insight type stored in JSONB
export type CompanyCultureInsight = {
	category: string;
	score: number;
	description: string;
};

// Company values type stored in JSONB
export type CompanyValue = {
	value: string;
	description: string;
};

// Employee review type stored in JSONB
export type CompanyEmployeeReview = {
	id: string;
	title: string;
	position: string;
	rating: number;
	date: string;
	pros: string;
	cons: string;
	advice: string;
	recommend: boolean;
	approveOfCEO: boolean;
};

// Interview question type stored in JSONB
export type CompanyInterviewQuestion = {
	id: string;
	question: string;
	category: "behavioral" | "technical" | "situational" | "general";
	difficulty: "easy" | "medium" | "hard";
	frequency: number;
};

// Interview tip type stored in JSONB
export type CompanyInterviewTip = {
	tip: string;
	category: string;
};

// Salary range type stored in JSONB
export type CompanySalaryRange = {
	role: string;
	minSalary: number;
	maxSalary: number;
	medianSalary: number;
	totalComp?: number;
	sampleSize: number;
};

// Benefit type stored in JSONB
export type CompanyBenefit = {
	category: string;
	items: string[];
	rating: number;
};

// News item type stored in JSONB
export type CompanyNewsItem = {
	id: string;
	title: string;
	summary: string;
	date: string;
	source: string;
	url?: string;
	type: "announcement" | "press" | "award" | "partnership" | "hiring";
};

// Key person type stored in JSONB
export type CompanyKeyPerson = {
	id: string;
	name: string;
	title: string;
	department: string;
	linkedIn?: string;
	bio?: string;
	yearsAtCompany: number;
};

// Company profile table
export const companyProfile = pg.pgTable(
	"company_profile",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		logo: pg.text("logo"),
		industry: companyIndustryEnum("industry").notNull(),
		description: pg.text("description").notNull(),
		mission: pg.text("mission").notNull(),
		vision: pg.text("vision").notNull(),
		location: pg.text("location").notNull(),
		headquarters: pg.text("headquarters").notNull(),
		employeeCount: pg.text("employee_count").notNull(),
		founded: pg.integer("founded").notNull(),
		website: pg.text("website"),
		linkedIn: pg.text("linkedin"),
		revenue: pg.text("revenue"),
		stockSymbol: pg.text("stock_symbol"),
		// Culture data
		cultureInsights: pg.jsonb("culture_insights").notNull().$type<CompanyCultureInsight[]>().default([]),
		cultureValues: pg.jsonb("culture_values").notNull().$type<CompanyValue[]>().default([]),
		cultureOverallScore: pg.integer("culture_overall_score").notNull().default(0),
		// Reviews data
		reviews: pg.jsonb("reviews").notNull().$type<CompanyEmployeeReview[]>().default([]),
		reviewsAverageRating: pg.real("reviews_average_rating").notNull().default(0),
		reviewsTotalCount: pg.integer("reviews_total_count").notNull().default(0),
		reviewsRecommendRate: pg.integer("reviews_recommend_rate").notNull().default(0),
		reviewsCeoApprovalRate: pg.integer("reviews_ceo_approval_rate").notNull().default(0),
		// Interview data
		interviewQuestions: pg.jsonb("interview_questions").notNull().$type<CompanyInterviewQuestion[]>().default([]),
		interviewTips: pg.jsonb("interview_tips").notNull().$type<CompanyInterviewTip[]>().default([]),
		interviewDifficulty: pg.real("interview_difficulty").notNull().default(0),
		interviewAverageDuration: pg.text("interview_average_duration"),
		interviewProcessSteps: pg.text("interview_process_steps").array().notNull().default([]),
		// Salary and benefits data
		salaries: pg.jsonb("salaries").notNull().$type<CompanySalaryRange[]>().default([]),
		benefits: pg.jsonb("benefits").notNull().$type<CompanyBenefit[]>().default([]),
		// News and key people
		news: pg.jsonb("news").notNull().$type<CompanyNewsItem[]>().default([]),
		keyPeople: pg.jsonb("key_people").notNull().$type<CompanyKeyPerson[]>().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.industry),
		pg.index().on(t.userId, t.name),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// Company research favorites table
export const companyFavorite = pg.pgTable(
	"company_favorite",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		companyId: pg
			.uuid("company_id")
			.notNull()
			.references(() => companyProfile.id, { onDelete: "cascade" }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.unique().on(t.userId, t.companyId), pg.index().on(t.userId)],
);

// ============================================
// INDUSTRY INSIGHTS TABLES
// ============================================

// Industry enum for insights
export const insightsIndustryEnum = pg.pgEnum("insights_industry", [
	"healthcare",
	"industrial",
	"hse",
	"tech",
	"automotive",
	"services",
]);

// Experience level enum
export const insightsExperienceLevelEnum = pg.pgEnum("insights_experience_level", [
	"entry",
	"mid",
	"senior",
	"executive",
]);

// Region enum for Morocco
export const insightsRegionEnum = pg.pgEnum("insights_region", [
	"casablanca",
	"rabat",
	"tanger",
	"marrakech",
	"fes",
	"agadir",
	"kenitra",
	"meknes",
]);

// Trend direction enum
export const insightsTrendEnum = pg.pgEnum("insights_trend", ["up", "down", "stable"]);

// Competition level enum
export const insightsCompetitionEnum = pg.pgEnum("insights_competition", ["low", "medium", "high"]);

// Skill hotness enum
export const insightsHotnessEnum = pg.pgEnum("insights_hotness", ["cold", "warm", "hot", "fire"]);

// Skill trend enum
export const insightsSkillTrendEnum = pg.pgEnum("insights_skill_trend", ["rising", "stable", "declining"]);

// Barrier to entry enum
export const insightsBarrierEnum = pg.pgEnum("insights_barrier", ["low", "medium", "high"]);

// TypeScript types for insights
export type InsightsIndustry = "healthcare" | "industrial" | "hse" | "tech" | "automotive" | "services";
export type InsightsExperienceLevel = "entry" | "mid" | "senior" | "executive";
export type InsightsRegion = "casablanca" | "rabat" | "tanger" | "marrakech" | "fes" | "agadir" | "kenitra" | "meknes";
export type InsightsTrend = "up" | "down" | "stable";
export type InsightsCompetition = "low" | "medium" | "high";
export type InsightsHotness = "cold" | "warm" | "hot" | "fire";
export type InsightsSkillTrend = "rising" | "stable" | "declining";
export type InsightsBarrier = "low" | "medium" | "high";

// Industry trend table
export const industryTrend = pg.pgTable(
	"industry_trend",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		industry: insightsIndustryEnum("industry").notNull(),
		currentDemand: pg.integer("current_demand").notNull().default(0),
		changePercent: pg.integer("change_percent").notNull().default(0),
		trend: insightsTrendEnum("trend").notNull().default("stable"),
		openPositions: pg.integer("open_positions").notNull().default(0),
		avgTimeToHire: pg.integer("avg_time_to_hire").notNull().default(0),
		competitionLevel: insightsCompetitionEnum("competition_level").notNull().default("medium"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.unique().on(t.industry), pg.index().on(t.industry)],
);

// Salary benchmark table
export const salaryBenchmark = pg.pgTable(
	"salary_benchmark",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		role: pg.text("role").notNull(),
		industry: insightsIndustryEnum("industry").notNull(),
		experienceLevel: insightsExperienceLevelEnum("experience_level").notNull(),
		region: insightsRegionEnum("region").notNull(),
		minSalary: pg.integer("min_salary").notNull().default(0),
		maxSalary: pg.integer("max_salary").notNull().default(0),
		medianSalary: pg.integer("median_salary").notNull().default(0),
		percentile25: pg.integer("percentile_25").notNull().default(0),
		percentile75: pg.integer("percentile_75").notNull().default(0),
		yearOverYearChange: pg.integer("year_over_year_change").notNull().default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.unique().on(t.role, t.industry, t.experienceLevel, t.region),
		pg.index().on(t.industry),
		pg.index().on(t.region),
		pg.index().on(t.experienceLevel),
		pg.index().on(t.industry, t.region, t.experienceLevel),
	],
);

// Job demand indicator table
export const jobDemandIndicator = pg.pgTable(
	"job_demand_indicator",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		skill: pg.text("skill").notNull(),
		industry: insightsIndustryEnum("industry").notNull(),
		demandScore: pg.integer("demand_score").notNull().default(0),
		growthRate: pg.integer("growth_rate").notNull().default(0),
		totalJobs: pg.integer("total_jobs").notNull().default(0),
		avgSalaryPremium: pg.integer("avg_salary_premium").notNull().default(0),
		hotness: insightsHotnessEnum("hotness").notNull().default("warm"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.unique().on(t.skill, t.industry), pg.index().on(t.industry), pg.index().on(t.hotness)],
);

// Skills heatmap data type
export type SkillsHeatmapIndustries = Record<InsightsIndustry, number>;

// Skills heatmap table
export const skillsHeatmap = pg.pgTable(
	"skills_heatmap",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		skill: pg.text("skill").notNull().unique(),
		industries: pg
			.jsonb("industries")
			.notNull()
			.$type<SkillsHeatmapIndustries>()
			.default({ healthcare: 0, industrial: 0, hse: 0, tech: 0, automotive: 0, services: 0 }),
		overallDemand: pg.integer("overall_demand").notNull().default(0),
		trend: insightsSkillTrendEnum("trend").notNull().default("stable"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.skill), pg.index().on(t.overallDemand.desc())],
);

// Company hiring trend table
export const companyHiringTrend = pg.pgTable(
	"company_hiring_trend",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		company: pg.text("company").notNull().unique(),
		industry: insightsIndustryEnum("industry").notNull(),
		openPositions: pg.integer("open_positions").notNull().default(0),
		hiringGrowth: pg.integer("hiring_growth").notNull().default(0),
		avgSalary: pg.integer("avg_salary").notNull().default(0),
		employeeCount: pg.text("employee_count").notNull(),
		hiringFreeze: pg.boolean("hiring_freeze").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.industry), pg.index().on(t.hiringGrowth.desc())],
);

// Remote work stats table
export const remoteWorkStat = pg.pgTable(
	"remote_work_stat",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		industry: insightsIndustryEnum("industry").notNull().unique(),
		fullyRemote: pg.integer("fully_remote").notNull().default(0),
		hybrid: pg.integer("hybrid").notNull().default(0),
		onsite: pg.integer("onsite").notNull().default(0),
		remoteGrowth: pg.integer("remote_growth").notNull().default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.industry)],
);

// Industry growth projection table
export const industryGrowthProjection = pg.pgTable(
	"industry_growth_projection",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		industry: insightsIndustryEnum("industry").notNull().unique(),
		currentSize: pg.integer("current_size").notNull().default(0),
		projectedSize: pg.integer("projected_size").notNull().default(0),
		growthRate: pg.integer("growth_rate").notNull().default(0),
		timeframe: pg.text("timeframe").notNull(),
		keyDrivers: pg.text("key_drivers").array().notNull().default([]),
		risks: pg.text("risks").array().notNull().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.industry), pg.index().on(t.growthRate.desc())],
);

// Competitive landscape table
export const competitiveLandscape = pg.pgTable(
	"competitive_landscape",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		industry: insightsIndustryEnum("industry").notNull().unique(),
		totalCompanies: pg.integer("total_companies").notNull().default(0),
		marketLeaders: pg.text("market_leaders").array().notNull().default([]),
		emergingPlayers: pg.text("emerging_players").array().notNull().default([]),
		avgCompanySize: pg.text("avg_company_size").notNull(),
		barrierToEntry: insightsBarrierEnum("barrier_to_entry").notNull().default("medium"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.industry)],
);

// Regional comparison table
export const regionalComparison = pg.pgTable(
	"regional_comparison",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		region: insightsRegionEnum("region").notNull().unique(),
		totalJobs: pg.integer("total_jobs").notNull().default(0),
		avgSalary: pg.integer("avg_salary").notNull().default(0),
		costOfLivingIndex: pg.integer("cost_of_living_index").notNull().default(0),
		qualityOfLifeScore: pg.integer("quality_of_life_score").notNull().default(0),
		jobGrowthRate: pg.integer("job_growth_rate").notNull().default(0),
		topIndustries: pg.jsonb("top_industries").notNull().$type<InsightsIndustry[]>().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.region), pg.index().on(t.totalJobs.desc())],
);

// User insights profile table (for personalized insights)
export const userInsightsProfile = pg.pgTable(
	"user_insights_profile",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		targetIndustries: pg.jsonb("target_industries").notNull().$type<InsightsIndustry[]>().default([]),
		experienceLevel: insightsExperienceLevelEnum("experience_level").notNull().default("mid"),
		preferredRegions: pg.jsonb("preferred_regions").notNull().$type<InsightsRegion[]>().default([]),
		skills: pg.text("skills").array().notNull().default([]),
		targetSalary: pg.integer("target_salary").notNull().default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================
// VIDEO ANALYSIS TABLES
// ============================================

// Video analysis category enum
export const videoAnalysisCategoryEnum = pg.pgEnum("video_analysis_category", [
	"body_language",
	"eye_contact",
	"voice",
	"confidence",
	"posture",
	"facial_expression",
]);

// TypeScript types for video analysis
export type VideoAnalysisCategory =
	| "body_language"
	| "eye_contact"
	| "voice"
	| "confidence"
	| "posture"
	| "facial_expression";

// Category score type stored in JSONB
export type VideoAnalysisCategoryScore = {
	category: VideoAnalysisCategory;
	score: number;
	feedback: string;
	suggestions: string[];
};

// Voice metrics type stored in JSONB
export type VideoAnalysisVoiceMetric = {
	label: string;
	score: number;
	description: string;
};

export type VideoAnalysisVoiceMetrics = {
	tone: VideoAnalysisVoiceMetric;
	pace: VideoAnalysisVoiceMetric;
	clarity: VideoAnalysisVoiceMetric;
	volume: VideoAnalysisVoiceMetric;
	fillerWords: { count: number; examples: string[] };
};

// Highlight type stored in JSONB
export type VideoAnalysisHighlight = {
	type: "positive" | "negative";
	time: string;
	description: string;
};

// Default voice metrics
export const defaultVideoVoiceMetrics: VideoAnalysisVoiceMetrics = {
	tone: { label: "Ton", score: 50, description: "" },
	pace: { label: "Rythme", score: 50, description: "" },
	clarity: { label: "Clarte", score: 50, description: "" },
	volume: { label: "Volume", score: 50, description: "" },
	fillerWords: { count: 0, examples: [] },
};

// Video analysis result table
export const videoAnalysisResult = pg.pgTable(
	"video_analysis_result",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		overallScore: pg.integer("overall_score").notNull(),
		duration: pg.integer("duration").notNull(), // seconds
		categories: pg.jsonb("categories").notNull().$type<VideoAnalysisCategoryScore[]>().default([]),
		voiceMetrics: pg
			.jsonb("voice_metrics")
			.notNull()
			.$type<VideoAnalysisVoiceMetrics>()
			.$defaultFn(() => defaultVideoVoiceMetrics),
		highlights: pg.jsonb("highlights").notNull().$type<VideoAnalysisHighlight[]>().default([]),
		recommendations: pg.text("recommendations").array().notNull().default([]),
		videoUrl: pg.text("video_url"),
		thumbnailUrl: pg.text("thumbnail_url"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.userId, t.overallScore.desc()),
	],
);

// Posture checklist state table - stores user's checked posture items
export const videoAnalysisPostureChecklist = pg.pgTable(
	"video_analysis_posture_checklist",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		checkedItems: pg.text("checked_items").array().notNull().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================
// RECOMMENDATION REQUEST TABLES
// ============================================

// Recommender type enum
export const recommenderTypeEnum = pg.pgEnum("recommender_type", [
	"supervisor",
	"colleague",
	"professor",
	"mentor",
	"client",
]);

// Recommendation request status enum
export const recommendationRequestStatusEnum = pg.pgEnum("recommendation_request_status", [
	"pending",
	"received",
	"sent",
]);

// Reminder frequency enum
export const reminderFrequencyEnum = pg.pgEnum("reminder_frequency", ["none", "daily", "weekly", "biweekly"]);

// TypeScript types for recommendation requests
export type RecommenderType = "supervisor" | "colleague" | "professor" | "mentor" | "client";
export type RecommendationRequestStatus = "pending" | "received" | "sent";
export type ReminderFrequency = "none" | "daily" | "weekly" | "biweekly";

// Recommender table - stores contacts who can provide recommendations
export const recommender = pg.pgTable(
	"recommender",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		email: pg.text("email").notNull(),
		phone: pg.text("phone").notNull().default(""),
		title: pg.text("title").notNull().default(""),
		company: pg.text("company").notNull().default(""),
		relationship: recommenderTypeEnum("relationship").notNull().default("supervisor"),
		yearsKnown: pg.integer("years_known").notNull().default(1),
		notes: pg.text("notes").notNull().default(""),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.relationship),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// Recommendation request table - stores individual recommendation requests
export const recommendationRequest = pg.pgTable(
	"recommendation_request",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		recommenderId: pg
			.uuid("recommender_id")
			.notNull()
			.references(() => recommender.id, { onDelete: "cascade" }),
		purpose: pg.text("purpose").notNull(),
		deadline: pg.date("deadline").notNull(),
		status: recommendationRequestStatusEnum("status").notNull().default("pending"),
		requestDate: pg.date("request_date").notNull(),
		receivedDate: pg.date("received_date"),
		sentToDate: pg.date("sent_to_date"),
		talkingPoints: pg.text("talking_points").array().notNull().default([]),
		followUpReminder: reminderFrequencyEnum("follow_up_reminder").notNull().default("weekly"),
		lastReminderSent: pg.date("last_reminder_sent"),
		notes: pg.text("notes").notNull().default(""),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.deadline),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.recommenderId),
	],
);

// ============================================
// MENTOR MATCHING TABLES
// ============================================

// Mentor status enum
export const mentorStatusEnum = pg.pgEnum("mentor_status", ["available", "busy", "on_vacation"]);

// Mentorship request status enum
export const mentorshipRequestStatusEnum = pg.pgEnum("mentorship_request_status", [
	"pending",
	"accepted",
	"declined",
	"completed",
]);

// Mentorship session type enum
export const mentorshipSessionTypeEnum = pg.pgEnum("mentorship_session_type", [
	"video_call",
	"phone_call",
	"in_person",
	"chat",
]);

// Mentorship session status enum
export const mentorshipSessionStatusEnum = pg.pgEnum("mentorship_session_status", [
	"scheduled",
	"completed",
	"cancelled",
]);

// Mentorship goal status enum
export const mentorshipGoalStatusEnum = pg.pgEnum("mentorship_goal_status", [
	"not_started",
	"in_progress",
	"completed",
]);

// Expertise level enum
export const mentorExpertiseLevelEnum = pg.pgEnum("mentor_expertise_level", [
	"beginner",
	"intermediate",
	"advanced",
	"expert",
]);

// TypeScript types
export type MentorStatus = "available" | "busy" | "on_vacation";
export type MentorshipRequestStatus = "pending" | "accepted" | "declined" | "completed";
export type MentorshipSessionType = "video_call" | "phone_call" | "in_person" | "chat";
export type MentorshipSessionStatus = "scheduled" | "completed" | "cancelled";
export type MentorshipGoalStatus = "not_started" | "in_progress" | "completed";
export type MentorExpertiseLevel = "beginner" | "intermediate" | "advanced" | "expert";

// Availability slot type stored in JSONB
export type MentorAvailabilitySlot = {
	day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
	startTime: string;
	endTime: string;
};

// Skill type stored in JSONB
export type MentorSkill = {
	name: string;
	level: MentorExpertiseLevel;
};

// Milestone type stored in JSONB
export type MentorshipMilestone = {
	id: string;
	title: string;
	completed: boolean;
	completedAt?: string;
};

// Mentor profile table
export const mentorProfile = pg.pgTable(
	"mentor_profile",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		firstName: pg.text("first_name").notNull(),
		lastName: pg.text("last_name").notNull(),
		email: pg.text("email").notNull(),
		avatar: pg.text("avatar"),
		title: pg.text("title").notNull(),
		company: pg.text("company").notNull(),
		location: pg.text("location").notNull(),
		bio: pg.text("bio").notNull(),
		expertise: pg.text("expertise").array().notNull().default([]),
		skills: pg.jsonb("skills").notNull().$type<MentorSkill[]>().default([]),
		yearsOfExperience: pg.integer("years_of_experience").notNull().default(0),
		industries: pg.text("industries").array().notNull().default([]),
		languages: pg.text("languages").array().notNull().default([]),
		status: mentorStatusEnum("status").notNull().default("available"),
		rating: pg.real("rating").notNull().default(0),
		totalReviews: pg.integer("total_reviews").notNull().default(0),
		totalSessions: pg.integer("total_sessions").notNull().default(0),
		totalMentees: pg.integer("total_mentees").notNull().default(0),
		hourlyRate: pg.integer("hourly_rate"),
		isFree: pg.boolean("is_free").notNull().default(true),
		linkedinUrl: pg.text("linkedin_url"),
		availability: pg.jsonb("availability").notNull().$type<MentorAvailabilitySlot[]>().default([]),
		careerPath: pg.text("career_path").array().notNull().default([]),
		achievements: pg.text("achievements").array().notNull().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.status),
		pg.index().on(t.rating.desc()),
		pg.index().on(t.createdAt.desc()),
	],
);

// Mentorship request table
export const mentorshipRequest = pg.pgTable(
	"mentorship_request",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		mentorId: pg
			.uuid("mentor_id")
			.notNull()
			.references(() => mentorProfile.id, { onDelete: "cascade" }),
		mentorName: pg.text("mentor_name").notNull(),
		menteeId: pg.text("mentee_id").notNull(),
		menteeName: pg.text("mentee_name").notNull(),
		message: pg.text("message").notNull(),
		goals: pg.text("goals").array().notNull().default([]),
		status: mentorshipRequestStatusEnum("status").notNull().default("pending"),
		respondedAt: pg.timestamp("responded_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.mentorId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// Mentorship session table
export const mentorshipSession = pg.pgTable(
	"mentorship_session",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		mentorId: pg
			.uuid("mentor_id")
			.notNull()
			.references(() => mentorProfile.id, { onDelete: "cascade" }),
		mentorName: pg.text("mentor_name").notNull(),
		mentorAvatar: pg.text("mentor_avatar"),
		menteeId: pg.text("mentee_id").notNull(),
		menteeName: pg.text("mentee_name").notNull(),
		type: mentorshipSessionTypeEnum("type").notNull().default("video_call"),
		scheduledAt: pg.timestamp("scheduled_at", { withTimezone: true }).notNull(),
		duration: pg.integer("duration").notNull().default(60), // in minutes
		topic: pg.text("topic").notNull(),
		notes: pg.text("notes").notNull().default(""),
		status: mentorshipSessionStatusEnum("status").notNull().default("scheduled"),
		rating: pg.integer("rating"),
		feedback: pg.text("feedback"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.mentorId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.scheduledAt.desc()),
	],
);

// Mentorship goal table
export const mentorshipGoal = pg.pgTable(
	"mentorship_goal",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		mentorshipId: pg.text("mentorship_id").notNull(), // ID of the mentor or mentorship relationship
		title: pg.text("title").notNull(),
		description: pg.text("description").notNull().default(""),
		targetDate: pg.date("target_date").notNull(),
		status: mentorshipGoalStatusEnum("status").notNull().default("not_started"),
		progress: pg.integer("progress").notNull().default(0),
		milestones: pg.jsonb("milestones").notNull().$type<MentorshipMilestone[]>().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.mentorshipId),
		pg.index().on(t.userId, t.targetDate),
	],
);

// Mentor review table
export const mentorReview = pg.pgTable(
	"mentor_review",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		mentorId: pg
			.uuid("mentor_id")
			.notNull()
			.references(() => mentorProfile.id, { onDelete: "cascade" }),
		menteeId: pg.text("mentee_id").notNull(),
		menteeName: pg.text("mentee_name").notNull(),
		menteeAvatar: pg.text("mentee_avatar"),
		rating: pg.integer("rating").notNull(),
		comment: pg.text("comment").notNull(),
		sessionId: pg.text("session_id").notNull(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.mentorId), pg.index().on(t.mentorId, t.createdAt.desc())],
);

// User mentorship goals (for matching preferences)
export const userMentorshipGoals = pg.pgTable(
	"user_mentorship_goals",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		targetRole: pg.text("target_role").notNull().default(""),
		skills: pg.text("skills").array().notNull().default([]),
		industries: pg.text("industries").array().notNull().default([]),
		timeline: pg.text("timeline").notNull().default("6 months"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================
// RESUME VERSION HISTORY TABLES
// ============================================

// Version change type enum
export const versionChangeTypeEnum = pg.pgEnum("version_change_type", ["addition", "deletion", "modification"]);

// TypeScript types for version history
export type VersionChangeType = "addition" | "deletion" | "modification";

export type VersionChange = {
	field: string;
	oldValue: string;
	newValue: string;
	type: VersionChangeType;
};

// Resume version table
export const resumeVersion = pg.pgTable(
	"resume_version",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		resumeId: pg
			.uuid("resume_id")
			.notNull()
			.references(() => resume.id, { onDelete: "cascade" }),
		versionNumber: pg.integer("version_number").notNull(),
		note: pg.text("note").notNull().default(""),
		resumeName: pg.text("resume_name").notNull(),
		size: pg.integer("size").notNull().default(0),
		changes: pg.jsonb("changes").notNull().$type<VersionChange[]>().default([]),
		data: pg.jsonb("data").notNull().$type<ResumeData>(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.resumeId),
		pg.index().on(t.userId, t.resumeId),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.resumeId, t.versionNumber.desc()),
	],
);

// Resume storage statistics table (tracks total storage per user)
export const resumeStorageStats = pg.pgTable(
	"resume_storage_stats",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		usedStorage: pg.integer("used_storage").notNull().default(0),
		totalStorage: pg.integer("total_storage").notNull().default(104857600), // 100MB default
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================
// EXPERIENCE OPTIMIZER TABLES
// ============================================

// Verb category enum
export const experienceVerbCategoryEnum = pg.pgEnum("experience_verb_category", [
	"leadership",
	"technical",
	"communication",
]);

// Industry enum for experience optimizer
export const experienceIndustryEnum = pg.pgEnum("experience_industry", [
	"technology",
	"healthcare",
	"finance",
	"marketing",
	"engineering",
	"education",
	"general",
]);

// TypeScript types for experience optimizer
export type ExperienceVerbCategory = "leadership" | "technical" | "communication";
export type ExperienceIndustry =
	| "technology"
	| "healthcare"
	| "finance"
	| "marketing"
	| "engineering"
	| "education"
	| "general";

// Before/After example type stored in JSONB
export type BeforeAfterExampleData = {
	id: string;
	before: string;
	after: string;
	improvement: string;
	category: string;
};

// Action verb type stored in JSONB
export type ActionVerbData = {
	verb: string;
	description: string;
	example: string;
};

// Quantification suggestion type stored in JSONB
export type QuantificationSuggestionData = {
	metric: string;
	example: string;
	tip: string;
};

// Bullet refinement type stored in JSONB
export type BulletRefinementData = {
	original: string;
	refined: string;
	changes: string[];
};

// Achievement tip type stored in JSONB
export type AchievementTipData = {
	id: string;
	title: string;
	description: string;
	example: string;
};

// Industry optimization type stored in JSONB
export type IndustryOptimizationData = {
	industry: string;
	keywords: string[];
	phrases: string[];
	tips: string[];
};

// User-saved before/after examples table
export const experienceBeforeAfterExample = pg.pgTable(
	"experience_before_after_example",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		before: pg.text("before").notNull(),
		after: pg.text("after").notNull(),
		improvement: pg.text("improvement").notNull(),
		category: experienceVerbCategoryEnum("category").notNull().default("leadership"),
		isCustom: pg.boolean("is_custom").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.category), pg.index().on(t.userId, t.createdAt.desc())],
);

// User-saved action verbs table
export const experienceActionVerb = pg.pgTable(
	"experience_action_verb",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		verb: pg.text("verb").notNull(),
		description: pg.text("description").notNull(),
		example: pg.text("example").notNull(),
		category: experienceVerbCategoryEnum("category").notNull().default("leadership"),
		isCustom: pg.boolean("is_custom").notNull().default(true),
		isFavorite: pg.boolean("is_favorite").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.category), pg.index().on(t.userId, t.isFavorite)],
);

// User optimization history table (stores text optimizations)
export const experienceOptimizationHistory = pg.pgTable(
	"experience_optimization_history",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		inputText: pg.text("input_text").notNull(),
		outputText: pg.text("output_text").notNull(),
		industry: experienceIndustryEnum("industry"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.createdAt.desc())],
);

// User industry preferences table
export const experienceIndustryPreference = pg.pgTable(
	"experience_industry_preference",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		selectedIndustry: experienceIndustryEnum("selected_industry").notNull().default("general"),
		favoriteKeywords: pg.text("favorite_keywords").array().notNull().default([]),
		favoritePhrases: pg.text("favorite_phrases").array().notNull().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// User expanded tips tracking table
export const experienceExpandedTips = pg.pgTable(
	"experience_expanded_tips",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		expandedTipIds: pg.text("expanded_tip_ids").array().notNull().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================
// RESUME SCORING TABLES
// ============================================

// Section score status enum
export const sectionScoreStatusEnum = pg.pgEnum("section_score_status", [
	"excellent",
	"good",
	"needs-improvement",
	"missing",
]);

// Impact level enum
export const impactLevelEnum = pg.pgEnum("impact_level", ["high", "medium", "low"]);

// Effort level enum
export const effortLevelEnum = pg.pgEnum("effort_level", ["easy", "medium", "hard"]);

// TypeScript types for resume scoring
export type SectionScoreStatus = "excellent" | "good" | "needs-improvement" | "missing";
export type ImpactLevel = "high" | "medium" | "low";
export type EffortLevel = "easy" | "medium" | "hard";

// Section score type stored in JSONB
export type ResumeSectionScore = {
	name: string;
	score: number;
	maxScore: number;
	feedback: string;
	status: SectionScoreStatus;
};

// ATS check item type stored in JSONB
export type ResumeATSCheckItem = {
	id: string;
	label: string;
	passed: boolean;
	impact: ImpactLevel;
	suggestion?: string;
};

// Readability score type stored in JSONB
export type ResumeReadabilityScore = {
	score: number;
	gradeLevel: string;
	avgSentenceLength: number;
	complexWords: number;
	passiveVoice: number;
	feedback: string;
};

// Visual appeal score type stored in JSONB
export type ResumeVisualAppealScore = {
	score: number;
	balance: number;
	whitespace: number;
	consistency: number;
	hierarchy: number;
	feedback: string;
};

// Content completeness type stored in JSONB
export type ResumeContentCompleteness = {
	score: number;
	filledSections: number;
	totalSections: number;
	missingCritical: string[];
	recommendations: string[];
};

// Improvement suggestion type stored in JSONB
export type ResumeImprovementSuggestion = {
	id: string;
	category: string;
	title: string;
	description: string;
	impact: ImpactLevel;
	effort: EffortLevel;
};

// Industry benchmark type stored in JSONB
export type ResumeIndustryBenchmark = {
	industry: string;
	avgScore: number;
	topScore: number;
	yourScore: number;
	percentile: number;
};

// Radar data point type stored in JSONB
export type ResumeRadarDataPoint = {
	dimension: string;
	score: number;
	fullMark: number;
};

// Before/after comparison type stored in JSONB
export type ResumeBeforeAfterComparison = {
	metric: string;
	before: number;
	after: number;
	improvement: number;
};

// Resume scoring result table
export const resumeScoringResult = pg.pgTable(
	"resume_scoring_result",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		resumeId: pg.uuid("resume_id").references(() => resume.id, { onDelete: "set null" }),
		resumeName: pg.text("resume_name").notNull(),
		overallScore: pg.integer("overall_score").notNull(),
		sectionScores: pg.jsonb("section_scores").notNull().$type<ResumeSectionScore[]>().default([]),
		atsChecklist: pg.jsonb("ats_checklist").notNull().$type<ResumeATSCheckItem[]>().default([]),
		atsScore: pg.integer("ats_score").notNull().default(0),
		readabilityScore: pg.jsonb("readability_score").$type<ResumeReadabilityScore>(),
		visualAppealScore: pg.jsonb("visual_appeal_score").$type<ResumeVisualAppealScore>(),
		contentCompleteness: pg.jsonb("content_completeness").$type<ResumeContentCompleteness>(),
		improvementSuggestions: pg
			.jsonb("improvement_suggestions")
			.notNull()
			.$type<ResumeImprovementSuggestion[]>()
			.default([]),
		industryBenchmarks: pg.jsonb("industry_benchmarks").notNull().$type<ResumeIndustryBenchmark[]>().default([]),
		radarData: pg.jsonb("radar_data").notNull().$type<ResumeRadarDataPoint[]>().default([]),
		selectedIndustry: pg.text("selected_industry"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.createdAt.desc()), pg.index().on(t.resumeId)],
);

// Resume scoring history table - tracks score progression over time
export const resumeScoringHistory = pg.pgTable(
	"resume_scoring_history",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		resumeId: pg.uuid("resume_id").references(() => resume.id, { onDelete: "set null" }),
		scoringResultId: pg
			.uuid("scoring_result_id")
			.notNull()
			.references(() => resumeScoringResult.id, { onDelete: "cascade" }),
		overallScore: pg.integer("overall_score").notNull(),
		atsScore: pg.integer("ats_score").notNull(),
		readabilityScore: pg.integer("readability_score").notNull(),
		visualScore: pg.integer("visual_score").notNull(),
		completenessScore: pg.integer("completeness_score").notNull(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.resumeId),
		pg.index().on(t.scoringResultId),
	],
);

// ============================================
// FREELANCE PROFILE TABLES
// ============================================

// Freelance platform enum
export const freelancePlatformEnum = pg.pgEnum("freelance_platform", ["upwork", "fiverr", "linkedin"]);

// Package tier enum
export const freelancePackageTierEnum = pg.pgEnum("freelance_package_tier", ["basic", "standard", "premium"]);

// Skill proficiency enum
export const freelanceSkillProficiencyEnum = pg.pgEnum("freelance_skill_proficiency", [
	"beginner",
	"intermediate",
	"advanced",
	"expert",
]);

// Day of week enum for availability
export const freelanceDayOfWeekEnum = pg.pgEnum("freelance_day_of_week", [
	"lun",
	"mar",
	"mer",
	"jeu",
	"ven",
	"sam",
	"dim",
]);

// TypeScript types for freelance profile
export type FreelancePlatform = "upwork" | "fiverr" | "linkedin";
export type FreelancePackageTier = "basic" | "standard" | "premium";
export type FreelanceSkillProficiency = "beginner" | "intermediate" | "advanced" | "expert";
export type FreelanceDayOfWeek = "lun" | "mar" | "mer" | "jeu" | "ven" | "sam" | "dim";

// Availability type stored in JSONB
export type FreelanceAvailability = Record<FreelanceDayOfWeek, boolean>;

// Default availability
export const defaultFreelanceAvailability: FreelanceAvailability = {
	lun: true,
	mar: true,
	mer: true,
	jeu: true,
	ven: true,
	sam: false,
	dim: false,
};

// Freelance profile table
export const freelanceProfile = pg.pgTable(
	"freelance_profile",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		headline: pg.text("headline").notNull().default(""),
		bio: pg.text("bio").notNull().default(""),
		hourlyRate: pg.integer("hourly_rate").notNull().default(0),
		projectMinRate: pg.integer("project_min_rate").notNull().default(0),
		availability: pg
			.jsonb("availability")
			.notNull()
			.$type<FreelanceAvailability>()
			.$defaultFn(() => defaultFreelanceAvailability),
		availableHoursPerWeek: pg.integer("available_hours_per_week").notNull().default(35),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// Freelance skill table
export const freelanceSkill = pg.pgTable(
	"freelance_skill",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		proficiency: freelanceSkillProficiencyEnum("proficiency").notNull().default("intermediate"),
		yearsExperience: pg.integer("years_experience").notNull().default(0),
		endorsements: pg.integer("endorsements").notNull().default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.proficiency)],
);

// Freelance service package table
export const freelanceServicePackage = pg.pgTable(
	"freelance_service_package",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		tier: freelancePackageTierEnum("tier").notNull(),
		name: pg.text("name").notNull(),
		description: pg.text("description").notNull().default(""),
		price: pg.integer("price").notNull().default(0),
		deliveryDays: pg.integer("delivery_days").notNull().default(7),
		revisions: pg.integer("revisions").notNull().default(2), // -1 for unlimited
		features: pg.text("features").array().notNull().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.tier)],
);

// Freelance portfolio item table
export const freelancePortfolioItem = pg.pgTable(
	"freelance_portfolio_item",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		description: pg.text("description").notNull().default(""),
		imageUrl: pg.text("image_url"),
		category: pg.text("category").notNull().default(""),
		tags: pg.text("tags").array().notNull().default([]),
		link: pg.text("link"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.category)],
);

// Freelance client testimonial table
export const freelanceTestimonial = pg.pgTable(
	"freelance_testimonial",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		clientName: pg.text("client_name").notNull(),
		clientRole: pg.text("client_role").notNull().default(""),
		clientCompany: pg.text("client_company").notNull().default(""),
		clientAvatar: pg.text("client_avatar"),
		content: pg.text("content").notNull(),
		rating: pg.integer("rating").notNull().default(5), // 1-5
		platform: freelancePlatformEnum("platform").notNull().default("upwork"),
		date: pg.text("date").notNull(), // YYYY-MM format
		projectType: pg.text("project_type").notNull().default(""),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.platform), pg.index().on(t.userId, t.rating.desc())],
);

// Freelance proposal template table
export const freelanceProposalTemplate = pg.pgTable(
	"freelance_proposal_template",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		category: pg.text("category").notNull().default(""),
		content: pg.text("content").notNull(),
		variables: pg.text("variables").array().notNull().default([]),
		usageCount: pg.integer("usage_count").notNull().default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.category), pg.index().on(t.userId, t.usageCount.desc())],
);

// ============================================
// WORK SAMPLES / PORTFOLIO PROJECTS TABLES
// ============================================

// Project type enum
export const workSampleProjectTypeEnum = pg.pgEnum("work_sample_project_type", [
	"web",
	"mobile",
	"design",
	"backend",
	"fullstack",
	"data",
	"devops",
]);

// Project status enum
export const workSampleProjectStatusEnum = pg.pgEnum("work_sample_project_status", [
	"completed",
	"in-progress",
	"archived",
]);

// Technology category enum
export const workSampleTechCategoryEnum = pg.pgEnum("work_sample_tech_category", [
	"frontend",
	"backend",
	"database",
	"cloud",
	"design",
	"other",
]);

// Link type enum
export const workSampleLinkTypeEnum = pg.pgEnum("work_sample_link_type", [
	"live",
	"github",
	"demo",
	"documentation",
	"figma",
	"video",
]);

// TypeScript types for work samples
export type WorkSampleProjectType = "web" | "mobile" | "design" | "backend" | "fullstack" | "data" | "devops";
export type WorkSampleProjectStatus = "completed" | "in-progress" | "archived";
export type WorkSampleTechCategory = "frontend" | "backend" | "database" | "cloud" | "design" | "other";
export type WorkSampleLinkType = "live" | "github" | "demo" | "documentation" | "figma" | "video";

// Technology type stored in JSONB
export type WorkSampleTechnology = {
	name: string;
	category: WorkSampleTechCategory;
};

// Link type stored in JSONB
export type WorkSampleLink = {
	type: WorkSampleLinkType;
	url: string;
	label: string;
};

// Metric type stored in JSONB
export type WorkSampleMetric = {
	label: string;
	value: string;
	change?: string;
};

// Before/After image type stored in JSONB
export type WorkSampleBeforeAfter = {
	before: string;
	after: string;
	label: string;
};

// Work sample project table
export const workSampleProject = pg.pgTable(
	"work_sample_project",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		description: pg.text("description").notNull().default(""),
		longDescription: pg.text("long_description").notNull().default(""),
		role: pg.text("role").notNull().default(""),
		type: workSampleProjectTypeEnum("type").notNull().default("web"),
		status: workSampleProjectStatusEnum("status").notNull().default("completed"),
		technologies: pg.jsonb("technologies").notNull().$type<WorkSampleTechnology[]>().default([]),
		skills: pg.text("skills").array().notNull().default([]),
		images: pg.text("images").array().notNull().default([]),
		thumbnail: pg.text("thumbnail"),
		links: pg.jsonb("links").notNull().$type<WorkSampleLink[]>().default([]),
		featured: pg.boolean("featured").notNull().default(false),
		startDate: pg.text("start_date"), // YYYY-MM format
		endDate: pg.text("end_date"), // YYYY-MM format
		teamSize: pg.integer("team_size"),
		client: pg.text("client"),
		industry: pg.text("industry"),
		metrics: pg.jsonb("metrics").$type<WorkSampleMetric[]>(),
		beforeAfter: pg.jsonb("before_after").$type<WorkSampleBeforeAfter[]>(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.type),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.featured),
		pg.index().on(t.userId, t.updatedAt.desc()),
	],
);

// Case study timeline phase type stored in JSONB
export type CaseStudyTimelinePhase = {
	phase: string;
	duration: string;
	description: string;
};

// Work sample case study table
export const workSampleCaseStudy = pg.pgTable(
	"work_sample_case_study",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		projectId: pg
			.uuid("project_id")
			.notNull()
			.references(() => workSampleProject.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		overview: pg.text("overview").notNull().default(""),
		challenge: pg.text("challenge").notNull().default(""),
		approach: pg.text("approach").notNull().default(""),
		solution: pg.text("solution").notNull().default(""),
		results: pg.text("results").notNull().default(""),
		learnings: pg.text("learnings").notNull().default(""),
		timeline: pg.jsonb("timeline").notNull().$type<CaseStudyTimelinePhase[]>().default([]),
		keyFeatures: pg.text("key_features").array().notNull().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.projectId), pg.index().on(t.userId, t.createdAt.desc())],
);

// ============================================
// JOB AGGREGATOR TABLES
// ============================================

// Job source enum
export const jobAggregatorSourceEnum = pg.pgEnum("job_aggregator_source", ["linkedin", "indeed", "glassdoor"]);

// Experience level enum
export const jobAggregatorExperienceEnum = pg.pgEnum("job_aggregator_experience", [
	"entry",
	"junior",
	"mid",
	"senior",
	"lead",
]);

// Work type enum
export const jobAggregatorWorkTypeEnum = pg.pgEnum("job_aggregator_work_type", ["onsite", "remote", "hybrid"]);

// Industry enum
export const jobAggregatorIndustryEnum = pg.pgEnum("job_aggregator_industry", [
	"healthcare",
	"industrial",
	"hse",
	"tech",
	"finance",
	"general",
]);

// Application status enum
export const jobAggregatorAppStatusEnum = pg.pgEnum("job_aggregator_app_status", [
	"not_applied",
	"applied",
	"interview",
	"offer",
	"rejected",
]);

// TypeScript types for job aggregator
export type JobAggregatorSource = "linkedin" | "indeed" | "glassdoor";
export type JobAggregatorExperience = "entry" | "junior" | "mid" | "senior" | "lead";
export type JobAggregatorWorkType = "onsite" | "remote" | "hybrid";
export type JobAggregatorIndustry = "healthcare" | "industrial" | "hse" | "tech" | "finance" | "general";
export type JobAggregatorAppStatus = "not_applied" | "applied" | "interview" | "offer" | "rejected";

// Search filters type stored in JSONB
export type JobAggregatorSearchFilters = {
	sources: JobAggregatorSource[];
	salaryMin: number;
	salaryMax: number;
	locations: string[];
	workTypes: JobAggregatorWorkType[];
	experienceLevels: JobAggregatorExperience[];
	industries: JobAggregatorIndustry[];
};

// Aggregated job table
export const aggregatedJob = pg.pgTable(
	"aggregated_job",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		company: pg.text("company").notNull(),
		companyLogo: pg.text("company_logo"),
		location: pg.text("location").notNull(),
		workType: jobAggregatorWorkTypeEnum("work_type").notNull().default("onsite"),
		industry: jobAggregatorIndustryEnum("industry").notNull().default("general"),
		experienceLevel: jobAggregatorExperienceEnum("experience_level").notNull().default("mid"),
		salaryMin: pg.integer("salary_min"),
		salaryMax: pg.integer("salary_max"),
		currency: pg.text("currency").notNull().default("MAD"),
		postedDate: pg.date("posted_date").notNull(),
		description: pg.text("description").notNull(),
		requirements: pg.text("requirements").array().notNull().default([]),
		skills: pg.text("skills").array().notNull().default([]),
		benefits: pg.text("benefits").array().notNull().default([]),
		source: jobAggregatorSourceEnum("source").notNull(),
		sourceUrl: pg.text("source_url").notNull(),
		applicationStatus: jobAggregatorAppStatusEnum("application_status").notNull().default("not_applied"),
		isSaved: pg.boolean("is_saved").notNull().default(false),
		matchScore: pg.integer("match_score"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.isSaved),
		pg.index().on(t.userId, t.applicationStatus),
		pg.index().on(t.userId, t.source),
		pg.index().on(t.userId, t.industry),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// Saved search table
export const aggregatorSavedSearch = pg.pgTable(
	"aggregator_saved_search",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		query: pg.text("query").notNull().default(""),
		filters: pg.jsonb("filters").notNull().$type<JobAggregatorSearchFilters>(),
		resultsCount: pg.integer("results_count").notNull().default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.createdAt.desc())],
);

// ============================================
// JOB APPLICATION DEADLINES TABLES
// ============================================

// Deadline priority enum
export const deadlinePriorityEnum = pg.pgEnum("deadline_priority", ["high", "medium", "low"]);

// TypeScript types for deadlines
export type DeadlinePriority = "high" | "medium" | "low";

// Job deadline table
export const jobDeadline = pg.pgTable(
	"job_deadline",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		company: pg.text("company").notNull(),
		position: pg.text("position").notNull().default(""),
		deadlineDate: pg.date("deadline_date").notNull(),
		deadlineTime: pg.text("deadline_time").notNull().default("23:59"),
		priority: deadlinePriorityEnum("priority").notNull().default("medium"),
		notes: pg.text("notes").notNull().default(""),
		reminderEnabled: pg.boolean("reminder_enabled").notNull().default(false),
		reminderDate: pg.date("reminder_date"),
		reminderTime: pg.text("reminder_time"),
		completed: pg.boolean("completed").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.completed),
		pg.index().on(t.userId, t.deadlineDate),
		pg.index().on(t.userId, t.priority),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// Notification type enum
export const notificationTypeEnum = pg.pgEnum("notification_type", ["tip", "reminder", "milestone", "announcement"]);

// User Notifications table
export const notification = pg.pgTable(
	"notification",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: notificationTypeEnum("type").notNull(),
		title: pg.text("title").notNull(),
		description: pg.text("description").notNull(),
		link: pg.text("link"),
		metadata: pg.jsonb("metadata").$type<Record<string, unknown>>(),
		read: pg.boolean("read").notNull().default(false),
		dismissed: pg.boolean("dismissed").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.read),
		pg.index().on(t.userId, t.dismissed),
		pg.index().on(t.userId, t.type),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// User notification preferences table
export const notificationPreference = pg.pgTable(
	"notification_preference",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		tips: pg.boolean("tips").notNull().default(true),
		reminders: pg.boolean("reminders").notNull().default(true),
		milestones: pg.boolean("milestones").notNull().default(true),
		announcements: pg.boolean("announcements").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================
// QR CODE TABLES
// ============================================

// QR code size and style enums
export const qrSizeEnum = pg.pgEnum("qr_size", ["small", "medium", "large"]);
export const qrStyleEnum = pg.pgEnum("qr_style", ["square", "rounded", "dots"]);

// QR code table
export const qrCode = pg.pgTable(
	"qr_code",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		url: pg.text("url").notNull(),
		foregroundColor: pg.text("foreground_color").notNull().default("#000000"),
		backgroundColor: pg.text("background_color").notNull().default("#ffffff"),
		size: qrSizeEnum("size").notNull().default("medium"),
		style: qrStyleEnum("style").notNull().default("square"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.createdAt.desc())],
);

// QR code scan statistics table
export const qrCodeScan = pg.pgTable(
	"qr_code_scan",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		qrCodeId: pg
			.uuid("qr_code_id")
			.notNull()
			.references(() => qrCode.id, { onDelete: "cascade" }),
		scannedAt: pg.timestamp("scanned_at", { withTimezone: true }).notNull().defaultNow(),
		device: pg.text("device"), // mobile, desktop, tablet
		location: pg.text("location"), // city or country
		source: pg.text("source"), // referrer or source
		ipAddress: pg.text("ip_address"),
		userAgent: pg.text("user_agent"),
	},
	(t) => [pg.index().on(t.qrCodeId), pg.index().on(t.qrCodeId, t.scannedAt.desc()), pg.index().on(t.scannedAt.desc())],
);

// ============================================
// CAREER TRANSITION TABLES
// ============================================

// Skill category enum for career transition
export const transitionSkillCategoryEnum = pg.pgEnum("transition_skill_category", [
	"technical",
	"soft",
	"leadership",
	"communication",
	"analytical",
]);

// Transferable skills table for career transition
export const transitionSkill = pg.pgTable(
	"transition_skill",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		nameFr: pg.text("name_fr").notNull(),
		category: transitionSkillCategoryEnum("category").notNull(),
		currentLevel: pg.integer("current_level").notNull().default(0), // 0-100
		relevanceToTarget: pg.integer("relevance_to_target").notNull().default(0), // 0-100
		description: pg.text("description").notNull().default(""),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.category)],
);

// Timeline phase table for career transition
export const transitionTimelinePhase = pg.pgTable(
	"transition_timeline_phase",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		nameFr: pg.text("name_fr").notNull(),
		duration: pg.text("duration").notNull(),
		durationWeeks: pg.integer("duration_weeks").notNull(),
		description: pg.text("description").notNull().default(""),
		tasks: pg.text("tasks").array().default([]),
		icon: pg.text("icon").notNull().default("CalendarIcon"),
		color: pg.text("color").notNull().default("bg-blue-500"),
		order: pg.integer("order").notNull().default(0),
		completed: pg.boolean("completed").notNull().default(false),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.order)],
);

// Action item category enum
export const transitionActionCategoryEnum = pg.pgEnum("transition_action_category", [
	"skill",
	"network",
	"certification",
	"experience",
	"branding",
]);

// Action item priority enum
export const transitionActionPriorityEnum = pg.pgEnum("transition_action_priority", ["high", "medium", "low"]);

// Action items table for career transition
export const transitionActionItem = pg.pgTable(
	"transition_action_item",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		task: pg.text("task").notNull(),
		taskFr: pg.text("task_fr").notNull(),
		category: transitionActionCategoryEnum("category").notNull(),
		priority: transitionActionPriorityEnum("priority").notNull().default("medium"),
		deadline: pg.date("deadline").notNull(),
		completed: pg.boolean("completed").notNull().default(false),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		estimatedHours: pg.integer("estimated_hours").notNull().default(1),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.completed),
		pg.index().on(t.userId, t.priority),
		pg.index().on(t.userId, t.deadline),
	],
);

// ============================================
// ACHIEVEMENTS & GAMIFICATION TABLES
// ============================================

// Achievement tier enum
export const achievementTierEnum = pg.pgEnum("achievement_tier", ["bronze", "silver", "gold", "platinum"]);

// Achievement category enum
export const achievementCategoryEnum = pg.pgEnum("achievement_category", [
	"resume",
	"interview",
	"job_search",
	"learning",
	"engagement",
	"networking",
	"career",
]);

// Challenge type enum
export const challengeTypeEnum = pg.pgEnum("challenge_type", ["daily", "weekly"]);

// Notification type enum for achievements
export const achievementNotificationTypeEnum = pg.pgEnum("achievement_notification_type", [
	"achievement",
	"level_up",
	"streak",
	"challenge",
	"reward",
]);

// Reward type enum
export const rewardTypeEnum = pg.pgEnum("reward_type", ["theme", "badge", "feature", "template"]);

// Achievement definitions table (stores the master list of all achievements)
export const achievementDefinition = pg.pgTable(
	"achievement_definition",
	{
		id: pg.text("id").notNull().primaryKey(), // e.g., "resume-builder"
		title: pg.text("title").notNull(),
		description: pg.text("description").notNull(),
		icon: pg.text("icon").notNull(), // Icon name
		category: achievementCategoryEnum("category").notNull(),
		unit: pg.text("unit").notNull(), // e.g., "resumes", "sessions"
		bronzeTarget: pg.integer("bronze_target").notNull(),
		bronzeXp: pg.integer("bronze_xp").notNull(),
		silverTarget: pg.integer("silver_target").notNull(),
		silverXp: pg.integer("silver_xp").notNull(),
		goldTarget: pg.integer("gold_target").notNull(),
		goldXp: pg.integer("gold_xp").notNull(),
		platinumTarget: pg.integer("platinum_target").notNull(),
		platinumXp: pg.integer("platinum_xp").notNull(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.category)],
);

// User achievement progress table
export const userAchievement = pg.pgTable(
	"user_achievement",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		achievementId: pg
			.text("achievement_id")
			.notNull()
			.references(() => achievementDefinition.id, { onDelete: "cascade" }),
		currentValue: pg.integer("current_value").notNull().default(0),
		unlockedTiers: pg.text("unlocked_tiers").array().notNull().default([]), // Array of tier names
		lastUnlockedAt: pg.timestamp("last_unlocked_at", { withTimezone: true }),
		isNew: pg.boolean("is_new").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.unique().on(t.userId, t.achievementId),
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.lastUnlockedAt.desc()),
	],
);

// User gamification profile (XP, level, streak)
export const userGamificationProfile = pg.pgTable(
	"user_gamification_profile",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		totalXp: pg.integer("total_xp").notNull().default(0),
		currentStreak: pg.integer("current_streak").notNull().default(0),
		longestStreak: pg.integer("longest_streak").notNull().default(0),
		lastLoginDate: pg.date("last_login_date"),
		showOnLeaderboard: pg.boolean("show_on_leaderboard").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.totalXp.desc())],
);

// Daily/Weekly challenges
export const challenge = pg.pgTable(
	"challenge",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		description: pg.text("description").notNull(),
		icon: pg.text("icon").notNull(),
		type: challengeTypeEnum("type").notNull(),
		target: pg.integer("target").notNull(),
		current: pg.integer("current").notNull().default(0),
		xpReward: pg.integer("xp_reward").notNull(),
		expiresAt: pg.timestamp("expires_at", { withTimezone: true }).notNull(),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.expiresAt), pg.index().on(t.userId, t.type)],
);

// Progress milestones
export const progressMilestone = pg.pgTable(
	"progress_milestone",
	{
		id: pg.text("id").notNull().primaryKey(), // e.g., "milestone-1"
		title: pg.text("title").notNull(),
		description: pg.text("description").notNull(),
		icon: pg.text("icon").notNull(),
		xpRequired: pg.integer("xp_required").notNull(),
		reward: pg.text("reward").notNull(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.xpRequired)],
);

// User unlocked milestones
export const userMilestone = pg.pgTable(
	"user_milestone",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		milestoneId: pg
			.text("milestone_id")
			.notNull()
			.references(() => progressMilestone.id, { onDelete: "cascade" }),
		unlockedAt: pg.timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.unique().on(t.userId, t.milestoneId), pg.index().on(t.userId)],
);

// Unlockable rewards
export const unlockableReward = pg.pgTable(
	"unlockable_reward",
	{
		id: pg.text("id").notNull().primaryKey(), // e.g., "reward-1"
		title: pg.text("title").notNull(),
		description: pg.text("description").notNull(),
		icon: pg.text("icon").notNull(),
		type: rewardTypeEnum("type").notNull(),
		requiredLevel: pg.integer("required_level").notNull(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.requiredLevel)],
);

// User unlocked rewards
export const userReward = pg.pgTable(
	"user_reward",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		rewardId: pg
			.text("reward_id")
			.notNull()
			.references(() => unlockableReward.id, { onDelete: "cascade" }),
		unlockedAt: pg.timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
		isActive: pg.boolean("is_active").notNull().default(false), // If reward is currently active/equipped
	},
	(t) => [pg.unique().on(t.userId, t.rewardId), pg.index().on(t.userId)],
);

// Achievement notifications
export const achievementNotification = pg.pgTable(
	"achievement_notification",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: achievementNotificationTypeEnum("type").notNull(),
		title: pg.text("title").notNull(),
		description: pg.text("description").notNull(),
		icon: pg.text("icon").notNull(),
		isRead: pg.boolean("is_read").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.isRead), pg.index().on(t.userId, t.createdAt.desc())],
);

// User notification preferences
export const achievementNotificationPreferences = pg.pgTable(
	"achievement_notification_preferences",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		achievements: pg.boolean("achievements").notNull().default(true),
		levelUps: pg.boolean("level_ups").notNull().default(true),
		streaks: pg.boolean("streaks").notNull().default(true),
		challenges: pg.boolean("challenges").notNull().default(false),
		leaderboard: pg.boolean("leaderboard").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================
// MOCK AI INTERVIEW QUESTIONS AND CONTENT
// ============================================

// Interview question table - stores questions by field/program/difficulty
export const mockAiQuestion = pg.pgTable(
	"mock_ai_question",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		field: mockAiFieldEnum("field").notNull(),
		program: pg.text("program").notNull(),
		difficulty: mockAiDifficultyEnum("difficulty").notNull(),
		questionText: pg.text("question_text").notNull(),
		order: pg.integer("order").notNull().default(0),
		isActive: pg.boolean("is_active").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.field, t.program, t.difficulty),
		pg.index().on(t.field, t.program, t.difficulty, t.isActive),
		pg.index().on(t.isActive),
	],
);

// Feedback score category enum
export const feedbackScoreCategoryEnum = pg.pgEnum("feedback_score_category", ["excellent", "good", "average", "poor"]);

export type FeedbackScoreCategory = "excellent" | "good" | "average" | "poor";

// Feedback template table - stores feedback templates by score category
export const mockAiFeedbackTemplate = pg.pgTable(
	"mock_ai_feedback_template",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		category: feedbackScoreCategoryEnum("category").notNull(),
		minScore: pg.integer("min_score").notNull(),
		maxScore: pg.integer("max_score").notNull(),
		strengths: pg.text("strengths").array().notNull().default([]),
		improvements: pg.text("improvements").array().notNull().default([]),
		isActive: pg.boolean("is_active").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.category), pg.index().on(t.isActive), pg.index().on(t.minScore, t.maxScore)],
);

// Interview tip table - stores tips shown during interviews
export const mockAiInterviewTip = pg.pgTable(
	"mock_ai_interview_tip",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		title: pg.text("title").notNull(),
		content: pg.text("content").notNull(),
		order: pg.integer("order").notNull().default(0),
		isActive: pg.boolean("is_active").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.isActive), pg.index().on(t.order)],
);

// Program configuration table - stores available programs per field
export const mockAiProgram = pg.pgTable(
	"mock_ai_program",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		field: mockAiFieldEnum("field").notNull(),
		programId: pg.text("program_id").notNull(),
		programName: pg.text("program_name").notNull(),
		order: pg.integer("order").notNull().default(0),
		isActive: pg.boolean("is_active").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.field), pg.index().on(t.field, t.isActive), pg.uniqueIndex().on(t.field, t.programId)],
);

// Field configuration table - stores field display info
export const mockAiFieldConfig = pg.pgTable(
	"mock_ai_field_config",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		field: mockAiFieldEnum("field").notNull().unique(),
		label: pg.text("label").notNull(),
		icon: pg.text("icon").notNull().default("TargetIcon"),
		color: pg.text("color").notNull().default("text-gray-600"),
		bgColor: pg.text("bg_color").notNull().default("bg-gray-100 dark:bg-gray-900/30"),
		isActive: pg.boolean("is_active").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.isActive)],
);

// Difficulty configuration table - stores difficulty settings
export const mockAiDifficultyConfig = pg.pgTable(
	"mock_ai_difficulty_config",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		difficulty: mockAiDifficultyEnum("difficulty").notNull().unique(),
		label: pg.text("label").notNull(),
		color: pg.text("color").notNull().default("text-gray-600"),
		questionsCount: pg.integer("questions_count").notNull().default(5),
		isActive: pg.boolean("is_active").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.isActive)],
);

// ============================================
// NETWORKING EVENTS TABLES
// ============================================

// Networking event type enum
export const networkingEventTypeEnum = pg.pgEnum("networking_event_type", [
	"conference",
	"meetup",
	"webinar",
	"networking",
]);

// Networking event RSVP status enum
export const networkingEventRsvpEnum = pg.pgEnum("networking_event_rsvp", ["going", "maybe", "not_going"]);

// Networking event table
export const networkingEvent = pg.pgTable(
	"networking_event",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		date: pg.date("date").notNull(),
		startTime: pg.text("start_time").notNull(),
		endTime: pg.text("end_time").notNull(),
		location: pg.text("location").notNull(),
		type: networkingEventTypeEnum("type").notNull().default("networking"),
		description: pg.text("description"),
		rsvpStatus: networkingEventRsvpEnum("rsvp_status").notNull().default("maybe"),
		notes: pg.text("notes"),
		link: pg.text("link"),
		// Outcome fields for past events
		outcomeContactsMade: pg.integer("outcome_contacts_made"),
		outcomeFollowUpsScheduled: pg.integer("outcome_follow_ups_scheduled"),
		outcomeOpportunitiesIdentified: pg.integer("outcome_opportunities_identified"),
		outcomeNotes: pg.text("outcome_notes"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.date),
		pg.index().on(t.userId, t.type),
		pg.index().on(t.userId, t.rsvpStatus),
	],
);

// Expected contacts for networking events
export const networkingEventContact = pg.pgTable(
	"networking_event_contact",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		eventId: pg
			.uuid("event_id")
			.notNull()
			.references(() => networkingEvent.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		company: pg.text("company").notNull(),
		role: pg.text("role").notNull(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.eventId)],
);

// Follow-up reminders for networking events
export const networkingEventReminder = pg.pgTable(
	"networking_event_reminder",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		eventId: pg
			.uuid("event_id")
			.notNull()
			.references(() => networkingEvent.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		description: pg.text("description"),
		dueDate: pg.date("due_date").notNull(),
		completed: pg.boolean("completed").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.eventId), pg.index().on(t.eventId, t.completed), pg.index().on(t.dueDate)],
);

// ============================================
// USER ACTIVITY TRACKING TABLE
// ============================================

// Activity type enum for dashboard tracking - expanded for analytics
export const userActivityTypeEnum = pg.pgEnum("user_activity_type", [
	// Resume activities
	"resume_created",
	"resume_updated",
	"resume_deleted",
	"resume_viewed",
	"resume_downloaded",
	"resume_shared",
	// Job application activities
	"job_application_created",
	"job_application_updated",
	"job_application_status_changed",
	"job_application_deleted",
	// Interview activities
	"interview_scheduled",
	"interview_completed",
	"interview_cancelled",
	"interview_practice_started",
	"interview_practice_completed",
	// AI activities
	"ai_content_generated",
	"ai_resume_analyzed",
	"ai_interview_chat",
	"ai_cover_letter_generated",
	// Skill activities
	"skill_added",
	"skill_updated",
	"skill_removed",
	// Goal activities
	"goal_created",
	"goal_updated",
	"goal_completed",
	"goal_deleted",
	// Network activities
	"contact_added",
	"contact_updated",
	"contact_deleted",
	"networking_event_attended",
	// Training activities
	"training_started",
	"training_completed",
	"certification_added",
	// Deadline activities
	"deadline_created",
	"deadline_completed",
	// Page view activities
	"page_view",
	"feature_used",
]);

// Activity category enum for grouping
export const userActivityCategoryEnum = pg.pgEnum("user_activity_category", [
	"resume",
	"career",
	"interview",
	"jobs",
	"networking",
	"ai",
	"training",
	"goals",
	"general",
]);

export type UserActivityType =
	| "resume_created"
	| "resume_updated"
	| "resume_deleted"
	| "resume_viewed"
	| "resume_downloaded"
	| "resume_shared"
	| "job_application_created"
	| "job_application_updated"
	| "job_application_status_changed"
	| "job_application_deleted"
	| "interview_scheduled"
	| "interview_completed"
	| "interview_cancelled"
	| "interview_practice_started"
	| "interview_practice_completed"
	| "ai_content_generated"
	| "ai_resume_analyzed"
	| "ai_interview_chat"
	| "ai_cover_letter_generated"
	| "skill_added"
	| "skill_updated"
	| "skill_removed"
	| "goal_created"
	| "goal_updated"
	| "goal_completed"
	| "goal_deleted"
	| "contact_added"
	| "contact_updated"
	| "contact_deleted"
	| "networking_event_attended"
	| "training_started"
	| "training_completed"
	| "certification_added"
	| "deadline_created"
	| "deadline_completed"
	| "page_view"
	| "feature_used";

export type UserActivityCategory =
	| "resume"
	| "career"
	| "interview"
	| "jobs"
	| "networking"
	| "ai"
	| "training"
	| "goals"
	| "general";

// User activity tracking table - comprehensive activity logging for analytics
export const userActivity = pg.pgTable(
	"user_activity",
	{
		id: pg
			.text("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		activityType: pg.text("activity_type").notNull(), // page_view, resume_edit, ai_use, interview_practice, job_application, etc.
		category: pg.text("category").notNull(), // resume, career, interview, jobs, networking, ai
		resourceId: pg.text("resource_id"), // Optional: resume ID, job ID, etc.
		resourceType: pg.text("resource_type"), // resume, job, interview, etc.
		metadata: pg.jsonb("metadata").$type<Record<string, unknown>>(), // Additional context data
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		pg.index("user_activity_user_id_idx").on(table.userId),
		pg.index("user_activity_type_idx").on(table.activityType),
		pg.index("user_activity_category_idx").on(table.category),
		pg.index("user_activity_created_at_idx").on(table.createdAt),
	],
);

// ============================================
// RECENT SEARCHES TABLE (for Command Palette)
// ============================================

// Search result type enum
export const searchResultTypeEnum = pg.pgEnum("search_result_type", [
	"route",
	"resume",
	"job_application",
	"contact",
	"skill",
]);

// TypeScript type for search result type
export type SearchResultType = "route" | "resume" | "job_application" | "contact" | "skill";

// Recent search table - stores user's recent command palette searches
export const recentSearch = pg.pgTable(
	"recent_search",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		query: pg.text("query").notNull(),
		resultType: searchResultTypeEnum("result_type").notNull(),
		resultId: pg.text("result_id"), // The ID of the selected result (e.g., resume ID, contact ID)
		resultTitle: pg.text("result_title").notNull(), // Display title for the result
		resultPath: pg.text("result_path"), // Navigation path for the result
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.createdAt.desc()), pg.index().on(t.userId, t.resultType)],
);

// ============================================
// KEYBOARD SHORTCUTS TABLES
// ============================================

// Shortcut category enum
export const shortcutCategoryEnum = pg.pgEnum("shortcut_category", ["navigation", "actions", "editor", "general"]);

// TypeScript types for keyboard shortcuts
export type ShortcutCategory = "navigation" | "actions" | "editor" | "general";

export type ShortcutModifier = "ctrl" | "meta" | "alt" | "shift";

// User keyboard shortcut preferences table
export const userKeyboardShortcut = pg.pgTable(
	"user_keyboard_shortcut",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		shortcutId: pg.text("shortcut_id").notNull(), // e.g., "go_dashboard", "new_resume"
		category: shortcutCategoryEnum("category").notNull(),
		keys: pg.text("keys").array().notNull(), // e.g., ["ctrl", "shift", "d"] or ["g", "d"]
		enabled: pg.boolean("enabled").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.unique().on(t.userId, t.shortcutId), pg.index().on(t.userId), pg.index().on(t.userId, t.category)],
);

// ============================================
// DATA EXPORT/IMPORT TABLES
// ============================================

// Data export operation type enum
export const dataExportOperationEnum = pg.pgEnum("data_export_operation", ["export", "import"]);

// Data export status enum
export const dataExportStatusEnum = pg.pgEnum("data_export_status", ["pending", "processing", "completed", "failed"]);

// TypeScript types for data export
export type DataExportOperation = "export" | "import";
export type DataExportStatus = "pending" | "processing" | "completed" | "failed";

// Data types that can be exported/imported
export type ExportableDataType =
	| "resumes"
	| "job_applications"
	| "contacts"
	| "skills"
	| "career_goals"
	| "interview_notes"
	| "cover_letters"
	| "certifications"
	| "salary_history"
	| "journal_entries"
	| "settings";

// Export metadata type
export type ExportMetadata = {
	dataTypes: ExportableDataType[];
	recordCounts: Record<string, number>;
	fileSize?: number;
	fileName?: string;
};

// Import metadata type
export type ImportMetadata = {
	dataTypes: ExportableDataType[];
	recordCounts: Record<string, number>;
	duplicateHandling: "skip" | "overwrite" | "create_new";
	importedCounts: Record<string, number>;
	skippedCounts: Record<string, number>;
	errors: string[];
};

// Data export history table - tracks all export/import operations
export const dataExportHistory = pg.pgTable(
	"data_export_history",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		operation: dataExportOperationEnum("operation").notNull(),
		status: dataExportStatusEnum("status").notNull().default("pending"),
		exportMetadata: pg.jsonb("export_metadata").$type<ExportMetadata>(),
		importMetadata: pg.jsonb("import_metadata").$type<ImportMetadata>(),
		errorMessage: pg.text("error_message"),
		startedAt: pg.timestamp("started_at", { withTimezone: true }),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.createdAt.desc()), pg.index().on(t.userId, t.operation)],
);

// ============================================================================
// AI Provider Configuration (Admin-Managed)
// ============================================================================

export const aiProviderEnum = pg.pgEnum("ai_provider", [
	"openai",
	"anthropic",
	"gemini",
	"ollama",
	"vercel-ai-gateway",
	"deepseek",
	"groq",
	"mistral",
	"togetherai",
	"openrouter",
]);

export const aiProviderConfig = pg.pgTable(
	"ai_provider_config",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		provider: aiProviderEnum("provider").notNull(),
		displayName: pg.text("display_name").notNull(),
		apiKey: pg.text("api_key").notNull(),
		model: pg.text("model").notNull(),
		baseUrl: pg.text("base_url"),
		isDefault: pg.boolean("is_default").notNull().default(false),
		isEnabled: pg.boolean("is_enabled").notNull().default(true),
		maxTokensPerRequest: pg.integer("max_tokens_per_request").notNull().default(4096),
		temperature: pg.numeric("temperature").notNull().default("0.7"),
		priority: pg.integer("priority").notNull().default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.provider), pg.index().on(t.isDefault), pg.index().on(t.isEnabled)],
);

// ============================================================================
// AI Usage Quota Plans (Admin-Managed)
// ============================================================================

export const aiUsageQuota = pg.pgTable("ai_usage_quota", {
	id: pg
		.uuid("id")
		.notNull()
		.primaryKey()
		.$defaultFn(() => generateId()),
	name: pg.text("name").notNull(),
	description: pg.text("description"),
	dailyRequestLimit: pg.integer("daily_request_limit").notNull().default(50),
	monthlyRequestLimit: pg.integer("monthly_request_limit").notNull().default(500),
	maxTokensPerRequest: pg.integer("max_tokens_per_request").notNull().default(4096),
	dailyTokenLimit: pg.integer("daily_token_limit").notNull().default(100000),
	monthlyTokenLimit: pg.integer("monthly_token_limit").notNull().default(1000000),
	allowedFeatures: pg.text("allowed_features").array().notNull().default([]),
	isDefault: pg.boolean("is_default").notNull().default(false),
	isActive: pg.boolean("is_active").notNull().default(true),
	createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: pg
		.timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

// ============================================================================
// User Quota Assignment
// ============================================================================

export const userAiQuota = pg.pgTable(
	"user_ai_quota",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		quotaId: pg
			.uuid("quota_id")
			.notNull()
			.references(() => aiUsageQuota.id, { onDelete: "restrict" }),
		overrideDailyRequestLimit: pg.integer("override_daily_request_limit"),
		overrideMonthlyRequestLimit: pg.integer("override_monthly_request_limit"),
		overrideDailyTokenLimit: pg.integer("override_daily_token_limit"),
		overrideMonthlyTokenLimit: pg.integer("override_monthly_token_limit"),
		notes: pg.text("notes"),
		assignedAt: pg.timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
		assignedBy: pg.uuid("assigned_by").references(() => user.id, { onDelete: "set null" }),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.quotaId)],
);

// ============================================================================
// AI Usage Log (Per-Request Tracking)
// ============================================================================

export const aiUsageStatusEnum = pg.pgEnum("ai_usage_status", ["success", "error", "quota_exceeded"]);

export const aiUsageLog = pg.pgTable(
	"ai_usage_log",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		feature: pg.text("feature").notNull(),
		providerId: pg.uuid("provider_id").references(() => aiProviderConfig.id, { onDelete: "set null" }),
		provider: pg.text("provider_name").notNull(),
		model: pg.text("model").notNull(),
		inputTokens: pg.integer("input_tokens"),
		outputTokens: pg.integer("output_tokens"),
		totalTokens: pg.integer("total_tokens"),
		status: aiUsageStatusEnum("status").notNull().default("success"),
		errorMessage: pg.text("error_message"),
		durationMs: pg.integer("duration_ms"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.feature),
		pg.index().on(t.createdAt.desc()),
	],
);

// ============================================================================
// AI Global Settings (Organization-Wide Quota Controls)
// ============================================================================

export const aiGlobalSettings = pg.pgTable("ai_global_settings", {
	id: pg.text("id").primaryKey(),
	maxDailyRequests: pg.integer("max_daily_requests").default(10000),
	maxMonthlyRequests: pg.integer("max_monthly_requests").default(100000),
	maxDailyTokens: pg.integer("max_daily_tokens").default(10000000),
	maxMonthlyTokens: pg.integer("max_monthly_tokens").default(100000000),
	alertThresholdPercent: pg.integer("alert_threshold_percent").default(80),
	suspendOnExceed: pg.boolean("suspend_on_exceed").default(false),
	defaultLanguage: pg.text("default_language").default("fr"),
	allowedLanguages: pg.text("allowed_languages").array().default(["fr", "ar", "en", "darija"]),
	isActive: pg.boolean("is_active").default(true).notNull(),
	createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: pg
		.timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

// ============================================================================
// App Settings (generic admin-controllable key/value runtime settings)
// ============================================================================

// Stores small admin-controllable runtime settings as JSON values keyed by a
// stable string key (e.g. "registration_mode"). Used so admins can flip the
// registration mode without an env change / redeploy. Env vars act as the
// fallback default when no row exists for a key.
export const appSetting = pg.pgTable("app_setting", {
	key: pg.text("key").primaryKey(),
	value: pg.jsonb("value").notNull(),
	updatedAt: pg
		.timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
	updatedBy: pg.text("updated_by"),
});

// ============================================================================
// Reference Data Tables (for database-driven content)
// ============================================================================

// IMTA Programs - training program metadata
export const imtaProgram = pg.pgTable(
	"imta_program",
	{
		id: pg.text("id").notNull().primaryKey(),
		name: pg.text("name").notNull(),
		nameFr: pg.text("name_fr").notNull(),
		field: pg.text("field").notNull(), // healthcare, industrial, hse
		duration: pg.text("duration").notNull(),
		durationFr: pg.text("duration_fr").notNull(),
		requirements: pg.text("requirements").notNull(),
		requirementsFr: pg.text("requirements_fr").notNull(),
		description: pg.text("description").notNull(),
		descriptionFr: pg.text("description_fr").notNull(),
		successRate: pg.integer("success_rate"),
		avgSalary: pg.integer("avg_salary"),
		employmentRate: pg.integer("employment_rate"),
		skills: pg.jsonb("skills").notNull().$type<string[]>(),
		certifications: pg.jsonb("certifications").notNull().$type<string[]>(),
		isActive: pg.boolean("is_active").notNull().default(true),
		sortOrder: pg.integer("sort_order").default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.field), pg.index().on(t.isActive)],
);

// Interview Tips - interview preparation and guidance content
export const interviewTip = pg.pgTable(
	"interview_tip",
	{
		id: pg.text("id").notNull().primaryKey(),
		title: pg.text("title").notNull(),
		titleFr: pg.text("title_fr").notNull(),
		content: pg.text("content").notNull(),
		contentFr: pg.text("content_fr").notNull(),
		extendedContent: pg.text("extended_content"),
		extendedContentFr: pg.text("extended_content_fr"),
		category: pg.text("category").notNull(), // preparation, during, after, common_questions, body_language, field_specific
		field: pg.text("field"), // healthcare, industrial, hse, general (null = all fields)
		tags: pg.jsonb("tags").notNull().$type<string[]>(),
		isActive: pg.boolean("is_active").notNull().default(true),
		sortOrder: pg.integer("sort_order").default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.category), pg.index().on(t.field), pg.index().on(t.isActive)],
);

// Interview Common Questions - sample questions with answers
export const interviewCommonQuestion = pg.pgTable(
	"interview_common_question",
	{
		id: pg.text("id").notNull().primaryKey(),
		question: pg.text("question").notNull(),
		questionFr: pg.text("question_fr").notNull(),
		type: pg.text("type").notNull(), // behavioral, technical, situational, motivational, general
		field: pg.text("field").notNull(), // healthcare, industrial, hse, general
		program: pg.text("program"), // specific IMTA program id (e.g. soudure, cariste); null = field-wide
		sampleAnswer: pg.text("sample_answer"),
		sampleAnswerFr: pg.text("sample_answer_fr"),
		tips: pg.jsonb("tips").notNull().$type<string[]>(),
		tipsFr: pg.jsonb("tips_fr").notNull().$type<string[]>(),
		difficulty: pg.text("difficulty").default("intermediate"), // beginner, intermediate, advanced
		isActive: pg.boolean("is_active").notNull().default(true),
		sortOrder: pg.integer("sort_order").default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.type), pg.index().on(t.field), pg.index().on(t.program), pg.index().on(t.isActive)],
);

// Career Market Insights - market statistics for career guidance
export const careerMarketInsight = pg.pgTable(
	"career_market_insight",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		title: pg.text("title").notNull(),
		titleFr: pg.text("title_fr").notNull(),
		value: pg.text("value").notNull(),
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		icon: pg.text("icon"), // icon name for UI
		color: pg.text("color"), // color class for UI
		field: pg.text("field"), // healthcare, industrial, hse, or null for general
		isActive: pg.boolean("is_active").notNull().default(true),
		sortOrder: pg.integer("sort_order").default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.unique().on(t.title), pg.index().on(t.field), pg.index().on(t.isActive)],
);

// Career Employers - top employers database
export const careerEmployer = pg.pgTable(
	"career_employer",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		name: pg.text("name").notNull(),
		sector: pg.text("sector").notNull(),
		sectorFr: pg.text("sector_fr").notNull(),
		location: pg.text("location").notNull(),
		locationFr: pg.text("location_fr"),
		openPositions: pg.integer("open_positions").default(0),
		website: pg.text("website"),
		logo: pg.text("logo"),
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		fields: pg.jsonb("fields").notNull().$type<string[]>(), // healthcare, industrial, hse
		isActive: pg.boolean("is_active").notNull().default(true),
		sortOrder: pg.integer("sort_order").default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.unique().on(t.name), pg.index().on(t.isActive)],
);

// Skill Library - recommended skills for each field
export const skillLibrary = pg.pgTable(
	"skill_library",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		name: pg.text("name").notNull(),
		nameFr: pg.text("name_fr").notNull(),
		field: pg.text("field").notNull(), // healthcare, industrial, hse
		category: pg.text("category").notNull(), // technical, soft, languages, certifications
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		isRecommended: pg.boolean("is_recommended").notNull().default(true),
		isActive: pg.boolean("is_active").notNull().default(true),
		sortOrder: pg.integer("sort_order").default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.field), pg.index().on(t.category), pg.index().on(t.isActive)],
);

// ============================================================================
// AI MENTOR SYSTEM
// ============================================================================

// AI Mentor personality enum
export const aiMentorPersonalityEnum = pg.pgEnum("ai_mentor_personality", [
	"supportive",
	"challenging",
	"balanced",
	"motivational",
	"analytical",
]);

// AI Mentor coaching style enum
export const aiMentorStyleEnum = pg.pgEnum("ai_mentor_style", ["formal", "casual", "professional", "friendly"]);

// AI Mentor specialization enum
export const aiMentorSpecializationEnum = pg.pgEnum("ai_mentor_specialization", [
	"healthcare",
	"industrial",
	"hse",
	"interview",
	"career_strategy",
	"skills_development",
	"job_search",
	"networking",
	"general",
]);

// Pre-built AI Mentor Templates (5 expert mentors)
export const aiMentorTemplate = pg.pgTable(
	"ai_mentor_template",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		name: pg.text("name").notNull(), // e.g., "Dr. Amina"
		nameFr: pg.text("name_fr").notNull(),
		avatar: pg.text("avatar"), // URL or identifier
		title: pg.text("title").notNull(), // e.g., "Healthcare Career Coach"
		titleFr: pg.text("title_fr").notNull(),
		specialization: aiMentorSpecializationEnum("specialization").notNull(),
		personality: aiMentorPersonalityEnum("personality").notNull().default("balanced"),
		style: aiMentorStyleEnum("style").notNull().default("professional"),
		description: pg.text("description").notNull(),
		descriptionFr: pg.text("description_fr").notNull(),
		expertise: pg.jsonb("expertise").notNull().$type<string[]>(), // Areas of expertise
		languages: pg.jsonb("languages").notNull().$type<string[]>(), // fr, ar, en, darija
		systemPrompt: pg.text("system_prompt").notNull(), // AI system prompt for this mentor
		welcomeMessage: pg.text("welcome_message").notNull(),
		welcomeMessageFr: pg.text("welcome_message_fr").notNull(),
		sampleQuestions: pg.jsonb("sample_questions").$type<string[]>(), // Suggested conversation starters
		isActive: pg.boolean("is_active").notNull().default(true),
		sortOrder: pg.integer("sort_order").default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.specialization), pg.index().on(t.isActive)],
);

// User's selected or custom AI Mentors
export const userAiMentor = pg.pgTable(
	"user_ai_mentor",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		templateId: pg.uuid("template_id").references(() => aiMentorTemplate.id, { onDelete: "set null" }), // null if custom
		isCustom: pg.boolean("is_custom").notNull().default(false),
		// Custom mentor settings (used when isCustom=true or to override template)
		customName: pg.text("custom_name"),
		customAvatar: pg.text("custom_avatar"),
		customPersonality: aiMentorPersonalityEnum("custom_personality"),
		customStyle: aiMentorStyleEnum("custom_style"),
		customSpecializations: pg.jsonb("custom_specializations").$type<string[]>(),
		customLanguages: pg.jsonb("custom_languages").$type<string[]>(),
		customSystemPrompt: pg.text("custom_system_prompt"),
		customFocusAreas: pg.jsonb("custom_focus_areas").$type<string[]>(), // skills, interview, job_search, etc.
		// Session preferences
		sessionFrequency: pg.text("session_frequency").default("on_demand"), // daily, weekly, on_demand
		preferredTime: pg.text("preferred_time"), // morning, afternoon, evening
		notificationsEnabled: pg.boolean("notifications_enabled").notNull().default(true),
		// Usage stats
		totalConversations: pg.integer("total_conversations").notNull().default(0),
		totalMessages: pg.integer("total_messages").notNull().default(0),
		lastInteraction: pg.timestamp("last_interaction", { withTimezone: true }),
		isPrimary: pg.boolean("is_primary").notNull().default(false), // Primary mentor for user
		isActive: pg.boolean("is_active").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.templateId), pg.index().on(t.userId, t.isPrimary)],
);

// AI Mentor conversation message role
export const aiMentorMessageRoleEnum = pg.pgEnum("ai_mentor_message_role", ["user", "assistant", "system"]);

// AI Mentor Conversations (chat history)
export const aiMentorConversation = pg.pgTable(
	"ai_mentor_conversation",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		mentorId: pg
			.uuid("mentor_id")
			.notNull()
			.references(() => userAiMentor.id, { onDelete: "cascade" }),
		title: pg.text("title"), // Auto-generated conversation title
		topic: pg.text("topic"), // Main topic of conversation
		messages: pg.jsonb("messages").notNull().$type<
			{
				role: "user" | "assistant" | "system";
				content: string;
				timestamp: string;
				tokens?: number;
			}[]
		>(),
		context: pg.jsonb("context").$type<{
			resumeId?: string;
			goalId?: string;
			jobApplicationId?: string;
			skillGaps?: string[];
		}>(), // Contextual data for the conversation
		totalTokens: pg.integer("total_tokens").notNull().default(0),
		isArchived: pg.boolean("is_archived").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.mentorId),
		pg.index().on(t.userId, t.createdAt),
		pg.index().on(t.isArchived),
	],
);

// AI Mentor Scheduled Sessions
export const aiMentorSessionTypeEnum = pg.pgEnum("ai_mentor_session_type", [
	"daily_pulse",
	"weekly_review",
	"monthly_strategy",
	"skill_coaching",
	"interview_prep",
	"goal_setting",
	"career_planning",
	"on_demand",
]);

export const aiMentorSession = pg.pgTable(
	"ai_mentor_session",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		mentorId: pg
			.uuid("mentor_id")
			.notNull()
			.references(() => userAiMentor.id, { onDelete: "cascade" }),
		conversationId: pg.uuid("conversation_id").references(() => aiMentorConversation.id, { onDelete: "set null" }),
		sessionType: aiMentorSessionTypeEnum("session_type").notNull(),
		title: pg.text("title").notNull(),
		description: pg.text("description"),
		scheduledAt: pg.timestamp("scheduled_at", { withTimezone: true }),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		duration: pg.integer("duration"), // Duration in minutes
		topics: pg.jsonb("topics").$type<string[]>(),
		outcomes: pg.jsonb("outcomes").$type<string[]>(), // Key takeaways
		actionItems: pg.jsonb("action_items").$type<
			{
				task: string;
				completed: boolean;
				dueDate?: string;
			}[]
		>(),
		rating: pg.integer("rating"), // User rating 1-5
		feedback: pg.text("feedback"),
		status: pg.text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
		isRecurring: pg.boolean("is_recurring").notNull().default(false),
		recurrencePattern: pg.text("recurrence_pattern"), // daily, weekly, monthly
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.mentorId), pg.index().on(t.scheduledAt), pg.index().on(t.status)],
);

// User onboarding profile for mentor matching
export const userMentorOnboarding = pg.pgTable(
	"user_mentor_onboarding",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		field: pg.text("field"), // healthcare, industrial, hse
		currentLevel: pg.text("current_level"), // student, graduate, working, experienced
		biggestChallenge: pg.text("biggest_challenge"), // job_search, skills, interviews, networking, career_change
		learningStyle: pg.text("learning_style"), // visual, hands_on, reading, discussion
		preferredLanguage: pg.text("preferred_language").default("fr"), // fr, ar, en, darija
		careerGoal: pg.text("career_goal"),
		targetRole: pg.text("target_role"),
		timelineMonths: pg.integer("timeline_months"), // How many months to achieve goal
		availabilityHours: pg.integer("availability_hours"), // Hours per week for coaching
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId)],
);

// ============================================================================
// MOROCCO MARKET INTELLIGENCE
// ============================================================================

// Job listing status enum
export const jobListingStatusEnum = pg.pgEnum("job_listing_status", ["active", "expired", "filled", "draft"]);

// Job listings from Morocco job portals
export const jobListing = pg.pgTable(
	"job_listing",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		externalId: pg.text("external_id"), // ID from source portal
		source: pg.text("source").notNull(), // rekrute, emploi_ma, anapec, linkedin, dreamjob
		title: pg.text("title").notNull(),
		titleFr: pg.text("title_fr"),
		company: pg.text("company").notNull(),
		companyLogo: pg.text("company_logo"),
		location: pg.text("location").notNull(), // City
		region: pg.text("region"), // Casablanca-Settat, Rabat-Salé-Kénitra, etc.
		jobType: pg.text("job_type"), // full_time, part_time, contract, internship
		experienceLevel: pg.text("experience_level"), // entry, mid, senior, executive
		field: pg.text("field"), // healthcare, industrial, hse, general
		description: pg.text("description"),
		requirements: pg.jsonb("requirements").$type<string[]>(),
		skills: pg.jsonb("skills").$type<string[]>(),
		salaryMin: pg.integer("salary_min"), // MAD per month
		salaryMax: pg.integer("salary_max"),
		salaryPeriod: pg.text("salary_period").default("monthly"), // monthly, yearly
		benefits: pg.jsonb("benefits").$type<string[]>(),
		applicationUrl: pg.text("application_url"),
		contactEmail: pg.text("contact_email"),
		postedAt: pg.timestamp("posted_at", { withTimezone: true }),
		expiresAt: pg.timestamp("expires_at", { withTimezone: true }),
		status: jobListingStatusEnum("status").notNull().default("active"),
		viewCount: pg.integer("view_count").notNull().default(0),
		applicationCount: pg.integer("application_count").notNull().default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.source),
		pg.index().on(t.location),
		pg.index().on(t.region),
		pg.index().on(t.field),
		pg.index().on(t.experienceLevel),
		pg.index().on(t.status),
		pg.index().on(t.postedAt),
	],
);

// Morocco market salary data by role, region, and experience
export const marketSalaryData = pg.pgTable(
	"market_salary_data",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		role: pg.text("role").notNull(), // Job title
		roleFr: pg.text("role_fr").notNull(),
		field: pg.text("field").notNull(), // healthcare, industrial, hse
		region: pg.text("region"), // null for national average
		experienceLevel: pg.text("experience_level").notNull(), // entry, mid, senior
		salaryMin: pg.integer("salary_min").notNull(), // MAD per year
		salaryMedian: pg.integer("salary_median").notNull(),
		salaryMax: pg.integer("salary_max").notNull(),
		sampleSize: pg.integer("sample_size"), // Number of data points
		lastUpdated: pg.timestamp("last_updated", { withTimezone: true }),
		growthRate: pg.real("growth_rate"), // Year-over-year salary growth %
		demandScore: pg.integer("demand_score"), // 1-100 demand indicator
		source: pg.text("source"), // Data source
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.field),
		pg.index().on(t.region),
		pg.index().on(t.experienceLevel),
		pg.uniqueIndex().on(t.role, t.region, t.experienceLevel),
	],
);

// Employer database for Morocco market
export const employerDatabase = pg.pgTable(
	"employer_database",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		name: pg.text("name").notNull().unique(),
		nameFr: pg.text("name_fr"),
		logo: pg.text("logo"),
		website: pg.text("website"),
		linkedinUrl: pg.text("linkedin_url"),
		industry: pg.text("industry").notNull(),
		industryFr: pg.text("industry_fr"),
		size: pg.text("size"), // startup, small, medium, large, enterprise
		employeeCount: pg.text("employee_count"), // 1-10, 11-50, 51-200, etc.
		headquarters: pg.text("headquarters"), // City
		locations: pg.jsonb("locations").$type<string[]>(), // All office locations
		founded: pg.integer("founded"), // Year
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		culture: pg.jsonb("culture").$type<{
			values?: string[];
			benefits?: string[];
			workStyle?: string; // remote_first, hybrid, onsite
			dressCode?: string;
		}>(),
		fields: pg.jsonb("fields").$type<string[]>(), // healthcare, industrial, hse
		openPositions: pg.integer("open_positions").notNull().default(0),
		averageSalary: pg.integer("average_salary"), // MAD per year
		rating: pg.real("rating"), // 1-5 employer rating
		reviewCount: pg.integer("review_count").notNull().default(0),
		hiringTrend: pg.text("hiring_trend"), // growing, stable, declining
		isVerified: pg.boolean("is_verified").notNull().default(false),
		isActive: pg.boolean("is_active").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.industry), pg.index().on(t.headquarters), pg.index().on(t.rating), pg.index().on(t.isActive)],
);

// Skill demand tracking
export const skillDemand = pg.pgTable(
	"skill_demand",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		skill: pg.text("skill").notNull(),
		skillFr: pg.text("skill_fr").notNull(),
		field: pg.text("field"), // healthcare, industrial, hse, or null for cross-field
		category: pg.text("category").notNull(), // technical, soft, language, certification
		demandScore: pg.integer("demand_score").notNull(), // 1-100
		growthTrend: pg.text("growth_trend").notNull(), // rising, stable, declining
		growthPercent: pg.real("growth_percent"), // Year-over-year change
		jobCount: pg.integer("job_count"), // Number of jobs requiring this skill
		averageSalaryBoost: pg.integer("average_salary_boost"), // MAD boost for having skill
		competitionLevel: pg.text("competition_level"), // low, medium, high
		timeToLearn: pg.text("time_to_learn"), // weeks, months, years
		resources: pg.jsonb("resources").$type<{
			courses?: string[];
			certifications?: string[];
			books?: string[];
		}>(),
		relatedSkills: pg.jsonb("related_skills").$type<string[]>(),
		lastUpdated: pg.timestamp("last_updated", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.field),
		pg.index().on(t.category),
		pg.index().on(t.demandScore),
		pg.uniqueIndex().on(t.skill, t.field),
	],
);

// Regional job statistics for Morocco
export const regionalJobStats = pg.pgTable(
	"regional_job_stats",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		region: pg.text("region").notNull().unique(), // Casablanca-Settat, Rabat-Salé-Kénitra, etc.
		regionFr: pg.text("region_fr").notNull(),
		totalJobs: pg.integer("total_jobs").notNull().default(0),
		jobGrowth: pg.real("job_growth"), // Year-over-year growth %
		averageSalary: pg.integer("average_salary"), // MAD per year
		topIndustries: pg.jsonb("top_industries").$type<
			{
				industry: string;
				jobCount: number;
			}[]
		>(),
		topEmployers: pg.jsonb("top_employers").$type<
			{
				company: string;
				jobCount: number;
			}[]
		>(),
		skillsInDemand: pg.jsonb("skills_in_demand").$type<string[]>(),
		unemploymentRate: pg.real("unemployment_rate"), // Percentage
		costOfLiving: pg.text("cost_of_living"), // low, medium, high, very_high
		qualityOfLife: pg.integer("quality_of_life"), // 1-100 score
		lastUpdated: pg.timestamp("last_updated", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.region)],
);

// ============================================================================
// QUIZ QUESTIONS (migrated from hardcoded)
// ============================================================================

export const quizQuestionTypeEnum = pg.pgEnum("quiz_question_type", ["multiple_choice", "scale", "ranking"]);

export const quizCategoryEnum = pg.pgEnum("quiz_category", [
	"personality",
	"interests",
	"skills",
	"work_preferences",
	"values",
	"moroccan_market",
	"environment",
	"stress",
	"work_style",
	"goals",
]);

export const quizQuestion = pg.pgTable(
	"quiz_question",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		quizType: pg.text("quiz_type").notNull(), // career_assessment, career_quiz, skills_quiz
		question: pg.text("question").notNull(),
		questionFr: pg.text("question_fr").notNull(),
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		category: quizCategoryEnum("category").notNull(),
		questionType: quizQuestionTypeEnum("question_type").notNull().default("multiple_choice"),
		options: pg.jsonb("options").notNull().$type<
			{
				id: string;
				text: string;
				textFr: string;
				icon?: string;
				scores: Record<string, number>; // Program or trait scores
			}[]
		>(),
		trait: pg.text("trait"), // For personality traits
		field: pg.text("field"), // healthcare, industrial, hse, or null for general
		weight: pg.real("weight").default(1), // Question importance weight
		isActive: pg.boolean("is_active").notNull().default(true),
		sortOrder: pg.integer("sort_order").default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.quizType), pg.index().on(t.category), pg.index().on(t.isActive)],
);

// ============================================================================
// PARTNER/EMPLOYER SYSTEM
// ============================================================================

// Partner status enum
export const partnerStatusEnum = pg.pgEnum("partner_status", ["pending", "approved", "rejected", "suspended"]);

// Partner type enum
export const partnerTypeEnum = pg.pgEnum("partner_type", [
	"employer",
	"recruiter",
	"training_center",
	"government",
	"ngo",
]);

// Partner profile - companies/organizations that can post jobs
export const partnerProfile = pg.pgTable(
	"partner_profile",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		companyName: pg.text("company_name").notNull(),
		companyNameFr: pg.text("company_name_fr"),
		logo: pg.text("logo"),
		website: pg.text("website"),
		linkedinUrl: pg.text("linkedin_url"),
		partnerType: partnerTypeEnum("partner_type").notNull(),
		industry: pg.text("industry").notNull(),
		industryFr: pg.text("industry_fr"),
		description: pg.text("description").notNull(),
		descriptionFr: pg.text("description_fr"),
		size: pg.text("size"), // startup, small, medium, large, enterprise
		employeeCount: pg.text("employee_count"),
		headquarters: pg.text("headquarters").notNull(), // City in Morocco
		locations: pg.jsonb("locations").$type<string[]>(),
		founded: pg.integer("founded"),
		contactEmail: pg.text("contact_email").notNull(),
		contactPhone: pg.text("contact_phone"),
		contactPerson: pg.text("contact_person"),
		fields: pg.jsonb("fields").$type<string[]>(), // healthcare, industrial, hse
		status: partnerStatusEnum("status").notNull().default("pending"),
		approvedAt: pg.timestamp("approved_at", { withTimezone: true }),
		approvedBy: pg.uuid("approved_by").references(() => user.id),
		rejectionReason: pg.text("rejection_reason"),
		// Stats
		totalJobsPosted: pg.integer("total_jobs_posted").notNull().default(0),
		totalEventsPosted: pg.integer("total_events_posted").notNull().default(0),
		totalApplications: pg.integer("total_applications").notNull().default(0),
		rating: pg.real("rating"),
		reviewCount: pg.integer("review_count").notNull().default(0),
		isVerified: pg.boolean("is_verified").notNull().default(false),
		isPremium: pg.boolean("is_premium").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.status),
		pg.index().on(t.partnerType),
		pg.index().on(t.industry),
		pg.index().on(t.headquarters),
	],
);

// Partner invitations - admin invites a company by email; whoever signs up with
// that email is auto-promoted to a partner (see auth/config.ts databaseHooks).
export const partnerInvite = pg.pgTable(
	"partner_invite",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		email: pg.text("email").notNull(),
		companyName: pg.text("company_name").notNull(),
		companyNameFr: pg.text("company_name_fr"),
		partnerType: pg.text("partner_type").notNull().default("employer"),
		token: pg.text("token").notNull().unique(),
		invitedBy: pg
			.uuid("invited_by")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		status: pg.text("status").notNull().default("pending"), // pending | accepted | revoked | expired
		acceptedUserId: pg.uuid("accepted_user_id").references(() => user.id, { onDelete: "set null" }),
		expiresAt: pg
			.timestamp("expires_at", { withTimezone: true })
			.notNull()
			.$defaultFn(() => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
	},
	(t) => [pg.index().on(t.email), pg.index().on(t.token), pg.index().on(t.status)],
);

// Partner job posting status
export const partnerJobStatusEnum = pg.pgEnum("partner_job_status", [
	"draft",
	"pending_review",
	"published",
	"expired",
	"closed",
	"rejected",
]);

// Partner job postings
export const partnerJobPosting = pg.pgTable(
	"partner_job_posting",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		partnerId: pg
			.uuid("partner_id")
			.notNull()
			.references(() => partnerProfile.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		titleFr: pg.text("title_fr"),
		description: pg.text("description").notNull(),
		descriptionFr: pg.text("description_fr"),
		location: pg.text("location").notNull(),
		region: pg.text("region"),
		jobType: pg.text("job_type").notNull(), // full_time, part_time, contract, internship, apprenticeship
		experienceLevel: pg.text("experience_level").notNull(), // entry, mid, senior
		field: pg.text("field"), // healthcare, industrial, hse
		requirements: pg.jsonb("requirements").$type<string[]>(),
		skills: pg.jsonb("skills").$type<string[]>(),
		education: pg.text("education"), // Required education level
		certifications: pg.jsonb("certifications").$type<string[]>(),
		salaryMin: pg.integer("salary_min"),
		salaryMax: pg.integer("salary_max"),
		salaryPeriod: pg.text("salary_period").default("monthly"),
		salaryCurrency: pg.text("salary_currency").default("MAD"),
		benefits: pg.jsonb("benefits").$type<string[]>(),
		applicationDeadline: pg.timestamp("application_deadline", { withTimezone: true }),
		startDate: pg.timestamp("start_date", { withTimezone: true }),
		positions: pg.integer("positions").default(1), // Number of positions available
		applicationUrl: pg.text("application_url"),
		applicationEmail: pg.text("application_email"),
		applicationInstructions: pg.text("application_instructions"),
		status: partnerJobStatusEnum("status").notNull().default("draft"),
		publishedAt: pg.timestamp("published_at", { withTimezone: true }),
		expiresAt: pg.timestamp("expires_at", { withTimezone: true }),
		reviewedAt: pg.timestamp("reviewed_at", { withTimezone: true }),
		reviewedBy: pg.uuid("reviewed_by").references(() => user.id),
		rejectionReason: pg.text("rejection_reason"),
		// Stats
		viewCount: pg.integer("view_count").notNull().default(0),
		applicationCount: pg.integer("application_count").notNull().default(0),
		saveCount: pg.integer("save_count").notNull().default(0),
		isFeatured: pg.boolean("is_featured").notNull().default(false),
		isUrgent: pg.boolean("is_urgent").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.partnerId),
		pg.index().on(t.status),
		pg.index().on(t.location),
		pg.index().on(t.field),
		pg.index().on(t.experienceLevel),
		pg.index().on(t.publishedAt),
		pg.index().on(t.applicationDeadline),
	],
);

// Job applications from users
export const partnerJobApplication = pg.pgTable(
	"partner_job_application",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		jobId: pg
			.uuid("job_id")
			.notNull()
			.references(() => partnerJobPosting.id, { onDelete: "cascade" }),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		resumeId: pg.uuid("resume_id").references(() => resume.id, { onDelete: "set null" }),
		coverLetter: pg.text("cover_letter"),
		status: pg.text("status").notNull().default("submitted"), // submitted, reviewed, shortlisted, interviewed, offered, hired, rejected
		notes: pg.text("notes"), // Internal notes by employer
		matchScore: pg.integer("match_score"), // AI-calculated match score
		reviewedAt: pg.timestamp("reviewed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.jobId),
		pg.index().on(t.userId),
		pg.index().on(t.status),
		pg.uniqueIndex().on(t.jobId, t.userId),
	],
);

// Partner event posting status
export const partnerEventStatusEnum = pg.pgEnum("partner_event_status", [
	"draft",
	"pending_review",
	"published",
	"cancelled",
	"completed",
	"rejected",
]);

// Partner event type
export const partnerEventTypeEnum = pg.pgEnum("partner_event_type", [
	"job_fair",
	"workshop",
	"webinar",
	"networking",
	"training",
	"open_day",
	"recruitment",
	"conference",
	"other",
]);

// Partner events (job fairs, workshops, etc.)
export const partnerEvent = pg.pgTable(
	"partner_event",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		partnerId: pg
			.uuid("partner_id")
			.notNull()
			.references(() => partnerProfile.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		titleFr: pg.text("title_fr"),
		description: pg.text("description").notNull(),
		descriptionFr: pg.text("description_fr"),
		eventType: partnerEventTypeEnum("event_type").notNull(),
		format: pg.text("format").notNull(), // in_person, online, hybrid
		location: pg.text("location"), // For in-person events
		address: pg.text("address"),
		city: pg.text("city"),
		onlineUrl: pg.text("online_url"), // For online events
		startDate: pg.timestamp("start_date", { withTimezone: true }).notNull(),
		endDate: pg.timestamp("end_date", { withTimezone: true }).notNull(),
		registrationDeadline: pg.timestamp("registration_deadline", { withTimezone: true }),
		capacity: pg.integer("capacity"),
		isFree: pg.boolean("is_free").notNull().default(true),
		price: pg.integer("price"), // MAD
		targetAudience: pg.jsonb("target_audience").$type<string[]>(), // students, graduates, professionals
		fields: pg.jsonb("fields").$type<string[]>(), // healthcare, industrial, hse
		speakers: pg.jsonb("speakers").$type<
			{
				name: string;
				title: string;
				company?: string;
				photo?: string;
			}[]
		>(),
		agenda: pg.jsonb("agenda").$type<
			{
				time: string;
				title: string;
				description?: string;
			}[]
		>(),
		requirements: pg.jsonb("requirements").$type<string[]>(),
		image: pg.text("image"),
		status: partnerEventStatusEnum("status").notNull().default("draft"),
		publishedAt: pg.timestamp("published_at", { withTimezone: true }),
		reviewedAt: pg.timestamp("reviewed_at", { withTimezone: true }),
		reviewedBy: pg.uuid("reviewed_by").references(() => user.id),
		rejectionReason: pg.text("rejection_reason"),
		// Stats
		viewCount: pg.integer("view_count").notNull().default(0),
		registrationCount: pg.integer("registration_count").notNull().default(0),
		attendeeCount: pg.integer("attendee_count").notNull().default(0),
		isFeatured: pg.boolean("is_featured").notNull().default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.partnerId),
		pg.index().on(t.status),
		pg.index().on(t.eventType),
		pg.index().on(t.startDate),
		pg.index().on(t.city),
	],
);

// Event registrations
export const partnerEventRegistration = pg.pgTable(
	"partner_event_registration",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		eventId: pg
			.uuid("event_id")
			.notNull()
			.references(() => partnerEvent.id, { onDelete: "cascade" }),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		status: pg.text("status").notNull().default("registered"), // registered, confirmed, cancelled, attended, no_show
		notes: pg.text("notes"),
		attendedAt: pg.timestamp("attended_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg.timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.eventId),
		pg.index().on(t.userId),
		pg.index().on(t.status),
		pg.uniqueIndex().on(t.eventId, t.userId),
	],
);

// Saved jobs for users
export const savedJob = pg.pgTable(
	"saved_job",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		jobId: pg
			.uuid("job_id")
			.notNull()
			.references(() => partnerJobPosting.id, { onDelete: "cascade" }),
		notes: pg.text("notes"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.uniqueIndex().on(t.userId, t.jobId)],
);

// ============================================
// INTERVIEW CHECKLIST REFERENCE DATA
// ============================================

// Interview checklist category type
export type InterviewChecklistCategory = "pre_interview" | "day_of" | "post_interview";

// Interview checklist reference table - stores checklist item definitions (reference data)
export const interviewChecklistReference = pg.pgTable(
	"interview_checklist_reference",
	{
		id: pg.text("id").primaryKey(),
		category: pg.text("category").notNull(), // 'pre_interview' | 'day_of' | 'post_interview'
		title: pg.text("title").notNull(),
		titleFr: pg.text("title_fr"),
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		tip: pg.text("tip"),
		tipFr: pg.text("tip_fr"),
		link: pg.text("link"),
		linkLabel: pg.text("link_label"),
		icon: pg.text("icon"),
		sortOrder: pg.integer("sort_order"),
		isActive: pg.boolean("is_active").default(true).notNull(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.category), pg.index().on(t.isActive), pg.index().on(t.category, t.sortOrder)],
);

// ============================================
// MENTOR MESSAGING TABLES
// ============================================

// Mentor message table for communication between users and mentors
export const mentorMessage = pg.pgTable(
	"mentor_message",
	{
		id: pg.text("id").primaryKey(),
		senderId: pg
			.uuid("sender_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		receiverId: pg
			.uuid("receiver_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		mentorConnectionId: pg.text("mentor_connection_id"),
		subject: pg.text("subject"),
		content: pg.text("content").notNull(),
		isRead: pg.boolean("is_read").default(false).notNull(),
		readAt: pg.timestamp("read_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.senderId),
		pg.index().on(t.receiverId),
		pg.index().on(t.senderId, t.receiverId),
		pg.index().on(t.receiverId, t.isRead),
		pg.index().on(t.createdAt.desc()),
	],
);

// ============================================
// CERTIFICATION LIBRARY (Recommended Certifications)
// ============================================

// Certification library table - stores recommended certifications that users can browse and add to their goals
export const certificationLibrary = pg.pgTable(
	"certification_library",
	{
		id: pg.text("id").primaryKey(),
		name: pg.text("name").notNull(),
		nameFr: pg.text("name_fr"),
		provider: pg.text("provider").notNull(),
		field: pg.text("field").notNull(), // healthcare, industrial, hse, management, technical, language
		level: pg.text("level").default("intermediate"), // beginner, intermediate, advanced
		duration: pg.text("duration"),
		cost: pg.text("cost"),
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		skills: pg.text("skills").array(),
		prerequisites: pg.text("prerequisites").array(),
		url: pg.text("url"),
		isRecommended: pg.boolean("is_recommended").default(false),
		isActive: pg.boolean("is_active").default(true).notNull(),
		sortOrder: pg.integer("sort_order"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.field),
		pg.index().on(t.level),
		pg.index().on(t.isActive),
		pg.index().on(t.isRecommended),
		pg.index().on(t.field, t.isActive),
	],
);

// ============================================
// CAREER ROLE REQUIREMENTS
// ============================================

// Career role requirement - target roles for gap analysis
export const careerRoleRequirement = pg.pgTable(
	"career_role_requirement",
	{
		id: pg.text("id").primaryKey(),
		role: pg.text("role").notNull(),
		roleFr: pg.text("role_fr"),
		field: pg.text("field").notNull(), // healthcare, industrial, hse, technology, general
		experienceLevel: pg.text("experience_level").default("entry"), // entry, mid, senior
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		salaryMin: pg.integer("salary_min"),
		salaryMax: pg.integer("salary_max"),
		demandLevel: pg.text("demand_level").default("medium"), // low, medium, high
		isActive: pg.boolean("is_active").default(true).notNull(),
		sortOrder: pg.integer("sort_order"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.field),
		pg.index().on(t.demandLevel),
		pg.index().on(t.isActive),
		pg.index().on(t.field, t.isActive),
	],
);

// Skills required for each role with importance weight
export const careerRoleSkill = pg.pgTable(
	"career_role_skill",
	{
		id: pg.text("id").primaryKey(),
		roleId: pg
			.text("role_id")
			.notNull()
			.references(() => careerRoleRequirement.id, { onDelete: "cascade" }),
		skillName: pg.text("skill_name").notNull(),
		skillNameFr: pg.text("skill_name_fr"),
		category: pg.text("category").default("technical"), // technical, soft, languages, certifications, tools
		requiredLevel: pg.integer("required_level").default(3), // 1-5
		importance: pg.text("importance").default("important"), // critical, important, nice-to-have
		industryBenchmark: pg.numeric("industry_benchmark", { precision: 3, scale: 1 }).default("3.0"),
		isRequired: pg.boolean("is_required").default(false),
		sortOrder: pg.integer("sort_order"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.roleId), pg.index().on(t.category), pg.index().on(t.importance)],
);

// ============================================
// BRANDING EXAMPLES TABLE
// ============================================

// Branding example table - stores example suggestions for brand wizard
export const brandingExample = pg.pgTable(
	"branding_example",
	{
		id: pg.text("id").primaryKey(),
		category: pg.text("category").notNull(), // profession, audience, strength, value, personality
		value: pg.text("value").notNull(),
		valueFr: pg.text("value_fr"),
		field: pg.text("field"), // Optional field association (healthcare, industrial, hse, general)
		isActive: pg.boolean("is_active").default(true).notNull(),
		sortOrder: pg.integer("sort_order"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.category),
		pg.index().on(t.category, t.isActive),
		pg.index().on(t.field),
		pg.index().on(t.category, t.field, t.isActive),
	],
);

// ============================================
// INTERVIEW SUCCESS TRACKING TABLES
// ============================================

// Interview performance tracking table
export const interviewPerformance = pg.pgTable(
	"interview_performance",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		sessionId: pg.text("session_id"), // Reference to interview session
		overallScore: pg.integer("overall_score"), // 0-100
		confidenceScore: pg.integer("confidence_score"), // 0-100
		clarityScore: pg.integer("clarity_score"), // 0-100
		relevanceScore: pg.integer("relevance_score"), // 0-100
		technicalScore: pg.integer("technical_score"), // 0-100
		communicationScore: pg.integer("communication_score"), // 0-100
		strengths: pg.jsonb("strengths").$type<string[]>().default([]),
		improvements: pg.jsonb("improvements").$type<string[]>().default([]),
		aiAnalysis: pg.text("ai_analysis"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.createdAt.desc()), pg.index().on(t.sessionId)],
);

// Interview goal preparation status enum (for interview tracking)
export const interviewGoalPrepStatusEnum = pg.pgEnum("interview_goal_prep_status", [
	"not_started",
	"preparing",
	"practicing",
	"ready",
	"completed",
]);

// Interview goal outcome enum
export const interviewGoalOutcomeEnum = pg.pgEnum("interview_goal_outcome", [
	"offered",
	"rejected",
	"pending",
	"withdrawn",
]);

// Interview goal table
export const interviewGoal = pg.pgTable(
	"interview_goal",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		targetRole: pg.text("target_role"),
		targetCompany: pg.text("target_company"),
		interviewDate: pg.timestamp("interview_date", { withTimezone: true }),
		preparationStatus: interviewGoalPrepStatusEnum("preparation_status").default("not_started"),
		practiceCount: pg.integer("practice_count").default(0),
		targetPracticeCount: pg.integer("target_practice_count").default(10),
		notes: pg.text("notes"),
		completed: pg.boolean("completed").default(false),
		outcome: interviewGoalOutcomeEnum("outcome"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.completed),
		pg.index().on(t.userId, t.interviewDate),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// TypeScript types for interview tracking
export type InterviewPerformanceStrengths = string[];
export type InterviewPerformanceImprovements = string[];
export type InterviewGoalOutcome = "offered" | "rejected" | "pending" | "withdrawn";

// ============================================
// JOB RECOMMENDATION SYSTEM
// ============================================

// Job recommendation status enum
export const jobRecommendationStatusEnum = pg.pgEnum("job_recommendation_status", [
	"new",
	"viewed",
	"applied",
	"saved",
	"dismissed",
]);

// Job recommendation reasons type
export type JobRecommendationReasons = {
	matched: string[];
	missingSkills?: string[];
	highlights?: string[];
};

// Job recommendation table - stores AI-generated job recommendations for users
export const jobRecommendation = pg.pgTable(
	"job_recommendation",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		jobId: pg.text("job_id").notNull(), // Can reference jobListing or partnerJobPosting
		jobSource: pg.text("job_source").default("partner"), // partner, aggregated, external
		matchScore: pg.integer("match_score").notNull(), // 0-100
		skillMatchScore: pg.integer("skill_match_score"),
		experienceMatchScore: pg.integer("experience_match_score"),
		locationMatchScore: pg.integer("location_match_score"),
		salaryMatchScore: pg.integer("salary_match_score"),
		reasons: pg.jsonb("reasons").$type<JobRecommendationReasons>(),
		status: jobRecommendationStatusEnum("status").notNull().default("new"),
		viewedAt: pg.timestamp("viewed_at", { withTimezone: true }),
		appliedAt: pg.timestamp("applied_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.jobId),
		pg.index().on(t.status),
		pg.index().on(t.matchScore.desc()),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.matchScore.desc()),
		pg.uniqueIndex().on(t.userId, t.jobId),
	],
);

// User job preferences table - stores user's job search preferences
export const userJobPreference = pg.pgTable(
	"user_job_preference",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		preferredFields: pg.text("preferred_fields").array(), // healthcare, industrial, hse, general
		preferredLocations: pg.text("preferred_locations").array(), // city names
		preferredRegions: pg.text("preferred_regions").array(), // Casablanca-Settat, Rabat-Sale, etc.
		minSalary: pg.integer("min_salary"), // MAD per year
		maxSalary: pg.integer("max_salary"),
		jobTypes: pg.text("job_types").array(), // full_time, part_time, contract, internship
		experienceLevel: pg.text("experience_level"), // entry, mid, senior, executive
		willingToRelocate: pg.boolean("willing_to_relocate").default(false),
		remotePreference: pg.text("remote_preference").default("hybrid"), // onsite, remote, hybrid
		keywords: pg.text("keywords").array(), // Custom keywords to match
		excludedCompanies: pg.text("excluded_companies").array(), // Companies to exclude
		prioritySkills: pg.text("priority_skills").array(), // Skills to prioritize in matching
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

// TypeScript types for job recommendation system
export type JobRecommendation = typeof jobRecommendation.$inferSelect;
export type NewJobRecommendation = typeof jobRecommendation.$inferInsert;
export type UserJobPreference = typeof userJobPreference.$inferSelect;
export type NewUserJobPreference = typeof userJobPreference.$inferInsert;
export type JobRecommendationStatus = "new" | "viewed" | "applied" | "saved" | "dismissed";

// ============================================
// LEARNING PATH TABLES
// ============================================

// Learning path status enum
export const learningPathStatusEnum = pg.pgEnum("learning_path_status", ["not_started", "in_progress", "completed"]);

// Learning path priority enum
export const learningPathPriorityEnum = pg.pgEnum("learning_path_priority", ["low", "medium", "high", "critical"]);

// TypeScript types for learning path
export type LearningPathStatus = "not_started" | "in_progress" | "completed";
export type LearningPathPriority = "low" | "medium" | "high" | "critical";

// Learning resource type stored in JSONB
export type LearningPathResource = {
	id: string;
	title: string;
	titleFr?: string;
	type: "course" | "book" | "certification" | "tutorial" | "practice" | "mentorship" | "video" | "article";
	platform?: string;
	url?: string;
	duration?: string;
	cost?: "free" | "paid" | "subscription";
	difficulty?: "beginner" | "intermediate" | "advanced";
	rating?: number;
	completed?: boolean;
	completedAt?: string;
};

// Learning skill type stored in JSONB
export type LearningPathSkill = {
	name: string;
	nameFr?: string;
	category: "technical" | "soft" | "languages" | "certifications" | "tools";
	currentLevel: number;
	targetLevel: number;
	priority: "critical" | "important" | "nice-to-have";
	estimatedWeeks: number;
	resources?: LearningPathResource[];
};

// Learning milestone type stored in JSONB
export type LearningPathMilestone = {
	id: string;
	title: string;
	titleFr?: string;
	description?: string;
	targetDate?: string;
	completed: boolean;
	completedAt?: string;
	skills?: string[];
};

// Learning path table - stores user's AI-generated learning paths
export const learningPath = pg.pgTable(
	"learning_path",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		targetRoleId: pg.text("target_role_id"),
		title: pg.text("title").notNull(),
		titleFr: pg.text("title_fr"),
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		estimatedDuration: pg.text("estimated_duration"),
		priority: learningPathPriorityEnum("priority").default("medium"),
		status: learningPathStatusEnum("status").default("not_started"),
		progress: pg.integer("progress").default(0), // 0-100
		skills: pg.jsonb("skills").$type<LearningPathSkill[]>().default([]),
		resources: pg.jsonb("resources").$type<LearningPathResource[]>().default([]),
		milestones: pg.jsonb("milestones").$type<LearningPathMilestone[]>().default([]),
		aiGenerated: pg.boolean("ai_generated").default(false),
		aiAnalysis: pg.text("ai_analysis"), // Store AI analysis/recommendations
		startedAt: pg.timestamp("started_at", { withTimezone: true }),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.targetRoleId),
		pg.index().on(t.userId, t.priority),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// Skill progress table - tracks individual skill progress
export const skillProgress = pg.pgTable(
	"skill_progress",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		skillName: pg.text("skill_name").notNull(),
		skillNameFr: pg.text("skill_name_fr"),
		category: pg.text("category").default("technical"), // technical, soft, languages, certifications, tools
		currentLevel: pg.integer("current_level").default(1), // 1-5
		targetLevel: pg.integer("target_level").default(3), // 1-5
		progress: pg.integer("progress").default(0), // 0-100
		hoursInvested: pg.integer("hours_invested").default(0),
		lastPracticed: pg.timestamp("last_practiced", { withTimezone: true }),
		practiceStreak: pg.integer("practice_streak").default(0), // Days in a row
		notes: pg.text("notes"),
		learningPathId: pg.text("learning_path_id").references(() => learningPath.id, { onDelete: "set null" }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.unique().on(t.userId, t.skillName),
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.category),
		pg.index().on(t.userId, t.progress),
		pg.index().on(t.learningPathId),
	],
);

// TypeScript types for learning path tables
export type LearningPath = typeof learningPath.$inferSelect;
export type NewLearningPath = typeof learningPath.$inferInsert;
export type SkillProgress = typeof skillProgress.$inferSelect;
export type NewSkillProgress = typeof skillProgress.$inferInsert;

// ============================================================================
// VOICE INTERVIEW PANEL SYSTEM
// ============================================================================

// Interviewer personality type for realistic panel experience
export type InterviewerPersonalityType = "friendly" | "serious" | "challenging" | "supportive" | "analytical";

// Interviewer role type
export type InterviewerRoleType =
	| "HR Manager"
	| "Technical Lead"
	| "CEO"
	| "Team Member"
	| "Department Head"
	| "Recruiter";

// Speaking style type
export type SpeakingStyleType = "formal" | "casual" | "technical" | "conversational";

// Focus areas type
export type FocusAreaType =
	| "behavioral"
	| "technical"
	| "cultural"
	| "leadership"
	| "problem_solving"
	| "communication";

// OpenAI voice IDs
export type OpenAIVoiceId =
	| "alloy"
	| "echo"
	| "fable"
	| "onyx"
	| "nova"
	| "shimmer"
	| "coral"
	| "sage"
	| "ash"
	| "ballad"
	| "verse";

// Voice interview session type enum
export const voiceInterviewTypeEnum = pg.pgEnum("voice_interview_type", ["single", "panel"]);

// Voice interview session status enum
export const voiceInterviewStatusEnum = pg.pgEnum("voice_interview_status", [
	"pending",
	"in_progress",
	"completed",
	"cancelled",
]);

// Voice interview difficulty enum
export const voiceInterviewDifficultyEnum = pg.pgEnum("voice_interview_difficulty", ["easy", "medium", "hard"]);

// Voice interview language enum
export const voiceInterviewLanguageEnum = pg.pgEnum("voice_interview_language", ["fr", "en", "ar", "darija"]);

// Interviewer personality enum
export const interviewerPersonalityEnum = pg.pgEnum("interviewer_personality", [
	"friendly",
	"serious",
	"challenging",
	"supportive",
	"analytical",
]);

// Interviewer speaking style enum
export const interviewerSpeakingStyleEnum = pg.pgEnum("interviewer_speaking_style", [
	"formal",
	"casual",
	"technical",
	"conversational",
]);

// Transcript message type
export type VoiceInterviewTranscriptMessage = {
	id: string;
	role: "user" | "interviewer";
	personaId?: string;
	personaName?: string;
	content: string;
	timestamp: string;
	duration?: number; // Audio duration in seconds
	audioUrl?: string;
};

// Feedback category type
export type VoiceInterviewFeedbackCategory = {
	category: string;
	categoryFr?: string;
	score: number;
	strengths: string[];
	areasForImprovement: string[];
	suggestions: string[];
};

// Overall feedback type
export type VoiceInterviewFeedback = {
	overallImpression: string;
	overallImpressionFr?: string;
	categories: VoiceInterviewFeedbackCategory[];
	keyTakeaways: string[];
	keyTakeawaysFr?: string[];
	recommendedActions: string[];
	recommendedActionsFr?: string[];
	panelistFeedback?: {
		personaId: string;
		personaName: string;
		score: number;
		feedback: string;
		feedbackFr?: string;
	}[];
};

// Sample questions type for personas
export type InterviewerSampleQuestion = {
	question: string;
	questionFr?: string;
	type: "behavioral" | "technical" | "situational" | "cultural" | "follow_up";
	difficulty?: "easy" | "medium" | "hard";
};

// Voice interview session table
export const voiceInterviewSession = pg.pgTable(
	"voice_interview_session",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: voiceInterviewTypeEnum("type").notNull().default("single"),
		targetRole: pg.text("target_role"),
		targetCompany: pg.text("target_company"),
		difficulty: voiceInterviewDifficultyEnum("difficulty").default("medium"),
		language: voiceInterviewLanguageEnum("language").default("fr"),
		panelSize: pg.integer("panel_size").default(1),
		status: voiceInterviewStatusEnum("status").default("pending"),
		duration: pg.integer("duration"), // in seconds
		overallScore: pg.integer("overall_score"), // 0-100
		transcript: pg.jsonb("transcript").$type<VoiceInterviewTranscriptMessage[]>().default([]),
		feedback: pg.jsonb("feedback").$type<VoiceInterviewFeedback | null>(),
		recordingUrl: pg.text("recording_url"),
		// Session caching for cost optimization
		realtimeToken: pg.text("realtime_token"), // Cached ephemeral token
		realtimeTokenExpiresAt: pg.timestamp("realtime_token_expires_at", { withTimezone: true }),
		// Resumable session state
		pausedAt: pg.timestamp("paused_at", { withTimezone: true }),
		currentQuestionIndex: pg.integer("current_question_index").default(0),
		sessionState: pg.jsonb("session_state").$type<Record<string, unknown>>(), // Additional state for resume
		startedAt: pg.timestamp("started_at", { withTimezone: true }),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.type),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// Interviewer persona table - defines the panel members
export const interviewerPersona = pg.pgTable(
	"interviewer_persona",
	{
		id: pg.text("id").primaryKey(),
		name: pg.text("name").notNull(),
		nameFr: pg.text("name_fr"),
		role: pg.text("role").notNull(), // HR Manager, Technical Lead, CEO, Team Member
		roleFr: pg.text("role_fr"),
		personality: interviewerPersonalityEnum("personality").notNull().default("friendly"),
		voiceId: pg.text("voice_id").notNull(), // OpenAI voice: alloy, echo, fable, onyx, nova, shimmer, coral, sage, ash, ballad, verse
		avatar: pg.text("avatar"),
		speakingStyle: interviewerSpeakingStyleEnum("speaking_style").default("formal"),
		focusAreas: pg.text("focus_areas").array().default([]), // behavioral, technical, cultural, leadership
		sampleQuestions: pg.jsonb("sample_questions").$type<InterviewerSampleQuestion[]>().default([]),
		systemPrompt: pg.text("system_prompt"), // AI system prompt for this persona
		bio: pg.text("bio"), // Background story for the persona
		bioFr: pg.text("bio_fr"),
		yearsExperience: pg.integer("years_experience"),
		industry: pg.text("industry"), // Healthcare, Tech, Industrial, etc.
		isActive: pg.boolean("is_active").notNull().default(true),
		sortOrder: pg.integer("sort_order").default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.isActive), pg.index().on(t.personality), pg.index().on(t.role)],
);

// Panel composition for each session - links sessions to personas
export const voiceInterviewPanelist = pg.pgTable(
	"voice_interview_panelist",
	{
		id: pg.text("id").primaryKey(),
		sessionId: pg
			.text("session_id")
			.notNull()
			.references(() => voiceInterviewSession.id, { onDelete: "cascade" }),
		personaId: pg
			.text("persona_id")
			.notNull()
			.references(() => interviewerPersona.id, { onDelete: "restrict" }),
		isLead: pg.boolean("is_lead").notNull().default(false),
		questionsAsked: pg.integer("questions_asked").notNull().default(0),
		speakingTime: pg.integer("speaking_time").notNull().default(0), // seconds
		score: pg.integer("score"), // Individual score from this panelist
		notes: pg.text("notes"), // Panelist-specific feedback
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.sessionId), pg.index().on(t.personaId), pg.unique().on(t.sessionId, t.personaId)],
);

// TypeScript types for voice interview tables
export type VoiceInterviewSession = typeof voiceInterviewSession.$inferSelect;
export type NewVoiceInterviewSession = typeof voiceInterviewSession.$inferInsert;
export type InterviewerPersona = typeof interviewerPersona.$inferSelect;
export type NewInterviewerPersona = typeof interviewerPersona.$inferInsert;
export type VoiceInterviewPanelist = typeof voiceInterviewPanelist.$inferSelect;
export type NewVoiceInterviewPanelist = typeof voiceInterviewPanelist.$inferInsert;

// ============================================================================
// LINKEDIN CONTENT & POST SYSTEM
// ============================================================================

// LinkedIn post type enum
export const linkedinPostTypeEnum = pg.pgEnum("linkedin_post_type", [
	"career_update",
	"thought_leadership",
	"engagement",
	"story",
	"achievement",
	"tip",
	"question",
]);

// LinkedIn post tone enum
export const linkedinPostToneEnum = pg.pgEnum("linkedin_post_tone", [
	"professional",
	"friendly",
	"inspirational",
	"analytical",
	"conversational",
]);

// LinkedIn post status enum
export const linkedinPostStatusEnum = pg.pgEnum("linkedin_post_status", [
	"draft",
	"scheduled",
	"published",
	"archived",
]);

// LinkedIn generated post table
export const linkedinPost = pg.pgTable(
	"linkedin_post",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		postType: linkedinPostTypeEnum("post_type").notNull(),
		tone: linkedinPostToneEnum("tone").notNull().default("professional"),
		language: pg.text("language").notNull().default("fr"), // fr, en, ar, darija
		title: pg.text("title"),
		content: pg.text("content").notNull(),
		hashtags: pg.text("hashtags").array().default([]),
		aiPrompt: pg.text("ai_prompt"), // Original prompt used to generate
		status: linkedinPostStatusEnum("status").notNull().default("draft"),
		scheduledAt: pg.timestamp("scheduled_at", { withTimezone: true }),
		publishedAt: pg.timestamp("published_at", { withTimezone: true }),
		engagementLikes: pg.integer("engagement_likes").default(0),
		engagementComments: pg.integer("engagement_comments").default(0),
		engagementShares: pg.integer("engagement_shares").default(0),
		isFavorite: pg.boolean("is_favorite").default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.postType),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.userId, t.isFavorite),
	],
);

// LinkedIn networking message template type enum
export const linkedinMessageTypeEnum = pg.pgEnum("linkedin_message_type", [
	"connection_request",
	"follow_up",
	"informational_interview",
	"thank_you",
	"referral_request",
	"congratulations",
	"introduction",
]);

// LinkedIn networking message formality enum
export const linkedinMessageFormalityEnum = pg.pgEnum("linkedin_message_formality", [
	"formal",
	"semi_formal",
	"casual",
]);

// LinkedIn networking message table
export const linkedinMessage = pg.pgTable(
	"linkedin_message",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		messageType: linkedinMessageTypeEnum("message_type").notNull(),
		formality: linkedinMessageFormalityEnum("formality").notNull().default("semi_formal"),
		language: pg.text("language").notNull().default("fr"),
		recipientName: pg.text("recipient_name"),
		recipientRole: pg.text("recipient_role"),
		recipientCompany: pg.text("recipient_company"),
		context: pg.text("context"), // Why connecting, shared connection, event, etc.
		subject: pg.text("subject"), // For email-style messages
		content: pg.text("content").notNull(),
		aiPrompt: pg.text("ai_prompt"),
		isSent: pg.boolean("is_sent").default(false),
		sentAt: pg.timestamp("sent_at", { withTimezone: true }),
		responseReceived: pg.boolean("response_received").default(false),
		responseReceivedAt: pg.timestamp("response_received_at", { withTimezone: true }),
		isFavorite: pg.boolean("is_favorite").default(false),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.messageType),
		pg.index().on(t.userId, t.isSent),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// LinkedIn profile analysis history
export const linkedinProfileAnalysis = pg.pgTable(
	"linkedin_profile_analysis",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		headline: pg.text("headline"),
		summary: pg.text("summary"),
		experience: pg.text("experience"), // Pasted experience text
		overallScore: pg.integer("overall_score"), // 0-100
		headlineScore: pg.integer("headline_score"),
		summaryScore: pg.integer("summary_score"),
		keywordScore: pg.integer("keyword_score"),
		readabilityScore: pg.integer("readability_score"),
		suggestions: pg.jsonb("suggestions").$type<{
			headline: string[];
			summary: string[];
			keywords: string[];
			general: string[];
		}>(),
		missingKeywords: pg.text("missing_keywords").array().default([]),
		strongPoints: pg.text("strong_points").array().default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.createdAt.desc())],
);

// TypeScript types for LinkedIn content tables
export type LinkedInPost = typeof linkedinPost.$inferSelect;
export type NewLinkedInPost = typeof linkedinPost.$inferInsert;
export type LinkedInMessage = typeof linkedinMessage.$inferSelect;
export type NewLinkedInMessage = typeof linkedinMessage.$inferInsert;
export type LinkedInProfileAnalysis = typeof linkedinProfileAnalysis.$inferSelect;
export type NewLinkedInProfileAnalysis = typeof linkedinProfileAnalysis.$inferInsert;

// ============================================================================
// CAREER COACHING SYSTEM
// ============================================================================

// Career coaching session status enum
export const coachingSessionStatusEnum = pg.pgEnum("coaching_session_status", [
	"scheduled",
	"in_progress",
	"completed",
	"cancelled",
]);

// Career coaching topic enum
export const coachingTopicEnum = pg.pgEnum("coaching_topic", [
	"resume_review",
	"interview_prep",
	"career_transition",
	"skill_development",
	"networking",
	"negotiation",
	"leadership",
	"work_life_balance",
	"job_search",
	"personal_branding",
]);

// Confidence level enum
export const confidenceLevelEnum = pg.pgEnum("confidence_level", ["very_low", "low", "moderate", "high", "very_high"]);

// Career coaching session table
export const coachingSession = pg.pgTable(
	"coaching_session",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		topic: coachingTopicEnum("topic").notNull(),
		status: coachingSessionStatusEnum("status").notNull().default("scheduled"),
		scheduledAt: pg.timestamp("scheduled_at", { withTimezone: true }),
		startedAt: pg.timestamp("started_at", { withTimezone: true }),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		duration: pg.integer("duration"), // in minutes
		notes: pg.text("notes"),
		aiSummary: pg.text("ai_summary"),
		actionItems: pg.text("action_items").array().default([]),
		nextSteps: pg.text("next_steps").array().default([]),
		confidenceBefore: confidenceLevelEnum("confidence_before"),
		confidenceAfter: confidenceLevelEnum("confidence_after"),
		rating: pg.integer("rating"), // 1-5 user satisfaction
		feedback: pg.text("feedback"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.topic),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// Career path milestone type
export type CareerMilestoneType = "education" | "certification" | "skill" | "experience" | "networking" | "achievement";

// Career path milestone status
export type CareerMilestoneStatus = "not_started" | "in_progress" | "completed" | "skipped";

// Career path milestone
export type CareerMilestone = {
	id: string;
	title: string;
	titleFr?: string;
	description?: string;
	type: CareerMilestoneType;
	status: CareerMilestoneStatus;
	targetDate?: string;
	completedDate?: string;
	progress: number; // 0-100
	resources?: string[];
	notes?: string;
};

// Career path table - user's career roadmap
export const careerPath = pg.pgTable(
	"career_path",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		currentRole: pg.text("current_role"),
		currentRoleFr: pg.text("current_role_fr"),
		targetRole: pg.text("target_role").notNull(),
		targetRoleFr: pg.text("target_role_fr"),
		targetIndustry: pg.text("target_industry"),
		targetCompany: pg.text("target_company"),
		targetSalary: pg.integer("target_salary"),
		targetDate: pg.timestamp("target_date", { withTimezone: true }),
		milestones: pg.jsonb("milestones").$type<CareerMilestone[]>().default([]),
		overallProgress: pg.integer("overall_progress").default(0), // 0-100
		isActive: pg.boolean("is_active").default(true),
		notes: pg.text("notes"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.isActive), pg.index().on(t.userId, t.createdAt.desc())],
);

// Skill gap item type
export type SkillGapItem = {
	skill: string;
	skillFr?: string;
	currentLevel: number; // 0-5
	requiredLevel: number; // 0-5
	priority: "high" | "medium" | "low";
	learningResources?: string[];
	estimatedHours?: number;
	progress: number; // 0-100
};

// Skill gap analysis table
export const skillGapAnalysis = pg.pgTable(
	"skill_gap_analysis",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		careerPathId: pg.text("career_path_id").references(() => careerPath.id, { onDelete: "cascade" }),
		targetRole: pg.text("target_role").notNull(),
		gaps: pg.jsonb("gaps").$type<SkillGapItem[]>().default([]),
		strengths: pg.text("strengths").array().default([]),
		recommendations: pg.text("recommendations").array().default([]),
		overallReadiness: pg.integer("overall_readiness").default(0), // 0-100
		aiAnalysis: pg.text("ai_analysis"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.careerPathId), pg.index().on(t.userId, t.createdAt.desc())],
);

// Weekly goal category enum
export const weeklyGoalCategoryEnum = pg.pgEnum("weekly_goal_category", [
	"applications",
	"networking",
	"skills",
	"interview_prep",
	"personal_branding",
	"research",
	"other",
]);

// Weekly goal status enum
export const weeklyGoalStatusEnum = pg.pgEnum("weekly_goal_status", ["pending", "in_progress", "completed", "missed"]);

// Weekly goal table
export const weeklyGoal = pg.pgTable(
	"weekly_goal",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		weekStartDate: pg.date("week_start_date").notNull(), // Monday of the week
		category: weeklyGoalCategoryEnum("category").notNull(),
		title: pg.text("title").notNull(),
		titleFr: pg.text("title_fr"),
		description: pg.text("description"),
		targetValue: pg.integer("target_value").default(1), // e.g., 5 applications
		currentValue: pg.integer("current_value").default(0),
		status: weeklyGoalStatusEnum("status").notNull().default("pending"),
		priority: pg.text("priority").default("medium"), // high, medium, low
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		notes: pg.text("notes"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.weekStartDate),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.category),
	],
);

// Confidence journal entry type enum
export const confidenceEntryTypeEnum = pg.pgEnum("confidence_entry_type", [
	"win",
	"challenge",
	"learning",
	"affirmation",
	"reflection",
]);

// Confidence journal table - for daily wins and reflections
export const confidenceJournal = pg.pgTable(
	"confidence_journal",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		entryType: confidenceEntryTypeEnum("entry_type").notNull(),
		entryDate: pg.date("entry_date").notNull(),
		title: pg.text("title").notNull(),
		content: pg.text("content").notNull(),
		mood: pg.integer("mood"), // 1-5 scale
		tags: pg.text("tags").array().default([]),
		isPrivate: pg.boolean("is_private").default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.entryDate),
		pg.index().on(t.userId, t.entryType),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// Daily affirmation table
export const dailyAffirmation = pg.pgTable(
	"daily_affirmation",
	{
		id: pg.text("id").primaryKey(),
		category: pg.text("category").notNull(), // career, confidence, motivation, success, resilience
		content: pg.text("content").notNull(),
		contentFr: pg.text("content_fr"),
		contentAr: pg.text("content_ar"),
		author: pg.text("author"),
		isActive: pg.boolean("is_active").default(true),
		sortOrder: pg.integer("sort_order").default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.category), pg.index().on(t.isActive)],
);

// User affirmation progress (which affirmations they've seen/liked)
export const userAffirmationProgress = pg.pgTable(
	"user_affirmation_progress",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		affirmationId: pg
			.text("affirmation_id")
			.notNull()
			.references(() => dailyAffirmation.id, { onDelete: "cascade" }),
		seenAt: pg.timestamp("seen_at", { withTimezone: true }).notNull().defaultNow(),
		isLiked: pg.boolean("is_liked").default(false),
		isSaved: pg.boolean("is_saved").default(false),
	},
	(t) => [
		pg.unique().on(t.userId, t.affirmationId),
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.isLiked),
		pg.index().on(t.userId, t.isSaved),
	],
);

// TypeScript types for career coaching tables
export type CoachingSession = typeof coachingSession.$inferSelect;
export type NewCoachingSession = typeof coachingSession.$inferInsert;
export type CareerPath = typeof careerPath.$inferSelect;
export type NewCareerPath = typeof careerPath.$inferInsert;
export type SkillGapAnalysis = typeof skillGapAnalysis.$inferSelect;
export type NewSkillGapAnalysis = typeof skillGapAnalysis.$inferInsert;
export type WeeklyGoal = typeof weeklyGoal.$inferSelect;
export type NewWeeklyGoal = typeof weeklyGoal.$inferInsert;
export type ConfidenceJournal = typeof confidenceJournal.$inferSelect;
export type NewConfidenceJournal = typeof confidenceJournal.$inferInsert;
export type DailyAffirmation = typeof dailyAffirmation.$inferSelect;
export type NewDailyAffirmation = typeof dailyAffirmation.$inferInsert;

// ============================================================================
// Career Quiz Tables
// ============================================================================

// Quiz type enum
export const quizTypeEnum = pg.pgEnum("quiz_type", ["career_assessment", "career_quiz", "remote_readiness"]);

// Quiz question type enum
export const questionTypeEnum = pg.pgEnum("question_type", ["multiple_choice", "scale"]);

// Career quiz questions
export const careerQuizQuestion = pg.pgTable(
	"career_quiz_question",
	{
		id: pg.text("id").primaryKey(),
		quizType: quizTypeEnum("quiz_type").notNull().default("career_assessment"),
		question: pg.text("question").notNull(),
		questionFr: pg.text("question_fr"),
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		category: pg.text("category").notNull(), // personality, interests, skills, work_preferences, values, moroccan_market, environment, stress, work_style, goals, communication, etc.
		type: questionTypeEnum("type").notNull().default("multiple_choice"),
		trait: pg.text("trait"), // teamwork, technical_aptitude, patient_care, safety_focus, leadership, etc.
		scaleMin: pg.text("scale_min"), // For scale type questions
		scaleMax: pg.text("scale_max"), // For scale type questions
		scaleMinFr: pg.text("scale_min_fr"),
		scaleMaxFr: pg.text("scale_max_fr"),
		isActive: pg.boolean("is_active").default(true),
		sortOrder: pg.integer("sort_order").default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
	},
	(t) => [
		pg.index().on(t.quizType),
		pg.index().on(t.category),
		pg.index().on(t.isActive),
		pg.index().on(t.quizType, t.sortOrder),
	],
);

// Career quiz options (for multiple choice questions)
export const careerQuizOption = pg.pgTable(
	"career_quiz_option",
	{
		id: pg.text("id").primaryKey(),
		questionId: pg
			.text("question_id")
			.notNull()
			.references(() => careerQuizQuestion.id, { onDelete: "cascade" }),
		text: pg.text("text").notNull(),
		textFr: pg.text("text_fr"),
		icon: pg.text("icon"), // Icon name string (e.g., "BuildingsIcon", "HardHatIcon")
		scores: pg.jsonb("scores").notNull().default({}), // Record<string, number> - trait scores
		sortOrder: pg.integer("sort_order").default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.questionId), pg.index().on(t.questionId, t.sortOrder)],
);

// User quiz results (stores completed quiz attempts)
export const userQuizResult = pg.pgTable(
	"user_quiz_result",
	{
		id: pg.text("id").primaryKey(),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		quizType: quizTypeEnum("quiz_type").notNull(),
		answers: pg.jsonb("answers").notNull().default([]), // Array of { questionId, optionId, scaleValue }
		personalityProfile: pg.jsonb("personality_profile").notNull().default({}), // Calculated trait scores
		topMatches: pg.jsonb("top_matches").notNull().default([]), // Array of matched programs/results
		completedAt: pg.timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.quizType), pg.index().on(t.completedAt)],
);

// TypeScript types for quiz tables
export type CareerQuizQuestion = typeof careerQuizQuestion.$inferSelect;
export type NewCareerQuizQuestion = typeof careerQuizQuestion.$inferInsert;
export type CareerQuizOption = typeof careerQuizOption.$inferSelect;
export type NewCareerQuizOption = typeof careerQuizOption.$inferInsert;
export type UserQuizResult = typeof userQuizResult.$inferSelect;
export type NewUserQuizResult = typeof userQuizResult.$inferInsert;

// ============================================
// STUDENT PROGRESS TRACKING TABLES
// ============================================

// Progress activity action enum
export const progressActivityActionEnum = pg.pgEnum("progress_activity_action", [
	"lesson_started",
	"lesson_completed",
	"quiz_taken",
	"skill_practiced",
	"resume_edited",
	"interview_practiced",
	"goal_set",
	"goal_achieved",
	"badge_earned",
	"module_completed",
	"resource_viewed",
	"feedback_received",
	"peer_review_given",
	"mentor_session",
	"certification_earned",
]);

// Badge type enum for gamification
export const badgeTypeEnum = pg.pgEnum("badge_type", [
	"first_resume",
	"resume_master",
	"interview_ready",
	"interview_champion",
	"skill_seeker",
	"skill_expert",
	"consistency_streak",
	"early_bird",
	"night_owl",
	"fast_learner",
	"perfectionist",
	"team_player",
	"mentor_helper",
	"goal_crusher",
	"certificate_collector",
]);

// Skill level enum
export const skillLevelEnum = pg.pgEnum("skill_level", [
	"beginner",
	"elementary",
	"intermediate",
	"upper_intermediate",
	"advanced",
	"expert",
]);

export type ProgressActivityAction =
	| "lesson_started"
	| "lesson_completed"
	| "quiz_taken"
	| "skill_practiced"
	| "resume_edited"
	| "interview_practiced"
	| "goal_set"
	| "goal_achieved"
	| "badge_earned"
	| "module_completed"
	| "resource_viewed"
	| "feedback_received"
	| "peer_review_given"
	| "mentor_session"
	| "certification_earned";

export type BadgeType =
	| "first_resume"
	| "resume_master"
	| "interview_ready"
	| "interview_champion"
	| "skill_seeker"
	| "skill_expert"
	| "consistency_streak"
	| "early_bird"
	| "night_owl"
	| "fast_learner"
	| "perfectionist"
	| "team_player"
	| "mentor_helper"
	| "goal_crusher"
	| "certificate_collector";

export type SkillLevel = "beginner" | "elementary" | "intermediate" | "upper_intermediate" | "advanced" | "expert";

// Student progress - overall progress metrics per student
export const studentProgress = pg.pgTable(
	"student_progress",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		overallScore: pg.integer("overall_score").notNull().default(0), // 0-100
		totalLessonsCompleted: pg.integer("total_lessons_completed").notNull().default(0),
		totalQuizzesTaken: pg.integer("total_quizzes_taken").notNull().default(0),
		totalPracticeTime: pg.integer("total_practice_time").notNull().default(0), // minutes
		currentStreak: pg.integer("current_streak").notNull().default(0), // days
		longestStreak: pg.integer("longest_streak").notNull().default(0),
		lastActivityDate: pg.date("last_activity_date"),
		resumeCompleteness: pg.integer("resume_completeness").notNull().default(0), // 0-100
		interviewReadiness: pg.integer("interview_readiness").notNull().default(0), // 0-100
		jobSearchReadiness: pg.integer("job_search_readiness").notNull().default(0), // 0-100
		weeklyGoalProgress: pg.integer("weekly_goal_progress").notNull().default(0), // 0-100
		weeklyGoalTarget: pg.integer("weekly_goal_target").notNull().default(5), // activities per week
		cohortId: pg.uuid("cohort_id"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.cohortId),
		pg.index().on(t.overallScore.desc()),
		pg.index().on(t.updatedAt.desc()),
	],
);

// Skill progression - tracks skill level changes over time (time series)
export const skillProgression = pg.pgTable(
	"skill_progression",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		skillId: pg.text("skill_id").notNull(), // reference to skill name/category
		skillName: pg.text("skill_name").notNull(),
		skillNameFr: pg.text("skill_name_fr"),
		previousLevel: skillLevelEnum("previous_level"),
		currentLevel: skillLevelEnum("current_level").notNull(),
		score: pg.integer("score").notNull().default(0), // 0-100 detailed score
		assessmentType: pg.text("assessment_type").notNull(), // quiz, practice, mentor, self
		notes: pg.text("notes"),
		recordedAt: pg.timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.skillId),
		pg.index().on(t.userId, t.recordedAt.desc()),
		pg.index().on(t.skillId, t.recordedAt.desc()),
	],
);

// Activity log - detailed student actions for analysis
export const progressActivityLog = pg.pgTable(
	"progress_activity_log",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		action: progressActivityActionEnum("action").notNull(),
		entityType: pg.text("entity_type"), // resume, interview, skill, lesson, etc.
		entityId: pg.text("entity_id"),
		entityName: pg.text("entity_name"),
		durationMinutes: pg.integer("duration_minutes"),
		scoreAchieved: pg.integer("score_achieved"), // 0-100 if applicable
		metadata: pg.jsonb("metadata").$type<Record<string, unknown>>().default({}), // flexible additional data
		sessionId: pg.text("session_id"), // group activities in same session
		deviceType: pg.text("device_type"), // desktop, mobile, tablet
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.action),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.action, t.createdAt.desc()),
		pg.index().on(t.sessionId),
	],
);

// Achievement badge - gamification badges earned by students
export const achievementBadge = pg.pgTable(
	"achievement_badge",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		badgeType: badgeTypeEnum("badge_type").notNull(),
		badgeName: pg.text("badge_name").notNull(),
		badgeNameFr: pg.text("badge_name_fr"),
		badgeDescription: pg.text("badge_description").notNull(),
		badgeDescriptionFr: pg.text("badge_description_fr"),
		badgeIcon: pg.text("badge_icon").notNull(), // icon identifier
		tier: pg.text("tier").notNull().default("bronze"), // bronze, silver, gold, platinum
		xpAwarded: pg.integer("xp_awarded").notNull().default(0),
		criteriaValue: pg.integer("criteria_value"), // the threshold that was met
		isNew: pg.boolean("is_new").notNull().default(true),
		earnedAt: pg.timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.unique().on(t.userId, t.badgeType, t.tier),
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.earnedAt.desc()),
		pg.index().on(t.badgeType),
	],
);

// Student cohort - group students for comparative analysis
export const studentCohort = pg.pgTable(
	"student_cohort",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		name: pg.text("name").notNull(),
		nameFr: pg.text("name_fr"),
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		cohortType: pg.text("cohort_type").notNull(), // program, semester, skill_level, custom
		programId: pg.text("program_id"), // IMTA program reference if applicable
		startDate: pg.date("start_date"),
		endDate: pg.date("end_date"),
		isActive: pg.boolean("is_active").notNull().default(true),
		memberCount: pg.integer("member_count").notNull().default(0),
		avgProgress: pg.integer("avg_progress").notNull().default(0), // 0-100
		metadata: pg.jsonb("metadata").$type<Record<string, unknown>>().default({}),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.cohortType),
		pg.index().on(t.programId),
		pg.index().on(t.isActive),
		pg.index().on(t.startDate),
	],
);

// Cohort membership - links students to cohorts
export const cohortMembership = pg.pgTable(
	"cohort_membership",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		cohortId: pg
			.uuid("cohort_id")
			.notNull()
			.references(() => studentCohort.id, { onDelete: "cascade" }),
		role: pg.text("role").notNull().default("member"), // member, leader, mentor
		joinedAt: pg.timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
		leftAt: pg.timestamp("left_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.unique().on(t.userId, t.cohortId),
		pg.index().on(t.userId),
		pg.index().on(t.cohortId),
		pg.index().on(t.cohortId, t.role),
	],
);

// Weekly progress snapshot - for tracking progress over time
export const weeklyProgressSnapshot = pg.pgTable(
	"weekly_progress_snapshot",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		weekStartDate: pg.date("week_start_date").notNull(),
		weekEndDate: pg.date("week_end_date").notNull(),
		overallScore: pg.integer("overall_score").notNull(),
		lessonsCompleted: pg.integer("lessons_completed").notNull().default(0),
		practiceMinutes: pg.integer("practice_minutes").notNull().default(0),
		quizzesTaken: pg.integer("quizzes_taken").notNull().default(0),
		avgQuizScore: pg.integer("avg_quiz_score"),
		badgesEarned: pg.integer("badges_earned").notNull().default(0),
		streakDays: pg.integer("streak_days").notNull().default(0),
		topSkillImproved: pg.text("top_skill_improved"),
		cohortRank: pg.integer("cohort_rank"),
		cohortPercentile: pg.integer("cohort_percentile"), // 0-100
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.unique().on(t.userId, t.weekStartDate),
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.weekStartDate.desc()),
		pg.index().on(t.weekStartDate),
	],
);

// TypeScript types for student progress tables
export type StudentProgress = typeof studentProgress.$inferSelect;
export type NewStudentProgress = typeof studentProgress.$inferInsert;
export type SkillProgression = typeof skillProgression.$inferSelect;
export type NewSkillProgression = typeof skillProgression.$inferInsert;
export type ProgressActivityLog = typeof progressActivityLog.$inferSelect;
export type NewProgressActivityLog = typeof progressActivityLog.$inferInsert;
export type AchievementBadge = typeof achievementBadge.$inferSelect;
export type NewAchievementBadge = typeof achievementBadge.$inferInsert;
export type StudentCohort = typeof studentCohort.$inferSelect;
export type NewStudentCohort = typeof studentCohort.$inferInsert;
export type CohortMembership = typeof cohortMembership.$inferSelect;
export type NewCohortMembership = typeof cohortMembership.$inferInsert;
export type WeeklyProgressSnapshot = typeof weeklyProgressSnapshot.$inferSelect;
export type NewWeeklyProgressSnapshot = typeof weeklyProgressSnapshot.$inferInsert;

// ============================================
// INTERVIEW ANALYTICS TABLES
// ============================================

// Interview weakness type enum
export const weaknessTypeEnum = pg.pgEnum("weakness_type", [
	"communication",
	"technical",
	"behavioral",
	"confidence",
	"structure",
	"time_management",
	"stress_handling",
	"knowledge_gap",
]);

// Interview weakness severity enum
export const weaknessSeverityEnum = pg.pgEnum("weakness_severity", ["critical", "major", "minor"]);

// TypeScript types for weakness tracking
export type WeaknessType =
	| "communication"
	| "technical"
	| "behavioral"
	| "confidence"
	| "structure"
	| "time_management"
	| "stress_handling"
	| "knowledge_gap";
export type WeaknessSeverity = "critical" | "major" | "minor";

// Interview weakness - identified weak areas from interview sessions
export const interviewWeakness = pg.pgTable(
	"interview_weakness",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		sessionId: pg.uuid("session_id").references(() => interviewSession.id, { onDelete: "set null" }),
		weaknessType: weaknessTypeEnum("weakness_type").notNull(),
		severity: weaknessSeverityEnum("severity").notNull().default("minor"),
		field: interviewFieldEnum("field"),
		title: pg.text("title").notNull(),
		titleFr: pg.text("title_fr"),
		description: pg.text("description").notNull(),
		descriptionFr: pg.text("description_fr"),
		occurrenceCount: pg.integer("occurrence_count").notNull().default(1),
		exampleQuestions: pg.jsonb("example_questions").$type<string[]>().default([]),
		suggestedResources: pg
			.jsonb("suggested_resources")
			.$type<{ title: string; url?: string; type: string }[]>()
			.default([]),
		practiceExercises: pg.jsonb("practice_exercises").$type<string[]>().default([]),
		isResolved: pg.boolean("is_resolved").notNull().default(false),
		resolvedAt: pg.timestamp("resolved_at", { withTimezone: true }),
		lastSeenAt: pg.timestamp("last_seen_at", { withTimezone: true }).defaultNow(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.weaknessType),
		pg.index().on(t.userId, t.isResolved),
		pg.index().on(t.userId, t.severity),
		pg.index().on(t.userId, t.field),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// Interview improvement - tracked improvements over time
export const interviewImprovement = pg.pgTable(
	"interview_improvement",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		weaknessId: pg.uuid("weakness_id").references(() => interviewWeakness.id, { onDelete: "set null" }),
		field: interviewFieldEnum("field"),
		skillArea: pg.text("skill_area").notNull(), // e.g., "technical_questions", "behavioral_answers", "confidence"
		skillAreaFr: pg.text("skill_area_fr"),
		previousScore: pg.integer("previous_score").notNull(), // 0-100
		currentScore: pg.integer("current_score").notNull(), // 0-100
		improvementPercentage: pg.integer("improvement_percentage").notNull(),
		measurementPeriod: pg.text("measurement_period").notNull().default("weekly"), // daily, weekly, monthly
		notes: pg.text("notes"),
		milestonesAchieved: pg.jsonb("milestones_achieved").$type<string[]>().default([]),
		sessionsCompleted: pg.integer("sessions_completed").notNull().default(0),
		recordedAt: pg.timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.skillArea),
		pg.index().on(t.userId, t.field),
		pg.index().on(t.userId, t.recordedAt.desc()),
		pg.index().on(t.weaknessId),
	],
);

// Practice interview template industry enum
export const templateIndustryEnum = pg.pgEnum("template_industry", [
	"healthcare",
	"industrial",
	"hse",
	"general",
	"technology",
	"finance",
	"retail",
	"hospitality",
]);

// Practice interview template difficulty enum
export const templateDifficultyEnum = pg.pgEnum("template_difficulty", ["entry_level", "mid_level", "senior_level"]);

// TypeScript types for templates
export type TemplateIndustry =
	| "healthcare"
	| "industrial"
	| "hse"
	| "general"
	| "technology"
	| "finance"
	| "retail"
	| "hospitality";
export type TemplateDifficulty = "entry_level" | "mid_level" | "senior_level";

// Practice interview template question type
export type MockInterviewQuestionTemplate = {
	id: string;
	question: string;
	questionFr?: string;
	type: InterviewType;
	difficulty: "beginner" | "intermediate" | "advanced";
	expectedDuration: number; // in seconds
	keyPoints: string[];
	keyPointsFr?: string[];
	followUpQuestions?: string[];
	scoringCriteria?: string[];
};

// Practice interview template - industry-specific interview templates
export const mockInterviewTemplate = pg.pgTable(
	"mock_interview_template",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		name: pg.text("name").notNull(),
		nameFr: pg.text("name_fr"),
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		industry: templateIndustryEnum("industry").notNull(),
		targetRole: pg.text("target_role"),
		targetRoleFr: pg.text("target_role_fr"),
		difficulty: templateDifficultyEnum("difficulty").notNull().default("entry_level"),
		estimatedDuration: pg.integer("estimated_duration").notNull().default(30), // in minutes
		questions: pg.jsonb("questions").$type<MockInterviewQuestionTemplate[]>().default([]),
		totalQuestions: pg.integer("total_questions").notNull().default(0),
		tags: pg.text("tags").array().default([]),
		successMetrics: pg
			.jsonb("success_metrics")
			.$type<{ name: string; weight: number; threshold: number }[]>()
			.default([]),
		preparationTips: pg.jsonb("preparation_tips").$type<string[]>().default([]),
		preparationTipsFr: pg.jsonb("preparation_tips_fr").$type<string[]>().default([]),
		isActive: pg.boolean("is_active").notNull().default(true),
		usageCount: pg.integer("usage_count").notNull().default(0),
		avgScore: pg.integer("avg_score"), // Average score from users who used this template
		createdBy: pg.uuid("created_by").references(() => user.id, { onDelete: "set null" }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.industry),
		pg.index().on(t.difficulty),
		pg.index().on(t.isActive),
		pg.index().on(t.industry, t.difficulty),
		pg.index().on(t.usageCount.desc()),
		pg.index().on(t.createdBy),
	],
);

// Template usage tracking - tracks which users have used which templates
export const templateUsage = pg.pgTable(
	"template_usage",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		templateId: pg
			.uuid("template_id")
			.notNull()
			.references(() => mockInterviewTemplate.id, { onDelete: "cascade" }),
		sessionId: pg.uuid("session_id").references(() => interviewSession.id, { onDelete: "set null" }),
		score: pg.integer("score"), // 0-100
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		feedback: pg.text("feedback"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.templateId),
		pg.index().on(t.userId, t.templateId),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// TypeScript types for interview analytics tables
export type InterviewWeakness = typeof interviewWeakness.$inferSelect;
export type NewInterviewWeakness = typeof interviewWeakness.$inferInsert;
export type InterviewImprovement = typeof interviewImprovement.$inferSelect;
export type NewInterviewImprovement = typeof interviewImprovement.$inferInsert;
export type MockInterviewTemplate = typeof mockInterviewTemplate.$inferSelect;
export type NewMockInterviewTemplate = typeof mockInterviewTemplate.$inferInsert;
export type TemplateUsage = typeof templateUsage.$inferSelect;
export type NewTemplateUsage = typeof templateUsage.$inferInsert;

// ============================================================================
// AI TRAINING DATA COLLECTION SYSTEM
// ============================================================================

// AI feedback rating enum - user satisfaction with AI output
export const aiFeedbackRatingEnum = pg.pgEnum("ai_feedback_rating", ["positive", "negative", "neutral"]);

// AI content feature enum - which AI feature generated the content
export const aiContentFeatureEnum = pg.pgEnum("ai_content_feature", [
	"improve_content",
	"generate_summary",
	"fix_grammar",
	"suggest_skills",
	"generate_headline",
	"analyze_resume",
	"interview_questions",
	"interview_evaluation",
	"interview_chat",
	"cover_letter",
	"linkedin_summary",
	"bullet_point",
	"achievement",
	"skill_extraction",
]);

// AI Feedback table - captures user feedback on AI outputs (thumbs up/down, edits)
export const aiFeedback = pg.pgTable(
	"ai_feedback",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		feature: aiContentFeatureEnum("feature").notNull(),
		rating: aiFeedbackRatingEnum("rating").notNull(),
		// Original content from AI
		originalInput: pg.text("original_input"), // What was sent to AI
		originalOutput: pg.text("original_output").notNull(), // What AI generated
		// User edits (if any)
		editedOutput: pg.text("edited_output"), // User's corrected version
		hasEdits: pg.boolean("has_edits").notNull().default(false),
		editDistance: pg.integer("edit_distance"), // Levenshtein distance between original and edited
		// Additional context
		comment: pg.text("comment"), // Optional user comment
		context: pg.jsonb("context").$type<{
			resumeId?: string;
			sectionType?: string;
			language?: string;
			model?: string;
			provider?: string;
		}>(),
		// Metadata
		responseTimeMs: pg.integer("response_time_ms"), // How long AI took to respond
		tokenCount: pg.integer("token_count"), // Total tokens used
		wasAccepted: pg.boolean("was_accepted").notNull().default(false), // User accepted the output as-is
		// Timestamps
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.feature),
		pg.index().on(t.rating),
		pg.index().on(t.hasEdits),
		pg.index().on(t.createdAt.desc()),
		pg.index().on(t.feature, t.rating),
	],
);

// Training sample quality tier enum
export const trainingSampleTierEnum = pg.pgEnum("training_sample_tier", ["gold", "silver", "bronze", "rejected"]);

// AI Training Sample table - curated input/output pairs for fine-tuning
export const aiTrainingSample = pg.pgTable(
	"ai_training_sample",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		feedbackId: pg.uuid("feedback_id").references(() => aiFeedback.id, { onDelete: "set null" }), // Source feedback if curated from user feedback
		feature: aiContentFeatureEnum("feature").notNull(),
		// Training pair
		input: pg.text("input").notNull(), // System prompt + user input
		output: pg.text("output").notNull(), // Ideal output (curated/edited)
		// Curation metadata
		tier: trainingSampleTierEnum("tier").notNull().default("bronze"),
		qualityScore: pg.integer("quality_score"), // 0-100 quality rating
		curatedBy: pg.uuid("curated_by").references(() => user.id, { onDelete: "set null" }), // Admin who curated
		curatedAt: pg.timestamp("curated_at", { withTimezone: true }),
		// Context and categorization
		context: pg.jsonb("context").$type<{
			language?: string;
			industry?: string;
			sectionType?: string;
			difficulty?: string;
		}>(),
		tags: pg.text("tags").array().default([]),
		// Export tracking
		exportedAt: pg.timestamp("exported_at", { withTimezone: true }),
		exportFormat: pg.text("export_format"), // jsonl, csv, etc.
		// Timestamps
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.feature),
		pg.index().on(t.tier),
		pg.index().on(t.qualityScore),
		pg.index().on(t.curatedBy),
		pg.index().on(t.feature, t.tier),
		pg.index().on(t.createdAt.desc()),
	],
);

// Content quality rating dimension enum
export const qualityDimensionEnum = pg.pgEnum("quality_dimension", [
	"relevance",
	"accuracy",
	"fluency",
	"tone",
	"helpfulness",
	"formatting",
	"completeness",
]);

// Content Quality Rating table - detailed quality scores for AI-generated content
export const contentQualityRating = pg.pgTable(
	"content_quality_rating",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		feedbackId: pg
			.uuid("feedback_id")
			.notNull()
			.references(() => aiFeedback.id, { onDelete: "cascade" }),
		dimension: qualityDimensionEnum("dimension").notNull(),
		score: pg.integer("score").notNull(), // 1-5 rating
		weight: pg.real("weight").notNull().default(1.0), // Weight for aggregation
		notes: pg.text("notes"), // Reviewer notes
		reviewedBy: pg.uuid("reviewed_by").references(() => user.id, { onDelete: "set null" }), // Admin reviewer
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.feedbackId),
		pg.index().on(t.dimension),
		pg
			.unique()
			.on(t.feedbackId, t.dimension), // One rating per dimension per feedback
	],
);

// Model comparison status enum
export const modelComparisonStatusEnum = pg.pgEnum("model_comparison_status", [
	"pending",
	"in_progress",
	"completed",
	"failed",
]);

// Model Comparison table - A/B test results between AI models
export const modelComparison = pg.pgTable(
	"model_comparison",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		// Test configuration
		name: pg.text("name").notNull(), // e.g., "GPT-4 vs Claude-3 Summary Generation"
		description: pg.text("description"),
		feature: aiContentFeatureEnum("feature").notNull(),
		// Models being compared
		modelA: pg.text("model_a").notNull(), // e.g., "gpt-4-turbo"
		modelAProvider: pg.text("model_a_provider").notNull(), // e.g., "openai"
		modelB: pg.text("model_b").notNull(), // e.g., "claude-3-opus"
		modelBProvider: pg.text("model_b_provider").notNull(), // e.g., "anthropic"
		// Test parameters
		testInputs: pg.jsonb("test_inputs").$type<string[]>().default([]), // Standard inputs for testing
		status: modelComparisonStatusEnum("status").notNull().default("pending"),
		// Results
		results: pg.jsonb("results").$type<{
			totalComparisons: number;
			modelAWins: number;
			modelBWins: number;
			ties: number;
			modelAAvgScore: number;
			modelBAvgScore: number;
			modelAAvgLatency: number;
			modelBAvgLatency: number;
			modelAAvgTokens: number;
			modelBAvgTokens: number;
			byDimension: Record<
				string,
				{
					modelAAvg: number;
					modelBAvg: number;
				}
			>;
		}>(),
		// Winner determination
		winner: pg.text("winner"), // "model_a", "model_b", "tie", null if not completed
		winMargin: pg.real("win_margin"), // Percentage margin of victory
		confidence: pg.real("confidence"), // Statistical confidence in result
		// Metadata
		startedAt: pg.timestamp("started_at", { withTimezone: true }),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		createdBy: pg.uuid("created_by").references(() => user.id, { onDelete: "set null" }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.feature),
		pg.index().on(t.status),
		pg.index().on(t.winner),
		pg.index().on(t.createdAt.desc()),
	],
);

// Individual comparison results (per input)
export const modelComparisonResult = pg.pgTable(
	"model_comparison_result",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		comparisonId: pg
			.uuid("comparison_id")
			.notNull()
			.references(() => modelComparison.id, { onDelete: "cascade" }),
		input: pg.text("input").notNull(),
		// Model A results
		modelAOutput: pg.text("model_a_output").notNull(),
		modelALatencyMs: pg.integer("model_a_latency_ms"),
		modelATokens: pg.integer("model_a_tokens"),
		modelAScore: pg.integer("model_a_score"), // 0-100 overall score
		// Model B results
		modelBOutput: pg.text("model_b_output").notNull(),
		modelBLatencyMs: pg.integer("model_b_latency_ms"),
		modelBTokens: pg.integer("model_b_tokens"),
		modelBScore: pg.integer("model_b_score"), // 0-100 overall score
		// Comparison verdict
		winner: pg.text("winner"), // "model_a", "model_b", "tie"
		scoreDifference: pg.integer("score_difference"),
		evaluatorNotes: pg.text("evaluator_notes"),
		evaluatedBy: pg.uuid("evaluated_by").references(() => user.id, { onDelete: "set null" }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.comparisonId), pg.index().on(t.winner)],
);

// TypeScript types for AI training data tables
export type AiFeedback = typeof aiFeedback.$inferSelect;
export type NewAiFeedback = typeof aiFeedback.$inferInsert;
export type AiTrainingSample = typeof aiTrainingSample.$inferSelect;
export type NewAiTrainingSample = typeof aiTrainingSample.$inferInsert;
export type ContentQualityRating = typeof contentQualityRating.$inferSelect;
export type NewContentQualityRating = typeof contentQualityRating.$inferInsert;
export type ModelComparison = typeof modelComparison.$inferSelect;
export type NewModelComparison = typeof modelComparison.$inferInsert;
export type ModelComparisonResult = typeof modelComparisonResult.$inferSelect;
export type NewModelComparisonResult = typeof modelComparisonResult.$inferInsert;

// Type exports for enums
export type AiFeedbackRating = "positive" | "negative" | "neutral";
export type AiContentFeature =
	| "improve_content"
	| "generate_summary"
	| "fix_grammar"
	| "suggest_skills"
	| "generate_headline"
	| "analyze_resume"
	| "interview_questions"
	| "interview_evaluation"
	| "interview_chat"
	| "cover_letter"
	| "linkedin_summary"
	| "bullet_point"
	| "achievement"
	| "skill_extraction";
export type TrainingSampleTier = "gold" | "silver" | "bronze" | "rejected";
export type QualityDimension =
	| "relevance"
	| "accuracy"
	| "fluency"
	| "tone"
	| "helpfulness"
	| "formatting"
	| "completeness";
export type ModelComparisonStatus = "pending" | "in_progress" | "completed" | "failed";

// ============================================================================
// PREDICTIVE CAREER MATCHER SYSTEM
// ============================================================================

// Career prediction confidence level
export type CareerPredictionConfidence = "high" | "medium" | "low";

// Career path type for predictions
export type PredictedCareerPath = {
	id: string;
	title: string;
	titleFr?: string;
	description?: string;
	descriptionFr?: string;
	field: string;
	matchPercentage: number;
	confidence: CareerPredictionConfidence;
	estimatedTimeToAchieve: number; // months
	salaryProjection: {
		current: number;
		year1: number;
		year3: number;
		year5: number;
		currency: string;
	};
	requiredSkills: {
		name: string;
		currentLevel: number;
		requiredLevel: number;
		gap: number;
		isTransferable: boolean;
	}[];
	milestones: {
		title: string;
		description?: string;
		timeframe: string;
		type: "skill" | "experience" | "certification" | "education" | "networking";
	}[];
	successFactors: string[];
	challenges: string[];
	growthPotential: "high" | "medium" | "low";
};

// Job match score result type
export type JobMatchScoreResultType = {
	overallScore: number;
	skillMatch: number;
	experienceMatch: number;
	educationMatch: number;
	cultureFit: number;
	salaryFit: number;
	locationFit: number;
	matchedSkills: string[];
	missingSkills: string[];
	transferableSkills: string[];
	recommendations: string[];
	confidenceLevel: CareerPredictionConfidence;
};

// Career trajectory projection type
export type CareerTrajectoryPoint = {
	year: number;
	role: string;
	salary: number;
	skills: string[];
	probability: number;
	milestones: string[];
};

// Career prediction status enum
export const careerPredictionStatusEnum = pg.pgEnum("career_prediction_status", [
	"pending",
	"processing",
	"completed",
	"failed",
]);

// Career prediction table - AI-generated career path predictions
export const careerPrediction = pg.pgTable(
	"career_prediction",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		resumeId: pg.uuid("resume_id").references(() => resume.id, { onDelete: "set null" }),
		status: careerPredictionStatusEnum("status").notNull().default("pending"),
		// User profile data used for prediction
		currentRole: pg.text("current_role"),
		currentField: pg.text("current_field"),
		yearsExperience: pg.integer("years_experience").default(0),
		currentSkills: pg.jsonb("current_skills").$type<string[]>().default([]),
		educationLevel: pg.text("education_level"),
		// Prediction results
		predictedPaths: pg.jsonb("predicted_paths").$type<PredictedCareerPath[]>().default([]),
		topRecommendation: pg.text("top_recommendation"),
		aiAnalysis: pg.text("ai_analysis"),
		confidenceScore: pg.integer("confidence_score"), // 0-100
		// Metadata
		modelVersion: pg.text("model_version").default("v1"),
		processingTime: pg.integer("processing_time"), // milliseconds
		errorMessage: pg.text("error_message"),
		expiresAt: pg.timestamp("expires_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.resumeId),
		pg.index().on(t.status),
	],
);

// Job match score table - compatibility scores between user and jobs
export const jobMatchScoreTable = pg.pgTable(
	"job_match_score",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		predictionId: pg.uuid("prediction_id").references(() => careerPrediction.id, { onDelete: "cascade" }),
		// Job information
		jobTitle: pg.text("job_title").notNull(),
		jobTitleFr: pg.text("job_title_fr"),
		company: pg.text("company"),
		industry: pg.text("industry"),
		location: pg.text("location"),
		salaryMin: pg.integer("salary_min"),
		salaryMax: pg.integer("salary_max"),
		salaryCurrency: pg.text("salary_currency").default("MAD"),
		jobDescription: pg.text("job_description"),
		requiredSkills: pg.jsonb("required_skills").$type<string[]>().default([]),
		// Match scores
		overallScore: pg.integer("overall_score").notNull(), // 0-100
		skillMatchScore: pg.integer("skill_match_score"),
		experienceMatchScore: pg.integer("experience_match_score"),
		educationMatchScore: pg.integer("education_match_score"),
		cultureFitScore: pg.integer("culture_fit_score"),
		salaryFitScore: pg.integer("salary_fit_score"),
		locationFitScore: pg.integer("location_fit_score"),
		// Match details
		matchedSkills: pg.jsonb("matched_skills").$type<string[]>().default([]),
		missingSkills: pg.jsonb("missing_skills").$type<string[]>().default([]),
		transferableSkills: pg.jsonb("transferable_skills").$type<string[]>().default([]),
		recommendations: pg.jsonb("recommendations").$type<string[]>().default([]),
		confidenceLevel: pg.text("confidence_level").default("medium"), // high, medium, low
		// AI analysis
		aiExplanation: pg.text("ai_explanation"),
		improvementSuggestions: pg.jsonb("improvement_suggestions").$type<string[]>().default([]),
		// Status
		isBookmarked: pg.boolean("is_bookmarked").default(false),
		isApplied: pg.boolean("is_applied").default(false),
		isDismissed: pg.boolean("is_dismissed").default(false),
		appliedAt: pg.timestamp("applied_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.predictionId),
		pg.index().on(t.userId, t.overallScore.desc()),
		pg.index().on(t.userId, t.isBookmarked),
		pg.index().on(t.userId, t.isApplied),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.industry),
	],
);

// Career trajectory table - predicted career progression over time
export const careerTrajectory = pg.pgTable(
	"career_trajectory",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		predictionId: pg.uuid("prediction_id").references(() => careerPrediction.id, { onDelete: "cascade" }),
		// Trajectory details
		pathName: pg.text("path_name").notNull(),
		pathNameFr: pg.text("path_name_fr"),
		targetRole: pg.text("target_role").notNull(),
		targetRoleFr: pg.text("target_role_fr"),
		targetField: pg.text("target_field"),
		// Time projections
		estimatedYearsToTarget: pg.integer("estimated_years_to_target"),
		startingSalary: pg.integer("starting_salary"),
		projectedSalaryYear1: pg.integer("projected_salary_year1"),
		projectedSalaryYear3: pg.integer("projected_salary_year3"),
		projectedSalaryYear5: pg.integer("projected_salary_year5"),
		salaryCurrency: pg.text("salary_currency").default("MAD"),
		// Growth metrics
		growthRate: pg.numeric("growth_rate", { precision: 5, scale: 2 }), // percentage per year
		successProbability: pg.integer("success_probability"), // 0-100
		marketDemand: pg.text("market_demand").default("medium"), // high, medium, low
		competitionLevel: pg.text("competition_level").default("medium"), // high, medium, low
		// Trajectory points (yearly projections)
		trajectoryPoints: pg.jsonb("trajectory_points").$type<CareerTrajectoryPoint[]>().default([]),
		// Required actions
		requiredSkillUpgrades: pg
			.jsonb("required_skill_upgrades")
			.$type<
				{
					skill: string;
					currentLevel: number;
					targetLevel: number;
					priority: string;
				}[]
			>()
			.default([]),
		requiredCertifications: pg.jsonb("required_certifications").$type<string[]>().default([]),
		requiredExperience: pg.jsonb("required_experience").$type<string[]>().default([]),
		// Success factors and risks
		successFactors: pg.jsonb("success_factors").$type<string[]>().default([]),
		potentialChallenges: pg.jsonb("potential_challenges").$type<string[]>().default([]),
		mitigationStrategies: pg.jsonb("mitigation_strategies").$type<string[]>().default([]),
		// AI insights
		aiInsights: pg.text("ai_insights"),
		alternativePathSuggestions: pg.jsonb("alternative_path_suggestions").$type<string[]>().default([]),
		// User interaction
		isSelected: pg.boolean("is_selected").default(false),
		isActive: pg.boolean("is_active").default(true),
		lastSimulatedAt: pg.timestamp("last_simulated_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.predictionId),
		pg.index().on(t.userId, t.isSelected),
		pg.index().on(t.userId, t.isActive),
		pg.index().on(t.userId, t.successProbability.desc()),
		pg.index().on(t.targetField),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// TypeScript types for career prediction tables
export type CareerPredictionRow = typeof careerPrediction.$inferSelect;
export type NewCareerPrediction = typeof careerPrediction.$inferInsert;
export type JobMatchScoreRow = typeof jobMatchScoreTable.$inferSelect;
export type NewJobMatchScoreRow = typeof jobMatchScoreTable.$inferInsert;
export type CareerTrajectoryRow = typeof careerTrajectory.$inferSelect;
export type NewCareerTrajectoryRow = typeof careerTrajectory.$inferInsert;

// ============================================================================
// ADAPTIVE LEARNING ENGINE TABLES
// ============================================================================

// Learning style enum - how students best learn
export const learningStyleEnum = pg.pgEnum("learning_style", [
	"visual",
	"auditory",
	"reading_writing",
	"kinesthetic",
	"mixed",
]);

// Learning pace enum - student's preferred speed
export const learningPaceEnum = pg.pgEnum("learning_pace", ["slow", "moderate", "fast", "self_paced"]);

// Skill assessment level enum
export const skillAssessmentLevelEnum = pg.pgEnum("skill_assessment_level", [
	"novice",
	"beginner",
	"intermediate",
	"advanced",
	"expert",
]);

// Adaptive learning path status enum
export const adaptiveLearningPathStatusEnum = pg.pgEnum("adaptive_learning_path_status", [
	"not_started",
	"in_progress",
	"paused",
	"completed",
	"abandoned",
]);

// Learning milestone status enum
export const learningMilestoneStatusEnum = pg.pgEnum("learning_milestone_status", [
	"locked",
	"unlocked",
	"in_progress",
	"completed",
	"skipped",
]);

// Learning recommendation type enum
export const learningRecommendationTypeEnum = pg.pgEnum("learning_recommendation_type", [
	"next_skill",
	"review_topic",
	"practice_exercise",
	"take_assessment",
	"adjust_pace",
	"try_resource",
	"milestone_goal",
]);

// Learning recommendation priority enum
export const learningRecommendationPriorityEnum = pg.pgEnum("learning_recommendation_priority", [
	"low",
	"medium",
	"high",
	"critical",
]);

// TypeScript types for adaptive learning enums
export type LearningStyle = "visual" | "auditory" | "reading_writing" | "kinesthetic" | "mixed";
export type LearningPace = "slow" | "moderate" | "fast" | "self_paced";
export type SkillAssessmentLevel = "novice" | "beginner" | "intermediate" | "advanced" | "expert";
export type AdaptiveLearningPathStatus = "not_started" | "in_progress" | "paused" | "completed" | "abandoned";
export type LearningMilestoneStatus = "locked" | "unlocked" | "in_progress" | "completed" | "skipped";
export type LearningRecommendationType =
	| "next_skill"
	| "review_topic"
	| "practice_exercise"
	| "take_assessment"
	| "adjust_pace"
	| "try_resource"
	| "milestone_goal";
export type LearningRecommendationPriority = "low" | "medium" | "high" | "critical";

// Strength/weakness tracking type
export type SkillStrengthWeakness = {
	skillId: string;
	skillName: string;
	category: string;
	level: SkillAssessmentLevel;
	confidence: number; // 0-100
	lastAssessed: string;
	trend: "improving" | "stable" | "declining";
};

// Student learning profile - tracks learning style, pace, strengths, weaknesses
export const studentLearningProfile = pg.pgTable(
	"student_learning_profile",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		// Learning preferences
		learningStyle: learningStyleEnum("learning_style").default("mixed"),
		preferredPace: learningPaceEnum("preferred_pace").default("moderate"),
		dailyTimeCommitment: pg.integer("daily_time_commitment").default(30), // minutes per day
		weeklyGoalHours: pg.integer("weekly_goal_hours").default(5),
		preferredSessionLength: pg.integer("preferred_session_length").default(30), // minutes
		// Current state
		currentField: pg.text("current_field"), // healthcare, industrial, hse
		currentLevel: skillAssessmentLevelEnum("current_level").default("beginner"),
		targetLevel: skillAssessmentLevelEnum("target_level").default("intermediate"),
		// Strengths and weaknesses tracked over time
		strengths: pg.jsonb("strengths").$type<SkillStrengthWeakness[]>().default([]),
		weaknesses: pg.jsonb("weaknesses").$type<SkillStrengthWeakness[]>().default([]),
		// Performance metrics
		totalLearningHours: pg.integer("total_learning_hours").default(0),
		totalAssessments: pg.integer("total_assessments").default(0),
		averageAssessmentScore: pg.integer("average_assessment_score"), // 0-100
		currentStreak: pg.integer("current_streak").default(0), // days
		longestStreak: pg.integer("longest_streak").default(0),
		lastActivityDate: pg.date("last_activity_date"),
		// Adaptive difficulty settings
		difficultyMultiplier: pg.real("difficulty_multiplier").default(1.0), // AI adjusts based on performance
		contentPreferences: pg.jsonb("content_preferences").$type<{
			preferredFormats: string[]; // video, text, interactive, quiz
			preferredLanguages: string[];
			excludedTopics: string[];
		}>(),
		// Onboarding completion
		onboardingCompleted: pg.boolean("onboarding_completed").default(false),
		onboardingCompletedAt: pg.timestamp("onboarding_completed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.currentField),
		pg.index().on(t.currentLevel),
		pg.index().on(t.lastActivityDate),
	],
);

// Learning path module type for JSONB storage
export type AdaptiveLearningModule = {
	id: string;
	title: string;
	titleFr?: string;
	description?: string;
	order: number;
	estimatedHours: number;
	skillsToLearn: string[];
	resources: {
		id: string;
		type: "video" | "article" | "quiz" | "exercise" | "project";
		title: string;
		url?: string;
		duration?: number;
		completed: boolean;
		completedAt?: string;
	}[];
	isCompleted: boolean;
	completedAt?: string;
	progress: number; // 0-100
};

// Personalized learning path per student
export const adaptiveLearningPath = pg.pgTable(
	"adaptive_learning_path",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		profileId: pg.uuid("profile_id").references(() => studentLearningProfile.id, { onDelete: "set null" }),
		// Path details
		title: pg.text("title").notNull(),
		titleFr: pg.text("title_fr"),
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		field: pg.text("field").notNull(), // healthcare, industrial, hse
		targetRole: pg.text("target_role"),
		targetRoleFr: pg.text("target_role_fr"),
		// Learning goals
		targetSkills: pg.jsonb("target_skills").$type<string[]>().default([]),
		targetLevel: skillAssessmentLevelEnum("target_level").default("intermediate"),
		estimatedDuration: pg.text("estimated_duration"), // e.g., "12 weeks"
		estimatedHours: pg.integer("estimated_hours"),
		// Modules and content
		modules: pg.jsonb("modules").$type<AdaptiveLearningModule[]>().default([]),
		// Progress tracking
		status: adaptiveLearningPathStatusEnum("status").default("not_started"),
		progress: pg.integer("progress").default(0), // 0-100
		currentModuleIndex: pg.integer("current_module_index").default(0),
		completedModules: pg.integer("completed_modules").default(0),
		totalModules: pg.integer("total_modules").default(0),
		// Timing
		startedAt: pg.timestamp("started_at", { withTimezone: true }),
		targetCompletionDate: pg.timestamp("target_completion_date", { withTimezone: true }),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		lastAccessedAt: pg.timestamp("last_accessed_at", { withTimezone: true }),
		// AI generation metadata
		aiGenerated: pg.boolean("ai_generated").default(false),
		aiAnalysis: pg.text("ai_analysis"),
		generatedFromAssessment: pg.uuid("generated_from_assessment"),
		// Priority and visibility
		isPrimary: pg.boolean("is_primary").default(false),
		isActive: pg.boolean("is_active").default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.field),
		pg.index().on(t.userId, t.isPrimary),
		pg.index().on(t.userId, t.isActive),
		pg.index().on(t.profileId),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// Learning milestone - progress checkpoints within a path
export const adaptiveLearningMilestone = pg.pgTable(
	"adaptive_learning_milestone",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		pathId: pg
			.uuid("path_id")
			.notNull()
			.references(() => adaptiveLearningPath.id, { onDelete: "cascade" }),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		// Milestone details
		title: pg.text("title").notNull(),
		titleFr: pg.text("title_fr"),
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		// Ordering and progress
		order: pg.integer("order").notNull().default(0),
		status: learningMilestoneStatusEnum("status").default("locked"),
		progress: pg.integer("progress").default(0), // 0-100
		// Requirements to unlock/complete
		requiredSkills: pg.jsonb("required_skills").$type<string[]>().default([]),
		requiredAssessmentScore: pg.integer("required_assessment_score"), // minimum score to pass
		// Assessment reference
		assessmentId: pg.uuid("assessment_id"),
		assessmentScore: pg.integer("assessment_score"),
		// Rewards/achievements
		xpReward: pg.integer("xp_reward").default(100),
		badgeReward: pg.text("badge_reward"),
		certificateReward: pg.boolean("certificate_reward").default(false),
		// Timing
		targetDate: pg.timestamp("target_date", { withTimezone: true }),
		unlockedAt: pg.timestamp("unlocked_at", { withTimezone: true }),
		startedAt: pg.timestamp("started_at", { withTimezone: true }),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.pathId),
		pg.index().on(t.userId),
		pg.index().on(t.pathId, t.order),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.assessmentId),
	],
);

// Skill assessment - AI-evaluated skill levels over time
export const adaptiveSkillAssessment = pg.pgTable(
	"adaptive_skill_assessment",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		profileId: pg.uuid("profile_id").references(() => studentLearningProfile.id, { onDelete: "set null" }),
		pathId: pg.uuid("path_id").references(() => adaptiveLearningPath.id, { onDelete: "set null" }),
		milestoneId: pg.uuid("milestone_id").references(() => adaptiveLearningMilestone.id, { onDelete: "set null" }),
		// Assessment details
		skillId: pg.text("skill_id").notNull(), // Reference to skill library or custom
		skillName: pg.text("skill_name").notNull(),
		skillNameFr: pg.text("skill_name_fr"),
		category: pg.text("category").notNull(), // technical, soft, languages, certifications
		field: pg.text("field"), // healthcare, industrial, hse
		// Assessment type
		assessmentType: pg.text("assessment_type").notNull().default("quiz"), // quiz, practical, project, self_assessment, ai_evaluation
		// Scores and levels
		previousLevel: skillAssessmentLevelEnum("previous_level"),
		currentLevel: skillAssessmentLevelEnum("current_level").notNull(),
		score: pg.integer("score").notNull(), // 0-100
		confidenceScore: pg.integer("confidence_score"), // AI confidence in assessment
		// Detailed results
		questionsTotal: pg.integer("questions_total"),
		questionsCorrect: pg.integer("questions_correct"),
		timeSpent: pg.integer("time_spent"), // seconds
		detailedResults: pg.jsonb("detailed_results").$type<{
			strengths: string[];
			weaknesses: string[];
			recommendations: string[];
			topicScores: Record<string, number>;
		}>(),
		// AI analysis
		aiEvaluation: pg.text("ai_evaluation"),
		aiSuggestions: pg.jsonb("ai_suggestions").$type<string[]>(),
		// Trend tracking
		trend: pg.text("trend").default("stable"), // improving, stable, declining
		improvementPercent: pg.real("improvement_percent"),
		// Validity
		isValid: pg.boolean("is_valid").default(true),
		validUntil: pg.timestamp("valid_until", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.skillId),
		pg.index().on(t.profileId),
		pg.index().on(t.pathId),
		pg.index().on(t.milestoneId),
		pg.index().on(t.category),
		pg.index().on(t.field),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.userId, t.skillName, t.createdAt.desc()),
	],
);

// Learning recommendation - AI-generated next steps
export const adaptiveLearningRecommendation = pg.pgTable(
	"adaptive_learning_recommendation",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		profileId: pg.uuid("profile_id").references(() => studentLearningProfile.id, { onDelete: "set null" }),
		pathId: pg.uuid("path_id").references(() => adaptiveLearningPath.id, { onDelete: "set null" }),
		// Recommendation details
		type: learningRecommendationTypeEnum("type").notNull(),
		priority: learningRecommendationPriorityEnum("priority").notNull().default("medium"),
		title: pg.text("title").notNull(),
		titleFr: pg.text("title_fr"),
		description: pg.text("description").notNull(),
		descriptionFr: pg.text("description_fr"),
		// Target skill or topic
		targetSkillId: pg.text("target_skill_id"),
		targetSkillName: pg.text("target_skill_name"),
		targetTopicId: pg.text("target_topic_id"),
		// Reason for recommendation
		reason: pg.text("reason").notNull(), // Why AI recommends this
		reasonFr: pg.text("reason_fr"),
		basedOnAssessment: pg.uuid("based_on_assessment").references(() => adaptiveSkillAssessment.id, {
			onDelete: "set null",
		}),
		// Action details
		actionType: pg.text("action_type"), // watch_video, complete_quiz, practice, etc.
		actionUrl: pg.text("action_url"),
		estimatedTime: pg.integer("estimated_time"), // minutes
		difficulty: pg.text("difficulty").default("medium"), // easy, medium, hard
		// Status tracking
		isViewed: pg.boolean("is_viewed").default(false),
		viewedAt: pg.timestamp("viewed_at", { withTimezone: true }),
		isAccepted: pg.boolean("is_accepted").default(false),
		acceptedAt: pg.timestamp("accepted_at", { withTimezone: true }),
		isCompleted: pg.boolean("is_completed").default(false),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		isDismissed: pg.boolean("is_dismissed").default(false),
		dismissedAt: pg.timestamp("dismissed_at", { withTimezone: true }),
		dismissReason: pg.text("dismiss_reason"),
		// AI metadata
		aiConfidence: pg.integer("ai_confidence"), // 0-100
		aiModel: pg.text("ai_model"),
		generatedAt: pg.timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
		// Validity
		expiresAt: pg.timestamp("expires_at", { withTimezone: true }),
		isActive: pg.boolean("is_active").default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.isActive),
		pg.index().on(t.userId, t.type),
		pg.index().on(t.userId, t.priority),
		pg.index().on(t.profileId),
		pg.index().on(t.pathId),
		pg.index().on(t.basedOnAssessment),
		pg.index().on(t.userId, t.isCompleted),
		pg.index().on(t.userId, t.createdAt.desc()),
	],
);

// TypeScript types for adaptive learning tables
export type StudentLearningProfile = typeof studentLearningProfile.$inferSelect;
export type NewStudentLearningProfile = typeof studentLearningProfile.$inferInsert;
export type AdaptiveLearningPath = typeof adaptiveLearningPath.$inferSelect;
export type NewAdaptiveLearningPath = typeof adaptiveLearningPath.$inferInsert;
export type AdaptiveLearningMilestone = typeof adaptiveLearningMilestone.$inferSelect;
export type NewAdaptiveLearningMilestone = typeof adaptiveLearningMilestone.$inferInsert;
export type AdaptiveSkillAssessment = typeof adaptiveSkillAssessment.$inferSelect;
export type NewAdaptiveSkillAssessment = typeof adaptiveSkillAssessment.$inferInsert;
export type AdaptiveLearningRecommendation = typeof adaptiveLearningRecommendation.$inferSelect;
export type NewAdaptiveLearningRecommendation = typeof adaptiveLearningRecommendation.$inferInsert;

// ============================================================================
// AI PERFORMANCE METRICS SYSTEM
// ============================================================================

// AI Model Metrics - aggregated per-model performance stats
export const aiModelMetrics = pg.pgTable(
	"ai_model_metrics",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		providerId: pg.uuid("provider_id").references(() => aiProviderConfig.id, { onDelete: "cascade" }),
		provider: pg.text("provider").notNull(), // openai, anthropic, etc.
		model: pg.text("model").notNull(), // gpt-4o, claude-sonnet-4, etc.
		date: pg.date("date").notNull(), // Daily aggregation
		// Request metrics
		totalRequests: pg.integer("total_requests").notNull().default(0),
		successfulRequests: pg.integer("successful_requests").notNull().default(0),
		failedRequests: pg.integer("failed_requests").notNull().default(0),
		// Latency metrics (in ms)
		avgLatency: pg.integer("avg_latency"),
		minLatency: pg.integer("min_latency"),
		maxLatency: pg.integer("max_latency"),
		p50Latency: pg.integer("p50_latency"),
		p90Latency: pg.integer("p90_latency"),
		p99Latency: pg.integer("p99_latency"),
		// Token metrics
		totalInputTokens: pg.integer("total_input_tokens").notNull().default(0),
		totalOutputTokens: pg.integer("total_output_tokens").notNull().default(0),
		avgInputTokens: pg.integer("avg_input_tokens"),
		avgOutputTokens: pg.integer("avg_output_tokens"),
		// Cost metrics (in cents)
		estimatedCost: pg.integer("estimated_cost"), // Total cost for the day
		costPerRequest: pg.integer("cost_per_request"), // Average cost per request
		// Quality metrics
		avgQualityScore: pg.real("avg_quality_score"), // 0-100
		acceptanceRate: pg.real("acceptance_rate"), // % of AI content accepted by users
		// Computed at end of day
		successRate: pg.real("success_rate"), // % of successful requests
		tokensPerSecond: pg.real("tokens_per_second"), // Throughput
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.unique().on(t.provider, t.model, t.date),
		pg.index().on(t.provider),
		pg.index().on(t.model),
		pg.index().on(t.date),
		pg.index().on(t.providerId),
	],
);

// AI Feature Metrics - per-feature quality and performance tracking
export const aiFeatureMetrics = pg.pgTable(
	"ai_feature_metrics",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		feature: pg.text("feature").notNull(), // resume_parse, improve_content, grammar_fix, etc.
		date: pg.date("date").notNull(), // Daily aggregation
		// Request metrics
		totalRequests: pg.integer("total_requests").notNull().default(0),
		successfulRequests: pg.integer("successful_requests").notNull().default(0),
		failedRequests: pg.integer("failed_requests").notNull().default(0),
		// Performance metrics
		avgLatency: pg.integer("avg_latency"),
		p90Latency: pg.integer("p90_latency"),
		// Token metrics
		totalTokens: pg.integer("total_tokens").notNull().default(0),
		avgTokensPerRequest: pg.integer("avg_tokens_per_request"),
		// Quality metrics
		avgQualityScore: pg.real("avg_quality_score"), // 0-100 from user feedback
		acceptanceCount: pg.integer("acceptance_count").notNull().default(0), // Times user accepted suggestion
		rejectionCount: pg.integer("rejection_count").notNull().default(0), // Times user rejected suggestion
		modificationCount: pg.integer("modification_count").notNull().default(0), // Times user modified suggestion
		// Feature-specific
		bestModel: pg.text("best_model"), // Model with best performance for this feature
		bestModelScore: pg.real("best_model_score"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.unique().on(t.feature, t.date), pg.index().on(t.feature), pg.index().on(t.date)],
);

// AI Latency Log - detailed response time tracking for each request
export const aiLatencyLog = pg.pgTable(
	"ai_latency_log",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		usageLogId: pg.uuid("usage_log_id").references(() => aiUsageLog.id, { onDelete: "cascade" }),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		feature: pg.text("feature").notNull(),
		provider: pg.text("provider").notNull(),
		model: pg.text("model").notNull(),
		// Latency breakdown (all in ms)
		totalLatency: pg.integer("total_latency").notNull(),
		timeToFirstToken: pg.integer("time_to_first_token"), // For streaming
		processingTime: pg.integer("processing_time"), // Server processing
		networkLatency: pg.integer("network_latency"), // Estimated network time
		// Request details
		inputTokens: pg.integer("input_tokens"),
		outputTokens: pg.integer("output_tokens"),
		isStreaming: pg.boolean("is_streaming").notNull().default(false),
		// Context
		promptLength: pg.integer("prompt_length"), // Characters in prompt
		responseLength: pg.integer("response_length"), // Characters in response
		// Computed
		tokensPerSecond: pg.real("tokens_per_second"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.feature),
		pg.index().on(t.provider, t.model),
		pg.index().on(t.createdAt.desc()),
		pg.index().on(t.totalLatency),
	],
);

// AI Error Log - detailed error tracking with categorization
export const aiErrorSeverityEnum = pg.pgEnum("ai_error_severity", ["low", "medium", "high", "critical"]);

export const aiErrorCategoryEnum = pg.pgEnum("ai_error_category", [
	"rate_limit",
	"timeout",
	"invalid_request",
	"authentication",
	"model_error",
	"content_filter",
	"quota_exceeded",
	"network_error",
	"parsing_error",
	"unknown",
]);

export const aiErrorLog = pg.pgTable(
	"ai_error_log",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		usageLogId: pg.uuid("usage_log_id").references(() => aiUsageLog.id, { onDelete: "cascade" }),
		userId: pg.uuid("user_id").references(() => user.id, { onDelete: "set null" }),
		feature: pg.text("feature").notNull(),
		provider: pg.text("provider").notNull(),
		model: pg.text("model").notNull(),
		// Error details
		errorCategory: aiErrorCategoryEnum("error_category").notNull(),
		errorCode: pg.text("error_code"), // Provider-specific error code
		errorMessage: pg.text("error_message").notNull(),
		errorStack: pg.text("error_stack"), // Stack trace if available
		severity: aiErrorSeverityEnum("severity").notNull().default("medium"),
		// Request context
		requestPayload: pg.jsonb("request_payload"), // Sanitized request data
		responsePayload: pg.jsonb("response_payload"), // Error response from provider
		// Retry info
		retryCount: pg.integer("retry_count").notNull().default(0),
		wasRetried: pg.boolean("was_retried").notNull().default(false),
		retrySucceeded: pg.boolean("retry_succeeded"),
		// Resolution
		isResolved: pg.boolean("is_resolved").notNull().default(false),
		resolvedAt: pg.timestamp("resolved_at", { withTimezone: true }),
		resolution: pg.text("resolution"), // How it was resolved
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.feature),
		pg.index().on(t.provider, t.model),
		pg.index().on(t.errorCategory),
		pg.index().on(t.severity),
		pg.index().on(t.createdAt.desc()),
		pg.index().on(t.isResolved),
	],
);

// AI Content Quality Tracking - track acceptance/rejection of AI suggestions
export const aiContentQuality = pg.pgTable(
	"ai_content_quality",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		usageLogId: pg.uuid("usage_log_id").references(() => aiUsageLog.id, { onDelete: "cascade" }),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		feature: pg.text("feature").notNull(),
		provider: pg.text("provider").notNull(),
		model: pg.text("model").notNull(),
		// Content tracking
		contentType: pg.text("content_type").notNull(), // suggestion, improvement, generation
		contentHash: pg.text("content_hash"), // Hash of generated content for deduplication
		// Quality feedback
		wasAccepted: pg.boolean("was_accepted"), // null = no feedback yet
		wasModified: pg.boolean("was_modified"), // User edited the suggestion
		modificationPercent: pg.integer("modification_percent"), // How much was changed (0-100)
		userRating: pg.integer("user_rating"), // 1-5 stars if rated
		// Context
		resumeId: pg.uuid("resume_id").references(() => resume.id, { onDelete: "set null" }),
		sectionType: pg.text("section_type"), // experience, education, skills, etc.
		// Timestamps
		generatedAt: pg.timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
		feedbackAt: pg.timestamp("feedback_at", { withTimezone: true }),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.feature),
		pg.index().on(t.provider, t.model),
		pg.index().on(t.wasAccepted),
		pg.index().on(t.generatedAt.desc()),
	],
);

// AI Performance Alerts - for tracking degradation and issues
export const aiAlertStatusEnum = pg.pgEnum("ai_alert_status", ["active", "acknowledged", "resolved", "ignored"]);

export const aiPerformanceAlert = pg.pgTable(
	"ai_performance_alert",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		provider: pg.text("provider"),
		model: pg.text("model"),
		feature: pg.text("feature"),
		// Alert details
		alertType: pg.text("alert_type").notNull(), // latency_spike, error_rate_high, quality_degradation, etc.
		severity: aiErrorSeverityEnum("severity").notNull(),
		title: pg.text("title").notNull(),
		description: pg.text("description").notNull(),
		// Thresholds
		metric: pg.text("metric").notNull(), // Which metric triggered the alert
		threshold: pg.real("threshold").notNull(), // Threshold value
		currentValue: pg.real("current_value").notNull(), // Current value that triggered
		// Status
		status: aiAlertStatusEnum("status").notNull().default("active"),
		acknowledgedBy: pg.uuid("acknowledged_by").references(() => user.id, { onDelete: "set null" }),
		acknowledgedAt: pg.timestamp("acknowledged_at", { withTimezone: true }),
		resolvedAt: pg.timestamp("resolved_at", { withTimezone: true }),
		resolution: pg.text("resolution"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.provider, t.model),
		pg.index().on(t.feature),
		pg.index().on(t.alertType),
		pg.index().on(t.severity),
		pg.index().on(t.status),
		pg.index().on(t.createdAt.desc()),
	],
);

// TypeScript types for AI performance metrics
export type AiModelMetrics = typeof aiModelMetrics.$inferSelect;
export type NewAiModelMetrics = typeof aiModelMetrics.$inferInsert;
export type AiFeatureMetrics = typeof aiFeatureMetrics.$inferSelect;
export type NewAiFeatureMetrics = typeof aiFeatureMetrics.$inferInsert;
export type AiLatencyLog = typeof aiLatencyLog.$inferSelect;
export type NewAiLatencyLog = typeof aiLatencyLog.$inferInsert;
export type AiErrorLog = typeof aiErrorLog.$inferSelect;
export type NewAiErrorLog = typeof aiErrorLog.$inferInsert;
export type AiContentQuality = typeof aiContentQuality.$inferSelect;
export type NewAiContentQuality = typeof aiContentQuality.$inferInsert;
export type AiPerformanceAlert = typeof aiPerformanceAlert.$inferSelect;
export type NewAiPerformanceAlert = typeof aiPerformanceAlert.$inferInsert;

// ============================================
// COHORT ANALYTICS TABLES
// ============================================

// Cohort analytics metrics - historical snapshots of cohort performance
export const cohortAnalyticsMetrics = pg.pgTable(
	"cohort_analytics_metrics",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		cohortId: pg
			.uuid("cohort_id")
			.notNull()
			.references(() => studentCohort.id, { onDelete: "cascade" }),
		totalMembers: pg.integer("total_members").notNull().default(0),
		avgResumeProgress: pg.integer("avg_resume_progress").notNull().default(0), // 0-100
		avgSkillsScore: pg.integer("avg_skills_score").notNull().default(0), // 0-100
		avgInterviewScore: pg.integer("avg_interview_score").notNull().default(0), // 0-100
		placementRate: pg.integer("placement_rate").notNull().default(0), // 0-100 percentage
		activeMembers: pg.integer("active_members").notNull().default(0),
		completedTraining: pg.integer("completed_training").notNull().default(0),
		atRiskCount: pg.integer("at_risk_count").notNull().default(0),
		recordedAt: pg.timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.cohortId),
		pg.index().on(t.cohortId, t.recordedAt.desc()),
		pg.index().on(t.recordedAt.desc()),
	],
);

// Cohort analytics benchmark - performance targets for cohorts
export const cohortAnalyticsBenchmark = pg.pgTable(
	"cohort_analytics_benchmark",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		cohortId: pg
			.uuid("cohort_id")
			.notNull()
			.references(() => studentCohort.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		targetPlacementRate: pg.integer("target_placement_rate"), // 0-100
		targetSkillsScore: pg.integer("target_skills_score"), // 0-100
		targetInterviewScore: pg.integer("target_interview_score"), // 0-100
		targetCompletionRate: pg.integer("target_completion_rate"), // 0-100
		isActive: pg.boolean("is_active").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.cohortId), pg.index().on(t.cohortId, t.isActive), pg.index().on(t.isActive)],
);

// TypeScript types for cohort analytics tables
export type CohortAnalyticsMetrics = typeof cohortAnalyticsMetrics.$inferSelect;
export type NewCohortAnalyticsMetrics = typeof cohortAnalyticsMetrics.$inferInsert;
export type CohortAnalyticsBenchmark = typeof cohortAnalyticsBenchmark.$inferSelect;
export type NewCohortAnalyticsBenchmark = typeof cohortAnalyticsBenchmark.$inferInsert;
// ============================================================================
// AI LEARNING RECOMMENDATIONS SYSTEM
// ============================================================================

// Resource type enum - types of learning resources
export const learningResourceTypeEnum = pg.pgEnum("learning_resource_type", [
	"course",
	"tutorial",
	"certification",
	"video",
	"article",
	"book",
	"workshop",
	"webinar",
	"practice",
	"mentorship",
]);

// Resource difficulty enum
export const learningDifficultyEnum = pg.pgEnum("learning_difficulty", [
	"beginner",
	"intermediate",
	"advanced",
	"expert",
]);

// Resource cost type enum
export const learningCostTypeEnum = pg.pgEnum("learning_cost_type", ["free", "paid", "subscription", "freemium"]);

// Learning resource - catalog of courses, tutorials, certifications
export const learningResource = pg.pgTable(
	"learning_resource",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		title: pg.text("title").notNull(),
		titleFr: pg.text("title_fr"),
		description: pg.text("description").notNull(),
		descriptionFr: pg.text("description_fr"),
		resourceType: learningResourceTypeEnum("resource_type").notNull(),
		difficulty: learningDifficultyEnum("difficulty").notNull().default("beginner"),
		costType: learningCostTypeEnum("cost_type").notNull().default("free"),
		price: pg.integer("price"),
		currency: pg.text("currency").default("USD"),
		platform: pg.text("platform"),
		provider: pg.text("provider"),
		url: pg.text("url"),
		thumbnailUrl: pg.text("thumbnail_url"),
		durationMinutes: pg.integer("duration_minutes"),
		durationWeeks: pg.integer("duration_weeks"),
		skills: pg.text("skills").array().notNull().default([]),
		prerequisites: pg.text("prerequisites").array().default([]),
		targetFields: pg.text("target_fields").array().default([]),
		languages: pg.text("languages").array().default(["en"]),
		rating: pg.real("rating"),
		totalRatings: pg.integer("total_ratings").default(0),
		totalEnrollments: pg.integer("total_enrollments").default(0),
		totalCompletions: pg.integer("total_completions").default(0),
		certificationAwarded: pg.boolean("certification_awarded").default(false),
		certificationName: pg.text("certification_name"),
		isRecommended: pg.boolean("is_recommended").default(false),
		isFeatured: pg.boolean("is_featured").default(false),
		isActive: pg.boolean("is_active").default(true),
		tags: pg.text("tags").array().default([]),
		metadata: pg.jsonb("metadata").$type<Record<string, unknown>>().default({}),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.resourceType),
		pg.index().on(t.difficulty),
		pg.index().on(t.isActive),
		pg.index().on(t.isRecommended),
		pg.index().on(t.isFeatured),
		pg.index().on(t.rating.desc()),
		pg.index().on(t.totalEnrollments.desc()),
		pg.index().on(t.createdAt.desc()),
	],
);

// Completion status enum for resource tracking
export const completionStatusEnum = pg.pgEnum("completion_status", [
	"not_started",
	"in_progress",
	"completed",
	"paused",
	"dropped",
]);

// Resource completion - track what students have completed
export const resourceCompletion = pg.pgTable(
	"resource_completion",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		resourceId: pg
			.uuid("resource_id")
			.notNull()
			.references(() => learningResource.id, { onDelete: "cascade" }),
		status: completionStatusEnum("status").notNull().default("not_started"),
		progress: pg.integer("progress").notNull().default(0),
		startedAt: pg.timestamp("started_at", { withTimezone: true }),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		lastAccessedAt: pg.timestamp("last_accessed_at", { withTimezone: true }),
		timeSpentMinutes: pg.integer("time_spent_minutes").notNull().default(0),
		rating: pg.integer("rating"),
		review: pg.text("review"),
		notes: pg.text("notes"),
		certificateUrl: pg.text("certificate_url"),
		certificateEarnedAt: pg.timestamp("certificate_earned_at", { withTimezone: true }),
		isFavorite: pg.boolean("is_favorite").default(false),
		reminderEnabled: pg.boolean("reminder_enabled").default(false),
		reminderFrequency: pg.text("reminder_frequency"),
		nextReminderAt: pg.timestamp("next_reminder_at", { withTimezone: true }),
		metadata: pg.jsonb("metadata").$type<Record<string, unknown>>().default({}),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.unique().on(t.userId, t.resourceId),
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.isFavorite),
		pg.index().on(t.userId, t.progress.desc()),
		pg.index().on(t.userId, t.lastAccessedAt.desc()),
		pg.index().on(t.resourceId),
		pg.index().on(t.reminderEnabled, t.nextReminderAt),
	],
);

// Recommendation reason enum
export const recommendationReasonEnum = pg.pgEnum("recommendation_reason", [
	"skill_gap",
	"career_goal",
	"trending",
	"peer_popularity",
	"mentor_suggested",
	"completion_pattern",
	"personalized_ai",
	"curated",
	"new_release",
]);

// Recommendation history - AI recommendations made to students
export const recommendationHistory = pg.pgTable(
	"recommendation_history",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		resourceId: pg
			.uuid("resource_id")
			.notNull()
			.references(() => learningResource.id, { onDelete: "cascade" }),
		reason: recommendationReasonEnum("reason").notNull(),
		reasonDetails: pg.text("reason_details"),
		score: pg.real("score").notNull(),
		rank: pg.integer("rank"),
		skillsAddressed: pg.text("skills_addressed").array().default([]),
		aiModelUsed: pg.text("ai_model_used"),
		contextData: pg.jsonb("context_data").default({}),
		wasViewed: pg.boolean("was_viewed").default(false),
		viewedAt: pg.timestamp("viewed_at", { withTimezone: true }),
		wasClicked: pg.boolean("was_clicked").default(false),
		clickedAt: pg.timestamp("clicked_at", { withTimezone: true }),
		wasEnrolled: pg.boolean("was_enrolled").default(false),
		enrolledAt: pg.timestamp("enrolled_at", { withTimezone: true }),
		wasCompleted: pg.boolean("was_completed").default(false),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		expiresAt: pg.timestamp("expires_at", { withTimezone: true }),
		isActive: pg.boolean("is_active").default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.isActive),
		pg.index().on(t.userId, t.score.desc()),
		pg.index().on(t.userId, t.createdAt.desc()),
		pg.index().on(t.resourceId),
		pg.index().on(t.reason),
		pg.index().on(t.wasViewed),
		pg.index().on(t.wasEnrolled),
	],
);

// Feedback type enum
export const recommendationFeedbackTypeEnum = pg.pgEnum("recommendation_feedback_type", [
	"helpful",
	"not_helpful",
	"too_easy",
	"too_hard",
	"not_relevant",
	"already_know",
	"will_try_later",
	"enrolled",
	"completed",
	"dismissed",
]);

// Recommendation feedback - did student follow through
export const recommendationFeedback = pg.pgTable(
	"recommendation_feedback",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		recommendationId: pg
			.uuid("recommendation_id")
			.notNull()
			.references(() => recommendationHistory.id, { onDelete: "cascade" }),
		feedbackType: recommendationFeedbackTypeEnum("feedback_type").notNull(),
		rating: pg.integer("rating"),
		comment: pg.text("comment"),
		timeToFeedback: pg.integer("time_to_feedback"),
		engagementDuration: pg.integer("engagement_duration"),
		wasUseful: pg.boolean("was_useful"),
		metadata: pg.jsonb("metadata").$type<Record<string, unknown>>().default({}),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.unique().on(t.userId, t.recommendationId),
		pg.index().on(t.userId),
		pg.index().on(t.recommendationId),
		pg.index().on(t.feedbackType),
		pg.index().on(t.wasUseful),
		pg.index().on(t.createdAt.desc()),
	],
);

// Learning goal - weekly/monthly learning objectives
export const learningGoal = pg.pgTable(
	"learning_goal",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		titleFr: pg.text("title_fr"),
		description: pg.text("description"),
		goalType: pg.text("goal_type").notNull(),
		targetValue: pg.integer("target_value").notNull(),
		currentValue: pg.integer("current_value").notNull().default(0),
		metricType: pg.text("metric_type").notNull(),
		startDate: pg.date("start_date").notNull(),
		endDate: pg.date("end_date").notNull(),
		status: pg.text("status").notNull().default("active"),
		skillFocus: pg.text("skill_focus").array().default([]),
		resourceIds: pg.uuid("resource_ids").array().default([]),
		streakDays: pg.integer("streak_days").notNull().default(0),
		bestStreak: pg.integer("best_streak").notNull().default(0),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.userId, t.goalType),
		pg.index().on(t.userId, t.startDate, t.endDate),
		pg.index().on(t.status, t.endDate),
	],
);

// Mentor skill match - track which mentors have which skills for matching
export const mentorSkillMatch = pg.pgTable(
	"mentor_skill_match",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		mentorId: pg
			.uuid("mentor_id")
			.notNull()
			.references(() => mentorProfile.id, { onDelete: "cascade" }),
		skillName: pg.text("skill_name").notNull(),
		skillNameFr: pg.text("skill_name_fr"),
		proficiencyLevel: pg.integer("proficiency_level").notNull(),
		yearsExperience: pg.integer("years_experience"),
		canTeach: pg.boolean("can_teach").default(true),
		teachingRating: pg.real("teaching_rating"),
		totalSessionsOnSkill: pg.integer("total_sessions_on_skill").default(0),
		isVerified: pg.boolean("is_verified").default(false),
		verifiedAt: pg.timestamp("verified_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.unique().on(t.mentorId, t.skillName),
		pg.index().on(t.mentorId),
		pg.index().on(t.skillName),
		pg.index().on(t.proficiencyLevel.desc()),
		pg.index().on(t.canTeach),
		pg.index().on(t.teachingRating.desc()),
	],
);

// Learning sequence resource type
export type LearningSequenceResource = {
	resourceId: string;
	order: number;
	estimatedWeeks: number;
	isRequired: boolean;
	isCompleted: boolean;
};

// Learning sequence - optimized order to learn skills
export const learningSequence = pg.pgTable(
	"learning_sequence",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: pg.text("title").notNull(),
		titleFr: pg.text("title_fr"),
		description: pg.text("description"),
		targetRole: pg.text("target_role"),
		targetField: pg.text("target_field"),
		resources: pg.jsonb("resources").notNull().$type<LearningSequenceResource[]>().default([]),
		totalResources: pg.integer("total_resources").notNull().default(0),
		completedResources: pg.integer("completed_resources").notNull().default(0),
		estimatedWeeks: pg.integer("estimated_weeks"),
		currentResourceIndex: pg.integer("current_resource_index").default(0),
		aiGenerated: pg.boolean("ai_generated").default(false),
		aiModelUsed: pg.text("ai_model_used"),
		status: pg.text("status").notNull().default("active"),
		startedAt: pg.timestamp("started_at", { withTimezone: true }),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index().on(t.userId),
		pg.index().on(t.userId, t.status),
		pg.index().on(t.targetRole),
		pg.index().on(t.targetField),
		pg.index().on(t.aiGenerated),
		pg.index().on(t.createdAt.desc()),
	],
);

// TypeScript types for learning recommendations
export type LearningResource = typeof learningResource.$inferSelect;
export type NewLearningResource = typeof learningResource.$inferInsert;
export type ResourceCompletion = typeof resourceCompletion.$inferSelect;
export type NewResourceCompletion = typeof resourceCompletion.$inferInsert;
export type RecommendationHistory = typeof recommendationHistory.$inferSelect;
export type NewRecommendationHistory = typeof recommendationHistory.$inferInsert;
export type RecommendationFeedback = typeof recommendationFeedback.$inferSelect;
export type NewRecommendationFeedback = typeof recommendationFeedback.$inferInsert;
export type LearningGoal = typeof learningGoal.$inferSelect;
export type NewLearningGoal = typeof learningGoal.$inferInsert;
export type MentorSkillMatch = typeof mentorSkillMatch.$inferSelect;
export type NewMentorSkillMatch = typeof mentorSkillMatch.$inferInsert;
export type LearningSequence = typeof learningSequence.$inferSelect;
export type NewLearningSequence = typeof learningSequence.$inferInsert;

// Type exports for learning recommendation enums
export type LearningResourceType =
	| "course"
	| "tutorial"
	| "certification"
	| "video"
	| "article"
	| "book"
	| "workshop"
	| "webinar"
	| "practice"
	| "mentorship";
export type LearningDifficulty = "beginner" | "intermediate" | "advanced" | "expert";
export type LearningCostType = "free" | "paid" | "subscription" | "freemium";
export type CompletionStatus = "not_started" | "in_progress" | "completed" | "paused" | "dropped";
export type RecommendationReason =
	| "skill_gap"
	| "career_goal"
	| "trending"
	| "peer_popularity"
	| "mentor_suggested"
	| "completion_pattern"
	| "personalized_ai"
	| "curated"
	| "new_release";
export type RecommendationFeedbackType =
	| "helpful"
	| "not_helpful"
	| "too_easy"
	| "too_hard"
	| "not_relevant"
	| "already_know"
	| "will_try_later"
	| "enrolled"
	| "completed"
	| "dismissed";

// ============================================================================
// Elevator Pitch
// ============================================================================

export const elevatorPitch = pg.pgTable(
	"elevator_pitch",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		content: pg.text("content").notNull(),
		length: pg.text("length").notNull().default("60s"),
		context: pg.text("context").notNull().default("interview"),
		industry: pg.text("industry").notNull().default("general"),
		wordCount: pg.integer("word_count").default(0),
		estimatedTime: pg.integer("estimated_time").default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.createdAt.desc())],
);

// ============================================================================
// Review Prep User Data (Self-Assessment, Timeline, Salary Expectations)
// ============================================================================

export const reviewPrepUserData = pg.pgTable(
	"review_prep_user_data",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		dataType: pg.text("data_type").notNull(),
		data: pg.jsonb("data").notNull().default({}),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId, t.dataType)],
);

// ============================================================================
// STAR Method Practice History
// ============================================================================

export const starMethodHistory = pg.pgTable(
	"star_method_history",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		scenarioId: pg.text("scenario_id").notNull(),
		questionFr: pg.text("question_fr").notNull(),
		category: pg.text("category").notNull(),
		situation: pg.text("situation").notNull(),
		task: pg.text("task").notNull(),
		action: pg.text("action").notNull(),
		result: pg.text("result").notNull(),
		overallScore: pg.integer("overall_score"),
		evaluation: pg.jsonb("evaluation"),
		completedAt: pg.timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.completedAt.desc())],
);

// ============================================================================
// Chatbot Session History
// ============================================================================

export const chatbotSession = pg.pgTable(
	"chatbot_session",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		mode: pg.text("mode").notNull().default("quick_practice"),
		field: pg.text("field").notNull().default("general"),
		language: pg.text("language").notNull().default("fr"),
		topic: pg.text("topic"),
		messages: pg
			.jsonb("messages")
			.notNull()
			.$type<{ role: string; content: string; timestamp?: string }[]>()
			.default([]),
		questionCount: pg.integer("question_count").notNull().default(0),
		overallScore: pg.integer("overall_score"),
		summary: pg.jsonb("summary"),
		endedAt: pg.timestamp("ended_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId), pg.index().on(t.userId, t.createdAt.desc())],
);

// ============================================
// MESSAGE TEMPLATE TABLE
// ============================================

export const messageTemplate = pg.pgTable(
	"message_template",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: pg.text("name").notNull(),
		category: pg.text("category").notNull().default("email"),
		subject: pg.text("subject"),
		body: pg.text("body").notNull(),
		tags: pg.jsonb("tags").notNull().$type<string[]>().default([]),
		isFavorite: pg.boolean("is_favorite").notNull().default(false),
		isCustom: pg.boolean("is_custom").notNull().default(true),
		personalizationFields: pg
			.jsonb("personalization_fields")
			.notNull()
			.$type<{ key: string; label: string; placeholder: string; example: string }[]>()
			.default([]),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [pg.index().on(t.userId)],
);

export type MessageTemplateRow = typeof messageTemplate.$inferSelect;
export type NewMessageTemplateRow = typeof messageTemplate.$inferInsert;

// ============================================
// RESUME GALLERY TABLE
// ============================================

export const resumeGallery = pg.pgTable(
	"resume_gallery",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		name: pg.text("name").notNull(),
		nameFr: pg.text("name_fr"),
		field: pg.text("field").notNull(),
		subField: pg.text("sub_field"),
		experienceYears: pg.integer("experience_years").notNull().default(0),
		templateName: pg.text("template_name").notNull(),
		language: pg.text("language").notNull().default("fr"),
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		resumeData: pg.jsonb("resume_data").$type<Record<string, unknown>>(),
		tags: pg.text("tags").array().notNull().default([]),
		atsScore: pg.integer("ats_score").default(0),
		isFeatured: pg.boolean("is_featured").notNull().default(false),
		viewCount: pg.integer("view_count").notNull().default(0),
		useCount: pg.integer("use_count").notNull().default(0),
		isActive: pg.boolean("is_active").notNull().default(true),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index("resume_gallery_field_idx").on(t.field),
		pg.index("resume_gallery_template_idx").on(t.templateName),
		pg.index("resume_gallery_language_idx").on(t.language),
		pg.index("resume_gallery_featured_idx").on(t.isFeatured),
		pg.index("resume_gallery_active_idx").on(t.isActive),
	],
);

export type ResumeGalleryRow = typeof resumeGallery.$inferSelect;
export type NewResumeGalleryRow = typeof resumeGallery.$inferInsert;

// ============================================
// JOB RESOURCE TABLE
// ============================================

export const jobResource = pg.pgTable(
	"job_resource",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		name: pg.text("name").notNull(),
		nameFr: pg.text("name_fr"),
		category: pg.text("category").notNull(),
		subCategory: pg.text("sub_category"),
		description: pg.text("description"),
		descriptionFr: pg.text("description_fr"),
		website: pg.text("website"),
		contactEmail: pg.text("contact_email"),
		contactPhone: pg.text("contact_phone"),
		location: pg.text("location"),
		fields: pg.text("fields").array().notNull().default([]),
		tags: pg.text("tags").array().notNull().default([]),
		isFree: pg.boolean("is_free").notNull().default(true),
		rating: pg.numeric("rating", { precision: 3, scale: 1 }),
		isActive: pg.boolean("is_active").notNull().default(true),
		sortOrder: pg.integer("sort_order").notNull().default(0),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		pg.index("job_resource_category_idx").on(t.category),
		pg.index("job_resource_location_idx").on(t.location),
		pg.index("job_resource_active_idx").on(t.isActive),
		pg.index("job_resource_sort_idx").on(t.sortOrder),
	],
);

export type JobResourceRow = typeof jobResource.$inferSelect;
export type NewJobResourceRow = typeof jobResource.$inferInsert;

// ============================================
// SUPPORT / HELPDESK TICKET SYSTEM
// ============================================

export const supportTicket = pg.pgTable(
	"support_ticket",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		subject: pg.text("subject").notNull(),
		// category: account | technical | billing | ai | resume | other
		category: pg.text("category").notNull().default("other"),
		// status: open | in_progress | resolved | closed
		status: pg.text("status").notNull().default("open"),
		// priority: low | normal | high
		priority: pg.text("priority").notNull().default("normal"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
		lastMessageAt: pg.timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index("support_ticket_user_idx").on(t.userId),
		pg.index("support_ticket_status_idx").on(t.status),
		pg.index("support_ticket_last_message_idx").on(t.lastMessageAt),
	],
);

export type SupportTicketRow = typeof supportTicket.$inferSelect;
export type NewSupportTicketRow = typeof supportTicket.$inferInsert;

export const supportMessage = pg.pgTable(
	"support_message",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		ticketId: pg
			.uuid("ticket_id")
			.notNull()
			.references(() => supportTicket.id, { onDelete: "cascade" }),
		senderUserId: pg
			.uuid("sender_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		isAdmin: pg.boolean("is_admin").notNull().default(false),
		body: pg.text("body").notNull(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.index("support_message_ticket_idx").on(t.ticketId),
		pg.index("support_message_created_idx").on(t.createdAt),
	],
);

export type SupportMessageRow = typeof supportMessage.$inferSelect;
export type NewSupportMessageRow = typeof supportMessage.$inferInsert;

// ============================================
// DIRECT MESSAGING (Conversations between users)
// ============================================
// Normalized 1:1 (and group-ready) direct messaging core.
// A 1:1 DM is a conversation with exactly two participants.
// Strictly participant-scoped: callers may only access conversations
// they participate in (enforced in the service layer).

export const conversation = pg.pgTable(
	"conversation",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		subject: pg.text("subject"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
		lastMessageAt: pg.timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index("conversation_last_message_idx").on(t.lastMessageAt.desc())],
);

export const conversationParticipant = pg.pgTable(
	"conversation_participant",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		conversationId: pg
			.uuid("conversation_id")
			.notNull()
			.references(() => conversation.id, { onDelete: "cascade" }),
		userId: pg
			.uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		lastReadAt: pg.timestamp("last_read_at", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		pg.uniqueIndex("conversation_participant_unique_idx").on(t.conversationId, t.userId),
		pg.index("conversation_participant_user_idx").on(t.userId),
	],
);

export const message = pg.pgTable(
	"message",
	{
		id: pg
			.uuid("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		conversationId: pg
			.uuid("conversation_id")
			.notNull()
			.references(() => conversation.id, { onDelete: "cascade" }),
		senderUserId: pg
			.uuid("sender_user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		body: pg.text("body").notNull(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index("message_conversation_created_idx").on(t.conversationId, t.createdAt)],
);

export type ConversationRow = typeof conversation.$inferSelect;
export type NewConversationRow = typeof conversation.$inferInsert;
export type ConversationParticipantRow = typeof conversationParticipant.$inferSelect;
export type NewConversationParticipantRow = typeof conversationParticipant.$inferInsert;
export type MessageRow = typeof message.$inferSelect;
export type NewMessageRow = typeof message.$inferInsert;
