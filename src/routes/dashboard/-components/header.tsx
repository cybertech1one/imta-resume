import { t } from "@lingui/core/macro";
import type { Icon as IconType } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/utils/style";
import { NotificationCenter } from "./notifications";

type Props = {
	title: string;
	icon: IconType;
	className?: string;
	showNotifications?: boolean;
	/** Optional subtitle beneath the title */
	subtitle?: string;
	/** Section-specific accent color (CSS variable or raw value) */
	accentColor?: string;
	/** Gradient background string for the hero-style header */
	gradient?: string;
	/** Additional content to render on the right side */
	rightContent?: React.ReactNode;
};

export function DashboardHeader({
	title,
	icon: IconComponent,
	className,
	showNotifications = true,
	subtitle,
	accentColor = "var(--imta-emerald)",
	gradient,
	rightContent,
}: Props) {
	if (gradient) {
		return (
			<motion.header
				className={cn("relative mb-8 overflow-hidden rounded-2xl border border-border/50 p-6 md:p-8", className)}
				style={{ background: gradient }}
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
			>
				{/* Decorative orb */}
				<div
					className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full blur-3xl"
					style={{ background: `color-mix(in oklch, ${accentColor} 20%, transparent)` }}
					aria-hidden="true"
				/>
				<div className="relative z-10 flex items-center justify-between">
					<div className="flex items-center gap-x-4">
						<SidebarTrigger className="min-h-[44px] min-w-[44px] md:hidden" aria-label={t`Toggle navigation menu`} />
						<div
							className="flex size-12 items-center justify-center rounded-xl shadow-sm md:size-14"
							style={{ background: `color-mix(in oklch, ${accentColor} 15%, transparent)` }}
						>
							<IconComponent
								weight="duotone"
								className="size-6 md:size-7"
								aria-hidden="true"
								style={{ color: accentColor }}
							/>
						</div>
						<div>
							<h1 className="font-bold text-2xl tracking-tight md:text-3xl">{title}</h1>
							{subtitle && <p className="mt-0.5 text-muted-foreground text-sm md:text-base">{subtitle}</p>}
						</div>
					</div>
					<div className="flex items-center gap-3">
						{rightContent}
						{showNotifications && <NotificationCenter />}
					</div>
				</div>
			</motion.header>
		);
	}

	return (
		<motion.header
			className={cn("relative mb-6 flex items-center justify-between", className)}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
		>
			<div className="flex items-center justify-center gap-x-3 md:justify-start">
				<SidebarTrigger className="min-h-[44px] min-w-[44px] md:hidden" aria-label={t`Toggle navigation menu`} />
				<div
					className="flex size-8 items-center justify-center rounded-lg"
					style={{ background: `color-mix(in oklch, ${accentColor} 12%, transparent)` }}
				>
					<IconComponent weight="duotone" className="size-4" aria-hidden="true" style={{ color: accentColor }} />
				</div>
				<div>
					<h1 className="font-semibold text-xl tracking-tight">{title}</h1>
					{subtitle && <p className="mt-0.5 text-muted-foreground text-xs">{subtitle}</p>}
				</div>
			</div>

			<div className="flex items-center gap-2">
				{rightContent}
				{showNotifications && <NotificationCenter />}
			</div>
		</motion.header>
	);
}
