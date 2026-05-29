import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	BriefcaseIcon,
	BuildingsIcon,
	CaretRightIcon,
	CheckCircleIcon,
	CurrencyCircleDollarIcon,
	FactoryIcon,
	FirstAidKitIcon,
	GearIcon,
	GlobeIcon,
	HardHatIcon,
	HospitalIcon,
	LightningIcon,
	LinkedinLogoIcon,
	MagnifyingGlassIcon,
	MapPinIcon,
	SparkleIcon,
	StarIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/jobs/employers" as any)({
	component: EmployersDirectoryPage,
	errorComponent: ErrorComponent,
});

// Types
type Industry = "healthcare" | "industrial" | "manufacturing" | "mining" | "automotive" | "services" | "energy";

interface Employer {
	id: string;
	name: string;
	logo?: string;
	industry: Industry;
	description: string;
	location: string;
	headquarters: string;
	employeeCount: string;
	founded: number;
	website?: string;
	linkedIn?: string;
	openPositions: number;
	fields: ("healthcare" | "industrial" | "hse")[];
	salaryRange: { min: number; max: number };
	benefits: string[];
	culture: string[];
	featured?: boolean;
	hiring?: boolean;
	rating: number;
}

// Industry config - getter function so t`` macro runs at render time
function getIndustryConfig(): Record<Industry, { label: string; icon: Icon; color: string }> {
	return {
		healthcare: {
			label: t`Healthcare`,
			icon: HospitalIcon,
			color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		},
		industrial: {
			label: t`Industry`,
			icon: FactoryIcon,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		manufacturing: {
			label: t`Manufacturing`,
			icon: GearIcon,
			color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
		},
		mining: {
			label: t`Mining & Chemistry`,
			icon: HardHatIcon,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
		automotive: {
			label: t`Automotive`,
			icon: GearIcon,
			color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		},
		services: {
			label: t`Services`,
			icon: BriefcaseIcon,
			color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		},
		energy: {
			label: t`Energy`,
			icon: LightningIcon,
			color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
		},
	};
}

function getFieldConfig() {
	return {
		healthcare: {
			label: t`Healthcare`,
			icon: FirstAidKitIcon,
			color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		},
		industrial: {
			label: t`Industry`,
			icon: GearIcon,
			color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		},
		hse: {
			label: t`HSE`,
			icon: HardHatIcon,
			color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		},
	};
}

// Employer data is now fetched from the database via orpc.employers.list

function getDefaultIndustryInfo() {
	return {
		label: t`Other`,
		icon: BriefcaseIcon,
		color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
	};
}

const ALL_REGIONS_VALUE = "__all__";

function getRegions() {
	return [
		{ value: ALL_REGIONS_VALUE, label: t`All regions` },
		{ value: "Casablanca", label: "Casablanca" },
		{ value: "Rabat", label: "Rabat" },
		{ value: "Tanger", label: "Tanger" },
		{ value: "Marrakech", label: "Marrakech" },
		{ value: "Fes", label: "Fes" },
		{ value: "Agadir", label: "Agadir" },
		{ value: "Autre", label: t`Other` },
	];
}

function EmployersDirectoryPage() {
	const { data: session } = authClient.useSession();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedIndustry, setSelectedIndustry] = useState<Industry | "all">("all");
	const [selectedField, setSelectedField] = useState<"healthcare" | "industrial" | "hse" | "all">("all");
	const [selectedRegion, setSelectedRegion] = useState(ALL_REGIONS_VALUE);
	const [showHiringOnly, setShowHiringOnly] = useState(false);

	// Resolve i18n configs at render time
	const industryConfig = getIndustryConfig();
	const fieldConfig = getFieldConfig();
	const defaultIndustryInfo = getDefaultIndustryInfo();
	const regions = getRegions();

	// Fetch employers from database
	const { data: dbEmployers } = useQuery({
		...orpc.employers.list.queryOptions({ input: { activeOnly: true } }),
		enabled: !!session?.user,
	});

	// Transform database employers to the local Employer interface
	const allEmployers: Employer[] = useMemo(() => {
		if (!dbEmployers || dbEmployers.length === 0) return [];
		return dbEmployers.map((e) => ({
			id: e.id,
			name: e.name || "",
			industry: (e.sector as Industry) || "services",
			description: e.description || e.descriptionFr || "",
			location: e.locationFr || e.location || "",
			headquarters: e.locationFr || e.location || "",
			employeeCount: "",
			founded: 2000,
			website: e.website || undefined,
			openPositions: e.openPositions || 0,
			fields: (e.fields as ("healthcare" | "industrial" | "hse")[]) || [],
			salaryRange: { min: 0, max: 0 },
			benefits: [],
			culture: [],
			featured: (e.sortOrder || 0) <= 5,
			hiring: (e.openPositions || 0) > 0,
			rating: 4.0,
		}));
	}, [dbEmployers]);

	// Filter employers
	const filteredEmployers = useMemo(() => {
		return allEmployers
			.filter((employer) => {
				// Search filter
				if (
					searchQuery &&
					!employer.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
					!employer.description.toLowerCase().includes(searchQuery.toLowerCase())
				) {
					return false;
				}

				// Industry filter
				if (selectedIndustry !== "all" && employer.industry !== selectedIndustry) {
					return false;
				}

				// Field filter
				if (selectedField !== "all" && !employer.fields.includes(selectedField)) {
					return false;
				}

				// Region filter
				if (
					selectedRegion !== ALL_REGIONS_VALUE &&
					!employer.location.toLowerCase().includes(selectedRegion.toLowerCase())
				) {
					return false;
				}

				// Hiring filter
				if (showHiringOnly && !employer.hiring) {
					return false;
				}

				return true;
			})
			.sort((a, b) => {
				// Featured first, then by positions
				if (a.featured && !b.featured) return -1;
				if (!a.featured && b.featured) return 1;
				return b.openPositions - a.openPositions;
			});
	}, [allEmployers, searchQuery, selectedIndustry, selectedField, selectedRegion, showHiringOnly]);

	// Stats
	const totalPositions = allEmployers.reduce((sum, e) => sum + e.openPositions, 0);
	const featuredCount = allEmployers.filter((e) => e.featured).length;

	const formatCurrency = (amount: number) => `${amount.toLocaleString()} DH`;

	const clearFilters = useCallback(() => {
		setSearchQuery("");
		setSelectedIndustry("all");
		setSelectedField("all");
		setSelectedRegion(ALL_REGIONS_VALUE);
		setShowHiringOnly(false);
	}, []);

	const hasFilters =
		searchQuery ||
		selectedIndustry !== "all" ||
		selectedField !== "all" ||
		selectedRegion !== ALL_REGIONS_VALUE ||
		showHiringOnly;

	return (
		<>
			<DashboardHeader icon={BuildingsIcon} title={t`Employer Directory`} />

			{/* Hero Section */}
			<motion.div
				className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
				style={{
					background:
						"linear-gradient(135deg, oklch(0.65 0.18 200 / 0.15) 0%, oklch(0.6 0.2 240 / 0.1) 50%, oklch(0.7 0.15 280 / 0.08) 100%)",
				}}
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
			>
				{/* Animated background */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<motion.div
						className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/10 blur-3xl"
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.5, 0.3, 0.5],
						}}
						transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
					/>
					<motion.div
						className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-purple-500/15 to-pink-500/10 blur-3xl"
						animate={{
							scale: [1.2, 1, 1.2],
							opacity: [0.3, 0.5, 0.3],
						}}
						transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
					/>
				</div>

				<div className="relative z-10">
					<motion.div
						className="mb-3 flex items-center gap-2"
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 }}
					>
						<BuildingsIcon className="size-5 text-primary" weight="fill" />
						<span className="font-semibold text-primary text-sm uppercase tracking-wider">
							<Trans>Partner Employers</Trans>
						</span>
					</motion.div>

					<motion.h2
						className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<Trans>Employer Directory</Trans>
					</motion.h2>

					<motion.p
						className="mb-8 max-w-2xl text-lg text-muted-foreground"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<Trans>
							Discover leading companies in Morocco actively hiring IMTA graduates. Explore their listings, culture, and
							benefits.
						</Trans>
					</motion.p>

					{/* Stats */}
					<motion.div
						className="flex flex-wrap items-center gap-6"
						initial={false}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
								<BuildingsIcon className="size-5 text-primary" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl">{allEmployers.length}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Companies</Trans>
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
								<BriefcaseIcon className="size-5 text-green-500" weight="duotone" />
							</div>
							<div>
								<p className="font-bold text-xl">{totalPositions}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>Postes ouverts</Trans>
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
								<StarIcon className="size-5 text-amber-500" weight="fill" />
							</div>
							<div>
								<p className="font-bold text-xl">{featuredCount}</p>
								<p className="text-muted-foreground text-sm">
									<Trans>En vedette</Trans>
								</p>
							</div>
						</div>
					</motion.div>
				</div>
			</motion.div>

			{/* Filters Section */}
			<Card className="mb-8">
				<CardContent className="p-6">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
						{/* Search */}
						<div className="lg:col-span-2">
							<div className="relative">
								<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder={t`Search for a company...`}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						{/* Industry Filter */}
						<Select value={selectedIndustry} onValueChange={(v) => setSelectedIndustry(v as Industry | "all")}>
							<SelectTrigger>
								<SelectValue placeholder={t`Industrie`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									<Trans>All industries</Trans>
								</SelectItem>
								{(Object.entries(industryConfig) as [Industry, (typeof industryConfig)[Industry]][]).map(
									([key, config]) => {
										const IndustryIcon = config.icon;
										return (
											<SelectItem key={key} value={key}>
												<div className="flex items-center gap-2">
													<IndustryIcon className="size-4" />
													{config.label}
												</div>
											</SelectItem>
										);
									},
								)}
							</SelectContent>
						</Select>

						{/* Field Filter */}
						<Select
							value={selectedField}
							onValueChange={(v) => setSelectedField(v as "healthcare" | "industrial" | "hse" | "all")}
						>
							<SelectTrigger>
								<SelectValue placeholder={t`Domaine`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									<Trans>All domains</Trans>
								</SelectItem>
								{(
									Object.entries(fieldConfig) as [
										"healthcare" | "industrial" | "hse",
										(typeof fieldConfig)["healthcare"],
									][]
								).map(([key, config]) => {
									const FieldIcon = config.icon;
									return (
										<SelectItem key={key} value={key}>
											<div className="flex items-center gap-2">
												<FieldIcon className="size-4" />
												{config.label}
											</div>
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>

						{/* Region Filter */}
						<Select value={selectedRegion} onValueChange={setSelectedRegion}>
							<SelectTrigger>
								<SelectValue placeholder={t`Region`} />
							</SelectTrigger>
							<SelectContent>
								{regions.map((region) => (
									<SelectItem key={region.value} value={region.value}>
										<div className="flex items-center gap-2">
											<MapPinIcon className="size-4" />
											{region.label}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Filter Actions */}
					<div className="mt-4 flex flex-wrap items-center justify-between gap-4">
						<div className="flex flex-wrap items-center gap-2">
							<Button
								variant={showHiringOnly ? "default" : "outline"}
								size="sm"
								onClick={() => setShowHiringOnly(!showHiringOnly)}
								className="gap-2"
							>
								<LightningIcon className="size-4" />
								<Trans>Recrutent actuellement</Trans>
							</Button>
							{hasFilters && (
								<Button variant="ghost" size="sm" onClick={clearFilters}>
									<Trans>Clear filters</Trans>
								</Button>
							)}
						</div>
						<p className="text-muted-foreground text-sm">
							{filteredEmployers.length} <Trans>entreprise(s) trouvee(s)</Trans>
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Employers Grid */}
			<AnimatePresence mode="popLayout">
				{filteredEmployers.length > 0 ? (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{filteredEmployers.map((employer, index) => {
							const industryInfo = industryConfig[employer.industry] ?? defaultIndustryInfo;
							const IndustryIcon = industryInfo.icon;
							return (
								<motion.div
									key={employer.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ delay: index * 0.05 }}
								>
									<Card
										className={cn(
											"group h-full transition-all hover:shadow-lg",
											employer.featured && "border-2 border-amber-500/30",
										)}
									>
										<CardHeader className="pb-3">
											<div className="flex items-start justify-between gap-3">
												<div className="flex items-center gap-3">
													<div
														className={cn("flex size-12 items-center justify-center rounded-xl", industryInfo.color)}
													>
														<IndustryIcon className="size-6" weight="duotone" />
													</div>
													<div>
														<CardTitle className="line-clamp-1 text-lg">{employer.name}</CardTitle>
														<CardDescription className="flex items-center gap-1">
															<MapPinIcon className="size-3" />
															{employer.headquarters}
														</CardDescription>
													</div>
												</div>
												{employer.featured && (
													<Badge className="shrink-0 gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
														<StarIcon className="size-3" weight="fill" />
														<Trans>Vedette</Trans>
													</Badge>
												)}
											</div>
										</CardHeader>
										<CardContent className="space-y-4">
											<p className="line-clamp-2 text-muted-foreground text-sm">{employer.description}</p>

											{/* Fields */}
											<div className="flex flex-wrap gap-1">
												{employer.fields.map((field) => {
													const config = fieldConfig[field as keyof typeof fieldConfig];
													if (!config) return null;
													const FieldIcon = config.icon;
													return (
														<Badge key={field} variant="outline" className="text-xs">
															<FieldIcon className="mr-1 size-3" />
															{config.label}
														</Badge>
													);
												})}
											</div>

											{/* Stats */}
											<div className="grid grid-cols-2 gap-3">
												<div className="rounded-lg bg-muted/50 p-2 text-center">
													<p className="font-bold text-lg">{employer.openPositions}</p>
													<p className="text-muted-foreground text-xs">
														<Trans>Postes</Trans>
													</p>
												</div>
												<div className="rounded-lg bg-muted/50 p-2 text-center">
													<p className="font-bold text-lg">{employer.employeeCount}</p>
													<p className="text-muted-foreground text-xs">
														<Trans>Employes</Trans>
													</p>
												</div>
											</div>

											{/* Salary Range */}
											<div className="flex items-center justify-between rounded-lg border bg-muted/30 p-2">
												<div className="flex items-center gap-2">
													<CurrencyCircleDollarIcon className="size-4 text-green-500" />
													<span className="text-sm">
														<Trans>Salary</Trans>
													</span>
												</div>
												<span className="font-medium text-sm">
													{formatCurrency(employer.salaryRange.min)} - {formatCurrency(employer.salaryRange.max)}
												</span>
											</div>

											{/* Rating */}
											<div className="flex items-center gap-2">
												<div className="flex items-center gap-1">
													{[1, 2, 3, 4, 5].map((star) => (
														<StarIcon
															key={star}
															className={cn(
																"size-4",
																star <= Math.floor(employer.rating) ? "text-amber-500" : "text-muted-foreground/30",
															)}
															weight={star <= Math.floor(employer.rating) ? "fill" : "regular"}
														/>
													))}
												</div>
												<span className="font-medium text-sm">{employer.rating}</span>
											</div>

											{/* Benefits Preview */}
											<div className="flex flex-wrap gap-1">
												{employer.benefits.slice(0, 2).map((benefit) => (
													<Badge key={benefit} variant="secondary" className="text-xs">
														<CheckCircleIcon className="mr-1 size-3" />
														{benefit}
													</Badge>
												))}
												{employer.benefits.length > 2 && (
													<Badge variant="secondary" className="text-xs">
														+{employer.benefits.length - 2}
													</Badge>
												)}
											</div>

											{/* Actions */}
											<div className="flex gap-2 pt-2">
												{employer.hiring && (
													// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
													<Link to={"/dashboard/jobs" as any} className="flex-1">
														<Button className="w-full gap-2" size="sm">
															<Trans>View offers</Trans>
															<ArrowRightIcon className="size-4" />
														</Button>
													</Link>
												)}
												{employer.website && (
													<Button variant="outline" size="sm" asChild>
														<a href={employer.website} target="_blank" rel="noopener noreferrer">
															<GlobeIcon className="size-4" />
														</a>
													</Button>
												)}
												{employer.linkedIn && (
													<Button variant="outline" size="sm" asChild>
														<a href={employer.linkedIn} target="_blank" rel="noopener noreferrer">
															<LinkedinLogoIcon className="size-4" />
														</a>
													</Button>
												)}
											</div>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</div>
				) : (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-16">
							<BuildingsIcon className="mb-4 size-16 text-muted-foreground/50" weight="duotone" />
							<h3 className="mb-2 font-semibold text-lg">
								<Trans>No companies found</Trans>
							</h3>
							<p className="mb-4 text-center text-muted-foreground">
								<Trans>Try changing your search filters</Trans>
							</p>
							<Button onClick={clearFilters}>
								<Trans>Clear filters</Trans>
							</Button>
						</CardContent>
					</Card>
				)}
			</AnimatePresence>

			{/* CTA Section */}
			<Card className="mt-8 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
				<CardContent className="flex flex-col items-center py-8 text-center">
					<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
						<SparkleIcon className="size-8 text-primary" weight="fill" />
					</div>
					<h3 className="mb-2 font-bold text-2xl">
						<Trans>Pret a postuler?</Trans>
					</h3>
					<p className="mb-6 max-w-md text-muted-foreground">
						<Trans>
							Create a professional resume tailored to Moroccan companies and prepare your interviews with our
							comprehensive platform.
						</Trans>
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Link to="/dashboard/resumes">
							<Button size="lg" className="gap-2">
								<Trans>Create my resume</Trans>
								<CaretRightIcon className="size-5" />
							</Button>
						</Link>
						{/* biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree */}
						<Link to={"/dashboard/interview" as any}>
							<Button size="lg" variant="outline" className="gap-2">
								<Trans>Prepare my interviews</Trans>
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</>
	);
}
