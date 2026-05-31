import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CheckCircleIcon,
	ClockIcon,
	ListChecksIcon,
	SparkleIcon,
	TargetIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFieldName, formatSkillCategory } from "../../-components/display-utils";

export type SkillLevel = "novice" | "beginner" | "intermediate" | "advanced" | "expert";

const LEVEL_COLORS: Record<SkillLevel, string> = {
	novice: "oklch(0.65 0.12 25)",
	beginner: "oklch(0.65 0.15 45)",
	intermediate: "oklch(0.65 0.18 200)",
	advanced: "oklch(0.55 0.2 260)",
	expert: "oklch(0.55 0.22 300)",
};

const LEVEL_LABELS: Record<SkillLevel, string> = {
	novice: t`Novice`,
	beginner: t`Beginner`,
	intermediate: t`Intermediate`,
	advanced: t`Advanced`,
	expert: t`Expert`,
};

export interface Assessment {
	id: string;
	skillId: string;
	skillName: string;
	skillNameFr?: string | null;
	category: string;
	field?: string | null;
	currentLevel: SkillLevel;
	score: number;
	confidenceScore?: number | null;
	questionsTotal?: number | null;
	questionsCorrect?: number | null;
	timeSpent?: number | null;
	detailedResults?: {
		strengths: string[];
		weaknesses: string[];
		recommendations: string[];
		topicScores: Record<string, number>;
	} | null;
	aiEvaluation?: string | null;
	aiSuggestions?: string[] | null;
	assessedAt?: Date | string | null;
}

export function AssessmentsLoadingSkeleton() {
	return (
		<div className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={String(i)} className="h-28 rounded-xl" />
				))}
			</div>
			{Array.from({ length: 3 }).map((_, i) => (
				<Skeleton key={`card-${String(i)}`} className="h-40 rounded-xl" />
			))}
		</div>
	);
}

function LevelBadge({ level }: { level: SkillLevel }) {
	const color = LEVEL_COLORS[level] ?? "oklch(0.6 0.1 240)";
	return (
		<span
			className="inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs capitalize"
			style={{
				background: `oklch(from ${color} l c h / 0.12)`,
				color,
			}}
		>
			{LEVEL_LABELS[level] ?? level}
		</span>
	);
}

function ScoreBar({ score, label }: { score: number; label: string }) {
	return (
		<div className="space-y-1">
			<div className="flex justify-between text-xs">
				<span className="text-muted-foreground">{label}</span>
				<span className="font-medium tabular-nums">{score}%</span>
			</div>
			<Progress
				value={score}
				className="h-2"
				style={
					{
						"--progress-color":
							score >= 80 ? "var(--imta-emerald)" : score >= 50 ? "var(--imta-teal)" : "oklch(0.65 0.18 25)",
					} as React.CSSProperties
				}
			/>
		</div>
	);
}

export function AssessmentCard({ assessment }: { assessment: Assessment }) {
	const [expanded, setExpanded] = useState(false);
	const assessedDate = assessment.assessedAt
		? new Date(assessment.assessedAt as string).toLocaleDateString("fr-FR")
		: null;

	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
			<Card>
				<CardContent className="pt-5">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
						<div className="min-w-0 flex-1 space-y-2">
							<div className="flex flex-wrap items-center gap-2">
								<h3 className="font-semibold text-sm">{assessment.skillName}</h3>
								{assessment.skillNameFr && assessment.skillNameFr !== assessment.skillName && (
									<span className="text-muted-foreground text-xs">/ {assessment.skillNameFr}</span>
								)}
								<LevelBadge level={assessment.currentLevel} />
							</div>

							<div className="flex flex-wrap gap-3 text-muted-foreground text-xs">
								<span className="flex items-center gap-1">
									<ListChecksIcon className="size-3" />
									<span>{formatSkillCategory(assessment.category)}</span>
								</span>
								{assessment.field && (
									<span className="flex items-center gap-1">
										<TargetIcon className="size-3" />
										<span>{formatFieldName(assessment.field)}</span>
									</span>
								)}
								{assessment.timeSpent != null && (
									<span className="flex items-center gap-1">
										<ClockIcon className="size-3" />
										{assessment.timeSpent}min
									</span>
								)}
								{assessedDate && <span>{assessedDate}</span>}
							</div>

							<ScoreBar score={assessment.score} label={t`Overall Score`} />

							{assessment.confidenceScore != null && (
								<ScoreBar score={assessment.confidenceScore} label={t`Confidence`} />
							)}
						</div>

						<Button size="sm" variant="ghost" onClick={() => setExpanded((v) => !v)} className="shrink-0 text-xs">
							{expanded ? <Trans>Hide Details</Trans> : <Trans>View Details</Trans>}
						</Button>
					</div>

					{expanded && assessment.detailedResults && (
						<div className="mt-4 space-y-4 border-t pt-4">
							{Object.keys(assessment.detailedResults.topicScores).length > 0 && (
								<div className="space-y-2">
									<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
										<Trans>Topic Scores</Trans>
									</p>
									{Object.entries(assessment.detailedResults.topicScores).map(([topic, score]) => (
										<ScoreBar key={topic} score={score} label={topic} />
									))}
								</div>
							)}

							{assessment.detailedResults.strengths.length > 0 && (
								<div className="space-y-1">
									<p className="font-medium text-emerald-600 text-xs uppercase tracking-wide">
										<Trans>Strengths</Trans>
									</p>
									<ul className="space-y-0.5">
										{assessment.detailedResults.strengths.map((s) => (
											<li key={s} className="flex items-center gap-1.5 text-xs">
												<CheckCircleIcon className="size-3 shrink-0 text-emerald-500" />
												{s}
											</li>
										))}
									</ul>
								</div>
							)}

							{assessment.detailedResults.weaknesses.length > 0 && (
								<div className="space-y-1">
									<p className="font-medium text-destructive text-xs uppercase tracking-wide">
										<Trans>Areas to Improve</Trans>
									</p>
									<ul className="space-y-0.5">
										{assessment.detailedResults.weaknesses.map((w) => (
											<li key={w} className="flex items-center gap-1.5 text-xs">
												<WarningCircleIcon className="size-3 shrink-0 text-destructive" />
												{w}
											</li>
										))}
									</ul>
								</div>
							)}

							{assessment.detailedResults.recommendations.length > 0 && (
								<div className="space-y-1">
									<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
										<Trans>Recommendations</Trans>
									</p>
									<ul className="space-y-0.5">
										{assessment.detailedResults.recommendations.map((r) => (
											<li key={r} className="text-muted-foreground text-xs">
												{r}
											</li>
										))}
									</ul>
								</div>
							)}

							{assessment.aiEvaluation && (
								<div className="rounded-lg bg-muted/50 p-3">
									<p className="mb-1 flex items-center gap-1 font-medium text-xs">
										<SparkleIcon className="size-3 text-amber-500" />
										<Trans>AI Evaluation</Trans>
									</p>
									<p className="text-muted-foreground text-xs leading-relaxed">{assessment.aiEvaluation}</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

export function AIAssessmentDialog({
	open,
	onOpenChange,
	onAssess,
	isAssessing,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	onAssess: (data: { skillId: string; skillName: string; category: string; field?: string }) => void;
	isAssessing: boolean;
}) {
	const [skillName, setSkillName] = useState("");
	const [category, setCategory] = useState("");
	const [field, setField] = useState("");

	const handleSubmit = () => {
		if (!skillName.trim() || !category.trim()) {
			toast.error(t`Please fill in skill name and category`);
			return;
		}
		onAssess({
			skillId: skillName.trim().toLowerCase().replace(/\s+/g, "-"),
			skillName: skillName.trim(),
			category: category.trim(),
			field: field.trim() || undefined,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<SparkleIcon className="size-5 text-amber-500" />
						<Trans>AI Skill Assessment</Trans>
					</DialogTitle>
				</DialogHeader>

				<p className="text-muted-foreground text-sm">
					<Trans>Our AI will evaluate your skill level based on your profile and learning history.</Trans>
				</p>

				<div className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="assess-skillName">
							<Trans>Skill Name</Trans>
						</Label>
						<Input
							id="assess-skillName"
							placeholder={t`e.g. Python, Risk Assessment, AutoCAD`}
							value={skillName}
							onChange={(e) => setSkillName(e.target.value)}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="assess-category">
							<Trans>Category</Trans>
						</Label>
						<Input
							id="assess-category"
							placeholder={t`e.g. technical, soft, certifications`}
							value={category}
							onChange={(e) => setCategory(e.target.value)}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="assess-field">
							<Trans>Field (optional)</Trans>
						</Label>
						<Input
							id="assess-field"
							placeholder={t`e.g. healthcare, industrial`}
							value={field}
							onChange={(e) => setField(e.target.value)}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Cancel</Trans>
					</Button>
					<Button onClick={handleSubmit} disabled={isAssessing} className="gap-2">
						<SparkleIcon className="size-4" />
						{isAssessing ? <Trans>Assessing...</Trans> : <Trans>Start Assessment</Trans>}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
