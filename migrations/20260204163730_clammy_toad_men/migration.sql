CREATE TYPE "freelance_day_of_week" AS ENUM('lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim');--> statement-breakpoint
CREATE TYPE "freelance_package_tier" AS ENUM('basic', 'standard', 'premium');--> statement-breakpoint
CREATE TYPE "freelance_platform" AS ENUM('upwork', 'fiverr', 'linkedin');--> statement-breakpoint
CREATE TYPE "freelance_skill_proficiency" AS ENUM('beginner', 'intermediate', 'advanced', 'expert');--> statement-breakpoint
CREATE TYPE "job_aggregator_app_status" AS ENUM('not_applied', 'applied', 'interview', 'offer', 'rejected');--> statement-breakpoint
CREATE TYPE "job_aggregator_experience" AS ENUM('entry', 'junior', 'mid', 'senior', 'lead');--> statement-breakpoint
CREATE TYPE "job_aggregator_industry" AS ENUM('healthcare', 'industrial', 'hse', 'tech', 'finance', 'general');--> statement-breakpoint
CREATE TYPE "job_aggregator_source" AS ENUM('linkedin', 'indeed', 'glassdoor');--> statement-breakpoint
CREATE TYPE "job_aggregator_work_type" AS ENUM('onsite', 'remote', 'hybrid');--> statement-breakpoint
CREATE TYPE "work_sample_link_type" AS ENUM('live', 'github', 'demo', 'documentation', 'figma', 'video');--> statement-breakpoint
CREATE TYPE "work_sample_project_status" AS ENUM('completed', 'in-progress', 'archived');--> statement-breakpoint
CREATE TYPE "work_sample_project_type" AS ENUM('web', 'mobile', 'design', 'backend', 'fullstack', 'data', 'devops');--> statement-breakpoint
CREATE TYPE "work_sample_tech_category" AS ENUM('frontend', 'backend', 'database', 'cloud', 'design', 'other');--> statement-breakpoint
CREATE TABLE "aggregated_job" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"company_logo" text,
	"location" text NOT NULL,
	"work_type" "job_aggregator_work_type" DEFAULT 'onsite'::"job_aggregator_work_type" NOT NULL,
	"industry" "job_aggregator_industry" DEFAULT 'general'::"job_aggregator_industry" NOT NULL,
	"experience_level" "job_aggregator_experience" DEFAULT 'mid'::"job_aggregator_experience" NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"currency" text DEFAULT 'MAD' NOT NULL,
	"posted_date" date NOT NULL,
	"description" text NOT NULL,
	"requirements" text[] DEFAULT '{}'::text[] NOT NULL,
	"skills" text[] DEFAULT '{}'::text[] NOT NULL,
	"benefits" text[] DEFAULT '{}'::text[] NOT NULL,
	"source" "job_aggregator_source" NOT NULL,
	"source_url" text NOT NULL,
	"application_status" "job_aggregator_app_status" DEFAULT 'not_applied'::"job_aggregator_app_status" NOT NULL,
	"is_saved" boolean DEFAULT false NOT NULL,
	"match_score" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aggregator_saved_search" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"query" text DEFAULT '' NOT NULL,
	"filters" jsonb NOT NULL,
	"results_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "freelance_portfolio_item" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image_url" text,
	"category" text DEFAULT '' NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "freelance_profile" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"headline" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"hourly_rate" integer DEFAULT 0 NOT NULL,
	"project_min_rate" integer DEFAULT 0 NOT NULL,
	"availability" jsonb NOT NULL,
	"available_hours_per_week" integer DEFAULT 35 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "freelance_proposal_template" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"content" text NOT NULL,
	"variables" text[] DEFAULT '{}'::text[] NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "freelance_service_package" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"tier" "freelance_package_tier" NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"delivery_days" integer DEFAULT 7 NOT NULL,
	"revisions" integer DEFAULT 2 NOT NULL,
	"features" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "freelance_skill" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"proficiency" "freelance_skill_proficiency" DEFAULT 'intermediate'::"freelance_skill_proficiency" NOT NULL,
	"years_experience" integer DEFAULT 0 NOT NULL,
	"endorsements" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "freelance_testimonial" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"client_name" text NOT NULL,
	"client_role" text DEFAULT '' NOT NULL,
	"client_company" text DEFAULT '' NOT NULL,
	"client_avatar" text,
	"content" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"platform" "freelance_platform" DEFAULT 'upwork'::"freelance_platform" NOT NULL,
	"date" text NOT NULL,
	"project_type" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_sample_case_study" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"overview" text DEFAULT '' NOT NULL,
	"challenge" text DEFAULT '' NOT NULL,
	"approach" text DEFAULT '' NOT NULL,
	"solution" text DEFAULT '' NOT NULL,
	"results" text DEFAULT '' NOT NULL,
	"learnings" text DEFAULT '' NOT NULL,
	"timeline" jsonb DEFAULT '[]' NOT NULL,
	"key_features" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_sample_project" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"long_description" text DEFAULT '' NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"type" "work_sample_project_type" DEFAULT 'web'::"work_sample_project_type" NOT NULL,
	"status" "work_sample_project_status" DEFAULT 'completed'::"work_sample_project_status" NOT NULL,
	"technologies" jsonb DEFAULT '[]' NOT NULL,
	"skills" text[] DEFAULT '{}'::text[] NOT NULL,
	"images" text[] DEFAULT '{}'::text[] NOT NULL,
	"thumbnail" text,
	"links" jsonb DEFAULT '[]' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"start_date" text,
	"end_date" text,
	"team_size" integer,
	"client" text,
	"industry" text,
	"metrics" jsonb,
	"before_after" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "aggregated_job_user_id_index" ON "aggregated_job" ("user_id");--> statement-breakpoint
CREATE INDEX "aggregated_job_user_id_is_saved_index" ON "aggregated_job" ("user_id","is_saved");--> statement-breakpoint
CREATE INDEX "aggregated_job_user_id_application_status_index" ON "aggregated_job" ("user_id","application_status");--> statement-breakpoint
CREATE INDEX "aggregated_job_user_id_source_index" ON "aggregated_job" ("user_id","source");--> statement-breakpoint
CREATE INDEX "aggregated_job_user_id_industry_index" ON "aggregated_job" ("user_id","industry");--> statement-breakpoint
CREATE INDEX "aggregated_job_user_id_created_at_index" ON "aggregated_job" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "aggregator_saved_search_user_id_index" ON "aggregator_saved_search" ("user_id");--> statement-breakpoint
CREATE INDEX "aggregator_saved_search_user_id_created_at_index" ON "aggregator_saved_search" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "freelance_portfolio_item_user_id_index" ON "freelance_portfolio_item" ("user_id");--> statement-breakpoint
CREATE INDEX "freelance_portfolio_item_user_id_category_index" ON "freelance_portfolio_item" ("user_id","category");--> statement-breakpoint
CREATE INDEX "freelance_profile_user_id_index" ON "freelance_profile" ("user_id");--> statement-breakpoint
CREATE INDEX "freelance_proposal_template_user_id_index" ON "freelance_proposal_template" ("user_id");--> statement-breakpoint
CREATE INDEX "freelance_proposal_template_user_id_category_index" ON "freelance_proposal_template" ("user_id","category");--> statement-breakpoint
CREATE INDEX "freelance_proposal_template_user_id_usage_count_index" ON "freelance_proposal_template" ("user_id","usage_count" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "freelance_service_package_user_id_index" ON "freelance_service_package" ("user_id");--> statement-breakpoint
CREATE INDEX "freelance_service_package_user_id_tier_index" ON "freelance_service_package" ("user_id","tier");--> statement-breakpoint
CREATE INDEX "freelance_skill_user_id_index" ON "freelance_skill" ("user_id");--> statement-breakpoint
CREATE INDEX "freelance_skill_user_id_proficiency_index" ON "freelance_skill" ("user_id","proficiency");--> statement-breakpoint
CREATE INDEX "freelance_testimonial_user_id_index" ON "freelance_testimonial" ("user_id");--> statement-breakpoint
CREATE INDEX "freelance_testimonial_user_id_platform_index" ON "freelance_testimonial" ("user_id","platform");--> statement-breakpoint
CREATE INDEX "freelance_testimonial_user_id_rating_index" ON "freelance_testimonial" ("user_id","rating" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "work_sample_case_study_user_id_index" ON "work_sample_case_study" ("user_id");--> statement-breakpoint
CREATE INDEX "work_sample_case_study_project_id_index" ON "work_sample_case_study" ("project_id");--> statement-breakpoint
CREATE INDEX "work_sample_case_study_user_id_created_at_index" ON "work_sample_case_study" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "work_sample_project_user_id_index" ON "work_sample_project" ("user_id");--> statement-breakpoint
CREATE INDEX "work_sample_project_user_id_type_index" ON "work_sample_project" ("user_id","type");--> statement-breakpoint
CREATE INDEX "work_sample_project_user_id_status_index" ON "work_sample_project" ("user_id","status");--> statement-breakpoint
CREATE INDEX "work_sample_project_user_id_featured_index" ON "work_sample_project" ("user_id","featured");--> statement-breakpoint
CREATE INDEX "work_sample_project_user_id_updated_at_index" ON "work_sample_project" ("user_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "aggregated_job" ADD CONSTRAINT "aggregated_job_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "aggregator_saved_search" ADD CONSTRAINT "aggregator_saved_search_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "freelance_portfolio_item" ADD CONSTRAINT "freelance_portfolio_item_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "freelance_profile" ADD CONSTRAINT "freelance_profile_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "freelance_proposal_template" ADD CONSTRAINT "freelance_proposal_template_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "freelance_service_package" ADD CONSTRAINT "freelance_service_package_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "freelance_skill" ADD CONSTRAINT "freelance_skill_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "freelance_testimonial" ADD CONSTRAINT "freelance_testimonial_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "work_sample_case_study" ADD CONSTRAINT "work_sample_case_study_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "work_sample_case_study" ADD CONSTRAINT "work_sample_case_study_project_id_work_sample_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "work_sample_project"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "work_sample_project" ADD CONSTRAINT "work_sample_project_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;