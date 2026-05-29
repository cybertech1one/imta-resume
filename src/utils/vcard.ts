import type { ResumeData } from "@/schema/resume/data";

/**
 * Escapes special characters in vCard field values.
 * vCard 3.0 requires escaping of commas, semicolons, and backslashes.
 * @param value - The value to escape.
 * @returns The escaped value.
 */
function escapeVCardValue(value: string): string {
	return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/**
 * Parses a full name into structured name parts for vCard N field.
 * Format: Family Name;Given Name;Additional Names;Honorific Prefixes;Honorific Suffixes
 * @param fullName - The full name to parse.
 * @returns The structured name parts separated by semicolons.
 */
function parseNameParts(fullName: string): string {
	const parts = fullName.trim().split(/\s+/);
	if (parts.length === 0) return ";;;;";
	if (parts.length === 1) return `${escapeVCardValue(parts[0])};;;;`;

	const lastName = parts[parts.length - 1];
	const firstName = parts[0];
	const middleNames = parts.slice(1, -1).join(" ");

	return `${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};${escapeVCardValue(middleNames)};;`;
}

/**
 * Generates a vCard 3.0 formatted string from resume data.
 * Follows RFC 6350 specification for maximum compatibility.
 * @internal Used internally by downloadVCard - may be exposed for direct use in future.
 * @param data - The resume data to convert to vCard format.
 * @param resumeUrl - Optional URL to the full resume.
 * @returns The vCard formatted string.
 */
export function generateVCard(data: ResumeData, resumeUrl?: string): string {
	const { basics, sections, picture } = data;
	const lines: string[] = [];

	// vCard header
	lines.push("BEGIN:VCARD");
	lines.push("VERSION:3.0");

	// Full name (required)
	lines.push(`FN:${escapeVCardValue(basics.name || "Unknown")}`);

	// Structured name
	lines.push(`N:${parseNameParts(basics.name || "Unknown")}`);

	// Title/headline
	if (basics.headline) {
		lines.push(`TITLE:${escapeVCardValue(basics.headline)}`);
	}

	// Email
	if (basics.email) {
		lines.push(`EMAIL;TYPE=INTERNET:${escapeVCardValue(basics.email)}`);
	}

	// Phone
	if (basics.phone) {
		lines.push(`TEL;TYPE=CELL:${escapeVCardValue(basics.phone)}`);
	}

	// Website URL (primary)
	if (basics.website?.url) {
		lines.push(`URL:${escapeVCardValue(basics.website.url)}`);
	}

	// Resume URL as secondary URL with label
	if (resumeUrl) {
		lines.push(`URL;TYPE=WORK;X-ABLabel=Resume:${escapeVCardValue(resumeUrl)}`);
	}

	// Address from location
	if (basics.location) {
		// ADR format: PO Box;Extended Address;Street;City;Region;Postal Code;Country
		lines.push(`ADR;TYPE=HOME:;;${escapeVCardValue(basics.location)};;;;`);
	}

	// Photo
	if (picture?.url && !picture.hidden) {
		lines.push(`PHOTO;VALUE=URI:${picture.url}`);
	}

	// Social profiles
	const profiles = sections?.profiles?.items ?? [];
	for (const profile of profiles) {
		if (profile.hidden) continue;
		if (profile.website?.url) {
			lines.push(`X-SOCIALPROFILE;TYPE=${escapeVCardValue(profile.network)}:${profile.website.url}`);
		}
	}

	// Morocco-specific fields
	// Date of Birth (BDAY field - standard vCard field)
	if (basics.dateOfBirth) {
		// Try to parse and format date, otherwise use as-is
		const dobFormatted = basics.dateOfBirth.replace(/\//g, "-");
		lines.push(`BDAY:${escapeVCardValue(dobFormatted)}`);
	}

	// Build NOTE field with Morocco-specific info and custom fields
	const noteItems: string[] = [];

	// CIN (Moroccan National ID)
	if (basics.cin) {
		noteItems.push(`CIN: ${basics.cin}`);
	}

	// Nationality
	if (basics.nationality) {
		noteItems.push(`Nationalite: ${basics.nationality}`);
	}

	// Marital Status
	if (basics.maritalStatus) {
		noteItems.push(`Situation familiale: ${basics.maritalStatus}`);
	}

	// Military Service Status (if applicable)
	if (basics.militaryServiceStatus && basics.militaryServiceStatus !== "not-applicable") {
		const militaryLabels: Record<string, string> = {
			completed: "Accompli",
			exempted: "Dispense",
			pending: "En instance",
			"in-service": "En cours",
		};
		noteItems.push(
			`Service militaire: ${militaryLabels[basics.militaryServiceStatus] || basics.militaryServiceStatus}`,
		);
	}

	// Custom fields
	if (basics.customFields && basics.customFields.length > 0) {
		const customFieldsText = basics.customFields
			.filter((field) => field.text)
			.map((field) => field.text)
			.join(", ");
		if (customFieldsText) {
			noteItems.push(customFieldsText);
		}
	}

	// Add combined NOTE field if there's content
	if (noteItems.length > 0) {
		lines.push(`NOTE:${escapeVCardValue(noteItems.join(" | "))}`);
	}

	// Production ID for tracking (optional)
	lines.push(`PRODID:-//IMTA Resume//EN`);

	// Revision date
	lines.push(`REV:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`);

	// vCard footer
	lines.push("END:VCARD");

	// vCard spec requires CRLF line endings
	return lines.join("\r\n");
}

/**
 * Downloads the resume data as a vCard (.vcf) file.
 * Creates a Blob and triggers a download in the browser.
 * @param data - The resume data to download as vCard.
 * @param filename - Optional custom filename (without extension).
 * @param resumeUrl - Optional URL to the full resume.
 */
export function downloadVCard(data: ResumeData, filename?: string, resumeUrl?: string): void {
	const vcfContent = generateVCard(data, resumeUrl);
	const blob = new Blob([vcfContent], { type: "text/vcard;charset=utf-8" });
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = url;

	// Generate filename from name, replacing spaces with underscores
	const safeName = (data.basics.name || "contact").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
	link.download = filename ? `${filename}.vcf` : `${safeName}.vcf`;

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}

/**
 * Gets a compact vCard string suitable for embedding in a QR code.
 * Removes optional fields to reduce size while keeping essential contact info.
 * @param data - The resume data to convert.
 * @param resumeUrl - Optional URL to the full resume (included in compact version for business cards).
 * @returns A compact vCard string.
 */
export function generateCompactVCard(data: ResumeData, resumeUrl?: string): string {
	const { basics } = data;
	const lines: string[] = [];

	lines.push("BEGIN:VCARD");
	lines.push("VERSION:3.0");
	lines.push(`FN:${escapeVCardValue(basics.name || "Unknown")}`);
	lines.push(`N:${parseNameParts(basics.name || "Unknown")}`);

	if (basics.headline) {
		lines.push(`TITLE:${escapeVCardValue(basics.headline)}`);
	}

	if (basics.email) {
		lines.push(`EMAIL:${escapeVCardValue(basics.email)}`);
	}

	if (basics.phone) {
		lines.push(`TEL:${escapeVCardValue(basics.phone)}`);
	}

	// Include resume URL in compact version for business cards
	if (resumeUrl) {
		lines.push(`URL:${resumeUrl}`);
	} else if (basics.website?.url) {
		lines.push(`URL:${basics.website.url}`);
	}

	// Morocco-specific: Include CIN in compact vCard NOTE if present
	if (basics.cin) {
		lines.push(`NOTE:CIN: ${escapeVCardValue(basics.cin)}`);
	}

	lines.push("END:VCARD");

	return lines.join("\r\n");
}
