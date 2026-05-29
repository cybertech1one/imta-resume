import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowsSplitIcon, BriefcaseIcon, ChartLineUpIcon, RocketLaunchIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

import {
	HeroSection,
	JobMatchesList,
	JobMatchFormCard,
	PredictedPathsList,
	PredictionFormCard,
	PredictionsEmptyState,
	SelectedTrajectoryDetail,
	TrajectoryGrid,
	WhatIfSimulator,
} from "./-components/predictions-components";
import type { PredictedCareerPath, SimulateInput } from "./-components/predictions-types";

// Lazy load the main component
const CareerPredictionsLazy = lazy(() => Promise.resolve({ default: CareerPredictions }));

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/predictions" as any)({
	component: () => (
		<Suspense
			fallback={
				<div className="flex items-center justify-center p-8">
					<Trans>Loading career predictions...</Trans>
				</div>
			}
		>
			<CareerPredictionsLazy />
		</Suspense>
	),
	errorComponent: ErrorComponent,
});

// Main component — state, queries, mutations, handlers, and layout orchestration
function CareerPredictions() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("predictions");
	const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

	// Prediction form state
	const [currentRole, setCurrentRole] = useState("");
	const [currentField, setCurrentField] = useState("");
	const [yearsExperience, setYearsExperience] = useState([3]);
	const [educationLevel, setEducationLevel] = useState("");
	const [skillsInput, setSkillsInput] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);

	// Job match form state
	const [jobTitle, setJobTitle] = useState("");
	const [company, setCompany] = useState("");
	const [industry, setIndustry] = useState("");
	const [location, setLocation] = useState("");
	const [jobDescription, setJobDescription] = useState("");
	const [requiredSkillsInput, setRequiredSkillsInput] = useState("");

	// Queries
	const { data: latestPrediction, isLoading: isLoadingPrediction } = useQuery({
		...orpc.careerMatcher.getLatestPrediction.queryOptions(),
		enabled: !!session?.user,
	});

	const { data: _predictions = [] } = useQuery({
		...orpc.careerMatcher.listPredictions.queryOptions({ input: { limit: 10 } }),
		enabled: !!session?.user,
	});

	const { data: jobMatches = [] } = useQuery({
		...orpc.careerMatcher.listJobMatchScores.queryOptions({ input: { limit: 20 } }),
		enabled: !!session?.user,
	});

	const { data: trajectories = [] } = useQuery({
		...orpc.careerMatcher.listTrajectories.queryOptions({ input: { limit: 10 } }),
		enabled: !!session?.user,
	});

	const { data: selectedTrajectory } = useQuery({
		...orpc.careerMatcher.getSelectedTrajectory.queryOptions(),
		enabled: !!session?.user,
	});

	const { data: statistics } = useQuery({
		...orpc.careerMatcher.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	// Mutations
	const predictMutation = useMutation(
		orpc.careerMatcher.predictCareerPaths.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerMatcher"] });
				setIsGenerating(false);
			},
			onError: () => {
				setIsGenerating(false);
			},
		}),
	);

	const matchJobMutation = useMutation(
		orpc.careerMatcher.matchToJobs.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerMatcher"] });
				setJobTitle("");
				setCompany("");
				setIndustry("");
				setLocation("");
				setJobDescription("");
				setRequiredSkillsInput("");
			},
		}),
	);

	const simulateMutation = useMutation(
		orpc.careerMatcher.simulateCareerPath.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerMatcher"] });
			},
		}),
	);

	const selectTrajectoryMutation = useMutation(
		orpc.careerMatcher.selectTrajectory.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerMatcher"] });
			},
		}),
	);

	const updateJobMatchMutation = useMutation(
		orpc.careerMatcher.updateJobMatchStatus.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["careerMatcher"] });
			},
		}),
	);

	// Handlers
	const handleGeneratePrediction = useCallback(() => {
		setIsGenerating(true);

		const skills = skillsInput
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		predictMutation.mutate({
			currentRole: currentRole || undefined,
			currentField: currentField || undefined,
			yearsExperience: yearsExperience[0],
			educationLevel: educationLevel || undefined,
			currentSkills: skills.length > 0 ? skills : undefined,
		});
	}, [currentRole, currentField, yearsExperience, educationLevel, skillsInput, predictMutation]);

	const handleMatchJob = useCallback(() => {
		const skills = requiredSkillsInput
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		matchJobMutation.mutate({
			jobTitle,
			company: company || undefined,
			industry: industry || undefined,
			location: location || undefined,
			jobDescription: jobDescription || undefined,
			requiredSkills: skills.length > 0 ? skills : undefined,
		});
	}, [jobTitle, company, industry, location, jobDescription, requiredSkillsInput, matchJobMutation]);

	const handleSimulate = useCallback(
		(input: SimulateInput) => {
			simulateMutation.mutate(input);
		},
		[simulateMutation],
	);

	const handleToggleExpand = useCallback((pathId: string) => {
		setExpandedPaths((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(pathId)) {
				newSet.delete(pathId);
			} else {
				newSet.add(pathId);
			}
			return newSet;
		});
	}, []);

	const handleBookmark = useCallback(
		(id: string, current: boolean | null | undefined) => {
			updateJobMatchMutation.mutate({ id, isBookmarked: !current });
		},
		[updateJobMatchMutation],
	);

	const handleDismiss = useCallback(
		(id: string) => {
			updateJobMatchMutation.mutate({ id, isDismissed: true });
		},
		[updateJobMatchMutation],
	);

	const handleSelectTrajectory = useCallback(
		(id: string) => {
			selectTrajectoryMutation.mutate({ id });
		},
		[selectTrajectoryMutation],
	);

	// Computed values
	const predictedPaths = useMemo(() => {
		if (!latestPrediction?.predictedPaths) return [];
		return latestPrediction.predictedPaths as unknown as PredictedCareerPath[];
	}, [latestPrediction]);

	const topRecommendation = latestPrediction?.topRecommendation;

	// Loading state
	if (isLoadingPrediction) {
		return (
			<>
				<DashboardHeader icon={ChartLineUpIcon} title={t`Career Predictions`} />
				<div className="flex items-center justify-center py-12">
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						className="size-8 rounded-full border-2 border-primary border-t-transparent"
					/>
				</div>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={ChartLineUpIcon} title={t`Career Predictions`} />

			<HeroSection statistics={statistics} />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "predictions", icon: ChartLineUpIcon, label: t`Career Paths` },
						{ value: "jobs", icon: BriefcaseIcon, label: t`Job Matches` },
						{ value: "simulator", icon: ArrowsSplitIcon, label: t`What-If Simulator` },
						{ value: "trajectories", icon: RocketLaunchIcon, label: t`Trajectories` },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				{/* Predictions Tab */}
				<TabsContent value="predictions" className="space-y-8">
					<PredictionFormCard
						currentRole={currentRole}
						setCurrentRole={setCurrentRole}
						currentField={currentField}
						setCurrentField={setCurrentField}
						yearsExperience={yearsExperience}
						setYearsExperience={setYearsExperience}
						educationLevel={educationLevel}
						setEducationLevel={setEducationLevel}
						skillsInput={skillsInput}
						setSkillsInput={setSkillsInput}
						isGenerating={isGenerating}
						onGenerate={handleGeneratePrediction}
					/>

					<PredictedPathsList
						predictedPaths={predictedPaths}
						expandedPaths={expandedPaths}
						onToggleExpand={handleToggleExpand}
						topRecommendation={topRecommendation}
						aiAnalysis={latestPrediction?.aiAnalysis}
					/>

					{predictedPaths.length === 0 && !isGenerating && <PredictionsEmptyState />}
				</TabsContent>

				{/* Jobs Tab */}
				<TabsContent value="jobs" className="space-y-8">
					<JobMatchFormCard
						jobTitle={jobTitle}
						setJobTitle={setJobTitle}
						company={company}
						setCompany={setCompany}
						industry={industry}
						setIndustry={setIndustry}
						location={location}
						setLocation={setLocation}
						jobDescription={jobDescription}
						setJobDescription={setJobDescription}
						requiredSkillsInput={requiredSkillsInput}
						setRequiredSkillsInput={setRequiredSkillsInput}
						isPending={matchJobMutation.isPending}
						onMatch={handleMatchJob}
					/>

					<JobMatchesList jobMatches={jobMatches} onBookmark={handleBookmark} onDismiss={handleDismiss} />
				</TabsContent>

				{/* Simulator Tab */}
				<TabsContent value="simulator" className="space-y-8">
					<WhatIfSimulator onSimulate={handleSimulate} isSimulating={simulateMutation.isPending} />

					<TrajectoryGrid
						trajectories={trajectories}
						selectedTrajectoryId={selectedTrajectory?.id}
						onSelect={handleSelectTrajectory}
						title="simulated"
					/>
				</TabsContent>

				{/* Trajectories Tab */}
				<TabsContent value="trajectories" className="space-y-8">
					<SelectedTrajectoryDetail
						selectedTrajectory={selectedTrajectory}
						onOpenSimulator={() => setActiveTab("simulator")}
					/>

					<TrajectoryGrid
						trajectories={trajectories}
						selectedTrajectoryId={selectedTrajectory?.id}
						onSelect={handleSelectTrajectory}
						title="all"
					/>
				</TabsContent>
			</Tabs>
		</>
	);
}
