import { t } from "@lingui/core/macro";
import { EnvelopeIcon, EyeIcon, FileTextIcon, MagicWandIcon, TargetIcon } from "@phosphor-icons/react";
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
	AnalysisTab,
	ErrorState,
	GenerateTab,
	HeroSection,
	PreviewTab,
	SavedLettersTab,
	TipsSection,
} from "./-components/cover-letter-components";
import { extractKeywords, generateCoverLetter } from "./-components/cover-letter-config";
import type {
	CoverLetterData,
	DbCoverLetter,
	JobDetails,
	KeywordMatch,
	SectionType,
	TemplateType,
	ToneType,
} from "./-components/cover-letter-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/cover-letter" as any)({
	component: CoverLetterGenerator,
	errorComponent: ErrorComponent,
});

// Main Component
function CoverLetterGenerator() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("generate");
	const [isProcessing, setIsProcessing] = useState(false);

	// Job details state
	const [jobDetails, setJobDetails] = useState<JobDetails>({
		company: "",
		position: "",
		description: "",
	});

	// Template and tone state
	const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("formal");
	const [selectedTone, setSelectedTone] = useState<ToneType>("professional");

	// Generated content state
	const [generatedLetter, setGeneratedLetter] = useState<CoverLetterData | null>(null);
	const [extractedKeywords, setExtractedKeywords] = useState<KeywordMatch[]>([]);

	// Editing state
	const [editMode, setEditMode] = useState<SectionType | null>(null);
	const [editedSections, setEditedSections] = useState<Partial<CoverLetterData>>({});

	// Fetch saved cover letters from database
	const { data: savedCoverLetters = [], error: loadError } = useQuery({
		...orpc.coverLetter.list.queryOptions({}),
		enabled: !!session?.user,
	});

	// Fetch statistics
	const { data: statistics } = useQuery({
		...orpc.coverLetter.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	// Create mutation
	const createMutation = useMutation(
		orpc.coverLetter.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["coverLetter"] });
				toast.success(t`Cover letter saved!`);
			},
			onError: (error) => {
				toast.error(error.message || t`Error during save`);
			},
		}),
	);

	// Delete mutation
	const deleteMutation = useMutation(
		orpc.coverLetter.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["coverLetter"] });
				toast.success(t`Cover letter deleted`);
			},
			onError: (error) => {
				toast.error(error.message || t`Error during deletion`);
			},
		}),
	);

	// Computed values
	const fullLetter = useMemo(() => {
		if (!generatedLetter) return "";
		const intro = editedSections.intro || generatedLetter.intro;
		const body = editedSections.body || generatedLetter.body;
		const closing = editedSections.closing || generatedLetter.closing;
		return `${intro}\n\n${body}\n\n${closing}`;
	}, [generatedLetter, editedSections]);

	const keywordChartData = useMemo(() => {
		const data = extractedKeywords.length > 0 ? extractedKeywords : [];
		return data.slice(0, 6).map((kw) => ({
			name: kw.keyword,
			count: kw.count,
		}));
	}, [extractedKeywords]);

	const categoryChartData = useMemo(() => {
		const data = extractedKeywords.length > 0 ? extractedKeywords : [];
		const categories: Record<string, number> = {};
		for (const kw of data) {
			categories[kw.category] = (categories[kw.category] || 0) + kw.count;
		}
		const colors: Record<string, string> = {
			Skill: "#3b82f6",
			"Soft skill": "#8b5cf6",
			Value: "#10b981",
			Experience: "#f59e0b",
		};
		return Object.entries(categories).map(([name, value]) => ({
			name,
			value,
			color: colors[name] || "#6b7280",
		}));
	}, [extractedKeywords]);

	// Handlers
	const handleGenerate = useCallback(async () => {
		if (!jobDetails.company && !jobDetails.position) {
			toast.error(t`Please fill in at least the company or position`);
			return;
		}

		setIsProcessing(true);
		try {
			// Extract keywords from job description
			const keywords = extractKeywords(jobDetails.description);
			setExtractedKeywords(keywords);

			// Generate cover letter
			const letter = generateCoverLetter(jobDetails, selectedTemplate, selectedTone);
			setGeneratedLetter(letter);
			setEditedSections({});
			toast.success(t`Cover letter generated successfully!`);
		} catch {
			toast.error(t`Error during generation`);
		} finally {
			setIsProcessing(false);
		}
	}, [jobDetails, selectedTemplate, selectedTone]);

	const handleSaveLetter = useCallback(() => {
		if (!generatedLetter || !fullLetter) {
			toast.error(t`Please generate a letter first`);
			return;
		}

		const name = `${jobDetails.position || "Letter"} - ${jobDetails.company || "Company"} - ${new Date().toLocaleDateString()}`;

		createMutation.mutate({
			name,
			companyName: jobDetails.company || undefined,
			position: jobDetails.position || undefined,
			template: selectedTemplate,
			tone: selectedTone,
			content: fullLetter,
			tags: generatedLetter.keywords,
		});
	}, [generatedLetter, fullLetter, jobDetails, selectedTemplate, selectedTone, createMutation]);

	const handleLoadSavedLetter = useCallback((letter: DbCoverLetter) => {
		setJobDetails({
			company: letter.companyName || "",
			position: letter.position || "",
			description: "",
		});
		setSelectedTemplate((letter.template as TemplateType) || "formal");
		setSelectedTone((letter.tone as ToneType) || "professional");

		// Parse content into sections (simple split by double newlines)
		const sections = letter.content.split("\n\n");
		const intro = sections[0] || "";
		const closing = sections[sections.length - 1] || "";
		const body = sections.slice(1, -1).join("\n\n") || "";

		setGeneratedLetter({
			intro,
			body,
			closing,
			keywords: letter.tags || [],
		});
		setEditedSections({});
		setActiveTab("generate");
		toast.success(t`Letter loaded`);
	}, []);

	const handleDeleteLetter = useCallback(
		(id: string) => {
			deleteMutation.mutate({ id });
		},
		[deleteMutation],
	);

	const handleRegenerate = useCallback(
		async (section: SectionType) => {
			if (!generatedLetter) return;

			setIsProcessing(true);
			try {
				const newLetter = generateCoverLetter(jobDetails, selectedTemplate, selectedTone);

				setEditedSections((prev) => ({
					...prev,
					[section]: newLetter[section],
				}));
				toast.success(t`Section regenerated!`);
			} catch {
				toast.error(t`Error during regeneration`);
			} finally {
				setIsProcessing(false);
			}
		},
		[jobDetails, selectedTemplate, selectedTone, generatedLetter],
	);

	const copyToClipboard = useCallback((text: string) => {
		navigator.clipboard.writeText(text);
		toast.success(t`Copied to clipboard`);
	}, []);

	const downloadAsTextFile = useCallback(() => {
		const blob = new Blob([fullLetter], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `cover-letter-${jobDetails.company || "company"}.txt`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		toast.success(t`Letter downloaded`);
	}, [fullLetter, jobDetails.company]);

	const handleSectionEdit = useCallback((section: SectionType, content: string) => {
		setEditedSections((prev) => ({
			...prev,
			[section]: content,
		}));
	}, []);

	// Highlight keywords in text (with proper escaping)
	const highlightKeywords = useCallback(
		(text: string) => {
			if (!generatedLetter?.keywords || generatedLetter.keywords.length === 0) {
				// Escape HTML entities to prevent XSS
				return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
			}

			// First escape HTML in the text (including quotes for defense-in-depth)
			let escapedText = text
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#39;");

			// Escape special regex characters in keywords
			const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

			for (const keyword of generatedLetter.keywords) {
				const escapedKeyword = escapeRegex(keyword);
				const regex = new RegExp(`(${escapedKeyword})`, "gi");
				escapedText = escapedText.replace(regex, '<mark class="bg-primary/20 text-primary px-1 rounded">$1</mark>');
			}
			return escapedText;
		},
		[generatedLetter],
	);

	const isFormValid = jobDetails.company || jobDetails.position;

	// Note: removed early loading return to prevent SSR hydration mismatch
	// (SSR has enabled:false → isLoading:false, client has enabled:true → isLoading:true)

	// Error state
	if (loadError) {
		return (
			<>
				<DashboardHeader icon={EnvelopeIcon} title={t`Cover Letter Generator`} />
				<ErrorState />
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={EnvelopeIcon} title={t`Cover Letter Generator`} />

			<HeroSection statisticsTotal={statistics?.total ?? 0} />

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "generate", icon: MagicWandIcon, label: t`Generate` },
						{ value: "saved", icon: FileTextIcon, label: t`My Letters (${savedCoverLetters.length})` },
						{ value: "preview", icon: EyeIcon, label: t`Preview` },
						{ value: "analysis", icon: TargetIcon, label: t`Analysis` },
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

				<TabsContent value="generate" className="space-y-8">
					<GenerateTab
						jobDetails={jobDetails}
						setJobDetails={setJobDetails}
						selectedTemplate={selectedTemplate}
						setSelectedTemplate={setSelectedTemplate}
						selectedTone={selectedTone}
						setSelectedTone={setSelectedTone}
						isProcessing={isProcessing}
						isFormValid={isFormValid}
						handleGenerate={handleGenerate}
						generatedLetter={generatedLetter}
						editMode={editMode}
						setEditMode={setEditMode}
						editedSections={editedSections}
						handleSectionEdit={handleSectionEdit}
						handleRegenerate={handleRegenerate}
						copyToClipboard={copyToClipboard}
						fullLetter={fullLetter}
						downloadAsTextFile={downloadAsTextFile}
						handleSaveLetter={handleSaveLetter}
						createMutationIsPending={createMutation.isPending}
					/>
				</TabsContent>

				<TabsContent value="saved" className="space-y-6">
					<SavedLettersTab
						savedCoverLetters={savedCoverLetters}
						setActiveTab={setActiveTab}
						handleLoadSavedLetter={handleLoadSavedLetter}
						handleDeleteLetter={handleDeleteLetter}
					/>
				</TabsContent>

				<TabsContent value="preview" className="space-y-8">
					<PreviewTab
						generatedLetter={generatedLetter}
						selectedTemplate={selectedTemplate}
						selectedTone={selectedTone}
						fullLetter={fullLetter}
						highlightKeywords={highlightKeywords}
						copyToClipboard={copyToClipboard}
						downloadAsTextFile={downloadAsTextFile}
						setActiveTab={setActiveTab}
					/>
				</TabsContent>

				<TabsContent value="analysis" className="space-y-8">
					<AnalysisTab
						generatedLetter={generatedLetter}
						fullLetter={fullLetter}
						extractedKeywords={extractedKeywords}
						keywordChartData={keywordChartData}
						categoryChartData={categoryChartData}
						setActiveTab={setActiveTab}
					/>
				</TabsContent>
			</Tabs>

			<TipsSection />
		</>
	);
}
