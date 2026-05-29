import { t } from "@lingui/core/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import {
	EmployersTab,
	InsightsTab,
	JobMarketTab,
	ProgramsTab,
	QuestionsTab,
	QuizTab,
	ReferenceDataPageHeader,
	ReferenceDataSkeleton,
	ReferenceDataTabs,
	SkillsTab,
	TipsTab,
} from "./-components/reference-data-components";
import {
	SEED_EMPLOYERS,
	SEED_IMTA_PROGRAMS,
	SEED_INTERVIEW_QUESTIONS,
	SEED_INTERVIEW_TIPS,
	SEED_MARKET_INSIGHTS,
	SEED_QUIZ_OPTIONS,
	SEED_QUIZ_QUESTIONS,
	SEED_SKILLS,
} from "./-components/reference-data-config";
import type { QuizOptionMutationInput } from "./-components/reference-data-types";

export const Route = createFileRoute("/dashboard/admin/reference-data/")({
	component: ReferenceDataAdmin,
	errorComponent: ErrorComponent,
	pendingComponent: ReferenceDataSkeleton,
});

function ReferenceDataAdmin() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("programs");

	// Queries
	const { data: programs, isLoading: loadingPrograms } = useQuery({
		...orpc.imtaPrograms.list.queryOptions({ input: { activeOnly: false } }),
		enabled: !!session?.user,
	});
	const { data: tips, isLoading: loadingTips } = useQuery({
		...orpc.interviewTips.list.queryOptions({ input: { activeOnly: false } }),
		enabled: !!session?.user,
	});
	const { data: questions, isLoading: loadingQuestions } = useQuery({
		...orpc.interviewQuestions.list.queryOptions({ input: { activeOnly: false } }),
		enabled: !!session?.user,
	});
	const { data: insights, isLoading: loadingInsights } = useQuery({
		...orpc.marketInsights.list.queryOptions({ input: { activeOnly: false } }),
		enabled: !!session?.user,
	});
	const { data: employers, isLoading: loadingEmployers } = useQuery({
		...orpc.employers.list.queryOptions({ input: { activeOnly: false } }),
		enabled: !!session?.user,
	});
	const { data: skills, isLoading: loadingSkills } = useQuery({
		...orpc.skillLibrary.list.queryOptions({ input: { activeOnly: false } }),
		enabled: !!session?.user,
	});
	const { data: quizQuestions, isLoading: loadingQuizQuestions } = useQuery({
		...orpc.careerQuizQuestions.listWithOptions.queryOptions({ input: { activeOnly: false } }),
		enabled: !!session?.user,
	});
	const { data: industryTrends, isLoading: loadingIndustryTrends } = useQuery({
		...orpc.insights.listIndustryTrends.queryOptions(),
		enabled: !!session?.user,
	});

	// Seed mutations
	const seedPrograms = useMutation({
		...orpc.seed.imtaPrograms.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["imtaPrograms"] });
			toast.success(t`Programs seeded successfully`);
		},
		onError: (error) => toast.error(error.message),
	});

	const seedTips = useMutation({
		...orpc.seed.interviewTips.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewTips"] });
			toast.success(t`Tips seeded successfully`);
		},
		onError: (error) => toast.error(error.message),
	});

	const seedQuestions = useMutation({
		...orpc.seed.interviewQuestions.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewQuestions"] });
			toast.success(t`Questions seeded successfully`);
		},
		onError: (error) => toast.error(error.message),
	});

	const seedInsights = useMutation({
		...orpc.seed.marketInsights.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["marketInsights"] });
			toast.success(t`Market insights seeded successfully`);
		},
		onError: (error) => toast.error(error.message),
	});

	const seedEmployers = useMutation({
		...orpc.seed.employers.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employers"] });
			toast.success(t`Employers seeded successfully`);
		},
		onError: (error) => toast.error(error.message),
	});

	const seedSkills = useMutation({
		...orpc.seed.skills.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["skillLibrary"] });
			toast.success(t`Skills seeded successfully`);
		},
		onError: (error) => toast.error(error.message),
	});

	const seedQuizQuestions = useMutation({
		...orpc.careerQuizSeed.questions.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["careerQuizQuestions"] });
			toast.success(t`Quiz questions seeded successfully`);
		},
		onError: (error) => toast.error(error.message),
	});

	const seedQuizOptions = useMutation({
		...orpc.careerQuizSeed.options.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["careerQuizQuestions"] });
			toast.success(t`Quiz options seeded successfully`);
		},
		onError: (error) => toast.error(error.message),
	});

	const seedJobMarketInsights = useMutation({
		...orpc.insights.seedIfEmpty.mutationOptions(),
		onSuccess: (result) => {
			queryClient.invalidateQueries({ queryKey: orpc.insights.listIndustryTrends.queryOptions().queryKey });
			if (result.seeded) {
				toast.success(t`Job market insights seeded successfully`);
			} else {
				toast.info(result.message);
			}
		},
		onError: (error) => toast.error(error.message),
	});

	const handleSeedAll = async () => {
		try {
			await Promise.all([
				seedPrograms.mutateAsync(SEED_IMTA_PROGRAMS),
				seedTips.mutateAsync(SEED_INTERVIEW_TIPS),
				seedQuestions.mutateAsync(SEED_INTERVIEW_QUESTIONS),
				seedInsights.mutateAsync(SEED_MARKET_INSIGHTS),
				seedEmployers.mutateAsync(SEED_EMPLOYERS),
				seedSkills.mutateAsync(SEED_SKILLS),
				seedQuizQuestions.mutateAsync(SEED_QUIZ_QUESTIONS),
				seedQuizOptions.mutateAsync(SEED_QUIZ_OPTIONS as QuizOptionMutationInput),
				seedJobMarketInsights.mutateAsync(undefined),
			]);
			toast.success(t`All reference data seeded successfully!`);
		} catch (_error) {
			toast.error(t`Some seeds failed. Check individual tables.`);
		}
	};

	const isSeeding =
		seedPrograms.isPending ||
		seedTips.isPending ||
		seedQuestions.isPending ||
		seedInsights.isPending ||
		seedEmployers.isPending ||
		seedSkills.isPending ||
		seedQuizQuestions.isPending ||
		seedQuizOptions.isPending ||
		seedJobMarketInsights.isPending;

	return (
		<div className="space-y-6 p-6">
			<ReferenceDataPageHeader isSeeding={isSeeding} onSeedAll={handleSeedAll} />

			<ReferenceDataTabs activeTab={activeTab} onTabChange={setActiveTab}>
				<ProgramsTab programs={programs} isLoading={loadingPrograms} seedMutation={seedPrograms} />
				<TipsTab tips={tips} isLoading={loadingTips} seedMutation={seedTips} />
				<QuestionsTab questions={questions} isLoading={loadingQuestions} seedMutation={seedQuestions} />
				<InsightsTab insights={insights} isLoading={loadingInsights} seedMutation={seedInsights} />
				<EmployersTab employers={employers} isLoading={loadingEmployers} seedMutation={seedEmployers} />
				<SkillsTab skills={skills} isLoading={loadingSkills} seedMutation={seedSkills} />
				<QuizTab
					quizQuestions={quizQuestions}
					isLoading={loadingQuizQuestions}
					seedQuestionsMutation={seedQuizQuestions}
					seedOptionsMutation={seedQuizOptions}
				/>
				<JobMarketTab
					industryTrendCount={industryTrends?.length}
					isLoading={loadingIndustryTrends}
					seedMutation={seedJobMarketInsights}
				/>
			</ReferenceDataTabs>
		</div>
	);
}
