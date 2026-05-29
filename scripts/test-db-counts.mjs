import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read .env to get DATABASE_URL
let dbUrl;
try {
  const envContent = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
  const match = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
  if (match) dbUrl = match[1];
} catch {}

if (!dbUrl) {
  // fallback
  dbUrl = 'postgresql://postgres:postgres@localhost:5432/postgres';
}

console.log('Using DB:', dbUrl.replace(/:[^:@]+@/, ':***@'));

const client = new pg.Client({ connectionString: dbUrl });

async function main() {
  await client.connect();

  const tables = [
    'career_employer',
    'job_application',
    'market_salary_data',
    'skill_demand',
    'regional_job_stats',
    // Also check related tables
    'career_market_insight',
    'skill_library',
    'job_aggregator_job',
    'job_alert',
    'job_alert_match',
    'job_recommendation',
    'deadline',
    'networking_contact',
    'networking_event',
  ];

  console.log('\n=== DATABASE TABLE COUNTS ===\n');
  console.log('| Table | Row Count | Status |');
  console.log('|-------|-----------|--------|');

  for (const table of tables) {
    try {
      const res = await client.query(`SELECT count(*) FROM "${table}"`);
      const count = parseInt(res.rows[0].count, 10);
      const status = count > 0 ? 'HAS DATA' : 'EMPTY';
      console.log(`| ${table} | ${count} | ${status} |`);
    } catch (e) {
      // Try snake_case to camelCase variations
      const msg = e.message || '';
      if (msg.includes('does not exist')) {
        console.log(`| ${table} | - | TABLE MISSING |`);
      } else {
        console.log(`| ${table} | - | ERROR: ${msg.substring(0, 50)} |`);
      }
    }
  }

  await client.end();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
