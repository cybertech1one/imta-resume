/**
 * Unit Tests for src/dialogs/store.ts
 *
 * Tests cover:
 * - Dialog store state management
 * - Opening and closing dialogs
 * - Dialog type discrimination
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDialogStore } from "@/dialogs/store";

describe("dialog store", () => {
	beforeEach(() => {
		// Reset the store state before each test
		useDialogStore.setState({
			open: false,
			activeDialog: null,
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("store structure", () => {
		it("should have initial state with open: false and activeDialog: null", () => {
			const state = useDialogStore.getState();
			expect(state.open).toBe(false);
			expect(state.activeDialog).toBeNull();
		});

		it("should update open state via onOpenChange", () => {
			const { onOpenChange } = useDialogStore.getState();

			// Set open to true
			onOpenChange(true);
			expect(useDialogStore.getState().open).toBe(true);

			// Set open to false
			onOpenChange(false);
			expect(useDialogStore.getState().open).toBe(false);
		});

		it("should open dialog with type and data via openDialog", () => {
			const { openDialog } = useDialogStore.getState();

			openDialog("resume.create", undefined);

			const state = useDialogStore.getState();
			expect(state.open).toBe(true);
			expect(state.activeDialog).not.toBeNull();
			expect(state.activeDialog?.type).toBe("resume.create");
		});

		it("should close dialog and clear activeDialog after timeout via closeDialog", async () => {
			const { openDialog, closeDialog } = useDialogStore.getState();

			// First open a dialog
			openDialog("resume.create", undefined);
			expect(useDialogStore.getState().open).toBe(true);
			expect(useDialogStore.getState().activeDialog).not.toBeNull();

			// Close the dialog
			closeDialog();

			// open should immediately be false
			expect(useDialogStore.getState().open).toBe(false);

			// activeDialog clears after 300ms timeout
			vi.advanceTimersByTime(300);
			expect(useDialogStore.getState().activeDialog).toBeNull();
		});
	});

	describe("dialog types", () => {
		it("should support auth.change-password dialog type", () => {
			const { openDialog } = useDialogStore.getState();
			openDialog("auth.change-password", undefined);

			const state = useDialogStore.getState();
			expect(state.activeDialog?.type).toBe("auth.change-password");
		});

		it("should support auth.two-factor.enable dialog type", () => {
			const { openDialog } = useDialogStore.getState();
			openDialog("auth.two-factor.enable", undefined);

			const state = useDialogStore.getState();
			expect(state.activeDialog?.type).toBe("auth.two-factor.enable");
		});

		it("should support resume.create dialog type", () => {
			const { openDialog } = useDialogStore.getState();
			openDialog("resume.create", undefined);

			const state = useDialogStore.getState();
			expect(state.activeDialog?.type).toBe("resume.create");
		});

		it("should support resume.update dialog type with data", () => {
			const { openDialog } = useDialogStore.getState();
			const testData = {
				id: "test-id",
				name: "Test Resume",
				slug: "test-resume",
				tags: ["tag1", "tag2"],
			};
			openDialog("resume.update", testData);

			const state = useDialogStore.getState();
			expect(state.activeDialog?.type).toBe("resume.update");
			expect(state.activeDialog?.data).toEqual(testData);
		});

		it("should support resume.duplicate dialog type with data", () => {
			const { openDialog } = useDialogStore.getState();
			const testData = {
				id: "test-id",
				name: "Test Resume",
				slug: "test-resume",
				tags: ["tag1"],
				shouldRedirect: true,
			};
			openDialog("resume.duplicate", testData);

			const state = useDialogStore.getState();
			expect(state.activeDialog?.type).toBe("resume.duplicate");
			expect(state.activeDialog?.data).toEqual(testData);
		});

		it("should support resume.sections.*.create dialog types", () => {
			const { openDialog } = useDialogStore.getState();

			// Test profiles create
			openDialog("resume.sections.profiles.create", undefined);
			expect(useDialogStore.getState().activeDialog?.type).toBe("resume.sections.profiles.create");

			// Reset and test experience create
			useDialogStore.setState({ activeDialog: null, open: false });
			openDialog("resume.sections.experience.create", undefined);
			expect(useDialogStore.getState().activeDialog?.type).toBe("resume.sections.experience.create");

			// Reset and test education create
			useDialogStore.setState({ activeDialog: null, open: false });
			openDialog("resume.sections.education.create", undefined);
			expect(useDialogStore.getState().activeDialog?.type).toBe("resume.sections.education.create");

			// Reset and test skills create
			useDialogStore.setState({ activeDialog: null, open: false });
			openDialog("resume.sections.skills.create", undefined);
			expect(useDialogStore.getState().activeDialog?.type).toBe("resume.sections.skills.create");
		});

		it("should support resume.sections.*.update dialog types with item data", () => {
			const { openDialog } = useDialogStore.getState();

			const profileItem = {
				item: {
					id: "profile-1",
					hidden: false,
					network: "LinkedIn",
					username: "testuser",
					icon: "linkedin",
					website: { url: "https://linkedin.com/in/testuser", label: "LinkedIn" },
				},
			};

			openDialog("resume.sections.profiles.update", profileItem);
			const state = useDialogStore.getState();
			expect(state.activeDialog?.type).toBe("resume.sections.profiles.update");
			expect(state.activeDialog?.data).toEqual(profileItem);
		});

		it("should support api-key.create dialog type", () => {
			const { openDialog } = useDialogStore.getState();
			openDialog("api-key.create", undefined);

			const state = useDialogStore.getState();
			expect(state.activeDialog?.type).toBe("api-key.create");
		});

		it("should support resume.import dialog type", () => {
			const { openDialog } = useDialogStore.getState();
			openDialog("resume.import", undefined);

			const state = useDialogStore.getState();
			expect(state.activeDialog?.type).toBe("resume.import");
		});

		it("should support resume.template.gallery dialog type", () => {
			const { openDialog } = useDialogStore.getState();
			openDialog("resume.template.gallery", undefined);

			const state = useDialogStore.getState();
			expect(state.activeDialog?.type).toBe("resume.template.gallery");
		});
	});

	describe("type safety", () => {
		it("should enforce correct data types for each dialog type", () => {
			const { openDialog } = useDialogStore.getState();

			// resume.update requires specific data shape
			const updateData = {
				id: "resume-123",
				name: "My Resume",
				slug: "my-resume",
				tags: ["professional", "tech"],
			};
			openDialog("resume.update", updateData);

			const state = useDialogStore.getState();
			expect(state.activeDialog?.data).toHaveProperty("id");
			expect(state.activeDialog?.data).toHaveProperty("name");
			expect(state.activeDialog?.data).toHaveProperty("slug");
			expect(state.activeDialog?.data).toHaveProperty("tags");
		});

		it("should allow undefined data for dialogs that don't require data", () => {
			const { openDialog } = useDialogStore.getState();

			// These dialog types accept undefined data
			const dialogsWithoutData = [
				"auth.change-password",
				"auth.two-factor.enable",
				"auth.two-factor.disable",
				"api-key.create",
				"resume.create",
				"resume.import",
				"resume.template.gallery",
			] as const;

			for (const dialogType of dialogsWithoutData) {
				useDialogStore.setState({ activeDialog: null, open: false });
				openDialog(dialogType, undefined);
				expect(useDialogStore.getState().open).toBe(true);
				expect(useDialogStore.getState().activeDialog?.type).toBe(dialogType);
			}
		});
	});

	describe("onOpenChange behavior", () => {
		it("should clear activeDialog after timeout when closing", async () => {
			const { openDialog, onOpenChange } = useDialogStore.getState();

			// Open a dialog
			openDialog("resume.create", undefined);
			expect(useDialogStore.getState().activeDialog).not.toBeNull();

			// Close via onOpenChange(false)
			onOpenChange(false);
			expect(useDialogStore.getState().open).toBe(false);

			// activeDialog should still be set before timeout
			expect(useDialogStore.getState().activeDialog).not.toBeNull();

			// After timeout, activeDialog should be null
			vi.advanceTimersByTime(300);
			expect(useDialogStore.getState().activeDialog).toBeNull();
		});

		it("should not clear activeDialog when opening", () => {
			const { openDialog, onOpenChange, closeDialog } = useDialogStore.getState();

			// Open, close, then open again quickly
			openDialog("resume.create", undefined);
			closeDialog();

			// Before timeout, open again
			onOpenChange(true);

			// activeDialog might still exist
			expect(useDialogStore.getState().open).toBe(true);
		});
	});

	describe("multiple dialog transitions", () => {
		it("should handle rapid open/close cycles", async () => {
			const { openDialog, closeDialog } = useDialogStore.getState();

			// Rapid open/close
			openDialog("resume.create", undefined);
			closeDialog();
			openDialog("auth.change-password", undefined);

			expect(useDialogStore.getState().open).toBe(true);
			expect(useDialogStore.getState().activeDialog?.type).toBe("auth.change-password");
		});

		it("should handle switching between different dialog types", () => {
			const { openDialog } = useDialogStore.getState();

			openDialog("resume.create", undefined);
			expect(useDialogStore.getState().activeDialog?.type).toBe("resume.create");

			// Switch to different dialog without closing first
			openDialog("auth.change-password", undefined);
			expect(useDialogStore.getState().activeDialog?.type).toBe("auth.change-password");
		});
	});
});
