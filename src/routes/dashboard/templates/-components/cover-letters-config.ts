import type { Icon } from "@phosphor-icons/react";
import {
	BriefcaseIcon,
	CheckCircleIcon,
	EnvelopeSimpleIcon,
	FirstAidKitIcon,
	GearIcon,
	GraduationCapIcon,
	HardHatIcon,
	HeartbeatIcon,
	PaperPlaneRightIcon,
	RocketLaunchIcon,
	StarIcon,
	TargetIcon,
	TruckIcon,
	UserIcon,
} from "@phosphor-icons/react";
import type { CoverLetterTemplate, DomainCategory, TypeCategory } from "./cover-letters-types";

export const domainLabels: Record<DomainCategory, string> = {
	healthcare: "Healthcare",
	industrial: "Industrial",
	hse: "HSE",
	general: "General",
};

export const domainColors: Record<DomainCategory, string> = {
	healthcare: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	industrial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	hse: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	general: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
};

export const domainIcons: Record<DomainCategory, Icon> = {
	healthcare: FirstAidKitIcon,
	industrial: GearIcon,
	hse: HardHatIcon,
	general: BriefcaseIcon,
};

export const domainGradients: Record<DomainCategory, string> = {
	healthcare: "from-red-500/20 via-rose-500/10 to-transparent",
	industrial: "from-blue-500/20 via-indigo-500/10 to-transparent",
	hse: "from-amber-500/20 via-orange-500/10 to-transparent",
	general: "from-gray-500/20 via-slate-500/10 to-transparent",
};

export const typeLabels: Record<TypeCategory, string> = {
	spontaneous: "Unsolicited application",
	response: "Job posting response",
	internship: "Internship",
	first_job: "First job",
};

export const typeColors: Record<TypeCategory, string> = {
	spontaneous: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	response: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	internship: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
	first_job: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export const typeIcons: Record<TypeCategory, Icon> = {
	spontaneous: PaperPlaneRightIcon,
	response: EnvelopeSimpleIcon,
	internship: GraduationCapIcon,
	first_job: RocketLaunchIcon,
};

export const coverLetterTemplates: CoverLetterTemplate[] = [
	{
		id: "infirmier",
		name: "Cover Letter - Nurse",
		description: "Professional template for nursing positions in hospitals or clinics.",
		domain: "healthcare",
		type: "response",
		icon: HeartbeatIcon,
		tags: ["Hospital", "Clinic", "Care", "Patient"],
		content: `[Your name]
[Your address]
[Postal code, City]
[Phone]
[Email]

[Company name]
[Company address]
[Postal code, City]

[City], [Date]

Subject: Application for Nurse position - Ref. [Reference]

Dear Sir/Madam,

As a graduate in nursing from the Institut Marocain des Techniques Appliquees (IMTA), I am writing to apply for the nursing position at your facility.

My training at IMTA has equipped me with solid nursing skills, particularly in:
- Administering treatments and following medical protocols
- Comprehensive patient care and family support
- Emergency management and high-stress situations
- Working in multidisciplinary teams

During my hospital internships, I developed strong listening and empathy skills with patients. I also learned to handle emergency situations with calm and efficiency.

Motivated and diligent, I wish to put my skills to work for your facility and contribute to the quality of care provided to patients.

I am available for an interview at your convenience to discuss my motivations in more detail.

I look forward to hearing from you.

Sincerely,

[Your name]

Attachments: Resume, Diploma, Internship certificates`,
	},
	{
		id: "aide-soignant",
		name: "Cover Letter - Healthcare Assistant",
		description: "Template suited for healthcare assistant positions in medical facilities.",
		domain: "healthcare",
		type: "response",
		icon: FirstAidKitIcon,
		tags: ["Hospital", "Nursing Home", "Care", "Support"],
		content: `[Your name]
[Your address]
[Postal code, City]
[Phone]
[Email]

[Facility name]
[Address]
[Postal code, City]

[City], [Date]

Subject: Application for Healthcare Assistant position

Dear Sir/Madam,

Holding a Healthcare Assistant diploma obtained from IMTA (Institut Marocain des Techniques Appliquees), I am submitting my application for the healthcare assistant position at your facility.

During my training, I acquired the essential skills to:
- Assist patients with daily activities
- Provide hygiene and comfort care
- Participate in monitoring patients' health status
- Collaborate with the care team following established protocols

My internships allowed me to develop a caring and attentive approach toward the people in my care. I am particularly sensitive to patient well-being and the quality of support they receive.

Patient, attentive, and possessing strong interpersonal skills, I wish to fully commit to your team and contribute to the smooth operation of your department.

I would be honored to meet with you to present my motivations in person.

Sincerely,

[Your name]

Attachments: Resume, Healthcare Assistant Diploma`,
	},
	{
		id: "technicien-hse",
		name: "Cover Letter - HSE Technician",
		description: "Template for positions in industrial Hygiene, Safety, and Environment.",
		domain: "hse",
		type: "response",
		icon: HardHatIcon,
		tags: ["Safety", "Environment", "Prevention", "Industry"],
		content: `[Your name]
[Your address]
[Postal code, City]
[Phone]
[Email]

[Company name]
[Address]
[Postal code, City]

[City], [Date]

Subject: Application for HSE Technician position - Ref. [Reference]

Dear Sir/Madam,

As a graduate in Hygiene, Safety, and Environment from IMTA (Institut Marocain des Techniques Appliquees), I am writing to apply for the HSE Technician position at your company.

My training has given me in-depth skills in the following areas:
- Occupational risk assessment and prevention
- Development and implementation of safety plans
- Emergency management and first aid
- Staff awareness and training on HSE rules
- Environmental monitoring and regulatory compliance

Rigorous and methodical, I am convinced that workplace safety is everyone's responsibility and that an effective preventive approach contributes to overall company performance.

During my internships, I had the opportunity to participate in safety audits, develop procedures, and train operators on best practices. These experiences confirmed my calling for this profession.

I would be delighted to meet with you to discuss my background and motivation in detail.

I look forward to hearing from you.

Sincerely,

[Your name]

Attachments: Resume, HSE Diploma, Certifications`,
	},
	{
		id: "conducteur-engins",
		name: "Cover Letter - Heavy Equipment Operator",
		description: "Template for construction and public works equipment operator positions.",
		domain: "industrial",
		type: "response",
		icon: TruckIcon,
		tags: ["Construction", "Worksite", "Equipment", "Public Works"],
		content: `[Your name]
[Your address]
[Postal code, City]
[Phone]
[Email]

[Company name]
[Address]
[Postal code, City]

[City], [Date]

Subject: Application for Heavy Equipment Operator position

Dear Sir/Madam,

Holding a construction equipment operator certificate from IMTA along with the corresponding operating permits, I am applying for the equipment operator position at your company.

My comprehensive training has equipped me to operate various types of equipment:
- Hydraulic excavators
- Loaders
- Bulldozers
- Compactors
- Aerial platforms and forklifts

I am particularly attentive to worksite safety rules and have been trained in daily equipment inspection procedures as well as first-level maintenance.

Conscientious and punctual, I am accustomed to teamwork and adapting to different worksite conditions. My internship experience has allowed me to develop solid skills in earthwork and material handling operations.

Passionate about the construction industry, I wish to put my skills to work for your company and contribute to the success of your projects.

I am available for an interview at your convenience.

Sincerely,

[Your name]

Attachments: Resume, CACES, Operating permits`,
	},
	{
		id: "stage-observation",
		name: "Cover Letter - Observation Internship",
		description: "Template for observation internship requests in the medical or industrial sector.",
		domain: "general",
		type: "internship",
		icon: GraduationCapIcon,
		tags: ["Internship", "Observation", "Discovery", "Training"],
		content: `[Your name]
[Your address]
[Postal code, City]
[Phone]
[Email]

[Facility/Company name]
[Address]
[Postal code, City]

[City], [Date]

Subject: Request for Observation Internship - [Field]

Dear Sir/Madam,

Currently enrolled in [Program name] at IMTA (Institut Marocain des Techniques Appliquees), I am seeking an observation internship from [Start date] to [End date] at your facility.

This internship is part of my training program and aims to:
- Discover how a professional organization operates
- Observe work practices and methods
- Understand the different roles and required skills
- Confirm my career orientation

Curious and motivated, I commit to respecting confidentiality rules and your organization's internal regulations. I will demonstrate discretion and professionalism throughout this internship.

I am confident that this experience will enrich my training and allow me to better understand real-world professional environments.

I would be very honored to complete this internship at your organization and remain available for any additional information.

Sincerely,

[Your name]

Attachments: Resume, Student certificate`,
	},
	{
		id: "premier-emploi",
		name: "Cover Letter - First Job",
		description: "Template for recent graduates seeking their first employment.",
		domain: "general",
		type: "first_job",
		icon: RocketLaunchIcon,
		tags: ["Recent graduate", "First job", "Career entry", "Motivation"],
		content: `[Your name]
[Your address]
[Postal code, City]
[Phone]
[Email]

[Company name]
[Address]
[Postal code, City]

[City], [Date]

Subject: Application for first employment - [Target position]

Dear Sir/Madam,

As a recent graduate from IMTA (Institut Marocain des Techniques Appliquees), I am writing to apply for a [Position title] role at your company.

My training has provided me with a solid foundation in both theory and practice. During my internships, I had the opportunity to:
- Put my academic knowledge into practice
- Work in a team and adapt to a professional environment
- Develop my sense of responsibility and autonomy
- Demonstrate rigor and punctuality

Although I am at the start of my professional career, I am determined to learn and progress quickly. My motivation, curiosity, and dynamism are assets I wish to bring to your company.

I understand that experience is built day by day, and that is why I am ready to fully commit to acquiring the necessary skills and contributing to your team's success.

I would be very happy to meet with you to present my application and demonstrate my motivation.

I look forward to hearing from you.

Sincerely,

[Your name]

Attachments: Resume, Diploma, Internship certificates`,
	},
	{
		id: "spontanee-general",
		name: "Cover Letter - Unsolicited Application",
		description: "Versatile template for unsolicited applications across all sectors.",
		domain: "general",
		type: "spontaneous",
		icon: PaperPlaneRightIcon,
		tags: ["Unsolicited", "All sectors", "Initiative", "Versatile"],
		content: `[Your name]
[Your address]
[Postal code, City]
[Phone]
[Email]

[Company name]
[Address]
[Postal code, City]

[City], [Date]

Subject: Unsolicited Application - [Field/Target position]

Dear Sir/Madam,

Interested in your company's industry and its reputation for excellence, I am writing to submit my unsolicited application.

As a graduate from IMTA (Institut Marocain des Techniques Appliquees) in [Specialty], I possess the following skills and qualities:
- [Technical skill 1]
- [Technical skill 2]
- [Interpersonal skill]
- [Personal quality]

Beyond my technical skills, I am recognized for my seriousness, adaptability, and team spirit. I am convinced that these qualities could be an asset to your company.

Motivated and dynamic, I am seeking an opportunity to put my skills to work for an ambitious company. Your company, recognized for [Reason for interest], represents an ideal opportunity for me to develop my professional career.

I remain available to meet with you and explain my motivation and professional project in person.

I look forward to hearing from you.

Sincerely,

[Your name]

Attachments: Resume`,
	},
];

export const coverLetterTips = [
	{
		id: "tip-1",
		icon: TargetIcon,
		title: "Personalize each letter",
		content:
			"Tailor your letter to each company and position. Mention the company name and explain why it specifically interests you.",
	},
	{
		id: "tip-2",
		icon: CheckCircleIcon,
		title: "Structure clearly",
		content:
			"A good letter includes: a hook, your motivation for the position, your key skills, and a request for an interview. Keep it concise (one page maximum).",
	},
	{
		id: "tip-3",
		icon: StarIcon,
		title: "Highlight your achievements",
		content:
			"Rather than listing your tasks, describe your concrete successes with numbers if possible (e.g., 'I reduced delays by 20%').",
	},
	{
		id: "tip-4",
		icon: UserIcon,
		title: "Stay professional",
		content:
			"Use a formal but natural tone. Avoid excessive jargon and overly casual phrasing. Proofread carefully to avoid mistakes.",
	},
];

export const commonMistakes = [
	{
		id: "mistake-1",
		title: "Too generic",
		description: "Avoid one-size-fits-all letters. Each application deserves customization.",
	},
	{
		id: "mistake-2",
		title: "Repeating the resume",
		description: "The letter should complement the resume, not repeat it. Add value with your personality.",
	},
	{
		id: "mistake-3",
		title: "Too long",
		description: "One page is enough. Recruiters don't have time to read walls of text.",
	},
	{
		id: "mistake-4",
		title: "Spelling mistakes",
		description:
			"Proofread multiple times and have someone else review it. One mistake can eliminate your application.",
	},
];
