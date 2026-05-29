import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CheckCircleIcon,
	ClipboardTextIcon,
	CopyIcon,
	EnvelopeIcon,
	FunnelIcon,
	LightbulbIcon,
	MagnifyingGlassIcon,
	PencilSimpleIcon,
	PlusIcon,
	StarIcon,
	TagIcon,
	UserIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

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
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@/integrations/auth/client";
import { client, orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

import { DashboardHeader } from "../../-components/header";
import {
	categoryConfig,
	commonPersonalizationFields,
	INITIAL_TEMPLATES,
	MESSAGING_TIPS,
} from "./message-templates-config";
import type { MessageTemplate, PersonalizationField, TemplateCategory } from "./message-templates-types";

// Map a DB row to the frontend MessageTemplate shape
function toMessageTemplate(row: {
	id: string;
	name: string;
	category: string;
	subject: string | null;
	body: string;
	tags: string[];
	isFavorite: boolean;
	isCustom: boolean;
	personalizationFields: { key: string; label: string; placeholder: string; example: string }[];
	createdAt: Date;
	updatedAt: Date;
}): MessageTemplate {
	return {
		id: row.id,
		name: row.name,
		category: row.category as TemplateCategory,
		subject: row.subject ?? undefined,
		body: row.body,
		tags: row.tags,
		isFavorite: row.isFavorite,
		isCustom: row.isCustom,
		personalizationFields: row.personalizationFields,
		usageCount: 0,
		createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString().split("T")[0] : String(row.createdAt),
	};
}

export function MessageTemplatesPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();

	// Fetch templates from the database
	const { data: dbTemplates } = useQuery(
		orpc.messageTemplate.list.queryOptions({
			input: {},
			enabled: !!session?.user,
		}),
	);

	// Use DB templates if available, otherwise fall back to INITIAL_TEMPLATES
	const templates: MessageTemplate[] = useMemo(() => {
		if (!dbTemplates || dbTemplates.length === 0) return INITIAL_TEMPLATES;
		return dbTemplates.map(toMessageTemplate);
	}, [dbTemplates]);

	const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
	const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [tipsDialogOpen, setTipsDialogOpen] = useState(false);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	// New template form state
	const [newTemplateName, setNewTemplateName] = useState("");
	const [newTemplateCategory, setNewTemplateCategory] = useState<TemplateCategory>("email");
	const [newTemplateSubject, setNewTemplateSubject] = useState("");
	const [newTemplateBody, setNewTemplateBody] = useState("");
	const [newTemplateTags, setNewTemplateTags] = useState("");

	// Personalization values for preview
	const [personalizationValues, setPersonalizationValues] = useState<Record<string, string>>({});

	// Invalidation helper
	const invalidateTemplates = useCallback(() => {
		queryClient.invalidateQueries({
			queryKey: orpc.messageTemplate.list.queryOptions({ input: {} }).queryKey,
		});
	}, [queryClient]);

	// Mutations
	const createMutation = useMutation({
		mutationFn: (input: {
			name: string;
			category: string;
			subject?: string;
			body: string;
			tags: string[];
			personalizationFields: PersonalizationField[];
		}) => client.messageTemplate.create(input),
		onSuccess: () => invalidateTemplates(),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => client.messageTemplate.delete({ id }),
		onSuccess: () => invalidateTemplates(),
	});

	const toggleFavoriteMutation = useMutation({
		mutationFn: (id: string) => client.messageTemplate.toggleFavorite({ id }),
		onSuccess: () => invalidateTemplates(),
	});

	// Filter templates
	const filteredTemplates = useMemo(() => {
		return templates.filter((template) => {
			const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
			const matchesSearch =
				searchQuery === "" ||
				template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
			const matchesFavorite = !showFavoritesOnly || template.isFavorite;
			return matchesCategory && matchesSearch && matchesFavorite;
		});
	}, [templates, selectedCategory, searchQuery, showFavoritesOnly]);

	// Get category stats
	const categoryStats = useMemo(() => {
		const stats: Record<TemplateCategory | "all", number> = {
			all: templates.length,
			linkedin: templates.filter((t) => t.category === "linkedin").length,
			email: templates.filter((t) => t.category === "email").length,
			follow_up: templates.filter((t) => t.category === "follow_up").length,
			thank_you: templates.filter((t) => t.category === "thank_you").length,
		};
		return stats;
	}, [templates]);

	// Toggle favorite
	const toggleFavorite = useCallback(
		(templateId: string) => {
			toggleFavoriteMutation.mutate(templateId);
		},
		[toggleFavoriteMutation],
	);

	// Copy template to clipboard
	const copyToClipboard = useCallback(
		async (template: MessageTemplate) => {
			let content = template.body;

			// Replace placeholders with values if available
			for (const field of template.personalizationFields) {
				const value = personalizationValues[field.key] || field.placeholder;
				content = content.replace(new RegExp(field.key.replace(/[{}]/g, "\\$&"), "g"), value);
			}

			if (template.subject) {
				const subject = template.subject.replace(/\{\{[^}]+\}\}/g, (match) => personalizationValues[match] || match);
				content = `Subject: ${subject}\n\n${content}`;
			}

			await navigator.clipboard.writeText(content);
			setCopiedId(template.id);
			toast.success(t`Message copied to clipboard`);

			setTimeout(() => setCopiedId(null), 2000);
		},
		[personalizationValues],
	);

	// Open preview dialog
	const openPreview = useCallback((template: MessageTemplate) => {
		setSelectedTemplate(template);
		setPersonalizationValues({});
		setPreviewDialogOpen(true);
	}, []);

	// Reset new template form - defined before createTemplate which uses it
	const resetNewTemplateForm = useCallback(() => {
		setNewTemplateName("");
		setNewTemplateCategory("email");
		setNewTemplateSubject("");
		setNewTemplateBody("");
		setNewTemplateTags("");
	}, []);

	// Create new template
	const createTemplate = useCallback(() => {
		if (!newTemplateName.trim() || !newTemplateBody.trim()) {
			toast.error(t`Please fill in all required fields`);
			return;
		}

		// Extract personalization fields from body
		const fieldMatches = newTemplateBody.match(/\{\{[^}]+\}\}/g) || [];
		const uniqueFields = [...new Set(fieldMatches)];
		const personalizationFields: PersonalizationField[] = uniqueFields.map((field) => {
			const existing = commonPersonalizationFields.find((f) => f.key === field);
			if (existing) return existing;
			return {
				key: field,
				label: field.replace(/\{\{|\}\}/g, ""),
				placeholder: field.replace(/\{\{|\}\}/g, ""),
				example: field.replace(/\{\{|\}\}/g, ""),
			};
		});

		createMutation.mutate(
			{
				name: newTemplateName,
				category: newTemplateCategory,
				subject: newTemplateSubject || undefined,
				body: newTemplateBody,
				tags: newTemplateTags
					.split(",")
					.map((t) => t.trim())
					.filter((t) => t),
				personalizationFields,
			},
			{
				onSuccess: () => {
					setCreateDialogOpen(false);
					resetNewTemplateForm();
					toast.success(t`Template created successfully`);
				},
			},
		);
	}, [
		newTemplateName,
		newTemplateCategory,
		newTemplateSubject,
		newTemplateBody,
		newTemplateTags,
		resetNewTemplateForm,
		createMutation,
	]);

	// Delete custom template
	const deleteTemplate = useCallback(
		(templateId: string) => {
			deleteMutation.mutate(templateId, {
				onSuccess: () => {
					toast.success(t`Template deleted`);
				},
			});
		},
		[deleteMutation],
	);

	// Get personalized preview
	const getPersonalizedPreview = useCallback(
		(template: MessageTemplate) => {
			let content = template.body;
			for (const field of template.personalizationFields) {
				const value = personalizationValues[field.key] || `[${field.label}]`;
				content = content.replace(new RegExp(field.key.replace(/[{}]/g, "\\$&"), "g"), value);
			}
			return content;
		},
		[personalizationValues],
	);

	return (
		<>
			<DashboardHeader icon={EnvelopeIcon} title={t`Message Templates`} />

			<motion.div
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="space-y-6 p-6"
			>
				{/* Header Actions */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-1 items-center gap-3">
						{/* Search */}
						<div className="relative max-w-md flex-1">
							<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder={t`Search for templates...`}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>

						{/* Favorites Filter */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={showFavoritesOnly ? "default" : "outline"}
									size="icon"
									onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
								>
									<StarIcon className="size-4" weight={showFavoritesOnly ? "fill" : "regular"} />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<Trans>Show favorites only</Trans>
							</TooltipContent>
						</Tooltip>
					</div>

					<div className="flex items-center gap-2">
						{/* Tips Button */}
						<Button variant="outline" onClick={() => setTipsDialogOpen(true)}>
							<LightbulbIcon className="mr-2 size-4" />
							<Trans>Tips</Trans>
						</Button>

						{/* Create Template Button */}
						<Button onClick={() => setCreateDialogOpen(true)}>
							<PlusIcon className="mr-2 size-4" />
							<Trans>Create a template</Trans>
						</Button>
					</div>
				</div>

				{/* Category Tabs */}
				<Tabs
					value={selectedCategory}
					onValueChange={(value) => setSelectedCategory(value as TemplateCategory | "all")}
				>
					<TabsList className="grid w-full grid-cols-5">
						<TabsTrigger value="all" className="gap-2">
							<FunnelIcon className="size-4" />
							<span className="hidden sm:inline">
								<Trans>All</Trans>
							</span>
							<Badge variant="secondary" className="ml-1">
								{categoryStats.all}
							</Badge>
						</TabsTrigger>
						{(Object.keys(categoryConfig) as TemplateCategory[]).map((category) => {
							const config = categoryConfig[category];
							const CategoryIcon = config.icon;
							return (
								<TabsTrigger key={category} value={category} className="gap-2">
									<CategoryIcon className="size-4" />
									<span className="hidden sm:inline">{config.label}</span>
									<Badge variant="secondary" className="ml-1">
										{categoryStats[category]}
									</Badge>
								</TabsTrigger>
							);
						})}
					</TabsList>

					<TabsContent value={selectedCategory} className="mt-6">
						{/* Category Description */}
						{selectedCategory !== "all" && (
							<motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-lg bg-muted/50 p-4">
								<div className="flex items-center gap-3">
									{(() => {
										const config = categoryConfig[selectedCategory];
										const CategoryIcon = config.icon;
										return (
											<>
												<div className={cn("rounded-lg p-2", config.color)}>
													<CategoryIcon className="size-5" />
												</div>
												<div>
													<h3 className="font-medium">{config.label}</h3>
													<p className="text-muted-foreground text-sm">{config.description}</p>
												</div>
											</>
										);
									})()}
								</div>
							</motion.div>
						)}

						{/* Templates Grid */}
						<AnimatePresence mode="popLayout">
							{filteredTemplates.length === 0 ? (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className="py-12 text-center"
								>
									<ClipboardTextIcon className="mx-auto size-12 text-muted-foreground/50" />
									<h3 className="mt-4 font-medium text-lg">
										<Trans>No templates found</Trans>
									</h3>
									<p className="text-muted-foreground">
										<Trans>Try changing your filters or create a new template</Trans>
									</p>
								</motion.div>
							) : (
								<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{filteredTemplates.map((template, index) => (
										<motion.div
											key={template.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, scale: 0.95 }}
											transition={{ delay: index * 0.05 }}
										>
											<Card className="flex h-full flex-col transition-shadow hover:shadow-md">
												<CardHeader className="pb-3">
													<div className="flex items-start justify-between gap-2">
														<div className="min-w-0 flex-1">
															<div className="mb-2 flex items-center gap-2">
																<Badge className={categoryConfig[template.category].color}>
																	{categoryConfig[template.category].label}
																</Badge>
																{template.isCustom && (
																	<Badge variant="outline">
																		<Trans>Custom</Trans>
																	</Badge>
																)}
															</div>
															<CardTitle className="truncate text-base">{template.name}</CardTitle>
															{template.subject && (
																<CardDescription className="mt-1 truncate">
																	<Trans>Subject:</Trans> {template.subject}
																</CardDescription>
															)}
														</div>
														<Button
															variant="ghost"
															size="icon"
															className="shrink-0"
															onClick={() => toggleFavorite(template.id)}
														>
															<StarIcon
																className={cn("size-4", template.isFavorite && "fill-amber-500 text-amber-500")}
																weight={template.isFavorite ? "fill" : "regular"}
															/>
														</Button>
													</div>
												</CardHeader>

												<CardContent className="flex-1">
													{/* Preview */}
													<div className="mb-3 line-clamp-4 rounded-lg bg-muted/50 p-3 text-muted-foreground text-sm">
														{template.body}
													</div>

													{/* Tags */}
													<div className="flex flex-wrap gap-1">
														{template.tags.slice(0, 3).map((tag) => (
															<Badge key={tag} variant="outline" className="text-xs">
																<TagIcon className="mr-1 size-3" />
																{tag}
															</Badge>
														))}
														{template.tags.length > 3 && (
															<Badge variant="outline" className="text-xs">
																+{template.tags.length - 3}
															</Badge>
														)}
													</div>
												</CardContent>

												<CardFooter className="flex items-center justify-between border-t pt-3">
													<div className="flex items-center gap-1 text-muted-foreground text-xs">
														<CopyIcon className="size-3" />
														<span>{template.usageCount}</span>
													</div>

													<div className="flex items-center gap-2">
														{template.isCustom && (
															<Tooltip>
																<TooltipTrigger asChild>
																	<Button
																		variant="ghost"
																		size="icon"
																		className="size-8"
																		onClick={() => deleteTemplate(template.id)}
																	>
																		<XIcon className="size-4 text-destructive" />
																	</Button>
																</TooltipTrigger>
																<TooltipContent>
																	<Trans>Delete</Trans>
																</TooltipContent>
															</Tooltip>
														)}

														<Button variant="outline" size="sm" onClick={() => openPreview(template)}>
															<PencilSimpleIcon className="mr-1 size-3" />
															<Trans>Customize</Trans>
														</Button>

														<Tooltip>
															<TooltipTrigger asChild>
																<Button
																	variant="default"
																	size="icon"
																	className="size-8"
																	onClick={() => copyToClipboard(template)}
																>
																	{copiedId === template.id ? (
																		<CheckCircleIcon className="size-4" />
																	) : (
																		<CopyIcon className="size-4" />
																	)}
																</Button>
															</TooltipTrigger>
															<TooltipContent>
																<Trans>Copy</Trans>
															</TooltipContent>
														</Tooltip>
													</div>
												</CardFooter>
											</Card>
										</motion.div>
									))}
								</div>
							)}
						</AnimatePresence>
					</TabsContent>
				</Tabs>
			</motion.div>

			{/* Preview & Personalization Dialog */}
			<Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
				<DialogContent className="max-h-[90vh] max-w-3xl">
					<DialogHeader>
						<DialogTitle>{selectedTemplate?.name}</DialogTitle>
						<DialogDescription>
							<Trans>Customize your message before copying it</Trans>
						</DialogDescription>
					</DialogHeader>

					{selectedTemplate && (
						<div className="grid gap-6 md:grid-cols-2">
							{/* Personalization Fields */}
							<div className="space-y-4">
								<h4 className="flex items-center gap-2 font-medium">
									<UserIcon className="size-4" />
									<Trans>Personalization fields</Trans>
								</h4>
								<ScrollArea className="h-[300px] pr-4">
									<div className="space-y-3">
										{selectedTemplate.personalizationFields.map((field) => (
											<div key={field.key} className="space-y-1">
												<Label htmlFor={field.key} className="text-sm">
													{field.label}
												</Label>
												<Input
													id={field.key}
													placeholder={field.placeholder}
													value={personalizationValues[field.key] || ""}
													onChange={(e) =>
														setPersonalizationValues((prev) => ({
															...prev,
															[field.key]: e.target.value,
														}))
													}
												/>
												<p className="text-muted-foreground text-xs">
													<Trans>Ex:</Trans> {field.example}
												</p>
											</div>
										))}
									</div>
								</ScrollArea>
							</div>

							{/* Preview */}
							<div className="space-y-4">
								<h4 className="flex items-center gap-2 font-medium">
									<ClipboardTextIcon className="size-4" />
									<Trans>Preview</Trans>
								</h4>
								<ScrollArea className="h-[300px] pr-4">
									<div className="rounded-lg bg-muted/50 p-4">
										{selectedTemplate.subject && (
											<>
												<p className="mb-2 font-medium text-sm">
													<Trans>Subject:</Trans>{" "}
													{selectedTemplate.subject.replace(
														/\{\{[^}]+\}\}/g,
														(match) => personalizationValues[match] || `[${match.replace(/\{\{|\}\}/g, "")}]`,
													)}
												</p>
												<Separator className="my-3" />
											</>
										)}
										<p className="whitespace-pre-wrap text-sm">{getPersonalizedPreview(selectedTemplate)}</p>
									</div>
								</ScrollArea>
							</div>
						</div>
					)}

					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">
								<Trans>Close</Trans>
							</Button>
						</DialogClose>
						{selectedTemplate && (
							<Button onClick={() => copyToClipboard(selectedTemplate)}>
								{copiedId === selectedTemplate.id ? (
									<>
										<CheckCircleIcon className="mr-2 size-4" />
										<Trans>Copied!</Trans>
									</>
								) : (
									<>
										<CopyIcon className="mr-2 size-4" />
										<Trans>Copy message</Trans>
									</>
								)}
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Create Template Dialog */}
			<Dialog
				open={createDialogOpen}
				onOpenChange={(open) => {
					setCreateDialogOpen(open);
					if (!open) resetNewTemplateForm();
				}}
			>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							<Trans>Create a new template</Trans>
						</DialogTitle>
						<DialogDescription>
							<Trans>Create your own message template. Use the {"{{FIELD}}"} syntax for customizable fields.</Trans>
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="template-name">
									<Trans>Template name</Trans> *
								</Label>
								<Input
									id="template-name"
									placeholder={t`E.g.: Follow-up message after event`}
									value={newTemplateName}
									onChange={(e) => setNewTemplateName(e.target.value)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="template-category">
									<Trans>Category</Trans>
								</Label>
								<Select
									value={newTemplateCategory}
									onValueChange={(value) => setNewTemplateCategory(value as TemplateCategory)}
								>
									<SelectTrigger id="template-category">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{(Object.keys(categoryConfig) as TemplateCategory[]).map((category) => (
											<SelectItem key={category} value={category}>
												{categoryConfig[category].label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{(newTemplateCategory === "email" || newTemplateCategory === "follow_up") && (
							<div className="space-y-2">
								<Label htmlFor="template-subject">
									<Trans>Subject (optional)</Trans>
								</Label>
								<Input
									id="template-subject"
									placeholder={t`E.g.: Following our meeting - {{COMMON_INTEREST}}`}
									value={newTemplateSubject}
									onChange={(e) => setNewTemplateSubject(e.target.value)}
								/>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="template-body">
								<Trans>Message body</Trans> *
							</Label>
							<Textarea
								id="template-body"
								placeholder={t`Hello {{NAME}},\n\nYour message here...\n\nBest regards,\n{{MY_NAME}}`}
								value={newTemplateBody}
								onChange={(e) => setNewTemplateBody(e.target.value)}
								className="min-h-[200px]"
							/>
							<p className="text-muted-foreground text-xs">
								<Trans>
									Available fields: {"{{NAME}}"}, {"{{COMPANY}}"}, {"{{POSITION}}"}, {"{{MY_NAME}}"},{" "}
									{"{{COMMON_INTEREST}}"}, {"{{SKILL}}"}
								</Trans>
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="template-tags">
								<Trans>Tags (separated by commas)</Trans>
							</Label>
							<Input
								id="template-tags"
								placeholder={t`E.g.: follow-up, event, networking`}
								value={newTemplateTags}
								onChange={(e) => setNewTemplateTags(e.target.value)}
							/>
						</div>
					</div>

					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">
								<Trans>Cancel</Trans>
							</Button>
						</DialogClose>
						<Button onClick={createTemplate}>
							<PlusIcon className="mr-2 size-4" />
							<Trans>Create template</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Tips Dialog */}
			<Dialog open={tipsDialogOpen} onOpenChange={setTipsDialogOpen}>
				<DialogContent className="max-h-[90vh] max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<LightbulbIcon className="size-5 text-amber-500" />
							<Trans>Tips for effective messages</Trans>
						</DialogTitle>
						<DialogDescription>
							<Trans>Improve your response rates with these best practices</Trans>
						</DialogDescription>
					</DialogHeader>

					<ScrollArea className="h-[400px] pr-4">
						<div className="space-y-4">
							{MESSAGING_TIPS.map((tip, index) => {
								const TipIcon = tip.icon;
								return (
									<motion.div
										key={tip.id}
										initial={false}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.05 }}
									>
										<Card>
											<CardContent className="p-4">
												<div className="flex gap-4">
													<div
														className={cn(
															"shrink-0 rounded-lg p-2",
															tip.category === "general"
																? "bg-gray-100 dark:bg-gray-800"
																: categoryConfig[tip.category as TemplateCategory]?.color,
														)}
													>
														<TipIcon className="size-5" />
													</div>
													<div>
														<h4 className="mb-1 font-medium">{tip.title}</h4>
														<p className="text-muted-foreground text-sm">{tip.description}</p>
														{tip.category !== "general" && (
															<Badge variant="outline" className="mt-2">
																{categoryConfig[tip.category as TemplateCategory]?.label}
															</Badge>
														)}
													</div>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								);
							})}
						</div>
					</ScrollArea>

					<DialogFooter>
						<DialogClose asChild>
							<Button>
								<Trans>Got it!</Trans>
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
