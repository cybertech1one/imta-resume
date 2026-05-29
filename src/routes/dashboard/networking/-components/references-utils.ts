import { t } from "@lingui/core/macro";

import { contactTypeToRelationship } from "./references-config";
import type { NetworkingContact, Reference, RequestStatus } from "./references-types";

function extractRequestStatus(notes: string | null): RequestStatus {
	if (!notes) return "not_asked";
	try {
		const match = notes.match(/\[REQUEST_STATUS:(\w+)\]/);
		if (match) {
			const status = match[1];
			if (status === "pending" || status === "confirmed" || status === "not_asked") {
				return status;
			}
		}
	} catch {
		// Ignore parse errors
	}
	return "not_asked";
}

export function updateRequestStatusInNotes(notes: string | null, status: RequestStatus): string {
	const cleanNotes = (notes || "").replace(/\[REQUEST_STATUS:\w+\]/g, "").trim();
	return `[REQUEST_STATUS:${status}]${cleanNotes ? ` ${cleanNotes}` : ""}`;
}

function getCleanNotes(notes: string | null): string {
	if (!notes) return "";
	return notes.replace(/\[REQUEST_STATUS:\w+\]\s?/g, "").trim();
}

export function contactToReference(contact: NetworkingContact): Reference {
	return {
		id: contact.id,
		name: contact.name,
		title: contact.position || "",
		company: contact.company || "",
		email: contact.email || "",
		phone: contact.phone || "",
		relationshipType: contactTypeToRelationship[contact.relationship] || "colleague",
		lastContactDate: contact.lastContactedAt
			? new Date(contact.lastContactedAt).toISOString().split("T")[0]
			: new Date().toISOString().split("T")[0],
		requestStatus: extractRequestStatus(contact.notes),
		notes: getCleanNotes(contact.notes),
	};
}

export function daysSinceContact(dateString: string): number {
	const lastContact = new Date(dateString);
	const today = new Date();
	const diffTime = Math.abs(today.getTime() - lastContact.getTime());
	return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function getReminderIndicator(days: number): { text: string; color: string; urgent: boolean } {
	if (days > 60) {
		return {
			text: t`More than 2 months without contact`,
			color: "text-red-500",
			urgent: true,
		};
	}
	if (days > 30) {
		return {
			text: t`More than a month without contact`,
			color: "text-amber-500",
			urgent: false,
		};
	}
	if (days > 14) {
		return {
			text: t`More than 2 weeks without contact`,
			color: "text-blue-500",
			urgent: false,
		};
	}
	return {
		text: t`Recent contact`,
		color: "text-green-500",
		urgent: false,
	};
}
