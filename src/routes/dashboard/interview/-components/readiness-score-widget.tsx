import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	LightbulbIcon,
	SparkleIcon,
	TargetIcon,
	TrophyIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

interface ReadinessScoreWidgetProps {
	enabled: boolean;
}

function getReadinessLevelLabels() {
	return {
		not_ready: "Pas encore pret",
		needs_practice: "Besoin de pratique",
		almost_ready: "Presque pret",
		interview_ready: "Prêt pour l'entretien",
	};
}

const readinessLevelConfig = {
	not_ready: {
		get label() {
			return getReadinessLevelLabels().not_ready;
		},
		color: "text-red-600 dark:text-red-400",
		bgColor: "bg-red-100 dark:bg-red-900/30",
		borderColor: "border-red-200 dark:border-red-800",
		progressColor: "bg-red-500",
		icon: WarningCircleIcon,
	},
	needs_practice: {
		get label() {
			return getReadinessLevelLabels().needs_practice;
		},
		color: "text-amber-600 dark:text-amber-400",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
		borderColor: "border-amber-200 dark:border-amber-800",
		progressColor: "bg-amber-500",
		icon: TargetIcon,
	},
	almost_ready: {
		get label() {
			return getReadinessLevelLabels().almost_ready;
		},
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
		borderColor: "border-blue-200 dark:border-blue-800",
		progressColor: "bg-blue-500",
		icon: ChartLineUpIcon,
	},
	interview_ready: {
		get label() {
			return getReadinessLevelLabels().interview_ready;
		},
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-100 dark:bg-green-900/30",
		borderColor: "border-green-200 dark:border-green-800",
		progressColor: "bg-green-500",
		icon: TrophyIcon,
	},
};

function CircularProgress({ score, size = 120 }: { score: number; size?: number }) {
	const strokeWidth = 8;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (score / 100) * circumference;

	const scoreColor =
		score >= 80
			? "stroke-green-500"
			: score >= 55
				? "stroke-blue-500"
				: score >= 30
					? "stroke-amber-500"
					: "stroke-red-500";

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg width={size} height={size} className="-rotate-90" aria-hidden="true">
				<circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-muted" />
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					className={scoreColor}
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: offset }}
					transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
					strokeDasharray={circumference}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<motion.span
					className="font-bold text-3xl"
					initial={false}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, delay: 0.8 }}
					aria-label={t`Readiness score: ${score} out of 100`}
				>
					{score}
				</motion.span>
				<span className="text-muted-foreground text-xs">/100</span>
			</div>
		</div>
	);
}

export function ReadinessScoreWidget({ enabled }: ReadinessScoreWidgetProps) {
	const { data, isLoading, isError } = useQuery({
		...orpc.interview.getReadinessScore.queryOptions({ input: {} }),
		enabled,
	});

	const levelConfig = useMemo(() => {
		if (!data) return readinessLevelConfig.not_ready;
		return readinessLevelConfig[data.readinessLevel] || readinessLevelConfig.not_ready;
	}, [data]);

	if (isLoading || isError || !data) {
		return null;
	}

	const LevelIcon = levelConfig.icon;
	const breakdownEntries = Object.entries(data.breakdown);

	return (
		<section className="mb-10" aria-labelledby="readiness-score-heading">
			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
				<Card className={cn("relative overflow-hidden border-2", levelConfig.borderColor)}>
					<div
						className="pointer-events-none absolute inset-0"
						style={{
							background:
								"linear-gradient(135deg, oklch(0.65 0.12 280 / 0.06) 0%, oklch(0.7 0.15 150 / 0.04) 50%, transparent 100%)",
						}}
						aria-hidden="true"
					/>

					<CardHeader className="relative z-10 pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2 text-xl">
								<SparkleIcon className="size-6 text-primary" weight="duotone" aria-hidden="true" />
								<Trans>Score de préparation à l'entretien</Trans>
							</CardTitle>
							<Badge className={cn(levelConfig.bgColor, levelConfig.color, "gap-1 font-medium")}>
								<LevelIcon className="size-3.5" weight="bold" aria-hidden="true" />
								{levelConfig.label}
							</Badge>
						</div>
					</CardHeader>

					<CardContent className="relative z-10">
						<div className="flex flex-col gap-8 lg:flex-row lg:items-start">
							{/* Circular score display */}
							<div className="flex flex-col items-center gap-3">
								<CircularProgress score={data.score} />
								<div className="flex items-center gap-4 text-center text-sm">
									<div>
										<p className="font-semibold">{data.stats.totalSessions}</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Sessions</Trans>
										</p>
									</div>
									<div className="h-8 w-px bg-border" aria-hidden="true" />
									<div>
										<p className="font-semibold">{data.stats.averageScore}%</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Moyenne</Trans>
										</p>
									</div>
									<div className="h-8 w-px bg-border" aria-hidden="true" />
									<div>
										<p className="font-semibold">{data.stats.fieldsCovered}/4</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Domaines</Trans>
										</p>
									</div>
								</div>
							</div>

							{/* Breakdown bars */}
							<div className="flex-1 space-y-3">
								<h3 className="mb-2 font-medium text-muted-foreground text-sm">
									<Trans>Détail du score</Trans>
								</h3>
								{breakdownEntries.map(([key, item]) => (
									<div key={key} className="space-y-1">
										<div className="flex items-center justify-between text-sm">
											<span>{item.label}</span>
											<span className="font-medium text-muted-foreground">
												{item.score}/{item.max}
											</span>
										</div>
										<Progress
											value={(item.score / item.max) * 100}
											className="h-2"
											aria-label={`${item.label}: ${item.score} sur ${item.max}`}
										/>
									</div>
								))}
							</div>

							{/* Suggestions */}
							<div className="flex-1 space-y-3 lg:max-w-xs">
								<h3 className="mb-2 flex items-center gap-1.5 font-medium text-muted-foreground text-sm">
									<LightbulbIcon className="size-4 text-amber-500" weight="fill" aria-hidden="true" />
									<Trans>Suggestions</Trans>
								</h3>
								<ul className="space-y-2" aria-label={t`Improvement suggestions`}>
									{data.suggestions.slice(0, 3).map((suggestion, idx) => (
										<motion.li
											key={idx}
											className="flex items-start gap-2 text-sm"
											initial={false}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.5 + idx * 0.1 }}
										>
											<CheckCircleIcon
												className="mt-0.5 size-4 shrink-0 text-primary"
												weight="duotone"
												aria-hidden="true"
											/>
											<span>{suggestion}</span>
										</motion.li>
									))}
								</ul>

								<Link to="/dashboard/interview/analytics" className="mt-3 block">
									<Button variant="outline" size="sm" className="w-full gap-2">
										<ChartLineUpIcon className="size-4" aria-hidden="true" />
										<Trans>Voir l'analyse detaillee</Trans>
										<ArrowRightIcon className="size-3" aria-hidden="true" />
									</Button>
								</Link>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</section>
	);
}
