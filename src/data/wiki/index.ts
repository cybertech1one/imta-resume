import { atsOptimizationCategory } from "./categories/ats-optimization";
import { careerTransitionsCategory } from "./categories/career-transitions";
import { coverLettersCategory } from "./categories/cover-letters";
import { industryGuidesCategory } from "./categories/industry-guides";
import { interviewPreparationCategory } from "./categories/interview-preparation";
import { jobSearchStrategiesCategory } from "./categories/job-search-strategies";
import { networkingLinkedinCategory } from "./categories/networking-linkedin";
import { remoteWorkCategory } from "./categories/remote-work";
import { resumeFormatsCategory } from "./categories/resume-formats";
import { resumeFundamentalsCategory } from "./categories/resume-fundamentals";
import { resumeSectionsCategory } from "./categories/resume-sections";
import { salaryNegotiationCategory } from "./categories/salary-negotiation";
import type { WikiArticle, WikiCategory } from "./types";

export const wikiCategories: WikiCategory[] = [
	resumeFundamentalsCategory,
	resumeFormatsCategory,
	resumeSectionsCategory,
	industryGuidesCategory,
	atsOptimizationCategory,
	coverLettersCategory,
	careerTransitionsCategory,
	interviewPreparationCategory,
	networkingLinkedinCategory,
	salaryNegotiationCategory,
	jobSearchStrategiesCategory,
	remoteWorkCategory,
];

export function getCategory(slug: string): WikiCategory | undefined {
	return wikiCategories.find((c) => c.slug === slug);
}

export function getArticle(
	categorySlug: string,
	articleSlug: string,
): { category: WikiCategory; article: WikiArticle } | undefined {
	const category = getCategory(categorySlug);
	if (!category) return undefined;
	const article = category.articles.find((a) => a.slug === articleSlug);
	if (!article) return undefined;
	return { category, article };
}

export function getAllArticles(): Array<{ category: WikiCategory; article: WikiArticle }> {
	return wikiCategories.flatMap((category) => category.articles.map((article) => ({ category, article })));
}

export type { WikiArticle, WikiCategory, WikiFaqItem, WikiSection } from "./types";
