import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { BriefcaseIcon, FirstAidKitIcon, GearIcon, HardHatIcon, PlusIcon } from "@phosphor-icons/react";
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
import type { experienceItemSchema } from "@/schema/resume/data";
import { generateId } from "@/utils/string";
import { cn } from "@/utils/style";
import { SectionBase } from "../shared/section-base";
import { SectionAddItemButton, SectionItem } from "../shared/section-item";

// Experience presets for common IMTA student positions
const experiencePresets = {
	healthcare: {
		label: "Healthcare / Nursing",
		icon: FirstAidKitIcon,
		items: [
			{
				company: "",
				position: "Stagiaire Infirmier(e)",
				description: `<ul>
<li>Assiste l'equipe soignante dans la prise en charge des patients</li>
<li>Participe aux soins d'hygiene et de confort</li>
<li>Effectue la surveillance des constantes vitales</li>
<li>Contribue a la documentation des dossiers patients</li>
</ul>`,
			},
			{
				company: "",
				position: "Aide-Soignant(e)",
				description: `<ul>
<li>Accompagne les patients dans les actes de la vie quotidienne</li>
<li>Participe aux soins de confort et d'hygiene</li>
<li>Transmet les observations a l'equipe soignante</li>
<li>Entretient l'environnement du patient</li>
</ul>`,
			},
			{
				company: "",
				position: "Auxiliaire de Puericulture",
				description: `<ul>
<li>Assure les soins et l'hygiene des nourrissons et enfants</li>
<li>Participe a l'eveil et au developpement de l'enfant</li>
<li>Collabore avec l'equipe pluridisciplinaire</li>
<li>Veille a la securite et au bien-etre des enfants</li>
</ul>`,
			},
		],
	},
	industrial: {
		label: "Industrial / Mechanical",
		icon: GearIcon,
		items: [
			{
				company: "",
				position: "Stagiaire Technicien de Maintenance",
				description: `<ul>
<li>Participe aux operations de maintenance preventive et corrective</li>
<li>Assiste au diagnostic et a la reparation des equipements</li>
<li>Applique les procedures de securite et les consignes de travail</li>
<li>Redige des rapports d'intervention</li>
</ul>`,
			},
			{
				company: "",
				position: "Operateur de Production",
				description: `<ul>
<li>Assure le bon fonctionnement des equipements de production</li>
<li>Controle la qualite des produits fabriques</li>
<li>Respecte les normes de securite et d'hygiene</li>
<li>Participe a l'amelioration continue des processus</li>
</ul>`,
			},
			{
				company: "",
				position: "Technicien Electromecanicien",
				description: `<ul>
<li>Installe et met en service les equipements electromecaniques</li>
<li>Realise la maintenance des systemes automatises</li>
<li>Diagnostique les pannes et effectue les reparations</li>
<li>Assure le suivi technique et la documentation</li>
</ul>`,
			},
		],
	},
	hse: {
		label: "HSE / Safety",
		icon: HardHatIcon,
		items: [
			{
				company: "",
				position: "Stagiaire HSE",
				description: `<ul>
<li>Participe aux inspections de securite sur le terrain</li>
<li>Contribue a l'evaluation des risques professionnels</li>
<li>Assiste a la redaction des procedures de securite</li>
<li>Participe aux reunions et formations securite</li>
</ul>`,
			},
			{
				company: "",
				position: "Assistant(e) Qualite",
				description: `<ul>
<li>Participe au suivi du systeme de management de la qualite</li>
<li>Assiste aux audits internes et externes</li>
<li>Contribue a la gestion documentaire</li>
<li>Aide a l'analyse des non-conformites</li>
</ul>`,
			},
		],
	},
	general: {
		label: "General / Other",
		icon: BriefcaseIcon,
		items: [
			{
				company: "",
				position: "Employe(e) Polyvalent(e)",
				description: `<ul>
<li>Effectue diverses taches selon les besoins de l'entreprise</li>
<li>Accueille et oriente les clients/visiteurs</li>
<li>Participe aux operations logistiques</li>
<li>Maintient la proprete et l'organisation des espaces de travail</li>
</ul>`,
			},
			{
				company: "",
				position: "Agent Administratif",
				description: `<ul>
<li>Assure la gestion du courrier et des appels telephoniques</li>
<li>Saisit et met a jour les donnees dans le systeme</li>
<li>Classe et archive les documents</li>
<li>Prepare les reunions et redige les comptes-rendus</li>
</ul>`,
			},
		],
	},
};

export function ExperienceSectionBuilder() {
	const section = useResumeStore((state) => state.resume.data.sections.experience);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const handleReorder = (items: z.infer<typeof experienceItemSchema>[]) => {
		updateResumeData((draft) => {
			draft.sections.experience.items = items;
		});
	};

	const addExperience = (preset: { company: string; position: string; description: string }) => {
		const newExperience: z.infer<typeof experienceItemSchema> = {
			id: generateId(),
			hidden: false,
			company: preset.company,
			position: preset.position,
			location: "",
			period: "",
			website: { url: "", label: "" },
			description: preset.description,
		};

		updateResumeData((draft) => {
			draft.sections.experience.items.push(newExperience);
		});

		toast.success(t`Added ${preset.position}`);
	};

	return (
		<SectionBase type="experience" className={cn("rounded-md border", section.items.length === 0 && "border-dashed")}>
			{/* Quick Add Section */}
			<div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
				<span className="mr-1 text-muted-foreground text-xs">
					<Trans>Quick add:</Trans>
				</span>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
							<PlusIcon className="size-3" />
							<Trans>Position Templates</Trans>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-64">
						<DropdownMenuLabel>
							<Trans>Choose position type</Trans>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{Object.entries(experiencePresets).map(([key, preset]) => {
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
												onClick={() => addExperience(item)}
												className="flex flex-col items-start"
											>
												<span className="font-medium">{item.position}</span>
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
						<SectionItem key={item.id} type="experience" item={item} title={item.company} subtitle={item.position} />
					))}
				</AnimatePresence>
			</Reorder.Group>

			{/* Empty State */}
			{section.items.length === 0 && (
				<div className="p-4 text-center text-muted-foreground text-sm">
					<p>
						<Trans>No experience added yet.</Trans>
					</p>
					<p className="mt-1 text-xs">
						<Trans>Use the templates above or add experience manually.</Trans>
					</p>
				</div>
			)}

			<SectionAddItemButton type="experience">
				<Trans>Add a new experience</Trans>
			</SectionAddItemButton>
		</SectionBase>
	);
}
