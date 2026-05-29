import { SpinnerIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import type * as React from "react";
import { cn } from "@/utils/style";

interface LoadingOverlayProps {
	isLoading: boolean;
	message?: string;
	className?: string;
	blur?: boolean;
	fullScreen?: boolean;
	variant?: "spinner" | "dots" | "pulse";
}

// Dots animation component
function LoadingDots() {
	return (
		<div className="flex items-center gap-1">
			{[0, 1, 2].map((i) => (
				<motion.div
					key={i}
					className="size-2 rounded-full bg-primary"
					animate={{
						y: [0, -8, 0],
						opacity: [0.5, 1, 0.5],
					}}
					transition={{
						duration: 0.6,
						repeat: Infinity,
						delay: i * 0.15,
						ease: "easeInOut",
					}}
				/>
			))}
		</div>
	);
}

// Pulse animation component
function LoadingPulse() {
	return (
		<div className="relative flex size-12 items-center justify-center">
			<motion.div
				className="absolute inset-0 rounded-full bg-primary/30"
				animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
				transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
			/>
			<motion.div
				className="absolute inset-2 rounded-full bg-primary/50"
				animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.2, 0.7] }}
				transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
			/>
			<div className="relative size-4 rounded-full bg-primary" />
		</div>
	);
}

function LoadingOverlay({
	isLoading,
	message = "Loading...",
	className,
	blur = true,
	fullScreen = false,
	variant = "spinner",
}: LoadingOverlayProps) {
	const renderLoader = () => {
		switch (variant) {
			case "dots":
				return <LoadingDots />;
			case "pulse":
				return <LoadingPulse />;
			default:
				return (
					<motion.div
						animate={{ rotate: 360 }}
						transition={{
							duration: 1,
							repeat: Infinity,
							ease: "linear",
						}}
					>
						<SpinnerIcon className="size-8 text-primary" weight="bold" />
					</motion.div>
				);
		}
	};

	return (
		<AnimatePresence>
			{isLoading && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className={cn(
						"z-50 flex flex-col items-center justify-center gap-4",
						fullScreen ? "fixed inset-0" : "absolute inset-0",
						blur ? "bg-background/80 backdrop-blur-sm" : "bg-background/90",
						className,
					)}
					role="status"
					aria-live="polite"
					aria-label={message}
				>
					{renderLoader()}
					{message && (
						<motion.p
							className="font-medium text-muted-foreground text-sm"
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
						>
							{message}
						</motion.p>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// Inline loading indicator for buttons, forms, etc.
interface InlineLoadingProps {
	isLoading: boolean;
	loadingText?: string;
	children: React.ReactNode;
	className?: string;
}

function InlineLoading({ isLoading, loadingText, children, className }: InlineLoadingProps) {
	return (
		<span className={cn("inline-flex items-center gap-2", className)}>
			<AnimatePresence mode="wait">
				{isLoading ? (
					<motion.span
						key="loading"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						className="inline-flex items-center gap-2"
					>
						<SpinnerIcon className="size-4 animate-spin" />
						{loadingText && <span>{loadingText}</span>}
					</motion.span>
				) : (
					<motion.span
						key="content"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
					>
						{children}
					</motion.span>
				)}
			</AnimatePresence>
		</span>
	);
}

// Progress loading bar at top of page
interface ProgressBarProps {
	isLoading: boolean;
	className?: string;
}

function ProgressBar({ isLoading, className }: ProgressBarProps) {
	return (
		<AnimatePresence>
			{isLoading && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className={cn("fixed top-0 right-0 left-0 z-[100] h-1 overflow-hidden", className)}
				>
					<motion.div
						className="h-full bg-primary"
						initial={{ x: "-100%" }}
						animate={{ x: "100%" }}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							ease: "easeInOut",
						}}
						style={{ width: "30%" }}
					/>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export { LoadingOverlay, InlineLoading, ProgressBar };
export type { LoadingOverlayProps, InlineLoadingProps, ProgressBarProps };
