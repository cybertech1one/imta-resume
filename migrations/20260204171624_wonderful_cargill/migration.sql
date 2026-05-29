CREATE TYPE "notification_type" AS ENUM('tip', 'reminder', 'milestone', 'announcement');--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"link" text,
	"metadata" jsonb,
	"read" boolean DEFAULT false NOT NULL,
	"dismissed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preference" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"tips" boolean DEFAULT true NOT NULL,
	"reminders" boolean DEFAULT true NOT NULL,
	"milestones" boolean DEFAULT true NOT NULL,
	"announcements" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "notification_user_id_index" ON "notification" ("user_id");--> statement-breakpoint
CREATE INDEX "notification_user_id_read_index" ON "notification" ("user_id","read");--> statement-breakpoint
CREATE INDEX "notification_user_id_dismissed_index" ON "notification" ("user_id","dismissed");--> statement-breakpoint
CREATE INDEX "notification_user_id_type_index" ON "notification" ("user_id","type");--> statement-breakpoint
CREATE INDEX "notification_user_id_created_at_index" ON "notification" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "notification_preference_user_id_index" ON "notification_preference" ("user_id");--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;