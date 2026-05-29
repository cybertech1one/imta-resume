export type SearchParams = {
	programs?: string;
};

export type DemandLevelInfo = {
	label: string;
	color: string;
};

export type Recommendations = {
	bestSalary: ComparisonProgram;
	bestEmployment: ComparisonProgram;
	quickestTraining: ComparisonProgram;
	highestGrowth: ComparisonProgram;
};

export type SkillAnalysis = {
	commonSkills: string[];
	uniqueSkills: Map<string, string[]>;
};

export type ComparisonProgram = {
	id: string;
	name: string;
	category: string;
	duration: string;
	requirements: string[];
	salaryRange: { min: number; max: number };
	employmentRate: number;
	growthRate: number;
	demandLevel: string;
	careerProspects: string[];
};

export type ProgramListItem = {
	id: string;
	name: string;
	category: string;
};
