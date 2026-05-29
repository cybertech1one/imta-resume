export const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export function formatKey(key: string): string {
	const keyMap: Record<string, string> = {
		mod: isMac ? "Cmd" : "Ctrl",
		meta: isMac ? "Cmd" : "Win",
		ctrl: "Ctrl",
		alt: isMac ? "Option" : "Alt",
		shift: "Shift",
		escape: "Esc",
		backspace: "Backspace",
	};

	const normalizedKey = key.toLowerCase();
	return keyMap[normalizedKey] || key.toUpperCase();
}
