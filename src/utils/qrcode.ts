import QRCode from "qrcode";

/**
 * Options for QR code generation.
 */
type QRCodeOptions = {
	/** Width of the QR code in pixels. Default: 256 */
	width?: number;
	/** Margin around the QR code in modules. Default: 2 */
	margin?: number;
	/** Error correction level. Default: "M" */
	errorCorrectionLevel?: "L" | "M" | "Q" | "H";
	/** Dark color (foreground). Default: "#000000" */
	darkColor?: string;
	/** Light color (background). Default: "#ffffff" */
	lightColor?: string;
};

const defaultOptions: QRCodeOptions = {
	width: 256,
	margin: 2,
	errorCorrectionLevel: "M",
	darkColor: "#000000",
	lightColor: "#ffffff",
};

/**
 * Generates a QR code as a data URL (base64 PNG image).
 * Suitable for embedding in HTML img tags.
 * @param data - The data to encode in the QR code.
 * @param options - Optional configuration for the QR code.
 * @returns Promise resolving to the data URL string.
 */
export async function generateQRCodeDataURL(data: string, options: QRCodeOptions = {}): Promise<string> {
	const opts = { ...defaultOptions, ...options };

	return QRCode.toDataURL(data, {
		width: opts.width,
		margin: opts.margin,
		errorCorrectionLevel: opts.errorCorrectionLevel,
		color: {
			dark: opts.darkColor,
			light: opts.lightColor,
		},
	});
}

/**
 * Estimates the maximum data size that can be encoded in a QR code.
 * vCard data should stay under this limit for reliable scanning.
 * @internal Used internally by canFitInQRCode.
 * @param errorCorrectionLevel - The error correction level.
 * @returns Maximum bytes that can be encoded.
 */
function getQRCodeMaxBytes(errorCorrectionLevel: "L" | "M" | "Q" | "H" = "M"): number {
	// These are approximate maximums for Version 40 QR codes (largest standard size)
	const maxBytes = {
		L: 2953,
		M: 2331,
		Q: 1663,
		H: 1273,
	};
	return maxBytes[errorCorrectionLevel];
}

/**
 * Checks if data can fit in a QR code with the given error correction level.
 * @param data - The data to check.
 * @param errorCorrectionLevel - The error correction level.
 * @returns True if the data can fit, false otherwise.
 */
export function canFitInQRCode(data: string, errorCorrectionLevel: "L" | "M" | "Q" | "H" = "M"): boolean {
	const bytes = new TextEncoder().encode(data).length;
	return bytes <= getQRCodeMaxBytes(errorCorrectionLevel);
}
