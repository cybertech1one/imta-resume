import { type ComponentPropsWithoutRef, forwardRef, type ReactNode } from "react";
import { cn } from "@/utils/style";

/**
 * Visually hidden element - for screen readers only
 * Use for descriptions that should be read but not shown
 */
export function VisuallyHidden({ children, ...props }: ComponentPropsWithoutRef<"span">) {
	return (
		<span
			className="absolute -m-px size-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
			{...props}
		>
			{children}
		</span>
	);
}

/**
 * Skip to content link - shows on focus for keyboard navigation
 */
export function SkipToContent({
	targetId = "main-content",
	children = "Aller au contenu principal",
}: {
	targetId?: string;
	children?: ReactNode;
}) {
	return (
		<a
			href={`#${targetId}`}
			className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:outline-none"
		>
			{children}
		</a>
	);
}

/**
 * Focus trap container - keeps focus within a component
 * Useful for modals and dialogs
 */
export function FocusTrap({ children, active = true }: { children: ReactNode; active?: boolean }) {
	// Note: For full implementation, use @radix-ui/react-focus-guards or similar
	// This is a simplified version that relies on Radix UI's built-in focus management
	return (
		<div data-focus-trap={active ? "active" : "inactive"} role="dialog" aria-modal={active}>
			{children}
		</div>
	);
}

/**
 * Announce content to screen readers via live region
 */
export function LiveRegion({
	children,
	mode = "polite",
	atomic = true,
	className,
}: {
	children: ReactNode;
	mode?: "polite" | "assertive" | "off";
	atomic?: boolean;
	className?: string;
}) {
	return (
		<div
			aria-live={mode}
			aria-atomic={atomic}
			className={cn("sr-only", className)}
			role={mode === "assertive" ? "alert" : "status"}
		>
			{children}
		</div>
	);
}

/**
 * Accessible icon button wrapper
 * Ensures icon buttons have proper labels
 */
interface IconButtonWrapperProps {
	label: string;
	children: ReactNode;
	hideLabel?: boolean;
}

export function IconButtonLabel({ label, children, hideLabel = true }: IconButtonWrapperProps) {
	return (
		<>
			{children}
			{hideLabel ? <VisuallyHidden>{label}</VisuallyHidden> : <span className="ml-2">{label}</span>}
		</>
	);
}

/**
 * Loading indicator with proper accessibility
 */
export function AccessibleLoading({ label = "Chargement...", className }: { label?: string; className?: string }) {
	return (
		<div role="status" aria-label={label} className={cn("flex items-center justify-center", className)}>
			<div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			<VisuallyHidden>{label}</VisuallyHidden>
		</div>
	);
}

/**
 * Progress indicator with accessibility
 */
export function AccessibleProgress({
	value,
	max = 100,
	label,
	className,
}: {
	value: number;
	max?: number;
	label: string;
	className?: string;
}) {
	const percentage = Math.round((value / max) * 100);

	return (
		<div className={className}>
			<div
				role="progressbar"
				aria-valuenow={value}
				aria-valuemin={0}
				aria-valuemax={max}
				aria-label={label}
				aria-valuetext={`${percentage}% termine`}
				className="h-2 overflow-hidden rounded-full bg-muted"
			>
				<div className="h-full bg-primary transition-all duration-300" style={{ width: `${percentage}%` }} />
			</div>
			<VisuallyHidden>
				{label}: {percentage}% termine
			</VisuallyHidden>
		</div>
	);
}

/**
 * Section with landmark and heading
 */
export const Section = forwardRef<
	HTMLElement,
	ComponentPropsWithoutRef<"section"> & {
		"aria-labelledby"?: string;
		headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
		heading?: string;
		headingClassName?: string;
	}
>(({ children, heading, headingLevel = 2, headingClassName, ...props }, ref) => {
	const headingId =
		props["aria-labelledby"] || (heading ? `heading-${heading.toLowerCase().replace(/\s+/g, "-")}` : undefined);

	const HeadingComponent = ({
		id,
		className,
		children: hChildren,
	}: {
		id?: string;
		className?: string;
		children: ReactNode;
	}) => {
		switch (headingLevel) {
			case 1:
				return (
					<h1 id={id} className={className}>
						{hChildren}
					</h1>
				);
			case 2:
				return (
					<h2 id={id} className={className}>
						{hChildren}
					</h2>
				);
			case 3:
				return (
					<h3 id={id} className={className}>
						{hChildren}
					</h3>
				);
			case 4:
				return (
					<h4 id={id} className={className}>
						{hChildren}
					</h4>
				);
			case 5:
				return (
					<h5 id={id} className={className}>
						{hChildren}
					</h5>
				);
			case 6:
				return (
					<h6 id={id} className={className}>
						{hChildren}
					</h6>
				);
			default:
				return (
					<h2 id={id} className={className}>
						{hChildren}
					</h2>
				);
		}
	};

	return (
		<section ref={ref} aria-labelledby={headingId} {...props}>
			{heading && (
				<HeadingComponent id={headingId} className={headingClassName}>
					{heading}
				</HeadingComponent>
			)}
			{children}
		</section>
	);
});
Section.displayName = "Section";

/**
 * Accessible keyboard shortcut hint
 */
export function KeyboardShortcut({ shortcut, className }: { shortcut: string; className?: string }) {
	// Parse shortcut like "Ctrl+S" into parts
	const parts = shortcut.split("+");

	return (
		<kbd className={cn("inline-flex items-center gap-1 font-mono text-xs", className)}>
			{parts.map((part, i) => (
				<span key={i}>
					<span className="rounded bg-muted px-1.5 py-0.5">{part}</span>
					{i < parts.length - 1 && <span className="mx-0.5 text-muted-foreground">+</span>}
				</span>
			))}
		</kbd>
	);
}

/**
 * Accessible tooltip trigger (adds aria-describedby)
 */
export function WithTooltip({ children, tooltipId }: { children: ReactNode; tooltipId: string }) {
	return <span aria-describedby={tooltipId}>{children}</span>;
}

/**
 * Accessible list with proper roles
 */
export function AccessibleList({
	children,
	label,
	className,
	ordered = false,
}: {
	children: ReactNode;
	label: string;
	className?: string;
	ordered?: boolean;
}) {
	const Tag = ordered ? "ol" : "ul";

	return (
		<Tag role="list" aria-label={label} className={className}>
			{children}
		</Tag>
	);
}

/**
 * Accessible navigation
 */
export function Navigation({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
	return (
		<nav aria-label={label} className={className}>
			{children}
		</nav>
	);
}

/**
 * Error message with proper association
 */
export function FieldError({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
	return (
		<p id={id} role="alert" aria-live="polite" className={cn("text-destructive text-sm", className)}>
			{children}
		</p>
	);
}

/**
 * Form field description
 */
export function FieldDescription({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
	return (
		<p id={id} className={cn("text-muted-foreground text-sm", className)}>
			{children}
		</p>
	);
}
