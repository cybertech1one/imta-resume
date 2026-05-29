import type { Exercise } from "./confidence-types";

// Breathing exercises
export const breathingExercises: Exercise[] = [
	{
		id: "breath-4-7-8",
		category: "breathing",
		title: "4-7-8 Breathing",
		titleFr: "Respiration 4-7-8",
		description: "A calming technique to reduce anxiety and promote relaxation",
		descriptionFr: "Une technique apaisante pour réduire l'anxiété et favoriser la relaxation",
		duration: 180,
		steps: [
			"Exhale completely through your mouth",
			"Inhale quietly through your nose for 4 seconds",
			"Hold your breath for 7 seconds",
			"Exhale completely through your mouth for 8 seconds",
			"Repeat this cycle 4 times",
		],
		stepsFr: [
			"Expirez complètement par la bouche",
			"Inspirez tranquillement par le nez pendant 4 secondes",
			"Retenez votre souffle pendant 7 secondes",
			"Expirez complètement par la bouche pendant 8 secondes",
			"Répétez ce cycle 4 fois",
		],
	},
	{
		id: "breath-box",
		category: "breathing",
		title: "Box Breathing",
		titleFr: "Respiration Carrée",
		description: "Used by Navy SEALs to stay calm under pressure",
		descriptionFr: "Utilisée par les Navy SEALs pour rester calme sous pression",
		duration: 240,
		steps: [
			"Inhale for 4 seconds",
			"Hold for 4 seconds",
			"Exhale for 4 seconds",
			"Hold for 4 seconds",
			"Repeat for 4-6 cycles",
		],
		stepsFr: [
			"Inspirez pendant 4 secondes",
			"Retenez pendant 4 secondes",
			"Expirez pendant 4 secondes",
			"Retenez pendant 4 secondes",
			"Répétez 4 à 6 cycles",
		],
	},
	{
		id: "breath-belly",
		category: "breathing",
		title: "Belly Breathing",
		titleFr: "Respiration Abdominale",
		description: "Deep diaphragmatic breathing for relaxation",
		descriptionFr: "Respiration diaphragmatique profonde pour la relaxation",
		duration: 300,
		steps: [
			"Place one hand on your chest, one on your belly",
			"Breathe in slowly through your nose, feeling your belly rise",
			"Keep your chest still",
			"Exhale slowly through pursed lips",
			"Feel your belly lower",
			"Repeat for 5-10 minutes",
		],
		stepsFr: [
			"Placez une main sur votre poitrine, une sur votre ventre",
			"Inspirez lentement par le nez, sentez votre ventre se soulever",
			"Gardez votre poitrine immobile",
			"Expirez lentement par les lèvres pincées",
			"Sentez votre ventre s'abaisser",
			"Répétez pendant 5 à 10 minutes",
		],
	},
	{
		id: "breath-energizing",
		category: "breathing",
		title: "Energizing Breath",
		titleFr: "Respiration Énergisante",
		description: "Quick breathing to boost energy before an interview",
		descriptionFr: "Respiration rapide pour booster l'énergie avant un entretien",
		duration: 120,
		steps: [
			"Take 3 quick, short breaths through your nose",
			"Followed by one long exhale through the mouth",
			"Repeat this pattern 10 times",
			"Take a moment to notice the energy surge",
		],
		stepsFr: [
			"Prenez 3 respirations rapides et courtes par le nez",
			"Suivies d'une longue expiration par la bouche",
			"Répétez ce schéma 10 fois",
			"Prenez un moment pour remarquer le regain d'énergie",
		],
	},
];

// Positive affirmations
export const affirmations = [
	{
		id: "aff-1",
		text: "Je suis compétent et bien préparé pour cette opportunité",
		category: "preparation",
	},
	{
		id: "aff-2",
		text: "Ma formation à l'IMTA m'a donné des compétences solides",
		category: "competences",
	},
	{
		id: "aff-3",
		text: "Je mérite ce poste et je vais le prouver",
		category: "confiance",
	},
	{
		id: "aff-4",
		text: "Je reste calme et concentré sous pression",
		category: "calme",
	},
	{
		id: "aff-5",
		text: "Chaque entretien est une occasion d'apprendre",
		category: "progression",
	},
	{
		id: "aff-6",
		text: "Je communique clairement et avec assurance",
		category: "communication",
	},
	{
		id: "aff-7",
		text: "Mes expériences de stage m'ont préparé pour ce moment",
		category: "experience",
	},
	{
		id: "aff-8",
		text: "Je suis capable de surmonter chaque défi",
		category: "resilience",
	},
	{
		id: "aff-9",
		text: "Ma passion pour mon métier se voit dans mes réponses",
		category: "passion",
	},
	{
		id: "aff-10",
		text: "Je dégage une énergie positive et professionnelle",
		category: "energie",
	},
	{
		id: "aff-11",
		text: "Je suis prêt à montrer la meilleure version de moi-même",
		category: "preparation",
	},
	{
		id: "aff-12",
		text: "Le stress est mon allié, il me rend plus attentif",
		category: "stress",
	},
	{
		id: "aff-13",
		text: "J'ai confiance en ma préparation et en mes capacités",
		category: "confiance",
	},
	{
		id: "aff-14",
		text: "Chaque question est une chance de me mettre en valeur",
		category: "opportunite",
	},
	{
		id: "aff-15",
		text: "Je suis reconnaissant pour cette opportunité",
		category: "gratitude",
	},
];

// Power poses
export const powerPoses: Exercise[] = [
	{
		id: "pose-wonder-woman",
		category: "power_poses",
		title: "Wonder Woman Pose",
		titleFr: "Pose Wonder Woman",
		description: "Stand tall with hands on hips, feet apart",
		descriptionFr: "Tenez-vous droit avec les mains sur les hanches, pieds écartés",
		duration: 120,
		steps: [
			"Stand with feet shoulder-width apart",
			"Place hands firmly on your hips",
			"Keep your chin up and chest out",
			"Hold for 2 minutes while breathing deeply",
		],
		stepsFr: [
			"Tenez-vous debout, pieds écartés à la largeur des épaules",
			"Placez fermement les mains sur vos hanches",
			"Gardez le menton levé et la poitrine sortie",
			"Maintenez 2 minutes en respirant profondément",
		],
	},
	{
		id: "pose-victory",
		category: "power_poses",
		title: "Victory Pose",
		titleFr: "Pose de la Victoire",
		description: "Arms raised in a V shape above your head",
		descriptionFr: "Bras levés en forme de V au-dessus de la tête",
		duration: 120,
		steps: [
			"Stand tall with feet apart",
			"Raise both arms above your head in a V",
			"Keep your chest open and shoulders back",
			"Smile and feel the energy",
			"Hold for 2 minutes",
		],
		stepsFr: [
			"Tenez-vous droit avec les pieds écartés",
			"Levez les deux bras au-dessus de la tête en V",
			"Gardez la poitrine ouverte et les épaules en arrière",
			"Souriez et ressentez l'énergie",
			"Maintenez pendant 2 minutes",
		],
	},
	{
		id: "pose-ceo",
		category: "power_poses",
		title: "CEO Pose",
		titleFr: "Pose du PDG",
		description: "Seated with hands behind head, feet on desk",
		descriptionFr: "Assis avec les mains derrière la tête",
		duration: 120,
		steps: [
			"Sit comfortably in a chair",
			"Lean back slightly",
			"Place hands behind your head",
			"If possible, elevate your feet",
			"Hold for 2 minutes",
		],
		stepsFr: [
			"Asseyez-vous confortablement sur une chaise",
			"Penchez-vous légèrement en arrière",
			"Placez les mains derrière la tête",
			"Si possible, surélevez vos pieds",
			"Maintenez pendant 2 minutes",
		],
	},
	{
		id: "pose-performer",
		category: "power_poses",
		title: "Performer Pose",
		titleFr: "Pose du Performeur",
		description: "Wide stance with arms outstretched",
		descriptionFr: "Position large avec les bras étendus",
		duration: 120,
		steps: [
			"Stand with feet wide apart",
			"Extend arms out to the sides",
			"Palms facing forward",
			"Take up as much space as possible",
			"Hold for 2 minutes",
		],
		stepsFr: [
			"Tenez-vous debout avec les pieds très écartés",
			"Étendez les bras sur les côtés",
			"Paumes vers l'avant",
			"Occupez autant d'espace que possible",
			"Maintenez pendant 2 minutes",
		],
	},
];

// Visualization exercises
export const visualizationExercises: Exercise[] = [
	{
		id: "viz-success",
		category: "visualization",
		title: "Interview Success",
		titleFr: "Succès de l'entretien",
		description: "Visualize yourself succeeding in the interview",
		descriptionFr: "Visualisez-vous réussir l'entretien",
		duration: 300,
		steps: [
			"Close your eyes and take 3 deep breaths",
			"Imagine walking into the interview room confidently",
			"See yourself shaking hands with the interviewer",
			"Visualize answering questions clearly and calmly",
			"Picture the interviewer nodding and smiling",
			"Feel the satisfaction of a successful interview",
			"Open your eyes and carry this feeling with you",
		],
		stepsFr: [
			"Fermez les yeux et prenez 3 respirations profondes",
			"Imaginez-vous entrer dans la salle d'entretien avec confiance",
			"Voyez-vous serrer la main du recruteur",
			"Visualisez-vous répondre aux questions clairement et calmement",
			"Imaginez le recruteur hochant la tête et souriant",
			"Ressentez la satisfaction d'un entretien réussi",
			"Ouvrez les yeux et gardez ce sentiment avec vous",
		],
	},
	{
		id: "viz-calm-place",
		category: "visualization",
		title: "Safe Place",
		titleFr: "Lieu sûr",
		description: "Create a mental sanctuary for instant calm",
		descriptionFr: "Créez un sanctuaire mental pour un calme instantané",
		duration: 240,
		steps: [
			"Close your eyes and breathe deeply",
			"Imagine a place where you feel completely safe",
			"Notice the colors, sounds, and smells",
			"Feel the temperature and textures",
			"Let peace wash over you",
			"Remember: you can return here anytime",
		],
		stepsFr: [
			"Fermez les yeux et respirez profondément",
			"Imaginez un endroit où vous vous sentez complètement en sécurité",
			"Remarquez les couleurs, les sons et les odeurs",
			"Ressentez la température et les textures",
			"Laissez la paix vous envahir",
			"Rappelez-vous : vous pouvez y revenir à tout moment",
		],
	},
	{
		id: "viz-future-self",
		category: "visualization",
		title: "Future Self",
		titleFr: "Vous dans le Futur",
		description: "Connect with your successful future self",
		descriptionFr: "Connectez-vous avec votre futur vous accompli",
		duration: 300,
		steps: [
			"Close your eyes and relax",
			"Imagine yourself 1 year from now, successful in your career",
			"What does this future you look like?",
			"What advice does your future self give you?",
			"Feel the confidence of knowing success is coming",
			"Thank your future self and return to the present",
		],
		stepsFr: [
			"Fermez les yeux et détendez-vous",
			"Imaginez-vous dans 1 an, réussissant dans votre carrière",
			"À quoi ressemble ce futur vous ?",
			"Quel conseil votre futur vous donne-t-il ?",
			"Ressentez la confiance de savoir que le succès arrive",
			"Remerciez votre futur vous et revenez au présent",
		],
	},
];

// Anxiety management tips
export const anxietyTips = [
	{
		id: "anx-1",
		title: "5 Senses Technique",
		titleFr: "Technique des 5 Sens",
		description: "Grounding technique to reduce anxiety",
		descriptionFr: "Technique d'ancrage pour réduire l'anxiété",
		steps: [
			"5 things you can see",
			"4 things you can touch",
			"3 things you can hear",
			"2 things you can smell",
			"1 thing you can taste",
		],
		stepsFr: [
			"5 choses que vous pouvez voir",
			"4 choses que vous pouvez toucher",
			"3 choses que vous pouvez entendre",
			"2 choses que vous pouvez sentir",
			"1 chose que vous pouvez goûter",
		],
	},
	{
		id: "anx-2",
		title: "Negative Reframing",
		titleFr: "Recadrage négatif",
		description: "Transform negative thoughts into positive ones",
		descriptionFr: "Transformez les pensées négatives en positives",
		steps: [
			"Identify the negative thought",
			"Ask: is this a fact or an interpretation?",
			"Find a positive alternative",
			"Repeat the new thought",
		],
		stepsFr: [
			"Identifiez la pensée négative",
			"Demandez-vous : est-ce un fait ou une interprétation ?",
			"Trouvez une alternative positive",
			"Répétez la nouvelle pensée",
		],
	},
	{
		id: "anx-3",
		title: "Progressive Muscle Relaxation",
		titleFr: "Relaxation Musculaire Progressive",
		description: "Release physical tension systematically",
		descriptionFr: "Libérez la tension physique systématiquement",
		steps: [
			"Start with your feet - tense then release",
			"Move up to calves, thighs, abdomen",
			"Continue with hands, arms, shoulders",
			"Finish with face and scalp",
			"Feel the total relaxation",
		],
		stepsFr: [
			"Commencez par les pieds : contractez puis relâchez",
			"Remontez vers les mollets, les cuisses, l'abdomen",
			"Continuez avec les mains, les bras, les épaules",
			"Terminez par le visage et le cuir chevelu",
			"Ressentez la relaxation complète",
		],
	},
	{
		id: "anx-4",
		title: "STOP Technique",
		titleFr: "Technique STOP",
		description: "Quick method to interrupt anxious thoughts",
		descriptionFr: "Méthode rapide pour interrompre les pensées anxieuses",
		steps: [
			"S - Stop: Stop what you are doing",
			"T - Take a breath: Breathe deeply",
			"O - Observe: Observe your thoughts without judgment",
			"P - Proceed: Continue with presence",
		],
		stepsFr: [
			"S - Stop : arrêtez ce que vous faites",
			"T - Take a breath : respirez profondément",
			"O - Observe : observez vos pensées sans jugement",
			"P - Proceed : continuez avec présence",
		],
	},
	{
		id: "anx-5",
		title: "Anti-Stress Preparation",
		titleFr: "Préparation anti-stress",
		description: "Prepare the night before to reduce morning anxiety",
		descriptionFr: "Préparez la veille pour réduire l'anxiété du matin",
		steps: [
			"Prepare your clothes the night before",
			"Organize your documents in a folder",
			"Check the route and travel time",
			"Go to bed early and avoid screens",
			"Prepare a healthy breakfast",
		],
		stepsFr: [
			"Préparez vos vêtements la veille",
			"Organisez vos documents dans un dossier",
			"Vérifiez le trajet et le temps de transport",
			"Couchez-vous tôt et évitez les écrans",
			"Préparez un petit-déjeuner sain",
		],
	},
];

// Default exercise stats
export const defaultExerciseStats: {
	totalCompleted: number;
	streak: number;
	lastCompletedDate: string | null;
	categoryProgress: Record<
		"breathing" | "affirmations" | "power_poses" | "visualization" | "anxiety_management",
		number
	>;
} = {
	totalCompleted: 0,
	streak: 0,
	lastCompletedDate: null,
	categoryProgress: {
		breathing: 0,
		affirmations: 0,
		power_poses: 0,
		visualization: 0,
		anxiety_management: 0,
	},
};

// Meditation duration options (in seconds)
export const meditationDurations = [60, 180, 300, 600, 900, 1200] as const;
