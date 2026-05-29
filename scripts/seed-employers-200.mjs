/**
 * seed-employers-200.mjs
 * Inserts 200+ NEW real Moroccan employers into career_employer table.
 * Uses ON CONFLICT (id) DO NOTHING. Checks name uniqueness before insert.
 * All employers are REAL companies operating in Morocco.
 */
import { Client } from "pg";
import crypto from "crypto";

const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";

// ============================================================================
// REAL MOROCCAN EMPLOYERS DATA
// Each entry: [name, sector, sectorFr, location, locationFr, website, description, descriptionFr, fields, openPositions]
// ============================================================================
const EMPLOYERS_DATA = [
  // === BANKING & FINANCE ===
  ["Credit Agricole du Maroc", "Banking", "Banque", "Rabat", "Rabat", "https://www.creditagricole.ma", "Agricultural bank supporting rural development and farming sector financing", "Banque agricole soutenant le developpement rural et le financement du secteur agricole", ["finance", "management", "agriculture"], 25],
  ["Bank Al-Maghrib (BAM)", "Central Banking", "Banque Centrale", "Rabat", "Rabat", "https://www.bkam.ma", "Morocco's central bank responsible for monetary policy and financial stability", "Banque centrale du Maroc responsable de la politique monetaire et de la stabilite financiere", ["finance", "genie-informatique", "management"], 15],
  ["Al Barid Bank", "Banking", "Banque", "Rabat", "Rabat", "https://www.albaridbankgroup.ma", "Postal bank providing financial inclusion services across Morocco", "Banque postale offrant des services d'inclusion financiere a travers le Maroc", ["finance", "management", "genie-informatique"], 30],
  ["CFG Bank", "Banking", "Banque", "Casablanca", "Casablanca", "https://www.cfgbank.com", "Independent Moroccan bank offering corporate and retail banking services", "Banque marocaine independante offrant des services bancaires aux entreprises et aux particuliers", ["finance", "management"], 12],
  ["Wafasalaf", "Consumer Finance", "Credit a la Consommation", "Casablanca", "Casablanca", "https://www.wafasalaf.ma", "Leading consumer credit company in Morocco, subsidiary of Attijariwafa Bank", "Leader du credit a la consommation au Maroc, filiale d'Attijariwafa Bank", ["finance", "marketing", "genie-informatique"], 18],
  ["Wafa Gestion", "Asset Management", "Gestion d'Actifs", "Casablanca", "Casablanca", "https://www.wafagestion.com", "Leading asset management firm in Morocco managing diverse investment funds", "Societe de gestion d'actifs leader au Maroc gerant des fonds d'investissement diversifies", ["finance"], 8],
  ["Bourse de Casablanca", "Stock Exchange", "Bourse", "Casablanca", "Casablanca", "https://www.casablanca-bourse.com", "Morocco's primary stock exchange, platform for capital market transactions", "Principale bourse du Maroc, plateforme pour les transactions du marche des capitaux", ["finance", "genie-informatique"], 10],
  ["Finea (ex-CMM)", "Trade Finance", "Financement du Commerce", "Casablanca", "Casablanca", "https://www.finea.ma", "Public institution financing Moroccan exports and supporting foreign trade", "Institution publique finançant les exportations marocaines et soutenant le commerce exterieur", ["finance", "commerce"], 8],
  ["Maghreb Titrisation", "Securitization", "Titrisation", "Casablanca", "Casablanca", "https://www.maghrebtitrisation.ma", "Pioneer in securitization and structured finance in Morocco", "Pionnier de la titrisation et de la finance structuree au Maroc", ["finance"], 5],

  // === INSURANCE ===
  ["Atlanta Assurances", "Insurance", "Assurance", "Casablanca", "Casablanca", "https://www.atlanta.ma", "Major Moroccan insurance company offering life and non-life products", "Compagnie d'assurance marocaine majeure offrant des produits vie et non-vie", ["finance", "genie-informatique", "management"], 15],
  ["MAMDA-MCMA", "Insurance", "Assurance", "Rabat", "Rabat", "https://www.mamda.ma", "Agricultural mutual insurance serving Morocco's farming community", "Mutuelle d'assurance agricole au service de la communaute agricole du Maroc", ["finance", "agriculture"], 10],
  ["Zurich Assurances Maroc", "Insurance", "Assurance", "Casablanca", "Casablanca", "https://www.zurich.ma", "International insurance company providing comprehensive coverage in Morocco", "Compagnie d'assurance internationale offrant une couverture complete au Maroc", ["finance", "management"], 12],
  ["CNIA Saada", "Insurance", "Assurance", "Casablanca", "Casablanca", "https://www.cniasaada.ma", "Moroccan insurance company part of Saham Group offering diverse products", "Compagnie d'assurance marocaine du Groupe Saham offrant des produits diversifies", ["finance", "marketing"], 10],

  // === TELECOMS & TECH ===
  ["Huawei Technologies Maroc", "Telecom Equipment", "Equipements Telecom", "Rabat", "Rabat", "https://www.huawei.com/ma", "Global ICT solutions provider deploying 5G and smart city technologies in Morocco", "Fournisseur mondial de solutions TIC deployant la 5G et les technologies de ville intelligente au Maroc", ["genie-informatique", "genie-electrique"], 35],
  ["Dell Technologies Maroc", "IT Hardware", "Materiel Informatique", "Casablanca", "Casablanca", "https://www.dell.com/ma", "Global technology company providing enterprise IT solutions to Moroccan businesses", "Societe technologique mondiale fournissant des solutions IT aux entreprises marocaines", ["genie-informatique"], 15],
  ["HP Maroc", "IT Hardware", "Materiel Informatique", "Casablanca", "Casablanca", "https://www.hp.com/ma-fr", "Technology company providing computing and printing solutions across Morocco", "Societe technologique fournissant des solutions informatiques et d'impression au Maroc", ["genie-informatique"], 12],
  ["Microsoft Maroc", "Software", "Logiciel", "Casablanca", "Casablanca", "https://www.microsoft.com/fr-ma", "Global software giant supporting digital transformation across Moroccan enterprises", "Geant mondial du logiciel soutenant la transformation digitale des entreprises marocaines", ["genie-informatique"], 25],
  ["Oracle Maroc", "Enterprise Software", "Logiciel d'Entreprise", "Casablanca", "Casablanca", "https://www.oracle.com/ma", "Enterprise software and cloud infrastructure provider for Moroccan businesses", "Fournisseur de logiciels d'entreprise et d'infrastructure cloud pour les entreprises marocaines", ["genie-informatique", "management"], 18],
  ["SAP Maroc", "Enterprise Software", "Logiciel d'Entreprise", "Casablanca", "Casablanca", "https://www.sap.com/morocco", "Enterprise resource planning and business software solutions for Morocco", "Solutions de planification des ressources d'entreprise et logiciels metier pour le Maroc", ["genie-informatique", "management"], 15],
  ["Cisco Maroc", "Networking", "Reseaux", "Casablanca", "Casablanca", "https://www.cisco.com", "Global leader in networking and cybersecurity solutions for Moroccan market", "Leader mondial des solutions de mise en reseau et de cybersecurite pour le marche marocain", ["genie-informatique", "genie-electrique"], 12],
  ["IB Maroc", "IT Services", "Services IT", "Casablanca", "Casablanca", "https://www.ibmaroc.com", "Leading Moroccan IT integrator and managed services provider", "Premier integrateur IT et fournisseur de services geres au Maroc", ["genie-informatique"], 20],
  ["Involys", "IT Services", "Services IT", "Casablanca", "Casablanca", "https://www.involys.com", "Moroccan IT services company specializing in enterprise solutions", "Societe marocaine de services IT specialisee en solutions d'entreprise", ["genie-informatique"], 15],
  ["M2M Group", "Fintech", "Fintech", "Casablanca", "Casablanca", "https://www.m2mgroup.com", "Moroccan fintech company providing electronic payment and identification solutions", "Societe fintech marocaine fournissant des solutions de paiement electronique et d'identification", ["genie-informatique", "finance"], 12],
  ["HPS (Hightech Payment Systems)", "Fintech", "Fintech", "Casablanca", "Casablanca", "https://www.hps-worldwide.com", "Global payment solutions provider headquartered in Morocco", "Fournisseur mondial de solutions de paiement base au Maroc", ["genie-informatique", "finance"], 30],
  ["Disway", "IT Distribution", "Distribution IT", "Casablanca", "Casablanca", "https://www.disway.com", "Largest IT distribution company in Morocco covering hardware and software", "Plus grande societe de distribution IT au Maroc couvrant le materiel et les logiciels", ["commerce", "genie-informatique"], 15],
  ["S2M", "Payment Solutions", "Solutions de Paiement", "Casablanca", "Casablanca", "https://www.s2m.ma", "Moroccan payment systems and monetique solutions company", "Societe marocaine de systemes de paiement et solutions monetiques", ["genie-informatique", "finance"], 18],
  ["Screendy", "Digital Marketing", "Marketing Digital", "Casablanca", "Casablanca", "https://www.screendy.com", "Moroccan digital agency specializing in interactive content and mobile solutions", "Agence digitale marocaine specialisee en contenu interactif et solutions mobiles", ["genie-informatique", "marketing", "design"], 8],
  ["Obytes", "Software Development", "Developpement Logiciel", "Casablanca", "Casablanca", "https://www.obytes.com", "Moroccan software development company building mobile and web applications", "Societe marocaine de developpement logiciel construisant des applications mobiles et web", ["genie-informatique"], 12],
  ["DabaDoc", "Health Tech", "Tech Sante", "Casablanca", "Casablanca", "https://www.dabadoc.com", "Leading Moroccan healthtech platform connecting patients with doctors", "Plateforme healthtech marocaine leader connectant les patients aux medecins", ["genie-informatique", "medecine"], 15],
  ["Yassir", "Ride-hailing", "VTC", "Casablanca", "Casablanca", "https://www.yassir.com", "North African super-app for ride-hailing and delivery services", "Super-app nord-africaine pour le VTC et les services de livraison", ["genie-informatique", "logistique"], 25],
  ["Chari", "E-commerce", "Commerce Electronique", "Casablanca", "Casablanca", "https://www.chari.ma", "B2B e-commerce platform digitizing FMCG supply chain in Morocco", "Plateforme e-commerce B2B digitalisant la chaine d'approvisionnement FMCG au Maroc", ["genie-informatique", "logistique", "commerce"], 20],
  ["Terraa", "AgriTech", "AgriTech", "Casablanca", "Casablanca", "https://www.terraa.ma", "Moroccan agritech startup digitizing the agricultural supply chain", "Startup agritech marocaine digitalisant la chaine d'approvisionnement agricole", ["genie-informatique", "agriculture"], 10],
  ["Sowit", "AgriTech", "AgriTech", "Marrakech", "Marrakech", "https://www.sowit.fr", "Precision agriculture startup using satellite imagery for crop monitoring in Morocco", "Startup d'agriculture de precision utilisant l'imagerie satellite pour le suivi des cultures au Maroc", ["genie-informatique", "agriculture", "environnement"], 8],
  ["WaystoCap", "B2B Trade", "Commerce B2B", "Casablanca", "Casablanca", "https://www.waystocap.com", "Pan-African B2B trade marketplace connecting buyers and sellers", "Marketplace B2B panafricaine connectant acheteurs et vendeurs", ["commerce", "genie-informatique"], 8],
  ["Kifal Auto", "Automotive Tech", "Tech Automobile", "Casablanca", "Casablanca", "https://www.kifal.com", "Moroccan online automotive marketplace for car buying and selling", "Marketplace automobile marocaine en ligne pour l'achat et la vente de voitures", ["genie-informatique", "commerce"], 10],

  // === AUTOMOTIVE & AEROSPACE ===
  ["Renault Group Maroc (SOMACA)", "Automotive", "Automobile", "Tanger", "Tanger", "https://www.renaultgroup.com", "Major automotive manufacturer with two plants in Morocco producing 400K+ vehicles/year", "Constructeur automobile majeur avec deux usines au Maroc produisant 400K+ vehicules/an", ["genie-mecanique", "genie-industriel", "logistique"], 80],
  ["Stellantis (PSA) Kenitra", "Automotive", "Automobile", "Kenitra", "Kenitra", "https://www.stellantis.com", "Global automotive group operating a major assembly plant in Kenitra free zone", "Groupe automobile mondial operant une usine d'assemblage majeure dans la zone franche de Kenitra", ["genie-mecanique", "genie-industriel", "logistique"], 60],
  ["Boeing Morocco", "Aerospace", "Aeronautique", "Casablanca", "Casablanca", "https://www.boeing.com", "American aerospace giant with manufacturing and engineering operations in Morocco", "Geant aeronautique americain avec des operations de fabrication et d'ingenierie au Maroc", ["genie-mecanique", "genie-industriel", "genie-electrique"], 40],
  ["Bombardier Aerospace Maroc", "Aerospace", "Aeronautique", "Casablanca", "Casablanca", "https://www.bombardier.com", "Canadian aerospace company with aircraft component manufacturing in Casablanca", "Societe aeronautique canadienne avec fabrication de composants aeronautiques a Casablanca", ["genie-mecanique", "genie-industriel"], 30],
  ["Safran Morocco", "Aerospace", "Aeronautique", "Casablanca", "Casablanca", "https://www.safran-group.com", "French aerospace group with engine nacelle and wiring production in Morocco", "Groupe aeronautique francais avec production de nacelles moteur et cablage au Maroc", ["genie-mecanique", "genie-electrique", "genie-industriel"], 45],
  ["STELIA Aerospace Maroc (Airbus Atlantic)", "Aerospace", "Aeronautique", "Casablanca", "Casablanca", "https://www.airbus.com", "Airbus subsidiary producing aerostructures and aircraft fuselage sections in Morocco", "Filiale d'Airbus produisant des aerostructures et des sections de fuselage au Maroc", ["genie-mecanique", "genie-industriel"], 35],
  ["Daher Aerospace Morocco", "Aerospace", "Aeronautique", "Tanger", "Tanger", "https://www.daher.com", "French aerospace company manufacturing composite structures in Tangier free zone", "Societe aeronautique francaise fabricant des structures composites dans la zone franche de Tanger", ["genie-mecanique", "genie-industriel"], 25],
  ["Thales Morocco", "Defense & Aerospace", "Defense et Aeronautique", "Casablanca", "Casablanca", "https://www.thalesgroup.com", "French multinational providing defense, avionics and transportation solutions in Morocco", "Multinationale francaise fournissant des solutions de defense, avionique et transport au Maroc", ["genie-electrique", "genie-informatique"], 20],
  ["Aptiv (ex-Delphi) Morocco", "Automotive Parts", "Equipementier Automobile", "Tanger", "Tanger", "https://www.aptiv.com", "Global automotive technology company producing electrical systems in Morocco", "Societe mondiale de technologie automobile produisant des systemes electriques au Maroc", ["genie-electrique", "genie-mecanique", "genie-industriel"], 50],
  ["Lear Corporation Morocco", "Automotive Parts", "Equipementier Automobile", "Tanger", "Tanger", "https://www.lear.com", "American automotive seating and electrical supplier with multiple Moroccan plants", "Equipementier automobile americain de sieges et systemes electriques avec plusieurs usines au Maroc", ["genie-mecanique", "genie-electrique"], 45],
  ["Yazaki Morocco", "Wiring Systems", "Systemes de Cablage", "Tanger", "Tanger", "https://www.yazaki-group.com", "Japanese wiring harness manufacturer with major operations across Morocco", "Fabricant japonais de faisceaux de cables avec des operations majeures a travers le Maroc", ["genie-electrique", "genie-industriel"], 60],
  ["Sumitomo Electric Wiring Morocco", "Wiring Systems", "Systemes de Cablage", "Tanger", "Tanger", "https://www.sews.com", "Japanese wiring systems manufacturer supplying major automotive OEMs from Morocco", "Fabricant japonais de systemes de cablage approvisionnant les grands constructeurs depuis le Maroc", ["genie-electrique", "genie-industriel"], 40],
  ["Fujikura Automotive Morocco", "Wiring Systems", "Systemes de Cablage", "Kenitra", "Kenitra", "https://www.fujikura.com", "Japanese manufacturer of automotive wiring harnesses and electronics", "Fabricant japonais de faisceaux de cables et d'electronique automobile", ["genie-electrique", "genie-industriel"], 35],
  ["TE Connectivity Morocco", "Electronic Components", "Composants Electroniques", "Tanger", "Tanger", "https://www.te.com", "Global electronics manufacturer producing connectors and sensors in Morocco", "Fabricant mondial d'electronique produisant des connecteurs et capteurs au Maroc", ["genie-electrique", "genie-mecanique"], 30],
  ["Valeo Morocco", "Automotive Parts", "Equipementier Automobile", "Tanger", "Tanger", "https://www.valeo.com", "French automotive supplier producing thermal and visibility systems in Morocco", "Equipementier automobile francais produisant des systemes thermiques et de visibilite au Maroc", ["genie-mecanique", "genie-electrique"], 35],
  ["SNOP Maroc", "Automotive Stamping", "Emboutissage Automobile", "Tanger", "Tanger", "https://www.music-group.com", "French automotive stamping and assembly company operating in Tangier free zone", "Societe francaise d'emboutissage et d'assemblage automobile operant dans la zone franche de Tanger", ["genie-mecanique", "genie-industriel"], 20],
  ["Hands Corporation Morocco", "Automotive Parts", "Equipementier Automobile", "Tanger", "Tanger", "https://www.handscorp.com", "Korean automotive wire harness company with manufacturing in Tangier", "Societe coreenne de faisceaux de cables automobiles avec fabrication a Tanger", ["genie-electrique", "genie-industriel"], 25],
  ["Coficab Morocco", "Cable Manufacturing", "Fabrication de Cables", "Tanger", "Tanger", "https://www.coficab.com", "Tunisian-origin cable manufacturer serving automotive sector from Morocco", "Fabricant de cables d'origine tunisienne au service du secteur automobile depuis le Maroc", ["genie-electrique", "genie-industriel"], 20],
  ["Auto Hall", "Automotive Distribution", "Distribution Automobile", "Casablanca", "Casablanca", "https://www.autohall.ma", "Leading Moroccan automotive distributor representing major international brands", "Premier distributeur automobile marocain representant les grandes marques internationales", ["commerce", "management", "logistique"], 25],
  ["Auto Nejma", "Automotive Distribution", "Distribution Automobile", "Casablanca", "Casablanca", "https://www.autonejma.ma", "Moroccan distributor of Mercedes-Benz, Jeep and other premium brands", "Distributeur marocain de Mercedes-Benz, Jeep et autres marques premium", ["commerce", "management"], 15],

  // === CONSULTING & PROFESSIONAL SERVICES ===
  ["McKinsey & Company Morocco", "Management Consulting", "Conseil en Management", "Casablanca", "Casablanca", "https://www.mckinsey.com", "Global management consulting firm advising Moroccan enterprises and government", "Cabinet de conseil en management mondial conseillant les entreprises et le gouvernement marocains", ["management", "finance"], 15],
  ["BCG Morocco", "Management Consulting", "Conseil en Management", "Casablanca", "Casablanca", "https://www.bcg.com", "Boston Consulting Group operations serving clients across North Africa", "Operations du Boston Consulting Group au service des clients en Afrique du Nord", ["management", "finance"], 12],
  ["Accenture Morocco", "IT Consulting", "Conseil IT", "Casablanca", "Casablanca", "https://www.accenture.com/ma-fr", "Global consulting and technology services company with Moroccan operations", "Societe mondiale de conseil et de services technologiques avec des operations marocaines", ["genie-informatique", "management"], 40],
  ["Deloitte Morocco", "Audit & Consulting", "Audit et Conseil", "Casablanca", "Casablanca", "https://www2.deloitte.com/ma", "Big Four firm providing audit, consulting, tax and advisory services", "Cabinet du Big Four fournissant des services d'audit, conseil, fiscalite et conseil", ["finance", "management", "genie-informatique"], 35],
  ["PwC Morocco", "Audit & Consulting", "Audit et Conseil", "Casablanca", "Casablanca", "https://www.pwc.com/m1/en/countries/morocco", "Global professional services firm with comprehensive Moroccan practice", "Cabinet de services professionnels mondial avec une pratique marocaine complete", ["finance", "management"], 30],
  ["EY Morocco (Ernst & Young)", "Audit & Consulting", "Audit et Conseil", "Casablanca", "Casablanca", "https://www.ey.com/fr_ma", "Big Four firm providing assurance, consulting and tax services in Morocco", "Cabinet du Big Four fournissant des services d'assurance, conseil et fiscalite au Maroc", ["finance", "management"], 28],
  ["KPMG Morocco", "Audit & Consulting", "Audit et Conseil", "Casablanca", "Casablanca", "https://home.kpmg/ma", "Big Four firm offering audit, tax and advisory services in Morocco", "Cabinet du Big Four offrant des services d'audit, fiscalite et conseil au Maroc", ["finance", "management"], 25],
  ["Mazars Morocco", "Audit & Advisory", "Audit et Conseil", "Casablanca", "Casablanca", "https://www.mazars.ma", "International audit and advisory firm with growing Moroccan practice", "Cabinet international d'audit et de conseil avec une pratique marocaine croissante", ["finance", "management"], 15],
  ["BDO Morocco", "Audit & Consulting", "Audit et Conseil", "Casablanca", "Casablanca", "https://www.bdo.ma", "International audit and accounting network with Moroccan member firm", "Reseau international d'audit et de comptabilite avec un cabinet membre marocain", ["finance"], 10],
  ["Grant Thornton Morocco", "Audit & Advisory", "Audit et Conseil", "Casablanca", "Casablanca", "https://www.grantthornton.ma", "International professional services network providing audit and advisory services", "Reseau international de services professionnels fournissant des services d'audit et de conseil", ["finance", "management"], 10],

  // === IT SERVICES & OUTSOURCING ===
  ["Capgemini Morocco", "IT Services", "Services IT", "Casablanca", "Casablanca", "https://www.capgemini.com/ma-fr", "French IT services giant with major delivery center in Casablanca", "Geant francais des services IT avec un centre de livraison majeur a Casablanca", ["genie-informatique", "management"], 50],
  ["Atos Morocco", "IT Services", "Services IT", "Casablanca", "Casablanca", "https://atos.net/fr/maroc", "European IT services company providing digital transformation solutions", "Societe europeenne de services IT fournissant des solutions de transformation digitale", ["genie-informatique"], 35],
  ["CGI Morocco", "IT Consulting", "Conseil IT", "Rabat", "Rabat", "https://www.cgi.com/maroc", "Canadian IT consulting company with nearshore delivery center in Morocco", "Societe canadienne de conseil IT avec un centre de livraison nearshore au Maroc", ["genie-informatique"], 30],
  ["IBM Morocco", "IT Services", "Services IT", "Casablanca", "Casablanca", "https://www.ibm.com/ma-fr", "Global technology company providing cloud, AI and enterprise solutions in Morocco", "Societe technologique mondiale fournissant des solutions cloud, IA et d'entreprise au Maroc", ["genie-informatique"], 20],
  ["Sopra Banking Software Morocco", "IT Services", "Services IT", "Casablanca", "Casablanca", "https://www.soprabanking.com", "French software company specializing in banking and financial services technology", "Societe francaise de logiciels specialisee dans la technologie des services bancaires et financiers", ["genie-informatique", "finance"], 25],
  ["SQLI Morocco", "Digital Agency", "Agence Digitale", "Rabat", "Rabat", "https://www.sqli.com", "French digital experience agency with development center in Morocco", "Agence d'experience digitale francaise avec un centre de developpement au Maroc", ["genie-informatique", "design"], 20],
  ["Norsys Afrique", "IT Services", "Services IT", "Casablanca", "Casablanca", "https://www.norsys.fr", "French IT services company with responsible approach and Moroccan operations", "Societe francaise de services IT avec une approche responsable et des operations marocaines", ["genie-informatique"], 15],
  ["Intelcia", "BPO & IT Services", "BPO et Services IT", "Casablanca", "Casablanca", "https://www.intelcia.com", "Moroccan-origin global BPO leader with 35K+ employees across multiple countries", "Leader mondial du BPO d'origine marocaine avec 35K+ employes dans plusieurs pays", ["genie-informatique", "management", "commerce"], 100],
  ["Majorel (Teleperformance)", "BPO", "Externalisation", "Casablanca", "Casablanca", "https://www.teleperformance.com", "Global BPO giant with major operations center in Casablanca", "Geant mondial du BPO avec un centre d'operations majeur a Casablanca", ["commerce", "management", "genie-informatique"], 80],
  ["Webhelp Morocco (Concentrix)", "BPO", "Externalisation", "Casablanca", "Casablanca", "https://www.concentrix.com", "Global customer experience company with multilingual centers in Morocco", "Societe mondiale d'experience client avec des centres multilingues au Maroc", ["commerce", "management"], 70],
  ["Sitel Morocco (Foundever)", "BPO", "Externalisation", "Rabat", "Rabat", "https://www.foundever.com", "Global BPO company providing customer experience solutions from Morocco", "Societe mondiale de BPO fournissant des solutions d'experience client depuis le Maroc", ["commerce", "management"], 60],
  ["Telus International Morocco", "BPO & Tech", "BPO et Tech", "Casablanca", "Casablanca", "https://www.telusinternational.com", "Canadian tech company providing digital CX and AI solutions from Morocco", "Societe tech canadienne fournissant des solutions CX digitales et IA depuis le Maroc", ["genie-informatique", "management"], 40],

  // === ENERGY & UTILITIES ===
  ["ONEE (Water & Electricity)", "Utilities", "Services Publics", "Rabat", "Rabat", "https://www.one.org.ma", "National office managing electricity production, distribution and water supply", "Office national gerant la production, distribution d'electricite et l'approvisionnement en eau", ["genie-electrique", "genie-civil", "environnement"], 50],
  ["MASEN (Renewable Energy)", "Renewable Energy", "Energies Renouvelables", "Rabat", "Rabat", "https://www.masen.ma", "Moroccan agency driving the national renewable energy strategy including Noor solar", "Agence marocaine pilotant la strategie nationale d'energies renouvelables dont le solaire Noor", ["genie-electrique", "environnement", "genie-civil"], 30],
  ["IRESEN", "Energy Research", "Recherche Energetique", "Rabat", "Rabat", "https://www.iresen.org", "Research institute for solar energy and new energies in Morocco", "Institut de recherche en energie solaire et nouvelles energies au Maroc", ["genie-electrique", "environnement"], 15],
  ["TotalEnergies Morocco", "Energy", "Energie", "Casablanca", "Casablanca", "https://www.totalenergies.ma", "French energy major with fuel distribution and renewable energy in Morocco", "Major energetique francais avec distribution de carburants et energies renouvelables au Maroc", ["genie-mecanique", "genie-electrique", "commerce"], 25],
  ["Vivo Energy Morocco (Shell)", "Energy", "Energie", "Casablanca", "Casablanca", "https://www.vivoenergy.com", "Distributor of Shell-branded fuels and lubricants across Morocco", "Distributeur de carburants et lubrifiants de marque Shell a travers le Maroc", ["commerce", "logistique", "genie-mecanique"], 20],
  ["Afriquia SMDC (AKWA Group)", "Energy", "Energie", "Casablanca", "Casablanca", "https://www.afriquiagas.com", "Leading Moroccan fuel and gas distribution company part of AKWA Group", "Societe leader de distribution de carburants et gaz au Maroc du Groupe AKWA", ["commerce", "logistique", "genie-mecanique"], 25],
  ["Taqa Morocco (JLEC)", "Power Generation", "Production d'Electricite", "El Jadida", "El Jadida", "https://www.taqamorocco.com", "Major independent power producer in Morocco with 2GW coal-fired capacity", "Principal producteur independant d'electricite au Maroc avec 2GW de capacite au charbon", ["genie-electrique", "genie-mecanique", "environnement"], 15],
  ["NAREVA Holding", "Renewable Energy", "Energies Renouvelables", "Casablanca", "Casablanca", "https://www.nareva.ma", "Moroccan holding company developing wind and solar energy projects", "Holding marocain developpant des projets d'energie eolienne et solaire", ["genie-electrique", "environnement", "finance"], 15],
  ["Platinum Power", "Renewable Energy", "Energies Renouvelables", "Casablanca", "Casablanca", "https://www.platinumpower.ma", "Moroccan independent power producer focused on hydroelectric and wind energy", "Producteur independant d'electricite marocain axe sur l'hydroelectrique et l'eolien", ["genie-electrique", "genie-civil", "environnement"], 10],
  ["Engie Morocco", "Energy Services", "Services Energetiques", "Casablanca", "Casablanca", "https://www.engie.ma", "French energy group providing sustainable energy solutions in Morocco", "Groupe energetique francais fournissant des solutions energetiques durables au Maroc", ["genie-electrique", "environnement"], 20],
  ["Lydec", "Utilities", "Services Publics", "Casablanca", "Casablanca", "https://www.lydec.ma", "Utility company managing water, electricity and sanitation for Greater Casablanca", "Societe de services publics gerant l'eau, l'electricite et l'assainissement du Grand Casablanca", ["genie-electrique", "genie-civil", "environnement"], 30],
  ["REDAL", "Utilities", "Services Publics", "Rabat", "Rabat", "https://www.redal.ma", "Utility company managing water and electricity distribution in Rabat-Sale region", "Societe de services publics gerant la distribution d'eau et d'electricite dans la region Rabat-Sale", ["genie-electrique", "genie-civil"], 20],
  ["Amendis (Veolia)", "Utilities", "Services Publics", "Tanger", "Tanger", "https://www.amendis.ma", "Veolia subsidiary managing water and electricity in Tangier-Tetouan region", "Filiale de Veolia gerant l'eau et l'electricite dans la region Tanger-Tetouan", ["genie-civil", "environnement"], 18],

  // === CONSTRUCTION & REAL ESTATE ===
  ["TGCC (Construction)", "Construction", "Construction", "Casablanca", "Casablanca", "https://www.tgcc.ma", "Leading Moroccan construction company with mega-projects across Africa", "Societe de construction marocaine leader avec des mega-projets a travers l'Afrique", ["genie-civil", "management", "architecture"], 45],
  ["SGTM (Construction)", "Construction", "Construction", "Casablanca", "Casablanca", "https://www.sgtm.ma", "Major Moroccan construction group specializing in infrastructure and building", "Grand groupe marocain de construction specialise dans les infrastructures et le batiment", ["genie-civil", "genie-mecanique"], 35],
  ["Jet Contractors", "Construction", "Construction", "Casablanca", "Casablanca", "https://www.jetcontractors.com", "Moroccan construction and real estate development group", "Groupe marocain de construction et de promotion immobiliere", ["genie-civil", "architecture"], 30],
  ["Alliances Developpement Immobilier", "Real Estate", "Immobilier", "Casablanca", "Casablanca", "https://www.alliances.co.ma", "Major Moroccan real estate developer with residential and commercial projects", "Grand promoteur immobilier marocain avec des projets residentiels et commerciaux", ["genie-civil", "architecture", "management"], 25],
  ["Addoha Group", "Real Estate", "Immobilier", "Casablanca", "Casablanca", "https://www.groupeaddoha.com", "Leading Moroccan real estate group focused on social and mid-range housing", "Groupe immobilier marocain leader axe sur le logement social et moyen standing", ["genie-civil", "architecture", "finance"], 30],
  ["Residences Dar Saada", "Real Estate", "Immobilier", "Casablanca", "Casablanca", "https://www.darsaada.ma", "Moroccan social housing developer with projects across the kingdom", "Promoteur marocain de logement social avec des projets a travers le royaume", ["genie-civil", "architecture"], 20],
  ["Groupe Al Omrane", "Real Estate", "Immobilier", "Rabat", "Rabat", "https://www.alomrane.gov.ma", "Public real estate group implementing Morocco's urban development policies", "Groupe immobilier public mettant en oeuvre les politiques de developpement urbain du Maroc", ["genie-civil", "architecture", "management"], 35],
  ["Yamed Capital", "Real Estate", "Immobilier", "Casablanca", "Casablanca", "https://www.yamed-capital.com", "Moroccan real estate investment and development company", "Societe marocaine d'investissement et de developpement immobilier", ["finance", "architecture", "management"], 15],
  ["Palmeraie Developpement", "Real Estate", "Immobilier", "Marrakech", "Marrakech", "https://www.palmeraiedeveloppement.com", "Moroccan group developing luxury real estate and leisure projects", "Groupe marocain developpant des projets immobiliers de luxe et de loisirs", ["architecture", "management", "tourisme"], 20],
  ["SOGEA Morocco (VINCI)", "Construction", "Construction", "Casablanca", "Casablanca", "https://www.vinci-construction.com", "VINCI subsidiary specializing in civil engineering and building in Morocco", "Filiale de VINCI specialisee en genie civil et batiment au Maroc", ["genie-civil", "genie-mecanique"], 25],
  ["LafargeHolcim Morocco", "Building Materials", "Materiaux de Construction", "Casablanca", "Casablanca", "https://www.lafargeholcim.ma", "Global building materials leader with cement and aggregates operations in Morocco", "Leader mondial des materiaux de construction avec des operations ciment et granulats au Maroc", ["genie-civil", "genie-mecanique", "environnement"], 30],
  ["Ciments du Maroc", "Building Materials", "Materiaux de Construction", "Casablanca", "Casablanca", "https://www.cimentsdumaroc.com", "Major Moroccan cement producer and HeidelbergCement subsidiary", "Grand producteur marocain de ciment et filiale de HeidelbergCement", ["genie-civil", "genie-mecanique"], 20],
  ["Sonasid", "Steel", "Siderurgie", "Casablanca", "Casablanca", "https://www.sonasid.ma", "Leading Moroccan steel producer supplying construction and industrial sectors", "Premier producteur marocain d'acier approvisionnant les secteurs de la construction et de l'industrie", ["genie-mecanique", "genie-industriel"], 15],
  ["Super Cerame", "Building Materials", "Materiaux de Construction", "Kenitra", "Kenitra", "https://www.supercerame.com", "Leading Moroccan ceramic tile manufacturer", "Premier fabricant marocain de carreaux de ceramique", ["genie-mecanique", "genie-industriel", "design"], 12],
  ["Stroc Industrie", "Steel Construction", "Construction Metallique", "Casablanca", "Casablanca", "https://www.strocindustrie.com", "Moroccan steel construction and industrial equipment company", "Societe marocaine de construction metallique et d'equipements industriels", ["genie-mecanique", "genie-civil"], 15],
  ["Delattre Levivier Maroc", "Steel Construction", "Construction Metallique", "Casablanca", "Casablanca", "https://www.dlm.ma", "Moroccan industrial group specializing in steel structures and pressure vessels", "Groupe industriel marocain specialise dans les structures metalliques et les appareils a pression", ["genie-mecanique", "genie-industriel"], 12],

  // === MINING & HEAVY INDUSTRY ===
  ["OCP Group", "Mining & Chemicals", "Mines et Chimie", "Casablanca", "Casablanca", "https://www.ocpgroup.ma", "World's largest phosphate exporter and major fertilizer producer", "Plus grand exportateur mondial de phosphates et grand producteur d'engrais", ["genie-mecanique", "genie-industriel", "genie-electrique", "environnement"], 100],
  ["Managem Group", "Mining", "Mines", "Casablanca", "Casablanca", "https://www.managemgroup.com", "Moroccan mining group extracting precious and base metals across Africa", "Groupe minier marocain extrayant des metaux precieux et de base a travers l'Afrique", ["genie-mecanique", "genie-civil", "environnement"], 30],
  ["REMINEX", "Mining Engineering", "Ingenierie Miniere", "Marrakech", "Marrakech", "https://www.managemgroup.com", "Managem subsidiary providing mining engineering and R&D services", "Filiale de Managem fournissant des services d'ingenierie miniere et de R&D", ["genie-mecanique", "genie-civil"], 15],
  ["Compagnie Miniere de Touissit (CMT)", "Mining", "Mines", "Oujda", "Oujda", "https://www.cmt.ma", "Moroccan mining company extracting lead, zinc and silver", "Societe miniere marocaine extrayant du plomb, du zinc et de l'argent", ["genie-mecanique", "genie-civil", "environnement"], 12],
  ["ONHYM", "Hydrocarbons & Mining", "Hydrocarbures et Mines", "Rabat", "Rabat", "https://www.onhym.com", "National office managing hydrocarbon and mining exploration in Morocco", "Office national gerant l'exploration des hydrocarbures et des mines au Maroc", ["genie-mecanique", "genie-civil", "environnement"], 20],
  ["Maghreb Steel", "Steel", "Siderurgie", "Casablanca", "Casablanca", "https://www.maghrebsteel.ma", "Moroccan flat steel producer and leading galvanized steel manufacturer", "Producteur marocain d'acier plat et leader de l'acier galvanise", ["genie-mecanique", "genie-industriel"], 15],
  ["Maghreb Oxygene", "Industrial Gases", "Gaz Industriels", "Casablanca", "Casablanca", "https://www.maghreboxygene.ma", "Moroccan producer and distributor of industrial and medical gases", "Producteur et distributeur marocain de gaz industriels et medicaux", ["genie-mecanique", "genie-industriel"], 10],
  ["SNEP", "Petrochemicals", "Petrochimie", "Casablanca", "Casablanca", "https://www.snep.ma", "Moroccan petrochemical company producing PVC, caustic soda and chlorine", "Societe petrochimique marocaine produisant du PVC, de la soude caustique et du chlore", ["genie-mecanique", "genie-industriel", "environnement"], 10],

  // === FOOD & AGRICULTURE ===
  ["Cosumar", "Sugar Industry", "Industrie Sucriere", "Casablanca", "Casablanca", "https://www.cosumar.co.ma", "Morocco's sole sugar producer processing cane and beet sugar", "Seul producteur marocain de sucre transformant la canne et la betterave", ["genie-industriel", "agriculture", "logistique"], 25],
  ["Centrale Danone", "Dairy", "Produits Laitiers", "Casablanca", "Casablanca", "https://www.centraledanone.com", "Leading dairy company in Morocco, subsidiary of Danone Group", "Leader des produits laitiers au Maroc, filiale du Groupe Danone", ["genie-industriel", "marketing", "logistique"], 30],
  ["Lesieur Cristal", "Edible Oils", "Huiles Alimentaires", "Casablanca", "Casablanca", "https://www.lesieurchristal.ma", "Leading Moroccan producer of edible oils, soaps and personal care products", "Premier producteur marocain d'huiles alimentaires, savons et produits d'hygiene", ["genie-industriel", "marketing", "logistique"], 20],
  ["Nestle Morocco", "Food & Beverage", "Agroalimentaire", "Casablanca", "Casablanca", "https://www.nestle.ma", "Swiss food giant with coffee, dairy and culinary products in Morocco", "Geant alimentaire suisse avec cafe, produits laitiers et culinaires au Maroc", ["genie-industriel", "marketing", "logistique"], 25],
  ["Coca-Cola Morocco", "Beverages", "Boissons", "Casablanca", "Casablanca", "https://www.coca-cola.ma", "Global beverage company with bottling and distribution operations in Morocco", "Societe mondiale de boissons avec des operations d'embouteillage et de distribution au Maroc", ["genie-industriel", "marketing", "logistique"], 20],
  ["Unilever Morocco", "FMCG", "Biens de Consommation", "Casablanca", "Casablanca", "https://www.unilever.com/ma", "Global FMCG company with food, personal care and home care brands in Morocco", "Societe mondiale de biens de consommation avec des marques alimentaires et d'hygiene au Maroc", ["marketing", "logistique", "management"], 18],
  ["Procter & Gamble Morocco", "FMCG", "Biens de Consommation", "Casablanca", "Casablanca", "https://www.pg.com/ma", "American consumer goods company with home care and baby care products in Morocco", "Societe americaine de biens de consommation avec des produits menagers et pour bebes au Maroc", ["marketing", "logistique", "genie-industriel"], 15],
  ["L'Oreal Morocco", "Cosmetics", "Cosmetiques", "Casablanca", "Casablanca", "https://www.loreal.com/ma", "French cosmetics giant with beauty brands distributed across Morocco", "Geant francais des cosmetiques avec des marques de beaute distribues a travers le Maroc", ["marketing", "commerce"], 12],
  ["Groupe Koutoubia", "Meat Processing", "Transformation de Viande", "Casablanca", "Casablanca", "https://www.groupekoutoubia.ma", "Leading Moroccan processed meat and poultry group", "Groupe leader marocain de viande transformee et de volaille", ["genie-industriel", "logistique", "agriculture"], 20],
  ["Copag", "Dairy & Agriculture", "Laitier et Agriculture", "Taroudant", "Taroudant", "https://www.copag.ma", "Major Moroccan agricultural cooperative producing dairy, citrus and olive oil", "Grande cooperative agricole marocaine produisant lait, agrumes et huile d'olive", ["agriculture", "genie-industriel", "logistique"], 20],
  ["Dari Couspate", "Food Processing", "Agroalimentaire", "Casablanca", "Casablanca", "https://www.daricouspate.com", "Leading Moroccan pasta and couscous manufacturer", "Premier fabricant marocain de pates et couscous", ["genie-industriel", "logistique"], 12],
  ["Les Domaines Agricoles", "Agriculture", "Agriculture", "Meknes", "Meknes", "https://www.lesdomainesagricoles.com", "Royal agricultural company producing premium fruits, vegetables and wines", "Societe agricole royale produisant des fruits, legumes et vins premium", ["agriculture", "management", "logistique"], 25],
  ["Groupe Zalar", "Agribusiness", "Agro-industrie", "Casablanca", "Casablanca", "https://www.zalar.ma", "Moroccan agri-food group covering poultry, dairy and agriculture", "Groupe agro-alimentaire marocain couvrant la volaille, les produits laitiers et l'agriculture", ["agriculture", "genie-industriel", "logistique"], 20],
  ["Colorado (Peintures)", "Paint Manufacturing", "Fabrication de Peintures", "Casablanca", "Casablanca", "https://www.colorado.ma", "Leading Moroccan paint and coatings manufacturer", "Premier fabricant marocain de peintures et revetements", ["genie-industriel", "genie-mecanique", "marketing"], 12],

  // === RETAIL ===
  ["Marjane Group", "Retail", "Grande Distribution", "Casablanca", "Casablanca", "https://www.marjane.ma", "Leading Moroccan hypermarket chain with 100+ stores nationwide", "Chaine d'hypermarches marocaine leader avec 100+ magasins a travers le pays", ["commerce", "logistique", "management"], 50],
  ["Label'Vie Group", "Retail", "Grande Distribution", "Rabat", "Rabat", "https://www.labelvie.ma", "Moroccan retail group operating Carrefour-branded supermarkets and hypermarkets", "Groupe marocain de distribution operant des supermarches et hypermarches Carrefour", ["commerce", "logistique", "management"], 40],
  ["BIM Morocco", "Discount Retail", "Distribution Discount", "Casablanca", "Casablanca", "https://www.bim.ma", "Turkish discount retailer with 600+ stores across Morocco", "Distributeur discount turc avec 600+ magasins a travers le Maroc", ["commerce", "logistique"], 35],
  ["Acima (Marjane)", "Supermarket", "Supermarche", "Casablanca", "Casablanca", "https://www.acima.ma", "Moroccan supermarket chain, subsidiary of Marjane Group", "Chaine de supermarches marocaine, filiale du Groupe Marjane", ["commerce", "logistique"], 25],
  ["Decathlon Morocco", "Sports Retail", "Distribution Sportive", "Casablanca", "Casablanca", "https://www.decathlon.ma", "French sports retailer with growing presence across major Moroccan cities", "Distributeur sportif francais avec une presence croissante dans les grandes villes marocaines", ["commerce", "logistique", "marketing"], 20],
  ["IKEA Morocco", "Home Furnishing", "Ameublement", "Casablanca", "Casablanca", "https://www.ikea.com/ma", "Swedish home furnishing retailer with stores in Casablanca and Marrakech", "Distributeur suedois d'ameublement avec des magasins a Casablanca et Marrakech", ["commerce", "logistique", "design"], 15],
  ["Kitea", "Furniture Retail", "Ameublement", "Casablanca", "Casablanca", "https://www.kitea.ma", "Leading Moroccan furniture and home decor retailer with 30+ stores", "Distributeur marocain leader de meubles et decoration avec 30+ magasins", ["commerce", "design", "logistique"], 18],
  ["Zara Morocco (Inditex)", "Fashion Retail", "Mode", "Casablanca", "Casablanca", "https://www.zara.com/ma", "Spanish fashion retailer with premium stores in major Moroccan malls", "Distributeur de mode espagnol avec des magasins premium dans les grands centres commerciaux marocains", ["commerce", "marketing"], 12],
  ["Marwa (Tazi Group)", "Fashion Retail", "Mode", "Casablanca", "Casablanca", "https://www.marwa.ma", "Leading Moroccan women's fashion brand with 100+ stores", "Marque de mode feminine marocaine leader avec 100+ magasins", ["commerce", "marketing", "design"], 15],

  // === TRANSPORT & LOGISTICS ===
  ["ONCF", "Railways", "Chemins de Fer", "Rabat", "Rabat", "https://www.oncf.ma", "Morocco's national railway operator running conventional and high-speed (Al Boraq) trains", "Operateur ferroviaire national du Maroc gerant les trains conventionnels et a grande vitesse (Al Boraq)", ["genie-mecanique", "genie-electrique", "logistique"], 40],
  ["Royal Air Maroc (RAM)", "Aviation", "Aviation", "Casablanca", "Casablanca", "https://www.royalairmaroc.com", "Morocco's national airline connecting the kingdom to 100+ destinations worldwide", "Compagnie aerienne nationale du Maroc connectant le royaume a 100+ destinations mondiales", ["logistique", "management", "tourisme"], 35],
  ["Tanger Med Port Authority", "Port Management", "Gestion Portuaire", "Tanger", "Tanger", "https://www.tangermed.ma", "Operator of Africa's largest port complex handling 7M+ containers annually", "Operateur du plus grand complexe portuaire d'Afrique traitant 7M+ conteneurs par an", ["logistique", "genie-civil", "management"], 30],
  ["Marsa Maroc", "Port Services", "Services Portuaires", "Casablanca", "Casablanca", "https://www.marsamaroc.co.ma", "Major Moroccan port operator managing terminals across the kingdom", "Grand operateur portuaire marocain gerant des terminaux a travers le royaume", ["logistique", "genie-mecanique", "management"], 25],
  ["CTM Transport", "Bus Transport", "Transport par Bus", "Casablanca", "Casablanca", "https://www.ctm.ma", "Morocco's leading intercity bus company with premium coach services", "Premiere societe marocaine de transport interurbain par bus avec des services premium", ["logistique", "management"], 15],
  ["ADM (Autoroutes du Maroc)", "Highways", "Autoroutes", "Rabat", "Rabat", "https://www.adm.co.ma", "National highway authority managing 1,800+ km of toll motorways", "Autorite nationale des autoroutes gerant 1,800+ km d'autoroutes a peage", ["genie-civil", "management", "genie-electrique"], 20],
  ["ONDA (Airports Authority)", "Airports", "Aeroports", "Casablanca", "Casablanca", "https://www.onda.ma", "National airports authority managing Morocco's 25+ airports", "Autorite nationale des aeroports gerant les 25+ aeroports du Maroc", ["logistique", "genie-civil", "management"], 25],
  ["CMA CGM Morocco", "Shipping", "Transport Maritime", "Tanger", "Tanger", "https://www.cmacgm.com", "French shipping giant with container services connecting Morocco to global markets", "Geant francais du transport maritime avec des services de conteneurs connectant le Maroc aux marches mondiaux", ["logistique", "commerce"], 15],
  ["SDTM", "Freight Transport", "Transport de Marchandises", "Casablanca", "Casablanca", "https://www.sdtm.ma", "Moroccan freight transport company serving industrial and commercial clients", "Societe marocaine de transport de marchandises au service des clients industriels et commerciaux", ["logistique", "management"], 12],
  ["DHL Supply Chain Morocco", "Logistics", "Logistique", "Casablanca", "Casablanca", "https://www.dhl.com/ma", "Global logistics provider with warehousing and supply chain solutions in Morocco", "Fournisseur mondial de logistique avec des solutions d'entreposage et de supply chain au Maroc", ["logistique", "management"], 20],
  ["Maersk Morocco", "Shipping & Logistics", "Transport Maritime et Logistique", "Tanger", "Tanger", "https://www.maersk.com", "Danish shipping and logistics company with Moroccan port operations", "Societe danoise de transport maritime et logistique avec des operations portuaires marocaines", ["logistique", "commerce"], 12],
  ["TMSA (Tanger Med Agency)", "Port Development", "Developpement Portuaire", "Tanger", "Tanger", "https://www.tmsa.ma", "Special agency developing and managing the Tanger Med industrial platform", "Agence speciale developpant et gerant la plateforme industrielle Tanger Med", ["management", "logistique", "genie-civil"], 20],

  // === PHARMA & HEALTHCARE ===
  ["Sanofi Morocco", "Pharmaceuticals", "Pharmacie", "Casablanca", "Casablanca", "https://www.sanofi.ma", "French pharmaceutical giant with manufacturing and R&D operations in Morocco", "Geant pharmaceutique francais avec des operations de fabrication et R&D au Maroc", ["pharmacie", "genie-industriel", "medecine"], 25],
  ["Cooper Pharma", "Pharmaceuticals", "Pharmacie", "Casablanca", "Casablanca", "https://www.cooperpharma.com", "Leading Moroccan pharmaceutical company manufacturing generic and branded medicines", "Societe pharmaceutique marocaine leader fabricant des medicaments generiques et de marque", ["pharmacie", "genie-industriel"], 20],
  ["Pharma 5", "Pharmaceuticals", "Pharmacie", "Casablanca", "Casablanca", "https://www.pharma5.ma", "Moroccan pharmaceutical group with international presence and R&D capabilities", "Groupe pharmaceutique marocain avec une presence internationale et des capacites de R&D", ["pharmacie", "genie-industriel"], 18],
  ["SOTHEMA", "Pharmaceuticals", "Pharmacie", "Casablanca", "Casablanca", "https://www.sothema.com", "Major Moroccan pharmaceutical company producing biologics and vaccines", "Grande societe pharmaceutique marocaine produisant des biologiques et des vaccins", ["pharmacie", "genie-industriel", "medecine"], 20],
  ["Laprophan", "Pharmaceuticals", "Pharmacie", "Casablanca", "Casablanca", "https://www.laprophan.ma", "Moroccan pharmaceutical company specializing in dermatology and gastroenterology", "Societe pharmaceutique marocaine specialisee en dermatologie et gastroenterologie", ["pharmacie", "genie-industriel"], 12],
  ["Biopharma", "Biopharmaceuticals", "Biopharmaceutique", "Casablanca", "Casablanca", "https://www.biopharma.ma", "Moroccan biopharmaceutical company producing plasma-derived medicines", "Societe biopharmaceutique marocaine produisant des medicaments derives du plasma", ["pharmacie", "medecine", "genie-industriel"], 15],
  ["Galenica Groupe", "Pharmaceuticals", "Pharmacie", "Casablanca", "Casablanca", "https://www.galenica.ma", "Moroccan pharmaceutical group with diverse portfolio of generic medicines", "Groupe pharmaceutique marocain avec un portefeuille diversifie de medicaments generiques", ["pharmacie", "genie-industriel"], 10],
  ["GSK Morocco", "Pharmaceuticals", "Pharmacie", "Casablanca", "Casablanca", "https://www.gsk.com/ma", "British pharma company with consumer healthcare and vaccine presence in Morocco", "Societe pharmaceutique britannique avec une presence en sante grand public et vaccins au Maroc", ["pharmacie", "marketing"], 10],
  ["Pfizer Morocco", "Pharmaceuticals", "Pharmacie", "Casablanca", "Casablanca", "https://www.pfizer.com/ma", "American pharmaceutical company providing innovative medicines in Morocco", "Societe pharmaceutique americaine fournissant des medicaments innovants au Maroc", ["pharmacie", "medecine"], 8],
  ["Novartis Morocco", "Pharmaceuticals", "Pharmacie", "Casablanca", "Casablanca", "https://www.novartis.com/ma", "Swiss pharmaceutical company with prescription and generic drug operations", "Societe pharmaceutique suisse avec des operations de medicaments sur ordonnance et generiques", ["pharmacie", "medecine"], 8],
  ["CHU Mohammed VI", "Healthcare", "Sante", "Marrakech", "Marrakech", "https://www.chu-marrakech.ma", "Major university hospital center in Marrakech providing tertiary care", "Centre hospitalier universitaire majeur a Marrakech fournissant des soins tertiaires", ["medecine", "pharmacie"], 30],
  ["CHU Ibn Sina", "Healthcare", "Sante", "Rabat", "Rabat", "https://www.chu-ibnsina.ma", "Rabat's primary university hospital providing specialized medical care", "Principal hopital universitaire de Rabat fournissant des soins medicaux specialises", ["medecine", "pharmacie"], 28],
  ["Groupe Akdital", "Private Healthcare", "Sante Privee", "Casablanca", "Casablanca", "https://www.akdital.ma", "Morocco's largest private hospital group with 20+ clinics nationwide", "Plus grand groupe hospitalier prive du Maroc avec 20+ cliniques a travers le pays", ["medecine", "management", "pharmacie"], 40],

  // === EDUCATION & RESEARCH ===
  ["UM6P (Mohammed VI Polytechnic)", "Higher Education", "Enseignement Superieur", "Ben Guerir", "Ben Guerir", "https://www.um6p.ma", "World-class research university focused on mining, agriculture and AI", "Universite de recherche de classe mondiale axee sur les mines, l'agriculture et l'IA", ["genie-informatique", "agriculture", "environnement"], 30],
  ["EMSI", "Engineering School", "Ecole d'Ingenieurs", "Casablanca", "Casablanca", "https://www.emsi.ma", "Leading Moroccan private engineering school with 12 campuses", "Ecole d'ingenieurs privee marocaine leader avec 12 campus", ["genie-informatique", "genie-civil", "genie-electrique"], 20],
  ["Universite Al Akhawayn", "Higher Education", "Enseignement Superieur", "Ifrane", "Ifrane", "https://www.aui.ma", "Moroccan English-language university modeled on the American system", "Universite marocaine anglophone modelee sur le systeme americain", ["management", "genie-informatique"], 15],
  ["ISCAE", "Business School", "Ecole de Commerce", "Casablanca", "Casablanca", "https://www.iscae.ma", "Morocco's premier public business school training future business leaders", "Premiere ecole de commerce publique du Maroc formant les futurs leaders d'entreprise", ["management", "finance", "marketing"], 10],
  ["CNRST", "Scientific Research", "Recherche Scientifique", "Rabat", "Rabat", "https://www.cnrst.ma", "National center coordinating scientific and technical research in Morocco", "Centre national coordonnant la recherche scientifique et technique au Maroc", ["genie-informatique", "environnement"], 12],

  // === GOVERNMENT & PUBLIC SECTOR ===
  ["ANAPEC", "Employment Agency", "Agence pour l'Emploi", "Casablanca", "Casablanca", "https://www.anapec.org", "National employment promotion agency connecting job seekers with employers", "Agence nationale de promotion de l'emploi connectant les demandeurs d'emploi aux employeurs", ["ressources-humaines", "management"], 20],
  ["CDG Group", "Public Investment", "Investissement Public", "Rabat", "Rabat", "https://www.cdg.ma", "Morocco's major institutional investor managing pension funds and public projects", "Grand investisseur institutionnel du Maroc gerant les fonds de pension et les projets publics", ["finance", "management", "genie-civil"], 25],
  ["AMDIE", "Investment Promotion", "Promotion des Investissements", "Rabat", "Rabat", "https://www.amdie.gov.ma", "Moroccan agency for trade development, investment and digital economy", "Agence marocaine pour le developpement du commerce, de l'investissement et de l'economie numerique", ["commerce", "management", "genie-informatique"], 12],
  ["ADD (Digital Development Agency)", "Digital Government", "Gouvernement Digital", "Rabat", "Rabat", "https://www.add.gov.ma", "Agency driving Morocco's digital transformation and e-government strategy", "Agence pilotant la transformation digitale et la strategie e-gouvernement du Maroc", ["genie-informatique", "management"], 15],
  ["ANRT", "Telecom Regulation", "Regulation Telecom", "Rabat", "Rabat", "https://www.anrt.ma", "National telecommunications regulatory agency of Morocco", "Agence nationale de reglementation des telecommunications du Maroc", ["genie-electrique", "genie-informatique", "droit"], 10],
  ["OMPIC", "Industrial Property", "Propriete Industrielle", "Casablanca", "Casablanca", "https://www.ompic.ma", "Moroccan office for industrial and commercial property protection", "Office marocain pour la protection de la propriete industrielle et commerciale", ["droit", "management"], 8],
  ["HCP (Statistics)", "Statistics", "Statistiques", "Rabat", "Rabat", "https://www.hcp.ma", "High Commission for Planning managing national statistics and census", "Haut-Commissariat au Plan gerant les statistiques nationales et le recensement", ["genie-informatique", "management"], 12],
  ["Bank Al-Maghrib (Banque Centrale)", "Central Banking", "Banque Centrale", "Rabat", "Rabat", "https://www.bkam.ma", "Morocco's central bank responsible for monetary policy", "Banque centrale du Maroc responsable de la politique monetaire", ["finance", "genie-informatique"], 15],
  ["CNSS", "Social Security", "Securite Sociale", "Casablanca", "Casablanca", "https://www.cnss.ma", "National social security fund managing pensions and healthcare coverage", "Caisse nationale de securite sociale gerant les retraites et la couverture sante", ["finance", "management", "genie-informatique"], 25],

  // === MEDIA & COMMUNICATION ===
  ["2M Television", "Media", "Medias", "Casablanca", "Casablanca", "https://www.2m.ma", "Morocco's second national television channel with news and entertainment", "Deuxieme chaine de television nationale du Maroc avec information et divertissement", ["communication", "design", "genie-informatique"], 15],
  ["SNRT (Radio Television)", "Broadcasting", "Audiovisuel", "Rabat", "Rabat", "https://www.snrt.ma", "Moroccan national broadcasting corporation operating TV and radio channels", "Societe nationale marocaine de radiodiffusion operant des chaines TV et radio", ["communication", "design"], 18],
  ["Maroc Hebdo", "Print Media", "Presse Ecrite", "Casablanca", "Casablanca", "https://www.maroc-hebdo.press.ma", "Leading Moroccan weekly news magazine covering politics and economics", "Premier magazine hebdomadaire marocain couvrant la politique et l'economie", ["communication"], 8],
  ["Medias24", "Digital Media", "Medias Digitaux", "Casablanca", "Casablanca", "https://www.medias24.com", "Leading Moroccan digital news platform covering business and economy", "Plateforme d'information digitale marocaine leader couvrant les affaires et l'economie", ["communication", "genie-informatique"], 10],

  // === HOSPITALITY & TOURISM ===
  ["ONMT (Tourism Board)", "Tourism", "Tourisme", "Rabat", "Rabat", "https://www.visitmorocco.com", "National tourism board promoting Morocco as a global travel destination", "Office national du tourisme promouvant le Maroc comme destination de voyage mondiale", ["tourisme", "marketing", "communication"], 15],
  ["Accor Hotels Morocco", "Hospitality", "Hotellerie", "Casablanca", "Casablanca", "https://www.accor.com/ma", "French hotel group operating Sofitel, Pullman and Ibis brands across Morocco", "Groupe hotelier francais operant les marques Sofitel, Pullman et Ibis a travers le Maroc", ["tourisme", "management"], 30],
  ["Marriott Morocco", "Hospitality", "Hotellerie", "Marrakech", "Marrakech", "https://www.marriott.com", "American hotel chain with luxury properties in Marrakech, Rabat and Casablanca", "Chaine hoteliere americaine avec des proprietes de luxe a Marrakech, Rabat et Casablanca", ["tourisme", "management"], 20],
  ["Four Seasons Morocco", "Luxury Hospitality", "Hotellerie de Luxe", "Marrakech", "Marrakech", "https://www.fourseasons.com/marrakech", "Ultra-luxury hotel brand with properties in Marrakech and Casablanca", "Marque hoteliere ultra-luxe avec des proprietes a Marrakech et Casablanca", ["tourisme", "management"], 15],
  ["Mazagan Beach Resort", "Resort", "Complexe Touristique", "El Jadida", "El Jadida", "https://www.mazaganbeachresort.com", "Premium beach resort offering golf, spa and entertainment in El Jadida", "Complexe balneaire premium offrant golf, spa et divertissement a El Jadida", ["tourisme", "management"], 15],

  // === ELECTRONICS & MANUFACTURING ===
  ["STMicroelectronics Morocco", "Semiconductors", "Semi-conducteurs", "Casablanca", "Casablanca", "https://www.st.com", "European semiconductor company with chip design and testing in Morocco", "Societe europeenne de semi-conducteurs avec conception et test de puces au Maroc", ["genie-electrique", "genie-informatique"], 20],
  ["Schneider Electric Morocco", "Electrical Equipment", "Equipements Electriques", "Casablanca", "Casablanca", "https://www.se.com/ma", "French multinational providing energy management and automation solutions", "Multinationale francaise fournissant des solutions de gestion de l'energie et d'automatisation", ["genie-electrique", "genie-industriel"], 25],
  ["Siemens Morocco", "Industrial Technology", "Technologie Industrielle", "Casablanca", "Casablanca", "https://www.siemens.com/ma", "German industrial technology group with energy, healthcare and infrastructure solutions", "Groupe technologique industriel allemand avec des solutions energie, sante et infrastructure", ["genie-electrique", "genie-mecanique", "genie-industriel"], 20],
  ["ABB Morocco", "Electrification", "Electrification", "Casablanca", "Casablanca", "https://global.abb/group/en", "Swiss-Swedish company providing electrification and automation technology", "Societe suisse-suedoise fournissant des technologies d'electrification et d'automatisation", ["genie-electrique", "genie-industriel"], 15],
  ["Nexans Morocco", "Cable Manufacturing", "Fabrication de Cables", "Casablanca", "Casablanca", "https://www.nexans.ma", "French cable manufacturer producing power and telecom cables in Morocco", "Fabricant francais de cables produisant des cables d'energie et de telecom au Maroc", ["genie-electrique", "genie-industriel"], 15],
  ["Leoni Wiring Morocco", "Wiring Systems", "Systemes de Cablage", "Casablanca", "Casablanca", "https://www.leoni.com", "German wiring systems company with automotive cable production in Morocco", "Societe allemande de systemes de cablage avec production de cables automobiles au Maroc", ["genie-electrique", "genie-industriel"], 25],
  ["Atlas Copco Morocco", "Industrial Equipment", "Equipements Industriels", "Casablanca", "Casablanca", "https://www.atlascopco.com/ma-fr", "Swedish manufacturer of compressors and industrial equipment for Morocco", "Fabricant suedois de compresseurs et d'equipements industriels pour le Maroc", ["genie-mecanique", "genie-industriel"], 10],
  ["Saint-Gobain Morocco", "Building Materials", "Materiaux de Construction", "Casablanca", "Casablanca", "https://www.saint-gobain.ma", "French multinational providing glass, insulation and building materials", "Multinationale francaise fournissant verre, isolation et materiaux de construction", ["genie-civil", "genie-mecanique"], 15],
  ["Vinci Energies Morocco", "Energy Services", "Services Energetiques", "Casablanca", "Casablanca", "https://www.vinci-energies.ma", "French company providing energy and information technology services", "Societe francaise fournissant des services d'energie et de technologie de l'information", ["genie-electrique", "genie-informatique"], 20],

  // === TEXTILES & FASHION ===
  ["Fruit of the Loom Morocco", "Textiles", "Textile", "Casablanca", "Casablanca", "https://www.fotlinc.com", "American apparel company with garment manufacturing in Morocco", "Societe americaine de vetements avec fabrication de confection au Maroc", ["genie-industriel", "logistique"], 30],
  ["SINTEX Morocco", "Textiles", "Textile", "Casablanca", "Casablanca", "https://www.sintex-np.com", "Moroccan textile company producing for international fashion brands", "Societe textile marocaine produisant pour les marques de mode internationales", ["genie-industriel", "design"], 20],
  ["Florentaise Morocco", "Horticulture", "Horticulture", "Kenitra", "Kenitra", "https://www.florentaise.com", "French horticultural substrate company with Moroccan production facility", "Societe francaise de substrats horticoles avec une usine de production au Maroc", ["agriculture", "environnement"], 8],

  // === HOLDING COMPANIES & CONGLOMERATES ===
  ["Akwa Group", "Conglomerate", "Conglomerat", "Casablanca", "Casablanca", "https://www.akwagroup.com", "Major Moroccan conglomerate in energy, gas and real estate sectors", "Grand conglomerat marocain dans les secteurs de l'energie, du gaz et de l'immobilier", ["management", "finance", "commerce"], 20],
  ["Ynna Holding", "Conglomerate", "Conglomerat", "Casablanca", "Casablanca", "https://www.ynnaholding.com", "Moroccan conglomerate with interests in real estate, distribution and industry", "Conglomerat marocain avec des interets dans l'immobilier, la distribution et l'industrie", ["management", "finance", "commerce"], 25],
  ["Saham Group", "Financial Services", "Services Financiers", "Casablanca", "Casablanca", "https://www.sahamfinances.com", "Moroccan group with insurance, healthcare and outsourcing operations across Africa", "Groupe marocain avec des operations d'assurance, sante et externalisation a travers l'Afrique", ["finance", "management"], 20],
  ["Wana Corporate (Inwi Group)", "Telecoms Holding", "Holding Telecoms", "Rabat", "Rabat", "https://www.wana.ma", "Holding company managing Inwi telecom brand and digital services", "Holding gerant la marque telecom Inwi et les services digitaux", ["genie-informatique", "genie-electrique", "management"], 20],

  // === INTERNATIONAL ORGANIZATIONS ===
  ["World Bank Morocco", "Development", "Developpement", "Rabat", "Rabat", "https://www.worldbank.org/en/country/morocco", "International development institution supporting Morocco's reform agenda", "Institution internationale de developpement soutenant l'agenda de reformes du Maroc", ["finance", "management", "environnement"], 10],
  ["UNDP Morocco", "Development", "Developpement", "Rabat", "Rabat", "https://www.undp.org/morocco", "UN development program supporting sustainable development goals in Morocco", "Programme de developpement de l'ONU soutenant les objectifs de developpement durable au Maroc", ["management", "environnement"], 8],
  ["GIZ Morocco", "Development Cooperation", "Cooperation au Developpement", "Rabat", "Rabat", "https://www.giz.de/en/worldwide/342.html", "German development agency supporting governance and renewable energy projects", "Agence allemande de developpement soutenant les projets de gouvernance et d'energies renouvelables", ["management", "environnement", "genie-electrique"], 12],
  ["AFD Morocco", "Development Finance", "Finance du Developpement", "Rabat", "Rabat", "https://www.afd.fr/fr/pays/maroc", "French development agency financing urban, energy and education projects", "Agence francaise de developpement financant des projets urbains, energetiques et educatifs", ["finance", "management", "genie-civil"], 8],

  // === ADDITIONAL TECH & DIGITAL ===
  ["Amazon (AWS) Morocco", "Cloud Services", "Services Cloud", "Casablanca", "Casablanca", "https://aws.amazon.com", "Amazon Web Services cloud computing platform supporting Moroccan businesses", "Plateforme de cloud computing Amazon Web Services soutenant les entreprises marocaines", ["genie-informatique"], 15],
  ["Ubisoft Casablanca", "Video Games", "Jeux Video", "Casablanca", "Casablanca", "https://www.ubisoft.com", "French video game company with mobile game development studio in Casablanca", "Societe francaise de jeux video avec un studio de developpement de jeux mobiles a Casablanca", ["genie-informatique", "design"], 20],
  ["Altran Morocco (Capgemini Engineering)", "Engineering Services", "Services d'Ingenierie", "Casablanca", "Casablanca", "https://www.capgemini.com/service/capgemini-engineering", "Global engineering and R&D services company with Moroccan delivery center", "Societe mondiale de services d'ingenierie et R&D avec un centre de livraison marocain", ["genie-informatique", "genie-mecanique", "genie-electrique"], 30],
  ["CMI (Centre Monetique Interbancaire)", "Payment Systems", "Systemes de Paiement", "Casablanca", "Casablanca", "https://www.cmi.co.ma", "Moroccan interbank payment center processing card transactions nationwide", "Centre marocain de paiement interbancaire traitant les transactions par carte a l'echelle nationale", ["genie-informatique", "finance"], 15],
  ["Hmizate (Hmall)", "E-commerce", "Commerce Electronique", "Casablanca", "Casablanca", "https://www.hmizate.ma", "Moroccan deal and e-commerce platform offering discounted products", "Plateforme marocaine de deals et e-commerce offrant des produits a prix reduits", ["genie-informatique", "marketing", "commerce"], 10],
  ["Suez Morocco", "Water Management", "Gestion de l'Eau", "Casablanca", "Casablanca", "https://www.suez.com/ma", "French utility company managing water treatment and waste services in Morocco", "Societe francaise de services publics gerant le traitement de l'eau et les dechets au Maroc", ["genie-civil", "environnement"], 15],
  ["Veolia Morocco", "Environmental Services", "Services Environnementaux", "Tanger", "Tanger", "https://www.veolia.ma", "French environmental services company managing water and waste in Morocco", "Societe francaise de services environnementaux gerant l'eau et les dechets au Maroc", ["environnement", "genie-civil"], 20],
  ["ACWA Power Morocco", "Power Generation", "Production d'Electricite", "Casablanca", "Casablanca", "https://www.acwapower.com", "Saudi Arabian power developer behind Morocco's Noor solar complex", "Developpeur saoudien d'energie derriere le complexe solaire Noor au Maroc", ["genie-electrique", "environnement"], 12],
  ["Roche Morocco", "Pharmaceuticals", "Pharmacie", "Casablanca", "Casablanca", "https://www.roche.ma", "Swiss pharmaceutical and diagnostics company with Moroccan operations", "Societe pharmaceutique et diagnostique suisse avec des operations marocaines", ["pharmacie", "medecine"], 8],
  ["AstraZeneca Morocco", "Pharmaceuticals", "Pharmacie", "Casablanca", "Casablanca", "https://www.astrazeneca.com", "British-Swedish pharma company providing oncology and respiratory medicines in Morocco", "Societe pharmaceutique britannico-suedoise fournissant des medicaments en oncologie et pneumologie au Maroc", ["pharmacie", "medecine"], 6],
];

async function main() {
  const client = new Client(DATABASE_URL);
  await client.connect();
  console.log("Connected to PostgreSQL");

  // Get existing employer names to avoid duplicates
  const existingResult = await client.query("SELECT name FROM career_employer");
  const existingNames = new Set(existingResult.rows.map((r) => r.name));
  console.log(`Found ${existingNames.size} existing employers`);

  // Get max sort_order
  const sortResult = await client.query("SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM career_employer");
  let sortOrder = Math.max(Number(sortResult.rows[0].max_sort) + 1, 300);
  console.log(`Starting sort_order at ${sortOrder}`);

  const entries = [];

  for (const [name, sector, sectorFr, location, locationFr, website, description, descriptionFr, fields, openPositions] of EMPLOYERS_DATA) {
    // Skip if name already exists (exact match or close match)
    if (existingNames.has(name)) {
      console.log(`  SKIP (exists): ${name}`);
      continue;
    }

    entries.push({
      id: crypto.randomUUID(),
      name,
      sector,
      sector_fr: sectorFr,
      location,
      location_fr: locationFr,
      open_positions: openPositions,
      website,
      logo: null,
      description,
      description_fr: descriptionFr,
      fields: JSON.stringify(fields),
      is_active: true,
      sort_order: sortOrder++,
    });
  }

  console.log(`Prepared ${entries.length} new employers for insertion`);

  // Insert in batches of 20
  let inserted = 0;
  let skipped = 0;
  const batchSize = 20;

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const values = [];
    const params = [];
    let paramIndex = 1;

    for (const entry of batch) {
      const placeholders = [];
      for (let j = 0; j < 13; j++) {
        placeholders.push(`$${paramIndex++}`);
      }
      values.push(`(${placeholders.join(", ")})`);
      params.push(
        entry.id,
        entry.name,
        entry.sector,
        entry.sector_fr,
        entry.location,
        entry.location_fr,
        entry.open_positions,
        entry.website,
        entry.logo,
        entry.description,
        entry.description_fr,
        entry.fields,
        entry.sort_order,
      );
    }

    const query = `
      INSERT INTO career_employer (id, name, sector, sector_fr, location, location_fr, open_positions, website, logo, description, description_fr, fields, sort_order)
      VALUES ${values.join(",\n")}
      ON CONFLICT (id) DO NOTHING
    `;

    try {
      const result = await client.query(query, params);
      inserted += result.rowCount;
      if (result.rowCount < batch.length) {
        skipped += batch.length - result.rowCount;
      }
    } catch (err) {
      // If batch fails (e.g., name uniqueness), insert one by one
      console.log(`Batch ${Math.floor(i / batchSize) + 1} failed: ${err.message}`);
      console.log("  Inserting individually...");
      for (const entry of batch) {
        try {
          await client.query(
            `INSERT INTO career_employer (id, name, sector, sector_fr, location, location_fr, open_positions, website, logo, description, description_fr, fields, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
             ON CONFLICT (id) DO NOTHING`,
            [
              entry.id, entry.name, entry.sector, entry.sector_fr,
              entry.location, entry.location_fr, entry.open_positions,
              entry.website, entry.logo, entry.description, entry.description_fr,
              entry.fields, entry.sort_order,
            ],
          );
          inserted++;
        } catch (innerErr) {
          skipped++;
          if (innerErr.message.includes("unique")) {
            console.log(`    SKIP (unique): ${entry.name}`);
          } else {
            console.error(`    ERROR: ${entry.name}: ${innerErr.message}`);
          }
        }
      }
    }
  }

  // Final count
  const finalCount = await client.query("SELECT COUNT(*) FROM career_employer");
  console.log(`\n--- Employer Seed Results ---`);
  console.log(`Prepared:  ${entries.length}`);
  console.log(`Inserted:  ${inserted}`);
  console.log(`Skipped:   ${skipped}`);
  console.log(`Total employers now: ${finalCount.rows[0].count}`);

  // Show sector distribution
  const sectorDist = await client.query("SELECT sector, COUNT(*) as cnt FROM career_employer GROUP BY sector ORDER BY cnt DESC LIMIT 15");
  console.log(`\nTop sectors:`);
  for (const row of sectorDist.rows) {
    console.log(`  ${row.sector}: ${row.cnt}`);
  }

  // Show location distribution
  const locDist = await client.query("SELECT location, COUNT(*) as cnt FROM career_employer GROUP BY location ORDER BY cnt DESC LIMIT 10");
  console.log(`\nTop locations:`);
  for (const row of locDist.rows) {
    console.log(`  ${row.location}: ${row.cnt}`);
  }

  await client.end();
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
