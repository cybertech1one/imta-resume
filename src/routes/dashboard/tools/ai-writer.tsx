import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { MagicWandIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/integrations/auth/client";
import type {
	AiWriterBulletPoint,
	AiWriterGrammarIssue,
	AiWriterIndustry,
	AiWriterSkillExtraction,
	AiWriterTone,
} from "@/integrations/drizzle/schema";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import { HeroSection, ProTipsSection, ToolContent, ToolsGrid } from "./-components/ai-writer-components";
import { industryTerms } from "./-components/ai-writer-config";

// Lazy load the AI writer component
const AIWriterLazy = lazy(() => Promise.resolve({ default: AIWriter }));

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/ai-writer" as any)({
	component: () => (
		<Suspense
			fallback={
				<div className="space-y-8 p-6">
					<div className="space-y-2">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-72" />
					</div>
					<div className="grid gap-4 md:grid-cols-3">
						<Skeleton className="h-24 rounded-lg" />
						<Skeleton className="h-24 rounded-lg" />
						<Skeleton className="h-24 rounded-lg" />
					</div>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-20 rounded-lg" />
						))}
					</div>
					<div className="space-y-4">
						<Skeleton className="h-10 w-full rounded-lg" />
						<Skeleton className="h-32 w-full rounded-lg" />
					</div>
					<span className="sr-only">
						<Trans>Loading AI writer...</Trans>
					</span>
				</div>
			}
		>
			<AIWriterLazy />
		</Suspense>
	),
	errorComponent: ErrorComponent,
});

// Main Component
function AIWriter() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("bullet-generator");

	// Bullet Generator State
	const [bulletInput, setBulletInput] = useState("");
	const [bulletTone, setBulletTone] = useState<AiWriterTone>("professional");
	const [generatedBullets, setGeneratedBullets] = useState<AiWriterBulletPoint[]>([]);

	// Summary Writer State
	const [summaryInput, setSummaryInput] = useState("");
	const [summaryTone, setSummaryTone] = useState<AiWriterTone>("professional");
	const [summaryExperience, setSummaryExperience] = useState([5]);
	const [generatedSummary, setGeneratedSummary] = useState("");

	// Achievement Quantifier State
	const [achievementInput, setAchievementInput] = useState("");
	const [quantifiedAchievement, setQuantifiedAchievement] = useState("");

	// Action Verbs State
	const [selectedVerbCategory, setSelectedVerbCategory] = useState<string>("leadership");

	// Skills Extractor State
	const [jobPostingInput, setJobPostingInput] = useState("");
	const [extractedSkills, setExtractedSkills] = useState<AiWriterSkillExtraction | null>(null);

	// Cover Letter State
	const [coverJobTitle, setCoverJobTitle] = useState("");
	const [coverCompany, setCoverCompany] = useState("");
	const [coverSkills, setCoverSkills] = useState("");
	const [coverTone, setCoverTone] = useState<AiWriterTone>("professional");
	const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");

	// LinkedIn Optimizer State
	const [linkedinInput, setLinkedinInput] = useState("");
	const [linkedinOptimized, setLinkedinOptimized] = useState("");
	const [linkedinKeywords, setLinkedinKeywords] = useState<string[]>([]);

	// Industry Language State
	const [selectedIndustry, setSelectedIndustry] = useState<AiWriterIndustry>("general");

	// Grammar Checker State
	const [grammarInput, setGrammarInput] = useState("");
	const [grammarIssues, setGrammarIssues] = useState<AiWriterGrammarIssue[]>([]);

	// Comparison View State
	const [comparisonOriginal, setComparisonOriginal] = useState("");
	const [comparisonImproved, setComparisonImproved] = useState("");
	const [showComparison, setShowComparison] = useState(false);

	// Query for statistics
	const { data: statistics } = useQuery({
		...orpc.aiWriter.getStatistics.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	// Mutations
	const generateBulletsMutation = useMutation(
		orpc.aiWriter.generateBulletPoints.mutationOptions({
			onSuccess: (data) => {
				setGeneratedBullets(data.bulletPoints);
				toast.success(t`Bullet points generated successfully`);
				queryClient.invalidateQueries({ queryKey: orpc.aiWriter.list.key() });
				queryClient.invalidateQueries({ queryKey: orpc.aiWriter.getStatistics.key() });
			},
			onError: () => {
				toast.error(t`Error during generation`);
			},
		}),
	);

	const generateSummaryMutation = useMutation(
		orpc.aiWriter.generateSummary.mutationOptions({
			onSuccess: (data) => {
				setGeneratedSummary(data.summary);
				toast.success(t`Summary generated successfully`);
				queryClient.invalidateQueries({ queryKey: orpc.aiWriter.list.key() });
				queryClient.invalidateQueries({ queryKey: orpc.aiWriter.getStatistics.key() });
			},
			onError: () => {
				toast.error(t`Error during generation`);
			},
		}),
	);

	const quantifyAchievementMutation = useMutation(
		orpc.aiWriter.quantifyAchievement.mutationOptions({
			onSuccess: (data) => {
				setQuantifiedAchievement(data.quantified);
				toast.success(t`Achievement quantified`);
				queryClient.invalidateQueries({ queryKey: orpc.aiWriter.list.key() });
				queryClient.invalidateQueries({ queryKey: orpc.aiWriter.getStatistics.key() });
			},
			onError: () => {
				toast.error(t`Error during quantification`);
			},
		}),
	);

	const extractSkillsMutation = useMutation(
		orpc.aiWriter.extractSkills.mutationOptions({
			onSuccess: (data) => {
				setExtractedSkills(data.skills);
				toast.success(t`Skills extracted successfully`);
				queryClient.invalidateQueries({ queryKey: orpc.aiWriter.list.key() });
				queryClient.invalidateQueries({ queryKey: orpc.aiWriter.getStatistics.key() });
			},
			onError: () => {
				toast.error(t`Error during extraction`);
			},
		}),
	);

	const generateCoverLetterMutation = useMutation(
		orpc.aiWriter.generateCoverLetter.mutationOptions({
			onSuccess: (data) => {
				setGeneratedCoverLetter(data.coverLetter);
				toast.success(t`Cover letter generated`);
				queryClient.invalidateQueries({ queryKey: orpc.aiWriter.list.key() });
				queryClient.invalidateQueries({ queryKey: orpc.aiWriter.getStatistics.key() });
			},
			onError: () => {
				toast.error(t`Error during generation`);
			},
		}),
	);

	const optimizeLinkedInMutation = useMutation(
		orpc.aiWriter.optimizeLinkedIn.mutationOptions({
			onSuccess: (data) => {
				setLinkedinOptimized(data.optimized);
				setLinkedinKeywords(data.keywords);
				toast.success(t`LinkedIn summary optimized`);
				queryClient.invalidateQueries({ queryKey: orpc.aiWriter.list.key() });
				queryClient.invalidateQueries({ queryKey: orpc.aiWriter.getStatistics.key() });
			},
			onError: () => {
				toast.error(t`Error during optimization`);
			},
		}),
	);

	const checkGrammarMutation = useMutation(
		orpc.aiWriter.checkGrammar.mutationOptions({
			onSuccess: (data) => {
				setGrammarIssues(data);
				if (data.length === 0) {
					toast.success(t`No issues detected!`);
				} else {
					toast.info(t`${data.length} improvement suggestions found`);
				}
			},
			onError: () => {
				toast.error(t`Error during verification`);
			},
		}),
	);

	// Handlers
	const handleGenerateBullets = useCallback(async () => {
		if (!bulletInput.trim()) {
			toast.error(t`Please enter a job description`);
			return;
		}
		generateBulletsMutation.mutate({
			description: bulletInput,
			tone: bulletTone,
			save: true,
		});
	}, [bulletInput, bulletTone, generateBulletsMutation]);

	const handleGenerateSummary = useCallback(async () => {
		if (!summaryInput.trim()) {
			toast.error(t`Please describe your area of expertise`);
			return;
		}
		generateSummaryMutation.mutate({
			expertise: summaryInput,
			tone: summaryTone,
			experienceYears: summaryExperience[0],
			save: true,
		});
	}, [summaryInput, summaryTone, summaryExperience, generateSummaryMutation]);

	const handleQuantifyAchievement = useCallback(async () => {
		if (!achievementInput.trim()) {
			toast.error(t`Please enter an achievement to quantify`);
			return;
		}
		quantifyAchievementMutation.mutate({
			achievement: achievementInput,
			save: true,
		});
	}, [achievementInput, quantifyAchievementMutation]);

	const handleExtractSkills = useCallback(async () => {
		if (!jobPostingInput.trim()) {
			toast.error(t`Please paste a job posting`);
			return;
		}
		extractSkillsMutation.mutate({
			jobPosting: jobPostingInput,
			save: true,
		});
	}, [jobPostingInput, extractSkillsMutation]);

	const handleGenerateCoverLetter = useCallback(async () => {
		if (!coverJobTitle.trim() || !coverCompany.trim()) {
			toast.error(t`Please fill in all required fields`);
			return;
		}
		const skills = coverSkills
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		generateCoverLetterMutation.mutate({
			jobTitle: coverJobTitle,
			companyName: coverCompany,
			skills,
			tone: coverTone,
			save: true,
		});
	}, [coverJobTitle, coverCompany, coverSkills, coverTone, generateCoverLetterMutation]);

	const handleOptimizeLinkedIn = useCallback(async () => {
		if (!linkedinInput.trim()) {
			toast.error(t`Please enter your current summary`);
			return;
		}
		optimizeLinkedInMutation.mutate({
			summary: linkedinInput,
			save: true,
		});
	}, [linkedinInput, optimizeLinkedInMutation]);

	const handleCheckGrammar = useCallback(async () => {
		if (!grammarInput.trim()) {
			toast.error(t`Please enter text to check`);
			return;
		}
		checkGrammarMutation.mutate({
			text: grammarInput,
		});
	}, [grammarInput, checkGrammarMutation]);

	const handleCompare = useCallback(() => {
		if (comparisonOriginal.trim() && comparisonImproved.trim()) {
			setShowComparison(true);
		} else {
			toast.error(t`Please fill in both fields`);
		}
	}, [comparisonOriginal, comparisonImproved]);

	const copyToClipboard = useCallback((text: string) => {
		navigator.clipboard.writeText(text);
		toast.success(t`Copied to clipboard`);
	}, []);

	// Get current industry terms
	const currentIndustryTerms = useMemo(() => industryTerms[selectedIndustry], [selectedIndustry]);

	// Check if any mutation is pending
	const isProcessing =
		generateBulletsMutation.isPending ||
		generateSummaryMutation.isPending ||
		quantifyAchievementMutation.isPending ||
		extractSkillsMutation.isPending ||
		generateCoverLetterMutation.isPending ||
		optimizeLinkedInMutation.isPending ||
		checkGrammarMutation.isPending;

	return (
		<>
			<DashboardHeader icon={MagicWandIcon} title={t`AI Resume Writer`} />

			<HeroSection statisticsTotal={statistics?.total ?? 0} />

			<ToolsGrid activeTab={activeTab} setActiveTab={setActiveTab} />

			<ToolContent
				activeTab={activeTab}
				bulletGeneratorProps={{
					bulletInput,
					setBulletInput,
					bulletTone,
					setBulletTone,
					generatedBullets,
					isPending: generateBulletsMutation.isPending,
					isProcessing,
					onGenerate: handleGenerateBullets,
					copyToClipboard,
				}}
				summaryWriterProps={{
					summaryInput,
					setSummaryInput,
					summaryTone,
					setSummaryTone,
					summaryExperience,
					setSummaryExperience,
					generatedSummary,
					isPending: generateSummaryMutation.isPending,
					isProcessing,
					onGenerate: handleGenerateSummary,
					copyToClipboard,
				}}
				achievementQuantifierProps={{
					achievementInput,
					setAchievementInput,
					quantifiedAchievement,
					isPending: quantifyAchievementMutation.isPending,
					isProcessing,
					onQuantify: handleQuantifyAchievement,
					copyToClipboard,
				}}
				actionVerbsProps={{
					selectedVerbCategory,
					setSelectedVerbCategory,
					copyToClipboard,
				}}
				skillsExtractorProps={{
					jobPostingInput,
					setJobPostingInput,
					extractedSkills,
					isPending: extractSkillsMutation.isPending,
					isProcessing,
					onExtract: handleExtractSkills,
					copyToClipboard,
				}}
				coverLetterProps={{
					coverJobTitle,
					setCoverJobTitle,
					coverCompany,
					setCoverCompany,
					coverSkills,
					setCoverSkills,
					coverTone,
					setCoverTone,
					generatedCoverLetter,
					isPending: generateCoverLetterMutation.isPending,
					isProcessing,
					onGenerate: handleGenerateCoverLetter,
					copyToClipboard,
				}}
				linkedInOptimizerProps={{
					linkedinInput,
					setLinkedinInput,
					linkedinOptimized,
					linkedinKeywords,
					isPending: optimizeLinkedInMutation.isPending,
					isProcessing,
					onOptimize: handleOptimizeLinkedIn,
					copyToClipboard,
				}}
				industryLanguageProps={{
					selectedIndustry,
					setSelectedIndustry,
					currentIndustryTerms,
					copyToClipboard,
				}}
				grammarCheckerProps={{
					grammarInput,
					setGrammarInput,
					grammarIssues,
					isPending: checkGrammarMutation.isPending,
					isProcessing,
					onCheck: handleCheckGrammar,
					copyToClipboard,
				}}
				comparisonViewProps={{
					comparisonOriginal,
					setComparisonOriginal,
					comparisonImproved,
					setComparisonImproved,
					showComparison,
					setShowComparison,
					onCompare: handleCompare,
				}}
			/>

			<ProTipsSection />
		</>
	);
}
