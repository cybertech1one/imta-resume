import type { EmailTemplate } from "./networking-types";

// Email templates remain static - these are template content, not user data

export const INITIAL_TEMPLATES: EmailTemplate[] = [
	{
		id: "template-1",
		name: "Initial Introduction",
		category: "introduction",
		subject: "Introduction - [Your Name] | [Your Title/Background]",
		body: `Dear [Contact Name],

I hope this email finds you well. My name is [Your Name], and I am a [Your Title] with [X years] of experience in [Your Field].

I came across your profile on [Platform/Event] and was impressed by your work at [Company]. I'm particularly interested in [specific aspect of their work or company].

I would love the opportunity to connect and learn more about your career journey. Would you be open to a brief 15-20 minute call at your convenience?

Thank you for your time, and I look forward to hearing from you.

Best regards,
[Your Name]
[Your Contact Information]`,
	},
	{
		id: "template-2",
		name: "Post-Meeting Follow Up",
		category: "follow_up",
		subject: "Great Meeting You at [Event/Meeting]",
		body: `Hi [Contact Name],

It was wonderful meeting you at [Event/Location] yesterday. I really enjoyed our conversation about [Topic Discussed].

As I mentioned, I'm particularly interested in [Relevant Topic], and I found your insights on [Specific Point] very valuable.

I'd love to continue our conversation. Would you be available for a coffee chat sometime next week?

Looking forward to staying in touch!

Best,
[Your Name]`,
	},
	{
		id: "template-3",
		name: "Interview Thank You",
		category: "thank_you",
		subject: "Thank You - [Position] Interview",
		body: `Dear [Interviewer Name],

Thank you so much for taking the time to speak with me today about the [Position] role at [Company]. I truly enjoyed learning more about the team and the exciting projects you're working on.

Our conversation about [Specific Topic Discussed] reinforced my enthusiasm for this opportunity. I'm particularly excited about [Specific Aspect of Role/Company].

I'm confident that my experience in [Relevant Skill/Experience] would allow me to contribute meaningfully to your team.

Please don't hesitate to reach out if you need any additional information. I look forward to hearing from you about the next steps.

Thank you again for the opportunity.

Best regards,
[Your Name]`,
	},
	{
		id: "template-4",
		name: "Referral Request",
		category: "referral",
		subject: "Seeking Your Advice - [Company/Position]",
		body: `Hi [Contact Name],

I hope you're doing well! I wanted to reach out because I recently came across an exciting opportunity at [Company] for a [Position] role.

Given your experience at [Their Company/Industry], I thought you might have some insights or potentially know someone at [Target Company].

Would you be comfortable introducing me to anyone in your network who might be able to share more about the company culture or the role?

I've attached my resume for reference. Please let me know if there's anything I can do to return the favor.

Thank you so much for considering this request!

Best,
[Your Name]`,
	},
	{
		id: "template-5",
		name: "Reconnecting After Time",
		category: "reconnect",
		subject: "Catching Up - [Your Name]",
		body: `Hi [Contact Name],

I hope this message finds you well! It's been a while since we last connected, and I wanted to reach out to see how you're doing.

I've been thinking about our previous conversations about [Topic/Shared Interest], and I noticed [Recent News/Achievement About Them or Their Company].

Since we last spoke, I've been [Brief Update About Yourself].

I'd love to catch up and hear what you've been up to. Would you be open to a quick call or coffee sometime soon?

Looking forward to reconnecting!

Best,
[Your Name]`,
	},
];
