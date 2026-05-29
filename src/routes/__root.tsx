import "@fontsource-variable/ibm-plex-sans";
import "@phosphor-icons/web/regular/style.css";

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { IconContext } from "@phosphor-icons/react";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { CommandPalette } from "@/components/command-palette";
import { BreakpointIndicator } from "@/components/layout/breakpoint-indicator";
import { RouterProgress } from "@/components/layout/router-progress";
import { ThemeProvider } from "@/components/theme/provider";
import { SkipToContent } from "@/components/ui/a11y";
import { Toaster } from "@/components/ui/sonner";
import { DialogManager } from "@/dialogs/manager";
import { ConfirmDialogProvider } from "@/hooks/use-confirm";
import { PromptDialogProvider } from "@/hooks/use-prompt";
import { getSession } from "@/integrations/auth/functions";
import type { AuthSession } from "@/integrations/auth/types";
import { client, type orpc } from "@/integrations/orpc/client";
import type { FeatureFlags } from "@/integrations/orpc/services/flags";
import { getLocale, isRTL, type Locale, loadLocale } from "@/utils/locale";
import {
	defaultSEO,
	generateOrganizationSchema,
	generateSoftwareApplicationSchema,
	generateWebsiteSchema,
} from "@/utils/seo";
import { getTheme, type Theme } from "@/utils/theme";
import appCss from "../styles/globals.css?url";

type RouterContext = {
	theme: Theme;
	locale: Locale;
	orpc: typeof orpc;
	queryClient: QueryClient;
	session: AuthSession | null;
	flags: FeatureFlags;
};

// Use SEO defaults from utility
const { appName, title, description } = defaultSEO;

await loadLocale(await getLocale());

export const Route = createRootRouteWithContext<RouterContext>()({
	shellComponent: RootDocument,
	head: () => {
		const appUrl = (typeof process !== "undefined" ? process.env.APP_URL : undefined) ?? "https://rxresu.me/";

		return {
			links: [
				// Google Fonts - Playfair Display & Source Serif 4
				{ rel: "preconnect", href: "https://fonts.googleapis.com" },
				{ rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
				{
					rel: "stylesheet",
					href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap",
				},
				{ rel: "stylesheet", href: appCss },
				// Icons
				{ rel: "icon", href: "/favicon.ico", type: "image/x-icon", sizes: "128x128" },
				{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml", sizes: "256x256 any" },
				{ rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png", type: "image/png", sizes: "180x180 any" },
				// Manifest
				{ rel: "manifest", href: "/manifest.webmanifest", crossOrigin: "use-credentials" },
			],
			meta: [
				{ title },
				{ charSet: "UTF-8" },
				{ name: "description", content: description },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				// Additional SEO meta tags
				{ name: "author", content: appName },
				{ name: "application-name", content: appName },
				{ name: "theme-color", content: "#1e40af" },
				// Twitter Tags
				{ property: "twitter:image", content: `${appUrl}opengraph/banner.jpg` },
				{ property: "twitter:card", content: "summary_large_image" },
				{ property: "twitter:title", content: title },
				{ property: "twitter:description", content: description },
				{ property: "twitter:site", content: "@imta_resume" },
				{ property: "twitter:creator", content: "@imta_resume" },
				// OpenGraph Tags
				{ property: "og:image", content: `${appUrl}opengraph/banner.jpg` },
				{ property: "og:image:width", content: "1200" },
				{ property: "og:image:height", content: "630" },
				{ property: "og:image:alt", content: `${appName} - ${description}` },
				{ property: "og:site_name", content: appName },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:url", content: appUrl },
				{ property: "og:type", content: "website" },
				{ property: "og:locale", content: (i18n.locale ?? "fr-FR").replace("-", "_") },
			],
			// Register service worker and JSON-LD structured data
			scripts: [
				// Service worker registration
				{
					children: `
						if('serviceWorker' in navigator) {
							window.addEventListener('load', () => {
								navigator.serviceWorker.register('/sw.js', { scope: '/' })
							})
						}
					`,
				},
				// JSON-LD Organization schema
				{
					type: "application/ld+json",
					children: JSON.stringify(
						generateOrganizationSchema({
							name: appName,
							url: appUrl,
							logo: `${appUrl}/logo.svg`,
							description,
						}),
					),
				},
				// JSON-LD Website schema
				{
					type: "application/ld+json",
					children: JSON.stringify(
						generateWebsiteSchema({
							name: appName,
							url: appUrl,
							description,
						}),
					),
				},
				// JSON-LD SoftwareApplication schema
				{
					type: "application/ld+json",
					children: JSON.stringify(
						generateSoftwareApplicationSchema({
							name: appName,
							url: appUrl,
							description,
							applicationCategory: "BusinessApplication",
							offers: { price: "0", priceCurrency: "USD" },
						}),
					),
				},
			],
		};
	},
	beforeLoad: async () => {
		const [theme, locale, session, flags] = await Promise.all([
			getTheme(),
			getLocale(),
			getSession(),
			client.flags.get(),
		]);

		return { theme, locale, session, flags };
	},
});

type Props = {
	children: React.ReactNode;
};

function RootDocument({ children }: Props) {
	const { theme, locale } = Route.useRouteContext();
	const dir = isRTL(locale) ? "rtl" : "ltr";

	return (
		<html suppressHydrationWarning dir={dir} lang={locale} className={theme}>
			<head>
				<HeadContent />
			</head>

			<body>
				<SkipToContent />
				<RouterProgress />
				<MotionConfig reducedMotion="user">
					<I18nProvider i18n={i18n}>
						<IconContext.Provider value={{ size: 16, weight: "regular" }}>
							<ThemeProvider theme={theme}>
								<ConfirmDialogProvider>
									<PromptDialogProvider>
										<main id="main-content">{children}</main>

										<DialogManager />
										<CommandPalette />
										<Toaster richColors position="bottom-right" />

										{import.meta.env.DEV && <BreakpointIndicator />}
									</PromptDialogProvider>
								</ConfirmDialogProvider>
							</ThemeProvider>
						</IconContext.Provider>
					</I18nProvider>
				</MotionConfig>

				<Scripts />
			</body>
		</html>
	);
}
