import { Trans } from "@lingui/react/macro";
import { BookOpenIcon, ChartBarIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/style";
import { CATEGORY_CONFIG } from "./gap-analysis-config";
import type { SkillCategory, SkillGap } from "./gap-analysis-types";

// ─── Industry Benchmarks ────────────────────────────────────────────────────────

interface IndustryBenchmarksProps {
	filteredGaps: SkillGap[];
	onViewResources: (gap: SkillGap) => void;
}

export function IndustryBenchmarks({ filteredGaps, onViewResources }: IndustryBenchmarksProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ChartBarIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Industry Benchmarks</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Compare your skills with industry average levels</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{filteredGaps.map((gap, index) => {
						const config = CATEGORY_CONFIG[gap.category];
						const CategoryIcon = config.icon;
						const currentPercent = (gap.currentLevel / 5) * 100;
						const requiredPercent = (gap.requiredLevel / 5) * 100;
						const benchmarkPercent = (gap.industryBenchmark / 5) * 100;

						return (
							<motion.div
								key={gap.skillName}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
								className="rounded-lg border p-4"
							>
								<div className="mb-3 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className={cn("rounded-lg p-1.5", config.color)}>
											<CategoryIcon className="size-4" />
										</div>
										<span className="font-medium">{gap.skillName}</span>
										<Badge
											variant="outline"
											className={cn(
												gap.importance === "critical" && "border-red-500 text-red-500",
												gap.importance === "important" && "border-amber-500 text-amber-500",
											)}
										>
											{gap.importance === "critical" && "Critical"}
											{gap.importance === "important" && "Important"}
											{gap.importance === "nice-to-have" && "Nice to have"}
										</Badge>
									</div>
									<Button size="sm" variant="ghost" onClick={() => onViewResources(gap)}>
										<BookOpenIcon className="mr-1 size-4" />
										<Trans>Resources</Trans>
									</Button>
								</div>

								<div className="relative h-8 rounded-full bg-muted">
									{/* Industry Benchmark Marker */}
									<div className="absolute top-0 h-full w-1 bg-blue-500" style={{ left: `${benchmarkPercent}%` }}>
										<div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-blue-500 text-xs">
											Industry: {gap.industryBenchmark.toFixed(1)}
										</div>
									</div>

									{/* Required Level Marker */}
									<div className="absolute top-0 h-full w-1 bg-amber-500" style={{ left: `${requiredPercent}%` }}>
										<div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-amber-500 text-xs">
											Required: {gap.requiredLevel}
										</div>
									</div>

									{/* Current Level Bar */}
									<motion.div
										className={cn(
											"h-full rounded-full",
											gap.currentLevel >= gap.requiredLevel ? "bg-green-500" : "bg-primary",
										)}
										initial={{ width: 0 }}
										animate={{ width: `${currentPercent}%` }}
										transition={{ duration: 0.8, delay: index * 0.05 }}
									/>

									{/* Current Level Label */}
									<div
										className="absolute top-1/2 -translate-y-1/2 font-medium text-white text-xs"
										style={{ left: `${Math.min(currentPercent - 5, 85)}%` }}
									>
										{gap.currentLevel > 0 && gap.currentLevel}
									</div>
								</div>

								<div className="mt-6 flex items-center justify-between text-muted-foreground text-xs">
									<span>
										<Trans>Gap: {gap.gapSize} level(s)</Trans>
									</span>
									<span>
										<Trans>Estimated time: {gap.timeToClose} weeks</Trans>
									</span>
								</div>
							</motion.div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Gap Summary by Category ────────────────────────────────────────────────────

interface GapSummaryCategoriesProps {
	skillGaps: SkillGap[];
}

export function GapSummaryCategories({ skillGaps }: GapSummaryCategoriesProps) {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{(Object.keys(CATEGORY_CONFIG) as SkillCategory[]).map((category) => {
				const categoryGaps = skillGaps.filter((g) => g.category === category);
				if (categoryGaps.length === 0) return null;

				const config = CATEGORY_CONFIG[category];
				const CategoryIcon = config.icon;
				const avgGap = categoryGaps.reduce((sum, g) => sum + g.gapSize, 0) / categoryGaps.length;
				const gapsCount = categoryGaps.filter((g) => g.gapSize > 0).length;

				return (
					<Card key={category}>
						<CardContent className="p-6">
							<div className="mb-4 flex items-center gap-3">
								<div className={cn("rounded-lg p-2", config.color)}>
									<CategoryIcon className="size-5" weight="duotone" />
								</div>
								<div>
									<h4 className="font-medium">{config.label}</h4>
									<p className="text-muted-foreground text-sm">{categoryGaps.length} skill(s)</p>
								</div>
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">
										<Trans>Gaps</Trans>
									</span>
									<span className="font-medium">
										{gapsCount} / {categoryGaps.length}
									</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">
										<Trans>Average Gap</Trans>
									</span>
									<span className="font-medium">{avgGap.toFixed(1)} level(s)</span>
								</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
