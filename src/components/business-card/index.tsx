import { Trans } from "@lingui/react/macro";
import {
	AddressBookIcon,
	EnvelopeIcon,
	FileTextIcon,
	GlobeIcon,
	MapPinIcon,
	PhoneIcon,
	TextAlignLeftIcon,
} from "@phosphor-icons/react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { BusinessCardSettings, ResumeData } from "@/schema/resume/data";
import { sanitizeHtml, sanitizeUrl } from "@/utils/sanitize";
import { cn } from "@/utils/style";
import { downloadVCard } from "@/utils/vcard";
import { type BusinessCardTheme, businessCardThemes } from "./themes";

// Calculate if a color is light or dark to determine text contrast
function isLightColor(color: string): boolean {
	// Handle hex colors
	let hex = color.replace("#", "");
	if (hex.length === 3) {
		hex = hex
			.split("")
			.map((c) => c + c)
			.join("");
	}
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	// Calculate relative luminance
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.5;
}

// Generate a lighter/darker shade of a color
function adjustColor(color: string, amount: number): string {
	let hex = color.replace("#", "");
	if (hex.length === 3) {
		hex = hex
			.split("")
			.map((c) => c + c)
			.join("");
	}
	const r = Math.min(255, Math.max(0, parseInt(hex.substring(0, 2), 16) + amount));
	const g = Math.min(255, Math.max(0, parseInt(hex.substring(2, 4), 16) + amount));
	const b = Math.min(255, Math.max(0, parseInt(hex.substring(4, 6), 16) + amount));
	return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

type ContactRowProps = {
	icon: React.ReactNode;
	value: string;
	href?: string;
	themeConfig: (typeof businessCardThemes)[BusinessCardTheme];
	accentStyles?: { backgroundColor: string; color: string };
};

function ContactRow({ icon, value, href, themeConfig, accentStyles }: ContactRowProps) {
	const content = (
		<div className="flex items-center gap-3">
			<div
				className={cn("flex size-10 items-center justify-center rounded-lg", !accentStyles && themeConfig.iconBg)}
				style={accentStyles ? { backgroundColor: accentStyles.backgroundColor } : undefined}
			>
				<span
					className={!accentStyles ? themeConfig.iconColor : undefined}
					style={accentStyles ? { color: accentStyles.color } : undefined}
				>
					{icon}
				</span>
			</div>
			<span className={cn("text-sm", themeConfig.bodyText)}>{value}</span>
		</div>
	);

	if (href) {
		const safeHref = sanitizeUrl(href);
		return (
			<a
				href={safeHref}
				target={safeHref.startsWith("http") ? "_blank" : undefined}
				rel={safeHref.startsWith("http") ? "noopener noreferrer" : undefined}
				className="block transition-opacity hover:opacity-80"
			>
				{content}
			</a>
		);
	}

	return content;
}

type SocialIconProps = {
	network: string;
	url: string;
	themeConfig: (typeof businessCardThemes)[BusinessCardTheme];
	accentStyles?: { backgroundColor: string; color: string };
};

function SocialIcon({ network, url, themeConfig, accentStyles }: SocialIconProps) {
	// Get initials from network name for the icon
	const initials = network.slice(0, 2).toUpperCase();

	return (
		<a
			href={sanitizeUrl(url)}
			target="_blank"
			rel="noopener noreferrer"
			title={network}
			className={cn(
				"flex size-10 items-center justify-center rounded-lg font-medium text-xs transition-opacity hover:opacity-80",
				!accentStyles && themeConfig.iconBg,
				!accentStyles && themeConfig.iconColor,
			)}
			style={accentStyles ? { backgroundColor: accentStyles.backgroundColor, color: accentStyles.color } : undefined}
		>
			{initials}
		</a>
	);
}

type BusinessCardProps = {
	data: ResumeData;
	settings?: BusinessCardSettings;
	showQR?: boolean;
	qrCodeElement?: React.ReactNode;
	className?: string;
	resumeUrl?: string;
};

export function BusinessCard({ data, settings, showQR, qrCodeElement, className, resumeUrl }: BusinessCardProps) {
	const { basics, sections, picture, summary } = data;

	// Use default settings if not provided
	const cardSettings: BusinessCardSettings = settings ?? {
		enabled: true,
		showPhoto: true,
		showHeadline: true,
		showEmail: true,
		showPhone: false,
		showLocation: true,
		showSocialLinks: true,
		showWebsite: true,
		theme: "professional",
		accentColor: "#3b82f6",
		qrCodeMode: "url",
		showSummary: false,
	};

	const themeConfig = businessCardThemes[cardSettings.theme] || businessCardThemes.professional;
	const profiles = sections?.profiles?.items?.filter((p) => !p.hidden) ?? [];
	const accentColor = cardSettings.accentColor || "#3b82f6";

	// Calculate text colors based on accent color contrast
	const headerTextStyles = useMemo(() => {
		const isLight = isLightColor(accentColor);
		return {
			textColor: isLight ? "#1a1a1a" : "#ffffff",
			subtextColor: isLight ? "#4a4a4a" : adjustColor(accentColor, 80),
		};
	}, [accentColor]);

	// Generate accent-based icon styles
	const accentIconStyles = useMemo(
		() => ({
			backgroundColor: `${adjustColor(accentColor, isLightColor(accentColor) ? -20 : 180)}15`,
			color: adjustColor(accentColor, isLightColor(accentColor) ? -40 : -20),
		}),
		[accentColor],
	);

	const handleDownloadVCard = () => {
		downloadVCard(data, undefined, resumeUrl);
	};

	return (
		<div className={cn("overflow-hidden rounded-2xl shadow-xl", themeConfig.wrapper, className)}>
			{/* Header with photo and name */}
			<div className="relative p-8 text-center" style={{ backgroundColor: accentColor }}>
				{cardSettings.showPhoto && picture?.url && !picture.hidden && (
					<img
						src={picture.url}
						alt={basics.name}
						loading="lazy"
						width={96}
						height={96}
						className="mx-auto mb-4 size-24 rounded-full border-4 object-cover"
						style={{ borderColor: `${headerTextStyles.textColor}30` }}
					/>
				)}
				<h1 className="font-bold text-2xl" style={{ color: headerTextStyles.textColor }}>
					{basics.name || "Your Name"}
				</h1>
				{cardSettings.showHeadline && basics.headline && (
					<p className="mt-1 text-sm" style={{ color: headerTextStyles.subtextColor }}>
						{basics.headline}
					</p>
				)}
			</div>

			{/* Contact info & Summary */}
			<div className={cn("space-y-4 p-6", themeConfig.body)}>
				{cardSettings.showSummary && summary?.content && !summary.hidden && (
					<div className={cn("mb-6 rounded-lg border p-3 text-sm", themeConfig.border)}>
						<div className="mb-2 flex items-center gap-2 font-medium opacity-70">
							<TextAlignLeftIcon size={16} />
							<Trans>About</Trans>
						</div>
						<div
							className={cn("line-clamp-4 leading-relaxed", themeConfig.bodyText)}
							// biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized with DOMPurify
							dangerouslySetInnerHTML={{ __html: sanitizeHtml(summary.content) }}
						/>
					</div>
				)}

				{cardSettings.showEmail && basics.email && (
					<ContactRow
						icon={<EnvelopeIcon size={20} />}
						value={basics.email}
						href={`mailto:${basics.email}`}
						themeConfig={themeConfig}
						accentStyles={accentIconStyles}
					/>
				)}
				{cardSettings.showPhone && basics.phone && (
					<ContactRow
						icon={<PhoneIcon size={20} />}
						value={basics.phone}
						href={`tel:${basics.phone}`}
						themeConfig={themeConfig}
						accentStyles={accentIconStyles}
					/>
				)}
				{cardSettings.showLocation && basics.location && (
					<ContactRow
						icon={<MapPinIcon size={20} />}
						value={basics.location}
						themeConfig={themeConfig}
						accentStyles={accentIconStyles}
					/>
				)}
				{cardSettings.showWebsite && basics.website?.url && (
					<ContactRow
						icon={<GlobeIcon size={20} />}
						value={basics.website.label || basics.website.url}
						href={basics.website.url}
						themeConfig={themeConfig}
						accentStyles={accentIconStyles}
					/>
				)}

				{/* Social links */}
				{cardSettings.showSocialLinks && profiles.length > 0 && (
					<div className={cn("flex flex-wrap justify-center gap-3 border-t pt-4", themeConfig.border)}>
						{profiles.map((profile) => (
							<SocialIcon
								key={profile.id}
								network={profile.network}
								url={profile.website?.url || ""}
								themeConfig={themeConfig}
								accentStyles={accentIconStyles}
							/>
						))}
					</div>
				)}

				{/* QR Code */}
				{showQR && qrCodeElement && (
					<div className={cn("flex justify-center border-t pt-4", themeConfig.border)}>{qrCodeElement}</div>
				)}

				{/* Action buttons */}
				<div className="flex gap-2">
					{resumeUrl && (
						<Button asChild variant="outline" className={cn("flex-1", themeConfig.border)}>
							<a href={resumeUrl} target="_blank" rel="noopener noreferrer">
								<FileTextIcon className="mr-2" size={18} />
								<Trans>View Resume</Trans>
							</a>
						</Button>
					)}
					<Button
						onClick={handleDownloadVCard}
						className={cn(resumeUrl ? "flex-1" : "w-full", "transition-colors")}
						style={{
							backgroundColor: accentColor,
							color: headerTextStyles.textColor,
						}}
					>
						<AddressBookIcon className="mr-2" size={18} />
						<Trans>Save Contact</Trans>
					</Button>
				</div>
			</div>
		</div>
	);
}

export type { BusinessCardTheme, BusinessCardThemeConfig } from "./themes";
export { businessCardThemes } from "./themes";
