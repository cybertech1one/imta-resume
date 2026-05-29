import type { Icon } from "@phosphor-icons/react";
import {
	ArrowsClockwiseIcon,
	BriefcaseIcon,
	CameraIcon,
	ChatCircleIcon,
	HashIcon,
	ImageIcon,
	LightbulbIcon,
	MegaphoneIcon,
	PencilSimpleIcon,
	ShareNetworkIcon,
	StarIcon,
	TargetIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";

// Icon mapping for photo tips and engagement tips
export const iconMap: Record<string, Icon> = {
	CameraIcon,
	UserCircleIcon,
	ImageIcon,
	BriefcaseIcon,
	StarIcon,
	ArrowsClockwiseIcon,
	PencilSimpleIcon,
	TargetIcon,
	HashIcon,
	ChatCircleIcon,
	LightbulbIcon,
	ShareNetworkIcon,
	MegaphoneIcon,
};

// Score color utilities
export const getScoreColor = (score: number) => {
	if (score >= 80) return "text-green-600 dark:text-green-400";
	if (score >= 60) return "text-amber-600 dark:text-amber-400";
	return "text-red-600 dark:text-red-400";
};

export const getScoreBg = (score: number) => {
	if (score >= 80) return "bg-green-500";
	if (score >= 60) return "bg-amber-500";
	return "bg-red-500";
};
