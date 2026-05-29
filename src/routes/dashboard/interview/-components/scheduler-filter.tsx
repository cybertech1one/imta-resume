import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CalendarIcon, ClockIcon, FunnelIcon, MagnifyingGlassIcon, NoteIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INTERVIEW_STATUS, INTERVIEW_TYPES } from "./scheduler-config";
import type { InterviewStatus, InterviewType } from "./scheduler-types";

// ==================== FILTER BAR ====================

interface FilterBarProps {
	activeTab: "calendar" | "list" | "availability";
	onTabChange: (tab: "calendar" | "list" | "availability") => void;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	statusFilter: InterviewStatus | "all";
	onStatusFilterChange: (status: InterviewStatus | "all") => void;
	typeFilter: InterviewType | "all";
	onTypeFilterChange: (type: InterviewType | "all") => void;
}

export function FilterBar({
	activeTab: _activeTab,
	onTabChange: _onTabChange,
	searchQuery,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
	typeFilter,
	onTypeFilterChange,
}: FilterBarProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<TabsList className="bg-card">
				<TabsTrigger value="calendar" className="gap-2">
					<CalendarIcon className="size-4" />
					<Trans>Calendar</Trans>
				</TabsTrigger>
				<TabsTrigger value="list" className="gap-2">
					<NoteIcon className="size-4" />
					<Trans>List</Trans>
				</TabsTrigger>
				<TabsTrigger value="availability" className="gap-2">
					<ClockIcon className="size-4" />
					<Trans>Availability</Trans>
				</TabsTrigger>
			</TabsList>

			{/* Filters */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative">
					<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder={t`Search...`}
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="w-48 pl-9"
					/>
				</div>
				<Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as InterviewStatus | "all")}>
					<SelectTrigger className="w-40">
						<FunnelIcon className="mr-2 size-4" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							<Trans>All statuses</Trans>
						</SelectItem>
						{Object.entries(INTERVIEW_STATUS).map(([key, config]) => (
							<SelectItem key={key} value={key}>
								{config.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={typeFilter} onValueChange={(v) => onTypeFilterChange(v as InterviewType | "all")}>
					<SelectTrigger className="w-40">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							<Trans>All types</Trans>
						</SelectItem>
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
		</div>
	);
}
