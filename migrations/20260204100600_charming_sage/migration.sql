CREATE TABLE "culture_match_assessment" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"work_style_answers" jsonb DEFAULT '{}' NOT NULL,
	"values_scores" jsonb DEFAULT '{}' NOT NULL,
	"red_flags_checked" text[] DEFAULT '{}'::text[] NOT NULL,
	"personal_profile" jsonb,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "culture_match_assessment_user_id_index" ON "culture_match_assessment" ("user_id");--> statement-breakpoint
ALTER TABLE "culture_match_assessment" ADD CONSTRAINT "culture_match_assessment_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;