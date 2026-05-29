import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { SparkleIcon, SpinnerIcon, StopIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { RichInput } from "@/components/input/rich-input";
import { useResumeStore } from "@/components/resume/store/resume";
import { Button } from "@/components/ui/button";
import { stripMarkdownFences } from "@/integrations/ai/sanitize";
import { client, orpc } from "@/integrations/orpc/client";
import { SectionBase } from "../shared/section-base";

export function SummarySectionBuilder() {
	const { i18n } = useLingui();
	const section = useResumeStore((state) => state.resume.data.summary);
	const resumeData = useResumeStore((state) => state.resume.data);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const { data: aiStatus } = useQuery(orpc.aiConfig.status.check.queryOptions());
	const [isGenerating, setIsGenerating] = useState(false);
	const [streamedContent, setStreamedContent] = useState("");
	const abortRef = useRef<AbortController | null>(null);

	const onChange = (value: string) => {
		updateResumeData((draft) => {
			draft.summary.content = value;
		});
	};

	const generateMutation = useMutation({
		mutationFn: async () => {
			abortRef.current = new AbortController();
			setIsGenerating(true);
			setStreamedContent("");

			let fullContent = "";

			const stream = await client.ai.generateSummary({
				language: i18n.locale || "en",
				resumeData: {
					name: resumeData.basics.name,
					headline: resumeData.basics.headline,
					experience: resumeData.sections.experience.items.map((e) => ({
						company: e.company,
						position: e.position,
						description: e.description,
					})),
					education: resumeData.sections.education.items.map((e) => ({
						institution: e.school,
						degree: e.degree,
						area: e.area,
					})),
					skills: resumeData.sections.skills.items.map((s) => ({
						name: s.name,
					})),
				},
			});

			for await (const chunk of stream) {
				if (abortRef.current?.signal.aborted) break;
				if (typeof chunk === "string") fullContent += chunk;
				setStreamedContent(fullContent);
			}

			return fullContent;
		},
		onSuccess: (summary) => {
			updateResumeData((draft) => {
				draft.summary.content = stripMarkdownFences(summary);
			});
			setIsGenerating(false);
			setStreamedContent("");
			toast.success(t`Summary generated successfully`);
		},
		onError: (error) => {
			setIsGenerating(false);
			setStreamedContent("");
			if (error.name !== "AbortError") {
				toast.error(error.message || t`Failed to generate summary`);
			}
		},
	});

	const handleStop = useCallback(() => {
		abortRef.current?.abort();
		setIsGenerating(false);
		if (streamedContent) {
			updateResumeData((draft) => {
				draft.summary.content = streamedContent;
			});
		}
		setStreamedContent("");
	}, [streamedContent, updateResumeData]);

	const hasContent = section.content && section.content !== "<p></p>";

	// Show streamed content during generation, otherwise show saved content
	const displayContent = isGenerating && streamedContent ? streamedContent : section.content;

	return (
		<SectionBase type="summary">
			<div className="space-y-3">
				{/* AI Generate Button */}
				{aiStatus?.available && (
					<div className="flex items-center justify-between">
						<p className="text-muted-foreground text-xs">
							{isGenerating ? (
								<Trans>AI is writing your summary...</Trans>
							) : hasContent ? (
								<Trans>Use AI to rewrite your summary</Trans>
							) : (
								<Trans>Let AI create a professional summary based on your experience</Trans>
							)}
						</p>
						<div className="flex gap-2">
							{isGenerating ? (
								<Button
									size="sm"
									variant="outline"
									onClick={handleStop}
									className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
								>
									<StopIcon className="size-4" />
									<Trans>Stop</Trans>
								</Button>
							) : (
								<Button
									size="sm"
									variant="outline"
									disabled={isGenerating}
									onClick={() => generateMutation.mutate()}
									className="gap-2 border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950"
								>
									<SparkleIcon className="size-4" />
									<Trans>Generate with AI</Trans>
								</Button>
							)}
						</div>
					</div>
				)}

				{/* Streaming preview indicator */}
				{isGenerating && streamedContent && (
					<div className="flex items-center gap-2 rounded-md bg-purple-50 px-3 py-2 text-purple-700 text-xs dark:bg-purple-950 dark:text-purple-300">
						<SpinnerIcon className="size-3.5 animate-spin" />
						<Trans>Generating summary... You can edit after it completes or click Stop to keep current progress.</Trans>
					</div>
				)}

				{/* Helpful tip when empty */}
				{!hasContent && !aiStatus?.available && !isGenerating && (
					<p className="rounded-md bg-muted/50 p-3 text-muted-foreground text-xs">
						<Trans>
							Write 2-3 sentences highlighting your experience, key skills, and career goals. Tip: Enable AI in settings
							to auto-generate this section.
						</Trans>
					</p>
				)}

				<RichInput
					value={displayContent}
					onChange={onChange}
					aiContext="Professional resume summary section"
					editable={!isGenerating}
				/>
			</div>
		</SectionBase>
	);
}
