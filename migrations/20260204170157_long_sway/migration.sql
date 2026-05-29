CREATE TYPE "deadline_priority" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TABLE "job_deadline" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"position" text DEFAULT '' NOT NULL,
	"deadline_date" date NOT NULL,
	"deadline_time" text DEFAULT '23:59' NOT NULL,
	"priority" "deadline_priority" DEFAULT 'medium'::"deadline_priority" NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"reminder_enabled" boolean DEFAULT false NOT NULL,
	"reminder_date" date,
	"reminder_time" text,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "job_deadline_user_id_index" ON "job_deadline" ("user_id");--> statement-breakpoint
CREATE INDEX "job_deadline_user_id_completed_index" ON "job_deadline" ("user_id","completed");--> statement-breakpoint
CREATE INDEX "job_deadline_user_id_deadline_date_index" ON "job_deadline" ("user_id","deadline_date");--> statement-breakpoint
CREATE INDEX "job_deadline_user_id_priority_index" ON "job_deadline" ("user_id","priority");--> statement-breakpoint
CREATE INDEX "job_deadline_user_id_created_at_index" ON "job_deadline" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "job_deadline" ADD CONSTRAINT "job_deadline_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;