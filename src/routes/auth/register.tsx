import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { FORM_RENDER_TS_FIELD, HONEYPOT_FIELD } from "@/integrations/auth/abuse-guard-constants";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { env } from "@/utils/env";
import { SocialAuth } from "./-components/social-auth";

// Public Turnstile site key (keyless when unset → widget never renders).
const TURNSTILE_SITE_KEY = env.VITE_TURNSTILE_SITE_KEY;

// Minimal global typing for the optionally-loaded Turnstile script.
declare global {
	interface Window {
		turnstile?: {
			render: (el: HTMLElement, opts: { sitekey: string; callback: (token: string) => void }) => string;
			reset: (id?: string) => void;
		};
	}
}

const registerSearchSchema = z.object({
	// Pre-fill the email field (e.g. when arriving from a partner invitation link).
	email: z.string().email().toLowerCase().optional().catch(undefined),
	// Invite token passed through for UX; the email-keyed signup hook performs the
	// actual partner promotion, so the token itself is not strictly required.
	invite: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/auth/register")({
	component: RouteComponent,
	errorComponent: ErrorComponent,
	validateSearch: registerSearchSchema,
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
	password: z.string().min(12).max(64),
	imtaProgram: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

function getFormSchema() {
	return z.object({
		name: z
			.string()
			.min(3, { message: t`Le nom doit contenir au moins 3 caractères` })
			.max(64, { message: t`Le nom ne peut pas dépasser 64 caractères` }),
		username: z
			.string()
			.min(3, { message: t`Le nom d'utilisateur doit contenir au moins 3 caractères` })
			.max(64, { message: t`Le nom d'utilisateur ne peut pas dépasser 64 caractères` })
			.trim()
			.toLowerCase()
			.regex(/^[a-z0-9._-]+$/, {
				message: t`Le nom d'utilisateur ne peut contenir que des lettres minuscules, chiffres, points, tirets et underscores.`,
			}),
		email: z
			.string()
			.min(1, { message: t`L'adresse e-mail est requise` })
			.email({ message: t`Veuillez saisir une adresse e-mail valide` })
			.toLowerCase(),
		password: z
			.string()
			.min(12, { message: t`Le mot de passe doit contenir au moins 12 caractères` })
			.max(64, { message: t`Le mot de passe ne peut pas dépasser 64 caractères` }),
		imtaProgram: z.string().min(1, { message: t`Veuillez sélectionner votre programme` }),
	});
}

function RouteComponent() {
	const [submitted, setSubmitted] = useState(false);
	const [showPassword, toggleShowPassword] = useToggle(false);
	const { flags } = Route.useRouteContext();
	const { email: invitedEmail, invite: inviteToken } = Route.useSearch();
	const isInvited = !!invitedEmail && !!inviteToken;

	// Anti-bot: capture the moment the form mounts so the server can reject
	// implausibly fast (automated) submissions. Honeypot is a hidden field that
	// only bots fill.
	const formRenderTsRef = useRef<number>(Date.now());
	const honeypotRef = useRef<HTMLInputElement>(null);

	// Optional Cloudflare Turnstile (only when a public site key is configured).
	const turnstileEnabled = !!TURNSTILE_SITE_KEY;
	const turnstileContainerRef = useRef<HTMLDivElement>(null);
	const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

	useEffect(() => {
		if (!turnstileEnabled || !TURNSTILE_SITE_KEY) return;
		const SCRIPT_ID = "cf-turnstile-script";

		const renderWidget = () => {
			if (!window.turnstile || !turnstileContainerRef.current) return;
			if (turnstileContainerRef.current.childElementCount > 0) return;
			window.turnstile.render(turnstileContainerRef.current, {
				sitekey: TURNSTILE_SITE_KEY,
				callback: (token: string) => setTurnstileToken(token),
			});
		};

		if (document.getElementById(SCRIPT_ID)) {
			renderWidget();
			return;
		}
		const script = document.createElement("script");
		script.id = SCRIPT_ID;
		script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
		script.async = true;
		script.defer = true;
		script.onload = renderWidget;
		document.head.appendChild(script);
	}, [turnstileEnabled]);

	const form = useForm<FormValues>({
		resolver: zodResolver(getFormSchema()),
		defaultValues: {
			name: "",
			username: "",
			email: invitedEmail ?? "",
			password: "",
			imtaProgram: "",
		},
		mode: "onBlur",
	});

	// Load the real program list from the DB (all active IMTA programs across every field)
	// so students in newer programs (cybersecurity, finance, data science…) can actually
	// select their program — not just the original 12. Falls back to the hardcoded list.
	const { data: dbPrograms } = useQuery({
		...orpc.imtaPrograms.list.queryOptions({ input: {} }),
		staleTime: 60 * 60 * 1000,
	});
	const programOptions = useMemo(() => {
		if (!dbPrograms?.length) return IMTA_PROGRAM_OPTIONS;
		const opts = dbPrograms.map((p) => ({ value: p.id, label: p.nameFr || p.name }));
		return [...opts, { value: "other", label: "Autre" }];
	}, [dbPrograms]);

	const onSubmit = async (data: FormValues) => {
		// Require the captcha token only when Turnstile is enabled.
		if (turnstileEnabled && !turnstileToken) {
			toast.error(t`Veuillez compléter la vérification anti-robot.`);
			return;
		}

		const toastId = toast.loading(t`Inscription en cours...`);

		const { error } = await authClient.signUp.email({
			name: data.name,
			email: data.email,
			password: data.password,
			username: data.username,
			displayUsername: data.username,
			imtaProgram: data.imtaProgram,
			callbackURL: "/dashboard",
			// Anti-abuse fields read server-side by the auth before-hook.
			[HONEYPOT_FIELD]: honeypotRef.current?.value ?? "",
			[FORM_RENDER_TS_FIELD]: formRenderTsRef.current,
			...(turnstileToken ? { turnstileToken } : {}),
		} as Parameters<typeof authClient.signUp.email>[0]);

		if (error) {
			// The server returns French messages for abuse rejections; fall back
			// to a generic message for the account-exists case (no enumeration).
			const message =
				error.code === "FAILED_TO_CREATE_USER" || error.message?.includes("FAILED_TO_CREATE_USER")
					? t`Un compte avec cet e-mail existe déjà. Veuillez vous connecter.`
					: (error.message ?? t`Inscription refusée. Veuillez réessayer.`);
			toast.error(message, { id: toastId });
			// Reset Turnstile so the user can retry.
			if (turnstileEnabled) {
				window.turnstile?.reset();
				setTurnstileToken(null);
			}
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
					<Trans>Créer un nouveau compte</Trans>
				</h1>

				<div className="text-muted-foreground">
					<Trans>
						Vous avez déjà un compte ?{" "}
						<Button asChild variant="link" className="h-auto gap-1.5 px-1! py-0">
							<Link to="/auth/login">
								Connectez-vous <ArrowRightIcon />
							</Link>
						</Button>
					</Trans>
				</div>
			</div>

			{isInvited && (
				<Alert>
					<AlertTitle>
						<Trans>Vous avez été invité comme partenaire</Trans>
					</AlertTitle>
					<AlertDescription>
						<Trans>
							Créez votre compte avec l'email invité ci-dessous. Votre accès partenaire sera activé automatiquement.
						</Trans>
					</AlertDescription>
				</Alert>
			)}

			{!flags.disableEmailAuth && (
				<Form {...form}>
					<form
						method="POST"
						className="space-y-6"
						onSubmit={form.handleSubmit(onSubmit)}
						aria-label={t`Formulaire de création de compte`}
					>
						{/*
						 * Honeypot: hidden from humans (and screen readers) but present in
						 * the DOM so naive bots fill it. A non-empty value is rejected
						 * server-side. Not a normal form field — kept out of react-hook-form.
						 */}
						<div aria-hidden="true" className="absolute -z-10 h-0 w-0 overflow-hidden opacity-0">
							<label htmlFor={HONEYPOT_FIELD}>Company website</label>
							<input
								ref={honeypotRef}
								id={HONEYPOT_FIELD}
								name={HONEYPOT_FIELD}
								type="text"
								tabIndex={-1}
								autoComplete="off"
								defaultValue=""
							/>
						</div>

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										<Trans>Nom</Trans>
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
										<Trans>Nom d'utilisateur</Trans>
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
										<Trans>Adresse e-mail</Trans>
									</FormLabel>
									<FormControl>
										<Input
											type="email"
											autoComplete="email"
											placeholder="mohammed.elalami@exemple.ma"
											className="lowercase"
											aria-required="true"
											readOnly={isInvited}
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
										<Trans>Programme / Formation</Trans>
									</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger aria-required="true">
												<SelectValue placeholder={t`Sélectionnez votre programme`} />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{programOptions.map((option) => (
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
										<Trans>Mot de passe</Trans>
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
											aria-label={showPassword ? t`Masquer le mot de passe` : t`Afficher le mot de passe`}
											aria-pressed={showPassword}
											onClick={toggleShowPassword}
										>
											{showPassword ? <EyeIcon /> : <EyeSlashIcon />}
										</Button>
									</div>
									<FormMessage />
									<FormDescription>
										<Trans>Doit contenir entre 12 et 64 caractères</Trans>
									</FormDescription>
								</FormItem>
							)}
						/>

						{turnstileEnabled && <div ref={turnstileContainerRef} className="flex justify-center" />}

						<Button type="submit" className="w-full" disabled={turnstileEnabled && !turnstileToken}>
							<Trans>S'inscrire</Trans>
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
					<Trans>Continuer</Trans> <ArrowRightIcon />
				</Link>
			</Button>
		</>
	);
}
