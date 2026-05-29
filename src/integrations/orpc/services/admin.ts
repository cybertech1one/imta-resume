import { and, count, desc, eq, gte, ilike, ne, or, sql, sum } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { hashPassword } from "@/utils/password";
import { generateId } from "@/utils/string";
import { getStorageService } from "./storage";

// Analytics functions
const analytics = {
	getOverview: async () => {
		const [[userCount], [resumeCount], [statsAggregates]] = await Promise.all([
			db.select({ count: count() }).from(schema.user),
			db.select({ count: count() }).from(schema.resume),
			db
				.select({
					totalViews: sum(schema.resumeStatistics.views),
					totalDownloads: sum(schema.resumeStatistics.downloads),
				})
				.from(schema.resumeStatistics),
		]);

		return {
			users: Number(userCount.count) || 0,
			resumes: Number(resumeCount.count) || 0,
			views: Number(statsAggregates.totalViews) || 0,
			downloads: Number(statsAggregates.totalDownloads) || 0,
		};
	},

	getAdvancedOverview: async () => {
		const now = new Date();
		const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		const [
			[totalUsers],
			[totalResumes],
			[statsAggregates],
			[activeUsers7d],
			[activeUsers30d],
			[newUsers7d],
			[newUsers30d],
			[verifiedUsers],
			[adminCount],
			[publicResumes],
			[lockedResumes],
			[activeSessions],
			templateUsage,
		] = await Promise.all([
			db.select({ count: count() }).from(schema.user),
			db.select({ count: count() }).from(schema.resume),
			db
				.select({
					totalViews: sum(schema.resumeStatistics.views),
					totalDownloads: sum(schema.resumeStatistics.downloads),
				})
				.from(schema.resumeStatistics),
			// Active users in last 7 days (users who updated a resume)
			db
				.select({ count: sql<number>`COUNT(DISTINCT ${schema.resume.userId})` })
				.from(schema.resume)
				.where(gte(schema.resume.updatedAt, sevenDaysAgo)),
			// Active users in last 30 days
			db
				.select({ count: sql<number>`COUNT(DISTINCT ${schema.resume.userId})` })
				.from(schema.resume)
				.where(gte(schema.resume.updatedAt, thirtyDaysAgo)),
			// New users in last 7 days
			db
				.select({ count: count() })
				.from(schema.user)
				.where(gte(schema.user.createdAt, sevenDaysAgo)),
			// New users in last 30 days
			db
				.select({ count: count() })
				.from(schema.user)
				.where(gte(schema.user.createdAt, thirtyDaysAgo)),
			// Verified users
			db
				.select({ count: count() })
				.from(schema.user)
				.where(eq(schema.user.emailVerified, true)),
			// Admin count
			db
				.select({ count: count() })
				.from(schema.user)
				.where(eq(schema.user.role, "admin")),
			// Public resumes
			db
				.select({ count: count() })
				.from(schema.resume)
				.where(eq(schema.resume.isPublic, true)),
			// Locked resumes
			db
				.select({ count: count() })
				.from(schema.resume)
				.where(eq(schema.resume.isLocked, true)),
			// Active sessions
			db
				.select({ count: count() })
				.from(schema.session)
				.where(gte(schema.session.expiresAt, now)),
			// Template usage from resume data
			db
				.select({
					template: sql<string>`${schema.resume.data}->'metadata'->>'template'`.as("template"),
					count: count(),
				})
				.from(schema.resume)
				.groupBy(sql`${schema.resume.data}->'metadata'->>'template'`)
				.limit(20),
		]);

		return {
			users: {
				total: Number(totalUsers.count) || 0,
				active7d: Number(activeUsers7d.count) || 0,
				active30d: Number(activeUsers30d.count) || 0,
				new7d: Number(newUsers7d.count) || 0,
				new30d: Number(newUsers30d.count) || 0,
				verified: Number(verifiedUsers.count) || 0,
				admins: Number(adminCount.count) || 0,
			},
			resumes: {
				total: Number(totalResumes.count) || 0,
				public: Number(publicResumes.count) || 0,
				locked: Number(lockedResumes.count) || 0,
			},
			engagement: {
				totalViews: Number(statsAggregates.totalViews) || 0,
				totalDownloads: Number(statsAggregates.totalDownloads) || 0,
				activeSessions: Number(activeSessions.count) || 0,
			},
			templateUsage: templateUsage.map((t) => ({
				template: t.template || "unknown",
				count: Number(t.count) || 0,
			})),
		};
	},

	getUserGrowth: async (days: number) => {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const result = await db
			.select({
				date: sql<string>`DATE(${schema.user.createdAt})`.as("date"),
				count: count(),
			})
			.from(schema.user)
			.where(gte(schema.user.createdAt, startDate))
			.groupBy(sql`DATE(${schema.user.createdAt})`)
			.orderBy(sql`DATE(${schema.user.createdAt})`);

		return result.map((r) => ({ date: r.date, count: Number(r.count) || 0 }));
	},

	getResumeGrowth: async (days: number) => {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const result = await db
			.select({
				date: sql<string>`DATE(${schema.resume.createdAt})`.as("date"),
				count: count(),
			})
			.from(schema.resume)
			.where(gte(schema.resume.createdAt, startDate))
			.groupBy(sql`DATE(${schema.resume.createdAt})`)
			.orderBy(sql`DATE(${schema.resume.createdAt})`);

		return result.map((r) => ({ date: r.date, count: Number(r.count) || 0 }));
	},

	getTopResumes: async (limit: number) => {
		const result = await db
			.select({
				id: schema.resume.id,
				name: schema.resume.name,
				slug: schema.resume.slug,
				isPublic: schema.resume.isPublic,
				views: schema.resumeStatistics.views,
				downloads: schema.resumeStatistics.downloads,
				userName: schema.user.name,
				userEmail: schema.user.email,
			})
			.from(schema.resumeStatistics)
			.innerJoin(schema.resume, eq(schema.resumeStatistics.resumeId, schema.resume.id))
			.innerJoin(schema.user, eq(schema.resume.userId, schema.user.id))
			.orderBy(desc(schema.resumeStatistics.views))
			.limit(limit);

		return result;
	},

	getRecentActivity: async (limit: number) => {
		const [recentUsers, recentResumes] = await Promise.all([
			db
				.select({
					id: schema.user.id,
					name: schema.user.name,
					email: schema.user.email,
					createdAt: schema.user.createdAt,
				})
				.from(schema.user)
				.orderBy(desc(schema.user.createdAt))
				.limit(limit),
			db
				.select({
					id: schema.resume.id,
					name: schema.resume.name,
					createdAt: schema.resume.createdAt,
					userName: schema.user.name,
				})
				.from(schema.resume)
				.innerJoin(schema.user, eq(schema.resume.userId, schema.user.id))
				.orderBy(desc(schema.resume.createdAt))
				.limit(limit),
		]);

		return { recentUsers, recentResumes };
	},
};

// System health functions
const system = {
	getHealth: async () => {
		const now = new Date();
		const checks: {
			database: { status: string; latencyMs: number };
			storage: { status: string };
			activeSessions: number;
			totalAuditLogs: number;
		} = {
			database: { status: "unknown", latencyMs: 0 },
			storage: { status: "unknown" },
			activeSessions: 0,
			totalAuditLogs: 0,
		};

		// Check database connectivity
		const dbStart = Date.now();
		try {
			const [result] = await db.select({ one: sql<number>`1` }).from(sql`(SELECT 1) as t`);
			checks.database = {
				status: result ? "healthy" : "unhealthy",
				latencyMs: Date.now() - dbStart,
			};
		} catch {
			checks.database = { status: "unhealthy", latencyMs: Date.now() - dbStart };
		}

		// Check storage
		try {
			getStorageService();
			// Just check if it's configured
			checks.storage = { status: "healthy" };
		} catch {
			checks.storage = { status: "unhealthy" };
		}

		// Active sessions count
		try {
			const [result] = await db
				.select({ count: count() })
				.from(schema.session)
				.where(gte(schema.session.expiresAt, now));
			checks.activeSessions = result.count;
		} catch {
			checks.activeSessions = 0;
		}

		// Total audit logs
		try {
			const [result] = await db.select({ count: count() }).from(schema.auditLog);
			checks.totalAuditLogs = result.count;
		} catch {
			checks.totalAuditLogs = 0;
		}

		return checks;
	},
};

// User management functions
const users = {
	list: async (input: { page: number; limit: number; search?: string }) => {
		const offset = (input.page - 1) * input.limit;

		const whereClause = input.search
			? or(
					ilike(schema.user.name, `%${input.search}%`),
					ilike(schema.user.email, `%${input.search}%`),
					ilike(schema.user.username, `%${input.search}%`),
				)
			: undefined;

		const [usersResult, [countResult]] = await Promise.all([
			db
				.select({
					id: schema.user.id,
					name: schema.user.name,
					email: schema.user.email,
					username: schema.user.username,
					role: schema.user.role,
					emailVerified: schema.user.emailVerified,
					banned: schema.user.banned,
					createdAt: schema.user.createdAt,
					resumeCount: sql<number>`(SELECT COUNT(*) FROM resume WHERE resume.user_id = ${schema.user.id})`,
				})
				.from(schema.user)
				.where(whereClause)
				.orderBy(desc(schema.user.createdAt))
				.limit(input.limit)
				.offset(offset),
			db.select({ count: count() }).from(schema.user).where(whereClause),
		]);

		const total = Number(countResult.count) || 0;
		return {
			users: usersResult.map((u) => ({
				id: u.id,
				name: u.name,
				email: u.email,
				username: u.username,
				role: u.role,
				emailVerified: u.emailVerified,
				banned: u.banned,
				createdAt: u.createdAt instanceof Date ? u.createdAt : new Date(u.createdAt),
				resumeCount: Number(u.resumeCount) || 0,
			})),
			total,
			page: input.page,
			totalPages: Math.ceil(total / input.limit),
		};
	},

	getById: async (userId: string) => {
		const [[userResult], resumesResult] = await Promise.all([
			db
				.select({
					id: schema.user.id,
					name: schema.user.name,
					email: schema.user.email,
					username: schema.user.username,
					displayUsername: schema.user.displayUsername,
					role: schema.user.role,
					emailVerified: schema.user.emailVerified,
					twoFactorEnabled: schema.user.twoFactorEnabled,
					image: schema.user.image,
					imtaProgram: schema.user.imtaProgram,
					banned: schema.user.banned,
					banReason: schema.user.banReason,
					banExpiresAt: schema.user.banExpiresAt,
					createdAt: schema.user.createdAt,
					updatedAt: schema.user.updatedAt,
				})
				.from(schema.user)
				.where(eq(schema.user.id, userId)),
			db
				.select({
					id: schema.resume.id,
					name: schema.resume.name,
					slug: schema.resume.slug,
					isPublic: schema.resume.isPublic,
					isLocked: schema.resume.isLocked,
					createdAt: schema.resume.createdAt,
					updatedAt: schema.resume.updatedAt,
					views: schema.resumeStatistics.views,
					downloads: schema.resumeStatistics.downloads,
				})
				.from(schema.resume)
				.leftJoin(schema.resumeStatistics, eq(schema.resume.id, schema.resumeStatistics.resumeId))
				.where(eq(schema.resume.userId, userId))
				.orderBy(desc(schema.resume.updatedAt)),
		]);

		if (!userResult) return null;

		// Get session count for this user
		const now = new Date();
		const [sessionCount] = await db
			.select({ count: count() })
			.from(schema.session)
			.where(eq(schema.session.userId, userId));

		const [activeSessionCount] = await db
			.select({ count: count() })
			.from(schema.session)
			.where(sql`${schema.session.userId} = ${userId} AND ${schema.session.expiresAt} > ${now}`);

		// Get last session for last active info
		const [lastSession] = await db
			.select({ createdAt: schema.session.createdAt })
			.from(schema.session)
			.where(eq(schema.session.userId, userId))
			.orderBy(desc(schema.session.createdAt))
			.limit(1);

		return {
			...userResult,
			resumes: resumesResult,
			sessionCount: Number(sessionCount.count) || 0,
			activeSessionCount: Number(activeSessionCount.count) || 0,
			lastActiveAt: lastSession?.createdAt ?? null,
		};
	},

	updateRole: async (input: { userId: string; role: "user" | "admin" | "partner" }) => {
		await db.update(schema.user).set({ role: input.role }).where(eq(schema.user.id, input.userId));
	},

	delete: async (userId: string) => {
		const storageService = getStorageService();

		// Delete user's storage files
		await storageService.delete(`uploads/${userId}`);

		// Delete user (cascades to resumes, sessions, etc.)
		await db.delete(schema.user).where(eq(schema.user.id, userId));
	},

	bulkDelete: async (userIds: string[], currentAdminId: string) => {
		const storageService = getStorageService();
		const filteredIds = userIds.filter((id) => id !== currentAdminId);

		// Delete storage files first (outside transaction since it's external)
		for (const userId of filteredIds) {
			await storageService.delete(`uploads/${userId}`);
		}

		// Delete users in a transaction to ensure atomicity
		await db.transaction(async (tx) => {
			for (const userId of filteredIds) {
				await tx.delete(schema.user).where(eq(schema.user.id, userId));
			}
		});

		return { deleted: filteredIds.length };
	},

	bulkUpdateRole: async (userIds: string[], role: "user" | "admin" | "partner", currentAdminId: string) => {
		const idsToUpdate = userIds.filter((userId) => !(userId === currentAdminId && role === "user"));

		await db.transaction(async (tx) => {
			for (const userId of idsToUpdate) {
				await tx.update(schema.user).set({ role }).where(eq(schema.user.id, userId));
			}
		});

		return { updated: idsToUpdate.length };
	},

	/**
	 * Checks whether a user exists. Returns the user's id and email or null.
	 */
	exists: async (userId: string): Promise<{ id: string; email: string; name: string } | null> => {
		const [row] = await db
			.select({ id: schema.user.id, email: schema.user.email, name: schema.user.name })
			.from(schema.user)
			.where(eq(schema.user.id, userId))
			.limit(1);
		return row ?? null;
	},

	/**
	 * Admin sets/resets a user's credential password.
	 * Hashes with bcrypt (matching src/utils/password.ts) and upserts the
	 * `credential` account row, creating it if the user has none.
	 */
	setPassword: async (userId: string, newPassword: string) => {
		const passwordHash = await hashPassword(newPassword);

		const updated = await db
			.update(schema.account)
			.set({ password: passwordHash, updatedAt: new Date() })
			.where(and(eq(schema.account.userId, userId), eq(schema.account.providerId, "credential")))
			.returning({ id: schema.account.id });

		if (updated.length === 0) {
			// No credential account yet — create one (mirrors scripts/harden-accounts.mjs).
			await db.insert(schema.account).values({
				id: generateId(),
				accountId: userId,
				providerId: "credential",
				userId,
				password: passwordHash,
			});
		}
	},

	/**
	 * Deletes all sessions for a user, forcing logout everywhere.
	 * Returns the number of sessions revoked.
	 */
	revokeSessions: async (userId: string): Promise<number> => {
		const deleted = await db
			.delete(schema.session)
			.where(eq(schema.session.userId, userId))
			.returning({ id: schema.session.id });
		return deleted.length;
	},

	/**
	 * Marks a user's email as verified.
	 */
	verifyEmail: async (userId: string) => {
		await db.update(schema.user).set({ emailVerified: true, updatedAt: new Date() }).where(eq(schema.user.id, userId));
	},

	/**
	 * Bans a user. Optionally with a reason and an expiry timestamp.
	 * Also revokes all active sessions so the ban takes effect immediately.
	 * Returns the number of revoked sessions.
	 */
	ban: async (userId: string, reason: string | null, expiresAt: Date | null): Promise<number> => {
		await db
			.update(schema.user)
			.set({ banned: true, banReason: reason, banExpiresAt: expiresAt, updatedAt: new Date() })
			.where(eq(schema.user.id, userId));
		// Force logout so the ban is enforced right away.
		const deleted = await db
			.delete(schema.session)
			.where(eq(schema.session.userId, userId))
			.returning({ id: schema.session.id });
		return deleted.length;
	},

	/**
	 * Lifts a ban from a user, clearing reason and expiry.
	 */
	unban: async (userId: string) => {
		await db
			.update(schema.user)
			.set({ banned: false, banReason: null, banExpiresAt: null, updatedAt: new Date() })
			.where(eq(schema.user.id, userId));
	},

	/**
	 * Admin edits a user's profile fields. Enforces email & username uniqueness
	 * (case-insensitive for email) before applying changes. Throws an Error with
	 * a clean message when a value is already taken; the router maps it to a
	 * CONFLICT response.
	 */
	updateProfile: async (
		userId: string,
		input: { name?: string; email?: string; username?: string; imtaProgram?: string | null },
	) => {
		// Uniqueness checks against other users.
		if (input.email !== undefined) {
			const [taken] = await db
				.select({ id: schema.user.id })
				.from(schema.user)
				.where(and(ilike(schema.user.email, input.email), ne(schema.user.id, userId)))
				.limit(1);
			if (taken) throw new Error("EMAIL_TAKEN");
		}

		if (input.username !== undefined) {
			const [taken] = await db
				.select({ id: schema.user.id })
				.from(schema.user)
				.where(
					and(
						or(eq(schema.user.username, input.username), eq(schema.user.displayUsername, input.username)),
						ne(schema.user.id, userId),
					),
				)
				.limit(1);
			if (taken) throw new Error("USERNAME_TAKEN");
		}

		const updates: Partial<typeof schema.user.$inferInsert> = { updatedAt: new Date() };
		if (input.name !== undefined) updates.name = input.name;
		if (input.email !== undefined) updates.email = input.email.toLowerCase();
		if (input.username !== undefined) {
			updates.username = input.username;
			updates.displayUsername = input.username;
		}
		if (input.imtaProgram !== undefined) updates.imtaProgram = input.imtaProgram;

		await db.update(schema.user).set(updates).where(eq(schema.user.id, userId));
	},

	/**
	 * Lists a user's sessions (most recent first), with active/expired status.
	 */
	listSessions: async (userId: string) => {
		const now = new Date();
		const rows = await db
			.select({
				id: schema.session.id,
				createdAt: schema.session.createdAt,
				expiresAt: schema.session.expiresAt,
				ipAddress: schema.session.ipAddress,
				userAgent: schema.session.userAgent,
			})
			.from(schema.session)
			.where(eq(schema.session.userId, userId))
			.orderBy(desc(schema.session.createdAt));

		return rows.map((s) => ({
			...s,
			isActive: s.expiresAt.getTime() > now.getTime(),
		}));
	},
};

// Resume management functions
const resumes = {
	list: async (input: { page: number; limit: number; search?: string }) => {
		const offset = (input.page - 1) * input.limit;

		const whereClause = input.search
			? or(ilike(schema.resume.name, `%${input.search}%`), ilike(schema.user.name, `%${input.search}%`))
			: undefined;

		const [resumesResult, [countResult]] = await Promise.all([
			db
				.select({
					id: schema.resume.id,
					name: schema.resume.name,
					slug: schema.resume.slug,
					isPublic: schema.resume.isPublic,
					isLocked: schema.resume.isLocked,
					createdAt: schema.resume.createdAt,
					updatedAt: schema.resume.updatedAt,
					userId: schema.resume.userId,
					userName: schema.user.name,
					userEmail: schema.user.email,
					views: schema.resumeStatistics.views,
					downloads: schema.resumeStatistics.downloads,
				})
				.from(schema.resume)
				.innerJoin(schema.user, eq(schema.resume.userId, schema.user.id))
				.leftJoin(schema.resumeStatistics, eq(schema.resume.id, schema.resumeStatistics.resumeId))
				.where(whereClause)
				.orderBy(desc(schema.resume.updatedAt))
				.limit(input.limit)
				.offset(offset),
			db
				.select({ count: count() })
				.from(schema.resume)
				.innerJoin(schema.user, eq(schema.resume.userId, schema.user.id))
				.where(whereClause),
		]);

		const resumeTotal = Number(countResult.count) || 0;
		return {
			resumes: resumesResult,
			total: resumeTotal,
			page: input.page,
			totalPages: Math.ceil(resumeTotal / input.limit),
		};
	},

	getById: async (resumeId: string) => {
		const [result] = await db
			.select({
				id: schema.resume.id,
				name: schema.resume.name,
				slug: schema.resume.slug,
				tags: schema.resume.tags,
				isPublic: schema.resume.isPublic,
				isLocked: schema.resume.isLocked,
				createdAt: schema.resume.createdAt,
				updatedAt: schema.resume.updatedAt,
				userId: schema.resume.userId,
				userName: schema.user.name,
				userEmail: schema.user.email,
				views: schema.resumeStatistics.views,
				downloads: schema.resumeStatistics.downloads,
			})
			.from(schema.resume)
			.innerJoin(schema.user, eq(schema.resume.userId, schema.user.id))
			.leftJoin(schema.resumeStatistics, eq(schema.resume.id, schema.resumeStatistics.resumeId))
			.where(eq(schema.resume.id, resumeId));

		return result ?? null;
	},

	delete: async (input: { resumeId: string; userId: string }) => {
		const storageService = getStorageService();

		// Delete screenshots and PDFs
		await Promise.allSettled([
			storageService.delete(`uploads/${input.userId}/screenshots/${input.resumeId}`),
			storageService.delete(`uploads/${input.userId}/pdfs/${input.resumeId}`),
		]);

		// Delete resume from database
		await db.delete(schema.resume).where(eq(schema.resume.id, input.resumeId));
	},

	bulkDelete: async (resumeIds: string[]) => {
		const storageService = getStorageService();

		// First, gather all resume info for storage cleanup
		const resumeInfos: { resumeId: string; userId: string }[] = [];
		for (const resumeId of resumeIds) {
			const [resume] = await db
				.select({ userId: schema.resume.userId })
				.from(schema.resume)
				.where(eq(schema.resume.id, resumeId));

			if (resume) {
				resumeInfos.push({ resumeId, userId: resume.userId });
			}
		}

		// Delete storage files first (outside transaction since it's external)
		for (const { resumeId, userId } of resumeInfos) {
			await Promise.allSettled([
				storageService.delete(`uploads/${userId}/screenshots/${resumeId}`),
				storageService.delete(`uploads/${userId}/pdfs/${resumeId}`),
			]);
		}

		// Delete resumes in a transaction to ensure atomicity
		await db.transaction(async (tx) => {
			for (const { resumeId } of resumeInfos) {
				await tx.delete(schema.resume).where(eq(schema.resume.id, resumeId));
			}
		});

		return { deleted: resumeInfos.length };
	},
};

// Audit logging functions
const audit = {
	log: async (input: {
		adminId: string;
		action: string;
		targetType?: string;
		targetId?: string;
		metadata?: Record<string, unknown>;
	}) => {
		await db.insert(schema.auditLog).values({
			adminId: input.adminId,
			action: input.action,
			targetType: input.targetType,
			targetId: input.targetId,
			metadata: input.metadata,
		});
	},

	list: async (input: { page: number; limit: number }) => {
		const offset = (input.page - 1) * input.limit;

		const [logsResult, [countResult]] = await Promise.all([
			db
				.select({
					id: schema.auditLog.id,
					action: schema.auditLog.action,
					targetType: schema.auditLog.targetType,
					targetId: schema.auditLog.targetId,
					metadata: schema.auditLog.metadata,
					createdAt: schema.auditLog.createdAt,
					adminName: schema.user.name,
					adminEmail: schema.user.email,
				})
				.from(schema.auditLog)
				.leftJoin(schema.user, eq(schema.auditLog.adminId, schema.user.id))
				.orderBy(desc(schema.auditLog.createdAt))
				.limit(input.limit)
				.offset(offset),
			db.select({ count: count() }).from(schema.auditLog),
		]);

		const auditTotal = Number(countResult.count) || 0;
		return {
			logs: logsResult,
			total: auditTotal,
			page: input.page,
			totalPages: Math.ceil(auditTotal / input.limit),
		};
	},
};

// Export functions
const exportData = {
	users: async () => {
		const result = await db
			.select({
				id: schema.user.id,
				name: schema.user.name,
				email: schema.user.email,
				username: schema.user.username,
				role: schema.user.role,
				emailVerified: schema.user.emailVerified,
				createdAt: schema.user.createdAt,
				resumeCount: sql<number>`(SELECT COUNT(*) FROM resume WHERE resume.user_id = ${schema.user.id})`,
			})
			.from(schema.user)
			.orderBy(desc(schema.user.createdAt));

		return result.map((u) => ({ ...u, resumeCount: Number(u.resumeCount) || 0 }));
	},

	resumes: async () => {
		const result = await db
			.select({
				id: schema.resume.id,
				name: schema.resume.name,
				slug: schema.resume.slug,
				isPublic: schema.resume.isPublic,
				isLocked: schema.resume.isLocked,
				createdAt: schema.resume.createdAt,
				updatedAt: schema.resume.updatedAt,
				userId: schema.resume.userId,
				userName: schema.user.name,
				userEmail: schema.user.email,
				views: schema.resumeStatistics.views,
				downloads: schema.resumeStatistics.downloads,
			})
			.from(schema.resume)
			.innerJoin(schema.user, eq(schema.resume.userId, schema.user.id))
			.leftJoin(schema.resumeStatistics, eq(schema.resume.id, schema.resumeStatistics.resumeId))
			.orderBy(desc(schema.resume.createdAt));

		return result;
	},
};

export const adminService = {
	analytics,
	system,
	users,
	resumes,
	audit,
	export: exportData,
};
