import { ORPCError } from "@orpc/client";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	MentorAvailabilitySlot,
	MentorExpertiseLevel,
	MentorSkill,
	MentorStatus,
	MentorshipGoalStatus,
	MentorshipMilestone,
	MentorshipRequestStatus,
	MentorshipSessionStatus,
	MentorshipSessionType,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Types
export type CreateMentorProfileInput = {
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	avatar?: string;
	title: string;
	company: string;
	location: string;
	bio: string;
	expertise?: string[];
	skills?: MentorSkill[];
	yearsOfExperience?: number;
	industries?: string[];
	languages?: string[];
	status?: MentorStatus;
	hourlyRate?: number;
	isFree?: boolean;
	linkedinUrl?: string;
	availability?: MentorAvailabilitySlot[];
	careerPath?: string[];
	achievements?: string[];
};

export type UpdateMentorProfileInput = Partial<CreateMentorProfileInput> & {
	id: string;
	rating?: number;
	totalReviews?: number;
	totalSessions?: number;
	totalMentees?: number;
};

export type CreateMentorshipRequestInput = {
	userId: string;
	mentorId: string;
	mentorName: string;
	menteeId: string;
	menteeName: string;
	message: string;
	goals?: string[];
};

export type CreateMentorshipSessionInput = {
	userId: string;
	mentorId: string;
	mentorName: string;
	mentorAvatar?: string;
	menteeId: string;
	menteeName: string;
	type?: MentorshipSessionType;
	scheduledAt: Date;
	duration?: number;
	topic: string;
};

export type UpdateMentorshipSessionInput = {
	id: string;
	userId: string;
	notes?: string;
	status?: MentorshipSessionStatus;
	rating?: number;
	feedback?: string;
};

export type CreateMentorshipGoalInput = {
	userId: string;
	mentorshipId: string;
	title: string;
	description?: string;
	targetDate: string;
};

export type UpdateMentorshipGoalInput = {
	id: string;
	userId: string;
	title?: string;
	description?: string;
	targetDate?: string;
	status?: MentorshipGoalStatus;
	progress?: number;
	milestones?: MentorshipMilestone[];
};

export type UserMentorshipGoalsInput = {
	userId: string;
	targetRole: string;
	skills: string[];
	industries: string[];
	timeline: string;
};

export const mentorsService = {
	// ========================
	// MENTOR PROFILES
	// ========================

	// Create a mentor profile
	createMentorProfile: async (input: CreateMentorProfileInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.mentorProfile).values({
			id,
			userId: input.userId,
			firstName: input.firstName,
			lastName: input.lastName,
			email: input.email,
			avatar: input.avatar,
			title: input.title,
			company: input.company,
			location: input.location,
			bio: input.bio,
			expertise: input.expertise ?? [],
			skills: input.skills ?? [],
			yearsOfExperience: input.yearsOfExperience ?? 0,
			industries: input.industries ?? [],
			languages: input.languages ?? [],
			status: input.status ?? "available",
			hourlyRate: input.hourlyRate,
			isFree: input.isFree ?? true,
			linkedinUrl: input.linkedinUrl,
			availability: input.availability ?? [],
			careerPath: input.careerPath ?? [],
			achievements: input.achievements ?? [],
		});

		return id;
	},

	// Get mentor profile by ID
	getMentorById: async (id: string) => {
		const [mentor] = await db.select().from(schema.mentorProfile).where(eq(schema.mentorProfile.id, id));

		if (!mentor) {
			throw new ORPCError("NOT_FOUND", { message: "Mentor not found" });
		}

		// Get reviews for this mentor
		const reviews = await db
			.select()
			.from(schema.mentorReview)
			.where(eq(schema.mentorReview.mentorId, id))
			.orderBy(desc(schema.mentorReview.createdAt))
			.limit(10);

		return { ...mentor, reviews };
	},

	// List all mentors (with optional filters)
	listMentors: async (input: {
		search?: string;
		expertise?: string;
		industry?: string;
		status?: MentorStatus;
		limit?: number;
		offset?: number;
	}) => {
		const conditions = [];

		if (input.search) {
			const searchCondition = or(
				ilike(schema.mentorProfile.firstName, `%${input.search}%`),
				ilike(schema.mentorProfile.lastName, `%${input.search}%`),
				ilike(schema.mentorProfile.title, `%${input.search}%`),
				ilike(schema.mentorProfile.company, `%${input.search}%`),
			);
			if (searchCondition) conditions.push(searchCondition);
		}

		if (input.status) {
			conditions.push(eq(schema.mentorProfile.status, input.status));
		}

		const mentors = await db
			.select()
			.from(schema.mentorProfile)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(schema.mentorProfile.rating), desc(schema.mentorProfile.createdAt))
			.limit(input.limit ?? 50)
			.offset(input.offset ?? 0);

		// Filter by expertise and industry in JavaScript (array containment)
		let filtered = mentors;

		if (input.expertise) {
			filtered = filtered.filter((m) =>
				m.expertise?.some((e) => e.toLowerCase().includes(input.expertise?.toLowerCase() ?? "")),
			);
		}

		if (input.industry) {
			filtered = filtered.filter((m) =>
				m.industries?.some((i) => i.toLowerCase().includes(input.industry?.toLowerCase() ?? "")),
			);
		}

		return filtered;
	},

	// Update mentor profile
	updateMentorProfile: async (input: UpdateMentorProfileInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.mentorProfile.id })
			.from(schema.mentorProfile)
			.where(eq(schema.mentorProfile.id, input.id));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Mentor not found" });
		}

		await db
			.update(schema.mentorProfile)
			.set({
				firstName: input.firstName,
				lastName: input.lastName,
				email: input.email,
				avatar: input.avatar,
				title: input.title,
				company: input.company,
				location: input.location,
				bio: input.bio,
				expertise: input.expertise,
				skills: input.skills,
				yearsOfExperience: input.yearsOfExperience,
				industries: input.industries,
				languages: input.languages,
				status: input.status,
				hourlyRate: input.hourlyRate,
				isFree: input.isFree,
				linkedinUrl: input.linkedinUrl,
				availability: input.availability,
				careerPath: input.careerPath,
				achievements: input.achievements,
				rating: input.rating,
				totalReviews: input.totalReviews,
				totalSessions: input.totalSessions,
				totalMentees: input.totalMentees,
			})
			.where(eq(schema.mentorProfile.id, input.id));
	},

	// Seed initial mentors (for demo purposes)
	seedMentors: async (userId: string): Promise<void> => {
		// Check if mentors already exist
		const existingMentors = await db.select().from(schema.mentorProfile).limit(1);
		if (existingMentors.length > 0) return;

		const mentorsData: Omit<CreateMentorProfileInput, "userId">[] = [
			{
				firstName: "Sarah",
				lastName: "Chen",
				email: "sarah.chen@techcorp.com",
				avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
				title: "Senior Engineering Manager",
				company: "TechCorp Inc.",
				location: "San Francisco, CA",
				bio: "15+ years of experience in software engineering and team leadership. Passionate about helping engineers grow into technical leaders.",
				expertise: ["Engineering Leadership", "Career Development", "Technical Architecture", "Team Building"],
				skills: [
					{ name: "System Design", level: "expert" as MentorExpertiseLevel },
					{ name: "Python", level: "expert" as MentorExpertiseLevel },
					{ name: "Leadership", level: "expert" as MentorExpertiseLevel },
					{ name: "Agile", level: "advanced" as MentorExpertiseLevel },
				],
				yearsOfExperience: 15,
				industries: ["Technology", "FinTech", "E-commerce"],
				languages: ["English", "Mandarin"],
				status: "available" as MentorStatus,
				isFree: false,
				hourlyRate: 150,
				linkedinUrl: "https://linkedin.com/in/sarahchen",
				availability: [
					{ day: "tuesday", startTime: "18:00", endTime: "20:00" },
					{ day: "thursday", startTime: "18:00", endTime: "20:00" },
					{ day: "saturday", startTime: "10:00", endTime: "14:00" },
				] as MentorAvailabilitySlot[],
				careerPath: [
					"Software Engineer",
					"Senior Engineer",
					"Tech Lead",
					"Engineering Manager",
					"Senior Engineering Manager",
				],
				achievements: [
					"Scaled team from 5 to 50 engineers",
					"Built platform serving 10M+ users",
					"Speaker at major tech conferences",
				],
			},
			{
				firstName: "Michael",
				lastName: "Rodriguez",
				email: "m.rodriguez@innovate.io",
				avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
				title: "Product Director",
				company: "InnovateAI",
				location: "Seattle, WA",
				bio: "Former engineer turned product leader. I help technical professionals transition into product roles.",
				expertise: ["Product Management", "Career Transition", "Product Strategy", "Stakeholder Management"],
				skills: [
					{ name: "Product Strategy", level: "expert" as MentorExpertiseLevel },
					{ name: "Data Analysis", level: "advanced" as MentorExpertiseLevel },
					{ name: "User Research", level: "expert" as MentorExpertiseLevel },
					{ name: "Roadmapping", level: "expert" as MentorExpertiseLevel },
				],
				yearsOfExperience: 12,
				industries: ["AI/ML", "SaaS", "Healthcare Tech"],
				languages: ["English", "Spanish"],
				status: "available" as MentorStatus,
				isFree: true,
				linkedinUrl: "https://linkedin.com/in/michaelrodriguez",
				availability: [
					{ day: "monday", startTime: "12:00", endTime: "13:00" },
					{ day: "wednesday", startTime: "12:00", endTime: "13:00" },
					{ day: "friday", startTime: "16:00", endTime: "18:00" },
				] as MentorAvailabilitySlot[],
				careerPath: ["Software Engineer", "Product Analyst", "Product Manager", "Senior PM", "Product Director"],
				achievements: ["Launched 3 successful products", "Grew ARR from $1M to $10M", "Built and led team of 12 PMs"],
			},
			{
				firstName: "Emily",
				lastName: "Thompson",
				email: "emily.t@designstudio.com",
				avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
				title: "VP of Design",
				company: "DesignStudio",
				location: "New York, NY",
				bio: "Design leader with a passion for mentoring the next generation of designers.",
				expertise: ["UX Design", "Design Leadership", "Design Systems", "Portfolio Development"],
				skills: [
					{ name: "UX Design", level: "expert" as MentorExpertiseLevel },
					{ name: "Figma", level: "expert" as MentorExpertiseLevel },
					{ name: "Design Systems", level: "expert" as MentorExpertiseLevel },
					{ name: "User Research", level: "advanced" as MentorExpertiseLevel },
				],
				yearsOfExperience: 14,
				industries: ["Consumer Tech", "Media", "Finance"],
				languages: ["English", "French"],
				status: "busy" as MentorStatus,
				isFree: false,
				hourlyRate: 175,
				linkedinUrl: "https://linkedin.com/in/emilythompson",
				availability: [
					{ day: "tuesday", startTime: "09:00", endTime: "11:00" },
					{ day: "thursday", startTime: "09:00", endTime: "11:00" },
				] as MentorAvailabilitySlot[],
				careerPath: [
					"Junior Designer",
					"Designer",
					"Senior Designer",
					"Design Lead",
					"Design Director",
					"VP of Design",
				],
				achievements: [
					"Led design for app with 50M+ downloads",
					"Built design team from scratch",
					"Design mentor at ADPList",
				],
			},
			{
				firstName: "David",
				lastName: "Kim",
				email: "david.kim@startup.co",
				avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
				title: "CTO & Co-founder",
				company: "StartupCo",
				location: "Austin, TX",
				bio: "Serial entrepreneur and technical leader. I help engineers navigate the startup world.",
				expertise: ["Entrepreneurship", "Technical Leadership", "Startup Strategy", "Fundraising"],
				skills: [
					{ name: "Full Stack Development", level: "expert" as MentorExpertiseLevel },
					{ name: "AWS", level: "expert" as MentorExpertiseLevel },
					{ name: "System Architecture", level: "expert" as MentorExpertiseLevel },
					{ name: "Team Building", level: "advanced" as MentorExpertiseLevel },
				],
				yearsOfExperience: 10,
				industries: ["Startups", "B2B SaaS", "Developer Tools"],
				languages: ["English", "Korean"],
				status: "available" as MentorStatus,
				isFree: true,
				linkedinUrl: "https://linkedin.com/in/davidkim",
				availability: [
					{ day: "monday", startTime: "19:00", endTime: "21:00" },
					{ day: "thursday", startTime: "19:00", endTime: "21:00" },
				] as MentorAvailabilitySlot[],
				careerPath: ["Software Engineer", "Senior Engineer", "Tech Lead", "CTO"],
				achievements: ["Founded 2 successful startups", "Raised $15M in funding", "Built products used by Fortune 500"],
			},
			{
				firstName: "Amanda",
				lastName: "Foster",
				email: "a.foster@bigtech.com",
				avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda",
				title: "Staff Data Scientist",
				company: "BigTech Corporation",
				location: "Remote",
				bio: "Data scientist passionate about making ML accessible. I mentor aspiring data scientists.",
				expertise: ["Data Science", "Machine Learning", "Career Coaching", "Interview Preparation"],
				skills: [
					{ name: "Machine Learning", level: "expert" as MentorExpertiseLevel },
					{ name: "Python", level: "expert" as MentorExpertiseLevel },
					{ name: "Deep Learning", level: "advanced" as MentorExpertiseLevel },
					{ name: "Statistics", level: "expert" as MentorExpertiseLevel },
				],
				yearsOfExperience: 8,
				industries: ["Big Tech", "Healthcare", "Finance"],
				languages: ["English"],
				status: "available" as MentorStatus,
				isFree: false,
				hourlyRate: 125,
				linkedinUrl: "https://linkedin.com/in/amandafoster",
				availability: [
					{ day: "wednesday", startTime: "17:00", endTime: "19:00" },
					{ day: "saturday", startTime: "11:00", endTime: "15:00" },
					{ day: "sunday", startTime: "11:00", endTime: "13:00" },
				] as MentorAvailabilitySlot[],
				careerPath: [
					"Data Analyst",
					"Junior Data Scientist",
					"Data Scientist",
					"Senior Data Scientist",
					"Staff Data Scientist",
				],
				achievements: [
					"Published 5 research papers",
					"Built ML platform serving 100M predictions/day",
					"Taught 500+ students",
				],
			},
			{
				firstName: "James",
				lastName: "Wilson",
				email: "james.wilson@consulting.com",
				avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
				title: "Principal Consultant",
				company: "Global Consulting Partners",
				location: "Chicago, IL",
				bio: "Management consultant with expertise in digital transformation and strategy.",
				expertise: ["Strategy", "Digital Transformation", "Business Analysis", "Executive Presence"],
				skills: [
					{ name: "Strategy", level: "expert" as MentorExpertiseLevel },
					{ name: "Business Analysis", level: "expert" as MentorExpertiseLevel },
					{ name: "Presentation Skills", level: "expert" as MentorExpertiseLevel },
					{ name: "Project Management", level: "advanced" as MentorExpertiseLevel },
				],
				yearsOfExperience: 16,
				industries: ["Consulting", "Banking", "Retail"],
				languages: ["English", "German"],
				status: "on_vacation" as MentorStatus,
				isFree: false,
				hourlyRate: 200,
				linkedinUrl: "https://linkedin.com/in/jameswilson",
				availability: [
					{ day: "friday", startTime: "14:00", endTime: "16:00" },
					{ day: "sunday", startTime: "10:00", endTime: "12:00" },
				] as MentorAvailabilitySlot[],
				careerPath: ["Business Analyst", "Consultant", "Senior Consultant", "Manager", "Principal"],
				achievements: ["Led $100M+ transformation projects", "Partner track at top firm", "Published author"],
			},
		];

		// Add ratings and review counts
		const mentorsWithStats = mentorsData.map((mentor, index) => ({
			...mentor,
			rating: [4.9, 4.8, 4.95, 4.7, 4.85, 4.75][index] ?? 4.5,
			totalReviews: [47, 35, 52, 28, 41, 33][index] ?? 0,
			totalSessions: [156, 98, 189, 76, 134, 112][index] ?? 0,
			totalMentees: [23, 18, 31, 15, 27, 19][index] ?? 0,
		}));

		for (const mentor of mentorsWithStats) {
			const id = generateId();
			await db.insert(schema.mentorProfile).values({
				id,
				userId,
				...mentor,
			});
		}
	},

	// ========================
	// MENTORSHIP REQUESTS
	// ========================

	// Create a mentorship request
	createRequest: async (input: CreateMentorshipRequestInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.mentorshipRequest).values({
			id,
			userId: input.userId,
			mentorId: input.mentorId,
			mentorName: input.mentorName,
			menteeId: input.menteeId,
			menteeName: input.menteeName,
			message: input.message,
			goals: input.goals ?? [],
			status: "pending",
		});

		return id;
	},

	// List requests for a user
	listRequests: async (input: { userId: string; status?: MentorshipRequestStatus }) => {
		const conditions = [eq(schema.mentorshipRequest.userId, input.userId)];

		if (input.status) {
			conditions.push(eq(schema.mentorshipRequest.status, input.status));
		}

		return await db
			.select()
			.from(schema.mentorshipRequest)
			.where(and(...conditions))
			.orderBy(desc(schema.mentorshipRequest.createdAt));
	},

	// Update request status
	updateRequestStatus: async (input: {
		id: string;
		userId: string;
		status: MentorshipRequestStatus;
	}): Promise<void> => {
		await db
			.update(schema.mentorshipRequest)
			.set({
				status: input.status,
				respondedAt: input.status !== "pending" ? new Date() : undefined,
			})
			.where(and(eq(schema.mentorshipRequest.id, input.id), eq(schema.mentorshipRequest.userId, input.userId)));
	},

	// Delete a request
	deleteRequest: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.mentorshipRequest)
			.where(and(eq(schema.mentorshipRequest.id, input.id), eq(schema.mentorshipRequest.userId, input.userId)));
	},

	// ========================
	// MENTORSHIP SESSIONS
	// ========================

	// Create a session
	createSession: async (input: CreateMentorshipSessionInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.mentorshipSession).values({
			id,
			userId: input.userId,
			mentorId: input.mentorId,
			mentorName: input.mentorName,
			mentorAvatar: input.mentorAvatar,
			menteeId: input.menteeId,
			menteeName: input.menteeName,
			type: input.type ?? "video_call",
			scheduledAt: input.scheduledAt,
			duration: input.duration ?? 60,
			topic: input.topic,
			notes: "",
			status: "scheduled",
		});

		return id;
	},

	// List sessions for a user
	listSessions: async (input: { userId: string; status?: MentorshipSessionStatus }) => {
		const conditions = [eq(schema.mentorshipSession.userId, input.userId)];

		if (input.status) {
			conditions.push(eq(schema.mentorshipSession.status, input.status));
		}

		return await db
			.select()
			.from(schema.mentorshipSession)
			.where(and(...conditions))
			.orderBy(desc(schema.mentorshipSession.scheduledAt));
	},

	// Update a session
	updateSession: async (input: UpdateMentorshipSessionInput): Promise<void> => {
		await db
			.update(schema.mentorshipSession)
			.set({
				notes: input.notes,
				status: input.status,
				rating: input.rating,
				feedback: input.feedback,
			})
			.where(and(eq(schema.mentorshipSession.id, input.id), eq(schema.mentorshipSession.userId, input.userId)));
	},

	// Delete a session
	deleteSession: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.mentorshipSession)
			.where(and(eq(schema.mentorshipSession.id, input.id), eq(schema.mentorshipSession.userId, input.userId)));
	},

	// ========================
	// MENTORSHIP GOALS
	// ========================

	// Create a goal
	createGoal: async (input: CreateMentorshipGoalInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.mentorshipGoal).values({
			id,
			userId: input.userId,
			mentorshipId: input.mentorshipId,
			title: input.title,
			description: input.description ?? "",
			targetDate: input.targetDate,
			status: "not_started",
			progress: 0,
			milestones: [],
		});

		return id;
	},

	// List goals for a user
	listGoals: async (input: { userId: string; mentorshipId?: string }) => {
		const conditions = [eq(schema.mentorshipGoal.userId, input.userId)];

		if (input.mentorshipId) {
			conditions.push(eq(schema.mentorshipGoal.mentorshipId, input.mentorshipId));
		}

		return await db
			.select()
			.from(schema.mentorshipGoal)
			.where(and(...conditions))
			.orderBy(schema.mentorshipGoal.targetDate);
	},

	// Update a goal
	updateGoal: async (input: UpdateMentorshipGoalInput): Promise<void> => {
		await db
			.update(schema.mentorshipGoal)
			.set({
				title: input.title,
				description: input.description,
				targetDate: input.targetDate,
				status: input.status,
				progress: input.progress,
				milestones: input.milestones,
			})
			.where(and(eq(schema.mentorshipGoal.id, input.id), eq(schema.mentorshipGoal.userId, input.userId)));
	},

	// Toggle milestone completion
	toggleMilestone: async (input: { id: string; userId: string; milestoneId: string }): Promise<void> => {
		const [goal] = await db
			.select()
			.from(schema.mentorshipGoal)
			.where(and(eq(schema.mentorshipGoal.id, input.id), eq(schema.mentorshipGoal.userId, input.userId)));

		if (!goal) {
			throw new ORPCError("NOT_FOUND", { message: "Goal not found" });
		}

		const updatedMilestones = goal.milestones.map((m) => {
			if (m.id !== input.milestoneId) return m;
			return {
				...m,
				completed: !m.completed,
				completedAt: !m.completed ? new Date().toISOString().split("T")[0] : undefined,
			};
		});

		const completedCount = updatedMilestones.filter((m) => m.completed).length;
		const progress = updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;
		const status: MentorshipGoalStatus = progress === 100 ? "completed" : progress > 0 ? "in_progress" : "not_started";

		await db
			.update(schema.mentorshipGoal)
			.set({
				milestones: updatedMilestones,
				progress,
				status,
			})
			.where(eq(schema.mentorshipGoal.id, input.id));
	},

	// Delete a goal
	deleteGoal: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.mentorshipGoal)
			.where(and(eq(schema.mentorshipGoal.id, input.id), eq(schema.mentorshipGoal.userId, input.userId)));
	},

	// ========================
	// USER MENTORSHIP GOALS (for matching)
	// ========================

	// Get user's mentorship goals/preferences
	getUserGoals: async (userId: string) => {
		const [goals] = await db
			.select()
			.from(schema.userMentorshipGoals)
			.where(eq(schema.userMentorshipGoals.userId, userId));

		if (!goals) {
			return {
				targetRole: "",
				skills: [],
				industries: [],
				timeline: "6 months",
			};
		}

		return {
			targetRole: goals.targetRole,
			skills: goals.skills,
			industries: goals.industries,
			timeline: goals.timeline,
		};
	},

	// Update user's mentorship goals/preferences
	updateUserGoals: async (input: UserMentorshipGoalsInput): Promise<void> => {
		await db.transaction(async (tx) => {
			const [existing] = await tx
				.select({ id: schema.userMentorshipGoals.id })
				.from(schema.userMentorshipGoals)
				.where(eq(schema.userMentorshipGoals.userId, input.userId));

			if (existing) {
				await tx
					.update(schema.userMentorshipGoals)
					.set({
						targetRole: input.targetRole,
						skills: input.skills,
						industries: input.industries,
						timeline: input.timeline,
					})
					.where(eq(schema.userMentorshipGoals.userId, input.userId));
			} else {
				await tx.insert(schema.userMentorshipGoals).values({
					id: generateId(),
					userId: input.userId,
					targetRole: input.targetRole,
					skills: input.skills,
					industries: input.industries,
					timeline: input.timeline,
				});
			}
		});
	},

	// ========================
	// MENTOR REVIEWS
	// ========================

	// Create a review
	createReview: async (input: {
		mentorId: string;
		menteeId: string;
		menteeName: string;
		menteeAvatar?: string;
		rating: number;
		comment: string;
		sessionId: string;
	}): Promise<string> => {
		const id = generateId();

		await db.transaction(async (tx) => {
			await tx.insert(schema.mentorReview).values({
				id,
				mentorId: input.mentorId,
				menteeId: input.menteeId,
				menteeName: input.menteeName,
				menteeAvatar: input.menteeAvatar,
				rating: input.rating,
				comment: input.comment,
				sessionId: input.sessionId,
			});

			// Update mentor's rating
			const reviews = await tx
				.select()
				.from(schema.mentorReview)
				.where(eq(schema.mentorReview.mentorId, input.mentorId));

			const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

			await tx
				.update(schema.mentorProfile)
				.set({
					rating: Math.round(avgRating * 100) / 100,
					totalReviews: reviews.length,
				})
				.where(eq(schema.mentorProfile.id, input.mentorId));
		});

		return id;
	},

	// List reviews for a mentor
	listReviews: async (mentorId: string) => {
		return await db
			.select()
			.from(schema.mentorReview)
			.where(eq(schema.mentorReview.mentorId, mentorId))
			.orderBy(desc(schema.mentorReview.createdAt));
	},

	// ========================
	// STATISTICS
	// ========================

	// Get statistics for a user
	getStatistics: async (userId: string) => {
		const sessions = await db
			.select()
			.from(schema.mentorshipSession)
			.where(eq(schema.mentorshipSession.userId, userId));

		const goals = await db.select().from(schema.mentorshipGoal).where(eq(schema.mentorshipGoal.userId, userId));

		const requests = await db
			.select()
			.from(schema.mentorshipRequest)
			.where(eq(schema.mentorshipRequest.userId, userId));

		const mentors = await db.select().from(schema.mentorProfile);

		const now = new Date();
		const upcomingSessions = sessions.filter((s) => s.status === "scheduled" && new Date(s.scheduledAt) > now);
		const completedSessions = sessions.filter((s) => s.status === "completed");
		const activeGoals = goals.filter((g) => g.status === "in_progress");
		const activeMentorship = requests.find((r) => r.status === "accepted");

		return {
			totalMentors: mentors.length,
			completedSessions: completedSessions.length,
			upcomingSessions: upcomingSessions.length,
			activeGoals: activeGoals.length,
			pendingRequests: requests.filter((r) => r.status === "pending").length,
			hasActiveMentorship: !!activeMentorship,
			activeMentorId: activeMentorship?.mentorId ?? null,
		};
	},
};
