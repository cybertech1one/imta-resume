import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowUpIcon,
	BuildingsIcon,
	ChartLineUpIcon,
	CheckCircleIcon,
	CurrencyDollarIcon,
	GlobeIcon,
	LightningIcon,
	MagnifyingGlassIcon,
	MapPinIcon,
	SparkleIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ErrorComponent } from "@/components/error-component";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

import { formatFieldName, formatSkillCategory } from "../-components/display-utils";
import { DashboardHeader } from "../-components/header";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/ai-mentor/market" as any)({
	component: MarketIntelligencePage,
	errorComponent: ErrorComponent,
});

function MarketIntelligencePage() {
	const { data: session } = authClient.useSession();
	const [activeTab, setActiveTab] = useState("overview");

	// Salary prediction form state
	const [salaryForm, setSalaryForm] = useState({
		field: "",
		role: "",
		experienceLevel: "",
		region: "",
		skills: [] as string[],
	});
	const [skillInput, setSkillInput] = useState("");

	// Queries
	const { data: salaryData, isLoading: salaryLoading } = useQuery({
		queryKey: ["market", "salaries"],
		queryFn: () => orpc.marketIntelligence.salaries.list.call({}),
		enabled: !!session?.user,
	});

	const { data: topSkills, isLoading: skillsLoading } = useQuery({
		queryKey: ["market", "skills", "top"],
		queryFn: () => orpc.marketIntelligence.skills.getTop.call({ limit: 10 }),
		enabled: !!session?.user,
	});

	const { data: risingSkills } = useQuery({
		queryKey: ["market", "skills", "rising"],
		queryFn: () => orpc.marketIntelligence.skills.getRising.call({ limit: 5 }),
		enabled: !!session?.user,
	});

	const { data: regions, isLoading: regionsLoading } = useQuery({
		queryKey: ["market", "regions"],
		queryFn: () => orpc.marketIntelligence.regions.list.call({}),
		enabled: !!session?.user,
	});

	const { data: employers, isLoading: employersLoading } = useQuery({
		queryKey: ["market", "employers"],
		queryFn: () => orpc.marketIntelligence.employers.list.call({ isActive: true }),
		enabled: !!session?.user,
	});

	// Salary prediction mutation
	const salaryPrediction = useMutation({
		mutationFn: (data: typeof salaryForm) => orpc.marketIntelligence.salaries.predict.call(data),
	});

	const handleAddSkill = () => {
		if (skillInput.trim() && !salaryForm.skills.includes(skillInput.trim())) {
			setSalaryForm((prev) => ({
				...prev,
				skills: [...prev.skills, skillInput.trim()],
			}));
			setSkillInput("");
		}
	};

	const handleRemoveSkill = (skill: string) => {
		setSalaryForm((prev) => ({
			...prev,
			skills: prev.skills.filter((s) => s !== skill),
		}));
	};

	const handlePredictSalary = () => {
		if (salaryForm.field && salaryForm.role && salaryForm.experienceLevel) {
			salaryPrediction.mutate(salaryForm);
		}
	};

	const formatSalary = (amount: number) => {
		return new Intl.NumberFormat("fr-MA", {
			style: "currency",
			currency: "MAD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	return (
		<div className="min-h-screen">
			<DashboardHeader icon={ChartLineUpIcon} title={t`Intelligence du marché de l'emploi au Maroc`} />

			<div className="container mx-auto px-4 py-6">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full max-w-2xl grid-cols-4">
						<TabsTrigger value="overview">
							<ChartLineUpIcon className="mr-2 h-4 w-4" />
							<Trans>Vue d'ensemble</Trans>
						</TabsTrigger>
						<TabsTrigger value="salary">
							<CurrencyDollarIcon className="mr-2 h-4 w-4" />
							<Trans>Salaires</Trans>
						</TabsTrigger>
						<TabsTrigger value="skills">
							<SparkleIcon className="mr-2 h-4 w-4" />
							<Trans>Compétences</Trans>
						</TabsTrigger>
						<TabsTrigger value="employers">
							<BuildingsIcon className="mr-2 h-4 w-4" />
							<Trans>Employeurs</Trans>
						</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value="overview" className="space-y-6">
						{/* Summary Cards */}
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							<Card>
								<CardHeader className="pb-2">
									<CardDescription>
										<Trans>Offres actives</Trans>
									</CardDescription>
									<CardTitle className="text-2xl">
										{regions?.reduce((sum, r) => sum + (r.totalJobs || 0), 0)?.toLocaleString("fr-FR") || "—"}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center text-green-600 text-sm">
										<ArrowUpIcon className="mr-1 h-4 w-4" />
										+8.5% <Trans>vs mois dernier</Trans>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="pb-2">
									<CardDescription>
										<Trans>Salaire moyen</Trans>
									</CardDescription>
									<CardTitle className="text-2xl">{formatSalary(84000)}</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center text-green-600 text-sm">
										<ArrowUpIcon className="mr-1 h-4 w-4" />
										+5.2% <Trans>croissance</Trans>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="pb-2">
									<CardDescription>
										<Trans>Compétences recherchées</Trans>
									</CardDescription>
									<CardTitle className="text-2xl">{topSkills?.length || 0}</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center text-muted-foreground text-sm">
										<LightningIcon className="mr-1 h-4 w-4" />
										<Trans>Forte demande</Trans>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="pb-2">
									<CardDescription>
										<Trans>Employeurs principaux</Trans>
									</CardDescription>
									<CardTitle className="text-2xl">{employers?.length || 0}</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center text-muted-foreground text-sm">
										<UsersIcon className="mr-1 h-4 w-4" />
										<Trans>Recrutent actuellement</Trans>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Regional Stats */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<MapPinIcon className="h-5 w-5" />
									<Trans>Emplois par région</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Opportunités d'emploi à travers le Maroc</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								{regionsLoading ? (
									<div className="space-y-4">
										{[1, 2, 3, 4].map((i) => (
											<Skeleton key={i} className="h-12 w-full" />
										))}
									</div>
								) : (
									<div className="space-y-4">
										{regions?.slice(0, 6).map((region) => (
											<div key={region.id} className="space-y-2">
												<div className="flex items-center justify-between text-sm">
													<span className="font-medium">{region.regionFr || region.region}</span>
													<div className="flex items-center gap-4">
														<span className="text-muted-foreground">
															{region.totalJobs?.toLocaleString("fr-FR")} <Trans>emplois</Trans>
														</span>
														<Badge
															variant={Number(region.jobGrowth) > 0 ? "default" : "secondary"}
															className={cn(
																Number(region.jobGrowth) > 0
																	? "bg-green-100 text-green-700"
																	: "bg-red-100 text-red-700",
															)}
														>
															{Number(region.jobGrowth) > 0 ? "+" : ""}
															{region.jobGrowth}%
														</Badge>
													</div>
												</div>
												<Progress
													value={
														((region.totalJobs || 0) / Math.max(...(regions?.map((r) => r.totalJobs || 0) || [1]))) *
														100
													}
													className="h-2"
												/>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Rising Skills */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<TrendUpIcon className="h-5 w-5 text-green-600" />
									<Trans>Compétences en hausse</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Compétences avec la demande en plus forte croissance</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
									{risingSkills?.map((skill, idx) => (
										<motion.div
											key={skill.id}
											initial={false}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: idx * 0.1 }}
											className="flex flex-col items-center rounded-lg border p-4 text-center"
										>
											<Badge className="mb-2 bg-green-100 text-green-700">+{skill.growthPercent || 0}%</Badge>
											<span className="font-medium">{skill.skillFr || skill.skill}</span>
											<span className="text-muted-foreground text-xs">
												{skill.averageSalaryBoost || 0} MAD <Trans>bonus salarial</Trans>
											</span>
										</motion.div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Salary Tab */}
					<TabsContent value="salary" className="space-y-6">
						<div className="grid gap-6 lg:grid-cols-2">
							{/* Salary Predictor */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<TargetIcon className="h-5 w-5" />
										<Trans>Prédicteur de salaire</Trans>
									</CardTitle>
									<CardDescription>
										<Trans>Estimez votre valeur sur le marché selon votre profil</Trans>
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label>
												<Trans>Domaine</Trans>
											</Label>
											<Select
												value={salaryForm.field}
												onValueChange={(v) => setSalaryForm((p) => ({ ...p, field: v }))}
											>
												<SelectTrigger>
													<SelectValue placeholder={t`Sélectionner le domaine`} />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="healthcare">
														<Trans>Santé</Trans>
													</SelectItem>
													<SelectItem value="industrial">
														<Trans>Industriel</Trans>
													</SelectItem>
													<SelectItem value="hse">
														<Trans>HSE / Sécurité</Trans>
													</SelectItem>
													<SelectItem value="it">
														<Trans>Informatique</Trans>
													</SelectItem>
													<SelectItem value="finance">
														<Trans>Finance</Trans>
													</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label>
												<Trans>Poste</Trans>
											</Label>
											<Input
												placeholder={t`ex. Infirmier, Technicien HSE`}
												value={salaryForm.role}
												onChange={(e) => setSalaryForm((p) => ({ ...p, role: e.target.value }))}
											/>
										</div>

										<div className="space-y-2">
											<Label>
												<Trans>Niveau d'expérience</Trans>
											</Label>
											<Select
												value={salaryForm.experienceLevel}
												onValueChange={(v) => setSalaryForm((p) => ({ ...p, experienceLevel: v }))}
											>
												<SelectTrigger>
													<SelectValue placeholder={t`Sélectionner le niveau`} />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="entry">
														<Trans>Débutant</Trans>
													</SelectItem>
													<SelectItem value="mid">
														<Trans>Confirmé</Trans>
													</SelectItem>
													<SelectItem value="senior">
														<Trans>Expert</Trans>
													</SelectItem>
													<SelectItem value="lead">
														<Trans>Manager</Trans>
													</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label>
												<Trans>Région</Trans>
											</Label>
											<Select
												value={salaryForm.region}
												onValueChange={(v) => setSalaryForm((p) => ({ ...p, region: v }))}
											>
												<SelectTrigger>
													<SelectValue placeholder={t`Sélectionner la région`} />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="casablanca">Casablanca-Settat</SelectItem>
													<SelectItem value="rabat">Rabat-Salé-Kénitra</SelectItem>
													<SelectItem value="tanger">Tanger-Tétouan-Al Hoceima</SelectItem>
													<SelectItem value="marrakech">Marrakech-Safi</SelectItem>
													<SelectItem value="fes">Fès-Meknès</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className="space-y-2">
										<Label>
											<Trans>Compétences</Trans>
										</Label>
										<div className="flex gap-2">
											<Input
												placeholder={t`Ajouter une compétence`}
												value={skillInput}
												onChange={(e) => setSkillInput(e.target.value)}
												onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
											/>
											<Button type="button" variant="outline" onClick={handleAddSkill}>
												<Trans>Ajouter</Trans>
											</Button>
										</div>
										{salaryForm.skills.length > 0 && (
											<div className="mt-2 flex flex-wrap gap-2">
												{salaryForm.skills.map((skill) => (
													<Badge
														key={skill}
														variant="secondary"
														className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
														onClick={() => handleRemoveSkill(skill)}
													>
														{skill} ×
													</Badge>
												))}
											</div>
										)}
									</div>
								</CardContent>
								<CardFooter>
									<Button
										className="w-full"
										onClick={handlePredictSalary}
										disabled={
											!salaryForm.field || !salaryForm.role || !salaryForm.experienceLevel || salaryPrediction.isPending
										}
									>
										{salaryPrediction.isPending ? (
											<Trans>Calcul en cours...</Trans>
										) : (
											<>
												<SparkleIcon className="mr-2 h-4 w-4" />
												<Trans>Prédire le salaire</Trans>
											</>
										)}
									</Button>
								</CardFooter>
							</Card>

							{/* Prediction Results */}
							<Card>
								<CardHeader>
									<CardTitle>
										<Trans>Votre salaire estimé</Trans>
									</CardTitle>
									<CardDescription>
										<Trans>Basé sur les données du marché marocain</Trans>
									</CardDescription>
								</CardHeader>
								<CardContent>
									{salaryPrediction.data ? (
										<div className="space-y-6">
											<div className="text-center">
												<p className="text-muted-foreground text-sm">
													<Trans>Salaire annuel prédit</Trans>
												</p>
												<p className="font-bold text-4xl text-primary">{formatSalary(salaryPrediction.data.median)}</p>
												<p className="text-muted-foreground text-sm">
													<Trans>par an</Trans>
												</p>
											</div>

											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">
														<Trans>Fourchette</Trans>
													</span>
													<span>
														{formatSalary(salaryPrediction.data.min)} - {formatSalary(salaryPrediction.data.max)}
													</span>
												</div>
												<Progress
													value={
														((salaryPrediction.data.median - salaryPrediction.data.min) /
															(salaryPrediction.data.max - salaryPrediction.data.min)) *
														100
													}
													className="h-3"
												/>
											</div>

											{salaryPrediction.data.factors && salaryPrediction.data.factors.length > 0 && (
												<div className="space-y-2">
													<p className="font-medium text-sm">
														<Trans>Facteurs salariaux</Trans>
													</p>
													<div className="grid gap-2">
														{salaryPrediction.data.factors.map((factor: string, index: number) => (
															<div key={index} className="flex items-center gap-2 rounded-lg border p-2">
																<CheckCircleIcon className="h-4 w-4 text-primary" />
																<span className="text-sm">{factor}</span>
															</div>
														))}
													</div>
												</div>
											)}
										</div>
									) : (
										<div className="flex flex-col items-center justify-center py-8 text-center">
											<CurrencyDollarIcon className="mb-4 h-16 w-16 text-muted-foreground/30" />
											<p className="text-muted-foreground">
												<Trans>Remplissez votre profil pour voir la prédiction salariale</Trans>
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Salary Benchmarks Table */}
						<Card>
							<CardHeader>
								<CardTitle>
									<Trans>Références salariales</Trans>
								</CardTitle>
								<CardDescription>
									<Trans>Salaires moyens par poste et niveau d'expérience</Trans>
								</CardDescription>
							</CardHeader>
							<CardContent>
								{salaryLoading ? (
									<div className="space-y-2">
										{[1, 2, 3, 4, 5].map((i) => (
											<Skeleton key={i} className="h-12 w-full" />
										))}
									</div>
								) : (
									<div className="overflow-x-auto">
										<table className="w-full text-sm">
											<thead>
												<tr className="border-b">
													<th className="py-3 text-left font-medium">
														<Trans>Poste</Trans>
													</th>
													<th className="py-3 text-left font-medium">
														<Trans>Domaine</Trans>
													</th>
													<th className="py-3 text-left font-medium">
														<Trans>Niveau</Trans>
													</th>
													<th className="py-3 text-right font-medium">
														<Trans>Min</Trans>
													</th>
													<th className="py-3 text-right font-medium">
														<Trans>Médian</Trans>
													</th>
													<th className="py-3 text-right font-medium">
														<Trans>Max</Trans>
													</th>
												</tr>
											</thead>
											<tbody>
												{salaryData?.slice(0, 10).map((salary) => (
													<tr key={salary.id} className="border-b">
														<td className="py-3">{salary.roleFr || salary.role}</td>
														<td className="py-3">
															<Badge variant="outline">{salary.field}</Badge>
														</td>
														<td className="py-3">{salary.experienceLevel}</td>
														<td className="py-3 text-right">{formatSalary(salary.salaryMin)}</td>
														<td className="py-3 text-right font-medium">{formatSalary(salary.salaryMedian)}</td>
														<td className="py-3 text-right">{formatSalary(salary.salaryMax)}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Skills Tab */}
					<TabsContent value="skills" className="space-y-6">
						<div className="grid gap-6 lg:grid-cols-2">
							{/* Top Skills */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<StarIcon className="h-5 w-5 text-amber-500" />
										<Trans>Compétences les plus recherchées</Trans>
									</CardTitle>
									<CardDescription>
										<Trans>Compétences activement recherchées par les employeurs</Trans>
									</CardDescription>
								</CardHeader>
								<CardContent>
									{skillsLoading ? (
										<div className="space-y-3">
											{[1, 2, 3, 4, 5].map((i) => (
												<Skeleton key={i} className="h-16 w-full" />
											))}
										</div>
									) : (
										<div className="space-y-3">
											{topSkills?.map((skill, idx) => (
												<motion.div
													key={skill.id}
													initial={false}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: idx * 0.05 }}
													className="flex items-center gap-4 rounded-lg border p-3"
												>
													<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-sm">
														{idx + 1}
													</div>
													<div className="flex-1">
														<p className="font-medium">{skill.skillFr || skill.skill}</p>
														<p className="text-muted-foreground text-xs">
															{formatSkillCategory(skill.category)} • {formatFieldName(skill.field ?? "general")}
														</p>
													</div>
													<div className="text-right">
														<Badge variant="secondary">{skill.demandScore}/100</Badge>
														<p className="text-green-600 text-xs">
															+{skill.averageSalaryBoost || 0}% <Trans>salaire</Trans>
														</p>
													</div>
												</motion.div>
											))}
										</div>
									)}
								</CardContent>
							</Card>

							{/* Skill Categories */}
							<Card>
								<CardHeader>
									<CardTitle>
										<Trans>Catégories de compétences</Trans>
									</CardTitle>
									<CardDescription>
										<Trans>Compétences regroupées par catégorie</Trans>
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{[
											{ key: "technical", label: t`Technique` },
											{ key: "soft skills", label: t`Compétences relationnelles` },
											{ key: "certifications", label: t`Certifications` },
											{ key: "languages", label: t`Langues` },
										].map((category) => (
											<div key={category.key} className="space-y-2">
												<h4 className="font-medium">{category.label}</h4>
												<div className="flex flex-wrap gap-2">
													{topSkills
														?.filter((s) => s.category === category.key)
														.slice(0, 5)
														.map((skill) => (
															<Badge key={skill.id} variant="outline">
																{skill.skillFr || skill.skill}
															</Badge>
														))}
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* Employers Tab */}
					<TabsContent value="employers" className="space-y-6">
						<div className="flex items-center gap-4">
							<div className="relative flex-1">
								<MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input placeholder={t`Rechercher des employeurs...`} className="pl-10" />
							</div>
							<Select defaultValue="all">
								<SelectTrigger className="w-48">
									<SelectValue placeholder={t`Secteur`} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										<Trans>Tous les secteurs</Trans>
									</SelectItem>
									<SelectItem value="healthcare">
										<Trans>Santé</Trans>
									</SelectItem>
									<SelectItem value="automotive">
										<Trans>Automobile</Trans>
									</SelectItem>
									<SelectItem value="banking">
										<Trans>Banque</Trans>
									</SelectItem>
									<SelectItem value="telecom">
										<Trans>Télécom</Trans>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{employersLoading ? (
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<Card key={i}>
										<CardHeader>
											<Skeleton className="h-6 w-32" />
											<Skeleton className="h-4 w-24" />
										</CardHeader>
										<CardContent>
											<Skeleton className="h-16 w-full" />
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{employers?.map((employer) => (
									<motion.div
										key={employer.id}
										initial={false}
										animate={{ opacity: 1, y: 0 }}
										whileHover={{ scale: 1.02 }}
									>
										<Card className="h-full">
											<CardHeader className="pb-2">
												<div className="flex items-start justify-between">
													<div>
														<CardTitle className="text-lg">{employer.nameFr || employer.name}</CardTitle>
														<CardDescription>{employer.industry}</CardDescription>
													</div>
													{employer.isVerified && (
														<Badge variant="default" className="bg-blue-500">
															<Trans>Vérifié</Trans>
														</Badge>
													)}
												</div>
											</CardHeader>
											<CardContent className="space-y-3">
												<div className="flex items-center gap-2 text-muted-foreground text-sm">
													<MapPinIcon className="h-4 w-4" />
													{employer.headquarters}
												</div>
												<div className="flex items-center gap-2 text-muted-foreground text-sm">
													<UsersIcon className="h-4 w-4" />
													{employer.employeeCount} <Trans>employés</Trans>
												</div>
												{employer.openPositions > 0 && (
													<Badge variant="secondary" className="bg-green-100 text-green-700">
														{employer.openPositions} <Trans>postes ouverts</Trans>
													</Badge>
												)}
												{employer.fields && (
													<div className="flex flex-wrap gap-1">
														{(employer.fields as string[]).slice(0, 3).map((field) => (
															<Badge key={field} variant="outline" className="text-xs">
																{field}
															</Badge>
														))}
													</div>
												)}
											</CardContent>
											<CardFooter>
												{employer.website && (
													<Button variant="outline" className="w-full" asChild>
														<a href={employer.website} target="_blank" rel="noopener noreferrer">
															<GlobeIcon className="mr-2 h-4 w-4" />
															<Trans>Visiter le site</Trans>
														</a>
													</Button>
												)}
											</CardFooter>
										</Card>
									</motion.div>
								))}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
