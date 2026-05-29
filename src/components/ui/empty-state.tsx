import type { Icon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/utils/style";
import { Button, type ButtonProps } from "./button";

interface EmptyStateAction {
	label: string;
	onClick?: () => void;
	href?: string;
	variant?: ButtonProps["variant"];
	icon?: Icon;
	loading?: boolean;
}

interface EmptyStateProps {
	icon: Icon;
	title: string;
	description?: string;
	action?: EmptyStateAction;
	secondaryAction?: EmptyStateAction;
	className?: string;
	size?: "sm" | "default" | "lg";
	animate?: boolean;
	illustration?: ReactNode;
	mood?: "neutral" | "positive" | "warning" | "error";
}

const sizeConfig = {
	sm: {
		wrapper: "py-8",
		icon: "size-10",
		iconWrapper: "size-16",
		title: "text-base",
		description: "text-sm",
	},
	default: {
		wrapper: "py-12",
		icon: "size-12",
		iconWrapper: "size-20",
		title: "text-lg",
		description: "text-sm",
	},
	lg: {
		wrapper: "py-16",
		icon: "size-16",
		iconWrapper: "size-24",
		title: "text-xl",
		description: "text-base",
	},
};

const moodColors = {
	neutral: {
		bg: "bg-muted/50",
		icon: "text-muted-foreground/60",
	},
	positive: {
		bg: "bg-green-100 dark:bg-green-900/20",
		icon: "text-green-600 dark:text-green-400",
	},
	warning: {
		bg: "bg-amber-100 dark:bg-amber-900/20",
		icon: "text-amber-600 dark:text-amber-400",
	},
	error: {
		bg: "bg-red-100 dark:bg-red-900/20",
		icon: "text-red-600 dark:text-red-400",
	},
};

function EmptyState({
	icon: IconComponent,
	title,
	description,
	action,
	secondaryAction,
	className,
	size = "default",
	animate = true,
	illustration,
	mood = "neutral",
}: EmptyStateProps) {
	const config = sizeConfig[size];
	const colors = moodColors[mood];

	const content = (
		<div
			role="status"
			aria-live="polite"
			className={cn("flex flex-col items-center justify-center text-center", config.wrapper, className)}
		>
			{illustration ? (
				<div className="mb-6">{illustration}</div>
			) : (
				<motion.div
					className={cn(
						"mb-4 flex items-center justify-center rounded-full transition-colors",
						colors.bg,
						config.iconWrapper,
					)}
					initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
					animate={animate ? { scale: 1, opacity: 1 } : undefined}
					transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
				>
					<IconComponent className={cn(colors.icon, config.icon)} weight="duotone" aria-hidden="true" />
				</motion.div>
			)}

			<motion.h3
				className={cn("mb-2 font-semibold text-foreground", config.title)}
				initial={animate ? { opacity: 0, y: 5 } : undefined}
				animate={animate ? { opacity: 1, y: 0 } : undefined}
				transition={{ delay: 0.15 }}
			>
				{title}
			</motion.h3>

			{description && (
				<motion.p
					className={cn("mb-6 max-w-sm text-muted-foreground leading-relaxed", config.description)}
					initial={animate ? { opacity: 0, y: 5 } : undefined}
					animate={animate ? { opacity: 1, y: 0 } : undefined}
					transition={{ delay: 0.2 }}
				>
					{description}
				</motion.p>
			)}

			{(action || secondaryAction) && (
				<motion.div
					className="flex flex-wrap items-center justify-center gap-3"
					initial={animate ? { opacity: 0, y: 10 } : undefined}
					animate={animate ? { opacity: 1, y: 0 } : undefined}
					transition={{ delay: 0.25 }}
				>
					{action && (
						<Button
							variant={action.variant ?? "default"}
							onClick={action.onClick}
							loading={action.loading}
							asChild={!!action.href && !action.loading}
						>
							{action.href && !action.loading ? (
								<a href={action.href}>
									{action.icon && <action.icon className="mr-2 size-4" />}
									{action.label}
								</a>
							) : (
								<>
									{action.icon && <action.icon className="mr-2 size-4" />}
									{action.label}
								</>
							)}
						</Button>
					)}
					{secondaryAction && (
						<Button
							variant={secondaryAction.variant ?? "outline"}
							onClick={secondaryAction.onClick}
							loading={secondaryAction.loading}
							asChild={!!secondaryAction.href && !secondaryAction.loading}
						>
							{secondaryAction.href && !secondaryAction.loading ? (
								<a href={secondaryAction.href}>
									{secondaryAction.icon && <secondaryAction.icon className="mr-2 size-4" />}
									{secondaryAction.label}
								</a>
							) : (
								<>
									{secondaryAction.icon && <secondaryAction.icon className="mr-2 size-4" />}
									{secondaryAction.label}
								</>
							)}
						</Button>
					)}
				</motion.div>
			)}
		</div>
	);

	if (animate) {
		return (
			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
				{content}
			</motion.div>
		);
	}

	return content;
}

// Specific empty state presets for common use cases
interface ListEmptyStateProps {
	itemName: string;
	onAdd?: () => void;
	addLabel?: string;
	icon?: Icon;
	className?: string;
}

function ListEmptyState({ itemName, onAdd, addLabel, icon, className }: ListEmptyStateProps) {
	// Dynamic import to avoid circular deps - use a default icon
	const DefaultIcon =
		icon ??
		((({ className: cn, ...props }: { className?: string }) => (
			<svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
				/>
			</svg>
		)) as Icon);

	return (
		<EmptyState
			icon={DefaultIcon}
			title={`No ${itemName} yet`}
			description={`Get started by creating your first ${itemName.toLowerCase()}.`}
			action={
				onAdd
					? {
							label: addLabel ?? `Add ${itemName}`,
							onClick: onAdd,
						}
					: undefined
			}
			className={className}
			size="sm"
		/>
	);
}

// Search empty state for when filters return no results
interface SearchEmptyStateProps {
	query?: string;
	onClear?: () => void;
	className?: string;
}

function SearchEmptyState({ query, onClear, className }: SearchEmptyStateProps) {
	const MagnifyingGlassIcon = (({ className: cn, ...props }: { className?: string }) => (
		<svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
			/>
		</svg>
	)) as Icon;

	return (
		<EmptyState
			icon={MagnifyingGlassIcon}
			title="No results found"
			description={
				query
					? `No results match "${query}". Try adjusting your search or filters.`
					: "Try adjusting your search or filters."
			}
			action={
				onClear
					? {
							label: "Clear filters",
							onClick: onClear,
							variant: "outline",
						}
					: undefined
			}
			className={className}
			size="sm"
		/>
	);
}

// Error empty state for when something goes wrong
interface ErrorEmptyStateProps {
	title?: string;
	message?: string;
	onRetry?: () => void;
	isRetrying?: boolean;
	className?: string;
}

function ErrorEmptyState({
	title = "Something went wrong",
	message = "We encountered an error. Please try again.",
	onRetry,
	isRetrying,
	className,
}: ErrorEmptyStateProps) {
	const ErrorIcon = (({ className: cn, ...props }: { className?: string }) => (
		<svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
			/>
		</svg>
	)) as Icon;

	return (
		<EmptyState
			icon={ErrorIcon}
			title={title}
			description={message}
			mood="error"
			action={
				onRetry
					? {
							label: "Try again",
							onClick: onRetry,
							loading: isRetrying,
						}
					: undefined
			}
			className={className}
		/>
	);
}

// Loading empty state for initial data fetch
interface LoadingEmptyStateProps {
	message?: string;
	className?: string;
}

function LoadingEmptyState({ message = "Loading...", className }: LoadingEmptyStateProps) {
	return (
		<div
			role="status"
			aria-live="polite"
			aria-label={message}
			className={cn("flex flex-col items-center justify-center py-12 text-center", className)}
		>
			<motion.div
				className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10"
				animate={{ scale: [1, 1.1, 1] }}
				transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
			>
				<motion.div
					className="size-8 rounded-full border-2 border-primary border-t-transparent"
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
				/>
			</motion.div>
			<p className="text-muted-foreground text-sm">{message}</p>
		</div>
	);
}

// Empty state with feature highlight
interface FeatureEmptyStateProps {
	icon: Icon;
	title: string;
	description: string;
	features: string[];
	action?: EmptyStateAction;
	className?: string;
}

function FeatureEmptyState({
	icon: IconComponent,
	title,
	description,
	features,
	action,
	className,
}: FeatureEmptyStateProps) {
	return (
		<motion.div
			className={cn("flex flex-col items-center justify-center py-12 text-center", className)}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
		>
			<motion.div
				className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5"
				initial={{ scale: 0.8, rotate: -10 }}
				animate={{ scale: 1, rotate: 0 }}
				transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
			>
				<IconComponent className="size-10 text-primary" weight="duotone" />
			</motion.div>

			<h3 className="mb-2 font-semibold text-foreground text-xl">{title}</h3>
			<p className="mb-6 max-w-md text-muted-foreground">{description}</p>

			<ul className="mb-8 space-y-2 text-left">
				{features.map((feature, index) => (
					<motion.li
						key={feature}
						className="flex items-center gap-2 text-muted-foreground text-sm"
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 + index * 0.1 }}
					>
						<svg className="size-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
						{feature}
					</motion.li>
				))}
			</ul>

			{action && (
				<Button
					variant={action.variant ?? "default"}
					onClick={action.onClick}
					loading={action.loading}
					asChild={!!action.href && !action.loading}
				>
					{action.href && !action.loading ? (
						<a href={action.href}>
							{action.icon && <action.icon className="mr-2 size-4" />}
							{action.label}
						</a>
					) : (
						<>
							{action.icon && <action.icon className="mr-2 size-4" />}
							{action.label}
						</>
					)}
				</Button>
			)}
		</motion.div>
	);
}

export { EmptyState, ListEmptyState, SearchEmptyState, ErrorEmptyState, LoadingEmptyState, FeatureEmptyState };
export type {
	EmptyStateProps,
	EmptyStateAction,
	ListEmptyStateProps,
	SearchEmptyStateProps,
	ErrorEmptyStateProps,
	LoadingEmptyStateProps,
	FeatureEmptyStateProps,
};
