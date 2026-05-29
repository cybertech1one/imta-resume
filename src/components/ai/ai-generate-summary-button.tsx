import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { SparkleIcon, SpinnerIcon, StopIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { AIFeedbackButtons } from "@/components/ai/ai-feedback-buttons";
import { useResumeStore } from "@/components/resume/store/resume";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { client, orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

type AIGenerateSummaryButtonProps = {
	onGenerated: (summary: string) => void;
	language?: string;
	className?: string;
	showFeedback?: boolean;
};

export function AIGenerateSummaryButton({
	onGenerated,
	language = "en",
	className,
	showFeedback = true,
}: AIGenerateSummaryButtonProps) {
	const [isStreaming, setIsStreaming] = useState(false);
	const [streamedContent, setStreamedContent] = useState("");
	const [lastResult, setLastResult] = useState<{ input: string; output: string; startTime: number } | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	const { data: aiStatus } = useQuery(orpc.aiConfig.status.check.queryOptions());
	const resumeData = useResumeStore((state) => state.resume?.data);
	const resumeId = useResumeStore((state) => state.resume?.id);

	const generateMutation = useMutation({
		mutationFn: async () => {
			if (!resumeData) {
				throw new Error(t`No resume data available`);
			}

			abortControllerRef.current = new AbortController();
			setIsStreaming(true);
			setStreamedContent("");
			const startTime = Date.now();

			let fullContent = "";

			const inputData = {
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
			};

			const stream = await client.ai.generateSummary({
				language,
				resumeData: inputData,
			});

			for await (const chunk of stream) {
				if (abortControllerRef.current?.signal.aborted) break;
				if (typeof chunk === "string") fullContent += chunk;
				setStreamedContent(fullContent);
			}

			return { output: fullContent, input: JSON.stringify(inputData), startTime };
		},
		onSuccess: ({ output, input, startTime }) => {
			onGenerated(output);
			setIsStreaming(false);
			setStreamedContent("");
			setLastResult({ input, output, startTime });
			toast.success(t`Summary generated successfully`);
		},
		onError: (error) => {
			setIsStreaming(false);
			setStreamedContent("");
			if (error.name !== "AbortError") {
				toast.error(error.message || t`Failed to generate summary`);
			}
		},
	});

	const handleStop = useCallback(() => {
		abortControllerRef.current?.abort();
		setIsStreaming(false);
		if (streamedContent) {
			onGenerated(streamedContent);
		}
	}, [streamedContent, onGenerated]);

	const handleFeedbackSubmitted = useCallback(() => {
		setLastResult(null);
	}, []);

	if (!aiStatus?.available) {
		return null;
	}

	return (
		<div className="flex items-center gap-2">
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						type="button"
						size="sm"
						variant="outline"
						className={cn("gap-2", className)}
						disabled={generateMutation.isPending && !isStreaming}
						onClick={isStreaming ? handleStop : () => generateMutation.mutate()}
					>
						{isStreaming ? (
							<>
								<StopIcon className="size-4" />
								<Trans>Stop</Trans>
							</>
						) : generateMutation.isPending ? (
							<>
								<SpinnerIcon className="size-4 animate-spin" />
								<Trans>Generating...</Trans>
							</>
						) : (
							<>
								<SparkleIcon className="size-4" />
								<Trans>Generate with AI</Trans>
							</>
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<Trans>Generate a professional summary based on your resume</Trans>
				</TooltipContent>
			</Tooltip>
			{showFeedback && lastResult && (
				<AIFeedbackButtons
					feature="generate_summary"
					originalInput={lastResult.input}
					originalOutput={lastResult.output}
					context={{
						resumeId,
						sectionType: "summary",
						language,
					}}
					responseTimeMs={Date.now() - lastResult.startTime}
					onFeedbackSubmitted={handleFeedbackSubmitted}
					variant="compact"
				/>
			)}
		</div>
	);
}
