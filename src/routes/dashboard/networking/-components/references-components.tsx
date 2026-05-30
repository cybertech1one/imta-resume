import { t } from "@lingui/core/macro";
import {
	BellIcon,
	BriefcaseIcon,
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
	CopyIcon,
	EnvelopeIcon,
	FunnelIcon,
	MagnifyingGlassIcon,
	NoteIcon,
	PencilSimpleIcon,
	PhoneIcon,
	PlusIcon,
	SpinnerIcon,
	TrashIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import type { UseMutationResult } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";

import { emailTemplates, relationshipConfig, statusConfig } from "./references-config";
import type { Reference, RelationshipType, RequestStatus } from "./references-types";
import { daysSinceContact, getReminderIndicator } from "./references-utils";

interface StatsCardsProps {
	stats: { total: number; confirmed: number; pending: number; needsFollowUp: number };
	isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
		>
			<Card className="border-l-4 border-l-blue-500">
				<CardContent className="p-4">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
							<UsersIcon className="size-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<p className="text-muted-foreground text-sm">{t`Total references`}</p>
							{isLoading ? <Skeleton className="h-8 w-12" /> : <p className="font-bold text-2xl">{stats.total}</p>}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="border-l-4 border-l-green-500">
				<CardContent className="p-4">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
							<CheckCircleIcon className="size-5 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<p className="text-muted-foreground text-sm">{t`Confirmed`}</p>
							{isLoading ? <Skeleton className="h-8 w-12" /> : <p className="font-bold text-2xl">{stats.confirmed}</p>}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="border-l-4 border-l-amber-500">
				<CardContent className="p-4">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
							<ClockIcon className="size-5 text-amber-600 dark:text-amber-400" />
						</div>
						<div>
							<p className="text-muted-foreground text-sm">{t`Pending`}</p>
							{isLoading ? <Skeleton className="h-8 w-12" /> : <p className="font-bold text-2xl">{stats.pending}</p>}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="border-l-4 border-l-red-500">
				<CardContent className="p-4">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
							<BellIcon className="size-5 text-red-600 dark:text-red-400" />
						</div>
						<div>
							<p className="text-muted-foreground text-sm">{t`Needs follow-up`}</p>
							{isLoading ? (
								<Skeleton className="h-8 w-12" />
							) : (
								<p className="font-bold text-2xl">{stats.needsFollowUp}</p>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

interface FiltersBarProps {
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	filterRelationship: RelationshipType | "all";
	setFilterRelationship: (value: RelationshipType | "all") => void;
	filterStatus: RequestStatus | "all";
	setFilterStatus: (value: RequestStatus | "all") => void;
	onAddClick: () => void;
}

export function FiltersBar({
	searchQuery,
	setSearchQuery,
	filterRelationship,
	setFilterRelationship,
	filterStatus,
	setFilterStatus,
	onAddClick,
}: FiltersBarProps) {
	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 0.1 }}
			className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
		>
			<div className="flex flex-1 flex-col gap-3 sm:flex-row">
				<div className="relative flex-1 sm:max-w-xs">
					<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder={t`Search for a reference...`}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row">
					<Select
						value={filterRelationship}
						onValueChange={(value) => setFilterRelationship(value as RelationshipType | "all")}
					>
						<SelectTrigger className="w-full sm:w-[160px]">
							<FunnelIcon className="mr-2 size-4" />
							<SelectValue placeholder={t`Relationship`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">{t`All relationships`}</SelectItem>
							<SelectItem value="supervisor">{t`Supervisor`}</SelectItem>
							<SelectItem value="colleague">{t`Colleague`}</SelectItem>
							<SelectItem value="mentor">{t`Mentor`}</SelectItem>
							<SelectItem value="professor">{t`Professor`}</SelectItem>
						</SelectContent>
					</Select>

					<Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as RequestStatus | "all")}>
						<SelectTrigger className="w-full sm:w-[160px]">
							<FunnelIcon className="mr-2 size-4" />
							<SelectValue placeholder={t`Status`} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">{t`All statuses`}</SelectItem>
							<SelectItem value="not_asked">{t`Not asked`}</SelectItem>
							<SelectItem value="pending">{t`Pending`}</SelectItem>
							<SelectItem value="confirmed">{t`Confirmed`}</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<Button onClick={onAddClick} className="gap-2">
				<PlusIcon className="size-4" />
				{t`Add a reference`}
			</Button>
		</motion.div>
	);
}

interface ReferenceCardProps {
	reference: Reference;
	index: number;
	onEdit: (reference: Reference) => void;
	onEmail: (reference: Reference) => void;
	onUpdateStatus: (id: string, status: RequestStatus) => void;
	onDelete: (id: string) => void;
	// biome-ignore lint/suspicious/noExplicitAny: ORPC mutation types are complex and context-dependent
	updateMutation: UseMutationResult<any, any, any, any>;
	// biome-ignore lint/suspicious/noExplicitAny: ORPC mutation types are complex and context-dependent
	deleteMutation: UseMutationResult<any, any, any, any>;
}

function ReferenceCard({
	reference,
	index,
	onEdit,
	onEmail,
	onUpdateStatus,
	onDelete,
	updateMutation,
	deleteMutation,
}: ReferenceCardProps) {
	const RelationIcon = relationshipConfig[reference.relationshipType].icon;
	const StatusIcon = statusConfig[reference.requestStatus].icon;
	const days = daysSinceContact(reference.lastContactDate);
	const reminder = getReminderIndicator(days);

	return (
		<motion.div
			key={reference.id}
			layout
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.2, delay: index * 0.05 }}
		>
			<Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
				{reminder.urgent && (
					<div className="absolute top-0 right-0 rounded-bl-lg bg-red-500 px-2 py-1">
						<BellIcon className="size-3 text-white" />
					</div>
				)}
				<CardContent className="p-5">
					<div className="mb-4 flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div className="flex size-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-lg text-primary">
								{reference.name
									.split(" ")
									.map((n) => n[0])
									.join("")
									.toUpperCase()}
							</div>
							<div>
								<h3 className="font-semibold">{reference.name}</h3>
								<p className="text-muted-foreground text-sm">{reference.title}</p>
							</div>
						</div>
					</div>

					<div className="mb-3 flex items-center gap-2 text-sm">
						<BriefcaseIcon className="size-4 text-muted-foreground" />
						<span>{reference.company}</span>
					</div>

					<div className="mb-3 space-y-1">
						<div className="flex items-center gap-2 text-sm">
							<EnvelopeIcon className="size-4 text-muted-foreground" />
							<a href={`mailto:${reference.email}`} className="truncate text-primary hover:underline">
								{reference.email}
							</a>
						</div>
						{reference.phone && (
							<div className="flex items-center gap-2 text-sm">
								<PhoneIcon className="size-4 text-muted-foreground" />
								<a href={`tel:${reference.phone}`} className="hover:underline">
									{reference.phone}
								</a>
							</div>
						)}
					</div>

					<div className="mb-3 flex flex-wrap gap-2">
						<Badge className={cn("gap-1", relationshipConfig[reference.relationshipType].color)}>
							<RelationIcon className="size-3" />
							{relationshipConfig[reference.relationshipType].label}
						</Badge>
						<Badge
							className={cn(
								"gap-1",
								statusConfig[reference.requestStatus].bgColor,
								statusConfig[reference.requestStatus].color,
							)}
						>
							<StatusIcon className="size-3" />
							{statusConfig[reference.requestStatus].label}
						</Badge>
					</div>

					<div className="mb-3 flex items-center gap-2 text-sm">
						<CalendarIcon className="size-4 text-muted-foreground" />
						<span>
							{t`Last contact:`} {new Date(reference.lastContactDate).toLocaleDateString()}
						</span>
						<span className={cn("text-xs", reminder.color)}>
							({days} {t`days`})
						</span>
					</div>

					{reference.notes && (
						<div className="mb-4 flex items-start gap-2 rounded-lg bg-muted/50 p-2 text-sm">
							<NoteIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
							<p className="line-clamp-2 text-muted-foreground">{reference.notes}</p>
						</div>
					)}

					<div className="flex flex-wrap gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={() => onEdit(reference)}
							className="gap-1"
							disabled={updateMutation.isPending}
						>
							<PencilSimpleIcon className="size-3" />
							{t`Edit`}
						</Button>
						<Button size="sm" variant="outline" onClick={() => onEmail(reference)} className="gap-1">
							<EnvelopeIcon className="size-3" />
							{t`Email`}
						</Button>
						{reference.requestStatus === "not_asked" && (
							<Button
								size="sm"
								variant="secondary"
								onClick={() => onUpdateStatus(reference.id, "pending")}
								className="gap-1"
								disabled={updateMutation.isPending}
							>
								{updateMutation.isPending && updateMutation.variables?.id === reference.id ? (
									<SpinnerIcon className="size-3 animate-spin" />
								) : (
									<ClockIcon className="size-3" />
								)}
								{t`Request`}
							</Button>
						)}
						{reference.requestStatus === "pending" && (
							<Button
								size="sm"
								variant="secondary"
								onClick={() => onUpdateStatus(reference.id, "confirmed")}
								className="gap-1 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
								disabled={updateMutation.isPending}
							>
								{updateMutation.isPending && updateMutation.variables?.id === reference.id ? (
									<SpinnerIcon className="size-3 animate-spin" />
								) : (
									<CheckCircleIcon className="size-3" />
								)}
								{t`Confirm`}
							</Button>
						)}
						<Button
							size="sm"
							variant="ghost"
							onClick={() => onDelete(reference.id)}
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending && deleteMutation.variables?.id === reference.id ? (
								<SpinnerIcon className="size-3 animate-spin" />
							) : (
								<TrashIcon className="size-3" />
							)}
						</Button>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

interface ReferenceListProps {
	isLoading: boolean;
	isError: boolean;
	filteredReferences: Reference[];
	onEdit: (reference: Reference) => void;
	onEmail: (reference: Reference) => void;
	onUpdateStatus: (id: string, status: RequestStatus) => void;
	onDelete: (id: string) => void;
	// biome-ignore lint/suspicious/noExplicitAny: ORPC mutation types are complex and context-dependent
	updateMutation: UseMutationResult<any, any, any, any>;
	// biome-ignore lint/suspicious/noExplicitAny: ORPC mutation types are complex and context-dependent
	deleteMutation: UseMutationResult<any, any, any, any>;
}

export function ReferenceList({
	isLoading,
	isError,
	filteredReferences,
	onEdit,
	onEmail,
	onUpdateStatus,
	onDelete,
	updateMutation,
	deleteMutation,
}: ReferenceListProps) {
	return (
		<AnimatePresence mode="popLayout">
			{isLoading ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
				>
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardContent className="p-5">
								<div className="mb-4 flex items-center gap-3">
									<Skeleton className="size-12 rounded-full" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-24" />
									</div>
								</div>
								<Skeleton className="mb-3 h-4 w-40" />
								<Skeleton className="mb-3 h-4 w-48" />
								<div className="mb-3 flex gap-2">
									<Skeleton className="h-6 w-20" />
									<Skeleton className="h-6 w-24" />
								</div>
								<Skeleton className="mb-4 h-16 w-full" />
								<div className="flex gap-2">
									<Skeleton className="h-8 w-20" />
									<Skeleton className="h-8 w-16" />
								</div>
							</CardContent>
						</Card>
					))}
				</motion.div>
			) : isError ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="flex flex-col items-center justify-center py-12 text-center"
				>
					<UsersIcon className="mb-4 size-12 text-destructive" />
					<h3 className="font-medium text-lg">{t`Loading error`}</h3>
					<p className="text-muted-foreground text-sm">{t`Unable to load your references. Please try again.`}</p>
				</motion.div>
			) : filteredReferences.length === 0 ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="flex flex-col items-center justify-center py-12 text-center"
				>
					<UsersIcon className="mb-4 size-12 text-muted-foreground" />
					<h3 className="font-medium text-lg">{t`No references found`}</h3>
					<p className="text-muted-foreground text-sm">{t`Add your first professional reference`}</p>
				</motion.div>
			) : (
				<motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredReferences.map((reference, index) => (
						<ReferenceCard
							key={reference.id}
							reference={reference}
							index={index}
							onEdit={onEdit}
							onEmail={onEmail}
							onUpdateStatus={onUpdateStatus}
							onDelete={onDelete}
							updateMutation={updateMutation}
							deleteMutation={deleteMutation}
						/>
					))}
				</motion.div>
			)}
		</AnimatePresence>
	);
}

interface ReferenceFormModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	editingReference: Reference | null;
	formData: Omit<Reference, "id">;
	setFormData: (data: Omit<Reference, "id">) => void;
	onSave: () => void;
	createIsPending: boolean;
	updateIsPending: boolean;
}

export function ReferenceFormModal({
	isOpen,
	onOpenChange,
	editingReference,
	formData,
	setFormData,
	onSave,
	createIsPending,
	updateIsPending,
}: ReferenceFormModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>{editingReference ? t`Edit reference` : t`Add a reference`}</DialogTitle>
					<DialogDescription>{t`Fill in your professional reference details`}</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[60vh]">
					<div className="space-y-4 p-1">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">{t`Full name`} *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									placeholder={t`E.g. Jane Doe`}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="title">{t`Title/Position`}</Label>
								<Input
									id="title"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									placeholder={t`E.g. HR Director`}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="company">{t`Company/Organization`}</Label>
							<Input
								id="company"
								value={formData.company}
								onChange={(e) => setFormData({ ...formData, company: e.target.value })}
								placeholder={t`Ex: Tech Solutions`}
							/>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="email">{t`Email`} *</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									placeholder={t`Ex: contact@email.com`}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="phone">{t`Phone`}</Label>
								<Input
									id="phone"
									value={formData.phone}
									onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
									placeholder={t`E.g. +1 555 123 4567`}
								/>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label>{t`Relationship type`}</Label>
								<Select
									value={formData.relationshipType}
									onValueChange={(value) => setFormData({ ...formData, relationshipType: value as RelationshipType })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="supervisor">{t`Supervisor`}</SelectItem>
										<SelectItem value="colleague">{t`Colleague`}</SelectItem>
										<SelectItem value="mentor">{t`Mentor`}</SelectItem>
										<SelectItem value="professor">{t`Professor`}</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>{t`Request status`}</Label>
								<Select
									value={formData.requestStatus}
									onValueChange={(value) => setFormData({ ...formData, requestStatus: value as RequestStatus })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="not_asked">{t`Not asked`}</SelectItem>
										<SelectItem value="pending">{t`Pending`}</SelectItem>
										<SelectItem value="confirmed">{t`Confirmed`}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="lastContactDate">{t`Last contact date`}</Label>
							<Input
								id="lastContactDate"
								type="date"
								value={formData.lastContactDate}
								onChange={(e) => setFormData({ ...formData, lastContactDate: e.target.value })}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="notes">{t`Notes`}</Label>
							<Textarea
								id="notes"
								value={formData.notes}
								onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
								placeholder={t`Additional information about this reference...`}
								rows={3}
							/>
						</div>
					</div>
				</ScrollArea>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={createIsPending || updateIsPending}>
							{t`Cancel`}
						</Button>
					</DialogClose>
					<Button onClick={onSave} disabled={createIsPending || updateIsPending} className="gap-2">
						{(createIsPending || updateIsPending) && <SpinnerIcon className="size-4 animate-spin" />}
						{editingReference ? t`Save` : t`Add`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

interface EmailTemplateModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedReference: Reference | null;
	selectedTemplate: string;
	setSelectedTemplate: (value: string) => void;
	onCopyTemplate: () => void;
}

export function EmailTemplateModal({
	isOpen,
	onOpenChange,
	selectedReference,
	selectedTemplate,
	setSelectedTemplate,
	onCopyTemplate,
}: EmailTemplateModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{t`Email template generator`}</DialogTitle>
					<DialogDescription>
						{selectedReference && (
							<span>
								{t`Create an email to contact`} {selectedReference.name}
							</span>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label>{t`Choose a template`}</Label>
						<Select value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="formal">{t`Formal request`}</SelectItem>
								<SelectItem value="casual">{t`Informal request`}</SelectItem>
								<SelectItem value="academic">{t`Academic request`}</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>{t`Subject`}</Label>
						<Input value={emailTemplates[selectedTemplate].subject} readOnly className="bg-muted" />
					</div>

					<div className="space-y-2">
						<Label>{t`Email body`}</Label>
						<Textarea
							value={
								selectedReference
									? emailTemplates[selectedTemplate].body
											.replace("[NOM]", selectedReference.name.split(" ")[0])
											.replace("[ENTREPRISE]", selectedReference.company)
									: emailTemplates[selectedTemplate].body
							}
							readOnly
							className="min-h-[200px] bg-muted font-mono text-sm"
						/>
					</div>

					<p className="text-muted-foreground text-xs">
						{t`Customize the bracketed elements before sending the email.`}
					</p>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{t`Close`}</Button>
					</DialogClose>
					<Button onClick={onCopyTemplate} className="gap-2">
						<CopyIcon className="size-4" />
						{t`Copy template`}
					</Button>
					{selectedReference && (
						<Button
							variant="secondary"
							onClick={() => {
								window.location.href = `mailto:${selectedReference.email}?subject=${encodeURIComponent(emailTemplates[selectedTemplate].subject)}`;
							}}
							className="gap-2"
						>
							<EnvelopeIcon className="size-4" />
							{t`Open in email`}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
