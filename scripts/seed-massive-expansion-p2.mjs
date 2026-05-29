/**
 * seed-massive-expansion-p2.mjs
 *
 * PART 2: Adds 1500+ MORE rows across 6 tables.
 * Works as a supplement to seed-massive-expansion.mjs.
 * Combined target: 3500+ total rows across these tables.
 */

import pg from "pg";
import crypto from "node:crypto";

const { Client } = pg;
const client = new Client({
  connectionString: "postgresql://postgres:postgres@localhost:5432/postgres",
});

function uuid() { return crypto.randomUUID(); }

async function batchInsert(tableName, columns, rows, conflictCol, batchSize = 50) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const placeholders = batch
      .map((_, ri) => {
        const offset = ri * columns.length;
        return `(${columns.map((_, ci) => `$${offset + ci + 1}`).join(", ")})`;
      })
      .join(",\n");
    const values = batch.flat();
    const sql = `INSERT INTO ${tableName} (${columns.join(", ")})
VALUES ${placeholders}
ON CONFLICT (${conflictCol}) DO NOTHING`;
    const res = await client.query(sql, values);
    inserted += res.rowCount;
  }
  return inserted;
}

// ─── 1. ADDITIONAL JOB RESOURCES (100+) ──────────────────────────────────────

function buildMoreJobResources() {
  const rows = [];
  const r = (name, nameFr, cat, sub, desc, descFr, website, loc, fields, tags, isFree, rating) => {
    rows.push([uuid(), name, nameFr, cat, sub, desc, descFr, website, null, null, loc,
      `{${fields.join(",")}}`, `{${tags.join(",")}}`, isFree, rating, true, rows.length + 300, new Date(), new Date()]);
  };

  // Specialized sector job boards
  r("EnergieEmploi Maroc", "EnergieEmploi Maroc", "job_boards", "energy",
    "Job portal for energy sector: oil, gas, renewables, and utilities", "Portail d'emploi pour le secteur energetique: petrole, gaz, renouvelables et services publics",
    "https://energieemploi.ma", "Casablanca", ["energy","engineering"], ["energy","renewables","oil-gas"], true, 3.8);
  r("MineJobs Morocco", "MineEmploi Maroc", "job_boards", "mining",
    "Specialized portal for mining, geology, and mineral processing careers", "Portail specialise pour les carrieres dans les mines, la geologie et le traitement mineral",
    "https://minejobs.ma", "Casablanca", ["mining","engineering"], ["mining","geology","ocp"], true, 3.7);
  r("CreativeMaroc", "CreatifMaroc", "job_boards", "creative",
    "Job portal for creative industries: design, film, music, and arts in Morocco", "Portail d'emploi pour les industries creatives: design, cinema, musique et arts au Maroc",
    "https://creativemaroc.ma", "Casablanca", ["creative","design","media"], ["creative","arts","film"], true, 3.9);
  r("SportEmploi Maroc", "SportEmploi Maroc", "job_boards", "sport",
    "Job portal for sports industry: coaching, management, and sports medicine", "Portail d'emploi pour l'industrie du sport: coaching, management et medecine sportive",
    "https://sportemploi.ma", "Casablanca", ["sport","health"], ["sport","coaching","world-cup"], true, 3.6);
  r("EnvironnementEmploi", "EnvironnementEmploi", "job_boards", "environment",
    "Jobs in environmental protection, sustainability, and green economy", "Emplois dans la protection de l'environnement, la durabilite et l'economie verte",
    "https://environnementemploi.ma", "Rabat", ["environment","engineering"], ["green","sustainability","environment"], true, 3.8);
  r("JuridEmploi Maroc", "JuridEmploi Maroc", "job_boards", "legal",
    "Legal sector job portal for lawyers, notaries, and compliance professionals", "Portail d'emploi juridique pour avocats, notaires et professionnels de la conformite",
    "https://juridemploi.ma", "Casablanca", ["legal"], ["legal","compliance","law"], true, 3.7);
  r("MediaEmploi Morocco", "MediaEmploi Maroc", "job_boards", "media",
    "Jobs in journalism, broadcasting, digital media, and communications", "Emplois dans le journalisme, la radiodiffusion, les medias numeriques et la communication",
    "https://mediaemploi.ma", "Casablanca", ["media","communication"], ["journalism","media","broadcast"], true, 3.6);
  r("StartupJobs Maroc", "StartupJobs Maroc", "job_boards", "startup",
    "Curated job board focused exclusively on startup positions in Morocco", "Job board organise axe exclusivement sur les postes dans les startups au Maroc",
    "https://startupjobs.ma", "Casablanca", ["tech","startup"], ["startup","growth","innovation"], true, 4.1);
  r("SeniorEmploi Maroc", "SeniorEmploi Maroc", "job_boards", "executive",
    "Executive and senior management job platform for experienced professionals", "Plateforme d'emploi executif et de direction pour les professionnels experimentes",
    "https://senioremploi.ma", "Casablanca", ["management"], ["executive","senior","director"], false, 4.0);
  r("HandicraftJobs Morocco", "ArtisanatEmploi Maroc", "job_boards", "artisan",
    "Platform connecting artisans and craftspeople with opportunities in Morocco", "Plateforme connectant artisans et artisans d'art avec des opportunites au Maroc",
    "https://artisanatemploi.ma", "Fez", ["artisan","heritage"], ["handicraft","artisan","traditional"], true, 3.5);

  // More recruitment agencies
  r("Michael Page Morocco", "Michael Page Maroc", "recruitment_agencies", "international",
    "International executive recruitment and staffing specialist", "Specialiste international du recrutement executif et du placement",
    "https://michaelpage.ma", "Casablanca", ["management","finance","tech"], ["executive","specialist"], false, 4.3);
  r("Korn Ferry Morocco", "Korn Ferry Maroc", "recruitment_agencies", "executive",
    "Global organizational consulting and executive search firm", "Cabinet mondial de conseil organisationnel et de recherche de dirigeants",
    "https://kornferry.com/morocco", "Casablanca", ["management"], ["executive-search","consulting"], false, 4.5);
  r("Manpower Morocco", "Manpower Maroc", "recruitment_agencies", "general",
    "World's third-largest staffing firm with Morocco office for all sectors", "Troisieme plus grande societe de recrutement au monde avec bureau au Maroc pour tous les secteurs",
    "https://manpower.ma", "Casablanca", ["general"], ["staffing","temp","permanent"], false, 4.0);
  r("Randstad Morocco", "Randstad Maroc", "recruitment_agencies", "international",
    "Dutch multinational HR services company with flexible staffing solutions", "Multinationale neerlandaise de services RH avec des solutions de recrutement flexibles",
    "https://randstad.ma", "Casablanca", ["general"], ["hr-services","temp","flexible"], false, 4.1);
  r("Kelly Services Morocco", "Kelly Services Maroc", "recruitment_agencies", "specialist",
    "American staffing company specializing in science, engineering, and IT", "Societe americaine de recrutement specialisee en sciences, ingenierie et IT",
    "https://kellyservices.ma", "Casablanca", ["tech","engineering","science"], ["specialist","stem","contract"], false, 3.9);
  r("RMO Group Morocco", "Groupe RMO Maroc", "recruitment_agencies", "local",
    "Moroccan HR outsourcing and temporary staffing group", "Groupe marocain d'externalisation RH et de travail temporaire",
    "https://rmo.ma", "Casablanca", ["general"], ["outsourcing","temp","local"], false, 3.8);
  r("Synergie Morocco", "Synergie Maroc", "recruitment_agencies", "international",
    "French HR services group providing temporary and permanent staffing", "Groupe francais de services RH fournissant du personnel temporaire et permanent",
    "https://synergie.ma", "Casablanca", ["industry","logistics","services"], ["french","temp","staffing"], false, 3.9);
  r("Expectra Morocco", "Expectra Maroc", "recruitment_agencies", "specialist",
    "Specialized recruitment for mid-level managers and technicians", "Recrutement specialise pour cadres intermediaires et techniciens",
    "https://expectra.ma", "Casablanca", ["engineering","tech"], ["mid-level","technician","specialist"], false, 3.8);
  r("FedAfrica Morocco", "FedAfrica Maroc", "recruitment_agencies", "specialist",
    "Pan-African recruitment group with offices in Casablanca", "Groupe de recrutement pan-africain avec bureaux a Casablanca",
    "https://fedafrica.com", "Casablanca", ["general"], ["africa","pan-african","permanent"], false, 4.0);
  r("Morgan Philips Morocco", "Morgan Philips Maroc", "recruitment_agencies", "executive",
    "Executive search and talent consulting firm with Morocco presence", "Cabinet de recherche de dirigeants et conseil en talents avec presence au Maroc",
    "https://morganphilips.com/morocco", "Casablanca", ["management","finance"], ["executive","headhunting"], false, 4.2);

  // More training & certifications
  r("YNOV Campus Casablanca", "YNOV Campus Casablanca", "training_certifications", "digital",
    "French digital school offering web development, data science, and cybersecurity programs", "Ecole digitale francaise offrant des programmes de developpement web, data science et cybersecurite",
    "https://ynov.com/casablanca", "Casablanca", ["tech","digital"], ["digital-school","web","data-science"], false, 4.1);
  r("Coursera Morocco Hub", "Hub Coursera Maroc", "training_certifications", "online",
    "Online learning platform with 7000+ courses from top universities", "Plateforme d'apprentissage en ligne avec plus de 7000 cours des meilleures universites",
    "https://coursera.org", "National Coverage", ["general"], ["online","mooc","university","free"], true, 4.5);
  r("LinkedIn Learning Morocco", "LinkedIn Learning Maroc", "training_certifications", "online",
    "Professional development courses integrated with LinkedIn profiles", "Cours de developpement professionnel integres aux profils LinkedIn",
    "https://linkedin.com/learning", "National Coverage", ["general"], ["linkedin","professional","video"], false, 4.3);
  r("Udemy Morocco", "Udemy Maroc", "training_certifications", "online",
    "Marketplace for online courses with affordable pricing for Moroccan students", "Marketplace de cours en ligne avec des tarifs abordables pour les etudiants marocains",
    "https://udemy.com", "National Coverage", ["general"], ["udemy","affordable","online"], false, 4.0);
  r("DataCamp Morocco", "DataCamp Maroc", "training_certifications", "data",
    "Interactive data science and analytics learning platform", "Plateforme d'apprentissage interactive en data science et analytique",
    "https://datacamp.com", "National Coverage", ["tech","data"], ["data-science","python","sql"], false, 4.2);
  r("Pluralsight Morocco", "Pluralsight Maroc", "training_certifications", "tech",
    "Technology skills platform for IT professionals and developers", "Plateforme de competences technologiques pour professionnels IT et developpeurs",
    "https://pluralsight.com", "National Coverage", ["tech"], ["cloud","devops","development"], false, 4.1);
  r("IIHEM Business School", "IIHEM Ecole de Commerce", "training_certifications", "management",
    "International Institute for Higher Education in Morocco offering MBA programs", "Institut International des Hautes Etudes au Maroc offrant des programmes MBA",
    "https://iihem.ac.ma", "Rabat", ["management","finance"], ["mba","international","business"], false, 4.0);
  r("Oracle University Morocco", "Oracle University Maroc", "training_certifications", "tech",
    "Official Oracle training and certification programs", "Programmes officiels de formation et certification Oracle",
    "https://education.oracle.com", "Casablanca", ["tech"], ["oracle","database","java","certification"], false, 4.2);
  r("CompTIA Morocco", "CompTIA Maroc", "training_certifications", "tech",
    "IT industry certifications: A+, Network+, Security+, Cloud+", "Certifications de l'industrie IT: A+, Network+, Security+, Cloud+",
    "https://comptia.org", "National Coverage", ["tech"], ["certification","it-fundamentals","security"], false, 4.3);
  r("PMI Morocco Chapter", "Chapitre PMI Maroc", "training_certifications", "management",
    "Project Management Institute Morocco chapter for PMP preparation and networking", "Chapitre marocain du Project Management Institute pour la preparation PMP et le reseautage",
    "https://pmi.org.ma", "Casablanca", ["management"], ["pmp","project-management","networking"], false, 4.4);

  // More coworking and startup resources
  r("New Work Lab Casablanca", "New Work Lab Casablanca", "coworking_freelance", "coworking",
    "Modern coworking space in Casablanca's Maarif district with 24/7 access", "Espace de coworking moderne dans le quartier Maarif de Casablanca avec acces 24/7",
    "https://newworklab.ma", "Casablanca", ["general"], ["coworking","24-7","maarif"], false, 4.0);
  r("Hub Africa Casablanca", "Hub Africa Casablanca", "coworking_freelance", "coworking",
    "Pan-African business hub connecting Moroccan and African entrepreneurs", "Hub d'affaires pan-africain connectant entrepreneurs marocains et africains",
    "https://hubafrica.com", "Casablanca", ["business","startup"], ["africa","networking","hub"], false, 4.1);
  r("Numa Morocco", "Numa Maroc", "startup_ecosystem", "accelerator",
    "French startup accelerator running programs for early-stage Moroccan startups", "Accelerateur de startups francais executant des programmes pour les startups marocaines en phase de demarrage",
    "https://numa.co/morocco", "Casablanca", ["tech","startup"], ["accelerator","french","early-stage"], true, 4.0);
  r("Seedstars Morocco", "Seedstars Maroc", "startup_ecosystem", "accelerator",
    "Swiss investment firm running startup competitions in emerging markets including Morocco", "Societe d'investissement suisse organisant des competitions de startups dans les marches emergents dont le Maroc",
    "https://seedstars.com/morocco", "Casablanca", ["tech","startup"], ["competition","investment","emerging"], true, 4.2);
  r("Morocco Tech Community", "Communaute Tech Maroc", "professional_networks", "community",
    "Online community of 15,000+ Moroccan tech professionals sharing knowledge and jobs", "Communaute en ligne de plus de 15 000 professionnels tech marocains partageant connaissances et emplois",
    "https://motech.community", "National Coverage", ["tech"], ["community","knowledge","networking"], true, 4.0);
  r("Women in Tech Morocco", "Women in Tech Maroc", "professional_networks", "women",
    "Network empowering women in technology careers through mentorship and events", "Reseau autonomisant les femmes dans les carrieres technologiques par le mentorat et les evenements",
    "https://womenintech.ma", "Casablanca", ["tech"], ["women","mentorship","empowerment"], true, 4.3);
  r("APEBI Tech Federation", "Federation APEBI", "professional_networks", "technology",
    "Moroccan Federation of Information Technology, Telecommunications, and Offshoring", "Federation Marocaine des Technologies de l'Information, des Telecommunications et de l'Offshoring",
    "https://apebi.org.ma", "Casablanca", ["tech","telecom"], ["federation","ict","offshoring"], true, 4.1);

  // Career centers and guidance
  r("Orientation Sup Maroc", "Orientation Sup Maroc", "career_centers", "students",
    "Higher education orientation platform for baccalaureate students", "Plateforme d'orientation pour l'enseignement superieur pour les bacheliers",
    "https://orientationsup.ma", "National Coverage", ["general"], ["bac","orientation","higher-education"], true, 3.9);
  r("CIOPE Casablanca", "CIOPE Casablanca", "career_centers", "regional",
    "Career Information and Orientation Center in Casablanca", "Centre d'Information et d'Orientation Professionnelle a Casablanca",
    "https://ciope.ma", "Casablanca", ["general"], ["orientation","counseling","career-center"], true, 3.7);
  r("Bourse de Stage Morocco", "Bourse de Stage Maroc", "career_centers", "students",
    "National internship exchange connecting students with companies", "Bourse nationale de stages connectant etudiants et entreprises",
    "https://boursedestage.ma", "National Coverage", ["general"], ["internship","exchange","students"], true, 3.8);
  r("Alumni Network ENSIAS", "Reseau Alumni ENSIAS", "professional_networks", "university",
    "ENSIAS engineering school alumni network for career development and mentoring", "Reseau des anciens de l'ENSIAS pour le developpement de carriere et le mentorat",
    "https://alumni.ensias.ma", "Rabat", ["tech"], ["alumni","ensias","engineering"], true, 4.0);
  r("Alumni Network EMI", "Reseau Alumni EMI", "professional_networks", "university",
    "EMI engineering school alumni association with 10,000+ members", "Association des anciens de l'EMI avec plus de 10 000 membres",
    "https://alumni.emi.ac.ma", "Rabat", ["engineering"], ["alumni","emi","engineering"], true, 4.1);
  r("Alumni Network ISCAE", "Reseau Alumni ISCAE", "professional_networks", "university",
    "ISCAE business school alumni network connecting 15,000+ graduates", "Reseau des anciens de l'ISCAE connectant plus de 15 000 diplomes",
    "https://alumni.iscae.ma", "Casablanca", ["management","finance"], ["alumni","iscae","business"], true, 4.2);
  r("Moroccan Diaspora Network", "Reseau Diaspora Marocaine", "professional_networks", "international",
    "Professional network connecting Moroccan expatriates with opportunities back home", "Reseau professionnel connectant les expatries marocains avec des opportunites au pays",
    "https://diaspora-maroc.org", "National Coverage", ["general"], ["diaspora","mre","international"], true, 3.9);

  // More government programs
  r("Programme National d'Autoemploi", "Programme National d'Autoemploi", "government_programs", "entrepreneurship",
    "National self-employment program providing training and micro-loans up to 50,000 MAD", "Programme national d'autoemploi fournissant formation et micro-prets jusqu'a 50 000 MAD",
    "https://autoemploi.gov.ma", "National Coverage", ["general"], ["micro-enterprise","self-employment","loan"], true, 3.7);
  r("Injaz Morocco", "Injaz Maroc", "government_programs", "youth",
    "Junior Achievement program teaching entrepreneurship skills to Moroccan students", "Programme Junior Achievement enseignant les competences entrepreneuriales aux etudiants marocains",
    "https://injaz-morocco.org", "National Coverage", ["general"], ["youth","entrepreneurship","education"], true, 4.1);
  r("Intilaka Program", "Programme Intilaka", "government_programs", "entrepreneurship",
    "Integrated entrepreneurship support program with subsidized loans from banks", "Programme integre de soutien a l'entrepreneuriat avec prets subventionnes des banques",
    "https://intilaka.ma", "National Coverage", ["general"], ["entrepreneurship","bank-loans","startup"], true, 4.0);
  r("Min Ajliki Program", "Programme Min Ajliki", "government_programs", "women",
    "Government program supporting women's entrepreneurship and economic empowerment", "Programme gouvernemental soutenant l'entrepreneuriat feminin et l'autonomisation economique",
    "https://minajliki.ma", "National Coverage", ["general"], ["women","entrepreneurship","empowerment"], true, 4.0);
  r("Moqawalati Program", "Programme Moqawalati", "government_programs", "entrepreneurship",
    "Young entrepreneur support with business plan development and funding assistance", "Soutien aux jeunes entrepreneurs avec developpement de plan d'affaires et aide au financement",
    "https://moqawalati.gov.ma", "National Coverage", ["general"], ["youth","business-plan","funding"], true, 3.8);

  // Specialized resources
  r("Moroccan Patent Office (OMPIC)", "Office Marocain des Brevets (OMPIC)", "government_programs", "legal",
    "Intellectual property office for patent, trademark, and design registration", "Office de propriete intellectuelle pour l'enregistrement de brevets, marques et dessins",
    "https://ompic.ma", "Casablanca", ["legal","tech"], ["patent","trademark","intellectual-property"], true, 4.0);
  r("Centre Regional d'Investissement CRI", "Centre Regional d'Investissement CRI", "government_programs", "investment",
    "Regional investment centers providing one-stop-shop for business creation", "Centres regionaux d'investissement fournissant un guichet unique pour la creation d'entreprise",
    "https://cri.ma", "National Coverage", ["general"], ["investment","business-creation","one-stop-shop"], true, 4.2);

  return rows;
}

// ─── 2. ADDITIONAL CAREER MARKET INSIGHTS (50+) ─────────────────────────────

function buildMoreInsights() {
  const rows = [];
  const r = (title, titleFr, value, desc, descFr, icon, color, field) => {
    rows.push([uuid(), title, titleFr, value, desc, descFr, icon, color, field, true, rows.length + 200, new Date(), new Date()]);
  };

  // Regional economy
  r("Dakhla-Oued Ed-Dahab GDP Growth", "Croissance PIB Dakhla-Oued Ed-Dahab", "+12.5%",
    "Dakhla region grew 12.5% driven by fishing, tourism, and renewable energy", "La region de Dakhla a cru de 12,5% portee par la peche, le tourisme et les energies renouvelables",
    "chart-line-up", "#22c55e", null);
  r("Guelmim-Oued Noun Economic Potential", "Potentiel Economique Guelmim-Oued Noun", "$500M",
    "Guelmim region has $500M planned investment in fishing and solar energy", "La region de Guelmim a 500 M$ d'investissements planifies dans la peche et l'energie solaire",
    "currency-dollar", "#3b82f6", null);
  r("Rabat-Sale-Kenitra Tech Hub Growth", "Croissance Hub Tech Rabat-Sale-Kenitra", "+25%",
    "Rabat-Sale-Kenitra tech sector grew 25% with Technopolis expansion", "Le secteur tech de Rabat-Sale-Kenitra a cru de 25% avec l'expansion de Technopolis",
    "chart-line-up", "#22c55e", null);
  r("Taza-Hoceima Development Plan", "Plan de Developpement Taza-Al Hoceima", "$1.2B",
    "Government injected $1.2B for Al Hoceima region development after 2016 protests", "Le gouvernement a injecte 1,2 Mrd$ pour le developpement de la region d'Al Hoceima apres les manifestations de 2016",
    "currency-dollar", "#3b82f6", null);

  // Trade statistics
  r("Morocco-EU Trade Volume", "Volume Commercial Maroc-UE", "$42B",
    "Total trade with EU reached $42B, making it Morocco's largest trading partner", "Le commerce total avec l'UE a atteint 42 Mrd$, en faisant le premier partenaire commercial du Maroc",
    "globe", "#22c55e", null);
  r("Morocco-Africa Trade Growth", "Croissance Commerce Maroc-Afrique", "+18%",
    "Morocco's trade with Sub-Saharan Africa grew 18% led by banking and telecoms expansion", "Le commerce du Maroc avec l'Afrique subsaharienne a cru de 18% mene par l'expansion bancaire et telecom",
    "globe", "#22c55e", null);
  r("Morocco-US Trade Value", "Valeur Commerce Maroc-USA", "$5.8B",
    "US-Morocco FTA trade reached $5.8B with growing tech and agricultural exports", "Le commerce ALE Maroc-USA a atteint 5,8 Mrd$ avec des exportations tech et agricoles croissantes",
    "globe", "#22c55e", null);
  r("Morocco-China Trade", "Commerce Maroc-Chine", "$6.2B",
    "China became Morocco's 3rd largest trade partner with $6.2B in bilateral trade", "La Chine est devenue le 3e partenaire commercial du Maroc avec 6,2 Mrd$ de commerce bilateral",
    "globe", "#3b82f6", null);
  r("Remittances from MRE", "Transferts des MRE", "$11.8B",
    "Moroccan diaspora remittances reached $11.8B, supporting 30% of household consumption", "Les transferts de la diaspora marocaine ont atteint 11,8 Mrd$, soutenant 30% de la consommation des menages",
    "currency-dollar", "#22c55e", null);

  // Sector-specific
  r("Fisheries Sector Employment", "Emploi Secteur Halieutique", "170,000",
    "Morocco's fishing industry employs 170,000 workers, 3rd largest in Africa", "L'industrie de la peche marocaine emploie 170 000 travailleurs, 3e plus grande d'Afrique",
    "briefcase", "#3b82f6", null);
  r("Crafts and Artisan Sector", "Secteur Artisanat", "2.4M",
    "Traditional crafts sector employs 2.4 million artisans across Morocco", "Le secteur de l'artisanat traditionnel emploie 2,4 millions d'artisans au Maroc",
    "briefcase", "#3b82f6", null);
  r("Real Estate Market Growth", "Croissance Marche Immobilier", "+7.2%",
    "Morocco's real estate market grew 7.2% driven by World Cup infrastructure", "Le marche immobilier marocain a cru de 7,2% porte par les infrastructures de la Coupe du Monde",
    "chart-line-up", "#22c55e", null);
  r("Franchise Sector Growth", "Croissance Secteur Franchise", "+15%",
    "Franchising grew 15% in Morocco with 800+ franchised brands", "Le franchisage a cru de 15% au Maroc avec plus de 800 marques franchisees",
    "chart-line-up", "#22c55e", null);
  r("Morocco Startup Success Rate", "Taux de Survie Startups Maroc", "38%",
    "38% of Moroccan startups survive past 3 years, above the African average of 25%", "38% des startups marocaines survivent au-dela de 3 ans, au-dessus de la moyenne africaine de 25%",
    "chart-line-up", "#f97316", null);
  r("Cybersecurity Market Morocco", "Marche Cybersecurite Maroc", "$180M",
    "Morocco's cybersecurity market reached $180M with 35% annual growth", "Le marche de la cybersecurite au Maroc a atteint 180 M$ avec une croissance annuelle de 35%",
    "currency-dollar", "#22c55e", null);
  r("Data Center Market Growth", "Croissance Marche Data Center", "+28%",
    "Data center construction grew 28% with major facilities in Casablanca and Rabat", "La construction de data centers a cru de 28% avec des installations majeures a Casablanca et Rabat",
    "chart-line-up", "#22c55e", null);
  r("Gaming Industry Morocco", "Industrie du Jeu Video Maroc", "$50M",
    "Morocco's gaming industry reached $50M with 15+ game development studios", "L'industrie du jeu video marocain a atteint 50 M$ avec plus de 15 studios de developpement",
    "currency-dollar", "#3b82f6", null);
  r("Electric Vehicle Market", "Marche Vehicules Electriques", "+120%",
    "EV sales in Morocco grew 120% with Stellantis producing hybrid vehicles in Kenitra", "Les ventes de VE au Maroc ont cru de 120% avec Stellantis produisant des vehicules hybrides a Kenitra",
    "chart-line-up", "#22c55e", "industrial");
  r("Organic Agriculture Growth", "Croissance Agriculture Biologique", "+22%",
    "Organic farming grew 22% in Morocco, reaching 12,000 hectares certified", "L'agriculture biologique a cru de 22% au Maroc, atteignant 12 000 hectares certifies",
    "chart-line-up", "#22c55e", null);
  r("Cannabis Industry Legalization", "Legalisation Industrie du Cannabis", "$420M",
    "Legal cannabis industry projected to reach $420M by 2028 for medical and industrial use", "L'industrie legale du cannabis devrait atteindre 420 M$ d'ici 2028 pour usage medical et industriel",
    "currency-dollar", "#22c55e", null);

  // Employment quality
  r("Median Entry-Level Salary", "Salaire Median Debutant", "5,500 MAD/month",
    "Median entry-level salary across all sectors is 5,500 MAD per month", "Le salaire median debutant tous secteurs confondus est de 5 500 MAD par mois",
    "currency-dollar", "#f97316", null);
  r("Gender Pay Gap Morocco", "Ecart Salarial Homme-Femme Maroc", "24%",
    "Women earn 24% less than men on average in Morocco's formal sector", "Les femmes gagnent en moyenne 24% de moins que les hommes dans le secteur formel marocain",
    "users", "#ef4444", null);
  r("Remote Work Adoption", "Adoption du Teletravail", "15%",
    "15% of Moroccan companies offer remote work options, up from 3% pre-pandemic", "15% des entreprises marocaines offrent des options de teletravail, contre 3% avant la pandemie",
    "globe", "#22c55e", null);
  r("Employee Turnover Rate", "Taux de Rotation du Personnel", "18%",
    "Average employee turnover in Morocco is 18%, highest in BPO and retail sectors", "Le taux de rotation moyen au Maroc est de 18%, plus eleve dans les secteurs BPO et distribution",
    "users", "#f97316", null);
  r("LinkedIn Users in Morocco", "Utilisateurs LinkedIn au Maroc", "4.5M",
    "Morocco has 4.5 million LinkedIn users, making it the top professional network", "Le Maroc compte 4,5 millions d'utilisateurs LinkedIn, en faisant le premier reseau professionnel",
    "users", "#3b82f6", null);

  // Industrial specifics
  r("Hydrogen Production Target", "Objectif Production Hydrogene", "3M tons/year",
    "Morocco targets 3 million tons of green hydrogen production by 2030", "Le Maroc vise 3 millions de tonnes de production d'hydrogene vert d'ici 2030",
    "globe", "#22c55e", "industrial");
  r("Fertilizer Export Revenue", "Revenus Export Engrais", "$8.5B",
    "Morocco's fertilizer exports reached $8.5B, supplying 25% of global phosphate-based fertilizers", "Les exportations d'engrais du Maroc ont atteint 8,5 Mrd$, fournissant 25% des engrais phosphates mondiaux",
    "currency-dollar", "#22c55e", "industrial");
  r("Automotive Parts Exports", "Exportations Pieces Automobiles", "$6.8B",
    "Automotive parts exports reached $6.8B from 250+ manufacturers in Tangier and Kenitra", "Les exportations de pieces automobiles ont atteint 6,8 Mrd$ de plus de 250 fabricants a Tanger et Kenitra",
    "currency-dollar", "#22c55e", "industrial");

  return rows;
}

// ─── 3. ADDITIONAL INTERVIEW QUESTIONS (120+) ────────────────────────────────

function buildMoreQuestions() {
  const rows = [];
  let counter = 600;
  const r = (q, qf, type, field, sa, saf, tips, tipsf, diff) => {
    const id = `exp2-${String(counter++).padStart(3, "0")}`;
    rows.push([id, q, qf, type, field, sa, saf, JSON.stringify(tips), JSON.stringify(tipsf), diff, true, rows.length + 400, new Date(), new Date()]);
  };

  // General - Competency
  r("Describe a time you had to convince someone who disagreed with you.",
    "Decrivez une situation ou vous avez du convaincre quelqu'un qui n'etait pas d'accord avec vous.",
    "competency", "general",
    "I presented data-driven arguments and listened to their concerns. By finding common ground, we reached a consensus that was better than either original position.",
    "J'ai presente des arguments bases sur les donnees et ecoute leurs preoccupations. En trouvant un terrain d'entente, nous avons atteint un consensus meilleur que les positions initiales.",
    ["Show persuasion skills","Use data and logic","Demonstrate empathy"], ["Montrez les competences de persuasion","Utilisez donnees et logique","Demonstrez l'empathie"], "medium");
  r("Tell me about a time you went above and beyond your job description.",
    "Parlez-moi d'une fois ou vous etes alle au-dela de votre fiche de poste.",
    "competency", "general",
    "I noticed our onboarding process was causing 30% of new hires to struggle. I created a comprehensive guide and buddy system, reducing onboarding time by 40%.",
    "J'ai remarque que notre processus d'integration causait des difficultes a 30% des nouvelles recrues. J'ai cree un guide complet et un systeme de parrainage, reduisant le temps d'integration de 40%.",
    ["Show initiative","Quantify impact","Demonstrate ownership"], ["Montrez l'initiative","Quantifiez l'impact","Demonstrez l'appropriation"], "medium");
  r("How do you handle multiple deadlines from different managers?",
    "Comment gerez-vous des echeances multiples de differents managers ?",
    "situational", "general",
    "I communicate transparently with all managers about my workload, prioritize based on business impact, and propose realistic timelines when conflicts arise.",
    "Je communique de maniere transparente avec tous les managers sur ma charge de travail, priorise selon l'impact business et propose des delais realistes en cas de conflits.",
    ["Show communication skills","Discuss prioritization","Mention stakeholder management"], ["Montrez les competences de communication","Discutez la priorisation","Mentionnez la gestion des parties prenantes"], "medium");
  r("What do you know about our company?",
    "Que savez-vous de notre entreprise ?",
    "motivation", "general",
    "Research the company thoroughly before the interview: products, market position, recent news, culture, and strategic direction.",
    "Recherchez l'entreprise en profondeur avant l'entretien: produits, position de marche, actualites recentes, culture et direction strategique.",
    ["Research thoroughly","Connect your skills to their needs","Show genuine interest"], ["Recherchez en profondeur","Connectez vos competences a leurs besoins","Montrez un interet sincere"], "easy");
  r("How do you stay productive when working remotely?",
    "Comment restez-vous productif en teletravail ?",
    "behavioral", "general",
    "I establish a dedicated workspace, follow a structured schedule, use productivity tools, and maintain regular communication with my team.",
    "J'etablis un espace de travail dedie, suis un emploi du temps structure, utilise des outils de productivite et maintiens une communication reguliere avec mon equipe.",
    ["Mention specific tools","Show discipline","Cover communication"], ["Mentionnez des outils specifiques","Montrez la discipline","Couvrez la communication"], "easy");
  r("Describe your ideal work environment.",
    "Decrivez votre environnement de travail ideal.",
    "motivation", "general",
    "I thrive in collaborative environments with clear goals, open communication, and opportunities for growth. I value both teamwork and autonomy.",
    "Je m'epanouis dans des environnements collaboratifs avec des objectifs clairs, une communication ouverte et des opportunites de croissance. Je valorise le travail d'equipe et l'autonomie.",
    ["Align with company culture","Be specific","Show flexibility"], ["Alignez avec la culture d'entreprise","Soyez specifique","Montrez la flexibilite"], "easy");
  r("How do you approach learning a new technology or skill?",
    "Comment abordez-vous l'apprentissage d'une nouvelle technologie ou competence ?",
    "behavioral", "general",
    "I start with official documentation, build small projects to practice, then seek feedback from experienced practitioners. I also contribute to open source.",
    "Je commence par la documentation officielle, construis de petits projets pour pratiquer, puis cherche des retours de praticiens experimentes. Je contribue aussi a l'open source.",
    ["Show self-directed learning","Mention specific learning methods","Discuss knowledge sharing"], ["Montrez l'auto-apprentissage","Mentionnez des methodes specifiques","Discutez le partage de connaissances"], "easy");
  r("What would you do in your first 90 days in this role?",
    "Que feriez-vous dans vos 90 premiers jours dans ce poste ?",
    "situational", "general",
    "Days 1-30: Learn the systems, meet the team, understand processes. Days 31-60: Identify improvement areas, deliver quick wins. Days 61-90: Propose strategic improvements and lead initiatives.",
    "Jours 1-30: Apprendre les systemes, rencontrer l'equipe, comprendre les processus. Jours 31-60: Identifier les axes d'amelioration, delivrer des victoires rapides. Jours 61-90: Proposer des ameliorations strategiques et mener des initiatives.",
    ["Show structured approach","Discuss learning and contributing","Mention stakeholder relationships"], ["Montrez une approche structuree","Discutez apprentissage et contribution","Mentionnez les relations parties prenantes"], "medium");

  // Genie Informatique - Additional
  r("How would you implement authentication in a modern web application?",
    "Comment implementeriez-vous l'authentification dans une application web moderne ?",
    "technical", "genie-informatique",
    "I'd use OAuth2/OIDC with JWT tokens, implement refresh token rotation, secure cookies, CSRF protection, and consider multi-factor authentication.",
    "J'utiliserais OAuth2/OIDC avec des tokens JWT, implementerais la rotation des tokens de rafraichissement, cookies securises, protection CSRF et considererais l'authentification multi-facteurs.",
    ["Cover OAuth2 flow","Discuss token management","Mention security best practices"], ["Couvrez le flux OAuth2","Discutez la gestion des tokens","Mentionnez les bonnes pratiques de securite"], "hard");
  r("Explain the concept of eventual consistency in distributed systems.",
    "Expliquez le concept de coherence eventuelle dans les systemes distribues.",
    "technical", "genie-informatique",
    "Eventual consistency means all nodes will converge to the same state given enough time. Used in systems prioritizing availability over strong consistency (CAP theorem).",
    "La coherence eventuelle signifie que tous les noeuds convergeront vers le meme etat avec suffisamment de temps. Utilisee dans les systemes privilegiant la disponibilite a la coherence forte (theoreme CAP).",
    ["Explain CAP theorem","Give practical examples","Discuss trade-offs"], ["Expliquez le theoreme CAP","Donnez des exemples pratiques","Discutez les compromis"], "hard");
  r("How do you handle state management in a React application?",
    "Comment gerez-vous la gestion de l'etat dans une application React ?",
    "technical", "genie-informatique",
    "I use local state for UI, TanStack Query for server state, and Zustand or Context for shared client state. I avoid prop drilling with composition patterns.",
    "J'utilise l'etat local pour l'UI, TanStack Query pour l'etat serveur et Zustand ou Context pour l'etat client partage. J'evite le prop drilling avec des patterns de composition.",
    ["Differentiate state types","Mention specific tools","Discuss performance"], ["Differenciez les types d'etat","Mentionnez des outils specifiques","Discutez la performance"], "medium");
  r("What is your approach to handling errors in production systems?",
    "Quelle est votre approche pour gerer les erreurs dans les systemes de production ?",
    "technical", "genie-informatique",
    "I implement structured logging (ELK/Datadog), set up alerting on error rates, use circuit breakers for downstream services, and maintain runbooks for common issues.",
    "J'implemente la journalisation structuree (ELK/Datadog), configure des alertes sur les taux d'erreur, utilise des coupe-circuits pour les services en aval et maintiens des runbooks pour les problemes courants.",
    ["Cover monitoring stack","Discuss incident response","Mention runbooks"], ["Couvrez la pile de monitoring","Discutez la reponse aux incidents","Mentionnez les runbooks"], "hard");
  r("Explain WebSockets and when you would use them over REST.",
    "Expliquez les WebSockets et quand vous les utiliseriez plutot que REST.",
    "technical", "genie-informatique",
    "WebSockets provide full-duplex communication. Use them for real-time features like chat, live dashboards, or collaborative editing where REST polling would be inefficient.",
    "Les WebSockets fournissent une communication full-duplex. Utilisez-les pour les fonctionnalites temps reel comme le chat, les tableaux de bord en direct ou l'edition collaborative ou le polling REST serait inefficace.",
    ["Compare with SSE and polling","Discuss use cases","Cover connection management"], ["Comparez avec SSE et polling","Discutez les cas d'utilisation","Couvrez la gestion des connexions"], "medium");
  r("How do you approach performance optimization in a web application?",
    "Comment abordez-vous l'optimisation de la performance d'une application web ?",
    "technical", "genie-informatique",
    "I measure first (Lighthouse, Web Vitals), optimize critical rendering path, implement code splitting, lazy loading, caching strategies, and CDN distribution.",
    "Je mesure d'abord (Lighthouse, Web Vitals), optimise le chemin de rendu critique, implemente le code splitting, le chargement paresseux, les strategies de cache et la distribution CDN.",
    ["Start with measurement","Cover Core Web Vitals","Discuss caching strategies"], ["Commencez par la mesure","Couvrez les Core Web Vitals","Discutez les strategies de cache"], "hard");

  // Finance - Additional
  r("What is the role of Bank Al-Maghrib in the Moroccan economy?",
    "Quel est le role de Bank Al-Maghrib dans l'economie marocaine ?",
    "technical", "finance",
    "BAM is Morocco's central bank: sets monetary policy, supervises banks, manages foreign reserves, issues currency, and maintains financial stability.",
    "BAM est la banque centrale du Maroc: definit la politique monetaire, supervise les banques, gere les reserves de change, emet la monnaie et maintient la stabilite financiere.",
    ["Cover monetary policy tools","Discuss banking supervision","Mention recent decisions"], ["Couvrez les outils de politique monetaire","Discutez la supervision bancaire","Mentionnez les decisions recentes"], "medium");
  r("How do you analyze the Casablanca Stock Exchange (BVC)?",
    "Comment analysez-vous la Bourse de Casablanca (BVC) ?",
    "technical", "finance",
    "I use fundamental analysis (P/E, P/B, dividend yield), technical indicators (MASI index trends), sector analysis, and compare with regional markets.",
    "J'utilise l'analyse fondamentale (PER, P/B, rendement du dividende), les indicateurs techniques (tendances indice MASI), l'analyse sectorielle et compare avec les marches regionaux.",
    ["Mention MASI/MADEX indices","Discuss listed sectors","Cover liquidity analysis"], ["Mentionnez les indices MASI/MADEX","Discutez les secteurs cotes","Couvrez l'analyse de liquidite"], "hard");
  r("Explain the Moroccan tax system for companies.",
    "Expliquez le systeme fiscal marocain pour les entreprises.",
    "technical", "finance",
    "Companies pay IS (corporate tax) at progressive rates (10-31%), TVA (VAT at 20%), IR for employee withholding, and various local taxes. CFC companies enjoy 0% tax for 5 years.",
    "Les entreprises paient l'IS (impot sur les societes) a des taux progressifs (10-31%), la TVA (20%), l'IR pour la retenue a la source et diverses taxes locales. Les entreprises CFC beneficient de 0% d'impot pendant 5 ans.",
    ["Cover IS rates","Discuss TVA","Mention tax incentives"], ["Couvrez les taux d'IS","Discutez la TVA","Mentionnez les incitations fiscales"], "hard");
  r("How do you prepare a business plan for bank financing?",
    "Comment preparez-vous un business plan pour un financement bancaire ?",
    "situational", "finance",
    "Executive summary, market analysis, operational plan, 3-5 year financial projections (income statement, balance sheet, cash flow), funding requirements, and risk analysis.",
    "Resume executif, analyse de marche, plan operationnel, projections financieres sur 3-5 ans (compte de resultat, bilan, tresorerie), besoins de financement et analyse des risques.",
    ["Cover all financial statements","Discuss assumptions clearly","Mention collateral"], ["Couvrez tous les etats financiers","Discutez clairement les hypotheses","Mentionnez les garanties"], "medium");

  // Genie Civil - Additional
  r("How do you manage construction quality on a Moroccan building site?",
    "Comment gerez-vous la qualite de construction sur un chantier marocain ?",
    "competency", "genie-civil",
    "I implement a quality plan per NM standards, conduct regular inspections, perform material testing (concrete, steel), and maintain detailed quality logs.",
    "J'implemente un plan qualite selon les normes NM, effectue des inspections regulieres, realise des essais de materiaux (beton, acier) et maintiens des registres qualite detailles.",
    ["Mention Moroccan standards","Discuss material testing","Cover documentation"], ["Mentionnez les normes marocaines","Discutez les essais de materiaux","Couvrez la documentation"], "medium");
  r("What environmental regulations affect construction in Morocco?",
    "Quelles reglementations environnementales affectent la construction au Maroc ?",
    "technical", "genie-civil",
    "Law 12-03 on EIA, Law 28-00 on waste management, RTCM thermal regulation for buildings, and water conservation requirements in arid zones.",
    "Loi 12-03 sur les EIE, Loi 28-00 sur la gestion des dechets, RTCM reglementation thermique des batiments et exigences de conservation de l'eau en zones arides.",
    ["Cover EIA process","Discuss thermal regulation","Mention sustainability"], ["Couvrez le processus d'EIE","Discutez la reglementation thermique","Mentionnez la durabilite"], "medium");

  // Genie Electrique - Additional
  r("How do you size a solar PV system for a Moroccan factory?",
    "Comment dimensionnez-vous un systeme solaire PV pour une usine marocaine ?",
    "technical", "genie-electrique",
    "Analyze energy bills, determine peak demand, calculate solar irradiation (Morocco averages 5 kWh/m2/day), size panels and inverters, and evaluate ROI with self-consumption model.",
    "Analyser les factures d'energie, determiner la demande de pointe, calculer l'irradiation solaire (moyenne Maroc 5 kWh/m2/jour), dimensionner panneaux et onduleurs et evaluer le ROI avec le modele d'autoconsommation.",
    ["Use Moroccan solar data","Discuss ONEE regulations","Cover ROI calculation"], ["Utilisez les donnees solaires marocaines","Discutez les reglementations ONEE","Couvrez le calcul du ROI"], "hard");
  r("What is the difference between SCADA and DCS systems?",
    "Quelle est la difference entre les systemes SCADA et DCS ?",
    "technical", "genie-electrique",
    "SCADA is for geographically distributed systems (power grids). DCS is for process-centric applications (refineries). DCS has tighter integration and faster control loops.",
    "SCADA est pour les systemes geographiquement distribues (reseaux electriques). DCS est pour les applications centrees processus (raffineries). DCS a une integration plus etroite et des boucles de controle plus rapides.",
    ["Cover architecture differences","Discuss use cases","Mention protocols"], ["Couvrez les differences d'architecture","Discutez les cas d'utilisation","Mentionnez les protocoles"], "hard");

  // Commerce International - Additional
  r("How do you manage currency risk in international trade?",
    "Comment gerez-vous le risque de change dans le commerce international ?",
    "technical", "commerce-international",
    "I use forward contracts, currency options, and natural hedging by matching revenues and costs in the same currency. BAM provides forward market access.",
    "J'utilise des contrats a terme, des options de change et la couverture naturelle en alignant revenus et couts dans la meme devise. BAM fournit l'acces au marche a terme.",
    ["Cover hedging instruments","Discuss MAD convertibility","Mention BAM regulations"], ["Couvrez les instruments de couverture","Discutez la convertibilite du MAD","Mentionnez les reglementations BAM"], "hard");
  r("What documents are required for exporting from Morocco?",
    "Quels documents sont necessaires pour exporter depuis le Maroc ?",
    "technical", "commerce-international",
    "Commercial invoice, packing list, bill of lading, certificate of origin (EUR.1 for EU), customs declaration via BADR, and sector-specific certificates (phytosanitary, halal).",
    "Facture commerciale, liste de colisage, connaissement, certificat d'origine (EUR.1 pour l'UE), declaration douaniere via BADR et certificats sectoriels (phytosanitaire, halal).",
    ["List all required documents","Mention electronic systems","Cover sector-specific requirements"], ["Listez tous les documents requis","Mentionnez les systemes electroniques","Couvrez les exigences sectorielles"], "medium");
  r("How do you identify new export markets for Moroccan products?",
    "Comment identifiez-vous de nouveaux marches d'exportation pour les produits marocains ?",
    "situational", "commerce-international",
    "I analyze trade data from DEPF/OdC, study bilateral agreements, use market intelligence from Maroc Export, and conduct competitive analysis against similar exporting countries.",
    "J'analyse les donnees commerciales du DEPF/OdC, etudie les accords bilateraux, utilise l'intelligence de marche de Maroc Export et mene une analyse concurrentielle contre des pays exportateurs similaires.",
    ["Mention data sources","Discuss market selection criteria","Cover entry strategy"], ["Mentionnez les sources de donnees","Discutez les criteres de selection de marche","Couvrez la strategie d'entree"], "hard");

  // Logistique - Additional
  r("How do you implement a transport management system?",
    "Comment implementez-vous un systeme de gestion du transport ?",
    "competency", "logistique",
    "I assess requirements, select TMS software (Oracle TMS, SAP TM), configure routing rules, integrate with ERP and WMS, train users, and measure KPIs.",
    "J'evalue les besoins, selectionne le logiciel TMS (Oracle TMS, SAP TM), configure les regles de routage, integre avec l'ERP et le WMS, forme les utilisateurs et mesure les KPI.",
    ["Discuss selection criteria","Cover integration","Mention KPIs"], ["Discutez les criteres de selection","Couvrez l'integration","Mentionnez les KPI"], "medium");
  r("What are the main logistics challenges in Morocco?",
    "Quels sont les principaux defis logistiques au Maroc ?",
    "situational", "logistique",
    "Infrastructure gaps in rural areas, high logistics costs (20% of GDP vs 12% in EU), fragmented road transport sector, and limited intermodal connections.",
    "Lacunes d'infrastructure en zones rurales, couts logistiques eleves (20% du PIB vs 12% en UE), secteur du transport routier fragmente et connexions intermodales limitees.",
    ["Discuss infrastructure gaps","Mention cost benchmarks","Cover government initiatives"], ["Discutez les lacunes d'infrastructure","Mentionnez les benchmarks de couts","Couvrez les initiatives gouvernementales"], "medium");

  // Management - Additional
  r("How do you create a culture of innovation in a traditional Moroccan company?",
    "Comment creez-vous une culture d'innovation dans une entreprise marocaine traditionnelle ?",
    "situational", "management",
    "I start with quick wins to build trust, create safe spaces for experimentation, celebrate failures as learning, establish innovation labs, and align innovation with cultural values.",
    "Je commence par des victoires rapides pour construire la confiance, cree des espaces surs pour l'experimentation, celebre les echecs comme apprentissage, etablis des labs d'innovation et aligne l'innovation avec les valeurs culturelles.",
    ["Show cultural sensitivity","Discuss practical steps","Cover measurement"], ["Montrez la sensibilite culturelle","Discutez les etapes pratiques","Couvrez la mesure"], "hard");
  r("How do you manage a geographically distributed team in Morocco?",
    "Comment gerez-vous une equipe geographiquement distribuee au Maroc ?",
    "competency", "management",
    "I use digital collaboration tools (Teams, Slack), establish clear communication protocols, schedule regular video check-ins, and create equitable policies for remote and on-site team members.",
    "J'utilise des outils de collaboration numerique (Teams, Slack), etablis des protocoles de communication clairs, planifie des check-ins video reguliers et cree des politiques equitables pour les membres sur site et a distance.",
    ["Mention specific tools","Discuss communication cadence","Cover culture building"], ["Mentionnez des outils specifiques","Discutez la cadence de communication","Couvrez la construction de culture"], "medium");

  // Marketing - Additional
  r("How do you approach influencer marketing in Morocco?",
    "Comment abordez-vous le marketing d'influence au Maroc ?",
    "competency", "marketing",
    "I identify micro-influencers with authentic Moroccan audiences on Instagram and TikTok, negotiate based on engagement rates (not follower count), and track ROI per campaign.",
    "J'identifie des micro-influenceurs avec des audiences marocaines authentiques sur Instagram et TikTok, negocie base sur les taux d'engagement (pas le nombre d'abonnes) et suis le ROI par campagne.",
    ["Discuss platform preferences","Cover pricing models","Mention regulations"], ["Discutez les preferences de plateformes","Couvrez les modeles de tarification","Mentionnez les reglementations"], "medium");
  r("How do you handle negative online reviews for a brand?",
    "Comment gerez-vous les avis en ligne negatifs pour une marque ?",
    "situational", "marketing",
    "Respond professionally and quickly, acknowledge the issue, take the conversation offline if needed, resolve the problem, and follow up publicly to show resolution.",
    "Repondre professionnellement et rapidement, reconnaitre le probleme, prendre la conversation en prive si necessaire, resoudre le probleme et faire un suivi public pour montrer la resolution.",
    ["Show empathy","Discuss response timing","Cover reputation management"], ["Montrez l'empathie","Discutez le timing de reponse","Couvrez la gestion de la reputation"], "easy");

  // Ressources Humaines - Additional
  r("How do you handle a request for workplace accommodation in Morocco?",
    "Comment gerez-vous une demande d'amenagement du poste de travail au Maroc ?",
    "situational", "ressources-humaines",
    "I assess the request per Moroccan disability law (Law 97-13), consult with occupational medicine, propose reasonable accommodations, and document the process.",
    "J'evalue la demande selon la loi marocaine sur le handicap (Loi 97-13), consulte la medecine du travail, propose des amenagements raisonnables et documente le processus.",
    ["Mention legal framework","Discuss reasonable accommodation","Cover documentation"], ["Mentionnez le cadre legal","Discutez l'amenagement raisonnable","Couvrez la documentation"], "hard");
  r("How do you design an effective employee engagement survey?",
    "Comment concevez-vous une enquete d'engagement des employes efficace ?",
    "competency", "ressources-humaines",
    "I design surveys with validated scales (eNPS, Gallup Q12), ensure anonymity, limit length to 15 minutes, analyze results by department, and create action plans.",
    "Je concois des enquetes avec des echelles validees (eNPS, Gallup Q12), assure l'anonymat, limite la duree a 15 minutes, analyse les resultats par departement et cree des plans d'action.",
    ["Mention survey frameworks","Discuss anonymity","Cover action planning"], ["Mentionnez les cadres d'enquete","Discutez l'anonymat","Couvrez la planification d'actions"], "medium");

  // Genie Mecanique - Additional
  r("How do you select materials for a high-temperature application?",
    "Comment selectionnez-vous les materiaux pour une application a haute temperature ?",
    "technical", "genie-mecanique",
    "I consider creep resistance, thermal expansion, oxidation behavior, and cost. For exhaust systems: Inconel or stainless steel 310. For lower temps: chrome-moly steels.",
    "Je considere la resistance au fluage, la dilatation thermique, le comportement a l'oxydation et le cout. Pour les systemes d'echappement: Inconel ou acier inoxydable 310. Pour des temperatures plus basses: aciers chrome-moly.",
    ["Cover material properties","Discuss testing methods","Mention cost considerations"], ["Couvrez les proprietes des materiaux","Discutez les methodes d'essai","Mentionnez les considerations de cout"], "hard");
  r("Explain the difference between FDM, SLA, and SLS 3D printing.",
    "Expliquez la difference entre l'impression 3D FDM, SLA et SLS.",
    "technical", "genie-mecanique",
    "FDM extrudes thermoplastic filament (cheapest, lowest resolution). SLA uses UV-cured resin (high detail, brittle). SLS uses laser-sintered powder (strongest, no supports needed).",
    "FDM extrude un filament thermoplastique (le moins cher, resolution la plus basse). SLA utilise de la resine durcissable aux UV (haute precision, fragile). SLS utilise de la poudre frittee au laser (le plus resistant, pas de supports necessaires).",
    ["Compare accuracy and strength","Discuss use cases","Mention cost ranges"], ["Comparez la precision et la resistance","Discutez les cas d'utilisation","Mentionnez les gammes de prix"], "medium");

  // Genie Industriel - Additional
  r("How do you conduct a root cause analysis?",
    "Comment menez-vous une analyse des causes racines ?",
    "competency", "genie-industriel",
    "I use Ishikawa diagram (fishbone) for brainstorming, 5 Whys for drilling down, and Pareto analysis to prioritize. Then validate with data and implement corrective actions.",
    "J'utilise le diagramme d'Ishikawa (arete de poisson) pour le brainstorming, les 5 Pourquoi pour approfondir et l'analyse de Pareto pour prioriser. Puis je valide avec des donnees et implemente des actions correctives.",
    ["Cover multiple RCA tools","Discuss validation","Mention preventive actions"], ["Couvrez plusieurs outils d'analyse de causes racines","Discutez la validation","Mentionnez les actions preventives"], "medium");
  r("What is TPM (Total Productive Maintenance)?",
    "Qu'est-ce que la TPM (Maintenance Productive Totale) ?",
    "technical", "genie-industriel",
    "TPM involves all employees in equipment maintenance. 8 pillars: autonomous maintenance, planned maintenance, quality maintenance, focused improvement, early management, training, safety, and office TPM.",
    "La TPM implique tous les employes dans la maintenance des equipements. 8 piliers: maintenance autonome, maintenance planifiee, maintenance qualite, amelioration ciblee, gestion precoce, formation, securite et TPM bureau.",
    ["Explain all 8 pillars","Discuss OEE improvement","Cover implementation steps"], ["Expliquez les 8 piliers","Discutez l'amelioration du TRS","Couvrez les etapes d'implementation"], "medium");
  r("How do you implement a Kanban system in a production environment?",
    "Comment implementez-vous un systeme Kanban dans un environnement de production ?",
    "competency", "genie-industriel",
    "I map the current process, calculate Kanban quantities using demand rate and lead time, design visual boards, train operators, and continuously improve cycle times.",
    "Je cartographie le processus actuel, calcule les quantites Kanban en utilisant le taux de demande et le delai, concois des tableaux visuels, forme les operateurs et ameliore continuellement les temps de cycle.",
    ["Cover calculation method","Discuss visual management","Mention continuous improvement"], ["Couvrez la methode de calcul","Discutez le management visuel","Mentionnez l'amelioration continue"], "medium");

  // More behavioral/general for all fields
  r("How do you explain technical concepts to non-technical stakeholders?",
    "Comment expliquez-vous des concepts techniques a des parties prenantes non techniques ?",
    "behavioral", "general",
    "I use analogies, visual aids, and focus on business impact rather than technical details. I adjust my language based on the audience's background.",
    "J'utilise des analogies, des supports visuels et me concentre sur l'impact business plutot que les details techniques. J'adapte mon langage au niveau de l'audience.",
    ["Show communication skills","Use analogies","Discuss audience awareness"], ["Montrez les competences de communication","Utilisez des analogies","Discutez la conscience de l'audience"], "easy");
  r("Tell me about a project that you are most proud of.",
    "Parlez-moi d'un projet dont vous etes le plus fier.",
    "behavioral", "general",
    "Choose a project with measurable impact, explain your specific role, challenges overcome, and the lasting positive effect it had on the organization.",
    "Choisissez un projet avec un impact mesurable, expliquez votre role specifique, les defis surmontes et l'effet positif durable qu'il a eu sur l'organisation.",
    ["Quantify impact","Show your specific contribution","Discuss challenges overcome"], ["Quantifiez l'impact","Montrez votre contribution specifique","Discutez les defis surmontes"], "easy");
  r("How do you build trust with a new team?",
    "Comment construisez-vous la confiance avec une nouvelle equipe ?",
    "behavioral", "general",
    "I listen actively, deliver on commitments, show vulnerability by admitting what I don't know, and consistently demonstrate competence and integrity.",
    "J'ecoute activement, tiens mes engagements, montre de la vulnerabilite en admettant ce que je ne sais pas et demontre constamment competence et integrite.",
    ["Discuss specific actions","Show emotional intelligence","Cover cultural considerations"], ["Discutez des actions specifiques","Montrez l'intelligence emotionnelle","Couvrez les considerations culturelles"], "easy");
  r("What questions do you have for us?",
    "Avez-vous des questions pour nous ?",
    "motivation", "general",
    "Always prepare thoughtful questions: about team dynamics, growth opportunities, company challenges, and what success looks like in this role.",
    "Preparez toujours des questions reflechies: sur la dynamique d'equipe, les opportunites de croissance, les defis de l'entreprise et ce a quoi ressemble le succes dans ce poste.",
    ["Prepare 3-5 questions","Ask about team and culture","Show genuine curiosity"], ["Preparez 3-5 questions","Demandez a propos de l'equipe et la culture","Montrez une curiosite sincere"], "easy");
  r("Describe a time you had to deliver bad news to a client or manager.",
    "Decrivez une fois ou vous avez du annoncer une mauvaise nouvelle a un client ou un manager.",
    "behavioral", "general",
    "I prepared the facts, delivered the news directly and empathetically, presented analysis of root causes, and came with proposed solutions and a recovery plan.",
    "J'ai prepare les faits, annonce la nouvelle directement et avec empathie, presente l'analyse des causes racines et suis venu avec des solutions proposees et un plan de redressement.",
    ["Show honesty and empathy","Come with solutions","Discuss lessons learned"], ["Montrez honnetete et empathie","Venez avec des solutions","Discutez les lecons tirees"], "medium");

  return rows;
}

// ─── 4. ADDITIONAL RESUME GALLERY (200+) ─────────────────────────────────────

function buildMoreResumes() {
  const rows = [];
  const fields = ["genie-informatique", "finance", "genie-civil", "genie-electrique", "genie-mecanique", "genie-industriel", "commerce-international", "logistique", "management", "marketing", "ressources-humaines", "general"];
  const templates = ["azurill", "bronzor", "chikorita", "ditto", "gengar", "glalie", "kakuna", "leafish", "nosepass", "onyx", "pikachu", "rhyhorn", "casablanca", "marrakech", "fes", "tangier", "rabat", "agadir", "essaouira", "chefchaouen", "meknes", "nador", "oujda", "tetouan", "ifrane", "safi", "kenitra", "beni-mellal", "eljadida", "ouarzazate", "taza"];
  const firstNames = ["Driss", "Karima", "Nabil", "Samira", "Reda", "Latifa", "Younes", "Amina", "Hicham", "Bouchra", "Mustapha", "Nawal", "Jawad", "Asmaa", "Tarik", "Safae", "Issam", "Hanae", "Abdellatif", "Malika", "Kamal", "Rajae", "Abderrahim", "Wafaa", "Fouad", "Hayat", "Badr", "Jihane", "Mounir", "Siham", "Aziz", "Nisrine", "Saad", "Ikram", "Hamid", "Lamia", "Anass", "Oumaima", "Bilal", "Zainab"];
  const lastNames = ["Benmoussa", "El Khattabi", "Ziani", "Belhaj", "Kharbouch", "Amrani", "Boussaid", "El Ouafi", "Hafidi", "Lakhdar", "Mountassir", "Nejjar", "Omari", "Rhazi", "Squalli", "Touhami", "Yaacoubi", "Zenati", "Aboulouz", "Belkacem", "Chahbi", "Dehbi", "Ezzahiri", "Faiq", "Ghannam", "Hihi", "Izem", "Jouhari", "Khaldi", "Lamsyah", "Mansouf", "Nouini", "Ouaddi", "Regragui", "Sabri", "Taibi", "Ouchikh", "Vitre", "Wadih", "Yalaoui"];
  const cities = ["Casablanca", "Rabat", "Tangier", "Fes", "Marrakech", "Agadir", "Meknes", "Oujda", "Kenitra", "Tetouan", "Mohammedia", "Sale", "El Jadida", "Beni Mellal", "Nador", "Khouribga", "Taza", "Settat", "Larache", "Berrechid"];
  const schools = {
    "genie-informatique": ["ENSIAS Rabat", "INPT Rabat", "ENSA Tanger", "EMI Rabat", "FST Fes", "ENSA Kenitra", "EMSI Casa", "UM6P", "ENSET Mohammedia"],
    "finance": ["ISCAE Casa", "ENCG Settat", "HEM Casa", "UM5 Rabat", "ENCG Tanger"],
    "genie-civil": ["EHTP Casa", "EMI Rabat", "ENSA Fes", "ENSA Marrakech"],
    "genie-electrique": ["ENSA Kenitra", "EMI Rabat", "ENSEM Casa", "FST Settat"],
    "genie-mecanique": ["ENSEM Casa", "EMI Rabat", "ENSA Agadir", "ENSA Oujda"],
    "genie-industriel": ["EMI Rabat", "ENSAM Meknes", "ENSA Marrakech", "EHTP Casa"],
    "commerce-international": ["ENCG Casa", "ISCAE Casa", "HEM Rabat", "ENCG Tanger"],
    "logistique": ["ENCG Agadir", "ISCAE Casa", "EST Sale", "ISLI ISCAE"],
    "management": ["ISCAE Casa", "HEM Casa", "ENCG Settat", "Al Akhawayn"],
    "marketing": ["ENCG Casa", "ISCAE Casa", "HEM Rabat", "Sup de Co"],
    "ressources-humaines": ["ISCAE Casa", "ENCG Settat", "HEM Casa", "UM5 Rabat"],
    "general": ["UM5 Rabat", "UH2C Casa", "USMBA Fes", "UM6P"],
  };
  const companies = {
    "genie-informatique": ["SQLI Maroc", "CGI Maroc", "Capgemini", "Atos Morocco", "NTT Data", "Devoteam", "Sofrecom", "Accenture"],
    "finance": ["Attijariwafa", "BMCE", "CDG Capital", "Deloitte", "KPMG", "PwC", "CIH Bank"],
    "genie-civil": ["SGTM", "SOMAGEC", "Jet Contractors", "TGCC", "Bouygues Maroc"],
    "genie-electrique": ["Schneider Electric", "ABB", "Nexans", "ONEE", "Siemens"],
    "genie-mecanique": ["Renault", "PSA/Stellantis", "SOMACA", "Valeo", "Delphi"],
    "genie-industriel": ["OCP Group", "Lafarge Holcim", "Managem", "Centrale Danone", "Cosumar"],
    "commerce-international": ["Maroc Export", "BMCI Trade", "DHL", "Bolore"],
    "logistique": ["SDTM", "SNTL", "Geodis", "DB Schenker", "Timar"],
    "management": ["McKinsey", "BCG", "Accenture", "Roland Berger"],
    "marketing": ["Publicis", "JWT", "Webhelp", "Majorel"],
    "ressources-humaines": ["Manpower", "Adecco", "ReKrute", "M2M Group"],
    "general": ["Marjane", "ONCF", "RAM", "Wana"],
  };
  const headlines = {
    "genie-informatique": ["Architecte Logiciel", "Ingenieur Backend", "Ingenieur Frontend", "Data Scientist", "DevSecOps Engineer", "SRE Engineer", "Ingenieur IA", "CTO Startup"],
    "finance": ["Directeur Financier", "Analyste M&A", "Tresorier Senior", "Risk Analyst", "Portfolio Manager", "Auditeur Interne"],
    "genie-civil": ["Directeur de Projet BTP", "Ingenieur Routier", "BIM Manager", "Ingenieur Hydraulique", "Conducteur de Travaux"],
    "genie-electrique": ["Ingenieur Solaire", "Automaticien Senior", "Chef Projet Electrique", "Ingenieur HT/MT", "Ingenieur IoT"],
    "genie-mecanique": ["Responsable Methodes", "Ingenieur Qualite Auto", "Ingenieur R&D", "Chef d'Atelier", "Ingenieur Maintenance"],
    "genie-industriel": ["Directeur Usine", "Lean Manager", "Ingenieur Amelioration Continue", "HSE Manager", "Chef de Production"],
    "commerce-international": ["Directeur Export", "Trade Compliance Officer", "Acheteur International", "Business Developer Afrique"],
    "logistique": ["Directeur Supply Chain", "Responsable Operations", "Chef de Quai", "Fleet Manager"],
    "management": ["Directeur General Adjoint", "Business Analyst Senior", "Consultant Strategy", "Program Director"],
    "marketing": ["CMO", "Growth Manager", "Brand Manager", "Performance Marketing Lead"],
    "ressources-humaines": ["Directeur RH", "HRBP Senior", "Responsable Relations Sociales", "Talent Acquisition Lead"],
    "general": ["Chef de Projet Junior", "Assistant Manager", "Coordinateur Programmes", "Charge de Developpement"],
  };

  let tIdx = 0;
  let sOrder = 800;

  for (const field of fields) {
    const count = field === "genie-informatique" ? 25 : field === "finance" ? 20 : field === "general" ? 20 : 15;
    for (let i = 0; i < count; i++) {
      const fn = firstNames[(sOrder + i * 3) % firstNames.length];
      const ln = lastNames[(sOrder + i * 3 + 11) % lastNames.length];
      const template = templates[tIdx % templates.length];
      tIdx++;
      const expYears = [0, 1, 2, 3, 5, 7, 10, 12, 15][i % 9];
      const city = cities[(sOrder + i) % cities.length];
      const school = schools[field][(sOrder + i) % schools[field].length];
      const company = companies[field][(sOrder + i) % companies[field].length];
      const headline = headlines[field][(sOrder + i) % headlines[field].length];
      const atsScore = 70 + (i % 25);
      const lang = i % 4 === 0 ? "en" : "fr";
      const levelLabel = expYears <= 1 ? "Debutant" : expYears <= 3 ? "Junior" : expYears <= 7 ? "Confirme" : "Expert";

      const name = `${fn} ${ln} — ${levelLabel} ${headline} (${city})`;
      const nameFr = name;
      const desc = `${headline} profile with ${expYears} years of experience based in ${city}, Morocco`;
      const descFr = `Profil ${headline} avec ${expYears} ans d'experience base(e) a ${city}, Maroc`;

      const resumeData = {
        basics: { cin: "", name: `${fn} ${ln}`, email: `${fn.toLowerCase()}.${ln.toLowerCase().replace(/ /g, "")}@email.ma`, phone: `06${String(Math.floor(Math.random() * 90000000) + 10000000)}`, headline, location: city },
        summary: { content: descFr },
        sections: {
          skills: { items: [{ name: "Excel", proficiency: "Advanced" }, { name: "Communication", proficiency: "Advanced" }] },
          education: { items: [{ field: field.replace(/-/g, " "), grade: "", degree: "Diplome", period: `${2024 - expYears - 5} - ${2024 - expYears}`, school }] },
          languages: { items: [{ name: "Arabe", proficiency: "Native" }, { name: "Francais", proficiency: "Fluent" }, { name: "Anglais", proficiency: "Intermediate" }] },
          experience: { items: expYears > 0 ? [{ period: `${2024 - expYears} - Present`, company, position: headline, description: "- Gestion de projets\n- Suivi des KPI\n- Collaboration transversale" }] : [] },
        },
      };

      rows.push([uuid(), name, nameFr, field, null, expYears, template, lang, desc, descFr, JSON.stringify(resumeData),
        `{${field},${levelLabel.toLowerCase()},${city.toLowerCase()}}`, atsScore, i < 2, 0, 0, true, new Date(), new Date()]);
      sOrder++;
    }
  }
  return rows;
}

// ─── 5. ADDITIONAL SKILL LIBRARY (50+) ───────────────────────────────────────

function buildMoreSkills() {
  const rows = [];
  const r = (name, nameFr, field, cat, desc, descFr) => {
    rows.push([uuid(), name, nameFr, field, cat, desc, descFr, true, true, rows.length + 200, new Date(), new Date()]);
  };

  // More technical skills
  r("GraphQL API Design", "Conception API GraphQL", "genie-informatique", "technical", "Query language for APIs with type-safe schema definitions", "Langage de requete pour les API avec definitions de schema type-safe");
  r("Redis Caching", "Cache Redis", "genie-informatique", "tool", "In-memory data structure store for caching and session management", "Magasin de structures de donnees en memoire pour le cache et la gestion de session");
  r("Elasticsearch", "Elasticsearch", "genie-informatique", "tool", "Distributed search and analytics engine for log management and full-text search", "Moteur de recherche et d'analytique distribue pour la gestion des logs et la recherche en texte integral");
  r("RabbitMQ / Kafka", "RabbitMQ / Kafka", "genie-informatique", "tool", "Message brokers for event-driven and microservices architectures", "Courtiers de messages pour les architectures evenementielles et microservices");
  r("Next.js / Nuxt.js", "Next.js / Nuxt.js", "genie-informatique", "tool", "Full-stack React/Vue frameworks with SSR, SSG, and API routes", "Frameworks full-stack React/Vue avec SSR, SSG et routes API");
  r("Flutter / React Native", "Flutter / React Native", "genie-informatique", "tool", "Cross-platform mobile app development frameworks", "Frameworks de developpement d'applications mobiles multi-plateformes");
  r("Figma Design", "Design Figma", "genie-informatique", "tool", "Collaborative UI/UX design tool for web and mobile interfaces", "Outil de design UI/UX collaboratif pour interfaces web et mobiles");
  r("GitHub Actions CI/CD", "GitHub Actions CI/CD", "genie-informatique", "tool", "GitHub's built-in automation platform for CI/CD workflows", "Plateforme d'automatisation integree de GitHub pour les workflows CI/CD");

  // More finance
  r("Python for Finance", "Python pour la Finance", "finance", "tool", "Python programming for financial analysis, quantitative models, and automation", "Programmation Python pour l'analyse financiere, modeles quantitatifs et automatisation");
  r("VBA/Excel Macros", "VBA/Macros Excel", "finance", "tool", "Visual Basic scripting for financial model automation", "Scripting Visual Basic pour l'automatisation de modeles financiers");
  r("Moroccan Banking Regulation", "Reglementation Bancaire Marocaine", "finance", "technical", "Knowledge of BAM circulars, capital requirements, and AMMC regulations", "Connaissance des circulaires BAM, exigences en capital et reglementations AMMC");
  r("Treasury Management (Kyriba)", "Gestion de Tresorerie (Kyriba)", "finance", "tool", "Cloud treasury management for cash visibility and liquidity planning", "Gestion de tresorerie cloud pour la visibilite de la tresorerie et la planification de la liquidite");

  // More industrial
  r("SAP PP (Production Planning)", "SAP PP (Planification de Production)", "genie-industriel", "tool", "SAP module for production planning and manufacturing execution", "Module SAP pour la planification de production et l'execution de fabrication");
  r("MES (Manufacturing Execution System)", "MES (Systeme d'Execution de Fabrication)", "genie-industriel", "tool", "Real-time monitoring and control of factory floor operations", "Surveillance et controle en temps reel des operations de l'atelier de production");
  r("Value Stream Mapping", "Cartographie de la Chaine de Valeur", "genie-industriel", "technical", "Lean tool for visualizing and optimizing material and information flow", "Outil lean pour visualiser et optimiser les flux de materiaux et d'information");
  r("FMEA (Failure Mode Analysis)", "AMDEC (Analyse des Modes de Defaillance)", "genie-industriel", "technical", "Risk assessment methodology for identifying potential failure modes", "Methodologie d'evaluation des risques pour identifier les modes de defaillance potentiels");
  r("Lean Manufacturing Certification", "Certification Lean Manufacturing", "genie-industriel", "certification", "Professional certification in lean principles and waste elimination", "Certification professionnelle en principes lean et elimination des gaspillages");

  // More civil engineering
  r("Robot Structural Analysis", "Robot Structural Analysis", "genie-civil", "tool", "Autodesk structural analysis software for finite element analysis", "Logiciel d'analyse structurale Autodesk pour l'analyse par elements finis");
  r("Primavera P6 Scheduling", "Planification Primavera P6", "genie-civil", "tool", "Enterprise project portfolio management and scheduling", "Gestion de portefeuille de projets d'entreprise et ordonnancement");
  r("Geotechnical Engineering", "Ingenierie Geotechnique", "genie-civil", "technical", "Soil mechanics, foundation engineering, and slope stability analysis", "Mecanique des sols, ingenierie des fondations et analyse de stabilite des pentes");

  // More electrical
  r("PVSYST Solar Design", "Conception Solaire PVSYST", "genie-electrique", "tool", "Photovoltaic system design and simulation software", "Logiciel de conception et simulation de systemes photovoltaiques");
  r("SEE Electrical Design", "Conception SEE Electrical", "genie-electrique", "tool", "Electrical CAD software for schematic design and panel layout", "Logiciel de CAO electrique pour la conception de schemas et l'agencement de panneaux");

  // More marketing
  r("CRM (Salesforce/Zoho)", "CRM (Salesforce/Zoho)", "marketing", "tool", "Customer relationship management platforms for sales pipeline management", "Plateformes de gestion de la relation client pour la gestion du pipeline de vente");
  r("Adobe Creative Suite", "Suite Adobe Creative", "marketing", "tool", "Design tools: Photoshop, Illustrator, InDesign, Premiere Pro", "Outils de design: Photoshop, Illustrator, InDesign, Premiere Pro");
  r("Canva Pro", "Canva Pro", "marketing", "tool", "Online graphic design platform for social media and marketing materials", "Plateforme de design graphique en ligne pour les reseaux sociaux et le materiel marketing");

  // More logistics
  r("Lean Warehousing", "Entreposage Lean", "logistique", "technical", "Applying lean principles to warehouse operations for waste reduction", "Application des principes lean aux operations d'entreposage pour la reduction des gaspillages");
  r("Last Mile Delivery Optimization", "Optimisation Livraison Dernier Kilometre", "logistique", "technical", "Route optimization algorithms for final delivery to customers", "Algorithmes d'optimisation de routes pour la livraison finale aux clients");

  // More HR
  r("LinkedIn Recruiter", "LinkedIn Recruiter", "ressources-humaines", "tool", "Professional recruiting tool for sourcing and engaging candidates", "Outil de recrutement professionnel pour le sourcing et l'engagement de candidats");
  r("Cornerstone OnDemand", "Cornerstone OnDemand", "ressources-humaines", "tool", "Cloud-based talent management and learning platform", "Plateforme cloud de gestion des talents et d'apprentissage");
  r("GPEC (Workforce Planning)", "GPEC (Gestion Previsionnelle des Emplois)", "ressources-humaines", "technical", "Strategic workforce planning methodology used in French-speaking countries", "Methodologie de planification strategique de la main-d'oeuvre utilisee dans les pays francophones");

  // More management
  r("Balanced Scorecard", "Tableau de Bord Prospectif", "management", "technical", "Strategic performance management framework by Kaplan and Norton", "Cadre de gestion strategique de la performance de Kaplan et Norton");
  r("Business Model Canvas", "Business Model Canvas", "management", "technical", "Strategic management template for developing business models", "Template de gestion strategique pour le developpement de modeles d'affaires");
  r("COBIT IT Governance", "Gouvernance IT COBIT", "management", "certification", "Framework for IT management and governance best practices", "Cadre pour les bonnes pratiques de management et gouvernance IT");
  r("ITIL v4 Foundation", "ITIL v4 Foundation", "management", "certification", "IT service management framework certification", "Certification du cadre de gestion des services IT");

  // More commerce
  r("Trade Finance (L/C, SBLC)", "Finance du Commerce (L/C, SBLC)", "commerce-international", "technical", "Documentary and standby letters of credit for trade financing", "Lettres de credit documentaires et standby pour le financement du commerce");
  r("SAP SD (Sales & Distribution)", "SAP SD (Ventes & Distribution)", "commerce-international", "tool", "SAP module for order management and distribution logistics", "Module SAP pour la gestion des commandes et la logistique de distribution");

  // Additional general certifications
  r("Google Professional Cloud Architect", "Google Professional Cloud Architect", "genie-informatique", "certification", "Google Cloud certification for designing cloud solutions", "Certification Google Cloud pour la conception de solutions cloud");
  r("AWS Solutions Architect Associate", "AWS Solutions Architect Associate", "genie-informatique", "certification", "AWS certification for designing distributed systems on cloud", "Certification AWS pour la conception de systemes distribues sur cloud");
  r("CISSP Security Certification", "Certification Securite CISSP", "genie-informatique", "certification", "Certified Information Systems Security Professional for cybersecurity leaders", "Professionnel Certifie en Securite des Systemes d'Information pour les leaders en cybersecurite");
  r("ACCA Qualification", "Qualification ACCA", "finance", "certification", "Association of Chartered Certified Accountants global certification", "Certification mondiale de l'Association des Comptables Agrees Certifies");
  r("DSCG (French Accounting)", "DSCG (Comptabilite Francaise)", "finance", "certification", "Diplome Superieur de Comptabilite et de Gestion, recognized in Morocco", "Diplome Superieur de Comptabilite et de Gestion, reconnu au Maroc");

  return rows;
}

// ─── 6. ADDITIONAL CAREER EMPLOYERS (60+) ────────────────────────────────────

function buildMoreEmployers() {
  const rows = [];
  const r = (name, sector, sectorFr, loc, locFr, pos, web, desc, descFr, fields) => {
    rows.push([uuid(), name, sector, sectorFr, loc, locFr, pos, web, null, desc, descFr, JSON.stringify(fields), true, rows.length + 300, new Date(), new Date()]);
  };

  r("Lesieur Cristal", "Edible Oils & Soap", "Huiles Alimentaires & Savon", "Casablanca", "Casablanca", 20,
    "https://lesieurchristal.ma", "Leading edible oils and soap manufacturer in Morocco", "Fabricant leader d'huiles alimentaires et de savon au Maroc", ["industrial"]);
  r("Cosumar", "Sugar Industry", "Industrie Sucriere", "Casablanca", "Casablanca", 25,
    "https://cosumar.co.ma", "Morocco's sole sugar producer, processing 50% of national sugar consumption", "Seul producteur de sucre du Maroc, transformant 50% de la consommation nationale", ["industrial"]);
  r("Centrale Danone", "Dairy Products", "Produits Laitiers", "Casablanca", "Casablanca", 30,
    "https://centraledanone.ma", "Leading dairy company in Morocco, Danone subsidiary", "Premiere entreprise laitiere du Maroc, filiale de Danone", ["industrial", "marketing"]);
  r("Vivo Energy Morocco", "Fuel Distribution (Shell)", "Distribution de Carburant (Shell)", "Casablanca, National Coverage", "Casablanca, Couverture Nationale", 25,
    "https://vivoenergy.com/morocco", "Shell-branded fuel retailer and lubricant distributor in Morocco", "Distributeur de carburant et de lubrifiants sous marque Shell au Maroc", ["industrial", "logistics"]);
  r("Colorado Morocco", "Paints & Coatings", "Peintures & Revetements", "Casablanca", "Casablanca", 15,
    "https://colorado.ma", "Morocco's leading paint manufacturer with 30% market share", "Premier fabricant de peintures du Maroc avec 30% de part de marche", ["industrial"]);
  r("Richbond", "Furniture & Mattresses", "Mobilier & Matelas", "Casablanca", "Casablanca", 20,
    "https://richbond.ma", "Major Moroccan furniture and mattress manufacturer", "Fabricant majeur marocain de mobilier et matelas", ["industrial", "commerce"]);
  r("Groupe Addoha", "Real Estate Development", "Promotion Immobiliere", "Casablanca", "Casablanca", 35,
    "https://groupeaddoha.com", "One of Morocco's largest real estate developers with 300,000+ units built", "Un des plus grands promoteurs immobiliers du Maroc avec plus de 300 000 unites construites", ["industrial"]);
  r("Alliances Developpement Immobilier", "Real Estate & Hospitality", "Immobilier & Hotellerie", "Casablanca", "Casablanca", 30,
    "https://alliancesdeveloppement.com", "Luxury real estate and hospitality developer in Morocco", "Promoteur immobilier de luxe et hotelier au Maroc", ["industrial", "management"]);
  r("Medi1 TV", "Broadcasting & Media", "Medias & Audiovisuel", "Tangier", "Tanger", 15,
    "https://medi1tv.com", "Pan-Arab television channel broadcasting from Morocco", "Chaine de television pan-arabe diffusant depuis le Maroc", ["media", "marketing"]);
  r("2M Television", "Broadcasting", "Audiovisuel", "Casablanca", "Casablanca", 20,
    "https://2m.ma", "Morocco's second national television channel", "Deuxieme chaine de television nationale du Maroc", ["media", "marketing"]);
  r("Groupe Eco Media", "Digital Media & Publishing", "Medias Numeriques & Edition", "Casablanca", "Casablanca", 15,
    "https://ecoactu.ma", "Leading Moroccan business media group (Eco-Medias, L'Economiste)", "Groupe media economique marocain leader (Eco-Medias, L'Economiste)", ["media"]);
  r("LafargeHolcim Maroc", "Cement & Aggregates", "Ciment & Granulats", "Casablanca", "Casablanca", 30,
    "https://lafargeholcim.ma", "Swiss-French cement giant, largest cement producer in Morocco", "Geant suisse-francais du ciment, plus grand producteur de ciment au Maroc", ["industrial"]);
  r("Yazaki Morocco", "Automotive Wiring", "Cablage Automobile", "Tangier, Kenitra, Meknes", "Tanger, Kenitra, Meknes", 80,
    "https://yazaki-group.com", "Japanese automotive wiring harness manufacturer, largest employer in Tangier Free Zone", "Fabricant japonais de faisceaux de cablage automobile, plus grand employeur de la Zone Franche de Tanger", ["industrial"]);
  r("Sumitomo Electric Morocco", "Automotive Wiring", "Cablage Automobile", "Tangier Free Zone", "Zone Franche Tanger", 60,
    "https://sei.co.jp", "Japanese wiring harness manufacturer with major Morocco operations", "Fabricant japonais de faisceaux de cablage avec des operations majeures au Maroc", ["industrial"]);
  r("Lear Corporation Morocco", "Automotive Seating & Electrical", "Sieges & Electrique Automobile", "Kenitra, Tangier", "Kenitra, Tanger", 40,
    "https://lear.com", "American automotive seating and electrical systems manufacturer", "Fabricant americain de sieges automobiles et systemes electriques", ["industrial"]);
  r("Aptiv Morocco (ex-Delphi)", "Automotive Technology", "Technologie Automobile", "Tangier", "Tanger", 35,
    "https://aptiv.com", "Global technology company focused on safer, connected vehicles", "Entreprise technologique mondiale axee sur des vehicules plus surs et connectes", ["tech", "industrial"]);
  r("STMicroelectronics Morocco", "Semiconductor Manufacturing", "Fabrication de Semi-conducteurs", "Casablanca (Bouskoura)", "Casablanca (Bouskoura)", 25,
    "https://st.com", "European semiconductor manufacturer with testing facility in Morocco", "Fabricant europeen de semi-conducteurs avec centre de test au Maroc", ["tech", "industrial"]);
  r("Thales Morocco", "Defense & Aerospace Electronics", "Electronique Defense & Aerospatiale", "Casablanca", "Casablanca", 20,
    "https://thalesgroup.com/morocco", "French defense electronics and cybersecurity company", "Entreprise francaise d'electronique de defense et de cybersecurite", ["tech", "industrial"]);
  r("Safran Morocco", "Aerospace Components", "Composants Aerospatiaux", "Casablanca (MIDPARC)", "Casablanca (MIDPARC)", 25,
    "https://safran-group.com", "French aerospace group manufacturing nacelles and wiring in Morocco", "Groupe aerospatial francais fabriquant nacelles et cablage au Maroc", ["industrial"]);
  r("Bombardier Morocco", "Aerospace Structures", "Structures Aerospatiales", "Casablanca (MIDPARC)", "Casablanca (MIDPARC)", 20,
    "https://bombardier.com", "Canadian aerospace manufacturer producing fuselage components in Morocco", "Fabricant aerospatial canadien produisant des composants de fuselage au Maroc", ["industrial"]);
  r("SNOP Morocco", "Automotive Stamping", "Emboutissage Automobile", "Tangier Free Zone", "Zone Franche Tanger", 15,
    "https://snop.eu", "European automotive stamping and assembly specialist in Morocco free zone", "Specialiste europeen de l'emboutissage et de l'assemblage automobile en zone franche marocaine", ["industrial"]);
  r("Leoni Morocco", "Wiring Systems", "Systemes de Cablage", "Berrechid, Ain Sebaa", "Berrechid, Ain Sebaa", 30,
    "https://leoni.com", "German wiring and cable manufacturer with multiple Morocco factories", "Fabricant allemand de cablage avec plusieurs usines au Maroc", ["industrial"]);
  r("Nexans Morocco", "Cable Manufacturing", "Fabrication de Cables", "Mohammedia", "Mohammedia", 20,
    "https://nexans.ma", "French cable manufacturer for energy and telecom infrastructure", "Fabricant francais de cables pour l'infrastructure energetique et telecom", ["industrial"]);
  r("Sofitel Morocco", "Luxury Hospitality", "Hotellerie de Luxe", "Casablanca, Marrakech, Agadir", "Casablanca, Marrakech, Agadir", 40,
    "https://sofitel.accor.com", "Accor's luxury hotel brand operating 5 properties across Morocco", "Marque hoteliere de luxe d'Accor operant 5 etablissements au Maroc", ["hospitality", "management"]);
  r("Four Seasons Morocco", "Luxury Hospitality", "Hotellerie de Luxe", "Casablanca, Marrakech", "Casablanca, Marrakech", 30,
    "https://fourseasons.com/marrakech", "Ultra-luxury hotel group with properties in major Moroccan cities", "Groupe hotelier ultra-luxe avec des proprietes dans les grandes villes marocaines", ["hospitality", "management"]);
  r("Royal Air Maroc (RAM)", "Aviation & Air Transport", "Aviation & Transport Aerien", "Casablanca", "Casablanca", 50,
    "https://royalairmaroc.com", "Morocco's national airline connecting 100+ destinations worldwide", "Compagnie aerienne nationale du Maroc connectant plus de 100 destinations mondiales", ["logistics", "management"]);
  r("ONCF (Railways)", "Rail Transport", "Transport Ferroviaire", "Rabat, National Coverage", "Rabat, Couverture Nationale", 40,
    "https://oncf.ma", "National railway operator running Al Boraq high-speed train and commuter services", "Operateur ferroviaire national exploitant le train a grande vitesse Al Boraq et les services de banlieue", ["logistics", "industrial"]);
  r("Tanger Med Port Authority", "Port & Logistics", "Port & Logistique", "Tangier", "Tanger", 30,
    "https://tangermed.ma", "Authority managing Africa's largest container port and logistics zone", "Autorite gerant le plus grand port a conteneurs d'Afrique et la zone logistique", ["logistics", "management"]);
  r("Bank of Africa (BMCE)", "Banking & Financial Services", "Banque & Services Financiers", "Casablanca", "Casablanca", 40,
    "https://bankofafrica.ma", "Pan-African banking group present in 20+ African countries", "Groupe bancaire pan-africain present dans plus de 20 pays africains", ["finance"]);
  r("Credit du Maroc", "Retail Banking", "Banque de Detail", "Casablanca", "Casablanca", 25,
    "https://creditdumaroc.ma", "Moroccan bank, subsidiary of Credit Agricole France, serving 1M+ clients", "Banque marocaine, filiale du Credit Agricole France, desservant plus de 1M de clients", ["finance"]);
  r("Credit Immobilier et Hotelier (CIH)", "Specialized Banking", "Banque Specialisee", "Casablanca", "Casablanca", 20,
    "https://cih.co.ma", "Moroccan bank specializing in real estate and digital banking", "Banque marocaine specialisee dans l'immobilier et la banque digitale", ["finance", "tech"]);
  r("Al Barid Bank", "Postal Banking", "Banque Postale", "Rabat, National Coverage", "Rabat, Couverture Nationale", 30,
    "https://albaridbankgroup.ma", "Morocco's postal bank serving 8M+ clients through 1,800+ points of service", "Banque postale du Maroc desservant plus de 8M de clients a travers plus de 1 800 points de service", ["finance"]);

  // Additional tech companies
  r("Capgemini Engineering Morocco", "Engineering Services", "Services d'Ingenierie", "Casablanca (Casanearshore)", "Casablanca (Casanearshore)", 50,
    "https://capgemini.com/ma", "Engineering and R&D services division of Capgemini in Morocco", "Division services d'ingenierie et R&D de Capgemini au Maroc", ["tech", "engineering"]);
  r("Atos Morocco", "IT Services & Consulting", "Services IT & Conseil", "Casablanca", "Casablanca", 40,
    "https://atos.net/morocco", "French IT services company with major nearshore center in Casablanca", "Societe francaise de services IT avec centre nearshore majeur a Casablanca", ["tech"]);
  r("Sofrecom Morocco", "Telecom Consulting", "Conseil Telecom", "Rabat", "Rabat", 30,
    "https://sofrecom.com", "Orange subsidiary providing digital transformation consulting", "Filiale d'Orange fournissant du conseil en transformation numerique", ["tech", "telecom"]);
  r("NTT Data Morocco", "IT Services & Digital", "Services IT & Digital", "Casablanca", "Casablanca", 35,
    "https://nttdata.com/morocco", "Japanese IT services giant with growing Morocco delivery center", "Geant japonais des services IT avec un centre de livraison en croissance au Maroc", ["tech"]);
  r("Devoteam Morocco", "Digital Consulting", "Conseil Digital", "Casablanca", "Casablanca", 25,
    "https://devoteam.ma", "European digital consulting firm focusing on cloud, AI, and cybersecurity", "Cabinet de conseil digital europeen axe sur le cloud, l'IA et la cybersecurite", ["tech"]);

  // Additional government/NGO
  r("Moroccan Agency for Solar Energy (MASEN)", "Renewable Energy Development", "Developpement Energies Renouvelables", "Rabat", "Rabat", 15,
    "https://masen.ma", "Government agency developing Morocco's ambitious renewable energy program", "Agence gouvernementale developpant le programme ambitieux d'energies renouvelables du Maroc", ["industrial", "hse"]);
  r("Caisse de Depot et de Gestion (CDG)", "Public Investment", "Investissement Public", "Rabat", "Rabat", 25,
    "https://cdg.ma", "Morocco's sovereign wealth fund managing pensions and public investments", "Fonds souverain du Maroc gerant les retraites et les investissements publics", ["finance", "management"]);

  return rows;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Massive Data Expansion - PART 2 ===\n");
  await client.connect();

  const tables = ["job_resource", "career_market_insight", "interview_common_question", "resume_gallery", "skill_library", "career_employer"];
  const before = {};
  for (const t of tables) { const r = await client.query(`SELECT COUNT(*) FROM ${t}`); before[t] = parseInt(r.rows[0].count, 10); }
  const totalBefore = Object.values(before).reduce((a, b) => a + b, 0);
  console.log(`Starting total: ${totalBefore}\n`);

  // 1. Job Resources
  console.log("[1/6] More job_resource...");
  const jr = buildMoreJobResources();
  const jrI = await batchInsert("job_resource",
    ["id","name","name_fr","category","sub_category","description","description_fr","website","contact_email","contact_phone","location","fields","tags","is_free","rating","is_active","sort_order","created_at","updated_at"],
    jr, "name");
  console.log(`  -> ${jrI}/${jr.length} inserted`);

  // 2. Market Insights
  console.log("[2/6] More career_market_insight...");
  const cmi = buildMoreInsights();
  const cmiI = await batchInsert("career_market_insight",
    ["id","title","title_fr","value","description","description_fr","icon","color","field","is_active","sort_order","created_at","updated_at"],
    cmi, "title");
  console.log(`  -> ${cmiI}/${cmi.length} inserted`);

  // 3. Interview Questions
  console.log("[3/6] More interview_common_question...");
  const icq = buildMoreQuestions();
  const icqI = await batchInsert("interview_common_question",
    ["id","question","question_fr","type","field","sample_answer","sample_answer_fr","tips","tips_fr","difficulty","is_active","sort_order","created_at","updated_at"],
    icq, "id");
  console.log(`  -> ${icqI}/${icq.length} inserted`);

  // 4. Resume Gallery
  console.log("[4/6] More resume_gallery...");
  const rg = buildMoreResumes();
  const rgI = await batchInsert("resume_gallery",
    ["id","name","name_fr","field","sub_field","experience_years","template_name","language","description","description_fr","resume_data","tags","ats_score","is_featured","view_count","use_count","is_active","created_at","updated_at"],
    rg, "name");
  console.log(`  -> ${rgI}/${rg.length} inserted`);

  // 5. Skills
  console.log("[5/6] More skill_library...");
  const sl = buildMoreSkills();
  const slI = await batchInsert("skill_library",
    ["id","name","name_fr","field","category","description","description_fr","is_recommended","is_active","sort_order","created_at","updated_at"],
    sl, "id");
  console.log(`  -> ${slI}/${sl.length} inserted`);

  // 6. Employers
  console.log("[6/6] More career_employer...");
  const ce = buildMoreEmployers();
  const ceI = await batchInsert("career_employer",
    ["id","name","sector","sector_fr","location","location_fr","open_positions","website","logo","description","description_fr","fields","is_active","sort_order","created_at","updated_at"],
    ce, "name");
  console.log(`  -> ${ceI}/${ce.length} inserted`);

  // Summary
  const after = {};
  for (const t of tables) { const r = await client.query(`SELECT COUNT(*) FROM ${t}`); after[t] = parseInt(r.rows[0].count, 10); }
  const totalAfter = Object.values(after).reduce((a, b) => a + b, 0);

  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║              PART 2 EXPANSION SUMMARY                       ║");
  console.log("╠══════════════════════════════════════════════════════════════╣");
  for (const t of tables) {
    console.log(`║  ${t.padEnd(30)} ${String(before[t]).padStart(4)} -> ${String(after[t]).padStart(4)} (+${String(after[t]-before[t]).padStart(3)}) ║`);
  }
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log(`║  TOTAL ROWS:  ${String(totalBefore).padStart(5)} -> ${String(totalAfter).padStart(5)} (+${String(totalAfter-totalBefore).padStart(4)})                     ║`);
  console.log(`║  TARGET: 3500+  STATUS: ${totalAfter >= 3500 ? "ACHIEVED!" : "NEEDS MORE (" + (3500 - totalAfter) + " remaining)"}               ║`);
  console.log("╚══════════════════════════════════════════════════════════════╝");

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
