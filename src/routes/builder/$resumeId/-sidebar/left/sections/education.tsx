import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { FirstAidKitIcon, GearIcon, GraduationCapIcon, PlusIcon } from "@phosphor-icons/react";
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
import type { educationItemSchema } from "@/schema/resume/data";
import { generateId } from "@/utils/string";
import { cn } from "@/utils/style";
import { SectionBase } from "../shared/section-base";
import { SectionAddItemButton, SectionItem } from "../shared/section-item";

// Education presets for IMTA and Moroccan institutions
const educationPresets = {
	imta: {
		label: "IMTA Programs",
		icon: GraduationCapIcon,
		items: [
			{
				school: "Institut Medi Technology Avicenne (IMTA)",
				degree: "Diplôme de Technicien Spécialisé",
				area: "Soins Infirmiers",
			},
			{
				school: "Institut Medi Technology Avicenne (IMTA)",
				degree: "Diplôme de Technicien Spécialisé",
				area: "Maintenance Industrielle",
			},
			{
				school: "Institut Medi Technology Avicenne (IMTA)",
				degree: "Diplôme de Technicien Spécialisé",
				area: "Hygiène, Sécurité et Environnement (HSE)",
			},
			{
				school: "Institut Medi Technology Avicenne (IMTA)",
				degree: "Diplôme de Technicien",
				area: "Aide-Soignant",
			},
		],
	},
	healthcare: {
		label: "Healthcare Éducation",
		icon: FirstAidKitIcon,
		items: [
			{
				school: "Institut de Formation aux Carrieres de Sante (IFCS)",
				degree: "Diplôme d'État d'Infirmier",
				area: "Soins Infirmiers Polyvalents",
			},
			{
				school: "Faculte de Medecine et de Pharmacie",
				degree: "Doctorat en Medecine",
				area: "Medecine Generale",
			},
		],
	},
	industrial: {
		label: "Industrial Éducation",
		icon: GearIcon,
		items: [
			{
				school: "OFPPT - Office de la Formation Professionnelle",
				degree: "Diplôme de Technicien Spécialisé",
				area: "Electromecanique des Systèmes Automatises",
			},
			{
				school: "OFPPT - Office de la Formation Professionnelle",
				degree: "Diplôme de Technicien",
				area: "Maintenance Industrielle",
			},
			{
				school: "Ecole Superieure de Technologie (EST)",
				degree: "DUT (Diplôme Universitaire de Technologie)",
				area: "Genie Mécanique",
			},
		],
	},
	general: {
		label: "General Éducation",
		icon: GraduationCapIcon,
		items: [
			{
				school: "",
				degree: "Baccalaureat Sciences Experimentales",
				area: "Sciences de la Vie et de la Terre",
			},
			{
				school: "",
				degree: "Baccalaureat Sciences Mathematiques",
				area: "Sciences Mathematiques A ou B",
			},
			{
				school: "",
				degree: "Baccalaureat Sciences et Technologies",
				area: "Sciences et Technologies Electriques",
			},
		],
	},
};

export function EducationSectionBuilder() {
	const section = useResumeStore((state) => state.resume.data.sections.education);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const handleReorder = (items: z.infer<typeof educationItemSchema>[]) => {
		updateResumeData((draft) => {
			draft.sections.education.items = items;
		});
	};

	const addEducation = (preset: { school: string; degree: string; area: string }) => {
		const newEducation: z.infer<typeof educationItemSchema> = {
			id: generateId(),
			hidden: false,
			school: preset.school,
			degree: preset.degree,
			area: preset.area,
			grade: "",
			location: "",
			period: "",
			website: { url: "", label: "" },
			description: "",
		};

		updateResumeData((draft) => {
			draft.sections.education.items.push(newEducation);
		});

		toast.success(t`Added ${preset.degree}`);
	};

	return (
		<SectionBase type="education" className={cn("rounded-md border", section.items.length === 0 && "border-dashed")}>
			{/* Quick Add Section */}
			<div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
				<span className="mr-1 text-muted-foreground text-xs">
					<Trans>Quick add:</Trans>
				</span>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
							<PlusIcon className="size-3" />
							<Trans>Education Presets</Trans>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-72">
						<DropdownMenuLabel>
							<Trans>Choose education type</Trans>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{Object.entries(educationPresets).map(([key, preset]) => {
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
												onClick={() => addEducation(item)}
												className="flex flex-col items-start"
											>
												<span className="font-medium">{item.degree}</span>
												<span className="text-muted-foreground text-xs">{item.area}</span>
												{item.school && <span className="text-muted-foreground text-xs">{item.school}</span>}
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
						<SectionItem key={item.id} type="education" item={item} title={item.school} subtitle={item.degree} />
					))}
				</AnimatePresence>
			</Reorder.Group>

			{/* Empty State */}
			{section.items.length === 0 && (
				<div className="p-4 text-center text-muted-foreground text-sm">
					<p>
						<Trans>No education added yet.</Trans>
					</p>
					<p className="mt-1 text-xs">
						<Trans>Use the presets above or add education manually.</Trans>
					</p>
				</div>
			)}

			<SectionAddItemButton type="education">
				<Trans>Add a new education</Trans>
			</SectionAddItemButton>
		</SectionBase>
	);
}
