import { t } from "@lingui/core/macro";
import { BookOpenIcon, ListChecksIcon, SunIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	ChecklistErrorState,
	ChecklistHeroSection,
	ChecklistSection,
	CompletionCard,
	PRINT_STYLES,
	ProgressRingSection,
	QuickLinksSection,
	ReminderSection,
} from "./-components/checklist-components";
import { fallbackDayOfChecklist, fallbackPreInterviewChecklist } from "./-components/checklist-config";
import type { InterviewReminder } from "./-components/checklist-types";
import { convertToChecklistItem } from "./-components/checklist-utils";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/interview/checklist" as any)({
	component: InterviewChecklistPage,
	errorComponent: ErrorComponent,
});

function InterviewChecklistPage() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
	const [reminderDate, setReminderDate] = useState("");
	const [reminderTime, setReminderTime] = useState("");
	const [reminderCompany, setReminderCompany] = useState("");

	// ==================== QUERIES ====================

	const {
		data: checklistData,
		isLoading,
		error,
	} = useQuery({ ...orpc.quickChecklist.get.queryOptions({}), enabled: !!session?.user });
	const { data: dbChecklistItems } = useQuery({
		...orpc.interviewChecklist.list.queryOptions({}),
		enabled: !!session?.user,
	});

	const preInterviewChecklist = useMemo(() => {
		const dbItems = dbChecklistItems?.filter((item) => item.category === "pre_interview") ?? [];
		if (dbItems.length > 0) {
			return dbItems.map(convertToChecklistItem);
		}
		return fallbackPreInterviewChecklist;
	}, [dbChecklistItems]);

	const dayOfChecklist = useMemo(() => {
		const dbItems = dbChecklistItems?.filter((item) => item.category === "day_of") ?? [];
		if (dbItems.length > 0) {
			return dbItems.map(convertToChecklistItem);
		}
		return fallbackDayOfChecklist;
	}, [dbChecklistItems]);

	const checkedItems = useMemo(() => {
		return new Set(checklistData?.checkedItems ?? []);
	}, [checklistData?.checkedItems]);

	const reminder: InterviewReminder | null = useMemo(() => {
		if (!checklistData?.reminderDate || !checklistData?.reminderTime) return null;
		return {
			date: checklistData.reminderDate,
			time: checklistData.reminderTime,
			company: checklistData.reminderCompany ?? undefined,
			notificationScheduled: checklistData.reminderNotificationScheduled,
		};
	}, [checklistData]);

	// ==================== MUTATIONS ====================

	const { mutate: toggleItemMutation, isPending: isToggling } = useMutation({
		...orpc.quickChecklist.toggleItem.mutationOptions(),
		onSuccess: (newCheckedItems) => {
			queryClient.setQueryData(["quickChecklist", "get"], (old: typeof checklistData) => {
				if (!old) return old;
				return { ...old, checkedItems: newCheckedItems };
			});
		},
		onError: () => {
			toast.error(t`Erreur pendant la mise a jour`);
			queryClient.invalidateQueries({ queryKey: ["quickChecklist"] });
		},
	});

	const { mutate: resetChecklistMutation, isPending: isResetting } = useMutation({
		...orpc.quickChecklist.reset.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["quickChecklist"] });
			toast.success(t`Liste reinitialisee`);
		},
		onError: () => {
			toast.error(t`Erreur pendant la reinitialisation`);
		},
	});

	const { mutate: setReminderMutation, isPending: isSettingReminder } = useMutation({
		...orpc.quickChecklist.setReminder.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["quickChecklist"] });
			setReminderDate("");
			setReminderTime("");
			setReminderCompany("");
			toast.success(t`Rappel enregistre !`);
		},
		onError: () => {
			toast.error(t`Erreur lors de l'enregistrement du rappel`);
		},
	});

	const { mutate: clearReminderMutation, isPending: isClearingReminder } = useMutation({
		...orpc.quickChecklist.clearReminder.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["quickChecklist"] });
			toast.success(t`Rappel supprime`);
		},
		onError: () => {
			toast.error(t`Erreur lors de la suppression du rappel`);
		},
	});

	// ==================== HANDLERS ====================

	const toggleItem = useCallback(
		(itemId: string) => {
			toggleItemMutation({ itemId });
		},
		[toggleItemMutation],
	);

	const toggleExpand = useCallback((itemId: string) => {
		setExpandedItems((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(itemId)) {
				newSet.delete(itemId);
			} else {
				newSet.add(itemId);
			}
			return newSet;
		});
	}, []);

	const scheduleNotification = useCallback((reminderData: InterviewReminder) => {
		const interviewDate = new Date(`${reminderData.date}T${reminderData.time}`);
		const notificationTime = interviewDate.getTime() - 24 * 60 * 60 * 1000;
		const now = Date.now();

		if (notificationTime > now) {
			setTimeout(() => {
				if ("Notification" in window && Notification.permission === "granted") {
					new Notification("Rappel : entretien demain !", {
						body: reminderData.company
							? `Votre entretien chez ${reminderData.company} est demain !`
							: "Votre entretien est demain ! N'oubliez pas de vous préparer.",
						icon: "/favicon.ico",
					});
				}
			}, notificationTime - now);
		}
	}, []);

	const saveReminder = useCallback(() => {
		if (!reminderDate || !reminderTime) {
			toast.error(t`Veuillez saisir une date et une heure`);
			return;
		}

		let notificationScheduled = false;

		if ("Notification" in window && Notification.permission === "default") {
			Notification.requestPermission().then((permission) => {
				if (permission === "granted") {
					notificationScheduled = true;
					scheduleNotification({
						date: reminderDate,
						time: reminderTime,
						company: reminderCompany,
						notificationScheduled: true,
					});
				}
			});
		} else if ("Notification" in window && Notification.permission === "granted") {
			notificationScheduled = true;
			scheduleNotification({
				date: reminderDate,
				time: reminderTime,
				company: reminderCompany,
				notificationScheduled: true,
			});
		}

		setReminderMutation({
			date: reminderDate,
			time: reminderTime,
			company: reminderCompany || undefined,
			notificationScheduled,
		});
	}, [reminderDate, reminderTime, reminderCompany, scheduleNotification, setReminderMutation]);

	const clearReminder = useCallback(() => {
		clearReminderMutation({});
	}, [clearReminderMutation]);

	const handlePrint = () => {
		window.print();
	};

	const resetChecklist = useCallback(() => {
		resetChecklistMutation({});
	}, [resetChecklistMutation]);

	// ==================== COMPUTED VALUES ====================

	const allItems = useMemo(
		() => [...preInterviewChecklist, ...dayOfChecklist],
		[preInterviewChecklist, dayOfChecklist],
	);
	const totalItems = allItems.length;
	const completedItems = checkedItems.size;
	const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

	const preInterviewCompleted = preInterviewChecklist.filter((item) => checkedItems.has(item.id)).length;
	const preInterviewProgress =
		preInterviewChecklist.length > 0 ? Math.round((preInterviewCompleted / preInterviewChecklist.length) * 100) : 0;

	const dayOfCompleted = dayOfChecklist.filter((item) => checkedItems.has(item.id)).length;
	const dayOfProgress = dayOfChecklist.length > 0 ? Math.round((dayOfCompleted / dayOfChecklist.length) * 100) : 0;

	const countdown = useMemo(() => {
		if (!reminder?.date || !reminder?.time) return null;

		const interviewDate = new Date(`${reminder.date}T${reminder.time}`);
		const now = new Date();
		const diff = interviewDate.getTime() - now.getTime();

		if (diff <= 0) return { days: 0, hours: 0, minutes: 0, passed: true };

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

		return { days, hours, minutes, passed: false };
	}, [reminder]);

	const [, setTick] = useState(0);
	useEffect(() => {
		const interval = setInterval(() => setTick((tick) => tick + 1), 60000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (reminder?.notificationScheduled) {
			scheduleNotification(reminder);
		}
	}, [reminder, scheduleNotification]);

	// ==================== RENDER ====================

	if (error && !isLoading) {
		return (
			<>
				<DashboardHeader icon={ListChecksIcon} title={t`Liste de controle de preparation`} />
				<ChecklistErrorState queryClient={queryClient} />
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={ListChecksIcon} title={t`Liste de controle de preparation`} />

			<ChecklistHeroSection handlePrint={handlePrint} resetChecklist={resetChecklist} isResetting={isResetting} />

			<ProgressRingSection
				progressPercentage={progressPercentage}
				completedItems={completedItems}
				totalItems={totalItems}
				preInterviewCompleted={preInterviewCompleted}
				preInterviewTotal={preInterviewChecklist.length}
				preInterviewProgress={preInterviewProgress}
				dayOfCompleted={dayOfCompleted}
				dayOfTotal={dayOfChecklist.length}
				dayOfProgress={dayOfProgress}
			/>

			<ReminderSection
				reminder={reminder}
				countdown={countdown}
				reminderDate={reminderDate}
				reminderTime={reminderTime}
				reminderCompany={reminderCompany}
				setReminderDate={setReminderDate}
				setReminderTime={setReminderTime}
				setReminderCompany={setReminderCompany}
				saveReminder={saveReminder}
				clearReminder={clearReminder}
				isSettingReminder={isSettingReminder}
				isClearingReminder={isClearingReminder}
			/>

			<ChecklistSection
				title={t`Avant l'entretien`}
				icon={BookOpenIcon}
				iconColor="text-blue-500"
				completed={preInterviewCompleted}
				total={preInterviewChecklist.length}
				items={preInterviewChecklist}
				checkedItems={checkedItems}
				expandedItems={expandedItems}
				isToggling={isToggling}
				onToggle={toggleItem}
				onExpand={toggleExpand}
			/>

			<ChecklistSection
				title={t`Le jour J`}
				icon={SunIcon}
				iconColor="text-amber-500"
				completed={dayOfCompleted}
				total={dayOfChecklist.length}
				items={dayOfChecklist}
				checkedItems={checkedItems}
				expandedItems={expandedItems}
				isToggling={isToggling}
				onToggle={toggleItem}
				onExpand={toggleExpand}
			/>

			<QuickLinksSection />

			{progressPercentage === 100 && <CompletionCard />}

			<style>{PRINT_STYLES}</style>
		</>
	);
}
