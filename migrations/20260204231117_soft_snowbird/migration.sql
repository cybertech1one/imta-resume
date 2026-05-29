CREATE TYPE "shortcut_category" AS ENUM('navigation', 'actions', 'editor', 'general');--> statement-breakpoint
CREATE TABLE "user_keyboard_shortcut" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"shortcut_id" text NOT NULL,
	"category" "shortcut_category" NOT NULL,
	"keys" text[] NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_keyboard_shortcut_user_id_shortcut_id_unique" UNIQUE("user_id","shortcut_id")
);
--> statement-breakpoint
CREATE INDEX "user_keyboard_shortcut_user_id_index" ON "user_keyboard_shortcut" ("user_id");--> statement-breakpoint
CREATE INDEX "user_keyboard_shortcut_user_id_category_index" ON "user_keyboard_shortcut" ("user_id","category");--> statement-breakpoint
ALTER TABLE "user_keyboard_shortcut" ADD CONSTRAINT "user_keyboard_shortcut_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;