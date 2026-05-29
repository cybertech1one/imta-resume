import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { PlusIcon, TrophyIcon } from "@phosphor-icons/react";
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
import type { awardItemSchema } from "@/schema/resume/data";
import { generateId } from "@/utils/string";
import { cn } from "@/utils/style";
import { SectionBase } from "../shared/section-base";
import { SectionAddItemButton, SectionItem } from "../shared/section-item";

// Award presets for academic and professional achievements
const awardPresets = [
	{ title: "Mention Tres Bien", awarder: "IMTA / OFPPT", description: "Obtention du diplome avec mention Tres Bien" },
	{ title: "Mention Bien", awarder: "IMTA / OFPPT", description: "Obtention du diplome avec mention Bien" },
	{ title: "Mention Assez Bien", awarder: "IMTA / OFPPT", description: "Obtention du diplome avec mention Assez Bien" },
	{ title: "Major de Promotion", awarder: "IMTA", description: "Premier de la promotion" },
	{ title: "Prix d'Excellence", awarder: "", description: "Recompense pour excellence academique" },
	{ title: "Bourse d'Etudes", awarder: "", description: "Attribution d'une bourse au merite" },
	{ title: "Felicitations du Jury", awarder: "", description: "Felicitations pour le projet de fin d'etudes" },
	{ title: "Certificat d'Honneur", awarder: "", description: "Reconnaissance pour engagement ou performance" },
];

export function AwardsSectionBuilder() {
	const section = useResumeStore((state) => state.resume.data.sections.awards);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const handleReorder = (items: z.infer<typeof awardItemSchema>[]) => {
		updateResumeData((draft) => {
			draft.sections.awards.items = items;
		});
	};

	const addAward = (preset: { title: string; awarder: string; description: string }) => {
		const newAward: z.infer<typeof awardItemSchema> = {
			id: generateId(),
			hidden: false,
			title: preset.title,
			awarder: preset.awarder,
			date: "",
			website: { url: "", label: "" },
			description: preset.description,
		};

		updateResumeData((draft) => {
			draft.sections.awards.items.push(newAward);
		});

		toast.success(t`Added ${preset.title}`);
	};

	return (
		<SectionBase type="awards" className={cn("rounded-md border", section.items.length === 0 && "border-dashed")}>
			{/* Quick Add Section */}
			<div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
				<span className="mr-1 text-muted-foreground text-xs">
					<Trans>Quick add:</Trans>
				</span>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
							<PlusIcon className="size-3" />
							<Trans>Award Presets</Trans>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-56">
						<DropdownMenuLabel className="flex items-center gap-2">
							<TrophyIcon className="size-4" />
							<Trans>Academic Awards</Trans>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{awardPresets.map((preset, index) => (
							<DropdownMenuItem key={index} onClick={() => addAward(preset)} className="flex flex-col items-start">
								<span className="font-medium">{preset.title}</span>
								{preset.awarder && <span className="text-muted-foreground text-xs">{preset.awarder}</span>}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<Reorder.Group axis="y" values={section.items} onReorder={handleReorder}>
				<AnimatePresence>
					{section.items.map((item) => (
						<SectionItem key={item.id} type="awards" item={item} title={item.title} subtitle={item.awarder} />
					))}
				</AnimatePresence>
			</Reorder.Group>

			{/* Empty State */}
			{section.items.length === 0 && (
				<div className="p-4 text-center text-muted-foreground text-sm">
					<p>
						<Trans>No awards added yet.</Trans>
					</p>
					<p className="mt-1 text-xs">
						<Trans>Use the presets above or add awards manually.</Trans>
					</p>
				</div>
			)}

			<SectionAddItemButton type="awards">
				<Trans>Add a new award</Trans>
			</SectionAddItemButton>
		</SectionBase>
	);
}
