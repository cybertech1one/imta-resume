import type { Icon } from "@phosphor-icons/react";
import {
	ArticleIcon,
	BookOpenIcon,
	BriefcaseIcon,
	FileTextIcon,
	FirstAidKitIcon,
	GearIcon,
	HandHeartIcon,
	HardHatIcon,
	HeartbeatIcon,
	PackageIcon,
	StarIcon,
	StethoscopeIcon,
	TruckIcon,
	VideoIcon,
	WrenchIcon,
} from "@phosphor-icons/react";

// Icon mapping for programs
export const programIconMap: Record<string, Icon> = {
	FirstAidKit: FirstAidKitIcon,
	Heartbeat: HeartbeatIcon,
	HandHeart: HandHeartIcon,
	Stethoscope: StethoscopeIcon,
	HardHat: HardHatIcon,
	Truck: TruckIcon,
	Wrench: WrenchIcon,
	Gear: GearIcon,
	Package: PackageIcon,
};

export const categoryIcons = {
	healthcare: FirstAidKitIcon,
	industrial: GearIcon,
	hse: HardHatIcon,
	general: BookOpenIcon,
	career: BriefcaseIcon,
};

export const categoryLabels = {
	healthcare: "Healthcare",
	industrial: "Industrial",
	hse: "HSE",
	general: "General",
	career: "Career",
};

export const categoryColors = {
	healthcare: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	industrial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	hse: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	general: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
	career: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export const categoryGradients = {
	healthcare: "from-red-500/20 via-rose-500/10 to-transparent",
	industrial: "from-blue-500/20 via-indigo-500/10 to-transparent",
	hse: "from-amber-500/20 via-orange-500/10 to-transparent",
	general: "from-gray-500/20 via-slate-500/10 to-transparent",
	career: "from-green-500/20 via-emerald-500/10 to-transparent",
};

export const typeIcons = {
	guide: BookOpenIcon,
	video: VideoIcon,
	template: FileTextIcon,
	article: ArticleIcon,
	success_story: StarIcon,
};

export const typeLabels = {
	guide: "Guide",
	video: "Video",
	template: "Template",
	article: "Article",
	success_story: "Success Story",
};

// Employment rates derived from IMTA program data
export const EMPLOYMENT_RATE_DEFAULTS: Record<string, number> = {
	"sage-femme": 95,
	"infirmier-polyvalent": 92,
	"aide-soignant": 88,
	"infirmier-auxiliaire": 85,
	"hse-specialist": 90,
	"conducteur-engins": 87,
	"mecanique-engins": 89,
	"tourneur-industriel": 82,
	"cariste-professionnel": 84,
};
