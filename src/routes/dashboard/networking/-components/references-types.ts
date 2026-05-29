import type { Icon } from "@phosphor-icons/react";

export type RelationshipType = "supervisor" | "colleague" | "mentor" | "professor";
export type RequestStatus = "not_asked" | "pending" | "confirmed";

export interface NetworkingContact {
	id: string;
	userId: string;
	name: string;
	email: string | null;
	phone: string | null;
	company: string | null;
	position: string | null;
	linkedinUrl: string | null;
	relationship: string;
	relationshipStrength: string | null;
	howMet: string | null;
	notes: string | null;
	tags: string[] | null;
	lastContactedAt: Date | null;
	nextFollowUpAt: Date | null;
	isFavorite: boolean | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Reference {
	id: string;
	name: string;
	title: string;
	company: string;
	email: string;
	phone: string;
	relationshipType: RelationshipType;
	lastContactDate: string;
	requestStatus: RequestStatus;
	notes: string;
}

export interface RelationshipConfigItem {
	label: string;
	icon: Icon;
	color: string;
}

export interface StatusConfigItem {
	label: string;
	icon: Icon;
	color: string;
	bgColor: string;
}

export interface EmailTemplate {
	name: string;
	subject: string;
	body: string;
}
