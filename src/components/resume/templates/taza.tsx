import { memo } from "react";
import { cn } from "@/utils/style";
import { getSectionComponent } from "../shared/get-section-component";
import { PageIcon } from "../shared/page-icon";
import { PageLink } from "../shared/page-link";
import { PagePicture } from "../shared/page-picture";
import { useResumeStore } from "../store/resume";
import type { TemplateProps } from "./types";

const sectionClassName = cn(
	// Section Heading - Bold uppercase, nothing else. Pure ATS-optimized text structure
	"[&>h6]:font-bold [&>h6]:text-xs [&>h6]:uppercase [&>h6]:tracking-widest",
	"[&>h6]:mb-1.5",
);

/**
 * Template: Taza
 * Ultra-compact ATS-optimized template
 * Single column (no sidebar), no decorative elements
 * Maximum content density, minimum whitespace
 * Pure text structure perfect for ATS scanning and data-heavy CVs
 * Tags: ATS-optimized, Compact, Dense, Text-only
 */
export const TazaTemplate = memo(function TazaTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-taza page-content space-y-2 px-(--page-margin-x) pt-(--page-margin-y) print:p-0">
			{isFirstPage && <Header />}

			{/* Single column: all sections rendered sequentially for maximum ATS compatibility */}
			<main data-layout="main" className="group page-main space-y-2">
				{main.map((section) => {
					const Component = getSectionComponent(section, { sectionClassName });
					return <Component key={section} id={section} />;
				})}
			</main>

			{/* Sidebar sections rendered inline below main */}
			{!fullWidth && sidebar.length > 0 && (
				<div data-layout="sidebar" className="group page-sidebar space-y-2">
					{sidebar.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName });
						return <Component key={section} id={section} />;
					})}
				</div>
			)}
		</div>
	);
});

function Header() {
	const basics = useResumeStore((state) => state.resume.data.basics);

	// Military service status labels (French)
	const militaryServiceLabels: Record<string, string> = {
		"not-applicable": "Non applicable",
		completed: "Effectue",
		exempted: "Dispense",
		pending: "En attente",
		"in-service": "En cours",
	};

	// Build Morocco fields inline string for ultra-compact display
	const moroccoParts: string[] = [];
	if (basics.cin) moroccoParts.push(`CIN: ${basics.cin}`);
	if (basics.dateOfBirth) moroccoParts.push(`Ne(e): ${basics.dateOfBirth}`);
	if (basics.nationality) moroccoParts.push(basics.nationality);
	if (basics.maritalStatus) moroccoParts.push(basics.maritalStatus);
	if (basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable") {
		moroccoParts.push(`S.M.: ${militaryServiceLabels[basics.militaryServiceStatus]}`);
	}

	// Build contact parts for inline display
	const hasContact = basics.email || basics.phone || basics.location || basics.website.url;

	return (
		<div className="page-header">
			{/* Line 1: Name (bold, large) and optional photo */}
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<h2 className="basics-name font-bold text-lg uppercase tracking-wide">{basics.name}</h2>

					{/* Line 2: Headline */}
					{basics.headline && <p className="basics-headline text-sm">{basics.headline}</p>}
				</div>

				<PagePicture />
			</div>

			{/* Line 3: Contact info - all inline, pipe-separated */}
			{hasContact && (
				<div className="basics-items mt-1 flex flex-wrap items-center gap-x-1 text-xs">
					{basics.email && (
						<>
							<PageLink url={`mailto:${basics.email}`} label={basics.email} />
							{(basics.phone || basics.location || basics.website.url) && <span className="opacity-40">|</span>}
						</>
					)}

					{basics.phone && (
						<>
							<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
							{(basics.location || basics.website.url) && <span className="opacity-40">|</span>}
						</>
					)}

					{basics.location && (
						<>
							<span>{basics.location}</span>
							{basics.website.url && <span className="opacity-40">|</span>}
						</>
					)}

					{basics.website.url && <PageLink {...basics.website} />}
				</div>
			)}

			{/* Line 4: Morocco fields inline (CIN: xxx | Ne(e): xxx | Marocaine | ...) */}
			{moroccoParts.length > 0 && (
				<div className="basics-morocco mt-0.5 text-xs opacity-70">{moroccoParts.join(" | ")}</div>
			)}

			{/* Custom Fields - inline */}
			{basics.customFields.length > 0 && (
				<div className="basics-custom mt-0.5 flex flex-wrap items-center gap-x-1 text-xs">
					{basics.customFields.map((field, index) => (
						<span key={field.id} className="basics-item-custom flex items-center gap-x-1">
							<PageIcon icon={field.icon} />
							{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
							{index < basics.customFields.length - 1 && <span className="opacity-40">|</span>}
						</span>
					))}
				</div>
			)}

			{/* Minimal separator - just a thin line */}
			<div className="mt-1.5 border-(--page-text-color)/20 border-t" />
		</div>
	);
}
