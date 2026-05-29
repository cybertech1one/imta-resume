import { useEffect, useState } from "react";
import ReactQRCode from "react-qr-code";
import { canFitInQRCode, generateQRCodeDataURL } from "@/utils/qrcode";
import { cn } from "@/utils/style";

// Handle CJS/ESM interop - the library may be wrapped differently
const QRCode = (ReactQRCode as { default?: typeof ReactQRCode }).default ?? ReactQRCode;

type QRCodeDisplayProps = {
	/** The data to encode in the QR code (URL or vCard string) */
	value: string;
	/** Size of the QR code in pixels. Default: 128 */
	size?: number;
	/** Background color. Default: "#ffffff" */
	bgColor?: string;
	/** Foreground color. Default: "#000000" */
	fgColor?: string;
	/** Additional CSS classes */
	className?: string;
	/** Whether to show a border/padding around the QR code */
	showBorder?: boolean;
};

/**
 * QR Code display component using react-qr-code for inline rendering.
 * Renders as an SVG for crisp display at any size.
 */
export function QRCodeDisplay({
	value,
	size = 128,
	bgColor = "#ffffff",
	fgColor = "#000000",
	className,
	showBorder = true,
}: QRCodeDisplayProps) {
	// Check if the data can fit in a QR code
	const canFit = canFitInQRCode(value);

	if (!canFit) {
		return (
			<div
				className={cn("flex items-center justify-center text-center text-muted-foreground text-sm", className)}
				style={{ width: size, height: size }}
			>
				Data too large for QR code
			</div>
		);
	}

	return (
		<div className={cn("inline-block", showBorder && "rounded-lg bg-white p-3 shadow-sm", className)}>
			<QRCode value={value} size={size} bgColor={bgColor} fgColor={fgColor} level="M" />
		</div>
	);
}

type QRCodeImageProps = {
	/** The data to encode in the QR code */
	value: string;
	/** Size of the QR code in pixels. Default: 256 */
	size?: number;
	/** Alt text for the image */
	alt?: string;
	/** Additional CSS classes */
	className?: string;
};

/**
 * QR Code as an image element using the qrcode library.
 * Renders as a PNG data URL, useful for downloading.
 */
export function QRCodeImage({ value, size = 256, alt = "QR Code", className }: QRCodeImageProps) {
	const [dataUrl, setDataUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function generate() {
			try {
				const url = await generateQRCodeDataURL(value, { width: size });
				if (!cancelled) {
					setDataUrl(url);
					setError(null);
				}
			} catch {
				if (!cancelled) {
					setError("Failed to generate QR code");
					setDataUrl(null);
				}
			}
		}

		generate();

		return () => {
			cancelled = true;
		};
	}, [value, size]);

	if (error) {
		return (
			<div
				className={cn("flex items-center justify-center text-center text-muted-foreground text-sm", className)}
				style={{ width: size, height: size }}
			>
				{error}
			</div>
		);
	}

	if (!dataUrl) {
		return <div className={cn("animate-pulse rounded-lg bg-muted", className)} style={{ width: size, height: size }} />;
	}

	return (
		<img src={dataUrl} alt={alt} loading="lazy" width={size} height={size} className={cn("rounded-lg", className)} />
	);
}
