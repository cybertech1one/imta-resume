import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	BookmarkSimpleIcon,
	CheckCircleIcon,
	ClockIcon,
	FirstAidKitIcon,
	GearIcon,
	GraduationCapIcon,
	HardHatIcon,
	PencilSimpleIcon,
	PlusCircleIcon,
	SpinnerIcon,
	WarningCircleIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/resources/my-programs" as any)({
	component: MyPrograms,
	errorComponent: ErrorComponent,
});

// Category configurations
const categoryIcons: Record<string, Icon> = {
	healthcare: FirstAidKitIcon,
	industrial: GearIcon,
	hse: HardHatIcon,
};

const categoryLabels: Record<string, string> = {
	healthcare: "Health",
	industrial: "Industry",
	hse: "HSE",
	technology: "Technology",
	business: "Business",
	other: "Other",
};

const categoryColors: Record<string, string> = {
	healthcare: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	industrial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	hse: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	technology: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	business: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const statusIcons: Record<string, Icon> = {
	interested: BookmarkSimpleIcon,
	in_progress: ClockIcon,
	completed: CheckCircleIcon,
};

const statusLabels: Record<string, string> = {
	interested: "Interested",
	in_progress: "In Progress",
	completed: "Completed",
};

const statusColors: Record<string, string> = {
	interested: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

function MyPrograms() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [isAddTrainingDialogOpen, setIsAddTrainingDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedProgramForTracking, setSelectedProgramForTracking] = useState<string>("");
	const [trainingNotes, setTrainingNotes] = useState("");
	const [editingTraining, setEditingTraining] = useState<{
		id: string;
		status: string;
		notes: string;
	} | null>(null);

	// Fetch programs for the select dropdown
	const { data: programs } = useQuery({
		...orpc.resources.getPrograms.queryOptions({ input: { language: "fr" } }),
		enabled: !!session?.user,
	});

	// Fetch user's training interests from database
	const {
		data: myTrainings = [],
		isLoading,
		error,
	} = useQuery({
		...orpc.training.getMyTrainingInterests.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	// Add training interest mutation
	const addTrainingMutation = useMutation(
		orpc.training.addTrainingInterest.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["training", "getMyTrainingInterests"] });
				queryClient.invalidateQueries({ queryKey: ["training", "getTrainingStats"] });
				setSelectedProgramForTracking("");
				setTrainingNotes("");
				setIsAddTrainingDialogOpen(false);
			},
		}),
	);

	// Update training interest mutation
	const updateTrainingMutation = useMutation(
		orpc.training.updateTrainingInterest.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["training", "getMyTrainingInterests"] });
				queryClient.invalidateQueries({ queryKey: ["training", "getTrainingStats"] });
				setEditingTraining(null);
				setIsEditDialogOpen(false);
			},
		}),
	);

	// Delete training interest mutation
	const deleteTrainingMutation = useMutation(
		orpc.training.deleteTrainingInterest.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["training", "getMyTrainingInterests"] });
				queryClient.invalidateQueries({ queryKey: ["training", "getTrainingStats"] });
			},
		}),
	);

	// Add training interest handler
	const handleAddTraining = () => {
		if (!selectedProgramForTracking || !programs) return;
		const program = programs.find((p) => p.id === selectedProgramForTracking);
		if (!program) return;

		// Map program category to training category
		const categoryMap: Record<string, "healthcare" | "industrial" | "hse" | "technology" | "business" | "other"> = {
			healthcare: "healthcare",
			industrial: "industrial",
			hse: "hse",
		};

		addTrainingMutation.mutate({
			programId: program.id,
			programName: program.name,
			programType: "imta_program",
			category: categoryMap[program.category] || "other",
			notes: trainingNotes || undefined,
		});
	};

	// Edit training handler
	const handleEditTraining = (training: { id: string; status: string; notes: string | null }) => {
		setEditingTraining({
			id: training.id,
			status: training.status,
			notes: training.notes || "",
		});
		setIsEditDialogOpen(true);
	};

	// Save edit handler
	const handleSaveEdit = () => {
		if (!editingTraining) return;

		updateTrainingMutation.mutate({
			id: editingTraining.id,
			status: editingTraining.status as "interested" | "in_progress" | "completed",
			notes: editingTraining.notes || undefined,
		});
	};

	// Remove training interest
	const handleRemoveTraining = (id: string) => {
		deleteTrainingMutation.mutate({ id });
	};

	// Calculate progress based on status
	const getProgressFromStatus = (status: string): number => {
		switch (status) {
			case "completed":
				return 100;
			case "in_progress":
				return 50;
			default:
				return 0;
		}
	};

	// Loading state
	if (isLoading) {
		return (
			<>
				<DashboardHeader icon={BookmarkSimpleIcon} title={t`My Programs`} />
				<div className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-4">
						<SpinnerIcon className="size-8 animate-spin text-primary" />
						<p className="text-muted-foreground">
							<Trans>Loading your programs...</Trans>
						</p>
					</div>
				</div>
			</>
		);
	}

	// Error state
	if (error) {
		return (
			<>
				<DashboardHeader icon={BookmarkSimpleIcon} title={t`My Programs`} />
				<Card className="border-destructive">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<WarningCircleIcon className="mb-4 size-12 text-destructive" />
						<h3 className="mb-2 font-medium text-lg">
							<Trans>Loading error</Trans>
						</h3>
						<p className="max-w-sm text-muted-foreground">
							<Trans>Unable to load your programs. Please try again.</Trans>
						</p>
					</CardContent>
				</Card>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={BookmarkSimpleIcon} title={t`My Programs`} />

			{/* Hero Section */}
			<motion.div
				className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8"
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<div className="relative z-10">
					<h2 className="mb-4 font-bold text-2xl tracking-tight md:text-3xl">
						<Trans>Track Your Training</Trans>
					</h2>
					<p className="mb-6 max-w-2xl text-muted-foreground">
						<Trans>
							Keep track of your programs of interest, monitor your progress, and receive personalized recommendations
							for your career path.
						</Trans>
					</p>

					{/* Add Training Dialog */}
					<Dialog open={isAddTrainingDialogOpen} onOpenChange={setIsAddTrainingDialogOpen}>
						<DialogTrigger asChild>
							<Button className="gap-2">
								<PlusCircleIcon className="size-5" />
								<Trans>Add a program</Trans>
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-lg">
							<DialogHeader>
								<DialogTitle>
									<Trans>Add a training interest</Trans>
								</DialogTitle>
								<DialogDescription>
									<Trans>Select a program you want to follow and add personal notes.</Trans>
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label>
										<Trans>Program</Trans>
									</Label>
									<Select value={selectedProgramForTracking} onValueChange={setSelectedProgramForTracking}>
										<SelectTrigger>
											<SelectValue placeholder={t`Select a program...`} />
										</SelectTrigger>
										<SelectContent>
											{programs?.map((program) => (
												<SelectItem key={program.id} value={program.id}>
													<div className="flex items-center gap-2">
														<Badge
															className={cn("text-xs", categoryColors[program.category] || "bg-gray-100 text-gray-700")}
														>
															{categoryLabels[program.category] || program.category}
														</Badge>
														{program.name}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label>
										<Trans>Personal notes (optional)</Trans>
									</Label>
									<Textarea
										placeholder={t`Add notes about your goals, your progress...`}
										value={trainingNotes}
										onChange={(e) => setTrainingNotes(e.target.value)}
										rows={3}
									/>
								</div>
							</div>

							<DialogFooter>
								<DialogClose asChild>
									<Button variant="outline">
										<Trans>Cancel</Trans>
									</Button>
								</DialogClose>
								<Button
									onClick={handleAddTraining}
									disabled={!selectedProgramForTracking || addTrainingMutation.isPending}
								>
									{addTrainingMutation.isPending ? (
										<SpinnerIcon className="mr-2 size-4 animate-spin" />
									) : (
										<PlusCircleIcon className="mr-2 size-4" />
									)}
									<Trans>Add</Trans>
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</motion.div>

			{/* Edit Training Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>
							<Trans>Edit program</Trans>
						</DialogTitle>
						<DialogDescription>
							<Trans>Update the status and notes of your program.</Trans>
						</DialogDescription>
					</DialogHeader>

					{editingTraining && (
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label>
									<Trans>Status</Trans>
								</Label>
								<Select
									value={editingTraining.status}
									onValueChange={(value) => setEditingTraining({ ...editingTraining, status: value })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="interested">
											<div className="flex items-center gap-2">
												<BookmarkSimpleIcon className="size-4" />
												<Trans>Interested</Trans>
											</div>
										</SelectItem>
										<SelectItem value="in_progress">
											<div className="flex items-center gap-2">
												<ClockIcon className="size-4" />
												<Trans>In progress</Trans>
											</div>
										</SelectItem>
										<SelectItem value="completed">
											<div className="flex items-center gap-2">
												<CheckCircleIcon className="size-4" />
												<Trans>Completed</Trans>
											</div>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>
									<Trans>Personal notes</Trans>
								</Label>
								<Textarea
									placeholder={t`Add notes about your goals, your progress...`}
									value={editingTraining.notes}
									onChange={(e) => setEditingTraining({ ...editingTraining, notes: e.target.value })}
									rows={3}
								/>
							</div>
						</div>
					)}

					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">
								<Trans>Cancel</Trans>
							</Button>
						</DialogClose>
						<Button onClick={handleSaveEdit} disabled={updateTrainingMutation.isPending}>
							{updateTrainingMutation.isPending ? (
								<SpinnerIcon className="mr-2 size-4 animate-spin" />
							) : (
								<CheckCircleIcon className="mr-2 size-4" />
							)}
							<Trans>Save</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Training Cards */}
			{myTrainings.length > 0 ? (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{myTrainings.map((training, index) => {
						const CategoryIcon = categoryIcons[training.category] || GraduationCapIcon;
						const StatusIcon = statusIcons[training.status] || BookmarkSimpleIcon;
						const progress = getProgressFromStatus(training.status);

						return (
							<motion.div
								key={training.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card className="h-full transition-all duration-300 hover:shadow-lg">
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-center gap-3">
												<div
													className={cn(
														"flex size-12 items-center justify-center rounded-xl",
														categoryColors[training.category] || "bg-gray-100 text-gray-700",
													)}
												>
													<CategoryIcon className="size-6" weight="duotone" />
												</div>
												<div>
													<CardTitle className="text-lg">{training.programName}</CardTitle>
													<CardDescription>
														<Trans>Added on</Trans> {new Date(training.createdAt).toLocaleDateString("fr-FR")}
													</CardDescription>
												</div>
											</div>
											<div className="flex gap-1">
												<Button
													variant="ghost"
													size="icon"
													className="text-muted-foreground hover:text-primary"
													onClick={() => handleEditTraining(training)}
												>
													<PencilSimpleIcon className="size-4" />
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="text-muted-foreground hover:text-destructive"
														>
															<XIcon className="size-4" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																<Trans>Delete this program?</Trans>
															</AlertDialogTitle>
															<AlertDialogDescription>
																<Trans>
																	This action is irreversible. The program "{training.programName}" will be removed from
																	your list.
																</Trans>
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>
																<Trans>Cancel</Trans>
															</AlertDialogCancel>
															<AlertDialogAction onClick={() => handleRemoveTraining(training.id)}>
																<Trans>Delete</Trans>
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										{/* Status Badge */}
										<div className="flex items-center gap-2">
											<Badge className={cn("gap-1", statusColors[training.status])}>
												<StatusIcon className="size-3" weight="fill" />
												{statusLabels[training.status]}
											</Badge>
										</div>

										{training.notes && (
											<div className="rounded-lg bg-muted/50 p-3">
												<p className="text-muted-foreground text-sm">{training.notes}</p>
											</div>
										)}
										<div className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground">
													<Trans>Progress</Trans>
												</span>
												<span className="font-medium">{progress}%</span>
											</div>
											<Progress value={progress} className="h-2" />
										</div>
									</CardContent>
									<CardFooter className="gap-2 pt-0">
										<Link to="/dashboard/resources/programs/$programId" params={{ programId: training.programId }}>
											<Button variant="outline" size="sm" className="gap-1">
												<ArrowRightIcon className="size-4" />
												<Trans>View program</Trans>
											</Button>
										</Link>
									</CardFooter>
								</Card>
							</motion.div>
						);
					})}
				</div>
			) : (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<BookmarkSimpleIcon className="mb-4 size-16 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-xl">
							<Trans>No programs followed</Trans>
						</h3>
						<p className="mb-6 max-w-md text-center text-muted-foreground">
							<Trans>
								Start tracking your programs of interest to keep a record of your progress and receive personalized
								recommendations.
							</Trans>
						</p>
						<Button className="gap-2" onClick={() => setIsAddTrainingDialogOpen(true)}>
							<PlusCircleIcon className="size-5" />
							<Trans>Add my first program</Trans>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Quick Links */}
			<div className="mt-8 grid gap-4 md:grid-cols-2">
				<Link to="/dashboard/resources">
					<Card className="cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-md">
						<CardContent className="flex items-center gap-4 p-6">
							<div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
								<GraduationCapIcon className="size-6 text-primary" weight="duotone" />
							</div>
							<div>
								<h4 className="font-semibold">
									<Trans>Explore Programs</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Discover all our available programs</Trans>
								</p>
							</div>
							<ArrowRightIcon className="ml-auto size-5 text-muted-foreground" />
						</CardContent>
					</Card>
				</Link>

				<Link to={"/dashboard/resources/compare" as string}>
					<Card className="cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-md">
						<CardContent className="flex items-center gap-4 p-6">
							<div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10">
								<GearIcon className="size-6 text-amber-500" weight="duotone" />
							</div>
							<div>
								<h4 className="font-semibold">
									<Trans>Compare Programs</Trans>
								</h4>
								<p className="text-muted-foreground text-sm">
									<Trans>Compare training programs to make the right choice</Trans>
								</p>
							</div>
							<ArrowRightIcon className="ml-auto size-5 text-muted-foreground" />
						</CardContent>
					</Card>
				</Link>
			</div>
		</>
	);
}
