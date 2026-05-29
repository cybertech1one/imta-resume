import type { SquareIcon } from "@phosphor-icons/react";

export type QRSize = "small" | "medium" | "large";
export type QRStyle = "square" | "rounded" | "dots";

export type SizeConfigEntry = {
	label: string;
	pixels: number;
	description: string;
};

export type StyleConfigEntry = {
	label: string;
	description: string;
	icon: typeof SquareIcon;
};

export type SavedQRCode = {
	id: string;
	userId: string;
	name: string;
	url: string;
	foregroundColor: string;
	backgroundColor: string;
	size: QRSize;
	style: QRStyle;
	scans: number;
	createdAt: Date;
	updatedAt: Date;
};
