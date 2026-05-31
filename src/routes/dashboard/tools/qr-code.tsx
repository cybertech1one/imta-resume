import { t } from "@lingui/core/macro";
import { ClipboardTextIcon, PrinterIcon, QrCodeIcon, TrendUpIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { DashboardHeader } from "../-components/header";
import {
	GeneratorTab,
	HelpSection,
	HeroSection,
	MyCodesTab,
	PrintTab,
	StatisticsTab,
} from "./-components/qr-code-components";
import { deviceColors, sizeConfig } from "./-components/qr-code-config";
import type { QRSize, QRStyle } from "./-components/qr-code-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/qr-code" as any)({
	component: QRCodeGenerator,
	errorComponent: ErrorComponent,
});

function QRCodeGenerator() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("generator");

	// QR Code configuration state
	const [url, setUrl] = useState("");
	const [foregroundColor, setForegroundColor] = useState("#000000");
	const [backgroundColor, setBackgroundColor] = useState("#ffffff");
	const [size, setSize] = useState<QRSize>("medium");
	const [style, setStyle] = useState<QRStyle>("square");
	const [showEmbedCode, setShowEmbedCode] = useState(false);

	// Print-ready settings
	const [printSize, setPrintSize] = useState<"card" | "a4" | "custom">("card");
	const [includeLabel, setIncludeLabel] = useState(true);
	const [includeLogo, setIncludeLogo] = useState(false);

	// Fetch QR codes from database
	const { data: savedQRCodes = [], isLoading: isLoadingQRCodes } = useQuery({
		...orpc.qrCode.list.queryOptions({ input: {} }),
		enabled: !!session?.user,
		staleTime: 2 * 60 * 1000,
	});

	// Fetch statistics from database
	const { data: statistics, isLoading: isLoadingStatistics } = useQuery({
		...orpc.qrCode.getStatistics.queryOptions({ input: { days: 30 } }),
		enabled: !!session?.user,
		staleTime: 2 * 60 * 1000,
	});

	// Create mutation
	const createMutation = useMutation({
		...orpc.qrCode.create.mutationOptions(),
		onMutate: async (newQRCode) => {
			await queryClient.cancelQueries({ queryKey: orpc.qrCode.list.key() });
			const previousQRCodes = queryClient.getQueryData(orpc.qrCode.list.key({ input: {} }));

			queryClient.setQueryData(
				orpc.qrCode.list.key({ input: {} }),
				(
					old:
						| {
								id: string;
								name: string;
								url: string;
								foregroundColor: string;
								backgroundColor: string;
								size: string;
								style: string;
								scans: number;
								createdAt: Date;
						  }[]
						| undefined,
				) => {
					if (!old) return old;
					const optimisticQRCode = {
						id: `temp-${Date.now()}`,
						name: newQRCode.name,
						url: newQRCode.url,
						foregroundColor: newQRCode.foregroundColor,
						backgroundColor: newQRCode.backgroundColor,
						size: newQRCode.size,
						style: newQRCode.style,
						scans: 0,
						createdAt: new Date(),
					};
					return [optimisticQRCode, ...old];
				},
			);

			return { previousQRCodes };
		},
		onSuccess: () => {
			toast.success(t`QR code saved`);
		},
		onError: (_error, _newQRCode, context) => {
			if (context?.previousQRCodes) {
				queryClient.setQueryData(orpc.qrCode.list.key({ input: {} }), context.previousQRCodes);
			}
			toast.error(t`Error saving QR code`);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: orpc.qrCode.list.key() });
			queryClient.invalidateQueries({ queryKey: orpc.qrCode.getStatistics.key() });
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		...orpc.qrCode.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.qrCode.list.key() });
			queryClient.invalidateQueries({ queryKey: orpc.qrCode.getStatistics.key() });
			toast.success(t`QR code deleted`);
		},
		onError: () => {
			toast.error(t`Error deleting QR code`);
		},
	});

	const totalScans = savedQRCodes.reduce((acc, qr) => acc + qr.scans, 0);

	// Format statistics data for charts
	const scanStatistics = useMemo(() => {
		if (!statistics?.scansByDate) return [];
		return statistics.scansByDate.map((s) => ({
			date: new Date(s.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
			scans: s.scans,
		}));
	}, [statistics]);

	const deviceStatistics = useMemo(() => {
		if (!statistics?.scansByDevice) return [];
		return statistics.scansByDevice.map((d) => ({
			device: d.device,
			count: d.count,
			percentage: d.percentage,
			color: deviceColors[d.device] || deviceColors.Unknown,
		}));
	}, [statistics]);

	const locationStatistics = useMemo(() => {
		if (!statistics?.scansByLocation) return [];
		return statistics.scansByLocation;
	}, [statistics]);

	// Generate embed code
	const embedCode = useMemo(() => {
		if (!url) return "";
		const pixels = sizeConfig[size].pixels;
		return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${pixels}x${pixels}&data=${encodeURIComponent(url)}&color=${foregroundColor.replace("#", "")}&bgcolor=${backgroundColor.replace("#", "")}" alt="QR Code" width="${pixels}" height="${pixels}" />`;
	}, [url, size, foregroundColor, backgroundColor]);

	// Handlers
	const handleCopyUrl = useCallback(() => {
		if (url) {
			navigator.clipboard.writeText(url);
			toast.success(t`URL copied to clipboard`);
		}
	}, [url]);

	const handleCopyEmbedCode = useCallback(() => {
		if (embedCode) {
			navigator.clipboard.writeText(embedCode);
			toast.success(t`Embed code copied`);
		}
	}, [embedCode]);

	const handleDownload = useCallback(
		(format: "png" | "svg") => {
			if (!url) {
				toast.error(t`Please enter a URL`);
				return;
			}
			const svgElement = document.querySelector("[data-qr-preview] svg") as SVGSVGElement | null;
			if (!svgElement) {
				toast.error(t`QR code not found`);
				return;
			}
			const serializer = new XMLSerializer();
			const svgString = serializer.serializeToString(svgElement);

			if (format === "svg") {
				const blob = new Blob([svgString], { type: "image/svg+xml" });
				const downloadUrl = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = downloadUrl;
				a.download = "qr-code.svg";
				a.click();
				URL.revokeObjectURL(downloadUrl);
			} else {
				const canvas = document.createElement("canvas");
				const pixels = sizeConfig[size].pixels;
				canvas.width = pixels;
				canvas.height = pixels;
				const ctx = canvas.getContext("2d");
				if (!ctx) return;
				const img = new Image();
				img.onload = () => {
					ctx.drawImage(img, 0, 0, pixels, pixels);
					const downloadUrl = canvas.toDataURL("image/png");
					const a = document.createElement("a");
					a.href = downloadUrl;
					a.download = "qr-code.png";
					a.click();
				};
				img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
			}
			toast.success(t`Downloading QR code as ${format.toUpperCase()}`);
		},
		[url, size],
	);

	const handleSaveQRCode = useCallback(() => {
		if (!url) {
			toast.error(t`Please enter a URL`);
			return;
		}
		createMutation.mutate({
			name: `QR Code ${savedQRCodes.length + 1}`,
			url,
			foregroundColor,
			backgroundColor,
			size,
			style,
		});
	}, [url, foregroundColor, backgroundColor, size, style, savedQRCodes.length, createMutation]);

	const handleDeleteQRCode = useCallback(
		(id: string) => {
			deleteMutation.mutate({ id });
		},
		[deleteMutation],
	);

	const handleLoadQRCode = useCallback((qr: (typeof savedQRCodes)[0]) => {
		setUrl(qr.url);
		setForegroundColor(qr.foregroundColor);
		setBackgroundColor(qr.backgroundColor);
		setSize(qr.size);
		setStyle(qr.style);
		setActiveTab("generator");
		toast.success(t`Configuration loaded`);
	}, []);

	const handleReset = useCallback(() => {
		setUrl("");
		setForegroundColor("#000000");
		setBackgroundColor("#ffffff");
		setSize("medium");
		setStyle("square");
	}, []);

	const handlePrint = useCallback(() => {
		toast.success(t`Preparing to print...`);
		window.print();
	}, []);

	return (
		<>
			<DashboardHeader icon={QrCodeIcon} title={t`QR Code Generator`} />

			<HeroSection savedQRCodesCount={savedQRCodes.length} totalScans={totalScans} />

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "generator", icon: QrCodeIcon, label: t`Generator` },
						{ value: "my-codes", icon: ClipboardTextIcon, label: t`My QR Codes (${savedQRCodes.length})` },
						{ value: "statistics", icon: TrendUpIcon, label: t`Statistics` },
						{ value: "print", icon: PrinterIcon, label: t`Print` },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-6 py-2.5 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="generator" className="space-y-8">
					<GeneratorTab
						url={url}
						setUrl={setUrl}
						foregroundColor={foregroundColor}
						setForegroundColor={setForegroundColor}
						backgroundColor={backgroundColor}
						setBackgroundColor={setBackgroundColor}
						size={size}
						setSize={setSize}
						style={style}
						setStyle={setStyle}
						showEmbedCode={showEmbedCode}
						setShowEmbedCode={setShowEmbedCode}
						embedCode={embedCode}
						isSaving={createMutation.isPending}
						handleCopyUrl={handleCopyUrl}
						handleCopyEmbedCode={handleCopyEmbedCode}
						handleDownload={handleDownload}
						handleSaveQRCode={handleSaveQRCode}
						handleReset={handleReset}
					/>
				</TabsContent>

				<TabsContent value="my-codes" className="space-y-8">
					<MyCodesTab
						savedQRCodes={savedQRCodes}
						isLoading={isLoadingQRCodes}
						onLoad={handleLoadQRCode}
						onDownload={handleDownload}
						onDelete={handleDeleteQRCode}
						onCreateNew={() => setActiveTab("generator")}
					/>
				</TabsContent>

				<TabsContent value="statistics" className="space-y-8">
					<StatisticsTab
						isLoading={isLoadingStatistics}
						totalScans={totalScans}
						todayScans={statistics?.totalScans ?? 0}
						savedQRCodesCount={savedQRCodes.length}
						scanStatistics={scanStatistics}
						deviceStatistics={deviceStatistics}
						locationStatistics={locationStatistics}
					/>
				</TabsContent>

				<TabsContent value="print" className="space-y-8">
					<PrintTab
						savedQRCodes={savedQRCodes}
						printSize={printSize}
						setPrintSize={setPrintSize}
						includeLabel={includeLabel}
						setIncludeLabel={setIncludeLabel}
						includeLogo={includeLogo}
						setIncludeLogo={setIncludeLogo}
						handlePrint={handlePrint}
						handleDownload={handleDownload}
					/>
				</TabsContent>
			</Tabs>

			<HelpSection />
		</>
	);
}
