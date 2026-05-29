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
						<Trans>Job Search Preferences</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>Configure your preferences to get more relevant recommendations</Trans>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Fields */}
					<div>
						<Label className="mb-3 block">
							<Trans>Fields of interest</Trans>
						</Label>
						<div className="flex flex-wrap gap-2">
							{FIELDS.map((field) => (
								<Badge
									key={field.id}
									variant={localPrefs.preferredFields?.includes(field.id) ? "default" : "outline"}
									className="cursor-pointer"
									onClick={() =>
										setLocalPrefs((p) => ({
											...p,
											preferredFields: toggleArrayItem(p.preferredFields, field.id),
										}))
									}
								>
									{field.name}
								</Badge>
							))}
						</div>
					</div>

					{/* Regions */}
					<div>
						<Label className="mb-3 block">
							<Trans>Preferred regions</Trans>
						</Label>
						<div className="flex flex-wrap gap-2">
							{REGIONS.map((region) => (
								<Badge
									key={region.id}
									variant={localPrefs.preferredRegions?.includes(region.id) ? "default" : "outline"}
									className="cursor-pointer"
									onClick={() =>
										setLocalPrefs((p) => ({
											...p,
											preferredRegions: toggleArrayItem(p.preferredRegions, region.id),
										}))
									}
								>
									{region.name}
								</Badge>
							))}
						</div>
					</div>

					{/* Job Types */}
					<div>
						<Label className="mb-3 block">
							<Trans>Contract types</Trans>
						</Label>
						<div className="flex flex-wrap gap-2">
							{JOB_TYPES.map((type) => (
								<Badge
									key={type.id}
									variant={localPrefs.jobTypes?.includes(type.id) ? "default" : "outline"}
									className="cursor-pointer"
									onClick={() =>
										setLocalPrefs((p) => ({
											...p,
											jobTypes: toggleArrayItem(p.jobTypes, type.id),
										}))
									}
								>
									{type.name}
								</Badge>
							))}
						</div>
					</div>

					{/* Experience Level */}
					<div>
						<Label className="mb-3 block">
							<Trans>Experience level</Trans>
						</Label>
						<Select
							value={localPrefs.experienceLevel || ""}
							onValueChange={(v) => setLocalPrefs((p) => ({ ...p, experienceLevel: v }))}
						>
							<SelectTrigger>
								<SelectValue placeholder={t`Select a level`} />
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
							<Trans>Work preference</Trans>
						</Label>
						<div className="flex flex-wrap gap-2">
							{REMOTE_OPTIONS.map((option) => (
								<Badge
									key={option.id}
									variant={localPrefs.remotePreference === option.id ? "default" : "outline"}
									className="cursor-pointer"
									onClick={() =>
										setLocalPrefs((p) => ({ ...p, remotePreference: option.id as "onsite" | "remote" | "hybrid" }))
									}
								>
									{option.name}
								</Badge>
							))}
						</div>
					</div>

					{/* Salary Range */}
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<Label className="mb-2 block">
								<Trans>Minimum salary (MAD/year)</Trans>
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
								<Trans>Maximum salary (MAD/year)</Trans>
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
						/>
						<Label>
							<Trans>Willing to relocate for a job</Trans>
						</Label>
					</div>

					{/* Priority Skills */}
					<div>
						<Label className="mb-2 block">
							<Trans>Priority skills</Trans>
						</Label>
						<div className="flex gap-2">
							<Input
								placeholder={t`Add a skill...`}
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
								<Trans>Add</Trans>
							</Button>
						</div>
						{localPrefs.prioritySkills && localPrefs.prioritySkills.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1">
								{localPrefs.prioritySkills.map((skill) => (
									<Badge key={skill} variant="secondary" className="gap-1">
										{skill}
										<XIcon
											className="size-3 cursor-pointer"
											onClick={() =>
												setLocalPrefs((p) => ({
													...p,
													prioritySkills: removeFromArray(p.prioritySkills, skill),
												}))
											}
										/>
									</Badge>
								))}
							</div>
						)}
					</div>

					{/* Keywords */}
					<div>
						<Label className="mb-2 block">
							<Trans>Search keywords</Trans>
						</Label>
						<div className="flex gap-2">
							<Input
								placeholder={t`Add a keyword...`}
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
								<Trans>Add</Trans>
							</Button>
						</div>
						{localPrefs.keywords && localPrefs.keywords.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1">
								{localPrefs.keywords.map((keyword) => (
									<Badge key={keyword} variant="secondary" className="gap-1">
										{keyword}
										<XIcon
											className="size-3 cursor-pointer"
											onClick={() =>
												setLocalPrefs((p) => ({
													...p,
													keywords: removeFromArray(p.keywords, keyword),
												}))
											}
										/>
									</Badge>
								))}
							</div>
						)}
					</div>

					{/* Excluded Companies */}
					<div>
						<Label className="mb-2 block">
							<Trans>Excluded companies</Trans>
						</Label>
						<div className="flex gap-2">
							<Input
								placeholder={t`Add a company...`}
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
								<Trans>Add</Trans>
							</Button>
						</div>
						{localPrefs.excludedCompanies && localPrefs.excludedCompanies.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1">
								{localPrefs.excludedCompanies.map((company) => (
									<Badge key={company} variant="secondary" className="gap-1">
										{company}
										<XIcon
											className="size-3 cursor-pointer"
											onClick={() =>
												setLocalPrefs((p) => ({
													...p,
													excludedCompanies: removeFromArray(p.excludedCompanies, company),
												}))
											}
										/>
									</Badge>
								))}
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						<Trans>Cancel</Trans>
					</Button>
					<Button onClick={() => onSave(localPrefs)} disabled={isLoading}>
						{isLoading ? (
							<CircleNotchIcon className="mr-2 size-4 animate-spin" />
						) : (
							<CheckCircleIcon className="mr-2 size-4" />
						)}
						<Trans>Save</Trans>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
