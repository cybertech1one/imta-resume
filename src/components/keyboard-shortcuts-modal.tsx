import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowsOutCardinalIcon,
	CommandIcon,
	GearIcon,
	KeyboardIcon,
	MagnifyingGlassIcon,
	NavigationArrowIcon,
	PencilSimpleIcon,
	SparkleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ShortcutCategory } from "@/integrations/drizzle/schema";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

// Check if running on macOS
const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

// Format key for display
function formatKey(key: string): string {
	const keyMap: Record<string, string> = {
		mod: isMac ? "Cmd" : "Ctrl",
		meta: isMac ? "Cmd" : "Win",
		ctrl: "Ctrl",
		alt: isMac ? "Option" : "Alt",
		shift: "Shift",
		escape: "Esc",
		backspace: "Backspace",
		enter: "Enter",
		space: "Space",
		arrowup: "Up",
		arrowdown: "Down",
		arrowleft: "Left",
		arrowright: "Right",
	};

	const normalizedKey = key.toLowerCase();
	return keyMap[normalizedKey] || key.toUpperCase();
}

// Get icon for category
function getCategoryIcon(category: ShortcutCategory): Icon {
	switch (category) {
		case "navigation":
			return NavigationArrowIcon;
		case "actions":
			return SparkleIcon;
		case "editor":
			return PencilSimpleIcon;
		case "general":
			return GearIcon;
		default:
			return KeyboardIcon;
	}
}

// Get color for category
function getCategoryColor(category: ShortcutCategory): string {
	switch (category) {
		case "navigation":
			return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
		case "actions":
			return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
		case "editor":
			return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
		case "general":
			return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
		default:
			return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
	}
}

// Keyboard key component
function KeyCombo({ keys }: { keys: string[] }) {
	return (
		<KbdGroup>
			{keys.map((key, index) => (
				<span key={`${key}-${index}`} className="flex items-center gap-0.5">
					<Kbd>{formatKey(key)}</Kbd>
					{index < keys.length - 1 && <span className="text-muted-foreground text-xs">+</span>}
				</span>
			))}
		</KbdGroup>
	);
}

// Shortcut item component
function ShortcutItem({
	shortcut,
	onToggle,
	isToggling,
}: {
	shortcut: {
		id: string;
		category: ShortcutCategory;
		keys: string[];
		label: string;
		description: string;
		enabled: boolean;
		isCustomized: boolean;
	};
	onToggle: (shortcutId: string) => void;
	isToggling: boolean;
}) {
	return (
		<motion.div
			layout
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			className={cn(
				"group flex items-center justify-between gap-4 rounded-lg border p-3 transition-all",
				shortcut.enabled
					? "border-border bg-card hover:border-primary/30 hover:bg-muted/50"
					: "border-muted border-dashed bg-muted/30 opacity-60",
			)}
		>
			<div className="flex-1 space-y-1">
				<div className="flex items-center gap-2">
					<span className="font-medium text-sm">{shortcut.label}</span>
					{shortcut.isCustomized && (
						<Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
							<Trans>Personnalisé</Trans>
						</Badge>
					)}
				</div>
				<p className="text-muted-foreground text-xs">{shortcut.description}</p>
			</div>

			<div className="flex items-center gap-3">
				<KeyCombo keys={shortcut.keys} />
				<Switch
					checked={shortcut.enabled}
					onCheckedChange={() => onToggle(shortcut.id)}
					disabled={isToggling}
					className="data-[state=checked]:bg-primary"
				/>
			</div>
		</motion.div>
	);
}

// Category section component
function CategorySection({
	category,
	shortcuts,
	onToggle,
	isToggling,
}: {
	category: ShortcutCategory;
	shortcuts: Array<{
		id: string;
		category: ShortcutCategory;
		keys: string[];
		label: string;
		description: string;
		enabled: boolean;
		isCustomized: boolean;
	}>;
	onToggle: (shortcutId: string) => void;
	isToggling: boolean;
}) {
	const CategoryIcon = getCategoryIcon(category);
	const categoryLabels: Record<ShortcutCategory, string> = {
		navigation: t`Navigation`,
		actions: t`Actions`,
		editor: t`Éditeur`,
		general: t`Général`,
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<div className={cn("flex size-8 items-center justify-center rounded-lg", getCategoryColor(category))}>
					<CategoryIcon className="size-4" weight="duotone" />
				</div>
				<h3 className="font-semibold text-base">{categoryLabels[category]}</h3>
				<Badge variant="outline" className="ml-auto">
					{shortcuts.length}
				</Badge>
			</div>

			<div className="space-y-2">
				<AnimatePresence mode="popLayout">
					{shortcuts.map((shortcut) => (
						<ShortcutItem key={shortcut.id} shortcut={shortcut} onToggle={onToggle} isToggling={isToggling} />
					))}
				</AnimatePresence>
			</div>
		</div>
	);
}

export interface KeyboardShortcutsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
	const [search, setSearch] = useState("");
	const [activeTab, setActiveTab] = useState<"all" | ShortcutCategory>("all");
	const queryClient = useQueryClient();

	// Fetch shortcuts from the database
	const { data: shortcuts, isLoading } = useQuery({
		...orpc.shortcuts.getAll.queryOptions({ input: {} }),
		staleTime: 5 * 60 * 1000,
		enabled: open,
	});

	// Update shortcut mutation
	const updateShortcutMutation = useMutation(orpc.shortcuts.update.mutationOptions());

	// Reset to defaults mutation
	const resetMutation = useMutation(orpc.shortcuts.resetToDefaults.mutationOptions());

	const handleToggle = useCallback(
		async (shortcutId: string) => {
			// Find current shortcut state
			const shortcut = shortcuts?.find((s) => s.id === shortcutId);
			if (!shortcut) return;

			try {
				await updateShortcutMutation.mutateAsync({ shortcutId, enabled: !shortcut.enabled });
				queryClient.invalidateQueries({ queryKey: ["shortcuts"] });
			} catch {
				toast.error(t`Impossible de modifier le raccourci`);
			}
		},
		[shortcuts, updateShortcutMutation, queryClient],
	);

	const handleReset = useCallback(async () => {
		try {
			if (activeTab === "all") {
				await resetMutation.mutateAsync({});
			} else {
				await resetMutation.mutateAsync({ category: activeTab });
			}
			queryClient.invalidateQueries({ queryKey: ["shortcuts"] });
			toast.success(t`Raccourcis réinitialisés`);
		} catch {
			toast.error(t`Impossible de réinitialiser les raccourcis`);
		}
	}, [activeTab, resetMutation, queryClient]);

	// Filter shortcuts based on search and active tab
	const filteredShortcuts = useMemo(() => {
		if (!shortcuts) return [];

		return shortcuts.filter((shortcut) => {
			// Filter by tab
			if (activeTab !== "all" && shortcut.category !== activeTab) {
				return false;
			}

			// Filter by search
			if (search) {
				const searchLower = search.toLowerCase();
				return (
					shortcut.label.toLowerCase().includes(searchLower) ||
					shortcut.description.toLowerCase().includes(searchLower) ||
					shortcut.keys.some((key) => formatKey(key).toLowerCase().includes(searchLower))
				);
			}

			return true;
		});
	}, [shortcuts, activeTab, search]);

	// Group shortcuts by category
	const groupedShortcuts = useMemo(() => {
		const groups: Record<ShortcutCategory, typeof filteredShortcuts> = {
			navigation: [],
			actions: [],
			editor: [],
			general: [],
		};

		for (const shortcut of filteredShortcuts) {
			groups[shortcut.category].push(shortcut);
		}

		return groups;
	}, [filteredShortcuts]);

	// Clear search when modal closes
	useEffect(() => {
		if (!open) {
			setSearch("");
			setActiveTab("all");
		}
	}, [open]);

	const hasCustomizations = shortcuts?.some((s) => s.isCustomized) ?? false;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogHeader className="sr-only">
				<DialogTitle>
					<Trans>Raccourcis clavier</Trans>
				</DialogTitle>
				<DialogDescription>
					<Trans>Voir et personnaliser les raccourcis clavier</Trans>
				</DialogDescription>
			</DialogHeader>

			<DialogContent className="max-w-2xl overflow-hidden p-0">
				{/* Header */}
				<div className="border-border border-b bg-muted/30 p-4">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
							<KeyboardIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<h2 className="font-semibold text-lg">
								<Trans>Raccourcis clavier</Trans>
							</h2>
							<p className="text-muted-foreground text-sm">
								<Trans>
									Appuyez sur <Kbd>?</Kbd> ou <Kbd>{isMac ? "Cmd" : "Ctrl"}</Kbd>+<Kbd>/</Kbd> pour ouvrir ce panneau
								</Trans>
							</p>
						</div>
					</div>

					{/* Search */}
					<div className="relative mt-4">
						<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={t`Rechercher un raccourci...`}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-9 pl-9"
						/>
					</div>
				</div>

				{/* Tabs */}
				<div className="px-4 pt-3">
					<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
						<TabsList className="w-full justify-start">
							<TabsTrigger value="all" className="flex items-center gap-1.5">
								<ArrowsOutCardinalIcon className="size-4" />
								<Trans>Tous</Trans>
							</TabsTrigger>
							<TabsTrigger value="navigation" className="flex items-center gap-1.5">
								<NavigationArrowIcon className="size-4" />
								<Trans>Navigation</Trans>
							</TabsTrigger>
							<TabsTrigger value="actions" className="flex items-center gap-1.5">
								<SparkleIcon className="size-4" />
								<Trans>Actions</Trans>
							</TabsTrigger>
							<TabsTrigger value="editor" className="flex items-center gap-1.5">
								<PencilSimpleIcon className="size-4" />
								<Trans>Éditeur</Trans>
							</TabsTrigger>
							<TabsTrigger value="general" className="flex items-center gap-1.5">
								<GearIcon className="size-4" />
								<Trans>Général</Trans>
							</TabsTrigger>
						</TabsList>

						<ScrollArea className="h-[400px] pr-4">
							<div className="space-y-6 py-4">
								{isLoading ? (
									<div className="flex items-center justify-center py-12">
										<div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
									</div>
								) : filteredShortcuts.length === 0 ? (
									<div className="py-12 text-center text-muted-foreground">
										<KeyboardIcon className="mx-auto mb-3 size-12 opacity-50" />
										<p>
											<Trans>Aucun raccourci trouvé</Trans>
										</p>
									</div>
								) : (
									<TabsContent value="all" className="mt-0 space-y-6">
										{(Object.entries(groupedShortcuts) as [ShortcutCategory, typeof filteredShortcuts][]).map(
											([category, categoryShortcuts]) =>
												categoryShortcuts.length > 0 && (
													<CategorySection
														key={category}
														category={category}
														shortcuts={categoryShortcuts}
														onToggle={handleToggle}
														isToggling={updateShortcutMutation.isPending}
													/>
												),
										)}
									</TabsContent>
								)}

								{/* Category-specific content */}
								{(["navigation", "actions", "editor", "general"] as ShortcutCategory[]).map((category) => (
									<TabsContent key={category} value={category} className="mt-0">
										{groupedShortcuts[category].length > 0 ? (
											<CategorySection
												category={category}
												shortcuts={groupedShortcuts[category]}
												onToggle={handleToggle}
												isToggling={updateShortcutMutation.isPending}
											/>
										) : (
											<div className="py-12 text-center text-muted-foreground">
												<KeyboardIcon className="mx-auto mb-3 size-12 opacity-50" />
												<p>
													<Trans>Aucun raccourci dans cette catégorie</Trans>
												</p>
											</div>
										)}
									</TabsContent>
								))}
							</div>
						</ScrollArea>
					</Tabs>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between border-border border-t bg-muted/30 p-4">
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<CommandIcon className="size-4" />
						<span>{isMac ? <Trans>Utilisez Cmd sur Mac</Trans> : <Trans>Utilisez Ctrl sur Windows/Linux</Trans>}</span>
					</div>

					<div className="flex items-center gap-2">
						{hasCustomizations && (
							<Button variant="outline" size="sm" onClick={handleReset} disabled={resetMutation.isPending}>
								<Trans>Réinitialiser</Trans>
							</Button>
						)}
						<Button size="sm" onClick={() => onOpenChange(false)}>
							<Trans>Terminé</Trans>
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// Hook to open the shortcuts modal with ? or Cmd+/
export function useKeyboardShortcutsModal() {
	const [open, setOpen] = useState(false);

	// Register global hotkeys for opening the modal
	useHotkeys(
		["?", "shift+/"],
		(e) => {
			// Don't trigger if user is typing in an input
			const target = e.target as HTMLElement;
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
				return;
			}
			e.preventDefault();
			setOpen(true);
		},
		{ preventDefault: false },
		[open],
	);

	useHotkeys(
		["mod+/"],
		(e) => {
			e.preventDefault();
			setOpen(true);
		},
		{ preventDefault: true, enableOnFormTags: true },
		[open],
	);

	return { open, setOpen };
}
