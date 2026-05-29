import { t } from "@lingui/core/macro";
import type { Icon } from "@phosphor-icons/react";
import { ChatCircleIcon, LightningIcon, TargetIcon, UserCircleIcon } from "@phosphor-icons/react";

import type { Language, PanelMember } from "./voice-interview-types";

// Panel member presets - use function + Proxy to avoid Lingui race condition
function getPanelMembers(): PanelMember[] {
	return [
		{
			id: "hr-director",
			name: "Marie Dubois",
			role: t`HR Director`,
			avatar: "/avatars/marie.jpg",
			voiceStyle: "professional",
			color: "from-blue-500 to-indigo-600",
		},
		{
			id: "tech-lead",
			name: "Ahmed Benali",
			role: t`Technical Lead`,
			avatar: "/avatars/ahmed.jpg",
			voiceStyle: "technical",
			color: "from-emerald-500 to-teal-600",
		},
		{
			id: "manager",
			name: "Sophie Martin",
			role: t`Project Manager`,
			avatar: "/avatars/sophie.jpg",
			voiceStyle: "friendly",
			color: "from-purple-500 to-pink-600",
		},
		{
			id: "ceo",
			name: "Jean-Pierre Moreau",
			role: t`General Manager`,
			avatar: "/avatars/jean.jpg",
			voiceStyle: "challenging",
			color: "from-amber-500 to-orange-600",
		},
	];
}

export const PANEL_MEMBERS: PanelMember[] = new Proxy([] as PanelMember[], {
	get(_target, prop) {
		const data = getPanelMembers();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

// Language configuration - use function + Proxy
function getLanguages(): Record<Language, { label: string; flag: string }> {
	return {
		fr: { label: t`French`, flag: "fr" },
		en: { label: t`English`, flag: "gb" },
		ar: { label: "العربية", flag: "sa" },
		darija: { label: t`Darija`, flag: "ma" },
	};
}

export const LANGUAGES: Record<Language, { label: string; flag: string }> = new Proxy(
	{} as Record<Language, { label: string; flag: string }>,
	{
		get(_target, prop: string) {
			return getLanguages()[prop as Language];
		},
		ownKeys() {
			return Object.keys(getLanguages());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getLanguages();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as Language] };
			}
			return undefined;
		},
	},
);

// Voice style icons - use function + Proxy
function getVoiceStyleIcons(): Record<string, { icon: Icon; label: string }> {
	return {
		professional: { icon: UserCircleIcon, label: t`Professional` },
		friendly: { icon: ChatCircleIcon, label: t`Friendly` },
		challenging: { icon: LightningIcon, label: t`Challenging` },
		technical: { icon: TargetIcon, label: t`Technical` },
	};
}

export const VOICE_STYLE_ICONS: Record<string, { icon: Icon; label: string }> = new Proxy(
	{} as Record<string, { icon: Icon; label: string }>,
	{
		get(_target, prop: string) {
			return getVoiceStyleIcons()[prop];
		},
		ownKeys() {
			return Object.keys(getVoiceStyleIcons());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const data = getVoiceStyleIcons();
			if (prop in data) {
				return { configurable: true, enumerable: true, value: data[prop as string] };
			}
			return undefined;
		},
	},
);
