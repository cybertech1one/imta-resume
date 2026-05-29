import { Trans } from "@lingui/react/macro";
import { CalendarIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";

// ==================== HERO SECTION ====================

interface HeroSectionProps {
	displayStats: {
		total: number;
		upcoming: number;
		completed: number;
		successRate: number;
	};
}

export function HeroSection({ displayStats }: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.65 0.18 260 / 0.15) 0%, oklch(0.6 0.2 220 / 0.1) 50%, oklch(0.7 0.15 180 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/10 blur-3xl"
					animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-cyan-500/15 to-blue-500/10 blur-3xl"
					animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
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
					<CalendarIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Organize your interviews</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Interview Scheduler</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Manage all your interviews in one place. Schedule, track, and prepare effectively for every opportunity.
					</Trans>
				</motion.p>

				{/* Stats */}
				<motion.div
					className="grid grid-cols-2 gap-4 sm:grid-cols-4"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl">{displayStats.total}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Total</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-blue-600 dark:text-blue-400">{displayStats.upcoming}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Upcoming</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-green-600 dark:text-green-400">{displayStats.completed}</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Completed</Trans>
						</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20">
						<p className="font-bold text-2xl text-purple-600 dark:text-purple-400">
							{Math.round(displayStats.successRate * 100)}%
						</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Success rate</Trans>
						</p>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}
