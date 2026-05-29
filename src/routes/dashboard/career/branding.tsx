import { t } from "@lingui/core/macro";
import { SparkleIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorComponent } from "@/components/error-component";

import { Tabs } from "@/components/ui/tabs";

import { DashboardHeader } from "../-components/header";
import {
	AuditTab,
	BrandingTabsList,
	BrandStatementTab,
	HeroSection,
	SocialMediaTab,
	UVPTab,
	VisualIdentityTab,
	VoiceToneTab,
	WebsiteTab,
} from "./-components/branding-components";
import { useBrandingData } from "./-components/branding-utils";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/career/branding" as any)({
	component: PersonalBranding,
	errorComponent: ErrorComponent,
});

function PersonalBranding() {
	const {
		// Config data
		LOGO_CONCEPTS,
		COLOR_PALETTES,
		VOICE_TONES,
		SOCIAL_MEDIA_CHECKLIST,
		WEBSITE_CHECKLIST,
		PROFESSION_EXAMPLES,
		AUDIENCE_EXAMPLES,
		STRENGTH_EXAMPLES,
		VALUE_EXAMPLES,
		PERSONALITY_TRAITS,

		// UI state
		wizardStep,
		activeTab,
		setActiveTab,

		// Brand data
		brandData,
		generatedStatement,
		uvpData,
		generatedUVP,

		// Visual identity
		selectedLogo,
		selectedPalette,

		// Voice
		selectedVoice,

		// Checklists
		socialChecked,
		websiteChecked,

		// Mutations
		updateMutation,
		toggleSocialMutation,
		toggleWebsiteMutation,

		// Scores
		socialScore,
		websiteScore,
		overallBrandScore,

		// Actions
		copyToClipboard,
		nextStep,
		prevStep,
		isStepValid,
	} = useBrandingData();

	return (
		<>
			<DashboardHeader icon={SparkleIcon} title={t`Personal Branding Guide`} />

			<HeroSection overallBrandScore={overallBrandScore} />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<BrandingTabsList />

				<BrandStatementTab
					wizardStep={wizardStep}
					brandData={brandData}
					generatedStatement={generatedStatement}
					isStepValid={isStepValid}
					nextStep={nextStep}
					prevStep={prevStep}
					updateMutation={updateMutation}
					copyToClipboard={copyToClipboard}
					PROFESSION_EXAMPLES={PROFESSION_EXAMPLES}
					AUDIENCE_EXAMPLES={AUDIENCE_EXAMPLES}
					STRENGTH_EXAMPLES={STRENGTH_EXAMPLES}
					VALUE_EXAMPLES={VALUE_EXAMPLES}
					PERSONALITY_TRAITS={PERSONALITY_TRAITS}
				/>

				<UVPTab
					uvpData={uvpData}
					generatedUVP={generatedUVP}
					updateMutation={updateMutation}
					copyToClipboard={copyToClipboard}
				/>

				<VisualIdentityTab
					LOGO_CONCEPTS={LOGO_CONCEPTS}
					COLOR_PALETTES={COLOR_PALETTES}
					selectedLogo={selectedLogo}
					selectedPalette={selectedPalette}
					updateMutation={updateMutation}
				/>

				<VoiceToneTab VOICE_TONES={VOICE_TONES} selectedVoice={selectedVoice} updateMutation={updateMutation} />

				<SocialMediaTab
					SOCIAL_MEDIA_CHECKLIST={SOCIAL_MEDIA_CHECKLIST}
					socialChecked={socialChecked}
					socialScore={socialScore}
					toggleSocialMutation={toggleSocialMutation}
				/>

				<WebsiteTab
					WEBSITE_CHECKLIST={WEBSITE_CHECKLIST}
					websiteChecked={websiteChecked}
					websiteScore={websiteScore}
					toggleWebsiteMutation={toggleWebsiteMutation}
				/>

				<AuditTab
					overallBrandScore={overallBrandScore}
					generatedStatement={generatedStatement}
					generatedUVP={generatedUVP}
					selectedLogo={selectedLogo}
					selectedPalette={selectedPalette}
					selectedVoice={selectedVoice}
					socialScore={socialScore}
					websiteScore={websiteScore}
				/>
			</Tabs>
		</>
	);
}
