import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import type { BetterFetchOption } from "better-auth/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useToggle } from "usehooks-ts";
import z from "zod";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/integrations/auth/client";
import { SocialAuth } from "./-components/social-auth";

export const Route = createFileRoute("/auth/login")({
	component: RouteComponent,
	errorComponent: ErrorComponent,
	beforeLoad: async ({ context }) => {
		if (context.session) throw redirect({ to: "/dashboard", replace: true });
		return { session: null };
	},
});

const formSchema = z.object({
	identifier: z.string().trim().toLowerCase().min(1),
	password: z.string().trim().min(6).max(64),
});

type FormValues = z.infer<typeof formSchema>;

function getFormSchema() {
	return z.object({
		identifier: z.string().trim().toLowerCase().min(1, { message: t`Email or username is required` }),
		password: z
			.string()
			.trim()
			.min(6, { message: t`Password must be at least 6 characters` })
			.max(64, { message: t`Password cannot exceed 64 characters` }),
	});
}

function RouteComponent() {
	const navigate = useNavigate();
	const [showPassword, toggleShowPassword] = useToggle(false);
	const { flags } = Route.useRouteContext();

	const form = useForm<FormValues>({
		resolver: zodResolver(getFormSchema()),
		defaultValues: {
			identifier: "",
			password: "",
		},
		mode: "onBlur",
	});

	const onSubmit = async (data: FormValues) => {
		const toastId = toast.loading(t`Signing in...`);

		const fetchOptions: BetterFetchOption = {
			onSuccess: (context) => {
				// Check if 2FA is required
				if (context.data && "twoFactorRedirect" in context.data && context.data.twoFactorRedirect) {
					toast.dismiss(toastId);
					navigate({ to: "/auth/verify-2fa", replace: true });
					return;
				}

				toast.dismiss(toastId);
				window.location.href = "/dashboard";
			},
			onError: ({ error }) => {
				// French fallback for IP-based throttling (Better Auth returns 429
				// with an English message); per-email lockout already returns French.
				const message =
					error.status === 429
						? t`Trop de tentatives. Veuillez patienter quelques instants avant de réessayer.`
						: error.message;
				toast.error(message, { id: toastId });
			},
		};

		if (data.identifier.includes("@")) {
			await authClient.signIn.email({
				email: data.identifier,
				password: data.password,
				fetchOptions,
			});
		} else {
			await authClient.signIn.username({
				username: data.identifier,
				password: data.password,
				fetchOptions,
			});
		}
	};

	return (
		<>
			<div className="space-y-1 text-center">
				<h1 className="font-bold text-2xl tracking-tight">
					<Trans>Sign in to your account</Trans>
				</h1>

				{!flags.disableSignups && (
					<div className="text-muted-foreground">
						<Trans>
							Don't have an account?{" "}
							<Button asChild variant="link" className="h-auto gap-1.5 px-1! py-0">
								<Link to="/auth/register">
									Create one now <ArrowRightIcon />
								</Link>
							</Button>
						</Trans>
					</div>
				)}
			</div>

			{!flags.disableEmailAuth && (
				<Form {...form}>
					<form method="POST" className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} aria-label={t`Sign in form`}>
						<FormField
							control={form.control}
							name="identifier"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Email Address</Trans>
									</FormLabel>
									<FormControl>
										<Input
											autoComplete="email"
											placeholder="mohammed.elalami@exemple.ma"
											className="lowercase"
											aria-required="true"
											{...field}
										/>
									</FormControl>
									<FormMessage />
									<FormDescription>
										<Trans>You can also use your username to login.</Trans>
									</FormDescription>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center justify-between">
										<FormLabel>
											<Trans>Password</Trans>
										</FormLabel>

										<Button asChild tabIndex={-1} variant="link" className="h-auto p-0 text-xs leading-none">
											<Link to="/auth/forgot-password">
												<Trans>Forgot Password?</Trans>
											</Link>
										</Button>
									</div>
									<div className="flex items-center gap-x-1.5">
										<FormControl>
											<Input
												min={6}
												max={64}
												type={showPassword ? "text" : "password"}
												autoComplete="current-password"
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
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full">
							<Trans>Sign in</Trans>
						</Button>
					</form>
				</Form>
			)}

			<SocialAuth />
		</>
	);
}
