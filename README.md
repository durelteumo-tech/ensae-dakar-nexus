# ENSAE Dakar — Nexus (Plateforme Collaborative Étudiante)

Plateforme collaborative **Dark-Mode & Néon** conçue pour les étudiants de l'**ENSAE Dakar** (Club Informatique & Promotions ISE / AS). Elle centralise le partage de ressources académiques certifiées, la génération de QCM par IA, et le matchmaking de projets inter-promotions.

---

## Stack Technique

- **Frontend** : Next.js 15 (App Router) + React 19 + TypeScript
- **Styling** : Tailwind CSS (configuration personnalisée Dark Mode natif & accents néon `#00F0FF`, `#00FFA3`, `#A855F7`)
- **Icônes** : `lucide-react`
- **Backend / Données (MVP)** : Fichiers JSON locaux (`src/data/*.json`) structurés pour une migration directe vers **Supabase** (Auth, PostgreSQL, Storage).

---

## Arborescence du Projet

```text
Projet_Club_Info/
├── public/
│   └── Logo_ensae.png              # Logo officiel de l'ENSAE Dakar
├── src/
│   ├── app/
│   │   ├── globals.css             # Styles globaux, scrollbar cyber, utilitaires néon
│   │   ├── layout.tsx              # Layout racine (polices Space Grotesk, Inter, JetBrains Mono)
│   │   ├── page.tsx                # Dashboard Étudiant (vue principale & historique d'activité)
│   │   ├── login/
│   │   │   └── page.tsx            # Authentification simulée (accès restreint @ensae.sn)
│   │   ├── resources/
│   │   │   └── page.tsx            # Hub de Ressources (PDF, R, Python)
│   │   ├── qcm/
│   │   │   └── page.tsx            # Générateur de QCM (Mock IA)
│   │   └── matchmaking/
│   │       └── page.tsx            # Matchmaking de Projets & CTA messagerie directe
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx        # Shell principal (Sidebar + Topbar + contenu)
│   │   │   └── Sidebar.tsx         # Navigation latérale avec logo ENSAE et statut session
│   │   ├── dashboard/
│   │   │   ├── ActivityFeed.tsx    # Flux d'activité récente de l'étudiant
│   │   │   └── StatCard.tsx        # Cartes KPI à fort contraste
│   │   └── ui/
│   │       └── NeonBadge.tsx       # Badges de certification ("100% Validé", "Top Promo", etc.)
│   ├── data/
│   │   ├── activities.json         # Historique d'activité mock
│   │   ├── resources.json          # Ressources académiques mock
│   │   └── students.json           # Profils étudiants pour matchmaking mock
│   └── types/
│       └── index.ts                # Interfaces TypeScript partagées
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.js              # Palette sombre & néon personnalisée
└── tsconfig.json
```

---

## Commandes pour lancer le projet

### Prérequis
- **Node.js** >= 18.18 (ou >= 20 LTS) et **npm** installés sur la machine.

### Installation et démarrage

```bash
# 1. Se placer dans le répertoire du projet
cd C:\Users\GENERAL\Desktop\Projet_Club_Info

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

Ouvrir ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Autres commandes utiles

```bash
# Build de production
npm run build

# Lancer le build de production
npm run start

# Vérifier le linting
npm run lint
```

---

## Roadmap MVP

- [x] **Phase 1** : Arborescence, `README.md`, configuration `tailwind.config.js` Dark/Néon, Layout, Navigation et Dashboard Étudiant.
- [ ] **Phase 2 (après validation)** : Logique interactive du Hub de Ressources, Générateur de QCM (Mock IA), Matchmaking de Projets et écran d'Authentification.
- [ ] **Phase 3** : Connexion à **Supabase** (Auth `@ensae.sn`, Storage PDF/R/Python, base PostgreSQL) et API IA réelle pour les QCM.
