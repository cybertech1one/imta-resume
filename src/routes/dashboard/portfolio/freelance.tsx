import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { BriefcaseIcon, CopyIcon, RocketLaunchIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	AvailabilityCard,
	HeroSection,
	PackagesCard,
	PortfolioCard,
	ProfileInfoCard,
	ProfileStrengthCard,
	ProposalPreviewDialog,
	ProposalTemplatesCard,
	RateCalculatorCard,
	SkillsCard,
	TestimonialsCard,
} from "./-components/freelance-components";
import type { PackageFormValues, SkillFormValues } from "./-components/freelance-config";
import {
	DEFAULT_AVAILABILITY,
	PLATFORM_CONFIG,
	packageFormSchema,
	skillFormSchema,
} from "./-components/freelance-config";
import type { FreelanceAvailability, PackageTier, PlatformType } from "./-components/freelance-types";
import { calculateProfileStrength } from "./-components/freelance-utils";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/portfolio/freelance" as any)({
	component: FreelanceProfileBuilder,
	errorComponent: ErrorComponent,
});

// Main Component
function FreelanceProfileBuilder() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activePlatform, setActivePlatform] = useState<PlatformType>("upwork");
	const [selectedProposal, setSelectedProposal] = useState<{
		id: string;
		name: string;
		category: string;
		content: string;
		variables: string[];
		usageCount: number;
	} | null>(null);
	const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);
	const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
	const [editingPackage, setEditingPackage] = useState<{
		id: string;
		tier: PackageTier;
		name: string;
		description: string;
		price: number;
		deliveryDays: number;
		revisions: number;
		features: string[];
	} | null>(null);
	const [isAddPackageDialogOpen, setIsAddPackageDialogOpen] = useState(false);
	const [isAddSkillDialogOpen, setIsAddSkillDialogOpen] = useState(false);

	// Form for adding new skill
	const skillForm = useForm<SkillFormValues>({
		resolver: zodResolver(skillFormSchema),
		defaultValues: {
			name: "",
			proficiency: "intermediate",
			yearsExperience: 0,
		},
	});

	// Form for adding new package
	const packageForm = useForm<PackageFormValues>({
		resolver: zodResolver(packageFormSchema),
		defaultValues: {
			tier: "basic",
			name: "",
			description: "",
			price: 0,
			deliveryDays: 7,
			revisions: 2,
			features: [],
		},
	});

	// Form for editing package
	const editPackageForm = useForm<PackageFormValues>({
		resolver: zodResolver(packageFormSchema),
		defaultValues: {
			tier: "basic",
			name: "",
			description: "",
			price: 0,
			deliveryDays: 7,
			revisions: 2,
			features: [],
		},
	});
	const [rateCalculatorHours, setRateCalculatorHours] = useState(40);
	const [rateCalculatorExpenses, setRateCalculatorExpenses] = useState(2000);
	const [rateCalculatorProfit, setRateCalculatorProfit] = useState(30);

	// Fetch all freelance data
	const { data: freelanceData, isLoading } = useQuery({
		...orpc.freelance.getAll.queryOptions(),
		enabled: !!session?.user,
	});

	// Profile mutation
	const updateProfileMutation = useMutation(
		orpc.freelance.updateProfile.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["freelance"] });
			},
		}),
	);

	// Skills mutations
	const createSkillMutation = useMutation({
		...orpc.freelance.skills.create.mutationOptions(),
		onMutate: async (newSkillData) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["freelance"] });

			// Snapshot previous value
			const previousData = queryClient.getQueryData(orpc.freelance.getAll.key());

			// Optimistically update
			queryClient.setQueryData(orpc.freelance.getAll.key(), (old: typeof freelanceData) => {
				if (!old) return old;
				const optimisticSkill = {
					id: `temp-${Date.now()}`,
					userId: "",
					name: newSkillData.name,
					proficiency: newSkillData.proficiency,
					yearsExperience: newSkillData.yearsExperience,
					createdAt: new Date(),
				};
				return {
					...old,
					skills: [optimisticSkill, ...old.skills],
				};
			});

			// Close dialog immediately for better UX
			setIsAddSkillDialogOpen(false);
			skillForm.reset();

			return { previousData };
		},
		onError: (_error, _newSkillData, context) => {
			// Rollback on error
			if (context?.previousData) {
				queryClient.setQueryData(orpc.freelance.getAll.key(), context.previousData);
			}
		},
		onSettled: () => {
			// Always refetch after mutation
			queryClient.invalidateQueries({ queryKey: ["freelance"] });
		},
	});

	const deleteSkillMutation = useMutation(
		orpc.freelance.skills.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["freelance"] });
			},
		}),
	);

	// Package mutations
	const createPackageMutation = useMutation({
		...orpc.freelance.packages.create.mutationOptions(),
		onMutate: async (newPackageData) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["freelance"] });

			// Snapshot previous value
			const previousData = queryClient.getQueryData(orpc.freelance.getAll.key());

			// Optimistically update
			queryClient.setQueryData(orpc.freelance.getAll.key(), (old: typeof freelanceData) => {
				if (!old) return old;
				const optimisticPackage = {
					id: `temp-${Date.now()}`,
					userId: "",
					tier: newPackageData.tier,
					name: newPackageData.name,
					description: newPackageData.description || "",
					price: newPackageData.price,
					deliveryDays: newPackageData.deliveryDays,
					revisions: newPackageData.revisions,
					features: newPackageData.features || [],
					createdAt: new Date(),
				};
				return {
					...old,
					packages: [...old.packages, optimisticPackage],
				};
			});

			// Close dialog immediately for better UX
			setIsAddPackageDialogOpen(false);
			packageForm.reset();

			return { previousData };
		},
		onError: (_error, _newPackageData, context) => {
			// Rollback on error
			if (context?.previousData) {
				queryClient.setQueryData(orpc.freelance.getAll.key(), context.previousData);
			}
		},
		onSettled: () => {
			// Always refetch after mutation
			queryClient.invalidateQueries({ queryKey: ["freelance"] });
		},
	});

	const updatePackageMutation = useMutation(
		orpc.freelance.packages.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["freelance"] });
				setIsPackageDialogOpen(false);
				setEditingPackage(null);
			},
		}),
	);

	const deletePackageMutation = useMutation(
		orpc.freelance.packages.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["freelance"] });
			},
		}),
	);

	// Proposal mutations
	const incrementProposalUsageMutation = useMutation(
		orpc.freelance.proposals.incrementUsage.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["freelance"] });
			},
		}),
	);

	// Extract data from query
	const profile = freelanceData?.profile ?? null;
	const skills = freelanceData?.skills ?? [];
	const packages = freelanceData?.packages ?? [];
	const portfolio = freelanceData?.portfolio ?? [];
	const testimonials = freelanceData?.testimonials ?? [];
	const proposals = freelanceData?.proposals ?? [];

	// Create local profile state for editing
	const localProfile = useMemo(
		() => ({
			headline: profile?.headline ?? "",
			bio: profile?.bio ?? "",
			hourlyRate: profile?.hourlyRate ?? 0,
			projectMinRate: profile?.projectMinRate ?? 0,
			availability: (profile?.availability as FreelanceAvailability) ?? DEFAULT_AVAILABILITY,
			availableHoursPerWeek: profile?.availableHoursPerWeek ?? 35,
		}),
		[profile],
	);

	// Calculate profile strength
	const profileStrength = useMemo(
		() => calculateProfileStrength(localProfile, skills, packages, portfolio, testimonials),
		[localProfile, skills, packages, portfolio, testimonials],
	);

	// Calculate rates
	const calculatedHourlyRate = useMemo(() => {
		const monthlyTarget = rateCalculatorExpenses * (1 + rateCalculatorProfit / 100);
		const weeklyHours = rateCalculatorHours;
		const monthlyHours = weeklyHours * 4;
		return Math.round(monthlyTarget / monthlyHours);
	}, [rateCalculatorHours, rateCalculatorExpenses, rateCalculatorProfit]);

	const calculatedProjectRate = useMemo(() => {
		return calculatedHourlyRate * 8;
	}, [calculatedHourlyRate]);

	// Copy profile to clipboard
	const copyProfileToClipboard = useCallback(() => {
		const profileText = `${localProfile.headline}\n\n${localProfile.bio}\n\nCompetences: ${skills.map((s) => s.name).join(", ")}\n\nTaux horaire: ${localProfile.hourlyRate} EUR`;
		navigator.clipboard.writeText(profileText);
	}, [localProfile, skills]);

	// Handle profile update
	const handleProfileUpdate = useCallback(
		(updates: Partial<typeof localProfile>) => {
			updateProfileMutation.mutate({
				headline: updates.headline,
				bio: updates.bio,
				hourlyRate: updates.hourlyRate,
				projectMinRate: updates.projectMinRate,
				availability: updates.availability,
				availableHoursPerWeek: updates.availableHoursPerWeek,
			});
		},
		[updateProfileMutation],
	);

	// Handle package update (with form validation)
	const onEditPackageSubmit = useCallback(
		(values: PackageFormValues) => {
			if (!editingPackage) return;
			updatePackageMutation.mutate({
				id: editingPackage.id,
				tier: values.tier,
				name: values.name,
				description: values.description || "",
				price: values.price,
				deliveryDays: values.deliveryDays,
				revisions: values.revisions,
				features: values.features || [],
			});
		},
		[editingPackage, updatePackageMutation],
	);

	// Handle add package (with form validation)
	const onAddPackageSubmit = useCallback(
		(values: PackageFormValues) => {
			createPackageMutation.mutate({
				tier: values.tier,
				name: values.name,
				description: values.description || "",
				price: values.price,
				deliveryDays: values.deliveryDays,
				revisions: values.revisions,
				features: values.features || [],
			});
		},
		[createPackageMutation],
	);

	// Handle add skill (with form validation)
	const onAddSkillSubmit = useCallback(
		(values: SkillFormValues) => {
			createSkillMutation.mutate(values);
		},
		[createSkillMutation],
	);

	// Handle copy proposal
	const handleCopyProposal = useCallback(() => {
		if (selectedProposal) {
			navigator.clipboard.writeText(selectedProposal.content);
			incrementProposalUsageMutation.mutate({ id: selectedProposal.id });
		}
	}, [selectedProposal, incrementProposalUsageMutation]);

	// Handle edit package
	const handleEditPackage = useCallback(
		(pkg: {
			id: string;
			tier: PackageTier;
			name: string;
			description: string;
			price: number;
			deliveryDays: number;
			revisions: number;
			features: string[];
		}) => {
			setEditingPackage(pkg);
			editPackageForm.reset({
				tier: pkg.tier,
				name: pkg.name,
				description: pkg.description,
				price: pkg.price,
				deliveryDays: pkg.deliveryDays,
				revisions: pkg.revisions,
				features: pkg.features,
			});
			setIsPackageDialogOpen(true);
		},
		[editPackageForm],
	);

	// Platform specific character limits
	const platformLimits = useMemo(
		() => ({
			upwork: { headline: 100, bio: 5000 },
			fiverr: { headline: 80, bio: 1200 },
			linkedin: { headline: 220, bio: 2600 },
		}),
		[],
	);

	if (isLoading) {
		return (
			<>
				<DashboardHeader icon={BriefcaseIcon} title={t`Profil Freelance`} />
				<div className="flex h-64 items-center justify-center">
					<div className="text-muted-foreground">
						<Trans>Loading...</Trans>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={BriefcaseIcon} title={t`Profil Freelance`} />

			<HeroSection
				profileStrength={profileStrength}
				hourlyRate={localProfile.hourlyRate}
				testimonialCount={testimonials.length}
			/>

			{/* Platform Tabs */}
			<Tabs value={activePlatform} onValueChange={(v) => setActivePlatform(v as PlatformType)} className="space-y-8">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<TabsList className="flex h-auto gap-2 bg-transparent p-0">
						{(Object.entries(PLATFORM_CONFIG) as [PlatformType, (typeof PLATFORM_CONFIG)[PlatformType]][]).map(
							([key, config]) => {
								const IconComponent = config.icon;
								return (
									<TabsTrigger
										key={key}
										value={key}
										className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
									>
										<IconComponent className="size-4" />
										{config.label}
									</TabsTrigger>
								);
							},
						)}
					</TabsList>

					<div className="flex items-center gap-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="outline" size="icon" onClick={copyProfileToClipboard}>
									<CopyIcon className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<Trans>Copy Profile</Trans>
							</TooltipContent>
						</Tooltip>
						<Button className="gap-2">
							<RocketLaunchIcon className="size-4" />
							<Trans>Publish Profile</Trans>
						</Button>
					</div>
				</div>

				{/* Profile Content for each platform */}
				{(Object.keys(PLATFORM_CONFIG) as PlatformType[]).map((platform) => (
					<TabsContent key={platform} value={platform} className="space-y-8">
						<div className="grid gap-8 lg:grid-cols-3">
							{/* Main Profile Editor */}
							<div className="space-y-6 lg:col-span-2">
								<ProfileInfoCard
									platform={platform}
									localProfile={localProfile}
									platformLimits={platformLimits[platform]}
									onProfileUpdate={handleProfileUpdate}
								/>

								<SkillsCard
									skills={skills}
									isAddSkillDialogOpen={isAddSkillDialogOpen}
									setIsAddSkillDialogOpen={setIsAddSkillDialogOpen}
									skillForm={skillForm}
									onAddSkillSubmit={onAddSkillSubmit}
									createSkillPending={createSkillMutation.isPending}
									onDeleteSkill={(id) => deleteSkillMutation.mutate({ id })}
								/>

								<PackagesCard
									packages={packages}
									isAddPackageDialogOpen={isAddPackageDialogOpen}
									setIsAddPackageDialogOpen={setIsAddPackageDialogOpen}
									isPackageDialogOpen={isPackageDialogOpen}
									setIsPackageDialogOpen={setIsPackageDialogOpen}
									editingPackage={editingPackage}
									packageForm={packageForm}
									editPackageForm={editPackageForm}
									onAddPackageSubmit={onAddPackageSubmit}
									onEditPackageSubmit={onEditPackageSubmit}
									createPackagePending={createPackageMutation.isPending}
									updatePackagePending={updatePackageMutation.isPending}
									onDeletePackage={(id) => deletePackageMutation.mutate({ id })}
									onEditPackage={handleEditPackage}
								/>
							</div>

							{/* Sidebar */}
							<div className="space-y-6">
								<ProfileStrengthCard profileStrength={profileStrength} />

								<RateCalculatorCard
									rateCalculatorHours={rateCalculatorHours}
									setRateCalculatorHours={setRateCalculatorHours}
									rateCalculatorExpenses={rateCalculatorExpenses}
									setRateCalculatorExpenses={setRateCalculatorExpenses}
									rateCalculatorProfit={rateCalculatorProfit}
									setRateCalculatorProfit={setRateCalculatorProfit}
									calculatedHourlyRate={calculatedHourlyRate}
									calculatedProjectRate={calculatedProjectRate}
									onApplyRates={() =>
										handleProfileUpdate({
											hourlyRate: calculatedHourlyRate,
											projectMinRate: calculatedProjectRate,
										})
									}
								/>

								<AvailabilityCard localProfile={localProfile} onProfileUpdate={handleProfileUpdate} />
							</div>
						</div>

						<PortfolioCard portfolio={portfolio} />

						<TestimonialsCard testimonials={testimonials} />

						<ProposalTemplatesCard
							proposals={proposals}
							onSelectProposal={(proposal) => {
								setSelectedProposal(proposal);
								setIsProposalDialogOpen(true);
							}}
						/>
					</TabsContent>
				))}
			</Tabs>

			<ProposalPreviewDialog
				isOpen={isProposalDialogOpen}
				onOpenChange={setIsProposalDialogOpen}
				selectedProposal={selectedProposal}
				onCopyProposal={handleCopyProposal}
			/>
		</>
	);
}
