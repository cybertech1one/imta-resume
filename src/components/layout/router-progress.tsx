import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

/**
 * RouterProgress - A thin animated progress bar that appears at the top of the
 * viewport during route transitions. Provides immediate visual feedback so
 * users on slow connections know the app is working.
 *
 * The bar uses a three-phase animation:
 *   1. Quick jump to ~30% on navigation start (instant perceived response)
 *   2. Slow crawl toward 90% while data loads
 *   3. Fast slide to 100% + fade out on completion
 */
export function RouterProgress() {
	const isNavigating = useRouterState({ select: (s) => s.status === "pending" });
	const [progress, setProgress] = useState(0);
	const [visible, setVisible] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (isNavigating) {
			// Phase 1: quick jump
			setVisible(true);
			setProgress(30);

			// Phase 2: slow crawl
			intervalRef.current = setInterval(() => {
				setProgress((prev) => {
					if (prev >= 90) return prev;
					// Decelerate as we approach 90
					const increment = Math.max(0.5, (90 - prev) * 0.04);
					return Math.min(prev + increment, 90);
				});
			}, 200);
		} else if (visible) {
			// Phase 3: complete
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			setProgress(100);

			// Hide after animation completes
			timeoutRef.current = setTimeout(() => {
				setVisible(false);
				setProgress(0);
			}, 300);
		}

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, [isNavigating, visible]);

	if (!visible) return null;

	return (
		<div
			className="fixed top-0 right-0 left-0 z-[9999] h-0.5"
			role="progressbar"
			aria-valuenow={Math.round(progress)}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-label="Page loading"
		>
			<div
				className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 shadow-[0_0_8px_oklch(0.7_0.15_160)]"
				style={{
					width: `${progress}%`,
					transition: progress === 100 ? "width 200ms ease-out, opacity 200ms ease-out 100ms" : "width 400ms ease-out",
					opacity: progress === 100 ? 0 : 1,
				}}
			/>
		</div>
	);
}
