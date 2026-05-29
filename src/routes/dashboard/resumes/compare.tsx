import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowsLeftRightIcon,
	ArrowsSplitIcon,
	ChartBarIcon,
	FileTextIcon,
	LightbulbIcon,
	MagnifyingGlassIcon,
	ScalesIcon,
	TargetIcon,
	WarningCircleIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import type { ResumeData } from "@/schema/resume/data";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";
import {
	DifferencesView,
	ExportReportButton,
	MergeDialog,
	RecommendationsPanel,
	ResumePreviewCard,
	SkillsComparisonChart,
	VersionTimeline,
} from "./-components/compare-components";
import { calculateMetrics, findDifferences, generateRecommendations } from "./-components/compare-config";
import type { Resume, ResumeWithData } from "./-components/compare-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/resumes/compare" as any)({
	component: ResumeCompareComponent,
	errorComponent: ErrorComponent,
});

// Main Component
function ResumeCompareComponent() {
	const { data: session } = authClient.useSession();
	const [selectedResumeIds, setSelectedResumeIds] = useState<string[]>([]);
	const [showOnlyChanges, setShowOnlyChanges] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");

	// Fetch all resumes
	const { data: allResumes, isLoading: isLoadingResumes } = useQuery({
		...orpc.resume.list.queryOptions({ input: { tags: [], sort: "lastUpdatedAt" } }),
		enabled: !!session?.user,
	});

	// Get selected resumes (basic info from list)
	const selectedResumes = useMemo(() => {
		if (!allResumes) return [];
		return selectedResumeIds
			.map((id) => allResumes.find((r) => r.id === id))
			.filter((r): r is Resume => r !== undefined);
	}, [allResumes, selectedResumeIds]);

	// Fetch full resume data for each selected resume
	const resumeDataQueries = useQueries({
		queries: selectedResumeIds.map((id) => ({
			...orpc.resume.getById.queryOptions({ input: { id } }),
			enabled: !!session?.user,
		})),
	});

	// Get fully loaded resumes with data
	const selectedResumesWithData = useMemo(() => {
		return resumeDataQueries.map((query) => query.data).filter((data): data is ResumeWithData => data !== undefined);
	}, [resumeDataQueries]);

	// Calculate metrics for each selected resume
	const metricsArray = useMemo(() => {
		return selectedResumesWithData.map((resume) => calculateMetrics(resume.data as ResumeData));
	}, [selectedResumesWithData]);

	// Calculate differences between first two resumes
	const differences = useMemo(() => {
		if (selectedResumesWithData.length < 2) return [];
		return findDifferences(
			selectedResumesWithData[0].data as ResumeData,
			selectedResumesWithData[1].data as ResumeData,
		);
	}, [selectedResumesWithData]);

	// Generate recommendations
	const recommendations = useMemo(() => {
		if (selectedResumes.length < 2) return [];
		return generateRecommendations(metricsArray, selectedResumes);
	}, [metricsArray, selectedResumes]);

	// Resume selection options
	const resumeOptions = useMemo(() => {
		if (!allResumes) return [];
		return allResumes.map((r) => ({
			value: r.id,
			label: r.name,
			keywords: r.tags,
		}));
	}, [allResumes]);

	const addResume = useCallback(
		(id: string | null) => {
			if (id && !selectedResumeIds.includes(id) && selectedResumeIds.length < 3) {
				setSelectedResumeIds((prev) => [...prev, id]);
			}
		},
		[selectedResumeIds],
	);

	const removeResume = useCallback((id: string) => {
		setSelectedResumeIds((prev) => prev.filter((rId) => rId !== id));
	}, []);

	const swapResumes = useCallback((index: number, direction: "left" | "right") => {
		setSelectedResumeIds((prev) => {
			const newIds = [...prev];
			const targetIndex = direction === "left" ? index - 1 : index + 1;
			if (targetIndex >= 0 && targetIndex < newIds.length) {
				[newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]];
			}
			return newIds;
		});
	}, []);

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

	return (
		<motion.div className="space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
			<DashboardHeader icon={ScalesIcon} title={t`Compare Resumes`} />

			<Separator />

			{/* Selection Panel */}
			<motion.div variants={itemVariants}>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<ArrowsSplitIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Select Resumes to Compare</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Choose 2-3 resume versions to compare side by side</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap items-center gap-4">
							{/* Resume selector */}
							<Combobox
								value={null}
								options={resumeOptions.filter((o) => !selectedResumeIds.includes(o.value))}
								onValueChange={addResume}
								placeholder={t`Add a resume...`}
								searchPlaceholder={t`Search resumes...`}
								emptyMessage={t`No resumes found`}
								disabled={selectedResumeIds.length >= 3 || isLoadingResumes}
								buttonProps={{
									variant: "outline",
									className: "min-w-[200px]",
								}}
							/>

							{/* Selected badges */}
							<AnimatePresence mode="popLayout">
								{selectedResumes.map((resume) => (
									<motion.div
										key={resume.id}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.8 }}
									>
										<Badge variant="secondary" className="gap-1 py-1 pr-1 pl-3">
											{resume.name}
											<Button
												variant="ghost"
												size="icon-sm"
												className="size-5 rounded-full"
												onClick={() => removeResume(resume.id)}
											>
												<XIcon className="size-3" />
											</Button>
										</Badge>
									</motion.div>
								))}
							</AnimatePresence>

							{/* Quick actions */}
							{selectedResumeIds.length >= 2 && (
								<div className="ml-auto flex gap-2">
									<MergeDialog resumes={selectedResumes} metricsArray={metricsArray} />
									<ExportReportButton
										resumes={selectedResumes}
										metricsArray={metricsArray}
										differences={differences}
										recommendations={recommendations}
									/>
								</div>
							)}
						</div>

						{/* Help text */}
						{selectedResumeIds.length === 0 && (
							<Alert className="mt-4">
								<LightbulbIcon className="size-4" />
								<AlertTitle>
									<Trans>Getting Started</Trans>
								</AlertTitle>
								<AlertDescription>
									<Trans>
										Select at least 2 resumes from your collection to start comparing them. You can compare up to 3
										versions at once.
									</Trans>
								</AlertDescription>
							</Alert>
						)}

						{selectedResumeIds.length === 1 && (
							<Alert className="mt-4">
								<WarningCircleIcon className="size-4" />
								<AlertTitle>
									<Trans>Add Another Resume</Trans>
								</AlertTitle>
								<AlertDescription>
									<Trans>Select at least one more resume to enable comparison features.</Trans>
								</AlertDescription>
							</Alert>
						)}
					</CardContent>
				</Card>
			</motion.div>

			{/* Main Comparison View */}
			{selectedResumeIds.length >= 2 && (
				<>
					{/* Tabs Navigation */}
					<motion.div variants={itemVariants}>
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList className="mb-4">
								<TabsTrigger value="overview">
									<MagnifyingGlassIcon className="mr-1.5 size-4" />
									<Trans>Overview</Trans>
								</TabsTrigger>
								<TabsTrigger value="differences">
									<ArrowsLeftRightIcon className="mr-1.5 size-4" />
									<Trans>Differences</Trans>
								</TabsTrigger>
								<TabsTrigger value="skills">
									<ChartBarIcon className="mr-1.5 size-4" />
									<Trans>Skills</Trans>
								</TabsTrigger>
								<TabsTrigger value="recommendations">
									<TargetIcon className="mr-1.5 size-4" />
									<Trans>Recommendations</Trans>
								</TabsTrigger>
							</TabsList>

							{/* Overview Tab */}
							<TabsContent value="overview">
								<div className="space-y-6">
									{/* Side by Side Preview */}
									<div className={cn("grid gap-4", selectedResumes.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3")}>
										{selectedResumes.map((resume, index) => (
											<ResumePreviewCard
												key={resume.id}
												resume={resume}
												metrics={metricsArray[index]}
												onRemove={() => removeResume(resume.id)}
												position={index}
												totalCount={selectedResumes.length}
												onSwap={(dir) => swapResumes(index, dir)}
											/>
										))}
									</div>

									{/* Metrics Comparison Table */}
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center gap-2 text-base">
												<ChartBarIcon className="size-5 text-primary" weight="duotone" />
												<Trans>Metrics Comparison</Trans>
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="overflow-x-auto">
												<table className="w-full text-sm">
													<thead>
														<tr className="border-b">
															<th className="py-2 text-left font-medium">
																<Trans>Metric</Trans>
															</th>
															{selectedResumes.map((r) => (
																<th key={r.id} className="py-2 text-center font-medium">
																	{r.name}
																</th>
															))}
														</tr>
													</thead>
													<tbody>
														<tr className="border-b">
															<td className="py-2 text-muted-foreground">
																<Trans>Word Count</Trans>
															</td>
															{metricsArray.map((m, i) => (
																<td key={i} className="py-2 text-center font-medium">
																	{m.wordCount}
																</td>
															))}
														</tr>
														<tr className="border-b">
															<td className="py-2 text-muted-foreground">
																<Trans>ATS Score</Trans>
															</td>
															{metricsArray.map((m, i) => (
																<td key={i} className="py-2 text-center">
																	<Badge
																		variant={
																			m.atsScore >= 80 ? "default" : m.atsScore >= 60 ? "secondary" : "destructive"
																		}
																	>
																		{m.atsScore}%
																	</Badge>
																</td>
															))}
														</tr>
														<tr className="border-b">
															<td className="py-2 text-muted-foreground">
																<Trans>Skills</Trans>
															</td>
															{metricsArray.map((m, i) => (
																<td key={i} className="py-2 text-center font-medium">
																	{m.skills.length}
																</td>
															))}
														</tr>
														<tr className="border-b">
															<td className="py-2 text-muted-foreground">
																<Trans>Experience Items</Trans>
															</td>
															{metricsArray.map((m, i) => (
																<td key={i} className="py-2 text-center font-medium">
																	{m.experienceCount}
																</td>
															))}
														</tr>
														<tr className="border-b">
															<td className="py-2 text-muted-foreground">
																<Trans>Education Items</Trans>
															</td>
															{metricsArray.map((m, i) => (
																<td key={i} className="py-2 text-center font-medium">
																	{m.educationCount}
																</td>
															))}
														</tr>
														<tr className="border-b">
															<td className="py-2 text-muted-foreground">
																<Trans>Projects</Trans>
															</td>
															{metricsArray.map((m, i) => (
																<td key={i} className="py-2 text-center font-medium">
																	{m.projectCount}
																</td>
															))}
														</tr>
														<tr>
															<td className="py-2 text-muted-foreground">
																<Trans>Certifications</Trans>
															</td>
															{metricsArray.map((m, i) => (
																<td key={i} className="py-2 text-center font-medium">
																	{m.certificationCount}
																</td>
															))}
														</tr>
													</tbody>
												</table>
											</div>
										</CardContent>
									</Card>

									{/* Version Timeline */}
									<VersionTimeline resumes={selectedResumes} />
								</div>
							</TabsContent>

							{/* Differences Tab */}
							<TabsContent value="differences">
								<div className="space-y-4">
									{/* Filter toggle */}
									<div className="flex items-center justify-between">
										<h3 className="font-medium">
											<Trans>Section Differences</Trans>
										</h3>
										<div className="flex items-center gap-2">
											<span className="text-muted-foreground text-sm">
												<Trans>Show only changes</Trans>
											</span>
											<Switch checked={showOnlyChanges} onCheckedChange={setShowOnlyChanges} />
										</div>
									</div>

									<DifferencesView differences={differences} showOnlyChanges={showOnlyChanges} />
								</div>
							</TabsContent>

							{/* Skills Tab */}
							<TabsContent value="skills">
								<SkillsComparisonChart metricsArray={metricsArray} resumes={selectedResumes} />
							</TabsContent>

							{/* Recommendations Tab */}
							<TabsContent value="recommendations">
								<RecommendationsPanel recommendations={recommendations} />
							</TabsContent>
						</Tabs>
					</motion.div>
				</>
			)}

			{/* Empty State */}
			{selectedResumeIds.length === 0 && !isLoadingResumes && (
				<motion.div variants={itemVariants} className="text-center">
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-16">
							<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
								<ScalesIcon className="size-8 text-primary" weight="duotone" />
							</div>
							<h3 className="mb-2 font-semibold text-xl">
								<Trans>Compare Your Resumes</Trans>
							</h3>
							<p className="mb-6 max-w-md text-muted-foreground">
								<Trans>
									Select multiple resume versions to compare them side by side. Identify differences, analyze metrics,
									and get recommendations for which version to use.
								</Trans>
							</p>
							<Link to="/dashboard/resumes">
								<Button variant="outline" className="gap-2">
									<FileTextIcon className="size-4" />
									<Trans>Go to My Resumes</Trans>
								</Button>
							</Link>
						</CardContent>
					</Card>
				</motion.div>
			)}
		</motion.div>
	);
}
