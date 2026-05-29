# AI System Database Schema

This document describes all database tables related to the AI enhancement system in Reactive Resume.

## Table of Contents

1. [Overview](#overview)
2. [AI Provider Configuration](#ai-provider-configuration)
3. [AI Usage and Quotas](#ai-usage-and-quotas)
4. [AI Mentor System](#ai-mentor-system)
5. [AI Writer Content](#ai-writer-content)
6. [Interview System](#interview-system)
7. [Reference Data Tables](#reference-data-tables)
8. [AI Training Data](#ai-training-data)
9. [Enums](#enums)
10. [Indexes](#indexes)
11. [Relationships](#relationships)

---

## Overview

The AI system uses PostgreSQL with Drizzle ORM. All tables are defined in:
`src/integrations/drizzle/schema.ts`

### Table Categories

| Category | Tables |
|----------|--------|
| Provider Management | `ai_provider_config`, `ai_global_settings` |
| Quotas & Usage | `ai_usage_quota`, `user_ai_quota`, `ai_usage_log` |
| AI Mentor | `ai_mentor_template`, `user_ai_mentor`, `ai_mentor_conversation`, `ai_mentor_session` |
| AI Writer | `ai_writer_content` |
| Interview | `interview_session`, `interview_analysis` |
| Reference Data | `imta_program`, `interview_tip`, `interview_common_question`, etc. |
| Training | `ai_training_example`, `ai_feedback`, `ai_model_performance` |

---

## AI Provider Configuration

### ai_provider_config

Stores admin-configured AI providers.

```sql
CREATE TABLE ai_provider_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider ai_provider NOT NULL,           -- openai, anthropic, gemini, etc.
  display_name TEXT NOT NULL,
  api_key TEXT NOT NULL,                   -- Encrypted API key
  model TEXT NOT NULL,                     -- Model identifier
  base_url TEXT,                           -- Custom base URL for self-hosted
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  max_tokens_per_request INTEGER NOT NULL DEFAULT 4096,
  temperature NUMERIC NOT NULL DEFAULT 0.7,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_ai_provider_config_provider` ON (provider)
- `idx_ai_provider_config_is_default` ON (is_default)
- `idx_ai_provider_config_is_enabled` ON (is_enabled)

---

### ai_global_settings

Organization-wide AI quota controls.

```sql
CREATE TABLE ai_global_settings (
  id TEXT PRIMARY KEY,                     -- Single row: 'default'
  max_daily_requests INTEGER DEFAULT 10000,
  max_monthly_requests INTEGER DEFAULT 100000,
  max_daily_tokens INTEGER DEFAULT 10000000,
  max_monthly_tokens INTEGER DEFAULT 100000000,
  alert_threshold_percent INTEGER DEFAULT 80,
  suspend_on_exceed BOOLEAN DEFAULT false,
  default_language TEXT DEFAULT 'fr',
  allowed_languages TEXT[] DEFAULT ARRAY['fr', 'ar', 'en', 'darija'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## AI Usage and Quotas

### ai_usage_quota

Defines quota plans for users.

```sql
CREATE TABLE ai_usage_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  daily_request_limit INTEGER NOT NULL DEFAULT 50,
  monthly_request_limit INTEGER NOT NULL DEFAULT 500,
  max_tokens_per_request INTEGER NOT NULL DEFAULT 4096,
  daily_token_limit INTEGER NOT NULL DEFAULT 100000,
  monthly_token_limit INTEGER NOT NULL DEFAULT 1000000,
  allowed_features TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Field Descriptions:**

| Field | Description |
|-------|-------------|
| `daily_request_limit` | Max AI requests per day |
| `monthly_request_limit` | Max AI requests per month |
| `max_tokens_per_request` | Token limit per single request |
| `daily_token_limit` | Total tokens allowed per day |
| `monthly_token_limit` | Total tokens allowed per month |
| `allowed_features` | Array of feature IDs user can access |

---

### user_ai_quota

Assigns quota plans to users with optional overrides.

```sql
CREATE TABLE user_ai_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  quota_id UUID NOT NULL REFERENCES ai_usage_quota(id) ON DELETE RESTRICT,
  override_daily_request_limit INTEGER,
  override_monthly_request_limit INTEGER,
  override_daily_token_limit INTEGER,
  override_monthly_token_limit INTEGER,
  notes TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES "user"(id) ON DELETE SET NULL
);
```

**Indexes:**
- `idx_user_ai_quota_user_id` ON (user_id)
- `idx_user_ai_quota_quota_id` ON (quota_id)

---

### ai_usage_log

Tracks every AI API call.

```sql
CREATE TABLE ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,                   -- improve_content, parse_pdf, etc.
  provider_id UUID REFERENCES ai_provider_config(id) ON DELETE SET NULL,
  provider_name TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  status ai_usage_status NOT NULL DEFAULT 'success',
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_ai_usage_log_user_id` ON (user_id)
- `idx_ai_usage_log_user_created` ON (user_id, created_at DESC)
- `idx_ai_usage_log_feature` ON (feature)
- `idx_ai_usage_log_created` ON (created_at DESC)

---

## AI Mentor System

### ai_mentor_template

Pre-built mentor personas.

```sql
CREATE TABLE ai_mentor_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                      -- "Dr. Amina"
  name_fr TEXT NOT NULL,
  avatar TEXT,                             -- Avatar URL
  title TEXT NOT NULL,                     -- "Healthcare Career Coach"
  title_fr TEXT NOT NULL,
  specialization ai_mentor_specialization NOT NULL,
  personality ai_mentor_personality NOT NULL DEFAULT 'balanced',
  style ai_mentor_style NOT NULL DEFAULT 'professional',
  description TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  expertise JSONB NOT NULL,                -- ["interview prep", "cv writing"]
  languages JSONB NOT NULL,                -- ["fr", "ar", "en"]
  system_prompt TEXT NOT NULL,             -- AI system prompt
  welcome_message TEXT NOT NULL,
  welcome_message_fr TEXT NOT NULL,
  sample_questions JSONB,                  -- Conversation starters
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_ai_mentor_template_specialization` ON (specialization)
- `idx_ai_mentor_template_is_active` ON (is_active)

---

### user_ai_mentor

User's selected or custom mentors.

```sql
CREATE TABLE user_ai_mentor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  template_id UUID REFERENCES ai_mentor_template(id) ON DELETE SET NULL,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  custom_name TEXT,
  custom_avatar TEXT,
  custom_personality ai_mentor_personality,
  custom_style ai_mentor_style,
  custom_specializations TEXT[],
  custom_languages TEXT[],
  custom_system_prompt TEXT,
  custom_focus_areas TEXT[],
  session_frequency TEXT,                  -- "daily", "weekly", etc.
  preferred_time TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  total_messages INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  last_interaction TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_user_ai_mentor_user_id` ON (user_id)
- `idx_user_ai_mentor_template_id` ON (template_id)
- `idx_user_ai_mentor_is_primary` ON (user_id, is_primary)

---

### ai_mentor_conversation

Conversation history with mentors.

```sql
CREATE TABLE ai_mentor_conversation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES user_ai_mentor(id) ON DELETE CASCADE,
  title TEXT,
  topic TEXT,
  messages JSONB NOT NULL DEFAULT '[]',    -- Array of messages
  context JSONB,                           -- { resumeId, goalId, etc. }
  is_archived BOOLEAN NOT NULL DEFAULT false,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Message Structure:**
```typescript
{
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  tokens?: number;
}
```

**Indexes:**
- `idx_ai_mentor_conversation_user_id` ON (user_id)
- `idx_ai_mentor_conversation_mentor_id` ON (mentor_id)
- `idx_ai_mentor_conversation_is_archived` ON (is_archived)

---

### ai_mentor_session

Scheduled coaching sessions.

```sql
CREATE TABLE ai_mentor_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES user_ai_mentor(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES ai_mentor_conversation(id) ON DELETE SET NULL,
  session_type ai_mentor_session_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration INTEGER,                        -- Duration in minutes
  status TEXT NOT NULL DEFAULT 'scheduled',
  topics JSONB DEFAULT '[]',
  outcomes JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  rating INTEGER,                          -- 1-5
  feedback TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Session Types:**
- `daily_pulse` - Quick daily check-in
- `weekly_review` - Weekly progress review
- `monthly_strategy` - Monthly planning session
- `skill_coaching` - Focused skill development
- `interview_prep` - Interview preparation
- `goal_setting` - Goal definition and tracking
- `career_planning` - Long-term career strategy
- `on_demand` - Ad-hoc session

---

## AI Writer Content

### ai_writer_content

Stores generated content from AI Writer.

```sql
CREATE TABLE ai_writer_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  type ai_writer_content_type,             -- bullet_point, summary, etc.
  name TEXT NOT NULL,
  original_input TEXT,
  generated_content TEXT,
  tone ai_writer_tone,
  industry ai_writer_industry,
  experience_years INTEGER,
  bullet_points JSONB,                     -- Array of enhanced bullet points
  skill_extraction JSONB,                  -- Extracted skills structure
  grammar_issues JSONB,                    -- Array of grammar issues
  job_title TEXT,
  company_name TEXT,
  linkedin_keywords TEXT[],
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  -- AI History extension columns
  resume_id UUID REFERENCES resume(id) ON DELETE SET NULL,
  content_source TEXT,
  input_data JSONB,
  output_data JSONB,
  applied_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_ai_writer_content_user_id` ON (user_id)
- `idx_ai_writer_content_type` ON (type)
- `idx_ai_writer_content_is_favorite` ON (is_favorite)

---

## Interview System

### interview_session

AI-powered interview practice sessions.

```sql
CREATE TABLE interview_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resume(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  field interview_field NOT NULL DEFAULT 'general',
  program imta_program,                    -- IMTA program if applicable
  types JSONB NOT NULL DEFAULT '["behavioral", "technical"]',
  difficulty interview_difficulty NOT NULL DEFAULT 'intermediate',
  language TEXT NOT NULL DEFAULT 'fr',
  status interview_session_status NOT NULL DEFAULT 'pending',
  questions JSONB NOT NULL DEFAULT '[]',   -- Array of InterviewQuestion
  responses JSONB NOT NULL DEFAULT '[]',   -- Array of InterviewResponse
  evaluations JSONB NOT NULL DEFAULT '[]', -- Array of ResponseEvaluation
  total_questions INTEGER NOT NULL DEFAULT 0,
  completed_questions INTEGER NOT NULL DEFAULT 0,
  overall_score INTEGER,
  job_position TEXT,
  company_name TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Question Structure:**
```typescript
{
  id: string;
  question: string;
  questionFr?: string;
  type: "behavioral" | "technical" | "situational" | "motivational" | "general";
  field: "healthcare" | "industrial" | "hse" | "general";
  difficulty: "beginner" | "intermediate" | "advanced";
  expectedPoints?: string[];
  followUpQuestions?: string[];
  tips?: string;
  order: number;
}
```

**Response Structure:**
```typescript
{
  questionId: string;
  response: string;
  responseTime?: number;
  audioUrl?: string;
  timestamp: string;
}
```

**Evaluation Structure:**
```typescript
{
  questionId: string;
  score: number;
  strengths: string[];
  areasForImprovement: string[];
  suggestions: string[];
  sampleAnswer?: string;
  keyPointsCovered: string[];
  keyPointsMissed: string[];
  overallFeedback: string;
}
```

**Indexes:**
- `idx_interview_session_user_id` ON (user_id)
- `idx_interview_session_user_status` ON (user_id, status)
- `idx_interview_session_user_created` ON (user_id, created_at DESC)
- `idx_interview_session_resume_id` ON (resume_id)
- `idx_interview_session_program` ON (program)

---

### interview_analysis

Aggregated analysis of interview sessions.

```sql
CREATE TABLE interview_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE NOT NULL REFERENCES interview_session(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  score_breakdown JSONB NOT NULL DEFAULT '{}',
  top_strengths JSONB NOT NULL DEFAULT '[]',
  top_weaknesses JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  readiness_level TEXT NOT NULL DEFAULT 'needs_practice',
  summary TEXT NOT NULL,
  next_steps JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Reference Data Tables

### imta_program

Training program metadata.

```sql
CREATE TABLE imta_program (
  id TEXT PRIMARY KEY,                     -- e.g., "sage_femme"
  name TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  field TEXT NOT NULL,                     -- healthcare, industrial, hse
  duration TEXT NOT NULL,
  duration_fr TEXT NOT NULL,
  requirements TEXT NOT NULL,
  requirements_fr TEXT NOT NULL,
  description TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  success_rate INTEGER,                    -- Percentage
  avg_salary INTEGER,                      -- Monthly in MAD
  employment_rate INTEGER,                 -- Percentage
  skills JSONB NOT NULL,                   -- Array of skill names
  certifications JSONB NOT NULL,           -- Array of certifications
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### interview_tip

Interview preparation tips.

```sql
CREATE TABLE interview_tip (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  content TEXT NOT NULL,
  content_fr TEXT NOT NULL,
  extended_content TEXT,
  extended_content_fr TEXT,
  category TEXT NOT NULL,                  -- preparation, during, after, etc.
  field TEXT,                              -- healthcare, industrial, hse, null=all
  tags JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### interview_common_question

Sample interview questions with answers.

```sql
CREATE TABLE interview_common_question (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  question_fr TEXT NOT NULL,
  type TEXT NOT NULL,                      -- behavioral, technical, etc.
  field TEXT NOT NULL,                     -- healthcare, industrial, hse, general
  sample_answer TEXT,
  sample_answer_fr TEXT,
  tips JSONB NOT NULL,
  tips_fr JSONB NOT NULL,
  difficulty TEXT DEFAULT 'intermediate',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### skill_library

Recommended skills by field.

```sql
CREATE TABLE skill_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  field TEXT NOT NULL,                     -- healthcare, industrial, hse
  category TEXT NOT NULL,                  -- technical, soft, languages, certifications
  description TEXT,
  description_fr TEXT,
  is_recommended BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## AI Training Data

### ai_training_example

Training data for AI improvement.

```sql
CREATE TABLE ai_training_example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES ai_provider_config(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  expected_output JSONB,
  quality_score REAL,                      -- 0.0 - 1.0
  feedback_type TEXT,                      -- positive, negative, neutral
  usage_log_id UUID REFERENCES ai_usage_log(id) ON DELETE CASCADE,
  is_validated BOOLEAN DEFAULT false,
  validated_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### ai_feedback

User feedback on AI responses.

```sql
CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  usage_log_id UUID REFERENCES ai_usage_log(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  rating INTEGER NOT NULL,                 -- 1-5
  feedback_type TEXT,                      -- helpful, not_helpful, incorrect, other
  comment TEXT,
  original_output TEXT,
  corrected_output TEXT,
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Enums

### ai_provider

```sql
CREATE TYPE ai_provider AS ENUM (
  'openai',
  'anthropic',
  'gemini',
  'ollama',
  'vercel-ai-gateway',
  'deepseek',
  'groq',
  'mistral',
  'togetherai',
  'openrouter'
);
```

### ai_usage_status

```sql
CREATE TYPE ai_usage_status AS ENUM (
  'success',
  'error',
  'quota_exceeded'
);
```

### ai_mentor_personality

```sql
CREATE TYPE ai_mentor_personality AS ENUM (
  'supportive',
  'challenging',
  'balanced',
  'motivational',
  'analytical'
);
```

### ai_mentor_style

```sql
CREATE TYPE ai_mentor_style AS ENUM (
  'formal',
  'casual',
  'professional',
  'friendly'
);
```

### ai_mentor_specialization

```sql
CREATE TYPE ai_mentor_specialization AS ENUM (
  'healthcare',
  'industrial',
  'hse',
  'interview',
  'career_strategy',
  'skills_development',
  'job_search',
  'networking',
  'general'
);
```

### ai_mentor_session_type

```sql
CREATE TYPE ai_mentor_session_type AS ENUM (
  'daily_pulse',
  'weekly_review',
  'monthly_strategy',
  'skill_coaching',
  'interview_prep',
  'goal_setting',
  'career_planning',
  'on_demand'
);
```

### ai_writer_content_type

```sql
CREATE TYPE ai_writer_content_type AS ENUM (
  'bullet_point',
  'summary',
  'achievement',
  'cover_letter',
  'linkedin_summary',
  'skill_extraction'
);
```

### ai_writer_tone

```sql
CREATE TYPE ai_writer_tone AS ENUM (
  'professional',
  'confident',
  'friendly',
  'executive',
  'creative'
);
```

### ai_writer_industry

```sql
CREATE TYPE ai_writer_industry AS ENUM (
  'technology',
  'healthcare',
  'finance',
  'marketing',
  'engineering',
  'education',
  'general'
);
```

### interview_field

```sql
CREATE TYPE interview_field AS ENUM (
  'healthcare',
  'industrial',
  'hse',
  'general'
);
```

### interview_difficulty

```sql
CREATE TYPE interview_difficulty AS ENUM (
  'beginner',
  'intermediate',
  'advanced'
);
```

### interview_session_status

```sql
CREATE TYPE interview_session_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'abandoned'
);
```

### imta_program

```sql
CREATE TYPE imta_program AS ENUM (
  'sage_femme',
  'infirmier_polyvalent',
  'aide_soignant',
  'infirmier_auxiliaire',
  'conducteur_engins',
  'mecanique_engins',
  'tourneur_industriel',
  'cariste',
  'electromecanique',
  'soudure',
  'hse_specialist',
  'other'
);
```

---

## Indexes

### Performance-Critical Indexes

```sql
-- AI Usage Log (high-volume table)
CREATE INDEX idx_ai_usage_log_user_created ON ai_usage_log(user_id, created_at DESC);
CREATE INDEX idx_ai_usage_log_feature ON ai_usage_log(feature);
CREATE INDEX idx_ai_usage_log_created ON ai_usage_log(created_at DESC);

-- Interview Sessions
CREATE INDEX idx_interview_session_user_status ON interview_session(user_id, status);
CREATE INDEX idx_interview_session_user_created ON interview_session(user_id, created_at DESC);

-- Mentor Conversations
CREATE INDEX idx_ai_mentor_conversation_user_created ON ai_mentor_conversation(user_id, created_at DESC);
```

---

## Relationships

### Entity Relationship Diagram (Simplified)

```
user (1) ----< (N) ai_usage_log
user (1) ----< (N) user_ai_quota
user (1) ----< (N) user_ai_mentor
user (1) ----< (N) ai_writer_content
user (1) ----< (N) interview_session

ai_usage_quota (1) ----< (N) user_ai_quota
ai_provider_config (1) ----< (N) ai_usage_log

ai_mentor_template (1) ----< (N) user_ai_mentor
user_ai_mentor (1) ----< (N) ai_mentor_conversation
user_ai_mentor (1) ----< (N) ai_mentor_session

interview_session (1) ---- (1) interview_analysis
resume (1) ----< (N) interview_session
```

---

## Migration Notes

### Creating Tables

Tables are defined in Drizzle ORM and can be migrated using:

```bash
# Generate migration
pnpm db:generate

# Apply migration
pnpm db:migrate

# Or push directly (development only)
pnpm db:push
```

### Initial Data

Reference data tables should be seeded using the admin UI at `/dashboard/admin/reference-data` or via the seed endpoints:

```typescript
await orpc.seed.seedAll();
await orpc.aiMentor.templates.seed();
```

---

## Data Retention

| Table | Retention Policy |
|-------|-----------------|
| `ai_usage_log` | 90 days (configurable) |
| `ai_mentor_conversation` | Indefinite (user-controlled) |
| `ai_training_example` | Indefinite |
| `ai_feedback` | Indefinite |
| `interview_session` | Indefinite |

Archived conversations can be permanently deleted by users.
