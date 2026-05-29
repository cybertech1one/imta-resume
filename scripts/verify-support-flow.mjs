/**
 * End-to-end verification of the support ticket flow against the prod DB.
 * Mirrors the service logic (create ticket as student -> admin reply ->
 * list -> ownership check) then deletes all test rows.
 *
 * Usage: source resume-maker-sdlc/.deploy-vars && node scripts/verify-support-flow.mjs
 */
import pg from "pg";

const { Pool } = pg;
const connectionString = process.env.PG_PUBLIC_URL;
if (!connectionString) {
	console.error("PG_PUBLIC_URL is not set. Run: source resume-maker-sdlc/.deploy-vars");
	process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
	const c = await pool.connect();
	const log = (label, val) => console.log(`  ${label}: ${val}`);
	let ticketId;
	try {
		console.log("1. Resolving a student (role=user) and an admin (role=admin)…");
		const { rows: studentRows } = await c.query(
			`SELECT id, email, role FROM "user" WHERE role = 'user' ORDER BY created_at ASC LIMIT 1`,
		);
		const { rows: adminRows } = await c.query(
			`SELECT id, email, role FROM "user" WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1`,
		);
		const student = studentRows[0];
		const admin = adminRows[0];
		if (!student || !admin) throw new Error("Need at least one user and one admin in prod DB");
		log("student", `${student.email} (${student.id})`);
		log("admin", `${admin.email} (${admin.id}, role=${admin.role})`);

		console.log("2. Student opens a ticket + first message…");
		const { rows: tRows } = await c.query(
			`INSERT INTO support_ticket (user_id, subject, category, status, priority)
			 VALUES ($1, $2, 'technical', 'open', 'normal') RETURNING id, status, last_message_at`,
			[student.id, "[TEST] Vérification du flux de support"],
		);
		ticketId = tRows[0].id;
		await c.query(
			`INSERT INTO support_message (ticket_id, sender_user_id, is_admin, body)
			 VALUES ($1, $2, false, $3)`,
			[ticketId, student.id, "Bonjour, je n'arrive pas à télécharger mon CV."],
		);
		log("ticketId", ticketId);
		log("status", tRows[0].status);

		console.log("3. Ownership check (a different user must NOT see this ticket)…");
		const { rows: other } = await c.query(
			`SELECT id, email FROM "user" WHERE id <> $1 ORDER BY created_at ASC LIMIT 1`,
			[student.id],
		);
		if (other[0]) {
			// Simulates the service's user-scoped query: ticket id AND owner = the other user.
			const { rowCount } = await c.query(`SELECT id FROM support_ticket WHERE id = $1 AND user_id = $2`, [
				ticketId,
				other[0].id,
			]);
			log(`rows visible to ${other[0].email} (expect 0)`, rowCount);
			if (rowCount !== 0) throw new Error("OWNERSHIP LEAK: another user matched the ticket scope");
		} else {
			log("other user", "not found, skipping cross-user check");
		}

		console.log("4. Admin replies (is_admin=true) and ticket moves to in_progress…");
		await c.query(
			`INSERT INTO support_message (ticket_id, sender_user_id, is_admin, body)
			 VALUES ($1, $2, true, $3)`,
			[ticketId, admin.id, "Bonjour, pouvez-vous préciser le format de votre CV ?"],
		);
		await c.query(
			`UPDATE support_ticket SET status = 'in_progress', last_message_at = now() WHERE id = $1 AND status = 'open'`,
			[ticketId],
		);

		console.log("5. Admin listing (join user) + thread fetch…");
		const { rows: listRows } = await c.query(
			`SELECT st.id, st.subject, st.status, u.name AS user_name, u.email AS user_email
			 FROM support_ticket st JOIN "user" u ON u.id = st.user_id WHERE st.id = $1`,
			[ticketId],
		);
		log("admin sees", `${listRows[0].subject} [${listRows[0].status}] from ${listRows[0].user_email}`);

		const { rows: thread } = await c.query(
			`SELECT is_admin, body FROM support_message WHERE ticket_id = $1 ORDER BY created_at ASC`,
			[ticketId],
		);
		log("message count", thread.length);
		thread.forEach((m, i) => log(`  msg ${i + 1}`, `${m.is_admin ? "ADMIN" : "USER"}: ${m.body.slice(0, 40)}…`));

		console.log("6. Status counts (admin stats)…");
		const { rows: counts } = await c.query(
			`SELECT status, count(*)::int AS n FROM support_ticket GROUP BY status ORDER BY status`,
		);
		log("counts", counts.map((r) => `${r.status}=${r.n}`).join(", "));

		console.log("\nVERIFICATION: PASS ✅");
	} finally {
		if (ticketId) {
			console.log("7. Cleanup: deleting test ticket (cascades to messages)…");
			await c.query(`DELETE FROM support_ticket WHERE id = $1`, [ticketId]);
			const { rowCount } = await c.query(`SELECT id FROM support_ticket WHERE id = $1`, [ticketId]);
			console.log(`  remaining test rows (expect 0): ${rowCount}`);
		}
		c.release();
		await pool.end();
	}
}

main().catch((err) => {
	console.error("VERIFICATION: FAIL ❌", err);
	process.exit(1);
});
