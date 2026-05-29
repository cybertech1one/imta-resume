import { t } from "@lingui/core/macro";
import { CalendarIcon, EnvelopeSimpleOpenIcon, HandshakeIcon, NotePencilIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	AIPersonalizationCard,
	GeneratorActionButtons,
	InterviewDetailsCard,
	PreviewTabContent,
	RecipientDetailsCard,
	type SavedLetter,
	SavedLettersTabContent,
	TemplateSelectionCard,
	ThankYouErrorState,
	ThankYouFooterTips,
	ThankYouHeroSection,
	ThankYouLoadingState,
	TimingRecommendationsCard,
	TrackingHistorySection,
	TrackSendCard,
} from "./-components/thank-you-components";
import { generateThankYouLetter, getTimingRecommendation } from "./-components/thank-you-config";
import type { InterviewType, SendMethod, TemplateStyle } from "./-components/thank-you-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/thank-you" as any)({
	component: ThankYouLetterGenerator,
	errorComponent: ErrorComponent,
});

// Main Component
function ThankYouLetterGenerator() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [mounted, setMounted] = useState(false);
	const [activeTab, setActiveTab] = useState("generator");
	const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);

	// Recipient State
	const [recipientName, setRecipientName] = useState("");
	const [recipientCompany, setRecipientCompany] = useState("");
	const [recipientPosition, setRecipientPosition] = useState("");
	const [recipientEmail, setRecipientEmail] = useState("");

	// Interview State
	const [interviewDate, setInterviewDate] = useState("");
	const [interviewType, setInterviewType] = useState<InterviewType>("inperson");
	const [discussionPoints, setDiscussionPoints] = useState("");
	const [jobPosition, setJobPosition] = useState("");

	// Template State
	const [selectedTemplate, setSelectedTemplate] = useState<TemplateStyle>("warm");
	const [includePersonalization, setIncludePersonalization] = useState(true);

	// Generated Letter State
	const [generatedContent, setGeneratedContent] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);

	// Send Tracking State
	const [sentDate, setSentDate] = useState("");
	const [sendMethod, setSendMethod] = useState<SendMethod>("email");
	const [trackingNotes, setTrackingNotes] = useState("");

	// Suppress hydration mismatch: only show loading state after client mount
	useEffect(() => {
		setMounted(true);
	}, []);

	// Fetch saved letters from database
	const {
		data: savedLetters = [],
		isLoading: isLoadingLetters,
		error: loadError,
	} = useQuery({
		...orpc.thankYouLetter.list.queryOptions({}),
		enabled: !!session?.user,
	});

	// Fetch send tracking history
	const { data: trackingHistory = [] } = useQuery({
		...orpc.thankYouLetter.listSendTracking.queryOptions({}),
		enabled: !!session?.user,
	});

	// Fetch statistics
	const { data: statistics } = useQuery({
		...orpc.thankYouLetter.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	// Fetch suggestions for selected letter
	const { data: suggestions = [] } = useQuery({
		...orpc.thankYouLetter.getSuggestions.queryOptions({ input: { letterId: selectedLetterId ?? "" } }),
		enabled: !!session?.user && !!selectedLetterId,
	});

	// Create letter mutation
	const createMutation = useMutation(
		orpc.thankYouLetter.create.mutationOptions({
			onSuccess: (letterId) => {
				queryClient.invalidateQueries({ queryKey: ["thankYouLetter"] });
				setSelectedLetterId(letterId);
				toast.success(t`Thank you letter saved!`);
			},
			onError: (error) => {
				toast.error(error.message || t`Error saving`);
			},
		}),
	);

	// Delete letter mutation
	const deleteMutation = useMutation(
		orpc.thankYouLetter.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["thankYouLetter"] });
				if (selectedLetterId) {
					setSelectedLetterId(null);
					setGeneratedContent(null);
				}
				toast.success(t`Letter deleted`);
			},
			onError: (error) => {
				toast.error(error.message || t`Error deleting`);
			},
		}),
	);

	// Create send tracking mutation
	const createTrackingMutation = useMutation(
		orpc.thankYouLetter.createSendTracking.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["thankYouLetter"] });
				setSentDate("");
				setTrackingNotes("");
				toast.success(t`Sending recorded successfully`);
			},
			onError: (error) => {
				toast.error(error.message || t`Error saving record`);
			},
		}),
	);

	// Delete send tracking mutation
	const deleteTrackingMutation = useMutation(
		orpc.thankYouLetter.deleteSendTracking.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["thankYouLetter"] });
				toast.success(t`Sending removed`);
			},
			onError: (error) => {
				toast.error(error.message || t`Error deleting`);
			},
		}),
	);

	// Create suggestion mutation
	const createSuggestionMutation = useMutation(
		orpc.thankYouLetter.createSuggestion.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["thankYouLetter"] });
			},
			onError: () => toast.error(t`Failed to create suggestion. Please try again.`),
		}),
	);

	// Toggle suggestion mutation
	const toggleSuggestionMutation = useMutation(
		orpc.thankYouLetter.toggleSuggestion.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["thankYouLetter"] });
			},
			onError: () => toast.error(t`Failed to update suggestion. Please try again.`),
		}),
	);

	// Delete suggestions mutation
	const deleteSuggestionsMutation = useMutation(
		orpc.thankYouLetter.deleteSuggestions.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["thankYouLetter"] });
			},
			onError: () => toast.error(t`Failed to delete suggestions. Please try again.`),
		}),
	);

	// Computed values
	const discussionPointsArray = useMemo(() => discussionPoints.split("\n").filter((p) => p.trim()), [discussionPoints]);

	const timingRecommendation = useMemo(() => getTimingRecommendation(interviewDate), [interviewDate]);

	const isFormValid = useMemo(
		() => recipientName.trim() && recipientCompany.trim() && interviewDate && jobPosition.trim(),
		[recipientName, recipientCompany, interviewDate, jobPosition],
	);

	// Handlers
	const handleGenerateLetter = useCallback(async () => {
		if (!isFormValid) {
			toast.error(t`Please fill in all required fields`);
			return;
		}

		setIsGenerating(true);
		try {
			const content = generateThankYouLetter(
				recipientName,
				recipientCompany,
				recipientPosition,
				interviewDate,
				discussionPointsArray,
				jobPosition,
				selectedTemplate,
			);
			setGeneratedContent(content);

			createMutation.mutate({
				recipientName,
				recipientCompany,
				recipientPosition: recipientPosition || undefined,
				recipientEmail: recipientEmail || undefined,
				interviewDate,
				interviewType,
				discussionPoints: discussionPointsArray,
				jobPosition,
				template: selectedTemplate,
				content,
			});

			toast.success(t`Thank you letter generated successfully`);
		} catch {
			toast.error(t`Error generating`);
		} finally {
			setIsGenerating(false);
		}
	}, [
		isFormValid,
		recipientName,
		recipientCompany,
		recipientPosition,
		recipientEmail,
		interviewDate,
		interviewType,
		discussionPointsArray,
		jobPosition,
		selectedTemplate,
		createMutation,
	]);

	const handleLoadAISuggestions = useCallback(async () => {
		if (!selectedLetterId) {
			toast.error(t`Please first generate or select a letter`);
			return;
		}

		await deleteSuggestionsMutation.mutateAsync({ letterId: selectedLetterId });

		const newSuggestions = [
			{
				category: "opening" as const,
				text: t`Mention the "${discussionPointsArray[0] || "innovative"}" project that particularly interested you`,
			},
			{
				category: "body" as const,
				text: t`Recall your experience related to ${jobPosition}`,
			},
			{
				category: "personalization" as const,
				text: t`Reference the values of ${recipientCompany} discussed during the interview`,
			},
			{
				category: "closing" as const,
				text: t`Propose an availability date for a potential second interview`,
			},
		];

		for (const suggestion of newSuggestions) {
			await createSuggestionMutation.mutateAsync({
				letterId: selectedLetterId,
				category: suggestion.category,
				text: suggestion.text,
			});
		}

		toast.success(t`AI suggestions loaded`);
	}, [
		selectedLetterId,
		discussionPointsArray,
		jobPosition,
		recipientCompany,
		deleteSuggestionsMutation,
		createSuggestionMutation,
	]);

	const handleToggleSuggestion = useCallback(
		(suggestionId: string) => {
			toggleSuggestionMutation.mutate({ suggestionId });
		},
		[toggleSuggestionMutation],
	);

	const handleCopyToClipboard = useCallback((text: string) => {
		navigator.clipboard.writeText(text);
		toast.success(t`Copied to clipboard`);
	}, []);

	const handleExportLetter = useCallback(() => {
		if (!generatedContent) return;

		const blob = new Blob([generatedContent], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `thank-you-letter-${recipientCompany.toLowerCase().replace(/\s+/g, "-")}.txt`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		toast.success(t`Letter exported`);
	}, [generatedContent, recipientCompany]);

	const handleTrackSend = useCallback(() => {
		if (!sentDate) {
			toast.error(t`Please select a sending date`);
			return;
		}

		if (!selectedLetterId) {
			toast.error(t`Please first generate or select a letter`);
			return;
		}

		createTrackingMutation.mutate({
			letterId: selectedLetterId,
			sentDate,
			method: sendMethod,
			notes: trackingNotes || undefined,
		});
	}, [sentDate, selectedLetterId, sendMethod, trackingNotes, createTrackingMutation]);

	const handleReset = useCallback(() => {
		setRecipientName("");
		setRecipientCompany("");
		setRecipientPosition("");
		setRecipientEmail("");
		setInterviewDate("");
		setDiscussionPoints("");
		setJobPosition("");
		setGeneratedContent(null);
		setSelectedLetterId(null);
	}, []);

	const handleLoadSavedLetter = useCallback((letter: SavedLetter) => {
		setRecipientName(letter.recipientName);
		setRecipientCompany(letter.recipientCompany);
		setRecipientPosition(letter.recipientPosition || "");
		setRecipientEmail(letter.recipientEmail || "");
		setInterviewDate(letter.interviewDate);
		setInterviewType(letter.interviewType);
		setDiscussionPoints(letter.discussionPoints.join("\n"));
		setJobPosition(letter.jobPosition);
		setSelectedTemplate(letter.template);
		setGeneratedContent(letter.content);
		setSelectedLetterId(letter.id);
		setActiveTab("generator");
		toast.success(t`Letter loaded`);
	}, []);

	const handleDeleteLetter = useCallback(
		(id: string) => {
			deleteMutation.mutate({ id });
		},
		[deleteMutation],
	);

	// Loading state — gate on `mounted` to avoid SSR/client hydration mismatch:
	// SSR may resolve the query (isLoadingLetters=false) while client starts fresh
	// (isLoadingLetters=true). Both renders must match on first paint.
	if (mounted && isLoadingLetters) {
		return <ThankYouLoadingState />;
	}

	// Error state
	if (loadError) {
		return <ThankYouErrorState />;
	}

	return (
		<>
			<DashboardHeader icon={HandshakeIcon} title={t`Thank You Letter Generator`} />

			<ThankYouHeroSection statistics={statistics} />

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "generator", icon: NotePencilIcon, label: "Generator" },
						{ value: "saved", icon: EnvelopeSimpleOpenIcon, label: `My Letters (${savedLetters.length})` },
						{ value: "preview", icon: EnvelopeSimpleOpenIcon, label: "Preview" },
						{ value: "tracking", icon: CalendarIcon, label: "Tracking" },
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

				{/* Generator Tab */}
				<TabsContent value="generator" className="space-y-8">
					<div className="grid gap-8 lg:grid-cols-2">
						{/* Left Column - Input Forms */}
						<div className="space-y-6">
							<RecipientDetailsCard
								recipientName={recipientName}
								setRecipientName={setRecipientName}
								recipientPosition={recipientPosition}
								setRecipientPosition={setRecipientPosition}
								recipientCompany={recipientCompany}
								setRecipientCompany={setRecipientCompany}
								recipientEmail={recipientEmail}
								setRecipientEmail={setRecipientEmail}
							/>

							<InterviewDetailsCard
								interviewDate={interviewDate}
								setInterviewDate={setInterviewDate}
								interviewType={interviewType}
								setInterviewType={setInterviewType}
								jobPosition={jobPosition}
								setJobPosition={setJobPosition}
								discussionPoints={discussionPoints}
								setDiscussionPoints={setDiscussionPoints}
								timingRecommendation={timingRecommendation}
							/>
						</div>

						{/* Right Column - Template Selection & AI */}
						<div className="space-y-6">
							<TemplateSelectionCard selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />

							<AIPersonalizationCard
								includePersonalization={includePersonalization}
								setIncludePersonalization={setIncludePersonalization}
								selectedLetterId={selectedLetterId}
								suggestions={suggestions}
								handleLoadAISuggestions={handleLoadAISuggestions}
								handleToggleSuggestion={handleToggleSuggestion}
								isLoadingSuggestions={createSuggestionMutation.isPending}
							/>

							<GeneratorActionButtons
								isGenerating={isGenerating}
								isFormValid={!!isFormValid}
								isSaving={createMutation.isPending}
								handleGenerateLetter={handleGenerateLetter}
								handleReset={handleReset}
							/>
						</div>
					</div>
				</TabsContent>

				{/* Saved Letters Tab */}
				<TabsContent value="saved" className="space-y-6">
					<SavedLettersTabContent
						savedLetters={savedLetters}
						setActiveTab={setActiveTab}
						handleLoadSavedLetter={handleLoadSavedLetter}
						handleDeleteLetter={handleDeleteLetter}
					/>
				</TabsContent>

				{/* Preview Tab */}
				<TabsContent value="preview" className="space-y-8">
					<PreviewTabContent
						generatedContent={generatedContent}
						selectedTemplate={selectedTemplate}
						handleCopyToClipboard={handleCopyToClipboard}
						handleExportLetter={handleExportLetter}
						setActiveTab={setActiveTab}
					/>
				</TabsContent>

				{/* Tracking Tab */}
				<TabsContent value="tracking" className="space-y-8">
					<div className="grid gap-8 lg:grid-cols-2">
						<TrackSendCard
							selectedLetterId={selectedLetterId}
							sentDate={sentDate}
							setSentDate={setSentDate}
							sendMethod={sendMethod}
							setSendMethod={setSendMethod}
							trackingNotes={trackingNotes}
							setTrackingNotes={setTrackingNotes}
							handleTrackSend={handleTrackSend}
							isTrackingPending={createTrackingMutation.isPending}
						/>

						<TimingRecommendationsCard />
					</div>

					<TrackingHistorySection trackingHistory={trackingHistory} deleteTrackingMutation={deleteTrackingMutation} />
				</TabsContent>
			</Tabs>

			<ThankYouFooterTips />
		</>
	);
}
