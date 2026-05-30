import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	BookmarkIcon,
	BookmarkSimpleIcon,
	BriefcaseIcon,
	BuildingsIcon,
	CalendarIcon,
	CaretDownIcon,
	CaretRightIcon,
	CaretUpIcon,
	ChartBarIcon,
	ChatCircleDotsIcon,
	CheckCircleIcon,
	ClockIcon,
	CurrencyCircleDollarIcon,
	GlobeIcon,
	GraduationCapIcon,
	HandshakeIcon,
	HeartIcon,
	LightbulbIcon,
	LinkedinLogoIcon,
	MagnifyingGlassIcon,
	MapPinIcon,
	NewspaperIcon,
	QuestionIcon,
	ScalesIcon,
	SparkleIcon,
	StarIcon,
	TrendUpIcon,
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CompanyIndustry } from "@/integrations/drizzle/schema";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/utils/style";
import { industryConfig } from "./research-data";
import type { Company } from "./research-types";

// --- Utility functions ---

const formatCurrency = (amount: number) => `${amount.toLocaleString()} DH`;

const getCategoryColor = (category: string) => {
	switch (category) {
		case "behavioral":
			return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
		case "technical":
			return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
		case "situational":
			return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
		default:
			return "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400";
	}
};

const getDifficultyLabel = (difficulty: string) => {
	switch (difficulty) {
		case "easy":
			return { label: "Facile", color: "text-green-600 dark:text-green-400" };
		case "medium":
			return { label: "Moyen", color: "text-amber-600 dark:text-amber-400" };
		case "hard":
			return { label: "Difficile", color: "text-red-600 dark:text-red-400" };
		default:
			return { label: difficulty, color: "text-gray-600" };
	}
};

const getNewsTypeIcon = (type: string): Icon => {
	switch (type) {
		case "announcement":
			return NewspaperIcon;
		case "award":
			return StarIcon;
		case "partnership":
			return HandshakeIcon;
		case "hiring":
			return UsersIcon;
		default:
			return NewspaperIcon;
	}
};

// --- Company Detail View ---

type CompanyDetailViewProps = {
	company: Company;
	favoriteIds: string[];
	activeTab: string;
	setActiveTab: (tab: string) => void;
	expandedQuestions: string[];
	toggleQuestion: (questionId: string) => void;
	toggleFavorite: (companyId: string) => void;
	toggleFavoritePending: boolean;
	onBack: () => void;
};

export function CompanyDetailView({
	company,
	favoriteIds,
	activeTab,
	setActiveTab,
	expandedQuestions,
	toggleQuestion,
	toggleFavorite,
	toggleFavoritePending,
	onBack,
}: CompanyDetailViewProps) {
	const industryInfo = industryConfig[company.industry];
	const IndustryIcon = industryInfo.icon;
	const isFavorite = favoriteIds.includes(company.id);

	return (
		<>
			{/* Back button and company header */}
			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="mb-6">
				<Button variant="ghost" className="mb-4 gap-2" onClick={onBack}>
					<CaretRightIcon className="size-4 rotate-180" />
					<Trans>Retour aux résultats</Trans>
				</Button>

				<Card className="overflow-hidden">
					<div
						className="h-32 w-full"
						style={{
							background: `linear-gradient(135deg, ${industryInfo.color.includes("red") ? "oklch(0.65 0.18 25)" : industryInfo.color.includes("blue") ? "oklch(0.65 0.18 230)" : industryInfo.color.includes("amber") ? "oklch(0.65 0.18 85)" : industryInfo.color.includes("purple") ? "oklch(0.65 0.18 280)" : "oklch(0.65 0.18 150)"} / 0.3) 0%, transparent 100%)`,
						}}
					/>
					<CardContent className="relative -mt-16 pb-6">
						<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
							<div className="flex items-end gap-4">
								<div
									className={cn(
										"flex size-24 items-center justify-center rounded-2xl border-4 border-background shadow-lg",
										industryInfo.color,
									)}
								>
									<IndustryIcon className="size-12" weight="duotone" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<h1 className="font-bold text-2xl md:text-3xl">{company.name}</h1>
										<Badge className={industryInfo.color}>{industryInfo.label}</Badge>
									</div>
									<p className="flex items-center gap-2 text-muted-foreground">
										<MapPinIcon className="size-4" />
										{company.headquarters}
										<span className="mx-2">|</span>
										<UsersIcon className="size-4" />
										{company.employeeCount} <Trans>employés</Trans>
										<span className="mx-2">|</span>
										<CalendarIcon className="size-4" />
										<Trans>Créée en</Trans> {company.founded}
									</p>
								</div>
							</div>
							<div className="flex gap-2">
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant={isFavorite ? "default" : "outline"}
											size="icon"
											onClick={() => toggleFavorite(company.id)}
											disabled={toggleFavoritePending}
										>
											{isFavorite ? (
												<BookmarkIcon className="size-5" weight="fill" />
											) : (
												<BookmarkSimpleIcon className="size-5" />
											)}
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										{isFavorite ? <Trans>Retirer des favoris</Trans> : <Trans>Ajouter aux favoris</Trans>}
									</TooltipContent>
								</Tooltip>
								{company.website && (
									<Button variant="outline" size="icon" asChild>
										<a href={company.website} target="_blank" rel="noopener noreferrer">
											<GlobeIcon className="size-5" />
										</a>
									</Button>
								)}
								{company.linkedIn && (
									<Button variant="outline" size="icon" asChild>
										<a href={company.linkedIn} target="_blank" rel="noopener noreferrer">
											<LinkedinLogoIcon className="size-5" />
										</a>
									</Button>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "overview", icon: BuildingsIcon, label: "Aperçu" },
						{ value: "culture", icon: HeartIcon, label: "Culture" },
						{ value: "reviews", icon: ChatCircleDotsIcon, label: "Avis" },
						{ value: "interview", icon: QuestionIcon, label: "Entretiens" },
						{ value: "salaries", icon: CurrencyCircleDollarIcon, label: "Salaires" },
						{ value: "benefits", icon: GraduationCapIcon, label: "Avantages" },
						{ value: "news", icon: NewspaperIcon, label: "Actualités" },
						{ value: "people", icon: UserCircleIcon, label: "Dirigeants" },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					<OverviewTab company={company} />
				</TabsContent>

				{/* Culture Tab */}
				<TabsContent value="culture" className="space-y-6">
					<CultureTab company={company} />
				</TabsContent>

				{/* Reviews Tab */}
				<TabsContent value="reviews" className="space-y-6">
					<ReviewsTab company={company} />
				</TabsContent>

				{/* Interview Tab */}
				<TabsContent value="interview" className="space-y-6">
					<InterviewTab company={company} expandedQuestions={expandedQuestions} toggleQuestion={toggleQuestion} />
				</TabsContent>

				{/* Salaries Tab */}
				<TabsContent value="salaries" className="space-y-6">
					<SalariesTab company={company} />
				</TabsContent>

				{/* Benefits Tab */}
				<TabsContent value="benefits" className="space-y-6">
					<BenefitsTab company={company} />
				</TabsContent>

				{/* News Tab */}
				<TabsContent value="news" className="space-y-6">
					<NewsTab company={company} />
				</TabsContent>

				{/* Key People Tab */}
				<TabsContent value="people" className="space-y-6">
					<KeyPeopleTab company={company} />
				</TabsContent>
			</Tabs>
		</>
	);
}

// --- Detail Tab Components ---

function OverviewTab({ company }: { company: Company }) {
	return (
		<>
			<div className="grid gap-6 lg:grid-cols-3">
				{/* About */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>
							<Trans>About</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground">{company.description}</p>
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<p className="font-medium text-sm">
									<Trans>Mission</Trans>
								</p>
								<p className="text-muted-foreground text-sm">{company.mission}</p>
							</div>
							<div>
								<p className="font-medium text-sm">
									<Trans>Vision</Trans>
								</p>
								<p className="text-muted-foreground text-sm">{company.vision}</p>
							</div>
						</div>
						{company.revenue && (
							<div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
								<CurrencyCircleDollarIcon className="size-5 text-green-600" weight="duotone" />
								<span className="font-medium text-green-700 dark:text-green-400">CA: {company.revenue}</span>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Quick Stats */}
				<Card>
					<CardHeader>
						<CardTitle>
							<Trans>Statistics</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">
								<Trans>Overall rating</Trans>
							</span>
							<div className="flex items-center gap-1">
								<StarIcon className="size-4 text-amber-500" weight="fill" />
								<span className="font-bold">{company.reviewsAverageRating.toFixed(1)}</span>
							</div>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">
								<Trans>Recommend</Trans>
							</span>
							<span className="font-bold text-green-600">{company.reviewsRecommendRate}%</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">
								<Trans>Culture score</Trans>
							</span>
							<span className="font-bold">{company.cultureOverallScore}/100</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">
								<Trans>Interview difficulty</Trans>
							</span>
							<span className="font-bold">{company.interviewDifficulty.toFixed(1)}/5</span>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Values */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HeartIcon className="size-5 text-red-500" weight="fill" />
						<Trans>Valeurs de l'entreprise</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{company.cultureValues.map((value, index) => (
							<motion.div
								key={value.value}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								className="rounded-lg border bg-muted/30 p-4"
							>
								<h4 className="mb-2 font-semibold">{value.value}</h4>
								<p className="text-muted-foreground text-sm">{value.description}</p>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>
		</>
	);
}

function CultureTab({ company }: { company: Company }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span className="flex items-center gap-2">
						<ChartBarIcon className="size-5 text-primary" />
						<Trans>Culture d'entreprise</Trans>
					</span>
					<Badge className="bg-primary/10 text-primary">Overall score: {company.cultureOverallScore}/100</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{company.cultureInsights.map((insight, index) => (
					<motion.div
						key={insight.category}
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.1 }}
						className="space-y-2"
					>
						<div className="flex items-center justify-between">
							<span className="font-medium">{insight.category}</span>
							<span
								className={cn(
									"font-bold",
									insight.score >= 80 ? "text-green-600" : insight.score >= 60 ? "text-amber-600" : "text-red-600",
								)}
							>
								{insight.score}/100
							</span>
						</div>
						<Progress value={insight.score} className="h-2" />
						<p className="text-muted-foreground text-sm">{insight.description}</p>
					</motion.div>
				))}
			</CardContent>
		</Card>
	);
}

function ReviewsTab({ company }: { company: Company }) {
	return (
		<>
			{/* Summary */}
			<div className="grid gap-4 sm:grid-cols-4">
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-6">
						<div className="flex items-center gap-1">
							<StarIcon className="size-8 text-amber-500" weight="fill" />
							<span className="font-bold text-4xl">{company.reviewsAverageRating.toFixed(1)}</span>
						</div>
						<p className="text-muted-foreground text-sm">
							{company.reviewsTotalCount} <Trans>avis</Trans>
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-6">
						<span className="font-bold text-3xl text-green-600">{company.reviewsRecommendRate}%</span>
						<p className="text-muted-foreground text-sm">
							<Trans>Recommend</Trans>
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-6">
						<span className="font-bold text-3xl text-blue-600">{company.reviewsCeoApprovalRate}%</span>
						<p className="text-muted-foreground text-sm">
							<Trans>Approve of CEO</Trans>
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-6">
						<span className="font-bold text-3xl">{company.reviews.length}</span>
						<p className="text-muted-foreground text-sm">
							<Trans>Avis récents</Trans>
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Reviews List */}
			<div className="space-y-4">
				{company.reviews.map((review, index) => (
					<motion.div
						key={review.id}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card>
							<CardContent className="p-6">
								<div className="mb-4 flex flex-wrap items-start justify-between gap-2">
									<div>
										<h4 className="font-semibold text-lg">{review.title}</h4>
										<p className="text-muted-foreground text-sm">
											{review.position} | {formatDate(review.date)}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<div className="flex items-center gap-1">
											{[1, 2, 3, 4, 5].map((star) => (
												<StarIcon
													key={star}
													className={cn(
														"size-4",
														star <= review.rating ? "text-amber-500" : "text-muted-foreground/30",
													)}
													weight={star <= review.rating ? "fill" : "regular"}
												/>
											))}
										</div>
										<span className="font-bold">{review.rating.toFixed(1)}</span>
									</div>
								</div>

								<div className="grid gap-4 md:grid-cols-2">
									<div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
										<p className="mb-2 flex items-center gap-2 font-medium text-green-700 text-sm dark:text-green-400">
											<CheckCircleIcon className="size-4" weight="fill" />
											<Trans>Positives</Trans>
										</p>
										<p className="text-green-800 text-sm dark:text-green-300">{review.pros}</p>
									</div>
									<div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
										<p className="mb-2 flex items-center gap-2 font-medium text-red-700 text-sm dark:text-red-400">
											<XIcon className="size-4" weight="bold" />
											<Trans>Negatives</Trans>
										</p>
										<p className="text-red-800 text-sm dark:text-red-300">{review.cons}</p>
									</div>
								</div>

								{review.advice && (
									<div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
										<p className="mb-2 flex items-center gap-2 font-medium text-blue-700 text-sm dark:text-blue-400">
											<LightbulbIcon className="size-4" weight="fill" />
											<Trans>Advice to management</Trans>
										</p>
										<p className="text-blue-800 text-sm dark:text-blue-300">{review.advice}</p>
									</div>
								)}

								<div className="mt-4 flex gap-4">
									<Badge
										className={
											review.recommend
												? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
												: "bg-red-100 text-red-700"
										}
									>
										{review.recommend ? <Trans>Recommended</Trans> : <Trans>Does not recommend</Trans>}
									</Badge>
									<Badge
										className={
											review.approveOfCEO
												? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
												: "bg-gray-100 text-gray-700"
										}
									>
										{review.approveOfCEO ? <Trans>Approves of CEO</Trans> : <Trans>Does not approve of CEO</Trans>}
									</Badge>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</>
	);
}

type InterviewTabProps = {
	company: Company;
	expandedQuestions: string[];
	toggleQuestion: (questionId: string) => void;
};

function InterviewTab({ company, expandedQuestions, toggleQuestion }: InterviewTabProps) {
	return (
		<>
			{/* Process Overview */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ClockIcon className="size-5 text-primary" />
						<Trans>Interview Process</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-6 grid gap-4 sm:grid-cols-3">
						<div className="text-center">
							<p className="font-bold text-2xl text-primary">{company.interviewDifficulty.toFixed(1)}/5</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Average difficulty</Trans>
							</p>
						</div>
						<div className="text-center">
							<p className="font-bold text-2xl">{company.interviewAverageDuration || "-"}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Process duration</Trans>
							</p>
						</div>
						<div className="text-center">
							<p className="font-bold text-2xl">{company.interviewProcessSteps.length}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Steps</Trans>
							</p>
						</div>
					</div>

					<div className="flex flex-wrap items-center justify-center gap-2">
						{company.interviewProcessSteps.map((step, index) => (
							<div key={step} className="flex items-center gap-2">
								<Badge variant="outline" className="px-4 py-2">
									{index + 1}. {step}
								</Badge>
								{index < company.interviewProcessSteps.length - 1 && (
									<ArrowRightIcon className="size-4 text-muted-foreground" />
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Tips */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<LightbulbIcon className="size-5 text-amber-500" weight="fill" />
						<Trans>Interview Tips</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 sm:grid-cols-2">
						{company.interviewTips.map((tip, index) => (
							<motion.div
								key={tip.tip}
								initial={false}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: index * 0.1 }}
								className="flex items-start gap-3 rounded-lg border bg-amber-50/50 p-4 dark:bg-amber-900/10"
							>
								<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-amber-600" weight="fill" />
								<div>
									<Badge className="mb-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
										{tip.category}
									</Badge>
									<p className="text-sm">{tip.tip}</p>
								</div>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Common Questions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<QuestionIcon className="size-5 text-purple-500" />
						<Trans>Questions fréquentes</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Questions posées par d'anciens candidats</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{company.interviewQuestions.map((question) => {
						const difficulty = getDifficultyLabel(question.difficulty);
						const isExpanded = expandedQuestions.includes(question.id);
						return (
							<motion.div key={question.id} initial={false} animate={{ opacity: 1 }} className="rounded-lg border">
								<button
									type="button"
									onClick={() => toggleQuestion(question.id)}
									className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
								>
									<div className="flex items-center gap-3">
										<Badge className={getCategoryColor(question.category)}>
											{question.category === "behavioral" && "Behavioral"}
											{question.category === "technical" && "Technical"}
											{question.category === "situational" && "Situational"}
											{question.category === "general" && "General"}
										</Badge>
										<span className="font-medium">{question.question}</span>
									</div>
									<div className="flex items-center gap-3">
										<span className={cn("text-sm", difficulty.color)}>{difficulty.label}</span>
										{isExpanded ? (
											<CaretUpIcon className="size-5 text-muted-foreground" />
										) : (
											<CaretDownIcon className="size-5 text-muted-foreground" />
										)}
									</div>
								</button>
								<AnimatePresence>
									{isExpanded && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											className="overflow-hidden"
										>
											<div className="border-t bg-muted/30 px-4 py-3">
												<div className="flex items-center gap-4 text-muted-foreground text-sm">
													<span className="flex items-center gap-1">
														<TrendUpIcon className="size-4" />
														{question.frequency}% des of candidates were asked this question
													</span>
												</div>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						);
					})}
				</CardContent>
			</Card>
		</>
	);
}

function SalariesTab({ company }: { company: Company }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CurrencyCircleDollarIcon className="size-5 text-green-500" weight="duotone" />
					<Trans>Grille salariale</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Monthly salaries reported by employees (in DH)</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{company.salaries.map((salary, index) => (
						<motion.div
							key={salary.role}
							initial={false}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 }}
							className="space-y-3"
						>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<div>
									<h4 className="font-semibold">{salary.role}</h4>
									<p className="text-muted-foreground text-sm">
										{salary.sampleSize} <Trans>responses</Trans>
									</p>
								</div>
								<div className="text-right">
									<p className="font-bold text-green-600 text-xl">{formatCurrency(salary.medianSalary)}</p>
									<p className="text-muted-foreground text-sm">
										{formatCurrency(salary.minSalary)} - {formatCurrency(salary.maxSalary)}
									</p>
								</div>
							</div>
							{/* Visual range */}
							<div className="relative h-8 rounded-full bg-muted">
								<div
									className="absolute inset-y-0 rounded-full bg-gradient-to-r from-green-400/50 to-green-500/50"
									style={{
										left: "0%",
										right: "0%",
									}}
								/>
								<div
									className="absolute inset-y-0 rounded-full bg-gradient-to-r from-green-400 to-green-500"
									style={{
										left: `${((salary.medianSalary - salary.minSalary) / (salary.maxSalary - salary.minSalary)) * 100 - 10}%`,
										right: `${100 - ((salary.medianSalary - salary.minSalary) / (salary.maxSalary - salary.minSalary)) * 100 - 10}%`,
									}}
								/>
								<div
									className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full border-2 border-white bg-green-600 shadow"
									style={{
										left: `calc(${((salary.medianSalary - salary.minSalary) / (salary.maxSalary - salary.minSalary)) * 100}% - 8px)`,
									}}
								/>
							</div>
							<div className="flex justify-between text-muted-foreground text-xs">
								<span>Min: {formatCurrency(salary.minSalary)}</span>
								<span>Median: {formatCurrency(salary.medianSalary)}</span>
								<span>Max: {formatCurrency(salary.maxSalary)}</span>
							</div>
							{salary.totalComp && (
								<p className="text-muted-foreground text-sm">
									<Trans>Total compensation (with bonus)</Trans>:{" "}
									<span className="font-medium text-foreground">{formatCurrency(salary.totalComp)}</span>
								</p>
							)}
						</motion.div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function BenefitsTab({ company }: { company: Company }) {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			{company.benefits.map((benefit, index) => (
				<motion.div
					key={benefit.category}
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1 }}
				>
					<Card className="h-full">
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">{benefit.category}</CardTitle>
								<div className="flex items-center gap-1">
									{[1, 2, 3, 4, 5].map((star) => (
										<StarIcon
											key={star}
											className={cn(
												"size-4",
												star <= Math.round(benefit.rating) ? "text-amber-500" : "text-muted-foreground/30",
											)}
											weight={star <= Math.round(benefit.rating) ? "fill" : "regular"}
										/>
									))}
									<span className="ml-1 font-medium text-sm">{benefit.rating.toFixed(1)}</span>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2">
								{benefit.items.map((item) => (
									<li key={item} className="flex items-center gap-2 text-sm">
										<CheckCircleIcon className="size-4 shrink-0 text-green-500" weight="fill" />
										{item}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	);
}

function NewsTab({ company }: { company: Company }) {
	return (
		<div className="space-y-4">
			{company.news.map((news, index) => {
				const NewsIcon = getNewsTypeIcon(news.type);
				return (
					<motion.div key={news.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
						<Card className="transition-all hover:shadow-md">
							<CardContent className="p-6">
								<div className="flex gap-4">
									<div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
										<NewsIcon className="size-6 text-primary" weight="duotone" />
									</div>
									<div className="flex-1">
										<div className="mb-2 flex items-start justify-between gap-2">
											<h4 className="font-semibold">{news.title}</h4>
											<Badge variant="outline" className="shrink-0">
												{news.type === "announcement" && "Announcement"}
												{news.type === "award" && "Award"}
												{news.type === "partnership" && "Partnership"}
												{news.type === "hiring" && "Hiring"}
												{news.type === "press" && "Press"}
											</Badge>
										</div>
										<p className="mb-2 text-muted-foreground text-sm">{news.summary}</p>
										<p className="text-muted-foreground text-xs">
											{news.source} | {formatDate(news.date)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				);
			})}
		</div>
	);
}

function KeyPeopleTab({ company }: { company: Company }) {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{company.keyPeople.map((person, index) => (
				<motion.div
					key={person.id}
					initial={false}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: index * 0.1 }}
				>
					<Card className="h-full transition-all hover:shadow-md">
						<CardContent className="p-6">
							<div className="mb-4 flex items-center gap-4">
								<div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
									<UserCircleIcon className="size-10 text-primary" weight="duotone" />
								</div>
								<div>
									<h4 className="font-semibold">{person.name}</h4>
									<p className="text-muted-foreground text-sm">{person.title}</p>
								</div>
							</div>
							<div className="space-y-2 text-sm">
								<div className="flex items-center gap-2">
									<BriefcaseIcon className="size-4 text-muted-foreground" />
									<span>{person.department}</span>
								</div>
								<div className="flex items-center gap-2">
									<CalendarIcon className="size-4 text-muted-foreground" />
									<span>{person.yearsAtCompany} years at company</span>
								</div>
							</div>
							{person.bio && <p className="mt-3 text-muted-foreground text-sm">{person.bio}</p>}
							{person.linkedIn && (
								<Button variant="outline" size="sm" className="mt-4 w-full gap-2" asChild>
									<a href={person.linkedIn} target="_blank" rel="noopener noreferrer">
										<LinkedinLogoIcon className="size-4" />
										<Trans>View profile</Trans>
									</a>
								</Button>
							)}
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	);
}

// --- Main Listing View Components ---

type HeroSectionProps = {
	statistics: { totalCompanies?: number; totalFavorites?: number; totalReviews?: number } | undefined;
	companiesCount: number;
	favoriteIdsCount: number;
};

export function HeroSection({ statistics, companiesCount, favoriteIdsCount }: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm md:p-8"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<MagnifyingGlassIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Analyse employeur</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 max-w-4xl font-bold text-3xl tracking-tight md:text-4xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Recherche d'entreprise</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Compare les employeurs, comprends leur culture, consulte les salaires indicatifs et prépare des entretiens
						mieux ciblés.
					</Trans>
				</motion.p>

				{/* Stats */}
				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<BuildingsIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{statistics?.totalCompanies ?? companiesCount}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Entreprises</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<BookmarkIcon className="size-5 text-amber-500" weight="fill" />
						</div>
						<div>
							<p className="font-bold text-xl">{statistics?.totalFavorites ?? favoriteIdsCount}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Favoris</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<ChatCircleDotsIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{statistics?.totalReviews ?? 0}+</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Avis</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

type SearchAndFiltersProps = {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedIndustry: CompanyIndustry | "all";
	setSelectedIndustry: (industry: CompanyIndustry | "all") => void;
	compareMode: boolean;
	setCompareMode: (mode: boolean) => void;
	compareCompanies: string[];
	setCompareCompanies: (ids: string[]) => void;
	setShowCompareDialog: (show: boolean) => void;
	filteredCount: number;
};

export function SearchAndFilters({
	searchQuery,
	setSearchQuery,
	selectedIndustry,
	setSelectedIndustry,
	compareMode,
	setCompareMode,
	compareCompanies,
	setCompareCompanies,
	setShowCompareDialog,
	filteredCount,
}: SearchAndFiltersProps) {
	return (
		<Card className="mb-6">
			<CardContent className="p-6">
				<div className="grid gap-4 md:grid-cols-3">
					<div className="md:col-span-2">
						<div className="relative">
							<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder={t`Rechercher une entreprise...`}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>
					<Select value={selectedIndustry} onValueChange={(v) => setSelectedIndustry(v as CompanyIndustry | "all")}>
						<SelectTrigger>
							<SelectValue placeholder={t`Secteur`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								<Trans>Tous les secteurs</Trans>
							</SelectItem>
							{(Object.entries(industryConfig) as [CompanyIndustry, (typeof industryConfig)[CompanyIndustry]][]).map(
								([key, config]) => {
									const IndustryIcon = config.icon;
									return (
										<SelectItem key={key} value={key}>
											<div className="flex items-center gap-2">
												<IndustryIcon className="size-4" />
												{config.label}
											</div>
										</SelectItem>
									);
								},
							)}
						</SelectContent>
					</Select>
				</div>

				<div className="mt-4 flex flex-wrap items-center justify-between gap-4">
					<div className="flex flex-wrap items-center gap-2">
						<Button
							variant={compareMode ? "default" : "outline"}
							size="sm"
							onClick={() => {
								setCompareMode(!compareMode);
								if (compareMode) setCompareCompanies([]);
							}}
							className="gap-2"
						>
							<ScalesIcon className="size-4" />
							<Trans>Mode comparaison</Trans>
						</Button>
						{compareMode && compareCompanies.length >= 2 && (
							<Button size="sm" onClick={() => setShowCompareDialog(true)} className="gap-2">
								<Trans>Comparer ({compareCompanies.length})</Trans>
								<ArrowRightIcon className="size-4" />
							</Button>
						)}
					</div>
					<p className="text-muted-foreground text-sm">
						{filteredCount} <Trans>entreprise(s)</Trans>
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

type FavoritesSectionProps = {
	favoriteCompanies: Company[];
	onSelectCompany: (company: Company) => void;
};

export function FavoritesSection({ favoriteCompanies, onSelectCompany }: FavoritesSectionProps) {
	return (
		<section className="mb-8">
			<h3 className="mb-4 flex items-center gap-2 font-semibold text-xl">
				<BookmarkIcon className="size-5 text-amber-500" weight="fill" />
				<Trans>Mes entreprises favorites</Trans>
			</h3>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{favoriteCompanies.map((company, index) => {
					const industryInfo = industryConfig[company.industry];
					const IndustryIcon = industryInfo.icon;
					return (
						<motion.div
							key={company.id}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
						>
							<Card
								className="group cursor-pointer transition-all hover:shadow-lg"
								onClick={() => onSelectCompany(company)}
							>
								<CardContent className="p-4">
									<div className="flex items-center gap-3">
										<div className={cn("flex size-12 items-center justify-center rounded-xl", industryInfo.color)}>
											<IndustryIcon className="size-6" weight="duotone" />
										</div>
										<div className="flex-1">
											<h4 className="font-semibold">{company.name}</h4>
											<p className="text-muted-foreground text-sm">{company.headquarters}</p>
										</div>
										<div className="flex items-center gap-1">
											<StarIcon className="size-4 text-amber-500" weight="fill" />
											<span className="font-medium">{company.reviewsAverageRating.toFixed(1)}</span>
										</div>
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

type CompaniesGridProps = {
	filteredCompanies: Company[];
	favoriteIds: string[];
	compareMode: boolean;
	compareCompanies: string[];
	toggleFavorite: (companyId: string) => void;
	toggleFavoritePending: boolean;
	toggleCompare: (companyId: string) => void;
	onSelectCompany: (company: Company) => void;
	onResetSearch: () => void;
};

export function CompaniesGrid({
	filteredCompanies,
	favoriteIds,
	compareMode,
	compareCompanies,
	toggleFavorite,
	toggleFavoritePending,
	toggleCompare,
	onSelectCompany,
	onResetSearch,
}: CompaniesGridProps) {
	return (
		<AnimatePresence mode="popLayout">
			{filteredCompanies.length > 0 ? (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{filteredCompanies.map((company, index) => {
						const info = industryConfig[company.industry];
						const IndustryIcon = info.icon;
						const isFavorite = favoriteIds.includes(company.id);
						const isSelected = compareCompanies.includes(company.id);

						return (
							<motion.div
								key={company.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card
									className={cn(
										"group h-full transition-all hover:shadow-lg",
										compareMode && isSelected && "border-2 border-primary",
										!compareMode && "cursor-pointer",
									)}
									onClick={() => {
										if (compareMode) {
											toggleCompare(company.id);
										} else {
											onSelectCompany(company);
										}
									}}
								>
									<CardHeader className="pb-3">
										<div className="flex items-start justify-between gap-3">
											<div className="flex items-center gap-3">
												<div className={cn("flex size-12 items-center justify-center rounded-xl", info.color)}>
													<IndustryIcon className="size-6" weight="duotone" />
												</div>
												<div>
													<CardTitle className="line-clamp-1 text-lg">{company.name}</CardTitle>
													<CardDescription className="flex items-center gap-1">
														<MapPinIcon className="size-3" />
														{company.headquarters}
													</CardDescription>
												</div>
											</div>
											{!compareMode && (
												<Button
													variant="ghost"
													size="icon"
													className="shrink-0"
													disabled={toggleFavoritePending}
													onClick={(e) => {
														e.stopPropagation();
														toggleFavorite(company.id);
													}}
												>
													{isFavorite ? (
														<BookmarkIcon className="size-5 text-amber-500" weight="fill" />
													) : (
														<BookmarkSimpleIcon className="size-5" />
													)}
												</Button>
											)}
											{compareMode && (
												<div
													className={cn(
														"flex size-6 items-center justify-center rounded-full border-2",
														isSelected
															? "border-primary bg-primary text-primary-foreground"
															: "border-muted-foreground/30",
													)}
												>
													{isSelected && <CheckCircleIcon className="size-4" weight="fill" />}
												</div>
											)}
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<p className="line-clamp-2 text-muted-foreground text-sm">{company.description}</p>

										{/* Quick Stats */}
										<div className="grid grid-cols-3 gap-2">
											<div className="rounded-lg bg-muted/50 p-2 text-center">
												<div className="flex items-center justify-center gap-1">
													<StarIcon className="size-3 text-amber-500" weight="fill" />
													<span className="font-bold text-sm">{company.reviewsAverageRating.toFixed(1)}</span>
												</div>
												<p className="text-muted-foreground text-xs">
													<Trans>Note</Trans>
												</p>
											</div>
											<div className="rounded-lg bg-muted/50 p-2 text-center">
												<span className="font-bold text-sm">{company.reviewsRecommendRate}%</span>
												<p className="text-muted-foreground text-xs">
													<Trans>Recomm.</Trans>
												</p>
											</div>
											<div className="rounded-lg bg-muted/50 p-2 text-center">
												<span className="font-bold text-sm">{company.cultureOverallScore}</span>
												<p className="text-muted-foreground text-xs">
													<Trans>Culture</Trans>
												</p>
											</div>
										</div>

										{/* Tags */}
										<div className="flex flex-wrap gap-1">
											<Badge className={info.color}>
												<IndustryIcon className="mr-1 size-3" />
												{info.label}
											</Badge>
											<Badge variant="outline">
												<UsersIcon className="mr-1 size-3" />
												{company.employeeCount}
											</Badge>
										</div>

										{/* View More */}
										{!compareMode && (
											<Button variant="outline" className="w-full gap-2" size="sm">
												<Trans>Voir les détails</Trans>
												<CaretRightIcon className="size-4" />
											</Button>
										)}
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			) : (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-16">
						<MagnifyingGlassIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
						<h3 className="mb-2 font-semibold text-lg">
							<Trans>Aucune entreprise trouvée</Trans>
						</h3>
						<p className="mb-4 text-center text-muted-foreground">
							<Trans>Modifie tes critères de recherche</Trans>
						</p>
						<Button onClick={onResetSearch}>
							<Trans>Réinitialiser la recherche</Trans>
						</Button>
					</CardContent>
				</Card>
			)}
		</AnimatePresence>
	);
}

export function CtaSection() {
	return (
		<Card className="mt-8 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
			<CardContent className="flex flex-col items-center py-8 text-center">
				<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
					<SparkleIcon className="size-8 text-primary" weight="fill" />
				</div>
				<h3 className="mb-2 font-bold text-2xl">
					<Trans>Prépare ta candidature</Trans>
				</h3>
				<p className="mb-6 max-w-md text-muted-foreground">
					<Trans>Utilise ces informations pour adapter ton CV et préparer tes entretiens.</Trans>
				</p>
				<div className="flex flex-wrap justify-center gap-4">
					<Link to="/dashboard/resumes">
						<Button size="lg" className="gap-2">
							<Trans>Adapt my resume</Trans>
							<CaretRightIcon className="size-5" />
						</Button>
					</Link>
					{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
					<Link to={"/dashboard/interview" as any}>
						<Button size="lg" variant="outline" className="gap-2">
							<Trans>Simulate an interview</Trans>
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}

type CompareDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	companiesForComparison: Company[];
};

export function CompareDialog({ open, onOpenChange, companiesForComparison }: CompareDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<ScalesIcon className="size-5" />
						<Trans>Comparaison d'entreprises</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Compare les entreprises sélectionnées côte à côte</Trans>
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[60vh]">
					{companiesForComparison.length >= 2 && (
						<div className="space-y-6 pr-4">
							{/* Company Headers */}
							<div
								className="grid gap-4"
								style={{ gridTemplateColumns: `repeat(${companiesForComparison.length}, 1fr)` }}
							>
								{companiesForComparison.map((company) => {
									const info = industryConfig[company.industry];
									const IndustryIcon = info.icon;
									return (
										<Card key={company.id}>
											<CardContent className="flex flex-col items-center p-4 text-center">
												<div className={cn("mb-2 flex size-16 items-center justify-center rounded-xl", info.color)}>
													<IndustryIcon className="size-8" weight="duotone" />
												</div>
												<h4 className="font-semibold">{company.name}</h4>
												<p className="text-muted-foreground text-sm">{company.headquarters}</p>
											</CardContent>
										</Card>
									);
								})}
							</div>

							{/* Comparison Metrics */}
							{[
								{ label: "Note globale", getValue: (c: Company) => `${c.reviewsAverageRating.toFixed(1)}/5` },
								{ label: "Recommandation", getValue: (c: Company) => `${c.reviewsRecommendRate}%` },
								{ label: "Score culture", getValue: (c: Company) => `${c.cultureOverallScore}/100` },
								{ label: "Difficulté entretien", getValue: (c: Company) => `${c.interviewDifficulty.toFixed(1)}/5` },
								{ label: "Employés", getValue: (c: Company) => c.employeeCount },
								{ label: "Année de création", getValue: (c: Company) => c.founded.toString() },
							].map((metric) => (
								<div key={metric.label} className="rounded-lg border p-4">
									<p className="mb-3 font-medium text-sm">{metric.label}</p>
									<div
										className="grid gap-4"
										style={{ gridTemplateColumns: `repeat(${companiesForComparison.length}, 1fr)` }}
									>
										{companiesForComparison.map((company) => (
											<div key={company.id} className="text-center">
												<span className="font-bold text-lg">{metric.getValue(company)}</span>
											</div>
										))}
									</div>
								</div>
							))}

							{/* Salary Comparison */}
							<div className="rounded-lg border p-4">
								<p className="mb-3 font-medium text-sm">
									<Trans>Median salaries (examples)</Trans>
								</p>
								<div
									className="grid gap-4"
									style={{ gridTemplateColumns: `repeat(${companiesForComparison.length}, 1fr)` }}
								>
									{companiesForComparison.map((company) => (
										<div key={company.id} className="space-y-2">
											{company.salaries.slice(0, 3).map((salary) => (
												<div key={salary.role} className="flex justify-between text-sm">
													<span className="text-muted-foreground">{salary.role}</span>
													<span className="font-medium">{formatCurrency(salary.medianSalary)}</span>
												</div>
											))}
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</ScrollArea>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Fermer</Trans>
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
