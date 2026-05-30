import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BriefcaseIcon,
	BuildingsIcon,
	CalendarIcon,
	CaretRightIcon,
	ClockIcon,
	FunnelIcon,
	MagnifyingGlassIcon,
	NoteIcon,
	PencilSimpleIcon,
	PlusIcon,
	SpinnerIcon,
	TrashIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import type { UseFormReturn } from "react-hook-form";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";
import { statusConfig } from "./applications-config";
import type { ApplicationData, ApplicationFormValues, ApplicationStatus } from "./applications-types";
import { getDaysAgo } from "./applications-utils";

type StatsData = {
	total: number;
	active: number;
	interviews: number;
	offers: number;
};

const FRENCH_DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
	day: "numeric",
	month: "long",
	year: "numeric",
});

function formatFrenchDate(dateValue: Date | string | null | undefined): string {
	if (!dateValue) return "";
	const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
	return FRENCH_DATE_FORMATTER.format(date);
}

export function LoadingState() {
	return (
		<div className="flex items-center justify-center py-16">
			<SpinnerIcon aria-hidden="true" className="size-8 animate-spin text-primary" />
		</div>
	);
}

export function ErrorState({ error }: { error: Error | null }) {
	return (
		<Card className="border-destructive">
			<CardContent className="flex flex-col items-center justify-center py-16">
				<XCircleIcon aria-hidden="true" className="mb-4 size-16 text-destructive" weight="duotone" />
				<h3 className="mb-2 font-semibold text-lg">
					<Trans>Erreur de chargement</Trans>
				</h3>
				<p className="text-center text-muted-foreground">
					{error?.message || <Trans>Impossible de charger tes candidatures</Trans>}
				</p>
			</CardContent>
		</Card>
	);
}

export function HeroSection({ stats }: { stats: StatsData }) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-lg border border-primary/20 bg-[linear-gradient(135deg,hsl(var(--primary)/0.12),hsl(var(--background)),hsl(var(--chart-2)/0.10))] p-6 md:p-8"
			style={{
				boxShadow: "inset 0 1px 0 hsl(var(--background) / 0.7)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<NoteIcon aria-hidden="true" className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-[0.08em]">
						<Trans>Suivi carrière</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-3 max-w-3xl font-bold text-2xl tracking-tight md:text-3xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Garde le contrôle sur chaque candidature</Trans>
				</motion.h2>

				<motion.p
					className="mb-6 max-w-2xl text-muted-foreground text-sm md:text-base"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>Suis les offres envoyées, prépare les relances et garde tes notes d'entretien au même endroit.</Trans>
				</motion.p>

				<motion.div
					className="grid grid-cols-2 gap-4 sm:grid-cols-4"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="rounded-lg border bg-background/80 p-4 shadow-sm">
						<p className="font-bold text-2xl">{stats.total}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Total</Trans>
						</p>
					</div>
					<div className="rounded-lg border bg-background/80 p-4 shadow-sm">
						<p className="font-bold text-2xl text-blue-600 dark:text-blue-400">{stats.active}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Actives</Trans>
						</p>
					</div>
					<div className="rounded-lg border bg-background/80 p-4 shadow-sm">
						<p className="font-bold text-2xl text-purple-600 dark:text-purple-400">{stats.interviews}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Entretiens</Trans>
						</p>
					</div>
					<div className="rounded-lg border bg-background/80 p-4 shadow-sm">
						<p className="font-bold text-2xl text-green-600 dark:text-green-400">{stats.offers}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Offres reçues</Trans>
						</p>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

export function ActionsBar({
	searchQuery,
	setSearchQuery,
	statusFilter,
	setStatusFilter,
	onAddClick,
}: {
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	statusFilter: ApplicationStatus | "all";
	setStatusFilter: (value: ApplicationStatus | "all") => void;
	onAddClick: () => void;
}) {
	return (
		<Card className="mb-6">
			<CardContent className="p-4">
				<div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
					<div className="flex flex-1 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
						<div className="relative w-full min-w-[200px] sm:flex-1 lg:max-w-xs">
							<MagnifyingGlassIcon
								aria-hidden="true"
								className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								aria-label={t`Rechercher une candidature`}
								name="applicationSearch"
								autoComplete="off"
								placeholder={t`Rechercher par poste, entreprise ou ville…`}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						<Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ApplicationStatus | "all")}>
							<SelectTrigger aria-label={t`Filtrer par statut`} className="w-full sm:w-[190px]">
								<FunnelIcon aria-hidden="true" className="mr-2 size-4" />
								<SelectValue placeholder={t`Filtrer par statut`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									<Trans>Tous les statuts</Trans>
								</SelectItem>
								{(Object.entries(statusConfig) as [ApplicationStatus, (typeof statusConfig)[ApplicationStatus]][]).map(
									([key, config]) => {
										const StatusIcon = config.icon;
										return (
											<SelectItem key={key} value={key}>
												<div className="flex items-center gap-2">
													<StatusIcon aria-hidden="true" className="size-4" />
													{config.label}
												</div>
											</SelectItem>
										);
									},
								)}
							</SelectContent>
						</Select>
					</div>

					<Button className="w-full gap-2 sm:w-auto" onClick={onAddClick}>
						<PlusIcon aria-hidden="true" className="size-4" />
						<Trans>Ajouter une candidature</Trans>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

export function ApplicationsList<T extends ApplicationData>({
	applications,
	searchQuery,
	statusFilter,
	openEditDialog,
	setDeleteConfirmId,
	setIsAddDialogOpen,
}: {
	applications: T[];
	searchQuery: string;
	statusFilter: ApplicationStatus | "all";
	openEditDialog: (app: T) => void;
	setDeleteConfirmId: (id: string | null) => void;
	setIsAddDialogOpen: (open: boolean) => void;
}) {
	return (
		<AnimatePresence mode="popLayout">
			{applications.length > 0 ? (
				<div className="space-y-4">
					{applications.map((app, index) => {
						const status = statusConfig[app.status as ApplicationStatus] || statusConfig.applied;
						const StatusIcon = status.icon;
						return (
							<motion.div
								key={app.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ delay: index * 0.05 }}
							>
								<Card className="group transition-shadow hover:shadow-md">
									<CardContent className="p-4 md:p-6">
										<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
											<div className="flex-1 space-y-2">
												<div className="flex flex-wrap items-center gap-2">
													<h3 className="font-semibold text-lg">{app.position}</h3>
													<Badge className={cn(status.bgColor, status.color)}>
														<StatusIcon aria-hidden="true" className="mr-1 size-3" />
														{status.label}
													</Badge>
												</div>
												<div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
													<span className="flex items-center gap-1">
														<BuildingsIcon aria-hidden="true" className="size-4" />
														{app.companyName}
													</span>
													{app.location && (
														<span className="flex items-center gap-1">
															<BriefcaseIcon aria-hidden="true" className="size-4" />
															{app.location}
														</span>
													)}
													{app.appliedAt && (
														<span className="flex items-center gap-1">
															<CalendarIcon aria-hidden="true" className="size-4" />
															{getDaysAgo(app.appliedAt)}
														</span>
													)}
												</div>
												{app.notes && <p className="line-clamp-2 text-muted-foreground text-sm">{app.notes}</p>}
												{app.deadline && (
													<div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
														<ClockIcon aria-hidden="true" className="size-4 text-primary" />
														<span className="font-medium text-primary text-sm">
															<Trans>Date limite :</Trans> {formatFrenchDate(app.deadline)}
														</span>
													</div>
												)}
											</div>

											<div className="flex items-center gap-2">
												<Button
													variant="outline"
													size="sm"
													aria-label={t`Modifier cette candidature`}
													onClick={() => openEditDialog(app)}
												>
													<PencilSimpleIcon aria-hidden="true" className="size-4" />
												</Button>
												<Button
													variant="outline"
													size="sm"
													className="text-red-600 hover:bg-red-50 hover:text-red-700"
													aria-label={t`Supprimer cette candidature`}
													onClick={() => setDeleteConfirmId(app.id)}
												>
													<TrashIcon aria-hidden="true" className="size-4" />
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			) : (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-16">
						<NoteIcon aria-hidden="true" className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
						<h3 className="mb-2 font-semibold text-lg">
							{searchQuery || statusFilter !== "all" ? (
								<Trans>Aucune candidature trouvée</Trans>
							) : (
								<Trans>Aucune candidature</Trans>
							)}
						</h3>
						<p className="mb-4 text-center text-muted-foreground">
							{searchQuery || statusFilter !== "all" ? (
								<Trans>Essaie de modifier la recherche ou le statut.</Trans>
							) : (
								<Trans>Ajoute tes candidatures pour suivre les relances et les réponses.</Trans>
							)}
						</p>
						{!searchQuery && statusFilter === "all" && (
							<Button onClick={() => setIsAddDialogOpen(true)}>
								<PlusIcon aria-hidden="true" className="mr-2 size-4" />
								<Trans>Ajouter une candidature</Trans>
							</Button>
						)}
					</CardContent>
				</Card>
			)}
		</AnimatePresence>
	);
}

export function CtaSection() {
	return (
		<Card className="mt-8 border-primary/20 bg-primary/5">
			<CardContent className="flex flex-col items-center py-8 text-center">
				<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
					<BriefcaseIcon aria-hidden="true" className="size-8 text-primary" weight="duotone" />
				</div>
				<h3 className="mb-2 font-bold text-2xl">
					<Trans>Trouve la prochaine offre à suivre</Trans>
				</h3>
				<p className="mb-6 max-w-md text-muted-foreground">
					<Trans>Consulte les offres partenaires et ajoute les candidatures importantes à ton tableau de suivi.</Trans>
				</p>
				{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
				<Link to={"/dashboard/jobs" as any}>
					<Button size="lg" className="gap-2">
						<Trans>Voir les offres</Trans>
						<CaretRightIcon aria-hidden="true" className="size-5" />
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}

export function ApplicationFormDialog({
	open,
	onOpenChange,
	editingApplicationId,
	form,
	onSubmitAdd,
	onSubmitUpdate,
	isSubmitting,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingApplicationId: string | null;
	form: UseFormReturn<ApplicationFormValues>;
	onSubmitAdd: (data: ApplicationFormValues) => void;
	onSubmitUpdate: (data: ApplicationFormValues) => void;
	isSubmitting: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{editingApplicationId ? <Trans>Modifier la candidature</Trans> : <Trans>Nouvelle candidature</Trans>}
					</DialogTitle>
					<DialogDescription>
						{editingApplicationId ? (
							<Trans>Mets à jour les informations et le statut de cette candidature.</Trans>
						) : (
							<Trans>Ajoute une candidature pour suivre la suite du processus.</Trans>
						)}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(editingApplicationId ? onSubmitUpdate : onSubmitAdd)}
						className="space-y-4 py-4"
					>
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="position"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Poste</Trans> *
										</FormLabel>
										<FormControl>
											<Input placeholder={t`Ex. : infirmier, technicien de laboratoire`} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="companyName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Entreprise</Trans> *
										</FormLabel>
										<FormControl>
											<Input placeholder={t`Ex. : CHU Ibn Sina`} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="location"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Ville</Trans>
										</FormLabel>
										<FormControl>
											<Input placeholder={t`Ex. : Rabat`} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="appliedAt"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Date de candidature</Trans>
										</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Statut</Trans>
									</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger aria-label={t`Statut de la candidature`}>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{(
												Object.entries(statusConfig) as [ApplicationStatus, (typeof statusConfig)[ApplicationStatus]][]
											).map(([key, config]) => {
												const StatusIcon = config.icon;
												return (
													<SelectItem key={key} value={key}>
														<div className="flex items-center gap-2">
															<StatusIcon aria-hidden="true" className="size-4" />
															{config.label}
														</div>
													</SelectItem>
												);
											})}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Notes</Trans>
									</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t`Notes personnelles : contact, prochaines étapes, relance prévue…`}
											rows={3}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="contactName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Contact</Trans>
										</FormLabel>
										<FormControl>
											<Input placeholder={t`Nom du recruteur ou responsable RH`} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="contactEmail"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Email du contact</Trans>
										</FormLabel>
										<FormControl>
											<Input type="email" placeholder={t`rh@entreprise.ma`} autoComplete="email" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="salary"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Salaire proposé</Trans>
									</FormLabel>
									<FormControl>
										<Input placeholder={t`Ex. : 8 000 - 10 000 DH`} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									<Trans>Annuler</Trans>
								</Button>
							</DialogClose>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting && <SpinnerIcon aria-hidden="true" className="mr-2 size-4 animate-spin" />}
								{editingApplicationId ? <Trans>Enregistrer</Trans> : <Trans>Ajouter</Trans>}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export function DeleteConfirmDialog({
	open,
	onOpenChange,
	onConfirm,
	isPending,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isPending: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Trans>Supprimer cette candidature ?</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Cette action est irréversible. La candidature sera supprimée définitivement.</Trans>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Annuler</Trans>
						</Button>
					</DialogClose>
					<Button variant="destructive" onClick={onConfirm} disabled={isPending}>
						{isPending && <SpinnerIcon aria-hidden="true" className="mr-2 size-4 animate-spin" />}
						<Trans>Supprimer</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
