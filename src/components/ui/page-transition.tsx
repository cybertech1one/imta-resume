import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/utils/style";

type TransitionType = "fade" | "slide-up" | "slide-right" | "scale" | "none";

interface PageTransitionProps {
	children: ReactNode;
	className?: string;
	type?: TransitionType;
	delay?: number;
	duration?: number;
	stagger?: boolean;
}

const transitionVariants: Record<TransitionType, Variants> = {
	fade: {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
	},
	"slide-up": {
		initial: { opacity: 0, y: 20 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -10 },
	},
	"slide-right": {
		initial: { opacity: 0, x: -20 },
		animate: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: 20 },
	},
	scale: {
		initial: { opacity: 0, scale: 0.95 },
		animate: { opacity: 1, scale: 1 },
		exit: { opacity: 0, scale: 0.98 },
	},
	none: {
		initial: {},
		animate: {},
		exit: {},
	},
};

function PageTransition({ children, className, type = "slide-up", delay = 0, duration = 0.3 }: PageTransitionProps) {
	const variants = transitionVariants[type];

	return (
		<motion.div
			initial="initial"
			animate="animate"
			exit="exit"
			variants={variants}
			transition={{
				duration,
				delay,
				ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quart
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// Staggered container for lists of items
interface StaggerContainerProps {
	children: ReactNode;
	className?: string;
	staggerDelay?: number;
	initialDelay?: number;
}

function StaggerContainer({ children, className, staggerDelay = 0.05, initialDelay = 0.1 }: StaggerContainerProps) {
	return (
		<motion.div
			initial="initial"
			animate="animate"
			variants={{
				initial: {},
				animate: {
					transition: {
						staggerChildren: staggerDelay,
						delayChildren: initialDelay,
					},
				},
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// Stagger item to be used inside StaggerContainer
interface StaggerItemProps {
	children: ReactNode;
	className?: string;
	type?: "fade" | "slide-up" | "slide-right" | "scale";
}

const staggerItemVariants: Record<string, Variants> = {
	fade: {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
	},
	"slide-up": {
		initial: { opacity: 0, y: 15 },
		animate: { opacity: 1, y: 0 },
	},
	"slide-right": {
		initial: { opacity: 0, x: -15 },
		animate: { opacity: 1, x: 0 },
	},
	scale: {
		initial: { opacity: 0, scale: 0.9 },
		animate: { opacity: 1, scale: 1 },
	},
};

function StaggerItem({ children, className, type = "slide-up" }: StaggerItemProps) {
	return (
		<motion.div
			variants={staggerItemVariants[type]}
			transition={{ duration: 0.25, ease: "easeOut" }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// Fade in on scroll / when in view
interface FadeInViewProps {
	children: ReactNode;
	className?: string;
	delay?: number;
	once?: boolean;
	amount?: number;
}

function FadeInView({ children, className, delay = 0, once = true, amount = 0.3 }: FadeInViewProps) {
	return (
		<motion.div
			initial={false}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once, amount }}
			transition={{
				duration: 0.4,
				delay,
				ease: "easeOut",
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// Hover scale effect for interactive elements
interface HoverScaleProps {
	children: ReactNode;
	className?: string;
	scale?: number;
	disabled?: boolean;
}

function HoverScale({ children, className, scale = 1.02, disabled = false }: HoverScaleProps) {
	if (disabled) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			whileHover={{ scale }}
			whileTap={{ scale: 0.98 }}
			transition={{ type: "spring", stiffness: 400, damping: 17 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// Loading pulse animation
interface LoadingPulseProps {
	className?: string;
	size?: "sm" | "default" | "lg";
}

const pulseSizes = {
	sm: "size-4",
	default: "size-6",
	lg: "size-8",
};

function LoadingPulse({ className, size = "default" }: LoadingPulseProps) {
	return (
		<motion.div
			className={cn("rounded-full bg-primary/30", pulseSizes[size], className)}
			animate={{
				scale: [1, 1.2, 1],
				opacity: [0.5, 1, 0.5],
			}}
			transition={{
				duration: 1.5,
				repeat: Infinity,
				ease: "easeInOut",
			}}
		/>
	);
}

// Shimmer effect for skeleton loaders
interface ShimmerProps {
	className?: string;
}

function Shimmer({ className }: ShimmerProps) {
	return (
		<div className={cn("relative overflow-hidden", className)}>
			<motion.div
				className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
				animate={{
					x: ["-100%", "100%"],
				}}
				transition={{
					duration: 1.5,
					repeat: Infinity,
					ease: "linear",
				}}
			/>
		</div>
	);
}

// Slide transition for sidebars and panels
interface SlideTransitionProps {
	children: ReactNode;
	className?: string;
	direction?: "left" | "right" | "up" | "down";
	isVisible: boolean;
}

const slideDirections = {
	left: { hidden: { x: "-100%", opacity: 0 }, visible: { x: 0, opacity: 1 } },
	right: { hidden: { x: "100%", opacity: 0 }, visible: { x: 0, opacity: 1 } },
	up: { hidden: { y: "-100%", opacity: 0 }, visible: { y: 0, opacity: 1 } },
	down: { hidden: { y: "100%", opacity: 0 }, visible: { y: 0, opacity: 1 } },
};

function SlideTransition({ children, className, direction = "right", isVisible }: SlideTransitionProps) {
	const variants = slideDirections[direction];

	return (
		<motion.div
			initial="hidden"
			animate={isVisible ? "visible" : "hidden"}
			variants={variants}
			transition={{ type: "spring", damping: 25, stiffness: 200 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// Collapse transition for accordions and expandable sections
interface CollapseTransitionProps {
	children: ReactNode;
	className?: string;
	isExpanded: boolean;
}

function CollapseTransition({ children, className, isExpanded }: CollapseTransitionProps) {
	return (
		<motion.div
			initial={false}
			animate={{
				height: isExpanded ? "auto" : 0,
				opacity: isExpanded ? 1 : 0,
			}}
			transition={{ duration: 0.25, ease: "easeInOut" }}
			className={cn("overflow-hidden", className)}
		>
			{children}
		</motion.div>
	);
}

// Pop animation for modals and tooltips
interface PopTransitionProps {
	children: ReactNode;
	className?: string;
	isVisible: boolean;
	origin?: "center" | "top" | "bottom" | "left" | "right";
}

const popOrigins = {
	center: { originX: 0.5, originY: 0.5 },
	top: { originX: 0.5, originY: 0 },
	bottom: { originX: 0.5, originY: 1 },
	left: { originX: 0, originY: 0.5 },
	right: { originX: 1, originY: 0.5 },
};

function PopTransition({ children, className, isVisible, origin = "center" }: PopTransitionProps) {
	const originStyle = popOrigins[origin];

	return (
		<motion.div
			initial={false}
			animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
			transition={{ type: "spring", damping: 20, stiffness: 300 }}
			style={{ transformOrigin: `${originStyle.originX * 100}% ${originStyle.originY * 100}%` }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// Success checkmark animation
interface SuccessAnimationProps {
	className?: string;
	size?: "sm" | "default" | "lg";
}

const successSizes = {
	sm: { wrapper: "size-12", icon: "size-6" },
	default: { wrapper: "size-16", icon: "size-8" },
	lg: { wrapper: "size-24", icon: "size-12" },
};

function SuccessAnimation({ className, size = "default" }: SuccessAnimationProps) {
	const sizeConfig = successSizes[size];

	return (
		<motion.div
			className={cn(
				"flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30",
				sizeConfig.wrapper,
				className,
			)}
			initial={{ scale: 0 }}
			animate={{ scale: 1 }}
			transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
		>
			<motion.svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={cn("text-green-600 dark:text-green-400", sizeConfig.icon)}
			>
				<motion.path
					d="M5 13l4 4L19 7"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
				/>
			</motion.svg>
		</motion.div>
	);
}

export {
	PageTransition,
	StaggerContainer,
	StaggerItem,
	FadeInView,
	HoverScale,
	LoadingPulse,
	Shimmer,
	SlideTransition,
	CollapseTransition,
	PopTransition,
	SuccessAnimation,
};
export type {
	PageTransitionProps,
	StaggerContainerProps,
	StaggerItemProps,
	FadeInViewProps,
	HoverScaleProps,
	LoadingPulseProps,
	ShimmerProps,
	SlideTransitionProps,
	CollapseTransitionProps,
	PopTransitionProps,
	SuccessAnimationProps,
	TransitionType,
};
