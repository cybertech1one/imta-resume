import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { CopyIcon, DownloadSimpleIcon, LockSimpleIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { memo, useMemo } from "react";
import { match, P } from "ts-pattern";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/integrations/auth/client";
import { orpc, type RouterOutput } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { ResumeContextMenu } from "../menus/context-menu";
import { BaseCard } from "./base-card";

type ResumeCardProps = {
	resume: RouterOutput["resume"]["list"][number];
};

const ResumeCard = memo(function ResumeCard({ resume }: ResumeCardProps) {
	const { data: session } = authClient.useSession();
	useLingui();

	const { data: screenshotData, isLoading } = useQuery({
		...orpc.printer.getResumeScreenshot.queryOptions({ input: { id: resume.id } }),
		enabled: !!session?.user,
	});

	// Format relative time for the badge
	const relativeTime = useMemo(() => {
		const now = new Date();
		const updated = new Date(resume.updatedAt);
		const diffMs = now.getTime() - updated.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffHours < 1) return t`Just now`;
		if (diffHours < 24) return t`${diffHours}h ago`;
		if (diffDays < 7) return t`${diffDays}d ago`;
		return updated.toLocaleDateString(undefined, { day: "numeric", month: "short" });
	}, [resume.updatedAt]);

	return (
		<ResumeContextMenu resume={resume}>
			<Link to="/builder/$resumeId" params={{ resumeId: resume.id }} className="cursor-default">
				<BaseCard title={resume.name} description={t`Modified ${relativeTime}`} tags={resume.tags}>
					{match({ isLoading, imageSrc: screenshotData?.url })
						.with({ isLoading: true }, () => (
							<div className="relative size-full overflow-hidden bg-muted">
								<Skeleton className="size-full" />
								<div className="skeleton-wave absolute inset-0 opacity-50" />
							</div>
						))
						.with({ imageSrc: P.string }, ({ imageSrc }) => (
							<div className="relative size-full overflow-hidden">
								<LazyImage
									src={imageSrc}
									alt={resume.name}
									strategy="observer"
									fadeDuration={200}
									blurAmount={10}
									className={cn(
										"size-full transition-transform duration-500 ease-out group-hover/resume-card:scale-105",
										resume.isLocked && "blur-xs",
									)}
								/>
							</div>
						))
						.otherwise(() => null)}

					{/* Quick action overlay on hover */}
					{!resume.isLocked && (
						<div className="resume-card-overlay rounded-md">
							<motion.div
								className="flex items-center gap-2"
								initial={false}
								whileInView={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.2 }}
							>
								<Button
									size="icon"
									variant="secondary"
									className="size-9 rounded-full bg-white/90 shadow-lg backdrop-blur-sm hover:bg-white dark:bg-black/70 dark:hover:bg-black/90"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									title={t`Edit`}
								>
									<PencilSimpleIcon className="size-4" weight="bold" />
								</Button>
								<Button
									size="icon"
									variant="secondary"
									className="size-9 rounded-full bg-white/90 shadow-lg backdrop-blur-sm hover:bg-white dark:bg-black/70 dark:hover:bg-black/90"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									title={t`Duplicate`}
								>
									<CopyIcon className="size-4" weight="bold" />
								</Button>
								<Button
									size="icon"
									variant="secondary"
									className="size-9 rounded-full bg-white/90 shadow-lg backdrop-blur-sm hover:bg-white dark:bg-black/70 dark:hover:bg-black/90"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									title={t`Download`}
								>
									<DownloadSimpleIcon className="size-4" weight="bold" />
								</Button>
							</motion.div>
						</div>
					)}

					<ResumeLockOverlay isLocked={resume.isLocked} />
				</BaseCard>
			</Link>
		</ResumeContextMenu>
	);
});

ResumeCard.displayName = "ResumeCard";

export { ResumeCard };

const ResumeLockOverlay = memo(function ResumeLockOverlay({ isLocked }: { isLocked: boolean }) {
	return (
		<AnimatePresence>
			{isLocked && (
				<motion.div
					key="resume-lock-overlay"
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.6 }}
					exit={{ opacity: 0 }}
					className="absolute inset-0 flex items-center justify-center"
				>
					<div className="flex items-center justify-center rounded-full bg-popover p-6">
						<LockSimpleIcon weight="thin" className="size-12 opacity-60" />
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
});

ResumeLockOverlay.displayName = "ResumeLockOverlay";
