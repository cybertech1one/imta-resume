import { ORPCError } from "@orpc/client";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type QRSize = "small" | "medium" | "large";
export type QRStyle = "square" | "rounded" | "dots";

export type CreateQRCodeInput = {
	userId: string;
	name: string;
	url: string;
	foregroundColor?: string;
	backgroundColor?: string;
	size?: QRSize;
	style?: QRStyle;
};

export type UpdateQRCodeInput = {
	id: string;
	userId: string;
	name?: string;
	url?: string;
	foregroundColor?: string;
	backgroundColor?: string;
	size?: QRSize;
	style?: QRStyle;
};

export type ListQRCodesInput = {
	userId: string;
	limit?: number;
	offset?: number;
};

export type RecordScanInput = {
	qrCodeId: string;
	device?: string;
	location?: string;
	source?: string;
	ipAddress?: string;
	userAgent?: string;
};

export type GetStatisticsInput = {
	userId: string;
	qrCodeId?: string;
	days?: number;
};

export const qrCodeService = {
	// Create a new QR code
	create: async (input: CreateQRCodeInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.qrCode).values({
			id,
			userId: input.userId,
			name: input.name,
			url: input.url,
			foregroundColor: input.foregroundColor ?? "#000000",
			backgroundColor: input.backgroundColor ?? "#ffffff",
			size: input.size ?? "medium",
			style: input.style ?? "square",
		});

		return id;
	},

	// Get QR code by ID
	getById: async (input: { id: string; userId: string }) => {
		const [qrCode] = await db
			.select()
			.from(schema.qrCode)
			.where(and(eq(schema.qrCode.id, input.id), eq(schema.qrCode.userId, input.userId)));

		if (!qrCode) {
			throw new ORPCError("NOT_FOUND", { message: "QR code not found" });
		}

		// Get scan count
		const [scanCount] = await db
			.select({ count: count() })
			.from(schema.qrCodeScan)
			.where(eq(schema.qrCodeScan.qrCodeId, input.id));

		return {
			...qrCode,
			scans: scanCount?.count ?? 0,
		};
	},

	// List QR codes with scan counts
	list: async (input: ListQRCodesInput) => {
		const qrCodes = await db
			.select()
			.from(schema.qrCode)
			.where(eq(schema.qrCode.userId, input.userId))
			.orderBy(desc(schema.qrCode.createdAt))
			.limit(input.limit ?? 50)
			.offset(input.offset ?? 0);

		// Get scan counts for all QR codes
		const qrCodeIds = qrCodes.map((qr) => qr.id);
		if (qrCodeIds.length === 0) return [];

		const scanCounts = await db
			.select({
				qrCodeId: schema.qrCodeScan.qrCodeId,
				count: count(),
			})
			.from(schema.qrCodeScan)
			.where(sql`${schema.qrCodeScan.qrCodeId} = ANY(${qrCodeIds})`)
			.groupBy(schema.qrCodeScan.qrCodeId);

		const scanCountMap = Object.fromEntries(scanCounts.map((s) => [s.qrCodeId, s.count]));

		return qrCodes.map((qr) => ({
			...qr,
			scans: scanCountMap[qr.id] ?? 0,
		}));
	},

	// Update QR code
	update: async (input: UpdateQRCodeInput): Promise<void> => {
		const [existing] = await db
			.select()
			.from(schema.qrCode)
			.where(and(eq(schema.qrCode.id, input.id), eq(schema.qrCode.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "QR code not found" });
		}

		await db
			.update(schema.qrCode)
			.set({
				name: input.name,
				url: input.url,
				foregroundColor: input.foregroundColor,
				backgroundColor: input.backgroundColor,
				size: input.size,
				style: input.style,
			})
			.where(and(eq(schema.qrCode.id, input.id), eq(schema.qrCode.userId, input.userId)));
	},

	// Delete QR code
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db.delete(schema.qrCode).where(and(eq(schema.qrCode.id, input.id), eq(schema.qrCode.userId, input.userId)));
	},

	// Record a scan
	recordScan: async (input: RecordScanInput): Promise<void> => {
		const id = generateId();

		await db.insert(schema.qrCodeScan).values({
			id,
			qrCodeId: input.qrCodeId,
			device: input.device,
			location: input.location,
			source: input.source,
			ipAddress: input.ipAddress,
			userAgent: input.userAgent,
		});
	},

	// Get scan statistics
	getStatistics: async (input: GetStatisticsInput) => {
		const days = input.days ?? 30;
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		// Build base query conditions
		const qrCodes = await db.select().from(schema.qrCode).where(eq(schema.qrCode.userId, input.userId));

		const qrCodeIds = input.qrCodeId ? [input.qrCodeId] : qrCodes.map((qr) => qr.id);

		if (qrCodeIds.length === 0) {
			return {
				scansByDate: [],
				scansByDevice: [],
				scansByLocation: [],
				totalScans: 0,
			};
		}

		// Get scans by date
		const scansByDate = await db
			.select({
				date: sql<string>`DATE(${schema.qrCodeScan.scannedAt})`,
				scans: count(),
			})
			.from(schema.qrCodeScan)
			.where(and(sql`${schema.qrCodeScan.qrCodeId} = ANY(${qrCodeIds})`, gte(schema.qrCodeScan.scannedAt, startDate)))
			.groupBy(sql`DATE(${schema.qrCodeScan.scannedAt})`)
			.orderBy(sql`DATE(${schema.qrCodeScan.scannedAt})`);

		// Get scans by device
		const scansByDevice = await db
			.select({
				device: schema.qrCodeScan.device,
				count: count(),
			})
			.from(schema.qrCodeScan)
			.where(and(sql`${schema.qrCodeScan.qrCodeId} = ANY(${qrCodeIds})`, gte(schema.qrCodeScan.scannedAt, startDate)))
			.groupBy(schema.qrCodeScan.device);

		// Get scans by location
		const scansByLocation = await db
			.select({
				location: schema.qrCodeScan.location,
				count: count(),
			})
			.from(schema.qrCodeScan)
			.where(and(sql`${schema.qrCodeScan.qrCodeId} = ANY(${qrCodeIds})`, gte(schema.qrCodeScan.scannedAt, startDate)))
			.groupBy(schema.qrCodeScan.location)
			.orderBy(desc(count()))
			.limit(10);

		// Calculate total scans
		const totalScans = scansByDate.reduce((sum, s) => sum + s.scans, 0);

		// Calculate device percentages
		const deviceStats = scansByDevice.map((d) => ({
			device: d.device ?? "Unknown",
			count: d.count,
			percentage: totalScans > 0 ? Math.round((d.count / totalScans) * 100) : 0,
		}));

		// Calculate location percentages
		const locationStats = scansByLocation.map((l) => ({
			location: l.location ?? "Unknown",
			count: l.count,
			percentage: totalScans > 0 ? Math.round((l.count / totalScans) * 100) : 0,
		}));

		return {
			scansByDate: scansByDate.map((s) => ({
				date: s.date,
				scans: s.scans,
			})),
			scansByDevice: deviceStats,
			scansByLocation: locationStats,
			totalScans,
		};
	},
};
