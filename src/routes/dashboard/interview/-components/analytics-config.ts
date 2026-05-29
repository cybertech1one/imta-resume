import { t } from "@lingui/core/macro";
import {
	CheckCircleIcon,
	ClockIcon,
	MinusIcon,
	TrendDownIcon,
	TrendUpIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";

function getReadinessConfig() {
	return {
		not_ready: {
			color: "text-red-500",
			bgColor: "bg-red-100 dark:bg-red-900/30",
			label: t`Not ready`,
			icon: XCircleIcon,
		},
		needs_practice: {
			color: "text-amber-500",
			bgColor: "bg-amber-100 dark:bg-amber-900/30",
			label: t`Needs practice`,
			icon: WarningCircleIcon,
		},
		almost_ready: {
			color: "text-blue-500",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
			label: t`Almost ready`,
			icon: ClockIcon,
		},
		interview_ready: {
			color: "text-green-500",
			bgColor: "bg-green-100 dark:bg-green-900/30",
			label: t`Interview ready`,
			icon: CheckCircleIcon,
		},
	};
}

export const readinessConfig = new Proxy({} as ReturnType<typeof getReadinessConfig>, {
	get(_target, prop: string) {
		return getReadinessConfig()[prop as keyof ReturnType<typeof getReadinessConfig>];
	},
	ownKeys() {
		return Object.keys(getReadinessConfig());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getReadinessConfig();
		if (prop in data) {
			return {
				configurable: true,
				enumerable: true,
				value: data[prop as keyof ReturnType<typeof getReadinessConfig>],
			};
		}
		return undefined;
	},
});

function getSeverityConfig() {
	return {
		critical: { color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/30", label: t`Critical` },
		major: { color: "text-amber-500", bgColor: "bg-amber-100 dark:bg-amber-900/30", label: t`Major` },
		minor: { color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30", label: t`Minor` },
	};
}

export const severityConfig = new Proxy({} as ReturnType<typeof getSeverityConfig>, {
	get(_target, prop: string) {
		return getSeverityConfig()[prop as keyof ReturnType<typeof getSeverityConfig>];
	},
	ownKeys() {
		return Object.keys(getSeverityConfig());
	},
	getOwnPropertyDescriptor(_target, prop) {
		const data = getSeverityConfig();
		if (prop in data) {
			return {
				configurable: true,
				enumerable: true,
				value: data[prop as keyof ReturnType<typeof getSeverityConfig>],
			};
		}
		return undefined;
	},
});

export const trendIcons = {
	improving: { icon: TrendUpIcon, color: "text-green-500" },
	stable: { icon: MinusIcon, color: "text-gray-500" },
	declining: { icon: TrendDownIcon, color: "text-red-500" },
};
