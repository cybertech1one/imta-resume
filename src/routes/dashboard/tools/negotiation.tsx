import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	BookOpenIcon,
	ChartBarIcon,
	ClockIcon,
	HandshakeIcon,
	LightbulbIcon,
	ListChecksIcon,
	MicrophoneIcon,
	QuestionIcon,
	ScalesIcon,
	TrophyIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "../-components/header";
import {
	BenchmarksTab,
	CalculatorTab,
	ChecklistTab,
	CtaSection,
	DisclaimerSection,
	HeroSection,
	QuestionsTab,
	RedFlagsTab,
	RolePlayTab,
	ScriptsTab,
	StoriesTab,
	TimingTab,
	TipsTab,
} from "./-components/negotiation-components";
import { initialBenefits } from "./-components/negotiation-data";
import type {
	BenefitItem,
	ExperienceLevel,
	IndustryBenchmark,
	NegotiationScript,
	RolePlayScenario,
} from "./-components/negotiation-types";

// Lazy load the negotiation guide component
const NegotiationGuideLazy = lazy(() => Promise.resolve({ default: NegotiationGuide }));

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/tools/negotiation" as any)({
	component: () => (
		<Suspense
			fallback={
				<div className="flex items-center justify-center p-8">
					<Trans>Loading negotiation guide...</Trans>
				</div>
			}
		>
			<NegotiationGuideLazy />
		</Suspense>
	),
	errorComponent: ErrorComponent,
});

// Component
function NegotiationGuide() {
	const [activeTab, setActiveTab] = useState("scripts");

	// Scripts state
	const [selectedScript, setSelectedScript] = useState<NegotiationScript | null>(null);
	const [copiedScript, setCopiedScript] = useState(false);

	// Calculator state
	const [currentSalary, setCurrentSalary] = useState("");
	const [desiredSalary, setDesiredSalary] = useState("");
	const [marketRate, setMarketRate] = useState("");
	const [hasCompetingOffer, setHasCompetingOffer] = useState(false);
	const [competingOffer, setCompetingOffer] = useState("");

	// Benefits state
	const [benefits, setBenefits] = useState<BenefitItem[]>(initialBenefits);
	const [benefitCategory, setBenefitCategory] = useState("all");

	// Role-play state
	const [activeScenario, setActiveScenario] = useState<RolePlayScenario | null>(null);
	const [showIdealResponse, setShowIdealResponse] = useState(false);
	const [userResponse, setUserResponse] = useState("");

	// Benchmark state
	const [selectedIndustry, setSelectedIndustry] = useState<IndustryBenchmark | null>(null);

	// Experience level state
	const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("mid");

	// Counter-offer calculation
	const counterOfferCalculation = useMemo(() => {
		const current = Number.parseFloat(currentSalary) || 0;
		const desired = Number.parseFloat(desiredSalary) || 0;
		const market = Number.parseFloat(marketRate) || 0;
		const competing = Number.parseFloat(competingOffer) || 0;

		if (!desired) return null;

		let recommendedMin = desired * 0.95;
		let recommendedMax = desired * 1.15;
		let anchor = desired * 1.1; // Start higher to anchor

		// Adjust based on market rate
		if (market > 0) {
			if (desired < market * 0.9) {
				recommendedMin = market * 0.9;
				recommendedMax = market * 1.1;
				anchor = market * 1.05;
			} else if (desired > market * 1.2) {
				recommendedMax = market * 1.2;
				anchor = market * 1.15;
			}
		}

		// Adjust for competing offer
		if (hasCompetingOffer && competing > 0) {
			recommendedMin = Math.max(recommendedMin, competing);
			anchor = competing * 1.05;
		}

		// Calculate increase from current
		const increasePercent = current > 0 ? ((anchor - current) / current) * 100 : 0;

		return {
			recommendedMin: Math.round(recommendedMin),
			recommendedMax: Math.round(recommendedMax),
			anchor: Math.round(anchor),
			increasePercent: Math.round(increasePercent),
			marketComparison: market > 0 ? ((desired / market) * 100 - 100).toFixed(1) : null,
		};
	}, [currentSalary, desiredSalary, marketRate, hasCompetingOffer, competingOffer]);

	// Benefits checklist
	const filteredBenefits = useMemo(() => {
		if (benefitCategory === "all") return benefits;
		return benefits.filter((b) => b.category === benefitCategory);
	}, [benefits, benefitCategory]);

	const checkedBenefitsCount = useMemo(() => benefits.filter((b) => b.checked).length, [benefits]);

	// Handlers
	const handleCopyScript = useCallback((script: string) => {
		navigator.clipboard.writeText(script);
		setCopiedScript(true);
		setTimeout(() => setCopiedScript(false), 2000);
	}, []);

	const handleBenefitToggle = useCallback((benefitId: string) => {
		setBenefits((prev) => prev.map((b) => (b.id === benefitId ? { ...b, checked: !b.checked } : b)));
	}, []);

	const handleResetBenefits = useCallback(() => {
		setBenefits(initialBenefits);
	}, []);

	const handleStartScenario = useCallback((scenario: RolePlayScenario) => {
		setActiveScenario(scenario);
		setShowIdealResponse(false);
		setUserResponse("");
	}, []);

	return (
		<>
			<DashboardHeader icon={HandshakeIcon} title={t`Salary Negotiation Guide`} />

			<HeroSection />

			{/* Main Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
				<TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0">
					{[
						{ value: "scripts", icon: BookOpenIcon, label: t`Scripts` },
						{ value: "calculator", icon: ScalesIcon, label: t`Calculator` },
						{ value: "checklist", icon: ListChecksIcon, label: t`Checklist` },
						{ value: "roleplay", icon: MicrophoneIcon, label: t`Practice` },
						{ value: "benchmarks", icon: ChartBarIcon, label: t`Benchmarks` },
						{ value: "tips", icon: LightbulbIcon, label: t`Tips` },
						{ value: "redflags", icon: WarningIcon, label: t`Red Flags` },
						{ value: "questions", icon: QuestionIcon, label: t`Questions` },
						{ value: "timing", icon: ClockIcon, label: t`Timing` },
						{ value: "stories", icon: TrophyIcon, label: t`Success` },
					].map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className="gap-2 rounded-full border border-transparent bg-muted/50 px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
						>
							<tab.icon className="size-4" />
							<span className="hidden sm:inline">{tab.label}</span>
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="scripts" className="space-y-8">
					<ScriptsTab
						selectedScript={selectedScript}
						setSelectedScript={setSelectedScript}
						copiedScript={copiedScript}
						onCopyScript={handleCopyScript}
					/>
				</TabsContent>

				<TabsContent value="calculator" className="space-y-8">
					<CalculatorTab
						currentSalary={currentSalary}
						setCurrentSalary={setCurrentSalary}
						desiredSalary={desiredSalary}
						setDesiredSalary={setDesiredSalary}
						marketRate={marketRate}
						setMarketRate={setMarketRate}
						hasCompetingOffer={hasCompetingOffer}
						setHasCompetingOffer={setHasCompetingOffer}
						competingOffer={competingOffer}
						setCompetingOffer={setCompetingOffer}
						counterOfferCalculation={counterOfferCalculation}
					/>
				</TabsContent>

				<TabsContent value="checklist" className="space-y-8">
					<ChecklistTab
						benefits={benefits}
						filteredBenefits={filteredBenefits}
						checkedBenefitsCount={checkedBenefitsCount}
						benefitCategory={benefitCategory}
						setBenefitCategory={setBenefitCategory}
						onBenefitToggle={handleBenefitToggle}
						onResetBenefits={handleResetBenefits}
					/>
				</TabsContent>

				<TabsContent value="roleplay" className="space-y-8">
					<RolePlayTab
						activeScenario={activeScenario}
						setActiveScenario={setActiveScenario}
						showIdealResponse={showIdealResponse}
						setShowIdealResponse={setShowIdealResponse}
						userResponse={userResponse}
						setUserResponse={setUserResponse}
						onStartScenario={handleStartScenario}
					/>
				</TabsContent>

				<TabsContent value="benchmarks" className="space-y-8">
					<BenchmarksTab selectedIndustry={selectedIndustry} setSelectedIndustry={setSelectedIndustry} />
				</TabsContent>

				<TabsContent value="tips" className="space-y-8">
					<TipsTab experienceLevel={experienceLevel} setExperienceLevel={setExperienceLevel} />
				</TabsContent>

				<TabsContent value="redflags" className="space-y-8">
					<RedFlagsTab />
				</TabsContent>

				<TabsContent value="questions" className="space-y-8">
					<QuestionsTab />
				</TabsContent>

				<TabsContent value="timing" className="space-y-8">
					<TimingTab />
				</TabsContent>

				<TabsContent value="stories" className="space-y-8">
					<StoriesTab />
				</TabsContent>
			</Tabs>

			<CtaSection />
			<DisclaimerSection />
		</>
	);
}
