import { t } from "@lingui/core/macro";
import {
	ArrowClockwiseIcon,
	BellIcon,
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
	CopyIcon,
	EnvelopeIcon,
	FileTextIcon,
	FunnelIcon,
	MagnifyingGlassIcon,
	PaperPlaneTiltIcon,
	PencilSimpleIcon,
	PhoneIcon,
	PlusIcon,
	QuestionIcon,
	TrashIcon,
	UsersIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";
import {
	EMAIL_TEMPLATES,
	RECOMMENDATION_TIPS,
	recommenderTypeConfig,
	reminderConfig,
	SAMPLE_LETTERS,
	statusConfig,
} from "./recommendation-request-config";
import type {
	EmailTemplate,
	RecommendationRequest,
	Recommender,
	RecommenderFormData,
	RecommenderType,
	ReminderFrequency,
	RequestFormData,
	RequestStatus,
	SampleLetter,
} from "./recommendation-request-types";
import { getDaysUntilDeadline, getDeadlineIndicator } from "./recommendation-request-utils";

// ---------- Prop types ----------

interface StatisticsCardsProps {
	stats: { total: number; pending: number; received: number; sent: number; urgent: number; recommenders: number };
	isLoading: boolean;
}

interface FilterBarProps {
	activeTab: string;
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	filterStatus: RequestStatus | "all";
	setFilterStatus: (value: RequestStatus | "all") => void;
	filterType: RecommenderType | "all";
	setFilterType: (value: RecommenderType | "all") => void;
}

interface RequestsTabProps {
	isLoading: boolean;
	filteredRequests: RecommendationRequest[];
	recommenders: Recommender[];
	openRequestModal: (request?: RecommendationRequest) => void;
	openEmailModal: (recommender: Recommender, template: EmailTemplate) => void;
	updateRequestStatus: (id: string, status: RequestStatus) => void;
	deleteRequest: (id: string) => void;
}

interface RecommendersTabProps {
	isLoading: boolean;
	filteredRecommenders: Recommender[];
	requests: RecommendationRequest[];
	openRecommenderModal: (recommender?: Recommender) => void;
	openEmailModal: (recommender: Recommender, template: EmailTemplate) => void;
	deleteRecommender: (id: string) => void;
}

interface RecommenderModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	editingRecommender: Recommender | null;
	recommenderForm: RecommenderFormData;
	setRecommenderForm: (form: RecommenderFormData) => void;
	saveRecommender: () => void;
	isSaving: boolean;
}

interface RequestModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	editingRequest: RecommendationRequest | null;
	requestForm: RequestFormData;
	setRequestForm: (form: RequestFormData) => void;
	saveRequest: () => void;
	isSaving: boolean;
	recommenders: Recommender[];
	newTalkingPoint: string;
	setNewTalkingPoint: (value: string) => void;
	addTalkingPoint: () => void;
	removeTalkingPoint: (index: number) => void;
}

interface EmailTemplateModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedTemplate: EmailTemplate | null;
	setSelectedTemplate: (template: EmailTemplate | null) => void;
	selectedRecommenderForEmail: Recommender | null;
	copyEmailTemplate: () => void;
}

interface SampleLetterModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedSample: SampleLetter | null;
}

// ---------- Statistics Cards ----------

export function StatisticsCards({ stats, isLoading }: StatisticsCardsProps) {
	const cards = [
		{
			label: t`Total requests`,
			value: stats.total,
			borderColor: "border-l-blue-500",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
			Icon: FileTextIcon,
			iconColor: "text-blue-600 dark:text-blue-400",
		},
		{
			label: t`Pending`,
			value: stats.pending,
			borderColor: "border-l-amber-500",
			bgColor: "bg-amber-100 dark:bg-amber-900/30",
			Icon: ClockIcon,
			iconColor: "text-amber-600 dark:text-amber-400",
		},
		{
			label: t`Received`,
			value: stats.received,
			borderColor: "border-l-green-500",
			bgColor: "bg-green-100 dark:bg-green-900/30",
			Icon: CheckCircleIcon,
			iconColor: "text-green-600 dark:text-green-400",
		},
		{
			label: t`Sent`,
			value: stats.sent,
			borderColor: "border-l-purple-500",
			bgColor: "bg-purple-100 dark:bg-purple-900/30",
			Icon: PaperPlaneTiltIcon,
			iconColor: "text-purple-600 dark:text-purple-400",
		},
		{
			label: t`Urgent`,
			value: stats.urgent,
			borderColor: "border-l-red-500",
			bgColor: "bg-red-100 dark:bg-red-900/30",
			Icon: WarningIcon,
			iconColor: "text-red-600 dark:text-red-400",
		},
	];

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
		>
			{cards.map((card) => (
				<Card key={card.label} className={cn("border-l-4", card.borderColor)}>
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className={cn("rounded-lg p-2", card.bgColor)}>
								<card.Icon className={cn("size-5", card.iconColor)} />
							</div>
							<div>
								<p className="text-muted-foreground text-sm">{card.label}</p>
								{isLoading ? <Skeleton className="h-8 w-12" /> : <p className="font-bold text-2xl">{card.value}</p>}
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</motion.div>
	);
}

// ---------- Filter Bar ----------

export function FilterBar({
	activeTab,
	searchQuery,
	setSearchQuery,
	filterStatus,
	setFilterStatus,
	filterType,
	setFilterType,
}: FilterBarProps) {
	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 0.15 }}
			className="flex flex-col gap-3 sm:flex-row"
		>
			<div className="relative flex-1 sm:max-w-xs">
				<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder={t`Search...`}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-9"
				/>
			</div>

			{activeTab === "requests" && (
				<Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as RequestStatus | "all")}>
					<SelectTrigger className="w-full sm:w-[160px]">
						<FunnelIcon className="mr-2 size-4" />
						<SelectValue placeholder={t`Status`} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t`All statuses`}</SelectItem>
						<SelectItem value="pending">{t`Pending`}</SelectItem>
						<SelectItem value="received">{t`Received`}</SelectItem>
						<SelectItem value="sent">{t`Sent`}</SelectItem>
					</SelectContent>
				</Select>
			)}

			<Select value={filterType} onValueChange={(value) => setFilterType(value as RecommenderType | "all")}>
				<SelectTrigger className="w-full sm:w-[160px]">
					<FunnelIcon className="mr-2 size-4" />
					<SelectValue placeholder={t`Type`} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">{t`All types`}</SelectItem>
					<SelectItem value="supervisor">{t`Supervisor`}</SelectItem>
					<SelectItem value="colleague">{t`Colleague`}</SelectItem>
					<SelectItem value="professor">{t`Professor`}</SelectItem>
					<SelectItem value="mentor">{t`Mentor`}</SelectItem>
					<SelectItem value="client">{t`Client`}</SelectItem>
				</SelectContent>
			</Select>
		</motion.div>
	);
}

// ---------- Requests Tab ----------

export function RequestsTab({
	isLoading,
	filteredRequests,
	recommenders,
	openRequestModal,
	openEmailModal,
	updateRequestStatus,
	deleteRequest,
}: RequestsTabProps) {
	return (
		<AnimatePresence mode="popLayout">
			{isLoading ? (
				<motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardContent className="p-5">
								<Skeleton className="mb-4 h-12 w-full" />
								<Skeleton className="mb-3 h-4 w-3/4" />
								<Skeleton className="mb-3 h-6 w-1/2" />
								<Skeleton className="h-8 w-full" />
							</CardContent>
						</Card>
					))}
				</motion.div>
			) : filteredRequests.length === 0 ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="flex flex-col items-center justify-center py-12 text-center"
				>
					<FileTextIcon className="mb-4 size-12 text-muted-foreground" />
					<h3 className="font-medium text-lg">{t`No requests found`}</h3>
					<p className="text-muted-foreground text-sm">{t`Create your first recommendation request`}</p>
				</motion.div>
			) : (
				<motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredRequests.map((request, index) => {
						const recommender = recommenders.find((r) => r.id === request.recommenderId);
						if (!recommender) return null;

						return (
							<RequestCard
								key={request.id}
								request={request}
								recommender={recommender}
								index={index}
								openRequestModal={openRequestModal}
								openEmailModal={openEmailModal}
								updateRequestStatus={updateRequestStatus}
								deleteRequest={deleteRequest}
							/>
						);
					})}
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// ---------- Request Card ----------

function RequestCard({
	request,
	recommender,
	index,
	openRequestModal,
	openEmailModal,
	updateRequestStatus,
	deleteRequest,
}: {
	request: RecommendationRequest;
	recommender: Recommender;
	index: number;
	openRequestModal: (request: RecommendationRequest) => void;
	openEmailModal: (recommender: Recommender, template: EmailTemplate) => void;
	updateRequestStatus: (id: string, status: RequestStatus) => void;
	deleteRequest: (id: string) => void;
}) {
	const TypeIcon = recommenderTypeConfig[recommender.relationship].icon;
	const StatusIcon = statusConfig[request.status].icon;
	const daysLeft = getDaysUntilDeadline(request.deadline);
	const deadlineInfo = getDeadlineIndicator(daysLeft);

	return (
		<motion.div
			layout
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.2, delay: index * 0.05 }}
		>
			<Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
				{deadlineInfo.urgent && request.status === "pending" && (
					<div className="absolute top-0 right-0 rounded-bl-lg bg-red-500 px-2 py-1">
						<BellIcon className="size-3 text-white" />
					</div>
				)}
				<CardContent className="p-5">
					{/* Header */}
					<div className="mb-4 flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div className="flex size-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-lg text-primary">
								{recommender.name
									.split(" ")
									.map((n) => n[0])
									.join("")
									.toUpperCase()
									.slice(0, 2)}
							</div>
							<div>
								<h3 className="font-semibold">{recommender.name}</h3>
								<p className="text-muted-foreground text-sm">{recommender.title}</p>
							</div>
						</div>
					</div>

					{/* Purpose */}
					<div className="mb-3">
						<p className="font-medium text-sm">{request.purpose}</p>
					</div>

					{/* Badges */}
					<div className="mb-3 flex flex-wrap gap-2">
						<Badge className={cn("gap-1", recommenderTypeConfig[recommender.relationship].color)}>
							<TypeIcon className="size-3" />
							{recommenderTypeConfig[recommender.relationship].label}
						</Badge>
						<Badge className={cn("gap-1", statusConfig[request.status].bgColor, statusConfig[request.status].color)}>
							<StatusIcon className="size-3" />
							{statusConfig[request.status].label}
						</Badge>
					</div>

					{/* Deadline */}
					<div className="mb-3 flex items-center gap-2 text-sm">
						<CalendarIcon className="size-4 text-muted-foreground" />
						<span>
							{t`Deadline:`} {new Date(request.deadline).toLocaleDateString()}
						</span>
						<span className={cn("font-medium text-xs", deadlineInfo.color)}>({deadlineInfo.text})</span>
					</div>

					{/* Reminder */}
					{request.followUpReminder !== "none" && request.status === "pending" && (
						<div className="mb-3 flex items-center gap-2 text-sm">
							<BellIcon className="size-4 text-muted-foreground" />
							<span className="text-muted-foreground">
								{t`Reminder:`} {reminderConfig[request.followUpReminder].label}
							</span>
						</div>
					)}

					{/* Talking Points Preview */}
					{request.talkingPoints.length > 0 && (
						<div className="mb-4">
							<p className="mb-1 font-medium text-muted-foreground text-xs">{t`Key points:`}</p>
							<div className="flex flex-wrap gap-1">
								{request.talkingPoints.slice(0, 2).map((point, i) => (
									<Badge key={i} variant="outline" className="text-xs">
										{point.length > 30 ? `${point.slice(0, 30)}...` : point}
									</Badge>
								))}
								{request.talkingPoints.length > 2 && (
									<Badge variant="outline" className="text-xs">
										+{request.talkingPoints.length - 2}
									</Badge>
								)}
							</div>
						</div>
					)}

					{/* Actions */}
					<div className="flex flex-wrap gap-2">
						<Button size="sm" variant="outline" onClick={() => openRequestModal(request)} className="gap-1">
							<PencilSimpleIcon className="size-3" />
							{t`Edit`}
						</Button>
						{request.status === "pending" && (
							<>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											size="sm"
											variant="outline"
											onClick={() => {
												const tpl = EMAIL_TEMPLATES.find((tp) => tp.type === "follow_up");
												if (tpl) openEmailModal(recommender, tpl);
											}}
											className="gap-1"
										>
											<ArrowClockwiseIcon className="size-3" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>{t`Send follow-up`}</TooltipContent>
								</Tooltip>
								<Button
									size="sm"
									variant="secondary"
									onClick={() => updateRequestStatus(request.id, "received")}
									className="gap-1 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
								>
									<CheckCircleIcon className="size-3" />
									{t`Received`}
								</Button>
							</>
						)}
						{request.status === "received" && (
							<Button
								size="sm"
								variant="secondary"
								onClick={() => updateRequestStatus(request.id, "sent")}
								className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
							>
								<PaperPlaneTiltIcon className="size-3" />
								{t`Sent`}
							</Button>
						)}
						<Button
							size="sm"
							variant="ghost"
							onClick={() => deleteRequest(request.id)}
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
						>
							<TrashIcon className="size-3" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// ---------- Recommenders Tab ----------

export function RecommendersTab({
	isLoading,
	filteredRecommenders,
	requests,
	openRecommenderModal,
	openEmailModal,
	deleteRecommender,
}: RecommendersTabProps) {
	return (
		<AnimatePresence mode="popLayout">
			{isLoading ? (
				<motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardContent className="p-5">
								<Skeleton className="mb-4 h-12 w-full" />
								<Skeleton className="mb-3 h-4 w-3/4" />
								<Skeleton className="mb-3 h-6 w-1/2" />
								<Skeleton className="h-8 w-full" />
							</CardContent>
						</Card>
					))}
				</motion.div>
			) : filteredRecommenders.length === 0 ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="flex flex-col items-center justify-center py-12 text-center"
				>
					<UsersIcon className="mb-4 size-12 text-muted-foreground" />
					<h3 className="font-medium text-lg">{t`No recommenders found`}</h3>
					<p className="text-muted-foreground text-sm">{t`Add contacts who can recommend you`}</p>
				</motion.div>
			) : (
				<motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredRecommenders.map((recommender, index) => (
						<RecommenderCard
							key={recommender.id}
							recommender={recommender}
							index={index}
							requestCount={requests.filter((r) => r.recommenderId === recommender.id).length}
							openRecommenderModal={openRecommenderModal}
							openEmailModal={openEmailModal}
							deleteRecommender={deleteRecommender}
						/>
					))}
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// ---------- Recommender Card ----------

function RecommenderCard({
	recommender,
	index,
	requestCount,
	openRecommenderModal,
	openEmailModal,
	deleteRecommender,
}: {
	recommender: Recommender;
	index: number;
	requestCount: number;
	openRecommenderModal: (recommender: Recommender) => void;
	openEmailModal: (recommender: Recommender, template: EmailTemplate) => void;
	deleteRecommender: (id: string) => void;
}) {
	const TypeIcon = recommenderTypeConfig[recommender.relationship].icon;

	return (
		<motion.div
			layout
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.2, delay: index * 0.05 }}
		>
			<Card className="transition-shadow hover:shadow-lg">
				<CardContent className="p-5">
					{/* Header */}
					<div className="mb-4 flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div className="flex size-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-lg text-primary">
								{recommender.name
									.split(" ")
									.map((n) => n[0])
									.join("")
									.toUpperCase()
									.slice(0, 2)}
							</div>
							<div>
								<h3 className="font-semibold">{recommender.name}</h3>
								<p className="text-muted-foreground text-sm">{recommender.title}</p>
							</div>
						</div>
					</div>

					{/* Company */}
					<div className="mb-3 text-muted-foreground text-sm">{recommender.company}</div>

					{/* Contact Info */}
					<div className="mb-3 space-y-1">
						<div className="flex items-center gap-2 text-sm">
							<EnvelopeIcon className="size-4 text-muted-foreground" />
							<a href={`mailto:${recommender.email}`} className="truncate text-primary hover:underline">
								{recommender.email}
							</a>
						</div>
						{recommender.phone && (
							<div className="flex items-center gap-2 text-sm">
								<PhoneIcon className="size-4 text-muted-foreground" />
								<a href={`tel:${recommender.phone}`} className="hover:underline">
									{recommender.phone}
								</a>
							</div>
						)}
					</div>

					{/* Badges */}
					<div className="mb-3 flex flex-wrap gap-2">
						<Badge className={cn("gap-1", recommenderTypeConfig[recommender.relationship].color)}>
							<TypeIcon className="size-3" />
							{recommenderTypeConfig[recommender.relationship].label}
						</Badge>
						<Badge variant="outline">
							{recommender.yearsKnown} {t`years`}
						</Badge>
						{requestCount > 0 && (
							<Badge variant="secondary">
								{requestCount} {t`request(s)`}
							</Badge>
						)}
					</div>

					{/* Notes */}
					{recommender.notes && (
						<div className="mb-4 rounded-lg bg-muted/50 p-2 text-muted-foreground text-sm">
							<p className="line-clamp-2">{recommender.notes}</p>
						</div>
					)}

					{/* Actions */}
					<div className="flex flex-wrap gap-2">
						<Button size="sm" variant="outline" onClick={() => openRecommenderModal(recommender)} className="gap-1">
							<PencilSimpleIcon className="size-3" />
							{t`Edit`}
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={() => {
								const tpl = EMAIL_TEMPLATES.find((tp) => tp.type === "initial");
								if (tpl) openEmailModal(recommender, tpl);
							}}
							className="gap-1"
						>
							<EnvelopeIcon className="size-3" />
							{t`Email`}
						</Button>
						<Button
							size="sm"
							variant="ghost"
							onClick={() => deleteRecommender(recommender.id)}
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
						>
							<TrashIcon className="size-3" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// ---------- Email Templates Tab ----------

export function EmailTemplatesTab() {
	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="grid gap-4 md:grid-cols-2"
		>
			{EMAIL_TEMPLATES.map((template) => (
				<Card key={template.id} className="transition-shadow hover:shadow-lg">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">{template.name}</CardTitle>
							<Badge
								variant="outline"
								className={cn(
									template.type === "initial" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
									template.type === "follow_up" &&
										"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
									template.type === "thank_you" &&
										"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
								)}
							>
								{template.type === "initial" && t`Initial`}
								{template.type === "follow_up" && t`Follow-up`}
								{template.type === "thank_you" && t`Thank you`}
							</Badge>
						</div>
					</CardHeader>
					<CardContent>
						<div className="mb-3">
							<Label className="text-muted-foreground text-xs">{t`Subject`}</Label>
							<p className="font-medium text-sm">{template.subject}</p>
						</div>
						<div className="mb-4">
							<Label className="text-muted-foreground text-xs">{t`Preview`}</Label>
							<p className="line-clamp-4 text-muted-foreground text-sm">{template.body.slice(0, 200)}...</p>
						</div>
						<Button
							variant="outline"
							className="w-full gap-2"
							onClick={() => {
								navigator.clipboard.writeText(template.body);
								toast.success(t`Template copied`);
							}}
						>
							<CopyIcon className="size-4" />
							{t`Copy template`}
						</Button>
					</CardContent>
				</Card>
			))}
		</motion.div>
	);
}

// ---------- Sample Letters Tab ----------

export function SampleLettersTab({ openSampleModal }: { openSampleModal: (sample: SampleLetter) => void }) {
	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
		>
			{SAMPLE_LETTERS.map((sample) => {
				const TypeIcon = recommenderTypeConfig[sample.type].icon;
				return (
					<Card key={sample.id} className="transition-shadow hover:shadow-lg">
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg">{sample.title}</CardTitle>
								<Badge className={cn("gap-1", recommenderTypeConfig[sample.type].color)}>
									<TypeIcon className="size-3" />
									{recommenderTypeConfig[sample.type].label}
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							<div className="mb-4">
								<Label className="mb-2 block text-muted-foreground text-xs">{t`Highlighted strengths`}</Label>
								<div className="flex flex-wrap gap-1">
									{sample.highlights.map((highlight, i) => (
										<Badge key={i} variant="outline" className="text-xs">
											{highlight}
										</Badge>
									))}
								</div>
							</div>
							<p className="mb-4 line-clamp-3 text-muted-foreground text-sm">{sample.content.slice(0, 150)}...</p>
							<Button variant="outline" className="w-full gap-2" onClick={() => openSampleModal(sample)}>
								<FileTextIcon className="size-4" />
								{t`View full example`}
							</Button>
						</CardContent>
					</Card>
				);
			})}
		</motion.div>
	);
}

// ---------- Tips Tab ----------

export function TipsTab() {
	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
		>
			{RECOMMENDATION_TIPS.map((tip, index) => {
				const TipIcon = tip.icon;
				return (
					<motion.div
						key={tip.id}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.2, delay: index * 0.05 }}
					>
						<Card className="h-full transition-shadow hover:shadow-lg">
							<CardContent className="p-5">
								<div className="mb-3 flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-2">
										<TipIcon className="size-5 text-primary" />
									</div>
									<h3 className="font-semibold">{tip.title}</h3>
								</div>
								<p className="text-muted-foreground text-sm">{tip.description}</p>
							</CardContent>
						</Card>
					</motion.div>
				);
			})}
		</motion.div>
	);
}

// ---------- Recommender Modal ----------

export function RecommenderModal({
	isOpen,
	onOpenChange,
	editingRecommender,
	recommenderForm,
	setRecommenderForm,
	saveRecommender,
	isSaving,
}: RecommenderModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>{editingRecommender ? t`Edit recommender` : t`Add a recommender`}</DialogTitle>
					<DialogDescription>{t`Fill in your recommender's details`}</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[60vh]">
					<div className="space-y-4 p-1">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="rec-name">{t`Full name`} *</Label>
								<Input
									id="rec-name"
									value={recommenderForm.name}
									onChange={(e) => setRecommenderForm({ ...recommenderForm, name: e.target.value })}
									placeholder={t`E.g. Dr. Jane Doe`}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="rec-email">{t`Email`} *</Label>
								<Input
									id="rec-email"
									type="email"
									value={recommenderForm.email}
									onChange={(e) => setRecommenderForm({ ...recommenderForm, email: e.target.value })}
									placeholder={t`Ex: contact@email.com`}
								/>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="rec-phone">{t`Phone`}</Label>
								<Input
									id="rec-phone"
									value={recommenderForm.phone}
									onChange={(e) => setRecommenderForm({ ...recommenderForm, phone: e.target.value })}
									placeholder={t`E.g. +1 555 123 4567`}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t`Relationship type`}</Label>
								<Select
									value={recommenderForm.relationship}
									onValueChange={(value) =>
										setRecommenderForm({ ...recommenderForm, relationship: value as RecommenderType })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="supervisor">{t`Supervisor`}</SelectItem>
										<SelectItem value="colleague">{t`Colleague`}</SelectItem>
										<SelectItem value="professor">{t`Professor`}</SelectItem>
										<SelectItem value="mentor">{t`Mentor`}</SelectItem>
										<SelectItem value="client">{t`Client`}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="rec-title">{t`Title/Position`}</Label>
								<Input
									id="rec-title"
									value={recommenderForm.title}
									onChange={(e) => setRecommenderForm({ ...recommenderForm, title: e.target.value })}
									placeholder={t`E.g. Technical Director`}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="rec-company">{t`Company`}</Label>
								<Input
									id="rec-company"
									value={recommenderForm.company}
									onChange={(e) => setRecommenderForm({ ...recommenderForm, company: e.target.value })}
									placeholder={t`Ex: TechCorp`}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="rec-years">{t`Years known`}</Label>
							<Input
								id="rec-years"
								type="number"
								min={1}
								value={recommenderForm.yearsKnown}
								onChange={(e) =>
									setRecommenderForm({ ...recommenderForm, yearsKnown: Number.parseInt(e.target.value, 10) || 1 })
								}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="rec-notes">{t`Notes`}</Label>
							<Textarea
								id="rec-notes"
								value={recommenderForm.notes}
								onChange={(e) => setRecommenderForm({ ...recommenderForm, notes: e.target.value })}
								placeholder={t`Additional information about this contact...`}
								rows={3}
							/>
						</div>
					</div>
				</ScrollArea>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{t`Cancel`}</Button>
					</DialogClose>
					<Button onClick={saveRecommender} disabled={isSaving}>
						{editingRecommender ? t`Save` : t`Add`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ---------- Request Modal ----------

export function RequestModal({
	isOpen,
	onOpenChange,
	editingRequest,
	requestForm,
	setRequestForm,
	saveRequest,
	isSaving,
	recommenders,
	newTalkingPoint,
	setNewTalkingPoint,
	addTalkingPoint,
	removeTalkingPoint,
}: RequestModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>{editingRequest ? t`Edit request` : t`New request`}</DialogTitle>
					<DialogDescription>{t`Configure your recommendation letter request`}</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[60vh]">
					<div className="space-y-4 p-1">
						<div className="space-y-2">
							<Label>{t`Recommender`} *</Label>
							<Select
								value={requestForm.recommenderId}
								onValueChange={(value) => setRequestForm({ ...requestForm, recommenderId: value })}
							>
								<SelectTrigger>
									<SelectValue placeholder={t`Select a recommender`} />
								</SelectTrigger>
								<SelectContent>
									{recommenders.map((rec) => (
										<SelectItem key={rec.id} value={rec.id}>
											{rec.name} - {rec.company}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="req-purpose">{t`Request purpose`} *</Label>
							<Input
								id="req-purpose"
								value={requestForm.purpose}
								onChange={(e) => setRequestForm({ ...requestForm, purpose: e.target.value })}
								placeholder={t`E.g. Data Science Master's application`}
							/>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="req-deadline">{t`Deadline`} *</Label>
								<Input
									id="req-deadline"
									type="date"
									value={requestForm.deadline}
									onChange={(e) => setRequestForm({ ...requestForm, deadline: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label>{t`Status`}</Label>
								<Select
									value={requestForm.status}
									onValueChange={(value) => setRequestForm({ ...requestForm, status: value as RequestStatus })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pending">{t`Pending`}</SelectItem>
										<SelectItem value="received">{t`Received`}</SelectItem>
										<SelectItem value="sent">{t`Sent`}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label>{t`Reminder frequency`}</Label>
							<Select
								value={requestForm.followUpReminder}
								onValueChange={(value) =>
									setRequestForm({ ...requestForm, followUpReminder: value as ReminderFrequency })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">{t`No reminder`}</SelectItem>
									<SelectItem value="daily">{t`Daily`}</SelectItem>
									<SelectItem value="weekly">{t`Weekly`}</SelectItem>
									<SelectItem value="biweekly">{t`Biweekly`}</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Talking Points */}
						<div className="space-y-2">
							<Label>{t`Key points to mention`}</Label>
							<div className="flex gap-2">
								<Input
									value={newTalkingPoint}
									onChange={(e) => setNewTalkingPoint(e.target.value)}
									placeholder={t`E.g. Project leadership`}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											addTalkingPoint();
										}
									}}
								/>
								<Button type="button" variant="outline" onClick={addTalkingPoint}>
									<PlusIcon className="size-4" />
								</Button>
							</div>
							{requestForm.talkingPoints.length > 0 && (
								<div className="mt-2 flex flex-wrap gap-2">
									{requestForm.talkingPoints.map((point, index) => (
										<Badge key={index} variant="secondary" className="gap-1">
											{point}
											<button
												type="button"
												onClick={() => removeTalkingPoint(index)}
												className="ml-1 hover:text-destructive"
											>
												<QuestionIcon className="size-3" />
											</button>
										</Badge>
									))}
								</div>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="req-notes">{t`Notes`}</Label>
							<Textarea
								id="req-notes"
								value={requestForm.notes}
								onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
								placeholder={t`Additional notes about this request...`}
								rows={3}
							/>
						</div>
					</div>
				</ScrollArea>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{t`Cancel`}</Button>
					</DialogClose>
					<Button onClick={saveRequest} disabled={isSaving}>
						{editingRequest ? t`Save` : t`Create`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ---------- Email Template Modal ----------

export function EmailTemplateModal({
	isOpen,
	onOpenChange,
	selectedTemplate,
	setSelectedTemplate,
	selectedRecommenderForEmail,
	copyEmailTemplate,
}: EmailTemplateModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{t`Email generator`}</DialogTitle>
					<DialogDescription>
						{selectedRecommenderForEmail && (
							<span>
								{t`Email for`} {selectedRecommenderForEmail.name}
							</span>
						)}
					</DialogDescription>
				</DialogHeader>

				{selectedTemplate && selectedRecommenderForEmail && (
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>{t`Template`}</Label>
							<Select
								value={selectedTemplate.id}
								onValueChange={(value) => {
									const template = EMAIL_TEMPLATES.find((tp) => tp.id === value);
									if (template) setSelectedTemplate(template);
								}}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{EMAIL_TEMPLATES.map((tpl) => (
										<SelectItem key={tpl.id} value={tpl.id}>
											{tpl.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>{t`Subject`}</Label>
							<Input value={selectedTemplate.subject} readOnly className="bg-muted" />
						</div>

						<div className="space-y-2">
							<Label>{t`Email body`}</Label>
							<Textarea
								value={selectedTemplate.body
									.replace("[NOM]", selectedRecommenderForEmail.name)
									.replace("[ENTREPRISE]", selectedRecommenderForEmail.company)}
								readOnly
								className="min-h-[250px] bg-muted font-mono text-sm"
							/>
						</div>

						<p className="text-muted-foreground text-xs">{t`Customize the bracketed elements before sending.`}</p>
					</div>
				)}

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{t`Close`}</Button>
					</DialogClose>
					<Button onClick={copyEmailTemplate} className="gap-2">
						<CopyIcon className="size-4" />
						{t`Copy`}
					</Button>
					{selectedRecommenderForEmail && (
						<Button
							variant="secondary"
							onClick={() => {
								window.location.href = `mailto:${selectedRecommenderForEmail.email}?subject=${encodeURIComponent(selectedTemplate?.subject || "")}`;
							}}
							className="gap-2"
						>
							<EnvelopeIcon className="size-4" />
							{t`Open email client`}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ---------- Sample Letter Modal ----------

export function SampleLetterModal({ isOpen, onOpenChange, selectedSample }: SampleLetterModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{selectedSample?.title}</DialogTitle>
					<DialogDescription>
						{selectedSample && (
							<Badge className={cn("mt-2 gap-1", recommenderTypeConfig[selectedSample.type].color)}>
								{recommenderTypeConfig[selectedSample.type].label}
							</Badge>
						)}
					</DialogDescription>
				</DialogHeader>

				{selectedSample && (
					<div className="space-y-4">
						<div>
							<Label className="mb-2 block text-sm">{t`Highlighted strengths`}</Label>
							<div className="flex flex-wrap gap-2">
								{selectedSample.highlights.map((highlight, i) => (
									<Badge key={i} variant="outline">
										{highlight}
									</Badge>
								))}
							</div>
						</div>

						<ScrollArea className="h-[400px] rounded-lg border p-4">
							<pre className="whitespace-pre-wrap font-sans text-sm">{selectedSample.content}</pre>
						</ScrollArea>
					</div>
				)}

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{t`Close`}</Button>
					</DialogClose>
					<Button
						onClick={() => {
							if (selectedSample) {
								navigator.clipboard.writeText(selectedSample.content);
								toast.success(t`Example copied`);
							}
						}}
						className="gap-2"
					>
						<CopyIcon className="size-4" />
						{t`Copy`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
