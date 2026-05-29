import { z } from "zod";
import { isSmtpEnabled, sendEmail } from "@/integrations/email/service";
import { env } from "@/utils/env";
import { publicProcedure } from "../context";

// Contact form input schema
const contactFormSchema = z.object({
	email: z.string().email(),
	subject: z.string().min(3).max(200),
	message: z.string().min(10).max(5000),
	type: z.enum(["support", "bug", "feature", "other"]),
	name: z.string().max(100).optional(),
});

// Feedback input schema
const feedbackSchema = z.object({
	rating: z.number().min(1).max(5),
	category: z.enum(["general", "cv", "interview", "resources", "jobs", "career"]),
	feedback: z.string().min(10).max(2000),
	pageUrl: z.string().optional(),
});

// Type labels for contact form
const typeLabels: Record<string, string> = {
	support: "General Support",
	bug: "Bug Report",
	feature: "Feature Request",
	other: "Other",
};

// Feedback category labels
const categoryLabels: Record<string, string> = {
	general: "General",
	cv: "Resume Builder",
	interview: "Interview Prep",
	resources: "Training Resources",
	jobs: "Job Listings",
	career: "Career Guidance",
};

export const supportRouter = {
	// Submit contact form
	submitContactForm: publicProcedure
		.route({
			method: "POST",
			path: "/support/contact",
			tags: ["Support"],
			summary: "Submit contact form",
			description: "Submit a contact form message to the support team.",
		})
		.input(contactFormSchema)
		.output(z.object({ success: z.boolean(), message: z.string() }))
		.handler(async ({ input }): Promise<{ success: boolean; message: string }> => {
			const { email, subject, message, type, name } = input;

			if (!isSmtpEnabled()) {
				console.warn("[SUPPORT] Contact form submitted but SMTP not configured:", { type });
				return {
					success: false,
					message: "Email service is not configured. Your message could not be sent. Please contact support directly.",
				};
			}

			// Build email content
			const emailContent = `
New contact message - IMTA Resume Builder

Type: ${typeLabels[type] || type}
From: ${name || "Not specified"} <${email}>
Subject: ${subject}

Message:
${message}

---
This message was sent from the IMTA Resume Builder contact form.
			`.trim();

			// Determine recipient (use SMTP_FROM as fallback)
			const adminEmail = env.SMTP_FROM || "support@imta.ma";

			try {
				await sendEmail({
					to: adminEmail,
					subject: `[IMTA Support] ${typeLabels[type] || type}: ${subject}`,
					text: emailContent,
				});

				// Also send confirmation to user
				const confirmationContent = `
Hello${name ? ` ${name}` : ""},

We have received your message and will get back to you as soon as possible.

Summary of your request:
- Type: ${typeLabels[type] || type}
- Subject: ${subject}

Thank you for reaching out.

The IMTA Resume Builder Team
				`.trim();

				await sendEmail({
					to: email,
					subject: "Message confirmation - IMTA Resume Builder",
					text: confirmationContent,
				});

				return {
					success: true,
					message: "Message sent successfully. You will receive a confirmation email.",
				};
			} catch (error) {
				console.error("[SUPPORT] Failed to send contact form email:", error);
				return {
					success: false,
					message: "An error occurred while sending the message. Please try again.",
				};
			}
		}),

	// Submit feedback
	submitFeedback: publicProcedure
		.route({
			method: "POST",
			path: "/support/feedback",
			tags: ["Support"],
			summary: "Submit feedback",
			description: "Submit user feedback about the application.",
		})
		.input(feedbackSchema)
		.output(z.object({ success: z.boolean(), message: z.string() }))
		.handler(async ({ input }): Promise<{ success: boolean; message: string }> => {
			const { rating, category, feedback, pageUrl } = input;

			if (!isSmtpEnabled()) {
				console.warn("[SUPPORT] Feedback submitted but SMTP not configured:", { rating, category });
				return {
					success: false,
					message: "Email service is not configured. Your feedback could not be sent.",
				};
			}

			// Build email content
			const emailContent = `
New user feedback - IMTA Resume Builder

Rating: ${"⭐".repeat(rating)} (${rating}/5)
Category: ${categoryLabels[category] || category}
${pageUrl ? `Page: ${pageUrl}` : ""}

Feedback:
${feedback}

---
This feedback was submitted from the IMTA Resume Builder application.
			`.trim();

			const adminEmail = env.SMTP_FROM || "support@imta.ma";

			try {
				await sendEmail({
					to: adminEmail,
					subject: `[IMTA Feedback] ${rating}/5 - ${categoryLabels[category] || category}`,
					text: emailContent,
				});

				return {
					success: true,
					message: "Thank you for your feedback! It helps us improve the application.",
				};
			} catch (error) {
				console.error("[SUPPORT] Failed to send feedback email:", error);
				return {
					success: false,
					message: "An error occurred. Your feedback could not be sent.",
				};
			}
		}),

	// Report bug
	reportBug: publicProcedure
		.route({
			method: "POST",
			path: "/support/bug",
			tags: ["Support"],
			summary: "Report a bug",
			description: "Submit a bug report to the development team.",
		})
		.input(
			z.object({
				title: z.string().min(5).max(200),
				description: z.string().min(20).max(5000),
				steps: z.string().optional(),
				expected: z.string().optional(),
				actual: z.string().optional(),
				browser: z.string().optional(),
				email: z.string().email().optional(),
			}),
		)
		.output(z.object({ success: z.boolean(), message: z.string() }))
		.handler(async ({ input }): Promise<{ success: boolean; message: string }> => {
			const { title, description, steps, expected, actual, browser, email } = input;

			if (!isSmtpEnabled()) {
				console.warn("[SUPPORT] Bug report submitted but SMTP not configured:", { title });
				return {
					success: false,
					message: "Email service is not configured. Your bug report could not be sent.",
				};
			}

			const emailContent = `
New bug report - IMTA Resume Builder

Title: ${title}
${email ? `Reported by: ${email}` : "Reported by: Anonymous"}
${browser ? `Browser: ${browser}` : ""}

Description:
${description}

${steps ? `Steps to reproduce:\n${steps}` : ""}

${expected ? `Expected behavior:\n${expected}` : ""}

${actual ? `Actual behavior:\n${actual}` : ""}

---
This bug was reported from the IMTA Resume Builder application.
			`.trim();

			const adminEmail = env.SMTP_FROM || "support@imta.ma";

			try {
				await sendEmail({
					to: adminEmail,
					subject: `[IMTA Bug] ${title}`,
					text: emailContent,
				});

				return {
					success: true,
					message: "Bug reported successfully. Thank you for helping us improve the application!",
				};
			} catch (error) {
				console.error("[SUPPORT] Failed to send bug report email:", error);
				return {
					success: false,
					message: "An error occurred while reporting the bug.",
				};
			}
		}),

	// Request feature
	requestFeature: publicProcedure
		.route({
			method: "POST",
			path: "/support/feature",
			tags: ["Support"],
			summary: "Request a feature",
			description: "Submit a feature request to the development team.",
		})
		.input(
			z.object({
				title: z.string().min(5).max(200),
				description: z.string().min(20).max(5000),
				useCase: z.string().optional(),
				priority: z.enum(["low", "medium", "high"]).optional(),
				email: z.string().email().optional(),
			}),
		)
		.output(z.object({ success: z.boolean(), message: z.string() }))
		.handler(async ({ input }): Promise<{ success: boolean; message: string }> => {
			const { title, description, useCase, priority, email } = input;

			if (!isSmtpEnabled()) {
				console.warn("[SUPPORT] Feature request submitted but SMTP not configured:", { title });
				return {
					success: false,
					message: "Email service is not configured. Your request could not be sent.",
				};
			}

			const priorityLabels: Record<string, string> = {
				low: "Low",
				medium: "Medium",
				high: "High",
			};

			const emailContent = `
New feature request - IMTA Resume Builder

Title: ${title}
${email ? `Requested by: ${email}` : "Requested by: Anonymous"}
${priority ? `Priority: ${priorityLabels[priority] || priority}` : ""}

Description:
${description}

${useCase ? `Use case:\n${useCase}` : ""}

---
This request was submitted from the IMTA Resume Builder application.
			`.trim();

			const adminEmail = env.SMTP_FROM || "support@imta.ma";

			try {
				await sendEmail({
					to: adminEmail,
					subject: `[IMTA Feature] ${title}`,
					text: emailContent,
				});

				return {
					success: true,
					message: "Request sent successfully. We will review it carefully!",
				};
			} catch (error) {
				console.error("[SUPPORT] Failed to send feature request email:", error);
				return {
					success: false,
					message: "An error occurred while sending the request.",
				};
			}
		}),
};
