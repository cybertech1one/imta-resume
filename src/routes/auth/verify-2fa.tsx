import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowLeftIcon, CheckIcon } from "@phosphor-icons/react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { ErrorComponent } from "@/components/error-component";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { authClient } from "@/integrations/auth/client";

export const Route = createFileRoute("/auth/verify-2fa")({
	component: RouteComponent,
	errorComponent: ErrorComponent,
	beforeLoad: async ({ context }) => {
		if (context.session) throw redirect({ to: "/dashboard", replace: true });
	},
});

const formSchema = z.object({
	code: z.string().length(6).regex(/^\d+$/),
});

type FormValues = z.infer<typeof formSchema>;

function getFormSchema() {
	return z.object({
		code: z
			.string()
			.length(6, { message: t`Verification code must be exactly 6 digits` })
			.regex(/^\d+$/, { message: t`Code must contain only numbers` }),
	});
}

function RouteComponent() {
	const form = useForm<FormValues>({
		resolver: zodResolver(getFormSchema()),
		defaultValues: {
			code: "",
		},
	});

	const onSubmit = async (data: FormValues) => {
		const toastId = toast.loading(t`Verifying code...`);

		const { error } = await authClient.twoFactor.verifyTotp({
			code: data.code,
		});

		if (error) {
			toast.error(error.message, { id: toastId });
			return;
		}

		toast.dismiss(toastId);
		window.location.href = "/dashboard";
	};

	return (
		<>
			<div className="space-y-1 text-center">
				<h1 className="font-bold text-2xl tracking-tight">
					<Trans>Two-Factor Authentication</Trans>
				</h1>
				<div className="text-muted-foreground">
					<Trans>Enter the verification code from your authenticator app</Trans>
				</div>
			</div>

			<Form {...form}>
				<form method="POST" className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="code"
						render={({ field }) => (
							<FormItem className="justify-self-center">
								<FormControl>
									<InputOTP
										maxLength={6}
										value={field.value}
										pattern={REGEXP_ONLY_DIGITS}
										onChange={field.onChange}
										onComplete={form.handleSubmit(onSubmit)}
										pasteTransformer={(pasted) => pasted.replaceAll("-", "")}
									>
										<InputOTPGroup>
											<InputOTPSlot index={0} className="size-12" />
											<InputOTPSlot index={1} className="size-12" />
											<InputOTPSlot index={2} className="size-12" />
										</InputOTPGroup>
										<InputOTPSeparator />
										<InputOTPGroup>
											<InputOTPSlot index={3} className="size-12" />
											<InputOTPSlot index={4} className="size-12" />
											<InputOTPSlot index={5} className="size-12" />
										</InputOTPGroup>
									</InputOTP>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex gap-x-2">
						<Button type="button" variant="outline" className="flex-1" asChild>
							<Link to="/auth/login">
								<ArrowLeftIcon />
								<Trans>Back to Login</Trans>
							</Link>
						</Button>

						<Button type="submit" className="flex-1">
							<CheckIcon />
							<Trans>Verify</Trans>
						</Button>
					</div>
				</form>
				<Button type="button" variant="link" className="h-auto justify-self-center p-0 text-sm" asChild>
					<Link to="/auth/verify-2fa-backup">
						<Trans>Lost access to your authenticator?</Trans>
					</Link>
				</Button>
			</Form>
		</>
	);
}
