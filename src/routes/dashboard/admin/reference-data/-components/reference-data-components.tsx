import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowsClockwiseIcon,
	BookOpenIcon,
	BriefcaseIcon,
	BuildingsIcon,
	ChartLineUpIcon,
	ClipboardTextIcon,
	DatabaseIcon,
	GraduationCapIcon,
	HeartIcon,
	QuestionIcon,
	ShieldCheckIcon,
	SparkleIcon,
	SpinnerIcon,
	TrendUpIcon,
	WrenchIcon,
} from "@phosphor-icons/react";
import type { UseMutationResult } from "@tanstack/react-query";

// biome-ignore lint/suspicious/noExplicitAny: Seed mutations have complex inferred types from ORPC that vary between input/output shapes. Using `any` keeps prop interfaces readable while the actual type safety comes from the ORPC layer.
type SeedMutation = UseMutationResult<any, Error, any>;

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "../../../-components/header";
import {
	SEED_EMPLOYERS,
	SEED_IMTA_PROGRAMS,
	SEED_INTERVIEW_QUESTIONS,
	SEED_INTERVIEW_TIPS,
	SEED_MARKET_INSIGHTS,
	SEED_QUIZ_OPTIONS,
	SEED_QUIZ_QUESTIONS,
	SEED_SKILLS,
} from "./reference-data-config";
import type { FieldIconMap, QuizOptionMutationInput } from "./reference-data-types";

export const FIELD_ICONS: FieldIconMap = {
	healthcare: HeartIcon,
	industrial: WrenchIcon,
	hse: ShieldCheckIcon,
	general: BriefcaseIcon,
};

export function ReferenceDataSkeleton() {
	return (
		<div className="space-y-6">
			<DashboardHeader icon={DatabaseIcon} title={t`Reference Data`} />
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-10 w-32" />
				</div>
				<div className="flex gap-2">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-10 w-24" />
					))}
				</div>
				<Card>
					<CardContent className="p-6">
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<Skeleton key={i} className="h-32 rounded-lg" />
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

// --- Header with Seed All button ---

interface ReferenceDataPageHeaderProps {
	isSeeding: boolean;
	onSeedAll: () => void;
}

export function ReferenceDataPageHeader({ isSeeding, onSeedAll }: ReferenceDataPageHeaderProps) {
	return (
		<div className="flex items-center justify-between">
			<div>
				<h1 className="font-bold text-2xl">
					<Trans>Reference Data Management</Trans>
				</h1>
				<p className="text-muted-foreground">
					<Trans>Manage IMTA programs, interview tips, questions, and career data</Trans>
				</p>
			</div>
			<Button onClick={onSeedAll} disabled={isSeeding}>
				{isSeeding ? (
					<>
						<SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
						<Trans>Seeding...</Trans>
					</>
				) : (
					<>
						<DatabaseIcon className="mr-2 h-4 w-4" />
						<Trans>Seed All Data</Trans>
					</>
				)}
			</Button>
		</div>
	);
}

// --- Tab Navigation ---

interface ReferenceDataTabsProps {
	activeTab: string;
	onTabChange: (value: string) => void;
	children: React.ReactNode;
}

export function ReferenceDataTabs({ activeTab, onTabChange, children }: ReferenceDataTabsProps) {
	return (
		<Tabs value={activeTab} onValueChange={onTabChange}>
			<TabsList className="flex w-full flex-wrap gap-1">
				<TabsTrigger value="programs">
					<GraduationCapIcon className="mr-2 h-4 w-4" />
					<Trans>Programs</Trans>
				</TabsTrigger>
				<TabsTrigger value="tips">
					<BookOpenIcon className="mr-2 h-4 w-4" />
					<Trans>Tips</Trans>
				</TabsTrigger>
				<TabsTrigger value="questions">
					<QuestionIcon className="mr-2 h-4 w-4" />
					<Trans>Questions</Trans>
				</TabsTrigger>
				<TabsTrigger value="insights">
					<TrendUpIcon className="mr-2 h-4 w-4" />
					<Trans>Insights</Trans>
				</TabsTrigger>
				<TabsTrigger value="employers">
					<BuildingsIcon className="mr-2 h-4 w-4" />
					<Trans>Employers</Trans>
				</TabsTrigger>
				<TabsTrigger value="skills">
					<SparkleIcon className="mr-2 h-4 w-4" />
					<Trans>Skills</Trans>
				</TabsTrigger>
				<TabsTrigger value="quiz">
					<ClipboardTextIcon className="mr-2 h-4 w-4" />
					<Trans>Quiz</Trans>
				</TabsTrigger>
				<TabsTrigger value="job-market">
					<ChartLineUpIcon className="mr-2 h-4 w-4" />
					<Trans>Job Market</Trans>
				</TabsTrigger>
			</TabsList>
			{children}
		</Tabs>
	);
}

// --- Shared loading / empty state helpers ---

function TabLoading() {
	return (
		<div className="flex justify-center py-8">
			<SpinnerIcon className="h-8 w-8 animate-spin" />
		</div>
	);
}

function TabEmpty({ message }: { message: string }) {
	return <div className="py-8 text-center text-muted-foreground">{message}</div>;
}

interface SeedButtonProps {
	label: React.ReactNode;
	isPending: boolean;
	onClick: () => void;
}

function SeedButton({ label, isPending, onClick }: SeedButtonProps) {
	return (
		<Button variant="outline" onClick={onClick} disabled={isPending}>
			{isPending ? <SpinnerIcon className="h-4 w-4 animate-spin" /> : <ArrowsClockwiseIcon className="mr-2 h-4 w-4" />}
			{label}
		</Button>
	);
}

// --- Programs Tab ---

interface ProgramsTabProps {
	programs:
		| Array<{
				id: string;
				name: string;
				nameFr: string;
				field: string;
				duration: string;
				durationFr: string;
				isActive: boolean;
				successRate: number | null;
				employmentRate: number | null;
		  }>
		| undefined;
	isLoading: boolean;
	seedMutation: SeedMutation;
}

export function ProgramsTab({ programs, isLoading, seedMutation }: ProgramsTabProps) {
	return (
		<TabsContent value="programs" className="mt-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>
							<Trans>IMTA Programs</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Training programs offered at IMTA</Trans>
						</CardDescription>
					</div>
					<SeedButton
						label={<Trans>Seed Programs</Trans>}
						isPending={seedMutation.isPending}
						onClick={() => seedMutation.mutate(SEED_IMTA_PROGRAMS)}
					/>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<TabLoading />
					) : programs?.length === 0 ? (
						<TabEmpty message={t`No programs found. Click "Seed Programs" to add initial data.`} />
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{programs?.map((program) => {
								const FieldIcon = FIELD_ICONS[program.field] || BriefcaseIcon;
								return (
									<Card key={program.id} className="relative">
										<CardHeader className="pb-2">
											<div className="flex items-center gap-2">
												<FieldIcon className="h-5 w-5" />
												<CardTitle className="text-base">{program.name}</CardTitle>
											</div>
											<CardDescription>{program.name || program.nameFr}</CardDescription>
										</CardHeader>
										<CardContent className="pt-2">
											<div className="flex flex-wrap gap-1">
												<Badge variant="outline">{program.field}</Badge>
												<Badge variant="secondary">{program.duration || program.durationFr}</Badge>
												{program.isActive ? (
													<Badge className="bg-green-500">Active</Badge>
												) : (
													<Badge variant="destructive">Inactive</Badge>
												)}
											</div>
											{program.successRate && (
												<p className="mt-2 text-muted-foreground text-sm">
													Success: {program.successRate}% | Employment: {program.employmentRate}%
												</p>
											)}
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// --- Tips Tab ---

interface TipsTabProps {
	tips:
		| Array<{
				id: string;
				title: string;
				titleFr: string;
				content: string;
				contentFr: string;
				category: string;
				tags: unknown;
		  }>
		| undefined;
	isLoading: boolean;
	seedMutation: SeedMutation;
}

export function TipsTab({ tips, isLoading, seedMutation }: TipsTabProps) {
	return (
		<TabsContent value="tips" className="mt-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>
							<Trans>Interview Tips</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Preparation and interview guidance</Trans>
						</CardDescription>
					</div>
					<SeedButton
						label={<Trans>Seed Tips</Trans>}
						isPending={seedMutation.isPending}
						onClick={() => seedMutation.mutate(SEED_INTERVIEW_TIPS)}
					/>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<TabLoading />
					) : tips?.length === 0 ? (
						<TabEmpty message={t`No tips found. Click "Seed Tips" to add initial data.`} />
					) : (
						<div className="space-y-4">
							{tips?.map((tip) => (
								<Card key={tip.id}>
									<CardHeader className="pb-2">
										<div className="flex items-center justify-between">
											<CardTitle className="text-base">{tip.title || tip.titleFr}</CardTitle>
											<Badge variant="outline">{tip.category}</Badge>
										</div>
									</CardHeader>
									<CardContent className="pt-2">
										<p className="text-muted-foreground text-sm">{tip.content || tip.contentFr}</p>
										{Array.isArray(tip.tags) && (tip.tags as string[]).length > 0 && (
											<div className="mt-2 flex flex-wrap gap-1">
												{(tip.tags as string[]).map((tag) => (
													<Badge key={tag} variant="secondary" className="text-xs">
														{tag}
													</Badge>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// --- Questions Tab ---

interface QuestionsTabProps {
	questions:
		| Array<{
				id: string;
				questionFr: string | null;
				type: string;
				field: string;
				difficulty: string | null;
				sampleAnswerFr: string | null;
		  }>
		| undefined;
	isLoading: boolean;
	seedMutation: SeedMutation;
}

export function QuestionsTab({ questions, isLoading, seedMutation }: QuestionsTabProps) {
	return (
		<TabsContent value="questions" className="mt-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>
							<Trans>Common Interview Questions</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Sample questions with answers and tips</Trans>
						</CardDescription>
					</div>
					<SeedButton
						label={<Trans>Seed Questions</Trans>}
						isPending={seedMutation.isPending}
						onClick={() => seedMutation.mutate(SEED_INTERVIEW_QUESTIONS)}
					/>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<TabLoading />
					) : questions?.length === 0 ? (
						<TabEmpty message={t`No questions found. Click "Seed Questions" to add initial data.`} />
					) : (
						<div className="space-y-4">
							{questions?.map((q) => (
								<Card key={q.id}>
									<CardHeader className="pb-2">
										<div className="flex items-center justify-between">
											<CardTitle className="text-base">{q.questionFr}</CardTitle>
											<div className="flex gap-1">
												<Badge variant="outline">{q.type}</Badge>
												<Badge variant="secondary">{q.field}</Badge>
												<Badge>{q.difficulty}</Badge>
											</div>
										</div>
									</CardHeader>
									<CardContent className="pt-2">
										{q.sampleAnswerFr && <p className="text-muted-foreground text-sm">{q.sampleAnswerFr}</p>}
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// --- Insights Tab ---

interface InsightsTabProps {
	insights:
		| Array<{
				id: string;
				value: string;
				title: string;
				titleFr: string;
				description: string | null;
				descriptionFr: string | null;
		  }>
		| undefined;
	isLoading: boolean;
	seedMutation: SeedMutation;
}

export function InsightsTab({ insights, isLoading, seedMutation }: InsightsTabProps) {
	return (
		<TabsContent value="insights" className="mt-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>
							<Trans>Market Insights</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Career market statistics and trends</Trans>
						</CardDescription>
					</div>
					<SeedButton
						label={<Trans>Seed Insights</Trans>}
						isPending={seedMutation.isPending}
						onClick={() => seedMutation.mutate(SEED_MARKET_INSIGHTS)}
					/>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<TabLoading />
					) : insights?.length === 0 ? (
						<TabEmpty message={t`No insights found. Click "Seed Insights" to add initial data.`} />
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							{insights?.map((insight) => (
								<Card key={insight.id}>
									<CardHeader className="pb-2">
										<CardTitle className="font-bold text-2xl">{insight.value}</CardTitle>
										<CardDescription>{insight.title || insight.titleFr}</CardDescription>
									</CardHeader>
									<CardContent className="pt-2">
										<p className="text-muted-foreground text-sm">{insight.description || insight.descriptionFr}</p>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// --- Employers Tab ---

interface EmployersTabProps {
	employers:
		| Array<{
				id: string;
				name: string;
				sectorFr: string | null;
				location: string;
				locationFr: string | null;
				openPositions: number | null;
				fields: unknown;
		  }>
		| undefined;
	isLoading: boolean;
	seedMutation: SeedMutation;
}

export function EmployersTab({ employers, isLoading, seedMutation }: EmployersTabProps) {
	return (
		<TabsContent value="employers" className="mt-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>
							<Trans>Top Employers</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Companies hiring IMTA graduates</Trans>
						</CardDescription>
					</div>
					<SeedButton
						label={<Trans>Seed Employers</Trans>}
						isPending={seedMutation.isPending}
						onClick={() => seedMutation.mutate(SEED_EMPLOYERS)}
					/>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<TabLoading />
					) : employers?.length === 0 ? (
						<TabEmpty message={t`No employers found. Click "Seed Employers" to add initial data.`} />
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{employers?.map((employer) => (
								<Card key={employer.id}>
									<CardHeader className="pb-2">
										<CardTitle className="text-base">{employer.name}</CardTitle>
										<CardDescription>{employer.sectorFr}</CardDescription>
									</CardHeader>
									<CardContent className="pt-2">
										<p className="text-muted-foreground text-sm">{employer.location}</p>
										{employer.openPositions && employer.openPositions > 0 && (
											<Badge className="mt-2">{employer.openPositions} positions</Badge>
										)}
										<div className="mt-2 flex flex-wrap gap-1">
											{(employer.fields as string[]).map((field) => (
												<Badge key={field} variant="outline" className="text-xs">
													{field}
												</Badge>
											))}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// --- Skills Tab ---

interface SkillsTabProps {
	skills:
		| Array<{
				id: string;
				name: string;
				nameFr: string;
				field: string;
				category: string;
		  }>
		| undefined;
	isLoading: boolean;
	seedMutation: SeedMutation;
}

export function SkillsTab({ skills, isLoading, seedMutation }: SkillsTabProps) {
	return (
		<TabsContent value="skills" className="mt-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>
							<Trans>Skill Library</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Recommended skills by field and category</Trans>
						</CardDescription>
					</div>
					<SeedButton
						label={<Trans>Seed Skills</Trans>}
						isPending={seedMutation.isPending}
						onClick={() => seedMutation.mutate(SEED_SKILLS)}
					/>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<TabLoading />
					) : skills?.length === 0 ? (
						<TabEmpty message={t`No skills found. Click "Seed Skills" to add initial data.`} />
					) : (
						<div className="space-y-6">
							{["healthcare", "industrial", "hse"].map((field) => {
								const fieldSkills = skills?.filter((s) => s.field === field) || [];
								if (fieldSkills.length === 0) return null;
								const FieldIcon = FIELD_ICONS[field];
								return (
									<div key={field}>
										<div className="mb-3 flex items-center gap-2">
											<FieldIcon className="h-5 w-5" />
											<h3 className="font-semibold capitalize">{field}</h3>
											<Badge variant="secondary">{fieldSkills.length} skills</Badge>
										</div>
										<div className="flex flex-wrap gap-2">
											{fieldSkills.map((skill) => (
												<Badge key={skill.id} variant="outline">
													{skill.name || skill.nameFr} ({skill.category})
												</Badge>
											))}
										</div>
										<Separator className="mt-4" />
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// --- Quiz Tab ---

interface QuizTabProps {
	quizQuestions:
		| Array<{
				id: string;
				quizType: string;
				question: string;
				questionFr: string | null;
				category: string;
				type: string;
				options?: Array<{
					id: string;
					text: string;
					textFr: string | null;
				}>;
		  }>
		| undefined;
	isLoading: boolean;
	seedQuestionsMutation: SeedMutation;
	seedOptionsMutation: SeedMutation;
}

export function QuizTab({ quizQuestions, isLoading, seedQuestionsMutation, seedOptionsMutation }: QuizTabProps) {
	return (
		<TabsContent value="quiz" className="mt-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>
							<Trans>Career Quiz Questions</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Questions for career assessment, quiz, and remote readiness</Trans>
						</CardDescription>
					</div>
					<div className="flex gap-2">
						<SeedButton
							label={<Trans>Seed Questions</Trans>}
							isPending={seedQuestionsMutation.isPending}
							onClick={() => seedQuestionsMutation.mutate(SEED_QUIZ_QUESTIONS)}
						/>
						<SeedButton
							label={<Trans>Seed Options</Trans>}
							isPending={seedOptionsMutation.isPending}
							onClick={() => seedOptionsMutation.mutate(SEED_QUIZ_OPTIONS as QuizOptionMutationInput)}
						/>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<TabLoading />
					) : quizQuestions?.length === 0 ? (
						<TabEmpty
							message={t`No quiz questions found. Click "Seed Questions" then "Seed Options" to add initial data.`}
						/>
					) : (
						<div className="space-y-6">
							{["career_assessment", "career_quiz", "remote_readiness"].map((quizType) => {
								const typeQuestions = quizQuestions?.filter((q) => q.quizType === quizType) || [];
								if (typeQuestions.length === 0) return null;

								const typeLabels: Record<string, string> = {
									career_assessment: "Career Assessment",
									career_quiz: "Career Quiz",
									remote_readiness: "Remote Readiness",
								};

								return (
									<div key={quizType}>
										<div className="mb-3 flex items-center gap-2">
											<ClipboardTextIcon className="h-5 w-5" />
											<h3 className="font-semibold">{typeLabels[quizType]}</h3>
											<Badge variant="secondary">{typeQuestions.length} questions</Badge>
										</div>
										<div className="grid gap-3 md:grid-cols-2">
											{typeQuestions.map((question) => (
												<Card key={question.id} className="p-3">
													<div className="mb-2 flex items-center justify-between">
														<Badge variant="outline" className="text-xs">
															{question.category}
														</Badge>
														<Badge variant={question.type === "scale" ? "secondary" : "default"} className="text-xs">
															{question.type}
														</Badge>
													</div>
													<p className="mb-2 font-medium text-sm">{question.question}</p>
													{question.options && question.options.length > 0 && (
														<div className="flex flex-wrap gap-1">
															{question.options.map((opt) => (
																<Badge key={opt.id} variant="outline" className="text-xs">
																	{opt.text}
																</Badge>
															))}
														</div>
													)}
												</Card>
											))}
										</div>
										<Separator className="mt-4" />
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

// --- Job Market Tab (insightsService data: industry trends, salary benchmarks, etc.) ---

interface JobMarketTabProps {
	industryTrendCount: number | undefined;
	isLoading: boolean;
	seedMutation: SeedMutation;
}

export function JobMarketTab({ industryTrendCount, isLoading, seedMutation }: JobMarketTabProps) {
	const hasData = (industryTrendCount ?? 0) > 0;

	return (
		<TabsContent value="job-market" className="mt-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>
							<Trans>Job Market Insights Data</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>
								Moroccan market data: industry trends, salary benchmarks, job demand indicators, skills heatmap, company
								hiring, remote work stats, growth projections, competitive landscape, and regional comparisons. Uses
								auto-seed guard - only seeds when database is empty.
							</Trans>
						</CardDescription>
					</div>
					<SeedButton
						label={<Trans>Seed Insights Data</Trans>}
						isPending={seedMutation.isPending}
						onClick={() => seedMutation.mutate(undefined)}
					/>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<TabLoading />
					) : hasData ? (
						<div className="space-y-4">
							<div className="flex items-center gap-3 rounded-lg border p-4">
								<ChartLineUpIcon className="h-8 w-8 text-green-500" />
								<div>
									<p className="font-semibold">
										<Trans>Insights data is populated</Trans>
									</p>
									<p className="text-muted-foreground text-sm">
										{industryTrendCount}{" "}
										<Trans>
											industry trends found. The seed button uses an auto-guard and will skip seeding if data already
											exists.
										</Trans>
									</p>
								</div>
								<Badge className="ml-auto bg-green-500">
									<Trans>Active</Trans>
								</Badge>
							</div>
							<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
								{[
									{ label: t`Industry Trends`, desc: t`6 Moroccan industries tracked` },
									{ label: t`Salary Benchmarks`, desc: t`10 role/region/experience combinations` },
									{ label: t`Job Demand Indicators`, desc: t`10 in-demand skills` },
									{ label: t`Skills Heatmap`, desc: t`8 skills across 6 industries` },
									{ label: t`Company Hiring Trends`, desc: t`8 major Moroccan companies` },
									{ label: t`Remote Work Stats`, desc: t`Remote/hybrid/onsite breakdown per industry` },
									{ label: t`Growth Projections`, desc: t`2025-2028 industry forecasts` },
									{ label: t`Competitive Landscape`, desc: t`Market leaders and emerging players` },
									{ label: t`Regional Comparisons`, desc: t`8 Moroccan regions compared` },
								].map((item) => (
									<div key={item.label} className="rounded-lg border p-3">
										<p className="font-medium text-sm">{item.label}</p>
										<p className="text-muted-foreground text-xs">{item.desc}</p>
									</div>
								))}
							</div>
						</div>
					) : (
						<div className="space-y-4">
							<TabEmpty
								message={t`No job market insights data found. Click "Seed Insights Data" to populate with Moroccan market data.`}
							/>
							<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
								{[
									{ label: t`Industry Trends`, desc: t`Healthcare, Tech, Industrial, HSE, Automotive, Services` },
									{ label: t`Salary Benchmarks`, desc: t`10 roles with min/max/median by region` },
									{ label: t`Job Demand Indicators`, desc: t`Top 10 most in-demand skills` },
									{ label: t`Skills Heatmap`, desc: t`Cross-industry skill demand matrix` },
									{ label: t`Company Hiring Trends`, desc: t`OCP, Renault, Capgemini, Stellantis, and more` },
									{ label: t`Regional Comparisons`, desc: t`Casablanca, Rabat, Tanger, Marrakech, and more` },
								].map((item) => (
									<div key={item.label} className="rounded-lg border border-dashed p-3 opacity-60">
										<p className="font-medium text-sm">{item.label}</p>
										<p className="text-muted-foreground text-xs">{item.desc}</p>
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}
