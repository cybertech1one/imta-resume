import { t } from "@lingui/core/macro";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";

import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";

import type { EventType, GoalCategory, SkillCategory, TimelineEvent } from "./timeline-types";

export function useTimelineData() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const timelineRef = useRef<HTMLDivElement>(null);

	const {
		data: timelineData,
		isLoading,
		error,
	} = useQuery({ ...orpc.career.timeline.getAll.queryOptions(), enabled: !!session?.user });
	const { data: statistics } = useQuery({
		...orpc.career.timeline.getStatistics.queryOptions(),
		enabled: !!session?.user,
	});

	const invalidate = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ["career", "timeline"] });
	}, [queryClient]);

	const employmentGaps = statistics?.gaps || [];
	const totalExperience = statistics?.totalExperience || 0;
	const salaryProgression = statistics?.salaryProgression || [];
	const currentSalary = statistics?.currentSalary || 0;

	const stats = useMemo(
		() => ({
			totalEvents: statistics?.totalEvents || 0,
			totalSkills: statistics?.totalSkills || 0,
			activeGoals: statistics?.activeGoals || 0,
			completedGoals: statistics?.completedGoals || 0,
			totalExperience,
			employmentGaps: employmentGaps.length,
		}),
		[statistics, totalExperience, employmentGaps],
	);

	return {
		timelineData,
		isLoading,
		error,
		statistics,
		invalidate,
		employmentGaps,
		totalExperience,
		salaryProgression,
		currentSalary,
		stats,
		timelineRef,
	};
}

export function useEventForm(invalidate: () => void) {
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
	const [newEventType, setNewEventType] = useState<EventType>("job");
	const [newEventTitle, setNewEventTitle] = useState("");
	const [newEventOrg, setNewEventOrg] = useState("");
	const [newEventDesc, setNewEventDesc] = useState("");
	const [newEventStartDate, setNewEventStartDate] = useState("");
	const [newEventEndDate, setNewEventEndDate] = useState("");
	const [newEventSalary, setNewEventSalary] = useState("");
	const [newEventSkills, setNewEventSkills] = useState("");
	const [newEventAchievements, setNewEventAchievements] = useState("");
	const [newEventIsOngoing, setNewEventIsOngoing] = useState(false);

	const createEventMutation = useMutation(
		orpc.career.timeline.events.create.mutationOptions({ onSuccess: invalidate }),
	);
	const updateEventMutation = useMutation(
		orpc.career.timeline.events.update.mutationOptions({ onSuccess: invalidate }),
	);
	const deleteEventMutation = useMutation(
		orpc.career.timeline.events.delete.mutationOptions({ onSuccess: invalidate }),
	);

	const resetEventForm = useCallback(() => {
		setNewEventType("job");
		setNewEventTitle("");
		setNewEventOrg("");
		setNewEventDesc("");
		setNewEventStartDate("");
		setNewEventEndDate("");
		setNewEventSalary("");
		setNewEventSkills("");
		setNewEventAchievements("");
		setNewEventIsOngoing(false);
		setEditingEvent(null);
	}, []);

	const handleSaveEvent = useCallback(() => {
		if (!newEventTitle.trim() || !newEventStartDate) return;

		const eventData = {
			type: newEventType,
			title: newEventTitle.trim(),
			organization: newEventOrg.trim(),
			description: newEventDesc.trim(),
			startDate: newEventStartDate,
			endDate: newEventIsOngoing ? null : newEventEndDate || null,
			salary: newEventSalary ? Number.parseInt(newEventSalary, 10) : undefined,
			skills: newEventSkills
				? newEventSkills
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean)
				: undefined,
			achievements: newEventAchievements
				? newEventAchievements
						.split("\n")
						.map((s) => s.trim())
						.filter(Boolean)
				: undefined,
		};

		if (editingEvent) {
			updateEventMutation.mutate({ id: editingEvent.id, ...eventData });
		} else {
			createEventMutation.mutate(eventData);
		}

		resetEventForm();
		setIsAddDialogOpen(false);
	}, [
		newEventType,
		newEventTitle,
		newEventOrg,
		newEventDesc,
		newEventStartDate,
		newEventEndDate,
		newEventSalary,
		newEventSkills,
		newEventAchievements,
		newEventIsOngoing,
		editingEvent,
		createEventMutation,
		updateEventMutation,
		resetEventForm,
	]);

	const handleDeleteEvent = useCallback(
		(id: string) => {
			deleteEventMutation.mutate({ id });
		},
		[deleteEventMutation],
	);

	const handleEditEvent = useCallback((event: TimelineEvent) => {
		setEditingEvent(event);
		setNewEventType(event.type);
		setNewEventTitle(event.title);
		setNewEventOrg(event.organization);
		setNewEventDesc(event.description);
		setNewEventStartDate(event.startDate);
		setNewEventEndDate(event.endDate || "");
		setNewEventSalary(event.salary?.toString() || "");
		setNewEventSkills(event.skills?.join(", ") || "");
		setNewEventAchievements(event.achievements?.join("\n") || "");
		setNewEventIsOngoing(!event.endDate);
		setIsAddDialogOpen(true);
	}, []);

	return {
		isAddDialogOpen,
		setIsAddDialogOpen,
		editingEvent,
		newEventType,
		setNewEventType,
		newEventTitle,
		setNewEventTitle,
		newEventOrg,
		setNewEventOrg,
		newEventDesc,
		setNewEventDesc,
		newEventStartDate,
		setNewEventStartDate,
		newEventEndDate,
		setNewEventEndDate,
		newEventSalary,
		setNewEventSalary,
		newEventSkills,
		setNewEventSkills,
		newEventAchievements,
		setNewEventAchievements,
		newEventIsOngoing,
		setNewEventIsOngoing,
		createEventMutation,
		updateEventMutation,
		resetEventForm,
		handleSaveEvent,
		handleDeleteEvent,
		handleEditEvent,
	};
}

export function useGoalForm(invalidate: () => void) {
	const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
	const [newGoalTitle, setNewGoalTitle] = useState("");
	const [newGoalDesc, setNewGoalDesc] = useState("");
	const [newGoalCategory, setNewGoalCategory] = useState<string>("position");
	const [newGoalTargetDate, setNewGoalTargetDate] = useState("");
	const [newGoalTargetValue, setNewGoalTargetValue] = useState("");
	const [newGoalCurrentValue, setNewGoalCurrentValue] = useState("");

	const createGoalMutation = useMutation(orpc.career.timeline.goals.create.mutationOptions({ onSuccess: invalidate }));
	const toggleGoalMutation = useMutation(
		orpc.career.timeline.goals.toggleComplete.mutationOptions({ onSuccess: invalidate }),
	);
	const deleteGoalMutation = useMutation(orpc.career.timeline.goals.delete.mutationOptions({ onSuccess: invalidate }));

	const handleAddGoal = useCallback(() => {
		if (!newGoalTitle.trim() || !newGoalTargetDate) return;

		createGoalMutation.mutate({
			title: newGoalTitle.trim(),
			description: newGoalDesc.trim(),
			targetDate: newGoalTargetDate,
			category: newGoalCategory as GoalCategory,
			targetValue: newGoalTargetValue ? Number.parseInt(newGoalTargetValue, 10) : undefined,
			currentValue: newGoalCurrentValue ? Number.parseInt(newGoalCurrentValue, 10) : undefined,
		});

		setNewGoalTitle("");
		setNewGoalDesc("");
		setNewGoalCategory("position");
		setNewGoalTargetDate("");
		setNewGoalTargetValue("");
		setNewGoalCurrentValue("");
		setIsAddGoalDialogOpen(false);
	}, [
		newGoalTitle,
		newGoalDesc,
		newGoalCategory,
		newGoalTargetDate,
		newGoalTargetValue,
		newGoalCurrentValue,
		createGoalMutation,
	]);

	const handleToggleGoalComplete = useCallback(
		(id: string) => {
			toggleGoalMutation.mutate({ id });
		},
		[toggleGoalMutation],
	);

	const handleDeleteGoal = useCallback(
		(id: string) => {
			deleteGoalMutation.mutate({ id });
		},
		[deleteGoalMutation],
	);

	return {
		isAddGoalDialogOpen,
		setIsAddGoalDialogOpen,
		newGoalTitle,
		setNewGoalTitle,
		newGoalDesc,
		setNewGoalDesc,
		newGoalCategory,
		setNewGoalCategory,
		newGoalTargetDate,
		setNewGoalTargetDate,
		newGoalTargetValue,
		setNewGoalTargetValue,
		newGoalCurrentValue,
		setNewGoalCurrentValue,
		createGoalMutation,
		handleAddGoal,
		handleToggleGoalComplete,
		handleDeleteGoal,
	};
}

export function useSkillForm(invalidate: () => void) {
	const [isAddSkillDialogOpen, setIsAddSkillDialogOpen] = useState(false);
	const [newSkillName, setNewSkillName] = useState("");
	const [newSkillLevel, setNewSkillLevel] = useState([3]);
	const [newSkillCategory, setNewSkillCategory] = useState<string>("technical");
	const [newSkillDate, setNewSkillDate] = useState("");

	const createSkillMutation = useMutation(
		orpc.career.timeline.skills.create.mutationOptions({ onSuccess: invalidate }),
	);
	const deleteSkillMutation = useMutation(
		orpc.career.timeline.skills.delete.mutationOptions({ onSuccess: invalidate }),
	);

	const handleAddSkill = useCallback(() => {
		if (!newSkillName.trim() || !newSkillDate) return;

		createSkillMutation.mutate({
			name: newSkillName.trim(),
			level: newSkillLevel[0],
			acquiredDate: newSkillDate,
			category: newSkillCategory as SkillCategory,
		});

		setNewSkillName("");
		setNewSkillLevel([3]);
		setNewSkillCategory("technical");
		setNewSkillDate("");
		setIsAddSkillDialogOpen(false);
	}, [newSkillName, newSkillLevel, newSkillCategory, newSkillDate, createSkillMutation]);

	const handleDeleteSkill = useCallback(
		(id: string) => {
			deleteSkillMutation.mutate({ id });
		},
		[deleteSkillMutation],
	);

	return {
		isAddSkillDialogOpen,
		setIsAddSkillDialogOpen,
		newSkillName,
		setNewSkillName,
		newSkillLevel,
		setNewSkillLevel,
		newSkillCategory,
		setNewSkillCategory,
		newSkillDate,
		setNewSkillDate,
		createSkillMutation,
		handleAddSkill,
		handleDeleteSkill,
	};
}

export function useTimelineFilters(events: TimelineEvent[] | undefined) {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterType, setFilterType] = useState<EventType | "all">("all");

	const filteredEvents = useMemo(() => {
		if (!events) return [];
		return events
			.filter((event) => {
				const matchesSearch =
					event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					event.organization.toLowerCase().includes(searchQuery.toLowerCase());
				const matchesType = filterType === "all" || event.type === filterType;
				return matchesSearch && matchesType;
			})
			.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
	}, [events, searchQuery, filterType]);

	return { searchQuery, setSearchQuery, filterType, setFilterType, filteredEvents };
}

export function useTimelineExport(timelineData: unknown, timelineRef: React.RefObject<HTMLDivElement | null>) {
	return useCallback(
		async (format: "json" | "image") => {
			if (format === "json" && timelineData) {
				const blob = new Blob([JSON.stringify(timelineData, null, 2)], { type: "application/json" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = "career-timeline.json";
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			} else if (format === "image" && timelineRef.current) {
				alert(t`Pour exporter en image, utilisez la fonction de capture d'ecran de votre navigateur (Ctrl+Shift+S)`);
			}
		},
		[timelineData, timelineRef],
	);
}
