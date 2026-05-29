import { t } from "@lingui/core/macro";
import {
	BriefcaseIcon,
	CameraIcon,
	CloudSunIcon,
	DesktopIcon,
	FirstAidKitIcon,
	HandIcon,
	LampIcon,
	PaintBrushIcon,
	PaletteIcon,
	SnowflakeIcon,
	SparkleIcon,
	SunIcon,
	TShirtIcon,
	WatchIcon,
} from "@phosphor-icons/react";

import type {
	AccessoryCategory,
	ChecklistItem,
	CultureQuestion,
	DoOrDont,
	IndustryConfig,
	SeasonConfig,
	VirtualTip,
} from "./outfit-types";

function getIndustryConfigs(): IndustryConfig[] {
	return [
		{
			id: "corporate",
			label: t`Entreprise / Finance`,
			icon: BriefcaseIcon,
			color: "text-blue-600",
			bgColor: "bg-blue-100 dark:bg-blue-900/30",
			description: "Banques, cabinets de conseil, assurances, grandes entreprises",
			formalityLevel: "formal",
			dressCode: "Tenue formelle et sobre. L'apparence professionnelle est primordiale.",
			menOutfit: [
				"Costume sombre (bleu marine, gris anthracite, noir)",
				"Chemise blanche ou bleu clair, bien repassée",
				"Cravate sobre et elegante",
				"Chaussures en cuir cirees (noires ou marron fonce)",
				"Ceinture assortie aux chaussures",
				"Montre classique et discrete",
			],
			womenOutfit: [
				"Tailleur pantalon ou jupe (couleurs neutres)",
				"Chemisier ou haut elegant",
				"Jupe au genou ou pantalon habille",
				"Escarpins a talon moyen (3-6 cm)",
				"Bijoux discrets et professionnels",
				"Sac structure et professionnel",
			],
			colors: ["Bleu marine", "Gris anthracite", "Noir", "Blanc", "Bordeaux discret"],
			avoid: [
				"Couleurs trop vives ou voyantes",
				"Vetements trop serres ou decolletes",
				"Baskets ou chaussures de sport",
				"Bijoux trop voyants",
				"Parfums forts",
			],
			tips: [
				"Privilegiez la qualite plutot que la quantite",
				"Les vetements doivent etre parfaitement ajustes",
				"Préparez votre tenue la veille",
				"Verifiez les plis et les taches",
			],
		},
		{
			id: "tech",
			label: t`Technologie / Startup`,
			icon: DesktopIcon,
			color: "text-purple-600",
			bgColor: "bg-purple-100 dark:bg-purple-900/30",
			description: "Entreprises tech, startups, agences digitales",
			formalityLevel: "casual",
			dressCode: "Style smart casual. L'accent est mis sur le confort et l'authenticite.",
			menOutfit: [
				"Jean fonce ou chino de qualite",
				"Polo ou chemise decontractee",
				"Pull ou cardigan (facultatif)",
				"Chaussures propres (mocassins, derbies, baskets premium)",
				"Cravate non necessaire",
				"Montre connectee sobre ou montre classique",
			],
			womenOutfit: [
				"Jean fonce ou pantalon chic",
				"Chemisier ou haut elegant",
				"Blazer decontracte (facultatif)",
				"Ballerines, bottines ou baskets premium",
				"Accessoires modernes et discrets",
				"Sac fonctionnel",
			],
			colors: ["Bleu", "Gris", "Blanc", "Noir", "Couleurs discretes acceptees"],
			avoid: [
				"Tenue trop formelle (costume strict)",
				"Vetements froisses ou uses",
				"Logos trop grands",
				"Tenue trop decontractee (short, tongs)",
			],
			tips: [
				"Renseignez-vous sur la culture de l'entreprise sur LinkedIn",
				"Visez un niveau au-dessus de la tenue quotidienne de l'entreprise",
				"Montrez votre personnalite avec subtilite",
				"La propreté et le soin restent essentiels",
			],
		},
		{
			id: "creative",
			label: t`Creatif / Design / Media`,
			icon: PaintBrushIcon,
			color: "text-pink-600",
			bgColor: "bg-pink-100 dark:bg-pink-900/30",
			description: "Agences de design, mode, publicite, media",
			formalityLevel: "variable",
			dressCode: "Exprimez votre creativite tout en restant professionnel.",
			menOutfit: [
				"Pantalon ajuste ou jean createur",
				"Chemise a motifs subtils ou couleur unie originale",
				"Blazer souple ou veste en denim de qualite",
				"Chaussures design ou baskets haut de gamme",
				"Accessoires distinctifs (montre design, lunettes)",
			],
			womenOutfit: [
				"Tenue avec une piece forte et originale",
				"Melange de textures et de styles",
				"Robe createur ou ensemble coordonne",
				"Chaussures avec du caractere",
				"Bijoux artisanaux ou design",
				"Sac createur ou vintage de qualite",
			],
			colors: ["Palette variee", "Combinaisons audacieuses mais harmonieuses", "Noir classique toujours accepte"],
			avoid: [
				"Tenue trop conventionnelle ou fade",
				"Fast fashion trop visible",
				"Manque d'effort evident",
				"Excentricite excessive",
			],
			tips: [
				"Votre tenue fait partie de votre portfolio",
				"Montrez votre sens esthetique",
				"Restez fidele a votre style personnel",
				"Privilegiez les pieces de qualite",
			],
		},
		{
			id: "healthcare",
			label: t`Santé / Médical`,
			icon: FirstAidKitIcon,
			color: "text-red-600",
			bgColor: "bg-red-100 dark:bg-red-900/30",
			description: "Hopitaux, cliniques, cabinets medicaux, laboratoires",
			formalityLevel: "professional",
			dressCode: "Tenue professionnelle, propre et hygienique. L'image de confiance est essentielle.",
			menOutfit: [
				"Pantalon habille ou chino propre",
				"Chemise unie (blanche, bleu clair)",
				"Cravate facultative mais recommandee pour les postes administratifs",
				"Chaussures fermees et confortables",
				"Blouse blanche si necessaire",
			],
			womenOutfit: [
				"Pantalon ou jupe professionnelle",
				"Chemisier ou haut simple",
				"Cardigan ou blazer",
				"Chaussures fermees et confortables",
				"Cheveux attaches pour les roles cliniques",
				"Maquillage naturel et discret",
			],
			colors: ["Blanc", "Bleu clair", "Gris", "Couleurs pastel discretes"],
			avoid: [
				"Ongles longs ou vernis",
				"Bijoux pendants (hygiene)",
				"Parfums forts (allergies des patients)",
				"Tissus synthetiques",
				"Decolletes",
			],
			tips: [
				"L'hygiene est absolument primordiale",
				"Ongles courts et propres",
				"Cheveux propres, attaches s'ils sont longs",
				"Evitez tout ce qui pourrait deranger les patients",
			],
		},
	];
}

export const industryConfigs: IndustryConfig[] = new Proxy([] as IndustryConfig[], {
	get(_target, prop) {
		const data = getIndustryConfigs();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

function getSeasonConfigs(): SeasonConfig[] {
	return [
		{
			id: "summer",
			label: t`Ete / Temps chaud`,
			icon: SunIcon,
			color: "text-amber-500",
			tips: [
				"Choisissez des tissus respirants (coton, lin)",
				"Choisissez des couleurs claires qui refletent la chaleur",
				"Evitez les tissus synthetiques qui font transpirer",
				"Prevoyez une veste legere pour la climatisation",
				"Utilisez un anti-transpirant efficace",
				"Arrivez quelques minutes en avance pour vous rafraichir",
				"Gardez des mouchoirs pour absorber la transpiration",
				"Évitez les sandales ouvertes même par temps chaud",
			],
		},
		{
			id: "winter",
			label: t`Hiver / Temps froid`,
			icon: SnowflakeIcon,
			color: "text-blue-500",
			tips: [
				"Portez un manteau elegant sur votre tenue",
				"Choisissez des tissus chauds (laine, cachemire)",
				"Les couleurs foncees sont adaptees",
				"Prevoyez des chaussures de rechange en cas de neige ou pluie",
				"Arrivez en avance pour retirer votre manteau calmement",
				"Evitez les bonnets qui abiment la coiffure",
				"Les echarpes elegantes sont acceptables",
				"Gardez des gants dans votre sac",
			],
		},
		{
			id: "transition",
			label: t`Mi-saison`,
			icon: CloudSunIcon,
			color: "text-teal-500",
			tips: [
				"Optez pour des couches faciles a ajuster",
				"Un blazer ou cardigan est ideal",
				"Vérifiez la météo le matin même",
				"Prevoyez un parapluie compact",
				"Les couleurs intermediaires fonctionnent bien",
				"Préparez une tenue adaptable",
				"Evitez les tissus trop epais ou trop fins",
				"Un trench est un choix elegant",
			],
		},
	];
}

export const seasonConfigs: SeasonConfig[] = new Proxy([] as SeasonConfig[], {
	get(_target, prop) {
		const data = getSeasonConfigs();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

function getVirtualInterviewTips(): VirtualTip[] {
	return [
		{
			id: "lighting",
			title: t`Eclairage`,
			description: t`Un bon éclairage est essentiel pour paraître professionnel`,
			icon: LampIcon,
			tips: [
				"Placez une source de lumiere face a vous, jamais derriere",
				"La lumiere naturelle est ideale (pres d'une fenetre)",
				"Evitez les ombres sur votre visage",
				"Testez votre éclairage avant l'entretien",
				"Evitez les neons qui jaunissent le teint",
			],
		},
		{
			id: "background",
			title: t`Arriere-plan`,
			description: t`Votre environnement reflete votre professionnalisme`,
			icon: PaletteIcon,
			tips: [
				"Choisissez un arriere-plan neutre et range",
				"Un mur uni est ideal",
				"Evitez les espaces encombrees ou trop personnels",
				"Une bibliotheque bien rangee est acceptable",
				"Assurez-vous qu'il n'y a pas de distraction visuelle",
				"Testez le flou d'arriere-plan si disponible",
			],
		},
		{
			id: "camera",
			title: t`Angle de camera`,
			description: t`Positionnez votre camera pour une image professionnelle`,
			icon: CameraIcon,
			tips: [
				"La camera doit etre a hauteur des yeux",
				"Surelevez l'ordinateur avec des livres si necessaire",
				"Gardez une distance adaptee (tete et epaules visibles)",
				"Regardez la camera, pas l'ecran, quand vous parlez",
				"Cadrez-vous au centre de l'image",
				"Verifiez que votre visage est bien eclaire et net",
			],
		},
		{
			id: "attire",
			title: t`Tenue en visio`,
			description: t`Conseils spécifiques pour les entretiens vidéo`,
			icon: TShirtIcon,
			tips: [
				"Portez une tenue complète, pas seulement le haut",
				"Evitez les motifs fins qui creent un effet moire",
				"Les couleurs unies passent mieux à la caméra",
				"Evitez le blanc pur qui peut etre eblouissant",
				"Habillez-vous comme pour un entretien en présentiel",
				"Testez votre tenue a la camera avant l'entretien",
			],
		},
	];
}

export const virtualInterviewTips: VirtualTip[] = new Proxy([] as VirtualTip[], {
	get(_target, prop) {
		const data = getVirtualInterviewTips();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

function getDosList(): DoOrDont[] {
	return [
		{ text: t`Préparez votre tenue la veille de l'entretien`, category: "general" },
		{ text: t`Assurez-vous que vos vêtements sont propres et repassés`, category: "general" },
		{ text: t`Choisissez des vetements dans lesquels vous etes a l'aise`, category: "general" },
		{ text: t`Adaptez votre tenue a la culture de l'entreprise`, category: "general" },
		{ text: t`Portez des chaussures propres et cirees`, category: "general" },
		{ text: t`Soignez votre hygiene personnelle`, category: "general" },
		{ text: t`Optez pour un maquillage naturel et professionnel`, category: "women" },
		{ text: t`Choisissez des bijoux discrets et elegants`, category: "women" },
		{ text: t`Rasez-vous ou taillez soigneusement votre barbe`, category: "men" },
		{ text: t`Portez des chaussettes assorties aux chaussures`, category: "men" },
	];
}

export const dosList: DoOrDont[] = new Proxy([] as DoOrDont[], {
	get(_target, prop) {
		const data = getDosList();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

function getDontsList(): DoOrDont[] {
	return [
		{ text: t`Ne portez pas de vetements froisses ou taches`, category: "general" },
		{ text: t`Evitez les parfums ou eaux de toilette trop forts`, category: "general" },
		{ text: t`Ne portez pas de vetements trop serres ou trop larges`, category: "general" },
		{ text: t`Evitez les couleurs trop vives ou les motifs extravagants`, category: "general" },
		{ text: t`Ne portez pas de baskets ou de tongs`, category: "general" },
		{ text: t`Evitez les bijoux bruyants ou volumineux`, category: "general" },
		{ text: t`Evitez les decolletes plongeants`, category: "women" },
		{ text: t`Evitez les jupes trop courtes (au-dessus du genou)`, category: "women" },
		{ text: t`Ne portez pas de cravate a motifs humoristiques`, category: "men" },
		{ text: t`Evitez les chaussettes blanches avec un costume`, category: "men" },
	];
}

export const dontsList: DoOrDont[] = new Proxy([] as DoOrDont[], {
	get(_target, prop) {
		const data = getDontsList();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

function getPreparationChecklist(): ChecklistItem[] {
	return [
		{
			id: "outfit-1",
			title: t`Choisir la tenue complète`,
			description: t`Selectionnez tous les elements de votre tenue (vetements, chaussures, accessoires)`,
		},
		{
			id: "outfit-2",
			title: t`Essayer la tenue`,
			description: t`Assurez-vous que tout vous va bien et que vous etes a l'aise`,
		},
		{
			id: "outfit-3",
			title: t`Verifier l'etat des vetements`,
			description: t`Assurez-vous qu'il n'y a ni tache, ni trou, ni bouton manquant`,
		},
		{
			id: "outfit-4",
			title: t`Repasser les vêtements`,
			description: t`Repassez chemise, pantalon et veste si nécessaire`,
		},
		{
			id: "outfit-5",
			title: t`Nettoyer les chaussures`,
			description: t`Cirez et brossez vos chaussures pour un rendu impeccable`,
		},
		{
			id: "outfit-6",
			title: t`Preparer les accessoires`,
			description: t`Ceinture, montre, bijoux discrets, sac professionnel`,
		},
		{
			id: "outfit-7",
			title: t`Verifier la meteo`,
			description: t`Adaptez votre tenue aux conditions meteo`,
		},
		{
			id: "outfit-8",
			title: t`Preparer un kit d'urgence`,
			description: t`Fil et aiguille, boutons de rechange, lingettes detachantes`,
		},
	];
}

export const preparationChecklist: ChecklistItem[] = new Proxy([] as ChecklistItem[], {
	get(_target, prop) {
		const data = getPreparationChecklist();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

function getAccessoryCategories(): AccessoryCategory[] {
	return [
		{
			id: "watches",
			title: t`Montres`,
			icon: WatchIcon,
			items: [
				t`Optez pour une montre classique et discrete`,
				t`Evitez les montres de sport ou trop voyantes`,
				t`Une montre connectee sobre est acceptable en tech`,
				t`Le bracelet doit etre en bon etat`,
				t`Assurez-vous que l'heure est correcte`,
			],
		},
		{
			id: "bags",
			title: t`Sacs et porte-documents`,
			icon: BriefcaseIcon,
			items: [
				t`Choisissez un sac professionnel et structure`,
				t`Un cuir ou simili cuir de qualite est preferable`,
				t`Evitez les sacs a dos trop decontractes`,
				t`Gardez votre sac propre et organise`,
				t`Un porte-documents classique convient aux secteurs formels`,
			],
		},
		{
			id: "jewelry",
			title: t`Bijoux`,
			icon: SparkleIcon,
			items: [
				t`Limitez-vous a quelques pieces discretes`,
				t`Les petites boucles d'oreilles sont preferables`,
				t`Une alliance ou bague simple est acceptable`,
				t`Evitez les colliers volumineux`,
				t`Les piercings visibles peuvent etre mal percus selon le secteur`,
			],
		},
		{
			id: "grooming",
			title: t`Soin personnel`,
			icon: HandIcon,
			items: [
				t`Ongles propres et courts`,
				t`Coiffure soignee et professionnelle`,
				t`Maquillage naturel et discret`,
				t`Barbe taillee ou rasage soigne`,
				t`Haleine fraîche (évitez l'ail et l'oignon la veille)`,
			],
		},
	];
}

export const accessoryCategories: AccessoryCategory[] = new Proxy([] as AccessoryCategory[], {
	get(_target, prop) {
		const data = getAccessoryCategories();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});

function getCultureQuestions(): CultureQuestion[] {
	return [
		{
			id: "q1",
			question: t`Quel est le secteur de l'entreprise ?`,
			options: [
				{ value: "finance", label: t`Finance / Banque / Assurance`, formalityScore: 5 },
				{ value: "legal", label: t`Juridique / Cabinet d'avocats`, formalityScore: 5 },
				{ value: "healthcare", label: t`Santé / Médical`, formalityScore: 4 },
				{ value: "corporate", label: t`Grande entreprise / Industrie`, formalityScore: 4 },
				{ value: "tech", label: t`Technologie / Startup`, formalityScore: 2 },
				{ value: "creative", label: t`Design / Media / Communication`, formalityScore: 2 },
				{ value: "education", label: t`Education / Formation`, formalityScore: 3 },
				{ value: "retail", label: t`Commerce / Distribution`, formalityScore: 3 },
			],
		},
		{
			id: "q2",
			question: t`Quelle est la taille de l'entreprise ?`,
			options: [
				{ value: "large", label: t`Grande entreprise (500+ employes)`, formalityScore: 4 },
				{ value: "medium", label: t`Entreprise moyenne (50-500 employes)`, formalityScore: 3 },
				{ value: "small", label: t`Petite entreprise (10-50 employes)`, formalityScore: 2 },
				{ value: "startup", label: t`Startup (moins de 10 employes)`, formalityScore: 1 },
			],
		},
		{
			id: "q3",
			question: t`Quel type de poste visez-vous ?`,
			options: [
				{ value: "executive", label: t`Direction / Management senior`, formalityScore: 5 },
				{ value: "manager", label: t`Management intermediaire`, formalityScore: 4 },
				{ value: "professional", label: t`Professionnel / Expert`, formalityScore: 3 },
				{ value: "entry", label: t`Débutant / Junior`, formalityScore: 2 },
				{ value: "intern", label: t`Stage / Alternance`, formalityScore: 2 },
			],
		},
		{
			id: "q4",
			question: t`Avec qui passez-vous l'entretien ?`,
			options: [
				{ value: "ceo", label: t`Direction generale / CEO`, formalityScore: 5 },
				{ value: "hr", label: t`Ressources humaines`, formalityScore: 4 },
				{ value: "manager", label: t`Futur manager direct`, formalityScore: 3 },
				{ value: "team", label: t`Equipe / Futurs collegues`, formalityScore: 2 },
				{ value: "technical", label: t`Entretien technique`, formalityScore: 2 },
			],
		},
	];
}

export const cultureQuestions: CultureQuestion[] = new Proxy([] as CultureQuestion[], {
	get(_target, prop) {
		const data = getCultureQuestions();
		if (prop === Symbol.iterator) return () => data[Symbol.iterator]();
		return (data as unknown as Record<string | symbol, unknown>)[prop];
	},
});
