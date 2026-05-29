import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, SparkleIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function WikiInlineCta() {
	return (
		<div className="my-8 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-6">
			<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
						<SparkleIcon aria-hidden="true" className="size-5 text-primary" />
					</div>
					<div>
						<p className="font-semibold text-foreground">
							<Trans>Ready to build your resume?</Trans>
						</p>
						<p className="text-muted-foreground text-sm">
							<Trans>Use our free builder to create a professional resume in minutes.</Trans>
						</p>
					</div>
				</div>
				<Button asChild className="shrink-0 rounded-full" aria-label={t`Start building your resume`}>
					<Link to="/dashboard/resumes">
						<Trans>Get Started</Trans>
						<ArrowRightIcon aria-hidden="true" className="ml-2 size-4" />
					</Link>
				</Button>
			</div>
		</div>
	);
}

export function WikiBannerCta() {
	return (
		<section className="mt-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-[oklch(0.40_0.12_170)] p-8 text-center text-white md:p-12">
			<h2 className="font-bold font-display text-2xl md:text-3xl">
				<Trans>Start Building Your Resume Today</Trans>
			</h2>
			<p className="mx-auto mt-3 max-w-lg text-white/80">
				<Trans>
					Put this knowledge into action. Our free resume builder has everything you need to create a professional,
					ATS-friendly resume.
				</Trans>
			</p>
			<Button
				asChild
				size="lg"
				variant="secondary"
				className="mt-6 rounded-full font-semibold"
				aria-label={t`Create your resume for free`}
			>
				<Link to="/dashboard/resumes">
					<Trans>Create Your Resume - Free</Trans>
					<ArrowRightIcon aria-hidden="true" className="ml-2 size-4" />
				</Link>
			</Button>
		</section>
	);
}
