import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	CaretDownIcon,
	CaretUpIcon,
	IconContext,
	type IconProps,
	LightbulbIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { type RefObject, Suspense, useMemo, useRef, useState } from "react";
import { useResizeObserver } from "usehooks-ts";
import type z from "zod";
import { pageDimensionsAsPixels } from "@/schema/page";
import type { pageLayoutSchema } from "@/schema/resume/data";
import { sanitizeCss } from "@/utils/sanitize";
import { cn } from "@/utils/style";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { useCSSVariables } from "./hooks/use-css-variables";
import { useWebfonts } from "./hooks/use-webfonts";
import styles from "./preview.module.css";
import { useResumeStore } from "./store/resume";
import { getLazyTemplate } from "./templates/lazy-registry";

export type ExtendedIconProps = IconProps & {
	hidden?: boolean;
};

const CSS_RULE_SPLIT_PATTERN = /\n(?=\s*[.#a-zA-Z])/;
const CSS_SELECTOR_PATTERN = /^([^{]+)(\{)/;

type Props = React.ComponentProps<"div"> & {
	pageClassName?: string;
	showPageNumbers?: boolean;
};

export const ResumePreview = ({ showPageNumbers = false, pageClassName, className, ...props }: Props) => {
	const picture = useResumeStore((state) => state.resume.data.picture);
	const metadata = useResumeStore((state) => state.resume.data.metadata);

	useWebfonts(metadata.typography);
	const style = useCSSVariables({ picture, metadata });

	const iconProps = useMemo<ExtendedIconProps>(() => {
		return {
			weight: "regular",
			hidden: metadata.page.hideIcons,
			color: "var(--page-primary-color)",
			size: metadata.typography.body.fontSize * 1.5,
		} satisfies ExtendedIconProps;
	}, [metadata.typography.body.fontSize, metadata.page.hideIcons]);

	const scopedCSS = useMemo(() => {
		if (!metadata.css.enabled || !metadata.css.value.trim()) return null;

		const sanitizedCss = sanitizeCss(metadata.css.value);

		const scoped = sanitizedCss
			.split(CSS_RULE_SPLIT_PATTERN)
			.map((rule) => {
				const trimmed = rule.trim();
				if (!trimmed || trimmed.startsWith("@")) return trimmed;

				return trimmed.replace(CSS_SELECTOR_PATTERN, (_match, selectors, brace) => {
					const prefixed = selectors
						.split(",")
						.map((selector: string) => `.resume-preview-container ${selector.trim()} `)
						.join(", ");
					return `${prefixed}${brace}`;
				});
			})
			.join("\n");

		return scoped;
	}, [metadata.css.enabled, metadata.css.value]);

	return (
		<IconContext.Provider value={iconProps}>
			{/** biome-ignore lint/security/noDangerouslySetInnerHtml: CSS is sanitized with sanitizeCss */}
			{scopedCSS && <style dangerouslySetInnerHTML={{ __html: scopedCSS }} />}

			<div style={style} className={cn("resume-preview-container", className)} {...props}>
				{metadata.layout.pages.map((pageLayout, pageIndex) => (
					<PageContainer
						key={pageIndex}
						pageIndex={pageIndex}
						pageLayout={pageLayout}
						pageClassName={pageClassName}
						showPageNumbers={showPageNumbers}
					/>
				))}
			</div>
		</IconContext.Provider>
	);
};

type PageContainerProps = {
	pageIndex: number;
	pageLayout: z.infer<typeof pageLayoutSchema>;
	pageClassName?: string;
	showPageNumbers?: boolean;
};

function PageContainer({ pageIndex, pageLayout, pageClassName, showPageNumbers = false }: PageContainerProps) {
	const pageRef = useRef<HTMLDivElement>(null);
	const [pageHeight, setPageHeight] = useState<number>(0);
	const [showTips, setShowTips] = useState<boolean>(false);

	const metadata = useResumeStore((state) => state.resume.data.metadata);

	const pageNumber = useMemo(() => pageIndex + 1, [pageIndex]);
	const maxPageHeight = useMemo(() => pageDimensionsAsPixels[metadata.page.format].height, [metadata.page.format]);
	const totalNumberOfPages = useMemo(() => metadata.layout.pages.length, [metadata.layout.pages]);
	const TemplateComponent = useMemo(() => getLazyTemplate(metadata.template), [metadata.template]);

	const overflowAmount = useMemo(() => {
		if (pageHeight <= maxPageHeight) return 0;
		return Math.round(pageHeight - maxPageHeight);
	}, [pageHeight, maxPageHeight]);

	const overflowPercentage = useMemo(() => {
		if (overflowAmount === 0) return 0;
		return Math.round((overflowAmount / maxPageHeight) * 100);
	}, [overflowAmount, maxPageHeight]);

	useResizeObserver({
		ref: pageRef as RefObject<HTMLDivElement>,
		onResize: (size) => {
			if (!size.height) return;
			setPageHeight(size.height);
		},
	});

	const isOverflowing = metadata.page.format !== "free-form" && pageHeight > maxPageHeight;

	return (
		<div data-page-index={pageIndex} className="relative">
			{showPageNumbers && totalNumberOfPages > 1 && (
				<div className="absolute start-0 -top-6 print:hidden">
					<span className="font-medium text-foreground text-xs">
						<Trans>
							Page {pageNumber} of {totalNumberOfPages}
						</Trans>
					</span>
				</div>
			)}

			<div
				ref={pageRef}
				className={cn(
					`page page-${pageIndex}`,
					styles.page,
					pageClassName,
					isOverflowing && "ring-2 ring-yellow-500 ring-offset-2",
				)}
			>
				<Suspense
					fallback={
						<div className="flex h-full items-center justify-center p-8 text-muted-foreground">Loading template...</div>
					}
				>
					<TemplateComponent pageIndex={pageIndex} pageLayout={pageLayout} />
				</Suspense>
			</div>

			{isOverflowing && (
				<div className="absolute start-0 top-full mt-4 print:hidden">
					<div className="max-w-md space-y-3">
						{/* Main Warning Alert */}
						<Alert className="border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
							<WarningIcon color="currentColor" className="size-5" />
							<AlertTitle className="font-semibold">
								<Trans>
									The content is too tall for this page, this may cause undesirable results when exporting to PDF.
								</Trans>
							</AlertTitle>
							<AlertDescription className="mt-2 space-y-2">
								{/* Overflow indicator */}
								<div className="flex items-center gap-2 text-sm">
									<span className="font-medium">
										<Trans>Overflow:</Trans>
									</span>
									<span className="rounded bg-yellow-200 px-2 py-0.5 font-mono text-xs dark:bg-yellow-800">
										+{overflowAmount}px ({overflowPercentage}%)
									</span>
								</div>

								{/* Link to documentation */}
								<a
									rel="noopener"
									target="_blank"
									className="group/link inline-flex items-center text-sm underline-offset-2 hover:underline"
									href="https://docs.rxresu.me/guides/fitting-content-on-a-page"
								>
									<Trans>Learn more about how to fit content on a page</Trans>
									<ArrowRightIcon color="currentColor" className="ms-1 inline size-3" />
								</a>
							</AlertDescription>
						</Alert>

						{/* Expandable Tips Section */}
						<div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
							<Button
								variant="ghost"
								size="sm"
								className="w-full justify-between px-3 py-2 text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-900"
								onClick={() => setShowTips(!showTips)}
							>
								<span className="flex items-center gap-2">
									<LightbulbIcon className="size-4" />
									<Trans>Quick tips to fix overflow</Trans>
									<span className="text-xs opacity-70">/ Conseils rapides</span>
								</span>
								{showTips ? <CaretUpIcon className="size-4" /> : <CaretDownIcon className="size-4" />}
							</Button>

							{showTips && (
								<div className="space-y-3 border-blue-200 border-t p-3 text-sm dark:border-blue-800">
									{/* Tips in English */}
									<div className="space-y-1">
										<p className="font-medium text-blue-900 dark:text-blue-100">
											<Trans>Quick fixes:</Trans>
										</p>
										<ul className="list-inside list-disc space-y-0.5 text-blue-800 dark:text-blue-200">
											<li>
												<Trans>Use Free-Form format if you don't need to print</Trans>
											</li>
											<li>
												<Trans>Reduce font size (Typography section)</Trans>
											</li>
											<li>
												<Trans>Decrease page margins</Trans>
											</li>
											<li>
												<Trans>Use 2+ columns for Skills, Languages, Interests</Trans>
											</li>
											<li>
												<Trans>Move sections to another page</Trans>
											</li>
											<li>
												<Trans>Shorten descriptions and use bullet points</Trans>
											</li>
										</ul>
									</div>

									{/* Tips in French for IMTA students */}
									<div className="space-y-1 border-blue-200 border-t pt-3 dark:border-blue-700">
										<p className="font-medium text-blue-900 dark:text-blue-100">Conseils pour les etudiants IMTA:</p>
										<ul className="list-inside list-disc space-y-0.5 text-blue-800 dark:text-blue-200">
											<li>Utilisez le format "Free-Form" si vous n'avez pas besoin d'imprimer</li>
											<li>Reduisez la taille de police (section Typographie)</li>
											<li>Diminuez les marges de la page</li>
											<li>Utilisez 2+ colonnes pour Competences, Langues, Interets</li>
											<li>Deplacez des sections vers une autre page</li>
											<li>Raccourcissez les descriptions et utilisez des puces</li>
										</ul>
									</div>

									{/* Sections on this page */}
									<div className="space-y-1 border-blue-200 border-t pt-3 dark:border-blue-700">
										<p className="font-medium text-blue-900 dark:text-blue-100">
											<Trans>Sections on this page:</Trans>
										</p>
										<div className="flex flex-wrap gap-1">
											{pageLayout.main.length > 0 && (
												<div className="flex flex-wrap gap-1">
													{pageLayout.main.map((section) => (
														<span key={section} className="rounded bg-blue-200 px-1.5 py-0.5 text-xs dark:bg-blue-800">
															{section}
														</span>
													))}
												</div>
											)}
											{pageLayout.sidebar.length > 0 && (
												<div className="flex flex-wrap gap-1">
													{pageLayout.sidebar.map((section) => (
														<span
															key={section}
															className="rounded bg-green-200 px-1.5 py-0.5 text-xs dark:bg-green-800"
														>
															{section}
														</span>
													))}
												</div>
											)}
										</div>
										<p className="text-xs opacity-70">
											<Trans>Try moving some sections to reduce content on this page</Trans>
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
