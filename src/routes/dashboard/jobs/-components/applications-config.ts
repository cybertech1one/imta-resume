import type { Icon } from "@phosphor-icons/react";
import { CheckCircleIcon, ClockIcon, EnvelopeIcon, NoteIcon, UsersIcon, XCircleIcon } from "@phosphor-icons/react";
import z from "zod";
import type { ApplicationStatus } from "./applications-types";

export const statusConfig: Record<ApplicationStatus, { label: string; icon: Icon; color: string; bgColor: string }> = {
	saved: {
		label: "Saved",
		icon: NoteIcon,
		color: "text-gray-600 dark:text-gray-400",
		bgColor: "bg-gray-100 dark:bg-gray-800/30",
	},
	applied: {
		label: "Applied",
		icon: EnvelopeIcon,
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	phone_screen: {
		label: "Phone Screen",
		icon: ClockIcon,
		color: "text-amber-600 dark:text-amber-400",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
	},
	interview: {
		label: "Interview Scheduled",
		icon: UsersIcon,
		color: "text-purple-600 dark:text-purple-400",
		bgColor: "bg-purple-100 dark:bg-purple-900/30",
	},
	offer: {
		label: "Offer Received",
		icon: CheckCircleIcon,
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
	rejected: {
		label: "Rejected",
		icon: XCircleIcon,
		color: "text-red-600 dark:text-red-400",
		bgColor: "bg-red-100 dark:bg-red-900/30",
	},
	withdrawn: {
		label: "Withdrawn",
		icon: XCircleIcon,
		color: "text-gray-600 dark:text-gray-400",
		bgColor: "bg-gray-100 dark:bg-gray-800/30",
	},
	accepted: {
		label: "Accepted",
		icon: CheckCircleIcon,
		color: "text-emerald-600 dark:text-emerald-400",
		bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
	},
};

export const applicationFormSchema = z.object({
	position: z
		.string()
		.trim()
		.min(2, { message: "Position must be at least 2 characters" })
		.max(100, { message: "Position cannot exceed 100 characters" }),
	companyName: z
		.string()
		.trim()
		.min(2, { message: "Company name must be at least 2 characters" })
		.max(100, { message: "Company name cannot exceed 100 characters" }),
	location: z
		.string()
		.trim()
		.max(100, { message: "Location cannot exceed 100 characters" })
		.optional()
		.or(z.literal("")),
	appliedAt: z.string().optional().or(z.literal("")),
	status: z.enum(["saved", "applied", "phone_screen", "interview", "offer", "rejected", "withdrawn", "accepted"]),
	notes: z.string().max(1000, { message: "Notes cannot exceed 1000 characters" }).optional().or(z.literal("")),
	salary: z.string().max(50, { message: "Salary cannot exceed 50 characters" }).optional().or(z.literal("")),
	contactName: z
		.string()
		.trim()
		.max(100, { message: "Contact name cannot exceed 100 characters" })
		.optional()
		.or(z.literal("")),
	contactEmail: z.string().trim().email({ message: "Please enter a valid email address" }).optional().or(z.literal("")),
});
