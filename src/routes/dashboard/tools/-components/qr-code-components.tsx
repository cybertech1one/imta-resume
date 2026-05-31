import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowCounterClockwiseIcon,
	CheckCircleIcon,
	CodeIcon,
	CopyIcon,
	DeviceMobileIcon,
	DownloadSimpleIcon,
	EyeIcon,
	FilePngIcon,
	FileSvgIcon,
	GlobeIcon,
	LinkIcon,
	MapPinIcon,
	PaletteIcon,
	PlusCircleIcon,
	PrinterIcon,
	QrCodeIcon,
	ShareNetworkIcon,
	SparkleIcon,
	TrashIcon,
	TrendUpIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/utils/format-date";
import { cn } from "@/utils/style";
import {
	predefinedBackgroundColors,
	predefinedColors,
	printFormatOptions,
	sizeConfig,
	styleConfig,
} from "./qr-code-config";
import type { QRSize, QRStyle, SavedQRCode } from "./qr-code-types";

// ---------------------------------------------------------------------------
// MockQRCode - CSS-based QR Code Pattern Component
// ---------------------------------------------------------------------------

function MockQRCode({
	size,
	foregroundColor,
	backgroundColor,
	style,
	className,
}: {
	size: number;
	foregroundColor: string;
	backgroundColor: string;
	style: QRStyle;
	className?: string;
}) {
	const gridSize = 21;
	const cellSize = size / gridSize;

	const pattern = useMemo(() => {
		const grid: boolean[][] = [];
		for (let row = 0; row < gridSize; row++) {
			grid[row] = [];
			for (let col = 0; col < gridSize; col++) {
				const isTopLeftFinder = row < 7 && col < 7;
				const isTopRightFinder = row < 7 && col >= gridSize - 7;
				const isBottomLeftFinder = row >= gridSize - 7 && col < 7;

				if (isTopLeftFinder || isTopRightFinder || isBottomLeftFinder) {
					const localRow = row % 7;
					const localCol = col % 7;
					const isOuter = localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6;
					const isInner = localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;
					grid[row][col] = isOuter || isInner;
				} else if (row === 6 || col === 6) {
					grid[row][col] = (row + col) % 2 === 0;
				} else {
					const seed = (row * 31 + col * 17) % 100;
					grid[row][col] = seed < 45;
				}
			}
		}
		return grid;
	}, []);

	const getBorderRadius = () => {
		switch (style) {
			case "rounded":
				return cellSize * 0.3;
			case "dots":
				return cellSize * 0.5;
			default:
				return 0;
		}
	};

	return (
		<div
			className={cn("relative overflow-hidden", className)}
			style={{
				width: size,
				height: size,
				backgroundColor,
			}}
		>
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={t`QR Code preview`}>
				{pattern.map((row, rowIndex) =>
					row.map((cell, colIndex) => {
						if (!cell) return null;
						const x = colIndex * cellSize;
						const y = rowIndex * cellSize;
						const radius = getBorderRadius();

						if (style === "dots") {
							return (
								<circle
									key={`${rowIndex}-${colIndex}`}
									cx={x + cellSize / 2}
									cy={y + cellSize / 2}
									r={cellSize * 0.4}
									fill={foregroundColor}
								/>
							);
						}

						return (
							<rect
								key={`${rowIndex}-${colIndex}`}
								x={x}
								y={y}
								width={cellSize}
								height={cellSize}
								rx={radius}
								ry={radius}
								fill={foregroundColor}
							/>
						);
					}),
				)}
			</svg>
		</div>
	);
}

// ---------------------------------------------------------------------------
// HeroSection
// ---------------------------------------------------------------------------

export function HeroSection({ savedQRCodesCount, totalScans }: { savedQRCodesCount: number; totalScans: number }) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.7 0.18 200 / 0.15) 0%, oklch(0.6 0.2 260 / 0.1) 50%, oklch(0.65 0.15 320 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Animated background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/10 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 10, 0],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-purple-500/15 to-pink-500/10 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [0, -10, 0],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				/>
			</div>

			<div className="relative z-10">
				<motion.div
					className="mb-3 flex items-center gap-2"
					initial={false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
				>
					<SparkleIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>IMTA Tools</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>QR Code Generator</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Create custom QR codes for your resumes. Easily share your professional profiles with recruiters and track
						scan statistics.
					</Trans>
				</motion.p>

				{/* Quick Stats */}
				<motion.div
					className="flex flex-wrap items-center gap-6"
					initial={false}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
							<QrCodeIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{savedQRCodesCount}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>QR Codes</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<EyeIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{totalScans.toLocaleString("fr-FR")}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Total scans</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<TrendUpIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">+23%</p>
							<p className="text-muted-foreground text-sm">
								<Trans>This month</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

// ---------------------------------------------------------------------------
// GeneratorTab
// ---------------------------------------------------------------------------

export function GeneratorTab({
	url,
	setUrl,
	foregroundColor,
	setForegroundColor,
	backgroundColor,
	setBackgroundColor,
	size,
	setSize,
	style,
	setStyle,
	showEmbedCode,
	setShowEmbedCode,
	embedCode,
	isSaving,
	handleCopyUrl,
	handleCopyEmbedCode,
	handleDownload,
	handleSaveQRCode,
	handleReset,
}: {
	url: string;
	setUrl: (url: string) => void;
	foregroundColor: string;
	setForegroundColor: (color: string) => void;
	backgroundColor: string;
	setBackgroundColor: (color: string) => void;
	size: QRSize;
	setSize: (size: QRSize) => void;
	style: QRStyle;
	setStyle: (style: QRStyle) => void;
	showEmbedCode: boolean;
	setShowEmbedCode: (show: boolean) => void;
	embedCode: string;
	isSaving: boolean;
	handleCopyUrl: () => void;
	handleCopyEmbedCode: () => void;
	handleDownload: (format: "png" | "svg") => void;
	handleSaveQRCode: () => void;
	handleReset: () => void;
}) {
	return (
		<div className="grid gap-8 lg:grid-cols-2">
			{/* Configuration Panel */}
			<Card className="border-2 border-primary/20">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-xl">
						<PaletteIcon className="size-5 text-primary" weight="duotone" />
						<Trans>QR Code Configuration</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Customize the appearance of your QR code</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* URL Input */}
					<div className="space-y-2">
						<Label>
							<Trans>Resume URL *</Trans>
						</Label>
						<div className="flex gap-2">
							<div className="relative flex-1">
								<LinkIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder={t`https://your-resume.com/profile`}
									className="pl-10"
									value={url}
									onChange={(e) => setUrl(e.target.value)}
								/>
							</div>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="icon"
										onClick={handleCopyUrl}
										disabled={!url}
										aria-label={t`Copy URL`}
									>
										<CopyIcon className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<Trans>Copy URL</Trans>
								</TooltipContent>
							</Tooltip>
						</div>
					</div>

					<Separator />

					{/* Color Selection */}
					<div className="grid gap-6 sm:grid-cols-2">
						{/* Foreground Color */}
						<div className="space-y-3">
							<Label>
								<Trans>QR color</Trans>
							</Label>
							<div className="flex flex-wrap gap-2">
								{predefinedColors.map((color) => (
									<Tooltip key={color.value}>
										<TooltipTrigger asChild>
											<button
												type="button"
												className={cn(
													"size-8 rounded-lg border-2 transition-all hover:scale-110",
													foregroundColor === color.value ? "border-primary ring-2 ring-primary/50" : "border-muted",
												)}
												style={{ backgroundColor: color.value }}
												onClick={() => setForegroundColor(color.value)}
												aria-label={`${color.name} - ${color.value}`}
											/>
										</TooltipTrigger>
										<TooltipContent>{color.name}</TooltipContent>
									</Tooltip>
								))}
							</div>
							<div className="flex items-center gap-2">
								<Input
									type="color"
									value={foregroundColor}
									onChange={(e) => setForegroundColor(e.target.value)}
									className="size-10 cursor-pointer rounded-lg p-1"
									aria-label={t`QR color - picker`}
								/>
								<Input
									type="text"
									value={foregroundColor}
									onChange={(e) => setForegroundColor(e.target.value)}
									className="flex-1 font-mono text-sm uppercase"
									maxLength={7}
									aria-label={t`QR color - hex code`}
								/>
							</div>
						</div>

						{/* Background Color */}
						<div className="space-y-3">
							<Label>
								<Trans>Background color</Trans>
							</Label>
							<div className="flex flex-wrap gap-2">
								{predefinedBackgroundColors.map((color) => (
									<Tooltip key={color.value}>
										<TooltipTrigger asChild>
											<button
												type="button"
												className={cn(
													"size-8 rounded-lg border-2 transition-all hover:scale-110",
													backgroundColor === color.value ? "border-primary ring-2 ring-primary/50" : "border-muted",
												)}
												style={{ backgroundColor: color.value }}
												onClick={() => setBackgroundColor(color.value)}
												aria-label={`${color.name} - ${color.value}`}
											/>
										</TooltipTrigger>
										<TooltipContent>{color.name}</TooltipContent>
									</Tooltip>
								))}
							</div>
							<div className="flex items-center gap-2">
								<Input
									type="color"
									value={backgroundColor}
									onChange={(e) => setBackgroundColor(e.target.value)}
									className="size-10 cursor-pointer rounded-lg p-1"
									aria-label={t`Background color - picker`}
								/>
								<Input
									type="text"
									value={backgroundColor}
									onChange={(e) => setBackgroundColor(e.target.value)}
									className="flex-1 font-mono text-sm uppercase"
									maxLength={7}
									aria-label={t`Background color - hex code`}
								/>
							</div>
						</div>
					</div>

					<Separator />

					{/* Size Selection */}
					<div className="space-y-3">
						<Label>
							<Trans>Size</Trans>
						</Label>
						<div className="grid grid-cols-3 gap-3">
							{(Object.entries(sizeConfig) as [QRSize, (typeof sizeConfig)[QRSize]][]).map(([key, config]) => (
								<button
									key={key}
									type="button"
									className={cn(
										"flex cursor-pointer flex-col items-center rounded-lg border-2 p-3 transition-all hover:bg-muted/50",
										size === key ? "border-primary bg-primary/10" : "border-muted",
									)}
									onClick={() => setSize(key)}
									aria-pressed={size === key}
									aria-label={`${config.label} - ${config.description}`}
								>
									<span className="font-medium text-sm">{config.label}</span>
									<span className="text-muted-foreground text-xs">{config.description}</span>
								</button>
							))}
						</div>
					</div>

					<Separator />

					{/* Style Selection */}
					<div className="space-y-3">
						<Label>
							<Trans>Style</Trans>
						</Label>
						<div className="grid grid-cols-3 gap-3">
							{(Object.entries(styleConfig) as [QRStyle, (typeof styleConfig)[QRStyle]][]).map(([key, config]) => {
								const IconComponent = config.icon;
								return (
									<button
										key={key}
										type="button"
										className={cn(
											"flex cursor-pointer flex-col items-center rounded-lg border-2 p-3 transition-all hover:bg-muted/50",
											style === key ? "border-primary bg-primary/10" : "border-muted",
										)}
										onClick={() => setStyle(key)}
										aria-pressed={style === key}
										aria-label={`${config.label} - ${config.description}`}
									>
										<IconComponent
											className={cn("mb-1 size-5", style === key ? "text-primary" : "text-muted-foreground")}
											aria-hidden="true"
										/>
										<span className="font-medium text-sm">{config.label}</span>
										<span className="text-muted-foreground text-xs">{config.description}</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-wrap gap-3 pt-4">
						<Button className="flex-1 gap-2" size="lg" onClick={handleSaveQRCode} disabled={!url || isSaving}>
							<PlusCircleIcon className="size-5" />
							{isSaving ? <Trans>Saving...</Trans> : <Trans>Save</Trans>}
						</Button>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="outline" size="lg" onClick={handleReset} aria-label={t`Reset settings`}>
									<ArrowCounterClockwiseIcon className="size-5" aria-hidden="true" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<Trans>Reset</Trans>
							</TooltipContent>
						</Tooltip>
					</div>
				</CardContent>
			</Card>

			{/* Preview Panel */}
			<div className="space-y-6">
				{/* QR Code Preview */}
				<Card className="border-2 border-primary/20">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-xl">
							<EyeIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Preview</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Preview of your QR code</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col items-center space-y-6">
						{/* QR Code Display */}
						<motion.div
							key={`${foregroundColor}-${backgroundColor}-${size}-${style}`}
							initial={false}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.3 }}
							className="rounded-2xl border-4 border-muted p-4 shadow-lg"
							style={{ backgroundColor }}
							data-qr-preview=""
						>
							{url ? (
								<MockQRCode
									size={sizeConfig[size].pixels > 256 ? 256 : sizeConfig[size].pixels}
									foregroundColor={foregroundColor}
									backgroundColor={backgroundColor}
									style={style}
								/>
							) : (
								<div
									className="flex items-center justify-center text-muted-foreground"
									style={{ width: 256, height: 256 }}
								>
									<div className="text-center">
										<QrCodeIcon className="mx-auto mb-2 size-16 opacity-30" />
										<p className="text-sm">
											<Trans>Enter a URL to generate the QR code</Trans>
										</p>
									</div>
								</div>
							)}
						</motion.div>

						{/* Download Buttons */}
						<div className="flex gap-3">
							<Button variant="outline" className="gap-2" onClick={() => handleDownload("png")} disabled={!url}>
								<FilePngIcon className="size-4" />
								<Trans>Download PNG</Trans>
							</Button>
							<Button variant="outline" className="gap-2" onClick={() => handleDownload("svg")} disabled={!url}>
								<FileSvgIcon className="size-4" />
								<Trans>Download SVG</Trans>
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Embed Code */}
				<Card>
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2 text-lg">
								<CodeIcon className="size-5 text-primary" weight="duotone" />
								<Trans>Embed code</Trans>
							</CardTitle>
							<Switch checked={showEmbedCode} onCheckedChange={setShowEmbedCode} aria-label={t`Show embed code`} />
						</div>
					</CardHeader>
					<AnimatePresence>
						{showEmbedCode && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
							>
								<CardContent className="pt-0">
									<div className="space-y-3">
										<p className="text-muted-foreground text-sm">
											<Trans>Copy this code to embed the QR code on your website</Trans>
										</p>
										<div className="relative">
											<Textarea
												value={embedCode}
												readOnly
												className="min-h-24 resize-none font-mono text-xs"
												placeholder={t`Enter a URL to generate the code`}
												aria-label={t`HTML embed code`}
											/>
											<Button
												variant="ghost"
												size="sm"
												className="absolute top-2 right-2"
												onClick={handleCopyEmbedCode}
												disabled={!embedCode}
												aria-label={t`Copy embed code`}
											>
												<CopyIcon className="size-4" aria-hidden="true" />
											</Button>
										</div>
									</div>
								</CardContent>
							</motion.div>
						)}
					</AnimatePresence>
				</Card>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// MyCodesTab
// ---------------------------------------------------------------------------

export function MyCodesTab({
	savedQRCodes,
	isLoading,
	onLoad,
	onDownload,
	onDelete,
	onCreateNew,
}: {
	savedQRCodes: SavedQRCode[];
	isLoading: boolean;
	onLoad: (qr: SavedQRCode) => void;
	onDownload: (format: "png" | "svg") => void;
	onDelete: (id: string) => void;
	onCreateNew: () => void;
}) {
	if (isLoading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-16">
					<div className="text-center">
						<div className="mb-4 inline-block size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						<p className="text-muted-foreground">
							<Trans>Loading QR codes...</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (savedQRCodes.length === 0) {
		return (
			<Card className="border-dashed">
				<CardContent className="flex flex-col items-center justify-center py-16">
					<QrCodeIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
					<h3 className="mb-2 font-semibold text-lg">
						<Trans>No saved QR codes</Trans>
					</h3>
					<p className="mb-4 text-center text-muted-foreground">
						<Trans>Create your first QR code to find it here</Trans>
					</p>
					<Button onClick={onCreateNew}>
						<PlusCircleIcon className="mr-2 size-4" />
						<Trans>Create a QR code</Trans>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{savedQRCodes.map((qr, index) => (
				<motion.div key={qr.id} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
					<Card className="group h-full transition-all hover:shadow-lg">
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between">
								<div>
									<CardTitle className="text-lg">{qr.name}</CardTitle>
									<CardDescription className="line-clamp-1">{qr.url}</CardDescription>
								</div>
								<Badge variant="outline" className="gap-1">
									<EyeIcon className="size-3" />
									{qr.scans.toLocaleString("fr-FR")}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* QR Preview */}
							<div className="flex justify-center">
								<div className="rounded-xl border-2 border-muted p-2" style={{ backgroundColor: qr.backgroundColor }}>
									<MockQRCode
										size={120}
										foregroundColor={qr.foregroundColor}
										backgroundColor={qr.backgroundColor}
										style={qr.style}
									/>
								</div>
							</div>

							{/* Info */}
							<div className="space-y-2 text-sm">
								<div className="flex items-center justify-between text-muted-foreground">
									<span>
										<Trans>Size</Trans>
									</span>
									<span className="font-medium">{sizeConfig[qr.size].label}</span>
								</div>
								<div className="flex items-center justify-between text-muted-foreground">
									<span>
										<Trans>Style</Trans>
									</span>
									<span className="font-medium">{styleConfig[qr.style].label}</span>
								</div>
								<div className="flex items-center justify-between text-muted-foreground">
									<span>
										<Trans>Created on</Trans>
									</span>
									<span className="font-medium">
										{formatDate(qr.createdAt, { day: "numeric", month: "short", year: "numeric" })}
									</span>
								</div>
							</div>

							{/* Actions */}
							<div className="flex gap-2 pt-2">
								<Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => onLoad(qr)}>
									<PaletteIcon className="size-4" />
									<Trans>Edit</Trans>
								</Button>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="outline" size="sm" onClick={() => onDownload("png")} aria-label={t`Download`}>
											<DownloadSimpleIcon className="size-4" aria-hidden="true" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<Trans>Download</Trans>
									</TooltipContent>
								</Tooltip>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="ghost" size="sm" onClick={() => onDelete(qr.id)} aria-label={t`Delete`}>
											<TrashIcon className="size-4 text-red-500" aria-hidden="true" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<Trans>Delete</Trans>
									</TooltipContent>
								</Tooltip>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	);
}

// ---------------------------------------------------------------------------
// StatisticsTab
// ---------------------------------------------------------------------------

export function StatisticsTab({
	isLoading,
	totalScans,
	todayScans,
	savedQRCodesCount,
	scanStatistics,
	deviceStatistics,
	locationStatistics,
}: {
	isLoading: boolean;
	totalScans: number;
	todayScans: number;
	savedQRCodesCount: number;
	scanStatistics: { date: string; scans: number }[];
	deviceStatistics: { device: string; count: number; percentage: number; color: string }[];
	locationStatistics: { location: string; count: number }[];
}) {
	if (isLoading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-16">
					<div className="text-center">
						<div className="mb-4 inline-block size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						<p className="text-muted-foreground">
							<Trans>Loading statistics...</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const conversionRate = totalScans > 0 ? `${Math.round((todayScans / totalScans) * 100)}%` : "0%";

	const statsOverview = [
		{ label: t`Total scans`, value: totalScans, icon: EyeIcon, color: "blue" },
		{ label: t`Scans today`, value: todayScans, icon: TrendUpIcon, color: "green" },
		{ label: t`Active QR codes`, value: savedQRCodesCount, icon: QrCodeIcon, color: "purple" },
		{ label: t`Conversion rate`, value: conversionRate, icon: CheckCircleIcon, color: "amber" },
	];

	return (
		<>
			{/* Stats Overview */}
			<div className="grid gap-6 md:grid-cols-4">
				{statsOverview.map((stat, index) => (
					<motion.div
						key={stat.label}
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card className="transition-all hover:shadow-md">
							<CardContent className="flex items-center gap-4 p-6">
								<div
									className={cn(
										"flex size-12 items-center justify-center rounded-xl",
										stat.color === "blue" && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
										stat.color === "green" && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
										stat.color === "purple" &&
											"bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
										stat.color === "amber" && "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
									)}
								>
									<stat.icon className="size-6" weight="duotone" />
								</div>
								<div>
									<p className="font-bold text-2xl">
										{typeof stat.value === "number" ? stat.value.toLocaleString("fr-FR") : stat.value}
									</p>
									<p className="text-muted-foreground text-sm">{stat.label}</p>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>

			{/* Scans Over Time Chart */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendUpIcon className="size-5 text-primary" weight="duotone" />
						<Trans>Scans over time</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Scan trends over the last 30 days</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={scanStatistics} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
								<defs>
									<linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
								<XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
								<YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
								<RechartsTooltip
									contentStyle={{
										backgroundColor: "hsl(var(--card))",
										border: "1px solid hsl(var(--border))",
										borderRadius: "8px",
									}}
								/>
								<Area
									type="monotone"
									dataKey="scans"
									stroke="#6366f1"
									fillOpacity={1}
									fill="url(#colorScans)"
									strokeWidth={2}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-8 lg:grid-cols-2">
				{/* Device Statistics */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<DeviceMobileIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Devices</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Scan distribution by device type</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-6 sm:grid-cols-2">
							{/* Pie Chart */}
							<div className="h-48">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={deviceStatistics}
											dataKey="count"
											nameKey="device"
											cx="50%"
											cy="50%"
											innerRadius={40}
											outerRadius={70}
											paddingAngle={2}
										>
											{deviceStatistics.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Pie>
										<RechartsTooltip
											contentStyle={{
												backgroundColor: "hsl(var(--card))",
												border: "1px solid hsl(var(--border))",
												borderRadius: "8px",
											}}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>

							{/* Legend */}
							<div className="flex flex-col justify-center space-y-3">
								{deviceStatistics.map((device) => (
									<div key={device.device} className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="size-3 rounded-full" style={{ backgroundColor: device.color }} />
											<span className="font-medium text-sm">{device.device}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-muted-foreground text-sm">{device.count.toLocaleString("fr-FR")}</span>
											<Badge variant="outline">{device.percentage}%</Badge>
										</div>
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Location Statistics */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPinIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Locations</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Geographic distribution of scans</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={locationStatistics}
									layout="vertical"
									margin={{ top: 0, right: 30, left: 80, bottom: 0 }}
								>
									<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
									<XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
									<YAxis
										dataKey="location"
										type="category"
										tick={{ fontSize: 12 }}
										stroke="hsl(var(--muted-foreground))"
									/>
									<RechartsTooltip
										contentStyle={{
											backgroundColor: "hsl(var(--card))",
											border: "1px solid hsl(var(--border))",
											borderRadius: "8px",
										}}
									/>
									<Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}

// ---------------------------------------------------------------------------
// PrintTab
// ---------------------------------------------------------------------------

export function PrintTab({
	savedQRCodes,
	printSize,
	setPrintSize,
	includeLabel,
	setIncludeLabel,
	includeLogo,
	setIncludeLogo,
	handlePrint,
	handleDownload,
}: {
	savedQRCodes: SavedQRCode[];
	printSize: "card" | "a4" | "custom";
	setPrintSize: (size: "card" | "a4" | "custom") => void;
	includeLabel: boolean;
	setIncludeLabel: (include: boolean) => void;
	includeLogo: boolean;
	setIncludeLogo: (include: boolean) => void;
	handlePrint: () => void;
	handleDownload: (format: "png" | "svg") => void;
}) {
	return (
		<>
			<div className="grid gap-8 lg:grid-cols-2">
				{/* Print Settings */}
				<Card className="border-2 border-primary/20">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-xl">
							<PrinterIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Print options</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Configure settings for printing</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Select QR Code */}
						<div className="space-y-2">
							<Label>
								<Trans>Select a QR code</Trans>
							</Label>
							<Select defaultValue={savedQRCodes[0]?.id}>
								<SelectTrigger>
									<SelectValue placeholder={t`Choose a QR code`} />
								</SelectTrigger>
								<SelectContent>
									{savedQRCodes.map((qr) => (
										<SelectItem key={qr.id} value={qr.id}>
											{qr.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<Separator />

						{/* Print Size */}
						<div className="space-y-3">
							<Label>
								<Trans>Print format</Trans>
							</Label>
							<div className="grid grid-cols-3 gap-3">
								{printFormatOptions.map((format) => (
									<button
										key={format.value}
										type="button"
										className={cn(
											"flex cursor-pointer flex-col items-center rounded-lg border-2 p-3 transition-all hover:bg-muted/50",
											printSize === format.value ? "border-primary bg-primary/10" : "border-muted",
										)}
										onClick={() => setPrintSize(format.value as typeof printSize)}
										aria-pressed={printSize === format.value}
										aria-label={`${format.label} - ${format.size}`}
									>
										<span className="font-medium text-sm">{format.label}</span>
										<span className="text-muted-foreground text-xs">{format.size}</span>
									</button>
								))}
							</div>
						</div>

						<Separator />

						{/* Additional Options */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label>
										<Trans>Include label</Trans>
									</Label>
									<p className="text-muted-foreground text-sm">
										<Trans>Show resume name under QR code</Trans>
									</p>
								</div>
								<Switch checked={includeLabel} onCheckedChange={setIncludeLabel} aria-label={t`Include label`} />
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>
										<Trans>Include logo</Trans>
									</Label>
									<p className="text-muted-foreground text-sm">
										<Trans>Add a logo to the center of the QR code</Trans>
									</p>
								</div>
								<Switch checked={includeLogo} onCheckedChange={setIncludeLogo} aria-label={t`Include logo`} />
							</div>
						</div>

						{/* Print Button */}
						<Button className="w-full gap-2" size="lg" onClick={handlePrint}>
							<PrinterIcon className="size-5" />
							<Trans>Print</Trans>
						</Button>
					</CardContent>
				</Card>

				{/* Print Preview */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-xl">
							<EyeIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Print preview</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>View the final rendering</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						{/* Print Preview Mock */}
						<div
							className={cn(
								"flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white shadow-lg",
								printSize === "card" && "h-[200px] w-[320px]",
								printSize === "a4" && "h-[400px] w-[300px]",
								printSize === "custom" && "h-[300px] w-[300px]",
							)}
						>
							<MockQRCode
								size={printSize === "card" ? 100 : 180}
								foregroundColor={savedQRCodes[0]?.foregroundColor || "#000000"}
								backgroundColor="#ffffff"
								style={savedQRCodes[0]?.style || "square"}
							/>
							{includeLabel && (
								<p className="mt-3 font-medium text-gray-800 text-sm">{savedQRCodes[0]?.name || "Mon CV"}</p>
							)}
							{includeLogo && (
								<div className="mt-2 flex items-center gap-1 text-gray-500 text-xs">
									<GlobeIcon className="size-3" />
									<span>resume.example.com</span>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Print Tips */}
			<Card className="border-primary/30 border-dashed bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
				<CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row">
					<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
						<PrinterIcon className="size-7 text-primary" weight="duotone" />
					</div>
					<div className="flex-1 text-center md:text-left">
						<h3 className="mb-1 font-semibold text-lg">
							<Trans>Tips for optimal printing</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>
								For better readability, print on high-quality paper. Make sure the contrast between the QR code and the
								background is sufficient. Always test scannability before distribution.
							</Trans>
						</p>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" className="gap-2" onClick={() => handleDownload("png")}>
							<DownloadSimpleIcon className="size-4" />
							<Trans>High resolution</Trans>
						</Button>
					</div>
				</CardContent>
			</Card>
		</>
	);
}

// ---------------------------------------------------------------------------
// HelpSection
// ---------------------------------------------------------------------------

export function HelpSection() {
	return (
		<motion.div className="mt-8" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
			<Card className="border-primary/30 border-dashed bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
				<CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row">
					<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20">
						<ShareNetworkIcon className="size-7 text-primary" weight="duotone" />
					</div>
					<div className="flex-1 text-center md:text-left">
						<h3 className="mb-1 font-semibold text-lg">
							<Trans>Share your resume in one scan</Trans>
						</h3>
						<p className="text-muted-foreground text-sm">
							<Trans>
								QR codes are an excellent way to share your resume at networking events, on your business cards, or in
								your presentations. Customize the colors to match your personal brand.
							</Trans>
						</p>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
