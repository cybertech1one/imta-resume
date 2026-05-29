import { t } from "@lingui/core/macro";

function getRadarCategories() {
	return [
		{ key: "confidence" as const, label: t`Confidence`, color: "#8b5cf6" },
		{ key: "clarity" as const, label: t`Clarity`, color: "#06b6d4" },
		{ key: "relevance" as const, label: t`Relevance`, color: "#10b981" },
		{ key: "technical" as const, label: t`Technical`, color: "#f59e0b" },
		{ key: "communication" as const, label: t`Communication`, color: "#ef4444" },
	] as const;
}

export const RADAR_CATEGORIES = new Proxy([] as unknown as ReturnType<typeof getRadarCategories>, {
	get(_target, prop) {
		const data = getRadarCategories();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

export const STATUS_COLORS: Record<string, string> = {
	not_started: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
	preparing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	practicing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	ready: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

function getStatusLabels(): Record<string, string> {
	return {
		not_started: t`Not started`,
		preparing: t`Preparing`,
		practicing: t`Practicing`,
		ready: t`Ready`,
		completed: t`Completed`,
	};
}

export const STATUS_LABELS: Record<string, string> = new Proxy({} as Record<string, string>, {
	get(_target, prop: string) {
		return getStatusLabels()[prop];
	},
	ownKeys() {
		return Object.keys(getStatusLabels());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getStatusLabels();
		if (prop in data) {
			return { configurable: true, enumerable: true, value: data[prop as string] };
		}
		return undefined;
	},
});
