import {
	getRegistrationMode,
	getTodaySignupCount,
	type RegistrationMode,
	setRegistrationMode,
} from "@/integrations/auth/abuse-guard";
import { env } from "@/utils/env";

export type FeatureFlags = {
	disableSignups: boolean;
	disableEmailAuth: boolean;
};

export const flagsService = {
	getFlags: (): FeatureFlags => ({
		disableSignups: env.FLAG_DISABLE_SIGNUPS,
		disableEmailAuth: env.FLAG_DISABLE_EMAIL_AUTH,
	}),
};

export type RegistrationStatus = {
	mode: RegistrationMode;
	dailyCap: number;
	signupsToday: number;
	capReached: boolean;
};

export const registrationSettingsService = {
	/** Public-safe registration status (mode + cap usage). */
	async getStatus(): Promise<RegistrationStatus> {
		const [mode, signupsToday] = await Promise.all([getRegistrationMode(), getTodaySignupCount().catch(() => 0)]);
		const dailyCap = env.DAILY_SIGNUP_CAP;
		return {
			mode,
			dailyCap,
			signupsToday,
			capReached: signupsToday >= dailyCap,
		};
	},

	/** Admin: persist the registration mode. */
	async setMode(mode: RegistrationMode, updatedBy?: string): Promise<RegistrationStatus> {
		await setRegistrationMode(mode, updatedBy);
		return registrationSettingsService.getStatus();
	},
};
