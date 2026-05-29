import type { orpc } from "@/integrations/orpc/client";

// Preferences Dialog Props
export type PreferencesDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	preferences: Parameters<typeof orpc.jobRecommendations.updatePreferences.call>[0] | null | undefined;
	onSave: (prefs: Parameters<typeof orpc.jobRecommendations.updatePreferences.call>[0]) => void;
	isLoading: boolean;
};
