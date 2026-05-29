import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	DownloadSimpleIcon,
	NoteIcon,
	NotePencilIcon,
	PlusIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	CreateNoteDialog,
	NoteCard,
	NoteDetail,
	NotesFilterBar,
	NotesHeroSection,
	NotesTipsSection,
} from "./-components/notes-components";
import type { InterviewNoteStatus, InterviewNoteType } from "./-components/notes-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/interview/notes" as any)({
	component: InterviewNotesPage,
	errorComponent: ErrorComponent,
});

function InterviewNotesPage() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const [searchQuery, setSearchQuery] = useState("");
	const [companyFilter, setCompanyFilter] = useState<string>("all");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [dateFilter, setDateFilter] = useState<string>("");
	const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

	const [newNote, setNewNote] = useState({
		title: "",
		company: "",
		position: "",
		date: "",
		startTime: "",
		type: "in_person" as InterviewNoteType,
		location: "",
		tags: "",
	});

	const {
		data: notes = [],
		isLoading,
		error,
	} = useQuery({
		...orpc.interviewNotes.list.queryOptions({
			status: statusFilter !== "all" ? (statusFilter as InterviewNoteStatus) : undefined,
			type: typeFilter !== "all" ? (typeFilter as InterviewNoteType) : undefined,
			company: companyFilter !== "all" ? companyFilter : undefined,
			search: searchQuery || undefined,
			dateFilter: dateFilter || undefined,
		}),
		enabled: !!session?.user,
	});

	const { data: companies = [] } = useQuery({
		...orpc.interviewNotes.getCompanies.queryOptions(),
		enabled: !!session?.user,
	});

	const { data: stats } = useQuery({ ...orpc.interviewNotes.getStatistics.queryOptions(), enabled: !!session?.user });

	const { mutate: createNoteMutation, isPending: isCreating } = useMutation({
		...orpc.interviewNotes.create.mutationOptions(),
		onSuccess: (noteId) => {
			queryClient.invalidateQueries({ queryKey: ["interviewNotes"] });
			setIsCreateDialogOpen(false);
			setNewNote({
				title: "",
				company: "",
				position: "",
				date: "",
				startTime: "",
				type: "in_person",
				location: "",
				tags: "",
			});
			toast.success(t`Notes d'entretien créées`);
			setSelectedNoteId(noteId);
		},
		onError: () => {
			toast.error(t`Erreur pendant la creation`);
		},
	});

	const { mutate: deleteNoteMutation } = useMutation({
		...orpc.interviewNotes.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewNotes"] });
			toast.success(t`Notes supprimees`);
			setDeletingNoteId(null);
		},
		onError: () => {
			toast.error(t`Erreur pendant la suppression`);
			setDeletingNoteId(null);
		},
	});

	const selectedNote = useMemo(() => {
		return notes.find((n) => n.id === selectedNoteId);
	}, [notes, selectedNoteId]);

	const handleCreateNote = useCallback(() => {
		createNoteMutation({
			title: newNote.title || `${newNote.company} - ${newNote.position}`,
			company: newNote.company,
			position: newNote.position,
			date: newNote.date,
			startTime: newNote.startTime,
			endTime: undefined,
			location: newNote.location || undefined,
			type: newNote.type,
			tags: newNote.tags
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean),
		});
	}, [newNote, createNoteMutation]);

	const handleDeleteNote = useCallback(
		(noteId: string) => {
			setDeletingNoteId(noteId);
			deleteNoteMutation({ id: noteId });
		},
		[deleteNoteMutation],
	);

	const handleExportPDF = useCallback(() => {
		toast.info(t`L'export PDF est en cours de developpement. Fonctionnalite bientot disponible.`);
	}, []);

	if (error && !isLoading) {
		return (
			<>
				<DashboardHeader icon={NotePencilIcon} title={t`Notes d'entretien`} />
				<Card className="border-destructive/50 bg-destructive/5">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<WarningIcon className="size-12 text-destructive" />
						<p className="mt-4 text-destructive">
							<Trans>Erreur de chargement des notes</Trans>
						</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => queryClient.invalidateQueries({ queryKey: ["interviewNotes"] })}
						>
							<Trans>Reessayer</Trans>
						</Button>
					</CardContent>
				</Card>
			</>
		);
	}

	if (selectedNote) {
		return <NoteDetail note={selectedNote} onClose={() => setSelectedNoteId(null)} />;
	}

	return (
		<>
			<DashboardHeader icon={NotePencilIcon} title={t`Notes d'entretien`} />

			<NotesHeroSection stats={stats} />

			<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex gap-2">
					<CreateNoteDialog
						isOpen={isCreateDialogOpen}
						onOpenChange={setIsCreateDialogOpen}
						newNote={newNote}
						setNewNote={setNewNote}
						onCreateNote={handleCreateNote}
						isCreating={isCreating}
					/>
					<Button variant="outline" onClick={handleExportPDF}>
						<DownloadSimpleIcon className="mr-2 size-4" />
						<Trans>Exporter PDF</Trans>
					</Button>
				</div>
				<Link to="/dashboard/interview">
					<Button variant="ghost">
						<ArrowLeftIcon className="mr-2 size-4" />
						<Trans>Retour a l'espace entretien</Trans>
					</Button>
				</Link>
			</div>

			<NotesFilterBar
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				companyFilter={companyFilter}
				setCompanyFilter={setCompanyFilter}
				typeFilter={typeFilter}
				setTypeFilter={setTypeFilter}
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
				dateFilter={dateFilter}
				setDateFilter={setDateFilter}
				companies={companies}
			/>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<AnimatePresence mode="popLayout">
					{notes.length > 0 ? (
						notes.map((note) => (
							<NoteCard
								key={note.id}
								note={note}
								onView={setSelectedNoteId}
								onDelete={handleDeleteNote}
								isDeleting={deletingNoteId === note.id}
							/>
						))
					) : (
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-12 text-center">
							<NoteIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
							<h4 className="mb-2 font-semibold text-lg">
								<Trans>Aucune note trouvée</Trans>
							</h4>
							<p className="mb-4 text-muted-foreground">
								{searchQuery ||
								companyFilter !== "all" ||
								typeFilter !== "all" ||
								statusFilter !== "all" ||
								dateFilter ? (
									<Trans>Aucune note ne correspond a vos criteres de recherche.</Trans>
								) : (
									<Trans>Créez vos premières notes d'entretien pour rester organisé.</Trans>
								)}
							</p>
							{!searchQuery &&
								companyFilter === "all" &&
								typeFilter === "all" &&
								statusFilter === "all" &&
								!dateFilter && (
									<Button onClick={() => setIsCreateDialogOpen(true)}>
										<PlusIcon className="mr-2 size-4" />
										<Trans>Creer des notes</Trans>
									</Button>
								)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<NotesTipsSection />
		</>
	);
}
