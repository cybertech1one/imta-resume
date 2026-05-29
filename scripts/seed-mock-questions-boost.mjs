/**
 * seed-mock-questions-boost.mjs
 *
 * Idempotent script that:
 * 1. Deactivates the duplicate `conducteur_engins` mock_ai_program (cariste is canonical)
 * 2. Deletes orphaned conducteur_engins questions (no FK, safe to delete)
 * 3. Ensures every ACTIVE mock_ai_program has >= 5 questions per difficulty level
 *    (debutant / intermediaire / avance)
 *
 * Run: node scripts/seed-mock-questions-boost.mjs
 * Requires: pg in node_modules (available via pnpm)
 */

import pg from "pg";
import { randomUUID } from "crypto";

const { Client } = pg;

const DB_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

// ---------------------------------------------------------------------------
// Additional questions by program / difficulty
// All text must be in French, role-appropriate, professional.
// ---------------------------------------------------------------------------

/** @type {Record<string, Record<string, string[]>>} program_id -> difficulty -> questions[] */
const ADDITIONAL_QUESTIONS = {
  // ── CARISTE / Conducteur d'engins (canonical) ────────────────────────────
  cariste: {
    debutant: [
      "Quelles sont les règles de sécurité de base à respecter lors de la conduite d'un chariot élévateur ?",
      "Comment vérifiez-vous l'état de votre chariot avant de commencer votre poste ?",
      "Que signifient les différentes couleurs de marquage au sol dans un entrepôt ?",
      "Quelles informations doit contenir la fiche de sécurité d'un chariot élévateur ?",
      "Comment positionnez-vous correctement les fourches lors du déplacement d'une charge ?",
    ],
    intermediaire: [
      "Comment évaluez-vous la capacité de charge maximale d'un chariot élévateur selon le type de charge ?",
      "Quelles précautions prenez-vous lors de la conduite en pente ou sur sol glissant ?",
      "Décrivez la procédure à suivre en cas de renversement d'une charge dans une allée.",
      "Comment gérez-vous la coactivité avec les piétons dans une zone de stockage active ?",
      "Quelles sont les principales différences entre un chariot à contrepoids et un chariot rétractable ?",
    ],
    avance: [
      "Comment optimisez-vous les flux logistiques dans un entrepôt à haute rotation ?",
      "Décrivez votre approche pour former un nouveau cariste aux procédures internes de sécurité.",
      "Comment intervenez-vous lors d'une anomalie détectée sur le système hydraulique en pleine opération ?",
      "Quels indicateurs de performance (KPI) suivez-vous pour évaluer l'efficacité de votre activité ?",
      "Comment gérez-vous un stock FIFO/LIFO avec des chariots dans un espace contraint ?",
    ],
  },

  // ── AIDE SOIGNANT ────────────────────────────────────────────────────────
  aide_soignant: {
    debutant: [
      "Quelles sont les règles d'hygiène essentielles lors des soins aux patients ?",
      "Comment effectuez-vous correctement le lavage des mains selon les normes hospitalières ?",
      "Quels sont vos rôles et limites en tant qu'aide-soignant(e) par rapport à l'infirmier(e) ?",
      "Comment installez-vous confortablement un patient alité pour prévenir les escarres ?",
      "Que faites-vous si vous observez un changement inquiétant dans l'état d'un patient ?",
    ],
    intermediaire: [
      "Comment gérez-vous une situation de patient agité ou non coopératif lors des soins ?",
      "Décrivez les étapes d'une toilette complète au lit en respectant la dignité du patient.",
      "Quelles précautions particulières prenez-vous lors des soins d'un patient sous isolement septique ?",
      "Comment participez-vous à la prévention des infections nosocomiales dans votre service ?",
      "Quel est votre rôle dans l'accompagnement psychologique d'un patient en fin de vie ?",
    ],
    avance: [
      "Comment organisez-vous votre charge de travail en cas d'afflux important de patients ?",
      "Décrivez votre expérience dans la gestion d'une situation d'urgence avant l'arrivée du médecin.",
      "Comment assurez-vous la continuité des soins lors d'une passation entre équipes ?",
      "Quels protocoles suivez-vous en cas de chute d'un patient dans l'établissement ?",
      "Comment contribuez-vous à l'amélioration continue de la qualité des soins dans votre équipe ?",
    ],
  },

  // ── AUXILIAIRE DE PUÉRICULTURE ───────────────────────────────────────────
  auxiliaire_puericulture: {
    debutant: [
      "Quelles règles d'hygiène respectez-vous lors des soins aux nouveau-nés ?",
      "Comment préparez-vous un biberon en respectant les normes de sécurité alimentaire ?",
      "Quels signes vous alertent sur un état de santé préoccupant chez un nourrisson ?",
      "Comment communiquez-vous avec les parents sur les besoins quotidiens de leur enfant ?",
      "Quelles sont les étapes du change d'un bébé en milieu professionnel ?",
    ],
    intermediaire: [
      "Comment gérez-vous un enfant qui présente une fièvre élevée en attente du médecin ?",
      "Décrivez votre approche pour accompagner un enfant hospitalisé séparé de sa famille.",
      "Quelles activités d'éveil proposez-vous adaptées à chaque tranche d'âge en pédiatrie ?",
      "Comment participez-vous à la détection précoce de signes de maltraitance ou de négligence ?",
      "Quelles précautions prenez-vous lors de la désinfection du matériel en contact avec les nourrissons ?",
    ],
    avance: [
      "Comment coordonnez-vous votre action avec l'équipe soignante lors d'une urgence pédiatrique ?",
      "Décrivez votre rôle dans l'accompagnement d'un enfant atteint d'une maladie chronique.",
      "Comment gérez-vous les situations de stress parental intense pendant l'hospitalisation ?",
      "Quels protocoles de soins avez-vous contribué à améliorer dans votre expérience professionnelle ?",
      "Comment assurez-vous le suivi développemental d'un prématuré dans le service de néonatologie ?",
    ],
  },

  // ── INFIRMIER POLYVALENT ──────────────────────────────────────────────────
  infirmier_polyvalent: {
    debutant: [
      "Quels sont les droits fondamentaux du patient que vous devez respecter dans votre pratique ?",
      "Comment préparez-vous et administrez-vous un médicament injectable en toute sécurité ?",
      "Quelles informations vérifiez-vous avant de réaliser un soin prescrit par le médecin ?",
      "Comment assurez-vous la traçabilité de vos actes dans le dossier de soins ?",
      "Que faites-vous en cas de doute sur une prescription médicale ?",
    ],
    intermediaire: [
      "Comment prenez-vous en charge un patient en détresse respiratoire avant l'arrivée du médecin ?",
      "Décrivez les étapes de pose et surveillance d'une perfusion intraveineuse.",
      "Comment gérez-vous un patient diabétique présentant une hypoglycémie sévère ?",
      "Quelles mesures prenez-vous pour prévenir les erreurs médicamenteuses dans votre service ?",
      "Comment accompagnez-vous un patient et sa famille lors d'une annonce de diagnostic grave ?",
    ],
    avance: [
      "Comment organisez-vous les soins d'un service polyvalent en situation de sous-effectif ?",
      "Décrivez votre expérience dans la mise en place d'un protocole de soins innovant.",
      "Comment gérez-vous les conflits au sein de l'équipe soignante ?",
      "Quels indicateurs qualité suivez-vous pour évaluer la sécurité des soins dans votre unité ?",
      "Comment participez-vous à la formation et à l'encadrement des nouveaux professionnels de santé ?",
    ],
  },

  // ── SAGE-FEMME ───────────────────────────────────────────────────────────
  sage_femme: {
    debutant: [
      "Quelles sont les principales missions d'une sage-femme dans un établissement de santé au Maroc ?",
      "Comment réalisez-vous un examen obstétrical externe chez une femme enceinte ?",
      "Quelles informations transmettez-vous lors des consultations prénatales ?",
      "Comment préparez-vous une salle de naissance avant un accouchement ?",
      "Quels signes d'alarme survenant en cours de grossesse justifient une hospitalisation urgente ?",
    ],
    intermediaire: [
      "Comment accompagnez-vous une parturiente lors d'un accouchement eutocique (naturel) ?",
      "Décrivez la surveillance du travail à l'aide du partogramme.",
      "Comment détectez-vous et gérez-vous une souffrance fœtale aiguë pendant le travail ?",
      "Quelles précautions prenez-vous lors de la délivrance placentaire pour prévenir l'hémorragie ?",
      "Comment assurez-vous les soins du nouveau-né en salle de naissance ?",
    ],
    avance: [
      "Comment gérez-vous une hémorragie du post-partum en attendant l'intervention du médecin ?",
      "Décrivez votre rôle dans la prise en charge d'une pré-éclampsie sévère.",
      "Comment soutenez-vous une mère après une naissance difficile ou un deuil périnatal ?",
      "Quels protocoles avez-vous contribué à mettre en place pour réduire la mortalité maternelle ?",
      "Comment gérez-vous votre pratique en situation de ressources limitées dans une maternité rurale ?",
    ],
  },

  // ── TECHNICIEN D'ANESTHÉSIE ───────────────────────────────────────────────
  technicien_anesthesie: {
    debutant: [
      "Quels sont les rôles du technicien d'anesthésie avant une intervention chirurgicale ?",
      "Comment vérifiez-vous le chariot d'anesthésie en début de journée ?",
      "Quelles informations recueillez-vous lors de la consultation pré-anesthésique ?",
      "Comment préparez-vous le matériel pour une induction anesthésique standard ?",
      "Quels signes vitaux surveillez-vous en continu pendant une anesthésie générale ?",
    ],
    intermediaire: [
      "Comment assistez-vous le médecin anesthésiste lors d'une intubation difficile ?",
      "Décrivez les étapes de préparation d'une anesthésie locorégionale (rachianesthésie).",
      "Quelles actions prenez-vous lors d'un réveil difficile en salle de réveil ?",
      "Comment gérez-vous un équipement d'anesthésie en cas de panne en cours d'intervention ?",
      "Quelles précautions spécifiques prenez-vous chez un patient ayant des antécédents allergiques ?",
    ],
    avance: [
      "Comment gérez-vous une situation d'anaphylaxie peropératoire en collaboration avec l'équipe ?",
      "Décrivez votre rôle dans la prise en charge anesthésique d'un patient polytraumatisé.",
      "Comment organisez-vous le bloc opératoire pour optimiser le flux patients en une journée chargée ?",
      "Quels protocoles de sécurité transfusionnelle appliquez-vous en chirurgie lourde ?",
      "Comment participez-vous à la démarche qualité et à la prévention des événements indésirables au bloc ?",
    ],
  },

  // ── TECHNICIEN DE LABORATOIRE ──────────────────────────────────────────────
  technicien_laboratoire: {
    debutant: [
      "Quelles règles de sécurité appliquez-vous lors de la manipulation d'échantillons biologiques ?",
      "Comment réalisez-vous un prélèvement sanguin veineux en respectant les bonnes pratiques ?",
      "Quels équipements de protection individuelle utilisez-vous au laboratoire ?",
      "Comment assurez-vous la traçabilité des échantillons reçus au laboratoire ?",
      "Quels contrôles de qualité effectuez-vous avant de valider un résultat d'analyse ?",
    ],
    intermediaire: [
      "Comment interpréter-vous une hémogramme (NFS) et alertez-vous en cas d'anomalie critique ?",
      "Décrivez la procédure de calibration et de contrôle qualité d'un automate de biochimie.",
      "Quelles précautions prenez-vous lors du traitement d'un échantillon suspecté de contagion ?",
      "Comment gérez-vous les valeurs panique (valeurs critiques) dans votre laboratoire ?",
      "Quel est votre rôle dans la maintenance préventive des équipements analytiques ?",
    ],
    avance: [
      "Comment participez-vous à la mise en place d'une nouvelle technique d'analyse au laboratoire ?",
      "Décrivez votre expérience dans la gestion d'une accréditation COFRAC ou équivalente.",
      "Comment gérez-vous une non-conformité détectée sur une série d'analyses en cours de traitement ?",
      "Quels indicateurs de performance suivez-vous pour garantir la qualité des résultats rendus ?",
      "Comment assurez-vous la formation et le tutorat des nouveaux techniciens dans votre service ?",
    ],
  },

  // ── ÉLECTROMÉCANIQUE ──────────────────────────────────────────────────────
  electromecanique: {
    debutant: [
      "Quelles précautions de sécurité prenez-vous avant toute intervention sur une installation électrique ?",
      "Comment identifiez-vous les composants d'un moteur électrique asynchrone ?",
      "Quels outils utilisez-vous pour mesurer la tension, le courant et la résistance sur un circuit ?",
      "Comment lisez-vous un schéma électrique industriel simple ?",
      "Quelles vérifications effectuez-vous lors de la mise en service d'une pompe industrielle ?",
    ],
    intermediaire: [
      "Comment diagnostiquez-vous une panne sur un variateur de vitesse industriel ?",
      "Décrivez la procédure de remplacement d'un roulement à billes sur un moteur en exploitation.",
      "Comment assurez-vous la maintenance préventive d'un convoyeur motorisé ?",
      "Quelles mesures prenez-vous pour protéger un moteur contre la surchauffe et les surcharges ?",
      "Comment intervenez-vous sur un automate programmable industriel (API) lors d'un dysfonctionnement ?",
    ],
    avance: [
      "Comment gérez-vous une panne électromécanique critique impactant la production en cours ?",
      "Décrivez votre méthode pour analyser les causes racines d'une défaillance récurrente.",
      "Comment optimisez-vous un plan de maintenance pour réduire le taux d'arrêts imprévus ?",
      "Quels outils de GMAO (gestion de maintenance assistée par ordinateur) maîtrisez-vous ?",
      "Comment encadrez-vous une équipe de techniciens lors d'un arrêt technique planifié majeur ?",
    ],
  },

  // ── MAINTENANCE INDUSTRIELLE ──────────────────────────────────────────────
  maintenance_industrielle: {
    debutant: [
      "Quels sont les différents types de maintenance (corrective, préventive, prédictive) ?",
      "Comment intervenez-vous en toute sécurité sur une machine lors d'une panne urgente ?",
      "Quels documents techniques consultez-vous lors d'une intervention de maintenance ?",
      "Comment effectuez-vous un diagnostic de base sur une machine pneumatique ?",
      "Quels équipements de protection individuelle portez-vous en atelier de production ?",
    ],
    intermediaire: [
      "Comment rédigez-vous un rapport d'intervention de maintenance détaillé ?",
      "Décrivez la méthode AMDEC et son application dans la planification de la maintenance.",
      "Comment gérez-vous les pièces de rechange critiques pour minimiser les ruptures de stock ?",
      "Quelles techniques utilisez-vous pour le diagnostic vibratoire d'une machine tournante ?",
      "Comment assurez-vous la coordination entre la maintenance et la production lors d'un arrêt planifié ?",
    ],
    avance: [
      "Comment mettez-vous en place un programme de maintenance basée sur la fiabilité (RCM) ?",
      "Décrivez votre expérience dans la réduction du MTTR (temps moyen de réparation) d'une ligne.",
      "Comment gérez-vous un projet de modernisation d'équipements industriels vieillissants ?",
      "Quels indicateurs OEE (Overall Equipment Effectiveness) suivez-vous et comment les améliorez-vous ?",
      "Comment formez-vous les opérateurs de production aux gestes de maintenance de premier niveau ?",
    ],
  },

  // ── SOUDURE ────────────────────────────────────────────────────────────────
  soudure: {
    debutant: [
      "Quels équipements de protection individuelle portez-vous impérativement lors du soudage ?",
      "Quelles sont les différences entre le soudage MIG, TIG et à l'arc (MMA) ?",
      "Comment préparez-vous les surfaces métalliques avant de commencer un assemblage soudé ?",
      "Quels réglages de base effectuez-vous sur un poste à souder MIG avant une opération ?",
      "Comment vérifiez-vous la qualité visuelle d'un cordon de soudure ?",
    ],
    intermediaire: [
      "Comment choisissez-vous le procédé de soudage le plus adapté selon le matériau et l'épaisseur ?",
      "Décrivez la préparation et l'exécution d'une soudure bout en bout sur acier inox en TIG.",
      "Comment gérez-vous les déformations thermiques lors du soudage de pièces longues ?",
      "Quels défauts de soudure pouvez-vous détecter par contrôle visuel et par ressuage ?",
      "Comment interprétez-vous un plan de soudage et appliquez-vous les symboles de soudure ISO ?",
    ],
    avance: [
      "Comment assurez-vous la qualité d'une soudure certifiée selon les normes EN ISO 3834 ?",
      "Décrivez votre expérience dans le soudage de structures métalliques complexes en position difficile.",
      "Comment gérez-vous la qualification des procédures de soudage (DMOS/QMOS) ?",
      "Quels contrôles non destructifs (ressuage, ultrasons, radiographie) avez-vous pratiqués ?",
      "Comment encadrez-vous et évaluez-vous les compétences de soudeurs juniors dans votre équipe ?",
    ],
  },

  // ── TECHNICIEN EN FROID ET CLIMATISATION ──────────────────────────────────
  technicien_froid: {
    debutant: [
      "Quels sont les principes de base du cycle frigorifique (compression, condensation, détente, évaporation) ?",
      "Comment identifiez-vous les différents composants d'une installation de climatisation split ?",
      "Quels risques présentent les fluides frigorigènes et comment vous en protégez-vous ?",
      "Comment réalisez-vous une mise en service d'un climatiseur résidentiel de base ?",
      "Quels outils utilise-t-on pour mesurer les pressions et températures dans un circuit frigorifique ?",
    ],
    intermediaire: [
      "Comment diagnostiquez-vous une panne sur un groupe froid industriel (compresseur, condenseur, détendeur) ?",
      "Décrivez la procédure de récupération et de recharge en fluide frigorigène selon les normes environnementales.",
      "Comment intervenez-vous sur une installation frigorifique en chambre froide positive ou négative ?",
      "Quelles vérifications électriques effectuez-vous lors de la maintenance d'un climatiseur commercial ?",
      "Comment analysez-vous les courbes de fonctionnement (log P/h) d'une installation défaillante ?",
    ],
    avance: [
      "Comment concevez-vous et dimensionnez-vous une installation frigorifique pour un entrepôt logistique ?",
      "Décrivez votre expérience dans la transition vers les fluides frigorigènes à faible GWP (R32, R452B…).",
      "Comment gérez-vous la maintenance d'un parc d'équipements froid/clim multi-sites ?",
      "Quels protocoles de contrôle d'étanchéité appliquez-vous selon la réglementation F-Gas ?",
      "Comment assurez-vous la montée en compétences d'une équipe de techniciens froid de votre société ?",
    ],
  },

  // ── HSE ADVANCED ─────────────────────────────────────────────────────────
  hse_advanced: {
    debutant: [
      "Quels sont les principaux textes législatifs encadrant la sécurité au travail au Maroc ?",
      "Comment réalisez-vous une inspection sécurité terrain dans un atelier de production ?",
      "Quels équipements de protection collective rencontrez-vous sur un chantier industriel ?",
      "Comment identifiez-vous et classez-vous les risques professionnels dans un document unique ?",
      "Quelles actions menez-vous pour sensibiliser les opérateurs aux consignes de sécurité ?",
    ],
    intermediaire: [
      "Comment menez-vous une analyse d'accident de travail selon la méthode de l'arbre des causes ?",
      "Décrivez votre approche pour mettre en place un plan de prévention avec une entreprise extérieure.",
      "Comment gérez-vous un incident environnemental (déversement de produit chimique) sur site ?",
      "Quels indicateurs de performance sécurité (TF, TG, taux d'incidents) suivez-vous et analysez-vous ?",
      "Comment préparez-vous et animez-vous une formation sécurité pour du personnel d'atelier ?",
    ],
    avance: [
      "Comment pilotez-vous la mise en conformité d'un site industriel avec une norme ISO 45001 ?",
      "Décrivez votre expérience dans la gestion d'une crise HSE majeure (accident grave, pollution) ?",
      "Comment intégrez-vous les enjeux HSE dans la stratégie globale de l'entreprise ?",
      "Quels retours d'expérience avez-vous mis en place pour capitaliser après des incidents répétitifs ?",
      "Comment mesurez-vous l'efficacité d'un plan d'action HSE sur plusieurs années ?",
    ],
  },

  // ── HSE SPECIALIST ────────────────────────────────────────────────────────
  hse_specialist: {
    debutant: [
      "Quelle est la différence entre un danger et un risque en milieu professionnel ?",
      "Comment contribuez-vous à l'élaboration du document unique d'évaluation des risques (DUER) ?",
      "Quels sont les équipements de premiers secours obligatoires dans un établissement industriel ?",
      "Comment rédigez-vous une fiche de données de sécurité (FDS) pour un produit chimique ?",
      "Quelles obligations réglementaires s'appliquent en matière de bruit au travail ?",
    ],
    intermediaire: [
      "Comment réalisez-vous une analyse des risques chimiques dans un laboratoire industriel ?",
      "Décrivez votre méthode pour établir un plan d'urgence interne (PUI) sur un site SEVESO.",
      "Comment gérez-vous les permis de travaux pour les interventions à hauts risques (hauteur, espace confiné) ?",
      "Quelles techniques de mesure utilisez-vous pour évaluer l'exposition aux agents physiques (bruit, vibrations) ?",
      "Comment assurez-vous la veille réglementaire HSE et son intégration dans les pratiques de l'entreprise ?",
    ],
    avance: [
      "Comment menez-vous un audit HSE complet d'un site de production selon référentiel OHSAS/ISO 45001 ?",
      "Décrivez votre expérience dans la réduction des accidents de travail graves sur plusieurs années.",
      "Comment coordonnez-vous les actions HSE lors d'un projet de construction ou d'extension industrielle ?",
      "Quels modèles de maturité sécurité (Dupont, Bradley Curve) avez-vous utilisés pour progresser ?",
      "Comment développez-vous une culture sécurité durable au sein d'une organisation de 500+ personnes ?",
    ],
  },
};

// ---------------------------------------------------------------------------

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log("Connected to PostgreSQL.");

  try {
    // ── STEP 1: Deactivate conducteur_engins ──────────────────────────────
    console.log("\n[1] Deactivating duplicate conducteur_engins program…");
    const deactivate = await client.query(`
      UPDATE mock_ai_program
      SET is_active = false, updated_at = NOW()
      WHERE program_id = 'conducteur_engins' AND is_active = true
      RETURNING program_id, program_name
    `);
    if (deactivate.rowCount > 0) {
      console.log(`    ✓ Deactivated: ${deactivate.rows[0].program_name}`);
    } else {
      console.log("    ↳ Already inactive or not found.");
    }

    // ── STEP 2: Delete conducteur_engins questions ────────────────────────
    console.log("\n[2] Removing conducteur_engins questions…");
    const deleted = await client.query(`
      DELETE FROM mock_ai_question
      WHERE program = 'conducteur_engins'
      RETURNING id
    `);
    console.log(`    ✓ Deleted ${deleted.rowCount} question(s) for conducteur_engins.`);

    // ── STEP 3: Get all ACTIVE programs ──────────────────────────────────
    const activePrograms = await client.query(`
      SELECT program_id, program_name, field FROM mock_ai_program WHERE is_active = true ORDER BY program_id
    `);
    console.log(`\n[3] Active programs: ${activePrograms.rows.map((r) => r.program_id).join(", ")}`);

    const DIFFICULTIES = ["debutant", "intermediaire", "avance"];
    const TARGET = 5;

    // ── STEP 4: Seed additional questions ────────────────────────────────
    console.log("\n[4] Ensuring each active program has >= 5 questions per difficulty…\n");

    let totalInserted = 0;

    for (const prog of activePrograms.rows) {
      const pid = prog.program_id;
      const field = prog.field;
      const extra = ADDITIONAL_QUESTIONS[pid] || {};

      for (const diff of DIFFICULTIES) {
        // Count existing
        const { rows } = await client.query(
          `SELECT COUNT(*) as cnt FROM mock_ai_question WHERE program = $1 AND difficulty = $2`,
          [pid, diff],
        );
        const existing = parseInt(rows[0].cnt, 10);

        const needed = Math.max(0, TARGET - existing);
        if (needed === 0) {
          console.log(`  ${pid}/${diff}: ${existing} ✓ (>= ${TARGET})`);
          continue;
        }

        const pool = extra[diff] || [];
        const toInsert = pool.slice(0, needed);

        if (toInsert.length === 0) {
          console.warn(`  ⚠ ${pid}/${diff}: needs ${needed} more but no questions defined in script!`);
          continue;
        }

        for (let i = 0; i < toInsert.length; i++) {
          const maxOrder = await client.query(
            `SELECT COALESCE(MAX("order"), 0) as mo FROM mock_ai_question WHERE program = $1 AND difficulty = $2`,
            [pid, diff],
          );
          const nextOrder = parseInt(maxOrder.rows[0].mo, 10) + 1 + i;

          await client.query(
            `INSERT INTO mock_ai_question (id, field, program, difficulty, question_text, "order", is_active, created_at, updated_at)
             VALUES ($1, $2::mock_ai_field, $3, $4::mock_ai_difficulty, $5, $6, true, NOW(), NOW())
             ON CONFLICT DO NOTHING`,
            [randomUUID(), field, pid, diff, toInsert[i], nextOrder],
          );
        }

        const inserted = toInsert.length;
        totalInserted += inserted;
        console.log(`  ${pid}/${diff}: ${existing} → ${existing + inserted} (+${inserted})`);
      }
    }

    console.log(`\n  Total new rows inserted: ${totalInserted}`);

    // ── STEP 5: Final counts ──────────────────────────────────────────────
    console.log("\n[5] Final question counts (active programs only):\n");
    const finalCounts = await client.query(`
      SELECT p.program_id, q.difficulty, COUNT(*) as count
      FROM mock_ai_program p
      JOIN mock_ai_question q ON q.program = p.program_id
      WHERE p.is_active = true AND q.is_active = true
      GROUP BY p.program_id, q.difficulty
      ORDER BY p.program_id, q.difficulty
    `);

    let currentProg = null;
    for (const row of finalCounts.rows) {
      if (row.program_id !== currentProg) {
        currentProg = row.program_id;
        console.log(`  ${currentProg}:`);
      }
      const ok = parseInt(row.count, 10) >= TARGET ? "✓" : "✗ BELOW TARGET";
      console.log(`    ${row.difficulty}: ${row.count} ${ok}`);
    }

    // Check for any program/difficulty still below target
    const belowTarget = finalCounts.rows.filter((r) => parseInt(r.count, 10) < TARGET);
    if (belowTarget.length > 0) {
      console.warn("\n⚠ Some program/difficulty combos still below 5:");
      for (const r of belowTarget) {
        console.warn(`  - ${r.program_id}/${r.difficulty}: ${r.count}`);
      }
    } else {
      console.log("\n✓ All active programs have >= 5 questions per difficulty level.");
    }

    // ── STEP 6: Verify no duplicate forklift programs active ──────────────
    console.log("\n[6] Forklift program status:");
    const forklifts = await client.query(`
      SELECT program_id, program_name, is_active
      FROM mock_ai_program
      WHERE program_id IN ('cariste', 'conducteur_engins')
      ORDER BY program_id
    `);
    for (const r of forklifts.rows) {
      console.log(`  ${r.program_id}: is_active=${r.is_active} — ${r.program_name}`);
    }
  } finally {
    await client.end();
    console.log("\nDone.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
