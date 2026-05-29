import { eq } from "drizzle-orm";
import { schema } from "../src/integrations/drizzle";
import { db } from "../src/integrations/drizzle/client";

async function main() {
	const email = process.argv[2];

	if (!email) {
		// List all users
		console.log("Listing all users:\n");
		const users = await db
			.select({
				id: schema.user.id,
				email: schema.user.email,
				name: schema.user.name,
				role: schema.user.role,
			})
			.from(schema.user)
			.limit(20);

		for (const user of users) {
			console.log(`- ${user.email} (${user.name}) - Role: ${user.role}`);
		}

		console.log("\nTo promote a user to admin, run:");
		console.log("  pnpm tsx scripts/promote-admin.ts <email>");
	} else {
		// Promote user to admin
		const result = await db
			.update(schema.user)
			.set({ role: "admin" })
			.where(eq(schema.user.email, email))
			.returning({ id: schema.user.id, email: schema.user.email, role: schema.user.role });

		if (result.length === 0) {
			console.log(`No user found with email: ${email}`);
		} else {
			console.log(`✅ Successfully promoted ${result[0].email} to admin!`);
		}
	}

	process.exit(0);
}

main().catch((e) => {
	console.error("Error:", e);
	process.exit(1);
});
