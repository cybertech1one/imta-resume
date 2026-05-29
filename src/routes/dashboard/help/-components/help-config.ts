import { t } from "@lingui/core/macro";
import {
	ChatsCircleIcon,
	CompassIcon,
	GraduationCapIcon,
	QuestionIcon,
	ReadCvLogoIcon,
	RobotIcon,
} from "@phosphor-icons/react";

import type { FAQCategory, QuickHelpCard, VideoTutorial } from "./help-types";

export function getFaqCategories(): FAQCategory[] {
	return [
		{
			id: "general",
			title: t`General Questions`,
			icon: QuestionIcon,
			color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
			items: [
				{
					question: t`What is this platform?`,
					answer: t`Our platform is a comprehensive tool designed for IMTA students to create professional resumes, prepare for job interviews, and explore training programs and careers. It combines a modern resume builder, an AI chatbot for interview preparation, and a complete resource center.`,
				},
				{
					question: t`How do I create my account?`,
					answer: t`To create an account, click 'Sign Up' on the home page. You can register with your email address or use your Google or GitHub accounts. After signing up, you will have immediate access to all platform features.`,
				},
				{
					question: t`Is the platform free?`,
					answer: t`Yes! The platform is completely free for all IMTA students and graduates. All features, including resume creation, interview preparation, and access to resources, are available at no cost.`,
				},
			],
		},
		{
			id: "cv",
			title: t`Resume Questions`,
			icon: ReadCvLogoIcon,
			color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
			items: [
				{
					question: t`How do I create my first resume?`,
					answer: t`Go to the 'Resumes' section of the dashboard and click 'Create a new resume'. Choose a template from our collection, then fill in your personal information, education, experience, and skills. The real-time editor lets you see changes instantly.`,
				},
				{
					question: t`How do I change templates?`,
					answer: t`In the resume editor, click on the 'Templates' tab in the right panel. You can browse all available templates and select a new one. Your information will be automatically adapted to the new design.`,
				},
				{
					question: t`How do I download my resume?`,
					answer: t`Once your resume is complete, click the 'Download' button at the top right of the editor. You can choose between PDF format (recommended for applications) or PNG. The PDF is optimized for printing and email.`,
				},
			],
		},
		{
			id: "interview",
			title: t`Interview Questions`,
			icon: ChatsCircleIcon,
			color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
			items: [
				{
					question: t`How does the practice system work?`,
					answer: t`Our practice system offers three modes: Quick Practice (3-5 questions with immediate feedback), Mock Interview (complete 20-minute simulation), and AI Chatbot (free conversation for personalized advice). Each mode is tailored to different preparation needs.`,
				},
				{
					question: t`What AI does the chatbot use?`,
					answer: t`Our chatbot uses advanced AI models to generate relevant questions and provide constructive feedback. It is specifically trained on common interview questions in the fields of healthcare, industry, and HSE in Morocco.`,
				},
				{
					question: t`How do I interpret my results?`,
					answer: t`After each session, you receive an overall score and detailed scores by category (communication, technical content, examples used). A chart shows your progress over time. Specific comments help you identify areas for improvement.`,
				},
			],
		},
		{
			id: "career",
			title: t`Career Questions`,
			icon: CompassIcon,
			color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
			items: [
				{
					question: t`How does the career orientation quiz work?`,
					answer: t`The career orientation quiz includes 10 questions about your work preferences, interests, and career goals. Based on your answers, the algorithm calculates a personality profile and suggests IMTA programs and careers that best match your profile.`,
				},
				{
					question: t`How do I choose a training program?`,
					answer: t`Explore our Training Center to discover all IMTA programs. Use filters by field (Healthcare, Industry, HSE) and view detailed program profiles. You can also compare multiple programs and read testimonials from former students.`,
				},
			],
		},
	];
}

export function getQuickHelpCards(): QuickHelpCard[] {
	return [
		{
			id: "cv",
			title: t`How to create a resume`,
			description: t`Step-by-step guide to creating a professional and attractive resume`,
			icon: ReadCvLogoIcon,
			color: "from-purple-500/20 to-pink-500/10",
			link: "/dashboard/resumes",
		},
		{
			id: "interview",
			title: t`How to practice interviews`,
			description: t`Prepare for interviews with our AI simulator`,
			icon: ChatsCircleIcon,
			color: "from-orange-500/20 to-red-500/10",
			link: "/dashboard/interview",
		},
		{
			id: "training",
			title: t`How to explore training programs`,
			description: t`Discover all IMTA programs and find yours`,
			icon: GraduationCapIcon,
			color: "from-blue-500/20 to-cyan-500/10",
			link: "/dashboard/resources",
		},
		{
			id: "chatbot",
			title: t`How to use the AI chatbot`,
			description: t`Get personalized advice for your career`,
			icon: RobotIcon,
			color: "from-green-500/20 to-emerald-500/10",
			link: "/dashboard/interview/chatbot",
		},
	];
}

export function getVideoTutorials(): VideoTutorial[] {
	return [
		{
			id: "cv-pro",
			title: t`Create a professional resume`,
			duration: t`5 min`,
			thumbnail: "",
			category: t`Resume`,
			url: "/dashboard/wiki/articles/resume-writing",
			description: t`Learn how to write an impactful resume that catches recruiters' attention. Practical tips and concrete examples.`,
			gradient: "from-purple-500/30 to-pink-500/20",
		},
		{
			id: "interview-success",
			title: t`Ace your interview`,
			duration: t`Interactive`,
			thumbnail: "",
			category: t`Interview`,
			url: "/dashboard/interview/star-method",
			description: t`Master the STAR method and proven techniques to impress during your job interviews.`,
			gradient: "from-orange-500/30 to-red-500/20",
		},
		{
			id: "career-explore",
			title: t`Explore careers`,
			duration: t`Interactive`,
			thumbnail: "",
			category: t`Career`,
			url: "/dashboard/career",
			description: t`Discover fields and career opportunities suited to your profile with our orientation tool.`,
			gradient: "from-blue-500/30 to-cyan-500/20",
		},
		{
			id: "linkedin-optimize",
			title: t`Optimize your LinkedIn profile`,
			duration: t`8 min`,
			thumbnail: "",
			category: t`LinkedIn`,
			url: "/dashboard/linkedin",
			description: t`Build an attractive LinkedIn profile that sets you apart and attracts professional opportunities.`,
			gradient: "from-sky-500/30 to-blue-600/20",
		},
		{
			id: "networking-techniques",
			title: t`Networking techniques`,
			duration: t`10 min`,
			thumbnail: "",
			category: t`Networking`,
			url: "/dashboard/networking",
			description: t`Develop your professional network and learn to create lasting and beneficial connections.`,
			gradient: "from-green-500/30 to-emerald-500/20",
		},
		{
			id: "salary-negotiation",
			title: t`Salary negotiation`,
			duration: t`7 min`,
			thumbnail: "",
			category: t`Salary`,
			url: "/dashboard/tools/negotiation",
			description: t`Strategies and techniques to negotiate your salary with confidence and get the compensation you deserve.`,
			gradient: "from-amber-500/30 to-yellow-500/20",
		},
	];
}
