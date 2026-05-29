import type z from "zod";
import type { applicationFormSchema } from "./applications-config";

export type ApplicationStatus =
	| "saved"
	| "applied"
	| "phone_screen"
	| "interview"
	| "offer"
	| "rejected"
	| "withdrawn"
	| "accepted";

export type ApplicationData = {
	id: string;
	position: string;
	companyName: string;
	location: string | null;
	appliedAt: Date | null;
	status: string;
	notes: string | null;
	deadline: Date | null;
};

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;
