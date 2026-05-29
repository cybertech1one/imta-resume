import {
	BrainIcon,
	GraduationCapIcon,
	HardHatIcon,
	HeartbeatIcon,
	RocketLaunchIcon,
	ShieldCheckIcon,
	TargetIcon,
	UsersIcon,
} from "@phosphor-icons/react";

export const specializationIcons: Record<string, React.ElementType> = {
	healthcare: HeartbeatIcon,
	industrial: HardHatIcon,
	hse: ShieldCheckIcon,
	interview: UsersIcon,
	career_strategy: RocketLaunchIcon,
	skills_development: GraduationCapIcon,
	job_search: TargetIcon,
	networking: UsersIcon,
	general: BrainIcon,
};

export const avatarColors: Record<string, string> = {
	"healthcare-mentor": "bg-rose-500",
	"hse-mentor": "bg-amber-500",
	"industrial-mentor": "bg-slate-600",
	"interview-mentor": "bg-violet-500",
	"strategy-mentor": "bg-emerald-500",
};
