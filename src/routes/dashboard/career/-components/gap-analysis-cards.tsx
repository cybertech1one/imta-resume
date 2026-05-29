import { Trans } from "@lingui/react/macro";
import {
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
	DownloadSimpleIcon,
	RocketLaunchIcon,
	SparkleIcon,
	SpinnerIcon,
	TargetIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── Metrics Cards ──────────────────────────────────────────────────────────────

interface MetricsCardsProps {
	overallMetrics: {
		readinessScore: number;
		skillsCovered: number;
		totalGaps: number;
		criticalGaps: number;
		estimatedWeeks: number;
	};
	skillGapsLength: number;
}

export function MetricsCards({ overallMetrics, skillGapsLength }: MetricsCardsProps) {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			<Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
				<CardContent className="p-6">
					<div className="mb-4 flex items-center justify-between">
						<div className="flex size-12 items-center justify-center rounded-full bg-primary/20">
							<TargetIcon className="size-6 text-primary" weight="fill" />
						</div>
						<Badge variant="secondary">Score</Badge>
					</div>
					<p className="mb-1 font-bold text-4xl">{overallMetrics.readinessScore}%</p>
					<p className="text-muted-foreground text-sm">
						<Trans>Ready for the role</Trans>
					</p>
				</CardContent>
			</Card>

			<Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
				<CardContent className="p-6">
					<div className="mb-4 flex items-center justify-between">
						<div className="flex size-12 items-center justify-center rounded-full bg-green-500/20">
							<CheckCircleIcon className="size-6 text-green-500" weight="fill" />
						</div>
						<Badge className="bg-green-500">
							<Trans>Acquired</Trans>
						</Badge>
					</div>
					<p className="mb-1 font-bold text-4xl text-green-600 dark:text-green-400">{overallMetrics.skillsCovered}</p>
					<p className="text-muted-foreground text-sm">
						<Trans>out of {skillGapsLength} skills</Trans>
					</p>
				</CardContent>
			</Card>

			<Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
				<CardContent className="p-6">
					<div className="mb-4 flex items-center justify-between">
						<div className="flex size-12 items-center justify-center rounded-full bg-amber-500/20">
							<WarningCircleIcon className="size-6 text-amber-500" weight="fill" />
						</div>
						<Badge variant="secondary">
							<Trans>To develop</Trans>
						</Badge>
					</div>
					<p className="mb-1 font-bold text-4xl text-amber-600 dark:text-amber-400">{overallMetrics.totalGaps}</p>
					<p className="text-muted-foreground text-sm">
						<Trans>including {overallMetrics.criticalGaps} critical</Trans>
					</p>
				</CardContent>
			</Card>

			<Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent">
				<CardContent className="p-6">
					<div className="mb-4 flex items-center justify-between">
						<div className="flex size-12 items-center justify-center rounded-full bg-blue-500/20">
							<ClockIcon className="size-6 text-blue-500" weight="fill" />
						</div>
						<Badge variant="secondary">
							<Trans>Duration</Trans>
						</Badge>
					</div>
					<p className="mb-1 font-bold text-4xl text-blue-600 dark:text-blue-400">{overallMetrics.estimatedWeeks}</p>
					<p className="text-muted-foreground text-sm">
						<Trans>estimated weeks</Trans>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

// ─── Quick Actions Card ─────────────────────────────────────────────────────────

interface QuickActionsProps {
	weeklyHours: number;
	onWeeklyHoursChange: (hours: number) => void;
	onGenerateLearningPath: () => void;
	onExportReport: () => void;
	isGeneratingPath: boolean;
	hasSelectedRole: boolean;
}

export function QuickActions({
	weeklyHours,
	onWeeklyHoursChange,
	onGenerateLearningPath,
	onExportReport,
	isGeneratingPath,
	hasSelectedRole,
}: QuickActionsProps) {
	return (
		<Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
			<CardContent className="flex flex-col items-center py-8 text-center">
				<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
					<RocketLaunchIcon className="size-8 text-primary" weight="duotone" />
				</div>
				<h3 className="mb-2 font-bold text-2xl">
					<Trans>Ready to Bridge the Gaps?</Trans>
				</h3>
				<p className="mb-6 max-w-md text-muted-foreground">
					<Trans>Generate a personalized AI learning path or export your analysis.</Trans>
				</p>
				<div className="mb-4 flex items-center gap-4">
					<label className="text-muted-foreground text-sm">
						<Trans>Hours per week:</Trans>
					</label>
					<Select value={weeklyHours.toString()} onValueChange={(v) => onWeeklyHoursChange(Number(v))}>
						<SelectTrigger className="w-24">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="5">5h</SelectItem>
							<SelectItem value="10">10h</SelectItem>
							<SelectItem value="15">15h</SelectItem>
							<SelectItem value="20">20h</SelectItem>
							<SelectItem value="30">30h</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex flex-wrap justify-center gap-4">
					<Button
						size="lg"
						className="gap-2"
						onClick={onGenerateLearningPath}
						disabled={isGeneratingPath || !hasSelectedRole}
					>
						{isGeneratingPath ? (
							<>
								<SpinnerIcon className="size-5 animate-spin" />
								<Trans>Generating...</Trans>
							</>
						) : (
							<>
								<SparkleIcon className="size-5" weight="fill" />
								<Trans>Generate AI Path</Trans>
							</>
						)}
					</Button>
					<Button size="lg" variant="outline" className="gap-2" onClick={onExportReport}>
						<DownloadSimpleIcon className="size-5" />
						<Trans>Export Report</Trans>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Study Plan CTA Card ────────────────────────────────────────────────────────

export function StudyPlanCTA() {
	return (
		<Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
			<CardContent className="flex flex-col items-center py-8 text-center">
				<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
					<CalendarIcon className="size-8 text-primary" weight="duotone" />
				</div>
				<h3 className="mb-2 font-bold text-2xl">
					<Trans>Create a Personalized Study Plan</Trans>
				</h3>
				<p className="mb-6 max-w-md text-muted-foreground">
					<Trans>
						Transform your gap analysis into a concrete action plan with weekly goals and learning resources.
					</Trans>
				</p>
				<Link to={"/dashboard/career/study-plan" as string}>
					<Button size="lg" className="gap-2">
						<RocketLaunchIcon className="size-5" />
						<Trans>Generate a Study Plan</Trans>
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}
