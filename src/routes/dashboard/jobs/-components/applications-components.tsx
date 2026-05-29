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
import { formatDate } from "@/utils/format-date";
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

export function LoadingState() {
	return (
		<div className="flex items-center justify-center py-16">
			<SpinnerIcon className="size-8 animate-spin text-primary" />
		</div>
	);
}

export function ErrorState({ error }: { error: Error | null }) {
	return (
		<Card className="border-destructive">
			<CardContent className="flex flex-col items-center justify-center py-16">
				<XCircleIcon className="mb-4 size-16 text-destructive" weight="duotone" />
				<h3 className="mb-2 font-semibold text-lg">
					<Trans>Loading error</Trans>
				</h3>
				<p className="text-center text-muted-foreground">
					{error?.message || <Trans>Unable to load your applications</Trans>}
				</p>
			</CardContent>
		</Card>
	);
}

export function HeroSection({ stats }: { stats: StatsData }) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.65 0.18 280 / 0.15) 0%, oklch(0.6 0.2 320 / 0.1) 50%, oklch(0.7 0.15 260 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/10 blur-3xl"
					animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<NoteIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Career Tracking</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>My Applications</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>Track all your applications in one place. Manage your interviews, notes, and next steps.</Trans>
				</motion.p>

				<motion.div
					className="grid grid-cols-2 gap-4 sm:grid-cols-4"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl">{stats.total}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Total</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-blue-600 dark:text-blue-400">{stats.active}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Active</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-purple-600 dark:text-purple-400">{stats.interviews}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Interviews</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-green-600 dark:text-green-400">{stats.offers}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Offers</Trans>
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
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex flex-1 flex-wrap items-center gap-4">
						<div className="relative min-w-[200px] flex-1 lg:max-w-xs">
							<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder={t`Search...`}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						<Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ApplicationStatus | "all")}>
							<SelectTrigger className="w-[180px]">
								<FunnelIcon className="mr-2 size-4" />
								<SelectValue placeholder={t`Filter by status`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									<Trans>All statuses</Trans>
								</SelectItem>
								{(Object.entries(statusConfig) as [ApplicationStatus, (typeof statusConfig)[ApplicationStatus]][]).map(
									([key, config]) => {
										const StatusIcon = config.icon;
										return (
											<SelectItem key={key} value={key}>
												<div className="flex items-center gap-2">
													<StatusIcon className="size-4" />
													{config.label}
												</div>
											</SelectItem>
										);
									},
								)}
							</SelectContent>
						</Select>
					</div>

					<Button className="gap-2" onClick={onAddClick}>
						<PlusIcon className="size-4" />
						<Trans>New application</Trans>
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
								<Card className="group transition-all hover:shadow-md">
									<CardContent className="p-4 md:p-6">
										<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
											<div className="flex-1 space-y-2">
												<div className="flex flex-wrap items-center gap-2">
													<h3 className="font-semibold text-lg">{app.position}</h3>
													<Badge className={cn(status.bgColor, status.color)}>
														<StatusIcon className="mr-1 size-3" />
														{status.label}
													</Badge>
												</div>
												<div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
													<span className="flex items-center gap-1">
														<BuildingsIcon className="size-4" />
														{app.companyName}
													</span>
													{app.location && (
														<span className="flex items-center gap-1">
															<BriefcaseIcon className="size-4" />
															{app.location}
														</span>
													)}
													{app.appliedAt && (
														<span className="flex items-center gap-1">
															<CalendarIcon className="size-4" />
															{getDaysAgo(app.appliedAt)}
														</span>
													)}
												</div>
												{app.notes && <p className="line-clamp-2 text-muted-foreground text-sm">{app.notes}</p>}
												{app.deadline && (
													<div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
														<ClockIcon className="size-4 text-primary" />
														<span className="font-medium text-primary text-sm">
															<Trans>Deadline:</Trans> {formatDate(app.deadline)}
														</span>
													</div>
												)}
											</div>

											<div className="flex items-center gap-2">
												<Button variant="outline" size="sm" onClick={() => openEditDialog(app)}>
													<PencilSimpleIcon className="size-4" />
												</Button>
												<Button
													variant="outline"
													size="sm"
													className="text-red-600 hover:bg-red-50 hover:text-red-700"
													onClick={() => setDeleteConfirmId(app.id)}
												>
													<TrashIcon className="size-4" />
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
						<NoteIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
						<h3 className="mb-2 font-semibold text-lg">
							{searchQuery || statusFilter !== "all" ? (
								<Trans>No applications found</Trans>
							) : (
								<Trans>No applications</Trans>
							)}
						</h3>
						<p className="mb-4 text-center text-muted-foreground">
							{searchQuery || statusFilter !== "all" ? (
								<Trans>Try changing your filters</Trans>
							) : (
								<Trans>Start tracking your applications</Trans>
							)}
						</p>
						{!searchQuery && statusFilter === "all" && (
							<Button onClick={() => setIsAddDialogOpen(true)}>
								<PlusIcon className="mr-2 size-4" />
								<Trans>Add an application</Trans>
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
		<Card className="mt-8 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
			<CardContent className="flex flex-col items-center py-8 text-center">
				<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
					<BriefcaseIcon className="size-8 text-primary" weight="duotone" />
				</div>
				<h3 className="mb-2 font-bold text-2xl">
					<Trans>Search for new opportunities</Trans>
				</h3>
				<p className="mb-6 max-w-md text-muted-foreground">
					<Trans>Explore available job offers and find your next professional challenge.</Trans>
				</p>
				{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
				<Link to={"/dashboard/jobs" as any}>
					<Button size="lg" className="gap-2">
						<Trans>View offers</Trans>
						<CaretRightIcon className="size-5" />
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
						{editingApplicationId ? <Trans>Edit application</Trans> : <Trans>New application</Trans>}
					</DialogTitle>
					<DialogDescription>
						{editingApplicationId ? (
							<Trans>Update the information for your application</Trans>
						) : (
							<Trans>Add a new application to track</Trans>
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
											<Trans>Position</Trans> *
										</FormLabel>
										<FormControl>
											<Input placeholder={t`E.g.: Nurse`} {...field} />
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
											<Trans>Company</Trans> *
										</FormLabel>
										<FormControl>
											<Input placeholder={t`E.g.: CHU Ibn Sina`} {...field} />
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
											<Trans>City</Trans>
										</FormLabel>
										<FormControl>
											<Input placeholder={t`Ex: Rabat`} {...field} />
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
											<Trans>Application date</Trans>
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
										<Trans>Status</Trans>
									</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
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
															<StatusIcon className="size-4" />
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
										<Textarea placeholder={t`Personal notes about this application...`} rows={3} {...field} />
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
											<Input placeholder={t`Recruiter name`} {...field} />
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
											<Trans>Email contact</Trans>
										</FormLabel>
										<FormControl>
											<Input type="email" placeholder={t`recruiter@company.com`} {...field} />
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
										<Trans>Proposed salary</Trans>
									</FormLabel>
									<FormControl>
										<Input placeholder={t`E.g.: 8000 - 10000 DH`} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									<Trans>Cancel</Trans>
								</Button>
							</DialogClose>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting && <SpinnerIcon className="mr-2 size-4 animate-spin" />}
								{editingApplicationId ? <Trans>Update</Trans> : <Trans>Add</Trans>}
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
						<Trans>Delete this application?</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>This action is irreversible. The application will be permanently deleted.</Trans>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							<Trans>Cancel</Trans>
						</Button>
					</DialogClose>
					<Button variant="destructive" onClick={onConfirm} disabled={isPending}>
						{isPending && <SpinnerIcon className="mr-2 size-4 animate-spin" />}
						<Trans>Delete</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
