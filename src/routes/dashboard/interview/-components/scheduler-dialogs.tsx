import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BellIcon,
	BuildingsIcon,
	CalendarIcon,
	CopyIcon,
	GlobeIcon,
	LinkIcon,
	MapPinIcon,
	NoteIcon,
	NotePencilIcon,
	PencilSimpleIcon,
	PlusIcon,
	SpinnerIcon,
	TrashIcon,
	TrophyIcon,
	UserIcon,
	VideoCameraIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import type { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";
import {
	DAYS_OF_WEEK,
	INTERVIEW_OUTCOMES,
	INTERVIEW_STATUS,
	INTERVIEW_TYPES,
	RECURRENCE_OPTIONS,
	TIMEZONES,
} from "./scheduler-config";
import type {
	Interview,
	InterviewFormValues,
	InterviewOutcome,
	InterviewStatus,
	InterviewType,
	RecurrenceType,
	ReminderType,
} from "./scheduler-types";
import { formatDate, formatTime } from "./scheduler-utils";

// ==================== CREATE/EDIT DIALOG ====================

interface CreateEditDialogProps {
	isOpen: boolean;
	isEditMode: boolean;
	form: UseFormReturn<InterviewFormValues>;
	formData: InterviewFormValues;
	isSaving: boolean;
	newInterviewerName: string;
	onNewInterviewerNameChange: (name: string) => void;
	onAddInterviewer: () => void;
	onRemoveInterviewer: (index: number) => void;
	onClose: () => void;
	onSubmit: () => void;
}

export function CreateEditDialog({
	isOpen,
	isEditMode,
	form,
	formData,
	isSaving,
	newInterviewerName,
	onNewInterviewerNameChange,
	onAddInterviewer,
	onRemoveInterviewer,
	onClose,
	onSubmit,
}: CreateEditDialogProps) {
	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{isEditMode ? <Trans>Edit interview</Trans> : <Trans>New interview</Trans>}</DialogTitle>
					<DialogDescription>
						{isEditMode ? <Trans>Update your interview information</Trans> : <Trans>Schedule a new interview</Trans>}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Basic Info */}
					<div className="space-y-4">
						<h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
							<Trans>Basic information</Trans>
						</h4>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label>
									<Trans>Company</Trans> *
								</Label>
								<Input
									placeholder={t`Ex: Google`}
									value={formData.company}
									onChange={(e) => form.setValue("company", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>
									<Trans>Position</Trans> *
								</Label>
								<Input
									placeholder={t`E.g.: Frontend Developer`}
									value={formData.role}
									onChange={(e) => form.setValue("role", e.target.value)}
								/>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label>
									<Trans>Interview type</Trans>
								</Label>
								<Select value={formData.type} onValueChange={(v) => form.setValue("type", v as InterviewType)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.entries(INTERVIEW_TYPES).map(([key, config]) => {
											const TypeIcon = config.icon;
											return (
												<SelectItem key={key} value={key}>
													<div className="flex items-center gap-2">
														<TypeIcon className="size-4" />
														{config.label}
													</div>
												</SelectItem>
											);
										})}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>
									<Trans>Round</Trans>
								</Label>
								<Select
									value={formData.round.toString()}
									onValueChange={(v) => form.setValue("round", Number.parseInt(v, 10))}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{[1, 2, 3, 4, 5].map((round) => (
											<SelectItem key={round} value={round.toString()}>
												Round {round}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					{/* Date & Time */}
					<div className="space-y-4">
						<h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
							<Trans>Date and time</Trans>
						</h4>

						<div className="grid gap-4 sm:grid-cols-3">
							<div className="space-y-2">
								<Label>
									<Trans>Date</Trans> *
								</Label>
								<Input type="date" value={formData.date} onChange={(e) => form.setValue("date", e.target.value)} />
							</div>
							<div className="space-y-2">
								<Label>
									<Trans>Start</Trans>
								</Label>
								<Input
									type="time"
									value={formData.startTime}
									onChange={(e) => form.setValue("startTime", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>
									<Trans>End</Trans>
								</Label>
								<Input
									type="time"
									value={formData.endTime}
									onChange={(e) => form.setValue("endTime", e.target.value)}
								/>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label>
									<Trans>Timezone</Trans>
								</Label>
								<Select value={formData.timezone} onValueChange={(v) => form.setValue("timezone", v)}>
									<SelectTrigger>
										<GlobeIcon className="mr-2 size-4" />
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{TIMEZONES.map((tz) => (
											<SelectItem key={tz.value} value={tz.value}>
												{tz.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>
									<Trans>Recurrence</Trans>
								</Label>
								<Select
									value={formData.recurrence}
									onValueChange={(v) => form.setValue("recurrence", v as RecurrenceType)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.entries(RECURRENCE_OPTIONS).map(([key, label]) => (
											<SelectItem key={key} value={key}>
												{label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					{/* Location & Meeting */}
					<div className="space-y-4">
						<h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
							<Trans>Location and link</Trans>
						</h4>

						{formData.type === "in_person" && (
							<div className="space-y-2">
								<Label>
									<Trans>Address</Trans>
								</Label>
								<Input
									placeholder={t`E.g.: 123 Main Street, City`}
									value={formData.location}
									onChange={(e) => form.setValue("location", e.target.value)}
								/>
							</div>
						)}

						{formData.type === "video" && (
							<div className="space-y-2">
								<Label>
									<Trans>Meeting link</Trans>
								</Label>
								<div className="relative">
									<LinkIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										placeholder={t`Ex: https://meet.google.com/abc-defg-hij`}
										value={formData.meetingLink}
										onChange={(e) => form.setValue("meetingLink", e.target.value)}
										className="pl-9"
									/>
								</div>
							</div>
						)}

						{formData.type === "phone" && (
							<div className="space-y-2">
								<Label>
									<Trans>Phone number to call</Trans>
								</Label>
								<Input
									placeholder={t`Ex: +212 6 00 00 00 00`}
									value={formData.contactPhone}
									onChange={(e) => form.setValue("contactPhone", e.target.value)}
								/>
							</div>
						)}
					</div>

					{/* Contact Info */}
					<div className="space-y-4">
						<h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
							<Trans>Recruiter contact</Trans>
						</h4>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label>
									<Trans>Contact name</Trans>
								</Label>
								<Input
									placeholder={t`E.g.: Jane Smith`}
									value={formData.contactName}
									onChange={(e) => form.setValue("contactName", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>
									<Trans>Email</Trans>
								</Label>
								<Input
									type="email"
									placeholder={t`E.g.: jane@company.com`}
									value={formData.contactEmail}
									onChange={(e) => form.setValue("contactEmail", e.target.value)}
								/>
							</div>
						</div>
					</div>

					{/* Interviewers */}
					<div className="space-y-4">
						<h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
							<Trans>Interviewers</Trans>
						</h4>

						<div className="flex gap-2">
							<Input
								placeholder={t`Interviewer name`}
								value={newInterviewerName}
								onChange={(e) => onNewInterviewerNameChange(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && onAddInterviewer()}
							/>
							<Button type="button" variant="outline" onClick={onAddInterviewer}>
								<PlusIcon className="size-4" />
							</Button>
						</div>

						{(formData.interviewerNames ?? []).length > 0 && (
							<div className="flex flex-wrap gap-2">
								{(formData.interviewerNames ?? []).map((name, index) => (
									<Badge key={index} variant="secondary" className="gap-1">
										<UserIcon className="size-3" />
										{name}
										<button
											type="button"
											className="ml-1 hover:text-destructive"
											onClick={() => onRemoveInterviewer(index)}
										>
											<XCircleIcon className="size-3" />
										</button>
									</Badge>
								))}
							</div>
						)}
					</div>

					{/* Notes & Preparation */}
					<div className="space-y-4">
						<h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
							<Trans>Notes and preparation</Trans>
						</h4>

						<div className="space-y-2">
							<Label>
								<Trans>Notes</Trans>
							</Label>
							<Textarea
								placeholder={t`Personal notes about this interview...`}
								value={formData.notes}
								onChange={(e) => form.setValue("notes", e.target.value)}
								rows={3}
							/>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Preparation materials</Trans>
							</Label>
							<Textarea
								placeholder={t`List of topics to review, questions to prepare...`}
								value={formData.preparationMaterials}
								onChange={(e) => form.setValue("preparationMaterials", e.target.value)}
								rows={3}
							/>
						</div>
					</div>

					{/* Status (Edit only) */}
					{isEditMode && (
						<div className="space-y-4">
							<h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
								<Trans>Status</Trans>
							</h4>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label>
										<Trans>Status</Trans>
									</Label>
									<Select value={formData.status} onValueChange={(v) => form.setValue("status", v as InterviewStatus)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(INTERVIEW_STATUS).map(([key, config]) => (
												<SelectItem key={key} value={key}>
													{config.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>
										<Trans>Result</Trans>
									</Label>
									<Select
										value={formData.outcome}
										onValueChange={(v) => form.setValue("outcome", v as InterviewOutcome)}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(INTERVIEW_OUTCOMES).map(([key, config]) => {
												const OutcomeIcon = config.icon;
												return (
													<SelectItem key={key} value={key}>
														<div className="flex items-center gap-2">
															<OutcomeIcon className="size-4" />
															{config.label}
														</div>
													</SelectItem>
												);
											})}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSubmit} disabled={!formData.company || !formData.role || !formData.date || isSaving}>
						{isSaving ? (
							<SpinnerIcon className="mr-2 size-4 animate-spin" />
						) : isEditMode ? (
							<Trans>Update</Trans>
						) : (
							<Trans>Create</Trans>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ==================== INTERVIEW DETAIL DIALOG ====================

interface InterviewDetailDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedInterview: Interview | null;
	onOpenEdit: (interview: Interview) => void;
	onCopyMeetingLink: (link: string) => void;
	onUpdateOutcome: (interviewId: string, outcome: InterviewOutcome) => void;
	onToggleReminder: (interviewId: string, reminderId: string) => void;
	onDeleteReminder: (interviewId: string, reminderId: string) => void;
	onAddReminder: () => void;
}

export function InterviewDetailDialog({
	isOpen,
	onOpenChange,
	selectedInterview,
	onOpenEdit,
	onCopyMeetingLink,
	onUpdateOutcome,
	onToggleReminder,
	onDeleteReminder,
	onAddReminder,
}: InterviewDetailDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				{selectedInterview && (
					<>
						<DialogHeader>
							<div className="flex items-start justify-between">
								<div>
									<DialogTitle className="flex items-center gap-2 text-xl">
										<BuildingsIcon className="size-6 text-primary" weight="duotone" />
										{selectedInterview.company}
									</DialogTitle>
									<DialogDescription className="mt-1 text-base">{selectedInterview.role}</DialogDescription>
								</div>
								<div className="flex items-center gap-2">
									<Badge
										className={cn(
											INTERVIEW_STATUS[selectedInterview.status as InterviewStatus]?.bgColor,
											INTERVIEW_STATUS[selectedInterview.status as InterviewStatus]?.color,
										)}
									>
										{INTERVIEW_STATUS[selectedInterview.status as InterviewStatus]?.label}
									</Badge>
								</div>
							</div>
						</DialogHeader>

						<div className="space-y-6 py-4">
							{/* Time & Location */}
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="flex items-center gap-3 rounded-lg border p-4">
									<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
										<CalendarIcon className="size-5 text-primary" />
									</div>
									<div>
										<p className="font-medium">{formatDate(selectedInterview.date)}</p>
										<p className="text-muted-foreground text-sm">
											{formatTime(selectedInterview.startTime)} - {formatTime(selectedInterview.endTime)}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-3 rounded-lg border p-4">
									{(() => {
										const interviewType = selectedInterview.type as InterviewType;
										const TypeIcon = INTERVIEW_TYPES[interviewType]?.icon || VideoCameraIcon;
										return (
											<>
												<div
													className={cn(
														"flex size-10 items-center justify-center rounded-lg",
														INTERVIEW_TYPES[interviewType]?.bgColor,
													)}
												>
													<TypeIcon className={cn("size-5", INTERVIEW_TYPES[interviewType]?.color)} />
												</div>
												<div>
													<p className="font-medium">{INTERVIEW_TYPES[interviewType]?.label}</p>
													<p className="text-muted-foreground text-sm">Round {selectedInterview.round}</p>
												</div>
											</>
										);
									})()}
								</div>
							</div>

							{/* Meeting Link or Location */}
							{selectedInterview.meetingLink && (
								<div className="rounded-lg border bg-primary/5 p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<VideoCameraIcon className="size-5 text-primary" />
											<span className="font-medium">
												<Trans>Meeting link</Trans>
											</span>
										</div>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												className="gap-2"
												onClick={() => onCopyMeetingLink(selectedInterview.meetingLink || "")}
											>
												<CopyIcon className="size-4" />
												<Trans>Copy</Trans>
											</Button>
											<Button
												size="sm"
												className="gap-2"
												onClick={() => window.open(selectedInterview.meetingLink || "", "_blank")}
											>
												<ArrowRightIcon className="size-4" />
												<Trans>Join</Trans>
											</Button>
										</div>
									</div>
								</div>
							)}

							{selectedInterview.location && (
								<div className="rounded-lg border p-4">
									<div className="flex items-center gap-2">
										<MapPinIcon className="size-5 text-green-600" />
										<span className="font-medium">
											<Trans>Location</Trans>
										</span>
									</div>
									<p className="mt-2 text-muted-foreground">{selectedInterview.location}</p>
								</div>
							)}

							{/* Contact Info */}
							{(selectedInterview.contactName || selectedInterview.contactEmail) && (
								<div className="rounded-lg border p-4">
									<h4 className="mb-3 flex items-center gap-2 font-medium">
										<UserIcon className="size-5" />
										<Trans>Contact</Trans>
									</h4>
									<div className="space-y-2 text-sm">
										{selectedInterview.contactName && (
											<p>
												<span className="text-muted-foreground">
													<Trans>Name:</Trans>
												</span>{" "}
												{selectedInterview.contactName}
											</p>
										)}
										{selectedInterview.contactEmail && (
											<p className="flex items-center gap-2">
												<span className="text-muted-foreground">
													<Trans>Email:</Trans>
												</span>
												<a href={`mailto:${selectedInterview.contactEmail}`} className="text-primary hover:underline">
													{selectedInterview.contactEmail}
												</a>
											</p>
										)}
										{selectedInterview.contactPhone && (
											<p>
												<span className="text-muted-foreground">
													<Trans>Phone:</Trans>
												</span>{" "}
												{selectedInterview.contactPhone}
											</p>
										)}
									</div>
								</div>
							)}

							{/* Interviewers */}
							{selectedInterview.interviewerNames && selectedInterview.interviewerNames.length > 0 && (
								<div className="rounded-lg border p-4">
									<h4 className="mb-3 flex items-center gap-2 font-medium">
										<UserIcon className="size-5" />
										<Trans>Interviewers</Trans>
									</h4>
									<div className="flex flex-wrap gap-2">
										{selectedInterview.interviewerNames.map((name, index) => (
											<Badge key={index} variant="secondary">
												{name}
											</Badge>
										))}
									</div>
								</div>
							)}

							{/* Notes */}
							{selectedInterview.notes && (
								<div className="rounded-lg border p-4">
									<h4 className="mb-3 flex items-center gap-2 font-medium">
										<NoteIcon className="size-5" />
										<Trans>Notes</Trans>
									</h4>
									<p className="whitespace-pre-wrap text-muted-foreground text-sm">{selectedInterview.notes}</p>
								</div>
							)}

							{/* Preparation Materials */}
							{selectedInterview.preparationMaterials && (
								<div className="rounded-lg border border-amber-500/30 bg-amber-50/50 p-4 dark:bg-amber-900/10">
									<h4 className="mb-3 flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
										<NotePencilIcon className="size-5" />
										<Trans>Preparation materials</Trans>
									</h4>
									<p className="whitespace-pre-wrap text-sm">{selectedInterview.preparationMaterials}</p>
								</div>
							)}

							{/* Reminders */}
							<div className="rounded-lg border p-4">
								<div className="mb-3 flex items-center justify-between">
									<h4 className="flex items-center gap-2 font-medium">
										<BellIcon className="size-5" />
										<Trans>Reminders</Trans>
									</h4>
									<Button variant="outline" size="sm" className="gap-2" onClick={onAddReminder}>
										<PlusIcon className="size-4" />
										<Trans>Add</Trans>
									</Button>
								</div>
								{selectedInterview.reminders && selectedInterview.reminders.length > 0 ? (
									<div className="space-y-2">
										{selectedInterview.reminders.map((reminder) => (
											<div
												key={reminder.id}
												className={cn(
													"flex items-center justify-between rounded-lg bg-muted/50 p-3",
													reminder.completed && "opacity-60",
												)}
											>
												<div className="flex items-center gap-3">
													<Switch
														checked={reminder.completed}
														onCheckedChange={() => onToggleReminder(selectedInterview.id, reminder.id)}
													/>
													<div>
														<p className={cn("font-medium text-sm", reminder.completed && "line-through")}>
															{reminder.message}
														</p>
														<p className="text-muted-foreground text-xs">
															{formatDate(reminder.date, { day: "numeric", month: "short" })} at{" "}
															{formatTime(reminder.time)}
														</p>
													</div>
												</div>
												<div className="flex items-center gap-2">
													<Badge
														variant="outline"
														className={cn(
															"text-xs",
															reminder.type === "preparation"
																? "border-blue-500/50 text-blue-600"
																: "border-green-500/50 text-green-600",
														)}
													>
														{reminder.type === "preparation" ? "Preparation" : "Follow-up"}
													</Badge>
													<Button
														variant="ghost"
														size="icon"
														className="size-7 text-destructive"
														onClick={() => onDeleteReminder(selectedInterview.id, reminder.id)}
													>
														<TrashIcon className="size-4" />
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<p className="text-center text-muted-foreground text-sm">
										<Trans>No reminders configured</Trans>
									</p>
								)}
							</div>

							{/* Outcome (if completed) */}
							{selectedInterview.status === "completed" && (
								<div className="rounded-lg border p-4">
									<h4 className="mb-3 flex items-center gap-2 font-medium">
										<TrophyIcon className="size-5" />
										<Trans>Result</Trans>
									</h4>
									<div className="flex flex-wrap gap-2">
										{Object.entries(INTERVIEW_OUTCOMES).map(([key, config]) => {
											const OutcomeIcon = config.icon;
											const isSelected = selectedInterview.outcome === key;
											return (
												<Button
													key={key}
													variant={isSelected ? "default" : "outline"}
													size="sm"
													className={cn("gap-2", isSelected && config.bgColor, isSelected && config.color)}
													onClick={() => onUpdateOutcome(selectedInterview.id, key as InterviewOutcome)}
												>
													<OutcomeIcon className="size-4" />
													{config.label}
												</Button>
											);
										})}
									</div>
								</div>
							)}
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={() => onOpenEdit(selectedInterview)}>
								<PencilSimpleIcon className="mr-2 size-4" />
								<Trans>Edit</Trans>
							</Button>
							<DialogClose asChild>
								<Button>
									<Trans>Close</Trans>
								</Button>
							</DialogClose>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

// ==================== DELETE CONFIRM DIALOG ====================

interface DeleteConfirmDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	isDeleting: boolean;
	onConfirm: () => void;
}

export function DeleteConfirmDialog({ isOpen, onOpenChange, isDeleting, onConfirm }: DeleteConfirmDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Delete this interview?</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>This action is irreversible. The interview will be permanently deleted.</Trans>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
						{isDeleting ? <SpinnerIcon className="mr-2 size-4 animate-spin" /> : null}
						<Trans>Delete</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ==================== AVAILABILITY DIALOG ====================

interface AvailabilityDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	availabilityForm: {
		dayOfWeek: number;
		startTime: string;
		endTime: string;
		isRecurring: boolean;
	};
	onFormChange: (form: AvailabilityDialogProps["availabilityForm"]) => void;
	isAdding: boolean;
	onSubmit: () => void;
}

export function AvailabilityDialog({
	isOpen,
	onOpenChange,
	availabilityForm,
	onFormChange,
	isAdding,
	onSubmit,
}: AvailabilityDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Add availability</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Define a time slot when you are available for interviews</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label>
							<Trans>Day</Trans>
						</Label>
						<Select
							value={availabilityForm.dayOfWeek.toString()}
							onValueChange={(v) => onFormChange({ ...availabilityForm, dayOfWeek: Number.parseInt(v, 10) })}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{DAYS_OF_WEEK.map((day) => (
									<SelectItem key={day.value} value={day.value.toString()}>
										{day.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>
								<Trans>Start time</Trans>
							</Label>
							<Input
								type="time"
								value={availabilityForm.startTime}
								onChange={(e) => onFormChange({ ...availabilityForm, startTime: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>End time</Trans>
							</Label>
							<Input
								type="time"
								value={availabilityForm.endTime}
								onChange={(e) => onFormChange({ ...availabilityForm, endTime: e.target.value })}
							/>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<Switch
							id="recurring"
							checked={availabilityForm.isRecurring}
							onCheckedChange={(checked) => onFormChange({ ...availabilityForm, isRecurring: checked })}
						/>
						<Label htmlFor="recurring" className="cursor-pointer">
							<Trans>Repeat every week</Trans>
						</Label>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSubmit} disabled={isAdding}>
						{isAdding ? <SpinnerIcon className="mr-2 size-4 animate-spin" /> : null}
						<Trans>Add</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ==================== REMINDER DIALOG ====================

interface ReminderDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	reminderForm: {
		type: ReminderType;
		date: string;
		time: string;
		message: string;
	};
	onFormChange: (form: ReminderDialogProps["reminderForm"]) => void;
	isAdding: boolean;
	onSubmit: () => void;
}

export function ReminderDialog({
	isOpen,
	onOpenChange,
	reminderForm,
	onFormChange,
	isAdding,
	onSubmit,
}: ReminderDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Add a reminder</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Configure a reminder for this interview</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label>
							<Trans>Reminder type</Trans>
						</Label>
						<Select
							value={reminderForm.type}
							onValueChange={(v) => onFormChange({ ...reminderForm, type: v as ReminderType })}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="preparation">
									<Trans>Preparation</Trans>
								</SelectItem>
								<SelectItem value="followup">
									<Trans>Post-interview follow-up</Trans>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>
								<Trans>Date</Trans>
							</Label>
							<Input
								type="date"
								value={reminderForm.date}
								onChange={(e) => onFormChange({ ...reminderForm, date: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label>
								<Trans>Time</Trans>
							</Label>
							<Input
								type="time"
								value={reminderForm.time}
								onChange={(e) => onFormChange({ ...reminderForm, time: e.target.value })}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label>
							<Trans>Message</Trans>
						</Label>
						<Textarea
							placeholder={
								reminderForm.type === "preparation"
									? t`E.g.: Review technical questions`
									: t`E.g.: Send a thank-you email`
							}
							value={reminderForm.message}
							onChange={(e) => onFormChange({ ...reminderForm, message: e.target.value })}
							rows={2}
						/>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button onClick={onSubmit} disabled={!reminderForm.message || isAdding}>
						{isAdding ? <SpinnerIcon className="mr-2 size-4 animate-spin" /> : null}
						<Trans>Add</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
