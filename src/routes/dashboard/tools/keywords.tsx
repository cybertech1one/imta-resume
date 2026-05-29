import { t } from "@lingui/core/macro";
import { ArrowsClockwiseIcon, ChartBarIcon, MagnifyingGlassIcon, TagIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	AnalysisPlaceholder,
	AnalysisResultsPanel,
	AnalyzerInputForm,
	ComparisonTabContent,
	DensityTabContent,
	DetailedAnalysisSections,
	KeywordCloudTabContent,
	KeywordsHeroSection,
	KeywordsTipsSection,
} from "./-components/keywords-components";
import { analyzeKeywords, CHART_COLORS, PIE_COLORS } from "./-components/keywords-config";
import type { AnalysisResult, BeforeAfterComparison, Industry } from "./-components/keywords-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/keywords" as any)({
	component: KeywordsOptimizer,
	errorComponent: ErrorComponent,
});

function KeywordsOptimizer() {
	const { data: session } = authClient.useSession();
	const [activeTab, setActiveTab] = useState("analyzer");
	const [jobDescription, setJobDescription] = useState("");
	const [resumeContent, setResumeContent] = useState("");
	const [selectedResumeId, setSelectedResumeId] = useState<string>("");
	const [selectedIndustry, setSelectedIndustry] = useState<Industry>("technology");
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["technical"]));
	const [comparison, setComparison] = useState<BeforeAfterComparison | null>(null);

	// Fetch user's resumes
	const { data: resumes, isLoading: isLoadingResumes } = useQuery({
		...orpc.resume.list.queryOptions({ input: { tags: [], sort: "lastUpdatedAt" } }),
		enabled: !!session?.user,
	});

	// Fetch selected resume data
	const { data: selectedResumeData } = useQuery({
		...orpc.resume.getById.queryOptions({ input: { id: selectedResumeId } }),
		enabled: !!session?.user && !!selectedResumeId,
	});

	// Extract resume text when selected
	const extractedResumeText = useMemo(() => {
		if (!selectedResumeData) return "";
		const sections = selectedResumeData.data.sections;
		const parts: string[] = [];

		if (selectedResumeData.data.summary?.content) {
			parts.push(selectedResumeData.data.summary.content);
		}

		if (sections.skills?.items) {
			parts.push(sections.skills.items.map((s) => `${s.name} ${s.keywords?.join(" ") || ""}`).join(" "));
		}

		if (sections.experience?.items) {
			parts.push(sections.experience.items.map((e) => `${e.position} ${e.company} ${e.description || ""}`).join(" "));
		}

		if (sections.education?.items) {
			parts.push(sections.education.items.map((e) => `${e.degree} ${e.school} ${e.description || ""}`).join(" "));
		}

		if (sections.certifications?.items) {
			parts.push(sections.certifications.items.map((c) => `${c.title} ${c.issuer || ""}`).join(" "));
		}

		return parts.join(" ");
	}, [selectedResumeData]);

	// Update resume content when extracted
	const effectiveResumeContent = resumeContent || extractedResumeText;

	// Handle analysis
	const handleAnalyze = useCallback(async () => {
		if (!jobDescription.trim()) {
			toast.error(t`Please enter a job description`);
			return;
		}
		if (!effectiveResumeContent.trim()) {
			toast.error(t`Please enter your resume content or select a resume`);
			return;
		}

		setIsAnalyzing(true);
		try {
			// Simulate AI processing
			await new Promise((resolve) => setTimeout(resolve, 1500));

			const result = analyzeKeywords(jobDescription, effectiveResumeContent, selectedIndustry);
			setAnalysisResult(result);

			// Set up comparison data
			setComparison({
				before: {
					text: `${effectiveResumeContent.substring(0, 500)}...`,
					score: Math.max(0, result.matchPercentage - 25),
					matchedCount: Math.floor(result.matchedKeywords.length * 0.6),
				},
				after: {
					text: `${effectiveResumeContent.substring(0, 500)}...`,
					score: result.matchPercentage,
					matchedCount: result.matchedKeywords.length,
				},
			});

			toast.success(t`Analysis completed successfully`);
		} catch (error) {
			toast.error(t`Error during analysis`);
			console.error(error);
		} finally {
			setIsAnalyzing(false);
		}
	}, [jobDescription, effectiveResumeContent, selectedIndustry]);

	// Handle reset
	const handleReset = useCallback(() => {
		setJobDescription("");
		setResumeContent("");
		setSelectedResumeId("");
		setAnalysisResult(null);
		setComparison(null);
	}, []);

	// Toggle category expansion
	const toggleCategory = useCallback((category: string) => {
		setExpandedCategories((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(category)) {
				newSet.delete(category);
			} else {
				newSet.add(category);
			}
			return newSet;
		});
	}, []);

	// Copy keywords to clipboard
	const copyKeywords = useCallback((keywords: string[]) => {
		navigator.clipboard.writeText(keywords.join(", "));
		toast.success(t`Keywords copied to clipboard`);
	}, []);

	// Prepare chart data
	const scoreChartData = useMemo(() => {
		if (!analysisResult) return [];
		return [
			{ name: t`Tech`, value: analysisResult.scoreBreakdown.technicalSkills, fill: CHART_COLORS.technical },
			{ name: t`Soft Skills`, value: analysisResult.scoreBreakdown.softSkills, fill: CHART_COLORS.soft },
			{ name: t`Certs`, value: analysisResult.scoreBreakdown.certifications, fill: CHART_COLORS.certification },
			{ name: t`Industry`, value: analysisResult.scoreBreakdown.industryTerms, fill: CHART_COLORS.industry },
		];
	}, [analysisResult]);

	const keywordCategoryData = useMemo(() => {
		if (!analysisResult) return [];
		const categories = ["technical", "soft", "certification"];
		return categories.map((cat, index) => ({
			name: cat === "technical" ? t`Technical` : cat === "soft" ? t`Soft Skills` : t`Certifications`,
			matched: analysisResult.matchedKeywords.filter((k) => k.category === cat).length,
			missing: analysisResult.missingKeywords.filter((k) => k.category === cat).length,
			fill: PIE_COLORS[index],
		}));
	}, [analysisResult]);

	const industries: { value: Industry; label: string }[] = [
		{ value: "technology", label: t`Technology / IT` },
		{ value: "healthcare", label: t`Healthcare` },
		{ value: "finance", label: t`Finance / Banking` },
		{ value: "marketing", label: t`Marketing / Communications` },
		{ value: "engineering", label: t`Engineering` },
		{ value: "education", label: t`Education` },
		{ value: "industrial", label: t`Industry` },
		{ value: "general", label: t`General` },
	];

	return (
		<>
			<DashboardHeader icon={TagIcon} title={t`Keyword Optimizer`} />

			<KeywordsHeroSection />

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "analyzer", icon: MagnifyingGlassIcon, label: t`Analyzer` },
						{ value: "density", icon: ChartBarIcon, label: t`Density` },
						{ value: "cloud", icon: TagIcon, label: t`Word cloud` },
						{ value: "comparison", icon: ArrowsClockwiseIcon, label: t`Before/After` },
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

				{/* Analyzer Tab */}
				<TabsContent value="analyzer" className="space-y-8">
					<div className="grid gap-8 lg:grid-cols-2">
						<AnalyzerInputForm
							selectedIndustry={selectedIndustry}
							setSelectedIndustry={setSelectedIndustry}
							industries={industries}
							jobDescription={jobDescription}
							setJobDescription={setJobDescription}
							selectedResumeId={selectedResumeId}
							setSelectedResumeId={setSelectedResumeId}
							isLoadingResumes={isLoadingResumes}
							resumes={resumes}
							resumeContent={resumeContent}
							setResumeContent={setResumeContent}
							isAnalyzing={isAnalyzing}
							effectiveResumeContent={effectiveResumeContent}
							handleAnalyze={handleAnalyze}
							handleReset={handleReset}
						/>

						{/* Results Display */}
						{analysisResult ? (
							<AnalysisResultsPanel analysisResult={analysisResult} scoreChartData={scoreChartData} />
						) : (
							<AnalysisPlaceholder />
						)}
					</div>

					{/* Detailed Analysis Sections */}
					{analysisResult && <DetailedAnalysisSections analysisResult={analysisResult} copyKeywords={copyKeywords} />}
				</TabsContent>

				{/* Density Tab */}
				<TabsContent value="density" className="space-y-8">
					<DensityTabContent analysisResult={analysisResult} setActiveTab={setActiveTab} />
				</TabsContent>

				{/* Keyword Cloud Tab */}
				<TabsContent value="cloud" className="space-y-8">
					<KeywordCloudTabContent
						analysisResult={analysisResult}
						keywordCategoryData={keywordCategoryData}
						expandedCategories={expandedCategories}
						toggleCategory={toggleCategory}
						copyKeywords={copyKeywords}
						setActiveTab={setActiveTab}
					/>
				</TabsContent>

				{/* Before/After Comparison Tab */}
				<TabsContent value="comparison" className="space-y-8">
					<ComparisonTabContent
						comparison={comparison}
						analysisResult={analysisResult}
						selectedResumeId={selectedResumeId}
						setActiveTab={setActiveTab}
					/>
				</TabsContent>
			</Tabs>

			<KeywordsTipsSection />
		</>
	);
}
