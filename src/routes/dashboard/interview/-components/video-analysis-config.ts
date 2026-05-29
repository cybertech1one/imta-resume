import { t } from "@lingui/core/macro";
import {
	EyeIcon,
	HandIcon,
	MicrophoneIcon,
	PersonArmsSpreadIcon,
	SmileyIcon,
	SparkleIcon,
} from "@phosphor-icons/react";
import type { VideoAnalysisCategory } from "@/integrations/drizzle/schema";

// Category labels and icons
function getCategoryLabels(): Record<VideoAnalysisCategory, string> {
	return {
		body_language: t`Body Language`,
		eye_contact: t`Eye Contact`,
		voice: t`Voice`,
		confidence: t`Confidence`,
		posture: t`Posture`,
		facial_expression: t`Facial Expressions`,
	};
}

export const categoryLabels: Record<VideoAnalysisCategory, string> = new Proxy(
	{} as Record<VideoAnalysisCategory, string>,
	{
		get(_target, prop: string) {
			return getCategoryLabels()[prop as VideoAnalysisCategory];
		},
		ownKeys() {
			return Object.keys(getCategoryLabels());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getCategoryLabels();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as VideoAnalysisCategory] };
			}
			return undefined;
		},
	},
);

export const categoryIcons: Record<VideoAnalysisCategory, React.ElementType> = {
	body_language: HandIcon,
	eye_contact: EyeIcon,
	voice: MicrophoneIcon,
	confidence: SparkleIcon,
	posture: PersonArmsSpreadIcon,
	facial_expression: SmileyIcon,
};

export const categoryColors: Record<VideoAnalysisCategory, string> = {
	body_language: "from-blue-500/20 via-blue-500/10 to-transparent",
	eye_contact: "from-purple-500/20 via-purple-500/10 to-transparent",
	voice: "from-green-500/20 via-green-500/10 to-transparent",
	confidence: "from-amber-500/20 via-amber-500/10 to-transparent",
	posture: "from-red-500/20 via-red-500/10 to-transparent",
	facial_expression: "from-cyan-500/20 via-cyan-500/10 to-transparent",
};

export const categoryBadgeColors: Record<VideoAnalysisCategory, string> = {
	body_language: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	eye_contact: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	voice: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	confidence: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	posture: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	facial_expression: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
};

// Body Language Tips Data
function getBodyLanguageTips() {
	return [
		{
			id: "open-posture",
			title: t`Open Posture`,
			description: t`Keep your arms uncrossed and palms visible to project openness and confidence.`,
			illustration: "arms-open",
			do: t`Keep arms relaxed at your sides`,
			dont: t`Don't cross your arms over your chest`,
		},
		{
			id: "hand-gestures",
			title: t`Hand Gestures`,
			description: t`Use natural gestures to emphasize your points without overdoing it.`,
			illustration: "hand-gesture",
			do: t`Open and measured gestures`,
			dont: t`Avoid sudden or excessive movements`,
		},
		{
			id: "lean-forward",
			title: t`Leaning`,
			description: t`Lean slightly forward to show your interest and engagement.`,
			illustration: "lean",
			do: t`Subtle forward lean`,
			dont: t`Don't slouch backward`,
		},
		{
			id: "stillness",
			title: t`Body Stillness`,
			description: t`Avoid nervous movements like rocking or fidgeting with objects.`,
			illustration: "calm",
			do: t`Stay calm and composed`,
			dont: t`Avoid rocking or constant fidgeting`,
		},
	];
}

export const bodyLanguageTips = new Proxy([] as ReturnType<typeof getBodyLanguageTips>, {
	get(_target, prop) {
		const data = getBodyLanguageTips();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

// Eye Contact Guidance Data
function getEyeContactGuidance() {
	return [
		{
			zone: "camera",
			label: t`Camera Zone`,
			description: t`Look directly into the camera as if it were the eyes of the person you're speaking with.`,
			percentage: 60,
			color: "bg-green-500",
		},
		{
			zone: "notes",
			label: t`Notes Zone`,
			description: t`Glance quickly at your notes if necessary, but return to the camera quickly.`,
			percentage: 20,
			color: "bg-amber-500",
		},
		{
			zone: "thinking",
			label: t`Thinking Zone`,
			description: t`Briefly looking up or to the side shows that you are thinking.`,
			percentage: 15,
			color: "bg-blue-500",
		},
		{
			zone: "avoid",
			label: t`Zones to Avoid`,
			description: t`Avoid looking down or to the side for too long.`,
			percentage: 5,
			color: "bg-red-500",
		},
	];
}

export const eyeContactGuidance = new Proxy([] as ReturnType<typeof getEyeContactGuidance>, {
	get(_target, prop) {
		const data = getEyeContactGuidance();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

// Posture Checklist Data (static items)
function getPostureChecklistItems() {
	return [
		{ id: "back-straight", label: t`Straight back and shoulders pulled back` },
		{ id: "feet-floor", label: t`Feet flat on the floor` },
		{ id: "hands-visible", label: t`Hands visible on the desk` },
		{ id: "chin-level", label: t`Chin parallel to the ground` },
		{ id: "relaxed-shoulders", label: t`Shoulders relaxed, not raised` },
		{ id: "camera-level", label: t`Camera at eye level` },
		{ id: "adequate-distance", label: t`Appropriate distance from the camera` },
		{ id: "good-lighting", label: t`Adequate lighting on the face` },
	];
}

export const postureChecklistItems = new Proxy([] as ReturnType<typeof getPostureChecklistItems>, {
	get(_target, prop) {
		const data = getPostureChecklistItems();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});
