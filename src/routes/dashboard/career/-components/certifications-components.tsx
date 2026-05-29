import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowClockwiseIcon,
	CalendarCheckIcon,
	CalendarIcon,
	CaretUpIcon,
	CertificateIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	ClockIcon,
	CoinIcon,
	CurrencyCircleDollarIcon,
	DownloadSimpleIcon,
	FunnelIcon,
	GearIcon,
	LightbulbIcon,
	MagnifyingGlassIcon,
	MedalIcon,
	PencilSimpleIcon,
	PlusCircleIcon,
	PlusIcon,
	RocketLaunchIcon,
	ShieldCheckIcon,
	StarIcon,
	TargetIcon,
	TrashIcon,
	TrendUpIcon,
	TrophyIcon,
	WarningCircleIcon,
	XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import type { UseFormReturn } from "react-hook-form";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/utils/style";

import type { CertificationFormValues } from "./certifications-config";
import { CATEGORY_CONFIG, STATUS_CONFIG } from "./certifications-config";
import type {
	CertificationCategory,
	CertificationStatus,
	DbCertification,
	RecommendedCertification,
} from "./certifications-types";
import { calculateDaysUntilExpiration, formatCurrency, getExpirationStatus } from "./certifications-utils";

// ── Radial Progress Chart ─────────────────────────────────────────────

function RadialProgressChart({
	progress,
	size = 120,
	strokeWidth = 10,
	label,
}: {
	progress: number;
	size?: number;
	strokeWidth?: number;
	label?: string;
}) {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (progress / 100) * circumference;

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					className="text-muted/30"
				/>
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: offset }}
					transition={{ duration: 1, ease: "easeOut" }}
					className="text-primary"
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="font-bold text-2xl">{progress}%</span>
				{label && <span className="text-muted-foreground text-xs">{label}</span>}
			</div>
		</div>
	);
}

// ── Expiration Countdown ──────────────────────────────────────────────

function ExpirationCountdown({ daysUntil }: { daysUntil: number | null }) {
	if (daysUntil === null) {
		return (
			<span className="text-muted-foreground text-sm">
				<Trans>No expiration</Trans>
			</span>
		);
	}

	const status = getExpirationStatus(daysUntil);
	const absValue = Math.abs(daysUntil);

	return (
		<div className={cn("flex items-center gap-1.5", status.color)}>
			{daysUntil < 0 ? <WarningCircleIcon className="size-4" weight="fill" /> : <ClockIcon className="size-4" />}
			<span className="font-medium text-sm">
				{daysUntil < 0 ? (
					<Trans>Expired {absValue} days ago</Trans>
				) : daysUntil === 0 ? (
					<Trans>Expires today</Trans>
				) : daysUntil === 1 ? (
					<Trans>Expires tomorrow</Trans>
				) : (
					<Trans>{absValue} days remaining</Trans>
				)}
			</span>
		</div>
	);
}

// ── Computed Statistics Type ──────────────────────────────────────────

export interface ComputedStatistics {
	total: number;
	active: number;
	expired: number;
	inProgress: number;
	planned: number;
	totalCost: number;
	expiringSoon: number;
}

// ── Hero Section ──────────────────────────────────────────────────────

export function HeroSection({ statistics }: { statistics: ComputedStatistics }) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 45 / 0.15) 0%, oklch(0.6 0.2 30 / 0.1) 50%, oklch(0.65 0.18 60 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-yellow-500/15 to-amber-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [0, -10, 0],
						opacity: [0.3, 0.5, 0.3],
					}}
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
					<CertificateIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Certification Management</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Certification Tracking</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Manage your professional certifications, track expiration dates, set up renewal reminders, and evaluate the
						return on investment of your training.
					</Trans>
				</motion.p>

				{/* Quick Stats */}
				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<CertificateIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{statistics.total}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Certifications</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<CheckCircleIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{statistics.active}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Active</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<WarningCircleIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{statistics.expiringSoon}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>To Renew</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-purple-500/10">
							<TrendUpIcon className="size-5 text-purple-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{formatCurrency(statistics.totalCost, "EUR")}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Investment</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ── Certification Form Dialog ─────────────────────────────────────────

interface CertificationFormDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	form: UseFormReturn<CertificationFormValues>;
	editingCertification: DbCertification | null;
	onSubmit: (data: CertificationFormValues) => void;
	isPending: boolean;
	resetForm: () => void;
}

function CertificationFormDialog({
	isOpen,
	onOpenChange,
	form,
	editingCertification,
	onSubmit,
	isPending,
	resetForm,
}: CertificationFormDialogProps) {
	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				onOpenChange(open);
				if (!open) resetForm();
			}}
		>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<PlusCircleIcon className="size-4" />
					<Trans>Add</Trans>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{editingCertification ? <Trans>Edit Certification</Trans> : <Trans>New Certification</Trans>}
					</DialogTitle>
					<DialogDescription>
						<Trans>Fill in your certification details</Trans>
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Name</Trans> *
										</FormLabel>
										<FormControl>
											<Input placeholder={t`Ex: ISO 45001 Lead Auditor`} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="issuer"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Issuing Organization</Trans> *
										</FormLabel>
										<FormControl>
											<Input placeholder={t`Ex: IRCA, PMI, NEBOSH`} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Category</Trans>
										</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{(Object.keys(CATEGORY_CONFIG) as CertificationCategory[]).map((cat) => (
													<SelectItem key={cat} value={cat}>
														{CATEGORY_CONFIG[cat].label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
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
												{(Object.keys(STATUS_CONFIG) as CertificationStatus[]).map((status) => (
													<SelectItem key={status} value={status}>
														{STATUS_CONFIG[status].label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="issueDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Date Obtained</Trans>
										</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="expiryDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Expiration Date</Trans>
										</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid gap-4 md:grid-cols-3">
							<FormField
								control={form.control}
								name="cost"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Cost</Trans>
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="currency"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Currency</Trans>
										</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="EUR">EUR</SelectItem>
												<SelectItem value="USD">USD</SelectItem>
												<SelectItem value="GBP">GBP</SelectItem>
												<SelectItem value="MAD">MAD</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="reminderDays"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Reminder (days)</Trans>
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="credentialId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Credential ID</Trans>
										</FormLabel>
										<FormControl>
											<Input placeholder={t`Ex: IRCA-45001-2024-1234`} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="credentialUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<Trans>Verification URL</Trans>
										</FormLabel>
										<FormControl>
											<Input placeholder="https://..." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Notes</Trans>
									</FormLabel>
									<FormControl>
										<Textarea placeholder={t`Describe the certification and its benefits...`} rows={3} {...field} />
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
							<Button type="submit" disabled={isPending}>
								{editingCertification ? (
									<>
										<CheckCircleIcon className="mr-2 size-4" />
										<Trans>Save</Trans>
									</>
								) : (
									<>
										<PlusIcon className="mr-2 size-4" />
										<Trans>Add</Trans>
									</>
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

// ── Inventory Actions Bar ─────────────────────────────────────────────

interface InventoryActionsBarProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	showFilters: boolean;
	onToggleFilters: () => void;
	onExport: () => void;
	formDialogProps: CertificationFormDialogProps;
}

export function InventoryActionsBar({
	searchQuery,
	onSearchChange,
	showFilters,
	onToggleFilters,
	onExport,
	formDialogProps,
}: InventoryActionsBarProps) {
	return (
		<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div className="flex flex-1 items-center gap-4">
				<div className="relative flex-1 md:max-w-sm">
					<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder={t`Search for a certification...`}
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Button variant="outline" size="icon" onClick={onToggleFilters} className={cn(showFilters && "bg-primary/10")}>
					<FunnelIcon className="size-4" />
				</Button>
			</div>
			<div className="flex gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline" size="icon" onClick={onExport}>
							<DownloadSimpleIcon className="size-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<Trans>Export</Trans>
					</TooltipContent>
				</Tooltip>
				<CertificationFormDialog {...formDialogProps} />
			</div>
		</div>
	);
}

// ── Inventory Filters ─────────────────────────────────────────────────

interface InventoryFiltersProps {
	showFilters: boolean;
	statusFilter: CertificationStatus | "all";
	categoryFilter: CertificationCategory | "all";
	onStatusFilterChange: (value: CertificationStatus | "all") => void;
	onCategoryFilterChange: (value: CertificationCategory | "all") => void;
	onReset: () => void;
}

export function InventoryFilters({
	showFilters,
	statusFilter,
	categoryFilter,
	onStatusFilterChange,
	onCategoryFilterChange,
	onReset,
}: InventoryFiltersProps) {
	return (
		<AnimatePresence>
			{showFilters && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					className="overflow-hidden"
				>
					<Card>
						<CardContent className="flex flex-wrap gap-4 p-4">
							<div className="space-y-2">
								<label className="font-medium text-sm">
									<Trans>Status</Trans>
								</label>
								<Select
									value={statusFilter}
									onValueChange={(v) => onStatusFilterChange(v as CertificationStatus | "all")}
								>
									<SelectTrigger className="w-40">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											<Trans>All</Trans>
										</SelectItem>
										{(Object.keys(STATUS_CONFIG) as CertificationStatus[]).map((status) => (
											<SelectItem key={status} value={status}>
												{STATUS_CONFIG[status].label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<label className="font-medium text-sm">
									<Trans>Category</Trans>
								</label>
								<Select
									value={categoryFilter}
									onValueChange={(v) => onCategoryFilterChange(v as CertificationCategory | "all")}
								>
									<SelectTrigger className="w-40">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											<Trans>All</Trans>
										</SelectItem>
										{(Object.keys(CATEGORY_CONFIG) as CertificationCategory[]).map((cat) => (
											<SelectItem key={cat} value={cat}>
												{CATEGORY_CONFIG[cat].label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex items-end">
								<Button variant="ghost" size="sm" onClick={onReset}>
									<XIcon className="mr-2 size-4" />
									<Trans>Reset</Trans>
								</Button>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// ── Certification Card ────────────────────────────────────────────────

interface CertificationCardProps {
	cert: DbCertification;
	index: number;
	onEdit: (cert: DbCertification) => void;
	onDelete: (certId: string) => void;
}

export function CertificationCard({ cert, index, onEdit, onDelete }: CertificationCardProps) {
	const categoryConfig = CATEGORY_CONFIG[(cert.category as CertificationCategory) || "hse"];
	const statusConfig = STATUS_CONFIG[cert.status];
	const CategoryIcon = categoryConfig?.icon || GearIcon;
	const StatusIcon = statusConfig.icon;
	const daysUntil = calculateDaysUntilExpiration(cert.expiryDate);

	return (
		<motion.div key={cert.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
			<Card
				className={cn(
					"h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
					statusConfig.color.includes("border") && statusConfig.color,
				)}
			>
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-2">
							<div className={cn("rounded-lg p-2", categoryConfig?.color || "bg-muted")}>
								<CategoryIcon className="size-4" weight="duotone" />
							</div>
							<Badge className={cn("gap-1", statusConfig.color)}>
								<StatusIcon className="size-3" weight="fill" />
								{statusConfig.label}
							</Badge>
						</div>
						<div className="flex gap-1">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="ghost" size="icon-sm" onClick={() => onEdit(cert)}>
										<PencilSimpleIcon className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<Trans>Edit</Trans>
								</TooltipContent>
							</Tooltip>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="ghost" size="icon-sm">
										<TrashIcon className="size-4 text-destructive" />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											<Trans>Delete this certification?</Trans>
										</AlertDialogTitle>
										<AlertDialogDescription>
											<Trans>
												This action is irreversible. The certification "{cert.name}" will be permanently deleted.
											</Trans>
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>
											<Trans>Cancel</Trans>
										</AlertDialogCancel>
										<AlertDialogAction onClick={() => onDelete(cert.id)}>
											<Trans>Delete</Trans>
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</div>
					<CardTitle className="mt-2 text-base leading-tight">{cert.name}</CardTitle>
					<CardDescription className="text-xs">{cert.issuer}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{cert.status === "completed" && cert.expiryDate && <ExpirationCountdown daysUntil={daysUntil} />}

					{cert.cost && cert.cost > 0 && (
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">
								<Trans>Cost</Trans>
							</span>
							<span className="font-medium">{formatCurrency(cert.cost, cert.currency || "EUR")}</span>
						</div>
					)}

					{cert.issueDate && (
						<div className="flex items-center gap-2 text-muted-foreground text-xs">
							<CalendarIcon className="size-3" />
							<Trans>Obtained on {formatDate(cert.issueDate)}</Trans>
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

// ── Inventory Empty State ─────────────────────────────────────────────

interface InventoryEmptyStateProps {
	hasFilters: boolean;
	onAdd: () => void;
}

export function InventoryEmptyState({ hasFilters, onAdd }: InventoryEmptyStateProps) {
	return (
		<Card className="border-dashed">
			<CardContent className="flex flex-col items-center py-12 text-center">
				<CertificateIcon className="mb-4 size-12 text-muted-foreground/50" />
				<h3 className="mb-2 font-medium text-lg">
					<Trans>No certifications found</Trans>
				</h3>
				<p className="mb-4 max-w-sm text-muted-foreground">
					{hasFilters ? (
						<Trans>No certifications match your search criteria.</Trans>
					) : (
						<Trans>Start by adding your certifications to track their validity and plan renewals.</Trans>
					)}
				</p>
				{!hasFilters && (
					<Button onClick={onAdd} className="gap-2">
						<PlusCircleIcon className="size-4" />
						<Trans>Add a Certification</Trans>
					</Button>
				)}
			</CardContent>
		</Card>
	);
}

// ── Expiration Tab Content ────────────────────────────────────────────

interface ExpirationTabProps {
	certifications: DbCertification[];
}

export function ExpirationTabContent({ certifications }: ExpirationTabProps) {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarCheckIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Expiration Calendar</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Track the expiration dates of your certifications</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{certifications.filter((c) => c.expiryDate).length === 0 ? (
						<div className="rounded-xl border border-dashed p-8 text-center">
							<CalendarCheckIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" />
							<p className="text-muted-foreground">
								<Trans>No certifications with expiration date.</Trans>
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{certifications
								.filter((c) => c.expiryDate)
								.sort((a, b) => {
									const daysA = calculateDaysUntilExpiration(a.expiryDate) ?? Infinity;
									const daysB = calculateDaysUntilExpiration(b.expiryDate) ?? Infinity;
									return daysA - daysB;
								})
								.map((cert) => {
									const daysUntil = calculateDaysUntilExpiration(cert.expiryDate);
									const categoryConfig = CATEGORY_CONFIG[(cert.category as CertificationCategory) || "hse"];
									const CategoryIcon = categoryConfig?.icon || GearIcon;

									return (
										<div
											key={cert.id}
											className={cn(
												"flex items-center gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50",
												daysUntil !== null && daysUntil <= 30 && "border-red-500/50 bg-red-500/5",
												daysUntil !== null && daysUntil > 30 && daysUntil <= 90 && "border-amber-500/50 bg-amber-500/5",
											)}
										>
											<div
												className={cn(
													"flex size-12 shrink-0 items-center justify-center rounded-lg",
													categoryConfig?.color || "bg-muted",
												)}
											>
												<CategoryIcon className="size-6" weight="duotone" />
											</div>
											<div className="min-w-0 flex-1">
												<h4 className="truncate font-medium">{cert.name}</h4>
												<p className="text-muted-foreground text-sm">{cert.issuer}</p>
											</div>
											<div className="text-right">
												<p className="font-medium">{formatDate(cert.expiryDate)}</p>
												<ExpirationCountdown daysUntil={daysUntil} />
											</div>
											<Button variant="outline" size="sm" className="shrink-0 gap-1">
												<ArrowClockwiseIcon className="size-4" />
												<Trans>Renew</Trans>
											</Button>
										</div>
									);
								})}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Expiration Timeline */}
			<ExpirationTimeline certifications={certifications} />
		</div>
	);
}

// ── Expiration Timeline ───────────────────────────────────────────────

function ExpirationTimeline({ certifications }: { certifications: DbCertification[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ClockIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Expiration Timeline</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{["expired", "30-days", "90-days", "valid"].map((period) => {
						const certs = certifications.filter((c) => {
							const days = calculateDaysUntilExpiration(c.expiryDate);
							if (period === "expired") return days !== null && days < 0;
							if (period === "30-days") return days !== null && days >= 0 && days <= 30;
							if (period === "90-days") return days !== null && days > 30 && days <= 90;
							if (period === "valid") return days === null || days > 90;
							return false;
						});

						const configMap = {
							expired: { label: t`Expired`, color: "bg-red-500", icon: WarningCircleIcon },
							"30-days": { label: t`Less than 30 days`, color: "bg-red-500", icon: ClockIcon },
							"90-days": { label: t`30-90 days`, color: "bg-amber-500", icon: ClockIcon },
							valid: { label: t`More than 90 days`, color: "bg-green-500", icon: CheckCircleIcon },
						};
						const config = configMap[period as keyof typeof configMap];

						const PeriodIcon = config.icon;

						return (
							<div key={period} className="flex items-center gap-4">
								<div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", config.color)}>
									<PeriodIcon className="size-5 text-white" weight="fill" />
								</div>
								<div className="flex-1">
									<p className="font-medium">{config.label}</p>
									<p className="text-muted-foreground text-sm">
										{certs.length} <Trans>certification(s)</Trans>
									</p>
								</div>
								<div className="flex -space-x-2">
									{certs.slice(0, 3).map((c) => (
										<div
											key={c.id}
											className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted"
										>
											<span className="font-bold text-xs">{c.name.charAt(0)}</span>
										</div>
									))}
									{certs.length > 3 && (
										<div className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
											<span className="font-bold text-xs">+{certs.length - 3}</span>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// ── ROI Tab Content ───────────────────────────────────────────────────

interface ROITabProps {
	certifications: DbCertification[];
	statistics: ComputedStatistics;
}

export function ROITabContent({ certifications, statistics }: ROITabProps) {
	return (
		<div className="space-y-6">
			{/* ROI Overview */}
			<div className="grid gap-6 md:grid-cols-3">
				<Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
					<CardContent className="p-6">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex size-12 items-center justify-center rounded-full bg-green-500/20">
								<CoinIcon className="size-6 text-green-500" weight="fill" />
							</div>
							<TrendUpIcon className="size-5 text-green-500" />
						</div>
						<p className="mb-1 font-bold text-3xl">{formatCurrency(statistics.totalCost, "EUR")}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Total Investment</Trans>
						</p>
					</CardContent>
				</Card>

				<Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
					<CardContent className="p-6">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex size-12 items-center justify-center rounded-full bg-purple-500/20">
								<TrendUpIcon className="size-6 text-purple-500" weight="fill" />
							</div>
							<CaretUpIcon className="size-5 text-purple-500" />
						</div>
						<p className="mb-1 font-bold text-3xl">{statistics.active}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Active Certifications</Trans>
						</p>
					</CardContent>
				</Card>

				<Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
					<CardContent className="p-6">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex size-12 items-center justify-center rounded-full bg-amber-500/20">
								<TargetIcon className="size-6 text-amber-500" weight="fill" />
							</div>
						</div>
						<p className="mb-1 font-bold text-3xl">
							{statistics.totalCost > 0 ? `${Math.round(statistics.active / (statistics.totalCost / 1000))}x` : "0x"}
						</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Estimated ROI</Trans>
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Cost Breakdown by Category */}
			<CostBreakdownCard certifications={certifications} totalCost={statistics.totalCost} />

			{/* Individual ROI Analysis */}
			<IndividualROICard certifications={certifications} />
		</div>
	);
}

// ── Cost Breakdown Card ───────────────────────────────────────────────

function CostBreakdownCard({ certifications, totalCost }: { certifications: DbCertification[]; totalCost: number }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CurrencyCircleDollarIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Cost Breakdown by Category</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{(Object.keys(CATEGORY_CONFIG) as CertificationCategory[]).map((cat) => {
						const config = CATEGORY_CONFIG[cat];
						const CategoryIcon = config.icon;
						const categoryCerts = certifications.filter((c) => c.category === cat);
						const catCost = categoryCerts.reduce((sum, c) => {
							const rate = c.currency === "USD" ? 0.92 : 1;
							return sum + (c.cost || 0) * rate;
						}, 0);
						const percentage = totalCost > 0 ? (catCost / totalCost) * 100 : 0;

						if (categoryCerts.length === 0) return null;

						return (
							<div key={cat} className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className={cn("rounded-lg p-1.5", config.color)}>
											<CategoryIcon className="size-4" />
										</div>
										<span className="font-medium">{config.label}</span>
										<Badge variant="secondary">{categoryCerts.length}</Badge>
									</div>
									<span className="font-bold">{formatCurrency(catCost, "EUR")}</span>
								</div>
								<Progress value={percentage} className="h-2" />
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// ── Individual ROI Card ───────────────────────────────────────────────

function IndividualROICard({ certifications }: { certifications: DbCertification[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ChartLineUpIcon className="size-5 text-primary" weight="duotone" />
					<Trans>ROI Analysis by Certification</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{certifications
						.filter((c) => c.cost && c.cost > 0)
						.sort((a, b) => (b.cost || 0) - (a.cost || 0))
						.map((cert) => {
							const categoryConfig = CATEGORY_CONFIG[(cert.category as CertificationCategory) || "hse"];
							const CategoryIcon = categoryConfig?.icon || GearIcon;

							return (
								<div
									key={cert.id}
									className="flex items-center gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50"
								>
									<div
										className={cn(
											"flex size-10 shrink-0 items-center justify-center rounded-lg",
											categoryConfig?.color || "bg-muted",
										)}
									>
										<CategoryIcon className="size-5" weight="duotone" />
									</div>
									<div className="min-w-0 flex-1">
										<h4 className="truncate font-medium">{cert.name}</h4>
										<p className="text-muted-foreground text-sm">{cert.issuer}</p>
									</div>
									<div className="text-right">
										<p className="font-medium">{formatCurrency(cert.cost || 0, cert.currency || "EUR")}</p>
										<p className="text-muted-foreground text-sm">
											<Trans>Cost</Trans>
										</p>
									</div>
								</div>
							);
						})}
				</div>
			</CardContent>
		</Card>
	);
}

// ── Recommendations Tab Content ───────────────────────────────────────

interface RecommendationsTabProps {
	filteredRecommendations: RecommendedCertification[];
	industries: string[];
	selectedIndustry: string;
	onIndustryChange: (industry: string) => void;
	onAddRecommended: (rec: RecommendedCertification) => void;
}

export function RecommendationsTabContent({
	filteredRecommendations,
	industries,
	selectedIndustry,
	onIndustryChange,
	onAddRecommended,
}: RecommendationsTabProps) {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<LightbulbIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Recommended Certifications</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Discover certifications suited to your industry</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Industry Filter */}
					<div className="flex flex-wrap gap-2">
						<Button
							variant={selectedIndustry === "all" ? "default" : "outline"}
							size="sm"
							onClick={() => onIndustryChange("all")}
						>
							<Trans>All</Trans>
						</Button>
						{industries.map((ind) => (
							<Button
								key={ind}
								variant={selectedIndustry === ind ? "default" : "outline"}
								size="sm"
								onClick={() => onIndustryChange(ind)}
							>
								{ind}
							</Button>
						))}
					</div>

					{/* Recommendations Grid */}
					{filteredRecommendations.length === 0 ? (
						<div className="rounded-xl border border-green-500/50 border-dashed bg-green-500/5 p-6 text-center">
							<CheckCircleIcon className="mx-auto mb-2 size-10 text-green-500" weight="fill" />
							<p className="font-medium text-green-700 dark:text-green-400">
								<Trans>Excellent! You already have all recommended certifications for this industry.</Trans>
							</p>
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{filteredRecommendations.map((rec, index) => (
								<RecommendationCard key={rec.id} rec={rec} index={index} onAdd={onAddRecommended} />
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// ── Recommendation Card ───────────────────────────────────────────────

function RecommendationCard({
	rec,
	index,
	onAdd,
}: {
	rec: RecommendedCertification;
	index: number;
	onAdd: (rec: RecommendedCertification) => void;
}) {
	const categoryConfig = CATEGORY_CONFIG[rec.category];
	const CategoryIcon = categoryConfig.icon;

	return (
		<motion.div key={rec.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
			<Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
				<CardHeader className="pb-2">
					<div className="flex items-center justify-between">
						<div className={cn("rounded-lg p-2", categoryConfig.color)}>
							<CategoryIcon className="size-5" weight="duotone" />
						</div>
						<Badge
							variant={rec.demandLevel === "high" ? "default" : "secondary"}
							className={cn(rec.demandLevel === "high" && "bg-green-500")}
						>
							{rec.demandLevel === "high" && <Trans>High demand</Trans>}
							{rec.demandLevel === "medium" && <Trans>Medium demand</Trans>}
							{rec.demandLevel === "low" && <Trans>Low demand</Trans>}
						</Badge>
					</div>
					<CardTitle className="mt-2 text-base">{rec.name}</CardTitle>
					<CardDescription className="text-xs">{rec.issuer}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="line-clamp-2 text-muted-foreground text-sm">{rec.description}</p>

					<div className="flex flex-wrap gap-1">
						{rec.industries.slice(0, 3).map((ind) => (
							<Badge key={ind} variant="outline" className="text-xs">
								{ind}
							</Badge>
						))}
					</div>

					<div className="grid grid-cols-2 gap-2 text-sm">
						<div>
							<p className="text-muted-foreground">
								<Trans>Average cost</Trans>
							</p>
							<p className="font-medium">{formatCurrency(rec.averageCost, rec.currency)}</p>
						</div>
						<div>
							<p className="text-muted-foreground">
								<Trans>Salary impact</Trans>
							</p>
							<p className="font-medium text-green-600">+{rec.estimatedSalaryIncrease}%</p>
						</div>
					</div>

					<div className="flex items-center gap-2 text-sm">
						<span className="text-muted-foreground">
							<Trans>Difficulty:</Trans>
						</span>
						<Badge
							variant="outline"
							className={cn(
								rec.difficulty === "beginner" && "border-green-500/50 text-green-600",
								rec.difficulty === "intermediate" && "border-amber-500/50 text-amber-600",
								rec.difficulty === "advanced" && "border-red-500/50 text-red-600",
							)}
						>
							{rec.difficulty === "beginner" && <Trans>Beginner</Trans>}
							{rec.difficulty === "intermediate" && <Trans>Intermediate</Trans>}
							{rec.difficulty === "advanced" && <Trans>Advanced</Trans>}
						</Badge>
					</div>

					<Button size="sm" className="w-full gap-1" onClick={() => onAdd(rec)}>
						<PlusIcon className="size-4" />
						<Trans>Add to my goals</Trans>
					</Button>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// ── Statistics Tab Content ────────────────────────────────────────────

interface StatisticsTabProps {
	certifications: DbCertification[];
	statistics: ComputedStatistics;
	certsByCategory: Record<CertificationCategory, number>;
}

export function StatisticsTabContent({ certifications, statistics, certsByCategory }: StatisticsTabProps) {
	return (
		<div className="space-y-6">
			{/* Overview Stats */}
			<StatisticsOverviewCards statistics={statistics} />

			{/* Distribution by Category */}
			<CategoryDistributionCard statistics={statistics} certsByCategory={certsByCategory} />

			{/* Status Distribution */}
			<StatusDistributionCard certifications={certifications} />

			{/* Achievement Badges */}
			<AchievementBadgesCard statistics={statistics} />
		</div>
	);
}

// ── Statistics Overview Cards ─────────────────────────────────────────

function StatisticsOverviewCards({ statistics }: { statistics: ComputedStatistics }) {
	const stats = [
		{
			label: t`Total`,
			value: statistics.total,
			icon: CertificateIcon,
			color: "bg-primary/10 text-primary",
		},
		{
			label: t`Active`,
			value: statistics.active,
			icon: CheckCircleIcon,
			color: "bg-green-100 text-green-600 dark:bg-green-900/30",
		},
		{
			label: t`In Progress`,
			value: statistics.inProgress,
			icon: ClockIcon,
			color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
		},
		{
			label: t`Planned`,
			value: statistics.planned,
			icon: CalendarIcon,
			color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
		},
	];

	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			{stats.map((stat, index) => {
				const StatIcon = stat.icon;
				return (
					<motion.div
						key={stat.label}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
							<CardContent className="p-6">
								<div className="mb-4 flex items-center justify-between">
									<div className={cn("flex size-12 items-center justify-center rounded-xl", stat.color)}>
										<StatIcon className="size-6" weight="duotone" />
									</div>
								</div>
								<p className="font-bold text-4xl">{stat.value}</p>
								<p className="text-muted-foreground text-sm">{stat.label}</p>
							</CardContent>
						</Card>
					</motion.div>
				);
			})}
		</div>
	);
}

// ── Category Distribution Card ────────────────────────────────────────

function CategoryDistributionCard({
	statistics,
	certsByCategory,
}: {
	statistics: ComputedStatistics;
	certsByCategory: Record<CertificationCategory, number>;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ChartBarIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Distribution by Category</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-6 md:grid-cols-2">
					{/* Bar Chart */}
					<div className="space-y-4">
						{(Object.keys(CATEGORY_CONFIG) as CertificationCategory[]).map((cat) => {
							const config = CATEGORY_CONFIG[cat];
							const CategoryIcon = config.icon;
							const count = certsByCategory[cat];
							const maxCount = Math.max(...Object.values(certsByCategory), 1);
							const percentage = (count / maxCount) * 100;

							return (
								<div key={cat} className="space-y-2">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className={cn("rounded-lg p-1.5", config.color)}>
												<CategoryIcon className="size-4" />
											</div>
											<span className="font-medium text-sm">{config.label}</span>
										</div>
										<span className="font-bold">{count}</span>
									</div>
									<div className="h-3 overflow-hidden rounded-full bg-muted">
										<motion.div
											initial={{ width: 0 }}
											animate={{ width: `${percentage}%` }}
											transition={{ duration: 0.8, delay: 0.2 }}
											className={cn("h-full rounded-full", config.color.split(" ")[0])}
										/>
									</div>
								</div>
							);
						})}
					</div>

					{/* Radial Chart */}
					<div className="flex items-center justify-center">
						<RadialProgressChart
							progress={Math.round((statistics.active / Math.max(statistics.total, 1)) * 100)}
							size={180}
							strokeWidth={15}
							label={t`Active`}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// ── Status Distribution Card ──────────────────────────────────────────

function StatusDistributionCard({ certifications }: { certifications: DbCertification[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TargetIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Distribution by Status</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-4">
					{(Object.keys(STATUS_CONFIG) as CertificationStatus[]).map((status) => {
						const config = STATUS_CONFIG[status];
						const StatusIcon = config.icon;
						const count = certifications.filter((c) => c.status === status).length;

						return (
							<Card key={status} className={cn("border", config.color)}>
								<CardContent className="p-4 text-center">
									<div className="mb-2 flex justify-center">
										<StatusIcon className="size-8" weight="fill" />
									</div>
									<p className="font-bold text-3xl">{count}</p>
									<p className="text-sm">{config.label}</p>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// ── Achievement Badges Card ───────────────────────────────────────────

function AchievementBadgesCard({ statistics }: { statistics: ComputedStatistics }) {
	const badges = [
		{
			icon: StarIcon,
			label: t`First Step`,
			achieved: statistics.total >= 1,
			desc: t`Obtain 1 certification`,
		},
		{
			icon: MedalIcon,
			label: t`Collector`,
			achieved: statistics.total >= 5,
			desc: t`Obtain 5 certifications`,
		},
		{
			icon: TrophyIcon,
			label: t`Expert`,
			achieved: statistics.active >= 3,
			desc: t`3 active certifications`,
		},
		{
			icon: RocketLaunchIcon,
			label: t`Ambitious`,
			achieved: statistics.inProgress >= 1,
			desc: t`1 certification in progress`,
		},
		{
			icon: ShieldCheckIcon,
			label: t`Vigilant`,
			achieved: statistics.expiringSoon === 0 && statistics.active >= 1,
			desc: t`No upcoming expiration`,
		},
	];

	return (
		<Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrophyIcon className="size-5 text-amber-500" weight="fill" />
					<Trans>Achievement Badges</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap justify-center gap-4">
					{badges.map((badge, index) => {
						const BadgeIcon = badge.icon;
						return (
							<Tooltip key={index}>
								<TooltipTrigger>
									<div
										className={cn(
											"flex size-20 flex-col items-center justify-center rounded-full border-2 transition-all",
											badge.achieved
												? "border-amber-500 bg-amber-500/20"
												: "border-muted bg-muted/30 opacity-50 grayscale",
										)}
									>
										<BadgeIcon
											className={cn("size-8", badge.achieved ? "text-amber-500" : "text-muted-foreground")}
											weight={badge.achieved ? "fill" : "regular"}
										/>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p className="font-medium">{badge.label}</p>
									<p className="text-muted-foreground text-xs">{badge.desc}</p>
								</TooltipContent>
							</Tooltip>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
