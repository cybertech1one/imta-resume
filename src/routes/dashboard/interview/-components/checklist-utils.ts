import { ListChecksIcon } from "@phosphor-icons/react";

import { iconMap } from "./checklist-config";
import type { ChecklistItem, DbChecklistItem } from "./checklist-types";

const getIconComponent = (iconName: string | null | undefined) => {
	if (!iconName) return ListChecksIcon;
	return iconMap[iconName] || ListChecksIcon;
};

export const convertToChecklistItem = (dbItem: DbChecklistItem): ChecklistItem => {
	const title = dbItem.title || dbItem.titleFr;
	const description = dbItem.description || dbItem.descriptionFr || "";

	const tipText = dbItem.tip || dbItem.tipFr;
	const tips = tipText
		? tipText
				.split(/[,\n]/)
				.map((t) => t.trim())
				.filter(Boolean)
		: undefined;

	const link = dbItem.link
		? {
				text: dbItem.linkLabel || "See more",
				href: dbItem.link,
			}
		: undefined;

	return {
		id: dbItem.id,
		title: title ?? "",
		description,
		tips,
		link,
		icon: getIconComponent(dbItem.icon),
	};
};
