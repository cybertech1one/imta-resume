import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	FirstAidKitIcon,
	GearIcon,
	HardHatIcon,
	LightbulbIcon,
	PencilSimpleLineIcon,
	PlusIcon,
} from "@phosphor-icons/react";
import { useForm, useFormContext } from "react-hook-form";
import type z from "zod";
import { ChipInput } from "@/components/input/chip-input";
import { RichInput } from "@/components/input/rich-input";
import { URLInput } from "@/components/input/url-input";
import { useResumeStore } from "@/components/resume/store/resume";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DialogProps } from "@/dialogs/store";
import { useDialogStore } from "@/dialogs/store";
import { internshipItemSchema } from "@/schema/resume/data";
import { generateId } from "@/utils/string";

// Sample task descriptions for different fields
const sampleTasks = {
	healthcare: {
		label: "Healthcare / Nursing",
		icon: FirstAidKitIcon,
		content: `<ul>
<li>Assists the healthcare team in daily patient care</li>
<li>Effectue des soins de confort et d'hygiène sous supervision</li>
<li>Participates in monitoring vital signs (pulse, blood pressure, temperature)</li>
<li>Assists in the preparation and distribution of medications</li>
<li>Contributes to patient record documentation</li>
<li>Applies hygiene and safety protocols</li>
</ul>`,
		skills: ["Patient care", "Vital signs monitoring", "Hospital hygiene", "Teamwork", "Communication"],
	},
	industrial: {
		label: "Industrial / Mechanical",
		icon: GearIcon,
		content: `<ul>
<li>Participates in preventive and corrective maintenance operations on equipment</li>
<li>Assists technicians in diagnosing and repairing faults</li>
<li>Performs basic interventions on mechanical and hydraulic systems</li>
<li>Carries out quality checks according to established procedures</li>
<li>Strictly follows safety instructions and work procedures</li>
<li>Writes intervention reports and updates technical documentation</li>
</ul>`,
		skills: ["Preventive maintenance", "Fault diagnosis", "Blueprint reading", "Industrial safety", "Teamwork"],
	},
	hse: {
		label: "HSE / Safety",
		icon: HardHatIcon,
		content: `<ul>
<li>Participates in safety inspections and on-site audits</li>
<li>Assists in occupational and environmental risk assessment</li>
<li>Contributes to writing and updating safety procedures</li>
<li>Assists in accident and incident investigations</li>
<li>Participates in facilitating safety meetings and training sessions</li>
<li>Ensures compliance with current standards and regulations</li>
</ul>`,
		skills: ["Risk assessment", "Safety inspections", "ISO standards", "Report writing", "Safety training"],
	},
};

const formSchema = internshipItemSchema;

type FormValues = z.infer<typeof formSchema>;

// Internship type options
const internshipTypes = [
	{ value: "observation", label: "Observation internship" },
	{ value: "application", label: "Practical internship" },
	{ value: "end-of-studies", label: "End-of-studies internship (PFE)" },
	{ value: "professional", label: "Professional internship" },
	{ value: "other", label: "Other" },
] as const;

export function CreateInternshipDialog({ data }: DialogProps<"resume.sections.internships.create">) {
	const closeDialog = useDialogStore((state) => state.closeDialog);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			id: generateId(),
			hidden: data?.item?.hidden ?? false,
			company: data?.item?.company ?? "",
			position: data?.item?.position ?? "",
			supervisor: data?.item?.supervisor ?? "",
			location: data?.item?.location ?? "",
			period: data?.item?.period ?? "",
			type: data?.item?.type ?? "application",
			website: data?.item?.website ?? { url: "", label: "" },
			tasksPerformed: data?.item?.tasksPerformed ?? "",
			skillsAcquired: data?.item?.skillsAcquired ?? [],
			evaluation: data?.item?.evaluation ?? "",
		},
	});

	const onSubmit = (formData: FormValues) => {
		updateResumeData((draft) => {
			if (data?.customSectionId) {
				const section = draft.customSections.find((s) => s.id === data.customSectionId);
				if (section) section.items.push(formData);
			} else {
				draft.sections.internships.items.push(formData);
			}
		});
		closeDialog();
	};

	return (
		<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
			<DialogHeader>
				<DialogTitle className="flex items-center gap-x-2">
					<PlusIcon />
					<Trans>Add a new internship</Trans>
				</DialogTitle>
				<DialogDescription>
					<Trans>Track your internship experience for trade school and vocational training.</Trans>
				</DialogDescription>
			</DialogHeader>

			<Form {...form}>
				<form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
					<InternshipForm />

					<DialogFooter className="sm:col-span-full">
						<Button variant="ghost" onClick={closeDialog}>
							<Trans>Cancel</Trans>
						</Button>

						<Button type="submit" disabled={form.formState.isSubmitting}>
							<Trans>Create</Trans>
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
}

export function UpdateInternshipDialog({ data }: DialogProps<"resume.sections.internships.update">) {
	const closeDialog = useDialogStore((state) => state.closeDialog);
	const updateResumeData = useResumeStore((state) => state.updateResumeData);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			id: data.item.id,
			hidden: data.item.hidden,
			company: data.item.company,
			position: data.item.position,
			supervisor: data.item.supervisor,
			location: data.item.location,
			period: data.item.period,
			type: data.item.type,
			website: data.item.website,
			tasksPerformed: data.item.tasksPerformed,
			skillsAcquired: data.item.skillsAcquired,
			evaluation: data.item.evaluation,
		},
	});

	const onSubmit = (formData: FormValues) => {
		updateResumeData((draft) => {
			if (data?.customSectionId) {
				const section = draft.customSections.find((s) => s.id === data.customSectionId);
				if (!section) return;
				const index = section.items.findIndex((item) => item.id === formData.id);
				if (index !== -1) section.items[index] = formData;
			} else {
				const index = draft.sections.internships.items.findIndex((item) => item.id === formData.id);
				if (index !== -1) draft.sections.internships.items[index] = formData;
			}
		});
		closeDialog();
	};

	return (
		<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
			<DialogHeader>
				<DialogTitle className="flex items-center gap-x-2">
					<PencilSimpleLineIcon />
					<Trans>Update internship</Trans>
				</DialogTitle>
				<DialogDescription />
			</DialogHeader>

			<Form {...form}>
				<form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
					<InternshipForm />

					<DialogFooter className="sm:col-span-full">
						<Button variant="ghost" onClick={closeDialog}>
							<Trans>Cancel</Trans>
						</Button>

						<Button type="submit" disabled={form.formState.isSubmitting}>
							<Trans>Save Changes</Trans>
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
}

function InternshipForm() {
	const form = useFormContext<FormValues>();

	return (
		<>
			<FormField
				control={form.control}
				name="company"
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							<Trans>Company / Organization</Trans>
						</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t`e.g., Hospital Mohammed V`} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="position"
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							<Trans>Position / Role</Trans>
						</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t`e.g., Nursing Intern`} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="type"
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							<Trans>Internship Type</Trans>
						</FormLabel>
						<Select onValueChange={field.onChange} defaultValue={field.value}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder={t`Select internship type`} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{internshipTypes.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="supervisor"
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							<Trans>Supervisor</Trans>
						</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t`e.g., Dr. Fatima Benali`} />
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
							<Input {...field} placeholder={t`e.g., Casablanca, Morocco`} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="period"
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							<Trans>Period</Trans>
						</FormLabel>
						<FormControl>
							<Input {...field} placeholder={t`e.g., Jan 2024 - Mar 2024`} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="website"
				render={({ field }) => (
					<FormItem className="sm:col-span-full">
						<FormLabel>
							<Trans>Company Website</Trans>
						</FormLabel>
						<FormControl>
							<URLInput {...field} value={field.value} onChange={field.onChange} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="tasksPerformed"
				render={({ field }) => (
					<FormItem className="sm:col-span-full">
						<div className="flex items-center justify-between">
							<FormLabel>
								<Trans>Tasks Performed</Trans>
							</FormLabel>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button type="button" size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
										<LightbulbIcon className="size-3" />
										<Trans>Use Template</Trans>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuLabel>
										<Trans>Sample Descriptions</Trans>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{Object.entries(sampleTasks).map(([key, sample]) => {
										const Icon = sample.icon;
										return (
											<DropdownMenuItem
												key={key}
												onClick={() => {
													field.onChange(sample.content);
													// Also populate skills if empty
													const currentSkills = form.getValues("skillsAcquired");
													if (!currentSkills || currentSkills.length === 0) {
														form.setValue("skillsAcquired", sample.skills);
													}
												}}
											>
												<Icon className="mr-2 size-4" />
												{sample.label}
											</DropdownMenuItem>
										);
									})}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						<FormControl>
							<RichInput
								{...field}
								value={field.value}
								onChange={field.onChange}
								aiContext="Internship tasks and responsibilities for a trade school student's resume. Focus on practical skills learned, procedures followed, and professional competencies developed."
							/>
						</FormControl>
						<FormDescription>
							<Trans>
								Describe the main tasks and responsibilities during your internship. Use the template button for
								examples.
							</Trans>
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="skillsAcquired"
				render={({ field }) => (
					<FormItem className="sm:col-span-full">
						<FormLabel>
							<Trans>Skills Acquired</Trans>
						</FormLabel>
						<FormControl>
							<ChipInput {...field} value={field.value} onChange={field.onChange} />
						</FormControl>
						<FormDescription>
							<Trans>List the professional skills you developed during this internship.</Trans>
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="evaluation"
				render={({ field }) => (
					<FormItem className="sm:col-span-full">
						<FormLabel>
							<Trans>Supervisor Evaluation (Optional)</Trans>
						</FormLabel>
						<FormControl>
							<RichInput
								{...field}
								value={field.value}
								onChange={field.onChange}
								aiContext="Supervisor evaluation or appreciation for an internship. This could include performance ratings, commendations, or areas of excellence noted by the supervisor."
							/>
						</FormControl>
						<FormDescription>
							<Trans>Add your supervisor's appreciation or evaluation if available.</Trans>
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
}
