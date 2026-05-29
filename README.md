# IMTA Resume

Plateforme de carrière française pour les étudiants de l'Institut des Métiers et Techniques Appliqués (IMTA) Maroc. Créez, gérez et partagez votre CV professionnel adapté au marché marocain.

## Fonctionnalités

**Création de CV**

- Aperçu en temps réel pendant la saisie
- Export PDF et JSON
- Réorganisation des sections par glisser-déposer
- Éditeur de texte enrichi
- 35 modèles professionnels (formats A4 et Lettre)

**Préparation à l'emploi (spécifique IMTA)**

- Simulation d'entretiens avec IA
- Coaching carrière adapté aux filières IMTA
- Bibliothèque de compétences par domaine (santé, industrie, HSE)
- Suivi de progression et objectifs professionnels
- Accès aux offres d'emploi des partenaires IMTA

**Gestion du compte**

- Authentification sécurisée (Better Auth)
- Données stockées sur votre propre infrastructure
- Aucun tracking par défaut
- Export et suppression des données à tout moment

**Accessibilité & Langues**

- Interface en français (prioritaire)
- Support de l'arabe (Darija inclus)
- 50+ langues disponibles via Lingui
- Support RTL intégré

## Stack Technique

| Catégorie          | Technologie                          |
| ------------------ | ------------------------------------ |
| Framework          | TanStack Start (React 19, Vite)      |
| Runtime            | Node.js                              |
| Langage            | TypeScript                           |
| Base de données    | PostgreSQL + Drizzle ORM             |
| API                | ORPC (RPC typé)                      |
| Authentification   | Better Auth                          |
| Style              | Tailwind CSS v4                      |
| Composants UI      | Radix UI                             |
| État               | Zustand + TanStack Query             |
| IA                 | DeepSeek, OpenAI, Gemini, Anthropic  |

## Démarrage rapide

```bash
# Cloner le dépôt
git clone <YOUR_REPO_URL>
cd imta-resume

# Copier et configurer les variables d'environnement
cp .env.example .env

# Démarrer les services requis (PostgreSQL, Chromium, S3, Mail)
docker compose -f compose.dev.yml up -d

# Installer les dépendances
pnpm install

# Démarrer le serveur de développement (port 3040)
pnpm dev
```

## Comptes de test

| Email                | Mot de passe       | Rôle      |
| -------------------- | ------------------ | --------- |
| admin@test.com       | TestAccount123!    | admin     |
| student1@test.com    | TestAccount123!    | étudiant  |
| student2@test.com    | TestAccount123!    | étudiant  |
| partner@test.com     | TestAccount123!    | partenaire|

## Commandes utiles

```bash
pnpm dev               # Serveur de développement (port 3040)
pnpm build             # Build de production
pnpm typecheck         # Vérification TypeScript
pnpm lint              # Linting Biome
pnpm db:generate       # Générer les migrations
pnpm db:migrate        # Appliquer les migrations
pnpm db:studio         # Ouvrir Drizzle Studio
pnpm lingui:extract    # Extraire les chaînes i18n
```

> **Note production :** La commande build nécessite `NODE_OPTIONS=--max-old-space-size=8192` pour éviter les erreurs de mémoire.

## Programmes IMTA supportés

- **Santé (4 filières)** : infirmier/ère, aide-soignant/e, kinésithérapie, pharmacie
- **Industrie (6 filières)** : soudure, conduite d'engins, électrotechnique, mécanique, maintenance, logistique
- **HSE (1 filière)** : hygiène sécurité environnement

Chaque programme dispose d'une interface adaptée avec les fonctionnalités pertinentes activées.

## Licence

Ce projet est un fork de [Reactive Resume](https://github.com/amruthpillai/reactive-resume) par Amruth Pillai, distribué sous licence [MIT](./LICENSE). Les modifications apportées pour la plateforme IMTA Resume sont également sous licence MIT.
