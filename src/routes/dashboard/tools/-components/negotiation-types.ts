import type { Icon } from "@phosphor-icons/react";

export type ExperienceLevel = "entry" | "mid" | "senior" | "executive";
export type NegotiationStage = "initial" | "counter" | "final";
export type ScenarioType = "initial-offer" | "counter-offer" | "benefits" | "promotion" | "remote-work";

export interface NegotiationScript {
	id: string;
	title: string;
	description: string;
	stage: NegotiationStage;
	script: string;
	tips: string[];
}

export interface BenefitItem {
	id: string;
	name: string;
	category: "monetary" | "time-off" | "growth" | "flexibility" | "perks";
	description: string;
	negotiable: boolean;
	typicalValue: string;
	checked: boolean;
}

export interface RolePlayScenario {
	id: string;
	type: ScenarioType;
	title: string;
	description: string;
	difficulty: "easy" | "medium" | "hard";
	employerResponse: string;
	idealResponse: string;
	tips: string[];
}

export interface IndustryBenchmark {
	industry: string;
	icon: Icon;
	entryRange: { min: number; max: number };
	midRange: { min: number; max: number };
	seniorRange: { min: number; max: number };
	executiveRange: { min: number; max: number };
	growthRate: number;
	demandLevel: "low" | "medium" | "high";
}

export interface SuccessStory {
	id: string;
	name: string;
	role: string;
	industry: string;
	originalOffer: number;
	finalOffer: number;
	strategy: string;
	quote: string;
	tips: string[];
}

export interface RedFlag {
	id: string;
	title: string;
	description: string;
	severity: "warning" | "danger";
	action: string;
}

export interface EmployerQuestion {
	id: string;
	question: string;
	purpose: string;
	category: "compensation" | "benefits" | "culture" | "growth" | "expectations";
	whenToAsk: string;
}

export interface TimingStrategy {
	id: string;
	title: string;
	description: string;
	bestTime: string;
	avoidTime: string;
	tips: string[];
}
