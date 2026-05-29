import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ClipboardIcon, QrCodeIcon } from "@phosphor-icons/react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { BusinessCard, businessCardThemes } from "@/components/business-card";
import { QRCodeDisplay } from "@/components/qr-code";
import { useResumeStore } from "@/components/resume/store/resume";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import type { BusinessCardSettings } from "@/schema/resume/data";
import { generateCompactVCard } from "@/utils/vcard";
import { SectionBase } from "../shared/section-base";

export function BusinessCardSectionBuilder() {
	const [_, copyToClipboard] = useCopyToClipboard();
	const [showPreview, setShowPreview] = useState(false);
	const { data: session } = authClient.useSession();
	const params = useParams({ from: "/builder/$resumeId" });

	const { mutateAsync: updateResume } = useMutation(orpc.resume.update.mutationOptions());
	const { data: resume } = useSuspenseQuery(orpc.resume.getById.queryOptions({ input: { id: params.resumeId } }));
	const resumeData = useResumeStore((state) => state.resume);

	const businessCardSettings: BusinessCardSettings = resume.data.metadata?.businessCard ?? {
		enabled: false,
		showPhoto: true,
		showHeadline: true,
		showEmail: true,
		showPhone: false,
		showLocation: true,
		showSocialLinks: true,
		showWebsite: true,
		theme: "professional",
		accentColor: "#3b82f6",
		qrCodeMode: "url",
		showSummary: false,
	};

	const cardUrl = useMemo(() => {
		if (!session) return "";
		return `${window.location.origin}/${session.user.username}/${resume.slug}/card`;
	}, [session, resume.slug]);

	const qrCodeValue = useMemo(() => {
		if (businessCardSettings.qrCodeMode === "vcard") {
			return generateCompactVCard(resume.data);
		}
		return cardUrl;
	}, [businessCardSettings.qrCodeMode, resume.data, cardUrl]);

	const onCopyUrl = useCallback(async () => {
		await copyToClipboard(cardUrl);
		toast.success(t`Business card link copied to clipboard.`);
	}, [cardUrl, copyToClipboard]);

	const updateBusinessCardSetting = useCallback(
		async (key: keyof BusinessCardSettings, value: boolean | string) => {
			const newSettings = {
				...businessCardSettings,
				[key]: value,
			};

			try {
				await updateResume({
					id: resume.id,
					data: {
						...resume.data,
						metadata: {
							...resume.data.metadata,
							businessCard: newSettings,
						},
					},
				});
			} catch {
				toast.error(t`Failed to update business card settings.`);
			}
		},
		[resume.id, resume.data, businessCardSettings, updateResume],
	);

	return (
		<SectionBase type="business-card" className="space-y-4">
			<div className="flex items-center gap-x-4">
				<Switch
					id="business-card-enabled"
					checked={businessCardSettings.enabled}
					onCheckedChange={(checked) => void updateBusinessCardSetting("enabled", checked)}
				/>

				<Label htmlFor="business-card-enabled" className="my-2 flex flex-col items-start gap-y-1 font-normal">
					<p className="font-medium">
						<Trans>Enable Business Card</Trans>
					</p>

					<span className="text-muted-foreground text-xs">
						<Trans>Create a simple, shareable digital business card from your resume.</Trans>
					</span>
				</Label>
			</div>

			{businessCardSettings.enabled && (
				<div className="space-y-4 rounded-md border p-4">
					{/* URL */}
					<div className="grid gap-2">
						<Label htmlFor="business-card-url">
							<Trans>Share Link</Trans>
						</Label>
						<div className="flex items-center gap-x-2">
							<Input readOnly id="business-card-url" value={cardUrl} />
							<Button size="icon" variant="ghost" onClick={onCopyUrl} aria-label={t`Copy URL to clipboard`}>
								<ClipboardIcon />
							</Button>
						</div>
					</div>

					{/* Theme */}
					<div className="grid gap-2">
						<Label>
							<Trans>Theme</Trans>
						</Label>
						<Select
							value={businessCardSettings.theme}
							onValueChange={(value) => void updateBusinessCardSetting("theme", value)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(businessCardThemes).map(([key, theme]) => (
									<SelectItem key={key} value={key}>
										{theme.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Accent Color */}
					<div className="grid gap-2">
						<Label htmlFor="accent-color">
							<Trans>Accent Color</Trans>
						</Label>
						<div className="flex items-center gap-2">
							<input
								id="accent-color"
								type="color"
								value={businessCardSettings.accentColor}
								onChange={(e) => void updateBusinessCardSetting("accentColor", e.target.value)}
								className="h-10 w-14 cursor-pointer rounded border"
							/>
							<Input
								value={businessCardSettings.accentColor}
								onChange={(e) => void updateBusinessCardSetting("accentColor", e.target.value)}
								placeholder="#3b82f6"
								className="flex-1"
							/>
						</div>
					</div>

					{/* Field Visibility */}
					<div className="space-y-3">
						<Label>
							<Trans>Visible Fields</Trans>
						</Label>

						<div className="grid grid-cols-2 gap-3">
							<div className="flex items-center gap-2">
								<Switch
									id="show-photo"
									checked={businessCardSettings.showPhoto}
									onCheckedChange={(checked) => void updateBusinessCardSetting("showPhoto", checked)}
								/>
								<Label htmlFor="show-photo" className="font-normal text-sm">
									<Trans>Photo</Trans>
								</Label>
							</div>

							<div className="flex items-center gap-2">
								<Switch
									id="show-headline"
									checked={businessCardSettings.showHeadline}
									onCheckedChange={(checked) => void updateBusinessCardSetting("showHeadline", checked)}
								/>
								<Label htmlFor="show-headline" className="font-normal text-sm">
									<Trans>Headline</Trans>
								</Label>
							</div>

							<div className="flex items-center gap-2">
								<Switch
									id="show-email"
									checked={businessCardSettings.showEmail}
									onCheckedChange={(checked) => void updateBusinessCardSetting("showEmail", checked)}
								/>
								<Label htmlFor="show-email" className="font-normal text-sm">
									<Trans>Email</Trans>
								</Label>
							</div>

							<div className="flex items-center gap-2">
								<Switch
									id="show-phone"
									checked={businessCardSettings.showPhone}
									onCheckedChange={(checked) => void updateBusinessCardSetting("showPhone", checked)}
								/>
								<Label htmlFor="show-phone" className="font-normal text-sm">
									<Trans>Phone</Trans>
								</Label>
							</div>

							<div className="flex items-center gap-2">
								<Switch
									id="show-location"
									checked={businessCardSettings.showLocation}
									onCheckedChange={(checked) => void updateBusinessCardSetting("showLocation", checked)}
								/>
								<Label htmlFor="show-location" className="font-normal text-sm">
									<Trans>Location</Trans>
								</Label>
							</div>

							<div className="flex items-center gap-2">
								<Switch
									id="show-website"
									checked={businessCardSettings.showWebsite}
									onCheckedChange={(checked) => void updateBusinessCardSetting("showWebsite", checked)}
								/>
								<Label htmlFor="show-website" className="font-normal text-sm">
									<Trans>Website</Trans>
								</Label>
							</div>

							<div className="flex items-center gap-2">
								<Switch
									id="show-social"
									checked={businessCardSettings.showSocialLinks}
									onCheckedChange={(checked) => void updateBusinessCardSetting("showSocialLinks", checked)}
								/>
								<Label htmlFor="show-social" className="font-normal text-sm">
									<Trans>Social Links</Trans>
								</Label>
							</div>

							<div className="flex items-center gap-2">
								<Switch
									id="show-summary"
									checked={businessCardSettings.showSummary}
									onCheckedChange={(checked) => void updateBusinessCardSetting("showSummary", checked)}
								/>
								<Label htmlFor="show-summary" className="font-normal text-sm">
									<Trans>Summary</Trans>
								</Label>
							</div>
						</div>
					</div>

					{/* QR Code Options */}
					<div className="space-y-3">
						<Label htmlFor="qr-code-mode">
							<Trans>QR Code Content</Trans>
						</Label>
						<Select
							value={businessCardSettings.qrCodeMode}
							onValueChange={(value) => void updateBusinessCardSetting("qrCodeMode", value as "url" | "vcard")}
						>
							<SelectTrigger id="qr-code-mode">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="url">
									<Trans>Link to Digital Card</Trans>
								</SelectItem>
								<SelectItem value="vcard">
									<Trans>Contact Info (vCard)</Trans>
								</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-muted-foreground text-xs">
							<Trans>Choosing "Contact Info" allows people to save your contact immediately when scanning.</Trans>
						</p>
					</div>

					{/* Preview and QR Code */}
					<div className="flex gap-2">
						<Dialog open={showPreview} onOpenChange={setShowPreview}>
							<DialogTrigger asChild>
								<Button variant="outline" className="flex-1">
									<Trans>Preview</Trans>
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-md">
								<DialogHeader>
									<DialogTitle>
										<Trans>Business Card Preview</Trans>
									</DialogTitle>
									<DialogDescription>
										<Trans>This is how your business card will appear to others.</Trans>
									</DialogDescription>
								</DialogHeader>
								<div className="mt-4">
									{resumeData && (
										<BusinessCard
											data={resumeData.data}
											settings={businessCardSettings}
											resumeUrl={
												session ? `${window.location.origin}/${session.user.username}/${resume.slug}` : undefined
											}
										/>
									)}
								</div>
							</DialogContent>
						</Dialog>

						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline" size="icon" aria-label={t`Show QR code`}>
									<QrCodeIcon />
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>
										<Trans>QR Code</Trans>
									</DialogTitle>
									<DialogDescription>
										{businessCardSettings.qrCodeMode === "vcard" ? (
											<Trans>Scan this QR code to add this contact to your phone.</Trans>
										) : (
											<Trans>Scan this QR code to view your digital business card.</Trans>
										)}
									</DialogDescription>
								</DialogHeader>
								<div className="flex flex-col items-center gap-4 py-4">
									<QRCodeDisplay value={qrCodeValue} size={200} />
									<p className="text-center text-muted-foreground text-sm tracking-tight">
										{businessCardSettings.qrCodeMode === "vcard" ? <Trans>Contact Information (vCard)</Trans> : cardUrl}
									</p>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			)}
		</SectionBase>
	);
}
