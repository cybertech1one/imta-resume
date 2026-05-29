import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { ClockIcon, DotsThreeIcon, DownloadSimpleIcon, FileTextIcon, PlusIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useDialogStore } from "@/dialogs/store";
import type { RouterOutput } from "@/integrations/orpc/client";
import { ResumeDropdownMenu } from "./menus/dropdown-menu";

type Resume = RouterOutput["resume"]["list"][number];

type Props = {
	resumes: Resume[];
};

export function ListView({ resumes }: Props) {
	const { openDialog } = useDialogStore();

	const handleCreateResume = () => {
		openDialog("resume.create", undefined);
	};

	const handleImportResume = () => {
		openDialog("resume.import", undefined);
	};

	// Show empty state when no resumes exist
	if (!resumes || resumes.length === 0) {
		return (
			<div className="py-8">
				<EmptyState
					icon={FileTextIcon}
					title={t`No resumes yet`}
					description={t`Create your first resume to start your professional journey.`}
					action={{
						label: t`Create a resume`,
						onClick: handleCreateResume,
						icon: PlusIcon,
					}}
					secondaryAction={{
						label: t`Import a resume`,
						onClick: handleImportResume,
						variant: "outline",
						icon: DownloadSimpleIcon,
					}}
					size="lg"
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-y-1">
			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
				<Button
					size="lg"
					variant="ghost"
					className="h-12 w-full justify-start gap-x-4 text-start transition-all duration-200 hover:bg-primary/5"
					onClick={handleCreateResume}
				>
					<div
						className="flex size-8 items-center justify-center rounded-lg"
						style={{ background: "oklch(from var(--imta-emerald) l c h / 0.1)" }}
					>
						<PlusIcon className="size-4" weight="bold" style={{ color: "var(--imta-emerald)" }} />
					</div>
					<div className="min-w-0 flex-1 truncate sm:min-w-80">
						<Trans>Create a new resume</Trans>
					</div>

					<p className="hidden text-xs opacity-60 sm:block">
						<Trans>Start building your resume</Trans>
					</p>
				</Button>
			</motion.div>

			<motion.div
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -16 }}
				transition={{ delay: 0.05 }}
			>
				<Button
					size="lg"
					variant="ghost"
					className="h-12 w-full justify-start gap-x-4 text-start transition-all duration-200 hover:bg-primary/5"
					onClick={handleImportResume}
				>
					<div className="flex size-8 items-center justify-center rounded-lg bg-muted">
						<DownloadSimpleIcon className="size-4 text-muted-foreground" weight="bold" />
					</div>

					<div className="min-w-0 flex-1 truncate sm:min-w-80">
						<Trans>Import an existing resume</Trans>
					</div>

					<p className="hidden text-xs opacity-60 sm:block">
						<Trans>Pick up where you left off</Trans>
					</p>
				</Button>
			</motion.div>

			<div className="section-divider my-3" />

			<AnimatePresence mode="popLayout">
				{resumes.map((resume, index) => (
					<motion.div
						layout
						key={resume.id}
						initial={{ opacity: 0, y: -16 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, x: -50, filter: "blur(8px)" }}
						transition={{ delay: Math.min(index, 10) * 0.035, type: "spring", stiffness: 500, damping: 30 }}
					>
						<ResumeListItem resume={resume} />
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}

/**
 * Memoized ResumeListItem component to prevent unnecessary re-renders
 * when parent list updates but individual resume data hasn't changed.
 */
const ResumeListItem = memo(function ResumeListItem({ resume }: { resume: Resume }) {
	const { i18n } = useLingui();

	const updatedAt = useMemo(() => {
		return Intl.DateTimeFormat(i18n.locale, { dateStyle: "long", timeStyle: "short" }).format(resume.updatedAt);
	}, [i18n.locale, resume.updatedAt]);

	// Relative time for compact display
	const relativeTime = useMemo(() => {
		const now = new Date();
		const updated = new Date(resume.updatedAt);
		const diffMs = now.getTime() - updated.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffHours < 1) return t`Just now`;
		if (diffHours < 24) return t`${diffHours}h ago`;
		if (diffDays === 1) return t`Yesterday`;
		if (diffDays < 7) return t`${diffDays}d ago`;
		return updated.toLocaleDateString(undefined, { day: "numeric", month: "short" });
	}, [resume.updatedAt]);

	return (
		<div className="group flex items-center gap-x-2 rounded-lg transition-all duration-200 hover:bg-muted/50 hover:shadow-sm">
			<Button asChild size="lg" variant="ghost" className="h-14 w-full flex-1 justify-start gap-x-4 text-start">
				<Link to="/builder/$resumeId" params={{ resumeId: resume.id }}>
					<div className="flex size-9 items-center justify-center rounded-lg bg-muted transition-all duration-200 group-hover:bg-primary/10 group-hover:shadow-sm">
						<FileTextIcon
							className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
							weight="duotone"
						/>
					</div>
					<div className="min-w-0 flex-1">
						<div className="truncate font-medium sm:min-w-80">{resume.name}</div>
						<div className="flex items-center gap-2">
							<span className="flex items-center gap-1 text-muted-foreground text-xs">
								<ClockIcon className="size-3" />
								{relativeTime}
							</span>
							<span className="hidden text-muted-foreground text-xs sm:inline">- {updatedAt}</span>
						</div>
					</div>

					{resume.tags && resume.tags.length > 0 && (
						<div className="hidden items-center gap-1 lg:flex">
							{resume.tags.slice(0, 2).map((tag) => (
								<Badge key={tag} variant="outline" className="text-[10px]">
									{tag}
								</Badge>
							))}
							{resume.tags.length > 2 && (
								<span className="text-muted-foreground text-xs">+{resume.tags.length - 2}</span>
							)}
						</div>
					)}
				</Link>
			</Button>

			<ResumeDropdownMenu resume={resume} align="end">
				<Button
					size="icon"
					variant="ghost"
					className="size-10 opacity-0 transition-all duration-200 group-hover:opacity-100"
					aria-label={t`Resume options`}
				>
					<DotsThreeIcon weight="bold" />
				</Button>
			</ResumeDropdownMenu>
		</div>
	);
});
ResumeListItem.displayName = "ResumeListItem";
