import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BookOpenIcon,
	BriefcaseIcon,
	CheckCircleIcon,
	ClipboardTextIcon,
	CopyIcon,
	DownloadSimpleIcon,
	EyeIcon,
	LightbulbIcon,
	MagnifyingGlassIcon,
	SparkleIcon,
	WarningCircleIcon,
	XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/style";
import {
	commonMistakes,
	coverLetterTemplates,
	coverLetterTips,
	domainColors,
	domainGradients,
	domainIcons,
	domainLabels,
	typeColors,
	typeIcons,
	typeLabels,
} from "./cover-letters-config";
import type { CoverLetterTemplate, DomainCategory, TypeCategory } from "./cover-letters-types";

export function HeroSection({
	searchQuery,
	onSearchChange,
}: {
	searchQuery: string;
	onSearchChange: (value: string) => void;
}) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-12"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-[oklch(0.72_0.16_280)]/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl"
					animate={{
						scale: [1, 1.3, 1],
					}}
					transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<ClipboardTextIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Bibliotheque IMTA</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Cover Letter Templates</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Decouvrez notre collection de modeles de lettres de motivation adaptes aux differents secteurs et types de
						candidature. Personnalisez-les selon votre profil et votre projet professionnel.
					</Trans>
				</motion.p>

				<motion.div
					className="relative max-w-xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
				>
					<MagnifyingGlassIcon className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						placeholder={t`Search for a letter template...`}
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="h-14 rounded-2xl border-border/50 bg-background/80 pr-4 pl-12 text-lg backdrop-blur-sm transition-all focus:border-primary/50 focus:bg-background focus:shadow-lg focus:shadow-primary/10"
					/>
				</motion.div>

				<motion.div
					className="mt-8 flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<ClipboardTextIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{coverLetterTemplates.length}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Templates</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10">
							<BriefcaseIcon className="size-5 text-blue-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">4</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Domaines</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<SparkleIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">100%</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Gratuit</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

export function FilterPills({
	selectedDomain,
	selectedType,
	searchQuery,
	onDomainChange,
	onTypeChange,
	onClearFilters,
}: {
	selectedDomain: DomainCategory | "all";
	selectedType: TypeCategory | "all";
	searchQuery: string;
	onDomainChange: (domain: DomainCategory | "all") => void;
	onTypeChange: (type: TypeCategory | "all") => void;
	onClearFilters: () => void;
}) {
	return (
		<div className="flex flex-wrap gap-4">
			<div className="flex flex-wrap items-center gap-2">
				<span className="font-medium text-muted-foreground text-sm">
					<Trans>Domaine:</Trans>
				</span>
				<Button
					variant={selectedDomain === "all" ? "default" : "outline"}
					size="sm"
					className="rounded-full"
					onClick={() => onDomainChange("all")}
				>
					<Trans>All</Trans>
				</Button>
				{(Object.keys(domainLabels) as DomainCategory[]).map((domain) => {
					const DomainIcon = domainIcons[domain];
					return (
						<Button
							key={domain}
							variant={selectedDomain === domain ? "default" : "outline"}
							size="sm"
							className="gap-1 rounded-full"
							onClick={() => onDomainChange(domain)}
						>
							<DomainIcon className="size-4" />
							{domainLabels[domain]}
						</Button>
					);
				})}
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<span className="font-medium text-muted-foreground text-sm">
					<Trans>Type:</Trans>
				</span>
				<Button
					variant={selectedType === "all" ? "default" : "outline"}
					size="sm"
					className="rounded-full"
					onClick={() => onTypeChange("all")}
				>
					<Trans>All</Trans>
				</Button>
				{(Object.keys(typeLabels) as TypeCategory[]).map((type) => {
					const TypeIcon = typeIcons[type];
					return (
						<Button
							key={type}
							variant={selectedType === type ? "default" : "outline"}
							size="sm"
							className="gap-1 rounded-full"
							onClick={() => onTypeChange(type)}
						>
							<TypeIcon className="size-4" />
							{typeLabels[type]}
						</Button>
					);
				})}
			</div>
			{(selectedDomain !== "all" || selectedType !== "all" || searchQuery) && (
				<Button variant="ghost" size="sm" className="gap-1" onClick={onClearFilters}>
					<XIcon className="size-4" />
					<Trans>Clear filters</Trans>
				</Button>
			)}
		</div>
	);
}

export function TemplateGrid({
	templates,
	onPreview,
	onCopy,
}: {
	templates: CoverLetterTemplate[];
	onPreview: (template: CoverLetterTemplate) => void;
	onCopy: (content: string) => void;
}) {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			<AnimatePresence mode="popLayout">
				{templates.map((template, index) => {
					const TemplateIcon = template.icon;
					return (
						<motion.div
							key={template.id}
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ delay: index * 0.05 }}
							layout
						>
							<Card
								className={cn(
									"group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
									"border-2 hover:border-primary/50",
									"bg-gradient-to-br",
									domainGradients[template.domain],
								)}
							>
								<CardHeader className="pb-3">
									<div className="mb-3 flex items-start justify-between">
										<div
											className={cn(
												"flex size-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
												domainColors[template.domain],
											)}
										>
											<TemplateIcon className="size-7" weight="duotone" />
										</div>
										<div className="flex flex-col items-end gap-1">
											<Badge className={domainColors[template.domain]}>{domainLabels[template.domain]}</Badge>
											<Badge variant="outline" className={typeColors[template.type]}>
												{typeLabels[template.type]}
											</Badge>
										</div>
									</div>
									<CardTitle className="text-lg transition-colors group-hover:text-primary">{template.name}</CardTitle>
									<CardDescription className="line-clamp-2">{template.description}</CardDescription>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="mb-4 flex flex-wrap gap-1">
										{template.tags.slice(0, 3).map((tag) => (
											<Badge key={tag} variant="secondary" className="text-xs">
												{tag}
											</Badge>
										))}
									</div>
								</CardContent>
								<CardFooter className="gap-2 pt-0">
									<Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => onPreview(template)}>
										<EyeIcon className="size-4" />
										<Trans>Preview</Trans>
									</Button>
									<Button size="sm" className="flex-1 gap-1" onClick={() => onCopy(template.content)}>
										<CopyIcon className="size-4" />
										<Trans>Utiliser</Trans>
									</Button>
								</CardFooter>
							</Card>
						</motion.div>
					);
				})}
			</AnimatePresence>
		</div>
	);
}

export function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<MagnifyingGlassIcon className="mb-4 size-12 text-muted-foreground" />
			<h3 className="mb-2 font-semibold text-lg">
				<Trans>No templates found</Trans>
			</h3>
			<p className="text-muted-foreground">
				<Trans>Try changing your search criteria</Trans>
			</p>
		</div>
	);
}

export function DomainTabContent({
	onPreview,
	onCopy,
}: {
	onPreview: (template: CoverLetterTemplate) => void;
	onCopy: (content: string) => void;
}) {
	return (
		<>
			{(Object.keys(domainLabels) as DomainCategory[]).map((domain) => {
				const DomainIcon = domainIcons[domain];
				const domainTemplates = coverLetterTemplates.filter((t) => t.domain === domain);

				if (domainTemplates.length === 0) return null;

				return (
					<section key={domain}>
						<div className="mb-6 flex items-center gap-3">
							<div className={cn("flex size-12 items-center justify-center rounded-xl", domainColors[domain])}>
								<DomainIcon className="size-6" weight="duotone" />
							</div>
							<div>
								<h3 className="font-semibold text-xl">{domainLabels[domain]}</h3>
								<p className="text-muted-foreground text-sm">
									{domainTemplates.length} <Trans>template(s)</Trans>
								</p>
							</div>
						</div>

						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{domainTemplates.map((template) => {
								const TemplateIcon = template.icon;
								return (
									<Card
										key={template.id}
										className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
									>
										<CardHeader className="pb-3">
											<div className="mb-2 flex items-center gap-3">
												<div
													className={cn("flex size-10 items-center justify-center rounded-lg", domainColors[domain])}
												>
													<TemplateIcon className="size-5" weight="duotone" />
												</div>
												<Badge variant="outline" className={typeColors[template.type]}>
													{typeLabels[template.type]}
												</Badge>
											</div>
											<CardTitle className="text-lg">{template.name}</CardTitle>
											<CardDescription className="line-clamp-2">{template.description}</CardDescription>
										</CardHeader>
										<CardFooter className="gap-2 pt-0">
											<Button variant="outline" size="sm" className="gap-1" onClick={() => onPreview(template)}>
												<EyeIcon className="size-4" />
												<Trans>Preview</Trans>
											</Button>
											<Button size="sm" className="gap-1" onClick={() => onCopy(template.content)}>
												<CopyIcon className="size-4" />
												<Trans>Utiliser</Trans>
											</Button>
										</CardFooter>
									</Card>
								);
							})}
						</div>
					</section>
				);
			})}
		</>
	);
}

export function TypeTabContent({
	onPreview,
	onCopy,
}: {
	onPreview: (template: CoverLetterTemplate) => void;
	onCopy: (content: string) => void;
}) {
	return (
		<>
			{(Object.keys(typeLabels) as TypeCategory[]).map((type) => {
				const TypeIcon = typeIcons[type];
				const typeTemplates = coverLetterTemplates.filter((t) => t.type === type);

				if (typeTemplates.length === 0) return null;

				return (
					<section key={type}>
						<div className="mb-6 flex items-center gap-3">
							<div className={cn("flex size-12 items-center justify-center rounded-xl", typeColors[type])}>
								<TypeIcon className="size-6" weight="duotone" />
							</div>
							<div>
								<h3 className="font-semibold text-xl">{typeLabels[type]}</h3>
								<p className="text-muted-foreground text-sm">
									{typeTemplates.length} <Trans>template(s)</Trans>
								</p>
							</div>
						</div>

						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{typeTemplates.map((template) => {
								const TemplateIcon = template.icon;
								return (
									<Card
										key={template.id}
										className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
									>
										<CardHeader className="pb-3">
											<div className="mb-2 flex items-center gap-3">
												<div
													className={cn(
														"flex size-10 items-center justify-center rounded-lg",
														domainColors[template.domain],
													)}
												>
													<TemplateIcon className="size-5" weight="duotone" />
												</div>
												<Badge className={domainColors[template.domain]}>{domainLabels[template.domain]}</Badge>
											</div>
											<CardTitle className="text-lg">{template.name}</CardTitle>
											<CardDescription className="line-clamp-2">{template.description}</CardDescription>
										</CardHeader>
										<CardFooter className="gap-2 pt-0">
											<Button variant="outline" size="sm" className="gap-1" onClick={() => onPreview(template)}>
												<EyeIcon className="size-4" />
												<Trans>Preview</Trans>
											</Button>
											<Button size="sm" className="gap-1" onClick={() => onCopy(template.content)}>
												<CopyIcon className="size-4" />
												<Trans>Utiliser</Trans>
											</Button>
										</CardFooter>
									</Card>
								);
							})}
						</div>
					</section>
				);
			})}
		</>
	);
}

export function TipsTabContent({ onNavigateToAll }: { onNavigateToAll: () => void }) {
	return (
		<>
			<section>
				<div className="mb-6 flex items-center gap-3">
					<div className="flex size-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
						<LightbulbIcon className="size-6 text-amber-600 dark:text-amber-400" weight="fill" />
					</div>
					<div>
						<h3 className="font-semibold text-xl">
							<Trans>How to personalize your letter</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>Tips for a successful cover letter</Trans>
						</p>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					{coverLetterTips.map((tip, index) => {
						const TipIcon = tip.icon;
						return (
							<motion.div
								key={tip.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card className="h-full transition-all hover:shadow-md">
									<CardContent className="flex gap-4 p-6">
										<div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
											<TipIcon className="size-6 text-green-600 dark:text-green-400" weight="duotone" />
										</div>
										<div>
											<h4 className="mb-2 font-semibold">{tip.title}</h4>
											<p className="text-muted-foreground text-sm">{tip.content}</p>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			</section>

			<section>
				<div className="mb-6 flex items-center gap-3">
					<div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
						<BookOpenIcon className="size-6 text-blue-600 dark:text-blue-400" weight="duotone" />
					</div>
					<div>
						<h3 className="font-semibold text-xl">
							<Trans>What your letter should contain</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>Essential elements of a good cover letter</Trans>
						</p>
					</div>
				</div>

				<Card className="overflow-hidden">
					<CardContent className="p-6">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-green-500" weight="fill" />
									<div>
										<p className="font-medium">
											<Trans>Complete header</Trans>
										</p>
										<p className="text-muted-foreground text-sm">
											<Trans>Your contact details and the company's</Trans>
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-green-500" weight="fill" />
									<div>
										<p className="font-medium">
											<Trans>Clear subject line</Trans>
										</p>
										<p className="text-muted-foreground text-sm">
											<Trans>The target position and reference if applicable</Trans>
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-green-500" weight="fill" />
									<div>
										<p className="font-medium">
											<Trans>Impactful hook</Trans>
										</p>
										<p className="text-muted-foreground text-sm">
											<Trans>Capture attention from the first sentence</Trans>
										</p>
									</div>
								</div>
							</div>
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-green-500" weight="fill" />
									<div>
										<p className="font-medium">
											<Trans>Your key skills</Trans>
										</p>
										<p className="text-muted-foreground text-sm">
											<Trans>Related to the position and company</Trans>
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-green-500" weight="fill" />
									<div>
										<p className="font-medium">
											<Trans>Your motivation</Trans>
										</p>
										<p className="text-muted-foreground text-sm">
											<Trans>Why this company interests you</Trans>
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-green-500" weight="fill" />
									<div>
										<p className="font-medium">
											<Trans>Interview request</Trans>
										</p>
										<p className="text-muted-foreground text-sm">
											<Trans>Closing and signature</Trans>
										</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</section>

			<section>
				<div className="mb-6 flex items-center gap-3">
					<div className="flex size-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
						<WarningCircleIcon className="size-6 text-red-600 dark:text-red-400" weight="duotone" />
					</div>
					<div>
						<h3 className="font-semibold text-xl">
							<Trans>Mistakes to avoid</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>Common cover letter pitfalls</Trans>
						</p>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					{commonMistakes.map((mistake, index) => (
						<motion.div
							key={mistake.id}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card className="h-full border-red-200 bg-red-50/50 transition-all hover:shadow-md dark:border-red-900/30 dark:bg-red-900/10">
								<CardContent className="flex items-start gap-4 p-6">
									<XIcon className="mt-0.5 size-6 shrink-0 text-red-500" weight="bold" />
									<div>
										<h4 className="mb-1 font-semibold text-red-700 dark:text-red-400">{mistake.title}</h4>
										<p className="text-muted-foreground text-sm">{mistake.description}</p>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</section>

			<section>
				<Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
					<CardContent className="flex flex-col items-center p-8 text-center">
						<div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
							<ArrowRightIcon className="size-8 text-primary" weight="duotone" />
						</div>
						<h3 className="mb-2 font-semibold text-xl">
							<Trans>Ready to write your letter?</Trans>
						</h3>
						<p className="mb-6 max-w-md text-muted-foreground">
							<Trans>Choose a template suited to your situation and customize it with your information.</Trans>
						</p>
						<Button size="lg" className="gap-2" onClick={onNavigateToAll}>
							<ClipboardTextIcon className="size-5" />
							<Trans>View templates</Trans>
						</Button>
					</CardContent>
				</Card>
			</section>
		</>
	);
}

export function TemplatePreviewDialog({
	template,
	isOpen,
	onOpenChange,
	onCopy,
	onDownload,
}: {
	template: CoverLetterTemplate | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onCopy: (content: string) => void;
	onDownload: (template: CoverLetterTemplate) => void;
}) {
	const highlightPlaceholders = useCallback((content: string) => {
		const placeholderRegex = /\[([^\]]+)\]/g;
		const parts = content.split(placeholderRegex);

		return parts.map((part, index) => {
			if (index % 2 === 1) {
				return (
					<span
						key={index}
						className="inline-block rounded bg-primary/20 px-1 font-medium text-primary dark:bg-primary/30"
					>
						[{part}]
					</span>
				);
			}
			return part;
		});
	}, []);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden">
				{template && (
					<>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-3">
								<div
									className={cn("flex size-10 items-center justify-center rounded-lg", domainColors[template.domain])}
								>
									<template.icon className="size-5" weight="duotone" />
								</div>
								{template.name}
							</DialogTitle>
							<DialogDescription className="flex items-center gap-2">
								<Badge className={domainColors[template.domain]}>{domainLabels[template.domain]}</Badge>
								<Badge variant="outline" className={typeColors[template.type]}>
									{typeLabels[template.type]}
								</Badge>
							</DialogDescription>
						</DialogHeader>

						<div className="rounded-lg border bg-muted/30 p-4">
							<div className="mb-2 flex items-center gap-2 text-muted-foreground text-sm">
								<LightbulbIcon className="size-4" />
								<Trans>Elements in [brackets] should be customized</Trans>
							</div>
						</div>

						<ScrollArea className="max-h-[50vh] rounded-lg border bg-background p-6">
							<pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
								{highlightPlaceholders(template.content)}
							</pre>
						</ScrollArea>

						<DialogFooter className="gap-2 sm:gap-0">
							<DialogClose asChild>
								<Button variant="outline">
									<Trans>Close</Trans>
								</Button>
							</DialogClose>
							<Button variant="outline" className="gap-2" onClick={() => onDownload(template)}>
								<DownloadSimpleIcon className="size-4" />
								<Trans>Download</Trans>
							</Button>
							<Button
								className="gap-2"
								onClick={() => {
									onCopy(template.content);
								}}
							>
								<CopyIcon className="size-4" />
								<Trans>Copy</Trans>
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
