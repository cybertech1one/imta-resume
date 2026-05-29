import { t } from "@lingui/core/macro";
import { debounce } from "es-toolkit";
import isDeepEqual from "fast-deep-equal";
import type { WritableDraft } from "immer";
import { current } from "immer";
import { toast } from "sonner";
import type { TemporalState } from "zundo";
import { temporal } from "zundo";
import { immer } from "zustand/middleware/immer";
import { create } from "zustand/react";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { orpc, type RouterOutput } from "@/integrations/orpc/client";
import type { ResumeData } from "@/schema/resume/data";

type Resume = Pick<RouterOutput["resume"]["getByIdForPrinter"], "id" | "name" | "slug" | "tags" | "data" | "isLocked">;

type ResumeStoreState = {
	resume: Resume;
	isReady: boolean;
};

type ResumeStoreActions = {
	initialize: (resume: Resume | null) => void;
	updateResumeData: (fn: (draft: WritableDraft<ResumeData>) => void) => void;
};

type ResumeStore = ResumeStoreState & ResumeStoreActions;

// Sync controller - manages abort signals for debounced resume updates
let syncController = new AbortController();

const _syncResume = (resume: Resume) => {
	// Use a fresh signal for each actual API call
	orpc.resume.update.call({ id: resume.id, data: resume.data }, { signal: syncController.signal });
};

// Create debounced sync function
let syncResume = debounce(_syncResume, 500, { signal: syncController.signal });

/**
 * Cancels any pending sync operations and resets the sync controller.
 * Call this when switching resumes or cleaning up to prevent memory leaks
 * and stale requests.
 */
export function cancelPendingSync() {
	syncController.abort();
	syncController = new AbortController();
	syncResume = debounce(_syncResume, 500, { signal: syncController.signal });
}

let errorToastId: string | number | undefined;

type PartializedState = { resume: Resume | null };

export const useResumeStore = create<ResumeStore>()(
	temporal(
		immer((set) => ({
			resume: null as unknown as Resume,
			isReady: false,

			initialize: (resume) => {
				// Cancel any pending sync from the previous resume
				cancelPendingSync();
				set((state) => {
					state.resume = resume as Resume;
					state.isReady = resume !== null;
					useResumeStore.temporal.getState().clear();
				});
			},

			updateResumeData: (fn) => {
				set((state) => {
					if (!state.resume) return state;

					if (state.resume.isLocked) {
						errorToastId = toast.error(t`This resume is locked and cannot be updated.`, { id: errorToastId });
						return state;
					}

					fn(state.resume.data);
					syncResume(current(state.resume));
				});
			},
		})),
		{
			partialize: (state) => ({ resume: state.resume }),
			equality: (pastState, currentState) => isDeepEqual(pastState, currentState),
			limit: 100,
		},
	),
);

export function useTemporalStore<T>(selector: (state: TemporalState<PartializedState>) => T): T {
	return useStoreWithEqualityFn(useResumeStore.temporal, selector);
}
