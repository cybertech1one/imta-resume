import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ORPCError } from "@orpc/client";
import {
	ArrowLeftIcon,
	IdentificationCardIcon,
	QrCodeIcon,
	ShareNetworkIcon,
	SparkleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BusinessCard } from "@/components/business-card";
import { ErrorComponent } from "@/components/error-component";
import { QRCodeDisplay } from "@/components/qr-code";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { orpc } from "@/integrations/orpc/client";
import { generateBusinessCardSchema, generateCanonicalLink, generateMetaTags } from "@/utils/seo";
import { generateCompactVCard } from "@/utils/vcard";

export const Route = createFileRoute("/$username/$slug/card")({
	component: RouteComponent,
	errorComponent: ErrorComponent,
	loader: async ({ context, params: { username, slug } }) => {
		try {
			// Ignore .well-known requests
			if (username === ".well-known") throw notFound();

			const resume = await context.queryClient.ensureQueryData(
				orpc.resume.getBusinessCardBySlug.queryOptions({ input: { username, slug } }),
			);

			// Return resume with enabled status - don't throw 404 if just not enabled
			const businessCardSettings = resume.data.metadata?.businessCard;
			return {
				resume,
				isEnabled: businessCardSettings?.enabled ?? false,
				username,
				slug,
			};
		} catch (error) {
			// Only throw notFound for actual missing resumes
			if (error instanceof ORPCError && error.code === "NOT_FOUND") {
				throw notFound();
			}
			throw error;
		}
	},
	head: ({ loaderData }) => {
		if (!loaderData) {
			return {
				meta: [{ title: "Digital Business Card | IMTA Resume" }],
			};
		}

		const { resume, username, slug } = loaderData;
		const appUrl = (typeof process !== "undefined" ? process.env.APP_URL : undefined) ?? "https://imta.ma/";
		const cardUrl = `${appUrl}${username}/${slug}/card`;

		// Extract data for SEO
		const basics = resume.data?.basics;
		const pictureData = resume.data?.picture;
		const fullName = basics?.name || "Professional";
		const headline = basics?.headline || "";
		const email = basics?.email;
		const phone = basics?.phone;
		const picture = pictureData?.url;

		const title = `${fullName} - Digital Business Card | IMTA Resume`;
		const description = headline
			? `Digital business card for ${fullName}. ${headline}. Scan QR code to save contact.`
			: `Digital business card for ${fullName}. Scan QR code to save contact information.`;

		return {
			links: [generateCanonicalLink(cardUrl)],
			meta: generateMetaTags({
				title,
				description,
				image: picture || `${appUrl}opengraph/banner.jpg`,
				url: cardUrl,
				type: "profile",
				siteName: "IMTA Resume",
			}),
			scripts: [
				// JSON-LD BusinessCard schema
				{
					type: "application/ld+json",
					children: JSON.stringify(
						generateBusinessCardSchema({
							name: fullName,
							description: headline,
							email,
							phone,
							url: cardUrl,
							image: picture,
							jobTitle: headline,
						}),
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
					search: { redirect: `/${username}/${slug}/card` },
				});
			}
		}

		throw notFound();
	},
});

function CardNotEnabledPage({ username, slug }: { username: string; slug: string }) {
	return (
		<div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 font-sans antialiased sm:p-8">
			{/* Animated background elements */}
			<div className="pointer-events-none fixed inset-0 overflow-hidden">
				{/* Emerald glow */}
				<motion.div
					className="absolute -top-40 -left-40 size-[600px] rounded-full bg-gradient-to-br from-[oklch(0.45_0.14_160)]/15 to-transparent blur-[100px]"
					animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.2, 0.15] }}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
				/>
				{/* Gold glow */}
				<motion.div
					className="absolute -right-40 bottom-0 size-[500px] rounded-full bg-gradient-to-tl from-[oklch(0.65_0.15_195)]/10 to-transparent blur-[100px]"
					animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.15, 0.1] }}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
				/>
				{/* Moroccan pattern overlay */}
				<div className="moroccan-star-pattern absolute inset-0 opacity-30" />
				{/* Gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
			</div>

			<motion.div
				className="relative z-10 w-full max-w-md space-y-8 text-center"
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
			>
				{/* Icon with glow */}
				<motion.div
					className="relative mx-auto"
					initial={{ scale: 0.8 }}
					animate={{ scale: 1 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 shadow-2xl backdrop-blur-sm">
						<IdentificationCardIcon size={44} className="text-slate-400" weight="duotone" />
						{/* Decorative ring */}
						<div className="absolute inset-0 rounded-2xl ring-1 ring-white/5 ring-inset" />
					</div>
					{/* Glow effect */}
					<div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-[oklch(0.45_0.14_160)]/20 to-[oklch(0.65_0.15_195)]/10 blur-xl" />
				</motion.div>

				<motion.div
					className="space-y-3"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<h1 className="font-bold font-display text-3xl text-white tracking-tight">
						<Trans>Business Card Not Available</Trans>
					</h1>
					<p className="mx-auto max-w-sm text-slate-400 leading-relaxed">
						<Trans>The digital business card for this resume hasn't been enabled yet.</Trans>
					</p>
				</motion.div>

				<motion.div
					className="space-y-4 pt-2"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
				>
					<Button
						asChild
						size="lg"
						className="w-full rounded-xl bg-gradient-to-r from-[oklch(0.45_0.14_160)] to-[oklch(0.50_0.13_165)] py-6 shadow-[oklch(0.45_0.14_160)]/20 shadow-lg transition-all duration-300 hover:shadow-[oklch(0.45_0.14_160)]/30 hover:shadow-xl"
					>
						<Link to="/$username/$slug" params={{ username, slug }}>
							<ArrowLeftIcon size={18} className="mr-2" />
							<Trans>View Resume Instead</Trans>
						</Link>
					</Button>

					<p className="text-slate-500 text-xs leading-relaxed">
						<Trans>If this is your resume, enable the business card in the resume builder settings.</Trans>
					</p>
				</motion.div>
			</motion.div>
		</div>
	);
}

function RouteComponent() {
	const { username, slug } = Route.useParams();
	const [showQRDialog, setShowQRDialog] = useState(false);
	const loaderData = Route.useLoaderData();

	const { data: resume } = useQuery(orpc.resume.getBusinessCardBySlug.queryOptions({ input: { username, slug } }));

	// Show friendly page if business card is not enabled
	if (!loaderData.isEnabled) {
		return <CardNotEnabledPage username={username} slug={slug} />;
	}

	if (!resume) return null;

	const businessCardSettings = resume.data.metadata?.businessCard;
	const cardUrl = typeof window !== "undefined" ? window.location.href : "";
	const resumeUrl = typeof window !== "undefined" ? `${window.location.origin}/${username}/${slug}` : "";

	const qrCodeValue =
		businessCardSettings?.qrCodeMode === "vcard" ? generateCompactVCard(resume.data, resumeUrl) : cardUrl;

	const accentColor = businessCardSettings?.accentColor ?? "#3b82f6";
	const profilePicture = resume.data.picture?.url;

	return (
		<div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 font-sans antialiased sm:p-8">
			{/* Enhanced Background Decoration */}
			<div className="pointer-events-none fixed inset-0 overflow-hidden">
				{/* Profile-based or accent color blur */}
				{profilePicture ? (
					<motion.div
						className="absolute inset-[-10%] opacity-25 blur-[120px] saturate-150"
						style={{ backgroundImage: `url(${profilePicture})`, backgroundSize: "cover", backgroundPosition: "center" }}
						animate={{ scale: [1, 1.05, 1] }}
						transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
					/>
				) : (
					<>
						<motion.div
							className="absolute -top-60 -left-40 size-[700px] rounded-full opacity-20 blur-[120px]"
							style={{ backgroundColor: accentColor }}
							animate={{ scale: [1, 1.1, 1], x: [0, 30, 0] }}
							transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
						/>
						<motion.div
							className="absolute -right-40 bottom-0 size-[600px] rounded-full opacity-15 blur-[100px]"
							style={{ backgroundColor: accentColor }}
							animate={{ scale: [1, 1.15, 1], x: [0, -20, 0] }}
							transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
						/>
					</>
				)}
				{/* Moroccan star pattern overlay */}
				<div className="moroccan-star-pattern absolute inset-0 opacity-20" />
				{/* Gradient overlays */}
				<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
				<div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/50" />
			</div>

			<motion.div
				className="relative z-10 w-full max-w-md space-y-6"
				initial={false}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.6 }}
			>
				{/* Top Actions with glass effect */}
				<motion.div
					className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-2 backdrop-blur-md"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<Button
						variant="ghost"
						size="sm"
						asChild
						className="rounded-xl text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white"
					>
						<Link to="/$username/$slug" params={{ username, slug }}>
							<ArrowLeftIcon size={16} className="mr-2" />
							<Trans>Resume</Trans>
						</Link>
					</Button>

					<Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
						<DialogTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="rounded-xl text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white"
							>
								<ShareNetworkIcon size={18} className="mr-2" />
								<Trans>Share</Trans>
							</Button>
						</DialogTrigger>
						<DialogContent className="overflow-hidden border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 text-white sm:max-w-md">
							{/* Dialog background decoration */}
							<div className="pointer-events-none absolute inset-0">
								<div
									className="absolute -top-20 -right-20 size-40 rounded-full opacity-20 blur-[60px]"
									style={{ backgroundColor: accentColor }}
								/>
								<div
									className="absolute -bottom-20 -left-20 size-40 rounded-full opacity-15 blur-[60px]"
									style={{ backgroundColor: accentColor }}
								/>
							</div>
							<DialogHeader className="relative z-10">
								<DialogTitle className="flex items-center gap-2 text-white">
									<QrCodeIcon size={20} className="text-[oklch(0.65_0.15_195)]" />
									<Trans>Share Business Card</Trans>
								</DialogTitle>
								<DialogDescription className="text-slate-400">
									{businessCardSettings?.qrCodeMode === "vcard" ? (
										<Trans>Scan to save contact details immediately.</Trans>
									) : (
										<Trans>Scan to open the digital business card.</Trans>
									)}
								</DialogDescription>
							</DialogHeader>
							<motion.div
								className="relative z-10 flex flex-col items-center gap-6 py-6"
								initial={false}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.4, delay: 0.1 }}
							>
								{/* QR Code with decorative frame */}
								<div className="relative">
									<div className="rounded-3xl bg-white p-5 shadow-2xl">
										<QRCodeDisplay value={qrCodeValue} size={200} />
									</div>
									{/* Decorative corners */}
									<div
										className="absolute -top-2 -left-2 size-6 rounded-tl-xl border-t-2 border-l-2"
										style={{ borderColor: accentColor }}
									/>
									<div
										className="absolute -top-2 -right-2 size-6 rounded-tr-xl border-t-2 border-r-2"
										style={{ borderColor: accentColor }}
									/>
									<div
										className="absolute -bottom-2 -left-2 size-6 rounded-bl-xl border-b-2 border-l-2"
										style={{ borderColor: accentColor }}
									/>
									<div
										className="absolute -right-2 -bottom-2 size-6 rounded-br-xl border-r-2 border-b-2"
										style={{ borderColor: accentColor }}
									/>
								</div>

								{businessCardSettings?.qrCodeMode !== "vcard" && (
									<div className="w-full space-y-3 text-center">
										<p className="font-semibold text-slate-400 text-xs uppercase tracking-[0.15em]">
											<Trans>Quick Link</Trans>
										</p>
										<div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/50 p-2 pl-4">
											<code className="flex-1 truncate text-slate-300 text-xs">{cardUrl}</code>
											<Button
												size="sm"
												variant="secondary"
												className="h-9 rounded-lg font-medium transition-all hover:scale-105"
												onClick={() => {
													navigator.clipboard.writeText(cardUrl);
													toast.success(t`Link copied!`);
												}}
											>
												<Trans>Copy</Trans>
											</Button>
										</div>
									</div>
								)}

								{businessCardSettings?.qrCodeMode === "vcard" && (
									<p className="text-center text-slate-400 text-sm leading-relaxed">
										<Trans>This QR code contains your contact information in vCard format.</Trans>
									</p>
								)}
							</motion.div>
						</DialogContent>
					</Dialog>
				</motion.div>

				{/* Main Card with enhanced animation */}
				<motion.div
					initial={false}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
				>
					<div className="relative">
						{/* Glow effect behind card */}
						<motion.div
							className="absolute inset-0 -z-10 rounded-3xl opacity-60 blur-2xl"
							style={{ backgroundColor: accentColor }}
							animate={{ opacity: [0.4, 0.6, 0.4], scale: [0.95, 1, 0.95] }}
							transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
						/>
						<BusinessCard
							data={resume.data}
							settings={businessCardSettings}
							resumeUrl={resumeUrl}
							className="mx-auto shadow-2xl shadow-black/40 ring-1 ring-white/10"
						/>
					</div>
				</motion.div>

				{/* Footer Info with IMTA branding */}
				<motion.div
					className="flex flex-col items-center gap-3 pt-6 text-center"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.8 }}
				>
					<div className="flex items-center gap-2 opacity-50 transition-opacity hover:opacity-100">
						<SparkleIcon size={14} className="text-[oklch(0.65_0.15_195)]" />
						<p className="font-semibold text-[10px] text-white uppercase tracking-[0.2em]">
							<Trans>IMTA Resume Builder</Trans>
						</p>
						<SparkleIcon size={14} className="text-[oklch(0.65_0.15_195)]" />
					</div>
				</motion.div>
			</motion.div>
		</div>
	);
}
