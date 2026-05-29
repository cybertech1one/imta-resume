import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Icon } from "@phosphor-icons/react";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BookOpenIcon,
	BriefcaseIcon,
	CaretDownIcon,
	CaretUpIcon,
	ChatCircleDotsIcon,
	CheckCircleIcon,
	FirstAidKitIcon,
	GearIcon,
	GraduationCapIcon,
	HardHatIcon,
	LightbulbIcon,
	ListIcon,
	MagnifyingGlassIcon,
	PlayIcon,
	QuestionIcon,
	ShuffleIcon,
	SparkleIcon,
	StarIcon,
	TargetIcon,
	TrendUpIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import z from "zod";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";
import { cn } from "@/utils/style";
import { DashboardHeader } from "../-components/header";
import { polishFrenchText } from "./-components/french-text";

const searchSchema = z.object({
	field: z.enum(["healthcare", "industrial", "hse", "general"]).optional().default("general"),
	type: z.enum(["behavioral", "technical", "situational", "motivational", "general"]).optional(),
	difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
});

type SearchParams = z.infer<typeof searchSchema>;

// biome-ignore lint/suspicious/noExplicitAny: Route path not in generated route tree
export const Route = createFileRoute("/dashboard/interview/questions" as any)({
	component: CommonQuestionsPage,
	errorComponent: ErrorComponent,
	validateSearch: searchSchema,
});

// Field configuration - labels/descriptions use getter functions for i18n
function getFieldConfigLabels() {
	return {
		general: { label: t`Général`, description: t`Questions générales pour tous les domaines` },
		healthcare: { label: t`Santé`, description: t`Questions pour soins infirmiers, aide-soignant et sage-femme` },
		industrial: { label: t`Industrie`, description: t`Maintenance, electromecanique, soudure et production` },
		hse: { label: t`HSE`, description: t`Hygiène, sécurité et environnement industriel` },
	};
}

const fieldConfigStatic: Record<
	string,
	{
		icon: Icon;
		color: string;
		bgColor: string;
		gradient: string;
	}
> = {
	general: {
		icon: BriefcaseIcon,
		color: "text-gray-600 dark:text-gray-400",
		bgColor: "bg-gray-100 dark:bg-gray-800/30",
		gradient: "from-gray-500/20 to-slate-500/10",
	},
	healthcare: {
		icon: FirstAidKitIcon,
		color: "text-red-600 dark:text-red-400",
		bgColor: "bg-red-100 dark:bg-red-900/30",
		gradient: "from-red-500/20 to-rose-500/10",
	},
	industrial: {
		icon: GearIcon,
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
		gradient: "from-blue-500/20 to-indigo-500/10",
	},
	hse: {
		icon: HardHatIcon,
		color: "text-amber-600 dark:text-amber-400",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
		gradient: "from-amber-500/20 to-orange-500/10",
	},
};

const fieldConfig = new Proxy(
	{} as Record<
		string,
		{ label: string; description: string; icon: Icon; color: string; bgColor: string; gradient: string }
	>,
	{
		get(_target, prop: string) {
			const labels = getFieldConfigLabels();
			const staticConf = fieldConfigStatic[prop];
			const labelConf = labels[prop as keyof typeof labels];
			if (!staticConf || !labelConf) return undefined;
			return { ...staticConf, ...labelConf };
		},
		ownKeys() {
			return Object.keys(fieldConfigStatic);
		},
		getOwnPropertyDescriptor(_target, prop) {
			if (prop in fieldConfigStatic) return { configurable: true, enumerable: true };
			return undefined;
		},
	},
);

// Question type configuration
function getTypeConfigLabels() {
	return {
		behavioral: { label: t`Comportemental`, description: t`Questions sur vos expériences passées` },
		technical: { label: t`Technique`, description: t`Questions sur vos compétences techniques` },
		situational: { label: t`Situationnel`, description: t`Scenarios professionnels concrets` },
		motivational: { label: t`Motivation`, description: t`Questions sur vos motivations` },
		general: { label: t`Général`, description: t`Questions générales d'entretien` },
	};
}

const typeConfigStatic: Record<string, { icon: Icon; color: string; bgColor: string }> = {
	behavioral: {
		icon: UserIcon,
		color: "text-purple-600 dark:text-purple-400",
		bgColor: "bg-purple-100 dark:bg-purple-900/30",
	},
	technical: { icon: GearIcon, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
	situational: {
		icon: TargetIcon,
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
	motivational: {
		icon: SparkleIcon,
		color: "text-orange-600 dark:text-orange-400",
		bgColor: "bg-orange-100 dark:bg-orange-900/30",
	},
	general: {
		icon: QuestionIcon,
		color: "text-gray-600 dark:text-gray-400",
		bgColor: "bg-gray-100 dark:bg-gray-800/30",
	},
};

const typeConfig = new Proxy(
	{} as Record<string, { label: string; description: string; icon: Icon; color: string; bgColor: string }>,
	{
		get(_target, prop: string) {
			const labels = getTypeConfigLabels();
			const staticConf = typeConfigStatic[prop];
			const labelConf = labels[prop as keyof typeof labels];
			if (!staticConf || !labelConf) return undefined;
			return { ...staticConf, ...labelConf };
		},
		ownKeys() {
			return Object.keys(typeConfigStatic);
		},
		getOwnPropertyDescriptor(_target, prop) {
			if (prop in typeConfigStatic) return { configurable: true, enumerable: true };
			return undefined;
		},
	},
);

// Difficulty configuration
function getDifficultyConfigLabels() {
	return {
		beginner: t`Débutant`,
		intermediate: t`Intermédiaire`,
		advanced: t`Avancé`,
	};
}

const difficultyConfigStatic: Record<string, { color: string; bgColor: string }> = {
	beginner: { color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30" },
	intermediate: { color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
	advanced: { color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30" },
};

const difficultyConfig = new Proxy({} as Record<string, { label: string; color: string; bgColor: string }>, {
	get(_target, prop: string) {
		const labels = getDifficultyConfigLabels();
		const staticConf = difficultyConfigStatic[prop];
		const label = labels[prop as keyof typeof labels];
		if (!staticConf || !label) return undefined;
		return { ...staticConf, label };
	},
	ownKeys() {
		return Object.keys(difficultyConfigStatic);
	},
	getOwnPropertyDescriptor(_target, prop) {
		if (prop in difficultyConfigStatic) return { configurable: true, enumerable: true };
		return undefined;
	},
});

type CommonQuestion = {
	id: string;
	question: string;
	type: "behavioral" | "technical" | "situational" | "motivational" | "general";
	field: "healthcare" | "industrial" | "hse" | "general";
	sampleAnswer: string;
	tips: string[];
};

const fallbackCommonQuestions: CommonQuestion[] = [
	{
		id: "fallback-gen-1",
		question: "Parlez-moi de vous.",
		type: "general",
		field: "general",
		sampleAnswer:
			"Je suis diplômé(e) de l'IMTA en [domaine]. Pendant mes stages, j'ai développé des compétences en [compétence 1] et [compétence 2]. Je cherche aujourd'hui un poste où je peux appliquer ces acquis, apprendre vite et contribuer sérieusement à l'équipe.",
		tips: [
			"Restez sous 2 minutes",
			"Mettez en avant votre formation et vos stages",
			"Terminez par votre motivation pour le poste",
		],
	},
	{
		id: "fallback-gen-2",
		question: "Pourquoi voulez-vous ce poste ?",
		type: "motivational",
		field: "general",
		sampleAnswer:
			"Ce poste correspond à ma formation et à mes objectifs professionnels. Les missions me permettront d'utiliser mes compétences techniques, de progresser avec une équipe expérimentée et d'apporter une contribution concrète dès les premiers mois.",
		tips: [
			"Reliez le poste à vos compétences",
			"Montrez que vous avez lu l'offre",
			"Évitez les réponses trop générales",
		],
	},
	{
		id: "fallback-gen-3",
		question: "Quels sont vos points forts et vos points a ameliorer ?",
		type: "general",
		field: "general",
		sampleAnswer:
			"Mes points forts sont la rigueur, la ponctualite et l'envie d'apprendre. Mon point a ameliorer est que je peux parfois vouloir tout verifier plusieurs fois; je travaille dessus en utilisant des listes de priorites et des delais clairs.",
		tips: [
			"Choisissez un point faible reel mais maitrisable",
			"Expliquez ce que vous faites pour progresser",
			"Donnez un exemple concret",
		],
	},
	{
		id: "fallback-gen-4",
		question: "Decrivez une situation difficile que vous avez geree.",
		type: "behavioral",
		field: "general",
		sampleAnswer:
			"Pendant mon stage, une tâche urgente est arrivée alors que l'équipe était déjà occupée. J'ai clarifié la priorité avec mon responsable, organisé les étapes, puis j'ai demandé validation avant de terminer. Le travail a été rendu dans les temps et sans erreur importante.",
		tips: [
			"Utilisez la methode STAR",
			"Expliquez votre action personnelle",
			"Terminez par le résultat et l'apprentissage",
		],
	},
	{
		id: "fallback-gen-5",
		question: "Comment travaillez-vous en équipe ?",
		type: "behavioral",
		field: "general",
		sampleAnswer:
			"Je communique clairement, je respecte le rôle de chacun et je demande de l'aide quand c'est nécessaire. En stage, je faisais des points rapides avec mon tuteur pour vérifier les priorités et éviter les malentendus.",
		tips: ["Parlez de communication", "Montrez que vous respectez les consignes", "Ajoutez un exemple de stage"],
	},
	{
		id: "fallback-gen-6",
		question: "Ou vous voyez-vous dans 5 ans ?",
		type: "motivational",
		field: "general",
		sampleAnswer:
			"Dans 5 ans, je souhaite etre autonome dans mon metier, avoir renforce mon expertise et pouvoir encadrer ou aider les nouveaux arrivants. Je veux construire cette progression dans une entreprise stable ou je peux apprendre durablement.",
		tips: ["Soyez ambitieux mais réaliste", "Montrez votre volonté de progresser", "Reliez votre réponse au poste"],
	},
	{
		id: "fallback-gen-7",
		question: "Pourquoi devrions-nous vous recruter ?",
		type: "motivational",
		field: "general",
		sampleAnswer:
			"Vous devriez me recruter parce que ma formation correspond au poste, que j'ai déjà pratiqué en stage et que je suis motivé pour apprendre rapidement. Je suis sérieux, ponctuel et capable de suivre les consignes tout en progressant avec l'équipe.",
		tips: ["Resumez vos 3 meilleurs arguments", "Reliez-les au poste", "Gardez un ton confiant mais humble"],
	},
	{
		id: "fallback-gen-8",
		question: "Comment gerez-vous la pression ou les delais courts ?",
		type: "behavioral",
		field: "general",
		sampleAnswer:
			"Je commence par identifier les priorités, puis je découpe le travail en étapes simples. Je communique rapidement si un blocage apparaît et je garde une trace de ce qui est fait pour éviter les erreurs.",
		tips: ["Montrez votre organisation", "Expliquez votre communication", "Donnez un exemple concret si possible"],
	},
	{
		id: "fallback-gen-9",
		question: "Que savez-vous de notre entreprise ?",
		type: "motivational",
		field: "general",
		sampleAnswer:
			"J'ai consulté votre site, votre activité principale et les informations disponibles sur vos services. Ce qui m'intéresse est [élément précis], car cela correspond à mon projet professionnel et aux compétences que je veux développer.",
		tips: [
			"Mentionnez un fait precis",
			"Reliez l'entreprise a votre projet",
			"Préparez cette réponse avant chaque entretien",
		],
	},
	{
		id: "fallback-gen-10",
		question: "Avez-vous des questions à nous poser ?",
		type: "general",
		field: "general",
		sampleAnswer:
			"Oui. J'aimerais mieux comprendre les missions des premiers mois, la composition de l'équipe, les attentes pour réussir dans le poste et les possibilités de formation interne.",
		tips: [
			"Posez au moins deux questions",
			"Évitez les questions déjà expliquées dans l'offre",
			"Montrez votre intérêt pour l'intégration",
		],
	},
	{
		id: "fallback-health-1",
		question: "Pourquoi avez-vous choisi le domaine de la sante ?",
		type: "motivational",
		field: "healthcare",
		sampleAnswer:
			"J'ai choisi la santé parce que le contact humain et l'aide aux patients ont du sens pour moi. Mes stages m'ont confirmé que je peux rester attentif, respecter les protocoles et travailler avec empathie même dans les moments exigeants.",
		tips: ["Montrez une motivation sincere", "Parlez du patient", "Evitez les phrases apprises par coeur"],
	},
	{
		id: "fallback-health-2",
		question: "Comment assurez-vous l'hygiène et la sécurité du patient ?",
		type: "technical",
		field: "healthcare",
		sampleAnswer:
			"Je commence par l'hygiene des mains, je prepare le materiel, je verifie l'identite du patient et j'explique le soin. Je respecte les protocoles, je porte les protections adaptees et je note les informations importantes dans le dossier.",
		tips: ["Mentionnez l'hygiene des mains", "Parlez de verification de l'identite", "Ajoutez la tracabilite"],
	},
	{
		id: "fallback-health-3",
		question: "Comment reagissez-vous face a un patient anxieux ou difficile ?",
		type: "situational",
		field: "healthcare",
		sampleAnswer:
			"Je reste calme, j'écoute le patient et je cherche la cause de son anxiété. J'explique ce que je vais faire avec des mots simples, je respecte son rythme et je demande de l'aide à l'équipe si la situation l'exige.",
		tips: ["Montrez de l'empathie", "Expliquez votre communication", "N'oubliez pas l'équipe"],
	},
	{
		id: "fallback-ind-1",
		question: "Comment diagnostiquez-vous une panne machine ?",
		type: "technical",
		field: "industrial",
		sampleAnswer:
			"Je commence par securiser la zone et verifier la consignation si necessaire. Ensuite, j'observe les symptomes, je consulte l'historique et la documentation, puis je teste les hypotheses une par une en commencant par les causes simples.",
		tips: ["Commencez par la sécurité", "Montrez une méthode", "Mentionnez la documentation technique"],
	},
	{
		id: "fallback-ind-2",
		question: "Quelles precautions prenez-vous avant une intervention ?",
		type: "technical",
		field: "industrial",
		sampleAnswer:
			"Je porte les EPI adaptés, je vérifie l'arrêt et la consignation de l'équipement, je balise la zone et j'informe les personnes concernées. Je ne commence pas tant que les conditions de sécurité ne sont pas confirmées.",
		tips: ["Citez les EPI", "Parlez de consignation", "Montrez votre rigueur"],
	},
	{
		id: "fallback-ind-3",
		question: "Donnez un exemple d'amelioration de processus.",
		type: "behavioral",
		field: "industrial",
		sampleAnswer:
			"Pendant mon stage, j'ai remarqué qu'une vérification prenait trop de temps. J'ai proposé une fiche de contrôle plus claire à mon tuteur. Après validation, l'équipe l'a utilisée et les oublis ont diminué.",
		tips: ["Utilisez STAR", "Chiffrez le resultat si possible", "Montrez votre initiative"],
	},
	{
		id: "fallback-hse-1",
		question: "Comment realisez-vous une evaluation des risques ?",
		type: "technical",
		field: "hse",
		sampleAnswer:
			"J'identifie les dangers, les personnes exposees, la probabilite et la gravite. Ensuite, je classe les risques, je propose des mesures de prevention, je documente les actions et je prevois un suivi.",
		tips: ["Structurez votre methode", "Mentionnez probabilite et gravite", "Ajoutez le suivi"],
	},
	{
		id: "fallback-hse-2",
		question: "Que faites-vous si vous voyez une violation de sécurité ?",
		type: "situational",
		field: "hse",
		sampleAnswer:
			"J'interviens d'abord pour stopper le danger immédiat si je peux le faire sans me mettre en risque. Ensuite, je rappelle calmement la règle, je signale l'incident selon la procédure et je propose une action corrective.",
		tips: ["Priorisez la sécurité immédiate", "Restez factuel", "Expliquez l'escalade"],
	},
	{
		id: "fallback-hse-3",
		question: "Quels EPI choisir selon le risque ?",
		type: "technical",
		field: "hse",
		sampleAnswer:
			"Le choix dépend du danger : casque pour chute d'objets, lunettes pour projections, gants adaptés au risque, chaussures de sécurité, protection auditive en zone bruyante et masque selon l'exposition aux poussières ou produits.",
		tips: ["Associez chaque EPI a un risque", "Montrez que le choix depend du poste", "Mentionnez le bon port des EPI"],
	},
];

function getFallbackQuestions(
	field: "healthcare" | "industrial" | "hse" | "general",
	type?: "behavioral" | "technical" | "situational" | "motivational" | "general",
) {
	let filtered = fallbackCommonQuestions.filter((question) =>
		field === "general" ? question.field === "general" : question.field === field || question.field === "general",
	);

	if (type) {
		filtered = filtered.filter((question) => question.type === type);
	}

	return filtered;
}

function mergeQuestions(apiQuestions: CommonQuestion[], fallbackQuestions: CommonQuestion[]) {
	const merged = new Map<string, CommonQuestion>();
	for (const question of apiQuestions) merged.set(question.id, question);
	for (const question of fallbackQuestions) {
		if (!merged.has(question.id)) merged.set(question.id, question);
	}
	return [...merged.values()].map((question) => ({
		...question,
		question: polishFrenchText(question.question),
		sampleAnswer: polishFrenchText(question.sampleAnswer),
		tips: question.tips.map((tip) => polishFrenchText(tip)),
	}));
}

function CommonQuestionsPage() {
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const { field, type, difficulty } = Route.useSearch() as SearchParams;

	// State
	const [selectedField, setSelectedField] = useState<string>(field || "general");
	const [selectedType, setSelectedType] = useState<string | undefined>(type);
	const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>(difficulty);
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

	// Fetch questions
	const { data: questions = [], isLoading } = useQuery({
		...orpc.interview.getCommonQuestions.queryOptions({
			input: {
				field: selectedField as "healthcare" | "industrial" | "hse" | "general",
				type: selectedType as "behavioral" | "technical" | "situational" | "motivational" | "general" | undefined,
				language: "fr",
			},
		}),
		enabled: !!session?.user,
	});

	const fallbackQuestions = useMemo(
		() =>
			getFallbackQuestions(
				selectedField as "healthcare" | "industrial" | "hse" | "general",
				selectedType as "behavioral" | "technical" | "situational" | "motivational" | "general" | undefined,
			),
		[selectedField, selectedType],
	);

	const availableQuestions = useMemo(
		() => mergeQuestions(questions as CommonQuestion[], fallbackQuestions),
		[questions, fallbackQuestions],
	);

	// Difficulty mapping (simulated since API doesn't have it)
	const getDifficulty = useCallback((questionId: string): "beginner" | "intermediate" | "advanced" => {
		// General questions are usually beginner
		if (questionId.startsWith("gen-1") || questionId.startsWith("gen-2")) return "beginner";
		if (questionId.includes("-1") || questionId.includes("-2")) return "beginner";
		if (questionId.includes("-3") || questionId.includes("-4")) return "intermediate";
		return "advanced";
	}, []);

	// Filter questions
	const filteredQuestions = useMemo(() => {
		let filtered = availableQuestions;

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(q) => q.question.toLowerCase().includes(query) || q.sampleAnswer?.toLowerCase().includes(query),
			);
		}

		// Filter by difficulty
		if (selectedDifficulty) {
			filtered = filtered.filter((q) => getDifficulty(q.id) === selectedDifficulty);
		}

		return filtered;
	}, [availableQuestions, searchQuery, selectedDifficulty, getDifficulty]);

	// Toggle expand
	const toggleExpand = useCallback((questionId: string) => {
		setExpandedQuestions((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(questionId)) {
				newSet.delete(questionId);
			} else {
				newSet.add(questionId);
			}
			return newSet;
		});
	}, []);

	// Update URL when field changes
	const handleFieldChange = (newField: string) => {
		setSelectedField(newField);
		setExpandedQuestions(new Set());
		navigate({
			to: "/dashboard/interview/questions" as string,
			search: {
				field: newField,
				type: selectedType,
				difficulty: selectedDifficulty,
			},
			replace: true,
		} as unknown as Parameters<typeof navigate>[0]);
	};

	// Update URL when type changes
	const handleTypeChange = (newType: string | undefined) => {
		const finalType = newType === selectedType ? undefined : newType;
		setSelectedType(finalType);
		navigate({
			to: "/dashboard/interview/questions" as string,
			search: {
				field: selectedField,
				type: finalType,
				difficulty: selectedDifficulty,
			},
			replace: true,
		} as unknown as Parameters<typeof navigate>[0]);
	};

	// Update URL when difficulty changes
	const handleDifficultyChange = (newDifficulty: string | undefined) => {
		const finalDifficulty = newDifficulty === selectedDifficulty ? undefined : newDifficulty;
		setSelectedDifficulty(finalDifficulty);
		navigate({
			to: "/dashboard/interview/questions" as string,
			search: {
				field: selectedField,
				type: selectedType,
				difficulty: finalDifficulty,
			},
			replace: true,
		} as unknown as Parameters<typeof navigate>[0]);
	};

	// Start random practice
	const startRandomPractice = () => {
		navigate({
			to: "/dashboard/interview/chatbot",
			search: {
				mode: "quick_practice",
				field: selectedField as "healthcare" | "industrial" | "hse" | "general",
			},
		});
	};

	// Practice specific question
	const practiceQuestion = (_questionText: string) => {
		navigate({
			to: "/dashboard/interview/chatbot",
			search: {
				mode: "topic_focus",
				field: selectedField as "healthcare" | "industrial" | "hse" | "general",
			},
		});
	};

	return (
		<>
			<DashboardHeader icon={BookOpenIcon} title={t`Questions fréquentes d'entretien`} />

			{/* Hero Section */}
			<motion.div
				className="relative mb-8 overflow-hidden rounded-3xl border border-blue-500/20 p-8 md:p-12"
				style={{
					background:
						"linear-gradient(135deg, oklch(0.7 0.15 250 / 0.15) 0%, oklch(0.65 0.18 280 / 0.1) 50%, oklch(0.6 0.15 310 / 0.08) 100%)",
				}}
				initial={false}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
			>
				{/* Animated background elements */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<motion.div
						className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10 blur-3xl"
						animate={{
							scale: [1, 1.2, 1],
							rotate: [0, 10, 0],
							opacity: [0.5, 0.3, 0.5],
						}}
						transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
					/>
					<motion.div
						className="absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-indigo-500/15 to-blue-500/10 blur-3xl"
						animate={{
							scale: [1.2, 1, 1.2],
							rotate: [0, -10, 0],
							opacity: [0.3, 0.5, 0.3],
						}}
						transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
					/>
				</div>

				<div className="relative z-10">
					<motion.div
						className="mb-3 flex items-center gap-2"
						initial={false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 }}
					>
						<BookOpenIcon className="size-5 text-blue-600 dark:text-blue-400" weight="fill" />
						<span className="font-semibold text-blue-700 text-sm uppercase tracking-wider dark:text-blue-300">
							<Trans>Banque de questions</Trans>
						</span>
					</motion.div>

					<motion.h2
						className="mb-4 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 bg-clip-text font-bold text-3xl text-transparent tracking-tight md:text-4xl lg:text-5xl dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<Trans>Questions fréquentes d'entretien</Trans>
					</motion.h2>

					<motion.p
						className="mb-8 max-w-2xl text-lg text-muted-foreground"
						initial={false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<Trans>
							Explorez les questions par domaine et par type. Chaque question inclut une réponse modèle et des conseils
							pour vous preparer.
						</Trans>
					</motion.p>

					{/* Quick actions */}
					<motion.div
						className="flex flex-wrap items-center gap-4"
						initial={false}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<Link to="/dashboard/interview">
							<Button variant="outline" className="gap-2">
								<ArrowLeftIcon className="size-4" />
								<Trans>Retour</Trans>
							</Button>
						</Link>
						<Button
							onClick={startRandomPractice}
							className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
						>
							<ShuffleIcon className="size-4" />
							<Trans>Pratique aleatoire</Trans>
						</Button>
						<Badge variant="secondary" className="px-3 py-1.5">
							<QuestionIcon className="mr-1.5 size-4" />
							{filteredQuestions.length} <Trans>questions</Trans>
						</Badge>
					</motion.div>
				</div>
			</motion.div>

			{/* Field Tabs */}
			<Tabs value={selectedField} onValueChange={handleFieldChange} className="space-y-6">
				<TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
					{Object.entries(fieldConfig).map(([key, config]) => {
						const FieldIcon = config.icon;
						return (
							<TabsTrigger
								key={key}
								value={key}
								className={cn(
									"flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-primary/5",
								)}
							>
								<FieldIcon className={cn("size-4", config.color)} weight="duotone" />
								<span>{config.label}</span>
							</TabsTrigger>
						);
					})}
				</TabsList>

				{/* Filters */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					{/* Search */}
					<div className="relative flex-1 md:max-w-md">
						<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder={t`Rechercher une question...`}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>

					{/* Type Filter */}
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-muted-foreground text-sm">
							<Trans>Type :</Trans>
						</span>
						{Object.entries(typeConfig).map(([key, config]) => {
							const TypeIcon = config.icon;
							return (
								<Button
									key={key}
									variant={selectedType === key ? "default" : "outline"}
									size="sm"
									className={cn("gap-1.5", selectedType === key && config.bgColor)}
									onClick={() => handleTypeChange(key)}
								>
									<TypeIcon className="size-4" />
									{config.label}
								</Button>
							);
						})}
					</div>
				</div>

				{/* Difficulty Filter */}
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-muted-foreground text-sm">
						<Trans>Difficulte :</Trans>
					</span>
					{Object.entries(difficultyConfig).map(([key, config]) => (
						<Button
							key={key}
							variant={selectedDifficulty === key ? "default" : "outline"}
							size="sm"
							className={cn("gap-1.5", selectedDifficulty === key && config.bgColor)}
							onClick={() => handleDifficultyChange(key)}
						>
							<GraduationCapIcon className="size-4" />
							{config.label}
						</Button>
					))}
				</div>

				{/* Questions Content */}
				{Object.keys(fieldConfig).map((fieldKey) => (
					<TabsContent key={fieldKey} value={fieldKey} className="mt-0">
						<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
							{/* Field Header */}
							<div className="mb-6 flex items-center justify-between">
								<div>
									<h3 className="flex items-center gap-2 font-semibold text-xl">
										{(() => {
											const FieldIcon = fieldConfig[fieldKey].icon;
											return <FieldIcon className={cn("size-6", fieldConfig[fieldKey].color)} weight="duotone" />;
										})()}
										{fieldConfig[fieldKey].label}
									</h3>
									<p className="text-muted-foreground">{fieldConfig[fieldKey].description}</p>
								</div>
							</div>

							{/* Questions List */}
							{isLoading && availableQuestions.length === 0 ? (
								<div className="flex items-center justify-center py-12">
									<div className="animate-pulse text-muted-foreground">
										<Trans>Chargement des questions...</Trans>
									</div>
								</div>
							) : filteredQuestions.length === 0 ? (
								<Card className="border-dashed">
									<CardContent className="flex flex-col items-center justify-center py-12">
										<ListIcon className="mb-4 size-12 text-muted-foreground" />
										<p className="text-muted-foreground">
											<Trans>Aucune question trouvée</Trans>
										</p>
									</CardContent>
								</Card>
							) : (
								<div className="space-y-4">
									{filteredQuestions.map((question, index) => {
										const isExpanded = expandedQuestions.has(question.id);
										const questionType = typeConfig[question.type] || typeConfig.general;
										const questionDifficulty = difficultyConfig[getDifficulty(question.id)];
										const QuestionTypeIcon = questionType.icon;

										return (
											<motion.div
												key={question.id}
												initial={false}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: index * 0.03 }}
											>
												<Card
													className={cn(
														"group overflow-hidden transition-all duration-300",
														isExpanded && "ring-2 ring-primary/20",
													)}
												>
													<CardHeader
														className="cursor-pointer transition-colors hover:bg-muted/30"
														onClick={() => toggleExpand(question.id)}
													>
														<div className="flex items-start justify-between gap-4">
															<div className="flex-1">
																<div className="mb-2 flex flex-wrap items-center gap-2">
																	<Badge className={cn("text-xs", questionType.bgColor, questionType.color)}>
																		<QuestionTypeIcon className="mr-1 size-3" />
																		{questionType.label}
																	</Badge>
																	<Badge
																		variant="outline"
																		className={cn("text-xs", questionDifficulty.bgColor, questionDifficulty.color)}
																	>
																		{questionDifficulty.label}
																	</Badge>
																</div>
																<CardTitle className="text-lg leading-relaxed">{question.question}</CardTitle>
															</div>
															<div className="flex items-center gap-2">
																<Button
																	variant="ghost"
																	size="icon"
																	className="size-8 shrink-0"
																	onClick={(e) => {
																		e.stopPropagation();
																		toggleExpand(question.id);
																	}}
																>
																	{isExpanded ? (
																		<CaretUpIcon className="size-5" />
																	) : (
																		<CaretDownIcon className="size-5" />
																	)}
																</Button>
															</div>
														</div>
													</CardHeader>

													<AnimatePresence>
														{isExpanded && (
															<motion.div
																initial={{ opacity: 0, height: 0 }}
																animate={{ opacity: 1, height: "auto" }}
																exit={{ opacity: 0, height: 0 }}
																transition={{ duration: 0.2 }}
															>
																<CardContent className="space-y-4 border-t pt-4">
																	{/* Sample Answer */}
																	{question.sampleAnswer && (
																		<div className="rounded-lg bg-gradient-to-br from-green-50/80 to-emerald-50/50 p-4 dark:from-green-900/20 dark:to-emerald-900/10">
																			<h4 className="mb-2 flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
																				<CheckCircleIcon className="size-5" weight="duotone" />
																				<Trans>Réponse modèle</Trans>
																			</h4>
																			<p className="text-muted-foreground text-sm leading-relaxed">
																				{question.sampleAnswer}
																			</p>
																		</div>
																	)}

																	{/* Tips */}
																	{question.tips && question.tips.length > 0 && (
																		<div className="rounded-lg bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-4 dark:from-amber-900/20 dark:to-orange-900/10">
																			<h4 className="mb-2 flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
																				<LightbulbIcon className="size-5" weight="fill" />
																				<Trans>Conseils pour répondre</Trans>
																			</h4>
																			<ul className="space-y-2">
																				{question.tips.map((tip, tipIndex) => (
																					<li
																						key={tipIndex}
																						className="flex items-start gap-2 text-muted-foreground text-sm"
																					>
																						<StarIcon className="mt-0.5 size-4 shrink-0 text-amber-500" weight="fill" />
																						<span>{tip}</span>
																					</li>
																				))}
																			</ul>
																		</div>
																	)}
																</CardContent>
																<CardFooter className="flex justify-between border-t bg-muted/30 pt-4">
																	<div className="flex items-center gap-2 text-muted-foreground text-sm">
																		<TrendUpIcon className="size-4" />
																		<span>
																			<Trans>Pratique recommandee</Trans>
																		</span>
																	</div>
																	<Button
																		size="sm"
																		className="gap-2"
																		onClick={() => practiceQuestion(question.question)}
																	>
																		<PlayIcon className="size-4" />
																		<Trans>S'entraîner</Trans>
																	</Button>
																</CardFooter>
															</motion.div>
														)}
													</AnimatePresence>
												</Card>
											</motion.div>
										);
									})}
								</div>
							)}
						</motion.div>
					</TabsContent>
				))}
			</Tabs>

			{/* Quick Links */}
			<section className="mt-12">
				<h3 className="mb-6 flex items-center gap-2 font-semibold text-2xl">
					<SparkleIcon className="size-6 text-primary" weight="duotone" />
					<Trans>Continuer votre preparation</Trans>
				</h3>

				<div className="grid gap-4 md:grid-cols-3">
					<Link to={"/dashboard/interview/tips" as string}>
						<Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
							<CardContent className="flex items-center gap-4 p-6">
								<div className="flex size-14 items-center justify-center rounded-xl bg-amber-100 transition-transform group-hover:scale-110 dark:bg-amber-900/30">
									<LightbulbIcon className="size-7 text-amber-600 dark:text-amber-400" weight="fill" />
								</div>
								<div className="flex-1">
									<h4 className="font-semibold">
										<Trans>Conseils d'entretien</Trans>
									</h4>
									<p className="text-muted-foreground text-sm">
										<Trans>Conseils pour réussir</Trans>
									</p>
								</div>
								<ArrowRightIcon className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
							</CardContent>
						</Card>
					</Link>

					<Link to="/dashboard/interview/chatbot" search={{ mode: "mock_interview" }}>
						<Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
							<CardContent className="flex items-center gap-4 p-6">
								<div className="flex size-14 items-center justify-center rounded-xl bg-purple-100 transition-transform group-hover:scale-110 dark:bg-purple-900/30">
									<ChatCircleDotsIcon className="size-7 text-purple-600 dark:text-purple-400" weight="duotone" />
								</div>
								<div className="flex-1">
									<h4 className="font-semibold">
										<Trans>Simulation d'entretien</Trans>
									</h4>
									<p className="text-muted-foreground text-sm">
										<Trans>Simulation IA complète</Trans>
									</p>
								</div>
								<ArrowRightIcon className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
							</CardContent>
						</Card>
					</Link>

					<Link to="/dashboard/interview">
						<Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
							<CardContent className="flex items-center gap-4 p-6">
								<div className="flex size-14 items-center justify-center rounded-xl bg-green-100 transition-transform group-hover:scale-110 dark:bg-green-900/30">
									<CheckCircleIcon className="size-7 text-green-600 dark:text-green-400" weight="duotone" />
								</div>
								<div className="flex-1">
									<h4 className="font-semibold">
										<Trans>Espace entretien</Trans>
									</h4>
									<p className="text-muted-foreground text-sm">
										<Trans>Tous les outils de preparation</Trans>
									</p>
								</div>
								<ArrowRightIcon className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
							</CardContent>
						</Card>
					</Link>
				</div>
			</section>

			{/* Stats Card */}
			<section className="mt-8">
				<Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
					<CardContent className="flex flex-col items-center justify-between gap-6 p-6 md:flex-row">
						<div className="flex items-center gap-4">
							<div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
								<GraduationCapIcon className="size-8 text-primary" weight="duotone" />
							</div>
							<div>
								<h4 className="font-semibold text-lg">
									<Trans>Prêt pour votre prochain entretien ?</Trans>
								</h4>
								<p className="text-muted-foreground">
									<Trans>Demarrer une session personnalisee maintenant</Trans>
								</p>
							</div>
						</div>
						<Link
							to="/dashboard/interview/chatbot"
							search={{
								mode: "quick_practice",
								field: selectedField as "healthcare" | "industrial" | "hse" | "general",
							}}
						>
							<Button
								size="lg"
								className="gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90"
							>
								<PlayIcon className="size-5" weight="fill" />
								<Trans>Demarrer la pratique</Trans>
							</Button>
						</Link>
					</CardContent>
				</Card>
			</section>
		</>
	);
}
