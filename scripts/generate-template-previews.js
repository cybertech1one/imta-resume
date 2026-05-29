/**
 * generate-template-previews.js
 *
 * Generates preview JPG images for resume templates that do not yet have one.
 * Each image is a 595x842 (A4) SVG rendered to JPG via sharp.
 *
 * Usage:  node scripts/generate-template-previews.js
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, "..", "public", "templates", "jpg");

// Template definitions: name, layout, primary color, sidebar position
const TEMPLATES = [
	{ name: "casablanca", layout: "two-column", color: "#1e40af", sidebar: "left" },
	{ name: "rabat", layout: "two-column", color: "#1f2937", sidebar: "right" },
	{ name: "marrakech", layout: "two-column", color: "#dc2626", sidebar: "left" },
	{ name: "tangier", layout: "single-column", color: "#0d9488", sidebar: "none" },
	{ name: "meknes", layout: "two-column", color: "#92400e", sidebar: "right" },
	{ name: "oujda", layout: "two-column", color: "#1e293b", sidebar: "left" },
	{ name: "kenitra", layout: "two-column", color: "#4338ca", sidebar: "left" },
	{ name: "safi", layout: "single-column", color: "#0369a1", sidebar: "none" },
	{ name: "ifrane", layout: "two-column", color: "#166534", sidebar: "right" },
	{ name: "mohammedia", layout: "two-column", color: "#1e1b4b", sidebar: "left" },
	{ name: "chefchaouen", layout: "two-column", color: "#2563eb", sidebar: "right" },
	{ name: "essaouira", layout: "single-column", color: "#78716c", sidebar: "none" },
	{ name: "tetouan", layout: "two-column", color: "#a16207", sidebar: "left" },
	{ name: "agadir", layout: "two-column", color: "#ea580c", sidebar: "right" },
	{ name: "dakhla", layout: "two-column", color: "#18181b", sidebar: "left" },
	{ name: "settat", layout: "single-column", color: "#6b7280", sidebar: "none" },
	{ name: "jadida", layout: "two-column", color: "#059669", sidebar: "right" },
	{ name: "nador", layout: "two-column", color: "#7c3aed", sidebar: "left" },
	{ name: "beni-mellal", layout: "two-column", color: "#65a30d", sidebar: "right" },
	{ name: "taza", layout: "single-column", color: "#374151", sidebar: "none" },
];

const WIDTH = 595;
const HEIGHT = 842;

/**
 * Convert a hex color to an rgba string with the given alpha.
 */
function hexToRgba(hex, alpha) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Lighten a hex color by mixing it with white.
 * amount: 0 = original, 1 = white
 */
function lighten(hex, amount) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const lr = Math.round(r + (255 - r) * amount);
	const lg = Math.round(g + (255 - g) * amount);
	const lb = Math.round(b + (255 - b) * amount);
	return `rgb(${lr},${lg},${lb})`;
}

/**
 * Generate placeholder content lines (gray rectangles simulating text).
 * Returns an array of SVG rect strings.
 */
function contentLines(x, y, maxWidth, count, lineHeight = 14, gap = 6) {
	const rects = [];
	// Seeded pseudo-random widths for variety
	const widths = [1.0, 0.85, 0.92, 0.7, 0.95, 0.6, 0.88, 0.75, 0.93, 0.65];
	for (let i = 0; i < count; i++) {
		const w = maxWidth * widths[i % widths.length];
		rects.push(
			`<rect x="${x}" y="${y + i * (lineHeight + gap)}" width="${w}" height="${lineHeight}" rx="3" fill="#d1d5db" />`
		);
	}
	return rects;
}

/**
 * Generate a section block: a colored heading bar + content lines.
 */
function sectionBlock(x, y, width, color, contentCount = 4) {
	const elements = [];
	// Section heading bar
	elements.push(
		`<rect x="${x}" y="${y}" width="${width * 0.5}" height="${12}" rx="2" fill="${color}" opacity="0.8" />`
	);
	// Thin divider line
	elements.push(
		`<rect x="${x}" y="${y + 18}" width="${width}" height="${1.5}" fill="${hexToRgba(color, 0.2)}" />`
	);
	// Content lines
	elements.push(...contentLines(x, y + 28, width, contentCount, 10, 5));
	return elements;
}

/**
 * Generate sidebar section block (smaller, for sidebar panels).
 */
function sidebarSection(x, y, width, color, contentCount = 3) {
	const elements = [];
	// Section heading - light text placeholder
	elements.push(
		`<rect x="${x}" y="${y}" width="${width * 0.6}" height="${10}" rx="2" fill="rgba(255,255,255,0.8)" />`
	);
	// Divider
	elements.push(
		`<rect x="${x}" y="${y + 15}" width="${width}" height="${1}" fill="rgba(255,255,255,0.2)" />`
	);
	// Content lines (lighter for dark sidebar)
	for (let i = 0; i < contentCount; i++) {
		const widths = [0.9, 0.7, 0.8, 0.6, 0.85];
		const w = width * widths[i % widths.length];
		elements.push(
			`<rect x="${x}" y="${y + 22 + i * 13}" width="${w}" height="${8}" rx="2" fill="rgba(255,255,255,0.45)" />`
		);
	}
	return elements;
}

/**
 * Build the full SVG string for a template.
 */
function buildSvg(template) {
	const { name, layout, color, sidebar } = template;
	const elements = [];

	// Background
	elements.push(`<rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff" />`);

	if (layout === "two-column") {
		const sidebarWidth = Math.round(WIDTH * 0.35);
		const mainWidth = WIDTH - sidebarWidth;
		const sidebarX = sidebar === "left" ? 0 : mainWidth;
		const mainX = sidebar === "left" ? sidebarWidth : 0;
		const padding = 24;

		// Sidebar background
		elements.push(
			`<rect x="${sidebarX}" y="0" width="${sidebarWidth}" height="${HEIGHT}" fill="${color}" />`
		);

		// -- Sidebar content --
		const sx = sidebarX + padding;
		const sw = sidebarWidth - padding * 2;

		// Profile photo placeholder (circle)
		const circleX = sidebarX + sidebarWidth / 2;
		elements.push(
			`<circle cx="${circleX}" cy="70" r="36" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2" />`
		);
		// Initials placeholder inside circle
		elements.push(
			`<rect x="${circleX - 16}" y="62" width="32" height="10" rx="2" fill="rgba(255,255,255,0.5)" />`
		);

		// Name placeholder on sidebar
		elements.push(
			`<rect x="${sx}" y="120" width="${sw * 0.85}" height="${14}" rx="3" fill="rgba(255,255,255,0.9)" />`
		);
		// Title placeholder
		elements.push(
			`<rect x="${sx}" y="140" width="${sw * 0.6}" height="${10}" rx="2" fill="rgba(255,255,255,0.5)" />`
		);

		// Sidebar sections
		let sideY = 175;
		const sidebarSections = [
			{ label: "Contact", lines: 4 },
			{ label: "Skills", lines: 5 },
			{ label: "Languages", lines: 3 },
			{ label: "Education", lines: 4 },
		];
		for (const sec of sidebarSections) {
			elements.push(...sidebarSection(sx, sideY, sw, color, sec.lines));
			sideY += 22 + sec.lines * 13 + 20;
		}

		// -- Main content --
		const mx = mainX + padding;
		const mw = mainWidth - padding * 2;

		// Header area on main side
		elements.push(
			`<rect x="${mx}" y="30" width="${mw * 0.7}" height="${20}" rx="3" fill="${color}" opacity="0.9" />`
		);
		// Subtitle
		elements.push(
			`<rect x="${mx}" y="58" width="${mw * 0.45}" height="${12}" rx="2" fill="${hexToRgba(color, 0.4)}" />`
		);

		// Main sections
		let mainY = 95;
		const mainSections = [
			{ label: "Summary", lines: 4 },
			{ label: "Experience", lines: 6 },
			{ label: "Projects", lines: 5 },
			{ label: "Certifications", lines: 3 },
		];
		for (const sec of mainSections) {
			elements.push(...sectionBlock(mx, mainY, mw, color, sec.lines));
			const blockHeight = 28 + sec.lines * 15;
			mainY += blockHeight + 24;
		}
	} else {
		// Single-column layout
		const padding = 40;
		const contentWidth = WIDTH - padding * 2;

		// Full-width header band
		elements.push(
			`<rect x="0" y="0" width="${WIDTH}" height="${100}" fill="${color}" />`
		);
		// Name placeholder
		elements.push(
			`<rect x="${padding}" y="28" width="${contentWidth * 0.5}" height="${22}" rx="4" fill="rgba(255,255,255,0.9)" />`
		);
		// Title placeholder
		elements.push(
			`<rect x="${padding}" y="58" width="${contentWidth * 0.35}" height="${14}" rx="3" fill="rgba(255,255,255,0.5)" />`
		);
		// Contact row
		const contactY = 78;
		const contactItemWidth = contentWidth / 4;
		for (let i = 0; i < 4; i++) {
			elements.push(
				`<rect x="${padding + i * contactItemWidth + 4}" y="${contactY}" width="${contactItemWidth - 12}" height="${10}" rx="2" fill="rgba(255,255,255,0.4)" />`
			);
		}

		// Content sections
		let sectionY = 125;
		const sections = [
			{ label: "Summary", lines: 3 },
			{ label: "Experience", lines: 6 },
			{ label: "Education", lines: 4 },
			{ label: "Skills", lines: 3 },
			{ label: "Projects", lines: 5 },
		];
		for (const sec of sections) {
			elements.push(...sectionBlock(padding, sectionY, contentWidth, color, sec.lines));
			const blockHeight = 28 + sec.lines * 15;
			sectionY += blockHeight + 22;
		}
	}

	// Template name at bottom center (subtle text)
	elements.push(
		`<text x="${WIDTH / 2}" y="${HEIGHT - 16}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#c0c0c0" letter-spacing="2">${name.toUpperCase()}</text>`
	);

	// Thin bottom accent line
	elements.push(
		`<rect x="${WIDTH * 0.3}" y="${HEIGHT - 6}" width="${WIDTH * 0.4}" height="${2}" rx="1" fill="${hexToRgba(color, 0.3)}" />`
	);

	return [
		`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">`,
		...elements,
		`</svg>`,
	].join("\n");
}

async function main() {
	// Ensure output directory exists
	await mkdir(OUTPUT_DIR, { recursive: true });

	console.log(`Generating ${TEMPLATES.length} template preview images...`);
	console.log(`Output directory: ${OUTPUT_DIR}\n`);

	let success = 0;
	let failed = 0;

	for (const template of TEMPLATES) {
		const outputPath = join(OUTPUT_DIR, `${template.name}.jpg`);
		try {
			const svg = buildSvg(template);
			const svgBuffer = Buffer.from(svg);
			await sharp(svgBuffer)
				.jpeg({ quality: 90 })
				.toFile(outputPath);
			console.log(`  [OK] ${template.name}.jpg`);
			success++;
		} catch (err) {
			console.error(`  [FAIL] ${template.name}.jpg - ${err.message}`);
			failed++;
		}
	}

	console.log(`\nDone. ${success} succeeded, ${failed} failed.`);
	if (failed > 0) {
		process.exit(1);
	}
}

main();
