export const getExtendedContent = (tipId: string): string | null => {
	const extendedContent: Record<string, string> = {
		"prep-1":
			"Consultez le site de l'entreprise, ses réseaux sociaux et les offres similaires. Notez ses activités, ses valeurs, ses clients et deux questions précises à poser.",
		"prep-2":
			"Rangez vos documents dans un dossier propre : CV en plusieurs copies, lettre, diplômes, attestations de stage, certificats et pièce d'identité. Vérifiez que tout est à jour.",
		"prep-3":
			"Méthode STAR : Situation, Tâche, Action, Résultat. Préparez trois à cinq exemples de stage pour parler de sécurité, travail d'équipe, problème résolu ou initiative.",
		"prep-4":
			"Choisissez des situations précises : difficulté surmontée, collaboration réussie, erreur corrigée, initiative prise. Notez le contexte, votre action et le résultat.",
		"prep-5":
			"Révisez les protocoles de votre domaine, le vocabulaire technique et le matériel déjà utilisé. Préparez-vous à expliquer simplement vos gestes professionnels.",
		"prep-6":
			"Pour la santé, choisissez une tenue sobre et propre. Pour l'industrie, préférez une tenue pratique mais soignée. Évitez parfum fort, bijoux excessifs et accessoires distrayants.",
		"prep-7":
			"Soulignez les verbes d'action de l'offre : assister, maintenir, contrôler, diagnostiquer, accueillir. Préparez une phrase qui prouve chaque compétence importante.",
		"prep-8":
			"Votre pitch doit être naturel : qui vous êtes, ce que vous savez faire, une expérience forte et pourquoi ce poste vous intéresse. Chronométrez-vous pour rester concis.",
		"prep-9":
			"Faites une table simple : compétence demandée, preuve, résultat. Exemple : respect des consignes de sécurité, stage en atelier, zéro incident pendant l'intervention.",
		"prep-10":
			"Évitez les questions déjà expliquées dans l'offre. Posez des questions qui montrent votre motivation : formation interne, encadrement, objectifs des premiers mois.",
		"prep-11":
			"Enregistrez une simulation courte. Écoutez ensuite le débit, les hésitations et les réponses trop longues. Corrigez une chose à la fois.",
		"prep-12":
			"Préparez deux itinéraires si possible et gardez le numéro du contact. L'objectif est d'arriver calme, pas seulement d'arriver à l'heure.",
		"prep-13":
			"Supprimez ou masquez ce qui peut nuire à votre image professionnelle. Mettez à jour les informations utiles : formation, stage, compétences, ville.",
		"prep-14":
			"Notez ce qui est négociable et ce qui ne l'est pas : disponibilité, transport, horaires, stage, contrat, salaire. Cela vous aide à répondre sans improviser.",
		"prep-15":
			"Pour chaque point sensible, préparez une réponse courte : reconnaître, expliquer sans se justifier trop longtemps, puis montrer l'action de correction.",
		"prep-16":
			"Vous n'avez pas besoin de changer tout le CV. Ajustez le titre, l'ordre des expériences, les compétences visibles et quelques mots-clés de l'offre.",
		"prep-17":
			"Un carnet donne une image organisée. Notez aussi les informations que vous voulez vérifier : planning, responsable, tenue, documents, prochaines étapes.",
		"prep-18":
			"La préparation mentale compte. Dormez suffisamment, mangez légèrement, préparez votre dossier la veille et relisez seulement vos points-clés le matin.",
		"during-1":
			"Planifiez le trajet à l'avance. Arrivez 10 à 15 minutes en avance. En cas de retard, appelez rapidement et restez professionnel.",
		"during-2":
			"N'interrompez pas le recruteur. Prenez des notes si utile. Si vous n'avez pas compris, demandez poliment de reformuler.",
		"during-3":
			"Chaque réponse importante doit contenir un exemple. Évitez les phrases générales ; dites plutôt ce que vous avez fait pendant un stage ou un projet.",
		"during-4":
			"Montrez votre motivation par vos mots et votre attitude. Expliquez pourquoi ce poste correspond à votre formation et à vos objectifs.",
		"during-5":
			"Exemples de questions : quelles sont les missions principales ? Quelles qualités cherchez-vous ? Comment se passe l'intégration dans l'équipe ?",
		"during-6":
			"Il est normal de prendre quelques secondes. Vous pouvez dire : c'est une bonne question, je prends un moment pour organiser ma réponse.",
		"during-7":
			"Reformuler évite les hors-sujets. Exemple : si je comprends bien, vous voulez savoir comment je réagis en cas de panne urgente.",
		"during-8":
			"Les résultats rendent vos exemples crédibles : durée, quantité, amélioration, réduction d'erreur, satisfaction d'un patient ou respect d'un délai.",
		"during-9":
			"L'honnêteté est mieux qu'une fausse réponse. Dites ce que vous savez, ce que vous ne savez pas encore, et comment vous apprendrez rapidement.",
		"during-10":
			"Après un exemple, ajoutez une phrase de lien : c'est pour cela que je peux être utile sur cette mission ou dans votre équipe.",
		"during-11":
			"Ne critiquez pas une ancienne équipe. Transformez les difficultés en apprentissage : communication, organisation, sécurité, gestion du stress.",
		"during-12":
			"Finissez proprement : remerciez, confirmez votre motivation et demandez les prochaines étapes. Cela laisse une impression claire et professionnelle.",
		"body-1":
			"Regardez naturellement le recruteur quand vous répondez. S'il y a plusieurs personnes, partagez votre regard sans fixer une seule personne.",
		"body-2":
			"Asseyez-vous au fond de la chaise, dos droit mais détendu. Évitez les bras croisés. Gardez les mains visibles et calmes.",
		"body-3":
			"Souriez au début et à la fin de l'entretien. Pendant l'échange, laissez votre visage montrer naturellement votre intérêt.",
		"body-4":
			"Si une poignée de main est proposée, elle doit être ferme sans être excessive. Gardez le contact visuel et attendez l'initiative du recruteur.",
		"body-5":
			"Parlez à un rythme calme. Respirez avant les réponses longues et articulez les termes techniques pour que le recruteur comprenne votre raisonnement.",
		"body-6":
			"Attendez l'invitation avant de vous asseoir. Posez vos affaires proprement et gardez votre téléphone silencieux et hors de vue.",
		"body-7":
			"Les termes techniques doivent être articulés. Marquez une pause courte entre les étapes d'une procédure pour montrer votre méthode.",
		"body-8":
			"Les premières secondes comptent. Une salutation claire, un regard calme et un merci donnent une image sérieuse dès le départ.",
		"body-9":
			"En visio, connectez-vous cinq minutes avant. Fermez les notifications et placez la caméra au niveau des yeux.",
		"body-10":
			"Beaucoup de candidats se relâchent à la fin. Restez attentif quand on explique les prochaines étapes, car ces détails comptent.",
		"after-1":
			"Envoyez un email court : remerciez pour le temps accordé, confirmez votre intérêt et mentionnez un point positif de l'échange. Trois ou quatre phrases suffisent.",
		"after-2":
			"Notez les questions posées, vos réponses, ce qui était clair et ce qui doit être amélioré. Ces notes servent pour les prochains entretiens.",
		"after-3":
			"Respectez le délai annoncé avant de relancer. Si aucun délai n'a été donné, attendez environ une semaine puis envoyez un message poli.",
		"after-4":
			"Gardez une version PDF de votre CV, vos certificats et vos coordonnées prêtes. Répondre vite montre votre organisation.",
		"after-5":
			"Analysez l'offre avec calme : missions, horaires, distance, salaire, apprentissage et possibilités d'évolution. Préparez vos questions avant d'accepter.",
		"after-6":
			"Continuez vos candidatures jusqu'à confirmation officielle. Une bonne recherche garde plusieurs options ouvertes.",
		"after-7":
			"Nommez les fichiers clairement, par exemple CV-Prenom-Nom.pdf. Ajoutez une phrase de contexte dans l'email pour faciliter le traitement.",
		"after-8":
			"Un tableau de suivi évite les oublis : entreprise, poste, contact, date d'entretien, statut, relance prévue et remarques.",
		"after-9":
			"Un second entretien est souvent plus concret. Préparez des exemples plus techniques et des questions sur l'équipe, les horaires et les objectifs.",
		"after-10":
			"Tous les recruteurs ne répondent pas, mais une demande polie peut donner un retour utile. Restez bref et remerciez dans tous les cas.",
		"common-1":
			"Structurez votre présentation : formation, stage, compétence forte, objectif professionnel. Restez clair et évitez de réciter tout le CV.",
		"common-2":
			"Montrez que le poste correspond à votre formation et à vos objectifs. Utilisez des informations précises sur l'entreprise.",
		"common-3":
			"Choisissez des forces utiles au poste, comme rigueur, ponctualité, communication ou esprit d'équipe. Ajoutez toujours un exemple.",
		"common-4": "Choisissez un point améliorable réel mais non bloquant. Expliquez ce que vous faites pour progresser.",
		"common-5":
			"Résumez vos atouts en une réponse courte : compétence technique, expérience pratique, motivation et capacité d'apprendre.",
		"common-6":
			"Donnez une vision réaliste : devenir autonome, renforcer vos compétences, prendre plus de responsabilités et contribuer à l'équipe.",
		"common-7":
			"Utilisez un exemple où vous avez gardé le calme. Montrez que vous savez prioriser et demander de l'aide quand la sécurité ou la qualité l'exige.",
		"common-8":
			"Ne choisissez pas un conflit personnel. Décrivez un désaccord de travail, votre écoute, votre proposition et le résultat.",
		"common-9":
			"Expliquez votre rôle dans l'équipe, pas seulement le résultat global. Le recruteur veut comprendre votre contribution concrète.",
		"common-10":
			"Soyez clair et fiable. Une disponibilité précise vaut mieux qu'une promesse vague qui sera difficile à tenir.",
		"common-11":
			"Montrez une vraie recherche : secteur, services, clients, valeurs, localisation ou projets. Évitez les phrases génériques.",
		"common-12":
			"Préparez toujours des questions. Ne dites pas simplement non ; cela peut donner l'impression que vous n'êtes pas assez intéressé.",
		"healthcare-1":
			"Montrez votre engagement pour la qualité des soins. Mentionnez une situation où vous avez protégé la sécurité ou le confort du patient.",
		"healthcare-2":
			"Parlez d'une situation où vous avez écouté, rassuré ou adapté votre communication avec un patient ou une famille.",
		"healthcare-3":
			"Citez les précautions standard, le lavage des mains, le port des EPI et la prévention des infections. Soyez prêt à détailler les protocoles.",
		"healthcare-4":
			"Donnez des exemples de collaboration avec les professionnels de santé. Montrez votre capacité à transmettre les informations utiles.",
		"industrial-1":
			"Montrez que la sécurité passe avant la vitesse. Mentionnez une situation où vous avez respecté une procédure ou signalé un risque.",
		"industrial-2":
			"Parlez des machines, outils, instruments de mesure et techniques que vous maîtrisez. Soyez précis sur les gestes pratiques.",
		"industrial-3":
			"Décrivez votre méthode pour diagnostiquer une panne : observer, sécuriser, tester, isoler la cause, corriger et documenter.",
		"industrial-4":
			"Expliquez pourquoi la maintenance préventive évite les pannes, protège les équipes et réduit les arrêts de production.",
		"hse-1":
			"Mentionnez les bases utiles : évaluation des risques, EPI, consignes, procédures, ISO 45001 si pertinent.",
		"hse-2":
			"Décrivez votre méthode : identification des dangers, évaluation probabilité x gravité, mesures de maîtrise, suivi et documentation.",
		"hse-3":
			"Parlez de sensibilisation sécurité, d'affichage, de rappel terrain et de l'importance de l'engagement de toute l'équipe.",
		"hse-4":
			"Détaillez les plans d'urgence : alerte, évacuation, point de rassemblement, comptage, secours, rapport et exercices.",
	};
	return extendedContent[tipId] || null;
};
