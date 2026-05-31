import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	CalendarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClipboardTextIcon,
	EyeIcon,
	HeartIcon,
	PaletteIcon,
	PlusIcon,
	ShareNetworkIcon,
	SparkleIcon,
	TagIcon,
	TrendUpIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";

import { PORTFOLIO_THEMES, SAMPLE_ANALYTICS, SKILL_CATEGORIES } from "./portfolio-config";
import type { CaseStudy, PortfolioTheme, Project } from "./portfolio-types";

// ─── Case Studies Tab Content ─────────────────────────────────────────────

export function CaseStudiesTabContent({
	caseStudies = [],
	onViewCaseStudy,
}: {
	caseStudies?: CaseStudy[];
	onViewCaseStudy: (caseStudy: CaseStudy) => void;
}) {
	return (
		<TabsContent value="case-studies" className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-2xl">
						<Trans>Case Studies</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>Deep-dive into your project stories and methodologies</Trans>
					</p>
				</div>
				<Button className="gap-2">
					<PlusIcon className="size-4" />
					<Trans>Create Case Study</Trans>
				</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{caseStudies.map((caseStudy, index) => (
					<motion.div
						key={caseStudy.id}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card className="h-full overflow-hidden transition-all hover:shadow-lg">
							<CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
								<div className="flex items-start justify-between">
									<div>
										<Badge variant="secondary" className="mb-2">
											{caseStudy.duration}
										</Badge>
										<CardTitle className="text-xl">{caseStudy.title}</CardTitle>
										<CardDescription className="mt-1">{caseStudy.role}</CardDescription>
									</div>
									<ClipboardTextIcon className="size-8 text-primary" weight="duotone" />
								</div>
							</CardHeader>
							<CardContent className="pt-4">
								<p className="mb-4 line-clamp-3 text-muted-foreground">{caseStudy.overview}</p>
								<div className="flex flex-wrap gap-2">
									{caseStudy.technologies.slice(0, 5).map((tech) => (
										<Badge key={tech} variant="outline">
											{tech}
										</Badge>
									))}
									{caseStudy.technologies.length > 5 && (
										<Badge variant="outline">+{caseStudy.technologies.length - 5}</Badge>
									)}
								</div>
							</CardContent>
							<CardFooter className="justify-between border-t pt-4">
								<div className="flex items-center gap-2 text-muted-foreground text-sm">
									<UsersIcon className="size-4" />
									<span>
										{caseStudy.team?.length || 0} <Trans>team members</Trans>
									</span>
								</div>
								<Button variant="ghost" className="gap-2" onClick={() => onViewCaseStudy(caseStudy)}>
									<Trans>Read More</Trans>
									<ArrowRightIcon className="size-4" />
								</Button>
							</CardFooter>
						</Card>
					</motion.div>
				))}
			</div>
		</TabsContent>
	);
}

// ─── Skills Tab Content ───────────────────────────────────────────────────

export function SkillsTabContent({ projects }: { projects: Project[] }) {
	return (
		<TabsContent value="skills" className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-2xl">
						<Trans>Skills Demonstration</Trans>
					</h3>
					<p className="text-muted-foreground">
						<Trans>Showcase your technical expertise through project tags</Trans>
					</p>
				</div>
			</div>

			{/* Skills by Category */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{SKILL_CATEGORIES.map((category, categoryIndex) => {
					// Count how many projects use each skill
					const skillCounts = category.skills.map((skill) => ({
						skill,
						count: projects.filter((p) => p.tags.includes(skill)).length,
					}));

					return (
						<motion.div
							key={category.name}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: categoryIndex * 0.1 }}
						>
							<Card className="h-full">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-lg">
										<SparkleIcon className="size-5 text-primary" weight="duotone" />
										{category.name}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{skillCounts.map(({ skill, count }) => (
										<div key={skill} className="space-y-1">
											<div className="flex items-center justify-between text-sm">
												<span>{skill}</span>
												<span className="text-muted-foreground">
													{count} {count === 1 ? "project" : "projects"}
												</span>
											</div>
											<Progress value={(count / projects.length) * 100} className="h-1.5" />
										</div>
									))}
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>

			{/* All Tags Cloud */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TagIcon className="size-5 text-primary" weight="duotone" />
						<Trans>All Project Tags</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2">
						{Array.from(new Set(projects.flatMap((p) => p.tags))).map((tag) => {
							const count = projects.filter((p) => p.tags.includes(tag)).length;
							return (
								<Badge
									key={tag}
									variant="secondary"
									className={cn(
										"cursor-pointer transition-all hover:scale-105",
										count >= 3 && "bg-primary/20 text-primary",
									)}
								>
									{tag}
									<span className="ml-1 text-muted-foreground">({count})</span>
								</Badge>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// ─── Analytics Tab Content ────────────────────────────────────────────────

export function AnalyticsTabContent() {
	return (
		<TabsContent value="analytics" className="space-y-8">
			<div>
				<h3 className="font-semibold text-2xl">
					<Trans>Portfolio Analytics</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Track your portfolio performance and engagement</Trans>
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{[
					{
						title: t`Total Views`,
						value: SAMPLE_ANALYTICS.totalViews.toLocaleString("fr-FR"),
						change: "+12%",
						icon: EyeIcon,
						color: "text-blue-500",
						bgColor: "bg-blue-500/10",
					},
					{
						title: t`Unique Visitors`,
						value: SAMPLE_ANALYTICS.uniqueVisitors.toLocaleString("fr-FR"),
						change: "+8%",
						icon: UsersIcon,
						color: "text-green-500",
						bgColor: "bg-green-500/10",
					},
					{
						title: t`Avg. Time on Page`,
						value: `${Math.floor(SAMPLE_ANALYTICS.avgTimeOnPage / 60)}:${(SAMPLE_ANALYTICS.avgTimeOnPage % 60).toString().padStart(2, "0")}`,
						change: "+5%",
						icon: CalendarIcon,
						color: "text-purple-500",
						bgColor: "bg-purple-500/10",
					},
					{
						title: t`Engagement Rate`,
						value: "68%",
						change: "+3%",
						icon: HeartIcon,
						color: "text-red-500",
						bgColor: "bg-red-500/10",
					},
				].map((stat, index) => (
					<motion.div
						key={stat.title}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div className={cn("flex size-12 items-center justify-center rounded-xl", stat.bgColor)}>
										<stat.icon className={cn("size-6", stat.color)} weight="duotone" />
									</div>
									<Badge className="gap-1 bg-green-500/10 text-green-600">
										<TrendUpIcon className="size-3" />
										{stat.change}
									</Badge>
								</div>
								<p className="mt-4 font-bold text-3xl">{stat.value}</p>
								<p className="text-muted-foreground text-sm">{stat.title}</p>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>

			{/* Charts */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Views Over Time */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ChartLineUpIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Views This Week</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex h-48 items-end justify-between gap-2">
							{SAMPLE_ANALYTICS.viewsOverTime.map((data, index) => {
								const maxViews = Math.max(...SAMPLE_ANALYTICS.viewsOverTime.map((d) => d.views));
								const height = (data.views / maxViews) * 100;

								return (
									<motion.div
										key={data.date}
										className="flex flex-1 flex-col items-center gap-2"
										initial={{ height: 0 }}
										animate={{ height: "auto" }}
										transition={{ delay: index * 0.1 }}
									>
										<Tooltip>
											<TooltipTrigger asChild>
												<motion.div
													className="w-full cursor-pointer rounded-t-md bg-primary/80 transition-colors hover:bg-primary"
													initial={{ height: 0 }}
													animate={{ height: `${height}%` }}
													transition={{ delay: index * 0.1, duration: 0.5 }}
													style={{ minHeight: "8px" }}
												/>
											</TooltipTrigger>
											<TooltipContent>
												<p>
													{data.date}: {data.views} views
												</p>
											</TooltipContent>
										</Tooltip>
										<span className="text-muted-foreground text-xs">{data.date}</span>
									</motion.div>
								);
							})}
						</div>
					</CardContent>
				</Card>

				{/* Referral Sources */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ShareNetworkIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Traffic Sources</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{SAMPLE_ANALYTICS.referralSources.map((source, index) => (
							<motion.div
								key={source.source}
								initial={false}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
								className="space-y-2"
							>
								<div className="flex items-center justify-between">
									<span className="font-medium">{source.source}</span>
									<span className="text-muted-foreground text-sm">
										{source.count} ({source.percentage}%)
									</span>
								</div>
								<Progress value={source.percentage} className="h-2" />
							</motion.div>
						))}
					</CardContent>
				</Card>
			</div>

			{/* Top Projects */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendUpIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Top Performing Projects</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{SAMPLE_ANALYTICS.topProjects.map((project, index) => (
							<div key={project.id} className="flex items-center gap-4">
								<div
									className={cn(
										"flex size-10 items-center justify-center rounded-full font-bold",
										index === 0 && "bg-amber-500/20 text-amber-500",
										index === 1 && "bg-gray-400/20 text-gray-400",
										index === 2 && "bg-orange-600/20 text-orange-600",
									)}
								>
									{index + 1}
								</div>
								<div className="flex-1">
									<p className="font-medium">{project.title}</p>
									<p className="text-muted-foreground text-sm">{project.views.toLocaleString("fr-FR")} views</p>
								</div>
								<Progress value={(project.views / SAMPLE_ANALYTICS.totalViews) * 100} className="h-2 w-32" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// ─── Themes Tab Content ───────────────────────────────────────────────────

export function ThemesTabContent({
	selectedTheme,
	setSelectedTheme,
}: {
	selectedTheme: PortfolioTheme;
	setSelectedTheme: (theme: PortfolioTheme) => void;
}) {
	return (
		<TabsContent value="themes" className="space-y-8">
			<div>
				<h3 className="font-semibold text-2xl">
					<Trans>Portfolio Themes</Trans>
				</h3>
				<p className="text-muted-foreground">
					<Trans>Choose a theme that reflects your personal brand</Trans>
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{PORTFOLIO_THEMES.map((theme, index) => (
					<motion.div key={theme.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
						<Card
							className={cn(
								"cursor-pointer overflow-hidden transition-all hover:shadow-lg",
								selectedTheme.id === theme.id && "ring-2 ring-primary",
							)}
							onClick={() => setSelectedTheme(theme)}
						>
							<div className="relative aspect-video bg-muted">
								<div className="absolute inset-0 flex items-center justify-center">
									<PaletteIcon className="size-12 text-muted-foreground" weight="duotone" />
								</div>
								{selectedTheme.id === theme.id && (
									<div className="absolute top-2 right-2">
										<Badge className="gap-1 bg-primary">
											<CheckCircleIcon className="size-3" />
											<Trans>Active</Trans>
										</Badge>
									</div>
								)}
							</div>
							<CardContent className="pt-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-semibold">{theme.name}</p>
										<p className="text-muted-foreground text-sm capitalize">{theme.layout} layout</p>
									</div>
									<div className="flex gap-1">
										{Object.values(theme.colors).map((color, i) => (
											<div key={i} className="size-4 rounded-full border" style={{ backgroundColor: color }} />
										))}
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>

			{/* Theme Customization */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<PaletteIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Customize Theme</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Fine-tune the appearance of your portfolio</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-6 md:grid-cols-2">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>
								<Trans>Primary Color</Trans>
							</Label>
							<div className="flex items-center gap-2">
								<div className="size-10 rounded-lg border" style={{ backgroundColor: selectedTheme.colors.primary }} />
								<Input value={selectedTheme.colors.primary} readOnly className="font-mono" />
							</div>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>Accent Color</Trans>
							</Label>
							<div className="flex items-center gap-2">
								<div className="size-10 rounded-lg border" style={{ backgroundColor: selectedTheme.colors.accent }} />
								<Input value={selectedTheme.colors.accent} readOnly className="font-mono" />
							</div>
						</div>
					</div>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>
								<Trans>Layout Style</Trans>
							</Label>
							<Select defaultValue={selectedTheme.layout}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="grid">
										<Trans>Grid</Trans>
									</SelectItem>
									<SelectItem value="masonry">
										<Trans>Masonry</Trans>
									</SelectItem>
									<SelectItem value="list">
										<Trans>List</Trans>
									</SelectItem>
									<SelectItem value="cards">
										<Trans>Cards</Trans>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center justify-between rounded-lg border p-4">
							<div>
								<p className="font-medium">
									<Trans>Show Project Metrics</Trans>
								</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Display views, likes, and shares on projects</Trans>
								</p>
							</div>
							<Switch defaultChecked />
						</div>
					</div>
				</CardContent>
				<CardFooter className="border-t pt-4">
					<Button className="gap-2">
						<CheckCircleIcon className="size-4" />
						<Trans>Save Theme Settings</Trans>
					</Button>
				</CardFooter>
			</Card>
		</TabsContent>
	);
}
