// End-to-end verification of the direct-messaging core against production.
// Mirrors the service's SQL (participant-scoping, 1:1 reuse, unread counts).
// Usage: source resume-maker-sdlc/.deploy-vars && node scripts/messaging-verify.mjs
import { randomUUID } from "node:crypto";
import { Client } from "pg";

const url = process.env.PG_PUBLIC_URL;
if (!url) {
	console.error("PG_PUBLIC_URL not set. Run: source resume-maker-sdlc/.deploy-vars");
	process.exit(1);
}

const client = new Client({ connectionString: url });
await client.connect();

const created = { conversationId: null };
let pass = 0;
let fail = 0;
const assert = (cond, label) => {
	if (cond) {
		pass++;
		console.log(`  PASS  ${label}`);
	} else {
		fail++;
		console.log(`  FAIL  ${label}`);
	}
};

// Service helper replicas -------------------------------------------------

async function findDirectConversation(a, b) {
	const { rows } = await client.query(
		`SELECT conversation_id
		 FROM conversation_participant
		 GROUP BY conversation_id
		 HAVING count(*) = 2
		   AND count(*) FILTER (WHERE user_id IN ($1, $2)) = 2
		 LIMIT 1`,
		[a, b],
	);
	return rows[0]?.conversation_id ?? null;
}

async function assertParticipant(conversationId, userId) {
	const { rows } = await client.query(
		`SELECT id FROM conversation_participant WHERE conversation_id = $1 AND user_id = $2 LIMIT 1`,
		[conversationId, userId],
	);
	return rows.length > 0; // true => allowed
}

async function unreadCount(userId) {
	const { rows } = await client.query(
		`SELECT count(*)::int AS count
		 FROM message m
		 JOIN conversation_participant cp
		   ON cp.conversation_id = m.conversation_id AND cp.user_id = $1
		 WHERE m.sender_user_id <> $1
		   AND (cp.last_read_at IS NULL OR m.created_at > cp.last_read_at)`,
		[userId],
	);
	return rows[0].count;
}

async function sendMessage(conversationId, senderId, body) {
	const id = randomUUID();
	await client.query(
		`INSERT INTO message (id, conversation_id, sender_user_id, body) VALUES ($1, $2, $3, $4)`,
		[id, conversationId, senderId, body],
	);
	await client.query(`UPDATE conversation SET last_message_at = now() WHERE id = $1`, [conversationId]);
	await client.query(
		`UPDATE conversation_participant SET last_read_at = now() WHERE conversation_id = $1 AND user_id = $2`,
		[conversationId, senderId],
	);
	return id;
}

try {
	// Resolve test users -------------------------------------------------
	const { rows: users } = await client.query(
		`SELECT id, email FROM "user" WHERE email IN ($1, $2, $3)`,
		["partner@test.com", "student1@test.com", "student2@test.com"],
	);
	const byEmail = Object.fromEntries(users.map((u) => [u.email, u.id]));
	const partner = byEmail["partner@test.com"];
	const student1 = byEmail["student1@test.com"];
	const student2 = byEmail["student2@test.com"]; // third party (must be excluded)

	console.log("Resolved users:");
	console.log(`  partner@test.com  = ${partner ?? "(missing)"}`);
	console.log(`  student1@test.com = ${student1 ?? "(missing)"}`);
	console.log(`  student2@test.com = ${student2 ?? "(missing)"}`);
	if (!partner || !student1 || !student2) {
		throw new Error("Required test accounts not found in production DB.");
	}

	// 1. startConversation (partner -> student1) -------------------------
	let conversationId = await findDirectConversation(partner, student1);
	assert(conversationId === null, "no pre-existing 1:1 conversation between partner and student1");
	conversationId = randomUUID();
	created.conversationId = conversationId;
	await client.query(`INSERT INTO conversation (id, subject) VALUES ($1, $2)`, [
		conversationId,
		"Verification thread",
	]);
	await client.query(
		`INSERT INTO conversation_participant (id, conversation_id, user_id) VALUES ($1, $2, $3), ($4, $5, $6)`,
		[randomUUID(), conversationId, partner, randomUUID(), conversationId, student1],
	);
	const m1 = await sendMessage(conversationId, partner, "Bonjour, votre profil nous intéresse.");
	assert(!!m1, "partner sent first message (startConversation)");

	// 2. reuse: startConversation again finds the SAME conversation ------
	const reused = await findDirectConversation(partner, student1);
	assert(reused === conversationId, "second startConversation reuses the existing 1:1 conversation");

	// 3. student1 replies ------------------------------------------------
	const m2 = await sendMessage(conversationId, student1, "Merci ! Je suis disponible pour un entretien.");
	assert(!!m2, "student1 replied (sendMessage)");

	const { rows: msgs } = await client.query(
		`SELECT sender_user_id, body FROM message WHERE conversation_id = $1 ORDER BY created_at`,
		[conversationId],
	);
	assert(msgs.length === 2, "conversation has exactly 2 messages");
	assert(msgs[0].sender_user_id === partner && msgs[1].sender_user_id === student1, "messages in correct order/sender");

	// 4. PARTICIPANT SCOPING --------------------------------------------
	assert((await assertParticipant(conversationId, partner)) === true, "partner IS a participant (allowed)");
	assert((await assertParticipant(conversationId, student1)) === true, "student1 IS a participant (allowed)");
	assert(
		(await assertParticipant(conversationId, student2)) === false,
		"student2 (third user) is NOT a participant -> getConversation/sendMessage would throw FORBIDDEN",
	);

	// 5. Unread counts ---------------------------------------------------
	// partner last_read_at was set when they sent m1; student1's reply (m2) is newer => 1 unread for partner.
	const partnerUnread = await unreadCount(partner);
	assert(partnerUnread === 1, `partner has 1 unread (student1's reply); got ${partnerUnread}`);
	// student1 last_read_at set when they sent m2 (after partner's m1) => 0 unread.
	const student1Unread = await unreadCount(student1);
	assert(student1Unread === 0, `student1 has 0 unread; got ${student1Unread}`);
	// student2 is in no conversation => 0 unread (cannot see this thread at all).
	const student2Unread = await unreadCount(student2);
	assert(student2Unread === 0, `student2 sees 0 unread (no access); got ${student2Unread}`);

	console.log(`\nResult: ${pass} passed, ${fail} failed`);
} finally {
	// Cleanup test rows --------------------------------------------------
	if (created.conversationId) {
		// ON DELETE CASCADE removes participants + messages.
		await client.query(`DELETE FROM conversation WHERE id = $1`, [created.conversationId]);
		console.log(`Cleaned up conversation ${created.conversationId} (cascade removed participants + messages).`);
	}
	await client.end();
}

process.exit(fail > 0 ? 1 : 0);
