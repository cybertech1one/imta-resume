import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { GearSixIcon, GlobeIcon, KeyboardIcon, PaletteIcon, RobotIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { useKeyboardShortcuts } from "@/components/keyboard-shortcuts-provider";
import { LocaleCombobox } from "@/components/locale/combobox";
import { ShortcutHintInline } from "@/components/shortcut-hint";
import { ThemeCombobox } from "@/components/theme/combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";

export const Route = createFileRoute("/dashboard/settings/preferences")({
	component: RouteComponent,
	errorComponent: ErrorComponent,
});

const AI_LANGUAGE_OPTIONS = [
	{ value: "fr", label: "Français" },
	{ value: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
	{ value: "en", label: "English" },
	{ value: "ary", label: "Darija" },
] as const;

function RouteComponent() {
	const { openShortcutsModal } = useKeyboardShortcuts();
	const { session } = Route.useRouteContext();
	const queryClient = useQueryClient();

	const { data: aiLanguageData, isLoading: isLoadingAiLanguage } = useQuery({
		...orpc.userSettings.getPreferredAiLanguage.queryOptions({}),
		enabled: !!session?.user,
	});

	const updateAiLanguageMutation = useMutation({
		mutationFn: async (language: string) => {
			return orpc.userSettings.updatePreferredAiLanguage.call({ language });
		},
		onSuccess: () => {
			toast.success(t`AI language updated successfully.`);
			queryClient.invalidateQueries({ queryKey: ["userSettings", "getPreferredAiLanguage"] });
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : t`Failed to update AI language.`);
		},
	});

	const handleAiLanguageChange = (value: string) => {
		updateAiLanguageMutation.mutate(value);
	};

	return (
		<motion.div
			className="space-y-6"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
		>
			<DashboardHeader icon={GearSixIcon} title={t`Preferences`} />

			<Separator className="section-divider" />

			{/* Appearance Section */}
			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
				<Card hover="subtle" className="max-w-xl overflow-hidden">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<PaletteIcon className="size-5" weight="duotone" style={{ color: "var(--imta-emerald)" }} />
							<Trans>Appearance</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Customize the appearance and language of the application</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-5">
						<div className="form-field-animated grid gap-1.5">
							<Label className="mb-0.5 flex items-center gap-1.5">
								<PaletteIcon className="size-3.5 text-muted-foreground" />
								<Trans>Theme</Trans>
							</Label>
							<ThemeCombobox />
						</div>

						<div className="form-field-animated grid gap-1.5">
							<Label className="mb-0.5 flex items-center gap-1.5">
								<GlobeIcon className="size-3.5 text-muted-foreground" />
								<Trans>Language</Trans>
							</Label>
							<LocaleCombobox />
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* AI Language Section */}
			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
				<Card hover="subtle" className="max-w-xl overflow-hidden">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<RobotIcon className="size-5" weight="duotone" style={{ color: "var(--imta-teal)" }} />
							<Trans>AI Language</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Choose the language in which AI features will respond.</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="form-field-animated grid gap-1.5">
							<Select
								value={aiLanguageData?.language ?? "fr"}
								onValueChange={handleAiLanguageChange}
								disabled={isLoadingAiLanguage || updateAiLanguageMutation.isPending}
							>
								<SelectTrigger className="w-full transition-all duration-200 focus:shadow-sm focus:ring-2 focus:ring-primary/20 sm:w-[220px]">
									<SelectValue placeholder={t`Select language`} />
								</SelectTrigger>
								<SelectContent>
									{AI_LANGUAGE_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Keyboard Shortcuts Section */}
			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
				<Card hover="subtle" className="max-w-xl overflow-hidden">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<KeyboardIcon className="size-5" weight="duotone" style={{ color: "var(--imta-blue)" }} />
							<Trans>Keyboard Shortcuts</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>View and customize shortcuts to navigate faster.</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							className="w-fit gap-2 transition-all duration-200 hover:shadow-sm"
							onClick={openShortcutsModal}
						>
							<KeyboardIcon className="size-4" />
							<Trans>View keyboard shortcuts</Trans>
							<ShortcutHintInline keys={["mod", "/"]} />
						</Button>
					</CardContent>
				</Card>
			</motion.div>
		</motion.div>
	);
}
