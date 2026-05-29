import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowsLeftRightIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ClockIcon,
	DownloadSimpleIcon,
	FileTextIcon,
	GitMergeIcon,
	PlusIcon,
	SparkleIcon,
	TargetIcon,
	TrashIcon,
	TrendUpIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import type { SectionType } from "@/schema/resume/data";
import { cn } from "@/utils/style";
import type {
	ComparisonMetrics,
	DifferenceType,
	JobTypeRecommendation,
	Resume,
	SectionDifference,
} from "./compare-types";

// Resume Preview Card Component
export function ResumePreviewCard({
	resume,
	metrics,
	onRemove,
	position,
	totalCount,
	onSwap,
}: {
	resume: Resume;
	metrics: ComparisonMetrics;
	onRemove: () => void;
	position: number;
	totalCount: number;
	onSwap?: (direction: "left" | "right") => void;
}) {
	const { data: session } = authClient.useSession();
	const { data: screenshotData, isLoading } = useQuery({
		...orpc.printer.getResumeScreenshot.queryOptions({ input: { id: resume.id } }),
		enabled: !!session?.user,
	});

	return (
		<motion.div
			layout
			initial={false}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			className="relative flex h-full flex-col"
		>
			<Card className="flex h-full flex-col overflow-hidden">
				{/* Header */}
				<CardHeader className="relative pb-2">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0 flex-1">
							<CardTitle className="truncate text-base">{resume.name}</CardTitle>
							<CardDescription className="flex items-center gap-1 text-xs">
								<ClockIcon className="size-3" />
								{new Date(resume.updatedAt).toLocaleDateString()}
							</CardDescription>
						</div>
						<div className="flex items-center gap-1">
							{onSwap && position > 0 && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="ghost" size="icon-sm" onClick={() => onSwap("left")}>
											<ArrowsLeftRightIcon className="size-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<Trans>Move left</Trans>
									</TooltipContent>
								</Tooltip>
							)}
							{onSwap && position < totalCount - 1 && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="ghost" size="icon-sm" onClick={() => onSwap("right")}>
											<ArrowsLeftRightIcon className="size-4 rotate-180" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<Trans>Move right</Trans>
									</TooltipContent>
								</Tooltip>
							)}
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="ghost" size="icon-sm" onClick={onRemove}>
										<XIcon className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<Trans>Remove from comparison</Trans>
								</TooltipContent>
							</Tooltip>
						</div>
					</div>

					{/* Tags */}
					{resume.tags && resume.tags.length > 0 && (
						<div className="mt-2 flex flex-wrap gap-1">
							{resume.tags.slice(0, 3).map((tag) => (
								<Badge key={tag} variant="secondary" className="text-xs">
									{tag}
								</Badge>
							))}
							{resume.tags.length > 3 && (
								<Badge variant="outline" className="text-xs">
									+{resume.tags.length - 3}
								</Badge>
							)}
						</div>
					)}
				</CardHeader>

				{/* Preview Image */}
				<CardContent className="flex-1 p-4 pt-0">
					<div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-md border bg-muted">
						{isLoading ? (
							<div className="flex size-full items-center justify-center">
								<div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
							</div>
						) : screenshotData?.url ? (
							<img
								src={screenshotData.url}
								alt={resume.name}
								loading="lazy"
								className="size-full object-cover object-top"
							/>
						) : (
							<div className="flex size-full items-center justify-center text-muted-foreground">
								<FileTextIcon className="size-12" />
							</div>
						)}
					</div>

					{/* Quick Metrics */}
					<div className="space-y-3">
						{/* ATS Score */}
						<div className="space-y-1">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									<Trans>ATS Score</Trans>
								</span>
								<span
									className={cn(
										"font-medium",
										metrics.atsScore >= 80
											? "text-green-600"
											: metrics.atsScore >= 60
												? "text-amber-600"
												: "text-red-600",
									)}
								>
									{metrics.atsScore}%
								</span>
							</div>
							<Progress value={metrics.atsScore} className="h-1.5" />
						</div>

						{/* Completeness */}
						<div className="space-y-1">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									<Trans>Completeness</Trans>
								</span>
								<span className="font-medium">{metrics.completenessScore}%</span>
							</div>
							<Progress value={metrics.completenessScore} className="h-1.5" />
						</div>

						{/* Quick Stats Grid */}
						<div className="grid grid-cols-2 gap-2 pt-2">
							<div className="rounded-md bg-muted/50 p-2 text-center">
								<p className="font-semibold text-lg">{metrics.wordCount}</p>
								<p className="text-muted-foreground text-xs">
									<Trans>Words</Trans>
								</p>
							</div>
							<div className="rounded-md bg-muted/50 p-2 text-center">
								<p className="font-semibold text-lg">{metrics.skills.length}</p>
								<p className="text-muted-foreground text-xs">
									<Trans>Skills</Trans>
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// Skills Comparison Chart Component
export function SkillsComparisonChart({
	metricsArray,
	resumes,
}: {
	metricsArray: ComparisonMetrics[];
	resumes: Resume[];
}) {
	// Collect all unique skills
	const allSkills = useMemo(() => {
		const skillSet = new Set<string>();
		for (const metrics of metricsArray) {
			for (const skill of metrics.skills) {
				skillSet.add(skill.toLowerCase());
			}
		}
		return Array.from(skillSet).sort();
	}, [metricsArray]);

	const colors = ["bg-blue-500", "bg-purple-500", "bg-amber-500"];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<ChartBarIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Skills Comparison</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Skills found across your resume versions</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				{/* Legend */}
				<div className="mb-4 flex flex-wrap gap-4">
					{resumes.map((resume, i) => (
						<div key={resume.id} className="flex items-center gap-2">
							<div className={cn("size-3 rounded-full", colors[i])} />
							<span className="text-sm">{resume.name}</span>
						</div>
					))}
				</div>

				<ScrollArea className="h-64">
					<div className="space-y-2">
						{allSkills.slice(0, 20).map((skill) => (
							<div key={skill} className="flex items-center gap-2">
								<span className="w-32 truncate text-sm capitalize">{skill}</span>
								<div className="flex flex-1 gap-1">
									{metricsArray.map((metrics, i) => (
										<div
											key={`${skill}-${i}`}
											className={cn(
												"h-4 rounded-sm transition-all",
												metrics.skills.map((s) => s.toLowerCase()).includes(skill) ? colors[i] : "bg-muted",
											)}
											style={{ width: `${100 / metricsArray.length}%` }}
										/>
									))}
								</div>
							</div>
						))}
					</div>
				</ScrollArea>

				{allSkills.length > 20 && (
					<p className="mt-2 text-center text-muted-foreground text-sm">
						<Trans>And {allSkills.length - 20} more skills...</Trans>
					</p>
				)}
			</CardContent>
		</Card>
	);
}

// Differences View Component
export function DifferencesView({
	differences,
	showOnlyChanges,
}: {
	differences: SectionDifference[];
	showOnlyChanges: boolean;
}) {
	const filteredDifferences = showOnlyChanges ? differences.filter((d) => d.type !== "unchanged") : differences;

	const typeColors: Record<DifferenceType, string> = {
		added: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300",
		removed: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300",
		modified: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300",
		unchanged: "bg-muted text-muted-foreground",
	};

	const typeIcons: Record<DifferenceType, React.ElementType> = {
		added: PlusIcon,
		removed: TrashIcon,
		modified: ArrowsLeftRightIcon,
		unchanged: CheckCircleIcon,
	};

	if (filteredDifferences.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<CheckCircleIcon className="mb-4 size-12 text-green-500" weight="duotone" />
				<h3 className="mb-2 font-semibold text-lg">
					<Trans>No Differences Found</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>The selected resumes are identical or no changes were detected.</Trans>
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{filteredDifferences.map((diff) => (
				<Card key={diff.section}>
					<CardHeader className="py-3">
						<CardTitle className="flex items-center gap-2 font-medium text-sm capitalize">
							{diff.section.replace(/([A-Z])/g, " $1").trim()}
							<Badge variant={diff.type === "unchanged" ? "secondary" : "default"} className="text-xs">
								{diff.items.filter((i) => i.type !== "unchanged").length} changes
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="space-y-2">
							{diff.items
								.filter((item) => !showOnlyChanges || item.type !== "unchanged")
								.map((item, idx) => {
									const Icon = typeIcons[item.type];
									return (
										<div
											key={idx}
											className={cn("flex items-center gap-2 rounded-md border px-3 py-2", typeColors[item.type])}
										>
											<Icon className="size-4 shrink-0" />
											<span className="text-sm">{item.content}</span>
										</div>
									);
								})}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

// Version Timeline Component
export function VersionTimeline({ resumes }: { resumes: Resume[] }) {
	const sortedResumes = useMemo(() => {
		return [...resumes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
	}, [resumes]);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<ClockIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Version Timeline</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>History of your resume versions</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="relative">
					{/* Timeline line */}
					<div className="absolute top-0 bottom-0 left-4 w-0.5 bg-border" />

					<div className="space-y-6">
						{sortedResumes.map((resume, index) => (
							<motion.div
								key={resume.id}
								initial={false}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
								className="relative flex gap-4"
							>
								{/* Timeline dot */}
								<div
									className={cn(
										"relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-background",
										index === 0 ? "border-primary" : "border-muted-foreground/30",
									)}
								>
									{index === 0 ? (
										<SparkleIcon className="size-4 text-primary" weight="fill" />
									) : (
										<ClockIcon className="size-4 text-muted-foreground" />
									)}
								</div>

								{/* Content */}
								<div className="min-w-0 flex-1 pb-4">
									<div className="flex items-center gap-2">
										<h4 className="truncate font-medium">{resume.name}</h4>
										{index === 0 && (
											<Badge variant="default" className="text-xs">
												<Trans>Latest</Trans>
											</Badge>
										)}
									</div>
									<p className="text-muted-foreground text-sm">{new Date(resume.updatedAt).toLocaleString()}</p>
									{resume.tags && resume.tags.length > 0 && (
										<div className="mt-1 flex flex-wrap gap-1">
											{resume.tags.map((tag) => (
												<Badge key={tag} variant="outline" className="text-xs">
													{tag}
												</Badge>
											))}
										</div>
									)}
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// Merge Dialog Component
export function MergeDialog({ resumes, metricsArray }: { resumes: Resume[]; metricsArray: ComparisonMetrics[] }) {
	const [selectedSections, setSelectedSections] = useState<Record<string, number>>({});
	const [isOpen, setIsOpen] = useState(false);

	const sections: SectionType[] = [
		"experience",
		"education",
		"skills",
		"projects",
		"certifications",
		"languages",
		"profiles",
		"awards",
		"volunteer",
		"references",
		"publications",
	];

	const handleMerge = () => {
		if (selectedSections.length === 0) {
			toast.error(t`Please select at least one section to merge`);
			return;
		}
		toast.success(t`Merging ${selectedSections.length} selected sections into a new resume...`);
		setIsOpen(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="gap-2">
					<GitMergeIcon className="size-4" />
					<Trans>Merge Versions</Trans>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<GitMergeIcon className="size-5 text-primary" />
						<Trans>Merge Resume Versions</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Select which sections to take from each version to create a combined resume.</Trans>
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-96">
					<div className="space-y-4 p-1">
						{sections.map((section) => {
							const hasContent = metricsArray.some((m) => m.sectionCounts[section] && m.sectionCounts[section] > 0);

							if (!hasContent) return null;

							return (
								<div key={section} className="flex items-center justify-between rounded-lg border p-3">
									<div className="flex items-center gap-2">
										<span className="font-medium capitalize">{section.replace(/([A-Z])/g, " $1").trim()}</span>
										<div className="flex gap-1">
											{metricsArray.map((m, i) => (
												<Badge key={i} variant="outline" className="text-xs">
													{m.sectionCounts[section] || 0}
												</Badge>
											))}
										</div>
									</div>
									<div className="flex gap-2">
										{resumes.map((resume, i) => (
											<Button
												key={resume.id}
												variant={selectedSections[section] === i ? "default" : "outline"}
												size="sm"
												onClick={() =>
													setSelectedSections((prev) => ({
														...prev,
														[section]: i,
													}))
												}
												disabled={!metricsArray[i]?.sectionCounts[section]}
											>
												V{i + 1}
											</Button>
										))}
									</div>
								</div>
							);
						})}
					</div>
				</ScrollArea>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={handleMerge} className="gap-2">
						<GitMergeIcon className="size-4" />
						<Trans>Create Merged Resume</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// Export Comparison Report
export function ExportReportButton({
	resumes,
	metricsArray,
	differences,
	recommendations,
}: {
	resumes: Resume[];
	metricsArray: ComparisonMetrics[];
	differences: SectionDifference[];
	recommendations: JobTypeRecommendation[];
}) {
	const handleExport = () => {
		const report = {
			generatedAt: new Date().toISOString(),
			comparedResumes: resumes.map((r) => ({
				name: r.name,
				updatedAt: r.updatedAt,
				tags: r.tags,
			})),
			metrics: metricsArray.map((m, i) => ({
				resume: resumes[i]?.name,
				...m,
			})),
			differences: differences.map((d) => ({
				section: d.section,
				changes: d.items.filter((i) => i.type !== "unchanged"),
			})),
			recommendations: recommendations.map((r) => ({
				jobType: r.jobType,
				recommendedVersion: r.recommendedVersion,
				reason: r.reason,
				matchScore: r.matchScore,
			})),
		};

		const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `resume-comparison-${new Date().toISOString().split("T")[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<Button variant="outline" onClick={handleExport} className="gap-2">
			<DownloadSimpleIcon className="size-4" />
			<Trans>Export Report</Trans>
		</Button>
	);
}

// Recommendations Panel
export function RecommendationsPanel({ recommendations }: { recommendations: JobTypeRecommendation[] }) {
	if (recommendations.length === 0) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<TargetIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Recommendations by Job Type</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Which version to use for different career paths</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2">
					{recommendations.map((rec, index) => (
						<motion.div
							key={rec.jobType}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Alert>
								<rec.icon className="size-4" />
								<AlertTitle className="flex items-center gap-2">
									{rec.jobType}
									<Badge variant="outline" className="gap-1 text-xs">
										<TrendUpIcon className="size-3" />
										{rec.matchScore}%
									</Badge>
								</AlertTitle>
								<AlertDescription>
									<p className="mb-2">
										<Trans>Recommended:</Trans>{" "}
										<span className="font-medium text-foreground">{rec.recommendedVersion}</span>
									</p>
									<p className="text-xs">{rec.reason}</p>
								</AlertDescription>
							</Alert>
						</motion.div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
