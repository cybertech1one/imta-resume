import { t } from "@lingui/core/macro";
import { QuestionIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ErrorComponent } from "@/components/error-component";
import { DashboardHeader } from "../-components/header";
import {
	ContactSection,
	FAQSection,
	HeroSection,
	KeyboardShortcutsSection,
	QuickHelpCardsSection,
	StillNeedHelpSection,
	VideoTutorialsSection,
} from "./-components/help-components";
import { getFaqCategories } from "./-components/help-config";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/help/" as any)({
	component: HelpPage,
	errorComponent: ErrorComponent,
});

function HelpPage() {
	const faqCategories = getFaqCategories();
	const [openFAQs, setOpenFAQs] = useState<Record<string, boolean>>({});
	const [selectedCategory, setSelectedCategory] = useState<string>("general");
	const [searchQuery, setSearchQuery] = useState("");

	const toggleFAQ = (categoryId: string, questionIndex: number) => {
		const key = `${categoryId}-${questionIndex}`;
		setOpenFAQs((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const filteredCategories = faqCategories
		.map((category) => ({
			...category,
			items: category.items.filter(
				(item) =>
					item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
			),
		}))
		.filter((category) => category.items.length > 0);

	return (
		<>
			<DashboardHeader icon={QuestionIcon} title={t`Centre d'Aide`} />

			<HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

			<QuickHelpCardsSection />

			<FAQSection
				faqCategories={faqCategories}
				filteredCategories={filteredCategories}
				selectedCategory={selectedCategory}
				setSelectedCategory={setSelectedCategory}
				searchQuery={searchQuery}
				openFAQs={openFAQs}
				toggleFAQ={toggleFAQ}
			/>

			<VideoTutorialsSection />

			<ContactSection />

			<KeyboardShortcutsSection />

			<StillNeedHelpSection />
		</>
	);
}
