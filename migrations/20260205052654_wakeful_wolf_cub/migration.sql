CREATE TYPE "ai_provider" AS ENUM('openai', 'anthropic', 'gemini', 'ollama', 'vercel-ai-gateway');--> statement-breakpoint
CREATE TYPE "ai_usage_status" AS ENUM('success', 'error', 'quota_exceeded');--> statement-breakpoint
CREATE TYPE "data_export_operation" AS ENUM('export', 'import');--> statement-breakpoint
CREATE TYPE "data_export_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "ai_provider_config" (
	"id" uuid PRIMARY KEY,
	"provider" "ai_provider" NOT NULL,
	"display_name" text NOT NULL,
	"api_key" text NOT NULL,
	"model" text NOT NULL,
	"base_url" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"max_tokens_per_request" integer DEFAULT 4096 NOT NULL,
	"temperature" numeric DEFAULT '0.7' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage_log" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"feature" text NOT NULL,
	"provider_id" uuid,
	"provider_name" text NOT NULL,
	"model" text NOT NULL,
	"input_tokens" integer,
	"output_tokens" integer,
	"total_tokens" integer,
	"status" "ai_usage_status" DEFAULT 'success'::"ai_usage_status" NOT NULL,
	"error_message" text,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage_quota" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"daily_request_limit" integer DEFAULT 50 NOT NULL,
	"monthly_request_limit" integer DEFAULT 500 NOT NULL,
	"max_tokens_per_request" integer DEFAULT 4096 NOT NULL,
	"daily_token_limit" integer DEFAULT 100000 NOT NULL,
	"monthly_token_limit" integer DEFAULT 1000000 NOT NULL,
	"allowed_features" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_export_history" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"operation" "data_export_operation" NOT NULL,
	"status" "data_export_status" DEFAULT 'pending'::"data_export_status" NOT NULL,
	"export_metadata" jsonb,
	"import_metadata" jsonb,
	"error_message" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_ai_quota" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"quota_id" uuid NOT NULL,
	"override_daily_request_limit" integer,
	"override_monthly_request_limit" integer,
	"override_daily_token_limit" integer,
	"override_monthly_token_limit" integer,
	"notes" text,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by" uuid
);
--> statement-breakpoint
CREATE INDEX "ai_provider_config_provider_index" ON "ai_provider_config" ("provider");--> statement-breakpoint
CREATE INDEX "ai_provider_config_is_default_index" ON "ai_provider_config" ("is_default");--> statement-breakpoint
CREATE INDEX "ai_provider_config_is_enabled_index" ON "ai_provider_config" ("is_enabled");--> statement-breakpoint
CREATE INDEX "ai_usage_log_user_id_index" ON "ai_usage_log" ("user_id");--> statement-breakpoint
CREATE INDEX "ai_usage_log_user_id_created_at_index" ON "ai_usage_log" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "ai_usage_log_feature_index" ON "ai_usage_log" ("feature");--> statement-breakpoint
CREATE INDEX "ai_usage_log_created_at_index" ON "ai_usage_log" ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "data_export_history_user_id_index" ON "data_export_history" ("user_id");--> statement-breakpoint
CREATE INDEX "data_export_history_user_id_created_at_index" ON "data_export_history" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "data_export_history_user_id_operation_index" ON "data_export_history" ("user_id","operation");--> statement-breakpoint
CREATE INDEX "user_ai_quota_user_id_index" ON "user_ai_quota" ("user_id");--> statement-breakpoint
CREATE INDEX "user_ai_quota_quota_id_index" ON "user_ai_quota" ("quota_id");--> statement-breakpoint
ALTER TABLE "ai_usage_log" ADD CONSTRAINT "ai_usage_log_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_usage_log" ADD CONSTRAINT "ai_usage_log_provider_id_ai_provider_config_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "ai_provider_config"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "data_export_history" ADD CONSTRAINT "data_export_history_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_ai_quota" ADD CONSTRAINT "user_ai_quota_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_ai_quota" ADD CONSTRAINT "user_ai_quota_quota_id_ai_usage_quota_id_fkey" FOREIGN KEY ("quota_id") REFERENCES "ai_usage_quota"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "user_ai_quota" ADD CONSTRAINT "user_ai_quota_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by") REFERENCES "user"("id") ON DELETE SET NULL;