import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { CaretDownIcon, SparkleIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { URLInput } from "@/components/input/url-input";
import { useResumeStore } from "@/components/resume/store/resume";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { client, orpc } from "@/integrations/orpc/client";
import { basicsSchema } from "@/schema/resume/data";
import { cn } from "@/utils/style";
import { SectionBase } from "../shared/section-base";
import { CustomFieldsSection } from "./custom-fields";

function getMilitaryServiceOptions() {
	return [
		{ value: "not-applicable", label: t`Not Applicable` },
		{ value: "completed", label: t`Completed` },
		{ value: "exempted", label: t`Exempted` },
		{ value: "pending", label: t`Pending` },
		{ value: "in-service", label: t`In Service` },
	];
}

export function BasicsSectionBuilder() {
	return (
		<SectionBase type="basics">
			<BasicsSectionForm />
		</SectionBase>
	);
}

const formSchema = basicsSchema;

type FormValues = z.infer<typeof formSchema>;

function BasicsSectionForm() {
	const { i18n } = useLingui();
	const basics = useResumeStore((state) => state.resume.data.basics);
	const resumeData = useResumeStore((state) => state.resume.data);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const { data: aiStatus } = useQuery(orpc.aiConfig.status.check.queryOptions());
	const [moroccoFieldsOpen, setMoroccoFieldsOpen] = useState(false);

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			...basics,
			cin: basics.cin ?? "",
			militaryServiceStatus: basics.militaryServiceStatus ?? "not-applicable",
			dateOfBirth: basics.dateOfBirth ?? "",
			nationality: basics.nationality ?? "",
			maritalStatus: basics.maritalStatus ?? "",
		},
		mode: "onChange",
	});

	const onSubmit = (data: FormValues) => {
		updateResumeData((draft) => {
			draft.basics = data;
		});
	};

	const generateHeadlineMutation = useMutation({
		mutationFn: async () => {
			let fullContent = "";

			const stream = await client.ai.generateHeadline({
				language: i18n.locale || "en",
				resumeData: {
					name: resumeData.basics.name,
					currentHeadline: resumeData.basics.headline,
					experience: resumeData.sections.experience.items.map((e) => ({
						company: e.company,
						position: e.position,
					})),
					skills: resumeData.sections.skills.items.map((s) => s.name),
				},
			});

			for await (const chunk of stream) {
				if (typeof chunk === "string") fullContent += chunk;
			}

			return fullContent.trim();
		},
		onSuccess: (headline) => {
			form.setValue("headline", headline);
			updateResumeData((draft) => {
				draft.basics.headline = headline;
			});
			toast.success(t`Headline generated successfully`);
		},
		onError: (error) => {
			toast.error(error.message || t`Failed to generate headline`);
		},
	});

	return (
		<Form {...form}>
			<form onChange={form.handleSubmit(onSubmit)} className="space-y-4" aria-label={t`Basic information`}>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Trans>Name</Trans>
							</FormLabel>
							<FormControl>
								<Input {...field} placeholder={t`Your full name`} aria-required="true" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="headline"
					render={({ field }) => (
						<FormItem>
							<div className="flex items-center justify-between">
								<FormLabel>
									<Trans>Headline</Trans>
								</FormLabel>
								{aiStatus?.available && (
									<Button
										type="button"
										size="sm"
										variant="ghost"
										className="h-6 gap-1 px-2 text-purple-600 text-xs hover:bg-purple-50 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-950"
										disabled={generateHeadlineMutation.isPending}
										onClick={() => generateHeadlineMutation.mutate()}
									>
										{generateHeadlineMutation.isPending ? (
											<SpinnerIcon className="size-3 animate-spin" />
										) : (
											<SparkleIcon className="size-3" />
										)}
										<Trans>Generate</Trans>
									</Button>
								)}
							</div>
							<FormControl>
								<Input {...field} placeholder={t`e.g., Certified Nursing Assistant | Patient Care Specialist`} />
							</FormControl>
							<p className="mt-1 text-muted-foreground text-xs">
								<Trans>Your professional title or career objective in a few words</Trans>
							</p>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Trans>Email</Trans>
							</FormLabel>
							<FormControl>
								<Input type="email" {...field} placeholder={t`your.email@example.com`} />
							</FormControl>
							<p className="mt-1 text-muted-foreground text-xs">
								<Trans>Use a professional email address</Trans>
							</p>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Trans>Phone</Trans>
							</FormLabel>
							<FormControl>
								<Input {...field} placeholder={t`+212 6XX XXX XXX`} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="location"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Trans>Location</Trans>
							</FormLabel>
							<FormControl>
								<Input {...field} placeholder={t`City, Country`} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="website"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<Trans>Website</Trans>
							</FormLabel>
							<FormControl>
								<URLInput {...field} value={field.value} onChange={field.onChange} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Morocco-specific fields (collapsible) */}
				<Collapsible open={moroccoFieldsOpen} onOpenChange={setMoroccoFieldsOpen}>
					<CollapsibleTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="flex w-full items-center justify-between gap-2 text-muted-foreground hover:text-foreground"
						>
							<span className="text-xs">
								<Trans>Morocco-specific fields (optional)</Trans>
							</span>
							<CaretDownIcon
								className={cn("size-4 transition-transform duration-200", moroccoFieldsOpen && "rotate-180")}
							/>
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent className="space-y-4 pt-2">
						<FormField
							control={form.control}
							name="cin"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>CIN (Carte d'Identite Nationale)</Trans>
									</FormLabel>
									<FormControl>
										<Input {...field} value={field.value ?? ""} placeholder={t`e.g., AB123456`} />
									</FormControl>
									<FormDescription>
										<Trans>Moroccan national ID number (optional)</Trans>
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="dateOfBirth"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Date of Birth</Trans>
									</FormLabel>
									<FormControl>
										<Input {...field} value={field.value ?? ""} placeholder={t`e.g., 15/03/1998`} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="nationality"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Nationality</Trans>
									</FormLabel>
									<FormControl>
										<Input {...field} value={field.value ?? ""} placeholder={t`e.g., Marocaine`} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="maritalStatus"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Marital Status</Trans>
									</FormLabel>
									<FormControl>
										<Input {...field} value={field.value ?? ""} placeholder={t`e.g., Celibataire, Marie(e)`} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="militaryServiceStatus"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Military Service Status</Trans>
									</FormLabel>
									<Select onValueChange={field.onChange} value={field.value ?? "not-applicable"}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder={t`Select status`} />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{getMilitaryServiceOptions().map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										<Trans>Service militaire status (for male applicants)</Trans>
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CollapsibleContent>
				</Collapsible>

				<CustomFieldsSection onSubmit={onSubmit} />
			</form>
		</Form>
	);
}
