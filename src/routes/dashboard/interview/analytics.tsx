import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CaretLeftIcon, ChartLineUpIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	AnalyticsTabsHeader,
	ImprovementPlanTab,
	ImprovementsTab,
	OverviewTab,
	PracticeNowCta,
	ReadinessHeroSection,
	RecommendationsSection,
	WeaknessesTab,
} from "./-components/analytics-components";
import type { TimePeriod } from "./-components/analytics-types";

export const Route = createFileRoute("/dashboard/interview/analytics")({
	component: InterviewAnalytics,
	errorComponent: ErrorComponent,
});

function InterviewAnalytics() {
	const { data: session } = authClient.useSession();
	const [timePeriod, setTimePeriod] = useState<TimePeriod>("monthly");

	const { data: dashboard } = useQuery({
		...orpc.interviewAnalytics.getDashboard.queryOptions({}),
		enabled: !!session?.user,
	});

	const { data: improvements } = useQuery({
		...orpc.interviewAnalytics.trackImprovement.queryOptions({ input: { period: timePeriod } }),
		enabled: !!session?.user,
	});

	const { data: weaknesses } = useQuery({
		...orpc.interviewAnalytics.getWeaknesses.queryOptions({ input: { includeResolved: false } }),
		enabled: !!session?.user,
	});

	const { data: improvementPlan, isLoading: isLoadingPlan } = useQuery({
		...orpc.interviewAnalytics.generateImprovementPlan.queryOptions({}),
		enabled: !!session?.user,
	});

	const summary = useMemo(() => {
		if (!dashboard) return null;
		return dashboard.summary;
	}, [dashboard]);

	const readiness = useMemo(() => {
		if (!dashboard?.readiness) return null;
		return dashboard.readiness;
	}, [dashboard]);

	const benchmark = useMemo(() => {
		if (!dashboard?.benchmark) return null;
		return dashboard.benchmark;
	}, [dashboard]);

	const patterns = useMemo(() => {
		if (!dashboard?.patterns) return null;
		return dashboard.patterns;
	}, [dashboard]);

	return (
		<main role="main" aria-label={t`Interview analytics`}>
			<DashboardHeader icon={ChartLineUpIcon} title={t`Performance Analysis`} />

			<div className="mb-6">
				<Link to="/dashboard/interview">
					<Button variant="ghost" size="sm" className="gap-2">
						<CaretLeftIcon className="size-4" />
						<Trans>Back to Hub</Trans>
					</Button>
				</Link>
			</div>

			<ReadinessHeroSection readiness={readiness} />

			<Tabs defaultValue="overview" className="space-y-6">
				<AnalyticsTabsHeader />
				<OverviewTab readiness={readiness} benchmark={benchmark} patterns={patterns} />
				<WeaknessesTab summary={summary} weaknesses={weaknesses} patterns={patterns} />
				<ImprovementsTab
					timePeriod={timePeriod}
					setTimePeriod={setTimePeriod}
					improvements={improvements}
					patterns={patterns}
				/>
				<ImprovementPlanTab isLoadingPlan={isLoadingPlan} improvementPlan={improvementPlan} />
			</Tabs>

			<RecommendationsSection readiness={readiness} />
			<PracticeNowCta />
		</main>
	);
}
