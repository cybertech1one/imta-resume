import type { Icon } from "@phosphor-icons/react";
import { BrainIcon, FireIcon, LightbulbIcon, TargetIcon, UsersIcon } from "@phosphor-icons/react";

export function formatDuration(minutes: number): string {
	if (minutes < 60) return `${minutes}min`;
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export function getReasonIcon(reason: string): Icon {
	if (reason.includes("skill_gap")) return TargetIcon;
	if (reason.includes("career")) return BrainIcon;
	if (reason.includes("popular")) return FireIcon;
	if (reason.includes("mentor")) return UsersIcon;
	return LightbulbIcon;
}
