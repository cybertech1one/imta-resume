import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BookmarkSimpleIcon,
	BriefcaseIcon,
	CaretDownIcon,
	CheckCircleIcon,
	ClockIcon,
	CurrencyCircleDollarIcon,
	GraduationCapIcon,
	LightningIcon,
	MagnifyingGlassIcon,
	PlusCircleIcon,
	ScalesIcon,
	SparkleIcon,
	StarIcon,
	TrendUpIcon,
	TrophyIcon,
	UsersIcon,
	XIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";
import { categoryColors, categoryIcons, categoryLabels, demandLevelLabels } from "./compare-config";
import type { ComparisonProgram, ProgramListItem, Recommendations, SkillAnalysis } from "./compare-types";

type CompareHeroSectionProps = {
	allProgramsCount: number;
	selectedCount: number;
};

export function CompareHeroSection({ allProgramsCount, selectedCount }: CompareHeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-indigo-500/5 to-purple-500/10 p-8 md:p-12"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.4, 0.2, 0.4],
					}}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-indigo-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.2, 0.4, 0.2],
					}}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<div className="mb-6">
					<Link to="/dashboard/resources">
						<Button variant="ghost" size="sm" className="gap-2">
							<ArrowLeftIcon className="size-4" />
							<Trans>Back to Training Center</Trans>
						</Button>
					</Link>
				</div>

				<div className="mb-4 flex items-center gap-3">
					<div className="flex size-12 items-center justify-center rounded-2xl bg-primary/20">
						<ScalesIcon className="size-6 text-primary" weight="duotone" />
					</div>
					<div>
						<h1 className="font-bold text-3xl tracking-tight">
							<Trans>Compare Programs</Trans>
						</h1>
						<p className="text-muted-foreground">
							<Trans>Find the program that best suits you</Trans>
						</p>
					</div>
				</div>

				<p className="mb-6 max-w-2xl text-muted-foreground">
					<Trans>
						Compare up to 4 training programs side by side. Analyze durations, salaries, skills and career outcomes to
						make an informed decision about your professional future.
					</Trans>
				</p>

				<div className="flex flex-wrap gap-4">
					<div className="flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 backdrop-blur-sm">
						<GraduationCapIcon className="size-5 text-primary" />
						<span className="font-medium">{allProgramsCount} programs available</span>
					</div>
					<div className="flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 backdrop-blur-sm">
						<ScalesIcon className="size-5 text-indigo-500" />
						<span className="font-medium">{selectedCount}/4 selected</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
}

type ProgramSelectorCardProps = {
	selectedProgramIds: string[];
	allPrograms: ProgramListItem[] | undefined;
	availablePrograms: ProgramListItem[];
	isAddOpen: boolean;
	setIsAddOpen: (open: boolean) => void;
	addProgram: (programId: string) => void;
	removeProgram: (programId: string) => void;
};

export function ProgramSelectorCard({
	selectedProgramIds,
	allPrograms,
	availablePrograms,
	isAddOpen,
	setIsAddOpen,
	addProgram,
	removeProgram,
}: ProgramSelectorCardProps) {
	return (
		<Card className="mb-8">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<PlusCircleIcon className="size-5 text-primary" />
					<Trans>Select Programs</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Choose between 2 and 4 programs to compare</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap items-center gap-3">
					<AnimatePresence mode="popLayout">
						{selectedProgramIds.map((programId: string) => {
							const program = allPrograms?.find((p) => p.id === programId);
							if (!program) return null;

							const CategoryIcon = categoryIcons[program.category] ?? GraduationCapIcon;

							return (
								<motion.div
									key={programId}
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.8 }}
									layout
								>
									<Badge
										variant="secondary"
										className={cn("flex items-center gap-2 px-3 py-2 text-sm", categoryColors[program.category])}
									>
										<CategoryIcon className="size-4" />
										{program.name}
										<button
											type="button"
											onClick={() => removeProgram(programId)}
											className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
										>
											<XIcon className="size-3" />
										</button>
									</Badge>
								</motion.div>
							);
						})}
					</AnimatePresence>

					{selectedProgramIds.length < 4 && (
						<Popover open={isAddOpen} onOpenChange={setIsAddOpen}>
							<PopoverTrigger asChild>
								<Button variant="outline" className="gap-2 border-dashed">
									<PlusCircleIcon className="size-4" />
									<Trans>Add a program</Trans>
									<CaretDownIcon className="size-4 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80 p-0" align="start">
								<Command>
									<CommandInput placeholder={t`Search for a program...`} />
									<CommandList>
										<CommandEmpty>
											<Trans>No programs found</Trans>
										</CommandEmpty>
										{Object.entries(
											availablePrograms.reduce(
												(acc, p) => {
													const cat = p.category;
													if (!acc[cat]) acc[cat] = [];
													acc[cat].push(p);
													return acc;
												},
												{} as Record<string, typeof availablePrograms>,
											),
										).map(([category, programs]) => (
											<CommandGroup key={category} heading={categoryLabels[category] || category}>
												{programs.map((program) => {
													const CategoryIcon = categoryIcons[program.category] ?? GraduationCapIcon;
													return (
														<CommandItem
															key={program.id}
															value={program.id}
															keywords={[program.name, program.category]}
															onSelect={() => addProgram(program.id)}
														>
															<CategoryIcon className="mr-2 size-4" />
															<span>{program.name}</span>
														</CommandItem>
													);
												})}
											</CommandGroup>
										))}
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					)}
				</div>

				{selectedProgramIds.length < 2 && (
					<p className="mt-4 text-muted-foreground text-sm">
						<Trans>Select at least 2 programs to start comparison</Trans>
					</p>
				)}
			</CardContent>
		</Card>
	);
}

type ComparisonTableProps = {
	programs: ComparisonProgram[];
	recommendations: Recommendations | null;
	maxSalary: number;
};

export function ComparisonTable({ programs, recommendations, maxSalary }: ComparisonTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MagnifyingGlassIcon className="size-5 text-primary" />
					<Trans>Detailed Comparison</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Side-by-side analysis of key criteria</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[200px]">
								<Trans>Criteria</Trans>
							</TableHead>
							{programs.map((program) => {
								const CategoryIcon = categoryIcons[program.category] ?? GraduationCapIcon;
								return (
									<TableHead key={program.id} className="min-w-[180px] text-center">
										<div className="flex flex-col items-center gap-2">
											<div
												className={cn(
													"flex size-10 items-center justify-center rounded-xl",
													categoryColors[program.category],
												)}
											>
												<CategoryIcon className="size-5" />
											</div>
											<span className="font-semibold">{program.name}</span>
											<Badge variant="outline" className="text-xs">
												{categoryLabels[program.category]}
											</Badge>
										</div>
									</TableHead>
								);
							})}
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="font-medium">
								<div className="flex items-center gap-2">
									<ClockIcon className="size-4 text-muted-foreground" />
									<Trans>Duration</Trans>
								</div>
							</TableCell>
							{programs.map((program) => (
								<TableCell key={program.id} className="text-center">
									<Badge variant="secondary">{program.duration}</Badge>
								</TableCell>
							))}
						</TableRow>

						<TableRow>
							<TableCell className="font-medium">
								<div className="flex items-center gap-2">
									<CheckCircleIcon className="size-4 text-muted-foreground" />
									<Trans>Prerequisites</Trans>
								</div>
							</TableCell>
							{programs.map((program) => (
								<TableCell key={program.id}>
									<ul className="space-y-1 text-sm">
										{program.requirements.slice(0, 3).map((req, i) => (
											<li key={i} className="flex items-start gap-1">
												<CheckCircleIcon className="mt-0.5 size-3 shrink-0 text-green-500" />
												<span className="line-clamp-1">{req}</span>
											</li>
										))}
										{program.requirements.length > 3 && (
											<li className="text-muted-foreground">+{program.requirements.length - 3} more</li>
										)}
									</ul>
								</TableCell>
							))}
						</TableRow>

						<TableRow>
							<TableCell className="font-medium">
								<div className="flex items-center gap-2">
									<CurrencyCircleDollarIcon className="size-4 text-muted-foreground" />
									<Trans>Average salary</Trans>
								</div>
							</TableCell>
							{programs.map((program) => {
								const avgSalary = (program.salaryRange.min + program.salaryRange.max) / 2;
								const percentage = (avgSalary / maxSalary) * 100;
								const isBest = recommendations?.bestSalary.id === program.id;

								return (
									<TableCell key={program.id}>
										<div className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<span>
													{program.salaryRange.min.toLocaleString("fr-FR")} -{" "}
													{program.salaryRange.max.toLocaleString("fr-FR")} MAD
												</span>
												{isBest && (
													<Badge className="bg-green-500 text-white text-xs">
														<TrophyIcon className="mr-1 size-3" />
														Best
													</Badge>
												)}
											</div>
											<div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
												<motion.div
													className={cn(
														"absolute inset-y-0 left-0 rounded-full",
														isBest ? "bg-green-500" : "bg-primary",
													)}
													initial={{ width: 0 }}
													animate={{ width: `${percentage}%` }}
													transition={{ duration: 0.8, delay: 0.3 }}
												/>
											</div>
										</div>
									</TableCell>
								);
							})}
						</TableRow>

						<TableRow>
							<TableCell className="font-medium">
								<div className="flex items-center gap-2">
									<TrendUpIcon className="size-4 text-muted-foreground" />
									<Trans>Employment rate</Trans>
								</div>
							</TableCell>
							{programs.map((program) => {
								const isBest = recommendations?.bestEmployment.id === program.id;

								return (
									<TableCell key={program.id}>
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<span
													className={cn(
														"font-bold text-lg",
														program.employmentRate >= 90
															? "text-green-600"
															: program.employmentRate >= 80
																? "text-blue-600"
																: "text-amber-600",
													)}
												>
													{program.employmentRate}%
												</span>
												{isBest && (
													<Badge className="bg-green-500 text-white text-xs">
														<TrophyIcon className="mr-1 size-3" />
														Best
													</Badge>
												)}
											</div>
											<Progress
												value={program.employmentRate}
												className={cn("h-2", isBest && "[&>div]:bg-green-500")}
											/>
										</div>
									</TableCell>
								);
							})}
						</TableRow>

						<TableRow>
							<TableCell className="font-medium">
								<div className="flex items-center gap-2">
									<LightningIcon className="size-4 text-muted-foreground" />
									<Trans>Growth</Trans>
								</div>
							</TableCell>
							{programs.map((program) => {
								const isBest = recommendations?.highestGrowth.id === program.id;

								return (
									<TableCell key={program.id} className="text-center">
										<div className="flex items-center justify-center gap-2">
											<Badge className={cn(isBest ? "bg-green-500 text-white" : "bg-blue-100 text-blue-700")}>
												+{program.growthRate}%
											</Badge>
											{isBest && <TrophyIcon className="size-4 text-green-500" />}
										</div>
									</TableCell>
								);
							})}
						</TableRow>

						<TableRow>
							<TableCell className="font-medium">
								<div className="flex items-center gap-2">
									<UsersIcon className="size-4 text-muted-foreground" />
									<Trans>Demand level</Trans>
								</div>
							</TableCell>
							{programs.map((program) => {
								const demandInfo = demandLevelLabels[program.demandLevel] || {
									label: program.demandLevel,
									color: "bg-gray-500",
								};

								return (
									<TableCell key={program.id} className="text-center">
										<Badge className={demandInfo.color}>{demandInfo.label}</Badge>
									</TableCell>
								);
							})}
						</TableRow>

						<TableRow>
							<TableCell className="font-medium">
								<div className="flex items-center gap-2">
									<BriefcaseIcon className="size-4 text-muted-foreground" />
									<Trans>Career Prospects</Trans>
								</div>
							</TableCell>
							{programs.map((program) => (
								<TableCell key={program.id}>
									<div className="flex flex-wrap gap-1">
										{program.careerProspects.slice(0, 4).map((prospect, i) => (
											<Badge key={i} variant="outline" className="text-xs">
												{prospect}
											</Badge>
										))}
										{program.careerProspects.length > 4 && (
											<Badge variant="outline" className="text-xs">
												+{program.careerProspects.length - 4}
											</Badge>
										)}
									</div>
								</TableCell>
							))}
						</TableRow>
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

type SalaryComparisonCardProps = {
	programs: ComparisonProgram[];
	recommendations: Recommendations | null;
	maxSalary: number;
};

export function SalaryComparisonCard({ programs, recommendations, maxSalary }: SalaryComparisonCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CurrencyCircleDollarIcon className="size-5 text-green-500" />
					<Trans>Salary Comparison</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Salary range by program (MAD/month)</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{programs.map((program, index) => {
						const isBest = recommendations?.bestSalary.id === program.id;
						const minPercent = (program.salaryRange.min / maxSalary) * 100;
						const maxPercent = (program.salaryRange.max / maxSalary) * 100;

						return (
							<motion.div
								key={program.id}
								initial={false}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
								className="space-y-2"
							>
								<div className="flex items-center justify-between">
									<span className="font-medium">{program.name}</span>
									{isBest && (
										<Badge className="bg-green-500 text-white">
											<TrophyIcon className="mr-1 size-3" />
											Best salary
										</Badge>
									)}
								</div>
								<div className="relative h-8 w-full rounded-lg bg-muted">
									<motion.div
										className={cn(
											"absolute inset-y-1 rounded-md",
											isBest
												? "bg-gradient-to-r from-green-400 to-green-600"
												: "bg-gradient-to-r from-primary/60 to-primary",
										)}
										style={{
											left: `${minPercent}%`,
										}}
										initial={{ width: 0 }}
										animate={{ width: `${maxPercent - minPercent}%` }}
										transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
									/>
									<div
										className="absolute top-1/2 -translate-y-1/2 font-medium text-white text-xs"
										style={{ left: `${(minPercent + maxPercent) / 2}%`, transform: "translate(-50%, -50%)" }}
									>
										{program.salaryRange.min.toLocaleString("fr-FR")} -{" "}
										{program.salaryRange.max.toLocaleString("fr-FR")}
									</div>
								</div>
							</motion.div>
						);
					})}
				</div>

				<div className="mt-4 flex justify-between text-muted-foreground text-xs">
					<span>0 MAD</span>
					<span>{(maxSalary / 2).toLocaleString("fr-FR")} MAD</span>
					<span>{maxSalary.toLocaleString("fr-FR")} MAD</span>
				</div>
			</CardContent>
		</Card>
	);
}

type EmploymentRateCardProps = {
	programs: ComparisonProgram[];
	recommendations: Recommendations | null;
};

export function EmploymentRateCard({ programs, recommendations }: EmploymentRateCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendUpIcon className="size-5 text-blue-500" />
					<Trans>Employment Rate</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Percentage of graduates employed</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{programs.map((program, index) => {
						const isBest = recommendations?.bestEmployment.id === program.id;

						return (
							<motion.div
								key={program.id}
								initial={false}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
								className="space-y-2"
							>
								<div className="flex items-center justify-between">
									<span className="font-medium">{program.name}</span>
									<div className="flex items-center gap-2">
										<span
											className={cn(
												"font-bold",
												program.employmentRate >= 90
													? "text-green-600"
													: program.employmentRate >= 80
														? "text-blue-600"
														: "text-amber-600",
											)}
										>
											{program.employmentRate}%
										</span>
										{isBest && <TrophyIcon className="size-4 text-green-500" />}
									</div>
								</div>
								<div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
									<motion.div
										className={cn(
											"absolute inset-y-0 left-0 rounded-full",
											isBest
												? "bg-gradient-to-r from-green-400 to-green-600"
												: program.employmentRate >= 90
													? "bg-green-500"
													: program.employmentRate >= 80
														? "bg-blue-500"
														: "bg-amber-500",
										)}
										initial={{ width: 0 }}
										animate={{ width: `${program.employmentRate}%` }}
										transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
									/>
								</div>
							</motion.div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

type SkillsAnalysisCardProps = {
	skillAnalysis: SkillAnalysis;
};

export function SkillsAnalysisCard({ skillAnalysis }: SkillsAnalysisCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<SparkleIcon className="size-5 text-purple-500" />
					<Trans>Skills Analysis</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Common and unique skills for each program</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-6 lg:grid-cols-2">
					<div>
						<h4 className="mb-3 flex items-center gap-2 font-semibold">
							<CheckCircleIcon className="size-4 text-green-500" />
							<Trans>Common Skills</Trans>
							<Badge variant="secondary">{skillAnalysis.commonSkills.length}</Badge>
						</h4>
						<div className="flex flex-wrap gap-2">
							{skillAnalysis.commonSkills.map((skill) => (
								<Badge
									key={skill}
									variant="outline"
									className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
								>
									{skill}
								</Badge>
							))}
							{skillAnalysis.commonSkills.length === 0 && (
								<p className="text-muted-foreground text-sm">
									<Trans>No common skills identified</Trans>
								</p>
							)}
						</div>
					</div>

					<div>
						<h4 className="mb-3 flex items-center gap-2 font-semibold">
							<StarIcon className="size-4 text-amber-500" />
							<Trans>Unique Skills</Trans>
						</h4>
						<div className="space-y-3">
							{Array.from(skillAnalysis.uniqueSkills.entries()).map(([programName, skills]) => (
								<div key={programName}>
									<p className="mb-1 font-medium text-muted-foreground text-sm">{programName}:</p>
									<div className="flex flex-wrap gap-1">
										{skills.slice(0, 5).map((skill) => (
											<Badge key={skill} variant="outline" className="text-xs">
												{skill}
											</Badge>
										))}
										{skills.length > 5 && (
											<Badge variant="outline" className="text-xs">
												+{skills.length - 5}
											</Badge>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

type RecommendationsCardProps = {
	recommendations: Recommendations;
};

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
	return (
		<Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrophyIcon className="size-5 text-amber-500" weight="fill" />
					<Trans>Recommendations</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Which program to choose based on your priorities</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<motion.div
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 }}
									className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-all hover:border-green-500/50 hover:shadow-md"
								>
									<div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
										<CurrencyCircleDollarIcon className="size-6 text-green-600 dark:text-green-400" weight="duotone" />
									</div>
									<Badge className="bg-green-500 text-white">Best salary</Badge>
									<span className="font-semibold">{recommendations.bestSalary.name}</span>
									<span className="text-muted-foreground text-sm">
										up to {recommendations.bestSalary.salaryRange.max.toLocaleString("fr-FR")} MAD
									</span>
								</motion.div>
							</TooltipTrigger>
							<TooltipContent>
								<p>If you are looking for the best salary potential</p>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<motion.div
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
									className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-all hover:border-blue-500/50 hover:shadow-md"
								>
									<div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
										<TrendUpIcon className="size-6 text-blue-600 dark:text-blue-400" weight="duotone" />
									</div>
									<Badge className="bg-blue-500 text-white">Best emploi</Badge>
									<span className="font-semibold">{recommendations.bestEmployment.name}</span>
									<span className="text-muted-foreground text-sm">
										{recommendations.bestEmployment.employmentRate}% employment rate
									</span>
								</motion.div>
							</TooltipTrigger>
							<TooltipContent>
								<p>If you are looking for the best employability</p>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<motion.div
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3 }}
									className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-all hover:border-amber-500/50 hover:shadow-md"
								>
									<div className="flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
										<ClockIcon className="size-6 text-amber-600 dark:text-amber-400" weight="duotone" />
									</div>
									<Badge className="bg-amber-500 text-white">Fastest</Badge>
									<span className="font-semibold">{recommendations.quickestTraining.name}</span>
									<span className="text-muted-foreground text-sm">{recommendations.quickestTraining.duration}</span>
								</motion.div>
							</TooltipTrigger>
							<TooltipContent>
								<p>If you want to enter the market quickly</p>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<motion.div
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.4 }}
									className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-all hover:border-purple-500/50 hover:shadow-md"
								>
									<div className="flex size-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
										<LightningIcon className="size-6 text-purple-600 dark:text-purple-400" weight="duotone" />
									</div>
									<Badge className="bg-purple-500 text-white">Highest growth</Badge>
									<span className="font-semibold">{recommendations.highestGrowth.name}</span>
									<span className="text-muted-foreground text-sm">
										+{recommendations.highestGrowth.growthRate}% growth
									</span>
								</motion.div>
							</TooltipTrigger>
							<TooltipContent>
								<p>If you are looking for a booming sector</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>

				<Separator className="my-6" />

				<div className="space-y-3">
					<h4 className="font-semibold">
						<Trans>If you are looking for...</Trans>
					</h4>
					<div className="grid gap-3 md:grid-cols-2">
						<motion.div
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.5 }}
							className="flex items-center gap-3 rounded-lg border bg-green-50/50 p-3 dark:bg-green-950/20"
						>
							<CurrencyCircleDollarIcon className="size-5 text-green-600" />
							<span className="text-sm">
								<strong>A high salary</strong>, choose{" "}
								<span className="font-semibold text-green-600">{recommendations.bestSalary.name}</span>
							</span>
						</motion.div>

						<motion.div
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.6 }}
							className="flex items-center gap-3 rounded-lg border bg-blue-50/50 p-3 dark:bg-blue-950/20"
						>
							<BriefcaseIcon className="size-5 text-blue-600" />
							<span className="text-sm">
								<strong>Quick job placement</strong>, choose{" "}
								<span className="font-semibold text-blue-600">{recommendations.bestEmployment.name}</span>
							</span>
						</motion.div>

						<motion.div
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.7 }}
							className="flex items-center gap-3 rounded-lg border bg-amber-50/50 p-3 dark:bg-amber-950/20"
						>
							<ClockIcon className="size-5 text-amber-600" />
							<span className="text-sm">
								<strong>A short program</strong>, choose{" "}
								<span className="font-semibold text-amber-600">{recommendations.quickestTraining.name}</span>
							</span>
						</motion.div>

						<motion.div
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.8 }}
							className="flex items-center gap-3 rounded-lg border bg-purple-50/50 p-3 dark:bg-purple-950/20"
						>
							<LightningIcon className="size-5 text-purple-600" />
							<span className="text-sm">
								<strong>A future-proof sector</strong>, choose{" "}
								<span className="font-semibold text-purple-600">{recommendations.highestGrowth.name}</span>
							</span>
						</motion.div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

type ActionButtonsCardProps = {
	programs: ComparisonProgram[];
};

export function ActionButtonsCard({ programs }: ActionButtonsCardProps) {
	return (
		<Card>
			<CardContent className="p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h4 className="font-semibold">
							<Trans>Ready to get started?</Trans>
						</h4>
						<p className="text-muted-foreground text-sm">
							<Trans>Explore details of each program or add them to your favorites</Trans>
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						{programs.map((program) => (
							<div key={program.id} className="flex gap-2">
								<Link to="/dashboard/resources/programs/$programId" params={{ programId: program.id }}>
									<Button variant="outline" size="sm" className="gap-2">
										<ArrowRightIcon className="size-4" />
										{program.name}
									</Button>
								</Link>
							</div>
						))}
					</div>
				</div>

				<Separator className="my-4" />

				<div className="flex flex-wrap gap-3">
					{programs.map((program) => (
						<Button key={program.id} variant="secondary" size="sm" className="gap-2">
							<BookmarkSimpleIcon className="size-4" />
							<Trans>Add</Trans> {program.name} <Trans>to my programs</Trans>
						</Button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

type EmptyStateCardProps = {
	allPrograms: ProgramListItem[] | undefined;
	addProgram: (programId: string) => void;
};

export function EmptyStateCard({ allPrograms, addProgram }: EmptyStateCardProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center justify-center py-16 text-center">
					<ScalesIcon className="mb-4 size-16 text-muted-foreground" />
					<h3 className="mb-2 font-semibold text-xl">
						<Trans>Start your comparison</Trans>
					</h3>
					<p className="mb-6 max-w-md text-muted-foreground">
						<Trans>
							Select at least 2 programs above to see a detailed comparison of durations, salaries, skills, and career
							prospects.
						</Trans>
					</p>
					<div className="flex flex-wrap justify-center gap-2">
						{allPrograms?.slice(0, 4).map((program) => {
							const CategoryIcon = categoryIcons[program.category] ?? GraduationCapIcon;
							return (
								<Button
									key={program.id}
									variant="outline"
									size="sm"
									className="gap-2"
									onClick={() => addProgram(program.id)}
								>
									<CategoryIcon className="size-4" />
									{program.name}
								</Button>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
