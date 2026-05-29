import { fileURLToPath } from "node:url";
import { lingui } from "@lingui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { visualizer } from "rollup-plugin-visualizer";
import type { HtmlTagDescriptor, Plugin } from "vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Polyfill for Reflect.getMetadata() (required by @better-auth/passkey)
const REFLECT_POLYFILL = `if("function"!=typeof Reflect.getMetadata){const e=new WeakMap,t=(t,a)=>e.get(t)?.get(a),a=(t,a)=>{let n=e.get(t);n||(n=new Map,e.set(t,n));let f=n.get(a);return f||(f=new Map,n.set(a,f)),f},n=(e,a,f)=>{const c=t(a,f);if(c?.has(e))return c.get(e);const s=Object.getPrototypeOf(a);return s?n(e,s,f):void 0};Reflect.getMetadata=(e,t,a)=>n(e,t,a),Reflect.getOwnMetadata=(e,a,n)=>t(a,n)?.get(e),Reflect.defineMetadata=(e,t,n,f)=>a(n,f).set(e,t),Reflect.hasMetadata=(e,t,a)=>void 0!==n(e,t,a),Reflect.hasOwnMetadata=(e,a,n)=>t(a,n)?.has(e)??!1,Reflect.metadata=(e,t)=>(n,f)=>a(n,f).set(e,t)};`;

function reflectPolyfillPlugin(): Plugin {
	return {
		name: "reflect-polyfill",
		renderChunk(code, chunk) {
			if (chunk.fileName.includes("passkey")) return `${REFLECT_POLYFILL}\n${code}`;
			return null;
		},
	};
}

/**
 * Plugin to add preload hints for critical resources.
 * Improves LCP by preloading fonts and critical CSS.
 */
function preloadHintsPlugin(): Plugin {
	return {
		name: "preload-hints",
		transformIndexHtml(html) {
			const preloadTags: HtmlTagDescriptor[] = [
				// Preload critical fonts
				{
					tag: "link",
					attrs: {
						rel: "preconnect",
						href: "https://fonts.gstatic.com",
						crossorigin: "",
					},
					injectTo: "head",
				},
				// DNS prefetch for external resources
				{
					tag: "link",
					attrs: {
						rel: "dns-prefetch",
						href: "//fonts.googleapis.com",
					},
					injectTo: "head",
				},
				// Preload the main font (IBM Plex Sans)
				{
					tag: "link",
					attrs: {
						rel: "preload",
						href: "/fonts/ibm-plex-sans.woff2",
						as: "font",
						type: "font/woff2",
						crossorigin: "",
					},
					injectTo: "head",
				},
			];

			return {
				html,
				tags: preloadTags,
			};
		},
	};
}

/**
 * Plugin to optimize CSS delivery.
 * Inlines critical CSS and defers non-critical styles.
 */
function optimizeCSSPlugin(): Plugin {
	return {
		name: "optimize-css",
		enforce: "post",
		transformIndexHtml(html) {
			// Add resource hints for better loading priority
			const optimizationTags: HtmlTagDescriptor[] = [
				// Fetch priority hints
				{
					tag: "meta",
					attrs: {
						name: "priority",
						content: "high",
					},
					injectTo: "head",
				},
			];

			return {
				html,
				tags: optimizationTags,
			};
		},
	};
}

/**
 * Plugin to suppress the recurring "Response body object should not be disturbed
 * or locked" error in dev mode. This is a known issue with Nitro's dev proxy
 * (fetchAddress) where a Request/Response body stream gets consumed before the
 * proxy can forward it. It is harmless in dev — the page still loads correctly
 * after dismissing the overlay — but the overlay blocks development flow.
 *
 * Adds error-handling middleware in BOTH the configureServer hook (to catch
 * errors from Nitro's nitroDevMiddlewarePre, registered during configureServer)
 * and the post-hook (to catch errors from Nitro's nitroDevMiddleware, registered
 * in Nitro's own post-hook). This ensures the error is caught regardless of
 * which Nitro middleware throws it.
 */
function suppressNitroDevBodyError(): Plugin {
	const SUPPRESSED_MSG = "Response body object should not be disturbed or locked";

	// biome-ignore lint/suspicious/noExplicitAny: Connect error handler signature requires any
	const createErrorHandler = () => (err: any, _req: any, res: any, next: (err?: unknown) => void) => {
		const msg = err?.message || "";
		const causeMsg = err?.cause?.message || "";
		if (msg.includes(SUPPRESSED_MSG) || causeMsg.includes(SUPPRESSED_MSG)) {
			// Silently swallow — send a minimal response so the browser doesn't stall
			if (!res.headersSent) {
				res.statusCode = 200;
				res.end();
			}
			return;
		}
		return next(err);
	};

	return {
		name: "suppress-nitro-dev-body-error",
		apply: "serve", // dev only — never runs in production builds
		configureServer(server) {
			// Catches errors from Nitro's nitroDevMiddlewarePre (added in Nitro's configureServer)
			server.middlewares.use(createErrorHandler());

			// Post-hook: catches errors from Nitro's nitroDevMiddleware (added in Nitro's post-hook)
			return () => {
				server.middlewares.use(createErrorHandler());
			};
		},
	};
}

const config = defineConfig({
	define: {
		__APP_VERSION__: JSON.stringify(process.env.npm_package_version),
		"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
		"process.env.APP_URL": JSON.stringify(process.env.APP_URL),
		"process.env.TSS_SERVER_FN_BASE": JSON.stringify(""),
		"process.env.TSS_ROUTER_BASEPATH": JSON.stringify(""),
		"process.env.TSS_SHELL": JSON.stringify("false"),
		"process.env.TSS_DEV_SERVER": JSON.stringify("true"),
	},

	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},

	optimizeDeps: {
		// Pre-bundle these dependencies for faster dev startup
		// Note: @tanstack/start-client-core must be included so Vite's `define` replaces
		// process.env.TSS_* references (excluded deps are served as raw ESM without
		// transform, causing "ReferenceError: process is not defined")
		include: [
			"react",
			"react-dom",
			"@tanstack/react-query",
			"@tanstack/react-router",
			"@tanstack/start-client-core",
			"zustand",
			"zod",
			"immer",
			"clsx",
			"tailwind-merge",
			"motion",
			"react-hook-form",
			"date-fns",
		],
		exclude: [
			"@tanstack/react-start",
			"@tanstack/react-start/client",
			"@tanstack/react-start/server",
			"@tanstack/start-server-core",
		],
	},

	build: {
		chunkSizeWarningLimit: 500, // 500kb warning limit - catch bloat early
		minify: "terser",
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
				pure_funcs: ["console.log", "console.debug", "console.info"],
				passes: 2,
			},
			mangle: {
				safari10: true,
			},
			format: {
				comments: false,
			},
		},
		// Optimize source maps for production
		sourcemap: false,
		// CSS code splitting for better caching
		cssCodeSplit: true,
		// Asset inlining threshold
		assetsInlineLimit: 4096,

		// Manual chunk splitting for better caching and smaller initial bundle
		// Note: manualChunks as function for Rolldown compatibility
		rollupOptions: {
			output: {
				manualChunks(id: string) {
					// Core React dependencies
					if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) {
						return "vendor-react";
					}
					// TanStack ecosystem
					if (id.includes("@tanstack/react-query") || id.includes("@tanstack/react-router")) {
						return "vendor-tanstack";
					}
					// UI component libraries
					if (id.includes("@radix-ui") || id.includes("class-variance-authority") || id.includes("cmdk")) {
						return "vendor-ui";
					}
					// Form handling
					if (id.includes("react-hook-form") || id.includes("@hookform/resolvers")) {
						return "vendor-forms";
					}
					// Icons
					if (id.includes("@phosphor-icons")) {
						return "vendor-icons";
					}
					// Monaco editor
					if (id.includes("monaco-editor")) {
						return "editor";
					}
					// Charts
					if (id.includes("recharts")) {
						return "charts";
					}
					// State management
					if (id.includes("zustand") || id.includes("immer") || id.includes("zundo")) {
						return "vendor-state";
					}
					// Drag and drop
					if (id.includes("@dnd-kit")) {
						return "vendor-dnd";
					}
					// Rich text editor
					if (id.includes("@tiptap") || id.includes("prosemirror") || id.includes("@tiptap/pm")) {
						return "vendor-tiptap";
					}
					// Internationalization
					if (id.includes("@lingui")) {
						return "vendor-i18n";
					}
					// AI SDK providers
					if (id.includes("@ai-sdk") || (id.includes("node_modules/ai") && !id.includes("ai-"))) {
						return "vendor-ai";
					}
					// Animation
					if (id.includes("node_modules/motion")) {
						return "vendor-animation";
					}
					// Utilities
					if (
						id.includes("date-fns") ||
						id.includes("es-toolkit") ||
						id.includes("dompurify") ||
						id.includes("fuse.js")
					) {
						return "vendor-utils";
					}
					// PDF/Print related
					if (id.includes("puppeteer") || id.includes("sharp") || id.includes("qrcode")) {
						return "vendor-print";
					}
					// Auth related
					if (id.includes("better-auth") || id.includes("bcrypt")) {
						return "vendor-auth";
					}
					// Validation
					if (id.includes("zod") && !id.includes("@tanstack/zod-adapter")) {
						return "vendor-validation";
					}
					// Email
					if (id.includes("nodemailer")) {
						return "vendor-email";
					}
					return undefined;
				},
			},
		},

		// Mute MODULE_LEVEL_DIRECTIVE warnings
		rolldownOptions: {
			onLog(level, log, defaultHandler) {
				if (level === "warn" && log.code === "MODULE_LEVEL_DIRECTIVE") return;
				defaultHandler(level, log);
			},
		},
	},

	server: {
		host: true,
		port: Number(process.env.PORT) || 3040,
		strictPort: false,
		allowedHosts: true,
		hmr: {
			host: "localhost",
		},
	},

	plugins: [
		// Performance optimization plugins
		preloadHintsPlugin(),
		optimizeCSSPlugin(),
		reflectPolyfillPlugin(),
		lingui(),
		tailwindcss(),
		nitro({
			plugins: ["plugins/1.migrate.ts", "plugins/2.security-headers.ts"],
			// Pre-compress public/static assets at build time so the server can serve
			// gzip/brotli variants (.gz/.br) without compressing on every request.
			// Cuts first-load transfer size substantially (responses were ~2.4MB uncompressed).
			compressPublicAssets: { gzip: true, brotli: true },
			// Long-lived Cache-Control for static assets served from /public and the
			// hashed client build output. Hashed bundles are immutable (filename changes
			// on content change); media dirs use a shorter max-age so updates propagate.
			routeRules: {
				// Content-hashed client bundles (JS/CSS) — safe to cache forever + immutable.
				"/_build/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
				"/assets/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
				// Public media/static dirs (not content-hashed) — cache for a week.
				"/templates/**": { headers: { "cache-control": "public, max-age=604800" } },
				"/home/**": { headers: { "cache-control": "public, max-age=604800" } },
				"/photos/**": { headers: { "cache-control": "public, max-age=604800" } },
				"/icon/**": { headers: { "cache-control": "public, max-age=604800" } },
				"/logo/**": { headers: { "cache-control": "public, max-age=604800" } },
				"/opengraph/**": { headers: { "cache-control": "public, max-age=604800" } },
				"/sounds/**": { headers: { "cache-control": "public, max-age=604800" } },
				"/videos/**": { headers: { "cache-control": "public, max-age=604800" } },
				"/screenshots/**": { headers: { "cache-control": "public, max-age=604800" } },
				// Favicons / fonts — cache for a day.
				"/favicon.ico": { headers: { "cache-control": "public, max-age=86400" } },
				"/favicon.svg": { headers: { "cache-control": "public, max-age=86400" } },
				"/apple-touch-icon-180x180.png": { headers: { "cache-control": "public, max-age=86400" } },
				"/fonts/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
			},
		}),
		// Must come AFTER nitro() so the error handler is registered after Nitro's middleware
		suppressNitroDevBodyError(),
		tanstackStart({ router: { semicolons: true, quoteStyle: "double" } }),
		viteReact({
			babel: {
				plugins: [
					// stripMessageField: false keeps the source `message` field in the
					// PRODUCTION bundle. By default Lingui v5 strips it in production, so a
					// message whose generated id is missing from the compiled catalog (e.g.
					// an untranslated string, or one whose source text changed without
					// re-running `lingui extract`) renders its hash id instead of text.
					// Keeping the source message lets <Trans>/t fall back to the source
					// text (French, since this app is French-first) in prod too, matching
					// dev behavior. Fixes hash-id leakage globally.
					["@lingui/babel-plugin-lingui-macro", { stripMessageField: false }],
				],
			},
		}),
		// Bundle analyzer - generates bundle-stats.html on build
		visualizer({
			open: false,
			filename: "bundle-stats.html",
			gzipSize: true,
			brotliSize: true,
		}),
		VitePWA({
			outDir: "public",
			useCredentials: true,
			injectRegister: false,
			includeAssets: ["**/*"],
			registerType: "autoUpdate",
			workbox: {
				skipWaiting: true,
				clientsClaim: true,
				globPatterns: ["**/*.{js,css,html,woff2,woff,ico,svg}"],
				globIgnores: ["**/templates/**/*.{jpg,png,pdf}", "**/uploads/**"],
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
				navigateFallback: null,
			},
			manifest: {
				name: "Reactive Resume",
				short_name: "Reactive Resume",
				description: "A free and open-source resume builder.",
				id: "/?source=pwa",
				start_url: "/?source=pwa",
				display: "standalone",
				orientation: "portrait",
				theme_color: "#09090B",
				background_color: "#09090B",
				icons: [
					{
						src: "favicon.ico",
						sizes: "128x128",
						type: "image/x-icon",
					},
					{
						src: "pwa-64x64.png",
						sizes: "64x64",
						type: "image/png",
					},
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "maskable-icon-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
				screenshots: [
					{
						src: "screenshots/web/1-landing-page.webp",
						sizes: "1920x1080 any",
						type: "image/webp",
						form_factor: "wide",
						label: "Landing Page",
					},
					{
						src: "screenshots/web/2-resume-dashboard.webp",
						sizes: "1920x1080 any",
						type: "image/webp",
						form_factor: "wide",
						label: "Resume Dashboard",
					},
					{
						src: "screenshots/web/3-builder-screen.webp",
						sizes: "1920x1080 any",
						type: "image/webp",
						form_factor: "wide",
						label: "Builder Screen",
					},
					{
						src: "screenshots/web/4-template-gallery.webp",
						sizes: "1920x1080 any",
						type: "image/webp",
						form_factor: "wide",
						label: "Template Gallery",
					},
					{
						src: "screenshots/mobile/1-landing-page.webp",
						sizes: "1284x2778 any",
						type: "image/webp",
						form_factor: "narrow",
						label: "Landing Page",
					},
					{
						src: "screenshots/mobile/2-resume-dashboard.webp",
						sizes: "1284x2778 any",
						type: "image/webp",
						form_factor: "narrow",
						label: "Resume Dashboard",
					},
					{
						src: "screenshots/mobile/3-builder-screen.webp",
						sizes: "1284x2778 any",
						type: "image/webp",
						form_factor: "narrow",
						label: "Builder Screen",
					},
					{
						src: "screenshots/mobile/4-template-gallery.webp",
						sizes: "1284x2778 any",
						type: "image/webp",
						form_factor: "narrow",
						label: "Template Gallery",
					},
				],
				categories: [
					"ai",
					"builder",
					"business",
					"career",
					"cv",
					"editor",
					"free",
					"generator",
					"job-search",
					"multilingual",
					"open-source",
					"privacy",
					"productivity",
					"resume",
					"self-hosted",
					"templates",
					"utilities",
					"writing",
				],
			},
		}),
	],
});

export default config;
