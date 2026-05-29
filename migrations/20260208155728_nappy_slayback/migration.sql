ALTER TYPE "ai_provider" ADD VALUE 'deepseek';--> statement-breakpoint
ALTER TYPE "ai_provider" ADD VALUE 'groq';--> statement-breakpoint
ALTER TYPE "ai_provider" ADD VALUE 'mistral';--> statement-breakpoint
ALTER TYPE "ai_provider" ADD VALUE 'togetherai';--> statement-breakpoint
ALTER TYPE "ai_provider" ADD VALUE 'openrouter';--> statement-breakpoint
CREATE TABLE "ai_global_settings" (
	"id" text PRIMARY KEY,
	"max_daily_requests" integer DEFAULT 10000,
	"max_monthly_requests" integer DEFAULT 100000,
	"max_daily_tokens" integer DEFAULT 10000000,
	"max_monthly_tokens" integer DEFAULT 100000000,
	"alert_threshold_percent" integer DEFAULT 80,
	"suspend_on_exceed" boolean DEFAULT false,
	"default_language" text DEFAULT 'fr',
	"allowed_languages" text[] DEFAULT '{fr,ar,en,darija}'::text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certification_library" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"name_fr" text,
	"provider" text NOT NULL,
	"field" text NOT NULL,
	"level" text DEFAULT 'intermediate',
	"duration" text,
	"cost" text,
	"description" text,
	"description_fr" text,
	"skills" text[],
	"prerequisites" text[],
	"url" text,
	"is_recommended" boolean DEFAULT false,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_checklist_reference" (
	"id" text PRIMARY KEY,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"title_fr" text,
	"description" text,
	"description_fr" text,
	"tip" text,
	"tip_fr" text,
	"link" text,
	"link_label" text,
	"icon" text,
	"sort_order" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "certification_library_field_index" ON "certification_library" ("field");--> statement-breakpoint
CREATE INDEX "certification_library_level_index" ON "certification_library" ("level");--> statement-breakpoint
CREATE INDEX "certification_library_is_active_index" ON "certification_library" ("is_active");--> statement-breakpoint
CREATE INDEX "certification_library_is_recommended_index" ON "certification_library" ("is_recommended");--> statement-breakpoint
CREATE INDEX "certification_library_field_is_active_index" ON "certification_library" ("field","is_active");--> statement-breakpoint
CREATE INDEX "interview_checklist_reference_category_index" ON "interview_checklist_reference" ("category");--> statement-breakpoint
CREATE INDEX "interview_checklist_reference_is_active_index" ON "interview_checklist_reference" ("is_active");--> statement-breakpoint
CREATE INDEX "interview_checklist_reference_category_sort_order_index" ON "interview_checklist_reference" ("category","sort_order");