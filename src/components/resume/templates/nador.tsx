import {
	CalendarIcon,
	EnvelopeIcon,
	FlagIcon,
	GlobeIcon,
	IdentificationCardIcon,
	MapPinIcon,
	PhoneIcon,
	ShieldCheckIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { memo } from "react";
import { cn } from "@/utils/style";
import { getSectionComponent } from "../shared/get-section-component";
import { PageIcon } from "../shared/page-icon";
import { PageLink } from "../shared/page-link";
import { PagePicture } from "../shared/page-picture";
import { useResumeStore } from "../store/resume";
import type { TemplateProps } from "./types";

const sectionClassName = cn(
	// Section Heading - Bilingual-friendly with clear hierarchy, double-line bottom border
	"[&>h6]:font-semibold [&>h6]:text-sm [&>h6]:tracking-wide",
	"[&>h6]:mb-3 [&>h6]:border-(--page-primary-color) [&>h6]:border-b-2 [&>h6]:pb-1.5",

	// Section Item Header in Sidebar Layout
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:flex-col",
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:items-start",
);

const sidebarSectionClassName = cn(
	// Sidebar Section Heading - Lighter style for sidebar, uses background contrast
	"[&>h6]:font-semibold [&>h6]:text-xs [&>h6]:uppercase [&>h6]:tracking-widest",
	"[&>h6]:mb-3 [&>h6]:border-(--page-background-color)/30 [&>h6]:border-b [&>h6]:pb-1.5",
	"[&>h6]:text-(--page-background-color)",

	// Section Item Header in Sidebar Layout
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:flex-col",
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:items-start",
);

/**
 * Template: Nador
 * Cross-cultural/bilingual focus inspired by the multilingual city of Nador
 * Two-column with LEFT sidebar (dark background)
 * RTL-aware layout with logical properties
 * Bilingual subtitle row for French and Arabic labels
 * Tags: Bilingual, Cross-cultural, International
 */
export const NadorTemplate = memo(function NadorTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-nador page-content">
			{/* Sidebar background - left side with primary color */}
			{!fullWidth && (
				<div className="page-sidebar-background absolute inset-y-0 z-0 w-(--page-sidebar-width) shrink-0 bg-(--page-primary-color) ltr:start-0 rtl:end-0" />
			)}

			{/* Header spans full width */}
			{isFirstPage && <Header />}

			<div className="flex">
				{/* Left Sidebar - Dark primary color background */}
				{!fullWidth && (
					<aside
						data-layout="sidebar"
						className="group page-sidebar z-10 w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y) px-(--page-margin-x) pt-(--page-gap-y) text-(--page-background-color)"
					>
						{sidebar.map((section) => {
							const Component = getSectionComponent(section, { sectionClassName: sidebarSectionClassName });
							return <Component key={section} id={section} />;
						})}
					</aside>
				)}

				{/* Main Content */}
				<main
					data-layout="main"
					className={cn(
						"group page-main z-10 flex-1 space-y-(--page-gap-y) px-(--page-margin-x) pt-(--page-gap-y)",
						fullWidth && "w-full",
					)}
				>
					{main.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName });
						return <Component key={section} id={section} />;
					})}
				</main>
			</div>
		</div>
	);
});

function Header() {
	const basics = useResumeStore((state) => state.resume.data.basics);

	// Military service status labels (French / Arabic)
	const militaryServiceLabels: Record<string, string> = {
		"not-applicable": "Non applicable",
		completed: "Effectue",
		exempted: "Dispense",
		pending: "En attente",
		"in-service": "En cours",
	};

	const militaryServiceLabelsAr: Record<string, string> = {
		"not-applicable": "\u063A\u064A\u0631 \u0645\u0639\u0646\u064A",
		completed: "\u0645\u0646\u062C\u0632",
		exempted: "\u0645\u0639\u0641\u0649",
		pending: "\u0641\u064A \u0627\u0646\u062A\u0638\u0627\u0631",
		"in-service": "\u062C\u0627\u0631\u064D",
	};

	return (
		<div className="page-header relative z-10">
			{/* Full-width header band */}
			<div className="bg-(--page-primary-color) px-(--page-margin-x) py-(--page-margin-y) text-(--page-background-color)">
				<div className="flex items-start gap-x-(--page-gap-x)">
					{/* Photo on left */}
					<PagePicture />

					{/* Name and bilingual headline */}
					<div className="flex-1">
						<h2 className="basics-name font-bold text-2xl tracking-wide">{basics.name}</h2>

						{/* Bilingual subtitle row */}
						{basics.headline && (
							<p className="basics-headline mt-1 font-light text-sm tracking-wider opacity-90">{basics.headline}</p>
						)}

						{/* Contact info within header band */}
						<div
							className="basics-items mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm *:flex *:items-center *:gap-x-1.5"
							style={{ "--page-primary-color": "var(--page-background-color)" } as React.CSSProperties}
						>
							{basics.email && (
								<div className="basics-item-email">
									<EnvelopeIcon className="size-4 opacity-80" />
									<PageLink url={`mailto:${basics.email}`} label={basics.email} />
								</div>
							)}

							{basics.phone && (
								<div className="basics-item-phone">
									<PhoneIcon className="size-4 opacity-80" />
									<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
								</div>
							)}

							{basics.location && (
								<div className="basics-item-location">
									<MapPinIcon className="size-4 opacity-80" />
									<span>{basics.location}</span>
								</div>
							)}

							{basics.website.url && (
								<div className="basics-item-website">
									<GlobeIcon className="size-4 opacity-80" />
									<PageLink {...basics.website} />
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Morocco-specific fields bar - below header, bilingual labels */}
			{(basics.cin ||
				basics.dateOfBirth ||
				basics.nationality ||
				basics.maritalStatus ||
				basics.militaryServiceStatus !== "not-applicable") && (
				<div className="basics-morocco bg-(--page-primary-color)/8 px-(--page-margin-x) py-2">
					<div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs *:flex *:items-center *:gap-x-1.5">
						{basics.cin && (
							<div className="basics-item-cin">
								<IdentificationCardIcon className="size-3.5 text-(--page-primary-color)" />
								<span>
									CIN / <span dir="rtl">\u0631\u0642\u0645 \u0627\u0644\u0628\u0637\u0627\u0642\u0629</span>:{" "}
									{basics.cin}
								</span>
							</div>
						)}

						{basics.dateOfBirth && (
							<div className="basics-item-dob">
								<CalendarIcon className="size-3.5 text-(--page-primary-color)" />
								<span>
									Ne(e) le /{" "}
									<span dir="rtl">\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0632\u062F\u064A\u0627\u062F</span>
									: {basics.dateOfBirth}
								</span>
							</div>
						)}

						{basics.nationality && (
							<div className="basics-item-nationality">
								<FlagIcon className="size-3.5 text-(--page-primary-color)" />
								<span>
									Nationalite / <span dir="rtl">\u0627\u0644\u062C\u0646\u0633\u064A\u0629</span>: {basics.nationality}
								</span>
							</div>
						)}

						{basics.maritalStatus && (
							<div className="basics-item-marital">
								<UsersIcon className="size-3.5 text-(--page-primary-color)" />
								<span>
									Situation / <span dir="rtl">\u0627\u0644\u062D\u0627\u0644\u0629</span>: {basics.maritalStatus}
								</span>
							</div>
						)}

						{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
							<div className="basics-item-military">
								<ShieldCheckIcon className="size-3.5 text-(--page-primary-color)" />
								<span>
									S.M. / <span dir="rtl">\u0627\u0644\u062E\u062F\u0645\u0629</span>:{" "}
									{militaryServiceLabels[basics.militaryServiceStatus]} /{" "}
									<span dir="rtl">{militaryServiceLabelsAr[basics.militaryServiceStatus]}</span>
								</span>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Custom Fields */}
			{basics.customFields.length > 0 && (
				<div className="basics-custom flex flex-wrap gap-x-3 gap-y-0.5 px-(--page-margin-x) pt-2 text-sm *:flex *:items-center *:gap-x-1.5">
					{basics.customFields.map((field) => (
						<div key={field.id} className="basics-item-custom">
							<PageIcon icon={field.icon} />
							{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
