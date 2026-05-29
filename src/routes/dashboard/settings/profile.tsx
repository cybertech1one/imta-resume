import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CheckIcon,
	EnvelopeSimpleIcon,
	FloppyDiskIcon,
	IdentificationCardIcon,
	ShieldCheckIcon,
	SpinnerIcon,
	UserCircleIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { match } from "ts-pattern";
import z from "zod";
import { ErrorComponent } from "@/components/error-component";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/integrations/auth/client";
import { getInitials } from "@/utils/string";
import { DashboardHeader } from "../-components/header";

export const Route = createFileRoute("/dashboard/settings/profile")({
	component: RouteComponent,
	errorComponent: ErrorComponent,
});

function createFormSchema() {
	return z.object({
		name: z
			.string()
			.trim()
			.min(1, { message: t`Name is required` })
			.max(64, { message: t`Name cannot exceed 64 characters` }),
		username: z
			.string()
			.trim()
			.min(1, { message: t`Username is required` })
			.max(64, { message: t`Username cannot exceed 64 characters` })
			.regex(/^[a-z0-9._-]+$/, {
				message: t`Username can only contain lowercase letters, numbers, periods, hyphens, and underscores.`,
			}),
		email: z
			.string()
			.trim()
			.min(1, { message: t`Email is required` })
			.email({ message: t`Please enter a valid email address` }),
	});
}

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

function RouteComponent() {
	const router = useRouter();
	const { session } = Route.useRouteContext();

	const defaultValues = useMemo(() => {
		return {
			name: session.user.name ?? "",
			username: session.user.username ?? "",
			email: session.user.email ?? "",
		};
	}, [session.user]);

	const form = useForm<FormValues>({
		resolver: zodResolver(createFormSchema()),
		defaultValues,
		mode: "onBlur",
	});

	const onCancel = () => {
		form.reset(defaultValues);
	};

	const onSubmit = async (data: FormValues) => {
		const { error } = await authClient.updateUser({
			name: data.name,
			username: data.username,
			displayUsername: data.username,
		});

		if (error) {
			toast.error(error.message);
			return;
		}

		toast.success(t`Your profile has been updated successfully.`);
		form.reset({ name: data.name, username: data.username, email: session.user.email });
		router.invalidate();

		if (data.email !== session.user.email) {
			const { error } = await authClient.changeEmail({
				newEmail: data.email,
				callbackURL: "/dashboard/settings/profile",
			});

			if (error) {
				toast.error(error.message);
				return;
			}

			toast.success(
				t`A confirmation link has been sent to your current email address. Check your inbox to confirm the change.`,
			);
			form.reset({ name: data.name, username: data.username, email: session.user.email });
			router.invalidate();
		}
	};

	const handleResendVerificationEmail = async () => {
		const toastId = toast.loading(t`Sending verification email...`);

		const { error } = await authClient.sendVerificationEmail({
			email: session.user.email,
			callbackURL: "/dashboard/settings/profile",
		});

		if (error) {
			toast.error(error.message, { id: toastId });
			return;
		}

		toast.success(t`A new verification link has been sent to your email address. Check your inbox.`, { id: toastId });
		router.invalidate();
	};

	return (
		<motion.div
			className="space-y-6"
			initial={false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
		>
			<DashboardHeader icon={UserCircleIcon} title={t`Profile`} />

			<Separator className="section-divider" />

			{/* Profile Photo Section */}
			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
				<Card hover="subtle" className="max-w-xl overflow-hidden">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<UserCircleIcon className="size-5" weight="duotone" style={{ color: "var(--imta-emerald)" }} />
							<Trans>Profile Photo</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Your profile photo is visible to other users</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-6">
							<motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
								<Avatar className="size-20 ring-4 ring-primary/10 ring-offset-2 ring-offset-background">
									<AvatarImage src={session.user.image ?? undefined} />
									<AvatarFallback className="bg-primary/10 font-bold text-2xl text-primary">
										{getInitials(session.user.name)}
									</AvatarFallback>
								</Avatar>
							</motion.div>
							<div className="space-y-2">
								<p className="font-semibold text-lg">{session.user.name}</p>
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
										@{session.user.username}
									</Badge>
									{session.user.emailVerified ? (
										<Badge
											variant="outline"
											className="gap-1 border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-400"
										>
											<ShieldCheckIcon className="size-3" weight="fill" />
											<Trans>Verified</Trans>
										</Badge>
									) : (
										<Badge
											variant="outline"
											className="gap-1 border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400"
										>
											<WarningIcon className="size-3" />
											<Trans>Not verified</Trans>
										</Badge>
									)}
								</div>
								<p className="text-muted-foreground text-xs">
									<Trans>Photo is managed by your authentication provider</Trans>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Profile Form Section */}
			<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
				<Card hover="subtle" className="max-w-xl overflow-hidden">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<IdentificationCardIcon className="size-5" weight="duotone" style={{ color: "var(--imta-teal)" }} />
							<Trans>Personal Information</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Update your personal information</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem className="form-field-animated">
											<FormLabel className="flex items-center gap-1.5">
												<UserCircleIcon className="size-3.5 text-muted-foreground" />
												<Trans>Full name</Trans>
											</FormLabel>
											<FormControl>
												<Input
													min={3}
													max={64}
													autoComplete="name"
													placeholder={t`Mohammed El Alami`}
													className="transition-all duration-200 focus:shadow-sm focus:ring-2 focus:ring-primary/20"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="username"
									render={({ field }) => (
										<FormItem className="form-field-animated">
											<FormLabel className="flex items-center gap-1.5">
												<IdentificationCardIcon className="size-3.5 text-muted-foreground" />
												<Trans>Username</Trans>
											</FormLabel>
											<FormControl>
												<Input
													min={3}
													max={64}
													autoComplete="username"
													placeholder="mohammed.elalami"
													className="lowercase transition-all duration-200 focus:shadow-sm focus:ring-2 focus:ring-primary/20"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem className="form-field-animated">
											<FormLabel className="flex items-center gap-1.5">
												<EnvelopeSimpleIcon className="size-3.5 text-muted-foreground" />
												<Trans>Email Address</Trans>
											</FormLabel>
											<FormControl>
												<Input
													type="email"
													autoComplete="email"
													placeholder="mohammed@example.com"
													className="lowercase transition-all duration-200 focus:shadow-sm focus:ring-2 focus:ring-primary/20"
													{...field}
												/>
											</FormControl>
											<FormMessage />
											{match(session.user.emailVerified)
												.with(true, () => (
													<motion.p
														className="flex items-center gap-x-1.5 text-xs"
														style={{ color: "var(--imta-emerald)" }}
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
													>
														<CheckIcon weight="bold" />
														<Trans>Verified</Trans>
													</motion.p>
												))
												.otherwise(() => (
													<motion.p
														className="flex items-center gap-x-1.5 text-amber-600 text-xs"
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
													>
														<WarningIcon className="size-3.5" />
														<Trans>Not verified</Trans>
														<span className="text-muted-foreground">|</span>
														<Button
															variant="link"
															className="h-auto gap-x-1.5 p-0! text-inherit text-xs"
															onClick={handleResendVerificationEmail}
														>
															<Trans>Resend verification email</Trans>
														</Button>
													</motion.p>
												))}
										</FormItem>
									)}
								/>

								<div className="flex items-center gap-x-3 border-t pt-4">
									<AnimatePresence>
										{form.formState.isDirty && (
											<motion.div
												initial={{ opacity: 0, x: -8 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: -8 }}
											>
												<Button type="reset" variant="ghost" onClick={onCancel} className="text-muted-foreground">
													<Trans>Annuler</Trans>
												</Button>
											</motion.div>
										)}
									</AnimatePresence>

									<Button
										type="submit"
										disabled={!form.formState.isDirty || form.formState.isSubmitting}
										className="gap-2"
									>
										{form.formState.isSubmitting ? (
											<SpinnerIcon className="size-4 animate-spin" />
										) : (
											<FloppyDiskIcon className="size-4" weight="bold" />
										)}
										<Trans>Enregistrer</Trans>
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</motion.div>
		</motion.div>
	);
}
