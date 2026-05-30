import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CheckCircleIcon, CircleNotchIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EXPERIENCE_LEVELS, FIELDS, JOB_TYPES, REGIONS, REMOTE_OPTIONS } from "./recommendations-config";
import type { PreferencesDialogProps } from "./recommendations-types";

export function PreferencesDialog({ open, onOpenChange, preferences, onSave, isLoading }: PreferencesDialogProps) {
	const [localPrefs, setLocalPrefs] = useState<NonNullable<PreferencesDialogProps["preferences"]>>({
		preferredFields: preferences?.preferredFields || [],
		preferredRegions: preferences?.preferredRegions || [],
		preferredLocations: preferences?.preferredLocations || [],
		minSalary: preferences?.minSalary || undefined,
		maxSalary: preferences?.maxSalary || undefined,
		jobTypes: preferences?.jobTypes || [],
		experienceLevel: preferences?.experienceLevel || undefined,
		remotePreference: preferences?.remotePreference || "hybrid",
		willingToRelocate: preferences?.willingToRelocate || false,
		keywords: preferences?.keywords || [],
		excludedCompanies: preferences?.excludedCompanies || [],
		prioritySkills: preferences?.prioritySkills || [],
	});

	const [keywordInput, setKeywordInput] = useState("");
	const [skillInput, setSkillInput] = useState("");
	const [companyInput, setCompanyInput] = useState("");

	// Update local state when preferences load
	useEffect(() => {
		if (preferences) {
			setLocalPrefs({
				preferredFields: preferences?.preferredFields || [],
				preferredRegions: preferences?.preferredRegions || [],
				preferredLocations: preferences?.preferredLocations || [],
				minSalary: preferences?.minSalary || undefined,
				maxSalary: preferences?.maxSalary || undefined,
				jobTypes: preferences?.jobTypes || [],
				experienceLevel: preferences?.experienceLevel || undefined,
				remotePreference: preferences?.remotePreference || "hybrid",
				willingToRelocate: preferences?.willingToRelocate || false,
				keywords: preferences?.keywords || [],
				excludedCompanies: preferences?.excludedCompanies || [],
				prioritySkills: preferences?.prioritySkills || [],
			});
		}
	}, [preferences]);

	const toggleArrayItem = (array: string[] | undefined, item: string): string[] => {
		const arr = array || [];
		return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
	};

	const addToArray = (array: string[] | undefined, item: string): string[] => {
		const arr = array || [];
		if (!item.trim() || arr.includes(item.trim())) return arr;
		return [...arr, item.trim()];
	};

	const removeFromArray = (array: string[] | undefined, item: string): string[] => {
		const arr = array || [];
		return arr.filter((i) => i !== item);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						<Trans>Préférences de recherche</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Configure tes critères pour obtenir des recommandations plus pertinentes.</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Fields */}
					<div>
						<Label className="mb-3 block">
							<Trans>Domaines recherchés</Trans>
						</Label>
						<div className="flex flex-wrap gap-2">
							{FIELDS.map((field) => (
								<Badge
									asChild
									key={field.id}
									variant={localPrefs.preferredFields?.includes(field.id) ? "default" : "outline"}
									className="cursor-pointer"
								>
									<button
										type="button"
										onClick={() =>
											setLocalPrefs((p) => ({
												...p,
												preferredFields: toggleArrayItem(p.preferredFields, field.id),
											}))
										}
									>
										{field.name}
									</button>
								</Badge>
							))}
						</div>
					</div>

					{/* Regions */}
					<div>
						<Label className="mb-3 block">
							<Trans>Régions préférées</Trans>
						</Label>
						<div className="flex flex-wrap gap-2">
							{REGIONS.map((region) => (
								<Badge
									asChild
									key={region.id}
									variant={localPrefs.preferredRegions?.includes(region.id) ? "default" : "outline"}
									className="cursor-pointer"
								>
									<button
										type="button"
										onClick={() =>
											setLocalPrefs((p) => ({
												...p,
												preferredRegions: toggleArrayItem(p.preferredRegions, region.id),
											}))
										}
									>
										{region.name}
									</button>
								</Badge>
							))}
						</div>
					</div>

					{/* Job Types */}
					<div>
						<Label className="mb-3 block">
							<Trans>Types de contrat</Trans>
						</Label>
						<div className="flex flex-wrap gap-2">
							{JOB_TYPES.map((type) => (
								<Badge
									asChild
									key={type.id}
									variant={localPrefs.jobTypes?.includes(type.id) ? "default" : "outline"}
									className="cursor-pointer"
								>
									<button
										type="button"
										onClick={() =>
											setLocalPrefs((p) => ({
												...p,
												jobTypes: toggleArrayItem(p.jobTypes, type.id),
											}))
										}
									>
										{type.name}
									</button>
								</Badge>
							))}
						</div>
					</div>

					{/* Experience Level */}
					<div>
						<Label className="mb-3 block">
							<Trans>Niveau d'expérience</Trans>
						</Label>
						<Select
							value={localPrefs.experienceLevel || ""}
							onValueChange={(v) => setLocalPrefs((p) => ({ ...p, experienceLevel: v }))}
						>
							<SelectTrigger>
								<SelectValue placeholder={t`Choisir un niveau`} />
							</SelectTrigger>
							<SelectContent>
								{EXPERIENCE_LEVELS.map((level) => (
									<SelectItem key={level.id} value={level.id}>
										{level.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Remote Preference */}
					<div>
						<Label className="mb-3 block">
							<Trans>Mode de travail souhaité</Trans>
						</Label>
						<div className="flex flex-wrap gap-2">
							{REMOTE_OPTIONS.map((option) => (
								<Badge
									asChild
									key={option.id}
									variant={localPrefs.remotePreference === option.id ? "default" : "outline"}
									className="cursor-pointer"
								>
									<button
										type="button"
										onClick={() =>
											setLocalPrefs((p) => ({ ...p, remotePreference: option.id as "onsite" | "remote" | "hybrid" }))
										}
									>
										{option.name}
									</button>
								</Badge>
							))}
						</div>
					</div>

					{/* Salary Range */}
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<Label className="mb-2 block">
								<Trans>Salaire minimum (MAD/an)</Trans>
							</Label>
							<Input
								type="number"
								placeholder="48000"
								value={localPrefs.minSalary || ""}
								onChange={(e) =>
									setLocalPrefs((p) => ({
										...p,
										minSalary: e.target.value ? Number(e.target.value) : undefined,
									}))
								}
							/>
						</div>
						<div>
							<Label className="mb-2 block">
								<Trans>Salaire maximum (MAD/an)</Trans>
							</Label>
							<Input
								type="number"
								placeholder="120000"
								value={localPrefs.maxSalary || ""}
								onChange={(e) =>
									setLocalPrefs((p) => ({
										...p,
										maxSalary: e.target.value ? Number(e.target.value) : undefined,
									}))
								}
							/>
						</div>
					</div>

					{/* Willing to Relocate */}
					<div className="flex items-center gap-3">
						<Switch
							checked={localPrefs.willingToRelocate || false}
							onCheckedChange={(checked) => setLocalPrefs((p) => ({ ...p, willingToRelocate: checked }))}
							aria-label={t`Disponible pour changer de ville`}
						/>
						<Label>
							<Trans>Disponible pour changer de ville pour une opportunité</Trans>
						</Label>
					</div>

					{/* Priority Skills */}
					<div>
						<Label className="mb-2 block">
							<Trans>Compétences prioritaires</Trans>
						</Label>
						<div className="flex gap-2">
							<Input
								placeholder={t`Ajouter une compétence`}
								value={skillInput}
								onChange={(e) => setSkillInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										setLocalPrefs((p) => ({
											...p,
											prioritySkills: addToArray(p.prioritySkills, skillInput),
										}));
										setSkillInput("");
									}
								}}
							/>
							<Button
								variant="outline"
								onClick={() => {
									setLocalPrefs((p) => ({
										...p,
										prioritySkills: addToArray(p.prioritySkills, skillInput),
									}));
									setSkillInput("");
								}}
							>
								<Trans>Ajouter</Trans>
							</Button>
						</div>
						{localPrefs.prioritySkills && localPrefs.prioritySkills.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1">
								{localPrefs.prioritySkills.map((skill) => (
									<Badge key={skill} variant="secondary" className="gap-1">
										{skill}
										<button
											type="button"
											className="rounded-full p-0.5 transition-colors hover:bg-background/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
											aria-label={t`Retirer cet élément`}
											onClick={() =>
												setLocalPrefs((p) => ({
													...p,
													prioritySkills: removeFromArray(p.prioritySkills, skill),
												}))
											}
										>
											<XIcon className="size-3" />
										</button>
									</Badge>
								))}
							</div>
						)}
					</div>

					{/* Keywords */}
					<div>
						<Label className="mb-2 block">
							<Trans>Mots-clés de recherche</Trans>
						</Label>
						<div className="flex gap-2">
							<Input
								placeholder={t`Ajouter un mot-clé`}
								value={keywordInput}
								onChange={(e) => setKeywordInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										setLocalPrefs((p) => ({
											...p,
											keywords: addToArray(p.keywords, keywordInput),
										}));
										setKeywordInput("");
									}
								}}
							/>
							<Button
								variant="outline"
								onClick={() => {
									setLocalPrefs((p) => ({
										...p,
										keywords: addToArray(p.keywords, keywordInput),
									}));
									setKeywordInput("");
								}}
							>
								<Trans>Ajouter</Trans>
							</Button>
						</div>
						{localPrefs.keywords && localPrefs.keywords.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1">
								{localPrefs.keywords.map((keyword) => (
									<Badge key={keyword} variant="secondary" className="gap-1">
										{keyword}
										<button
											type="button"
											className="rounded-full p-0.5 transition-colors hover:bg-background/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
											aria-label={t`Retirer cet élément`}
											onClick={() =>
												setLocalPrefs((p) => ({
													...p,
													keywords: removeFromArray(p.keywords, keyword),
												}))
											}
										>
											<XIcon className="size-3" />
										</button>
									</Badge>
								))}
							</div>
						)}
					</div>

					{/* Excluded Companies */}
					<div>
						<Label className="mb-2 block">
							<Trans>Entreprises à exclure</Trans>
						</Label>
						<div className="flex gap-2">
							<Input
								placeholder={t`Ajouter une entreprise`}
								value={companyInput}
								onChange={(e) => setCompanyInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										setLocalPrefs((p) => ({
											...p,
											excludedCompanies: addToArray(p.excludedCompanies, companyInput),
										}));
										setCompanyInput("");
									}
								}}
							/>
							<Button
								variant="outline"
								onClick={() => {
									setLocalPrefs((p) => ({
										...p,
										excludedCompanies: addToArray(p.excludedCompanies, companyInput),
									}));
									setCompanyInput("");
								}}
							>
								<Trans>Ajouter</Trans>
							</Button>
						</div>
						{localPrefs.excludedCompanies && localPrefs.excludedCompanies.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1">
								{localPrefs.excludedCompanies.map((company) => (
									<Badge key={company} variant="secondary" className="gap-1">
										{company}
										<button
											type="button"
											className="rounded-full p-0.5 transition-colors hover:bg-background/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
											aria-label={t`Retirer cet élément`}
											onClick={() =>
												setLocalPrefs((p) => ({
													...p,
													excludedCompanies: removeFromArray(p.excludedCompanies, company),
												}))
											}
										>
											<XIcon className="size-3" />
										</button>
									</Badge>
								))}
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Annuler</Trans>
					</Button>
					<Button onClick={() => onSave(localPrefs)} disabled={isLoading}>
						{isLoading ? (
							<CircleNotchIcon className="mr-2 size-4 animate-spin" />
						) : (
							<CheckCircleIcon className="mr-2 size-4" />
						)}
						<Trans>Enregistrer</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
