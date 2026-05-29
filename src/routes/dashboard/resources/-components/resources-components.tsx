import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	ArticleIcon,
	BookmarkSimpleIcon,
	BookOpenIcon,
	BriefcaseIcon,
	CaretLeftIcon,
	CaretRightIcon,
	CheckCircleIcon,
	ClockIcon,
	CurrencyCircleDollarIcon,
	DownloadIcon,
	FileTextIcon,
	FirstAidKitIcon,
	FunnelIcon,
	GearIcon,
	GraduationCapIcon,
	HardHatIcon,
	MagnifyingGlassIcon,
	PathIcon,
	PlayCircleIcon,
	PlusCircleIcon,
	QuotesIcon,
	RocketLaunchIcon,
	SparkleIcon,
	StarIcon,
	TrendUpIcon,
	TrophyIcon,
	UsersIcon,
	VideoIcon,
	XIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import type { Dispatch, SetStateAction } from "react";
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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../../-components/header";
import {
	categoryColors,
	categoryGradients,
	categoryIcons,
	categoryLabels,
	EMPLOYMENT_RATE_DEFAULTS,
	programIconMap,
	typeIcons,
	typeLabels,
} from "./resources-config";
import type { TrainingInterest } from "./resources-types";

// ─── Loading Skeleton ────────────────────────────────────────────────────────

export function ResourcesLoadingSkeleton() {
	return (
		<>
			<DashboardHeader icon={GraduationCapIcon} title={t`Training Center & Resources`} />

			<div className="mb-8 space-y-6 rounded-3xl border p-8 md:p-12">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-12 w-full max-w-3xl" />
				<Skeleton className="h-6 w-full max-w-2xl" />
				<div className="flex flex-wrap gap-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-12 w-32" />
					))}
				</div>
			</div>

			<div className="space-y-8">
				<div className="flex flex-wrap gap-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-10 w-24 rounded-full" />
					))}
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-64 rounded-xl" />
					))}
				</div>
			</div>
		</>
	);
}

// ─── Hero Section ────────────────────────────────────────────────────────────

interface HeroSectionProps {
	searchQuery: string;
	setSearchQuery: Dispatch<SetStateAction<string>>;
	programsCount: number;
	resourcesCount: number;
}

export function HeroSection({ searchQuery, setSearchQuery, programsCount, resourcesCount }: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-12"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-[oklch(0.65_0.15_195)]/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl"
					animate={{
						scale: [1, 1.3, 1],
					}}
					transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<SparkleIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>IMTA Resources</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Training Center & Resources</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Explore our training programs, career guides, video tutorials, and success stories. Everything you need to
						launch your professional career in Morocco.
					</Trans>
				</motion.p>

				{/* Search Bar */}
				<motion.div
					className="relative max-w-xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
				>
					<MagnifyingGlassIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						placeholder={t`Search for programs, guides, videos...`}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="h-14 rounded-2xl border-border/50 bg-background/80 pr-4 pl-12 text-lg backdrop-blur-sm transition-all focus:border-primary/50 focus:bg-background focus:shadow-lg focus:shadow-primary/10"
					/>
				</motion.div>

				{/* Quick Stats in Hero */}
				<motion.div
					className="mt-8 flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<GraduationCapIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{programsCount}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Programs</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10">
							<BookOpenIcon className="size-5 text-blue-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{resourcesCount}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Resources</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<TrophyIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">90%+</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Employment rate</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

interface OverviewTabProps {
	programs: Array<{
		id: string;
		name: string;
		description: string;
		icon: string;
		category: string;
		duration: string;
		salaryRange: { min: number; max: number; currency: string };
	}>;
	filteredPrograms: Array<{
		id: string;
		name: string;
		description: string;
		icon: string;
		category: string;
		duration: string;
		salaryRange: { min: number; max: number; currency: string };
	}>;
	programCategory: "all" | "healthcare" | "industrial" | "hse";
	setProgramCategory: Dispatch<SetStateAction<"all" | "healthcare" | "industrial" | "hse">>;
	learningPaths:
		| Array<{
				id: string;
				title: string;
				description: string;
				category: string;
				stepsCount: number;
				estimatedDuration: string;
				steps: Array<{ order: number; title: string; description: string }>;
		  }>
		| undefined;
	pathProgress: Record<string, number>;
	successStories:
		| Array<{
				id: string;
				title: string;
				description: string;
				category: string;
				author?: string | null | undefined;
				tags: string[];
		  }>
		| undefined;
	successStoryIndex: number;
	setSuccessStoryIndex: Dispatch<SetStateAction<number>>;
	nextStory: () => void;
	prevStory: () => void;
	guides: Array<unknown>;
	videos: Array<unknown>;
	templates: Array<unknown>;
	articles: Array<unknown>;
	setActiveTab: Dispatch<SetStateAction<string>>;
}

export function OverviewTab({
	filteredPrograms,
	programCategory,
	setProgramCategory,
	learningPaths,
	pathProgress,
	successStories,
	successStoryIndex,
	setSuccessStoryIndex,
	nextStory,
	prevStory,
	guides,
	videos,
	templates,
	articles,
	setActiveTab,
}: OverviewTabProps) {
	return (
		<TabsContent value="overview" className="space-y-10">
			{/* Featured Programs Section */}
			<section>
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h3 className="flex items-center gap-2 font-semibold text-2xl">
							<GraduationCapIcon className="size-6 text-primary" weight="duotone" />
							<Trans>IMTA Training Programs</Trans>
						</h3>
						<p className="mt-1 text-muted-foreground">
							<Trans>Discover our professional training programs and launch your career</Trans>
						</p>
					</div>
					<Button variant="ghost" className="gap-2" onClick={() => setActiveTab("programs")}>
						<Trans>View all</Trans>
						<ArrowRightIcon className="size-4" />
					</Button>
				</div>

				{/* Category Filter Pills */}
				<div className="mb-6 flex flex-wrap gap-2">
					{[
						{ value: "all", label: "All", icon: SparkleIcon },
						{ value: "healthcare", label: "Healthcare", icon: FirstAidKitIcon },
						{ value: "industrial", label: "Industrial", icon: GearIcon },
						{ value: "hse", label: "HSE", icon: HardHatIcon },
					].map((cat) => (
						<Button
							key={cat.value}
							variant={programCategory === cat.value ? "default" : "outline"}
							size="sm"
							className={cn("gap-2 rounded-full transition-all", programCategory === cat.value && "shadow-md")}
							onClick={() => setProgramCategory(cat.value as typeof programCategory)}
						>
							<cat.icon className="size-4" />
							{cat.label}
						</Button>
					))}
				</div>

				{/* Programs Grid */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					<AnimatePresence mode="popLayout">
						{filteredPrograms.slice(0, 6).map((program, index) => {
							const IconComponent =
								programIconMap[program.icon] ?? categoryIcons[program.category as keyof typeof categoryIcons];
							const employmentRate = EMPLOYMENT_RATE_DEFAULTS[program.id] ?? 85;

							return (
								<motion.div
									key={program.id}
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
									transition={{ delay: index * 0.05 }}
									layout
								>
									<Link to="/dashboard/resources/programs/$programId" params={{ programId: program.id }}>
										<Card
											className={cn(
												"group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/10 hover:shadow-xl",
												"border-transparent bg-gradient-to-br",
												categoryGradients[program.category as keyof typeof categoryGradients],
											)}
										>
											<CardHeader className="pb-3">
												<div className="mb-3 flex items-start justify-between">
													<div
														className={cn(
															"flex size-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
															categoryColors[program.category as keyof typeof categoryColors],
														)}
													>
														<IconComponent className="size-7" weight="duotone" />
													</div>
													<div className="flex flex-col items-end gap-1">
														<Badge variant="secondary" className="font-medium text-xs">
															<ClockIcon className="mr-1 size-3" />
															{program.duration}
														</Badge>
														<Badge className={cn("text-xs", employmentRate >= 90 ? "bg-green-500" : "bg-blue-500")}>
															<TrendUpIcon className="mr-1 size-3" />
															{employmentRate}% employment
														</Badge>
													</div>
												</div>
												<CardTitle className="text-xl transition-colors group-hover:text-primary">
													{program.name}
												</CardTitle>
												<CardDescription className="line-clamp-2">{program.description}</CardDescription>
											</CardHeader>
											<CardContent className="pt-0">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-1 text-muted-foreground text-sm">
														<CurrencyCircleDollarIcon className="size-4" />
														<span>
															{program.salaryRange.min.toLocaleString()} - {program.salaryRange.max.toLocaleString()}{" "}
															{program.salaryRange.currency}
														</span>
													</div>
													<ArrowRightIcon className="size-5 text-primary opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
												</div>
											</CardContent>
										</Card>
									</Link>
								</motion.div>
							);
						})}
					</AnimatePresence>
				</div>
			</section>

			{/* Learning Paths Section */}
			<section>
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h3 className="flex items-center gap-2 font-semibold text-2xl">
							<PathIcon className="size-6 text-amber-500" weight="duotone" />
							<Trans>Learning Paths</Trans>
						</h3>
						<p className="mt-1 text-muted-foreground">
							<Trans>Follow a structured path to maximize your chances of success</Trans>
						</p>
					</div>
					<Button variant="ghost" className="gap-2" onClick={() => setActiveTab("learning-paths")}>
						<Trans>View all</Trans>
						<ArrowRightIcon className="size-4" />
					</Button>
				</div>

				<div className="grid gap-6 md:grid-cols-3">
					{learningPaths?.map((path, index) => {
						const CategoryIcon = categoryIcons[path.category as keyof typeof categoryIcons];
						const progress = pathProgress[path.id] ?? 0;

						return (
							<motion.div
								key={path.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card className="h-full transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg">
									<CardHeader>
										<div className="mb-3 flex items-center justify-between">
											<div className="flex size-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
												<CategoryIcon className="size-6 text-amber-600 dark:text-amber-400" weight="duotone" />
											</div>
											<Badge className={categoryColors[path.category as keyof typeof categoryColors]}>
												{categoryLabels[path.category as keyof typeof categoryLabels]}
											</Badge>
										</div>
										<CardTitle className="text-lg">{path.title}</CardTitle>
										<CardDescription className="line-clamp-2">{path.description}</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											<div className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground">
													{path.stepsCount} <Trans>steps</Trans>
												</span>
												<span className="font-medium text-amber-600 dark:text-amber-400">{path.estimatedDuration}</span>
											</div>
											<div className="space-y-1">
												<div className="flex items-center justify-between text-xs">
													<span className="text-muted-foreground">
														<Trans>Progress</Trans>
													</span>
													<span className="font-medium">{progress}%</span>
												</div>
												<Progress value={progress} className="h-2" />
											</div>
										</div>
									</CardContent>
									<CardFooter className="pt-0">
										<Button variant="outline" className="w-full gap-2" onClick={() => setActiveTab("learning-paths")}>
											{progress > 0 ? (
												<>
													<RocketLaunchIcon className="size-4" />
													<Trans>Continue</Trans>
												</>
											) : (
												<>
													<PlayCircleIcon className="size-4" />
													<Trans>Start</Trans>
												</>
											)}
										</Button>
									</CardFooter>
								</Card>
							</motion.div>
						);
					})}
				</div>
			</section>

			{/* Success Stories Carousel */}
			<section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[oklch(0.65_0.15_195)]/10 via-primary/5 to-transparent p-8">
				<div className="absolute top-0 right-0 size-64 rounded-full bg-[oklch(0.65_0.15_195)]/10 blur-3xl" />

				<div className="relative">
					<div className="mb-6 flex items-center justify-between">
						<div>
							<h3 className="flex items-center gap-2 font-semibold text-2xl">
								<StarIcon className="size-6 text-[oklch(0.65_0.15_195)]" weight="fill" />
								<Trans>Success Stories</Trans>
							</h3>
							<p className="mt-1 text-muted-foreground">
								<Trans>Get inspired by the journeys of our former students</Trans>
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="icon" className="size-8 rounded-full" onClick={prevStory}>
								<CaretLeftIcon className="size-4" />
							</Button>
							<Button variant="outline" size="icon" className="size-8 rounded-full" onClick={nextStory}>
								<CaretRightIcon className="size-4" />
							</Button>
						</div>
					</div>

					<AnimatePresence mode="wait">
						{successStories && successStories.length > 0 && (
							<motion.div
								key={successStoryIndex}
								initial={{ opacity: 0, x: 50 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -50 }}
								transition={{ duration: 0.3 }}
								className="grid gap-6 md:grid-cols-2"
							>
								<Card className="border-none bg-background/60 shadow-lg backdrop-blur-sm">
									<CardContent className="p-6">
										<QuotesIcon className="mb-4 size-10 text-primary/30" weight="fill" />
										<p className="mb-4 text-lg text-muted-foreground italic">
											{successStories[successStoryIndex].description}
										</p>
										<div className="flex items-center gap-3">
											<div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.65_0.15_195)]">
												<UsersIcon className="size-6 text-white" weight="duotone" />
											</div>
											<div>
												<p className="font-semibold">{successStories[successStoryIndex].author ?? "Former Student"}</p>
												<Badge
													className={
														categoryColors[successStories[successStoryIndex].category as keyof typeof categoryColors]
													}
												>
													{categoryLabels[successStories[successStoryIndex].category as keyof typeof categoryLabels]}
												</Badge>
											</div>
										</div>
									</CardContent>
								</Card>

								<div className="flex flex-col justify-center">
									<h4 className="mb-3 font-semibold text-xl">{successStories[successStoryIndex].title}</h4>
									<div className="space-y-2">
										{successStories[successStoryIndex].tags.slice(0, 4).map((tag) => (
											<Badge key={tag} variant="outline" className="mr-2">
												{tag}
											</Badge>
										))}
									</div>
									<Button
										variant="link"
										className="mt-4 w-fit gap-2 p-0"
										onClick={() => setActiveTab("success-stories")}
									>
										<Trans>Read more testimonials</Trans>
										<ArrowRightIcon className="size-4" />
									</Button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Carousel indicators */}
					<div className="mt-6 flex justify-center gap-2">
						{successStories?.map((_, idx) => (
							<button
								type="button"
								key={idx}
								className={cn(
									"size-2 rounded-full transition-all",
									idx === successStoryIndex ? "w-6 bg-primary" : "bg-primary/30",
								)}
								onClick={() => setSuccessStoryIndex(idx)}
							/>
						))}
					</div>
				</div>
			</section>

			{/* Quick Access Resources */}
			<section>
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h3 className="flex items-center gap-2 font-semibold text-2xl">
							<BookOpenIcon className="size-6 text-blue-500" weight="duotone" />
							<Trans>Quick Access to Resources</Trans>
						</h3>
						<p className="mt-1 text-muted-foreground">
							<Trans>Guides, videos, and templates for your preparation</Trans>
						</p>
					</div>
					<Button variant="ghost" className="gap-2" onClick={() => setActiveTab("resources")}>
						<Trans>View library</Trans>
						<ArrowRightIcon className="size-4" />
					</Button>
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{/* Guides Card */}
					<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
						<Card className="group h-full cursor-pointer transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg">
							<CardHeader>
								<div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-blue-100 transition-transform group-hover:scale-110 dark:bg-blue-900/30">
									<BookOpenIcon className="size-6 text-blue-600 dark:text-blue-400" weight="duotone" />
								</div>
								<CardTitle className="text-lg">
									<Trans>Guides</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Complete guides for every step</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="font-bold text-2xl text-blue-600">{guides.length}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>guides available</Trans>
								</p>
							</CardContent>
						</Card>
					</motion.div>

					{/* Videos Card */}
					<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
						<Card className="group h-full cursor-pointer transition-all duration-300 hover:border-red-500/50 hover:shadow-lg">
							<CardHeader>
								<div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-red-100 transition-transform group-hover:scale-110 dark:bg-red-900/30">
									<VideoIcon className="size-6 text-red-600 dark:text-red-400" weight="duotone" />
								</div>
								<CardTitle className="text-lg">
									<Trans>Videos</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Practical video tutorials</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="font-bold text-2xl text-red-600">{videos.length}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>videos available</Trans>
								</p>
							</CardContent>
						</Card>
					</motion.div>

					{/* Templates Card */}
					<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
						<Card className="group h-full cursor-pointer transition-all duration-300 hover:border-green-500/50 hover:shadow-lg">
							<CardHeader>
								<div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-green-100 transition-transform group-hover:scale-110 dark:bg-green-900/30">
									<FileTextIcon className="size-6 text-green-600 dark:text-green-400" weight="duotone" />
								</div>
								<CardTitle className="text-lg">
									<Trans>Templates</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Ready-to-use resumes and cover letters</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="font-bold text-2xl text-green-600">{templates.length}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>templates available</Trans>
								</p>
							</CardContent>
						</Card>
					</motion.div>

					{/* Articles Card */}
					<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
						<Card className="group h-full cursor-pointer transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg">
							<CardHeader>
								<div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-purple-100 transition-transform group-hover:scale-110 dark:bg-purple-900/30">
									<ArticleIcon className="size-6 text-purple-600 dark:text-purple-400" weight="duotone" />
								</div>
								<CardTitle className="text-lg">
									<Trans>Articles</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Market news and trends</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="font-bold text-2xl text-purple-600">{articles.length}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>articles available</Trans>
								</p>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</section>
		</TabsContent>
	);
}

// ─── Programs Tab ────────────────────────────────────────────────────────────

interface ProgramsTabProps {
	programs:
		| Array<{
				id: string;
				name: string;
				description: string;
				icon: string;
				category: string;
				duration: string;
				salaryRange: { min: number; max: number; currency: string };
		  }>
		| undefined;
	filteredPrograms: Array<{
		id: string;
		name: string;
		description: string;
		icon: string;
		category: string;
		duration: string;
		salaryRange: { min: number; max: number; currency: string };
	}>;
	programCategory: "all" | "healthcare" | "industrial" | "hse";
	setProgramCategory: Dispatch<SetStateAction<"all" | "healthcare" | "industrial" | "hse">>;
}

export function ProgramsTab({ programs, filteredPrograms, programCategory, setProgramCategory }: ProgramsTabProps) {
	return (
		<TabsContent value="programs" className="space-y-8">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="font-bold text-2xl">
						<Trans>All IMTA Programs</Trans>
					</h2>
					<p className="text-muted-foreground">
						<Trans>Explore our programs and find the one that suits you</Trans>
					</p>
				</div>
			</div>

			{/* Category Tabs */}
			<Tabs
				value={programCategory}
				onValueChange={(v) => setProgramCategory(v as typeof programCategory)}
				className="space-y-6"
			>
				<TabsList className="h-auto flex-wrap gap-2 bg-transparent p-0">
					<TabsTrigger
						value="all"
						className="gap-2 rounded-full border px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						<SparkleIcon className="size-4" />
						<Trans>All</Trans>
						<Badge variant="secondary" className="ml-1">
							{programs?.length ?? 0}
						</Badge>
					</TabsTrigger>
					<TabsTrigger
						value="healthcare"
						className="gap-2 rounded-full border px-6 data-[state=active]:bg-red-500 data-[state=active]:text-white"
					>
						<FirstAidKitIcon className="size-4" />
						<Trans>Health</Trans>
						<Badge variant="secondary" className="ml-1">
							{programs?.filter((p) => p.category === "healthcare").length ?? 0}
						</Badge>
					</TabsTrigger>
					<TabsTrigger
						value="industrial"
						className="gap-2 rounded-full border px-6 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
					>
						<GearIcon className="size-4" />
						<Trans>Industrial</Trans>
						<Badge variant="secondary" className="ml-1">
							{programs?.filter((p) => p.category === "industrial").length ?? 0}
						</Badge>
					</TabsTrigger>
					<TabsTrigger
						value="hse"
						className="gap-2 rounded-full border px-6 data-[state=active]:bg-amber-500 data-[state=active]:text-white"
					>
						<HardHatIcon className="size-4" />
						<Trans>HSE</Trans>
						<Badge variant="secondary" className="ml-1">
							{programs?.filter((p) => p.category === "hse").length ?? 0}
						</Badge>
					</TabsTrigger>
				</TabsList>

				<TabsContent value={programCategory} className="mt-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<AnimatePresence mode="popLayout">
							{filteredPrograms.map((program, index) => {
								const IconComponent =
									programIconMap[program.icon] ?? categoryIcons[program.category as keyof typeof categoryIcons];
								const employmentRate = EMPLOYMENT_RATE_DEFAULTS[program.id] ?? 85;

								return (
									<motion.div
										key={program.id}
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.9 }}
										transition={{ delay: index * 0.03 }}
										layout
									>
										<Link to="/dashboard/resources/programs/$programId" params={{ programId: program.id }}>
											<Card
												className={cn(
													"group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
													"border-2 hover:border-primary/50",
												)}
											>
												<CardHeader className="pb-3">
													<div className="mb-3 flex items-start justify-between">
														<div
															className={cn(
																"flex size-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
																categoryColors[program.category as keyof typeof categoryColors],
															)}
														>
															<IconComponent className="size-8" weight="duotone" />
														</div>
														<div className="flex flex-col items-end gap-2">
															<Badge className={categoryColors[program.category as keyof typeof categoryColors]}>
																{categoryLabels[program.category as keyof typeof categoryLabels]}
															</Badge>
														</div>
													</div>
													<CardTitle className="text-xl transition-colors group-hover:text-primary">
														{program.name}
													</CardTitle>
													<CardDescription className="line-clamp-3">{program.description}</CardDescription>
												</CardHeader>
												<CardContent className="space-y-4 pt-0">
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
															{employmentRate}% employment
														</Badge>
													</div>
													<div className="flex items-center justify-between border-t pt-2">
														<div className="flex items-center gap-1 text-muted-foreground">
															<CurrencyCircleDollarIcon className="size-5" />
															<span className="font-medium">
																{program.salaryRange.min.toLocaleString()} - {program.salaryRange.max.toLocaleString()}{" "}
																{program.salaryRange.currency}
															</span>
														</div>
														<Button size="sm" variant="ghost" className="gap-1 text-primary">
															<Trans>Discover</Trans>
															<ArrowRightIcon className="size-4" />
														</Button>
													</div>
												</CardContent>
											</Card>
										</Link>
									</motion.div>
								);
							})}
						</AnimatePresence>
					</div>
				</TabsContent>
			</Tabs>
		</TabsContent>
	);
}

// ─── Learning Paths Tab ──────────────────────────────────────────────────────

interface LearningPathsTabProps {
	learningPaths:
		| Array<{
				id: string;
				title: string;
				description: string;
				category: string;
				stepsCount: number;
				estimatedDuration: string;
				steps: Array<{ order: number; title: string; description: string }>;
		  }>
		| undefined;
	pathProgress: Record<string, number>;
}

export function LearningPathsTab({ learningPaths, pathProgress }: LearningPathsTabProps) {
	return (
		<TabsContent value="learning-paths" className="space-y-8">
			<div>
				<h2 className="font-bold text-2xl">
					<Trans>Structured Learning Paths</Trans>
				</h2>
				<p className="text-muted-foreground">
					<Trans>Follow these step-by-step paths to maximize your chances of success in your job search.</Trans>
				</p>
			</div>

			<div className="grid gap-8">
				{learningPaths?.map((path, pathIndex) => {
					const CategoryIcon = categoryIcons[path.category as keyof typeof categoryIcons];
					const progress = pathProgress[path.id] ?? 0;
					const completedSteps = Math.floor((progress / 100) * path.stepsCount);

					return (
						<motion.div
							key={path.id}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: pathIndex * 0.1 }}
						>
							<Card className="overflow-hidden">
								<CardHeader className="border-b bg-gradient-to-r from-muted/50 to-transparent">
									<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
										<div className="flex items-center gap-4">
											<div
												className={cn(
													"flex size-14 items-center justify-center rounded-2xl",
													categoryColors[path.category as keyof typeof categoryColors],
												)}
											>
												<CategoryIcon className="size-7" weight="duotone" />
											</div>
											<div>
												<CardTitle className="text-xl">{path.title}</CardTitle>
												<CardDescription>{path.description}</CardDescription>
											</div>
										</div>
										<div className="flex items-center gap-4">
											<div className="text-right">
												<p className="font-medium text-primary">{path.estimatedDuration}</p>
												<p className="text-muted-foreground text-sm">
													{completedSteps}/{path.stepsCount} <Trans>steps</Trans>
												</p>
											</div>
											<div className="flex flex-col items-center">
												<div className="relative size-16">
													<svg className="size-16 -rotate-90 transform">
														<circle
															cx="32"
															cy="32"
															r="28"
															stroke="currentColor"
															strokeWidth="4"
															fill="none"
															className="text-muted"
														/>
														<circle
															cx="32"
															cy="32"
															r="28"
															stroke="currentColor"
															strokeWidth="4"
															fill="none"
															className="text-primary"
															strokeDasharray={175}
															strokeDashoffset={175 - (175 * progress) / 100}
															strokeLinecap="round"
														/>
													</svg>
													<span className="absolute inset-0 flex items-center justify-center font-bold text-sm">
														{progress}%
													</span>
												</div>
											</div>
										</div>
									</div>
								</CardHeader>
								<CardContent className="p-6">
									<div className="relative space-y-0">
										{path.steps.map((step, stepIndex) => {
											const isCompleted = stepIndex < completedSteps;
											const isCurrent = stepIndex === completedSteps;

											return (
												<div key={step.order} className="relative flex gap-4 pb-8 last:pb-0">
													{/* Vertical line */}
													{stepIndex < path.steps.length - 1 && (
														<div
															className={cn(
																"absolute top-10 left-4 h-full w-0.5 -translate-x-1/2",
																isCompleted ? "bg-primary" : "bg-border",
															)}
														/>
													)}

													{/* Step indicator */}
													<div
														className={cn(
															"relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all",
															isCompleted && "border-primary bg-primary text-primary-foreground",
															isCurrent && "border-primary bg-primary/10 text-primary ring-4 ring-primary/20",
															!isCompleted && !isCurrent && "border-border bg-background text-muted-foreground",
														)}
													>
														{isCompleted ? <CheckCircleIcon className="size-5" weight="fill" /> : step.order}
													</div>

													{/* Step content */}
													<div className="flex-1">
														<div className="flex items-center gap-2">
															<h4 className={cn("font-medium", isCurrent && "text-primary")}>{step.title}</h4>
															{isCompleted && (
																<Badge
																	variant="outline"
																	className="border-green-500 bg-green-50 text-green-700 text-xs dark:bg-green-900/20"
																>
																	<CheckCircleIcon className="mr-1 size-3" weight="fill" />
																	<Trans>Completed</Trans>
																</Badge>
															)}
															{isCurrent && (
																<Badge variant="outline" className="border-primary bg-primary/10 text-primary text-xs">
																	<Trans>In progress</Trans>
																</Badge>
															)}
														</div>
														<p className="mt-1 text-muted-foreground text-sm">{step.description}</p>
														{isCurrent && (
															<Button size="sm" className="mt-3 gap-2">
																<RocketLaunchIcon className="size-4" />
																<Trans>Continue this step</Trans>
															</Button>
														)}
													</div>
												</div>
											);
										})}
									</div>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</TabsContent>
	);
}

// ─── Resources Library Tab ───────────────────────────────────────────────────

interface ResourcesLibraryTabProps {
	filteredResources: Array<{
		id: string;
		title: string;
		description: string;
		type: string;
		category: string;
		tags: string[];
		duration?: string;
	}>;
	searchQuery: string;
	setSearchQuery: Dispatch<SetStateAction<string>>;
	resourceTypeFilter: string;
	setResourceTypeFilter: Dispatch<SetStateAction<string>>;
	resourceCategoryFilter: string;
	setResourceCategoryFilter: Dispatch<SetStateAction<string>>;
}

export function ResourcesLibraryTab({
	filteredResources,
	searchQuery,
	setSearchQuery,
	resourceTypeFilter,
	setResourceTypeFilter,
	resourceCategoryFilter,
	setResourceCategoryFilter,
}: ResourcesLibraryTabProps) {
	return (
		<TabsContent value="resources" className="space-y-8">
			<div>
				<h2 className="font-bold text-2xl">
					<Trans>Resource Library</Trans>
				</h2>
				<p className="text-muted-foreground">
					<Trans>All tools and documents for your professional preparation</Trans>
				</p>
			</div>

			{/* Filters */}
			<div className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 md:flex-row md:items-center">
				<div className="flex items-center gap-2">
					<FunnelIcon className="size-5 text-muted-foreground" />
					<span className="font-medium text-sm">
						<Trans>Filter:</Trans>
					</span>
				</div>

				<div className="flex flex-1 flex-col gap-4 md:flex-row">
					{/* Type filter */}
					<Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
						<SelectTrigger className="w-full md:w-48">
							<SelectValue placeholder={t`Resource type`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>All types</Trans>
							</SelectItem>
							<SelectItem value="guide">
								<div className="flex items-center gap-2">
									<BookOpenIcon className="size-4" />
									<Trans>Guides</Trans>
								</div>
							</SelectItem>
							<SelectItem value="video">
								<div className="flex items-center gap-2">
									<VideoIcon className="size-4" />
									<Trans>Videos</Trans>
								</div>
							</SelectItem>
							<SelectItem value="template">
								<div className="flex items-center gap-2">
									<FileTextIcon className="size-4" />
									<Trans>Templates</Trans>
								</div>
							</SelectItem>
							<SelectItem value="article">
								<div className="flex items-center gap-2">
									<ArticleIcon className="size-4" />
									<Trans>Articles</Trans>
								</div>
							</SelectItem>
						</SelectContent>
					</Select>

					{/* Category filter */}
					<Select value={resourceCategoryFilter} onValueChange={setResourceCategoryFilter}>
						<SelectTrigger className="w-full md:w-48">
							<SelectValue placeholder={t`Category`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>All categories</Trans>
							</SelectItem>
							<SelectItem value="healthcare">
								<div className="flex items-center gap-2">
									<FirstAidKitIcon className="size-4" />
									<Trans>Health</Trans>
								</div>
							</SelectItem>
							<SelectItem value="industrial">
								<div className="flex items-center gap-2">
									<GearIcon className="size-4" />
									<Trans>Industrial</Trans>
								</div>
							</SelectItem>
							<SelectItem value="hse">
								<div className="flex items-center gap-2">
									<HardHatIcon className="size-4" />
									<Trans>HSE</Trans>
								</div>
							</SelectItem>
							<SelectItem value="general">
								<div className="flex items-center gap-2">
									<BookOpenIcon className="size-4" />
									<Trans>General</Trans>
								</div>
							</SelectItem>
							<SelectItem value="career">
								<div className="flex items-center gap-2">
									<BriefcaseIcon className="size-4" />
									<Trans>Career</Trans>
								</div>
							</SelectItem>
						</SelectContent>
					</Select>

					{/* Search */}
					<div className="relative flex-1">
						<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={t`Search for a resource...`}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>

				{/* Clear filters */}
				{(resourceTypeFilter !== "all" || resourceCategoryFilter !== "all" || searchQuery) && (
					<Button
						variant="ghost"
						size="sm"
						className="gap-1"
						onClick={() => {
							setResourceTypeFilter("all");
							setResourceCategoryFilter("all");
							setSearchQuery("");
						}}
					>
						<XIcon className="size-4" />
						<Trans>Clear</Trans>
					</Button>
				)}
			</div>

			{/* Results count */}
			<p className="text-muted-foreground text-sm">
				{filteredResources.length} <Trans>resources found</Trans>
			</p>

			{/* Resources Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<AnimatePresence mode="popLayout">
					{filteredResources.map((resource, index) => {
						const TypeIcon = typeIcons[resource.type as keyof typeof typeIcons];

						return (
							<motion.div
								key={resource.id}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ delay: index * 0.02 }}
								layout
							>
								<Card className="group h-full transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
									{resource.type === "video" && (
										<div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-red-100 to-red-50 dark:from-red-950/30 dark:to-red-900/10">
											<PlayCircleIcon
												className="size-16 text-red-500 transition-transform group-hover:scale-110"
												weight="fill"
											/>
											{resource.duration && (
												<Badge className="absolute right-2 bottom-2 bg-black/70">{resource.duration}</Badge>
											)}
										</div>
									)}
									<CardHeader className={resource.type === "video" ? "pb-2" : ""}>
										{resource.type !== "video" && (
											<div className="mb-3 flex items-center gap-3">
												<div
													className={cn(
														"flex size-10 items-center justify-center rounded-lg",
														resource.type === "guide" &&
															"bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
														resource.type === "template" &&
															"bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
														resource.type === "article" &&
															"bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
													)}
												>
													<TypeIcon className="size-5" weight="duotone" />
												</div>
												<Badge variant="outline">{typeLabels[resource.type as keyof typeof typeLabels]}</Badge>
											</div>
										)}
										<CardTitle className="line-clamp-2 text-lg transition-colors group-hover:text-primary">
											{resource.title}
										</CardTitle>
										<CardDescription className="line-clamp-2">{resource.description}</CardDescription>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="flex items-center justify-between">
											<Badge className={categoryColors[resource.category as keyof typeof categoryColors]}>
												{categoryLabels[resource.category as keyof typeof categoryLabels]}
											</Badge>
											{resource.type === "template" && (
												<Button size="sm" variant="outline" className="gap-1">
													<DownloadIcon className="size-4" />
													<Trans>Download</Trans>
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>

			{filteredResources.length === 0 && (
				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col items-center justify-center py-16 text-center"
				>
					<MagnifyingGlassIcon className="mb-4 size-12 text-muted-foreground/50" weight="duotone" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>No results found</Trans>
					</h3>
					<p className="mb-6 max-w-sm text-muted-foreground text-sm">
						<Trans>Try adjusting your filters or browse all available programs and resources.</Trans>
					</p>
					<Button
						variant="outline"
						onClick={() => {
							setResourceTypeFilter("all");
							setResourceCategoryFilter("all");
							setSearchQuery("");
						}}
					>
						<XIcon className="mr-2 size-4" />
						<Trans>Clear filters</Trans>
					</Button>
				</motion.div>
			)}
		</TabsContent>
	);
}

// ─── Success Stories Tab ─────────────────────────────────────────────────────

interface SuccessStoriesTabProps {
	successStories:
		| Array<{
				id: string;
				title: string;
				description: string;
				category: string;
				author?: string | null | undefined;
				tags: string[];
		  }>
		| undefined;
}

export function SuccessStoriesTab({ successStories }: SuccessStoriesTabProps) {
	return (
		<TabsContent value="success-stories" className="space-y-8">
			<div>
				<h2 className="font-bold text-2xl">
					<Trans>Success Stories from Former Students</Trans>
				</h2>
				<p className="text-muted-foreground">
					<Trans>Get inspired by the journeys of former IMTA students who successfully entered the workforce.</Trans>
				</p>
			</div>

			<div className="grid gap-6">
				{successStories?.map((story, index) => {
					const CategoryIcon = categoryIcons[story.category as keyof typeof categoryIcons];

					return (
						<motion.div
							key={story.id}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
								<CardContent className="p-0">
									<div className="flex flex-col gap-6 p-8 md:flex-row">
										<div className="flex size-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.65_0.15_195)] to-primary shadow-lg">
											<UsersIcon className="size-14 text-white" weight="duotone" />
										</div>
										<div className="flex-1">
											<div className="mb-3 flex flex-wrap items-center gap-2">
												<Badge className={categoryColors[story.category as keyof typeof categoryColors]}>
													<CategoryIcon className="mr-1 size-3" />
													{categoryLabels[story.category as keyof typeof categoryLabels]}
												</Badge>
												{story.tags.slice(0, 3).map((tag) => (
													<Badge key={tag} variant="outline" className="text-xs">
														{tag}
													</Badge>
												))}
											</div>
											<h4 className="mb-3 font-bold text-2xl">{story.title}</h4>
											{story.author && (
												<p className="mb-4 flex items-center gap-2 font-medium text-primary">
													<QuotesIcon className="size-5" weight="fill" />
													{story.author}
												</p>
											)}
											<p className="text-lg text-muted-foreground leading-relaxed">{story.description}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</TabsContent>
	);
}

// ─── My Trainings Tab ────────────────────────────────────────────────────────

interface MyTrainingsTabProps {
	myTrainings: TrainingInterest[];
	programs: Array<{ id: string; name: string; category: string }> | undefined;
	isAddTrainingDialogOpen: boolean;
	setIsAddTrainingDialogOpen: Dispatch<SetStateAction<boolean>>;
	selectedProgramForTracking: string;
	setSelectedProgramForTracking: Dispatch<SetStateAction<string>>;
	trainingNotes: string;
	setTrainingNotes: Dispatch<SetStateAction<string>>;
	handleAddTraining: () => void;
	handleRemoveTraining: (id: string) => void;
}

export function MyTrainingsTab({
	myTrainings,
	programs,
	isAddTrainingDialogOpen,
	setIsAddTrainingDialogOpen,
	selectedProgramForTracking,
	setSelectedProgramForTracking,
	trainingNotes,
	setTrainingNotes,
	handleAddTraining,
	handleRemoveTraining,
}: MyTrainingsTabProps) {
	return (
		<TabsContent value="my-trainings" className="space-y-8">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="font-bold text-2xl">
						<Trans>My Programs</Trans>
					</h2>
					<p className="text-muted-foreground">
						<Trans>Track and manage your training interests</Trans>
					</p>
				</div>

				{/* Add Training Dialog */}
				<Dialog open={isAddTrainingDialogOpen} onOpenChange={setIsAddTrainingDialogOpen}>
					<DialogTrigger asChild>
						<Button className="gap-2">
							<PlusCircleIcon className="size-5" />
							<Trans>Add a program</Trans>
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>
								<Trans>Add a training interest</Trans>
							</DialogTitle>
							<DialogDescription>
								<Trans>Select a program you want to follow and add personal notes.</Trans>
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label>
									<Trans>Program</Trans>
								</Label>
								<Select value={selectedProgramForTracking} onValueChange={setSelectedProgramForTracking}>
									<SelectTrigger>
										<SelectValue placeholder={t`Select a program...`} />
									</SelectTrigger>
									<SelectContent>
										{programs?.map((program) => (
											<SelectItem key={program.id} value={program.id}>
												<div className="flex items-center gap-2">
													<Badge
														className={cn("text-xs", categoryColors[program.category as keyof typeof categoryColors])}
													>
														{categoryLabels[program.category as keyof typeof categoryLabels]}
													</Badge>
													{program.name}
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>
									<Trans>Personal notes (optional)</Trans>
								</Label>
								<Textarea
									placeholder={t`Add notes about your goals, progress...`}
									value={trainingNotes}
									onChange={(e) => setTrainingNotes(e.target.value)}
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
							<Button onClick={handleAddTraining} disabled={!selectedProgramForTracking}>
								<PlusCircleIcon className="mr-2 size-4" />
								<Trans>Add</Trans>
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{myTrainings.length > 0 ? (
				<div className="grid gap-6 md:grid-cols-2">
					{myTrainings.map((training, index) => {
						const CategoryIcon = categoryIcons[training.category as keyof typeof categoryIcons];

						return (
							<motion.div
								key={training.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card className="h-full transition-all duration-300 hover:shadow-lg">
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-center gap-3">
												<div
													className={cn(
														"flex size-12 items-center justify-center rounded-xl",
														categoryColors[training.category as keyof typeof categoryColors],
													)}
												>
													<CategoryIcon className="size-6" weight="duotone" />
												</div>
												<div>
													<CardTitle className="text-lg">{training.programName}</CardTitle>
													<CardDescription>
														<Trans>Added on</Trans> {new Date(training.addedAt).toLocaleDateString()}
													</CardDescription>
												</div>
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="text-muted-foreground hover:text-destructive"
												onClick={() => handleRemoveTraining(training.id)}
											>
												<XIcon className="size-4" />
											</Button>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										{training.notes && (
											<div className="rounded-lg bg-muted/50 p-3">
												<p className="text-muted-foreground text-sm">{training.notes}</p>
											</div>
										)}
										<div className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground">
													<Trans>Progress</Trans>
												</span>
												<span className="font-medium">{training.progress}%</span>
											</div>
											<Progress value={training.progress} className="h-2" />
										</div>
									</CardContent>
									<CardFooter className="gap-2 pt-0">
										<Link to="/dashboard/resources/programs/$programId" params={{ programId: training.programId }}>
											<Button variant="outline" size="sm" className="gap-1">
												<ArrowRightIcon className="size-4" />
												<Trans>View program</Trans>
											</Button>
										</Link>
									</CardFooter>
								</Card>
							</motion.div>
						);
					})}
				</div>
			) : (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<BookmarkSimpleIcon className="mb-4 size-16 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-xl">
							<Trans>No programs followed</Trans>
						</h3>
						<p className="mb-6 max-w-md text-center text-muted-foreground">
							<Trans>
								Start following programs of interest to track your progress and receive personalized recommendations.
							</Trans>
						</p>
						<Button className="gap-2" onClick={() => setIsAddTrainingDialogOpen(true)}>
							<PlusCircleIcon className="size-5" />
							<Trans>Add my first program</Trans>
						</Button>
					</CardContent>
				</Card>
			)}
		</TabsContent>
	);
}
