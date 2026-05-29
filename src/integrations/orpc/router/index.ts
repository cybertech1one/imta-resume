import { achievementsRouter } from "./achievements";
import { activityRouter } from "./activity";
import { adaptiveLearningRouter } from "./adaptive-learning";
import { adminRouter } from "./admin";
import { aiRouter } from "./ai";
import { aiAnalyticsAdminRouter, aiAnalyticsStudentRouter } from "./ai-analytics";
import { aiConfigRouter } from "./ai-config";
import { aiHistoryRouter } from "./ai-history";
import { aiMentorRouter } from "./ai-mentor";
import { aiMetricsRouter } from "./ai-metrics";
import { aiTrainingRouter } from "./ai-training";
import { aiWriterRouter } from "./ai-writer";
import { analyticsRouter } from "./analytics";
import { atsCheckerRouter } from "./ats-checker";
import { authRouter } from "./auth";
import { brandingRouter } from "./branding";
import { brandingExampleRouter } from "./branding-example";
import { careerRouter } from "./career";
import { careerCoachingRouter } from "./career-coaching";
import { careerMatcherRouter } from "./career-matcher";
import {
	careerQuizAdaptiveRouter,
	careerQuizOptionsRouter,
	careerQuizQuestionsRouter,
	careerQuizResultsRouter,
	careerQuizSeedRouter,
} from "./career-quiz";
import { careerRoleRouter } from "./career-role";
import { careerTransitionRouter } from "./career-transition";
import { certificationLibraryRouter } from "./certification-library";
import { chatbotSessionRouter } from "./chatbot-session";
import { cohortAnalyticsRouter } from "./cohort-analytics";
import { companyResearchRouter } from "./company-research";
import { confidenceExercisesRouter } from "./confidence-exercises";
import { coverLetterRouter } from "./cover-letter";
import { cultureMatchRouter } from "./culture-match";
import { dashboardRouter } from "./dashboard";
import { dataExportRouter } from "./data-export";
import { deadlinesRouter } from "./deadlines";
import { elevatorPitchRouter } from "./elevator-pitch";
import { experienceOptimizerRouter } from "./experience-optimizer";
import { flagsRouter } from "./flags";
import { freelanceRouter } from "./freelance";
import { goalsRouter } from "./goals";
import { insightsRouter } from "./insights";
import { interviewRouter } from "./interview";
import { interviewAnalyticsRouter } from "./interview-analytics";
import { interviewChecklistRouter } from "./interview-checklist";
import { interviewFeedbackRouter } from "./interview-feedback";
import { interviewNotesRouter } from "./interview-notes";
import { interviewPrepRouter } from "./interview-prep";
import { interviewRecordingRouter } from "./interview-recording";
import { interviewSchedulerRouter } from "./interview-scheduler";
import { interviewTrackingRouter } from "./interview-tracking";
import { jobAggregatorRouter } from "./job-aggregator";
import { jobAlertsRouter } from "./job-alerts";
import { jobApplicationsRouter } from "./job-applications";
import { jobMatchRouter } from "./job-match";
import { jobRecommendationRouter } from "./job-recommendation";
import { jobResourcesRouter } from "./job-resources";
import { journalRouter } from "./journal";
import { learningPathRouter, skillProgressRouter } from "./learning-path";
import { learningRecommendationsRouter } from "./learning-recommendations";
import { linkedinRouter } from "./linkedin";
import { linkedinContentRouter } from "./linkedin-content";
import { marketIntelligenceRouter } from "./market-intelligence";
import { mentorMessagingRouter } from "./mentor-messaging";
import { mentorsRouter } from "./mentors";
import { messageTemplateRouter } from "./message-template";
import { messagingRouter } from "./messaging";
import { mockAiRouter } from "./mock-ai";
import { networkingRouter } from "./networking";
import { networkingEventsRouter } from "./networking-events";
import { notificationRouter } from "./notification";
import { outfitChecklistRouter } from "./outfit-checklist";
import { partnerRouter } from "./partner";
import { printerRouter } from "./printer";
import { qrCodeRouter } from "./qr-code";
import { quickChecklistRouter } from "./quick-checklist";
import { recommendationRequestRouter } from "./recommendation-request";
import {
	employersRouter,
	imtaProgramsRouter,
	interviewQuestionsRouter,
	interviewTipsRouter,
	marketInsightsRouter,
	seedRouter,
	skillsRouter,
} from "./reference-data";
import { remoteReadinessRouter } from "./remote-readiness";
import { resourcesRouter } from "./resources";
import { resumeRouter } from "./resume";
import { resumeGalleryRouter } from "./resume-gallery";
import { resumeHistoryRouter } from "./resume-history";
import { resumeScoringRouter } from "./resume-scoring";
import { reviewPrepRouter } from "./review-prep";
import { salaryHistoryRouter } from "./salary-history";
import { searchRouter } from "./search";
import { shortcutsRouter } from "./shortcuts";
import { skillGapRouter } from "./skill-gap";
import { starMethodRouter } from "./star-method";
import { statisticsRouter } from "./statistics";
import { storageRouter } from "./storage";
import { studentProgressRouter } from "./student-progress";
import { supportRouter } from "./support";
import { thankYouLetterRouter } from "./thank-you-letter";
import { trainingRouter } from "./training";
import { userActivityRouter } from "./user-activity";
import { userSettingsRouter } from "./user-settings";
import { videoAnalysisRouter } from "./video-analysis";
import { voiceInterviewRouter } from "./voice-interview";
import { workSamplesRouter } from "./work-samples";

export default {
	achievements: achievementsRouter,
	activity: activityRouter,
	adaptiveLearning: adaptiveLearningRouter,
	admin: adminRouter,
	ai: aiRouter,
	aiConfig: aiConfigRouter,
	aiHistory: aiHistoryRouter,
	aiMentor: aiMentorRouter,
	aiWriter: aiWriterRouter,
	auth: authRouter,
	branding: brandingRouter,
	brandingExamples: brandingExampleRouter,
	career: careerRouter,
	chatbotSession: chatbotSessionRouter,
	careerCoaching: careerCoachingRouter,
	careerMatcher: careerMatcherRouter,
	careerQuizQuestions: careerQuizQuestionsRouter,
	careerQuizOptions: careerQuizOptionsRouter,
	careerQuizResults: careerQuizResultsRouter,
	careerQuizSeed: careerQuizSeedRouter,
	careerQuizAdaptive: careerQuizAdaptiveRouter,
	careerRole: careerRoleRouter,
	careerTransition: careerTransitionRouter,
	certificationLibrary: certificationLibraryRouter,
	companyResearch: companyResearchRouter,
	confidenceExercises: confidenceExercisesRouter,
	coverLetter: coverLetterRouter,
	cultureMatch: cultureMatchRouter,
	dashboard: dashboardRouter,
	dataExport: dataExportRouter,
	deadlines: deadlinesRouter,
	elevatorPitch: elevatorPitchRouter,
	experienceOptimizer: experienceOptimizerRouter,
	flags: flagsRouter,
	freelance: freelanceRouter,
	goals: goalsRouter,
	insights: insightsRouter,
	interview: interviewRouter,
	interviewAnalytics: interviewAnalyticsRouter,
	interviewChecklist: interviewChecklistRouter,
	interviewFeedback: interviewFeedbackRouter,
	interviewNotes: interviewNotesRouter,
	interviewPrep: interviewPrepRouter,
	interviewRecording: interviewRecordingRouter,
	interviewScheduler: interviewSchedulerRouter,
	interviewTracking: interviewTrackingRouter,
	jobAggregator: jobAggregatorRouter,
	jobAlerts: jobAlertsRouter,
	jobApplications: jobApplicationsRouter,
	jobMatch: jobMatchRouter,
	jobRecommendations: jobRecommendationRouter,
	jobResources: jobResourcesRouter,
	journal: journalRouter,
	learningPath: learningPathRouter,
	learningRecommendations: learningRecommendationsRouter,
	skillProgress: skillProgressRouter,
	linkedin: linkedinRouter,
	linkedinContent: linkedinContentRouter,
	marketIntelligence: marketIntelligenceRouter,
	mentorMessaging: mentorMessagingRouter,
	mentors: mentorsRouter,
	messageTemplate: messageTemplateRouter,
	messaging: messagingRouter,
	mockAi: mockAiRouter,
	networking: networkingRouter,
	networkingEvents: networkingEventsRouter,
	notification: notificationRouter,
	outfitChecklist: outfitChecklistRouter,
	partner: partnerRouter,
	printer: printerRouter,
	qrCode: qrCodeRouter,
	quickChecklist: quickChecklistRouter,
	recommendationRequest: recommendationRequestRouter,
	remoteReadiness: remoteReadinessRouter,
	resources: resourcesRouter,
	resume: resumeRouter,
	resumeGallery: resumeGalleryRouter,
	resumeHistory: resumeHistoryRouter,
	resumeScoring: resumeScoringRouter,
	reviewPrep: reviewPrepRouter,
	salaryHistory: salaryHistoryRouter,
	search: searchRouter,
	shortcuts: shortcutsRouter,
	starMethod: starMethodRouter,
	statistics: statisticsRouter,
	storage: storageRouter,
	analytics: analyticsRouter,
	support: supportRouter,
	thankYouLetter: thankYouLetterRouter,
	training: trainingRouter,
	userActivity: userActivityRouter,
	userSettings: userSettingsRouter,
	videoAnalysis: videoAnalysisRouter,
	voiceInterview: voiceInterviewRouter,
	workSamples: workSamplesRouter,
	// Reference data routers
	imtaPrograms: imtaProgramsRouter,
	interviewTips: interviewTipsRouter,
	interviewQuestions: interviewQuestionsRouter,
	marketInsights: marketInsightsRouter,
	employers: employersRouter,
	skillLibrary: skillsRouter,
	seed: seedRouter,
	// AI Analytics routers
	aiAnalyticsAdmin: aiAnalyticsAdminRouter,
	aiAnalyticsStudent: aiAnalyticsStudentRouter,
	// Skill Gap analyzer
	skillGap: skillGapRouter,
	// Student Progress tracking
	studentProgress: studentProgressRouter,
	// AI Training Data Collection
	aiTraining: aiTrainingRouter,
	// Cohort Analytics (Admin)
	cohortAnalytics: cohortAnalyticsRouter,
	// AI Performance Metrics
	aiMetrics: aiMetricsRouter,
	// ATS Compatibility Checker
	atsChecker: atsCheckerRouter,
};
