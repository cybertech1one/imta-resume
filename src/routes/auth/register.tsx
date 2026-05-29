import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useToggle } from "usehooks-ts";
import z from "zod";
import { ErrorComponent } from "@/components/error-component";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authClient } from "@/integrations/auth/client";
import { SocialAuth } from "./-components/social-auth";

export const Route = createFileRoute("/auth/register")({
	component: RouteComponent,
	errorComponent: ErrorComponent,
	beforeLoad: async ({ context }) => {
		if (context.session) throw redirect({ to: "/dashboard", replace: true });
		if (context.flags.disableSignups) throw redirect({ to: "/auth/login", replace: true });
		return { session: null };
	},
});

const IMTA_PROGRAM_OPTIONS = [
	{ value: "sage_femme", label: "Sage-Femme" },
	{ value: "infirmier_polyvalent", label: "Infirmier Polyvalent" },
	{ value: "aide_soignant", label: "Aide-Soignant" },
	{ value: "infirmier_auxiliaire", label: "Infirmier Auxiliaire" },
	{ value: "conducteur_engins", label: "Conducteur d'Engins" },
	{ value: "mecanique_engins", label: "Mecanique d'Engins" },
	{ value: "tourneur_industriel", label: "Tourneur Industriel" },
	{ value: "cariste", label: "Cariste" },
	{ value: "electromecanique", label: "Electromecanique" },
	{ value: "soudure", label: "Soudure" },
	{ value: "hse_specialist", label: "Specialiste HSE" },
	{ value: "other", label: "Autre" },
] as const;

const formSchema = z.object({
	name: z.string().min(3).max(64),
	username: z
		.string()
		.min(3)
		.max(64)
		.trim()
		.toLowerCase()
		.regex(/^[a-z0-9._-]+$/),
	email: z.string().min(1).email().toLowerCase(),
	password: z.string().min(6).max(64),
	imtaProgram: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

function getFormSchema() {
	return z.object({
		name: z
			.string()
			.min(3, { message: t`Name must be at least 3 characters` })
			.max(64, { message: t`Name cannot exceed 64 characters` }),
		username: z
			.string()
			.min(3, { message: t`Username must be at least 3 characters` })
			.max(64, { message: t`Username cannot exceed 64 characters` })
			.trim()
			.toLowerCase()
			.regex(/^[a-z0-9._-]+$/, {
				message: t`Le nom d'utilisateur ne peut contenir que des lettres minuscules, chiffres, points, tirets et underscores.`,
			}),
		email: z
			.string()
			.min(1, { message: t`Email is required` })
			.email({ message: t`Please enter a valid email address` })
			.toLowerCase(),
		password: z
			.string()
			.min(6, { message: t`Password must be at least 6 characters` })
			.max(64, { message: t`Password cannot exceed 64 characters` }),
		imtaProgram: z.string().min(1, { message: t`Please select your program` }),
	});
}

function RouteComponent() {
	const [submitted, setSubmitted] = useState(false);
	const [showPassword, toggleShowPassword] = useToggle(false);
	const { flags } = Route.useRouteContext();

	const form = useForm<FormValues>({
		resolver: zodResolver(getFormSchema()),
		defaultValues: {
			name: "",
			username: "",
			email: "",
			password: "",
			imtaProgram: "",
		},
		mode: "onBlur",
	});

	const onSubmit = async (data: FormValues) => {
		const toastId = toast.loading(t`Signing up...`);

		const { error } = await authClient.signUp.email({
			name: data.name,
			email: data.email,
			password: data.password,
			username: data.username,
			displayUsername: data.username,
			imtaProgram: data.imtaProgram,
			callbackURL: "/dashboard",
		});

		if (error) {
			const message =
				error.code === "FAILED_TO_CREATE_USER" || error.message?.includes("FAILED_TO_CREATE_USER")
					? t`An account with this email already exists. Please sign in instead.`
					: error.message;
			toast.error(message, { id: toastId });
			return;
		}

		setSubmitted(true);
		toast.dismiss(toastId);
	};

	if (submitted) return <PostSignupScreen />;

	return (
		<>
			<div className="space-y-1 text-center">
				<h1 className="font-bold text-2xl tracking-tight">
					<Trans>Create a new account</Trans>
				</h1>

				<div className="text-muted-foreground">
					<Trans>
						Already have an account?{" "}
						<Button asChild variant="link" className="h-auto gap-1.5 px-1! py-0">
							<Link to="/auth/login">
								Sign in now <ArrowRightIcon />
							</Link>
						</Button>
					</Trans>
				</div>
			</div>

			{!flags.disableEmailAuth && (
				<Form {...form}>
					<form
						method="POST"
						className="space-y-6"
						onSubmit={form.handleSubmit(onSubmit)}
						aria-label={t`Create account form`}
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Name</Trans>
									</FormLabel>
									<FormControl>
										<Input
											min={3}
											max={64}
											autoComplete="name"
											placeholder={t`Mohammed El Alami`}
											aria-required="true"
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
								<FormItem>
									<FormLabel>
										<Trans>Username</Trans>
									</FormLabel>
									<FormControl>
										<Input
											min={3}
											max={64}
											autoComplete="username"
											placeholder="mohammed.elalami"
											className="lowercase"
											aria-required="true"
											{...field}
										/>
									</FormControl>
									<FormMessage />
									<FormDescription>
										<Trans>Uniquement des lettres minuscules, chiffres, points, tirets et underscores</Trans>
									</FormDescription>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Email Address</Trans>
									</FormLabel>
									<FormControl>
										<Input
											type="email"
											autoComplete="email"
											placeholder="mohammed.elalami@exemple.ma"
											className="lowercase"
											aria-required="true"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="imtaProgram"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Program / Formation</Trans>
									</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger aria-required="true">
												<SelectValue placeholder={t`Select your program`} />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{IMTA_PROGRAM_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
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
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Password</Trans>
									</FormLabel>
									<div className="flex items-center gap-x-1.5">
										<FormControl>
											<Input
												min={6}
												max={64}
												type={showPassword ? "text" : "password"}
												autoComplete="new-password"
												aria-required="true"
												{...field}
											/>
										</FormControl>

										<Button
											type="button"
											size="icon"
											variant="ghost"
											aria-label={showPassword ? t`Hide password` : t`Show password`}
											aria-pressed={showPassword}
											onClick={toggleShowPassword}
										>
											{showPassword ? <EyeIcon /> : <EyeSlashIcon />}
										</Button>
									</div>
									<FormMessage />
									<FormDescription>
										<Trans>Doit contenir entre 6 et 64 caracteres</Trans>
									</FormDescription>
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full">
							<Trans>Sign up</Trans>
						</Button>
					</form>
				</Form>
			)}

			<SocialAuth />
		</>
	);
}

function PostSignupScreen() {
	return (
		<>
			<div className="space-y-1 text-center">
				<h1 className="font-bold text-2xl tracking-tight">
					<Trans>You've got mail!</Trans>
				</h1>
				<p className="text-muted-foreground">
					<Trans>Check your email for a link to verify your account.</Trans>
				</p>
			</div>

			<Alert>
				<AlertTitle>
					<Trans>This step is optional, but recommended.</Trans>
				</AlertTitle>
				<AlertDescription>
					<Trans>Verifying your email is required when resetting your password.</Trans>
				</AlertDescription>
			</Alert>

			<Button asChild>
				<Link to="/dashboard">
					<Trans>Continue</Trans> <ArrowRightIcon />
				</Link>
			</Button>
		</>
	);
}
