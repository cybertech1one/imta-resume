import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export function LoadingScreen() {
	return (
		<div className="fixed inset-0 z-50 flex h-svh w-svw flex-col items-center justify-center gap-6 bg-background">
			{/* Animated logo placeholder */}
			<div className="relative">
				<Skeleton className="size-16 rounded-xl" />
				<div className="absolute inset-0 flex items-center justify-center">
					<Spinner className="size-6" />
				</div>
			</div>

			{/* Animated loading bar */}
			<div className="w-48 overflow-hidden rounded-full bg-muted">
				<div className="h-1 w-1/3 animate-[loading-bar_1.5s_ease-in-out_infinite] rounded-full bg-primary" />
			</div>
		</div>
	);
}

// Minimal loading screen for inline use (non-blocking)
export function InlineLoadingScreen() {
	return (
		<div className="flex items-center justify-center gap-x-3 py-12">
			<Spinner className="size-5" />
			<Skeleton className="h-4 w-24" />
		</div>
	);
}
