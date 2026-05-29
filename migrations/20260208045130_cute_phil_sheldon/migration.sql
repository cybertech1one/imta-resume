CREATE TYPE "partner_event_status" AS ENUM('draft', 'pending_review', 'published', 'cancelled', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "partner_event_type" AS ENUM('job_fair', 'workshop', 'webinar', 'networking', 'training', 'open_day', 'recruitment', 'conference', 'other');--> statement-breakpoint
CREATE TYPE "partner_job_status" AS ENUM('draft', 'pending_review', 'published', 'expired', 'closed', 'rejected');--> statement-breakpoint
CREATE TYPE "partner_status" AS ENUM('pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "partner_type" AS ENUM('employer', 'recruiter', 'training_center', 'government', 'ngo');--> statement-breakpoint
ALTER TYPE "user_role" ADD VALUE 'partner';--> statement-breakpoint
CREATE TABLE "partner_event" (
	"id" uuid PRIMARY KEY,
	"partner_id" uuid NOT NULL,
	"title" text NOT NULL,
	"title_fr" text,
	"description" text NOT NULL,
	"description_fr" text,
	"event_type" "partner_event_type" NOT NULL,
	"format" text NOT NULL,
	"location" text,
	"address" text,
	"city" text,
	"online_url" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"registration_deadline" timestamp with time zone,
	"capacity" integer,
	"is_free" boolean DEFAULT true NOT NULL,
	"price" integer,
	"target_audience" jsonb,
	"fields" jsonb,
	"speakers" jsonb,
	"agenda" jsonb,
	"requirements" jsonb,
	"image" text,
	"status" "partner_event_status" DEFAULT 'draft'::"partner_event_status" NOT NULL,
	"published_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" uuid,
	"rejection_reason" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"registration_count" integer DEFAULT 0 NOT NULL,
	"attendee_count" integer DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_event_registration" (
	"id" uuid PRIMARY KEY,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'registered' NOT NULL,
	"notes" text,
	"attended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_job_application" (
	"id" uuid PRIMARY KEY,
	"job_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"resume_id" uuid,
	"cover_letter" text,
	"status" text DEFAULT 'submitted' NOT NULL,
	"notes" text,
	"match_score" integer,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_job_posting" (
	"id" uuid PRIMARY KEY,
	"partner_id" uuid NOT NULL,
	"title" text NOT NULL,
	"title_fr" text,
	"description" text NOT NULL,
	"description_fr" text,
	"location" text NOT NULL,
	"region" text,
	"job_type" text NOT NULL,
	"experience_level" text NOT NULL,
	"field" text,
	"requirements" jsonb,
	"skills" jsonb,
	"education" text,
	"certifications" jsonb,
	"salary_min" integer,
	"salary_max" integer,
	"salary_period" text DEFAULT 'monthly',
	"salary_currency" text DEFAULT 'MAD',
	"benefits" jsonb,
	"application_deadline" timestamp with time zone,
	"start_date" timestamp with time zone,
	"positions" integer DEFAULT 1,
	"application_url" text,
	"application_email" text,
	"application_instructions" text,
	"status" "partner_job_status" DEFAULT 'draft'::"partner_job_status" NOT NULL,
	"published_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" uuid,
	"rejection_reason" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"application_count" integer DEFAULT 0 NOT NULL,
	"save_count" integer DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_urgent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_profile" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"company_name" text NOT NULL,
	"company_name_fr" text,
	"logo" text,
	"website" text,
	"linkedin_url" text,
	"partner_type" "partner_type" NOT NULL,
	"industry" text NOT NULL,
	"industry_fr" text,
	"description" text NOT NULL,
	"description_fr" text,
	"size" text,
	"employee_count" text,
	"headquarters" text NOT NULL,
	"locations" jsonb,
	"founded" integer,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"contact_person" text,
	"fields" jsonb,
	"status" "partner_status" DEFAULT 'pending'::"partner_status" NOT NULL,
	"approved_at" timestamp with time zone,
	"approved_by" uuid,
	"rejection_reason" text,
	"total_jobs_posted" integer DEFAULT 0 NOT NULL,
	"total_events_posted" integer DEFAULT 0 NOT NULL,
	"total_applications" integer DEFAULT 0 NOT NULL,
	"rating" real,
	"review_count" integer DEFAULT 0 NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_job" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "partner_event_partner_id_index" ON "partner_event" ("partner_id");--> statement-breakpoint
CREATE INDEX "partner_event_status_index" ON "partner_event" ("status");--> statement-breakpoint
CREATE INDEX "partner_event_event_type_index" ON "partner_event" ("event_type");--> statement-breakpoint
CREATE INDEX "partner_event_start_date_index" ON "partner_event" ("start_date");--> statement-breakpoint
CREATE INDEX "partner_event_city_index" ON "partner_event" ("city");--> statement-breakpoint
CREATE INDEX "partner_event_registration_event_id_index" ON "partner_event_registration" ("event_id");--> statement-breakpoint
CREATE INDEX "partner_event_registration_user_id_index" ON "partner_event_registration" ("user_id");--> statement-breakpoint
CREATE INDEX "partner_event_registration_status_index" ON "partner_event_registration" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "partner_event_registration_event_id_user_id_index" ON "partner_event_registration" ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "partner_job_application_job_id_index" ON "partner_job_application" ("job_id");--> statement-breakpoint
CREATE INDEX "partner_job_application_user_id_index" ON "partner_job_application" ("user_id");--> statement-breakpoint
CREATE INDEX "partner_job_application_status_index" ON "partner_job_application" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "partner_job_application_job_id_user_id_index" ON "partner_job_application" ("job_id","user_id");--> statement-breakpoint
CREATE INDEX "partner_job_posting_partner_id_index" ON "partner_job_posting" ("partner_id");--> statement-breakpoint
CREATE INDEX "partner_job_posting_status_index" ON "partner_job_posting" ("status");--> statement-breakpoint
CREATE INDEX "partner_job_posting_location_index" ON "partner_job_posting" ("location");--> statement-breakpoint
CREATE INDEX "partner_job_posting_field_index" ON "partner_job_posting" ("field");--> statement-breakpoint
CREATE INDEX "partner_job_posting_experience_level_index" ON "partner_job_posting" ("experience_level");--> statement-breakpoint
CREATE INDEX "partner_job_posting_published_at_index" ON "partner_job_posting" ("published_at");--> statement-breakpoint
CREATE INDEX "partner_job_posting_application_deadline_index" ON "partner_job_posting" ("application_deadline");--> statement-breakpoint
CREATE INDEX "partner_profile_user_id_index" ON "partner_profile" ("user_id");--> statement-breakpoint
CREATE INDEX "partner_profile_status_index" ON "partner_profile" ("status");--> statement-breakpoint
CREATE INDEX "partner_profile_partner_type_index" ON "partner_profile" ("partner_type");--> statement-breakpoint
CREATE INDEX "partner_profile_industry_index" ON "partner_profile" ("industry");--> statement-breakpoint
CREATE INDEX "partner_profile_headquarters_index" ON "partner_profile" ("headquarters");--> statement-breakpoint
CREATE INDEX "saved_job_user_id_index" ON "saved_job" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_job_user_id_job_id_index" ON "saved_job" ("user_id","job_id");--> statement-breakpoint
ALTER TABLE "partner_event" ADD CONSTRAINT "partner_event_partner_id_partner_profile_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_profile"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "partner_event" ADD CONSTRAINT "partner_event_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "partner_event_registration" ADD CONSTRAINT "partner_event_registration_event_id_partner_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "partner_event"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "partner_event_registration" ADD CONSTRAINT "partner_event_registration_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "partner_job_application" ADD CONSTRAINT "partner_job_application_job_id_partner_job_posting_id_fkey" FOREIGN KEY ("job_id") REFERENCES "partner_job_posting"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "partner_job_application" ADD CONSTRAINT "partner_job_application_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "partner_job_application" ADD CONSTRAINT "partner_job_application_resume_id_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resume"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "partner_job_posting" ADD CONSTRAINT "partner_job_posting_partner_id_partner_profile_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partner_profile"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "partner_job_posting" ADD CONSTRAINT "partner_job_posting_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "partner_profile" ADD CONSTRAINT "partner_profile_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "partner_profile" ADD CONSTRAINT "partner_profile_approved_by_user_id_fkey" FOREIGN KEY ("approved_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "saved_job" ADD CONSTRAINT "saved_job_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "saved_job" ADD CONSTRAINT "saved_job_job_id_partner_job_posting_id_fkey" FOREIGN KEY ("job_id") REFERENCES "partner_job_posting"("id") ON DELETE CASCADE;