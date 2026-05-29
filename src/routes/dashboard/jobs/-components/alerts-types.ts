export type NotificationFrequency = "instant" | "daily" | "weekly";
export type WorkPreference = "remote" | "hybrid" | "onsite" | "any";
export type MatchQuality = "excellent" | "good" | "fair";

export interface AlertFormData {
	name: string;
	keywords: string;
	locations: string[];
	salaryMin: number;
	salaryMax: number;
	industries: string[];
	companySizes: string[];
	workPreference: WorkPreference;
	frequency: NotificationFrequency;
}

export const INITIAL_FORM_DATA: AlertFormData = {
	name: "",
	keywords: "",
	locations: [],
	salaryMin: 3000,
	salaryMax: 15000,
	industries: [],
	companySizes: [],
	workPreference: "any",
	frequency: "daily",
};
