import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BookOpenIcon,
	BriefcaseIcon,
	CheckCircleIcon,
	ClockIcon,
	CurrencyCircleDollarIcon,
	FirstAidKitIcon,
	GearIcon,
	GraduationCapIcon,
	HardHatIcon,
	LightbulbIcon,
	MapPinIcon,
	PathIcon,
	StarIcon,
	TrendUpIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../../-components/header";

export const Route = createFileRoute("/dashboard/resources/programs/$programId")({
	component: ProgramDetailPage,
	errorComponent: ErrorComponent,
});

const categoryIcons: Record<string, Icon> = {
	healthcare: FirstAidKitIcon,
	industrial: GearIcon,
	hse: HardHatIcon,
};

const categoryLabels = {
	healthcare: "Healthcare",
	industrial: "Industrial",
	hse: "HSE",
};

const categoryColors = {
	healthcare: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	industrial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	hse: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const categoryGradients = {
	healthcare: "from-red-500/20 via-rose-500/10 to-transparent",
	industrial: "from-blue-500/20 via-indigo-500/10 to-transparent",
	hse: "from-amber-500/20 via-orange-500/10 to-transparent",
};

// Employment rates by program (reference data)
const employmentRates: Record<string, number> = {
	"sage-femme": 95,
	"infirmier-polyvalent": 92,
	"aide-soignant": 88,
	"infirmier-auxiliaire": 85,
	"hse-specialist": 90,
	"conducteur-engins": 87,
	"mecanique-engins": 89,
	"tourneur-industriel": 82,
	"cariste-professionnel": 84,
};

function ProgramDetailPage() {
	const { data: session } = authClient.useSession();
	const { programId } = Route.useParams();

	const { data: program, isLoading } = useQuery({
		...orpc.resources.getProgram.queryOptions({ input: { programId, language: "fr" } }),
		enabled: !!session?.user,
	});

	const { data: resources } = useQuery({
		...orpc.resources.getResources.queryOptions({ input: { language: "fr" } }),
		enabled: !!session?.user,
	});

	// Get related resources
	const relatedResources = resources?.filter((r) => program?.relatedResources?.includes(r.id)) ?? [];

	if (isLoading) {
		return (
			<>
				<Skeleton className="mb-6 h-8 w-64" />

				<div className="mb-6">
					<Skeleton className="h-10 w-56" />
				</div>

				<div className="mb-8 space-y-6 rounded-3xl border p-8 md:p-12">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
						<div className="flex-1 space-y-6">
							<div className="flex items-center gap-3">
								<Skeleton className="size-16 rounded-2xl" />
								<Skeleton className="h-6 w-24" />
							</div>
							<Skeleton className="h-10 w-3/4" />
							<Skeleton className="h-6 w-full max-w-2xl" />
							<div className="flex flex-wrap gap-4">
								{Array.from({ length: 3 }).map((_, i) => (
									<Skeleton key={i} className="h-10 w-32 rounded-full" />
								))}
							</div>
						</div>
						<Skeleton className="h-64 w-full rounded-xl lg:w-80" />
					</div>
				</div>

				<div className="space-y-8">
					<div className="flex flex-wrap gap-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-10 w-28 rounded-full" />
						))}
					</div>

					<div className="grid gap-8 lg:grid-cols-2">
						{Array.from({ length: 2 }).map((_, i) => (
							<Skeleton key={i} className="h-96 rounded-xl" />
						))}
					</div>
				</div>
			</>
		);
	}

	if (!program) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<GraduationCapIcon className="mb-4 size-16 text-muted-foreground" />
				<h2 className="mb-2 font-semibold text-xl">
					<Trans>Program not found</Trans>
				</h2>
				<p className="mb-4 text-muted-foreground">
					<Trans>The requested program does not exist or has been removed.</Trans>
				</p>
				<Link to="/dashboard/resources">
					<Button variant="outline" className="gap-2">
						<ArrowLeftIcon className="size-4" />
						<Trans>Back to resources</Trans>
					</Button>
				</Link>
			</div>
		);
	}

	const CategoryIcon = categoryIcons[program.category] ?? GraduationCapIcon;
	const employmentRate = employmentRates[program.id] ?? 85;

	return (
		<>
			<DashboardHeader icon={GraduationCapIcon} title={program.name} />

			{/* Back navigation */}
			<div className="mb-6">
				<Link to="/dashboard/resources">
					<Button variant="ghost" size="sm" className="gap-2">
						<ArrowLeftIcon className="size-4" />
						<Trans>Back to Training Center</Trans>
					</Button>
				</Link>
			</div>

			{/* Hero Section */}
			<motion.div
				className={cn(
					"relative mb-8 overflow-hidden rounded-3xl border p-8 md:p-12",
					"bg-gradient-to-br",
					categoryGradients[program.category as keyof typeof categoryGradients],
				)}
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -top-20 -right-20 size-60 rounded-full bg-primary/10 blur-3xl" />
					<div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-[oklch(0.65_0.15_195)]/10 blur-3xl" />
				</div>

				<div className="relative z-10">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
						<div className="flex-1">
							<div className="mb-4 flex items-center gap-3">
								<div
									className={cn(
										"flex size-16 items-center justify-center rounded-2xl",
										categoryColors[program.category as keyof typeof categoryColors],
									)}
								>
									<CategoryIcon className="size-8" weight="duotone" />
								</div>
								<div>
									<Badge className={categoryColors[program.category as keyof typeof categoryColors]}>
										{categoryLabels[program.category as keyof typeof categoryLabels]}
									</Badge>
								</div>
							</div>

							<h1 className="mb-4 font-bold text-3xl md:text-4xl">{program.name}</h1>
							<p className="mb-6 max-w-2xl text-lg text-muted-foreground">{program.description}</p>

							{/* Quick stats */}
							<div className="flex flex-wrap gap-4">
								<div className="flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 backdrop-blur-sm">
									<ClockIcon className="size-5 text-primary" />
									<span className="font-medium">{program.duration}</span>
								</div>
								<div className="flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 backdrop-blur-sm">
									<CurrencyCircleDollarIcon className="size-5 text-green-500" />
									<span className="font-medium">
										{program.salaryRange.min.toLocaleString("fr-FR")} -{" "}
										{program.salaryRange.max.toLocaleString("fr-FR")} {program.salaryRange.currency}
									</span>
								</div>
								<div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 dark:bg-green-900/30">
									<TrendUpIcon className="size-5 text-green-600" />
									<span className="font-medium text-green-700 dark:text-green-400">
										{employmentRate}% employment rate
									</span>
								</div>
							</div>
						</div>

						{/* CTA Card */}
						<Card className="w-full border-primary/20 bg-background/80 backdrop-blur-sm lg:w-80">
							<CardHeader>
								<CardTitle className="text-lg">
									<Trans>Interested in this program?</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Start your preparation journey</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Button className="w-full gap-2">
									<GraduationCapIcon className="size-5" />
									<Trans>Enroll in program</Trans>
								</Button>
								<Button variant="outline" className="w-full gap-2">
									<BookOpenIcon className="size-5" />
									<Trans>Download brochure</Trans>
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</motion.div>

			{/* Main Content */}
			<Tabs defaultValue="overview" className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					<TabsTrigger
						value="overview"
						className="gap-2 rounded-full border px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						<StarIcon className="size-4" />
						<Trans>Overview</Trans>
					</TabsTrigger>
					<TabsTrigger
						value="requirements"
						className="gap-2 rounded-full border px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						<CheckCircleIcon className="size-4" />
						<Trans>Prerequisites</Trans>
					</TabsTrigger>
					<TabsTrigger
						value="career"
						className="gap-2 rounded-full border px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						<PathIcon className="size-4" />
						<Trans>Career Path</Trans>
					</TabsTrigger>
					<TabsTrigger
						value="interview"
						className="gap-2 rounded-full border px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						<LightbulbIcon className="size-4" />
						<Trans>Interview Tips</Trans>
					</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-8">
					<div className="grid gap-8 lg:grid-cols-2">
						{/* Skills Section */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<GraduationCapIcon className="size-5 text-primary" />
									<Trans>Acquired Skills</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>What you will learn during the program</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3">
									{program.skills.map((skill, index) => (
										<motion.li
											key={skill}
											initial={false}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
											className="flex items-start gap-3"
										>
											<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-green-500" weight="fill" />
											<span>{skill}</span>
										</motion.li>
									))}
								</ul>
							</CardContent>
						</Card>

						{/* Career Prospects Section */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<BriefcaseIcon className="size-5 text-primary" />
									<Trans>Career Prospects</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Where you can work after the program</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3">
									{program.careerProspects.map((prospect, index) => (
										<motion.li
											key={prospect}
											initial={false}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
											className="flex items-start gap-3"
										>
											<MapPinIcon className="mt-0.5 size-5 shrink-0 text-blue-500" weight="fill" />
											<span>{prospect}</span>
										</motion.li>
									))}
								</ul>
							</CardContent>
						</Card>
					</div>

					{/* Related Resources */}
					{relatedResources.length > 0 && (
						<section>
							<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
								<BookOpenIcon className="size-5 text-primary" />
								<Trans>Related Resources</Trans>
							</h3>
							<div className="grid gap-4 md:grid-cols-2">
								{relatedResources.map((resource) => (
									<Card key={resource.id} className="transition-all hover:shadow-md">
										<CardHeader>
											<CardTitle className="text-base">{resource.title}</CardTitle>
											<CardDescription className="line-clamp-2">{resource.description}</CardDescription>
										</CardHeader>
										<CardContent className="pt-0">
											<Badge variant="outline">{resource.type}</Badge>
										</CardContent>
									</Card>
								))}
							</div>
						</section>
					)}
				</TabsContent>

				{/* Requirements Tab */}
				<TabsContent value="requirements" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CheckCircleIcon className="size-5 text-primary" />
								<Trans>Admission Requirements</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Prerequisites needed to join this program</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-4">
								{program.requirements.map((req, index) => (
									<motion.li
										key={req}
										initial={false}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
										className="flex items-start gap-4 rounded-lg border bg-muted/30 p-4"
									>
										<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm">
											{index + 1}
										</div>
										<span className="pt-1">{req}</span>
									</motion.li>
								))}
							</ul>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Career Pathways Tab */}
				<TabsContent value="career" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<PathIcon className="size-5 text-primary" />
								<Trans>Career Progression</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Career progression steps</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="relative space-y-0">
								{program.careerPathways.map((pathway, index) => (
									<div key={pathway.title} className="relative flex gap-4 pb-8 last:pb-0">
										{/* Vertical line */}
										{index < program.careerPathways.length - 1 && (
											<div className="absolute top-10 left-5 h-full w-0.5 bg-gradient-to-b from-primary to-primary/30" />
										)}

										{/* Step indicator */}
										<div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
											<TrendUpIcon className="size-5 text-primary" weight="bold" />
										</div>

										{/* Content */}
										<motion.div
											initial={false}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.2 }}
											className="flex-1 rounded-lg border bg-card p-4"
										>
											<div className="mb-2 flex items-center justify-between">
												<h4 className="font-semibold text-lg">{pathway.title}</h4>
												<Badge variant="secondary">{pathway.yearsExperience} years</Badge>
											</div>
											<p className="text-muted-foreground">{pathway.description}</p>
										</motion.div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Interview Tips Tab */}
				<TabsContent value="interview" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<LightbulbIcon className="size-5 text-amber-500" />
								<Trans>Interview Tips</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Prepare effectively for your job interviews</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-2">
								{program.interviewTips.map((tip, index) => (
									<motion.div
										key={tip}
										initial={false}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: index * 0.1 }}
										className="flex items-start gap-3 rounded-lg border bg-amber-50/50 p-4 dark:bg-amber-950/20"
									>
										<LightbulbIcon className="mt-0.5 size-5 shrink-0 text-amber-500" weight="fill" />
										<p className="text-sm">{tip}</p>
									</motion.div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* CTA for Interview Practice */}
					<Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
						<CardContent className="flex flex-col items-center gap-4 p-8 text-center md:flex-row md:text-left">
							<div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
								<UsersIcon className="size-8 text-primary" weight="duotone" />
							</div>
							<div className="flex-1">
								<h3 className="mb-1 font-semibold text-lg">
									<Trans>Ready to practice?</Trans>
								</h3>
								<p className="text-muted-foreground">
									<Trans>Use our AI interview simulator to practice with questions specific to your field.</Trans>
								</p>
							</div>
							<Link to="/dashboard/interview">
								<Button className="gap-2">
									<Trans>Start training</Trans>
									<ArrowRightIcon className="size-4" />
								</Button>
							</Link>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</>
	);
}
