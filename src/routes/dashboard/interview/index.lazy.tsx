import { t } from "@lingui/core/macro";
import { ChatsCircleIcon, LightbulbIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import type { ImtaProgram } from "@/schema/interview";
import { DashboardHeader } from "../-components/header";
import { getProgramField } from "../-components/program-features";
import {
	FieldSelectionSection,
	HeroSection,
	RecentSessionsSection,
	ResourcesSection,
	SessionModesSection,
	StatisticsSection,
	TipsCarouselSection,
} from "./-components/interview-index-components";
import { categoryIconMap, categoryLabels } from "./-components/interview-index-config";
import type { InterviewDifficulty, InterviewField } from "./-components/interview-index-types";
import { ReadinessScoreWidget } from "./-components/readiness-score-widget";
import { getFallbackInterviewTips } from "./-components/tips-fallback";

export const Route = createLazyFileRoute("/dashboard/interview/")({
	component: InterviewHub,
	errorComponent: ErrorComponent,
});

function InterviewHub() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [selectedField, setSelectedField] = useState<InterviewField>("general");
	const [selectedProgram, setSelectedProgram] = useState<ImtaProgram | "">("");
	const [selectedDifficulty, setSelectedDifficulty] = useState<InterviewDifficulty>("intermediate");
	const [currentTipIndex, setCurrentTipIndex] = useState(0);

	// Derive the user's IMTA field to pre-filter reference data
	const userProgram = (session?.user as Record<string, unknown> | undefined)?.imtaProgram as string | null | undefined;
	const userField = getProgramField(userProgram);

	const { data: dbPrograms } = useQuery({
		...orpc.imtaPrograms.list.queryOptions({ input: { activeOnly: true } }),
		staleTime: 60 * 60 * 1000, // Reference data - cache 1 hour
		enabled: !!session?.user,
	});

	// Filter tips by the user's field (falls back to "general" when unknown).
	// Tips with no field assigned are not returned when a field filter is active,
	// so use "general" (no field filter) as the safe fallback for unknown programs.
	const tipsField = userField !== "general" ? userField : undefined;
	const { data: dbTips } = useQuery({
		...orpc.interviewTips.list.queryOptions({ input: { activeOnly: true, field: tipsField } }),
		staleTime: 30 * 60 * 1000, // Tips rarely change - cache 30 min
		enabled: !!session?.user,
	});

	const interviewTips = useMemo(() => {
		if (!dbTips || dbTips.length === 0) {
			return getFallbackInterviewTips().map((tip, index) => ({
				...tip,
				field: tip.field ?? null,
				titleFr: tip.title,
				contentFr: tip.content,
				categoryFr: categoryLabels[tip.category] || tip.category,
				icon: categoryIconMap[tip.category] || LightbulbIcon,
				sortOrder: index,
				isActive: true,
			}));
		}
		return dbTips.map((tip) => ({
			...tip,
			title: tip.titleFr || tip.title,
			content: tip.contentFr || tip.content,
			categoryFr: categoryLabels[tip.category] || tip.category,
			icon: categoryIconMap[tip.category] || LightbulbIcon,
		}));
	}, [dbTips]);

	const availablePrograms = useMemo(() => {
		if (!dbPrograms) return [];
		return dbPrograms.filter((p) => selectedField === "general" || p.field === selectedField);
	}, [dbPrograms, selectedField]);

	const { data: sessions } = useQuery({
		...orpc.interview.getSessions.queryOptions({ input: { limit: 20, offset: 0 } }),
		staleTime: 3 * 60 * 1000, // Session data - cache 3 min
		enabled: !!session?.user,
	});

	const {
		mutate: deleteSession,
		isPending: isDeletingSession,
		variables: deletingSessionId,
	} = useMutation({
		...orpc.interview.deleteSession.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interview", "getSessions"] });
			toast.success(t`Session deleted`);
		},
		onError: () => toast.error(t`Failed to delete session. Please try again.`),
	});

	const recentSessions = useMemo(() => sessions?.slice(0, 5) || [], [sessions]);
	const completedSessions = useMemo(() => sessions?.filter((s) => s.status === "completed") || [], [sessions]);
	const averageScore = useMemo(() => {
		if (completedSessions.length === 0) return 0;
		return Math.round(completedSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / completedSessions.length);
	}, [completedSessions]);

	const sessionsThisMonth = useMemo(() => {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		return sessions?.filter((s) => new Date(s.createdAt) >= startOfMonth).length || 0;
	}, [sessions]);

	const bestPerformingArea = useMemo(() => {
		if (completedSessions.length === 0) return null;
		const areaScores: Record<string, { total: number; count: number }> = {};
		for (const session of completedSessions) {
			const field = session.field as string;
			if (!areaScores[field]) {
				areaScores[field] = { total: 0, count: 0 };
			}
			areaScores[field].total += session.overallScore || 0;
			areaScores[field].count += 1;
		}
		let bestArea = null;
		let bestAvg = 0;
		for (const [field, data] of Object.entries(areaScores)) {
			const avg = data.total / data.count;
			if (avg > bestAvg) {
				bestAvg = avg;
				bestArea = field;
			}
		}
		return bestArea ? { field: bestArea, score: Math.round(bestAvg) } : null;
	}, [completedSessions]);

	useEffect(() => {
		if (interviewTips.length <= 1) return;

		const interval = setInterval(() => {
			setCurrentTipIndex((prev) => (prev + 1) % interviewTips.length);
		}, 5000);
		return () => clearInterval(interval);
	}, [interviewTips.length]);

	const nextTip = useCallback(() => {
		if (interviewTips.length === 0) return;
		setCurrentTipIndex((prev) => (prev + 1) % interviewTips.length);
	}, [interviewTips.length]);

	const prevTip = useCallback(() => {
		if (interviewTips.length === 0) return;
		setCurrentTipIndex((prev) => (prev - 1 + interviewTips.length) % interviewTips.length);
	}, [interviewTips.length]);

	return (
		<main role="main" aria-label={t`Contenu principal de préparation à l'entretien`}>
			<DashboardHeader
				icon={ChatsCircleIcon}
				title={t`Préparation à l'entretien`}
				subtitle={t`Entraînez-vous avec des simulations IA et des conseils adaptés à votre domaine.`}
				accentColor="#7c3aed"
				gradient="linear-gradient(135deg, oklch(0.97 0.02 280) 0%, oklch(0.95 0.025 260) 50%, oklch(0.96 0.02 240) 100%)"
			/>

			<HeroSection
				sessionsCount={sessions?.length || 0}
				completedCount={completedSessions.length}
				averageScore={averageScore}
			/>

			<ReadinessScoreWidget enabled={!!session?.user} />

			<SessionModesSection />

			<FieldSelectionSection
				isCreateDialogOpen={isCreateDialogOpen}
				setIsCreateDialogOpen={setIsCreateDialogOpen}
				selectedField={selectedField}
				setSelectedField={setSelectedField}
				selectedProgram={selectedProgram}
				setSelectedProgram={setSelectedProgram}
				selectedDifficulty={selectedDifficulty}
				setSelectedDifficulty={setSelectedDifficulty}
				availablePrograms={availablePrograms}
				dbPrograms={dbPrograms}
			/>

			<StatisticsSection
				sessionsCount={sessions?.length || 0}
				averageScore={averageScore}
				bestPerformingArea={bestPerformingArea}
				sessionsThisMonth={sessionsThisMonth}
			/>

			<RecentSessionsSection
				recentSessions={recentSessions}
				deleteSession={deleteSession}
				isDeletingSession={isDeletingSession}
				deletingSessionId={deletingSessionId}
			/>

			<TipsCarouselSection
				interviewTips={interviewTips}
				currentTipIndex={currentTipIndex}
				setCurrentTipIndex={setCurrentTipIndex}
				nextTip={nextTip}
				prevTip={prevTip}
			/>

			<ResourcesSection />
		</main>
	);
}
