import { t } from "@lingui/core/macro";
import { ScalesIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	ActionButtonsCard,
	CompareHeroSection,
	ComparisonTable,
	EmploymentRateCard,
	EmptyStateCard,
	ProgramSelectorCard,
	RecommendationsCard,
	SalaryComparisonCard,
	SkillsAnalysisCard,
} from "./-components/compare-components";
import { searchParamsSchema } from "./-components/compare-config";
import type { SearchParams } from "./-components/compare-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/resources/compare" as any)({
	component: ProgramComparePage,
	errorComponent: ErrorComponent,
	validateSearch: searchParamsSchema,
});

function ProgramComparePage() {
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();
	const { programs: programsParam } = Route.useSearch() as SearchParams;
	const [isAddOpen, setIsAddOpen] = useState(false);

	const selectedProgramIds = useMemo(() => {
		if (!programsParam) return [];
		return programsParam.split(",").filter(Boolean);
	}, [programsParam]);

	const { data: allPrograms } = useQuery({
		...orpc.career.getCareerPaths.queryOptions({ input: { language: "fr" } }),
		enabled: !!session?.user,
	});

	const { data: comparisonData } = useQuery({
		...orpc.career.comparePrograms.queryOptions({
			input: { programIds: selectedProgramIds, language: "fr" },
		}),
		enabled: !!session?.user && selectedProgramIds.length >= 2,
	});

	const { data: programDetails } = useQuery({
		queryKey: ["program-details", selectedProgramIds],
		queryFn: async () => {
			if (selectedProgramIds.length === 0) return [];
			const results = await Promise.all(
				selectedProgramIds.map((id: string) => orpc.career.getCareerProgram.call({ programId: id, language: "fr" })),
			);
			return results;
		},
		enabled: !!session?.user && selectedProgramIds.length > 0,
	});

	const updateSelectedPrograms = useCallback(
		(newIds: string[]) => {
			navigate({
				search: { programs: newIds.length > 0 ? newIds.join(",") : undefined },
				replace: true,
			} as unknown as Parameters<typeof navigate>[0]);
		},
		[navigate],
	);

	const addProgram = useCallback(
		(programId: string) => {
			if (selectedProgramIds.length >= 4) return;
			if (selectedProgramIds.includes(programId)) return;
			updateSelectedPrograms([...selectedProgramIds, programId]);
			setIsAddOpen(false);
		},
		[selectedProgramIds, updateSelectedPrograms],
	);

	const removeProgram = useCallback(
		(programId: string) => {
			updateSelectedPrograms(selectedProgramIds.filter((id: string) => id !== programId));
		},
		[selectedProgramIds, updateSelectedPrograms],
	);

	const availablePrograms = useMemo(() => {
		if (!allPrograms) return [];
		return allPrograms.filter((p) => !selectedProgramIds.includes(p.id));
	}, [allPrograms, selectedProgramIds]);

	const recommendations = useMemo(() => {
		if (!comparisonData || comparisonData.programs.length < 2) return null;

		const programs = comparisonData.programs;

		const bestSalary = programs.reduce((best, p) => (p.salaryRange.max > best.salaryRange.max ? p : best));
		const bestEmployment = programs.reduce((best, p) => (p.employmentRate > best.employmentRate ? p : best));
		const quickestTraining = programs.reduce((best, p) => {
			const bestMonths = parseInt(best.duration.match(/\d+/)?.[0] || "0", 10);
			const pMonths = parseInt(p.duration.match(/\d+/)?.[0] || "0", 10);
			return pMonths < bestMonths ? p : best;
		});
		const highestGrowth = programs.reduce((best, p) => (p.growthRate > best.growthRate ? p : best));

		return { bestSalary, bestEmployment, quickestTraining, highestGrowth };
	}, [comparisonData]);

	const skillAnalysis = useMemo(() => {
		if (!programDetails || programDetails.length < 2) return null;

		const allSkills = new Map<string, string[]>();

		for (const program of programDetails) {
			for (const skill of program.skills) {
				const existing = allSkills.get(skill) || [];
				allSkills.set(skill, [...existing, program.name]);
			}
		}

		const commonSkills: string[] = [];
		const uniqueSkills: Map<string, string[]> = new Map();

		for (const [skill, programs] of allSkills) {
			if (programs.length > 1) {
				commonSkills.push(skill);
			} else {
				const existing = uniqueSkills.get(programs[0]) || [];
				uniqueSkills.set(programs[0], [...existing, skill]);
			}
		}

		return { commonSkills, uniqueSkills };
	}, [programDetails]);

	const maxSalary = useMemo(() => {
		if (!comparisonData) return 20000;
		return Math.max(...comparisonData.programs.map((p) => p.salaryRange.max));
	}, [comparisonData]);

	return (
		<>
			<DashboardHeader icon={ScalesIcon} title={t`Compare Programs`} />

			<CompareHeroSection allProgramsCount={allPrograms?.length ?? 0} selectedCount={selectedProgramIds.length} />

			<ProgramSelectorCard
				selectedProgramIds={selectedProgramIds}
				allPrograms={allPrograms}
				availablePrograms={availablePrograms}
				isAddOpen={isAddOpen}
				setIsAddOpen={setIsAddOpen}
				addProgram={addProgram}
				removeProgram={removeProgram}
			/>

			{selectedProgramIds.length >= 2 && comparisonData && (
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-8">
					<ComparisonTable programs={comparisonData.programs} recommendations={recommendations} maxSalary={maxSalary} />

					<div className="grid gap-6 lg:grid-cols-2">
						<SalaryComparisonCard
							programs={comparisonData.programs}
							recommendations={recommendations}
							maxSalary={maxSalary}
						/>
						<EmploymentRateCard programs={comparisonData.programs} recommendations={recommendations} />
					</div>

					{skillAnalysis && <SkillsAnalysisCard skillAnalysis={skillAnalysis} />}

					{recommendations && <RecommendationsCard recommendations={recommendations} />}

					<ActionButtonsCard programs={comparisonData.programs} />
				</motion.div>
			)}

			{selectedProgramIds.length < 2 && <EmptyStateCard allPrograms={allPrograms} addProgram={addProgram} />}
		</>
	);
}
