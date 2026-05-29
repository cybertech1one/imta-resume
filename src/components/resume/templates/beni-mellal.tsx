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
	// Section Heading - Bold with leaf-green accent line
	"[&>h6]:font-bold [&>h6]:text-sm [&>h6]:tracking-wide",
	"[&>h6]:mb-3 [&>h6]:border-(--page-primary-color) [&>h6]:border-b-2 [&>h6]:pb-1.5",

	// Section Item Header in Sidebar Layout
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:flex-col",
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:items-start",
);

const sidebarSectionClassName = cn(
	// Sidebar Section Heading - Earthy, warm style
	"[&>h6]:font-bold [&>h6]:text-xs [&>h6]:uppercase [&>h6]:tracking-widest",
	"[&>h6]:mb-3 [&>h6]:border-(--page-primary-color)/40 [&>h6]:border-b [&>h6]:pb-1.5",
	"[&>h6]:text-(--page-primary-color)",

	// Section Item Header in Sidebar Layout
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:flex-col",
	"group-data-[layout=sidebar]:[&_.section-item-header>div]:items-start",
);

/**
 * Template: Beni Mellal
 * Agricultural/rural development/NGO sector
 * Two-column with RIGHT sidebar (wider ~40% for skills, certifications, references)
 * Earthy, natural feel with green-toned accents, photo in header center
 * Tags: NGO, Development, Agriculture, Rural
 */
export const BeniMellalTemplate = memo(function BeniMellalTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-beni-mellal page-content print:p-0">
			{isFirstPage && <Header />}

			<div className={cn("flex px-(--page-margin-x) pt-(--page-gap-y)", fullWidth && "flex-col")}>
				{/* Main Content - Left ~60% */}
				<main
					data-layout="main"
					className={cn("group page-main space-y-(--page-gap-y)", !fullWidth ? "flex-1 pe-(--page-gap-x)" : "w-full")}
				>
					{main.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName });
						return <Component key={section} id={section} />;
					})}
				</main>

				{/* Right Sidebar - Wider for NGO-style content */}
				{!fullWidth && (
					<aside
						data-layout="sidebar"
						className="group page-sidebar w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y) border-(--page-primary-color)/20 border-s ps-(--page-gap-x)"
					>
						{sidebar.map((section) => {
							const Component = getSectionComponent(section, { sectionClassName: sidebarSectionClassName });
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

	return (
		<div className="page-header">
			{/* Earthy header band with subtle green tone */}
			<div
				className="px-(--page-margin-x) py-(--page-margin-y)"
				style={{
					background: `linear-gradient(135deg, color-mix(in srgb, var(--page-primary-color) 8%, var(--page-background-color)), color-mix(in srgb, var(--page-primary-color) 3%, var(--page-background-color)))`,
				}}
			>
				{/* Centered photo */}
				<div className="mb-3 flex justify-center">
					<PagePicture />
				</div>

				{/* Name centered */}
				<h2 className="basics-name text-center font-bold text-(--page-primary-color) text-2xl tracking-wide">
					{basics.name}
				</h2>

				{/* Headline */}
				{basics.headline && (
					<p className="basics-headline mt-1 text-center font-medium text-sm tracking-wider opacity-80">
						{basics.headline}
					</p>
				)}

				{/* Decorative accent line */}
				<div className="mx-auto mt-3 mb-3 h-0.5 w-16 bg-(--page-primary-color)/40" />

				{/* Contact information - centered row */}
				<div className="basics-items flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm *:flex *:items-center *:gap-x-1.5">
					{basics.email && (
						<div className="basics-item-email">
							<EnvelopeIcon className="size-4 text-(--page-primary-color)" />
							<PageLink url={`mailto:${basics.email}`} label={basics.email} />
						</div>
					)}

					{basics.phone && (
						<div className="basics-item-phone">
							<PhoneIcon className="size-4 text-(--page-primary-color)" />
							<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
						</div>
					)}

					{basics.location && (
						<div className="basics-item-location">
							<MapPinIcon className="size-4 text-(--page-primary-color)" />
							<span>{basics.location}</span>
						</div>
					)}

					{basics.website.url && (
						<div className="basics-item-website">
							<GlobeIcon className="size-4 text-(--page-primary-color)" />
							<PageLink {...basics.website} />
						</div>
					)}
				</div>

				{/* Morocco-specific fields - prominently displayed (nationality, location important for rural jobs) */}
				{(basics.cin ||
					basics.dateOfBirth ||
					basics.nationality ||
					basics.maritalStatus ||
					basics.militaryServiceStatus !== "not-applicable") && (
					<div className="basics-morocco mt-3 border-(--page-primary-color)/20 border-t pt-2.5">
						<div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm xl:grid-cols-3">
							{basics.nationality && (
								<div className="basics-item-nationality flex items-center gap-x-2">
									<FlagIcon className="size-4 shrink-0 text-(--page-primary-color)" />
									<span>
										<strong className="font-semibold">Nationalite:</strong> {basics.nationality}
									</span>
								</div>
							)}

							{basics.location && (
								<div className="basics-item-location-detail flex items-center gap-x-2">
									<MapPinIcon className="size-4 shrink-0 text-(--page-primary-color)" />
									<span>
										<strong className="font-semibold">Adresse:</strong> {basics.location}
									</span>
								</div>
							)}

							{basics.cin && (
								<div className="basics-item-cin flex items-center gap-x-2">
									<IdentificationCardIcon className="size-4 shrink-0 text-(--page-primary-color)" />
									<span>
										<strong className="font-semibold">CIN:</strong> {basics.cin}
									</span>
								</div>
							)}

							{basics.dateOfBirth && (
								<div className="basics-item-dob flex items-center gap-x-2">
									<CalendarIcon className="size-4 shrink-0 text-(--page-primary-color)" />
									<span>
										<strong className="font-semibold">Date de naissance:</strong> {basics.dateOfBirth}
									</span>
								</div>
							)}

							{basics.maritalStatus && (
								<div className="basics-item-marital flex items-center gap-x-2">
									<UsersIcon className="size-4 shrink-0 text-(--page-primary-color)" />
									<span>
										<strong className="font-semibold">Situation familiale:</strong> {basics.maritalStatus}
									</span>
								</div>
							)}

							{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
								<div className="basics-item-military flex items-center gap-x-2">
									<ShieldCheckIcon className="size-4 shrink-0 text-(--page-primary-color)" />
									<span>
										<strong className="font-semibold">Service militaire:</strong>{" "}
										{militaryServiceLabels[basics.militaryServiceStatus]}
									</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Custom Fields */}
				{basics.customFields.length > 0 && (
					<div className="basics-custom mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm *:flex *:items-center *:gap-x-1.5">
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
	);
}
