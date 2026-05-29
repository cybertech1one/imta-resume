import pg from "pg";
const { Client } = pg;
const c = new Client({ host: "localhost", port: 5432, database: "postgres", user: "postgres", password: "postgres" });
await c.connect();
const r = await c.query("SELECT column_name, data_type, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'interview_tip' ORDER BY ordinal_position");
console.log(JSON.stringify(r.rows, null, 2));
const count = await c.query("SELECT count(*) FROM interview_tip");
console.log("Current row count:", count.rows[0].count);
await c.end();
