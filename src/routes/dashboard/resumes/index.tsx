import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
	FileTextIcon,
	GridFourIcon,
	ListIcon,
	ReadCvLogoIcon,
	SortAscendingIcon,
	TagIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams, useNavigate, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { zodValidator } from "@tanstack/zod-adapter";
import { motion } from "motion/react";
import { useCallback, useMemo } from "react";
import z from "zod";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { MultipleCombobox } from "@/components/ui/multiple-combobox";
import { Separator } from "@/components/ui/separator";
import { ResumeGridSkeleton, ResumeListSkeleton as ResumeListSkeletonComponent } from "@/components/ui/skeletons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";
import { GridView } from "./-components/grid-view";
import { ListView } from "./-components/list-view";

type SortOption = "lastUpdatedAt" | "createdAt" | "name";

const searchSchema = z.object({
	tags: z.array(z.string()).default([]),
	sort: z.enum(["lastUpdatedAt", "createdAt", "name"]).default("lastUpdatedAt"),
});

export const Route = createFileRoute("/dashboard/resumes/")({
	component: RouteComponent,
	errorComponent: ErrorComponent,
	validateSearch: zodValidator(searchSchema),
	search: {
		middlewares: [stripSearchParams({ tags: [], sort: "lastUpdatedAt" })],
	},
	loader: async () => {
		const view = await getViewServerFn();
		return { view };
	},
});

function RouteComponent() {
	const { data: session } = authClient.useSession();
	const router = useRouter();
	const { i18n } = useLingui();
	const { view } = Route.useLoaderData();
	const { tags, sort } = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	// Fetch tags with caching - tags don't change frequently
	const { data: allTags } = useQuery({
		...orpc.resume.tags.list.queryOptions(),
		staleTime: 10 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Fetch resumes with optimized caching
	const { data: resumes, isPending: isLoadingResumes } = useQuery({
		...orpc.resume.list.queryOptions({ input: { tags, sort } }),
		staleTime: 3 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		enabled: !!session?.user,
	});

	const tagOptions = useMemo(() => {
		if (!allTags) return [];
		return allTags.map((tag) => ({ value: tag, label: tag }));
	}, [allTags]);

	const sortOptions = useMemo(() => {
		return [
			{ value: "lastUpdatedAt", label: i18n.t("Last Updated") },
			{ value: "createdAt", label: i18n.t("Created") },
			{ value: "name", label: i18n.t("Name") },
		];
	}, [i18n]);

	// Memoize the view change handler to prevent unnecessary re-renders
	const onViewChange = useCallback(
		(value: string) => {
			setViewServerFn({ data: value as "grid" | "list" });
			router.invalidate();
		},
		[router],
	);

	const resumeCount = resumes?.length ?? 0;

	return (
		<motion.div
			className="space-y-5"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
			role="main"
			aria-label={t`Resume management`}
		>
			<DashboardHeader icon={ReadCvLogoIcon} title={t`Resumes`} />

			{/* Stats bar */}
			<div className="flex flex-wrap items-center gap-3">
				<motion.div
					className="glass-card flex items-center gap-2 rounded-lg px-4 py-2"
					initial={false}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.1 }}
				>
					<FileTextIcon
						className="size-4"
						weight="duotone"
						style={{ color: "var(--imta-emerald)" }}
						aria-hidden="true"
					/>
					<span className="font-semibold text-sm">{resumeCount}</span>
					<span className="text-muted-foreground text-xs">
						<Trans>Resumes</Trans>
					</span>
				</motion.div>

				{tags.length > 0 && (
					<motion.div
						className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5"
						initial={false}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.15 }}
					>
						<TagIcon className="size-3.5 text-primary" aria-hidden="true" />
						<span className="text-muted-foreground text-xs">
							<Trans>{tags.length} active filter(s)</Trans>
						</span>
					</motion.div>
				)}
			</div>

			<Separator className="section-divider" />

			{/* Toolbar */}
			<motion.div
				className="flex flex-wrap items-center gap-2 sm:gap-x-4"
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.12 }}
				role="toolbar"
				aria-label={t`Resume list controls`}
			>
				<Combobox
					value={sort}
					options={sortOptions}
					onValueChange={(value) => {
						if (!value) return;
						navigate({ search: { tags, sort: value as SortOption } });
					}}
					buttonProps={{
						title: t`Sort by`,
						variant: "ghost",
						children: (_, option) => (
							<>
								<SortAscendingIcon />
								{option?.label}
							</>
						),
					}}
				/>

				<MultipleCombobox
					value={tags}
					options={tagOptions}
					onValueChange={(value) => {
						navigate({ search: { tags: value, sort } });
					}}
					buttonProps={{
						variant: "ghost",
						title: t`Filter by`,
						className: cn({ hidden: tagOptions.length === 0 }),
						children: (_, options) => (
							<>
								<TagIcon />
								{options.map((option) => (
									<Badge key={option.value} variant="outline">
										{option.label}
									</Badge>
								))}
							</>
						),
					}}
				/>

				<Tabs className="ltr:ms-auto rtl:me-auto" value={view} onValueChange={onViewChange}>
					<TabsList>
						<TabsTrigger value="grid" className="gap-1.5 rounded-r-none">
							<GridFourIcon />
							<Trans>Grid</Trans>
						</TabsTrigger>

						<TabsTrigger value="list" className="gap-1.5 rounded-l-none">
							<ListIcon />
							<Trans>List</Trans>
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</motion.div>

			{/* Resume cards with staggered animation */}
			<motion.div initial={false} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
				{isLoadingResumes ? (
					view === "list" ? (
						<ResumeListSkeletonComponent count={5} />
					) : (
						<ResumeGridSkeleton count={6} />
					)
				) : view === "list" ? (
					<ListView resumes={resumes ?? []} />
				) : (
					<GridView resumes={resumes ?? []} />
				)}
			</motion.div>
		</motion.div>
	);
}

const RESUMES_VIEW_COOKIE_NAME = "resumes_view";

const viewSchema = z.enum(["grid", "list"]).catch("grid");

const setViewServerFn = createServerFn({ method: "POST" })
	.inputValidator(viewSchema)
	.handler(async ({ data }) => {
		setCookie(RESUMES_VIEW_COOKIE_NAME, JSON.stringify(data));
	});

const getViewServerFn = createServerFn({ method: "GET" }).handler(async () => {
	const view = getCookie(RESUMES_VIEW_COOKIE_NAME);
	if (!view) return "grid";
	return viewSchema.parse(JSON.parse(view));
});
