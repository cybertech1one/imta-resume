/**
 * Seed Skills Library (300+) and Career Quiz Questions (100+) directly into PostgreSQL
 *
 * Tables seeded:
 *   - skill_library (300+ rows)
 *   - career_quiz_question (100+ rows)
 *   - career_quiz_option (300+ rows, 3-4 per question)
 *
 * Usage: node scripts/seed-skills-quiz.mjs
 *
 * NOTE: This connects directly to PostgreSQL, not through the ORPC API.
 *       Dual-instance warning: connects to localhost:5432 (the local PG, not Docker PG).
 */

import pg from "pg";
const { Client } = pg;

const DB_CONFIG = {
	host: "localhost",
	port: 5432,
	database: "postgres",
	user: "postgres",
	password: "postgres",
};

// ============================================================================
// SKILL LIBRARY DATA (300+ skills)
// ============================================================================

let skillSortOrder = 0;
function skill(name, nameFr, category, field, description, descriptionFr) {
	skillSortOrder++;
	return { name, nameFr, category, field, description, descriptionFr, sortOrder: skillSortOrder };
}

const SKILLS = [
	// =========================================================================
	// GENIE INFORMATIQUE (65 skills)
	// =========================================================================
	// -- Programming Languages --
	skill("Java", "Java", "technical", "génie-informatique", "General-purpose OOP language widely used in enterprise systems", "Langage POO generaliste largement utilise dans les systemes d'entreprise"),
	skill("Python", "Python", "technical", "génie-informatique", "Versatile language for web, data science, and automation", "Langage polyvalent pour le web, la science des donnees et l'automatisation"),
	skill("JavaScript", "JavaScript", "technical", "génie-informatique", "Core language for web development, both frontend and backend", "Langage principal du developpement web, frontend et backend"),
	skill("TypeScript", "TypeScript", "technical", "génie-informatique", "Typed superset of JavaScript for large-scale applications", "Sur-ensemble type de JavaScript pour les applications a grande echelle"),
	skill("C/C++", "C/C++", "technical", "génie-informatique", "Systems programming languages for performance-critical applications", "Langages de programmation systeme pour les applications critiques en performance"),
	skill("C#", "C#", "technical", "génie-informatique", "Microsoft language for .NET enterprise development", "Langage Microsoft pour le developpement d'entreprise .NET"),
	skill("PHP", "PHP", "technical", "génie-informatique", "Server-side scripting language for web development", "Langage de script cote serveur pour le developpement web"),
	skill("Go (Golang)", "Go (Golang)", "technical", "génie-informatique", "Google language for scalable backend services", "Langage Google pour les services backend evolutifs"),
	skill("Rust", "Rust", "technical", "génie-informatique", "Memory-safe systems language for high-performance applications", "Langage systeme securise en memoire pour les applications haute performance"),
	skill("Kotlin", "Kotlin", "technical", "génie-informatique", "Modern JVM language, official for Android development", "Langage JVM moderne, officiel pour le developpement Android"),
	skill("Swift", "Swift", "technical", "génie-informatique", "Apple language for iOS and macOS development", "Langage Apple pour le developpement iOS et macOS"),

	// -- Frontend Frameworks --
	skill("React", "React", "technical", "génie-informatique", "Facebook library for building interactive user interfaces", "Bibliotheque Facebook pour creer des interfaces utilisateur interactives"),
	skill("Angular", "Angular", "technical", "génie-informatique", "Google framework for enterprise single-page applications", "Framework Google pour les applications single-page d'entreprise"),
	skill("Vue.js", "Vue.js", "technical", "génie-informatique", "Progressive JavaScript framework for web interfaces", "Framework JavaScript progressif pour les interfaces web"),
	skill("Next.js", "Next.js", "technical", "génie-informatique", "React framework for server-rendered and static web apps", "Framework React pour les applications web rendues cote serveur"),
	skill("HTML/CSS", "HTML/CSS", "technical", "génie-informatique", "Foundational web markup and styling languages", "Langages fondamentaux de balisage et de style web"),
	skill("Tailwind CSS", "Tailwind CSS", "technical", "génie-informatique", "Utility-first CSS framework for rapid UI development", "Framework CSS utilitaire pour le developpement rapide d'interfaces"),
	skill("Svelte", "Svelte", "technical", "génie-informatique", "Compile-time UI framework with minimal bundle size", "Framework UI compile avec une taille de bundle minimale"),

	// -- Backend Frameworks --
	skill("Node.js", "Node.js", "technical", "génie-informatique", "JavaScript runtime for server-side development", "Environnement d'execution JavaScript cote serveur"),
	skill("Spring Boot", "Spring Boot", "technical", "génie-informatique", "Java framework for production-ready microservices", "Framework Java pour les microservices prets pour la production"),
	skill("Django", "Django", "technical", "génie-informatique", "Python web framework with batteries included", "Framework web Python avec tout inclus"),
	skill("FastAPI", "FastAPI", "technical", "génie-informatique", "High-performance Python API framework with async support", "Framework API Python haute performance avec support asynchrone"),
	skill("Laravel", "Laravel", "technical", "génie-informatique", "Elegant PHP framework for web application development", "Framework PHP elegant pour le developpement d'applications web"),
	skill("Express.js", "Express.js", "technical", "génie-informatique", "Minimalist Node.js web application framework", "Framework minimaliste pour applications web Node.js"),
	skill("ASP.NET Core", "ASP.NET Core", "technical", "génie-informatique", "Cross-platform .NET framework for web APIs", "Framework .NET multiplateforme pour les API web"),

	// -- Databases --
	skill("SQL", "SQL", "technical", "génie-informatique", "Standard language for relational database management", "Langage standard pour la gestion de bases de donnees relationnelles"),
	skill("PostgreSQL", "PostgreSQL", "technical", "génie-informatique", "Advanced open-source relational database system", "Systeme de base de donnees relationnelle open-source avance"),
	skill("MySQL", "MySQL", "technical", "génie-informatique", "Popular open-source relational database", "Base de donnees relationnelle open-source populaire"),
	skill("MongoDB", "MongoDB", "technical", "génie-informatique", "NoSQL document database for flexible schemas", "Base de donnees NoSQL documentaire pour des schemas flexibles"),
	skill("Redis", "Redis", "technical", "génie-informatique", "In-memory data store for caching and real-time apps", "Stockage de donnees en memoire pour le cache et les apps temps reel"),
	skill("Elasticsearch", "Elasticsearch", "technical", "génie-informatique", "Distributed search and analytics engine", "Moteur de recherche et d'analytique distribue"),
	skill("Oracle Database", "Oracle Database", "technical", "génie-informatique", "Enterprise-grade relational database management system", "Systeme de gestion de base de donnees relationnelle d'entreprise"),

	// -- DevOps & Cloud --
	skill("Docker", "Docker", "technical", "génie-informatique", "Container platform for application deployment", "Plateforme de conteneurs pour le deploiement d'applications"),
	skill("Kubernetes", "Kubernetes", "technical", "génie-informatique", "Container orchestration for managing distributed apps", "Orchestration de conteneurs pour la gestion d'applications distribuees"),
	skill("AWS", "AWS", "technical", "génie-informatique", "Amazon cloud platform with comprehensive services", "Plateforme cloud Amazon avec des services complets"),
	skill("Microsoft Azure", "Microsoft Azure", "technical", "génie-informatique", "Microsoft cloud computing platform and services", "Plateforme et services de cloud computing Microsoft"),
	skill("Google Cloud Platform", "Google Cloud Platform", "technical", "génie-informatique", "Google cloud infrastructure and developer tools", "Infrastructure cloud et outils de developpement Google"),
	skill("Git", "Git", "technical", "génie-informatique", "Distributed version control system", "Systeme de controle de version distribue"),
	skill("GitHub Actions", "GitHub Actions", "technical", "génie-informatique", "CI/CD automation platform integrated with GitHub", "Plateforme d'automatisation CI/CD integree a GitHub"),
	skill("CI/CD Pipelines", "Pipelines CI/CD", "technical", "génie-informatique", "Continuous integration and delivery automation", "Automatisation de l'integration et de la livraison continues"),
	skill("Terraform", "Terraform", "technical", "génie-informatique", "Infrastructure as Code for cloud provisioning", "Infrastructure as Code pour le provisionnement cloud"),
	skill("Ansible", "Ansible", "technical", "génie-informatique", "Automation tool for configuration management", "Outil d'automatisation pour la gestion de configuration"),
	skill("Jenkins", "Jenkins", "technical", "génie-informatique", "Open-source automation server for CI/CD", "Serveur d'automatisation open-source pour CI/CD"),
	skill("Linux Administration", "Administration Linux", "technical", "génie-informatique", "Server management and system administration", "Gestion de serveurs et administration systeme"),
	skill("Nginx", "Nginx", "technical", "génie-informatique", "High-performance web server and reverse proxy", "Serveur web et proxy inverse haute performance"),

	// -- Architecture & Methodology --
	skill("REST API Design", "Conception d'API REST", "technical", "génie-informatique", "Designing scalable RESTful web services", "Conception de services web RESTful evolutifs"),
	skill("GraphQL", "GraphQL", "technical", "génie-informatique", "Query language for flexible API data fetching", "Langage de requete pour une recuperation flexible des donnees API"),
	skill("Microservices Architecture", "Architecture Microservices", "technical", "génie-informatique", "Distributed system design with independent services", "Conception de systemes distribues avec des services independants"),
	skill("Clean Architecture", "Architecture Propre", "technical", "génie-informatique", "Software design separating business logic from infrastructure", "Conception logicielle separant la logique metier de l'infrastructure"),
	skill("Design Patterns", "Patrons de Conception", "technical", "génie-informatique", "Reusable solutions to common software design problems", "Solutions reutilisables aux problemes courants de conception logicielle"),
	skill("SOLID Principles", "Principes SOLID", "technical", "génie-informatique", "Five design principles for maintainable OOP code", "Cinq principes de conception pour un code POO maintenable"),
	skill("Data Structures & Algorithms", "Structures de Donnees et Algorithmes", "technical", "génie-informatique", "Fundamental CS concepts for efficient problem solving", "Concepts fondamentaux en informatique pour la resolution efficace de problemes"),
	skill("System Design", "Conception de Systemes", "technical", "génie-informatique", "Designing large-scale distributed computing systems", "Conception de systemes distribues a grande echelle"),
	skill("Agile/Scrum", "Agile/Scrum", "technical", "génie-informatique", "Iterative project management methodology", "Methodologie de gestion de projet iterative"),
	skill("TDD (Test-Driven Development)", "TDD (Developpement Dirige par les Tests)", "technical", "génie-informatique", "Writing tests before implementation code", "Ecrire les tests avant le code d'implementation"),
	skill("UML Modeling", "Modelisation UML", "technical", "génie-informatique", "Unified Modeling Language for software design", "Langage de Modelisation Unifie pour la conception logicielle"),

	// -- Mobile & Specialized --
	skill("React Native", "React Native", "technical", "génie-informatique", "Cross-platform mobile app development with React", "Developpement d'applications mobiles multiplateformes avec React"),
	skill("Flutter", "Flutter", "technical", "génie-informatique", "Google UI toolkit for cross-platform mobile apps", "Kit d'outils UI Google pour les applications mobiles multiplateformes"),
	skill("Machine Learning", "Apprentissage Automatique", "technical", "génie-informatique", "Building predictive models from data", "Construction de modeles predictifs a partir de donnees"),
	skill("TensorFlow", "TensorFlow", "technical", "génie-informatique", "Google open-source ML framework", "Framework ML open-source de Google"),
	skill("PyTorch", "PyTorch", "technical", "génie-informatique", "Facebook deep learning research framework", "Framework de recherche en deep learning de Facebook"),
	skill("Pandas/NumPy", "Pandas/NumPy", "technical", "génie-informatique", "Python data manipulation and numerical computing libraries", "Bibliotheques Python de manipulation de donnees et calcul numerique"),

	// -- Messaging & Security --
	skill("Kafka", "Kafka", "technical", "génie-informatique", "Distributed event streaming platform", "Plateforme de streaming d'evenements distribuee"),
	skill("RabbitMQ", "RabbitMQ", "technical", "génie-informatique", "Open-source message broker for async communication", "Courtier de messages open-source pour la communication asynchrone"),
	skill("Security/OWASP", "Securite/OWASP", "technical", "génie-informatique", "Web application security best practices", "Meilleures pratiques de securite des applications web"),
	skill("OAuth2/JWT", "OAuth2/JWT", "technical", "génie-informatique", "Authentication and authorization protocols", "Protocoles d'authentification et d'autorisation"),
	skill("WebSockets", "WebSockets", "technical", "génie-informatique", "Full-duplex real-time communication protocol", "Protocole de communication temps reel full-duplex"),
	skill("gRPC", "gRPC", "technical", "génie-informatique", "High-performance RPC framework by Google", "Framework RPC haute performance de Google"),
	skill("SonarQube", "SonarQube", "tool", "génie-informatique", "Code quality and security analysis platform", "Plateforme d'analyse de qualite et securite du code"),
	skill("Figma (for developers)", "Figma (pour developpeurs)", "tool", "génie-informatique", "Design-to-code collaboration tool", "Outil de collaboration design-vers-code"),

	// =========================================================================
	// GENIE INDUSTRIEL (45 skills)
	// =========================================================================
	skill("Lean Manufacturing", "Lean Manufacturing", "technical", "génie-industriel", "Waste elimination methodology for efficient production", "Methodologie d'elimination des gaspillages pour une production efficace"),
	skill("Six Sigma Green Belt", "Six Sigma Ceinture Verte", "certification", "génie-industriel", "Quality improvement methodology certification", "Certification en methodologie d'amelioration de la qualite"),
	skill("Six Sigma Black Belt", "Six Sigma Ceinture Noire", "certification", "génie-industriel", "Advanced Six Sigma process improvement leadership", "Leadership avance en amelioration des processus Six Sigma"),
	skill("Kaizen", "Kaizen", "technical", "génie-industriel", "Continuous improvement philosophy and practice", "Philosophie et pratique d'amelioration continue"),
	skill("5S Methodology", "Methodologie 5S", "technical", "génie-industriel", "Workplace organization system: Sort, Set, Shine, Standardize, Sustain", "Systeme d'organisation: Trier, Ranger, Nettoyer, Standardiser, Maintenir"),
	skill("TPM (Total Productive Maintenance)", "TPM (Maintenance Productive Totale)", "technical", "génie-industriel", "Holistic approach to equipment maintenance", "Approche holistique de la maintenance des equipements"),
	skill("SAP ERP", "SAP ERP", "tool", "génie-industriel", "Enterprise resource planning system", "Systeme de planification des ressources d'entreprise"),
	skill("AutoCAD (Industrial)", "AutoCAD (Industriel)", "tool", "génie-industriel", "2D/3D computer-aided design for industrial layouts", "Conception assistee par ordinateur 2D/3D pour les plans industriels"),
	skill("SolidWorks", "SolidWorks", "tool", "génie-industriel", "3D CAD software for mechanical design", "Logiciel CAO 3D pour la conception mecanique"),
	skill("CATIA", "CATIA", "tool", "génie-industriel", "Advanced multi-platform CAD/CAM/CAE solution", "Solution CAO/FAO/IAO avancee multi-plateforme"),
	skill("Minitab", "Minitab", "tool", "génie-industriel", "Statistical analysis software for quality improvement", "Logiciel d'analyse statistique pour l'amelioration de la qualite"),
	skill("Arena Simulation", "Arena Simulation", "tool", "génie-industriel", "Discrete event simulation for process modeling", "Simulation a evenements discrets pour la modelisation de processus"),
	skill("ISO 9001 (Quality Management)", "ISO 9001 (Management Qualite)", "certification", "génie-industriel", "International quality management system standard", "Norme internationale de systeme de management de la qualite"),
	skill("ISO 14001 (Environmental)", "ISO 14001 (Environnement)", "certification", "génie-industriel", "Environmental management system certification", "Certification du systeme de management environnemental"),
	skill("ISO 45001 (OHS)", "ISO 45001 (SST)", "certification", "génie-industriel", "Occupational health and safety management standard", "Norme de management de la sante et securite au travail"),
	skill("Process Optimization", "Optimisation des Processus", "technical", "génie-industriel", "Systematic improvement of production workflows", "Amelioration systematique des flux de production"),
	skill("Supply Chain Management", "Gestion de la Chaine d'Approvisionnement", "technical", "génie-industriel", "End-to-end management of goods flow from supplier to customer", "Gestion de bout en bout du flux de marchandises du fournisseur au client"),
	skill("PLC Programming (Industrial)", "Programmation Automates (Industriel)", "technical", "génie-industriel", "Programming industrial controllers for automation", "Programmation de controleurs industriels pour l'automatisation"),
	skill("MES (Manufacturing Execution System)", "MES (Systeme d'Execution de Fabrication)", "technical", "génie-industriel", "Real-time production monitoring and control", "Surveillance et controle de production en temps reel"),
	skill("SCADA Systems", "Systemes SCADA", "technical", "génie-industriel", "Supervisory control and data acquisition", "Controle de supervision et acquisition de donnees"),
	skill("Quality Management (TQM)", "Management de la Qualite (TQM)", "technical", "génie-industriel", "Total Quality Management philosophy and tools", "Philosophie et outils du Management de la Qualite Totale"),
	skill("FMEA (Failure Mode Analysis)", "AMDEC (Analyse des Modes de Defaillance)", "technical", "génie-industriel", "Systematic method for evaluating failure risks", "Methode systematique d'evaluation des risques de defaillance"),
	skill("SPC (Statistical Process Control)", "MSP (Maitrise Statistique des Processus)", "technical", "génie-industriel", "Statistical monitoring of production quality", "Surveillance statistique de la qualite de production"),
	skill("Value Stream Mapping", "Cartographie de la Chaine de Valeur", "technical", "génie-industriel", "Visual tool for analyzing material and information flow", "Outil visuel pour analyser le flux de materiaux et d'informations"),
	skill("Project Management (Industrial)", "Gestion de Projet (Industriel)", "technical", "génie-industriel", "Planning and executing industrial projects on time and budget", "Planification et execution de projets industriels dans les delais et budgets"),
	skill("Risk Assessment (Industrial)", "Evaluation des Risques (Industriel)", "technical", "génie-industriel", "Identifying and mitigating production risks", "Identification et attenuation des risques de production"),
	skill("Root Cause Analysis", "Analyse des Causes Racines", "technical", "génie-industriel", "5 Whys, Ishikawa, and Pareto analysis techniques", "Techniques 5 Pourquoi, Ishikawa et analyse de Pareto"),
	skill("Time and Motion Study", "Etude des Temps et Mouvements", "technical", "génie-industriel", "Work measurement and method improvement", "Mesure du travail et amelioration des methodes"),
	skill("Work Sampling", "Echantillonnage du Travail", "technical", "génie-industriel", "Statistical technique for work activity analysis", "Technique statistique pour l'analyse des activites de travail"),
	skill("Ergonomics", "Ergonomie", "technical", "génie-industriel", "Workplace design for human efficiency and safety", "Conception du poste de travail pour l'efficacite et la securite"),
	skill("Industrial Safety", "Securite Industrielle", "technical", "génie-industriel", "Prevention of workplace accidents and hazards", "Prevention des accidents et dangers en milieu industriel"),
	skill("OEE (Overall Equipment Effectiveness)", "TRS (Taux de Rendement Synthetique)", "technical", "génie-industriel", "KPI measuring manufacturing productivity", "KPI mesurant la productivite de fabrication"),
	skill("Kanban System", "Systeme Kanban", "technical", "génie-industriel", "Visual workflow management for production", "Gestion visuelle du flux de travail pour la production"),
	skill("Just-in-Time (JIT)", "Juste-a-Temps (JAT)", "technical", "génie-industriel", "Inventory strategy to improve efficiency and reduce waste", "Strategie de stock pour ameliorer l'efficacite et reduire les gaspillages"),
	skill("Materials Science", "Science des Materiaux", "technical", "génie-industriel", "Properties and applications of engineering materials", "Proprietes et applications des materiaux d'ingenierie"),
	skill("Operations Research", "Recherche Operationnelle", "technical", "génie-industriel", "Mathematical optimization of operations and decisions", "Optimisation mathematique des operations et decisions"),
	skill("Production Planning (MRP/MRPII)", "Planification de Production (MRP/MRPII)", "technical", "génie-industriel", "Material requirements planning for manufacturing", "Planification des besoins en materiaux pour la fabrication"),
	skill("SMED (Single Minute Exchange of Die)", "SMED (Changement Rapide d'Outils)", "technical", "génie-industriel", "Quick changeover methodology to reduce setup time", "Methodologie de changement rapide pour reduire les temps de reglage"),
	skill("Poka-Yoke (Error Proofing)", "Poka-Yoke (Anti-erreur)", "technical", "génie-industriel", "Mistake-proofing mechanisms in production", "Mecanismes anti-erreur en production"),

	// =========================================================================
	// GENIE CIVIL (42 skills)
	// =========================================================================
	skill("AutoCAD (Civil)", "AutoCAD (Civil)", "tool", "génie-civil", "Industry-standard 2D/3D drafting for civil engineering", "Standard industriel de dessin 2D/3D pour le genie civil"),
	skill("Revit (BIM)", "Revit (BIM)", "tool", "génie-civil", "Building Information Modeling for architecture and structural design", "Modelisation des Informations du Batiment pour l'architecture et la structure"),
	skill("ETABS", "ETABS", "tool", "génie-civil", "Analysis and design of multi-story buildings", "Analyse et conception de batiments a plusieurs etages"),
	skill("Robot Structural Analysis", "Robot Structural Analysis", "tool", "génie-civil", "Finite element structural analysis software", "Logiciel d'analyse structurelle par elements finis"),
	skill("SAP2000", "SAP2000", "tool", "génie-civil", "Structural analysis program for civil engineering", "Programme d'analyse structurelle pour le genie civil"),
	skill("Civil 3D", "Civil 3D", "tool", "génie-civil", "Civil engineering design and documentation", "Conception et documentation en genie civil"),
	skill("BIM Methodology", "Methodologie BIM", "technical", "génie-civil", "Building Information Modeling collaborative workflow", "Flux de travail collaboratif en Modelisation des Informations du Batiment"),
	skill("Tekla Structures", "Tekla Structures", "tool", "génie-civil", "3D structural modeling for steel and concrete", "Modelisation structurelle 3D pour l'acier et le beton"),
	skill("ArcGIS", "ArcGIS", "tool", "génie-civil", "Geographic Information System for spatial analysis", "Systeme d'Information Geographique pour l'analyse spatiale"),
	skill("Primavera P6", "Primavera P6", "tool", "génie-civil", "Enterprise project portfolio management", "Gestion de portefeuille de projets d'entreprise"),
	skill("MS Project", "MS Project", "tool", "génie-civil", "Project planning and scheduling tool", "Outil de planification et d'ordonnancement de projets"),
	skill("Reinforced Concrete Design (BAEL)", "Beton Arme (BAEL)", "technical", "génie-civil", "French standard for reinforced concrete design", "Norme francaise pour le calcul du beton arme"),
	skill("Eurocode Standards", "Normes Eurocode", "technical", "génie-civil", "European standards for structural design", "Normes europeennes pour la conception structurelle"),
	skill("Steel Structure Design", "Conception de Structures Metalliques", "technical", "génie-civil", "Design and analysis of steel buildings and bridges", "Conception et analyse de batiments et ponts metalliques"),
	skill("Soil Mechanics", "Mecanique des Sols", "technical", "génie-civil", "Study of soil behavior for foundation design", "Etude du comportement des sols pour la conception des fondations"),
	skill("Hydrology/Hydraulics", "Hydrologie/Hydraulique", "technical", "génie-civil", "Water flow analysis for drainage and flood management", "Analyse des ecoulements pour le drainage et la gestion des crues"),
	skill("RPS 2011 (Moroccan Seismic Code)", "RPS 2011 (Code Sismique Marocain)", "technical", "génie-civil", "Moroccan seismic design regulations", "Reglementations sismiques marocaines"),
	skill("Road Design", "Conception Routiere", "technical", "génie-civil", "Geometric and structural design of roads", "Conception geometrique et structurelle des routes"),
	skill("Structural Analysis", "Analyse Structurelle", "technical", "génie-civil", "Determining forces and stresses in structures", "Determination des forces et contraintes dans les structures"),
	skill("Topographic Surveying", "Leve Topographique", "technical", "génie-civil", "Land measurement and mapping for construction", "Mesure et cartographie du terrain pour la construction"),
	skill("Cost Estimation", "Estimation des Couts", "technical", "génie-civil", "Calculating project budgets and material costs", "Calcul des budgets de projet et des couts de materiaux"),
	skill("Quantity Surveying", "Metrage", "technical", "génie-civil", "Measuring and calculating construction quantities", "Mesure et calcul des quantites de construction"),
	skill("Construction Management", "Gestion de Chantier", "technical", "génie-civil", "Supervising on-site construction operations", "Supervision des operations de construction sur site"),
	skill("Environmental Impact Assessment", "Etude d'Impact Environnemental", "technical", "génie-civil", "Evaluating environmental effects of construction projects", "Evaluation des effets environnementaux des projets de construction"),
	skill("Geotechnical Engineering", "Geotechnique", "technical", "génie-civil", "Subsurface investigation and foundation engineering", "Investigation du sous-sol et ingenierie des fondations"),
	skill("Concrete Technology", "Technologie du Beton", "technical", "génie-civil", "Mix design, testing, and quality control of concrete", "Formulation, essais et controle qualite du beton"),
	skill("Bridge Engineering", "Ingenierie des Ponts", "technical", "génie-civil", "Design and analysis of bridge structures", "Conception et analyse de structures de ponts"),
	skill("Water and Sanitation", "Eau et Assainissement", "technical", "génie-civil", "Water supply and wastewater management systems", "Systemes d'alimentation en eau et de gestion des eaux usees"),
	skill("Port and Maritime Structures", "Structures Portuaires et Maritimes", "technical", "génie-civil", "Design of harbors, jetties, and coastal structures", "Conception de ports, jetees et structures cotieres"),
	skill("Tunneling", "Tunnels", "technical", "génie-civil", "Underground construction methods and design", "Methodes et conception de construction souterraine"),
	skill("Building Code Compliance", "Conformite Reglementaire Batiment", "technical", "génie-civil", "Adherence to Moroccan construction regulations", "Respect de la reglementation marocaine de construction"),
	skill("Prestressed Concrete", "Beton Precontraint", "technical", "génie-civil", "Design of prestressed concrete structural elements", "Conception d'elements structurels en beton precontraint"),

	// =========================================================================
	// GENIE ELECTRIQUE (42 skills)
	// =========================================================================
	skill("PLC Siemens (S7/TIA Portal)", "Automate Siemens (S7/TIA Portal)", "technical", "génie-électrique", "Programming Siemens industrial controllers", "Programmation des automates industriels Siemens"),
	skill("PLC Schneider (Unity/EcoStruxure)", "Automate Schneider (Unity/EcoStruxure)", "technical", "génie-électrique", "Programming Schneider Electric automation systems", "Programmation des systemes d'automatisation Schneider Electric"),
	skill("PLC Allen-Bradley (Studio 5000)", "Automate Allen-Bradley (Studio 5000)", "technical", "génie-électrique", "Programming Rockwell Automation controllers", "Programmation des controleurs Rockwell Automation"),
	skill("SCADA Systems (Electrical)", "Systemes SCADA (Electrique)", "technical", "génie-électrique", "Supervisory control for electrical networks", "Controle de supervision pour les reseaux electriques"),
	skill("MATLAB/Simulink", "MATLAB/Simulink", "tool", "génie-électrique", "Numerical computing and simulation for electrical systems", "Calcul numerique et simulation pour les systemes electriques"),
	skill("ETAP", "ETAP", "tool", "génie-électrique", "Power system analysis and design software", "Logiciel d'analyse et de conception de systemes electriques"),
	skill("AutoCAD Electrical", "AutoCAD Electrical", "tool", "génie-électrique", "Electrical schematic design and documentation", "Conception et documentation de schemas electriques"),
	skill("EPLAN", "EPLAN", "tool", "génie-électrique", "Electrical engineering design platform", "Plateforme de conception en genie electrique"),
	skill("Solar Energy Systems", "Systemes d'Energie Solaire", "technical", "génie-électrique", "Design and installation of photovoltaic systems", "Conception et installation de systemes photovoltaiques"),
	skill("Wind Energy Systems", "Systemes d'Energie Eolienne", "technical", "génie-électrique", "Wind turbine technology and grid integration", "Technologie des eoliennes et integration au reseau"),
	skill("Smart Grid Technology", "Technologie Smart Grid", "technical", "génie-électrique", "Modern intelligent electrical grid management", "Gestion intelligente moderne du reseau electrique"),
	skill("Power Systems Analysis", "Analyse des Systemes de Puissance", "technical", "génie-électrique", "Load flow, short circuit, and stability studies", "Etudes de flux de charge, court-circuit et stabilite"),
	skill("High Voltage Systems", "Systemes Haute Tension", "technical", "génie-électrique", "Design and maintenance of HV installations", "Conception et maintenance des installations HT"),
	skill("Low Voltage Distribution", "Distribution Basse Tension", "technical", "génie-électrique", "Electrical distribution panel design and wiring", "Conception de tableaux de distribution et cablage"),
	skill("Motor Drives (VFD)", "Variateurs de Vitesse (VFD)", "technical", "génie-électrique", "Variable frequency drive configuration and tuning", "Configuration et reglage des variateurs de frequence"),
	skill("Embedded Systems (Arduino)", "Systemes Embarques (Arduino)", "technical", "génie-électrique", "Prototyping with Arduino microcontrollers", "Prototypage avec les microcontroleurs Arduino"),
	skill("Embedded Systems (STM32)", "Systemes Embarques (STM32)", "technical", "génie-électrique", "ARM-based microcontroller programming", "Programmation de microcontroleurs bases ARM"),
	skill("Embedded Systems (ESP32)", "Systemes Embarques (ESP32)", "technical", "génie-électrique", "IoT-enabled microcontroller for wireless applications", "Microcontroleur IoT pour les applications sans fil"),
	skill("PCB Design (KiCad)", "Conception PCB (KiCad)", "tool", "génie-électrique", "Open-source printed circuit board design", "Conception de circuits imprimes open-source"),
	skill("PCB Design (Altium)", "Conception PCB (Altium)", "tool", "génie-électrique", "Professional PCB design tool", "Outil professionnel de conception de circuits imprimes"),
	skill("VHDL/Verilog", "VHDL/Verilog", "technical", "génie-électrique", "Hardware description languages for FPGA design", "Langages de description materielle pour la conception FPGA"),
	skill("Digital Signal Processing", "Traitement du Signal Numerique", "technical", "génie-électrique", "Analysis and manipulation of digital signals", "Analyse et manipulation des signaux numeriques"),
	skill("IoT (Internet of Things)", "IoT (Internet des Objets)", "technical", "génie-électrique", "Connected device networks and protocols", "Reseaux et protocoles de dispositifs connectes"),
	skill("Industry 4.0", "Industrie 4.0", "technical", "génie-électrique", "Digital transformation in manufacturing", "Transformation numerique dans l'industrie manufacturiere"),
	skill("Electrical Safety (NF C 15-100)", "Securite Electrique (NF C 15-100)", "technical", "génie-électrique", "French/Moroccan low-voltage installation standard", "Norme d'installation basse tension francaise/marocaine"),
	skill("Transformer Design", "Conception de Transformateurs", "technical", "génie-électrique", "Power transformer sizing and specification", "Dimensionnement et specification de transformateurs de puissance"),
	skill("Relay Protection", "Protection par Relais", "technical", "génie-électrique", "Power system protection schemes", "Schemas de protection des systemes electriques"),
	skill("Energy Auditing", "Audit Energetique", "technical", "génie-électrique", "Evaluating energy usage and recommending improvements", "Evaluation de la consommation energetique et recommandations"),
	skill("Building Electrical Systems", "Installations Electriques du Batiment", "technical", "génie-électrique", "Complete building electrical design from lighting to HVAC", "Conception electrique complete du batiment, de l'eclairage a la CVC"),
	skill("Fiber Optics", "Fibre Optique", "technical", "génie-électrique", "Optical communication network installation and testing", "Installation et test de reseaux de communication optique"),

	// =========================================================================
	// GENIE MECANIQUE (35 skills)
	// =========================================================================
	skill("SolidWorks (Mechanical)", "SolidWorks (Mecanique)", "tool", "génie-mécanique", "3D parametric modeling for mechanical design", "Modelisation parametrique 3D pour la conception mecanique"),
	skill("CATIA (Mechanical)", "CATIA (Mecanique)", "tool", "génie-mécanique", "Advanced CAD for automotive and aerospace design", "CAO avancee pour la conception automobile et aeronautique"),
	skill("ANSYS (FEA/CFD)", "ANSYS (MEF/CFD)", "tool", "génie-mécanique", "Finite element and computational fluid dynamics simulation", "Simulation par elements finis et dynamique des fluides"),
	skill("AutoCAD Mechanical", "AutoCAD Mechanical", "tool", "génie-mécanique", "2D mechanical drafting and detailing", "Dessin et detail mecanique 2D"),
	skill("Thermodynamics", "Thermodynamique", "technical", "génie-mécanique", "Study of heat, work, and energy systems", "Etude des systemes de chaleur, travail et energie"),
	skill("Fluid Mechanics", "Mecanique des Fluides", "technical", "génie-mécanique", "Analysis of fluid behavior in engineering systems", "Analyse du comportement des fluides dans les systemes d'ingenierie"),
	skill("Strength of Materials", "Resistance des Materiaux", "technical", "génie-mécanique", "Analysis of stress and strain in solid materials", "Analyse des contraintes et deformations dans les materiaux solides"),
	skill("CNC Machining", "Usinage CNC", "technical", "génie-mécanique", "Computer-controlled precision machining operations", "Operations d'usinage de precision controlees par ordinateur"),
	skill("3D Printing/Additive Manufacturing", "Impression 3D/Fabrication Additive", "technical", "génie-mécanique", "Layer-by-layer manufacturing technologies", "Technologies de fabrication couche par couche"),
	skill("GD&T (Geometric Dimensioning)", "GD&T (Cotation Geometrique)", "technical", "génie-mécanique", "Engineering tolerancing and dimensioning standards", "Normes de tolerancement et cotation en ingenierie"),
	skill("Mechanical Vibrations", "Vibrations Mecaniques", "technical", "génie-mécanique", "Analysis of vibrating mechanical systems", "Analyse des systemes mecaniques vibrants"),
	skill("HVAC Systems Design", "Conception de Systemes CVC", "technical", "génie-mécanique", "Heating, ventilation, and air conditioning system design", "Conception de systemes de chauffage, ventilation et climatisation"),
	skill("Hydraulic Systems Design", "Conception de Systemes Hydrauliques", "technical", "génie-mécanique", "Design of fluid power systems", "Conception de systemes de puissance hydraulique"),
	skill("Pneumatic Systems", "Systemes Pneumatiques", "technical", "génie-mécanique", "Compressed air system design and maintenance", "Conception et maintenance de systemes a air comprime"),
	skill("Welding Engineering", "Ingenierie du Soudage", "technical", "génie-mécanique", "Welding process selection and joint design", "Selection de procedes de soudage et conception de joints"),
	skill("Mechanical Maintenance", "Maintenance Mecanique", "technical", "génie-mécanique", "Preventive and corrective maintenance of machinery", "Maintenance preventive et corrective des machines"),
	skill("Combustion Engines", "Moteurs a Combustion", "technical", "génie-mécanique", "Internal combustion engine design and analysis", "Conception et analyse de moteurs a combustion interne"),
	skill("Robotics Fundamentals", "Fondamentaux de la Robotique", "technical", "génie-mécanique", "Robot kinematics, dynamics, and control", "Cinematique, dynamique et controle des robots"),
	skill("Metrology", "Metrologie", "technical", "génie-mécanique", "Precision measurement science and techniques", "Science et techniques de mesure de precision"),
	skill("Piping Design", "Conception de Tuyauterie", "technical", "génie-mécanique", "Industrial piping system layout and sizing", "Trace et dimensionnement de systemes de tuyauterie industrielle"),

	// =========================================================================
	// MANAGEMENT (32 skills)
	// =========================================================================
	skill("Strategic Planning", "Planification Strategique", "technical", "management", "Long-term organizational direction and goal setting", "Direction organisationnelle a long terme et fixation d'objectifs"),
	skill("Business Strategy", "Strategie d'Entreprise", "technical", "management", "Competitive positioning and market strategy", "Positionnement concurrentiel et strategie de marche"),
	skill("Organizational Behavior", "Comportement Organisationnel", "technical", "management", "Understanding human behavior in organizations", "Comprehension du comportement humain dans les organisations"),
	skill("Change Management", "Gestion du Changement", "technical", "management", "Leading organizational transformation initiatives", "Direction des initiatives de transformation organisationnelle"),
	skill("Financial Management", "Gestion Financiere", "technical", "management", "Corporate financial planning and control", "Planification et controle financier d'entreprise"),
	skill("Operations Management", "Gestion des Operations", "technical", "management", "Managing production and service delivery", "Gestion de la production et de la prestation de services"),
	skill("Human Resources Management", "Gestion des Ressources Humaines", "technical", "management", "Employee lifecycle management", "Gestion du cycle de vie des employes"),
	skill("Marketing Management", "Gestion du Marketing", "technical", "management", "Market analysis and promotional strategy", "Analyse de marche et strategie promotionnelle"),
	skill("Project Management (PMP)", "Gestion de Projet (PMP)", "certification", "management", "Project Management Professional certification", "Certification Professional en Gestion de Projet"),
	skill("Agile Management", "Management Agile", "technical", "management", "Iterative and adaptive management methodology", "Methodologie de management iterative et adaptative"),
	skill("Business Process Reengineering", "Reingenieire des Processus", "technical", "management", "Radical redesign of business processes", "Reconception radicale des processus metier"),
	skill("Balanced Scorecard", "Tableau de Bord Prospectif", "technical", "management", "Strategic performance management framework", "Cadre de gestion strategique de la performance"),
	skill("Entrepreneurship", "Entrepreneuriat", "technical", "management", "Starting and managing new business ventures", "Lancement et gestion de nouvelles entreprises"),
	skill("Corporate Governance", "Gouvernance d'Entreprise", "technical", "management", "Oversight frameworks for organizational accountability", "Cadres de supervision pour la responsabilite organisationnelle"),
	skill("Business Analytics", "Analytique d'Affaires", "technical", "management", "Data-driven decision-making in business contexts", "Prise de decision basee sur les donnees dans les contextes d'affaires"),
	skill("Stakeholder Management", "Gestion des Parties Prenantes", "soft", "management", "Engaging and managing stakeholder relationships", "Engagement et gestion des relations avec les parties prenantes"),

	// =========================================================================
	// COMMERCE INTERNATIONAL (30 skills)
	// =========================================================================
	skill("International Trade Law", "Droit du Commerce International", "technical", "commerce-international", "Legal frameworks governing cross-border trade", "Cadres juridiques regissant le commerce transfrontalier"),
	skill("Incoterms 2020", "Incoterms 2020", "technical", "commerce-international", "International commercial terms for trade contracts", "Termes commerciaux internationaux pour les contrats commerciaux"),
	skill("Customs Procedures", "Procedures Douanieres", "technical", "commerce-international", "Import/export customs documentation and processes", "Documentation et processus douaniers d'import/export"),
	skill("Letter of Credit (L/C)", "Lettre de Credit (L/C)", "technical", "commerce-international", "Documentary credit management for international trade", "Gestion du credit documentaire pour le commerce international"),
	skill("Foreign Exchange Management", "Gestion des Changes", "technical", "commerce-international", "Currency risk management and hedging strategies", "Gestion du risque de change et strategies de couverture"),
	skill("International Logistics", "Logistique Internationale", "technical", "commerce-international", "Global supply chain and freight management", "Gestion de la chaine d'approvisionnement et du fret mondial"),
	skill("Export Marketing", "Marketing Export", "technical", "commerce-international", "Developing markets in foreign countries", "Developpement de marches dans les pays etrangers"),
	skill("Trade Finance", "Financement du Commerce", "technical", "commerce-international", "Financial instruments for international commerce", "Instruments financiers pour le commerce international"),
	skill("International Negotiation", "Negociation Internationale", "soft", "commerce-international", "Cross-cultural business negotiation techniques", "Techniques de negociation commerciale interculturelle"),
	skill("Cross-Cultural Communication", "Communication Interculturelle", "soft", "commerce-international", "Effective communication across cultural boundaries", "Communication efficace a travers les frontieres culturelles"),
	skill("Market Entry Strategy", "Strategie d'Entree sur le Marche", "technical", "commerce-international", "Planning entry into new international markets", "Planification de l'entree sur de nouveaux marches internationaux"),
	skill("International Marketing", "Marketing International", "technical", "commerce-international", "Adapting marketing strategies for global markets", "Adaptation des strategies marketing aux marches mondiaux"),
	skill("Free Trade Agreements (Morocco-EU, AfCFTA)", "Accords de Libre-Echange (Maroc-UE, ZLECAf)", "technical", "commerce-international", "Knowledge of Morocco's trade agreements", "Connaissance des accords commerciaux du Maroc"),

	// =========================================================================
	// LOGISTIQUE (28 skills)
	// =========================================================================
	skill("Warehouse Management (WMS)", "Gestion d'Entrepot (WMS)", "technical", "logistique", "Warehouse management systems and operations", "Systemes et operations de gestion d'entrepot"),
	skill("Transport Management (TMS)", "Gestion du Transport (TMS)", "technical", "logistique", "Transportation planning and execution", "Planification et execution du transport"),
	skill("Inventory Management", "Gestion des Stocks", "technical", "logistique", "Stock control, replenishment, and optimization", "Controle des stocks, reapprovisionnement et optimisation"),
	skill("Demand Forecasting", "Prevision de la Demande", "technical", "logistique", "Predicting future product demand using data", "Prediction de la demande future a l'aide de donnees"),
	skill("Last Mile Delivery", "Livraison du Dernier Kilometre", "technical", "logistique", "Final stage delivery optimization", "Optimisation de la livraison de derniere etape"),
	skill("Cold Chain Logistics", "Logistique de la Chaine du Froid", "technical", "logistique", "Temperature-controlled supply chain management", "Gestion de la chaine d'approvisionnement a temperature controlee"),
	skill("Lean Logistics", "Logistique Lean", "technical", "logistique", "Applying lean principles to logistics operations", "Application des principes lean aux operations logistiques"),
	skill("Procurement", "Achats/Approvisionnement", "technical", "logistique", "Strategic purchasing and supplier management", "Achats strategiques et gestion des fournisseurs"),
	skill("Freight Forwarding", "Transit/Affretement", "technical", "logistique", "Organizing shipments for import/export", "Organisation des expeditions pour l'import/export"),
	skill("SAP Logistics Module", "Module Logistique SAP", "tool", "logistique", "SAP MM/SD modules for logistics operations", "Modules SAP MM/SD pour les operations logistiques"),
	skill("Reverse Logistics", "Logistique Inverse", "technical", "logistique", "Managing returns, recycling, and disposal", "Gestion des retours, du recyclage et de l'elimination"),
	skill("Port Operations", "Operations Portuaires", "technical", "logistique", "Managing cargo and vessel operations at ports", "Gestion des operations de fret et de navires dans les ports"),
	skill("Tanger Med Port Operations", "Operations du Port Tanger Med", "technical", "logistique", "Specific expertise for Morocco's main logistics hub", "Expertise specifique pour le principal hub logistique du Maroc"),

	// =========================================================================
	// FINANCE (28 skills)
	// =========================================================================
	skill("Financial Analysis", "Analyse Financiere", "technical", "finance", "Evaluating financial statements and performance", "Evaluation des etats financiers et de la performance"),
	skill("Management Accounting", "Comptabilite de Gestion", "technical", "finance", "Cost accounting and budgetary control", "Comptabilite analytique et controle budgetaire"),
	skill("Corporate Finance", "Finance d'Entreprise", "technical", "finance", "Capital structure, valuation, and investment decisions", "Structure du capital, evaluation et decisions d'investissement"),
	skill("Financial Modeling", "Modelisation Financiere", "technical", "finance", "Building spreadsheet models for financial forecasting", "Construction de modeles de tableur pour les previsions financieres"),
	skill("Risk Management (Financial)", "Gestion des Risques (Financier)", "technical", "finance", "Identifying and mitigating financial risks", "Identification et attenuation des risques financiers"),
	skill("Moroccan Tax Law", "Droit Fiscal Marocain", "technical", "finance", "Understanding IS, IR, TVA, and local tax codes", "Comprehension de l'IS, l'IR, la TVA et les codes fiscaux locaux"),
	skill("IFRS/Moroccan GAAP", "IFRS/PCM Marocain", "technical", "finance", "International and Moroccan accounting standards", "Normes comptables internationales et marocaines"),
	skill("Audit", "Audit", "technical", "finance", "Internal and external audit procedures", "Procedures d'audit interne et externe"),
	skill("Treasury Management", "Gestion de Tresorerie", "technical", "finance", "Cash flow planning and liquidity management", "Planification des flux de tresorerie et gestion de la liquidite"),
	skill("Investment Analysis", "Analyse des Investissements", "technical", "finance", "Evaluating investment opportunities and portfolios", "Evaluation des opportunites d'investissement et des portefeuilles"),
	skill("Banking Operations", "Operations Bancaires", "technical", "finance", "Bank products, services, and regulatory compliance", "Produits, services et conformite reglementaire bancaires"),
	skill("Islamic Finance", "Finance Islamique", "technical", "finance", "Sharia-compliant financial products and services", "Produits et services financiers conformes a la Charia"),
	skill("Microfinance", "Microfinance", "technical", "finance", "Financial services for underserved populations", "Services financiers pour les populations mal desservies"),
	skill("Excel Financial Functions", "Fonctions Financieres Excel", "tool", "finance", "NPV, IRR, VLOOKUP, pivot tables for finance", "VAN, TRI, RECHERCHEV, tableaux croises dynamiques pour la finance"),
	skill("SAP Finance Module (FI/CO)", "Module Finance SAP (FI/CO)", "tool", "finance", "SAP financial accounting and controlling", "Comptabilite financiere et controle de gestion SAP"),

	// =========================================================================
	// MARKETING (28 skills)
	// =========================================================================
	skill("Digital Marketing", "Marketing Digital", "technical", "marketing", "Online marketing strategies across digital channels", "Strategies de marketing en ligne sur les canaux numeriques"),
	skill("Social Media Marketing", "Marketing des Reseaux Sociaux", "technical", "marketing", "Brand management on social platforms", "Gestion de marque sur les plateformes sociales"),
	skill("SEO/SEM", "SEO/SEM", "technical", "marketing", "Search engine optimization and paid search", "Optimisation pour les moteurs de recherche et recherche payante"),
	skill("Content Marketing", "Marketing de Contenu", "technical", "marketing", "Creating valuable content to attract audiences", "Creation de contenu de valeur pour attirer des audiences"),
	skill("Google Analytics", "Google Analytics", "tool", "marketing", "Web analytics and user behavior tracking", "Analytique web et suivi du comportement des utilisateurs"),
	skill("Google Ads", "Google Ads", "tool", "marketing", "Pay-per-click advertising platform management", "Gestion de la plateforme publicitaire au cout par clic"),
	skill("Meta Ads (Facebook/Instagram)", "Meta Ads (Facebook/Instagram)", "tool", "marketing", "Social media advertising on Meta platforms", "Publicite sur les reseaux sociaux Meta"),
	skill("Email Marketing", "Email Marketing", "technical", "marketing", "Newsletter campaigns and marketing automation", "Campagnes de newsletter et automatisation marketing"),
	skill("Market Research", "Etude de Marche", "technical", "marketing", "Consumer insights and competitive analysis", "Insights consommateurs et analyse concurrentielle"),
	skill("Brand Management", "Gestion de Marque", "technical", "marketing", "Building and managing brand identity and equity", "Construction et gestion de l'identite et de la valeur de la marque"),
	skill("CRM (Salesforce/HubSpot)", "CRM (Salesforce/HubSpot)", "tool", "marketing", "Customer relationship management platforms", "Plateformes de gestion de la relation client"),
	skill("Influencer Marketing", "Marketing d'Influence", "technical", "marketing", "Partnerships with social media influencers", "Partenariats avec les influenceurs des reseaux sociaux"),
	skill("Product Marketing", "Marketing Produit", "technical", "marketing", "Go-to-market strategy and product positioning", "Strategie de mise sur le marche et positionnement produit"),
	skill("Marketing Analytics", "Analytique Marketing", "technical", "marketing", "Data-driven marketing performance measurement", "Mesure de la performance marketing basee sur les donnees"),
	skill("Graphic Design (Canva/Photoshop)", "Design Graphique (Canva/Photoshop)", "tool", "marketing", "Creating visual marketing materials", "Creation de supports marketing visuels"),

	// =========================================================================
	// RESSOURCES HUMAINES (28 skills)
	// =========================================================================
	skill("Talent Acquisition", "Acquisition de Talents", "technical", "ressources-humaines", "Recruiting and hiring strategies", "Strategies de recrutement et d'embauche"),
	skill("Moroccan Labor Law (Code du Travail)", "Droit du Travail Marocain (Code du Travail)", "technical", "ressources-humaines", "Legal framework for employment in Morocco", "Cadre juridique de l'emploi au Maroc"),
	skill("Performance Management", "Gestion de la Performance", "technical", "ressources-humaines", "Employee evaluation and development systems", "Systemes d'evaluation et de developpement des employes"),
	skill("Compensation & Benefits", "Remuneration et Avantages", "technical", "ressources-humaines", "Salary structures, benefits packages, and incentives", "Structures salariales, avantages sociaux et primes"),
	skill("Training & Development", "Formation et Developpement", "technical", "ressources-humaines", "Employee learning programs and skill building", "Programmes de formation et de developpement des competences"),
	skill("HRIS Systems", "Systemes SIRH", "tool", "ressources-humaines", "Human resource information system management", "Gestion des systemes d'information de ressources humaines"),
	skill("Organizational Development", "Developpement Organisationnel", "technical", "ressources-humaines", "Improving organizational effectiveness and culture", "Amelioration de l'efficacite et de la culture organisationnelles"),
	skill("Employee Relations", "Relations Employeur-Employe", "technical", "ressources-humaines", "Managing workplace conflicts and employee satisfaction", "Gestion des conflits et de la satisfaction des employes"),
	skill("Payroll Administration (Morocco)", "Administration de la Paie (Maroc)", "technical", "ressources-humaines", "Moroccan payroll processing, CNSS, AMO contributions", "Traitement de la paie marocaine, cotisations CNSS, AMO"),
	skill("Workforce Planning", "Planification de la Main-d'oeuvre", "technical", "ressources-humaines", "Forecasting staffing needs and talent pipeline", "Prevision des besoins en personnel et viviers de talents"),
	skill("Diversity & Inclusion", "Diversite et Inclusion", "soft", "ressources-humaines", "Promoting equitable and inclusive workplaces", "Promotion de milieux de travail equitables et inclusifs"),
	skill("Employer Branding", "Marque Employeur", "technical", "ressources-humaines", "Building organizational reputation as an employer", "Construction de la reputation organisationnelle en tant qu'employeur"),

	// =========================================================================
	// GENERAL / CROSS-FIELD (40 skills)
	// =========================================================================
	// -- Soft Skills --
	skill("Communication Skills", "Competences en Communication", "soft", "général", "Clear verbal and written communication", "Communication verbale et ecrite claire"),
	skill("Leadership", "Leadership", "soft", "général", "Guiding and motivating teams toward goals", "Guider et motiver les equipes vers les objectifs"),
	skill("Teamwork & Collaboration", "Travail d'Equipe et Collaboration", "soft", "général", "Working effectively with diverse teams", "Travailler efficacement avec des equipes diversifiees"),
	skill("Problem-Solving", "Resolution de Problemes", "soft", "général", "Analytical approach to identifying and fixing issues", "Approche analytique pour identifier et resoudre les problemes"),
	skill("Critical Thinking", "Pensee Critique", "soft", "général", "Evaluating information objectively and logically", "Evaluer l'information de maniere objective et logique"),
	skill("Presentation Skills", "Competences en Presentation", "soft", "général", "Delivering compelling presentations to audiences", "Presenter de maniere convaincante devant un public"),
	skill("Time Management", "Gestion du Temps", "soft", "général", "Prioritizing tasks and meeting deadlines", "Prioriser les taches et respecter les delais"),
	skill("Negotiation", "Negociation", "soft", "général", "Reaching mutually beneficial agreements", "Parvenir a des accords mutuellement benefiques"),
	skill("Public Speaking", "Prise de Parole en Public", "soft", "général", "Addressing large groups with confidence", "S'adresser a de grands groupes avec confiance"),
	skill("Conflict Resolution", "Resolution de Conflits", "soft", "général", "Mediating disputes and finding solutions", "Mediation des differends et recherche de solutions"),
	skill("Emotional Intelligence", "Intelligence Emotionnelle", "soft", "général", "Understanding and managing emotions in professional settings", "Comprehension et gestion des emotions en milieu professionnel"),
	skill("Adaptability", "Adaptabilite", "soft", "général", "Adjusting effectively to changing circumstances", "S'adapter efficacement aux circonstances changeantes"),
	skill("Creativity & Innovation", "Creativite et Innovation", "soft", "général", "Generating novel ideas and solutions", "Generation d'idees et de solutions novatrices"),
	skill("Research Skills", "Competences en Recherche", "soft", "général", "Systematic investigation and information gathering", "Investigation systematique et collecte d'informations"),
	skill("Professional Writing", "Redaction Professionnelle", "soft", "général", "Writing reports, proposals, and business documents", "Redaction de rapports, propositions et documents d'affaires"),
	skill("Active Listening", "Ecoute Active", "soft", "général", "Fully concentrating on and understanding the speaker", "Se concentrer pleinement et comprendre l'interlocuteur"),
	skill("Decision Making", "Prise de Decision", "soft", "général", "Making sound choices under uncertainty", "Prendre des decisions judicieuses en situation d'incertitude"),
	skill("Stress Management", "Gestion du Stress", "soft", "général", "Maintaining composure and performance under pressure", "Maintenir le calme et la performance sous pression"),

	// -- Language Skills --
	skill("French (C1/C2)", "Francais (C1/C2)", "language", "général", "Advanced/native-level French proficiency", "Maitrise du francais au niveau avance/natif"),
	skill("English (B2-C1)", "Anglais (B2-C1)", "language", "général", "Upper-intermediate to advanced English proficiency", "Maitrise de l'anglais niveau intermediaire superieur a avance"),
	skill("Arabic (Modern Standard)", "Arabe (Standard Moderne)", "language", "général", "Formal Arabic for professional and academic use", "Arabe formel pour l'usage professionnel et academique"),
	skill("Darija (Moroccan Arabic)", "Darija (Arabe Marocain)", "language", "général", "Moroccan dialect for local professional communication", "Dialecte marocain pour la communication professionnelle locale"),
	skill("Spanish", "Espagnol", "language", "général", "Spanish language proficiency", "Maitrise de la langue espagnole"),
	skill("German", "Allemand", "language", "général", "German language proficiency", "Maitrise de la langue allemande"),
	skill("Mandarin Chinese", "Chinois Mandarin", "language", "général", "Chinese language skills for international business", "Competences en chinois pour le commerce international"),

	// -- Tools --
	skill("Microsoft Office Suite", "Suite Microsoft Office", "tool", "général", "Word, PowerPoint, Outlook for business productivity", "Word, PowerPoint, Outlook pour la productivite professionnelle"),
	skill("Advanced Excel", "Excel Avance", "tool", "général", "Pivot tables, VLOOKUP, macros, and data analysis", "Tableaux croises dynamiques, RECHERCHEV, macros et analyse de donnees"),
	skill("Power BI", "Power BI", "tool", "général", "Microsoft business intelligence and data visualization", "Intelligence d'affaires et visualisation de donnees Microsoft"),
	skill("Tableau", "Tableau", "tool", "général", "Data visualization and analytics platform", "Plateforme de visualisation et d'analytique de donnees"),
	skill("Google Workspace", "Google Workspace", "tool", "général", "Docs, Sheets, Slides, and collaborative tools", "Docs, Sheets, Slides et outils collaboratifs"),
	skill("SPSS/R (Statistical Analysis)", "SPSS/R (Analyse Statistique)", "tool", "général", "Statistical software for research and data analysis", "Logiciel statistique pour la recherche et l'analyse de donnees"),
	skill("Notion/Trello/Jira", "Notion/Trello/Jira", "tool", "général", "Project and task management tools", "Outils de gestion de projets et de taches"),
	skill("Zoom/Teams (Virtual Collaboration)", "Zoom/Teams (Collaboration Virtuelle)", "tool", "général", "Video conferencing and remote collaboration", "Visioconference et collaboration a distance"),

	// -- Certifications --
	skill("TOEIC/IELTS/TOEFL", "TOEIC/IELTS/TOEFL", "certification", "général", "Internationally recognized English proficiency tests", "Tests de competence en anglais reconnus internationalement"),
	skill("DELF/DALF (French)", "DELF/DALF (Francais)", "certification", "général", "Official French language proficiency diplomas", "Diplomes officiels de competence en langue francaise"),
	skill("Google Certifications", "Certifications Google", "certification", "général", "Google Analytics, Ads, and Cloud certifications", "Certifications Google Analytics, Ads et Cloud"),
	skill("Scrum Master (CSM)", "Scrum Master (CSM)", "certification", "général", "Certified ScrumMaster agile methodology credential", "Certification en methodologie agile Scrum Master"),
	skill("First Aid/CPR Certification", "Certification Premiers Secours/RCP", "certification", "général", "Emergency first aid and CPR training certification", "Certification de formation aux premiers secours et RCP"),
];

// ============================================================================
// CAREER QUIZ QUESTIONS DATA (100+ questions)
// ============================================================================

let questionSortOrder = 0;
function q(id, quizType, question, questionFr, category, type, trait, opts = {}) {
	questionSortOrder++;
	return {
		id,
		quizType,
		question,
		questionFr,
		description: opts.description || null,
		descriptionFr: opts.descriptionFr || null,
		category,
		type,
		trait,
		scaleMin: opts.scaleMin || null,
		scaleMax: opts.scaleMax || null,
		scaleMinFr: opts.scaleMinFr || null,
		scaleMaxFr: opts.scaleMaxFr || null,
		sortOrder: questionSortOrder,
	};
}

function opt(id, questionId, text, textFr, icon, scores, sortOrder) {
	return { id, questionId, text, textFr, icon, scores, sortOrder };
}

const QUESTIONS = [
	// =========================================================================
	// CAREER ORIENTATION (20 questions)
	// =========================================================================
	q("co-1", "career_assessment", "What type of environment do you feel most productive in?", "Dans quel type d'environnement vous sentez-vous le plus productif?", "career-orientation", "multiple_choice", "work_environment"),
	q("co-2", "career_assessment", "When faced with a complex problem, what is your first instinct?", "Face a un probleme complexe, quel est votre premier reflexe?", "career-orientation", "multiple_choice", "analytical"),
	q("co-3", "career_assessment", "What motivates you most in your professional life?", "Qu'est-ce qui vous motive le plus dans votre vie professionnelle?", "career-orientation", "multiple_choice", "motivation"),
	q("co-4", "career_assessment", "How do you prefer to learn new skills?", "Comment preferez-vous apprendre de nouvelles competences?", "career-orientation", "multiple_choice", "learning_style"),
	q("co-5", "career_assessment", "What kind of impact do you want your career to have?", "Quel type d'impact souhaitez-vous avoir dans votre carriere?", "career-orientation", "multiple_choice", "values"),
	q("co-6", "career_assessment", "How do you handle tight deadlines?", "Comment gerez-vous les delais serres?", "career-orientation", "multiple_choice", "stress_tolerance"),
	q("co-7", "career_assessment", "Which best describes your ideal workday?", "Laquelle decrit le mieux votre journee de travail ideale?", "career-orientation", "multiple_choice", "work_style"),
	q("co-8", "career_assessment", "How important is international travel for your career?", "Quelle importance accordez-vous aux voyages internationaux dans votre carriere?", "career-orientation", "scale", "international_mindset", { scaleMin: "Not important at all", scaleMax: "Essential for me", scaleMinFr: "Pas du tout important", scaleMaxFr: "Essentiel pour moi" }),
	q("co-9", "career_assessment", "Do you prefer working on short-term projects or long-term programs?", "Preferez-vous travailler sur des projets court terme ou des programmes long terme?", "career-orientation", "multiple_choice", "project_preference"),
	q("co-10", "career_assessment", "How comfortable are you with taking calculated risks?", "A quel point etes-vous a l'aise avec les risques calcules?", "career-orientation", "scale", "risk_tolerance", { scaleMin: "I avoid risks", scaleMax: "I thrive on calculated risks", scaleMinFr: "J'evite les risques", scaleMaxFr: "J'aime les risques calcules" }),

	q("co-11", "career_assessment", "What role do you naturally take in a group project?", "Quel role prenez-vous naturellement dans un projet de groupe?", "career-orientation", "multiple_choice", "leadership"),
	q("co-12", "career_assessment", "How do you react when your idea is rejected by the team?", "Comment reagissez-vous quand votre idee est rejetee par l'equipe?", "career-orientation", "multiple_choice", "resilience"),
	q("co-13", "career_assessment", "Which school subject did you enjoy the most?", "Quelle matiere scolaire avez-vous le plus appreciee?", "career-orientation", "multiple_choice", "academic_interest"),
	q("co-14", "career_assessment", "How important is a structured daily routine for you?", "Quelle importance a une routine quotidienne structuree pour vous?", "career-orientation", "scale", "structure_preference", { scaleMin: "I prefer spontaneity", scaleMax: "Structure is essential", scaleMinFr: "Je prefere la spontaneite", scaleMaxFr: "La structure est essentielle" }),
	q("co-15", "career_assessment", "What would you do if you received two job offers simultaneously?", "Que feriez-vous si vous receviez deux offres d'emploi en meme temps?", "career-orientation", "multiple_choice", "decision_making"),

	q("co-16", "career_assessment", "How do you feel about public speaking?", "Que pensez-vous de la prise de parole en public?", "career-orientation", "scale", "communication", { scaleMin: "I dread it", scaleMax: "I enjoy it greatly", scaleMinFr: "Je le redoute", scaleMaxFr: "J'adore ca" }),
	q("co-17", "career_assessment", "Do you prefer creating things from scratch or improving existing systems?", "Preferez-vous creer de nouvelles choses ou ameliorer des systemes existants?", "career-orientation", "multiple_choice", "creative_vs_analytical"),
	q("co-18", "career_assessment", "How do you keep yourself organized?", "Comment restez-vous organise(e)?", "career-orientation", "multiple_choice", "organization"),
	q("co-19", "career_assessment", "What is your relationship with technology?", "Quelle est votre relation avec la technologie?", "career-orientation", "multiple_choice", "tech_affinity"),
	q("co-20", "career_assessment", "How important is work-life balance compared to career advancement?", "Quelle importance a l'equilibre vie pro/perso par rapport a l'avancement de carriere?", "career-orientation", "scale", "work_life_balance", { scaleMin: "Career comes first", scaleMax: "Balance is everything", scaleMinFr: "La carriere d'abord", scaleMaxFr: "L'equilibre avant tout" }),

	// =========================================================================
	// FIELD DISCOVERY (20 questions)
	// =========================================================================
	q("fd-1", "career_quiz", "Which of these activities excites you the most?", "Laquelle de ces activites vous enthousiasme le plus?", "field-discovery", "multiple_choice", "field_interest"),
	q("fd-2", "career_quiz", "If you could solve one big problem in Morocco, what would it be?", "Si vous pouviez resoudre un grand probleme au Maroc, ce serait lequel?", "field-discovery", "multiple_choice", "social_impact"),
	q("fd-3", "career_quiz", "Which Moroccan industry excites you the most?", "Quelle industrie marocaine vous enthousiasme le plus?", "field-discovery", "multiple_choice", "industry_interest"),
	q("fd-4", "career_quiz", "What type of tools do you enjoy using?", "Quel type d'outils aimez-vous utiliser?", "field-discovery", "multiple_choice", "tool_preference"),
	q("fd-5", "career_quiz", "Where would you prefer to work in Morocco?", "Ou prefereriez-vous travailler au Maroc?", "field-discovery", "multiple_choice", "location_preference"),
	q("fd-6", "career_quiz", "Which project would you most want to work on?", "Sur quel projet aimeriez-vous le plus travailler?", "field-discovery", "multiple_choice", "project_type"),
	q("fd-7", "career_quiz", "How do you feel about working outdoors?", "Que pensez-vous du travail en exterieur?", "field-discovery", "scale", "outdoor_preference", { scaleMin: "I strongly prefer indoors", scaleMax: "I love working outdoors", scaleMinFr: "Je prefere fortement l'interieur", scaleMaxFr: "J'adore travailler en exterieur" }),
	q("fd-8", "career_quiz", "Which type of work output satisfies you most?", "Quel type de resultat de travail vous satisfait le plus?", "field-discovery", "multiple_choice", "output_satisfaction"),
	q("fd-9", "career_quiz", "What size company appeals to you?", "Quelle taille d'entreprise vous attire?", "field-discovery", "multiple_choice", "company_size"),
	q("fd-10", "career_quiz", "How important is having a tangible physical product from your work?", "Quelle importance a un produit physique tangible issu de votre travail?", "field-discovery", "scale", "tangibility", { scaleMin: "Not at all", scaleMax: "Very important", scaleMinFr: "Pas du tout", scaleMaxFr: "Tres important" }),

	q("fd-11", "career_quiz", "Which work pace suits you best?", "Quel rythme de travail vous convient le mieux?", "field-discovery", "multiple_choice", "work_pace"),
	q("fd-12", "career_quiz", "What kind of client interaction do you prefer?", "Quel type d'interaction client preferez-vous?", "field-discovery", "multiple_choice", "client_interaction"),
	q("fd-13", "career_quiz", "Which of these Moroccan mega-projects inspires you most?", "Lequel de ces mega-projets marocains vous inspire le plus?", "field-discovery", "multiple_choice", "mega_project"),
	q("fd-14", "career_quiz", "How do you feel about working with data and numbers?", "Que pensez-vous du travail avec les donnees et les chiffres?", "field-discovery", "scale", "data_affinity", { scaleMin: "I avoid numbers", scaleMax: "I love data analysis", scaleMinFr: "J'evite les chiffres", scaleMaxFr: "J'adore l'analyse de donnees" }),
	q("fd-15", "career_quiz", "Which type of team structure do you prefer?", "Quelle structure d'equipe preferez-vous?", "field-discovery", "multiple_choice", "team_structure"),
	q("fd-16", "career_quiz", "What aspect of sustainability interests you most?", "Quel aspect du developpement durable vous interesse le plus?", "field-discovery", "multiple_choice", "sustainability"),
	q("fd-17", "career_quiz", "How comfortable are you with continuous learning and certifications?", "A quel point etes-vous a l'aise avec la formation continue et les certifications?", "field-discovery", "scale", "continuous_learning", { scaleMin: "I prefer stable knowledge", scaleMax: "I love learning new things", scaleMinFr: "Je prefere la stabilite des connaissances", scaleMaxFr: "J'adore apprendre de nouvelles choses" }),
	q("fd-18", "career_quiz", "Which sector pays the best in Morocco and interests you?", "Quel secteur paie le mieux au Maroc et vous interesse?", "field-discovery", "multiple_choice", "salary_interest"),
	q("fd-19", "career_quiz", "What language skills matter most for your dream career?", "Quelles competences linguistiques comptent le plus pour votre carriere ideale?", "field-discovery", "multiple_choice", "language_priority"),
	q("fd-20", "career_quiz", "How interested are you in starting your own business eventually?", "A quel point etes-vous interesse(e) par la creation de votre propre entreprise?", "field-discovery", "scale", "entrepreneurship", { scaleMin: "Not interested", scaleMax: "Definitely want to", scaleMinFr: "Pas interesse(e)", scaleMaxFr: "C'est certain" }),

	// =========================================================================
	// SELF-ASSESSMENT (20 questions)
	// =========================================================================
	q("sa-1", "career_assessment", "Rate your logical reasoning ability.", "Evaluez votre capacite de raisonnement logique.", "self-assessment", "scale", "logical_reasoning", { scaleMin: "Basic", scaleMax: "Exceptional", scaleMinFr: "Basique", scaleMaxFr: "Exceptionnel" }),
	q("sa-2", "career_assessment", "How well do you handle ambiguity?", "Comment gerez-vous l'ambiguite?", "self-assessment", "scale", "ambiguity_tolerance", { scaleMin: "I need clear instructions", scaleMax: "I thrive in ambiguity", scaleMinFr: "J'ai besoin d'instructions claires", scaleMaxFr: "J'excelle dans l'ambiguite" }),
	q("sa-3", "career_assessment", "How would you rate your mathematical skills?", "Comment evaluez-vous vos competences mathematiques?", "self-assessment", "scale", "math_skills", { scaleMin: "Basic arithmetic", scaleMax: "Advanced calculus", scaleMinFr: "Arithmetique de base", scaleMaxFr: "Calcul avance" }),
	q("sa-4", "career_assessment", "How strong are your written communication skills?", "Comment evaluez-vous vos competences en communication ecrite?", "self-assessment", "scale", "written_communication", { scaleMin: "Needs improvement", scaleMax: "Excellent writer", scaleMinFr: "A ameliorer", scaleMaxFr: "Excellent redacteur" }),
	q("sa-5", "career_assessment", "How well do you manage your time?", "Comment gerez-vous votre temps?", "self-assessment", "scale", "time_management", { scaleMin: "Often late", scaleMax: "Always ahead of schedule", scaleMinFr: "Souvent en retard", scaleMaxFr: "Toujours en avance" }),
	q("sa-6", "career_assessment", "Rate your ability to work under physical strain.", "Evaluez votre capacite a travailler sous contrainte physique.", "self-assessment", "scale", "physical_endurance", { scaleMin: "Prefer desk work", scaleMax: "Very physically fit", scaleMinFr: "Prefere le bureau", scaleMaxFr: "Tres en forme physiquement" }),
	q("sa-7", "career_assessment", "How well do you manage conflicts?", "Comment gerez-vous les conflits?", "self-assessment", "scale", "conflict_management", { scaleMin: "I avoid them", scaleMax: "I resolve them constructively", scaleMinFr: "Je les evite", scaleMaxFr: "Je les resous de maniere constructive" }),
	q("sa-8", "career_assessment", "Rate your creativity level.", "Evaluez votre niveau de creativite.", "self-assessment", "scale", "creativity", { scaleMin: "I prefer following procedures", scaleMax: "I constantly innovate", scaleMinFr: "Je prefere suivre les procedures", scaleMaxFr: "J'innove constamment" }),
	q("sa-9", "career_assessment", "How well do you handle criticism?", "Comment reagissez-vous aux critiques?", "self-assessment", "scale", "feedback_reception", { scaleMin: "I take it personally", scaleMax: "I see it as growth", scaleMinFr: "Je le prends personnellement", scaleMaxFr: "J'y vois une opportunite de croissance" }),
	q("sa-10", "career_assessment", "Rate your proficiency with digital tools.", "Evaluez votre maitrise des outils numeriques.", "self-assessment", "scale", "digital_literacy", { scaleMin: "Basic user", scaleMax: "Power user", scaleMinFr: "Utilisateur de base", scaleMaxFr: "Utilisateur avance" }),

	q("sa-11", "career_assessment", "How patient are you with repetitive tasks?", "A quel point etes-vous patient(e) avec les taches repetitives?", "self-assessment", "scale", "patience", { scaleMin: "Very impatient", scaleMax: "Very patient", scaleMinFr: "Tres impatient(e)", scaleMaxFr: "Tres patient(e)" }),
	q("sa-12", "career_assessment", "How good are you at explaining complex ideas simply?", "Comment evaluez-vous votre capacite a expliquer des idees complexes simplement?", "self-assessment", "scale", "teaching_ability", { scaleMin: "Difficult for me", scaleMax: "Natural teacher", scaleMinFr: "Difficile pour moi", scaleMaxFr: "Pedagogue ne(e)" }),
	q("sa-13", "career_assessment", "Rate your attention to detail.", "Evaluez votre attention aux details.", "self-assessment", "scale", "attention_to_detail", { scaleMin: "Big picture thinker", scaleMax: "Extremely detail-oriented", scaleMinFr: "Vision globale", scaleMaxFr: "Extremement attentif aux details" }),
	q("sa-14", "career_assessment", "How comfortable are you speaking French in a professional setting?", "A quel point etes-vous a l'aise en francais dans un cadre professionnel?", "self-assessment", "scale", "french_proficiency", { scaleMin: "Basic level", scaleMax: "Bilingual", scaleMinFr: "Niveau de base", scaleMaxFr: "Bilingue" }),
	q("sa-15", "career_assessment", "How comfortable are you speaking English in a professional setting?", "A quel point etes-vous a l'aise en anglais dans un cadre professionnel?", "self-assessment", "scale", "english_proficiency", { scaleMin: "Beginner", scaleMax: "Fluent", scaleMinFr: "Debutant(e)", scaleMaxFr: "Courant" }),
	q("sa-16", "career_assessment", "How well do you multitask?", "Comment evaluez-vous votre capacite a gerer plusieurs taches?", "self-assessment", "scale", "multitasking", { scaleMin: "One task at a time", scaleMax: "Expert multitasker", scaleMinFr: "Une tache a la fois", scaleMaxFr: "Expert en multitache" }),
	q("sa-17", "career_assessment", "Rate your networking ability.", "Evaluez votre capacite a developper votre reseau.", "self-assessment", "scale", "networking", { scaleMin: "I'm very introverted", scaleMax: "I love meeting people", scaleMinFr: "Je suis tres introverti(e)", scaleMaxFr: "J'adore rencontrer des gens" }),
	q("sa-18", "career_assessment", "How comfortable are you with rapid change?", "A quel point etes-vous a l'aise avec le changement rapide?", "self-assessment", "scale", "adaptability", { scaleMin: "I prefer stability", scaleMax: "Change energizes me", scaleMinFr: "Je prefere la stabilite", scaleMaxFr: "Le changement m'energise" }),
	q("sa-19", "career_assessment", "Rate your project management skills.", "Evaluez vos competences en gestion de projet.", "self-assessment", "scale", "project_management", { scaleMin: "Beginner", scaleMax: "Can manage complex projects", scaleMinFr: "Debutant(e)", scaleMaxFr: "Peut gerer des projets complexes" }),
	q("sa-20", "career_assessment", "How well do you handle financial/budget responsibilities?", "Comment gerez-vous les responsabilites financieres/budgetaires?", "self-assessment", "scale", "financial_aptitude", { scaleMin: "Not comfortable", scaleMax: "Very confident", scaleMinFr: "Pas a l'aise", scaleMaxFr: "Tres confiant(e)" }),

	// =========================================================================
	// TECHNICAL APTITUDE (15 questions)
	// =========================================================================
	q("ta-1", "career_quiz", "Which technical challenge excites you most?", "Quel defi technique vous enthousiasme le plus?", "technical-aptitude", "multiple_choice", "technical_interest"),
	q("ta-2", "career_quiz", "How do you approach debugging a problem?", "Comment abordez-vous le debogage d'un probleme?", "technical-aptitude", "multiple_choice", "debugging_approach"),
	q("ta-3", "career_quiz", "Which programming paradigm resonates with you?", "Quel paradigme de programmation vous parle?", "technical-aptitude", "multiple_choice", "programming_style"),
	q("ta-4", "career_quiz", "What is your experience with CAD/design tools?", "Quelle est votre experience avec les outils CAO/conception?", "technical-aptitude", "multiple_choice", "cad_experience"),
	q("ta-5", "career_quiz", "How do you feel about working with electrical circuits?", "Que pensez-vous du travail avec les circuits electriques?", "technical-aptitude", "scale", "electrical_aptitude", { scaleMin: "Not my thing", scaleMax: "Fascinated by circuits", scaleMinFr: "Ce n'est pas pour moi", scaleMaxFr: "Fascine(e) par les circuits" }),
	q("ta-6", "career_quiz", "What is your comfort level with laboratory work?", "Quel est votre niveau de confort avec le travail en laboratoire?", "technical-aptitude", "scale", "lab_comfort", { scaleMin: "I prefer other settings", scaleMax: "I love lab work", scaleMinFr: "Je prefere d'autres environnements", scaleMaxFr: "J'adore le travail en labo" }),
	q("ta-7", "career_quiz", "How experienced are you with data analysis tools?", "Quelle est votre experience avec les outils d'analyse de donnees?", "technical-aptitude", "multiple_choice", "data_skills"),
	q("ta-8", "career_quiz", "Which area of mathematics do you enjoy most?", "Quel domaine des mathematiques appreciez-vous le plus?", "technical-aptitude", "multiple_choice", "math_preference"),
	q("ta-9", "career_quiz", "How comfortable are you reading technical documentation?", "A quel point etes-vous a l'aise avec la lecture de documentation technique?", "technical-aptitude", "scale", "documentation_comfort", { scaleMin: "Very difficult", scaleMax: "Very comfortable", scaleMinFr: "Tres difficile", scaleMaxFr: "Tres a l'aise" }),
	q("ta-10", "career_quiz", "What kind of systems do you prefer working with?", "Quel type de systemes preferez-vous?", "technical-aptitude", "multiple_choice", "system_preference"),

	q("ta-11", "career_quiz", "How do you approach learning a new technology?", "Comment abordez-vous l'apprentissage d'une nouvelle technologie?", "technical-aptitude", "multiple_choice", "learning_approach"),
	q("ta-12", "career_quiz", "Which type of engineering problem appeals to you?", "Quel type de probleme d'ingenierie vous attire?", "technical-aptitude", "multiple_choice", "engineering_interest"),
	q("ta-13", "career_quiz", "How interested are you in automation and AI?", "A quel point l'automatisation et l'IA vous interessent-elles?", "technical-aptitude", "scale", "ai_interest", { scaleMin: "Not interested", scaleMax: "Very passionate", scaleMinFr: "Pas interesse(e)", scaleMaxFr: "Tres passionne(e)" }),
	q("ta-14", "career_quiz", "What is your experience with version control?", "Quelle est votre experience avec le controle de version?", "technical-aptitude", "multiple_choice", "version_control"),
	q("ta-15", "career_quiz", "How do you feel about testing and quality assurance?", "Que pensez-vous des tests et de l'assurance qualite?", "technical-aptitude", "multiple_choice", "qa_attitude"),

	// =========================================================================
	// WORK VALUES (15 questions)
	// =========================================================================
	q("wv-1", "career_assessment", "How important is salary vs job satisfaction?", "Quelle importance a le salaire par rapport a la satisfaction?", "work-values", "scale", "salary_priority", { scaleMin: "Satisfaction matters most", scaleMax: "Salary is primary", scaleMinFr: "La satisfaction prime", scaleMaxFr: "Le salaire est primordial" }),
	q("wv-2", "career_assessment", "How important is job security to you?", "Quelle importance accordez-vous a la securite de l'emploi?", "work-values", "scale", "job_security", { scaleMin: "I prefer adventure", scaleMax: "Stability is essential", scaleMinFr: "Je prefere l'aventure", scaleMaxFr: "La stabilite est essentielle" }),
	q("wv-3", "career_assessment", "Would you prefer working for the state (public sector) or private sector?", "Preferez-vous travailler dans le secteur public ou prive?", "work-values", "multiple_choice", "sector_preference"),
	q("wv-4", "career_assessment", "How important is social status in your career choice?", "Quelle importance a le statut social dans votre choix de carriere?", "work-values", "scale", "social_status", { scaleMin: "Not important", scaleMax: "Very important", scaleMinFr: "Pas important", scaleMaxFr: "Tres important" }),
	q("wv-5", "career_assessment", "How important is autonomy in your work?", "Quelle importance a l'autonomie dans votre travail?", "work-values", "scale", "autonomy", { scaleMin: "Prefer guidance", scaleMax: "Need full autonomy", scaleMinFr: "Prefere l'encadrement", scaleMaxFr: "Besoin d'autonomie totale" }),
	q("wv-6", "career_assessment", "What matters more: helping your community or earning well?", "Qu'est-ce qui compte plus: aider votre communaute ou bien gagner?", "work-values", "scale", "community_vs_salary", { scaleMin: "Earning well", scaleMax: "Helping community", scaleMinFr: "Bien gagner", scaleMaxFr: "Aider la communaute" }),
	q("wv-7", "career_assessment", "Would you relocate to another Moroccan city for a great job?", "Demenageriez-vous dans une autre ville marocaine pour un bon emploi?", "work-values", "multiple_choice", "mobility"),
	q("wv-8", "career_assessment", "Would you work abroad for career growth?", "Travailleriez-vous a l'etranger pour votre carriere?", "work-values", "multiple_choice", "international_mobility"),
	q("wv-9", "career_assessment", "How important is having mentorship in your career?", "Quelle importance accordez-vous au mentorat dans votre carriere?", "work-values", "scale", "mentorship_value", { scaleMin: "Self-taught is fine", scaleMax: "Mentorship is crucial", scaleMinFr: "Autodidacte c'est bien", scaleMaxFr: "Le mentorat est crucial" }),
	q("wv-10", "career_assessment", "How important is company culture and values?", "Quelle importance a la culture et les valeurs de l'entreprise?", "work-values", "scale", "culture_fit", { scaleMin: "Not important", scaleMax: "Must align with my values", scaleMinFr: "Pas important", scaleMaxFr: "Doit correspondre a mes valeurs" }),

	q("wv-11", "career_assessment", "How do you feel about shift work or irregular hours?", "Que pensez-vous du travail en equipes ou des horaires irreguliers?", "work-values", "multiple_choice", "schedule_flexibility"),
	q("wv-12", "career_assessment", "How important is professional development funding from your employer?", "Quelle importance a le financement de la formation par l'employeur?", "work-values", "scale", "development_funding", { scaleMin: "Not important", scaleMax: "Deal breaker", scaleMinFr: "Pas important", scaleMaxFr: "Indispensable" }),
	q("wv-13", "career_assessment", "What is your ideal management relationship?", "Quelle est votre relation ideale avec le management?", "work-values", "multiple_choice", "management_style"),
	q("wv-14", "career_assessment", "How important is contributing to Morocco's development?", "Quelle importance a la contribution au developpement du Maroc?", "work-values", "scale", "national_contribution", { scaleMin: "Not a factor", scaleMax: "Core motivation", scaleMinFr: "Pas un facteur", scaleMaxFr: "Motivation principale" }),
	q("wv-15", "career_assessment", "Would you accept a lower salary for a more meaningful job?", "Accepteriez-vous un salaire plus bas pour un emploi plus significatif?", "work-values", "multiple_choice", "meaning_vs_money"),

	// =========================================================================
	// SITUATIONAL - MOROCCAN WORKPLACE (15 questions)
	// =========================================================================
	q("sit-1", "career_quiz", "Your manager asks you to stay overtime for an urgent project delivery in Casablanca. What do you do?", "Votre manager vous demande de rester en heures supplementaires pour une livraison urgente a Casablanca. Que faites-vous?", "situational", "multiple_choice", "commitment"),
	q("sit-2", "career_quiz", "During a construction site visit in Tangier, you notice a safety violation. What is your first action?", "Lors d'une visite de chantier a Tanger, vous remarquez une violation de securite. Quelle est votre premiere action?", "situational", "multiple_choice", "safety_awareness"),
	q("sit-3", "career_quiz", "A colleague at the factory in Kenitra is struggling with a task you know well. What do you do?", "Un collegue a l'usine de Kenitra a du mal avec une tache que vous maitrisez. Que faites-vous?", "situational", "multiple_choice", "teamwork"),
	q("sit-4", "career_quiz", "You discover an error in a financial report before it is sent to the client. What do you do?", "Vous decouvrez une erreur dans un rapport financier avant son envoi au client. Que faites-vous?", "situational", "multiple_choice", "integrity"),
	q("sit-5", "career_quiz", "Your team in Rabat disagrees on the approach to a project. As team lead, how do you proceed?", "Votre equipe a Rabat est en desaccord sur l'approche d'un projet. En tant que chef d'equipe, comment procedez-vous?", "situational", "multiple_choice", "leadership"),
	q("sit-6", "career_quiz", "A client in Marrakech is unhappy with the product quality. How do you handle it?", "Un client a Marrakech est mecontent de la qualite du produit. Comment gerez-vous la situation?", "situational", "multiple_choice", "customer_service"),
	q("sit-7", "career_quiz", "You are offered a promotion but it means moving from Casablanca to Agadir. What do you consider?", "On vous offre une promotion mais elle implique un demenagement de Casablanca a Agadir. Que considerez-vous?", "situational", "multiple_choice", "career_growth"),
	q("sit-8", "career_quiz", "During Ramadan, your team's productivity drops. As a manager, what do you do?", "Pendant le Ramadan, la productivite de votre equipe baisse. En tant que manager, que faites-vous?", "situational", "multiple_choice", "cultural_sensitivity"),
	q("sit-9", "career_quiz", "A supplier in the Tanger Med free zone delivers materials late. How do you respond?", "Un fournisseur dans la zone franche de Tanger Med livre en retard. Comment reagissez-vous?", "situational", "multiple_choice", "supply_chain"),
	q("sit-10", "career_quiz", "You need to present a project to senior executives in French. How do you prepare?", "Vous devez presenter un projet aux dirigeants en francais. Comment vous preparez-vous?", "situational", "multiple_choice", "presentation"),

	q("sit-11", "career_quiz", "Your internship company in Fez offers you a full-time position, but the salary is below market rate. What do you do?", "Votre entreprise de stage a Fes vous offre un CDI mais le salaire est en dessous du marche. Que faites-vous?", "situational", "multiple_choice", "negotiation"),
	q("sit-12", "career_quiz", "A server goes down at 2 AM affecting thousands of users. As the on-call engineer, what do you do first?", "Un serveur tombe a 2h du matin affectant des milliers d'utilisateurs. En tant qu'ingenieur d'astreinte, que faites-vous d'abord?", "situational", "multiple_choice", "incident_response"),
	q("sit-13", "career_quiz", "Your company wants to implement a new ERP system. As project manager, how do you begin?", "Votre entreprise veut implementer un nouveau ERP. En tant que chef de projet, comment commencez-vous?", "situational", "multiple_choice", "change_management"),
	q("sit-14", "career_quiz", "A machine on the production line in Mohammedia shows abnormal vibrations. What action do you take?", "Une machine sur la ligne de production a Mohammedia presente des vibrations anormales. Quelle action prenez-vous?", "situational", "multiple_choice", "technical_judgment"),
	q("sit-15", "career_quiz", "You discover that a colleague is falsifying quality control reports. What do you do?", "Vous decouvrez qu'un collegue falsifie les rapports de controle qualite. Que faites-vous?", "situational", "multiple_choice", "ethics"),

	// =========================================================================
	// ENTREPRENEURSHIP (10 questions)
	// =========================================================================
	q("ent-1", "career_quiz", "What type of business would you start in Morocco?", "Quel type d'entreprise lanceriez-vous au Maroc?", "entrepreneurship", "multiple_choice", "business_type"),
	q("ent-2", "career_quiz", "How would you fund your startup?", "Comment financeriez-vous votre startup?", "entrepreneurship", "multiple_choice", "funding_strategy"),
	q("ent-3", "career_quiz", "What is your biggest fear about starting a business?", "Quelle est votre plus grande peur concernant la creation d'entreprise?", "entrepreneurship", "multiple_choice", "risk_perception"),
	q("ent-4", "career_quiz", "How many years would you work in industry before starting your own company?", "Combien d'annees travailleriez-vous en entreprise avant de creer la votre?", "entrepreneurship", "multiple_choice", "timeline"),
	q("ent-5", "career_quiz", "Which Moroccan startup ecosystem excites you?", "Quel ecosysteme startup marocain vous enthousiasme?", "entrepreneurship", "multiple_choice", "ecosystem"),
	q("ent-6", "career_quiz", "How comfortable are you with financial uncertainty?", "A quel point etes-vous a l'aise avec l'incertitude financiere?", "entrepreneurship", "scale", "uncertainty_tolerance", { scaleMin: "Very uncomfortable", scaleMax: "Comfortable with it", scaleMinFr: "Tres inconfortable", scaleMaxFr: "A l'aise avec ca" }),
	q("ent-7", "career_quiz", "What is your approach to building a team?", "Quelle est votre approche pour construire une equipe?", "entrepreneurship", "multiple_choice", "team_building"),
	q("ent-8", "career_quiz", "How do you handle failure?", "Comment gerez-vous l'echec?", "entrepreneurship", "multiple_choice", "failure_response"),
	q("ent-9", "career_quiz", "Which support would be most valuable for your entrepreneurial journey?", "Quel support serait le plus precieux pour votre parcours entrepreneurial?", "entrepreneurship", "multiple_choice", "support_need"),
	q("ent-10", "career_quiz", "How ready are you to be an entrepreneur today?", "A quel point etes-vous pret(e) a etre entrepreneur aujourd'hui?", "entrepreneurship", "scale", "readiness", { scaleMin: "Not ready at all", scaleMax: "Ready to start now", scaleMinFr: "Pas du tout pret(e)", scaleMaxFr: "Pret(e) a commencer maintenant" }),

	// =========================================================================
	// PERSONALITY (5 extra questions)
	// =========================================================================
	q("per-1", "career_assessment", "How do you recharge after a stressful day?", "Comment rechargez-vous apres une journee stressante?", "personality", "multiple_choice", "introversion_extraversion"),
	q("per-2", "career_assessment", "When making decisions, do you rely more on logic or intuition?", "Quand vous prenez des decisions, vous fiez-vous plus a la logique ou a l'intuition?", "personality", "scale", "logic_vs_intuition", { scaleMin: "Pure logic", scaleMax: "Strong intuition", scaleMinFr: "Pure logique", scaleMaxFr: "Forte intuition" }),
	q("per-3", "career_assessment", "How do you feel about routine work?", "Que pensez-vous du travail routinier?", "personality", "scale", "routine_tolerance", { scaleMin: "I hate routine", scaleMax: "I find comfort in routine", scaleMinFr: "Je deteste la routine", scaleMaxFr: "Je trouve du confort dans la routine" }),
	q("per-4", "career_assessment", "Are you more of a specialist or a generalist?", "Etes-vous plus specialiste ou generaliste?", "personality", "scale", "specialist_vs_generalist", { scaleMin: "Deep specialist", scaleMax: "Broad generalist", scaleMinFr: "Specialiste approfondi", scaleMaxFr: "Generaliste large" }),
	q("per-5", "career_assessment", "How competitive are you?", "A quel point etes-vous competitif/competitive?", "personality", "scale", "competitiveness", { scaleMin: "Very collaborative", scaleMax: "Highly competitive", scaleMinFr: "Tres collaboratif/ve", scaleMaxFr: "Tres competitif/ve" }),
];

// ============================================================================
// OPTIONS for multiple_choice questions
// ============================================================================

const OPTIONS = [
	// ---- co-1: work environment ----
	opt("co-1-a", "co-1", "A quiet office with focused individual work", "Un bureau calme avec du travail individuel concentre", "DesktopIcon", { analytical: 3, technical_aptitude: 2 }, 1),
	opt("co-1-b", "co-1", "A dynamic open space with constant collaboration", "Un open space dynamique avec collaboration constante", "UsersIcon", { teamwork: 3, communication: 2, leadership: 1 }, 2),
	opt("co-1-c", "co-1", "An outdoor environment like a construction site or field", "Un environnement exterieur comme un chantier ou terrain", "HardHatIcon", { physical_endurance: 3, safety_focus: 2 }, 3),
	opt("co-1-d", "co-1", "A laboratory or workshop with hands-on experimentation", "Un laboratoire ou atelier avec de l'experimentation pratique", "FlaskIcon", { technical_aptitude: 3, attention_to_detail: 2, analytical: 1 }, 4),

	// ---- co-2: problem solving ----
	opt("co-2-a", "co-2", "Break it down into smaller parts and analyze each", "Le decomposer en parties plus petites et analyser chacune", "ChartBarIcon", { analytical: 3, attention_to_detail: 2 }, 1),
	opt("co-2-b", "co-2", "Brainstorm with the team to explore solutions", "Faire un brainstorming avec l'equipe pour explorer les solutions", "UsersIcon", { teamwork: 3, communication: 2, creativity: 1 }, 2),
	opt("co-2-c", "co-2", "Look for precedents or established procedures", "Chercher des precedents ou des procedures etablies", "BookOpenIcon", { safety_focus: 2, attention_to_detail: 2, analytical: 1 }, 3),
	opt("co-2-d", "co-2", "Trust my gut and take decisive action", "Faire confiance a mon instinct et agir de maniere decisive", "RocketLaunchIcon", { leadership: 3, stress_tolerance: 2, risk_tolerance: 1 }, 4),

	// ---- co-3: motivation ----
	opt("co-3-a", "co-3", "Making a positive impact on people's lives", "Avoir un impact positif sur la vie des gens", "HeartIcon", { patient_care: 3, values: 2, communication: 1 }, 1),
	opt("co-3-b", "co-3", "Solving complex technical challenges", "Resoudre des defis techniques complexes", "GearIcon", { technical_aptitude: 3, analytical: 2 }, 2),
	opt("co-3-c", "co-3", "Financial rewards and career advancement", "Les recompenses financieres et l'avancement de carriere", "TrendingUpIcon", { salary_priority: 3, leadership: 1 }, 3),
	opt("co-3-d", "co-3", "Creating something innovative and new", "Creer quelque chose d'innovant et de nouveau", "LightbulbIcon", { creativity: 3, entrepreneurship: 2 }, 4),

	// ---- co-4: learning style ----
	opt("co-4-a", "co-4", "Reading documentation and online courses", "Lire la documentation et suivre des cours en ligne", "BookOpenIcon", { analytical: 2, digital_literacy: 2 }, 1),
	opt("co-4-b", "co-4", "Hands-on practice and trial-and-error", "Pratique concrete et apprentissage par essai-erreur", "WrenchIcon", { technical_aptitude: 3, physical_endurance: 1 }, 2),
	opt("co-4-c", "co-4", "Working with a mentor or experienced colleague", "Travailler avec un mentor ou collegue experimente", "UserPlusIcon", { mentorship_value: 3, teamwork: 1 }, 3),
	opt("co-4-d", "co-4", "Group workshops and collaborative learning", "Ateliers en groupe et apprentissage collaboratif", "UsersIcon", { teamwork: 3, communication: 2 }, 4),

	// ---- co-5: career impact ----
	opt("co-5-a", "co-5", "Build infrastructure that serves millions of Moroccans", "Construire des infrastructures qui servent des millions de Marocains", "BuildingsIcon", { technical_aptitude: 2, national_contribution: 3, safety_focus: 1 }, 1),
	opt("co-5-b", "co-5", "Create technology that transforms industries", "Creer de la technologie qui transforme les industries", "GearIcon", { technical_aptitude: 3, creativity: 2, entrepreneurship: 1 }, 2),
	opt("co-5-c", "co-5", "Help people achieve better health and well-being", "Aider les gens a avoir une meilleure sante et bien-etre", "HeartIcon", { patient_care: 3, communication: 2 }, 3),
	opt("co-5-d", "co-5", "Drive economic growth and create jobs", "Favoriser la croissance economique et creer des emplois", "TrendingUpIcon", { leadership: 3, entrepreneurship: 2, financial_aptitude: 1 }, 4),

	// ---- co-6: tight deadlines ----
	opt("co-6-a", "co-6", "I plan ahead to avoid last-minute pressure", "Je planifie en avance pour eviter la pression de derniere minute", "ClockIcon", { time_management: 3, attention_to_detail: 2 }, 1),
	opt("co-6-b", "co-6", "I thrive under pressure - it brings out my best", "Je m'epanouis sous pression - ca revele le meilleur de moi", "RocketLaunchIcon", { stress_tolerance: 3, leadership: 1 }, 2),
	opt("co-6-c", "co-6", "I delegate tasks and coordinate with the team", "Je delegue les taches et coordonne avec l'equipe", "UsersIcon", { leadership: 3, teamwork: 2, communication: 1 }, 3),

	// ---- co-7: ideal workday ----
	opt("co-7-a", "co-7", "Coding, designing systems, or building prototypes all day", "Coder, concevoir des systemes ou construire des prototypes toute la journee", "CodeIcon", { technical_aptitude: 3, analytical: 2, creativity: 1 }, 1),
	opt("co-7-b", "co-7", "A mix of meetings, strategy, and decision-making", "Un melange de reunions, strategie et prise de decisions", "BriefcaseIcon", { leadership: 3, communication: 2, decision_making: 1 }, 2),
	opt("co-7-c", "co-7", "Hands-on work on a site, factory, or in the field", "Travail pratique sur un site, une usine ou sur le terrain", "HardHatIcon", { physical_endurance: 3, technical_aptitude: 2, safety_focus: 1 }, 3),
	opt("co-7-d", "co-7", "Analyzing data, writing reports, and conducting research", "Analyser des donnees, rediger des rapports et mener des recherches", "ChartBarIcon", { analytical: 3, attention_to_detail: 2, written_communication: 1 }, 4),

	// ---- co-9: project preference ----
	opt("co-9-a", "co-9", "Short sprints with quick results", "Sprints courts avec des resultats rapides", "SparkleIcon", { stress_tolerance: 2, technical_aptitude: 2, creativity: 1 }, 1),
	opt("co-9-b", "co-9", "Long-term programs with deep impact", "Programmes a long terme avec un impact profond", "TargetIcon", { patience: 3, project_management: 2, values: 1 }, 2),
	opt("co-9-c", "co-9", "A balance of both", "Un equilibre des deux", "BalanceIcon", { adaptability: 3, project_management: 1 }, 3),

	// ---- co-11: group role ----
	opt("co-11-a", "co-11", "The leader who sets direction", "Le leader qui fixe la direction", "CrownIcon", { leadership: 3, decision_making: 2 }, 1),
	opt("co-11-b", "co-11", "The organizer who plans and coordinates", "L'organisateur qui planifie et coordonne", "ClipboardIcon", { project_management: 3, attention_to_detail: 2 }, 2),
	opt("co-11-c", "co-11", "The creative who generates ideas", "Le creatif qui genere des idees", "LightbulbIcon", { creativity: 3, analytical: 1 }, 3),
	opt("co-11-d", "co-11", "The executor who gets things done", "L'executant qui realise les choses", "WrenchIcon", { technical_aptitude: 3, physical_endurance: 1, stress_tolerance: 1 }, 4),

	// ---- co-12: idea rejected ----
	opt("co-12-a", "co-12", "I listen to feedback and improve my idea", "J'ecoute les retours et j'ameliore mon idee", "ArrowUpIcon", { feedback_reception: 3, adaptability: 2 }, 1),
	opt("co-12-b", "co-12", "I defend my position with additional evidence", "Je defends ma position avec des preuves supplementaires", "ShieldCheckIcon", { analytical: 2, communication: 2, confidence: 1 }, 2),
	opt("co-12-c", "co-12", "I accept and support the team's decision", "J'accepte et je soutiens la decision de l'equipe", "UsersIcon", { teamwork: 3, adaptability: 1 }, 3),

	// ---- co-13: favorite subject ----
	opt("co-13-a", "co-13", "Mathematics and Physics", "Mathematiques et Physique", "CalculatorIcon", { analytical: 3, technical_aptitude: 2, math_skills: 2 }, 1),
	opt("co-13-b", "co-13", "Computer Science and Technology", "Informatique et Technologie", "CodeIcon", { technical_aptitude: 3, digital_literacy: 2, creativity: 1 }, 2),
	opt("co-13-c", "co-13", "Biology and Chemistry", "Biologie et Chimie", "FlaskIcon", { patient_care: 2, attention_to_detail: 2, analytical: 1 }, 3),
	opt("co-13-d", "co-13", "Economics and Management", "Economie et Gestion", "BriefcaseIcon", { financial_aptitude: 3, leadership: 2, analytical: 1 }, 4),

	// ---- co-15: two job offers ----
	opt("co-15-a", "co-15", "Choose the one with higher salary and benefits", "Choisir celle avec le meilleur salaire et avantages", "TrendingUpIcon", { salary_priority: 3 }, 1),
	opt("co-15-b", "co-15", "Choose the one with better learning opportunities", "Choisir celle avec de meilleures opportunites d'apprentissage", "BookOpenIcon", { continuous_learning: 3, mentorship_value: 1 }, 2),
	opt("co-15-c", "co-15", "Choose the one aligned with my long-term goals", "Choisir celle alignee avec mes objectifs a long terme", "TargetIcon", { values: 3, decision_making: 2 }, 3),
	opt("co-15-d", "co-15", "Choose the one with the best company culture", "Choisir celle avec la meilleure culture d'entreprise", "UsersIcon", { culture_fit: 3, teamwork: 1 }, 4),

	// ---- co-17: create vs improve ----
	opt("co-17-a", "co-17", "Creating new things from scratch", "Creer de nouvelles choses a partir de zero", "SparkleIcon", { creativity: 3, entrepreneurship: 2 }, 1),
	opt("co-17-b", "co-17", "Improving and optimizing existing systems", "Ameliorer et optimiser les systemes existants", "GearIcon", { analytical: 3, attention_to_detail: 2, process_optimization: 1 }, 2),
	opt("co-17-c", "co-17", "Both equally", "Les deux egalement", "BalanceIcon", { adaptability: 2, creativity: 1, analytical: 1 }, 3),

	// ---- co-18: organization ----
	opt("co-18-a", "co-18", "Digital tools: apps, calendars, project management software", "Outils numeriques: apps, calendriers, logiciels de gestion de projet", "DesktopIcon", { digital_literacy: 3, time_management: 2 }, 1),
	opt("co-18-b", "co-18", "Written lists, notebooks, and physical planners", "Listes ecrites, carnets et agendas physiques", "ClipboardIcon", { attention_to_detail: 2, time_management: 2 }, 2),
	opt("co-18-c", "co-18", "I keep it all in my head - I'm naturally organized", "Je garde tout en tete - je suis naturellement organise(e)", "BrainIcon", { adaptability: 2, stress_tolerance: 1 }, 3),

	// ---- co-19: tech relationship ----
	opt("co-19-a", "co-19", "Tech is my passion - I code, build, and explore daily", "La tech est ma passion - je code, construis et explore chaque jour", "CodeIcon", { technical_aptitude: 3, digital_literacy: 3, creativity: 1 }, 1),
	opt("co-19-b", "co-19", "I use technology as a tool to be more effective", "J'utilise la technologie comme outil pour etre plus efficace", "GearIcon", { digital_literacy: 2, analytical: 1 }, 2),
	opt("co-19-c", "co-19", "I prefer traditional methods but can adapt", "Je prefere les methodes traditionnelles mais je peux m'adapter", "BookOpenIcon", { adaptability: 1, physical_endurance: 1 }, 3),

	// ---- fd-1: exciting activity ----
	opt("fd-1-a", "fd-1", "Building a web or mobile application", "Construire une application web ou mobile", "CodeIcon", { technical_aptitude: 3, digital_literacy: 2, creativity: 1 }, 1),
	opt("fd-1-b", "fd-1", "Designing a building or bridge", "Concevoir un batiment ou un pont", "BuildingsIcon", { technical_aptitude: 2, attention_to_detail: 2, safety_focus: 1 }, 2),
	opt("fd-1-c", "fd-1", "Optimizing a factory production line", "Optimiser une ligne de production d'usine", "GearIcon", { analytical: 3, process_optimization: 2, technical_aptitude: 1 }, 3),
	opt("fd-1-d", "fd-1", "Developing a marketing strategy for a new product", "Developper une strategie marketing pour un nouveau produit", "ChartBarIcon", { creativity: 3, communication: 2, leadership: 1 }, 4),

	// ---- fd-2: Morocco problem ----
	opt("fd-2-a", "fd-2", "Youth unemployment through technology and innovation", "Le chomage des jeunes par la technologie et l'innovation", "CodeIcon", { technical_aptitude: 2, entrepreneurship: 2, national_contribution: 2 }, 1),
	opt("fd-2-b", "fd-2", "Infrastructure and housing for growing cities", "Les infrastructures et le logement pour les villes en croissance", "BuildingsIcon", { technical_aptitude: 2, safety_focus: 1, national_contribution: 3 }, 2),
	opt("fd-2-c", "fd-2", "Water scarcity and renewable energy transition", "La rarete de l'eau et la transition energetique", "SunIcon", { technical_aptitude: 2, values: 2, national_contribution: 2 }, 3),
	opt("fd-2-d", "fd-2", "Education quality and access in rural areas", "La qualite et l'acces a l'education en zones rurales", "BookOpenIcon", { patient_care: 2, values: 3, communication: 1 }, 4),

	// ---- fd-3: Moroccan industry ----
	opt("fd-3-a", "fd-3", "Automotive (Renault, Stellantis in Tangier/Kenitra)", "Automobile (Renault, Stellantis a Tanger/Kenitra)", "GearIcon", { technical_aptitude: 3, process_optimization: 2 }, 1),
	opt("fd-3-b", "fd-3", "Phosphates and Mining (OCP Group)", "Phosphates et Mines (Groupe OCP)", "MountainIcon", { technical_aptitude: 2, safety_focus: 2, physical_endurance: 1 }, 2),
	opt("fd-3-c", "fd-3", "Technology and Digital Services (Casablanca Finance City)", "Technologie et Services Numeriques (Casablanca Finance City)", "CodeIcon", { technical_aptitude: 3, digital_literacy: 2, creativity: 1 }, 3),
	opt("fd-3-d", "fd-3", "Renewable Energy (MASEN solar projects)", "Energie Renouvelable (projets solaires MASEN)", "SunIcon", { technical_aptitude: 2, values: 2, national_contribution: 2 }, 4),

	// ---- fd-4: tools preference ----
	opt("fd-4-a", "fd-4", "Software: IDEs, databases, and cloud platforms", "Logiciels: IDE, bases de donnees et plateformes cloud", "CodeIcon", { technical_aptitude: 3, digital_literacy: 3 }, 1),
	opt("fd-4-b", "fd-4", "Engineering: CAD software, simulation tools", "Ingenierie: logiciels CAO, outils de simulation", "PencilRulerIcon", { technical_aptitude: 3, attention_to_detail: 2 }, 2),
	opt("fd-4-c", "fd-4", "Physical: machines, measuring instruments, lab equipment", "Physiques: machines, instruments de mesure, equipement de labo", "WrenchIcon", { physical_endurance: 2, technical_aptitude: 2, attention_to_detail: 1 }, 3),
	opt("fd-4-d", "fd-4", "Business: spreadsheets, analytics, presentation tools", "Business: tableurs, analytique, outils de presentation", "ChartBarIcon", { financial_aptitude: 2, analytical: 2, communication: 1 }, 4),

	// ---- fd-5: work location in Morocco ----
	opt("fd-5-a", "fd-5", "Casablanca - Business and tech hub", "Casablanca - Hub business et tech", "BuildingsIcon", { financial_aptitude: 2, technical_aptitude: 1, leadership: 1 }, 1),
	opt("fd-5-b", "fd-5", "Tangier/Kenitra - Industrial free zones", "Tanger/Kenitra - Zones franches industrielles", "GearIcon", { technical_aptitude: 2, process_optimization: 2 }, 2),
	opt("fd-5-c", "fd-5", "Rabat - Government and institutions", "Rabat - Gouvernement et institutions", "BuildingsIcon", { leadership: 2, values: 1, communication: 1 }, 3),
	opt("fd-5-d", "fd-5", "Marrakech/South - Tourism and renewable energy", "Marrakech/Sud - Tourisme et energie renouvelable", "SunIcon", { creativity: 2, values: 1, national_contribution: 1 }, 4),

	// ---- fd-6: project type ----
	opt("fd-6-a", "fd-6", "A software platform used by thousands", "Une plateforme logicielle utilisee par des milliers de personnes", "CodeIcon", { technical_aptitude: 3, digital_literacy: 2 }, 1),
	opt("fd-6-b", "fd-6", "A highway or dam construction project", "Un projet de construction d'autoroute ou de barrage", "BuildingsIcon", { physical_endurance: 2, safety_focus: 2, technical_aptitude: 1 }, 2),
	opt("fd-6-c", "fd-6", "An assembly line optimization at Renault Tangier", "Une optimisation de chaine de montage chez Renault Tanger", "GearIcon", { analytical: 3, process_optimization: 2, technical_aptitude: 1 }, 3),
	opt("fd-6-d", "fd-6", "A marketing campaign for a Moroccan brand going international", "Une campagne marketing pour une marque marocaine a l'international", "ChartBarIcon", { creativity: 3, communication: 2, international_mindset: 1 }, 4),

	// ---- fd-8: output satisfaction ----
	opt("fd-8-a", "fd-8", "A working application or digital product", "Une application ou un produit numerique fonctionnel", "CodeIcon", { technical_aptitude: 3, creativity: 2 }, 1),
	opt("fd-8-b", "fd-8", "A physical structure you can see and touch", "Une structure physique que vous pouvez voir et toucher", "BuildingsIcon", { physical_endurance: 2, technical_aptitude: 2, safety_focus: 1 }, 2),
	opt("fd-8-c", "fd-8", "Measurable improvement in efficiency or quality", "Une amelioration mesurable de l'efficacite ou de la qualite", "ChartBarIcon", { analytical: 3, process_optimization: 2 }, 3),
	opt("fd-8-d", "fd-8", "Positive impact on people or communities", "Un impact positif sur les personnes ou les communautes", "HeartIcon", { patient_care: 2, values: 3, communication: 1 }, 4),

	// ---- fd-9: company size ----
	opt("fd-9-a", "fd-9", "A startup (5-20 people) - wear many hats", "Une startup (5-20 personnes) - porter plusieurs casquettes", "RocketLaunchIcon", { entrepreneurship: 3, adaptability: 2, creativity: 1 }, 1),
	opt("fd-9-b", "fd-9", "A mid-size company (50-500) - structured but agile", "Une PME (50-500) - structuree mais agile", "BuildingsIcon", { teamwork: 2, leadership: 1, adaptability: 1 }, 2),
	opt("fd-9-c", "fd-9", "A large corporation (OCP, Renault, banks) - clear career path", "Une grande entreprise (OCP, Renault, banques) - parcours de carriere clair", "BuildingsIcon", { job_security: 2, process_optimization: 1, financial_aptitude: 1 }, 3),
	opt("fd-9-d", "fd-9", "A public institution or international organization", "Une institution publique ou organisation internationale", "ShieldCheckIcon", { values: 2, job_security: 2, national_contribution: 1 }, 4),

	// ---- fd-11: work pace ----
	opt("fd-11-a", "fd-11", "Fast-paced with constant change", "Rythme rapide avec des changements constants", "RocketLaunchIcon", { stress_tolerance: 3, adaptability: 2 }, 1),
	opt("fd-11-b", "fd-11", "Steady and predictable", "Regulier et previsible", "ClockIcon", { patience: 2, attention_to_detail: 2 }, 2),
	opt("fd-11-c", "fd-11", "Cyclical - busy periods and calm periods", "Cyclique - periodes chargees et periodes calmes", "ArrowsClockwiseIcon", { adaptability: 2, stress_tolerance: 1 }, 3),

	// ---- fd-12: client interaction ----
	opt("fd-12-a", "fd-12", "Frequent face-to-face meetings with clients", "Reunions frequentes en face a face avec les clients", "UsersIcon", { communication: 3, leadership: 1 }, 1),
	opt("fd-12-b", "fd-12", "Occasional contact through reports and presentations", "Contact occasionnel par rapports et presentations", "ClipboardIcon", { written_communication: 2, analytical: 1 }, 2),
	opt("fd-12-c", "fd-12", "Minimal client contact - internal technical work", "Contact minimal avec les clients - travail technique interne", "GearIcon", { technical_aptitude: 2, analytical: 2 }, 3),

	// ---- fd-13: Moroccan mega-projects ----
	opt("fd-13-a", "fd-13", "Noor Ouarzazate - World's largest solar power plant", "Noor Ouarzazate - Plus grande centrale solaire au monde", "SunIcon", { technical_aptitude: 2, values: 2, national_contribution: 2 }, 1),
	opt("fd-13-b", "fd-13", "LGV Al Boraq - Africa's first high-speed railway", "LGV Al Boraq - Premier TGV en Afrique", "TrainIcon", { technical_aptitude: 2, safety_focus: 1, national_contribution: 2 }, 2),
	opt("fd-13-c", "fd-13", "Tanger Med - Africa's largest port complex", "Tanger Med - Plus grand complexe portuaire d'Afrique", "ShipIcon", { process_optimization: 2, international_mindset: 2, leadership: 1 }, 3),
	opt("fd-13-d", "fd-13", "Casablanca Finance City - Regional financial hub", "Casablanca Finance City - Hub financier regional", "BuildingsIcon", { financial_aptitude: 3, international_mindset: 2, leadership: 1 }, 4),

	// ---- fd-15: team structure ----
	opt("fd-15-a", "fd-15", "Flat structure where everyone has a voice", "Structure plate ou chacun a son mot a dire", "UsersIcon", { teamwork: 3, communication: 2 }, 1),
	opt("fd-15-b", "fd-15", "Clear hierarchy with defined roles", "Hierarchie claire avec des roles definis", "ClipboardIcon", { structure_preference: 3, attention_to_detail: 1 }, 2),
	opt("fd-15-c", "fd-15", "Matrix organization - reporting to multiple leads", "Organisation matricielle - rapporter a plusieurs responsables", "GearIcon", { adaptability: 3, communication: 1 }, 3),

	// ---- fd-16: sustainability ----
	opt("fd-16-a", "fd-16", "Green energy and reducing carbon emissions", "Energie verte et reduction des emissions de carbone", "SunIcon", { values: 3, technical_aptitude: 1, national_contribution: 1 }, 1),
	opt("fd-16-b", "fd-16", "Sustainable manufacturing and waste reduction", "Fabrication durable et reduction des dechets", "GearIcon", { process_optimization: 3, values: 1 }, 2),
	opt("fd-16-c", "fd-16", "Social sustainability - fair wages, education access", "Durabilite sociale - salaires equitables, acces a l'education", "HeartIcon", { patient_care: 2, values: 3, communication: 1 }, 3),

	// ---- fd-18: high-paying sectors ----
	opt("fd-18-a", "fd-18", "IT and Software Development", "IT et Developpement Logiciel", "CodeIcon", { technical_aptitude: 3, digital_literacy: 2 }, 1),
	opt("fd-18-b", "fd-18", "Banking and Finance", "Banque et Finance", "TrendingUpIcon", { financial_aptitude: 3, analytical: 2 }, 2),
	opt("fd-18-c", "fd-18", "Mining and Heavy Industry (OCP, Managem)", "Mines et Industrie Lourde (OCP, Managem)", "MountainIcon", { physical_endurance: 2, technical_aptitude: 2, safety_focus: 1 }, 3),
	opt("fd-18-d", "fd-18", "Automotive and Aerospace (Tangier free zone)", "Automobile et Aeronautique (zone franche Tanger)", "GearIcon", { technical_aptitude: 3, process_optimization: 2 }, 4),

	// ---- fd-19: language priority ----
	opt("fd-19-a", "fd-19", "French - essential for most Moroccan companies", "Francais - essentiel pour la plupart des entreprises marocaines", "FlagIcon", { french_proficiency: 3, communication: 1 }, 1),
	opt("fd-19-b", "fd-19", "English - key for tech and international roles", "Anglais - cle pour les roles tech et internationaux", "GlobeIcon", { english_proficiency: 3, international_mindset: 2 }, 2),
	opt("fd-19-c", "fd-19", "Both French and English equally", "Francais et anglais a parts egales", "BookOpenIcon", { communication: 3, international_mindset: 1 }, 3),
	opt("fd-19-d", "fd-19", "Arabic (Darija included) for local business", "Arabe (Darija incluse) pour le business local", "FlagIcon", { communication: 2, national_contribution: 1 }, 4),

	// ---- ta-1: technical challenge ----
	opt("ta-1-a", "ta-1", "Building a scalable cloud application", "Construire une application cloud evolutive", "CodeIcon", { technical_aptitude: 3, digital_literacy: 2 }, 1),
	opt("ta-1-b", "ta-1", "Designing a structural system that withstands earthquakes", "Concevoir un systeme structurel resistant aux seismes", "BuildingsIcon", { technical_aptitude: 3, safety_focus: 2, math_skills: 1 }, 2),
	opt("ta-1-c", "ta-1", "Programming robots for an assembly line", "Programmer des robots pour une chaine de montage", "GearIcon", { technical_aptitude: 3, analytical: 2, process_optimization: 1 }, 3),
	opt("ta-1-d", "ta-1", "Designing an electrical grid for a new city", "Concevoir un reseau electrique pour une nouvelle ville", "LightningIcon", { technical_aptitude: 3, analytical: 2, safety_focus: 1 }, 4),

	// ---- ta-2: debugging approach ----
	opt("ta-2-a", "ta-2", "Systematically test each component in isolation", "Tester systematiquement chaque composant en isolation", "SearchIcon", { analytical: 3, attention_to_detail: 2 }, 1),
	opt("ta-2-b", "ta-2", "Read logs and error messages carefully", "Lire attentivement les logs et messages d'erreur", "BookOpenIcon", { attention_to_detail: 3, analytical: 1 }, 2),
	opt("ta-2-c", "ta-2", "Ask colleagues who might have seen similar issues", "Demander aux collegues qui ont pu voir des problemes similaires", "UsersIcon", { teamwork: 3, communication: 2 }, 3),
	opt("ta-2-d", "ta-2", "Use monitoring tools and data to pinpoint the issue", "Utiliser des outils de monitoring et des donnees pour cerner le probleme", "ChartBarIcon", { digital_literacy: 3, analytical: 2 }, 4),

	// ---- ta-3: programming paradigm ----
	opt("ta-3-a", "ta-3", "Object-Oriented - organized classes and inheritance", "Oriente Objet - classes et heritage organises", "GearIcon", { analytical: 2, attention_to_detail: 2 }, 1),
	opt("ta-3-b", "ta-3", "Functional - pure functions and immutability", "Fonctionnel - fonctions pures et immutabilite", "CodeIcon", { analytical: 3, math_skills: 1 }, 2),
	opt("ta-3-c", "ta-3", "I don't code yet, but I want to learn", "Je ne code pas encore, mais je veux apprendre", "BookOpenIcon", { continuous_learning: 2, digital_literacy: 1 }, 3),

	// ---- ta-4: CAD experience ----
	opt("ta-4-a", "ta-4", "I use AutoCAD/Revit/SolidWorks regularly", "J'utilise regulierement AutoCAD/Revit/SolidWorks", "PencilRulerIcon", { technical_aptitude: 3, attention_to_detail: 2 }, 1),
	opt("ta-4-b", "ta-4", "I've tried them in school projects", "Je les ai essayes dans des projets scolaires", "BookOpenIcon", { technical_aptitude: 2, continuous_learning: 1 }, 2),
	opt("ta-4-c", "ta-4", "Never used CAD tools", "Jamais utilise d'outils CAO", "XCircleIcon", { digital_literacy: 1 }, 3),

	// ---- ta-7: data analysis tools ----
	opt("ta-7-a", "ta-7", "Excel expert - pivot tables, formulas, VBA", "Expert Excel - tableaux croises, formules, VBA", "ChartBarIcon", { financial_aptitude: 2, analytical: 3 }, 1),
	opt("ta-7-b", "ta-7", "Python/R for data science", "Python/R pour la data science", "CodeIcon", { technical_aptitude: 3, analytical: 2 }, 2),
	opt("ta-7-c", "ta-7", "Power BI or Tableau for visualization", "Power BI ou Tableau pour la visualisation", "ChartBarIcon", { digital_literacy: 2, communication: 1, analytical: 1 }, 3),
	opt("ta-7-d", "ta-7", "Basic spreadsheets only", "Tableurs basiques uniquement", "ClipboardIcon", { digital_literacy: 1 }, 4),

	// ---- ta-8: math preference ----
	opt("ta-8-a", "ta-8", "Algebra and calculus", "Algebre et calcul", "CalculatorIcon", { math_skills: 3, analytical: 2 }, 1),
	opt("ta-8-b", "ta-8", "Statistics and probability", "Statistiques et probabilites", "ChartBarIcon", { analytical: 3, financial_aptitude: 1 }, 2),
	opt("ta-8-c", "ta-8", "Geometry and spatial reasoning", "Geometrie et raisonnement spatial", "PencilRulerIcon", { attention_to_detail: 2, technical_aptitude: 2 }, 3),
	opt("ta-8-d", "ta-8", "Applied math (optimization, modeling)", "Mathematiques appliquees (optimisation, modelisation)", "GearIcon", { analytical: 3, process_optimization: 2 }, 4),

	// ---- ta-10: system preference ----
	opt("ta-10-a", "ta-10", "Software systems (web, mobile, cloud)", "Systemes logiciels (web, mobile, cloud)", "CodeIcon", { technical_aptitude: 3, digital_literacy: 2 }, 1),
	opt("ta-10-b", "ta-10", "Mechanical systems (engines, machines)", "Systemes mecaniques (moteurs, machines)", "GearIcon", { technical_aptitude: 3, physical_endurance: 1 }, 2),
	opt("ta-10-c", "ta-10", "Electrical systems (circuits, power grids)", "Systemes electriques (circuits, reseaux electriques)", "LightningIcon", { technical_aptitude: 3, safety_focus: 1 }, 3),
	opt("ta-10-d", "ta-10", "Organizational systems (processes, logistics)", "Systemes organisationnels (processus, logistique)", "ClipboardIcon", { process_optimization: 3, leadership: 1, analytical: 1 }, 4),

	// ---- ta-11: learning new tech ----
	opt("ta-11-a", "ta-11", "Read the official documentation first", "Lire d'abord la documentation officielle", "BookOpenIcon", { attention_to_detail: 2, analytical: 2 }, 1),
	opt("ta-11-b", "ta-11", "Watch tutorials and follow along", "Regarder des tutoriels et suivre", "DesktopIcon", { digital_literacy: 2, continuous_learning: 2 }, 2),
	opt("ta-11-c", "ta-11", "Build a small project immediately", "Construire un petit projet immediatement", "RocketLaunchIcon", { technical_aptitude: 3, creativity: 1 }, 3),
	opt("ta-11-d", "ta-11", "Take a structured course or certification", "Suivre un cours structure ou une certification", "BookOpenIcon", { continuous_learning: 3, structure_preference: 1 }, 4),

	// ---- ta-12: engineering problem ----
	opt("ta-12-a", "ta-12", "Reducing energy consumption in buildings", "Reduire la consommation d'energie dans les batiments", "SunIcon", { values: 2, technical_aptitude: 2, analytical: 1 }, 1),
	opt("ta-12-b", "ta-12", "Making a production line 30% faster", "Rendre une ligne de production 30% plus rapide", "GearIcon", { process_optimization: 3, analytical: 2 }, 2),
	opt("ta-12-c", "ta-12", "Developing an algorithm that handles millions of users", "Developper un algorithme qui gere des millions d'utilisateurs", "CodeIcon", { technical_aptitude: 3, analytical: 2 }, 3),
	opt("ta-12-d", "ta-12", "Designing a water treatment plant for a rural area", "Concevoir une station de traitement d'eau pour une zone rurale", "BuildingsIcon", { values: 2, technical_aptitude: 2, national_contribution: 2 }, 4),

	// ---- ta-14: version control ----
	opt("ta-14-a", "ta-14", "I use Git/GitHub daily", "J'utilise Git/GitHub quotidiennement", "CodeIcon", { technical_aptitude: 3, digital_literacy: 2 }, 1),
	opt("ta-14-b", "ta-14", "I've used it for school projects", "Je l'ai utilise pour des projets scolaires", "BookOpenIcon", { technical_aptitude: 2, digital_literacy: 1 }, 2),
	opt("ta-14-c", "ta-14", "I know what it is but haven't used it", "Je sais ce que c'est mais je ne l'ai pas utilise", "BookOpenIcon", { continuous_learning: 1 }, 3),
	opt("ta-14-d", "ta-14", "What is version control?", "Qu'est-ce que le controle de version?", "QuestionMarkIcon", {}, 4),

	// ---- ta-15: QA attitude ----
	opt("ta-15-a", "ta-15", "Essential - quality should be built-in from the start", "Essentiel - la qualite doit etre integree des le depart", "ShieldCheckIcon", { attention_to_detail: 3, safety_focus: 2 }, 1),
	opt("ta-15-b", "ta-15", "Important but not my favorite part of the process", "Important mais pas ma partie preferee du processus", "ClipboardIcon", { attention_to_detail: 1, creativity: 1 }, 2),
	opt("ta-15-c", "ta-15", "I prefer building over testing", "Je prefere construire que tester", "RocketLaunchIcon", { creativity: 2, technical_aptitude: 1 }, 3),

	// ---- wv-3: public vs private ----
	opt("wv-3-a", "wv-3", "Public sector - stability, benefits, pensions", "Secteur public - stabilite, avantages, retraite", "ShieldCheckIcon", { job_security: 3, national_contribution: 1 }, 1),
	opt("wv-3-b", "wv-3", "Private sector - higher salary, faster growth", "Secteur prive - salaire plus eleve, croissance plus rapide", "TrendingUpIcon", { salary_priority: 2, career_growth: 2 }, 2),
	opt("wv-3-c", "wv-3", "International company operating in Morocco", "Entreprise internationale operant au Maroc", "GlobeIcon", { international_mindset: 3, salary_priority: 1 }, 3),
	opt("wv-3-d", "wv-3", "My own business / freelance", "Mon propre business / freelance", "RocketLaunchIcon", { entrepreneurship: 3, autonomy: 2 }, 4),

	// ---- wv-7: relocate in Morocco ----
	opt("wv-7-a", "wv-7", "Yes, absolutely, wherever the best opportunity is", "Oui, absolument, la ou se trouve la meilleure opportunite", "GlobeIcon", { adaptability: 3, career_growth: 2 }, 1),
	opt("wv-7-b", "wv-7", "Only to Casablanca, Rabat, or Tangier", "Seulement a Casablanca, Rabat ou Tanger", "BuildingsIcon", { adaptability: 1, job_security: 1 }, 2),
	opt("wv-7-c", "wv-7", "No, I want to stay near my family", "Non, je veux rester pres de ma famille", "HeartIcon", { values: 2, work_life_balance: 2 }, 3),

	// ---- wv-8: work abroad ----
	opt("wv-8-a", "wv-8", "Yes, I dream of working internationally", "Oui, je reve de travailler a l'international", "GlobeIcon", { international_mindset: 3, adaptability: 2 }, 1),
	opt("wv-8-b", "wv-8", "Only for a few years to gain experience", "Seulement quelques annees pour acquerir de l'experience", "ClockIcon", { international_mindset: 2, continuous_learning: 1 }, 2),
	opt("wv-8-c", "wv-8", "I prefer to build my career in Morocco", "Je prefere construire ma carriere au Maroc", "FlagIcon", { national_contribution: 3, values: 1 }, 3),

	// ---- wv-11: shift work ----
	opt("wv-11-a", "wv-11", "Fine - I can adapt to any schedule", "Pas de probleme - je peux m'adapter a tout horaire", "ClockIcon", { adaptability: 3, stress_tolerance: 1 }, 1),
	opt("wv-11-b", "wv-11", "I prefer regular 9-to-5 hours", "Je prefere les horaires reguliers 9h-17h", "SunIcon", { work_life_balance: 2, structure_preference: 2 }, 2),
	opt("wv-11-c", "wv-11", "I prefer flexible hours where I choose my schedule", "Je prefere des horaires flexibles ou je choisis mon emploi du temps", "ArrowsClockwiseIcon", { autonomy: 3, work_life_balance: 1 }, 3),

	// ---- wv-13: management relationship ----
	opt("wv-13-a", "wv-13", "Close coaching with regular feedback", "Coaching rapproche avec retour regulier", "UserPlusIcon", { mentorship_value: 3, continuous_learning: 1 }, 1),
	opt("wv-13-b", "wv-13", "Hands-off - give me goals and let me execute", "Non interventionniste - donnez-moi les objectifs et laissez-moi executer", "RocketLaunchIcon", { autonomy: 3, self_discipline: 2 }, 2),
	opt("wv-13-c", "wv-13", "Collaborative - we co-create solutions together", "Collaboratif - nous co-creons des solutions ensemble", "UsersIcon", { teamwork: 3, communication: 2 }, 3),

	// ---- wv-15: meaning vs money ----
	opt("wv-15-a", "wv-15", "Yes, meaning matters more than money", "Oui, le sens compte plus que l'argent", "HeartIcon", { values: 3, patient_care: 1 }, 1),
	opt("wv-15-b", "wv-15", "No, financial security comes first", "Non, la securite financiere prime", "TrendingUpIcon", { salary_priority: 3 }, 2),
	opt("wv-15-c", "wv-15", "It depends on the salary difference", "Cela depend de la difference de salaire", "BalanceIcon", { adaptability: 2, decision_making: 1 }, 3),

	// ---- sit-1: overtime request ----
	opt("sit-1-a", "sit-1", "I stay without hesitation - the team needs me", "Je reste sans hesitation - l'equipe a besoin de moi", "UsersIcon", { commitment: 3, teamwork: 2, stress_tolerance: 1 }, 1),
	opt("sit-1-b", "sit-1", "I negotiate - I'll stay tonight but need comp time", "Je negocie - je reste ce soir mais j'ai besoin de repos compensatoire", "BalanceIcon", { negotiation: 3, work_life_balance: 1 }, 2),
	opt("sit-1-c", "sit-1", "I suggest alternative solutions to meet the deadline", "Je propose des solutions alternatives pour respecter le delai", "LightbulbIcon", { creativity: 2, problem_solving: 2, leadership: 1 }, 3),

	// ---- sit-2: safety violation ----
	opt("sit-2-a", "sit-2", "Stop work immediately and secure the area", "Arreter les travaux immediatement et securiser la zone", "ShieldCheckIcon", { safety_focus: 3, leadership: 2 }, 1),
	opt("sit-2-b", "sit-2", "Document it and report to the site manager", "Le documenter et le signaler au chef de chantier", "ClipboardIcon", { attention_to_detail: 2, safety_focus: 2, communication: 1 }, 2),
	opt("sit-2-c", "sit-2", "Speak directly to the workers involved", "Parler directement aux ouvriers concernes", "UsersIcon", { communication: 3, safety_focus: 1, leadership: 1 }, 3),

	// ---- sit-3: helping colleague ----
	opt("sit-3-a", "sit-3", "Offer to help and show them how it's done", "Proposer d'aider et leur montrer comment faire", "UserPlusIcon", { teamwork: 3, teaching_ability: 2, communication: 1 }, 1),
	opt("sit-3-b", "sit-3", "Let them try first, then offer guidance if needed", "Les laisser essayer d'abord, puis offrir des conseils si necessaire", "ClockIcon", { teaching_ability: 2, patience: 2 }, 2),
	opt("sit-3-c", "sit-3", "Point them to documentation or resources", "Les orienter vers la documentation ou les ressources", "BookOpenIcon", { analytical: 1, autonomy: 1 }, 3),

	// ---- sit-4: financial error ----
	opt("sit-4-a", "sit-4", "Correct it immediately and inform my supervisor", "Le corriger immediatement et informer mon superieur", "ShieldCheckIcon", { integrity: 3, attention_to_detail: 2 }, 1),
	opt("sit-4-b", "sit-4", "Fix it quietly - no need to escalate for a small error", "Le corriger discretement - pas besoin d'escalader pour une petite erreur", "WrenchIcon", { problem_solving: 1, autonomy: 1 }, 2),
	opt("sit-4-c", "sit-4", "Review the entire report for more potential errors first", "Revoir l'ensemble du rapport pour d'autres erreurs potentielles d'abord", "SearchIcon", { attention_to_detail: 3, analytical: 2 }, 3),

	// ---- sit-5: team disagreement ----
	opt("sit-5-a", "sit-5", "Listen to all sides and make a data-driven decision", "Ecouter toutes les parties et prendre une decision basee sur les donnees", "ChartBarIcon", { leadership: 3, analytical: 2, decision_making: 1 }, 1),
	opt("sit-5-b", "sit-5", "Let the team vote and go with majority", "Laisser l'equipe voter et suivre la majorite", "UsersIcon", { teamwork: 3, communication: 1 }, 2),
	opt("sit-5-c", "sit-5", "Propose a compromise that incorporates elements from each", "Proposer un compromis qui integre des elements de chacun", "BalanceIcon", { negotiation: 3, creativity: 1, leadership: 1 }, 3),

	// ---- sit-6: unhappy client ----
	opt("sit-6-a", "sit-6", "Listen empathetically and propose a concrete action plan", "Ecouter avec empathie et proposer un plan d'action concret", "HeartIcon", { communication: 3, problem_solving: 2, patient_care: 1 }, 1),
	opt("sit-6-b", "sit-6", "Investigate the root cause before responding", "Enqueter sur la cause racine avant de repondre", "SearchIcon", { analytical: 3, attention_to_detail: 2 }, 2),
	opt("sit-6-c", "sit-6", "Escalate to my manager for support", "Escalader a mon manager pour du soutien", "ArrowUpIcon", { teamwork: 1, communication: 1 }, 3),

	// ---- sit-7: promotion with relocation ----
	opt("sit-7-a", "sit-7", "The career growth opportunity is most important", "L'opportunite de croissance professionnelle est la plus importante", "TrendingUpIcon", { career_growth: 3, adaptability: 2 }, 1),
	opt("sit-7-b", "sit-7", "Quality of life in the new city matters most", "La qualite de vie dans la nouvelle ville compte le plus", "SunIcon", { work_life_balance: 3, values: 1 }, 2),
	opt("sit-7-c", "sit-7", "The salary increase needs to justify the move", "L'augmentation de salaire doit justifier le demenagement", "TrendingUpIcon", { salary_priority: 3, financial_aptitude: 1 }, 3),

	// ---- sit-8: Ramadan productivity ----
	opt("sit-8-a", "sit-8", "Adjust schedules to respect fasting hours and traditions", "Ajuster les horaires pour respecter les heures de jeune et les traditions", "ClockIcon", { cultural_sensitivity: 3, values: 2, leadership: 1 }, 1),
	opt("sit-8-b", "sit-8", "Maintain normal expectations but allow flexible breaks", "Maintenir les attentes normales mais permettre des pauses flexibles", "BalanceIcon", { leadership: 2, adaptability: 1 }, 2),
	opt("sit-8-c", "sit-8", "Focus on planning and training rather than heavy production", "Se concentrer sur la planification et la formation plutot que la production intensive", "BookOpenIcon", { leadership: 3, teaching_ability: 1, creativity: 1 }, 3),

	// ---- sit-9: late supplier ----
	opt("sit-9-a", "sit-9", "Contact supplier immediately and negotiate a recovery plan", "Contacter le fournisseur immediatement et negocier un plan de rattrapage", "PhoneIcon", { communication: 3, negotiation: 2, problem_solving: 1 }, 1),
	opt("sit-9-b", "sit-9", "Activate backup suppliers from the contingency plan", "Activer les fournisseurs de secours du plan de contingence", "ShieldCheckIcon", { process_optimization: 3, risk_management: 2 }, 2),
	opt("sit-9-c", "sit-9", "Document the delay and apply contractual penalties", "Documenter le retard et appliquer les penalites contractuelles", "ClipboardIcon", { attention_to_detail: 2, integrity: 2, financial_aptitude: 1 }, 3),

	// ---- sit-10: French presentation ----
	opt("sit-10-a", "sit-10", "Write a detailed script and practice multiple times", "Ecrire un script detaille et pratiquer plusieurs fois", "ClipboardIcon", { attention_to_detail: 3, french_proficiency: 1 }, 1),
	opt("sit-10-b", "sit-10", "Prepare strong visuals and know key points", "Preparer de bons visuels et connaitre les points cles", "ChartBarIcon", { communication: 3, creativity: 1 }, 2),
	opt("sit-10-c", "sit-10", "Practice with a colleague who can give feedback", "Pratiquer avec un collegue qui peut donner un retour", "UsersIcon", { teamwork: 2, communication: 2, feedback_reception: 1 }, 3),

	// ---- sit-11: below-market offer ----
	opt("sit-11-a", "sit-11", "Accept and negotiate a salary review after 6 months", "Accepter et negocier une revision salariale apres 6 mois", "BalanceIcon", { negotiation: 3, career_growth: 1 }, 1),
	opt("sit-11-b", "sit-11", "Decline and continue job searching", "Refuser et continuer la recherche d'emploi", "XCircleIcon", { salary_priority: 2, confidence: 2 }, 2),
	opt("sit-11-c", "sit-11", "Accept if the learning opportunities are exceptional", "Accepter si les opportunites d'apprentissage sont exceptionnelles", "BookOpenIcon", { continuous_learning: 3, values: 1 }, 3),

	// ---- sit-12: server down at 2 AM ----
	opt("sit-12-a", "sit-12", "Assess severity, restore service, then investigate root cause", "Evaluer la gravite, restaurer le service, puis enqueter sur la cause", "ShieldCheckIcon", { stress_tolerance: 3, analytical: 2, technical_aptitude: 1 }, 1),
	opt("sit-12-b", "sit-12", "Call the senior engineer and escalate immediately", "Appeler l'ingenieur senior et escalader immediatement", "PhoneIcon", { teamwork: 2, communication: 2 }, 2),
	opt("sit-12-c", "sit-12", "Check monitoring dashboards and follow runbook procedures", "Verifier les tableaux de bord de monitoring et suivre les procedures du runbook", "ChartBarIcon", { attention_to_detail: 3, process_optimization: 1 }, 3),

	// ---- sit-13: ERP implementation ----
	opt("sit-13-a", "sit-13", "Map current processes and identify gaps before choosing a solution", "Cartographier les processus actuels et identifier les lacunes avant de choisir une solution", "SearchIcon", { analytical: 3, process_optimization: 2, leadership: 1 }, 1),
	opt("sit-13-b", "sit-13", "Form a cross-functional team and plan change management", "Former une equipe transversale et planifier la gestion du changement", "UsersIcon", { leadership: 3, teamwork: 2, communication: 1 }, 2),
	opt("sit-13-c", "sit-13", "Benchmark similar implementations at other Moroccan companies", "Benchmarker des implementations similaires dans d'autres entreprises marocaines", "ChartBarIcon", { analytical: 2, communication: 1, process_optimization: 1 }, 3),

	// ---- sit-14: machine vibrations ----
	opt("sit-14-a", "sit-14", "Stop the machine immediately and run diagnostic tests", "Arreter la machine immediatement et effectuer des tests diagnostiques", "ShieldCheckIcon", { safety_focus: 3, technical_aptitude: 2, attention_to_detail: 1 }, 1),
	opt("sit-14-b", "sit-14", "Monitor for 30 minutes and compare to baseline readings", "Surveiller pendant 30 minutes et comparer aux mesures de reference", "ChartBarIcon", { analytical: 3, attention_to_detail: 2 }, 2),
	opt("sit-14-c", "sit-14", "Call the maintenance team and document observations", "Appeler l'equipe de maintenance et documenter les observations", "ClipboardIcon", { teamwork: 2, communication: 2, safety_focus: 1 }, 3),

	// ---- sit-15: quality report falsification ----
	opt("sit-15-a", "sit-15", "Report to management immediately - safety is non-negotiable", "Signaler a la direction immediatement - la securite n'est pas negociable", "ShieldCheckIcon", { integrity: 3, safety_focus: 3, courage: 1 }, 1),
	opt("sit-15-b", "sit-15", "Talk to the colleague privately first to understand why", "Parler au collegue en prive d'abord pour comprendre pourquoi", "UsersIcon", { communication: 2, empathy: 2, integrity: 1 }, 2),
	opt("sit-15-c", "sit-15", "Use the anonymous ethics hotline if available", "Utiliser la ligne ethique anonyme si disponible", "PhoneIcon", { integrity: 2, safety_focus: 1 }, 3),

	// ---- ent-1: business type ----
	opt("ent-1-a", "ent-1", "A tech startup solving a local problem", "Une startup tech resolvant un probleme local", "CodeIcon", { entrepreneurship: 3, technical_aptitude: 2, creativity: 1 }, 1),
	opt("ent-1-b", "ent-1", "An engineering consultancy firm", "Un cabinet de conseil en ingenierie", "BuildingsIcon", { technical_aptitude: 2, leadership: 2, financial_aptitude: 1 }, 2),
	opt("ent-1-c", "ent-1", "An import/export business leveraging Morocco's position", "Une entreprise d'import/export tirant parti de la position du Maroc", "GlobeIcon", { international_mindset: 3, financial_aptitude: 2, negotiation: 1 }, 3),
	opt("ent-1-d", "ent-1", "A social enterprise creating community impact", "Une entreprise sociale creant un impact communautaire", "HeartIcon", { values: 3, creativity: 1, national_contribution: 2 }, 4),

	// ---- ent-2: funding ----
	opt("ent-2-a", "ent-2", "Personal savings and family support", "Epargne personnelle et soutien familial", "HeartIcon", { financial_aptitude: 1, risk_tolerance: 2 }, 1),
	opt("ent-2-b", "ent-2", "Maroc Numeric Fund or government programs", "Fonds Maroc Numeric ou programmes gouvernementaux", "ShieldCheckIcon", { national_contribution: 2, financial_aptitude: 1 }, 2),
	opt("ent-2-c", "ent-2", "Angel investors or venture capital", "Business angels ou capital-risque", "TrendingUpIcon", { communication: 2, financial_aptitude: 2, risk_tolerance: 1 }, 3),
	opt("ent-2-d", "ent-2", "Bootstrap - start small and grow organically", "Bootstrap - commencer petit et grandir organiquement", "RocketLaunchIcon", { patience: 2, entrepreneurship: 2, financial_aptitude: 1 }, 4),

	// ---- ent-3: biggest fear ----
	opt("ent-3-a", "ent-3", "Financial failure and debt", "L'echec financier et les dettes", "TrendingUpIcon", { financial_aptitude: 1, risk_tolerance: 1 }, 1),
	opt("ent-3-b", "ent-3", "Not finding customers or product-market fit", "Ne pas trouver de clients ou l'adequation produit-marche", "SearchIcon", { analytical: 2, communication: 1 }, 2),
	opt("ent-3-c", "ent-3", "Bureaucracy and administrative challenges in Morocco", "La bureaucratie et les defis administratifs au Maroc", "ClipboardIcon", { patience: 1, adaptability: 1 }, 3),
	opt("ent-3-d", "ent-3", "Letting down my family or partners", "Decevoir ma famille ou mes associes", "HeartIcon", { values: 2, integrity: 2 }, 4),

	// ---- ent-4: years before starting ----
	opt("ent-4-a", "ent-4", "0-2 years - I want to start as soon as possible", "0-2 ans - je veux commencer le plus tot possible", "RocketLaunchIcon", { entrepreneurship: 3, risk_tolerance: 2 }, 1),
	opt("ent-4-b", "ent-4", "3-5 years - enough to build expertise", "3-5 ans - assez pour construire une expertise", "BookOpenIcon", { entrepreneurship: 2, patience: 2, technical_aptitude: 1 }, 2),
	opt("ent-4-c", "ent-4", "5-10 years - I need deep industry experience", "5-10 ans - j'ai besoin d'une experience approfondie", "ClockIcon", { patience: 3, analytical: 1 }, 3),
	opt("ent-4-d", "ent-4", "Maybe never - I prefer being an employee", "Peut-etre jamais - je prefere etre employe(e)", "BuildingsIcon", { job_security: 3, structure_preference: 1 }, 4),

	// ---- ent-5: startup ecosystem ----
	opt("ent-5-a", "ent-5", "Casablanca Technopark", "Technopark Casablanca", "BuildingsIcon", { entrepreneurship: 2, digital_literacy: 1 }, 1),
	opt("ent-5-b", "ent-5", "UM6P / 1337 (Ben Guerir/Khouribga)", "UM6P / 1337 (Ben Guerir/Khouribga)", "BookOpenIcon", { technical_aptitude: 2, entrepreneurship: 1 }, 2),
	opt("ent-5-c", "ent-5", "Tangier Free Zone / industrial ecosystem", "Zone Franche de Tanger / ecosysteme industriel", "GearIcon", { technical_aptitude: 1, international_mindset: 2 }, 3),

	// ---- ent-7: team building ----
	opt("ent-7-a", "ent-7", "Hire the best talent and empower them", "Recruter les meilleurs talents et leur donner les moyens", "UsersIcon", { leadership: 3, communication: 1 }, 1),
	opt("ent-7-b", "ent-7", "Start with co-founders who complement my skills", "Commencer avec des co-fondateurs qui completent mes competences", "UserPlusIcon", { teamwork: 3, self_awareness: 1 }, 2),
	opt("ent-7-c", "ent-7", "Keep it lean - outsource non-core functions", "Rester lean - externaliser les fonctions non essentielles", "RocketLaunchIcon", { financial_aptitude: 2, process_optimization: 1 }, 3),

	// ---- ent-8: handling failure ----
	opt("ent-8-a", "ent-8", "Analyze what went wrong and try again smarter", "Analyser ce qui n'a pas marche et reessayer plus intelligemment", "ChartBarIcon", { analytical: 3, resilience: 2, feedback_reception: 1 }, 1),
	opt("ent-8-b", "ent-8", "See failure as a learning experience and move forward", "Voir l'echec comme une experience d'apprentissage et avancer", "RocketLaunchIcon", { resilience: 3, adaptability: 2 }, 2),
	opt("ent-8-c", "ent-8", "Seek advice from mentors and peers", "Chercher des conseils aupres de mentors et pairs", "UsersIcon", { mentorship_value: 3, communication: 1 }, 3),

	// ---- ent-9: valuable support ----
	opt("ent-9-a", "ent-9", "A mentor who has built a successful business in Morocco", "Un mentor qui a construit une entreprise prospere au Maroc", "UserPlusIcon", { mentorship_value: 3, national_contribution: 1 }, 1),
	opt("ent-9-b", "ent-9", "Access to funding and financial resources", "Acces au financement et aux ressources financieres", "TrendingUpIcon", { financial_aptitude: 2, entrepreneurship: 1 }, 2),
	opt("ent-9-c", "ent-9", "Technical training and skill development", "Formation technique et developpement des competences", "BookOpenIcon", { continuous_learning: 3, technical_aptitude: 1 }, 3),
	opt("ent-9-d", "ent-9", "A strong network of contacts and potential clients", "Un reseau solide de contacts et clients potentiels", "UsersIcon", { networking: 3, communication: 1 }, 4),

	// ---- per-1: recharging ----
	opt("per-1-a", "per-1", "Quiet time alone - reading, walking, or reflecting", "Du temps calme seul(e) - lire, marcher ou reflechir", "BookOpenIcon", { introversion: 3, analytical: 1 }, 1),
	opt("per-1-b", "per-1", "Socializing with friends and family", "Socialiser avec des amis et la famille", "UsersIcon", { extraversion: 3, communication: 1 }, 2),
	opt("per-1-c", "per-1", "Physical activity - sports or exercise", "Activite physique - sport ou exercice", "RocketLaunchIcon", { physical_endurance: 2, stress_tolerance: 1 }, 3),
	opt("per-1-d", "per-1", "Creative hobbies - music, art, cooking", "Hobbies creatifs - musique, art, cuisine", "LightbulbIcon", { creativity: 3, stress_tolerance: 1 }, 4),
];

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function main() {
	console.log("=== Skills & Quiz Seed Script ===\n");
	console.log(`Skills to insert: ${SKILLS.length}`);
	console.log(`Questions to insert: ${QUESTIONS.length}`);
	console.log(`Options to insert: ${OPTIONS.length}\n`);

	const client = new Client(DB_CONFIG);
	await client.connect();
	console.log("Connected to PostgreSQL (localhost:5432)\n");

	try {
		// ====================================================================
		// STEP 1: Clear existing data (respecting FK order)
		// ====================================================================
		console.log("1. Clearing existing data...");

		const deleteOptionRes = await client.query("DELETE FROM career_quiz_option");
		console.log(`   career_quiz_option: ${deleteOptionRes.rowCount} rows deleted`);

		const deleteQuestionRes = await client.query("DELETE FROM career_quiz_question");
		console.log(`   career_quiz_question: ${deleteQuestionRes.rowCount} rows deleted`);

		const deleteSkillRes = await client.query("DELETE FROM skill_library");
		console.log(`   skill_library: ${deleteSkillRes.rowCount} rows deleted`);

		// ====================================================================
		// STEP 2: Insert skills
		// ====================================================================
		console.log("\n2. Inserting skills...");

		let skillCount = 0;
		for (const s of SKILLS) {
			await client.query(
				`INSERT INTO skill_library (name, name_fr, category, field, description, description_fr, is_active, sort_order)
				 VALUES ($1, $2, $3, $4, $5, $6, true, $7)`,
				[s.name, s.nameFr, s.category, s.field, s.description, s.descriptionFr, s.sortOrder]
			);
			skillCount++;
		}
		console.log(`   Inserted ${skillCount} skills`);

		// Count by field
		const fieldCountRes = await client.query(
			"SELECT field, COUNT(*) as cnt FROM skill_library GROUP BY field ORDER BY cnt DESC"
		);
		for (const row of fieldCountRes.rows) {
			console.log(`     ${row.field}: ${row.cnt}`);
		}

		// Count by category
		const catCountRes = await client.query(
			"SELECT category, COUNT(*) as cnt FROM skill_library GROUP BY category ORDER BY cnt DESC"
		);
		console.log("   By category:");
		for (const row of catCountRes.rows) {
			console.log(`     ${row.category}: ${row.cnt}`);
		}

		// ====================================================================
		// STEP 3: Insert quiz questions
		// ====================================================================
		console.log("\n3. Inserting quiz questions...");

		let questionCount = 0;
		for (const q of QUESTIONS) {
			await client.query(
				`INSERT INTO career_quiz_question (id, quiz_type, question, question_fr, description, description_fr, category, type, trait, scale_min, scale_max, scale_min_fr, scale_max_fr, is_active, sort_order)
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, $14)`,
				[q.id, q.quizType, q.question, q.questionFr, q.description, q.descriptionFr, q.category, q.type, q.trait, q.scaleMin, q.scaleMax, q.scaleMinFr, q.scaleMaxFr, q.sortOrder]
			);
			questionCount++;
		}
		console.log(`   Inserted ${questionCount} questions`);

		// Count by category
		const qCatRes = await client.query(
			"SELECT category, COUNT(*) as cnt FROM career_quiz_question GROUP BY category ORDER BY cnt DESC"
		);
		for (const row of qCatRes.rows) {
			console.log(`     ${row.category}: ${row.cnt}`);
		}

		// Count by type
		const qTypeRes = await client.query(
			"SELECT type, COUNT(*) as cnt FROM career_quiz_question GROUP BY type ORDER BY cnt DESC"
		);
		console.log("   By type:");
		for (const row of qTypeRes.rows) {
			console.log(`     ${row.type}: ${row.cnt}`);
		}

		// ====================================================================
		// STEP 4: Insert quiz options
		// ====================================================================
		console.log("\n4. Inserting quiz options...");

		let optionCount = 0;
		let optionErrors = 0;
		for (const o of OPTIONS) {
			try {
				await client.query(
					`INSERT INTO career_quiz_option (id, question_id, text, text_fr, icon, scores, sort_order)
					 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
					[o.id, o.questionId, o.text, o.textFr, o.icon, JSON.stringify(o.scores), o.sortOrder]
				);
				optionCount++;
			} catch (err) {
				optionErrors++;
				if (optionErrors <= 5) {
					console.log(`   ERROR inserting option ${o.id}: ${err.message}`);
				}
			}
		}
		console.log(`   Inserted ${optionCount} options (${optionErrors} errors)`);

		// ====================================================================
		// STEP 5: Final summary
		// ====================================================================
		console.log("\n" + "=".repeat(60));
		console.log("FINAL COUNTS:");
		console.log("=".repeat(60));

		const finalSkills = await client.query("SELECT COUNT(*) as cnt FROM skill_library");
		const finalQuestions = await client.query("SELECT COUNT(*) as cnt FROM career_quiz_question");
		const finalOptions = await client.query("SELECT COUNT(*) as cnt FROM career_quiz_option");

		console.log(`  skill_library:        ${finalSkills.rows[0].cnt} rows`);
		console.log(`  career_quiz_question: ${finalQuestions.rows[0].cnt} rows`);
		console.log(`  career_quiz_option:   ${finalOptions.rows[0].cnt} rows`);

		// Verify questions with options
		const questionsWithOptions = await client.query(
			`SELECT q.id, q.question, q.type, COUNT(o.id) as option_count
			 FROM career_quiz_question q
			 LEFT JOIN career_quiz_option o ON o.question_id = q.id
			 GROUP BY q.id, q.question, q.type
			 ORDER BY option_count ASC
			 LIMIT 10`
		);
		console.log("\nQuestions with fewest options (verification):");
		for (const row of questionsWithOptions.rows) {
			const marker = row.type === "scale" ? "(scale)" : row.option_count < 3 ? "WARNING" : "OK";
			console.log(`  ${row.id}: ${row.option_count} options [${marker}]`);
		}

		// Questions without options (excluding scale type)
		const orphanQuestions = await client.query(
			`SELECT q.id, q.question, q.type
			 FROM career_quiz_question q
			 LEFT JOIN career_quiz_option o ON o.question_id = q.id
			 WHERE o.id IS NULL AND q.type = 'multiple_choice'`
		);
		if (orphanQuestions.rows.length > 0) {
			console.log(`\nWARNING: ${orphanQuestions.rows.length} multiple_choice questions have NO options:`);
			for (const row of orphanQuestions.rows) {
				console.log(`  ${row.id}: ${row.question}`);
			}
		} else {
			console.log("\nAll multiple_choice questions have options.");
		}

		console.log("\n=== SEED COMPLETE ===");

	} catch (err) {
		console.error("\nFATAL ERROR:", err.message);
		console.error(err.stack);
		process.exit(1);
	} finally {
		await client.end();
	}
}

main().catch(console.error);
