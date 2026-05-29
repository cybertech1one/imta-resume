/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

type PrecacheEntry = string | { url: string; revision?: string | null };

// biome-ignore lint/suspicious/noExplicitAny: workbox manifest injection point
const manifest: PrecacheEntry[] = (self as any).__WB_MANIFEST || [];

// Dedupe precache entries by URL. The build can emit the same asset (e.g.
// manifest.webmanifest) more than once with different revisions, which makes
// workbox throw `add-to-cache-list-conflicting-entries`. Keep the first entry
// per URL so precaching stays conflict-free.
const seen = new Set<string>();
const dedupedManifest = manifest.filter((entry) => {
	const url = typeof entry === "string" ? entry : entry.url;
	if (seen.has(url)) return false;
	seen.add(url);
	return true;
});

precacheAndRoute(dedupedManifest);

self.skipWaiting();
