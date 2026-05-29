/**
 * Massive Seed Script: 200+ Skills & 100+ Employers
 *
 * Populates skill_library and career_employer tables with comprehensive
 * data covering Morocco's job market across all fields.
 *
 * Database: localhost:5432, postgres/postgres
 * Tables: skill_library, career_employer
 *
 * Usage: node scripts/seed-skills-employers-massive.mjs
 */

import pg from "pg";
const { Client } = pg;

const client = new Client({
	host: "localhost",
	port: 5432,
	database: "postgres",
	user: "postgres",
	password: "postgres",
});

// ============================================================================
// SKILLS DATA (200+)
// ============================================================================

/**
 * Schema: id (uuid auto), name, name_fr, field, category,
 *         description, description_fr, is_recommended, is_active,
 *         sort_order, created_at, updated_at
 *
 * demand_level is encoded in is_recommended (high = true) and noted in description.
 */

const SKILLS = [
	// -------------------------------------------------------------------------
	// IT / TECH (40 skills)
	// -------------------------------------------------------------------------
	{ name: "JavaScript", name_fr: "JavaScript", category: "technical", field: "it", description_fr: "Langage de programmation incontournable pour le web frontend et backend. Ecosysteme riche avec npm et des millions de packages.", demand: "high" },
	{ name: "TypeScript", name_fr: "TypeScript", category: "technical", field: "it", description_fr: "Surcouche typee de JavaScript offrant robustesse et maintenabilite pour les projets d'envergure.", demand: "high" },
	{ name: "React", name_fr: "React", category: "technical", field: "it", description_fr: "Bibliotheque UI de Meta pour construire des interfaces utilisateur reactives et composables.", demand: "high" },
	{ name: "Angular", name_fr: "Angular", category: "technical", field: "it", description_fr: "Framework complet de Google pour les applications web enterprise avec injection de dependances et modules.", demand: "high" },
	{ name: "Vue.js", name_fr: "Vue.js", category: "technical", field: "it", description_fr: "Framework JavaScript progressif apprecie pour sa courbe d'apprentissage douce et sa flexibilite.", demand: "high" },
	{ name: "Node.js", name_fr: "Node.js", category: "technical", field: "it", description_fr: "Runtime JavaScript cote serveur permettant de construire des APIs performantes et des services temps reel.", demand: "high" },
	{ name: "Python", name_fr: "Python", category: "technical", field: "it", description_fr: "Langage polyvalent utilise en data science, IA, automatisation et developpement web.", demand: "high" },
	{ name: "Java", name_fr: "Java", category: "technical", field: "it", description_fr: "Langage oriente objet robuste, pilier des systemes enterprise, banques et grandes applications.", demand: "high" },
	{ name: "C#", name_fr: "C#", category: "technical", field: "it", description_fr: "Langage Microsoft pour le developpement .NET, applications desktop, web et jeux video avec Unity.", demand: "medium" },
	{ name: ".NET", name_fr: ".NET", category: "tool", field: "it", description_fr: "Plateforme Microsoft pour le developpement d'applications enterprise, APIs et microservices.", demand: "medium" },
	{ name: "PHP", name_fr: "PHP", category: "technical", field: "it", description_fr: "Langage serveur populaire au Maroc, notamment avec WordPress et les frameworks modernes.", demand: "medium" },
	{ name: "Laravel", name_fr: "Laravel", category: "tool", field: "it", description_fr: "Framework PHP elegant pour le developpement rapide d'applications web avec ORM et migrations.", demand: "medium" },
	{ name: "Django", name_fr: "Django", category: "tool", field: "it", description_fr: "Framework Python full-stack avec admin integre, ORM puissant et securite renforcee.", demand: "medium" },
	{ name: "Flask", name_fr: "Flask", category: "tool", field: "it", description_fr: "Micro-framework Python leger pour construire des APIs et applications web rapidement.", demand: "medium" },
	{ name: "Spring Boot", name_fr: "Spring Boot", category: "tool", field: "it", description_fr: "Framework Java pour les microservices enterprise avec auto-configuration et deploiement simplifie.", demand: "high" },
	{ name: "Docker", name_fr: "Docker", category: "tool", field: "it", description_fr: "Plateforme de conteneurisation pour empaqueter et deployer des applications de maniere reproductible.", demand: "high" },
	{ name: "Kubernetes", name_fr: "Kubernetes", category: "tool", field: "it", description_fr: "Orchestrateur de conteneurs pour le deploiement, la mise a l'echelle et la gestion d'applications cloud.", demand: "high" },
	{ name: "AWS", name_fr: "AWS (Amazon Web Services)", category: "tool", field: "it", description_fr: "Plateforme cloud leader offrant plus de 200 services pour le calcul, le stockage et le reseau.", demand: "high" },
	{ name: "Azure", name_fr: "Microsoft Azure", category: "tool", field: "it", description_fr: "Cloud Microsoft integre a l'ecosysteme Enterprise, tres utilise dans les grandes entreprises marocaines.", demand: "high" },
	{ name: "GCP", name_fr: "Google Cloud Platform", category: "tool", field: "it", description_fr: "Cloud Google avec services IA/ML avances, BigQuery et infrastructure mondiale.", demand: "medium" },
	{ name: "Terraform", name_fr: "Terraform", category: "tool", field: "it", description_fr: "Outil d'Infrastructure as Code pour provisionner et gerer l'infrastructure cloud de maniere declarative.", demand: "high" },
	{ name: "Jenkins", name_fr: "Jenkins", category: "tool", field: "it", description_fr: "Serveur d'automatisation CI/CD open source pour l'integration et le deploiement continus.", demand: "medium" },
	{ name: "Git", name_fr: "Git", category: "tool", field: "it", description_fr: "Systeme de controle de version distribue indispensable pour tout developpeur logiciel.", demand: "high" },
	{ name: "CI/CD", name_fr: "CI/CD (Integration/Deploiement Continu)", category: "technical", field: "it", description_fr: "Pratiques d'automatisation du build, des tests et du deploiement pour livrer du code de qualite rapidement.", demand: "high" },
	{ name: "PostgreSQL", name_fr: "PostgreSQL", category: "tool", field: "it", description_fr: "Base de donnees relationnelle open source avancee avec support JSON, extensibilite et fiabilite.", demand: "high" },
	{ name: "MongoDB", name_fr: "MongoDB", category: "tool", field: "it", description_fr: "Base de donnees NoSQL orientee document pour les applications modernes a schema flexible.", demand: "medium" },
	{ name: "Redis", name_fr: "Redis", category: "tool", field: "it", description_fr: "Store de donnees en memoire ultra-rapide pour le cache, les sessions et les files de messages.", demand: "medium" },
	{ name: "GraphQL", name_fr: "GraphQL", category: "technical", field: "it", description_fr: "Langage de requete pour APIs offrant aux clients le controle precis des donnees demandees.", demand: "medium" },
	{ name: "REST API", name_fr: "API REST", category: "technical", field: "it", description_fr: "Architecture standard pour la conception d'APIs web stateless, scalables et interoperables.", demand: "high" },
	{ name: "Microservices", name_fr: "Microservices", category: "technical", field: "it", description_fr: "Architecture decomposant une application en services independants, deployables et scalables separement.", demand: "high" },
	{ name: "Kafka", name_fr: "Apache Kafka", category: "tool", field: "it", description_fr: "Plateforme de streaming d'evenements pour le traitement de donnees en temps reel a grande echelle.", demand: "medium" },
	{ name: "RabbitMQ", name_fr: "RabbitMQ", category: "tool", field: "it", description_fr: "Broker de messages fiable pour la communication asynchrone entre services distribues.", demand: "medium" },
	{ name: "TDD", name_fr: "TDD (Developpement Guide par les Tests)", category: "technical", field: "it", description_fr: "Methodologie de developpement ou les tests sont ecrits avant le code pour garantir la qualite.", demand: "medium" },
	{ name: "Agile/Scrum", name_fr: "Agile/Scrum", category: "technical", field: "it", description_fr: "Methodologies de gestion de projet iteratives favorisant la collaboration et l'adaptation rapide.", demand: "high" },
	{ name: "Machine Learning", name_fr: "Machine Learning", category: "technical", field: "it", description_fr: "Branche de l'IA permettant aux machines d'apprendre a partir de donnees pour faire des predictions.", demand: "high" },
	{ name: "TensorFlow", name_fr: "TensorFlow", category: "tool", field: "it", description_fr: "Framework open source de Google pour le deep learning et le calcul numerique distribue.", demand: "medium" },
	{ name: "PyTorch", name_fr: "PyTorch", category: "tool", field: "it", description_fr: "Framework de deep learning de Meta, prefere par la communaute recherche pour sa flexibilite.", demand: "medium" },
	{ name: "NLP", name_fr: "NLP (Traitement du Langage Naturel)", category: "technical", field: "it", description_fr: "Domaine de l'IA consacre a la comprehension et la generation du langage humain par les machines.", demand: "high" },
	{ name: "Computer Vision", name_fr: "Vision par Ordinateur", category: "technical", field: "it", description_fr: "Domaine de l'IA permettant aux machines d'interpreter et d'analyser des images et videos.", demand: "medium" },
	{ name: "Blockchain", name_fr: "Blockchain", category: "technical", field: "it", description_fr: "Technologie de registre distribue pour les transactions securisees et la tracabilite des donnees.", demand: "low" },

	// -------------------------------------------------------------------------
	// ENGINEERING / INDUSTRIAL (30 skills)
	// -------------------------------------------------------------------------
	{ name: "AutoCAD", name_fr: "AutoCAD", category: "tool", field: "industrial", description_fr: "Logiciel de CAO leader pour la conception 2D et 3D en ingenierie mecanique et architecture.", demand: "high" },
	{ name: "SolidWorks", name_fr: "SolidWorks", category: "tool", field: "industrial", description_fr: "Logiciel de modelisation 3D parametrique pour la conception mecanique et la simulation.", demand: "high" },
	{ name: "CATIA", name_fr: "CATIA", category: "tool", field: "industrial", description_fr: "Suite PLM de Dassault Systemes pour la conception avancee dans l'aeronautique et l'automobile.", demand: "high" },
	{ name: "MATLAB", name_fr: "MATLAB", category: "tool", field: "industrial", description_fr: "Environnement de calcul numerique pour l'analyse de donnees, la modelisation et le prototypage.", demand: "medium" },
	{ name: "Simulink", name_fr: "Simulink", category: "tool", field: "industrial", description_fr: "Environnement de simulation multi-domaine integre a MATLAB pour la modelisation de systemes dynamiques.", demand: "medium" },
	{ name: "PLC Programming", name_fr: "Programmation Automate (PLC)", category: "technical", field: "industrial", description_fr: "Programmation d'automates programmables industriels pour le controle de processus de fabrication.", demand: "high" },
	{ name: "SCADA", name_fr: "SCADA", category: "tool", field: "industrial", description_fr: "Systemes de supervision et controle pour la gestion en temps reel des installations industrielles.", demand: "high" },
	{ name: "Lean Manufacturing", name_fr: "Lean Manufacturing", category: "technical", field: "industrial", description_fr: "Philosophie de production eliminant les gaspillages pour maximiser la valeur ajoutee.", demand: "high" },
	{ name: "Six Sigma", name_fr: "Six Sigma", category: "certification", field: "industrial", description_fr: "Methodologie statistique visant le zero defaut et l'amelioration continue de la qualite.", demand: "high" },
	{ name: "Kaizen", name_fr: "Kaizen", category: "technical", field: "industrial", description_fr: "Approche d'amelioration continue impliquant tous les niveaux de l'organisation.", demand: "medium" },
	{ name: "5S", name_fr: "5S", category: "technical", field: "industrial", description_fr: "Methode d'organisation du poste de travail : Trier, Ranger, Nettoyer, Standardiser, Maintenir.", demand: "medium" },
	{ name: "TPM", name_fr: "TPM (Maintenance Productive Totale)", category: "technical", field: "industrial", description_fr: "Strategie de maintenance impliquant tous les employes pour maximiser la disponibilite des equipements.", demand: "medium" },
	{ name: "FMEA/AMDEC", name_fr: "AMDEC (Analyse des Modes de Defaillance)", category: "technical", field: "industrial", description_fr: "Methode d'analyse preventive des risques de defaillance dans les processus et produits.", demand: "high" },
	{ name: "SPC", name_fr: "SPC (Maitrise Statistique des Procedes)", category: "technical", field: "industrial", description_fr: "Utilisation d'outils statistiques pour surveiller et controler la qualite des processus de production.", demand: "medium" },
	{ name: "CAD/CAM", name_fr: "CAO/FAO", category: "tool", field: "industrial", description_fr: "Conception et fabrication assistees par ordinateur pour l'usinage et la production de pieces.", demand: "high" },
	{ name: "3D Printing", name_fr: "Impression 3D", category: "technical", field: "industrial", description_fr: "Technologie de fabrication additive pour le prototypage rapide et la production de pieces complexes.", demand: "medium" },
	{ name: "Industrial Robotics", name_fr: "Robotique Industrielle", category: "technical", field: "industrial", description_fr: "Conception, programmation et maintenance de robots industriels pour l'automatisation de la production.", demand: "high" },
	{ name: "Automation", name_fr: "Automatisme", category: "technical", field: "industrial", description_fr: "Conception de systemes automatises pour optimiser les processus industriels et reduire l'intervention humaine.", demand: "high" },
	{ name: "Instrumentation", name_fr: "Instrumentation", category: "technical", field: "industrial", description_fr: "Mesure et controle des parametres physiques (temperature, pression, debit) dans les procedes industriels.", demand: "medium" },
	{ name: "Metrology", name_fr: "Metrologie", category: "technical", field: "industrial", description_fr: "Science de la mesure garantissant la precision et la conformite des instruments et produits.", demand: "medium" },
	{ name: "Production Management", name_fr: "Gestion de Production", category: "technical", field: "industrial", description_fr: "Planification et pilotage de la production pour optimiser les delais, couts et qualite.", demand: "high" },
	{ name: "CMMS", name_fr: "GMAO (Gestion de Maintenance Assistee par Ordinateur)", category: "tool", field: "industrial", description_fr: "Logiciels de gestion de la maintenance pour planifier, suivre et optimiser les interventions.", demand: "medium" },
	{ name: "SAP ERP", name_fr: "ERP SAP", category: "tool", field: "industrial", description_fr: "Progiciel de gestion integre leader mondial couvrant finance, logistique, production et RH.", demand: "high" },
	{ name: "MES", name_fr: "MES (Manufacturing Execution System)", category: "tool", field: "industrial", description_fr: "Systeme de pilotage de la production en temps reel reliant l'ERP aux equipements de l'atelier.", demand: "medium" },
	{ name: "Industrial IoT", name_fr: "IoT Industriel", category: "technical", field: "industrial", description_fr: "Capteurs et reseaux connectes pour la surveillance en temps reel et l'optimisation des processus.", demand: "high" },
	{ name: "Digital Twin", name_fr: "Jumeau Numerique", category: "technical", field: "industrial", description_fr: "Replica virtuelle d'un systeme physique pour simuler, analyser et optimiser les performances.", demand: "medium" },
	{ name: "Process Simulation", name_fr: "Simulation de Procedes", category: "technical", field: "industrial", description_fr: "Modelisation numerique des processus industriels pour predire les performances et optimiser la conception.", demand: "medium" },
	{ name: "Industrial Project Management", name_fr: "Gestion de Projet Industriel", category: "technical", field: "industrial", description_fr: "Pilotage de projets industriels de la conception a la mise en service avec respect des delais et budgets.", demand: "high" },
	{ name: "Vibration Analysis", name_fr: "Analyse Vibratoire", category: "technical", field: "industrial", description_fr: "Diagnostic des machines tournantes par analyse des vibrations pour prevenir les pannes.", demand: "medium" },
	{ name: "Thermography", name_fr: "Thermographie", category: "technical", field: "industrial", description_fr: "Technique d'imagerie infrarouge pour detecter les anomalies thermiques dans les installations.", demand: "low" },

	// -------------------------------------------------------------------------
	// HSE (20 skills)
	// -------------------------------------------------------------------------
	{ name: "ISO 14001", name_fr: "ISO 14001", category: "certification", field: "hse", description_fr: "Norme internationale pour les systemes de management environnemental en entreprise.", demand: "high" },
	{ name: "ISO 45001", name_fr: "ISO 45001", category: "certification", field: "hse", description_fr: "Norme internationale pour les systemes de management de la sante et de la securite au travail.", demand: "high" },
	{ name: "OHSAS 18001", name_fr: "OHSAS 18001", category: "certification", field: "hse", description_fr: "Referentiel de management de la securite et sante au travail, predecesseur de l'ISO 45001.", demand: "medium" },
	{ name: "Risk Assessment", name_fr: "Evaluation des Risques", category: "technical", field: "hse", description_fr: "Identification, analyse et hierarchisation des risques professionnels pour prevenir les accidents.", demand: "high" },
	{ name: "NEBOSH", name_fr: "NEBOSH", category: "certification", field: "hse", description_fr: "Certification britannique reconnue internationalement en sante, securite et environnement.", demand: "high" },
	{ name: "IOSH", name_fr: "IOSH", category: "certification", field: "hse", description_fr: "Certification de l'Institution of Occupational Safety and Health pour les professionnels HSE.", demand: "medium" },
	{ name: "Fire Safety", name_fr: "Securite Incendie", category: "technical", field: "hse", description_fr: "Prevention, detection et lutte contre les incendies dans les etablissements industriels et publics.", demand: "high" },
	{ name: "Ergonomics", name_fr: "Ergonomie", category: "technical", field: "hse", description_fr: "Adaptation des postes de travail aux capacites humaines pour prevenir les TMS et ameliorer le confort.", demand: "medium" },
	{ name: "HSE Audit", name_fr: "Audit HSE", category: "technical", field: "hse", description_fr: "Evaluation systematique de la conformite et de l'efficacite du systeme de management HSE.", demand: "high" },
	{ name: "Emergency Plan", name_fr: "Plan d'Urgence", category: "technical", field: "hse", description_fr: "Elaboration et mise en oeuvre de plans d'intervention pour les situations d'urgence.", demand: "high" },
	{ name: "Risk Analysis", name_fr: "Analyse des Risques", category: "technical", field: "hse", description_fr: "Methodes structurees (APR, HAZOP, arbre des causes) pour identifier et quantifier les dangers.", demand: "high" },
	{ name: "Work Permits", name_fr: "Permis de Travail", category: "technical", field: "hse", description_fr: "Gestion des autorisations de travaux dangereux (travaux en hauteur, espaces confines, points chauds).", demand: "medium" },
	{ name: "PPE Management", name_fr: "Gestion des EPI", category: "technical", field: "hse", description_fr: "Selection, distribution et suivi des equipements de protection individuelle adaptes aux risques.", demand: "medium" },
	{ name: "Waste Management", name_fr: "Gestion des Dechets", category: "technical", field: "hse", description_fr: "Tri, collecte, traitement et elimination des dechets industriels conformement a la reglementation.", demand: "high" },
	{ name: "Impact Study", name_fr: "Etude d'Impact Environnemental", category: "technical", field: "hse", description_fr: "Evaluation des effets d'un projet sur l'environnement et proposition de mesures compensatoires.", demand: "medium" },
	{ name: "ICPE Regulations", name_fr: "Reglementation ICPE", category: "technical", field: "hse", description_fr: "Connaissance des installations classees pour la protection de l'environnement et leurs obligations.", demand: "medium" },
	{ name: "SEVESO Regulations", name_fr: "Reglementation SEVESO", category: "technical", field: "hse", description_fr: "Maitrise de la directive europeenne sur les accidents majeurs impliquant des substances dangereuses.", demand: "medium" },
	{ name: "Occupational Health", name_fr: "Sante et Securite au Travail (SST)", category: "technical", field: "hse", description_fr: "Ensemble des mesures preventives pour proteger la sante physique et mentale des travailleurs.", demand: "high" },
	{ name: "Risk Assessment Document", name_fr: "Document Unique d'Evaluation des Risques", category: "technical", field: "hse", description_fr: "Document obligatoire recensant et evaluant tous les risques professionnels de l'entreprise.", demand: "high" },
	{ name: "CHSCT", name_fr: "CHSCT / CSE", category: "technical", field: "hse", description_fr: "Participation aux instances representatives du personnel pour la sante, securite et conditions de travail.", demand: "medium" },

	// -------------------------------------------------------------------------
	// HEALTHCARE (20 skills)
	// -------------------------------------------------------------------------
	{ name: "Nursing Care", name_fr: "Soins Infirmiers", category: "technical", field: "healthcare", description_fr: "Ensemble des actes de soins realises par les infirmiers pour la prise en charge globale du patient.", demand: "high" },
	{ name: "Resuscitation", name_fr: "Reanimation", category: "technical", field: "healthcare", description_fr: "Prise en charge des patients en detresse vitale avec surveillance continue et soins intensifs.", demand: "high" },
	{ name: "Medical Imaging", name_fr: "Imagerie Medicale", category: "technical", field: "healthcare", description_fr: "Techniques de diagnostic par l'image : radiographie, scanner, IRM, echographie.", demand: "high" },
	{ name: "Ultrasound", name_fr: "Echographie", category: "technical", field: "healthcare", description_fr: "Technique d'imagerie par ultrasons pour le diagnostic en obstetrique, cardiologie et autres specialites.", demand: "high" },
	{ name: "MRI", name_fr: "IRM (Imagerie par Resonance Magnetique)", category: "technical", field: "healthcare", description_fr: "Technique d'imagerie avancee utilisant les champs magnetiques pour un diagnostic precis des tissus mous.", demand: "medium" },
	{ name: "CT Scan", name_fr: "Scanner (Tomodensitometrie)", category: "technical", field: "healthcare", description_fr: "Technique de radiologie utilisant les rayons X pour obtenir des images en coupe du corps humain.", demand: "medium" },
	{ name: "Medical Biology", name_fr: "Biologie Medicale", category: "technical", field: "healthcare", description_fr: "Analyses biologiques (sang, urine, tissus) pour le diagnostic et le suivi des pathologies.", demand: "medium" },
	{ name: "Pharmacovigilance", name_fr: "Pharmacovigilance", category: "technical", field: "healthcare", description_fr: "Surveillance et prevention des effets indesirables des medicaments apres leur mise sur le marche.", demand: "medium" },
	{ name: "Clinical Research", name_fr: "Recherche Clinique", category: "technical", field: "healthcare", description_fr: "Conduite d'essais cliniques pour evaluer l'efficacite et la securite des nouveaux traitements.", demand: "medium" },
	{ name: "Hospital Hygiene", name_fr: "Hygiene Hospitaliere", category: "technical", field: "healthcare", description_fr: "Prevention et controle des infections nosocomiales par des protocoles stricts d'hygiene.", demand: "high" },
	{ name: "Hospital Management", name_fr: "Gestion Hospitaliere", category: "technical", field: "healthcare", description_fr: "Administration et pilotage des etablissements de sante : budget, RH, qualite et logistique.", demand: "medium" },
	{ name: "EMR", name_fr: "Dossier Patient Informatise (DPI)", category: "tool", field: "healthcare", description_fr: "Utilisation des systemes informatiques pour la gestion et le partage des dossiers medicaux.", demand: "high" },
	{ name: "CCAM Nomenclature", name_fr: "Nomenclature CCAM", category: "technical", field: "healthcare", description_fr: "Classification commune des actes medicaux pour la cotation et la facturation des soins.", demand: "medium" },
	{ name: "Health Risk Management", name_fr: "Gestion des Risques Sanitaires", category: "technical", field: "healthcare", description_fr: "Identification et maitrise des risques lies aux soins pour ameliorer la securite des patients.", demand: "high" },
	{ name: "Therapeutic Education", name_fr: "Education Therapeutique du Patient", category: "technical", field: "healthcare", description_fr: "Accompagnement des patients chroniques pour les rendre autonomes dans la gestion de leur maladie.", demand: "medium" },
	{ name: "Palliative Care", name_fr: "Soins Palliatifs", category: "technical", field: "healthcare", description_fr: "Prise en charge globale des patients en fin de vie pour soulager la douleur et accompagner la famille.", demand: "medium" },
	{ name: "Emergency Medicine", name_fr: "Urgences", category: "technical", field: "healthcare", description_fr: "Prise en charge rapide et structuree des patients en situation d'urgence vitale ou fonctionnelle.", demand: "high" },
	{ name: "Operating Room", name_fr: "Bloc Operatoire", category: "technical", field: "healthcare", description_fr: "Gestion et assistance au bloc operatoire incluant instrumentation, sterilite et securite du patient.", demand: "high" },
	{ name: "Sterilization", name_fr: "Sterilisation", category: "technical", field: "healthcare", description_fr: "Processus d'elimination des micro-organismes sur les dispositifs medicaux reutilisables.", demand: "medium" },
	{ name: "Telemedicine", name_fr: "Telemedecine", category: "technical", field: "healthcare", description_fr: "Pratique medicale a distance via les technologies numeriques pour les consultations et le suivi.", demand: "high" },

	// -------------------------------------------------------------------------
	// FINANCE (20 skills)
	// -------------------------------------------------------------------------
	{ name: "IFRS Accounting", name_fr: "Comptabilite IFRS", category: "technical", field: "finance", description_fr: "Application des normes internationales d'information financiere pour les etats financiers consolides.", demand: "high" },
	{ name: "Financial Analysis", name_fr: "Analyse Financiere", category: "technical", field: "finance", description_fr: "Evaluation de la performance et de la sante financiere d'une entreprise par l'etude des etats financiers.", demand: "high" },
	{ name: "Internal Audit", name_fr: "Audit Interne", category: "technical", field: "finance", description_fr: "Evaluation independante des processus de gouvernance, de gestion des risques et de controle interne.", demand: "high" },
	{ name: "Management Control", name_fr: "Controle de Gestion", category: "technical", field: "finance", description_fr: "Pilotage de la performance par les budgets, tableaux de bord et analyse des ecarts.", demand: "high" },
	{ name: "Moroccan Tax Law", name_fr: "Fiscalite Marocaine", category: "technical", field: "finance", description_fr: "Maitrise du systeme fiscal marocain : IS, IR, TVA, droits d'enregistrement et conventions fiscales.", demand: "high" },
	{ name: "Consolidation", name_fr: "Consolidation des Comptes", category: "technical", field: "finance", description_fr: "Agregation des etats financiers des filiales pour presenter les comptes du groupe.", demand: "medium" },
	{ name: "SAP FI/CO", name_fr: "SAP FI/CO", category: "tool", field: "finance", description_fr: "Modules financiers de SAP pour la comptabilite generale, analytique et le controle de gestion.", demand: "high" },
	{ name: "Sage Accounting", name_fr: "Sage Comptabilite", category: "tool", field: "finance", description_fr: "Logiciel comptable largement utilise par les PME marocaines pour la tenue et le suivi comptable.", demand: "medium" },
	{ name: "Ciel Compta", name_fr: "Ciel Compta", category: "tool", field: "finance", description_fr: "Solution comptable pour les petites entreprises avec gestion de la TVA et des declarations fiscales.", demand: "low" },
	{ name: "Bloomberg Terminal", name_fr: "Terminal Bloomberg", category: "tool", field: "finance", description_fr: "Plateforme d'information financiere en temps reel pour l'analyse des marches et la prise de decision.", demand: "medium" },
	{ name: "Advanced Excel", name_fr: "Excel Avance", category: "tool", field: "finance", description_fr: "Maitrise avancee d'Excel : tableaux croises, macros VBA, Power Query et modelisation financiere.", demand: "high" },
	{ name: "Power BI", name_fr: "Power BI", category: "tool", field: "finance", description_fr: "Outil de Business Intelligence de Microsoft pour la visualisation et l'analyse de donnees financieres.", demand: "high" },
	{ name: "Tableau", name_fr: "Tableau", category: "tool", field: "finance", description_fr: "Plateforme de visualisation de donnees pour creer des tableaux de bord interactifs et percutants.", demand: "medium" },
	{ name: "Risk Management", name_fr: "Gestion des Risques (Risk Management)", category: "technical", field: "finance", description_fr: "Identification, evaluation et mitigation des risques financiers, operationnels et strategiques.", demand: "high" },
	{ name: "Compliance", name_fr: "Conformite (Compliance)", category: "technical", field: "finance", description_fr: "Assurer le respect des reglementations financieres, bancaires et anti-corruption.", demand: "high" },
	{ name: "KYC/AML", name_fr: "KYC/AML (Connaissance Client / Anti-Blanchiment)", category: "technical", field: "finance", description_fr: "Procedures de verification de l'identite des clients et de lutte contre le blanchiment d'argent.", demand: "high" },
	{ name: "Treasury", name_fr: "Tresorerie", category: "technical", field: "finance", description_fr: "Gestion des flux de tresorerie, previsions de cash-flow et optimisation du BFR.", demand: "medium" },
	{ name: "Credit Scoring", name_fr: "Scoring Credit", category: "technical", field: "finance", description_fr: "Modeles statistiques pour evaluer la solvabilite des emprunteurs et le risque de defaut.", demand: "medium" },
	{ name: "Insurance", name_fr: "Assurance", category: "technical", field: "finance", description_fr: "Connaissance des produits d'assurance, de la souscription, de la tarification et de la gestion des sinistres.", demand: "medium" },
	{ name: "Actuarial Science", name_fr: "Actuariat", category: "technical", field: "finance", description_fr: "Application des mathematiques et statistiques pour evaluer les risques en assurance et finance.", demand: "medium" },

	// -------------------------------------------------------------------------
	// SOFT SKILLS (30 skills)
	// -------------------------------------------------------------------------
	{ name: "Leadership", name_fr: "Leadership", category: "soft_skill", field: "general", description_fr: "Capacite a inspirer, motiver et guider une equipe vers des objectifs communs.", demand: "high" },
	{ name: "Communication", name_fr: "Communication", category: "soft_skill", field: "general", description_fr: "Aptitude a transmettre des idees clairement a l'oral et a l'ecrit en contexte professionnel.", demand: "high" },
	{ name: "Negotiation", name_fr: "Negociation", category: "soft_skill", field: "general", description_fr: "Art de parvenir a un accord mutuellement benefique lors de discussions commerciales ou professionnelles.", demand: "high" },
	{ name: "Time Management", name_fr: "Gestion du Temps", category: "soft_skill", field: "general", description_fr: "Organisation et priorisation des taches pour maximiser l'efficacite et respecter les delais.", demand: "high" },
	{ name: "Problem Solving", name_fr: "Resolution de Problemes", category: "soft_skill", field: "general", description_fr: "Capacite a identifier, analyser et resoudre des problemes complexes de maniere structuree.", demand: "high" },
	{ name: "Teamwork", name_fr: "Travail d'Equipe", category: "soft_skill", field: "general", description_fr: "Collaboration efficace avec les membres d'une equipe pour atteindre des objectifs partages.", demand: "high" },
	{ name: "Adaptability", name_fr: "Adaptabilite", category: "soft_skill", field: "general", description_fr: "Flexibilite face aux changements et capacite a s'ajuster rapidement a de nouvelles situations.", demand: "high" },
	{ name: "Creativity", name_fr: "Creativite", category: "soft_skill", field: "general", description_fr: "Aptitude a generer des idees nouvelles et innovantes pour resoudre des problemes ou creer de la valeur.", demand: "medium" },
	{ name: "Emotional Intelligence", name_fr: "Intelligence Emotionnelle", category: "soft_skill", field: "general", description_fr: "Comprehension et gestion de ses propres emotions et de celles des autres pour des relations harmonieuses.", demand: "high" },
	{ name: "Decision Making", name_fr: "Prise de Decision", category: "soft_skill", field: "general", description_fr: "Capacite a choisir parmi des options en evaluant les risques, les benefices et les consequences.", demand: "high" },
	{ name: "Conflict Management", name_fr: "Gestion de Conflit", category: "soft_skill", field: "general", description_fr: "Resolution constructive des desaccords et tensions dans un environnement professionnel.", demand: "medium" },
	{ name: "Presentation Skills", name_fr: "Presentation", category: "soft_skill", field: "general", description_fr: "Aptitude a structurer et delivrer des presentations convaincantes devant un public.", demand: "high" },
	{ name: "Writing Skills", name_fr: "Redaction Professionnelle", category: "soft_skill", field: "general", description_fr: "Maitrise de la redaction de documents professionnels : rapports, courriers, notes de synthese.", demand: "medium" },
	{ name: "Networking", name_fr: "Networking (Reseautage)", category: "soft_skill", field: "general", description_fr: "Construction et entretien d'un reseau professionnel pour creer des opportunites de carriere.", demand: "medium" },
	{ name: "Mentoring", name_fr: "Mentorat", category: "soft_skill", field: "general", description_fr: "Accompagnement et guidage de collegues moins experimentes dans leur developpement professionnel.", demand: "medium" },
	{ name: "Critical Thinking", name_fr: "Pensee Critique", category: "soft_skill", field: "general", description_fr: "Analyse objective et evaluation rigoureuse des informations avant de tirer des conclusions.", demand: "high" },
	{ name: "Stress Management", name_fr: "Gestion du Stress", category: "soft_skill", field: "general", description_fr: "Techniques pour maintenir la performance et le bien-etre sous pression et dans des delais serres.", demand: "medium" },
	{ name: "Autonomy", name_fr: "Autonomie", category: "soft_skill", field: "general", description_fr: "Capacite a travailler de maniere independante avec un minimum de supervision.", demand: "high" },
	{ name: "Organization", name_fr: "Organisation", category: "soft_skill", field: "general", description_fr: "Structuration methodique du travail, des documents et des processus pour une efficacite optimale.", demand: "high" },
	{ name: "Intellectual Curiosity", name_fr: "Curiosite Intellectuelle", category: "soft_skill", field: "general", description_fr: "Desir continu d'apprendre, de comprendre et d'explorer de nouveaux domaines de connaissance.", demand: "medium" },
	{ name: "Analytical Thinking", name_fr: "Esprit d'Analyse", category: "soft_skill", field: "general", description_fr: "Decomposition de situations complexes en elements simples pour une comprehension approfondie.", demand: "high" },
	{ name: "Active Listening", name_fr: "Ecoute Active", category: "soft_skill", field: "general", description_fr: "Attention pleine et entiere a l'interlocuteur pour comprendre ses besoins et preoccupations.", demand: "high" },
	{ name: "Empathy", name_fr: "Empathie", category: "soft_skill", field: "general", description_fr: "Capacite a se mettre a la place de l'autre pour comprendre ses emotions et son point de vue.", demand: "medium" },
	{ name: "Resilience", name_fr: "Resilience", category: "soft_skill", field: "general", description_fr: "Aptitude a rebondir apres des echecs et a maintenir sa motivation face aux difficultes.", demand: "high" },
	{ name: "Initiative", name_fr: "Initiative", category: "soft_skill", field: "general", description_fr: "Prise d'action proactive sans attendre les instructions, en anticipant les besoins.", demand: "high" },
	{ name: "Rigor", name_fr: "Rigueur", category: "soft_skill", field: "general", description_fr: "Precision et attention aux details dans l'execution des taches et le respect des procedures.", demand: "high" },
	{ name: "Versatility", name_fr: "Polyvalence", category: "soft_skill", field: "general", description_fr: "Capacite a assumer plusieurs roles et a s'adapter a differentes missions avec competence.", demand: "medium" },
	{ name: "Service Orientation", name_fr: "Sens du Service", category: "soft_skill", field: "general", description_fr: "Orientation vers la satisfaction des besoins des clients internes et externes.", demand: "high" },
	{ name: "Synthesis", name_fr: "Esprit de Synthese", category: "soft_skill", field: "general", description_fr: "Capacite a condenser des informations complexes en messages clairs et concis.", demand: "high" },
	{ name: "Project Management", name_fr: "Gestion de Projet", category: "soft_skill", field: "general", description_fr: "Planification, execution et cloture de projets dans le respect des delais, du budget et du perimetre.", demand: "high" },

	// -------------------------------------------------------------------------
	// LANGUAGES (10 skills)
	// -------------------------------------------------------------------------
	{ name: "French", name_fr: "Francais", category: "language", field: "languages", description_fr: "Langue officielle de l'administration et des affaires au Maroc. Maitrise indispensable pour le monde professionnel.", demand: "high" },
	{ name: "Arabic (Darija)", name_fr: "Arabe (Darija)", category: "language", field: "languages", description_fr: "Langue maternelle marocaine, essentielle pour la communication quotidienne et le commerce local.", demand: "high" },
	{ name: "English", name_fr: "Anglais", category: "language", field: "languages", description_fr: "Langue internationale des affaires, de la technologie et de la recherche scientifique.", demand: "high" },
	{ name: "Spanish", name_fr: "Espagnol", category: "language", field: "languages", description_fr: "Langue de proximite geographique avec l'Espagne, utile pour le commerce et le tourisme au nord du Maroc.", demand: "medium" },
	{ name: "German", name_fr: "Allemand", category: "language", field: "languages", description_fr: "Langue cle pour travailler avec les entreprises allemandes presentes dans l'industrie automobile au Maroc.", demand: "medium" },
	{ name: "Italian", name_fr: "Italien", category: "language", field: "languages", description_fr: "Langue utile pour les secteurs du textile, de l'agroalimentaire et du tourisme au Maroc.", demand: "low" },
	{ name: "Amazigh", name_fr: "Amazigh (Tamazight)", category: "language", field: "languages", description_fr: "Langue officielle du Maroc, patrimoine culturel essentiel et competence valorisee dans les services publics.", demand: "medium" },
	{ name: "Mandarin Chinese", name_fr: "Mandarin (Chinois)", category: "language", field: "languages", description_fr: "Langue du premier partenaire commercial mondial, de plus en plus demandee dans le commerce international.", demand: "low" },
	{ name: "Japanese", name_fr: "Japonais", category: "language", field: "languages", description_fr: "Langue utile pour les entreprises japonaises du secteur automobile implantees au Maroc (Yazaki, Sumitomo).", demand: "low" },
	{ name: "Portuguese", name_fr: "Portugais", category: "language", field: "languages", description_fr: "Langue lusophone en croissance grace aux echanges avec le Bresil et les pays lusophones d'Afrique.", demand: "low" },

	// -------------------------------------------------------------------------
	// ADDITIONAL TECHNICAL SKILLS (30+ more to reach 200+)
	// -------------------------------------------------------------------------
	{ name: "Cybersecurity", name_fr: "Cybersecurite", category: "technical", field: "it", description_fr: "Protection des systemes d'information contre les menaces, intrusions et vulnerabilites.", demand: "high" },
	{ name: "Data Analysis", name_fr: "Analyse de Donnees", category: "technical", field: "it", description_fr: "Extraction d'informations et de tendances a partir de grandes quantites de donnees structurees et non structurees.", demand: "high" },
	{ name: "DevOps", name_fr: "DevOps", category: "technical", field: "it", description_fr: "Culture et pratiques unissant developpement et operations pour des livraisons rapides et fiables.", demand: "high" },
	{ name: "Linux Administration", name_fr: "Administration Linux", category: "technical", field: "it", description_fr: "Gestion des serveurs Linux : installation, configuration, securite et maintenance des systemes.", demand: "high" },
	{ name: "Network Administration", name_fr: "Administration Reseau", category: "technical", field: "it", description_fr: "Configuration et maintenance des reseaux informatiques : routeurs, switches, firewalls et VPN.", demand: "medium" },
	{ name: "SQL", name_fr: "SQL", category: "technical", field: "it", description_fr: "Langage de requete pour l'interrogation, la manipulation et la gestion des bases de donnees relationnelles.", demand: "high" },
	{ name: "Mobile Development", name_fr: "Developpement Mobile", category: "technical", field: "it", description_fr: "Creation d'applications pour smartphones et tablettes avec React Native, Flutter ou natif.", demand: "high" },
	{ name: "React Native", name_fr: "React Native", category: "tool", field: "it", description_fr: "Framework cross-platform de Meta pour creer des applications mobiles natives avec JavaScript.", demand: "medium" },
	{ name: "Flutter", name_fr: "Flutter", category: "tool", field: "it", description_fr: "Framework de Google pour creer des applications mobiles, web et desktop a partir d'un seul codebase.", demand: "medium" },
	{ name: "Power Platform", name_fr: "Microsoft Power Platform", category: "tool", field: "it", description_fr: "Suite Microsoft low-code incluant Power Apps, Power Automate et Power BI pour l'automatisation.", demand: "medium" },
	{ name: "Salesforce", name_fr: "Salesforce", category: "tool", field: "it", description_fr: "Plateforme CRM leader mondial pour la gestion de la relation client et l'automatisation commerciale.", demand: "medium" },
	{ name: "Data Engineering", name_fr: "Ingenierie des Donnees", category: "technical", field: "it", description_fr: "Conception et maintenance des pipelines de donnees pour alimenter les systemes analytiques et IA.", demand: "high" },
	{ name: "UI/UX Design", name_fr: "Design UI/UX", category: "technical", field: "it", description_fr: "Conception d'interfaces utilisateur intuitives et d'experiences digitales engageantes.", demand: "high" },
	{ name: "Figma", name_fr: "Figma", category: "tool", field: "it", description_fr: "Outil collaboratif de design d'interfaces et de prototypage pour les equipes produit.", demand: "high" },
	{ name: "WordPress", name_fr: "WordPress", category: "tool", field: "it", description_fr: "CMS le plus utilise au monde pour la creation de sites web, blogs et boutiques en ligne.", demand: "medium" },
	{ name: "SEO", name_fr: "SEO (Referencement Naturel)", category: "technical", field: "it", description_fr: "Optimisation des sites web pour ameliorer leur visibilite dans les resultats des moteurs de recherche.", demand: "medium" },
	{ name: "Digital Marketing", name_fr: "Marketing Digital", category: "technical", field: "general", description_fr: "Strategies de marketing en ligne incluant les reseaux sociaux, l'emailing, le SEA et le content marketing.", demand: "high" },
	{ name: "Social Media Management", name_fr: "Gestion des Reseaux Sociaux", category: "technical", field: "general", description_fr: "Animation et gestion des comptes de reseaux sociaux pour developper la notoriete et l'engagement.", demand: "medium" },
	{ name: "Content Creation", name_fr: "Creation de Contenu", category: "technical", field: "general", description_fr: "Production de contenus textuels, visuels et video pour les supports digitaux et traditionnels.", demand: "medium" },
	{ name: "Supply Chain Management", name_fr: "Gestion de la Chaine Logistique", category: "technical", field: "industrial", description_fr: "Pilotage des flux de matieres, d'informations et financiers de l'approvisionnement a la livraison.", demand: "high" },
	{ name: "Quality Management", name_fr: "Management de la Qualite", category: "technical", field: "industrial", description_fr: "Mise en place et animation du systeme de management de la qualite selon les normes ISO 9001.", demand: "high" },
	{ name: "ISO 9001", name_fr: "ISO 9001", category: "certification", field: "industrial", description_fr: "Norme internationale de reference pour les systemes de management de la qualite.", demand: "high" },
	{ name: "Electrical Engineering", name_fr: "Genie Electrique", category: "technical", field: "industrial", description_fr: "Conception et maintenance des installations electriques industrielles et des systemes de puissance.", demand: "high" },
	{ name: "Energy Management", name_fr: "Management de l'Energie", category: "technical", field: "industrial", description_fr: "Optimisation de la consommation energetique et integration des energies renouvelables en industrie.", demand: "high" },
	{ name: "Water Treatment", name_fr: "Traitement des Eaux", category: "technical", field: "hse", description_fr: "Techniques de potabilisation et de traitement des eaux usees industrielles et municipales.", demand: "medium" },
	{ name: "First Aid (SSIAP)", name_fr: "Secourisme (SST/SSIAP)", category: "certification", field: "hse", description_fr: "Formation aux gestes de premiers secours en milieu professionnel et intervention d'urgence.", demand: "high" },
	{ name: "Public Health", name_fr: "Sante Publique", category: "technical", field: "healthcare", description_fr: "Approche populationnelle de la sante couvrant l'epidemiologie, la prevention et la promotion de la sante.", demand: "medium" },
	{ name: "Nutrition", name_fr: "Nutrition et Dietetique", category: "technical", field: "healthcare", description_fr: "Science de l'alimentation appliquee a la prevention et au traitement des pathologies nutritionnelles.", demand: "medium" },
	{ name: "Medical Equipment", name_fr: "Equipements Biomedicaux", category: "technical", field: "healthcare", description_fr: "Maintenance, calibration et gestion du parc d'equipements medicaux en etablissement de sante.", demand: "medium" },
	{ name: "Financial Modeling", name_fr: "Modelisation Financiere", category: "technical", field: "finance", description_fr: "Construction de modeles Excel pour les previsions financieres, valorisations et analyses de scenarios.", demand: "high" },
	{ name: "Corporate Finance", name_fr: "Finance d'Entreprise", category: "technical", field: "finance", description_fr: "Decisions d'investissement, de financement et de distribution de dividendes pour optimiser la valeur.", demand: "high" },
	{ name: "Islamic Finance", name_fr: "Finance Islamique", category: "technical", field: "finance", description_fr: "Produits et services financiers conformes aux principes de la charia, en croissance au Maroc.", demand: "medium" },
];

// ============================================================================
// EMPLOYERS DATA (100+)
// ============================================================================

const EMPLOYERS = [
	// -------------------------------------------------------------------------
	// TECH / IT (25)
	// -------------------------------------------------------------------------
	{ name: "Capgemini Morocco", sector: "IT Services", sector_fr: "Services IT", location: "Casablanca", location_fr: "Casablanca", description_fr: "Leader mondial du conseil et des services informatiques. Le centre de Casablanca est l'un des plus grands du groupe avec plus de 3000 collaborateurs, specialise en developpement, testing et infrastructure cloud.", open_positions: 150, website: "https://www.capgemini.com/ma-fr/", fields: ["it", "finance"] },
	{ name: "CGI Morocco", sector: "IT Consulting", sector_fr: "Conseil IT", location: "Rabat", location_fr: "Rabat", description_fr: "Groupe canadien de services informatiques present au Maroc depuis 2007. Centre de competences majeur pour le developpement logiciel, l'integration de systemes et le conseil en transformation digitale.", open_positions: 80, website: "https://www.cgi.com/maroc/fr", fields: ["it"] },
	{ name: "Atos Morocco", sector: "IT Services", sector_fr: "Services IT", location: "Casablanca", location_fr: "Casablanca", description_fr: "Multinationale francaise specialisee dans la transformation digitale, le cloud et la cybersecurite. Accompagne les grandes entreprises marocaines et africaines dans leur modernisation IT.", open_positions: 60, website: "https://atos.net/fr/maroc", fields: ["it"] },
	{ name: "Sofrecom", sector: "Telecom Consulting", sector_fr: "Conseil Telecom", location: "Rabat", location_fr: "Rabat", description_fr: "Filiale d'Orange specialisee dans le conseil en telecommunications et la transformation digitale des operateurs. Centre nearshore majeur pour l'Afrique et le Moyen-Orient.", open_positions: 45, website: "https://www.sofrecom.com/", fields: ["it"] },
	{ name: "Intelcia", sector: "BPO/Technology", sector_fr: "BPO/Technologie", location: "Casablanca", location_fr: "Casablanca", description_fr: "Champion marocain de l'outsourcing IT et de la relation client avec plus de 35 000 collaborateurs dans 18 pays. Leader de la transformation digitale des processus metier en Afrique.", open_positions: 200, website: "https://www.intelcia.com/", fields: ["it", "general"] },
	{ name: "Majorel", sector: "CX/Technology", sector_fr: "Experience Client/Technologie", location: "Casablanca", location_fr: "Casablanca", description_fr: "Leader mondial de l'experience client next-gen avec des centres au Maroc. Combine technologie, analytics et intelligence artificielle pour transformer la relation client.", open_positions: 180, website: "https://www.majorel.com/", fields: ["it", "general"] },
	{ name: "Webhelp Morocco", sector: "BPO/Digital", sector_fr: "BPO/Digital", location: "Rabat", location_fr: "Rabat", description_fr: "Acteur majeur du Business Process Outsourcing au Maroc avec plusieurs milliers de collaborateurs. Specialise dans le support technique, la moderation de contenu et les services digitaux.", open_positions: 120, website: "https://www.webhelp.com/fr-fr/", fields: ["it", "general"] },
	{ name: "S2M", sector: "Payment Solutions", sector_fr: "Solutions de Paiement", location: "Casablanca", location_fr: "Casablanca", description_fr: "Editeur marocain leader en solutions de paiement electronique, monetique et banking digital. Presente dans plus de 30 pays avec des solutions innovantes de fintech.", open_positions: 30, website: "https://www.s2m.ma/", fields: ["it", "finance"] },
	{ name: "HPS", sector: "Payment Technology", sector_fr: "Technologie de Paiement", location: "Casablanca", location_fr: "Casablanca", description_fr: "Multinationale marocaine specialisee dans les solutions de paiement electronique avec sa plateforme PowerCARD. Cotee a la Bourse de Casablanca, presente dans 90+ pays.", open_positions: 40, website: "https://www.hps-worldwide.com/", fields: ["it", "finance"] },
	{ name: "Involys", sector: "Software", sector_fr: "Edition Logicielle", location: "Casablanca", location_fr: "Casablanca", description_fr: "Editeur marocain de logiciels de gestion specialise dans les solutions ERP, RH et de dematerialisation pour les entreprises et administrations marocaines.", open_positions: 20, website: "https://www.involys.com/", fields: ["it"] },
	{ name: "SQLI Morocco", sector: "Digital Agency", sector_fr: "Agence Digitale", location: "Rabat", location_fr: "Rabat", description_fr: "Groupe europeen de services digitaux avec un centre nearshore majeur au Maroc. Expert en e-commerce, experience digitale et transformation des SI.", open_positions: 50, website: "https://www.sqli.com/", fields: ["it"] },
	{ name: "Omnidata", sector: "Data/AI", sector_fr: "Data/IA", location: "Casablanca", location_fr: "Casablanca", description_fr: "Entreprise marocaine pionniere dans le traitement de donnees, la Business Intelligence et l'intelligence artificielle appliquee aux secteurs banque et telecom.", open_positions: 25, website: "https://www.omnidata.ma/", fields: ["it", "finance"] },
	{ name: "Sopra Banking Software", sector: "Banking Software", sector_fr: "Logiciels Bancaires", location: "Casablanca", location_fr: "Casablanca", description_fr: "Editeur de solutions bancaires du groupe Sopra Steria. Le centre marocain est strategique pour le developpement et la maintenance des plateformes core banking.", open_positions: 55, website: "https://www.soprabanking.com/", fields: ["it", "finance"] },
	{ name: "NTT Data Morocco", sector: "IT Services", sector_fr: "Services IT", location: "Casablanca", location_fr: "Casablanca", description_fr: "Division du geant japonais NTT specialisee dans le conseil et les services technologiques. Centre de competences pour l'Afrique avec expertise cloud, data et cybersecurite.", open_positions: 35, website: "https://www.nttdata.com/", fields: ["it"] },
	{ name: "IBM Morocco", sector: "Technology", sector_fr: "Technologie", location: "Casablanca", location_fr: "Casablanca", description_fr: "Geant americain de la technologie present au Maroc avec des solutions cloud, IA (Watson), et conseil en transformation digitale pour les grandes entreprises.", open_positions: 25, website: "https://www.ibm.com/ma-fr", fields: ["it"] },
	{ name: "Oracle Morocco", sector: "Enterprise Software", sector_fr: "Logiciels Enterprise", location: "Casablanca", location_fr: "Casablanca", description_fr: "Leader mondial des bases de donnees et du cloud enterprise. Accompagne les grandes entreprises marocaines dans leur migration vers le cloud et la modernisation applicative.", open_positions: 20, website: "https://www.oracle.com/ma/", fields: ["it"] },
	{ name: "Microsoft Morocco", sector: "Technology", sector_fr: "Technologie", location: "Casablanca", location_fr: "Casablanca", description_fr: "Presence marocaine du geant de Redmond couvrant Azure, Microsoft 365, Dynamics et l'IA. Partenaire strategique de la transformation digitale du secteur public et prive.", open_positions: 15, website: "https://www.microsoft.com/fr-ma", fields: ["it"] },
	{ name: "Huawei Morocco", sector: "Telecom/ICT", sector_fr: "Telecom/TIC", location: "Rabat", location_fr: "Rabat", description_fr: "Geant chinois des telecommunications et des TIC. Fournit l'infrastructure reseau aux operateurs marocains et investit dans la formation aux TIC et le cloud.", open_positions: 30, website: "https://www.huawei.com/minisite/morocco/", fields: ["it"] },
	{ name: "Orange Morocco", sector: "Telecommunications", sector_fr: "Telecommunications", location: "Rabat", location_fr: "Rabat", description_fr: "Troisieme operateur telecom du Maroc avec plus de 15 millions de clients. Innovation en 4G/5G, fibre optique, fintech (Orange Money) et services digitaux.", open_positions: 45, website: "https://www.orange.ma/", fields: ["it", "general"] },
	{ name: "Maroc Telecom", sector: "Telecommunications", sector_fr: "Telecommunications", location: "Rabat", location_fr: "Rabat", description_fr: "Premier operateur de telecommunications du Maroc et acteur majeur en Afrique avec des filiales dans 11 pays. Leader en fibre optique, mobile et services digitaux.", open_positions: 60, website: "https://www.iam.ma/", fields: ["it", "general"] },
	{ name: "Inwi", sector: "Telecommunications", sector_fr: "Telecommunications", location: "Casablanca", location_fr: "Casablanca", description_fr: "Deuxieme operateur telecom marocain reconnu pour son innovation et son esprit disruptif. Pionnier de la 4G au Maroc avec un reseau fibre en pleine expansion.", open_positions: 35, website: "https://www.inwi.ma/", fields: ["it", "general"] },
	{ name: "MTDS", sector: "System Integration", sector_fr: "Integration de Systemes", location: "Casablanca", location_fr: "Casablanca", description_fr: "Integrateur de systemes informatiques marocain specialise dans l'infrastructure IT, la virtualisation et les solutions de securite pour les entreprises.", open_positions: 15, website: "https://www.mtds.com/", fields: ["it"] },
	{ name: "Logiq Systems", sector: "Software Development", sector_fr: "Developpement Logiciel", location: "Casablanca", location_fr: "Casablanca", description_fr: "Editeur et integrateur marocain de solutions de gestion et de transformation digitale pour les PME et grandes entreprises.", open_positions: 10, website: "https://www.logiq.ma/", fields: ["it"] },
	{ name: "Novelis", sector: "Data/AI Consulting", sector_fr: "Conseil Data/IA", location: "Casablanca", location_fr: "Casablanca", description_fr: "Cabinet marocain de conseil specialise en data science, intelligence artificielle et machine learning. Accompagne les entreprises dans leur strategie data-driven.", open_positions: 20, website: "https://www.novelis.io/", fields: ["it"] },
	{ name: "Talan Morocco", sector: "Digital Consulting", sector_fr: "Conseil Digital", location: "Casablanca", location_fr: "Casablanca", description_fr: "Cabinet de conseil en innovation et transformation digitale. Le centre marocain est specialise en developpement, data engineering et conseil technologique.", open_positions: 40, website: "https://www.talan.com/", fields: ["it", "finance"] },

	// -------------------------------------------------------------------------
	// INDUSTRIAL (20)
	// -------------------------------------------------------------------------
	{ name: "OCP Group", sector: "Mining & Phosphates", sector_fr: "Mines et Phosphates", location: "Casablanca", location_fr: "Casablanca, Khouribga, Safi, Jorf Lasfar", description_fr: "Premier producteur mondial de phosphates et leader des engrais. Groupe strategique marocain avec 20 000+ employes, moteur de l'innovation industrielle et de la durabilite.", open_positions: 200, website: "https://www.ocpgroup.ma/", fields: ["industrial", "hse"] },
	{ name: "Renault Tanger", sector: "Automotive", sector_fr: "Automobile", location: "Tangier", location_fr: "Tanger", description_fr: "Plus grande usine automobile d'Afrique avec une capacite de 400 000 vehicules/an. Site modele zero emission, produisant Dacia Sandero et Lodgy pour l'export mondial.", open_positions: 100, website: "https://www.renaultgroup.com/", fields: ["industrial"] },
	{ name: "Stellantis Kenitra", sector: "Automotive", sector_fr: "Automobile", location: "Kenitra", location_fr: "Kenitra", description_fr: "Usine du groupe Stellantis (ex-PSA) a Kenitra produisant la Peugeot 208 et Citroen Ami. Investissement de 600 millions d'euros et 4000 emplois directs.", open_positions: 80, website: "https://www.stellantis.com/", fields: ["industrial"] },
	{ name: "Safran Morocco", sector: "Aerospace", sector_fr: "Aeronautique", location: "Casablanca", location_fr: "Casablanca, Ain Sebaa", description_fr: "Leader de l'aeronautique au Maroc avec des activites de cablage, assemblage et maintenance aeronautique. Le Maroc est une plateforme strategique pour le groupe.", open_positions: 60, website: "https://www.safran-group.com/", fields: ["industrial"] },
	{ name: "Bombardier Morocco", sector: "Aerospace", sector_fr: "Aeronautique", location: "Casablanca", location_fr: "Casablanca, Nouaceur", description_fr: "Site de production aeronautique du groupe canadien specialise dans la fabrication de structures et composants pour les avions d'affaires.", open_positions: 40, website: "https://www.bombardier.com/", fields: ["industrial"] },
	{ name: "ALTRAN Morocco", sector: "Engineering Consulting", sector_fr: "Conseil en Ingenierie", location: "Casablanca", location_fr: "Casablanca", description_fr: "Leader mondial du conseil en ingenierie et R&D. Le centre marocain intervient en automobile, aeronautique, energie et telecoms pour des clients internationaux.", open_positions: 50, website: "https://www.capgemini.com/", fields: ["industrial", "it"] },
	{ name: "ALTEN Morocco", sector: "Engineering Consulting", sector_fr: "Conseil en Ingenierie", location: "Rabat", location_fr: "Rabat, Casablanca", description_fr: "Groupe francais de conseil et d'ingenierie technologique. Le Maroc est un hub pour le developpement embarque, la simulation et l'ingenierie automobile.", open_positions: 70, website: "https://www.alten.com/", fields: ["industrial", "it"] },
	{ name: "Yazaki Morocco", sector: "Automotive Parts", sector_fr: "Equipements Automobiles", location: "Tangier", location_fr: "Tanger, Kenitra, Meknes", description_fr: "Premier employeur prive du Maroc avec plus de 40 000 salaries. Fabricant japonais de faisceaux de cables automobiles pour les grands constructeurs.", open_positions: 150, website: "https://www.yazaki-group.com/", fields: ["industrial"] },
	{ name: "Sumitomo Electric Morocco", sector: "Automotive Parts", sector_fr: "Equipements Automobiles", location: "Tangier", location_fr: "Tanger, Kenitra", description_fr: "Fabricant japonais de faisceaux de cables et composants automobiles. Presence industrielle majeure au Maroc avec plusieurs sites de production.", open_positions: 80, website: "https://sumitomoelectric.com/", fields: ["industrial"] },
	{ name: "Lear Corporation Morocco", sector: "Automotive Parts", sector_fr: "Equipements Automobiles", location: "Tangier", location_fr: "Tanger, Rabat", description_fr: "Equipementier automobile americain fabriquant des sieges et systemes electriques au Maroc pour les constructeurs europeens.", open_positions: 60, website: "https://www.lear.com/", fields: ["industrial"] },
	{ name: "Aptiv Morocco", sector: "Automotive Technology", sector_fr: "Technologie Automobile", location: "Tangier", location_fr: "Tanger, Kenitra", description_fr: "Ex-Delphi, specialise dans les technologies de conduite connectee et automatisee. Fabrique des systemes electroniques et des faisceaux de cables avances.", open_positions: 50, website: "https://www.aptiv.com/", fields: ["industrial", "it"] },
	{ name: "Nexans Morocco", sector: "Electrical Cable", sector_fr: "Cables Electriques", location: "Mohammedia", location_fr: "Mohammedia", description_fr: "Leader de l'industrie du cable au Maroc. Fabrique des cables d'energie, de telecoms et des accessoires pour les reseaux electriques nationaux et l'export.", open_positions: 25, website: "https://www.nexans.ma/", fields: ["industrial"] },
	{ name: "Schneider Electric Morocco", sector: "Energy Management", sector_fr: "Gestion de l'Energie", location: "Casablanca", location_fr: "Casablanca", description_fr: "Specialiste mondial de la gestion de l'energie et de l'automatisation. Production de tableaux electriques et solutions smart grid au Maroc.", open_positions: 30, website: "https://www.se.com/ma/fr/", fields: ["industrial", "hse"] },
	{ name: "ABB Morocco", sector: "Industrial Automation", sector_fr: "Automatisation Industrielle", location: "Casablanca", location_fr: "Casablanca", description_fr: "Leader suisse de l'automatisation et de la robotique industrielle. Solutions pour les secteurs de l'energie, l'industrie et les transports au Maroc.", open_positions: 15, website: "https://new.abb.com/ma", fields: ["industrial"] },
	{ name: "Siemens Morocco", sector: "Industrial Technology", sector_fr: "Technologie Industrielle", location: "Casablanca", location_fr: "Casablanca", description_fr: "Conglomerat allemand couvrant l'energie, l'industrie et la sante. Fournit des solutions d'automatisation, d'electrification et de digitalisation industrielle.", open_positions: 20, website: "https://www.siemens.com/ma/fr.html", fields: ["industrial", "healthcare"] },
	{ name: "Managem Group", sector: "Mining", sector_fr: "Mines", location: "Casablanca", location_fr: "Casablanca, Guelmim", description_fr: "Groupe minier marocain leader dans l'exploitation de metaux precieux (or, argent) et de base (cobalt, cuivre, zinc). Filiale du holding Al Mada.", open_positions: 40, website: "https://www.managemgroup.com/", fields: ["industrial", "hse"] },
	{ name: "Ciments du Maroc", sector: "Building Materials", sector_fr: "Materiaux de Construction", location: "Casablanca", location_fr: "Casablanca, Agadir, Marrakech", description_fr: "Filiale d'HeidelbergCement, deuxieme cimentier du Maroc. Production de ciment, beton pret a l'emploi et granulats pour le secteur BTP.", open_positions: 20, website: "https://www.cimentsdumaroc.com/", fields: ["industrial", "hse"] },
	{ name: "LafargeHolcim Morocco", sector: "Building Materials", sector_fr: "Materiaux de Construction", location: "Casablanca", location_fr: "Casablanca, Meknes, Tanger", description_fr: "Premier cimentier du Maroc avec six usines et une capacite de 10 millions de tonnes/an. Leader en solutions de construction durable.", open_positions: 25, website: "https://www.lafargeholcim.ma/", fields: ["industrial", "hse"] },
	{ name: "Cosumar", sector: "Agrifood", sector_fr: "Agroalimentaire", location: "Casablanca", location_fr: "Casablanca", description_fr: "Unique producteur de sucre au Maroc avec quatre sucreries. Groupe strategique assurant l'autosuffisance sucriere du pays et present en Afrique subsaharienne.", open_positions: 15, website: "https://www.cosumar.co.ma/", fields: ["industrial"] },
	{ name: "ONHYM", sector: "Mining/Energy", sector_fr: "Mines/Energie", location: "Rabat", location_fr: "Rabat", description_fr: "Office National des Hydrocarbures et des Mines. Organisme public charge de la promotion et du developpement des ressources minerales et energetiques du Maroc.", open_positions: 10, website: "https://www.onhym.com/", fields: ["industrial", "hse"] },

	// -------------------------------------------------------------------------
	// BANKING / FINANCE (15)
	// -------------------------------------------------------------------------
	{ name: "Attijariwafa Bank", sector: "Banking", sector_fr: "Banque", location: "Casablanca", location_fr: "Casablanca", description_fr: "Premier groupe bancaire du Maroc et d'Afrique du Nord. Presence dans 25 pays avec 10 millions de clients et des solutions innovantes en banque digitale.", open_positions: 80, website: "https://www.attijariwafabank.com/", fields: ["finance", "it"] },
	{ name: "BMCE Bank of Africa", sector: "Banking", sector_fr: "Banque", location: "Casablanca", location_fr: "Casablanca", description_fr: "Deuxieme groupe bancaire marocain avec un reseau pan-africain de 30 pays. Pionnier de la banque durable et de l'inclusion financiere en Afrique.", open_positions: 60, website: "https://www.bankofafrica.ma/", fields: ["finance", "it"] },
	{ name: "Banque Populaire", sector: "Banking", sector_fr: "Banque", location: "Casablanca", location_fr: "Casablanca", description_fr: "Troisieme groupe bancaire marocain avec le reseau le plus etendu au Maroc (plus de 1500 agences). Banque cooperative au service de l'economie nationale.", open_positions: 50, website: "https://www.gbp.ma/", fields: ["finance"] },
	{ name: "CDG Capital", sector: "Investment Banking", sector_fr: "Banque d'Investissement", location: "Rabat", location_fr: "Rabat", description_fr: "Filiale banque d'affaires de la CDG. Activites de gestion d'actifs, intermediation boursiere, conseil et financement de grands projets.", open_positions: 15, website: "https://www.cdgcapital.ma/", fields: ["finance"] },
	{ name: "CIH Bank", sector: "Banking", sector_fr: "Banque", location: "Casablanca", location_fr: "Casablanca", description_fr: "Banque marocaine historiquement specialisee dans l'immobilier, devenue banque universelle. Pionniere du digital banking au Maroc avec son offre Code 30.", open_positions: 25, website: "https://www.cihbank.ma/", fields: ["finance", "it"] },
	{ name: "Societe Generale Morocco", sector: "Banking", sector_fr: "Banque", location: "Casablanca", location_fr: "Casablanca", description_fr: "Filiale marocaine de la Societe Generale. Banque universelle offrant des services aux particuliers, entreprises et grandes corporations.", open_positions: 30, website: "https://www.sgmaroc.com/", fields: ["finance"] },
	{ name: "Credit Agricole Morocco", sector: "Banking", sector_fr: "Banque", location: "Rabat", location_fr: "Rabat", description_fr: "Banque universelle au coeur de l'economie agricole marocaine. Accompagne le developpement rural et le Plan Maroc Vert.", open_positions: 20, website: "https://www.creditagricole.ma/", fields: ["finance"] },
	{ name: "BMCI", sector: "Banking", sector_fr: "Banque", location: "Casablanca", location_fr: "Casablanca", description_fr: "Filiale de BNP Paribas au Maroc. Banque de reference pour les entreprises internationales et les particuliers aises avec des services premium.", open_positions: 15, website: "https://www.bmci.ma/", fields: ["finance"] },
	{ name: "CFG Bank", sector: "Banking", sector_fr: "Banque", location: "Casablanca", location_fr: "Casablanca", description_fr: "Banque d'affaires marocaine devenue banque universelle. Reconnue pour son expertise en marches de capitaux et gestion de patrimoine.", open_positions: 10, website: "https://www.cfgbank.com/", fields: ["finance"] },
	{ name: "Bank Al-Maghrib", sector: "Central Banking", sector_fr: "Banque Centrale", location: "Rabat", location_fr: "Rabat", description_fr: "Banque centrale du Maroc. Responsable de la politique monetaire, de la supervision bancaire et de la stabilite financiere du Royaume.", open_positions: 10, website: "https://www.bkam.ma/", fields: ["finance"] },
	{ name: "Wafa Assurance", sector: "Insurance", sector_fr: "Assurance", location: "Casablanca", location_fr: "Casablanca", description_fr: "Premier assureur du Maroc, filiale du groupe Attijariwafa. Offre complete en assurance vie, non-vie, sante et epargne retraite.", open_positions: 20, website: "https://www.wafaassurance.ma/", fields: ["finance"] },
	{ name: "AXA Assurance Morocco", sector: "Insurance", sector_fr: "Assurance", location: "Casablanca", location_fr: "Casablanca", description_fr: "Filiale marocaine du leader mondial de l'assurance. Solutions innovantes en assurance sante, automobile, habitation et prevoyance.", open_positions: 15, website: "https://www.axa.ma/", fields: ["finance"] },
	{ name: "MAMDA-MCMA", sector: "Insurance", sector_fr: "Assurance", location: "Rabat", location_fr: "Rabat", description_fr: "Mutuelle agricole marocaine et caisse d'assurance. Acteur cle de l'assurance agricole et de la protection du monde rural marocain.", open_positions: 10, website: "https://www.mamda.ma/", fields: ["finance"] },
	{ name: "Saham Assurance", sector: "Insurance", sector_fr: "Assurance", location: "Casablanca", location_fr: "Casablanca", description_fr: "Deuxieme assureur du Maroc, desormais filiale de Sanlam. Reseau de distribution etendu et gamme complete de produits d'assurance et d'assistance.", open_positions: 15, website: "https://www.sahamassurance.ma/", fields: ["finance"] },
	{ name: "Finactu", sector: "Consulting", sector_fr: "Conseil", location: "Casablanca", location_fr: "Casablanca", description_fr: "Cabinet de conseil actuariel et financier specialise dans l'assurance, les retraites et la protection sociale en Afrique.", open_positions: 5, website: "https://www.finactu.com/", fields: ["finance"] },

	// -------------------------------------------------------------------------
	// ENERGY / UTILITIES (10)
	// -------------------------------------------------------------------------
	{ name: "ONEE", sector: "Energy & Water", sector_fr: "Energie et Eau", location: "Rabat", location_fr: "Rabat", description_fr: "Office National de l'Electricite et de l'Eau Potable. Producteur, transporteur et distributeur d'electricite et d'eau au Maroc avec plus de 10 000 employes.", open_positions: 50, website: "https://www.one.org.ma/", fields: ["industrial", "hse"] },
	{ name: "MASEN", sector: "Renewable Energy", sector_fr: "Energies Renouvelables", location: "Rabat", location_fr: "Rabat", description_fr: "Agence Marocaine pour l'Energie Durable. Pilote la strategie energetique du Maroc avec les mega-projets solaires (Noor) et eoliens.", open_positions: 20, website: "https://www.masen.ma/", fields: ["industrial", "hse"] },
	{ name: "Nareva", sector: "Energy", sector_fr: "Energie", location: "Casablanca", location_fr: "Casablanca", description_fr: "Filiale energetique du groupe Al Mada specialisee dans la production d'electricite a partir de sources renouvelables (eolien) et thermiques.", open_positions: 15, website: "https://www.nareva.ma/", fields: ["industrial", "hse"] },
	{ name: "ENGIE Morocco", sector: "Energy Services", sector_fr: "Services Energetiques", location: "Casablanca", location_fr: "Casablanca", description_fr: "Filiale marocaine du groupe francais ENGIE. Intervient dans la production d'electricite, les services energetiques et les solutions bas carbone.", open_positions: 20, website: "https://www.engie.com/", fields: ["industrial", "hse"] },
	{ name: "Siemens Gamesa Morocco", sector: "Wind Energy", sector_fr: "Energie Eolienne", location: "Tangier", location_fr: "Tanger", description_fr: "Leader mondial des eoliennes avec une usine de fabrication de pales a Tanger. Acteur cle de la transition energetique du Maroc.", open_positions: 25, website: "https://www.siemensgamesa.com/", fields: ["industrial"] },
	{ name: "TotalEnergies Morocco", sector: "Energy", sector_fr: "Energie", location: "Casablanca", location_fr: "Casablanca", description_fr: "Major petroliere presente au Maroc dans la distribution de carburants, lubrifiants et gaz. Investit dans le solaire et la mobilite electrique.", open_positions: 15, website: "https://www.totalenergies.ma/", fields: ["industrial", "hse"] },
	{ name: "AKWA Group", sector: "Energy/Distribution", sector_fr: "Energie/Distribution", location: "Casablanca", location_fr: "Casablanca", description_fr: "Conglomerat marocain leader dans la distribution de carburants (Afriquia), le GPL et les energies renouvelables. Groupe diversifie avec 8000+ employes.", open_positions: 30, website: "https://www.akwagroup.com/", fields: ["industrial"] },
	{ name: "Taqa Morocco", sector: "Power Generation", sector_fr: "Production d'Electricite", location: "Jorf Lasfar", location_fr: "Jorf Lasfar", description_fr: "Plus grande centrale thermique independante d'Afrique (2 GW). Filiale d'Abu Dhabi National Energy Company, fournisseur majeur d'electricite au Maroc.", open_positions: 10, website: "https://www.taqamorocco.ma/", fields: ["industrial", "hse"] },
	{ name: "Platinum Power", sector: "Renewable Energy", sector_fr: "Energies Renouvelables", location: "Casablanca", location_fr: "Casablanca", description_fr: "Developpeur marocain de projets d'energies renouvelables (hydroelectricite, eolien, solaire) au Maroc et en Afrique subsaharienne.", open_positions: 8, website: "https://www.platinumpower.ma/", fields: ["industrial"] },
	{ name: "Xlinks Morocco", sector: "Green Energy", sector_fr: "Energie Verte", location: "Guelmim", location_fr: "Guelmim", description_fr: "Mega-projet d'export d'energie renouvelable du Maroc vers le Royaume-Uni via un cable sous-marin de 3800 km. Combinaison solaire + eolien + batteries.", open_positions: 15, website: "https://www.xlinks.co/", fields: ["industrial", "hse"] },

	// -------------------------------------------------------------------------
	// HEALTHCARE (10)
	// -------------------------------------------------------------------------
	{ name: "CHU Ibn Sina Rabat", sector: "Healthcare", sector_fr: "Sante", location: "Rabat", location_fr: "Rabat", description_fr: "Centre Hospitalier Universitaire de reference de la capitale. Plus grand complexe hospitalier du Maroc avec 14 etablissements et centre de formation medicale.", open_positions: 80, website: "https://www.chis.ma/", fields: ["healthcare"] },
	{ name: "CHU Hassan II Fes", sector: "Healthcare", sector_fr: "Sante", location: "Fes", location_fr: "Fes", description_fr: "CHU universitaire de Fes, centre de reference medical pour la region Fes-Meknes. Hopital moderne avec des specialites de pointe et un centre de recherche.", open_positions: 60, website: "https://www.chufes.ma/", fields: ["healthcare"] },
	{ name: "CHU Mohammed VI Marrakech", sector: "Healthcare", sector_fr: "Sante", location: "Marrakech", location_fr: "Marrakech", description_fr: "CHU de reference pour le sud du Maroc. Centre de soins tertiaires avec des services specialises en cardiologie, oncologie et neurochirurgie.", open_positions: 50, website: "https://www.chumarrakech.ma/", fields: ["healthcare"] },
	{ name: "Clinique Cheikh Zaid", sector: "Healthcare", sector_fr: "Sante", location: "Rabat", location_fr: "Rabat", description_fr: "Hopital prive de reference a Rabat fonde par le President des Emirats. Plateaux techniques de pointe et specialites medicales de haut niveau.", open_positions: 20, website: "https://www.fsrcheikhzaid.ma/", fields: ["healthcare"] },
	{ name: "Groupe Akdital", sector: "Private Healthcare", sector_fr: "Sante Privee", location: "Casablanca", location_fr: "Casablanca", description_fr: "Premier operateur prive de sante au Maroc cote en bourse. Reseau de cliniques modernes avec des investissements massifs dans tout le Royaume.", open_positions: 100, website: "https://www.akdital.ma/", fields: ["healthcare"] },
	{ name: "Sothema", sector: "Pharmaceutical", sector_fr: "Pharmaceutique", location: "Casablanca", location_fr: "Casablanca, Bouskoura", description_fr: "Premier laboratoire pharmaceutique marocain. Produit des generiques, biosimilaires et vaccins. Exporte vers 30 pays africains.", open_positions: 30, website: "https://www.sothema.com/", fields: ["healthcare", "industrial"] },
	{ name: "Cooper Pharma", sector: "Pharmaceutical", sector_fr: "Pharmaceutique", location: "Casablanca", location_fr: "Casablanca", description_fr: "Laboratoire pharmaceutique marocain de premier plan. Specialise dans les formes seches et steriles avec un portefeuille de 200+ produits.", open_positions: 20, website: "https://www.cooperpharma.com/", fields: ["healthcare", "industrial"] },
	{ name: "Sanofi Morocco", sector: "Pharmaceutical", sector_fr: "Pharmaceutique", location: "Casablanca", location_fr: "Casablanca", description_fr: "Filiale marocaine du geant pharmaceutique francais. Usine de production (ex-Maphar) et commercialisation de medicaments innovants et generiques.", open_positions: 15, website: "https://www.sanofi.ma/", fields: ["healthcare", "industrial"] },
	{ name: "GSK Morocco", sector: "Pharmaceutical", sector_fr: "Pharmaceutique", location: "Casablanca", location_fr: "Casablanca", description_fr: "Presence marocaine du groupe pharmaceutique britannique GlaxoSmithKline. Commercialisation de vaccins, medicaments et produits de sante grand public.", open_positions: 10, website: "https://www.gsk.com/", fields: ["healthcare"] },
	{ name: "Pharma 5", sector: "Pharmaceutical", sector_fr: "Pharmaceutique", location: "Casablanca", location_fr: "Casablanca", description_fr: "Laboratoire pharmaceutique marocain innovant, leader en generiques et R&D. Premiere entreprise marocaine a avoir developpe un medicament generique anti-hepatite C.", open_positions: 25, website: "https://www.pharma5.ma/", fields: ["healthcare", "industrial"] },

	// -------------------------------------------------------------------------
	// PUBLIC / TRANSPORT (10)
	// -------------------------------------------------------------------------
	{ name: "ONCF", sector: "Railway", sector_fr: "Transport Ferroviaire", location: "Rabat", location_fr: "Rabat", description_fr: "Office National des Chemins de Fer. Operateur du reseau ferroviaire marocain incluant le TGV Al Boraq, le plus rapide d'Afrique (320 km/h).", open_positions: 40, website: "https://www.oncf.ma/", fields: ["industrial", "general"] },
	{ name: "ADM (Autoroutes du Maroc)", sector: "Infrastructure", sector_fr: "Infrastructure", location: "Rabat", location_fr: "Rabat", description_fr: "Societe nationale d'autoroutes gerant 1800+ km de reseau autoroutier. Responsable de la construction, maintenance et exploitation des autoroutes.", open_positions: 15, website: "https://www.adm.co.ma/", fields: ["industrial"] },
	{ name: "ANP (Agence Nationale des Ports)", sector: "Maritime", sector_fr: "Maritime", location: "Casablanca", location_fr: "Casablanca", description_fr: "Autorite portuaire nationale regulant l'activite de 13 ports marocains. Acteur strategique du commerce maritime et de la logistique.", open_positions: 10, website: "https://www.anp.org.ma/", fields: ["industrial", "general"] },
	{ name: "Marsa Maroc", sector: "Port Operations", sector_fr: "Operations Portuaires", location: "Casablanca", location_fr: "Casablanca, Tanger", description_fr: "Operateur portuaire leader du Maroc gerant les terminaux de conteneurs, vracs et passagers dans les principaux ports du Royaume.", open_positions: 20, website: "https://www.marsamaroc.co.ma/", fields: ["industrial", "general"] },
	{ name: "Royal Air Maroc", sector: "Aviation", sector_fr: "Aviation", location: "Casablanca", location_fr: "Casablanca", description_fr: "Compagnie aerienne nationale du Maroc et membre de l'alliance oneworld. Hub de Casablanca reliant l'Afrique a l'Europe et l'Amerique.", open_positions: 35, website: "https://www.royalairmaroc.com/", fields: ["general"] },
	{ name: "ONDA", sector: "Aviation", sector_fr: "Aviation", location: "Casablanca", location_fr: "Casablanca", description_fr: "Office National Des Aeroports gerant 25 aeroports marocains dont le hub Mohammed V. En charge de la securite aerienne et du developpement aeroportuaire.", open_positions: 15, website: "https://www.onda.ma/", fields: ["general", "hse"] },
	{ name: "ANAPEC", sector: "Employment Services", sector_fr: "Services de l'Emploi", location: "Casablanca", location_fr: "Casablanca", description_fr: "Agence Nationale de Promotion de l'Emploi et des Competences. Intermediation entre employeurs et demandeurs d'emploi, programmes d'insertion et formation.", open_positions: 20, website: "https://www.anapec.org/", fields: ["general"] },
	{ name: "CNSS", sector: "Social Security", sector_fr: "Securite Sociale", location: "Casablanca", location_fr: "Casablanca", description_fr: "Caisse Nationale de Securite Sociale gerant les regimes de retraite, maladie et allocations familiales pour les salaries du secteur prive.", open_positions: 25, website: "https://www.cnss.ma/", fields: ["finance", "general"] },
	{ name: "RADEEMA", sector: "Utilities", sector_fr: "Services Publics", location: "Marrakech", location_fr: "Marrakech", description_fr: "Regie Autonome de Distribution d'Eau et d'Electricite de Marrakech. Assure la distribution de l'eau, de l'electricite et l'assainissement.", open_positions: 15, website: "https://www.radeema.ma/", fields: ["industrial", "hse"] },
	{ name: "Lydec", sector: "Utilities", sector_fr: "Services Publics", location: "Casablanca", location_fr: "Casablanca", description_fr: "Deelegataire de la distribution d'eau, d'electricite et de l'assainissement du Grand Casablanca. Plus de 4 millions de beneficiaires.", open_positions: 20, website: "https://www.lydec.ma/", fields: ["industrial", "hse"] },

	// -------------------------------------------------------------------------
	// OTHER / CONSUMER (10+)
	// -------------------------------------------------------------------------
	{ name: "Decathlon Morocco", sector: "Retail/Sports", sector_fr: "Distribution/Sport", location: "Casablanca", location_fr: "Casablanca, Rabat, Marrakech", description_fr: "Distributeur sportif francais avec 10+ magasins au Maroc. Employeur attractif offrant des opportunites dans la vente, la logistique et le digital.", open_positions: 40, website: "https://www.decathlon.ma/", fields: ["general"] },
	{ name: "IKEA Morocco", sector: "Retail/Furniture", sector_fr: "Distribution/Ameublement", location: "Casablanca", location_fr: "Casablanca, Zenata", description_fr: "Geant suedois de l'ameublement present au Maroc avec un mega-store a Zenata. Experience client unique et engagement pour le developpement durable.", open_positions: 30, website: "https://www.ikea.com/ma/fr/", fields: ["general"] },
	{ name: "Carrefour Morocco", sector: "Retail/Food", sector_fr: "Grande Distribution", location: "Casablanca", location_fr: "Casablanca, Rabat, Tanger", description_fr: "Leader de la grande distribution au Maroc opere par le groupe Label'Vie. Reseau d'hypermarches, supermarches et magasins de proximite.", open_positions: 50, website: "https://www.carrefourmaroc.ma/", fields: ["general"] },
	{ name: "L'Oreal Morocco", sector: "Cosmetics", sector_fr: "Cosmetiques", location: "Casablanca", location_fr: "Casablanca", description_fr: "Filiale marocaine du leader mondial des cosmetiques. Commercialisation de marques premium et grand public. Hub strategique pour l'Afrique francophone.", open_positions: 15, website: "https://www.loreal.com/", fields: ["general", "industrial"] },
	{ name: "Nestle Morocco", sector: "Food & Beverage", sector_fr: "Agroalimentaire", location: "Casablanca", location_fr: "Casablanca, El Jadida", description_fr: "Geant suisse de l'agroalimentaire avec des usines au Maroc. Produit localement Nescafe, Nido, Maggi et autres marques emblematiques.", open_positions: 20, website: "https://www.nestle-maroc.com/", fields: ["industrial", "general"] },
	{ name: "P&G Morocco", sector: "Consumer Goods", sector_fr: "Biens de Consommation", location: "Casablanca", location_fr: "Casablanca, Mohammedia", description_fr: "Procter & Gamble au Maroc avec une usine de production. Marques leaders : Ariel, Tide, Pampers, Gillette. Centre d'excellence pour l'Afrique.", open_positions: 15, website: "https://www.pg.com/", fields: ["industrial", "general"] },
	{ name: "Unilever Morocco", sector: "Consumer Goods", sector_fr: "Biens de Consommation", location: "Casablanca", location_fr: "Casablanca", description_fr: "Multinationale anglo-neerlandaise de biens de consommation. Commercialise au Maroc des marques comme Knorr, Omo, et Signal.", open_positions: 10, website: "https://www.unilever.com/", fields: ["industrial", "general"] },
	{ name: "Coca-Cola Morocco", sector: "Beverage", sector_fr: "Boissons", location: "Casablanca", location_fr: "Casablanca, Fes, Marrakech", description_fr: "Embouteilleur et distributeur Coca-Cola au Maroc (NABC). Trois usines de production et un reseau de distribution couvrant tout le territoire.", open_positions: 20, website: "https://www.coca-colacompany.com/", fields: ["industrial", "general"] },
	{ name: "Danone Morocco", sector: "Dairy/Food", sector_fr: "Produits Laitiers/Alimentaire", location: "Casablanca", location_fr: "Casablanca, Sale, Meknes", description_fr: "Leader des produits laitiers au Maroc (Danone, Centrale). Quatre usines et la marque Centrale, institution du marche laitier marocain.", open_positions: 25, website: "https://www.danone.ma/", fields: ["industrial", "general"] },
	{ name: "Al Mada", sector: "Investment Holding", sector_fr: "Holding d'Investissement", location: "Casablanca", location_fr: "Casablanca", description_fr: "Premier fonds d'investissement prive d'Afrique (ex-SNI/ONA). Portefeuille diversifie incluant Attijariwafa, Managem, Nareva et des participations panafricaines.", open_positions: 10, website: "https://www.almada.ma/", fields: ["finance", "general"] },
	{ name: "Lesieur Cristal", sector: "Food Industry", sector_fr: "Industrie Alimentaire", location: "Casablanca", location_fr: "Casablanca", description_fr: "Leader marocain des huiles de table, du savon et des produits oleagineux. Filiale du groupe Avril, symbole de l'industrie agroalimentaire marocaine.", open_positions: 10, website: "https://www.lesieur-cristal.com/", fields: ["industrial"] },
];

// ============================================================================
// INSERTION LOGIC
// ============================================================================

async function seedSkills(client) {
	console.log("\n=== Seeding Skills ===\n");

	// First, get existing skill names to avoid duplicates
	const existing = await client.query("SELECT name FROM skill_library");
	const existingNames = new Set(existing.rows.map((r) => r.name));
	console.log(`Found ${existingNames.size} existing skills`);

	let inserted = 0;
	let skipped = 0;

	for (let i = 0; i < SKILLS.length; i++) {
		const s = SKILLS[i];

		if (existingNames.has(s.name)) {
			skipped++;
			continue;
		}

		const isRecommended = s.demand === "high";
		const description = `[${s.demand} demand] ${s.description_fr}`;

		try {
			await client.query(
				`INSERT INTO skill_library (name, name_fr, field, category, description, description_fr, is_recommended, is_active, sort_order)
				 VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)`,
				[
					s.name,
					s.name_fr,
					s.field,
					s.category,
					description,
					s.description_fr,
					isRecommended,
					i + 1,
				],
			);
			inserted++;
			existingNames.add(s.name);
		} catch (err) {
			console.error(`  ERROR inserting skill "${s.name}": ${err.message}`);
		}
	}

	console.log(`Skills: ${inserted} inserted, ${skipped} skipped (already exist)`);
	const total = await client.query("SELECT count(*) as cnt FROM skill_library");
	console.log(`Total skills in database: ${total.rows[0].cnt}`);

	return inserted;
}

async function seedEmployers(client) {
	console.log("\n=== Seeding Employers ===\n");

	let inserted = 0;
	let skipped = 0;

	for (let i = 0; i < EMPLOYERS.length; i++) {
		const e = EMPLOYERS[i];

		try {
			const result = await client.query(
				`INSERT INTO career_employer (name, sector, sector_fr, location, location_fr, description_fr, open_positions, website, fields, is_active, sort_order)
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10)
				 ON CONFLICT (name) DO NOTHING
				 RETURNING id`,
				[
					e.name,
					e.sector,
					e.sector_fr,
					e.location,
					e.location_fr,
					e.description_fr,
					e.open_positions,
					e.website,
					JSON.stringify(e.fields),
					i + 1,
				],
			);

			if (result.rowCount > 0) {
				inserted++;
			} else {
				skipped++;
			}
		} catch (err) {
			console.error(`  ERROR inserting employer "${e.name}": ${err.message}`);
			skipped++;
		}
	}

	console.log(`Employers: ${inserted} inserted, ${skipped} skipped (already exist)`);
	const total = await client.query("SELECT count(*) as cnt FROM career_employer");
	console.log(`Total employers in database: ${total.rows[0].cnt}`);

	return inserted;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
	console.log("================================================================");
	console.log("  Massive Seed: Skills & Employers for Morocco Job Market");
	console.log("================================================================");
	console.log(`\nData prepared: ${SKILLS.length} skills, ${EMPLOYERS.length} employers`);

	await client.connect();
	console.log("Connected to PostgreSQL (localhost:5432)\n");

	try {
		const skillsInserted = await seedSkills(client);
		const employersInserted = await seedEmployers(client);

		console.log("\n================================================================");
		console.log("  SEED COMPLETE");
		console.log("================================================================");
		console.log(`  Skills inserted:    ${skillsInserted} / ${SKILLS.length} prepared`);
		console.log(`  Employers inserted: ${employersInserted} / ${EMPLOYERS.length} prepared`);
		console.log("================================================================\n");

		// Print category breakdown
		const skillBreakdown = await client.query(
			"SELECT field, category, count(*) as cnt FROM skill_library GROUP BY field, category ORDER BY field, category",
		);
		console.log("Skills breakdown by field/category:");
		for (const row of skillBreakdown.rows) {
			console.log(`  ${row.field} / ${row.category}: ${row.cnt}`);
		}

		const employerBreakdown = await client.query(
			"SELECT sector, count(*) as cnt FROM career_employer GROUP BY sector ORDER BY cnt DESC",
		);
		console.log("\nEmployers breakdown by sector:");
		for (const row of employerBreakdown.rows) {
			console.log(`  ${row.sector}: ${row.cnt}`);
		}
	} finally {
		await client.end();
		console.log("\nConnection closed.");
	}
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
