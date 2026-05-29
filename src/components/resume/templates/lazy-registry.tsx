import { type ComponentType, lazy } from "react";
import type { Template } from "@/schema/templates";
import type { TemplateProps } from "./types";

/**
 * Lazy-loaded template registry.
 *
 * Instead of eagerly importing all 35 resume templates (which adds ~500KB+
 * to the initial bundle), each template is loaded on demand when the user
 * selects it. Only the active template is loaded into memory.
 *
 * The dynamic import paths must be static string literals so that Vite/Rollup
 * can analyze them at build time and create separate chunks.
 */
const lazyTemplateMap: Record<Template, () => Promise<{ default: ComponentType<TemplateProps> }>> = {
	avicenne: () => import("./avicenne").then((m) => ({ default: m.AvicenneTemplate })),
	azurill: () => import("./azurill").then((m) => ({ default: m.AzurillTemplate })),
	bronzor: () => import("./bronzor").then((m) => ({ default: m.BronzorTemplate })),
	chikorita: () => import("./chikorita").then((m) => ({ default: m.ChikoritaTemplate })),
	ditto: () => import("./ditto").then((m) => ({ default: m.DittoTemplate })),
	ditgar: () => import("./ditgar").then((m) => ({ default: m.DitgarTemplate })),
	fes: () => import("./fes").then((m) => ({ default: m.FesTemplate })),
	gengar: () => import("./gengar").then((m) => ({ default: m.GengarTemplate })),
	glalie: () => import("./glalie").then((m) => ({ default: m.GlalieTemplate })),
	kakuna: () => import("./kakuna").then((m) => ({ default: m.KakunaTemplate })),
	lapras: () => import("./lapras").then((m) => ({ default: m.LaprasTemplate })),
	leafish: () => import("./leafish").then((m) => ({ default: m.LeafishTemplate })),
	onyx: () => import("./onyx").then((m) => ({ default: m.OnyxTemplate })),
	pikachu: () => import("./pikachu").then((m) => ({ default: m.PikachuTemplate })),
	rhyhorn: () => import("./rhyhorn").then((m) => ({ default: m.RhyhornTemplate })),
	casablanca: () => import("./casablanca").then((m) => ({ default: m.CasablancaTemplate })),
	rabat: () => import("./rabat").then((m) => ({ default: m.RabatTemplate })),
	marrakech: () => import("./marrakech").then((m) => ({ default: m.MarrakechTemplate })),
	tangier: () => import("./tangier").then((m) => ({ default: m.TangierTemplate })),
	meknes: () => import("./meknes").then((m) => ({ default: m.MeknesTemplate })),
	oujda: () => import("./oujda").then((m) => ({ default: m.OujdaTemplate })),
	kenitra: () => import("./kenitra").then((m) => ({ default: m.KenitraTemplate })),
	safi: () => import("./safi").then((m) => ({ default: m.SafiTemplate })),
	ifrane: () => import("./ifrane").then((m) => ({ default: m.IfraneTemplate })),
	mohammedia: () => import("./mohammedia").then((m) => ({ default: m.MohammediaTemplate })),
	chefchaouen: () => import("./chefchaouen").then((m) => ({ default: m.ChefchaouenTemplate })),
	essaouira: () => import("./essaouira").then((m) => ({ default: m.EssaouiraTemplate })),
	tetouan: () => import("./tetouan").then((m) => ({ default: m.TetouanTemplate })),
	agadir: () => import("./agadir").then((m) => ({ default: m.AgadirTemplate })),
	dakhla: () => import("./dakhla").then((m) => ({ default: m.DakhlaTemplate })),
	settat: () => import("./settat").then((m) => ({ default: m.SettatTemplate })),
	jadida: () => import("./jadida").then((m) => ({ default: m.JadidaTemplate })),
	nador: () => import("./nador").then((m) => ({ default: m.NadorTemplate })),
	"beni-mellal": () => import("./beni-mellal").then((m) => ({ default: m.BeniMellalTemplate })),
	taza: () => import("./taza").then((m) => ({ default: m.TazaTemplate })),
};

// Cache of already-created lazy components so React.lazy is only called once per template
const lazyComponentCache = new Map<Template, ComponentType<TemplateProps>>();

/**
 * Returns a lazy-loaded React component for the given template name.
 * The component is cached so subsequent calls for the same template
 * return the same lazy wrapper (important for React reconciliation).
 */
export function getLazyTemplate(template: Template): ComponentType<TemplateProps> {
	const cached = lazyComponentCache.get(template);
	if (cached) return cached;

	const loader = lazyTemplateMap[template];
	const LazyComponent = lazy(loader);
	lazyComponentCache.set(template, LazyComponent);
	return LazyComponent;
}
