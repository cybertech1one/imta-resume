import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowLeftIcon, BookmarkSimpleIcon, GraduationCapIcon, ScalesIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	CatalogTabContent,
	CompareTabContent,
	HeroSection,
	InterestsTabContent,
} from "./-components/programs-components";
import { trainingPrograms } from "./-components/programs-config";
import type { ProgramField, TrainingInterest, TrainingProgram } from "./-components/programs-types";
import { categoryToField, fieldToCategory } from "./-components/programs-utils";

// Search params schema for comparison
const searchParamsSchema = z.object({
	compare: z.string().optional(),
});

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/resources/programs" as any)({
	component: TrainingProgramsCatalog,
	errorComponent: ErrorComponent,
	validateSearch: searchParamsSchema,
});

function TrainingProgramsCatalog() {
	const navigate = useNavigate();
	const { compare: compareParam } = Route.useSearch();
	const queryClient = useQueryClient();

	// State
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedField, setSelectedField] = useState<ProgramField | "all">("all");
	const [activeTab, setActiveTab] = useState<"catalog" | "compare" | "interests">("catalog");
	const [compareSelection, setCompareSelection] = useState<string[]>([]);
	const [isAddInterestDialogOpen, setIsAddInterestDialogOpen] = useState(false);
	const [isAddCustomDialogOpen, setIsAddCustomDialogOpen] = useState(false);
	const [selectedProgramForInterest, setSelectedProgramForInterest] = useState<string>("");
	const [interestNotes, setInterestNotes] = useState("");
	const [customProgram, setCustomProgram] = useState({
		name: "",
		field: "business" as ProgramField,
		duration: "",
		institution: "",
		description: "",
	});
	const [isCompareOpen, setIsCompareOpen] = useState(false);

	const { data: session } = authClient.useSession();

	// Fetch training interests from database
	const { data: dbInterests = [] } = useQuery({
		...orpc.training.getMyTrainingInterests.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	// Convert database interests to local format
	const interests = useMemo<TrainingInterest[]>(() => {
		return dbInterests.map((dbInterest) => ({
			id: dbInterest.id,
			programId: dbInterest.programId,
			programName: dbInterest.programName,
			field: categoryToField(dbInterest.category),
			addedAt: dbInterest.createdAt.toISOString(),
			notes: dbInterest.notes || "",
			isCustom: dbInterest.programType !== "imta_program",
			customDetails:
				dbInterest.programType !== "imta_program"
					? {
							description: dbInterest.notes || "",
						}
					: undefined,
		}));
	}, [dbInterests]);

	// Add training interest mutation
	const addInterestMutation = useMutation({
		...orpc.training.addTrainingInterest.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.training.getMyTrainingInterests.key() });
			toast.success(t`Training added to your interests`);
		},
		onError: (error) => {
			toast.error(error.message || t`Error adding training`);
		},
	});

	// Delete training interest mutation
	const deleteInterestMutation = useMutation({
		...orpc.training.deleteTrainingInterest.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.training.getMyTrainingInterests.key() });
			toast.success(t`Training removed from your interests`);
		},
		onError: (error) => {
			toast.error(error.message || t`Error during deletion`);
		},
	});

	// Parse compare params from URL
	useEffect(() => {
		if (compareParam) {
			const ids = compareParam.split(",").filter(Boolean);
			setCompareSelection(ids);
			if (ids.length >= 2) {
				setActiveTab("compare");
			}
		}
	}, [compareParam]);

	// Filter programs
	const filteredPrograms = useMemo(() => {
		let filtered = trainingPrograms;

		if (selectedField !== "all") {
			filtered = filtered.filter((p) => p.field === selectedField);
		}

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(p) =>
					p.name.toLowerCase().includes(query) ||
					p.description.toLowerCase().includes(query) ||
					p.careerOutcomes.some((o) => o.toLowerCase().includes(query)),
			);
		}

		return filtered;
	}, [selectedField, searchQuery]);

	// Group programs by field
	const programsByField = useMemo(() => {
		const grouped: Record<ProgramField, TrainingProgram[]> = {
			healthcare: [],
			industrial: [],
			hse: [],
			business: [],
		};

		for (const program of filteredPrograms) {
			grouped[program.field].push(program);
		}

		return grouped;
	}, [filteredPrograms]);

	// Programs selected for comparison
	const programsToCompare = useMemo(() => {
		return compareSelection.map((id) => trainingPrograms.find((p) => p.id === id)).filter(Boolean) as TrainingProgram[];
	}, [compareSelection]);

	// Toggle program in compare selection
	const toggleCompare = useCallback((programId: string) => {
		setCompareSelection((prev) => {
			if (prev.includes(programId)) {
				return prev.filter((id) => id !== programId);
			}
			if (prev.length >= 3) {
				return prev;
			}
			return [...prev, programId];
		});
	}, []);

	// Update URL with compare selection
	const updateCompareUrl = useCallback(() => {
		if (compareSelection.length >= 2) {
			navigate({
				search: { compare: compareSelection.join(",") },
				replace: true,
			} as unknown as Parameters<typeof navigate>[0]);
			setActiveTab("compare");
		}
	}, [compareSelection, navigate]);

	// Add program to interests
	const handleAddInterest = useCallback(() => {
		if (!selectedProgramForInterest) return;

		const program = trainingPrograms.find((p) => p.id === selectedProgramForInterest);
		if (!program) return;

		addInterestMutation.mutate({
			programId: program.id,
			programName: program.name,
			programType: "imta_program",
			category: fieldToCategory(program.field),
			notes: interestNotes || undefined,
		});

		setSelectedProgramForInterest("");
		setInterestNotes("");
		setIsAddInterestDialogOpen(false);
	}, [selectedProgramForInterest, interestNotes, addInterestMutation]);

	// Add custom training interest
	const handleAddCustomInterest = useCallback(() => {
		if (!customProgram.name.trim()) return;

		const customNotes = [
			customProgram.description,
			customProgram.duration ? `Duration: ${customProgram.duration}` : "",
			customProgram.institution ? `Institution: ${customProgram.institution}` : "",
		]
			.filter(Boolean)
			.join("\n");

		addInterestMutation.mutate({
			programId: `custom-${Date.now()}`,
			programName: customProgram.name,
			programType: "external_course",
			category: fieldToCategory(customProgram.field),
			notes: customNotes || undefined,
		});

		setCustomProgram({
			name: "",
			field: "business",
			duration: "",
			institution: "",
			description: "",
		});
		setIsAddCustomDialogOpen(false);
	}, [customProgram, addInterestMutation]);

	// Remove interest
	const handleRemoveInterest = useCallback(
		(id: string) => {
			deleteInterestMutation.mutate({ id });
		},
		[deleteInterestMutation],
	);

	// Check if program is in interests
	const isInInterests = useCallback(
		(programId: string) => {
			return interests.some((i) => i.programId === programId);
		},
		[interests],
	);

	// Quick add to interests (from card)
	const quickAddToInterests = useCallback(
		(program: TrainingProgram) => {
			if (isInInterests(program.id)) return;

			addInterestMutation.mutate({
				programId: program.id,
				programName: program.name,
				programType: "imta_program",
				category: fieldToCategory(program.field),
			});
		},
		[isInInterests, addInterestMutation],
	);

	return (
		<>
			<DashboardHeader icon={GraduationCapIcon} title={t`Training Programs Catalog`} />

			{/* Back navigation */}
			<div className="mb-6">
				<Link to="/dashboard/resources">
					<Button variant="ghost" size="sm" className="gap-2">
						<ArrowLeftIcon className="size-4" />
						<Trans>Back to Training Center</Trans>
					</Button>
				</Link>
			</div>

			{/* Hero Section */}
			<HeroSection
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				selectedField={selectedField}
				onFieldChange={setSelectedField}
				interestsCount={interests.length}
			/>

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-8">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<TabsList className="h-auto flex-wrap gap-2 bg-transparent p-0">
						<TabsTrigger
							value="catalog"
							className="gap-2 rounded-full border px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
						>
							<GraduationCapIcon className="size-4" />
							<Trans>Catalog</Trans>
							<Badge variant="secondary" className="ml-1">
								{filteredPrograms.length}
							</Badge>
						</TabsTrigger>
						<TabsTrigger
							value="compare"
							className="gap-2 rounded-full border px-6 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
						>
							<ScalesIcon className="size-4" />
							<Trans>Compare</Trans>
							{compareSelection.length > 0 && (
								<Badge variant="secondary" className="ml-1">
									{compareSelection.length}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger
							value="interests"
							className="gap-2 rounded-full border px-6 data-[state=active]:bg-amber-500 data-[state=active]:text-white"
						>
							<BookmarkSimpleIcon className="size-4" />
							<Trans>My Interests</Trans>
							{interests.length > 0 && (
								<Badge variant="secondary" className="ml-1">
									{interests.length}
								</Badge>
							)}
						</TabsTrigger>
					</TabsList>

					{/* Compare Button */}
					{activeTab === "catalog" && compareSelection.length >= 2 && (
						<Button className="gap-2" onClick={updateCompareUrl}>
							<ScalesIcon className="size-4" />
							<Trans>Compare</Trans> ({compareSelection.length})
						</Button>
					)}
				</div>

				{/* Catalog Tab */}
				<TabsContent value="catalog">
					<CatalogTabContent
						selectedField={selectedField}
						programsByField={programsByField}
						filteredPrograms={filteredPrograms}
						compareSelection={compareSelection}
						isInInterests={isInInterests}
						onToggleCompare={toggleCompare}
						onQuickAddToInterests={quickAddToInterests}
					/>
				</TabsContent>

				{/* Compare Tab */}
				<TabsContent value="compare">
					<CompareTabContent
						compareSelection={compareSelection}
						programsToCompare={programsToCompare}
						isCompareOpen={isCompareOpen}
						onCompareOpenChange={setIsCompareOpen}
						onToggleCompare={toggleCompare}
						isInInterests={isInInterests}
						onQuickAddToInterests={quickAddToInterests}
					/>
				</TabsContent>

				{/* Interests Tab */}
				<TabsContent value="interests">
					<InterestsTabContent
						interests={interests}
						isAddInterestDialogOpen={isAddInterestDialogOpen}
						onAddInterestDialogChange={setIsAddInterestDialogOpen}
						isAddCustomDialogOpen={isAddCustomDialogOpen}
						onAddCustomDialogChange={setIsAddCustomDialogOpen}
						selectedProgramForInterest={selectedProgramForInterest}
						onSelectedProgramChange={setSelectedProgramForInterest}
						interestNotes={interestNotes}
						onInterestNotesChange={setInterestNotes}
						onAddInterest={handleAddInterest}
						customProgram={customProgram}
						onCustomProgramChange={setCustomProgram}
						onAddCustomInterest={handleAddCustomInterest}
						onRemoveInterest={handleRemoveInterest}
						isInInterests={isInInterests}
						onSetActiveTab={setActiveTab}
					/>
				</TabsContent>
			</Tabs>
		</>
	);
}
