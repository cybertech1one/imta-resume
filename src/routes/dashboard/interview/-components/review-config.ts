import { t } from "@lingui/core/macro";
import { ClockIcon, MicrophoneIcon, PersonArmsSpreadIcon, VideoCameraIcon } from "@phosphor-icons/react";

import type { RecordingStatus } from "./review-types";

// Constants - Static reference content
function getFieldLabels() {
	return {
		healthcare: t`Healthcare / Nursing`,
		industrial: t`Industrial Maintenance`,
		hse: t`HSE / Safety`,
		general: t`General`,
	};
}

export const fieldLabels: Record<string, string> = new Proxy({} as Record<string, string>, {
	get(_target, prop: string) {
		return getFieldLabels()[prop as keyof ReturnType<typeof getFieldLabels>];
	},
	ownKeys() {
		return Object.keys(getFieldLabels());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getFieldLabels();
		if (prop in data) {
			return { configurable: true, enumerable: true, value: data[prop as keyof typeof data] };
		}
		return undefined;
	},
});

function getBodyLanguageCategoryLabels() {
	return {
		posture: t`Posture`,
		eye_contact: t`Eye Contact`,
		gestures: t`Gestures`,
		facial: t`Facial Expression`,
		movement: t`Movement`,
	};
}

export const bodyLanguageCategoryLabels: Record<string, string> = new Proxy({} as Record<string, string>, {
	get(_target, prop: string) {
		return getBodyLanguageCategoryLabels()[prop as keyof ReturnType<typeof getBodyLanguageCategoryLabels>];
	},
	ownKeys() {
		return Object.keys(getBodyLanguageCategoryLabels());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getBodyLanguageCategoryLabels();
		if (prop in data) {
			return { configurable: true, enumerable: true, value: data[prop as keyof typeof data] };
		}
		return undefined;
	},
});

export const bodyLanguageCategoryColors: Record<string, string> = {
	posture: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	eye_contact: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	gestures: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	facial: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	movement: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
};

export const severityColors: Record<string, string> = {
	minor: "text-green-600",
	moderate: "text-amber-600",
	major: "text-red-600",
};

function getStatusLabels(): Record<RecordingStatus, string> {
	return {
		pending: t`Pending`,
		processing: t`Processing`,
		analyzed: t`Analyzed`,
		failed: t`Failed`,
	};
}

export const statusLabels: Record<RecordingStatus, string> = new Proxy({} as Record<RecordingStatus, string>, {
	get(_target, prop: string) {
		return getStatusLabels()[prop as RecordingStatus];
	},
	ownKeys() {
		return Object.keys(getStatusLabels());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getStatusLabels();
		if (prop in data) {
			return { configurable: true, enumerable: true, value: data[prop as RecordingStatus] };
		}
		return undefined;
	},
});

export const statusColors: Record<RecordingStatus, string> = {
	pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	analyzed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

// Static tips for reducing filler words
function getFillerWordTips() {
	return [
		{ key: "pause", text: t`Practice silent pauses - they are more professional than 'um'` },
		{ key: "prepare", text: t`Prepare your answers in advance to reduce hesitation` },
		{ key: "breathe", text: t`Breathe before answering to organize your thoughts` },
		{ key: "record", text: t`Record yourself regularly to become aware of your habits` },
	];
}

export const fillerWordTips = new Proxy([] as ReturnType<typeof getFillerWordTips>, {
	get(_target, prop) {
		const data = getFillerWordTips();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

// Static recording tips
function getRecordingTips() {
	return [
		{
			icon: VideoCameraIcon,
			title: t`Good Lighting`,
			desc: t`Position yourself facing a natural light source`,
		},
		{
			icon: MicrophoneIcon,
			title: t`Clear Audio`,
			desc: t`Use an external microphone if possible`,
		},
		{
			icon: PersonArmsSpreadIcon,
			title: t`Proper Framing`,
			desc: t`Show your face and upper body`,
		},
		{
			icon: ClockIcon,
			title: t`Optimal Duration`,
			desc: t`5-10 minutes per question for good analysis`,
		},
	];
}

export const recordingTips = new Proxy([] as ReturnType<typeof getRecordingTips>, {
	get(_target, prop) {
		const data = getRecordingTips();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});
