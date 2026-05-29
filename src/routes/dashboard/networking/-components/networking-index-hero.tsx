import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { BellIcon, CalendarIcon, HandshakeIcon, TrendUpIcon, UsersIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { WikiLinkCard } from "@/components/shared/wiki-link-card";
import type { NetworkingStats } from "./networking-index-types";

// ============================================================================
// HeroSection
// ============================================================================

export function HeroSection({ stats }: { stats: NetworkingStats }) {
	return (
		<>
			<motion.div
				className="relative mb-4 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
				style={{
					background:
						"linear-gradient(135deg, oklch(0.65 0.18 280 / 0.15) 0%, oklch(0.6 0.2 320 / 0.1) 50%, oklch(0.7 0.15 240 / 0.08) 100%)",
				}}
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
			>
				{/* Animated background elements */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<motion.div
						className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 blur-3xl"
						animate={{
							scale: [1, 1.2, 1],
							rotate: [0, 10, 0],
							opacity: [0.5, 0.3, 0.5],
						}}
						transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
					/>
					<motion.div
						className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-blue-500/15 to-cyan-500/10 blur-3xl"
						animate={{
							scale: [1.2, 1, 1.2],
							rotate: [0, -10, 0],
							opacity: [0.3, 0.5, 0.3],
						}}
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
						<HandshakeIcon className="size-5 text-primary" weight="fill" />
						<span className="font-semibold text-primary text-sm uppercase tracking-wider">
							<Trans>Professional Network</Trans>
						</span>
					</motion.div>

					<motion.h2
						className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<Trans>Build & Manage Your Network</Trans>
					</motion.h2>

					<motion.p
						className="mb-8 max-w-2xl text-lg text-muted-foreground"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<Trans>
							Track your professional contacts, schedule follow-ups, and nurture relationships that advance your career.
						</Trans>
					</motion.p>

					{/* Quick Stats */}
					<motion.div
						className="flex flex-wrap items-center gap-6"
						initial={false}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
								<UsersIcon className="size-5 text-primary" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl">{stats.totalContacts}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Contacts</Trans>
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
								<TrendUpIcon className="size-5 text-green-500" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl">{stats.strongConnections}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Strong Connections</Trans>
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
								<BellIcon className="size-5 text-amber-500" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl">{stats.pendingReminders}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Pending Follow-ups</Trans>
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10">
								<CalendarIcon className="size-5 text-blue-500" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl">{stats.upcomingEvents}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Upcoming Events</Trans>
								</p>
							</div>
						</div>
					</motion.div>
				</div>
			</motion.div>
			<div className="mb-8">
				<WikiLinkCard
					title={t`Networking & LinkedIn Strategies`}
					description={t`Build a powerful professional network and optimize your LinkedIn presence`}
					wikiPath="/dashboard/wiki/networking-linkedin"
				/>
			</div>
		</>
	);
}
