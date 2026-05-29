import { msg } from "@lingui/core/macro";

import type { WikiCategory } from "../types";

export const resumeFundamentalsCategory: WikiCategory = {
	slug: "resume-fundamentals",
	titleKey: msg`Resume Fundamentals`,
	descriptionKey: msg`Master the basics of resume writing. Learn what a resume is, how to write one, common mistakes to avoid, ideal length guidelines, and the key differences between resumes and CVs.`,
	iconName: "FileTextIcon",
	seoTitle: "Resume Fundamentals - Complete Guide | IMTA Resume",
	seoDescription:
		"Master resume basics with our comprehensive guide. Learn what a resume is, why it matters, and how to create one that gets interviews.",
	articles: [
		// ====================================================================
		// Article 1: What is a Resume?
		// ====================================================================
		{
			slug: "what-is-a-resume",
			titleKey: msg`What is a Resume? Definition, Purpose & Types`,
			descriptionKey: msg`Understand what a resume is, why it matters in your job search, and the different types of resumes you can use to land interviews.`,
			seoTitle: "What is a Resume? Complete Guide to Resume Definition & Purpose | IMTA Resume",
			seoDescription:
				"Learn what a resume is, the different types of resumes, how they differ from CVs, and when you need one. A complete beginner's guide to understanding resumes.",
			keywords: ["what is a resume", "resume definition", "curriculum vitae", "CV vs resume"],
			readingTime: 8,
			dateModified: "2026-01-15",
			sections: [
				{
					titleKey: msg`Definition & Overview`,
					contentKey: msg`A resume is a formal document that summarizes your professional qualifications, work experience, education, and skills. It serves as your personal marketing tool in the job search process, designed to convince employers that you are a strong candidate worth interviewing. The word "resume" comes from the French word "resumer," meaning "to summarize," which perfectly captures its purpose: to provide a concise overview of your career.

In today's competitive job market, your resume is often the first impression you make on a potential employer. Recruiters typically spend between six and eight seconds scanning a resume before deciding whether to read further or move on to the next candidate. This means every word, every section, and every formatting choice matters. A well-crafted resume does not just list your job history; it tells a compelling story about the value you bring to an organization.

Resumes have evolved significantly over the decades. What once was a simple typed list of jobs and dates has become a strategic document that must balance readability for human recruiters with optimization for Applicant Tracking Systems (ATS). Modern resumes incorporate keywords, quantifiable achievements, and clean formatting to maximize their effectiveness in both digital and printed formats.

The primary purpose of a resume is not to get you a job directly. Rather, its goal is to secure an interview. Think of it as an advertisement for yourself: it highlights your most relevant qualifications and accomplishments to persuade the reader that you deserve a closer look. Every element of your resume should be working toward that single objective.`,
				},
				{
					titleKey: msg`Resume vs CV: Key Differences`,
					contentKey: msg`One of the most common points of confusion for job seekers is the difference between a resume and a curriculum vitae (CV). While these terms are sometimes used interchangeably in casual conversation, they refer to distinct documents with different purposes, lengths, and content expectations.

A resume is typically one to two pages long and focuses on your most relevant professional experience, skills, and education tailored to a specific job. It is the standard document used for job applications in the United States, Canada, and many other countries. Resumes are concise by design, and you are expected to customize them for each position you apply to, emphasizing the qualifications most relevant to that particular role.

A CV, on the other hand, is a comprehensive document that details your entire academic and professional history. There is no page limit for a CV; it grows throughout your career as you accumulate publications, presentations, research projects, grants, and other scholarly achievements. CVs are primarily used in academia, scientific research, and medical fields, as well as for international job applications in many European and Asian countries.

In some regions, particularly the United Kingdom, Ireland, Australia, and parts of Europe, the term "CV" is used to refer to what Americans would call a resume. This regional variation can create confusion, so it is important to understand the expectations of the specific country or industry where you are applying. When in doubt, research the standard practices for your target market.`,
				},
				{
					titleKey: msg`When You Need a Resume`,
					contentKey: msg`Virtually every professional job application requires a resume. Whether you are a recent graduate entering the workforce for the first time, a mid-career professional seeking advancement, or an experienced executive exploring new opportunities, having an up-to-date resume is essential. However, there are specific situations where having a polished resume is particularly critical.

When applying for jobs online, your resume is the primary document that passes through ATS software and reaches recruiters. Most job boards and company career portals require you to upload a resume as part of the application process. Without a properly formatted and keyword-optimized resume, your application may never reach human eyes regardless of how qualified you are.

Networking situations also demand a ready resume. When a colleague, mentor, or industry contact offers to refer you to an open position, they will typically ask for your resume to forward to the hiring manager. Having a current, professional resume available at a moment's notice can mean the difference between capitalizing on an opportunity and watching it pass by.

Career fairs, recruitment events, and professional conferences are additional contexts where you should have copies of your resume readily available. Even in the digital age, many recruiters appreciate receiving a printed resume during face-to-face interactions. Job seekers who attend these events prepared with professional printed resumes demonstrate initiative and professionalism.

Freelancers and consultants also benefit from maintaining a resume, even if they are not seeking traditional employment. A resume can serve as a credential summary when pitching to potential clients, applying for grants, or establishing credibility in a new market. In these cases, the resume may be adapted into a portfolio or capabilities statement, but the underlying content remains the same.`,
				},
				{
					titleKey: msg`Types of Resumes Overview`,
					contentKey: msg`There are three primary resume formats, each with distinct advantages depending on your career situation: chronological, functional, and combination (also known as hybrid). Understanding the strengths and weaknesses of each format will help you choose the one that best presents your qualifications.

The chronological resume is the most widely used and widely accepted format. It lists your work experience in reverse chronological order, starting with your most recent position and working backward. This format is favored by recruiters and ATS software because it provides a clear, easy-to-follow career progression. If you have a solid work history with no significant gaps and are applying for a role in the same or a related field, the chronological format is almost always the best choice.

The functional resume, also known as a skills-based resume, de-emphasizes the timeline of your work history and instead organizes your qualifications around skill categories. This format can be useful for career changers, individuals with employment gaps, or those re-entering the workforce after an extended absence. However, many recruiters view functional resumes with suspicion because they can appear to hide information. Use this format with caution and only when you have a specific strategic reason for doing so.

The combination resume merges elements of both chronological and functional formats. It typically begins with a skills summary or qualifications section, followed by a chronological work history. This format is effective for experienced professionals who want to highlight specific competencies while still providing a clear career timeline. It works particularly well for senior-level candidates with diverse skill sets or those transitioning into roles that require a different emphasis than their job titles suggest.

Some job seekers also use targeted resumes, which are heavily customized for a single specific position. While any resume should be tailored to the job you are applying for, a targeted resume takes this a step further by restructuring sections, rewriting bullet points, and adjusting keywords to align precisely with a particular job description. This approach is time-intensive but can be highly effective for competitive positions.`,
				},
				{
					titleKey: msg`Key Components of a Resume`,
					contentKey: msg`Every effective resume contains several essential components that work together to present a complete picture of your candidacy. While the specific sections may vary based on your industry and experience level, most resumes should include the following core elements.

Contact information sits at the top of your resume and includes your full name, phone number, professional email address, and location (city and state are sufficient; a full street address is no longer recommended for privacy reasons). You may also include a link to your LinkedIn profile, personal website, or online portfolio if relevant to your field. Ensure your email address is professional; an address like "partyanimal99" will undermine an otherwise strong resume.

A professional summary or objective statement provides a brief overview of who you are and what you bring to the table. A summary is typically two to four sentences highlighting your experience level, key skills, and most notable achievements. An objective statement, which focuses on what you are seeking rather than what you offer, is generally considered outdated, though it can still be appropriate for career changers or recent graduates. Regardless of which approach you choose, this section should be tailored to the specific role you are targeting.

Your work experience section is the heart of your resume. Each entry should include your job title, employer name, location, and dates of employment, followed by bullet points describing your responsibilities and achievements. Focus on accomplishments rather than duties, and quantify your impact whenever possible. Instead of writing "Responsible for managing a team," write "Led a team of 12 engineers to deliver a product launch three weeks ahead of schedule, resulting in $2.4M in first-quarter revenue."

Education, skills, and optional sections such as certifications, volunteer work, languages, and professional affiliations round out the resume. The placement and emphasis of these sections depend on your career stage and the requirements of the position. For recent graduates, education may appear before work experience; for seasoned professionals, it typically follows the experience section.`,
				},
			],
			faqItems: [
				{
					questionKey: msg`What's the difference between a CV and a resume?`,
					answerKey: msg`A resume is a concise one-to-two-page document tailored to a specific job, highlighting your most relevant experience and skills. A CV (curriculum vitae) is a comprehensive, multi-page document that covers your entire academic and professional history, including publications, research, and presentations. In the United States, resumes are standard for most job applications, while CVs are used primarily in academia and research. In many other countries, however, the terms are used interchangeably.`,
				},
				{
					questionKey: msg`How long should a resume be?`,
					answerKey: msg`For most job seekers, a one-page resume is ideal, especially if you have fewer than 10 years of experience. Two pages are acceptable for senior professionals, managers, or those with extensive relevant experience. The key is to include only information that is directly relevant to the position you are applying for. Every line should earn its place on the page by demonstrating value to the employer. If you are struggling to fit your content on one page, focus on recent and relevant experience and remove outdated or tangential information.`,
				},
			],
		},

		// ====================================================================
		// Article 2: How to Write a Resume
		// ====================================================================
		{
			slug: "how-to-write-a-resume",
			titleKey: msg`How to Write a Resume: Step-by-Step Guide`,
			descriptionKey: msg`Follow our step-by-step guide to writing a professional resume. Learn how to choose a format, craft a compelling summary, and highlight your experience effectively.`,
			seoTitle: "How to Write a Resume in 2026 - Step-by-Step Guide | IMTA Resume",
			seoDescription:
				"Learn how to write a professional resume step by step. Covers format selection, contact information, summary writing, experience details, education, and skills.",
			keywords: ["how to write a resume", "resume writing guide", "create a resume", "resume tips"],
			readingTime: 12,
			dateModified: "2026-01-15",
			sections: [
				{
					titleKey: msg`Choose Your Resume Format`,
					contentKey: msg`The first and most important decision in writing your resume is selecting the right format. Your choice of format determines how your information is organized and which aspects of your background receive the most emphasis. The three main formats are chronological, functional, and combination, and the best choice depends on your career history, the role you are targeting, and any potential red flags you need to address.

The chronological format is the gold standard and should be your default choice unless you have a compelling reason to use another format. It lists your work experience in reverse chronological order, making it easy for recruiters to trace your career progression. This format works best when you have a consistent work history in a relevant field and want to showcase career growth. Approximately 90 percent of resumes follow this format, and it is the most compatible with Applicant Tracking Systems.

If you are changing careers, re-entering the workforce after a long gap, or have a non-traditional background, the combination format may serve you better. It allows you to lead with a robust skills section before presenting your chronological work history, giving you the opportunity to frame your experience in terms of transferable competencies rather than job titles.

Before choosing a format, research common resume practices in your target industry. Some fields, such as creative industries, may welcome unconventional formats, while more traditional sectors like finance, law, or government typically expect a straightforward chronological resume. When in doubt, keep it conventional. The goal is to make the recruiter's job easy, not to showcase your design skills unless you are applying for a design role.`,
				},
				{
					titleKey: msg`Start with Contact Information`,
					contentKey: msg`Your contact information section is the simplest part of your resume, but mistakes here can be costly. If a recruiter cannot easily find your phone number or email address, or if there is a typo in either, you may miss out on an interview opportunity entirely. Place your contact information prominently at the top of your resume where it is immediately visible.

Include your full name in a slightly larger font size than the rest of your resume to make it stand out. Below your name, list your phone number with a professional voicemail greeting, your email address, and your general location. You do not need to include your full street address; city and state (or city and country for international applications) are sufficient. Many job seekers today also omit their location entirely, particularly if they are open to remote work.

Your email address should be professional and straightforward. Ideally, it should be some variation of your name, such as firstname.lastname@email.com. If your name is common and the obvious variations are taken, use a professional alternative like firstnameMlastname or firstnamelastname.career. Avoid nicknames, numbers that suggest your birth year, or anything that could be perceived as unprofessional.

Consider adding links to your LinkedIn profile, personal website, or online portfolio if they are relevant and up-to-date. A strong LinkedIn presence can reinforce your resume and provide additional context that does not fit in a one-to-two-page document. However, only include these links if the content they lead to is polished and professional. An incomplete LinkedIn profile or an outdated portfolio will work against you rather than for you.

Do not include personal details such as your age, date of birth, marital status, nationality, or a photograph unless these are specifically required by the job posting or are standard practice in the country where you are applying. In the United States, including such information can expose both you and the employer to potential discrimination liability and is considered inappropriate.`,
				},
				{
					titleKey: msg`Write a Compelling Professional Summary`,
					contentKey: msg`The professional summary sits directly below your contact information and serves as your elevator pitch. In two to four sentences, it should communicate who you are professionally, what you do best, and the value you bring to a potential employer. A strong summary hooks the reader and encourages them to keep reading, while a weak one can cause them to move on immediately.

Start your summary by identifying your professional identity and experience level. For example, "Results-driven marketing manager with 8+ years of experience in digital strategy and brand development" immediately tells the recruiter your role, your seniority, and your specialty. Follow this with one or two of your most impressive achievements or capabilities, using specific numbers wherever possible. "Increased organic traffic by 156 percent and generated $3.2 million in pipeline revenue" is far more compelling than "experienced in driving traffic and revenue."

Tailor your summary to match the language and priorities of the job description you are targeting. If the posting emphasizes "cross-functional collaboration" and "data-driven decision making," your summary should incorporate these phrases naturally. This not only signals to the human reader that you are a strong fit but also helps your resume pass through ATS keyword filters.

Avoid generic statements that could apply to anyone, such as "hard-working team player seeking a challenging opportunity." These phrases are so overused that they have lost all meaning. Instead, focus on specific, demonstrable qualities that set you apart. What have you accomplished that few others in your field can claim? What unique combination of skills do you bring? Your summary should answer the question, "Why should we interview this person?" within the first few seconds of reading.

If you are a recent graduate with limited professional experience, you may use an objective statement instead of a summary. An objective states what you are looking for, such as "Recent computer science graduate seeking an entry-level software engineering position where I can apply my skills in Python, machine learning, and cloud computing." However, even as a new graduate, a summary that highlights relevant internships, projects, or academic achievements is generally more effective.`,
				},
				{
					titleKey: msg`Detail Your Work Experience`,
					contentKey: msg`The work experience section is the most critical part of your resume for most job seekers. This is where you demonstrate your track record and prove that you can deliver results in a professional setting. Each position you list should include your job title, company name, location, and the dates you held the role, followed by three to six bullet points describing your key responsibilities and achievements.

Write your bullet points using the accomplishment-driven format: start each one with a strong action verb, describe what you did, and quantify the result whenever possible. The formula is: Action Verb + Task/Responsibility + Quantified Result. For example, "Redesigned the customer onboarding process, reducing time-to-activation by 40 percent and increasing 30-day retention from 62 percent to 84 percent." This format transforms a generic duty into a compelling achievement that demonstrates your impact.

Choose action verbs that convey leadership, initiative, and results. Words like "spearheaded," "orchestrated," "optimized," "launched," "negotiated," and "transformed" are more powerful than "helped," "assisted," "was responsible for," or "participated in." The verb you choose sets the tone for the entire bullet point and signals your level of contribution.

Tailor your experience descriptions to the job you are applying for. You do not need to include every task you performed in each role; instead, select the responsibilities and achievements that are most relevant to your target position. A project manager applying for a senior PM role should emphasize leadership, stakeholder management, and strategic planning rather than listing every daily administrative task they performed.

For older positions or roles less relevant to your target job, reduce the number of bullet points. Your most recent and relevant positions should receive the most space, while earlier roles can be summarized in one to two bullet points or even listed with just the title, company, and dates. Generally, you should provide detailed descriptions for the last 10 to 15 years of experience. Anything older can be condensed into a "Previous Experience" section or omitted entirely if it does not add value to your current candidacy.

If you have gaps in your employment history, be honest but strategic. You can address gaps by listing freelance work, volunteer experience, professional development activities, or personal projects that kept your skills sharp during the interim period. Never fabricate job titles or employment dates, as background checks can easily uncover dishonesty.`,
				},
				{
					titleKey: msg`List Your Education`,
					contentKey: msg`The education section of your resume provides information about your academic background. How prominently you feature this section depends on where you are in your career. For recent graduates, education may be the strongest section on the resume and should appear near the top, potentially even before work experience. For experienced professionals, education is typically listed after work experience and kept brief.

For each educational entry, include the degree name, the name of the institution, its location, and your graduation date (or expected graduation date if you are still enrolled). If you graduated with honors, such as magna cum laude or summa cum laude, include that distinction. You may also list your GPA if it is 3.5 or higher and you are within the first few years of your career; beyond that point, GPA becomes less relevant and can be omitted.

Include relevant coursework, academic projects, thesis topics, or research experience if they directly relate to the position you are applying for. This is especially important for recent graduates who may lack extensive professional experience. A computer science graduate applying for a data science role might list courses in machine learning, statistical modeling, and database systems to demonstrate subject-matter knowledge.

Professional certifications, licenses, and continuing education credentials can be listed either within the education section or in a separate "Certifications" section. Industry-recognized certifications such as PMP, CPA, AWS Solutions Architect, or Google Analytics carry significant weight and should be prominently displayed. Include the certifying body and the date obtained; if the certification requires renewal, note that it is current.

If you attended college but did not complete your degree, you can still list the institution and the credits or coursework completed. Format it as "Coursework in Business Administration, University of Michigan, 2018-2020" rather than leaving a misleading impression of degree completion. Honesty in this section is paramount, as educational credentials are among the most commonly verified items in background checks.`,
				},
				{
					titleKey: msg`Add a Skills Section`,
					contentKey: msg`A well-crafted skills section serves multiple purposes: it provides a quick snapshot of your capabilities for human readers and serves as a keyword-rich section that helps your resume pass through ATS filters. This section should be strategically curated rather than an exhaustive list of every skill you have ever acquired.

Divide your skills into categories when possible, such as "Technical Skills," "Software Proficiency," "Languages," and "Certifications." This organization makes the section easier to scan and helps recruiters quickly identify the competencies they are looking for. A software developer might categorize skills into "Programming Languages," "Frameworks & Libraries," "Cloud Platforms," and "Tools & Methodologies."

Prioritize hard skills over soft skills in this section. Hard skills are specific, teachable abilities that can be measured, such as programming languages, data analysis tools, design software, or foreign languages. Soft skills like "communication," "leadership," and "problem-solving" are better demonstrated through your work experience bullet points rather than simply listed. If a recruiter sees "excellent communication skills" listed alongside "Python" and "SQL," the soft skill claim carries no evidence while the hard skills are verifiable.

Mirror the language of the job description when listing your skills. If the posting asks for "proficiency in Adobe Creative Suite," use that exact phrase rather than listing individual applications separately. If it mentions "agile methodology," do not write "scrum" unless the posting specifically uses that term. ATS software often matches keywords exactly, and using synonyms or alternative phrasings can cause your resume to score lower even if you possess the required skills.

Be honest about your proficiency levels. Claiming expert-level skill in a tool you have only used a few times can backfire spectacularly in a technical interview. Many job seekers use a simple categorization system such as "Proficient," "Intermediate," and "Familiar" to indicate their comfort level with each skill. Others choose not to indicate proficiency levels at all, which is also acceptable. Whatever approach you take, be prepared to discuss and demonstrate any skill listed on your resume.`,
				},
			],
			faqItems: [
				{
					questionKey: msg`Should I include a photo on my resume?`,
					answerKey: msg`In the United States, Canada, and the United Kingdom, including a photo on your resume is generally discouraged as it can introduce unconscious bias and potentially violate equal employment opportunity guidelines. However, in some countries such as Germany, France, and many Asian nations, a professional headshot is expected. If you are applying internationally, research the conventions of the specific country. When a photo is appropriate, use a professional headshot with a neutral background and business-appropriate attire.`,
				},
				{
					questionKey: msg`What font should I use on my resume?`,
					answerKey: msg`Choose a clean, professional, and easily readable font. Popular choices include Calibri, Cambria, Garamond, Georgia, Helvetica, and Arial. Use a font size between 10 and 12 points for body text and 14 to 16 points for your name. Avoid decorative or script fonts that may be difficult to read or may not render correctly in ATS software. Consistency is key: use no more than two fonts throughout your resume, one for headings and one for body text.`,
				},
				{
					questionKey: msg`How far back should my work experience go?`,
					answerKey: msg`Generally, your resume should cover the last 10 to 15 years of relevant work experience. For most hiring managers, anything older than that is less relevant to your current capabilities. If you have earlier experience that is particularly impressive or directly relevant to the role, you can include a brief "Earlier Career" section with condensed entries. Recent graduates should include all relevant experience, including internships, part-time work, and significant academic projects.`,
				},
			],
		},

		// ====================================================================
		// Article 3: Resume Mistakes
		// ====================================================================
		{
			slug: "resume-mistakes",
			titleKey: msg`15 Common Resume Mistakes and How to Avoid Them`,
			descriptionKey: msg`Discover the most common resume mistakes that cost job seekers interviews and learn practical tips to avoid them. From formatting errors to content pitfalls, fix your resume today.`,
			seoTitle: "15 Common Resume Mistakes That Cost You Interviews | IMTA Resume",
			seoDescription:
				"Avoid the 15 most common resume mistakes that prevent candidates from getting interviews. Learn about formatting errors, content pitfalls, and how to fix them.",
			keywords: ["resume mistakes", "resume errors", "bad resume", "resume tips"],
			readingTime: 10,
			dateModified: "2026-01-15",
			sections: [
				{
					titleKey: msg`Formatting Mistakes`,
					contentKey: msg`Formatting mistakes are among the most common and most damaging resume errors because they affect readability and create an impression of carelessness before the recruiter even reads a single word of your content. Poor formatting can also cause problems with Applicant Tracking Systems, resulting in your information being parsed incorrectly or your resume being rejected outright.

Using an overly complex or creative layout is a frequent formatting mistake. While you might think a multi-column design with graphics and icons will make your resume stand out, it often has the opposite effect. ATS software frequently misreads columns, text boxes, and graphics, scrambling your information into an incoherent mess. Stick to a clean, single-column layout for the main content, with clear section headings and consistent spacing throughout.

Inconsistent formatting is another red flag that signals a lack of attention to detail. If your first job entry uses bold for the company name and italics for the job title, every subsequent entry must follow the same pattern. Mixing font sizes randomly, using different bullet styles in different sections, or having uneven margins all create a sense of sloppiness that undermines your professional image.

Choosing the wrong font size or cramming too much text onto the page in an attempt to stay within one page is a mistake that sacrifices readability. If a recruiter needs to squint to read your resume, they will not bother. Maintain at least 10-point font for body text, use adequate margins (0.5 to 1 inch on all sides), and leave sufficient white space between sections. A well-organized one-page resume with breathing room is always more effective than a dense, cramped two-page document.

Saving your resume in the wrong file format can also derail your application. Unless specifically requested otherwise, save your resume as a PDF to preserve formatting across different devices and operating systems. A Word document may render differently on the recruiter's computer, potentially breaking your carefully designed layout. Name the file professionally using a convention like "FirstName-LastName-Resume.pdf" rather than "resume_final_v3_UPDATED.docx."`,
				},
				{
					titleKey: msg`Content Mistakes`,
					contentKey: msg`Content mistakes occur when the information on your resume fails to effectively communicate your value as a candidate. Even with perfect formatting, poor content will result in a rejected application. The most pervasive content mistake is writing duty-focused bullet points instead of achievement-focused ones.

Listing responsibilities rather than accomplishments is the single most common content error. Statements like "Responsible for managing client accounts" or "Duties included answering customer inquiries" tell the recruiter what your job was supposed to involve, not what you actually achieved. Transform every bullet point into an accomplishment by answering the question, "So what?" What was the result of your work? How did you improve things? Use numbers, percentages, dollar amounts, and timeframes to give your achievements concrete impact.

Failing to tailor your resume to the specific job is another critical mistake. Sending the same generic resume to every job posting is one of the fastest ways to get rejected. Recruiters can tell when a resume has not been customized because the skills and experience highlighted do not align with their job description. Take the time to study each posting and adjust your summary, skills section, and experience bullet points to reflect the specific requirements and keywords of the role.

Including irrelevant information wastes valuable space and dilutes the impact of your relevant qualifications. Your high school education is unnecessary if you have a college degree. The summer job you held 20 years ago in an unrelated field does not strengthen your candidacy for a senior management role. Every item on your resume should directly support your qualifications for the position you are targeting.

Using vague or generic language is a subtle but damaging content mistake. Phrases like "team player," "hard worker," "detail-oriented," and "excellent communication skills" have become so overused that they carry no meaning. Replace these cliches with specific evidence. Instead of claiming you are a "team player," describe a cross-functional project you led. Instead of asserting you are "detail-oriented," highlight a time when your attention to detail prevented a costly error.`,
				},
				{
					titleKey: msg`Language & Grammar Errors`,
					contentKey: msg`Language and grammar errors on a resume are deal-breakers for most hiring managers. A study by CareerBuilder found that 77 percent of hiring managers immediately dismiss resumes with typos or grammatical mistakes. These errors signal carelessness and a lack of professionalism, qualities no employer wants in a candidate.

Spelling mistakes are the most obvious and most preventable language errors. While spell-check tools catch many misspellings, they miss contextual errors such as using "their" instead of "there," "affect" instead of "effect," or "lead" instead of "led." Always proofread your resume carefully, read it aloud, and ask at least one other person to review it with fresh eyes. Common resume-specific misspellings include "manger" instead of "manager," "liaise" misspelled in various creative ways, and company names or software tools spelled incorrectly.

Inconsistent verb tenses are a grammatical mistake that disrupts the flow of your resume. As a general rule, use the past tense for previous positions ("Managed a portfolio of 45 enterprise clients") and the present tense for your current role ("Lead a team of 8 software engineers"). Mixing past and present tense within the same job entry is a common error that makes your resume read awkwardly and suggests you did not proofread carefully.

Using the first person ("I managed," "My responsibilities included") or writing in full sentences with articles and pronouns makes your resume feel like a narrative rather than a professional document. Resume bullet points should begin with action verbs and use an implied first person. Write "Managed cross-functional team of 12" rather than "I managed a cross-functional team of 12." This convention saves space, improves readability, and maintains the professional tone expected of a resume.

Overusing jargon, buzzwords, or acronyms without context can alienate recruiters who may not share your technical background. While industry-specific terminology is appropriate and often necessary, ensure that your resume is understandable to HR professionals and recruiters who may not be subject-matter experts. Define uncommon acronyms on first use and balance technical terms with plain-language descriptions of your impact.`,
				},
				{
					titleKey: msg`Missing Information`,
					contentKey: msg`Omitting critical information from your resume can be just as damaging as including errors. Recruiters rely on specific data points to evaluate candidates, and missing information creates doubt and unanswered questions that rarely work in your favor.

Leaving out dates of employment is a significant red flag. Some job seekers intentionally omit dates to hide employment gaps or disguise job-hopping, but recruiters are trained to notice this tactic and will assume the worst. Always include the month and year for the start and end of each position. If you have gaps, address them honestly through brief explanations, freelance work, or professional development activities listed on your resume.

Failing to include a professional email address and phone number where you can be reliably reached is a surprisingly common oversight, especially when job seekers update their resumes hastily. Double-check that your contact information is current and accurate. An outdated phone number or an email address you no longer monitor can mean missing out on interview invitations.

Not including your LinkedIn URL is a missed opportunity in today's digital-first hiring landscape. Most recruiters will search for your LinkedIn profile regardless, so including a link to a well-maintained profile reinforces your professional brand and provides additional context that your resume cannot accommodate. Customize your LinkedIn URL to something clean and professional, such as linkedin.com/in/yourname.

Missing quantifiable metrics in your experience section is perhaps the most impactful omission. Numbers transform vague claims into credible evidence. Instead of "Improved customer satisfaction," write "Improved customer satisfaction scores from 78 percent to 94 percent within 6 months." Revenue generated, costs reduced, efficiency percentages, team sizes managed, project timelines met, and customer metrics are all powerful data points that belong in your experience bullets.`,
				},
				{
					titleKey: msg`Over-Sharing Pitfalls`,
					contentKey: msg`While missing information is problematic, sharing too much personal or irrelevant information on your resume can be equally damaging. Over-sharing can raise legal concerns, create bias, or simply waste space that could be used for more compelling professional content.

Including personal information such as your age, date of birth, marital status, number of children, religious affiliation, political views, or Social Security number is inappropriate on resumes in the United States and many other countries. This information is not only irrelevant to your professional qualifications but can also expose both you and the employer to discrimination claims. Even if you feel this information works in your favor, its inclusion suggests unfamiliarity with professional norms.

Listing hobbies and personal interests is generally unnecessary unless they are directly relevant to the position or demonstrate a skill the employer is seeking. If you are applying for a role at a sports media company, mentioning your marathon running or sports analytics hobby could be relevant. Otherwise, "enjoys cooking, hiking, and reading" adds nothing to your candidacy and takes up space that could highlight a professional achievement.

Including references or the phrase "References available upon request" is an outdated practice that wastes a line of valuable resume space. Employers will ask for references when they need them, and they assume you can provide them. The same applies to salary history or salary expectations, which should never appear on a resume. These topics are appropriate for later in the interview process, not for the initial application document.

Writing an excessively long resume when a shorter one would suffice is a form of over-sharing at the document level. Every additional page dilutes the impact of your best content. If your two-page resume has strong content on page one and filler content on page two, the recruiter's overall impression will be weaker than if you had submitted a single powerful page. Edit ruthlessly and remember that the best resumes are curated, not comprehensive.`,
				},
			],
			faqItems: [
				{
					questionKey: msg`Is it okay to lie on a resume?`,
					answerKey: msg`No, lying on a resume is never acceptable and can have serious consequences. Fabricating degrees, inflating job titles, inventing certifications, or falsifying employment dates can result in immediate termination if discovered after hiring, and many companies conduct thorough background checks. Beyond the professional risk, dishonesty on a resume can damage your reputation permanently in your industry. Instead of lying, focus on presenting your genuine qualifications in the strongest possible light through strategic framing and quantified achievements.`,
				},
				{
					questionKey: msg`Should I use a resume template?`,
					answerKey: msg`Yes, using a professional resume template is a smart strategy for most job seekers. A well-designed template ensures consistent formatting, proper structure, and ATS compatibility, saving you time and reducing the risk of layout errors. The key is choosing a clean, professional template that prioritizes readability over visual complexity. Avoid templates with excessive graphics, unusual fonts, or multi-column layouts that may confuse ATS software. Tools like IMTA Resume provide optimized templates that balance visual appeal with ATS compatibility.`,
				},
			],
		},

		// ====================================================================
		// Article 4: Resume Length
		// ====================================================================
		{
			slug: "resume-length",
			titleKey: msg`How Long Should a Resume Be? The Definitive Answer`,
			descriptionKey: msg`Discover the ideal resume length for your career stage. Learn when a one-page resume works best, when two pages are appropriate, and how to trim your resume effectively.`,
			seoTitle: "How Long Should a Resume Be? Expert Guide for 2026 | IMTA Resume",
			seoDescription:
				"Find out the ideal resume length for your experience level. Expert advice on one-page vs two-page resumes, academic CVs, and tips for cutting resume length.",
			keywords: ["resume length", "one page resume", "two page resume", "resume pages"],
			readingTime: 7,
			dateModified: "2026-01-15",
			sections: [
				{
					titleKey: msg`The One-Page Rule Myth`,
					contentKey: msg`One of the most persistent myths in the job search world is that every resume must be exactly one page long. This "rule" has been repeated so many times that many job seekers treat it as gospel, cramming years of experience into a single page at the expense of readability and content quality. The truth is more nuanced: the ideal resume length depends on your experience level, your industry, and the specific role you are targeting.

The one-page guideline originated in an era when resumes were physically mailed and recruiters had to manually sort through stacks of paper. A concise document was genuinely easier to handle. In today's digital hiring environment, where resumes are submitted electronically and parsed by ATS software, the physical handling argument no longer applies. What matters is not the number of pages but the quality and relevance of the content on those pages.

Research from multiple recruiting firms and hiring studies consistently shows that hiring managers do not penalize candidates for two-page resumes when the content is relevant and well-organized. A study by ResumeGo found that recruiters were 2.3 times more likely to prefer a two-page resume over a one-page version for candidates with at least 10 years of experience. The key insight is that content quality matters far more than page count.

That said, the one-page guideline is not without merit. It serves as a useful discipline: if you can effectively communicate your value in one page, there is no reason to use two. Padding a resume with irrelevant information or repeating the same points in different words simply to fill a second page is counterproductive. Think of the one-page rule not as an absolute limit but as a challenge to be concise, relevant, and impactful with every word.`,
				},
				{
					titleKey: msg`When to Use a One-Page Resume`,
					contentKey: msg`A one-page resume is the best choice for several specific situations. If you fall into any of these categories, committing to a single page will likely serve you well and demonstrate your ability to communicate concisely.

Entry-level candidates and recent graduates should almost always use a one-page resume. With limited professional experience, there is typically not enough relevant content to justify a second page. Attempting to fill two pages when you have only one or two internships and a college degree will result in padding with irrelevant information that weakens your overall presentation. Focus on making your limited experience shine rather than expanding your document.

Career changers with fewer than five years of experience in their new field benefit from a one-page format because it forces them to focus exclusively on transferable skills and relevant accomplishments. A concise resume keeps the attention on what matters, your applicable qualifications, rather than diluting the message with extensive detail about a career you are leaving behind.

Professionals with fewer than 10 years of experience in a single field can usually capture their qualifications effectively on one page. At this career stage, you should have enough accomplishments to fill the page meaningfully but not so many that you need additional space. If your most recent two or three positions are in the same field and directly relevant to your target role, one page keeps the narrative tight and impactful.

Applicants for roles in fast-paced industries where brevity is valued, such as startups, creative agencies, or certain technology companies, often benefit from the directness of a one-page resume. In these environments, the ability to distill your value proposition into a single page can itself be seen as a demonstration of communication skills and prioritization ability.`,
				},
				{
					titleKey: msg`When Two Pages Are Appropriate`,
					contentKey: msg`A two-page resume is appropriate and often expected for experienced professionals whose careers have accumulated enough relevant achievements, skills, and credentials to warrant the additional space. If you find yourself cutting important, relevant content simply to squeeze onto one page, that is a strong signal that a two-page resume is the right choice.

Senior professionals with 10 or more years of experience often have multiple significant roles, each with accomplishments worth highlighting. Forcing this depth of experience into one page means either cutting impressive achievements or shrinking the font to an unreadable size. Neither option serves you well. Two pages give you the space to provide appropriate detail for your most recent roles while still listing earlier positions.

Managers and executives who oversee large teams, manage substantial budgets, or lead complex initiatives need space to convey the scope and impact of their work. A VP of Engineering who has led teams of 200 engineers, managed a $50 million budget, and delivered three major product launches cannot adequately describe this experience in three bullet points. Two pages allow the depth of description these positions require.

Professionals in technical fields such as engineering, IT, data science, or healthcare often need a second page to list technical skills, certifications, tools, and methodologies alongside their work experience. A software architect who is proficient in 15 programming languages and frameworks, holds three cloud certifications, and has contributed to major open-source projects needs the space to present these qualifications comprehensively.

Candidates applying for federal government positions in the United States are expected to submit detailed resumes that often extend to three or more pages. Government resumes follow specific formatting guidelines that require comprehensive descriptions of duties, accomplishments, and hours worked per week. If you are applying for a government position, research the specific requirements of the agency and follow them precisely.`,
				},
				{
					titleKey: msg`Academic CVs and Length`,
					contentKey: msg`Academic CVs operate under entirely different length expectations than industry resumes. In academia, a CV is a comprehensive record of your entire scholarly career, and there is no maximum page limit. An early-career academic may have a two-to-four-page CV, while a tenured professor with decades of publications, presentations, grants, and committee service may have a CV that extends to 20 pages or more.

The content of an academic CV includes sections that would never appear on an industry resume: publications (books, journal articles, conference papers, and working papers), presentations, teaching experience, courses taught, research grants and fellowships, academic honors and awards, professional service (committee memberships, journal reviewing, editorial board positions), and dissertation or thesis details. Each of these sections may grow substantially over the course of an academic career.

When listing publications, use the citation style standard in your discipline (APA, MLA, Chicago, etc.) and include all co-authors. Publications are typically divided into categories: peer-reviewed journal articles, book chapters, conference proceedings, working papers, and other publications. Many academics also include works under review or in preparation to indicate their active research agenda.

If you are an academic transitioning to industry, you will need to convert your CV into a resume format. This means cutting the document from many pages to one or two, removing academic-specific sections, and reframing your research and teaching experience in terms of business-relevant skills. Emphasize project management (grants), team leadership (research groups), communication (publications and presentations), and analytical skills (research methodology) rather than listing every paper you have published.`,
				},
				{
					titleKey: msg`Tips for Cutting Resume Length`,
					contentKey: msg`If your resume has grown beyond your target length, strategic editing can help you trim it without sacrificing impact. The goal is to remove the least relevant content while preserving the achievements and qualifications that make the strongest case for your candidacy.

Start by eliminating any content that does not directly support your application for the target role. If a bullet point describes a responsibility that is not relevant to the position you are seeking, remove it regardless of how proud you are of that accomplishment. Every line on your resume must earn its place by answering the question, "Does this make me a more compelling candidate for this specific job?"

Consolidate similar bullet points that describe related accomplishments. If you have three bullet points about different aspects of the same project, consider combining them into one comprehensive point. "Led the CRM migration project, transitioning 50,000 customer records, training 120 end users, and achieving zero data loss during the cutover weekend" is more powerful than three separate bullets describing each aspect.

Reduce or eliminate older positions that no longer define your professional identity. If your most recent three roles are in product management, you do not need detailed bullet points for the customer service job you held 15 years ago. List earlier positions with just the title, company, and dates, or group them under a "Previous Experience" heading with a single line each.

Tighten your language by removing filler words and redundant phrases. "Successfully managed" can become "Managed." "Was responsible for the development and implementation of" can become "Developed and implemented." "Utilized various tools and technologies to" can become the specific tools and technologies you used. These small edits add up quickly and can free significant space across your resume.

Adjust formatting strategically. Reducing margins slightly (to 0.5 inches), using a slightly smaller but still readable font size (10 or 10.5 point), or reducing the space between sections can reclaim space without sacrificing readability. However, never push formatting adjustments to the point where the document looks cramped. Readability always takes priority over length.`,
				},
			],
			faqItems: [
				{
					questionKey: msg`Can a resume be two pages?`,
					answerKey: msg`Absolutely. A two-page resume is appropriate for professionals with 10 or more years of experience, senior-level candidates, technical roles requiring extensive skills listings, or anyone whose relevant qualifications genuinely require additional space. The key is that every line on both pages should contain relevant, impactful content. A strong two-page resume is always better than a cramped one-page resume that sacrifices readability, and always better than a padded two-page resume full of irrelevant information.`,
				},
				{
					questionKey: msg`What if I'm a fresh graduate with limited experience?`,
					answerKey: msg`As a fresh graduate, a one-page resume is almost always the right choice. Focus on your education, relevant coursework, internships, part-time jobs, academic projects, volunteer work, and skills. Highlight transferable skills from any experience, even if it was not in your target field. A campus leadership role demonstrates management skills; a retail job shows customer service and communication skills. Use a professional summary that emphasizes your education, enthusiasm, and the value you can bring rather than dwelling on your limited experience.`,
				},
			],
		},

		// ====================================================================
		// Article 5: Resume vs CV
		// ====================================================================
		{
			slug: "resume-vs-cv",
			titleKey: msg`Resume vs CV: Key Differences Explained`,
			descriptionKey: msg`Understand the critical differences between resumes and CVs. Learn when to use each document, regional preferences, and how to choose the right format for your situation.`,
			seoTitle: "Resume vs CV: What's the Difference? Complete Comparison | IMTA Resume",
			seoDescription:
				"Learn the key differences between a resume and a CV (curriculum vitae). Understand when to use each, regional preferences, and how to choose the right document.",
			keywords: ["resume vs cv", "cv vs resume", "curriculum vitae", "difference between cv and resume"],
			readingTime: 8,
			dateModified: "2026-01-15",
			sections: [
				{
					titleKey: msg`What is a Resume`,
					contentKey: msg`A resume is a concise, targeted document designed to showcase your most relevant professional qualifications for a specific job opportunity. The word "resume" derives from the French "resumer," meaning to summarize, and that is precisely what the document does: it provides a curated summary of your career rather than a complete record.

Resumes in the traditional American sense are typically one to two pages long and are customized for each position. They focus on the skills, experiences, and achievements that align with the requirements of the job you are applying for. This targeted approach means you may have multiple versions of your resume, each emphasizing different aspects of your background to suit different roles or industries.

The content of a resume is selective and strategic. Rather than listing every position you have ever held, you include only the roles and accomplishments that strengthen your candidacy for the target job. This requires careful analysis of each job description and thoughtful decisions about what to include and what to leave out. A well-crafted resume tells a focused story about why you are the ideal candidate for a specific opportunity.

Resumes prioritize brevity and impact. Every bullet point, every skill listed, and every section included must serve a purpose. There is no room for filler content, irrelevant details, or comprehensive career histories. This discipline of conciseness is what makes resumes so effective: they give busy recruiters exactly the information they need to make a quick decision about whether to advance your candidacy.

The structure of a resume is relatively standardized: contact information, professional summary, work experience (in reverse chronological order), education, and skills. Additional sections such as certifications, volunteer work, or projects may be included if space allows and if they add value. This consistent structure allows recruiters to quickly navigate the document and find the information they need.`,
				},
				{
					titleKey: msg`What is a CV`,
					contentKey: msg`A curriculum vitae, commonly abbreviated as CV, is a comprehensive document that provides a detailed account of your entire academic and professional career. The Latin phrase "curriculum vitae" translates to "course of life," which reflects the document's purpose: to present a thorough overview of everything you have accomplished professionally and academically.

Unlike a resume, a CV has no page limit. It begins as a relatively short document early in your career and grows throughout your professional life as you accumulate experience, publications, presentations, grants, and other achievements. A graduate student might have a two-page CV, while a distinguished professor could have a CV that spans 20 or more pages. The length is dictated entirely by the content you have earned over your career.

The content of a CV is comprehensive rather than selective. Every publication you have authored, every conference presentation you have delivered, every grant you have received, every course you have taught, and every committee you have served on is included. This exhaustive approach serves the academic community's need for complete transparency about a scholar's body of work and contributions to their field.

CVs include sections that would never appear on an industry resume, such as research interests, dissertation or thesis abstracts, publications categorized by type (peer-reviewed articles, book chapters, conference proceedings, invited talks), teaching philosophy, courses designed and taught, grants and fellowships with funding amounts, professional memberships, editorial and reviewing activities, graduate students supervised, and a complete list of academic honors and awards.

The academic CV serves as a living document that is continuously updated throughout your career. Unlike a resume, which is created anew or heavily revised for each application, a CV is maintained as a master document with new achievements added as they occur. When applying for a specific academic position, you may reorder sections or add a tailored cover letter, but the CV itself remains comprehensive.`,
				},
				{
					titleKey: msg`Key Differences Between a Resume and a CV`,
					contentKey: msg`The differences between resumes and CVs span several dimensions, including length, content, purpose, and customization approach. Understanding these distinctions is essential for choosing the right document for your situation and for meeting the expectations of your target audience.

Length is the most immediately obvious difference. Resumes are typically one to two pages long, with the expectation that content is carefully curated for relevance. CVs have no page limit and grow throughout your career. A resume that extends to three pages would be considered too long in most contexts, while a CV that is only one page would suggest an early-career candidate with limited accomplishments.

Content scope differs fundamentally between the two documents. A resume is selective, including only the experience and skills relevant to a specific job application. A CV is comprehensive, documenting your complete academic and professional history without regard to the specific position you are applying for. A resume might omit a publication if it is not relevant to the target role; a CV would never omit any publication.

Purpose and audience also distinguish the two documents. Resumes are designed for industry hiring managers and recruiters who need to quickly assess your fit for a specific role. CVs are designed for academic search committees, grant reviewers, and other scholars who want to evaluate the full breadth and depth of your scholarly contributions. The assessment criteria are different: industry recruiters look for role-specific impact, while academic reviewers look for scholarly productivity and reputation.

Customization approaches differ as well. Resumes should be tailored for each application, with different versions emphasizing different skills and experiences depending on the job requirements. CVs remain largely the same across applications because they contain everything; customization is limited to reordering sections or adjusting emphasis in a cover letter. You maintain one master CV and update it as your career progresses.

Formatting conventions also vary. Resumes use action-oriented bullet points, quantified achievements, and strategic white space to maximize impact in a limited space. CVs use more traditional academic formatting with detailed entries, full citations, and comprehensive lists. Both should be clean and professional, but CVs tend to be more text-dense because the expectation is that reviewers will read them thoroughly rather than skim them in six seconds.`,
				},
				{
					titleKey: msg`When to Use Each Document`,
					contentKey: msg`Knowing when to submit a resume versus a CV can make or break your application. Submitting the wrong document signals unfamiliarity with professional norms and can result in your application being dismissed before your qualifications are even evaluated.

Use a resume when applying for positions in the private sector, including corporations, startups, nonprofits, and government agencies (with the exception of federal jobs in certain countries). In the United States, Canada, and Australia, the resume is the standard application document for the vast majority of job openings. If a job posting asks for a "resume," submit a concise, targeted document of one to two pages.

Use a CV when applying for academic positions such as professorships, research positions, postdoctoral fellowships, and academic administrative roles. Academic institutions expect a comprehensive record of your scholarly work, and submitting a brief resume would suggest you lack significant academic accomplishments. CVs are also required for most research grants, academic fellowships, and scientific research positions.

Medical professionals applying for clinical positions in many countries are expected to submit a CV that includes their complete education, residency, fellowship, board certifications, clinical experience, publications, and professional memberships. The medical field's emphasis on credentials and training history necessitates the comprehensive format of a CV.

When applying for positions outside your home country, research the local conventions carefully. In many European countries, including the United Kingdom, Ireland, Germany, and the Netherlands, the term "CV" is used to refer to what Americans would call a resume, a short, targeted document. If a European company asks for a CV, they typically want a one-to-two-page targeted document, not a comprehensive academic CV. Similarly, applications in the Middle East, Africa, and parts of Asia may have their own conventions regarding document type, length, and required personal information.

When a job posting is ambiguous or does not specify which document to submit, consider the nature of the role and the organization. Academic and research roles call for CVs; everything else typically calls for resumes. If you are truly unsure, a well-crafted two-page resume is a safe choice for most situations, as it provides enough detail to be thorough without overwhelming the reader.`,
				},
				{
					titleKey: msg`Regional Preferences and International Applications`,
					contentKey: msg`Resume and CV conventions vary significantly around the world, and understanding regional preferences is crucial when applying for international positions. What is standard in one country may be unusual or even inappropriate in another, and failing to adapt your application materials can put you at a disadvantage.

In the United States and Canada, the resume is the standard document for private-sector job applications. It should be one to two pages, should not include a photo or personal details like age or marital status, and should focus on professional achievements and skills. The term "CV" in these countries is reserved for academic and research positions and refers to a comprehensive multi-page document.

In the United Kingdom and Ireland, the term "CV" is used universally, but it refers to a document similar to an American resume: typically two pages, focused on relevant experience and skills, and tailored to the specific position. What Americans call a CV (a comprehensive academic document) is sometimes distinguished in British English as an "academic CV." British CVs may include a "personal statement" instead of a professional summary and often list referees at the bottom of the document.

In continental Europe, conventions vary by country but generally lean toward a structured format that includes a professional photo, date of birth, and nationality. Germany has particularly specific expectations: a German Lebenslauf (CV) is typically accompanied by copies of degrees and reference letters, arranged in a complete "Bewerbungsmappe" (application folder). French CVs are usually one page and include a photo. Scandinavian countries tend to follow a more informal approach similar to American resumes.

In Australia and New Zealand, the terms "resume" and "CV" are used interchangeably and refer to a two-to-three-page document. Australian resumes tend to be slightly longer than American ones and may include references or referee contact information. Personal details beyond contact information are generally not expected.

In the Middle East, many employers expect CVs that include personal information such as date of birth, nationality, marital status, and a professional photograph. These details help employers navigate visa and work permit requirements in the region. In Asia, conventions vary widely: Japanese resumes follow a very specific format called a "rirekisho," while South Korean resumes often include photos and personal details. Indian resumes tend to be longer and more detailed than American ones.

When applying internationally, always research the specific conventions of your target country and industry. Networking with professionals already working in that market and reviewing job application guidelines from local career resources are the most reliable ways to ensure your application materials meet expectations.`,
				},
			],
			faqItems: [
				{
					questionKey: msg`Which is better for international jobs, a resume or a CV?`,
					answerKey: msg`It depends on the country and the nature of the role. In the UK, Ireland, Australia, and much of Europe, the term "CV" is used for what Americans call a resume, a short targeted document of one to three pages. In academic or research positions worldwide, a comprehensive CV is expected. For private-sector international roles, research the conventions of the specific country. When in doubt, a well-structured two-page document that highlights your relevant experience and qualifications is appropriate for most international applications.`,
				},
				{
					questionKey: msg`Can I use one document for everything?`,
					answerKey: msg`Not effectively. A resume and a CV serve different purposes and audiences. Submitting a comprehensive 10-page CV for a marketing manager role would overwhelm the recruiter, while submitting a one-page resume for an academic position would suggest a lack of scholarly accomplishments. Maintain a master CV that documents your complete career history, and create targeted resumes by extracting and tailoring the most relevant content for each specific industry or role. This two-document approach ensures you are always prepared for any opportunity.`,
				},
			],
		},
	],
};
