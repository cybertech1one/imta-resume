export interface WorkStyleQuestion {
	id: string;
	question: string;
	category: "environment" | "collaboration" | "structure" | "communication" | "growth";
	options: {
		id: string;
		text: string;
		scores: Record<string, number>;
	}[];
}

export interface ValuesQuestion {
	id: string;
	statement: string;
	category: string;
	dimension: string;
}

export interface CompanyCultureProfile {
	id: string;
	name: string;
	industry: string;
	location: string;
	size: string;
	description: string;
	cultureScores: {
		workLifeBalance: number;
		innovation: number;
		collaboration: number;
		growth: number;
		diversity: number;
		transparency: number;
	};
	values: string[];
	perks: string[];
	workStyle: string;
	remotePolicy: string;
}

export interface RedFlag {
	id: string;
	category: string;
	flag: string;
	severity: "high" | "medium" | "low";
	explanation: string;
	checked: boolean;
}

export interface CultureQuestion {
	id: string;
	category: string;
	question: string;
	whyAsk: string;
	greenFlags: string[];
	redFlags: string[];
}

export interface PersonalCultureProfile {
	workLifeBalance: number;
	innovation: number;
	collaboration: number;
	growth: number;
	diversity: number;
	transparency: number;
}
