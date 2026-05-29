import type { Icon } from "@phosphor-icons/react";
import { FirstAidKitIcon, GearIcon, HardHatIcon } from "@phosphor-icons/react";
import z from "zod";
import type { DemandLevelInfo } from "./compare-types";

export const searchParamsSchema = z.object({
	programs: z.string().optional(),
});

export const categoryIcons: Record<string, Icon> = {
	healthcare: FirstAidKitIcon,
	industrial: GearIcon,
	hse: HardHatIcon,
	technology: GearIcon,
};

export const categoryLabels: Record<string, string> = {
	healthcare: "Healthcare",
	industrial: "Industrial",
	hse: "HSE",
	technology: "Technology",
};

export const categoryColors: Record<string, string> = {
	healthcare: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	industrial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	hse: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	technology: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export const demandLevelLabels: Record<string, DemandLevelInfo> = {
	very_high: { label: "Very High", color: "bg-green-500 text-white" },
	high: { label: "High", color: "bg-blue-500 text-white" },
	medium: { label: "Medium", color: "bg-amber-500 text-white" },
	low: { label: "Low", color: "bg-gray-500 text-white" },
};
