-- QR Code Tables Migration
-- Created: 2026-02-04

-- Create QR code size enum
CREATE TYPE "qr_size" AS ENUM('small', 'medium', 'large');
--> statement-breakpoint

-- Create QR code style enum
CREATE TYPE "qr_style" AS ENUM('square', 'rounded', 'dots');
--> statement-breakpoint

-- Create QR code table
CREATE TABLE "qr_code" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"foreground_color" text DEFAULT '#000000' NOT NULL,
	"background_color" text DEFAULT '#ffffff' NOT NULL,
	"size" "qr_size" DEFAULT 'medium' NOT NULL,
	"style" "qr_style" DEFAULT 'square' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Create QR code scan statistics table
CREATE TABLE "qr_code_scan" (
	"id" uuid PRIMARY KEY NOT NULL,
	"qr_code_id" uuid NOT NULL,
	"scanned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"device" text,
	"location" text,
	"source" text,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "qr_code" ADD CONSTRAINT "qr_code_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "qr_code_scan" ADD CONSTRAINT "qr_code_scan_qr_code_id_qr_code_id_fk" FOREIGN KEY ("qr_code_id") REFERENCES "public"."qr_code"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Create indexes for qr_code
CREATE INDEX "qr_code_user_id_idx" ON "qr_code" USING btree ("user_id");
--> statement-breakpoint

CREATE INDEX "qr_code_user_id_created_at_idx" ON "qr_code" USING btree ("user_id", "created_at" DESC);
--> statement-breakpoint

-- Create indexes for qr_code_scan
CREATE INDEX "qr_code_scan_qr_code_id_idx" ON "qr_code_scan" USING btree ("qr_code_id");
--> statement-breakpoint

CREATE INDEX "qr_code_scan_qr_code_id_scanned_at_idx" ON "qr_code_scan" USING btree ("qr_code_id", "scanned_at" DESC);
--> statement-breakpoint

CREATE INDEX "qr_code_scan_scanned_at_idx" ON "qr_code_scan" USING btree ("scanned_at" DESC);
