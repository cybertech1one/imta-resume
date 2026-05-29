import { t } from "@lingui/core/macro";
import {
	ArrowsClockwiseIcon,
	CameraIcon,
	ChatCircleIcon,
	ClipboardTextIcon,
	DownloadSimpleIcon,
	LinkedinLogoIcon,
	MagnifyingGlassIcon,
	PencilSimpleIcon,
	SpinnerIcon,
	StarIcon,
	TargetIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	ComparisonTab,
	ConnectionsTab,
	EngagementTab,
	ExportTab,
	HeadlineTab,
	HeroSection,
	IndustrySelector,
	KeywordsTab,
	PhotoTab,
	ScoreTab,
	SkillsTab,
	SummaryTab,
	TipsFooter,
} from "./-components/linkedin-components";
import type { Industry } from "./-components/linkedin-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/linkedin" as any)({
	component: LinkedInOptimizer,
	errorComponent: ErrorComponent,
});

function LinkedInOptimizer() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("score");

	// Fetch LinkedIn profile data
	const { data: profile, isLoading: isLoadingProfile } = useQuery({
		...orpc.linkedin.getProfile.queryOptions(),
		enabled: !!session?.user,
		staleTime: 5 * 60 * 1000,
	});

	// Fetch industries list
	const { data: industries = [] } = useQuery({
		...orpc.linkedin.getIndustries.queryOptions(),
		enabled: !!session?.user,
		staleTime: 5 * 60 * 1000,
	});

	// Local state for form inputs (synced with profile)
	const selectedIndustry = (profile?.industry ?? "general") as Industry;
	const currentRole = profile?.currentRole ?? "";
	const currentHeadline = profile?.currentHeadline ?? "";
	const currentSummary = profile?.currentSummary ?? "";
	const yearsExperience = String(profile?.yearsExperience ?? 5);
	const hasProfilePhoto = profile?.hasProfilePhoto ?? true;
	const skillsCount = String(profile?.skillsCount ?? 10);
	const experienceCount = String(profile?.experienceCount ?? 3);
	const connectionsCount = String(profile?.connectionsCount ?? 200);
	const photoTips = profile?.photoTips ?? [];
	const checklist = profile?.checklist ?? [];
	const headlineSuggestions = profile?.headlineSuggestions ?? [];
	const summarySuggestions = profile?.summarySuggestions ?? [];

	// Update profile mutation
	const updateProfileMutation = useMutation(
		orpc.linkedin.updateProfile.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: orpc.linkedin.getProfile.queryKey() });
			},
		}),
	);

	// Toggle photo tip mutation
	const togglePhotoTipMutation = useMutation(
		orpc.linkedin.togglePhotoTip.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: orpc.linkedin.getProfile.queryKey() });
			},
		}),
	);

	// Generate headlines mutation
	const generateHeadlinesMutation = useMutation(
		orpc.linkedin.generateHeadlines.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: orpc.linkedin.getProfile.queryKey() });
				toast.success(t`Title suggestions generated`);
			},
			onError: () => {
				toast.error(t`Error during generation`);
			},
		}),
	);

	// Generate summaries mutation
	const generateSummariesMutation = useMutation(
		orpc.linkedin.generateSummaries.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: orpc.linkedin.getProfile.queryKey() });
				toast.success(t`Summary suggestions generated`);
			},
			onError: () => {
				toast.error(t`Error during generation`);
			},
		}),
	);

	// Generate checklist mutation
	const generateChecklistMutation = useMutation(
		orpc.linkedin.generateChecklist.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: orpc.linkedin.getProfile.queryKey() });
				toast.success(t`Checklist generated`);
			},
		}),
	);

	// Fetch keywords for selected industry
	const { data: keywordOptimizations = [] } = useQuery({
		...orpc.linkedin.getIndustryKeywords.queryOptions({
			input: { industry: selectedIndustry },
		}),
		enabled: !!session?.user,
		staleTime: 5 * 60 * 1000,
	});

	// Fetch skill recommendations for selected industry
	const { data: recommendedSkills = [] } = useQuery({
		...orpc.linkedin.getIndustrySkills.queryOptions({
			input: { industry: selectedIndustry },
		}),
		enabled: !!session?.user,
		staleTime: 5 * 60 * 1000,
	});

	// Fetch connection strategies
	const { data: connectionStrategies = [] } = useQuery({
		...orpc.linkedin.getConnectionStrategies.queryOptions(),
		enabled: !!session?.user,
		staleTime: 5 * 60 * 1000,
	});

	// Fetch engagement tips
	const { data: engagementTipsData = [] } = useQuery({
		...orpc.linkedin.getEngagementTips.queryOptions(),
		enabled: !!session?.user,
		staleTime: 5 * 60 * 1000,
	});

	// Calculate profile score
	const profileScore = useMemo(() => {
		if (!profile) {
			return {
				overall: 0,
				photo: 0,
				headline: 0,
				summary: 0,
				experience: 0,
				skills: 0,
				connections: 0,
				engagement: 60,
			};
		}

		const photo = profile.hasProfilePhoto ? 100 : 0;
		const headline = Math.min(100, ((profile.currentHeadline?.length ?? 0) / 120) * 100);
		const summary = Math.min(100, ((profile.currentSummary?.length ?? 0) / 2000) * 100);
		const skills = Math.min(100, (profile.skillsCount / 50) * 100);
		const experience = Math.min(100, (profile.experienceCount / 5) * 100);
		const connections = Math.min(100, (profile.connectionsCount / 500) * 100);
		const engagement = 60;

		const overall = Math.round((photo + headline + summary + skills + experience + connections + engagement) / 7);

		return {
			overall,
			photo,
			headline: Math.round(headline),
			summary: Math.round(summary),
			experience: Math.round(experience),
			skills: Math.round(skills),
			connections: Math.round(connections),
			engagement,
		};
	}, [profile]);

	// Score chart data
	const scoreChartData = useMemo(
		() => [{ name: "Score", value: profileScore.overall, fill: profileScore.overall >= 70 ? "#22c55e" : "#f59e0b" }],
		[profileScore.overall],
	);

	const detailedScoreData = useMemo(
		() => [
			{ name: "Photo", value: profileScore.photo, fill: "#3b82f6" },
			{ name: "Headline", value: profileScore.headline, fill: "#8b5cf6" },
			{ name: "Summary", value: profileScore.summary, fill: "#06b6d4" },
			{ name: "Experience", value: profileScore.experience, fill: "#10b981" },
			{ name: "Skills", value: profileScore.skills, fill: "#f59e0b" },
			{ name: "Connections", value: profileScore.connections, fill: "#ec4899" },
			{ name: "Engagement", value: profileScore.engagement, fill: "#6366f1" },
		],
		[profileScore],
	);

	// Handler for updating profile fields
	const handleUpdateField = useCallback(
		(field: string, value: string | number | boolean) => {
			updateProfileMutation.mutate({ [field]: value });
		},
		[updateProfileMutation],
	);

	// Toggle photo tip
	const togglePhotoTip = useCallback(
		(tipId: string) => {
			togglePhotoTipMutation.mutate({ tipId });
		},
		[togglePhotoTipMutation],
	);

	// Generate headline suggestions
	const handleGenerateHeadlines = useCallback(() => {
		generateHeadlinesMutation.mutate({
			currentRole,
			industry: selectedIndustry,
		});
	}, [currentRole, selectedIndustry, generateHeadlinesMutation]);

	// Generate summary suggestions
	const handleGenerateSummary = useCallback(() => {
		generateSummariesMutation.mutate({
			currentRole,
			industry: selectedIndustry,
			yearsExperience: Number.parseInt(yearsExperience, 10) || 5,
		});
	}, [currentRole, selectedIndustry, yearsExperience, generateSummariesMutation]);

	// Copy to clipboard
	const copyToClipboard = useCallback((text: string) => {
		navigator.clipboard.writeText(text);
		toast.success(t`Copied to clipboard`);
	}, []);

	// Generate checklist
	const generateChecklist = useCallback(() => {
		generateChecklistMutation.mutate({});
	}, [generateChecklistMutation]);

	// Export checklist as text
	const exportChecklist = useCallback(() => {
		const categories = [...new Set(checklist.map((item) => item.category))];
		let text = "=== LINKEDIN OPTIMIZATION CHECKLIST ===\n\n";

		for (const category of categories) {
			text += `## ${category}\n`;
			const categoryItems = checklist.filter((item) => item.category === category);
			for (const item of categoryItems) {
				text += `${item.completed ? "[x]" : "[ ]"} ${item.item} (Priority: ${item.priority})\n`;
			}
			text += "\n";
		}

		const blob = new Blob([text], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "linkedin-checklist.txt";
		a.click();
		URL.revokeObjectURL(url);
		toast.success(t`Checklist exported`);
	}, [checklist]);

	const isProcessing =
		generateHeadlinesMutation.isPending || generateSummariesMutation.isPending || generateChecklistMutation.isPending;

	const selectedIndustryLabel = industries.find((i) => i.value === selectedIndustry)?.label ?? selectedIndustry;

	if (isLoadingProfile) {
		return (
			<>
				<DashboardHeader icon={LinkedinLogoIcon} title={t`LinkedIn Profile Optimizer`} />
				<div className="flex items-center justify-center py-20">
					<SpinnerIcon className="size-8 animate-spin text-primary" />
				</div>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={LinkedinLogoIcon} title={t`LinkedIn Profile Optimizer`} />

			<HeroSection />

			<IndustrySelector selectedIndustry={selectedIndustry} industries={industries} onUpdateField={handleUpdateField} />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "score", icon: TargetIcon, label: t`Score` },
						{ value: "headline", icon: PencilSimpleIcon, label: t`Headline` },
						{ value: "summary", icon: ClipboardTextIcon, label: t`Summary` },
						{ value: "skills", icon: StarIcon, label: t`Skills` },
						{ value: "photo", icon: CameraIcon, label: t`Photo` },
						{ value: "connections", icon: UsersIcon, label: t`Connections` },
						{ value: "engagement", icon: ChatCircleIcon, label: t`Engagement` },
						{ value: "keywords", icon: MagnifyingGlassIcon, label: t`Keywords` },
						{ value: "comparison", icon: ArrowsClockwiseIcon, label: t`Before/After` },
						{ value: "export", icon: DownloadSimpleIcon, label: t`Export` },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							<span className="hidden sm:inline">{tab.label}</span>
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="score" className="space-y-8">
					<ScoreTab
						profileScore={profileScore}
						scoreChartData={scoreChartData}
						detailedScoreData={detailedScoreData}
						currentRole={currentRole}
						currentHeadline={currentHeadline}
						currentSummary={currentSummary}
						yearsExperience={yearsExperience}
						skillsCount={skillsCount}
						experienceCount={experienceCount}
						connectionsCount={connectionsCount}
						hasProfilePhoto={hasProfilePhoto}
						onUpdateField={handleUpdateField}
					/>
				</TabsContent>

				<TabsContent value="headline" className="space-y-8">
					<HeadlineTab
						headlineSuggestions={headlineSuggestions}
						isProcessing={isProcessing}
						isPending={generateHeadlinesMutation.isPending}
						onGenerate={handleGenerateHeadlines}
						onCopy={copyToClipboard}
					/>
				</TabsContent>

				<TabsContent value="summary" className="space-y-8">
					<SummaryTab
						summarySuggestions={summarySuggestions}
						isProcessing={isProcessing}
						isPending={generateSummariesMutation.isPending}
						onGenerate={handleGenerateSummary}
						onCopy={copyToClipboard}
					/>
				</TabsContent>

				<TabsContent value="skills" className="space-y-8">
					<SkillsTab recommendedSkills={recommendedSkills} selectedIndustryLabel={selectedIndustryLabel} />
				</TabsContent>

				<TabsContent value="photo" className="space-y-8">
					<PhotoTab photoTips={photoTips} onToggleTip={togglePhotoTip} />
				</TabsContent>

				<TabsContent value="connections" className="space-y-8">
					<ConnectionsTab connectionStrategies={connectionStrategies} />
				</TabsContent>

				<TabsContent value="engagement" className="space-y-8">
					<EngagementTab engagementTips={engagementTipsData} />
				</TabsContent>

				<TabsContent value="keywords" className="space-y-8">
					<KeywordsTab keywordOptimizations={keywordOptimizations} selectedIndustryLabel={selectedIndustryLabel} />
				</TabsContent>

				<TabsContent value="comparison" className="space-y-8">
					<ComparisonTab
						currentHeadline={currentHeadline}
						currentSummary={currentSummary}
						skillsCount={skillsCount}
						profileScore={profileScore}
						headlineSuggestions={headlineSuggestions}
						summarySuggestions={summarySuggestions}
						recommendedSkills={recommendedSkills}
					/>
				</TabsContent>

				<TabsContent value="export" className="space-y-8">
					<ExportTab
						checklist={checklist}
						isPending={generateChecklistMutation.isPending}
						onGenerateChecklist={generateChecklist}
						onExportChecklist={exportChecklist}
					/>
				</TabsContent>
			</Tabs>

			<TipsFooter onViewScore={() => setActiveTab("score")} />
		</>
	);
}
