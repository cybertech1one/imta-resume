import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ChartBarIcon, ListChecksIcon, SparkleIcon, TargetIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	AIAssessmentDialog,
	type Assessment,
	AssessmentCard,
	AssessmentsLoadingSkeleton,
} from "./-components/assessments-components";

const SkillAssessmentsLazy = lazy(() => Promise.resolve({ default: SkillAssessments }));

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/learn/assessments" as any)({
	component: () => (
		<Suspense
			fallback={
				<div className="flex items-center justify-center p-8">
					<Trans>Loading assessments...</Trans>
				</div>
			}
		>
			<SkillAssessmentsLazy />
		</Suspense>
	),
	errorComponent: ErrorComponent,
});

function SkillAssessments() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("all");
	const [assessDialogOpen, setAssessDialogOpen] = useState(false);

	const {
		data: assessments = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["adaptiveLearning", "assessments"],
		queryFn: () => orpc.adaptiveLearning.assessments.list.call({}),
		enabled: !!session?.user,
	});

	const assessMutation = useMutation({
		mutationFn: (input: { skillId: string; skillName: string; category: string; field?: string }) =>
			orpc.adaptiveLearning.assessments.assessSkillLevel.call(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["adaptiveLearning"] });
			toast.success(t`Assessment completed successfully!`);
			setAssessDialogOpen(false);
		},
		onError: (err: Error) => {
			toast.error(err.message || t`Assessment failed`);
		},
	});

	const typedAssessments = assessments as Assessment[];

	// Derive categories from assessments for tab filtering
	const categories = Array.from(new Set(typedAssessments.map((a) => a.category).filter(Boolean)));

	const filteredAssessments =
		activeTab === "all" ? typedAssessments : typedAssessments.filter((a) => a.category === activeTab);

	// Quick stats
	const avgScore =
		typedAssessments.length > 0
			? Math.round(typedAssessments.reduce((sum, a) => sum + a.score, 0) / typedAssessments.length)
			: 0;

	const expertCount = typedAssessments.filter(
		(a) => a.currentLevel === "expert" || a.currentLevel === "advanced",
	).length;

	if (isLoading) {
		return (
			<>
				<DashboardHeader icon={ChartBarIcon} title={t`Skill Assessments`} />
				<AssessmentsLoadingSkeleton />
			</>
		);
	}

	if (error) {
		return (
			<>
				<DashboardHeader icon={ChartBarIcon} title={t`Skill Assessments`} />
				<Card className="border-destructive">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<WarningCircleIcon className="mb-4 size-12 text-destructive" />
						<h3 className="mb-2 font-medium text-lg">
							<Trans>Error loading assessments</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>Please try again later.</Trans>
						</p>
					</CardContent>
				</Card>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={ChartBarIcon} title={t`Skill Assessments`} />

			<AIAssessmentDialog
				open={assessDialogOpen}
				onOpenChange={setAssessDialogOpen}
				onAssess={(data) => assessMutation.mutate(data)}
				isAssessing={assessMutation.isPending}
			/>

			{/* Stats row */}
			{typedAssessments.length > 0 && (
				<div className="mb-8 grid gap-4 sm:grid-cols-3">
					{[
						{
							icon: ListChecksIcon,
							label: t`Total Assessments`,
							value: typedAssessments.length,
							color: "var(--imta-emerald)",
						},
						{
							icon: ChartBarIcon,
							label: t`Average Score`,
							value: `${avgScore}%`,
							color: "var(--imta-teal)",
						},
						{
							icon: TargetIcon,
							label: t`Advanced / Expert`,
							value: expertCount,
							color: "oklch(0.55 0.2 260)",
						},
					].map((stat, i) => (
						<motion.div
							key={stat.label}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
						>
							<Card>
								<CardContent className="flex items-center gap-4 pt-5">
									<div
										className="flex size-10 shrink-0 items-center justify-center rounded-lg"
										style={{ background: `oklch(from ${stat.color} l c h / 0.1)` }}
									>
										<stat.icon weight="duotone" className="size-5" style={{ color: stat.color }} />
									</div>
									<div>
										<p className="text-muted-foreground text-xs">{stat.label}</p>
										<p className="font-bold text-xl tabular-nums">{stat.value}</p>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			)}

			{/* Action bar */}
			<div className="mb-6 flex items-center justify-between gap-4">
				<p className="text-muted-foreground text-sm">
					{typedAssessments.length === 0 ? (
						<Trans>No assessments yet. Start your first AI evaluation.</Trans>
					) : (
						<Trans>{typedAssessments.length} assessments recorded</Trans>
					)}
				</p>
				<Button onClick={() => setAssessDialogOpen(true)} disabled={assessMutation.isPending} className="gap-2">
					<SparkleIcon className="size-4" />
					<Trans>Start AI Assessment</Trans>
				</Button>
			</div>

			{typedAssessments.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center py-16 text-center">
						<ChartBarIcon className="mb-4 size-12 text-muted-foreground/40" />
						<h3 className="mb-2 font-semibold text-base">
							<Trans>No assessments yet</Trans>
						</h3>
						<p className="mb-4 max-w-sm text-muted-foreground text-sm">
							<Trans>
								Use AI-powered assessments to evaluate your skill levels and get personalized learning recommendations.
							</Trans>
						</p>
						<Button onClick={() => setAssessDialogOpen(true)} className="gap-2">
							<SparkleIcon className="size-4" />
							<Trans>Start Your First Assessment</Trans>
						</Button>
					</CardContent>
				</Card>
			) : (
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
						<TabsTrigger
							value="all"
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-5 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<Trans>All</Trans>
							<span className="ml-1 rounded-full bg-muted px-1.5 text-xs tabular-nums">{typedAssessments.length}</span>
						</TabsTrigger>
						{categories.map((cat) => (
							<TabsTrigger
								key={cat}
								value={cat}
								className="gap-2 rounded-full border border-transparent bg-muted/50 px-5 py-2 capitalize data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							>
								{cat}
								<span className="ml-1 rounded-full bg-muted px-1.5 text-xs tabular-nums">
									{typedAssessments.filter((a) => a.category === cat).length}
								</span>
							</TabsTrigger>
						))}
					</TabsList>

					<TabsContent value={activeTab} className="space-y-4">
						{filteredAssessments.length === 0 ? (
							<Card>
								<CardContent className="flex flex-col items-center py-10 text-center">
									<ChartBarIcon className="mb-3 size-8 text-muted-foreground/40" />
									<p className="text-muted-foreground text-sm">
										<Trans>No assessments in this category.</Trans>
									</p>
								</CardContent>
							</Card>
						) : (
							filteredAssessments.map((assessment) => <AssessmentCard key={assessment.id} assessment={assessment} />)
						)}
					</TabsContent>
				</Tabs>
			)}
		</>
	);
}
