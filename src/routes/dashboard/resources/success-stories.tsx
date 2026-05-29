import { t } from "@lingui/core/macro";
import { StarIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorComponent } from "@/components/error-component";

import { DashboardHeader } from "../-components/header";
import {
	FeaturedStorySpotlight,
	HeroSection,
	StatisticsSection,
	StoriesGrid,
	StoryDetailDialog,
	SubmitStorySection,
} from "./-components/success-stories-components";
import { successStories } from "./-components/success-stories-data";
import type { SuccessStory } from "./-components/success-stories-types";

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/resources/success-stories" as any)({
	component: SuccessStoriesPage,
	errorComponent: ErrorComponent,
});

function SuccessStoriesPage() {
	const [fieldFilter, setFieldFilter] = useState<string>("all");
	const [programFilter, setProgramFilter] = useState<string>("all");
	const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
	const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
	const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
	const [featuredIndex, setFeaturedIndex] = useState(0);

	// Featured stories
	const featuredStories = useMemo(() => successStories.filter((s) => s.featured), []);

	// Filtered stories
	const filteredStories = useMemo(() => {
		return successStories.filter((story) => {
			if (fieldFilter !== "all" && story.category !== fieldFilter) return false;
			if (programFilter !== "all" && story.programId !== programFilter) return false;
			return true;
		});
	}, [fieldFilter, programFilter]);

	// Auto-rotate featured stories
	useEffect(() => {
		if (featuredStories.length <= 1) return;
		const interval = setInterval(() => {
			setFeaturedIndex((prev) => (prev + 1) % featuredStories.length);
		}, 8000);
		return () => clearInterval(interval);
	}, [featuredStories.length]);

	const nextFeatured = useCallback(() => {
		setFeaturedIndex((prev) => (prev + 1) % featuredStories.length);
	}, [featuredStories.length]);

	const prevFeatured = useCallback(() => {
		setFeaturedIndex((prev) => (prev - 1 + featuredStories.length) % featuredStories.length);
	}, [featuredStories.length]);

	// Open story detail
	const openStoryDetail = (story: SuccessStory) => {
		setSelectedStory(story);
		setIsStoryDialogOpen(true);
	};

	return (
		<>
			<DashboardHeader icon={StarIcon} title={t`Success Stories`} />

			<HeroSection />

			<FeaturedStorySpotlight
				featuredStories={featuredStories}
				featuredIndex={featuredIndex}
				setFeaturedIndex={setFeaturedIndex}
				prevFeatured={prevFeatured}
				nextFeatured={nextFeatured}
				openStoryDetail={openStoryDetail}
			/>

			<StoriesGrid
				filteredStories={filteredStories}
				fieldFilter={fieldFilter}
				setFieldFilter={setFieldFilter}
				programFilter={programFilter}
				setProgramFilter={setProgramFilter}
				openStoryDetail={openStoryDetail}
			/>

			<StatisticsSection />

			<SubmitStorySection isSubmitDialogOpen={isSubmitDialogOpen} setIsSubmitDialogOpen={setIsSubmitDialogOpen} />

			<StoryDetailDialog isOpen={isStoryDialogOpen} setIsOpen={setIsStoryDialogOpen} selectedStory={selectedStory} />
		</>
	);
}
