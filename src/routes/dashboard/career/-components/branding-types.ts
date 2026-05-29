// Types for the Personal Branding page

export interface BrandStatementData {
	profession: string;
	targetAudience: string;
	uniqueStrength: string;
	valueProvided: string;
	personality: string;
}

export interface UVPData {
	problem: string;
	solution: string;
	benefit: string;
	differentiator: string;
}

export interface LogoConcept {
	id: string;
	name: string;
	description: string;
	symbolType: string;
	colors: string[];
	style: string;
}

export interface ColorPalette {
	id: string;
	name: string;
	description: string;
	colors: {
		name: string;
		hex: string;
		usage: string;
	}[];
	mood: string;
	industries: string[];
}

export interface VoiceTone {
	id: string;
	name: string;
	description: string;
	characteristics: string[];
	examples: {
		headline: string;
		bio: string;
	};
	bestFor: string[];
}

export interface ChecklistItem {
	id: string;
	category: string;
	label: string;
	description: string;
	importance: "critical" | "important" | "nice-to-have";
}
