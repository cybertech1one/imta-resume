import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BriefcaseIcon,
	BuildingsIcon,
	CalendarIcon,
	CaretLeftIcon,
	CaretRightIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClockIcon,
	FirstAidKitIcon,
	FunnelIcon,
	GearIcon,
	GraduationCapIcon,
	HardHatIcon,
	HeartIcon,
	LightbulbIcon,
	MapPinIcon,
	PaperPlaneTiltIcon,
	PlusCircleIcon,
	QuotesIcon,
	SparkleIcon,
	StarIcon,
	TrendUpIcon,
	TrophyIcon,
	UserCircleIcon,
	UsersIcon,
	XIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";

import {
	alumniStats,
	categoryColors,
	categoryGradients,
	categoryIcons,
	categoryLabels,
	programs,
} from "./success-stories-config";
import type { CareerEvent, SuccessStory } from "./success-stories-types";

// Get timeline icon helper
const getTimelineIcon = (type: CareerEvent["type"]) => {
	switch (type) {
		case "education":
			return GraduationCapIcon;
		case "job":
			return BriefcaseIcon;
		case "promotion":
			return TrendUpIcon;
		case "achievement":
			return TrophyIcon;
		default:
			return StarIcon;
	}
};

// ─── Hero Section ───────────────────────────────────────────────────────────

export function HeroSection() {
	return (
		<motion.div
			className="relative mb-10 overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/15 p-8 md:p-12"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
		>
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-amber-500/15 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.4, 0.2, 0.4],
					}}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-rose-500/15 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.2, 0.4, 0.2],
					}}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute top-1/3 left-1/4 size-32 rounded-full bg-orange-500/10 blur-2xl"
					animate={{
						y: [0, 20, 0],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			{/* Floating stars decoration */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				{[...Array(6)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute"
						style={{
							top: `${20 + i * 15}%`,
							left: `${10 + i * 15}%`,
						}}
						animate={{
							y: [0, -10, 0],
							rotate: [0, 180, 360],
							opacity: [0.3, 0.6, 0.3],
						}}
						transition={{
							duration: 3 + i,
							repeat: Infinity,
							delay: i * 0.5,
						}}
					>
						<StarIcon className="size-4 text-amber-500/40" weight="fill" />
					</motion.div>
				))}
			</div>

			<div className="relative z-10">
				{/* Back navigation */}
				<div className="mb-6">
					<Link to="/dashboard/resources">
						<Button
							variant="ghost"
							size="sm"
							className="gap-2 text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
						>
							<ArrowLeftIcon className="size-4" />
							<Trans>Back to Training Center</Trans>
						</Button>
					</Link>
				</div>

				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<StarIcon className="size-5 text-amber-500" weight="fill" />
					<span className="font-semibold text-amber-600 text-sm uppercase tracking-wider dark:text-amber-400">
						<Trans>Alumni IMTA</Trans>
					</span>
				</motion.div>

				<motion.h1
					className="mb-4 bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text font-bold text-4xl text-transparent tracking-tight md:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Success Stories</Trans>
				</motion.h1>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Discover the inspiring journeys of our former students who turned their training into successful careers.
						Their stories prove that success is within everyone's reach.
					</Trans>
				</motion.p>

				{/* Quick Stats */}
				<motion.div
					className="flex flex-wrap gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-3 rounded-2xl bg-background/60 px-4 py-3 backdrop-blur-sm">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
							<UsersIcon className="size-5 text-amber-600 dark:text-amber-400" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{alumniStats.totalEmployed.toLocaleString("fr-FR")}+</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Employed graduates</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3 rounded-2xl bg-background/60 px-4 py-3 backdrop-blur-sm">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
							<TrendUpIcon className="size-5 text-green-600 dark:text-green-400" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{alumniStats.employmentRate}%</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Employment rate</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3 rounded-2xl bg-background/60 px-4 py-3 backdrop-blur-sm">
						<div className="flex size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
							<ClockIcon className="size-5 text-blue-600 dark:text-blue-400" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{alumniStats.averageTimeToJob} months</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Average time to employment</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ─── Featured Story Spotlight ───────────────────────────────────────────────

interface FeaturedStorySpotlightProps {
	featuredStories: SuccessStory[];
	featuredIndex: number;
	setFeaturedIndex: (index: number) => void;
	prevFeatured: () => void;
	nextFeatured: () => void;
	openStoryDetail: (story: SuccessStory) => void;
}

export function FeaturedStorySpotlight({
	featuredStories,
	featuredIndex,
	setFeaturedIndex,
	prevFeatured,
	nextFeatured,
	openStoryDetail,
}: FeaturedStorySpotlightProps) {
	if (featuredStories.length === 0) return null;

	return (
		<motion.section className="mb-10" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h2 className="flex items-center gap-2 font-semibold text-2xl">
						<SparkleIcon className="size-6 text-amber-500" weight="fill" />
						<Trans>Featured Story</Trans>
					</h2>
					<p className="text-muted-foreground">
						<Trans>Outstanding journey of one of our graduates</Trans>
					</p>
				</div>
				{featuredStories.length > 1 && (
					<div className="flex items-center gap-2">
						<Button variant="outline" size="icon" className="size-8 rounded-full" onClick={prevFeatured}>
							<CaretLeftIcon className="size-4" />
						</Button>
						<Button variant="outline" size="icon" className="size-8 rounded-full" onClick={nextFeatured}>
							<CaretRightIcon className="size-4" />
						</Button>
					</div>
				)}
			</div>

			<AnimatePresence mode="wait">
				{featuredStories[featuredIndex] && (
					<motion.div
						key={featuredStories[featuredIndex].id}
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -50 }}
						transition={{ duration: 0.4 }}
					>
						<Card className="overflow-hidden border-amber-200/50 bg-gradient-to-br from-amber-50/50 via-background to-orange-50/30 dark:border-amber-800/30 dark:from-amber-950/20 dark:to-orange-950/10">
							<CardContent className="p-0">
								<div className="grid gap-0 lg:grid-cols-5">
									{/* Photo and Quote Section */}
									<div className="relative flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 p-8 lg:col-span-2 dark:from-amber-900/30 dark:to-orange-900/30">
										{/* Avatar Placeholder */}
										<motion.div
											className={cn(
												"mb-6 flex size-32 items-center justify-center rounded-full bg-gradient-to-br shadow-xl",
												categoryGradients[featuredStories[featuredIndex].category],
											)}
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{ delay: 0.2, type: "spring" }}
										>
											<span className="font-bold text-4xl text-white">
												{featuredStories[featuredIndex].avatarInitials}
											</span>
										</motion.div>

										{/* Name and Position */}
										<h3 className="mb-1 text-center font-bold text-xl">{featuredStories[featuredIndex].name}</h3>
										<p className="mb-2 text-center text-muted-foreground">
											{featuredStories[featuredIndex].currentPosition}
										</p>
										<div className="mb-4 flex items-center gap-2 text-sm">
											<BuildingsIcon className="size-4" />
											<span>{featuredStories[featuredIndex].company}</span>
										</div>

										{/* Quote */}
										<div className="relative max-w-sm">
											<QuotesIcon className="absolute -top-2 -left-2 size-8 text-amber-500/30" weight="fill" />
											<p className="text-center text-muted-foreground italic">
												"{featuredStories[featuredIndex].shortQuote}"
											</p>
										</div>

										<div className="mt-4 flex flex-wrap justify-center gap-2">
											<Badge className={categoryColors[featuredStories[featuredIndex].category]}>
												{categoryLabels[featuredStories[featuredIndex].category]}
											</Badge>
											<Badge variant="outline">
												<CalendarIcon className="mr-1 size-3" />
												Class of {featuredStories[featuredIndex].graduationYear}
											</Badge>
											<Badge variant="outline">
												<MapPinIcon className="mr-1 size-3" />
												{featuredStories[featuredIndex].location}
											</Badge>
										</div>
									</div>

									{/* Career Journey Timeline */}
									<div className="p-8 lg:col-span-3">
										<h4 className="mb-6 flex items-center gap-2 font-semibold text-lg">
											<ChartLineUpIcon className="size-5 text-primary" />
											<Trans>Career Path</Trans>
										</h4>

										<div className="relative space-y-0">
											{featuredStories[featuredIndex].careerTimeline.map((event, index) => {
												const EventIcon = getTimelineIcon(event.type);
												const isLast = index === featuredStories[featuredIndex].careerTimeline.length - 1;

												return (
													<motion.div
														key={index}
														className="relative flex gap-4 pb-6 last:pb-0"
														initial={{ opacity: 0, x: -20 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{ delay: 0.3 + index * 0.1 }}
													>
														{/* Vertical line */}
														{!isLast && (
															<div className="absolute top-8 left-4 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary to-primary/20" />
														)}

														{/* Event icon */}
														<div
															className={cn(
																"relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
																event.type === "promotion"
																	? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
																	: event.type === "achievement"
																		? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
																		: event.type === "job"
																			? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
																			: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
															)}
														>
															<EventIcon className="size-4" weight="duotone" />
														</div>

														{/* Event content */}
														<div className="flex-1">
															<div className="flex items-center gap-2">
																<Badge variant="secondary" className="font-mono text-xs">
																	{event.year}
																</Badge>
																<span className="font-medium">{event.title}</span>
															</div>
															<p className="mt-1 text-muted-foreground text-sm">{event.description}</p>
														</div>
													</motion.div>
												);
											})}
										</div>

										{/* CTA Button */}
										<div className="mt-6 flex justify-end">
											<Button className="gap-2" onClick={() => openStoryDetail(featuredStories[featuredIndex])}>
												<Trans>Read full story</Trans>
												<ArrowRightIcon className="size-4" />
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Featured indicators */}
			{featuredStories.length > 1 && (
				<div className="mt-4 flex justify-center gap-2">
					{featuredStories.map((_, idx) => (
						<button
							type="button"
							key={idx}
							className={cn(
								"size-2 rounded-full transition-all",
								idx === featuredIndex ? "w-6 bg-amber-500" : "bg-amber-500/30",
							)}
							onClick={() => setFeaturedIndex(idx)}
						/>
					))}
				</div>
			)}
		</motion.section>
	);
}

// ─── Stories Grid with Filters ──────────────────────────────────────────────

interface StoriesGridProps {
	filteredStories: SuccessStory[];
	fieldFilter: string;
	setFieldFilter: (value: string) => void;
	programFilter: string;
	setProgramFilter: (value: string) => void;
	openStoryDetail: (story: SuccessStory) => void;
}

export function StoriesGrid({
	filteredStories,
	fieldFilter,
	setFieldFilter,
	programFilter,
	setProgramFilter,
	openStoryDetail,
}: StoriesGridProps) {
	return (
		<motion.section className="mb-10" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
			<div className="mb-6">
				<h2 className="mb-2 flex items-center gap-2 font-semibold text-2xl">
					<UsersIcon className="size-6 text-primary" weight="duotone" />
					<Trans>All Stories</Trans>
				</h2>
				<p className="text-muted-foreground">
					<Trans>Browse testimonials from our former students</Trans>
				</p>
			</div>

			{/* Filters */}
			<div className="mb-6 flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 md:flex-row md:items-center">
				<div className="flex items-center gap-2">
					<FunnelIcon className="size-5 text-muted-foreground" />
					<span className="font-medium text-sm">
						<Trans>Filter by:</Trans>
					</span>
				</div>

				<div className="flex flex-1 flex-wrap gap-4">
					{/* Field filter */}
					<Select value={fieldFilter} onValueChange={setFieldFilter}>
						<SelectTrigger className="w-full md:w-48">
							<SelectValue placeholder={t`Field`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>All domains</Trans>
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
									<Trans>Industry</Trans>
								</div>
							</SelectItem>
							<SelectItem value="hse">
								<div className="flex items-center gap-2">
									<HardHatIcon className="size-4" />
									<Trans>HSE</Trans>
								</div>
							</SelectItem>
						</SelectContent>
					</Select>

					{/* Program filter */}
					<Select value={programFilter} onValueChange={setProgramFilter}>
						<SelectTrigger className="w-full md:w-56">
							<SelectValue placeholder={t`Program`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>All programs</Trans>
							</SelectItem>
							{programs.map((program) => (
								<SelectItem key={program.id} value={program.id}>
									{program.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Clear filters */}
				{(fieldFilter !== "all" || programFilter !== "all") && (
					<Button
						variant="ghost"
						size="sm"
						className="gap-1"
						onClick={() => {
							setFieldFilter("all");
							setProgramFilter("all");
						}}
					>
						<XIcon className="size-4" />
						<Trans>Clear</Trans>
					</Button>
				)}
			</div>

			{/* Results count */}
			<p className="mb-4 text-muted-foreground text-sm">
				{filteredStories.length} <Trans>stories found</Trans>
			</p>

			{/* Stories Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<AnimatePresence mode="popLayout">
					{filteredStories.map((story, index) => {
						const CategoryIcon = categoryIcons[story.category] ?? GraduationCapIcon;

						return (
							<motion.div
								key={story.id}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ delay: index * 0.05 }}
								layout
							>
								<Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
									<CardHeader className="pb-3">
										<div className="mb-3 flex items-start gap-4">
											{/* Avatar placeholder */}
											<div
												className={cn(
													"flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-lg text-white transition-transform group-hover:scale-110",
													categoryGradients[story.category],
												)}
											>
												{story.avatarInitials}
											</div>
											<div className="min-w-0 flex-1">
												<CardTitle className="text-lg">{story.name}</CardTitle>
												<CardDescription className="line-clamp-1">{story.currentPosition}</CardDescription>
											</div>
										</div>

										<div className="flex items-center gap-2 text-muted-foreground text-sm">
											<BuildingsIcon className="size-4 shrink-0" />
											<span className="truncate">{story.company}</span>
										</div>
									</CardHeader>
									<CardContent className="space-y-4 pt-0">
										{/* Program and year badges */}
										<div className="flex flex-wrap gap-2">
											<Badge className={categoryColors[story.category]}>
												<CategoryIcon className="mr-1 size-3" />
												{story.programName}
											</Badge>
											<Badge variant="outline">
												<CalendarIcon className="mr-1 size-3" />
												{story.graduationYear}
											</Badge>
										</div>

										{/* Short quote */}
										<div className="relative">
											<QuotesIcon className="absolute -top-1 -left-1 size-5 text-primary/20" weight="fill" />
											<p className="line-clamp-3 pl-4 text-muted-foreground text-sm italic">"{story.shortQuote}"</p>
										</div>

										{/* Read more button */}
										<Button variant="outline" className="w-full gap-2" onClick={() => openStoryDetail(story)}>
											<Trans>Read story</Trans>
											<ArrowRightIcon className="size-4" />
										</Button>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>

			{filteredStories.length === 0 && (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<UsersIcon className="mb-4 size-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">
							<Trans>No stories found</Trans>
						</h3>
						<p className="text-muted-foreground">
							<Trans>Try changing your filters</Trans>
						</p>
					</CardContent>
				</Card>
			)}
		</motion.section>
	);
}

// ─── Statistics Section ─────────────────────────────────────────────────────

export function StatisticsSection() {
	return (
		<motion.section className="mb-10" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
			<Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-blue-500/5">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ChartLineUpIcon className="size-6 text-primary" weight="duotone" />
						<Trans>Alumni Statistics</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Key figures on our graduates' success</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{/* Total employed */}
						<motion.div
							className="rounded-xl border bg-card p-6 text-center"
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
						>
							<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
								<UsersIcon className="size-6 text-green-600 dark:text-green-400" weight="duotone" />
							</div>
							<p className="font-bold text-3xl text-green-600">{alumniStats.totalEmployed.toLocaleString("fr-FR")}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Employed alumni</Trans>
							</p>
						</motion.div>

						{/* Average time to job */}
						<motion.div
							className="rounded-xl border bg-card p-6 text-center"
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6 }}
						>
							<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
								<ClockIcon className="size-6 text-blue-600 dark:text-blue-400" weight="duotone" />
							</div>
							<p className="font-bold text-3xl text-blue-600">{alumniStats.averageTimeToJob}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Months on average to first job</Trans>
							</p>
						</motion.div>

						{/* Salary growth */}
						<motion.div
							className="rounded-xl border bg-card p-6 text-center"
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.7 }}
						>
							<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
								<TrendUpIcon className="size-6 text-amber-600 dark:text-amber-400" weight="duotone" />
							</div>
							<p className="font-bold text-3xl text-amber-600">+{alumniStats.salaryGrowth5Years}%</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Salary growth after 5 years</Trans>
							</p>
						</motion.div>

						{/* Employment rate */}
						<motion.div
							className="rounded-xl border bg-card p-6 text-center"
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.8 }}
						>
							<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
								<TrophyIcon className="size-6 text-purple-600 dark:text-purple-400" weight="duotone" />
							</div>
							<p className="font-bold text-3xl text-purple-600">{alumniStats.employmentRate}%</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Professional integration rate</Trans>
							</p>
						</motion.div>
					</div>

					{/* Top Employers */}
					<Separator className="my-6" />

					<div>
						<h4 className="mb-4 flex items-center gap-2 font-semibold">
							<BuildingsIcon className="size-5 text-primary" />
							<Trans>Top Employers</Trans>
						</h4>
						<div className="space-y-3">
							{alumniStats.topEmployers.map((employer, index) => (
								<motion.div
									key={employer.name}
									className="flex items-center gap-3"
									initial={false}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.9 + index * 0.1 }}
								>
									<span className="w-36 truncate font-medium">{employer.name}</span>
									<div className="flex-1">
										<Progress value={(employer.count / alumniStats.topEmployers[0].count) * 100} className="h-2" />
									</div>
									<span className="w-16 text-right text-muted-foreground text-sm">
										{employer.count.toLocaleString("fr-FR")}
									</span>
								</motion.div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.section>
	);
}

// ─── Submit Story CTA Section ───────────────────────────────────────────────

interface SubmitStorySectionProps {
	isSubmitDialogOpen: boolean;
	setIsSubmitDialogOpen: (open: boolean) => void;
}

export function SubmitStorySection({ isSubmitDialogOpen, setIsSubmitDialogOpen }: SubmitStorySectionProps) {
	return (
		<motion.section initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
			<Card className="overflow-hidden border-rose-200/50 bg-gradient-to-br from-rose-50/50 via-background to-pink-50/50 dark:border-rose-800/30 dark:from-rose-950/20 dark:to-pink-950/20">
				<CardContent className="p-8 text-center md:p-12">
					<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring" }}>
						<div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
							<HeartIcon className="size-10 text-white" weight="fill" />
						</div>
					</motion.div>

					<h2 className="mb-4 font-bold text-3xl">
						<Trans>Your Story</Trans>
					</h2>
					<p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
						<Trans>
							Are you an IMTA alumnus? Share your journey and inspire the next generation of professionals. Your story
							could change someone's life.
						</Trans>
					</p>

					<Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
						<DialogTrigger asChild>
							<Button
								size="lg"
								className="gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
							>
								<PlusCircleIcon className="size-5" />
								<Trans>Share My Story</Trans>
							</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
							<DialogHeader>
								<DialogTitle className="flex items-center gap-2">
									<HeartIcon className="size-5 text-rose-500" weight="fill" />
									<Trans>Share Your Story</Trans>
								</DialogTitle>
								<DialogDescription>
									<Trans>Tell us about your journey from your IMTA training to today.</Trans>
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4 py-4">
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label>
											<Trans>Full name</Trans>
										</Label>
										<Input placeholder={t`Your name`} />
									</div>
									<div className="space-y-2">
										<Label>
											<Trans>Email</Trans>
										</Label>
										<Input type="email" placeholder="your@email.com" />
									</div>
								</div>

								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label>
											<Trans>Program completed</Trans>
										</Label>
										<Select>
											<SelectTrigger>
												<SelectValue placeholder={t`Select...`} />
											</SelectTrigger>
											<SelectContent>
												{programs.map((program) => (
													<SelectItem key={program.id} value={program.id}>
														{program.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label>
											<Trans>Graduation year</Trans>
										</Label>
										<Input type="number" placeholder="2023" />
									</div>
								</div>

								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label>
											<Trans>Current position</Trans>
										</Label>
										<Input placeholder={t`Your position`} />
									</div>
									<div className="space-y-2">
										<Label>
											<Trans>Company</Trans>
										</Label>
										<Input placeholder={t`Company name`} />
									</div>
								</div>

								<div className="space-y-2">
									<Label>
										<Trans>Your story</Trans>
									</Label>
									<Textarea placeholder={t`Tell your story, the challenges faced, your achievements...`} rows={6} />
								</div>

								<div className="space-y-2">
									<Label>
										<Trans>Advice for current students</Trans>
									</Label>
									<Textarea placeholder={t`What advice would you give to students following your program?`} rows={3} />
								</div>
							</div>

							<DialogFooter>
								<DialogClose asChild>
									<Button variant="outline">
										<Trans>Cancel</Trans>
									</Button>
								</DialogClose>
								<Button className="gap-2 bg-gradient-to-r from-rose-500 to-pink-600">
									<PaperPlaneTiltIcon className="size-4" />
									<Trans>Submit my story</Trans>
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<div className="mt-8 flex flex-wrap justify-center gap-4">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<CheckCircleIcon className="size-4 text-green-500" />
							<Trans>Published after review</Trans>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<CheckCircleIcon className="size-4 text-green-500" />
							<Trans>Option for anonymity</Trans>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<CheckCircleIcon className="size-4 text-green-500" />
							<Trans>Featured on our networks</Trans>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.section>
	);
}

// ─── Story Detail Dialog ────────────────────────────────────────────────────

interface StoryDetailDialogProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	selectedStory: SuccessStory | null;
}

export function StoryDetailDialog({ isOpen, setIsOpen, selectedStory }: StoryDetailDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
				{selectedStory && (
					<>
						<DialogHeader>
							<div className="flex items-start gap-4">
								{/* Avatar */}
								<div
									className={cn(
										"flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white text-xl",
										categoryGradients[selectedStory.category],
									)}
								>
									{selectedStory.avatarInitials}
								</div>
								<div>
									<DialogTitle className="text-2xl">{selectedStory.name}</DialogTitle>
									<DialogDescription className="text-base">
										{selectedStory.currentPosition} at {selectedStory.company}
									</DialogDescription>
									<div className="mt-2 flex flex-wrap gap-2">
										<Badge className={categoryColors[selectedStory.category]}>{selectedStory.programName}</Badge>
										<Badge variant="outline">
											<CalendarIcon className="mr-1 size-3" />
											Class of {selectedStory.graduationYear}
										</Badge>
										<Badge variant="outline">
											<MapPinIcon className="mr-1 size-3" />
											{selectedStory.location}
										</Badge>
									</div>
								</div>
							</div>
						</DialogHeader>

						<div className="space-y-6 py-4">
							{/* Full Story */}
							<div>
								<h4 className="mb-3 flex items-center gap-2 font-semibold text-lg">
									<UserCircleIcon className="size-5 text-primary" />
									<Trans>My Story</Trans>
								</h4>
								<p className="text-muted-foreground leading-relaxed">{selectedStory.fullStory}</p>
							</div>

							<Separator />

							{/* Career Timeline */}
							<div>
								<h4 className="mb-4 flex items-center gap-2 font-semibold text-lg">
									<ChartLineUpIcon className="size-5 text-primary" />
									<Trans>Career Path</Trans>
								</h4>
								<div className="relative space-y-0">
									{selectedStory.careerTimeline.map((event, index) => {
										const EventIcon = getTimelineIcon(event.type);
										const isLast = index === selectedStory.careerTimeline.length - 1;

										return (
											<div key={index} className="relative flex gap-4 pb-6 last:pb-0">
												{!isLast && (
													<div className="absolute top-8 left-4 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary to-primary/20" />
												)}
												<div
													className={cn(
														"relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
														event.type === "promotion"
															? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
															: event.type === "achievement"
																? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
																: event.type === "job"
																	? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
																	: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
													)}
												>
													<EventIcon className="size-4" weight="duotone" />
												</div>
												<div className="flex-1">
													<div className="flex items-center gap-2">
														<Badge variant="secondary" className="font-mono text-xs">
															{event.year}
														</Badge>
														<span className="font-medium">{event.title}</span>
													</div>
													<p className="mt-1 text-muted-foreground text-sm">{event.description}</p>
												</div>
											</div>
										);
									})}
								</div>
							</div>

							<Separator />

							{/* Advice */}
							<div>
								<h4 className="mb-3 flex items-center gap-2 font-semibold text-lg">
									<LightbulbIcon className="size-5 text-amber-500" />
									<Trans>Advice for Students</Trans>
								</h4>
								<ul className="space-y-2">
									{selectedStory.advice.map((tip, index) => (
										<li key={index} className="flex items-start gap-2">
											<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
											<span className="text-muted-foreground">{tip}</span>
										</li>
									))}
								</ul>
							</div>

							<Separator />

							{/* Key Lessons */}
							<div>
								<h4 className="mb-3 flex items-center gap-2 font-semibold text-lg">
									<StarIcon className="size-5 text-primary" />
									<Trans>Lessons Learned</Trans>
								</h4>
								<ul className="space-y-2">
									{selectedStory.keyLessons.map((lesson, index) => (
										<li key={index} className="flex items-start gap-2">
											<StarIcon className="mt-0.5 size-4 shrink-0 text-amber-500" weight="fill" />
											<span className="text-muted-foreground">{lesson}</span>
										</li>
									))}
								</ul>
							</div>

							<Separator />

							{/* Skills */}
							<div>
								<h4 className="mb-3 flex items-center gap-2 font-semibold text-lg">
									<SparkleIcon className="size-5 text-purple-500" />
									<Trans>Key Skills</Trans>
								</h4>
								<div className="flex flex-wrap gap-2">
									{selectedStory.helpfulSkills.map((skill) => (
										<Badge key={skill} variant="secondary" className="text-sm">
											{skill}
										</Badge>
									))}
								</div>
							</div>
						</div>

						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">
									<Trans>Close</Trans>
								</Button>
							</DialogClose>
							<Link to="/dashboard/resources/programs/$programId" params={{ programId: selectedStory.programId }}>
								<Button className="gap-2">
									<Trans>View program</Trans>
									<ArrowRightIcon className="size-4" />
								</Button>
							</Link>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
