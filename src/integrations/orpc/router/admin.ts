import { ORPCError } from "@orpc/server";
import z from "zod";
import { adminProcedure } from "../context";
import { adminService } from "../services/admin";

// Analytics Router
const analyticsRouter = {
	getOverview: adminProcedure
		.route({
			method: "GET",
			path: "/admin/analytics/overview",
			tags: ["Admin", "Analytics"],
			summary: "Get analytics overview",
			description: "Get total counts for users, resumes, views, and downloads.",
		})
		.output(
			z.object({
				users: z.number(),
				resumes: z.number(),
				views: z.number(),
				downloads: z.number(),
			}),
		)
		.handler(async () => {
			return await adminService.analytics.getOverview();
		}),

	getAdvancedOverview: adminProcedure
		.route({
			method: "GET",
			path: "/admin/analytics/advanced-overview",
			tags: ["Admin", "Analytics"],
			summary: "Get advanced analytics overview",
			description: "Get detailed analytics including active users, template usage, session counts.",
		})
		.output(
			z.object({
				users: z.object({
					total: z.number(),
					active7d: z.number(),
					active30d: z.number(),
					new7d: z.number(),
					new30d: z.number(),
					verified: z.number(),
					admins: z.number(),
				}),
				resumes: z.object({
					total: z.number(),
					public: z.number(),
					locked: z.number(),
				}),
				engagement: z.object({
					totalViews: z.number(),
					totalDownloads: z.number(),
					activeSessions: z.number(),
				}),
				templateUsage: z.array(
					z.object({
						template: z.string(),
						count: z.number(),
					}),
				),
			}),
		)
		.handler(async () => {
			return await adminService.analytics.getAdvancedOverview();
		}),

	getUserGrowth: adminProcedure
		.route({
			method: "GET",
			path: "/admin/analytics/user-growth",
			tags: ["Admin", "Analytics"],
			summary: "Get user growth data",
			description: "Get daily user signups for the specified number of days.",
		})
		.input(z.object({ days: z.number().min(1).max(365).default(30) }))
		.output(z.array(z.object({ date: z.string(), count: z.number() })))
		.handler(async ({ input }) => {
			return await adminService.analytics.getUserGrowth(input.days);
		}),

	getResumeGrowth: adminProcedure
		.route({
			method: "GET",
			path: "/admin/analytics/resume-growth",
			tags: ["Admin", "Analytics"],
			summary: "Get resume growth data",
			description: "Get daily resume creations for the specified number of days.",
		})
		.input(z.object({ days: z.number().min(1).max(365).default(30) }))
		.output(z.array(z.object({ date: z.string(), count: z.number() })))
		.handler(async ({ input }) => {
			return await adminService.analytics.getResumeGrowth(input.days);
		}),

	getTopResumes: adminProcedure
		.route({
			method: "GET",
			path: "/admin/analytics/top-resumes",
			tags: ["Admin", "Analytics"],
			summary: "Get top resumes",
			description: "Get the most viewed resumes.",
		})
		.input(z.object({ limit: z.number().min(1).max(100).default(10) }))
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					name: z.string(),
					slug: z.string(),
					isPublic: z.boolean(),
					views: z.number().nullable(),
					downloads: z.number().nullable(),
					userName: z.string(),
					userEmail: z.string(),
				}),
			),
		)
		.handler(async ({ input }) => {
			return await adminService.analytics.getTopResumes(input.limit);
		}),

	getRecentActivity: adminProcedure
		.route({
			method: "GET",
			path: "/admin/analytics/recent-activity",
			tags: ["Admin", "Analytics"],
			summary: "Get recent activity",
			description: "Get recent user signups and resume creations.",
		})
		.input(z.object({ limit: z.number().min(1).max(50).default(10) }))
		.output(
			z.object({
				recentUsers: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						email: z.string(),
						createdAt: z.coerce.date(),
					}),
				),
				recentResumes: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						createdAt: z.coerce.date(),
						userName: z.string(),
					}),
				),
			}),
		)
		.handler(async ({ input }) => {
			return await adminService.analytics.getRecentActivity(input.limit);
		}),
};

// System Health Router
const systemRouter = {
	getHealth: adminProcedure
		.route({
			method: "GET",
			path: "/admin/system/health",
			tags: ["Admin", "System"],
			summary: "Get system health",
			description: "Get the health status of all system components.",
		})
		.output(
			z.object({
				database: z.object({
					status: z.string(),
					latencyMs: z.number(),
				}),
				storage: z.object({
					status: z.string(),
				}),
				activeSessions: z.number(),
				totalAuditLogs: z.number(),
			}),
		)
		.handler(async () => {
			return await adminService.system.getHealth();
		}),
};

// Users Router
const usersRouter = {
	list: adminProcedure
		.route({
			method: "GET",
			path: "/admin/users",
			tags: ["Admin", "Users"],
			summary: "List all users",
			description: "Get a paginated list of all users with search capability.",
		})
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(100).default(20),
				search: z.string().optional(),
			}),
		)
		.output(
			z.object({
				users: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						email: z.string(),
						username: z.string(),
						role: z.enum(["user", "admin", "partner"]),
						emailVerified: z.boolean(),
						banned: z.boolean(),
						createdAt: z.coerce.date(),
						resumeCount: z.number(),
					}),
				),
				total: z.number(),
				page: z.number(),
				totalPages: z.number(),
			}),
		)
		.handler(async ({ input }) => {
			return await adminService.users.list(input);
		}),

	getById: adminProcedure
		.route({
			method: "GET",
			path: "/admin/users/{userId}",
			tags: ["Admin", "Users"],
			summary: "Get user details",
			description: "Get detailed information about a specific user.",
		})
		.input(z.object({ userId: z.string().uuid() }))
		.output(
			z
				.object({
					id: z.string().uuid(),
					name: z.string(),
					email: z.string(),
					username: z.string(),
					displayUsername: z.string(),
					role: z.enum(["user", "admin", "partner"]),
					emailVerified: z.boolean(),
					twoFactorEnabled: z.boolean(),
					image: z.string().nullable(),
					imtaProgram: z.string().nullable(),
					banned: z.boolean(),
					banReason: z.string().nullable(),
					banExpiresAt: z.coerce.date().nullable(),
					createdAt: z.coerce.date(),
					updatedAt: z.coerce.date(),
					sessionCount: z.number(),
					activeSessionCount: z.number(),
					lastActiveAt: z.coerce.date().nullable(),
					resumes: z.array(
						z.object({
							id: z.string().uuid(),
							name: z.string(),
							slug: z.string(),
							isPublic: z.boolean(),
							isLocked: z.boolean(),
							createdAt: z.coerce.date(),
							updatedAt: z.coerce.date(),
							views: z.number().nullable(),
							downloads: z.number().nullable(),
						}),
					),
				})
				.nullable(),
		)
		.handler(async ({ input }) => {
			return await adminService.users.getById(input.userId);
		}),

	updateRole: adminProcedure
		.route({
			method: "PUT",
			path: "/admin/users/{userId}/role",
			tags: ["Admin", "Users"],
			summary: "Update user role",
			description: "Change a user's role (user or admin).",
		})
		.input(
			z.object({
				userId: z.string().uuid(),
				role: z.enum(["user", "admin", "partner"]),
			}),
		)
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input, context }) => {
			// Prevent admin from demoting themselves
			if (input.userId === context.user.id && input.role === "user") {
				throw new ORPCError("BAD_REQUEST", {
					message: "You cannot demote yourself from admin",
				});
			}

			await adminService.users.updateRole(input);

			// Log the action
			await adminService.audit.log({
				adminId: context.user.id,
				action: "update_user_role",
				targetType: "user",
				targetId: input.userId,
				metadata: { newRole: input.role },
			});

			return { success: true };
		}),

	delete: adminProcedure
		.route({
			method: "DELETE",
			path: "/admin/users/{userId}",
			tags: ["Admin", "Users"],
			summary: "Delete user",
			description: "Permanently delete a user and all their data.",
		})
		.input(z.object({ userId: z.string().uuid() }))
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input, context }) => {
			// Prevent admin from deleting themselves
			if (input.userId === context.user.id) {
				throw new ORPCError("BAD_REQUEST", {
					message: "You cannot delete your own account",
				});
			}

			// Get user info for audit log
			const user = await adminService.users.getById(input.userId);
			if (!user) {
				throw new ORPCError("NOT_FOUND", { message: "User not found" });
			}

			await adminService.users.delete(input.userId);

			// Log the action
			await adminService.audit.log({
				adminId: context.user.id,
				action: "delete_user",
				targetType: "user",
				targetId: input.userId,
				metadata: { deletedUserEmail: user.email, deletedUserName: user.name },
			});

			return { success: true };
		}),

	bulkDelete: adminProcedure
		.route({
			method: "POST",
			path: "/admin/users/bulk-delete",
			tags: ["Admin", "Users"],
			summary: "Bulk delete users",
			description: "Permanently delete multiple users and all their data.",
		})
		.input(z.object({ userIds: z.array(z.string().uuid()).min(1).max(50) }))
		.output(z.object({ deleted: z.number() }))
		.handler(async ({ input, context }) => {
			const result = await adminService.users.bulkDelete(input.userIds, context.user.id);

			await adminService.audit.log({
				adminId: context.user.id,
				action: "bulk_delete_users",
				targetType: "user",
				metadata: { count: result.deleted, userIds: input.userIds },
			});

			return result;
		}),

	bulkUpdateRole: adminProcedure
		.route({
			method: "POST",
			path: "/admin/users/bulk-update-role",
			tags: ["Admin", "Users"],
			summary: "Bulk update user roles",
			description: "Change the role of multiple users at once.",
		})
		.input(
			z.object({
				userIds: z.array(z.string().uuid()).min(1).max(50),
				role: z.enum(["user", "admin", "partner"]),
			}),
		)
		.output(z.object({ updated: z.number() }))
		.handler(async ({ input, context }) => {
			const result = await adminService.users.bulkUpdateRole(input.userIds, input.role, context.user.id);

			await adminService.audit.log({
				adminId: context.user.id,
				action: "bulk_update_user_roles",
				targetType: "user",
				metadata: { count: result.updated, role: input.role },
			});

			return result;
		}),

	setPassword: adminProcedure
		.route({
			method: "POST",
			path: "/admin/users/{userId}/set-password",
			tags: ["Admin", "Users"],
			summary: "Set user password",
			description: "Admin sets or resets a user's credential password.",
		})
		.input(
			z.object({
				userId: z.string().uuid(),
				newPassword: z.string().min(12).max(128),
			}),
		)
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input, context }) => {
			const target = await adminService.users.exists(input.userId);
			if (!target) throw new ORPCError("NOT_FOUND", { message: "User not found" });

			await adminService.users.setPassword(input.userId, input.newPassword);

			await adminService.audit.log({
				adminId: context.user.id,
				action: "set_user_password",
				targetType: "user",
				targetId: input.userId,
				metadata: { targetEmail: target.email },
			});

			return { success: true };
		}),

	revokeSessions: adminProcedure
		.route({
			method: "POST",
			path: "/admin/users/{userId}/revoke-sessions",
			tags: ["Admin", "Users"],
			summary: "Revoke user sessions",
			description: "Delete all sessions for a user, forcing logout everywhere.",
		})
		.input(z.object({ userId: z.string().uuid() }))
		.output(z.object({ revoked: z.number() }))
		.handler(async ({ input, context }) => {
			const target = await adminService.users.exists(input.userId);
			if (!target) throw new ORPCError("NOT_FOUND", { message: "User not found" });

			const revoked = await adminService.users.revokeSessions(input.userId);

			await adminService.audit.log({
				adminId: context.user.id,
				action: "revoke_user_sessions",
				targetType: "user",
				targetId: input.userId,
				metadata: { targetEmail: target.email, revoked },
			});

			return { revoked };
		}),

	verifyEmail: adminProcedure
		.route({
			method: "POST",
			path: "/admin/users/{userId}/verify-email",
			tags: ["Admin", "Users"],
			summary: "Verify user email",
			description: "Mark a user's email address as verified.",
		})
		.input(z.object({ userId: z.string().uuid() }))
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input, context }) => {
			const target = await adminService.users.exists(input.userId);
			if (!target) throw new ORPCError("NOT_FOUND", { message: "User not found" });

			await adminService.users.verifyEmail(input.userId);

			await adminService.audit.log({
				adminId: context.user.id,
				action: "verify_user_email",
				targetType: "user",
				targetId: input.userId,
				metadata: { targetEmail: target.email },
			});

			return { success: true };
		}),

	ban: adminProcedure
		.route({
			method: "POST",
			path: "/admin/users/{userId}/ban",
			tags: ["Admin", "Users"],
			summary: "Ban user",
			description: "Ban a user with an optional reason and expiry; revokes their sessions.",
		})
		.input(
			z.object({
				userId: z.string().uuid(),
				reason: z.string().max(500).optional(),
				expiresAt: z.coerce.date().optional(),
			}),
		)
		.output(z.object({ success: z.boolean(), revoked: z.number() }))
		.handler(async ({ input, context }) => {
			// Self-protection: an admin cannot ban themselves.
			if (input.userId === context.user.id) {
				throw new ORPCError("BAD_REQUEST", { message: "You cannot ban your own account" });
			}

			const target = await adminService.users.exists(input.userId);
			if (!target) throw new ORPCError("NOT_FOUND", { message: "User not found" });

			// Reject past expiry dates — a ban that is already expired is meaningless.
			if (input.expiresAt && input.expiresAt.getTime() <= Date.now()) {
				throw new ORPCError("BAD_REQUEST", { message: "Ban expiry must be in the future" });
			}

			const revoked = await adminService.users.ban(input.userId, input.reason ?? null, input.expiresAt ?? null);

			await adminService.audit.log({
				adminId: context.user.id,
				action: "ban_user",
				targetType: "user",
				targetId: input.userId,
				metadata: {
					targetEmail: target.email,
					reason: input.reason ?? null,
					expiresAt: input.expiresAt ? input.expiresAt.toISOString() : null,
					revoked,
				},
			});

			return { success: true, revoked };
		}),

	unban: adminProcedure
		.route({
			method: "POST",
			path: "/admin/users/{userId}/unban",
			tags: ["Admin", "Users"],
			summary: "Unban user",
			description: "Lift a ban from a user.",
		})
		.input(z.object({ userId: z.string().uuid() }))
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input, context }) => {
			const target = await adminService.users.exists(input.userId);
			if (!target) throw new ORPCError("NOT_FOUND", { message: "User not found" });

			await adminService.users.unban(input.userId);

			await adminService.audit.log({
				adminId: context.user.id,
				action: "unban_user",
				targetType: "user",
				targetId: input.userId,
				metadata: { targetEmail: target.email },
			});

			return { success: true };
		}),

	updateProfile: adminProcedure
		.route({
			method: "PUT",
			path: "/admin/users/{userId}/profile",
			tags: ["Admin", "Users"],
			summary: "Update user profile",
			description: "Admin edits a user's name, email, username, and program.",
		})
		.input(
			z.object({
				userId: z.string().uuid(),
				name: z.string().min(1).max(100).optional(),
				email: z.string().email().max(255).optional(),
				username: z
					.string()
					.min(2)
					.max(64)
					.regex(
						/^[a-z0-9._-]+$/,
						"Username may only contain lowercase letters, digits, dots, hyphens, and underscores",
					)
					.optional(),
				imtaProgram: z.string().max(100).nullable().optional(),
			}),
		)
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input, context }) => {
			const target = await adminService.users.exists(input.userId);
			if (!target) throw new ORPCError("NOT_FOUND", { message: "User not found" });

			const { userId, ...fields } = input;
			try {
				await adminService.users.updateProfile(userId, fields);
			} catch (error) {
				const code = error instanceof Error ? error.message : "";
				if (code === "EMAIL_TAKEN") {
					throw new ORPCError("CONFLICT", { message: "This email is already in use" });
				}
				if (code === "USERNAME_TAKEN") {
					throw new ORPCError("CONFLICT", { message: "This username is already in use" });
				}
				throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update profile" });
			}

			await adminService.audit.log({
				adminId: context.user.id,
				action: "update_user_profile",
				targetType: "user",
				targetId: input.userId,
				metadata: { changedFields: Object.keys(fields) },
			});

			return { success: true };
		}),

	listSessions: adminProcedure
		.route({
			method: "GET",
			path: "/admin/users/{userId}/sessions",
			tags: ["Admin", "Users"],
			summary: "List user sessions",
			description: "List a user's sessions with active/expired status.",
		})
		.input(z.object({ userId: z.string().uuid() }))
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					createdAt: z.coerce.date(),
					expiresAt: z.coerce.date(),
					ipAddress: z.string().nullable(),
					userAgent: z.string().nullable(),
					isActive: z.boolean(),
				}),
			),
		)
		.handler(async ({ input }) => {
			return await adminService.users.listSessions(input.userId);
		}),
};

// Resumes Router
const resumesRouter = {
	list: adminProcedure
		.route({
			method: "GET",
			path: "/admin/resumes",
			tags: ["Admin", "Resumes"],
			summary: "List all resumes",
			description: "Get a paginated list of all resumes with search capability.",
		})
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(100).default(20),
				search: z.string().optional(),
			}),
		)
		.output(
			z.object({
				resumes: z.array(
					z.object({
						id: z.string().uuid(),
						name: z.string(),
						slug: z.string(),
						isPublic: z.boolean(),
						isLocked: z.boolean(),
						createdAt: z.coerce.date(),
						updatedAt: z.coerce.date(),
						userId: z.string(),
						userName: z.string(),
						userEmail: z.string(),
						views: z.number().nullable(),
						downloads: z.number().nullable(),
					}),
				),
				total: z.number(),
				page: z.number(),
				totalPages: z.number(),
			}),
		)
		.handler(async ({ input }) => {
			return await adminService.resumes.list(input);
		}),

	getById: adminProcedure
		.route({
			method: "GET",
			path: "/admin/resumes/{resumeId}",
			tags: ["Admin", "Resumes"],
			summary: "Get resume details",
			description: "Get detailed information about a specific resume.",
		})
		.input(z.object({ resumeId: z.string().uuid() }))
		.output(
			z
				.object({
					id: z.string().uuid(),
					name: z.string(),
					slug: z.string(),
					tags: z.array(z.string()),
					isPublic: z.boolean(),
					isLocked: z.boolean(),
					createdAt: z.coerce.date(),
					updatedAt: z.coerce.date(),
					userId: z.string(),
					userName: z.string(),
					userEmail: z.string(),
					views: z.number().nullable(),
					downloads: z.number().nullable(),
				})
				.nullable(),
		)
		.handler(async ({ input }) => {
			return await adminService.resumes.getById(input.resumeId);
		}),

	delete: adminProcedure
		.route({
			method: "DELETE",
			path: "/admin/resumes/{resumeId}",
			tags: ["Admin", "Resumes"],
			summary: "Delete resume",
			description: "Permanently delete a resume.",
		})
		.input(z.object({ resumeId: z.string().uuid() }))
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input, context }) => {
			// Get resume info for audit log and to get userId for storage deletion
			const resume = await adminService.resumes.getById(input.resumeId);
			if (!resume) {
				throw new ORPCError("NOT_FOUND", { message: "Resume not found" });
			}

			await adminService.resumes.delete({ resumeId: input.resumeId, userId: resume.userId });

			// Log the action
			await adminService.audit.log({
				adminId: context.user.id,
				action: "delete_resume",
				targetType: "resume",
				targetId: input.resumeId,
				metadata: {
					resumeName: resume.name,
					ownerEmail: resume.userEmail,
				},
			});

			return { success: true };
		}),

	bulkDelete: adminProcedure
		.route({
			method: "POST",
			path: "/admin/resumes/bulk-delete",
			tags: ["Admin", "Resumes"],
			summary: "Bulk delete resumes",
			description: "Permanently delete multiple resumes.",
		})
		.input(z.object({ resumeIds: z.array(z.string().uuid()).min(1).max(50) }))
		.output(z.object({ deleted: z.number() }))
		.handler(async ({ input, context }) => {
			const result = await adminService.resumes.bulkDelete(input.resumeIds);

			await adminService.audit.log({
				adminId: context.user.id,
				action: "bulk_delete_resumes",
				targetType: "resume",
				metadata: { count: result.deleted, resumeIds: input.resumeIds },
			});

			return result;
		}),
};

// Audit Log Router
const auditRouter = {
	list: adminProcedure
		.route({
			method: "GET",
			path: "/admin/audit-log",
			tags: ["Admin", "Audit"],
			summary: "List audit log",
			description: "Get a paginated list of admin actions.",
		})
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(100).default(20),
			}),
		)
		.output(
			z.object({
				logs: z.array(
					z.object({
						id: z.string().uuid(),
						action: z.string(),
						targetType: z.string().nullable(),
						targetId: z.string().nullable(),
						metadata: z.any().nullable(),
						createdAt: z.coerce.date(),
						adminName: z.string().nullable(),
						adminEmail: z.string().nullable(),
					}),
				),
				total: z.number(),
				page: z.number(),
				totalPages: z.number(),
			}),
		)
		.handler(async ({ input }) => {
			return await adminService.audit.list(input);
		}),
};

// Export Router
const exportRouter = {
	users: adminProcedure
		.route({
			method: "GET",
			path: "/admin/export/users",
			tags: ["Admin", "Export"],
			summary: "Export users",
			description: "Export all user data as JSON.",
		})
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					name: z.string(),
					email: z.string(),
					username: z.string(),
					role: z.enum(["user", "admin", "partner"]),
					emailVerified: z.boolean(),
					createdAt: z.coerce.date(),
					resumeCount: z.number(),
				}),
			),
		)
		.handler(async ({ context }) => {
			// Log the export action
			await adminService.audit.log({
				adminId: context.user.id,
				action: "export_users",
				targetType: "export",
			});

			return await adminService.export.users();
		}),

	resumes: adminProcedure
		.route({
			method: "GET",
			path: "/admin/export/resumes",
			tags: ["Admin", "Export"],
			summary: "Export resumes",
			description: "Export all resume metadata as JSON.",
		})
		.output(
			z.array(
				z.object({
					id: z.string().uuid(),
					name: z.string(),
					slug: z.string(),
					isPublic: z.boolean(),
					isLocked: z.boolean(),
					createdAt: z.coerce.date(),
					updatedAt: z.coerce.date(),
					userId: z.string(),
					userName: z.string(),
					userEmail: z.string(),
					views: z.number().nullable(),
					downloads: z.number().nullable(),
				}),
			),
		)
		.handler(async ({ context }) => {
			// Log the export action
			await adminService.audit.log({
				adminId: context.user.id,
				action: "export_resumes",
				targetType: "export",
			});

			return await adminService.export.resumes();
		}),
};

export const adminRouter = {
	analytics: analyticsRouter,
	system: systemRouter,
	users: usersRouter,
	resumes: resumesRouter,
	audit: auditRouter,
	export: exportRouter,
};
