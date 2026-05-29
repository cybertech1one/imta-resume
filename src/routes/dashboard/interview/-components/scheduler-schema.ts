import z from "zod";

// Validation schema for interview form
export const interviewFormSchema = z
	.object({
		title: z.string().max(200, { message: "Title cannot exceed 200 characters" }).optional().or(z.literal("")),
		company: z
			.string()
			.trim()
			.min(2, { message: "Company name must contain at least 2 characters" })
			.max(100, { message: "Company name cannot exceed 100 characters" }),
		role: z
			.string()
			.trim()
			.min(2, { message: "Position must contain at least 2 characters" })
			.max(100, { message: "Position cannot exceed 100 characters" }),
		type: z.enum(["phone", "video", "in_person"]),
		status: z.enum(["scheduled", "completed", "cancelled", "rescheduled", "no_show"]),
		outcome: z.enum(["pending", "passed", "failed", "on_hold", "offer_received"]),
		date: z.string().min(1, { message: "Date is required" }),
		startTime: z.string().min(1, { message: "Start time is required" }),
		endTime: z.string().min(1, { message: "End time is required" }),
		timezone: z.string().min(1, { message: "Timezone is required" }),
		location: z.string().max(200, { message: "Address cannot exceed 200 characters" }).optional().or(z.literal("")),
		meetingLink: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
		contactName: z
			.string()
			.trim()
			.max(100, { message: "Contact name cannot exceed 100 characters" })
			.optional()
			.or(z.literal("")),
		contactEmail: z
			.string()
			.trim()
			.email({ message: "Please enter a valid email address" })
			.optional()
			.or(z.literal("")),
		contactPhone: z
			.string()
			.max(20, { message: "Phone number cannot exceed 20 characters" })
			.optional()
			.or(z.literal("")),
		notes: z.string().max(2000, { message: "Notes cannot exceed 2000 characters" }).optional().or(z.literal("")),
		preparationMaterials: z
			.string()
			.max(2000, { message: "Preparation materials cannot exceed 2000 characters" })
			.optional()
			.or(z.literal("")),
		interviewerNames: z.array(z.string().max(100)).optional(),
		round: z.number().min(1).max(10),
		recurrence: z.enum(["none", "daily", "weekly", "biweekly", "monthly"]),
	})
	.refine(
		(data) => {
			if (data.startTime && data.endTime) {
				return data.endTime > data.startTime;
			}
			return true;
		},
		{
			message: "End time must be after start time",
			path: ["endTime"],
		},
	);
