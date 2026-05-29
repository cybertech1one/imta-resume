import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CalendarIcon,
	ClockIcon,
	FunnelIcon,
	MagnifyingGlassIcon,
	NoteIcon,
	PlusIcon,
	SortAscendingIcon,
	SortDescendingIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import type { DeadlineCardActions } from "./-components/deadlines-components";
import {
	CalendarView,
	DeadlineFormDialog,
	DeleteConfirmDialog,
	HeroSection,
	ListView,
	StatsPanel,
	TimelineView,
	UpcomingWidget,
} from "./-components/deadlines-components";
import { getDaysInMonth, getDeadlineStatus, getDefaultFormData, priorityConfig } from "./-components/deadlines-config";
import type { Deadline, DeadlineFormValues, DeadlineStatus, Priority } from "./-components/deadlines-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/jobs/deadlines" as any)({
	component: DeadlineTrackerPage,
	errorComponent: ErrorComponent,
});

function DeadlineTrackerPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	// State
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<DeadlineStatus | "all">("all");
	const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [activeTab, setActiveTab] = useState<"timeline" | "calendar" | "list">("timeline");
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);

	// Dialog states
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

	// Form validation schema - defined inside component to ensure locale is active
	const deadlineFormSchema = useMemo(
		() =>
			z.object({
				title: z.string().min(1, t`Title is required`).max(100, t`Title cannot exceed 100 characters`),
				company: z.string().min(1, t`Company is required`).max(100, t`Company name cannot exceed 100 characters`),
				position: z.string().max(100, t`Position cannot exceed 100 characters`).optional().or(z.literal("")),
				deadlineDate: z.string().min(1, t`Deadline date is required`),
				deadlineTime: z.string().optional().or(z.literal("")),
				priority: z.enum(["high", "medium", "low"]),
				notes: z.string().max(1000, t`Notes cannot exceed 1000 characters`).optional().or(z.literal("")),
				reminderEnabled: z.boolean(),
				reminderDate: z.string().nullable().optional(),
				reminderTime: z.string().nullable().optional(),
				completed: z.boolean(),
			}),
		[],
	);

	// Form with react-hook-form and zod validation
	const form = useForm<DeadlineFormValues>({
		resolver: zodResolver(deadlineFormSchema),
		defaultValues: getDefaultFormData(),
	});

	// Fetch deadlines from database
	const { data: deadlines = [] } = useQuery({
		...orpc.deadlines.list.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	// Fetch statistics from database
	const { data: statsData } = useQuery({
		...orpc.deadlines.getStatistics.queryOptions({ input: {} }),
		enabled: !!session?.user,
	});

	// Create mutation
	const createMutation = useMutation({
		...orpc.deadlines.create.mutationOptions(),
		onMutate: async (newDeadline) => {
			await queryClient.cancelQueries({ queryKey: ["deadlines"] });
			const previousDeadlines = queryClient.getQueryData(orpc.deadlines.list.key({ input: {} }));

			queryClient.setQueryData(orpc.deadlines.list.key({ input: {} }), (old: Deadline[] | undefined) => {
				if (!old) return old;
				const optimisticDeadline: Deadline = {
					id: `temp-${Date.now()}`,
					title: newDeadline.title,
					company: newDeadline.company,
					position: newDeadline.position || "",
					deadlineDate: newDeadline.deadlineDate,
					deadlineTime: newDeadline.deadlineTime || "23:59",
					priority: newDeadline.priority ?? "medium",
					notes: newDeadline.notes || "",
					reminderEnabled: newDeadline.reminderEnabled || false,
					reminderDate: newDeadline.reminderDate || null,
					reminderTime: newDeadline.reminderTime || null,
					completed: newDeadline.completed || false,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				return [optimisticDeadline, ...old];
			});

			setIsAddDialogOpen(false);
			resetForm();
			return { previousDeadlines };
		},
		onSuccess: () => {
			toast.success(t`Deadline added`);
		},
		onError: (error, _newDeadline, context) => {
			if (context?.previousDeadlines) {
				queryClient.setQueryData(orpc.deadlines.list.key({ input: {} }), context.previousDeadlines);
			}
			toast.error(error.message || t`Error adding deadline`);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["deadlines"] });
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		...orpc.deadlines.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deadlines"] });
			setEditingDeadline(null);
			resetForm();
			toast.success(t`Deadline updated`);
		},
		onError: (error) => {
			toast.error(error.message || t`Error during update`);
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		...orpc.deadlines.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deadlines"] });
			setDeleteConfirmId(null);
			toast.success(t`Deadline deleted`);
		},
		onError: (error) => {
			toast.error(error.message || t`Error during deletion`);
		},
	});

	// Toggle complete mutation
	const toggleCompleteMutation = useMutation({
		...orpc.deadlines.toggleComplete.mutationOptions(),
		onSuccess: (newCompleted) => {
			queryClient.invalidateQueries({ queryKey: ["deadlines"] });
			toast.success(newCompleted ? t`Marked as complete` : t`Marked as incomplete`);
		},
		onError: (error) => {
			toast.error(error.message || t`Error`);
		},
	});

	// Toggle reminder mutation
	const toggleReminderMutation = useMutation({
		...orpc.deadlines.toggleReminder.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deadlines"] });
		},
		onError: (error) => {
			toast.error(error.message || t`Error`);
		},
	});

	// Computed values
	const filteredDeadlines = useMemo(() => {
		const result = deadlines.filter((deadline) => {
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const matchesSearch =
					deadline.title.toLowerCase().includes(query) ||
					deadline.company.toLowerCase().includes(query) ||
					deadline.position.toLowerCase().includes(query);
				if (!matchesSearch) return false;
			}
			if (statusFilter !== "all") {
				const status = getDeadlineStatus(deadline);
				if (statusFilter === "completed" && !deadline.completed) return false;
				if (statusFilter === "upcoming" && (deadline.completed || status === "past")) return false;
				if (statusFilter === "past" && (deadline.completed || status !== "past")) return false;
			}
			if (priorityFilter !== "all" && deadline.priority !== priorityFilter) return false;
			return true;
		});

		result.sort((a, b) => {
			const dateA = new Date(`${a.deadlineDate}T${a.deadlineTime}`);
			const dateB = new Date(`${b.deadlineDate}T${b.deadlineTime}`);
			return sortOrder === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
		});

		return result;
	}, [deadlines, searchQuery, statusFilter, priorityFilter, sortOrder]);

	const groupedDeadlines = useMemo(() => {
		const groups: Record<string, Deadline[]> = {};
		for (const deadline of filteredDeadlines) {
			if (!groups[deadline.deadlineDate]) {
				groups[deadline.deadlineDate] = [];
			}
			groups[deadline.deadlineDate].push(deadline);
		}
		return groups;
	}, [filteredDeadlines]);

	const calendarDays = useMemo(() => {
		return getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
	}, [currentMonth]);

	const deadlinesByDate = useMemo(() => {
		const byDate: Record<string, Deadline[]> = {};
		for (const deadline of deadlines) {
			if (!byDate[deadline.deadlineDate]) {
				byDate[deadline.deadlineDate] = [];
			}
			byDate[deadline.deadlineDate].push(deadline);
		}
		return byDate;
	}, [deadlines]);

	const stats = useMemo(() => {
		if (!statsData) {
			return {
				total: 0,
				upcoming: 0,
				past: 0,
				completed: 0,
				highPriority: 0,
				thisWeek: 0,
				byPriority: { high: 0, medium: 0, low: 0 },
			};
		}
		return statsData;
	}, [statsData]);

	// Handlers
	const resetForm = useCallback(() => {
		form.reset(getDefaultFormData());
	}, [form]);

	const onSubmit = useCallback(
		(values: DeadlineFormValues) => {
			if (editingDeadline) {
				updateMutation.mutate({
					id: editingDeadline.id,
					title: values.title,
					company: values.company,
					position: values.position || undefined,
					deadlineDate: values.deadlineDate,
					deadlineTime: values.deadlineTime || undefined,
					priority: values.priority,
					notes: values.notes || undefined,
					reminderEnabled: values.reminderEnabled,
					reminderDate: values.reminderDate || null,
					reminderTime: values.reminderTime || null,
					completed: values.completed,
				});
			} else {
				createMutation.mutate({
					title: values.title,
					company: values.company,
					position: values.position || undefined,
					deadlineDate: values.deadlineDate,
					deadlineTime: values.deadlineTime || undefined,
					priority: values.priority,
					notes: values.notes || undefined,
					reminderEnabled: values.reminderEnabled,
					reminderDate: values.reminderDate || undefined,
					reminderTime: values.reminderTime || undefined,
					completed: values.completed,
				});
			}
		},
		[editingDeadline, createMutation, updateMutation],
	);

	const handleDeleteDeadline = useCallback(
		(id: string) => {
			deleteMutation.mutate({ id });
		},
		[deleteMutation],
	);

	const handleToggleComplete = useCallback(
		(id: string) => {
			toggleCompleteMutation.mutate({ id });
		},
		[toggleCompleteMutation],
	);

	const handleToggleReminder = useCallback(
		(id: string) => {
			toggleReminderMutation.mutate({ id });
		},
		[toggleReminderMutation],
	);

	const openEditDialog = useCallback(
		(deadline: Deadline) => {
			form.reset({
				title: deadline.title,
				company: deadline.company,
				position: deadline.position,
				deadlineDate: deadline.deadlineDate,
				deadlineTime: deadline.deadlineTime,
				priority: deadline.priority,
				notes: deadline.notes,
				reminderEnabled: deadline.reminderEnabled,
				reminderDate: deadline.reminderDate,
				reminderTime: deadline.reminderTime,
				completed: deadline.completed,
			});
			setEditingDeadline(deadline);
		},
		[form],
	);

	const navigateMonth = useCallback((direction: "prev" | "next") => {
		setCurrentMonth((prev) => {
			const newMonth = new Date(prev);
			if (direction === "prev") {
				newMonth.setMonth(newMonth.getMonth() - 1);
			} else {
				newMonth.setMonth(newMonth.getMonth() + 1);
			}
			return newMonth;
		});
	}, []);

	// Shared card action props
	const cardActions: DeadlineCardActions = useMemo(
		() => ({
			onToggleReminder: handleToggleReminder,
			onToggleComplete: handleToggleComplete,
			onEdit: openEditDialog,
			onDelete: (id: string) => setDeleteConfirmId(id),
			toggleReminderPending: toggleReminderMutation.isPending,
			toggleCompletePending: toggleCompleteMutation.isPending,
		}),
		[
			handleToggleReminder,
			handleToggleComplete,
			openEditDialog,
			toggleReminderMutation.isPending,
			toggleCompleteMutation.isPending,
		],
	);

	return (
		<>
			<DashboardHeader icon={CalendarIcon} title={t`Deadline Tracking`} />

			<HeroSection stats={stats} />
			<StatsPanel stats={stats} />

			{/* Actions Bar */}
			<Card className="mb-6">
				<CardContent className="p-4">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div className="flex flex-1 flex-wrap items-center gap-3">
							{/* Search */}
							<div className="relative min-w-[200px] flex-1 lg:max-w-xs">
								<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder={t`Search...`}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-9"
								/>
							</div>

							{/* Status Filter */}
							<Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DeadlineStatus | "all")}>
								<SelectTrigger className="w-[160px]">
									<FunnelIcon className="mr-2 size-4" />
									<SelectValue placeholder={t`Status`} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										<Trans>All</Trans>
									</SelectItem>
									<SelectItem value="upcoming">
										<Trans>Upcoming</Trans>
									</SelectItem>
									<SelectItem value="past">
										<Trans>Overdue</Trans>
									</SelectItem>
									<SelectItem value="completed">
										<Trans>Completed</Trans>
									</SelectItem>
								</SelectContent>
							</Select>

							{/* Priority Filter */}
							<Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | "all")}>
								<SelectTrigger className="w-[160px]">
									<SelectValue placeholder={t`Priority`} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										<Trans>All</Trans>
									</SelectItem>
									{(["high", "medium", "low"] as Priority[]).map((p) => {
										const config = priorityConfig[p];
										const PIcon = config.icon;
										return (
											<SelectItem key={p} value={p}>
												<div className="flex items-center gap-2">
													<PIcon className="size-4" />
													{config.label}
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>

							{/* Sort */}
							<Button
								variant="outline"
								size="icon"
								onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
							>
								{sortOrder === "asc" ? (
									<SortAscendingIcon className="size-4" />
								) : (
									<SortDescendingIcon className="size-4" />
								)}
							</Button>
						</div>

						{/* Add Button */}
						<Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
							<PlusIcon className="size-4" />
							<Trans>New deadline</Trans>
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Main Content Tabs */}
			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
				<TabsList className="bg-card">
					<TabsTrigger value="timeline" className="gap-2">
						<ClockIcon className="size-4" />
						<Trans>Timeline</Trans>
					</TabsTrigger>
					<TabsTrigger value="calendar" className="gap-2">
						<CalendarIcon className="size-4" />
						<Trans>Calendar</Trans>
					</TabsTrigger>
					<TabsTrigger value="list" className="gap-2">
						<NoteIcon className="size-4" />
						<Trans>List</Trans>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="timeline" className="mt-0">
					<TimelineView
						groupedDeadlines={groupedDeadlines}
						searchQuery={searchQuery}
						statusFilter={statusFilter}
						priorityFilter={priorityFilter}
						onOpenAddDialog={() => setIsAddDialogOpen(true)}
						cardActions={cardActions}
					/>
				</TabsContent>

				<TabsContent value="calendar" className="mt-0">
					<CalendarView
						currentMonth={currentMonth}
						calendarDays={calendarDays}
						deadlinesByDate={deadlinesByDate}
						selectedDate={selectedDate}
						onSelectDate={setSelectedDate}
						onNavigateMonth={navigateMonth}
						onSetCurrentMonth={setCurrentMonth}
						onOpenAddDialogForDate={(date) => {
							form.reset({
								...getDefaultFormData(),
								deadlineDate: date.toISOString().split("T")[0],
							});
							setIsAddDialogOpen(true);
						}}
						cardActions={cardActions}
					/>
				</TabsContent>

				<TabsContent value="list" className="mt-0">
					<ListView
						filteredDeadlines={filteredDeadlines}
						searchQuery={searchQuery}
						statusFilter={statusFilter}
						priorityFilter={priorityFilter}
						onOpenAddDialog={() => setIsAddDialogOpen(true)}
						cardActions={cardActions}
					/>
				</TabsContent>
			</Tabs>

			<UpcomingWidget
				filteredDeadlines={filteredDeadlines}
				statsUpcoming={stats.upcoming}
				activeTab={activeTab}
				cardActions={cardActions}
			/>

			<DeadlineFormDialog
				isOpen={isAddDialogOpen || !!editingDeadline}
				editingDeadline={editingDeadline}
				form={form}
				onOpenChange={(open) => {
					if (!open) {
						setIsAddDialogOpen(false);
						setEditingDeadline(null);
						resetForm();
					}
				}}
				onSubmit={onSubmit}
				createPending={createMutation.isPending}
				updatePending={updateMutation.isPending}
			/>

			<DeleteConfirmDialog
				deleteConfirmId={deleteConfirmId}
				onClose={() => setDeleteConfirmId(null)}
				onConfirmDelete={handleDeleteDeadline}
				deletePending={deleteMutation.isPending}
			/>
		</>
	);
}
