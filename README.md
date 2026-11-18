# AgriBoussole — Frontend

Application web progressive (PWA) d’orientation des entrepreneurs agri-agro vers les
structures d’accompagnement (SAEI) au Bénin, au Sénégal et en Côte d’Ivoire.

Le suivi d’avancement et la feuille de route se trouvent dans
[`../SUIVI.md`](../SUIVI.md).

## Stack

- React 19 + TypeScript 7
- Vite 8
- Tailwind CSS 4 + shadcn/ui (preset `radix-nova`, restylé selon la charte IIH)
- Charte graphique IIH : Poppins locale, palette verte, sidebar flottante sur les dashboards, navbar haute et footer complet sur les pages publiques, Recharts
- React Router 7
- Axios (intercepteurs JWT + refresh)
- React Hook Form + Zod
- `useReducer` + Context pour l’état d’authentification (pas de librairie d’état)
- `vite-plugin-pwa` (Workbox, manifest, service worker, mode hors ligne)
- `sonner` (notifications, thème clair forcé)
- Oxlint

## Démarrage

```bash
npm install
cp .env.example .env   # adapter VITE_API_URL si besoin
npm run dev            # http://localhost:5173
```

Le backend Django doit tourner sur `http://127.0.0.1:8000` (valeur par défaut de
`VITE_API_URL`, le suffixe `/api` est ajouté par le client).

### Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run dev:host` | Développement accessible sur le réseau local (test mobile) |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | Analyse Oxlint |
| `npm run build` | Build de production + service worker |
| `npm run preview` | Prévisualisation du build (tester la PWA ici) |
| `npm run pwa:icons` | Régénère les icônes PWA depuis `public/logo.svg` |

> La PWA n’est pas active en mode `dev` (`devOptions.enabled: false`).
> Pour la tester : `npm run build && npm run preview`, puis vérifier le manifest et
> le service worker dans les DevTools.

## Structure

```
src/
├── components/
│   ├── ui/                  # Composants shadcn/ui générés (restyle charte)
│   ├── layout/              # Shells dashboard/public, sidebar, navbar haute, footer, navigation par rôle
│   ├── loading-screen.tsx
│   └── pwa-update-prompt.tsx
├── features/
│   ├── auth/                # useReducer, contexte, garde de rôles
│   ├── dashboard/           # Composants du dashboard + types + filtres
│   ├── admin/               # Tableau des demandes SAEI, champs de filtre
│   ├── engagement/          # Flux d’indicateurs partagé (like + commentaires)
│   ├── structures/          # Cards compactes, recherche combinée (debounce + 5 selects)
│   └── phase/               # Quiz + recommandations automatiques de structures
├── lib/api/                 # client Axios, endpoints auth/structures/admin/engagement, types
├── mocks/dashboard.json     # Données de démo (API dashboard absente)
├── pages/                   # Pages routées, dont /admin/*
├── App.tsx                  # Router
├── index.css                # Jetons de la charte + mapping shadcn + Poppins
└── main.tsx                 # Providers globaux
```

## Conventions

- Imports absolus via l’alias `@/`.
- Composants en `PascalCase`, fichiers en `kebab-case`.
- Aucun appel HTTP direct dans les composants : passer par `src/lib/api/*`.
- Les erreurs API sont normalisées par `getApiError()` (format backend
  `{ error, message, status?, errors? }`).
- L’état d’authentification est exposé par `useAuth()`.
- Les routes privées utilisent `<RequireAuth roles={[...]}>` ; une route interdite
  renvoie vers l’espace d’accueil du rôle (`/phase` pour un entrepreneur).
- Aucune couleur en dur dans les composants : utiliser les jetons définis dans
  `src/index.css` (`bg-deep`, `text-ink-muted`, `rounded-card`, `shadow-card`, …).
- Le dashboard admin utilise `src/mocks/dashboard.json` tant que
  `GET /api/admin/dashboard/` n’existe pas ; les listes admin sont réelles.
- L’annuaire envoie `search`, `pays`, `ville`, `typologie`, `cible` et `stade`
  à `GET /api/structures/` ; la recherche est debouncée (300 ms), les filtres sont
  synchronisés avec l’URL et la page revient à 1 dès qu’un filtre change.
- Un entrepreneur est redirigé vers `/phase` après connexion/inscription tant que
  le quiz n’a pas été fait. Le score est calculé par le backend via
  `POST /api/auth/entrepreneurs/phase/` ; il n’existe pas de tableau de bord entrepreneur.
- Après le quiz, les structures du pays sont proposées automatiquement, triées par ville
  et phase, avec repli sur l’annuaire complet si le pays est vide.

## Parcours implémentés

### Entrepreneur (navbar haute + footer)

- `/phase` : quiz, résultat et recommandations.
- `/offres` : offres publiées, conditions d’éligibilité et dépôt de candidature.
- `/indicateurs` : indicateurs des SAEI, likes et commentaires.
- `/candidatures` : suivi du statut des candidatures.
- `/notifications` : notifications reçues.
- `/messages` : chat avec les SAEI + évaluation de l’équipe sur 5 étoiles.
- `/structures/:id` : fiche détaillée, bouton WhatsApp et demande d’insertion
  (emails automatiques au SAEI et à l’entrepreneur).
- `/profil` : informations modifiables et photo de profil.

### SAEI (sidebar dépliable)

- `/tableau-de-bord` : KPI de la structure.
- `/saei/entrepreneurs` : profils, phase, notification personnelle, ajout à l’équipe.
- `/saei/offres` : création d’offres et traitement des candidatures.
- `/saei/indicateurs` : publication texte/image/vidéo, likes et commentaires.
- `/saei/equipe` : membres, tâches, formations et évaluations reçues.
- `/saei/notifications`, `/saei/messages`, `/saei/profil` (logo modifiable).

Le chat est implémenté en REST avec un polling de 5 secondes (`?after=`) : aucun
WebSocket n’est utilisé. Les JWT restent dans `localStorage`.

### Formulaires en modale

Le formulaire d’accréditation SAEI n’est plus affiché directement dans l’espace
entrepreneur : la page `/inscription/saei` présente un message et un bouton qui
ouvrent un `Dialog` shadcn contenant le formulaire multipart complet. Le lien
« Devenir une SAEI » n’apparaît que pour les visiteurs non connectés (navbar,
footer et accueil). Ce motif de `Dialog` est utilisé pour la majorité des
actions : publication d’offre, candidature, indicateur, membre/tâche d’équipe,
demande d’insertion depuis une fiche structure et évaluation d’une SAEI.
Les formulaires de connexion, d’inscription entrepreneur et d’édition du profil
restent des pages dédiées.

Dans la modale SAEI, le pays alimente `GET /api/villes/?pays=<code>`, le
département filtre la ville, et `GET /api/publics-cibles/` fournit la checklist
des publics présents dans la base. Le site web est facultatif. Les modales
utilisent un padding de `p-6` sur tous les bords. En développement, `VITE_API_URL`
accepte l’URL avec ou sans `/api`, et un proxy Vite `/api` évite les 404 si la
variable manque. Redémarrez le backend après tout changement de routes.

## Comptes et rôles

| Rôle | Accès |
|---|---|
| `ENTREPRENEUR` | `/phase`, offres, indicateurs, candidatures, messages, profil, annuaire — aucun dashboard |
| `SAEI` | Connexion si le statut est `APPROVED` ; espace avec sidebar dépliable |
| `ADMIN` | `/admin` : dashboard, demandes SAEI, utilisateurs, administrateurs, annuaire |

Un compte SAEI `PENDING` reçoit une erreur 403 explicite à la connexion.
Les identifiants locaux sont consignés dans [`../COMPTES.md`](../COMPTES.md).
