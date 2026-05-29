import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { FirstAidKitIcon, GearIcon, HardHatIcon, LightbulbIcon, PlusIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, Reorder } from "motion/react";
import { useState } from "react";
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
import { client, orpc } from "@/integrations/orpc/client";
import type { skillItemSchema } from "@/schema/resume/data";
import { generateId } from "@/utils/string";
import { cn } from "@/utils/style";
import { SectionBase } from "../shared/section-base";
import { SectionAddItemButton, SectionItem } from "../shared/section-item";

// Trade-specific skill presets with Morocco/IMTA focus
const skillPresets = {
	healthcare: {
		label: "Sante / Soins Infirmiers",
		icon: FirstAidKitIcon,
		skills: [
			// Core nursing skills (French terminology)
			{ name: "Soins aux patients", level: 4 },
			{ name: "Prise des constantes vitales", level: 4 },
			{ name: "Administration des medicaments", level: 3 },
			{ name: "Soins des plaies / Pansements", level: 4 },
			{ name: "Hygiene hospitaliere", level: 5 },
			{ name: "Documentation medicale", level: 4 },
			{ name: "Premiers secours / RCP", level: 5 },
			{ name: "Communication avec les patients", level: 4 },
			{ name: "Travail en equipe", level: 4 },
			{ name: "Gestion des urgences", level: 3 },
			// Additional Moroccan healthcare context
			{ name: "Preparation des injections", level: 4 },
			{ name: "Pose de perfusion", level: 3 },
			{ name: "Soins pre et post-operatoires", level: 3 },
			{ name: "Education therapeutique", level: 3 },
			{ name: "Respect du secret medical", level: 5 },
		],
	},
	industrial: {
		label: "Industriel / Mecanique",
		icon: GearIcon,
		skills: [
			// Core industrial skills (French terminology)
			{ name: "Maintenance industrielle", level: 4 },
			{ name: "Lecture de plans et schemas", level: 4 },
			{ name: "Systemes hydrauliques", level: 3 },
			{ name: "Soudure (TIG/MIG/ARC)", level: 3 },
			{ name: "Usinage conventionnel", level: 4 },
			{ name: "Maintenance preventive", level: 4 },
			{ name: "Diagnostic et depannage", level: 4 },
			{ name: "Outillage manuel et electrique", level: 5 },
			{ name: "Controle qualite", level: 3 },
			{ name: "Respect des procedures de securite", level: 5 },
			// Morocco/OFPPT specific
			{ name: "Pneumatique industrielle", level: 3 },
			{ name: "Automatisme industriel", level: 3 },
			{ name: "Electricite industrielle", level: 4 },
			{ name: "Metrologie", level: 3 },
			{ name: "GMAO (Gestion de maintenance)", level: 3 },
		],
	},
	hse: {
		label: "HSE / Securite",
		icon: HardHatIcon,
		skills: [
			// Core HSE skills (French terminology)
			{ name: "Evaluation des risques", level: 4 },
			{ name: "Audits et inspections de securite", level: 4 },
			{ name: "Enquete accident/incident", level: 3 },
			{ name: "Formation securite", level: 4 },
			{ name: "Plan d'urgence et evacuation", level: 4 },
			{ name: "Gestion des EPI", level: 5 },
			{ name: "Identification des dangers", level: 4 },
			{ name: "Conformite environnementale", level: 3 },
			{ name: "Redaction de rapports", level: 4 },
			{ name: "Animation des reunions securite", level: 4 },
			// Morocco/International standards
			{ name: "ISO 45001 / OHSAS 18001", level: 3 },
			{ name: "ISO 14001 (Environnement)", level: 3 },
			{ name: "Permis de travail", level: 4 },
			{ name: "Consignation/Deconsignation", level: 4 },
			{ name: "Gestion des produits chimiques", level: 3 },
		],
	},
	softSkills: {
		label: "Competences Transversales",
		icon: LightbulbIcon,
		skills: [
			// Language skills
			{ name: "Francais (Oral et ecrit)", level: 4 },
			{ name: "Arabe (Dialectal et standard)", level: 5 },
			{ name: "Anglais technique", level: 3 },
			// Soft skills
			{ name: "Travail en equipe", level: 4 },
			{ name: "Communication professionnelle", level: 4 },
			{ name: "Gestion du temps", level: 3 },
			{ name: "Adaptabilite", level: 4 },
			{ name: "Rigueur et precision", level: 4 },
			{ name: "Sens de l'organisation", level: 4 },
			// Digital skills
			{ name: "Microsoft Office (Word, Excel)", level: 4 },
			{ name: "Outils bureautiques", level: 4 },
		],
	},
};

export function SkillsSectionBuilder() {
	const { i18n } = useLingui();
	const section = useResumeStore((state) => state.resume.data.sections.skills);
	const resumeData = useResumeStore((state) => state.resume.data);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const { data: aiStatus } = useQuery(orpc.aiConfig.status.check.queryOptions());
	const [isSuggesting, setIsSuggesting] = useState(false);

	const handleReorder = (items: z.infer<typeof skillItemSchema>[]) => {
		updateResumeData((draft) => {
			draft.sections.skills.items = items;
		});
	};

	const addSkillPreset = (presetKey: keyof typeof skillPresets) => {
		const preset = skillPresets[presetKey];
		const existingNames = section.items.map((s) => s.name.toLowerCase());

		const newSkills = preset.skills
			.filter((skill) => !existingNames.includes(skill.name.toLowerCase()))
			.map((skill) => ({
				id: generateId(),
				hidden: false,
				icon: "",
				name: skill.name,
				proficiency: "",
				level: skill.level,
				keywords: [],
			}));

		if (newSkills.length === 0) {
			toast.info(t`All skills from this preset are already added`);
			return;
		}

		updateResumeData((draft) => {
			draft.sections.skills.items.push(...newSkills);
		});

		toast.success(t`Added ${newSkills.length} skills`);
	};

	const suggestMutation = useMutation({
		mutationFn: async () => {
			setIsSuggesting(true);
			const existingSkills = section.items.map((s) => s.name);

			const result = await client.ai.suggestSkills({
				language: i18n.locale || "en",
				resumeData: {
					experience: resumeData.sections.experience.items.map((e) => ({
						company: e.company,
						position: e.position,
						description: e.description,
					})),
					education: resumeData.sections.education.items.map((e) => ({
						institution: e.school,
						degree: e.degree,
						area: e.area,
					})),
					existingSkills,
				},
			});

			return result;
		},
		onSuccess: (suggestedSkills) => {
			setIsSuggesting(false);

			if (!suggestedSkills || suggestedSkills.length === 0) {
				toast.info(t`No additional skills to suggest. Try adding more experience first.`);
				return;
			}

			updateResumeData((draft) => {
				for (const skill of suggestedSkills) {
					draft.sections.skills.items.push({
						id: generateId(),
						hidden: false,
						icon: "",
						name: skill.name,
						proficiency: "",
						level: skill.level,
						keywords: [],
					});
				}
			});

			toast.success(t`Added ${suggestedSkills.length} suggested skills`);
		},
		onError: (error) => {
			setIsSuggesting(false);
			toast.error(error.message || t`Failed to suggest skills`);
		},
	});

	return (
		<SectionBase type="skills" className={cn("rounded-md border", section.items.length === 0 && "border-dashed")}>
			{/* Quick Add Section */}
			<div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
				<span className="mr-1 text-muted-foreground text-xs">
					<Trans>Quick add:</Trans>
				</span>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
							<PlusIcon className="size-3" />
							<Trans>Skill Presets</Trans>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						<DropdownMenuLabel>
							<Trans>Choose your field</Trans>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{Object.entries(skillPresets).map(([key, preset]) => {
							const Icon = preset.icon;
							return (
								<DropdownMenuItem key={key} onClick={() => addSkillPreset(key as keyof typeof skillPresets)}>
									<Icon className="mr-2 size-4" />
									{preset.label}
								</DropdownMenuItem>
							);
						})}
					</DropdownMenuContent>
				</DropdownMenu>

				{aiStatus?.available && (
					<Button
						size="sm"
						variant="outline"
						className="h-7 gap-1.5 border-purple-200 text-purple-600 text-xs hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400"
						disabled={isSuggesting}
						onClick={() => suggestMutation.mutate()}
					>
						{isSuggesting ? <SpinnerIcon className="size-3 animate-spin" /> : <LightbulbIcon className="size-3" />}
						<Trans>AI Suggest</Trans>
					</Button>
				)}
			</div>

			{/* Skills List */}
			<Reorder.Group axis="y" values={section.items} onReorder={handleReorder}>
				<AnimatePresence>
					{section.items.map((item) => (
						<SectionItem key={item.id} type="skills" item={item} title={item.name} subtitle={item.proficiency} />
					))}
				</AnimatePresence>
			</Reorder.Group>

			{/* Empty State */}
			{section.items.length === 0 && (
				<div className="p-4 text-center text-muted-foreground text-sm">
					<p>
						<Trans>No skills added yet.</Trans>
					</p>
					<p className="mt-1 text-xs">
						<Trans>Use the presets above or add skills manually.</Trans>
					</p>
				</div>
			)}

			<SectionAddItemButton type="skills">
				<Trans>Add a new skill</Trans>
			</SectionAddItemButton>
		</SectionBase>
	);
}
