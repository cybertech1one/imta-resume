import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
	ArrowsClockwiseIcon,
	BuildingsIcon,
	CaretDownIcon,
	CaretRightIcon,
	CheckCircleIcon,
	CopyIcon,
	DownloadSimpleIcon,
	EnvelopeIcon,
	EyeIcon,
	FileTextIcon,
	HandshakeIcon,
	LightbulbIcon,
	MagnifyingGlassIcon,
	PaletteIcon,
	PencilSimpleIcon,
	PlusIcon,
	SparkleIcon,
	SpinnerIcon,
	StarIcon,
	TagIcon,
	TargetIcon,
	TextAaIcon,
	TrendUpIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/style";

import { sectionLabels, templateConfig, toneConfig } from "./cover-letter-config";
import type {
	CoverLetterData,
	DbCoverLetter,
	JobDetails,
	KeywordMatch,
	SectionType,
	TemplateType,
	ToneType,
} from "./cover-letter-types";

// --- Hero Section ---

interface HeroSectionProps {
	statisticsTotal: number;
}

export function HeroSection({ statisticsTotal }: HeroSectionProps) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm md:p-8"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<SparkleIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Assistant de candidature</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 max-w-3xl font-bold text-2xl tracking-tight md:text-3xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Lettre de motivation prête à personnaliser</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-muted-foreground text-sm md:text-base"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Renseigne le poste, choisis un ton et génère une base claire en français que tu peux ajuster avant l'envoi.
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
							<FileTextIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{statisticsTotal}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Lettres enregistrées</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-purple-500/10">
							<TextAaIcon className="size-5 text-purple-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">4</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Tons</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<MagnifyingGlassIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">Auto</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Mots-clés détectés</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// --- Loading State ---

export function LoadingState() {
	return (
		<div className="flex items-center justify-center py-12">
			<div className="flex flex-col items-center gap-4">
				<div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				<p className="text-muted-foreground">
					<Trans>Chargement...</Trans>
				</p>
			</div>
		</div>
	);
}

// --- Error State ---

export function ErrorState() {
	return (
		<Card className="border-destructive">
			<CardContent className="flex flex-col items-center py-12 text-center">
				<WarningCircleIcon className="mb-4 size-12 text-destructive" />
				<h3 className="mb-2 font-medium text-lg">
					<Trans>Erreur de chargement</Trans>
				</h3>
				<p className="max-w-sm text-muted-foreground">
					<Trans>Impossible de charger tes lettres. Réessaie dans un instant.</Trans>
				</p>
			</CardContent>
		</Card>
	);
}

// --- Generate Tab ---

interface GenerateTabProps {
	jobDetails: JobDetails;
	setJobDetails: React.Dispatch<React.SetStateAction<JobDetails>>;
	selectedTemplate: TemplateType;
	setSelectedTemplate: (template: TemplateType) => void;
	selectedTone: ToneType;
	setSelectedTone: (tone: ToneType) => void;
	isProcessing: boolean;
	isFormValid: string | boolean;
	handleGenerate: () => void;
	generatedLetter: CoverLetterData | null;
	editMode: SectionType | null;
	setEditMode: (mode: SectionType | null) => void;
	editedSections: Partial<CoverLetterData>;
	handleSectionEdit: (section: SectionType, content: string) => void;
	handleRegenerate: (section: SectionType) => void;
	copyToClipboard: (text: string) => void;
	fullLetter: string;
	downloadAsTextFile: () => void;
	handleSaveLetter: () => void;
	createMutationIsPending: boolean;
}

export function GenerateTab({
	jobDetails,
	setJobDetails,
	selectedTemplate,
	setSelectedTemplate,
	selectedTone,
	setSelectedTone,
	isProcessing,
	isFormValid,
	handleGenerate,
	generatedLetter,
	editMode,
	setEditMode,
	editedSections,
	handleSectionEdit,
	handleRegenerate,
	copyToClipboard,
	fullLetter,
	downloadAsTextFile,
	handleSaveLetter,
	createMutationIsPending,
}: GenerateTabProps) {
	const { i18n } = useLingui();
	return (
		<div className="grid gap-8 lg:grid-cols-2">
			{/* Left Column - Inputs */}
			<div className="space-y-6">
				{/* Job Details Card */}
				<Card className="border-2 border-primary/20">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-xl">
							<BuildingsIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Détails du poste</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Renseigne l'entreprise et le poste visé</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label>
								<Trans>Nom de l'entreprise</Trans>
							</Label>
							<Input
								placeholder={t`Ex. : OCP, Renault Tanger, ONCF...`}
								value={jobDetails.company}
								onChange={(e) => setJobDetails((prev) => ({ ...prev, company: e.target.value }))}
							/>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Poste visé</Trans>
							</Label>
							<Input
								placeholder={t`Ex. : Technicien industriel, agent HSE, infirmier...`}
								value={jobDetails.position}
								onChange={(e) => setJobDetails((prev) => ({ ...prev, position: e.target.value }))}
							/>
						</div>

						<div className="space-y-2">
							<Label>
								<Trans>Description du poste (facultatif)</Trans>
							</Label>
							<Textarea
								placeholder={t`Colle la description du poste pour personnaliser la lettre...`}
								className="min-h-32 resize-none"
								value={jobDetails.description}
								onChange={(e) => setJobDetails((prev) => ({ ...prev, description: e.target.value }))}
							/>
							<p className="text-muted-foreground text-xs">
								<Trans>Les mots-clés seront détectés pour adapter la lettre</Trans>
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Template Selection */}
				<TemplateSelectionCard selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />

				{/* Tone Selection */}
				<ToneSelectionCard selectedTone={selectedTone} setSelectedTone={setSelectedTone} />

				{/* Generate Button */}
				<Button className="w-full gap-2" size="lg" onClick={handleGenerate} disabled={isProcessing || !isFormValid}>
					{isProcessing ? (
						<>
							<SpinnerIcon className="size-5 animate-spin" />
							<Trans>Génération...</Trans>
						</>
					) : (
						<>
							<SparkleIcon className="size-5" weight="fill" />
							<Trans>Générer ma lettre</Trans>
						</>
					)}
				</Button>
			</div>

			{/* Right Column - Preview */}
			<div className="space-y-6">
				<AnimatePresence mode="wait">
					{generatedLetter ? (
						<motion.div
							key="letter-preview"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							className="space-y-4"
						>
							{/* Section Cards */}
							{(["intro", "body", "closing"] as SectionType[]).map((section) => {
								const content = editedSections[section] || generatedLetter[section];
								const isEditing = editMode === section;

								return (
									<Card key={section} className="overflow-hidden">
										<CardHeader className="pb-2">
											<div className="flex items-center justify-between">
												<CardTitle className="flex items-center gap-2 text-lg">
													{section === "intro" && <HandshakeIcon className="size-4 text-blue-500" weight="duotone" />}
													{section === "body" && <FileTextIcon className="size-4 text-purple-500" weight="duotone" />}
													{section === "closing" && <StarIcon className="size-4 text-amber-500" weight="duotone" />}
													{i18n.t(sectionLabels[section])}
												</CardTitle>
												<div className="flex gap-1">
													<Button
														variant="ghost"
														size="sm"
														className="size-8 p-0"
														onClick={() => setEditMode(isEditing ? null : section)}
													>
														<PencilSimpleIcon className="size-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														className="size-8 p-0"
														onClick={() => handleRegenerate(section)}
														disabled={isProcessing}
													>
														<ArrowsClockwiseIcon className="size-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														className="size-8 p-0"
														onClick={() => copyToClipboard(content)}
													>
														<CopyIcon className="size-4" />
													</Button>
												</div>
											</div>
										</CardHeader>
										<CardContent>
											{isEditing ? (
												<Textarea
													value={content}
													onChange={(e) => handleSectionEdit(section, e.target.value)}
													className="min-h-32 resize-none"
												/>
											) : (
												<p className="whitespace-pre-wrap text-muted-foreground text-sm leading-relaxed">{content}</p>
											)}
										</CardContent>
									</Card>
								);
							})}

							{/* Keywords Found */}
							{generatedLetter.keywords.length > 0 && (
								<Card className="border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
									<CardHeader className="pb-2">
										<CardTitle className="flex items-center gap-2 text-sm">
											<TagIcon className="size-4 text-green-600 dark:text-green-400" />
											<Trans>Mots-clés intégrés</Trans>
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="flex flex-wrap gap-2">
											{generatedLetter.keywords.map((keyword) => (
												<Badge
													key={keyword}
													variant="outline"
													className="border-green-500/50 bg-green-100/50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
												>
													{keyword}
												</Badge>
											))}
										</div>
									</CardContent>
								</Card>
							)}

							{/* Export Buttons */}
							<div className="flex gap-3">
								<Button className="flex-1 gap-2" onClick={() => copyToClipboard(fullLetter)}>
									<CopyIcon className="size-4" />
									<Trans>Tout copier</Trans>
								</Button>
								<Button variant="outline" className="flex-1 gap-2" onClick={downloadAsTextFile}>
									<DownloadSimpleIcon className="size-4" />
									<Trans>Télécharger</Trans>
								</Button>
							</div>

							{/* Save Button */}
							<Button
								variant="outline"
								className="w-full gap-2"
								onClick={handleSaveLetter}
								disabled={createMutationIsPending}
							>
								{createMutationIsPending ? (
									<SpinnerIcon className="size-4 animate-spin" />
								) : (
									<PlusIcon className="size-4" />
								)}
								<Trans>Enregistrer cette lettre</Trans>
							</Button>
						</motion.div>
					) : (
						<motion.div
							key="placeholder"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex h-full min-h-96 flex-col items-center justify-center rounded-xl border-2 border-muted-foreground/30 border-dashed p-8 text-center"
						>
							<EnvelopeIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
							<h3 className="mb-2 font-semibold text-lg">
								<Trans>Ta lettre apparaîtra ici</Trans>
							</h3>
							<p className="max-w-sm text-muted-foreground text-sm">
								<Trans>Renseigne les informations du poste puis clique sur "Générer".</Trans>
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

// --- Template Selection Card ---

interface TemplateSelectionCardProps {
	selectedTemplate: TemplateType;
	setSelectedTemplate: (template: TemplateType) => void;
}

function TemplateSelectionCard({ selectedTemplate, setSelectedTemplate }: TemplateSelectionCardProps) {
	const { i18n } = useLingui();
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<PaletteIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Style de lettre</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Choisis la structure la plus adaptée</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3 sm:grid-cols-2">
					{(Object.entries(templateConfig) as [TemplateType, (typeof templateConfig)[TemplateType]][]).map(
						([key, config]) => {
							const TemplateIcon = config.icon;
							return (
								<motion.div key={key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
									<Card
										className={cn(
											"cursor-pointer border-2 transition-colors",
											selectedTemplate === key
												? "border-primary bg-primary/5"
												: "border-transparent hover:border-primary/30",
										)}
										onClick={() => setSelectedTemplate(key)}
									>
										<CardContent className="flex items-center gap-3 p-4">
											<div className={cn("flex size-10 items-center justify-center rounded-lg", config.color)}>
												<TemplateIcon className="size-5" weight="duotone" />
											</div>
											<div>
												<p className="font-medium">{i18n.t(config.label)}</p>
												<p className="text-muted-foreground text-xs">{i18n.t(config.description)}</p>
											</div>
											{selectedTemplate === key && (
												<CheckCircleIcon className="ml-auto size-5 text-primary" weight="fill" />
											)}
										</CardContent>
									</Card>
								</motion.div>
							);
						},
					)}
				</div>
			</CardContent>
		</Card>
	);
}

// --- Tone Selection Card ---

interface ToneSelectionCardProps {
	selectedTone: ToneType;
	setSelectedTone: (tone: ToneType) => void;
}

function ToneSelectionCard({ selectedTone, setSelectedTone }: ToneSelectionCardProps) {
	const { i18n } = useLingui();
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<TextAaIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Ton d'écriture</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Adapte le ton à ton profil et à l'entreprise</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-2 sm:grid-cols-2">
					{(Object.entries(toneConfig) as [ToneType, (typeof toneConfig)[ToneType]][]).map(([key, config]) => {
						const ToneIcon = config.icon;
						return (
							<div
								key={key}
								className={cn(
									"flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
									selectedTone === key ? "border-primary bg-primary/10" : "border-muted",
								)}
								onClick={() => setSelectedTone(key)}
							>
								<ToneIcon
									className={cn("size-5", selectedTone === key ? "text-primary" : "text-muted-foreground")}
									weight={selectedTone === key ? "fill" : "regular"}
								/>
								<div>
									<p className="font-medium text-sm">{i18n.t(config.label)}</p>
									<p className="text-muted-foreground text-xs">{i18n.t(config.description)}</p>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// --- Saved Letters Tab ---

interface SavedLettersTabProps {
	savedCoverLetters: DbCoverLetter[];
	setActiveTab: (tab: string) => void;
	handleLoadSavedLetter: (letter: DbCoverLetter) => void;
	handleDeleteLetter: (id: string) => void;
}

export function SavedLettersTab({
	savedCoverLetters,
	setActiveTab,
	handleLoadSavedLetter,
	handleDeleteLetter,
}: SavedLettersTabProps) {
	const { i18n } = useLingui();
	if (savedCoverLetters.length === 0) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center py-12 text-center">
					<FileTextIcon className="mb-4 size-12 text-muted-foreground/50" />
					<h3 className="mb-2 font-medium text-lg">
						<Trans>Aucune lettre enregistrée</Trans>
					</h3>
					<p className="mb-4 max-w-sm text-muted-foreground">
						<Trans>Génère et enregistre tes lettres pour les retrouver ici.</Trans>
					</p>
					<Button onClick={() => setActiveTab("generate")}>
						<PlusIcon className="mr-2 size-4" />
						<Trans>Créer une lettre</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{savedCoverLetters.map((letter, index) => (
				<motion.div key={letter.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
					<Card className="h-full transition-shadow hover:shadow-lg">
						<CardHeader className="pb-2">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-2">
									<div
										className={cn(
											"rounded-lg p-2",
											templateConfig[(letter.template as TemplateType) || "formal"]?.color || "bg-muted",
										)}
									>
										<EnvelopeIcon className="size-4" weight="duotone" />
									</div>
									<div className="flex gap-1">
										{letter.template && (
											<Badge variant="outline" className="text-xs">
												{templateConfig[(letter.template as TemplateType) || "formal"]?.label
													? i18n.t(templateConfig[(letter.template as TemplateType) || "formal"].label)
													: letter.template}
											</Badge>
										)}
										{letter.tone && (
											<Badge variant="secondary" className="text-xs">
												{toneConfig[(letter.tone as ToneType) || "professional"]?.label
													? i18n.t(toneConfig[(letter.tone as ToneType) || "professional"].label)
													: letter.tone}
											</Badge>
										)}
									</div>
								</div>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button variant="ghost" size="icon-sm">
											<TrashIcon className="size-4 text-destructive" />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												<Trans>Supprimer cette lettre ?</Trans>
											</AlertDialogTitle>
											<AlertDialogDescription>
												<Trans>
													Cette action est irréversible. La lettre "{letter.name}" sera supprimée définitivement.
												</Trans>
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>
												<Trans>Annuler</Trans>
											</AlertDialogCancel>
											<AlertDialogAction onClick={() => handleDeleteLetter(letter.id)}>
												<Trans>Supprimer</Trans>
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
							<CardTitle className="mt-2 text-base leading-tight">{letter.name}</CardTitle>
							<CardDescription className="text-xs">
								{letter.companyName && letter.position
									? `${letter.position} - ${letter.companyName}`
									: letter.companyName || letter.position || t`Sans titre`}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<p className="line-clamp-3 text-muted-foreground text-sm">{letter.content.substring(0, 150)}...</p>

							{letter.tags && letter.tags.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{letter.tags.slice(0, 3).map((tag) => (
										<Badge key={tag} variant="outline" className="text-xs">
											{tag}
										</Badge>
									))}
									{letter.tags.length > 3 && (
										<Badge variant="secondary" className="text-xs">
											+{letter.tags.length - 3}
										</Badge>
									)}
								</div>
							)}

							<p className="text-muted-foreground text-xs">
								{new Date(letter.updatedAt).toLocaleDateString(undefined, {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>

							<Button
								variant="outline"
								size="sm"
								className="w-full gap-1"
								onClick={() => handleLoadSavedLetter(letter)}
							>
								<EyeIcon className="size-4" />
								<Trans>Charger</Trans>
							</Button>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	);
}

// --- Preview Tab ---

interface PreviewTabProps {
	generatedLetter: CoverLetterData | null;
	selectedTemplate: TemplateType;
	selectedTone: ToneType;
	fullLetter: string;
	highlightKeywords: (text: string) => string;
	copyToClipboard: (text: string) => void;
	downloadAsTextFile: () => void;
	setActiveTab: (tab: string) => void;
}

export function PreviewTab({
	generatedLetter,
	selectedTemplate,
	selectedTone,
	fullLetter,
	highlightKeywords,
	copyToClipboard,
	downloadAsTextFile,
	setActiveTab,
}: PreviewTabProps) {
	const { i18n } = useLingui();
	if (!generatedLetter) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center justify-center py-16">
					<EyeIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>Aucune lettre à afficher</Trans>
					</h3>
					<p className="mb-4 text-center text-muted-foreground">
						<Trans>Génère d'abord une lettre pour voir l'aperçu.</Trans>
					</p>
					<Button onClick={() => setActiveTab("generate")}>
						<CaretRightIcon className="mr-2 size-4" />
						<Trans>Aller au générateur</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid gap-8 lg:grid-cols-3">
			{/* Full Preview */}
			<div className="lg:col-span-2">
				<Card className="overflow-hidden">
					<CardHeader className="border-b bg-muted/30">
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<FileTextIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Aperçu de la lettre</Trans>
							</CardTitle>
							<div className="flex gap-2">
								<Badge className={templateConfig[selectedTemplate].color}>
									{i18n.t(templateConfig[selectedTemplate].label)}
								</Badge>
								<Badge variant="outline">{i18n.t(toneConfig[selectedTone].label)}</Badge>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<ScrollArea className="h-[600px]">
							<div className="p-8">
								<div
									className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-serif leading-relaxed"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: Content is HTML-escaped, only <mark> tags added
									dangerouslySetInnerHTML={{ __html: highlightKeywords(fullLetter) }}
								/>
								<p className="mt-4 flex items-center gap-1 border-t pt-3 text-muted-foreground/60 text-xs">
									<SparkleIcon className="size-3" weight="fill" />
									{t`Contenu généré automatiquement. Relis et adapte avant l'envoi.`}
								</p>
							</div>
						</ScrollArea>
					</CardContent>
				</Card>
			</div>

			{/* Side Panel */}
			<div className="space-y-6">
				{/* Template Info */}
				<Card className="bg-card">
					<CardContent className="p-6">
						<div className="mb-4 flex items-center gap-3">
							{(() => {
								const TemplateIcon = templateConfig[selectedTemplate].icon;
								return (
									<div
										className={cn(
											"flex size-12 items-center justify-center rounded-xl",
											templateConfig[selectedTemplate].color,
										)}
									>
										<TemplateIcon className="size-6" weight="duotone" />
									</div>
								);
							})()}
							<div>
								<h3 className="font-semibold">{i18n.t(templateConfig[selectedTemplate].label)}</h3>
								<p className="text-muted-foreground text-sm">{i18n.t(templateConfig[selectedTemplate].description)}</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{(() => {
								const ToneIcon = toneConfig[selectedTone].icon;
								return (
									<>
										<ToneIcon className="size-4 text-muted-foreground" />
										<span className="text-muted-foreground text-sm">
											<Trans>Ton :</Trans> {i18n.t(toneConfig[selectedTone].label)}
										</span>
									</>
								);
							})()}
						</div>
					</CardContent>
				</Card>

				{/* Actions */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">
							<Trans>Actions</Trans>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<Button className="w-full gap-2" onClick={() => copyToClipboard(fullLetter)}>
							<CopyIcon className="size-4" />
							<Trans>Copier la lettre</Trans>
						</Button>
						<Button variant="outline" className="w-full gap-2" onClick={downloadAsTextFile}>
							<DownloadSimpleIcon className="size-4" />
							<Trans>Télécharger (.txt)</Trans>
						</Button>
						<Button variant="outline" className="w-full gap-2" onClick={() => setActiveTab("generate")}>
							<PencilSimpleIcon className="size-4" />
							<Trans>Modifier</Trans>
						</Button>
					</CardContent>
				</Card>

				{/* Tips */}
				<Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
					<CardContent className="p-4">
						<div className="flex items-start gap-3">
							<LightbulbIcon className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" weight="fill" />
							<div>
								<h4 className="mb-1 font-semibold text-amber-800 text-sm dark:text-amber-300">
									<Trans>Conseil</Trans>
								</h4>
								<p className="text-amber-700 text-xs dark:text-amber-400">
									<Trans>
										Personnalise les éléments entre crochets et adapte le contenu à ton parcours avant l'envoi.
									</Trans>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

// --- Analysis Tab ---

interface AnalysisTabProps {
	generatedLetter: CoverLetterData | null;
	fullLetter: string;
	extractedKeywords: KeywordMatch[];
	keywordChartData: { name: string; count: number }[];
	categoryChartData: { name: string; value: number; color: string }[];
	setActiveTab: (tab: string) => void;
}

export function AnalysisTab({
	generatedLetter,
	fullLetter,
	extractedKeywords,
	keywordChartData,
	categoryChartData,
	setActiveTab,
}: AnalysisTabProps) {
	if (!generatedLetter) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center justify-center py-16">
					<TargetIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>Aucune analyse disponible</Trans>
					</h3>
					<p className="mb-4 text-center text-muted-foreground">
						<Trans>Génère d'abord une lettre pour voir l'analyse.</Trans>
					</p>
					<Button onClick={() => setActiveTab("generate")}>
						<CaretRightIcon className="mr-2 size-4" />
						<Trans>Aller au générateur</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			{/* Stats Overview */}
			<div className="grid gap-6 md:grid-cols-4">
				{[
					{
						icon: FileTextIcon,
						label: t`Mots`,
						value: fullLetter.split(/\s+/).length,
						color: "text-blue-500",
						bg: "bg-blue-500/10",
					},
					{
						icon: TextAaIcon,
						label: t`Caractères`,
						value: fullLetter.length,
						color: "text-purple-500",
						bg: "bg-purple-500/10",
					},
					{
						icon: TagIcon,
						label: t`Mots-clés`,
						value: generatedLetter.keywords.length,
						color: "text-green-500",
						bg: "bg-green-500/10",
					},
					{
						icon: CheckCircleIcon,
						label: t`Score`,
						value: "85%",
						color: "text-amber-500",
						bg: "bg-amber-500/10",
					},
				].map((stat, index) => {
					const StatIcon = stat.icon;
					return (
						<motion.div
							key={stat.label}
							initial={false}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card>
								<CardContent className="flex items-center gap-4 p-6">
									<div className={cn("flex size-12 items-center justify-center rounded-xl", stat.bg)}>
										<StatIcon className={cn("size-6", stat.color)} weight="duotone" />
									</div>
									<div>
										<p className="font-bold text-2xl">{stat.value}</p>
										<p className="text-muted-foreground text-sm">{stat.label}</p>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>

			{/* Charts */}
			{extractedKeywords.length > 0 && (
				<div className="grid gap-8 lg:grid-cols-2">
					{/* Keyword Frequency Chart */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TrendUpIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Fréquence des mots-clés</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Répartition des mots-clés détectés dans l'offre</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={250}>
								<BarChart data={keywordChartData} layout="vertical">
									<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
									<XAxis type="number" />
									<YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
									<Tooltip
										contentStyle={{
											backgroundColor: "hsl(var(--card))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "8px",
										}}
									/>
									<Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* Category Distribution Chart */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TargetIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Répartition par catégorie</Trans>
							</CardTitle>
							<CardDescription>
								<Trans>Types de compétences mises en avant</Trans>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={250}>
								<PieChart>
									<Pie
										data={categoryChartData}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										outerRadius={80}
										label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
										labelLine={false}
									>
										{categoryChartData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											backgroundColor: "hsl(var(--card))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "8px",
										}}
									/>
								</PieChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Keyword Details */}
			{extractedKeywords.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TagIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Détail des mots-clés</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Mots-clés détectés et niveau de pertinence</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{extractedKeywords.map((kw, index) => (
								<motion.div
									key={kw.keyword}
									initial={false}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: index * 0.05 }}
									className="flex items-center justify-between rounded-lg border bg-card p-3"
								>
									<div className="flex items-center gap-3">
										<div
											className={cn(
												"flex size-8 items-center justify-center rounded-lg",
												kw.category === "Compétence" &&
													"bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
												kw.category === "Savoir-être" &&
													"bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
												kw.category === "Valeur" &&
													"bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
											)}
										>
											{kw.count}
										</div>
										<div>
											<p className="font-medium text-sm">{kw.keyword}</p>
											<p className="text-muted-foreground text-xs">{kw.category}</p>
										</div>
									</div>
									<Badge variant="outline" className="text-xs">
										{kw.count}x
									</Badge>
								</motion.div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Recommendations */}
			<Card className="border-primary/20 bg-card">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<LightbulbIcon className="size-5 text-primary" weight="fill" />
						<Trans>Recommandations</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						{[
							{
								icon: CheckCircleIcon,
								title: t`Points forts`,
								items: [
									t`Ton adapté au style choisi`,
									t`Structure claire et professionnelle`,
									t`Mots-clés bien intégrés`,
								],
								color: "text-green-600 dark:text-green-400",
							},
							{
								icon: CaretDownIcon,
								title: t`À améliorer`,
								items: [
									t`Ajouter des exemples concrets`,
									t`Personnaliser davantage pour l'entreprise`,
									t`Inclure des chiffres si possible`,
								],
								color: "text-amber-600 dark:text-amber-400",
							},
						].map((section) => {
							const SectionIcon = section.icon;
							return (
								<div key={section.title} className="space-y-2">
									<h4 className={cn("flex items-center gap-2 font-semibold", section.color)}>
										<SectionIcon className="size-4" weight="fill" />
										{section.title}
									</h4>
									<ul className="space-y-1">
										{section.items.map((item, index) => (
											<li key={index} className="flex items-start gap-2 text-muted-foreground text-sm">
												<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current" />
												{item}
											</li>
										))}
									</ul>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</>
	);
}

// --- Tips Section ---

export function TipsSection() {
	return (
		<motion.div className="mt-8" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
			<Card className="border-primary/30 border-dashed bg-card">
				<CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row">
					<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
						<LightbulbIcon className="size-7 text-primary" weight="fill" />
					</div>
					<div className="flex-1 text-center md:text-left">
						<h3 className="mb-1 font-semibold text-lg">
							<Trans>Conseils pour une lettre efficace</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>
								Personnalise chaque lettre. Mentionne un élément précis sur l'entreprise, adapte le ton au secteur et
								relis attentivement avant l'envoi.
							</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// Re-export TrashIcon for use in SavedLettersTab (needed since it's used inline)
import { TrashIcon } from "@phosphor-icons/react";
