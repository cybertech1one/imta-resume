import { writeFileSync } from "node:fs";
import { generatedTrafficLandingPages } from "../src/routes/_home/-sections/traffic-generated-pages";

const baseUrl = "https://imta.ma";
const today = new Date().toISOString().slice(0, 10);

const coreMarketingPages = [
	"/cv-etudiant",
	"/stage-maroc",
	"/preparation-entretien",
	"/metiers-techniques",
	"/ecoles-formateurs",
	"/imta-etudiants",
];

const sitemapEntries = [
	{ path: "/", changefreq: "weekly", priority: "1.0" },
	{ path: "/ressources-etudiants-maroc", changefreq: "weekly", priority: "0.95" },
	{ path: "/campagnes-etudiants", changefreq: "weekly", priority: "0.92" },
	{ path: "/plan-marketing-etudiants", changefreq: "weekly", priority: "0.9" },
	{ path: "/help", changefreq: "monthly", priority: "0.7" },
	{ path: "/wiki", changefreq: "weekly", priority: "0.8" },
	{ path: "/auth", changefreq: "monthly", priority: "0.4" },
	{ path: "/auth/login", changefreq: "monthly", priority: "0.3" },
	{ path: "/auth/register", changefreq: "monthly", priority: "0.5" },
	...coreMarketingPages.map((path) => ({ path, changefreq: "weekly", priority: "0.9" })),
	...generatedTrafficLandingPages.map((page) => ({
		path: page.path,
		changefreq: "weekly",
		priority: page.path.startsWith("/stage-") ? "0.78" : page.path.startsWith("/cv-") ? "0.77" : "0.75",
	})),
];

const seen = new Set<string>();
const urls = sitemapEntries.filter((entry) => {
	if (seen.has(entry.path)) return false;
	seen.add(entry.path);
	return true;
});

function escapeXml(value: string) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(url) => `  <url>
    <loc>${escapeXml(new URL(url.path, baseUrl).toString())}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
	)
	.join("\n")}
</urlset>
`;

writeFileSync("public/sitemap.xml", xml, "utf8");

console.log(`Wrote ${urls.length} URLs to public/sitemap.xml`);
