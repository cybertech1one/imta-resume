import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { KeyboardShortcutsModal } from "./keyboard-shortcuts-modal";

// Context for keyboard shortcuts
interface KeyboardShortcutsContextValue {
	openShortcutsModal: () => void;
	closeShortcutsModal: () => void;
	isShortcutsModalOpen: boolean;
	isShortcutEnabled: (shortcutId: string) => boolean;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | null>(null);

export function useKeyboardShortcuts() {
	const context = useContext(KeyboardShortcutsContext);
	if (!context) {
		throw new Error("useKeyboardShortcuts must be used within KeyboardShortcutsProvider");
	}
	return context;
}

interface KeyboardShortcutsProviderProps {
	children: ReactNode;
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();

	// Fetch user's shortcuts
	const { data: shortcuts } = useQuery({
		...orpc.shortcuts.getAll.queryOptions({ input: {} }),
		staleTime: 5 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Create a map of enabled shortcuts
	const enabledShortcuts = useMemo(() => {
		const map = new Map<string, boolean>();
		if (shortcuts) {
			for (const shortcut of shortcuts) {
				map.set(shortcut.id, shortcut.enabled);
			}
		}
		return map;
	}, [shortcuts]);

	// Check if a shortcut is enabled
	const isShortcutEnabled = useCallback(
		(shortcutId: string): boolean => {
			return enabledShortcuts.get(shortcutId) ?? true;
		},
		[enabledShortcuts],
	);

	// Modal controls
	const openShortcutsModal = useCallback(() => setIsModalOpen(true), []);
	const closeShortcutsModal = useCallback(() => setIsModalOpen(false), []);

	// Helper to check if we're in an input field
	const isInInputField = useCallback((e: KeyboardEvent): boolean => {
		const target = e.target as HTMLElement;
		return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
	}, []);

	// Register shortcuts modal hotkeys
	useHotkeys(
		["?", "shift+/"],
		(e) => {
			if (isInInputField(e)) return;
			if (!isShortcutEnabled("shortcuts_help")) return;
			e.preventDefault();
			setIsModalOpen(true);
		},
		{ preventDefault: false },
	);

	useHotkeys(
		["mod+/"],
		(e) => {
			if (!isShortcutEnabled("shortcuts_help_alt")) return;
			e.preventDefault();
			setIsModalOpen(true);
		},
		{ preventDefault: true, enableOnFormTags: true },
	);

	// Navigation shortcuts (g + key sequences)
	// These use a two-key sequence: first 'g' then another key
	const [waitingForSecondKey, setWaitingForSecondKey] = useState<"g" | "n" | null>(null);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Don't handle shortcuts in input fields
			const target = e.target as HTMLElement;
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
				return;
			}

			// Ignore if modifier keys are pressed (except for shift which might be needed)
			if (e.ctrlKey || e.metaKey || e.altKey) {
				setWaitingForSecondKey(null);
				return;
			}

			const key = e.key.toLowerCase();

			// First key in sequence
			if (key === "g" && !waitingForSecondKey) {
				setWaitingForSecondKey("g");
				// Reset after timeout
				setTimeout(() => setWaitingForSecondKey(null), 1000);
				return;
			}

			if (key === "n" && !waitingForSecondKey) {
				setWaitingForSecondKey("n");
				setTimeout(() => setWaitingForSecondKey(null), 1000);
				return;
			}

			// Second key - navigation
			if (waitingForSecondKey === "g") {
				setWaitingForSecondKey(null);
				e.preventDefault();

				switch (key) {
					case "d":
						if (isShortcutEnabled("go_dashboard")) {
							navigate({ to: "/dashboard" });
						}
						break;
					case "r":
						if (isShortcutEnabled("go_resumes")) {
							navigate({ to: "/dashboard/resumes" });
						}
						break;
					case "j":
						if (isShortcutEnabled("go_jobs")) {
							navigate({ to: "/dashboard/jobs" });
						}
						break;
					case "i":
						if (isShortcutEnabled("go_interview")) {
							navigate({ to: "/dashboard/interview" });
						}
						break;
					case "c":
						if (isShortcutEnabled("go_career")) {
							navigate({ to: "/dashboard/career" });
						}
						break;
					case "a":
						if (isShortcutEnabled("go_analytics")) {
							navigate({ to: "/dashboard/analytics" });
						}
						break;
					case "s":
						if (isShortcutEnabled("go_settings")) {
							navigate({ to: "/dashboard/settings/profile" });
						}
						break;
					case "h":
						if (isShortcutEnabled("go_help")) {
							navigate({ to: "/dashboard/help" });
						}
						break;
				}
				return;
			}

			// Second key - new actions
			if (waitingForSecondKey === "n") {
				setWaitingForSecondKey(null);
				e.preventDefault();

				switch (key) {
					case "r":
						if (isShortcutEnabled("new_resume")) {
							// Navigate to resumes page - the create action can be triggered there
							navigate({ to: "/dashboard/resumes" });
						}
						break;
					case "j":
						if (isShortcutEnabled("new_job")) {
							navigate({ to: "/dashboard/jobs" });
						}
						break;
					case "c":
						if (isShortcutEnabled("new_cover_letter")) {
							navigate({ to: "/dashboard/tools/cover-letter" });
						}
						break;
				}
				return;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [waitingForSecondKey, isShortcutEnabled, navigate]);

	// Toggle sidebar shortcut
	useHotkeys(
		["mod+b"],
		(e) => {
			if (!isShortcutEnabled("toggle_sidebar")) return;
			e.preventDefault();
			// Find and click the sidebar toggle button
			const sidebarTrigger = document.querySelector('[data-sidebar="trigger"]');
			if (sidebarTrigger instanceof HTMLElement) {
				sidebarTrigger.click();
			}
		},
		{ preventDefault: true, enableOnFormTags: false },
	);

	const contextValue = useMemo<KeyboardShortcutsContextValue>(
		() => ({
			openShortcutsModal,
			closeShortcutsModal,
			isShortcutsModalOpen: isModalOpen,
			isShortcutEnabled,
		}),
		[openShortcutsModal, closeShortcutsModal, isModalOpen, isShortcutEnabled],
	);

	return (
		<KeyboardShortcutsContext.Provider value={contextValue}>
			{children}
			<KeyboardShortcutsModal open={isModalOpen} onOpenChange={setIsModalOpen} />
		</KeyboardShortcutsContext.Provider>
	);
}
