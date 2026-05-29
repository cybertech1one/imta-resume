import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import * as schema from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// LinkedIn post templates for different types
const POST_TEMPLATES = {
	career_update: {
		fr: {
			new_job:
				"🎉 Nouvelle aventure professionnelle !\n\nJe suis ravi(e) d'annoncer que je rejoins {company} en tant que {role}.\n\n{details}\n\nMerci à tous ceux qui m'ont soutenu(e) dans ce parcours. Hâte de commencer cette nouvelle étape !\n\n{hashtags}",
			promotion:
				"📈 Évolution de carrière\n\nJe suis heureux(se) de partager ma promotion au poste de {role} chez {company}.\n\n{details}\n\nReconnaissant(e) envers mon équipe et mes mentors.\n\n{hashtags}",
			certification:
				"🏆 Certification obtenue !\n\nFier(e) d'avoir obtenu la certification {certification}.\n\n{details}\n\nL'apprentissage continu est la clé du succès.\n\n{hashtags}",
		},
		en: {
			new_job:
				"🎉 Exciting News!\n\nI'm thrilled to announce that I'm joining {company} as {role}.\n\n{details}\n\nThankful for everyone who supported me on this journey. Excited to start this new chapter!\n\n{hashtags}",
			promotion:
				"📈 Career Update\n\nHappy to share my promotion to {role} at {company}.\n\n{details}\n\nGrateful for my team and mentors.\n\n{hashtags}",
			certification:
				"🏆 Certification Achieved!\n\nProud to have earned the {certification} certification.\n\n{details}\n\nContinuous learning is the key to success.\n\n{hashtags}",
		},
		ar: {
			new_job:
				"🎉 خبر سار!\n\nيسعدني أن أعلن انضمامي إلى {company} كـ {role}.\n\n{details}\n\nشكراً لكل من دعمني في هذه الرحلة.\n\n{hashtags}",
			promotion:
				"📈 تطور مهني\n\nسعيد بمشاركة ترقيتي إلى منصب {role} في {company}.\n\n{details}\n\nممتن لفريقي ومرشدي.\n\n{hashtags}",
			certification:
				"🏆 شهادة جديدة!\n\nفخور بالحصول على شهادة {certification}.\n\n{details}\n\nالتعلم المستمر هو مفتاح النجاح.\n\n{hashtags}",
		},
	},
	thought_leadership: {
		fr: {
			insight:
				"💡 Réflexion du jour\n\n{insight}\n\nMon point de vue : {opinion}\n\nQu'en pensez-vous ? Partagez votre expérience en commentaire.\n\n{hashtags}",
			lesson: "📚 Leçon apprise\n\n{lesson}\n\n3 points clés :\n• {point1}\n• {point2}\n• {point3}\n\n{hashtags}",
			trend:
				"🔮 Tendance à surveiller\n\n{trend}\n\nPourquoi c'est important :\n{importance}\n\nComment se préparer :\n{preparation}\n\n{hashtags}",
		},
		en: {
			insight:
				"💡 Today's Insight\n\n{insight}\n\nMy take: {opinion}\n\nWhat do you think? Share your experience in the comments.\n\n{hashtags}",
			lesson: "📚 Lesson Learned\n\n{lesson}\n\n3 key takeaways:\n• {point1}\n• {point2}\n• {point3}\n\n{hashtags}",
			trend:
				"🔮 Trend to Watch\n\n{trend}\n\nWhy it matters:\n{importance}\n\nHow to prepare:\n{preparation}\n\n{hashtags}",
		},
		ar: {
			insight:
				"💡 فكرة اليوم\n\n{insight}\n\nوجهة نظري: {opinion}\n\nما رأيكم؟ شاركوا تجربتكم في التعليقات.\n\n{hashtags}",
			lesson: "📚 درس مستفاد\n\n{lesson}\n\n3 نقاط رئيسية:\n• {point1}\n• {point2}\n• {point3}\n\n{hashtags}",
			trend:
				"🔮 اتجاه يستحق المتابعة\n\n{trend}\n\nلماذا هو مهم:\n{importance}\n\nكيف تستعد:\n{preparation}\n\n{hashtags}",
		},
	},
	engagement: {
		fr: {
			question: "❓ Question pour mon réseau\n\n{question}\n\nJ'aimerais connaître votre avis !\n\n{hashtags}",
			poll_intro: "📊 Sondage du jour\n\n{topic}\n\nParticipez et partagez votre point de vue !\n\n{hashtags}",
			discussion: "💬 Débat ouvert\n\n{topic}\n\nPour : {pro}\nContre : {con}\n\nVotre position ?\n\n{hashtags}",
		},
		en: {
			question: "❓ Question for my network\n\n{question}\n\nI'd love to hear your thoughts!\n\n{hashtags}",
			poll_intro: "📊 Today's Poll\n\n{topic}\n\nParticipate and share your perspective!\n\n{hashtags}",
			discussion: "💬 Open Discussion\n\n{topic}\n\nPros: {pro}\nCons: {con}\n\nYour stance?\n\n{hashtags}",
		},
		ar: {
			question: "❓ سؤال لشبكتي\n\n{question}\n\nأريد معرفة آرائكم!\n\n{hashtags}",
			poll_intro: "📊 استطلاع اليوم\n\n{topic}\n\nشاركوا وشاركوا وجهة نظركم!\n\n{hashtags}",
			discussion: "💬 نقاش مفتوح\n\n{topic}\n\nالإيجابيات: {pro}\nالسلبيات: {con}\n\nما موقفكم؟\n\n{hashtags}",
		},
	},
	story: {
		fr: {
			journey:
				"📖 Mon parcours\n\n{intro}\n\nLe défi : {challenge}\n\nCe que j'ai fait : {action}\n\nLe résultat : {result}\n\nCe que j'ai appris : {lesson}\n\n{hashtags}",
			failure:
				"❌ Mon plus grand échec\n\n{failure}\n\nCe que j'aurais dû faire différemment :\n{learnings}\n\nAujourd'hui, je sais que les échecs sont des tremplins.\n\n{hashtags}",
			mentor:
				'🙏 Merci à mon mentor\n\n{story}\n\nLe conseil qui a tout changé : "{advice}"\n\nN\'oubliez pas de remercier ceux qui vous ont aidé(e).\n\n{hashtags}',
		},
		en: {
			journey:
				"📖 My Journey\n\n{intro}\n\nThe challenge: {challenge}\n\nWhat I did: {action}\n\nThe outcome: {result}\n\nWhat I learned: {lesson}\n\n{hashtags}",
			failure:
				"❌ My Biggest Failure\n\n{failure}\n\nWhat I should have done differently:\n{learnings}\n\nToday, I know that failures are stepping stones.\n\n{hashtags}",
			mentor:
				'🙏 Thanks to My Mentor\n\n{story}\n\nThe advice that changed everything: "{advice}"\n\nDon\'t forget to thank those who helped you.\n\n{hashtags}',
		},
		ar: {
			journey:
				"📖 رحلتي\n\n{intro}\n\nالتحدي: {challenge}\n\nما فعلته: {action}\n\nالنتيجة: {result}\n\nما تعلمته: {lesson}\n\n{hashtags}",
			failure:
				"❌ أكبر إخفاق لي\n\n{failure}\n\nما كان علي فعله بشكل مختلف:\n{learnings}\n\nاليوم أعلم أن الإخفاقات هي نقاط انطلاق.\n\n{hashtags}",
			mentor:
				'🙏 شكراً لمرشدي\n\n{story}\n\nالنصيحة التي غيرت كل شيء: "{advice}"\n\nلا تنسوا شكر من ساعدكم.\n\n{hashtags}',
		},
	},
	achievement: {
		fr: {
			project:
				"🚀 Projet accompli !\n\n{project}\n\nLes chiffres :\n📈 {metric1}\n💰 {metric2}\n⏱️ {metric3}\n\nMerci à mon équipe exceptionnelle !\n\n{hashtags}",
			award:
				"🏆 Récompense reçue\n\nHonoré(e) de recevoir {award}.\n\n{context}\n\nCette reconnaissance est le fruit d'un travail d'équipe.\n\n{hashtags}",
			milestone:
				"🎯 Objectif atteint\n\n{milestone}\n\nComment nous y sommes arrivés :\n{how}\n\nProchaine étape : {next}\n\n{hashtags}",
		},
		en: {
			project:
				"🚀 Project Completed!\n\n{project}\n\nThe numbers:\n📈 {metric1}\n💰 {metric2}\n⏱️ {metric3}\n\nThanks to my amazing team!\n\n{hashtags}",
			award:
				"🏆 Award Received\n\nHonored to receive {award}.\n\n{context}\n\nThis recognition is the result of teamwork.\n\n{hashtags}",
			milestone: "🎯 Goal Achieved\n\n{milestone}\n\nHow we got there:\n{how}\n\nNext step: {next}\n\n{hashtags}",
		},
		ar: {
			project:
				"🚀 مشروع منجز!\n\n{project}\n\nالأرقام:\n📈 {metric1}\n💰 {metric2}\n⏱️ {metric3}\n\nشكراً لفريقي الرائع!\n\n{hashtags}",
			award: "🏆 جائزة مستلمة\n\nأشرف بتلقي {award}.\n\n{context}\n\nهذا التقدير هو ثمرة العمل الجماعي.\n\n{hashtags}",
			milestone: "🎯 هدف محقق\n\n{milestone}\n\nكيف وصلنا إلى هناك:\n{how}\n\nالخطوة التالية: {next}\n\n{hashtags}",
		},
	},
};

// Moroccan market hashtags
const MOROCCAN_HASHTAGS = {
	general: ["#Morocco", "#Maroc", "#MarocEmploi", "#RecrutementMaroc", "#CasablancaJobs", "#RabatJobs"],
	tech: ["#MarocTech", "#DigitalMaroc", "#TechMorocco", "#StartupMaroc", "#ITMaroc", "#DevMaroc"],
	finance: ["#FinanceMaroc", "#BanqueMaroc", "#CasaFinance", "#MarocBusiness"],
	marketing: ["#MarketingMaroc", "#DigitalMarketingMaroc", "#CommunicationMaroc"],
	engineering: ["#IngenierieMaroc", "#IndustrieMaroc", "#ManufacturingMorocco"],
	healthcare: ["#SanteMaroc", "#MedicalMorocco", "#HealthcareMorocco"],
	education: ["#EducationMaroc", "#FormationMaroc", "#IMTAAlumni"],
	consulting: ["#ConsultingMaroc", "#ConseilMaroc", "#StrategieMaroc"],
};

// Message templates
const MESSAGE_TEMPLATES = {
	connection_request: {
		fr: {
			alumni:
				"Bonjour {name},\n\nJe suis également diplômé(e) de {school} (promotion {year}). J'ai remarqué votre parcours chez {company} et j'aimerais échanger avec vous sur {topic}.\n\nAu plaisir de vous compter parmi mes contacts !",
			same_industry:
				"Bonjour {name},\n\nJe travaille également dans le secteur {industry} et j'ai été impressionné(e) par votre expertise en {expertise}. J'aimerais vous ajouter à mon réseau pour suivre vos publications.\n\nCordialement",
			recruiter:
				"Bonjour {name},\n\nJe suis actuellement à la recherche d'opportunités en {field} et j'ai vu que vous recrutez pour {company}. Je serais ravi(e) d'échanger sur les postes disponibles.\n\nMerci d'avance !",
			event:
				"Bonjour {name},\n\nJ'ai eu le plaisir de vous rencontrer lors de {event}. Notre conversation sur {topic} m'a beaucoup inspiré(e). J'aimerais rester en contact.\n\nBien cordialement",
		},
		en: {
			alumni:
				"Hi {name},\n\nI'm also a {school} alumnus (class of {year}). I noticed your career at {company} and would love to connect and discuss {topic}.\n\nLooking forward to connecting!",
			same_industry:
				"Hi {name},\n\nI also work in {industry} and was impressed by your expertise in {expertise}. I'd love to add you to my network to follow your insights.\n\nBest regards",
			recruiter:
				"Hi {name},\n\nI'm currently exploring opportunities in {field} and noticed you're recruiting for {company}. I'd love to discuss available positions.\n\nThank you!",
			event:
				"Hi {name},\n\nIt was great meeting you at {event}. Our conversation about {topic} was inspiring. I'd love to stay connected.\n\nBest",
		},
		ar: {
			alumni:
				"مرحباً {name}،\n\nأنا أيضاً خريج {school} (دفعة {year}). لاحظت مسيرتك في {company} وأود التواصل معك حول {topic}.\n\nأتطلع للتواصل!",
			same_industry:
				"مرحباً {name}،\n\nأعمل أيضاً في قطاع {industry} وأعجبتني خبرتك في {expertise}. أود إضافتك لشبكتي.\n\nتحياتي",
			recruiter:
				"مرحباً {name}،\n\nأبحث حالياً عن فرص في {field} ولاحظت أنك توظف لـ {company}. أود مناقشة الوظائف المتاحة.\n\nشكراً!",
			event: "مرحباً {name}،\n\nسعدت بلقائك في {event}. حديثنا عن {topic} ألهمني كثيراً. أود البقاء على تواصل.\n\nتحياتي",
		},
	},
	follow_up: {
		fr: {
			after_meeting:
				"Bonjour {name},\n\nMerci pour notre échange de {date}. J'ai beaucoup apprécié notre discussion sur {topic}.\n\nComme convenu, {action}.\n\nN'hésitez pas si vous avez des questions.\n\nCordialement",
			after_interview:
				"Bonjour {name},\n\nJe tenais à vous remercier pour l'entretien de {date} pour le poste de {position}.\n\nNotre conversation a renforcé mon intérêt pour {company}. {highlight}\n\nJe reste à votre disposition.\n\nCordialement",
			check_in:
				"Bonjour {name},\n\nJ'espère que vous allez bien ! Je voulais prendre de vos nouvelles depuis notre dernier échange.\n\n{context}\n\nÀ bientôt !",
		},
		en: {
			after_meeting:
				"Hi {name},\n\nThank you for our conversation on {date}. I really enjoyed discussing {topic}.\n\nAs agreed, {action}.\n\nFeel free to reach out with any questions.\n\nBest regards",
			after_interview:
				"Hi {name},\n\nThank you for the interview on {date} for the {position} role.\n\nOur conversation reinforced my interest in {company}. {highlight}\n\nI remain at your disposal.\n\nBest regards",
			check_in:
				"Hi {name},\n\nHope you're doing well! I wanted to check in since our last conversation.\n\n{context}\n\nTalk soon!",
		},
		ar: {
			after_meeting:
				"مرحباً {name}،\n\nشكراً على محادثتنا يوم {date}. استمتعت كثيراً بمناقشة {topic}.\n\nكما اتفقنا، {action}.\n\nلا تتردد في التواصل.\n\nتحياتي",
			after_interview:
				"مرحباً {name}،\n\nشكراً على المقابلة يوم {date} لوظيفة {position}.\n\nمحادثتنا عززت اهتمامي بـ {company}. {highlight}\n\nأنا تحت تصرفكم.\n\nتحياتي",
			check_in: "مرحباً {name}،\n\nأتمنى أنك بخير! أردت الاطمئنان عليك منذ آخر محادثة.\n\n{context}\n\nإلى اللقاء!",
		},
	},
	informational_interview: {
		fr: {
			request:
				"Bonjour {name},\n\nJe suis {role} et je m'intéresse beaucoup au secteur {industry}. Votre parcours chez {company} m'impressionne particulièrement.\n\nSeriez-vous disponible pour un échange de 20 minutes pour partager votre expérience ?\n\nJe comprends que votre temps est précieux et je suis flexible sur le format.\n\nMerci d'avance !",
		},
		en: {
			request:
				"Hi {name},\n\nI'm a {role} very interested in {industry}. Your career at {company} particularly impresses me.\n\nWould you be available for a 20-minute call to share your experience?\n\nI understand your time is valuable and I'm flexible on format.\n\nThank you!",
		},
		ar: {
			request:
				"مرحباً {name}،\n\nأنا {role} ومهتم جداً بقطاع {industry}. مسيرتك في {company} تثير إعجابي.\n\nهل يمكنك تخصيص 20 دقيقة لمشاركة تجربتك؟\n\nأقدر وقتك الثمين وأنا مرن بشأن الصيغة.\n\nشكراً!",
		},
	},
	thank_you: {
		fr: {
			after_help:
				"Bonjour {name},\n\nJe tenais à vous remercier sincèrement pour {help}.\n\n{impact}\n\nVotre générosité fait toute la différence. N'hésitez pas si je peux vous être utile à mon tour.\n\nAvec gratitude",
			after_referral:
				"Bonjour {name},\n\nMerci infiniment de m'avoir recommandé(e) pour {opportunity}.\n\n{update}\n\nJe vous tiendrai informé(e) de la suite. Encore merci !\n\nCordialement",
		},
		en: {
			after_help:
				"Hi {name},\n\nI wanted to sincerely thank you for {help}.\n\n{impact}\n\nYour generosity makes all the difference. Please let me know if I can ever return the favor.\n\nWith gratitude",
			after_referral:
				"Hi {name},\n\nThank you so much for referring me for {opportunity}.\n\n{update}\n\nI'll keep you updated on the progress. Thanks again!\n\nBest",
		},
		ar: {
			after_help:
				"مرحباً {name}،\n\nأردت أن أشكرك من صميم قلبي على {help}.\n\n{impact}\n\nكرمك يصنع الفرق. لا تتردد إن كان بإمكاني رد الجميل.\n\nمع الامتنان",
			after_referral:
				"مرحباً {name}،\n\nشكراً جزيلاً على ترشيحي لـ {opportunity}.\n\n{update}\n\nسأطلعك على المستجدات. شكراً مرة أخرى!\n\nتحياتي",
		},
	},
	referral_request: {
		fr: {
			job: "Bonjour {name},\n\nJ'espère que vous allez bien !\n\nJ'ai vu une opportunité chez {company} pour le poste de {position} qui correspond parfaitement à mon profil.\n\nConnaissez-vous quelqu'un dans l'équipe qui pourrait me recommander ou me donner plus d'informations ?\n\nMerci d'avance pour votre aide !\n\nCordialement",
		},
		en: {
			job: "Hi {name},\n\nHope you're well!\n\nI saw an opportunity at {company} for a {position} role that's a great fit for my background.\n\nDo you know anyone on the team who could refer me or provide more insights?\n\nThanks in advance for your help!\n\nBest",
		},
		ar: {
			job: "مرحباً {name}،\n\nأتمنى أنك بخير!\n\nرأيت فرصة في {company} لمنصب {position} يناسب ملفي تماماً.\n\nهل تعرف أحداً في الفريق يمكنه ترشيحي أو إعطائي مزيد من المعلومات؟\n\nشكراً مقدماً على مساعدتك!\n\nتحياتي",
		},
	},
};

export const linkedinContentService = {
	// ==========================================
	// POST MANAGEMENT
	// ==========================================

	createPost: async (input: {
		userId: string;
		postType: (typeof schema.linkedinPost.$inferSelect)["postType"];
		tone: (typeof schema.linkedinPost.$inferSelect)["tone"];
		language: string;
		title?: string;
		content: string;
		hashtags?: string[];
		aiPrompt?: string;
	}) => {
		const id = generateId();
		await db.insert(schema.linkedinPost).values({
			id,
			userId: input.userId,
			postType: input.postType,
			tone: input.tone,
			language: input.language,
			title: input.title,
			content: input.content,
			hashtags: input.hashtags || [],
			aiPrompt: input.aiPrompt,
			status: "draft",
		});
		return id;
	},

	updatePost: async (
		id: string,
		userId: string,
		input: Partial<{
			title: string;
			content: string;
			hashtags: string[];
			status: (typeof schema.linkedinPost.$inferSelect)["status"];
			scheduledAt: Date;
			isFavorite: boolean;
		}>,
	) => {
		await db
			.update(schema.linkedinPost)
			.set(input)
			.where(and(eq(schema.linkedinPost.id, id), eq(schema.linkedinPost.userId, userId)));
	},

	deletePost: async (id: string, userId: string) => {
		await db
			.delete(schema.linkedinPost)
			.where(and(eq(schema.linkedinPost.id, id), eq(schema.linkedinPost.userId, userId)));
	},

	listPosts: async (
		userId: string,
		filters?: {
			status?: (typeof schema.linkedinPost.$inferSelect)["status"];
			postType?: (typeof schema.linkedinPost.$inferSelect)["postType"];
			limit?: number;
			offset?: number;
		},
	) => {
		let query = db
			.select()
			.from(schema.linkedinPost)
			.where(eq(schema.linkedinPost.userId, userId))
			.orderBy(desc(schema.linkedinPost.createdAt));

		if (filters?.status) {
			query = db
				.select()
				.from(schema.linkedinPost)
				.where(and(eq(schema.linkedinPost.userId, userId), eq(schema.linkedinPost.status, filters.status)))
				.orderBy(desc(schema.linkedinPost.createdAt));
		}

		if (filters?.limit) {
			query = query.limit(filters.limit) as typeof query;
		}

		if (filters?.offset) {
			query = query.offset(filters.offset) as typeof query;
		}

		return query;
	},

	getPost: async (id: string, userId: string) => {
		const [post] = await db
			.select()
			.from(schema.linkedinPost)
			.where(and(eq(schema.linkedinPost.id, id), eq(schema.linkedinPost.userId, userId)));
		return post;
	},

	getPostTemplates: () => POST_TEMPLATES,

	getHashtagSuggestions: (industry: string = "general") => {
		const industryHashtags = MOROCCAN_HASHTAGS[industry as keyof typeof MOROCCAN_HASHTAGS] || MOROCCAN_HASHTAGS.general;
		return [...industryHashtags, ...MOROCCAN_HASHTAGS.general.filter((h) => !industryHashtags.includes(h))];
	},

	// ==========================================
	// MESSAGE MANAGEMENT
	// ==========================================

	createMessage: async (input: {
		userId: string;
		messageType: (typeof schema.linkedinMessage.$inferSelect)["messageType"];
		formality: (typeof schema.linkedinMessage.$inferSelect)["formality"];
		language: string;
		recipientName?: string;
		recipientRole?: string;
		recipientCompany?: string;
		context?: string;
		subject?: string;
		content: string;
		aiPrompt?: string;
	}) => {
		const id = generateId();
		await db.insert(schema.linkedinMessage).values({
			id,
			userId: input.userId,
			messageType: input.messageType,
			formality: input.formality,
			language: input.language,
			recipientName: input.recipientName,
			recipientRole: input.recipientRole,
			recipientCompany: input.recipientCompany,
			context: input.context,
			subject: input.subject,
			content: input.content,
			aiPrompt: input.aiPrompt,
		});
		return id;
	},

	updateMessage: async (
		id: string,
		userId: string,
		input: Partial<{
			content: string;
			isSent: boolean;
			sentAt: Date;
			responseReceived: boolean;
			responseReceivedAt: Date;
			isFavorite: boolean;
		}>,
	) => {
		await db
			.update(schema.linkedinMessage)
			.set(input)
			.where(and(eq(schema.linkedinMessage.id, id), eq(schema.linkedinMessage.userId, userId)));
	},

	deleteMessage: async (id: string, userId: string) => {
		await db
			.delete(schema.linkedinMessage)
			.where(and(eq(schema.linkedinMessage.id, id), eq(schema.linkedinMessage.userId, userId)));
	},

	listMessages: async (
		userId: string,
		filters?: {
			messageType?: (typeof schema.linkedinMessage.$inferSelect)["messageType"];
			isSent?: boolean;
			limit?: number;
			offset?: number;
		},
	) => {
		return db
			.select()
			.from(schema.linkedinMessage)
			.where(eq(schema.linkedinMessage.userId, userId))
			.orderBy(desc(schema.linkedinMessage.createdAt))
			.limit(filters?.limit || 50)
			.offset(filters?.offset || 0);
	},

	getMessage: async (id: string, userId: string) => {
		const [message] = await db
			.select()
			.from(schema.linkedinMessage)
			.where(and(eq(schema.linkedinMessage.id, id), eq(schema.linkedinMessage.userId, userId)));
		return message;
	},

	getMessageTemplates: () => MESSAGE_TEMPLATES,

	// ==========================================
	// PROFILE ANALYSIS
	// ==========================================

	createProfileAnalysis: async (input: {
		userId: string;
		headline?: string;
		summary?: string;
		experience?: string;
		overallScore: number;
		headlineScore?: number;
		summaryScore?: number;
		keywordScore?: number;
		readabilityScore?: number;
		suggestions: {
			headline: string[];
			summary: string[];
			keywords: string[];
			general: string[];
		};
		missingKeywords?: string[];
		strongPoints?: string[];
	}) => {
		const id = generateId();
		await db.insert(schema.linkedinProfileAnalysis).values({
			id,
			userId: input.userId,
			headline: input.headline,
			summary: input.summary,
			experience: input.experience,
			overallScore: input.overallScore,
			headlineScore: input.headlineScore,
			summaryScore: input.summaryScore,
			keywordScore: input.keywordScore,
			readabilityScore: input.readabilityScore,
			suggestions: input.suggestions,
			missingKeywords: input.missingKeywords || [],
			strongPoints: input.strongPoints || [],
		});
		return id;
	},

	listProfileAnalyses: async (userId: string, limit = 10) => {
		return db
			.select()
			.from(schema.linkedinProfileAnalysis)
			.where(eq(schema.linkedinProfileAnalysis.userId, userId))
			.orderBy(desc(schema.linkedinProfileAnalysis.createdAt))
			.limit(limit);
	},

	getLatestProfileAnalysis: async (userId: string) => {
		const [analysis] = await db
			.select()
			.from(schema.linkedinProfileAnalysis)
			.where(eq(schema.linkedinProfileAnalysis.userId, userId))
			.orderBy(desc(schema.linkedinProfileAnalysis.createdAt))
			.limit(1);
		return analysis;
	},

	// ==========================================
	// STATISTICS
	// ==========================================

	getStats: async (userId: string) => {
		const [postsCount] = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.linkedinPost)
			.where(eq(schema.linkedinPost.userId, userId));

		const [messagesCount] = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.linkedinMessage)
			.where(eq(schema.linkedinMessage.userId, userId));

		const [sentMessagesCount] = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.linkedinMessage)
			.where(and(eq(schema.linkedinMessage.userId, userId), eq(schema.linkedinMessage.isSent, true)));

		const [responsesCount] = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.linkedinMessage)
			.where(and(eq(schema.linkedinMessage.userId, userId), eq(schema.linkedinMessage.responseReceived, true)));

		const [analysesCount] = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.linkedinProfileAnalysis)
			.where(eq(schema.linkedinProfileAnalysis.userId, userId));

		return {
			totalPosts: Number(postsCount?.count || 0),
			totalMessages: Number(messagesCount?.count || 0),
			sentMessages: Number(sentMessagesCount?.count || 0),
			responseRate:
				Number(sentMessagesCount?.count || 0) > 0
					? Math.round((Number(responsesCount?.count || 0) / Number(sentMessagesCount?.count || 0)) * 100)
					: 0,
			profileAnalyses: Number(analysesCount?.count || 0),
		};
	},
};
