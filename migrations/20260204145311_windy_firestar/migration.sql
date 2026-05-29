CREATE TYPE "thank_you_interview_type" AS ENUM('phone', 'video', 'inperson', 'panel', 'technical');--> statement-breakpoint
CREATE TYPE "thank_you_send_method" AS ENUM('email', 'physical', 'linkedin');--> statement-breakpoint
CREATE TYPE "thank_you_suggestion_category" AS ENUM('opening', 'body', 'closing', 'personalization');--> statement-breakpoint
CREATE TYPE "thank_you_template_style" AS ENUM('formal', 'warm', 'enthusiastic');--> statement-breakpoint
CREATE TABLE "thank_you_letter" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"recipient_name" text NOT NULL,
	"recipient_company" text NOT NULL,
	"recipient_position" text,
	"recipient_email" text,
	"interview_date" text NOT NULL,
	"interview_type" "thank_you_interview_type" DEFAULT 'inperson'::"thank_you_interview_type" NOT NULL,
	"discussion_points" text[] DEFAULT '{}'::text[] NOT NULL,
	"job_position" text NOT NULL,
	"template" "thank_you_template_style" DEFAULT 'warm'::"thank_you_template_style" NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thank_you_letter_send_tracking" (
	"id" uuid PRIMARY KEY,
	"letter_id" uuid NOT NULL,
	"sent_date" text NOT NULL,
	"method" "thank_you_send_method" DEFAULT 'email'::"thank_you_send_method" NOT NULL,
	"follow_up_date" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thank_you_letter_suggestion" (
	"id" uuid PRIMARY KEY,
	"letter_id" uuid NOT NULL,
	"category" "thank_you_suggestion_category" NOT NULL,
	"text" text NOT NULL,
	"applied" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "thank_you_letter_user_id_index" ON "thank_you_letter" ("user_id");--> statement-breakpoint
CREATE INDEX "thank_you_letter_user_id_created_at_index" ON "thank_you_letter" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "thank_you_letter_user_id_recipient_company_index" ON "thank_you_letter" ("user_id","recipient_company");--> statement-breakpoint
CREATE INDEX "thank_you_letter_send_tracking_letter_id_index" ON "thank_you_letter_send_tracking" ("letter_id");--> statement-breakpoint
CREATE INDEX "thank_you_letter_send_tracking_letter_id_sent_date_index" ON "thank_you_letter_send_tracking" ("letter_id","sent_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "thank_you_letter_suggestion_letter_id_index" ON "thank_you_letter_suggestion" ("letter_id");--> statement-breakpoint
CREATE INDEX "thank_you_letter_suggestion_letter_id_category_index" ON "thank_you_letter_suggestion" ("letter_id","category");--> statement-breakpoint
ALTER TABLE "thank_you_letter" ADD CONSTRAINT "thank_you_letter_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "thank_you_letter_send_tracking" ADD CONSTRAINT "thank_you_letter_send_tracking_34pAd0fMk40p_fkey" FOREIGN KEY ("letter_id") REFERENCES "thank_you_letter"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "thank_you_letter_suggestion" ADD CONSTRAINT "thank_you_letter_suggestion_letter_id_thank_you_letter_id_fkey" FOREIGN KEY ("letter_id") REFERENCES "thank_you_letter"("id") ON DELETE CASCADE;