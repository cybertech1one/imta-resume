import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { LightbulbIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AIFeedbackButtons } from "@/components/ai/ai-feedback-buttons";
import { useResumeStore } from "@/components/resume/store/resume";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { client, orpc } from "@/integrations/orpc/client";
import { generateId } from "@/utils/string";
import { cn } from "@/utils/style";

type SuggestedSkill = {
	name: string;
	level: number;
};

type AISuggestSkillsButtonProps = {
	onSkillsAdded?: (count: number) => void;
	language?: string;
	className?: string;
	showFeedback?: boolean;
};

export function AISuggestSkillsButton({
	onSkillsAdded,
	language = "en",
	className,
	showFeedback = true,
}: AISuggestSkillsButtonProps) {
	const [lastResult, setLastResult] = useState<{ input: string; output: string; startTime: number } | null>(null);

	const { data: aiStatus } = useQuery(orpc.aiConfig.status.check.queryOptions());
	const resumeData = useResumeStore((state) => state.resume?.data);
	const resumeId = useResumeStore((state) => state.resume?.id);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const suggestMutation = useMutation({
		mutationFn: async () => {
			if (!resumeData) {
				throw new Error(t`No resume data available`);
			}

			const startTime = Date.now();
			const existingSkills = resumeData.sections.skills.items.map((s) => s.name);

			const inputData = {
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
				existingSkills,
			};

			const result = await client.ai.suggestSkills({
				language,
				resumeData: inputData,
			});

			return {
				skills: result as SuggestedSkill[],
				input: JSON.stringify(inputData),
				startTime,
			};
		},
		onSuccess: ({ skills, input, startTime }) => {
			if (skills.length === 0) {
				toast.info(t`No additional skills to suggest`);
				return;
			}

			const output = skills.map((s) => s.name).join(", ");
			setLastResult({ input, output, startTime });

			updateResumeData((draft) => {
				for (const skill of skills) {
					draft.sections.skills.items.push({
						id: generateId(),
						hidden: false,
						icon: "",
						name: skill.name,
						proficiency: "",
						level: skill.level,
						keywords: [],
					});
				}
			});

			toast.success(t`Added ${skills.length} suggested skills`);
			onSkillsAdded?.(skills.length);
		},
		onError: (error) => {
			toast.error(error.message || t`Failed to suggest skills`);
		},
	});

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
						disabled={suggestMutation.isPending}
						onClick={() => suggestMutation.mutate()}
					>
						{suggestMutation.isPending ? (
							<>
								<SpinnerIcon className="size-4 animate-spin" />
								<Trans>Analyzing...</Trans>
							</>
						) : (
							<>
								<LightbulbIcon className="size-4" />
								<Trans>Suggest Skills</Trans>
							</>
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<Trans>AI will analyze your experience and suggest relevant skills</Trans>
				</TooltipContent>
			</Tooltip>
			{showFeedback && lastResult && (
				<AIFeedbackButtons
					feature="suggest_skills"
					originalInput={lastResult.input}
					originalOutput={lastResult.output}
					context={{
						resumeId,
						sectionType: "skills",
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
