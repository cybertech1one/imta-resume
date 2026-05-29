import { t } from "@lingui/core/macro";
import { createFileRoute, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorComponent } from "@/components/error-component";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { generateMetaTags } from "@/utils/seo";
import { getDashboardSidebarServerFn, setDashboardSidebarServerFn } from "./-components/functions";
import { DashboardSidebar } from "./-components/sidebar";

/**
 * Dashboard-specific pending component. Shows the sidebar layout with a skeleton
 * content area so users always see the familiar dashboard chrome during navigation.
 * This is far better than the full-screen LoadingScreen that hides everything.
 */
function DashboardPending() {
	return (
		<div className="space-y-6 p-2">
			{/* Header skeleton */}
			<div className="space-y-2">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-72" />
			</div>

			{/* Stat cards skeleton */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="rounded-xl border bg-card p-5">
						<div className="flex items-center gap-3">
							<Skeleton className="size-10 rounded-lg" />
							<div className="space-y-2">
								<Skeleton className="h-6 w-16" />
								<Skeleton className="h-3 w-24" />
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Content cards skeleton */}
			<div className="grid gap-6 lg:grid-cols-2">
				{Array.from({ length: 2 }).map((_, i) => (
					<div key={i} className="rounded-xl border bg-card p-5">
						<Skeleton className="mb-4 h-5 w-32" />
						<div className="space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-5/6" />
							<Skeleton className="h-4 w-4/6" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	pendingComponent: DashboardPending,
	errorComponent: ErrorComponent,
	beforeLoad: async ({ context }) => {
		if (!context.session) throw redirect({ to: "/auth/login", replace: true });
		return { session: context.session };
	},
	loader: async () => {
		const sidebarState = await getDashboardSidebarServerFn();
		return { sidebarState };
	},
	head: () => ({
		meta: generateMetaTags({
			title: t`Dashboard - IMTA Resume`,
			description: t`Manage your resumes, track your progress, and access career tools.`,
			noIndex: true, // Private dashboard pages should not be indexed
		}),
	}),
});

function RouteComponent() {
	const router = useRouter();
	const { sidebarState } = Route.useLoaderData();

	const handleSidebarOpenChange = (open: boolean) => {
		setDashboardSidebarServerFn({ data: open }).then(() => {
			router.invalidate();
		});
	};

	return (
		<KeyboardShortcutsProvider>
			<SidebarProvider open={sidebarState} onOpenChange={handleSidebarOpenChange}>
				<DashboardSidebar />

				<main className="@container flex-1 p-4 md:ps-2">
					<ErrorBoundary section="Dashboard">
						<Outlet />
					</ErrorBoundary>
				</main>
			</SidebarProvider>
		</KeyboardShortcutsProvider>
	);
}
