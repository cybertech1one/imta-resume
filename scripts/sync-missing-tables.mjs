/**
 * sync-missing-tables.mjs
 *
 * Idempotent script that creates all missing AI mentor enums, tables, and indexes
 * in the PostgreSQL database. Safe to run multiple times -- every DDL statement
 * uses IF NOT EXISTS (or DO $$ ... END $$ guards for enums).
 *
 * Usage:
 *   node scripts/sync-missing-tables.mjs
 */

import pg from "pg";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/postgres";

const client = new pg.Client({ connectionString: DATABASE_URL });

// ---------------------------------------------------------------------------
// 1. Enum definitions
// ---------------------------------------------------------------------------

const ENUMS = [
  {
    name: "ai_mentor_personality",
    values: ["friendly", "professional", "motivating", "tough_love", "balanced"],
  },
  {
    name: "ai_mentor_style",
    values: ["coaching", "mentoring", "tutoring", "consulting", "counseling"],
  },
  {
    name: "ai_mentor_specialization",
    values: [
      "healthcare",
      "industrial",
      "hse",
      "interview",
      "career_strategy",
      "skills_development",
      "job_search",
      "networking",
      "general",
    ],
  },
  {
    name: "ai_mentor_message_role",
    values: ["user", "assistant", "system"],
  },
  {
    name: "ai_mentor_session_type",
    values: [
      "daily_pulse",
      "weekly_review",
      "monthly_strategy",
      "skill_coaching",
      "interview_prep",
      "goal_setting",
      "career_planning",
      "on_demand",
    ],
  },
];

/**
 * Build an idempotent CREATE TYPE statement wrapped in a DO block so it
 * silently succeeds when the type already exists.
 */
function enumDDL({ name, values }) {
  const valuesLiteral = values.map((v) => `'${v}'`).join(", ");
  return `
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${name}') THEN
    CREATE TYPE ${name} AS ENUM (${valuesLiteral});
  END IF;
END $$;
  `.trim();
}

// ---------------------------------------------------------------------------
// 2. Table definitions (in dependency order)
// ---------------------------------------------------------------------------

const TABLES_DDL = [
  // --- ai_mentor_template (no FK dependencies) ---
  `
CREATE TABLE IF NOT EXISTS ai_mentor_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  avatar TEXT,
  title TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  specialization ai_mentor_specialization NOT NULL,
  personality ai_mentor_personality NOT NULL DEFAULT 'balanced',
  style ai_mentor_style NOT NULL DEFAULT 'mentoring',
  description TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  expertise JSONB NOT NULL,
  languages JSONB NOT NULL,
  system_prompt TEXT NOT NULL,
  welcome_message TEXT NOT NULL,
  welcome_message_fr TEXT NOT NULL,
  sample_questions JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
  `.trim(),

  // --- user_ai_mentor (FK -> user, ai_mentor_template) ---
  `
CREATE TABLE IF NOT EXISTS user_ai_mentor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  template_id UUID REFERENCES ai_mentor_template(id) ON DELETE SET NULL,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  custom_name TEXT,
  custom_avatar TEXT,
  custom_personality ai_mentor_personality,
  custom_style ai_mentor_style,
  custom_specializations JSONB,
  custom_languages JSONB,
  custom_system_prompt TEXT,
  custom_focus_areas JSONB,
  session_frequency TEXT DEFAULT 'on_demand',
  preferred_time TEXT,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  total_conversations INTEGER NOT NULL DEFAULT 0,
  total_messages INTEGER NOT NULL DEFAULT 0,
  last_interaction TIMESTAMPTZ,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
  `.trim(),

  // --- ai_mentor_conversation (FK -> user, user_ai_mentor) ---
  `
CREATE TABLE IF NOT EXISTS ai_mentor_conversation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES user_ai_mentor(id) ON DELETE CASCADE,
  title TEXT,
  topic TEXT,
  messages JSONB NOT NULL,
  context JSONB,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
  `.trim(),

  // --- ai_mentor_session (FK -> user, user_ai_mentor, ai_mentor_conversation) ---
  `
CREATE TABLE IF NOT EXISTS ai_mentor_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES user_ai_mentor(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES ai_mentor_conversation(id) ON DELETE SET NULL,
  session_type ai_mentor_session_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration INTEGER,
  topics JSONB,
  outcomes JSONB,
  action_items JSONB,
  rating INTEGER,
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
  `.trim(),

  // --- user_mentor_onboarding (FK -> user, UNIQUE on user_id) ---
  `
CREATE TABLE IF NOT EXISTS user_mentor_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  field TEXT,
  current_level TEXT,
  biggest_challenge TEXT,
  learning_style TEXT,
  preferred_language TEXT DEFAULT 'fr',
  career_goal TEXT,
  target_role TEXT,
  timeline_months INTEGER,
  availability_hours INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
  `.trim(),
];

// ---------------------------------------------------------------------------
// 3. Index definitions
// ---------------------------------------------------------------------------

const INDEXES_DDL = [
  // user_ai_mentor indexes
  `CREATE INDEX IF NOT EXISTS idx_user_ai_mentor_user_id ON user_ai_mentor (user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_user_ai_mentor_template_id ON user_ai_mentor (template_id);`,
  `CREATE INDEX IF NOT EXISTS idx_user_ai_mentor_is_active ON user_ai_mentor (is_active);`,

  // ai_mentor_conversation indexes
  `CREATE INDEX IF NOT EXISTS idx_ai_mentor_conversation_user_id ON ai_mentor_conversation (user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_ai_mentor_conversation_mentor_id ON ai_mentor_conversation (mentor_id);`,
  `CREATE INDEX IF NOT EXISTS idx_ai_mentor_conversation_created_at ON ai_mentor_conversation (created_at DESC);`,

  // ai_mentor_session indexes
  `CREATE INDEX IF NOT EXISTS idx_ai_mentor_session_user_id ON ai_mentor_session (user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_ai_mentor_session_mentor_id ON ai_mentor_session (mentor_id);`,
  `CREATE INDEX IF NOT EXISTS idx_ai_mentor_session_conversation_id ON ai_mentor_session (conversation_id);`,
  `CREATE INDEX IF NOT EXISTS idx_ai_mentor_session_session_type ON ai_mentor_session (session_type);`,
  `CREATE INDEX IF NOT EXISTS idx_ai_mentor_session_status ON ai_mentor_session (status);`,
  `CREATE INDEX IF NOT EXISTS idx_ai_mentor_session_scheduled_at ON ai_mentor_session (scheduled_at);`,

  // user_mentor_onboarding indexes (user_id already has UNIQUE constraint -> implicit index)

  // ai_mentor_template indexes
  `CREATE INDEX IF NOT EXISTS idx_ai_mentor_template_specialization ON ai_mentor_template (specialization);`,
  `CREATE INDEX IF NOT EXISTS idx_ai_mentor_template_is_active ON ai_mentor_template (is_active);`,
  `CREATE INDEX IF NOT EXISTS idx_ai_mentor_template_sort_order ON ai_mentor_template (sort_order);`,
];

// ---------------------------------------------------------------------------
// 4. Verification query
// ---------------------------------------------------------------------------

const EXPECTED_TABLES = [
  "ai_mentor_template",
  "user_ai_mentor",
  "ai_mentor_conversation",
  "ai_mentor_session",
  "user_mentor_onboarding",
];

const EXPECTED_ENUMS = ENUMS.map((e) => e.name);

const VERIFY_TABLES_SQL = `
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = ANY($1);
`;

const VERIFY_ENUMS_SQL = `
SELECT typname
FROM pg_type
WHERE typname = ANY($1);
`;

// ---------------------------------------------------------------------------
// 5. Main execution
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== sync-missing-tables.mjs ===\n");
  console.log(`Connecting to: ${DATABASE_URL.replace(/:[^:@]+@/, ":****@")}`);

  await client.connect();
  console.log("Connected.\n");

  // --- Enums ---
  console.log("--- Creating enums ---");
  for (const enumDef of ENUMS) {
    process.stdout.write(`  ${enumDef.name} ... `);
    await client.query(enumDDL(enumDef));
    console.log("OK");
  }

  // --- Tables ---
  console.log("\n--- Creating tables ---");
  for (const ddl of TABLES_DDL) {
    // Extract table name from the DDL for logging
    const match = ddl.match(/CREATE TABLE IF NOT EXISTS (\S+)/i);
    const tableName = match ? match[1] : "(unknown)";
    process.stdout.write(`  ${tableName} ... `);
    await client.query(ddl);
    console.log("OK");
  }

  // --- Indexes ---
  console.log("\n--- Creating indexes ---");
  for (const ddl of INDEXES_DDL) {
    const match = ddl.match(/INDEX IF NOT EXISTS (\S+)/i);
    const indexName = match ? match[1] : "(unknown)";
    process.stdout.write(`  ${indexName} ... `);
    await client.query(ddl);
    console.log("OK");
  }

  // --- Verification ---
  console.log("\n--- Verification ---");

  const { rows: tableRows } = await client.query(VERIFY_TABLES_SQL, [
    EXPECTED_TABLES,
  ]);
  const foundTables = new Set(tableRows.map((r) => r.tablename));

  const { rows: enumRows } = await client.query(VERIFY_ENUMS_SQL, [
    EXPECTED_ENUMS,
  ]);
  const foundEnums = new Set(enumRows.map((r) => r.typname));

  console.log("\nEnums:");
  let allGood = true;
  for (const name of EXPECTED_ENUMS) {
    const status = foundEnums.has(name) ? "FOUND" : "MISSING";
    if (status === "MISSING") allGood = false;
    console.log(`  ${status.padEnd(8)} ${name}`);
  }

  console.log("\nTables:");
  for (const name of EXPECTED_TABLES) {
    const status = foundTables.has(name) ? "FOUND" : "MISSING";
    if (status === "MISSING") allGood = false;
    console.log(`  ${status.padEnd(8)} ${name}`);
  }

  console.log(
    `\n${allGood ? "All enums and tables verified successfully." : "WARNING: Some enums or tables are missing!"}`,
  );

  await client.end();
  console.log("\nDone.");

  if (!allGood) process.exit(1);
}

main().catch((err) => {
  console.error("\nFATAL:", err.message);
  client.end().catch(() => {});
  process.exit(1);
});
