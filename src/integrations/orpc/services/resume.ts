import { ORPCError } from "@orpc/client";
import { and, arrayContains, asc, desc, eq, or, sql } from "drizzle-orm";
import { get } from "es-toolkit/compat";
import { match } from "ts-pattern";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { ResumeData } from "@/schema/resume/data";
import { defaultResumeData } from "@/schema/resume/data";
import { env } from "@/utils/env";
import type { Locale } from "@/utils/locale";
import { hashPassword } from "@/utils/password";
import { verifyPrinterToken } from "@/utils/printer-token";
import { generateId } from "@/utils/string";
import { hasResumeAccess } from "../helpers/resume-access";
import { getStorageService } from "./storage";

/**
 * SSRF protection: validates that a URL does not point to private/internal networks.
 * Blocks localhost, link-local, and RFC-1918 private IP ranges to prevent
 * Server-Side Request Forgery when fetching user-controlled picture URLs.
 */
function isPrivateUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		const hostname = parsed.hostname;

		// Block localhost variants
		if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return true;

		// Block 0.0.0.0
		if (hostname === "0.0.0.0") return true;

		// Block RFC-1918 private ranges: 10.x.x.x
		if (hostname.startsWith("10.")) return true;

		// Block RFC-1918 private ranges: 172.16.0.0 - 172.31.255.255
		if (hostname.startsWith("172.")) {
			const second = Number.parseInt(hostname.split(".")[1], 10);
			if (second >= 16 && second <= 31) return true;
		}

		// Block RFC-1918 private ranges: 192.168.x.x
		if (hostname.startsWith("192.168.")) return true;

		// Block link-local / cloud metadata: 169.254.x.x (AWS/GCP/Azure metadata endpoint)
		if (hostname.startsWith("169.254.")) return true;

		// Block non-http(s) schemes
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return true;

		return false;
	} catch {
		return true; // Block malformed URLs
	}
}

// Timeout wrapper to prevent storage operations from hanging indefinitely
// when S3/SeaweedFS is unreachable (the S3 client has no built-in timeout).
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return Promise.race([
		promise,
		new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Storage operation timed out")), ms)),
	]);
}

// Helper function to build resume response (reduces duplication)
function buildResumeResponse<T extends boolean>(
	resume: {
		id: string;
		name: string;
		slug: string;
		tags: string[];
		data: ResumeData;
		isPublic: boolean;
		isLocked: boolean;
	},
	hasPassword: T,
) {
	return {
		id: resume.id,
		name: resume.name,
		slug: resume.slug,
		tags: resume.tags,
		data: resume.data,
		isPublic: resume.isPublic,
		isLocked: resume.isLocked,
		hasPassword,
	};
}

const tags = {
	list: async (input: { userId: string }): Promise<string[]> => {
		const result = await db
			.select({ tags: schema.resume.tags })
			.from(schema.resume)
			.where(eq(schema.resume.userId, input.userId));

		const uniqueTags = new Set(result.flatMap((tag) => tag.tags));
		const sortedTags = Array.from(uniqueTags).sort((a, b) => a.localeCompare(b));

		return sortedTags;
	},
};

const statistics = {
	getById: async (input: { id: string; userId: string }) => {
		const [statistics] = await db
			.select({
				isPublic: schema.resume.isPublic,
				views: schema.resumeStatistics.views,
				downloads: schema.resumeStatistics.downloads,
				lastViewedAt: schema.resumeStatistics.lastViewedAt,
				lastDownloadedAt: schema.resumeStatistics.lastDownloadedAt,
			})
			.from(schema.resumeStatistics)
			.rightJoin(schema.resume, eq(schema.resumeStatistics.resumeId, schema.resume.id))
			.where(and(eq(schema.resume.id, input.id), eq(schema.resume.userId, input.userId)));

		return {
			isPublic: statistics.isPublic,
			views: statistics.views ?? 0,
			downloads: statistics.downloads ?? 0,
			lastViewedAt: statistics.lastViewedAt,
			lastDownloadedAt: statistics.lastDownloadedAt,
		};
	},

	increment: async (input: { id: string; views?: boolean; downloads?: boolean }): Promise<void> => {
		const [resume] = await db
			.select({ isPublic: schema.resume.isPublic })
			.from(schema.resume)
			.where(eq(schema.resume.id, input.id))
			.limit(1);

		if (!resume?.isPublic) return;

		const views = input.views ? 1 : 0;
		const downloads = input.downloads ? 1 : 0;
		const lastViewedAt = input.views ? sql`now()` : undefined;
		const lastDownloadedAt = input.downloads ? sql`now()` : undefined;

		await db
			.insert(schema.resumeStatistics)
			.values({
				resumeId: input.id,
				views,
				downloads,
				lastViewedAt,
				lastDownloadedAt,
			})
			.onConflictDoUpdate({
				target: [schema.resumeStatistics.resumeId],
				set: {
					views: sql`${schema.resumeStatistics.views} + ${views}`,
					downloads: sql`${schema.resumeStatistics.downloads} + ${downloads}`,
					lastViewedAt,
					lastDownloadedAt,
				},
			});
	},
};

export const resumeService = {
	tags,
	statistics,

	list: async (input: { userId: string; tags: string[]; sort: "lastUpdatedAt" | "createdAt" | "name" }) => {
		return await db
			.select({
				id: schema.resume.id,
				name: schema.resume.name,
				slug: schema.resume.slug,
				tags: schema.resume.tags,
				isPublic: schema.resume.isPublic,
				isLocked: schema.resume.isLocked,
				createdAt: schema.resume.createdAt,
				updatedAt: schema.resume.updatedAt,
			})
			.from(schema.resume)
			.where(
				and(
					eq(schema.resume.userId, input.userId),
					match(input.tags.length)
						.with(0, () => undefined)
						.otherwise(() => arrayContains(schema.resume.tags, input.tags)),
				),
			)
			.orderBy(
				match(input.sort)
					.with("lastUpdatedAt", () => desc(schema.resume.updatedAt))
					.with("createdAt", () => asc(schema.resume.createdAt))
					.with("name", () => asc(schema.resume.name))
					.exhaustive(),
			);
	},

	getById: async (input: { id: string; userId: string }) => {
		const [resume] = await db
			.select({
				id: schema.resume.id,
				name: schema.resume.name,
				slug: schema.resume.slug,
				tags: schema.resume.tags,
				data: schema.resume.data,
				isPublic: schema.resume.isPublic,
				isLocked: schema.resume.isLocked,
				hasPassword: sql<boolean>`${schema.resume.password} IS NOT NULL`,
			})
			.from(schema.resume)
			.where(and(eq(schema.resume.id, input.id), eq(schema.resume.userId, input.userId)));

		if (!resume) throw new ORPCError("NOT_FOUND");

		return resume;
	},

	/**
	 * Returns a resume's FULL data (including PII: name, email, phone, location,
	 * national ID, etc.) for PDF/screenshot rendering. Because this bypasses the
	 * normal owner-scoped `getById` access check, the caller MUST prove it is an
	 * authorized printer caller. Authorization (`input.auth`) is one of:
	 *
	 * - `{ trusted: true }` — the in-process server-only render path. The only
	 *   router using this is `getByIdForPrinter` (a `serverOnlyProcedure` gated by
	 *   the SERVER_ONLY_TOKEN header), which is unreachable from browser/public
	 *   HTTP clients. This is what the Chromium printer route loader resolves to.
	 *
	 * - `{ printerToken }` — a short-lived HMAC printer token (see
	 *   `generatePrinterToken`/`verifyPrinterToken`, which uses `timingSafeEqual`).
	 *   The token's embedded resume id MUST match the requested id.
	 *
	 * - `{ requesterUserId? }` — the public PDF / protected screenshot router. The
	 *   resume is only returned when the requester OWNS it, or the resume is
	 *   PUBLIC. Private resumes are NEVER returned to a non-owner. An anonymous
	 *   requester (`requesterUserId` undefined) may only render PUBLIC resumes.
	 *
	 * Any caller failing all of the above is rejected — this is the
	 * defense-in-depth layer that prevents unauthenticated/cross-user PII leakage
	 * even if a calling router is misconfigured.
	 */
	getByIdForPrinter: async (input: {
		id: string;
		auth: { trusted: true } | { printerToken: string } | { requesterUserId?: string };
	}) => {
		// Printer-token authorization can be validated before the DB read since the
		// token is cryptographically bound to the resume id.
		if ("printerToken" in input.auth) {
			// `verifyPrinterToken` is a server-only isomorphic fn; its type includes
			// `undefined` for the (unreachable) client branch. This service only runs
			// server-side, so a falsy result here means verification did not produce a
			// valid resume id and the request must be rejected.
			let tokenResumeId: string | undefined;
			try {
				tokenResumeId = verifyPrinterToken(input.auth.printerToken);
			} catch {
				throw new ORPCError("UNAUTHORIZED", {
					message: "A valid printer token is required to render this resume.",
				});
			}
			// Token must be bound to exactly this resume id (prevents replaying a
			// token against a different, enumerable resume id).
			if (!tokenResumeId || tokenResumeId !== input.id) {
				throw new ORPCError("UNAUTHORIZED", {
					message: "Printer token does not match the requested resume.",
				});
			}
		}

		const [resume] = await db
			.select({
				id: schema.resume.id,
				name: schema.resume.name,
				slug: schema.resume.slug,
				tags: schema.resume.tags,
				data: schema.resume.data,
				userId: schema.resume.userId,
				isPublic: schema.resume.isPublic,
				isLocked: schema.resume.isLocked,
				updatedAt: schema.resume.updatedAt,
			})
			.from(schema.resume)
			.where(eq(schema.resume.id, input.id));

		if (!resume) throw new ORPCError("NOT_FOUND");

		// Ownership / isPublic authorization for the public-router path. The
		// trusted and printerToken paths were already authorized above.
		if (!("trusted" in input.auth) && !("printerToken" in input.auth)) {
			const requesterUserId = input.auth.requesterUserId;
			const isOwner = !!requesterUserId && requesterUserId === resume.userId;
			if (!isOwner && !resume.isPublic) {
				// Do not reveal existence of private resumes to non-owners.
				throw new ORPCError("NOT_FOUND");
			}
		}

		try {
			if (!resume.data.picture.url) throw new Error("Picture is not available");

			// SSRF protection: validate the original user-controlled URL before any transformation.
			// The APP_URL replacement below is a trusted server-side transform (self-fetch for SSR),
			// so we check the raw URL first to block user-injected private network targets.
			if (isPrivateUrl(resume.data.picture.url)) throw new Error("Picture URL points to a private network");

			// Convert picture URL to base64 data, so there's no fetching required on the client.
			const url = resume.data.picture.url.replace(env.APP_URL, "http://localhost:3000");

			const base64 = await fetch(url)
				.then((res) => res.arrayBuffer())
				.then((buffer) => Buffer.from(buffer).toString("base64"));

			resume.data.picture.url = `data:image/jpeg;base64,${base64}`;
		} catch (error) {
			console.warn("[Resume] Failed to convert picture to base64:", error);
			// Continue without picture
		}

		return resume;
	},

	getBySlug: async (input: { username: string; slug: string; currentUserId?: string }) => {
		const [resume] = await db
			.select({
				id: schema.resume.id,
				name: schema.resume.name,
				slug: schema.resume.slug,
				tags: schema.resume.tags,
				data: schema.resume.data,
				isPublic: schema.resume.isPublic,
				isLocked: schema.resume.isLocked,
				passwordHash: schema.resume.password,
				hasPassword: sql<boolean>`${schema.resume.password} IS NOT NULL`,
			})
			.from(schema.resume)
			.innerJoin(schema.user, eq(schema.resume.userId, schema.user.id))
			.where(
				and(
					eq(schema.resume.slug, input.slug),
					eq(schema.user.username, input.username),
					input.currentUserId
						? or(eq(schema.resume.userId, input.currentUserId), eq(schema.resume.isPublic, true))
						: eq(schema.resume.isPublic, true),
				),
			);

		if (!resume) throw new ORPCError("NOT_FOUND");

		if (!resume.hasPassword) {
			await resumeService.statistics.increment({ id: resume.id, views: true });
			return buildResumeResponse(resume, false as const);
		}

		if (hasResumeAccess(resume.id, resume.passwordHash)) {
			await resumeService.statistics.increment({ id: resume.id, views: true });
			return buildResumeResponse(resume, true as const);
		}

		throw new ORPCError("NEED_PASSWORD", {
			status: 401,
			data: { username: input.username, slug: input.slug },
		});
	},

	getBusinessCardBySlug: async (input: { username: string; slug: string; currentUserId?: string }) => {
		const [resume] = await db
			.select({
				id: schema.resume.id,
				name: schema.resume.name,
				slug: schema.resume.slug,
				tags: schema.resume.tags,
				data: schema.resume.data,
				isPublic: schema.resume.isPublic,
				isLocked: schema.resume.isLocked,
				passwordHash: schema.resume.password,
				hasPassword: sql<boolean>`${schema.resume.password} IS NOT NULL`,
			})
			.from(schema.resume)
			.innerJoin(schema.user, eq(schema.resume.userId, schema.user.id))
			.where(
				and(
					eq(schema.resume.slug, input.slug),
					eq(schema.user.username, input.username),
					input.currentUserId
						? or(eq(schema.resume.userId, input.currentUserId), eq(schema.resume.isPublic, true))
						: eq(schema.resume.isPublic, true),
				),
			);

		if (!resume) throw new ORPCError("NOT_FOUND");

		if (!resume.hasPassword || hasResumeAccess(resume.id, resume.passwordHash)) {
			await resumeService.statistics.increment({ id: resume.id, views: true });

			return buildResumeResponse(resume, false as const);
		}

		throw new ORPCError("NEED_PASSWORD", {
			status: 401,
			data: { username: input.username, slug: input.slug },
		});
	},

	create: async (input: {
		userId: string;
		name: string;
		slug: string;
		tags: string[];
		locale: Locale;
		data?: ResumeData;
	}): Promise<string> => {
		const id = generateId();

		input.data = input.data ?? defaultResumeData;
		input.data.metadata.page.locale = input.locale;

		try {
			await db.insert(schema.resume).values({
				id,
				name: input.name,
				slug: input.slug,
				tags: input.tags,
				userId: input.userId,
				data: input.data,
			});

			return id;
		} catch (error) {
			const constraint = get(error, "cause.constraint") as string | undefined;

			if (constraint === "resume_slug_user_id_unique") {
				throw new ORPCError("RESUME_SLUG_ALREADY_EXISTS", { status: 400 });
			}

			throw error;
		}
	},

	update: async (input: {
		id: string;
		userId: string;
		name?: string;
		slug?: string;
		tags?: string[];
		data?: ResumeData;
		isPublic?: boolean;
	}): Promise<void> => {
		const [resume] = await db
			.select({ isLocked: schema.resume.isLocked })
			.from(schema.resume)
			.where(and(eq(schema.resume.id, input.id), eq(schema.resume.userId, input.userId)));

		if (resume?.isLocked) throw new ORPCError("RESUME_LOCKED");

		const updateData: Partial<typeof schema.resume.$inferSelect> = {
			name: input.name,
			slug: input.slug,
			tags: input.tags,
			data: input.data,
			isPublic: input.isPublic,
		};

		try {
			await db
				.update(schema.resume)
				.set(updateData)
				.where(
					and(
						eq(schema.resume.id, input.id),
						eq(schema.resume.isLocked, false),
						eq(schema.resume.userId, input.userId),
					),
				);
		} catch (error) {
			if (get(error, "cause.constraint") === "resume_slug_user_id_unique") {
				throw new ORPCError("RESUME_SLUG_ALREADY_EXISTS", { status: 400 });
			}

			throw error;
		}
	},

	setLocked: async (input: { id: string; userId: string; isLocked: boolean }): Promise<void> => {
		await db
			.update(schema.resume)
			.set({ isLocked: input.isLocked })
			.where(and(eq(schema.resume.id, input.id), eq(schema.resume.userId, input.userId)));
	},

	setPassword: async (input: { id: string; userId: string; password: string }): Promise<void> => {
		const hashedPassword = await hashPassword(input.password);

		await db
			.update(schema.resume)
			.set({ password: hashedPassword })
			.where(and(eq(schema.resume.id, input.id), eq(schema.resume.userId, input.userId)));
	},

	removePassword: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.update(schema.resume)
			.set({ password: null })
			.where(and(eq(schema.resume.id, input.id), eq(schema.resume.userId, input.userId)));
	},

	delete: async (input: { id: string; userId: string }): Promise<void> => {
		const storageService = getStorageService();

		const deleteResumePromise = db
			.delete(schema.resume)
			.where(
				and(eq(schema.resume.id, input.id), eq(schema.resume.isLocked, false), eq(schema.resume.userId, input.userId)),
			);

		// Delete screenshots and PDFs using the new key format.
		// Wrap storage calls in a 5s timeout so they don't hang forever when S3/SeaweedFS is down.
		// Storage cleanup is best-effort — the DB deletion is what matters.
		const deleteScreenshotsPromise = withTimeout(
			storageService.delete(`uploads/${input.userId}/screenshots/${input.id}`),
			5000,
		);
		const deletePdfsPromise = withTimeout(storageService.delete(`uploads/${input.userId}/pdfs/${input.id}`), 5000);

		await Promise.allSettled([deleteResumePromise, deleteScreenshotsPromise, deletePdfsPromise]);
	},
};
