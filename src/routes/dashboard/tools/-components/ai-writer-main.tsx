import { Trans } from "@lingui/react/macro";
import { BrainIcon, GearIcon, LightbulbIcon, RocketLaunchIcon, SparkleIcon, TrendUpIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/style";

import { toolsConfig } from "./ai-writer-config";
import type {
	AchievementQuantifierPanelProps,
	ActionVerbsPanelProps,
	BulletGeneratorPanelProps,
	ComparisonViewPanelProps,
	CoverLetterPanelProps,
	GrammarCheckerPanelProps,
	IndustryLanguagePanelProps,
	LinkedInOptimizerPanelProps,
	SkillsExtractorPanelProps,
	SummaryWriterPanelProps,
} from "./ai-writer-panels";
import {
	AchievementQuantifierPanel,
	ActionVerbsPanel,
	BulletGeneratorPanel,
	SkillsExtractorPanel,
	SummaryWriterPanel,
} from "./ai-writer-panels";
import {
	ComparisonViewPanel,
	CoverLetterPanel,
	GrammarCheckerPanel,
	IndustryLanguagePanel,
	LinkedInOptimizerPanel,
} from "./ai-writer-panels-b";

// ─── Prop Types ──────────────────────────────────────────────────────────

export interface HeroSectionProps {
	statisticsTotal: number;
}

export interface ToolsGridProps {
	activeTab: string;
	setActiveTab: (tab: string) => void;
}

export interface ToolContentProps {
	activeTab: string;
	bulletGeneratorProps: BulletGeneratorPanelProps;
	summaryWriterProps: SummaryWriterPanelProps;
	achievementQuantifierProps: AchievementQuantifierPanelProps;
	actionVerbsProps: ActionVerbsPanelProps;
	skillsExtractorProps: SkillsExtractorPanelProps;
	coverLetterProps: CoverLetterPanelProps;
	linkedInOptimizerProps: LinkedInOptimizerPanelProps;
	industryLanguageProps: IndustryLanguagePanelProps;
	grammarCheckerProps: GrammarCheckerPanelProps;
	comparisonViewProps: ComparisonViewPanelProps;
}

// ─── Hero Section ────────────────────────────────────────────────────────

export function HeroSection({ statisticsTotal }: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.18 280 / 0.15) 0%, oklch(0.6 0.2 320 / 0.1) 50%, oklch(0.65 0.15 200 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-blue-500/15 to-cyan-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [0, -10, 0],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
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
						<Trans>AI-Powered</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>AI Resume Writer</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Use artificial intelligence to transform your resume into an impactful document. Generate impactful bullet
						points, optimize your summary, and much more.
					</Trans>
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
							<BrainIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">10</p>
							<p className="text-muted-foreground text-sm">
								<Trans>AI Tools</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<TrendUpIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{statisticsTotal}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Content generated</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<RocketLaunchIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">100+</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Action verbs</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ─── Tools Grid ──────────────────────────────────────────────────────────

export function ToolsGrid({ activeTab, setActiveTab }: ToolsGridProps) {
	return (
		<motion.div className="mb-8" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
			<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
				<GearIcon className="size-5 text-primary" weight="duotone" />
				<Trans>Choose a Tool</Trans>
			</h3>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
				{toolsConfig.map((tool, index) => (
					<motion.div
						key={tool.id}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 * index }}
						whileHover={{ scale: 1.02, y: -2 }}
						whileTap={{ scale: 0.98 }}
					>
						<Card
							className={cn(
								"cursor-pointer border-2 transition-all duration-300 hover:shadow-lg",
								activeTab === tool.id ? "border-primary bg-primary/5" : "border-transparent hover:border-primary/30",
							)}
							onClick={() => setActiveTab(tool.id)}
						>
							<CardContent className="p-4">
								<div
									className={cn(
										"mb-3 flex size-10 items-center justify-center rounded-xl transition-transform",
										tool.iconBg,
										activeTab === tool.id && "scale-110",
									)}
								>
									<tool.icon className={cn("size-5", tool.iconColor)} weight="duotone" />
								</div>
								<h4 className="mb-1 line-clamp-1 font-medium text-sm">{tool.title}</h4>
								<p className="line-clamp-2 text-muted-foreground text-xs">{tool.description}</p>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}

// ─── Tool Content (AnimatePresence wrapper) ──────────────────────────────

export function ToolContent({
	activeTab,
	bulletGeneratorProps,
	summaryWriterProps,
	achievementQuantifierProps,
	actionVerbsProps,
	skillsExtractorProps,
	coverLetterProps,
	linkedInOptimizerProps,
	industryLanguageProps,
	grammarCheckerProps,
	comparisonViewProps,
}: ToolContentProps) {
	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={activeTab}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				transition={{ duration: 0.3 }}
			>
				{activeTab === "bullet-generator" && <BulletGeneratorPanel {...bulletGeneratorProps} />}
				{activeTab === "summary-writer" && <SummaryWriterPanel {...summaryWriterProps} />}
				{activeTab === "achievement-quantifier" && <AchievementQuantifierPanel {...achievementQuantifierProps} />}
				{activeTab === "action-verbs" && <ActionVerbsPanel {...actionVerbsProps} />}
				{activeTab === "skills-extractor" && <SkillsExtractorPanel {...skillsExtractorProps} />}
				{activeTab === "cover-letter" && <CoverLetterPanel {...coverLetterProps} />}
				{activeTab === "linkedin-optimizer" && <LinkedInOptimizerPanel {...linkedInOptimizerProps} />}
				{activeTab === "industry-language" && <IndustryLanguagePanel {...industryLanguageProps} />}
				{activeTab === "grammar-checker" && <GrammarCheckerPanel {...grammarCheckerProps} />}
				{activeTab === "comparison-view" && <ComparisonViewPanel {...comparisonViewProps} />}
			</motion.div>
		</AnimatePresence>
	);
}

// ─── Pro Tips Section ────────────────────────────────────────────────────

export function ProTipsSection() {
	return (
		<motion.div className="mt-8" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
			<Card className="border-primary/30 border-dashed bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
				<CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row">
					<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
						<LightbulbIcon className="size-7 text-primary" weight="fill" />
					</div>
					<div className="flex-1 text-center md:text-left">
						<h3 className="mb-1 font-semibold text-lg">
							<Trans>Tips for an Effective Resume</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>
								Start each bullet point with an action verb, quantify your achievements with concrete numbers, and adapt
								your vocabulary to the target industry. Use our AI tools to transform your responsibilities into
								measurable accomplishments.
							</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
