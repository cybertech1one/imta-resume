/**
 * Simple logging utility with environment-aware log levels.
 *
 * In production, only warnings and errors are logged.
 * In development, all log levels are available.
 */

const isDev = process.env.NODE_ENV !== "production";

export const logger = {
	/**
	 * Log informational messages. Only shown in development.
	 */
	info: (msg: string, ...args: unknown[]) => isDev && console.log(msg, ...args),

	/**
	 * Log warning messages. Shown in all environments.
	 */
	warn: (msg: string, ...args: unknown[]) => console.warn(msg, ...args),

	/**
	 * Log error messages. Shown in all environments.
	 */
	error: (msg: string, ...args: unknown[]) => console.error(msg, ...args),

	/**
	 * Log debug messages. Only shown in development.
	 */
	debug: (msg: string, ...args: unknown[]) => isDev && console.debug(msg, ...args),
};
