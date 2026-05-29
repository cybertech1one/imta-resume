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
	// Section Heading - Geometric style: bold text with square bullet before
	"[&>h6]:flex [&>h6]:items-center [&>h6]:gap-2",
	"[&>h6]:font-bold [&>h6]:text-sm [&>h6]:uppercase [&>h6]:tracking-wide",
	"[&>h6]:mb-3 [&>h6]:text-(--page-primary-color)",
	"[&>h6]:before:inline-block [&>h6]:before:size-2.5 [&>h6]:before:shrink-0 [&>h6]:before:bg-(--page-primary-color)",
);

/**
 * Template: Kenitra
 * Named after the industrial city of Kenitra, Morocco
 * Modern industrial with clean geometric feel
 * Features: Diagonal accent stripe, geometric square bullets, grid layout
 * Tags: Modern, Industrial, Geometric
 */
export const KenitraTemplate = memo(function KenitraTemplate({ pageIndex, pageLayout }: TemplateProps) {
	const isFirstPage = pageIndex === 0;
	const { main, sidebar, fullWidth } = pageLayout;

	return (
		<div className="template-kenitra page-content">
			{/* Sidebar subtle background */}
			{!fullWidth && (
				<div className="page-sidebar-background absolute inset-y-0 z-0 w-(--page-sidebar-width) shrink-0 bg-(--page-primary-color)/5 ltr:start-0 rtl:end-0" />
			)}

			{isFirstPage && <Header />}

			<div className={cn("flex gap-x-(--page-gap-x) px-(--page-margin-x)", !isFirstPage && "pt-(--page-margin-y)")}>
				{/* Left Sidebar */}
				{!fullWidth && (
					<aside
						data-layout="sidebar"
						className="group page-sidebar z-10 w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y) pt-(--page-gap-y)"
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
					className={cn("group page-main z-10 flex-1 space-y-(--page-gap-y) pt-(--page-gap-y)", fullWidth && "w-full")}
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

	const militaryServiceLabels: Record<string, string> = {
		"not-applicable": "Non applicable",
		completed: "Effectue",
		exempted: "Dispense",
		pending: "En attente",
		"in-service": "En cours",
	};

	return (
		<div className="page-header relative z-10 overflow-hidden px-(--page-margin-x) pt-(--page-margin-y) pb-(--page-gap-y)">
			{/* Diagonal accent stripe in top-left corner */}
			<div
				className="absolute top-0 left-0 z-0 h-28 w-28"
				style={{
					background: `linear-gradient(135deg, var(--page-primary-color) 50%, transparent 50%)`,
				}}
			/>

			<div className="relative z-10 flex items-start gap-x-(--page-gap-x)">
				{/* Photo */}
				<PagePicture />

				{/* Name and headline */}
				<div className="flex-1">
					<h2 className="basics-name font-bold text-2xl tracking-tight">{basics.name}</h2>
					{basics.headline && (
						<p className="basics-headline mt-1 font-medium text-(--page-primary-color) text-sm tracking-wide">
							{basics.headline}
						</p>
					)}

					{/* Contact as icon+text pairs in a row */}
					<div className="basics-items mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm *:flex *:items-center *:gap-x-1.5">
						{basics.email && (
							<div className="basics-item-email">
								<EnvelopeIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
								<PageLink url={`mailto:${basics.email}`} label={basics.email} />
							</div>
						)}
						{basics.phone && (
							<div className="basics-item-phone">
								<PhoneIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
								<PageLink url={`tel:${basics.phone}`} label={basics.phone} />
							</div>
						)}
						{basics.location && (
							<div className="basics-item-location">
								<MapPinIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
								<span>{basics.location}</span>
							</div>
						)}
						{basics.website.url && (
							<div className="basics-item-website">
								<GlobeIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
								<PageLink {...basics.website} />
							</div>
						)}
					</div>

					{/* Morocco fields as icon+text grid */}
					{(basics.cin ||
						basics.dateOfBirth ||
						basics.nationality ||
						basics.maritalStatus ||
						(basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable")) && (
						<div className="basics-morocco mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 border-(--page-primary-color)/15 border-t pt-2.5 text-xs *:flex *:items-center *:gap-x-1.5">
							{basics.cin && (
								<div className="basics-item-cin">
									<IdentificationCardIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
									<span>CIN: {basics.cin}</span>
								</div>
							)}
							{basics.dateOfBirth && (
								<div className="basics-item-dob">
									<CalendarIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
									<span>Ne(e) le: {basics.dateOfBirth}</span>
								</div>
							)}
							{basics.nationality && (
								<div className="basics-item-nationality">
									<FlagIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
									<span>Nationalite: {basics.nationality}</span>
								</div>
							)}
							{basics.maritalStatus && (
								<div className="basics-item-marital">
									<UsersIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
									<span>Situation: {basics.maritalStatus}</span>
								</div>
							)}
							{basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable" && (
								<div className="basics-item-military col-span-2">
									<ShieldCheckIcon className="size-3.5 shrink-0 text-(--page-primary-color)" />
									<span>Service militaire: {militaryServiceLabels[basics.militaryServiceStatus]}</span>
								</div>
							)}
						</div>
					)}

					{/* Custom Fields */}
					{basics.customFields.length > 0 && (
						<div className="basics-custom mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs *:flex *:items-center *:gap-x-1.5">
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

			{/* Bottom geometric line */}
			<div className="mt-(--page-gap-y) flex items-center gap-2">
				<div className="h-0.5 flex-1 bg-(--page-primary-color)" />
				<div className="size-2 bg-(--page-primary-color)" />
			</div>
		</div>
	);
}
