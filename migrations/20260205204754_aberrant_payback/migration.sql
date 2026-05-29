CREATE TABLE IF NOT EXISTS "career_employer" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"sector" text NOT NULL,
	"sector_fr" text NOT NULL,
	"location" text NOT NULL,
	"location_fr" text,
	"open_positions" integer DEFAULT 0,
	"website" text,
	"logo" text,
	"description" text,
	"description_fr" text,
	"fields" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "career_market_insight" (
	"id" uuid PRIMARY KEY,
	"title" text NOT NULL,
	"title_fr" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"description_fr" text,
	"icon" text,
	"color" text,
	"field" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "imta_program" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"name_fr" text NOT NULL,
	"field" text NOT NULL,
	"duration" text NOT NULL,
	"duration_fr" text NOT NULL,
	"requirements" text NOT NULL,
	"requirements_fr" text NOT NULL,
	"description" text NOT NULL,
	"description_fr" text NOT NULL,
	"success_rate" integer,
	"avg_salary" integer,
	"employment_rate" integer,
	"skills" jsonb NOT NULL,
	"certifications" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interview_common_question" (
	"id" text PRIMARY KEY,
	"question" text NOT NULL,
	"question_fr" text NOT NULL,
	"type" text NOT NULL,
	"field" text NOT NULL,
	"sample_answer" text,
	"sample_answer_fr" text,
	"tips" jsonb NOT NULL,
	"tips_fr" jsonb NOT NULL,
	"difficulty" text DEFAULT 'intermediate',
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interview_tip" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"title_fr" text NOT NULL,
	"content" text NOT NULL,
	"content_fr" text NOT NULL,
	"extended_content" text,
	"extended_content_fr" text,
	"category" text NOT NULL,
	"field" text,
	"tags" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skill_library" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"name_fr" text NOT NULL,
	"field" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"description_fr" text,
	"is_recommended" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "career_employer_is_active_index" ON "career_employer" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "career_market_insight_field_index" ON "career_market_insight" ("field");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "career_market_insight_is_active_index" ON "career_market_insight" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "imta_program_field_index" ON "imta_program" ("field");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "imta_program_is_active_index" ON "imta_program" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_common_question_type_index" ON "interview_common_question" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_common_question_field_index" ON "interview_common_question" ("field");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_common_question_is_active_index" ON "interview_common_question" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_tip_category_index" ON "interview_tip" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_tip_field_index" ON "interview_tip" ("field");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "interview_tip_is_active_index" ON "interview_tip" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "skill_library_field_index" ON "skill_library" ("field");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "skill_library_category_index" ON "skill_library" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "skill_library_is_active_index" ON "skill_library" ("is_active");