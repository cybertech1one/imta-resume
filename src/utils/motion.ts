import { useSyncExternalStore } from "react";

/**
 * Subscribe to the prefers-reduced-motion media query.
 * Returns true if the user prefers reduced motion.
 *
 * This hook is SSR-safe and updates when the user changes their system preference.
 */
function subscribeToPrefersReducedMotion(callback: () => void): () => void {
	if (typeof window === "undefined") return () => {};

	const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

	// Modern API
	if (mediaQuery.addEventListener) {
		mediaQuery.addEventListener("change", callback);
		return () => mediaQuery.removeEventListener("change", callback);
	}

	// Legacy API for older Safari
	mediaQuery.addListener(callback);
	return () => mediaQuery.removeListener(callback);
}

function getSnapshot(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot(): boolean {
	// Default to false on server - animations will show
	// Consider this a graceful degradation
	return false;
}

/**
 * React hook that returns true if the user prefers reduced motion.
 * Uses the prefers-reduced-motion media query and updates reactively.
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = usePrefersReducedMotion();
 *
 * return (
 *   <motion.div
 *     animate={prefersReducedMotion ? {} : { scale: 1.1 }}
 *     transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
 *   >
 *     Content
 *   </motion.div>
 * );
 * ```
 */
export function usePrefersReducedMotion(): boolean {
	return useSyncExternalStore(subscribeToPrefersReducedMotion, getSnapshot, getServerSnapshot);
}
