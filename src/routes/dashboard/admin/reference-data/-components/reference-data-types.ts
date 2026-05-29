import type { Icon } from "@phosphor-icons/react";

export type FieldIconMap = Record<string, Icon>;

export type SeedQuizOption = {
	id: string;
	questionId: string;
	text: string;
	textFr: string;
	icon: string;
	scores: Record<string, number>;
	sortOrder: number;
};

export type QuizOptionMutationInput = Array<{
	questionId: string;
	text: string;
	id?: string;
	textFr?: string;
	icon?: string;
	scores?: Record<string, number>;
	sortOrder?: number;
}>;
