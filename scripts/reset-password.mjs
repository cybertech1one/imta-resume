import bcrypt from "bcrypt";
import pg from "pg";

const pool = new pg.Pool({ connectionString: "postgresql://postgres:postgres@localhost:5432/postgres" });

try {
  // Check current state
  const current = await pool.query(`SELECT id, user_id, provider_id, password FROM account WHERE provider_id = 'credential'`);
  console.log("Current accounts:", current.rows.length);
  for (const row of current.rows) {
    console.log(`  user_id=${row.user_id}, pw_len=${row.password?.length}, pw_start=${row.password?.substring(0, 10)}`);
  }

  // Generate hash
  const hash = await bcrypt.hash("TestAccount123!", 10);
  console.log("New hash:", hash);

  // Update all credential accounts
  const res = await pool.query(
    `UPDATE account SET password = $1 WHERE provider_id = 'credential' RETURNING user_id, password`,
    [hash]
  );
  console.log("Updated rows:", res.rowCount);
  for (const row of res.rows) {
    console.log(`  user_id=${row.user_id}, pw_start=${row.password?.substring(0, 10)}`);
    const match = await bcrypt.compare("TestAccount123!", row.password);
    console.log(`  Verify match: ${match}`);
  }
} catch (err) {
  console.error("Error:", err);
} finally {
  await pool.end();
}
