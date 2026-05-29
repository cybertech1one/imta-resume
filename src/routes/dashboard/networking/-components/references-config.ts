import { t } from "@lingui/core/macro";
import {
	BriefcaseIcon,
	CheckCircleIcon,
	ClockIcon,
	GraduationCapIcon,
	QuestionIcon,
	UserCircleIcon,
	UsersIcon,
} from "@phosphor-icons/react";

import type {
	EmailTemplate,
	RelationshipConfigItem,
	RelationshipType,
	RequestStatus,
	StatusConfigItem,
} from "./references-types";

export const REFERENCE_TAG = "reference";

export const relationshipToContactType: Record<RelationshipType, string> = {
	supervisor: "hiring_manager",
	colleague: "colleague",
	mentor: "mentor",
	professor: "alumni",
};

export const contactTypeToRelationship: Record<string, RelationshipType> = {
	hiring_manager: "supervisor",
	colleague: "colleague",
	mentor: "mentor",
	alumni: "professor",
};

export const relationshipConfig: Record<RelationshipType, RelationshipConfigItem> = {
	supervisor: {
		label: t`Supervisor`,
		icon: BriefcaseIcon,
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	colleague: {
		label: t`Colleague`,
		icon: UsersIcon,
		color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	},
	mentor: {
		label: t`Mentor`,
		icon: UserCircleIcon,
		color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	},
	professor: {
		label: t`Professor`,
		icon: GraduationCapIcon,
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	},
};

export const statusConfig: Record<RequestStatus, StatusConfigItem> = {
	not_asked: {
		label: t`Not asked`,
		icon: QuestionIcon,
		color: "text-gray-600 dark:text-gray-400",
		bgColor: "bg-gray-100 dark:bg-gray-800/30",
	},
	pending: {
		label: t`Pending`,
		icon: ClockIcon,
		color: "text-amber-600 dark:text-amber-400",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
	},
	confirmed: {
		label: t`Confirmed`,
		icon: CheckCircleIcon,
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
};

export const emailTemplates: Record<string, EmailTemplate> = {
	formal: {
		name: t`Formal request`,
		subject: t`Professional Reference Request`,
		body: t`Dear [NOM],

I hope you are doing well. I am reaching out because I am currently looking for new professional opportunities.

Having had the pleasure of working with you at [ENTREPRISE], I would be honored if you would agree to serve as a professional reference for me.

Your testimony about my work and skills would be very valuable for potential employers.

I remain at your disposal for any additional information you may need.

Best regards,
[VOTRE NOM]`,
	},
	casual: {
		name: t`Informal request`,
		subject: t`A small favor to ask`,
		body: t`Hi [NOM],

I hope you're doing well! I'm currently looking for a new position and I was wondering if you would agree to serve as a reference for me.

Your feedback on our collaboration at [ENTREPRISE] could really help me in my search.

Let me know if this works for you!

Thanks in advance,
[VOTRE NOM]`,
	},
	academic: {
		name: t`Academic request`,
		subject: t`Recommendation Letter Request`,
		body: t`Dear Professor [NOM],

I am reaching out regarding my application for [PROGRAMME/POSTE].

Having taken your [MATIERE] courses and appreciated your teaching, I would be very grateful if you would agree to write a recommendation letter on my behalf.

I can provide any necessary documents (resume, cover letter, form) as needed.

Thank you in advance for your consideration.

Respectfully,
[VOTRE NOM]`,
	},
};
