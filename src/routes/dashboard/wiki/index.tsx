import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { BookOpenIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ErrorComponent } from "@/components/error-component";
import { wikiCategories } from "@/data/wiki";
import { DashboardHeader } from "../-components/header";
import { WikiCategoryCard } from "./-components/wiki-category-card";
import { WikiSearch } from "./-components/wiki-search";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/wiki/" as any)({
	component: WikiLandingPage,
	errorComponent: ErrorComponent,
});

function WikiLandingPage() {
	return (
		<>
			<DashboardHeader icon={BookOpenIcon} title={t`Wiki - Base de Connaissances`} />

			{/* Hero Section */}
			<section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-transparent pt-8 pb-12">
				<div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="absolute -top-40 right-1/4 size-[500px] rounded-full bg-gradient-to-b from-primary/[0.06] to-transparent blur-3xl" />
					<div className="absolute -bottom-20 left-1/4 size-[400px] rounded-full bg-gradient-to-t from-[oklch(0.65_0.15_195)]/[0.04] to-transparent blur-3xl" />
				</div>

				<div className="container relative mx-auto px-4 lg:px-12">
					<motion.div
						className="mx-auto max-w-3xl text-center"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm shadow-sm">
							<BookOpenIcon aria-hidden="true" className="size-4 text-primary" />
							<Trans>Resume Knowledge Base</Trans>
						</div>
						<h1 className="font-bold font-display text-4xl leading-tight md:text-5xl">
							<Trans>Resume Wiki</Trans>
						</h1>
						<p className="mt-4 text-lg text-muted-foreground leading-relaxed">
							<Trans>
								Everything you need to know about resumes, cover letters, job searching, and career development. Expert
								guides written to help you land your dream job.
							</Trans>
						</p>
						<div className="mt-8 flex justify-center">
							<WikiSearch />
						</div>
					</motion.div>
				</div>
			</section>

			{/* Categories Grid */}
			<section className="container mx-auto px-4 py-16 lg:px-12">
				<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
					<h2 className="mb-2 font-bold font-display text-2xl">
						<Trans>Browse by Topic</Trans>
					</h2>
					<p className="mb-8 text-muted-foreground">
						<Trans>Explore our comprehensive guides organized by topic.</Trans>
					</p>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{wikiCategories.map((category, index) => (
							<motion.div
								key={category.slug}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: 0.1 * index }}
							>
								<WikiCategoryCard category={category} />
							</motion.div>
						))}
					</div>
				</motion.div>
			</section>
		</>
	);
}
