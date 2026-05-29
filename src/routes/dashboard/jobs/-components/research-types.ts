import type {
	CompanyBenefit,
	CompanyCultureInsight,
	CompanyEmployeeReview,
	CompanyIndustry,
	CompanyInterviewQuestion,
	CompanyInterviewTip,
	CompanyKeyPerson,
	CompanyNewsItem,
	CompanySalaryRange,
	CompanyValue,
} from "@/integrations/drizzle/schema";

// Type for company from database
export type Company = {
	id: string;
	userId: string;
	name: string;
	logo: string | null;
	industry: CompanyIndustry;
	description: string;
	mission: string;
	vision: string;
	location: string;
	headquarters: string;
	employeeCount: string;
	founded: number;
	website: string | null;
	linkedIn: string | null;
	revenue: string | null;
	stockSymbol: string | null;
	cultureInsights: CompanyCultureInsight[];
	cultureValues: CompanyValue[];
	cultureOverallScore: number;
	reviews: CompanyEmployeeReview[];
	reviewsAverageRating: number;
	reviewsTotalCount: number;
	reviewsRecommendRate: number;
	reviewsCeoApprovalRate: number;
	interviewQuestions: CompanyInterviewQuestion[];
	interviewTips: CompanyInterviewTip[];
	interviewDifficulty: number;
	interviewAverageDuration: string | null;
	interviewProcessSteps: string[];
	salaries: CompanySalaryRange[];
	benefits: CompanyBenefit[];
	news: CompanyNewsItem[];
	keyPeople: CompanyKeyPerson[];
	createdAt: Date;
	updatedAt: Date;
};
