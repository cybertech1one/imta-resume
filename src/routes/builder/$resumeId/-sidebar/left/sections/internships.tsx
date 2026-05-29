import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { BriefcaseIcon, GraduationCapIcon, MagnifyingGlassIcon, PlusIcon, StarIcon } from "@phosphor-icons/react";
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
import type { internshipItemSchema } from "@/schema/resume/data";
import { generateId } from "@/utils/string";
import { cn } from "@/utils/style";
import { SectionBase } from "../shared/section-base";
import { SectionAddItemButton, SectionItem } from "../shared/section-item";

// Internship type labels for display
const internshipTypeLabels = {
	observation: "Stage d'observation",
	application: "Stage d'application",
	"end-of-studies": "Stage de fin d'etudes",
	professional: "Stage professionnel",
	other: "Autre",
};

// Pre-built internship templates for quick addition
const internshipTemplates = {
	observation: {
		label: "Stage d'observation",
		icon: MagnifyingGlassIcon,
		description: "Short observation internship (1-2 weeks)",
		type: "observation" as const,
	},
	application: {
		label: "Stage d'application",
		icon: BriefcaseIcon,
		description: "Practical application internship (1-3 months)",
		type: "application" as const,
	},
	endOfStudies: {
		label: "Stage de fin d'etudes (PFE)",
		icon: GraduationCapIcon,
		description: "End-of-studies project internship (3-6 months)",
		type: "end-of-studies" as const,
	},
	professional: {
		label: "Stage professionnel",
		icon: StarIcon,
		description: "Professional internship with employment goal",
		type: "professional" as const,
	},
};

export function InternshipsSectionBuilder() {
	const section = useResumeStore((state) => state.resume.data.sections.internships);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const handleReorder = (items: z.infer<typeof internshipItemSchema>[]) => {
		updateResumeData((draft) => {
			draft.sections.internships.items = items;
		});
	};

	const addInternshipTemplate = (templateKey: keyof typeof internshipTemplates) => {
		const template = internshipTemplates[templateKey];

		const newInternship: z.infer<typeof internshipItemSchema> = {
			id: generateId(),
			hidden: false,
			company: "",
			position: "",
			supervisor: "",
			location: "",
			period: "",
			type: template.type,
			website: { url: "", label: "" },
			tasksPerformed: "",
			skillsAcquired: [],
			evaluation: "",
		};

		updateResumeData((draft) => {
			draft.sections.internships.items.push(newInternship);
		});

		toast.success(t`Added ${template.label} template`);
	};

	const getInternshipTypeLabel = (type: string) => {
		return internshipTypeLabels[type as keyof typeof internshipTypeLabels] || type;
	};

	return (
		<SectionBase type="internships" className={cn("rounded-md border", section.items.length === 0 && "border-dashed")}>
			{/* Quick Add Section */}
			<div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
				<span className="mr-1 text-muted-foreground text-xs">
					<Trans>Quick add:</Trans>
				</span>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
							<PlusIcon className="size-3" />
							<Trans>Internship Type</Trans>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-64">
						<DropdownMenuLabel>
							<Trans>Choose internship type</Trans>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{Object.entries(internshipTemplates).map(([key, template]) => {
							const Icon = template.icon;
							return (
								<DropdownMenuItem
									key={key}
									onClick={() => addInternshipTemplate(key as keyof typeof internshipTemplates)}
									className="flex flex-col items-start"
								>
									<div className="flex items-center gap-2">
										<Icon className="size-4" />
										<span>{template.label}</span>
									</div>
									<span className="ml-6 text-muted-foreground text-xs">{template.description}</span>
								</DropdownMenuItem>
							);
						})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Internships List */}
			<Reorder.Group axis="y" values={section.items} onReorder={handleReorder}>
				<AnimatePresence>
					{section.items.map((item) => (
						<SectionItem
							key={item.id}
							type="internships"
							item={item}
							title={item.company || t`New Internship`}
							subtitle={[item.position, getInternshipTypeLabel(item.type), item.period].filter(Boolean).join(" - ")}
						/>
					))}
				</AnimatePresence>
			</Reorder.Group>

			{/* Empty State */}
			{section.items.length === 0 && (
				<div className="p-4 text-center text-muted-foreground text-sm">
					<p>
						<Trans>No internships added yet.</Trans>
					</p>
					<p className="mt-1 text-xs">
						<Trans>Add your stages and practical training experiences.</Trans>
					</p>
				</div>
			)}

			<SectionAddItemButton type="internships">
				<Trans>Add a new internship</Trans>
			</SectionAddItemButton>
		</SectionBase>
	);
}
