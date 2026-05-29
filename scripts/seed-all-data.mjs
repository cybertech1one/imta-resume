/**
 * seed-all-data.mjs
 *
 * Idempotent seed script that populates reference data tables for the
 * gamification system:
 *   - achievement_definition
 *   - progress_milestone
 *   - unlockable_reward
 *
 * Each section uses INSERT ... ON CONFLICT DO NOTHING so the script is safe
 * to run multiple times without duplicating rows.
 *
 * Usage:
 *   node scripts/seed-all-data.mjs
 *
 * Requirements:
 *   - PostgreSQL running at the connection string below (or DATABASE_URL env var)
 *   - The three target tables must already exist (created by Drizzle migrations
 *     or sync-missing-tables.mjs). This script will create them if they are
 *     absent, using the correct schema.
 */

import pg from "pg";

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/postgres";

const client = new pg.Client({ connectionString: DATABASE_URL });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the number of rows currently in a table, or null when the table
 * does not exist.
 */
async function rowCount(tableName) {
  const { rows } = await client.query(
    "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = $1",
    [tableName],
  );
  if (rows[0].count === "0") return null; // table absent
  const { rows: cr } = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
  return Number(cr[0].count);
}

/**
 * Run a batch INSERT ... ON CONFLICT DO NOTHING and return the number of rows
 * that were actually inserted.
 */
async function insertBatch(sql, paramRows) {
  let inserted = 0;
  for (const params of paramRows) {
    const res = await client.query(sql, params);
    inserted += res.rowCount ?? 0;
  }
  return inserted;
}

// ---------------------------------------------------------------------------
// DDL: ensure tables exist (CREATE TABLE IF NOT EXISTS)
// ---------------------------------------------------------------------------

async function ensureTables() {
  console.log("--- Ensuring tables exist ---");

  // achievement_category enum
  await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'achievement_category') THEN
        CREATE TYPE achievement_category AS ENUM (
          'resume', 'interview', 'job_search', 'learning', 'engagement', 'networking', 'career'
        );
      END IF;
    END $$;
  `);

  // reward_type enum
  await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reward_type') THEN
        CREATE TYPE reward_type AS ENUM ('theme', 'badge', 'feature', 'template');
      END IF;
    END $$;
  `);

  // achievement_definition
  await client.query(`
    CREATE TABLE IF NOT EXISTS achievement_definition (
      id              TEXT        PRIMARY KEY,
      title           TEXT        NOT NULL,
      description     TEXT        NOT NULL,
      icon            TEXT        NOT NULL,
      category        achievement_category NOT NULL,
      unit            TEXT        NOT NULL,
      bronze_target   INTEGER     NOT NULL,
      bronze_xp       INTEGER     NOT NULL,
      silver_target   INTEGER     NOT NULL,
      silver_xp       INTEGER     NOT NULL,
      gold_target     INTEGER     NOT NULL,
      gold_xp         INTEGER     NOT NULL,
      platinum_target INTEGER     NOT NULL,
      platinum_xp     INTEGER     NOT NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(
    "CREATE INDEX IF NOT EXISTS idx_achievement_definition_category ON achievement_definition (category);",
  );

  // progress_milestone
  await client.query(`
    CREATE TABLE IF NOT EXISTS progress_milestone (
      id          TEXT        PRIMARY KEY,
      title       TEXT        NOT NULL,
      description TEXT        NOT NULL,
      icon        TEXT        NOT NULL,
      xp_required INTEGER     NOT NULL,
      reward      TEXT        NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(
    "CREATE INDEX IF NOT EXISTS idx_progress_milestone_xp_required ON progress_milestone (xp_required);",
  );

  // unlockable_reward
  await client.query(`
    CREATE TABLE IF NOT EXISTS unlockable_reward (
      id             TEXT        PRIMARY KEY,
      title          TEXT        NOT NULL,
      description    TEXT        NOT NULL,
      icon           TEXT        NOT NULL,
      type           reward_type NOT NULL,
      required_level INTEGER     NOT NULL,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(
    "CREATE INDEX IF NOT EXISTS idx_unlockable_reward_required_level ON unlockable_reward (required_level);",
  );

  console.log("  Tables OK\n");
}

// ---------------------------------------------------------------------------
// Seed data: achievement_definition
// ---------------------------------------------------------------------------
//
// NOTE: The achievement_category enum in this database uses the values:
//   resume | interview | job_search | learning | engagement | networking | career
//
// The request used "social" for content-creator and daily-streak; the closest
// valid enum value is "engagement" (login streaks, journal entries are user
// engagement activities).  "skill-collector", "career-planner", "job-hunter"
// map to "career".  "ai-explorer" and "learning-path" map to "learning".

const ACHIEVEMENT_DEFINITIONS = [
  // id, title, description, icon, category, unit, bronzeT, bronzeXP, silverT, silverXP, goldT, goldXP, platT, platXP
  [
    "resume-builder",
    "Resume Creator",
    "Build and save resumes to showcase your professional profile",
    "FileText",
    "resume",
    "resumes",
    1, 50, 3, 100, 5, 200, 10, 500,
  ],
  [
    "resume-perfectionist",
    "Perfectionist",
    "Complete all sections of your resume for a polished, comprehensive profile",
    "Star",
    "resume",
    "sections",
    3, 50, 5, 100, 8, 200, 12, 500,
  ],
  [
    "interview-practice",
    "Interview Ready",
    "Complete mock interview practice sessions to sharpen your skills",
    "MicrophoneStage",
    "interview",
    "sessions",
    1, 50, 5, 100, 15, 200, 30, 500,
  ],
  [
    "interview-ace",
    "Interview Ace",
    "Score 80% or higher on mock interview evaluations",
    "Trophy",
    "interview",
    "sessions",
    1, 75, 3, 150, 10, 300, 25, 600,
  ],
  [
    "job-hunter",
    "Job Hunter",
    "Track job applications to stay organised in your job search",
    "Briefcase",
    "career",
    "applications",
    5, 50, 15, 100, 30, 200, 50, 500,
  ],
  [
    "skill-collector",
    "Skill Collector",
    "Add skills to your professional profile to stand out to employers",
    "Lightbulb",
    "career",
    "skills",
    5, 25, 15, 75, 30, 150, 50, 300,
  ],
  [
    "career-planner",
    "Career Planner",
    "Set and track career goals to stay focused on your professional journey",
    "Target",
    "career",
    "goals",
    1, 25, 3, 75, 5, 150, 10, 300,
  ],
  [
    "ai-explorer",
    "AI Explorer",
    "Use AI-powered features to accelerate your career development",
    "Robot",
    "learning",
    "uses",
    1, 25, 10, 75, 25, 150, 50, 300,
  ],
  [
    "network-builder",
    "Network Builder",
    "Grow your professional network by adding and tracking contacts",
    "UsersThree",
    "networking",
    "contacts",
    3, 50, 10, 100, 25, 200, 50, 500,
  ],
  [
    "daily-streak",
    "Dedication",
    "Maintain a daily login streak to build consistent career habits",
    "Fire",
    "engagement",
    "days",
    3, 50, 7, 100, 14, 200, 30, 500,
  ],
  [
    "content-creator",
    "Content Creator",
    "Write journal entries to reflect on your career progress",
    "PencilLine",
    "engagement",
    "entries",
    1, 25, 5, 75, 15, 150, 30, 300,
  ],
  [
    "learning-path",
    "Lifelong Learner",
    "Complete learning path milestones to continuously grow your skills",
    "GraduationCap",
    "learning",
    "milestones",
    1, 50, 5, 100, 10, 200, 25, 500,
  ],
];

const ACHIEVEMENT_INSERT_SQL = `
  INSERT INTO achievement_definition (
    id, title, description, icon, category, unit,
    bronze_target, bronze_xp,
    silver_target, silver_xp,
    gold_target,   gold_xp,
    platinum_target, platinum_xp
  ) VALUES (
    $1, $2, $3, $4, $5, $6,
    $7, $8, $9, $10, $11, $12, $13, $14
  )
  ON CONFLICT (id) DO NOTHING
`;

// ---------------------------------------------------------------------------
// Seed data: progress_milestone
// ---------------------------------------------------------------------------

const PROGRESS_MILESTONES = [
  // id, title, description, icon, xp_required, reward
  ["milestone-1",  "Getting Started",   "Complete your first achievement to begin your journey",              "Rocket",        100,   "Unlock profile badge"],
  ["milestone-2",  "Rising Star",       "Reach Level 2 by accumulating XP across achievements",              "Star",          250,   "Unlock custom theme"],
  ["milestone-3",  "Career Explorer",   "Complete 5 achievements to prove your dedication",                  "Compass",       500,   "Access premium templates"],
  ["milestone-4",  "Interview Pro",     "Ace 3 or more mock interviews with top scores",                     "MicrophoneStage", 1000, "Unlock AI mentor access"],
  ["milestone-5",  "Resume Master",     "Build 5 polished, complete resumes for different opportunities",    "Crown",         2000,  "Portfolio highlight badge"],
  ["milestone-6",  "Network Expert",    "Build and grow your professional network consistently",             "Handshake",     3500,  "Premium networking tools"],
  ["milestone-7",  "Career Champion",   "Demonstrate mastery across career planning and execution",          "Trophy",        5000,  "Career champion badge"],
  ["milestone-8",  "All-Star",          "Excel across all achievement categories to reach all-star status",  "Medal",         7500,  "All-star profile frame"],
  ["milestone-9",  "Legend",            "Achieve legendary status through sustained career excellence",      "Lightning",     10000, "Legend badge and theme"],
  ["milestone-10", "Grand Master",      "Reach the pinnacle of career achievement mastery",                  "Diamond",       15000, "Grand master title"],
];

const MILESTONE_INSERT_SQL = `
  INSERT INTO progress_milestone (id, title, description, icon, xp_required, reward)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (id) DO NOTHING
`;

// ---------------------------------------------------------------------------
// Seed data: unlockable_reward
// ---------------------------------------------------------------------------

const UNLOCKABLE_REWARDS = [
  // id, title, description, icon, type, required_level
  ["reward-1", "Emerald Theme",          "A rich dark emerald color theme for your dashboard",             "Palette",   "theme",    2],
  ["reward-2", "Achievement Badge",      "Display an achievement badge proudly on your profile",           "Medal",     "badge",    3],
  ["reward-3", "AI Writing Assistant",   "Enhanced AI features to help craft compelling career content",   "Robot",     "feature",  5],
  ["reward-4", "Gold Resume Template",   "An exclusive gold-accented resume template for standout CVs",    "FileText",  "template", 7],
  ["reward-5", "Career Dashboard Pro",   "Advanced analytics and insights for your career progression",    "ChartLine", "feature",  10],
  ["reward-6", "Diamond Badge",          "A prestigious diamond badge to showcase on your public profile", "Diamond",   "badge",    12],
  ["reward-7", "Executive Theme",        "A premium dark executive theme for a professional look",         "Crown",     "theme",    15],
  ["reward-8", "Master Badge",           "The ultimate badge awarded to those who achieve mastery",        "Trophy",    "badge",    20],
];

const REWARD_INSERT_SQL = `
  INSERT INTO unlockable_reward (id, title, description, icon, type, required_level)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (id) DO NOTHING
`;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== seed-all-data.mjs ===\n");
  console.log(`Connecting to: ${DATABASE_URL.replace(/:[^:@]+@/, ":****@")}`);

  await client.connect();
  console.log("Connected.\n");

  // Ensure schema is in place
  await ensureTables();

  // ------------------------------------------------------------------
  // 1. achievement_definition
  // ------------------------------------------------------------------
  console.log("--- Seeding achievement_definition ---");
  const beforeAch = await rowCount("achievement_definition") ?? 0;
  const insertedAch = await insertBatch(ACHIEVEMENT_INSERT_SQL, ACHIEVEMENT_DEFINITIONS);
  const afterAch = await rowCount("achievement_definition") ?? 0;

  console.log(`  Rows before : ${beforeAch}`);
  console.log(`  Rows inserted: ${insertedAch}`);
  console.log(`  Rows after  : ${afterAch}`);
  console.log(`  Skipped (conflict): ${ACHIEVEMENT_DEFINITIONS.length - insertedAch}\n`);

  // ------------------------------------------------------------------
  // 2. progress_milestone
  // ------------------------------------------------------------------
  console.log("--- Seeding progress_milestone ---");
  const beforeMs = await rowCount("progress_milestone") ?? 0;
  const insertedMs = await insertBatch(MILESTONE_INSERT_SQL, PROGRESS_MILESTONES);
  const afterMs = await rowCount("progress_milestone") ?? 0;

  console.log(`  Rows before : ${beforeMs}`);
  console.log(`  Rows inserted: ${insertedMs}`);
  console.log(`  Rows after  : ${afterMs}`);
  console.log(`  Skipped (conflict): ${PROGRESS_MILESTONES.length - insertedMs}\n`);

  // ------------------------------------------------------------------
  // 3. unlockable_reward
  // ------------------------------------------------------------------
  console.log("--- Seeding unlockable_reward ---");
  const beforeRw = await rowCount("unlockable_reward") ?? 0;
  const insertedRw = await insertBatch(REWARD_INSERT_SQL, UNLOCKABLE_REWARDS);
  const afterRw = await rowCount("unlockable_reward") ?? 0;

  console.log(`  Rows before : ${beforeRw}`);
  console.log(`  Rows inserted: ${insertedRw}`);
  console.log(`  Rows after  : ${afterRw}`);
  console.log(`  Skipped (conflict): ${UNLOCKABLE_REWARDS.length - insertedRw}\n`);

  // ------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------
  const totalInserted = insertedAch + insertedMs + insertedRw;
  const totalRows = afterAch + afterMs + afterRw;

  console.log("=== Summary ===");
  console.log(`  achievement_definition : ${afterAch} rows (${insertedAch} new)`);
  console.log(`  progress_milestone     : ${afterMs} rows (${insertedMs} new)`);
  console.log(`  unlockable_reward      : ${afterRw} rows (${insertedRw} new)`);
  console.log(`  Total rows in DB       : ${totalRows}`);
  console.log(`  Total inserted this run: ${totalInserted}`);
  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error("\nFATAL:", err.message);
    console.error(err.stack);
    process.exit(1);
  })
  .finally(() => {
    client.end().catch(() => {});
  });
