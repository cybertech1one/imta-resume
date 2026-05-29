import type { MessageDescriptor } from "@lingui/core";

export type WikiSection = {
	titleKey: MessageDescriptor;
	contentKey: MessageDescriptor;
};

export type WikiFaqItem = {
	questionKey: MessageDescriptor;
	answerKey: MessageDescriptor;
};

export type WikiArticle = {
	slug: string;
	titleKey: MessageDescriptor;
	descriptionKey: MessageDescriptor;
	seoTitle: string;
	seoDescription: string;
	keywords: string[];
	readingTime: number;
	dateModified: string;
	sections: WikiSection[];
	faqItems?: WikiFaqItem[];
};

export type WikiCategory = {
	slug: string;
	titleKey: MessageDescriptor;
	descriptionKey: MessageDescriptor;
	iconName: string;
	seoTitle: string;
	seoDescription: string;
	articles: WikiArticle[];
};
