# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IMTA Resume is a free, open-source resume builder built with TanStack Start (React 19 + Vite), using ORPC for type-safe RPC APIs, Drizzle ORM with PostgreSQL, and Better Auth for authentication.

## Development Commands

```bash
# Start development server (runs on port 3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Linting (uses Biome)
pnpm lint

# Type checking
pnpm typecheck

# Database operations
pnpm db:generate    # Generate migration files
pnpm db:migrate     # Run migrations
pnpm db:push        # Push schema changes directly
pnpm db:studio      # Open Drizzle Studio

# Extract i18n strings for translation
pnpm lingui:extract

# Find unused exports
pnpm knip
```

## Local Development Setup

1. Copy `.env.example` to `.env` and configure environment variables
2. Start required services: `docker compose -f compose.dev.yml up -d`
   - PostgreSQL (port 5432)
   - Browserless/Chromium for PDF generation (port 4000)
   - SeaweedFS for S3-compatible storage (port 8333)
   - Mailpit for email testing (ports 1025, 8025)
   - Adminer for DB management (port 8080)
3. Run `pnpm dev`

## Architecture

### Directory Structure

- `src/routes/` - TanStack Router file-based routing
- `src/integrations/` - External service integrations (auth, database, ORPC, AI, email)
- `src/integrations/orpc/router` - oRPC server routers
- `src/integrations/orpc/services` - oRPC server services
- `src/components/` - React components organized by feature
- `src/schema/` - Zod schemas for validation
- `plugins/` - Nitro server plugins (eg. auto-migration on startup)
- `migrations/` - Drizzle database migrations
- `locales/` - i18n translation files (managed by Lingui)

### Key Integrations (`src/integrations/`)

- **auth/** - Better Auth configuration and client
- **drizzle/** - Database schema and client (PostgreSQL)
- **orpc/** - Type-safe RPC router with procedures for ai, auth, flags, printer, resume, statistics, storage
- **query/** - TanStack Query client configuration
- **ai/** - AI provider integrations (OpenAI, Anthropic, Google Gemini, Ollama)

### Resume Data Model

The resume schema is defined in `src/schema/resume/data.ts`. Key concepts:
- **ResumeData** - Complete resume data including basics, sections, customSections, metadata
- **Sections** - Built-in sections (profiles, experience, education, skills, etc.)
- **CustomSections** - User-created sections that follow one of the built-in section types
- **Metadata** - Template, layout, typography, design settings, custom CSS

### Resume Templates

Templates are React components in `src/components/resume/templates/`. Each template (azurill, bronzor, chikorita, etc.) renders the resume data with different visual styles. Templates use shared components from `src/components/resume/shared/`.

### Database Schema

Defined in `src/integrations/drizzle/schema.ts`:
- `user`, `session`, `account`, `verification`, `twoFactor`, `passkey`, `apikey` - Better Auth tables
- `resume` - Stores Resume Data as JSONB (defined in `src/schema/resume/data.ts`)
- `resumeStatistics` - Views/Download for Resume Tracking
- `ai_provider_config` - Admin-configured AI providers (OpenAI, Anthropic, Gemini, Ollama, Vercel AI Gateway)
- `ai_usage_quota` - Quota plans with daily/monthly request and token limits
- `user_ai_quota` - Per-user quota assignments with optional overrides
- `ai_usage_log` - Tracks every AI API call (feature, tokens, status, duration)
- `interview_session`, `interview_analysis` - Interview practice sessions and AI analysis
- `interview_tip_favorite`, `question_bank_favorite` - User favorites for tips and questions

### Routing

Uses TanStack Router with file-based routing. Key routes:
- `/_home/` - Public landing pages
- `/auth/` - Authentication flows
- `/dashboard/` - User dashboard and resume management
- `/builder/$resumeId/` - Resume editor
- `/printer/$resumeId/` - PDF rendering endpoint
- `/api/` - Public API endpoints

### State Management

- **Zustand** - Client-side state (resume editor state in `src/components/resume/store/`)
- **TanStack Query** - Server state and caching (configured via ORPC integration)

## Code Style

- Uses Biome for linting and formatting
- Tab indentation, double quotes, 120 character line width
- Path alias: `@/` maps to `src/`
- Tailwind CSS v4 with sorted class names (enforced by Biome)
- Uses `cn()` utility for conditional class names

## Environment Variables

Key variables (see `.env.example` for full list):
- `APP_URL` - Application URL
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Secret for authentication
- `PRINTER_ENDPOINT` - WebSocket endpoint for PDF printer service
- `S3_*` - S3-compatible storage configuration
- `FLAG_*` - Feature flags

## CRITICAL: No Mock Data or Mockups

**NEVER create mock data, fake data, or UI mockups when building features.** All features must be:

1. **Backend-controlled** - All data must be stored in PostgreSQL via Drizzle ORM
2. **Real CRUD operations** - Create proper oRPC services and routers for all data operations
3. **No localStorage for persistent data** - Use the database for all user data
4. **Functional from the start** - Every UI component must connect to real backend APIs

When building a new feature:
1. Add database tables to `src/integrations/drizzle/schema.ts`
2. Create service in `src/integrations/orpc/services/`
3. Create router in `src/integrations/orpc/router/`
4. Update `src/integrations/orpc/router/index.ts` to export the router
5. Run `pnpm db:generate` and `pnpm db:migrate` to apply schema changes
6. Build the frontend that connects to these real APIs

This ensures all features are production-ready and actually work with real data.

## AI Configuration System

### Architecture

The AI system uses a server-side key management pattern. Admins configure providers via the admin dashboard, and API keys are stored server-side in `ai_provider_config`. Users never see or manage API keys.

**Key files:**
- `src/integrations/orpc/services/ai-config.ts` - Provider CRUD operations
- `src/integrations/orpc/services/ai-quota.ts` - Quota plans, assignments, usage tracking
- `src/integrations/orpc/router/ai-config.ts` - Admin ORPC router for managing providers/quotas
- `src/integrations/orpc/router/ai.ts` - AI feature endpoints (resume parsing, content improvement, grammar fixing, analysis)
- `src/integrations/orpc/router/interview.ts` - Interview practice AI endpoints (question generation, evaluation, chatbot)
- `src/routes/dashboard/admin/ai-providers/index.tsx` - Admin UI for managing providers
- `src/routes/dashboard/admin/ai-quotas/index.tsx` - Admin UI for managing quota plans
- `src/routes/dashboard/settings/ai.tsx` - User-facing AI usage/quota display

### Key Patterns

- **ORPC Middleware Chain:** `publicProcedure` -> `protectedProcedure` -> `adminProcedure`
- **SSR Safety:** Protected queries must use `enabled: !!session?.user` to avoid 401 errors during SSR
- **Quota Behavior:** When no quota plans exist, all authenticated users get unlimited AI access. Quotas are opt-in.
- **Error Handling:** `getServerModel()` throws `ORPCError("PRECONDITION_FAILED")` when no provider is configured. All AI handlers log usage on both success and error.
- **Drizzle Type Gotchas:** `numeric` columns return as strings (temperature), `count()` returns bigint strings needing `Number()`, timestamps return as strings in JSON

### Setup Required

1. Admin must add at least one AI provider at `/dashboard/admin/ai-providers` (requires admin role)
2. Provider needs: provider type, display name, API key, model name
3. Set one provider as default and enable it
4. Optionally create quota plans at `/dashboard/admin/ai-quotas`

### Database Tables Created via SQL

The AI tables were created directly via SQL (not via `db:push` or `db:migrate`) because `db:push` tried to drop unrelated tables. If rebuilding the database, run the SQL from the migration file or add the tables manually. The tables and enums are:
- Enums: `ai_provider`, `ai_usage_status`
- Tables: `ai_provider_config`, `ai_usage_quota`, `user_ai_quota`, `ai_usage_log`

## Session Notes (2026-02-05)

### What Was Done

1. **AI Key Management System** - Built complete admin-controlled AI provider management:
   - Backend services (`ai-config.ts`, `ai-quota.ts`) with full CRUD
   - Admin ORPC router (`ai-config.ts`) with provider, quota, usage, and status endpoints
   - Admin UI pages for providers and quotas management
   - User settings page showing usage stats and quota info

2. **Removed Hardcoded Credentials** - All AI endpoints (`ai.ts`, `interview.ts`) now use server-side provider config via `getServerModel()` instead of env vars or user-supplied keys

3. **Created Database Tables** - AI tables created via direct SQL through Docker (`ai_provider_config`, `ai_usage_quota`, `user_ai_quota`, `ai_usage_log`)

4. **Fixed Field Name Mismatches** - Admin UI was using wrong field names (`enabled` vs `isEnabled`, `dailyRequests` vs `dailyRequestLimit`, wrong types for temperature/timestamps)

5. **Fixed SSR 401 Errors** - Changed `status.check` to `publicProcedure`, added `enabled: !!session?.user` to protected queries in settings page

6. **Fixed Runtime Error Handling** - Wrapped `getServerModel()` in both `ai.ts` and `interview.ts` to throw `ORPCError("PRECONDITION_FAILED")` instead of generic errors. Added error logging to all interview handler catch blocks. Added try-catch to `chatWithInterviewer` streaming handler.

7. **Token Tracking** - All AI handlers (`ai.ts` and `interview.ts`) now capture and log `inputTokens`, `outputTokens`, and `totalTokens` from the AI SDK responses. Streaming handlers use `await stream.usage`, non-streaming use `result.usage`. Note: AI SDK uses `inputTokens`/`outputTokens` (not `promptTokens`/`completionTokens`).

8. **AI Usage Analytics Page** - Converted `analytics/ai-usage.tsx` from "Coming Soon" stub to a fully functional analytics dashboard showing:
   - Summary cards (total requests, tokens, success rate, errors for last 30 days)
   - Usage over time line chart (requests + tokens, dual Y-axis)
   - Feature breakdown horizontal bar chart
   - Status breakdown pie chart (success/error/quota exceeded)
   - Feature performance table (requests, tokens, avg duration)
   - Provider usage cards
   - Recent errors list
   - Empty state when no usage data exists

9. **Detailed Usage Stats Endpoint** - Added `getDetailedStats()` to `aiQuotaService` and two new ORPC endpoints:
   - `GET /ai-config/usage/detailed` (protected) - Current user's detailed analytics
   - `GET /ai-config/usage/detailed/global` (admin) - Global analytics across all users

### What Still Needs Work

1. **Add an AI Provider** - The app will show "AI features not available" until an admin adds a provider at `/dashboard/admin/ai-providers`. This is the immediate next step to test AI features.

2. **End-to-End Testing** - After adding a provider, test: resume parsing (PDF/DOCX), content improvement, grammar fix, summary generation, headline generation, skill suggestions, resume analysis, interview question generation, interview chatbot, session analysis.

3. **Cleanup Remaining Stub Pages** - Several dashboard pages still show "Coming Soon":
   - `src/routes/dashboard/analytics/activity.tsx` - Activity tracking (needs new backend)
   - `src/routes/dashboard/analytics/progress.tsx` - Progress analytics (needs new backend)
   - `src/routes/dashboard/analytics/reports.tsx` - Weekly reports (needs new backend)
   - `src/routes/dashboard/career/transition.tsx` - Career transition (needs new backend)
   - `src/routes/dashboard/jobs/insights.tsx` - Job market insights (needs new backend)
   Note: `analytics/index.tsx` already shows real data (views/downloads from resumeStatistics). The `timeSeriesData` array is empty - would need a time-series endpoint.

4. **Hardcoded Reference Data** - Career pages have hardcoded data that could be moved to DB:
   - `career/index.tsx` - MARKET_INSIGHTS, TOP_EMPLOYERS, CAREER_PATHWAYS, QUIZ_QUESTIONS
   - `career/assessment.tsx` - QUIZ_QUESTIONS, field weight matrices
   - `career/roadmap.tsx` - INDUSTRIES, PRIORITIES, CONSTRAINTS, roadmap generation logic
   - `career/skills.tsx` - RECOMMENDED_SKILLS, CAREER_PATHS
   - `schema/interview.ts` - IMTA_PROGRAMS array

5. **Production Deployment** - The AI tables were created via direct SQL. For production, consider integrating them into the migration workflow or ensuring `db:push` won't delete existing tables.

6. **Admin Dashboard Navigation** - Verify the admin sidebar links properly navigate to `/dashboard/admin/ai-providers` and `/dashboard/admin/ai-quotas`.

## Session Notes (2026-02-05 Continued - Database-Driven Reference Data)

### What Was Done

1. **Reference Data Database Schema** - Added 6 new tables to `src/integrations/drizzle/schema.ts`:
   - `imta_program` - Training program metadata (id, name, nameFr, field, duration, requirements, skills, certifications, success/employment rates)
   - `interview_tip` - Interview preparation tips (category, field, tags, extended content)
   - `interview_common_question` - Sample questions with answers (type, field, difficulty, sample answers, tips)
   - `career_market_insight` - Market statistics (value, icon, color, field)
   - `career_employer` - Top employers database (sector, location, open positions, website, fields)
   - `skill_library` - Recommended skills by field and category

2. **Reference Data ORPC Service** - Created `src/integrations/orpc/services/reference-data.ts`:
   - Full CRUD operations for all 6 tables
   - Filtering by field, category, activeOnly
   - Bulk seed operations for initial data population
   - Type exports for use in routers

3. **Reference Data ORPC Router** - Created `src/integrations/orpc/router/reference-data.ts`:
   - Public endpoints for listing and getting reference data
   - Admin endpoints for create/update/delete operations
   - Seed endpoints for bulk data insertion
   - Zod schemas for input validation

4. **Admin Reference Data Management Page** - Created `src/routes/dashboard/admin/reference-data/index.tsx`:
   - Tabbed interface for managing Programs, Tips, Questions, Insights, Employers, Skills
   - "Seed All Data" button to populate all tables at once
   - Individual seed buttons per table
   - Display of existing data with badges for field, category, status
   - Seed data embedded in the component for easy initial population

5. **Database Tables Created** - Tables created via direct SQL in Docker:
   ```sql
   CREATE TABLE imta_program, interview_tip, interview_common_question,
                career_market_insight, career_employer, skill_library
   ```
   With indexes on field, category, and is_active columns.

6. **Sidebar Navigation** - Added "Reference Data" link to admin section in sidebar.

### Key Files Created/Modified

- **New**: `src/integrations/drizzle/schema.ts` (added 6 tables at end)
- **New**: `src/integrations/orpc/services/reference-data.ts`
- **New**: `src/integrations/orpc/router/reference-data.ts`
- **New**: `src/routes/dashboard/admin/reference-data/index.tsx`
- **Modified**: `src/integrations/orpc/router/index.ts` (added reference data routers)
- **Modified**: `src/routes/dashboard/-components/sidebar.tsx` (added admin link)

### What Still Needs Work

1. **Seed the Reference Data** - Go to `/dashboard/admin/reference-data` and click "Seed All Data" to populate the tables with initial content.

2. **Update Frontend to Use Database** - The following files still use hardcoded IMTA_PROGRAMS and should be updated to use the database:
   - `src/schema/interview/index.ts` - Contains IMTA_PROGRAMS array
   - `src/routes/dashboard/interview/index.tsx` - Uses interviewTips constant
   - `src/routes/dashboard/career/index.tsx` - Uses MARKET_INSIGHTS, TOP_EMPLOYERS, CAREER_PATHWAYS
   - `src/routes/dashboard/career/assessment.tsx` - Uses QUIZ_QUESTIONS
   - `src/routes/dashboard/career/skills.tsx` - Uses RECOMMENDED_SKILLS

3. **Add More Seed Data** - The current seed data is minimal. Add more:
   - All 12 IMTA programs from schema/interview.ts
   - More interview tips (at least 20+)
   - More common questions per field (at least 30+)
   - More employers
   - Complete skill library for each field

4. **Create Full CRUD Admin UI** - Current admin page only displays and seeds data. Add:
   - Add/Edit forms for each data type
   - Delete confirmation dialogs
   - Search and filter UI
   - Sort order management

5. **Migration Notes** - The migration file `20260205204754_aberrant_payback` was generated but migration failed. Tables were created via direct SQL. For production, either:
   - Run the migration SQL manually
   - Or use `db:push` after ensuring it won't drop other tables

## Session Notes (2026-02-05 Continued - Database Integration & Stub Page Completion)

### What Was Done

1. **Updated Frontend Pages to Use Database Queries**

   - **Interview page** (`src/routes/dashboard/interview/index.tsx`):
     - Added `orpc.imtaPrograms.list` query to fetch programs from database
     - Added `orpc.interviewTips.list` query to fetch tips from database
     - Created `categoryIconMap` to map tip categories to icons
     - Added `categoryLabels` for French category names
     - Removed hardcoded `interviewTips` array - now uses database with fallback
     - Updated program dropdown to use database programs

   - **Career page** (`src/routes/dashboard/career/index.tsx`):
     - Added `orpc.marketInsights.list` query
     - Added `orpc.employers.list` query
     - Created `marketInsights` computed property with icon mapping
     - Created `topEmployers` computed property
     - Replaced hardcoded MARKET_INSIGHTS and TOP_EMPLOYERS with database data

   - **Skills page** (`src/routes/dashboard/career/skills.tsx`):
     - Added `orpc.skillLibrary.list` query
     - Updated `recommendedSkillsForField` to use database skills with fallback

2. **Built Functional Analytics Pages (Previously "Coming Soon" Stubs)**

   - **Activity Tracking** (`src/routes/dashboard/analytics/activity.tsx`):
     - Full activity feed with filtering by category
     - Statistics cards (total, today, this week, by type)
     - Activity grouping by date
     - Activity icons and colors per type
     - Empty state with call-to-action buttons

   - **Progress Analytics** (`src/routes/dashboard/analytics/progress.tsx`):
     - Skills summary and progress tracking
     - Goals by category visualization
     - Skill development progress bars
     - Achievements section
     - Quick action buttons

   - **Reports** (`src/routes/dashboard/analytics/reports.tsx`):
     - Period selector (week/month/quarter)
     - Activity breakdown by type with charts
     - Highlights section (goals completed, CVs updated, skills tracked)
     - Period statistics summary
     - Suggestions for next period

### Files Modified

- `src/routes/dashboard/interview/index.tsx` - Database integration for tips & programs
- `src/routes/dashboard/career/index.tsx` - Database integration for insights & employers
- `src/routes/dashboard/career/skills.tsx` - Database integration for skill library
- `src/routes/dashboard/analytics/activity.tsx` - Complete rewrite from stub
- `src/routes/dashboard/analytics/progress.tsx` - Complete rewrite from stub
- `src/routes/dashboard/analytics/reports.tsx` - Complete rewrite from stub

### What Still Needs Work

1. **Seed the Reference Data** - Visit `/dashboard/admin/reference-data` and click "Seed All Data"

2. **Remaining Stub Pages**:
   - `src/routes/dashboard/career/transition.tsx` - Career transition planning
   - `src/routes/dashboard/jobs/insights.tsx` - Job market insights
   - `src/routes/dashboard/networking/mentors.tsx` - Mentorship system

3. **Goals Integration** - The goals router exists but needs proper client integration:
   - Add goals.list to the progress and reports pages
   - Create a dedicated goals management page

4. **Add More Comprehensive Seed Data** - Current admin seed data is minimal

5. **Quiz Questions** - `career/assessment.tsx` and `career/quiz.tsx` still use hardcoded QUIZ_QUESTIONS
