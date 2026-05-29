import type { Icon } from "@phosphor-icons/react";
import type z from "zod";

import type { searchSchema } from "./tips-config";

export type SearchParams = z.infer<typeof searchSchema>;

export type CategoryConfigItem = {
	label: string;
	labelFr: string;
	description: string;
	icon: Icon;
	color: string;
	bgColor: string;
};

export type FieldConfigItem = {
	label: string;
	labelFr: string;
	icon: Icon;
	color: string;
	bgColor: string;
};
