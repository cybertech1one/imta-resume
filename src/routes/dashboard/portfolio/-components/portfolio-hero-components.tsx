import { Trans } from "@lingui/react/macro";
import {
	ArrowSquareOutIcon,
	CertificateIcon,
	CodeIcon,
	CopyIcon,
	EyeIcon,
	FilePdfIcon,
	FolderIcon,
	GlobeIcon,
	ShareNetworkIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { SAMPLE_ANALYTICS, SAMPLE_CERTIFICATIONS } from "./portfolio-config";

// ─── Portfolio Hero ───────────────────────────────────────────────────────

export function PortfolioHero({ projectCount }: { projectCount: number }) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.15 280 / 0.15) 0%, oklch(0.6 0.2 200 / 0.1) 50%, oklch(0.65 0.18 150 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 blur-3xl"
					animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0], opacity: [0.5, 0.3, 0.5] }}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-amber-500/15 to-green-500/10 blur-3xl"
					animate={{ scale: [1.2, 1, 1.2], rotate: [0, -10, 0], opacity: [0.3, 0.5, 0.3] }}
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
					<FolderIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Showcase Your Work</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Professional Portfolio</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Create a stunning portfolio to showcase your projects, certifications, and achievements. Share your
						professional journey with potential employers and clients.
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
							<CodeIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{projectCount}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Projects</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<CertificateIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{SAMPLE_CERTIFICATIONS.length}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Certifications</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<EyeIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{SAMPLE_ANALYTICS.totalViews.toLocaleString("fr-FR")}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Total Views</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ─── Portfolio URL Bar ────────────────────────────────────────────────────

export function PortfolioUrlBar({
	portfolioPublic,
	setPortfolioPublic,
	portfolioUrl,
	copyPortfolioUrl,
	exportToPDF,
}: {
	portfolioPublic: boolean;
	setPortfolioPublic: (v: boolean) => void;
	portfolioUrl: string;
	copyPortfolioUrl: () => void;
	exportToPDF: () => void;
}) {
	return (
		<Card className="mb-8">
			<CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
				<div className="flex flex-1 items-center gap-4">
					<div className="flex items-center gap-2">
						<Switch checked={portfolioPublic} onCheckedChange={setPortfolioPublic} />
						<Label className="text-sm">
							<Trans>Public Portfolio</Trans>
						</Label>
					</div>
					<Separator orientation="vertical" className="h-6" />
					<div className="flex flex-1 items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
						<GlobeIcon className="size-4 text-muted-foreground" />
						<span className="flex-1 truncate text-sm">{portfolioUrl}</span>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon-sm" onClick={copyPortfolioUrl}>
									<CopyIcon className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<Trans>Copy URL</Trans>
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon-sm" asChild>
									<a href={`https://${portfolioUrl}`} target="_blank" rel="noopener noreferrer">
										<ArrowSquareOutIcon className="size-4" />
									</a>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<Trans>Open Portfolio</Trans>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" className="gap-2" onClick={exportToPDF}>
						<FilePdfIcon className="size-4" />
						<Trans>Export PDF</Trans>
					</Button>
					<Button variant="outline" className="gap-2">
						<ShareNetworkIcon className="size-4" />
						<Trans>Share</Trans>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
