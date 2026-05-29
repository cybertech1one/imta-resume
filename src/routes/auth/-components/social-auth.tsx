import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { FingerprintSimpleIcon, GithubLogoIcon, GoogleLogoIcon, VaultIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";

export function SocialAuth() {
	const router = useRouter();
	const { data: authProviders = {} } = useQuery(orpc.auth.providers.list.queryOptions());

	const handlePasskeyLogin = async () => {
		const toastId = toast.loading(t`Signing in...`);

		const { error } = await authClient.signIn.passkey();

		if (error) {
			toast.error(error.message, { id: toastId });
			return;
		}

		toast.dismiss(toastId);
		router.invalidate();
	};

	const handleSocialLogin = async (provider: string) => {
		const toastId = toast.loading(t`Signing in...`);

		const { error } = await authClient.signIn.social({
			provider,
			callbackURL: "/dashboard",
		});

		if (error) {
			toast.error(error.message, { id: toastId });
			return;
		}

		toast.dismiss(toastId);
		router.invalidate();
	};

	const handleOAuthLogin = async () => {
		const toastId = toast.loading(t`Signing in...`);

		const { error } = await authClient.signIn.oauth2({
			providerId: "custom",
			callbackURL: "/dashboard",
		});

		if (error) {
			toast.error(error.message, { id: toastId });
			return;
		}

		toast.dismiss(toastId);
		router.invalidate();
	};

	return (
		<>
			<div className="flex items-center gap-x-2" role="separator" aria-orientation="horizontal">
				<hr className="flex-1" aria-hidden="true" />
				<span className="font-medium text-xs tracking-wide">
					<Trans context="Choose to authenticate with a social provider (Google, GitHub, etc.) instead of email and password">
						or continue with
					</Trans>
				</span>
				<hr className="flex-1" aria-hidden="true" />
			</div>

			<div role="group" aria-label={t`Alternative authentication methods`}>
				<div className="grid grid-cols-2 gap-4">
					<Button
						variant="secondary"
						onClick={handlePasskeyLogin}
						aria-label={t`Sign in with Passkey authentication`}
						className={cn("col-span-full", "custom" in authProviders && "col-span-1")}
					>
						<FingerprintSimpleIcon aria-hidden="true" />
						Passkey
					</Button>

					<Button
						variant="secondary"
						onClick={handleOAuthLogin}
						aria-label={t`Sign in with ${authProviders.custom || "custom OAuth"}`}
						className={cn("hidden", "custom" in authProviders && "inline-flex")}
					>
						<VaultIcon aria-hidden="true" />
						{authProviders.custom}
					</Button>

					<Button
						onClick={() => handleSocialLogin("google")}
						aria-label={t`Sign in with Google`}
						className={cn(
							"hidden flex-1 bg-[#4285F4] text-white hover:bg-[#4285F4]/80",
							"google" in authProviders && "inline-flex",
						)}
					>
						<GoogleLogoIcon aria-hidden="true" />
						Google
					</Button>

					<Button
						onClick={() => handleSocialLogin("github")}
						aria-label={t`Sign in with GitHub`}
						className={cn(
							"hidden flex-1 bg-[#2b3137] text-white hover:bg-[#2b3137]/80",
							"github" in authProviders && "inline-flex",
						)}
					>
						<GithubLogoIcon aria-hidden="true" />
						GitHub
					</Button>
				</div>
			</div>
		</>
	);
}
