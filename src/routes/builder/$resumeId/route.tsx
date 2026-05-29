import { Trans } from "@lingui/react/macro";
import { FileXIcon, HouseIcon } from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import type React from "react";
import { useEffect } from "react";
import { type Layout, usePanelRef } from "react-resizable-panels";
import { useDebounceCallback } from "usehooks-ts";
import z from "zod";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { useCSSVariables } from "@/components/resume/hooks/use-css-variables";
import { useResumeStore } from "@/components/resume/store/resume";
import { Button } from "@/components/ui/button";
import { ResizableGroup, ResizablePanel, ResizableSeparator } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { orpc } from "@/integrations/orpc/client";
import { generateMetaTags } from "@/utils/seo";
import { BuilderHeader } from "./-components/header";
import { BuilderSidebarLeft } from "./-sidebar/left";
import { BuilderSidebarRight } from "./-sidebar/right";
import { useBuilderSidebar, useBuilderSidebarStore } from "./-store/sidebar";

/**
 * Builder-specific error component that shows a user-friendly message
 * when a resume is not found or the user doesn't have access.
 * Replaces the generic ErrorComponent to avoid showing raw 500 errors.
 */
function BuilderErrorComponent({ error }: { error: Error; reset: () => void }) {
	const isNotFound = error.message?.includes("NOT_FOUND") || error.message?.includes("not found");

	return (
		<div className="flex min-h-svh flex-col items-center justify-center bg-background p-8">
			<FileXIcon className="size-16 text-muted-foreground" />
			<h1 className="mt-6 font-semibold text-2xl">
				{isNotFound ? <Trans>Resume not found</Trans> : <Trans>Unable to load resume</Trans>}
			</h1>
			<p className="mt-2 max-w-md text-center text-muted-foreground">
				{isNotFound ? (
					<Trans>This resume does not exist or you do not have permission to view it.</Trans>
				) : (
					<Trans>An error occurred while loading this resume. Please try again or return to your dashboard.</Trans>
				)}
			</p>
			<Button asChild className="mt-6">
				<Link to="/dashboard/resumes">
					<HouseIcon />
					<Trans>Back to Dashboard</Trans>
				</Link>
			</Button>
		</div>
	);
}

export const Route = createFileRoute("/builder/$resumeId")({
	component: RouteComponent,
	errorComponent: BuilderErrorComponent,
	beforeLoad: async ({ context }) => {
		if (!context.session) throw redirect({ to: "/auth/login", replace: true });
		return { session: context.session };
	},
	loader: async ({ params, context }) => {
		// Fetch layout and resume; catch access errors to redirect instead of returning 500.
		const layout = await getBuilderLayoutServerFn();

		let resumeName: string;
		try {
			const resume = await context.queryClient.ensureQueryData(
				orpc.resume.getById.queryOptions({ input: { id: params.resumeId } }),
			);
			resumeName = resume.name;
		} catch (err) {
			// ORPC throws ORPCError("NOT_FOUND") when the resume does not exist or
			// belongs to another user. Re-throw as a redirect so TanStack Start
			// returns a 3xx (not 500) for these expected access-denied cases.
			const message = err instanceof Error ? err.message : String(err);
			const isAccessError =
				message.includes("NOT_FOUND") || message.includes("FORBIDDEN") || message.includes("not found");
			if (isAccessError) {
				throw redirect({ to: "/dashboard/resumes", replace: true });
			}
			// Genuine server errors bubble up to BuilderErrorComponent (HTTP 500 is correct there).
			throw err;
		}

		return { layout, name: resumeName };
	},
	head: ({ loaderData }) => ({
		meta: loaderData
			? generateMetaTags({
					title: `Editing: ${loaderData.name} - IMTA Resume`,
					description: "Edit and customize your professional resume with the IMTA Resume builder.",
					noIndex: true, // Builder pages should not be indexed
				})
			: undefined,
	}),
});

function RouteComponent() {
	const { layout: initialLayout } = Route.useLoaderData();

	const { resumeId } = Route.useParams();
	const { data: resume } = useSuspenseQuery(orpc.resume.getById.queryOptions({ input: { id: resumeId } }));

	const style = useCSSVariables(resume.data);
	const isReady = useResumeStore((state) => state.isReady);
	const initialize = useResumeStore((state) => state.initialize);

	useEffect(() => {
		initialize(resume);
		return () => initialize(null);
	}, [resume, initialize]);

	if (!isReady) return <LoadingScreen />;

	return <BuilderLayout style={style} initialLayout={initialLayout} />;
}

type BuilderLayoutProps = React.ComponentProps<"div"> & {
	initialLayout: Layout;
};

function BuilderLayout({ initialLayout, ...props }: BuilderLayoutProps) {
	const isMobile = useIsMobile();

	const leftSidebarRef = usePanelRef();
	const rightSidebarRef = usePanelRef();

	const setLeftSidebar = useBuilderSidebarStore((state) => state.setLeftSidebar);
	const setRightSidebar = useBuilderSidebarStore((state) => state.setRightSidebar);

	const { maxSidebarSize, collapsedSidebarSize } = useBuilderSidebar((state) => ({
		maxSidebarSize: state.maxSidebarSize,
		collapsedSidebarSize: state.collapsedSidebarSize,
	}));

	const onLayoutChange = useDebounceCallback((layout: Layout) => {
		setBuilderLayoutServerFn({ data: layout });
	}, 200);

	useEffect(() => {
		if (!leftSidebarRef || !rightSidebarRef) return;

		setLeftSidebar(leftSidebarRef);
		setRightSidebar(rightSidebarRef);
	}, [leftSidebarRef, rightSidebarRef, setLeftSidebar, setRightSidebar]);

	const leftSidebarSize = isMobile ? 0 : initialLayout.left;
	const rightSidebarSize = isMobile ? 0 : initialLayout.right;
	const artboardSize = isMobile ? 100 : initialLayout.artboard;

	return (
		<div className="flex h-svh flex-col" {...props}>
			<BuilderHeader />

			<main className="mt-14 flex-1">
				<ErrorBoundary section="Resume Builder">
					<ResizableGroup orientation="horizontal" onLayoutChange={onLayoutChange} className="h-full">
						<ResizablePanel
							collapsible
							id="left"
							panelRef={leftSidebarRef}
							maxSize={maxSidebarSize}
							minSize={collapsedSidebarSize * 2}
							collapsedSize={collapsedSidebarSize}
							defaultSize={leftSidebarSize}
							className="z-20 h-[calc(100svh-3.5rem)]"
						>
							<ErrorBoundary section="Left Sidebar">
								<BuilderSidebarLeft />
							</ErrorBoundary>
						</ResizablePanel>
						<ResizableSeparator withHandle className="z-20 border-r" />
						<ResizablePanel id="artboard" defaultSize={artboardSize} className="h-[calc(100svh-3.5rem)]">
							<ErrorBoundary section="Resume Preview">
								<Outlet />
							</ErrorBoundary>
						</ResizablePanel>
						<ResizableSeparator withHandle className="z-20 border-l" />
						<ResizablePanel
							collapsible
							id="right"
							panelRef={rightSidebarRef}
							maxSize={maxSidebarSize}
							minSize={collapsedSidebarSize * 2}
							collapsedSize={collapsedSidebarSize}
							defaultSize={rightSidebarSize}
							className="z-20 h-[calc(100svh-3.5rem)]"
						>
							<ErrorBoundary section="Right Sidebar">
								<BuilderSidebarRight />
							</ErrorBoundary>
						</ResizablePanel>
					</ResizableGroup>
				</ErrorBoundary>
			</main>
		</div>
	);
}

const defaultLayout = { left: 30, artboard: 40, right: 30 };
const BUILDER_LAYOUT_COOKIE_NAME = "builder_layout";

const layoutSchema = z.record(z.string(), z.number()).catch(defaultLayout);

const setBuilderLayoutServerFn = createServerFn({ method: "POST" })
	.inputValidator(layoutSchema)
	.handler(async ({ data }) => {
		setCookie(BUILDER_LAYOUT_COOKIE_NAME, JSON.stringify(data));
	});

const getBuilderLayoutServerFn = createServerFn({ method: "GET" }).handler(async () => {
	const layout = getCookie(BUILDER_LAYOUT_COOKIE_NAME);
	if (!layout) return defaultLayout;
	return layoutSchema.parse(JSON.parse(layout));
});
