import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { GlobeIcon, PlusIcon } from "@phosphor-icons/react";
import { AnimatePresence, Reorder } from "motion/react";
import { toast } from "sonner";
import type z from "zod";
import { useResumeStore } from "@/components/resume/store/resume";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { languageItemSchema } from "@/schema/resume/data";
import { generateId } from "@/utils/string";
import { cn } from "@/utils/style";
import { SectionBase } from "../shared/section-base";
import { SectionAddItemButton, SectionItem } from "../shared/section-item";

// Language presets for Morocco/IMTA context
const languagePresets = [
	{ language: "Arabe", fluency: "Langue maternelle", level: 5 },
	{ language: "Francais", fluency: "Courant", level: 4 },
	{ language: "Anglais", fluency: "Intermediaire", level: 3 },
	{ language: "Espagnol", fluency: "Notions", level: 2 },
	{ language: "Allemand", fluency: "Notions", level: 2 },
	{ language: "Amazigh", fluency: "Langue maternelle", level: 5 },
];

export function LanguagesSectionBuilder() {
	const section = useResumeStore((state) => state.resume.data.sections.languages);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const handleReorder = (items: z.infer<typeof languageItemSchema>[]) => {
		updateResumeData((draft) => {
			draft.sections.languages.items = items;
		});
	};

	const addLanguage = (preset: (typeof languagePresets)[0]) => {
		const existingLanguages = section.items.map((l) => l.language.toLowerCase());
		if (existingLanguages.includes(preset.language.toLowerCase())) {
			toast.info(t`${preset.language} is already added`);
			return;
		}

		const newLanguage: z.infer<typeof languageItemSchema> = {
			id: generateId(),
			hidden: false,
			language: preset.language,
			fluency: preset.fluency,
			level: preset.level,
		};

		updateResumeData((draft) => {
			draft.sections.languages.items.push(newLanguage);
		});

		toast.success(t`Added ${preset.language}`);
	};

	return (
		<SectionBase type="languages" className={cn("rounded-md border", section.items.length === 0 && "border-dashed")}>
			{/* Quick Add Section */}
			<div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
				<span className="mr-1 text-muted-foreground text-xs">
					<Trans>Quick add:</Trans>
				</span>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
							<PlusIcon className="size-3" />
							<Trans>Language Presets</Trans>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-56">
						<DropdownMenuLabel className="flex items-center gap-2">
							<GlobeIcon className="size-4" />
							<Trans>Common Languages</Trans>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{languagePresets.map((preset, index) => (
							<DropdownMenuItem key={index} onClick={() => addLanguage(preset)} className="flex justify-between">
								<span className="font-medium">{preset.language}</span>
								<span className="text-muted-foreground text-xs">{preset.fluency}</span>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<Reorder.Group axis="y" values={section.items} onReorder={handleReorder}>
				<AnimatePresence>
					{section.items.map((item) => (
						<SectionItem key={item.id} type="languages" item={item} title={item.language} subtitle={item.fluency} />
					))}
				</AnimatePresence>
			</Reorder.Group>

			{/* Empty State */}
			{section.items.length === 0 && (
				<div className="p-4 text-center text-muted-foreground text-sm">
					<p>
						<Trans>No languages added yet.</Trans>
					</p>
					<p className="mt-1 text-xs">
						<Trans>Use the presets above or add languages manually.</Trans>
					</p>
				</div>
			)}

			<SectionAddItemButton type="languages">
				<Trans>Add a new language</Trans>
			</SectionAddItemButton>
		</SectionBase>
	);
}
