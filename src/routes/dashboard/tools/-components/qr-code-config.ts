import { CircleIcon, HashIcon, SquareIcon } from "@phosphor-icons/react";
import type { QRSize, QRStyle, SizeConfigEntry, StyleConfigEntry } from "./qr-code-types";

// Size configurations
export const sizeConfig: Record<QRSize, SizeConfigEntry> = {
	small: { label: "Petit", pixels: 128, description: "128x128 px" },
	medium: { label: "Moyen", pixels: 256, description: "256x256 px" },
	large: { label: "Grand", pixels: 512, description: "512x512 px" },
};

// Style configurations
export const styleConfig: Record<QRStyle, StyleConfigEntry> = {
	square: { label: "Carre", description: "Style classique", icon: SquareIcon },
	rounded: { label: "Arrondi", description: "Coins arrondis", icon: CircleIcon },
	dots: { label: "Points", description: "Motif en points", icon: HashIcon },
};

// Predefined foreground colors
export const predefinedColors = [
	{ name: "Noir", value: "#000000" },
	{ name: "Bleu", value: "#3b82f6" },
	{ name: "Vert", value: "#10b981" },
	{ name: "Violet", value: "#8b5cf6" },
	{ name: "Rouge", value: "#ef4444" },
	{ name: "Orange", value: "#f97316" },
	{ name: "Rose", value: "#ec4899" },
	{ name: "Cyan", value: "#06b6d4" },
] as const;

// Predefined background colors
export const predefinedBackgroundColors = [
	{ name: "Blanc", value: "#ffffff" },
	{ name: "Gris clair", value: "#f3f4f6" },
	{ name: "Creme", value: "#fef3c7" },
	{ name: "Bleu clair", value: "#dbeafe" },
] as const;

// Device color mapping for statistics charts
export const deviceColors: Record<string, string> = {
	Mobile: "#3b82f6",
	Desktop: "#8b5cf6",
	Tablet: "#10b981",
	Unknown: "#9ca3af",
};

// Print format options
export const printFormatOptions = [
	{ value: "card", label: "Business Card", size: "85x55 mm" },
	{ value: "a4", label: "A4 Page", size: "210x297 mm" },
	{ value: "custom", label: "Custom", size: "Variable" },
] as const;
