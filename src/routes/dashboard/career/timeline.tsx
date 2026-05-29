import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CalendarIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	CurrencyCircleDollarIcon,
	DownloadSimpleIcon,
	LightbulbIcon,
	MagnifyingGlassIcon,
	PlusCircleIcon,
	TargetIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { ErrorComponent } from "@/components/error-component";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { DashboardHeader } from "../-components/header";
import {
	AnalysisTabContent,
	BenchmarkComparison,
	EventFormDialog,
	GapIndicator,
	GoalFormDialog,
	GoalsTracker,
	HeroSection,
	SalaryChart,
	SkillFormDialog,
	SkillsTimeline,
	TimelineEventCard,
} from "./-components/timeline-components";
import { EVENT_TYPE_CONFIG } from "./-components/timeline-config";
import {
	useEventForm,
	useGoalForm,
	useSkillForm,
	useTimelineData,
	useTimelineExport,
	useTimelineFilters,
} from "./-components/timeline-hooks";
import type { EventType } from "./-components/timeline-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/timeline" as any)({
	component: CareerTimeline,
	errorComponent: ErrorComponent,
});

function CareerTimeline() {
	const [activeTab, setActiveTab] = useState("timeline");

	const {
		timelineData,
		isLoading,
		error,
		invalidate,
		employmentGaps,
		totalExperience,
		salaryProgression,
		currentSalary,
		stats,
		timelineRef,
	} = useTimelineData();

	const eventForm = useEventForm(invalidate);
	const goalForm = useGoalForm(invalidate);
	const skillForm = useSkillForm(invalidate);
	const { searchQuery, setSearchQuery, filterType, setFilterType, filteredEvents } = useTimelineFilters(
		timelineData?.events,
	);
	const handleExport = useTimelineExport(timelineData, timelineRef);

	if (isLoading) {
		return (
			<>
				<DashboardHeader icon={ChartLineUpIcon} title={t`Career Timeline`} />
				<div className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-4">
						<div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						<p className="text-muted-foreground">
							<Trans>Loading...</Trans>
						</p>
					</div>
				</div>
			</>
		);
	}

	if (error) {
		return (
			<>
				<DashboardHeader icon={ChartLineUpIcon} title={t`Career Timeline`} />
				<Card className="border-destructive">
					<CardContent className="flex flex-col items-center py-12 text-center">
						<WarningCircleIcon className="mb-4 size-12 text-destructive" />
						<h3 className="mb-2 font-medium text-lg">
							<Trans>Loading error</Trans>
						</h3>
						<p className="text-muted-foreground">
							<Trans>An error occurred while loading your data.</Trans>
						</p>
					</CardContent>
				</Card>
			</>
		);
	}

	return (
		<>
			<DashboardHeader icon={ChartLineUpIcon} title={t`Career Timeline`} />

			<HeroSection stats={stats} />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "timeline", icon: CalendarIcon, label: t`Timeline` },
						{ value: "skills", icon: LightbulbIcon, label: t`Skills` },
						{ value: "salary", icon: CurrencyCircleDollarIcon, label: t`Salary` },
						{ value: "goals", icon: TargetIcon, label: t`Goals` },
						{ value: "analysis", icon: ChartBarIcon, label: t`Analysis` },
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

				<TabsContent value="timeline" className="space-y-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div className="flex flex-1 gap-4">
							<div className="relative flex-1 md:max-w-sm">
								<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder={t`Search...`}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-9"
								/>
							</div>
							<Select value={filterType} onValueChange={(v) => setFilterType(v as EventType | "all")}>
								<SelectTrigger className="w-48">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										<Trans>All types</Trans>
									</SelectItem>
									{(Object.keys(EVENT_TYPE_CONFIG) as EventType[]).map((type) => (
										<SelectItem key={type} value={type}>
											{EVENT_TYPE_CONFIG[type].label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex gap-2">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="outline" size="icon" onClick={() => handleExport("json")}>
										<DownloadSimpleIcon className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<Trans>Export JSON</Trans>
								</TooltipContent>
							</Tooltip>
							<EventFormDialog
								open={eventForm.isAddDialogOpen}
								onOpenChange={eventForm.setIsAddDialogOpen}
								editingEvent={eventForm.editingEvent}
								eventType={eventForm.newEventType}
								onEventTypeChange={eventForm.setNewEventType}
								eventTitle={eventForm.newEventTitle}
								onEventTitleChange={eventForm.setNewEventTitle}
								eventOrg={eventForm.newEventOrg}
								onEventOrgChange={eventForm.setNewEventOrg}
								eventDesc={eventForm.newEventDesc}
								onEventDescChange={eventForm.setNewEventDesc}
								eventStartDate={eventForm.newEventStartDate}
								onEventStartDateChange={eventForm.setNewEventStartDate}
								eventEndDate={eventForm.newEventEndDate}
								onEventEndDateChange={eventForm.setNewEventEndDate}
								eventSalary={eventForm.newEventSalary}
								onEventSalaryChange={eventForm.setNewEventSalary}
								eventSkills={eventForm.newEventSkills}
								onEventSkillsChange={eventForm.setNewEventSkills}
								eventAchievements={eventForm.newEventAchievements}
								onEventAchievementsChange={eventForm.setNewEventAchievements}
								eventIsOngoing={eventForm.newEventIsOngoing}
								onEventIsOngoingChange={eventForm.setNewEventIsOngoing}
								onSave={eventForm.handleSaveEvent}
								onReset={eventForm.resetEventForm}
								isSaving={eventForm.createEventMutation.isPending || eventForm.updateEventMutation.isPending}
							/>
						</div>
					</div>

					<div ref={timelineRef} className="relative">
						{filteredEvents.length === 0 ? (
							<Card className="border-dashed">
								<CardContent className="flex flex-col items-center py-12 text-center">
									<CalendarIcon className="mb-4 size-12 text-muted-foreground/50" />
									<h3 className="mb-2 font-medium text-lg">
										<Trans>No events</Trans>
									</h3>
									<p className="mb-4 max-w-sm text-muted-foreground">
										<Trans>Start building your career timeline by adding your professional experiences.</Trans>
									</p>
									<Button onClick={() => eventForm.setIsAddDialogOpen(true)} className="gap-2">
										<PlusCircleIcon className="size-4" />
										<Trans>Add an Event</Trans>
									</Button>
								</CardContent>
							</Card>
						) : (
							<AnimatePresence mode="popLayout">
								{filteredEvents.map((event, index) => {
									const gap = employmentGaps.find(
										(g) =>
											new Date(g.end) <= new Date(event.startDate) &&
											(index === 0 || new Date(g.start) >= new Date(filteredEvents[index - 1]?.endDate || 0)),
									);

									return (
										<div key={event.id}>
											{gap && <GapIndicator gap={gap} />}
											<TimelineEventCard
												event={event}
												onEdit={() => eventForm.handleEditEvent(event)}
												onDelete={() => eventForm.handleDeleteEvent(event.id)}
											/>
										</div>
									);
								})}
							</AnimatePresence>
						)}
					</div>
				</TabsContent>

				<TabsContent value="skills" className="space-y-6">
					<div className="flex items-center justify-between">
						<h3 className="flex items-center gap-2 font-semibold text-xl">
							<LightbulbIcon className="size-6 text-primary" weight="duotone" />
							<Trans>Skills Acquisition</Trans>
						</h3>
						<SkillFormDialog
							open={skillForm.isAddSkillDialogOpen}
							onOpenChange={skillForm.setIsAddSkillDialogOpen}
							skillName={skillForm.newSkillName}
							onSkillNameChange={skillForm.setNewSkillName}
							skillCategory={skillForm.newSkillCategory}
							onSkillCategoryChange={skillForm.setNewSkillCategory}
							skillLevel={skillForm.newSkillLevel}
							onSkillLevelChange={skillForm.setNewSkillLevel}
							skillDate={skillForm.newSkillDate}
							onSkillDateChange={skillForm.setNewSkillDate}
							onSave={skillForm.handleAddSkill}
							isSaving={skillForm.createSkillMutation.isPending}
						/>
					</div>
					<SkillsTimeline skills={timelineData?.skills || []} onDelete={skillForm.handleDeleteSkill} />
				</TabsContent>

				<TabsContent value="salary" className="space-y-6">
					<SalaryChart data={salaryProgression} />
					{currentSalary > 0 && <BenchmarkComparison currentSalary={currentSalary} experience={totalExperience} />}
					{salaryProgression.length === 0 && (
						<Card className="border-dashed">
							<CardContent className="flex flex-col items-center py-12 text-center">
								<CurrencyCircleDollarIcon className="mb-4 size-12 text-muted-foreground/50" />
								<h3 className="mb-2 font-medium text-lg">
									<Trans>No salary data</Trans>
								</h3>
								<p className="mb-4 max-w-sm text-muted-foreground">
									<Trans>Add events with salary information to visualize your progression.</Trans>
								</p>
								<Button onClick={() => eventForm.setIsAddDialogOpen(true)} className="gap-2">
									<PlusCircleIcon className="size-4" />
									<Trans>Add an Event</Trans>
								</Button>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="goals" className="space-y-6">
					<div className="flex items-center justify-between">
						<h3 className="flex items-center gap-2 font-semibold text-xl">
							<TargetIcon className="size-6 text-primary" weight="duotone" />
							<Trans>Career Goals</Trans>
						</h3>
						<GoalFormDialog
							open={goalForm.isAddGoalDialogOpen}
							onOpenChange={goalForm.setIsAddGoalDialogOpen}
							goalTitle={goalForm.newGoalTitle}
							onGoalTitleChange={goalForm.setNewGoalTitle}
							goalDesc={goalForm.newGoalDesc}
							onGoalDescChange={goalForm.setNewGoalDesc}
							goalCategory={goalForm.newGoalCategory}
							onGoalCategoryChange={goalForm.setNewGoalCategory}
							goalTargetDate={goalForm.newGoalTargetDate}
							onGoalTargetDateChange={goalForm.setNewGoalTargetDate}
							goalTargetValue={goalForm.newGoalTargetValue}
							onGoalTargetValueChange={goalForm.setNewGoalTargetValue}
							goalCurrentValue={goalForm.newGoalCurrentValue}
							onGoalCurrentValueChange={goalForm.setNewGoalCurrentValue}
							onSave={goalForm.handleAddGoal}
							isSaving={goalForm.createGoalMutation.isPending}
						/>
					</div>
					<GoalsTracker
						goals={timelineData?.goals || []}
						onToggleComplete={goalForm.handleToggleGoalComplete}
						onDelete={goalForm.handleDeleteGoal}
					/>
				</TabsContent>

				<TabsContent value="analysis" className="space-y-6">
					<AnalysisTabContent
						employmentGaps={employmentGaps}
						stats={stats}
						events={timelineData?.events || []}
						onExport={handleExport}
					/>
				</TabsContent>
			</Tabs>
		</>
	);
}
