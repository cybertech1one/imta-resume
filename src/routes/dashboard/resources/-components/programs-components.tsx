import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BookmarkSimpleIcon,
	BriefcaseIcon,
	CalendarIcon,
	CaretDownIcon,
	CertificateIcon,
	CheckCircleIcon,
	ClockIcon,
	CurrencyCircleDollarIcon,
	FunnelIcon,
	GraduationCapIcon,
	HouseIcon,
	MagnifyingGlassIcon,
	NoteIcon,
	PencilSimpleIcon,
	PlusCircleIcon,
	ScalesIcon,
	SparkleIcon,
	StarIcon,
	TrashIcon,
	TrendUpIcon,
	UsersIcon,
	XIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";

import { demandLevelConfig, fieldConfig, iconMap, trainingPrograms } from "./programs-config";
import type { ProgramCardProps, ProgramField, TrainingInterest, TrainingProgram } from "./programs-types";

// ─── Hero Section ────────────────────────────────────────────────────────────

interface HeroSectionProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	selectedField: ProgramField | "all";
	onFieldChange: (value: ProgramField | "all") => void;
	interestsCount: number;
}

export function HeroSection({
	searchQuery,
	onSearchChange,
	selectedField,
	onFieldChange,
	interestsCount,
}: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-indigo-500/5 to-purple-500/10 p-8 md:p-12"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			{/* Animated background */}
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
				<div className="mb-4 flex items-center gap-2">
					<SparkleIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>IMTA Morocco Programs</Trans>
					</span>
				</div>

				<h1 className="mb-4 font-bold text-3xl tracking-tight md:text-4xl">
					<Trans>Complete Program Catalog</Trans>
				</h1>

				<p className="mb-8 max-w-2xl text-muted-foreground">
					<Trans>
						Explore all IMTA professional training programs. Compare courses, discover career opportunities, and plan
						your career in Morocco.
					</Trans>
				</p>

				{/* Search Bar */}
				<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
					<div className="relative max-w-xl flex-1">
						<MagnifyingGlassIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
						<Input
							type="search"
							placeholder={t`Search for a program, a skill...`}
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							className="h-12 rounded-xl border-border/50 bg-background/80 pr-4 pl-12 backdrop-blur-sm"
						/>
					</div>

					{/* Field Filter */}
					<Select value={selectedField} onValueChange={(v) => onFieldChange(v as ProgramField | "all")}>
						<SelectTrigger className="h-12 w-full rounded-xl bg-background/80 backdrop-blur-sm md:w-48">
							<SelectValue placeholder={t`All fields`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<div className="flex items-center gap-2">
									<SparkleIcon className="size-4" />
									<Trans>All domains</Trans>
								</div>
							</SelectItem>
							{(Object.entries(fieldConfig) as [ProgramField, (typeof fieldConfig)[ProgramField]][]).map(
								([field, config]) => (
									<SelectItem key={field} value={field}>
										<div className="flex items-center gap-2">
											<config.icon className="size-4" />
											{config.label}
										</div>
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>
				</div>

				{/* Quick Stats */}
				<div className="flex flex-wrap items-center gap-4">
					<Badge variant="secondary" className="gap-2 px-4 py-2">
						<GraduationCapIcon className="size-4" />
						{trainingPrograms.length} <Trans>programs</Trans>
					</Badge>
					<Badge variant="secondary" className="gap-2 px-4 py-2">
						<TrendUpIcon className="size-4" />
						90%+ <Trans>average employment rate</Trans>
					</Badge>
					<Badge variant="secondary" className="gap-2 px-4 py-2">
						<BookmarkSimpleIcon className="size-4" />
						{interestsCount} <Trans>in my interests</Trans>
					</Badge>
				</div>
			</div>
		</motion.div>
	);
}

// ─── Program Card ────────────────────────────────────────────────────────────

function ProgramCard({
	program,
	index,
	isSelected,
	isInInterests,
	onToggleCompare,
	onAddToInterests,
	compareDisabled,
}: ProgramCardProps) {
	const config = fieldConfig[program.field];
	const IconComponent = iconMap[program.icon] || config.icon;
	const demandInfo = demandLevelConfig[program.demandLevel];

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ delay: index * 0.03 }}
			layout
		>
			<Card
				className={cn(
					"group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
					"border-2",
					isSelected ? "border-indigo-500 ring-2 ring-indigo-500/20" : "hover:border-primary/50",
				)}
			>
				<CardHeader className="pb-3">
					<div className="mb-3 flex items-start justify-between">
						<div
							className={cn(
								"flex size-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
								config.bgColor,
							)}
						>
							<IconComponent className={cn("size-7", config.color)} weight="duotone" />
						</div>
						<div className="flex flex-col items-end gap-1">
							<Badge className={demandInfo.color}>{demandInfo.label}</Badge>
							<Badge
								variant="outline"
								className={cn(
									"gap-1",
									program.employmentRate >= 90
										? "bg-green-50 text-green-700 dark:bg-green-900/20"
										: "bg-blue-50 text-blue-700 dark:bg-blue-900/20",
								)}
							>
								<TrendUpIcon className="size-3" />
								{program.employmentRate}%
							</Badge>
						</div>
					</div>
					<CardTitle className="text-lg transition-colors group-hover:text-primary">{program.name}</CardTitle>
					<CardDescription className="line-clamp-2">{program.description}</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4 pt-0">
					<div className="flex flex-wrap gap-2">
						<Badge variant="outline" className="gap-1">
							<ClockIcon className="size-3" />
							{program.duration}
						</Badge>
						<Badge variant="outline" className="gap-1">
							<CertificateIcon className="size-3" />
							<Trans>Diploma</Trans>
						</Badge>
					</div>

					<div className="flex items-center gap-1 text-muted-foreground text-sm">
						<CurrencyCircleDollarIcon className="size-4" />
						<span>
							{program.salaryMin.toLocaleString()} - {program.salaryMax.toLocaleString()} {program.salaryCurrency}
						</span>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<Button
							variant={isSelected ? "default" : "outline"}
							size="sm"
							className={cn("gap-1", isSelected && "bg-indigo-500 hover:bg-indigo-600")}
							onClick={onToggleCompare}
							disabled={compareDisabled}
						>
							{isSelected ? (
								<>
									<CheckCircleIcon className="size-4" />
									<Trans>Selected</Trans>
								</>
							) : (
								<>
									<ScalesIcon className="size-4" />
									<Trans>Compare</Trans>
								</>
							)}
						</Button>

						<Button
							variant="ghost"
							size="sm"
							className={cn("gap-1", isInInterests && "text-amber-500")}
							onClick={onAddToInterests}
							disabled={isInInterests}
						>
							<BookmarkSimpleIcon className="size-4" weight={isInInterests ? "fill" : "regular"} />
							{isInInterests ? <Trans>Saved</Trans> : <Trans>Save</Trans>}
						</Button>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// ─── Catalog Tab Content ─────────────────────────────────────────────────────

interface CatalogTabProps {
	selectedField: ProgramField | "all";
	programsByField: Record<ProgramField, TrainingProgram[]>;
	filteredPrograms: TrainingProgram[];
	compareSelection: string[];
	isInInterests: (programId: string) => boolean;
	onToggleCompare: (programId: string) => void;
	onQuickAddToInterests: (program: TrainingProgram) => void;
}

export function CatalogTabContent({
	selectedField,
	programsByField,
	filteredPrograms,
	compareSelection,
	isInInterests,
	onToggleCompare,
	onQuickAddToInterests,
}: CatalogTabProps) {
	return (
		<div className="space-y-8">
			{/* Field Sections */}
			{selectedField === "all" ? (
				// Show all fields grouped
				(Object.entries(fieldConfig) as [ProgramField, (typeof fieldConfig)[ProgramField]][]).map(([field, config]) => {
					const programs = programsByField[field];
					if (programs.length === 0) return null;

					return (
						<motion.section key={field} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
							<div className="mb-6 flex items-center gap-3">
								<div className={cn("flex size-10 items-center justify-center rounded-xl", config.bgColor)}>
									<config.icon className={cn("size-5", config.color)} weight="duotone" />
								</div>
								<div>
									<h2 className="font-semibold text-xl">{config.label}</h2>
									<p className="text-muted-foreground text-sm">
										{programs.length} <Trans>program(s)</Trans>
									</p>
								</div>
							</div>

							<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{programs.map((program, index) => (
									<ProgramCard
										key={program.id}
										program={program}
										index={index}
										isSelected={compareSelection.includes(program.id)}
										isInInterests={isInInterests(program.id)}
										onToggleCompare={() => onToggleCompare(program.id)}
										onAddToInterests={() => onQuickAddToInterests(program)}
										compareDisabled={compareSelection.length >= 3 && !compareSelection.includes(program.id)}
									/>
								))}
							</div>
						</motion.section>
					);
				})
			) : (
				// Show filtered programs
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					<AnimatePresence mode="popLayout">
						{filteredPrograms.map((program, index) => (
							<ProgramCard
								key={program.id}
								program={program}
								index={index}
								isSelected={compareSelection.includes(program.id)}
								isInInterests={isInInterests(program.id)}
								onToggleCompare={() => onToggleCompare(program.id)}
								onAddToInterests={() => onQuickAddToInterests(program)}
								compareDisabled={compareSelection.length >= 3 && !compareSelection.includes(program.id)}
							/>
						))}
					</AnimatePresence>
				</div>
			)}

			{filteredPrograms.length === 0 && (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-16 text-center">
						<MagnifyingGlassIcon className="mb-4 size-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">
							<Trans>No programs found</Trans>
						</h3>
						<p className="text-muted-foreground">
							<Trans>Try changing your search criteria</Trans>
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// ─── Compare Tab Content ─────────────────────────────────────────────────────

interface CompareTabProps {
	compareSelection: string[];
	programsToCompare: TrainingProgram[];
	isCompareOpen: boolean;
	onCompareOpenChange: (open: boolean) => void;
	onToggleCompare: (programId: string) => void;
	isInInterests: (programId: string) => boolean;
	onQuickAddToInterests: (program: TrainingProgram) => void;
}

export function CompareTabContent({
	compareSelection,
	programsToCompare,
	isCompareOpen,
	onCompareOpenChange,
	onToggleCompare,
	isInInterests,
	onQuickAddToInterests,
}: CompareTabProps) {
	return (
		<div className="space-y-8">
			{/* Program Selector */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ScalesIcon className="size-5 text-indigo-500" />
						<Trans>Programs to Compare</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Select 2 to 3 programs to compare side by side</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap items-center gap-3">
						{/* Selected programs */}
						<AnimatePresence mode="popLayout">
							{compareSelection.map((programId) => {
								const program = trainingPrograms.find((p) => p.id === programId);
								if (!program) return null;

								const config = fieldConfig[program.field];
								const IconComponent = iconMap[program.icon] || config.icon;

								return (
									<motion.div
										key={programId}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.8 }}
										layout
									>
										<Badge variant="secondary" className={cn("flex items-center gap-2 px-3 py-2", config.bgColor)}>
											<IconComponent className={cn("size-4", config.color)} />
											{program.name}
											<button
												type="button"
												onClick={() => onToggleCompare(programId)}
												className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
											>
												<XIcon className="size-3" />
											</button>
										</Badge>
									</motion.div>
								);
							})}
						</AnimatePresence>

						{/* Add program button */}
						{compareSelection.length < 3 && (
							<Popover open={isCompareOpen} onOpenChange={onCompareOpenChange}>
								<PopoverTrigger asChild>
									<Button variant="outline" className="gap-2 border-dashed">
										<PlusCircleIcon className="size-4" />
										<Trans>Add a program</Trans>
										<CaretDownIcon className="size-4 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-80 p-0" align="start">
									<Command>
										<CommandInput placeholder={t`Search...`} />
										<CommandList>
											<CommandEmpty>
												<Trans>No programs found</Trans>
											</CommandEmpty>
											{(Object.entries(fieldConfig) as [ProgramField, (typeof fieldConfig)[ProgramField]][]).map(
												([field, config]) => {
													const available = trainingPrograms.filter(
														(p) => p.field === field && !compareSelection.includes(p.id),
													);
													if (available.length === 0) return null;

													return (
														<CommandGroup key={field} heading={config.label}>
															{available.map((program) => {
																const IconComponent = iconMap[program.icon] || config.icon;
																return (
																	<CommandItem
																		key={program.id}
																		value={program.id}
																		keywords={[program.name]}
																		onSelect={() => {
																			onToggleCompare(program.id);
																			onCompareOpenChange(false);
																		}}
																	>
																		<IconComponent className="mr-2 size-4" />
																		{program.name}
																	</CommandItem>
																);
															})}
														</CommandGroup>
													);
												},
											)}
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						)}
					</div>

					{compareSelection.length < 2 && (
						<p className="mt-4 text-muted-foreground text-sm">
							<Trans>Select at least 2 programs to start comparison</Trans>
						</p>
					)}
				</CardContent>
			</Card>

			{/* Comparison Table */}
			{programsToCompare.length >= 2 && (
				<ComparisonTable
					programsToCompare={programsToCompare}
					isInInterests={isInInterests}
					onQuickAddToInterests={onQuickAddToInterests}
				/>
			)}

			{programsToCompare.length < 2 && <CompareEmptyState />}
		</div>
	);
}

// ─── Comparison Table ────────────────────────────────────────────────────────

interface ComparisonTableProps {
	programsToCompare: TrainingProgram[];
	isInInterests: (programId: string) => boolean;
	onQuickAddToInterests: (program: TrainingProgram) => void;
}

function ComparisonTable({ programsToCompare, isInInterests, onQuickAddToInterests }: ComparisonTableProps) {
	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FunnelIcon className="size-5 text-primary" />
						<Trans>Detailed Comparison</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[200px]">
									<Trans>Criteria</Trans>
								</TableHead>
								{programsToCompare.map((program) => {
									const config = fieldConfig[program.field];
									const IconComponent = iconMap[program.icon] || config.icon;

									return (
										<TableHead key={program.id} className="min-w-[200px] text-center">
											<div className="flex flex-col items-center gap-2">
												<div className={cn("flex size-12 items-center justify-center rounded-xl", config.bgColor)}>
													<IconComponent className={cn("size-6", config.color)} weight="duotone" />
												</div>
												<span className="font-semibold">{program.name}</span>
												<Badge className={config.bgColor}>{config.label}</Badge>
											</div>
										</TableHead>
									);
								})}
							</TableRow>
						</TableHeader>
						<TableBody>
							{/* Duration */}
							<TableRow>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										<ClockIcon className="size-4 text-muted-foreground" />
										<Trans>Duration</Trans>
									</div>
								</TableCell>
								{programsToCompare.map((program) => (
									<TableCell key={program.id} className="text-center">
										<Badge variant="secondary">{program.duration}</Badge>
									</TableCell>
								))}
							</TableRow>

							{/* Prerequisites */}
							<TableRow>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										<CheckCircleIcon className="size-4 text-muted-foreground" />
										<Trans>Prerequisites</Trans>
									</div>
								</TableCell>
								{programsToCompare.map((program) => (
									<TableCell key={program.id}>
										<ul className="space-y-1 text-sm">
											{program.prerequisites.slice(0, 3).map((req, i) => (
												<li key={i} className="flex items-start gap-1">
													<CheckCircleIcon className="mt-0.5 size-3 shrink-0 text-green-500" />
													<span className="line-clamp-1">{req}</span>
												</li>
											))}
											{program.prerequisites.length > 3 && (
												<li className="text-muted-foreground">+{program.prerequisites.length - 3} more</li>
											)}
										</ul>
									</TableCell>
								))}
							</TableRow>

							{/* Salary */}
							<TableRow>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										<CurrencyCircleDollarIcon className="size-4 text-muted-foreground" />
										<Trans>Salary</Trans>
									</div>
								</TableCell>
								{programsToCompare.map((program) => {
									const maxSalary = Math.max(...programsToCompare.map((p) => p.salaryMax));
									const isBest = program.salaryMax === maxSalary;

									return (
										<TableCell key={program.id} className="text-center">
											<div className="space-y-2">
												<span className={cn("font-medium", isBest && "text-green-600")}>
													{program.salaryMin.toLocaleString()} - {program.salaryMax.toLocaleString()}{" "}
													{program.salaryCurrency}
												</span>
												{isBest && (
													<Badge className="ml-2 bg-green-500 text-white text-xs">
														<StarIcon className="mr-1 size-3" />
														Best
													</Badge>
												)}
											</div>
										</TableCell>
									);
								})}
							</TableRow>

							{/* Employment Rate */}
							<TableRow>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										<TrendUpIcon className="size-4 text-muted-foreground" />
										<Trans>Employment rate</Trans>
									</div>
								</TableCell>
								{programsToCompare.map((program) => {
									const maxRate = Math.max(...programsToCompare.map((p) => p.employmentRate));
									const isBest = program.employmentRate === maxRate;

									return (
										<TableCell key={program.id} className="text-center">
											<div className="flex items-center justify-center gap-2">
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
												{isBest && <StarIcon className="size-4 text-green-500" weight="fill" />}
											</div>
										</TableCell>
									);
								})}
							</TableRow>

							{/* Demand Level */}
							<TableRow>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										<UsersIcon className="size-4 text-muted-foreground" />
										<Trans>Demand</Trans>
									</div>
								</TableCell>
								{programsToCompare.map((program) => {
									const demandInfo = demandLevelConfig[program.demandLevel];

									return (
										<TableCell key={program.id} className="text-center">
											<Badge className={demandInfo.color}>{demandInfo.label}</Badge>
										</TableCell>
									);
								})}
							</TableRow>

							{/* Certification */}
							<TableRow>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										<CertificateIcon className="size-4 text-muted-foreground" />
										<Trans>Certification</Trans>
									</div>
								</TableCell>
								{programsToCompare.map((program) => (
									<TableCell key={program.id} className="text-center">
										<span className="text-sm">{program.certification}</span>
									</TableCell>
								))}
							</TableRow>

							{/* Career Outcomes */}
							<TableRow>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										<BriefcaseIcon className="size-4 text-muted-foreground" />
										<Trans>Career Prospects</Trans>
									</div>
								</TableCell>
								{programsToCompare.map((program) => (
									<TableCell key={program.id}>
										<div className="flex flex-wrap gap-1">
											{program.careerOutcomes.slice(0, 3).map((outcome, i) => (
												<Badge key={i} variant="outline" className="text-xs">
													{outcome}
												</Badge>
											))}
											{program.careerOutcomes.length > 3 && (
												<Badge variant="outline" className="text-xs">
													+{program.careerOutcomes.length - 3}
												</Badge>
											)}
										</div>
									</TableCell>
								))}
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
				<CardFooter className="flex-wrap gap-3 border-t pt-6">
					{programsToCompare.map((program) => (
						<Button
							key={program.id}
							variant="secondary"
							size="sm"
							className="gap-2"
							onClick={() => onQuickAddToInterests(program)}
							disabled={isInInterests(program.id)}
						>
							<BookmarkSimpleIcon className="size-4" />
							{isInInterests(program.id) ? (
								<Trans>Already added</Trans>
							) : (
								<>
									<Trans>Add</Trans> {program.name}
								</>
							)}
						</Button>
					))}
				</CardFooter>
			</Card>
		</motion.div>
	);
}

function CompareEmptyState() {
	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center justify-center py-16 text-center">
				<ScalesIcon className="mb-4 size-16 text-muted-foreground" />
				<h3 className="mb-2 font-semibold text-xl">
					<Trans>Start your comparison</Trans>
				</h3>
				<p className="mb-6 max-w-md text-muted-foreground">
					<Trans>
						Select at least 2 programs above to see a detailed comparison of durations, salaries, skills, and career
						opportunities.
					</Trans>
				</p>
			</CardContent>
		</Card>
	);
}

// ─── Interests Tab Content ───────────────────────────────────────────────────

interface InterestsTabProps {
	interests: TrainingInterest[];
	isAddInterestDialogOpen: boolean;
	onAddInterestDialogChange: (open: boolean) => void;
	isAddCustomDialogOpen: boolean;
	onAddCustomDialogChange: (open: boolean) => void;
	selectedProgramForInterest: string;
	onSelectedProgramChange: (value: string) => void;
	interestNotes: string;
	onInterestNotesChange: (value: string) => void;
	onAddInterest: () => void;
	customProgram: {
		name: string;
		field: ProgramField;
		duration: string;
		institution: string;
		description: string;
	};
	onCustomProgramChange: (
		updater: (prev: InterestsTabProps["customProgram"]) => InterestsTabProps["customProgram"],
	) => void;
	onAddCustomInterest: () => void;
	onRemoveInterest: (id: string) => void;
	isInInterests: (programId: string) => boolean;
	onSetActiveTab: (tab: "catalog" | "compare" | "interests") => void;
}

export function InterestsTabContent({
	interests,
	isAddInterestDialogOpen,
	onAddInterestDialogChange,
	isAddCustomDialogOpen,
	onAddCustomDialogChange,
	selectedProgramForInterest,
	onSelectedProgramChange,
	interestNotes,
	onInterestNotesChange,
	onAddInterest,
	customProgram,
	onCustomProgramChange,
	onAddCustomInterest,
	onRemoveInterest,
	isInInterests,
	onSetActiveTab,
}: InterestsTabProps) {
	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="font-bold text-2xl">
						<Trans>My Training Interests</Trans>
					</h2>
					<p className="text-muted-foreground">
						<Trans>Manage your favorite training programs</Trans>
					</p>
				</div>

				<div className="flex gap-2">
					{/* Add from catalog */}
					<AddFromCatalogDialog
						isOpen={isAddInterestDialogOpen}
						onOpenChange={onAddInterestDialogChange}
						selectedProgram={selectedProgramForInterest}
						onSelectedProgramChange={onSelectedProgramChange}
						notes={interestNotes}
						onNotesChange={onInterestNotesChange}
						onAdd={onAddInterest}
						isInInterests={isInInterests}
					/>

					{/* Add custom */}
					<AddCustomDialog
						isOpen={isAddCustomDialogOpen}
						onOpenChange={onAddCustomDialogChange}
						customProgram={customProgram}
						onCustomProgramChange={onCustomProgramChange}
						onAdd={onAddCustomInterest}
					/>
				</div>
			</div>

			{interests.length > 0 ? (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					<AnimatePresence mode="popLayout">
						{interests.map((interest, index) => (
							<InterestCard key={interest.id} interest={interest} index={index} onRemove={onRemoveInterest} />
						))}
					</AnimatePresence>
				</div>
			) : (
				<InterestsEmptyState
					onExploreCatalog={() => onSetActiveTab("catalog")}
					onAddCustom={() => onAddCustomDialogChange(true)}
				/>
			)}
		</div>
	);
}

// ─── Add From Catalog Dialog ─────────────────────────────────────────────────

interface AddFromCatalogDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedProgram: string;
	onSelectedProgramChange: (value: string) => void;
	notes: string;
	onNotesChange: (value: string) => void;
	onAdd: () => void;
	isInInterests: (programId: string) => boolean;
}

function AddFromCatalogDialog({
	isOpen,
	onOpenChange,
	selectedProgram,
	onSelectedProgramChange,
	notes,
	onNotesChange,
	onAdd,
	isInInterests,
}: AddFromCatalogDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" className="gap-2">
					<PlusCircleIcon className="size-4" />
					<Trans>Add from catalog</Trans>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Add a program to my interests</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Select a program from the IMTA catalog</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label>
							<Trans>Program</Trans>
						</Label>
						<Select value={selectedProgram} onValueChange={onSelectedProgramChange}>
							<SelectTrigger>
								<SelectValue placeholder={t`Select a program...`} />
							</SelectTrigger>
							<SelectContent>
								{(Object.entries(fieldConfig) as [ProgramField, (typeof fieldConfig)[ProgramField]][]).map(
									([field, config]) => {
										const available = trainingPrograms.filter((p) => p.field === field && !isInInterests(p.id));
										if (available.length === 0) return null;

										return (
											<div key={field}>
												<div className="px-2 py-1.5 font-semibold text-muted-foreground text-xs">{config.label}</div>
												{available.map((program) => (
													<SelectItem key={program.id} value={program.id}>
														{program.name}
													</SelectItem>
												))}
											</div>
										);
									},
								)}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>
							<Trans>Notes (optional)</Trans>
						</Label>
						<Textarea
							placeholder={t`Add notes about your goals...`}
							value={notes}
							onChange={(e) => onNotesChange(e.target.value)}
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
					<Button onClick={onAdd} disabled={!selectedProgram}>
						<PlusCircleIcon className="mr-2 size-4" />
						<Trans>Add</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ─── Add Custom Dialog ───────────────────────────────────────────────────────

interface AddCustomDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	customProgram: {
		name: string;
		field: ProgramField;
		duration: string;
		institution: string;
		description: string;
	};
	onCustomProgramChange: (
		updater: (prev: AddCustomDialogProps["customProgram"]) => AddCustomDialogProps["customProgram"],
	) => void;
	onAdd: () => void;
}

function AddCustomDialog({ isOpen, onOpenChange, customProgram, onCustomProgramChange, onAdd }: AddCustomDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<PencilSimpleIcon className="size-4" />
					<Trans>Customized training</Trans>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Add a custom program</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Add a program not in the IMTA catalog</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label>
							<Trans>Program name</Trans> *
						</Label>
						<Input
							placeholder={t`E.g.: Master in Digital Marketing`}
							value={customProgram.name}
							onChange={(e) => onCustomProgramChange((prev) => ({ ...prev, name: e.target.value }))}
						/>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>
								<Trans>Domain</Trans>
							</Label>
							<Select
								value={customProgram.field}
								onValueChange={(v) => onCustomProgramChange((prev) => ({ ...prev, field: v as ProgramField }))}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{(Object.entries(fieldConfig) as [ProgramField, (typeof fieldConfig)[ProgramField]][]).map(
										([field, config]) => (
											<SelectItem key={field} value={field}>
												<div className="flex items-center gap-2">
													<config.icon className="size-4" />
													{config.label}
												</div>
											</SelectItem>
										),
									)}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Duration</Trans>
							</Label>
							<Input
								placeholder={t`E.g.: 2 years`}
								value={customProgram.duration}
								onChange={(e) => onCustomProgramChange((prev) => ({ ...prev, duration: e.target.value }))}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label>
							<Trans>Institution</Trans>
						</Label>
						<Input
							placeholder={t`E.g.: Mohammed V University`}
							value={customProgram.institution}
							onChange={(e) => onCustomProgramChange((prev) => ({ ...prev, institution: e.target.value }))}
						/>
					</div>

					<div className="space-y-2">
						<Label>
							<Trans>Description</Trans>
						</Label>
						<Textarea
							placeholder={t`Describe the training program...`}
							value={customProgram.description}
							onChange={(e) => onCustomProgramChange((prev) => ({ ...prev, description: e.target.value }))}
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
					<Button onClick={onAdd} disabled={!customProgram.name.trim()}>
						<PlusCircleIcon className="mr-2 size-4" />
						<Trans>Add</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ─── Interest Card ───────────────────────────────────────────────────────────

interface InterestCardProps {
	interest: TrainingInterest;
	index: number;
	onRemove: (id: string) => void;
}

function InterestCard({ interest, index, onRemove }: InterestCardProps) {
	const config = fieldConfig[interest.field];
	const program = trainingPrograms.find((p) => p.id === interest.programId);
	const IconComponent = program ? iconMap[program.icon] || config.icon : config.icon;

	return (
		<motion.div
			key={interest.id}
			initial={false}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ delay: index * 0.05 }}
			layout
		>
			<Card className="h-full transition-all duration-300 hover:shadow-lg">
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div className={cn("flex size-12 items-center justify-center rounded-xl", config.bgColor)}>
								<IconComponent className={cn("size-6", config.color)} weight="duotone" />
							</div>
							<div>
								<CardTitle className="text-lg">{interest.programName}</CardTitle>
								<div className="mt-1 flex items-center gap-2">
									<Badge className={config.bgColor}>{config.label}</Badge>
									{interest.isCustom && (
										<Badge variant="outline" className="text-xs">
											<PencilSimpleIcon className="mr-1 size-3" />
											<Trans>Custom</Trans>
										</Badge>
									)}
								</div>
							</div>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-destructive"
							onClick={() => onRemove(interest.id)}
						>
							<TrashIcon className="size-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{program && !interest.isCustom && (
						<>
							<div className="flex flex-wrap gap-2">
								<Badge variant="outline" className="gap-1">
									<ClockIcon className="size-3" />
									{program.duration}
								</Badge>
								<Badge
									variant="outline"
									className="gap-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
								>
									<TrendUpIcon className="size-3" />
									{program.employmentRate}% employment
								</Badge>
							</div>
							<div className="flex items-center gap-1 text-muted-foreground text-sm">
								<CurrencyCircleDollarIcon className="size-4" />
								<span>
									{program.salaryMin.toLocaleString()} - {program.salaryMax.toLocaleString()} {program.salaryCurrency}
								</span>
							</div>
						</>
					)}

					{interest.isCustom && interest.customDetails && (
						<div className="space-y-2 text-sm">
							{interest.customDetails.duration && (
								<div className="flex items-center gap-2">
									<ClockIcon className="size-4 text-muted-foreground" />
									<span>{interest.customDetails.duration}</span>
								</div>
							)}
							{interest.customDetails.institution && (
								<div className="flex items-center gap-2">
									<HouseIcon className="size-4 text-muted-foreground" />
									<span>{interest.customDetails.institution}</span>
								</div>
							)}
							{interest.customDetails.description && (
								<p className="text-muted-foreground">{interest.customDetails.description}</p>
							)}
						</div>
					)}

					{interest.notes && (
						<div className="rounded-lg bg-muted/50 p-3">
							<div className="mb-1 flex items-center gap-1 text-muted-foreground text-xs">
								<NoteIcon className="size-3" />
								<Trans>Notes</Trans>
							</div>
							<p className="text-sm">{interest.notes}</p>
						</div>
					)}

					<div className="flex items-center gap-1 text-muted-foreground text-xs">
						<CalendarIcon className="size-3" />
						<Trans>Added on</Trans> {new Date(interest.addedAt).toLocaleDateString()}
					</div>
				</CardContent>
				{!interest.isCustom && program && (
					<CardFooter className="border-t pt-4">
						<Link to="/dashboard/resources/programs/$programId" params={{ programId: program.id }}>
							<Button variant="outline" size="sm" className="gap-2">
								<ArrowRightIcon className="size-4" />
								<Trans>View program</Trans>
							</Button>
						</Link>
					</CardFooter>
				)}
			</Card>
		</motion.div>
	);
}

// ─── Interests Empty State ───────────────────────────────────────────────────

interface InterestsEmptyStateProps {
	onExploreCatalog: () => void;
	onAddCustom: () => void;
}

function InterestsEmptyState({ onExploreCatalog, onAddCustom }: InterestsEmptyStateProps) {
	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center justify-center py-16 text-center">
				<BookmarkSimpleIcon className="mb-4 size-16 text-muted-foreground" />
				<h3 className="mb-2 font-semibold text-xl">
					<Trans>No saved programs</Trans>
				</h3>
				<p className="mb-6 max-w-md text-muted-foreground">
					<Trans>Add programs from the catalog or create your own courses to track your career interests.</Trans>
				</p>
				<div className="flex gap-3">
					<Button variant="outline" className="gap-2" onClick={onExploreCatalog}>
						<GraduationCapIcon className="size-4" />
						<Trans>Explore the catalog</Trans>
					</Button>
					<Button className="gap-2" onClick={onAddCustom}>
						<PlusCircleIcon className="size-4" />
						<Trans>Customized training</Trans>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Tabs Header ─────────────────────────────────────────────────────────────
