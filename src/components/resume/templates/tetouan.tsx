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
	// Section Heading - Decorative with diamond shapes, warm artisan feel
	"[&>h6]:font-bold [&>h6]:text-sm [&>h6]:uppercase [&>h6]:tracking-wider",
	"[&>h6]:mb-3 [&>h6]:text-(--page-primary-color)",
	"[&>h6]:flex [&>h6]:items-center [&>h6]:gap-x-2",
	// Small diamond shape before heading
	"[&>h6]:before:inline-block [&>h6]:before:size-2 [&>h6]:before:rotate-45 [&>h6]:before:bg-(--page-primary-color)",
	// Decorative line after heading text
	"[&>h6]:after:h-px [&>h6]:after:flex-1 [&>h6]:after:bg-(--page-primary-color)/30",

	// Section Item Header in Sidebar Layout
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:flex-col",
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:items-start",
);

/**
 * Template: Tetouan
 * Artisan/craft-inspired design with Moroccan zellige-inspired geometric patterns
 * Two-column layout with LEFT sidebar for skills, languages, interests
 * Warm color palette feel, decorative diamond headings, Etat Civil section
 * Tags: Artisan, Crafts, Decorative, Traditional
 */
export const TetouanTemplate = memo(function TetouanTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-tetouan page-content">
			{isFirstPage && <Header />}

			<div className="flex">
				{/* Left Sidebar */}
				{!fullWidth && (
					<aside
						data-layout="sidebar"
						className="group page-sidebar w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y) border-(--page-primary-color)/20 border-r px-(--page-margin-x) py-(--page-gap-y)"
					>
						{sidebar.map((section) => {
							const Component = getSectionComponent(section, { sectionClassName });
							return <Component key={section} id={section} />;
						})}
					</aside>
				)}

				{/* Main Content */}
				<main
					data-layout="main"
					className={cn("group page-main flex-1 space-y-(--page-gap-y) px-(--page-margin-x) py-(--page-gap-y)")}
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
		<div className="page-header px-(--page-margin-x) pt-(--page-margin-y)">
			{/* Geometric zellige-inspired top border pattern using CSS */}
			<div className="mb-3 flex items-center">
				<div className="flex gap-1">
					<div className="size-2 rotate-45 bg-(--page-primary-color)" />
					<div className="size-2 rotate-45 border border-(--page-primary-color)" />
					<div className="size-2 rotate-45 bg-(--page-primary-color)" />
				</div>
				<div className="mx-3 h-0.5 flex-1 bg-(--page-primary-color)/25" />
				<div className="flex gap-1">
					<div className="size-2 rotate-45 bg-(--page-primary-color)" />
					<div className="size-2 rotate-45 border border-(--page-primary-color)" />
					<div className="size-2 rotate-45 bg-(--page-primary-color)" />
				</div>
			</div>

			{/* Name and Photo Row */}
			<div className="flex items-start gap-x-(--page-gap-x)">
				{/* Photo */}
				<PagePicture />

				{/* Name and Headline */}
				<div className="page-basics flex-1">
					<h2 className="basics-name font-bold text-(--page-primary-color) text-2xl uppercase tracking-wide">
						{basics.name}
					</h2>

					{basics.headline && (
						<p className="basics-headline mt-0.5 font-medium text-sm tracking-wide opacity-80">{basics.headline}</p>
					)}

					{/* Contact Info */}
					<div className="basics-items mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm *:flex *:items-center *:gap-x-1.5">
						{basics.email && (
							<div className="basics-item-email">
								<EnvelopeIcon className="size-3.5 text-(--page-primary-color)" />
								<PageLink url={`mailto:${basics.email}`} label={basics.email} />
							</div>
						)}

						{basics.phone && (
							<div className="basics-item-phone">
								<PhoneIcon className="size-3.5 text-(--page-primary-color)" />
								<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
							</div>
						)}

						{basics.location && (
							<div className="basics-item-location">
								<MapPinIcon className="size-3.5 text-(--page-primary-color)" />
								<span>{basics.location}</span>
							</div>
						)}

						{basics.website.url && (
							<div className="basics-item-website">
								<GlobeIcon className="size-3.5 text-(--page-primary-color)" />
								<PageLink {...basics.website} />
							</div>
						)}
					</div>

					{/* Custom Fields */}
					{basics.customFields.length > 0 && (
						<div className="basics-custom mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm *:flex *:items-center *:gap-x-1.5">
							{basics.customFields.map((field) => (
								<div key={field.id} className="basics-item-custom">
									<PageIcon icon={field.icon} />
									{field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Etat Civil section - Elegant Morocco fields display */}
			{hasMoroccoFields && (
				<div className="basics-morocco mt-3 border-(--page-primary-color)/20 border-t pt-2">
					<div className="mb-1.5 flex items-center gap-x-2 font-bold text-(--page-primary-color) text-xs uppercase tracking-wider">
						<div className="size-1.5 rotate-45 bg-(--page-primary-color)" />
						<span>Etat Civil</span>
						<div className="h-px flex-1 bg-(--page-primary-color)/20" />
					</div>

					<div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm xl:grid-cols-3">
						{basics.cin && (
							<div className="basics-item-cin flex items-center gap-x-2">
								<IdentificationCardIcon className="size-3.5 text-(--page-primary-color)/70" />
								<span>
									<span className="font-semibold">CIN:</span> {basics.cin}
								</span>
							</div>
						)}

						{basics.dateOfBirth && (
							<div className="basics-item-dob flex items-center gap-x-2">
								<CalendarIcon className="size-3.5 text-(--page-primary-color)/70" />
								<span>
									<span className="font-semibold">Ne(e) le:</span> {basics.dateOfBirth}
								</span>
							</div>
						)}

						{basics.nationality && (
							<div className="basics-item-nationality flex items-center gap-x-2">
								<FlagIcon className="size-3.5 text-(--page-primary-color)/70" />
								<span>
									<span className="font-semibold">Nationalite:</span> {basics.nationality}
								</span>
							</div>
						)}

						{basics.maritalStatus && (
							<div className="basics-item-marital flex items-center gap-x-2">
								<UsersIcon className="size-3.5 text-(--page-primary-color)/70" />
								<span>
									<span className="font-semibold">Situation familiale:</span> {basics.maritalStatus}
								</span>
							</div>
						)}

						{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
							<div className="basics-item-military flex items-center gap-x-2">
								<ShieldCheckIcon className="size-3.5 text-(--page-primary-color)/70" />
								<span>
									<span className="font-semibold">Service militaire:</span>{" "}
									{militaryServiceLabels[basics.militaryServiceStatus]}
								</span>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Bottom geometric border */}
			<div className="mt-3 flex items-center">
				<div className="flex gap-1">
					<div className="size-2 rotate-45 bg-(--page-primary-color)" />
					<div className="size-2 rotate-45 border border-(--page-primary-color)" />
					<div className="size-2 rotate-45 bg-(--page-primary-color)" />
				</div>
				<div className="mx-3 h-0.5 flex-1 bg-(--page-primary-color)/25" />
				<div className="flex gap-1">
					<div className="size-2 rotate-45 bg-(--page-primary-color)" />
					<div className="size-2 rotate-45 border border-(--page-primary-color)" />
					<div className="size-2 rotate-45 bg-(--page-primary-color)" />
				</div>
			</div>
		</div>
	);
}
