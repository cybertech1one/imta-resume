/**
 * Seed REAL IMTA-vocational interview content (FRENCH).
 *
 * Targets the 3 IMTA student fields used by program-features.ts:
 *   - healthcare  (infirmier, sage-femme, aide-soignant, ...)
 *   - industrial  (soudeur, cariste, maintenance, électromécanique, ...)
 *   - hse         (technicien HSE)
 *
 * The existing 649 questions / 720 tips are tagged with ACADEMIC fields
 * (génie-informatique, finance, ...) and have ZERO coverage for these
 * vocational fields. This script inserts:
 *   - interview_common_question : >=20 per field  (60+ rows)
 *   - interview_tip             : >=15 per field  (45+ rows)
 *
 * Schema (both tables, all plain TEXT columns — no enum constraints):
 *   interview_common_question(type ∈ behavioral|competency|motivation|situational|technical,
 *                             difficulty ∈ easy|medium|hard, tips/tips_fr = jsonb arrays)
 *   interview_tip(category ∈ preparation|during|after|body_language|communication|technical|...,
 *                 difficulty ∈ beginner|intermediate|advanced, tags = jsonb array)
 *
 * Idempotent: INSERT ... ON CONFLICT (id) DO NOTHING. Re-runnable.
 *
 * DB: LOCAL Windows PostgreSQL on 5432 (NOT docker). Uses DATABASE_URL from .env.
 * Usage: node scripts/seed-vocational-interview.mjs
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Load DATABASE_URL from .env (local Postgres, not docker)
// ---------------------------------------------------------------------------
function getDatabaseUrl() {
	if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
	const envText = readFileSync(join(__dirname, "..", ".env"), "utf8");
	const match = envText.match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
	if (!match) throw new Error("DATABASE_URL not found in .env");
	return match[1];
}

// ---------------------------------------------------------------------------
// Question builder helper
// ---------------------------------------------------------------------------
function q(id, field, type, difficulty, sortOrder, questionFr, sampleAnswerFr, tipsFr) {
	return {
		id,
		question: questionFr, // French-first platform; mirror FR into the EN column
		question_fr: questionFr,
		type,
		field,
		sample_answer: sampleAnswerFr,
		sample_answer_fr: sampleAnswerFr,
		tips: tipsFr,
		tips_fr: tipsFr,
		difficulty,
		sort_order: sortOrder,
	};
}

function tip(id, field, category, difficulty, sortOrder, titleFr, contentFr, tags) {
	return {
		id,
		title: titleFr,
		title_fr: titleFr,
		content: contentFr,
		content_fr: contentFr,
		category,
		field,
		tags,
		difficulty,
		sort_order: sortOrder,
	};
}

// ===========================================================================
// HEALTHCARE — infirmier / sage-femme / aide-soignant
// ===========================================================================
const HEALTHCARE_QUESTIONS = [
	q("voc-hc-q01", "healthcare", "situational", "medium", 1,
		"Comment gérez-vous un patient agité ou agressif ?",
		"Je reste calme et je parle d'une voix posée pour ne pas aggraver la situation. J'essaie d'identifier la cause de l'agitation (douleur, peur, confusion) et je me place à une distance sécuritaire sans tourner le dos. J'écoute ses préoccupations, je le rassure et j'applique le protocole de l'établissement. Si la situation devient dangereuse, j'appelle un collègue ou le médecin et je documente l'incident.",
		["Mettez la sécurité du patient et du personnel en avant", "Insistez sur l'écoute et la communication non verbale", "Mentionnez l'appel à l'aide et la traçabilité"]),
	q("voc-hc-q02", "healthcare", "technical", "hard", 2,
		"Quelle est la procédure correcte de lavage des mains et pourquoi est-elle essentielle ?",
		"J'applique la friction hydro-alcoolique ou le lavage à l'eau et au savon en respectant les 7 étapes de l'OMS pendant au moins 30 secondes : paumes, dos des mains, espaces interdigitaux, pouces, ongles et poignets. L'hygiène des mains se fait avant et après chaque contact patient, selon les 5 moments. C'est la première barrière contre les infections nosocomiales.",
		["Citez les 5 moments de l'hygiène des mains", "Mentionnez les infections nosocomiales", "Montrez votre rigueur et votre régularité"]),
	q("voc-hc-q03", "healthcare", "situational", "hard", 3,
		"Que feriez-vous en cas d'erreur de médicament ?",
		"Je le signale immédiatement à l'infirmier référent et au médecin, sans rien cacher. J'évalue l'état du patient et je surveille les effets indésirables. Je suis le protocole de l'établissement, j'administre les soins correctifs prescrits et je documente précisément l'incident dans le dossier. L'honnêteté et la sécurité du patient priment toujours sur la peur de la sanction.",
		["La sécurité du patient passe avant tout", "L'honnêteté immédiate est cruciale", "Insistez sur la déclaration et la documentation"]),
	q("voc-hc-q04", "healthcare", "situational", "medium", 4,
		"Comment priorisez-vous quand plusieurs patients ont besoin de soins en même temps ?",
		"Je trie selon l'urgence et la gravité : un patient en détresse vitale passe avant un soin de confort. J'évalue rapidement chaque situation, je délègue ce qui peut l'être à un collègue ou un aide-soignant, et je communique clairement avec l'équipe. Je documente mes décisions et je réévalue régulièrement.",
		["Connaissez les principes de triage", "Montrez une pensée systématique", "Valorisez le travail d'équipe et la délégation"]),
	q("voc-hc-q05", "healthcare", "technical", "medium", 5,
		"Comment surveillez-vous et interprétez-vous les constantes vitales d'un patient ?",
		"Je mesure la température, la fréquence cardiaque, la fréquence respiratoire, la tension artérielle et la saturation en oxygène. Je compare aux valeurs normales et aux mesures précédentes du patient pour détecter toute évolution. En cas d'anomalie (hypotension, désaturation, fièvre élevée), j'alerte le médecin, j'augmente la fréquence de surveillance et je consigne tout dans le dossier.",
		["Citez les constantes et leurs valeurs normales", "Insistez sur la comparaison et la tendance", "Mentionnez l'alerte et la traçabilité"]),
	q("voc-hc-q06", "healthcare", "behavioral", "easy", 6,
		"Pourquoi avez-vous choisi le métier de soignant ?",
		"J'ai choisi ce métier par vocation : aider les autres et accompagner les personnes vulnérables donne du sens à mon travail. Pendant mes stages à l'IMTA, j'ai confirmé que le contact humain, le soin et le sentiment d'être utile correspondaient à mes valeurs. Je suis prêt à m'investir et à continuer d'apprendre tout au long de ma carrière.",
		["Montrez une motivation sincère et humaine", "Appuyez-vous sur vos stages", "Reliez vos valeurs au soin"]),
	q("voc-hc-q07", "healthcare", "technical", "medium", 7,
		"Quelles précautions prenez-vous pour prévenir les infections nosocomiales ?",
		"J'applique les précautions standard : hygiène des mains, port des gants, masque et blouse selon le risque, désinfection du matériel et des surfaces. Je respecte le circuit du linge et des déchets (DASRI), j'isole les patients porteurs de germes résistants et je suis les protocoles d'asepsie pour les soins invasifs comme les perfusions ou les sondages.",
		["Citez les précautions standard", "Mentionnez la gestion des déchets DASRI", "Montrez votre rigueur sur l'asepsie"]),
	q("voc-hc-q08", "healthcare", "situational", "medium", 8,
		"Comment annoncez-vous une mauvaise nouvelle ou gérez-vous la détresse d'un patient ?",
		"Je m'installe dans un endroit calme, je me mets à la hauteur du patient et je parle avec empathie et des mots simples. J'écoute, je laisse de la place aux émotions et je ne minimise pas la situation. Je respecte mon champ de compétence : l'annonce médicale revient au médecin, mais j'accompagne, je rassure et je transmets les informations à l'équipe pour assurer le suivi.",
		["Montrez de l'empathie et de l'écoute", "Respectez les rôles de chacun", "Insistez sur l'accompagnement humain"]),
	q("voc-hc-q09", "healthcare", "competency", "medium", 9,
		"Décrivez votre expérience du travail en équipe pluridisciplinaire.",
		"Pendant mes stages, j'ai travaillé avec des médecins, infirmiers, aides-soignants et kinésithérapeutes. J'ai appris à transmettre des informations claires lors des relèves, à respecter les consignes et à signaler tout changement de l'état du patient. La communication et le respect mutuel sont essentiels pour la continuité et la qualité des soins.",
		["Donnez un exemple concret de stage", "Insistez sur les transmissions et la relève", "Montrez le respect des autres professionnels"]),
	q("voc-hc-q10", "healthcare", "technical", "easy", 10,
		"Comment réalisez-vous une toilette ou un soin d'hygiène en respectant la dignité du patient ?",
		"Je préviens le patient et j'obtiens son accord, je préserve son intimité en fermant la porte et en le couvrant. Je rassemble le matériel à l'avance, je respecte le sens du lavage (du plus propre au plus sale) et j'observe l'état cutané. Je communique pendant le soin, je l'encourage à participer selon ses capacités et je respecte son rythme.",
		["Insistez sur la dignité et l'intimité", "Montrez votre organisation", "Mentionnez l'observation de la peau"]),
	q("voc-hc-q11", "healthcare", "situational", "hard", 11,
		"Comment réagiriez-vous face à une urgence vitale, comme un arrêt cardiaque ?",
		"J'évalue la conscience et la respiration, j'appelle immédiatement à l'aide et j'alerte le médecin réanimateur. Je débute le massage cardiaque externe et la ventilation selon le rythme recommandé, et je prépare le chariot d'urgence et le défibrillateur. Je continue jusqu'à l'arrivée de l'équipe et je participe à la prise en charge selon mon rôle.",
		["Montrez la connaissance de la chaîne de survie", "Insistez sur l'alerte rapide", "Restez méthodique sous pression"]),
	q("voc-hc-q12", "healthcare", "technical", "medium", 12,
		"Comment assurez-vous la traçabilité et la confidentialité du dossier patient ?",
		"Je note chaque soin, observation et transmission de manière précise, datée et signée, en temps réel. Je respecte le secret professionnel : je ne divulgue aucune information sans autorisation et je sécurise l'accès au dossier. La traçabilité protège le patient, l'équipe et garantit la continuité des soins.",
		["Insistez sur le secret professionnel", "Montrez la rigueur de la documentation", "Reliez traçabilité et sécurité"]),
	q("voc-hc-q13", "healthcare", "behavioral", "medium", 13,
		"Comment gérez-vous le stress et la charge émotionnelle de ce métier ?",
		"Je m'appuie sur l'organisation et la priorisation pour ne pas me laisser déborder. Je prends du recul, je m'autorise des pauses et je parle avec mes collègues quand une situation est difficile. Je sépare ma vie professionnelle et personnelle et je pratique des activités qui me ressourcent. Demander du soutien n'est pas une faiblesse mais une force.",
		["Montrez des stratégies concrètes", "Valorisez le soutien d'équipe", "Restez positif et lucide"]),
	q("voc-hc-q14", "healthcare", "technical", "medium", 14,
		"Comment préparez-vous et administrez-vous un médicament en toute sécurité ?",
		"J'applique la règle des 5 B : le bon patient, le bon médicament, la bonne dose, la bonne voie et le bon moment, en vérifiant la prescription. Je contrôle la date de péremption et l'intégrité du produit, je me lave les mains et je trace l'administration. Je surveille les effets attendus et indésirables après l'administration.",
		["Citez la règle des 5 B", "Insistez sur la vérification de la prescription", "Mentionnez la surveillance post-administration"]),
	q("voc-hc-q15", "healthcare", "situational", "medium", 15,
		"Que faites-vous si un membre de la famille refuse un soin pour le patient ?",
		"J'écoute calmement les inquiétudes de la famille et j'explique l'intérêt du soin avec des mots simples. Je vérifie qui est le décideur légal et je respecte le droit du patient. Si le refus persiste, je n'impose rien, j'informe le médecin et l'équipe et je documente la situation. Le dialogue et le respect priment.",
		["Privilégiez le dialogue", "Respectez les droits du patient", "Impliquez le médecin et tracez"]),
	q("voc-hc-q16", "healthcare", "technical", "hard", 16,
		"Comment prévenez-vous et soignez les escarres chez un patient alité ?",
		"Je change la position du patient régulièrement (toutes les 2 à 3 heures), j'utilise des supports adaptés comme les matelas anti-escarres et je maintiens une peau propre et sèche. J'inspecte les points d'appui à chaque soin, je veille à une bonne hydratation et nutrition. En présence d'une rougeur ou d'une plaie, j'évalue le stade et j'applique le protocole de soin prescrit.",
		["Insistez sur la prévention et le changement de position", "Mentionnez l'inspection des points d'appui", "Montrez la connaissance des stades"]),
	q("voc-hc-q17", "healthcare", "motivation", "easy", 17,
		"Pourquoi souhaitez-vous travailler dans notre établissement de santé ?",
		"Votre établissement est reconnu pour la qualité de ses soins et l'accompagnement de ses équipes. Je souhaite évoluer dans une structure qui valorise la formation continue et le travail en équipe. Mon profil polyvalent et ma motivation correspondent à vos besoins, et je suis prêt à m'investir durablement au service de vos patients.",
		["Renseignez-vous sur l'établissement", "Reliez vos valeurs aux leurs", "Montrez un engagement durable"]),
	q("voc-hc-q18", "healthcare", "situational", "medium", 18,
		"Comment communiquez-vous avec un patient qui ne parle pas la même langue ou est malentendant ?",
		"J'utilise un langage simple, des gestes, des images et j'écris si besoin. Je sollicite un proche ou un interprète quand c'est possible et je m'assure que le message est compris en faisant reformuler. Je reste patient et bienveillant. L'objectif est que le patient comprenne son soin et puisse donner un consentement éclairé.",
		["Montrez de l'adaptabilité", "Vérifiez la compréhension", "Insistez sur le consentement éclairé"]),
	q("voc-hc-q19", "healthcare", "competency", "medium", 19,
		"Décrivez une situation difficile vécue en stage et comment vous l'avez gérée.",
		"Lors d'un stage, un patient s'est dégradé brutalement pendant ma surveillance. J'ai gardé mon calme, alerté immédiatement l'infirmière, pris les constantes et préparé le matériel nécessaire. Grâce à la réaction rapide de l'équipe, le patient a été stabilisé. J'ai appris l'importance de la vigilance et de la communication rapide. (Méthode STAR : Situation, Tâche, Action, Résultat.)",
		["Utilisez la méthode STAR", "Mettez en avant votre réaction", "Terminez par ce que vous avez appris"]),
	q("voc-hc-q20", "healthcare", "technical", "easy", 20,
		"Comment gérez-vous les déchets d'activités de soins (DASRI) ?",
		"Je trie les déchets à la source : les objets piquants et tranchants dans des collecteurs sécurisés et rigides, les déchets souillés dans les sacs jaunes DASRI, et les déchets ménagers à part. Je ne remplis jamais un collecteur au-delà de la limite, je le ferme correctement et je respecte le circuit d'élimination. C'est essentiel pour la sécurité de tous et la prévention des accidents d'exposition au sang.",
		["Citez le tri à la source", "Mentionnez les collecteurs sécurisés", "Reliez au risque d'exposition au sang"]),
];

// ===========================================================================
// INDUSTRIAL — soudeur / cariste / maintenance / électromécanique
// ===========================================================================
const INDUSTRIAL_QUESTIONS = [
	q("voc-ind-q01", "industrial", "technical", "medium", 1,
		"Quelles précautions de sécurité prenez-vous pour le soudage à l'arc ?",
		"Je porte les EPI adaptés : masque de soudage à teinte appropriée, gants en cuir, tablier, chaussures de sécurité et protection auditive. Je vérifie l'absence de matières inflammables, j'assure une bonne ventilation contre les fumées, je contrôle la mise à la terre et l'état des câbles. Je dispose d'un extincteur à proximité et je respecte le permis de feu.",
		["Citez les EPI spécifiques au soudage", "Mentionnez ventilation et fumées", "Parlez du permis de feu et de l'extincteur"]),
	q("voc-ind-q02", "industrial", "technical", "medium", 2,
		"Quelle est la différence entre le soudage MIG, TIG et à l'arc à l'électrode enrobée ?",
		"Le soudage à l'électrode enrobée (MMA) est polyvalent et adapté au chantier. Le MIG/MAG utilise un fil fusible sous gaz de protection, il est rapide et productif. Le TIG utilise une électrode de tungstène non fusible sous gaz inerte, il offre une grande précision et une belle finition, idéal pour l'inox et l'aluminium. Le choix dépend du matériau, de l'épaisseur et de la qualité recherchée.",
		["Comparez les procédés clairement", "Reliez le procédé au matériau", "Montrez votre maîtrise technique"]),
	q("voc-ind-q03", "industrial", "technical", "hard", 3,
		"Comment lisez-vous un plan technique et identifiez-vous les cotes et tolérances ?",
		"Je commence par le cartouche pour connaître l'échelle, l'unité et le matériau. Je repère les vues (face, dessus, coupe), je lis les cotes principales et les tolérances dimensionnelles et géométriques. Je vérifie les symboles de soudure ou d'usinage. En cas de doute, je me réfère à la nomenclature ou je demande des précisions plutôt que de supposer.",
		["Mentionnez le cartouche et l'échelle", "Parlez des cotes et tolérances", "Montrez votre rigueur de lecture"]),
	q("voc-ind-q04", "industrial", "technical", "medium", 4,
		"Quels contrôles effectuez-vous avant d'utiliser un chariot élévateur (cariste) ?",
		"Avant chaque prise de poste, je réalise une vérification : niveaux (huile, hydraulique, batterie), état des pneus, freins, klaxon, gyrophare, fourches et chaînes, et bon fonctionnement du mât. Je vérifie l'absence de fuites. Tout défaut est signalé et le chariot consigné si nécessaire. Je porte ma ceinture et je détiens le CACES correspondant.",
		["Mentionnez le CACES requis", "Citez la vérification avant prise de poste", "Insistez sur le signalement des défauts"]),
	q("voc-ind-q05", "industrial", "technical", "medium", 5,
		"Comment réalisez-vous un gerbage en hauteur en toute sécurité avec un chariot ?",
		"Je respecte la capacité de charge selon l'abaque du chariot et la hauteur de levage. Je centre la charge sur les fourches, je l'approche mât vertical, puis je lève une fois positionné face au rack. Je vérifie la stabilité de la palette et l'espace libre. Je circule toujours fourches basses et je n'autorise personne sous une charge levée.",
		["Citez l'abaque de charge", "Insistez sur la stabilité de la charge", "Mentionnez la circulation fourches basses"]),
	q("voc-ind-q06", "industrial", "technical", "hard", 6,
		"Expliquez la différence entre maintenance préventive et corrective.",
		"La maintenance préventive consiste à intervenir avant la panne, selon un planning ou l'état réel de l'équipement (graissage, contrôles, remplacement de pièces d'usure), pour éviter les arrêts. La maintenance corrective intervient après la défaillance pour remettre l'équipement en état. La préventive réduit les coûts et les arrêts non planifiés, tandis que la corrective traite l'imprévu.",
		["Définissez clairement les deux types", "Donnez des exemples concrets", "Reliez la préventive à la réduction des arrêts"]),
	q("voc-ind-q07", "industrial", "situational", "hard", 7,
		"Une machine de production tombe en panne. Quelle est votre démarche de diagnostic ?",
		"Je sécurise d'abord la zone et je consigne l'équipement (procédure LOTO) avant toute intervention. J'observe les symptômes, je consulte l'historique et le schéma. Je procède méthodiquement du plus probable au plus complexe : alimentation électrique, capteurs, actionneurs, partie mécanique. Je teste, je remplace ou répare, puis je vérifie le bon fonctionnement et je documente l'intervention.",
		["Mentionnez la consignation LOTO", "Montrez une méthode logique de diagnostic", "Insistez sur la documentation"]),
	q("voc-ind-q08", "industrial", "technical", "medium", 8,
		"Qu'est-ce que la consignation (LOTO) et pourquoi est-elle importante ?",
		"La consignation consiste à mettre hors énergie une machine avant intervention : couper l'alimentation électrique, pneumatique ou hydraulique, la verrouiller avec un cadenas et poser une étiquette d'avertissement. Cela empêche tout redémarrage accidentel pendant la maintenance. C'est une obligation de sécurité qui protège la vie de l'intervenant.",
		["Expliquez verrouillage et étiquetage", "Insistez sur la prévention du redémarrage", "Reliez à la sécurité de l'intervenant"]),
	q("voc-ind-q09", "industrial", "technical", "medium", 9,
		"Comment diagnostiquez-vous une panne électrique sur un équipement industriel ?",
		"Je consigne l'installation, puis je travaille avec mes EPI et un multimètre. Je vérifie la présence de tension, l'état des fusibles, disjoncteurs et relais, puis la continuité des câbles et l'état des contacteurs. Je m'appuie sur le schéma électrique pour suivre le circuit étape par étape. Une fois la cause identifiée et corrigée, je teste avant remise en service.",
		["Mentionnez le multimètre et le schéma", "Travaillez toujours consigné", "Suivez une démarche étape par étape"]),
	q("voc-ind-q10", "industrial", "competency", "medium", 10,
		"Décrivez votre expérience pratique acquise pendant vos stages.",
		"Pendant mes stages à l'IMTA, j'ai travaillé sur des équipements réels : opérations de maintenance, lecture de plans et application des consignes de sécurité. J'ai appris à travailler en équipe, à respecter les délais et à rendre compte de mes interventions. Cette expérience m'a permis de gagner en autonomie et en rigueur.",
		["Donnez des exemples concrets", "Valorisez l'autonomie acquise", "Reliez à la sécurité et au travail d'équipe"]),
	q("voc-ind-q11", "industrial", "technical", "medium", 11,
		"Comment contrôlez-vous la qualité d'un cordon de soudure ?",
		"Je réalise d'abord un contrôle visuel : régularité du cordon, absence de fissures, de porosités, de caniveaux ou de manque de pénétration. Je vérifie les dimensions avec un calibre de soudure. Selon les exigences, des contrôles non destructifs peuvent compléter : ressuage, magnétoscopie ou radiographie. Je corrige les défauts détectés avant validation.",
		["Citez les défauts courants", "Mentionnez le contrôle visuel et les CND", "Montrez votre exigence qualité"]),
	q("voc-ind-q12", "industrial", "situational", "medium", 12,
		"Que faites-vous si vous repérez un risque ou un danger sur votre poste de travail ?",
		"Je sécurise immédiatement la zone si je le peux et je signale le danger à mon responsable. Je ne prends aucun risque inutile et je n'attends pas que quelqu'un d'autre le fasse. Si nécessaire, j'arrête le travail jusqu'à ce que la situation soit corrigée. La sécurité prime toujours sur la production.",
		["Montrez que la sécurité prime", "Insistez sur le signalement immédiat", "Valorisez l'initiative responsable"]),
	q("voc-ind-q13", "industrial", "technical", "hard", 13,
		"Expliquez le principe d'un système hydraulique et ses composants principaux.",
		"Un système hydraulique transmet la puissance par un fluide sous pression. Les composants principaux sont la pompe (qui met le fluide en pression), le réservoir, les distributeurs (qui orientent le fluide), les vérins ou moteurs (qui transforment la pression en mouvement) et les limiteurs de pression pour la sécurité. La maintenance porte sur l'étanchéité, le niveau et la propreté du fluide.",
		["Citez pompe, distributeur et vérin", "Mentionnez le limiteur de pression", "Reliez à la maintenance de l'étanchéité"]),
	q("voc-ind-q14", "industrial", "behavioral", "easy", 14,
		"Pourquoi avez-vous choisi un métier technique industriel ?",
		"J'aime le travail concret, manuel et précis, et résoudre des problèmes techniques me motive. Voir une machine que j'ai réparée fonctionner à nouveau est gratifiant. Le secteur industriel offre de bonnes perspectives d'emploi et d'évolution. Je suis prêt à continuer d'apprendre car les technologies évoluent constamment.",
		["Montrez une motivation sincère", "Valorisez l'aspect concret du métier", "Mentionnez votre envie d'évoluer"]),
	q("voc-ind-q15", "industrial", "technical", "medium", 15,
		"Comment respectez-vous un planning de maintenance préventive (GMAO) ?",
		"Je consulte la GMAO pour connaître les interventions planifiées, je prépare le matériel et les pièces nécessaires à l'avance. Je réalise les opérations selon les gammes de maintenance, je note les observations et le temps passé, puis je clôture l'ordre de travail. Je signale toute anomalie détectée afin de planifier une intervention complémentaire si besoin.",
		["Mentionnez la GMAO et les gammes", "Insistez sur la préparation", "Montrez la traçabilité des interventions"]),
	q("voc-ind-q16", "industrial", "situational", "medium", 16,
		"Comment gérez-vous le travail sous pression pour respecter un délai de production ?",
		"Je m'organise en priorisant les tâches critiques et je reste concentré sur la qualité, car une intervention bâclée coûte plus cher au final. Je communique clairement avec mon responsable sur l'avancement et les éventuels blocages. Si le délai est intenable en toute sécurité, je le signale plutôt que de prendre des risques.",
		["Montrez votre organisation", "Ne sacrifiez jamais la sécurité", "Valorisez la communication"]),
	q("voc-ind-q17", "industrial", "technical", "medium", 17,
		"Quels EPI utilisez-vous en atelier et pourquoi ?",
		"Selon le poste, je porte des chaussures de sécurité, des lunettes ou un écran facial, des gants adaptés au risque (coupure, chaleur, produits chimiques), un casque, une protection auditive et une tenue de travail ajustée. Pour le soudage, j'ajoute un masque et un tablier en cuir. Chaque EPI protège contre un risque spécifique, et je vérifie leur état avant usage.",
		["Reliez chaque EPI à un risque", "Mentionnez la vérification de l'état", "Adaptez les EPI au poste"]),
	q("voc-ind-q18", "industrial", "motivation", "easy", 18,
		"Pourquoi voulez-vous rejoindre notre entreprise industrielle ?",
		"Votre entreprise est reconnue dans son secteur et investit dans des équipements modernes, ce qui me permettrait de progresser techniquement. J'apprécie votre culture de sécurité et de qualité. Je souhaite m'investir durablement, apporter ma rigueur et mon savoir-faire, et évoluer au sein de vos équipes.",
		["Renseignez-vous sur l'entreprise", "Reliez vos compétences à leurs besoins", "Montrez un engagement durable"]),
	q("voc-ind-q19", "industrial", "competency", "medium", 19,
		"Décrivez une panne que vous avez résolue et votre démarche.",
		"En stage, un convoyeur s'est arrêté. J'ai consigné la machine, observé les symptômes et identifié grâce au schéma qu'un capteur de fin de course était défectueux. Je l'ai remplacé, testé le fonctionnement et remis en production. J'ai documenté l'intervention. L'arrêt a été réduit au minimum grâce à une méthode rigoureuse. (Méthode STAR.)",
		["Utilisez la méthode STAR", "Montrez votre démarche logique", "Terminez par le résultat concret"]),
	q("voc-ind-q20", "industrial", "technical", "medium", 20,
		"Comment manipulez-vous et stockez-vous une charge lourde en sécurité ?",
		"J'évalue le poids et le centre de gravité, je choisis le moyen de manutention adapté (chariot, transpalette, pont roulant) et j'élingue correctement la charge. Pour une manutention manuelle, j'adopte une posture sûre : dos droit, flexion des genoux. Je stocke les charges lourdes en bas, je respecte les capacités des racks et je dégage les voies de circulation.",
		["Mentionnez l'évaluation de la charge", "Citez la posture sûre", "Respectez les capacités de stockage"]),
];

// ===========================================================================
// HSE — technicien Hygiène Sécurité Environnement
// ===========================================================================
const HSE_QUESTIONS = [
	q("voc-hse-q01", "hse", "technical", "hard", 1,
		"Comment réalisez-vous une évaluation des risques professionnels ?",
		"J'identifie les dangers à chaque poste, puis j'évalue chaque risque en croisant la gravité et la probabilité d'occurrence à l'aide d'une matrice de criticité. Je hiérarchise les risques, puis je propose des mesures de prévention selon la hiérarchie : suppression, substitution, protection collective, puis EPI. Je consigne le tout dans le document unique (DUERP) et je le révise régulièrement.",
		["Citez la matrice gravité × probabilité", "Mentionnez le document unique (DUERP)", "Respectez la hiérarchie des mesures"]),
	q("voc-hse-q02", "hse", "situational", "hard", 2,
		"Que feriez-vous si vous découvriez une violation grave de sécurité ?",
		"Si un danger grave et imminent existe, je fais arrêter l'activité immédiatement pour protéger les personnes. Je sécurise la zone, je signale à la hiérarchie et je documente la situation. J'analyse la cause et je propose des actions correctives, puis je vérifie leur mise en œuvre. La sécurité des personnes passe toujours avant la production.",
		["La sécurité des personnes prime", "Mentionnez le droit d'arrêt", "Insistez sur les actions correctives et le suivi"]),
	q("voc-hse-q03", "hse", "technical", "medium", 3,
		"Comment choisissez-vous les EPI adaptés à une tâche donnée ?",
		"Je pars de l'évaluation des risques du poste : je détermine les risques (chimique, mécanique, thermique, bruit, chute) puis je sélectionne les EPI normés correspondants. Je vérifie qu'ils sont conformes (marquage CE), bien ajustés et compatibles entre eux. Je forme le personnel à leur port et leur entretien, et je m'assure de leur disponibilité. L'EPI reste le dernier rempart après les protections collectives.",
		["Partez de l'évaluation des risques", "Mentionnez le marquage CE et les normes", "Rappelez la priorité aux protections collectives"]),
	q("voc-hse-q04", "hse", "technical", "medium", 4,
		"Quelle est la hiérarchie des mesures de prévention ?",
		"La hiérarchie va du plus efficace au moins efficace : d'abord supprimer le danger, sinon le substituer par quelque chose de moins dangereux, puis mettre en place des mesures techniques et des protections collectives, ensuite des mesures organisationnelles, et enfin les EPI en dernier recours. On privilégie toujours les solutions qui protègent collectivement et à la source.",
		["Citez l'ordre exact des mesures", "Mettez l'EPI en dernier", "Privilégiez la prévention à la source"]),
	q("voc-hse-q05", "hse", "situational", "medium", 5,
		"Comment menez-vous une enquête après un accident du travail ?",
		"Je sécurise d'abord la zone et je m'assure de la prise en charge de la victime. Je recueille les faits sans chercher de coupable : témoignages, photos, conditions de travail. J'analyse les causes profondes avec une méthode comme l'arbre des causes ou les 5 pourquoi. Je propose des actions correctives, je les planifie et je vérifie leur efficacité pour éviter la récidive.",
		["Cherchez les causes, pas les coupables", "Citez l'arbre des causes ou les 5 pourquoi", "Insistez sur les actions correctives"]),
	q("voc-hse-q06", "hse", "technical", "hard", 6,
		"Que connaissez-vous des normes ISO 45001 et ISO 14001 ?",
		"L'ISO 45001 est la norme de management de la santé et sécurité au travail : elle aide à réduire les risques d'accidents par une approche structurée et l'amélioration continue. L'ISO 14001 concerne le management environnemental : maîtrise des impacts, gestion des déchets et des rejets, conformité réglementaire. Les deux reposent sur le cycle PDCA (Planifier, Faire, Vérifier, Agir).",
		["Distinguez bien 45001 et 14001", "Mentionnez le cycle PDCA", "Reliez à l'amélioration continue"]),
	q("voc-hse-q07", "hse", "technical", "medium", 7,
		"Comment élaborez-vous un plan d'évacuation et d'intervention d'urgence ?",
		"J'identifie les scénarios d'urgence (incendie, fuite, séisme), je définis les itinéraires d'évacuation, les issues de secours et les points de rassemblement. Je désigne et forme les équipiers de première intervention et les guides-files. J'organise des exercices d'évacuation réguliers, je vérifie la signalétique et les moyens de secours, puis j'analyse les exercices pour améliorer le plan.",
		["Citez itinéraires et points de rassemblement", "Mentionnez les exercices réguliers", "Insistez sur l'amélioration continue"]),
	q("voc-hse-q08", "hse", "technical", "medium", 8,
		"Comment gérez-vous les produits chimiques dangereux sur un site ?",
		"Je m'appuie sur les fiches de données de sécurité (FDS) pour connaître les dangers, le stockage et les EPI requis. Je veille à l'étiquetage selon le règlement CLP, à la séparation des produits incompatibles, à la rétention contre les fuites et à la ventilation. Je forme le personnel et je prévois les moyens d'intervention en cas de déversement.",
		["Mentionnez les FDS et le CLP", "Parlez de la rétention et de l'incompatibilité", "Insistez sur la formation du personnel"]),
	q("voc-hse-q09", "hse", "competency", "medium", 9,
		"Comment sensibilisez-vous et formez-vous le personnel à la sécurité ?",
		"J'organise des causeries sécurité courtes et régulières, des formations pratiques et des affichages clairs. J'adapte mon discours au public et j'utilise des exemples concrets de l'entreprise. J'implique les opérateurs pour qu'ils s'approprient les consignes plutôt que de les subir. Je mesure l'efficacité par le suivi des comportements et la baisse des incidents.",
		["Mentionnez les causeries sécurité", "Adaptez le message au public", "Impliquez les opérateurs"]),
	q("voc-hse-q10", "hse", "technical", "hard", 10,
		"Qu'est-ce qu'un permis de travail et quand est-il nécessaire ?",
		"Un permis de travail est une autorisation écrite encadrant les travaux à risque : travail par point chaud (permis de feu), espace confiné, travail en hauteur ou électrique. Il définit les précautions, les vérifications préalables, les responsables et la durée. Il garantit que les risques sont identifiés et maîtrisés avant le début des travaux et coordonne les intervenants.",
		["Citez les types de permis", "Expliquez son rôle de maîtrise des risques", "Mentionnez la coordination des intervenants"]),
	q("voc-hse-q11", "hse", "situational", "medium", 11,
		"Comment réagissez-vous face à un début d'incendie ?",
		"Je donne l'alerte, je fais évacuer les personnes vers le point de rassemblement et j'alerte les secours. Si le feu est naissant et que je suis formé, j'utilise l'extincteur adapté à la classe de feu sans me mettre en danger. Je n'interviens jamais au péril de ma vie. Après l'événement, je participe au retour d'expérience.",
		["L'alerte et l'évacuation d'abord", "Choisissez l'extincteur selon la classe de feu", "Ne prenez jamais de risque vital"]),
	q("voc-hse-q12", "hse", "technical", "medium", 12,
		"Comment assurez-vous le suivi des indicateurs HSE (taux de fréquence, gravité) ?",
		"Je collecte les données des incidents, accidents et presqu'accidents, puis je calcule les indicateurs comme le taux de fréquence et le taux de gravité. J'analyse les tendances, je les présente à la direction et je définis des objectifs d'amélioration. Le suivi des presqu'accidents est précieux car il permet d'agir avant l'accident réel.",
		["Citez les taux de fréquence et de gravité", "Valorisez le suivi des presqu'accidents", "Reliez aux objectifs d'amélioration"]),
	q("voc-hse-q13", "hse", "technical", "hard", 13,
		"Quelles précautions prenez-vous pour le travail en espace confiné ?",
		"Je délivre un permis spécifique, je mesure l'atmosphère (oxygène, gaz toxiques, explosivité) avant et pendant l'intervention. J'assure une ventilation, je prévois un surveillant à l'extérieur en contact permanent, des moyens de communication et un dispositif de sauvetage. Le travailleur porte un harnais et les EPI adaptés. On n'entre jamais seul.",
		["Mentionnez la mesure d'atmosphère", "Insistez sur le surveillant extérieur", "Citez le permis et le sauvetage"]),
	q("voc-hse-q14", "hse", "behavioral", "easy", 14,
		"Pourquoi avez-vous choisi le métier de technicien HSE ?",
		"La prévention me passionne : protéger la santé des personnes et l'environnement donne un sens fort à mon travail. J'aime allier technique, réglementation et relationnel pour faire évoluer les comportements. C'est un métier d'avenir, exigeant et valorisé dans l'industrie, où je peux avoir un impact concret au quotidien.",
		["Montrez une motivation sincère", "Reliez vos valeurs à la prévention", "Mentionnez l'aspect humain et technique"]),
	q("voc-hse-q15", "hse", "competency", "medium", 15,
		"Comment gérez-vous la résistance des opérateurs aux consignes de sécurité ?",
		"J'écoute leurs contraintes plutôt que d'imposer : souvent la résistance vient d'une consigne mal comprise ou inadaptée au terrain. J'explique le pourquoi, je montre l'intérêt concret pour leur propre sécurité et je les implique dans la recherche de solutions. L'exemplarité de l'encadrement et la valorisation des bons comportements sont essentielles.",
		["Privilégiez l'écoute et l'explication", "Impliquez les opérateurs", "Misez sur l'exemplarité"]),
	q("voc-hse-q16", "hse", "technical", "medium", 16,
		"Comment gérez-vous les déchets industriels dans une démarche environnementale ?",
		"Je trie les déchets à la source par catégorie (dangereux, non dangereux, recyclables), je veille à un stockage conforme avec rétention pour les déchets dangereux, et je travaille avec des filières d'élimination agréées. Je tiens un registre des déchets et je suis les bordereaux de suivi (BSD). Je cherche aussi à réduire les déchets à la source.",
		["Mentionnez le tri à la source", "Citez les filières agréées et le BSD", "Valorisez la réduction à la source"]),
	q("voc-hse-q17", "hse", "situational", "medium", 17,
		"Comment réalisez-vous un audit ou une visite de sécurité sur le terrain ?",
		"Je prépare une grille d'observation basée sur la réglementation et les risques du site. Sur le terrain, j'observe les comportements, l'état des équipements, le port des EPI et le respect des consignes. Je dialogue avec les opérateurs, je note les écarts et les bonnes pratiques, puis je rédige un rapport avec un plan d'actions hiérarchisé et un suivi de la mise en œuvre.",
		["Préparez une grille d'audit", "Notez écarts ET bonnes pratiques", "Insistez sur le plan d'actions et le suivi"]),
	q("voc-hse-q18", "hse", "motivation", "easy", 18,
		"Pourquoi voulez-vous travailler dans notre entreprise comme technicien HSE ?",
		"Votre entreprise opère dans un secteur à enjeux de sécurité importants où le rôle HSE est stratégique. J'apprécie votre engagement en matière de prévention et je souhaite contribuer à une culture sécurité forte. Mon profil polyvalent et ma rigueur correspondent à vos besoins, et je veux m'investir durablement pour protéger vos équipes et l'environnement.",
		["Renseignez-vous sur les enjeux de l'entreprise", "Reliez vos compétences à leurs besoins", "Montrez un engagement durable"]),
	q("voc-hse-q19", "hse", "competency", "medium", 19,
		"Décrivez une action de prévention que vous avez mise en place en stage.",
		"En stage, j'ai constaté que des opérateurs ne portaient pas systématiquement leurs protections auditives dans une zone bruyante. J'ai mesuré le niveau sonore, expliqué les risques de surdité, mis à disposition des bouchons et installé une signalétique. Le taux de port a nettement augmenté. J'ai appris l'importance de combiner technique, pédagogie et suivi. (Méthode STAR.)",
		["Utilisez la méthode STAR", "Montrez l'impact mesurable", "Combinez technique et pédagogie"]),
	q("voc-hse-q20", "hse", "technical", "hard", 20,
		"Comment veillez-vous à la conformité réglementaire en matière de sécurité ?",
		"Je réalise une veille réglementaire régulière pour suivre l'évolution des textes applicables. J'établis et tiens à jour un référentiel de conformité, je réalise des audits réguliers pour identifier les écarts, et je planifie les mises en conformité. Je m'assure que les vérifications réglementaires périodiques des équipements sont réalisées et tracées.",
		["Mentionnez la veille réglementaire", "Citez les audits de conformité", "Insistez sur les vérifications périodiques"]),
];

// ===========================================================================
// TIPS — >=15 per field
// ===========================================================================
const HEALTHCARE_TIPS = [
	tip("voc-hc-t01", "healthcare", "preparation", "beginner", 1, "Connaissez l'établissement de santé", "Renseignez-vous sur le type de structure (hôpital, clinique, EHPAD), ses services et ses valeurs avant l'entretien.", ["préparation", "recherche", "santé"]),
	tip("voc-hc-t02", "healthcare", "preparation", "beginner", 2, "Préparez vos documents et diplômes", "Apportez votre CV, vos diplômes, attestations de stage et votre carte professionnelle si vous en avez une.", ["préparation", "documents", "santé"]),
	tip("voc-hc-t03", "healthcare", "preparation", "intermediate", 3, "Maîtrisez les gestes et protocoles de base", "Révisez l'hygiène des mains, les précautions standard, la prise des constantes et la règle des 5 B avant l'entretien technique.", ["préparation", "technique", "protocoles"]),
	tip("voc-hc-t04", "healthcare", "preparation", "intermediate", 4, "Préparez des exemples de stage", "Pensez à 2-3 situations vécues en stage (urgence, patient difficile, travail d'équipe) pour illustrer vos réponses.", ["préparation", "exemples", "STAR"]),
	tip("voc-hc-t05", "healthcare", "appearance", "beginner", 5, "Soignez une présentation impeccable", "Tenue sobre et propre, ongles courts, cheveux attachés, pas de bijoux. L'hygiène fait partie du professionnalisme soignant.", ["présentation", "hygiène", "tenue"]),
	tip("voc-hc-t06", "healthcare", "communication", "intermediate", 6, "Montrez votre empathie", "Le recruteur cherche un soignant humain. Mettez en avant votre écoute, votre bienveillance et votre respect du patient.", ["communication", "empathie", "relationnel"]),
	tip("voc-hc-t07", "healthcare", "during", "beginner", 7, "Insistez sur la sécurité du patient", "Pour toute question de mise en situation, montrez que la sécurité et le bien-être du patient guident vos décisions.", ["sécurité", "patient", "entretien"]),
	tip("voc-hc-t08", "healthcare", "behavioral", "intermediate", 8, "Assumez l'erreur avec honnêteté", "Face à une question sur une erreur de soin, valorisez la déclaration immédiate et la transparence plutôt que de cacher.", ["comportement", "honnêteté", "sécurité"]),
	tip("voc-hc-t09", "healthcare", "communication", "intermediate", 9, "Démontrez votre esprit d'équipe", "Le soin est collectif. Parlez des transmissions, de la relève et du respect des autres professionnels de santé.", ["communication", "équipe", "transmissions"]),
	tip("voc-hc-t10", "healthcare", "during", "intermediate", 10, "Gérez le stress avec recul", "Montrez que vous savez rester calme et organisé sous pression : c'est essentiel dans un service de soins.", ["stress", "calme", "entretien"]),
	tip("voc-hc-t11", "healthcare", "during", "intermediate", 11, "Valorisez le respect du secret professionnel", "Insistez sur la confidentialité du dossier patient et le respect du secret médical : c'est une obligation déontologique.", ["confidentialité", "déontologie", "patient"]),
	tip("voc-hc-t12", "healthcare", "during", "beginner", 12, "Exprimez votre disponibilité", "Les horaires de soins incluent nuits, week-ends et jours fériés. Montrez votre flexibilité et votre engagement.", ["disponibilité", "horaires", "engagement"]),
	tip("voc-hc-t13", "healthcare", "during", "intermediate", 13, "Posez des questions sur le service", "Demandez la composition de l'équipe, le type de patients ou les protocoles : cela montre votre intérêt et votre sérieux.", ["questions", "engagement", "entretien"]),
	tip("voc-hc-t14", "healthcare", "preparation", "intermediate", 14, "Mettez en avant la formation continue", "Le secteur de la santé évolue. Montrez votre volonté de vous former en continu (nouveaux protocoles, gestes d'urgence).", ["formation", "évolution", "motivation"]),
	tip("voc-hc-t15", "healthcare", "after", "beginner", 15, "Envoyez un message de remerciement", "Un bref email de remerciement dans les 24h montre votre motivation et votre professionnalisme.", ["après", "remerciement", "suivi"]),
	tip("voc-hc-t16", "healthcare", "during", "advanced", 16, "Connaissez vos limites de compétence", "Montrez que vous savez quand alerter le médecin ou l'infirmier : reconnaître ses limites est une qualité professionnelle.", ["compétence", "sécurité", "responsabilité"]),
];

const INDUSTRIAL_TIPS = [
	tip("voc-ind-t01", "industrial", "preparation", "beginner", 1, "Renseignez-vous sur l'entreprise et le secteur", "Identifiez l'activité (production, BTP, automobile), les équipements utilisés et les exigences de sécurité avant l'entretien.", ["préparation", "recherche", "industrie"]),
	tip("voc-ind-t02", "industrial", "preparation", "beginner", 2, "Apportez vos certifications", "Présentez vos diplômes, CACES, habilitations électriques ou certificats de soudage : ils sont déterminants.", ["préparation", "certifications", "CACES"]),
	tip("voc-ind-t03", "industrial", "preparation", "intermediate", 3, "Révisez les bases techniques de votre métier", "Préparez les notions clés : lecture de plans, procédés de soudage, maintenance préventive/corrective, hydraulique selon votre spécialité.", ["préparation", "technique", "métier"]),
	tip("voc-ind-t04", "industrial", "during", "beginner", 4, "Mettez la sécurité au premier plan", "Dans chaque réponse technique, montrez le réflexe sécurité : EPI, consignation (LOTO), permis de travail.", ["sécurité", "EPI", "LOTO"]),
	tip("voc-ind-t05", "industrial", "appearance", "beginner", 5, "Présentez-vous proprement", "Tenue propre et soignée. Même pour un poste en atelier, une présentation correcte montre votre sérieux.", ["présentation", "tenue", "professionnalisme"]),
	tip("voc-ind-t06", "industrial", "technical", "intermediate", 6, "Préparez des exemples de pannes résolues", "Décrivez une panne diagnostiquée et réparée en stage : c'est la meilleure preuve de vos compétences pratiques.", ["technique", "exemples", "diagnostic"]),
	tip("voc-ind-t07", "industrial", "during", "intermediate", 7, "Valorisez votre rigueur et votre précision", "Le travail industriel exige de la minutie. Montrez votre méthode, votre respect des cotes et des procédures.", ["rigueur", "précision", "méthode"]),
	tip("voc-ind-t08", "industrial", "behavioral", "intermediate", 8, "Montrez votre esprit d'équipe", "La production repose sur la coordination. Parlez de communication et d'entraide entre opérateurs et services.", ["comportement", "équipe", "communication"]),
	tip("voc-ind-t09", "industrial", "during", "beginner", 9, "Exprimez votre disponibilité aux horaires postés", "L'industrie fonctionne souvent en 3x8 ou en équipes. Montrez votre flexibilité et votre fiabilité.", ["disponibilité", "horaires", "fiabilité"]),
	tip("voc-ind-t10", "industrial", "technical", "intermediate", 10, "Connaissez vos outils et instruments", "Sachez parler des outils que vous maîtrisez : multimètre, pied à coulisse, calibres, GMAO selon votre métier.", ["technique", "outils", "compétences"]),
	tip("voc-ind-t11", "industrial", "during", "intermediate", 11, "Montrez votre capacité à respecter les délais", "La production est rythmée. Montrez que vous savez vous organiser sans sacrifier la qualité ni la sécurité.", ["organisation", "délais", "qualité"]),
	tip("voc-ind-t12", "industrial", "during", "intermediate", 12, "Posez des questions sur le poste", "Renseignez-vous sur les équipements, l'équipe et la culture sécurité : cela montre votre motivation.", ["questions", "engagement", "entretien"]),
	tip("voc-ind-t13", "industrial", "preparation", "intermediate", 13, "Valorisez votre volonté d'apprendre", "Les machines évoluent (automatisation, robotique). Montrez votre envie de monter en compétence.", ["formation", "évolution", "motivation"]),
	tip("voc-ind-t14", "industrial", "during", "beginner", 14, "Restez concret et factuel", "Évitez le jargon flou. Donnez des exemples précis de ce que vous avez réalisé et des résultats obtenus.", ["communication", "exemples", "concret"]),
	tip("voc-ind-t15", "industrial", "after", "beginner", 15, "Remerciez après l'entretien", "Un bref message de remerciement renforce votre image de candidat sérieux et motivé.", ["après", "remerciement", "suivi"]),
	tip("voc-ind-t16", "industrial", "technical", "advanced", 16, "Connaissez la qualité et les normes", "Montrez que vous comprenez les exigences qualité (contrôle, tolérances, CND pour la soudure) : c'est valorisé.", ["qualité", "normes", "contrôle"]),
];

const HSE_TIPS = [
	tip("voc-hse-t01", "hse", "preparation", "beginner", 1, "Étudiez les risques du secteur", "Renseignez-vous sur l'activité de l'entreprise et ses risques majeurs (chimique, mécanique, incendie) avant l'entretien.", ["préparation", "recherche", "risques"]),
	tip("voc-hse-t02", "hse", "preparation", "intermediate", 2, "Maîtrisez la réglementation et les normes", "Révisez les bases : document unique (DUERP), ISO 45001, ISO 14001, hiérarchie des mesures de prévention.", ["préparation", "réglementation", "normes"]),
	tip("voc-hse-t03", "hse", "preparation", "intermediate", 3, "Connaissez les méthodes d'analyse", "Préparez les outils clés : matrice de criticité, arbre des causes, 5 pourquoi, évaluation des risques.", ["préparation", "méthodes", "analyse"]),
	tip("voc-hse-t04", "hse", "during", "intermediate", 4, "Affirmez que la sécurité prime", "Montrez que, pour vous, la protection des personnes passe avant la production : c'est le cœur du métier HSE.", ["sécurité", "valeurs", "prévention"]),
	tip("voc-hse-t05", "hse", "appearance", "beginner", 5, "Présentez-vous de façon professionnelle", "Tenue sobre et soignée. Le technicien HSE incarne la rigueur et l'exemplarité, dès l'entretien.", ["présentation", "tenue", "exemplarité"]),
	tip("voc-hse-t06", "hse", "communication", "advanced", 6, "Démontrez vos compétences relationnelles", "Le métier exige de convaincre et de former. Mettez en avant votre pédagogie et votre capacité à faire adhérer.", ["communication", "pédagogie", "influence"]),
	tip("voc-hse-t07", "hse", "technical", "intermediate", 7, "Préparez des exemples de prévention", "Décrivez une action de prévention menée en stage avec un résultat mesurable : c'est très valorisé.", ["technique", "exemples", "prévention"]),
	tip("voc-hse-t08", "hse", "during", "intermediate", 8, "Valorisez le suivi des presqu'accidents", "Montrez que vous savez exploiter les presqu'accidents et les indicateurs (taux de fréquence et de gravité).", ["indicateurs", "prévention", "analyse"]),
	tip("voc-hse-t09", "hse", "behavioral", "advanced", 9, "Montrez votre diplomatie face à la résistance", "Expliquez comment vous gérez la résistance des opérateurs : écoute, explication du pourquoi, implication.", ["comportement", "diplomatie", "terrain"]),
	tip("voc-hse-t10", "hse", "technical", "advanced", 10, "Connaissez les permis de travail", "Sachez expliquer les permis (feu, espace confiné, hauteur) et leur rôle dans la maîtrise des risques.", ["technique", "permis", "procédures"]),
	tip("voc-hse-t11", "hse", "during", "intermediate", 11, "Insistez sur la dimension environnementale", "Le E de HSE compte : parlez gestion des déchets, filières agréées et réduction des impacts environnementaux.", ["environnement", "déchets", "conformité"]),
	tip("voc-hse-t12", "hse", "during", "intermediate", 12, "Montrez votre rigueur documentaire", "La traçabilité est essentielle : audits, rapports, plans d'actions, registres. Valorisez votre sens de l'organisation.", ["rigueur", "documentation", "traçabilité"]),
	tip("voc-hse-t13", "hse", "during", "intermediate", 13, "Posez des questions sur la culture sécurité", "Demandez quels sont les indicateurs suivis et l'engagement de la direction : cela montre votre maturité HSE.", ["questions", "culture", "entretien"]),
	tip("voc-hse-t14", "hse", "preparation", "intermediate", 14, "Restez à jour sur la veille réglementaire", "Montrez que vous suivez l'évolution des textes : la veille réglementaire est une compétence clé du métier.", ["veille", "réglementation", "conformité"]),
	tip("voc-hse-t15", "hse", "after", "beginner", 15, "Envoyez un remerciement structuré", "Un email de remerciement clair et professionnel renforce votre crédibilité de futur acteur de la prévention.", ["après", "remerciement", "suivi"]),
	tip("voc-hse-t16", "hse", "during", "advanced", 16, "Pensez amélioration continue (PDCA)", "Montrez votre logique d'amélioration continue (Planifier, Faire, Vérifier, Agir) : c'est l'esprit des normes HSE.", ["amélioration", "PDCA", "méthode"]),
];

// ===========================================================================
// Insert helpers
// ===========================================================================
async function insertQuestions(client, rows) {
	let inserted = 0;
	for (const r of rows) {
		const res = await client.query(
			`INSERT INTO interview_common_question
				(id, question, question_fr, type, field, sample_answer, sample_answer_fr, tips, tips_fr, difficulty, is_active, sort_order)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,true,$11)
			 ON CONFLICT (id) DO NOTHING`,
			[
				r.id, r.question, r.question_fr, r.type, r.field,
				r.sample_answer, r.sample_answer_fr,
				JSON.stringify(r.tips), JSON.stringify(r.tips_fr),
				r.difficulty, r.sort_order,
			],
		);
		inserted += res.rowCount;
	}
	return inserted;
}

async function insertTips(client, rows) {
	let inserted = 0;
	for (const r of rows) {
		const res = await client.query(
			`INSERT INTO interview_tip
				(id, title, title_fr, content, content_fr, category, field, tags, difficulty, is_active, sort_order)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,true,$10)
			 ON CONFLICT (id) DO NOTHING`,
			[
				r.id, r.title, r.title_fr, r.content, r.content_fr,
				r.category, r.field, JSON.stringify(r.tags), r.difficulty, r.sort_order,
			],
		);
		inserted += res.rowCount;
	}
	return inserted;
}

// ===========================================================================
// Main
// ===========================================================================
async function main() {
	console.log("=== Vocational Interview Content Seeder (FR) ===\n");
	const client = new Client({ connectionString: getDatabaseUrl() });
	await client.connect();

	const allQuestions = [...HEALTHCARE_QUESTIONS, ...INDUSTRIAL_QUESTIONS, ...HSE_QUESTIONS];
	const allTips = [...HEALTHCARE_TIPS, ...INDUSTRIAL_TIPS, ...HSE_TIPS];

	console.log(`Prepared ${allQuestions.length} questions and ${allTips.length} tips.\n`);

	const qInserted = await insertQuestions(client, allQuestions);
	console.log(`interview_common_question: ${qInserted} new rows inserted (${allQuestions.length - qInserted} already existed).`);

	const tInserted = await insertTips(client, allTips);
	console.log(`interview_tip:             ${tInserted} new rows inserted (${allTips.length - tInserted} already existed).\n`);

	// Verify per-field counts for vocational fields
	const fields = ["healthcare", "industrial", "hse"];
	console.log("=== Per-field counts (vocational fields) ===");
	const qCounts = await client.query(
		`SELECT field, count(*)::int AS n FROM interview_common_question WHERE field = ANY($1) GROUP BY field ORDER BY field`,
		[fields],
	);
	console.log("\ninterview_common_question:");
	for (const row of qCounts.rows) console.log(`  ${row.field.padEnd(12)} ${row.n}`);

	const tCounts = await client.query(
		`SELECT field, count(*)::int AS n FROM interview_tip WHERE field = ANY($1) GROUP BY field ORDER BY field`,
		[fields],
	);
	console.log("\ninterview_tip:");
	for (const row of tCounts.rows) console.log(`  ${row.field.padEnd(12)} ${row.n}`);

	await client.end();
	console.log("\n=== Done ===");
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
