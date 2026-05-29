import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CalendarIcon, SpinnerIcon, XCircleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	AvailabilityDialog,
	AvailabilityView,
	CalendarView,
	CreateEditDialog,
	DeleteConfirmDialog,
	FilterBar,
	HeroSection,
	InterviewCard,
	InterviewDetailDialog,
	ListView,
	PendingRemindersCard,
	QuickActionsCard,
	ReminderDialog,
	UpcomingInterviewsSection,
} from "./-components/scheduler-components";
import { getDefaultFormData } from "./-components/scheduler-config";
import { interviewFormSchema } from "./-components/scheduler-schema";
import type {
	Interview,
	InterviewFormValues,
	InterviewOutcome,
	InterviewStatus,
	InterviewType,
	RecurrenceType,
	ReminderType,
} from "./-components/scheduler-types";
import { getDaysInMonth } from "./-components/scheduler-utils";

// Route definition
// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/interview/scheduler" as any)({
	component: InterviewSchedulerPage,
	errorComponent: ErrorComponent,
});

// ==================== MAIN COMPONENT ====================

function InterviewSchedulerPage() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	// UI State
	const [activeTab, setActiveTab] = useState<"calendar" | "list" | "availability">("calendar");
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<InterviewStatus | "all">("all");
	const [typeFilter, setTypeFilter] = useState<InterviewType | "all">("all");

	// Dialog states
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
	const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
	const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);

	// Form with validation
	const form = useForm<InterviewFormValues>({
		resolver: zodResolver(interviewFormSchema),
		defaultValues: getDefaultFormData(),
	});
	// Watch all form values for display
	const formData = form.watch();
	const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
	const [newInterviewerName, setNewInterviewerName] = useState("");

	// Availability form state
	const [availabilityForm, setAvailabilityForm] = useState<{
		dayOfWeek: number;
		startTime: string;
		endTime: string;
		isRecurring: boolean;
	}>({
		dayOfWeek: 1,
		startTime: "09:00",
		endTime: "17:00",
		isRecurring: true,
	});

	// Reminder form state
	const [reminderForm, setReminderForm] = useState<{
		type: ReminderType;
		date: string;
		time: string;
		message: string;
	}>({
		type: "preparation",
		date: new Date().toISOString().split("T")[0],
		time: "09:00",
		message: "",
	});

	// ==================== QUERIES ====================

	const {
		data: interviews = [],
		isLoading: isLoadingInterviews,
		error: interviewsError,
	} = useQuery({ ...orpc.interviewScheduler.list.queryOptions({ input: {} }), enabled: !!session?.user });

	const {
		data: availability = [],
		isLoading: isLoadingAvailability,
		error: availabilityError,
	} = useQuery({ ...orpc.interviewScheduler.availability.list.queryOptions({}), enabled: !!session?.user });

	const { data: stats } = useQuery({
		...orpc.interviewScheduler.getStatistics.queryOptions({}),
		enabled: !!session?.user,
	});

	const { data: pendingReminders = [] } = useQuery({
		...orpc.interviewScheduler.reminders.getPending.queryOptions({}),
		enabled: !!session?.user,
	});

	// ==================== MUTATIONS ====================

	const { mutate: createInterview, isPending: isCreating } = useMutation({
		...orpc.interviewScheduler.create.mutationOptions(),
		onMutate: async (newInterview) => {
			await queryClient.cancelQueries({ queryKey: ["interviewScheduler"] });
			const previousInterviews = queryClient.getQueryData(orpc.interviewScheduler.list.key({ input: {} }));
			queryClient.setQueryData(orpc.interviewScheduler.list.key({ input: {} }), (old: Interview[] | undefined) => {
				if (!old) return old;
				const optimisticInterview: Interview = {
					id: `temp-${Date.now()}`,
					userId: "",
					applicationId: null,
					title: newInterview.title,
					company: newInterview.company,
					role: newInterview.role,
					type: newInterview.type,
					status: "scheduled",
					outcome: "pending",
					date: newInterview.date,
					startTime: newInterview.startTime,
					endTime: newInterview.endTime,
					timezone: newInterview.timezone,
					location: newInterview.location || null,
					meetingLink: newInterview.meetingLink || null,
					contactName: newInterview.contactName || null,
					contactEmail: newInterview.contactEmail || null,
					contactPhone: newInterview.contactPhone || null,
					notes: newInterview.notes || null,
					preparationMaterials: newInterview.preparationMaterials || null,
					interviewerNames: newInterview.interviewerNames || null,
					round: newInterview.round ?? 1,
					recurrence: newInterview.recurrence ?? "none",
					reminders: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				return [optimisticInterview, ...old];
			});
			setIsCreateDialogOpen(false);
			resetForm();
			return { previousInterviews };
		},
		onSuccess: () => {
			toast.success(t`Interview scheduled successfully`);
		},
		onError: (_error, _newInterview, context) => {
			if (context?.previousInterviews) {
				queryClient.setQueryData(orpc.interviewScheduler.list.key({ input: {} }), context.previousInterviews);
			}
			toast.error(t`Error creating interview`);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewScheduler"] });
		},
	});

	const { mutate: updateInterview, isPending: isUpdating } = useMutation({
		...orpc.interviewScheduler.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewScheduler"] });
			setIsEditDialogOpen(false);
			setSelectedInterview(null);
			resetForm();
			toast.success(t`Interview updated`);
		},
		onError: () => {
			toast.error(t`Error updating interview`);
		},
	});

	const { mutate: deleteInterview, isPending: isDeleting } = useMutation({
		...orpc.interviewScheduler.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewScheduler"] });
			setIsDeleteDialogOpen(false);
			setSelectedInterview(null);
			toast.success(t`Interview deleted`);
		},
		onError: () => {
			toast.error(t`Error deleting interview`);
		},
	});

	const { mutate: updateOutcome } = useMutation({
		...orpc.interviewScheduler.updateOutcome.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewScheduler"] });
			toast.success(t`Outcome updated`);
		},
		onError: () => {
			toast.error(t`Error updating outcome`);
		},
	});

	const { mutate: addReminder, isPending: isAddingReminder } = useMutation({
		...orpc.interviewScheduler.reminders.add.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewScheduler"] });
			setIsReminderDialogOpen(false);
			setReminderForm({
				type: "preparation",
				date: new Date().toISOString().split("T")[0],
				time: "09:00",
				message: "",
			});
			toast.success(t`Reminder added`);
		},
		onError: () => {
			toast.error(t`Error adding reminder`);
		},
	});

	const { mutate: toggleReminder } = useMutation({
		...orpc.interviewScheduler.reminders.toggle.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewScheduler"] });
		},
	});

	const { mutate: deleteReminder } = useMutation({
		...orpc.interviewScheduler.reminders.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewScheduler"] });
			toast.success(t`Reminder deleted`);
		},
	});

	const { mutate: addAvailabilitySlot, isPending: isAddingAvailability } = useMutation({
		...orpc.interviewScheduler.availability.add.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewScheduler"] });
			setIsAvailabilityDialogOpen(false);
			toast.success(t`Availability added`);
		},
		onError: () => {
			toast.error(t`Error adding availability`);
		},
	});

	const { mutate: deleteAvailabilitySlot } = useMutation({
		...orpc.interviewScheduler.availability.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewScheduler"] });
			toast.success(t`Availability deleted`);
		},
	});

	// ==================== COMPUTED VALUES ====================

	const calendarDays = useMemo(() => {
		return getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
	}, [currentMonth]);

	const filteredInterviews = useMemo(() => {
		return interviews.filter((interview) => {
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const matchesSearch =
					interview.company.toLowerCase().includes(query) ||
					interview.role.toLowerCase().includes(query) ||
					interview.title.toLowerCase().includes(query);
				if (!matchesSearch) return false;
			}
			if (statusFilter !== "all" && interview.status !== statusFilter) return false;
			if (typeFilter !== "all" && interview.type !== typeFilter) return false;
			return true;
		});
	}, [interviews, searchQuery, statusFilter, typeFilter]);

	const upcomingInterviews = useMemo(() => {
		const now = new Date();
		return interviews
			.filter((interview) => {
				const interviewDate = new Date(`${interview.date}T${interview.startTime}`);
				return interviewDate >= now && interview.status === "scheduled";
			})
			.sort((a, b) => {
				const dateA = new Date(`${a.date}T${a.startTime}`);
				const dateB = new Date(`${b.date}T${b.startTime}`);
				return dateA.getTime() - dateB.getTime();
			})
			.slice(0, 5);
	}, [interviews]);

	const interviewsByDate = useMemo(() => {
		const byDate: Record<string, Interview[]> = {};
		for (const interview of filteredInterviews) {
			if (!byDate[interview.date]) {
				byDate[interview.date] = [];
			}
			byDate[interview.date].push(interview);
		}
		return byDate;
	}, [filteredInterviews]);

	const displayStats = useMemo(() => {
		return {
			total: stats?.total ?? 0,
			upcoming: stats?.upcoming ?? 0,
			completed: stats?.completed ?? 0,
			successRate: stats?.successRate ?? 0,
		};
	}, [stats]);

	// ==================== HANDLERS ====================

	const resetForm = useCallback(() => {
		form.reset(getDefaultFormData());
		setNewInterviewerName("");
	}, [form]);

	const handleCreateInterview = useCallback(
		(data: InterviewFormValues) => {
			createInterview({
				title: data.title || `${data.company} - ${data.role}`,
				company: data.company,
				role: data.role,
				type: data.type,
				date: data.date,
				startTime: data.startTime,
				endTime: data.endTime,
				timezone: data.timezone,
				location: data.location || undefined,
				meetingLink: data.meetingLink || undefined,
				contactName: data.contactName || undefined,
				contactEmail: data.contactEmail || undefined,
				contactPhone: data.contactPhone || undefined,
				notes: data.notes || undefined,
				preparationMaterials: data.preparationMaterials || undefined,
				interviewerNames: data.interviewerNames && data.interviewerNames.length > 0 ? data.interviewerNames : undefined,
				round: data.round,
				recurrence: data.recurrence,
			});
		},
		[createInterview],
	);

	const handleUpdateInterview = useCallback(
		(data: InterviewFormValues) => {
			if (!selectedInterview) return;

			updateInterview({
				id: selectedInterview.id,
				title: data.title || undefined,
				company: data.company || undefined,
				role: data.role || undefined,
				type: data.type,
				status: data.status,
				outcome: data.outcome,
				date: data.date || undefined,
				startTime: data.startTime || undefined,
				endTime: data.endTime || undefined,
				timezone: data.timezone || undefined,
				location: data.location || undefined,
				meetingLink: data.meetingLink || undefined,
				contactName: data.contactName || undefined,
				contactEmail: data.contactEmail || undefined,
				contactPhone: data.contactPhone || undefined,
				notes: data.notes || undefined,
				preparationMaterials: data.preparationMaterials || undefined,
				interviewerNames: data.interviewerNames,
				round: data.round,
				recurrence: data.recurrence,
			});
		},
		[selectedInterview, updateInterview],
	);

	const handleDeleteInterview = useCallback(() => {
		if (!selectedInterview) return;
		deleteInterview({ id: selectedInterview.id });
	}, [selectedInterview, deleteInterview]);

	const handleUpdateOutcome = useCallback(
		(interviewId: string, outcome: InterviewOutcome) => {
			updateOutcome({ id: interviewId, outcome });
		},
		[updateOutcome],
	);

	const handleAddReminder = useCallback(() => {
		if (!selectedInterview) return;
		addReminder({
			interviewId: selectedInterview.id,
			type: reminderForm.type,
			date: reminderForm.date,
			time: reminderForm.time,
			message: reminderForm.message,
		});
	}, [selectedInterview, reminderForm, addReminder]);

	const handleToggleReminder = useCallback(
		(interviewId: string, reminderId: string) => {
			toggleReminder({ id: reminderId, interviewId });
		},
		[toggleReminder],
	);

	const handleDeleteReminder = useCallback(
		(interviewId: string, reminderId: string) => {
			deleteReminder({ id: reminderId, interviewId });
		},
		[deleteReminder],
	);

	const handleAddAvailabilitySlot = useCallback(() => {
		addAvailabilitySlot({
			dayOfWeek: availabilityForm.dayOfWeek,
			startTime: availabilityForm.startTime,
			endTime: availabilityForm.endTime,
			isRecurring: availabilityForm.isRecurring,
		});
	}, [availabilityForm, addAvailabilitySlot]);

	const handleDeleteAvailabilitySlot = useCallback(
		(slotId: string) => {
			deleteAvailabilitySlot({ id: slotId });
		},
		[deleteAvailabilitySlot],
	);

	const openEditDialog = useCallback(
		(interview: Interview) => {
			setSelectedInterview(interview);
			form.reset({
				title: interview.title,
				company: interview.company,
				role: interview.role,
				type: interview.type as InterviewType,
				status: interview.status as InterviewStatus,
				outcome: interview.outcome as InterviewOutcome,
				date: interview.date,
				startTime: interview.startTime,
				endTime: interview.endTime,
				timezone: interview.timezone,
				location: interview.location || "",
				meetingLink: interview.meetingLink || "",
				contactName: interview.contactName || "",
				contactEmail: interview.contactEmail || "",
				contactPhone: interview.contactPhone || "",
				notes: interview.notes || "",
				preparationMaterials: interview.preparationMaterials || "",
				interviewerNames: interview.interviewerNames || [],
				round: interview.round,
				recurrence: interview.recurrence as RecurrenceType,
			});
			setIsEditDialogOpen(true);
		},
		[form],
	);

	const openDetailDialog = useCallback((interview: Interview) => {
		setSelectedInterview(interview);
		setIsDetailDialogOpen(true);
	}, []);

	const handleAddInterviewer = useCallback(() => {
		if (newInterviewerName.trim()) {
			const currentNames = form.getValues("interviewerNames") || [];
			form.setValue("interviewerNames", [...currentNames, newInterviewerName.trim()]);
			setNewInterviewerName("");
		}
	}, [newInterviewerName, form]);

	const handleRemoveInterviewer = useCallback(
		(index: number) => {
			const currentNames = form.getValues("interviewerNames") || [];
			form.setValue(
				"interviewerNames",
				currentNames.filter((_, i) => i !== index),
			);
		},
		[form],
	);

	const copyMeetingLink = useCallback((link: string) => {
		navigator.clipboard.writeText(link);
		toast.success(t`Link copied`);
	}, []);

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

	// ==================== EFFECTS ====================

	useEffect(() => {
		if (!interviews || interviews.length === 0) return;

		const now = new Date();
		for (const interview of interviews) {
			for (const reminder of interview.reminders || []) {
				if (!reminder.completed) {
					const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
					const diffMs = now.getTime() - reminderDateTime.getTime();
					if (diffMs >= 0 && diffMs < 3600000) {
						toast.info(`Rappel: ${reminder.message}`, {
							description: `${interview.company} - ${interview.role}`,
							duration: 10000,
						});
					}
				}
			}
		}
	}, [interviews]);

	// ==================== RENDER HELPERS ====================

	const renderInterviewCard = useCallback(
		(interview: Interview, compact = false) => (
			<InterviewCard
				key={interview.id}
				interview={interview}
				compact={compact}
				onOpenDetail={openDetailDialog}
				onOpenEdit={openEditDialog}
				onCopyMeetingLink={copyMeetingLink}
				onUpdateOutcome={handleUpdateOutcome}
				onRequestDelete={(i) => {
					setSelectedInterview(i);
					setIsDeleteDialogOpen(true);
				}}
			/>
		),
		[openDetailDialog, openEditDialog, copyMeetingLink, handleUpdateOutcome],
	);

	// ==================== LOADING & ERROR STATES ====================

	if (isLoadingInterviews || isLoadingAvailability) {
		return (
			<>
				<DashboardHeader icon={CalendarIcon} title={t`Interview Scheduler`} />
				<div className="flex items-center justify-center py-20">
					<SpinnerIcon className="size-8 animate-spin text-primary" />
				</div>
			</>
		);
	}

	if (interviewsError || availabilityError) {
		return (
			<>
				<DashboardHeader icon={CalendarIcon} title={t`Interview Scheduler`} />
				<Card className="border-destructive">
					<CardContent className="flex flex-col items-center justify-center py-16">
						<XCircleIcon className="mb-4 size-16 text-destructive" />
						<h3 className="mb-2 font-semibold text-lg">
							<Trans>Loading error</Trans>
						</h3>
						<p className="text-center text-muted-foreground">
							<Trans>Unable to load data. Please try again.</Trans>
						</p>
						<Button
							className="mt-4"
							onClick={() => queryClient.invalidateQueries({ queryKey: ["interviewScheduler"] })}
						>
							<Trans>Retry</Trans>
						</Button>
					</CardContent>
				</Card>
			</>
		);
	}

	// ==================== MAIN RENDER ====================

	const isSaving = isCreating || isUpdating;

	return (
		<>
			<DashboardHeader icon={CalendarIcon} title={t`Interview Scheduler`} />

			<HeroSection displayStats={displayStats} />

			{/* Quick Actions & Upcoming */}
			<div className="mb-8 grid gap-6 lg:grid-cols-3">
				<QuickActionsCard
					onCreateInterview={() => setIsCreateDialogOpen(true)}
					onManageAvailability={() => setIsAvailabilityDialogOpen(true)}
				/>
				<PendingRemindersCard pendingReminders={pendingReminders} />
			</div>

			{/* Main Content with Tabs */}
			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
				<FilterBar
					activeTab={activeTab}
					onTabChange={setActiveTab}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
					typeFilter={typeFilter}
					onTypeFilterChange={setTypeFilter}
				/>

				<CalendarView
					currentMonth={currentMonth}
					selectedDate={selectedDate}
					calendarDays={calendarDays}
					interviewsByDate={interviewsByDate}
					onNavigateMonth={navigateMonth}
					onSelectDate={setSelectedDate}
					onSetCurrentMonth={setCurrentMonth}
					onCreateForDate={(dateStr) => {
						form.setValue("date", dateStr);
						setIsCreateDialogOpen(true);
					}}
					renderInterviewCard={renderInterviewCard}
				/>

				<ListView
					filteredInterviews={filteredInterviews}
					searchQuery={searchQuery}
					statusFilter={statusFilter}
					typeFilter={typeFilter}
					onCreateInterview={() => setIsCreateDialogOpen(true)}
					renderInterviewCard={renderInterviewCard}
				/>

				<AvailabilityView
					availability={availability}
					onAddAvailability={() => setIsAvailabilityDialogOpen(true)}
					onDeleteAvailabilitySlot={handleDeleteAvailabilitySlot}
				/>
			</Tabs>

			<UpcomingInterviewsSection
				upcomingInterviews={upcomingInterviews}
				activeTab={activeTab}
				renderInterviewCard={renderInterviewCard}
			/>

			{/* ==================== DIALOGS ==================== */}

			<CreateEditDialog
				isOpen={isCreateDialogOpen || isEditDialogOpen}
				isEditMode={isEditDialogOpen}
				form={form}
				formData={formData}
				isSaving={isSaving}
				newInterviewerName={newInterviewerName}
				onNewInterviewerNameChange={setNewInterviewerName}
				onAddInterviewer={handleAddInterviewer}
				onRemoveInterviewer={handleRemoveInterviewer}
				onClose={() => {
					setIsCreateDialogOpen(false);
					setIsEditDialogOpen(false);
					setSelectedInterview(null);
					resetForm();
				}}
				onSubmit={form.handleSubmit(isEditDialogOpen ? handleUpdateInterview : handleCreateInterview)}
			/>

			<InterviewDetailDialog
				isOpen={isDetailDialogOpen}
				onOpenChange={setIsDetailDialogOpen}
				selectedInterview={selectedInterview}
				onOpenEdit={openEditDialog}
				onCopyMeetingLink={copyMeetingLink}
				onUpdateOutcome={handleUpdateOutcome}
				onToggleReminder={handleToggleReminder}
				onDeleteReminder={handleDeleteReminder}
				onAddReminder={() => setIsReminderDialogOpen(true)}
			/>

			<DeleteConfirmDialog
				isOpen={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				isDeleting={isDeleting}
				onConfirm={handleDeleteInterview}
			/>

			<AvailabilityDialog
				isOpen={isAvailabilityDialogOpen}
				onOpenChange={setIsAvailabilityDialogOpen}
				availabilityForm={availabilityForm}
				onFormChange={setAvailabilityForm}
				isAdding={isAddingAvailability}
				onSubmit={handleAddAvailabilitySlot}
			/>

			<ReminderDialog
				isOpen={isReminderDialogOpen}
				onOpenChange={setIsReminderDialogOpen}
				reminderForm={reminderForm}
				onFormChange={setReminderForm}
				isAdding={isAddingReminder}
				onSubmit={handleAddReminder}
			/>
		</>
	);
}
