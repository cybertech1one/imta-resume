import { msg } from "@lingui/core/macro";
import {
	BriefcaseIcon,
	GlobeIcon,
	PaletteIcon,
	RocketLaunchIcon,
	SparkleIcon,
	StarIcon,
	ThumbsUpIcon,
} from "@phosphor-icons/react";

import type {
	CoverLetterData,
	JobDetails,
	KeywordMatch,
	SectionType,
	TemplateConfig,
	TemplateType,
	ToneConfig,
	ToneType,
} from "./cover-letter-types";

export const templateConfig: Record<TemplateType, TemplateConfig> = {
	formal: {
		label: msg`Formal`,
		icon: BriefcaseIcon,
		description: msg`Traditional tone with classic structure`,
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
	},
	creative: {
		label: msg`Creative`,
		icon: PaletteIcon,
		description: msg`Original and eye-catching to stand out`,
		color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
		gradient: "from-purple-500/20 via-violet-500/10 to-transparent",
	},
	"tech-focused": {
		label: msg`Technical`,
		icon: GlobeIcon,
		description: msg`Ideal for IT and tech positions`,
		color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
		gradient: "from-cyan-500/20 via-teal-500/10 to-transparent",
	},
	executive: {
		label: msg`Executive`,
		icon: StarIcon,
		description: msg`Leadership and strategic vision`,
		color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
	},
};

export const toneConfig: Record<ToneType, ToneConfig> = {
	professional: {
		label: msg`Professional`,
		icon: BriefcaseIcon,
		description: msg`Balanced and formal`,
	},
	friendly: {
		label: msg`Friendly`,
		icon: ThumbsUpIcon,
		description: msg`Warm and approachable`,
	},
	confident: {
		label: msg`Confident`,
		icon: RocketLaunchIcon,
		description: msg`Assertive and impactful`,
	},
	enthusiastic: {
		label: msg`Enthusiastic`,
		icon: SparkleIcon,
		description: msg`Energetic and passionate`,
	},
};

export const sectionLabels: Record<SectionType, ReturnType<typeof msg>> = {
	intro: msg`Introduction`,
	body: msg`Body`,
	closing: msg`Closing`,
};

const sampleContent: Record<TemplateType, Record<ToneType, CoverLetterData>> = {
	formal: {
		professional: {
			intro:
				"Dear Hiring Manager,\n\nI am writing to express my interest in the [POSITION] role at [COMPANY]. Your organization, renowned for its excellence in the field, represents a premier professional opportunity for me.",
			body: "With extensive experience in project management and strong leadership skills, I have developed a solid expertise that enables me to contribute effectively to an organization's strategic objectives.\n\nThroughout my professional career, I have had the opportunity to:\n- Lead complex projects with cross-functional teams\n- Meet and exceed set objectives with a 25% improvement in performance\n- Implement innovative processes that optimize operational efficiency\n\nMy communication and teamwork skills allow me to rally colleagues around shared goals.",
			closing:
				"I would be honored to meet with you to present my candidacy in greater detail and discuss how I could contribute to [COMPANY]'s success.\n\nThank you for your time and consideration.\n\nSincerely,",
			keywords: ["Project Management", "Leadership", "Communication", "Teamwork", "Innovation", "Results"],
		},
		friendly: {
			intro:
				"Hello,\n\nI'm excited to submit my application for the [POSITION] role at [COMPANY]. I've been following your company's growth closely and I'm convinced my profile matches what you're looking for.",
			body: "My career has allowed me to develop diverse skills in project management and leadership. I particularly enjoy working in teams and tackling new challenges.\n\nHere are a few examples of my achievements:\n- Leading motivated teams on exciting projects\n- Building trust-based relationships with partners\n- Implementing creative solutions to reach our objectives\n\nI'm recognized for my ability to communicate effectively and maintain a positive work atmosphere.",
			closing:
				"I'd love to chat with you about this opportunity and show you how I could contribute to the [COMPANY] team.\n\nThank you for your consideration — looking forward to hearing from you!",
			keywords: ["Teamwork", "Communication", "Creativity", "Motivation", "Relationships"],
		},
		confident: {
			intro:
				"Dear Hiring Manager,\n\nThe [POSITION] role at [COMPANY] represents exactly the type of challenge I'm looking for. My experience and track record prove I am the ideal candidate for this strategic role.",
			body: "Throughout my career, I have consistently exceeded expectations and generated significant results for my employers.\n\nMy accomplishments include:\n- Leading major projects with a 95% success rate\n- Increasing productivity by 30% through my initiatives\n- Negotiating strategic contracts worth several million dollars\n- Training and mentoring high-performing teams\n\nI possess the expertise needed to turn challenges into growth opportunities.",
			closing:
				"I am available immediately for an interview and ready to demonstrate the value I will bring to [COMPANY].\n\nBest regards,",
			keywords: ["Results", "Performance", "Leadership", "Strategy", "Growth"],
		},
		enthusiastic: {
			intro:
				"Dear Hiring Manager,\n\nIt is with great enthusiasm that I submit my application for the [POSITION] role at [COMPANY]! Your company embodies everything I'm passionate about in this industry.",
			body: "I am passionate about innovation and developing solutions that truly make a difference. My energy and determination have enabled me to accomplish projects I'm particularly proud of:\n\n- Launching new initiatives praised by senior management\n- Creating an exceptional team dynamic\n- Developing innovative processes adopted company-wide\n\nEvery day, I commit to giving my best and inspiring those around me!",
			closing: "I can't wait to meet you and share my vision and enthusiasm for this exciting role!\n\nWarm regards,",
			keywords: ["Passion", "Innovation", "Energy", "Commitment", "Inspiration"],
		},
	},
	creative: {
		professional: {
			intro:
				"Dear Hiring Manager,\n\nImagine a collaborator who brings both creativity and professional rigor. That's exactly what I offer as a candidate for the [POSITION] role at [COMPANY].",
			body: "My unique approach combines innovation and methodology, enabling me to find original solutions to complex problems.\n\nA few examples of my applied creativity:\n- Designing a new approach that reduced lead times by 40%\n- Creating visual tools that improved team communication\n- Developing marketing strategies that doubled client engagement\n\nI firmly believe that creativity is an essential driver of performance.",
			closing:
				"I would be delighted to present in person how my creative vision could benefit [COMPANY].\n\nLooking forward to our meeting. Best regards,",
			keywords: ["Creativity", "Innovation", "Solutions", "Vision", "Performance"],
		},
		friendly: {
			intro:
				"Hi there!\n\nWhat if we talked about what truly motivates me? The [POSITION] role at [COMPANY] perfectly matches my creative personality and my desire to push boundaries.",
			body: "I love transforming ideas into reality and collaborating with inspiring people. My journey is filled with enriching experiences:\n\n- Organizing memorable events that united teams\n- Creating engaging content followed by thousands\n- Facilitating brainstorming workshops overflowing with fresh ideas\n\nLet's work together to create something exceptional!",
			closing:
				"I'd love to meet and exchange ideas about our respective visions. I'm sure that together, we can achieve great things!\n\nSee you soon,",
			keywords: ["Collaboration", "Creativity", "Ideas", "Engagement", "Teamwork"],
		},
		confident: {
			intro:
				"Dear Hiring Manager,\n\nCreativity without results is just a distraction. My application for the [POSITION] role at [COMPANY] will prove that innovation and performance go hand in hand.",
			body: "My creative ideas never stay on paper — they transform into measurable successes.\n\nResults of my creative approach:\n- +50% visibility through an innovative campaign\n- Patents filed for original solutions\n- Awards received for creative excellence\n- Triple ROI on projects I led\n\nMy creativity is a strategic tool serving your objectives.",
			closing:
				"Let's meet so I can demonstrate how my strategic creativity will generate value for [COMPANY].\n\nBest regards,",
			keywords: ["Innovation", "Results", "Strategy", "Performance", "Excellence"],
		},
		enthusiastic: {
			intro:
				"Wow! The [POSITION] role at [COMPANY] is exactly what I've been waiting for!\n\nI'm an idea creator and a project maker, and your company is the ideal playground for my imagination!",
			body: "My creativity knows no bounds, and I've learned to channel it for real impact:\n\n- Design thinking applied to problem-solving\n- Viral campaigns that lit up social media\n- Innovative prototypes developed in record time\n- Memorable artistic collaborations\n\nEvery project is a new creative adventure that I approach with passion and determination!",
			closing:
				"I'm bursting with ideas for [COMPANY] and can't wait to share them with you! Let's meet soon!\n\nCreatively yours,",
			keywords: ["Passion", "Creativity", "Innovation", "Impact", "Adventure"],
		},
	},
	"tech-focused": {
		professional: {
			intro:
				"Dear Hiring Manager,\n\nAs a Developer/Engineer with solid technical expertise, I wish to put my skills at the service of [COMPANY] by applying for the [POSITION] role.",
			body: "My technical profile covers a broad spectrum of competencies:\n\nTech Stack:\n- Languages: Python, JavaScript, TypeScript, Go\n- Frameworks: React, Node.js, Django, FastAPI\n- Cloud: AWS, GCP, Kubernetes, Docker\n- Data: PostgreSQL, MongoDB, Redis, Elasticsearch\n\nKey Achievements:\n- Architecting systems handling 1M+ requests/day\n- 60% reduction in deployment time via CI/CD\n- Implementing DevOps practices achieving 99.9% reliability",
			closing:
				"I would be happy to discuss how my technical skills could address [COMPANY]'s challenges.\n\nBest regards,",
			keywords: ["Python", "Cloud", "DevOps", "Architecture", "Performance"],
		},
		friendly: {
			intro:
				"Hello,\n\nPassionate about technology since forever, I'm excited at the prospect of joining [COMPANY]'s tech team as [POSITION]. I love solving complex problems and learning new technologies!",
			body: "My tech journey is a continuous learning adventure:\n\n- Open source contributions appreciated by the community\n- Hackathons won with innovative solutions\n- Technical blog followed by thousands of developers\n- Mentoring juniors who have become outstanding devs\n\nI enjoy coding just as much as exchanging ideas with the team about the best technical approaches!",
			closing:
				"It would be great to talk tech with you! I'm available for a technical interview whenever works.\n\nSee you soon!",
			keywords: ["Open Source", "Innovation", "Collaboration", "Learning", "Tech"],
		},
		confident: {
			intro:
				"Dear Hiring Manager,\n\nAs a Senior Engineer with 8+ years of experience, I have the expertise needed to lead your most ambitious tech projects. The [POSITION] role at [COMPANY] matches my capabilities perfectly.",
			body: "My technical expertise has generated concrete results:\n\n- Cloud migration saving $500K/year\n- ML system in production serving 10M+ users\n- Technical leadership of a 15-engineer team\n- Zero-downtime architecture successfully implemented\n\nCutting-edge Skills:\n- Large-scale system design\n- Machine Learning and MLOps\n- Security and compliance (SOC2, GDPR)\n- Tech leadership and architecture decision-making",
			closing: "I am ready to bring my expertise to accelerate [COMPANY]'s technical growth.\n\nBest regards,",
			keywords: ["Leadership", "Cloud", "ML", "Architecture", "Scale"],
		},
		enthusiastic: {
			intro:
				"Hello!\n\nTech is my passion! When I saw the [POSITION] opening at [COMPANY], I knew it was the ideal opportunity to combine innovation and impact!",
			body: "I'm constantly on the lookout for the latest technologies and love putting them into practice:\n\n- First POCs with new tech before anyone else\n- Conferences given on emerging trends\n- Side projects that became globally-used products\n- Tech community co-founded with 5000+ members\n\nTech evolves fast, and I evolve even faster!",
			closing:
				"I'm eager to discover your tech challenges and show you how I can tackle them with passion!\n\nSee you very soon!",
			keywords: ["Innovation", "Passion", "Trends", "Community", "Impact"],
		},
	},
	executive: {
		professional: {
			intro:
				"Dear Hiring Manager,\n\nAs a Director with over 15 years of strategic management experience, I wish to put my expertise at the service of [COMPANY] as [POSITION].",
			body: "My leadership journey is characterized by successful transformations and clear strategic vision.\n\nExecutive Achievements:\n- P&L of $50M managed with 20% annual growth\n- Digital transformation of a 500-person business unit\n- M&A: Successful integration of 3 acquisitions\n- Development of new markets generating 30% of revenue\n\nLeadership Competencies:\n- Strategic vision and operational execution\n- Leadership of multicultural teams\n- Negotiation and stakeholder relations\n- Change management and transformation",
			closing:
				"I would be honored to discuss how my experience could contribute to [COMPANY]'s strategy.\n\nSincerely,",
			keywords: ["Strategy", "Leadership", "P&L", "Transformation", "Growth"],
		},
		friendly: {
			intro:
				"Hello,\n\nAfter leading teams and large-scale projects, I'm convinced that true leadership is built on people. This is the vision I wish to bring to [COMPANY] as [POSITION].",
			body: "My management approach prioritizes listening and trust:\n\n- Teams retained with turnover cut in half\n- Positive company culture recognized externally\n- Developing talent who became leaders themselves\n- Lasting partnerships built on mutual respect\n\nI believe a good leader is above all in service of their teams.",
			closing:
				"I'd love to discuss [COMPANY]'s culture and values. I'm sure we share a common vision.\n\nWarm regards,",
			keywords: ["Leadership", "Culture", "Trust", "Development", "Values"],
		},
		confident: {
			intro:
				"Dear Hiring Manager,\n\nMy results speak for themselves. As an experienced executive, I know how to transform organizations and generate sustainable growth. The [POSITION] role at [COMPANY] is my logical next step.",
			body: "Track record of transformation and growth:\n\n- Revenue tripled in 5 years ($50M to $150M)\n- International expansion: 5 new countries\n- Successful IPO with $500M valuation\n- Restructuring that saved 2,000 jobs\n\nMy leadership is characterized by:\n- Bold strategic decisions\n- Flawless execution\n- Ability to mobilize around a vision\n- Results that exceed expectations",
			closing:
				"[COMPANY] deserves a leader of caliber. I am that leader.\n\nLet's arrange a meeting to discuss strategy.\n\nBest regards,",
			keywords: ["Growth", "Transformation", "Strategy", "Results", "Vision"],
		},
		enthusiastic: {
			intro:
				"Dear Hiring Manager,\n\nLeading isn't just a profession — it's a calling! I'm passionate about developing organizations and people, and [COMPANY] represents the ideal ground to express this passion!",
			body: "What motivates me every day:\n\n- Watching my colleagues thrive and succeed\n- Turning challenges into growth opportunities\n- Building something with lasting impact\n- Innovating and pushing the limits of what's possible\n\nMy greatest prides:\n- Teams that followed me from company to company\n- Innovations that became industry standards\n- Company culture that became a model\n- Mentees who became CEOs",
			closing:
				"I'm enthusiastic about discovering [COMPANY]'s ambitions and contributing to them with all my energy!\n\nBest regards,",
			keywords: ["Passion", "Leadership", "Innovation", "Impact", "Growth"],
		},
	},
};

export function extractKeywords(description: string): KeywordMatch[] {
	const keywordPatterns = [
		{ pattern: /project\s*management/gi, keyword: "Project Management", category: "Skill" },
		{ pattern: /leadership/gi, keyword: "Leadership", category: "Soft Skill" },
		{ pattern: /communication/gi, keyword: "Communication", category: "Soft Skill" },
		{ pattern: /innovation/gi, keyword: "Innovation", category: "Value" },
		{ pattern: /team\s*work|team\s*player/gi, keyword: "Teamwork", category: "Soft Skill" },
		{ pattern: /result[s]?/gi, keyword: "Results", category: "Value" },
		{ pattern: /python|javascript|java|typescript/gi, keyword: "Programming", category: "Skill" },
		{ pattern: /cloud|aws|azure|gcp/gi, keyword: "Cloud", category: "Skill" },
		{ pattern: /agile|scrum/gi, keyword: "Agile Methodology", category: "Skill" },
		{ pattern: /analy/gi, keyword: "Analytics", category: "Skill" },
		{ pattern: /strateg/gi, keyword: "Strategy", category: "Skill" },
		{ pattern: /client[s]?|customer[s]?/gi, keyword: "Client Relations", category: "Soft Skill" },
	];

	const keywords: KeywordMatch[] = [];

	for (const { pattern, keyword, category } of keywordPatterns) {
		const matches = description.match(pattern);
		if (matches && matches.length > 0) {
			keywords.push({ keyword, count: matches.length, category });
		}
	}

	return keywords.sort((a, b) => b.count - a.count);
}

export function generateCoverLetter(jobDetails: JobDetails, template: TemplateType, tone: ToneType): CoverLetterData {
	const baseContent = sampleContent[template][tone];

	const replaceVariables = (text: string) =>
		text
			.replace(/\[COMPANY\]/g, jobDetails.company || "[Company Name]")
			.replace(/\[POSITION\]/g, jobDetails.position || "[Target Position]");

	return {
		intro: replaceVariables(baseContent.intro),
		body: replaceVariables(baseContent.body),
		closing: replaceVariables(baseContent.closing),
		keywords: baseContent.keywords,
	};
}
