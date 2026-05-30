import { Trans } from "@lingui/react/macro";
import { ORPCError } from "@orpc/client";
import { AddressBookIcon, DownloadSimpleIcon, IdentificationCardIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { ErrorComponent } from "@/components/error-component";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { ResumePreview } from "@/components/resume/preview";
import { useResumeStore } from "@/components/resume/store/resume";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { orpc } from "@/integrations/orpc/client";
import { downloadFromUrl } from "@/utils/file";
import {
	generateBreadcrumbSchema,
	generateCanonicalLink,
	generateMetaTags,
	generateProfilePageSchema,
} from "@/utils/seo";
import { cn } from "@/utils/style";
import { downloadVCard } from "@/utils/vcard";

export const Route = createFileRoute("/$username/$slug/")({
	component: RouteComponent,
	errorComponent: ErrorComponent,
	loader: async ({ context, params: { username, slug } }) => {
		try {
			// Ignore .well-known requests
			if (username === ".well-known") throw notFound();

			const resume = await context.queryClient.ensureQueryData(
				orpc.resume.getBySlug.queryOptions({ input: { username, slug } }),
			);

			return { resume, username, slug };
		} catch (error) {
			// Only treat a genuinely missing/private resume as a 404. Any other
			// error (notably NEED_PASSWORD for password-protected resumes) MUST be
			// re-thrown so the route's `onError` handler can redirect the visitor to
			// the password prompt. A blanket `catch` here would swallow NEED_PASSWORD
			// and incorrectly show a 404 instead of unlocking the resume.
			if (error instanceof ORPCError && error.code === "NOT_FOUND") {
				throw notFound();
			}
			throw error;
		}
	},
	head: ({ loaderData }) => {
		if (!loaderData) {
			return {
				meta: [{ title: "Resume - IMTA Resume" }],
			};
		}

		const { resume, username, slug } = loaderData;
		const appUrl = (typeof process !== "undefined" ? process.env.APP_URL : undefined) ?? "https://imta.ma/";
		const resumeUrl = `${appUrl}${username}/${slug}`;

		// Extract resume data for SEO
		const basics = resume.data?.basics;
		const summaryData = resume.data?.summary;
		const pictureData = resume.data?.picture;
		const fullName = basics?.name || resume.name;
		const headline = basics?.headline || "";
		const summary = summaryData?.content || "";
		const picture = pictureData?.url;
		const location = basics?.location;
		const phone = basics?.phone;

		// Extract skills for structured data
		const skillsSection = resume.data?.sections?.skills;
		const skills: string[] = [];
		if (skillsSection?.items && Array.isArray(skillsSection.items)) {
			for (const item of skillsSection.items) {
				if (item && typeof item === "object" && "name" in item && item.name) {
					skills.push(item.name as string);
				}
			}
		}

		// Extract education institutions for structured data
		const educationSection = resume.data?.sections?.education;
		const education: string[] = [];
		if (educationSection?.items && Array.isArray(educationSection.items)) {
			for (const item of educationSection.items) {
				if (item && typeof item === "object" && "institution" in item && item.institution) {
					education.push(item.institution as string);
				}
			}
		}

		// Extract employers for structured data
		const experienceSection = resume.data?.sections?.experience;
		const employers: string[] = [];
		if (experienceSection?.items && Array.isArray(experienceSection.items)) {
			for (const item of experienceSection.items) {
				if (item && typeof item === "object" && "company" in item && item.company) {
					employers.push(item.company as string);
				}
			}
		}

		// Extract social links for structured data
		const profilesSection = resume.data?.sections?.profiles;
		const socialLinks: string[] = [];
		if (profilesSection?.items && Array.isArray(profilesSection.items)) {
			for (const item of profilesSection.items) {
				if (item && typeof item === "object" && "url" in item && item.url && typeof item.url === "object") {
					const urlObj = item.url as { href?: string };
					if (urlObj.href) {
						socialLinks.push(urlObj.href);
					}
				}
			}
		}

		// Build description from headline and/or summary
		const description = headline
			? summary
				? `${headline}. ${summary.slice(0, 150)}${summary.length > 150 ? "..." : ""}`
				: headline
			: summary
				? summary.slice(0, 200) + (summary.length > 200 ? "..." : "")
				: `Professional resume of ${fullName}`;

		return {
			links: [generateCanonicalLink(resumeUrl)],
			meta: generateMetaTags({
				title: `${fullName} - Resume | IMTA Resume`,
				description,
				image: picture || `${appUrl}opengraph/banner.jpg`,
				url: resumeUrl,
				type: "profile",
				siteName: "IMTA Resume",
			}),
			scripts: [
				// JSON-LD ProfilePage schema with comprehensive resume data
				{
					type: "application/ld+json",
					children: JSON.stringify(
						generateProfilePageSchema({
							name: fullName,
							headline,
							email: basics?.email,
							phone,
							url: resumeUrl,
							image: picture,
							jobTitle: headline,
							location: location
								? {
										city: location,
										country: location.includes("Morocco") ? "Morocco" : undefined,
									}
								: undefined,
							employers: employers.length > 0 ? employers : undefined,
							education: education.length > 0 ? education : undefined,
							skills: skills.length > 0 ? skills.slice(0, 10) : undefined, // Limit to top 10 skills
							socialLinks: socialLinks.length > 0 ? socialLinks : undefined,
							dateModified: undefined,
						}),
					),
				},
				// JSON-LD BreadcrumbList for navigation context
				{
					type: "application/ld+json",
					children: JSON.stringify(
						generateBreadcrumbSchema([
							{ name: "IMTA Resume", url: appUrl },
							{ name: fullName, url: resumeUrl },
						]),
					),
				},
			],
		};
	},
	onError: (error) => {
		if (error instanceof ORPCError && error.code === "NEED_PASSWORD") {
			const data = error.data as { username?: string; slug?: string } | undefined;
			const username = data?.username;
			const slug = data?.slug;

			if (username && slug) {
				throw redirect({
					to: "/auth/resume-password",
					search: { redirect: `/${username}/${slug}` },
				});
			}
		}

		throw notFound();
	},
});

function RouteComponent() {
	const { username, slug } = Route.useParams();
	const isReady = useResumeStore((state) => state.isReady);
	const initialize = useResumeStore((state) => state.initialize);

	const { data: resume } = useQuery(orpc.resume.getBySlug.queryOptions({ input: { username, slug } }));
	const { mutateAsync: printResumeAsPDF, isPending: isPrinting } = useMutation(
		orpc.printer.printResumeAsPDF.mutationOptions(),
	);

	useEffect(() => {
		if (!resume) return;
		initialize(resume);
		return () => initialize(null);
	}, [resume, initialize]);

	const handleDownload = useCallback(async () => {
		if (!resume) return;
		const { url } = await printResumeAsPDF({ id: resume.id });
		downloadFromUrl(url, `resume-${resume.name}.pdf`);
	}, [resume, printResumeAsPDF]);

	const handleDownloadVCard = useCallback(() => {
		if (!resume) return;
		downloadVCard(resume.data, resume.name);
	}, [resume]);

	if (!isReady) return <LoadingScreen />;

	return (
		<>
			<div
				className={cn("mx-auto max-w-[210mm]", "print:m-0 print:block print:max-w-full print:px-0", "md:my-4 md:px-4")}
			>
				<ResumePreview pageClassName="print:w-full! w-full max-w-full" />
			</div>

			<div className="fixed end-4 bottom-4 z-50 hidden gap-2 md:inline-flex print:hidden">
				{resume?.data.metadata?.businessCard?.enabled && (
					<Button size="lg" variant="secondary" className="rounded-full px-4" asChild>
						<Link to="/$username/$slug/card" params={{ username, slug }}>
							<IdentificationCardIcon size={20} className="mr-2" />
							<Trans>Digital Card</Trans>
						</Link>
					</Button>
				)}
				<Button size="lg" variant="secondary" className="rounded-full px-4" onClick={handleDownloadVCard}>
					<AddressBookIcon size={20} className="mr-2" />
					<Trans>vCard</Trans>
				</Button>
				<Button
					size="lg"
					variant="secondary"
					disabled={isPrinting}
					className="rounded-full px-4"
					onClick={handleDownload}
				>
					{isPrinting ? <Spinner /> : <DownloadSimpleIcon size={20} className="mr-2" />}
					{isPrinting ? <Trans>Downloading...</Trans> : <Trans>Download</Trans>}
				</Button>
			</div>
		</>
	);
}
