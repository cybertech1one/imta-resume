import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CertificateIcon,
	FirstAidKitIcon,
	GearIcon,
	GraduationCapIcon,
	HardHatIcon,
	PlusIcon,
} from "@phosphor-icons/react";
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
import type { certificationItemSchema } from "@/schema/resume/data";
import { generateId } from "@/utils/string";
import { cn } from "@/utils/style";
import { SectionBase } from "../shared/section-base";
import { SectionAddItemButton, SectionItem } from "../shared/section-item";

// Morocco-specific certification presets
const certificationPresets = {
	ofppt: {
		label: "OFPPT Certifications",
		icon: GraduationCapIcon,
		certifications: [
			{ title: "Technicien Specialise", issuer: "OFPPT" },
			{ title: "Technicien", issuer: "OFPPT" },
			{ title: "Qualification Professionnelle", issuer: "OFPPT" },
			{ title: "Specialisation", issuer: "OFPPT" },
			{ title: "Formation Qualifiante", issuer: "OFPPT" },
		],
	},
	healthcare: {
		label: "Healthcare / Nursing",
		icon: FirstAidKitIcon,
		certifications: [
			{ title: "Diplome d'Etat d'Infirmier (IDE)", issuer: "Ministere de la Sante" },
			{ title: "Diplome d'Aide-Soignant", issuer: "Ministere de la Sante" },
			{ title: "Attestation de Formation aux Premiers Secours", issuer: "Croissant-Rouge Marocain" },
			{ title: "BLS - Basic Life Support", issuer: "American Heart Association" },
			{ title: "ACLS - Advanced Cardiovascular Life Support", issuer: "American Heart Association" },
			{ title: "Certificat de Sage-Femme", issuer: "Ministere de la Sante" },
			{ title: "Diplome de Kinesitherapeute", issuer: "Ministere de la Sante" },
		],
	},
	industrial: {
		label: "Industrial / Mechanical",
		icon: GearIcon,
		certifications: [
			{ title: "CACES (Certificat d'Aptitude a la Conduite en Securite)", issuer: "Organisme certifie" },
			{ title: "Habilitation Electrique B1V/BR/BC", issuer: "Employeur/Formation" },
			{ title: "Habilitation Electrique H0/H1/H2", issuer: "Employeur/Formation" },
			{ title: "Certificat de Soudeur", issuer: "OFPPT/Institut de Formation" },
			{ title: "Permis de Conduire Poids Lourds (C/CE)", issuer: "Ministere du Transport" },
			{ title: "Attestation de Formation en Maintenance Industrielle", issuer: "OFPPT" },
		],
	},
	hse: {
		label: "HSE / Safety",
		icon: HardHatIcon,
		certifications: [
			{ title: "SST - Sauveteur Secouriste du Travail", issuer: "INRS/Organisme agree" },
			{ title: "PRAP - Prevention des Risques lies a l'Activite Physique", issuer: "INRS/Organisme agree" },
			{ title: "NEBOSH International General Certificate", issuer: "NEBOSH" },
			{ title: "IOSH Managing Safely", issuer: "IOSH" },
			{ title: "ISO 45001 Lead Auditor", issuer: "Organisme certifie" },
			{ title: "ISO 14001 Lead Auditor", issuer: "Organisme certifie" },
			{ title: "Certificat de Responsable Securite", issuer: "Formation professionnelle" },
			{ title: "Formation Incendie et Evacuation", issuer: "Protection Civile" },
		],
	},
	general: {
		label: "General / IT",
		icon: CertificateIcon,
		certifications: [
			{ title: "TOEIC - Test of English for International Communication", issuer: "ETS" },
			{ title: "DELF/DALF - Diplome de Francais", issuer: "France Education International" },
			{ title: "Microsoft Office Specialist", issuer: "Microsoft" },
			{ title: "Permis de Conduire (B)", issuer: "Ministere du Transport" },
			{ title: "Certificat Informatique et Internet (C2i)", issuer: "Ministere de l'Education" },
		],
	},
};

export function CertificationsSectionBuilder() {
	const section = useResumeStore((state) => state.resume.data.sections.certifications);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const handleReorder = (items: z.infer<typeof certificationItemSchema>[]) => {
		updateResumeData((draft) => {
			draft.sections.certifications.items = items;
		});
	};

	const addCertification = (title: string, issuer: string) => {
		const existingTitles = section.items.map((c) => c.title.toLowerCase());
		if (existingTitles.includes(title.toLowerCase())) {
			toast.info(t`This certification is already added`);
			return;
		}

		const newCertification: z.infer<typeof certificationItemSchema> = {
			id: generateId(),
			hidden: false,
			title,
			issuer,
			date: "",
			website: { url: "", label: "" },
			description: "",
		};

		updateResumeData((draft) => {
			draft.sections.certifications.items.push(newCertification);
		});

		toast.success(t`Added ${title}`);
	};

	return (
		<SectionBase
			type="certifications"
			className={cn("rounded-md border", section.items.length === 0 && "border-dashed")}
		>
			{/* Quick Add Section */}
			<div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
				<span className="mr-1 text-muted-foreground text-xs">
					<Trans>Quick add:</Trans>
				</span>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
							<PlusIcon className="size-3" />
							<Trans>Certification Presets</Trans>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-72">
						<DropdownMenuLabel>
							<Trans>Choose certification category</Trans>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{Object.entries(certificationPresets).map(([key, preset]) => {
							const Icon = preset.icon;
							return (
								<DropdownMenuSub key={key}>
									<DropdownMenuSubTrigger>
										<Icon className="mr-2 size-4" />
										{preset.label}
									</DropdownMenuSubTrigger>
									<DropdownMenuSubContent className="max-h-64 overflow-y-auto">
										{preset.certifications.map((cert, index) => (
											<DropdownMenuItem
												key={index}
												onClick={() => addCertification(cert.title, cert.issuer)}
												className="flex flex-col items-start"
											>
												<span className="font-medium">{cert.title}</span>
												<span className="text-muted-foreground text-xs">{cert.issuer}</span>
											</DropdownMenuItem>
										))}
									</DropdownMenuSubContent>
								</DropdownMenuSub>
							);
						})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Certifications List */}
			<Reorder.Group axis="y" values={section.items} onReorder={handleReorder}>
				<AnimatePresence>
					{section.items.map((item) => (
						<SectionItem
							key={item.id}
							type="certifications"
							item={item}
							title={item.title}
							subtitle={[item.issuer, item.date].filter(Boolean).join(" - ") || undefined}
						/>
					))}
				</AnimatePresence>
			</Reorder.Group>

			{/* Empty State */}
			{section.items.length === 0 && (
				<div className="p-4 text-center text-muted-foreground text-sm">
					<p>
						<Trans>No certifications added yet.</Trans>
					</p>
					<p className="mt-1 text-xs">
						<Trans>Use the presets above or add certifications manually.</Trans>
					</p>
				</div>
			)}

			<SectionAddItemButton type="certifications">
				<Trans>Add a new certification</Trans>
			</SectionAddItemButton>
		</SectionBase>
	);
}
