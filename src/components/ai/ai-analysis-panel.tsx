import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CaretDownIcon,
	CaretUpIcon,
	CheckCircleIcon,
	CircleNotchIcon,
	GlobeIcon,
	LightbulbIcon,
	LightningIcon,
	RocketLaunchIcon,
	ShieldCheckIcon,
	SparkleIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	WarningCircleIcon,
	WarningIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useResumeStore } from "@/components/resume/store/resume";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/integrations/orpc/client";
import type {
	ATSIssue,
	MoroccoMarketInsight,
	QuickFix,
	ResumeAnalysis,
	SectionSuggestion,
} from "@/schema/resume/analysis";
import type { ResumeData } from "@/schema/resume/data";
import { usePrefersReducedMotion } from "@/utils/motion";
import { cn } from "@/utils/style";

// Animated counter hook - respects prefers-reduced-motion
function useAnimatedNumber(value: number, duration = 1500) {
	const prefersReducedMotion = usePrefersReducedMotion();
	const motionValue = useMotionValue(0);
	const rounded = useTransform(motionValue, (v) => Math.round(v));
	const [displayValue, setDisplayValue] = useState(0);

	useEffect(() => {
		// Skip animation if user prefers reduced motion
		if (prefersReducedMotion) {
			setDisplayValue(value);
			return;
		}

		const controls = animate(motionValue, value, { duration: duration / 1000, ease: "easeOut" });
		const unsubscribe = rounded.on("change", setDisplayValue);
		return () => {
			controls.stop();
			unsubscribe();
		};
	}, [value, duration, motionValue, rounded, prefersReducedMotion]);

	return displayValue;
}

type AIAnalysisPanelProps = {
	language?: string;
	onClose?: () => void;
};

export function AIAnalysisPanel({ language = "en" }: AIAnalysisPanelProps) {
	const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
	const [activeTab, setActiveTab] = useState("overview");

	const resumeData = useResumeStore((state) => state.resume?.data) as ResumeData | undefined;

	const { mutate: runAnalysis, isPending } = useMutation(
		orpc.ai.analyzeResume.mutationOptions({
			onSuccess: (data) => {
				setAnalysis(data);
				toast.success(t`Analysis complete!`);
			},
			onError: (error) => {
				toast.error(t`Failed to analyze resume: ${error.message}`);
			},
		}),
	);

	const handleAnalyze = () => {
		if (!resumeData) return;

		runAnalysis({
			language,
			resumeData: {
				picture: {
					hidden: resumeData.picture.hidden,
					url: resumeData.picture.url,
				},
				basics: {
					name: resumeData.basics.name,
					headline: resumeData.basics.headline,
					email: resumeData.basics.email,
					phone: resumeData.basics.phone,
					location: resumeData.basics.location,
					website: resumeData.basics.website,
					customFields: resumeData.basics.customFields.map((f) => ({
						id: f.id,
						icon: f.icon,
						text: f.text,
						link: f.link,
					})),
				},
				summary: {
					title: resumeData.summary.title,
					hidden: resumeData.summary.hidden,
					content: resumeData.summary.content,
				},
				sections: {
					profiles: {
						title: resumeData.sections.profiles.title,
						hidden: resumeData.sections.profiles.hidden,
						items: resumeData.sections.profiles.items.map((p) => ({
							network: p.network,
							username: p.username,
						})),
					},
					experience: {
						title: resumeData.sections.experience.title,
						hidden: resumeData.sections.experience.hidden,
						items: resumeData.sections.experience.items.map((e) => ({
							company: e.company,
							position: e.position,
							location: e.location,
							period: e.period,
							description: e.description,
						})),
					},
					education: {
						title: resumeData.sections.education.title,
						hidden: resumeData.sections.education.hidden,
						items: resumeData.sections.education.items.map((e) => ({
							school: e.school,
							degree: e.degree,
							area: e.area,
							grade: e.grade,
							location: e.location,
							period: e.period,
							description: e.description,
						})),
					},
					skills: {
						title: resumeData.sections.skills.title,
						hidden: resumeData.sections.skills.hidden,
						items: resumeData.sections.skills.items.map((s) => ({
							name: s.name,
							level: s.level,
							keywords: s.keywords,
						})),
					},
					languages: {
						title: resumeData.sections.languages.title,
						hidden: resumeData.sections.languages.hidden,
						items: resumeData.sections.languages.items.map((l) => ({
							language: l.language,
							fluency: l.fluency,
							level: l.level,
						})),
					},
					certifications: {
						title: resumeData.sections.certifications.title,
						hidden: resumeData.sections.certifications.hidden,
						items: resumeData.sections.certifications.items.map((c) => ({
							title: c.title,
							issuer: c.issuer,
							date: c.date,
							description: c.description,
						})),
					},
					projects: {
						title: resumeData.sections.projects.title,
						hidden: resumeData.sections.projects.hidden,
						items: resumeData.sections.projects.items.map((p) => ({
							name: p.name,
							description: p.description,
							period: p.period,
						})),
					},
					awards: {
						title: resumeData.sections.awards.title,
						hidden: resumeData.sections.awards.hidden,
						items: resumeData.sections.awards.items.map((a) => ({
							title: a.title,
							awarder: a.awarder,
							date: a.date,
						})),
					},
					volunteer: {
						title: resumeData.sections.volunteer.title,
						hidden: resumeData.sections.volunteer.hidden,
						items: resumeData.sections.volunteer.items.map((v) => ({
							organization: v.organization,
							location: v.location,
							period: v.period,
							description: v.description,
						})),
					},
					interests: {
						title: resumeData.sections.interests.title,
						hidden: resumeData.sections.interests.hidden,
						items: resumeData.sections.interests.items.map((i) => ({
							name: i.name,
							keywords: i.keywords,
						})),
					},
					references: {
						title: resumeData.sections.references.title,
						hidden: resumeData.sections.references.hidden,
						items: resumeData.sections.references.items.map((r) => ({
							name: r.name,
							position: r.position,
							phone: r.phone,
							description: r.description,
						})),
					},
					publications: {
						title: resumeData.sections.publications.title,
						hidden: resumeData.sections.publications.hidden,
						items: resumeData.sections.publications.items.map((p) => ({
							title: p.title,
							publisher: p.publisher,
							date: p.date,
							description: p.description,
						})),
					},
				},
			},
		});
	};

	return (
		<div className="relative flex h-full flex-col overflow-hidden">
			{/* Decorative background */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 size-80 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl" />
				<div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-gradient-to-tr from-[oklch(0.65_0.15_195)]/5 to-transparent blur-3xl" />
			</div>

			{/* Header with glass effect */}
			<motion.div
				className="relative z-10 flex items-center justify-between border-border/50 border-b bg-background/50 p-4 backdrop-blur-sm"
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
			>
				<div className="flex items-center gap-3">
					<motion.div
						className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5"
						whileHover={{ scale: 1.05 }}
						transition={{ type: "spring", stiffness: 400 }}
					>
						<SparkleIcon className="size-5 text-primary" weight="fill" />
						{/* Subtle glow */}
						<motion.div
							className="absolute inset-0 rounded-xl bg-primary/20 blur-md"
							animate={{ opacity: [0.5, 0.8, 0.5], scale: [0.9, 1, 0.9] }}
							transition={{ duration: 3, repeat: Infinity }}
						/>
					</motion.div>
					<div>
						<h2 className="font-semibold text-lg">
							<Trans>AI Resume Analysis</Trans>
						</h2>
						<p className="text-muted-foreground text-xs">
							<Trans>Powered by advanced AI</Trans>
						</p>
					</div>
				</div>
				<Button
					size="sm"
					onClick={handleAnalyze}
					disabled={isPending}
					className="group gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/30 hover:shadow-xl"
				>
					{isPending ? (
						<>
							<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
								<CircleNotchIcon className="size-4" />
							</motion.div>
							<Trans>Analyzing...</Trans>
						</>
					) : (
						<>
							<RocketLaunchIcon className="size-4 transition-transform group-hover:scale-110" />
							<Trans>Analyze</Trans>
						</>
					)}
				</Button>
			</motion.div>

			{!analysis ? (
				<motion.div
					className="relative z-10 flex flex-1 flex-col items-center justify-center p-8 text-center"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					{/* Animated icon container */}
					<motion.div
						className="relative mb-8"
						initial={{ scale: 0.8 }}
						animate={{ scale: 1 }}
						transition={{ duration: 0.5, type: "spring" }}
					>
						<motion.div
							className="flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-[oklch(0.65_0.15_195)]/10"
							animate={{ rotate: [0, 5, -5, 0] }}
							transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
						>
							<SparkleIcon className="size-14 text-primary" weight="duotone" />
						</motion.div>
						{/* Orbiting elements */}
						<motion.div
							className="absolute -top-2 -right-2 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.65_0.15_195)] to-[oklch(0.55_0.12_195)]"
							animate={{ y: [0, -5, 0] }}
							transition={{ duration: 2, repeat: Infinity }}
						>
							<StarIcon className="size-4 text-white" weight="fill" />
						</motion.div>
						<motion.div
							className="absolute -bottom-1 -left-1 flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.45_0.12_250)] to-[oklch(0.55_0.10_250)]"
							animate={{ y: [0, 5, 0] }}
							transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
						>
							<TrendUpIcon className="size-3 text-white" weight="bold" />
						</motion.div>
						{/* Glow */}
						<div className="absolute inset-0 -z-10 rounded-3xl bg-primary/10 blur-2xl" />
					</motion.div>

					<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
						<h3 className="mb-3 font-bold text-2xl">
							<Trans>Ready to Analyze Your Resume</Trans>
						</h3>
						<p className="mb-8 max-w-sm text-muted-foreground leading-relaxed">
							<Trans>
								Get comprehensive AI-powered feedback on your resume including SWOT analysis, ATS compatibility, and
								Morocco job market fit assessment.
							</Trans>
						</p>
					</motion.div>

					{/* Feature highlights */}
					<motion.div
						className="mb-8 grid grid-cols-3 gap-4"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						{[
							{ icon: ShieldCheckIcon, label: t`ATS Check`, color: "text-blue-500" },
							{ icon: TargetIcon, label: t`Market Fit`, color: "text-green-500" },
							{ icon: LightbulbIcon, label: t`Smart Tips`, color: "text-amber-500" },
						].map((feature, i) => (
							<motion.div
								key={i}
								className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card/50 p-3"
								whileHover={{ scale: 1.05, y: -2 }}
								transition={{ type: "spring", stiffness: 400 }}
							>
								<feature.icon className={cn("size-5", feature.color)} weight="duotone" />
								<span className="text-muted-foreground text-xs">{feature.label}</span>
							</motion.div>
						))}
					</motion.div>

					<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
						<Button
							onClick={handleAnalyze}
							disabled={isPending}
							size="lg"
							className="group relative gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-[oklch(0.50_0.13_165)] px-8 py-6 shadow-primary/25 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/35"
						>
							{isPending ? (
								<>
									<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
										<CircleNotchIcon className="size-5" />
									</motion.div>
									<Trans>Analyzing Your Resume...</Trans>
								</>
							) : (
								<>
									<SparkleIcon
										className="size-5 transition-transform group-hover:rotate-12 group-hover:scale-110"
										weight="fill"
									/>
									<span className="font-semibold">
										<Trans>Start Analysis</Trans>
									</span>
								</>
							)}
							{/* Shimmer effect - decorative, hidden from screen readers */}
							<motion.div
								aria-hidden="true"
								className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
								animate={{ translateX: ["-100%", "100%"] }}
								transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
							/>
						</Button>
					</motion.div>
				</motion.div>
			) : (
				<ScrollArea className="flex-1">
					<div className="p-4">
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList className="mb-4 w-full">
								<TabsTrigger value="overview" className="flex-1">
									<Trans>Overview</Trans>
								</TabsTrigger>
								<TabsTrigger value="swot" className="flex-1">
									<Trans>SWOT</Trans>
								</TabsTrigger>
								<TabsTrigger value="ats" className="flex-1">
									<Trans>ATS</Trans>
								</TabsTrigger>
								<TabsTrigger value="morocco" className="flex-1">
									<Trans>Morocco</Trans>
								</TabsTrigger>
								<TabsTrigger value="suggestions" className="flex-1">
									<Trans>Tips</Trans>
								</TabsTrigger>
							</TabsList>

							<TabsContent value="overview">
								<OverviewTab analysis={analysis} />
							</TabsContent>

							<TabsContent value="swot">
								<SwotTab swot={analysis.swot} />
							</TabsContent>

							<TabsContent value="ats">
								<AtsTab atsCompatibility={analysis.atsCompatibility} />
							</TabsContent>

							<TabsContent value="morocco">
								<MoroccoTab moroccoMarketFit={analysis.moroccoMarketFit} />
							</TabsContent>

							<TabsContent value="suggestions">
								<SuggestionsTab sectionSuggestions={analysis.sectionSuggestions} quickFixes={analysis.quickFixes} />
							</TabsContent>
						</Tabs>
					</div>
				</ScrollArea>
			)}
		</div>
	);
}

// Animated Score Display Component
function AnimatedScore({ score, size = "large" }: { score: number; size?: "small" | "large" }) {
	const animatedScore = useAnimatedNumber(score);
	const circumference = 2 * Math.PI * 56;
	const isLarge = size === "large";

	const getScoreColor = () => {
		if (score >= 80) return "text-green-500";
		if (score >= 60) return "text-amber-500";
		return "text-red-500";
	};

	const getStrokeColor = () => {
		if (score >= 80) return "stroke-green-500";
		if (score >= 60) return "stroke-amber-500";
		return "stroke-red-500";
	};

	return (
		<div className={cn("relative mx-auto", isLarge ? "size-36" : "size-24")}>
			<svg className="size-full -rotate-90">
				{/* Background circle */}
				<circle cx="50%" cy="50%" r={isLarge ? "56" : "36"} className="fill-none stroke-[6] stroke-muted/30" />
				{/* Animated progress circle */}
				<motion.circle
					cx="50%"
					cy="50%"
					r={isLarge ? "56" : "36"}
					className={cn("fill-none stroke-[6]", getStrokeColor())}
					strokeLinecap="round"
					strokeDasharray={isLarge ? circumference : 2 * Math.PI * 36}
					initial={{ strokeDashoffset: isLarge ? circumference : 2 * Math.PI * 36 }}
					animate={{
						strokeDashoffset: isLarge
							? circumference - (circumference * score) / 100
							: 2 * Math.PI * 36 - (2 * Math.PI * 36 * score) / 100,
					}}
					transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
				/>
			</svg>
			{/* Score number */}
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<motion.span
					className={cn("font-bold", isLarge ? "text-4xl" : "text-xl", getScoreColor())}
					initial={false}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.5 }}
				>
					{animatedScore}
				</motion.span>
				{isLarge && <span className="text-muted-foreground text-xs">/ 100</span>}
			</div>
			{/* Glow effect */}
			<motion.div
				className={cn(
					"absolute inset-2 -z-10 rounded-full blur-xl",
					score >= 80 ? "bg-green-500/20" : score >= 60 ? "bg-amber-500/20" : "bg-red-500/20",
				)}
				animate={{ opacity: [0.3, 0.5, 0.3], scale: [0.9, 1, 0.9] }}
				transition={{ duration: 3, repeat: Infinity }}
			/>
		</div>
	);
}

// Overview Tab Component
function OverviewTab({ analysis }: { analysis: ResumeAnalysis }) {
	return (
		<div className="space-y-6">
			{/* Overall Score - Enhanced */}
			<motion.div
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-[oklch(0.65_0.15_195)]/5 p-8 text-center"
			>
				{/* Decorative elements */}
				<div className="pointer-events-none absolute inset-0">
					<motion.div
						className="absolute -top-10 -right-10 size-40 rounded-full bg-primary/10 blur-3xl"
						animate={{ scale: [1, 1.2, 1] }}
						transition={{ duration: 5, repeat: Infinity }}
					/>
					<motion.div
						className="absolute -bottom-10 -left-10 size-40 rounded-full bg-[oklch(0.65_0.15_195)]/10 blur-3xl"
						animate={{ scale: [1, 1.3, 1] }}
						transition={{ duration: 6, repeat: Infinity, delay: 1 }}
					/>
				</div>

				<div className="relative z-10">
					<motion.div
						className="mb-2 flex items-center justify-center gap-2"
						initial={false}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						<SparkleIcon className="size-5 text-primary" weight="fill" />
						<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							<Trans>Overall Resume Score</Trans>
						</h3>
						<SparkleIcon className="size-5 text-primary" weight="fill" />
					</motion.div>

					<AnimatedScore score={analysis.overallScore} size="large" />

					<motion.p
						className="mt-4 text-muted-foreground"
						initial={false}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
					>
						{analysis.overallScore >= 90 ? (
							<span className="text-green-600 dark:text-green-400">
								<Trans>Excellent! Your resume is ready to apply.</Trans>
							</span>
						) : analysis.overallScore >= 75 ? (
							<span className="text-green-600 dark:text-green-400">
								<Trans>Good job! Minor improvements recommended.</Trans>
							</span>
						) : analysis.overallScore >= 60 ? (
							<span className="text-amber-600 dark:text-amber-400">
								<Trans>Average. Several improvements needed.</Trans>
							</span>
						) : (
							<span className="text-red-600 dark:text-red-400">
								<Trans>Needs work. Follow our suggestions below.</Trans>
							</span>
						)}
					</motion.p>
				</div>
			</motion.div>

			{/* Score Cards - Enhanced */}
			<div className="grid gap-4 sm:grid-cols-2">
				<ScoreCard
					title={t`ATS Compatibility`}
					score={analysis.atsCompatibility.score}
					icon={<ShieldCheckIcon className="size-5" weight="duotone" />}
					color="blue"
					delay={0.2}
				/>
				<ScoreCard
					title={t`Morocco Market Fit`}
					score={analysis.moroccoMarketFit.score}
					icon={<GlobeIcon className="size-5" weight="duotone" />}
					color="green"
					delay={0.3}
				/>
			</div>

			{/* Quick Stats - Enhanced */}
			<motion.div
				className="rounded-xl border border-border/50 bg-card/50 p-5"
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
			>
				<h4 className="mb-4 flex items-center gap-2 font-semibold">
					<TrendUpIcon className="size-5 text-primary" />
					<Trans>Quick Summary</Trans>
				</h4>
				<div className="grid grid-cols-2 gap-3">
					{[
						{ icon: CheckCircleIcon, count: analysis.swot.strengths.length, label: t`Strengths`, color: "green" },
						{ icon: WarningIcon, count: analysis.swot.weaknesses.length, label: t`Areas to Improve`, color: "amber" },
						{ icon: LightbulbIcon, count: analysis.swot.opportunities.length, label: t`Opportunities`, color: "blue" },
						{ icon: LightningIcon, count: analysis.quickFixes.length, label: t`Quick Fixes`, color: "purple" },
					].map((item, i) => (
						<motion.div
							key={i}
							className="flex items-center gap-3 rounded-lg border border-border/30 bg-background/50 p-3"
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.5 + i * 0.1 }}
							whileHover={{ scale: 1.02, x: 4 }}
						>
							<div
								className={cn(
									"flex size-8 items-center justify-center rounded-lg",
									item.color === "green" && "bg-green-500/10",
									item.color === "amber" && "bg-amber-500/10",
									item.color === "blue" && "bg-blue-500/10",
									item.color === "purple" && "bg-purple-500/10",
								)}
							>
								<item.icon
									className={cn(
										"size-4",
										item.color === "green" && "text-green-500",
										item.color === "amber" && "text-amber-500",
										item.color === "blue" && "text-blue-500",
										item.color === "purple" && "text-purple-500",
									)}
									weight="fill"
								/>
							</div>
							<div>
								<span className="font-bold text-lg">{item.count}</span>
								<span className="ml-1.5 text-muted-foreground text-sm">{item.label}</span>
							</div>
						</motion.div>
					))}
				</div>
			</motion.div>
		</div>
	);
}

// Score Card Component - Enhanced
function ScoreCard({
	title,
	score,
	icon,
	color,
	delay = 0,
}: {
	title: string;
	score: number;
	icon: React.ReactNode;
	color: "blue" | "green" | "amber" | "red";
	delay?: number;
}) {
	const animatedScore = useAnimatedNumber(score);

	const colorConfig = {
		blue: {
			bg: "from-blue-500/10 to-blue-500/5",
			border: "border-blue-500/20 hover:border-blue-500/40",
			text: "text-blue-600 dark:text-blue-400",
			bar: "bg-blue-500",
			glow: "bg-blue-500/30",
			iconBg: "bg-blue-500/10",
		},
		green: {
			bg: "from-green-500/10 to-green-500/5",
			border: "border-green-500/20 hover:border-green-500/40",
			text: "text-green-600 dark:text-green-400",
			bar: "bg-green-500",
			glow: "bg-green-500/30",
			iconBg: "bg-green-500/10",
		},
		amber: {
			bg: "from-amber-500/10 to-amber-500/5",
			border: "border-amber-500/20 hover:border-amber-500/40",
			text: "text-amber-600 dark:text-amber-400",
			bar: "bg-amber-500",
			glow: "bg-amber-500/30",
			iconBg: "bg-amber-500/10",
		},
		red: {
			bg: "from-red-500/10 to-red-500/5",
			border: "border-red-500/20 hover:border-red-500/40",
			text: "text-red-600 dark:text-red-400",
			bar: "bg-red-500",
			glow: "bg-red-500/30",
			iconBg: "bg-red-500/10",
		},
	};

	const config = colorConfig[color];

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			transition={{ duration: 0.5, delay }}
			whileHover={{ scale: 1.02, y: -2 }}
			className={cn(
				"relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 transition-all duration-300",
				config.bg,
				config.border,
			)}
		>
			{/* Subtle glow */}
			<motion.div
				className={cn("absolute -top-10 -right-10 size-20 rounded-full blur-2xl", config.glow)}
				animate={{ opacity: [0.3, 0.5, 0.3] }}
				transition={{ duration: 3, repeat: Infinity }}
			/>

			<div className="relative z-10">
				<div className="mb-3 flex items-center gap-3">
					<div className={cn("flex size-10 items-center justify-center rounded-lg", config.iconBg)}>{icon}</div>
					<span className="font-medium text-sm">{title}</span>
				</div>

				<div className="flex items-baseline gap-1">
					<span className={cn("font-bold text-4xl tabular-nums", config.text)}>{animatedScore}</span>
					<span className="text-lg text-muted-foreground">%</span>
				</div>

				{/* Progress bar - accessible */}
				<div
					role="progressbar"
					aria-valuenow={score}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label={title}
					className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted/50"
				>
					<motion.div
						initial={{ width: 0 }}
						animate={{ width: `${score}%` }}
						transition={{ duration: 1, delay: delay + 0.3, ease: [0.22, 1, 0.36, 1] }}
						className={cn("h-full rounded-full", config.bar)}
					/>
				</div>
			</div>
		</motion.div>
	);
}

// SWOT Tab Component
function SwotTab({ swot }: { swot: ResumeAnalysis["swot"] }) {
	return (
		<div className="grid gap-4 sm:grid-cols-2">
			<SwotCard
				title={t`Strengths`}
				items={swot.strengths}
				icon={<CheckCircleIcon className="size-5 text-green-500" />}
				color="green"
			/>
			<SwotCard
				title={t`Weaknesses`}
				items={swot.weaknesses}
				icon={<XCircleIcon className="size-5 text-red-500" />}
				color="red"
			/>
			<SwotCard
				title={t`Opportunities`}
				items={swot.opportunities}
				icon={<LightbulbIcon className="size-5 text-blue-500" />}
				color="blue"
			/>
			<SwotCard
				title={t`Threats`}
				items={swot.threats}
				icon={<WarningCircleIcon className="size-5 text-amber-500" />}
				color="amber"
			/>
		</div>
	);
}

function SwotCard({
	title,
	items,
	icon,
	color,
}: {
	title: string;
	items: string[];
	icon: React.ReactNode;
	color: "green" | "red" | "blue" | "amber";
}) {
	const [expanded, setExpanded] = useState(false);
	const displayItems = expanded ? items : items.slice(0, 3);

	const borderColors = {
		green: "border-l-green-500",
		red: "border-l-red-500",
		blue: "border-l-blue-500",
		amber: "border-l-amber-500",
	};

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			className={cn("rounded-lg border border-l-4 p-4", borderColors[color])}
		>
			<div className="mb-3 flex items-center gap-2">
				{icon}
				<h4 className="font-semibold">{title}</h4>
				<Badge variant="secondary" className="ml-auto">
					{items.length}
				</Badge>
			</div>
			<ul className="space-y-2">
				<AnimatePresence>
					{displayItems.map((item, i) => (
						<motion.li
							key={i}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -10 }}
							transition={{ delay: i * 0.05 }}
							className="flex items-start gap-2 text-sm"
						>
							<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current opacity-50" />
							{item}
						</motion.li>
					))}
				</AnimatePresence>
			</ul>
			{items.length > 3 && (
				<Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => setExpanded(!expanded)}>
					{expanded ? (
						<>
							<CaretUpIcon className="mr-1 size-4" />
							<Trans>Show Less</Trans>
						</>
					) : (
						<>
							<CaretDownIcon className="mr-1 size-4" />
							<Trans>Show {items.length - 3} More</Trans>
						</>
					)}
				</Button>
			)}
		</motion.div>
	);
}

// ATS Tab Component - Enhanced
function AtsTab({ atsCompatibility }: { atsCompatibility: ResumeAnalysis["atsCompatibility"] }) {
	return (
		<div className="space-y-6">
			{/* ATS Score - Enhanced */}
			<motion.div
				className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-blue-500/10 to-[oklch(0.45_0.12_250)]/5 p-8 text-center"
				initial={false}
				animate={{ opacity: 1, y: 0 }}
			>
				{/* Decorative elements */}
				<div className="pointer-events-none absolute inset-0">
					<motion.div
						className="absolute -top-10 left-1/4 size-32 rounded-full bg-blue-500/10 blur-3xl"
						animate={{ scale: [1, 1.2, 1] }}
						transition={{ duration: 5, repeat: Infinity }}
					/>
					<div className="moroccan-star-pattern absolute inset-0 opacity-5" />
				</div>

				<div className="relative z-10">
					<motion.div
						className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue-500/10"
						initial={{ scale: 0.8 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2 }}
					>
						<ShieldCheckIcon className="size-8 text-blue-500" weight="duotone" />
					</motion.div>

					<h3 className="mb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
						<Trans>ATS Compatibility Score</Trans>
					</h3>

					<div className="my-4">
						<AnimatedScore score={atsCompatibility.score} size="large" />
					</div>

					<motion.p
						className="text-muted-foreground text-sm"
						initial={false}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
					>
						{atsCompatibility.score >= 80 ? (
							<span className="text-green-600 dark:text-green-400">
								<Trans>Your resume is well-optimized for ATS systems.</Trans>
							</span>
						) : atsCompatibility.score >= 60 ? (
							<span className="text-amber-600 dark:text-amber-400">
								<Trans>Some improvements needed for better ATS compatibility.</Trans>
							</span>
						) : (
							<span className="text-red-600 dark:text-red-400">
								<Trans>Significant changes recommended for ATS optimization.</Trans>
							</span>
						)}
					</motion.p>
				</div>
			</motion.div>

			{/* Issues List - Enhanced */}
			{atsCompatibility.issues.length > 0 && (
				<motion.div className="space-y-3" initial={false} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
					<div className="flex items-center gap-2">
						<WarningCircleIcon className="size-5 text-amber-500" />
						<h4 className="font-semibold">
							<Trans>Issues Found</Trans>
						</h4>
						<Badge variant="secondary" className="ml-auto">
							{atsCompatibility.issues.length}
						</Badge>
					</div>
					{atsCompatibility.issues.map((issue, i) => (
						<AtsIssueCard key={i} issue={issue} index={i} />
					))}
				</motion.div>
			)}

			{atsCompatibility.issues.length === 0 && (
				<motion.div
					className="flex flex-col items-center gap-3 rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10 p-8 text-center"
					initial={false}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.3 }}
				>
					<motion.div
						className="flex size-16 items-center justify-center rounded-full bg-green-500/10"
						animate={{ scale: [1, 1.1, 1] }}
						transition={{ duration: 2, repeat: Infinity }}
					>
						<CheckCircleIcon className="size-8 text-green-500" weight="fill" />
					</motion.div>
					<div>
						<p className="font-semibold text-green-700 dark:text-green-400">
							<Trans>No ATS issues detected!</Trans>
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							<Trans>Your resume is ready for automated screening systems.</Trans>
						</p>
					</div>
				</motion.div>
			)}
		</div>
	);
}

function AtsIssueCard({ issue, index }: { issue: ATSIssue; index: number }) {
	const [expanded, setExpanded] = useState(false);

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.1 }}
			className={cn(
				"rounded-lg border p-4",
				issue.type === "critical" ? "border-red-500/30 bg-red-500/5" : "border-amber-500/30 bg-amber-500/5",
			)}
		>
			<div className="flex cursor-pointer items-center gap-3" onClick={() => setExpanded(!expanded)}>
				{issue.type === "critical" ? (
					<XCircleIcon className="size-5 shrink-0 text-red-500" />
				) : (
					<WarningIcon className="size-5 shrink-0 text-amber-500" />
				)}
				<div className="flex-1">
					<Badge variant={issue.type === "critical" ? "destructive" : "secondary"} className="mb-1">
						{issue.type === "critical" ? t`Critical` : t`Warning`}
					</Badge>
					<p className="font-medium text-sm">{issue.message}</p>
				</div>
				{expanded ? <CaretUpIcon className="size-4" /> : <CaretDownIcon className="size-4" />}
			</div>
			<AnimatePresence>
				{expanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						className="mt-3 overflow-hidden border-t pt-3"
					>
						<div className="flex items-start gap-2 text-sm">
							<LightbulbIcon className="mt-0.5 size-4 shrink-0 text-blue-500" />
							<div>
								<span className="font-medium">
									<Trans>How to fix:</Trans>
								</span>
								<p className="text-muted-foreground">{issue.fix}</p>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

// Morocco Tab Component - Enhanced
function MoroccoTab({ moroccoMarketFit }: { moroccoMarketFit: ResumeAnalysis["moroccoMarketFit"] }) {
	const categoryLabels: Record<string, string> = {
		language: t`Language Skills`,
		photo: t`Professional Photo`,
		certifications: t`Certifications`,
		experience: t`Practical Experience`,
		personalInfo: t`Personal Information`,
		coverLetter: t`Cover Letter Ready`,
	};

	return (
		<div className="space-y-6">
			{/* Morocco Market Score - Enhanced */}
			<motion.div
				className="relative overflow-hidden rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/5 via-[oklch(0.45_0.14_160)]/10 to-[oklch(0.65_0.15_195)]/5 p-8 text-center"
				initial={false}
				animate={{ opacity: 1, y: 0 }}
			>
				{/* Moroccan pattern overlay */}
				<div className="pointer-events-none absolute inset-0">
					<div className="moroccan-pattern absolute inset-0 opacity-40" />
					<motion.div
						className="absolute -top-10 right-1/4 size-32 rounded-full bg-[oklch(0.65_0.15_195)]/10 blur-3xl"
						animate={{ scale: [1, 1.2, 1] }}
						transition={{ duration: 6, repeat: Infinity }}
					/>
				</div>

				<div className="relative z-10">
					<motion.div
						className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/10 to-[oklch(0.65_0.15_195)]/10"
						initial={{ scale: 0.8 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2 }}
					>
						<GlobeIcon className="size-8 text-green-500" weight="duotone" />
					</motion.div>

					<h3 className="mb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
						<Trans>Morocco Job Market Fit</Trans>
					</h3>

					<div className="my-4">
						<AnimatedScore score={moroccoMarketFit.score} size="large" />
					</div>

					<motion.p
						className="text-muted-foreground text-sm"
						initial={false}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
					>
						<Trans>Based on Moroccan employer expectations and IMTA standards</Trans>
					</motion.p>

					{/* Morocco flag colors indicator */}
					<motion.div
						className="mx-auto mt-4 flex h-1.5 w-24 overflow-hidden rounded-full"
						initial={{ scaleX: 0 }}
						animate={{ scaleX: 1 }}
						transition={{ delay: 0.5, duration: 0.5 }}
					>
						<div className="h-full flex-1 bg-[oklch(0.45_0.14_160)]" />
						<div className="h-full flex-1 bg-[oklch(0.65_0.15_195)]" />
						<div className="h-full flex-1 bg-[oklch(0.55_0.14_35)]" />
					</motion.div>
				</div>
			</motion.div>

			{/* Insights Grid - Enhanced */}
			<motion.div className="space-y-3" initial={false} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
				<div className="flex items-center gap-2">
					<TargetIcon className="size-5 text-primary" />
					<h4 className="font-semibold">
						<Trans>Market Fit Analysis</Trans>
					</h4>
				</div>
				{moroccoMarketFit.insights.map((insight, i) => (
					<MoroccoInsightCard
						key={insight.category}
						insight={insight}
						label={categoryLabels[insight.category] || insight.category}
						index={i}
					/>
				))}
			</motion.div>
		</div>
	);
}

function MoroccoInsightCard({
	insight,
	label,
	index,
}: {
	insight: MoroccoMarketInsight;
	label: string;
	index: number;
}) {
	const statusConfig = {
		good: {
			icon: <CheckCircleIcon className="size-5 text-green-500" />,
			bg: "bg-green-500/5 border-green-500/20",
		},
		warning: {
			icon: <WarningIcon className="size-5 text-amber-500" />,
			bg: "bg-amber-500/5 border-amber-500/20",
		},
		missing: {
			icon: <XCircleIcon className="size-5 text-red-500" />,
			bg: "bg-red-500/5 border-red-500/20",
		},
	};

	const config = statusConfig[insight.status];

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.1 }}
			className={cn("flex items-center gap-3 rounded-lg border p-4", config.bg)}
		>
			{config.icon}
			<div className="flex-1">
				<p className="font-medium text-sm">{label}</p>
				<p className="text-muted-foreground text-xs">{insight.message}</p>
			</div>
			<Badge
				variant={insight.status === "good" ? "default" : insight.status === "warning" ? "secondary" : "destructive"}
			>
				{insight.status === "good" ? t`Good` : insight.status === "warning" ? t`Needs Work` : t`Missing`}
			</Badge>
		</motion.div>
	);
}

// Suggestions Tab Component
function SuggestionsTab({
	sectionSuggestions,
	quickFixes,
}: {
	sectionSuggestions: SectionSuggestion[];
	quickFixes: QuickFix[];
}) {
	const sectionLabels: Record<string, string> = {
		basics: t`Basic Information`,
		summary: t`Summary`,
		experience: t`Experience`,
		education: t`Education`,
		skills: t`Skills`,
		languages: t`Languages`,
		certifications: t`Certifications`,
		projects: t`Projects`,
		awards: t`Awards`,
		volunteer: t`Volunteer`,
		interests: t`Interests`,
		references: t`References`,
		publications: t`Publications`,
	};

	const priorityColors = {
		high: "bg-red-500/10 text-red-600 border-red-500/20",
		medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
		low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
	};

	return (
		<div className="space-y-6">
			{/* Quick Fixes */}
			{quickFixes.length > 0 && (
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<LightningIcon className="size-5 text-purple-500" />
						<h4 className="font-medium">
							<Trans>Quick Fixes</Trans>
						</h4>
					</div>
					<div className="space-y-2">
						{quickFixes.map((fix, i) => (
							<motion.div
								key={i}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.05 }}
								className="flex items-start gap-3 rounded-lg border bg-purple-500/5 p-3"
							>
								<Badge variant="outline" className="shrink-0">
									{fix.action === "add" ? t`Add` : fix.action === "remove" ? t`Remove` : t`Update`}
								</Badge>
								<div className="flex-1">
									<p className="font-medium text-sm">{fix.target}</p>
									<p className="text-muted-foreground text-xs">{fix.description}</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			)}

			{/* Section Suggestions */}
			<div className="space-y-3">
				<div className="flex items-center gap-2">
					<LightbulbIcon className="size-5 text-blue-500" />
					<h4 className="font-medium">
						<Trans>Section-by-Section Suggestions</Trans>
					</h4>
				</div>
				{sectionSuggestions
					.filter((s) => s.suggestions.length > 0)
					.map((section, i) => (
						<SectionSuggestionCard
							key={section.section}
							section={section}
							label={sectionLabels[section.section] || section.section}
							priorityColors={priorityColors}
							index={i}
						/>
					))}
			</div>
		</div>
	);
}

function SectionSuggestionCard({
	section,
	label,
	priorityColors,
	index,
}: {
	section: SectionSuggestion;
	label: string;
	priorityColors: Record<string, string>;
	index: number;
}) {
	const [expanded, setExpanded] = useState(section.priority === "high");

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1 }}
			className="rounded-lg border"
		>
			<div className="flex cursor-pointer items-center justify-between p-4" onClick={() => setExpanded(!expanded)}>
				<div className="flex items-center gap-3">
					<Badge className={cn("border", priorityColors[section.priority])}>
						{section.priority === "high"
							? t`High Priority`
							: section.priority === "medium"
								? t`Medium`
								: t`Low Priority`}
					</Badge>
					<span className="font-medium">{label}</span>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant="secondary">{section.suggestions.length}</Badge>
					{expanded ? <CaretUpIcon className="size-4" /> : <CaretDownIcon className="size-4" />}
				</div>
			</div>
			<AnimatePresence>
				{expanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						className="overflow-hidden"
					>
						<ul className="space-y-2 border-t px-4 py-3">
							{section.suggestions.map((suggestion, j) => (
								<li key={j} className="flex items-start gap-2 text-sm">
									<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
									<span>{suggestion}</span>
								</li>
							))}
						</ul>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
