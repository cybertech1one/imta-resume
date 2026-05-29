import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	ArrowRightIcon,
	BriefcaseIcon,
	CalendarBlankIcon,
	CalendarCheckIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ClockIcon,
	CopyIcon,
	CurrencyDollarIcon,
	EnvelopeIcon,
	FileTextIcon,
	GlobeIcon,
	GridFourIcon,
	ImageIcon,
	LightningIcon,
	MagnifyingGlassIcon,
	PencilSimpleIcon,
	PlusIcon,
	QuotesIcon,
	StarIcon,
	TagIcon,
	TrashIcon,
	UserIcon,
	UsersIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import type { UseFormReturn } from "react-hook-form";
import { CometCard } from "@/components/animation/comet-card";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/style";
import type { PackageFormValues, SkillFormValues } from "./freelance-config";
import { DAYS_OF_WEEK, PLATFORM_CONFIG, PROFICIENCY_CONFIG, TIER_CONFIG } from "./freelance-config";
import type { FreelanceAvailability, PackageTier, PlatformType } from "./freelance-types";

export function HeroSection({
	profileStrength,
	hourlyRate,
	testimonialCount,
}: {
	profileStrength: { score: number };
	hourlyRate: number;
	testimonialCount: number;
}) {
	return (
		<motion.div
			className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-12"
			style={{
				background:
					"linear-gradient(135deg, oklch(0.65 0.18 160 / 0.15) 0%, oklch(0.6 0.2 200 / 0.1) 50%, oklch(0.7 0.15 240 / 0.08) 100%)",
			}}
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			{/* Background elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 blur-3xl"
					animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0], opacity: [0.5, 0.3, 0.5] }}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div
					className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-blue-500/15 to-purple-500/10 blur-3xl"
					animate={{ scale: [1.2, 1, 1.2], rotate: [0, -10, 0], opacity: [0.3, 0.5, 0.3] }}
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
					<BriefcaseIcon className="size-5 text-primary" weight="fill" />
					<span className="font-semibold text-primary text-sm uppercase tracking-wider">
						<Trans>Profile Generator</Trans>
					</span>
				</motion.div>

				<motion.h2
					className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Trans>Freelance Profile Builder</Trans>
				</motion.h2>

				<motion.p
					className="mb-8 max-w-2xl text-lg text-muted-foreground"
					initial={false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Trans>
						Create professional profiles optimized for Upwork, Fiverr, and LinkedIn. Calculate your rates, manage your
						services, and showcase your work.
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
							<ChartBarIcon className="size-5 text-primary" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{profileStrength.score}%</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Profile Strength</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
							<CurrencyDollarIcon className="size-5 text-green-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{hourlyRate} EUR/h</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Hourly Rate</Trans>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
							<StarIcon className="size-5 text-amber-500" weight="duotone" />
						</div>
						<div>
							<p className="font-bold text-xl">{testimonialCount}</p>
							<p className="text-muted-foreground text-sm">
								<Trans>Testimonials</Trans>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

export function ProfileInfoCard({
	platform,
	localProfile,
	platformLimits,
	onProfileUpdate,
}: {
	platform: PlatformType;
	localProfile: { headline: string; bio: string };
	platformLimits: { headline: number; bio: number };
	onProfileUpdate: (updates: { headline?: string; bio?: string }) => void;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<UserIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Profile Information</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Optimized for {PLATFORM_CONFIG[platform].label}</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="headline">
							<Trans>Professional Title</Trans>
						</Label>
						<span className="text-muted-foreground text-xs">
							{localProfile.headline.length}/{platformLimits.headline}
						</span>
					</div>
					<Input
						id="headline"
						value={localProfile.headline}
						onChange={(e) => onProfileUpdate({ headline: e.target.value })}
						maxLength={platformLimits.headline}
						placeholder="E.g.: Senior Full-Stack Developer | React, Node.js"
					/>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="bio">
							<Trans>Biography</Trans>
						</Label>
						<span className="text-muted-foreground text-xs">
							{localProfile.bio.length}/{platformLimits.bio}
						</span>
					</div>
					<Textarea
						id="bio"
						value={localProfile.bio}
						onChange={(e) => onProfileUpdate({ bio: e.target.value })}
						maxLength={platformLimits.bio}
						rows={6}
						placeholder={t`Describe your expertise and value proposition...`}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

export function SkillsCard({
	skills,
	isAddSkillDialogOpen,
	setIsAddSkillDialogOpen,
	skillForm,
	onAddSkillSubmit,
	createSkillPending,
	onDeleteSkill,
}: {
	skills: { id: string; name: string; proficiency: string; yearsExperience: number; endorsements: number }[];
	isAddSkillDialogOpen: boolean;
	setIsAddSkillDialogOpen: (open: boolean) => void;
	skillForm: UseFormReturn<SkillFormValues>;
	onAddSkillSubmit: (values: SkillFormValues) => void;
	createSkillPending: boolean;
	onDeleteSkill: (id: string) => void;
}) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<TagIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Skills</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>With proficiency levels</Trans>
						</CardDescription>
					</div>
					<Dialog open={isAddSkillDialogOpen} onOpenChange={setIsAddSkillDialogOpen}>
						<DialogTrigger asChild>
							<Button variant="outline" size="sm" className="gap-1">
								<PlusIcon className="size-4" />
								<Trans>Add</Trans>
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									<Trans>Add a Skill</Trans>
								</DialogTitle>
								<DialogDescription>
									<Trans>Add a new skill to your profile</Trans>
								</DialogDescription>
							</DialogHeader>
							<Form {...skillForm}>
								<form onSubmit={skillForm.handleSubmit(onAddSkillSubmit)} className="space-y-4 py-4">
									<FormField
										control={skillForm.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													<Trans>Name</Trans>
												</FormLabel>
												<FormControl>
													<Input placeholder={t`Ex: React, TypeScript, Python...`} {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={skillForm.control}
										name="proficiency"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													<Trans>Level</Trans>
												</FormLabel>
												<Select value={field.value} onValueChange={field.onChange}>
													<FormControl>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="beginner">
															<Trans>Beginner</Trans>
														</SelectItem>
														<SelectItem value="intermediate">
															<Trans>Intermediate</Trans>
														</SelectItem>
														<SelectItem value="advanced">
															<Trans>Advanced</Trans>
														</SelectItem>
														<SelectItem value="expert">
															<Trans>Expert</Trans>
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={skillForm.control}
										name="yearsExperience"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													<Trans>Years of experience</Trans>
												</FormLabel>
												<FormControl>
													<Input
														type="number"
														min={0}
														max={50}
														{...field}
														onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 0)}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<DialogFooter>
										<DialogClose asChild>
											<Button type="button" variant="outline">
												<Trans>Cancel</Trans>
											</Button>
										</DialogClose>
										<Button type="submit" disabled={createSkillPending}>
											<Trans>Add</Trans>
										</Button>
									</DialogFooter>
								</form>
							</Form>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				{skills.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<TagIcon className="mx-auto mb-2 size-8 opacity-50" />
						<p>
							<Trans>No skills added</Trans>
						</p>
						<p className="text-sm">
							<Trans>Add your skills to improve your profile</Trans>
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{skills.map((skill, index) => (
							<motion.div
								key={skill.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
								className="group rounded-lg border p-4 transition-all hover:border-primary/50"
							>
								<div className="mb-2 flex items-center justify-between">
									<span className="font-medium">{skill.name}</span>
									<div className="flex items-center gap-2">
										<Badge
											variant="outline"
											className={cn(
												"text-xs",
												skill.proficiency === "expert" && "border-amber-500 text-amber-500",
												skill.proficiency === "advanced" && "border-purple-500 text-purple-500",
												skill.proficiency === "intermediate" && "border-blue-500 text-blue-500",
											)}
										>
											{PROFICIENCY_CONFIG[skill.proficiency as keyof typeof PROFICIENCY_CONFIG].label}
										</Badge>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="ghost"
													size="icon-sm"
													className="opacity-0 transition-opacity group-hover:opacity-100"
												>
													<TrashIcon className="size-4 text-destructive" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														<Trans>Delete skill</Trans>
													</AlertDialogTitle>
													<AlertDialogDescription>
														<Trans>Are you sure you want to delete this skill?</Trans>
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>
														<Trans>Cancel</Trans>
													</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => onDeleteSkill(skill.id)}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													>
														<Trans>Delete</Trans>
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
								<div className="mb-2">
									<Progress
										value={PROFICIENCY_CONFIG[skill.proficiency as keyof typeof PROFICIENCY_CONFIG].value}
										className="h-1.5"
									/>
								</div>
								<div className="flex items-center justify-between text-muted-foreground text-xs">
									<span>{skill.yearsExperience} yrs</span>
									<span>{skill.endorsements} endorsements</span>
								</div>
							</motion.div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function PackagesCard({
	packages,
	isAddPackageDialogOpen,
	setIsAddPackageDialogOpen,
	isPackageDialogOpen,
	setIsPackageDialogOpen,
	editingPackage,
	packageForm,
	editPackageForm,
	onAddPackageSubmit,
	onEditPackageSubmit,
	createPackagePending,
	updatePackagePending,
	onDeletePackage,
	onEditPackage,
}: {
	packages: {
		id: string;
		tier: PackageTier;
		name: string;
		description: string;
		price: number;
		deliveryDays: number;
		revisions: number;
		features: string[];
	}[];
	isAddPackageDialogOpen: boolean;
	setIsAddPackageDialogOpen: (open: boolean) => void;
	isPackageDialogOpen: boolean;
	setIsPackageDialogOpen: (open: boolean) => void;
	editingPackage: {
		id: string;
		tier: PackageTier;
		name: string;
		description: string;
		price: number;
		deliveryDays: number;
		revisions: number;
		features: string[];
	} | null;
	packageForm: UseFormReturn<PackageFormValues>;
	editPackageForm: UseFormReturn<PackageFormValues>;
	onAddPackageSubmit: (values: PackageFormValues) => void;
	onEditPackageSubmit: (values: PackageFormValues) => void;
	createPackagePending: boolean;
	updatePackagePending: boolean;
	onDeletePackage: (id: string) => void;
	onEditPackage: (pkg: {
		id: string;
		tier: PackageTier;
		name: string;
		description: string;
		price: number;
		deliveryDays: number;
		revisions: number;
		features: string[];
	}) => void;
}) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<BriefcaseIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Service Packages</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Basic, Standard, and Premium</Trans>
						</CardDescription>
					</div>
					<Dialog open={isAddPackageDialogOpen} onOpenChange={setIsAddPackageDialogOpen}>
						<DialogTrigger asChild>
							<Button variant="outline" size="sm" className="gap-1">
								<PlusIcon className="size-4" />
								<Trans>Add</Trans>
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>
									<Trans>Add a Package</Trans>
								</DialogTitle>
								<DialogDescription>
									<Trans>Create a new service package</Trans>
								</DialogDescription>
							</DialogHeader>
							<Form {...packageForm}>
								<form onSubmit={packageForm.handleSubmit(onAddPackageSubmit)} className="space-y-4 py-4">
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={packageForm.control}
											name="tier"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														<Trans>Level</Trans>
													</FormLabel>
													<Select value={field.value} onValueChange={field.onChange}>
														<FormControl>
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="basic">
																<Trans>Basic</Trans>
															</SelectItem>
															<SelectItem value="standard">
																<Trans>Standard</Trans>
															</SelectItem>
															<SelectItem value="premium">
																<Trans>Premium</Trans>
															</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={packageForm.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														<Trans>Name</Trans>
													</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<FormField
										control={packageForm.control}
										name="description"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													<Trans>Description</Trans>
												</FormLabel>
												<FormControl>
													<Textarea {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<div className="grid grid-cols-3 gap-4">
										<FormField
											control={packageForm.control}
											name="price"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														<Trans>Price (EUR)</Trans>
													</FormLabel>
													<FormControl>
														<Input
															type="number"
															{...field}
															onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 0)}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={packageForm.control}
											name="deliveryDays"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														<Trans>Delivery (days)</Trans>
													</FormLabel>
													<FormControl>
														<Input
															type="number"
															{...field}
															onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 0)}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={packageForm.control}
											name="revisions"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														<Trans>Revisions</Trans>
													</FormLabel>
													<FormControl>
														<Input
															type="number"
															{...field}
															onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 0)}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<DialogFooter>
										<DialogClose asChild>
											<Button type="button" variant="outline">
												<Trans>Cancel</Trans>
											</Button>
										</DialogClose>
										<Button type="submit" disabled={createPackagePending}>
											<Trans>Add</Trans>
										</Button>
									</DialogFooter>
								</form>
							</Form>
						</DialogContent>
					</Dialog>
					<Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>
									<Trans>Edit Package</Trans>
								</DialogTitle>
								<DialogDescription>
									<Trans>Customize the details of your offer</Trans>
								</DialogDescription>
							</DialogHeader>
							{editingPackage && (
								<Form {...editPackageForm}>
									<form onSubmit={editPackageForm.handleSubmit(onEditPackageSubmit)} className="space-y-4 py-4">
										<div className="grid grid-cols-2 gap-4">
											<FormField
												control={editPackageForm.control}
												name="name"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															<Trans>Name</Trans>
														</FormLabel>
														<FormControl>
															<Input {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={editPackageForm.control}
												name="price"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															<Trans>Price (EUR)</Trans>
														</FormLabel>
														<FormControl>
															<Input
																type="number"
																{...field}
																onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 0)}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<FormField
											control={editPackageForm.control}
											name="description"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														<Trans>Description</Trans>
													</FormLabel>
													<FormControl>
														<Textarea {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<div className="grid grid-cols-2 gap-4">
											<FormField
												control={editPackageForm.control}
												name="deliveryDays"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															<Trans>Delivery (days)</Trans>
														</FormLabel>
														<FormControl>
															<Input
																type="number"
																{...field}
																onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 0)}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={editPackageForm.control}
												name="revisions"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															<Trans>Revisions</Trans>
														</FormLabel>
														<FormControl>
															<Input
																type="number"
																{...field}
																onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 0)}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<DialogFooter>
											<DialogClose asChild>
												<Button type="button" variant="outline">
													<Trans>Cancel</Trans>
												</Button>
											</DialogClose>
											<Button type="submit" disabled={updatePackagePending}>
												<Trans>Save</Trans>
											</Button>
										</DialogFooter>
									</form>
								</Form>
							)}
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				{packages.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<BriefcaseIcon className="mx-auto mb-2 size-8 opacity-50" />
						<p>
							<Trans>No packages created</Trans>
						</p>
						<p className="text-sm">
							<Trans>Create packages to offer your services</Trans>
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-3">
						{packages.map((pkg, index) => (
							<motion.div
								key={pkg.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<CometCard translateDepth={3} rotateDepth={5}>
									<Card
										className={cn(
											"h-full transition-all",
											pkg.tier === "premium" && "border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-transparent",
											pkg.tier === "standard" && "border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-transparent",
										)}
									>
										<CardHeader className="pb-3">
											<div className="flex items-center justify-between">
												<Badge className={cn(TIER_CONFIG[pkg.tier].bgColor, TIER_CONFIG[pkg.tier].color)}>
													{TIER_CONFIG[pkg.tier].label}
												</Badge>
												<div className="flex items-center gap-1">
													<Button variant="ghost" size="icon-sm" onClick={() => onEditPackage(pkg)}>
														<PencilSimpleIcon className="size-4" />
													</Button>
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button variant="ghost" size="icon-sm">
																<TrashIcon className="size-4 text-destructive" />
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>
																	<Trans>Delete package</Trans>
																</AlertDialogTitle>
																<AlertDialogDescription>
																	<Trans>Are you sure you want to delete this package?</Trans>
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>
																	<Trans>Cancel</Trans>
																</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() => onDeletePackage(pkg.id)}
																	className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
																>
																	<Trans>Delete</Trans>
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
											</div>
											<CardTitle className="text-lg">{pkg.name}</CardTitle>
											<CardDescription className="line-clamp-2">{pkg.description}</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="text-center">
												<span className="font-bold text-3xl">{pkg.price}</span>
												<span className="text-muted-foreground"> EUR</span>
											</div>
											<div className="flex items-center justify-between text-sm">
												<div className="flex items-center gap-1 text-muted-foreground">
													<ClockIcon className="size-4" />
													<span>{pkg.deliveryDays} days</span>
												</div>
												<div className="flex items-center gap-1 text-muted-foreground">
													<ArrowRightIcon className="size-4" />
													<span>
														{pkg.revisions === -1 ? <Trans>Unlimited</Trans> : <>{pkg.revisions} revisions</>}
													</span>
												</div>
											</div>
											<Separator />
											<ul className="space-y-2">
												{pkg.features.map((feature, idx) => (
													<li key={idx} className="flex items-start gap-2 text-sm">
														<CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" weight="fill" />
														<span>{feature}</span>
													</li>
												))}
											</ul>
										</CardContent>
									</Card>
								</CometCard>
							</motion.div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function ProfileStrengthCard({
	profileStrength,
}: {
	profileStrength: {
		score: number;
		sections: { name: string; score: number; maxScore: number; suggestions: string[] }[];
	};
}) {
	return (
		<Card className="border-2 border-primary/20">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg">
					<LightningIcon className="size-5 text-primary" weight="fill" />
					<Trans>Profile Strength</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="relative flex items-center justify-center py-4">
					<svg className="size-32 rotate-[-90deg]" viewBox="0 0 36 36">
						<path
							className="text-muted/30"
							strokeWidth="3"
							stroke="currentColor"
							fill="none"
							d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
						/>
						<motion.path
							className="text-primary"
							strokeWidth="3"
							stroke="currentColor"
							fill="none"
							strokeLinecap="round"
							d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
							initial={{ strokeDasharray: "0, 100" }}
							animate={{ strokeDasharray: `${profileStrength.score}, 100` }}
							transition={{ duration: 1, ease: "easeOut" }}
						/>
					</svg>
					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<span className="font-bold text-3xl">{profileStrength.score}%</span>
						<span className="text-muted-foreground text-xs">
							<Trans>Complete</Trans>
						</span>
					</div>
				</div>

				<div className="space-y-3">
					{profileStrength.sections.map((section) => (
						<div key={section.name} className="space-y-1">
							<div className="flex items-center justify-between text-sm">
								<span>{section.name}</span>
								<span className="font-medium">
									{section.score}/{section.maxScore}
								</span>
							</div>
							<Progress value={(section.score / section.maxScore) * 100} className="h-1.5" />
						</div>
					))}
				</div>

				{profileStrength.sections.some((s) => s.suggestions.length > 0) && (
					<div className="rounded-lg border border-amber-500/30 bg-amber-50/50 p-3 dark:bg-amber-950/20">
						<div className="mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-400">
							<WarningCircleIcon className="size-4" weight="fill" />
							<span className="font-medium text-sm">
								<Trans>Suggestions</Trans>
							</span>
						</div>
						<ul className="space-y-1">
							{profileStrength.sections
								.flatMap((s) => s.suggestions)
								.slice(0, 3)
								.map((suggestion, idx) => (
									<li key={idx} className="text-amber-700 text-xs dark:text-amber-400">
										{suggestion}
									</li>
								))}
						</ul>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function RateCalculatorCard({
	rateCalculatorHours,
	setRateCalculatorHours,
	rateCalculatorExpenses,
	setRateCalculatorExpenses,
	rateCalculatorProfit,
	setRateCalculatorProfit,
	calculatedHourlyRate,
	calculatedProjectRate,
	onApplyRates,
}: {
	rateCalculatorHours: number;
	setRateCalculatorHours: (v: number) => void;
	rateCalculatorExpenses: number;
	setRateCalculatorExpenses: (v: number) => void;
	rateCalculatorProfit: number;
	setRateCalculatorProfit: (v: number) => void;
	calculatedHourlyRate: number;
	calculatedProjectRate: number;
	onApplyRates: () => void;
}) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg">
					<CurrencyDollarIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Rate Calculator</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label className="text-sm">
							<Trans>Hours/week</Trans>
						</Label>
						<span className="font-medium text-sm">{rateCalculatorHours}h</span>
					</div>
					<Slider
						value={[rateCalculatorHours]}
						onValueChange={(v) => setRateCalculatorHours(v[0])}
						min={10}
						max={60}
						step={5}
					/>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label className="text-sm">
							<Trans>Monthly expenses (EUR)</Trans>
						</Label>
						<span className="font-medium text-sm">{rateCalculatorExpenses}</span>
					</div>
					<Slider
						value={[rateCalculatorExpenses]}
						onValueChange={(v) => setRateCalculatorExpenses(v[0])}
						min={500}
						max={10000}
						step={100}
					/>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label className="text-sm">
							<Trans>Profit margin (%)</Trans>
						</Label>
						<span className="font-medium text-sm">{rateCalculatorProfit}%</span>
					</div>
					<Slider
						value={[rateCalculatorProfit]}
						onValueChange={(v) => setRateCalculatorProfit(v[0])}
						min={10}
						max={100}
						step={5}
					/>
				</div>

				<Separator />

				<div className="rounded-lg bg-primary/10 p-4">
					<div className="mb-3 flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							<Trans>Recommended Hourly Rate</Trans>
						</span>
						<span className="font-bold text-primary text-xl">{calculatedHourlyRate} EUR/h</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">
							<Trans>Project Minimum</Trans>
						</span>
						<span className="font-bold text-lg">{calculatedProjectRate} EUR</span>
					</div>
				</div>

				<Button variant="outline" className="w-full gap-2" onClick={onApplyRates}>
					<CheckCircleIcon className="size-4" />
					<Trans>Apply these Rates</Trans>
				</Button>
			</CardContent>
		</Card>
	);
}

export function AvailabilityCard({
	localProfile,
	onProfileUpdate,
}: {
	localProfile: {
		availability: FreelanceAvailability;
		availableHoursPerWeek: number;
	};
	onProfileUpdate: (updates: { availability?: FreelanceAvailability; availableHoursPerWeek?: number }) => void;
}) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg">
					<CalendarBlankIcon className="size-5 text-primary" weight="duotone" />
					<Trans>Availability</Trans>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-7 gap-1">
					{DAYS_OF_WEEK.map((day) => (
						<Tooltip key={day.key}>
							<TooltipTrigger asChild>
								<button
									type="button"
									className={cn(
										"flex aspect-square items-center justify-center rounded-lg font-medium text-xs transition-all",
										localProfile.availability[day.key] ? "bg-green-500 text-white" : "bg-muted text-muted-foreground",
									)}
									onClick={() =>
										onProfileUpdate({
											availability: {
												...localProfile.availability,
												[day.key]: !localProfile.availability[day.key],
											},
										})
									}
								>
									{day.label}
								</button>
							</TooltipTrigger>
							<TooltipContent>
								{localProfile.availability[day.key] ? <Trans>Available</Trans> : <Trans>Not available</Trans>}
							</TooltipContent>
						</Tooltip>
					))}
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label className="text-sm">
							<Trans>Available hours/week</Trans>
						</Label>
						<span className="font-medium">{localProfile.availableHoursPerWeek}h</span>
					</div>
					<Slider
						value={[localProfile.availableHoursPerWeek]}
						onValueChange={(v) => onProfileUpdate({ availableHoursPerWeek: v[0] })}
						min={5}
						max={50}
						step={5}
					/>
				</div>

				<div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
					<CalendarCheckIcon className="size-5 text-green-500" weight="duotone" />
					<span className="text-sm">
						<Trans>{Object.values(localProfile.availability).filter(Boolean).length} days/week</Trans>
					</span>
				</div>
			</CardContent>
		</Card>
	);
}

export function PortfolioCard({
	portfolio,
}: {
	portfolio: {
		id: string;
		title: string;
		description: string;
		category: string;
		tags: string[];
		link: string | null;
	}[];
}) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<GridFourIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Portfolio</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Your best projects</Trans>
						</CardDescription>
					</div>
					<Button variant="outline" className="gap-2">
						<PlusIcon className="size-4" />
						<Trans>Add a Project</Trans>
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{portfolio.length === 0 ? (
					<div className="py-12 text-center text-muted-foreground">
						<GridFourIcon className="mx-auto mb-2 size-12 opacity-50" />
						<p>
							<Trans>No projects in portfolio</Trans>
						</p>
						<p className="text-sm">
							<Trans>Add your best projects to impress your clients</Trans>
						</p>
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{portfolio.map((item, index) => (
							<motion.div
								key={item.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<CometCard translateDepth={2} rotateDepth={4}>
									<Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
										<div className="relative aspect-video overflow-hidden bg-muted">
											<div className="flex h-full items-center justify-center">
												<ImageIcon className="size-12 text-muted-foreground" weight="duotone" />
											</div>
											<div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
												<Button size="sm" variant="secondary">
													<MagnifyingGlassIcon className="size-4" />
												</Button>
												{item.link && (
													<Button size="sm" variant="secondary" asChild>
														<a href={item.link} target="_blank" rel="noopener noreferrer">
															<GlobeIcon className="size-4" />
														</a>
													</Button>
												)}
											</div>
										</div>
										<CardContent className="pt-4">
											<Badge variant="outline" className="mb-2">
												{item.category}
											</Badge>
											<CardTitle className="mb-1 line-clamp-1 text-base">{item.title}</CardTitle>
											<CardDescription className="mb-3 line-clamp-2">{item.description}</CardDescription>
											<div className="flex flex-wrap gap-1">
												{item.tags.slice(0, 3).map((tag) => (
													<Badge key={tag} variant="secondary" className="text-xs">
														{tag}
													</Badge>
												))}
												{item.tags.length > 3 && (
													<Badge variant="secondary" className="text-xs">
														+{item.tags.length - 3}
													</Badge>
												)}
											</div>
										</CardContent>
									</Card>
								</CometCard>
							</motion.div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function TestimonialsCard({
	testimonials,
}: {
	testimonials: {
		id: string;
		platform: PlatformType;
		rating: number;
		content: string;
		clientName: string;
		clientAvatar: string | null;
		clientRole: string;
		clientCompany: string;
		projectType: string;
		date: string;
	}[];
}) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<QuotesIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Client Testimonials</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>What your clients say</Trans>
						</CardDescription>
					</div>
					<Button variant="outline" className="gap-2">
						<EnvelopeIcon className="size-4" />
						<Trans>Request a Testimonial</Trans>
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{testimonials.length === 0 ? (
					<div className="py-12 text-center text-muted-foreground">
						<QuotesIcon className="mx-auto mb-2 size-12 opacity-50" />
						<p>
							<Trans>No testimonials yet</Trans>
						</p>
						<p className="text-sm">
							<Trans>Client testimonials strengthen your credibility</Trans>
						</p>
					</div>
				) : (
					<div className="grid gap-6 lg:grid-cols-2">
						{testimonials.map((testimonial, index) => {
							const platformConfig = PLATFORM_CONFIG[testimonial.platform];
							const PlatformIcon = platformConfig.icon;

							return (
								<motion.div
									key={testimonial.id}
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<Card className="h-full">
										<CardContent className="pt-6">
											<div className="mb-4 flex items-center justify-between">
												<div className="flex items-center gap-1">
													{Array.from({ length: 5 }).map((_, i) => (
														<StarIcon
															key={i}
															className={cn(
																"size-4",
																i < testimonial.rating ? "text-amber-500" : "text-muted-foreground/30",
															)}
															weight={i < testimonial.rating ? "fill" : "regular"}
														/>
													))}
												</div>
												<Badge className={cn(platformConfig.bgColor, platformConfig.color)}>
													<PlatformIcon className="mr-1 size-3" />
													{platformConfig.label}
												</Badge>
											</div>
											<QuotesIcon className="mb-2 size-8 text-primary/20" weight="fill" />
											<p className="mb-4 text-muted-foreground italic">"{testimonial.content}"</p>
											<Separator className="my-4" />
											<div className="flex items-center gap-3">
												<Avatar>
													<AvatarImage src={testimonial.clientAvatar ?? undefined} />
													<AvatarFallback>{testimonial.clientName.charAt(0)}</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{testimonial.clientName}</p>
													<p className="text-muted-foreground text-sm">
														{testimonial.clientRole} - {testimonial.clientCompany}
													</p>
												</div>
											</div>
										</CardContent>
										<CardFooter className="border-t pt-4">
											<div className="flex w-full items-center justify-between text-muted-foreground text-sm">
												<span>{testimonial.projectType}</span>
												<span>{testimonial.date}</span>
											</div>
										</CardFooter>
									</Card>
								</motion.div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function ProposalTemplatesCard({
	proposals,
	onSelectProposal,
}: {
	proposals: {
		id: string;
		name: string;
		category: string;
		content: string;
		variables: string[];
		usageCount: number;
	}[];
	onSelectProposal: (proposal: {
		id: string;
		name: string;
		category: string;
		content: string;
		variables: string[];
		usageCount: number;
	}) => void;
}) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<FileTextIcon className="size-5 text-primary" weight="duotone" />
							<Trans>Proposal Templates</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Pre-written templates to save time</Trans>
						</CardDescription>
					</div>
					<Button variant="outline" className="gap-2">
						<PlusIcon className="size-4" />
						<Trans>New Template</Trans>
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{proposals.length === 0 ? (
					<div className="py-12 text-center text-muted-foreground">
						<FileTextIcon className="mx-auto mb-2 size-12 opacity-50" />
						<p>
							<Trans>No proposal templates</Trans>
						</p>
						<p className="text-sm">
							<Trans>Create templates to respond faster to clients</Trans>
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-3">
						{proposals.map((proposal, index) => (
							<motion.div
								key={proposal.id}
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card
									className="h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
									onClick={() => onSelectProposal(proposal)}
								>
									<CardContent className="pt-6">
										<Badge variant="outline" className="mb-3">
											{proposal.category}
										</Badge>
										<h4 className="mb-2 font-semibold">{proposal.name}</h4>
										<p className="mb-4 line-clamp-3 text-muted-foreground text-sm">
											{proposal.content.substring(0, 150)}...
										</p>
										<div className="flex items-center justify-between text-muted-foreground text-sm">
											<div className="flex items-center gap-1">
												<TagIcon className="size-4" />
												<span>{proposal.variables.length} variables</span>
											</div>
											<div className="flex items-center gap-1">
												<UsersIcon className="size-4" />
												<span>{proposal.usageCount} uses</span>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function ProposalPreviewDialog({
	isOpen,
	onOpenChange,
	selectedProposal,
	onCopyProposal,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedProposal: {
		id: string;
		name: string;
		category: string;
		content: string;
		variables: string[];
		usageCount: number;
	} | null;
	onCopyProposal: () => void;
}) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl">
				{selectedProposal && (
					<>
						<DialogHeader>
							<DialogTitle>{selectedProposal.name}</DialogTitle>
							<DialogDescription>
								<Trans>Category:</Trans> {selectedProposal.category}
							</DialogDescription>
						</DialogHeader>
						<ScrollArea className="max-h-[50vh]">
							<div className="space-y-4 pr-4">
								<div className="rounded-lg border bg-muted/30 p-4">
									<pre className="whitespace-pre-wrap font-sans text-sm">{selectedProposal.content}</pre>
								</div>
								<div>
									<h4 className="mb-2 font-medium">
										<Trans>Available variables:</Trans>
									</h4>
									<div className="flex flex-wrap gap-2">
										{selectedProposal.variables.map((variable) => (
											<Badge key={variable} variant="outline">
												{"{"}
												{variable}
												{"}"}
											</Badge>
										))}
									</div>
								</div>
							</div>
						</ScrollArea>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">
									<Trans>Close</Trans>
								</Button>
							</DialogClose>
							<Button className="gap-2" onClick={onCopyProposal}>
								<CopyIcon className="size-4" />
								<Trans>Copy Template</Trans>
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
