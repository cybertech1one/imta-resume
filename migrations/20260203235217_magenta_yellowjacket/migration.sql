CREATE TYPE "application_status" AS ENUM('saved', 'applied', 'phone_screen', 'interview', 'offer', 'rejected', 'withdrawn', 'accepted');--> statement-breakpoint
CREATE TYPE "certification_status" AS ENUM('planned', 'in_progress', 'completed', 'expired');--> statement-breakpoint
CREATE TYPE "contact_relationship" AS ENUM('colleague', 'mentor', 'recruiter', 'hiring_manager', 'industry_peer', 'alumni', 'referral', 'other');--> statement-breakpoint
CREATE TYPE "goal_status" AS ENUM('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled');--> statement-breakpoint
CREATE TYPE "imta_program" AS ENUM('sage_femme', 'infirmier_polyvalent', 'aide_soignant', 'infirmier_auxiliaire', 'conducteur_engins', 'mecanique_engins', 'tourneur_industriel', 'cariste', 'electromecanique', 'soudure', 'hse_specialist', 'other');--> statement-breakpoint
CREATE TYPE "training_category" AS ENUM('healthcare', 'industrial', 'hse', 'technology', 'business', 'other');--> statement-breakpoint
CREATE TYPE "training_interest_status" AS ENUM('interested', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "training_program_type" AS ENUM('imta_program', 'external_course', 'certification', 'bootcamp', 'self_learning');--> statement-breakpoint
CREATE TABLE "application_activity" (
	"id" uuid PRIMARY KEY,
	"application_id" uuid NOT NULL,
	"activity_type" text NOT NULL,
	"description" text,
	"old_status" "application_status",
	"new_status" "application_status",
	"scheduled_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_goal" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"status" "goal_status" DEFAULT 'not_started'::"goal_status" NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"target_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"progress" integer DEFAULT 0 NOT NULL,
	"tags" text[] DEFAULT '{}'::text[],
	"metrics" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certification" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"issuer" text NOT NULL,
	"category" text,
	"status" "certification_status" DEFAULT 'planned'::"certification_status" NOT NULL,
	"credential_id" text,
	"credential_url" text,
	"issue_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"cost" integer,
	"currency" text DEFAULT 'MAD',
	"notes" text,
	"reminder_days" integer DEFAULT 30,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_item" (
	"id" uuid PRIMARY KEY,
	"checklist_id" uuid NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_interaction" (
	"id" uuid PRIMARY KEY,
	"contact_id" uuid NOT NULL,
	"interaction_type" text NOT NULL,
	"description" text,
	"outcome" text,
	"follow_up_needed" boolean DEFAULT false,
	"follow_up_date" timestamp with time zone,
	"interacted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cover_letter" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"application_id" uuid,
	"resume_id" uuid,
	"name" text NOT NULL,
	"company_name" text,
	"position" text,
	"template" text DEFAULT 'formal',
	"tone" text DEFAULT 'professional',
	"content" text NOT NULL,
	"tags" text[] DEFAULT '{}'::text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goal_milestone" (
	"id" uuid PRIMARY KEY,
	"goal_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"due_date" timestamp with time zone,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_checklist" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"application_id" uuid,
	"company_name" text NOT NULL,
	"position" text NOT NULL,
	"interview_date" timestamp with time zone,
	"interview_type" text,
	"interviewer_name" text,
	"interviewer_role" text,
	"notes" text,
	"status" text DEFAULT 'preparing' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_application" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"resume_id" uuid,
	"company_name" text NOT NULL,
	"position" text NOT NULL,
	"location" text,
	"job_url" text,
	"job_description" text,
	"salary" text,
	"salary_min" integer,
	"salary_max" integer,
	"salary_currency" text DEFAULT 'MAD',
	"status" "application_status" DEFAULT 'saved'::"application_status" NOT NULL,
	"applied_at" timestamp with time zone,
	"deadline" timestamp with time zone,
	"source" text,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"notes" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_remote" boolean DEFAULT false,
	"work_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entry" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"title" text,
	"content" text,
	"mood" text,
	"applications_submitted" integer DEFAULT 0,
	"interviews_completed" integer DEFAULT 0,
	"networking_activities" integer DEFAULT 0,
	"wins" text[] DEFAULT '{}'::text[],
	"challenges" text[] DEFAULT '{}'::text[],
	"learnings" text[] DEFAULT '{}'::text[],
	"tomorrow_goals" text[] DEFAULT '{}'::text[],
	"tags" text[] DEFAULT '{}'::text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journal_entry_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "networking_contact" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"company" text,
	"position" text,
	"linkedin_url" text,
	"relationship" "contact_relationship" DEFAULT 'other'::"contact_relationship" NOT NULL,
	"relationship_strength" text DEFAULT 'moderate',
	"how_met" text,
	"notes" text,
	"tags" text[] DEFAULT '{}'::text[],
	"last_contacted_at" timestamp with time zone,
	"next_follow_up_at" timestamp with time zone,
	"is_favorite" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salary_record" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"position" text NOT NULL,
	"base_salary" integer NOT NULL,
	"currency" text DEFAULT 'MAD' NOT NULL,
	"bonus" integer,
	"commission" integer,
	"other_compensation" integer,
	"total_compensation" integer NOT NULL,
	"pay_frequency" text DEFAULT 'monthly' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"is_current" boolean DEFAULT false NOT NULL,
	"notes" text,
	"benefits" text[] DEFAULT '{}'::text[],
	"location" text,
	"industry" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_training_interests" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"program_id" text NOT NULL,
	"program_name" text NOT NULL,
	"program_type" "training_program_type" NOT NULL,
	"category" "training_category" NOT NULL,
	"status" "training_interest_status" DEFAULT 'interested'::"training_interest_status" NOT NULL,
	"start_date" timestamp with time zone,
	"completion_date" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview_session" ADD COLUMN "program" "imta_program";--> statement-breakpoint
CREATE INDEX "application_activity_application_id_index" ON "application_activity" ("application_id");--> statement-breakpoint
CREATE INDEX "application_activity_application_id_created_at_index" ON "application_activity" ("application_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "career_goal_user_id_index" ON "career_goal" ("user_id");--> statement-breakpoint
CREATE INDEX "career_goal_user_id_status_index" ON "career_goal" ("user_id","status");--> statement-breakpoint
CREATE INDEX "career_goal_user_id_category_index" ON "career_goal" ("user_id","category");--> statement-breakpoint
CREATE INDEX "career_goal_user_id_target_date_index" ON "career_goal" ("user_id","target_date");--> statement-breakpoint
CREATE INDEX "certification_user_id_index" ON "certification" ("user_id");--> statement-breakpoint
CREATE INDEX "certification_user_id_status_index" ON "certification" ("user_id","status");--> statement-breakpoint
CREATE INDEX "certification_user_id_expiry_date_index" ON "certification" ("user_id","expiry_date");--> statement-breakpoint
CREATE INDEX "certification_user_id_category_index" ON "certification" ("user_id","category");--> statement-breakpoint
CREATE INDEX "checklist_item_checklist_id_index" ON "checklist_item" ("checklist_id");--> statement-breakpoint
CREATE INDEX "checklist_item_checklist_id_category_index" ON "checklist_item" ("checklist_id","category");--> statement-breakpoint
CREATE INDEX "contact_interaction_contact_id_index" ON "contact_interaction" ("contact_id");--> statement-breakpoint
CREATE INDEX "contact_interaction_contact_id_interacted_at_index" ON "contact_interaction" ("contact_id","interacted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "cover_letter_user_id_index" ON "cover_letter" ("user_id");--> statement-breakpoint
CREATE INDEX "cover_letter_user_id_created_at_index" ON "cover_letter" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "cover_letter_application_id_index" ON "cover_letter" ("application_id");--> statement-breakpoint
CREATE INDEX "cover_letter_resume_id_index" ON "cover_letter" ("resume_id");--> statement-breakpoint
CREATE INDEX "goal_milestone_goal_id_index" ON "goal_milestone" ("goal_id");--> statement-breakpoint
CREATE INDEX "goal_milestone_goal_id_order_index" ON "goal_milestone" ("goal_id","order");--> statement-breakpoint
CREATE INDEX "interview_checklist_user_id_index" ON "interview_checklist" ("user_id");--> statement-breakpoint
CREATE INDEX "interview_checklist_user_id_interview_date_index" ON "interview_checklist" ("user_id","interview_date");--> statement-breakpoint
CREATE INDEX "interview_checklist_application_id_index" ON "interview_checklist" ("application_id");--> statement-breakpoint
CREATE INDEX "interview_session_program_index" ON "interview_session" ("program");--> statement-breakpoint
CREATE INDEX "job_application_user_id_index" ON "job_application" ("user_id");--> statement-breakpoint
CREATE INDEX "job_application_user_id_status_index" ON "job_application" ("user_id","status");--> statement-breakpoint
CREATE INDEX "job_application_user_id_created_at_index" ON "job_application" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "job_application_user_id_company_name_index" ON "job_application" ("user_id","company_name");--> statement-breakpoint
CREATE INDEX "journal_entry_user_id_index" ON "journal_entry" ("user_id");--> statement-breakpoint
CREATE INDEX "journal_entry_user_id_date_index" ON "journal_entry" ("user_id","date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "journal_entry_user_id_mood_index" ON "journal_entry" ("user_id","mood");--> statement-breakpoint
CREATE INDEX "networking_contact_user_id_index" ON "networking_contact" ("user_id");--> statement-breakpoint
CREATE INDEX "networking_contact_user_id_relationship_index" ON "networking_contact" ("user_id","relationship");--> statement-breakpoint
CREATE INDEX "networking_contact_user_id_company_index" ON "networking_contact" ("user_id","company");--> statement-breakpoint
CREATE INDEX "networking_contact_user_id_last_contacted_at_index" ON "networking_contact" ("user_id","last_contacted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "networking_contact_user_id_next_follow_up_at_index" ON "networking_contact" ("user_id","next_follow_up_at");--> statement-breakpoint
CREATE INDEX "salary_record_user_id_index" ON "salary_record" ("user_id");--> statement-breakpoint
CREATE INDEX "salary_record_user_id_start_date_index" ON "salary_record" ("user_id","start_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "salary_record_user_id_is_current_index" ON "salary_record" ("user_id","is_current");--> statement-breakpoint
CREATE INDEX "user_training_interests_user_id_index" ON "user_training_interests" ("user_id");--> statement-breakpoint
CREATE INDEX "user_training_interests_user_id_status_index" ON "user_training_interests" ("user_id","status");--> statement-breakpoint
CREATE INDEX "user_training_interests_user_id_category_index" ON "user_training_interests" ("user_id","category");--> statement-breakpoint
CREATE INDEX "user_training_interests_program_id_index" ON "user_training_interests" ("program_id");--> statement-breakpoint
CREATE INDEX "user_training_interests_user_id_created_at_index" ON "user_training_interests" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "application_activity" ADD CONSTRAINT "application_activity_application_id_job_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_application"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "career_goal" ADD CONSTRAINT "career_goal_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "certification" ADD CONSTRAINT "certification_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "checklist_item" ADD CONSTRAINT "checklist_item_checklist_id_interview_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "interview_checklist"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "contact_interaction" ADD CONSTRAINT "contact_interaction_contact_id_networking_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "networking_contact"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cover_letter" ADD CONSTRAINT "cover_letter_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cover_letter" ADD CONSTRAINT "cover_letter_application_id_job_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_application"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cover_letter" ADD CONSTRAINT "cover_letter_resume_id_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resume"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "goal_milestone" ADD CONSTRAINT "goal_milestone_goal_id_career_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "career_goal"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "interview_checklist" ADD CONSTRAINT "interview_checklist_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "interview_checklist" ADD CONSTRAINT "interview_checklist_application_id_job_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_application"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_resume_id_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resume"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "journal_entry" ADD CONSTRAINT "journal_entry_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "networking_contact" ADD CONSTRAINT "networking_contact_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "salary_record" ADD CONSTRAINT "salary_record_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_training_interests" ADD CONSTRAINT "user_training_interests_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;