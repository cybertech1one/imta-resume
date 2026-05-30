import type { Icon } from "@phosphor-icons/react";
import { CheckCircleIcon, ClockIcon, EnvelopeIcon, NoteIcon, UsersIcon, XCircleIcon } from "@phosphor-icons/react";
import z from "zod";
import type { ApplicationStatus } from "./applications-types";

export const statusConfig: Record<ApplicationStatus, { label: string; icon: Icon; color: string; bgColor: string }> = {
	saved: {
		label: "Sauvegardée",
		icon: NoteIcon,
		color: "text-gray-600 dark:text-gray-400",
		bgColor: "bg-gray-100 dark:bg-gray-800/30",
	},
	applied: {
		label: "Envoyée",
		icon: EnvelopeIcon,
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	phone_screen: {
		label: "Appel RH",
		icon: ClockIcon,
		color: "text-amber-600 dark:text-amber-400",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
	},
	interview: {
		label: "Entretien prévu",
		icon: UsersIcon,
		color: "text-purple-600 dark:text-purple-400",
		bgColor: "bg-purple-100 dark:bg-purple-900/30",
	},
	offer: {
		label: "Offre reçue",
		icon: CheckCircleIcon,
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
	rejected: {
		label: "Refusée",
		icon: XCircleIcon,
		color: "text-red-600 dark:text-red-400",
		bgColor: "bg-red-100 dark:bg-red-900/30",
	},
	withdrawn: {
		label: "Retirée",
		icon: XCircleIcon,
		color: "text-gray-600 dark:text-gray-400",
		bgColor: "bg-gray-100 dark:bg-gray-800/30",
	},
	accepted: {
		label: "Acceptée",
		icon: CheckCircleIcon,
		color: "text-emerald-600 dark:text-emerald-400",
		bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
	},
};

export const applicationFormSchema = z.object({
	position: z
		.string()
		.trim()
		.min(2, { message: "Le poste doit contenir au moins 2 caractères" })
		.max(100, { message: "Le poste ne peut pas dépasser 100 caractères" }),
	companyName: z
		.string()
		.trim()
		.min(2, { message: "Le nom de l'entreprise doit contenir au moins 2 caractères" })
		.max(100, { message: "Le nom de l'entreprise ne peut pas dépasser 100 caractères" }),
	location: z
		.string()
		.trim()
		.max(100, { message: "La ville ne peut pas dépasser 100 caractères" })
		.optional()
		.or(z.literal("")),
	appliedAt: z.string().optional().or(z.literal("")),
	status: z.enum(["saved", "applied", "phone_screen", "interview", "offer", "rejected", "withdrawn", "accepted"]),
	notes: z
		.string()
		.max(1000, { message: "Les notes ne peuvent pas dépasser 1000 caractères" })
		.optional()
		.or(z.literal("")),
	salary: z.string().max(50, { message: "Le salaire ne peut pas dépasser 50 caractères" }).optional().or(z.literal("")),
	contactName: z
		.string()
		.trim()
		.max(100, { message: "Le nom du contact ne peut pas dépasser 100 caractères" })
		.optional()
		.or(z.literal("")),
	contactEmail: z.string().trim().email({ message: "Entre une adresse email valide" }).optional().or(z.literal("")),
});
