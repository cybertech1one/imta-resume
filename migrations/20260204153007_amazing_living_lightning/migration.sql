CREATE TYPE "company_industry" AS ENUM('healthcare', 'industrial', 'manufacturing', 'mining', 'automotive', 'services', 'energy', 'tech');--> statement-breakpoint
CREATE TYPE "insights_barrier" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "insights_competition" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "insights_experience_level" AS ENUM('entry', 'mid', 'senior', 'executive');--> statement-breakpoint
CREATE TYPE "insights_hotness" AS ENUM('cold', 'warm', 'hot', 'fire');--> statement-breakpoint
CREATE TYPE "insights_industry" AS ENUM('healthcare', 'industrial', 'hse', 'tech', 'automotive', 'services');--> statement-breakpoint
CREATE TYPE "insights_region" AS ENUM('casablanca', 'rabat', 'tanger', 'marrakech', 'fes', 'agadir', 'kenitra', 'meknes');--> statement-breakpoint
CREATE TYPE "insights_skill_trend" AS ENUM('rising', 'stable', 'declining');--> statement-breakpoint
CREATE TYPE "insights_trend" AS ENUM('up', 'down', 'stable');--> statement-breakpoint
CREATE TYPE "video_analysis_category" AS ENUM('body_language', 'eye_contact', 'voice', 'confidence', 'posture', 'facial_expression');--> statement-breakpoint
CREATE TABLE "company_favorite" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_favorite_user_id_company_id_unique" UNIQUE("user_id","company_id")
);
--> statement-breakpoint
CREATE TABLE "company_hiring_trend" (
	"id" uuid PRIMARY KEY,
	"company" text NOT NULL UNIQUE,
	"industry" "insights_industry" NOT NULL,
	"open_positions" integer DEFAULT 0 NOT NULL,
	"hiring_growth" integer DEFAULT 0 NOT NULL,
	"avg_salary" integer DEFAULT 0 NOT NULL,
	"employee_count" text NOT NULL,
	"hiring_freeze" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_profile" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"logo" text,
	"industry" "company_industry" NOT NULL,
	"description" text NOT NULL,
	"mission" text NOT NULL,
	"vision" text NOT NULL,
	"location" text NOT NULL,
	"headquarters" text NOT NULL,
	"employee_count" text NOT NULL,
	"founded" integer NOT NULL,
	"website" text,
	"linkedin" text,
	"revenue" text,
	"stock_symbol" text,
	"culture_insights" jsonb DEFAULT '[]' NOT NULL,
	"culture_values" jsonb DEFAULT '[]' NOT NULL,
	"culture_overall_score" integer DEFAULT 0 NOT NULL,
	"reviews" jsonb DEFAULT '[]' NOT NULL,
	"reviews_average_rating" real DEFAULT 0 NOT NULL,
	"reviews_total_count" integer DEFAULT 0 NOT NULL,
	"reviews_recommend_rate" integer DEFAULT 0 NOT NULL,
	"reviews_ceo_approval_rate" integer DEFAULT 0 NOT NULL,
	"interview_questions" jsonb DEFAULT '[]' NOT NULL,
	"interview_tips" jsonb DEFAULT '[]' NOT NULL,
	"interview_difficulty" real DEFAULT 0 NOT NULL,
	"interview_average_duration" text,
	"interview_process_steps" text[] DEFAULT '{}'::text[] NOT NULL,
	"salaries" jsonb DEFAULT '[]' NOT NULL,
	"benefits" jsonb DEFAULT '[]' NOT NULL,
	"news" jsonb DEFAULT '[]' NOT NULL,
	"key_people" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitive_landscape" (
	"id" uuid PRIMARY KEY,
	"industry" "insights_industry" NOT NULL UNIQUE,
	"total_companies" integer DEFAULT 0 NOT NULL,
	"market_leaders" text[] DEFAULT '{}'::text[] NOT NULL,
	"emerging_players" text[] DEFAULT '{}'::text[] NOT NULL,
	"avg_company_size" text NOT NULL,
	"barrier_to_entry" "insights_barrier" DEFAULT 'medium'::"insights_barrier" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industry_growth_projection" (
	"id" uuid PRIMARY KEY,
	"industry" "insights_industry" NOT NULL UNIQUE,
	"current_size" integer DEFAULT 0 NOT NULL,
	"projected_size" integer DEFAULT 0 NOT NULL,
	"growth_rate" integer DEFAULT 0 NOT NULL,
	"timeframe" text NOT NULL,
	"key_drivers" text[] DEFAULT '{}'::text[] NOT NULL,
	"risks" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industry_trend" (
	"id" uuid PRIMARY KEY,
	"industry" "insights_industry" NOT NULL UNIQUE,
	"current_demand" integer DEFAULT 0 NOT NULL,
	"change_percent" integer DEFAULT 0 NOT NULL,
	"trend" "insights_trend" DEFAULT 'stable'::"insights_trend" NOT NULL,
	"open_positions" integer DEFAULT 0 NOT NULL,
	"avg_time_to_hire" integer DEFAULT 0 NOT NULL,
	"competition_level" "insights_competition" DEFAULT 'medium'::"insights_competition" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_demand_indicator" (
	"id" uuid PRIMARY KEY,
	"skill" text NOT NULL,
	"industry" "insights_industry" NOT NULL,
	"demand_score" integer DEFAULT 0 NOT NULL,
	"growth_rate" integer DEFAULT 0 NOT NULL,
	"total_jobs" integer DEFAULT 0 NOT NULL,
	"avg_salary_premium" integer DEFAULT 0 NOT NULL,
	"hotness" "insights_hotness" DEFAULT 'warm'::"insights_hotness" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_demand_indicator_skill_industry_unique" UNIQUE("skill","industry")
);
--> statement-breakpoint
CREATE TABLE "regional_comparison" (
	"id" uuid PRIMARY KEY,
	"region" "insights_region" NOT NULL UNIQUE,
	"total_jobs" integer DEFAULT 0 NOT NULL,
	"avg_salary" integer DEFAULT 0 NOT NULL,
	"cost_of_living_index" integer DEFAULT 0 NOT NULL,
	"quality_of_life_score" integer DEFAULT 0 NOT NULL,
	"job_growth_rate" integer DEFAULT 0 NOT NULL,
	"top_industries" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "remote_work_stat" (
	"id" uuid PRIMARY KEY,
	"industry" "insights_industry" NOT NULL UNIQUE,
	"fully_remote" integer DEFAULT 0 NOT NULL,
	"hybrid" integer DEFAULT 0 NOT NULL,
	"onsite" integer DEFAULT 0 NOT NULL,
	"remote_growth" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salary_benchmark" (
	"id" uuid PRIMARY KEY,
	"role" text NOT NULL,
	"industry" "insights_industry" NOT NULL,
	"experience_level" "insights_experience_level" NOT NULL,
	"region" "insights_region" NOT NULL,
	"min_salary" integer DEFAULT 0 NOT NULL,
	"max_salary" integer DEFAULT 0 NOT NULL,
	"median_salary" integer DEFAULT 0 NOT NULL,
	"percentile_25" integer DEFAULT 0 NOT NULL,
	"percentile_75" integer DEFAULT 0 NOT NULL,
	"year_over_year_change" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "salary_benchmark_role_industry_experience_level_region_unique" UNIQUE("role","industry","experience_level","region")
);
--> statement-breakpoint
CREATE TABLE "skills_heatmap" (
	"id" uuid PRIMARY KEY,
	"skill" text NOT NULL UNIQUE,
	"industries" jsonb DEFAULT '{"healthcare":0,"industrial":0,"hse":0,"tech":0,"automotive":0,"services":0}' NOT NULL,
	"overall_demand" integer DEFAULT 0 NOT NULL,
	"trend" "insights_skill_trend" DEFAULT 'stable'::"insights_skill_trend" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_insights_profile" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"target_industries" jsonb DEFAULT '[]' NOT NULL,
	"experience_level" "insights_experience_level" DEFAULT 'mid'::"insights_experience_level" NOT NULL,
	"preferred_regions" jsonb DEFAULT '[]' NOT NULL,
	"skills" text[] DEFAULT '{}'::text[] NOT NULL,
	"target_salary" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_analysis_posture_checklist" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"checked_items" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_analysis_result" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"overall_score" integer NOT NULL,
	"duration" integer NOT NULL,
	"categories" jsonb DEFAULT '[]' NOT NULL,
	"voice_metrics" jsonb NOT NULL,
	"highlights" jsonb DEFAULT '[]' NOT NULL,
	"recommendations" text[] DEFAULT '{}'::text[] NOT NULL,
	"video_url" text,
	"thumbnail_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "company_favorite_user_id_index" ON "company_favorite" ("user_id");--> statement-breakpoint
CREATE INDEX "company_hiring_trend_industry_index" ON "company_hiring_trend" ("industry");--> statement-breakpoint
CREATE INDEX "company_hiring_trend_hiring_growth_index" ON "company_hiring_trend" ("hiring_growth" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "company_profile_user_id_index" ON "company_profile" ("user_id");--> statement-breakpoint
CREATE INDEX "company_profile_user_id_industry_index" ON "company_profile" ("user_id","industry");--> statement-breakpoint
CREATE INDEX "company_profile_user_id_name_index" ON "company_profile" ("user_id","name");--> statement-breakpoint
CREATE INDEX "company_profile_user_id_created_at_index" ON "company_profile" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "competitive_landscape_industry_index" ON "competitive_landscape" ("industry");--> statement-breakpoint
CREATE INDEX "industry_growth_projection_industry_index" ON "industry_growth_projection" ("industry");--> statement-breakpoint
CREATE INDEX "industry_growth_projection_growth_rate_index" ON "industry_growth_projection" ("growth_rate" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "industry_trend_industry_index" ON "industry_trend" ("industry");--> statement-breakpoint
CREATE INDEX "job_demand_indicator_industry_index" ON "job_demand_indicator" ("industry");--> statement-breakpoint
CREATE INDEX "job_demand_indicator_hotness_index" ON "job_demand_indicator" ("hotness");--> statement-breakpoint
CREATE INDEX "regional_comparison_region_index" ON "regional_comparison" ("region");--> statement-breakpoint
CREATE INDEX "regional_comparison_total_jobs_index" ON "regional_comparison" ("total_jobs" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "remote_work_stat_industry_index" ON "remote_work_stat" ("industry");--> statement-breakpoint
CREATE INDEX "salary_benchmark_industry_index" ON "salary_benchmark" ("industry");--> statement-breakpoint
CREATE INDEX "salary_benchmark_region_index" ON "salary_benchmark" ("region");--> statement-breakpoint
CREATE INDEX "salary_benchmark_experience_level_index" ON "salary_benchmark" ("experience_level");--> statement-breakpoint
CREATE INDEX "salary_benchmark_industry_region_experience_level_index" ON "salary_benchmark" ("industry","region","experience_level");--> statement-breakpoint
CREATE INDEX "skills_heatmap_skill_index" ON "skills_heatmap" ("skill");--> statement-breakpoint
CREATE INDEX "skills_heatmap_overall_demand_index" ON "skills_heatmap" ("overall_demand" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_insights_profile_user_id_index" ON "user_insights_profile" ("user_id");--> statement-breakpoint
CREATE INDEX "video_analysis_posture_checklist_user_id_index" ON "video_analysis_posture_checklist" ("user_id");--> statement-breakpoint
CREATE INDEX "video_analysis_result_user_id_index" ON "video_analysis_result" ("user_id");--> statement-breakpoint
CREATE INDEX "video_analysis_result_user_id_created_at_index" ON "video_analysis_result" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "video_analysis_result_user_id_overall_score_index" ON "video_analysis_result" ("user_id","overall_score" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "company_favorite" ADD CONSTRAINT "company_favorite_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "company_favorite" ADD CONSTRAINT "company_favorite_company_id_company_profile_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profile"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "company_profile" ADD CONSTRAINT "company_profile_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_insights_profile" ADD CONSTRAINT "user_insights_profile_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "video_analysis_posture_checklist" ADD CONSTRAINT "video_analysis_posture_checklist_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "video_analysis_result" ADD CONSTRAINT "video_analysis_result_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;