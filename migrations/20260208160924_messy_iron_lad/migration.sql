CREATE TABLE "career_role_requirement" (
	"id" text PRIMARY KEY,
	"role" text NOT NULL,
	"role_fr" text,
	"field" text NOT NULL,
	"experience_level" text DEFAULT 'entry',
	"description" text,
	"description_fr" text,
	"salary_min" integer,
	"salary_max" integer,
	"demand_level" text DEFAULT 'medium',
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_role_skill" (
	"id" text PRIMARY KEY,
	"role_id" text NOT NULL,
	"skill_name" text NOT NULL,
	"skill_name_fr" text,
	"category" text DEFAULT 'technical',
	"required_level" integer DEFAULT 3,
	"importance" text DEFAULT 'important',
	"industry_benchmark" numeric(3,1) DEFAULT '3.0',
	"is_required" boolean DEFAULT false,
	"sort_order" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentor_message" (
	"id" text PRIMARY KEY,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"mentor_connection_id" text,
	"subject" text,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "preferred_ai_language" text DEFAULT 'fr';--> statement-breakpoint
CREATE INDEX "career_role_requirement_field_index" ON "career_role_requirement" ("field");--> statement-breakpoint
CREATE INDEX "career_role_requirement_demand_level_index" ON "career_role_requirement" ("demand_level");--> statement-breakpoint
CREATE INDEX "career_role_requirement_is_active_index" ON "career_role_requirement" ("is_active");--> statement-breakpoint
CREATE INDEX "career_role_requirement_field_is_active_index" ON "career_role_requirement" ("field","is_active");--> statement-breakpoint
CREATE INDEX "career_role_skill_role_id_index" ON "career_role_skill" ("role_id");--> statement-breakpoint
CREATE INDEX "career_role_skill_category_index" ON "career_role_skill" ("category");--> statement-breakpoint
CREATE INDEX "career_role_skill_importance_index" ON "career_role_skill" ("importance");--> statement-breakpoint
CREATE INDEX "mentor_message_sender_id_index" ON "mentor_message" ("sender_id");--> statement-breakpoint
CREATE INDEX "mentor_message_receiver_id_index" ON "mentor_message" ("receiver_id");--> statement-breakpoint
CREATE INDEX "mentor_message_sender_id_receiver_id_index" ON "mentor_message" ("sender_id","receiver_id");--> statement-breakpoint
CREATE INDEX "mentor_message_receiver_id_is_read_index" ON "mentor_message" ("receiver_id","is_read");--> statement-breakpoint
CREATE INDEX "mentor_message_created_at_index" ON "mentor_message" ("created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "career_role_skill" ADD CONSTRAINT "career_role_skill_role_id_career_role_requirement_id_fkey" FOREIGN KEY ("role_id") REFERENCES "career_role_requirement"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "mentor_message" ADD CONSTRAINT "mentor_message_sender_id_user_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "mentor_message" ADD CONSTRAINT "mentor_message_receiver_id_user_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE CASCADE;