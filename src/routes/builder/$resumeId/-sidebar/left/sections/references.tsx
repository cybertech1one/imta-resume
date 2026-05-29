import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { PlusIcon, UserCircleIcon } from "@phosphor-icons/react";
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
import type { referenceItemSchema } from "@/schema/resume/data";
import { generateId } from "@/utils/string";
import { cn } from "@/utils/style";
import { SectionBase } from "../shared/section-base";
import { SectionAddItemButton, SectionItem } from "../shared/section-item";

// Reference presets for trade school students
const referencePresets = [
	{
		name: "Maitre de Stage",
		position: "Encadrant de stage",
		description: "Reference professionnelle de l'encadrant de stage en entreprise",
	},
	{
		name: "Professeur Principal",
		position: "Enseignant IMTA / OFPPT",
		description: "Reference academique du professeur principal ou coordinateur de formation",
	},
	{
		name: "Directeur de Formation",
		position: "Responsable pedagogique",
		description: "Reference academique du directeur de formation ou chef de departement",
	},
	{
		name: "Superviseur Clinique",
		position: "Infirmier(e) Chef / Cadre de sante",
		description: "Reference professionnelle du superviseur lors des stages hospitaliers",
	},
	{
		name: "Chef d'Equipe",
		position: "Responsable de production / Technicien senior",
		description: "Reference professionnelle du responsable d'equipe industrielle",
	},
	{
		name: "Responsable HSE",
		position: "Responsable Hygiene Securite Environnement",
		description: "Reference professionnelle du responsable HSE de l'entreprise d'accueil",
	},
	{
		name: "References sur demande",
		position: "",
		description: "Les references seront fournies sur demande",
	},
];

export function ReferencesSectionBuilder() {
	const section = useResumeStore((state) => state.resume.data.sections.references);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const handleReorder = (items: z.infer<typeof referenceItemSchema>[]) => {
		updateResumeData((draft) => {
			draft.sections.references.items = items;
		});
	};

	const addReference = (preset: { name: string; position: string; description: string }) => {
		const newReference: z.infer<typeof referenceItemSchema> = {
			id: generateId(),
			hidden: false,
			name: preset.name,
			position: preset.position,
			website: { url: "", label: "" },
			phone: "",
			description: preset.description,
		};

		updateResumeData((draft) => {
			draft.sections.references.items.push(newReference);
		});

		toast.success(t`Added ${preset.name}`);
	};

	return (
		<SectionBase type="references" className={cn("rounded-md border", section.items.length === 0 && "border-dashed")}>
			{/* Quick Add Section */}
			<div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
				<span className="mr-1 text-muted-foreground text-xs">
					<Trans>Quick add:</Trans>
				</span>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
							<PlusIcon className="size-3" />
							<Trans>Reference Presets</Trans>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-64">
						<DropdownMenuLabel className="flex items-center gap-2">
							<UserCircleIcon className="size-4" />
							<Trans>Reference Types</Trans>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{referencePresets.map((preset, index) => (
							<DropdownMenuItem key={index} onClick={() => addReference(preset)} className="flex flex-col items-start">
								<span className="font-medium">{preset.name}</span>
								{preset.position && <span className="text-muted-foreground text-xs">{preset.position}</span>}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<Reorder.Group axis="y" values={section.items} onReorder={handleReorder}>
				<AnimatePresence>
					{section.items.map((item) => (
						<SectionItem key={item.id} type="references" item={item} title={item.name} subtitle={item.position} />
					))}
				</AnimatePresence>
			</Reorder.Group>

			{/* Empty State */}
			{section.items.length === 0 && (
				<div className="p-4 text-center text-muted-foreground text-sm">
					<p>
						<Trans>No references added yet.</Trans>
					</p>
					<p className="mt-1 text-xs">
						<Trans>Use the presets above or add references manually.</Trans>
					</p>
				</div>
			)}

			<SectionAddItemButton type="references">
				<Trans>Add a new reference</Trans>
			</SectionAddItemButton>
		</SectionBase>
	);
}
