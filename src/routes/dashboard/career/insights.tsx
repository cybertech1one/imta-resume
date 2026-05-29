import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BriefcaseIcon,
	BuildingsIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	CurrencyCircleDollarIcon,
	MapPinIcon,
	SparkleIcon,
	TargetIcon,
	TrendUpIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { ErrorComponent } from "@/components/error-component";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";

import { DashboardHeader } from "../-components/header";
import {
	OverviewTabContent,
	PersonalizedTabContent,
	RegionsTabContent,
	SalaryTabContent,
	SkillsTabContent,
	StatCard,
} from "./-components/insights-components";
import { formatCurrency } from "./-components/insights-config";
import type { UserProfileForm } from "./-components/insights-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/insights" as any)({
	component: CareerInsightsDashboard,
	errorComponent: ErrorComponent,
});

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.1 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function CareerInsightsDashboard() {
	const { data: session } = authClient.useSession();
	const [activeTab, setActiveTab] = useState("overview");
	const [skillInput, setSkillInput] = useState("");
	const [profileForm, setProfileForm] = useState<UserProfileForm>({
		skills: [],
		field: "",
		experienceLevel: "",
		region: "",
		targetSalary: 0,
	});

	// Queries
	const { data: marketOverview, isLoading: overviewLoading } = useQuery({
		queryKey: ["market", "analytics", "overview"],
		queryFn: () => orpc.marketIntelligence.analytics.overview.call({}),
		enabled: !!session?.user,
	});

	const { data: industryTrends, isLoading: trendsLoading } = useQuery({
		queryKey: ["market", "analytics", "trends"],
		queryFn: () => orpc.marketIntelligence.analytics.industryTrends.call({}),
		enabled: !!session?.user,
	});

	const { data: salaryComparison, isLoading: salaryLoading } = useQuery({
		queryKey: ["market", "analytics", "salary", profileForm.field],
		queryFn: () =>
			orpc.marketIntelligence.analytics.salaryComparison.call({
				field: profileForm.field || undefined,
			}),
		enabled: !!session?.user,
	});

	const { data: topSkills, isLoading: skillsLoading } = useQuery({
		queryKey: ["market", "skills", "top", profileForm.field],
		queryFn: () =>
			orpc.marketIntelligence.skills.getTop.call({
				field: profileForm.field || undefined,
				limit: 10,
			}),
		enabled: !!session?.user,
	});

	const { data: regions, isLoading: regionsLoading } = useQuery({
		queryKey: ["market", "regions"],
		queryFn: () => orpc.marketIntelligence.regions.list.call({}),
		enabled: !!session?.user,
	});

	const personalizedInsights = useMutation({
		mutationFn: (profile: UserProfileForm) => orpc.marketIntelligence.analytics.personalizedInsights.call(profile),
	});

	const { data: careerProgression, isLoading: progressionLoading } = useQuery({
		queryKey: ["market", "analytics", "progression", profileForm.field],
		queryFn: () =>
			orpc.marketIntelligence.analytics.careerProgression.call({
				role:
					profileForm.field === "healthcare"
						? "Infirmier"
						: profileForm.field === "hse"
							? "Technicien HSE"
							: profileForm.field === "industrial"
								? "Technicien"
								: "Professional",
				field: profileForm.field || undefined,
			}),
		enabled: !!session?.user && !!profileForm.field,
	});

	// Handlers
	const handleAddSkill = useCallback(() => {
		if (skillInput.trim() && !profileForm.skills.includes(skillInput.trim())) {
			setProfileForm((prev) => ({
				...prev,
				skills: [...prev.skills, skillInput.trim()],
			}));
			setSkillInput("");
		}
	}, [skillInput, profileForm.skills]);

	const handleRemoveSkill = useCallback((skill: string) => {
		setProfileForm((prev) => ({
			...prev,
			skills: prev.skills.filter((s) => s !== skill),
		}));
	}, []);

	const handleGetPersonalizedInsights = useCallback(() => {
		if (profileForm.skills.length > 0 || profileForm.field) {
			personalizedInsights.mutate(profileForm);
		}
	}, [profileForm, personalizedInsights]);

	return (
		<motion.div className="min-h-screen pb-8" initial="hidden" animate="visible" variants={containerVariants}>
			<DashboardHeader icon={ChartLineUpIcon} title={t`Career Insights Dashboard`} />

			{/* Hero Section */}
			<motion.div
				variants={itemVariants}
				className="relative mb-8 overflow-hidden rounded-2xl border border-primary/20 p-6 md:p-8"
				style={{
					background:
						"linear-gradient(135deg, oklch(0.65 0.18 280 / 0.12) 0%, oklch(0.6 0.2 220 / 0.08) 35%, oklch(0.7 0.15 160 / 0.06) 70%, oklch(0.65 0.12 40 / 0.08) 100%)",
				}}
			>
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<motion.div
						className="absolute -top-20 -right-20 size-64 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/10 blur-3xl"
						animate={{
							scale: [1, 1.15, 1],
							rotate: [0, 10, 0],
							opacity: [0.4, 0.25, 0.4],
						}}
						transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
					/>
					<motion.div
						className="absolute -bottom-20 -left-20 size-64 rounded-full bg-gradient-to-tr from-blue-500/15 to-cyan-500/10 blur-3xl"
						animate={{
							scale: [1.15, 1, 1.15],
							rotate: [0, -10, 0],
							opacity: [0.25, 0.4, 0.25],
						}}
						transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
					/>
				</div>

				<div className="relative z-10">
					<div className="mb-3 flex items-center gap-2">
						<SparkleIcon className="size-5 text-primary" weight="fill" />
						<span className="font-semibold text-primary text-sm uppercase tracking-wider">
							<Trans>Morocco Market Intelligence</Trans>
						</span>
					</div>
					<h1 className="mb-2 font-bold text-2xl md:text-3xl">
						<Trans>Your Career Intelligence Hub</Trans>
					</h1>
					<p className="max-w-2xl text-muted-foreground">
						<Trans>
							Discover salary benchmarks, trending skills, regional opportunities, and personalized career advice
							powered by real-time market data.
						</Trans>
					</p>

					{/* Quick Stats */}
					<div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
						<StatCard
							title={t`Total Jobs`}
							value={marketOverview?.summary?.totalJobs || 128000}
							icon={BriefcaseIcon}
							trend="up"
							changePercent={8}
							color="blue"
							delay={0.1}
						/>
						<StatCard
							title={t`Avg Salary`}
							value={formatCurrency(marketOverview?.summary?.avgSalary || 84000)}
							icon={CurrencyCircleDollarIcon}
							trend="up"
							changePercent={5}
							color="green"
							delay={0.2}
						/>
						<StatCard
							title={t`Job Growth`}
							value={`${marketOverview?.summary?.avgJobGrowth || 7.5}%`}
							icon={TrendUpIcon}
							color="purple"
							delay={0.3}
						/>
						<StatCard
							title={t`Employers`}
							value={marketOverview?.summary?.totalEmployers || 450}
							icon={BuildingsIcon}
							color="orange"
							delay={0.4}
						/>
					</div>
				</div>
			</motion.div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full max-w-3xl grid-cols-5">
					<TabsTrigger value="overview" className="gap-2">
						<ChartBarIcon className="hidden size-4 sm:inline" />
						<Trans>Overview</Trans>
					</TabsTrigger>
					<TabsTrigger value="salary" className="gap-2">
						<CurrencyCircleDollarIcon className="hidden size-4 sm:inline" />
						<Trans>Salary</Trans>
					</TabsTrigger>
					<TabsTrigger value="skills" className="gap-2">
						<SparkleIcon className="hidden size-4 sm:inline" />
						<Trans>Skills</Trans>
					</TabsTrigger>
					<TabsTrigger value="regions" className="gap-2">
						<MapPinIcon className="hidden size-4 sm:inline" />
						<Trans>Regions</Trans>
					</TabsTrigger>
					<TabsTrigger value="personalized" className="gap-2">
						<TargetIcon className="hidden size-4 sm:inline" />
						<Trans>For You</Trans>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					<OverviewTabContent
						marketOverview={marketOverview}
						overviewLoading={overviewLoading}
						industryTrends={industryTrends}
						trendsLoading={trendsLoading}
						itemVariants={itemVariants}
					/>
				</TabsContent>

				<TabsContent value="salary" className="space-y-6">
					<SalaryTabContent
						profileForm={profileForm}
						setProfileForm={setProfileForm}
						salaryComparison={salaryComparison}
						salaryLoading={salaryLoading}
						itemVariants={itemVariants}
					/>
				</TabsContent>

				<TabsContent value="skills" className="space-y-6">
					<SkillsTabContent topSkills={topSkills} skillsLoading={skillsLoading} itemVariants={itemVariants} />
				</TabsContent>

				<TabsContent value="regions" className="space-y-6">
					<RegionsTabContent regions={regions} regionsLoading={regionsLoading} itemVariants={itemVariants} />
				</TabsContent>

				<TabsContent value="personalized" className="space-y-6">
					<PersonalizedTabContent
						profileForm={profileForm}
						setProfileForm={setProfileForm}
						skillInput={skillInput}
						setSkillInput={setSkillInput}
						handleAddSkill={handleAddSkill}
						handleRemoveSkill={handleRemoveSkill}
						handleGetPersonalizedInsights={handleGetPersonalizedInsights}
						personalizedInsights={personalizedInsights}
						careerProgression={careerProgression}
						progressionLoading={progressionLoading}
						itemVariants={itemVariants}
					/>
				</TabsContent>
			</Tabs>
		</motion.div>
	);
}
