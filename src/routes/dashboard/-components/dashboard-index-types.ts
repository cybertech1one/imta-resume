import type { MessageDescriptor } from "@lingui/core";
import type { Icon } from "@phosphor-icons/react";

export type ProgressRingProps = {
	value: number;
	size?: number;
	strokeWidth?: number;
	label?: string;
};

export type AnimatedCounterProps = {
	value: number;
	className?: string;
};

export type StatCardProps = {
	icon: Icon;
	count: number;
	label: string;
	badge?: { text: string; icon: Icon } | null;
	accentColor: string;
	href?: string;
	isLoading?: boolean;
	index?: number;
};

export type QuickAction = {
	id: string;
	title: MessageDescriptor;
	description: MessageDescriptor;
	icon: Icon;
	href: string;
	accentColor: string;
	shortcut?: string;
};

export type DonutChartProps = {
	data: { label: string; value: number }[];
	colors: string[];
};

export type BarChartProps = {
	data: { label: string; value: number }[];
	colors: string[];
};

export type Variants = {
	hidden: { opacity: number; y?: number };
	visible: {
		opacity: number;
		y?: number;
		transition: { duration: number; ease: [number, number, number, number] };
	};
};

export type WelcomeBannerProps = {
	itemVariants: Variants;
	currentDate: Date;
	greeting: string;
	userName: string;
	dailyMotivation: string;
	progressScore: number;
};

export type QuickActionsSectionProps = {
	itemVariants: Variants;
};

export type ChartsSectionProps = {
	itemVariants: Variants;
	statsLoading: boolean;
	applicationChartData: { label: string; value: number }[];
	skillsChartData: { label: string; value: number }[];
};

export type RecentActivitySectionProps = {
	itemVariants: Variants;
	activityLoading: boolean;
	recentActivity?: Array<{
		id: string;
		activityType: string;
		category: string | null;
		resourceType: string;
		createdAt: string;
	}>;
};

export type UpcomingItemsSectionProps = {
	itemVariants: Variants;
	upcomingLoading: boolean;
	upcomingItems?: Array<{
		id: string;
		type: string;
		title: string;
		subtitle: string;
		date: string;
		priority?: "high" | "medium" | "low" | null;
	}>;
};

export type FeatureTeaserProps = {
	itemVariants: Variants;
};
