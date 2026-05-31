import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BellIcon,
	CalendarIcon,
	ChartBarIcon,
	EnvelopeIcon,
	EnvelopeSimpleIcon,
	LightbulbIcon,
	ListChecksIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

import {
	AnalyticsTab,
	ApplicationsTab,
	deriveFollowUpStatus,
	getDaysSince,
	getNextFollowUpDate,
	HeroSection,
	ReminderSettingsDialog,
	TemplateSendDialog,
	TemplatesTab,
	TimelineTab,
	TipsTab,
} from "./-components/follow-up-components";
import { defaultEmailTemplates } from "./-components/follow-up-config";
import type {
	EmailTemplate,
	FollowUpApplication,
	FollowUpScheduleItem,
	FollowUpStatus,
	ReminderSettings,
} from "./-components/follow-up-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/jobs/follow-up" as any)({
	component: FollowUpTrackerPage,
	errorComponent: ErrorComponent,
});

function FollowUpTrackerPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<FollowUpStatus | "all">("all");
	const [activeTab, setActiveTab] = useState("timeline");
	const [selectedApplication, setSelectedApplication] = useState<FollowUpApplication | null>(null);
	const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
	const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
	const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
	const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);

	// Email templates state
	const [emailTemplates, _setEmailTemplates] = useState<EmailTemplate[]>(defaultEmailTemplates);

	// Reminder settings state
	const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
		enabled: true,
		firstFollowUp: 7,
		secondFollowUp: 14,
		finalFollowUp: 21,
		emailNotifications: true,
		browserNotifications: false,
	});

	// Fetch applications from database
	const { data: rawApplications = [] } = useQuery({
		...orpc.jobApplications.list.queryOptions({
			input: {
				sort: "appliedAt",
				sortOrder: "desc",
			},
		}),
		enabled: !!session?.user,
	});

	// Fetch statistics
	const { data: statisticsData } = useQuery({
		...orpc.jobApplications.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	// Add activity mutation (for logging follow-ups)
	const addActivityMutation = useMutation({
		...orpc.jobApplications.activity.add.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
		},
	});

	// Update application mutation (for updating notes)
	const updateApplicationMutation = useMutation({
		...orpc.jobApplications.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
		},
	});

	// Transform raw applications to follow-up format
	const applications = useMemo<FollowUpApplication[]>(() => {
		return rawApplications
			.filter(
				(app) =>
					app.status === "applied" ||
					app.status === "phone_screen" ||
					app.status === "interview" ||
					app.status === "rejected" ||
					app.status === "withdrawn",
			)
			.map((app) => {
				const appliedDate = app.appliedAt
					? typeof app.appliedAt === "string"
						? app.appliedAt
						: app.appliedAt.toISOString().split("T")[0]
					: app.createdAt
						? app.createdAt.toISOString().split("T")[0]
						: new Date().toISOString().split("T")[0];

				const daysSinceApplied = getDaysSince(appliedDate);

				// Count follow-ups from notes (simple heuristic - can be enhanced with activities)
				const notesLower = (app.notes || "").toLowerCase();
				let followUpCount = 0;
				if (notesLower.includes("relance") || notesLower.includes("follow-up") || notesLower.includes("suivi")) {
					followUpCount = 1;
					if (notesLower.includes("deuxieme") || notesLower.includes("2eme") || notesLower.includes("second")) {
						followUpCount = 2;
					}
					if (notesLower.includes("derniere") || notesLower.includes("final") || notesLower.includes("3eme")) {
						followUpCount = 3;
					}
				}

				const followUpStatus = deriveFollowUpStatus(app.status, followUpCount, daysSinceApplied);

				return {
					id: app.id,
					jobTitle: app.position,
					company: app.companyName,
					appliedDate,
					followUpStatus,
					lastFollowUpDate: followUpCount > 0 ? appliedDate : undefined,
					followUpCount,
					contactEmail: app.contactEmail || undefined,
					contactName: app.contactName || undefined,
					responseReceived: ["phone_screen", "interview", "offer", "accepted"].includes(app.status),
					notes: app.notes || "",
				};
			});
	}, [rawApplications]);

	// Filtered applications
	const filteredApplications = useMemo(() => {
		return applications.filter((app) => {
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				if (!app.jobTitle.toLowerCase().includes(query) && !app.company.toLowerCase().includes(query)) {
					return false;
				}
			}
			if (statusFilter !== "all" && app.followUpStatus !== statusFilter) {
				return false;
			}
			return true;
		});
	}, [applications, searchQuery, statusFilter]);

	// Follow-up schedule
	const followUpSchedule = useMemo<FollowUpScheduleItem[]>(() => {
		const schedule: FollowUpScheduleItem[] = [];
		const today = new Date();

		for (const app of applications) {
			if (app.followUpStatus === "responded" || app.followUpStatus === "no_response") continue;
			if (app.followUpCount >= 3) continue;

			const nextDate = getNextFollowUpDate(app.appliedDate, app.followUpCount);
			const dueDate = new Date(nextDate);
			const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

			schedule.push({
				applicationId: app.id,
				company: app.company,
				jobTitle: app.jobTitle,
				dueDate: nextDate,
				type: app.followUpCount === 0 ? "initial" : app.followUpCount === 1 ? "second" : "final",
				daysUntilDue,
				isOverdue: daysUntilDue < 0,
			});
		}

		return schedule.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
	}, [applications]);

	// Stats
	const stats = useMemo(() => {
		const total = applications.length;
		const notSent = applications.filter((a) => a.followUpStatus === "not_sent").length;
		const sent = applications.filter((a) => a.followUpStatus === "sent").length;
		const responded = applications.filter((a) => a.followUpStatus === "responded").length;
		const noResponse = applications.filter((a) => a.followUpStatus === "no_response").length;
		const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
		const pendingFollowUps = followUpSchedule.filter((s) => s.daysUntilDue <= 3).length;
		const overdueFollowUps = followUpSchedule.filter((s) => s.isOverdue).length;

		return { total, notSent, sent, responded, noResponse, responseRate, pendingFollowUps, overdueFollowUps };
	}, [applications, followUpSchedule]);

	// Analytics data derived from real applications
	const responseRateData = useMemo(() => {
		const monthlyData: Record<string, { sent: number; responded: number }> = {};
		const now = new Date();

		for (let i = 4; i >= 0; i--) {
			const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const key = date.toLocaleDateString("fr-FR", { month: "short" });
			monthlyData[key] = { sent: 0, responded: 0 };
		}

		for (const app of applications) {
			const appDate = new Date(app.appliedDate);
			const key = appDate.toLocaleDateString("fr-FR", { month: "short" });
			if (monthlyData[key]) {
				if (app.followUpCount > 0) {
					monthlyData[key].sent += app.followUpCount;
				}
				if (app.responseReceived) {
					monthlyData[key].responded += 1;
				}
			}
		}

		return Object.entries(monthlyData).map(([month, data]) => ({
			month,
			sent: data.sent,
			responded: data.responded,
			rate: data.sent > 0 ? Math.round((data.responded / data.sent) * 100) : 0,
		}));
	}, [applications]);

	const statusDistributionData = useMemo(() => {
		return [
			{ name: "Response received", value: stats.responded, color: "#22c55e" },
			{ name: "Pending", value: stats.sent + stats.notSent, color: "#3b82f6" },
			{ name: "No response", value: stats.noResponse, color: "#ef4444" },
		].filter((item) => item.value > 0);
	}, [stats]);

	const timingEffectivenessData = useMemo(() => {
		const timing: Record<string, { rate: number; count: number }> = {
			"7 days": { rate: 0, count: 0 },
			"14 days": { rate: 0, count: 0 },
			"21 days": { rate: 0, count: 0 },
			"+21 days": { rate: 0, count: 0 },
		};

		for (const app of applications) {
			const daysSince = getDaysSince(app.appliedDate);
			let key: string;
			if (daysSince <= 7) key = "7 days";
			else if (daysSince <= 14) key = "14 days";
			else if (daysSince <= 21) key = "21 days";
			else key = "+21 days";

			timing[key].count += 1;
			if (app.responseReceived) {
				timing[key].rate += 1;
			}
		}

		return Object.entries(timing).map(([label, data]) => ({
			timing: label,
			rate: data.count > 0 ? Math.round((data.rate / data.count) * 100) : 0,
			count: data.count,
		}));
	}, [applications]);

	// Handlers
	const handleStatusChange = useCallback(
		async (appId: string, newStatus: FollowUpStatus) => {
			const app = applications.find((a) => a.id === appId);
			if (!app) return;

			if (newStatus === "sent") {
				await addActivityMutation.mutateAsync({
					applicationId: appId,
					activityType: "follow_up",
					description: `Relance ${app.followUpCount + 1} envoyée`,
				});

				const newNotes = app.notes
					? `${app.notes}\n\n[${new Date().toLocaleDateString("fr-FR")}] Relance ${app.followUpCount + 1} envoyée`
					: `[${new Date().toLocaleDateString("fr-FR")}] Relance ${app.followUpCount + 1} envoyée`;

				await updateApplicationMutation.mutateAsync({
					id: appId,
					notes: newNotes,
				});
			}

			toast.success(t`Statut mis à jour`);
		},
		[applications, addActivityMutation, updateApplicationMutation],
	);

	const handleBulkMarkAsSent = useCallback(async () => {
		if (selectedApplicationIds.length === 0) return;

		for (const appId of selectedApplicationIds) {
			const app = applications.find((a) => a.id === appId);
			if (app && app.followUpStatus !== "responded") {
				await addActivityMutation.mutateAsync({
					applicationId: appId,
					activityType: "follow_up",
					description: `Relance ${app.followUpCount + 1} envoyée`,
				});

				const newNotes = app.notes
					? `${app.notes}\n\n[${new Date().toLocaleDateString("fr-FR")}] Relance ${app.followUpCount + 1} envoyée`
					: `[${new Date().toLocaleDateString("fr-FR")}] Relance ${app.followUpCount + 1} envoyée`;

				await updateApplicationMutation.mutateAsync({
					id: appId,
					notes: newNotes,
				});
			}
		}

		setSelectedApplicationIds([]);
		toast.success(t`${selectedApplicationIds.length} relance(s) marquée(s) comme envoyée(s)`);
	}, [selectedApplicationIds, applications, addActivityMutation, updateApplicationMutation]);

	const handleCopyTemplate = useCallback((template: EmailTemplate) => {
		const text = `Subject: ${template.subject}\n\n${template.body}`;
		navigator.clipboard.writeText(text);
		toast.success(t`Modèle copié`);
	}, []);

	const toggleApplicationSelection = useCallback((appId: string) => {
		setSelectedApplicationIds((prev) => (prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]));
	}, []);

	const selectAllApplications = useCallback(() => {
		const selectableIds = filteredApplications
			.filter((app) => app.followUpStatus !== "responded" && app.followUpStatus !== "no_response")
			.map((app) => app.id);
		setSelectedApplicationIds(selectableIds);
	}, [filteredApplications]);

	const clearSelection = useCallback(() => {
		setSelectedApplicationIds([]);
	}, []);

	return (
		<>
			<DashboardHeader icon={EnvelopeIcon} title={t`Suivi des relances`} />

			<HeroSection stats={stats} />

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
						{[
							{ value: "timeline", icon: CalendarIcon, label: "Calendrier" },
							{ value: "applications", icon: ListChecksIcon, label: "Candidatures" },
							{ value: "templates", icon: EnvelopeSimpleIcon, label: "Modèles" },
							{ value: "analytics", icon: ChartBarIcon, label: "Analyse" },
							{ value: "tips", icon: LightbulbIcon, label: "Conseils" },
						].map((tab) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
							>
								<tab.icon className="size-4" />
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>

					<Button variant="outline" className="gap-2" onClick={() => setIsSettingsDialogOpen(true)}>
						<BellIcon className="size-4" />
						<Trans>Rappels</Trans>
					</Button>
				</div>

				<TabsContent value="timeline">
					<TimelineTab
						followUpSchedule={followUpSchedule}
						applications={applications}
						setSelectedApplication={setSelectedApplication}
						setIsTemplateDialogOpen={setIsTemplateDialogOpen}
					/>
				</TabsContent>

				<TabsContent value="applications">
					<ApplicationsTab
						filteredApplications={filteredApplications}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						statusFilter={statusFilter}
						setStatusFilter={setStatusFilter}
						selectedApplicationIds={selectedApplicationIds}
						toggleApplicationSelection={toggleApplicationSelection}
						selectAllApplications={selectAllApplications}
						clearSelection={clearSelection}
						handleBulkMarkAsSent={handleBulkMarkAsSent}
						handleStatusChange={handleStatusChange}
						setSelectedApplication={setSelectedApplication}
						setIsTemplateDialogOpen={setIsTemplateDialogOpen}
						addActivityMutationIsPending={addActivityMutation.isPending}
					/>
				</TabsContent>

				<TabsContent value="templates">
					<TemplatesTab
						emailTemplates={emailTemplates}
						handleCopyTemplate={handleCopyTemplate}
						setSelectedTemplate={setSelectedTemplate}
					/>
				</TabsContent>

				<TabsContent value="analytics">
					<AnalyticsTab
						stats={stats}
						applications={applications}
						statisticsData={statisticsData}
						responseRateData={responseRateData}
						timingEffectivenessData={timingEffectivenessData}
						statusDistributionData={statusDistributionData}
					/>
				</TabsContent>

				<TabsContent value="tips">
					<TipsTab />
				</TabsContent>
			</Tabs>

			<TemplateSendDialog
				isOpen={isTemplateDialogOpen}
				onOpenChange={setIsTemplateDialogOpen}
				selectedApplication={selectedApplication}
				selectedTemplate={selectedTemplate}
				setSelectedTemplate={setSelectedTemplate}
				emailTemplates={emailTemplates}
				handleCopyTemplate={handleCopyTemplate}
				handleStatusChange={handleStatusChange}
				setSelectedApplication={setSelectedApplication}
				addActivityMutationIsPending={addActivityMutation.isPending}
			/>

			<ReminderSettingsDialog
				isOpen={isSettingsDialogOpen}
				onOpenChange={setIsSettingsDialogOpen}
				reminderSettings={reminderSettings}
				setReminderSettings={setReminderSettings}
			/>
		</>
	);
}
