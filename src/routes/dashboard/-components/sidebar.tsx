import type { MessageDescriptor } from "@lingui/core";
import { msg, t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
	BellIcon,
	BookOpenIcon,
	BrainIcon,
	BriefcaseIcon,
	BuildingsIcon,
	CalendarCheckIcon,
	CalendarIcon,
	CaretDownIcon,
	ChartBarIcon,
	ChartLineUpIcon,
	ChartPieSliceIcon,
	ChatCircleDotsIcon,
	ChatsCircleIcon,
	CheckSquareIcon,
	ClipboardTextIcon,
	ClockIcon,
	CompassIcon,
	CurrencyCircleDollarIcon,
	DatabaseIcon,
	EnvelopeSimpleIcon,
	FileTextIcon,
	GaugeIcon,
	GearSixIcon,
	GraduationCapIcon,
	HeartIcon,
	KeyboardIcon,
	KeyIcon,
	LightbulbIcon,
	ListChecksIcon,
	MagnifyingGlassIcon,
	MedalIcon,
	MicrophoneIcon,
	NoteIcon,
	NotePencilIcon,
	PathIcon,
	PencilLineIcon,
	QuestionIcon,
	ReadCvLogoIcon,
	RobotIcon,
	ScalesIcon,
	ShieldCheckIcon,
	SparkleIcon,
	StarIcon,
	TargetIcon,
	ToolboxIcon,
	TrophyIcon,
	UserCircleIcon,
	UsersIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useKeyboardShortcuts } from "@/components/keyboard-shortcuts-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BrandIcon } from "@/components/ui/brand-icon";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copyright } from "@/components/ui/copyright";
import { Kbd } from "@/components/ui/kbd";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail,
	SidebarSeparator,
	useSidebarState,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UserDropdownMenu } from "@/components/user/dropdown-menu";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { getInitials } from "@/utils/string";
import { cn } from "@/utils/style";
import { isRouteHidden } from "./program-features";

type UserRole = "user" | "admin" | "partner";

type SidebarSubItem = {
	icon: React.ReactNode;
	label: MessageDescriptor;
	href: React.ComponentProps<typeof Link>["to"];
	badge?: number;
	roles?: readonly UserRole[];
};

type SidebarItem = {
	icon: React.ReactNode;
	label: MessageDescriptor;
	href: React.ComponentProps<typeof Link>["to"];
	subItems?: readonly SidebarSubItem[];
	badge?: number;
	showNotificationBadge?: boolean;
	showMessagesBadge?: boolean;
	roles?: readonly UserRole[];
};

// =============================================================================
// IMTA v1 Sidebar Configuration
// Core features for school deployment. All routes still exist for white-label.
// Hidden items can be re-enabled by moving them back from comments below.
// =============================================================================

const appSidebarItems: SidebarItem[] = [
	{
		icon: <TrophyIcon />,
		label: msg`My Profile`,
		href: "/dashboard/profile",
		showNotificationBadge: true,
		subItems: [
			{
				icon: <MedalIcon />,
				label: msg`Achievements`,
				href: "/dashboard/profile/achievements",
			},
		],
	},
	{
		icon: <ReadCvLogoIcon />,
		label: msg`Resumes`,
		href: "/dashboard/resumes",
		subItems: [
			{
				icon: <ReadCvLogoIcon />,
				label: msg`My Resumes`,
				href: "/dashboard/resumes",
			},
			{
				icon: <StarIcon />,
				label: msg`Resume Score`,
				href: "/dashboard/resumes/scoring",
				roles: ["user", "admin"],
			},
			{
				icon: <SparkleIcon />,
				label: msg`Experience Optimizer`,
				href: "/dashboard/resumes/experience-optimizer",
				roles: ["user", "admin"],
			},
			{
				icon: <SparkleIcon />,
				label: msg`AI Resume Wizard`,
				href: "/dashboard/resumes/ai-wizard",
				roles: ["user", "admin"],
			},
		],
	},
	{
		icon: <BrainIcon />,
		label: msg`AI Mentor`,
		href: "/dashboard/ai-mentor",
		roles: ["user", "admin"],
		subItems: [
			{
				icon: <RobotIcon />,
				label: msg`My Mentor`,
				href: "/dashboard/ai-mentor",
			},
			{
				icon: <ChatCircleDotsIcon />,
				label: msg`Conversations`,
				href: "/dashboard/ai-mentor/conversations",
			},
			{
				icon: <ChartLineUpIcon />,
				label: msg`Job Market`,
				href: "/dashboard/ai-mentor/market",
			},
		],
	},
	{
		icon: <ChatsCircleIcon />,
		label: msg`Interview Prep`,
		href: "/dashboard/interview",
		roles: ["user", "admin"],
		subItems: [
			{
				icon: <TargetIcon />,
				label: msg`Practice`,
				href: "/dashboard/interview/practice",
			},
			{
				icon: <RobotIcon />,
				label: msg`AI Chatbot`,
				href: "/dashboard/interview/chatbot",
			},
			{
				icon: <SparkleIcon />,
				label: msg`AI Simulation`,
				href: "/dashboard/interview/mock-ai",
			},
			{
				icon: <LightbulbIcon />,
				label: msg`Tips`,
				href: "/dashboard/interview/tips",
			},
			{
				icon: <ListChecksIcon />,
				label: msg`Questions`,
				href: "/dashboard/interview/questions",
			},
			{
				icon: <CheckSquareIcon />,
				label: msg`Checklist`,
				href: "/dashboard/interview/checklist",
			},
			{
				icon: <CalendarIcon />,
				label: msg`Calendar`,
				href: "/dashboard/interview/scheduler",
			},
			{
				icon: <ListChecksIcon />,
				label: msg`Banque de questions`,
				href: "/dashboard/interview/question-bank",
			},
			{
				icon: <NotePencilIcon />,
				label: msg`Interview Notes`,
				href: "/dashboard/interview/notes",
			},
		],
	},
	{
		icon: <GraduationCapIcon />,
		label: msg`Training Center`,
		href: "/dashboard/resources",
		roles: ["user", "admin"],
		subItems: [
			{
				icon: <BookOpenIcon />,
				label: msg`Programs`,
				href: "/dashboard/resources",
			},
			{
				icon: <GraduationCapIcon />,
				label: msg`Catalog`,
				href: "/dashboard/resources/programs",
			},
			{
				icon: <ScalesIcon />,
				label: msg`Compare`,
				href: "/dashboard/resources/compare",
			},
			{
				icon: <SparkleIcon />,
				label: msg`My Programs`,
				href: "/dashboard/resources/my-programs",
			},
		],
	},
	{
		icon: <CompassIcon />,
		label: msg`Career Guidance`,
		href: "/dashboard/career",
		roles: ["user", "admin"],
		subItems: [
			{
				icon: <PathIcon />,
				label: msg`Guidance`,
				href: "/dashboard/career",
			},
			{
				icon: <TargetIcon />,
				label: msg`Personality Quiz`,
				href: "/dashboard/career/quiz",
			},
			{
				icon: <ClipboardTextIcon />,
				label: msg`Career Assessment`,
				href: "/dashboard/career/assessment",
			},
			{
				icon: <TrophyIcon />,
				label: msg`My Skills`,
				href: "/dashboard/career/skills",
			},
			{
				icon: <PathIcon />,
				label: msg`Roadmap`,
				href: "/dashboard/career/roadmap",
			},
			{
				icon: <HeartIcon />,
				label: msg`Career Coaching`,
				href: "/dashboard/career/coaching",
			},
		],
	},
	{
		icon: <BriefcaseIcon />,
		label: msg`Job Opportunities`,
		href: "/dashboard/jobs",
		subItems: [
			{
				icon: <BriefcaseIcon />,
				label: msg`Job Listings`,
				href: "/dashboard/jobs",
			},
			{
				icon: <NoteIcon />,
				label: msg`My Applications`,
				href: "/dashboard/jobs/applications",
			},
			{
				icon: <BuildingsIcon />,
				label: msg`Employers`,
				href: "/dashboard/jobs/employers",
			},
			{
				icon: <SparkleIcon />,
				label: msg`AI Recommendations`,
				href: "/dashboard/jobs/recommendations",
				roles: ["user", "admin"],
			},
			{
				icon: <BookOpenIcon />,
				label: msg`Job Resources`,
				href: "/dashboard/tools/job-resources",
			},
			{
				icon: <MagnifyingGlassIcon />,
				label: msg`Job Board`,
				href: "/dashboard/jobs/board",
			},
		],
	},
	{
		icon: <UsersIcon />,
		label: msg`Networking`,
		href: "/dashboard/networking",
		subItems: [
			{
				icon: <UsersIcon />,
				label: msg`Contacts`,
				href: "/dashboard/networking",
			},
			{
				icon: <CalendarCheckIcon />,
				label: msg`Events`,
				href: "/dashboard/networking/events",
			},
		],
	},
	{
		icon: <EnvelopeSimpleIcon />,
		label: msg`Messages`,
		href: "/dashboard/messages",
		showMessagesBadge: true,
	},
	{
		icon: <ChartBarIcon />,
		label: msg`Analytics`,
		href: "/dashboard/analytics",
		subItems: [
			{
				icon: <ChartBarIcon />,
				label: msg`Overview`,
				href: "/dashboard/analytics",
			},
			{
				icon: <RobotIcon />,
				label: msg`AI Usage`,
				href: "/dashboard/analytics/ai-usage",
				roles: ["admin"],
			},
		],
	},
	{
		icon: <ChatCircleDotsIcon />,
		label: msg`Support / Aide`,
		href: "/dashboard/support",
	},
	{
		icon: <QuestionIcon />,
		label: msg`Help & FAQ`,
		href: "/dashboard/help",
	},
];

const toolsSidebarItems: SidebarItem[] = [
	{
		icon: <ToolboxIcon />,
		label: msg`Tools`,
		href: "/dashboard/tools/cover-letter",
		roles: ["user", "admin"],
		subItems: [
			{
				icon: <EnvelopeSimpleIcon />,
				label: msg`Cover Letter`,
				href: "/dashboard/tools/cover-letter",
			},
			{
				icon: <PencilLineIcon />,
				label: msg`AI Writer`,
				href: "/dashboard/tools/ai-writer",
			},
			{
				icon: <MagnifyingGlassIcon />,
				label: msg`Keyword Optimizer`,
				href: "/dashboard/tools/keywords",
			},
			{
				icon: <CurrencyCircleDollarIcon />,
				label: msg`Salary Calculator`,
				href: "/dashboard/tools/salary-calculator",
			},
			{
				icon: <MicrophoneIcon />,
				label: msg`Elevator Pitch`,
				href: "/dashboard/tools/elevator-pitch",
			},
			{
				icon: <ShieldCheckIcon />,
				label: msg`ATS Checker`,
				href: "/dashboard/tools/ats-checker",
			},
		],
	},
	{
		icon: <FileTextIcon />,
		label: msg`Templates`,
		href: "/dashboard/templates/cover-letters",
		subItems: [
			{
				icon: <ClipboardTextIcon />,
				label: msg`Cover Letters`,
				href: "/dashboard/templates/cover-letters",
			},
			{
				icon: <SparkleIcon />,
				label: msg`Resume Gallery`,
				href: "/dashboard/tools/resume-gallery",
			},
		],
	},
];

const partnerSidebarItems: SidebarItem[] = [
	{
		icon: <BuildingsIcon />,
		label: msg`Partner`,
		href: "/dashboard/partner",
		roles: ["partner"],
		subItems: [
			{
				icon: <GaugeIcon />,
				label: msg`Partner Dashboard`,
				href: "/dashboard/partner",
			},
			{
				icon: <BriefcaseIcon />,
				label: msg`Job Postings`,
				href: "/dashboard/partner/jobs",
			},
			{
				icon: <ClipboardTextIcon />,
				label: msg`Applications`,
				href: "/dashboard/partner/applications",
			},
			{
				icon: <NotePencilIcon />,
				label: msg`Post a Job`,
				href: "/dashboard/partner/post-job",
			},
		],
	},
];

const adminSidebarItems: SidebarItem[] = [
	{
		icon: <GaugeIcon />,
		label: msg`Admin Dashboard`,
		href: "/dashboard/admin",
		subItems: [
			{
				icon: <GaugeIcon />,
				label: msg`Overview`,
				href: "/dashboard/admin",
			},
			{
				icon: <UsersIcon />,
				label: msg`Users`,
				href: "/dashboard/admin/users",
			},
			{
				icon: <ReadCvLogoIcon />,
				label: msg`Resumes`,
				href: "/dashboard/admin/resumes",
			},
			{
				icon: <DatabaseIcon />,
				label: msg`System Health`,
				href: "/dashboard/admin/system",
			},
			{
				icon: <ClockIcon />,
				label: msg`Audit Log`,
				href: "/dashboard/admin/audit-log",
			},
			{
				icon: <BrainIcon />,
				label: msg`AI Providers`,
				href: "/dashboard/admin/ai-providers",
			},
			{
				icon: <RobotIcon />,
				label: msg`AI Quotas`,
				href: "/dashboard/admin/ai-quotas",
			},
			{
				icon: <GearSixIcon />,
				label: msg`AI Settings`,
				href: "/dashboard/admin/ai-settings",
			},
			{
				icon: <DatabaseIcon />,
				label: msg`Reference Data`,
				href: "/dashboard/admin/reference-data",
			},
			{
				icon: <ChartPieSliceIcon />,
				label: msg`Cohort Analytics`,
				href: "/dashboard/admin/cohorts",
			},
			{
				icon: <ChatCircleDotsIcon />,
				label: msg`Support`,
				href: "/dashboard/admin/support",
			},
		],
	},
];

const settingsSidebarItems = [
	{
		icon: <UserCircleIcon />,
		label: msg`Profile`,
		href: "/dashboard/settings/profile",
	},
	{
		icon: <GearSixIcon />,
		label: msg`Preferences`,
		href: "/dashboard/settings/preferences",
	},
	{
		icon: <ShieldCheckIcon />,
		label: msg`Authentication`,
		href: "/dashboard/settings/authentication",
	},
	{
		icon: <KeyIcon />,
		label: msg`API Keys`,
		href: "/dashboard/settings/api-keys",
		roles: ["admin"],
	},
	{
		icon: <BrainIcon />,
		label: msg`Artificial Intelligence`,
		href: "/dashboard/settings/ai",
		roles: ["admin"],
	},
	{
		icon: <DatabaseIcon />,
		label: msg`Data Management`,
		href: "/dashboard/settings/data",
	},
	{
		icon: <WarningIcon />,
		label: msg`Danger Zone`,
		href: "/dashboard/settings/danger-zone",
	},
] as const satisfies SidebarItem[];

type SidebarItemListProps = {
	items: SidebarItem[];
};

// Role label mapping - uses a function so i18n macros are evaluated at render time
function getRoleLabels(): Record<string, string> {
	return {
		admin: t`Administrator`,
		user: t`Student`,
		partner: t`Partner`,
	};
}

function filterItemsByRole(items: readonly SidebarItem[], role: UserRole): SidebarItem[] {
	return items
		.filter((item) => !item.roles || item.roles.includes(role))
		.map((item) => {
			if (!item.subItems) return item;
			const filteredSubs = item.subItems.filter((sub) => !sub.roles || sub.roles.includes(role));
			return { ...item, subItems: filteredSubs };
		});
}

function filterItemsByProgram(items: SidebarItem[], program: string | null | undefined): SidebarItem[] {
	if (!program) return items;
	return items
		.filter((item) => !isRouteHidden(program, item.href as string))
		.map((item) => {
			if (!item.subItems) return item;
			const filteredSubs = item.subItems.filter((sub) => !isRouteHidden(program, sub.href as string));
			if (filteredSubs.length === 0) return null;
			return { ...item, subItems: filteredSubs };
		})
		.filter((item): item is SidebarItem => item !== null);
}

// Memoized CollapsibleSidebarItem for better performance with long sidebar lists
const CollapsibleSidebarItem = memo(
	({
		item,
		index,
		notificationCount,
		messagesCount,
	}: {
		item: SidebarItem;
		index: number;
		notificationCount?: number;
		messagesCount?: number;
	}) => {
		const { i18n } = useLingui();
		const location = useLocation();
		const [isOpen, setIsOpen] = useState(() => {
			return location.pathname.startsWith(item.href as string);
		});

		const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);

		// Calculate badge count (notification count for items with showNotificationBadge,
		// messaging unread count for items with showMessagesBadge, or custom badge)
		const badgeCount = item.showNotificationBadge
			? notificationCount
			: item.showMessagesBadge
				? messagesCount
				: item.badge;
		const showBadge = badgeCount !== undefined && badgeCount > 0;

		if (!item.subItems || item.subItems.length === 0) {
			return (
				<SidebarMenuItem data-menu-item-index={index}>
					<SidebarMenuButton asChild tooltip={i18n.t(item.label)}>
						<motion.div initial={false} whileHover={{ x: 3 }} transition={{ duration: 0.2, ease: "easeOut" }}>
							<Link
								to={item.href}
								preload="intent"
								activeProps={{
									className: "bg-gradient-to-r from-sidebar-accent to-transparent border-l-2 border-primary",
									"aria-current": "page" as const,
								}}
								className="relative"
							>
								<motion.div
									className="flex w-full items-center gap-2"
									initial={false}
									whileHover={{ scale: 1.01 }}
									transition={{ duration: 0.15 }}
								>
									{item.icon}
									<span className="shrink-0 transition-[margin,opacity] duration-200 ease-in-out group-data-[collapsible=icon]:-ms-8 group-data-[collapsible=icon]:opacity-0">
										{i18n.t(item.label)}
									</span>
								</motion.div>
								{showBadge && (
									<motion.span
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className="absolute end-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xs group-data-[collapsible=icon]:end-1 group-data-[collapsible=icon]:size-2 group-data-[collapsible=icon]:bg-primary group-data-[collapsible=icon]:text-[0px]"
									>
										{badgeCount > 99 ? "99+" : badgeCount}
									</motion.span>
								)}
							</Link>
						</motion.div>
					</SidebarMenuButton>
				</SidebarMenuItem>
			);
		}

		return (
			<Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
				<SidebarMenuItem data-menu-item-index={index}>
					<CollapsibleTrigger asChild>
						<SidebarMenuButton
							tooltip={i18n.t(item.label)}
							className={cn(
								"justify-between transition-all duration-200",
								isActive && "border-primary border-l-2 bg-gradient-to-r from-sidebar-accent to-transparent font-medium",
							)}
						>
							<motion.span
								className="flex items-center gap-2"
								initial={false}
								whileHover={{ scale: 1.01, x: 3 }}
								transition={{ duration: 0.15 }}
							>
								{item.icon}
								<span className="shrink-0 transition-[margin,opacity] duration-200 ease-in-out group-data-[collapsible=icon]:-ms-8 group-data-[collapsible=icon]:opacity-0">
									{i18n.t(item.label)}
								</span>
								{showBadge && (
									<motion.span
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className="ms-auto flex size-5 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xs"
									>
										{badgeCount > 99 ? "99+" : badgeCount}
									</motion.span>
								)}
							</motion.span>
							<motion.div
								animate={{ rotate: isOpen ? 180 : 0 }}
								transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
								className="shrink-0 group-data-[collapsible=icon]:hidden"
							>
								<CaretDownIcon className="size-4 text-muted-foreground" />
							</motion.div>
						</SidebarMenuButton>
					</CollapsibleTrigger>
					<motion.div
						initial={false}
						animate={{
							height: isOpen ? "auto" : 0,
							opacity: isOpen ? 1 : 0,
						}}
						transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
						style={{ overflow: "hidden" }}
					>
						<CollapsibleContent>
							<SidebarMenuSub>
								{item.subItems.map((subItem, subIndex) => {
									const subItemBadge = subItem.badge;
									const showSubBadge = subItemBadge !== undefined && subItemBadge > 0;

									return (
										<SidebarMenuSubItem key={subItem.href as string} data-sub-item-index={subIndex}>
											<SidebarMenuSubButton asChild>
												<motion.div initial={false} whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
													<Link
														to={subItem.href}
														preload="intent"
														activeProps={{
															className:
																"bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-primary/50",
															"aria-current": "page" as const,
														}}
														className="relative flex items-center gap-2 transition-colors hover:bg-sidebar-accent/50"
													>
														{subItem.icon}
														<span>{i18n.t(subItem.label)}</span>
														{showSubBadge && (
															<motion.span
																initial={{ scale: 0 }}
																animate={{ scale: 1 }}
																className="ms-auto flex size-4 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground"
															>
																{subItemBadge > 99 ? "99+" : subItemBadge}
															</motion.span>
														)}
													</Link>
												</motion.div>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									);
								})}
							</SidebarMenuSub>
						</CollapsibleContent>
					</motion.div>
				</SidebarMenuItem>
			</Collapsible>
		);
	},
);
CollapsibleSidebarItem.displayName = "CollapsibleSidebarItem";

function SidebarItemList({
	items,
	notificationCount,
	messagesCount,
}: SidebarItemListProps & { notificationCount?: number; messagesCount?: number }) {
	const menuRef = useRef<HTMLUListElement>(null);
	const [focusedIndex, setFocusedIndex] = useState<number>(-1);

	// Keyboard navigation support
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!menuRef.current) return;

			const menuItems = Array.from(menuRef.current.querySelectorAll<HTMLElement>("[data-menu-item-index]"));

			if (menuItems.length === 0) return;

			// Only handle arrow keys when focus is within the sidebar
			if (!menuRef.current.contains(document.activeElement)) return;

			switch (event.key) {
				case "ArrowDown": {
					event.preventDefault();
					const nextIndex = focusedIndex < menuItems.length - 1 ? focusedIndex + 1 : 0;
					setFocusedIndex(nextIndex);
					const nextItem = menuItems[nextIndex].querySelector<HTMLElement>("a, button");
					nextItem?.focus();
					break;
				}
				case "ArrowUp": {
					event.preventDefault();
					const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : menuItems.length - 1;
					setFocusedIndex(prevIndex);
					const prevItem = menuItems[prevIndex].querySelector<HTMLElement>("a, button");
					prevItem?.focus();
					break;
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [focusedIndex]);

	const handleItemFocus = useCallback((index: number) => {
		setFocusedIndex(index);
	}, []);

	return (
		<SidebarMenu ref={menuRef}>
			{items.map((item, index) => (
				<div key={item.href as string} onFocus={() => handleItemFocus(index)}>
					<CollapsibleSidebarItem
						item={item}
						index={index}
						notificationCount={notificationCount}
						messagesCount={messagesCount}
					/>
				</div>
			))}
		</SidebarMenu>
	);
}

// SSR-safe navigation skeleton shown while session is loading to prevent
// industrial students from briefly seeing all sidebar items before program filtering kicks in
function SidebarNavSkeleton() {
	return (
		<SidebarGroup>
			<SidebarGroupLabel className="text-sidebar-foreground/90">
				<Skeleton className="h-3 w-12" />
			</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{Array.from({ length: 6 }).map((_, i) => (
						<SidebarMenuItem key={i}>
							<SidebarMenuButton className="pointer-events-none h-auto gap-x-3">
								<Skeleton className="size-4 shrink-0 rounded" />
								<Skeleton className="h-4 flex-1" style={{ maxWidth: `${80 + ((i * 23) % 40)}px` }} />
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

// SSR-safe user footer that avoids hydration mismatch by rendering a skeleton placeholder
// during SSR and initial mount, then switching to the real user menu once session loads
function UserFooterSkeleton() {
	return (
		<SidebarMenuButton className="h-auto gap-x-3 group-data-[collapsible=icon]:p-1!">
			<Skeleton className="size-9 shrink-0 rounded-full group-data-[collapsible=icon]:size-6" />
			<div className="min-w-0 flex-1 space-y-1.5 transition-[margin,opacity] duration-200 ease-in-out group-data-[collapsible=icon]:-ms-8 group-data-[collapsible=icon]:opacity-0">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-3 w-16" />
			</div>
		</SidebarMenuButton>
	);
}

function UserFooter({ roleBadgeLabel }: { roleBadgeLabel: string }) {
	const { data: session, isPending } = authClient.useSession();
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	// During SSR and initial client render, show skeleton to avoid hydration mismatch
	if (!hasMounted || isPending || !session?.user) {
		return <UserFooterSkeleton />;
	}

	return (
		<UserDropdownMenu>
			{({ session: dropdownSession }) => (
				<SidebarMenuButton className="h-auto gap-x-3 group-data-[collapsible=icon]:p-1!">
					<div className="relative">
						<Avatar className="size-9 shrink-0 ring-2 ring-primary/20 ring-offset-1 ring-offset-background transition-all group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:ring-1">
							<AvatarImage src={dropdownSession.user.image ?? undefined} />
							<AvatarFallback className="bg-primary/10 font-semibold text-primary group-data-[collapsible=icon]:text-[0.5rem]">
								{getInitials(dropdownSession.user.name)}
							</AvatarFallback>
						</Avatar>
						{/* Online indicator */}
						<span
							className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-sidebar bg-green-500 group-data-[collapsible=icon]:size-2"
							aria-hidden="true"
						/>
						<span className="sr-only">
							<Trans>Online</Trans>
						</span>
					</div>

					<div className="min-w-0 flex-1 transition-[margin,opacity] duration-200 ease-in-out group-data-[collapsible=icon]:-ms-8 group-data-[collapsible=icon]:opacity-0">
						<p className="truncate font-semibold text-sm">{dropdownSession.user.name}</p>
						<div className="flex items-center gap-1.5">
							<Badge
								variant="outline"
								className="h-4 border-primary/30 bg-primary/5 px-1.5 font-medium text-[9px] text-primary"
							>
								{roleBadgeLabel}
							</Badge>
						</div>
					</div>
				</SidebarMenuButton>
			)}
		</UserDropdownMenu>
	);
}

// SSR-safe check for macOS - always returns false on the server to avoid hydration mismatch
function getIsMac() {
	return typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

function useIsMac() {
	return useSyncExternalStore(
		// subscribe - navigator doesn't change, so no-op
		() => () => {},
		// getSnapshot (client)
		getIsMac,
		// getServerSnapshot (SSR) - always false
		() => false,
	);
}

export function DashboardSidebar() {
	const { state } = useSidebarState();
	const { openShortcutsModal } = useKeyboardShortcuts();
	const isMac = useIsMac();
	const { data: session, isPending: isSessionPending } = authClient.useSession();

	// Fetch user role with caching - roles rarely change
	const { data: roleData } = useQuery({
		...orpc.auth.getUserRole.queryOptions(),
		staleTime: 15 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		enabled: !!session?.user,
	});

	// Fetch unread notification count
	const { data: notificationCount } = useQuery({
		...orpc.notification.getUnreadCount.queryOptions(),
		staleTime: 1 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		refetchInterval: 30 * 1000,
		enabled: !!session?.user,
	});

	// Fetch unread direct-message count for the Messages sidebar badge
	const { data: messagesCount } = useQuery({
		...orpc.messaging.getUnreadCount.queryOptions(),
		staleTime: 1 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		refetchInterval: 15 * 1000,
		enabled: !!session?.user,
	});

	const userRole = (roleData?.role ?? "user") as UserRole;
	const isAdmin = userRole === "admin";
	const roleLabels = getRoleLabels();
	const roleBadgeLabel = roleLabels[userRole] ?? t`Student`;

	const userProgram = isAdmin
		? null
		: ((session?.user as Record<string, unknown> | undefined)?.imtaProgram as string | null | undefined);
	const isPartner = userRole === "partner";
	const filteredAppItems = useMemo(() => {
		const byRole = filterItemsByRole(appSidebarItems, userRole);
		return filterItemsByProgram(byRole, userProgram);
	}, [userRole, userProgram]);
	const filteredToolsItems = useMemo(() => {
		const byRole = filterItemsByRole(toolsSidebarItems, userRole);
		return filterItemsByProgram(byRole, userProgram);
	}, [userRole, userProgram]);
	const filteredPartnerItems = useMemo(() => filterItemsByRole(partnerSidebarItems, userRole), [userRole]);
	const filteredSettingsItems = useMemo(() => filterItemsByRole(settingsSidebarItems, userRole), [userRole]);

	return (
		<Sidebar variant="floating" collapsible="icon" role="navigation" aria-label={t`Dashboard navigation`}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild className="h-auto justify-center">
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.15 }}>
								<Link to="/">
									<BrandIcon variant="icon" className="size-6" />
									<h1 className="sr-only">IMTA Resume</h1>
								</Link>
							</motion.div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarSeparator className="my-1" />

			<SidebarContent>
				{/* Show skeleton while session is loading to prevent industrial students
				    from briefly seeing all sidebar items before program filtering applies */}
				{isSessionPending ? (
					<>
						<SidebarNavSkeleton />
						<SidebarNavSkeleton />
					</>
				) : (
					<>
						<SidebarGroup>
							<SidebarGroupLabel className="flex items-center justify-between text-sidebar-foreground/90">
								<Trans>Application</Trans>
								{/* Notification bell with badge */}
								{notificationCount !== undefined && notificationCount > 0 && (
									<Link to="/dashboard/profile" className="group/bell relative" aria-label={t`Notifications`}>
										<motion.div whileHover={{ rotate: [0, -15, 15, -10, 0] }} transition={{ duration: 0.4 }}>
											<BellIcon
												className="size-3.5 text-muted-foreground transition-colors group-hover/bell:text-primary"
												weight="fill"
												aria-hidden="true"
											/>
										</motion.div>
										<span
											className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-destructive font-bold text-[8px] text-white"
											aria-hidden="true"
										>
											{notificationCount > 9 ? "9+" : notificationCount}
										</span>
										<span className="sr-only">{notificationCount} non lu(s)</span>
									</Link>
								)}
							</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarItemList
									items={filteredAppItems}
									notificationCount={notificationCount}
									messagesCount={messagesCount}
								/>
							</SidebarGroupContent>
						</SidebarGroup>

						{filteredToolsItems.length > 0 && (
							<>
								<motion.div
									initial={{ scaleX: 0 }}
									animate={{ scaleX: 1 }}
									transition={{ duration: 0.3 }}
									className="section-divider mx-4"
								/>

								<SidebarGroup>
									<SidebarGroupLabel className="text-sidebar-foreground/90">
										<Trans>Tools</Trans>
									</SidebarGroupLabel>
									<SidebarGroupContent>
										<SidebarItemList items={filteredToolsItems} />
									</SidebarGroupContent>
								</SidebarGroup>
							</>
						)}

						{isPartner && filteredPartnerItems.length > 0 && (
							<>
								<motion.div
									initial={{ scaleX: 0 }}
									animate={{ scaleX: 1 }}
									transition={{ duration: 0.3 }}
									className="section-divider mx-4"
								/>

								<SidebarGroup>
									<SidebarGroupLabel className="text-sidebar-foreground/90">
										<Trans>Partenaire</Trans>
									</SidebarGroupLabel>
									<SidebarGroupContent>
										<SidebarItemList items={filteredPartnerItems} />
									</SidebarGroupContent>
								</SidebarGroup>
							</>
						)}

						{isAdmin && (
							<>
								<motion.div
									initial={{ scaleX: 0 }}
									animate={{ scaleX: 1 }}
									transition={{ duration: 0.3 }}
									className="section-divider mx-4"
								/>

								<SidebarGroup>
									<SidebarGroupLabel className="text-sidebar-foreground/90">
										<Trans>Administration</Trans>
									</SidebarGroupLabel>
									<SidebarGroupContent>
										<SidebarItemList items={adminSidebarItems} />
									</SidebarGroupContent>
								</SidebarGroup>
							</>
						)}

						<motion.div
							initial={{ scaleX: 0 }}
							animate={{ scaleX: 1 }}
							transition={{ duration: 0.3 }}
							className="section-divider mx-4"
						/>

						<SidebarGroup>
							<SidebarGroupLabel className="text-sidebar-foreground/90">
								<Trans>Settings</Trans>
							</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarItemList items={filteredSettingsItems} />
							</SidebarGroupContent>
						</SidebarGroup>
					</>
				)}
			</SidebarContent>

			<SidebarSeparator className="my-1" />

			<SidebarFooter className="gap-y-0">
				<SidebarMenu>
					{/* Keyboard Shortcuts Button */}
					<SidebarMenuItem>
						<Tooltip>
							<TooltipTrigger asChild>
								<SidebarMenuButton
									onClick={openShortcutsModal}
									className="group/shortcuts h-auto justify-between transition-colors hover:bg-sidebar-accent"
								>
									<motion.span
										className="flex items-center gap-2"
										initial={false}
										whileHover={{ scale: 1.01, x: 2 }}
										transition={{ duration: 0.15 }}
									>
										<KeyboardIcon className="size-4" />
										<span className="shrink-0 transition-[margin,opacity] duration-200 ease-in-out group-data-[collapsible=icon]:-ms-8 group-data-[collapsible=icon]:opacity-0">
											<Trans>Keyboard Shortcuts</Trans>
										</span>
									</motion.span>
									<span className="flex items-center gap-0.5 transition-[margin,opacity] duration-200 ease-in-out group-data-[collapsible=icon]:hidden">
										<Kbd className="px-1.5 text-[10px]">{isMac ? "Cmd" : "Ctrl"}</Kbd>
										<span className="text-[10px] text-muted-foreground">+</span>
										<Kbd className="px-1.5 text-[10px]">/</Kbd>
									</span>
								</SidebarMenuButton>
							</TooltipTrigger>
							<TooltipContent side="right">
								<Trans>Keyboard Shortcuts</Trans> ({isMac ? "Cmd" : "Ctrl"}+/)
							</TooltipContent>
						</Tooltip>
					</SidebarMenuItem>

					{/* User profile with avatar and role badge */}
					<SidebarMenuItem>
						<UserFooter roleBadgeLabel={roleBadgeLabel} />
					</SidebarMenuItem>
				</SidebarMenu>

				<AnimatePresence mode="wait">
					{state === "expanded" && (
						<motion.div
							key="copyright"
							initial={{ y: 20, height: 0, opacity: 0 }}
							animate={{ y: 0, height: "auto", opacity: 1 }}
							exit={{ y: 20, height: 0, opacity: 0 }}
							transition={{ duration: 0.2, ease: "easeInOut" }}
						>
							<Copyright className="shrink-0 text-nowrap p-2" />
						</motion.div>
					)}
				</AnimatePresence>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
