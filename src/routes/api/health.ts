import { createFileRoute } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import { printerService } from "@/integrations/orpc/services/printer";
import { getStorageService } from "@/integrations/orpc/services/storage";

// Track request counts for basic metrics
let requestCount = 0;
let errorCount = 0;
const startTime = Date.now();

function isUnhealthy(check: unknown): boolean {
	return (
		!!check &&
		typeof check === "object" &&
		"status" in check &&
		typeof check.status === "string" &&
		check.status === "unhealthy"
	);
}

function isDegraded(check: unknown): boolean {
	return (
		!!check &&
		typeof check === "object" &&
		"status" in check &&
		typeof check.status === "string" &&
		check.status === "degraded"
	);
}

function formatUptime(seconds: number): string {
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (days > 0) return `${days}d ${hours}h ${minutes}m`;
	if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
	if (minutes > 0) return `${minutes}m ${secs}s`;
	return `${secs}s`;
}

async function handler() {
	requestCount++;
	const checkStart = Date.now();

	const [databaseCheck, printerCheck, storageCheck] = await Promise.all([
		checkDatabase(),
		checkPrinter(),
		checkStorage(),
	]);

	const checks = {
		version: process.env.npm_package_version || "unknown",
		status: "healthy" as "healthy" | "degraded" | "unhealthy",
		timestamp: new Date().toISOString(),
		uptime: formatUptime(process.uptime()),
		uptimeSeconds: process.uptime(),
		checks: {
			database: databaseCheck,
			printer: printerCheck,
			storage: storageCheck,
		},
		metrics: {
			requestCount,
			errorCount,
			processUptime: formatUptime((Date.now() - startTime) / 1000),
			checkDurationMs: Date.now() - checkStart,
		},
		environment: process.env.NODE_ENV || "development",
	};

	// Determine overall status
	const allChecks = Object.values(checks.checks);
	if (allChecks.some(isUnhealthy)) {
		checks.status = "unhealthy";
		errorCount++;
	} else if (allChecks.some(isDegraded)) {
		checks.status = "degraded";
	}

	const headers = new Headers();
	const body = JSON.stringify(checks, null, 2);
	headers.set("Content-Type", "application/json; charset=UTF-8");
	headers.set("Content-Length", Buffer.byteLength(body, "utf-8").toString());
	headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
	// Security headers for health endpoint
	headers.set("X-Content-Type-Options", "nosniff");
	headers.set("X-Frame-Options", "DENY");
	headers.set("Referrer-Policy", "no-referrer");
	headers.set("Permissions-Policy", "interest-cohort=()");
	headers.set("X-XSS-Protection", "0");

	return new Response(body, {
		headers,
		status: checks.status === "unhealthy" ? 503 : 200,
	});
}

async function checkDatabase() {
	try {
		await withTimeout(db.execute(sql`SELECT 1`), 5000);
		return { status: "healthy" };
	} catch (error) {
		return {
			status: "unhealthy",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return Promise.race([
		promise,
		new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Health check timed out")), ms)),
	]);
}

async function checkPrinter() {
	try {
		const result = await withTimeout(printerService.healthcheck(), 5000);

		return { status: "healthy", ...result };
	} catch (error) {
		return {
			status: "degraded",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

async function checkStorage() {
	try {
		const storageService = getStorageService();
		return await withTimeout(storageService.healthcheck(), 5000);
	} catch (error) {
		return {
			status: "degraded",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export const Route = createFileRoute("/api/health")({
	server: {
		handlers: {
			GET: handler,
		},
	},
});
