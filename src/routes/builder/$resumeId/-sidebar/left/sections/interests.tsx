import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { HeartIcon, PlusIcon } from "@phosphor-icons/react";
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
import type { interestItemSchema } from "@/schema/resume/data";
import { generateId } from "@/utils/string";
import { cn } from "@/utils/style";
import { SectionBase } from "../shared/section-base";
import { SectionAddItemButton, SectionItem } from "../shared/section-item";

// Interest presets - professional and personal interests appropriate for CVs
const interestPresets = [
	{ name: "Lecture", keywords: ["Developpement personnel", "Litterature", "Sciences"] },
	{ name: "Sport", keywords: ["Football", "Natation", "Course a pied"] },
	{ name: "Benevolat", keywords: ["Associations caritatives", "Aide humanitaire"] },
	{ name: "Voyages", keywords: ["Decouverte culturelle", "Apprentissage des langues"] },
	{ name: "Technologie", keywords: ["Innovation", "Nouvelles technologies"] },
	{ name: "Musique", keywords: ["Instruments", "Concerts"] },
	{ name: "Cuisine", keywords: ["Gastronomie", "Recettes traditionnelles"] },
	{ name: "Photographie", keywords: ["Reportage", "Portrait"] },
	{ name: "Randonnee", keywords: ["Nature", "Montagne"] },
	{ name: "Arts", keywords: ["Peinture", "Dessin", "Artisanat"] },
];

export function InterestsSectionBuilder() {
	const section = useResumeStore((state) => state.resume.data.sections.interests);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const handleReorder = (items: z.infer<typeof interestItemSchema>[]) => {
		updateResumeData((draft) => {
			draft.sections.interests.items = items;
		});
	};

	const addInterest = (preset: { name: string; keywords: string[] }) => {
		const existingInterests = section.items.map((i) => i.name.toLowerCase());
		if (existingInterests.includes(preset.name.toLowerCase())) {
			toast.info(t`${preset.name} is already added`);
			return;
		}

		const newInterest: z.infer<typeof interestItemSchema> = {
			id: generateId(),
			hidden: false,
			icon: "",
			name: preset.name,
			keywords: preset.keywords,
		};

		updateResumeData((draft) => {
			draft.sections.interests.items.push(newInterest);
		});

		toast.success(t`Added ${preset.name}`);
	};

	return (
		<SectionBase type="interests" className={cn("rounded-md border", section.items.length === 0 && "border-dashed")}>
			{/* Quick Add Section */}
			<div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
				<span className="mr-1 text-muted-foreground text-xs">
					<Trans>Quick add:</Trans>
				</span>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
							<PlusIcon className="size-3" />
							<Trans>Interest Presets</Trans>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-56">
						<DropdownMenuLabel className="flex items-center gap-2">
							<HeartIcon className="size-4" />
							<Trans>Common Interests</Trans>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{interestPresets.map((preset, index) => (
							<DropdownMenuItem key={index} onClick={() => addInterest(preset)} className="flex justify-between">
								<span className="font-medium">{preset.name}</span>
								<span className="max-w-28 truncate text-muted-foreground text-xs">{preset.keywords.join(", ")}</span>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<Reorder.Group axis="y" values={section.items} onReorder={handleReorder}>
				<AnimatePresence>
					{section.items.map((item) => (
						<SectionItem key={item.id} type="interests" item={item} title={item.name} />
					))}
				</AnimatePresence>
			</Reorder.Group>

			{/* Empty State */}
			{section.items.length === 0 && (
				<div className="p-4 text-center text-muted-foreground text-sm">
					<p>
						<Trans>No interests added yet.</Trans>
					</p>
					<p className="mt-1 text-xs">
						<Trans>Use the presets above or add interests manually.</Trans>
					</p>
				</div>
			)}

			<SectionAddItemButton type="interests">
				<Trans>Add a new interest</Trans>
			</SectionAddItemButton>
		</SectionBase>
	);
}
