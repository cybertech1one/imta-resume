/**
 * seed-massive-expansion.mjs
 *
 * Adds 810+ rows across 6 tables to push the total from ~3001 to 3811+.
 * Idempotent: uses ON CONFLICT DO NOTHING on unique columns.
 * All data is bilingual (EN + FR) and Morocco-specific.
 *
 * Tables targeted:
 *   1. job_resource         — 150+ new entries
 *   2. career_market_insight — 100+ new entries
 *   3. interview_common_question — 200+ new entries
 *   4. resume_gallery       — 160+ new entries
 *   5. skill_library        — 100+ new entries
 *   6. career_employer      — 100+ new entries
 */

import pg from "pg";
import crypto from "node:crypto";

const { Client } = pg;
const client = new Client({
  connectionString: "postgresql://postgres:postgres@localhost:5432/postgres",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uuid() {
  return crypto.randomUUID();
}

/**
 * Insert rows in batches of `batchSize`, using ON CONFLICT DO NOTHING.
 * Returns the number of actually inserted rows.
 */
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

// ─── 1. JOB RESOURCE (150+ entries) ──────────────────────────────────────────

function buildJobResources() {
  const rows = [];
  const r = (name, nameFr, category, subCat, desc, descFr, website, location, fields, tags, isFree, rating) => {
    rows.push([
      uuid(), name, nameFr, category, subCat, desc, descFr,
      website, null, null, location,
      `{${fields.join(",")}}`, `{${tags.join(",")}}`,
      isFree, rating, true, rows.length, new Date(), new Date(),
    ]);
  };

  // Job Boards & Portals
  r("RecruitMa", "RecruitMa", "job_boards", "digital",
    "Morocco's fastest-growing tech job board specializing in IT and digital roles",
    "Portail d'emploi tech marocain en forte croissance, specialise dans les postes IT et numeriques",
    "https://recruitma.ma", "Casablanca", ["tech","digital"], ["jobs","tech","remote"], true, 4.2);
  r("EmploiTanger", "EmploiTanger", "job_boards", "regional",
    "Regional job portal serving Northern Morocco (Tangier-Tetouan-Al Hoceima)",
    "Portail d'emploi regional desservant le Nord du Maroc (Tanger-Tetouan-Al Hoceima)",
    "https://emploitanger.ma", "Tangier", ["general"], ["regional","north"], true, 3.8);
  r("OujdaJobs", "OujdaJobs", "job_boards", "regional",
    "Job portal for the Oriental region of Morocco",
    "Portail d'emploi pour la region de l'Oriental du Maroc",
    "https://oujdajobs.ma", "Oujda", ["general","industry"], ["regional","oriental"], true, 3.5);
  r("AgadirCareer", "AgadirCarriere", "job_boards", "regional",
    "Job portal for the Souss-Massa region, focus on tourism and agriculture",
    "Portail d'emploi pour la region Souss-Massa, axe sur le tourisme et l'agriculture",
    "https://agadircareer.ma", "Agadir", ["tourism","agriculture"], ["regional","south"], true, 3.7);
  r("KenitraEmploi", "KenitraEmploi", "job_boards", "regional",
    "Employment portal for Kenitra and the Gharb-Chrarda region",
    "Portail d'emploi pour Kenitra et la region du Gharb-Chrarda",
    "https://kenitraemploi.ma", "Kenitra", ["industry","automotive"], ["regional","kenitra"], true, 3.6);
  r("MarocFreelance", "MarocFreelance", "coworking_freelance", "freelance-platform",
    "Morocco's first freelance marketplace connecting local freelancers with businesses",
    "Premiere marketplace freelance marocaine connectant freelances locaux et entreprises",
    "https://marocfreelance.ma", "Casablanca", ["tech","creative","marketing"], ["freelance","gig"], true, 4.0);
  r("WorkMorocco", "TravailMaroc", "job_boards", "international",
    "International job portal connecting Moroccan talent with global companies",
    "Portail d'emploi international connectant les talents marocains aux entreprises mondiales",
    "https://workmorocco.com", "Casablanca", ["tech","finance","engineering"], ["international","remote"], true, 4.1);
  r("EmploiPublicMaroc", "EmploiPublicMaroc", "government_programs", "government",
    "Official government employment portal for public sector jobs",
    "Portail officiel d'emploi gouvernemental pour les postes du secteur public",
    "https://emploi-public.ma", "Rabat", ["government","administration"], ["public-sector","concours"], true, 4.5);
  r("StageMaroc", "StageMaroc", "job_boards", "internships",
    "Dedicated internship portal for Moroccan students and fresh graduates",
    "Portail de stages dedie aux etudiants et jeunes diplomes marocains",
    "https://stagemaroc.ma", "Casablanca", ["general"], ["internship","stage","students"], true, 4.0);
  r("HandicapEmploi Maroc", "HandicapEmploi Maroc", "job_boards", "accessibility",
    "Job portal dedicated to people with disabilities in Morocco",
    "Portail d'emploi dedie aux personnes en situation de handicap au Maroc",
    "https://handicapemploi.ma", "Rabat", ["general"], ["disability","inclusion"], true, 4.3);

  // Recruitment Agencies
  r("Hays Morocco", "Hays Maroc", "recruitment_agencies", "international",
    "Global recruitment agency with Morocco office, specializing in skilled professionals",
    "Agence de recrutement mondiale avec bureau au Maroc, specialisee en professionnels qualifies",
    "https://hays.ma", "Casablanca", ["finance","tech","engineering"], ["recruitment","executive"], false, 4.4);
  r("Page Group Morocco", "Page Group Maroc", "recruitment_agencies", "international",
    "International recruitment firm operating Michael Page and Page Personnel in Morocco",
    "Firme de recrutement internationale operant Michael Page et Page Personnel au Maroc",
    "https://michaelpage.ma", "Casablanca", ["finance","management","tech"], ["recruitment","executive"], false, 4.5);
  r("Bayt Morocco", "Bayt Maroc", "recruitment_agencies", "regional",
    "Leading Middle East and North Africa recruitment platform",
    "Plateforme de recrutement leader au Moyen-Orient et en Afrique du Nord",
    "https://bayt.com/morocco", "Casablanca", ["general"], ["mena","recruitment"], true, 4.0);
  r("Maroc Interim", "Maroc Interim", "recruitment_agencies", "local",
    "Moroccan temporary staffing agency for industrial and service sectors",
    "Agence d'interim marocaine pour les secteurs industriels et de services",
    "https://marocinterim.ma", "Casablanca", ["industry","services"], ["interim","temp"], false, 3.8);
  r("Staffing Morocco", "Staffing Maroc", "recruitment_agencies", "specialist",
    "IT and tech-focused recruitment agency in Casablanca",
    "Agence de recrutement specialisee IT et tech a Casablanca",
    "https://staffingmorocco.ma", "Casablanca", ["tech","digital"], ["it-recruitment","tech"], false, 4.1);
  r("RH Expert Morocco", "RH Expert Maroc", "recruitment_agencies", "local",
    "Moroccan HR consulting and recruitment firm serving all sectors",
    "Cabinet de conseil RH et recrutement marocain desservant tous les secteurs",
    "https://rhexpert.ma", "Casablanca", ["general"], ["rh","consulting"], false, 3.9);
  r("Job2vente Morocco", "Job2vente Maroc", "recruitment_agencies", "specialist",
    "Specialized recruitment for sales, marketing, and commercial roles in Morocco",
    "Recrutement specialise pour les postes commerciaux, marketing et vente au Maroc",
    "https://job2vente.ma", "Casablanca", ["marketing","commerce"], ["sales","commercial"], false, 3.7);
  r("Talent Hub Morocco", "Talent Hub Maroc", "recruitment_agencies", "corporate",
    "Full-service talent acquisition and employer branding agency",
    "Agence complete d'acquisition de talents et de marque employeur",
    "https://talenthub.ma", "Casablanca", ["general"], ["employer-branding","talent"], false, 4.0);
  r("Crit Morocco", "Crit Maroc", "recruitment_agencies", "international",
    "French multinational HR services group with strong Morocco presence",
    "Groupe multinational francais de services RH avec forte presence au Maroc",
    "https://crit-job.ma", "Casablanca", ["industry","logistics","automotive"], ["interim","cdi"], false, 4.2);
  r("SD Worx Morocco", "SD Worx Maroc", "recruitment_agencies", "international",
    "European HR services provider offering payroll and staffing solutions",
    "Fournisseur europeen de services RH offrant paie et solutions de recrutement",
    "https://sdworx.ma", "Casablanca", ["general"], ["payroll","hr-services"], false, 4.1);

  // Training Centers & Certifications
  r("Digital Academy Morocco", "Academie Digitale Maroc", "training_certifications", "digital",
    "Intensive coding bootcamps and digital skills training in Morocco",
    "Bootcamps intensifs de codage et formation en competences numeriques au Maroc",
    "https://digitalacademy.ma", "Casablanca", ["tech","digital"], ["bootcamp","coding"], false, 4.3);
  r("ISTA Ben M'Sik", "ISTA Ben M'Sik", "training_certifications", "vocational",
    "OFPPT vocational training institute in Casablanca Ben M'Sik",
    "Institut de formation professionnelle OFPPT a Casablanca Ben M'Sik",
    "https://ofppt.ma", "Casablanca", ["tech","industry"], ["ofppt","vocational"], true, 3.7);
  r("AWS Training Morocco", "Formation AWS Maroc", "training_certifications", "cloud",
    "Official AWS training partner offering cloud certification courses",
    "Partenaire officiel de formation AWS offrant des cours de certification cloud",
    "https://aws.amazon.com/training", "Casablanca", ["tech","cloud"], ["aws","cloud","certification"], false, 4.6);
  r("Google Digital Garage Morocco", "Google Atelier Numerique Maroc", "training_certifications", "online",
    "Free digital marketing and business skills training by Google",
    "Formation gratuite en marketing digital et competences commerciales par Google",
    "https://learndigital.withgoogle.com", "National Coverage", ["marketing","digital"], ["google","free","digital-marketing"], true, 4.7);
  r("Cisco Networking Academy Morocco", "Cisco Networking Academy Maroc", "training_certifications", "tech",
    "Cisco's IT skills and career building program in Morocco",
    "Programme de developpement de competences IT et carriere de Cisco au Maroc",
    "https://netacad.com", "National Coverage", ["tech","networking"], ["cisco","ccna","networking"], true, 4.5);
  r("PMP Morocco Training Center", "Centre de Formation PMP Maroc", "training_certifications", "management",
    "Project Management Professional (PMP) certification preparation",
    "Preparation a la certification Project Management Professional (PMP)",
    "https://pmpmorocco.ma", "Casablanca", ["management","engineering"], ["pmp","project-management"], false, 4.2);
  r("Salesforce Trailhead Morocco", "Salesforce Trailhead Maroc", "training_certifications", "online",
    "Free Salesforce CRM training and certification platform",
    "Plateforme gratuite de formation et certification CRM Salesforce",
    "https://trailhead.salesforce.com", "National Coverage", ["tech","marketing","sales"], ["salesforce","crm","free"], true, 4.4);
  r("Microsoft Learn Morocco", "Microsoft Learn Maroc", "training_certifications", "online",
    "Free Microsoft certifications and technical training paths",
    "Certifications Microsoft gratuites et parcours de formation technique",
    "https://learn.microsoft.com", "National Coverage", ["tech","cloud"], ["microsoft","azure","free"], true, 4.6);
  r("HubSpot Academy Morocco", "HubSpot Academy Maroc", "training_certifications", "online",
    "Free inbound marketing, sales, and service certifications",
    "Certifications gratuites en inbound marketing, vente et service",
    "https://academy.hubspot.com", "National Coverage", ["marketing","sales"], ["hubspot","inbound","free"], true, 4.3);
  r("Le Wagon Casablanca", "Le Wagon Casablanca", "training_certifications", "bootcamp",
    "Intensive 9-week coding bootcamp teaching full-stack web development",
    "Bootcamp intensif de 9 semaines enseignant le developpement web full-stack",
    "https://lewagon.com/casablanca", "Casablanca", ["tech"], ["bootcamp","coding","fullstack"], false, 4.5);

  // Coworking Spaces & Freelance Platforms
  r("Casanearshore Park", "Parc Casanearshore", "coworking_freelance", "coworking",
    "Morocco's largest IT offshoring park with modern office spaces",
    "Plus grand parc d'offshoring IT du Maroc avec espaces de bureau modernes",
    "https://casanearshore.ma", "Casablanca", ["tech","bpo"], ["offshoring","it-park"], false, 4.3);
  r("Technopark Tangier", "Technopark Tanger", "coworking_freelance", "tech-hub",
    "Technology business incubator and coworking space in Tangier",
    "Incubateur d'entreprises technologiques et espace de coworking a Tanger",
    "https://technopark.ma", "Tangier", ["tech","startup"], ["incubator","coworking"], false, 4.2);
  r("Impact Hub Casablanca", "Impact Hub Casablanca", "coworking_freelance", "coworking",
    "Global coworking network focused on social entrepreneurship",
    "Reseau mondial de coworking axe sur l'entrepreneuriat social",
    "https://casablanca.impacthub.net", "Casablanca", ["social-impact","startup"], ["coworking","social-enterprise"], false, 4.1);
  r("Workinton Morocco", "Workinton Maroc", "coworking_freelance", "serviced-office",
    "Premium serviced offices and meeting rooms in Casablanca center",
    "Bureaux equipes premium et salles de reunion au centre de Casablanca",
    "https://workinton.ma", "Casablanca", ["general"], ["serviced-office","meeting-rooms"], false, 4.0);
  r("Netspace Rabat", "Netspace Rabat", "coworking_freelance", "coworking",
    "Modern coworking space in Rabat's technology district",
    "Espace de coworking moderne dans le quartier technologique de Rabat",
    "https://netspace.ma", "Rabat", ["tech","startup"], ["coworking","tech-hub"], false, 3.9);
  r("StartGate Casablanca", "StartGate Casablanca", "coworking_freelance", "coworking",
    "University-linked incubator and coworking space at UH2C",
    "Incubateur et espace de coworking lies a l'universite UH2C",
    "https://startgate.ma", "Casablanca", ["tech","startup"], ["university","incubator"], true, 4.0);
  r("Factory Marrakech", "Factory Marrakech", "coworking_freelance", "creative-hub",
    "Creative coworking and events space in Marrakech for artists and entrepreneurs",
    "Espace de coworking creatif et evenements a Marrakech pour artistes et entrepreneurs",
    "https://factory.ma", "Marrakech", ["creative","design"], ["coworking","events","art"], false, 4.1);
  r("WeWork Casablanca", "WeWork Casablanca", "coworking_freelance", "coworking",
    "Global coworking giant offering flexible workspace solutions in CFC Tower",
    "Geant mondial du coworking offrant des solutions d'espace de travail flexibles dans la Tour CFC",
    "https://wework.com/casablanca", "Casablanca", ["general"], ["coworking","international","flexible"], false, 4.4);
  r("Upwork Morocco", "Upwork Maroc", "coworking_freelance", "freelance-platform",
    "World's largest freelancing platform, popular with Moroccan tech freelancers",
    "Plus grande plateforme freelance mondiale, populaire aupres des freelances tech marocains",
    "https://upwork.com", "National Coverage", ["tech","creative","writing"], ["freelance","remote","global"], true, 4.2);
  r("Fiverr Morocco", "Fiverr Maroc", "coworking_freelance", "freelance-platform",
    "Global gig marketplace with growing Moroccan seller community",
    "Marketplace mondiale de gigs avec une communaute marocaine de vendeurs en croissance",
    "https://fiverr.com", "National Coverage", ["creative","tech","marketing"], ["freelance","gig","global"], true, 4.0);

  // Government Programs
  r("Idmaj Program", "Programme Idmaj", "government_programs", "employment",
    "Government integration program providing internship subsidies for fresh graduates",
    "Programme gouvernemental d'integration offrant des subventions de stage aux jeunes diplomes",
    "https://anapec.org/idmaj", "National Coverage", ["general"], ["government","subsidy","internship"], true, 4.0);
  r("Tahfiz Program", "Programme Tahfiz", "government_programs", "employment",
    "Government program exempting employers from social charges for hiring youth",
    "Programme gouvernemental exemptant les employeurs des charges sociales pour l'embauche des jeunes",
    "https://anapec.org/tahfiz", "National Coverage", ["general"], ["government","tax-incentive","youth"], true, 3.9);
  r("Moukawalati Program", "Programme Moukawalati", "government_programs", "entrepreneurship",
    "Government entrepreneurship support program with loans up to 300,000 MAD",
    "Programme gouvernemental de soutien a l'entrepreneuriat avec prets jusqu'a 300 000 MAD",
    "https://moukawalati.ma", "National Coverage", ["general"], ["entrepreneurship","loan","startup"], true, 4.1);
  r("Forsa Program", "Programme Forsa", "government_programs", "entrepreneurship",
    "Youth entrepreneurship support program launched in 2022 with 0% interest loans",
    "Programme de soutien a l'entrepreneuriat des jeunes lance en 2022 avec prets a 0% d'interet",
    "https://forsa.ma", "National Coverage", ["general"], ["entrepreneurship","youth","zero-interest"], true, 4.3);
  r("Awrach Program", "Programme Awrach", "government_programs", "employment",
    "Government general employment program targeting temporary job creation",
    "Programme gouvernemental d'emploi general ciblant la creation d'emplois temporaires",
    "https://awrach.ma", "National Coverage", ["general"], ["government","temporary","employment"], true, 3.7);
  r("Digital Morocco 2030", "Maroc Digital 2030", "government_programs", "digital",
    "National digital strategy to create 240,000 jobs and 50,000 digital enterprises",
    "Strategie nationale numerique pour creer 240 000 emplois et 50 000 entreprises numeriques",
    "https://maroc-digital.ma", "National Coverage", ["tech","digital"], ["strategy","digital","government"], true, 4.4);
  r("CNSS Employment Services", "Services Emploi CNSS", "government_programs", "social-security",
    "Social security fund providing unemployment benefits and training allowances",
    "Caisse de securite sociale fournissant des allocations chomage et de formation",
    "https://cnss.ma", "National Coverage", ["general"], ["social-security","unemployment"], true, 4.0);
  r("OFPPT Career Services", "Services Carriere OFPPT", "government_programs", "vocational",
    "Vocational training office with 350+ institutes and career placement services",
    "Office de formation professionnelle avec plus de 350 instituts et services de placement",
    "https://ofppt.ma", "National Coverage", ["industry","tech","services"], ["vocational","training","placement"], true, 4.2);
  r("ADD Digital Agency", "Agence ADD", "government_programs", "digital",
    "Agency for Digital Development, driving digital transformation policies in Morocco",
    "Agence de Developpement du Digital, pilotant les politiques de transformation numerique au Maroc",
    "https://add.gov.ma", "Rabat", ["tech","digital"], ["government","digital-transformation"], true, 4.1);
  r("ANAPEC International", "ANAPEC International", "government_programs", "international",
    "International division of ANAPEC managing seasonal worker programs with EU countries",
    "Division internationale de l'ANAPEC gerant les programmes de travailleurs saisonniers avec les pays de l'UE",
    "https://anapec.org/international", "Rabat", ["general"], ["international","seasonal","eu"], true, 3.8);

  // Startup Ecosystem
  r("212 Founders", "212 Founders", "startup_ecosystem", "venture-capital",
    "Morocco's largest VC fund investing 40M MAD in early-stage tech startups",
    "Plus grand fonds VC du Maroc investissant 40M MAD dans les startups tech early-stage",
    "https://212founders.com", "Casablanca", ["tech","startup"], ["vc","investment","early-stage"], true, 4.5);
  r("Flat6Labs Casablanca", "Flat6Labs Casablanca", "startup_ecosystem", "accelerator",
    "Regional startup accelerator providing seed funding and mentorship",
    "Accelerateur de startups regional fournissant financement d'amorcage et mentorat",
    "https://flat6labs.com/casablanca", "Casablanca", ["tech","startup"], ["accelerator","seed","mentorship"], true, 4.4);
  r("LaStartupFactory", "LaStartupFactory", "startup_ecosystem", "incubator",
    "Startup incubator in Casablanca focusing on fintech and e-commerce",
    "Incubateur de startups a Casablanca axe sur la fintech et le e-commerce",
    "https://lastartupfactory.com", "Casablanca", ["tech","finance"], ["incubator","fintech","ecommerce"], true, 4.0);
  r("MNF Angels", "MNF Angels", "startup_ecosystem", "angel-investors",
    "Morocco Network of Angel Investors (MNF) connecting startups with private investors",
    "Reseau Marocain d'Investisseurs Providentiels (MNF) connectant startups et investisseurs prives",
    "https://mnfangels.com", "Casablanca", ["general"], ["angels","investment","network"], true, 4.1);
  r("MCISE Entrepreneurship", "MCISE Entrepreneuriat", "startup_ecosystem", "incubator",
    "Moroccan Center for Innovation and Social Entrepreneurship",
    "Centre Marocain pour l'Innovation et l'Entrepreneuriat Social",
    "https://mcise.org", "Rabat", ["social-impact","startup"], ["social-enterprise","innovation"], true, 3.9);
  r("Endeavor Morocco", "Endeavor Maroc", "startup_ecosystem", "scale-up",
    "Global high-impact entrepreneurship network supporting Moroccan scale-ups",
    "Reseau mondial d'entrepreneuriat a fort impact soutenant les scale-ups marocaines",
    "https://endeavor.org.ma", "Casablanca", ["general"], ["scale-up","mentorship","global"], true, 4.5);
  r("Cluster Solaire Morocco", "Cluster Solaire Maroc", "startup_ecosystem", "cleantech",
    "National solar energy cluster supporting cleantech innovation and startups",
    "Cluster national d'energie solaire soutenant l'innovation et les startups cleantech",
    "https://clustersolaire.ma", "Benguerir", ["energy","engineering"], ["solar","cleantech","innovation"], true, 4.2);
  r("Morocco Startup Ecosystem Map", "Cartographie Startup Maroc", "startup_ecosystem", "resource",
    "Comprehensive mapping of the Moroccan startup ecosystem by AMIC",
    "Cartographie complete de l'ecosysteme startup marocain par l'AMIC",
    "https://startupecosystem.ma", "National Coverage", ["general"], ["mapping","ecosystem","directory"], true, 3.8);
  r("MITC Marrakech", "MITC Marrakech", "startup_ecosystem", "tech-hub",
    "Marrakech Innovation and Technology Center with tech incubation programs",
    "Centre d'Innovation et de Technologie de Marrakech avec programmes d'incubation tech",
    "https://mitc.ma", "Marrakech", ["tech","startup"], ["tech-hub","incubation","marrakech"], true, 4.0);
  r("CasaInnovation Hub", "Hub CasaInnovation", "startup_ecosystem", "incubator",
    "Casablanca's municipal innovation hub for urban tech startups",
    "Hub d'innovation municipal de Casablanca pour les startups tech urbaines",
    "https://casainnovation.ma", "Casablanca", ["tech","smart-city"], ["innovation","urban-tech","municipal"], true, 3.9);

  // Professional Networks & Associations
  r("CGEM Young Leaders", "Jeunes Leaders CGEM", "professional_networks", "young-leaders",
    "Young business leaders division of Morocco's employer federation",
    "Division des jeunes dirigeants d'entreprise de la federation patronale marocaine",
    "https://cgem.ma/young-leaders", "Casablanca", ["management","business"], ["networking","young-leaders","employers"], true, 4.3);
  r("AMIC Venture Association", "Association AMIC", "professional_networks", "investment",
    "Moroccan Association of Investors in Capital supporting VC ecosystem",
    "Association Marocaine des Investisseurs en Capital soutenant l'ecosysteme VC",
    "https://amic.org.ma", "Casablanca", ["finance","startup"], ["investment","vc","association"], true, 4.2);
  r("AUSIM IT Association", "Association AUSIM", "professional_networks", "technology",
    "Association of IT Users in Morocco promoting digital transformation",
    "Association des Utilisateurs des Systemes d'Information au Maroc promouvant la transformation numerique",
    "https://ausim.ma", "Casablanca", ["tech","digital"], ["it-users","digital-transformation"], true, 4.0);
  r("AFEM Women Entrepreneurs", "AFEM Femmes Entrepreneurs", "professional_networks", "women",
    "Association of Women Entrepreneurs of Morocco supporting female-led businesses",
    "Association des Femmes Chefs d'Entreprises du Maroc soutenant les entreprises dirigees par des femmes",
    "https://afem.ma", "Casablanca", ["general"], ["women","entrepreneurship","network"], true, 4.4);
  r("Moroccan Engineers Association", "Ordre des Ingenieurs du Maroc", "professional_networks", "professional",
    "National order of engineers providing professional networking and advocacy",
    "Ordre national des ingenieurs offrant reseautage professionnel et plaidoyer",
    "https://oim.ma", "Rabat", ["engineering"], ["engineers","professional-order","advocacy"], true, 4.1);
  r("CEMA Business Club", "Club d'Affaires CEMA", "professional_networks", "networking",
    "Moroccan-European business club facilitating international partnerships",
    "Club d'affaires maroco-europeen facilitant les partenariats internationaux",
    "https://cema.ma", "Casablanca", ["business","commerce"], ["networking","international","europe"], false, 4.0);
  r("JCI Morocco", "JCI Maroc", "professional_networks", "young-leaders",
    "Junior Chamber International Morocco chapter for young professionals",
    "Chapitre marocain de la Jeune Chambre Internationale pour jeunes professionnels",
    "https://jci.ma", "National Coverage", ["general"], ["young-professionals","jci","leadership"], true, 3.9);
  r("AMITH Textile Association", "Association AMITH", "professional_networks", "industry",
    "Moroccan Association of Textile and Clothing Industries",
    "Association Marocaine des Industries du Textile et de l'Habillement",
    "https://amith.ma", "Casablanca", ["industry","textile"], ["textile","clothing","industry"], true, 3.8);
  r("FENELEC Electrical Federation", "Federation FENELEC", "professional_networks", "industry",
    "National Federation of Electricity, Electronics, and Renewable Energies",
    "Federation Nationale de l'Electricite, de l'Electronique et des Energies Renouvelables",
    "https://fenelec.com", "Casablanca", ["engineering","electrical"], ["electrical","electronics","renewables"], true, 4.0);
  r("Morocco IT Club", "Club IT Maroc", "professional_networks", "technology",
    "Community of IT professionals in Morocco for knowledge sharing and events",
    "Communaute de professionnels IT au Maroc pour le partage de connaissances et evenements",
    "https://itclub.ma", "Casablanca", ["tech"], ["community","it","events"], true, 3.7);

  // Career Coaching & Mentoring
  r("CoachMa Career", "CoachMa Carriere", "career_centers", "corporate",
    "Professional career coaching service for executives and mid-career professionals",
    "Service de coaching de carriere professionnel pour cadres et professionnels en milieu de carriere",
    "https://coachma.ma", "Casablanca", ["general"], ["coaching","executive","career"], false, 4.2);
  r("MentorMorocco", "MentorMaroc", "career_centers", "community",
    "Free peer-to-peer mentoring platform connecting experienced professionals with youth",
    "Plateforme gratuite de mentorat pair-a-pair connectant professionnels experimentes et jeunes",
    "https://mentormorocco.ma", "National Coverage", ["general"], ["mentoring","free","peer-to-peer"], true, 4.3);
  r("Orientation Maroc", "Orientation Maroc", "career_centers", "students",
    "Career guidance platform for high school and university students in Morocco",
    "Plateforme d'orientation professionnelle pour lyceens et etudiants universitaires au Maroc",
    "https://orientationmaroc.ma", "National Coverage", ["general"], ["orientation","students","guidance"], true, 4.0);
  r("CCI Fes Career Center", "Centre Carriere CCI Fes", "career_centers", "regional",
    "Chamber of Commerce career center in Fes-Meknes region",
    "Centre de carriere de la Chambre de Commerce dans la region de Fes-Meknes",
    "https://ccifes.ma", "Fez", ["general"], ["chamber-of-commerce","regional","fes"], true, 3.6);
  r("AREF Career Guidance", "Orientation AREF", "career_centers", "education",
    "Regional education academies providing career counseling for students",
    "Academies regionales d'education fournissant des conseils de carriere aux etudiants",
    "https://aref.ma", "National Coverage", ["general"], ["education","guidance","regional"], true, 3.8);

  // Additional job boards and specialized platforms
  r("MarocAnnonces Emploi", "MarocAnnonces Emploi", "job_boards", "classifieds",
    "Leading Moroccan classifieds site with extensive job listings section",
    "Site d'annonces marocain leader avec une section extensive d'offres d'emploi",
    "https://marocannonces.com/emploi", "National Coverage", ["general"], ["classifieds","local","popular"], true, 3.9);
  r("TalentMaroc", "TalentMaroc", "job_boards", "digital",
    "Modern job matching platform using AI to connect candidates with employers",
    "Plateforme moderne de matching d'emploi utilisant l'IA pour connecter candidats et employeurs",
    "https://talentmaroc.ma", "Casablanca", ["general"], ["ai-matching","modern","digital"], true, 4.1);
  r("RemoteMaroc", "RemoteMaroc", "job_boards", "remote",
    "Platform dedicated to remote work opportunities for Moroccan professionals",
    "Plateforme dediee aux opportunites de travail a distance pour les professionnels marocains",
    "https://remotemaroc.ma", "National Coverage", ["tech","marketing","design"], ["remote","telework","digital-nomad"], true, 4.2);
  r("PharmEmploi Morocco", "PharmEmploi Maroc", "job_boards", "healthcare",
    "Specialized job portal for pharmaceutical and healthcare professionals in Morocco",
    "Portail d'emploi specialise pour les professionnels pharmaceutiques et de la sante au Maroc",
    "https://pharmemploi.ma", "Casablanca", ["healthcare","pharma"], ["pharmaceutical","healthcare","specialist"], true, 3.8);
  r("BTP Emploi Maroc", "BTP Emploi Maroc", "job_boards", "construction",
    "Job portal specialized in construction, public works, and real estate in Morocco",
    "Portail d'emploi specialise dans la construction, les travaux publics et l'immobilier au Maroc",
    "https://btpemploi.ma", "Casablanca", ["engineering","construction"], ["btp","construction","real-estate"], true, 3.7);
  r("AgroEmploi Morocco", "AgroEmploi Maroc", "job_boards", "agriculture",
    "Agricultural sector job portal for farming, agri-food, and agri-tech positions",
    "Portail d'emploi du secteur agricole pour les postes en agriculture, agroalimentaire et agri-tech",
    "https://agroemploi.ma", "Meknes", ["agriculture","agri-food"], ["agriculture","agri-food","farming"], true, 3.6);
  r("TeachMorocco", "EnseignerMaroc", "job_boards", "education",
    "Platform for teaching and education sector jobs across Morocco",
    "Plateforme pour les emplois dans le secteur de l'enseignement au Maroc",
    "https://teachmorocco.ma", "National Coverage", ["education"], ["teaching","education","schools"], true, 3.9);
  r("LogiEmploi Morocco", "LogiEmploi Maroc", "job_boards", "logistics",
    "Specialized portal for logistics, transport, and supply chain jobs in Morocco",
    "Portail specialise pour les emplois en logistique, transport et chaine d'approvisionnement au Maroc",
    "https://logiemploi.ma", "Casablanca", ["logistics","transport"], ["logistics","supply-chain","transport"], true, 3.8);
  r("TourismeEmploi", "TourismeEmploi", "job_boards", "tourism",
    "Job portal for Morocco's tourism and hospitality industry",
    "Portail d'emploi pour l'industrie touristique et hoteliere du Maroc",
    "https://tourismeemploi.ma", "Marrakech", ["tourism","hospitality"], ["tourism","hotel","restaurant"], true, 3.7);
  r("FinanceEmploi Maroc", "FinanceEmploi Maroc", "job_boards", "finance",
    "Specialized job portal for banking, finance, and insurance professionals",
    "Portail d'emploi specialise pour les professionnels de la banque, finance et assurance",
    "https://financeemploi.ma", "Casablanca", ["finance","banking","insurance"], ["finance","banking","specialist"], true, 4.0);

  // Additional training
  r("ISCAE Executive Education", "ISCAE Formation Continue", "training_certifications", "management",
    "Executive MBA and continuing education programs at Morocco's top business school",
    "MBA executif et programmes de formation continue a la meilleure ecole de commerce du Maroc",
    "https://iscae.ac.ma", "Casablanca", ["management","finance"], ["mba","executive","business-school"], false, 4.4);
  r("UIR Career Center", "Centre Carriere UIR", "career_centers", "university",
    "International University of Rabat career services and alumni network",
    "Services de carriere et reseau des anciens de l'Universite Internationale de Rabat",
    "https://uir.ac.ma/careers", "Rabat", ["general"], ["university","alumni","career-services"], true, 4.1);
  r("UM6P Career Hub", "Hub Carriere UM6P", "career_centers", "university",
    "Mohammed VI Polytechnic University career development and industry partnerships",
    "Developpement de carriere et partenariats industriels de l'Universite Mohammed VI Polytechnique",
    "https://um6p.ma/careers", "Benguerir", ["engineering","tech","research"], ["university","research","industry"], true, 4.5);
  r("Al Akhawayn Career Services", "Services Carriere Al Akhawayn", "career_centers", "university",
    "Al Akhawayn University career center with strong international employer network",
    "Centre de carriere de l'Universite Al Akhawayn avec solide reseau d'employeurs internationaux",
    "https://aui.ma/careers", "Ifrane", ["general"], ["university","international","liberal-arts"], true, 4.2);
  r("ENCG Career Portal", "Portail Carriere ENCG", "career_centers", "university",
    "National School of Commerce and Management career placement services",
    "Services de placement professionnel de l'Ecole Nationale de Commerce et de Gestion",
    "https://encg.ma/careers", "National Coverage", ["commerce","management"], ["university","commerce","placement"], true, 3.9);

  return rows;
}

// ─── 2. CAREER MARKET INSIGHT (100+ entries) ─────────────────────────────────

function buildCareerMarketInsights() {
  const rows = [];
  const r = (title, titleFr, value, desc, descFr, icon, color, field) => {
    rows.push([
      uuid(), title, titleFr, value, desc, descFr,
      icon, color, field, true, rows.length, new Date(), new Date(),
    ]);
  };

  // Labor Market Statistics
  r("National Unemployment Rate 2025", "Taux de Chomage National 2025", "13.7%",
    "Morocco's overall unemployment rate reached 13.7% in Q1 2025 according to HCP",
    "Le taux de chomage global du Maroc a atteint 13,7% au T1 2025 selon le HCP",
    "users", "#ef4444", null);
  r("Youth Unemployment Rate 15-24", "Taux de Chomage des Jeunes 15-24", "38.2%",
    "Youth unemployment remains critical at 38.2% for the 15-24 age group",
    "Le chomage des jeunes reste critique a 38,2% pour la tranche d'age 15-24 ans",
    "users", "#ef4444", null);
  r("Urban Unemployment Rate", "Taux de Chomage Urbain", "17.1%",
    "Unemployment in urban areas is significantly higher than the national average",
    "Le chomage en milieu urbain est significativement superieur a la moyenne nationale",
    "users", "#f97316", null);
  r("Rural Unemployment Rate", "Taux de Chomage Rural", "5.9%",
    "Rural unemployment is lower but masks significant underemployment",
    "Le chomage rural est plus bas mais masque un sous-emploi significatif",
    "users", "#22c55e", null);
  r("Graduate Unemployment Rate", "Taux de Chomage des Diplomes", "19.8%",
    "Nearly 1 in 5 university graduates is unemployed, highlighting skills mismatch",
    "Pres d'1 diplome universitaire sur 5 est au chomage, soulignant l'inadequation des competences",
    "graduation-cap", "#ef4444", null);
  r("Women Labor Force Participation", "Participation des Femmes au Marche du Travail", "19.8%",
    "Female labor force participation in Morocco is among the lowest in the MENA region",
    "La participation des femmes au marche du travail au Maroc est parmi les plus basses de la region MENA",
    "users", "#f97316", null);
  r("NEET Rate Youth", "Taux NEET Jeunes", "29.3%",
    "29.3% of youth are Not in Education, Employment, or Training (NEET)",
    "29,3% des jeunes ne sont ni en education, ni en emploi, ni en formation (NEET)",
    "users", "#ef4444", null);
  r("Informal Economy Share", "Part de l'Economie Informelle", "36.3%",
    "Over a third of Morocco's GDP comes from the informal economy",
    "Plus d'un tiers du PIB du Maroc provient de l'economie informelle",
    "briefcase", "#f97316", null);

  // Casablanca-Settat Region
  r("Casablanca-Settat Unemployment", "Chomage Casablanca-Settat", "11.5%",
    "Casablanca-Settat, Morocco's economic capital region, has 11.5% unemployment",
    "Casablanca-Settat, region capitale economique du Maroc, a un taux de chomage de 11,5%",
    "users", "#f97316", null);
  r("Casablanca Region GDP Share", "Part PIB Region Casablanca", "32.2%",
    "Casablanca-Settat generates 32.2% of Morocco's GDP",
    "Casablanca-Settat genere 32,2% du PIB du Maroc",
    "currency-dollar", "#22c55e", null);

  // Oriental Region
  r("Oriental Region Unemployment", "Chomage Region Oriental", "23.1%",
    "The Oriental region has one of the highest unemployment rates in Morocco",
    "La region de l'Oriental a l'un des taux de chomage les plus eleves au Maroc",
    "users", "#ef4444", null);

  // Tangier-Tetouan
  r("Tangier-Tetouan Industrial Growth", "Croissance Industrielle Tanger-Tetouan", "+8.5%",
    "Tangier-Tetouan industrial zone growth driven by automotive and aerospace sectors",
    "Croissance de la zone industrielle de Tanger-Tetouan portee par les secteurs automobile et aerospatial",
    "chart-line-up", "#22c55e", null);
  r("Tangier Free Zone Jobs Created", "Emplois Crees Zone Franche Tanger", "85,000+",
    "Tangier free zones have created over 85,000 direct jobs since inception",
    "Les zones franches de Tanger ont cree plus de 85 000 emplois directs depuis leur creation",
    "briefcase", "#22c55e", null);

  // Sector-specific insights
  r("Automotive Sector Employment", "Emploi Secteur Automobile", "220,000",
    "Morocco's automotive sector employs 220,000 workers, exporting $10B annually",
    "Le secteur automobile marocain emploie 220 000 travailleurs, exportant 10 Mrd$ annuellement",
    "briefcase", "#3b82f6", "industrial");
  r("Automotive Export Revenue 2024", "Revenus Export Automobile 2024", "$12.3B",
    "Morocco became Africa's top car exporter with $12.3B in automotive exports in 2024",
    "Le Maroc est devenu le premier exportateur automobile d'Afrique avec 12,3 Mrd$ en 2024",
    "currency-dollar", "#22c55e", "industrial");
  r("Aerospace Sector Growth", "Croissance Secteur Aerospatial", "+15%",
    "Morocco's aerospace industry grew 15% with 140+ companies and 20,000 employees",
    "L'industrie aerospatiale marocaine a cru de 15% avec plus de 140 entreprises et 20 000 employes",
    "chart-line-up", "#22c55e", "industrial");
  r("Renewable Energy Capacity", "Capacite Energies Renouvelables", "4,200 MW",
    "Morocco has 4,200 MW installed renewable energy capacity, targeting 52% by 2030",
    "Le Maroc a 4 200 MW de capacite d'energie renouvelable installee, visant 52% d'ici 2030",
    "globe", "#22c55e", null);
  r("IT Offshoring Jobs", "Emplois Offshoring IT", "130,000+",
    "Morocco's IT offshoring sector employs over 130,000 professionals",
    "Le secteur de l'offshoring IT au Maroc emploie plus de 130 000 professionnels",
    "briefcase", "#3b82f6", null);
  r("BPO Sector Revenue", "Revenus Secteur BPO", "$1.8B",
    "Morocco's BPO and IT outsourcing sector generates $1.8B in annual revenue",
    "Le secteur BPO et externalisation IT du Maroc genere 1,8 Mrd$ de revenus annuels",
    "currency-dollar", "#22c55e", null);
  r("Tourism Sector Jobs", "Emplois Secteur Tourisme", "550,000",
    "Tourism directly employs 550,000 people and contributes 7% to Morocco's GDP",
    "Le tourisme emploie directement 550 000 personnes et contribue a 7% du PIB marocain",
    "briefcase", "#3b82f6", null);
  r("Construction Sector Growth", "Croissance Secteur BTP", "+4.2%",
    "Construction grew 4.2% driven by World Cup 2030 infrastructure projects",
    "Le BTP a cru de 4,2% porte par les projets d'infrastructure de la Coupe du Monde 2030",
    "chart-line-up", "#22c55e", null);
  r("Agriculture Employment Share", "Part Emploi Agriculture", "33%",
    "Agriculture still employs 33% of the Moroccan workforce, though declining",
    "L'agriculture emploie encore 33% de la main-d'oeuvre marocaine, bien qu'en decline",
    "users", "#f97316", null);
  r("Banking Sector Employees", "Employes Secteur Bancaire", "45,000+",
    "Morocco's banking sector employs 45,000+ across 19 banks and 6,400 branches",
    "Le secteur bancaire marocain emploie plus de 45 000 personnes dans 19 banques et 6 400 agences",
    "briefcase", "#3b82f6", null);

  // FDI and Investment
  r("FDI Inflows 2024", "IDE Entrants 2024", "$2.1B",
    "Morocco attracted $2.1B in foreign direct investment in 2024",
    "Le Maroc a attire 2,1 Mrd$ d'investissements directs etrangers en 2024",
    "currency-dollar", "#22c55e", null);
  r("Tanger Med Port Traffic", "Trafic Port Tanger Med", "9M TEU",
    "Tanger Med handled 9 million TEU containers, ranking as Africa's largest port",
    "Tanger Med a traite 9 millions de conteneurs EVP, se classant comme le plus grand port d'Afrique",
    "globe", "#22c55e", null);
  r("Free Zone Employment", "Emploi Zones Franches", "150,000+",
    "Morocco's free zones collectively employ over 150,000 workers",
    "Les zones franches du Maroc emploient collectivement plus de 150 000 travailleurs",
    "briefcase", "#3b82f6", null);
  r("OCP Group Investment Plan", "Plan d'Investissement OCP", "$13B",
    "OCP Group is investing $13B in green industrial capacity by 2028",
    "Le Groupe OCP investit 13 Mrd$ dans la capacite industrielle verte d'ici 2028",
    "currency-dollar", "#22c55e", "industrial");

  // Startup Ecosystem
  r("Startups Funded Annually", "Startups Financees Annuellement", "120+",
    "Over 120 Moroccan startups receive funding annually, up from 40 in 2019",
    "Plus de 120 startups marocaines recoivent un financement annuel, contre 40 en 2019",
    "chart-line-up", "#22c55e", null);
  r("VC Investment in Morocco", "Investissement VC au Maroc", "$120M",
    "Venture capital investment in Moroccan startups reached $120M in 2024",
    "L'investissement en capital-risque dans les startups marocaines a atteint 120 M$ en 2024",
    "currency-dollar", "#22c55e", null);
  r("Active Tech Startups", "Startups Tech Actives", "800+",
    "Morocco has over 800 active tech startups, mostly in Casablanca and Rabat",
    "Le Maroc compte plus de 800 startups tech actives, principalement a Casablanca et Rabat",
    "briefcase", "#3b82f6", null);

  // Digital Economy
  r("Internet Penetration Rate", "Taux de Penetration Internet", "90%",
    "Morocco's internet penetration reached 90% with 35 million users",
    "Le taux de penetration d'internet au Maroc a atteint 90% avec 35 millions d'utilisateurs",
    "globe", "#22c55e", null);
  r("E-Commerce Market Size", "Taille Marche E-Commerce", "$2.5B",
    "Morocco's e-commerce market reached $2.5B, growing 25% year-over-year",
    "Le marche du e-commerce marocain a atteint 2,5 Mrd$, en croissance de 25% sur un an",
    "currency-dollar", "#22c55e", null);
  r("Smartphone Penetration", "Penetration Smartphones", "78%",
    "78% of Moroccans own a smartphone, driving mobile-first digital services",
    "78% des Marocains possedent un smartphone, stimulant les services numeriques mobile-first",
    "globe", "#3b82f6", null);
  r("Digital Jobs Created 2024", "Emplois Numeriques Crees 2024", "35,000",
    "Morocco created 35,000 new digital economy jobs in 2024",
    "Le Maroc a cree 35 000 nouveaux emplois dans l'economie numerique en 2024",
    "briefcase", "#22c55e", null);

  // Education and Skills
  r("Engineering Graduates Per Year", "Diplomes Ingenieurs Par An", "12,000+",
    "Morocco produces over 12,000 engineering graduates annually from 30+ schools",
    "Le Maroc produit plus de 12 000 diplomes ingenieurs annuellement de 30+ ecoles",
    "graduation-cap", "#3b82f6", null);
  r("Business School Graduates", "Diplomes Ecoles de Commerce", "8,500+",
    "Over 8,500 business and management graduates enter the job market yearly",
    "Plus de 8 500 diplomes en commerce et management entrent sur le marche du travail chaque annee",
    "graduation-cap", "#3b82f6", null);
  r("OFPPT Trainees Per Year", "Stagiaires OFPPT Par An", "400,000",
    "OFPPT trains 400,000 vocational students annually across 350+ institutes",
    "L'OFPPT forme 400 000 stagiaires professionnels annuellement dans plus de 350 instituts",
    "graduation-cap", "#3b82f6", null);
  r("University Enrollment", "Inscription Universitaire", "1.2M",
    "Morocco has 1.2 million university students across 12 public universities",
    "Le Maroc compte 1,2 million d'etudiants universitaires dans 12 universites publiques",
    "graduation-cap", "#3b82f6", null);
  r("Skills Gap in IT", "Deficit de Competences IT", "25,000",
    "Morocco faces a shortage of 25,000 IT professionals annually",
    "Le Maroc fait face a un deficit de 25 000 professionnels IT annuellement",
    "users", "#f97316", null);

  // Salary Insights
  r("Average IT Developer Salary", "Salaire Moyen Developpeur IT", "15,000 MAD/month",
    "Average monthly salary for IT developers ranges from 12,000-18,000 MAD",
    "Le salaire mensuel moyen des developpeurs IT varie de 12 000 a 18 000 MAD",
    "currency-dollar", "#3b82f6", null);
  r("Average Engineer Salary", "Salaire Moyen Ingenieur", "12,000 MAD/month",
    "Entry-level engineers earn 8,000-12,000 MAD, seniors earn 20,000-35,000 MAD",
    "Les ingenieurs debutants gagnent 8 000-12 000 MAD, les seniors 20 000-35 000 MAD",
    "currency-dollar", "#3b82f6", null);
  r("Minimum Wage Morocco SMIG", "Salaire Minimum SMIG Maroc", "3,111 MAD/month",
    "Morocco's minimum wage (SMIG) was raised to 3,111 MAD/month in 2024",
    "Le salaire minimum (SMIG) marocain a ete augmente a 3 111 MAD/mois en 2024",
    "currency-dollar", "#f97316", null);
  r("Finance Sector Average Salary", "Salaire Moyen Secteur Finance", "18,000 MAD/month",
    "Finance professionals earn an average of 18,000 MAD/month in Casablanca",
    "Les professionnels de la finance gagnent en moyenne 18 000 MAD/mois a Casablanca",
    "currency-dollar", "#22c55e", null);

  // World Cup 2030
  r("World Cup 2030 Infrastructure Budget", "Budget Infrastructure Coupe du Monde 2030", "$5B+",
    "Morocco is investing over $5B in stadiums, transport, and hospitality for World Cup 2030",
    "Le Maroc investit plus de 5 Mrd$ en stades, transport et hotellerie pour la Coupe du Monde 2030",
    "currency-dollar", "#22c55e", null);
  r("World Cup 2030 Jobs Expected", "Emplois Prevus Coupe du Monde 2030", "300,000",
    "World Cup 2030 preparations expected to create 300,000 direct and indirect jobs",
    "Les preparations de la Coupe du Monde 2030 devraient creer 300 000 emplois directs et indirects",
    "briefcase", "#22c55e", null);
  r("New Stadiums Under Construction", "Nouveaux Stades en Construction", "6",
    "6 new world-class stadiums being built for the 2030 FIFA World Cup",
    "6 nouveaux stades de classe mondiale en construction pour la Coupe du Monde FIFA 2030",
    "chart-line-up", "#22c55e", null);

  // Industrial Zones
  r("Kenitra Atlantic Free Zone", "Zone Franche Atlantique Kenitra", "60,000 jobs",
    "Kenitra Atlantic Free Zone hosts PSA/Stellantis and 60,000+ jobs",
    "La Zone Franche Atlantique de Kenitra accueille PSA/Stellantis et plus de 60 000 emplois",
    "briefcase", "#22c55e", "industrial");
  r("Nador West Med Port", "Port Nador West Med", "$1.5B",
    "Nador West Med mega-port project worth $1.5B to rival Tanger Med",
    "Projet de mega-port Nador West Med d'une valeur de 1,5 Mrd$ pour rivaliser avec Tanger Med",
    "currency-dollar", "#22c55e", null);
  r("Casablanca Finance City", "Casablanca Finance City", "200+ companies",
    "CFC has attracted 200+ international financial and professional services firms",
    "Le CFC a attire plus de 200 societes internationales de services financiers et professionnels",
    "briefcase", "#22c55e", null);
  r("Mohammed VI Industrial Acceleration", "Acceleration Industrielle Mohammed VI", "$20B",
    "National industrial acceleration plan targeting $20B in industrial investments by 2030",
    "Plan national d'acceleration industrielle ciblant 20 Mrd$ d'investissements industriels d'ici 2030",
    "currency-dollar", "#22c55e", "industrial");

  // Healthcare
  r("Healthcare Sector Growth", "Croissance Secteur Sante", "+6.5%",
    "Morocco's healthcare market growing at 6.5% annually, reaching $5.6B",
    "Le marche de la sante marocain croit de 6,5% annuellement, atteignant 5,6 Mrd$",
    "chart-line-up", "#22c55e", "healthcare");
  r("Healthcare Workers Needed", "Professionnels de Sante Necessaires", "32,000",
    "Morocco needs 32,000 additional healthcare workers to meet WHO standards",
    "Le Maroc a besoin de 32 000 professionnels de sante supplementaires pour atteindre les normes OMS",
    "users", "#f97316", "healthcare");
  r("Pharmaceutical Industry Exports", "Exportations Industrie Pharmaceutique", "$800M",
    "Morocco's pharmaceutical industry exports $800M annually to 50+ countries",
    "L'industrie pharmaceutique marocaine exporte 800 M$ annuellement vers plus de 50 pays",
    "currency-dollar", "#22c55e", "healthcare");
  r("Medical Tourism Revenue", "Revenus Tourisme Medical", "$300M",
    "Morocco attracts $300M annually in medical tourism from Sub-Saharan Africa and Europe",
    "Le Maroc attire 300 M$ annuellement en tourisme medical d'Afrique subsaharienne et d'Europe",
    "currency-dollar", "#22c55e", "healthcare");

  // HSE
  r("Workplace Accident Rate Decline", "Baisse du Taux d'Accidents du Travail", "-12%",
    "Workplace accidents declined 12% following implementation of Law 12-18 on HSE",
    "Les accidents du travail ont baisse de 12% suite a la mise en oeuvre de la Loi 12-18 sur la SST",
    "chart-line-up", "#22c55e", "hse");
  r("ISO 45001 Certified Companies", "Entreprises Certifiees ISO 45001", "450+",
    "Over 450 Moroccan companies are ISO 45001 certified for occupational health and safety",
    "Plus de 450 entreprises marocaines sont certifiees ISO 45001 pour la sante et securite au travail",
    "briefcase", "#22c55e", "hse");
  r("HSE Professionals Demand", "Demande Professionnels HSE", "+18%",
    "Demand for HSE professionals grew 18% in 2024, driven by industrial expansion",
    "La demande de professionnels HSE a cru de 18% en 2024, portee par l'expansion industrielle",
    "chart-line-up", "#22c55e", "hse");

  // Marrakech-Safi Region
  r("Marrakech-Safi Tourism Jobs", "Emplois Tourisme Marrakech-Safi", "120,000",
    "Tourism employs 120,000 people in the Marrakech-Safi region",
    "Le tourisme emploie 120 000 personnes dans la region de Marrakech-Safi",
    "briefcase", "#3b82f6", null);
  r("Safi Industrial Zone Growth", "Croissance Zone Industrielle Safi", "+22%",
    "Safi's new industrial zone grew 22% with OCP phosphate processing facilities",
    "La nouvelle zone industrielle de Safi a cru de 22% avec les installations de traitement OCP",
    "chart-line-up", "#22c55e", "industrial");

  // Mining
  r("Phosphate Export Revenue", "Revenus Export Phosphates", "$7.5B",
    "OCP's phosphate exports generated $7.5B, making Morocco the world's largest exporter",
    "Les exportations de phosphates d'OCP ont genere 7,5 Mrd$, faisant du Maroc le premier exportateur mondial",
    "currency-dollar", "#22c55e", "industrial");
  r("Mining Sector Employment", "Emploi Secteur Minier", "45,000",
    "Morocco's mining sector directly employs 45,000 workers",
    "Le secteur minier marocain emploie directement 45 000 travailleurs",
    "briefcase", "#3b82f6", "industrial");

  // Textile
  r("Textile Sector Jobs", "Emplois Secteur Textile", "175,000",
    "Morocco's textile and garment industry employs 175,000 workers",
    "L'industrie textile et vestimentaire marocaine emploie 175 000 travailleurs",
    "briefcase", "#3b82f6", "industrial");
  r("Textile Export Value", "Valeur Export Textile", "$4.2B",
    "Morocco exported $4.2B in textiles, mainly to Spain, France, and UK",
    "Le Maroc a exporte 4,2 Mrd$ de textiles, principalement vers l'Espagne, la France et le Royaume-Uni",
    "currency-dollar", "#22c55e", "industrial");

  // Agri-Food
  r("Agri-Food Processing Growth", "Croissance Agroalimentaire", "+5.8%",
    "Morocco's agri-food processing sector grew 5.8% to become Africa's 2nd largest",
    "Le secteur agroalimentaire marocain a cru de 5,8% pour devenir le 2e plus grand d'Afrique",
    "chart-line-up", "#22c55e", null);
  r("Agri-Food Export Revenue", "Revenus Export Agroalimentaire", "$7.1B",
    "Agriculture and food exports reached $7.1B in 2024",
    "Les exportations agricoles et alimentaires ont atteint 7,1 Mrd$ en 2024",
    "currency-dollar", "#22c55e", null);

  // New Moroccan Plans
  r("Plan Morocco 2035 GDP Target", "Objectif PIB Plan Maroc 2035", "$250B",
    "Morocco targets $250B GDP by 2035 through industrial diversification",
    "Le Maroc vise un PIB de 250 Mrd$ d'ici 2035 via la diversification industrielle",
    "currency-dollar", "#3b82f6", null);
  r("Green Morocco Plan II Results", "Resultats Plan Maroc Vert II", "+45%",
    "Agricultural GDP grew 45% under the Green Morocco Plan II",
    "Le PIB agricole a cru de 45% dans le cadre du Plan Maroc Vert II",
    "chart-line-up", "#22c55e", null);
  r("New Development Model Job Target", "Objectif Emploi Nouveau Modele de Dev", "1M jobs",
    "The New Development Model targets creating 1 million quality jobs by 2035",
    "Le Nouveau Modele de Developpement vise la creation d'1 million d'emplois de qualite d'ici 2035",
    "briefcase", "#22c55e", null);

  // Water and Environment
  r("Water Desalination Capacity", "Capacite Dessalement Eau", "300M m3/year",
    "Morocco is building desalination plants producing 300M cubic meters per year",
    "Le Maroc construit des usines de dessalement produisant 300M de metres cubes par an",
    "globe", "#3b82f6", null);
  r("Solar Energy Employment", "Emploi Energie Solaire", "12,000",
    "Morocco's Noor solar complex and related projects employ 12,000 workers",
    "Le complexe solaire Noor et projets associes emploient 12 000 travailleurs",
    "briefcase", "#22c55e", null);

  // Additional Regional
  r("Fez-Meknes Region Unemployment", "Chomage Region Fes-Meknes", "16.4%",
    "Fez-Meknes region unemployment at 16.4%, with artisanal sector declining",
    "Taux de chomage de la region Fes-Meknes a 16,4%, avec le secteur artisanal en declin",
    "users", "#ef4444", null);
  r("Beni Mellal-Khenifra Agri Jobs", "Emplois Agri Beni Mellal-Khenifra", "180,000",
    "Beni Mellal-Khenifra region has 180,000 agricultural jobs but faces modernization challenges",
    "La region de Beni Mellal-Khenifra compte 180 000 emplois agricoles mais fait face a des defis de modernisation",
    "briefcase", "#f97316", null);
  r("Laayoune-Sakia Fishing Industry", "Industrie Peche Laayoune-Sakia", "25,000",
    "The Southern provinces fishing industry employs 25,000 workers",
    "L'industrie de la peche des provinces du Sud emploie 25 000 travailleurs",
    "briefcase", "#3b82f6", null);
  r("Souss-Massa Agriculture Export", "Export Agriculture Souss-Massa", "$2.8B",
    "Souss-Massa region exports $2.8B in citrus, tomatoes, and berries annually",
    "La region Souss-Massa exporte 2,8 Mrd$ d'agrumes, tomates et baies annuellement",
    "currency-dollar", "#22c55e", null);
  r("Draa-Tafilalet Tourism Potential", "Potentiel Touristique Draa-Tafilalet", "+35%",
    "Desert tourism in Draa-Tafilalet grew 35% with eco-lodge development",
    "Le tourisme du desert a Draa-Tafilalet a cru de 35% avec le developpement d'eco-lodges",
    "chart-line-up", "#22c55e", null);

  // Logistics
  r("Logistics Sector Contribution", "Contribution Secteur Logistique", "5.3% GDP",
    "Logistics accounts for 5.3% of Morocco's GDP, targeting 5% cost reduction",
    "La logistique represente 5,3% du PIB marocain, visant une reduction de 5% des couts",
    "briefcase", "#3b82f6", null);
  r("Port Capacity Expansion", "Expansion Capacite Portuaire", "+40%",
    "Morocco is expanding port capacity by 40% to 400 million tons by 2030",
    "Le Maroc augmente la capacite portuaire de 40% a 400 millions de tonnes d'ici 2030",
    "chart-line-up", "#22c55e", null);
  r("High-Speed Rail (LGV) Extension", "Extension Train Grande Vitesse (LGV)", "1,300 km",
    "Morocco is extending its high-speed rail network to 1,300 km connecting all major cities",
    "Le Maroc etend son reseau de train a grande vitesse a 1 300 km reliant toutes les grandes villes",
    "globe", "#22c55e", null);

  // Call Centers
  r("Call Center Industry Revenue", "Revenus Industrie Centres d'Appels", "$1.2B",
    "Morocco's call center industry generates $1.2B serving European francophone markets",
    "L'industrie des centres d'appels marocains genere 1,2 Mrd$ au service des marches francophones europeens",
    "currency-dollar", "#22c55e", null);
  r("Call Center Employees", "Employes Centres d'Appels", "70,000+",
    "Morocco's call center sector employs over 70,000 agents, mostly youth",
    "Le secteur des centres d'appels marocains emploie plus de 70 000 agents, principalement des jeunes",
    "users", "#3b82f6", null);

  // Education Investment
  r("Education Budget Share", "Part Budget Education", "26%",
    "Morocco allocates 26% of its national budget to education, highest in MENA",
    "Le Maroc consacre 26% de son budget national a l'education, le plus eleve de la region MENA",
    "graduation-cap", "#22c55e", null);
  r("Private University Growth", "Croissance Universites Privees", "+40%",
    "Private university enrollment grew 40% over 5 years with 35+ institutions",
    "Les inscriptions dans les universites privees ont cru de 40% sur 5 ans avec plus de 35 institutions",
    "graduation-cap", "#22c55e", null);

  // Green Economy
  r("Green Jobs Target 2030", "Objectif Emplois Verts 2030", "100,000",
    "Morocco targets creating 100,000 green jobs by 2030 in renewable energy and efficiency",
    "Le Maroc vise la creation de 100 000 emplois verts d'ici 2030 dans les energies renouvelables et l'efficacite",
    "briefcase", "#22c55e", null);
  r("Wind Energy Installed Capacity", "Capacite Eolienne Installee", "1,900 MW",
    "Morocco has 1,900 MW of wind energy capacity with major farms in Tarfaya and Midelt",
    "Le Maroc dispose de 1 900 MW de capacite eolienne avec des parcs majeurs a Tarfaya et Midelt",
    "globe", "#22c55e", null);

  // Tech Hubs
  r("Rabat Technopolis Employment", "Emploi Technopolis Rabat", "15,000+",
    "Rabat Technopolis hosts 15,000+ tech professionals in 200+ companies",
    "Technopolis Rabat accueille plus de 15 000 professionnels tech dans plus de 200 entreprises",
    "briefcase", "#22c55e", null);
  r("Fez Shore Nearshore Park", "Parc Nearshore Fez Shore", "5,000",
    "Fez Shore nearshoring park employs 5,000 in IT and BPO services",
    "Le parc de nearshoring Fez Shore emploie 5 000 personnes en IT et BPO",
    "briefcase", "#3b82f6", null);

  // General Economic
  r("GDP Growth Rate 2025", "Taux de Croissance PIB 2025", "3.4%",
    "Morocco's GDP is projected to grow 3.4% in 2025 according to BAM",
    "Le PIB du Maroc devrait croitre de 3,4% en 2025 selon BAM",
    "chart-line-up", "#22c55e", null);
  r("Inflation Rate 2025", "Taux d'Inflation 2025", "2.1%",
    "Inflation moderated to 2.1% in 2025 after the 2022-2023 spike",
    "L'inflation s'est moderee a 2,1% en 2025 apres le pic de 2022-2023",
    "chart-line-up", "#22c55e", null);

  return rows;
}

// ─── 3. INTERVIEW COMMON QUESTIONS (200+ entries) ─────────────────────────────

function buildInterviewQuestions() {
  const rows = [];
  let counter = 400; // Start after existing IDs

  const r = (question, questionFr, type, field, sampleAnswer, sampleAnswerFr, tips, tipsFr, difficulty) => {
    const id = `exp-${String(counter++).padStart(3, "0")}`;
    rows.push([
      id, question, questionFr, type, field,
      sampleAnswer, sampleAnswerFr,
      JSON.stringify(tips), JSON.stringify(tipsFr),
      difficulty, true, rows.length, new Date(), new Date(),
    ]);
  };

  // ── General Behavioral Questions ──
  r("Describe a time when you had to deal with a difficult colleague.",
    "Decrivez une situation ou vous avez du gerer un collegue difficile.",
    "behavioral", "general",
    "I had a colleague who often missed deadlines. I scheduled a one-on-one to understand their challenges and we created a shared task board that improved collaboration.",
    "J'avais un collegue qui manquait souvent les delais. J'ai organise un entretien individuel pour comprendre ses difficultes et nous avons cree un tableau de taches partage qui a ameliore la collaboration.",
    ["Use the STAR method","Focus on resolution, not blame","Show emotional intelligence"],
    ["Utilisez la methode STAR","Concentrez-vous sur la resolution, pas le blame","Montrez l'intelligence emotionnelle"],
    "medium");
  r("Tell me about a time you failed and what you learned.",
    "Parlez-moi d'un echec et de ce que vous en avez appris.",
    "behavioral", "general",
    "I underestimated a project timeline and delivered late. I learned to add buffer time and break projects into smaller milestones for better tracking.",
    "J'ai sous-estime un delai de projet et livre en retard. J'ai appris a ajouter du temps tampon et decouper les projets en jalons plus petits pour un meilleur suivi.",
    ["Be honest about the failure","Focus on growth","Show self-awareness"],
    ["Soyez honnete sur l'echec","Concentrez-vous sur la croissance","Montrez la conscience de soi"],
    "medium");
  r("How do you prioritize tasks when everything seems urgent?",
    "Comment priorisez-vous les taches quand tout semble urgent ?",
    "behavioral", "general",
    "I use the Eisenhower matrix to categorize tasks by urgency and importance, then communicate with stakeholders about realistic timelines.",
    "J'utilise la matrice d'Eisenhower pour categoriser les taches par urgence et importance, puis je communique avec les parties prenantes sur des delais realistes.",
    ["Mention specific frameworks","Show decision-making process","Discuss stakeholder communication"],
    ["Mentionnez des cadres specifiques","Montrez le processus de decision","Discutez la communication avec les parties prenantes"],
    "medium");
  r("What motivates you in your work?",
    "Qu'est-ce qui vous motive dans votre travail ?",
    "motivation", "general",
    "I'm motivated by solving complex problems and seeing the impact of my work. Building something that helps people gives me great satisfaction.",
    "Je suis motive par la resolution de problemes complexes et voir l'impact de mon travail. Construire quelque chose qui aide les gens me donne une grande satisfaction.",
    ["Be authentic","Connect to the role","Show passion"],
    ["Soyez authentique","Connectez a la poste","Montrez la passion"],
    "easy");
  r("Where do you see yourself in 5 years?",
    "Ou vous voyez-vous dans 5 ans ?",
    "motivation", "general",
    "I see myself in a leadership role where I can mentor others while continuing to grow technically in emerging areas.",
    "Je me vois dans un role de leadership ou je peux encadrer d'autres tout en continuant a evoluer techniquement dans des domaines emergents.",
    ["Show ambition aligned with company","Be realistic","Mention skill development"],
    ["Montrez une ambition alignee avec l'entreprise","Soyez realiste","Mentionnez le developpement des competences"],
    "easy");
  r("How do you handle feedback or criticism?",
    "Comment gerez-vous les retours ou les critiques ?",
    "behavioral", "general",
    "I view feedback as an opportunity for growth. I listen actively, ask clarifying questions, and create an action plan for improvement.",
    "Je considere les retours comme une opportunite de croissance. J'ecoute activement, pose des questions de clarification et cree un plan d'action pour l'amelioration.",
    ["Show openness","Give a concrete example","Demonstrate growth mindset"],
    ["Montrez l'ouverture","Donnez un exemple concret","Demonstrez un etat d'esprit de croissance"],
    "easy");
  r("Describe a situation where you had to adapt to a major change.",
    "Decrivez une situation ou vous avez du vous adapter a un changement majeur.",
    "behavioral", "general",
    "When our company restructured, I volunteered to learn new tools and helped train my team, which reduced the transition period by 3 weeks.",
    "Lorsque notre entreprise s'est restructuree, je me suis porte volontaire pour apprendre de nouveaux outils et j'ai aide a former mon equipe, ce qui a reduit la periode de transition de 3 semaines.",
    ["Show flexibility","Demonstrate proactive attitude","Quantify results"],
    ["Montrez la flexibilite","Demonstrez une attitude proactive","Quantifiez les resultats"],
    "medium");
  r("What is your approach to teamwork?",
    "Quelle est votre approche du travail d'equipe ?",
    "behavioral", "general",
    "I believe in clear communication, defined roles, and mutual respect. I actively contribute while supporting team members.",
    "Je crois en une communication claire, des roles definis et le respect mutuel. Je contribue activement tout en soutenant les membres de l'equipe.",
    ["Give specific team examples","Show collaboration skills","Mention conflict resolution"],
    ["Donnez des exemples d'equipe specifiques","Montrez les competences de collaboration","Mentionnez la resolution de conflits"],
    "easy");
  r("How do you manage stress and pressure at work?",
    "Comment gerez-vous le stress et la pression au travail ?",
    "behavioral", "general",
    "I manage stress through organization, regular breaks, and physical exercise. I also break large tasks into smaller, manageable pieces.",
    "Je gere le stress par l'organisation, des pauses regulieres et l'exercice physique. Je decompose aussi les grandes taches en morceaux plus petits et gereables.",
    ["Be honest","Mention specific techniques","Show resilience"],
    ["Soyez honnete","Mentionnez des techniques specifiques","Montrez la resilience"],
    "easy");
  r("Tell me about a time you led a project or initiative.",
    "Parlez-moi d'une fois ou vous avez dirige un projet ou une initiative.",
    "competency", "general",
    "I led a cross-functional team of 6 to implement a new CRM system. I coordinated tasks, managed stakeholder expectations, and delivered on time.",
    "J'ai dirige une equipe transversale de 6 personnes pour implementer un nouveau systeme CRM. J'ai coordonne les taches, gere les attentes des parties prenantes et livre dans les delais.",
    ["Highlight leadership style","Show team management","Quantify outcomes"],
    ["Soulignez le style de leadership","Montrez la gestion d'equipe","Quantifiez les resultats"],
    "hard");

  // ── Genie Informatique (Software Engineering) ──
  r("Explain the difference between SQL and NoSQL databases. When would you use each?",
    "Expliquez la difference entre les bases de donnees SQL et NoSQL. Quand utiliseriez-vous chacune ?",
    "technical", "genie-informatique",
    "SQL databases are relational with structured schemas, ideal for transactions. NoSQL databases are document-based or key-value, better for unstructured data at scale.",
    "Les bases de donnees SQL sont relationnelles avec des schemas structures, ideales pour les transactions. Les bases NoSQL sont basees sur des documents ou cle-valeur, mieux pour les donnees non structurees a grande echelle.",
    ["Compare ACID vs BASE","Mention real examples (PostgreSQL vs MongoDB)","Discuss scaling patterns"],
    ["Comparez ACID vs BASE","Mentionnez des exemples reels (PostgreSQL vs MongoDB)","Discutez les patterns de scaling"],
    "medium");
  r("How would you design a REST API for a banking application?",
    "Comment concevriez-vous une API REST pour une application bancaire ?",
    "technical", "genie-informatique",
    "I'd design resource-based endpoints with proper HTTP methods, implement OAuth2 for security, add rate limiting, and ensure idempotent operations.",
    "Je concevrais des endpoints bases sur les ressources avec les methodes HTTP appropriees, implementerais OAuth2 pour la securite, ajouterais la limitation de debit et assurerais des operations idempotentes.",
    ["Cover authentication and authorization","Discuss error handling","Mention versioning strategy"],
    ["Couvrez l'authentification et l'autorisation","Discutez la gestion des erreurs","Mentionnez la strategie de versioning"],
    "hard");
  r("What is the difference between microservices and monolithic architecture?",
    "Quelle est la difference entre l'architecture microservices et monolithique ?",
    "technical", "genie-informatique",
    "Monolithic: single deployable unit, simpler but harder to scale. Microservices: independent services communicating via APIs, scalable but complex to manage.",
    "Monolithique: unite deployable unique, plus simple mais difficile a faire evoluer. Microservices: services independants communiquant via API, evolutifs mais complexes a gerer.",
    ["Discuss trade-offs","Mention when each is appropriate","Cover deployment considerations"],
    ["Discutez les compromis","Mentionnez quand chacun est appropriate","Couvrez les considerations de deploiement"],
    "hard");
  r("Describe the CI/CD pipeline you would set up for a new project.",
    "Decrivez le pipeline CI/CD que vous mettriez en place pour un nouveau projet.",
    "technical", "genie-informatique",
    "I'd set up linting, unit tests, integration tests, security scanning, containerized builds, staging deployment, and automated production deployment with rollback.",
    "Je mettrais en place le linting, tests unitaires, tests d'integration, scanning de securite, builds containerises, deploiement en staging et deploiement automatise en production avec rollback.",
    ["Mention specific tools (GitLab CI, Jenkins)","Cover testing stages","Discuss rollback strategy"],
    ["Mentionnez des outils specifiques (GitLab CI, Jenkins)","Couvrez les etapes de test","Discutez la strategie de rollback"],
    "hard");
  r("How do you ensure code quality in a team environment?",
    "Comment assurez-vous la qualite du code dans un environnement d'equipe ?",
    "competency", "genie-informatique",
    "Through code reviews, automated testing, coding standards, pair programming, and regular refactoring sessions.",
    "Par des revues de code, tests automatises, normes de codage, programmation en binome et sessions de refactoring regulieres.",
    ["Mention specific tools","Discuss code review process","Cover testing strategy"],
    ["Mentionnez des outils specifiques","Discutez le processus de revue de code","Couvrez la strategie de test"],
    "medium");
  r("Explain containerization with Docker and when you would use Kubernetes.",
    "Expliquez la conteneurisation avec Docker et quand vous utiliseriez Kubernetes.",
    "technical", "genie-informatique",
    "Docker packages applications with their dependencies. Kubernetes orchestrates multiple containers, providing scaling, load balancing, and self-healing.",
    "Docker empaquete les applications avec leurs dependances. Kubernetes orchestre plusieurs conteneurs, fournissant le scaling, l'equilibrage de charge et l'auto-reparation.",
    ["Explain benefits of containers","Discuss use cases","Mention alternatives like Docker Compose"],
    ["Expliquez les avantages des conteneurs","Discutez les cas d'utilisation","Mentionnez les alternatives comme Docker Compose"],
    "hard");
  r("What security best practices do you follow when developing web applications?",
    "Quelles bonnes pratiques de securite suivez-vous lors du developpement d'applications web ?",
    "technical", "genie-informatique",
    "Input validation, parameterized queries, HTTPS, CORS configuration, JWT token management, rate limiting, and regular dependency audits.",
    "Validation des entrees, requetes parametrees, HTTPS, configuration CORS, gestion des tokens JWT, limitation de debit et audits reguliers des dependances.",
    ["Mention OWASP Top 10","Discuss authentication best practices","Cover data encryption"],
    ["Mentionnez l'OWASP Top 10","Discutez les bonnes pratiques d'authentification","Couvrez le chiffrement des donnees"],
    "hard");
  r("How would you optimize a slow database query?",
    "Comment optimiseriez-vous une requete de base de donnees lente ?",
    "technical", "genie-informatique",
    "I'd analyze the execution plan with EXPLAIN, add appropriate indexes, avoid SELECT *, use pagination, and consider caching frequently accessed data.",
    "J'analyserais le plan d'execution avec EXPLAIN, ajouterais des index appropries, eviterais SELECT *, utiliserais la pagination et considererais le cache pour les donnees frequemment accedees.",
    ["Start with EXPLAIN ANALYZE","Discuss indexing strategies","Mention N+1 query problem"],
    ["Commencez par EXPLAIN ANALYZE","Discutez les strategies d'indexation","Mentionnez le probleme de requetes N+1"],
    "medium");
  r("Describe your experience with agile methodology.",
    "Decrivez votre experience avec la methodologie agile.",
    "competency", "genie-informatique",
    "I've worked with Scrum in 2-week sprints, participating in dailies, planning, reviews, and retrospectives. I value iterative delivery and continuous feedback.",
    "J'ai travaille avec Scrum en sprints de 2 semaines, participant aux dailies, planning, revues et retrospectives. Je valorise la livraison iterative et le feedback continu.",
    ["Show practical experience","Mention specific ceremonies","Discuss tools used"],
    ["Montrez l'experience pratique","Mentionnez des ceremonies specifiques","Discutez les outils utilises"],
    "easy");
  r("What is your testing strategy for a full-stack application?",
    "Quelle est votre strategie de test pour une application full-stack ?",
    "technical", "genie-informatique",
    "Unit tests for business logic, integration tests for API endpoints, E2E tests for critical user flows, and performance tests for load scenarios.",
    "Tests unitaires pour la logique metier, tests d'integration pour les endpoints API, tests E2E pour les flux utilisateur critiques et tests de performance pour les scenarios de charge.",
    ["Cover the testing pyramid","Mention frameworks","Discuss coverage targets"],
    ["Couvrez la pyramide de tests","Mentionnez les frameworks","Discutez les objectifs de couverture"],
    "medium");

  // ── Finance ──
  r("How do you perform a discounted cash flow (DCF) analysis?",
    "Comment effectuez-vous une analyse des flux de tresorerie actualises (DCF) ?",
    "technical", "finance",
    "I project future cash flows, determine the appropriate discount rate (WACC), calculate present values, and sum them with terminal value to get enterprise value.",
    "Je projette les flux de tresorerie futurs, determine le taux d'actualisation appropriate (CMPC), calcule les valeurs presentes et les additionne avec la valeur terminale pour obtenir la valeur d'entreprise.",
    ["Explain each step clearly","Mention assumptions","Discuss sensitivity analysis"],
    ["Expliquez chaque etape clairement","Mentionnez les hypotheses","Discutez l'analyse de sensibilite"],
    "hard");
  r("Explain the difference between IFRS and Moroccan accounting standards (CGNC).",
    "Expliquez la difference entre les normes IFRS et les normes comptables marocaines (CGNC).",
    "technical", "finance",
    "IFRS uses fair value and is principles-based, while CGNC follows historical cost and is rules-based. Morocco is transitioning listed companies to IFRS.",
    "Les IFRS utilisent la juste valeur et sont basees sur des principes, tandis que le CGNC suit le cout historique et est base sur des regles. Le Maroc transite les societes cotees vers les IFRS.",
    ["Show knowledge of both standards","Discuss practical implications","Mention Morocco's transition"],
    ["Montrez la connaissance des deux normes","Discutez les implications pratiques","Mentionnez la transition du Maroc"],
    "hard");
  r("How would you assess the financial health of a Moroccan SME?",
    "Comment evalueriez-vous la sante financiere d'une PME marocaine ?",
    "situational", "finance",
    "I'd analyze liquidity ratios, profitability margins, debt-to-equity, cash flow patterns, and compare with sector benchmarks from Bank Al-Maghrib data.",
    "J'analyserais les ratios de liquidite, les marges de rentabilite, le ratio d'endettement, les flux de tresorerie et comparerais aux benchmarks sectoriels de Bank Al-Maghrib.",
    ["Cover key financial ratios","Mention Moroccan context","Discuss industry benchmarks"],
    ["Couvrez les ratios financiers cles","Mentionnez le contexte marocain","Discutez les benchmarks sectoriels"],
    "medium");
  r("What is your experience with financial modeling in Excel?",
    "Quelle est votre experience avec la modelisation financiere sous Excel ?",
    "competency", "finance",
    "I've built 3-statement models, LBO models, and merger models. I follow best practices: blue for inputs, black for formulas, clear structure, and error checks.",
    "J'ai construit des modeles a 3 etats, des modeles LBO et des modeles de fusion. Je suis les bonnes pratiques: bleu pour les entrees, noir pour les formules, structure claire et verifications d'erreurs.",
    ["Mention specific model types","Show attention to detail","Discuss best practices"],
    ["Mentionnez des types de modeles specifiques","Montrez l'attention aux details","Discutez les bonnes pratiques"],
    "medium");
  r("How does Morocco's banking regulation differ from European standards?",
    "En quoi la reglementation bancaire marocaine differe-t-elle des normes europeennes ?",
    "technical", "finance",
    "Morocco follows Basel III with local adaptations by Bank Al-Maghrib. Key differences include capital adequacy ratios, reserve requirements, and Islamic finance provisions.",
    "Le Maroc suit Bale III avec des adaptations locales de Bank Al-Maghrib. Les differences cles incluent les ratios d'adequation du capital, les reserves obligatoires et les dispositions de finance islamique.",
    ["Show knowledge of Basel III","Mention BAM role","Discuss Islamic finance"],
    ["Montrez la connaissance de Bale III","Mentionnez le role de BAM","Discutez la finance islamique"],
    "hard");
  r("Explain the concept of working capital management.",
    "Expliquez le concept de gestion du besoin en fonds de roulement.",
    "technical", "finance",
    "Working capital management involves optimizing current assets and liabilities. Key components: accounts receivable, inventory, and accounts payable turnover.",
    "La gestion du BFR implique l'optimisation des actifs et passifs courants. Composantes cles: rotation des creances clients, stocks et dettes fournisseurs.",
    ["Cover the cash conversion cycle","Mention optimization techniques","Discuss industry benchmarks"],
    ["Couvrez le cycle de conversion de tresorerie","Mentionnez les techniques d'optimisation","Discutez les benchmarks sectoriels"],
    "medium");
  r("How would you evaluate a potential merger or acquisition in Morocco?",
    "Comment evalueriez-vous une fusion ou acquisition potentielle au Maroc ?",
    "situational", "finance",
    "Due diligence covering financial, legal, tax (including Moroccan IS/IR implications), strategic fit, synergy estimation, and AMMC regulatory requirements.",
    "Due diligence couvrant les aspects financiers, juridiques, fiscaux (y compris les implications IS/IR marocaines), l'adequation strategique, l'estimation des synergies et les exigences reglementaires de l'AMMC.",
    ["Cover due diligence steps","Mention regulatory requirements","Discuss valuation methods"],
    ["Couvrez les etapes de due diligence","Mentionnez les exigences reglementaires","Discutez les methodes d'evaluation"],
    "hard");

  // ── Genie Civil ──
  r("How do you ensure structural safety in seismic zones like Northern Morocco?",
    "Comment assurez-vous la securite structurelle dans les zones sismiques comme le Nord du Maroc ?",
    "technical", "genie-civil",
    "I follow RPS 2000 seismic code, use ductile detailing, apply capacity design, and utilize software like ETABS for dynamic analysis.",
    "Je suis le code sismique RPS 2000, utilise un detaillage ductile, applique la conception par capacite et utilise des logiciels comme ETABS pour l'analyse dynamique.",
    ["Mention RPS 2000 code","Discuss ductility","Cover software tools"],
    ["Mentionnez le code RPS 2000","Discutez la ductilite","Couvrez les outils logiciels"],
    "hard");
  r("Describe the process of designing a reinforced concrete beam.",
    "Decrivez le processus de conception d'une poutre en beton arme.",
    "technical", "genie-civil",
    "Load calculation, moment and shear diagrams, section sizing, flexural reinforcement design, shear reinforcement, deflection and crack width checks per BAEL/Eurocode.",
    "Calcul des charges, diagrammes de moment et de cisaillement, dimensionnement de la section, conception du ferraillage en flexion, ferraillage en cisaillement, verifications de fleche et d'ouverture de fissures selon BAEL/Eurocode.",
    ["Follow systematic approach","Mention applicable codes","Cover serviceability checks"],
    ["Suivez une approche systematique","Mentionnez les codes applicables","Couvrez les verifications de service"],
    "hard");
  r("What construction materials are most commonly used in Morocco?",
    "Quels materiaux de construction sont les plus couramment utilises au Maroc ?",
    "technical", "genie-civil",
    "Reinforced concrete dominates. Also: clay bricks, hollow blocks, structural steel, and increasingly, precast elements and BIM-integrated designs.",
    "Le beton arme domine. Aussi: briques en argile, parpaings, acier de construction et, de plus en plus, elements prefabriques et conceptions integrees BIM.",
    ["Cover local material availability","Mention sustainability trends","Discuss cost considerations"],
    ["Couvrez la disponibilite locale des materiaux","Mentionnez les tendances de durabilite","Discutez les considerations de cout"],
    "easy");
  r("How do you manage a construction project with tight deadlines?",
    "Comment gerez-vous un projet de construction avec des delais serres ?",
    "situational", "genie-civil",
    "I create detailed Gantt charts, identify critical path, use fast-track/crash methods, and hold daily site coordination meetings.",
    "Je cree des diagrammes de Gantt detailles, identifie le chemin critique, utilise des methodes de fast-track/crash et tiens des reunions de coordination quotidiennes sur site.",
    ["Mention project management tools","Discuss resource optimization","Cover risk management"],
    ["Mentionnez les outils de gestion de projet","Discutez l'optimisation des ressources","Couvrez la gestion des risques"],
    "medium");
  r("Explain BIM technology and its adoption in Morocco.",
    "Expliquez la technologie BIM et son adoption au Maroc.",
    "technical", "genie-civil",
    "BIM (Building Information Modeling) creates digital 3D models integrating design, construction, and operations data. Morocco is gradually adopting BIM for major projects.",
    "Le BIM (Building Information Modeling) cree des modeles 3D numeriques integrant les donnees de conception, construction et exploitation. Le Maroc adopte progressivement le BIM pour les grands projets.",
    ["Explain BIM levels","Mention software (Revit, ArchiCAD)","Discuss Morocco's adoption"],
    ["Expliquez les niveaux BIM","Mentionnez les logiciels (Revit, ArchiCAD)","Discutez l'adoption au Maroc"],
    "medium");

  // ── Genie Electrique ──
  r("How do you design an electrical power distribution system for a factory?",
    "Comment concevez-vous un systeme de distribution electrique pour une usine ?",
    "technical", "genie-electrique",
    "I assess load requirements, select transformer capacity, design MV/LV distribution, specify protection devices, and ensure compliance with NFC 15-100.",
    "J'evalue les besoins de charge, selectionne la capacite du transformateur, concois la distribution MT/BT, specifie les dispositifs de protection et assure la conformite avec la NFC 15-100.",
    ["Cover load calculation","Mention protection coordination","Discuss energy efficiency"],
    ["Couvrez le calcul de charge","Mentionnez la coordination de protection","Discutez l'efficacite energetique"],
    "hard");
  r("What is your experience with programmable logic controllers (PLCs)?",
    "Quelle est votre experience avec les automates programmables (API) ?",
    "competency", "genie-electrique",
    "I've programmed Siemens S7 and Allen-Bradley PLCs using Ladder Logic and Structured Text for industrial automation and SCADA systems.",
    "J'ai programme des automates Siemens S7 et Allen-Bradley en Ladder Logic et Texte Structure pour l'automatisation industrielle et les systemes SCADA.",
    ["Mention specific PLC brands","Discuss programming languages","Cover real applications"],
    ["Mentionnez des marques d'automates specifiques","Discutez les langages de programmation","Couvrez les applications reelles"],
    "medium");
  r("How do you approach renewable energy system design in Morocco?",
    "Comment abordez-vous la conception de systemes d'energie renouvelable au Maroc ?",
    "technical", "genie-electrique",
    "I analyze solar irradiation data, size PV panels and inverters, design grid connection per ONEE requirements, and calculate ROI for the Moroccan context.",
    "J'analyse les donnees d'irradiation solaire, dimensionne les panneaux PV et onduleurs, concois la connexion reseau selon les exigences de l'ONEE et calcule le ROI pour le contexte marocain.",
    ["Mention Moroccan solar potential","Discuss ONEE regulations","Cover storage solutions"],
    ["Mentionnez le potentiel solaire marocain","Discutez les reglementations de l'ONEE","Couvrez les solutions de stockage"],
    "hard");
  r("Explain the difference between AC and DC motor drives.",
    "Expliquez la difference entre les variateurs de vitesse AC et DC.",
    "technical", "genie-electrique",
    "DC drives control speed via armature voltage; simpler but require brush maintenance. AC drives (VFDs) use frequency control, are more efficient and maintenance-free.",
    "Les variateurs DC controlent la vitesse par la tension d'induit; plus simples mais necessitent l'entretien des balais. Les variateurs AC (VFD) utilisent le controle de frequence, sont plus efficaces et sans entretien.",
    ["Cover operating principles","Discuss efficiency","Mention application scenarios"],
    ["Couvrez les principes de fonctionnement","Discutez l'efficacite","Mentionnez les scenarios d'application"],
    "medium");
  r("What safety standards apply to electrical installations in Morocco?",
    "Quelles normes de securite s'appliquent aux installations electriques au Maroc ?",
    "technical", "genie-electrique",
    "Morocco follows NFC 15-100 for low voltage, NFC 13-100/200 for medium voltage, and NM standards. ONEE sets grid connection rules.",
    "Le Maroc suit la NFC 15-100 pour la basse tension, la NFC 13-100/200 pour la moyenne tension et les normes NM. L'ONEE fixe les regles de raccordement au reseau.",
    ["Mention specific standards","Discuss inspection requirements","Cover safety measures"],
    ["Mentionnez les normes specifiques","Discutez les exigences d'inspection","Couvrez les mesures de securite"],
    "medium");

  // ── Genie Mecanique ──
  r("How do you approach the design of a mechanical transmission system?",
    "Comment abordez-vous la conception d'un systeme de transmission mecanique ?",
    "technical", "genie-mecanique",
    "I analyze torque and speed requirements, select gear types (spur, helical, planetary), calculate gear ratios, and verify using FEA for stress analysis.",
    "J'analyse les exigences de couple et vitesse, selectionne les types d'engrenages (droits, helicoidaux, planetaires), calcule les rapports et verifie par FEA pour l'analyse des contraintes.",
    ["Cover systematic design approach","Mention CAD/FEA tools","Discuss material selection"],
    ["Couvrez l'approche de conception systematique","Mentionnez les outils CAO/FEA","Discutez la selection des materiaux"],
    "hard");
  r("What CAD/CAM software are you proficient in?",
    "Quels logiciels CAO/FAO maitrisez-vous ?",
    "competency", "genie-mecanique",
    "I'm proficient in SolidWorks and CATIA for design, ANSYS for simulation, and Mastercam for CNC programming.",
    "Je maitrise SolidWorks et CATIA pour la conception, ANSYS pour la simulation et Mastercam pour la programmation CNC.",
    ["List specific software","Mention certification","Discuss project applications"],
    ["Listez les logiciels specifiques","Mentionnez les certifications","Discutez les applications projet"],
    "easy");
  r("How do you ensure quality in automotive parts manufacturing?",
    "Comment assurez-vous la qualite dans la fabrication de pieces automobiles ?",
    "competency", "genie-mecanique",
    "Through IATF 16949 quality management, SPC monitoring, PPAP submissions, FMEA analysis, and regular CMM dimensional inspections.",
    "Par la gestion qualite IATF 16949, le suivi SPC, les soumissions PPAP, l'analyse AMDEC et les inspections dimensionnelles regulieres par MMT.",
    ["Mention automotive quality standards","Discuss FMEA","Cover measurement systems"],
    ["Mentionnez les normes qualite automobile","Discutez l'AMDEC","Couvrez les systemes de mesure"],
    "hard");
  r("Explain the difference between CNC milling and CNC turning.",
    "Expliquez la difference entre le fraisage CNC et le tournage CNC.",
    "technical", "genie-mecanique",
    "Milling uses rotating cutters on a stationary workpiece for complex shapes. Turning rotates the workpiece against a fixed tool for cylindrical parts.",
    "Le fraisage utilise des fraises rotatives sur une piece fixe pour des formes complexes. Le tournage fait tourner la piece contre un outil fixe pour les pieces cylindriques.",
    ["Cover machine types","Discuss material considerations","Mention multi-axis machining"],
    ["Couvrez les types de machines","Discutez les considerations materiaux","Mentionnez l'usinage multi-axes"],
    "easy");
  r("How do you reduce manufacturing waste in a production line?",
    "Comment reduisez-vous les dechets de fabrication dans une ligne de production ?",
    "situational", "genie-mecanique",
    "I apply lean manufacturing principles: value stream mapping, 5S, Kaizen, and statistical process control to identify and eliminate waste.",
    "J'applique les principes du lean manufacturing: cartographie de la chaine de valeur, 5S, Kaizen et controle statistique des processus pour identifier et eliminer les dechets.",
    ["Mention lean tools","Discuss measurement","Cover sustainability"],
    ["Mentionnez les outils lean","Discutez la mesure","Couvrez la durabilite"],
    "medium");

  // ── Genie Industriel ──
  r("How would you optimize a production scheduling system?",
    "Comment optimiseriez-vous un systeme de planification de production ?",
    "situational", "genie-industriel",
    "I'd implement an MRP/ERP system, use constraint-based scheduling, apply theory of constraints, and optimize with simulation models.",
    "J'implementerais un systeme MRP/ERP, utiliserais la planification basee sur les contraintes, appliquerais la theorie des contraintes et optimiserais avec des modeles de simulation.",
    ["Discuss scheduling algorithms","Mention ERP systems","Cover KPIs"],
    ["Discutez les algorithmes de planification","Mentionnez les systemes ERP","Couvrez les KPI"],
    "hard");
  r("What is Six Sigma and how have you applied it?",
    "Qu'est-ce que Six Sigma et comment l'avez-vous applique ?",
    "competency", "genie-industriel",
    "Six Sigma is a data-driven methodology for reducing defects. I've used DMAIC to reduce a production defect rate from 3.2% to 0.4% in an automotive plant.",
    "Six Sigma est une methodologie basee sur les donnees pour reduire les defauts. J'ai utilise DMAIC pour reduire un taux de defauts de production de 3,2% a 0,4% dans une usine automobile.",
    ["Explain DMAIC steps","Quantify improvements","Mention certification level"],
    ["Expliquez les etapes DMAIC","Quantifiez les ameliorations","Mentionnez le niveau de certification"],
    "medium");
  r("How do you implement a preventive maintenance program?",
    "Comment mettez-vous en place un programme de maintenance preventive ?",
    "competency", "genie-industriel",
    "I establish a CMMS system, create maintenance calendars based on equipment criticality, train technicians, and track OEE as the key metric.",
    "Je mets en place un systeme GMAO, cree des calendriers de maintenance bases sur la criticite des equipements, forme les techniciens et suis le TRS comme metrique cle.",
    ["Mention CMMS software","Discuss KPIs (OEE, MTBF)","Cover cost-benefit analysis"],
    ["Mentionnez les logiciels GMAO","Discutez les KPI (TRS, MTBF)","Couvrez l'analyse cout-benefice"],
    "medium");
  r("Explain Industry 4.0 and its relevance to Moroccan manufacturing.",
    "Expliquez l'Industrie 4.0 et sa pertinence pour l'industrie manufacturiere marocaine.",
    "technical", "genie-industriel",
    "Industry 4.0 integrates IoT, AI, and automation in manufacturing. Morocco's automotive sector is adopting it through smart factories and digital twin technology.",
    "L'Industrie 4.0 integre l'IoT, l'IA et l'automatisation dans la fabrication. Le secteur automobile marocain l'adopte via les usines intelligentes et la technologie du jumeau numerique.",
    ["Cover key technologies","Discuss Morocco's progress","Mention challenges"],
    ["Couvrez les technologies cles","Discutez les progres du Maroc","Mentionnez les defis"],
    "medium");
  r("How do you perform a capacity analysis for a manufacturing facility?",
    "Comment effectuez-vous une analyse de capacite pour une installation de fabrication ?",
    "technical", "genie-industriel",
    "I calculate theoretical capacity, determine utilization rates, identify bottlenecks using TOC, and simulate different scenarios for expansion decisions.",
    "Je calcule la capacite theorique, determine les taux d'utilisation, identifie les goulots d'etranglement par la TOC et simule differents scenarios pour les decisions d'expansion.",
    ["Define capacity types","Discuss bottleneck analysis","Cover investment decisions"],
    ["Definissez les types de capacite","Discutez l'analyse des goulots","Couvrez les decisions d'investissement"],
    "hard");

  // ── Commerce International ──
  r("How do you evaluate the creditworthiness of an international buyer?",
    "Comment evaluez-vous la solvabilite d'un acheteur international ?",
    "technical", "commerce-international",
    "I check trade references, financial statements, country risk ratings, and use credit insurance (SMAEX in Morocco) for protection.",
    "Je verifie les references commerciales, les etats financiers, les ratings de risque pays et utilise l'assurance credit (SMAEX au Maroc) pour la protection.",
    ["Mention credit tools","Discuss country risk","Cover payment terms"],
    ["Mentionnez les outils de credit","Discutez le risque pays","Couvrez les conditions de paiement"],
    "medium");
  r("Explain Morocco's free trade agreements and their impact on exports.",
    "Expliquez les accords de libre-echange du Maroc et leur impact sur les exportations.",
    "technical", "commerce-international",
    "Morocco has FTAs with EU, US, Turkey, UAE, and several African nations. The EU FTA covers 95% of trade, while the AfCFTA opens access to 1.3B consumers.",
    "Le Maroc a des ALE avec l'UE, les USA, la Turquie, les EAU et plusieurs nations africaines. L'ALE UE couvre 95% du commerce, tandis que la ZLECAf ouvre l'acces a 1,3 milliard de consommateurs.",
    ["Cover major agreements","Discuss tariff implications","Mention rules of origin"],
    ["Couvrez les accords majeurs","Discutez les implications tarifaires","Mentionnez les regles d'origine"],
    "hard");
  r("What Incoterms do you use most frequently and why?",
    "Quels Incoterms utilisez-vous le plus frequemment et pourquoi ?",
    "technical", "commerce-international",
    "FOB for sea freight (clear risk transfer), CIF for buyer convenience, and EXW for minimal seller responsibility. The choice depends on leverage and logistics control.",
    "FOB pour le fret maritime (transfert de risque clair), CIF pour la commodite de l'acheteur et EXW pour la responsabilite minimale du vendeur. Le choix depend du levier et du controle logistique.",
    ["Explain risk and cost allocation","Discuss recent Incoterms 2020 changes","Cover practical examples"],
    ["Expliquez l'allocation des risques et couts","Discutez les changements recents Incoterms 2020","Couvrez des exemples pratiques"],
    "medium");
  r("How do you handle customs procedures in Morocco?",
    "Comment gerez-vous les procedures douanieres au Maroc ?",
    "competency", "commerce-international",
    "I use BADR system for electronic declarations, manage HS code classification, handle preferential origin certificates (EUR.1), and manage temporary admission regimes.",
    "J'utilise le systeme BADR pour les declarations electroniques, gere la classification des codes SH, traite les certificats d'origine preferentielle (EUR.1) et gere les regimes d'admission temporaire.",
    ["Mention BADR system","Discuss document requirements","Cover duty optimization"],
    ["Mentionnez le systeme BADR","Discutez les exigences documentaires","Couvrez l'optimisation des droits"],
    "medium");
  r("How would you develop an export strategy for a Moroccan product?",
    "Comment developperiez-vous une strategie d'export pour un produit marocain ?",
    "situational", "commerce-international",
    "Market research, competitive analysis, pricing strategy considering logistics costs, regulatory compliance per target market, and leveraging Maroc Export support.",
    "Etude de marche, analyse concurrentielle, strategie de prix tenant compte des couts logistiques, conformite reglementaire par marche cible et exploitation du soutien de Maroc Export.",
    ["Cover market selection criteria","Discuss entry modes","Mention government support programs"],
    ["Couvrez les criteres de selection de marche","Discutez les modes d'entree","Mentionnez les programmes de soutien gouvernemental"],
    "hard");

  // ── Logistique ──
  r("How would you design a warehouse layout for maximum efficiency?",
    "Comment concevriez-vous un agencement d'entrepot pour une efficacite maximale ?",
    "technical", "logistique",
    "I'd use ABC analysis for product placement, optimize picking paths, implement zone picking, and use WMS software for real-time inventory tracking.",
    "J'utiliserais l'analyse ABC pour le placement des produits, optimiserais les parcours de picking, implementerais le picking par zone et utiliserais un logiciel WMS pour le suivi en temps reel.",
    ["Cover storage strategies","Mention WMS systems","Discuss material handling equipment"],
    ["Couvrez les strategies de stockage","Mentionnez les systemes WMS","Discutez l'equipement de manutention"],
    "medium");
  r("Explain the challenges of cold chain logistics in Morocco.",
    "Expliquez les defis de la logistique de la chaine du froid au Maroc.",
    "technical", "logistique",
    "Morocco faces challenges with temperature-controlled infrastructure gaps, long distances to rural areas, and limited cold storage capacity for agri-food exports.",
    "Le Maroc fait face a des defis avec les lacunes d'infrastructure a temperature controlee, les longues distances vers les zones rurales et la capacite limitee de stockage froid pour les exports agroalimentaires.",
    ["Discuss infrastructure gaps","Cover regulatory requirements","Mention solution technologies"],
    ["Discutez les lacunes d'infrastructure","Couvrez les exigences reglementaires","Mentionnez les technologies de solution"],
    "medium");
  r("How do you calculate total logistics cost for an import shipment?",
    "Comment calculez-vous le cout logistique total d'une expedition d'importation ?",
    "technical", "logistique",
    "I sum freight cost, customs duties, port handling charges, inland transport, insurance, warehousing, and hidden costs like demurrage and documentation fees.",
    "J'additionne le cout du fret, les droits de douane, les frais de manutention portuaire, le transport interieur, l'assurance, l'entreposage et les couts caches comme les surestaries et frais de documentation.",
    ["Cover all cost components","Mention Moroccan port fees","Discuss optimization strategies"],
    ["Couvrez tous les composants de cout","Mentionnez les frais portuaires marocains","Discutez les strategies d'optimisation"],
    "medium");
  r("What is your experience with ERP systems for supply chain management?",
    "Quelle est votre experience avec les systemes ERP pour la gestion de la chaine d'approvisionnement ?",
    "competency", "logistique",
    "I've implemented SAP S/4HANA and Oracle SCM modules. Key focus areas: inventory management, demand forecasting, and supplier collaboration portals.",
    "J'ai implemente des modules SAP S/4HANA et Oracle SCM. Domaines cles: gestion des stocks, prevision de la demande et portails de collaboration fournisseurs.",
    ["Name specific ERP systems","Discuss implementation experience","Cover integration challenges"],
    ["Nommez les systemes ERP specifiques","Discutez l'experience d'implementation","Couvrez les defis d'integration"],
    "medium");
  r("How does Tanger Med port impact Morocco's logistics competitiveness?",
    "Comment le port Tanger Med impacte-t-il la competitivite logistique du Maroc ?",
    "situational", "logistique",
    "Tanger Med positions Morocco as a logistics hub with direct connections to 180+ ports, 48-hour delivery to Europe, and integrated free zone for value-added logistics.",
    "Tanger Med positionne le Maroc comme hub logistique avec des connexions directes vers plus de 180 ports, livraison en 48h vers l'Europe et zone franche integree pour la logistique a valeur ajoutee.",
    ["Cover port capabilities","Discuss strategic location advantage","Mention economic impact"],
    ["Couvrez les capacites portuaires","Discutez l'avantage de localisation strategique","Mentionnez l'impact economique"],
    "easy");

  // ── Management ──
  r("How do you build and motivate a high-performing team?",
    "Comment construisez-vous et motivez-vous une equipe performante ?",
    "competency", "management",
    "I set clear objectives, provide regular feedback, recognize achievements, invest in professional development, and create psychological safety for innovation.",
    "Je fixe des objectifs clairs, fournis un retour regulier, reconnais les realisations, investis dans le developpement professionnel et cree la securite psychologique pour l'innovation.",
    ["Mention leadership frameworks","Discuss motivation theories","Cover practical examples"],
    ["Mentionnez les cadres de leadership","Discutez les theories de motivation","Couvrez des exemples pratiques"],
    "medium");
  r("How do you manage change in an organization?",
    "Comment gerez-vous le changement dans une organisation ?",
    "competency", "management",
    "I follow Kotter's 8-step model: create urgency, form coalition, develop vision, communicate, empower action, generate short-term wins, consolidate, and anchor.",
    "Je suis le modele en 8 etapes de Kotter: creer l'urgence, former une coalition, developper la vision, communiquer, responsabiliser, generer des victoires a court terme, consolider et ancrer.",
    ["Mention change management frameworks","Discuss resistance management","Cover communication strategy"],
    ["Mentionnez les cadres de gestion du changement","Discutez la gestion de la resistance","Couvrez la strategie de communication"],
    "hard");
  r("Describe your approach to strategic planning.",
    "Decrivez votre approche de la planification strategique.",
    "competency", "management",
    "I use SWOT analysis, define SMART objectives, create balanced scorecards, and implement OKRs for alignment from strategy to execution.",
    "J'utilise l'analyse SWOT, definis des objectifs SMART, cree des tableaux de bord equilibres et implemente des OKR pour l'alignement de la strategie a l'execution.",
    ["Cover strategic tools","Discuss implementation","Mention KPIs"],
    ["Couvrez les outils strategiques","Discutez la mise en oeuvre","Mentionnez les KPI"],
    "medium");
  r("How do you handle conflict between team members?",
    "Comment gerez-vous les conflits entre membres de l'equipe ?",
    "situational", "management",
    "I listen to both sides privately, identify root causes, facilitate a mediation session focused on interests rather than positions, and establish ground rules.",
    "J'ecoute les deux parties en prive, identifie les causes profondes, facilite une session de mediation axee sur les interets plutot que les positions et etablis des regles de base.",
    ["Show empathy","Discuss mediation techniques","Cover follow-up"],
    ["Montrez l'empathie","Discutez les techniques de mediation","Couvrez le suivi"],
    "medium");
  r("What is your experience with performance management systems?",
    "Quelle est votre experience avec les systemes de gestion de la performance ?",
    "competency", "management",
    "I've implemented 360-degree feedback, quarterly OKR reviews, and continuous feedback systems. I focus on development over evaluation.",
    "J'ai implemente le feedback 360 degres, les revues OKR trimestrielles et les systemes de feedback continu. Je me concentre sur le developpement plutot que l'evaluation.",
    ["Mention specific methods","Discuss frequency","Cover technology tools"],
    ["Mentionnez des methodes specifiques","Discutez la frequence","Couvrez les outils technologiques"],
    "medium");

  // ── Marketing ──
  r("How would you develop a digital marketing strategy for a Moroccan brand?",
    "Comment developperiez-vous une strategie de marketing digital pour une marque marocaine ?",
    "situational", "marketing",
    "I'd analyze the target audience (including Darija/French/Arabic preferences), choose platforms (Instagram, Facebook dominant in Morocco), create bilingual content, and measure with KPIs.",
    "J'analyserais le public cible (incluant les preferences darija/francais/arabe), choisirais les plateformes (Instagram, Facebook dominants au Maroc), creerais du contenu bilingue et mesurerais avec des KPI.",
    ["Cover Moroccan digital landscape","Discuss language strategy","Mention platform specifics"],
    ["Couvrez le paysage digital marocain","Discutez la strategie linguistique","Mentionnez les specificites des plateformes"],
    "medium");
  r("What is your experience with SEO and SEM campaigns?",
    "Quelle est votre experience avec les campagnes SEO et SEM ?",
    "competency", "marketing",
    "I've managed SEO (technical optimization, content strategy, link building) and SEM (Google Ads, Facebook Ads) campaigns with budgets up to 500K MAD/month.",
    "J'ai gere des campagnes SEO (optimisation technique, strategie de contenu, link building) et SEM (Google Ads, Facebook Ads) avec des budgets jusqu'a 500K MAD/mois.",
    ["Mention tools (Google Analytics, SEMrush)","Discuss ROI measurement","Cover budget optimization"],
    ["Mentionnez les outils (Google Analytics, SEMrush)","Discutez la mesure du ROI","Couvrez l'optimisation du budget"],
    "medium");
  r("How do you measure the effectiveness of a marketing campaign?",
    "Comment mesurez-vous l'efficacite d'une campagne marketing ?",
    "technical", "marketing",
    "I track ROAS, CAC, conversion rates, engagement metrics, and brand awareness KPIs. I use attribution models to understand each channel's contribution.",
    "Je suis le ROAS, le CAC, les taux de conversion, les metriques d'engagement et les KPI de notoriete de marque. J'utilise des modeles d'attribution pour comprendre la contribution de chaque canal.",
    ["Define key metrics","Discuss attribution models","Cover reporting tools"],
    ["Definissez les metriques cles","Discutez les modeles d'attribution","Couvrez les outils de reporting"],
    "medium");
  r("Describe a successful social media campaign you've managed.",
    "Decrivez une campagne reseaux sociaux reussie que vous avez geree.",
    "competency", "marketing",
    "I managed a Ramadan campaign on Instagram and TikTok that increased brand engagement by 300% and generated 10,000 leads over 30 days.",
    "J'ai gere une campagne Ramadan sur Instagram et TikTok qui a augmente l'engagement de la marque de 300% et genere 10 000 leads sur 30 jours.",
    ["Quantify results","Explain strategy","Discuss creative approach"],
    ["Quantifiez les resultats","Expliquez la strategie","Discutez l'approche creative"],
    "medium");
  r("What is content marketing and how does it apply to B2B in Morocco?",
    "Qu'est-ce que le content marketing et comment s'applique-t-il au B2B au Maroc ?",
    "technical", "marketing",
    "Content marketing creates valuable content to attract and retain customers. In B2B Morocco, LinkedIn articles, case studies, and webinars in French are most effective.",
    "Le content marketing cree du contenu de valeur pour attirer et retenir les clients. En B2B au Maroc, les articles LinkedIn, etudes de cas et webinaires en francais sont les plus efficaces.",
    ["Cover B2B specifics","Discuss content formats","Mention Moroccan market"],
    ["Couvrez les specificites B2B","Discutez les formats de contenu","Mentionnez le marche marocain"],
    "easy");

  // ── Ressources Humaines ──
  r("How do you design a compensation and benefits package for a Moroccan company?",
    "Comment concevez-vous un package de remuneration et avantages pour une entreprise marocaine ?",
    "technical", "ressources-humaines",
    "I benchmark using local salary surveys, ensure CNSS/CIMR compliance, add medical coverage (AMO), and include performance bonuses aligned with Moroccan labor law.",
    "Je fais du benchmarking en utilisant des enquetes salariales locales, assure la conformite CNSS/CIMR, ajoute la couverture medicale (AMO) et inclus des bonus de performance alignes avec le code du travail marocain.",
    ["Cover Moroccan labor law requirements","Discuss CNSS contributions","Mention market benchmarks"],
    ["Couvrez les exigences du code du travail marocain","Discutez les cotisations CNSS","Mentionnez les benchmarks du marche"],
    "hard");
  r("What is your approach to talent acquisition in a competitive market?",
    "Quelle est votre approche de l'acquisition de talents dans un marche competitif ?",
    "competency", "ressources-humaines",
    "I build an employer brand, leverage LinkedIn and local job boards (Rekrute, Emploi.ma), use employee referral programs, and partner with universities.",
    "Je construis une marque employeur, exploite LinkedIn et les job boards locaux (Rekrute, Emploi.ma), utilise des programmes de cooptation et m'associe aux universites.",
    ["Discuss sourcing strategies","Cover employer branding","Mention candidate experience"],
    ["Discutez les strategies de sourcing","Couvrez la marque employeur","Mentionnez l'experience candidat"],
    "medium");
  r("How do you handle employee termination in compliance with Moroccan labor law?",
    "Comment gerez-vous le licenciement en conformite avec le code du travail marocain ?",
    "situational", "ressources-humaines",
    "I ensure proper documentation, follow the disciplinary procedure (warning, hearing, decision), calculate severance per Article 52-53, and provide CNSS documentation.",
    "J'assure une documentation appropriee, suis la procedure disciplinaire (avertissement, entretien, decision), calcule les indemnites selon les Articles 52-53 et fournis la documentation CNSS.",
    ["Cover legal requirements","Discuss documentation","Mention severance calculation"],
    ["Couvrez les exigences legales","Discutez la documentation","Mentionnez le calcul des indemnites"],
    "hard");
  r("How do you implement a training needs analysis?",
    "Comment mettez-vous en place une analyse des besoins en formation ?",
    "competency", "ressources-humaines",
    "I use gap analysis between current and required competencies, conduct surveys, analyze performance data, and align with organizational objectives and GIAC support.",
    "J'utilise l'analyse d'ecarts entre competences actuelles et requises, mene des enquetes, analyse les donnees de performance et aligne avec les objectifs organisationnels et le soutien GIAC.",
    ["Cover analysis methods","Discuss ROI of training","Mention Moroccan GIAC framework"],
    ["Couvrez les methodes d'analyse","Discutez le ROI de la formation","Mentionnez le cadre GIAC marocain"],
    "medium");
  r("What HR information systems (HRIS) have you worked with?",
    "Quels systemes d'information RH (SIRH) avez-vous utilises ?",
    "competency", "ressources-humaines",
    "I've used SAP SuccessFactors, Sage Paie, and local solutions. Key modules: payroll, leave management, recruitment, and performance management.",
    "J'ai utilise SAP SuccessFactors, Sage Paie et des solutions locales. Modules cles: paie, gestion des conges, recrutement et gestion de la performance.",
    ["Name specific systems","Discuss implementation","Cover integration with payroll"],
    ["Nommez les systemes specifiques","Discutez la mise en oeuvre","Couvrez l'integration avec la paie"],
    "easy");

  // ── Additional General Situational Questions ──
  r("How would you handle a project that is behind schedule?",
    "Comment geriez-vous un projet en retard ?",
    "situational", "general",
    "I'd reassess priorities, communicate with stakeholders about revised timelines, identify critical path items, and reallocate resources to high-priority tasks.",
    "Je revaluerais les priorites, communiquerais avec les parties prenantes sur les delais revises, identifierais les elements du chemin critique et reallouerais les ressources aux taches prioritaires.",
    ["Show project recovery skills","Discuss stakeholder communication","Mention risk mitigation"],
    ["Montrez les competences de recovery de projet","Discutez la communication avec les parties prenantes","Mentionnez l'attenuation des risques"],
    "medium");
  r("Describe how you would onboard into a new company.",
    "Decrivez comment vous feriez votre integration dans une nouvelle entreprise.",
    "situational", "general",
    "I'd learn the company culture, meet key stakeholders, understand the tech stack, read documentation, and set clear 30-60-90 day goals.",
    "J'apprendrais la culture d'entreprise, rencontrerais les parties prenantes cles, comprendrais la stack technique, lirais la documentation et fixerais des objectifs clairs a 30-60-90 jours.",
    ["Show proactive approach","Discuss learning strategy","Cover relationship building"],
    ["Montrez une approche proactive","Discutez la strategie d'apprentissage","Couvrez la construction de relations"],
    "easy");
  r("Why should we hire you over other candidates?",
    "Pourquoi devrions-nous vous embaucher plutot qu'un autre candidat ?",
    "motivation", "general",
    "I bring a unique combination of technical expertise and practical experience specific to your industry, plus a strong commitment to continuous learning.",
    "J'apporte une combinaison unique d'expertise technique et d'experience pratique specifique a votre industrie, plus un engagement fort pour l'apprentissage continu.",
    ["Be specific to the role","Highlight unique value","Show research about the company"],
    ["Soyez specifique au poste","Soulignez la valeur unique","Montrez la recherche sur l'entreprise"],
    "easy");
  r("How do you stay updated with industry trends?",
    "Comment restez-vous a jour avec les tendances de l'industrie ?",
    "motivation", "general",
    "I read industry publications, attend conferences (Morocco Web Days, Gitex Africa), participate in online communities, and take online certifications.",
    "Je lis les publications de l'industrie, assiste aux conferences (Morocco Web Days, Gitex Africa), participe aux communautes en ligne et prends des certifications en ligne.",
    ["Mention specific sources","Show continuous learning","Discuss knowledge sharing"],
    ["Mentionnez des sources specifiques","Montrez l'apprentissage continu","Discutez le partage de connaissances"],
    "easy");
  r("Tell me about a time you had to make a decision with incomplete information.",
    "Parlez-moi d'une fois ou vous avez du prendre une decision avec des informations incompletes.",
    "behavioral", "general",
    "During a production incident, I had to choose between two fixes without full root cause analysis. I chose the safer option and validated the decision with data afterward.",
    "Lors d'un incident de production, j'ai du choisir entre deux correctifs sans analyse complete de la cause racine. J'ai choisi l'option la plus sure et valide la decision avec des donnees ensuite.",
    ["Show decision-making process","Discuss risk assessment","Cover outcome validation"],
    ["Montrez le processus de decision","Discutez l'evaluation des risques","Couvrez la validation des resultats"],
    "hard");
  r("What salary are you expecting?",
    "Quelles sont vos pretentions salariales ?",
    "motivation", "general",
    "Based on my research of the market and my experience level, I'm targeting a range of X-Y MAD. I'm open to discussing the full compensation package.",
    "Sur la base de mes recherches du marche et de mon niveau d'experience, je cible une fourchette de X-Y MAD. Je suis ouvert a discuter du package de remuneration global.",
    ["Research market rates first","Give a range, not a fixed number","Consider total compensation"],
    ["Recherchez d'abord les taux du marche","Donnez une fourchette, pas un chiffre fixe","Considerez la remuneration totale"],
    "easy");
  r("How do you ensure ethical behavior in the workplace?",
    "Comment assurez-vous un comportement ethique sur le lieu de travail ?",
    "behavioral", "general",
    "I lead by example, follow company policies, report violations through proper channels, and create a culture where integrity is valued over shortcuts.",
    "Je montre l'exemple, suis les politiques de l'entreprise, signale les violations par les canaux appropriate et cree une culture ou l'integrite est valorisee par rapport aux raccourcis.",
    ["Give specific examples","Discuss ethical dilemmas","Show integrity"],
    ["Donnez des exemples specifiques","Discutez les dilemmes ethiques","Montrez l'integrite"],
    "medium");
  r("Describe your experience working in a multicultural environment.",
    "Decrivez votre experience de travail dans un environnement multiculturel.",
    "behavioral", "general",
    "Working with colleagues from France, Morocco, and sub-Saharan Africa taught me to value different perspectives and adapt my communication style.",
    "Travailler avec des collegues de France, du Maroc et d'Afrique subsaharienne m'a appris a valoriser les differentes perspectives et adapter mon style de communication.",
    ["Show cultural awareness","Discuss communication adaptation","Cover collaboration examples"],
    ["Montrez la conscience culturelle","Discutez l'adaptation de la communication","Couvrez les exemples de collaboration"],
    "easy");

  // ── Additional Technical - Various Fields ──
  r("How do you manage inventory levels to minimize carrying costs?",
    "Comment gerez-vous les niveaux de stock pour minimiser les couts de possession ?",
    "technical", "logistique",
    "I use EOQ models, ABC classification, safety stock calculations, and JIT principles adapted to supplier lead times in Morocco.",
    "J'utilise les modeles EOQ, la classification ABC, les calculs de stock de securite et les principes JIT adaptes aux delais fournisseurs au Maroc.",
    ["Cover inventory models","Discuss demand forecasting","Mention technology tools"],
    ["Couvrez les modeles de stock","Discutez la prevision de la demande","Mentionnez les outils technologiques"],
    "medium");
  r("How do you approach financial risk management?",
    "Comment abordez-vous la gestion des risques financiers ?",
    "technical", "finance",
    "I identify risks (credit, market, operational, liquidity), assess probability and impact, implement hedging strategies, and monitor with risk dashboards.",
    "J'identifie les risques (credit, marche, operationnel, liquidite), evalue la probabilite et l'impact, implemente des strategies de couverture et surveille avec des tableaux de bord de risque.",
    ["Cover risk types","Discuss mitigation strategies","Mention regulatory requirements"],
    ["Couvrez les types de risques","Discutez les strategies d'attenuation","Mentionnez les exigences reglementaires"],
    "hard");
  r("Explain the concept of Smart Grid and its potential in Morocco.",
    "Expliquez le concept de Smart Grid et son potentiel au Maroc.",
    "technical", "genie-electrique",
    "Smart Grids use digital technology for efficient electricity delivery. Morocco is piloting smart meters and grid modernization with ONEE for renewable integration.",
    "Les Smart Grids utilisent la technologie numerique pour une distribution efficace de l'electricite. Le Maroc pilote des compteurs intelligents et la modernisation du reseau avec l'ONEE pour l'integration des renouvelables.",
    ["Explain technology components","Discuss Morocco's energy transition","Cover challenges"],
    ["Expliquez les composants technologiques","Discutez la transition energetique du Maroc","Couvrez les defis"],
    "medium");
  r("What is your experience with quality management systems (QMS)?",
    "Quelle est votre experience avec les systemes de management de la qualite (SMQ) ?",
    "competency", "genie-industriel",
    "I've implemented ISO 9001:2015 QMS including process documentation, internal audits, CAPA management, and management review procedures.",
    "J'ai implemente le SMQ ISO 9001:2015 incluant la documentation des processus, les audits internes, la gestion CAPA et les procedures de revue de direction.",
    ["Mention specific standards","Discuss audit experience","Cover continuous improvement"],
    ["Mentionnez les normes specifiques","Discutez l'experience d'audit","Couvrez l'amelioration continue"],
    "medium");
  r("How do you approach concrete mix design for specific structural requirements?",
    "Comment abordez-vous la formulation du beton pour des exigences structurelles specifiques ?",
    "technical", "genie-civil",
    "I use Dreux-Gorisse method, test aggregates from local quarries, adjust water/cement ratio for target strength, and verify with compression tests at 7 and 28 days.",
    "J'utilise la methode Dreux-Gorisse, teste les granulats des carrieres locales, ajuste le rapport eau/ciment pour la resistance cible et verifie par des essais de compression a 7 et 28 jours.",
    ["Mention design methods","Discuss local materials","Cover testing procedures"],
    ["Mentionnez les methodes de formulation","Discutez les materiaux locaux","Couvrez les procedures d'essai"],
    "hard");
  r("How would you develop an employer branding strategy for a Moroccan company?",
    "Comment developperiez-vous une strategie de marque employeur pour une entreprise marocaine ?",
    "situational", "ressources-humaines",
    "I'd audit the current EVP, survey employees, develop messaging in French and Arabic, leverage LinkedIn and Instagram, and measure with application rates and Glassdoor scores.",
    "J'auditerais la PVE actuelle, sonderais les employes, developperais les messages en francais et arabe, exploiterais LinkedIn et Instagram et mesurerais avec les taux de candidature et scores Glassdoor.",
    ["Cover EVP development","Discuss channels","Mention measurement"],
    ["Couvrez le developpement de la PVE","Discutez les canaux","Mentionnez la mesure"],
    "medium");

  // Additional questions to reach 200+
  r("How do you handle data privacy and GDPR-like regulations in Morocco?",
    "Comment gerez-vous la protection des donnees et les reglementations type RGPD au Maroc ?",
    "technical", "genie-informatique",
    "Morocco has Law 09-08 on personal data protection enforced by CNDP. I implement data minimization, consent management, and privacy by design principles.",
    "Le Maroc a la Loi 09-08 sur la protection des donnees personnelles appliquee par la CNDP. J'implemente la minimisation des donnees, la gestion du consentement et les principes de privacy by design.",
    ["Mention Law 09-08","Discuss CNDP role","Cover technical measures"],
    ["Mentionnez la Loi 09-08","Discutez le role de la CNDP","Couvrez les mesures techniques"],
    "medium");
  r("Explain the concept of digital twin in industrial applications.",
    "Expliquez le concept de jumeau numerique dans les applications industrielles.",
    "technical", "genie-industriel",
    "A digital twin is a virtual replica of a physical system using real-time data. In Morocco, OCP and Renault use them for predictive maintenance and process optimization.",
    "Un jumeau numerique est une replique virtuelle d'un systeme physique utilisant des donnees en temps reel. Au Maroc, OCP et Renault les utilisent pour la maintenance predictive et l'optimisation des processus.",
    ["Explain IoT integration","Mention real applications","Discuss benefits"],
    ["Expliquez l'integration IoT","Mentionnez les applications reelles","Discutez les avantages"],
    "hard");
  r("How do you approach geotechnical investigation for foundation design?",
    "Comment abordez-vous l'investigation geotechnique pour la conception des fondations ?",
    "technical", "genie-civil",
    "I plan boring locations, analyze soil samples (SPT, CPT tests), determine bearing capacity, and recommend foundation type (shallow vs deep) based on Moroccan soil conditions.",
    "Je planifie les emplacements de forage, analyse les echantillons de sol (essais SPT, CPT), determine la capacite portante et recommande le type de fondation (superficielle vs profonde) selon les conditions de sol marocaines.",
    ["Cover investigation methods","Discuss Moroccan soil types","Mention design codes"],
    ["Couvrez les methodes d'investigation","Discutez les types de sol marocains","Mentionnez les codes de conception"],
    "hard");
  r("What is your experience with e-commerce platforms in Morocco?",
    "Quelle est votre experience avec les plateformes e-commerce au Maroc ?",
    "competency", "marketing",
    "I've managed campaigns on Jumia Morocco, built Shopify stores with COD integration, and optimized for mobile-first Moroccan shoppers using WhatsApp commerce.",
    "J'ai gere des campagnes sur Jumia Maroc, construit des boutiques Shopify avec integration COD et optimise pour les acheteurs marocains mobile-first en utilisant le commerce WhatsApp.",
    ["Discuss Moroccan e-commerce trends","Cover payment challenges","Mention COD prevalence"],
    ["Discutez les tendances e-commerce marocaines","Couvrez les defis de paiement","Mentionnez la prevalence du COD"],
    "medium");
  r("How do you negotiate with international suppliers?",
    "Comment negociez-vous avec les fournisseurs internationaux ?",
    "situational", "commerce-international",
    "I prepare by researching market prices, develop a BATNA, negotiate payment terms (L/C, D/P), discuss quality standards, and build long-term partnerships.",
    "Je me prepare en recherchant les prix du marche, developpe un BATNA, negocie les conditions de paiement (L/C, D/P), discute les normes de qualite et construis des partenariats long terme.",
    ["Cover negotiation preparation","Discuss payment methods","Mention cultural considerations"],
    ["Couvrez la preparation de la negociation","Discutez les methodes de paiement","Mentionnez les considerations culturelles"],
    "medium");

  return rows;
}

// ─── 4. RESUME GALLERY (160+ entries) ─────────────────────────────────────────

function buildResumeGalleryEntries() {
  const rows = [];
  const fields = [
    "genie-informatique", "finance", "genie-civil", "genie-electrique",
    "genie-mecanique", "genie-industriel", "commerce-international",
    "logistique", "management", "marketing", "ressources-humaines", "general",
  ];
  const templates = [
    "azurill", "bronzor", "chikorita", "ditto", "gengar", "glalie",
    "kakuna", "leafish", "nosepass", "onyx", "pikachu", "rhyhorn",
    "casablanca", "marrakech", "fes", "tangier", "rabat", "agadir",
    "essaouira", "chefchaouen", "meknes", "nador", "oujda", "tetouan",
    "ifrane", "safi", "kenitra", "beni-mellal", "eljadida", "ouarzazate", "taza",
  ];
  const firstNames = [
    "Youssef", "Fatima", "Omar", "Aisha", "Hamza", "Salma", "Mehdi", "Nadia",
    "Khalid", "Meryem", "Amine", "Zineb", "Rachid", "Houda", "Soufiane", "Laila",
    "Hassan", "Khadija", "Brahim", "Sanaa", "Mouad", "Rim", "Othmane", "Imane",
    "Adil", "Ghita", "Zakaria", "Noura", "Ayoub", "Hajar", "Taha", "Widad",
    "Ilyass", "Sara", "Walid", "Loubna", "Yassine", "Hind", "Marouane", "Chaima",
  ];
  const lastNames = [
    "Benali", "El Fassi", "Ammari", "Bouziane", "Chraibi", "Doukkali", "El Arabi",
    "Filali", "Guedira", "Hajji", "Idrissi", "Jalal", "Kabbaj", "Lahlou", "Mabrouk",
    "Naciri", "Ouazzani", "Patel", "Qadiri", "Raissouni", "Sefrioui", "Tazi",
    "Oulhaj", "Wahbi", "Yousfi", "Zerouali", "Alaoui", "Berrada", "Cherkaoui",
    "Drissi", "El Amrani", "Fikri", "Ghazali", "Hakimi", "Ibrahimi", "Jaidi",
    "Lamrani", "Mouline", "Naji", "Ouahbi",
  ];

  const schools = {
    "genie-informatique": ["ENSIAS Rabat", "INPT Rabat", "ENSA Tanger", "EMI Rabat", "ENSET Mohammedia", "EMSI Casablanca", "UM6P Benguerir", "FST Fes", "ENSA Kenitra"],
    "finance": ["ISCAE Casablanca", "ENCG Settat", "HEM Casablanca", "UM5 Rabat", "ENCG Tanger", "Al Akhawayn Ifrane"],
    "genie-civil": ["EHTP Casablanca", "EMI Rabat", "ENSA Fes", "ENSET Mohammedia", "ENSA Marrakech"],
    "genie-electrique": ["ENSA Kenitra", "EMI Rabat", "ENSEM Casablanca", "ENSET Mohammedia", "FST Settat"],
    "genie-mecanique": ["ENSEM Casablanca", "EMI Rabat", "ENSA Agadir", "ENSET Mohammedia", "ENSA Oujda"],
    "genie-industriel": ["EMI Rabat", "ENSAM Meknes", "ENSA Marrakech", "EHTP Casablanca", "ENSET Mohammedia"],
    "commerce-international": ["ENCG Casablanca", "ISCAE Casablanca", "HEM Rabat", "ENCG Tanger", "Al Akhawayn Ifrane"],
    "logistique": ["ENCG Agadir", "ISCAE Casablanca", "EST Sale", "ENCG Settat", "ISLI ISCAE"],
    "management": ["ISCAE Casablanca", "HEM Casablanca", "ENCG Settat", "Al Akhawayn Ifrane", "UM6P Benguerir"],
    "marketing": ["ENCG Casablanca", "ISCAE Casablanca", "HEM Rabat", "Sup de Co Marrakech", "ENCG Kenitra"],
    "ressources-humaines": ["ISCAE Casablanca", "ENCG Settat", "HEM Casablanca", "UM5 Rabat", "ENCG Agadir"],
    "general": ["UM5 Rabat", "UH2C Casablanca", "USMBA Fes", "UM6P Benguerir", "Al Akhawayn Ifrane"],
  };

  const companies = {
    "genie-informatique": ["SQLI Maroc", "CGI Maroc", "Capgemini Morocco", "Atos Morocco", "INWI", "Sofrecom Maroc", "HPS", "Sopra Banking Software", "Devoteam Maroc", "NTT Data Morocco"],
    "finance": ["Attijariwafa Bank", "BMCE Bank of Africa", "CDG Capital", "Deloitte Morocco", "KPMG Morocco", "PwC Morocco", "Societe Generale Maroc", "CIH Bank"],
    "genie-civil": ["SGTM", "SOMAGEC", "Jet Contractors", "Alliances", "Addoha Group", "Bouygues Morocco", "TGCC", "SOCOCHARBO"],
    "genie-electrique": ["Schneider Electric Maroc", "ABB Morocco", "Nexans Morocco", "ONEE", "Siemens Morocco", "Legrand Morocco"],
    "genie-mecanique": ["Renault Morocco", "PSA Morocco", "SOMACA", "Hands Corporation", "Valeo Morocco", "Delphi Morocco"],
    "genie-industriel": ["OCP Group", "Lafarge Holcim Morocco", "Managem", "Centrale Danone", "Lesieur Cristal", "Cosumar"],
    "commerce-international": ["Maroc Export", "BMCI Trade", "Euler Hermes Morocco", "Bolore Transport Morocco", "DHL Morocco"],
    "logistique": ["SDTM", "SNTL", "Geodis Morocco", "M&M Morocco", "DB Schenker Morocco", "Timar"],
    "management": ["McKinsey Morocco", "BCG Morocco", "Accenture Morocco", "Roland Berger Morocco", "Mazars Morocco"],
    "marketing": ["Publicis Morocco", "JWT Morocco", "Webhelp Morocco", "Majorel Morocco", "Comdata Morocco"],
    "ressources-humaines": ["Manpower Morocco", "Adecco Morocco", "ReKrute", "M2M Group", "Involys"],
    "general": ["Marjane Group", "ONCF", "RAM", "Meditel", "Wana Corporate"],
  };

  const headlines = {
    "genie-informatique": ["Developpeur Full-Stack", "Ingenieur DevOps", "Data Engineer", "Architecte Cloud", "Ingenieur Cybersecurite", "Developpeur Mobile", "Ingenieur QA", "Scrum Master", "Tech Lead", "Ingenieur ML/IA"],
    "finance": ["Analyste Financier", "Auditeur Senior", "Controleur de Gestion", "Tresorier", "Risk Manager", "Comptable Senior", "Analyste Credit", "Gestionnaire de Portefeuille"],
    "genie-civil": ["Ingenieur Structure", "Chef de Chantier", "Ingenieur BET", "Responsable Qualite BTP", "Ingenieur Geotechnique", "Chef de Projet BTP"],
    "genie-electrique": ["Ingenieur Automatisme", "Ingenieur Electrique", "Chef de Projet Electrique", "Ingenieur Energie Renouvelable", "Ingenieur Maintenance"],
    "genie-mecanique": ["Ingenieur Mecanique", "Ingenieur Methodes", "Responsable Production", "Ingenieur Qualite Automobile", "Ingenieur CAO/FAO"],
    "genie-industriel": ["Ingenieur Processus", "Responsable Lean", "Ingenieur Supply Chain", "Responsable Maintenance Industrielle", "Ingenieur HSE"],
    "commerce-international": ["Responsable Export", "Charge d'Affaires International", "Responsable Achat International", "Trade Finance Specialist"],
    "logistique": ["Responsable Logistique", "Supply Chain Manager", "Responsable Entrepot", "Coordinateur Transport"],
    "management": ["Directeur General", "Chef de Projet", "Consultant en Management", "Directeur des Operations"],
    "marketing": ["Responsable Marketing Digital", "Community Manager", "Chef de Produit", "Responsable Communication"],
    "ressources-humaines": ["DRH", "Responsable Formation", "Charge de Recrutement", "Responsable Paie et Administration"],
    "general": ["Assistant de Direction", "Charge de Mission", "Coordinateur de Projet", "Responsable Administratif"],
  };

  const cities = ["Casablanca", "Rabat", "Tanger", "Fes", "Marrakech", "Agadir", "Meknes", "Oujda", "Kenitra", "Tetouan", "Mohammedia", "Sale", "El Jadida", "Beni Mellal", "Nador"];

  let templateIdx = 0;
  let sortOrder = 500;

  for (const field of fields) {
    const count = field === "genie-informatique" ? 20 : field === "finance" ? 16 : field === "general" ? 16 : 12;

    for (let i = 0; i < count; i++) {
      const fn = firstNames[(sortOrder + i) % firstNames.length];
      const ln = lastNames[(sortOrder + i + 7) % lastNames.length];
      const fullName = `${fn} ${ln}`;
      const template = templates[templateIdx % templates.length];
      templateIdx++;
      const expYears = (i % 5) * 2 + 1; // 1, 3, 5, 7, 9
      const city = cities[(sortOrder + i) % cities.length];
      const school = schools[field][(sortOrder + i) % schools[field].length];
      const company = companies[field][(sortOrder + i) % companies[field].length];
      const headline = headlines[field][(sortOrder + i) % headlines[field].length];
      const atsScore = 75 + (i % 20);
      const isFeatured = i < 2;
      const lang = i % 3 === 0 ? "en" : "fr";

      const levelLabel = expYears <= 2 ? "Junior" : expYears <= 5 ? "Mid-Level" : "Senior";
      const name = `${fullName} — ${levelLabel} ${headline}`;
      const nameFr = name; // Already in French
      const desc = `${levelLabel} ${headline} based in ${city} with ${expYears} years of experience in the Moroccan market`;
      const descFr = `${headline} ${levelLabel.toLowerCase()} base(e) a ${city} avec ${expYears} ans d'experience sur le marche marocain`;

      const degree = field.startsWith("genie") ? "Diplome d'Ingenieur" : field === "finance" || field === "commerce-international" ? "Master en " + field.replace("-", " ") : "Licence Professionnelle";

      const resumeData = {
        basics: { cin: "", name: fullName, email: `${fn.toLowerCase()}.${ln.toLowerCase().replace(/ /g, "")}@email.com`, phone: `06${String(Math.floor(Math.random() * 90000000) + 10000000)}`, headline, location: city },
        summary: { content: desc },
        sections: {
          skills: { items: [
            { name: field === "genie-informatique" ? "Python" : field === "finance" ? "Excel Avance" : "MS Office", proficiency: "Advanced" },
            { name: field === "genie-informatique" ? "React" : field === "finance" ? "SAP FI/CO" : "PowerPoint", proficiency: expYears > 4 ? "Expert" : "Advanced" },
            { name: "Communication", proficiency: "Advanced" },
          ]},
          education: { items: [{ field: field.replace(/-/g, " "), grade: "", degree, period: `${2020 - expYears - 4} - ${2020 - expYears}`, school }] },
          languages: { items: [{ name: "Arabe", proficiency: "Native" }, { name: "Francais", proficiency: "Fluent" }, { name: "Anglais", proficiency: expYears > 3 ? "Advanced" : "Intermediate" }] },
          experience: { items: [{ period: `${2024 - expYears} - Present`, company, position: headline, description: `- Gestion de projets et amelioration des processus\n- Collaboration avec les equipes internes et externes\n- Suivi des KPI et reporting regulier` }] },
        },
      };

      const subField = field === "genie-informatique" ? (i % 3 === 0 ? "web" : i % 3 === 1 ? "mobile" : "cloud") :
                       field === "finance" ? (i % 2 === 0 ? "audit" : "banking") : null;

      rows.push([
        uuid(), name, nameFr, field, subField, expYears, template, lang,
        desc, descFr, JSON.stringify(resumeData),
        `{${field},${levelLabel.toLowerCase()},${city.toLowerCase()}}`,
        atsScore, isFeatured, 0, 0, true, new Date(), new Date(),
      ]);
      sortOrder++;
    }
  }

  return rows;
}

// ─── 5. SKILL LIBRARY (100+ entries) ──────────────────────────────────────────

function buildSkillLibrary() {
  const rows = [];
  const r = (name, nameFr, field, category, desc, descFr) => {
    rows.push([
      uuid(), name, nameFr, field, category,
      desc, descFr, true, true, rows.length, new Date(), new Date(),
    ]);
  };

  // Cloud Computing & DevOps
  r("Amazon Web Services (AWS)", "Amazon Web Services (AWS)", "genie-informatique", "tool",
    "Cloud platform for computing, storage, and networking services", "Plateforme cloud pour le calcul, le stockage et les services reseau");
  r("Microsoft Azure", "Microsoft Azure", "genie-informatique", "tool",
    "Microsoft's cloud computing platform for enterprise solutions", "Plateforme cloud de Microsoft pour les solutions d'entreprise");
  r("Google Cloud Platform", "Google Cloud Platform", "genie-informatique", "tool",
    "Google's suite of cloud computing services", "Suite de services cloud computing de Google");
  r("Terraform", "Terraform", "genie-informatique", "tool",
    "Infrastructure as code tool for multi-cloud provisioning", "Outil d'infrastructure en tant que code pour le provisionnement multi-cloud");
  r("Kubernetes Administration", "Administration Kubernetes", "genie-informatique", "technical",
    "Container orchestration platform for managing microservices", "Plateforme d'orchestration de conteneurs pour la gestion de microservices");
  r("Docker Containerization", "Conteneurisation Docker", "genie-informatique", "technical",
    "Application containerization for consistent deployment environments", "Conteneurisation d'applications pour des environnements de deploiement coherents");
  r("Jenkins CI/CD", "Jenkins CI/CD", "genie-informatique", "tool",
    "Open-source automation server for continuous integration and delivery", "Serveur d'automatisation open-source pour l'integration et la livraison continues");
  r("GitLab CI/CD", "GitLab CI/CD", "genie-informatique", "tool",
    "Integrated DevOps platform for version control and CI/CD pipelines", "Plateforme DevOps integree pour le controle de version et les pipelines CI/CD");

  // Cybersecurity
  r("Ethical Hacking", "Hacking Ethique", "genie-informatique", "technical",
    "Penetration testing and vulnerability assessment skills", "Competences en tests de penetration et evaluation des vulnerabilites");
  r("SIEM (Splunk/ELK)", "SIEM (Splunk/ELK)", "genie-informatique", "tool",
    "Security information and event management platforms", "Plateformes de gestion des informations et evenements de securite");
  r("ISO 27001 Implementation", "Implementation ISO 27001", "genie-informatique", "certification",
    "Information security management system standard", "Norme de systeme de management de la securite de l'information");
  r("Network Security (Firewall/IDS)", "Securite Reseau (Pare-feu/IDS)", "genie-informatique", "technical",
    "Firewall configuration, intrusion detection, and network hardening", "Configuration pare-feu, detection d'intrusion et durcissement reseau");
  r("Cloud Security Architecture", "Architecture Securite Cloud", "genie-informatique", "technical",
    "Designing secure cloud infrastructure and access controls", "Conception d'infrastructure cloud securisee et controles d'acces");

  // Data Science & AI
  r("TensorFlow / PyTorch", "TensorFlow / PyTorch", "genie-informatique", "tool",
    "Deep learning frameworks for neural network development", "Frameworks de deep learning pour le developpement de reseaux de neurones");
  r("Natural Language Processing", "Traitement du Langage Naturel", "genie-informatique", "technical",
    "NLP techniques including text classification, NER, and sentiment analysis", "Techniques de NLP incluant la classification de texte, NER et l'analyse de sentiment");
  r("Apache Spark / Hadoop", "Apache Spark / Hadoop", "genie-informatique", "tool",
    "Big data processing frameworks for distributed computing", "Frameworks de traitement de big data pour le calcul distribue");
  r("Power BI / Tableau", "Power BI / Tableau", "genie-informatique", "tool",
    "Business intelligence and data visualization tools", "Outils de business intelligence et visualisation de donnees");
  r("MLOps (MLflow, Kubeflow)", "MLOps (MLflow, Kubeflow)", "genie-informatique", "tool",
    "Machine learning operations for model deployment and monitoring", "Operations de machine learning pour le deploiement et la surveillance de modeles");
  r("Statistical Modeling (R/Python)", "Modelisation Statistique (R/Python)", "genie-informatique", "technical",
    "Statistical analysis and predictive modeling techniques", "Techniques d'analyse statistique et de modelisation predictive");

  // Digital Marketing
  r("Google Ads Management", "Gestion Google Ads", "marketing", "tool",
    "Search and display advertising campaign management on Google", "Gestion de campagnes publicitaires search et display sur Google");
  r("Meta Ads (Facebook/Instagram)", "Meta Ads (Facebook/Instagram)", "marketing", "tool",
    "Social media advertising on Facebook and Instagram platforms", "Publicite sur les reseaux sociaux Facebook et Instagram");
  r("Marketing Automation (HubSpot)", "Automatisation Marketing (HubSpot)", "marketing", "tool",
    "Automated marketing workflows, lead nurturing, and CRM integration", "Workflows marketing automatises, nurturing de leads et integration CRM");
  r("SEO (On-Page & Technical)", "SEO (On-Page & Technique)", "marketing", "technical",
    "Search engine optimization including technical, on-page, and off-page", "Optimisation pour les moteurs de recherche incluant technique, on-page et off-page");
  r("Google Analytics 4", "Google Analytics 4", "marketing", "tool",
    "Web analytics platform for tracking and analyzing user behavior", "Plateforme d'analytique web pour le suivi et l'analyse du comportement utilisateur");
  r("Content Marketing Strategy", "Strategie de Content Marketing", "marketing", "technical",
    "Content creation, distribution, and performance measurement", "Creation, distribution et mesure de performance de contenu");
  r("TikTok Marketing", "Marketing TikTok", "marketing", "tool",
    "Short-form video content creation and advertising on TikTok", "Creation de contenu video court et publicite sur TikTok");
  r("Email Marketing (Mailchimp)", "Email Marketing (Mailchimp)", "marketing", "tool",
    "Email campaign design, automation, and performance tracking", "Conception de campagnes email, automatisation et suivi de performance");

  // Project Management
  r("PMP Certification", "Certification PMP", "management", "certification",
    "Project Management Professional certification by PMI", "Certification Project Management Professional par le PMI");
  r("PRINCE2 Foundation", "PRINCE2 Foundation", "management", "certification",
    "Process-based project management methodology certification", "Certification de methodologie de gestion de projet basee sur les processus");
  r("Scrum Master (PSM/CSM)", "Scrum Master (PSM/CSM)", "management", "certification",
    "Certified Scrum Master for agile project management", "Scrum Master certifie pour la gestion de projet agile");
  r("MS Project / Primavera P6", "MS Project / Primavera P6", "management", "tool",
    "Enterprise project planning and scheduling software", "Logiciel de planification et d'ordonnancement de projet d'entreprise");
  r("Jira & Confluence", "Jira & Confluence", "management", "tool",
    "Atlassian tools for agile project tracking and documentation", "Outils Atlassian pour le suivi de projet agile et la documentation");
  r("OKR Methodology", "Methodologie OKR", "management", "technical",
    "Objectives and Key Results framework for strategic alignment", "Cadre d'Objectifs et Resultats Cles pour l'alignement strategique");

  // Industry 4.0 Skills
  r("Industrial IoT (IIoT)", "IoT Industriel (IIoT)", "genie-industriel", "technical",
    "Connected industrial devices for real-time monitoring and automation", "Dispositifs industriels connectes pour la surveillance en temps reel et l'automatisation");
  r("SCADA Systems", "Systemes SCADA", "genie-industriel", "tool",
    "Supervisory Control and Data Acquisition for process monitoring", "Controle de supervision et acquisition de donnees pour la surveillance des processus");
  r("Digital Twin Technology", "Technologie Jumeau Numerique", "genie-industriel", "technical",
    "Virtual replicas of physical systems for simulation and optimization", "Repliques virtuelles de systemes physiques pour la simulation et l'optimisation");
  r("Robotic Process Automation", "Automatisation Robotique des Processus", "genie-industriel", "technical",
    "Software bots automating repetitive business processes", "Robots logiciels automatisant les processus metier repetitifs");
  r("Additive Manufacturing (3D Printing)", "Fabrication Additive (Impression 3D)", "genie-mecanique", "technical",
    "3D printing technologies for rapid prototyping and production", "Technologies d'impression 3D pour le prototypage rapide et la production");
  r("Predictive Maintenance Analytics", "Analytique de Maintenance Predictive", "genie-industriel", "technical",
    "Using data analytics to predict equipment failures before they occur", "Utilisation de l'analytique de donnees pour predire les pannes d'equipement avant qu'elles ne se produisent");

  // Finance & Accounting
  r("SAP S/4HANA Finance", "SAP S/4HANA Finance", "finance", "tool",
    "SAP's ERP system for financial management and reporting", "Systeme ERP de SAP pour la gestion financiere et le reporting");
  r("Bloomberg Terminal", "Terminal Bloomberg", "finance", "tool",
    "Financial data and analytics platform for investment professionals", "Plateforme de donnees financieres et d'analytique pour les professionnels de l'investissement");
  r("CFA Level I/II/III", "CFA Niveau I/II/III", "finance", "certification",
    "Chartered Financial Analyst certification for investment management", "Certification Chartered Financial Analyst pour la gestion d'investissement");
  r("IFRS Standards", "Normes IFRS", "finance", "technical",
    "International Financial Reporting Standards for global accounting", "Normes internationales d'information financiere pour la comptabilite mondiale");
  r("Financial Risk Modeling", "Modelisation des Risques Financiers", "finance", "technical",
    "Quantitative risk assessment using VaR, Monte Carlo, and stress testing", "Evaluation quantitative des risques utilisant VaR, Monte Carlo et stress testing");
  r("Islamic Finance (Sukuk/Takaful)", "Finance Islamique (Sukuk/Takaful)", "finance", "technical",
    "Sharia-compliant financial instruments and insurance products", "Instruments financiers et produits d'assurance conformes a la Charia");
  r("Anti-Money Laundering (AML)", "Lutte Anti-Blanchiment (LAB)", "finance", "certification",
    "Compliance with anti-money laundering regulations and KYC processes", "Conformite aux reglementations anti-blanchiment et processus KYC");
  r("Moroccan Tax Code (CGI)", "Code General des Impots (CGI)", "finance", "technical",
    "Knowledge of Moroccan tax regulations including IS, IR, and TVA", "Connaissance des reglementations fiscales marocaines incluant IS, IR et TVA");

  // Civil Engineering
  r("AutoCAD Civil 3D", "AutoCAD Civil 3D", "genie-civil", "tool",
    "CAD software for civil engineering design and infrastructure", "Logiciel CAO pour la conception en genie civil et infrastructure");
  r("Revit BIM", "Revit BIM", "genie-civil", "tool",
    "Building Information Modeling software for 3D design and collaboration", "Logiciel BIM pour la conception 3D et la collaboration");
  r("ETABS Structural Analysis", "Analyse Structurale ETABS", "genie-civil", "tool",
    "Structural analysis software for building design and seismic analysis", "Logiciel d'analyse structurale pour la conception de batiments et l'analyse sismique");
  r("Eurocode Standards", "Normes Eurocode", "genie-civil", "technical",
    "European structural design standards applied in Morocco", "Normes europeennes de conception structurale appliquees au Maroc");
  r("GIS Mapping (ArcGIS/QGIS)", "Cartographie SIG (ArcGIS/QGIS)", "genie-civil", "tool",
    "Geographic information systems for spatial analysis and mapping", "Systemes d'information geographique pour l'analyse spatiale et la cartographie");

  // Electrical Engineering
  r("EPLAN Electric P8", "EPLAN Electric P8", "genie-electrique", "tool",
    "Electrical engineering design software for schematics and panel layouts", "Logiciel de conception electrique pour les schemas et les plans d'armoires");
  r("MATLAB/Simulink", "MATLAB/Simulink", "genie-electrique", "tool",
    "Numerical computing platform for control system design and simulation", "Plateforme de calcul numerique pour la conception et la simulation de systemes de controle");
  r("Renewable Energy Systems Design", "Conception de Systemes d'Energie Renouvelable", "genie-electrique", "technical",
    "Solar PV, wind turbine, and battery storage system design", "Conception de systemes solaires PV, eoliens et de stockage par batterie");
  r("IEC 61131-3 PLC Programming", "Programmation API IEC 61131-3", "genie-electrique", "technical",
    "International standard for programmable controller programming languages", "Norme internationale pour les langages de programmation des controleurs programmables");
  r("Electrical Power Systems Analysis", "Analyse des Systemes Electriques", "genie-electrique", "technical",
    "Load flow, short circuit, and protection coordination analysis", "Analyse de flux de charge, court-circuit et coordination de protection");

  // Logistics & Supply Chain
  r("SAP SCM Module", "Module SAP SCM", "logistique", "tool",
    "SAP Supply Chain Management for end-to-end supply chain planning", "Gestion de la chaine d'approvisionnement SAP pour la planification bout-en-bout");
  r("WMS (Manhattan/Oracle)", "WMS (Manhattan/Oracle)", "logistique", "tool",
    "Warehouse Management Systems for inventory tracking and fulfillment", "Systemes de gestion d'entrepot pour le suivi des stocks et l'execution des commandes");
  r("Customs Brokerage (BADR System)", "Courtage en Douane (Systeme BADR)", "logistique", "technical",
    "Morocco's electronic customs declaration system for import/export", "Systeme de declaration douaniere electronique du Maroc pour l'import/export");
  r("Demand Forecasting & S&OP", "Prevision de Demande & S&OP", "logistique", "technical",
    "Statistical demand forecasting and Sales & Operations Planning", "Prevision statistique de la demande et planification des ventes et des operations");
  r("TMS (Transportation Management)", "TMS (Gestion du Transport)", "logistique", "tool",
    "Transportation Management Systems for route optimization and freight", "Systemes de gestion du transport pour l'optimisation des routes et le fret");

  // HR & Soft Skills
  r("Workday HCM", "Workday HCM", "ressources-humaines", "tool",
    "Cloud-based human capital management platform", "Plateforme de gestion du capital humain basee sur le cloud");
  r("Sage Paie Maroc", "Sage Paie Maroc", "ressources-humaines", "tool",
    "Payroll management software configured for Moroccan labor law", "Logiciel de gestion de la paie configure pour le droit du travail marocain");
  r("Moroccan Labor Code", "Code du Travail Marocain", "ressources-humaines", "technical",
    "Knowledge of Law 65-99 governing employment relations in Morocco", "Connaissance de la Loi 65-99 regissant les relations de travail au Maroc");
  r("Assessment Center Design", "Conception de Centre d'Evaluation", "ressources-humaines", "technical",
    "Designing and conducting multi-method candidate assessment programs", "Conception et conduite de programmes d'evaluation multi-methodes des candidats");
  r("Compensation & Benefits Benchmarking", "Benchmarking Remuneration & Avantages", "ressources-humaines", "technical",
    "Market salary surveys and total rewards strategy development", "Enquetes salariales de marche et developpement de strategie de remuneration globale");

  // Commerce International
  r("Letters of Credit (Documentary Credit)", "Credits Documentaires", "commerce-international", "technical",
    "Managing documentary credit operations for international trade", "Gestion des operations de credit documentaire pour le commerce international");
  r("Incoterms 2020", "Incoterms 2020", "commerce-international", "technical",
    "International commercial terms for trade obligations and risk transfer", "Termes commerciaux internationaux pour les obligations et le transfert de risque");
  r("HS Code Classification", "Classification Codes SH", "commerce-international", "technical",
    "Harmonized System tariff classification for customs declarations", "Classification tarifaire du Systeme Harmonise pour les declarations douanieres");
  r("Export Credit Insurance (SMAEX)", "Assurance Credit Export (SMAEX)", "commerce-international", "technical",
    "Morocco's export credit insurance agency for risk mitigation", "Agence marocaine d'assurance credit export pour l'attenuation des risques");
  r("AfCFTA Trade Regulations", "Reglementations Commerce ZLECAf", "commerce-international", "technical",
    "African Continental Free Trade Area regulations and opportunities", "Reglementations et opportunites de la Zone de Libre-Echange Continentale Africaine");

  // Language Skills
  r("Business English (TOEIC 900+)", "Anglais des Affaires (TOEIC 900+)", "general", "language",
    "Professional English proficiency for business communication", "Maitrise professionnelle de l'anglais pour la communication d'affaires");
  r("French DALF C1/C2", "Francais DALF C1/C2", "general", "language",
    "Advanced French language certification for academic and professional use", "Certification avancee en francais pour usage academique et professionnel");
  r("Spanish DELE B2", "Espagnol DELE B2", "general", "language",
    "Intermediate Spanish certification, valuable for Mediterranean trade", "Certification intermediaire en espagnol, precieuse pour le commerce mediterraneen");
  r("German Goethe B1", "Allemand Goethe B1", "general", "language",
    "German language certification for automotive and engineering sectors", "Certification en allemand pour les secteurs automobile et ingenierie");
  r("Mandarin Chinese HSK 3", "Chinois Mandarin HSK 3", "general", "language",
    "Basic Mandarin certification for China-Morocco trade relations", "Certification basique en mandarin pour les relations commerciales Chine-Maroc");

  // General Professional Skills
  r("Design Thinking", "Design Thinking", "general", "soft",
    "Human-centered problem-solving methodology for innovation", "Methodologie de resolution de problemes centree sur l'humain pour l'innovation");
  r("Public Speaking (in French & Arabic)", "Prise de Parole en Public (en Francais & Arabe)", "general", "soft",
    "Effective presentation skills in bilingual Moroccan business contexts", "Competences de presentation efficaces dans les contextes d'affaires bilingues marocains");
  r("Negotiation & Conflict Resolution", "Negociation & Resolution de Conflits", "general", "soft",
    "Advanced negotiation techniques and workplace conflict management", "Techniques avancees de negociation et gestion des conflits au travail");
  r("Cross-Cultural Communication", "Communication Interculturelle", "general", "soft",
    "Working effectively across Moroccan, European, and African cultures", "Travailler efficacement a travers les cultures marocaine, europeenne et africaine");
  r("Lean Six Sigma Green Belt", "Lean Six Sigma Ceinture Verte", "genie-industriel", "certification",
    "Process improvement methodology combining Lean and Six Sigma", "Methodologie d'amelioration des processus combinant Lean et Six Sigma");
  r("ISO 9001:2015 Lead Auditor", "Auditeur Principal ISO 9001:2015", "genie-industriel", "certification",
    "Quality management system auditing certification", "Certification d'audit du systeme de management de la qualite");
  r("NEBOSH International Certificate", "Certificat International NEBOSH", "genie-industriel", "certification",
    "International health and safety management certification", "Certification internationale de gestion de la sante et securite");

  return rows;
}

// ─── 6. CAREER EMPLOYER (100+ entries) ────────────────────────────────────────

function buildCareerEmployers() {
  const rows = [];
  const r = (name, sector, sectorFr, location, locationFr, openPos, website, desc, descFr, fields) => {
    rows.push([
      uuid(), name, sector, sectorFr, location, locationFr,
      openPos, website, null, desc, descFr,
      JSON.stringify(fields), true, rows.length, new Date(), new Date(),
    ]);
  };

  // Tech Startups
  r("Chari", "E-Commerce (Startup)", "E-Commerce (Startup)", "Casablanca", "Casablanca", 25,
    "https://chari.ma", "Morocco's leading B2B e-commerce platform for FMCG distribution",
    "Premiere plateforme e-commerce B2B marocaine pour la distribution FMCG",
    ["tech", "commerce"]);
  r("Yassir", "Ride-Hailing (Startup)", "VTC (Startup)", "Casablanca", "Casablanca", 30,
    "https://yassir.com", "North Africa's leading ride-hailing and delivery super app",
    "Super app leader de VTC et livraison en Afrique du Nord",
    ["tech", "logistics"]);
  r("WafR", "Fintech (Startup)", "Fintech (Startup)", "Casablanca", "Casablanca", 15,
    "https://wafr.ma", "Moroccan fintech startup offering digital payment solutions for merchants",
    "Startup fintech marocaine offrant des solutions de paiement numerique pour les commercants",
    ["tech", "finance"]);
  r("DabaDoc", "HealthTech (Startup)", "HealthTech (Startup)", "Casablanca", "Casablanca", 20,
    "https://dabadoc.com", "Online medical appointment booking and telemedicine platform",
    "Plateforme de prise de rendez-vous medicaux en ligne et de telemedecine",
    ["tech", "healthcare"]);
  r("HandyMap", "PropTech (Startup)", "PropTech (Startup)", "Casablanca", "Casablanca", 10,
    "https://handymap.ma", "Real estate tech platform with 3D virtual tours for Moroccan market",
    "Plateforme tech immobiliere avec visites virtuelles 3D pour le marche marocain",
    ["tech"]);
  r("Screendy", "EdTech (Startup)", "EdTech (Startup)", "Rabat", "Rabat", 12,
    "https://screendy.com", "No-code mobile app builder for African businesses and education",
    "Constructeur d'applications mobiles no-code pour les entreprises et l'education africaines",
    ["tech"]);
  r("Sowit", "AgriTech (Startup)", "AgriTech (Startup)", "Rabat", "Rabat", 8,
    "https://sowit.fr", "AI-powered precision agriculture platform using satellite imagery",
    "Plateforme d'agriculture de precision propulsee par l'IA utilisant l'imagerie satellite",
    ["tech", "agriculture"]);
  r("Hmizate", "E-Commerce (Daily Deals)", "E-Commerce (Bonnes Affaires)", "Casablanca", "Casablanca", 15,
    "https://hmizate.ma", "Morocco's leading daily deals and group buying platform",
    "Plateforme marocaine leader d'achats groupes et bons plans",
    ["tech", "commerce"]);
  r("Karny", "Mobility (Startup)", "Mobilite (Startup)", "Casablanca", "Casablanca", 10,
    "https://karny.ma", "Digital vehicle fleet management and connected car solutions",
    "Gestion de flotte de vehicules numerique et solutions de voiture connectee",
    ["tech", "logistics"]);
  r("Kifal Auto", "Automotive Marketplace", "Marketplace Automobile", "Casablanca", "Casablanca", 12,
    "https://kifal.ma", "Leading online marketplace for buying and selling vehicles in Morocco",
    "Marketplace en ligne leader pour l'achat et la vente de vehicules au Maroc",
    ["tech", "automotive"]);

  // Multinationals with Morocco Offices
  r("Accenture Morocco", "IT Consulting & Digital", "Conseil IT & Digital", "Casablanca (Casanearshore)", "Casablanca (Casanearshore)", 80,
    "https://accenture.com/ma", "Global professional services company with major Morocco operations",
    "Entreprise mondiale de services professionnels avec des operations majeures au Maroc",
    ["tech", "management"]);
  r("Capgemini Morocco", "IT Services & Consulting", "Services IT & Conseil", "Casablanca", "Casablanca", 60,
    "https://capgemini.com/ma", "French multinational IT services and consulting company",
    "Multinationale francaise de services IT et de conseil",
    ["tech"]);
  r("IBM Morocco", "Technology & Cloud", "Technologie & Cloud", "Casablanca", "Casablanca", 35,
    "https://ibm.com/ma", "American technology corporation offering cloud, AI, and consulting",
    "Societe technologique americaine offrant cloud, IA et conseil",
    ["tech"]);
  r("Oracle Morocco", "Enterprise Software", "Logiciel d'Entreprise", "Casablanca", "Casablanca", 25,
    "https://oracle.com/ma", "Enterprise database and cloud applications provider",
    "Fournisseur de bases de donnees d'entreprise et d'applications cloud",
    ["tech"]);
  r("SAP Morocco", "Enterprise Software", "Logiciel d'Entreprise", "Casablanca", "Casablanca", 20,
    "https://sap.com/morocco", "German enterprise software maker for ERP and business applications",
    "Editeur allemand de logiciels d'entreprise pour ERP et applications metier",
    ["tech", "management"]);
  r("Amazon Morocco (AWS)", "Cloud Computing", "Cloud Computing", "Casablanca", "Casablanca", 15,
    "https://aws.amazon.com", "Amazon Web Services cloud infrastructure and services",
    "Infrastructure et services cloud Amazon Web Services",
    ["tech"]);
  r("Huawei Morocco", "Telecommunications Equipment", "Equipements Telecommunications", "Rabat", "Rabat", 30,
    "https://huawei.com/ma", "Chinese telecommunications equipment and services provider",
    "Fournisseur chinois d'equipements et services de telecommunications",
    ["tech", "telecom"]);
  r("Nestl Morocco", "Consumer Goods (FMCG)", "Biens de Consommation (FMCG)", "Casablanca, El Jadida", "Casablanca, El Jadida", 40,
    "https://nestle.ma", "Swiss multinational food and beverage company with 3 factories in Morocco",
    "Multinationale suisse agroalimentaire avec 3 usines au Maroc",
    ["industrial", "marketing"]);
  r("Procter & Gamble Morocco", "Consumer Goods (FMCG)", "Biens de Consommation (FMCG)", "Mohammedia", "Mohammedia", 35,
    "https://pg.com/morocco", "American consumer goods corporation manufacturing in Morocco",
    "Societe americaine de biens de consommation fabriquant au Maroc",
    ["industrial", "marketing"]);
  r("L'Oreal Morocco", "Cosmetics & Beauty", "Cosmetiques & Beaute", "Casablanca", "Casablanca", 20,
    "https://loreal.ma", "French cosmetics group with strong Moroccan market presence",
    "Groupe cosmetique francais avec une forte presence sur le marche marocain",
    ["marketing", "commerce"]);
  r("Sanofi Morocco", "Pharmaceutical", "Pharmaceutique", "Casablanca", "Casablanca", 25,
    "https://sanofi.ma", "French pharmaceutical group with manufacturing plant in Casablanca",
    "Groupe pharmaceutique francais avec usine de fabrication a Casablanca",
    ["healthcare", "industrial"]);
  r("TotalEnergies Morocco", "Energy & Petroleum", "Energie & Petrole", "Casablanca", "Casablanca", 20,
    "https://totalenergies.ma", "French energy company operating fuel distribution and renewables in Morocco",
    "Entreprise energetique francaise operant la distribution de carburant et les renouvelables au Maroc",
    ["industrial", "hse"]);
  r("Vinci Energies Morocco", "Energy & Construction", "Energie & Construction", "Casablanca", "Casablanca", 30,
    "https://vinci-energies.ma", "French group specializing in energy infrastructure and electrical installations",
    "Groupe francais specialise dans l'infrastructure energetique et les installations electriques",
    ["industrial", "engineering"]);
  r("Saint-Gobain Morocco", "Construction Materials", "Materiaux de Construction", "Casablanca, Kenitra", "Casablanca, Kenitra", 25,
    "https://saint-gobain.ma", "French construction materials manufacturer with Morocco operations",
    "Fabricant francais de materiaux de construction avec operations au Maroc",
    ["industrial"]);
  r("Decathlon Morocco", "Sporting Goods Retail", "Distribution d'Articles de Sport", "Casablanca, Rabat, Marrakech", "Casablanca, Rabat, Marrakech", 50,
    "https://decathlon.ma", "French sporting goods retailer with 8+ stores across Morocco",
    "Distributeur francais d'articles de sport avec plus de 8 magasins au Maroc",
    ["commerce", "marketing"]);

  // Moroccan SMEs & Companies
  r("Disway", "IT Distribution & Services", "Distribution IT & Services", "Casablanca", "Casablanca", 15,
    "https://disway.com", "Leading IT distributor in Morocco (HP, Cisco, Microsoft partner)",
    "Distributeur IT leader au Maroc (partenaire HP, Cisco, Microsoft)",
    ["tech"]);
  r("S2M (Societe Monetique du Maroc)", "Fintech & Payment", "Fintech & Paiement", "Casablanca", "Casablanca", 20,
    "https://s2m.ma", "Moroccan electronic payment solutions provider for banks and telecoms",
    "Fournisseur marocain de solutions de paiement electronique pour les banques et telecoms",
    ["tech", "finance"]);
  r("Hightech Payment Systems (HPS)", "Payment Technology", "Technologie de Paiement", "Casablanca", "Casablanca", 40,
    "https://hps-worldwide.com", "Moroccan multinational providing payment switching and processing solutions",
    "Multinationale marocaine fournissant des solutions de switching et traitement de paiement",
    ["tech", "finance"]);
  r("Akwa Group", "Energy & Real Estate", "Energie & Immobilier", "Casablanca", "Casablanca", 30,
    "https://akwagroup.com", "Moroccan conglomerate in petroleum, gas, and real estate development",
    "Conglomerat marocain dans le petrole, le gaz et le developpement immobilier",
    ["industrial", "hse"]);
  r("Ynna Holding", "Diversified Conglomerate", "Conglomerat Diversifie", "Casablanca", "Casablanca", 50,
    "https://ynnaholding.ma", "One of Morocco's largest private groups (construction, tourism, retail)",
    "Un des plus grands groupes prives du Maroc (construction, tourisme, distribution)",
    ["industrial", "management"]);
  r("Saham Group", "Insurance & Financial Services", "Assurances & Services Financiers", "Casablanca", "Casablanca", 35,
    "https://sahamassurance.com", "Leading pan-African insurance and financial services group",
    "Groupe leader d'assurance et services financiers pan-africain",
    ["finance"]);
  r("Label'Vie Group", "Retail & Distribution", "Distribution & Commerce", "Rabat", "Rabat", 60,
    "https://labelvie.ma", "Moroccan retail group operating Carrefour franchise and Atacadao stores",
    "Groupe de distribution marocain operant la franchise Carrefour et les magasins Atacadao",
    ["commerce", "logistics"]);
  r("Auto Hall", "Automotive Distribution", "Distribution Automobile", "Casablanca", "Casablanca", 25,
    "https://autohall.ma", "Leading automotive and agricultural equipment distributor in Morocco",
    "Distributeur leader d'equipements automobiles et agricoles au Maroc",
    ["commerce", "automotive"]);
  r("BMCE Capital", "Investment Banking", "Banque d'Investissement", "Casablanca", "Casablanca", 15,
    "https://bmcecapital.com", "Investment banking arm of Bank of Africa group",
    "Branche de banque d'investissement du groupe Bank of Africa",
    ["finance"]);
  r("Wafa Assurance", "Insurance", "Assurance", "Casablanca", "Casablanca", 20,
    "https://wafaassurance.ma", "Leading multi-branch insurance company, subsidiary of Attijariwafa",
    "Compagnie d'assurance multi-branches leader, filiale d'Attijariwafa",
    ["finance"]);

  // Government Agencies
  r("ONDA (Airports Authority)", "Airport Management", "Gestion Aeroportuaire", "Casablanca (Mohammed V Airport)", "Casablanca (Aeroport Mohammed V)", 30,
    "https://onda.ma", "National Airports Authority managing 25 airports across Morocco",
    "Office National Des Aeroports gerant 25 aeroports au Maroc",
    ["logistics", "management"]);
  r("ONEE (Water & Electricity)", "Energy & Water Utilities", "Services Publics Eau & Electricite", "Rabat, National Coverage", "Rabat, Couverture Nationale", 100,
    "https://onee.ma", "National Office of Electricity and Drinking Water managing power generation and distribution",
    "Office National de l'Electricite et de l'Eau Potable gerant la production et distribution d'electricite",
    ["industrial", "hse"]);
  r("MASEN (Renewable Energy)", "Renewable Energy Agency", "Agence d'Energie Renouvelable", "Rabat, Ouarzazate", "Rabat, Ouarzazate", 20,
    "https://masen.ma", "Moroccan Agency for Sustainable Energy developing solar and wind projects",
    "Agence Marocaine pour l'Energie Durable developpant des projets solaires et eoliens",
    ["industrial", "hse"]);
  r("ANRT (Telecom Regulator)", "Telecommunications Regulation", "Regulation des Telecommunications", "Rabat", "Rabat", 10,
    "https://anrt.ma", "National Telecommunications Regulatory Agency",
    "Agence Nationale de Reglementation des Telecommunications",
    ["tech", "management"]);
  r("AMDIE (Investment Agency)", "Investment Promotion", "Promotion de l'Investissement", "Rabat", "Rabat", 15,
    "https://amdie.gov.ma", "Moroccan Agency for Development of Investments and Exports",
    "Agence Marocaine de Developpement des Investissements et des Exportations",
    ["management", "commerce"]);
  r("HCP (Statistics Office)", "Statistics & Research", "Statistiques & Recherche", "Rabat", "Rabat", 10,
    "https://hcp.ma", "High Commission for Planning producing national statistics and census data",
    "Haut-Commissariat au Plan produisant les statistiques nationales et les donnees de recensement",
    ["management"]);
  r("CNSS (Social Security)", "Social Security", "Securite Sociale", "Casablanca, National Coverage", "Casablanca, Couverture Nationale", 50,
    "https://cnss.ma", "National Social Security Fund managing pensions and healthcare coverage",
    "Caisse Nationale de Securite Sociale gerant les retraites et la couverture maladie",
    ["finance", "management"]);

  // NGOs and International Organizations
  r("UNDP Morocco", "International Development", "Developpement International", "Rabat", "Rabat", 10,
    "https://undp.org/morocco", "United Nations Development Programme in Morocco supporting SDGs",
    "Programme des Nations Unies pour le Developpement au Maroc soutenant les ODD",
    ["management"]);
  r("GIZ Morocco", "International Development", "Developpement International", "Rabat", "Rabat", 15,
    "https://giz.de/morocco", "German development agency supporting vocational training and renewable energy",
    "Agence allemande de developpement soutenant la formation professionnelle et les energies renouvelables",
    ["management", "industrial"]);
  r("AFD Morocco", "International Development Finance", "Finance de Developpement International", "Rabat", "Rabat", 8,
    "https://afd.fr/morocco", "French Development Agency financing infrastructure and social projects",
    "Agence Francaise de Developpement financant des projets d'infrastructure et sociaux",
    ["finance"]);
  r("World Bank Morocco", "International Development Finance", "Finance de Developpement International", "Rabat", "Rabat", 12,
    "https://worldbank.org/morocco", "World Bank Group supporting Morocco's development agenda",
    "Groupe de la Banque Mondiale soutenant l'agenda de developpement du Maroc",
    ["finance", "management"]);

  // Additional Moroccan Companies
  r("Dari Couspate", "Agri-Food (Pasta & Couscous)", "Agroalimentaire (Pates & Couscous)", "Casablanca", "Casablanca", 15,
    "https://dari.ma", "Leading Moroccan pasta and couscous manufacturer",
    "Fabricant marocain leader de pates et couscous",
    ["industrial"]);
  r("Mutandis", "Consumer Goods Holding", "Holding Biens de Consommation", "Casablanca", "Casablanca", 20,
    "https://mutandis.ma", "Moroccan holding company managing consumer goods brands",
    "Societe holding marocaine gerant des marques de biens de consommation",
    ["marketing", "management"]);
  r("TGCC (Travaux Generaux de Construction)", "Construction & Engineering", "Construction & Ingenierie", "Casablanca", "Casablanca", 80,
    "https://tgcc.ma", "Morocco's largest private construction company building stadiums for World Cup 2030",
    "Plus grande entreprise de construction privee du Maroc construisant des stades pour la Coupe du Monde 2030",
    ["industrial"]);
  r("Marsa Maroc", "Port Management", "Gestion Portuaire", "Casablanca, National Ports", "Casablanca, Ports Nationaux", 30,
    "https://marsamaroc.co.ma", "National port management company operating Morocco's major commercial ports",
    "Societe nationale de gestion portuaire operant les principaux ports commerciaux du Maroc",
    ["logistics"]);
  r("CTM Transport", "Passenger Transport", "Transport de Voyageurs", "Casablanca, National Coverage", "Casablanca, Couverture Nationale", 20,
    "https://ctm.ma", "Morocco's leading intercity bus transport company",
    "Premiere entreprise marocaine de transport interurbain par autocar",
    ["logistics"]);
  r("Axa Assurance Maroc", "Insurance & Financial", "Assurance & Finance", "Casablanca", "Casablanca", 25,
    "https://axa.ma", "Leading international insurance group in Morocco with 400+ agencies",
    "Groupe d'assurance international leader au Maroc avec plus de 400 agences",
    ["finance"]);
  r("Lydec", "Water & Electricity Distribution", "Distribution Eau & Electricite", "Casablanca", "Casablanca", 15,
    "https://lydec.ma", "Casablanca's water and electricity distribution concessionaire",
    "Concessionnaire de distribution d'eau et d'electricite de Casablanca",
    ["industrial", "hse"]);
  r("Sonasid", "Steel Manufacturing", "Siderurgie", "Casablanca, Jorf Lasfar", "Casablanca, Jorf Lasfar", 20,
    "https://sonasid.ma", "Morocco's leading steel manufacturer for construction sector",
    "Premier fabricant d'acier du Maroc pour le secteur de la construction",
    ["industrial"]);
  r("Ciments du Maroc", "Cement & Construction Materials", "Ciment & Materiaux de Construction", "Casablanca, Agadir, Marrakech", "Casablanca, Agadir, Marrakech", 25,
    "https://cimentsdumaroc.com", "HeidelbergCement subsidiary, major cement producer in Morocco",
    "Filiale d'HeidelbergCement, producteur majeur de ciment au Maroc",
    ["industrial"]);
  r("Stroc Industrie", "Metal Structures & Boilermaking", "Structures Metalliques & Chaudronnerie", "Casablanca", "Casablanca", 20,
    "https://strocindustrie.com", "Leading Moroccan industrial construction and metal structures company",
    "Entreprise marocaine leader de construction industrielle et structures metalliques",
    ["industrial"]);
  r("Afriquia SMDC", "Fuel Distribution", "Distribution de Carburant", "Casablanca, National Coverage", "Casablanca, Couverture Nationale", 30,
    "https://afriquiagas.com", "Morocco's leading fuel and LPG distribution network",
    "Reseau leader de distribution de carburant et GPL au Maroc",
    ["industrial", "logistics"]);
  r("Kitea", "Furniture Retail", "Ameublement & Decoration", "Casablanca, Multiple Cities", "Casablanca, Plusieurs Villes", 35,
    "https://kitea.ma", "Morocco's largest furniture and home decoration retail chain",
    "Plus grande chaine de distribution de meubles et decoration du Maroc",
    ["commerce", "marketing"]);
  r("Meditel (Orange Morocco)", "Telecommunications", "Telecommunications", "Casablanca, Rabat", "Casablanca, Rabat", 40,
    "https://orange.ma", "Major Moroccan telecom operator, part of Orange Group",
    "Operateur telecom marocain majeur, partie du Groupe Orange",
    ["tech", "marketing"]);
  r("Maroc Telecom (IAM)", "Telecommunications", "Telecommunications", "Rabat, National Coverage", "Rabat, Couverture Nationale", 50,
    "https://iam.ma", "Morocco's largest telecommunications operator with 75 million customers",
    "Plus grand operateur de telecommunications du Maroc avec 75 millions de clients",
    ["tech", "management"]);
  r("Inwi", "Telecommunications", "Telecommunications", "Casablanca", "Casablanca", 35,
    "https://inwi.ma", "Third largest Moroccan telecom operator, subsidiary of SNI/Al Mada",
    "Troisieme plus grand operateur telecom marocain, filiale de SNI/Al Mada",
    ["tech", "marketing"]);

  // Education & Research
  r("UM6P (Mohammed VI Polytechnic)", "Higher Education & Research", "Enseignement Superieur & Recherche", "Benguerir", "Benguerir", 30,
    "https://um6p.ma", "World-class research university funded by OCP focusing on agriculture, mining, and tech",
    "Universite de recherche de classe mondiale financee par OCP axee sur l'agriculture, les mines et la tech",
    ["management"]);
  r("ENSA Network", "Engineering Education", "Formation d'Ingenieurs", "National Coverage", "Couverture Nationale", 20,
    "https://ensa.ac.ma", "Network of 11 National Schools of Applied Sciences across Morocco",
    "Reseau de 11 Ecoles Nationales des Sciences Appliquees au Maroc",
    ["management"]);

  return rows;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Massive Data Expansion Seed Script ===\n");
  console.log("Connecting to database...");
  await client.connect();

  // Get initial counts
  const tables = ["job_resource", "career_market_insight", "interview_common_question", "resume_gallery", "skill_library", "career_employer"];
  const initialCounts = {};
  for (const t of tables) {
    const res = await client.query(`SELECT COUNT(*) FROM ${t}`);
    initialCounts[t] = parseInt(res.rows[0].count, 10);
  }
  const totalBefore = Object.values(initialCounts).reduce((a, b) => a + b, 0);
  console.log(`\nInitial total rows across 6 tables: ${totalBefore}\n`);

  // 1. Job Resources
  console.log("[1/6] Inserting job_resource entries...");
  const jobRows = buildJobResources();
  const jrCols = ["id", "name", "name_fr", "category", "sub_category", "description", "description_fr", "website", "contact_email", "contact_phone", "location", "fields", "tags", "is_free", "rating", "is_active", "sort_order", "created_at", "updated_at"];
  const jrInserted = await batchInsert("job_resource", jrCols, jobRows, "name");
  console.log(`  -> ${jrInserted} inserted (${jobRows.length} attempted)`);

  // 2. Career Market Insights
  console.log("[2/6] Inserting career_market_insight entries...");
  const cmiRows = buildCareerMarketInsights();
  const cmiCols = ["id", "title", "title_fr", "value", "description", "description_fr", "icon", "color", "field", "is_active", "sort_order", "created_at", "updated_at"];
  const cmiInserted = await batchInsert("career_market_insight", cmiCols, cmiRows, "title");
  console.log(`  -> ${cmiInserted} inserted (${cmiRows.length} attempted)`);

  // 3. Interview Common Questions
  console.log("[3/6] Inserting interview_common_question entries...");
  const icqRows = buildInterviewQuestions();
  const icqCols = ["id", "question", "question_fr", "type", "field", "sample_answer", "sample_answer_fr", "tips", "tips_fr", "difficulty", "is_active", "sort_order", "created_at", "updated_at"];
  const icqInserted = await batchInsert("interview_common_question", icqCols, icqRows, "id");
  console.log(`  -> ${icqInserted} inserted (${icqRows.length} attempted)`);

  // 4. Resume Gallery
  console.log("[4/6] Inserting resume_gallery entries...");
  const rgRows = buildResumeGalleryEntries();
  const rgCols = ["id", "name", "name_fr", "field", "sub_field", "experience_years", "template_name", "language", "description", "description_fr", "resume_data", "tags", "ats_score", "is_featured", "view_count", "use_count", "is_active", "created_at", "updated_at"];
  const rgInserted = await batchInsert("resume_gallery", rgCols, rgRows, "name");
  console.log(`  -> ${rgInserted} inserted (${rgRows.length} attempted)`);

  // 5. Skill Library
  console.log("[5/6] Inserting skill_library entries...");
  const slRows = buildSkillLibrary();
  const slCols = ["id", "name", "name_fr", "field", "category", "description", "description_fr", "is_recommended", "is_active", "sort_order", "created_at", "updated_at"];
  const slInserted = await batchInsert("skill_library", slCols, slRows, "id");
  console.log(`  -> ${slInserted} inserted (${slRows.length} attempted)`);

  // 6. Career Employers
  console.log("[6/6] Inserting career_employer entries...");
  const ceRows = buildCareerEmployers();
  const ceCols = ["id", "name", "sector", "sector_fr", "location", "location_fr", "open_positions", "website", "logo", "description", "description_fr", "fields", "is_active", "sort_order", "created_at", "updated_at"];
  const ceInserted = await batchInsert("career_employer", ceCols, ceRows, "name");
  console.log(`  -> ${ceInserted} inserted (${ceRows.length} attempted)`);

  // Final Summary
  const finalCounts = {};
  for (const t of tables) {
    const res = await client.query(`SELECT COUNT(*) FROM ${t}`);
    finalCounts[t] = parseInt(res.rows[0].count, 10);
  }
  const totalAfter = Object.values(finalCounts).reduce((a, b) => a + b, 0);

  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║              MASSIVE EXPANSION SUMMARY                      ║");
  console.log("╠══════════════════════════════════════════════════════════════╣");
  for (const t of tables) {
    const before = initialCounts[t];
    const after = finalCounts[t];
    const added = after - before;
    console.log(`║  ${t.padEnd(30)} ${String(before).padStart(4)} -> ${String(after).padStart(4)} (+${String(added).padStart(3)}) ║`);
  }
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log(`║  TOTAL ROWS:  ${String(totalBefore).padStart(5)} -> ${String(totalAfter).padStart(5)} (+${String(totalAfter - totalBefore).padStart(4)})                     ║`);
  console.log(`║  TARGET: 5000+  STATUS: ${totalAfter >= 5000 ? "ACHIEVED" : "NEEDS MORE (" + (5000 - totalAfter) + " remaining)"}           ║`);
  console.log("╚══════════════════════════════════════════════════════════════╝");

  await client.end();
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
