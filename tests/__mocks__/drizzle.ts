/**
 * Mock for Drizzle ORM database client
 *
 * Use this mock for unit tests that don't need a real database.
 * For integration tests, use testcontainers or a test database.
 */

import { vi } from "vitest";

// Mock query builder
export const createMockQueryBuilder = () => ({
	select: vi.fn().mockReturnThis(),
	from: vi.fn().mockReturnThis(),
	where: vi.fn().mockReturnThis(),
	orderBy: vi.fn().mockReturnThis(),
	limit: vi.fn().mockReturnThis(),
	offset: vi.fn().mockReturnThis(),
	innerJoin: vi.fn().mockReturnThis(),
	leftJoin: vi.fn().mockReturnThis(),
	rightJoin: vi.fn().mockReturnThis(),
	fullJoin: vi.fn().mockReturnThis(),
	groupBy: vi.fn().mockReturnThis(),
	having: vi.fn().mockReturnThis(),
	union: vi.fn().mockReturnThis(),
	unionAll: vi.fn().mockReturnThis(),
	returning: vi.fn().mockReturnThis(),
});

// Mock database client
export const mockDb = {
	...createMockQueryBuilder(),
	insert: vi.fn().mockReturnThis(),
	values: vi.fn().mockReturnThis(),
	update: vi.fn().mockReturnThis(),
	set: vi.fn().mockReturnThis(),
	delete: vi.fn().mockReturnThis(),
	onConflictDoUpdate: vi.fn().mockReturnThis(),
	onConflictDoNothing: vi.fn().mockReturnThis(),
	execute: vi.fn().mockResolvedValue([]),
	transaction: vi.fn((callback) => callback(mockDb)),
};

// Helper to set mock return values
export const setMockSelectResult = <T>(result: T[]) => {
	mockDb.execute.mockResolvedValueOnce(result);
};

export const setMockInsertResult = <T>(result: T) => {
	mockDb.returning.mockResolvedValueOnce([result]);
};

// Reset all mocks
export const resetMockDb = () => {
	vi.clearAllMocks();
};

// Export the mock
export const db = mockDb;
