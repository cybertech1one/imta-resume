CREATE TYPE "effort_level" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "experience_industry" AS ENUM('technology', 'healthcare', 'finance', 'marketing', 'engineering', 'education', 'general');--> statement-breakpoint
CREATE TYPE "experience_verb_category" AS ENUM('leadership', 'technical', 'communication');--> statement-breakpoint
CREATE TYPE "impact_level" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "section_score_status" AS ENUM('excellent', 'good', 'needs-improvement', 'missing');--> statement-breakpoint
CREATE TYPE "version_change_type" AS ENUM('addition', 'deletion', 'modification');--> statement-breakpoint
CREATE TABLE "experience_action_verb" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"verb" text NOT NULL,
	"description" text NOT NULL,
	"example" text NOT NULL,
	"category" "experience_verb_category" DEFAULT 'leadership'::"experience_verb_category" NOT NULL,
	"is_custom" boolean DEFAULT true NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience_before_after_example" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"before" text NOT NULL,
	"after" text NOT NULL,
	"improvement" text NOT NULL,
	"category" "experience_verb_category" DEFAULT 'leadership'::"experience_verb_category" NOT NULL,
	"is_custom" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience_expanded_tips" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"expanded_tip_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience_industry_preference" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"selected_industry" "experience_industry" DEFAULT 'general'::"experience_industry" NOT NULL,
	"favorite_keywords" text[] DEFAULT '{}'::text[] NOT NULL,
	"favorite_phrases" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience_optimization_history" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"input_text" text NOT NULL,
	"output_text" text NOT NULL,
	"industry" "experience_industry",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_scoring_history" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"resume_id" uuid,
	"scoring_result_id" uuid NOT NULL,
	"overall_score" integer NOT NULL,
	"ats_score" integer NOT NULL,
	"readability_score" integer NOT NULL,
	"visual_score" integer NOT NULL,
	"completeness_score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_scoring_result" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"resume_id" uuid,
	"resume_name" text NOT NULL,
	"overall_score" integer NOT NULL,
	"section_scores" jsonb DEFAULT '[]' NOT NULL,
	"ats_checklist" jsonb DEFAULT '[]' NOT NULL,
	"ats_score" integer DEFAULT 0 NOT NULL,
	"readability_score" jsonb,
	"visual_appeal_score" jsonb,
	"content_completeness" jsonb,
	"improvement_suggestions" jsonb DEFAULT '[]' NOT NULL,
	"industry_benchmarks" jsonb DEFAULT '[]' NOT NULL,
	"radar_data" jsonb DEFAULT '[]' NOT NULL,
	"selected_industry" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_storage_stats" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"used_storage" integer DEFAULT 0 NOT NULL,
	"total_storage" integer DEFAULT 104857600 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_version" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"resume_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"resume_name" text NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"changes" jsonb DEFAULT '[]' NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "experience_action_verb_user_id_index" ON "experience_action_verb" ("user_id");--> statement-breakpoint
CREATE INDEX "experience_action_verb_user_id_category_index" ON "experience_action_verb" ("user_id","category");--> statement-breakpoint
CREATE INDEX "experience_action_verb_user_id_is_favorite_index" ON "experience_action_verb" ("user_id","is_favorite");--> statement-breakpoint
CREATE INDEX "experience_before_after_example_user_id_index" ON "experience_before_after_example" ("user_id");--> statement-breakpoint
CREATE INDEX "experience_before_after_example_user_id_category_index" ON "experience_before_after_example" ("user_id","category");--> statement-breakpoint
CREATE INDEX "experience_before_after_example_user_id_created_at_index" ON "experience_before_after_example" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "experience_expanded_tips_user_id_index" ON "experience_expanded_tips" ("user_id");--> statement-breakpoint
CREATE INDEX "experience_industry_preference_user_id_index" ON "experience_industry_preference" ("user_id");--> statement-breakpoint
CREATE INDEX "experience_optimization_history_user_id_index" ON "experience_optimization_history" ("user_id");--> statement-breakpoint
CREATE INDEX "experience_optimization_history_user_id_created_at_index" ON "experience_optimization_history" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "resume_scoring_history_user_id_index" ON "resume_scoring_history" ("user_id");--> statement-breakpoint
CREATE INDEX "resume_scoring_history_user_id_created_at_index" ON "resume_scoring_history" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "resume_scoring_history_resume_id_index" ON "resume_scoring_history" ("resume_id");--> statement-breakpoint
CREATE INDEX "resume_scoring_history_scoring_result_id_index" ON "resume_scoring_history" ("scoring_result_id");--> statement-breakpoint
CREATE INDEX "resume_scoring_result_user_id_index" ON "resume_scoring_result" ("user_id");--> statement-breakpoint
CREATE INDEX "resume_scoring_result_user_id_created_at_index" ON "resume_scoring_result" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "resume_scoring_result_resume_id_index" ON "resume_scoring_result" ("resume_id");--> statement-breakpoint
CREATE INDEX "resume_storage_stats_user_id_index" ON "resume_storage_stats" ("user_id");--> statement-breakpoint
CREATE INDEX "resume_version_user_id_index" ON "resume_version" ("user_id");--> statement-breakpoint
CREATE INDEX "resume_version_resume_id_index" ON "resume_version" ("resume_id");--> statement-breakpoint
CREATE INDEX "resume_version_user_id_resume_id_index" ON "resume_version" ("user_id","resume_id");--> statement-breakpoint
CREATE INDEX "resume_version_user_id_created_at_index" ON "resume_version" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "resume_version_resume_id_version_number_index" ON "resume_version" ("resume_id","version_number" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "experience_action_verb" ADD CONSTRAINT "experience_action_verb_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "experience_before_after_example" ADD CONSTRAINT "experience_before_after_example_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "experience_expanded_tips" ADD CONSTRAINT "experience_expanded_tips_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "experience_industry_preference" ADD CONSTRAINT "experience_industry_preference_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "experience_optimization_history" ADD CONSTRAINT "experience_optimization_history_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "resume_scoring_history" ADD CONSTRAINT "resume_scoring_history_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "resume_scoring_history" ADD CONSTRAINT "resume_scoring_history_resume_id_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resume"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "resume_scoring_history" ADD CONSTRAINT "resume_scoring_history_X0wDyCIWoioc_fkey" FOREIGN KEY ("scoring_result_id") REFERENCES "resume_scoring_result"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "resume_scoring_result" ADD CONSTRAINT "resume_scoring_result_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "resume_scoring_result" ADD CONSTRAINT "resume_scoring_result_resume_id_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resume"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "resume_storage_stats" ADD CONSTRAINT "resume_storage_stats_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "resume_version" ADD CONSTRAINT "resume_version_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "resume_version" ADD CONSTRAINT "resume_version_resume_id_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resume"("id") ON DELETE CASCADE;