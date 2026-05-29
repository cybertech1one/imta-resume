import { msg } from "@lingui/core/macro";
import type { WikiCategory } from "../types";

export const resumeSectionsCategory: WikiCategory = {
	slug: "resume-sections",
	titleKey: msg`Resume Sections`,
	descriptionKey: msg`Comprehensive guides for every section of your resume, from summaries and experience to skills and references.`,
	iconName: "ListIcon",
	seoTitle: "Resume Sections Guide - What to Include | IMTA Resume",
	seoDescription:
		"Learn what sections to include in your resume. Expert guides for writing summaries, experience, education, skills, and more.",
	articles: [
		// ---------------------------------------------------------------
		// 1. Resume Summary
		// ---------------------------------------------------------------
		{
			slug: "resume-summary",
			titleKey: msg`How to Write a Resume Summary That Gets Noticed`,
			descriptionKey: msg`Learn how to craft a compelling professional summary that captures recruiter attention in seconds and highlights your strongest qualifications.`,
			seoTitle: "How to Write a Resume Summary That Gets Noticed | IMTA Resume",
			seoDescription:
				"Master the art of writing a powerful resume summary. Learn the formula top candidates use to hook recruiters, with examples for every career level.",
			keywords: ["resume summary", "professional summary", "resume objective", "resume profile"],
			readingTime: 10,
			dateModified: "2026-01-15",
			sections: [
				{
					titleKey: msg`What Is a Resume Summary and Why It Matters`,
					contentKey: msg`A resume summary, sometimes called a professional summary or resume profile, is a concise paragraph at the top of your resume that highlights your most relevant qualifications, experience, and accomplishments. Think of it as your elevator pitch on paper: you have roughly six seconds to convince a recruiter that the rest of your resume is worth reading, and the summary is where that impression forms.

Unlike the outdated objective statement, which focuses on what you want from an employer, a resume summary focuses on what you bring to the table. It typically runs two to four sentences long and is tailored to the specific role you are targeting. The most effective summaries blend your years of experience, core competencies, and a measurable achievement into one compelling snapshot.

Recruiters and applicant tracking systems both parse this section heavily. A well-written summary can boost your chances of passing initial screening by as much as 40 percent, according to multiple hiring manager surveys. It acts as an anchor that orients the reader and sets expectations for the detail that follows in your experience and skills sections.`,
				},
				{
					titleKey: msg`The Anatomy of a Strong Professional Summary`,
					contentKey: msg`A high-impact resume summary follows a reliable formula. Start with a professional title or identity statement that matches the job posting, such as "Results-driven marketing manager" or "Full-stack software engineer with eight years of experience." This immediately tells the reader who you are in professional terms.

Next, include your strongest qualifier. This could be total years of experience, a relevant degree or certification, or a domain you specialize in. Follow that with two to three key skills or competencies that directly align with the target position. Finally, close with a quantifiable achievement, a signature accomplishment that proves you deliver results.

For example: "Detail-oriented data analyst with five years of experience transforming complex datasets into actionable business intelligence. Proficient in SQL, Python, and Tableau. Reduced quarterly reporting time by 35 percent at XYZ Corporation by building automated dashboards." This single paragraph tells the recruiter your role, experience level, technical abilities, and proof of impact.

Avoid vague descriptors like "hard-working team player" or "passionate professional." These phrases are so overused that they add no signal. Every word in your summary should either qualify you for the role or prove you can perform in it.`,
				},
				{
					titleKey: msg`Resume Summary Examples by Career Level`,
					contentKey: msg`For entry-level candidates, a summary might read: "Recent finance graduate from ISCAE Casablanca with internship experience in corporate auditing and a strong foundation in IFRS standards. Completed a capstone project analyzing risk portfolios for three Moroccan banks, delivering findings that were adopted by the supervising team."

Mid-career professionals can leverage more depth: "Operations manager with seven years of experience in logistics and supply chain optimization across the MENA region. Led a warehouse automation initiative that reduced order fulfillment time by 28 percent and saved $1.2 million annually. Fluent in Arabic, French, and English."

Senior and executive candidates should emphasize leadership scope: "Chief Technology Officer with 15 years of experience building engineering organizations from startup to scale-up. Grew a team from 12 to 180 engineers across four countries while maintaining a 92 percent employee retention rate. Led the platform migration that increased system throughput by 400 percent."

Career changers face a unique challenge. Focus on transferable skills and the narrative bridge: "Former high school mathematics teacher transitioning into data science, combining six years of quantitative problem-solving with newly earned certifications in machine learning and statistical analysis. Built predictive models during a bootcamp capstone that achieved 94 percent accuracy on real-world datasets."`,
				},
				{
					titleKey: msg`Common Mistakes That Weaken Your Summary`,
					contentKey: msg`The most frequent mistake is writing a generic summary that could apply to anyone. If you can swap your name with a stranger's and the summary still makes sense, it is too vague. Tailor every summary to the specific job description by mirroring the language and priorities listed in the posting.

Another common error is making the summary too long. Anything beyond five sentences starts to feel like a cover letter pasted into the wrong section. Recruiters scan, they do not read in the initial pass. Keep it tight and scannable.

Avoid first-person pronouns. Instead of writing "I am an experienced project manager," write "Experienced project manager with..." This is a widely accepted resume convention that keeps the tone professional and concise.

Listing soft skills without evidence is another pitfall. Saying you have "excellent communication skills" means nothing without context. Instead, demonstrate it: "Presented quarterly earnings analyses to C-suite stakeholders across four international offices." The achievement implies the skill far more convincingly than the claim.

Finally, do not include information that belongs elsewhere, such as your full employment history or a list of every technology you have ever used. The summary is a highlight reel, not an exhaustive inventory.`,
				},
				{
					titleKey: msg`How to Tailor Your Summary for ATS and Recruiters`,
					contentKey: msg`Applicant tracking systems scan your resume for keyword matches before a human ever sees it. Your summary is prime real estate for embedding critical keywords because it sits at the top of the document. Review the job description and identify the three to five most important terms, then weave them naturally into your summary.

For example, if a job posting emphasizes "project management," "Agile methodology," and "stakeholder communication," your summary should include those exact phrases. But do not keyword-stuff: the text still needs to read naturally to the human recruiter who reviews it after the ATS pass.

Use the same job title that appears in the posting. If the posting says "Software Development Engineer" and your previous title was "Software Engineer II," consider using the posting's exact phrasing in your summary while listing your actual title in the experience section.

Mirror the tone and language of the company. A startup that writes casual, energetic job postings will respond differently than a Fortune 500 firm with formal language. Matching tone signals cultural alignment without explicitly stating it.

One effective technique is to read the posting aloud and note which words repeat. Repeated terms indicate priority requirements. Ensure those terms appear in your summary, ideally within the first two sentences where both ATS parsers and human eyes focus most attention.`,
				},
			],
			faqItems: [
				{
					questionKey: msg`How long should a resume summary be?`,
					answerKey: msg`A resume summary should be two to four sentences, typically 40 to 60 words. This length is enough to communicate your professional identity, core skills, and a standout achievement without overwhelming the reader. Keep it concise so recruiters can absorb the key points in a single glance.`,
				},
				{
					questionKey: msg`Should I use a resume summary or an objective statement?`,
					answerKey: msg`In most cases, a resume summary is the better choice because it highlights what you offer the employer, not what you want from them. Objective statements are considered outdated for experienced professionals. The only exception is if you are a brand-new graduate with no work experience at all, in which case a brief objective can provide direction. Even then, a skills-based summary often performs better.`,
				},
				{
					questionKey: msg`Can I use the same resume summary for every application?`,
					answerKey: msg`No. A generic summary significantly reduces your chances of passing ATS screening and capturing recruiter interest. Tailor your summary for each application by incorporating keywords from the job description and emphasizing the qualifications most relevant to that specific role. You can keep a master summary and adjust key phrases for each submission.`,
				},
			],
		},

		// ---------------------------------------------------------------
		// 2. Work Experience
		// ---------------------------------------------------------------
		{
			slug: "work-experience",
			titleKey: msg`How to Write Work Experience on a Resume`,
			descriptionKey: msg`Master the art of presenting your employment history with impactful bullet points, quantified achievements, and strategic formatting.`,
			seoTitle: "How to Write Work Experience on a Resume | IMTA Resume",
			seoDescription:
				"Learn how to write compelling work experience entries on your resume. Expert tips on bullet points, action verbs, quantified achievements, and formatting.",
			keywords: ["work experience resume", "job description", "employment history", "resume experience"],
			readingTime: 12,
			dateModified: "2026-01-15",
			sections: [
				{
					titleKey: msg`Why Work Experience Is the Most Important Resume Section`,
					contentKey: msg`The work experience section is the backbone of almost every resume. Hiring managers consistently rank it as the first section they examine, often before education or skills. This is where you prove that you can do the job, not just claim you can. A strong experience section demonstrates your track record, your growth trajectory, and the tangible impact you have made in previous roles.

For most professionals with more than two years of experience, this section should occupy the largest portion of your resume. It answers the recruiter's most pressing question: "What has this person actually done?" Even if you have an impressive degree or an enviable skills list, it is your work history that tells the story of how you applied that knowledge in real-world settings.

The order matters too. List your experience in reverse chronological order, with your most recent role first. This format is preferred by 95 percent of recruiters because it immediately shows your current or most recent capability level. The exception is functional or hybrid resume formats, which might group experience by skill area, but these are generally recommended only for career changers or candidates with significant employment gaps.`,
				},
				{
					titleKey: msg`How to Structure Each Work Experience Entry`,
					contentKey: msg`Every work experience entry should include four core elements: your job title, the company name and location, the dates of employment, and a set of bullet points describing your responsibilities and achievements. Some candidates also add a brief one-line description of the company if it is not widely known.

For job titles, use the exact title you held. If your official title was obscure or company-specific, you can add a more recognizable equivalent in parentheses, such as "Client Success Architect (Account Manager)." This helps both ATS systems and recruiters understand your role.

Dates should include the month and year for both start and end, formatted consistently throughout the resume. Writing "June 2022 - Present" is clearer than "2022 - Present" and prevents assumptions about gaps. If you held multiple roles at the same company, list each role separately under the company header to show internal progression.

Location can be the city and country, or "Remote" if the role was fully remote. For hybrid arrangements, list the company's primary office location. This detail helps recruiters understand your geographic context and willingness to work in certain settings.

Bullet points are where the real selling happens. Aim for three to six bullets per role, with your most recent positions having the most detail. Older or less relevant roles can have fewer bullets or even be condensed into a single line.`,
				},
				{
					titleKey: msg`Writing Achievement-Driven Bullet Points`,
					contentKey: msg`The difference between a mediocre resume and a compelling one often comes down to how bullet points are written. The most effective approach is the accomplishment formula: start with a strong action verb, describe what you did, and quantify the result.

Instead of writing "Responsible for managing a team of sales representatives," write "Led a team of 12 sales representatives to exceed quarterly targets by 18 percent, generating $2.4 million in new revenue." The second version uses a strong verb (led), provides scope (12 representatives), and delivers a measurable result (18 percent over target, $2.4 million).

Strong action verbs include: achieved, built, created, delivered, engineered, facilitated, generated, implemented, launched, managed, negotiated, optimized, pioneered, reduced, streamlined, and transformed. Avoid weak or passive constructions like "was responsible for," "helped with," or "assisted in."

Quantification is what separates good bullet points from great ones. Whenever possible, include numbers: percentages of improvement, dollar amounts saved or earned, team sizes managed, time reduced, customer satisfaction scores increased, or volume of work processed. If you do not have exact figures, estimate conservatively and use qualifiers like "approximately" or "over."

Use the STAR framework (Situation, Task, Action, Result) to structure each bullet mentally, even though the bullet itself will be concise. The situation and task provide context, the action shows what you did, and the result proves it worked.`,
				},
				{
					titleKey: msg`How to Handle Employment Gaps and Short Tenures`,
					contentKey: msg`Employment gaps happen, and recruiters are increasingly understanding about them, especially since 2020. The key is not to hide gaps but to address them strategically. If you took time off for education, caregiving, health reasons, or personal development, a brief note in your experience section or summary can provide context.

For gaps shorter than six months, using years only for your dates (instead of months) can naturally bridge the gap without being dishonest. For longer gaps, consider including relevant activities during that period: freelance work, volunteer positions, coursework, or personal projects that demonstrate continued professional development.

Short tenures of less than a year can be a red flag if there are several in a row. If you left a role quickly for a legitimate reason (company closed, role was misrepresented, relocation), you can address this briefly in a cover letter. For a single short tenure, you can include it on the resume if the experience is relevant, or omit it if it is not.

Contract and temporary positions should be clearly labeled as such. Writing "Contract" or "Freelance" next to the job title normalizes a shorter duration and signals to the recruiter that the arrangement was intentional. Grouping multiple short-term contracts under a single "Freelance Consultant" heading with dates spanning the full period is another effective strategy.

Be honest. Fabricating dates or omitting roles that would show up in a background check creates far bigger problems than the gap itself. Transparency combined with a positive narrative about what you learned or accomplished during the gap is always the better approach.`,
				},
				{
					titleKey: msg`Tailoring Your Experience Section for Each Application`,
					contentKey: msg`Your work experience section should not be static across applications. While you should never fabricate experience, you can and should emphasize different aspects of your history depending on what the target role requires.

Start by analyzing the job description. Highlight the key responsibilities and qualifications mentioned. Then review your bullet points and reorder them so that the most relevant achievements appear first in each role. Recruiters often read only the first two to three bullets before deciding whether to continue.

You can also adjust the level of detail for each role. If you are applying for a marketing position and one of your previous roles was primarily sales but included marketing projects, expand the marketing-related bullets and condense the pure sales work.

Consider which roles to include at all. For professionals with 15 or more years of experience, it is acceptable to limit the detailed experience section to the last 10 to 12 years and summarize earlier roles in a brief "Earlier Career" section with just titles, companies, and dates. This keeps the resume focused and prevents it from running too long.

Keyword alignment is critical for ATS. If the posting says "project management" and your resume says "project coordination," consider whether "project management" more accurately describes your work. Using the employer's language, where it honestly applies, increases your match score without misrepresenting your experience.`,
				},
				{
					titleKey: msg`Formatting Tips for Maximum Readability`,
					contentKey: msg`Consistent formatting in the experience section makes your resume easier to scan and more professional in appearance. Use the same structure for every entry: job title on one line, company and location on the next, dates aligned consistently (either right-aligned or on the same line as the company), and bullet points below.

Keep bullet points to one to two lines each. If a bullet runs to three lines, it is too long and should be split or trimmed. Start every bullet with an action verb and avoid starting multiple bullets with the same word.

Use bullet points, not paragraphs. Dense blocks of text are difficult to scan and discourage recruiters from reading closely. Bullets create visual breathing room and allow the reader to quickly identify the points most relevant to their search.

Bold or italicize strategically. Some candidates bold their job titles to create a clear visual hierarchy, while others bold key metrics within bullets to draw the eye to quantified results. Either approach works, but be consistent and do not over-format. If everything is bold, nothing stands out.

White space matters. Leave adequate spacing between entries and between sections. A cramped resume feels overwhelming even if the content is strong. If you are running out of space, it is better to trim content than to reduce margins and font size below readable levels.`,
				},
			],
			faqItems: [
				{
					questionKey: msg`How many jobs should I list on my resume?`,
					answerKey: msg`For most professionals, listing three to five relevant positions is ideal. If you have over 15 years of experience, focus on the most recent 10 to 12 years in detail and briefly summarize earlier roles. New graduates or early-career candidates should include internships, part-time jobs, and relevant volunteer work to fill the section.`,
				},
				{
					questionKey: msg`Should I include jobs that are not relevant to the position I am applying for?`,
					answerKey: msg`Include them if they demonstrate transferable skills, fill an employment gap, or show career progression. If a past role is completely unrelated and you have enough relevant experience, you can omit it or condense it to a single line with just the title, company, and dates. Never leave unexplained gaps if the omission creates one.`,
				},
				{
					questionKey: msg`How do I describe work experience if I was promoted within the same company?`,
					answerKey: msg`List each position separately under a single company header to clearly show your progression. Include separate dates and bullet points for each role. This approach highlights your growth and demonstrates that you were valued enough to be promoted, which is a strong signal to recruiters.`,
				},
			],
		},

		// ---------------------------------------------------------------
		// 3. Education Section
		// ---------------------------------------------------------------
		{
			slug: "education-section",
			titleKey: msg`Education Section: What to Include and How to Format It`,
			descriptionKey: msg`Everything you need to know about listing your education on a resume, from degree formatting and GPA decisions to coursework and academic honors.`,
			seoTitle: "Education Section: What to Include and How to Format It | IMTA Resume",
			seoDescription:
				"Learn what to include in your resume education section. Expert guidance on formatting degrees, when to include GPA, listing coursework, and handling incomplete education.",
			keywords: ["education on resume", "education section", "degree on resume", "GPA on resume"],
			readingTime: 9,
			dateModified: "2026-01-15",
			sections: [
				{
					titleKey: msg`Where to Place the Education Section on Your Resume`,
					contentKey: msg`The placement of your education section depends on your career stage and what you want to emphasize. For current students and recent graduates with limited work experience, education should appear near the top of the resume, immediately after the summary. Your degree is your strongest qualification at this stage, and it should be visible within the first third of the page.

For professionals with more than two to three years of relevant work experience, education typically moves below the work experience section. At this point, your practical accomplishments carry more weight than your academic credentials, and recruiters will look for your work history first.

There are exceptions to this general rule. If you are applying for a role in academia, research, or a field where specific credentials are mandatory (law, medicine, certain engineering disciplines), education may warrant a prominent position regardless of experience level. Similarly, if you recently completed a prestigious program or earned a degree directly relevant to a career change, featuring it prominently can strengthen your candidacy.

The key principle is to lead with your strongest selling point. If your education is more impressive or relevant than your work history for the target role, put it first. Otherwise, let your experience do the talking and list education as supporting evidence.`,
				},
				{
					titleKey: msg`What to Include in Each Education Entry`,
					contentKey: msg`A standard education entry includes four elements: the degree name, the institution name, the location, and the graduation date (or expected graduation date). For example: "Bachelor of Science in Computer Science, Mohammed V University, Rabat, Morocco, June 2024."

The degree name should be written out formally. Use "Bachelor of Science" rather than "BS" or "B.Sc." for clarity, though abbreviations are acceptable if space is tight. Include your major and minor if the minor is relevant to the position. Double majors should both be listed.

For the graduation date, recent graduates should include the month and year. Experienced professionals can list just the year, and those who graduated more than 15 years ago may choose to omit the date entirely to avoid age-related bias. If you are still in school, write "Expected June 2027" or "In Progress" with the anticipated completion date.

Beyond these basics, you may add relevant coursework, academic honors (Dean's List, cum laude), thesis or capstone project titles, study abroad experiences, or extracurricular leadership roles. These additions are most valuable for students and recent graduates. As your career progresses, trim these details to keep the section concise and focused on the degree itself.

If you attended a university but did not complete the degree, you can still list it. Write the institution name, the area of study, and the dates attended, followed by a note such as "Coursework completed toward a Bachelor of Arts in Economics, 2019-2021." This is honest and still shows relevant academic exposure.`,
				},
				{
					titleKey: msg`When to Include Your GPA and How to Present It`,
					contentKey: msg`The GPA question is one of the most debated topics in resume writing. The general guideline is to include your GPA if it is strong (3.5 or above on a 4.0 scale, or 14/20 and above in the French system) and you graduated within the last three to five years. Beyond that window, your work experience should speak for itself.

If your overall GPA is not impressive but your major GPA is, list the major GPA instead and label it clearly: "Major GPA: 3.7/4.0." This is a common and accepted practice that highlights your strength in your field of study.

For international students or graduates applying to positions in different countries, include the grading scale for clarity. Writing "16/20 (French system)" or "First Class Honours (UK system)" helps recruiters who may not be familiar with your country's grading conventions.

Some industries care more about GPA than others. Finance, consulting, and certain engineering firms often use GPA as a screening threshold, especially for entry-level roles. Technology companies, creative fields, and many other industries place less emphasis on grades and more on portfolio work, projects, and practical experience.

If your GPA is below 3.0 or the equivalent, it is generally better to omit it. Leaving it off is not suspicious; many experienced professionals do not include it. However, if a job application specifically asks for your GPA, always provide it honestly.`,
				},
				{
					titleKey: msg`Listing Relevant Coursework, Projects, and Honors`,
					contentKey: msg`Relevant coursework is most useful for students and recent graduates who lack extensive work experience. Select four to six courses that directly relate to the target position and list them in a comma-separated format under your degree. Choose courses that demonstrate specialized knowledge, not introductory classes that every student in your major would have taken.

Academic projects can serve as powerful resume content when professional experience is limited. Treat significant projects like mini work experience entries: describe the project goal, your specific contribution, the tools or methods you used, and the outcome. For example: "Developed a machine learning model to predict customer churn using Python and scikit-learn, achieving 91 percent accuracy on a dataset of 50,000 records."

Honors and awards add credibility. List Dean's List appearances with the specific semesters, Latin honors (summa cum laude, magna cum laude, cum laude), departmental awards, and scholarships that were merit-based. Competitive scholarships that are well known in your region or industry carry particular weight.

Thesis or dissertation work should be listed with the title and a one-sentence summary if it is relevant to the target role. This is especially important in research-oriented fields. If your thesis was published, include the publication reference.

As a general rule, start trimming academic details as your professional experience grows. By the time you have five or more years of work experience, your education section should typically be streamlined to just the degree, institution, and date.`,
				},
				{
					titleKey: msg`How to Handle Multiple Degrees, Certifications, and Ongoing Education`,
					contentKey: msg`If you hold multiple degrees, list them in reverse chronological order, with the highest or most recent degree first. A Master's degree should appear above a Bachelor's degree. If both degrees are from the same institution, you can group them under a single institution header with separate entries for each degree.

Professional certifications can be listed in the education section or in a separate certifications section, depending on their importance and quantity. If you have one or two certifications that are closely tied to your formal education, grouping them with education makes sense. If you have several professional certifications, a dedicated section keeps the resume organized.

Ongoing education shows commitment to growth. If you are currently enrolled in a degree program, certification course, or professional development program, include it with an expected completion date. Online courses from platforms like Coursera, edX, or professional training providers can be included if they are relevant and from reputable institutions.

Boot camps and intensive training programs are increasingly respected by employers, especially in technology. List them as you would any educational program: program name, institution, and completion date. Including a capstone project or portfolio piece from the program adds credibility.

For candidates with education from multiple countries, be consistent in how you present degrees and institutions. If your degree title might be unfamiliar to the target audience, include a brief parenthetical explanation: "Licence Fondamentale (equivalent to Bachelor's degree) in Business Administration."`,
				},
			],
			faqItems: [
				{
					questionKey: msg`Should I include my high school on my resume?`,
					answerKey: msg`Generally, no. Once you have completed any form of higher education (university, community college, trade school, or professional certification), high school should be removed from your resume. The only exception is if you are a current high school student or recent graduate who has not yet started any post-secondary education.`,
				},
				{
					questionKey: msg`How do I list an incomplete degree on my resume?`,
					answerKey: msg`List the institution name, the field of study, and the dates you attended. You can write "Coursework completed toward [Degree Name]" or "X credit hours completed in [Field]." This approach is honest, shows the academic exposure you gained, and avoids implying you earned a degree you did not finish.`,
				},
				{
					questionKey: msg`Is it okay to list online courses and certifications in the education section?`,
					answerKey: msg`Yes, particularly if the courses are from recognized institutions or platforms and are directly relevant to the position. For one or two courses, the education section works fine. If you have many, consider a separate "Professional Development" or "Certifications" section to keep the education section focused on formal degrees.`,
				},
			],
		},

		// ---------------------------------------------------------------
		// 4. Skills Section
		// ---------------------------------------------------------------
		{
			slug: "skills-section",
			titleKey: msg`Resume Skills Section: Hard Skills, Soft Skills & More`,
			descriptionKey: msg`Learn how to build a powerful skills section that passes ATS screening and impresses hiring managers with the right mix of technical and interpersonal abilities.`,
			seoTitle: "Resume Skills Section: Hard Skills, Soft Skills & More | IMTA Resume",
			seoDescription:
				"Build a resume skills section that gets results. Learn how to choose and organize hard skills, soft skills, and technical skills for maximum ATS and recruiter impact.",
			keywords: ["resume skills", "hard skills", "soft skills", "technical skills", "skills section"],
			readingTime: 10,
			dateModified: "2026-01-15",
			sections: [
				{
					titleKey: msg`Why the Skills Section Is Critical for Modern Resumes`,
					contentKey: msg`The skills section serves a dual purpose on your resume. First, it acts as a quick-reference index that allows recruiters to verify at a glance whether you possess the specific competencies they need. Second, it is one of the most heavily scanned sections by applicant tracking systems, which match your listed skills against the keywords in the job posting.

Studies show that recruiters spend an average of 7.4 seconds on an initial resume scan. During that brief window, the skills section is one of three areas that consistently receives attention, alongside the job titles and company names in your experience section. A well-organized skills section can be the difference between landing in the "yes" pile and being passed over.

For ATS purposes, the skills section is indispensable. Many ATS platforms assign a match score based heavily on keyword presence, and the skills section is the most natural place to include these keywords. Even if your experience bullets mention the same skills in context, having them listed explicitly in a dedicated section ensures the ATS parser can identify them without ambiguity.

This section is also where you can showcase breadth. While your experience section demonstrates depth in specific roles, the skills section can highlight the full range of tools, technologies, languages, and methodologies you command. This is particularly valuable in fast-moving industries where tool familiarity can be a hiring differentiator.`,
				},
				{
					titleKey: msg`Hard Skills vs. Soft Skills: What to Include`,
					contentKey: msg`Hard skills are specific, teachable abilities that can be measured and tested. Examples include programming languages (Python, JavaScript), software proficiency (Adobe Creative Suite, SAP), foreign languages, data analysis techniques, accounting methods, and machine operation certifications. These are the skills you can demonstrate through a test or portfolio piece.

Soft skills are interpersonal and behavioral competencies that are harder to quantify but equally important in many roles. Examples include leadership, communication, problem-solving, teamwork, adaptability, and time management. While valuable, soft skills are best demonstrated through your experience bullets rather than simply listed, because anyone can claim to have them.

The most effective approach is to prioritize hard skills in your dedicated skills section and weave soft skills into your experience descriptions. For example, instead of listing "leadership" as a skill, show it in action: "Led a cross-functional team of 15 to deliver a product launch three weeks ahead of schedule."

There are exceptions. Some roles, particularly in management, human resources, or client-facing positions, explicitly require certain soft skills. In these cases, including a few highly relevant soft skills alongside your hard skills is appropriate. The key is to be selective and specific. "Conflict resolution" is more meaningful than "people skills."

Technical skills deserve special attention. In technology, engineering, and data-related fields, a detailed technical skills subsection that lists languages, frameworks, tools, databases, platforms, and methodologies is expected and can be quite extensive. Group these logically (for example, "Languages: Python, TypeScript, Go" and "Databases: PostgreSQL, MongoDB, Redis") for easy scanning.`,
				},
				{
					titleKey: msg`How to Choose the Right Skills for Each Application`,
					contentKey: msg`The skills you list should be driven by the job description, not by everything you have ever learned. Start by reading the posting carefully and highlighting every skill, tool, technology, and competency mentioned. These are the keywords the ATS and recruiter will be looking for.

Cross-reference that list with your own abilities. Only include skills you can genuinely demonstrate or discuss in an interview. Listing a programming language you used once in a tutorial five years ago will backfire when you are asked to whiteboard a solution. Be honest about your proficiency levels.

Prioritize skills by relevance. The first skills a recruiter sees should be the ones most critical to the role. If you are applying for a front-end developer position and the posting emphasizes React, TypeScript, and responsive design, those should appear before your Python or SQL skills, even if you are more proficient in the latter.

Research the industry standard tools. If every posting in your target field mentions a specific platform or certification, include it if you have it. Industry-specific tools often serve as gatekeepers: lacking them can disqualify you immediately, while having them signals you can contribute from day one.

Remove outdated or irrelevant skills. Listing Microsoft Word proficiency in 2026 takes up space that could be used for meaningful skills. Similarly, technologies that are no longer widely used (unless the posting specifically mentions them) can make your resume feel dated. Keep your skills list current and forward-looking.`,
				},
				{
					titleKey: msg`Organizing and Formatting Your Skills Section`,
					contentKey: msg`There are several effective ways to organize a skills section. The simplest is a comma-separated list grouped by category: "Programming: Python, JavaScript, SQL | Tools: Docker, Git, Jenkins | Cloud: AWS, GCP." This format is compact, scannable, and ATS-friendly.

Another approach is a column layout where skills are listed in two or three columns with category headers. This uses space efficiently and creates clear visual grouping. It works particularly well for candidates with a large number of technical skills who want to present them in an organized taxonomy.

Some candidates use proficiency bars or ratings (for example, "Python: Expert, R: Intermediate"). While visually appealing, these can be problematic. There is no universal standard for what "intermediate" means, and ATS systems cannot interpret visual elements like progress bars. If you use proficiency indicators, pair them with text labels and ensure the underlying text is parseable.

Regardless of format, limit your skills section to 10 to 15 skills for most roles. A list of 30 skills looks unfocused and raises the question of whether you are genuinely proficient in all of them. Quality and relevance beat quantity.

Place the skills section where it makes the most impact. For technical roles, it often appears near the top, after the summary but before work experience, because technical qualifications are the first thing hiring managers verify. For other roles, it can appear after work experience or alongside it in a sidebar layout.`,
				},
				{
					titleKey: msg`Skills Section Mistakes to Avoid`,
					contentKey: msg`Listing skills you cannot back up in an interview is the most damaging mistake. If you claim expertise in a technology, expect to be tested on it. Being caught in a bluff destroys credibility and can end an interview process immediately. Only list skills you are prepared to discuss or demonstrate.

Avoid generic skill lists that do not differentiate you. Everyone applying for a marketing role will claim "social media management" and "content creation." Instead, be specific: name the platforms (Meta Business Suite, LinkedIn Campaign Manager), the tools (Hootsuite, Buffer), and the skills within the discipline (A/B testing, conversion rate optimization).

Do not include basic computer literacy skills unless the role specifically requests them. Proficiency in email, web browsers, or common office applications is assumed in virtually every professional role. Using space for these signals that you have nothing more impressive to offer.

Mixing hard and soft skills randomly creates a disorganized impression. If you include both types, separate them visually with clear headers or groupings. A list that reads "Python, teamwork, Docker, communication, AWS, adaptability" looks like an unstructured brain dump.

Finally, never copy the job description's skill requirements verbatim into your skills section. ATS systems are increasingly sophisticated and can detect exact-match copying. More importantly, recruiters notice when your skills section reads like a mirror of their posting with no evidence of genuine experience behind it. Use the same keywords but present them authentically within your own professional context.`,
				},
			],
			faqItems: [
				{
					questionKey: msg`How many skills should I list on my resume?`,
					answerKey: msg`Aim for 8 to 15 skills, focusing on those most relevant to the target position. For technical roles, you may include more if they are well-organized into categories. The goal is to present a focused, credible list rather than an exhaustive inventory. Every skill listed should be one you can confidently discuss in an interview.`,
				},
				{
					questionKey: msg`Should I include proficiency levels for my skills?`,
					answerKey: msg`Proficiency levels can be useful for language skills and certain technical competencies where the distinction between beginner and expert matters. However, avoid subjective rating systems like progress bars, which have no universal standard and cannot be parsed by ATS systems. If you use proficiency labels, stick to widely understood terms like "native," "fluent," "proficient," or "familiar."`,
				},
				{
					questionKey: msg`Where should the skills section go on my resume?`,
					answerKey: msg`For technical roles, place it near the top after your summary to immediately showcase your qualifications. For other roles, it typically works best after the work experience section. The guiding principle is to lead with whatever section is strongest for the specific role you are targeting.`,
				},
			],
		},

		// ---------------------------------------------------------------
		// 5. Resume Objective
		// ---------------------------------------------------------------
		{
			slug: "resume-objective",
			titleKey: msg`Resume Objective vs Summary: Which Should You Use?`,
			descriptionKey: msg`Understand the difference between a resume objective and a professional summary, and learn which one is right for your situation.`,
			seoTitle: "Resume Objective vs Summary: Which Should You Use? | IMTA Resume",
			seoDescription:
				"Resume objective or summary? Learn when to use each, see examples for both, and discover which approach will help you land more interviews.",
			keywords: ["resume objective", "objective statement", "career objective", "resume summary vs objective"],
			readingTime: 9,
			dateModified: "2026-01-15",
			sections: [
				{
					titleKey: msg`What Is a Resume Objective Statement?`,
					contentKey: msg`A resume objective is a brief statement, typically one to two sentences, that communicates your career goals and what you hope to achieve in the role you are applying for. The traditional format focuses on the candidate's aspirations: "Seeking a position in software development where I can apply my coding skills and grow professionally."

Objective statements were the standard resume opener for decades, but their popularity has declined significantly in the modern job market. The primary criticism is that they focus on what the candidate wants rather than what they offer the employer. In a competitive job market where hundreds of applicants may apply for a single position, employers are more interested in what you can do for them than what they can do for you.

That said, the resume objective has not disappeared entirely. It has evolved. Modern objective statements are more targeted and value-driven, often blending the candidate's goals with a clear statement of what they bring to the table. This hybrid approach retains the directional clarity of an objective while incorporating the employer-focused value proposition of a summary.

The original form of the objective, the generic "seeking a challenging position" variety, is now widely considered outdated and should be avoided. It wastes valuable resume real estate and tells the recruiter nothing they could not already infer from the fact that you applied for the job.`,
				},
				{
					titleKey: msg`What Is a Professional Summary and How Does It Differ?`,
					contentKey: msg`A professional summary is a three to five sentence paragraph that highlights your qualifications, core competencies, and key achievements. Unlike an objective, which looks forward to what you want, a summary looks backward at what you have accomplished and presents it as evidence of your future value.

The structural difference is clear. An objective says: "Seeking a marketing coordinator role to leverage my creative skills." A summary says: "Marketing professional with four years of experience managing multi-channel campaigns that increased brand engagement by 45 percent. Proficient in Google Analytics, HubSpot, and A/B testing methodology."

The summary is inherently more powerful because it provides proof. It tells the recruiter not just what you want to do but what you have already done. It answers the implicit question every hiring manager asks: "Why should I hire this person?" The objective, by contrast, answers a question nobody is asking: "What does this person want?"

Professional summaries are also more ATS-friendly because they naturally incorporate the keywords, job titles, and technical terms that applicant tracking systems scan for. An objective statement, being aspirational rather than descriptive, tends to include fewer matchable keywords.

The summary format also allows for more strategic positioning. You can emphasize different aspects of your background for different applications, making it a versatile tool for tailoring your resume to each job posting. An objective statement, being forward-looking and relatively generic, offers less room for customization.`,
				},
				{
					titleKey: msg`When a Resume Objective Is Still Appropriate`,
					contentKey: msg`Despite the general preference for summaries, there are specific situations where a resume objective, or a modern hybrid version, makes strategic sense.

Career changers benefit from objectives because they need to explicitly state their target direction. When your work history does not obviously align with the role you are pursuing, an objective provides the context that prevents the recruiter from dismissing your resume as irrelevant. For example: "Former financial analyst transitioning into UX design, bringing five years of data-driven decision-making to create intuitive, user-centered digital experiences."

New graduates with minimal work experience often lack the material needed for a compelling summary. In this case, a goal-oriented statement that connects their education and aspirations to the target role can be effective: "Computer science graduate from Al Akhawayn University with strong foundations in algorithm design and a passion for back-end development, seeking an entry-level software engineering role to contribute to scalable systems."

Candidates applying for positions in a specific geographic area or industry can use an objective to signal their intent. If relocation or industry focus is a key factor in the hiring decision, stating it upfront saves both parties time: "Licensed physical therapist relocating to Casablanca, seeking a clinical role in sports rehabilitation."

The common thread is that an objective works best when there is a gap between your resume and the job that needs to be bridged with explicit context. If your experience already speaks clearly to your fit for the role, a summary will almost always serve you better.`,
				},
				{
					titleKey: msg`How to Write a Modern Hybrid Statement`,
					contentKey: msg`The most effective approach for many candidates is a hybrid statement that combines the best elements of both formats. It opens with a brief professional identity (like a summary) and closes with a targeted goal (like an objective), creating a complete narrative in a compact format.

The formula is: professional identity plus key qualification plus target direction. For example: "Data scientist with three years of experience in predictive modeling and natural language processing, seeking to apply advanced analytics expertise to improve patient outcomes at a healthcare innovation company."

This hybrid approach works because it satisfies both the employer's need to know what you can do and the candidate's need to signal intentional career direction. It is especially effective for career pivoters who have relevant skills but not directly relevant titles, and for candidates targeting specific industries or company types.

To write an effective hybrid statement, start with your strongest professional identifier (your current or most relevant job title and years of experience), add one or two high-value qualifications or achievements, and end with a specific statement about what you want to do next and where. The specificity of the goal portion is what differentiates it from a generic objective.

Avoid making the statement too long. Two to three sentences is the sweet spot. If it runs longer, you have crossed into summary territory and should commit to that format instead. The hybrid works precisely because it is concise and decisive.`,
				},
				{
					titleKey: msg`Making the Right Choice for Your Situation`,
					contentKey: msg`The decision between an objective and a summary should be driven by a simple question: does your recent experience clearly align with the job you are targeting? If yes, use a summary. Your experience is your strongest argument, and the summary format lets you lead with proof.

If your experience does not directly align, whether because you are changing careers, entering the workforce for the first time, or returning after an extended break, an objective or hybrid statement provides the narrative bridge that explains your application.

Consider the employer's perspective. Recruiters reviewing dozens or hundreds of resumes are looking for quick answers: can this person do the job, and are they a good fit? A summary provides those answers through evidence. An objective provides them through stated intent. Evidence is stronger, but intent is better than nothing.

If you are unsure, default to a summary. The worst that can happen is that a recruiter reads a concise overview of your qualifications. With an objective, the worst that can happen is that a recruiter reads a statement about your goals and still has no idea whether you can actually do the job.

Regardless of which format you choose, the opening statement should be tailored to every application. A generic opener, whether summary or objective, signals to the recruiter that you are mass-applying rather than genuinely interested in their specific role. Customization takes effort, but it consistently produces better results.`,
				},
				{
					titleKey: msg`Examples of Objectives and Summaries Side by Side`,
					contentKey: msg`Seeing objectives and summaries for the same candidate illustrates the difference clearly. Consider a marketing professional with three years of experience.

Weak objective: "Seeking a marketing position where I can use my skills and grow my career." This tells the recruiter nothing useful. It could apply to any marketing job at any company.

Strong objective (hybrid): "Digital marketing specialist with expertise in SEO and content strategy, seeking a senior content role at a SaaS company to build on my track record of growing organic traffic by 200 percent."

Professional summary: "Digital marketing specialist with three years of experience driving organic growth for B2B SaaS companies. Built and executed content strategies that increased organic traffic by 200 percent and generated 1,500 qualified leads per quarter. Proficient in SEMrush, Ahrefs, Google Analytics, and HubSpot CMS."

The weak objective adds no value. The hybrid objective provides direction with some evidence. The summary provides the richest picture of the candidate's capabilities. For this candidate, the summary is clearly the strongest choice because they have relevant experience and measurable results.

Now consider a career changer moving from teaching to instructional design. A summary would struggle to highlight instructional design experience that does not exist yet. The hybrid objective works better: "High school English teacher with six years of curriculum design experience, transitioning into corporate instructional design. Completed a certified Articulate Storyline program and built three e-learning modules for a nonprofit client as part of a portfolio project."

Context determines the best format. Evaluate your situation honestly and choose the approach that presents you most effectively for the specific role you want.`,
				},
			],
			faqItems: [
				{
					questionKey: msg`Are resume objectives outdated?`,
					answerKey: msg`Traditional generic objectives like "seeking a challenging position" are considered outdated by most recruiters. However, modern, targeted objectives that combine career direction with a value statement remain useful for career changers, new graduates, and candidates whose resumes need contextual framing. When in doubt, a professional summary is the safer and generally more effective choice.`,
				},
				{
					questionKey: msg`Can I use both an objective and a summary on the same resume?`,
					answerKey: msg`No. Using both is redundant and wastes space. Choose one format based on your situation. If you want elements of both, use a hybrid statement that opens with a professional overview and closes with a targeted career goal. This gives you the benefits of both formats in a single, concise paragraph.`,
				},
			],
		},

		// ---------------------------------------------------------------
		// 6. Certifications Section
		// ---------------------------------------------------------------
		{
			slug: "certifications-section",
			titleKey: msg`How to List Certifications on Your Resume`,
			descriptionKey: msg`Learn the best practices for showcasing professional certifications, licenses, and credentials on your resume to stand out to employers.`,
			seoTitle: "How to List Certifications on Your Resume | IMTA Resume",
			seoDescription:
				"Learn how to list certifications on your resume effectively. Expert tips on formatting, placement, and choosing which credentials to include for maximum impact.",
			keywords: ["certifications on resume", "professional certifications", "licenses", "credentials"],
			readingTime: 8,
			dateModified: "2026-01-15",
			sections: [
				{
					titleKey: msg`Why Certifications Matter on Your Resume`,
					contentKey: msg`Professional certifications serve as third-party validation of your expertise. Unlike self-reported skills, certifications come from recognized organizations that have tested and verified your knowledge. This makes them powerful resume assets that can differentiate you from candidates who claim similar abilities but lack formal proof.

In many industries, certifications are not just advantageous but required. Healthcare professionals need active licenses, accountants often need CPA certification for advancement, and project managers in many organizations need PMP or equivalent credentials. Omitting a required certification can disqualify your application regardless of how strong the rest of your resume is.

Even when not strictly required, certifications signal several things to employers: you take your professional development seriously, you have met an objective standard of competence, and you are willing to invest time and effort in maintaining your skills. In competitive hiring situations where multiple candidates have similar experience, a relevant certification can be the tiebreaker.

Certifications also function as powerful ATS keywords. Many ATS systems are configured to flag specific certifications as high-priority matches. Having "AWS Solutions Architect" or "PMP" in your resume can instantly boost your match score for roles that list these as preferred qualifications.`,
				},
				{
					titleKey: msg`How to Format Your Certifications Section`,
					contentKey: msg`Each certification entry should include the full certification name, the abbreviation (if commonly used), the issuing organization, and the date earned or the expiration date. For example: "Project Management Professional (PMP), Project Management Institute, Earned March 2023, Expires March 2026."

If the certification does not expire, you can list just the date earned. If it requires ongoing continuing education, note the current status: "Active" or "In Good Standing." For certifications you are currently pursuing, write "In Progress" or "Expected [Month Year]" to signal your commitment without implying you already hold the credential.

Organize multiple certifications in reverse chronological order or by relevance to the target role. If you hold certifications in different domains, you might group them by category: "Cloud Certifications: AWS Solutions Architect, Azure Administrator" and "Security Certifications: CompTIA Security+, CISSP."

Include the certification credential ID or verification URL only if it adds value or is commonly expected in your field. Some IT certifications, for example, have public verification portals where employers can confirm your status. Adding "Credential ID: ABC123" or "Verify at [URL]" adds a layer of credibility.

Keep the section clean and scannable. Use a consistent format for every entry, with clear visual separation between certifications. If you have many certifications, a compact table or column layout can present them efficiently without taking up excessive space.`,
				},
				{
					titleKey: msg`Where to Place Certifications on Your Resume`,
					contentKey: msg`The placement of your certifications section depends on how central the credentials are to the target role. If the job posting lists a specific certification as a requirement or strong preference, consider placing the certifications section near the top of your resume, right after your summary or alongside your skills section.

For roles where certifications are supplementary rather than essential, the section typically appears after work experience and education. This keeps the focus on your practical accomplishments while still showcasing your credentials.

Some candidates include their most critical certifications directly in their resume summary. For example: "PMP-certified project manager with ten years of experience leading enterprise software implementations." This front-loads the credential and ensures it is visible even in the quickest scan.

Another effective strategy is to mention relevant certifications in both the summary and a dedicated section. The summary reference catches the attention of the fast-scanning recruiter, while the detailed section provides the specifics (dates, issuing body, status) that the more thorough reviewer will look for.

If you hold professional licenses that are legally required for your role (medical license, bar admission, teaching certificate), these should be prominently placed and may warrant their own "Licenses" section separate from optional certifications. A missing required license is an automatic disqualification, so making it immediately visible protects against any oversight.`,
				},
				{
					titleKey: msg`Which Certifications to Include and Which to Leave Off`,
					contentKey: msg`Include certifications that are relevant to the target role, recognized by employers in your industry, and currently valid. A certification from a reputable organization that directly relates to the job you are applying for is always worth listing.

Leave off certifications that are expired unless you intend to renew them soon (in which case, note "Renewal in Progress"). Expired credentials can actually work against you by suggesting that you have let your knowledge lapse.

Very old certifications for technologies or methodologies that are no longer in use should generally be removed. An MCSE certification from 2005 is not going to help you land a cloud engineering role in 2026. Keep your certifications list current and forward-looking.

Be selective about including certifications from short online courses. A two-hour LinkedIn Learning certificate does not carry the same weight as a multi-week, exam-based certification from a recognized body. If the course completion took fewer than 20 hours and has no proctored exam, consider whether it truly strengthens your resume or dilutes it.

Industry-recognized certifications carry the most weight. In IT, these include AWS, Azure, Google Cloud, CompTIA, Cisco, and ISC2 certifications. In project management, PMP, PRINCE2, and Scrum Master certifications are respected globally. In finance, CFA, CPA, and FRM are standard. Research which certifications employers in your target field actually value before investing time and listing them.

When in doubt about including a certification, check recent job postings in your target role. If the certification appears frequently as a preferred or required qualification, include it. If you never see it mentioned, it may not be adding value to your resume for that particular career path.`,
				},
				{
					titleKey: msg`Certifications for Career Changers and New Graduates`,
					contentKey: msg`Certifications are particularly powerful for career changers because they provide concrete evidence of new competencies. When your work history points in one direction but you want to move in another, a certification in your target field bridges the gap between your past and your future.

For a professional transitioning from accounting to data analytics, earning a Google Data Analytics Professional Certificate or an IBM Data Science certification demonstrates commitment to the new field and provides measurable proof of relevant skills. This certification can turn a seemingly unrelated resume into a competitive application.

New graduates can use certifications to stand out from peers with similar educational backgrounds. While every computer science graduate has a degree, not all of them have an AWS Cloud Practitioner certification or a Google UX Design Professional Certificate. These additional credentials show initiative beyond the classroom.

Industry-recognized boot camp completions can function similarly to certifications for career changers. If you completed a rigorous program with a recognized institution and can point to capstone projects or portfolio work, include it in your certifications or education section.

When listing certifications as a career changer, pair them with relevant projects or experiences that demonstrate practical application. A certification alone shows you have the knowledge. A certification plus a portfolio project shows you have applied that knowledge. Together, they make a much stronger case than either would alone.`,
				},
			],
			faqItems: [
				{
					questionKey: msg`Should I include certifications that are in progress?`,
					answerKey: msg`Yes, if the certification is relevant to the target role and you are actively working toward it. List it with "In Progress" or "Expected [Month Year]" to set clear expectations. This shows initiative and signals that you will soon hold the credential. However, do not list certifications you have only vaguely planned to pursue someday.`,
				},
				{
					questionKey: msg`How do I list expired certifications on my resume?`,
					answerKey: msg`If the certification is expired and you do not plan to renew it, it is generally better to omit it. If you are actively renewing, you can list it with "Renewal in Progress." For formerly required certifications that are still relevant to your experience narrative, you can note the years it was active: "PMP, PMI, 2018-2023." This shows you held it without implying it is currently valid.`,
				},
				{
					questionKey: msg`Do online course certificates count as certifications?`,
					answerKey: msg`It depends on the rigor and recognition. Certificates from platforms like Google, IBM, or AWS through Coursera carry significant weight because they involve substantial coursework and assessments. Short completion certificates from individual online courses are less impactful. Focus on credentials that involved a meaningful exam or capstone project and are recognized within your industry.`,
				},
			],
		},

		// ---------------------------------------------------------------
		// 7. References Section
		// ---------------------------------------------------------------
		{
			slug: "references-section",
			titleKey: msg`Resume References: When and How to Include Them`,
			descriptionKey: msg`Understand modern best practices for resume references, including when to include them, how to format a reference page, and what "references available upon request" really means.`,
			seoTitle: "Resume References: When and How to Include Them | IMTA Resume",
			seoDescription:
				"Learn when and how to include references on your resume. Expert advice on formatting reference pages, choosing references, and handling the 'references available upon request' question.",
			keywords: ["resume references", "references available upon request", "professional references"],
			readingTime: 8,
			dateModified: "2026-01-15",
			sections: [
				{
					titleKey: msg`Should You Include References on Your Resume?`,
					contentKey: msg`The short answer for most situations is no. In the modern job market, references are not typically included directly on the resume. The standard practice is to prepare a separate reference page that you provide when requested, usually during the later stages of the interview process.

There are several reasons for this convention. First, resume space is precious. Every line occupied by reference names and phone numbers is a line that could be used to showcase your skills, achievements, or experience. For a one-page resume, this trade-off is particularly costly.

Second, including references without being asked can put your references in an awkward position. They may receive unexpected calls before you have had a chance to brief them about the specific role or company. References perform best when they are prepared and know what to emphasize, which requires advance notice from you.

Third, privacy concerns have made employers more cautious about how they handle personal contact information. Many organizations have moved to formal reference check processes that occur at defined stages, making unsolicited reference information premature.

However, there are exceptions. Some job postings specifically ask for references to be included with the application. In these cases, follow the instructions exactly. Government positions, academic applications, and some nonprofit roles may require references upfront. When the posting asks for them, provide them.`,
				},
				{
					titleKey: msg`The "References Available Upon Request" Debate`,
					contentKey: msg`For years, resumes commonly ended with the phrase "References available upon request." This line has become one of the most debated elements in resume writing. The prevailing modern view is that it is unnecessary because employers already assume you will provide references when asked.

Including "References available upon request" does not hurt your application, but it does not help it either. It occupies a line of your resume without adding any information the recruiter does not already know. In a tight one-page resume, that line is better used for an additional achievement bullet or skill.

Some career coaches argue that the phrase serves as a professional closing statement, much like "sincerely" at the end of a letter. While this has some merit in terms of document completeness, the trend in resume writing has moved toward maximizing every inch of space for substantive content.

If you feel your resume needs a visual endpoint or you want to signal that you have references prepared, a brief alternative like "References prepared and available" can serve the same purpose in fewer words. But even this is optional and increasingly uncommon on professionally written resumes.

The bottom line: omitting the phrase is perfectly acceptable and is now the majority practice. Including it is not a deal-breaker, but it marks your resume as slightly dated. If you need the space for more impactful content, and you almost certainly do, leave it off.`,
				},
				{
					titleKey: msg`How to Create a Professional Reference Page`,
					contentKey: msg`When references are requested, you should have a polished reference page ready to provide. This document should match the visual style of your resume (same header, fonts, and formatting) to create a cohesive application package.

Each reference entry should include the person's full name, their current job title, the company they work for, their phone number, their email address, and your professional relationship to them (for example, "Former direct supervisor at ABC Company" or "Collaborated on cross-departmental projects for three years").

List three to five references, unless the employer specifies a different number. Three is the minimum that most employers find acceptable, while five provides a comfortable margin. Ordering them by relevance to the target role is more effective than listing them alphabetically or chronologically.

Professional references should come from people who have directly observed your work performance. Former supervisors carry the most weight, followed by colleagues at the same level, clients you worked with closely, and mentors who know your professional capabilities. Avoid listing family members, personal friends, or anyone who cannot speak to your professional skills.

Before listing anyone as a reference, always ask their permission. Explain the type of role you are pursuing and what skills or qualities you would like them to highlight. This preparation ensures they can provide a focused, enthusiastic reference rather than a vague or surprised one. Send them a copy of the job description and your resume so they have full context.`,
				},
				{
					titleKey: msg`Choosing the Right References for Maximum Impact`,
					contentKey: msg`Your choice of references can reinforce or undermine your candidacy. The ideal reference is someone who can speak in specific, enthusiastic terms about your work performance, your character, and your potential for the role you are pursuing.

Direct supervisors from your most recent and most relevant roles are the gold standard. They can speak authoritatively about your day-to-day performance, your accomplishments, and your professional growth. If you left a role on good terms, that supervisor should be your first call.

If your relationship with a recent supervisor was strained, you have options. A supervisor from a previous role, a senior colleague who worked closely with you, or a department head who oversaw your projects can all serve as credible references. The key is that they observed your work firsthand and can provide specific examples.

For career changers, include at least one reference from your target field if possible. This might be a professor from a certification program, a mentor in the new industry, or a supervisor from a volunteer or freelance project in the new domain. This reference can vouch for your transferable skills and your commitment to the transition.

Diversity in your reference list is valuable. A mix of supervisors, peers, and clients demonstrates that you perform well across different relationships and dynamics. If every reference is a peer, a recruiter might wonder why no manager is willing to recommend you. Balance your list to cover multiple perspectives on your professional capabilities.

Stay in touch with your references between job searches. A reference who has not heard from you in three years will provide a less detailed and less enthusiastic recommendation than one you have maintained a professional relationship with. Periodic check-ins, even brief ones, keep the relationship warm and the memories of your collaboration fresh.`,
				},
				{
					titleKey: msg`What Employers Actually Ask Your References`,
					contentKey: msg`Understanding what reference checkers typically ask can help you prepare both yourself and your references. Most reference calls follow a standard set of questions, though the specifics vary by company and role.

Common questions include: "How do you know the candidate and for how long?" "What were their primary responsibilities?" "How would you describe their work quality?" "Can you give an example of a challenge they handled well?" "What are their greatest professional strengths?" "Are there areas where they could improve?" "Would you rehire them?" and "Is there anything else you think we should know?"

The "Would you rehire?" question is often considered the most telling. A hesitant or qualified answer here can raise red flags, while an enthusiastic "Absolutely" is a strong endorsement. Make sure your references would answer this question positively.

Some employers use structured reference check forms with rating scales, asking references to score the candidate on specific competencies like reliability, communication, leadership, and technical ability. Others conduct informal conversational calls. Either way, references who can provide specific examples and anecdotes are far more persuasive than those who offer only general praise.

Help your references help you by sharing the job description and highlighting the two or three qualities you most want them to emphasize. If the role requires strong project management skills and your reference supervised you on a complex project, remind them of that project and suggest they share that example during the call. This coaching is expected and appropriate, as long as you are not asking them to exaggerate or fabricate.`,
				},
				{
					titleKey: msg`Reference Etiquette and Common Mistakes`,
					contentKey: msg`The most critical rule of reference etiquette is simple: always ask permission before listing someone as a reference. Listing someone without their knowledge is disrespectful and can result in a caught-off-guard reference who provides a lukewarm or confused recommendation.

Timing matters. Contact your references before you start actively applying, not after you have already submitted applications. Give them a week or two of notice before they might receive a call. If a specific company is about to check references, send a heads-up message with the company name, the role, and any specific points you would like them to address.

After the process is complete, whether you got the job or not, thank your references. A brief thank-you email expressing appreciation for their time and support maintains the relationship and makes them willing to help again in the future. If you landed the role, share the good news. People who helped you succeed enjoy knowing they made a difference.

Common mistakes include listing too many references from the same company, which can appear as if you have a limited professional network. Another error is including a reference you have not contacted in years, who may not remember you well enough to provide a strong recommendation. Outdated contact information is another frequent problem. Verify phone numbers and email addresses before submitting your reference page.

Never list a reference who you suspect might give a negative or lukewarm recommendation. If you are unsure how someone would speak about you, it is better to choose a different reference. You can diplomatically gauge someone's willingness by asking, "Would you be comfortable serving as a strong reference for me?" The emphasis on "strong" gives them an out if they have reservations.`,
				},
			],
			faqItems: [
				{
					questionKey: msg`How many references should I prepare?`,
					answerKey: msg`Prepare a list of three to five professional references. Three is the typical minimum employers request, and having five ready gives you flexibility to choose the most relevant ones for each application. For senior roles, some employers may ask for more. Always have your reference page prepared before you begin your job search.`,
				},
				{
					questionKey: msg`Can I use a professor or teacher as a professional reference?`,
					answerKey: msg`Yes, especially if you are a recent graduate or early in your career. Professors who supervised your research, capstone projects, or internships can provide credible references about your work ethic, analytical skills, and potential. As your career progresses, aim to replace academic references with professional ones from supervisors and colleagues.`,
				},
				{
					questionKey: msg`What should I do if a former employer has a no-reference policy?`,
					answerKey: msg`Many companies restrict official references to confirming only job title and dates of employment. In these cases, your former supervisor may still be willing to provide a personal reference separate from the company's official policy. Contact them directly and ask if they would be comfortable giving an individual reference. Most are happy to help, especially if you had a positive working relationship.`,
				},
			],
		},
	],
};
