/**
 * Unit Tests for src/utils/error-tracking.ts
 *
 * Tests cover:
 * - captureException: Error capture with context
 * - captureMessage: Message capture with severity levels
 * - setUserContext: User context management
 * - addBreadcrumb: Breadcrumb trail for debugging
 * - getRecentErrors: Error buffer retrieval
 * - clearErrorBuffer: Error buffer clearing
 * - withErrorCapture: Async function wrapper
 * - createErrorScope: Scoped error capturer
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	addBreadcrumb,
	captureException,
	captureMessage,
	clearErrorBuffer,
	createErrorScope,
	getRecentErrors,
	setUserContext,
	withErrorCapture,
} from "@/utils/error-tracking";

describe("error-tracking utilities", () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;
	beforeEach(() => {
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(console, "debug").mockImplementation(() => {});
		clearErrorBuffer();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// ==========================================================================
	// captureException Tests
	// ==========================================================================
	describe("captureException", () => {
		it("should log error to console", () => {
			const error = new Error("Test error");
			captureException(error);

			expect(consoleErrorSpy).toHaveBeenCalledWith("[Error]", "Test error", "");
		});

		it("should log error with context", () => {
			const error = new Error("Test error");
			const context = { userId: "123", route: "/dashboard" };
			captureException(error, context);

			expect(consoleErrorSpy).toHaveBeenCalledWith("[Error]", "Test error", { context });
		});

		it("should add error to buffer", () => {
			const error = new Error("Buffered error");
			captureException(error);

			const recentErrors = getRecentErrors(1);
			expect(recentErrors.length).toBe(1);
			expect(recentErrors[0].message).toBe("Buffered error");
		});

		it("should capture error name", () => {
			const error = new TypeError("Type error");
			captureException(error);

			const recentErrors = getRecentErrors(1);
			expect(recentErrors[0].name).toBe("TypeError");
		});

		it("should capture error stack", () => {
			const error = new Error("Stack error");
			captureException(error);

			const recentErrors = getRecentErrors(1);
			expect(recentErrors[0].stack).toBeDefined();
		});

		it("should include timestamp", () => {
			const error = new Error("Timestamped error");
			captureException(error);

			const recentErrors = getRecentErrors(1);
			expect(recentErrors[0].timestamp).toBeDefined();
			expect(new Date(recentErrors[0].timestamp).getTime()).not.toBeNaN();
		});

		it("should set level to error", () => {
			const error = new Error("Level error");
			captureException(error);

			const recentErrors = getRecentErrors(1);
			expect(recentErrors[0].level).toBe("error");
		});
	});

	// ==========================================================================
	// captureMessage Tests
	// ==========================================================================
	describe("captureMessage", () => {
		it("should log info message to console", () => {
			captureMessage("Info message", "info");

			expect(consoleLogSpy).toHaveBeenCalledWith("[INFO]", "Info message", "");
		});

		it("should log warning message to console", () => {
			captureMessage("Warning message", "warning");

			expect(consoleWarnSpy).toHaveBeenCalledWith("[WARNING]", "Warning message", "");
		});

		it("should log error message to console", () => {
			captureMessage("Error message", "error");

			expect(consoleErrorSpy).toHaveBeenCalledWith("[ERROR]", "Error message", "");
		});

		it("should log fatal message to console error", () => {
			captureMessage("Fatal message", "fatal");

			expect(consoleErrorSpy).toHaveBeenCalledWith("[FATAL]", "Fatal message", "");
		});

		it("should add warning to buffer", () => {
			captureMessage("Warning", "warning");

			const recentErrors = getRecentErrors(1);
			expect(recentErrors.length).toBe(1);
			expect(recentErrors[0].level).toBe("warning");
		});

		it("should add error to buffer", () => {
			captureMessage("Error", "error");

			const recentErrors = getRecentErrors(1);
			expect(recentErrors.length).toBe(1);
			expect(recentErrors[0].level).toBe("error");
		});

		it("should NOT add info to buffer", () => {
			captureMessage("Info", "info");

			const recentErrors = getRecentErrors(1);
			expect(recentErrors.length).toBe(0);
		});

		it("should default to info level", () => {
			captureMessage("Default level");

			expect(consoleLogSpy).toHaveBeenCalledWith("[INFO]", "Default level", "");
		});

		it("should include context in log", () => {
			const context = { action: "test" };
			captureMessage("With context", "info", context);

			expect(consoleLogSpy).toHaveBeenCalledWith("[INFO]", "With context", context);
		});
	});

	// ==========================================================================
	// setUserContext Tests
	// Note: These functions only log in development mode, but our test env is 'test'
	// So we just verify they don't throw errors
	// ==========================================================================
	describe("setUserContext", () => {
		it("should not throw when setting user context", () => {
			expect(() => {
				setUserContext({ id: "user-123", email: "test@example.com" });
			}).not.toThrow();
		});

		it("should not throw when clearing user context", () => {
			expect(() => {
				setUserContext(null);
			}).not.toThrow();
		});
	});

	// ==========================================================================
	// addBreadcrumb Tests
	// Note: These functions only log in development mode, but our test env is 'test'
	// ==========================================================================
	describe("addBreadcrumb", () => {
		it("should not throw when adding breadcrumb", () => {
			expect(() => {
				addBreadcrumb("navigation", "User navigated to /dashboard");
			}).not.toThrow();
		});

		it("should not throw when adding breadcrumb with data", () => {
			const data = { from: "/home", to: "/dashboard" };
			expect(() => {
				addBreadcrumb("navigation", "Route change", data);
			}).not.toThrow();
		});
	});

	// ==========================================================================
	// getRecentErrors Tests
	// ==========================================================================
	describe("getRecentErrors", () => {
		it("should return empty array when no errors", () => {
			const errors = getRecentErrors();
			expect(errors).toEqual([]);
		});

		it("should return specified number of errors", () => {
			captureException(new Error("Error 1"));
			captureException(new Error("Error 2"));
			captureException(new Error("Error 3"));

			const errors = getRecentErrors(2);
			expect(errors.length).toBe(2);
		});

		it("should return most recent errors", () => {
			captureException(new Error("Old error"));
			captureException(new Error("New error"));

			const errors = getRecentErrors(1);
			expect(errors[0].message).toBe("New error");
		});

		it("should default to 10 errors", () => {
			for (let i = 0; i < 15; i++) {
				captureException(new Error(`Error ${i}`));
			}

			const errors = getRecentErrors();
			expect(errors.length).toBe(10);
		});
	});

	// ==========================================================================
	// clearErrorBuffer Tests
	// ==========================================================================
	describe("clearErrorBuffer", () => {
		it("should clear all errors from buffer", () => {
			captureException(new Error("Error 1"));
			captureException(new Error("Error 2"));

			clearErrorBuffer();

			const errors = getRecentErrors();
			expect(errors).toEqual([]);
		});
	});

	// ==========================================================================
	// withErrorCapture Tests
	// ==========================================================================
	describe("withErrorCapture", () => {
		it("should return wrapped function", () => {
			const fn = async () => "result";
			const wrapped = withErrorCapture(fn);

			expect(typeof wrapped).toBe("function");
		});

		it("should pass through successful result", async () => {
			const fn = async () => "success";
			const wrapped = withErrorCapture(fn);

			const result = await wrapped();
			expect(result).toBe("success");
		});

		it("should capture and rethrow errors", async () => {
			const error = new Error("Async error");
			const fn = async () => {
				throw error;
			};
			const wrapped = withErrorCapture(fn);

			await expect(wrapped()).rejects.toThrow("Async error");

			const errors = getRecentErrors(1);
			expect(errors.length).toBe(1);
			expect(errors[0].message).toBe("Async error");
		});

		it("should include context when capturing error", async () => {
			const fn = async () => {
				throw new Error("Context error");
			};
			const context = { componentName: "TestComponent" };
			const wrapped = withErrorCapture(fn, context);

			await expect(wrapped()).rejects.toThrow();

			const errors = getRecentErrors(1);
			expect(errors[0].context).toEqual(context);
		});

		it("should convert non-Error throws to Error", async () => {
			const fn = async () => {
				throw "string error";
			};
			const wrapped = withErrorCapture(fn);

			await expect(wrapped()).rejects.toThrow("string error");

			const errors = getRecentErrors(1);
			expect(errors[0].message).toBe("string error");
		});
	});

	// ==========================================================================
	// createErrorScope Tests
	// ==========================================================================
	describe("createErrorScope", () => {
		it("should create scope with default context", () => {
			const scope = createErrorScope({ componentName: "TestComponent" });

			expect(scope.captureException).toBeDefined();
			expect(scope.captureMessage).toBeDefined();
			expect(scope.addBreadcrumb).toBeDefined();
		});

		it("should merge default context with additional context", () => {
			const scope = createErrorScope({ componentName: "TestComponent" });
			scope.captureException(new Error("Scoped error"), { action: "save" });

			const errors = getRecentErrors(1);
			expect(errors[0].context).toEqual({
				componentName: "TestComponent",
				action: "save",
			});
		});

		it("should add context to messages", () => {
			const scope = createErrorScope({ route: "/test" });
			scope.captureMessage("Scoped message", "warning", { userId: "123" });

			const errors = getRecentErrors(1);
			expect(errors[0].context).toEqual({
				route: "/test",
				userId: "123",
			});
		});

		it("should not throw when adding context to breadcrumbs", () => {
			const scope = createErrorScope({ sessionId: "abc" });
			expect(() => {
				scope.addBreadcrumb("ui", "Button clicked", { buttonId: "submit" });
			}).not.toThrow();
		});
	});

	// ==========================================================================
	// Buffer Size Limit Tests
	// ==========================================================================
	describe("buffer size limit", () => {
		it("should limit buffer to 50 errors", () => {
			for (let i = 0; i < 60; i++) {
				captureException(new Error(`Error ${i}`));
			}

			// Get all errors (default is 10, but we need to check buffer size)
			const errors = getRecentErrors(100);
			expect(errors.length).toBeLessThanOrEqual(50);
		});

		it("should keep most recent errors when buffer overflows", () => {
			for (let i = 0; i < 60; i++) {
				captureException(new Error(`Error ${i}`));
			}

			const errors = getRecentErrors(1);
			expect(errors[0].message).toBe("Error 59");
		});
	});
});
