import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { HandHeartIcon, PlusIcon } from "@phosphor-icons/react";
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
import type { volunteerItemSchema } from "@/schema/resume/data";
import { generateId } from "@/utils/string";
import { cn } from "@/utils/style";
import { SectionBase } from "../shared/section-base";
import { SectionAddItemButton, SectionItem } from "../shared/section-item";

// Volunteer presets for common community activities in Morocco
const volunteerPresets = [
	{
		organization: "Croissant-Rouge Marocain",
		position: "Benevole",
		description: `<ul>
<li>Participe aux campagnes de sensibilisation sanitaire</li>
<li>Assiste lors des collectes de sang et actions humanitaires</li>
<li>Contribue a la distribution d'aide aux personnes dans le besoin</li>
</ul>`,
	},
	{
		organization: "Association locale",
		position: "Membre actif",
		description: `<ul>
<li>Participe a l'organisation d'evenements communautaires</li>
<li>Contribue aux activites sociales et culturelles</li>
<li>Aide a la coordination des actions de solidarite</li>
</ul>`,
	},
	{
		organization: "Club universitaire / IMTA",
		position: "Membre / Responsable",
		description: `<ul>
<li>Organise des evenements et activites pour les etudiants</li>
<li>Participe a la vie associative de l'etablissement</li>
<li>Contribue a l'integration des nouveaux etudiants</li>
</ul>`,
	},
	{
		organization: "Action caritative / Ramadan",
		position: "Benevole",
		description: `<ul>
<li>Participe a la distribution de repas pendant le Ramadan</li>
<li>Aide a l'organisation des actions de solidarite</li>
<li>Contribue a la collecte et distribution de dons</li>
</ul>`,
	},
	{
		organization: "Encadrement jeunesse",
		position: "Animateur / Encadrant",
		description: `<ul>
<li>Encadre des activites pour les jeunes</li>
<li>Organise des ateliers educatifs et recreatifs</li>
<li>Participe a l'accompagnement scolaire</li>
</ul>`,
	},
];

export function VolunteerSectionBuilder() {
	const section = useResumeStore((state) => state.resume.data.sections.volunteer);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const handleReorder = (items: z.infer<typeof volunteerItemSchema>[]) => {
		updateResumeData((draft) => {
			draft.sections.volunteer.items = items;
		});
	};

	const addVolunteer = (preset: { organization: string; position: string; description: string }) => {
		const newVolunteer: z.infer<typeof volunteerItemSchema> = {
			id: generateId(),
			hidden: false,
			organization: preset.organization,
			location: preset.position, // Use position as location for display
			period: "",
			website: { url: "", label: "" },
			description: preset.description,
		};

		updateResumeData((draft) => {
			draft.sections.volunteer.items.push(newVolunteer);
		});

		toast.success(t`Added ${preset.organization}`);
	};

	return (
		<SectionBase type="volunteer" className={cn("rounded-md border", section.items.length === 0 && "border-dashed")}>
			{/* Quick Add Section */}
			<div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
				<span className="mr-1 text-muted-foreground text-xs">
					<Trans>Quick add:</Trans>
				</span>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
							<PlusIcon className="size-3" />
							<Trans>Volunteer Presets</Trans>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-64">
						<DropdownMenuLabel className="flex items-center gap-2">
							<HandHeartIcon className="size-4" />
							<Trans>Common Activities</Trans>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{volunteerPresets.map((preset, index) => (
							<DropdownMenuItem key={index} onClick={() => addVolunteer(preset)} className="flex flex-col items-start">
								<span className="font-medium">{preset.organization}</span>
								<span className="text-muted-foreground text-xs">{preset.position}</span>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<Reorder.Group axis="y" values={section.items} onReorder={handleReorder}>
				<AnimatePresence>
					{section.items.map((item) => (
						<SectionItem
							key={item.id}
							type="volunteer"
							item={item}
							title={item.organization}
							subtitle={item.location}
						/>
					))}
				</AnimatePresence>
			</Reorder.Group>

			{/* Empty State */}
			{section.items.length === 0 && (
				<div className="p-4 text-center text-muted-foreground text-sm">
					<p>
						<Trans>No volunteer experience added yet.</Trans>
					</p>
					<p className="mt-1 text-xs">
						<Trans>Use the presets above or add volunteer work manually.</Trans>
					</p>
				</div>
			)}

			<SectionAddItemButton type="volunteer">
				<Trans>Add a new volunteer experience</Trans>
			</SectionAddItemButton>
		</SectionBase>
	);
}
