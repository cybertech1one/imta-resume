import { t } from "@lingui/core/macro";
import { DiamondIcon, HeartIcon, TargetIcon, TrendUpIcon, UserIcon } from "@phosphor-icons/react";

import type { ChecklistItem, ColorPalette, LogoConcept, VoiceTone } from "./branding-types";

// Wizard Steps (UI-only, not database driven)
export const getBrandWizardSteps = () => [
	{ id: 1, title: t`Profession`, icon: UserIcon },
	{ id: 2, title: t`Audience`, icon: TargetIcon },
	{ id: 3, title: t`Unique Strength`, icon: DiamondIcon },
	{ id: 4, title: t`Value`, icon: TrendUpIcon },
	{ id: 5, title: t`Personality`, icon: HeartIcon },
];

// Fallback data (used when database is empty or during loading)
// Wrapped in functions so t`` resolves with active locale
export function getFallbackProfessionExamples() {
	return [
		t`Web Developer`,
		t`UX/UI Designer`,
		t`Project Manager`,
		t`Marketing Consultant`,
		t`Data Scientist`,
		t`Nurse`,
		t`HSE Technician`,
		t`Electromechanical Technician`,
	];
}

export function getFallbackAudienceExamples() {
	return [
		t`Tech Startups`,
		t`Industrial SMEs`,
		t`Hospitals and Clinics`,
		t`Communication Agencies`,
		t`Large Corporations`,
		t`Entrepreneurs`,
	];
}

export function getFallbackStrengthExamples() {
	return [
		t`Complex problem solving`,
		t`Empathetic communication`,
		t`Creative innovation`,
		t`Natural leadership`,
		t`Attention to detail`,
		t`Quick adaptability`,
	];
}

export function getFallbackValueExamples() {
	return [
		t`Increase productivity`,
		t`Reduce costs`,
		t`Improve customer experience`,
		t`Ensure safety`,
		t`Accelerate growth`,
		t`Optimize processes`,
	];
}

export function getFallbackPersonalityTraits() {
	return [
		t`Professional and serious`,
		t`Creative and innovative`,
		t`Warm and approachable`,
		t`Dynamic and energetic`,
		t`Calm and thoughtful`,
		t`Bold and ambitious`,
	];
}

export function getLogoConcepts(): LogoConcept[] {
	return [
		{
			id: "monogram",
			name: t`Personal Monogram`,
			description: t`Your initials stylized in an elegant and memorable design`,
			symbolType: "initiales",
			colors: ["#2563eb", "#1e40af"],
			style: t`minimalist`,
		},
		{
			id: "abstract",
			name: t`Abstract Symbol`,
			description: t`A unique geometric shape representing your professional essence`,
			symbolType: "geometrique",
			colors: ["#059669", "#047857"],
			style: t`modern`,
		},
		{
			id: "icon",
			name: t`Professional Icon`,
			description: t`A recognizable symbol linked to your area of expertise`,
			symbolType: "iconique",
			colors: ["#7c3aed", "#6d28d9"],
			style: t`professional`,
		},
		{
			id: "wordmark",
			name: t`Typographic Wordmark`,
			description: t`Your name with distinctive and personalized typography`,
			symbolType: "typographie",
			colors: ["#dc2626", "#b91c1c"],
			style: t`classic`,
		},
		{
			id: "emblem",
			name: t`Personal Emblem`,
			description: t`A badge or seal representing your personal brand`,
			symbolType: "embleme",
			colors: ["#ca8a04", "#a16207"],
			style: t`premium`,
		},
	];
}

export function getColorPalettes(): ColorPalette[] {
	return [
		{
			id: "professional-blue",
			name: t`Professional Blue`,
			description: t`Inspires trust, seriousness, and competence`,
			colors: [
				{ name: t`Primary`, hex: "#1e40af", usage: t`Logo, headings` },
				{ name: t`Secondary`, hex: "#3b82f6", usage: t`Accents, links` },
				{ name: t`Light`, hex: "#dbeafe", usage: t`Backgrounds` },
				{ name: t`Neutral`, hex: "#1f2937", usage: t`Text` },
			],
			mood: t`Trust, Professionalism`,
			industries: [t`Finance`, t`Tech`, t`Consulting`],
		},
		{
			id: "creative-purple",
			name: t`Creative Purple`,
			description: t`Evokes creativity, innovation, and originality`,
			colors: [
				{ name: t`Primary`, hex: "#7c3aed", usage: t`Logo, headings` },
				{ name: t`Secondary`, hex: "#a78bfa", usage: t`Accents` },
				{ name: t`Light`, hex: "#ede9fe", usage: t`Backgrounds` },
				{ name: t`Neutral`, hex: "#374151", usage: t`Text` },
			],
			mood: t`Creativity, Innovation`,
			industries: [t`Design`, t`Marketing`, t`Art`],
		},
		{
			id: "nature-green",
			name: t`Nature Green`,
			description: t`Represents growth, balance, and health`,
			colors: [
				{ name: t`Primary`, hex: "#059669", usage: t`Logo, headings` },
				{ name: t`Secondary`, hex: "#34d399", usage: t`Accents` },
				{ name: t`Light`, hex: "#d1fae5", usage: t`Backgrounds` },
				{ name: t`Neutral`, hex: "#1f2937", usage: t`Text` },
			],
			mood: t`Growth, Balance`,
			industries: [t`Healthcare`, t`Environment`, t`Wellness`],
		},
		{
			id: "energy-orange",
			name: t`Energetic Orange`,
			description: t`Communicates enthusiasm, vitality, and action`,
			colors: [
				{ name: t`Primary`, hex: "#ea580c", usage: t`Logo, headings` },
				{ name: t`Secondary`, hex: "#fb923c", usage: t`Accents` },
				{ name: t`Light`, hex: "#ffedd5", usage: t`Backgrounds` },
				{ name: t`Neutral`, hex: "#292524", usage: t`Text` },
			],
			mood: t`Energy, Action`,
			industries: [t`Sports`, t`Events`, t`Startups`],
		},
		{
			id: "elegant-black",
			name: t`Elegant Black`,
			description: t`Sophistication, luxury, and authority`,
			colors: [
				{ name: t`Primary`, hex: "#18181b", usage: t`Logo, headings` },
				{ name: t`Secondary`, hex: "#71717a", usage: t`Accents` },
				{ name: t`Light`, hex: "#f4f4f5", usage: t`Backgrounds` },
				{ name: t`Gold`, hex: "#ca8a04", usage: t`Premium details` },
			],
			mood: t`Luxury, Authority`,
			industries: [t`Fashion`, t`Real Estate`, t`Premium Consulting`],
		},
	];
}

export function getVoiceTones(): VoiceTone[] {
	return [
		{
			id: "professional",
			name: t`Expert Professional`,
			description: t`Formal and authoritative tone that establishes credibility`,
			characteristics: [t`Precise`, t`Factual`, t`Confident`, t`Respectful`],
			examples: {
				headline: t`Digital transformation expert with 10 years of experience`,
				bio: t`With deep expertise in the field, I help companies navigate their strategic challenges.`,
			},
			bestFor: [t`Finance`, t`Legal`, t`Consulting`],
		},
		{
			id: "friendly",
			name: t`Warm and Approachable`,
			description: t`Friendly tone that creates a human connection`,
			characteristics: [t`Welcoming`, t`Empathetic`, t`Simple`, t`Positive`],
			examples: {
				headline: t`I help you bring your digital projects to life`,
				bio: t`Passionate about my work, I love creating solutions that truly make a difference for my clients.`,
			},
			bestFor: [t`Coaching`, t`Healthcare`, t`Education`],
		},
		{
			id: "bold",
			name: t`Bold and Inspiring`,
			description: t`Dynamic tone that motivates and excites`,
			characteristics: [t`Energetic`, t`Motivating`, t`Direct`, t`Ambitious`],
			examples: {
				headline: t`Ready to revolutionize your marketing strategy?`,
				bio: t`I push the boundaries of what's possible to turn your ideas into resounding successes.`,
			},
			bestFor: [t`Marketing`, t`Entrepreneurship`, t`Innovation`],
		},
		{
			id: "creative",
			name: t`Creative and Original`,
			description: t`Unique and memorable tone that stands out`,
			characteristics: [t`Imaginative`, t`Surprising`, t`Artistic`, t`Playful`],
			examples: {
				headline: t`Where technology meets the art of the possible`,
				bio: t`Digital explorer, I transform pixels into emotions and lines of code into memorable experiences.`,
			},
			bestFor: [t`Design`, t`Art`, t`Media`],
		},
		{
			id: "authoritative",
			name: t`Visionary Leader`,
			description: t`Assertive tone that inspires respect and confidence`,
			characteristics: [t`Visionary`, t`Strategic`, t`Decisive`, t`Inspiring`],
			examples: {
				headline: t`Architect of tomorrow's transformation`,
				bio: t`Strategic leader, I guide organizations toward operational excellence and sustainable innovation.`,
			},
			bestFor: [t`Management`, t`Consulting`, t`Industry`],
		},
	];
}

export function getSocialMediaChecklist(): ChecklistItem[] {
	return [
		{
			id: "sm1",
			category: "LinkedIn",
			label: t`High-quality professional photo`,
			description: t`Recent photo, neutral background, professional attire`,
			importance: "critical",
		},
		{
			id: "sm2",
			category: "LinkedIn",
			label: t`Catchy and descriptive headline`,
			description: t`Beyond a simple job title, show your value`,
			importance: "critical",
		},
		{
			id: "sm3",
			category: "LinkedIn",
			label: t`Engaging summary (About)`,
			description: t`First person, personal story, call to action`,
			importance: "critical",
		},
		{
			id: "sm4",
			category: "LinkedIn",
			label: t`Custom URL`,
			description: t`linkedin.com/in/your-name instead of numbers`,
			importance: "important",
		},
		{
			id: "sm5",
			category: "LinkedIn",
			label: t`Custom banner`,
			description: t`Cover image aligned with your brand`,
			importance: "important",
		},
		{
			id: "sm6",
			category: "Twitter/X",
			label: t`Impactful bio (160 characters)`,
			description: t`Concise presentation with keywords and personality`,
			importance: "critical",
		},
		{
			id: "sm7",
			category: "Twitter/X",
			label: t`Consistent profile photo`,
			description: t`Same photo or style as LinkedIn for recognition`,
			importance: "important",
		},
		{
			id: "sm8",
			category: "Instagram",
			label: t`Bio with value proposition`,
			description: t`What you do + for whom + link`,
			importance: "critical",
		},
		{
			id: "sm9",
			category: "Instagram",
			label: t`Organized highlights`,
			description: t`Categorized featured stories (Portfolio, Testimonials, etc.)`,
			importance: "nice-to-have",
		},
		{
			id: "sm10",
			category: "General",
			label: t`Uniform username`,
			description: t`Same handle across all platforms if possible`,
			importance: "important",
		},
	];
}

export function getWebsiteChecklist(): ChecklistItem[] {
	return [
		{
			id: "ws1",
			category: t`Home Page`,
			label: t`Clear value proposition`,
			description: t`In 5 seconds, the visitor understands what you do`,
			importance: "critical",
		},
		{
			id: "ws2",
			category: t`Home Page`,
			label: t`Visible call to action`,
			description: t`Contact button or main action clearly visible`,
			importance: "critical",
		},
		{
			id: "ws3",
			category: t`About`,
			label: t`Authentic personal story`,
			description: t`Background, motivations, values that define you`,
			importance: "critical",
		},
		{
			id: "ws4",
			category: t`About`,
			label: t`Professional photo`,
			description: t`Quality image that humanizes your site`,
			importance: "important",
		},
		{
			id: "ws5",
			category: t`Portfolio`,
			label: t`Detailed case studies`,
			description: t`Context, challenge, solution, results for each project`,
			importance: "critical",
		},
		{
			id: "ws6",
			category: t`Portfolio`,
			label: t`Quality visuals`,
			description: t`Images, screenshots, or videos of your work`,
			importance: "important",
		},
		{
			id: "ws7",
			category: t`Testimonials`,
			label: t`Verifiable client reviews`,
			description: t`Quotes with name, photo, and company if possible`,
			importance: "important",
		},
		{
			id: "ws8",
			category: t`Contact`,
			label: t`Functional form`,
			description: t`Simple form, response time indicated`,
			importance: "critical",
		},
		{
			id: "ws9",
			category: t`Contact`,
			label: t`Multiple contact information`,
			description: t`Email, phone, social media`,
			importance: "important",
		},
		{
			id: "ws10",
			category: t`Technical`,
			label: t`Mobile responsive site`,
			description: t`Perfectly readable on smartphone and tablet`,
			importance: "critical",
		},
		{
			id: "ws11",
			category: t`Technical`,
			label: t`Fast loading`,
			description: t`Less than 3 seconds loading time`,
			importance: "important",
		},
		{
			id: "ws12",
			category: "SEO",
			label: t`Optimized meta descriptions`,
			description: t`Title and description for each page`,
			importance: "nice-to-have",
		},
	];
}
