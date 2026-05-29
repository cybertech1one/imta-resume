import pg from "pg";
import crypto from "crypto";

const pool = new pg.Pool({ connectionString: "postgresql://postgres:postgres@localhost:5432/postgres" });

const tips = [
  { cat: "preparation", en: "Research ANAPEC job listings before your interview", fr: "Consultez les offres ANAPEC avant votre entretien", field: "general" },
  { cat: "preparation", en: "Practice introducing yourself in French and Darija", fr: "Entraînez-vous à vous présenter en français et en darija", field: "general" },
  { cat: "cultural", en: "Understand Moroccan business hierarchy and respect for seniority", fr: "Comprenez la hiérarchie des entreprises marocaines et le respect de l'ancienneté", field: "management" },
  { cat: "technical", en: "Prepare to discuss ISO 9001 quality standards", fr: "Préparez-vous à discuter des normes qualité ISO 9001", field: "genie-industriel" },
  { cat: "salary", en: "Know the minimum wage (SMIG) in Morocco: 3,111 MAD/month", fr: "Connaissez le SMIG au Maroc : 3 111 MAD/mois", field: "general" },
  { cat: "remote", en: "Highlight your experience with remote collaboration tools", fr: "Mettez en avant votre expérience avec les outils de collaboration à distance", field: "genie-informatique" },
  { cat: "body_language", en: "Maintain appropriate eye contact during Moroccan interviews", fr: "Maintenez un contact visuel approprié lors des entretiens marocains", field: "general" },
  { cat: "follow_up", en: "Send a thank-you email in both French and English", fr: "Envoyez un e-mail de remerciement en français et en anglais", field: "general" },
  { cat: "behavioral", en: "Prepare STAR examples from your internship experience", fr: "Préparez des exemples STAR de votre expérience de stage", field: "general" },
  { cat: "during", en: "Ask about the company's CSR initiatives in Morocco", fr: "Renseignez-vous sur les initiatives RSE de l'entreprise au Maroc", field: "management" },
  { cat: "preparation", en: "Review the company's presence on LinkedIn Morocco", fr: "Consultez la présence de l'entreprise sur LinkedIn Maroc", field: "general" },
  { cat: "technical", en: "Be ready to discuss AutoCAD and BIM for construction projects", fr: "Soyez prêt à discuter d'AutoCAD et du BIM pour les projets de construction", field: "genie-civil" },
  { cat: "cultural", en: "Know that punctuality is highly valued in Moroccan corporate culture", fr: "Sachez que la ponctualité est très valorisée dans la culture d'entreprise marocaine", field: "general" },
  { cat: "salary", en: "Research sector-specific salary benchmarks on ReKrute.com", fr: "Consultez les grilles salariales sectorielles sur ReKrute.com", field: "general" },
  { cat: "technical", en: "Prepare to discuss PLC programming for industrial automation", fr: "Préparez-vous à discuter de la programmation PLC pour l'automatisation industrielle", field: "genie-electrique" },
  { cat: "preparation", en: "Familiarize yourself with Morocco's Plan d'Accélération Industrielle", fr: "Familiarisez-vous avec le Plan d'Accélération Industrielle du Maroc", field: "genie-industriel" },
  { cat: "during", en: "Show awareness of Morocco's renewable energy goals (52% by 2030)", fr: "Montrez votre connaissance des objectifs énergétiques du Maroc (52% d'ici 2030)", field: "genie-electrique" },
  { cat: "behavioral", en: "Demonstrate adaptability when discussing multicultural team experience", fr: "Démontrez votre adaptabilité en parlant de vos expériences en équipe multiculturelle", field: "general" },
  { cat: "follow_up", en: "Connect with the interviewer on LinkedIn within 24 hours", fr: "Connectez-vous avec le recruteur sur LinkedIn dans les 24 heures", field: "general" },
  { cat: "remote", en: "Ensure stable internet connection for video interviews", fr: "Assurez une connexion Internet stable pour les entretiens vidéo", field: "general" },
  { cat: "body_language", en: "Dress professionally even for Moroccan startup interviews", fr: "Habillez-vous professionnellement même pour les entretiens de startups marocaines", field: "genie-informatique" },
  { cat: "technical", en: "Discuss your knowledge of Moroccan electrical standards NM", fr: "Discutez de votre connaissance des normes électriques marocaines NM", field: "genie-electrique" },
  { cat: "after", en: "Follow up with HR if no response within 10 business days", fr: "Relancez les RH si pas de réponse sous 10 jours ouvrés", field: "general" },
  { cat: "cultural", en: "Show respect for Ramadan schedules during interview season", fr: "Respectez les horaires du Ramadan pendant la saison des entretiens", field: "general" },
  { cat: "preparation", en: "Review the CGEM employer directory for target companies", fr: "Consultez l'annuaire CGEM pour vos entreprises cibles", field: "general" },
  { cat: "technical", en: "Be prepared to discuss SolidWorks and mechanical design", fr: "Soyez prêt à discuter de SolidWorks et de la conception mécanique", field: "genie-mecanique" },
  { cat: "salary", en: "Negotiate benefits like transport allowance (indemnité de transport)", fr: "Négociez les avantages comme l'indemnité de transport", field: "general" },
  { cat: "during", en: "Express interest in the company's training and development programs", fr: "Exprimez votre intérêt pour les programmes de formation de l'entreprise", field: "general" },
  { cat: "behavioral", en: "Share examples of initiative during academic projects", fr: "Partagez des exemples d'initiative lors de projets académiques", field: "general" },
  { cat: "remote", en: "Prepare a quiet, well-lit space for remote interviews", fr: "Préparez un espace calme et bien éclairé pour les entretiens à distance", field: "general" },
  { cat: "technical", en: "Discuss your knowledge of lean manufacturing principles", fr: "Discutez de votre connaissance des principes du lean manufacturing", field: "genie-mecanique" },
  { cat: "follow_up", en: "Prepare references from your IMTA professors in advance", fr: "Préparez les références de vos professeurs IMTA à l'avance", field: "general" },
  { cat: "cultural", en: "Learn a few professional phrases in Darija for local companies", fr: "Apprenez quelques phrases professionnelles en darija pour les entreprises locales", field: "general" },
  { cat: "after", en: "Reflect on each interview to improve for the next one", fr: "Réfléchissez après chaque entretien pour vous améliorer", field: "general" },
  { cat: "preparation", en: "Study Morocco's key economic sectors: automotive, aerospace, offshoring", fr: "Étudiez les secteurs clés de l'économie marocaine : automobile, aérospatial, offshoring", field: "general" },
  { cat: "technical", en: "Know the basics of SCADA systems for industrial monitoring", fr: "Connaissez les bases des systèmes SCADA pour la surveillance industrielle", field: "genie-industriel" },
  { cat: "salary", en: "Understand CNSS social security contributions (employer and employee)", fr: "Comprenez les cotisations CNSS (part employeur et salarié)", field: "general" },
  { cat: "during", en: "Ask about career progression paths within the company", fr: "Renseignez-vous sur les parcours de progression de carrière dans l'entreprise", field: "general" },
  { cat: "behavioral", en: "Highlight volunteer work or community involvement", fr: "Mettez en avant votre bénévolat ou engagement communautaire", field: "general" },
  { cat: "body_language", en: "Practice a firm but not aggressive handshake", fr: "Entraînez-vous à une poignée de main ferme mais pas agressive", field: "general" },
  { cat: "remote", en: "Test your microphone and camera before the interview", fr: "Testez votre microphone et caméra avant l'entretien", field: "general" },
  { cat: "preparation", en: "Prepare your CV in both French and English versions", fr: "Préparez votre CV en versions française et anglaise", field: "general" },
  { cat: "technical", en: "Be ready to discuss ERP systems like SAP or Oracle", fr: "Soyez prêt à discuter des systèmes ERP comme SAP ou Oracle", field: "logistique" },
  { cat: "cultural", en: "Know that tea offering during interviews is a sign of hospitality", fr: "Sachez que l'offre de thé lors des entretiens est un signe d'hospitalité", field: "general" },
  { cat: "salary", en: "Factor in the cost of living differences between Casablanca and other cities", fr: "Tenez compte des différences de coût de la vie entre Casablanca et les autres villes", field: "general" },
  { cat: "follow_up", en: "Keep a record of all companies you have applied to", fr: "Tenez un registre de toutes les entreprises auxquelles vous avez postulé", field: "general" },
  { cat: "after", en: "Ask for feedback regardless of the outcome", fr: "Demandez un retour quel que soit le résultat", field: "general" },
  { cat: "technical", en: "Discuss your proficiency with Microsoft Office and Google Workspace", fr: "Discutez de votre maîtrise de Microsoft Office et Google Workspace", field: "general" },
  { cat: "during", en: "Show enthusiasm about contributing to Morocco's economic growth", fr: "Montrez votre enthousiasme à contribuer à la croissance économique du Maroc", field: "general" },
  { cat: "behavioral", en: "Explain how you handle pressure during exam periods", fr: "Expliquez comment vous gérez la pression pendant les périodes d'examens", field: "general" },
  { cat: "preparation", en: "Research the interviewer on LinkedIn before the meeting", fr: "Recherchez le recruteur sur LinkedIn avant l'entretien", field: "general" },
  { cat: "cultural", en: "Be aware of working hours in Morocco (typically 8:30-12:30, 14:30-18:30)", fr: "Soyez conscient des horaires de travail au Maroc (généralement 8h30-12h30, 14h30-18h30)", field: "general" },
  { cat: "technical", en: "Prepare to discuss Python and data analysis for engineering roles", fr: "Préparez-vous à discuter de Python et de l'analyse de données", field: "genie-informatique" },
  { cat: "salary", en: "Know that 13th month bonus is common in Moroccan companies", fr: "Sachez que le 13e mois est courant dans les entreprises marocaines", field: "general" },
  { cat: "remote", en: "Learn to use collaborative tools like Teams, Zoom, and Slack", fr: "Apprenez à utiliser les outils collaboratifs comme Teams, Zoom et Slack", field: "general" },
];

const difficulties = ["beginner", "intermediate", "advanced"];

async function seed() {
  let count = 0;
  for (let i = 0; i < tips.length; i += 50) {
    const batch = tips.slice(i, i + 50);
    const params = [];
    const placeholders = batch.map((tip, j) => {
      const base = j * 11;
      params.push(
        crypto.randomUUID(),
        tip.cat,
        tip.en,
        tip.fr,
        tip.en,
        tip.fr,
        tip.field,
        difficulties[(i + j) % 3],
        JSON.stringify([tip.cat, tip.field, "morocco"]),
        true,
        i + j + 400
      );
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}::jsonb, $${base + 10}, $${base + 11})`;
    });
    const sql = `INSERT INTO interview_tip (id, category, title, title_fr, content, content_fr, field, difficulty, tags, is_active, sort_order) VALUES ${placeholders.join(", ")} ON CONFLICT (id) DO NOTHING`;
    const r = await pool.query(sql, params);
    count += r.rowCount;
  }
  console.log(`Inserted ${count} extra tips. Total tips now: ${325 + count}`);
  await pool.end();
}

seed().catch(e => { console.error(e.message); pool.end(); });
