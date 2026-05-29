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
	// Section Heading - Rounded background strip with primary color at 15% opacity
	"[&>h6]:font-semibold [&>h6]:text-sm [&>h6]:uppercase [&>h6]:tracking-wider",
	"[&>h6]:bg-(--page-primary-color)/15 [&>h6]:text-(--page-primary-color)",
	"[&>h6]:mb-3 [&>h6]:rounded-md [&>h6]:px-3 [&>h6]:py-1.5",

	// Section Item Header in Sidebar Layout
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:flex-col",
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:items-start",
);

/**
 * Template: Agadir
 * Tourism/hospitality industry design - bright, welcoming, warm
 * Two-column with RIGHT sidebar (narrower, ~30%)
 * Centered photo in header with gradient-feel accent band
 * Rounded section headings, colorful icon badges for Morocco fields
 * Tags: Tourism, Hospitality, Welcoming
 */
export const AgadirTemplate = memo(function AgadirTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-agadir page-content">
			{isFirstPage && <Header />}

			<div className="flex">
				{/* Main Content */}
				<main
					data-layout="main"
					className="group page-main flex-1 space-y-(--page-gap-y) px-(--page-margin-x) py-(--page-gap-y)"
				>
					{main.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName });
						return <Component key={section} id={section} />;
					})}
				</main>

				{/* Right Sidebar - Narrower */}
				{!fullWidth && (
					<aside
						data-layout="sidebar"
						className="group page-sidebar w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y) border-(--page-primary-color)/15 border-l px-(--page-margin-x) py-(--page-gap-y)"
					>
						{sidebar.map((section) => {
							const Component = getSectionComponent(section, { sectionClassName });
							return <Component key={section} id={section} />;
						})}
					</aside>
				)}
			</div>
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

	const hasMoroccoFields =
		basics.cin ||
		basics.dateOfBirth ||
		basics.nationality ||
		basics.maritalStatus ||
		(basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable");

	return (
		<div className="page-header">
			{/* Gradient-feel accent band */}
			<div
				className="px-(--page-margin-x) py-(--page-gap-y)"
				style={{
					background: `linear-gradient(135deg, var(--page-primary-color) 0%, color-mix(in srgb, var(--page-primary-color) 70%, var(--page-background-color)) 100%)`,
				}}
			>
				{/* Centered Photo */}
				<div className="mb-3 flex justify-center">
					<PagePicture />
				</div>

				{/* Name and Headline - Centered, white text */}
				<div className="text-center text-(--page-background-color)">
					<h2 className="basics-name font-bold text-2xl tracking-wide">{basics.name}</h2>
					{basics.headline && (
						<p className="basics-headline mt-1 font-light text-sm tracking-wider opacity-90">{basics.headline}</p>
					)}
				</div>

				{/* Contact Row - Light text on accent */}
				<div
					className="basics-items mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-(--page-background-color) text-sm *:flex *:items-center *:gap-x-1.5"
					style={{ "--page-primary-color": "var(--page-background-color)" } as React.CSSProperties}
				>
					{basics.email && (
						<div className="basics-item-email">
							<EnvelopeIcon className="size-3.5" />
							<PageLink url={`mailto:${basics.email}`} label={basics.email} />
						</div>
					)}

					{basics.phone && (
						<div className="basics-item-phone">
							<PhoneIcon className="size-3.5" />
							<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
						</div>
					)}

					{basics.location && (
						<div className="basics-item-location">
							<MapPinIcon className="size-3.5" />
							<span>{basics.location}</span>
						</div>
					)}

					{basics.website.url && (
						<div className="basics-item-website">
							<GlobeIcon className="size-3.5" />
							<PageLink {...basics.website} />
						</div>
					)}
				</div>
			</div>

			{/* Morocco fields with colorful icon badges */}
			{hasMoroccoFields && (
				<div className="basics-morocco flex flex-wrap items-center justify-center gap-2 px-(--page-margin-x) py-2 text-xs">
					{basics.cin && (
						<div className="basics-item-cin flex items-center gap-x-1.5 rounded-full bg-(--page-primary-color)/10 px-2.5 py-1">
							<span className="flex size-4 items-center justify-center rounded-full bg-(--page-primary-color)/20">
								<IdentificationCardIcon className="size-2.5 text-(--page-primary-color)" />
							</span>
							<span>CIN: {basics.cin}</span>
						</div>
					)}

					{basics.dateOfBirth && (
						<div className="basics-item-dob flex items-center gap-x-1.5 rounded-full bg-(--page-primary-color)/10 px-2.5 py-1">
							<span className="flex size-4 items-center justify-center rounded-full bg-(--page-primary-color)/20">
								<CalendarIcon className="size-2.5 text-(--page-primary-color)" />
							</span>
							<span>Ne(e) le: {basics.dateOfBirth}</span>
						</div>
					)}

					{basics.nationality && (
						<div className="basics-item-nationality flex items-center gap-x-1.5 rounded-full bg-(--page-primary-color)/10 px-2.5 py-1">
							<span className="flex size-4 items-center justify-center rounded-full bg-(--page-primary-color)/20">
								<FlagIcon className="size-2.5 text-(--page-primary-color)" />
							</span>
							<span>{basics.nationality}</span>
						</div>
					)}

					{basics.maritalStatus && (
						<div className="basics-item-marital flex items-center gap-x-1.5 rounded-full bg-(--page-primary-color)/10 px-2.5 py-1">
							<span className="flex size-4 items-center justify-center rounded-full bg-(--page-primary-color)/20">
								<UsersIcon className="size-2.5 text-(--page-primary-color)" />
							</span>
							<span>{basics.maritalStatus}</span>
						</div>
					)}

					{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
						<div className="basics-item-military flex items-center gap-x-1.5 rounded-full bg-(--page-primary-color)/10 px-2.5 py-1">
							<span className="flex size-4 items-center justify-center rounded-full bg-(--page-primary-color)/20">
								<ShieldCheckIcon className="size-2.5 text-(--page-primary-color)" />
							</span>
							<span>Service militaire: {militaryServiceLabels[basics.militaryServiceStatus]}</span>
						</div>
					)}
				</div>
			)}

			{/* Custom Fields */}
			{basics.customFields.length > 0 && (
				<div className="basics-custom flex flex-wrap items-center justify-center gap-2 px-(--page-margin-x) pb-2 text-xs *:flex *:items-center *:gap-x-1.5">
					{basics.customFields.map((field) => (
						<div key={field.id} className="basics-item-custom rounded-full bg-(--page-primary-color)/8 px-2.5 py-1">
							<PageIcon icon={field.icon} />
							{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
