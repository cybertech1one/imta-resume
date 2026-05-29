import pg from "pg";
const { Client } = pg;

const c = new Client({
  host: "localhost",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "postgres",
});
await c.connect();

// Ensure difficulty column exists
try {
  await c.query(`ALTER TABLE interview_tip ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'beginner'`);
  console.log("✓ difficulty column ensured");
} catch (e) {
  console.log("difficulty column note:", e.message.substring(0, 80));
}

// ── 10 categories × 12 fields × 3 difficulties = 200+ tips ──────────────────
const tips = [

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY: preparation
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "preparation", field: "general", difficulty: "beginner",
    title: "Create a professional email address before applying",
    title_fr: "Créez une adresse email professionnelle avant de postuler",
    content: "Use firstname.lastname@gmail.com format. Avoid nicknames or numbers. Moroccan recruiters on Rekrute.com and Emploi.ma notice unprofessional emails immediately.",
    content_fr: "Utilisez le format prenom.nom@gmail.com. Évitez les surnoms ou chiffres. Les recruteurs marocains sur Rekrute.com et Emploi.ma remarquent immédiatement les emails non professionnels.",
    tags: ["email", "professionalism", "first-impression"]
  },
  {
    category: "preparation", field: "general", difficulty: "beginner",
    title: "Prepare your CNI or passport copy for the interview",
    title_fr: "Préparez une copie de votre CNI ou passeport pour l'entretien",
    content: "Many Moroccan employers request an ID copy during the interview process, especially for ANAPEC contract enrollment (Idmaj/Taehil). Have it ready.",
    content_fr: "De nombreux employeurs marocains demandent une copie de pièce d'identité lors du processus d'entretien, surtout pour l'inscription aux contrats ANAPEC (Idmaj/Taehil). Ayez-la prête.",
    tags: ["documents", "morocco", "anapec", "cni"]
  },
  {
    category: "preparation", field: "general", difficulty: "intermediate",
    title: "Map the interview location and plan transport the day before",
    title_fr: "Repérez le lieu d'entretien et planifiez le transport la veille",
    content: "Casablanca and Rabat traffic can add 30-60 minutes. Use Google Maps during rush hour to estimate. Consider tram lines in Casa or Rabat for reliability.",
    content_fr: "Le trafic à Casablanca et Rabat peut ajouter 30-60 minutes. Utilisez Google Maps aux heures de pointe pour estimer. Considérez les lignes de tramway à Casa ou Rabat pour la fiabilité.",
    tags: ["transport", "planning", "casablanca", "rabat"]
  },
  {
    category: "preparation", field: "general", difficulty: "advanced",
    title: "Research the company's standing on the Casablanca Stock Exchange",
    title_fr: "Recherchez la position de l'entreprise à la Bourse de Casablanca",
    content: "For MASI-listed companies, review their cours d'action, dividends, and analyst reports on bfrgroup.net. Mentioning financial performance shows deep research.",
    content_fr: "Pour les sociétés cotées au MASI, consultez leur cours d'action, dividendes et rapports d'analystes sur bfrgroup.net. Mentionner la performance financière démontre une recherche approfondie.",
    tags: ["stock-exchange", "research", "masi", "advanced"]
  },
  {
    category: "preparation", field: "genie-informatique", difficulty: "beginner",
    title: "Set up a clean GitHub profile with pinned projects",
    title_fr: "Configurez un profil GitHub propre avec des projets épinglés",
    content: "Pin 3-6 of your best repos, add README files with screenshots, and ensure your commit history is active. Moroccan IT companies like HPS and S2M check GitHub.",
    content_fr: "Épinglez 3-6 de vos meilleurs repos, ajoutez des README avec captures d'écran, et assurez-vous que votre historique de commits est actif. Les entreprises IT marocaines comme HPS et S2M vérifient GitHub.",
    tags: ["github", "portfolio", "it-morocco"]
  },
  {
    category: "preparation", field: "genie-informatique", difficulty: "intermediate",
    title: "Practice system design questions for 30 minutes daily",
    title_fr: "Pratiquez les questions de conception système 30 minutes par jour",
    content: "Moroccan tech companies like Capgemini, CGI, and Atos ask system design. Practice designing URL shorteners, chat systems, and notification services.",
    content_fr: "Les entreprises tech marocaines comme Capgemini, CGI et Atos posent des questions de conception système. Entraînez-vous à concevoir des raccourcisseurs d'URL, systèmes de chat et services de notification.",
    tags: ["system-design", "practice", "tech-companies"]
  },
  {
    category: "preparation", field: "genie-industriel", difficulty: "intermediate",
    title: "Review Six Sigma and Lean Manufacturing fundamentals",
    title_fr: "Révisez les fondamentaux de Six Sigma et du Lean Manufacturing",
    content: "Renault Tanger, Yazaki, and Sumitomo expect candidates to know DMAIC, Kaizen, 5S, and value stream mapping. Prepare concrete examples from your stages.",
    content_fr: "Renault Tanger, Yazaki et Sumitomo attendent des candidats qu'ils connaissent le DMAIC, Kaizen, 5S et la cartographie de flux de valeur. Préparez des exemples concrets de vos stages.",
    tags: ["lean", "six-sigma", "automotive", "tanger"]
  },
  {
    category: "preparation", field: "genie-civil", difficulty: "beginner",
    title: "Bring your AutoCAD and Revit certifications to the interview",
    title_fr: "Apportez vos certifications AutoCAD et Revit à l'entretien",
    content: "Even free Autodesk student certificates are valued. Moroccan BTP companies like TGCC, Alliances, and Addoha appreciate certified CAD skills.",
    content_fr: "Même les certificats étudiants gratuits d'Autodesk sont valorisés. Les entreprises BTP marocaines comme TGCC, Alliances et Addoha apprécient les compétences CAO certifiées.",
    tags: ["autocad", "revit", "certification", "btp"]
  },
  {
    category: "preparation", field: "genie-electrique", difficulty: "intermediate",
    title: "Study Morocco's electrical grid and ONEE standards",
    title_fr: "Étudiez le réseau électrique marocain et les normes ONEE",
    content: "Know the 225kV/60kV/22kV voltage levels, ONEE interconnection rules, and NM standards. Understanding the national grid impresses employers in the energy sector.",
    content_fr: "Connaissez les niveaux de tension 225kV/60kV/22kV, les règles d'interconnexion ONEE et les normes NM. Comprendre le réseau national impressionne les employeurs du secteur énergétique.",
    tags: ["onee", "electrical-grid", "standards"]
  },
  {
    category: "preparation", field: "genie-mecanique", difficulty: "advanced",
    title: "Prepare technical drawings portfolio for aerospace interviews",
    title_fr: "Préparez un portfolio de dessins techniques pour les entretiens aéronautiques",
    content: "Bombardier, Safran, and Stelia in Casablanca's Midparc zone expect advanced GD&T knowledge. Prepare tolerance analysis examples and manufacturing process sheets.",
    content_fr: "Bombardier, Safran et Stelia dans la zone Midparc de Casablanca attendent des connaissances avancées en GD&T. Préparez des exemples d'analyse de tolérances et des gammes de fabrication.",
    tags: ["aerospace", "gdt", "midparc", "technical-drawing"]
  },
  {
    category: "preparation", field: "management", difficulty: "beginner",
    title: "Prepare your elevator pitch in both French and English",
    title_fr: "Préparez votre pitch d'ascenseur en français et en anglais",
    content: "A 60-second summary of who you are, what you've accomplished, and what value you bring. Practice switching between French and English seamlessly.",
    content_fr: "Un résumé de 60 secondes sur qui vous êtes, ce que vous avez accompli et la valeur que vous apportez. Entraînez-vous à passer du français à l'anglais de manière fluide.",
    tags: ["elevator-pitch", "bilingual", "management"]
  },
  {
    category: "preparation", field: "commerce-international", difficulty: "intermediate",
    title: "Know Morocco's free trade agreements and their impact",
    title_fr: "Connaissez les accords de libre-échange du Maroc et leur impact",
    content: "Morocco has FTAs with EU, USA, Turkey, and several African countries. Know tariff reductions, rules of origin, and how they affect import/export businesses.",
    content_fr: "Le Maroc a des ALE avec l'UE, les USA, la Turquie et plusieurs pays africains. Connaissez les réductions tarifaires, les règles d'origine et leur impact sur le commerce.",
    tags: ["fta", "trade", "eu", "africa"]
  },
  {
    category: "preparation", field: "logistique", difficulty: "beginner",
    title: "Familiarize yourself with Morocco's logistics zones",
    title_fr: "Familiarisez-vous avec les zones logistiques du Maroc",
    content: "Know ZLMP (Zones Logistiques Multi-flux de la Plateforme) in Kenitra, Meknes, Marrakech. Understand Tanger Med Port Authority and TMSA's role.",
    content_fr: "Connaissez les ZLMP (Zones Logistiques Multi-flux de la Plateforme) à Kénitra, Meknès, Marrakech. Comprenez le rôle de l'Autorité Portuaire de Tanger Med et de TMSA.",
    tags: ["logistics-zones", "tanger-med", "tmsa"]
  },
  {
    category: "preparation", field: "finance", difficulty: "advanced",
    title: "Master Bank Al-Maghrib circulars on banking supervision",
    title_fr: "Maîtrisez les circulaires de Bank Al-Maghrib sur la supervision bancaire",
    content: "For banking roles at Attijariwafa, BCP, or BMCE, know BAM circulars on Basel III implementation, provisioning rules, and credit risk classification.",
    content_fr: "Pour les postes bancaires chez Attijariwafa, BCP ou BMCE, connaissez les circulaires BAM sur l'implémentation de Bâle III, les règles de provisionnement et la classification du risque crédit.",
    tags: ["bam", "basel-iii", "banking", "regulation"]
  },
  {
    category: "preparation", field: "marketing", difficulty: "beginner",
    title: "Build a personal brand on LinkedIn before interviews",
    title_fr: "Construisez une marque personnelle sur LinkedIn avant les entretiens",
    content: "Post content in French about marketing trends in Morocco. Moroccan marketing agencies like Klem, Tribal, and WB check candidates' social presence.",
    content_fr: "Publiez du contenu en français sur les tendances marketing au Maroc. Les agences marketing marocaines comme Klem, Tribal et WB vérifient la présence sociale des candidats.",
    tags: ["linkedin", "personal-brand", "marketing-agencies"]
  },
  {
    category: "preparation", field: "ressources-humaines", difficulty: "intermediate",
    title: "Study Morocco's Code du Travail key articles",
    title_fr: "Étudiez les articles clés du Code du Travail marocain",
    content: "Know Articles 16-20 (contracts), 36-42 (dismissal), 184-185 (working hours), and 345-356 (CNSS). HR interview questions often test labor law knowledge.",
    content_fr: "Connaissez les Articles 16-20 (contrats), 36-42 (licenciement), 184-185 (heures de travail) et 345-356 (CNSS). Les entretiens RH testent souvent les connaissances en droit du travail.",
    tags: ["code-du-travail", "labor-law", "cnss"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY: during
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "during", field: "general", difficulty: "beginner",
    title: "Arrive 10-15 minutes early, not more",
    title_fr: "Arrivez 10-15 minutes en avance, pas plus",
    content: "Arriving too early can be awkward. Use the waiting time to observe the company culture, read their brochures, and calm your nerves.",
    content_fr: "Arriver trop tôt peut être gênant. Utilisez le temps d'attente pour observer la culture d'entreprise, lire leurs brochures et vous calmer.",
    tags: ["punctuality", "first-impression", "etiquette"]
  },
  {
    category: "during", field: "general", difficulty: "beginner",
    title: "Ask permission before taking notes during the interview",
    title_fr: "Demandez la permission avant de prendre des notes pendant l'entretien",
    content: "Say 'Puis-je prendre quelques notes?' at the start. This shows professionalism and helps you remember key details for your follow-up email.",
    content_fr: "Dites 'Puis-je prendre quelques notes ?' au début. Cela montre du professionnalisme et vous aide à retenir les détails clés pour votre email de suivi.",
    tags: ["notes", "professionalism", "etiquette"]
  },
  {
    category: "during", field: "general", difficulty: "intermediate",
    title: "Handle the 'Tell me about yourself' question strategically",
    title_fr: "Gérez la question 'Parlez-moi de vous' stratégiquement",
    content: "Use the Present-Past-Future formula: current situation, relevant past experience, and why this role is your future. Keep it under 2 minutes.",
    content_fr: "Utilisez la formule Présent-Passé-Futur : situation actuelle, expérience passée pertinente, et pourquoi ce poste est votre futur. Restez sous 2 minutes.",
    tags: ["tell-me-about-yourself", "strategy", "structure"]
  },
  {
    category: "during", field: "general", difficulty: "advanced",
    title: "Turn weakness questions into growth narratives",
    title_fr: "Transformez les questions sur les faiblesses en récits de croissance",
    content: "Choose a real weakness you've actively improved. Show the specific steps you took: training, mentoring, or new habits. Avoid clichéd answers like 'perfectionism'.",
    content_fr: "Choisissez une vraie faiblesse que vous avez activement améliorée. Montrez les étapes spécifiques : formation, mentorat ou nouvelles habitudes. Évitez les réponses clichées comme 'perfectionnisme'.",
    tags: ["weakness", "growth", "self-awareness"]
  },
  {
    category: "during", field: "genie-informatique", difficulty: "intermediate",
    title: "Think aloud during technical problem-solving",
    title_fr: "Réfléchissez à voix haute pendant la résolution de problèmes techniques",
    content: "Interviewers evaluate your thought process, not just the answer. Verbalize assumptions, consider edge cases, and discuss trade-offs between solutions.",
    content_fr: "Les recruteurs évaluent votre processus de réflexion, pas seulement la réponse. Verbalisez vos hypothèses, considérez les cas limites et discutez des compromis entre solutions.",
    tags: ["problem-solving", "communication", "technical"]
  },
  {
    category: "during", field: "genie-industriel", difficulty: "beginner",
    title: "Relate academic projects to real production scenarios",
    title_fr: "Reliez les projets académiques à des scénarios de production réels",
    content: "When discussing your PFE or stage, frame it in terms of production KPIs: TRS/OEE, taux de rebut, lead time. Manufacturing employers value practical metrics.",
    content_fr: "En discutant de votre PFE ou stage, cadrez-le en termes de KPIs de production : TRS/OEE, taux de rebut, lead time. Les employeurs industriels valorisent les métriques pratiques.",
    tags: ["kpi", "production", "metrics", "pfe"]
  },
  {
    category: "during", field: "genie-civil", difficulty: "intermediate",
    title: "Discuss site safety knowledge proactively",
    title_fr: "Discutez proactivement de vos connaissances en sécurité de chantier",
    content: "Mention familiarity with HSE plans, risk assessment matrices, and Moroccan safety regulations. Construction companies like SGTM and TGCC prioritize safety culture.",
    content_fr: "Mentionnez votre familiarité avec les plans HSE, les matrices d'évaluation des risques et les réglementations marocaines de sécurité. Les entreprises BTP comme SGTM et TGCC priorisent la culture sécurité.",
    tags: ["hse", "safety", "construction", "regulations"]
  },
  {
    category: "during", field: "finance", difficulty: "intermediate",
    title: "Demonstrate financial modeling skills with concrete examples",
    title_fr: "Démontrez vos compétences en modélisation financière avec des exemples concrets",
    content: "Mention specific models you've built: DCF, LBO, or budgeting models. Name the Excel functions you master: VLOOKUP, INDEX/MATCH, pivot tables.",
    content_fr: "Mentionnez des modèles spécifiques que vous avez construits : DCF, LBO ou modèles budgétaires. Nommez les fonctions Excel que vous maîtrisez : RECHERCHEV, INDEX/EQUIV, tableaux croisés dynamiques.",
    tags: ["financial-modeling", "excel", "dcf"]
  },
  {
    category: "during", field: "commerce-international", difficulty: "advanced",
    title: "Discuss customs procedures and douane marocaine fluently",
    title_fr: "Discutez couramment des procédures douanières et de la douane marocaine",
    content: "Know BADR system (customs clearance), DUM document, and customs warehousing regimes. Understanding the Portnet platform is a major differentiator.",
    content_fr: "Connaissez le système BADR (dédouanement), le document DUM et les régimes d'entrepôt sous douane. Comprendre la plateforme Portnet est un différenciateur majeur.",
    tags: ["customs", "badr", "portnet", "douane"]
  },
  {
    category: "during", field: "logistique", difficulty: "intermediate",
    title: "Show understanding of Morocco's supply chain challenges",
    title_fr: "Montrez votre compréhension des défis logistiques au Maroc",
    content: "Discuss last-mile delivery in medina areas, cold chain for agriculture exports, and the urban logistics challenges in cities like Casablanca and Marrakech.",
    content_fr: "Discutez de la livraison du dernier kilomètre dans les médinas, de la chaîne du froid pour les exportations agricoles et des défis logistiques urbains à Casablanca et Marrakech.",
    tags: ["supply-chain", "last-mile", "cold-chain"]
  },
  {
    category: "during", field: "marketing", difficulty: "beginner",
    title: "Show your understanding of Moroccan consumer behavior",
    title_fr: "Montrez votre compréhension du comportement du consommateur marocain",
    content: "Discuss the rise of e-commerce (Jumia, Glovo), social commerce via Instagram and WhatsApp, and the importance of Ramadan marketing campaigns.",
    content_fr: "Discutez de l'essor du e-commerce (Jumia, Glovo), du social commerce via Instagram et WhatsApp, et de l'importance des campagnes marketing du Ramadan.",
    tags: ["consumer-behavior", "e-commerce", "ramadan"]
  },
  {
    category: "during", field: "management", difficulty: "advanced",
    title: "Present case study solutions using structured frameworks",
    title_fr: "Présentez les solutions d'études de cas avec des frameworks structurés",
    content: "Use McKinsey's MECE principle, issue trees, and hypothesis-driven approaches. Moroccan consulting firms and multinationals expect structured problem-solving.",
    content_fr: "Utilisez le principe MECE de McKinsey, les arbres de problèmes et les approches orientées hypothèses. Les cabinets de conseil et multinationales au Maroc attendent une résolution structurée.",
    tags: ["case-study", "mece", "consulting", "frameworks"]
  },
  {
    category: "during", field: "ressources-humaines", difficulty: "intermediate",
    title: "Discuss GPEC and workforce planning knowledge",
    title_fr: "Discutez de vos connaissances en GPEC et planification des effectifs",
    content: "GPEC (Gestion Prévisionnelle des Emplois et Compétences) is central to HR in Morocco. Discuss competency mapping, succession planning, and talent mobility.",
    content_fr: "La GPEC (Gestion Prévisionnelle des Emplois et Compétences) est centrale en RH au Maroc. Discutez de cartographie des compétences, planification de succession et mobilité des talents.",
    tags: ["gpec", "workforce-planning", "competencies"]
  },
  {
    category: "during", field: "genie-electrique", difficulty: "advanced",
    title: "Discuss smart grid and IoT applications in Morocco",
    title_fr: "Discutez des applications smart grid et IoT au Maroc",
    content: "Morocco invests in smart grid through ONEE and MASEN. Discuss SCADA systems, smart meters, and renewable energy integration challenges you've studied.",
    content_fr: "Le Maroc investit dans le smart grid via ONEE et MASEN. Discutez des systèmes SCADA, compteurs intelligents et défis d'intégration des énergies renouvelables que vous avez étudiés.",
    tags: ["smart-grid", "iot", "scada", "masen"]
  },
  {
    category: "during", field: "genie-mecanique", difficulty: "intermediate",
    title: "Explain your CAD/CAM workflow clearly",
    title_fr: "Expliquez clairement votre flux de travail CAO/FAO",
    content: "Walk through your design process: concept sketch, 3D modeling (CATIA/SolidWorks), FEA simulation, and manufacturing drawing. Mention any CNC programming experience.",
    content_fr: "Décrivez votre processus de conception : esquisse, modélisation 3D (CATIA/SolidWorks), simulation par éléments finis, et dessin de fabrication. Mentionnez toute expérience de programmation CNC.",
    tags: ["cad-cam", "catia", "solidworks", "cnc"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY: after
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "after", field: "general", difficulty: "beginner",
    title: "Write down interview questions and your answers immediately after",
    title_fr: "Notez les questions d'entretien et vos réponses immédiatement après",
    content: "Within 30 minutes of leaving, write down every question asked and how you answered. This builds your interview question bank for future preparation.",
    content_fr: "Dans les 30 minutes après votre départ, notez chaque question posée et comment vous avez répondu. Cela construit votre banque de questions pour la préparation future.",
    tags: ["reflection", "improvement", "documentation"]
  },
  {
    category: "after", field: "general", difficulty: "beginner",
    title: "Evaluate the company culture based on your interview experience",
    title_fr: "Évaluez la culture d'entreprise basée sur votre expérience d'entretien",
    content: "Note how you were treated: waiting time, interviewer preparation, office environment. These reflect company values and help you decide if it's a good fit.",
    content_fr: "Notez comment vous avez été traité : temps d'attente, préparation du recruteur, environnement de bureau. Cela reflète les valeurs de l'entreprise et aide à décider si c'est un bon fit.",
    tags: ["culture", "evaluation", "decision-making"]
  },
  {
    category: "after", field: "general", difficulty: "intermediate",
    title: "Prepare references before they are contacted",
    title_fr: "Préparez vos références avant qu'elles soient contactées",
    content: "Alert your stage supervisors and professors that they may receive a call. Brief them on the role and what skills to highlight. Moroccan companies often call references.",
    content_fr: "Prévenez vos encadrants de stage et professeurs qu'ils pourraient recevoir un appel. Informez-les du poste et des compétences à mettre en avant. Les entreprises marocaines appellent souvent les références.",
    tags: ["references", "stage", "professors"]
  },
  {
    category: "after", field: "general", difficulty: "advanced",
    title: "Negotiate counter-offers professionally using market data",
    title_fr: "Négociez les contre-offres professionnellement en utilisant des données marché",
    content: "If you receive multiple offers, use Rekrute and Emploi.ma salary surveys as leverage. Never bluff about competing offers — Moroccan business circles are small.",
    content_fr: "Si vous recevez plusieurs offres, utilisez les enquêtes salariales Rekrute et Emploi.ma comme levier. Ne bluffez jamais sur des offres concurrentes — les milieux d'affaires marocains sont petits.",
    tags: ["negotiation", "counter-offer", "salary-data"]
  },
  {
    category: "after", field: "genie-informatique", difficulty: "intermediate",
    title: "Complete any take-home coding assignment within the deadline",
    title_fr: "Complétez tout devoir de code à domicile dans les délais",
    content: "IT companies often give 24-48 hour assignments. Include unit tests, a README, and clean git history. Deploy a live demo if possible (Vercel, Netlify).",
    content_fr: "Les entreprises IT donnent souvent des devoirs de 24-48 heures. Incluez des tests unitaires, un README et un historique git propre. Déployez une démo en ligne si possible (Vercel, Netlify).",
    tags: ["take-home", "coding-test", "deployment"]
  },
  {
    category: "after", field: "genie-industriel", difficulty: "beginner",
    title: "Send a follow-up with the improvement ideas you mentioned",
    title_fr: "Envoyez un suivi avec les idées d'amélioration que vous avez mentionnées",
    content: "If you discussed process improvements during the interview, send a brief PDF summary. This shows initiative and gives the employer a tangible preview of your value.",
    content_fr: "Si vous avez discuté d'améliorations de processus pendant l'entretien, envoyez un bref résumé PDF. Cela montre de l'initiative et donne à l'employeur un aperçu tangible de votre valeur.",
    tags: ["follow-up", "initiative", "value-add"]
  },
  {
    category: "after", field: "finance", difficulty: "intermediate",
    title: "Request feedback if you don't hear back within 2 weeks",
    title_fr: "Demandez un retour si vous n'avez pas de nouvelles dans les 2 semaines",
    content: "Moroccan hiring processes can be slow, especially in banking. A polite follow-up email at the 2-week mark is acceptable and shows genuine interest.",
    content_fr: "Les processus de recrutement marocains peuvent être lents, surtout dans la banque. Un email de relance poli à la marque des 2 semaines est acceptable et montre un intérêt sincère.",
    tags: ["follow-up", "patience", "banking"]
  },
  {
    category: "after", field: "genie-civil", difficulty: "beginner",
    title: "Keep applying to other positions while waiting",
    title_fr: "Continuez à postuler à d'autres postes en attendant",
    content: "Don't put all eggs in one basket. Moroccan BTP recruitment cycles can take 3-6 weeks. Use Rekrute.com, Emploi.ma, and LinkedIn to keep your pipeline active.",
    content_fr: "Ne mettez pas tous vos œufs dans le même panier. Les cycles de recrutement BTP marocains peuvent prendre 3-6 semaines. Utilisez Rekrute.com, Emploi.ma et LinkedIn pour garder votre pipeline actif.",
    tags: ["persistence", "pipeline", "job-search"]
  },
  {
    category: "after", field: "commerce-international", difficulty: "advanced",
    title: "Follow up with industry-relevant market intelligence",
    title_fr: "Relancez avec de l'intelligence marché pertinente au secteur",
    content: "Share a relevant article about Morocco-Africa trade, new customs regulations, or market opportunities. This positions you as someone who stays informed.",
    content_fr: "Partagez un article pertinent sur le commerce Maroc-Afrique, les nouvelles réglementations douanières ou les opportunités de marché. Cela vous positionne comme quelqu'un d'informé.",
    tags: ["market-intelligence", "trade", "follow-up"]
  },
  {
    category: "after", field: "management", difficulty: "intermediate",
    title: "Update your candidacy tracker after every interview",
    title_fr: "Mettez à jour votre tracker de candidatures après chaque entretien",
    content: "Maintain a spreadsheet: company, date, interviewer names, questions asked, your answers, next steps, and deadline. This prevents missed follow-ups.",
    content_fr: "Tenez un tableur : entreprise, date, noms des recruteurs, questions posées, vos réponses, prochaines étapes et échéances. Cela évite les relances manquées.",
    tags: ["organization", "tracking", "spreadsheet"]
  },
  {
    category: "after", field: "logistique", difficulty: "beginner",
    title: "Verify your ANAPEC registration is up to date",
    title_fr: "Vérifiez que votre inscription ANAPEC est à jour",
    content: "If the employer plans to use an ANAPEC contract, ensure your profile on anapec.org is current with your latest diploma and experience. This speeds up processing.",
    content_fr: "Si l'employeur prévoit d'utiliser un contrat ANAPEC, assurez-vous que votre profil sur anapec.org est à jour avec votre dernier diplôme et expérience. Cela accélère le traitement.",
    tags: ["anapec", "registration", "contracts"]
  },
  {
    category: "after", field: "marketing", difficulty: "intermediate",
    title: "Create a mini marketing proposal as a follow-up",
    title_fr: "Créez une mini proposition marketing comme suivi",
    content: "If you identified a marketing opportunity during the interview, send a one-page proposal. Include market data, target audience insights, and a campaign concept.",
    content_fr: "Si vous avez identifié une opportunité marketing pendant l'entretien, envoyez une proposition d'une page. Incluez des données marché, des insights sur la cible et un concept de campagne.",
    tags: ["proposal", "initiative", "campaign"]
  },
  {
    category: "after", field: "genie-electrique", difficulty: "intermediate",
    title: "Share relevant technical articles about energy transition in Morocco",
    title_fr: "Partagez des articles techniques pertinents sur la transition énergétique au Maroc",
    content: "Send an article about MASEN's latest projects, Noor Ouarzazate updates, or wind energy developments. It reinforces your passion for the field.",
    content_fr: "Envoyez un article sur les derniers projets de MASEN, les mises à jour de Noor Ouarzazate ou les développements éoliens. Cela renforce votre passion pour le domaine.",
    tags: ["energy-transition", "masen", "follow-up"]
  },
  {
    category: "after", field: "genie-mecanique", difficulty: "advanced",
    title: "Document lessons learned and update your technical interview prep",
    title_fr: "Documentez les leçons apprises et mettez à jour votre préparation technique",
    content: "After each interview, update your knowledge gaps list. If you struggled with a question about fatigue analysis or FEA, study it before the next interview.",
    content_fr: "Après chaque entretien, mettez à jour votre liste de lacunes. Si vous avez eu des difficultés sur l'analyse en fatigue ou les éléments finis, étudiez-les avant le prochain entretien.",
    tags: ["lessons-learned", "improvement", "technical-gaps"]
  },
  {
    category: "after", field: "ressources-humaines", difficulty: "beginner",
    title: "Thank the HR contact who coordinated your interview",
    title_fr: "Remerciez le contact RH qui a coordonné votre entretien",
    content: "The HR coordinator is often different from the interviewer. Thank them separately — they influence hiring decisions and remember candidates who are courteous.",
    content_fr: "Le coordinateur RH est souvent différent du recruteur. Remerciez-les séparément — ils influencent les décisions d'embauche et se souviennent des candidats courtois.",
    tags: ["gratitude", "hr-contact", "etiquette"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY: behavioral
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "behavioral", field: "general", difficulty: "beginner",
    title: "Use the STAR method with specific numbers and results",
    title_fr: "Utilisez la méthode STAR avec des chiffres et résultats spécifiques",
    content: "Don't just describe what you did — quantify it. 'Reduced processing time by 30%' is much stronger than 'improved the process'. Numbers make stories memorable.",
    content_fr: "Ne décrivez pas seulement ce que vous avez fait — quantifiez-le. 'Réduit le temps de traitement de 30%' est bien plus fort que 'amélioré le processus'. Les chiffres rendent les histoires mémorables.",
    tags: ["star", "quantify", "results"]
  },
  {
    category: "behavioral", field: "general", difficulty: "intermediate",
    title: "Prepare a conflict resolution story from a team project",
    title_fr: "Préparez une histoire de résolution de conflit d'un projet d'équipe",
    content: "Interviewers want to see emotional intelligence. Describe the conflict objectively, show empathy for both sides, explain your mediation approach, and share the positive outcome.",
    content_fr: "Les recruteurs veulent voir l'intelligence émotionnelle. Décrivez le conflit objectivement, montrez de l'empathie pour les deux parties, expliquez votre approche de médiation et partagez le résultat positif.",
    tags: ["conflict", "emotional-intelligence", "teamwork"]
  },
  {
    category: "behavioral", field: "general", difficulty: "advanced",
    title: "Demonstrate strategic thinking through a decision-making example",
    title_fr: "Démontrez votre pensée stratégique à travers un exemple de prise de décision",
    content: "Describe a situation where you had to weigh multiple options with incomplete information. Show your analysis framework, risk assessment, and how you handled uncertainty.",
    content_fr: "Décrivez une situation où vous avez dû peser plusieurs options avec des informations incomplètes. Montrez votre cadre d'analyse, évaluation des risques et gestion de l'incertitude.",
    tags: ["strategic-thinking", "decision-making", "uncertainty"]
  },
  {
    category: "behavioral", field: "genie-informatique", difficulty: "intermediate",
    title: "Describe a time you debugged a critical production issue",
    title_fr: "Décrivez un moment où vous avez debuggé un problème critique en production",
    content: "Even if from a school project or hackathon, describe the systematic approach: reproduce, isolate, diagnose, fix, and prevent. Mention tools used (logs, debugger, profiler).",
    content_fr: "Même d'un projet scolaire ou hackathon, décrivez l'approche systématique : reproduire, isoler, diagnostiquer, corriger et prévenir. Mentionnez les outils utilisés (logs, debugger, profiler).",
    tags: ["debugging", "production", "systematic"]
  },
  {
    category: "behavioral", field: "genie-industriel", difficulty: "intermediate",
    title: "Share a quality improvement story using data",
    title_fr: "Partagez une histoire d'amélioration de la qualité en utilisant des données",
    content: "Describe a quality issue you identified, the data you collected (Pareto charts, control charts), the root cause analysis (Ishikawa), and the corrective action implemented.",
    content_fr: "Décrivez un problème qualité que vous avez identifié, les données collectées (diagrammes de Pareto, cartes de contrôle), l'analyse cause racine (Ishikawa) et l'action corrective mise en œuvre.",
    tags: ["quality", "data-driven", "ishikawa", "pareto"]
  },
  {
    category: "behavioral", field: "genie-civil", difficulty: "beginner",
    title: "Describe how you handled a tight deadline on a project",
    title_fr: "Décrivez comment vous avez géré un délai serré sur un projet",
    content: "Construction is deadline-driven. Share a story about resource allocation, task prioritization, and how you ensured quality wasn't sacrificed for speed.",
    content_fr: "La construction est guidée par les délais. Partagez une histoire sur l'allocation des ressources, la priorisation des tâches et comment vous avez assuré la qualité malgré la vitesse.",
    tags: ["deadline", "prioritization", "construction"]
  },
  {
    category: "behavioral", field: "management", difficulty: "advanced",
    title: "Tell a story about influencing without formal authority",
    title_fr: "Racontez une histoire où vous avez influencé sans autorité formelle",
    content: "Show leadership through persuasion, coalition-building, and data-backed arguments. This is especially valued in matrix organizations common in Moroccan multinationals.",
    content_fr: "Montrez le leadership par la persuasion, la construction de coalitions et les arguments basés sur les données. C'est particulièrement valorisé dans les organisations matricielles courantes dans les multinationales au Maroc.",
    tags: ["influence", "leadership", "persuasion"]
  },
  {
    category: "behavioral", field: "commerce-international", difficulty: "intermediate",
    title: "Describe managing a cross-cultural business relationship",
    title_fr: "Décrivez la gestion d'une relation d'affaires interculturelle",
    content: "International trade requires cultural sensitivity. Share how you navigated different business norms — European directness vs. Arab relationship-building approaches.",
    content_fr: "Le commerce international nécessite une sensibilité culturelle. Partagez comment vous avez navigué différentes normes d'affaires — la franchise européenne vs. les approches relationnelles arabes.",
    tags: ["cross-cultural", "business", "negotiation"]
  },
  {
    category: "behavioral", field: "logistique", difficulty: "beginner",
    title: "Explain how you handled a supply chain disruption",
    title_fr: "Expliquez comment vous avez géré une perturbation de la chaîne d'approvisionnement",
    content: "Even from an academic simulation, describe identification, communication with stakeholders, alternative sourcing, and lessons learned from the disruption.",
    content_fr: "Même d'une simulation académique, décrivez l'identification, la communication avec les parties prenantes, l'approvisionnement alternatif et les leçons tirées de la perturbation.",
    tags: ["disruption", "supply-chain", "problem-solving"]
  },
  {
    category: "behavioral", field: "finance", difficulty: "intermediate",
    title: "Share a time you identified a financial risk or error",
    title_fr: "Partagez un moment où vous avez identifié un risque ou une erreur financière",
    content: "Demonstrate attention to detail and integrity. Show how you escalated the issue, proposed corrections, and implemented controls to prevent recurrence.",
    content_fr: "Démontrez l'attention aux détails et l'intégrité. Montrez comment vous avez escaladé le problème, proposé des corrections et mis en place des contrôles pour éviter la récurrence.",
    tags: ["risk", "integrity", "attention-to-detail"]
  },
  {
    category: "behavioral", field: "marketing", difficulty: "beginner",
    title: "Describe a creative campaign idea you developed",
    title_fr: "Décrivez une idée de campagne créative que vous avez développée",
    content: "Show creative thinking and market understanding. Explain the target audience, message, channels chosen, and expected or actual results.",
    content_fr: "Montrez votre pensée créative et compréhension du marché. Expliquez la cible, le message, les canaux choisis et les résultats attendus ou réels.",
    tags: ["creativity", "campaign", "marketing"]
  },
  {
    category: "behavioral", field: "ressources-humaines", difficulty: "advanced",
    title: "Describe handling a sensitive employee situation",
    title_fr: "Décrivez la gestion d'une situation employé sensible",
    content: "Show discretion, empathy, and compliance with labor law. Whether from internship or simulation, demonstrate your ability to balance employee needs with company policy.",
    content_fr: "Montrez la discrétion, l'empathie et le respect du droit du travail. Que ce soit d'un stage ou d'une simulation, démontrez votre capacité à équilibrer les besoins employé et politique d'entreprise.",
    tags: ["sensitivity", "discretion", "labor-law"]
  },
  {
    category: "behavioral", field: "genie-electrique", difficulty: "beginner",
    title: "Tell about a time you learned from a technical mistake",
    title_fr: "Racontez un moment où vous avez appris d'une erreur technique",
    content: "Engineers make mistakes — good ones learn from them. Describe a wiring error, calculation mistake, or design flaw and the systematic process you used to prevent it again.",
    content_fr: "Les ingénieurs font des erreurs — les bons en tirent des leçons. Décrivez une erreur de câblage, calcul ou conception et le processus systématique utilisé pour l'éviter à nouveau.",
    tags: ["learning", "mistakes", "improvement"]
  },
  {
    category: "behavioral", field: "genie-mecanique", difficulty: "intermediate",
    title: "Share a design optimization story with measurable results",
    title_fr: "Partagez une histoire d'optimisation de conception avec des résultats mesurables",
    content: "Describe how you redesigned a component: weight reduction percentage, cost savings, or performance improvement. Use specific metrics from your PFE or stage.",
    content_fr: "Décrivez comment vous avez reconçu un composant : pourcentage de réduction de poids, économies de coûts ou amélioration de performance. Utilisez des métriques spécifiques de votre PFE ou stage.",
    tags: ["optimization", "design", "metrics"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY: technical
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "technical", field: "genie-informatique", difficulty: "beginner",
    title: "Know the difference between REST, GraphQL, and gRPC",
    title_fr: "Connaissez la différence entre REST, GraphQL et gRPC",
    content: "REST is the standard, GraphQL for flexible queries, gRPC for high-performance microservices. Moroccan tech companies increasingly use all three in different contexts.",
    content_fr: "REST est le standard, GraphQL pour les requêtes flexibles, gRPC pour les microservices haute performance. Les entreprises tech marocaines utilisent de plus en plus les trois dans différents contextes.",
    tags: ["api", "rest", "graphql", "grpc"]
  },
  {
    category: "technical", field: "genie-informatique", difficulty: "intermediate",
    title: "Explain Docker and Kubernetes in simple terms",
    title_fr: "Expliquez Docker et Kubernetes en termes simples",
    content: "Docker packages applications, Kubernetes orchestrates them at scale. Be ready to draw a cluster diagram and explain pods, services, and deployments.",
    content_fr: "Docker package les applications, Kubernetes les orchestre à grande échelle. Soyez prêt à dessiner un diagramme de cluster et expliquer les pods, services et déploiements.",
    tags: ["docker", "kubernetes", "devops", "cloud"]
  },
  {
    category: "technical", field: "genie-informatique", difficulty: "advanced",
    title: "Discuss database sharding and replication strategies",
    title_fr: "Discutez des stratégies de sharding et réplication de base de données",
    content: "For senior roles, understand horizontal sharding, master-slave replication, and CAP theorem trade-offs. Relate to scenarios like banking transaction systems.",
    content_fr: "Pour les postes seniors, comprenez le sharding horizontal, la réplication maître-esclave et les compromis du théorème CAP. Reliez aux scénarios comme les systèmes de transactions bancaires.",
    tags: ["database", "sharding", "replication", "cap-theorem"]
  },
  {
    category: "technical", field: "genie-industriel", difficulty: "beginner",
    title: "Master the 7 quality tools for interview discussions",
    title_fr: "Maîtrisez les 7 outils qualité pour les discussions d'entretien",
    content: "Know Ishikawa diagrams, Pareto charts, histograms, control charts, scatter diagrams, flowcharts, and check sheets. Be ready to apply them to a given scenario.",
    content_fr: "Connaissez les diagrammes d'Ishikawa, graphiques de Pareto, histogrammes, cartes de contrôle, diagrammes de dispersion, organigrammes et feuilles de relevé. Soyez prêt à les appliquer à un scénario donné.",
    tags: ["quality-tools", "ishikawa", "pareto"]
  },
  {
    category: "technical", field: "genie-industriel", difficulty: "advanced",
    title: "Explain Industry 4.0 implementation in Moroccan manufacturing",
    title_fr: "Expliquez l'implémentation de l'Industrie 4.0 dans le manufacturing marocain",
    content: "Discuss MES systems, digital twins, predictive maintenance with IoT sensors, and how Moroccan plants like Renault Tanger and Stellantis Kenitra adopt these technologies.",
    content_fr: "Discutez des systèmes MES, jumeaux numériques, maintenance prédictive avec capteurs IoT, et comment les usines marocaines comme Renault Tanger et Stellantis Kénitra adoptent ces technologies.",
    tags: ["industry-4.0", "mes", "digital-twin", "predictive-maintenance"]
  },
  {
    category: "technical", field: "genie-civil", difficulty: "intermediate",
    title: "Understand concrete mix design for Moroccan climate",
    title_fr: "Comprenez la formulation du béton pour le climat marocain",
    content: "Know the BHP/BTHP formulations for hot climate, additives for sulfate resistance (coastal areas), and the NM standards for concrete testing and quality control.",
    content_fr: "Connaissez les formulations BHP/BTHP pour climat chaud, les adjuvants pour résistance aux sulfates (zones côtières) et les normes NM pour essais béton et contrôle qualité.",
    tags: ["concrete", "climate", "nm-standards"]
  },
  {
    category: "technical", field: "genie-civil", difficulty: "advanced",
    title: "Discuss seismic design principles for Morocco's RPS 2011",
    title_fr: "Discutez des principes de conception parasismique selon le RPS 2011 marocain",
    content: "Morocco's seismic code (RPS 2011) maps zones by risk level. Know spectral analysis, behavior coefficients, and ductility design for reinforced concrete structures.",
    content_fr: "Le code parasismique marocain (RPS 2011) cartographie les zones par niveau de risque. Connaissez l'analyse spectrale, les coefficients de comportement et la conception ductile des structures en béton armé.",
    tags: ["seismic", "rps-2011", "structural-engineering"]
  },
  {
    category: "technical", field: "genie-electrique", difficulty: "beginner",
    title: "Know the basics of PLC programming for industrial automation",
    title_fr: "Connaissez les bases de la programmation automate pour l'automatisation industrielle",
    content: "Understand Ladder Logic, Structured Text, and Function Block diagrams. Siemens (TIA Portal) and Schneider (Unity Pro) PLCs are most common in Moroccan industry.",
    content_fr: "Comprenez la logique Ladder, le texte structuré et les diagrammes de blocs fonctionnels. Les automates Siemens (TIA Portal) et Schneider (Unity Pro) sont les plus courants dans l'industrie marocaine.",
    tags: ["plc", "automation", "siemens", "schneider"]
  },
  {
    category: "technical", field: "genie-electrique", difficulty: "intermediate",
    title: "Explain power factor correction and energy efficiency",
    title_fr: "Expliquez la correction du facteur de puissance et l'efficacité énergétique",
    content: "Know how capacitor banks, active filters, and VFDs improve power factor. Moroccan companies face penalties from ONEE for poor power factor below 0.8.",
    content_fr: "Sachez comment les batteries de condensateurs, filtres actifs et variateurs de fréquence améliorent le facteur de puissance. Les entreprises marocaines subissent des pénalités ONEE pour un cos phi inférieur à 0,8.",
    tags: ["power-factor", "energy-efficiency", "onee"]
  },
  {
    category: "technical", field: "genie-mecanique", difficulty: "beginner",
    title: "Know common materials and their applications in Moroccan industry",
    title_fr: "Connaissez les matériaux courants et leurs applications dans l'industrie marocaine",
    content: "Understand steel grades (S235, S355), aluminum alloys (6061, 7075), and composites used in automotive and aerospace. Know local suppliers and material standards.",
    content_fr: "Comprenez les nuances d'acier (S235, S355), alliages d'aluminium (6061, 7075) et composites utilisés en automobile et aéronautique. Connaissez les fournisseurs locaux et normes matériaux.",
    tags: ["materials", "steel", "aluminum", "composites"]
  },
  {
    category: "technical", field: "genie-mecanique", difficulty: "advanced",
    title: "Discuss additive manufacturing and its adoption in Morocco",
    title_fr: "Discutez de la fabrication additive et son adoption au Maroc",
    content: "3D printing for prototyping and small-series production is growing. Know SLS, SLA, and FDM processes, and discuss use cases in aerospace (Bombardier) and automotive.",
    content_fr: "L'impression 3D pour le prototypage et la production petite série se développe. Connaissez les procédés SLS, SLA et FDM, et discutez des cas d'usage en aéronautique (Bombardier) et automobile.",
    tags: ["additive-manufacturing", "3d-printing", "prototyping"]
  },
  {
    category: "technical", field: "management", difficulty: "intermediate",
    title: "Know Agile and Scrum frameworks for project management",
    title_fr: "Connaissez les frameworks Agile et Scrum pour la gestion de projet",
    content: "Even in non-IT roles, Agile is spreading. Understand sprints, daily standups, retrospectives, and backlogs. Moroccan companies increasingly adopt Agile methodologies.",
    content_fr: "Même dans les rôles non-IT, l'Agile se répand. Comprenez les sprints, daily standups, rétrospectives et backlogs. Les entreprises marocaines adoptent de plus en plus les méthodologies Agile.",
    tags: ["agile", "scrum", "project-management"]
  },
  {
    category: "technical", field: "commerce-international", difficulty: "intermediate",
    title: "Master letters of credit and trade finance instruments",
    title_fr: "Maîtrisez les lettres de crédit et instruments de financement du commerce",
    content: "Know LC at sight, deferred LC, standby LC, and documentary collections. Understand the role of Moroccan banks (AWB, BCP, BMCE) in trade finance.",
    content_fr: "Connaissez la LC à vue, LC différée, LC standby et les remises documentaires. Comprenez le rôle des banques marocaines (AWB, BCP, BMCE) dans le financement du commerce.",
    tags: ["letter-of-credit", "trade-finance", "banking"]
  },
  {
    category: "technical", field: "logistique", difficulty: "advanced",
    title: "Understand Morocco's multimodal transport network",
    title_fr: "Comprenez le réseau de transport multimodal du Maroc",
    content: "Know the railway network (ONCF), highway system (ADM), port infrastructure (ANP), and their interconnections. Discuss the Ligne à Grande Vitesse (LGV) impact on logistics.",
    content_fr: "Connaissez le réseau ferroviaire (ONCF), autoroutier (ADM), portuaire (ANP) et leurs interconnexions. Discutez de l'impact de la Ligne à Grande Vitesse (LGV) sur la logistique.",
    tags: ["multimodal", "oncf", "adm", "anp"]
  },
  {
    category: "technical", field: "finance", difficulty: "beginner",
    title: "Know the Moroccan tax system basics: IS, IR, and TVA",
    title_fr: "Connaissez les bases du système fiscal marocain : IS, IR et TVA",
    content: "Impôt sur les Sociétés rates (10-31%), Impôt sur le Revenu brackets, and TVA rates (7%, 10%, 14%, 20%). These are frequently tested in finance interviews.",
    content_fr: "Les taux de l'Impôt sur les Sociétés (10-31%), les tranches de l'Impôt sur le Revenu et les taux de TVA (7%, 10%, 14%, 20%). Ceux-ci sont fréquemment testés en entretien finance.",
    tags: ["tax", "is", "ir", "tva", "morocco"]
  },
  {
    category: "technical", field: "finance", difficulty: "advanced",
    title: "Understand AMMC regulations for capital markets",
    title_fr: "Comprenez les réglementations AMMC pour les marchés de capitaux",
    content: "Know AMMC (Autorité Marocaine du Marché des Capitaux) circulars on IPO procedures, disclosure requirements, and market abuse rules for finance roles in investment banking.",
    content_fr: "Connaissez les circulaires de l'AMMC (Autorité Marocaine du Marché des Capitaux) sur les procédures d'introduction en bourse, obligations de divulgation et règles d'abus de marché.",
    tags: ["ammc", "capital-markets", "ipo", "regulation"]
  },
  {
    category: "technical", field: "marketing", difficulty: "intermediate",
    title: "Understand the Moroccan e-commerce landscape and regulations",
    title_fr: "Comprenez le paysage e-commerce marocain et ses réglementations",
    content: "Know the loi 31-08 on consumer protection, CNDP data protection rules, and the rise of marketplaces like Jumia, Avito, and Hmizate in Morocco.",
    content_fr: "Connaissez la loi 31-08 sur la protection du consommateur, les règles CNDP de protection des données et l'essor des marketplaces comme Jumia, Avito et Hmizate au Maroc.",
    tags: ["e-commerce", "consumer-protection", "cndp"]
  },
  {
    category: "technical", field: "ressources-humaines", difficulty: "intermediate",
    title: "Know the Moroccan social security system in detail",
    title_fr: "Connaissez le système de sécurité sociale marocain en détail",
    content: "Understand CNSS contributions (employer 21.09%, employee 6.74%), AMO (CNOPS vs CNSS), CIMR retirement supplements, and mutuelle coverage options.",
    content_fr: "Comprenez les cotisations CNSS (employeur 21,09%, salarié 6,74%), l'AMO (CNOPS vs CNSS), les compléments retraite CIMR et les options de couverture mutuelle.",
    tags: ["cnss", "amo", "cimr", "social-security"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY: salary
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "salary", field: "general", difficulty: "beginner",
    title: "Understand the difference between net and brut salary in Morocco",
    title_fr: "Comprenez la différence entre salaire net et brut au Maroc",
    content: "Gross salary (brut) includes CNSS (6.74%), AMO (2.26%), and IR deductions. A 10,000 MAD gross typically yields around 7,800-8,200 MAD net depending on family status.",
    content_fr: "Le salaire brut inclut les déductions CNSS (6,74%), AMO (2,26%) et IR. Un brut de 10 000 MAD donne typiquement environ 7 800-8 200 MAD net selon la situation familiale.",
    tags: ["net-vs-brut", "cnss", "deductions", "salary"]
  },
  {
    category: "salary", field: "general", difficulty: "beginner",
    title: "Know the current SMIG and SMAG rates",
    title_fr: "Connaissez les taux actuels du SMIG et du SMAG",
    content: "SMIG (industry) is 3,111.39 MAD/month (17.07 MAD/hour). SMAG (agriculture) is 84.37 MAD/day. These are legal minimums — engineer salaries should be well above.",
    content_fr: "Le SMIG (industrie) est de 3 111,39 MAD/mois (17,07 MAD/heure). Le SMAG (agriculture) est de 84,37 MAD/jour. Ce sont les minimums légaux — les salaires ingénieurs doivent être bien au-dessus.",
    tags: ["smig", "smag", "minimum-wage", "morocco"]
  },
  {
    category: "salary", field: "general", difficulty: "intermediate",
    title: "Research salary ranges on Rekrute.com before the interview",
    title_fr: "Recherchez les fourchettes salariales sur Rekrute.com avant l'entretien",
    content: "Rekrute.com publishes annual salary surveys by sector and experience level. Use this data to set realistic expectations and negotiate with confidence.",
    content_fr: "Rekrute.com publie des enquêtes salariales annuelles par secteur et niveau d'expérience. Utilisez ces données pour fixer des attentes réalistes et négocier avec confiance.",
    tags: ["salary-survey", "rekrute", "market-data"]
  },
  {
    category: "salary", field: "general", difficulty: "advanced",
    title: "Negotiate a complete compensation package, not just base salary",
    title_fr: "Négociez un package de rémunération complet, pas seulement le salaire de base",
    content: "Consider: 13th month bonus, transport allowance, meal vouchers, health insurance (mutuelle), profit sharing (intéressement), training budget, and remote work days.",
    content_fr: "Considérez : prime de 13ème mois, indemnité de transport, tickets restaurant, mutuelle santé, intéressement, budget formation et jours de télétravail.",
    tags: ["compensation-package", "benefits", "negotiation"]
  },
  {
    category: "salary", field: "genie-informatique", difficulty: "intermediate",
    title: "IT salary ranges in Morocco by experience level",
    title_fr: "Fourchettes salariales IT au Maroc par niveau d'expérience",
    content: "Junior (0-2 yrs): 7-12K MAD. Mid (3-5 yrs): 12-20K MAD. Senior (5+ yrs): 20-35K MAD. Tech lead/architect: 30-50K+ MAD. Freelance rates are 500-2000 MAD/day.",
    content_fr: "Junior (0-2 ans) : 7-12K MAD. Mid (3-5 ans) : 12-20K MAD. Senior (5+ ans) : 20-35K MAD. Tech lead/architecte : 30-50K+ MAD. Tarif freelance : 500-2000 MAD/jour.",
    tags: ["it-salary", "ranges", "experience-levels"]
  },
  {
    category: "salary", field: "genie-industriel", difficulty: "intermediate",
    title: "Manufacturing engineer salaries in Moroccan industrial zones",
    title_fr: "Salaires des ingénieurs manufacturing dans les zones industrielles marocaines",
    content: "Free zone companies (Tanger, Kenitra, Casablanca) pay 8-15K MAD for juniors with housing allowance. OCP and ONEE offer 12-18K MAD with excellent benefits.",
    content_fr: "Les entreprises en zone franche (Tanger, Kénitra, Casablanca) paient 8-15K MAD pour les juniors avec indemnité logement. OCP et ONEE offrent 12-18K MAD avec d'excellents avantages.",
    tags: ["manufacturing-salary", "free-zone", "ocp"]
  },
  {
    category: "salary", field: "genie-civil", difficulty: "beginner",
    title: "BTP engineer starting salaries and progression in Morocco",
    title_fr: "Salaires de départ et progression des ingénieurs BTP au Maroc",
    content: "Starting: 7-10K MAD. Conducteur de travaux (3 yrs): 12-18K MAD. Chef de chantier (5 yrs): 18-25K MAD. Site bonus (prime de chantier) adds 1-3K MAD/month.",
    content_fr: "Débutant : 7-10K MAD. Conducteur de travaux (3 ans) : 12-18K MAD. Chef de chantier (5 ans) : 18-25K MAD. La prime de chantier ajoute 1-3K MAD/mois.",
    tags: ["btp-salary", "progression", "prime-chantier"]
  },
  {
    category: "salary", field: "genie-electrique", difficulty: "intermediate",
    title: "Energy sector salaries and MASEN compensation packages",
    title_fr: "Salaires du secteur énergétique et packages de rémunération MASEN",
    content: "ONEE juniors: 10-14K MAD. Renewable energy (MASEN, NAREVA): 12-18K MAD. Private electrical contractors: 8-12K MAD. Solar/wind project engineers command premiums.",
    content_fr: "Juniors ONEE : 10-14K MAD. Énergies renouvelables (MASEN, NAREVA) : 12-18K MAD. Entrepreneurs électriques privés : 8-12K MAD. Les ingénieurs projets solaire/éolien obtiennent des primes.",
    tags: ["energy-salary", "onee", "masen", "renewable"]
  },
  {
    category: "salary", field: "genie-mecanique", difficulty: "intermediate",
    title: "Automotive and aerospace mechanical engineer salaries",
    title_fr: "Salaires des ingénieurs mécaniques automobile et aéronautique",
    content: "Automotive (Renault, Stellantis): 8-14K MAD junior. Aerospace (Bombardier, Safran): 10-16K MAD junior with annual increases. Expat packages at multinationals are 2-3x higher.",
    content_fr: "Automobile (Renault, Stellantis) : 8-14K MAD junior. Aéronautique (Bombardier, Safran) : 10-16K MAD junior avec augmentations annuelles. Les packages expatriés chez les multinationales sont 2-3x plus élevés.",
    tags: ["automotive-salary", "aerospace", "multinationals"]
  },
  {
    category: "salary", field: "management", difficulty: "advanced",
    title: "Consulting firm compensation structures in Morocco",
    title_fr: "Structures de rémunération des cabinets de conseil au Maroc",
    content: "Big 4 entry: 8-12K MAD. Manager (4-5 yrs): 20-30K MAD. Strategy firms (McKinsey, BCG): 15-25K MAD junior. Variable bonuses can add 1-3 months salary.",
    content_fr: "Big 4 entrée : 8-12K MAD. Manager (4-5 ans) : 20-30K MAD. Cabinets de stratégie (McKinsey, BCG) : 15-25K MAD junior. Les bonus variables peuvent ajouter 1-3 mois de salaire.",
    tags: ["consulting-salary", "big4", "strategy-firms"]
  },
  {
    category: "salary", field: "commerce-international", difficulty: "beginner",
    title: "International trade and export manager salary expectations",
    title_fr: "Attentes salariales des responsables commerce international et export",
    content: "Junior export assistant: 5-8K MAD. International trade manager (3-5 yrs): 12-18K MAD. Country manager: 25-40K MAD. Export companies often add commission on sales volume.",
    content_fr: "Assistant export junior : 5-8K MAD. Responsable commerce international (3-5 ans) : 12-18K MAD. Directeur pays : 25-40K MAD. Les entreprises exportatrices ajoutent souvent une commission sur le volume de ventes.",
    tags: ["trade-salary", "export", "commission"]
  },
  {
    category: "salary", field: "logistique", difficulty: "intermediate",
    title: "Supply chain and logistics manager compensation in Morocco",
    title_fr: "Rémunération des responsables supply chain et logistique au Maroc",
    content: "Junior logistics coordinator: 6-9K MAD. Supply chain manager (5 yrs): 15-22K MAD. Tanger Med zone logistics managers: 12-20K MAD with transport and housing allowances.",
    content_fr: "Coordinateur logistique junior : 6-9K MAD. Responsable supply chain (5 ans) : 15-22K MAD. Responsables logistique zone Tanger Med : 12-20K MAD avec indemnités transport et logement.",
    tags: ["logistics-salary", "supply-chain", "tanger-med"]
  },
  {
    category: "salary", field: "finance", difficulty: "intermediate",
    title: "Banking and financial services salary benchmarks",
    title_fr: "Benchmarks salariaux banque et services financiers",
    content: "Bank teller/chargé de clientèle: 5-7K MAD. Financial analyst (3 yrs): 12-18K MAD. Risk manager: 18-30K MAD. Investment banking associates: 15-25K MAD plus bonus.",
    content_fr: "Chargé de clientèle : 5-7K MAD. Analyste financier (3 ans) : 12-18K MAD. Risk manager : 18-30K MAD. Associés banque d'investissement : 15-25K MAD plus bonus.",
    tags: ["banking-salary", "financial-analyst", "risk-management"]
  },
  {
    category: "salary", field: "marketing", difficulty: "beginner",
    title: "Marketing and digital marketing salary ranges",
    title_fr: "Fourchettes salariales marketing et marketing digital",
    content: "Junior marketing assistant: 4-7K MAD. Digital marketing manager (3 yrs): 10-15K MAD. Brand manager (5 yrs): 15-25K MAD. Agency creative directors: 20-35K MAD.",
    content_fr: "Assistant marketing junior : 4-7K MAD. Responsable marketing digital (3 ans) : 10-15K MAD. Brand manager (5 ans) : 15-25K MAD. Directeurs créatifs agence : 20-35K MAD.",
    tags: ["marketing-salary", "digital", "brand-manager"]
  },
  {
    category: "salary", field: "ressources-humaines", difficulty: "beginner",
    title: "HR specialist and payroll manager salary expectations",
    title_fr: "Attentes salariales des spécialistes RH et gestionnaires de paie",
    content: "Junior HR assistant: 5-7K MAD. HR generalist (3 yrs): 9-14K MAD. Payroll manager: 12-18K MAD. HR director: 25-40K MAD. SIRH expertise commands 10-15% premium.",
    content_fr: "Assistant RH junior : 5-7K MAD. Généraliste RH (3 ans) : 9-14K MAD. Responsable paie : 12-18K MAD. DRH : 25-40K MAD. L'expertise SIRH commande une prime de 10-15%.",
    tags: ["hr-salary", "payroll", "sirh-premium"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY: remote
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "remote", field: "general", difficulty: "beginner",
    title: "Test your video call setup 30 minutes before the interview",
    title_fr: "Testez votre configuration d'appel vidéo 30 minutes avant l'entretien",
    content: "Check camera angle, lighting (face the window), audio quality, and background. Use a virtual background only if your real one is distracting.",
    content_fr: "Vérifiez l'angle caméra, l'éclairage (face à la fenêtre), la qualité audio et l'arrière-plan. Utilisez un arrière-plan virtuel uniquement si le vrai est distrayant.",
    tags: ["video-call", "setup", "lighting"]
  },
  {
    category: "remote", field: "general", difficulty: "beginner",
    title: "Prepare a backup internet connection for video interviews",
    title_fr: "Préparez une connexion internet de secours pour les entretiens vidéo",
    content: "Moroccan internet can be unreliable. Have a 4G/5G mobile hotspot ready (Maroc Telecom, Orange, Inwi). Share your phone number with the interviewer as backup.",
    content_fr: "L'internet marocain peut être instable. Ayez un hotspot mobile 4G/5G prêt (Maroc Telecom, Orange, Inwi). Partagez votre numéro de téléphone avec le recruteur comme plan B.",
    tags: ["backup", "internet", "mobile-hotspot", "morocco"]
  },
  {
    category: "remote", field: "general", difficulty: "intermediate",
    title: "Maintain eye contact by looking at the camera, not the screen",
    title_fr: "Maintenez le contact visuel en regardant la caméra, pas l'écran",
    content: "Place the video call window near your camera lens. This creates the illusion of eye contact. Practice with a friend before the actual interview.",
    content_fr: "Placez la fenêtre d'appel vidéo près de l'objectif de votre caméra. Cela crée l'illusion du contact visuel. Entraînez-vous avec un ami avant l'entretien réel.",
    tags: ["eye-contact", "video", "practice"]
  },
  {
    category: "remote", field: "general", difficulty: "advanced",
    title: "Master screen-sharing for remote technical demonstrations",
    title_fr: "Maîtrisez le partage d'écran pour les démonstrations techniques à distance",
    content: "Prepare your desktop: close personal tabs, disable notifications, have relevant documents ready. Practice smooth transitions between slides, code, and live demos.",
    content_fr: "Préparez votre bureau : fermez les onglets personnels, désactivez les notifications, ayez les documents pertinents prêts. Entraînez-vous aux transitions fluides entre diapositives, code et démos.",
    tags: ["screen-sharing", "presentation", "technical-demo"]
  },
  {
    category: "remote", field: "genie-informatique", difficulty: "intermediate",
    title: "Set up your coding environment for remote pair programming",
    title_fr: "Configurez votre environnement de code pour le pair programming à distance",
    content: "Know how to use VS Code Live Share, CodePen, or CoderPad for remote coding interviews. Test them beforehand and ensure your IDE extensions are configured.",
    content_fr: "Sachez utiliser VS Code Live Share, CodePen ou CoderPad pour les entretiens de code à distance. Testez-les au préalable et assurez-vous que vos extensions IDE sont configurées.",
    tags: ["pair-programming", "vscode", "coderpad"]
  },
  {
    category: "remote", field: "genie-industriel", difficulty: "beginner",
    title: "Prepare digital versions of your technical drawings for screen sharing",
    title_fr: "Préparez des versions numériques de vos dessins techniques pour le partage d'écran",
    content: "Convert your best technical drawings, process flow diagrams, and project reports to PDF. Have them organized in a folder for quick screen sharing.",
    content_fr: "Convertissez vos meilleurs dessins techniques, diagrammes de flux de processus et rapports de projet en PDF. Organisez-les dans un dossier pour un partage d'écran rapide.",
    tags: ["digital-portfolio", "screen-sharing", "technical-drawings"]
  },
  {
    category: "remote", field: "finance", difficulty: "intermediate",
    title: "Have your financial models ready to share on screen",
    title_fr: "Ayez vos modèles financiers prêts à partager à l'écran",
    content: "Keep clean versions of your best Excel models, PowerBI dashboards, or financial analyses ready. Remove any confidential data from previous employers.",
    content_fr: "Gardez des versions propres de vos meilleurs modèles Excel, tableaux de bord PowerBI ou analyses financières prêts. Supprimez toute donnée confidentielle d'employeurs précédents.",
    tags: ["financial-models", "screen-sharing", "portfolio"]
  },
  {
    category: "remote", field: "marketing", difficulty: "beginner",
    title: "Showcase your digital marketing portfolio via screen sharing",
    title_fr: "Présentez votre portfolio marketing digital par partage d'écran",
    content: "Prepare a presentation with campaign screenshots, performance metrics, and before/after results. Use Canva or Google Slides for a polished remote presentation.",
    content_fr: "Préparez une présentation avec captures d'écran de campagnes, métriques de performance et résultats avant/après. Utilisez Canva ou Google Slides pour une présentation à distance soignée.",
    tags: ["portfolio", "digital-marketing", "presentation"]
  },
  {
    category: "remote", field: "genie-civil", difficulty: "intermediate",
    title: "Use 3D viewers for presenting BIM models remotely",
    title_fr: "Utilisez des visionneuses 3D pour présenter des modèles BIM à distance",
    content: "Use Autodesk Viewer or BIM 360 to share models without the interviewer needing software. This demonstrates your tech-savviness in an increasingly digital construction industry.",
    content_fr: "Utilisez Autodesk Viewer ou BIM 360 pour partager des modèles sans que le recruteur ait besoin de logiciel. Cela démontre votre aisance technologique dans un BTP de plus en plus numérique.",
    tags: ["bim", "3d-viewer", "remote-presentation"]
  },
  {
    category: "remote", field: "commerce-international", difficulty: "advanced",
    title: "Handle time zone differences for international company interviews",
    title_fr: "Gérez les décalages horaires pour les entretiens d'entreprises internationales",
    content: "Morocco uses GMT+1 (no daylight saving). When interviewing with EU/US companies, double-check the time conversion. Mention your flexibility for cross-timezone collaboration.",
    content_fr: "Le Maroc utilise GMT+1 (sans changement d'heure). Lors d'entretiens avec des entreprises UE/US, vérifiez la conversion horaire. Mentionnez votre flexibilité pour la collaboration inter-fuseaux.",
    tags: ["timezone", "international", "flexibility"]
  },
  {
    category: "remote", field: "management", difficulty: "intermediate",
    title: "Demonstrate remote leadership capabilities during the interview",
    title_fr: "Démontrez vos capacités de leadership à distance pendant l'entretien",
    content: "Show you understand remote team management: asynchronous communication, virtual standup formats, OKR tracking, and building team culture without physical presence.",
    content_fr: "Montrez que vous comprenez le management d'équipe à distance : communication asynchrone, formats de standup virtuels, suivi d'OKR et construction de culture d'équipe sans présence physique.",
    tags: ["remote-leadership", "async", "okr"]
  },
  {
    category: "remote", field: "ressources-humaines", difficulty: "intermediate",
    title: "Discuss remote onboarding best practices",
    title_fr: "Discutez des meilleures pratiques d'onboarding à distance",
    content: "Show knowledge of virtual onboarding: digital welcome kits, buddy systems, structured 30-60-90 day plans, and regular check-ins for new remote employees.",
    content_fr: "Montrez vos connaissances en onboarding virtuel : kits de bienvenue numériques, systèmes de parrainage, plans structurés 30-60-90 jours et check-ins réguliers pour les nouveaux employés à distance.",
    tags: ["onboarding", "remote-hr", "best-practices"]
  },
  {
    category: "remote", field: "logistique", difficulty: "beginner",
    title: "Familiarize yourself with remote logistics management tools",
    title_fr: "Familiarisez-vous avec les outils de gestion logistique à distance",
    content: "Know cloud-based WMS, TMS, and track-and-trace platforms. Tools like CargoSmart, FreightPOP, or SAP TM are increasingly used for remote supply chain management.",
    content_fr: "Connaissez les WMS, TMS et plateformes de suivi cloud. Des outils comme CargoSmart, FreightPOP ou SAP TM sont de plus en plus utilisés pour la gestion logistique à distance.",
    tags: ["remote-logistics", "cloud-tools", "supply-chain"]
  },
  {
    category: "remote", field: "genie-electrique", difficulty: "beginner",
    title: "Prepare simulation demos for remote technical interviews",
    title_fr: "Préparez des démos de simulation pour les entretiens techniques à distance",
    content: "Have MATLAB/Simulink or ETAP simulations ready to share. A pre-recorded video demo of your best simulation project can substitute for live demo if bandwidth is low.",
    content_fr: "Ayez des simulations MATLAB/Simulink ou ETAP prêtes à partager. Une vidéo pré-enregistrée de votre meilleur projet de simulation peut remplacer une démo en direct si la bande passante est faible.",
    tags: ["simulation", "matlab", "etap", "demo"]
  },
  {
    category: "remote", field: "genie-mecanique", difficulty: "intermediate",
    title: "Share CAD models interactively during remote interviews",
    title_fr: "Partagez des modèles CAO de manière interactive pendant les entretiens à distance",
    content: "Use eDrawings (free SolidWorks viewer) or 3D Viewer for Windows to rotate and annotate models live. This impresses interviewers more than static screenshots.",
    content_fr: "Utilisez eDrawings (visionneuse SolidWorks gratuite) ou Visionneuse 3D Windows pour faire pivoter et annoter des modèles en direct. Cela impressionne plus que des captures d'écran statiques.",
    tags: ["cad-viewer", "edrawings", "interactive"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY: cultural
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "cultural", field: "general", difficulty: "beginner",
    title: "Understand the importance of 'wasta' without relying on it",
    title_fr: "Comprenez l'importance du 'wasta' sans vous y fier",
    content: "Personal connections matter in Moroccan business. Network actively through alumni events, LinkedIn, and professional associations, but always let your competence lead.",
    content_fr: "Les connexions personnelles comptent dans le business marocain. Réseautez activement via les événements alumni, LinkedIn et associations professionnelles, mais laissez toujours vos compétences primer.",
    tags: ["networking", "wasta", "connections"]
  },
  {
    category: "cultural", field: "general", difficulty: "beginner",
    title: "Respect the tea ritual if offered during the interview",
    title_fr: "Respectez le rituel du thé si on vous en offre pendant l'entretien",
    content: "Moroccan hospitality includes offering atay (mint tea) or coffee. Always accept graciously — refusing can be seen as impolite. Hold the glass while seated, never rush it.",
    content_fr: "L'hospitalité marocaine inclut l'offre d'atay (thé à la menthe) ou de café. Acceptez toujours avec grâce — refuser peut être vu comme impoli. Tenez le verre assis, ne vous pressez jamais.",
    tags: ["hospitality", "tea", "etiquette", "moroccan-culture"]
  },
  {
    category: "cultural", field: "general", difficulty: "intermediate",
    title: "Navigate the formal vs informal register appropriately",
    title_fr: "Naviguez entre le registre formel et informel de manière appropriée",
    content: "Start with 'vous' (formal) and wait for the interviewer to propose 'tu'. In some Moroccan companies, the switch to Darija signals informality — match their energy.",
    content_fr: "Commencez par 'vous' (formel) et attendez que le recruteur propose le 'tu'. Dans certaines entreprises marocaines, le passage au Darija signale l'informalité — adaptez-vous.",
    tags: ["register", "formal", "darija", "communication"]
  },
  {
    category: "cultural", field: "general", difficulty: "advanced",
    title: "Understand generational differences in Moroccan management styles",
    title_fr: "Comprenez les différences générationnelles dans les styles de management marocains",
    content: "Older managers may prefer hierarchical, formal communication. Younger leaders often adopt flat, collaborative styles. Adapt your communication style to your interviewer's generation.",
    content_fr: "Les managers plus âgés peuvent préférer une communication hiérarchique et formelle. Les leaders plus jeunes adoptent souvent des styles plats et collaboratifs. Adaptez votre style à la génération du recruteur.",
    tags: ["generational", "management-style", "adaptability"]
  },
  {
    category: "cultural", field: "genie-informatique", difficulty: "intermediate",
    title: "Know the startup culture in Casablanca and Rabat tech hubs",
    title_fr: "Connaissez la culture startup dans les hubs tech de Casablanca et Rabat",
    content: "Technopark, Casanearshore, and Rabat Technopolis have vibrant startup cultures. These interviews are often informal, focus on problem-solving, and value side projects.",
    content_fr: "Technopark, Casanearshore et Rabat Technopolis ont des cultures startup dynamiques. Ces entretiens sont souvent informels, axés sur la résolution de problèmes et valorisent les projets personnels.",
    tags: ["startup", "technopark", "casanearshore", "rabat"]
  },
  {
    category: "cultural", field: "genie-industriel", difficulty: "beginner",
    title: "Understand factory floor culture in Moroccan manufacturing plants",
    title_fr: "Comprenez la culture de l'atelier dans les usines marocaines",
    content: "Show respect for operators and technicians. In Moroccan factories, an engineer who can communicate respectfully across hierarchies is highly valued.",
    content_fr: "Montrez du respect pour les opérateurs et techniciens. Dans les usines marocaines, un ingénieur qui sait communiquer respectueusement à travers les hiérarchies est très valorisé.",
    tags: ["factory-culture", "respect", "hierarchy"]
  },
  {
    category: "cultural", field: "genie-civil", difficulty: "intermediate",
    title: "Understand the relationship between bureau d'études and chantier",
    title_fr: "Comprenez la relation entre le bureau d'études et le chantier",
    content: "In Moroccan BTP, the dynamic between design office and construction site can be tense. Show you understand both perspectives and can bridge the gap effectively.",
    content_fr: "Dans le BTP marocain, la dynamique entre bureau d'études et chantier peut être tendue. Montrez que vous comprenez les deux perspectives et pouvez combler l'écart efficacement.",
    tags: ["bureau-etudes", "chantier", "collaboration"]
  },
  {
    category: "cultural", field: "finance", difficulty: "intermediate",
    title: "Understand Islamic finance principles for banking interviews",
    title_fr: "Comprenez les principes de la finance islamique pour les entretiens bancaires",
    content: "Morocco's finance participative market is growing. Know Murabaha, Ijara, Moucharaka, and Moudaraba products. Banks like Umnia Bank and Bank Assafa actively recruit.",
    content_fr: "Le marché de la finance participative au Maroc croît. Connaissez les produits Murabaha, Ijara, Moucharaka et Moudaraba. Des banques comme Umnia Bank et Bank Assafa recrutent activement.",
    tags: ["islamic-finance", "participative", "murabaha"]
  },
  {
    category: "cultural", field: "commerce-international", difficulty: "advanced",
    title: "Master Morocco-Africa business cultural differences",
    title_fr: "Maîtrisez les différences culturelles d'affaires Maroc-Afrique",
    content: "Morocco positions itself as a gateway to Africa. Understand business culture differences with West Africa (relationship-first), East Africa (formal processes), and Francophone vs Anglophone markets.",
    content_fr: "Le Maroc se positionne comme passerelle vers l'Afrique. Comprenez les différences culturelles avec l'Afrique de l'Ouest (relation d'abord), l'Afrique de l'Est (processus formels) et les marchés francophone vs anglophone.",
    tags: ["africa", "gateway", "cultural-differences"]
  },
  {
    category: "cultural", field: "management", difficulty: "intermediate",
    title: "Demonstrate awareness of Moroccan corporate governance evolution",
    title_fr: "Démontrez votre connaissance de l'évolution de la gouvernance d'entreprise marocaine",
    content: "Morocco's corporate governance code (CGEM) is evolving. Know the Charte RSE, CGEM label, and how companies are transitioning from family-owned to professional management.",
    content_fr: "Le code de gouvernance d'entreprise marocain (CGEM) évolue. Connaissez la Charte RSE, le label CGEM et comment les entreprises passent du modèle familial au management professionnel.",
    tags: ["governance", "cgem", "rse", "family-business"]
  },
  {
    category: "cultural", field: "marketing", difficulty: "beginner",
    title: "Understand Moroccan consumer cultural sensitivities",
    title_fr: "Comprenez les sensibilités culturelles du consommateur marocain",
    content: "Marketing in Morocco must respect religious and cultural values. Know which topics are sensitive, understand Ramadan marketing opportunities, and respect linguistic diversity.",
    content_fr: "Le marketing au Maroc doit respecter les valeurs religieuses et culturelles. Sachez quels sujets sont sensibles, comprenez les opportunités marketing du Ramadan et respectez la diversité linguistique.",
    tags: ["cultural-sensitivity", "ramadan", "values"]
  },
  {
    category: "cultural", field: "ressources-humaines", difficulty: "advanced",
    title: "Navigate Moroccan labor relations and union dynamics",
    title_fr: "Naviguez les relations de travail et dynamiques syndicales marocaines",
    content: "Know the major unions (UMT, CDT, UGTM, FDT), collective bargaining frameworks, and the role of délégués du personnel. Show awareness without taking political positions.",
    content_fr: "Connaissez les principaux syndicats (UMT, CDT, UGTM, FDT), les cadres de négociation collective et le rôle des délégués du personnel. Montrez votre connaissance sans prendre de positions politiques.",
    tags: ["unions", "labor-relations", "delegates"]
  },
  {
    category: "cultural", field: "logistique", difficulty: "beginner",
    title: "Understand the importance of relationships with customs officials",
    title_fr: "Comprenez l'importance des relations avec les agents des douanes",
    content: "In Moroccan logistics, maintaining professional relationships with douane agents, transitaires, and port authorities is crucial for smooth operations. Show relationship awareness.",
    content_fr: "Dans la logistique marocaine, maintenir des relations professionnelles avec les agents des douanes, transitaires et autorités portuaires est crucial pour des opérations fluides.",
    tags: ["customs", "relationships", "transitaire"]
  },
  {
    category: "cultural", field: "genie-electrique", difficulty: "beginner",
    title: "Know the culture of Moroccan energy sector organizations",
    title_fr: "Connaissez la culture des organisations du secteur énergétique marocain",
    content: "ONEE and MASEN have public-sector cultures (formal, hierarchical) while private renewable firms are more dynamic. Adapt your interview approach accordingly.",
    content_fr: "ONEE et MASEN ont des cultures de secteur public (formelles, hiérarchiques) tandis que les entreprises privées d'ENR sont plus dynamiques. Adaptez votre approche d'entretien en conséquence.",
    tags: ["energy-culture", "public-sector", "private-sector"]
  },
  {
    category: "cultural", field: "genie-mecanique", difficulty: "intermediate",
    title: "Understand Japanese management culture in Moroccan automotive plants",
    title_fr: "Comprenez la culture de management japonaise dans les usines automobiles marocaines",
    content: "Yazaki, Sumitomo, and Fujikura bring Japanese management practices. Understand 5S, Kaizen philosophy, morning assemblies (chorei), and the importance of continuous improvement culture.",
    content_fr: "Yazaki, Sumitomo et Fujikura apportent des pratiques de management japonaises. Comprenez les 5S, la philosophie Kaizen, les assemblées matinales (chorei) et l'importance de la culture d'amélioration continue.",
    tags: ["japanese-management", "kaizen", "5s", "automotive"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY: body_language
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "body_language", field: "general", difficulty: "beginner",
    title: "Offer a firm but not crushing handshake",
    title_fr: "Offrez une poignée de main ferme mais pas écrasante",
    content: "In Morocco, a firm handshake shows confidence. Make eye contact during the handshake. Note: some people may prefer not to shake hands for religious reasons — follow their lead.",
    content_fr: "Au Maroc, une poignée de main ferme montre la confiance. Regardez dans les yeux pendant la poignée de main. Note : certaines personnes préfèrent ne pas serrer la main pour des raisons religieuses — suivez leur exemple.",
    tags: ["handshake", "confidence", "respect"]
  },
  {
    category: "body_language", field: "general", difficulty: "beginner",
    title: "Sit upright with open posture throughout the interview",
    title_fr: "Asseyez-vous droit avec une posture ouverte tout au long de l'entretien",
    content: "Avoid crossing arms (defensive), slouching (disinterest), or leaning too far back (arrogance). Lean slightly forward to show engagement and interest.",
    content_fr: "Évitez de croiser les bras (défensif), de vous affaler (désintérêt) ou de vous pencher trop en arrière (arrogance). Penchez-vous légèrement en avant pour montrer l'engagement et l'intérêt.",
    tags: ["posture", "engagement", "non-verbal"]
  },
  {
    category: "body_language", field: "general", difficulty: "intermediate",
    title: "Mirror the interviewer's energy level and pace",
    title_fr: "Mirrorez le niveau d'énergie et le rythme du recruteur",
    content: "If the interviewer is calm and measured, match that pace. If they're energetic and fast-paced, increase your energy. Mirroring builds unconscious rapport.",
    content_fr: "Si le recruteur est calme et mesuré, adoptez ce rythme. S'il est énergique et rapide, augmentez votre énergie. Le mirroring construit un rapport inconscient.",
    tags: ["mirroring", "rapport", "energy"]
  },
  {
    category: "body_language", field: "general", difficulty: "advanced",
    title: "Use purposeful hand gestures to emphasize key points",
    title_fr: "Utilisez des gestes de la main intentionnels pour souligner les points clés",
    content: "Controlled hand gestures enhance communication. Use them to enumerate points, show scale, or emphasize importance. Keep gestures in the 'truth zone' (sternum to chin).",
    content_fr: "Les gestes de la main contrôlés améliorent la communication. Utilisez-les pour énumérer les points, montrer l'échelle ou souligner l'importance. Gardez les gestes dans la 'zone de vérité' (sternum au menton).",
    tags: ["gestures", "emphasis", "communication"]
  },
  {
    category: "body_language", field: "genie-informatique", difficulty: "beginner",
    title: "Maintain confident body language during whiteboard sessions",
    title_fr: "Maintenez un langage corporel confiant pendant les sessions tableau blanc",
    content: "Stand at an angle to the whiteboard so you can address both the board and the interviewer. Write legibly, use colors for clarity, and don't rush.",
    content_fr: "Tenez-vous en angle par rapport au tableau blanc pour pouvoir vous adresser au tableau et au recruteur. Écrivez lisiblement, utilisez des couleurs pour la clarté, et ne vous précipitez pas.",
    tags: ["whiteboard", "confidence", "technical-interview"]
  },
  {
    category: "body_language", field: "genie-industriel", difficulty: "intermediate",
    title: "Project authority when discussing production floor scenarios",
    title_fr: "Projetez de l'autorité en discutant de scénarios d'atelier",
    content: "Use a steady voice, stand tall when demonstrating processes, and use decisive language. Factory management requires physical presence and confidence.",
    content_fr: "Utilisez une voix stable, tenez-vous droit en démontrant les processus et utilisez un langage décisif. Le management d'usine nécessite une présence physique et de la confiance.",
    tags: ["authority", "presence", "factory"]
  },
  {
    category: "body_language", field: "management", difficulty: "intermediate",
    title: "Demonstrate active listening with appropriate non-verbal cues",
    title_fr: "Démontrez l'écoute active avec des signaux non-verbaux appropriés",
    content: "Nod occasionally, maintain eye contact for 3-5 seconds at a time, and lean in slightly when the interviewer speaks. These cues show you value their input.",
    content_fr: "Hochement de tête occasionnel, contact visuel de 3-5 secondes à la fois, et inclinaison légère quand le recruteur parle. Ces signaux montrent que vous valorisez leur propos.",
    tags: ["active-listening", "non-verbal", "engagement"]
  },
  {
    category: "body_language", field: "commerce-international", difficulty: "advanced",
    title: "Adapt your non-verbal communication for different cultural contexts",
    title_fr: "Adaptez votre communication non-verbale aux différents contextes culturels",
    content: "Eye contact duration, personal space, and gesture meanings vary across cultures. For international trade roles, showing cultural non-verbal intelligence is a major plus.",
    content_fr: "La durée du contact visuel, l'espace personnel et la signification des gestes varient selon les cultures. Pour les postes en commerce international, montrer une intelligence non-verbale interculturelle est un atout majeur.",
    tags: ["cross-cultural", "non-verbal", "intelligence"]
  },
  {
    category: "body_language", field: "genie-civil", difficulty: "beginner",
    title: "Show physical confidence for site-oriented roles",
    title_fr: "Montrez une confiance physique pour les postes orientés chantier",
    content: "For conducteur de travaux or site engineer roles, display physical energy and readiness. A strong posture and firm voice suggest you can handle challenging site environments.",
    content_fr: "Pour les postes de conducteur de travaux ou ingénieur de chantier, affichez énergie physique et disponibilité. Une posture forte et une voix ferme suggèrent que vous pouvez gérer les environnements de chantier difficiles.",
    tags: ["confidence", "site-engineer", "physical-presence"]
  },
  {
    category: "body_language", field: "marketing", difficulty: "beginner",
    title: "Express enthusiasm through animated but controlled body language",
    title_fr: "Exprimez l'enthousiasme par un langage corporel animé mais contrôlé",
    content: "Marketing roles value passion and creativity. Let your body language reflect enthusiasm — smile genuinely, use expressive hands, and vary your vocal tone.",
    content_fr: "Les rôles marketing valorisent la passion et la créativité. Laissez votre langage corporel refléter l'enthousiasme — souriez sincèrement, utilisez des mains expressives et variez votre ton vocal.",
    tags: ["enthusiasm", "creativity", "expression"]
  },
  {
    category: "body_language", field: "finance", difficulty: "intermediate",
    title: "Project composure and analytical calm for finance interviews",
    title_fr: "Projetez du sang-froid et un calme analytique pour les entretiens finance",
    content: "Banking and finance value stability. Maintain steady eye contact, speak at a measured pace, and avoid fidgeting. Your composure signals trustworthiness with financial matters.",
    content_fr: "La banque et la finance valorisent la stabilité. Maintenez un contact visuel stable, parlez à un rythme mesuré et évitez de vous agiter. Votre sang-froid signale la fiabilité en matière financière.",
    tags: ["composure", "stability", "trustworthiness"]
  },
  {
    category: "body_language", field: "ressources-humaines", difficulty: "intermediate",
    title: "Show empathy and warmth through your body language",
    title_fr: "Montrez de l'empathie et de la chaleur par votre langage corporel",
    content: "HR roles require emotional intelligence. Display warmth through genuine smiles, open posture, and attentive head tilts. These signal the people-skills HR demands.",
    content_fr: "Les rôles RH nécessitent de l'intelligence émotionnelle. Affichez de la chaleur par des sourires sincères, une posture ouverte et des inclinaisons de tête attentives. Ceux-ci signalent les compétences relationnelles que les RH exigent.",
    tags: ["empathy", "warmth", "people-skills"]
  },
  {
    category: "body_language", field: "logistique", difficulty: "beginner",
    title: "Demonstrate energy and dynamism for operations roles",
    title_fr: "Démontrez l'énergie et le dynamisme pour les postes opérationnels",
    content: "Logistics roles require high energy. Show you're action-oriented through upright posture, responsive reactions, and a brisk communication style.",
    content_fr: "Les postes logistiques nécessitent beaucoup d'énergie. Montrez que vous êtes orienté action par une posture droite, des réactions réactives et un style de communication dynamique.",
    tags: ["energy", "dynamism", "operations"]
  },
  {
    category: "body_language", field: "genie-electrique", difficulty: "beginner",
    title: "Stay calm when asked difficult technical questions",
    title_fr: "Restez calme quand on vous pose des questions techniques difficiles",
    content: "Take a breath before answering complex questions. Saying 'Let me think about that for a moment' is perfectly acceptable and shows thoughtfulness rather than panic.",
    content_fr: "Prenez une respiration avant de répondre aux questions complexes. Dire 'Laissez-moi y réfléchir un moment' est parfaitement acceptable et montre de la réflexion plutôt que de la panique.",
    tags: ["composure", "technical-questions", "thinking"]
  },
  {
    category: "body_language", field: "genie-mecanique", difficulty: "intermediate",
    title: "Use spatial gestures when describing mechanical systems",
    title_fr: "Utilisez des gestes spatiaux pour décrire des systèmes mécaniques",
    content: "When explaining gear trains, assemblies, or manufacturing processes, use your hands to show movement, direction, and scale. This demonstrates 3D spatial thinking.",
    content_fr: "En expliquant des trains d'engrenages, assemblages ou processus de fabrication, utilisez vos mains pour montrer le mouvement, la direction et l'échelle. Cela démontre la pensée spatiale 3D.",
    tags: ["spatial", "gestures", "mechanical-systems"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORY: follow_up
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "follow_up", field: "general", difficulty: "beginner",
    title: "Send a personalized thank-you email within 24 hours",
    title_fr: "Envoyez un email de remerciement personnalisé dans les 24 heures",
    content: "Reference a specific topic discussed. Example: 'J'ai particulièrement apprécié notre discussion sur votre projet de transformation digitale.' Keep it concise — 3-4 sentences max.",
    content_fr: "Référencez un sujet spécifique discuté. Exemple : 'J'ai particulièrement apprécié notre discussion sur votre projet de transformation digitale.' Restez concis — 3-4 phrases maximum.",
    tags: ["thank-you", "email", "personalization"]
  },
  {
    category: "follow_up", field: "general", difficulty: "beginner",
    title: "Connect with the interviewer on LinkedIn within 48 hours",
    title_fr: "Connectez-vous avec le recruteur sur LinkedIn dans les 48 heures",
    content: "Send a personalized request: 'Enchanté(e) de vous avoir rencontré(e) lors de notre entretien chez [Company]. J'aimerais rester en contact.' Always personalize — never use the default message.",
    content_fr: "Envoyez une demande personnalisée : 'Enchanté(e) de vous avoir rencontré(e) lors de notre entretien chez [Entreprise]. J'aimerais rester en contact.' Personnalisez toujours — n'utilisez jamais le message par défaut.",
    tags: ["linkedin", "networking", "connection"]
  },
  {
    category: "follow_up", field: "general", difficulty: "intermediate",
    title: "Follow up with additional information if promised during interview",
    title_fr: "Relancez avec des informations supplémentaires si promis pendant l'entretien",
    content: "If you said 'I'll send you that article/project/reference,' do it within 24 hours. Following through on small commitments shows reliability and attention to detail.",
    content_fr: "Si vous avez dit 'Je vous enverrai cet article/projet/référence,' faites-le dans les 24 heures. Tenir les petits engagements montre la fiabilité et l'attention aux détails.",
    tags: ["follow-through", "reliability", "commitment"]
  },
  {
    category: "follow_up", field: "general", difficulty: "advanced",
    title: "Build a relationship pipeline even after rejection",
    title_fr: "Construisez un pipeline relationnel même après un refus",
    content: "Thank the company for the opportunity, ask for specific feedback, and request to be considered for future roles. 30% of hires in Morocco come from reapplication after rejection.",
    content_fr: "Remerciez l'entreprise pour l'opportunité, demandez un retour spécifique et demandez à être considéré pour de futurs postes. 30% des embauches au Maroc viennent d'une recandidature après refus.",
    tags: ["rejection", "persistence", "pipeline"]
  },
  {
    category: "follow_up", field: "genie-informatique", difficulty: "intermediate",
    title: "Share a relevant open-source contribution after the interview",
    title_fr: "Partagez une contribution open-source pertinente après l'entretien",
    content: "If the company uses specific technologies, contribute to related open-source projects and share the PR link. This demonstrates passion and technical depth beyond the interview.",
    content_fr: "Si l'entreprise utilise des technologies spécifiques, contribuez à des projets open-source connexes et partagez le lien du PR. Cela démontre la passion et la profondeur technique au-delà de l'entretien.",
    tags: ["open-source", "contribution", "technical-depth"]
  },
  {
    category: "follow_up", field: "genie-industriel", difficulty: "beginner",
    title: "Send a process improvement suggestion document",
    title_fr: "Envoyez un document de suggestion d'amélioration de processus",
    content: "If the interview included a factory tour, send a brief observation report with 2-3 improvement ideas. Use A3 problem-solving format for maximum impact.",
    content_fr: "Si l'entretien incluait une visite d'usine, envoyez un bref rapport d'observation avec 2-3 idées d'amélioration. Utilisez le format de résolution de problèmes A3 pour un impact maximal.",
    tags: ["process-improvement", "a3", "factory-tour"]
  },
  {
    category: "follow_up", field: "genie-civil", difficulty: "intermediate",
    title: "Share a relevant project case study as follow-up material",
    title_fr: "Partagez une étude de cas de projet pertinente comme matériel de suivi",
    content: "Prepare a 2-page case study of your best construction project: before/after photos, timeline, budget management, and lessons learned. Send it within 48 hours.",
    content_fr: "Préparez une étude de cas de 2 pages de votre meilleur projet de construction : photos avant/après, planning, gestion budgétaire et leçons apprises. Envoyez-la dans les 48 heures.",
    tags: ["case-study", "portfolio", "construction"]
  },
  {
    category: "follow_up", field: "finance", difficulty: "intermediate",
    title: "Send a market analysis brief relevant to the discussed topics",
    title_fr: "Envoyez une brève analyse de marché pertinente aux sujets discutés",
    content: "If you discussed a specific sector or financial challenge, send a one-page analysis with data from HCP, BAM, or OCP annual reports. This shows analytical initiative.",
    content_fr: "Si vous avez discuté d'un secteur ou défi financier spécifique, envoyez une analyse d'une page avec des données du HCP, BAM ou rapports annuels OCP. Cela montre l'initiative analytique.",
    tags: ["market-analysis", "initiative", "data"]
  },
  {
    category: "follow_up", field: "commerce-international", difficulty: "advanced",
    title: "Provide a competitive intelligence brief on a discussed market",
    title_fr: "Fournissez une note d'intelligence concurrentielle sur un marché discuté",
    content: "If the company is entering a new market (Sub-Saharan Africa, EU), send a 1-page competitive landscape analysis. Use data from Trade Map, ITC, and DEPF.",
    content_fr: "Si l'entreprise entre dans un nouveau marché (Afrique subsaharienne, UE), envoyez une analyse concurrentielle d'1 page. Utilisez les données de Trade Map, ITC et DEPF.",
    tags: ["competitive-intelligence", "market-entry", "trade-map"]
  },
  {
    category: "follow_up", field: "management", difficulty: "beginner",
    title: "Send a summary of discussed action items and next steps",
    title_fr: "Envoyez un résumé des actions discutées et prochaines étapes",
    content: "Treat the interview like a business meeting. Summarize key discussion points, agreed next steps, and timelines in your follow-up email. This shows organizational maturity.",
    content_fr: "Traitez l'entretien comme une réunion d'affaires. Résumez les points clés de discussion, les prochaines étapes convenues et les délais dans votre email de suivi. Cela montre la maturité organisationnelle.",
    tags: ["action-items", "organization", "professionalism"]
  },
  {
    category: "follow_up", field: "marketing", difficulty: "intermediate",
    title: "Create a social media post about your interview experience",
    title_fr: "Créez une publication sur les réseaux sociaux sur votre expérience d'entretien",
    content: "Post on LinkedIn about your positive experience (without revealing confidential details). Tag the company. This shows social media savvy and builds your personal brand.",
    content_fr: "Publiez sur LinkedIn votre expérience positive (sans révéler de détails confidentiels). Taguez l'entreprise. Cela montre votre maîtrise des réseaux sociaux et construit votre marque personnelle.",
    tags: ["social-media", "linkedin-post", "personal-brand"]
  },
  {
    category: "follow_up", field: "logistique", difficulty: "beginner",
    title: "Follow up on any logistics certifications discussed",
    title_fr: "Relancez sur les certifications logistiques discutées",
    content: "If the interviewer mentioned valuing APICS (CPIM/CSCP), CILT, or Six Sigma Green Belt, enroll in one and mention it in your follow-up. Shows immediate action orientation.",
    content_fr: "Si le recruteur a mentionné valoriser APICS (CPIM/CSCP), CILT ou Six Sigma Green Belt, inscrivez-vous et mentionnez-le dans votre suivi. Montre une orientation action immédiate.",
    tags: ["certifications", "apics", "professional-development"]
  },
  {
    category: "follow_up", field: "ressources-humaines", difficulty: "intermediate",
    title: "Ask about the onboarding process in your follow-up",
    title_fr: "Renseignez-vous sur le processus d'onboarding dans votre suivi",
    content: "Asking about the onboarding program signals confidence you'll get the offer and shows genuine interest in integrating well. Mention any onboarding best practices you know.",
    content_fr: "Demander le programme d'onboarding signale la confiance que vous aurez l'offre et montre un intérêt sincère pour bien s'intégrer. Mentionnez les bonnes pratiques d'onboarding que vous connaissez.",
    tags: ["onboarding", "integration", "confidence"]
  },
  {
    category: "follow_up", field: "genie-electrique", difficulty: "beginner",
    title: "Share a relevant technical publication or conference paper",
    title_fr: "Partagez une publication technique ou un article de conférence pertinent",
    content: "If you discussed renewable energy or smart grid topics, share an IEEE or IEC paper you've read. This demonstrates continuous learning and technical curiosity.",
    content_fr: "Si vous avez discuté d'énergie renouvelable ou de smart grid, partagez un article IEEE ou IEC que vous avez lu. Cela démontre l'apprentissage continu et la curiosité technique.",
    tags: ["publication", "ieee", "continuous-learning"]
  },
  {
    category: "follow_up", field: "genie-mecanique", difficulty: "intermediate",
    title: "Update your CAD portfolio based on interview feedback",
    title_fr: "Mettez à jour votre portfolio CAO basé sur le retour d'entretien",
    content: "If the interviewer commented on specific design aspects, revise your portfolio accordingly and share the updated version. This shows responsiveness to feedback.",
    content_fr: "Si le recruteur a commenté des aspects spécifiques de conception, révisez votre portfolio en conséquence et partagez la version mise à jour. Cela montre votre réactivité aux retours.",
    tags: ["portfolio-update", "feedback", "responsiveness"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTRA TIPS to reach 200+
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "preparation", field: "general", difficulty: "intermediate",
    title: "Research the interviewer's background on LinkedIn before the meeting",
    title_fr: "Recherchez le parcours du recruteur sur LinkedIn avant la réunion",
    content: "Find common ground: same university, shared connections, or similar career interests. Mentioning their published article or talk shows exceptional preparation.",
    content_fr: "Trouvez des points communs : même université, connexions partagées ou intérêts de carrière similaires. Mentionner leur article ou conférence publiée montre une préparation exceptionnelle.",
    tags: ["linkedin-research", "preparation", "common-ground"]
  },
  {
    category: "preparation", field: "general", difficulty: "advanced",
    title: "Prepare industry-specific insights using HCP and DEPF data",
    title_fr: "Préparez des insights sectoriels en utilisant les données HCP et DEPF",
    content: "Use Haut-Commissariat au Plan (HCP) statistics and Direction des Etudes et Prévisions Financières (DEPF) reports for authoritative Moroccan market data.",
    content_fr: "Utilisez les statistiques du Haut-Commissariat au Plan (HCP) et les rapports de la Direction des Etudes et Prévisions Financières (DEPF) pour des données marché marocaines faisant autorité.",
    tags: ["hcp", "depf", "statistics", "market-data"]
  },
  {
    category: "during", field: "general", difficulty: "intermediate",
    title: "Ask about the team you'll be joining and its dynamics",
    title_fr: "Renseignez-vous sur l'équipe que vous rejoindrez et sa dynamique",
    content: "Good questions: 'How big is the team?', 'What's the average tenure?', 'How do you collaborate across departments?' This shows you value team fit, not just the role.",
    content_fr: "Bonnes questions : 'Quelle est la taille de l'équipe ?', 'Quelle est l'ancienneté moyenne ?', 'Comment collaborez-vous entre départements ?' Cela montre que vous valorisez le fit d'équipe.",
    tags: ["team", "dynamics", "questions"]
  },
  {
    category: "during", field: "general", difficulty: "advanced",
    title: "Demonstrate commercial awareness by linking your skills to business outcomes",
    title_fr: "Démontrez votre conscience commerciale en liant vos compétences aux résultats business",
    content: "Don't just say 'I can code in Python.' Say 'I can build automation tools that reduce manual processing time, saving the team 20 hours per week.' Always link to value.",
    content_fr: "Ne dites pas juste 'Je sais coder en Python.' Dites 'Je peux construire des outils d'automatisation qui réduisent le temps de traitement manuel, économisant 20 heures par semaine à l'équipe.'",
    tags: ["commercial-awareness", "value", "business-outcomes"]
  },
  {
    category: "technical", field: "general", difficulty: "beginner",
    title: "Know basic data analysis tools: Excel, Power BI, or Tableau",
    title_fr: "Connaissez les outils d'analyse de données de base : Excel, Power BI ou Tableau",
    content: "Data literacy is expected across all fields in Morocco. Be able to create pivot tables in Excel, build basic dashboards, and interpret data visualizations.",
    content_fr: "La littératie des données est attendue dans tous les domaines au Maroc. Soyez capable de créer des tableaux croisés dynamiques Excel, construire des tableaux de bord basiques et interpréter des visualisations de données.",
    tags: ["data-analysis", "excel", "power-bi", "tableau"]
  },
  {
    category: "technical", field: "general", difficulty: "intermediate",
    title: "Understand AI and machine learning basics for any field",
    title_fr: "Comprenez les bases de l'IA et du machine learning pour tout domaine",
    content: "Every sector is being transformed by AI. Know what ML can do (prediction, classification, NLP), its limitations, and ethical considerations. Use examples relevant to your field.",
    content_fr: "Chaque secteur est transformé par l'IA. Sachez ce que le ML peut faire (prédiction, classification, NLP), ses limites et les considérations éthiques. Utilisez des exemples pertinents à votre domaine.",
    tags: ["ai", "machine-learning", "digital-transformation"]
  },
  {
    category: "salary", field: "general", difficulty: "intermediate",
    title: "Understand ANAPEC contract salary structures",
    title_fr: "Comprenez les structures salariales des contrats ANAPEC",
    content: "Idmaj contracts often have fixed salaries (around 4,500-6,000 MAD for engineers). After the contrat d'insertion period (typically 24 months), negotiate your CDI salary.",
    content_fr: "Les contrats Idmaj ont souvent des salaires fixes (environ 4 500-6 000 MAD pour les ingénieurs). Après la période du contrat d'insertion (typiquement 24 mois), négociez votre salaire CDI.",
    tags: ["anapec", "idmaj", "contract-salary"]
  },
  {
    category: "salary", field: "general", difficulty: "advanced",
    title: "Factor in cost of living differences across Moroccan cities",
    title_fr: "Tenez compte des différences de coût de la vie entre les villes marocaines",
    content: "Casablanca is 20-30% more expensive than Rabat. Tangier and Marrakech vary. Factor in housing costs when comparing offers. A 10K MAD salary in Rabat may equal 13K MAD in Casablanca.",
    content_fr: "Casablanca est 20-30% plus cher que Rabat. Tanger et Marrakech varient. Tenez compte du coût du logement en comparant les offres. Un salaire de 10K MAD à Rabat peut équivaloir à 13K MAD à Casablanca.",
    tags: ["cost-of-living", "cities", "comparison"]
  },
  {
    category: "behavioral", field: "general", difficulty: "beginner",
    title: "Prepare a story about going above and beyond expectations",
    title_fr: "Préparez une histoire où vous avez dépassé les attentes",
    content: "Share a specific instance where you delivered more than asked: extra features in a project, volunteering for additional responsibilities, or helping a struggling teammate.",
    content_fr: "Partagez un cas spécifique où vous avez livré plus que demandé : fonctionnalités supplémentaires dans un projet, volontariat pour des responsabilités additionnelles ou aide à un coéquipier en difficulté.",
    tags: ["above-and-beyond", "initiative", "dedication"]
  },
  {
    category: "cultural", field: "general", difficulty: "intermediate",
    title: "Show awareness of Morocco's Vision 2030 and its impact on your sector",
    title_fr: "Montrez votre connaissance de la Vision 2030 du Maroc et son impact sur votre secteur",
    content: "Morocco's development strategies (NMD 2035, Vision 2030 for tourism, Plan Maroc Vert for agriculture) create sector-specific opportunities. Link your career ambitions to national goals.",
    content_fr: "Les stratégies de développement du Maroc (NMD 2035, Vision 2030 pour le tourisme, Plan Maroc Vert pour l'agriculture) créent des opportunités sectorielles. Liez vos ambitions de carrière aux objectifs nationaux.",
    tags: ["vision-2030", "nmd-2035", "national-strategy"]
  },
  {
    category: "body_language", field: "general", difficulty: "intermediate",
    title: "Manage nervous habits during the interview",
    title_fr: "Gérez les habitudes nerveuses pendant l'entretien",
    content: "Common nervous habits: clicking pens, touching face, bouncing legs, fidgeting with jewelry. Identify yours in practice sessions and consciously control them.",
    content_fr: "Habitudes nerveuses courantes : cliquer un stylo, toucher le visage, bouger les jambes, jouer avec les bijoux. Identifiez les vôtres en sessions d'entraînement et contrôlez-les consciemment.",
    tags: ["nervousness", "habits", "self-awareness"]
  },
  {
    category: "follow_up", field: "general", difficulty: "intermediate",
    title: "Maintain a professional online presence across all platforms",
    title_fr: "Maintenez une présence en ligne professionnelle sur toutes les plateformes",
    content: "After an interview, recruiters often check your social media. Ensure Facebook, Instagram, and Twitter profiles are either professional or private. LinkedIn should be always updated.",
    content_fr: "Après un entretien, les recruteurs vérifient souvent vos réseaux sociaux. Assurez-vous que les profils Facebook, Instagram et Twitter sont soit professionnels soit privés. LinkedIn doit toujours être à jour.",
    tags: ["social-media", "online-presence", "privacy"]
  },
  {
    category: "remote", field: "general", difficulty: "intermediate",
    title: "Dress professionally even for video interviews",
    title_fr: "Habillez-vous professionnellement même pour les entretiens vidéo",
    content: "Wear full professional attire, not just the top half. You might need to stand up unexpectedly. Professional dress also puts you in the right mindset.",
    content_fr: "Portez une tenue professionnelle complète, pas seulement le haut. Vous pourriez devoir vous lever de manière inattendue. La tenue professionnelle vous met aussi dans le bon état d'esprit.",
    tags: ["dress-code", "video", "professionalism"]
  },
  {
    category: "preparation", field: "genie-informatique", difficulty: "advanced",
    title: "Prepare for cloud architecture discussions with AWS/Azure/GCP knowledge",
    title_fr: "Préparez-vous aux discussions d'architecture cloud avec des connaissances AWS/Azure/GCP",
    content: "Moroccan companies are rapidly adopting cloud. Know the core services: compute (EC2/VM), storage (S3/Blob), databases (RDS/Azure SQL), and serverless (Lambda/Functions).",
    content_fr: "Les entreprises marocaines adoptent rapidement le cloud. Connaissez les services principaux : calcul (EC2/VM), stockage (S3/Blob), bases de données (RDS/Azure SQL) et serverless (Lambda/Functions).",
    tags: ["cloud", "aws", "azure", "gcp"]
  },
  {
    category: "technical", field: "genie-informatique", difficulty: "intermediate",
    title: "Understand CI/CD pipelines and DevOps practices",
    title_fr: "Comprenez les pipelines CI/CD et les pratiques DevOps",
    content: "Know Jenkins, GitLab CI, or GitHub Actions. Understand build, test, deploy stages. Moroccan IT companies increasingly require DevOps skills even for junior roles.",
    content_fr: "Connaissez Jenkins, GitLab CI ou GitHub Actions. Comprenez les étapes build, test, deploy. Les entreprises IT marocaines exigent de plus en plus des compétences DevOps même pour les postes juniors.",
    tags: ["cicd", "devops", "jenkins", "gitlab"]
  },
  {
    category: "during", field: "genie-mecanique", difficulty: "advanced",
    title: "Discuss tolerance stack-up analysis methodology",
    title_fr: "Discutez de la méthodologie d'analyse de cumul de tolérances",
    content: "For aerospace and precision manufacturing roles, explain worst-case vs. RSS tolerance analysis. Show understanding of GD&T symbols and their manufacturing implications.",
    content_fr: "Pour les postes en aéronautique et fabrication de précision, expliquez l'analyse de tolérance pire cas vs. RSS. Montrez la compréhension des symboles GD&T et leurs implications de fabrication.",
    tags: ["tolerance", "gdt", "aerospace", "precision"]
  },
  {
    category: "preparation", field: "logistique", difficulty: "advanced",
    title: "Study Morocco's national logistics competitiveness strategy",
    title_fr: "Étudiez la stratégie nationale de compétitivité logistique du Maroc",
    content: "Know the Stratégie Nationale de Compétitivité Logistique targets: reduce logistics costs from 20% to 15% of GDP, develop 70+ logistics zones, and train 60,000 professionals.",
    content_fr: "Connaissez les objectifs de la Stratégie Nationale de Compétitivité Logistique : réduire les coûts logistiques de 20% à 15% du PIB, développer 70+ zones logistiques et former 60 000 professionnels.",
    tags: ["logistics-strategy", "competitiveness", "gdp"]
  },
  {
    category: "technical", field: "ressources-humaines", difficulty: "advanced",
    title: "Know the digital HR transformation landscape in Morocco",
    title_fr: "Connaissez le paysage de la transformation RH digitale au Maroc",
    content: "Understand HRIS evolution: from basic payroll (Sage) to integrated talent management platforms (Workday, SuccessFactors). Know how AI is transforming recruitment and L&D.",
    content_fr: "Comprenez l'évolution des SIRH : de la paie basique (Sage) aux plateformes intégrées de gestion des talents (Workday, SuccessFactors). Sachez comment l'IA transforme le recrutement et la formation.",
    tags: ["digital-hr", "hris", "workday", "ai-recruitment"]
  },
  {
    category: "cultural", field: "genie-industriel", difficulty: "advanced",
    title: "Understand the role of OFPPT graduates alongside engineers on the factory floor",
    title_fr: "Comprenez le rôle des lauréats OFPPT aux côtés des ingénieurs en atelier",
    content: "OFPPT technicians form the backbone of Moroccan manufacturing. Show you can collaborate across educational backgrounds and leverage their hands-on expertise effectively.",
    content_fr: "Les techniciens OFPPT forment l'ossature du manufacturing marocain. Montrez que vous pouvez collaborer à travers les niveaux de formation et exploiter leur expertise pratique efficacement.",
    tags: ["ofppt", "technicians", "collaboration"]
  },
  {
    category: "salary", field: "genie-informatique", difficulty: "advanced",
    title: "Understand freelance and remote salary opportunities for Moroccan IT",
    title_fr: "Comprenez les opportunités salariales freelance et remote pour l'IT marocain",
    content: "Moroccan developers can earn 2-4x local salaries working remotely for European or US companies. Know platforms: Toptal, Upwork, Arc.dev. Auto-entrepreneur status offers tax advantages.",
    content_fr: "Les développeurs marocains peuvent gagner 2-4x les salaires locaux en travaillant à distance pour des entreprises européennes ou américaines. Connaissez les plateformes : Toptal, Upwork, Arc.dev. Le statut auto-entrepreneur offre des avantages fiscaux.",
    tags: ["freelance", "remote-salary", "auto-entrepreneur"]
  },
  {
    category: "body_language", field: "general", difficulty: "beginner",
    title: "Smile genuinely at the beginning and end of the interview",
    title_fr: "Souriez sincèrement au début et à la fin de l'entretien",
    content: "A genuine smile activates the muscles around your eyes (Duchenne smile). Practice in the mirror. First and last impressions are anchored by your facial expression.",
    content_fr: "Un sourire sincère active les muscles autour de vos yeux (sourire de Duchenne). Entraînez-vous devant le miroir. Les premières et dernières impressions sont ancrées par votre expression faciale.",
    tags: ["smile", "first-impression", "last-impression"]
  },
  {
    category: "after", field: "general", difficulty: "intermediate",
    title: "Review the job posting again after the interview to assess fit",
    title_fr: "Relisez l'offre d'emploi après l'entretien pour évaluer le fit",
    content: "Compare the actual role discussed with the job posting. Were there surprises? Unmentioned responsibilities? This helps you make an informed decision if offered the position.",
    content_fr: "Comparez le rôle réel discuté avec l'offre d'emploi. Y avait-il des surprises ? Des responsabilités non mentionnées ? Cela aide à prendre une décision éclairée si on vous offre le poste.",
    tags: ["job-posting", "assessment", "decision"]
  },
  {
    category: "during", field: "ressources-humaines", difficulty: "advanced",
    title: "Demonstrate knowledge of employer branding in Morocco",
    title_fr: "Démontrez vos connaissances en marque employeur au Maroc",
    content: "Know the Best Places to Work Morocco ranking, CGEM RSE label, and how top Moroccan employers build their brand. Discuss how you'd contribute to the company's employer brand.",
    content_fr: "Connaissez le classement Best Places to Work Morocco, le label RSE CGEM et comment les meilleurs employeurs marocains construisent leur marque. Discutez de comment vous contribueriez à la marque employeur.",
    tags: ["employer-branding", "best-places-to-work", "cgem"]
  },
  {
    category: "technical", field: "commerce-international", difficulty: "advanced",
    title: "Know Morocco's certificate of origin and preferential tariff rules",
    title_fr: "Connaissez le certificat d'origine marocain et les règles tarifaires préférentielles",
    content: "Understand EUR.1 for EU trade, Form A for GSP, and bilateral certificates. Know cumulation rules for Agadir Agreement (Morocco, Tunisia, Egypt, Jordan) and Pan-Euro-Med.",
    content_fr: "Comprenez l'EUR.1 pour le commerce UE, le Formulaire A pour le SPG et les certificats bilatéraux. Connaissez les règles de cumul pour l'Accord d'Agadir (Maroc, Tunisie, Egypte, Jordanie) et le Pan-Euro-Med.",
    tags: ["certificate-of-origin", "eur1", "agadir-agreement"]
  },
  {
    category: "follow_up", field: "general", difficulty: "advanced",
    title: "Keep a post-interview journal to track patterns and improve",
    title_fr: "Tenez un journal post-entretien pour suivre les patterns et vous améliorer",
    content: "After 5+ interviews, review your journal for patterns: which questions you struggle with, which stories resonate, and where you need more preparation. Continuous improvement wins.",
    content_fr: "Après 5+ entretiens, revoyez votre journal pour les patterns : quelles questions vous posent problème, quelles histoires résonnent et où vous avez besoin de plus de préparation. L'amélioration continue gagne.",
    tags: ["journal", "patterns", "continuous-improvement"]
  },
  {
    category: "preparation", field: "finance", difficulty: "intermediate",
    title: "Prepare for psychometric and numerical reasoning tests",
    title_fr: "Préparez-vous aux tests psychométriques et de raisonnement numérique",
    content: "Moroccan banks (AWB, BCP, BMCE) and Big 4 firms use SHL, Cut-e, or Cubiks tests. Practice numerical reasoning, verbal reasoning, and logical reasoning online.",
    content_fr: "Les banques marocaines (AWB, BCP, BMCE) et Big 4 utilisent des tests SHL, Cut-e ou Cubiks. Pratiquez le raisonnement numérique, verbal et logique en ligne.",
    tags: ["psychometric", "numerical-reasoning", "aptitude-tests"]
  },
  {
    category: "cultural", field: "finance", difficulty: "advanced",
    title: "Understand the evolving role of women in Moroccan banking leadership",
    title_fr: "Comprenez le rôle évolutif des femmes dans le leadership bancaire marocain",
    content: "Morocco leads MENA in women's banking participation. Know leaders like Nezha Hayat (AMMC), female board quotas, and gender equality initiatives in major banks.",
    content_fr: "Le Maroc est leader MENA dans la participation des femmes en banque. Connaissez des leaders comme Nezha Hayat (AMMC), les quotas féminins aux conseils et les initiatives d'égalité des genres dans les grandes banques.",
    tags: ["women-leadership", "banking", "gender-equality"]
  },
  {
    category: "behavioral", field: "logistique", difficulty: "intermediate",
    title: "Describe a time you optimized a process for efficiency",
    title_fr: "Décrivez un moment où vous avez optimisé un processus pour plus d'efficacité",
    content: "Logistics thrives on optimization. Share a story about reducing waste, shortening lead time, or improving inventory accuracy — even from a school simulation or internship.",
    content_fr: "La logistique prospère par l'optimisation. Partagez une histoire de réduction du gaspillage, raccourcissement du délai ou amélioration de la précision d'inventaire — même d'une simulation scolaire ou d'un stage.",
    tags: ["optimization", "efficiency", "logistics"]
  },
  {
    category: "technical", field: "marketing", difficulty: "advanced",
    title: "Discuss marketing attribution models and ROI measurement",
    title_fr: "Discutez des modèles d'attribution marketing et de la mesure du ROI",
    content: "Know last-click, first-click, linear, and data-driven attribution. Understand how to measure ROI across channels (SEO, SEM, social, email) using Google Analytics 4.",
    content_fr: "Connaissez l'attribution last-click, first-click, linéaire et data-driven. Comprenez comment mesurer le ROI entre canaux (SEO, SEM, social, email) avec Google Analytics 4.",
    tags: ["attribution", "roi", "google-analytics"]
  },
  {
    category: "during", field: "logistique", difficulty: "advanced",
    title: "Discuss Morocco's role in Africa's Continental Free Trade Area",
    title_fr: "Discutez du rôle du Maroc dans la Zone de Libre-Échange Continentale Africaine",
    content: "AfCFTA creates the world's largest free trade area. Discuss Morocco's strategic position, Tanger Med's role as an African hub, and logistics challenges of intra-African trade.",
    content_fr: "La ZLECAf crée la plus grande zone de libre-échange au monde. Discutez de la position stratégique du Maroc, du rôle de Tanger Med comme hub africain et des défis logistiques du commerce intra-africain.",
    tags: ["afcfta", "africa", "free-trade", "tanger-med"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL TIPS — reach 200+
  // ═══════════════════════════════════════════════════════════════════════════
  {
    category: "preparation", field: "general", difficulty: "beginner",
    title: "Prepare three copies of your CV in French and English",
    title_fr: "Préparez trois copies de votre CV en français et en anglais",
    content: "Bring printed CVs even if you submitted digitally. Moroccan interviewers may not have printed your CV, and having extras shows preparation and professionalism.",
    content_fr: "Apportez des CV imprimés même si vous avez soumis numériquement. Les recruteurs marocains n'ont peut-être pas imprimé votre CV, et avoir des copies supplémentaires montre préparation et professionnalisme.",
    tags: ["cv", "copies", "preparation", "bilingual"]
  },
  {
    category: "preparation", field: "genie-civil", difficulty: "advanced",
    title: "Know the major infrastructure projects in Morocco's pipeline",
    title_fr: "Connaissez les grands projets d'infrastructure en pipeline au Maroc",
    content: "Study ongoing projects: Nador West Med port, TGV extension to Marrakech and Agadir, new stadia for 2030 World Cup, and Al Manzah urban projects. Link your skills to these.",
    content_fr: "Étudiez les projets en cours : port Nador West Med, extension TGV vers Marrakech et Agadir, nouveaux stades pour la Coupe du Monde 2030, et projets urbains Al Manzah. Reliez vos compétences à ceux-ci.",
    tags: ["infrastructure", "nador-west-med", "tgv", "world-cup-2030"]
  },
  {
    category: "during", field: "finance", difficulty: "advanced",
    title: "Navigate stress interview techniques used by Moroccan banks",
    title_fr: "Naviguez les techniques d'entretien de stress utilisées par les banques marocaines",
    content: "Some Moroccan banks use aggressive questioning to test composure. Stay calm, pause before answering, and don't take it personally. They're testing your emotional resilience.",
    content_fr: "Certaines banques marocaines utilisent des questions agressives pour tester le sang-froid. Restez calme, faites une pause avant de répondre et ne le prenez pas personnellement. Ils testent votre résilience émotionnelle.",
    tags: ["stress-interview", "banking", "composure", "resilience"]
  },
  {
    category: "during", field: "genie-electrique", difficulty: "beginner",
    title: "Be ready to draw single-line diagrams during the interview",
    title_fr: "Soyez prêt à dessiner des schémas unifilaires pendant l'entretien",
    content: "Electrical engineering interviews often include drawing exercises. Know standard symbols for transformers, circuit breakers, motors, and protection relays.",
    content_fr: "Les entretiens en génie électrique incluent souvent des exercices de dessin. Connaissez les symboles standards pour transformateurs, disjoncteurs, moteurs et relais de protection.",
    tags: ["single-line-diagram", "symbols", "drawing"]
  },
  {
    category: "behavioral", field: "marketing", difficulty: "advanced",
    title: "Describe how you adapted a campaign based on audience feedback",
    title_fr: "Décrivez comment vous avez adapté une campagne basée sur les retours du public",
    content: "Show data-driven agility: A/B test results, pivot decisions, and measurable improvements. Moroccan brands value marketers who iterate based on real performance data.",
    content_fr: "Montrez l'agilité basée sur les données : résultats de tests A/B, décisions de pivot et améliorations mesurables. Les marques marocaines valorisent les marketeurs qui itèrent sur les données de performance.",
    tags: ["adaptation", "ab-testing", "data-driven"]
  },
  {
    category: "technical", field: "logistique", difficulty: "intermediate",
    title: "Understand cold chain logistics for Morocco's agricultural exports",
    title_fr: "Comprenez la logistique de la chaîne du froid pour les exportations agricoles marocaines",
    content: "Morocco exports 1.7M tons of citrus and vegetables annually. Know cold chain requirements, phytosanitary certificates, and the role of EACCE (Établissement Autonome de Contrôle et de Coordination des Exportations).",
    content_fr: "Le Maroc exporte 1,7M de tonnes d'agrumes et légumes annuellement. Connaissez les exigences de la chaîne du froid, les certificats phytosanitaires et le rôle de l'EACCE.",
    tags: ["cold-chain", "agriculture", "eacce", "exports"]
  },
  {
    category: "salary", field: "genie-civil", difficulty: "intermediate",
    title: "Understand site engineer bonus structures in Moroccan BTP",
    title_fr: "Comprenez les structures de primes des ingénieurs chantier dans le BTP marocain",
    content: "Site engineers receive base salary + prime de chantier (site bonus) + per diem for remote sites. Ask about prime de rendement (performance bonus) tied to project milestones.",
    content_fr: "Les ingénieurs de chantier reçoivent salaire de base + prime de chantier + per diem pour les sites éloignés. Renseignez-vous sur la prime de rendement liée aux jalons de projet.",
    tags: ["site-bonus", "per-diem", "performance-bonus"]
  },
  {
    category: "cultural", field: "commerce-international", difficulty: "intermediate",
    title: "Understand Morocco's role as a bridge between Europe and Africa",
    title_fr: "Comprenez le rôle du Maroc comme pont entre l'Europe et l'Afrique",
    content: "Morocco's geographic position, bilateral agreements, and banking presence in Africa make it unique. Companies like AWB, Maroc Telecom, and OCP expand aggressively into Sub-Saharan Africa.",
    content_fr: "La position géographique du Maroc, ses accords bilatéraux et sa présence bancaire en Afrique le rendent unique. Des entreprises comme AWB, Maroc Telecom et OCP s'étendent agressivement en Afrique subsaharienne.",
    tags: ["europe-africa-bridge", "expansion", "strategy"]
  },
  {
    category: "body_language", field: "finance", difficulty: "advanced",
    title: "Control micro-expressions during case study presentations",
    title_fr: "Contrôlez les micro-expressions pendant les présentations d'études de cas",
    content: "When presenting financial analysis, avoid showing frustration if challenged. Practice maintaining a neutral-positive expression when the interviewer pushes back on your assumptions.",
    content_fr: "Lors de la présentation d'analyses financières, évitez de montrer de la frustration si on vous challenge. Pratiquez le maintien d'une expression neutre-positive quand le recruteur remet en question vos hypothèses.",
    tags: ["micro-expressions", "composure", "case-study"]
  },
  {
    category: "follow_up", field: "genie-informatique", difficulty: "advanced",
    title: "Build a mini proof-of-concept related to the discussed project",
    title_fr: "Construisez un mini proof-of-concept lié au projet discuté",
    content: "If the company mentioned a technical challenge, build a small PoC over the weekend and share it via GitHub. This exceptional effort can be the differentiator between candidates.",
    content_fr: "Si l'entreprise a mentionné un défi technique, construisez un petit PoC le weekend et partagez-le via GitHub. Cet effort exceptionnel peut faire la différence entre les candidats.",
    tags: ["poc", "proof-of-concept", "differentiation"]
  },
  {
    category: "remote", field: "genie-industriel", difficulty: "intermediate",
    title: "Prepare virtual factory tour discussion points",
    title_fr: "Préparez des points de discussion pour une visite virtuelle d'usine",
    content: "Some Moroccan manufacturers offer virtual factory tours for remote candidates. Prepare intelligent observations about layout, workflow, safety measures, and improvement opportunities.",
    content_fr: "Certains fabricants marocains offrent des visites virtuelles d'usine pour les candidats à distance. Préparez des observations intelligentes sur la disposition, le flux de travail, les mesures de sécurité et les opportunités d'amélioration.",
    tags: ["virtual-tour", "factory", "observations"]
  },
  {
    category: "after", field: "genie-informatique", difficulty: "advanced",
    title: "Contribute to the company's tech blog or community after the interview",
    title_fr: "Contribuez au blog tech ou à la communauté de l'entreprise après l'entretien",
    content: "If the company has a tech blog, write a relevant article and submit it. If they have a community (Slack, Discord), join and contribute. This shows genuine interest beyond getting hired.",
    content_fr: "Si l'entreprise a un blog tech, écrivez un article pertinent et soumettez-le. S'ils ont une communauté (Slack, Discord), rejoignez et contribuez. Cela montre un intérêt sincère au-delà de l'embauche.",
    tags: ["tech-blog", "community", "contribution"]
  },
  {
    category: "technical", field: "management", difficulty: "advanced",
    title: "Understand Morocco's PPP framework for public-private partnerships",
    title_fr: "Comprenez le cadre PPP marocain pour les partenariats public-privé",
    content: "Morocco's Law 86-12 on PPP governs major infrastructure projects. Know the project lifecycle: feasibility, tendering, concession agreements, and performance monitoring.",
    content_fr: "La Loi 86-12 sur les PPP régit les grands projets d'infrastructure au Maroc. Connaissez le cycle de vie du projet : faisabilité, appel d'offres, conventions de concession et suivi de performance.",
    tags: ["ppp", "law-86-12", "infrastructure"]
  },
  {
    category: "salary", field: "commerce-international", difficulty: "advanced",
    title: "Negotiate expatriation packages for Africa assignments",
    title_fr: "Négociez les packages d'expatriation pour les missions en Afrique",
    content: "Moroccan companies expanding to Africa offer expatriation packages: hardship allowance (20-40% premium), housing, flights home, schooling allowance, and security provisions.",
    content_fr: "Les entreprises marocaines s'étendant en Afrique offrent des packages d'expatriation : prime de pénibilité (20-40% de prime), logement, billets d'avion, allocation scolarité et provisions de sécurité.",
    tags: ["expatriation", "africa", "hardship-allowance"]
  },
  {
    category: "during", field: "marketing", difficulty: "intermediate",
    title: "Present a 60-second pitch for a product or service",
    title_fr: "Présentez un pitch de 60 secondes pour un produit ou service",
    content: "Marketing interviews may include impromptu pitching exercises. Structure it: problem statement, target audience, unique value proposition, and call to action. Practice with Moroccan brands.",
    content_fr: "Les entretiens marketing peuvent inclure des exercices de pitch impromptu. Structurez-le : problème, audience cible, proposition de valeur unique et appel à l'action. Pratiquez avec des marques marocaines.",
    tags: ["pitch", "improvisation", "value-proposition"]
  },
  {
    category: "behavioral", field: "genie-electrique", difficulty: "intermediate",
    title: "Describe a safety-critical situation you handled correctly",
    title_fr: "Décrivez une situation critique de sécurité que vous avez gérée correctement",
    content: "Electrical engineering involves real safety risks. Share a story about identifying a hazard, following lockout/tagout procedures, or preventing an incident during your stage.",
    content_fr: "Le génie électrique implique de vrais risques de sécurité. Partagez une histoire d'identification de danger, de procédures de consignation/déconsignation ou de prévention d'incident pendant votre stage.",
    tags: ["safety", "lockout-tagout", "hazard-identification"]
  },
  {
    category: "cultural", field: "genie-mecanique", difficulty: "beginner",
    title: "Show respect for the craft tradition in Moroccan manufacturing",
    title_fr: "Montrez du respect pour la tradition artisanale dans le manufacturing marocain",
    content: "Morocco has a rich craft heritage. In manufacturing interviews, show appreciation for precision craftsmanship while discussing modern manufacturing technologies.",
    content_fr: "Le Maroc a un riche patrimoine artisanal. Lors d'entretiens manufacturing, montrez votre appréciation pour l'artisanat de précision tout en discutant des technologies de fabrication modernes.",
    tags: ["craft-tradition", "manufacturing", "heritage"]
  },
  {
    category: "follow_up", field: "ressources-humaines", difficulty: "advanced",
    title: "Propose a mini employee engagement survey as a value-add",
    title_fr: "Proposez une mini enquête d'engagement employé comme valeur ajoutée",
    content: "After an HR interview, send a draft 5-question employee engagement survey tailored to the company's stated challenges. This demonstrates HR analytics capability and initiative.",
    content_fr: "Après un entretien RH, envoyez un brouillon d'enquête d'engagement employé de 5 questions adaptée aux défis déclarés de l'entreprise. Cela démontre la capacité en analytique RH et l'initiative.",
    tags: ["engagement-survey", "analytics", "value-add"]
  },
  {
    category: "preparation", field: "management", difficulty: "advanced",
    title: "Study the company's competitive landscape and SWOT positioning",
    title_fr: "Étudiez le paysage concurrentiel et le positionnement SWOT de l'entreprise",
    content: "Prepare a mental SWOT analysis of the company. Discuss strengths vs competitors, market threats, and untapped opportunities. This shows strategic management thinking.",
    content_fr: "Préparez une analyse SWOT mentale de l'entreprise. Discutez des forces vs concurrents, menaces du marché et opportunités inexploitées. Cela montre une pensée managériale stratégique.",
    tags: ["swot", "competitive-analysis", "strategy"]
  },
  {
    category: "technical", field: "genie-civil", difficulty: "beginner",
    title: "Know the difference between Eurocode and Moroccan construction standards",
    title_fr: "Connaissez la différence entre l'Eurocode et les normes de construction marocaines",
    content: "Morocco uses a mix of French standards (BAEL, DTU) and its own NM standards. Eurocode adoption is progressing. Know which standard applies in different project contexts.",
    content_fr: "Le Maroc utilise un mix de normes françaises (BAEL, DTU) et ses propres normes NM. L'adoption de l'Eurocode progresse. Sachez quelle norme s'applique dans différents contextes de projet.",
    tags: ["eurocode", "bael", "nm-standards"]
  },
  {
    category: "during", field: "commerce-international", difficulty: "beginner",
    title: "Demonstrate your language skills naturally during the interview",
    title_fr: "Démontrez vos compétences linguistiques naturellement pendant l'entretien",
    content: "For international trade roles, switch between French and English smoothly when relevant. If you speak Spanish, Arabic, or other languages, find natural moments to demonstrate them.",
    content_fr: "Pour les postes en commerce international, alternez entre français et anglais naturellement. Si vous parlez espagnol, arabe ou d'autres langues, trouvez des moments naturels pour les démontrer.",
    tags: ["languages", "multilingual", "demonstration"]
  },
  {
    category: "body_language", field: "genie-informatique", difficulty: "intermediate",
    title: "Show enthusiasm through energy when discussing technology",
    title_fr: "Montrez l'enthousiasme par l'énergie en discutant de technologie",
    content: "Tech companies value passion. When discussing your favorite technologies or projects, let your excitement show naturally — lean in, speak faster, gesture more. Authentic passion is contagious.",
    content_fr: "Les entreprises tech valorisent la passion. En discutant de vos technologies ou projets favoris, laissez votre enthousiasme se montrer naturellement — penchez-vous en avant, parlez plus vite, gesticulez plus.",
    tags: ["enthusiasm", "passion", "technology"]
  },
  {
    category: "after", field: "management", difficulty: "advanced",
    title: "Conduct a self-assessment SWOT after each interview",
    title_fr: "Effectuez une auto-évaluation SWOT après chaque entretien",
    content: "Strengths: what went well. Weaknesses: where you stumbled. Opportunities: follow-up actions. Threats: competing candidates or concerns raised. This structures your improvement.",
    content_fr: "Forces : ce qui a bien fonctionné. Faiblesses : où vous avez trébuché. Opportunités : actions de suivi. Menaces : candidats concurrents ou préoccupations soulevées. Cela structure votre amélioration.",
    tags: ["self-assessment", "swot", "improvement"]
  },
  {
    category: "salary", field: "management", difficulty: "intermediate",
    title: "Understand total cost to company vs take-home pay in Morocco",
    title_fr: "Comprenez le coût total employeur vs salaire net au Maroc",
    content: "Employer cost includes CNSS patronal (21.09%), taxe formation (1.6%), AMO patronal, and insurance. A 10K MAD gross salary costs the employer roughly 13-14K MAD total.",
    content_fr: "Le coût employeur inclut la CNSS patronale (21,09%), la taxe de formation (1,6%), l'AMO patronale et l'assurance. Un salaire brut de 10K MAD coûte à l'employeur environ 13-14K MAD total.",
    tags: ["total-cost", "employer-cost", "cnss-patronal"]
  },
  {
    category: "cultural", field: "logistique", difficulty: "intermediate",
    title: "Understand the role of informal logistics networks in Morocco",
    title_fr: "Comprenez le rôle des réseaux logistiques informels au Maroc",
    content: "Informal transport and distribution networks play a significant role in Moroccan commerce. Show understanding of both formal supply chains and the reality of informal distribution channels.",
    content_fr: "Les réseaux informels de transport et distribution jouent un rôle important dans le commerce marocain. Montrez votre compréhension des chaînes d'approvisionnement formelles et de la réalité des canaux de distribution informels.",
    tags: ["informal-networks", "distribution", "commerce"]
  },
];

// ── Batch Insert ─────────────────────────────────────────────────────────────
const BATCH_SIZE = 50;
let inserted = 0;
let skipped = 0;
const categoryCounts = {};
const fieldCounts = {};
const difficultyCounts = {};

for (let i = 0; i < tips.length; i += BATCH_SIZE) {
  const batch = tips.slice(i, i + BATCH_SIZE);
  const values = [];
  const params = [];
  let paramIdx = 1;

  for (const tip of batch) {
    values.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}::jsonb, true, $${paramIdx++}, $${paramIdx++})`);
    params.push(
      crypto.randomUUID(),
      tip.category,
      tip.title,
      tip.title_fr,
      tip.content,
      tip.content_fr,
      tip.field,
      JSON.stringify(tip.tags),
      inserted + values.length - 1 + 200, // sort_order offset from existing data
      tip.difficulty || "beginner"
    );
  }

  const sql = `INSERT INTO interview_tip (id, category, title, title_fr, content, content_fr, field, tags, is_active, sort_order, difficulty)
    VALUES ${values.join(",\n    ")}
    ON CONFLICT (id) DO NOTHING`;

  try {
    const result = await c.query(sql, params);
    const batchInserted = result.rowCount;
    inserted += batchInserted;
    skipped += batch.length - batchInserted;

    // Count categories and fields
    for (const tip of batch) {
      categoryCounts[tip.category] = (categoryCounts[tip.category] || 0) + 1;
      fieldCounts[tip.field] = (fieldCounts[tip.field] || 0) + 1;
      difficultyCounts[tip.difficulty || "beginner"] = (difficultyCounts[tip.difficulty || "beginner"] || 0) + 1;
    }

    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${batchInserted}/${batch.length}`);
  } catch (e) {
    console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} ERROR:`, e.message);
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────
const { rows: total } = await c.query("SELECT count(*) FROM interview_tip");

console.log("\n══════════════════════════════════════════════════════════════");
console.log("  SEED TIPS MASSIVE — SUMMARY");
console.log("══════════════════════════════════════════════════════════════");
console.log(`  Tips in script: ${tips.length}`);
console.log(`  Inserted:       ${inserted}`);
console.log(`  Skipped:        ${skipped}`);
console.log(`  Total in DB:    ${total[0].count}`);

console.log("\n  BY CATEGORY (new tips):");
for (const [cat, count] of Object.entries(categoryCounts).sort()) {
  console.log(`    ${cat.padEnd(20)} ${count}`);
}

console.log("\n  BY FIELD (new tips):");
for (const [field, count] of Object.entries(fieldCounts).sort()) {
  console.log(`    ${field.padEnd(28)} ${count}`);
}

console.log("\n  BY DIFFICULTY (new tips):");
for (const [diff, count] of Object.entries(difficultyCounts).sort()) {
  console.log(`    ${diff.padEnd(20)} ${count}`);
}

// Verify DB-level category distribution
const { rows: dbCats } = await c.query("SELECT category, count(*) FROM interview_tip GROUP BY category ORDER BY count DESC");
console.log("\n  DB TOTAL BY CATEGORY:");
for (const row of dbCats) {
  console.log(`    ${(row.category || "null").padEnd(20)} ${row.count}`);
}

console.log("══════════════════════════════════════════════════════════════\n");
await c.end();
