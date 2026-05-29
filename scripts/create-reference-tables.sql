-- ============================================================================
-- Reference Data Tables for Reactive Resume
-- Generated from Drizzle schema (schema.ts lines 6936-7080)
-- Idempotent: safe to run multiple times (IF NOT EXISTS)
-- ============================================================================

-- Drop orphaned composite types left by failed Drizzle migrations.
-- These types conflict with CREATE TABLE IF NOT EXISTS because PostgreSQL
-- registers a composite type for each table automatically.
DO $$
BEGIN
    -- Only drop type if it exists AND no corresponding table exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'imta_program')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'imta_program')
    THEN
        DROP TYPE imta_program CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_tip')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'interview_tip')
    THEN
        DROP TYPE interview_tip CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_common_question')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'interview_common_question')
    THEN
        DROP TYPE interview_common_question CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'career_market_insight')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'career_market_insight')
    THEN
        DROP TYPE career_market_insight CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'career_employer')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'career_employer')
    THEN
        DROP TYPE career_employer CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_library')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'skill_library')
    THEN
        DROP TYPE skill_library CASCADE;
    END IF;
END $$;

-- ============================================================================
-- 1. imta_program - Training program metadata (TEXT id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS imta_program (
    id              TEXT        NOT NULL PRIMARY KEY,
    name            TEXT        NOT NULL,
    name_fr         TEXT        NOT NULL,
    field           TEXT        NOT NULL,
    duration        TEXT        NOT NULL,
    duration_fr     TEXT        NOT NULL,
    requirements    TEXT        NOT NULL,
    requirements_fr TEXT        NOT NULL,
    description     TEXT        NOT NULL,
    description_fr  TEXT        NOT NULL,
    success_rate    INTEGER,
    avg_salary      INTEGER,
    employment_rate INTEGER,
    skills          JSONB       NOT NULL,
    certifications  JSONB       NOT NULL,
    is_active       BOOLEAN     NOT NULL DEFAULT true,
    sort_order      INTEGER     DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS imta_program_field_idx ON imta_program (field);
CREATE INDEX IF NOT EXISTS imta_program_is_active_idx ON imta_program (is_active);

-- ============================================================================
-- 2. interview_tip - Interview preparation and guidance content (TEXT id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS interview_tip (
    id                  TEXT        NOT NULL PRIMARY KEY,
    title               TEXT        NOT NULL,
    title_fr            TEXT        NOT NULL,
    content             TEXT        NOT NULL,
    content_fr          TEXT        NOT NULL,
    extended_content    TEXT,
    extended_content_fr TEXT,
    category            TEXT        NOT NULL,
    field               TEXT,
    tags                JSONB       NOT NULL,
    is_active           BOOLEAN     NOT NULL DEFAULT true,
    sort_order          INTEGER     DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS interview_tip_category_idx ON interview_tip (category);
CREATE INDEX IF NOT EXISTS interview_tip_field_idx ON interview_tip (field);
CREATE INDEX IF NOT EXISTS interview_tip_is_active_idx ON interview_tip (is_active);

-- ============================================================================
-- 3. interview_common_question - Sample questions with answers (TEXT id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS interview_common_question (
    id                TEXT        NOT NULL PRIMARY KEY,
    question          TEXT        NOT NULL,
    question_fr       TEXT        NOT NULL,
    type              TEXT        NOT NULL,
    field             TEXT        NOT NULL,
    sample_answer     TEXT,
    sample_answer_fr  TEXT,
    tips              JSONB       NOT NULL,
    tips_fr           JSONB       NOT NULL,
    difficulty        TEXT        DEFAULT 'intermediate',
    is_active         BOOLEAN     NOT NULL DEFAULT true,
    sort_order        INTEGER     DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS interview_common_question_type_idx ON interview_common_question (type);
CREATE INDEX IF NOT EXISTS interview_common_question_field_idx ON interview_common_question (field);
CREATE INDEX IF NOT EXISTS interview_common_question_is_active_idx ON interview_common_question (is_active);

-- ============================================================================
-- 4. career_market_insight - Market statistics for career guidance (UUID id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS career_market_insight (
    id              UUID        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT        NOT NULL,
    title_fr        TEXT        NOT NULL,
    value           TEXT        NOT NULL,
    description     TEXT,
    description_fr  TEXT,
    icon            TEXT,
    color           TEXT,
    field           TEXT,
    is_active       BOOLEAN     NOT NULL DEFAULT true,
    sort_order      INTEGER     DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS career_market_insight_field_idx ON career_market_insight (field);
CREATE INDEX IF NOT EXISTS career_market_insight_is_active_idx ON career_market_insight (is_active);

-- ============================================================================
-- 5. career_employer - Top employers database (UUID id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS career_employer (
    id              UUID        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT        NOT NULL,
    sector          TEXT        NOT NULL,
    sector_fr       TEXT        NOT NULL,
    location        TEXT        NOT NULL,
    location_fr     TEXT,
    open_positions  INTEGER     DEFAULT 0,
    website         TEXT,
    logo            TEXT,
    description     TEXT,
    description_fr  TEXT,
    fields          JSONB       NOT NULL,
    is_active       BOOLEAN     NOT NULL DEFAULT true,
    sort_order      INTEGER     DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS career_employer_is_active_idx ON career_employer (is_active);

-- ============================================================================
-- 6. skill_library - Recommended skills for each field (UUID id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS skill_library (
    id              UUID        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT        NOT NULL,
    name_fr         TEXT        NOT NULL,
    field           TEXT        NOT NULL,
    category        TEXT        NOT NULL,
    description     TEXT,
    description_fr  TEXT,
    is_recommended  BOOLEAN     NOT NULL DEFAULT true,
    is_active       BOOLEAN     NOT NULL DEFAULT true,
    sort_order      INTEGER     DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS skill_library_field_idx ON skill_library (field);
CREATE INDEX IF NOT EXISTS skill_library_category_idx ON skill_library (category);
CREATE INDEX IF NOT EXISTS skill_library_is_active_idx ON skill_library (is_active);

-- ============================================================================
-- Done. All 6 reference data tables created with indexes.
-- ============================================================================
