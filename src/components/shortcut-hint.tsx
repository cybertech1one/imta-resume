import { Kbd, KbdGroup } from "@/components/ui/kbd";

// Check if running on macOS
const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

// Format key for display
function formatKey(key: string): string {
	const keyMap: Record<string, string> = {
		mod: isMac ? "Cmd" : "Ctrl",
		meta: isMac ? "Cmd" : "Win",
		ctrl: "Ctrl",
		alt: isMac ? "Option" : "Alt",
		shift: "Shift",
		escape: "Esc",
		backspace: "Backspace",
		enter: "Enter",
		space: "Space",
		arrowup: "Up",
		arrowdown: "Down",
		arrowleft: "Left",
		arrowright: "Right",
	};

	const normalizedKey = key.toLowerCase();
	return keyMap[normalizedKey] || key.toUpperCase();
}

export interface ShortcutHintProps {
	keys: string[];
	className?: string;
}

/**
 * A component to display keyboard shortcut hints in tooltips or UI elements.
 * Automatically handles Mac/Windows modifier key display.
 *
 * @example
 * <ShortcutHint keys={["mod", "k"]} />
 * // Renders: Cmd+K on Mac, Ctrl+K on Windows
 */
export function ShortcutHint({ keys, className }: ShortcutHintProps) {
	return (
		<KbdGroup className={className}>
			{keys.map((key, index) => (
				<span key={`${key}-${index}`} className="flex items-center gap-0.5">
					<Kbd>{formatKey(key)}</Kbd>
					{index < keys.length - 1 && <span className="text-muted-foreground text-xs">+</span>}
				</span>
			))}
		</KbdGroup>
	);
}

/**
 * Inline variant for use in text or tooltips
 */
export function ShortcutHintInline({ keys }: ShortcutHintProps) {
	return (
		<span className="ml-2 inline-flex items-center gap-0.5">
			{keys.map((key, index) => (
				<span key={`${key}-${index}`}>
					<Kbd className="px-1 py-0.5 text-[10px]">{formatKey(key)}</Kbd>
					{index < keys.length - 1 && <span className="mx-0.5 text-muted-foreground text-xs">+</span>}
				</span>
			))}
		</span>
	);
}

/**
 * Get the platform-specific modifier key
 */
export function getModifierKey(): string {
	return isMac ? "Cmd" : "Ctrl";
}

/**
 * Check if running on macOS
 */
export function isMacOS(): boolean {
	return isMac;
}
