import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	BuildingsIcon,
	CalendarIcon,
	CaretDownIcon,
	CheckCircleIcon,
	CheckSquareIcon,
	ClockIcon,
	DownloadSimpleIcon,
	FileTextIcon,
	FunnelIcon,
	ListChecksIcon,
	MagnifyingGlassIcon,
	NoteIcon,
	NotePencilIcon,
	PencilSimpleIcon,
	PlusIcon,
	QuestionIcon,
	SparkleIcon,
	SpinnerIcon,
	TagIcon,
	TrashIcon,
	UserIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import {
	impressionColors,
	impressionLabels,
	interviewTypeColors,
	interviewTypeLabels,
	priorityColors,
	statusColors,
	statusLabels,
} from "./notes-config";
import type { InterviewNote, InterviewNoteType } from "./notes-types";

function RichTextEditor({
	value,
	onChange,
	placeholder,
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}) {
	return (
		<div className="relative">
			<Textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="min-h-[200px] resize-y font-mono text-sm"
			/>
			<div className="mt-2 flex flex-wrap gap-2">
				<Button type="button" variant="outline" size="sm" onClick={() => onChange(`${value}\n\n**Point cle :**\n`)}>
					<Trans>Point cle</Trans>
				</Button>
				<Button type="button" variant="outline" size="sm" onClick={() => onChange(`${value}\n\n- `)}>
					<Trans>Liste</Trans>
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() =>
						onChange(`${value}\n\n[${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}] `)
					}
				>
					<ClockIcon className="mr-1 size-3" />
					<Trans>Horodatage</Trans>
				</Button>
			</div>
		</div>
	);
}

export function NoteCard({
	note,
	onView,
	onDelete,
	isDeleting,
}: {
	note: InterviewNote;
	onView: (id: string) => void;
	onDelete: (id: string) => void;
	isDeleting: boolean;
}) {
	const completedActions = note.followUpActions.filter((a) => a.completed).length;
	const totalActions = note.followUpActions.length;
	const checkedPoints = note.keyPoints.filter((p) => p.checked).length;
	const totalPoints = note.keyPoints.length;

	return (
		<motion.div initial={false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} layout>
			<Card className="group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg">
				<CardHeader className="pb-3">
					<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
						<div className="flex flex-wrap items-center gap-2">
							<Badge className={interviewTypeColors[note.type]}>{interviewTypeLabels[note.type]}</Badge>
							<Badge className={statusColors[note.status]}>{statusLabels[note.status]}</Badge>
							{note.overallImpression && (
								<Badge className={impressionColors[note.overallImpression]}>
									{impressionLabels[note.overallImpression]}
								</Badge>
							)}
						</div>
						<span className="flex items-center gap-1 text-muted-foreground text-xs">
							<CalendarIcon className="size-3" />
							{new Date(note.date).toLocaleDateString("fr-FR", {
								day: "numeric",
								month: "short",
								year: "numeric",
							})}
						</span>
					</div>
					<CardTitle className="text-lg transition-colors group-hover:text-primary">{note.title}</CardTitle>
					<CardDescription className="flex items-center gap-2">
						<BuildingsIcon className="size-4" />
						{note.company} - {note.position}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
						<div className="flex items-center gap-1 text-muted-foreground">
							<UserIcon className="size-4" />
							{note.interviewers.length} recruteur{note.interviewers.length > 1 ? "s" : ""}
						</div>
						<div className="flex items-center gap-1 text-muted-foreground">
							<QuestionIcon className="size-4" />
							{note.questionResponses.length} question{note.questionResponses.length > 1 ? "s" : ""}
						</div>
						<div className="flex items-center gap-1 text-muted-foreground">
							<CheckSquareIcon className="size-4" />
							{checkedPoints}/{totalPoints} points cles
						</div>
						<div className="flex items-center gap-1 text-muted-foreground">
							<ListChecksIcon className="size-4" />
							{completedActions}/{totalActions} actions
						</div>
					</div>

					{note.tags.length > 0 && (
						<div className="mb-4 flex flex-wrap gap-2">
							{note.tags.map((tag, idx) => (
								<Badge key={idx} variant="outline" className="text-xs">
									<TagIcon className="mr-1 size-3" />
									{tag}
								</Badge>
							))}
						</div>
					)}

					<div className="flex items-center justify-between border-t pt-3">
						<span className="text-muted-foreground text-xs">
							<Trans>Modifié le</Trans>{" "}
							{new Date(note.updatedAt).toLocaleDateString("fr-FR", {
								day: "numeric",
								month: "short",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={() => onView(note.id)}>
								<NotePencilIcon className="mr-1 size-4" />
								<Trans>Voir</Trans>
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="text-destructive"
								onClick={() => onDelete(note.id)}
								disabled={isDeleting}
							>
								{isDeleting ? <SpinnerIcon className="size-4 animate-spin" /> : <TrashIcon className="size-4" />}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

export function NoteDetail({ note, onClose }: { note: InterviewNote; onClose: () => void }) {
	const queryClient = useQueryClient();
	const [activeSection, setActiveSection] = useState<string>("info");
	const [isEditing, setIsEditing] = useState(false);
	const [editedNotes, setEditedNotes] = useState(note.generalNotes);

	const { mutate: updateNoteMutation, isPending: isUpdating } = useMutation({
		...orpc.interviewNotes.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewNotes"] });
		},
		onError: () => {
			toast.error(t`Erreur pendant la mise a jour`);
		},
	});

	const { mutate: toggleKeyPointMutation } = useMutation({
		...orpc.interviewNotes.toggleKeyPoint.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewNotes"] });
		},
		onError: () => {
			toast.error(t`Erreur pendant la mise a jour`);
		},
	});

	const { mutate: toggleFollowUpMutation } = useMutation({
		...orpc.interviewNotes.toggleFollowUpAction.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewNotes"] });
		},
		onError: () => {
			toast.error(t`Erreur pendant la mise a jour`);
		},
	});

	const toggleKeyPoint = (keyPointId: string) => {
		toggleKeyPointMutation({ noteId: note.id, keyPointId });
	};

	const toggleFollowUpAction = (actionId: string) => {
		toggleFollowUpMutation({ noteId: note.id, actionId });
	};

	const updateGeneralNotes = (newNotes: string) => {
		setEditedNotes(newNotes);
	};

	const saveGeneralNotes = () => {
		updateNoteMutation({ id: note.id, generalNotes: editedNotes });
		setIsEditing(false);
		toast.success(t`Notes enregistrees`);
	};

	return (
		<motion.div
			initial={false}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-sm"
		>
			<div className="container mx-auto max-w-5xl p-4 md:p-6">
				<div className="mb-6 flex items-center justify-between">
					<Button variant="ghost" onClick={onClose}>
						<ArrowLeftIcon className="mr-2 size-4" />
						<Trans>Retour</Trans>
					</Button>
					<div className="flex gap-2">
						{isEditing ? (
							<Button onClick={saveGeneralNotes} disabled={isUpdating}>
								{isUpdating ? <SpinnerIcon className="mr-2 size-4 animate-spin" /> : null}
								<Trans>Enregistrer</Trans>
							</Button>
						) : (
							<Button variant="outline" onClick={() => setIsEditing(true)}>
								<PencilSimpleIcon className="mr-2 size-4" />
								<Trans>Modifier</Trans>
							</Button>
						)}
						<Button variant="outline" onClick={() => toast.info(t`L'export PDF est en cours de developpement`)}>
							<DownloadSimpleIcon className="mr-2 size-4" />
							<Trans>Exporter PDF</Trans>
						</Button>
					</div>
				</div>

				<Card className="mb-6">
					<CardHeader>
						<div className="mb-3 flex flex-wrap items-center gap-2">
							<Badge className={interviewTypeColors[note.type]}>{interviewTypeLabels[note.type]}</Badge>
							<Badge className={statusColors[note.status]}>{statusLabels[note.status]}</Badge>
							{note.overallImpression && (
								<Badge className={impressionColors[note.overallImpression]}>
									{impressionLabels[note.overallImpression]}
								</Badge>
							)}
						</div>
						<CardTitle className="text-2xl">{note.title}</CardTitle>
						<CardDescription className="flex flex-wrap items-center gap-4 text-base">
							<span className="flex items-center gap-1">
								<BuildingsIcon className="size-4" />
								{note.company}
							</span>
							<span className="flex items-center gap-1">
								<FileTextIcon className="size-4" />
								{note.position}
							</span>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap items-center gap-6 text-sm">
							<div className="flex items-center gap-2">
								<CalendarIcon className="size-4 text-muted-foreground" />
								<span>
									{new Date(note.date).toLocaleDateString("fr-FR", {
										weekday: "long",
										day: "numeric",
										month: "long",
										year: "numeric",
									})}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<ClockIcon className="size-4 text-muted-foreground" />
								<span>
									{note.startTime}
									{note.endTime && ` - ${note.endTime}`}
								</span>
							</div>
							{note.location && (
								<div className="flex items-center gap-2">
									<BuildingsIcon className="size-4 text-muted-foreground" />
									<span>{note.location}</span>
								</div>
							)}
						</div>
						{note.tags.length > 0 && (
							<div className="mt-4 flex flex-wrap gap-2">
								{note.tags.map((tag, idx) => (
									<Badge key={idx} variant="outline">
										<TagIcon className="mr-1 size-3" />
										{tag}
									</Badge>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				<Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
					<TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
						<TabsTrigger
							value="info"
							className="rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
						>
							<UserIcon className="mr-2 size-4" />
							<Trans>Recruteurs</Trans>
						</TabsTrigger>
						<TabsTrigger
							value="keypoints"
							className="rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
						>
							<CheckSquareIcon className="mr-2 size-4" />
							<Trans>Points cles</Trans>
						</TabsTrigger>
						<TabsTrigger
							value="questions"
							className="rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
						>
							<QuestionIcon className="mr-2 size-4" />
							<Trans>Questions</Trans>
						</TabsTrigger>
						<TabsTrigger
							value="actions"
							className="rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
						>
							<ListChecksIcon className="mr-2 size-4" />
							<Trans>Actions</Trans>
						</TabsTrigger>
						<TabsTrigger
							value="notes"
							className="rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
						>
							<NoteIcon className="mr-2 size-4" />
							<Trans>Notes</Trans>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="info" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<UserIcon className="size-5" />
									<Trans>Informations des recruteurs</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Détails des personnes rencontrées pendant l'entretien</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{note.interviewers.length > 0 ? (
									note.interviewers.map((interviewer, idx) => (
										<div key={idx} className="rounded-lg border p-4">
											<div className="mb-2 flex items-start justify-between">
												<div>
													<h4 className="font-semibold">{interviewer.name}</h4>
													<p className="text-muted-foreground text-sm">{interviewer.title}</p>
												</div>
											</div>
											<div className="space-y-1 text-sm">
												{interviewer.email && (
													<p className="flex items-center gap-2 text-muted-foreground">
														<span className="font-medium">Email:</span> {interviewer.email}
													</p>
												)}
												{interviewer.phone && (
													<p className="flex items-center gap-2 text-muted-foreground">
														<span className="font-medium">Tel:</span> {interviewer.phone}
													</p>
												)}
												{interviewer.linkedIn && (
													<p className="flex items-center gap-2 text-muted-foreground">
														<span className="font-medium">LinkedIn:</span> {interviewer.linkedIn}
													</p>
												)}
											</div>
											{interviewer.notes && (
												<div className="mt-3 rounded-lg bg-muted/50 p-3">
													<p className="text-sm">{interviewer.notes}</p>
												</div>
											)}
										</div>
									))
								) : (
									<p className="text-muted-foreground">
										<Trans>Aucun recruteur enregistre</Trans>
									</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="keypoints" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CheckSquareIcon className="size-5" />
									<Trans>Points cles de l'entretien</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Éléments importants à retenir de cet entretien</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{note.keyPoints.length > 0 ? (
									note.keyPoints.map((keyPoint) => (
										<div
											key={keyPoint.id}
											className={cn(
												"flex items-center gap-3 rounded-lg border p-3 transition-colors",
												keyPoint.checked && "bg-green-50/50 dark:bg-green-900/10",
											)}
										>
											<Checkbox
												checked={keyPoint.checked}
												onCheckedChange={() => toggleKeyPoint(keyPoint.id)}
												className="size-5"
											/>
											<span className={cn("flex-1", keyPoint.checked && "text-muted-foreground line-through")}>
												{keyPoint.text}
											</span>
										</div>
									))
								) : (
									<p className="text-muted-foreground">
										<Trans>Aucun point cle enregistre</Trans>
									</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="questions" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<QuestionIcon className="size-5" />
									<Trans>Questions et réponses</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Historique des questions posées et de vos réponses</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{note.questionResponses.length > 0 ? (
									note.questionResponses.map((qr, idx) => (
										<Collapsible key={qr.id} defaultOpen={idx === 0}>
											<div className="rounded-lg border">
												<CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left">
													<div className="flex items-center gap-3">
														<Badge variant="outline" className="shrink-0">
															<ClockIcon className="mr-1 size-3" />
															{qr.timestamp}
														</Badge>
														<span className="line-clamp-1 font-medium">{qr.question}</span>
													</div>
													<div className="flex items-center gap-2">
														{qr.rating && (
															<div className="flex items-center gap-1">
																{[1, 2, 3, 4, 5].map((star) => (
																	<SparkleIcon
																		key={star}
																		className={cn(
																			"size-4",
																			star <= (qr.rating ?? 0) ? "text-amber-500" : "text-gray-300",
																		)}
																		weight={star <= (qr.rating ?? 0) ? "fill" : "regular"}
																	/>
																))}
															</div>
														)}
														<CaretDownIcon className="size-4 text-muted-foreground" />
													</div>
												</CollapsibleTrigger>
												<CollapsibleContent>
													<div className="space-y-3 border-t p-4">
														<div>
															<h5 className="mb-1 font-medium text-muted-foreground text-sm">
																<Trans>Question :</Trans>
															</h5>
															<p className="text-sm">{qr.question}</p>
														</div>
														<div>
															<h5 className="mb-1 font-medium text-muted-foreground text-sm">
																<Trans>Ma réponse :</Trans>
															</h5>
															<p className="text-sm">{qr.response}</p>
														</div>
														{qr.notes && (
															<div className="rounded-lg bg-muted/50 p-3">
																<h5 className="mb-1 font-medium text-xs">
																	<Trans>Notes :</Trans>
																</h5>
																<p className="text-muted-foreground text-sm">{qr.notes}</p>
															</div>
														)}
													</div>
												</CollapsibleContent>
											</div>
										</Collapsible>
									))
								) : (
									<p className="text-muted-foreground">
										<Trans>Aucune question enregistree</Trans>
									</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="actions" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ListChecksIcon className="size-5" />
									<Trans>Actions de suivi</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Tâches à compléter après cet entretien</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{note.followUpActions.length > 0 ? (
									note.followUpActions.map((action) => (
										<div
											key={action.id}
											className={cn(
												"flex items-center gap-3 rounded-lg border p-3 transition-colors",
												action.completed && "bg-green-50/50 dark:bg-green-900/10",
											)}
										>
											<Checkbox
												checked={action.completed}
												onCheckedChange={() => toggleFollowUpAction(action.id)}
												className="size-5"
											/>
											<div className="flex-1">
												<span className={cn(action.completed && "text-muted-foreground line-through")}>
													{action.text}
												</span>
												{action.dueDate && (
													<p className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
														<CalendarIcon className="size-3" />
														<Trans>Échéance :</Trans> {new Date(action.dueDate).toLocaleDateString("fr-FR")}
													</p>
												)}
											</div>
											<Badge className={priorityColors[action.priority]}>
												{action.priority === "high" ? "Elevee" : action.priority === "medium" ? "Moyenne" : "Basse"}
											</Badge>
										</div>
									))
								) : (
									<p className="text-muted-foreground">
										<Trans>Aucune action de suivi enregistree</Trans>
									</p>
								)}
							</CardContent>
						</Card>

						{note.nextSteps && (
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">
										<Trans>Prochaines étapes</Trans>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm">{note.nextSteps}</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					<TabsContent value="notes" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<NoteIcon className="size-5" />
									<Trans>Notes générales</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Vos observations et reflexions sur cet entretien</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								{isEditing ? (
									<RichTextEditor
										value={editedNotes}
										onChange={updateGeneralNotes}
										placeholder={t`Ajoutez vos notes ici...`}
									/>
								) : (
									<div className="prose prose-sm dark:prose-invert max-w-none">
										{note.generalNotes ? (
											<pre className="whitespace-pre-wrap font-sans text-sm">{note.generalNotes}</pre>
										) : (
											<p className="text-muted-foreground">
												<Trans>Aucune note enregistree</Trans>
											</p>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</motion.div>
	);
}

export function NotesHeroSection({
	stats,
}: {
	stats: { total: number; completed: number; scheduled: number; pendingActions: number } | undefined;
}) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.12 200 / 0.15) 0%, oklch(0.6 0.15 180 / 0.1) 50%, oklch(0.65 0.12 160 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/10 blur-3xl"
					animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0], opacity: [0.5, 0.3, 0.5] }}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-purple-500/15 to-pink-500/10 blur-3xl"
					animate={{ scale: [1.2, 1, 1.2], rotate: [0, -10, 0], opacity: [0.3, 0.5, 0.3] }}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<NotePencilIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Organisation</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Notes d'entretien</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Notez chaque detail important de vos entretiens. Enregistrez les questions, suivez vos actions et gardez une
						trace de vos impressions pour mieux vous préparer.
					</Trans>
				</motion.p>

				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<NoteIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{stats?.total ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Entretiens</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<CheckCircleIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{stats?.completed ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Terminés</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10">
							<CalendarIcon className="size-5 text-blue-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{stats?.scheduled ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Planifies</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<ListChecksIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{stats?.pendingActions ?? 0}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Actions en attente</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

export function CreateNoteDialog({
	isOpen,
	onOpenChange,
	newNote,
	setNewNote,
	onCreateNote,
	isCreating,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	newNote: {
		title: string;
		company: string;
		position: string;
		date: string;
		startTime: string;
		type: InterviewNoteType;
		location: string;
		tags: string;
	};
	setNewNote: Dispatch<SetStateAction<typeof newNote>>;
	onCreateNote: () => void;
	isCreating: boolean;
}) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button>
					<PlusIcon className="mr-2 size-4" />
					<Trans>Nouvelles notes</Trans>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>
						<Trans>Creer des notes d'entretien</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Enregistrez les informations de base de votre prochain entretien.</Trans>
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label>
							<Trans>Titre (facultatif)</Trans>
						</Label>
						<Input
							placeholder={t`Ex. : Entretien infirmier - Hopital central`}
							value={newNote.title}
							onChange={(e) => setNewNote((prev) => ({ ...prev, title: e.target.value }))}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label>
								<Trans>Entreprise</Trans>
							</Label>
							<Input
								placeholder={t`Nom de l'entreprise`}
								value={newNote.company}
								onChange={(e) => setNewNote((prev) => ({ ...prev, company: e.target.value }))}
							/>
						</div>
						<div className="grid gap-2">
							<Label>
								<Trans>Poste</Trans>
							</Label>
							<Input
								placeholder={t`Intitule du poste`}
								value={newNote.position}
								onChange={(e) => setNewNote((prev) => ({ ...prev, position: e.target.value }))}
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label>
								<Trans>Date</Trans>
							</Label>
							<Input
								type="date"
								value={newNote.date}
								onChange={(e) => setNewNote((prev) => ({ ...prev, date: e.target.value }))}
							/>
						</div>
						<div className="grid gap-2">
							<Label>
								<Trans>Heure</Trans>
							</Label>
							<Input
								type="time"
								value={newNote.startTime}
								onChange={(e) => setNewNote((prev) => ({ ...prev, startTime: e.target.value }))}
							/>
						</div>
					</div>
					<div className="grid gap-2">
						<Label>
							<Trans>Type d'entretien</Trans>
						</Label>
						<Select
							value={newNote.type}
							onValueChange={(v) => setNewNote((prev) => ({ ...prev, type: v as InterviewNoteType }))}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(interviewTypeLabels).map(([key, label]) => (
									<SelectItem key={key} value={key}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label>
							<Trans>Lieu (facultatif)</Trans>
						</Label>
						<Input
							placeholder={t`Adresse ou lien video`}
							value={newNote.location}
							onChange={(e) => setNewNote((prev) => ({ ...prev, location: e.target.value }))}
						/>
					</div>
					<div className="grid gap-2">
						<Label>
							<Trans>Tags (separes par des virgules)</Trans>
						</Label>
						<Input
							placeholder="sante, CDI, casablanca"
							value={newNote.tags}
							onChange={(e) => setNewNote((prev) => ({ ...prev, tags: e.target.value }))}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Annuler</Trans>
					</Button>
					<Button
						onClick={onCreateNote}
						disabled={!newNote.company || !newNote.position || !newNote.date || !newNote.startTime || isCreating}
					>
						{isCreating ? <SpinnerIcon className="mr-2 size-4 animate-spin" /> : <PlusIcon className="mr-2 size-4" />}
						<Trans>Creer</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function NotesFilterBar({
	searchQuery,
	setSearchQuery,
	companyFilter,
	setCompanyFilter,
	typeFilter,
	setTypeFilter,
	statusFilter,
	setStatusFilter,
	dateFilter,
	setDateFilter,
	companies,
}: {
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	companyFilter: string;
	setCompanyFilter: (value: string) => void;
	typeFilter: string;
	setTypeFilter: (value: string) => void;
	statusFilter: string;
	setStatusFilter: (value: string) => void;
	dateFilter: string;
	setDateFilter: (value: string) => void;
	companies: string[];
}) {
	return (
		<Card className="mb-6">
			<CardContent className="flex flex-wrap items-center gap-4 p-4">
				<div className="min-w-[200px] flex-1">
					<div className="relative">
						<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={t`Rechercher des notes...`}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
				</div>
				<Select value={companyFilter} onValueChange={setCompanyFilter}>
					<SelectTrigger className="w-[180px]">
						<BuildingsIcon className="mr-2 size-4" />
						<SelectValue placeholder={t`Entreprise`} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							<Trans>Toutes les entreprises</Trans>
						</SelectItem>
						{companies.map((company) => (
							<SelectItem key={company} value={company}>
								{company}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={typeFilter} onValueChange={setTypeFilter}>
					<SelectTrigger className="w-[160px]">
						<FunnelIcon className="mr-2 size-4" />
						<SelectValue placeholder={t`Type`} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							<Trans>Tous les types</Trans>
						</SelectItem>
						{Object.entries(interviewTypeLabels).map(([key, label]) => (
							<SelectItem key={key} value={key}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-[140px]">
						<SelectValue placeholder={t`Statut`} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							<Trans>Tous les statuts</Trans>
						</SelectItem>
						{Object.entries(statusLabels).map(([key, label]) => (
							<SelectItem key={key} value={key}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<div className="flex items-center gap-2">
					<CalendarIcon className="size-4 text-muted-foreground" />
					<Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-[160px]" />
					{dateFilter && (
						<Button variant="ghost" size="icon" className="size-8" onClick={() => setDateFilter("")}>
							<XIcon className="size-4" />
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

export function NotesTipsSection() {
	return (
		<section className="mt-10">
			<Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent">
				<CardContent className="flex items-start gap-4 p-6">
					<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
						<SparkleIcon className="size-6 text-amber-600" weight="fill" />
					</div>
					<div>
						<h3 className="mb-2 font-semibold text-lg">
							<Trans>Conseils pour prendre de bonnes notes d'entretien</Trans>
						</h3>
						<ul className="space-y-2 text-muted-foreground text-sm">
							<li className="flex items-start gap-2">
								<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" weight="fill" />
								<Trans>Notez des le debut les noms et fonctions de tous les recruteurs</Trans>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" weight="fill" />
								<Trans>Utilisez des horodatages pour retrouver facilement les moments importants</Trans>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" weight="fill" />
								<Trans>Créez des actions de suivi avec des échéances claires</Trans>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" weight="fill" />
								<Trans>Évaluez vos réponses pour identifier les points à améliorer</Trans>
							</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</section>
	);
}
