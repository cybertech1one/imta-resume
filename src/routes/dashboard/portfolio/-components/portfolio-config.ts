import type {
	AnalyticsData,
	CaseStudy,
	Certification,
	PortfolioTheme,
	Project,
	Testimonial,
	WorkSample,
} from "./portfolio-types";

// Sample data removed - all portfolio data will come from database when backend is implemented
// Empty arrays serve as defaults until portfolio ORPC router is created
export const SAMPLE_PROJECTS: Project[] = [];
export const SAMPLE_CASE_STUDIES: CaseStudy[] = [];
export const SAMPLE_WORK_SAMPLES: WorkSample[] = [];
export const SAMPLE_CERTIFICATIONS: Certification[] = [];
export const SAMPLE_TESTIMONIALS: Testimonial[] = [];

export const PORTFOLIO_THEMES: PortfolioTheme[] = [
	{
		id: "minimal",
		name: "Minimal",
		preview: "/api/placeholder/300/200",
		colors: { primary: "#000000", secondary: "#ffffff", accent: "#0066ff" },
		layout: "grid",
	},
	{
		id: "modern",
		name: "Modern",
		preview: "/api/placeholder/300/200",
		colors: { primary: "#1a1a2e", secondary: "#16213e", accent: "#e94560" },
		layout: "masonry",
	},
	{
		id: "creative",
		name: "Creative",
		preview: "/api/placeholder/300/200",
		colors: { primary: "#2d3436", secondary: "#636e72", accent: "#fdcb6e" },
		layout: "cards",
	},
	{
		id: "professional",
		name: "Professional",
		preview: "/api/placeholder/300/200",
		colors: { primary: "#2c3e50", secondary: "#34495e", accent: "#3498db" },
		layout: "list",
	},
];

export const SAMPLE_ANALYTICS: AnalyticsData = {
	totalViews: 0,
	uniqueVisitors: 0,
	avgTimeOnPage: 0,
	topProjects: [],
	viewsOverTime: [],
	referralSources: [],
};

// Skill categories for project tags
export const SKILL_CATEGORIES = [
	{ name: "Frontend", skills: ["React", "Vue.js", "Angular", "Next.js", "TypeScript", "JavaScript", "HTML/CSS"] },
	{ name: "Backend", skills: ["Node.js", "Python", "Java", "Go", "PHP", "Ruby"] },
	{ name: "Database", skills: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase"] },
	{ name: "Cloud", skills: ["AWS", "Google Cloud", "Azure", "Docker", "Kubernetes"] },
	{ name: "Mobile", skills: ["React Native", "Flutter", "Swift", "Kotlin", "Expo"] },
	{ name: "Design", skills: ["Figma", "UI/UX", "Photoshop", "Illustrator"] },
];

// Project Categories
export const PROJECT_CATEGORIES = [
	"All",
	"Web Development",
	"Mobile Development",
	"Healthcare",
	"Industrial Tech",
	"E-Commerce",
	"SaaS",
];
