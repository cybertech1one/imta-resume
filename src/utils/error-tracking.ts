/**
 * Error tracking utilities for capturing and reporting errors.
 * In development, logs to console. In production, would integrate
 * with error tracking services like Sentry, Bugsnag, etc.
 */

// Error severity levels
type ErrorLevel = "info" | "warning" | "error" | "fatal";

// Context that can be attached to error reports
interface ErrorContext {
	userId?: string;
	sessionId?: string;
	route?: string;
	action?: string;
	componentName?: string;
	[key: string]: unknown;
}

// Captured exception data
interface CapturedError {
	timestamp: string;
	message: string;
	name: string;
	stack?: string;
	context?: ErrorContext;
	level: ErrorLevel;
}

// In-memory error buffer for recent errors (dev debugging)
const errorBuffer: CapturedError[] = [];
const MAX_BUFFER_SIZE = 50;

/**
 * Capture an exception with optional context.
 * Logs to console and stores in buffer for debugging.
 *
 * @param error - The error to capture
 * @param context - Additional context about where/why the error occurred
 */
export function captureException(error: Error, context?: ErrorContext): void {
	const captured: CapturedError = {
		timestamp: new Date().toISOString(),
		message: error.message,
		name: error.name,
		stack: error.stack,
		context,
		level: "error",
	};

	// Add to buffer
	errorBuffer.push(captured);
	if (errorBuffer.length > MAX_BUFFER_SIZE) {
		errorBuffer.shift();
	}

	// Log to console
	console.error("[Error]", error.message, context ? { context } : "");

	if (process.env.NODE_ENV === "development" && error.stack) {
		console.error(error.stack);
	}

	// In production, this would send to error tracking service
	// Example: Sentry.captureException(error, { extra: context });
}

/**
 * Capture a message (non-exception) for tracking.
 *
 * @param message - The message to log
 * @param level - Severity level (info, warning, error)
 * @param context - Additional context
 */
export function captureMessage(message: string, level: ErrorLevel = "info", context?: ErrorContext): void {
	const captured: CapturedError = {
		timestamp: new Date().toISOString(),
		message,
		name: "Message",
		context,
		level,
	};

	// Add to buffer for warnings and errors
	if (level !== "info") {
		errorBuffer.push(captured);
		if (errorBuffer.length > MAX_BUFFER_SIZE) {
			errorBuffer.shift();
		}
	}

	// Log to console with appropriate method
	const levelPrefix = `[${level.toUpperCase()}]`;
	switch (level) {
		case "fatal":
		case "error":
			console.error(levelPrefix, message, context ?? "");
			break;
		case "warning":
			console.warn(levelPrefix, message, context ?? "");
			break;
		default:
			console.log(levelPrefix, message, context ?? "");
	}

	// In production, this would send to error tracking service
	// Example: Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking.
 * Attaches user information to all subsequent error reports.
 *
 * @param user - User identification information
 */
export function setUserContext(user: { id: string; email?: string; name?: string } | null): void {
	if (user) {
		if (process.env.NODE_ENV === "development") {
			console.debug("[ErrorTracking] User context set:", user.id);
		}
		// In production: Sentry.setUser(user);
	} else {
		if (process.env.NODE_ENV === "development") {
			console.debug("[ErrorTracking] User context cleared");
		}
		// In production: Sentry.setUser(null);
	}
}

/**
 * Add breadcrumb for error trail.
 * Breadcrumbs help trace user actions leading up to an error.
 *
 * @param category - Category of the breadcrumb (navigation, ui, http, etc.)
 * @param message - Descriptive message
 * @param data - Additional data
 */
export function addBreadcrumb(category: string, message: string, data?: Record<string, unknown>): void {
	if (process.env.NODE_ENV === "development") {
		console.debug(`[Breadcrumb:${category}]`, message, data ?? "");
	}

	// In production: Sentry.addBreadcrumb({ category, message, data });
}

/**
 * Get recent errors from the buffer (for debugging).
 *
 * @param count - Number of recent errors to retrieve
 * @returns Array of recent captured errors
 */
export function getRecentErrors(count = 10): CapturedError[] {
	return errorBuffer.slice(-count);
}

/**
 * Clear the error buffer.
 */
export function clearErrorBuffer(): void {
	errorBuffer.length = 0;
}

/**
 * Wrap an async function with error capture.
 * Automatically captures any thrown errors with context.
 *
 * @param fn - The async function to wrap
 * @param context - Context to attach to any captured errors
 * @returns The wrapped function
 */
export function withErrorCapture<T extends (...args: unknown[]) => Promise<unknown>>(fn: T, context?: ErrorContext): T {
	return (async (...args: Parameters<T>) => {
		try {
			return await fn(...args);
		} catch (error) {
			captureException(error instanceof Error ? error : new Error(String(error)), context);
			throw error;
		}
	}) as T;
}

/**
 * Create a scoped error capturer with preset context.
 *
 * @param defaultContext - Default context for all captures in this scope
 * @returns Object with capture methods that include the default context
 */
export function createErrorScope(defaultContext: ErrorContext) {
	return {
		captureException: (error: Error, additionalContext?: ErrorContext) =>
			captureException(error, { ...defaultContext, ...additionalContext }),

		captureMessage: (message: string, level: ErrorLevel = "info", additionalContext?: ErrorContext) =>
			captureMessage(message, level, { ...defaultContext, ...additionalContext }),

		addBreadcrumb: (category: string, message: string, data?: Record<string, unknown>) =>
			addBreadcrumb(category, message, { ...defaultContext, ...data }),
	};
}
