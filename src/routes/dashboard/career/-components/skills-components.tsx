import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BriefcaseIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClockIcon,
	DownloadSimpleIcon,
	GraduationCapIcon,
	LightbulbIcon,
	ListChecksIcon,
	MagnifyingGlassIcon,
	PlusCircleIcon,
	PlusIcon,
	RocketLaunchIcon,
	TargetIcon,
	TrashIcon,
	TrendUpIcon,
	TrophyIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { StarRating } from "@/components/shared/star-rating";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";

import { CATEGORY_CONFIG, calculateCategoryProgress, FIELD_CONFIG, getSkillGapAnalysis } from "./skills-config";
import type { CareerPath, DbSkill, RequiredSkill, SkillCategory } from "./skills-types";

// ---------------------------------------------------------------------------
// RadialProgressChart
// ---------------------------------------------------------------------------

function RadialProgressChart({
	progress,
	size = 120,
	strokeWidth = 10,
	label,
}: {
	progress: number;
	size?: number;
	strokeWidth?: number;
	label?: string;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (progress / 100) * circumference;

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
				{/* Background circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					className="text-muted/30"
				/>
				{/* Progress circle */}
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: offset }}
					transition={{ duration: 1, ease: "easeOut" }}
					className="text-primary"
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="font-bold text-2xl">{progress}%</span>
				{label && <span className="text-muted-foreground text-xs">{label}</span>}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// SkillsLoadingSkeleton
// ---------------------------------------------------------------------------

export function SkillsLoadingSkeleton() {
	return (
		<div className="space-y-8">
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Card key={i}>
						<CardContent className="p-6">
							<Skeleton className="mb-4 h-10 w-10 rounded-xl" />
							<Skeleton className="mb-2 h-4 w-24" />
							<Skeleton className="h-2 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// SkillsErrorState
// ---------------------------------------------------------------------------

export function SkillsErrorState() {
	return (
		<Card className="border-destructive">
			<CardContent className="flex flex-col items-center py-12 text-center">
				<WarningCircleIcon className="mb-4 size-12 text-destructive" />
				<h3 className="mb-2 font-medium text-lg">
					<Trans>Loading error</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Unable to load your skills. Please try again later.</Trans>
				</p>
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// HeroSection
// ---------------------------------------------------------------------------

export function HeroSection({
	skillsCount,
	overallProgress,
	goalsReached,
}: {
	skillsCount: number;
	overallProgress: number;
	goalsReached: number;
}) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 220 / 0.15) 0%, oklch(0.6 0.2 180 / 0.1) 50%, oklch(0.65 0.18 140 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-green-500/15 to-cyan-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [0, -10, 0],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<ChartBarIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>IMTA Dashboard</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Skills Tracking</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>Manage your skills, set goals, track your progress, and identify gaps to fill for your career.</Trans>
				</motion.p>

				{/* Quick Stats */}
				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<ListChecksIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{skillsCount}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Skills</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<TrendUpIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{overallProgress}%</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Progress</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<TargetIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{goalsReached}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Goals Achieved</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ---------------------------------------------------------------------------
// DashboardTab
// ---------------------------------------------------------------------------

export function DashboardTab({
	skills,
	overallProgress,
	statistics,
	careerPaths,
	selectedCareerPath,
	careerPathAnalysis,
	onSetCareerPath,
	onAddRecommendedSkill,
}: {
	skills: DbSkill[];
	overallProgress: number;
	statistics: { categoryProgress?: Record<string, number>; goalsReached?: number } | undefined;
	careerPaths: CareerPath[];
	selectedCareerPath: string | null;
	careerPathAnalysis: { path: CareerPath; analysis: { met: number; total: number; gaps: RequiredSkill[] } } | null;
	onSetCareerPath: (pathId: string) => void;
	onAddRecommendedSkill: (skill: { name: string; nameFr: string; category: SkillCategory }) => void;
}) {
	return (
		<div className="space-y-8">
			{/* Overall Progress Section */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{/* Overall Progress Card */}
				<Card className="col-span-full md:col-span-2 lg:col-span-1">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<TrendUpIcon className="size-4 text-primary" />
							<Trans>Overall Progress</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center justify-center py-4">
						<RadialProgressChart progress={overallProgress} label={t`Complete`} />
					</CardContent>
				</Card>

				{/* Category Progress Cards */}
				{(Object.keys(CATEGORY_CONFIG) as SkillCategory[]).map((category) => {
					const config = CATEGORY_CONFIG[category];
					const CategoryIcon = config.icon;
					const progress = statistics?.categoryProgress?.[category] ?? calculateCategoryProgress(skills, category);
					const count = skills.filter((s) => s.category === category).length;

					return (
						<motion.div key={category} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
							<Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
								<CardContent className="p-6">
									<div className="mb-4 flex items-center justify-between">
										<div className={cn("flex size-10 items-center justify-center rounded-xl", config.color)}>
											<CategoryIcon className="size-5" weight="duotone" />
										</div>
										<Badge variant="secondary">{count}</Badge>
									</div>
									<h4 className="mb-2 font-medium">{config.label}</h4>
									<div className="space-y-2">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">
												<Trans>Progress</Trans>
											</span>
											<span className="font-medium">{progress}%</span>
										</div>
										<Progress value={progress} className="h-2" />
									</div>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>

			{/* Career Path Analysis */}
			<CareerPathAnalysisCard
				skills={skills}
				careerPaths={careerPaths}
				selectedCareerPath={selectedCareerPath}
				careerPathAnalysis={careerPathAnalysis}
				onSetCareerPath={onSetCareerPath}
				onAddRecommendedSkill={onAddRecommendedSkill}
			/>

			{/* Recent Skills Activity */}
			{skills.length > 0 && <RecentActivityCard skills={skills} />}
		</div>
	);
}

// ---------------------------------------------------------------------------
// CareerPathAnalysisCard
// ---------------------------------------------------------------------------

function CareerPathAnalysisCard({
	skills,
	careerPaths,
	selectedCareerPath,
	careerPathAnalysis,
	onSetCareerPath,
	onAddRecommendedSkill,
}: {
	skills: DbSkill[];
	careerPaths: CareerPath[];
	selectedCareerPath: string | null;
	careerPathAnalysis: { path: CareerPath; analysis: { met: number; total: number; gaps: RequiredSkill[] } } | null;
	onSetCareerPath: (pathId: string) => void;
	onAddRecommendedSkill: (skill: { name: string; nameFr: string; category: SkillCategory }) => void;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BriefcaseIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Career Path Analysis</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Select a career path to see the analysis of your skills</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<Select value={selectedCareerPath || ""} onValueChange={onSetCareerPath}>
					<SelectTrigger className="w-full md:w-80">
						<SelectValue placeholder={t`Select a path`} />
					</SelectTrigger>
					<SelectContent>
						{careerPaths.map((path) => {
							const PathIcon = path.icon;
							const fieldConfig = FIELD_CONFIG[path.field];
							return (
								<SelectItem key={path.id} value={path.id}>
									<div className="flex items-center gap-2">
										<PathIcon className="size-4" />
										<span>{path.name}</span>
										<Badge className={fieldConfig.color} variant="outline">
											{fieldConfig.label}
										</Badge>
									</div>
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>

				{careerPathAnalysis && (
					<motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="space-y-6">
						{/* Progress Overview */}
						<div className="grid gap-6 md:grid-cols-2">
							<div className="rounded-xl border bg-gradient-to-br from-green-500/10 to-transparent p-6">
								<div className="mb-4 flex items-center gap-3">
									<div className="flex size-12 items-center justify-center rounded-full bg-green-500/20">
										<CheckCircleIcon className="size-6 text-green-500" weight="fill" />
									</div>
									<div>
										<p className="font-bold text-3xl text-green-600 dark:text-green-400">
											{careerPathAnalysis.analysis.met}
										</p>
										<p className="text-muted-foreground text-sm">
											<Trans>of {careerPathAnalysis.analysis.total} required skills</Trans>
										</p>
									</div>
								</div>
								<Progress
									value={(careerPathAnalysis.analysis.met / careerPathAnalysis.analysis.total) * 100}
									className="h-2"
								/>
							</div>

							<div className="rounded-xl border bg-gradient-to-br from-amber-500/10 to-transparent p-6">
								<div className="mb-4 flex items-center gap-3">
									<div className="flex size-12 items-center justify-center rounded-full bg-amber-500/20">
										<WarningCircleIcon className="size-6 text-amber-500" weight="fill" />
									</div>
									<div>
										<p className="font-bold text-3xl text-amber-600 dark:text-amber-400">
											{careerPathAnalysis.analysis.gaps.length}
										</p>
										<p className="text-muted-foreground text-sm">
											<Trans>skills to develop</Trans>
										</p>
									</div>
								</div>
								<Progress
									value={
										((careerPathAnalysis.analysis.total - careerPathAnalysis.analysis.gaps.length) /
											careerPathAnalysis.analysis.total) *
										100
									}
									className="h-2"
								/>
							</div>
						</div>

						{/* Skills Gap List */}
						{careerPathAnalysis.analysis.gaps.length > 0 && (
							<div>
								<h4 className="mb-4 flex items-center gap-2 font-medium">
									<TargetIcon className="size-4 text-amber-500" />
									<Trans>Skills to Develop</Trans>
								</h4>
								<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
									{careerPathAnalysis.analysis.gaps.map((gap, index) => {
										const config = CATEGORY_CONFIG[gap.category];
										const GapCategoryIcon = config.icon;
										const existingSkill = skills.find(
											(s) =>
												s.name.toLowerCase() === gap.name.toLowerCase() ||
												s.nameFr.toLowerCase() === gap.nameFr.toLowerCase(),
										);

										return (
											<motion.div
												key={gap.name}
												initial={false}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: index * 0.05 }}
											>
												<Card className="border-amber-500/30">
													<CardContent className="p-4">
														<div className="mb-2 flex items-center justify-between">
															<div className="flex items-center gap-2">
																<div className={cn("rounded-lg p-1.5", config.color)}>
																	<GapCategoryIcon className="size-4" />
																</div>
																<span className="font-medium">{gap.name}</span>
															</div>
														</div>
														<div className="flex items-center justify-between text-sm">
															<span className="text-muted-foreground">
																<Trans>Required level:</Trans>
															</span>
															<StarRating rating={gap.minimumRating} readonly size="small" />
														</div>
														{existingSkill && (
															<div className="mt-2 flex items-center justify-between text-sm">
																<span className="text-muted-foreground">
																	<Trans>Your level:</Trans>
																</span>
																<StarRating rating={existingSkill.rating} readonly size="small" />
															</div>
														)}
														{!existingSkill && (
															<Button
																size="sm"
																variant="outline"
																className="mt-3 w-full gap-1"
																onClick={() =>
																	onAddRecommendedSkill({
																		name: gap.name,
																		nameFr: gap.nameFr,
																		category: gap.category,
																	})
																}
															>
																<PlusIcon className="size-3" />
																<Trans>Add</Trans>
															</Button>
														)}
													</CardContent>
												</Card>
											</motion.div>
										);
									})}
								</div>
							</div>
						)}
					</motion.div>
				)}

				{!selectedCareerPath && (
					<div className="rounded-xl border border-dashed p-8 text-center">
						<BriefcaseIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" />
						<p className="text-muted-foreground">
							<Trans>Select a career path to see a detailed analysis of your skills and identify gaps to fill.</Trans>
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// RecentActivityCard
// ---------------------------------------------------------------------------

function RecentActivityCard({ skills }: { skills: DbSkill[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ClockIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Recent Activity</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{skills
						.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
						.slice(0, 5)
						.map((skill) => {
							const config = CATEGORY_CONFIG[skill.category];
							const CategoryIcon = config.icon;
							const progressPercent =
								skill.targetRating > 0 ? (skill.rating / skill.targetRating) * 100 : skill.rating * 20;

							return (
								<div
									key={skill.id}
									className="flex items-center gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50"
								>
									<div className={cn("flex size-10 items-center justify-center rounded-lg", config.color)}>
										<CategoryIcon className="size-5" weight="duotone" />
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<span className="truncate font-medium">{skill.name}</span>
											<Badge variant="outline" className="shrink-0">
												{config.label}
											</Badge>
										</div>
										<div className="mt-1 flex items-center gap-2">
											<Progress value={Math.min(100, progressPercent)} className="h-1.5 flex-1" />
											<span className="shrink-0 text-muted-foreground text-xs">
												{skill.rating}/{skill.targetRating}
											</span>
										</div>
									</div>
									<StarRating rating={skill.rating} readonly size="small" />
								</div>
							);
						})}
				</div>
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// SkillsTab
// ---------------------------------------------------------------------------

export function SkillsTab({
	filteredSkills,
	skillsByCategory,
	searchQuery,
	selectedCategory,
	isAddDialogOpen,
	newSkillName,
	newSkillNameFr,
	newSkillCategory,
	newSkillRating,
	newSkillTarget,
	createMutationPending,
	onSearchChange,
	onCategoryChange,
	onAddDialogOpenChange,
	onNewSkillNameChange,
	onNewSkillNameFrChange,
	onNewSkillCategoryChange,
	onNewSkillRatingChange,
	onNewSkillTargetChange,
	onAddSkill,
	onUpdateRating,
	onUpdateTarget,
	onDeleteSkill,
	onExportSkills,
}: {
	filteredSkills: DbSkill[];
	skillsByCategory: Record<SkillCategory, DbSkill[]>;
	searchQuery: string;
	selectedCategory: SkillCategory | "all";
	isAddDialogOpen: boolean;
	newSkillName: string;
	newSkillNameFr: string;
	newSkillCategory: SkillCategory;
	newSkillRating: number;
	newSkillTarget: number;
	createMutationPending: boolean;
	onSearchChange: (value: string) => void;
	onCategoryChange: (value: SkillCategory | "all") => void;
	onAddDialogOpenChange: (open: boolean) => void;
	onNewSkillNameChange: (value: string) => void;
	onNewSkillNameFrChange: (value: string) => void;
	onNewSkillCategoryChange: (value: SkillCategory) => void;
	onNewSkillRatingChange: (value: number) => void;
	onNewSkillTargetChange: (value: number) => void;
	onAddSkill: () => void;
	onUpdateRating: (skillId: string, rating: number) => void;
	onUpdateTarget: (skillId: string, target: number) => void;
	onDeleteSkill: (skillId: string) => void;
	onExportSkills: () => void;
}) {
	return (
		<div className="space-y-8">
			{/* Actions Bar */}
			<SkillsActionsBar
				searchQuery={searchQuery}
				selectedCategory={selectedCategory}
				isAddDialogOpen={isAddDialogOpen}
				newSkillName={newSkillName}
				newSkillNameFr={newSkillNameFr}
				newSkillCategory={newSkillCategory}
				newSkillRating={newSkillRating}
				newSkillTarget={newSkillTarget}
				createMutationPending={createMutationPending}
				onSearchChange={onSearchChange}
				onCategoryChange={onCategoryChange}
				onAddDialogOpenChange={onAddDialogOpenChange}
				onNewSkillNameChange={onNewSkillNameChange}
				onNewSkillNameFrChange={onNewSkillNameFrChange}
				onNewSkillCategoryChange={onNewSkillCategoryChange}
				onNewSkillRatingChange={onNewSkillRatingChange}
				onNewSkillTargetChange={onNewSkillTargetChange}
				onAddSkill={onAddSkill}
				onExportSkills={onExportSkills}
			/>

			{/* Skills List by Category */}
			{filteredSkills.length === 0 ? (
				<SkillsEmptyState
					hasFilters={!!searchQuery || selectedCategory !== "all"}
					onAddSkill={() => onAddDialogOpenChange(true)}
				/>
			) : (
				<div className="space-y-8">
					{(Object.keys(CATEGORY_CONFIG) as SkillCategory[]).map((category) => {
						const categorySkills = skillsByCategory[category];
						if (categorySkills.length === 0) return null;

						const config = CATEGORY_CONFIG[category];
						const CategoryIcon = config.icon;

						return (
							<motion.div key={category} initial={false} animate={{ opacity: 1, y: 0 }}>
								<div className="mb-4 flex items-center gap-2">
									<div className={cn("rounded-lg p-2", config.color)}>
										<CategoryIcon className="size-5" weight="duotone" />
									</div>
									<h3 className="font-semibold text-lg">{config.label}</h3>
									<Badge variant="secondary">{categorySkills.length}</Badge>
								</div>

								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{categorySkills.map((skill, index) => (
										<SkillCard
											key={skill.id}
											skill={skill}
											index={index}
											onUpdateRating={onUpdateRating}
											onUpdateTarget={onUpdateTarget}
											onDeleteSkill={onDeleteSkill}
										/>
									))}
								</div>
							</motion.div>
						);
					})}
				</div>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// SkillsActionsBar
// ---------------------------------------------------------------------------

function SkillsActionsBar({
	searchQuery,
	selectedCategory,
	isAddDialogOpen,
	newSkillName,
	newSkillNameFr,
	newSkillCategory,
	newSkillRating,
	newSkillTarget,
	createMutationPending,
	onSearchChange,
	onCategoryChange,
	onAddDialogOpenChange,
	onNewSkillNameChange,
	onNewSkillNameFrChange,
	onNewSkillCategoryChange,
	onNewSkillRatingChange,
	onNewSkillTargetChange,
	onAddSkill,
	onExportSkills,
}: {
	searchQuery: string;
	selectedCategory: SkillCategory | "all";
	isAddDialogOpen: boolean;
	newSkillName: string;
	newSkillNameFr: string;
	newSkillCategory: SkillCategory;
	newSkillRating: number;
	newSkillTarget: number;
	createMutationPending: boolean;
	onSearchChange: (value: string) => void;
	onCategoryChange: (value: SkillCategory | "all") => void;
	onAddDialogOpenChange: (open: boolean) => void;
	onNewSkillNameChange: (value: string) => void;
	onNewSkillNameFrChange: (value: string) => void;
	onNewSkillCategoryChange: (value: SkillCategory) => void;
	onNewSkillRatingChange: (value: number) => void;
	onNewSkillTargetChange: (value: number) => void;
	onAddSkill: () => void;
	onExportSkills: () => void;
}) {
	return (
		<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div className="flex flex-1 gap-4">
				{/* Search */}
				<div className="relative flex-1 md:max-w-sm">
					<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder={t`Search for a skill...`}
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-9"
					/>
				</div>

				{/* Category Filter */}
				<Select value={selectedCategory} onValueChange={(value) => onCategoryChange(value as SkillCategory | "all")}>
					<SelectTrigger className="w-48">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							<Trans>All categories</Trans>
						</SelectItem>
						{(Object.keys(CATEGORY_CONFIG) as SkillCategory[]).map((category) => (
							<SelectItem key={category} value={category}>
								{CATEGORY_CONFIG[category].label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex gap-2">
				{/* Export Button */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline" size="icon" onClick={onExportSkills}>
							<DownloadSimpleIcon className="size-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<Trans>Export for Resume</Trans>
					</TooltipContent>
				</Tooltip>

				{/* Add Skill Dialog */}
				<AddSkillDialog
					isOpen={isAddDialogOpen}
					onOpenChange={onAddDialogOpenChange}
					newSkillName={newSkillName}
					newSkillNameFr={newSkillNameFr}
					newSkillCategory={newSkillCategory}
					newSkillRating={newSkillRating}
					newSkillTarget={newSkillTarget}
					createMutationPending={createMutationPending}
					onNewSkillNameChange={onNewSkillNameChange}
					onNewSkillNameFrChange={onNewSkillNameFrChange}
					onNewSkillCategoryChange={onNewSkillCategoryChange}
					onNewSkillRatingChange={onNewSkillRatingChange}
					onNewSkillTargetChange={onNewSkillTargetChange}
					onAddSkill={onAddSkill}
				/>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// AddSkillDialog
// ---------------------------------------------------------------------------

function AddSkillDialog({
	isOpen,
	onOpenChange,
	newSkillName,
	newSkillNameFr,
	newSkillCategory,
	newSkillRating,
	newSkillTarget,
	createMutationPending,
	onNewSkillNameChange,
	onNewSkillNameFrChange,
	onNewSkillCategoryChange,
	onNewSkillRatingChange,
	onNewSkillTargetChange,
	onAddSkill,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	newSkillName: string;
	newSkillNameFr: string;
	newSkillCategory: SkillCategory;
	newSkillRating: number;
	newSkillTarget: number;
	createMutationPending: boolean;
	onNewSkillNameChange: (value: string) => void;
	onNewSkillNameFrChange: (value: string) => void;
	onNewSkillCategoryChange: (value: SkillCategory) => void;
	onNewSkillRatingChange: (value: number) => void;
	onNewSkillTargetChange: (value: number) => void;
	onAddSkill: () => void;
}) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<PlusCircleIcon className="size-4" />
					<Trans>Add a Skill</Trans>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>New Skill</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Add a new skill to your profile</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Name (English)</Trans>
						</label>
						<Input
							value={newSkillName}
							onChange={(e) => onNewSkillNameChange(e.target.value)}
							placeholder={t`Ex: Communication`}
						/>
					</div>

					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Name (French)</Trans>
						</label>
						<Input
							value={newSkillNameFr}
							onChange={(e) => onNewSkillNameFrChange(e.target.value)}
							placeholder={t`Ex: Communication`}
						/>
					</div>

					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Category</Trans>
						</label>
						<Select value={newSkillCategory} onValueChange={(v) => onNewSkillCategoryChange(v as SkillCategory)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{(Object.keys(CATEGORY_CONFIG) as SkillCategory[]).map((category) => (
									<SelectItem key={category} value={category}>
										{CATEGORY_CONFIG[category].label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Current Level</Trans>
						</label>
						<div className="flex items-center gap-4">
							<StarRating rating={newSkillRating} onRatingChange={onNewSkillRatingChange} size="large" />
							<span className="text-muted-foreground text-sm">{newSkillRating}/5</span>
						</div>
					</div>

					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Goal</Trans>
						</label>
						<div className="flex items-center gap-4">
							<StarRating rating={newSkillTarget} onRatingChange={onNewSkillTargetChange} size="large" />
							<span className="text-muted-foreground text-sm">{newSkillTarget}/5</span>
						</div>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onAddSkill} disabled={!newSkillName.trim() || createMutationPending}>
						<PlusIcon className="mr-2 size-4" />
						<Trans>Add</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ---------------------------------------------------------------------------
// SkillsEmptyState
// ---------------------------------------------------------------------------

function SkillsEmptyState({ hasFilters, onAddSkill }: { hasFilters: boolean; onAddSkill: () => void }) {
	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center py-12 text-center">
				<ListChecksIcon className="mb-4 size-12 text-muted-foreground/50" />
				<h3 className="mb-2 font-medium text-lg">
					<Trans>No skills found</Trans>
				</h3>
				<p className="mb-4 max-w-sm text-muted-foreground">
					{hasFilters ? (
						<Trans>No skills match your search criteria.</Trans>
					) : (
						<Trans>Start by adding your skills to track your progress and identify gaps.</Trans>
					)}
				</p>
				{!hasFilters && (
					<Button onClick={onAddSkill} className="gap-2">
						<PlusCircleIcon className="size-4" />
						<Trans>Add a Skill</Trans>
					</Button>
				)}
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// SkillCard
// ---------------------------------------------------------------------------

function SkillCard({
	skill,
	index,
	onUpdateRating,
	onUpdateTarget,
	onDeleteSkill,
}: {
	skill: DbSkill;
	index: number;
	onUpdateRating: (skillId: string, rating: number) => void;
	onUpdateTarget: (skillId: string, target: number) => void;
	onDeleteSkill: (skillId: string) => void;
}) {
	const progressPercent = skill.targetRating > 0 ? (skill.rating / skill.targetRating) * 100 : skill.rating * 20;
	const isGoalMet = skill.rating >= skill.targetRating;

	return (
		<motion.div initial={false} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
			<Card className={cn("h-full transition-all duration-300 hover:shadow-lg", isGoalMet && "border-green-500/50")}>
				<CardContent className="p-4">
					<div className="mb-3 flex items-start justify-between">
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<h4 className="font-medium">{skill.name}</h4>
								{isGoalMet && <CheckCircleIcon className="size-4 text-green-500" weight="fill" />}
							</div>
							<p className="text-muted-foreground text-xs">{skill.name}</p>
						</div>
						<div className="flex gap-1">
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="ghost" size="icon-sm">
										<TrashIcon className="size-4 text-destructive" />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											<Trans>Delete this skill?</Trans>
										</AlertDialogTitle>
										<AlertDialogDescription>
											<Trans>This action is irreversible. The skill "{skill.name}" will be permanently deleted.</Trans>
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>
											<Trans>Cancel</Trans>
										</AlertDialogCancel>
										<AlertDialogAction onClick={() => onDeleteSkill(skill.id)}>
											<Trans>Delete</Trans>
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</div>

					<div className="space-y-3">
						<div>
							<div className="mb-1 flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									<Trans>Current level</Trans>
								</span>
							</div>
							<StarRating rating={skill.rating} onRatingChange={(r) => onUpdateRating(skill.id, r)} />
						</div>

						<div>
							<div className="mb-1 flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									<Trans>Goal</Trans>
								</span>
							</div>
							<StarRating rating={skill.targetRating} onRatingChange={(r) => onUpdateTarget(skill.id, r)} />
						</div>

						<div className="space-y-1">
							<div className="flex items-center justify-between text-xs">
								<span className="text-muted-foreground">
									<Trans>Progress</Trans>
								</span>
								<span className="font-medium">{Math.min(100, Math.round(progressPercent))}%</span>
							</div>
							<Progress value={Math.min(100, progressPercent)} className="h-1.5" />
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// ---------------------------------------------------------------------------
// GoalsTab
// ---------------------------------------------------------------------------

export function GoalsTab({
	skills,
	overallProgress,
	statistics,
}: {
	skills: DbSkill[];
	overallProgress: number;
	statistics: { goalsReached?: number; inProgress?: number } | undefined;
}) {
	return (
		<div className="space-y-8">
			{/* Goals Overview */}
			<div className="grid gap-6 md:grid-cols-3">
				<Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
					<CardContent className="p-6">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex size-12 items-center justify-center rounded-full bg-green-500/20">
								<TrophyIcon className="size-6 text-green-500" weight="fill" />
							</div>
							<Badge className="bg-green-500">
								<Trans>Achieved</Trans>
							</Badge>
						</div>
						<p className="mb-1 font-bold text-4xl text-green-600 dark:text-green-400">
							{statistics?.goalsReached ?? skills.filter((s) => s.rating >= s.targetRating).length}
						</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Goals achieved</Trans>
						</p>
					</CardContent>
				</Card>

				<Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
					<CardContent className="p-6">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex size-12 items-center justify-center rounded-full bg-amber-500/20">
								<RocketLaunchIcon className="size-6 text-amber-500" weight="fill" />
							</div>
							<Badge variant="secondary">
								<Trans>In progress</Trans>
							</Badge>
						</div>
						<p className="mb-1 font-bold text-4xl text-amber-600 dark:text-amber-400">
							{statistics?.inProgress ?? skills.filter((s) => s.rating < s.targetRating).length}
						</p>
						<p className="text-muted-foreground text-sm">
							<Trans>In progress</Trans>
						</p>
					</CardContent>
				</Card>

				<Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
					<CardContent className="p-6">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex size-12 items-center justify-center rounded-full bg-primary/20">
								<ChartLineUpIcon className="size-6 text-primary" weight="fill" />
							</div>
						</div>
						<p className="mb-1 font-bold text-4xl">{overallProgress}%</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Average progress</Trans>
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Skills Progress Tracking */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TargetIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Goal Tracking</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Visualize the progress of each skill toward its goal</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{skills.length === 0 ? (
						<div className="rounded-xl border border-dashed p-8 text-center">
							<TargetIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" />
							<p className="text-muted-foreground">
								<Trans>Add skills to define and track your goals.</Trans>
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{skills
								.sort((a, b) => {
									const progressA = a.targetRating > 0 ? a.rating / a.targetRating : a.rating / 5;
									const progressB = b.targetRating > 0 ? b.rating / b.targetRating : b.rating / 5;
									return progressA - progressB;
								})
								.map((skill) => {
									const config = CATEGORY_CONFIG[skill.category];
									const GoalCategoryIcon = config.icon;
									const progressPercent =
										skill.targetRating > 0 ? (skill.rating / skill.targetRating) * 100 : skill.rating * 20;
									const isGoalMet = skill.rating >= skill.targetRating;

									return (
										<div
											key={skill.id}
											className={cn(
												"rounded-lg border p-4 transition-all",
												isGoalMet && "border-green-500/50 bg-green-500/5",
											)}
										>
											<div className="flex items-center gap-4">
												<div
													className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", config.color)}
												>
													<GoalCategoryIcon className="size-5" />
												</div>
												<div className="min-w-0 flex-1">
													<div className="mb-1 flex items-center gap-2">
														<span className="truncate font-medium">{skill.name}</span>
														{isGoalMet && (
															<Badge className="gap-1 bg-green-500">
																<CheckCircleIcon className="size-3" weight="fill" />
																<Trans>Achieved</Trans>
															</Badge>
														)}
													</div>
													<div className="flex items-center gap-3">
														<Progress
															value={Math.min(100, progressPercent)}
															className={cn("h-2 flex-1", isGoalMet && "bg-green-200")}
														/>
														<span className="shrink-0 text-sm">
															<span className="font-bold">{skill.rating}</span>
															<span className="text-muted-foreground">/{skill.targetRating}</span>
														</span>
													</div>
												</div>
												<div className="hidden md:block">
													<StarRating rating={skill.rating} readonly size="small" />
												</div>
											</div>
										</div>
									);
								})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// ---------------------------------------------------------------------------
// RecommendationsTab
// ---------------------------------------------------------------------------

export function RecommendationsTab({
	skills,
	selectedField,
	recommendedSkillsForField,
	careerPaths,
	selectedCareerPath,
	onFieldChange,
	onAddRecommendedSkill,
	onSetCareerPath,
}: {
	skills: DbSkill[];
	selectedField: string;
	recommendedSkillsForField: { name: string; nameFr: string; category: SkillCategory }[];
	careerPaths: CareerPath[];
	selectedCareerPath: string | null;
	onFieldChange: (field: string) => void;
	onAddRecommendedSkill: (skill: { name: string; nameFr: string; category: SkillCategory }) => void;
	onSetCareerPath: (pathId: string) => void;
}) {
	return (
		<div className="space-y-8">
			{/* Field Selector */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<LightbulbIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Recommended Skills</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Discover the essential skills for your field</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Field Selection */}
					<div className="flex flex-wrap gap-2">
						{Object.entries(FIELD_CONFIG).map(([field, config]) => {
							const FieldIcon = config.icon;
							return (
								<Button
									key={field}
									variant={selectedField === field ? "default" : "outline"}
									className={cn("gap-2", selectedField === field && "shadow-md")}
									onClick={() => onFieldChange(field)}
								>
									<FieldIcon className="size-4" />
									{config.label}
								</Button>
							);
						})}
					</div>

					{/* Recommended Skills Grid */}
					<div>
						<div className="mb-4 flex items-center justify-between">
							<h4 className="font-medium">
								<Trans>Recommended skills for</Trans> {FIELD_CONFIG[selectedField]?.label}
							</h4>
							<Badge variant="secondary">
								<Trans>{recommendedSkillsForField.length} available</Trans>
							</Badge>
						</div>

						{recommendedSkillsForField.length === 0 ? (
							<div className="rounded-xl border border-green-500/50 border-dashed bg-green-500/5 p-6 text-center">
								<CheckCircleIcon className="mx-auto mb-2 size-10 text-green-500" weight="fill" />
								<p className="font-medium text-green-700 dark:text-green-400">
									<Trans>Excellent! You have already added all recommended skills.</Trans>
								</p>
							</div>
						) : (
							<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
								{recommendedSkillsForField.map((skill, index) => {
									const config = CATEGORY_CONFIG[skill.category];
									const RecCategoryIcon = config.icon;

									return (
										<motion.div
											key={skill.name}
											initial={false}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.05 }}
										>
											<Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
												<CardContent className="p-4">
													<div className="mb-3 flex items-center gap-3">
														<div className={cn("rounded-lg p-2", config.color)}>
															<RecCategoryIcon className="size-5" weight="duotone" />
														</div>
														<div className="min-w-0 flex-1">
															<h5 className="truncate font-medium">{skill.name}</h5>
															<p className="truncate text-muted-foreground text-xs">{skill.name}</p>
														</div>
													</div>
													<div className="flex items-center justify-between">
														<Badge variant="outline" className="text-xs">
															{config.label}
														</Badge>
														<Button
															size="sm"
															variant="ghost"
															className="gap-1"
															onClick={() => onAddRecommendedSkill(skill)}
														>
															<PlusIcon className="size-4" />
															<Trans>Add</Trans>
														</Button>
													</div>
												</CardContent>
											</Card>
										</motion.div>
									);
								})}
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Career Paths */}
			<CareerPathsCard
				skills={skills}
				careerPaths={careerPaths}
				selectedCareerPath={selectedCareerPath}
				onSetCareerPath={onSetCareerPath}
			/>

			{/* Quick Actions */}
			<QuickActionsCard />
		</div>
	);
}

// ---------------------------------------------------------------------------
// CareerPathsCard
// ---------------------------------------------------------------------------

function CareerPathsCard({
	skills,
	careerPaths,
	selectedCareerPath,
	onSetCareerPath,
}: {
	skills: DbSkill[];
	careerPaths: CareerPath[];
	selectedCareerPath: string | null;
	onSetCareerPath: (pathId: string) => void;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BriefcaseIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Career Path</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Explore career paths and their required skills</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{careerPaths.map((path, index) => {
						const PathIcon = path.icon;
						const fieldConfig = FIELD_CONFIG[path.field];
						const analysis = getSkillGapAnalysis(skills, path);
						const matchPercent = analysis.total > 0 ? Math.round((analysis.met / analysis.total) * 100) : 0;

						return (
							<motion.div
								key={path.id}
								initial={false}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card
									className={cn(
										"h-full cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg",
										selectedCareerPath === path.id && "border-primary",
									)}
									onClick={() => onSetCareerPath(path.id)}
								>
									<CardContent className="p-4">
										<div className="mb-3 flex items-center gap-3">
											<div className={cn("rounded-lg p-2", fieldConfig.color)}>
												<PathIcon className="size-5" weight="duotone" />
											</div>
											<div className="min-w-0 flex-1">
												<h5 className="truncate font-medium">{path.name}</h5>
												<Badge variant="outline" className="mt-1 text-xs">
													{fieldConfig.label}
												</Badge>
											</div>
										</div>
										<div className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground">
													<Trans>Skills</Trans>
												</span>
												<span>
													{analysis.met}/{analysis.total}
												</span>
											</div>
											<Progress value={matchPercent} className="h-1.5" />
											<p className="text-muted-foreground text-xs">
												{matchPercent}% <Trans>compatible</Trans>
											</p>
										</div>
										{selectedCareerPath === path.id && (
											<Badge className="mt-3 w-full justify-center gap-1">
												<CheckCircleIcon className="size-3" weight="fill" />
												<Trans>Selected</Trans>
											</Badge>
										)}
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// ---------------------------------------------------------------------------
// QuickActionsCard
// ---------------------------------------------------------------------------

function QuickActionsCard() {
	return (
		<Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
			<CardContent className="flex flex-col items-center py-8 text-center">
				<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
					<RocketLaunchIcon className="size-8 text-primary" weight="duotone" />
				</div>
				<h3 className="mb-2 font-bold text-2xl">
					<Trans>Ready to Progress?</Trans>
				</h3>
				<p className="mb-6 max-w-md text-muted-foreground">
					<Trans>Explore our training programs and develop the skills needed for your career.</Trans>
				</p>
				<div className="flex flex-wrap justify-center gap-4">
					<Link to="/dashboard/resources">
						<Button size="lg" className="gap-2">
							<GraduationCapIcon className="size-5" />
							<Trans>Explore Training</Trans>
						</Button>
					</Link>
					<Link to={"/dashboard/career" as string}>
						<Button size="lg" variant="outline" className="gap-2">
							<TargetIcon className="size-5" />
							<Trans>Career Quiz</Trans>
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
