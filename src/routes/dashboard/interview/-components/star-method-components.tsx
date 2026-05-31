// Sub-components for the STAR method trainer
// Extracted to keep the route file under 500 lines

import { Trans } from "@lingui/react/macro";
import {
	BookOpenIcon,
	CheckCircleIcon,
	ClockCounterClockwiseIcon,
	LightbulbIcon,
	ListChecksIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	CATEGORY_LABELS,
	STAR_COMPONENT_BORDER_COLORS,
	STAR_COMPONENT_COLORS,
	STAR_COMPONENT_TEXT_COLORS,
	STAR_EXAMPLES,
	STAR_STEPS,
} from "./star-method-config";
import type { ActiveTab, StarEvaluation, StarHistoryEntry } from "./star-method-types";

// --- Examples Tab ---

export function StarExamplesTab() {
	return (
		<div className="space-y-4">
			<div>
				<h2 className="font-semibold text-lg">
					<Trans>STAR Example Bank</Trans>
				</h2>
				<p className="text-muted-foreground text-sm">
					<Trans>Study these model answers to understand the STAR structure in practice.</Trans>
				</p>
			</div>
			<div className="space-y-4">
				{STAR_EXAMPLES.map((example) => (
					<Card key={example.id}>
						<CardHeader className="pb-3">
							<Badge variant="outline" className="w-fit">
								{CATEGORY_LABELS[example.category]}
							</Badge>
							<CardTitle className="text-base">{example.questionFr}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{STAR_STEPS.map((step) => (
								<div key={step.key} className="space-y-1">
									<div className="flex items-center gap-2">
										<div
											className={`flex size-6 items-center justify-center rounded-full font-bold text-white text-xs ${STAR_COMPONENT_COLORS[step.letter]}`}
										>
											{step.letter}
										</div>
										<span className={`font-semibold text-sm ${STAR_COMPONENT_TEXT_COLORS[step.letter]}`}>
											{step.label}
										</span>
									</div>
									<p className="pl-8 text-sm leading-relaxed">{example[step.key]}</p>
								</div>
							))}
							{example.keyPoints.length > 0 && (
								<div className="rounded-md bg-emerald-50 p-3 dark:bg-emerald-950/20">
									<div className="flex items-start gap-2">
										<ListChecksIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
										<div>
											<p className="mb-1 font-medium text-emerald-800 text-xs dark:text-emerald-200">
												<Trans>Key points of this answer:</Trans>
											</p>
											<ul className="space-y-0.5">
												{example.keyPoints.map((point, i) => (
													<li key={i} className="text-emerald-700 text-xs dark:text-emerald-300">
														• {point}
													</li>
												))}
											</ul>
										</div>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

// --- History Tab ---

type StarHistoryTabProps = {
	history: StarHistoryEntry[];
	onStartExercise: () => void;
};

export function StarHistoryTab({ history, onStartExercise }: StarHistoryTabProps) {
	return (
		<div className="space-y-4">
			<div>
				<h2 className="font-semibold text-lg">
					<Trans>Practice History</Trans>
				</h2>
				<p className="text-muted-foreground text-sm">
					<Trans>Review your previous STAR exercises and evaluations.</Trans>
				</p>
			</div>
			{history.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<ClockCounterClockwiseIcon className="mb-4 size-12 text-muted-foreground" />
						<h3 className="font-semibold text-lg">
							<Trans>No exercises completed</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>Complete your first STAR exercise to see your history here.</Trans>
						</p>
						<Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={onStartExercise}>
							<Trans>Start an exercise</Trans>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{history.map((entry) => (
						<Card key={entry.id}>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<Badge variant="outline">{CATEGORY_LABELS[entry.category]}</Badge>
									<div className="flex items-center gap-2">
										{entry.evaluation && (
											<Badge
												className={
													entry.evaluation.overallScore >= 80
														? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
														: entry.evaluation.overallScore >= 60
															? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
															: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
												}
											>
												{entry.evaluation.overallScore}/100
											</Badge>
										)}
										<span className="text-muted-foreground text-xs">
											{new Date(entry.completedAt).toLocaleDateString("fr-FR")}
										</span>
									</div>
								</div>
								<CardTitle className="text-sm leading-relaxed">{entry.questionFr}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-2">
									{STAR_STEPS.map((step) => (
										<div key={step.key} className="space-y-0.5">
											<div className="flex items-center gap-1">
												<div
													className={`flex size-4 items-center justify-center rounded-full font-bold text-[10px] text-white ${STAR_COMPONENT_COLORS[step.letter]}`}
												>
													{step.letter}
												</div>
												<span className="font-medium text-xs">{step.label}</span>
											</div>
											<p className="line-clamp-2 pl-5 text-muted-foreground text-xs">{entry.response[step.key]}</p>
										</div>
									))}
								</div>
								{entry.evaluation && (
									<div className="mt-3 rounded-md border-t pt-3">
										<p className="text-muted-foreground text-xs">{entry.evaluation.overallFeedback}</p>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

// --- Evaluation Results ---

type EvaluationResultsProps = {
	evaluation: StarEvaluation;
	onReset: () => void;
	onSetTab: (tab: ActiveTab) => void;
};

function getScoreColor(score: number) {
	if (score >= 80) return "text-emerald-600";
	if (score >= 60) return "text-amber-600";
	return "text-red-600";
}

function getScoreLabel(score: number) {
	if (score >= 80) return "Excellent";
	if (score >= 60) return "Good";
	if (score >= 40) return "Needs improvement";
	return "Insufficient";
}

export function StarEvaluationResults({ evaluation, onReset, onSetTab }: EvaluationResultsProps) {
	return (
		<div className="space-y-4">
			{/* Score overview */}
			<Card className="border-emerald-200">
				<CardHeader className="text-center">
					<div className="mx-auto mb-2 flex size-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
						<span className={`font-bold text-3xl ${getScoreColor(evaluation.overallScore)}`}>
							{evaluation.overallScore}
						</span>
					</div>
					<CardTitle>
						<Trans>Your overall score</Trans>
					</CardTitle>
					<Badge className="mx-auto w-fit bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
						{getScoreLabel(evaluation.overallScore)}
					</Badge>
				</CardHeader>
				<CardContent>
					<p className="text-center text-sm">{evaluation.overallFeedback}</p>
				</CardContent>
			</Card>

			{/* Component scores */}
			<div className="grid grid-cols-2 gap-3">
				{STAR_STEPS.map((step, idx) => {
					const compScore = evaluation.componentScores[idx];
					return (
						<Card key={step.key} className={`border ${STAR_COMPONENT_BORDER_COLORS[step.letter]}`}>
							<CardContent className="pt-4">
								<div className="mb-2 flex items-center gap-2">
									<div
										className={`flex size-7 items-center justify-center rounded-full font-bold text-sm text-white ${STAR_COMPONENT_COLORS[step.letter]}`}
									>
										{step.letter}
									</div>
									<span className="font-medium text-sm">{step.label}</span>
								</div>
								<div className={`font-bold text-2xl ${getScoreColor(compScore?.score ?? 0)}`}>
									{compScore?.score ?? 0}
								</div>
								<Progress value={compScore?.score ?? 0} className="my-1 h-1.5" />
								{compScore?.feedback && <p className="text-muted-foreground text-xs">{compScore.feedback}</p>}
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Strengths and improvements */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{evaluation.strengths.length > 0 && (
					<Card className="border-emerald-200">
						<CardHeader className="pb-2">
							<CardTitle className="text-emerald-700 text-sm">
								<Trans>Points forts</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-1">
								{evaluation.strengths.map((s, i) => (
									<li key={i} className="flex items-start gap-2 text-sm">
										<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-emerald-500" />
										{s}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				)}
				{evaluation.improvements.length > 0 && (
					<Card className="border-amber-200">
						<CardHeader className="pb-2">
							<CardTitle className="text-amber-700 text-sm">
								<Trans>To improve</Trans>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-1">
								{evaluation.improvements.map((s, i) => (
									<li key={i} className="flex items-start gap-2 text-sm">
										<LightbulbIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
										{s}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Model answer */}
			{evaluation.modelAnswer && (
				<Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
					<CardHeader className="pb-2">
						<CardTitle className="text-blue-700 text-sm dark:text-blue-300">
							<Trans>Model Answer Example</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm leading-relaxed">{evaluation.modelAnswer}</p>
					</CardContent>
				</Card>
			)}

			{/* Actions */}
			<div className="flex flex-wrap justify-center gap-3">
				<Button onClick={onReset} className="bg-emerald-600 hover:bg-emerald-700">
					<Trans>New exercise</Trans>
				</Button>
				<Button variant="outline" onClick={() => onSetTab("examples")}>
					<BookOpenIcon className="mr-2 size-4" />
					<Trans>View examples</Trans>
				</Button>
				<Button variant="outline" onClick={() => onSetTab("history")}>
					<ClockCounterClockwiseIcon className="mr-2 size-4" />
					<Trans>Mon historique</Trans>
				</Button>
			</div>
		</div>
	);
}
