import fs from "fs";

let po = fs.readFileSync("locales/fr-FR.po", "utf8");

const translations = {
  // Dashboard config
  "Calculator": "Calculateur",
  "Comparison": "Comparaison",
  "Projections": "Projections",
  "Generator": "Générateur",
  "Statistics": "Statistiques",
  "Print": "Imprimer",
  "Formal": "Formel",
  "Creative": "Créatif",
  "Technical": "Technique",
  "Executive": "Exécutif",
  "Scripts": "Scripts",
  "Checklist": "Liste de contrôle",
  "Practice": "Pratique",
  "Benchmarks": "Références",
  "Tips": "Conseils",
  "Questions": "Questions",
  "Timing": "Chronologie",
  "Quick Practice": "Pratique rapide",
  "Full Interview": "Entretien complet",
  "Topic Focus": "Focus thématique",
  "My Alerts": "Mes alertes",
  "Matches": "Correspondances",
  "History": "Historique",
  "Improvement": "Amélioration",
  "Headline": "Titre",
  "Analysis": "Analyse",
  "Connections": "Connexions",
  "Photo": "Photo",
  // Resume sections
  "Personal Details": "Informations personnelles",
  "Work Experience": "Expérience professionnelle",
  "Professional Summary": "Résumé professionnel",
  "Custom Fields": "Champs personnalisés",
  "Add a custom field": "Ajouter un champ personnalisé",
  // Interview
  "Interview Questions": "Questions d'entretien",
  "Interview Tips": "Conseils d'entretien",
  "Mock Interview": "Simulation d'entretien",
  "Interview Feedback": "Retour d'entretien",
  "Session History": "Historique des sessions",
  "Start Interview": "Commencer l'entretien",
  "End Interview": "Terminer l'entretien",
  "Evaluate Response": "Évaluer la réponse",
  "Generate Questions": "Générer des questions",
  // Career
  "Career Assessment": "Évaluation de carrière",
  "Career Roadmap": "Feuille de route de carrière",
  "Skill Gap Analysis": "Analyse des lacunes de compétences",
  "Career Coaching": "Coaching de carrière",
  "Career Transition": "Transition de carrière",
  "Market Insights": "Perspectives du marché",
  "Top Employers": "Meilleurs employeurs",
  "Career Pathways": "Parcours de carrière",
  // Tools
  "Cover Letter Generator": "Générateur de lettre de motivation",
  "Elevator Pitch": "Pitch d'ascenseur",
  "LinkedIn Optimizer": "Optimiseur LinkedIn",
  "Keyword Optimizer": "Optimiseur de mots-clés",
  "QR Code Generator": "Générateur de QR Code",
  "Data Export": "Export de données",
  // Networking
  "Colleague": "Collègue",
  "Mentor": "Mentor",
  "Recruiter": "Recruteur",
  "Hiring Manager": "Responsable du recrutement",
  "Alumni": "Ancien élève",
  "Network Map": "Carte du réseau",
  "Events": "Événements",
  "Messages": "Messages",
  // Jobs
  "Job Listings": "Offres d'emploi",
  "My Applications": "Mes candidatures",
  "Employers": "Employeurs",
  "AI Recommendations": "Recommandations IA",
  "Job Resources": "Ressources emploi",
  "Job Alerts": "Alertes emploi",
  // Admin
  "Reference Data": "Données de référence",
  "AI Providers": "Fournisseurs IA",
  "AI Quotas": "Quotas IA",
  "User Management": "Gestion des utilisateurs",
  // Auth
  "Sign In": "Se connecter",
  "Sign Up": "S'inscrire",
  "Forgot Password": "Mot de passe oublié",
  "Email Address": "Adresse e-mail",
  "Password": "Mot de passe",
  "Remember me": "Se souvenir de moi",
  "Create Account": "Créer un compte",
  "Already have an account?": "Vous avez déjà un compte ?",
  // Common actions
  "Loading resumes...": "Chargement des CV...",
  "No resumes found. Create one first.": "Aucun CV trouvé. Créez-en un d'abord.",
  "Job Description": "Description du poste",
  "optional - for keyword matching": "optionnel - pour la correspondance de mots-clés",
  "Analyze Resume": "Analyser le CV",
  "Select a resume": "Sélectionner un CV",
  // ATS
  "Overall ATS Score": "Score ATS global",
  "Section Scores": "Scores par section",
  "Missing Keywords": "Mots-clés manquants",
  "Found Keywords": "Mots-clés trouvés",
  "Morocco-Specific Tips": "Conseils spécifiques au Maroc",
  "Formatting Issues": "Problèmes de formatage",
  "Suggestions": "Suggestions",
  // Gallery
  "Featured Resumes": "CV en vedette",
  "Filter by Field": "Filtrer par domaine",
  "Filter by Experience": "Filtrer par expérience",
  "Filter by Language": "Filtrer par langue",
  "Filter by Template": "Filtrer par modèle",
  "ATS Score": "Score ATS",
  "years experience": "ans d'expérience",
  "Fresh Graduate": "Jeune diplômé",
  "Junior": "Junior",
  "Mid-Level": "Intermédiaire",
  "Senior": "Sénior",
  // Landing
  "Visit IMTA.MA": "Visiter IMTA.MA",
  "Explore Programs": "Explorer les programmes",
  "Empowering the next generation of Moroccan talent": "Former la prochaine génération de talents marocains",
  "Enter Your Details": "Entrez vos informations",
  "Export & Apply": "Exporter et postuler",
  // Misc
  "Coming Soon": "Bientôt disponible",
  "Not available": "Non disponible",
  "No data available": "Aucune donnée disponible",
  "Please wait...": "Veuillez patienter...",
  "Something went wrong": "Une erreur s'est produite",
  "Try again": "Réessayer",
  "Learn more": "En savoir plus",
  "Contact us": "Contactez-nous",
  "Terms of Service": "Conditions d'utilisation",
  "Privacy Policy": "Politique de confidentialité",
  "About": "À propos",
  "FAQ": "FAQ",
  "Blog": "Blog",
  "Features": "Fonctionnalités",
  "Pricing": "Tarifs",
  "Sign in with Passkey authentication": "Se connecter avec l'authentification par Passkey",
};

let count = 0;
for (const [en, fr] of Object.entries(translations)) {
  const escapedEn = en.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const escapedFr = fr.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const search = `msgid "${escapedEn}"\nmsgstr ""`;
  if (po.includes(search)) {
    po = po.replace(search, `msgid "${escapedEn}"\nmsgstr "${escapedFr}"`);
    count++;
  }
}

fs.writeFileSync("locales/fr-FR.po", po);
console.log(`Updated ${count} translations out of ${Object.keys(translations).length} provided`);
