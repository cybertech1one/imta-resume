import z from "zod";
import { protectedProcedure, publicProcedure } from "../context";
import { printerService } from "../services/printer";
import { resumeService } from "../services/resume";

export const printerRouter = {
	printResumeAsPDF: publicProcedure
		.route({
			method: "GET",
			path: "/printer/resume/{id}/pdf",
			tags: ["Resume", "Printer"],
			summary: "Export resume as PDF",
			description: "Export a resume as a PDF. Returns a URL to download the PDF.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.object({ url: z.string() }))
		.handler(async ({ input, context }) => {
			// Authorize against ownership / isPublic. A logged-in user may export
			// their own resume; anyone may export a PUBLIC resume. Private resumes
			// belonging to another user are rejected (NOT_FOUND) by the service —
			// this closes the unauthenticated PII-exposure hole.
			const { id, data, userId } = await resumeService.getByIdForPrinter({
				id: input.id,
				auth: { requesterUserId: context.user?.id },
			});
			const url = await printerService.printResumeAsPDF({ id, data, userId });

			if (!context.user) {
				await resumeService.statistics.increment({ id: input.id, downloads: true });
			}

			return { url };
		}),

	getResumeScreenshot: protectedProcedure
		.route({
			method: "GET",
			path: "/printer/resume/{id}/screenshot",
			tags: ["Resume", "Printer"],
			summary: "Get resume screenshot",
			description: "Get a screenshot of a resume. Returns a URL to the screenshot image.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.object({ url: z.string().nullable() }))
		.handler(async ({ input, context }) => {
			try {
				// `protectedProcedure` guarantees an authenticated user. Authorize the
				// screenshot against ownership / isPublic so one user cannot fetch a
				// screenshot of another user's private resume.
				const { id, data, userId, updatedAt } = await resumeService.getByIdForPrinter({
					id: input.id,
					auth: { requesterUserId: context.user.id },
				});
				const url = await printerService.getResumeScreenshot({ id, data, userId, updatedAt });

				return { url };
			} catch {
				// ignore errors, as the screenshot is not critical
			}

			return { url: null };
		}),
};
