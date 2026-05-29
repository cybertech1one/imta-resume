import { TiptapContent } from "@/components/input/rich-input";
import type { SectionItem } from "@/schema/resume/data";
import { stripHtml } from "@/utils/string";
import { cn } from "@/utils/style";
import { PageLink } from "../page-link";

// Internship type labels for display
const internshipTypeLabels: Record<string, string> = {
	observation: "Stage d'observation",
	application: "Stage d'application",
	"end-of-studies": "Stage de fin d'etudes",
	professional: "Stage professionnel",
	other: "Autre",
};

type InternshipsItemProps = SectionItem<"internships"> & {
	className?: string;
};

export function InternshipsItem({ className, ...item }: InternshipsItemProps) {
	const typeLabel = internshipTypeLabels[item.type] || item.type;

	return (
		<div className={cn("internships-item", className)}>
			{/* Header */}
			<div className="section-item-header internships-item-header">
				{/* Row 1: Company and Location */}
				<div className="flex items-start justify-between gap-x-2">
					<strong className="section-item-title internships-item-title">{item.company}</strong>
					<span className="section-item-metadata internships-item-location shrink-0 text-end">{item.location}</span>
				</div>

				{/* Row 2: Position and Period */}
				<div className="flex items-start justify-between gap-x-2">
					<span className="section-item-metadata internships-item-position">{item.position}</span>
					<span className="section-item-metadata internships-item-period shrink-0 text-end">{item.period}</span>
				</div>

				{/* Row 3: Type and Supervisor */}
				<div className="flex items-start justify-between gap-x-2">
					<span className="internships-item-type rounded-sm bg-(--page-primary-color)/10 px-1.5 py-0.5 font-medium text-(--page-primary-color) text-xs">
						{typeLabel}
					</span>
					{item.supervisor && (
						<span className="section-item-metadata internships-item-supervisor shrink-0 text-end text-xs">
							Encadrant: {item.supervisor}
						</span>
					)}
				</div>
			</div>

			{/* Tasks Performed / Description */}
			<div
				className={cn("section-item-description internships-item-tasks", !stripHtml(item.tasksPerformed) && "hidden")}
			>
				<TiptapContent content={item.tasksPerformed} />
			</div>

			{/* Skills Acquired */}
			{item.skillsAcquired && item.skillsAcquired.length > 0 && (
				<div className="internships-item-skills mt-1 flex flex-wrap gap-1">
					{item.skillsAcquired.map((skill, index) => (
						<span key={index} className="rounded bg-(--page-primary-color)/10 px-1.5 py-0.5 text-xs">
							{skill}
						</span>
					))}
				</div>
			)}

			{/* Evaluation */}
			{item.evaluation && stripHtml(item.evaluation) && (
				<div className="internships-item-evaluation mt-2 border-(--page-primary-color)/50 border-l-2 pl-2">
					<span className="block font-medium text-(--page-primary-color) text-xs">Appreciation:</span>
					<div className="text-xs italic">
						<TiptapContent content={item.evaluation} />
					</div>
				</div>
			)}

			{/* Website */}
			<div className="section-item-website internships-item-website">
				<PageLink {...item.website} label={item.website.label} />
			</div>
		</div>
	);
}
