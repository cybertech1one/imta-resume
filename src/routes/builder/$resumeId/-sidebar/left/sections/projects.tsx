import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { FirstAidKitIcon, FolderIcon, GearIcon, GraduationCapIcon, HardHatIcon, PlusIcon } from "@phosphor-icons/react";
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
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { projectItemSchema } from "@/schema/resume/data";
import { generateId } from "@/utils/string";
import { cn } from "@/utils/style";
import { SectionBase } from "../shared/section-base";
import { SectionAddItemButton, SectionItem } from "../shared/section-item";

// Project presets for academic and professional projects
const projectPresets = {
	academic: {
		label: "Academic Projects",
		icon: GraduationCapIcon,
		items: [
			{
				name: "Projet de Fin d'Etudes (PFE)",
				description: `<ul>
<li>Realisation d'un projet pratique dans le cadre de la formation</li>
<li>Redaction d'un memoire et soutenance devant un jury</li>
<li>Application des connaissances theoriques acquises</li>
</ul>`,
			},
			{
				name: "Projet de Module",
				description: `<ul>
<li>Travail de groupe dans le cadre d'un module specifique</li>
<li>Recherche et synthese documentaire</li>
<li>Presentation orale des resultats</li>
</ul>`,
			},
		],
	},
	healthcare: {
		label: "Healthcare Projects",
		icon: FirstAidKitIcon,
		items: [
			{
				name: "Projet d'Education Therapeutique",
				description: `<ul>
<li>Conception d'un programme d'education pour les patients</li>
<li>Creation de supports pedagogiques adaptes</li>
<li>Evaluation de l'impact sur les patients</li>
</ul>`,
			},
			{
				name: "Etude de Cas Clinique",
				description: `<ul>
<li>Analyse approfondie d'un cas patient</li>
<li>Recherche bibliographique et documentation</li>
<li>Proposition de prise en charge adaptee</li>
</ul>`,
			},
		],
	},
	industrial: {
		label: "Industrial Projects",
		icon: GearIcon,
		items: [
			{
				name: "Projet d'Amelioration de Processus",
				description: `<ul>
<li>Analyse d'un processus de production existant</li>
<li>Identification des axes d'amelioration</li>
<li>Proposition et mise en oeuvre de solutions</li>
</ul>`,
			},
			{
				name: "Projet de Maintenance",
				description: `<ul>
<li>Elaboration d'un plan de maintenance preventive</li>
<li>Creation de fiches d'intervention</li>
<li>Suivi et evaluation des resultats</li>
</ul>`,
			},
		],
	},
	hse: {
		label: "HSE Projects",
		icon: HardHatIcon,
		items: [
			{
				name: "Evaluation des Risques Professionnels",
				description: `<ul>
<li>Identification et analyse des risques sur un poste de travail</li>
<li>Elaboration du document unique d'evaluation</li>
<li>Proposition de mesures preventives</li>
</ul>`,
			},
			{
				name: "Plan d'Urgence et Evacuation",
				description: `<ul>
<li>Analyse des scenarios d'urgence possibles</li>
<li>Elaboration des procedures d'evacuation</li>
<li>Organisation d'exercices de simulation</li>
</ul>`,
			},
		],
	},
};

export function ProjectsSectionBuilder() {
	const section = useResumeStore((state) => state.resume.data.sections.projects);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const handleReorder = (items: z.infer<typeof projectItemSchema>[]) => {
		updateResumeData((draft) => {
			draft.sections.projects.items = items;
		});
	};

	const buildSubtitle = (item: z.infer<typeof projectItemSchema>) => {
		const parts = [item.period, item.website.label].filter((part) => part && part.trim().length > 0);
		return parts.length > 0 ? parts.join(" • ") : undefined;
	};

	const addProject = (preset: { name: string; description: string }) => {
		const newProject: z.infer<typeof projectItemSchema> = {
			id: generateId(),
			hidden: false,
			name: preset.name,
			period: "",
			website: { url: "", label: "" },
			description: preset.description,
		};

		updateResumeData((draft) => {
			draft.sections.projects.items.push(newProject);
		});

		toast.success(t`Added ${preset.name}`);
	};

	return (
		<SectionBase type="projects" className={cn("rounded-md border", section.items.length === 0 && "border-dashed")}>
			{/* Quick Add Section */}
			<div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
				<span className="mr-1 text-muted-foreground text-xs">
					<Trans>Quick add:</Trans>
				</span>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
							<PlusIcon className="size-3" />
							<Trans>Project Templates</Trans>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-64">
						<DropdownMenuLabel className="flex items-center gap-2">
							<FolderIcon className="size-4" />
							<Trans>Project Types</Trans>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{Object.entries(projectPresets).map(([key, preset]) => {
							const Icon = preset.icon;
							return (
								<DropdownMenuSub key={key}>
									<DropdownMenuSubTrigger>
										<Icon className="mr-2 size-4" />
										{preset.label}
									</DropdownMenuSubTrigger>
									<DropdownMenuSubContent className="max-h-64 overflow-y-auto">
										{preset.items.map((item, index) => (
											<DropdownMenuItem
												key={index}
												onClick={() => addProject(item)}
												className="flex flex-col items-start"
											>
												<span className="font-medium">{item.name}</span>
												<span className="text-muted-foreground text-xs">
													<Trans>With sample description</Trans>
												</span>
											</DropdownMenuItem>
										))}
									</DropdownMenuSubContent>
								</DropdownMenuSub>
							);
						})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<Reorder.Group axis="y" values={section.items} onReorder={handleReorder}>
				<AnimatePresence>
					{section.items.map((item) => (
						<SectionItem key={item.id} type="projects" item={item} title={item.name} subtitle={buildSubtitle(item)} />
					))}
				</AnimatePresence>
			</Reorder.Group>

			{/* Empty State */}
			{section.items.length === 0 && (
				<div className="p-4 text-center text-muted-foreground text-sm">
					<p>
						<Trans>No projects added yet.</Trans>
					</p>
					<p className="mt-1 text-xs">
						<Trans>Use the templates above or add projects manually.</Trans>
					</p>
				</div>
			)}

			<SectionAddItemButton type="projects">
				<Trans>Add a new project</Trans>
			</SectionAddItemButton>
		</SectionBase>
	);
}
