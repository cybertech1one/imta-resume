import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ChatCircleDotsIcon,
	CheckIcon,
	PencilSimpleIcon,
	SpinnerIcon,
	ThumbsDownIcon,
	ThumbsUpIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AiContentFeature, AiFeedbackRating } from "@/integrations/drizzle/schema";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

type AIFeedbackButtonsProps = {
	feature: AiContentFeature;
	originalInput?: string;
	originalOutput: string;
	context?: {
		resumeId?: string;
		sectionType?: string;
		language?: string;
		model?: string;
		provider?: string;
	};
	responseTimeMs?: number;
	tokenCount?: number;
	onFeedbackSubmitted?: (rating: AiFeedbackRating, editedOutput?: string) => void;
	className?: string;
	variant?: "compact" | "full";
};

export function AIFeedbackButtons({
	feature,
	originalInput,
	originalOutput,
	context,
	responseTimeMs,
	tokenCount,
	onFeedbackSubmitted,
	className,
	variant = "compact",
}: AIFeedbackButtonsProps) {
	const [submitted, setSubmitted] = useState<AiFeedbackRating | null>(null);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [editedContent, setEditedContent] = useState(originalOutput);
	const [comment, setComment] = useState("");

	const feedbackMutation = useMutation({
		...orpc.aiTraining.collectFeedback.mutationOptions(),
		onSuccess: () => {
			toast.success(t`Thank you for your feedback!`);
		},
		onError: (error) => {
			toast.error(error.message || t`Failed to submit feedback`);
		},
	});

	const handleQuickFeedback = useCallback(
		async (rating: AiFeedbackRating) => {
			if (submitted) return;

			setSubmitted(rating);
			await feedbackMutation.mutateAsync({
				feature,
				rating,
				originalInput,
				originalOutput,
				context,
				responseTimeMs,
				tokenCount,
				wasAccepted: rating === "positive",
			});

			onFeedbackSubmitted?.(rating);
		},
		[
			submitted,
			feature,
			originalInput,
			originalOutput,
			context,
			responseTimeMs,
			tokenCount,
			feedbackMutation,
			onFeedbackSubmitted,
		],
	);

	const handleEditSubmit = useCallback(async () => {
		const hasEdits = editedContent !== originalOutput;
		const rating: AiFeedbackRating = hasEdits ? "neutral" : "positive";

		setSubmitted(rating);
		await feedbackMutation.mutateAsync({
			feature,
			rating,
			originalInput,
			originalOutput,
			editedOutput: hasEdits ? editedContent : undefined,
			comment: comment || undefined,
			context,
			responseTimeMs,
			tokenCount,
			wasAccepted: !hasEdits,
		});

		setShowEditDialog(false);
		onFeedbackSubmitted?.(rating, hasEdits ? editedContent : undefined);
	}, [
		editedContent,
		originalOutput,
		comment,
		feature,
		originalInput,
		context,
		responseTimeMs,
		tokenCount,
		feedbackMutation,
		onFeedbackSubmitted,
	]);

	const handleOpenEdit = useCallback(() => {
		setEditedContent(originalOutput);
		setComment("");
		setShowEditDialog(true);
	}, [originalOutput]);

	// Don't show if already submitted
	if (submitted) {
		return (
			<div className={cn("flex items-center gap-1 text-muted-foreground", className)}>
				<CheckIcon className="size-4 text-green-500" />
				<span className="text-xs">
					<Trans>Feedback recorded</Trans>
				</span>
			</div>
		);
	}

	if (variant === "compact") {
		return (
			<>
				<div className={cn("flex items-center gap-1", className)}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								type="button"
								size="icon"
								variant="ghost"
								className="size-7"
								disabled={feedbackMutation.isPending}
								onClick={() => handleQuickFeedback("positive")}
							>
								{feedbackMutation.isPending ? (
									<SpinnerIcon className="size-4 animate-spin" />
								) : (
									<ThumbsUpIcon className="size-4" />
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<Trans>This was helpful</Trans>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								type="button"
								size="icon"
								variant="ghost"
								className="size-7"
								disabled={feedbackMutation.isPending}
								onClick={() => handleQuickFeedback("negative")}
							>
								<ThumbsDownIcon className="size-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<Trans>This wasn't helpful</Trans>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								type="button"
								size="icon"
								variant="ghost"
								className="size-7"
								disabled={feedbackMutation.isPending}
								onClick={handleOpenEdit}
							>
								<PencilSimpleIcon className="size-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<Trans>Edit and submit corrections</Trans>
						</TooltipContent>
					</Tooltip>
				</div>

				<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
					<DialogContent className="sm:max-w-[600px]">
						<DialogHeader>
							<DialogTitle>
								<Trans>Improve AI Output</Trans>
							</DialogTitle>
							<DialogDescription>
								<Trans>
									Edit the AI-generated content to show us how it could be better. Your corrections help improve our AI.
								</Trans>
							</DialogDescription>
						</DialogHeader>

						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="edited-content">
									<Trans>Corrected Content</Trans>
								</Label>
								<Textarea
									id="edited-content"
									value={editedContent}
									onChange={(e) => setEditedContent(e.target.value)}
									rows={6}
									className="resize-none"
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="comment">
									<Trans>Additional Comments (optional)</Trans>
								</Label>
								<Textarea
									id="comment"
									value={comment}
									onChange={(e) => setComment(e.target.value)}
									placeholder={t`What was wrong or how could we improve?`}
									rows={3}
									className="resize-none"
								/>
							</div>
						</div>

						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline" type="button">
									<XIcon className="mr-2 size-4" />
									<Trans>Cancel</Trans>
								</Button>
							</DialogClose>
							<Button type="button" onClick={handleEditSubmit} disabled={feedbackMutation.isPending}>
								{feedbackMutation.isPending ? (
									<SpinnerIcon className="mr-2 size-4 animate-spin" />
								) : (
									<CheckIcon className="mr-2 size-4" />
								)}
								<Trans>Submit Feedback</Trans>
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</>
		);
	}

	// Full variant with visible buttons
	return (
		<>
			<div className={cn("flex flex-wrap items-center gap-2", className)}>
				<span className="text-muted-foreground text-sm">
					<Trans>Was this helpful?</Trans>
				</span>

				<Button
					type="button"
					size="sm"
					variant="outline"
					className="gap-1"
					disabled={feedbackMutation.isPending}
					onClick={() => handleQuickFeedback("positive")}
				>
					<ThumbsUpIcon className="size-4" />
					<Trans>Yes</Trans>
				</Button>

				<Button
					type="button"
					size="sm"
					variant="outline"
					className="gap-1"
					disabled={feedbackMutation.isPending}
					onClick={() => handleQuickFeedback("negative")}
				>
					<ThumbsDownIcon className="size-4" />
					<Trans>No</Trans>
				</Button>

				<Button
					type="button"
					size="sm"
					variant="ghost"
					className="gap-1"
					disabled={feedbackMutation.isPending}
					onClick={handleOpenEdit}
				>
					<ChatCircleDotsIcon className="size-4" />
					<Trans>Suggest Edit</Trans>
				</Button>
			</div>

			<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>
							<Trans>Improve AI Output</Trans>
						</DialogTitle>
						<DialogDescription>
							<Trans>
								Edit the AI-generated content to show us how it could be better. Your corrections help improve our AI.
							</Trans>
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="edited-content-full">
								<Trans>Corrected Content</Trans>
							</Label>
							<Textarea
								id="edited-content-full"
								value={editedContent}
								onChange={(e) => setEditedContent(e.target.value)}
								rows={6}
								className="resize-none"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="comment-full">
								<Trans>Additional Comments (optional)</Trans>
							</Label>
							<Textarea
								id="comment-full"
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								placeholder={t`What was wrong or how could we improve?`}
								rows={3}
								className="resize-none"
							/>
						</div>
					</div>

					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline" type="button">
								<XIcon className="mr-2 size-4" />
								<Trans>Cancel</Trans>
							</Button>
						</DialogClose>
						<Button type="button" onClick={handleEditSubmit} disabled={feedbackMutation.isPending}>
							{feedbackMutation.isPending ? (
								<SpinnerIcon className="mr-2 size-4 animate-spin" />
							) : (
								<CheckIcon className="mr-2 size-4" />
							)}
							<Trans>Submit Feedback</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
