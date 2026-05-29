import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BookOpenIcon,
	BriefcaseIcon,
	ChartPieSliceIcon,
	CheckCircleIcon,
	FlagIcon,
	LightbulbIcon,
	ListChecksIcon,
	MagnifyingGlassIcon,
	PlusCircleIcon,
	PlusIcon,
	TrashIcon,
	TrophyIcon,
} from "@phosphor-icons/react";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";
import { CATEGORY_CONFIG, formatSalary, INDUSTRY_CONFIG } from "./gap-analysis-config";
import type { CurrentSkill, SkillCategory, SkillGap, TargetRole } from "./gap-analysis-types";
import { SkillsRadarChart } from "./skills-radar-chart";

// ─── Target Role Selection Card ─────────────────────────────────────────────────

interface TargetRoleSelectionProps {
	targetRoles: TargetRole[];
	rolesLoading: boolean;
	selectedRoleId: string | null;
	dbRoles: { id: string; skillCount: number }[] | undefined;
	onSelectRole: (roleId: string) => void;
}

export function TargetRoleSelection({
	targetRoles,
	rolesLoading,
	selectedRoleId,
	dbRoles,
	onSelectRole,
}: TargetRoleSelectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BriefcaseIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Select Your Target Role</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Choose the position you are targeting to analyze skill gaps</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				{rolesLoading ? (
					<div className="flex items-center justify-center py-8">
						<div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					</div>
				) : targetRoles.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Trans>No roles available. Please contact the administrator.</Trans>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{targetRoles.map((role, index) => {
							const industryConfig = INDUSTRY_CONFIG[role.industry] ?? INDUSTRY_CONFIG.general;
							const IndustryIcon = industryConfig.icon;
							const isSelected = selectedRoleId === role.id;

							return (
								<motion.div
									key={role.id}
									initial={false}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: index * 0.05 }}
								>
									<Card
										className={cn(
											"h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
											isSelected && "border-2 border-primary ring-2 ring-primary/20",
										)}
										onClick={() => onSelectRole(role.id)}
									>
										<CardContent className="p-4">
											<div className="mb-3 flex items-center gap-3">
												<div className={cn("rounded-lg p-2", industryConfig.color)}>
													<IndustryIcon className="size-5" weight="duotone" />
												</div>
												<div className="min-w-0 flex-1">
													<h4 className="truncate font-medium">{role.name}</h4>
													<Badge variant="outline" className="mt-1 text-xs">
														{industryConfig.label}
													</Badge>
												</div>
												{isSelected && <CheckCircleIcon className="size-5 text-primary" weight="fill" />}
											</div>
											<div className="space-y-2 text-sm">
												<div className="flex items-center justify-between">
													<span className="text-muted-foreground">
														<Trans>Salary</Trans>
													</span>
													<span className="font-medium">
														{formatSalary(role.salaryRange.min)} - {formatSalary(role.salaryRange.max)}
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-muted-foreground">
														<Trans>Demand</Trans>
													</span>
													<Badge
														className={cn(
															role.demandLevel === "high" && "bg-green-500",
															role.demandLevel === "medium" && "bg-amber-500",
															role.demandLevel === "low" && "bg-gray-500",
														)}
													>
														{role.demandLevel === "high" && "High"}
														{role.demandLevel === "medium" && "Medium"}
														{role.demandLevel === "low" && "Low"}
													</Badge>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-muted-foreground">
														<Trans>Skills</Trans>
													</span>
													<span>
														{dbRoles?.find((r) => r.id === role.id)?.skillCount ?? role.requiredSkills.length}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// ─── Priority Skills List ───────────────────────────────────────────────────────

interface PrioritySkillsProps {
	skillGaps: SkillGap[];
	onViewResources: (gap: SkillGap) => void;
	onViewAllGaps: () => void;
}

export function PrioritySkills({ skillGaps, onViewResources, onViewAllGaps }: PrioritySkillsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FlagIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Priority Skills</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Ranked by importance and gap size</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{skillGaps
						.filter((g) => g.gapSize > 0)
						.slice(0, 5)
						.map((gap, index) => {
							const categoryConfig = CATEGORY_CONFIG[gap.category];
							const CategoryIcon = categoryConfig.icon;

							return (
								<motion.div
									key={gap.skillName}
									initial={false}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.1 }}
									className={cn(
										"rounded-lg border p-4 transition-all hover:shadow-md",
										gap.importance === "critical" && "border-red-500/30 bg-red-500/5",
										gap.importance === "important" && "border-amber-500/30 bg-amber-500/5",
										gap.importance === "nice-to-have" && "border-gray-500/30",
									)}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className={cn("rounded-lg p-1.5", categoryConfig.color)}>
												<CategoryIcon className="size-4" />
											</div>
											<div>
												<p className="font-medium">{gap.skillName}</p>
												<div className="flex items-center gap-2 text-muted-foreground text-xs">
													<span>
														Level: {gap.currentLevel} / {gap.requiredLevel}
													</span>
													<span>|</span>
													<span>{gap.timeToClose} weeks</span>
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge
												variant="outline"
												className={cn(
													gap.importance === "critical" && "border-red-500 text-red-500",
													gap.importance === "important" && "border-amber-500 text-amber-500",
												)}
											>
												{gap.importance === "critical" && "Critical"}
												{gap.importance === "important" && "Important"}
												{gap.importance === "nice-to-have" && "Bonus"}
											</Badge>
											<Button size="sm" variant="ghost" onClick={() => onViewResources(gap)}>
												<BookOpenIcon className="size-4" />
											</Button>
										</div>
									</div>
									<div className="mt-3">
										<div className="mb-1 flex items-center justify-between text-muted-foreground text-xs">
											<span>
												<Trans>Progress</Trans>
											</span>
											<span>{Math.round((gap.currentLevel / gap.requiredLevel) * 100)}%</span>
										</div>
										<Progress value={(gap.currentLevel / gap.requiredLevel) * 100} className="h-1.5" />
									</div>
								</motion.div>
							);
						})}

					{skillGaps.filter((g) => g.gapSize > 0).length === 0 && (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<TrophyIcon className="mb-4 size-12 text-green-500" weight="fill" />
							<p className="font-medium text-green-600 dark:text-green-400">
								<Trans>Congratulations! You have all the required skills.</Trans>
							</p>
						</div>
					)}
				</div>
			</CardContent>
			{skillGaps.filter((g) => g.gapSize > 0).length > 0 && (
				<CardFooter>
					<Button variant="outline" className="w-full gap-2" onClick={onViewAllGaps}>
						<Trans>View All Analyses</Trans>
						<ArrowRightIcon className="size-4" />
					</Button>
				</CardFooter>
			)}
		</Card>
	);
}

// ─── Add Skill Dialog ───────────────────────────────────────────────────────────

interface AddSkillDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	newSkillName: string;
	onNewSkillNameChange: (val: string) => void;
	newSkillNameFr: string;
	onNewSkillNameFrChange: (val: string) => void;
	newSkillCategory: SkillCategory;
	onNewSkillCategoryChange: (val: SkillCategory) => void;
	newSkillLevel: number;
	onNewSkillLevelChange: (val: number) => void;
	newSkillYears: number;
	onNewSkillYearsChange: (val: number) => void;
	newSkillNotes: string;
	onNewSkillNotesChange: (val: string) => void;
	onSubmit: () => void;
}

export function AddSkillDialog({
	isOpen,
	onOpenChange,
	newSkillName,
	onNewSkillNameChange,
	newSkillNameFr,
	onNewSkillNameFrChange,
	newSkillCategory,
	onNewSkillCategoryChange,
	newSkillLevel,
	onNewSkillLevelChange,
	newSkillYears,
	onNewSkillYearsChange,
	newSkillNotes,
	onNewSkillNotesChange,
	onSubmit,
}: AddSkillDialogProps) {
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
						<Trans>Add a skill to your inventory</Trans>
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
							<Trans>Current Level (1-5)</Trans>
						</label>
						<div className="flex items-center gap-4">
							<StarRating rating={newSkillLevel} onRatingChange={onNewSkillLevelChange} size="large" />
							<span className="text-muted-foreground text-sm">{newSkillLevel}/5</span>
						</div>
					</div>

					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Years of Experience</Trans>
						</label>
						<Input
							type="number"
							min="0"
							value={newSkillYears}
							onChange={(e) => onNewSkillYearsChange(parseInt(e.target.value, 10) || 0)}
						/>
					</div>

					<div className="space-y-2">
						<label className="font-medium text-sm">
							<Trans>Notes</Trans>
						</label>
						<Textarea
							value={newSkillNotes}
							onChange={(e) => onNewSkillNotesChange(e.target.value)}
							placeholder={t`Add optional notes...`}
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSubmit} disabled={!newSkillName.trim()}>
						<PlusIcon className="mr-2 size-4" />
						<Trans>Add</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ─── Skills Grid ────────────────────────────────────────────────────────────────

interface SkillsGridProps {
	currentSkills: CurrentSkill[];
	searchQuery: string;
	filterCategory: SkillCategory | "all";
	onUpdateSkillLevel: (skillId: string, newLevel: number) => void;
	onDeleteSkill: (skillId: string) => void;
	onOpenAddDialog: () => void;
}

export function SkillsGrid({
	currentSkills,
	searchQuery,
	filterCategory,
	onUpdateSkillLevel,
	onDeleteSkill,
	onOpenAddDialog,
}: SkillsGridProps) {
	if (currentSkills.length === 0) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center py-12 text-center">
					<ListChecksIcon className="mb-4 size-12 text-muted-foreground/50" />
					<h3 className="mb-2 font-medium text-lg">
						<Trans>No skills recorded</Trans>
					</h3>
					<p className="mb-4 max-w-sm text-muted-foreground">
						<Trans>Start by adding your current skills to analyze the gaps with your target role.</Trans>
					</p>
					<Button onClick={onOpenAddDialog} className="gap-2">
						<PlusCircleIcon className="size-4" />
						<Trans>Add a Skill</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-8">
			{(Object.keys(CATEGORY_CONFIG) as SkillCategory[]).map((category) => {
				const categorySkills = currentSkills.filter((s) => {
					const matchesCategory = s.category === category;
					const matchesSearch = searchQuery
						? s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
							s.nameFr.toLowerCase().includes(searchQuery.toLowerCase())
						: true;
					const matchesFilter = filterCategory === "all" || filterCategory === category;
					return matchesCategory && matchesSearch && matchesFilter;
				});

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
								<motion.div
									key={skill.id}
									initial={false}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: index * 0.05 }}
								>
									<Card className="h-full transition-all duration-300 hover:shadow-lg">
										<CardContent className="p-4">
											<div className="mb-3 flex items-start justify-between">
												<div className="min-w-0 flex-1">
													<h4 className="truncate font-medium">{skill.name}</h4>
													<p className="text-muted-foreground text-xs">{skill.name}</p>
												</div>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button variant="ghost" size="icon" className="size-8">
															<TrashIcon className="size-4 text-destructive" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																<Trans>Delete this skill?</Trans>
															</AlertDialogTitle>
															<AlertDialogDescription>
																<Trans>
																	This action is irreversible. The skill "{skill.name}" will be permanently deleted.
																</Trans>
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

											<div className="space-y-3">
												<div>
													<div className="mb-1 flex items-center justify-between text-sm">
														<span className="text-muted-foreground">
															<Trans>Level</Trans>
														</span>
													</div>
													<StarRating
														rating={skill.currentLevel}
														onRatingChange={(r) => onUpdateSkillLevel(skill.id, r)}
													/>
												</div>

												{skill.yearsExperience > 0 && (
													<div className="flex items-center justify-between text-sm">
														<span className="text-muted-foreground">
															<Trans>Experience</Trans>
														</span>
														<span>{skill.yearsExperience} years</span>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</div>
					</motion.div>
				);
			})}
		</div>
	);
}

// ─── Quick Add Required Skills ──────────────────────────────────────────────────

interface QuickAddSkillsProps {
	selectedRole: TargetRole;
	currentSkills: CurrentSkill[];
	onAddRequiredSkill: (gap: SkillGap) => void;
}

export function QuickAddSkills({ selectedRole, currentSkills, onAddRequiredSkill }: QuickAddSkillsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<LightbulbIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Required Skills for {selectedRole.name}</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Quickly add the required skills to your inventory</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap gap-2">
					{selectedRole.requiredSkills.map((req) => {
						const exists = currentSkills.some(
							(s) =>
								s.name.toLowerCase() === req.name.toLowerCase() || s.nameFr.toLowerCase() === req.nameFr.toLowerCase(),
						);
						const config = CATEGORY_CONFIG[req.category];

						return (
							<Tooltip key={req.name}>
								<TooltipTrigger asChild>
									<Button
										variant={exists ? "secondary" : "outline"}
										size="sm"
										className="gap-1"
										disabled={exists}
										onClick={() =>
											onAddRequiredSkill({
												skillName: req.name,
												skillNameFr: req.nameFr,
												category: req.category,
												currentLevel: 0,
												requiredLevel: req.requiredLevel,
												industryBenchmark: req.industryBenchmark,
												gapSize: req.requiredLevel,
												priority: 0,
												importance: req.importance,
												timeToClose: 0,
												learningResources: [],
											})
										}
									>
										{exists ? (
											<CheckCircleIcon className="size-3 text-green-500" weight="fill" />
										) : (
											<PlusIcon className="size-3" />
										)}
										{req.name}
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>
										{config.label} - Required level: {req.requiredLevel}/5
									</p>
								</TooltipContent>
							</Tooltip>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Skills Radar Section (for overview tab) ────────────────────────────────────

interface SkillsRadarSectionProps {
	skillGaps: SkillGap[];
}

export function SkillsRadarSection({ skillGaps }: SkillsRadarSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ChartPieSliceIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Skills Visualization</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Comparison of your current levels with role requirements</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				{skillGaps.length > 0 ? (
					<div className="flex flex-col items-center">
						<SkillsRadarChart gaps={skillGaps} />
						<div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
							<div className="flex items-center gap-2">
								<div className="size-3 rounded-full bg-[oklch(0.5_0.25_250)]" />
								<span>
									<Trans>Current Level</Trans>
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="size-3 rounded-full bg-[oklch(0.6_0.2_30)]" />
								<span>
									<Trans>Required Level</Trans>
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="size-3 rounded-full border-2 border-[oklch(0.6_0.15_200)] border-dashed" />
								<span>
									<Trans>Industry Benchmark</Trans>
								</span>
							</div>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<ChartPieSliceIcon className="mb-4 size-12 text-muted-foreground/50" />
						<p className="text-muted-foreground">
							<Trans>Add your skills to see the visualization</Trans>
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// ─── Search & Filter Bar ────────────────────────────────────────────────────────

interface SearchFilterBarProps {
	searchQuery: string;
	onSearchQueryChange: (val: string) => void;
	filterCategory: SkillCategory | "all";
	onFilterCategoryChange: (val: SkillCategory | "all") => void;
}

export function SearchFilterBar({
	searchQuery,
	onSearchQueryChange,
	filterCategory,
	onFilterCategoryChange,
}: SearchFilterBarProps) {
	return (
		<div className="flex flex-1 gap-4">
			<div className="relative flex-1 md:max-w-sm">
				<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder={t`Search for a skill...`}
					value={searchQuery}
					onChange={(e) => onSearchQueryChange(e.target.value)}
					className="pl-9"
				/>
			</div>
			<Select value={filterCategory} onValueChange={(value) => onFilterCategoryChange(value as SkillCategory | "all")}>
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
	);
}
