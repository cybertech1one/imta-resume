/**
 * seed-questions-massive.mjs
 *
 * Generates and inserts 500+ interview questions into the interview_common_question table.
 * Uses template arrays combined across fields, types, and difficulties.
 *
 * Usage: node scripts/seed-questions-massive.mjs
 */

import pg from "pg";
const { Client } = pg;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const fields = [
  "healthcare",
  "industrial",
  "hse",
  "it",
  "finance",
  "engineering",
  "logistics",
  "energy",
  "telecom",
  "automotive",
];

const types = ["behavioral", "technical", "situational", "competency", "motivation"];
const difficulties = ["beginner", "intermediate", "advanced"];

// Field labels for generating contextual questions
const fieldLabels = {
  healthcare: { en: "healthcare", fr: "la santé" },
  industrial: { en: "industrial manufacturing", fr: "l'industrie manufacturière" },
  hse: { en: "health, safety & environment", fr: "la santé, sécurité et environnement" },
  it: { en: "information technology", fr: "les technologies de l'information" },
  finance: { en: "finance and accounting", fr: "la finance et la comptabilité" },
  engineering: { en: "engineering", fr: "l'ingénierie" },
  logistics: { en: "logistics and supply chain", fr: "la logistique et la chaîne d'approvisionnement" },
  energy: { en: "energy and renewables", fr: "l'énergie et les énergies renouvelables" },
  telecom: { en: "telecommunications", fr: "les télécommunications" },
  automotive: { en: "automotive", fr: "l'automobile" },
};

// Moroccan companies by field for realistic sample answers
const moroccanCompanies = {
  healthcare: ["CHU Mohammed VI", "Clinique Internationale de Rabat", "Lab Biopath"],
  industrial: ["OCP Group", "Renault Tanger Med", "Safran Nacelles Morocco"],
  hse: ["OCP Group", "Managem Group", "ONHYM"],
  it: ["Capgemini Maroc", "CGI Morocco", "Atos Maroc"],
  finance: ["Attijariwafa Bank", "BMCE Bank", "CDG Capital"],
  engineering: ["ONCF", "ADM Autoroutes", "MASEN"],
  logistics: ["Tanger Med Port", "ONCF Logistics", "SDTM"],
  energy: ["ONEE", "MASEN", "Nareva Holding"],
  telecom: ["Maroc Telecom", "Orange Maroc", "Inwi"],
  automotive: ["Renault Tanger Med", "PSA Kénitra", "AMICA"],
};

// ---------------------------------------------------------------------------
// Behavioral Templates (25 templates x 10 fields = 250 questions)
// ---------------------------------------------------------------------------

const behavioralTemplates = [
  {
    q: "Tell me about a time you handled conflict at work in {field_en}",
    q_fr: "Parlez-moi d'une situation où vous avez géré un conflit au travail dans {field_fr}",
    answer_fr: "Lors de mon stage chez {company}, j'ai été témoin d'un désaccord entre deux collègues sur la méthode de travail. J'ai organisé une réunion pour écouter les deux parties et proposer un compromis. Grâce à la médiation, nous avons adopté une approche hybride qui a satisfait tout le monde et amélioré la productivité de 15%.",
    tips_fr: ["Utilisez la méthode STAR : Situation, Tâche, Action, Résultat", "Montrez votre capacité d'écoute et de médiation", "Quantifiez le résultat positif si possible"],
    difficulty: "intermediate",
  },
  {
    q: "Describe a situation where you showed leadership in {field_en}",
    q_fr: "Décrivez une situation où vous avez fait preuve de leadership dans {field_fr}",
    answer_fr: "Pendant un projet chez {company}, notre chef d'équipe était absent pour maladie. J'ai pris l'initiative de coordonner les tâches quotidiennes, de maintenir la communication avec le client et de respecter les délais. Le projet a été livré à temps et le client a félicité l'équipe pour sa réactivité.",
    tips_fr: ["Le leadership ne signifie pas forcément un titre hiérarchique", "Montrez comment vous avez inspiré et motivé les autres", "Soulignez les résultats concrets obtenus"],
    difficulty: "intermediate",
  },
  {
    q: "How do you handle pressure and tight deadlines in {field_en}?",
    q_fr: "Comment gérez-vous la pression et les délais serrés dans {field_fr} ?",
    answer_fr: "Je priorise mes tâches en utilisant la matrice d'Eisenhower : urgent/important. Lors d'un projet critique chez {company}, j'ai décomposé le travail en jalons quotidiens, communiqué régulièrement avec mon responsable et travaillé des heures supplémentaires ciblées. Le projet a été livré 48h en avance.",
    tips_fr: ["Expliquez votre système d'organisation personnel", "Donnez un exemple concret avec des résultats mesurables", "Évitez de dire que vous travaillez simplement plus dur"],
    difficulty: "beginner",
  },
  {
    q: "Tell me about a time you failed and what you learned in {field_en}",
    q_fr: "Parlez-moi d'un échec et de ce que vous en avez appris dans {field_fr}",
    answer_fr: "Lors de mon premier stage chez {company}, j'ai sous-estimé la complexité d'une tâche et n'ai pas demandé d'aide à temps. Le livrable était en retard de 3 jours. J'ai appris l'importance de la communication proactive et de l'estimation réaliste. Depuis, je décompose chaque tâche en sous-tâches et signale les risques dès que je les identifie.",
    tips_fr: ["Choisissez un échec réel mais pas catastrophique", "Insistez sur la leçon apprise et le changement de comportement", "Montrez que vous avez appliqué cette leçon depuis"],
    difficulty: "intermediate",
  },
  {
    q: "Describe how you work in a team in the {field_en} sector",
    q_fr: "Décrivez comment vous travaillez en équipe dans le secteur de {field_fr}",
    answer_fr: "Je crois fermement au travail collaboratif. Chez {company}, j'étais membre d'une équipe de 6 personnes. Je contribuais activement aux réunions, partageais mes idées tout en écoutant celles des autres, et je prenais souvent le rôle de facilitateur. Notre équipe a atteint 120% de ses objectifs trimestriels.",
    tips_fr: ["Précisez votre rôle spécifique dans l'équipe", "Mentionnez des outils de collaboration utilisés", "Donnez un résultat collectif mesurable"],
    difficulty: "beginner",
  },
  {
    q: "Give an example of when you had to adapt to change in {field_en}",
    q_fr: "Donnez un exemple où vous avez dû vous adapter au changement dans {field_fr}",
    answer_fr: "Chez {company}, un changement de réglementation a nécessité une refonte complète de nos processus en deux semaines. J'ai étudié les nouvelles exigences, formé mes collègues sur les modifications et supervisé la transition. Nous avons été conformes avant la date limite, sans interruption de service.",
    tips_fr: ["Montrez votre flexibilité et votre capacité d'apprentissage rapide", "Expliquez comment vous avez aidé les autres à s'adapter", "Soulignez le résultat positif du changement"],
    difficulty: "intermediate",
  },
  {
    q: "Tell me about a time you went above and beyond in {field_en}",
    q_fr: "Parlez-moi d'une fois où vous avez dépassé les attentes dans {field_fr}",
    answer_fr: "Lors de mon stage chez {company}, on m'a demandé de préparer un rapport mensuel. J'ai non seulement livré le rapport à temps, mais j'ai aussi créé un tableau de bord automatisé qui permettait un suivi en temps réel. Mon responsable a adopté cet outil pour toute l'équipe, réduisant le temps de reporting de 60%.",
    tips_fr: ["Choisissez un exemple où votre initiative a eu un impact mesurable", "Montrez que vous êtes proactif et créatif", "Expliquez la valeur ajoutée pour l'équipe ou l'entreprise"],
    difficulty: "intermediate",
  },
  {
    q: "How do you handle criticism and feedback in {field_en}?",
    q_fr: "Comment gérez-vous les critiques et le feedback dans {field_fr} ?",
    answer_fr: "Je considère le feedback comme un outil de croissance. Chez {company}, mon manager m'a signalé que mes présentations manquaient de clarté. J'ai suivi une formation en communication et pratiqué avec des collègues. Trois mois plus tard, j'ai reçu les meilleurs retours lors de la présentation trimestrielle.",
    tips_fr: ["Évitez d'être défensif dans votre réponse", "Montrez un exemple concret d'amélioration suite à un feedback", "Soulignez votre ouverture d'esprit et votre envie de progresser"],
    difficulty: "beginner",
  },
  {
    q: "Describe a situation where you had to convince someone in {field_en}",
    q_fr: "Décrivez une situation où vous avez dû convaincre quelqu'un dans {field_fr}",
    answer_fr: "Chez {company}, je devais convaincre mon responsable d'adopter un nouvel outil de gestion. J'ai préparé une analyse comparative, chiffré les gains de productivité potentiels et organisé une démo. Après la présentation, le responsable a validé le changement et l'outil a été déployé dans tout le département.",
    tips_fr: ["Montrez votre capacité à construire un argumentaire structuré", "Utilisez des données et des faits pour appuyer vos idées", "Expliquez comment vous avez géré les objections"],
    difficulty: "advanced",
  },
  {
    q: "Tell me about a time you managed multiple priorities in {field_en}",
    q_fr: "Parlez-moi d'une situation où vous avez géré plusieurs priorités dans {field_fr}",
    answer_fr: "Durant mon stage chez {company}, je gérais simultanément trois projets avec des délais différents. J'ai créé un planning hebdomadaire détaillé, utilisé la technique Pomodoro pour rester concentré et communiqué clairement mes disponibilités. Les trois projets ont été livrés à temps avec une qualité satisfaisante.",
    tips_fr: ["Démontrez votre capacité d'organisation et de planification", "Mentionnez les outils ou méthodes utilisés", "Montrez que vous communiquez sur vos capacités"],
    difficulty: "intermediate",
  },
  {
    q: "Give an example of creative problem-solving in {field_en}",
    q_fr: "Donnez un exemple de résolution créative de problème dans {field_fr}",
    answer_fr: "Chez {company}, nous avions un budget limité pour un projet urgent. J'ai proposé d'utiliser des outils open-source et de réorganiser le workflow existant plutôt que d'acheter une solution coûteuse. Cette approche a permis d'économiser 40% du budget tout en atteignant les objectifs du projet.",
    tips_fr: ["Mettez en avant votre pensée innovante", "Expliquez le contexte et les contraintes", "Quantifiez l'impact de votre solution créative"],
    difficulty: "advanced",
  },
  {
    q: "How do you build relationships with colleagues in {field_en}?",
    q_fr: "Comment construisez-vous des relations avec vos collègues dans {field_fr} ?",
    answer_fr: "Je crois en la communication ouverte et régulière. Chez {company}, je prenais l'initiative de déjeuner avec des collègues de différents départements, je participais activement aux activités d'équipe et j'offrais mon aide sur des projets transversaux. Cela m'a permis de créer un réseau solide et de faciliter la collaboration entre services.",
    tips_fr: ["Montrez que vous êtes sociable et professionnel", "Donnez des exemples concrets d'actions relationnelles", "Expliquez les bénéfices professionnels de ces relations"],
    difficulty: "beginner",
  },
  {
    q: "Describe a time you took initiative without being asked in {field_en}",
    q_fr: "Décrivez une fois où vous avez pris une initiative sans qu'on vous le demande dans {field_fr}",
    answer_fr: "Chez {company}, j'ai remarqué que notre processus de documentation était désorganisé. Sans attendre de directive, j'ai créé un système de classement structuré et rédigé un guide d'utilisation. Après validation par mon manager, toute l'équipe l'a adopté, réduisant le temps de recherche de documents de 50%.",
    tips_fr: ["L'initiative montre votre engagement et votre sens des responsabilités", "Expliquez pourquoi vous avez agi et comment", "Présentez l'approbation de la hiérarchie et les résultats"],
    difficulty: "intermediate",
  },
  {
    q: "Tell me about a time you had to learn something quickly in {field_en}",
    q_fr: "Parlez-moi d'une fois où vous avez dû apprendre quelque chose rapidement dans {field_fr}",
    answer_fr: "Chez {company}, on m'a confié un projet utilisant un logiciel que je ne maîtrisais pas. J'ai consacré mes soirées à suivre des tutoriels en ligne, pratiqué sur des exercices et demandé des conseils à un collègue expert. En une semaine, j'étais opérationnel et j'ai livré le projet dans les délais.",
    tips_fr: ["Montrez votre capacité d'auto-formation et d'adaptation", "Mentionnez les ressources utilisées", "Soulignez le résultat positif malgré le défi"],
    difficulty: "beginner",
  },
  {
    q: "How do you handle disagreements with your manager in {field_en}?",
    q_fr: "Comment gérez-vous les désaccords avec votre responsable dans {field_fr} ?",
    answer_fr: "Je respecte toujours la hiérarchie tout en exprimant mon point de vue de manière constructive. Chez {company}, j'étais en désaccord sur l'approche d'un projet. J'ai préparé un document comparatif et demandé un rendez-vous privé pour discuter. Mon manager a apprécié ma démarche et nous avons trouvé un compromis satisfaisant.",
    tips_fr: ["Montrez du respect pour la hiérarchie", "Expliquez votre démarche constructive et factuelle", "Soulignez que l'objectif est l'intérêt de l'entreprise"],
    difficulty: "advanced",
  },
  {
    q: "Describe your approach to meeting long-term goals in {field_en}",
    q_fr: "Décrivez votre approche pour atteindre des objectifs à long terme dans {field_fr}",
    answer_fr: "Je décompose mes objectifs à long terme en jalons mensuels et hebdomadaires. Par exemple, pour obtenir ma certification dans le domaine, j'ai établi un plan de 6 mois avec des étapes précises, des révisions hebdomadaires et des examens blancs mensuels. J'ai obtenu la certification avec un score de 92%.",
    tips_fr: ["Démontrez votre capacité de planification à long terme", "Utilisez un exemple concret avec des mesures de progression", "Montrez votre discipline et votre persévérance"],
    difficulty: "intermediate",
  },
  {
    q: "Tell me about a time you helped a colleague in difficulty in {field_en}",
    q_fr: "Parlez-moi d'une fois où vous avez aidé un collègue en difficulté dans {field_fr}",
    answer_fr: "Chez {company}, un nouveau collègue avait du mal à s'intégrer et à comprendre nos processus. J'ai proposé de le mentorer pendant ses premières semaines, en organisant des sessions quotidiennes de 30 minutes. Il est devenu autonome en 3 semaines et m'a remercié lors de la réunion d'équipe.",
    tips_fr: ["Montrez votre esprit d'entraide et de mentorat", "Expliquez votre approche pédagogique", "Soulignez le bénéfice pour l'équipe et l'entreprise"],
    difficulty: "beginner",
  },
  {
    q: "Give an example of when you received negative feedback in {field_en}",
    q_fr: "Donnez un exemple de feedback négatif que vous avez reçu dans {field_fr}",
    answer_fr: "Mon tuteur chez {company} m'a signalé que mes rapports techniques manquaient de structure. J'ai demandé des exemples de bons rapports, étudié les modèles de l'entreprise et créé un template que j'ai systématiquement utilisé. Mon rapport suivant a été cité comme référence pour les nouveaux stagiaires.",
    tips_fr: ["Montrez votre humilité et votre maturité professionnelle", "Décrivez les actions concrètes d'amélioration", "Prouvez que le feedback a eu un impact positif durable"],
    difficulty: "intermediate",
  },
  {
    q: "Describe a time when you had to work with a difficult person in {field_en}",
    q_fr: "Décrivez une situation où vous avez dû travailler avec une personne difficile dans {field_fr}",
    answer_fr: "Pendant un projet chez {company}, un membre de l'équipe était résistant au changement et critique envers toutes les propositions. J'ai cherché à comprendre ses préoccupations en privé, intégré certaines de ses idées et reconnu son expertise. Progressivement, il est devenu un allié clé du projet.",
    tips_fr: ["Ne critiquez jamais la personne dans votre réponse", "Montrez votre empathie et votre intelligence émotionnelle", "Concentrez-vous sur la résolution et le résultat positif"],
    difficulty: "advanced",
  },
  {
    q: "How do you stay motivated during repetitive tasks in {field_en}?",
    q_fr: "Comment restez-vous motivé pendant les tâches répétitives dans {field_fr} ?",
    answer_fr: "Je cherche toujours à améliorer les processus répétitifs. Chez {company}, au lieu de me plaindre de la saisie de données quotidienne, j'ai créé un script d'automatisation qui a réduit le temps de traitement de 70%. Cela m'a permis de me concentrer sur des tâches à plus haute valeur ajoutée.",
    tips_fr: ["Montrez votre capacité à trouver du sens dans chaque tâche", "Donnez un exemple d'amélioration ou d'automatisation", "Soulignez votre attitude positive et proactive"],
    difficulty: "beginner",
  },
  {
    q: "Tell me about a project you are most proud of in {field_en}",
    q_fr: "Parlez-moi du projet dont vous êtes le plus fier dans {field_fr}",
    answer_fr: "Mon projet de fin d'études chez {company} consistait à améliorer un processus existant. J'ai analysé les données historiques, identifié les goulots d'étranglement et proposé une solution innovante. Le projet a été présenté devant un jury de professionnels et a reçu la mention 'très bien' avec félicitations.",
    tips_fr: ["Choisissez un projet pertinent pour le poste visé", "Détaillez votre contribution personnelle", "Expliquez pourquoi ce projet vous rend fier"],
    difficulty: "intermediate",
  },
  {
    q: "Describe how you handle ambiguity and uncertainty in {field_en}",
    q_fr: "Décrivez comment vous gérez l'ambiguïté et l'incertitude dans {field_fr}",
    answer_fr: "Face à l'incertitude, je collecte d'abord un maximum d'informations disponibles. Chez {company}, lors d'un changement de stratégie imprévu, j'ai identifié les parties prenantes clés, posé des questions ciblées et proposé un plan d'action flexible avec des scénarios alternatifs. Cette approche a permis à l'équipe de rester productive malgré l'incertitude.",
    tips_fr: ["Montrez que vous êtes à l'aise avec l'incertitude", "Expliquez votre méthodologie de collecte d'information", "Démontrez votre capacité à agir malgré l'incomplétude des données"],
    difficulty: "advanced",
  },
  {
    q: "How do you ensure quality in your work in {field_en}?",
    q_fr: "Comment assurez-vous la qualité de votre travail dans {field_fr} ?",
    answer_fr: "J'applique une approche systématique : checklist de vérification, revue par les pairs et tests avant livraison. Chez {company}, j'ai mis en place un processus de double vérification qui a réduit les erreurs de 85%. Je demande également du feedback régulier pour m'améliorer continuellement.",
    tips_fr: ["Décrivez votre processus de contrôle qualité personnel", "Mentionnez des outils ou méthodes spécifiques", "Montrez que la qualité est une priorité constante pour vous"],
    difficulty: "intermediate",
  },
  {
    q: "Tell me about a time you had to make a difficult decision in {field_en}",
    q_fr: "Parlez-moi d'une décision difficile que vous avez dû prendre dans {field_fr}",
    answer_fr: "Chez {company}, j'ai dû choisir entre respecter un délai serré avec un livrable imparfait ou demander un délai supplémentaire pour garantir la qualité. J'ai analysé les risques, consulté mon manager et opté pour un compromis : livrer une version fonctionnelle à temps avec un plan d'amélioration pour la semaine suivante.",
    tips_fr: ["Montrez votre processus de réflexion et d'analyse", "Expliquez les critères de décision utilisés", "Démontrez que vous assumez vos décisions et leurs conséquences"],
    difficulty: "advanced",
  },
  {
    q: "Describe your communication style in a professional {field_en} environment",
    q_fr: "Décrivez votre style de communication dans un environnement professionnel de {field_fr}",
    answer_fr: "J'adapte ma communication à mon interlocuteur. Avec les techniciens, j'utilise un vocabulaire précis et technique. Avec la direction, je synthétise et me concentre sur les résultats. Chez {company}, cette adaptabilité m'a permis de servir d'interface entre l'équipe technique et le management, facilitant la prise de décision.",
    tips_fr: ["Montrez votre capacité d'adaptation", "Donnez des exemples avec différents publics", "Soulignez l'importance de l'écoute active"],
    difficulty: "intermediate",
  },
];

// ---------------------------------------------------------------------------
// Technical Templates (field-specific, 5+ per field = 50+ questions)
// ---------------------------------------------------------------------------

const technicalTemplatesByField = {
  it: [
    {
      q: "Explain the difference between REST and GraphQL",
      q_fr: "Expliquez la différence entre REST et GraphQL",
      answer_fr: "REST utilise des endpoints séparés avec des méthodes HTTP standard (GET, POST, PUT, DELETE) et retourne des structures de données fixes. GraphQL utilise un seul endpoint et permet au client de spécifier exactement les données nécessaires. REST est plus simple pour des API basiques, tandis que GraphQL réduit le sur-chargement de données et le nombre de requêtes nécessaires.",
      tips_fr: ["Comparez les avantages et inconvénients de chaque approche", "Donnez un cas d'usage concret pour chaque technologie", "Mentionnez les problèmes de performance (N+1, over-fetching)"],
    },
    {
      q: "How would you optimize a slow SQL query?",
      q_fr: "Comment optimiseriez-vous une requête SQL lente ?",
      answer_fr: "Je commencerais par analyser le plan d'exécution avec EXPLAIN ANALYZE pour identifier les goulots d'étranglement. Ensuite, j'ajouterais des index sur les colonnes utilisées dans WHERE et JOIN, j'optimiserais les sous-requêtes en JOIN, je limiterais les colonnes sélectionnées et considérerais la dénormalisation si nécessaire. Chez Capgemini, j'ai réduit le temps d'une requête de 30s à 0.5s grâce à cette approche.",
      tips_fr: ["Mentionnez EXPLAIN ANALYZE comme premier réflexe", "Parlez des index, de la normalisation et du cache", "Évoquez les outils de monitoring comme pg_stat_statements"],
    },
    {
      q: "What is the difference between TCP and UDP?",
      q_fr: "Quelle est la différence entre TCP et UDP ?",
      answer_fr: "TCP (Transmission Control Protocol) est orienté connexion, garantit la livraison ordonnée des paquets et inclut un mécanisme de contrôle de congestion. UDP (User Datagram Protocol) est sans connexion, plus rapide mais ne garantit ni la livraison ni l'ordre. TCP est utilisé pour le web et les transferts de fichiers, UDP pour le streaming vidéo et les jeux en ligne.",
      tips_fr: ["Expliquez les cas d'usage de chaque protocole", "Mentionnez le three-way handshake de TCP", "Comparez latence et fiabilité"],
    },
    {
      q: "Explain microservices architecture and when to use it",
      q_fr: "Expliquez l'architecture microservices et quand l'utiliser",
      answer_fr: "L'architecture microservices décompose une application en services indépendants, chacun responsable d'une fonctionnalité métier. Chaque service peut être déployé, mis à l'échelle et développé indépendamment. Elle est adaptée aux grandes équipes et aux applications complexes, mais ajoute de la complexité opérationnelle. Un monolithe est préférable pour les petites équipes et les MVP.",
      tips_fr: ["Comparez avec l'architecture monolithique", "Mentionnez les défis : communication inter-services, observabilité", "Citez des outils : Docker, Kubernetes, API Gateway"],
    },
    {
      q: "What is CI/CD and why is it important?",
      q_fr: "Qu'est-ce que le CI/CD et pourquoi est-ce important ?",
      answer_fr: "CI (Intégration Continue) automatise la compilation et les tests à chaque commit. CD (Déploiement Continu) automatise le déploiement en production. Ensemble, ils réduisent les erreurs humaines, accélèrent les livraisons et améliorent la qualité du code. Chez CGI Morocco, nous utilisions Jenkins et GitLab CI pour livrer des mises à jour quotidiennes.",
      tips_fr: ["Expliquez les étapes d'un pipeline CI/CD typique", "Mentionnez des outils concrets : Jenkins, GitLab CI, GitHub Actions", "Parlez de l'impact sur la qualité et la vitesse de livraison"],
    },
    {
      q: "How do you ensure application security against common vulnerabilities?",
      q_fr: "Comment assurez-vous la sécurité d'une application contre les vulnérabilités courantes ?",
      answer_fr: "J'applique les bonnes pratiques OWASP : validation des entrées, paramétrage des requêtes SQL pour éviter les injections, échappement des sorties contre le XSS, utilisation de HTTPS, gestion sécurisée des sessions et des tokens JWT. Je fais aussi des audits réguliers avec des outils comme OWASP ZAP et SonarQube.",
      tips_fr: ["Référencez le Top 10 OWASP", "Mentionnez des outils de scan de sécurité", "Parlez de la sécurité dès la conception (Security by Design)"],
    },
    {
      q: "Explain containerization with Docker and its benefits",
      q_fr: "Expliquez la conteneurisation avec Docker et ses avantages",
      answer_fr: "Docker encapsule une application et ses dépendances dans un conteneur léger et portable. Les avantages incluent : cohérence entre environnements (dev, staging, prod), isolation des processus, déploiement rapide et mise à l'échelle facile. Avec Docker Compose, on peut orchestrer plusieurs services localement, et Kubernetes pour la production.",
      tips_fr: ["Comparez conteneurs et machines virtuelles", "Mentionnez Docker Compose et Kubernetes", "Expliquez le concept de Dockerfile et d'images"],
    },
  ],
  healthcare: [
    {
      q: "Describe the patient assessment process",
      q_fr: "Décrivez le processus d'évaluation d'un patient",
      answer_fr: "L'évaluation initiale d'un patient suit une approche systématique : recueil de l'anamnèse (antécédents, symptômes actuels), examen physique, examens complémentaires (biologiques, radiologiques), formulation du diagnostic et plan de soins. Au CHU Mohammed VI, nous utilisions le dossier médical électronique pour assurer la traçabilité et la coordination entre services.",
      tips_fr: ["Détaillez les étapes dans l'ordre chronologique", "Mentionnez les outils utilisés (dossier patient, échelles d'évaluation)", "Soulignez l'importance de la communication avec le patient"],
    },
    {
      q: "How do you handle medical emergencies?",
      q_fr: "Comment gérez-vous les urgences médicales ?",
      answer_fr: "En urgence, j'applique le protocole ABCDE : Airway, Breathing, Circulation, Disability, Exposure. Je maintiens mon calme, évalue rapidement la situation, appelle les renforts si nécessaire et documente chaque action. La formation régulière aux gestes d'urgence et la connaissance du matériel disponible sont essentielles.",
      tips_fr: ["Mentionnez le protocole ABCDE ou les gestes de premiers secours", "Montrez que vous gardez votre calme sous pression", "Soulignez l'importance du travail d'équipe en urgence"],
    },
    {
      q: "Explain the importance of patient confidentiality",
      q_fr: "Expliquez l'importance de la confidentialité des données patients",
      answer_fr: "La confidentialité est un pilier éthique et légal de la pratique médicale au Maroc, régie par le secret professionnel (article 446 du Code pénal). Elle protège la dignité du patient et favorise la confiance nécessaire à la relation thérapeutique. En pratique, cela implique de sécuriser les dossiers médicaux, de ne partager les informations qu'avec le personnel autorisé et d'obtenir le consentement éclairé.",
      tips_fr: ["Référencez le cadre légal marocain", "Donnez des exemples concrets de pratiques de confidentialité", "Mentionnez les sanctions en cas de violation"],
    },
    {
      q: "How do you manage infection control in a clinical setting?",
      q_fr: "Comment gérez-vous le contrôle des infections dans un milieu clinique ?",
      answer_fr: "Le contrôle des infections repose sur plusieurs piliers : hygiène des mains (technique OMS en 7 étapes), utilisation des équipements de protection individuelle, désinfection du matériel, gestion des déchets médicaux et surveillance épidémiologique. Au CHU, j'ai participé à un programme de réduction des infections nosocomiales qui a diminué le taux de 25%.",
      tips_fr: ["Mentionnez les précautions standard et complémentaires", "Citez les protocoles OMS d'hygiène des mains", "Parlez de la surveillance et du signalement des incidents"],
    },
    {
      q: "Describe your experience with electronic health records",
      q_fr: "Décrivez votre expérience avec les dossiers médicaux électroniques",
      answer_fr: "J'ai utilisé des systèmes de dossiers médicaux électroniques pour la saisie des observations, la prescription électronique et le suivi des patients. Au CHU Mohammed VI, le système permettait la coordination entre services et la traçabilité des soins. J'ai contribué à former 10 nouveaux utilisateurs lors du déploiement d'un nouveau module.",
      tips_fr: ["Mentionnez les systèmes spécifiques utilisés", "Parlez des avantages pour la qualité des soins", "Soulignez la conformité avec la protection des données"],
    },
  ],
  hse: [
    {
      q: "Explain the hierarchy of controls in workplace safety",
      q_fr: "Expliquez la hiérarchie des mesures de prévention en sécurité au travail",
      answer_fr: "La hiérarchie des contrôles, du plus au moins efficace : 1) Élimination du danger, 2) Substitution par un matériau moins dangereux, 3) Mesures d'ingénierie (ventilation, barrières), 4) Mesures administratives (procédures, formation), 5) Équipements de protection individuelle. Chez OCP, j'ai appliqué cette hiérarchie pour réduire l'exposition aux poussières de phosphate de 60%.",
      tips_fr: ["Citez les 5 niveaux dans l'ordre", "Donnez un exemple concret pour chaque niveau", "Mentionnez les normes ISO 45001 ou OHSAS 18001"],
    },
    {
      q: "How do you conduct a risk assessment?",
      q_fr: "Comment réalisez-vous une évaluation des risques ?",
      answer_fr: "Une évaluation des risques suit 5 étapes : identification des dangers, identification des personnes exposées, évaluation de la probabilité et de la gravité (matrice de risque), mise en place des mesures de prévention et révision régulière. Chez Managem, j'ai réalisé des évaluations pour 15 postes de travail miniers, identifiant 42 risques et proposant des mesures correctrices.",
      tips_fr: ["Détaillez votre méthodologie étape par étape", "Mentionnez la matrice de risque (probabilité x gravité)", "Citez les normes applicables (ISO 45001, Document Unique)"],
    },
    {
      q: "What is your experience with ISO 14001 environmental management?",
      q_fr: "Quelle est votre expérience avec le management environnemental ISO 14001 ?",
      answer_fr: "J'ai participé à l'implémentation de l'ISO 14001 chez ONHYM. Mes responsabilités incluaient l'identification des aspects environnementaux significatifs, la rédaction des procédures, la formation du personnel et la préparation des audits internes. Nous avons obtenu la certification en 8 mois avec zéro non-conformité majeure.",
      tips_fr: ["Mentionnez votre rôle spécifique dans le système de management", "Parlez du cycle PDCA (Plan-Do-Check-Act)", "Citez des résultats mesurables (réduction des déchets, émissions)"],
    },
    {
      q: "How do you investigate a workplace incident?",
      q_fr: "Comment enquêtez-vous sur un incident au travail ?",
      answer_fr: "J'utilise la méthode de l'arbre des causes pour identifier les facteurs contributifs. Les étapes sont : sécuriser la zone, recueillir les témoignages, analyser les faits, identifier les causes racines et proposer des actions correctives. Chez OCP, j'ai enquêté sur 8 incidents en un an, menant à des améliorations qui ont réduit les incidents similaires de 45%.",
      tips_fr: ["Mentionnez l'arbre des causes ou le diagramme d'Ishikawa", "Insistez sur l'objectivité et la non-culpabilisation", "Parlez du suivi des actions correctives"],
    },
    {
      q: "Describe the process for creating a safety training program",
      q_fr: "Décrivez le processus de création d'un programme de formation en sécurité",
      answer_fr: "La création d'un programme de formation sécurité comprend : analyse des besoins (statistiques d'accidents, évaluations de risques), conception du contenu pédagogique, choix des méthodes (présentiel, e-learning, exercices pratiques), déploiement et évaluation de l'efficacité. Chez Managem, j'ai conçu un programme qui a formé 200 employés et réduit les accidents de 35%.",
      tips_fr: ["Mentionnez l'approche ADDIE ou similaire", "Parlez de l'importance des exercices pratiques", "Soulignez les indicateurs de mesure de l'efficacité"],
    },
  ],
  finance: [
    {
      q: "Explain the difference between IFRS and Moroccan GAAP (CGNC)",
      q_fr: "Expliquez la différence entre les IFRS et le plan comptable marocain (CGNC)",
      answer_fr: "Le CGNC (Code Général de Normalisation Comptable) est le référentiel marocain basé sur le coût historique, tandis que les IFRS privilégient la juste valeur et la substance économique. Les principales différences concernent la comptabilisation des instruments financiers, les contrats de location (IFRS 16) et la présentation des états financiers. Les banques marocaines cotées appliquent les IFRS depuis 2008.",
      tips_fr: ["Connaissez les principales normes IFRS (16, 9, 15)", "Comparez la présentation des états financiers", "Mentionnez le contexte réglementaire marocain"],
    },
    {
      q: "How do you perform financial statement analysis?",
      q_fr: "Comment réalisez-vous une analyse des états financiers ?",
      answer_fr: "J'utilise une approche en trois axes : analyse de la rentabilité (ROE, ROA, marge nette), analyse de la solvabilité (ratio d'endettement, couverture des intérêts) et analyse de la liquidité (ratio courant, BFR). Chez Attijariwafa Bank, j'analysais les dossiers de crédit des entreprises en calculant 15 ratios clés et en les comparant aux normes sectorielles.",
      tips_fr: ["Structurez votre réponse par catégorie de ratios", "Mentionnez les outils utilisés (Excel, Bloomberg)", "Donnez un exemple concret d'analyse et de recommandation"],
    },
    {
      q: "Explain the concept of risk management in banking",
      q_fr: "Expliquez le concept de gestion des risques bancaires",
      answer_fr: "La gestion des risques bancaires couvre le risque de crédit (défaut de l'emprunteur), le risque de marché (variations des taux et cours), le risque opérationnel (erreurs, fraudes) et le risque de liquidité. Les banques marocaines appliquent les normes Bâle III sous la supervision de Bank Al-Maghrib. Chez BMCE, j'utilisais des modèles VaR et des stress tests pour évaluer l'exposition aux risques.",
      tips_fr: ["Citez les différents types de risques bancaires", "Mentionnez le cadre réglementaire (Bâle III, Bank Al-Maghrib)", "Parlez des outils de mesure et de couverture"],
    },
    {
      q: "What is your experience with budgeting and forecasting?",
      q_fr: "Quelle est votre expérience en budgétisation et prévisions financières ?",
      answer_fr: "J'ai participé à l'élaboration de budgets annuels et de prévisions trimestrielles chez CDG Capital. Mon rôle incluait la collecte des données auprès des départements, la modélisation financière sous Excel et l'analyse des écarts. J'ai contribué à améliorer la précision des prévisions de 20% en intégrant des variables macroéconomiques marocaines.",
      tips_fr: ["Décrivez votre méthodologie de budgétisation", "Mentionnez les outils utilisés (Excel avancé, SAP)", "Parlez de la gestion des écarts et des actions correctives"],
    },
    {
      q: "Explain the tax system in Morocco for businesses",
      q_fr: "Expliquez le système fiscal marocain pour les entreprises",
      answer_fr: "Le système fiscal marocain pour les entreprises repose sur trois impôts principaux : l'IS (Impôt sur les Sociétés) avec des taux progressifs, la TVA (Taxe sur la Valeur Ajoutée) à 20% standard, et l'IR (Impôt sur le Revenu) pour les employés. Les zones franches comme Tanger Med offrent des avantages fiscaux. La déclaration se fait en ligne via le portail de la DGI.",
      tips_fr: ["Connaissez les taux d'IS actuels et les tranches", "Mentionnez les avantages fiscaux des zones franches", "Parlez de la télédéclaration et des échéances fiscales"],
    },
  ],
  engineering: [
    {
      q: "Explain the principles of lean manufacturing",
      q_fr: "Expliquez les principes du lean manufacturing",
      answer_fr: "Le lean manufacturing vise à éliminer les gaspillages (muda) en se concentrant sur la valeur pour le client. Les 5 principes sont : définir la valeur, cartographier le flux de valeur, créer le flux continu, tirer la production (pull system) et rechercher la perfection. Chez ONCF, j'ai appliqué le lean pour réduire le temps de maintenance des locomotives de 40%.",
      tips_fr: ["Citez les 7 types de gaspillage (TIMWOOD)", "Mentionnez des outils lean : 5S, Kaizen, Kanban", "Donnez un exemple concret d'application avec des résultats"],
    },
    {
      q: "How do you approach project management in engineering?",
      q_fr: "Comment abordez-vous la gestion de projet en ingénierie ?",
      answer_fr: "J'utilise une approche structurée combinant la méthodologie en V pour les phases de conception et le Agile pour le suivi itératif. Les étapes clés incluent : la définition du cahier des charges, la planification (WBS, diagramme de Gantt), l'exécution avec des jalons de contrôle, et la clôture avec retour d'expérience. Chez ADM Autoroutes, j'ai géré un projet d'infrastructure de 5M MAD.",
      tips_fr: ["Mentionnez les méthodologies maîtrisées (PMP, Prince2, Agile)", "Parlez des outils de planification utilisés", "Citez des indicateurs de suivi (coût, délai, qualité)"],
    },
    {
      q: "Explain the concept of finite element analysis (FEA)",
      q_fr: "Expliquez le concept de l'analyse par éléments finis (AEF)",
      answer_fr: "L'AEF est une méthode numérique qui divise une structure complexe en éléments simples (maillage) pour résoudre des problèmes de mécanique, de thermique ou de fluides. Les étapes sont : modélisation géométrique, maillage, définition des conditions aux limites, résolution et post-traitement. J'ai utilisé ANSYS pour optimiser une pièce aéronautique chez Safran, réduisant le poids de 15% tout en maintenant la résistance.",
      tips_fr: ["Expliquez le processus de maillage et son importance", "Mentionnez les logiciels maîtrisés (ANSYS, Abaqus, COMSOL)", "Citez un exemple d'application avec des résultats concrets"],
    },
    {
      q: "What is your experience with CAD/CAM software?",
      q_fr: "Quelle est votre expérience avec les logiciels CAO/FAO ?",
      answer_fr: "Je maîtrise SolidWorks pour la conception 3D, AutoCAD pour le dessin technique et CATIA pour les projets aéronautiques. Chez MASEN, j'ai utilisé SolidWorks pour concevoir des supports de panneaux solaires optimisés, réduisant la quantité de matériau de 20% tout en respectant les contraintes mécaniques et environnementales.",
      tips_fr: ["Listez les logiciels maîtrisés et votre niveau", "Donnez un exemple de projet réalisé avec chaque outil", "Mentionnez les formats d'échange (STEP, IGES, DXF)"],
    },
    {
      q: "How do you ensure compliance with engineering standards?",
      q_fr: "Comment assurez-vous la conformité aux normes d'ingénierie ?",
      answer_fr: "Je maintiens une veille normative active et intègre les exigences dès la phase de conception. Chez ADM, je vérifiais la conformité des ouvrages d'art aux normes marocaines (RPS 2000 pour le séisme, BAEL pour le béton armé) et européennes (Eurocodes). Chaque livrable passait par une checklist de conformité avant validation.",
      tips_fr: ["Citez les normes spécifiques à votre domaine", "Expliquez votre processus de vérification", "Mentionnez les outils de gestion documentaire"],
    },
  ],
  logistics: [
    {
      q: "Explain the concept of supply chain optimization",
      q_fr: "Expliquez le concept d'optimisation de la chaîne d'approvisionnement",
      answer_fr: "L'optimisation de la chaîne d'approvisionnement vise à minimiser les coûts tout en maximisant la satisfaction client. Cela inclut la gestion des stocks (modèle de Wilson, just-in-time), l'optimisation du transport (routage, consolidation) et la coordination des partenaires. Chez Tanger Med Port, j'ai contribué à réduire le temps de transit de 20% en optimisant les processus douaniers.",
      tips_fr: ["Mentionnez les méthodes d'optimisation des stocks", "Parlez des outils TMS et WMS", "Citez des indicateurs clés (taux de service, coût logistique)"],
    },
    {
      q: "What is your experience with warehouse management systems?",
      q_fr: "Quelle est votre expérience avec les systèmes de gestion d'entrepôt ?",
      answer_fr: "J'ai utilisé des WMS (Warehouse Management Systems) pour optimiser les opérations d'entrepôt : réception, stockage, préparation de commandes et expédition. Chez ONCF Logistics, j'ai participé au déploiement d'un WMS qui a augmenté la productivité de préparation de 30% et réduit les erreurs de 90%.",
      tips_fr: ["Mentionnez les fonctionnalités clés d'un WMS", "Parlez des stratégies de slotting et de picking", "Citez des résultats mesurables"],
    },
    {
      q: "How do you manage inventory levels effectively?",
      q_fr: "Comment gérez-vous efficacement les niveaux de stock ?",
      answer_fr: "J'utilise une combinaison d'analyses ABC pour classer les produits, de calcul du point de commande (stock de sécurité + délai d'approvisionnement x consommation moyenne) et de prévisions de la demande. Chez SDTM, j'ai réduit le stock dormant de 35% et amélioré le taux de rotation de 2,5 à 4 par an.",
      tips_fr: ["Expliquez la classification ABC et son application", "Mentionnez la formule du stock de sécurité", "Parlez des outils ERP utilisés (SAP MM, Oracle)"],
    },
    {
      q: "Explain the role of Incoterms in international trade",
      q_fr: "Expliquez le rôle des Incoterms dans le commerce international",
      answer_fr: "Les Incoterms définissent les responsabilités de l'acheteur et du vendeur en matière de transport, assurance et dédouanement. Les plus utilisés au Maroc sont FOB (Free On Board) pour l'export via Tanger Med, CIF pour l'import et EXW pour les transactions locales. Chaque Incoterm détermine le point de transfert de risque et de coût.",
      tips_fr: ["Connaissez les 11 Incoterms 2020", "Expliquez la différence entre FOB, CIF et EXW", "Mentionnez l'impact sur les documents douaniers"],
    },
    {
      q: "Describe your experience with transport management",
      q_fr: "Décrivez votre expérience en gestion du transport",
      answer_fr: "J'ai géré des opérations de transport multimodal (route, rail, maritime) chez Tanger Med Port. Mes responsabilités incluaient la planification des tournées, la négociation avec les transporteurs, le suivi des KPI (taux de remplissage, coût au km, ponctualité) et l'optimisation des itinéraires. J'ai réduit les coûts de transport de 15% en consolidant les envois.",
      tips_fr: ["Mentionnez les modes de transport gérés", "Parlez des outils TMS utilisés", "Citez des indicateurs de performance transport"],
    },
  ],
  energy: [
    {
      q: "Explain the current state of renewable energy in Morocco",
      q_fr: "Expliquez la situation actuelle des énergies renouvelables au Maroc",
      answer_fr: "Le Maroc vise 52% de capacité électrique renouvelable d'ici 2030. Le complexe solaire Noor Ouarzazate est l'un des plus grands au monde (580 MW). Le parc éolien de Tarfaya (301 MW) et le projet Noor Midelt illustrent l'ambition marocaine. MASEN et ONEE pilotent cette transition, avec des investissements de plus de 30 milliards de dirhams.",
      tips_fr: ["Citez les projets phares (Noor, Tarfaya, Midelt)", "Mentionnez les objectifs gouvernementaux", "Parlez du rôle de MASEN et ONEE"],
    },
    {
      q: "How do you approach energy efficiency in industrial processes?",
      q_fr: "Comment abordez-vous l'efficacité énergétique dans les processus industriels ?",
      answer_fr: "J'applique la méthodologie d'audit énergétique ISO 50001 : mesure de la consommation de référence, identification des gisements d'économie, étude de faisabilité technico-économique et suivi des résultats. Chez ONEE, j'ai contribué à un programme d'efficacité énergétique qui a réduit la consommation de 18% sur 50 sites industriels.",
      tips_fr: ["Mentionnez la norme ISO 50001", "Citez des mesures concrètes (variateurs de vitesse, récupération de chaleur)", "Parlez du retour sur investissement des mesures proposées"],
    },
    {
      q: "Describe the challenges of grid integration for renewable energy",
      q_fr: "Décrivez les défis d'intégration au réseau des énergies renouvelables",
      answer_fr: "L'intégration des ENR pose des défis d'intermittence (solaire et éolien), de stabilité du réseau (fréquence et tension), de stockage d'énergie et de gestion de la demande. Au Maroc, ONEE travaille sur le renforcement des interconnexions, le déploiement de batteries et les smartgrids. Le stockage thermique de Noor III (sel fondu) permet de produire 7h après le coucher du soleil.",
      tips_fr: ["Expliquez les problèmes d'intermittence et de variabilité", "Mentionnez les solutions de stockage (batteries, STEP, sel fondu)", "Parlez des technologies smart grid et de gestion de la demande"],
    },
    {
      q: "What is your experience with electrical systems design?",
      q_fr: "Quelle est votre expérience en conception de systèmes électriques ?",
      answer_fr: "J'ai participé à la conception de systèmes électriques MT/BT chez ONEE, incluant le dimensionnement des tableaux électriques, le choix des protections, le calcul des sections de câbles et les études de court-circuit. J'utilise les logiciels ETAP et Caneco pour la modélisation et le calcul, en conformité avec les normes NF C 15-100 et NM.",
      tips_fr: ["Mentionnez les normes électriques appliquées", "Citez les logiciels de calcul utilisés", "Parlez d'un projet de conception spécifique"],
    },
    {
      q: "Explain the concept of power quality and its importance",
      q_fr: "Expliquez le concept de qualité de l'énergie électrique et son importance",
      answer_fr: "La qualité de l'énergie concerne la continuité de service, la stabilité de la tension et de la fréquence, et l'absence de perturbations harmoniques. Une mauvaise qualité entraîne des pertes énergétiques, des pannes d'équipements et des coûts supplémentaires. Chez Nareva, j'ai installé des filtres actifs et des condensateurs pour améliorer le facteur de puissance de 0.75 à 0.95.",
      tips_fr: ["Définissez les paramètres de qualité (THD, cos phi, creux de tension)", "Mentionnez les conséquences d'une mauvaise qualité", "Citez des solutions correctives avec résultats"],
    },
  ],
  telecom: [
    {
      q: "Explain the architecture of a 5G network",
      q_fr: "Expliquez l'architecture d'un réseau 5G",
      answer_fr: "L'architecture 5G se compose du RAN (Radio Access Network) avec des antennes gNB utilisant le beamforming MIMO massif, et du Core Network basé sur une architecture Service Based (SBA) avec des fonctions réseau virtualisées (NFV). Le network slicing permet de créer des réseaux virtuels dédiés. Maroc Telecom a lancé ses premiers tests 5G à Casablanca et Rabat.",
      tips_fr: ["Expliquez les différences avec la 4G", "Mentionnez le network slicing et ses cas d'usage", "Parlez du déploiement 5G au Maroc"],
    },
    {
      q: "How do you troubleshoot network performance issues?",
      q_fr: "Comment diagnostiquez-vous les problèmes de performance réseau ?",
      answer_fr: "J'utilise une approche méthodique : vérification des KPI réseau (latence, débit, taux de perte), analyse des logs, tests de connectivité (ping, traceroute), capture de paquets (Wireshark) et corrélation avec les événements réseau. Chez Orange Maroc, j'ai diagnostiqué une dégradation de service causée par une saturation de bande passante et proposé un plan de capacité.",
      tips_fr: ["Décrivez votre processus de diagnostic étape par étape", "Mentionnez les outils utilisés (Wireshark, SNMP, Zabbix)", "Parlez de la résolution et de la prévention"],
    },
    {
      q: "What is your experience with fiber optic networks?",
      q_fr: "Quelle est votre expérience avec les réseaux fibre optique ?",
      answer_fr: "J'ai participé au déploiement de réseaux FTTH (Fiber To The Home) chez Inwi. Mes responsabilités incluaient l'étude technique (tracé, budget optique), la supervision des travaux de génie civil et de raccordement, et la recette des installations (mesures OTDR). J'ai supervisé le raccordement de 5000 abonnés sur 6 mois.",
      tips_fr: ["Mentionnez les types de fibre (monomode, multimode)", "Parlez des techniques de mesure (OTDR, puissance optique)", "Citez les normes et standards appliqués"],
    },
    {
      q: "Explain the concept of network virtualization (SDN/NFV)",
      q_fr: "Expliquez le concept de virtualisation réseau (SDN/NFV)",
      answer_fr: "SDN (Software Defined Networking) sépare le plan de contrôle du plan de données pour une gestion centralisée. NFV (Network Functions Virtualization) remplace le matériel dédié par des fonctions logicielles sur serveurs standards. Ensemble, ils offrent flexibilité, réduction des coûts et déploiement rapide. Maroc Telecom utilise ces technologies pour moderniser son infrastructure core.",
      tips_fr: ["Différenciez clairement SDN et NFV", "Mentionnez les avantages opérationnels et économiques", "Citez des cas d'usage concrets dans les télécoms"],
    },
    {
      q: "How do you ensure network security in telecommunications?",
      q_fr: "Comment assurez-vous la sécurité réseau dans les télécommunications ?",
      answer_fr: "La sécurité télécom repose sur plusieurs couches : firewalls et IDS/IPS pour la protection périmétrique, chiffrement des communications (IPsec, TLS), authentification forte (802.1X, RADIUS), segmentation réseau et surveillance continue (SIEM). Chez Inwi, j'ai contribué à un projet de déploiement SIEM qui a amélioré le temps de détection des incidents de 80%.",
      tips_fr: ["Mentionnez l'approche de défense en profondeur", "Citez les outils et protocoles de sécurité utilisés", "Parlez de la surveillance et de la réponse aux incidents"],
    },
  ],
  automotive: [
    {
      q: "Explain the automotive production process (from stamping to assembly)",
      q_fr: "Expliquez le processus de production automobile (de l'emboutissage à l'assemblage)",
      answer_fr: "Le processus comprend 4 ateliers principaux : l'emboutissage (mise en forme des tôles), la tôlerie/soudure (assemblage de la caisse), la peinture (traitement de surface et application) et le montage final (habillage, mécanique, électricité). Chez Renault Tanger Med, l'usine produit 400 000 véhicules/an avec un takt time de 60 secondes.",
      tips_fr: ["Décrivez les 4 ateliers dans l'ordre", "Mentionnez les indicateurs clés (takt time, TRS, FTT)", "Parlez des standards qualité (IATF 16949)"],
    },
    {
      q: "What is your experience with automotive quality standards (IATF 16949)?",
      q_fr: "Quelle est votre expérience avec les normes qualité automobile (IATF 16949) ?",
      answer_fr: "J'ai travaillé dans un environnement certifié IATF 16949 chez PSA Kénitra. J'utilisais les outils qualité associés : AMDEC (analyse des modes de défaillance), plans de contrôle, MSA (analyse du système de mesure) et SPC (maîtrise statistique des procédés). J'ai contribué à réduire le taux de rebut de 2.5% à 0.8%.",
      tips_fr: ["Mentionnez les core tools (AMDEC, SPC, MSA, PPAP, APQP)", "Citez des exemples concrets d'application", "Parlez des exigences spécifiques client (CSR)"],
    },
    {
      q: "Explain the concept of just-in-time (JIT) in automotive",
      q_fr: "Expliquez le concept du juste-à-temps (JAT) dans l'automobile",
      answer_fr: "Le JAT vise à produire exactement ce qui est nécessaire, quand c'est nécessaire, en quantité nécessaire. Chez Renault Tanger Med, les fournisseurs livrent les pièces en séquence (JIS) directement sur la ligne de montage. Cela réduit les stocks, les coûts d'entrepôt et le gaspillage. La clé est la fiabilité de la chaîne d'approvisionnement.",
      tips_fr: ["Expliquez les avantages et les risques du JAT", "Mentionnez le kanban comme outil de gestion", "Parlez de l'importance de la fiabilité fournisseur"],
    },
    {
      q: "How do you approach vehicle electrification challenges?",
      q_fr: "Comment abordez-vous les défis de l'électrification des véhicules ?",
      answer_fr: "L'électrification pose des défis techniques (autonomie, temps de charge, gestion thermique des batteries), industriels (nouvelles lignes de production, compétences à développer) et logistiques (chaîne d'approvisionnement des batteries). AMICA accompagne les équipementiers marocains dans cette transition. J'ai participé à un projet de formation sur les risques électriques haute tension.",
      tips_fr: ["Mentionnez les technologies de batteries (lithium-ion, solid-state)", "Parlez des enjeux de formation et de sécurité", "Citez les projets d'électrification au Maroc"],
    },
    {
      q: "Describe your experience with automotive APQP process",
      q_fr: "Décrivez votre expérience avec le processus APQP automobile",
      answer_fr: "L'APQP (Advanced Product Quality Planning) structure le développement produit en 5 phases : planification, conception produit, conception processus, validation et production série. Chez PSA Kénitra, j'ai piloté l'APQP pour un nouveau composant intérieur, coordonnant 12 fournisseurs et livrant le PPAP (Production Part Approval Process) dans les délais.",
      tips_fr: ["Décrivez les 5 phases de l'APQP", "Mentionnez les livrables clés (AMDEC, plan de contrôle, PPAP)", "Parlez de la coordination avec les fournisseurs"],
    },
  ],
  industrial: [
    {
      q: "Explain the Total Productive Maintenance (TPM) methodology",
      q_fr: "Expliquez la méthodologie de Maintenance Productive Totale (TPM)",
      answer_fr: "La TPM vise zéro panne, zéro défaut et zéro accident en impliquant tous les employés. Les 8 piliers sont : maintenance autonome, amélioration continue, maintenance planifiée, formation, gestion anticipative, maintenance qualité, TPM administratif et sécurité. Chez OCP, j'ai déployé la maintenance autonome sur 20 machines, améliorant le TRS de 65% à 82%.",
      tips_fr: ["Citez les 8 piliers de la TPM", "Expliquez le TRS (Taux de Rendement Synthétique)", "Donnez un exemple avec des résultats mesurables"],
    },
    {
      q: "How do you implement Six Sigma in manufacturing?",
      q_fr: "Comment implémentez-vous le Six Sigma en production ?",
      answer_fr: "J'utilise la méthodologie DMAIC : Définir le problème (charte de projet), Mesurer (collecte de données, capabilité), Analyser (diagramme de Pareto, Ishikawa, régression), Innover (plans d'expériences, solutions) et Contrôler (cartes de contrôle, procédures). Chez Safran Nacelles, j'ai mené un projet DMAIC qui a réduit les non-conformités de 40%.",
      tips_fr: ["Détaillez chaque étape du DMAIC", "Mentionnez les outils statistiques utilisés", "Parlez de votre certification (Green Belt, Black Belt)"],
    },
    {
      q: "What is your experience with PLC programming?",
      q_fr: "Quelle est votre expérience en programmation d'automates (API) ?",
      answer_fr: "J'ai programmé des automates Siemens (S7-300/400 avec TIA Portal) et Schneider (M340 avec Unity Pro). Mes applications incluaient le contrôle de lignes de production, la gestion de convoyeurs et la régulation de processus. Chez OCP, j'ai développé un programme de gestion automatique de broyeur qui a réduit la consommation énergétique de 12%.",
      tips_fr: ["Mentionnez les marques et modèles d'automates maîtrisés", "Citez les langages de programmation (Ladder, FBD, ST, SFC)", "Parlez des protocoles de communication (Profinet, Modbus)"],
    },
    {
      q: "Explain the concept of Overall Equipment Effectiveness (OEE)",
      q_fr: "Expliquez le concept de Taux de Rendement Synthétique (TRS)",
      answer_fr: "Le TRS mesure la performance globale d'un équipement en combinant trois facteurs : Disponibilité (temps de fonctionnement vs temps planifié), Performance (cadence réelle vs cadence nominale) et Qualité (pièces bonnes vs pièces totales). Un TRS world-class est de 85%. Chez Renault Tanger Med, j'ai amélioré le TRS d'une ligne de 71% à 84% en 6 mois.",
      tips_fr: ["Expliquez la formule TRS = D x P x Q", "Mentionnez les 6 grandes pertes (arrêts, ralentissements, rebuts)", "Citez les niveaux de référence (world-class = 85%)"],
    },
    {
      q: "How do you manage production planning and scheduling?",
      q_fr: "Comment gérez-vous la planification et l'ordonnancement de la production ?",
      answer_fr: "J'utilise une approche hiérarchique : PIC (Plan Industriel et Commercial) pour le long terme, PDP (Programme Directeur de Production) pour le moyen terme et ordonnancement détaillé pour le court terme. Les outils incluent les MRP (Material Requirements Planning) et les ERP. Chez Safran, j'optimisais le planning de 3 lignes de production servant 5 clients aéronautiques.",
      tips_fr: ["Expliquez les niveaux de planification (PIC, PDP, ordonnancement)", "Mentionnez les outils et logiciels utilisés", "Parlez de la gestion des aléas et des priorités"],
    },
  ],
};

// ---------------------------------------------------------------------------
// Situational Templates (20 templates x 10 fields = 200 questions)
// ---------------------------------------------------------------------------

const situationalTemplates = [
  {
    q: "Your manager asks you to complete a task you disagree with in {field_en}. What do you do?",
    q_fr: "Votre responsable vous demande de réaliser une tâche avec laquelle vous n'êtes pas d'accord dans {field_fr}. Que faites-vous ?",
    answer_fr: "Je commencerais par exécuter la tâche tout en préparant une alternative argumentée. Je demanderais un moment opportun pour présenter mes préoccupations avec des faits et des données. Si le manager maintient sa décision, je l'exécuterais professionnellement, car il peut avoir des informations que je n'ai pas. Le respect de la hiérarchie est important, mais l'expression constructive des désaccords aussi.",
    tips_fr: ["Montrez votre respect pour la hiérarchie", "Expliquez comment vous exprimeriez votre désaccord de manière constructive", "Soulignez que l'intérêt de l'entreprise prime"],
    difficulty: "intermediate",
  },
  {
    q: "A client in {field_en} is extremely dissatisfied. How do you handle the situation?",
    q_fr: "Un client dans {field_fr} est extrêmement insatisfait. Comment gérez-vous la situation ?",
    answer_fr: "J'écouterais d'abord activement le client sans l'interrompre pour comprendre sa frustration. Je reformulerais son problème pour montrer que je l'ai compris, puis je m'excuserais sincèrement pour le désagrément. Ensuite, je proposerais une solution concrète avec un délai précis et assurerais un suivi proactif. L'objectif est de transformer une expérience négative en opportunité de fidélisation.",
    tips_fr: ["Écoute active et empathie sont essentielles", "Proposez une solution concrète, pas juste des excuses", "Mentionnez le suivi post-résolution"],
    difficulty: "intermediate",
  },
  {
    q: "You discover a serious error in a report about to be sent to a {field_en} client. What do you do?",
    q_fr: "Vous découvrez une erreur grave dans un rapport sur le point d'être envoyé à un client dans {field_fr}. Que faites-vous ?",
    answer_fr: "J'arrêterais immédiatement l'envoi du rapport. J'informerais mon responsable de l'erreur découverte et de son impact potentiel. Je corrigerais l'erreur en vérifiant l'ensemble du document pour détecter d'autres problèmes. Je proposerais également de mettre en place une double vérification systématique pour éviter que cela ne se reproduise.",
    tips_fr: ["La réactivité et la transparence sont clés", "Informez immédiatement votre hiérarchie", "Proposez une solution corrective ET préventive"],
    difficulty: "beginner",
  },
  {
    q: "Two team members in your {field_en} project are in constant conflict. How do you resolve it?",
    q_fr: "Deux membres de votre équipe dans un projet de {field_fr} sont en conflit permanent. Comment résolvez-vous la situation ?",
    answer_fr: "Je rencontrerais d'abord chaque personne individuellement pour comprendre les points de vue. Ensuite, j'organiserais une médiation structurée avec des règles claires : écoute mutuelle, focus sur les faits et recherche de solutions. J'établirais des accords concrets sur les modes de collaboration et assurerais un suivi régulier. Si nécessaire, j'impliquerais le management.",
    tips_fr: ["Montrez votre neutralité et votre objectivité", "Écoutez les deux parties séparément avant la médiation", "Proposez des règles de collaboration concrètes"],
    difficulty: "advanced",
  },
  {
    q: "You realize you cannot meet a deadline for a {field_en} project. What steps do you take?",
    q_fr: "Vous réalisez que vous ne pouvez pas respecter une échéance pour un projet de {field_fr}. Quelles mesures prenez-vous ?",
    answer_fr: "Dès que je réalise le risque de retard, je préviens immédiatement mon responsable avec une analyse de la situation : travail restant, causes du retard et options (délai supplémentaire, renfort, réduction du périmètre). Je propose un plan de rattrapage réaliste. La transparence anticipée est toujours préférable à une mauvaise surprise de dernière minute.",
    tips_fr: ["Communiquez le plus tôt possible", "Présentez des solutions, pas seulement le problème", "Proposez un planning de rattrapage réaliste"],
    difficulty: "beginner",
  },
  {
    q: "A new regulation changes your {field_en} work processes overnight. How do you adapt?",
    q_fr: "Une nouvelle réglementation change vos processus de travail dans {field_fr} du jour au lendemain. Comment vous adaptez-vous ?",
    answer_fr: "J'analyserais d'abord la nouvelle réglementation en détail pour comprendre les changements requis. J'établirais une liste des impacts sur nos processus actuels et définirais un plan de transition prioritisé. Je formerais l'équipe sur les nouvelles exigences et mettrais en place un suivi de conformité. La réactivité et l'organisation sont essentielles dans ces situations.",
    tips_fr: ["Montrez votre capacité d'analyse rapide", "Proposez un plan d'action structuré", "Soulignez l'importance de la formation de l'équipe"],
    difficulty: "intermediate",
  },
  {
    q: "You are asked to train a new employee in {field_en} while managing your own workload. How do you balance both?",
    q_fr: "On vous demande de former un nouvel employé dans {field_fr} tout en gérant votre propre charge de travail. Comment équilibrez-vous les deux ?",
    answer_fr: "Je créerais un plan de formation structuré avec des sessions quotidiennes de 45-60 minutes, intégré à mon planning. Je préparerais des supports écrits pour que le nouvel employé puisse avancer en autonomie entre les sessions. Je déléguerais certaines tâches adaptables au nouveau venu comme exercices pratiques. Cet investissement initial réduit la charge à moyen terme.",
    tips_fr: ["Montrez votre capacité d'organisation et de planification", "Proposez une approche structurée de la formation", "Soulignez le bénéfice à moyen terme pour l'équipe"],
    difficulty: "intermediate",
  },
  {
    q: "During a presentation to {field_en} stakeholders, you realize your data is incorrect. What do you do?",
    q_fr: "Pendant une présentation à des parties prenantes de {field_fr}, vous réalisez que vos données sont incorrectes. Que faites-vous ?",
    answer_fr: "Je m'arrêterais brièvement, je serais honnête en disant : 'Je souhaite vérifier ces chiffres avant de continuer, car je veux vous fournir des informations fiables.' Je poursuivrais la présentation sur les points non affectés et m'engagerais à envoyer les données corrigées dans un délai précis. La crédibilité se construit par l'honnêteté, pas par la perfection.",
    tips_fr: ["L'honnêteté renforce votre crédibilité", "Ne paniquez pas, restez professionnel", "Engagez-vous sur un délai précis pour la correction"],
    difficulty: "advanced",
  },
  {
    q: "Your {field_en} company is downsizing and you must do more with less resources. How do you cope?",
    q_fr: "Votre entreprise dans {field_fr} réduit ses effectifs et vous devez faire plus avec moins de ressources. Comment gérez-vous ?",
    answer_fr: "Je commencerais par prioriser les tâches selon leur impact business. J'identifierais les processus automatisables et les tâches à éliminer (non-valeur ajoutée). Je communiquerais clairement avec mon manager sur les compromis nécessaires entre qualité, délai et périmètre. L'optimisation et la priorisation deviennent des compétences critiques dans ce contexte.",
    tips_fr: ["Montrez votre capacité de priorisation", "Proposez des solutions d'optimisation concrètes", "Communiquez sur les limites de manière constructive"],
    difficulty: "advanced",
  },
  {
    q: "A colleague in {field_en} takes credit for your work. How do you respond?",
    q_fr: "Un collègue dans {field_fr} s'attribue le mérite de votre travail. Comment réagissez-vous ?",
    answer_fr: "Je resterais professionnel et éviterais la confrontation publique. Je parlerais d'abord au collègue en privé pour clarifier la situation, car il peut s'agir d'un malentendu. Si le comportement persiste, je documenterais mes contributions par écrit (emails, rapports) et en discuterais avec mon manager. La prévention passe par la visibilité régulière de mes contributions.",
    tips_fr: ["Évitez la confrontation publique", "Documentez systématiquement vos contributions", "Communiquez régulièrement vos avancements à votre manager"],
    difficulty: "intermediate",
  },
  {
    q: "You are offered a shortcut that compromises quality standards in {field_en}. What do you do?",
    q_fr: "On vous propose un raccourci qui compromet les standards de qualité dans {field_fr}. Que faites-vous ?",
    answer_fr: "Je refuserais poliment en expliquant les risques à court et long terme. Je proposerais une alternative qui optimise le temps sans compromettre la qualité. Si la pression persiste, j'escaladerais au management en documentant les risques. La qualité est non négociable, surtout dans un domaine où les conséquences d'un défaut peuvent être graves.",
    tips_fr: ["Montrez votre intégrité professionnelle", "Proposez toujours une alternative constructive", "Documentez les risques si la pression persiste"],
    difficulty: "advanced",
  },
  {
    q: "You join a new {field_en} team and notice inefficient processes. How do you approach change?",
    q_fr: "Vous rejoignez une nouvelle équipe dans {field_fr} et remarquez des processus inefficaces. Comment abordez-vous le changement ?",
    answer_fr: "Je prendrais d'abord le temps d'observer et de comprendre le contexte et les raisons historiques des processus actuels. Après 2-3 semaines d'intégration, je proposerais des améliorations progressives en commencant par des quick wins à faible risque. Je présenterais les bénéfices avec des données et impliquerais l'équipe dans la décision. Le changement est mieux accepté quand il est collaboratif.",
    tips_fr: ["Observez et comprenez avant de proposer des changements", "Commencez par des améliorations faciles à réaliser", "Impliquez l'équipe dans le processus de changement"],
    difficulty: "intermediate",
  },
  {
    q: "You must deliver bad news to your {field_en} team about project changes. How do you communicate?",
    q_fr: "Vous devez annoncer une mauvaise nouvelle à votre équipe de {field_fr} concernant des changements de projet. Comment communiquez-vous ?",
    answer_fr: "Je préparerais soigneusement ma communication : message clair sur les faits, explication du contexte et des raisons, impact concret sur l'équipe et plan d'action. Je serais transparent et empatique, tout en restant positif sur les perspectives. Je répondrais à toutes les questions et offrirais un temps d'échange individuel pour ceux qui le souhaitent.",
    tips_fr: ["Soyez direct et honnête, évitez l'ambiguité", "Préparez un plan d'action pour accompagner l'annonce", "Laissez du temps pour les questions et les réactions"],
    difficulty: "advanced",
  },
  {
    q: "A senior colleague in {field_en} mentors you but gives advice you disagree with. How do you handle it?",
    q_fr: "Un collègue senior dans {field_fr} vous mentore mais donne des conseils avec lesquels vous n'êtes pas d'accord. Comment gérez-vous ?",
    answer_fr: "Je remercierais d'abord le mentor pour son temps et son expérience. J'écouterais attentivement ses arguments car son expérience peut éclairer des aspects que je ne vois pas. Si je reste en désaccord, j'exprimerais respectueusement mon point de vue avec des arguments factuels. Un bon mentorat repose sur le dialogue, pas sur l'acceptation aveugle.",
    tips_fr: ["Montrez du respect pour l'expérience du mentor", "Expliquez votre raisonnement avec des faits", "Un bon mentor apprécie les questions critiques constructives"],
    difficulty: "intermediate",
  },
  {
    q: "You notice a safety hazard in your {field_en} workplace. What is your immediate response?",
    q_fr: "Vous remarquez un danger pour la sécurité dans votre lieu de travail de {field_fr}. Quelle est votre réaction immédiate ?",
    answer_fr: "Ma réaction immédiate serait de sécuriser la zone et d'éloigner les personnes du danger. J'alerterais ensuite le responsable sécurité et/ou mon manager. Je documenterais le danger (photos, description) et remplirais un rapport d'incident. Je ne reprendrais le travail dans la zone qu'après confirmation que le danger est maîtrisé. La sécurité est la responsabilité de tous.",
    tips_fr: ["La sécurité passe toujours en premier", "Connaissez la procédure d'urgence de votre entreprise", "Documentez et signalez systématiquement"],
    difficulty: "beginner",
  },
  {
    q: "Your {field_en} project scope keeps expanding without additional resources. How do you manage?",
    q_fr: "Le périmètre de votre projet dans {field_fr} ne cesse de s'élargir sans ressources supplémentaires. Comment gérez-vous ?",
    answer_fr: "Je documenterais chaque demande d'élargissement et son impact sur le délai et le budget. J'organiserais une réunion avec les parties prenantes pour revoir les priorités en utilisant la méthode MoSCoW (Must/Should/Could/Won't). Je présenterais clairement le compromis : soit réduire le périmètre, soit augmenter les ressources ou le délai. Le scope creep est l'ennemi numéro un des projets.",
    tips_fr: ["Documentez toutes les demandes de changement de périmètre", "Utilisez la priorisation MoSCoW", "Présentez le triangle qualité-coût-délai aux parties prenantes"],
    difficulty: "advanced",
  },
  {
    q: "You must work with a remote team across time zones on a {field_en} project. How do you ensure collaboration?",
    q_fr: "Vous devez travailler avec une équipe distante sur différents fuseaux horaires pour un projet de {field_fr}. Comment assurez-vous la collaboration ?",
    answer_fr: "J'établirais des plages horaires communes pour les réunions synchrones (en minimisant les horaires extrêmes). J'utiliserais des outils collaboratifs asynchrones (Slack, Notion, Jira) pour la communication quotidienne. Je définirais des règles claires : temps de réponse maximum, format des mises à jour, documentation partagée. La clarté de la communication écrite est essentielle en mode distant.",
    tips_fr: ["Trouvez un créneau commun raisonnable pour tous", "Privilégiez la communication asynchrone documentée", "Définissez des règles de collaboration claires"],
    difficulty: "intermediate",
  },
  {
    q: "You are assigned to a {field_en} project using technology you have never worked with. How do you approach it?",
    q_fr: "On vous affecte à un projet de {field_fr} utilisant une technologie que vous n'avez jamais utilisée. Comment l'abordez-vous ?",
    answer_fr: "Je commencerais par évaluer le gap de compétences et établir un plan d'apprentissage rapide : tutoriels officiels, documentation, cours en ligne et pratique sur des mini-projets. Je solliciterais l'aide d'un collègue expert et serais transparent avec mon manager sur mon planning de montée en compétences. En général, je deviens opérationnel en 1-2 semaines sur une nouvelle technologie.",
    tips_fr: ["Montrez votre capacité d'auto-formation rapide", "Identifiez les ressources d'apprentissage les plus efficaces", "Soyez transparent sur votre planning de montée en compétences"],
    difficulty: "beginner",
  },
  {
    q: "An ethical dilemma arises in your {field_en} work. How do you handle it?",
    q_fr: "Un dilemme éthique survient dans votre travail de {field_fr}. Comment le gérez-vous ?",
    answer_fr: "Je commencerais par identifier clairement le dilemme et les parties concernées. Je consulterais le code d'éthique de l'entreprise et, si nécessaire, le département conformité ou juridique. Je documenterais la situation et ma décision avec les raisons. L'intégrité est non négociable : je choisirais toujours l'éthique, même si c'est la voie la plus difficile.",
    tips_fr: ["Montrez votre sens éthique et votre intégrité", "Référencez le code d'éthique de l'entreprise", "Documentez tout et consultez les bonnes personnes"],
    difficulty: "advanced",
  },
  {
    q: "Your {field_en} team is demotivated after a project failure. How do you help them recover?",
    q_fr: "Votre équipe de {field_fr} est démotivée après un échec de projet. Comment les aidez-vous à se relever ?",
    answer_fr: "J'organiserais d'abord un debriefing constructif (sans culpabilisation) pour identifier les leçons apprises. Je reconnaissais les efforts fournis malgré le résultat. Ensuite, je fixerais des objectifs à court terme facilement atteignables pour recréer une dynamique positive. Je célébrerais chaque petite victoire pour restaurer la confiance de l'équipe progressivement.",
    tips_fr: ["Ne cherchez pas de coupable, cherchez des leçons", "Fixez des objectifs atteignables pour recréer la confiance", "Célébrez les petites victoires pour remobiliser l'équipe"],
    difficulty: "advanced",
  },
];

// ---------------------------------------------------------------------------
// Competency Templates (10 templates x 10 fields = 100 questions)
// ---------------------------------------------------------------------------

const competencyTemplates = [
  {
    q: "What technical skills do you bring to {field_en}?",
    q_fr: "Quelles compétences techniques apportez-vous dans {field_fr} ?",
    answer_fr: "J'apporte une combinaison de compétences techniques acquises à l'IMTA et renforcées par mes stages. Ma formation m'a donné des bases solides en analyse, gestion de projet et résolution de problèmes. Mes stages chez {company} m'ont permis de développer des compétences pratiques spécifiques au secteur et une maîtrise des outils professionnels.",
    tips_fr: ["Listez vos compétences techniques clés", "Reliez chaque compétence à une expérience concrète", "Montrez comment vos compétences répondent aux besoins du poste"],
    difficulty: "beginner",
  },
  {
    q: "How do you stay updated with trends in {field_en}?",
    q_fr: "Comment restez-vous à jour avec les tendances dans {field_fr} ?",
    answer_fr: "J'utilise plusieurs canaux : veille technique via LinkedIn et des revues spécialisées, participation à des webinaires et conférences, suivi de formations continues en ligne (Coursera, edX) et échanges avec des professionnels du secteur. Je consacre au moins 2 heures par semaine à cette veille, ce qui m'a permis d'anticiper des tendances clés dans mon domaine.",
    tips_fr: ["Citez des sources spécifiques à votre secteur", "Montrez que c'est une habitude régulière", "Donnez un exemple où cette veille vous a été utile"],
    difficulty: "beginner",
  },
  {
    q: "Demonstrate your analytical thinking applied to {field_en}",
    q_fr: "Démontrez votre pensée analytique appliquée à {field_fr}",
    answer_fr: "Ma pensée analytique se manifeste dans ma méthodologie de travail : collecte de données, identification des tendances, formulation d'hypothèses et validation par les faits. Chez {company}, j'ai analysé les données de performance sur 12 mois, identifié des corrélations cachées et proposé des améliorations qui ont augmenté l'efficacité de 25%. Je suis à l'aise avec Excel avancé, Python et les outils de BI.",
    tips_fr: ["Décrivez votre méthodologie d'analyse", "Donnez un exemple concret avec des résultats", "Mentionnez les outils d'analyse maîtrisés"],
    difficulty: "intermediate",
  },
  {
    q: "How do you demonstrate project management competency in {field_en}?",
    q_fr: "Comment démontrez-vous votre compétence en gestion de projet dans {field_fr} ?",
    answer_fr: "J'applique une gestion de projet rigoureuse : définition claire des objectifs SMART, planification détaillée (WBS, Gantt), suivi régulier des indicateurs (avancement, budget, risques) et communication transparente avec les parties prenantes. Chez {company}, j'ai co-piloté un projet impliquant 8 personnes avec un budget de 500K MAD, livré dans les délais et le budget.",
    tips_fr: ["Mentionnez les méthodologies maîtrisées (PMP, Agile, Prince2)", "Citez des outils de gestion (MS Project, Jira, Trello)", "Donnez des indicateurs de succès concrets"],
    difficulty: "intermediate",
  },
  {
    q: "Describe your problem-solving methodology in {field_en}",
    q_fr: "Décrivez votre méthodologie de résolution de problèmes dans {field_fr}",
    answer_fr: "J'utilise une approche structurée inspirée du PDCA et des outils de qualité : 1) Définir le problème (QQOQCP), 2) Analyser les causes (Ishikawa, 5 Pourquoi), 3) Générer des solutions (brainstorming, matrice de décision), 4) Implémenter et contrôler. Chez {company}, cette approche m'a permis de résoudre un problème chronique de qualité que personne n'avait pu corriger depuis 6 mois.",
    tips_fr: ["Structurez votre méthodologie en étapes claires", "Citez des outils spécifiques (Ishikawa, 5 Pourquoi, Pareto)", "Donnez un exemple où votre méthode a fait la différence"],
    difficulty: "intermediate",
  },
  {
    q: "How do you apply digital transformation skills in {field_en}?",
    q_fr: "Comment appliquez-vous vos compétences en transformation digitale dans {field_fr} ?",
    answer_fr: "Je contribue à la transformation digitale par l'automatisation des processus répétitifs, l'exploitation des données pour la prise de décision et l'adoption d'outils collaboratifs. Chez {company}, j'ai automatisé un processus de reporting manuel qui prenait 3 jours en créant un tableau de bord Power BI actualisé en temps réel, libérant 60h/mois pour l'équipe.",
    tips_fr: ["Montrez votre maîtrise des outils digitaux", "Donnez un exemple concret d'automatisation ou de digitalisation", "Quantifiez les gains obtenus"],
    difficulty: "intermediate",
  },
  {
    q: "Demonstrate your capacity for cross-functional collaboration in {field_en}",
    q_fr: "Démontrez votre capacité de collaboration transversale dans {field_fr}",
    answer_fr: "Chez {company}, j'ai travaillé sur un projet impliquant les équipes production, qualité, maintenance et achat. J'étais le lien entre ces départements, traduisant les besoins techniques en objectifs business et vice versa. Cette expérience m'a appris l'importance d'adapter mon langage à chaque interlocuteur et de créer des outils de suivi partagés.",
    tips_fr: ["Montrez votre expérience avec différents départements", "Expliquez comment vous adaptez votre communication", "Soulignez la valeur de la collaboration transversale"],
    difficulty: "advanced",
  },
  {
    q: "How do you apply data-driven decision making in {field_en}?",
    q_fr: "Comment appliquez-vous la prise de décision basée sur les données dans {field_fr} ?",
    answer_fr: "Je collecte et structure les données pertinentes, les analyse avec des outils adaptés (Excel, Python, Power BI) et présente des recommandations appuyées par les chiffres. Chez {company}, j'ai créé un dashboard qui suivait 12 KPI clés, permettant au management de prendre des décisions éclairées en temps réel au lieu de se baser sur l'intuition.",
    tips_fr: ["Montrez votre maîtrise des outils d'analyse de données", "Donnez un exemple où les données ont guidé une décision", "Mentionnez les KPI pertinents pour votre domaine"],
    difficulty: "advanced",
  },
  {
    q: "What is your approach to continuous improvement in {field_en}?",
    q_fr: "Quelle est votre approche de l'amélioration continue dans {field_fr} ?",
    answer_fr: "J'applique le cycle PDCA (Plan-Do-Check-Act) de manière systématique. Je mesure la performance actuelle, identifie les écarts, propose des améliorations et vérifie les résultats. Chez {company}, j'ai initié 5 chantiers Kaizen en 6 mois, générant une économie cumulée de 200K MAD. L'amélioration continue est un état d'esprit, pas juste une méthode.",
    tips_fr: ["Citez les méthodologies d'amélioration continue (PDCA, Kaizen, Lean)", "Donnez des exemples concrets d'améliorations initiées", "Montrez que c'est un état d'esprit permanent"],
    difficulty: "intermediate",
  },
  {
    q: "How do you manage stakeholder expectations in {field_en} projects?",
    q_fr: "Comment gérez-vous les attentes des parties prenantes dans les projets de {field_fr} ?",
    answer_fr: "Je commence par identifier toutes les parties prenantes et comprendre leurs attentes spécifiques (matrice pouvoir/intérêt). Je définis des objectifs clairs et réalistes dès le départ et communique régulièrement sur l'avancement. Chez {company}, j'envoyais un rapport hebdomadaire synthétique et organisais des revues mensuelles, ce qui a réduit les surprises et augmenté la satisfaction de 90%.",
    tips_fr: ["Mentionnez la matrice pouvoir/intérêt", "Insistez sur la communication régulière et transparente", "Parlez de la gestion des changements d'attentes"],
    difficulty: "advanced",
  },
];

// ---------------------------------------------------------------------------
// Motivation Templates (10 templates x 10 fields = 100 questions)
// ---------------------------------------------------------------------------

const motivationTemplates = [
  {
    q: "Why did you choose to pursue a career in {field_en}?",
    q_fr: "Pourquoi avez-vous choisi de poursuivre une carrière dans {field_fr} ?",
    answer_fr: "Mon intérêt pour ce domaine est né lors de mes études à l'IMTA où j'ai découvert les enjeux passionnants du secteur. Mon stage chez {company} a confirmé ma vocation en me montrant l'impact concret de ce métier sur l'économie marocaine. Je suis motivé par les défis techniques et l'opportunité de contribuer au développement du Maroc dans ce domaine stratégique.",
    tips_fr: ["Montrez une passion authentique pour le domaine", "Reliez votre parcours à votre choix de carrière", "Mentionnez l'impact positif que vous souhaitez avoir"],
    difficulty: "beginner",
  },
  {
    q: "Where do you see yourself in 5 years in the {field_en} sector?",
    q_fr: "Où vous voyez-vous dans 5 ans dans le secteur de {field_fr} ?",
    answer_fr: "Dans 5 ans, je me vois en position de chef de projet ou responsable technique, capable de piloter des projets complexes et de mentorer des juniors. Je souhaite obtenir des certifications reconnues dans mon domaine et développer une expertise pointue. Mon objectif est de contribuer à des projets structurants pour le développement du secteur au Maroc.",
    tips_fr: ["Montrez de l'ambition réaliste", "Alignez vos objectifs avec ceux de l'entreprise", "Mentionnez le développement de compétences spécifiques"],
    difficulty: "beginner",
  },
  {
    q: "What motivates you to come to work every day in {field_en}?",
    q_fr: "Qu'est-ce qui vous motive à venir travailler chaque jour dans {field_fr} ?",
    answer_fr: "Trois choses me motivent principalement : l'apprentissage continu face aux défis techniques du secteur, la satisfaction de voir l'impact concret de mon travail, et la collaboration avec des professionnels talentueux. Chez {company}, chaque journée apportait son lot de défis et de satisfactions, ce qui rendait le travail stimulant et épanouissant.",
    tips_fr: ["Soyez authentique et spécifique", "Mentionnez des motivations intrinsèques (passion, impact)", "Évitez les motivations purement financières"],
    difficulty: "beginner",
  },
  {
    q: "Why should we hire you for this {field_en} position?",
    q_fr: "Pourquoi devrions-nous vous embaucher pour ce poste dans {field_fr} ?",
    answer_fr: "Je combine une formation d'excellence à l'IMTA avec une expérience pratique chez {company}. Ma capacité d'adaptation, ma rigueur analytique et mon esprit d'équipe sont des atouts démontrés. De plus, ma maîtrise du français, de l'arabe et de l'anglais me permet de communiquer efficacement dans un environnement multiculturel. Je suis prêt à m'investir pleinement pour contribuer à vos objectifs.",
    tips_fr: ["Reliez vos compétences aux besoins du poste", "Différenciez-vous des autres candidats", "Montrez votre motivation et votre engagement"],
    difficulty: "intermediate",
  },
  {
    q: "What do you know about our company and the {field_en} market in Morocco?",
    q_fr: "Que savez-vous de notre entreprise et du marché de {field_fr} au Maroc ?",
    answer_fr: "J'ai étudié votre entreprise en détail : votre positionnement sur le marché marocain, vos projets récents, votre culture d'entreprise et vos valeurs. Le secteur au Maroc connaît une croissance importante, portée par la stratégie nationale et les investissements publics. Votre entreprise est un acteur clé de cette dynamique, et c'est ce qui m'attire.",
    tips_fr: ["Faites des recherches approfondies avant l'entretien", "Mentionnez des projets ou réalisations spécifiques", "Montrez votre compréhension du marché marocain"],
    difficulty: "intermediate",
  },
  {
    q: "How does this {field_en} role align with your career goals?",
    q_fr: "Comment ce poste dans {field_fr} s'aligne-t-il avec vos objectifs de carrière ?",
    answer_fr: "Ce poste représente une étape clé dans mon plan de carrière. Il me permettra de développer mon expertise technique, d'acqurir de l'expérience en gestion de projet et de travailler sur des projets à fort impact. À moyen terme, cette expérience me préparera à des responsabilités élargies, en cohérence avec les opportunités de croissance que votre entreprise offre.",
    tips_fr: ["Montrez la cohérence entre le poste et vos objectifs", "Soyez réaliste et spécifique", "Indiquez ce que vous apporterez en retour"],
    difficulty: "intermediate",
  },
  {
    q: "What professional achievement are you most proud of in {field_en}?",
    q_fr: "De quelle réalisation professionnelle êtes-vous le plus fier dans {field_fr} ?",
    answer_fr: "Je suis particulièrement fier de mon projet de fin d'études chez {company}, où j'ai développé une solution innovante qui a été adoptée en production. Le projet a nécessité 6 mois de travail intense, la coordination avec 5 départements et la maîtrise de technologies nouvelles. Il a été présenté devant un jury de professionnels et a reçu la mention excellence.",
    tips_fr: ["Choisissez une réalisation pertinente pour le poste visé", "Détaillez le contexte, les défis et les résultats", "Montrez votre impact personnel"],
    difficulty: "intermediate",
  },
  {
    q: "How do you handle work-life balance in the demanding {field_en} sector?",
    q_fr: "Comment gérez-vous l'équilibre travail-vie personnelle dans le secteur exigeant de {field_fr} ?",
    answer_fr: "Je crois que la performance durable repose sur un bon équilibre. J'organise mon travail efficacement pour respecter les horaires, je pratique du sport régulièrement pour gérer le stress et je maintiens des activités personnelles enrichissantes. Quand un projet nécessite un effort supplémentaire, je m'investis pleinement mais je compense ensuite. Cette discipline me permet de rester performant sur le long terme.",
    tips_fr: ["Montrez que vous êtes capable de gérer votre énergie", "Mentionnez des activités de décompression", "Soulignez que l'équilibre favorise la performance"],
    difficulty: "beginner",
  },
  {
    q: "What salary expectations do you have for this {field_en} position?",
    q_fr: "Quelles sont vos attentes salariales pour ce poste dans {field_fr} ?",
    answer_fr: "J'ai recherché les fourchettes salariales pour ce type de poste au Maroc. Pour un profil junior avec ma formation IMTA et mon expérience de stage, je m'attends à une rémunération compétitive alignée sur le marché. Cependant, je suis plus intéressé par les opportunités de développement professionnel, la qualité de l'environnement de travail et les perspectives d'évolution. Je suis ouvert à la discussion.",
    tips_fr: ["Faites des recherches sur les salaires du marché marocain", "Ne donnez pas de chiffre précis trop tôt", "Montrez que la rémunération n'est pas votre seul critère"],
    difficulty: "advanced",
  },
  {
    q: "What questions do you have about this {field_en} position or our company?",
    q_fr: "Quelles questions avez-vous sur ce poste dans {field_fr} ou sur notre entreprise ?",
    answer_fr: "J'ai plusieurs questions : Quels sont les projets prioritaires pour les 6 prochains mois ? Comment est structurée l'équipe que je rejoindrais ? Quelles sont les opportunités de formation et d'évolution ? Comment évaluez-vous la performance ? Quelle est la culture de l'entreprise en matière d'innovation ? Ces questions me permettront de mieux comprendre comment contribuer efficacement dès mon arrivée.",
    tips_fr: ["Préparez toujours 3-5 questions pertinentes", "Posez des questions sur la culture, les projets et l'équipe", "Évitez les questions sur les vacances ou les avantages trop tôt"],
    difficulty: "beginner",
  },
];

// ---------------------------------------------------------------------------
// Question Generation Engine
// ---------------------------------------------------------------------------

function generateId(type, field, index) {
  return `q-${type}-${field}-${String(index).padStart(3, "0")}`;
}

function pickCompany(field) {
  const companies = moroccanCompanies[field] || moroccanCompanies.industrial;
  return companies[Math.floor(Math.random() * companies.length)];
}

function interpolate(text, field) {
  return text
    .replace(/\{field_en\}/g, fieldLabels[field].en)
    .replace(/\{field_fr\}/g, fieldLabels[field].fr)
    .replace(/\{company\}/g, pickCompany(field));
}

function pickDifficulty(template, index) {
  if (template.difficulty) return template.difficulty;
  return difficulties[index % difficulties.length];
}

function generateQuestions() {
  const questions = [];
  let sortOrder = 100; // Start after existing 14 questions

  // 1. Behavioral: 25 templates x 10 fields = 250
  for (const field of fields) {
    behavioralTemplates.forEach((tpl, i) => {
      questions.push({
        id: generateId("beh", field, i + 1),
        question: interpolate(tpl.q, field),
        question_fr: interpolate(tpl.q_fr, field),
        type: "behavioral",
        field,
        sample_answer: null,
        sample_answer_fr: interpolate(tpl.answer_fr, field),
        tips: JSON.stringify(["Use the STAR method", "Be specific with examples", "Quantify results when possible"]),
        tips_fr: JSON.stringify(tpl.tips_fr),
        difficulty: pickDifficulty(tpl, i),
        is_active: true,
        sort_order: sortOrder++,
      });
    });
  }

  // 2. Technical: field-specific templates (5-7 per field)
  for (const field of fields) {
    const fieldTemplates = technicalTemplatesByField[field];
    if (fieldTemplates) {
      fieldTemplates.forEach((tpl, i) => {
        questions.push({
          id: generateId("tech", field, i + 1),
          question: tpl.q,
          question_fr: tpl.q_fr,
          type: "technical",
          field,
          sample_answer: null,
          sample_answer_fr: interpolate(tpl.answer_fr, field),
          tips: JSON.stringify(["Be precise and technical", "Use specific terminology", "Give practical examples"]),
          tips_fr: JSON.stringify(tpl.tips_fr),
          difficulty: difficulties[i % difficulties.length],
          is_active: true,
          sort_order: sortOrder++,
        });
      });
    } else {
      // For fields without specific technical templates, adapt generic technical questions
      const genericTechTemplates = [
        {
          q: `What tools and software are essential in ${fieldLabels[field].en}?`,
          q_fr: `Quels outils et logiciels sont essentiels dans ${fieldLabels[field].fr} ?`,
          answer_fr: `Les outils essentiels dans ${fieldLabels[field].fr} incluent les logiciels spécifiques au secteur, les outils de gestion de projet et les plateformes collaboratives. Chez ${pickCompany(field)}, j'ai utilisé une combinaison d'outils professionnels et d'Excel avancé pour optimiser les processus. La maîtrise de ces outils améliore significativement la productivité et la qualité du travail.`,
          tips_fr: ["Listez les outils spécifiques à votre domaine", "Mentionnez votre niveau de maîtrise", "Citez des exemples d'utilisation concrète"],
        },
        {
          q: `How do you ensure regulatory compliance in ${fieldLabels[field].en}?`,
          q_fr: `Comment assurez-vous la conformité réglementaire dans ${fieldLabels[field].fr} ?`,
          answer_fr: `Je maintiens une veille réglementaire active et intègre les exigences dès la conception. Je participe aux formations de mise à jour et consulte régulièrement les textes officiels. Chez ${pickCompany(field)}, j'ai contribué à un audit de conformité qui a identifié et corrigé 3 écarts avant la visite de l'organisme de contrôle.`,
          tips_fr: ["Citez les réglementations spécifiques à votre domaine", "Mentionnez votre approche de veille réglementaire", "Donnez un exemple de mise en conformité"],
        },
        {
          q: `Describe a technical challenge you solved in ${fieldLabels[field].en}`,
          q_fr: `Décrivez un défi technique que vous avez résolu dans ${fieldLabels[field].fr}`,
          answer_fr: `Chez ${pickCompany(field)}, j'ai été confronté à un problème technique récurrent que personne n'avait pu résoudre. J'ai appliqué une démarche méthodique : analyse des données, identification de la cause racine (méthode des 5 Pourquoi) et test de solutions. La solution mise en place a éliminé le problème et a été documentée pour l'équipe.`,
          tips_fr: ["Décrivez le problème technique clairement", "Expliquez votre méthodologie de diagnostic", "Présentez la solution et son impact"],
        },
        {
          q: `How do you approach quality assurance in ${fieldLabels[field].en}?`,
          q_fr: `Comment abordez-vous l'assurance qualité dans ${fieldLabels[field].fr} ?`,
          answer_fr: `J'applique une approche qualité intégrée : contrôles à chaque étape, checklists de vérification, audits internes et amélioration continue. Chez ${pickCompany(field)}, j'ai mis en place un système de double vérification qui a réduit les erreurs de 80%. La qualité n'est pas un département, c'est la responsabilité de chacun.`,
          tips_fr: ["Mentionnez les normes qualité de votre secteur", "Décrivez votre processus de contrôle", "Citez des résultats mesurables"],
        },
        {
          q: `What key performance indicators do you track in ${fieldLabels[field].en}?`,
          q_fr: `Quels indicateurs clés de performance suivez-vous dans ${fieldLabels[field].fr} ?`,
          answer_fr: `Les KPI essentiels dans ${fieldLabels[field].fr} incluent les indicateurs de performance opérationnelle, de qualité et de coût. Chez ${pickCompany(field)}, je suivais un tableau de bord mensuel avec 10 indicateurs clés. Cette approche data-driven a permis d'identifier les tendances, d'anticiper les problèmes et d'améliorer la performance globale de 25%.`,
          tips_fr: ["Citez des KPI spécifiques à votre domaine", "Montrez comment vous utilisez les données pour décider", "Mentionnez les outils de reporting utilisés"],
        },
      ];
      genericTechTemplates.forEach((tpl, i) => {
        questions.push({
          id: generateId("tech", field, i + 1),
          question: tpl.q,
          question_fr: tpl.q_fr,
          type: "technical",
          field,
          sample_answer: null,
          sample_answer_fr: tpl.answer_fr,
          tips: JSON.stringify(["Be precise and technical", "Use specific terminology", "Give practical examples"]),
          tips_fr: JSON.stringify(tpl.tips_fr),
          difficulty: difficulties[i % difficulties.length],
          is_active: true,
          sort_order: sortOrder++,
        });
      });
    }
  }

  // 3. Situational: 20 templates x 10 fields = 200
  for (const field of fields) {
    situationalTemplates.forEach((tpl, i) => {
      questions.push({
        id: generateId("sit", field, i + 1),
        question: interpolate(tpl.q, field),
        question_fr: interpolate(tpl.q_fr, field),
        type: "situational",
        field,
        sample_answer: null,
        sample_answer_fr: interpolate(tpl.answer_fr, field),
        tips: JSON.stringify(["Think through the scenario logically", "Show your decision-making process", "Consider all stakeholders"]),
        tips_fr: JSON.stringify(tpl.tips_fr),
        difficulty: pickDifficulty(tpl, i),
        is_active: true,
        sort_order: sortOrder++,
      });
    });
  }

  // 4. Competency: 10 templates x 10 fields = 100
  for (const field of fields) {
    competencyTemplates.forEach((tpl, i) => {
      questions.push({
        id: generateId("comp", field, i + 1),
        question: interpolate(tpl.q, field),
        question_fr: interpolate(tpl.q_fr, field),
        type: "competency",
        field,
        sample_answer: null,
        sample_answer_fr: interpolate(tpl.answer_fr, field),
        tips: JSON.stringify(["Demonstrate specific competencies", "Use concrete examples", "Align with job requirements"]),
        tips_fr: JSON.stringify(tpl.tips_fr),
        difficulty: pickDifficulty(tpl, i),
        is_active: true,
        sort_order: sortOrder++,
      });
    });
  }

  // 5. Motivation: 10 templates x 10 fields = 100
  for (const field of fields) {
    motivationTemplates.forEach((tpl, i) => {
      questions.push({
        id: generateId("motiv", field, i + 1),
        question: interpolate(tpl.q, field),
        question_fr: interpolate(tpl.q_fr, field),
        type: "motivation",
        field,
        sample_answer: null,
        sample_answer_fr: interpolate(tpl.answer_fr, field),
        tips: JSON.stringify(["Be authentic and passionate", "Show alignment with the role", "Demonstrate research about the company"]),
        tips_fr: JSON.stringify(tpl.tips_fr),
        difficulty: pickDifficulty(tpl, i),
        is_active: true,
        sort_order: sortOrder++,
      });
    });
  }

  return questions;
}

// ---------------------------------------------------------------------------
// Database Insertion
// ---------------------------------------------------------------------------

async function main() {
  const client = new Client({
    host: "localhost",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "postgres",
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    const questions = generateQuestions();
    console.log(`Generated ${questions.length} questions`);

    // Show breakdown
    const breakdown = {};
    for (const q of questions) {
      const key = `${q.type} / ${q.field}`;
      breakdown[key] = (breakdown[key] || 0) + 1;
    }
    const byType = {};
    const byField = {};
    for (const q of questions) {
      byType[q.type] = (byType[q.type] || 0) + 1;
      byField[q.field] = (byField[q.field] || 0) + 1;
    }
    console.log("\nBreakdown by type:", byType);
    console.log("Breakdown by field:", byField);

    // Insert in batches of 50 for performance
    const BATCH_SIZE = 50;
    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
      const batch = questions.slice(i, i + BATCH_SIZE);

      const values = [];
      const params = [];
      let paramIndex = 1;

      for (const q of batch) {
        values.push(
          `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
        );
        params.push(
          q.id,
          q.question,
          q.question_fr,
          q.type,
          q.field,
          q.sample_answer,
          q.sample_answer_fr,
          q.tips,
          q.tips_fr,
          q.difficulty,
          q.is_active,
          q.sort_order
        );
      }

      const sql = `
        INSERT INTO interview_common_question
          (id, question, question_fr, type, field, sample_answer, sample_answer_fr, tips, tips_fr, difficulty, is_active, sort_order)
        VALUES ${values.join(",\n")}
        ON CONFLICT (id) DO NOTHING
      `;

      const result = await client.query(sql, params);
      inserted += result.rowCount;
      skipped += batch.length - result.rowCount;

      if ((i / BATCH_SIZE) % 5 === 0) {
        console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(questions.length / BATCH_SIZE)} - inserted ${result.rowCount}/${batch.length}`);
      }
    }

    console.log(`\nInsertion complete:`);
    console.log(`  New rows inserted: ${inserted}`);
    console.log(`  Skipped (already exist): ${skipped}`);

    // Verify total count
    const countResult = await client.query("SELECT COUNT(*) as total FROM interview_common_question");
    console.log(`\nTotal questions in database: ${countResult.rows[0].total}`);

    // Verify by type
    const typeCountResult = await client.query(
      "SELECT type, COUNT(*) as count FROM interview_common_question GROUP BY type ORDER BY count DESC"
    );
    console.log("\nQuestions by type:");
    for (const row of typeCountResult.rows) {
      console.log(`  ${row.type}: ${row.count}`);
    }

    // Verify by field
    const fieldCountResult = await client.query(
      "SELECT field, COUNT(*) as count FROM interview_common_question GROUP BY field ORDER BY count DESC"
    );
    console.log("\nQuestions by field:");
    for (const row of fieldCountResult.rows) {
      console.log(`  ${row.field}: ${row.count}`);
    }

    // Verify by difficulty
    const diffCountResult = await client.query(
      "SELECT difficulty, COUNT(*) as count FROM interview_common_question GROUP BY difficulty ORDER BY count DESC"
    );
    console.log("\nQuestions by difficulty:");
    for (const row of diffCountResult.rows) {
      console.log(`  ${row.difficulty}: ${row.count}`);
    }

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log("\nDisconnected from PostgreSQL");
  }
}

main();
