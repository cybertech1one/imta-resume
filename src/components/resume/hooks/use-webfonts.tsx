import { useEffect } from "react";
import { useIsMounted } from "usehooks-ts";
import type z from "zod";
import webfontlist from "@/components/typography/webfontlist.json";
import type { typographySchema } from "@/schema/resume/data";

export function useWebfonts(typography: z.infer<typeof typographySchema>) {
	const isMounted = useIsMounted();

	useEffect(() => {
		if (!isMounted()) return;

		const body = document.body;
		if (body) body.setAttribute("data-wf-loaded", "false");

		async function loadFont(family: string, weights: string[]) {
			const font = webfontlist.find((font) => font.family === family);
			if (!font) return;

			type FontUrl = { url: string; weight: string; style: "italic" | "normal" };

			const fontUrls: FontUrl[] = [];

			for (const weight of weights) {
				for (const [fileWeight, url] of Object.entries(font.files)) {
					if (weight === fileWeight) {
						fontUrls.push({ url, weight, style: "normal" });
					}
					if (fileWeight === `${weight}italic`) {
						fontUrls.push({ url, weight, style: "italic" });
					}
				}
			}

			for (const { url, weight, style } of fontUrls) {
				const fontFace = new FontFace(family, `url("${url}")`, { style, weight, display: "swap" });
				// A single font that fails to load (CDN unreachable from the print container,
				// CSP block, 404…) must NOT abort the whole batch — otherwise the printer's
				// `data-wf-loaded` flag never flips and PDF/print export hangs and times out.
				try {
					if (!document.fonts.has(fontFace)) document.fonts.add(await fontFace.load());
				} catch {
					// Fall back to a system font for this face; rendering still proceeds.
				}
			}
		}

		const bodyTypography = typography.body;
		const headingTypography = typography.heading;

		// allSettled + always flip the flag: even if every font fails, the resume still
		// renders (with fallback fonts) and the printer can capture it instead of hanging.
		Promise.allSettled([
			loadFont(bodyTypography.fontFamily, bodyTypography.fontWeights),
			loadFont(headingTypography.fontFamily, headingTypography.fontWeights),
		]).then(() => {
			if (isMounted() && body) body.setAttribute("data-wf-loaded", "true");
		});

		return () => {
			if (isMounted()) {
				if (body) body.removeAttribute("data-wf-loaded");
			}
		};
	}, [isMounted, typography]);
}
