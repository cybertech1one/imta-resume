import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BookOpenIcon,
	ChartBarIcon,
	ClockIcon,
	ListChecksIcon,
	MagnifyingGlassIcon,
	PaletteIcon,
	RocketLaunchIcon,
	StarIcon,
	TargetIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

import { DashboardHeader } from "../-components/header";
import {
	ATSChecklist,
	BeforeAfterComparisonComponent,
	CircularProgress,
	ContentCompleteness,
	EmptyState,
	ExportReport,
	getScoreColor,
	ImprovementSuggestions,
	IndustryBenchmarks,
	LoadingSkeleton,
	ReadabilityScore,
	ScoreRadarChart,
	SectionScoreCard,
	VisualAppealScore,
} from "./-components/scoring-components";
import {
	defaultATSChecklist,
	defaultContentCompleteness,
	defaultImprovementSuggestions,
	defaultIndustryBenchmarks,
	defaultRadarData,
	defaultReadabilityScore,
	defaultSectionScores,
	defaultVisualAppealScore,
} from "./-components/scoring-config";
import type {
	ATSCheckItem,
	ContentCompletenessData,
	ImprovementSuggestion,
	IndustryBenchmark,
	RadarDataPoint,
	ReadabilityScoreData,
	SectionScore,
	VisualAppealScoreData,
} from "./-components/scoring-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/resumes/scoring" as any)({
	component: ResumeScoringComponent,
	errorComponent: ErrorComponent,
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function ResumeScoringComponent() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("overview");

	// Fetch the latest scoring result
	const {
		data: scoringResult,
		isLoading,
		error,
	} = useQuery({ ...orpc.resumeScoring.getLatest.queryOptions(), enabled: !!session?.user });

	// Fetch before/after comparison data
	const { data: beforeAfterData = [] } = useQuery({
		...orpc.resumeScoring.getBeforeAfterComparison.queryOptions(),
		enabled: !!session?.user,
	});

	// Create scoring mutation
	const createScoringMutation = useMutation(
		orpc.resumeScoring.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["resumeScoring"] });
			},
		}),
	);

	// Update selected industry mutation
	const updateIndustryMutation = useMutation(
		orpc.resumeScoring.updateSelectedIndustry.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["resumeScoring"] });
			},
		}),
	);

	// Get the selected industry from the scoring result or use the first default
	const selectedIndustry = scoringResult?.selectedIndustry ?? defaultIndustryBenchmarks[0].industry;

	// Handle creating a new scoring result
	const handleCreateScoring = async () => {
		const atsScore = Math.round(
			(defaultATSChecklist.filter((i) => i.passed).length / defaultATSChecklist.length) * 100,
		);
		const overallScore = Math.round(
			(atsScore + defaultReadabilityScore.score + defaultVisualAppealScore.score + defaultContentCompleteness.score) /
				4,
		);

		await createScoringMutation.mutateAsync({
			resumeName: t`My Resume`,
			overallScore,
			sectionScores: defaultSectionScores,
			atsChecklist: defaultATSChecklist,
			atsScore,
			readabilityScore: defaultReadabilityScore,
			visualAppealScore: defaultVisualAppealScore,
			contentCompleteness: defaultContentCompleteness,
			improvementSuggestions: defaultImprovementSuggestions,
			industryBenchmarks: defaultIndustryBenchmarks,
			radarData: defaultRadarData,
			selectedIndustry: defaultIndustryBenchmarks[0].industry,
		});
	};

	// Handle industry selection change
	const handleSelectIndustry = async (industry: string) => {
		if (scoringResult?.id) {
			await updateIndustryMutation.mutateAsync({
				id: scoringResult.id,
				industry,
			});
		}
	};

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	// Compute ATS score from checklist
	const atsScore = useMemo(() => {
		if (!scoringResult?.atsChecklist?.length) return 0;
		const passed = scoringResult.atsChecklist.filter((i) => i.passed).length;
		return Math.round((passed / scoringResult.atsChecklist.length) * 100);
	}, [scoringResult?.atsChecklist]);

	// Loading state
	if (isLoading) {
		return <LoadingSkeleton />;
	}

	// Error state
	if (error) {
		return (
			<div className="space-y-8">
				<DashboardHeader icon={StarIcon} title={t`Resume Evaluation`} />
				<Card className="border-destructive">
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<XCircleIcon className="mb-4 size-12 text-destructive" weight="duotone" />
						<h3 className="mb-2 font-semibold text-xl">
							<Trans>Loading error</Trans>
						</h3>
						<p className="text-muted-foreground">
							<Trans>Unable to load evaluation data.</Trans>
						</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => queryClient.invalidateQueries({ queryKey: ["resumeScoring"] })}
						>
							<Trans>Retry</Trans>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Empty state - no scoring result yet
	if (!scoringResult) {
		return <EmptyState onCreateScoring={handleCreateScoring} />;
	}

	// Get data from scoring result with fallbacks
	const overallScore = scoringResult.overallScore;
	const sectionScores = scoringResult.sectionScores as SectionScore[];
	const atsChecklist = scoringResult.atsChecklist as ATSCheckItem[];
	const readabilityScore = (scoringResult.readabilityScore as ReadabilityScoreData) ?? defaultReadabilityScore;
	const visualAppealScore = (scoringResult.visualAppealScore as VisualAppealScoreData) ?? defaultVisualAppealScore;
	const contentCompleteness =
		(scoringResult.contentCompleteness as ContentCompletenessData) ?? defaultContentCompleteness;
	const improvementSuggestions = scoringResult.improvementSuggestions as ImprovementSuggestion[];
	const industryBenchmarks = scoringResult.industryBenchmarks as IndustryBenchmark[];
	const radarData = scoringResult.radarData as RadarDataPoint[];

	return (
		<motion.div className="space-y-8" initial="hidden" animate="visible" variants={containerVariants}>
			<DashboardHeader icon={StarIcon} title={t`Resume Evaluation`} />

			{/* Hero Section with Overall Score */}
			<motion.div
				variants={itemVariants}
				className="relative overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-10"
				style={{
					background:
						"linear-gradient(135deg, oklch(0.65 0.18 280 / 0.15) 0%, oklch(0.6 0.2 220 / 0.1) 35%, oklch(0.7 0.15 160 / 0.08) 70%, oklch(0.65 0.12 40 / 0.1) 100%)",
				}}
			>
				{/* Animated background */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<motion.div
						className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/10 blur-3xl"
						animate={{
							scale: [1, 1.2, 1],
							rotate: [0, 15, 0],
							opacity: [0.5, 0.3, 0.5],
						}}
						transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
					/>
					<motion.div
						className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-blue-500/15 to-cyan-500/10 blur-3xl"
						animate={{
							scale: [1.2, 1, 1.2],
							rotate: [0, -15, 0],
							opacity: [0.3, 0.5, 0.3],
						}}
						transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
					/>
				</div>

				<div className="relative z-10">
					<div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
						{/* Score Display */}
						<div className="flex flex-col items-center md:flex-row md:gap-8">
							<CircularProgress score={overallScore} />
							<div className="mt-4 text-center md:mt-0 md:text-left">
								<motion.h2
									className="mb-2 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl"
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3 }}
								>
									<Trans>Overall Resume Score</Trans>
								</motion.h2>
								<motion.p
									className="max-w-md text-muted-foreground"
									initial={false}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.4 }}
								>
									<Trans>
										Your resume is in a good position but can still be improved. Check the recommendations below.
									</Trans>
								</motion.p>
							</div>
						</div>

						{/* Quick Stats */}
						<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
							{[
								{ label: "ATS", value: atsScore, icon: MagnifyingGlassIcon },
								{ label: "Readability", value: readabilityScore.score, icon: BookOpenIcon },
								{ label: "Visual", value: visualAppealScore.score, icon: PaletteIcon },
								{ label: "Completeness", value: contentCompleteness.score, icon: ListChecksIcon },
							].map((stat, index) => (
								<motion.div
									key={stat.label}
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.5 + index * 0.1 }}
								>
									<Card className="bg-background/50 backdrop-blur-sm">
										<CardContent className="p-4 text-center">
											<stat.icon className="mx-auto mb-2 size-6 text-primary" weight="duotone" />
											<p className={cn("font-bold text-2xl", getScoreColor(stat.value))}>{stat.value}%</p>
											<p className="text-muted-foreground text-xs">{stat.label}</p>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</div>
					</div>
				</div>
			</motion.div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<motion.div variants={itemVariants}>
					<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
						{[
							{ value: "overview", icon: TargetIcon, label: t`Overview` },
							{ value: "sections", icon: ListChecksIcon, label: t`By section` },
							{ value: "ats", icon: MagnifyingGlassIcon, label: t`ATS Compatibility` },
							{ value: "benchmarks", icon: ChartBarIcon, label: t`Benchmarks` },
							{ value: "suggestions", icon: RocketLaunchIcon, label: t`Suggestions` },
							{ value: "history", icon: ClockIcon, label: t`History` },
						].map((tab) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							>
								<tab.icon className="size-4" />
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
				</motion.div>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-8">
					<motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
						<ScoreRadarChart data={radarData} />
						<ImprovementSuggestions suggestions={improvementSuggestions.slice(0, 4)} />
					</motion.div>
					<motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
						<ReadabilityScore data={readabilityScore} />
						<VisualAppealScore data={visualAppealScore} />
					</motion.div>
					<motion.div variants={itemVariants}>
						<ContentCompleteness data={contentCompleteness} />
					</motion.div>
				</TabsContent>

				{/* Sections Tab */}
				<TabsContent value="sections" className="space-y-6">
					<motion.div variants={itemVariants}>
						<Card>
							<CardContent className="pt-6">
								<div className="mb-4 flex items-center gap-2">
									<ListChecksIcon className="size-5 text-primary" weight="duotone" />
									<h3 className="font-semibold text-lg">
										<Trans>Score by section</Trans>
									</h3>
								</div>
								<p className="mb-6 text-muted-foreground text-sm">
									<Trans>Detailed evaluation of each section of your resume</Trans>
								</p>
								<div className="grid gap-4 md:grid-cols-2">
									{sectionScores.map((section, index) => (
										<SectionScoreCard key={section.name} section={section} index={index} />
									))}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</TabsContent>

				{/* ATS Tab */}
				<TabsContent value="ats" className="space-y-6">
					<motion.div variants={itemVariants}>
						<ATSChecklist items={atsChecklist} />
					</motion.div>
				</TabsContent>

				{/* Benchmarks Tab */}
				<TabsContent value="benchmarks" className="space-y-6">
					<motion.div variants={itemVariants}>
						<IndustryBenchmarks
							benchmarks={industryBenchmarks}
							selectedIndustry={selectedIndustry}
							onSelectIndustry={handleSelectIndustry}
						/>
					</motion.div>
				</TabsContent>

				{/* Suggestions Tab */}
				<TabsContent value="suggestions" className="space-y-6">
					<motion.div variants={itemVariants}>
						<ImprovementSuggestions suggestions={improvementSuggestions} />
					</motion.div>
				</TabsContent>

				{/* History Tab */}
				<TabsContent value="history" className="space-y-6">
					<motion.div variants={itemVariants}>
						<BeforeAfterComparisonComponent data={beforeAfterData} />
					</motion.div>
				</TabsContent>
			</Tabs>

			{/* Export Section */}
			<motion.div variants={itemVariants}>
				<ExportReport
					scoringResult={{
						overallScore,
						sectionScores,
						atsChecklist,
						atsScore,
						readabilityScore,
						visualAppealScore,
						contentCompleteness,
						improvementSuggestions,
						radarData,
					}}
				/>
			</motion.div>
		</motion.div>
	);
}
