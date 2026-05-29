import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { SparkleIcon, SpinnerIcon, StopIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { AIFeedbackButtons } from "@/components/ai/ai-feedback-buttons";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { stripMarkdownFences } from "@/integrations/ai/sanitize";
import { client, orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

type AIImproveButtonProps = {
	content: string;
	context?: string;
	onImproved: (improvedContent: string) => void;
	language?: string;
	className?: string;
	variant?: "icon" | "default";
	resumeId?: string;
	sectionType?: string;
	showFeedback?: boolean;
};

export function AIImproveButton({
	content,
	context,
	onImproved,
	language = "en",
	className,
	variant = "icon",
	resumeId,
	sectionType,
	showFeedback = true,
}: AIImproveButtonProps) {
	const [isStreaming, setIsStreaming] = useState(false);
	const [streamedContent, setStreamedContent] = useState("");
	const [lastResult, setLastResult] = useState<{ input: string; output: string; startTime: number } | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	const { data: aiStatus } = useQuery(orpc.aiConfig.status.check.queryOptions());

	const improveMutation = useMutation({
		mutationFn: async () => {
			if (!content.trim()) {
				throw new Error(t`No content to improve`);
			}

			abortControllerRef.current = new AbortController();
			setIsStreaming(true);
			setStreamedContent("");
			const startTime = Date.now();

			let fullContent = "";

			const stream = await client.ai.improveContent({
				content,
				context,
				language,
			});

			for await (const chunk of stream) {
				if (abortControllerRef.current?.signal.aborted) break;
				if (typeof chunk === "string") fullContent += chunk;
				setStreamedContent(fullContent);
			}

			return { output: fullContent, startTime };
		},
		onSuccess: ({ output, startTime }) => {
			onImproved(stripMarkdownFences(output));
			setIsStreaming(false);
			setStreamedContent("");
			setLastResult({ input: content, output, startTime });
			toast.success(t`Content improved successfully`);
		},
		onError: (error) => {
			setIsStreaming(false);
			setStreamedContent("");
			if (error.name !== "AbortError") {
				toast.error(error.message || t`Failed to improve content`);
			}
		},
	});

	const handleStop = useCallback(() => {
		abortControllerRef.current?.abort();
		setIsStreaming(false);
		if (streamedContent) {
			onImproved(streamedContent);
		}
	}, [streamedContent, onImproved]);

	const handleFeedbackSubmitted = useCallback(() => {
		setLastResult(null);
	}, []);

	if (!aiStatus?.available) {
		return null;
	}

	if (variant === "icon") {
		return (
			<div className="flex items-center gap-1">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							type="button"
							size="icon"
							variant="ghost"
							className={cn("size-8", className)}
							disabled={improveMutation.isPending && !isStreaming}
							onClick={isStreaming ? handleStop : () => improveMutation.mutate()}
						>
							{isStreaming ? (
								<StopIcon className="size-4" />
							) : improveMutation.isPending ? (
								<SpinnerIcon className="size-4 animate-spin" />
							) : (
								<SparkleIcon className="size-4" />
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent>{isStreaming ? <Trans>Stop AI</Trans> : <Trans>Improve with AI</Trans>}</TooltipContent>
				</Tooltip>
				{showFeedback && lastResult && (
					<AIFeedbackButtons
						feature="improve_content"
						originalInput={lastResult.input}
						originalOutput={lastResult.output}
						context={{
							resumeId,
							sectionType,
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

	return (
		<div className="flex items-center gap-2">
			<Button
				type="button"
				size="sm"
				variant="outline"
				className={cn("gap-2", className)}
				disabled={improveMutation.isPending && !isStreaming}
				onClick={isStreaming ? handleStop : () => improveMutation.mutate()}
			>
				{isStreaming ? (
					<>
						<StopIcon className="size-4" />
						<Trans>Stop</Trans>
					</>
				) : improveMutation.isPending ? (
					<>
						<SpinnerIcon className="size-4 animate-spin" />
						<Trans>Improving...</Trans>
					</>
				) : (
					<>
						<SparkleIcon className="size-4" />
						<Trans>Improve with AI</Trans>
					</>
				)}
			</Button>
			{showFeedback && lastResult && (
				<AIFeedbackButtons
					feature="improve_content"
					originalInput={lastResult.input}
					originalOutput={lastResult.output}
					context={{
						resumeId,
						sectionType,
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
