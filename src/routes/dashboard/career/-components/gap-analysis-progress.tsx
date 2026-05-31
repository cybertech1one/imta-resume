import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	ChartLineUpIcon,
	DownloadSimpleIcon,
	ListChecksIcon,
	TrendUpIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GapAnalysisData } from "./gap-analysis-types";

// ─── Progress Tab ───────────────────────────────────────────────────────────────

interface ProgressTabContentProps {
	gapData: GapAnalysisData;
}

export function ProgressTabContent({ gapData }: ProgressTabContentProps) {
	if (gapData.progressRecords.length > 0) {
		return (
			<>
				{/* Progress Timeline */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendUpIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Progress History</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Track the evolution of your skills over time</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{gapData.progressRecords
								.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
								.slice(0, 10)
								.map((record, index) => (
									<motion.div
										key={`${record.skillId}-${record.date}`}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.05 }}
										className="flex items-center gap-4 rounded-lg border p-4"
									>
										<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
											{record.newLevel > record.previousLevel ? (
												<TrendUpIcon className="size-5 text-green-500" />
											) : (
												<ChartLineUpIcon className="size-5 text-primary" />
											)}
										</div>
										<div className="min-w-0 flex-1">
											<p className="font-medium">{record.skillName}</p>
											<p className="text-muted-foreground text-sm">
												{new Date(record.date).toLocaleDateString("fr-FR", {
													day: "numeric",
													month: "long",
													year: "numeric",
												})}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant="secondary">{record.previousLevel}</Badge>
											<ArrowRightIcon className="size-4 text-muted-foreground" />
											<Badge className="bg-green-500">{record.newLevel}</Badge>
										</div>
									</motion.div>
								))}
						</div>
					</CardContent>
				</Card>

				{/* Stats Summary */}
				<div className="grid gap-6 md:grid-cols-3">
					<Card>
						<CardContent className="p-6 text-center">
							<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
								<ListChecksIcon className="size-6 text-primary" />
							</div>
							<p className="mb-1 font-bold text-3xl">{gapData.currentSkills.length}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Total Skills</Trans>
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6 text-center">
							<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-500/10">
								<TrendUpIcon className="size-6 text-green-500" />
							</div>
							<p className="mb-1 font-bold text-3xl">{gapData.progressRecords.length}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Updates</Trans>
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6 text-center">
							<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-amber-500/10">
								<DownloadSimpleIcon className="size-6 text-amber-500" />
							</div>
							<p className="mb-1 font-bold text-3xl">{gapData.exportHistory.length}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Rapports Exportes</Trans>
							</p>
						</CardContent>
					</Card>
				</div>
			</>
		);
	}

	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center py-12 text-center">
				<TrendUpIcon className="mb-4 size-12 text-muted-foreground/50" />
				<h3 className="mb-2 font-medium text-lg">
					<Trans>No Progress History</Trans>
				</h3>
				<p className="max-w-sm text-muted-foreground">
					<Trans>Update your skill levels to start tracking your progress.</Trans>
				</p>
			</CardContent>
		</Card>
	);
}
