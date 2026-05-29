import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BuildingsIcon,
	CalendarIcon,
	CaretRightIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	CoinIcon,
	CurrencyCircleDollarIcon,
	GiftIcon,
	GlobeIcon,
	InfoIcon,
	MapPinIcon,
	MedalIcon,
	SparkleIcon,
	StarIcon,
	TrendUpIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/style";

import { DashboardHeader } from "../../-components/header";
import { experienceLabels, experienceMultipliers, fieldConfig, jobTitles, regions } from "./salary-calculator-config";
import type { ExperienceLevel, Field } from "./salary-calculator-types";
import {
	calculateCareerProjection,
	calculateSalary,
	formatCurrency,
	getNationalAverage,
	getRegionalComparison,
} from "./salary-calculator-utils";

export function SalaryCalculator() {
	const [activeTab, setActiveTab] = useState("calculator");
	const [field, setField] = useState<Field | "">("");
	const [jobTitle, setJobTitle] = useState("");
	const [experience, setExperience] = useState<ExperienceLevel | "">("");
	const [region, setRegion] = useState("");
	const [includeBenefits, setIncludeBenefits] = useState(true);
	const [showResults, setShowResults] = useState(false);

	const salaryBreakdown = useMemo(() => {
		if (!field || !jobTitle || !experience || !region) return null;
		return calculateSalary(field, jobTitle, experience, region, includeBenefits);
	}, [field, jobTitle, experience, region, includeBenefits]);

	const nationalAverage = useMemo(() => {
		if (!field || !jobTitle) return 0;
		return getNationalAverage(field, jobTitle);
	}, [field, jobTitle]);

	const careerProjections = useMemo(() => {
		if (!field || !jobTitle || !experience) return [];
		return calculateCareerProjection(field, jobTitle, experience);
	}, [field, jobTitle, experience]);

	const regionalComparison = useMemo(() => {
		if (!field || !jobTitle || !experience) return [];
		return getRegionalComparison(field, jobTitle, experience);
	}, [field, jobTitle, experience]);

	const selectedRegion = useMemo(() => regions.find((r) => r.id === region), [region]);

	const selectedJob = useMemo(() => {
		if (!field || !jobTitle) return null;
		return jobTitles[field].find((j) => j.id === jobTitle);
	}, [field, jobTitle]);

	const handleCalculate = useCallback(() => {
		if (field && jobTitle && experience && region) {
			setShowResults(true);
		}
	}, [field, jobTitle, experience, region]);

	const handleReset = useCallback(() => {
		setField("");
		setJobTitle("");
		setExperience("");
		setRegion("");
		setIncludeBenefits(true);
		setShowResults(false);
	}, []);

	const isFormComplete = field && jobTitle && experience && region;

	const comparisonToNational = useMemo(() => {
		if (!salaryBreakdown || !nationalAverage) return 0;
		return Math.round(((salaryBreakdown.baseSalary.median - nationalAverage) / nationalAverage) * 100);
	}, [salaryBreakdown, nationalAverage]);

	return (
		<>
			<DashboardHeader icon={CurrencyCircleDollarIcon} title={t`Salary Calculator`} />

			<HeroSection />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "calculator", icon: CurrencyCircleDollarIcon, label: t`Calculator` },
						{ value: "comparison", icon: ChartBarIcon, label: t`Comparison` },
						{ value: "projection", icon: TrendUpIcon, label: t`Projections` },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="calculator" className="space-y-8">
					<div className="grid gap-8 lg:grid-cols-2">
						<CalculatorForm
							field={field}
							jobTitle={jobTitle}
							experience={experience}
							region={region}
							includeBenefits={includeBenefits}
							showResults={showResults}
							isFormComplete={!!isFormComplete}
							onFieldChange={(v) => {
								setField(v as Field);
								setJobTitle("");
							}}
							onJobTitleChange={setJobTitle}
							onExperienceChange={(v) => setExperience(v as ExperienceLevel)}
							onRegionChange={setRegion}
							onIncludeBenefitsChange={setIncludeBenefits}
							onCalculate={handleCalculate}
							onReset={handleReset}
						/>

						<AnimatePresence mode="wait">
							{showResults && salaryBreakdown ? (
								<motion.div
									key="results"
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
									transition={{ duration: 0.4 }}
									className="space-y-6"
								>
									<SalaryResultCard
										salaryBreakdown={salaryBreakdown}
										selectedJob={selectedJob}
										selectedRegion={selectedRegion}
										nationalAverage={nationalAverage}
										comparisonToNational={comparisonToNational}
									/>
									<BreakdownCard salaryBreakdown={salaryBreakdown} includeBenefits={includeBenefits} />
								</motion.div>
							) : (
								<ResultsPlaceholder />
							)}
						</AnimatePresence>
					</div>
				</TabsContent>

				<TabsContent value="comparison" className="space-y-8">
					<ComparisonTab
						showResults={showResults}
						field={field}
						jobTitle={jobTitle}
						experience={experience}
						region={region}
						selectedJob={selectedJob}
						selectedRegion={selectedRegion}
						regionalComparison={regionalComparison}
						onGoToCalculator={() => setActiveTab("calculator")}
					/>
				</TabsContent>

				<TabsContent value="projection" className="space-y-8">
					<ProjectionTab
						showResults={showResults}
						careerProjections={careerProjections}
						onGoToCalculator={() => setActiveTab("calculator")}
					/>
				</TabsContent>
			</Tabs>

			<DisclaimerCard />
		</>
	);
}

function HeroSection() {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.65 0.18 140 / 0.15) 0%, oklch(0.6 0.2 180 / 0.1) 50%, oklch(0.7 0.15 220 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-amber-500/15 to-yellow-500/10 blur-3xl"
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
					<CurrencyCircleDollarIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>IMTA Tools</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Salary Calculator</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Estimate your potential salary in Morocco based on your field, position, experience, and region. Plan your
						career with up-to-date market data.
					</Trans>
				</motion.p>

				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<ChartBarIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">20+</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Jobs analyzed</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<MapPinIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">10</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Regions</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<TrendUpIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">2024</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Up-to-date data</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

function CalculatorForm({
	field,
	jobTitle,
	experience,
	region,
	includeBenefits,
	showResults,
	isFormComplete,
	onFieldChange,
	onJobTitleChange,
	onExperienceChange,
	onRegionChange,
	onIncludeBenefitsChange,
	onCalculate,
	onReset,
}: {
	field: Field | "";
	jobTitle: string;
	experience: ExperienceLevel | "";
	region: string;
	includeBenefits: boolean;
	showResults: boolean;
	isFormComplete: boolean;
	onFieldChange: (v: string) => void;
	onJobTitleChange: (v: string) => void;
	onExperienceChange: (v: string) => void;
	onRegionChange: (v: string) => void;
	onIncludeBenefitsChange: (v: boolean) => void;
	onCalculate: () => void;
	onReset: () => void;
}) {
	return (
		<Card className="border-2 border-primary/20">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl">
					<UserIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Your Information</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Enter your details to estimate your salary</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<Label>
						<Trans>Field / Sector</Trans>
					</Label>
					<Select value={field} onValueChange={onFieldChange}>
						<SelectTrigger className="h-12">
							<SelectValue placeholder={t`Select your field`} />
						</SelectTrigger>
						<SelectContent>
							{(Object.entries(fieldConfig) as [Field, (typeof fieldConfig)[Field]][]).map(([key, config]) => {
								const FieldIcon = config.icon;
								return (
									<SelectItem key={key} value={key}>
										<div className="flex items-center gap-2">
											<FieldIcon className="size-4" />
											{config.label}
										</div>
									</SelectItem>
								);
							})}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Position / Job</Trans>
					</Label>
					<Select value={jobTitle} onValueChange={onJobTitleChange} disabled={!field}>
						<SelectTrigger className="h-12">
							<SelectValue placeholder={t`Select your position`} />
						</SelectTrigger>
						<SelectContent>
							{field &&
								jobTitles[field].map((job) => (
									<SelectItem key={job.id} value={job.id}>
										{job.label}
									</SelectItem>
								))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Experience Level</Trans>
					</Label>
					<Select value={experience} onValueChange={onExperienceChange}>
						<SelectTrigger className="h-12">
							<SelectValue placeholder={t`Select your experience`} />
						</SelectTrigger>
						<SelectContent>
							{(Object.entries(experienceLabels) as [ExperienceLevel, string][]).map(([key, label]) => (
								<SelectItem key={key} value={key}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>
						<Trans>Region</Trans>
					</Label>
					<Select value={region} onValueChange={onRegionChange}>
						<SelectTrigger className="h-12">
							<SelectValue placeholder={t`Select your region`} />
						</SelectTrigger>
						<SelectContent>
							{regions.map((r) => (
								<SelectItem key={r.id} value={r.id}>
									<div className="flex items-center gap-2">
										<MapPinIcon className="size-4" />
										{r.label}
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
					<div className="flex items-center gap-3">
						<GiftIcon className="size-5 text-primary" weight="duotone" />
						<div>
							<Label className="font-medium">
								<Trans>Include benefits</Trans>
							</Label>
							<p className="text-muted-foreground text-sm">
								<Trans>Insurance, transport, meals...</Trans>
							</p>
						</div>
					</div>
					<Switch checked={includeBenefits} onCheckedChange={onIncludeBenefitsChange} />
				</div>

				<div className="flex gap-3 pt-4">
					<Button className="flex-1 gap-2" size="lg" onClick={onCalculate} disabled={!isFormComplete}>
						<CurrencyCircleDollarIcon className="size-5" />
						<Trans>Calculate my salary</Trans>
					</Button>
					{showResults && (
						<Button variant="outline" size="lg" onClick={onReset}>
							<Trans>Reset</Trans>
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function SalaryResultCard({
	salaryBreakdown,
	selectedJob,
	selectedRegion,
	nationalAverage,
	comparisonToNational,
}: {
	salaryBreakdown: NonNullable<ReturnType<typeof calculateSalary>>;
	selectedJob: { id: string; label: string; baseSalary: number } | null | undefined;
	selectedRegion: { id: string; label: string } | undefined;
	nationalAverage: number;
	comparisonToNational: number;
}) {
	return (
		<Card className="overflow-hidden border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-lg">
					<StarIcon className="size-5 text-amber-500" weight="fill" />
					<Trans>Estimated Salary</Trans>
				</CardTitle>
				<CardDescription>
					{selectedJob?.label} - {selectedRegion?.label}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="text-center">
					<p className="text-muted-foreground text-sm">
						<Trans>Monthly range</Trans>
					</p>
					<div className="flex items-baseline justify-center gap-2">
						<span className="font-bold text-2xl text-green-600 dark:text-green-400">
							{formatCurrency(salaryBreakdown.total.min)}
						</span>
						<span className="text-muted-foreground">-</span>
						<span className="font-bold text-2xl text-green-600 dark:text-green-400">
							{formatCurrency(salaryBreakdown.total.max)}
						</span>
					</div>
					<p className="mt-1 text-muted-foreground text-sm">
						<Trans>Median</Trans>: <span className="font-semibold">{formatCurrency(salaryBreakdown.total.median)}</span>
					</p>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">
							<Trans>Min</Trans>
						</span>
						<span className="text-muted-foreground">
							<Trans>Max</Trans>
						</span>
					</div>
					<div className="relative h-4 overflow-hidden rounded-full bg-muted">
						<motion.div
							className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
							initial={{ width: 0 }}
							animate={{
								width: `${((salaryBreakdown.total.median - salaryBreakdown.total.min) / (salaryBreakdown.total.max - salaryBreakdown.total.min)) * 100}%`,
							}}
							transition={{ duration: 1, ease: "easeOut" }}
						/>
						<motion.div
							className="absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-white shadow-lg"
							initial={{ left: 0 }}
							animate={{
								left: `${((salaryBreakdown.total.median - salaryBreakdown.total.min) / (salaryBreakdown.total.max - salaryBreakdown.total.min)) * 100}%`,
							}}
							transition={{ duration: 1, ease: "easeOut" }}
						/>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<GlobeIcon className="size-5 text-muted-foreground" />
							<span className="text-sm">
								<Trans>National average</Trans>
							</span>
						</div>
						<span className="font-medium">{formatCurrency(nationalAverage)}</span>
					</div>
					<div className="mt-2 flex items-center gap-2">
						{comparisonToNational >= 0 ? (
							<Badge className="gap-1 bg-green-500 text-white">
								<TrendUpIcon className="size-3" />+{comparisonToNational}%
							</Badge>
						) : (
							<Badge variant="secondary" className="gap-1">
								{comparisonToNational}%
							</Badge>
						)}
						<span className="text-muted-foreground text-sm">
							{comparisonToNational >= 0 ? <Trans>above average</Trans> : <Trans>below average</Trans>}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function BreakdownCard({
	salaryBreakdown,
	includeBenefits,
}: {
	salaryBreakdown: NonNullable<ReturnType<typeof calculateSalary>>;
	includeBenefits: boolean;
}) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg">
					<ChartBarIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Salary Breakdown</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<motion.div
					className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
				>
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
							<CoinIcon className="size-5" weight="duotone" />
						</div>
						<div>
							<p className="font-medium">
								<Trans>Base salary</Trans>
							</p>
							<p className="text-muted-foreground text-xs">
								<Trans>Fixed monthly compensation</Trans>
							</p>
						</div>
					</div>
					<div className="text-right">
						<p className="font-semibold">{formatCurrency(salaryBreakdown.baseSalary.median)}</p>
						<p className="text-muted-foreground text-xs">
							{formatCurrency(salaryBreakdown.baseSalary.min)} - {formatCurrency(salaryBreakdown.baseSalary.max)}
						</p>
					</div>
				</motion.div>

				<motion.div
					className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
							<MedalIcon className="size-5" weight="duotone" />
						</div>
						<div>
							<p className="font-medium">
								<Trans>Bonuses and Premiums</Trans>
							</p>
							<p className="text-muted-foreground text-xs">
								<Trans>Performance, seniority...</Trans>
							</p>
						</div>
					</div>
					<div className="text-right">
						<p className="font-semibold">{formatCurrency(salaryBreakdown.bonuses.median)}</p>
						<p className="text-muted-foreground text-xs">
							{formatCurrency(salaryBreakdown.bonuses.min)} - {formatCurrency(salaryBreakdown.bonuses.max)}
						</p>
					</div>
				</motion.div>

				{includeBenefits && (
					<motion.div
						className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
								<GiftIcon className="size-5" weight="duotone" />
							</div>
							<div>
								<p className="font-medium">
									<Trans>Benefits Value</Trans>
								</p>
								<p className="text-muted-foreground text-xs">
									<Trans>Assurance, transport, repas...</Trans>
								</p>
							</div>
						</div>
						<div className="text-right">
							<p className="font-semibold">{formatCurrency(salaryBreakdown.benefitsValue.median)}</p>
							<p className="text-muted-foreground text-xs">
								{formatCurrency(salaryBreakdown.benefitsValue.min)} -{" "}
								{formatCurrency(salaryBreakdown.benefitsValue.max)}
							</p>
						</div>
					</motion.div>
				)}
			</CardContent>
		</Card>
	);
}

function ResultsPlaceholder() {
	return (
		<motion.div
			key="placeholder"
			initial={false}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-muted-foreground/30 border-dashed p-8 text-center"
		>
			<CurrencyCircleDollarIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
			<h3 className="mb-2 font-semibold text-lg">
				<Trans>Your results will appear here</Trans>
			</h3>
			<p className="text-muted-foreground text-sm">
				<Trans>Fill in the form and click "Calculate" to see your estimate</Trans>
			</p>
		</motion.div>
	);
}

function ComparisonTab({
	showResults,
	field,
	jobTitle,
	experience,
	region,
	selectedJob,
	selectedRegion,
	regionalComparison,
	onGoToCalculator,
}: {
	showResults: boolean;
	field: Field | "";
	jobTitle: string;
	experience: ExperienceLevel | "";
	region: string;
	selectedJob: { id: string; label: string; baseSalary: number } | null | undefined;
	selectedRegion: { id: string; label: string } | undefined;
	regionalComparison: ReturnType<typeof getRegionalComparison>;
	onGoToCalculator: () => void;
}) {
	if (!showResults || regionalComparison.length === 0) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center justify-center py-16">
					<ChartBarIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>No comparisons available</Trans>
					</h3>
					<p className="mb-4 text-center text-muted-foreground">
						<Trans>Calculate your salary first to see comparisons</Trans>
					</p>
					<Button onClick={onGoToCalculator}>
						<ArrowRightIcon className="mr-2 size-4" />
						<Trans>Go to calculator</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<SimilarRolesSection
				field={field as Field}
				jobTitle={jobTitle}
				experience={experience as ExperienceLevel}
				selectedJob={selectedJob}
			/>
			<ExperienceImpactSection
				field={field as Field}
				jobTitle={jobTitle}
				experience={experience as ExperienceLevel}
				region={region}
			/>
			<RegionalDifferencesSection regionalComparison={regionalComparison} selectedRegion={selectedRegion} />
		</>
	);
}

function SimilarRolesSection({
	field,
	jobTitle,
	experience,
	selectedJob,
}: {
	field: Field;
	jobTitle: string;
	experience: ExperienceLevel;
	selectedJob: { id: string; label: string; baseSalary: number } | null | undefined;
}) {
	return (
		<section>
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<UserIcon className="size-6 text-primary" weight="duotone" />
				<Trans>Comparison with Similar Roles</Trans>
			</h3>

			<div className="grid gap-4 md:grid-cols-3">
				{field &&
					jobTitles[field]
						.filter((j) => j.id !== jobTitle)
						.slice(0, 6)
						.map((job, index) => {
							const jobSalary = Math.round(job.baseSalary * experienceMultipliers[experience as ExperienceLevel]);
							const currentJobSalary = selectedJob
								? Math.round(selectedJob.baseSalary * experienceMultipliers[experience as ExperienceLevel])
								: 0;
							const difference = currentJobSalary > 0 ? ((jobSalary - currentJobSalary) / currentJobSalary) * 100 : 0;

							return (
								<motion.div
									key={job.id}
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
								>
									<Card className="h-full transition-all hover:shadow-md">
										<CardContent className="p-4">
											<h4 className="mb-2 font-medium">{job.label}</h4>
											<p className="mb-3 font-semibold text-2xl">{formatCurrency(jobSalary)}</p>
											<div className="flex items-center gap-2">
												{difference > 0 ? (
													<Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
														+{Math.round(difference)}%
													</Badge>
												) : difference < 0 ? (
													<Badge variant="secondary">{Math.round(difference)}%</Badge>
												) : (
													<Badge variant="outline">
														<Trans>Same</Trans>
													</Badge>
												)}
												<span className="text-muted-foreground text-xs">
													<Trans>vs your position</Trans>
												</span>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
			</div>
		</section>
	);
}

function ExperienceImpactSection({
	field,
	jobTitle,
	experience,
	region,
}: {
	field: Field;
	jobTitle: string;
	experience: ExperienceLevel;
	region: string;
}) {
	return (
		<section>
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<CalendarIcon className="size-6 text-primary" weight="duotone" />
				<Trans>Impact of Experience on Salary</Trans>
			</h3>

			<Card>
				<CardContent className="p-6">
					<div className="space-y-4">
						{(Object.entries(experienceLabels) as [ExperienceLevel, string][]).map(([level, label], index) => {
							if (!field || !jobTitle) return null;
							const salary = calculateSalary(field, jobTitle, level, region, false);
							const maxSalary = calculateSalary(field, jobTitle, "10+", region, false);
							const percentage = (salary.baseSalary.median / maxSalary.baseSalary.median) * 100;
							const isCurrentLevel = level === experience;

							return (
								<motion.div
									key={level}
									initial={false}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.1 }}
									className={cn("space-y-2 rounded-lg p-3", isCurrentLevel && "bg-primary/10")}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className="font-medium">{label}</span>
											{isCurrentLevel && (
												<Badge className="gap-1 bg-primary text-primary-foreground">
													<CheckCircleIcon className="size-3" weight="fill" />
													<Trans>You</Trans>
												</Badge>
											)}
										</div>
										<span className="font-semibold">{formatCurrency(salary.baseSalary.median)}</span>
									</div>
									<div className="relative h-3 overflow-hidden rounded-full bg-muted">
										<motion.div
											initial={{ width: 0 }}
											animate={{ width: `${percentage}%` }}
											transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
											className={cn("h-full rounded-full", isCurrentLevel ? "bg-primary" : "bg-primary/50")}
										/>
									</div>
								</motion.div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</section>
	);
}

function RegionalDifferencesSection({
	regionalComparison,
	selectedRegion,
}: {
	regionalComparison: ReturnType<typeof getRegionalComparison>;
	selectedRegion: { id: string; label: string } | undefined;
}) {
	return (
		<section>
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
				<MapPinIcon className="size-6 text-primary" weight="duotone" />
				<Trans>Regional Differences</Trans>
			</h3>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{regionalComparison
					.sort((a, b) => b.salary - a.salary)
					.map((r, index) => {
						const isSelected = r.region === selectedRegion?.label;
						const topSalary = regionalComparison[0]?.salary || 0;
						const percentage = topSalary > 0 ? (r.salary / topSalary) * 100 : 0;

						return (
							<motion.div
								key={r.region}
								initial={false}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card className={cn("h-full transition-all hover:shadow-md", isSelected && "border-2 border-primary")}>
									<CardContent className="p-4">
										<div className="mb-3 flex items-center justify-between">
											<div className="flex items-center gap-2">
												<MapPinIcon className="size-4 text-muted-foreground" />
												<span className="font-medium">{r.region}</span>
												{isSelected && (
													<Badge variant="outline" className="text-xs">
														<Trans>Selected</Trans>
													</Badge>
												)}
											</div>
											{index === 0 && (
												<Badge className="bg-amber-500 text-white">
													<Trans>Top</Trans>
												</Badge>
											)}
										</div>
										<p className="mb-2 font-semibold text-xl">{formatCurrency(r.salary)}</p>
										<div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
											<motion.div
												initial={{ width: 0 }}
												animate={{ width: `${percentage}%` }}
												transition={{ duration: 0.6, delay: index * 0.05 }}
												className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
											/>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">
												<Trans>Cost of living</Trans>: {r.costOfLiving}%
											</span>
											<Badge
												variant="outline"
												className={cn(
													r.jobAvailability === "high" && "border-green-500 text-green-600 dark:text-green-400",
													r.jobAvailability === "medium" && "border-amber-500 text-amber-600 dark:text-amber-400",
													r.jobAvailability === "low" && "border-red-500 text-red-600 dark:text-red-400",
												)}
											>
												{r.jobAvailability === "high" && <Trans>Many jobs</Trans>}
												{r.jobAvailability === "medium" && <Trans>Moderate jobs</Trans>}
												{r.jobAvailability === "low" && <Trans>Few jobs</Trans>}
											</Badge>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
			</div>
		</section>
	);
}

function ProjectionTab({
	showResults,
	careerProjections,
	onGoToCalculator,
}: {
	showResults: boolean;
	careerProjections: ReturnType<typeof calculateCareerProjection>;
	onGoToCalculator: () => void;
}) {
	if (!showResults || careerProjections.length === 0) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center justify-center py-16">
					<TrendUpIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>No projections available</Trans>
					</h3>
					<p className="mb-4 text-center text-muted-foreground">
						<Trans>Calculate your salary first to see career projections</Trans>
					</p>
					<Button onClick={onGoToCalculator}>
						<ArrowRightIcon className="mr-2 size-4" />
						<Trans>Go to calculator</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<CareerGrowthSection careerProjections={careerProjections} />
			<CareerTipsSection />
			<CareerCtaCard />
		</>
	);
}

function CareerGrowthSection({
	careerProjections,
}: {
	careerProjections: ReturnType<typeof calculateCareerProjection>;
}) {
	return (
		<section>
			<h3 className="mb-2 font-semibold text-2xl">
				<Trans>5-Year Career Projection</Trans>
			</h3>
			<p className="mb-6 text-muted-foreground">
				<Trans>Estimate of your salary growth based on typical career progressions</Trans>
			</p>

			<Card className="overflow-hidden">
				<CardContent className="p-0">
					<div className="p-6">
						<div className="relative">
							<div className="absolute top-8 right-8 left-8 hidden h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 md:block" />

							<div className="grid gap-4 md:grid-cols-6">
								{careerProjections.map((proj, index) => {
									const isFirst = index === 0;
									const isLast = index === careerProjections.length - 1;
									const maxSalary = careerProjections[careerProjections.length - 1]?.salary || 1;
									const heightPercentage = (proj.salary / maxSalary) * 100;

									return (
										<motion.div
											key={proj.year}
											initial={false}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.1 }}
											className="text-center"
										>
											<div className="relative z-10 mb-4 hidden md:flex md:justify-center">
												<motion.div
													className={cn(
														"flex size-16 items-center justify-center rounded-full border-4 border-background shadow-lg",
														isFirst && "bg-green-500",
														isLast && "bg-amber-500",
														!isFirst && !isLast && "bg-primary",
													)}
													whileHover={{ scale: 1.1 }}
													transition={{ type: "spring", stiffness: 300 }}
												>
													<span className="font-bold text-white">{proj.year}</span>
												</motion.div>
											</div>

											<Card
												className={cn(
													"h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
													isFirst && "border-green-500/30",
													isLast && "border-amber-500/30",
												)}
											>
												<CardContent className="p-4">
													<p className="mb-1 font-bold text-lg md:hidden">{proj.year}</p>
													<p className="mb-2 line-clamp-2 text-muted-foreground text-sm">{proj.position}</p>
													<p
														className={cn(
															"mb-2 font-bold text-xl",
															isFirst && "text-green-600 dark:text-green-400",
															isLast && "text-amber-600 dark:text-amber-400",
														)}
													>
														{formatCurrency(proj.salary)}
													</p>
													{proj.growthRate > 0 && (
														<Badge className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
															<TrendUpIcon className="size-3" />+{proj.growthRate}%
														</Badge>
													)}

													<div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
														<motion.div
															initial={{ width: 0 }}
															animate={{ width: `${heightPercentage}%` }}
															transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
															className={cn(
																"h-full rounded-full",
																isFirst && "bg-green-500",
																isLast && "bg-amber-500",
																!isFirst && !isLast && "bg-primary",
															)}
														/>
													</div>
												</CardContent>
											</Card>
										</motion.div>
									);
								})}
							</div>
						</div>
					</div>

					<div className="border-t bg-muted/30 p-6">
						<div className="grid gap-4 md:grid-cols-3">
							<div className="text-center">
								<p className="text-muted-foreground text-sm">
									<Trans>Starting Salary</Trans>
								</p>
								<p className="font-bold text-2xl text-green-600 dark:text-green-400">
									{formatCurrency(careerProjections[0]?.salary || 0)}
								</p>
							</div>
							<div className="text-center">
								<p className="text-muted-foreground text-sm">
									<Trans>Salary at 5 Years</Trans>
								</p>
								<p className="font-bold text-2xl text-amber-600 dark:text-amber-400">
									{formatCurrency(careerProjections[careerProjections.length - 1]?.salary || 0)}
								</p>
							</div>
							<div className="text-center">
								<p className="text-muted-foreground text-sm">
									<Trans>Total Growth</Trans>
								</p>
								<p className="font-bold text-2xl text-primary">
									+
									{Math.round(
										(((careerProjections[careerProjections.length - 1]?.salary || 0) -
											(careerProjections[0]?.salary || 1)) /
											(careerProjections[0]?.salary || 1)) *
											100,
									)}
									%
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</section>
	);
}

function CareerTipsSection() {
	return (
		<section>
			<h3 className="mb-6 flex items-center gap-2 font-semibold text-xl">
				<SparkleIcon className="size-5 text-primary" weight="fill" />
				<Trans>Tips to Accelerate Your Progression</Trans>
			</h3>

			<div className="grid gap-4 md:grid-cols-2">
				{[
					{
						icon: MedalIcon,
						title: t`Additional Certifications`,
						description: t`Obtain recognized certifications to increase your market value`,
						color: "text-amber-500",
					},
					{
						icon: BuildingsIcon,
						title: t`Large Companies`,
						description: t`Multinational companies often offer 20-30% higher salaries`,
						color: "text-blue-500",
					},
					{
						icon: GlobeIcon,
						title: t`Geographic Mobility`,
						description: t`Casablanca and Rabat offer the best salary opportunities`,
						color: "text-green-500",
					},
					{
						icon: ChartLineUpIcon,
						title: t`Specialization`,
						description: t`Experts in a specific field are in high demand`,
						color: "text-purple-500",
					},
				].map((tip, index) => {
					const TipIcon = tip.icon;
					return (
						<motion.div
							key={tip.title}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card className="h-full transition-all hover:shadow-md">
								<CardContent className="flex items-start gap-4 p-4">
									<div
										className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted", tip.color)}
									>
										<TipIcon className="size-6" weight="duotone" />
									</div>
									<div>
										<h4 className="mb-1 font-semibold">{tip.title}</h4>
										<p className="text-muted-foreground text-sm">{tip.description}</p>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</section>
	);
}

function CareerCtaCard() {
	return (
		<Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
			<CardContent className="flex flex-col items-center py-8 text-center">
				<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
					<TrendUpIcon className="size-8 text-primary" weight="duotone" />
				</div>
				<h3 className="mb-2 font-bold text-2xl">
					<Trans>Plan Your Career</Trans>
				</h3>
				<p className="mb-6 max-w-md text-muted-foreground">
					<Trans>Discover our career guidance tool to find the ideal path for you.</Trans>
				</p>
				{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
				<Link to={"/dashboard/career" as any}>
					<Button size="lg" className="gap-2">
						<Trans>Career Guidance</Trans>
						<CaretRightIcon className="size-5" />
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}

function DisclaimerCard() {
	return (
		<Card className="mt-8 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
			<CardContent className="flex items-start gap-4 p-4">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
					<InfoIcon className="size-5" weight="fill" />
				</div>
				<div>
					<h4 className="mb-1 font-semibold text-amber-800 dark:text-amber-300">
						<Trans>Note on Estimates</Trans>
					</h4>
					<p className="text-amber-700 text-sm dark:text-amber-400">
						<Trans>
							These estimates are based on Moroccan market data from 2024. Actual salaries may vary depending on the
							company, individual negotiations, and economic conditions. For more detailed information, consult official
							salary surveys or contact industry professionals.
						</Trans>
					</p>
					<div className="mt-3 flex flex-wrap gap-2">
						{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
						<Link to={"/dashboard/career" as any}>
							<Button variant="outline" size="sm" className="gap-1">
								<ChartLineUpIcon className="size-4" />
								<Trans>Career Guidance</Trans>
							</Button>
						</Link>
						{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
						<Link to={"/dashboard/jobs" as any}>
							<Button variant="outline" size="sm" className="gap-1">
								<BuildingsIcon className="size-4" />
								<Trans>Job Offers</Trans>
							</Button>
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
