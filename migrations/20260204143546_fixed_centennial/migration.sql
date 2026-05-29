CREATE TYPE "ai_writer_content_type" AS ENUM('bullet_point', 'summary', 'achievement', 'cover_letter', 'linkedin_summary', 'skill_extraction');--> statement-breakpoint
CREATE TYPE "ai_writer_industry" AS ENUM('technology', 'healthcare', 'finance', 'marketing', 'engineering', 'education', 'general');--> statement-breakpoint
CREATE TYPE "ai_writer_tone" AS ENUM('professional', 'confident', 'friendly', 'executive', 'creative');--> statement-breakpoint
CREATE TYPE "linkedin_industry" AS ENUM('technology', 'finance', 'healthcare', 'marketing', 'engineering', 'education', 'consulting', 'general');--> statement-breakpoint
CREATE TABLE "ai_writer_content" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"type" "ai_writer_content_type" NOT NULL,
	"name" text NOT NULL,
	"original_input" text,
	"generated_content" text,
	"tone" "ai_writer_tone",
	"industry" "ai_writer_industry",
	"experience_years" integer,
	"bullet_points" jsonb,
	"skill_extraction" jsonb,
	"grammar_issues" jsonb,
	"job_title" text,
	"company_name" text,
	"linkedin_keywords" text[],
	"is_favorite" boolean DEFAULT false NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "linkedin_profile" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"industry" "linkedin_industry" DEFAULT 'general'::"linkedin_industry" NOT NULL,
	"current_role" text DEFAULT '',
	"current_headline" text DEFAULT '',
	"current_summary" text DEFAULT '',
	"years_experience" integer DEFAULT 5 NOT NULL,
	"has_profile_photo" boolean DEFAULT true NOT NULL,
	"skills_count" integer DEFAULT 10 NOT NULL,
	"experience_count" integer DEFAULT 3 NOT NULL,
	"connections_count" integer DEFAULT 200 NOT NULL,
	"photo_tips" jsonb DEFAULT '[]' NOT NULL,
	"checklist" jsonb DEFAULT '[]' NOT NULL,
	"headline_suggestions" jsonb DEFAULT '[]' NOT NULL,
	"summary_suggestions" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ai_writer_content_user_id_index" ON "ai_writer_content" ("user_id");--> statement-breakpoint
CREATE INDEX "ai_writer_content_user_id_type_index" ON "ai_writer_content" ("user_id","type");--> statement-breakpoint
CREATE INDEX "ai_writer_content_user_id_is_favorite_index" ON "ai_writer_content" ("user_id","is_favorite");--> statement-breakpoint
CREATE INDEX "ai_writer_content_user_id_created_at_index" ON "ai_writer_content" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "linkedin_profile_user_id_index" ON "linkedin_profile" ("user_id");--> statement-breakpoint
ALTER TABLE "ai_writer_content" ADD CONSTRAINT "ai_writer_content_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "linkedin_profile" ADD CONSTRAINT "linkedin_profile_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;