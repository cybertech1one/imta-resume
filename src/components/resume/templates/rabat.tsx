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
	// Section Heading - Formal diplomatic style: centered, uppercase, letter-spaced, with horizontal rules
	"[&>h6]:text-center [&>h6]:font-semibold [&>h6]:text-xs [&>h6]:uppercase [&>h6]:tracking-[0.2em]",
	"[&>h6]:mb-3 [&>h6]:border-(--page-primary-color)/40 [&>h6]:border-y [&>h6]:py-1.5",
);

/**
 * Template: Rabat
 * Government/diplomatic formal style inspired by Morocco's administrative capital
 * Two-column with RIGHT sidebar, very structured, clear hierarchy
 * Tags: Government, Formal, Diplomatic
 */
export const RabatTemplate = memo(function RabatTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-rabat page-content px-(--page-margin-x) pt-(--page-margin-y) print:p-0">
			{isFirstPage && <Header />}

			<div className={cn("mt-(--page-gap-y)", !fullWidth && "flex gap-x-(--page-gap-x)")}>
				{/* Main Content - Left side */}
				<main data-layout="main" className={cn("group page-main space-y-(--page-gap-y)", !fullWidth && "flex-1")}>
					{main.map((section) => {
						const Component = getSectionComponent(section, { sectionClassName });
						return <Component key={section} id={section} />;
					})}
				</main>

				{/* Right Sidebar */}
				{!fullWidth && (
					<aside
						data-layout="sidebar"
						className="group page-sidebar w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y) border-(--page-primary-color)/30 border-l pl-(--page-gap-x)"
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

	// Military service status labels (French - formal diplomatic)
	const militaryServiceLabels: Record<string, string> = {
		"not-applicable": "Non applicable",
		completed: "Accompli",
		exempted: "Dispense",
		pending: "En instance",
		"in-service": "En cours d'accomplissement",
	};

	return (
		<div className="page-header pb-(--page-gap-y)">
			{/* Decorative top rule */}
			<div className="mb-4 border-(--page-primary-color) border-t-2" />

			{/* Centered Photo */}
			<div className="mb-3 flex justify-center">
				<PagePicture />
			</div>

			{/* Centered Name */}
			<h2 className="basics-name text-center font-bold text-(--page-primary-color) text-2xl uppercase tracking-[0.15em]">
				{basics.name}
			</h2>

			{/* Centered Headline */}
			{basics.headline && (
				<p className="basics-headline mt-1 text-center font-medium text-sm tracking-wider opacity-80">
					{basics.headline}
				</p>
			)}

			{/* Thin separator */}
			<div className="mx-auto my-3 w-1/3 border-(--page-primary-color)/40 border-t" />

			{/* Contact Information - Horizontal row with icons */}
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

			{/* Morocco-Specific Fields - Prominently displayed in formal grid */}
			{(basics.cin ||
				basics.dateOfBirth ||
				basics.nationality ||
				basics.maritalStatus ||
				basics.militaryServiceStatus !== "not-applicable") && (
				<div className="basics-morocco mt-3 border-(--page-primary-color)/20 border-y py-2.5">
					<div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
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

						{basics.nationality && (
							<div className="basics-item-nationality flex items-center gap-x-2">
								<FlagIcon className="size-4 shrink-0 text-(--page-primary-color)" />
								<span>
									<strong className="font-semibold">Nationalite:</strong> {basics.nationality}
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
							<div className="basics-item-military col-span-2 flex items-center gap-x-2">
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

			{/* Decorative bottom rule */}
			<div className="mt-4 border-(--page-primary-color) border-b-2" />
		</div>
	);
}
