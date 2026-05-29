import { cn } from "@/utils/style";
import { Card, CardContent, CardHeader } from "./card";
import { Skeleton } from "./skeleton";

// Dashboard stat card skeleton
export function StatCardSkeleton({ className }: { className?: string }) {
	return (
		<Card className={cn("", className)}>
			<CardHeader className="pb-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="mt-2 h-8 w-16" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-3 w-20" />
			</CardContent>
		</Card>
	);
}

// Row of stat cards
export function StatCardsRowSkeleton({ count = 4 }: { count?: number }) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{Array.from({ length: count }).map((_, i) => (
				<StatCardSkeleton key={i} />
			))}
		</div>
	);
}

// Content card skeleton with title and description
export function ContentCardSkeleton({ className }: { className?: string }) {
	return (
		<Card className={className}>
			<CardHeader>
				<Skeleton className="h-5 w-48" />
				<Skeleton className="mt-2 h-4 w-32" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-20 w-full" />
			</CardContent>
		</Card>
	);
}

// List item skeleton
export function ListItemSkeleton({ hasAvatar = false }: { hasAvatar?: boolean }) {
	return (
		<div className="flex items-center gap-3 p-3">
			{hasAvatar && <Skeleton className="size-10 rounded-full" />}
			<div className="flex-1 space-y-2">
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-3 w-1/2" />
			</div>
		</div>
	);
}

// List skeleton
export function ListSkeleton({ count = 5, hasAvatar = false }: { count?: number; hasAvatar?: boolean }) {
	return (
		<div className="divide-y">
			{Array.from({ length: count }).map((_, i) => (
				<ListItemSkeleton key={i} hasAvatar={hasAvatar} />
			))}
		</div>
	);
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
	return (
		<div className="rounded-md border">
			{/* Header */}
			<div className="border-b bg-muted/50 p-4">
				<div className="flex gap-4">
					{Array.from({ length: columns }).map((_, i) => (
						<Skeleton key={i} className="h-4 flex-1" />
					))}
				</div>
			</div>
			{/* Rows */}
			{Array.from({ length: rows }).map((_, rowIndex) => (
				<div key={rowIndex} className="flex gap-4 border-b p-4 last:border-b-0">
					{Array.from({ length: columns }).map((_, colIndex) => (
						<Skeleton key={colIndex} className="h-4 flex-1" />
					))}
				</div>
			))}
		</div>
	);
}

// Resume card skeleton
export function ResumeCardSkeleton() {
	return (
		<Card className="overflow-hidden">
			<div className="aspect-[3/4] bg-muted">
				<Skeleton className="size-full" />
			</div>
			<CardContent className="p-4">
				<Skeleton className="h-5 w-3/4" />
				<Skeleton className="mt-2 h-4 w-1/2" />
				<div className="mt-4 flex gap-2">
					<Skeleton className="h-8 w-20" />
					<Skeleton className="h-8 w-20" />
				</div>
			</CardContent>
		</Card>
	);
}

// Resume cards grid skeleton (legacy - uses ResumeCardSkeleton)
export function ResumeCardsGridSkeleton({ count = 6 }: { count?: number }) {
	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: count }).map((_, i) => (
				<ResumeCardSkeleton key={i} />
			))}
		</div>
	);
}

// Form skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
	return (
		<div className="space-y-6">
			{Array.from({ length: fields }).map((_, i) => (
				<div key={i} className="space-y-2">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-10 w-full" />
				</div>
			))}
			<Skeleton className="h-10 w-32" />
		</div>
	);
}

// Chart skeleton
export function ChartSkeleton({ className, height = "h-64" }: { className?: string; height?: string }) {
	return (
		<Card className={className}>
			<CardHeader>
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-4 w-48" />
			</CardHeader>
			<CardContent>
				<Skeleton className={cn("w-full", height)} />
			</CardContent>
		</Card>
	);
}

// Profile skeleton
export function ProfileSkeleton() {
	return (
		<div className="flex items-center gap-4">
			<Skeleton className="size-16 rounded-full" />
			<div className="space-y-2">
				<Skeleton className="h-6 w-40" />
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-4 w-48" />
			</div>
		</div>
	);
}

// Navigation/sidebar skeleton
export function SidebarSkeleton() {
	return (
		<div className="space-y-4 p-4">
			<Skeleton className="h-8 w-full" />
			<div className="space-y-2">
				{Array.from({ length: 6 }).map((_, i) => (
					<Skeleton key={i} className="h-10 w-full" />
				))}
			</div>
			<div className="pt-4">
				<Skeleton className="h-4 w-20" />
				<div className="mt-2 space-y-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-8 w-full" />
					))}
				</div>
			</div>
		</div>
	);
}

// Full page loading skeleton
export function PageSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-64" />
				</div>
				<Skeleton className="h-10 w-32" />
			</div>

			{/* Stats */}
			<StatCardsRowSkeleton />

			{/* Content */}
			<div className="grid gap-6 lg:grid-cols-2">
				<ChartSkeleton />
				<ContentCardSkeleton />
			</div>

			{/* Table */}
			<Card>
				<CardHeader>
					<Skeleton className="h-5 w-32" />
				</CardHeader>
				<CardContent>
					<TableSkeleton />
				</CardContent>
			</Card>
		</div>
	);
}

// AI feature loading skeleton
export function AILoadingSkeleton() {
	return (
		<div className="flex flex-col items-center justify-center space-y-4 p-8">
			<div className="relative">
				<Skeleton className="size-16 rounded-full" />
				<div className="absolute inset-0 animate-ping rounded-full bg-purple-200 opacity-75" />
			</div>
			<Skeleton className="h-4 w-48" />
			<Skeleton className="h-3 w-32" />
		</div>
	);
}

// Interview session skeleton
export function InterviewSessionSkeleton() {
	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Skeleton className="size-12 rounded-full" />
				<div className="space-y-2">
					<Skeleton className="h-5 w-40" />
					<Skeleton className="h-4 w-24" />
				</div>
			</div>
			<Card>
				<CardContent className="p-6">
					<div className="space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="space-y-2">
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-16 w-full" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// Resume grid skeleton - matches the resume card layout
export function ResumeGridSkeleton({ count = 4 }: { count?: number }) {
	return (
		<div className="grid 3xl:grid-cols-6 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="group relative overflow-hidden rounded-xl border bg-card">
					{/* Thumbnail area */}
					<div className="relative aspect-[3/4] overflow-hidden bg-muted">
						<Skeleton className="size-full" />
					</div>
					{/* Card footer */}
					<div className="p-4">
						<Skeleton className="mb-2 h-5 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
						<div className="mt-3 flex gap-1">
							<Skeleton className="h-5 w-14 rounded-full" />
							<Skeleton className="h-5 w-12 rounded-full" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

// Resume list skeleton - matches the list view layout
export function ResumeListSkeleton({ count = 5 }: { count?: number }) {
	return (
		<div className="flex flex-col gap-y-1">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="flex h-12 items-center gap-x-4 rounded-lg px-4">
					<Skeleton className="size-3 rounded-full" />
					<Skeleton className="h-4 w-48 sm:w-80" />
					<Skeleton className="ml-auto hidden h-3 w-40 sm:block" />
					<Skeleton className="size-8 rounded-md" />
				</div>
			))}
		</div>
	);
}

// Analytics summary cards skeleton
export function AnalyticsSummarySkeleton({ count = 4 }: { count?: number }) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{Array.from({ length: count }).map((_, i) => (
				<Card key={i}>
					<CardContent className="p-6">
						<div className="flex items-center gap-3">
							<Skeleton className="size-10 rounded-lg" />
							<div className="space-y-2">
								<Skeleton className="h-7 w-20" />
								<Skeleton className="h-4 w-28" />
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

// Chart with axis skeleton
export function ChartWithAxisSkeleton({ className, height = "h-72" }: { className?: string; height?: string }) {
	return (
		<Card className={className}>
			<CardHeader>
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-4 w-48" />
			</CardHeader>
			<CardContent>
				<div className={cn("relative w-full", height)}>
					{/* Y-axis labels */}
					<div className="absolute top-0 left-0 flex h-full w-8 flex-col justify-between py-2">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="h-3 w-6" />
						))}
					</div>
					{/* Chart area */}
					<div className="ml-10 flex h-full items-end gap-1">
						{[45, 72, 35, 58, 80, 42, 65, 53, 75, 38, 60, 48].map((h, i) => (
							<div key={i} className="flex-1">
								<Skeleton className="w-full rounded-t" style={{ height: `${h}%` }} />
							</div>
						))}
					</div>
					{/* X-axis labels */}
					<div className="mt-2 ml-10 flex justify-between">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="h-3 w-8" />
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// Dashboard page skeleton with stats, charts, and lists
export function DashboardPageSkeleton() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="space-y-2">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-72" />
			</div>

			{/* Stats row */}
			<AnalyticsSummarySkeleton count={4} />

			{/* Charts row */}
			<div className="grid gap-6 lg:grid-cols-2">
				<ChartWithAxisSkeleton />
				<ChartWithAxisSkeleton />
			</div>

			{/* List section */}
			<Card>
				<CardHeader>
					<Skeleton className="h-5 w-40" />
				</CardHeader>
				<CardContent>
					<ListSkeleton count={5} />
				</CardContent>
			</Card>
		</div>
	);
}

// Builder sidebar skeleton
export function BuilderSidebarSkeleton() {
	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="border-b p-4">
				<Skeleton className="h-6 w-32" />
			</div>
			{/* Tabs */}
			<div className="flex gap-2 border-b p-2">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className="h-8 w-20" />
				))}
			</div>
			{/* Content */}
			<div className="flex-1 space-y-4 p-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="space-y-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-10 w-full" />
					</div>
				))}
			</div>
		</div>
	);
}

// Builder artboard skeleton (resume preview area)
export function BuilderArtboardSkeleton() {
	return (
		<div className="flex size-full items-center justify-center bg-muted/30">
			<div className="aspect-[8.5/11] w-[600px] max-w-full rounded-lg bg-white p-8 shadow-xl dark:bg-zinc-900">
				{/* Header section */}
				<div className="mb-6 text-center">
					<Skeleton className="mx-auto mb-2 h-8 w-48" />
					<Skeleton className="mx-auto h-4 w-64" />
				</div>
				{/* Content sections */}
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="mb-6">
						<Skeleton className="mb-3 h-5 w-32" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-5/6" />
							<Skeleton className="h-4 w-4/6" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// Full builder page skeleton
export function BuilderPageSkeleton() {
	return (
		<div className="flex h-svh flex-col">
			{/* Header */}
			<div className="flex h-14 items-center justify-between border-b px-4">
				<div className="flex items-center gap-4">
					<Skeleton className="size-8 rounded" />
					<Skeleton className="h-5 w-32" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-24" />
					<Skeleton className="size-8 rounded" />
				</div>
			</div>
			{/* Main content */}
			<div className="flex flex-1">
				{/* Left sidebar */}
				<div className="hidden w-80 border-r lg:block">
					<BuilderSidebarSkeleton />
				</div>
				{/* Artboard */}
				<div className="flex-1">
					<BuilderArtboardSkeleton />
				</div>
				{/* Right sidebar */}
				<div className="hidden w-80 border-l lg:block">
					<BuilderSidebarSkeleton />
				</div>
			</div>
		</div>
	);
}

// Career assessment skeleton
export function CareerAssessmentSkeleton() {
	return (
		<div className="space-y-6">
			{/* Progress bar */}
			<Card>
				<CardContent className="py-4">
					<div className="mb-4 flex items-center justify-between">
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-6 w-12" />
					</div>
					<Skeleton className="h-3 w-full" />
				</CardContent>
			</Card>
			{/* Question card */}
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-24" />
					<Skeleton className="mt-2 h-8 w-3/4" />
				</CardHeader>
				<CardContent className="space-y-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-16 w-full rounded-xl" />
					))}
				</CardContent>
			</Card>
		</div>
	);
}

// Market insights skeleton
export function MarketInsightsSkeleton({ count = 4 }: { count?: number }) {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			{Array.from({ length: count }).map((_, i) => (
				<Card key={i} className="h-full">
					<CardContent className="p-6">
						<div className="mb-4 flex items-center justify-between">
							<Skeleton className="size-12 rounded-xl" />
							<Skeleton className="h-5 w-16 rounded-full" />
						</div>
						<Skeleton className="mb-1 h-4 w-24" />
						<Skeleton className="mb-2 h-8 w-20" />
						<Skeleton className="h-4 w-full" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}
