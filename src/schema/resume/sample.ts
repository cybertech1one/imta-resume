import type { ResumeData } from "./data";

export const sampleResumeData: ResumeData = {
	picture: {
		hidden: false,
		url: "https://i.imgur.com/o4Jpt1p.jpeg",
		size: 100,
		rotation: 0,
		aspectRatio: 1,
		borderRadius: 0,
		borderColor: "rgba(0, 0, 0, 0.5)",
		borderWidth: 0,
		shadowColor: "rgba(0, 0, 0, 0.5)",
		shadowWidth: 0,
	},
	basics: {
		name: "Salma Bennani",
		headline: "Infirmier Polyvalent | Diplômé(e) de l'IMTA",
		email: "salma.bennani@email.com",
		phone: "+212 6 12 34 56 78",
		location: "Tanger, Maroc",
		website: {
			url: "",
			label: "",
		},
		customFields: [
			{
				id: "019bef5a-0477-77e0-968b-5d0e2ecb34e3",
				icon: "phone",
				text: "+212 6 12 34 56 78",
				link: "tel:+212612345678",
			},
			{
				id: "019bef5a-93e4-7746-ad39-3a132360f823",
				icon: "envelope",
				text: "salma.bennani@email.com",
				link: "mailto:salma.bennani@email.com",
			},
		],
		// Champs spécifiques au Maroc
		cin: "AB123456",
		militaryServiceStatus: "not-applicable",
		dateOfBirth: "1999-06-15",
		nationality: "Marocaine",
		maritalStatus: "Célibataire",
	},
	summary: {
		title: "",
		columns: 1,
		hidden: false,
		content:
			"<p>Infirmier polyvalent diplômé(e) de l'IMTA, rigoureux(se) et empathique, avec une solide expérience en soins infirmiers acquise lors de stages en milieu hospitalier et clinique. Maîtrise des protocoles d'hygiène et d'asepsie, de la prise des constantes, de l'administration des traitements et de l'accompagnement des patients. Capable de travailler sous pression et en équipe pluridisciplinaire, à l'écoute des patients et soucieux(se) de leur bien-être et de leur sécurité.</p>",
	},
	sections: {
		profiles: {
			title: "",
			columns: 1,
			hidden: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-3d42ddc9b4d8",
					hidden: false,
					icon: "linkedin-logo",
					network: "LinkedIn",
					username: "salma-bennani",
					website: {
						url: "https://linkedin.com/in/salma-bennani",
						label: "linkedin.com/in/salma-bennani",
					},
				},
			],
		},
		experience: {
			title: "",
			columns: 1,
			hidden: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-44d8cec98ca4",
					hidden: false,
					company: "CHU Mohammed VI",
					position: "Stage d'Infirmier Polyvalent (Service de Médecine)",
					location: "Tanger, Maroc",
					period: "Janvier 2024 - Juin 2024",
					website: {
						url: "",
						label: "",
					},
					description:
						"<ul><li><p>Assuré les soins infirmiers quotidiens auprès des patients hospitalisés (toilette, mobilisation, prévention des escarres)</p></li><li><p>Administré les traitements prescrits par voie orale et injectable dans le respect des protocoles médicaux</p></li><li><p>Surveillé et relevé les constantes vitales (tension, température, pouls, saturation) et signalé toute anomalie</p></li><li><p>Appliqué rigoureusement les règles d'hygiène et d'asepsie pour prévenir les infections nosocomiales</p></li><li><p>Accompagné les patients et leurs familles avec écoute et bienveillance</p></li></ul>",
				},
			],
		},
		education: {
			title: "",
			columns: 1,
			hidden: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-48455f6cef9e",
					hidden: false,
					school: "IMTA (Institut des Métiers et Techniques Avancées)",
					degree: "Diplôme",
					area: "Infirmier Polyvalent",
					grade: "Mention Bien",
					location: "Tanger, Maroc",
					period: "2021 - 2024",
					website: {
						url: "",
						label: "",
					},
					description:
						"<p>Formation en soins infirmiers : anatomie-physiologie, pharmacologie, soins d'urgence, hygiène hospitalière, éthique et déontologie. Nombreux stages pratiques en milieu hospitalier et clinique.</p>",
				},
			],
		},
		projects: {
			title: "",
			columns: 1,
			hidden: true,
			items: [],
		},
		skills: {
			title: "",
			columns: 1,
			hidden: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-5a52dcf50ed4",
					hidden: false,
					icon: "heartbeat",
					name: "Soins Infirmiers",
					proficiency: "Avancé",
					level: 5,
					keywords: ["Pansements", "Prélèvements", "Perfusions"],
				},
				{
					id: "019bef5a-93e4-7746-ad39-5e8bb7cacbc8",
					hidden: false,
					icon: "hand-soap",
					name: "Hygiène & Asepsie",
					proficiency: "Avancé",
					level: 5,
					keywords: ["Stérilisation", "Prévention des infections"],
				},
				{
					id: "019bef5a-93e4-7746-ad39-622f9d41da55",
					hidden: false,
					icon: "first-aid-kit",
					name: "Soins d'Urgence",
					proficiency: "Intermédiaire",
					level: 4,
					keywords: ["Premiers secours", "Gestes d'urgence"],
				},
				{
					id: "019bef5a-93e4-7746-ad39-6574ab6814bd",
					hidden: false,
					icon: "users",
					name: "Relation Patient",
					proficiency: "Avancé",
					level: 5,
					keywords: ["Écoute", "Accompagnement", "Communication"],
				},
				{
					id: "019bef5a-93e4-7746-ad39-6a8e22bec684",
					hidden: false,
					icon: "clipboard-text",
					name: "Suivi & Traçabilité",
					proficiency: "Intermédiaire",
					level: 4,
					keywords: ["Dossier patient", "Transmissions"],
				},
			],
		},
		languages: {
			title: "",
			columns: 1,
			hidden: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-73807ccc48b5",
					hidden: false,
					language: "Arabe",
					fluency: "Langue maternelle",
					level: 5,
				},
				{
					id: "019bef5a-93e4-7746-ad39-768670459358",
					hidden: false,
					language: "Français",
					fluency: "Courant",
					level: 4,
				},
				{
					id: "019bef5a-93e4-7746-ad39-7a1b2c3d4e5f",
					hidden: false,
					language: "Anglais",
					fluency: "Notions",
					level: 2,
				},
			],
		},
		interests: {
			title: "",
			columns: 1,
			hidden: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-7821b4de95f7",
					hidden: false,
					icon: "heart",
					name: "Bénévolat",
					keywords: ["Croissant-Rouge", "Associations de quartier"],
				},
				{
					id: "019bef5a-93e4-7746-ad39-7c64c1a607d3",
					hidden: false,
					icon: "book-open",
					name: "Lecture médicale",
					keywords: ["Santé publique", "Prévention"],
				},
				{
					id: "019bef5a-93e4-7746-ad39-80bccce3c0ef",
					hidden: false,
					icon: "person-simple-walk",
					name: "Sport",
					keywords: ["Marche", "Natation"],
				},
			],
		},
		awards: {
			title: "",
			columns: 1,
			hidden: true,
			items: [],
		},
		certifications: {
			title: "",
			columns: 1,
			hidden: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-91fe8a4dfea6",
					hidden: false,
					title: "BLS - Basic Life Support",
					issuer: "Croissant-Rouge Marocain",
					date: "Mars 2024",
					website: {
						url: "",
						label: "",
					},
					description: "",
				},
				{
					id: "019bef5a-93e4-7746-ad39-961afccc2508",
					hidden: false,
					title: "AFGSU - Attestation de Formation aux Gestes et Soins d'Urgence",
					issuer: "IMTA",
					date: "Mai 2024",
					website: {
						url: "",
						label: "",
					},
					description: "",
				},
			],
		},
		publications: {
			title: "",
			columns: 1,
			hidden: true,
			items: [],
		},
		volunteer: {
			title: "",
			columns: 1,
			hidden: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-a02580473e05",
					hidden: false,
					organization: "Croissant-Rouge Marocain",
					location: "Tanger, Maroc",
					period: "2022 - Présent",
					website: {
						url: "",
						label: "",
					},
					description:
						"<p>Participation à des campagnes de sensibilisation à la santé et de premiers secours auprès des populations locales. Soutien logistique lors d'événements et de collectes de sang.</p>",
				},
			],
		},
		references: {
			title: "",
			columns: 1,
			hidden: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-a945c0f42dd5",
					hidden: false,
					name: "Disponibles sur demande",
					position: "",
					website: {
						url: "",
						label: "",
					},
					phone: "",
					description: "",
				},
			],
		},
		internships: {
			title: "",
			columns: 1,
			hidden: false,
			items: [
				{
					id: "019bef5a-93e4-7746-ad39-b1c2d3e4f5a6",
					hidden: false,
					company: "Clinique Assalam",
					position: "Stage en Soins Infirmiers (Service de Chirurgie)",
					supervisor: "Dr. Karim El Idrissi",
					location: "Tanger, Maroc",
					period: "Septembre 2023 - Décembre 2023",
					type: "application",
					website: {
						url: "",
						label: "",
					},
					tasksPerformed:
						"<ul><li><p>Réalisé les pansements post-opératoires et surveillé la cicatrisation des plaies</p></li><li><p>Préparé et accompagné les patients avant et après les interventions chirurgicales</p></li><li><p>Assuré le suivi des perfusions et la traçabilité des soins dans le dossier patient</p></li></ul>",
					skillsAcquired: ["Pansements post-opératoires", "Suivi des perfusions", "Préparation pré-opératoire"],
					evaluation:
						"<p>Stagiaire sérieuse, rigoureuse et appréciée de l'équipe soignante. Très bonne maîtrise des gestes techniques.</p>",
				},
			],
		},
	},
	customSections: [
		{
			title: "Expérience",
			columns: 1,
			hidden: true,
			id: "019becaf-0b87-769d-98a6-46ccf558c0e8",
			type: "experience",
			items: [],
		},
	],
	metadata: {
		template: "azurill",
		layout: {
			sidebarWidth: 30,
			pages: [
				{
					fullWidth: false,
					main: ["summary", "education", "experience"],
					sidebar: ["profiles", "skills"],
				},
				{
					fullWidth: false,
					main: ["019becaf-0b87-769d-98a6-46ccf558c0e8", "internships"],
					sidebar: ["languages", "certifications", "interests", "references"],
				},
				{
					fullWidth: true,
					main: ["volunteer"],
					sidebar: [],
				},
			],
		},
		css: {
			enabled: false,
			value: "",
		},
		page: {
			gapX: 4,
			gapY: 8,
			marginX: 16,
			marginY: 14,
			format: "a4",
			locale: "fr-FR",
			hideIcons: false,
		},
		design: {
			level: {
				icon: "acorn",
				type: "circle",
			},
			colors: {
				primary: "rgba(0, 132, 209, 1)",
				text: "rgba(0, 0, 0, 1)",
				background: "rgba(255, 255, 255, 1)",
			},
		},
		typography: {
			body: {
				fontFamily: "IBM Plex Serif",
				fontWeights: ["400", "600"],
				fontSize: 11,
				lineHeight: 1.5,
			},
			heading: {
				fontFamily: "Fira Sans Condensed",
				fontWeights: ["500"],
				fontSize: 18,
				lineHeight: 1.5,
			},
		},
		notes: "",
	},
};
