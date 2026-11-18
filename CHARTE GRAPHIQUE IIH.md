# Charte graphique et spécification du dashboard
Projet : plateforme d'orientation des entrepreneurs agri-agro vers les SAEI (Bénin, Sénégal, Côte d'Ivoire)
À donner à OpenCode avec la consigne : « Respecte strictement cette charte. N'invente aucune couleur, police ni espacement hors de ce fichier. »

Source : captures de référence fournies (dashboard vert, police de la capture « police »). Les couleurs ont été relevées pixel par pixel sur les captures.

---

## 1. Principes

1. Interface sobre, aérée, cartes blanches arrondies sur fond gris-vert très clair.
2. Une seule famille de couleur : le vert. Pas de bleu, rouge ou orange sauf états d'erreur et d'alerte (section 2.4).
3. Le vert foncé porte la structure (barre latérale, cartes chiffres clés). Le vert vif porte l'action (boutons, courbes, points).
4. Mobile d'abord : tout doit rester lisible dès 360 px de large.

---

## 2. Couleurs

### 2.1 Jetons (copier tels quels)

```css
:root {
  /* Verts de structure (relevés sur la capture) */
  --green-sidebar-top:    #3a6b5a;  /* haut de la barre latérale */
  --green-sidebar-bottom: #326453;  /* bas de la barre latérale */
  --green-deep:           #2c5f4e;  /* cartes chiffres clés */
  --green-deep-hover:     #356b59;

  /* Verts d'action */
  --green-accent:         #22c55e;  /* boutons, courbes, points actifs */
  --green-accent-hover:   #16a34a;
  --green-icon-active:    #6bc385;  /* pastille d'icône active, avatar */
  --green-badge-on-deep:  #3d7d5c;  /* pastille d'état sur carte foncée (texte blanc, contraste 4,9:1) ; la capture montre #50986d, trop clair pour du texte blanc */
  --green-badge-high:     #6bc285;

  /* Échelle graphiques (graphique en anneau) */
  --chart-1: #22c55e;
  --chart-2: #16a34a;
  --chart-3: #15803d;
  --chart-4: #166534;
  --chart-5: #14532d;
  --chart-6: #052e16;

  /* Surfaces */
  --bg-page:     #f8faf9;  /* fond de page */
  --bg-card:     #ffffff;
  --bg-input:    #fafcfb;  /* champs de filtre */
  --bg-row:      #f4f7f5;  /* lignes de liste dans les cartes */
  --bg-live-pill:#dcfce7;  /* pastille "monitoring actif" */

  /* Texte */
  --text-strong: #0f1f18;  /* titres */
  --text-body:   #374841;
  --text-muted:  #5f7068;  /* sous-titres, légendes (contraste 5,2:1 sur blanc) */
  --text-on-deep:#ffffff;
  --text-on-deep-muted: #cfe5da;

  /* Bordures */
  --border:      #e6ece9;

  /* États (usage restreint) */
  --danger:      #ef4444;  /* tendance négative, ligne de seuil */
  --warning:     #f59e0b;
  --info:        #16a34a;
}
```

### 2.2 Dégradé de la barre latérale
`linear-gradient(180deg, #3a6b5a 0%, #326453 100%)`

### 2.3 Règles d'usage

| Élément | Couleur |
| --- | --- |
| Fond de page | `--bg-page` |
| Cartes (filtres, graphiques) | `--bg-card` + ombre douce |
| Cartes chiffres clés | `--green-deep`, texte blanc |
| Bouton principal | `--green-accent`, texte `#052e16` (pas de blanc) |
| Icône de menu active | pastille `--green-icon-active`, icône `#14532d` (le blanc est trop peu contrasté) |
| Icônes de menu inactives | pastille semi-transparente (`rgba(255,255,255,0.12)`), icône `--text-on-deep-muted` |
| Tendance positive | `--green-badge-high` |
| Tendance négative | `--danger` |
| Courbe principale | `--green-accent`, épaisseur 3 px, points pleins de 8 px |
| Ligne de seuil | `--danger`, pointillés `6 6` |

### 2.4 Contrastes
Texte blanc sur `--green-deep` : rapport supérieur à 7:1 (conforme WCAG AAA). Ne jamais mettre de texte blanc sur `--green-accent` ni sur `--green-icon-active` : utiliser `#052e16` ou `#14532d`.

---

## 3. Typographie

**Police : Poppins** (la police de la capture « police » est une sans-serif géométrique, très proche de Poppins ; si elle diffère, remplacer uniquement `--font-family`).

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
:root { --font-family: 'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif; }
body { font-family: var(--font-family); color: var(--text-body); background: var(--bg-page); }
```

| Usage | Taille | Graisse | Interligne |
| --- | --- | --- | --- |
| Salutation (« Bonjour, … ») | 24 px | 600 | 1.25 |
| Sous-titre de page | 14 px | 400, `--text-muted` | 1.4 |
| Titre de carte | 18 px | 600 | 1.3 |
| Description de carte | 13 px | 400, `--text-muted` | 1.45 |
| Valeur chiffre clé | 30 px | 700 | 1.1 |
| Unité à côté de la valeur | 14 px | 500 | |
| Libellé de chiffre clé | 12 px | 500, majuscules, `letter-spacing: 0.04em` | |
| Pastille d'état | 11 px | 500 | |
| Corps de texte | 14 px | 400 | 1.55 |
| Texte de liste ou de tableau | 14 px | 500 | |
| Axes et légendes de graphique | 12 px | 400, `--text-muted` | |

Les chiffres sont en chiffres tabulaires : `font-variant-numeric: tabular-nums;`.

---

## 4. Mise en page (d'après la capture, largeur 1366 px)

### 4.1 Structure générale
```
┌────────┬──────────────────────────────────────────────────────────┐
│ Barre  │  Salutation + sous-titre                  [pastille live] │
│ laté-  │  ┌─ Barre de filtres (carte) ─────────────────────────┐   │
│ rale   │  └─────────────────────────────────────────────────────┘   │
│ flot-  │  ┌KPI 1──┐ ┌KPI 2──┐ ┌KPI 3──┐ ┌KPI 4──┐                  │
│ tante  │  └───────┘ └───────┘ └───────┘ └───────┘                  │
│        │  ┌─ Carte graphique 1 ──┐ ┌─ Carte graphique 2 ───────┐   │
│        │  └──────────────────────┘ └───────────────────────────┘   │
└────────┴──────────────────────────────────────────────────────────┘
```

### 4.2 Barre latérale
- Flottante : marge de 22 px (haut, gauche, bas), largeur 68 px, hauteur `calc(100vh - 44px)`, rayon 28 px.
- Dégradé de la section 2.2.
- Logo en haut : pastille ronde 44 px, fond `--green-icon-active`, icône blanche.
- Menu : pastilles rondes 44 px, espacées de 14 px, icône 20 px. Pastille active : fond `--green-icon-active`, icône `#14532d`.
- Avatar en bas : pastille ronde 44 px avec initiales (`--green-icon-active`).
- Sur mobile (moins de 768 px) : devient une barre horizontale en bas de l'écran.
- Au survol : infobulle avec le nom de la page.

### 4.3 Zone de contenu
- Marge gauche : 112 px (22 + 68 + 22), marge droite 24 px, marge haute 28 px.
- Largeur maximale du contenu : 1280 px.
- Espacement vertical entre blocs : 20 px.

### 4.4 Barre de filtres
- Carte blanche, rayon 16 px, remplissage 20 px, ombre `0 1px 3px rgba(15,31,24,0.06)`.
- 4 champs de sélection + 1 bouton, en ligne ; sur tablette 2 par ligne ; sur mobile 1 par ligne.
- Champ : libellé 12 px au-dessus, boîte `--bg-input`, bordure `--border`, rayon 10 px, hauteur 40 px, chevron à droite.
- Bouton « Appliquer » : fond `--green-accent`, texte vert très foncé `#052e16` en 600 (contraste 6,6:1 ; le blanc sur ce vert n'atteint que 2,3:1), rayon 10 px, hauteur 44 px, icône entonnoir à gauche.

### 4.5 Cartes chiffres clés (4 en ligne)
- Fond `--green-deep`, rayon 16 px, remplissage 20 px, hauteur minimale 98 px, écart 14 px.
- Ligne 1 : libellé (majuscules, blanc) à gauche, pastille d'état à droite (fond `--green-badge-on-deep`, texte blanc, rayon 999 px).
- Ligne 2 : valeur 30 px blanc 700 + unité 14 px `--text-on-deep-muted`.
- Ligne 3 : description 12 px `--text-on-deep-muted` à gauche, tendance à droite (flèche + pourcentage, vert clair ou rouge).
- Mobile : 2 par ligne, puis 1.

### 4.6 Cartes graphiques (2 colonnes)
- Fond blanc, rayon 16 px, remplissage 24 px, ombre douce.
- En-tête : titre 18 px + description 13 px.
- Colonne gauche : graphique en anneau (valeur totale au centre), légende en dessous, puis liste d'état.
- Colonne droite : 3 indicateurs en tête (valeur 24 px, libellé 12 px), courbe, légende, puis liste d'analyse.
- Liste d'état : lignes `--bg-row`, rayon 10 px, remplissage 10 px 14 px, point coloré à gauche et valeur à droite.
- Mobile : une seule colonne.

### 4.7 Pastille « monitoring actif »
En haut à droite : fond `--bg-live-pill`, point `--green-accent`, texte `--green-accent-hover` 12 px 500, rayon 999 px. Dans notre application : « Données à jour » avec la date de la dernière mise à jour.

### 4.8 Rayons, ombres, animations
- Rayons : 10 px (champs), 16 px (cartes), 28 px (barre latérale), 999 px (pastilles).
- Ombre carte : `0 1px 3px rgba(15,31,24,0.06), 0 8px 24px rgba(15,31,24,0.04)`.
- Transitions : 150 ms ease-out sur survol et couleur ; graphiques animés 600 ms au chargement ; respecter `prefers-reduced-motion`.

---

## 5. Pile technique pour le frontend
- React + Vite, Tailwind CSS (jetons ci-dessus dans `tailwind.config.js` sous `theme.extend.colors`), Recharts pour les graphiques, lucide-react pour les icônes, React Router.
- Composants à créer : `Sidebar`, `PageHeader`, `FilterBar`, `StatCard`, `DonutCard`, `LineCard`, `StatusList`, `Badge`, `DataTable`, `PendingRequests`.
- Aucune couleur écrite en dur dans les composants : tout passe par les jetons.

```js
// tailwind.config.js (extrait)
theme: { extend: {
  fontFamily: { sans: ['Poppins', 'system-ui', 'sans-serif'] },
  colors: {
    sidebar: { top: '#3a6b5a', bottom: '#326453' },
    deep: '#2c5f4e',
    accent: { DEFAULT: '#22c55e', hover: '#16a34a' },
    iconActive: '#6bc385',
    page: '#f8faf9', row: '#f4f7f5', input: '#fafcfb',
    ink: { strong: '#0f1f18', body: '#374841', muted: '#6b7c74' },
  },
  borderRadius: { card: '16px', field: '10px', side: '28px' },
}}
```

---

## 6. Menu selon le rôle

| Entrée de menu | Icône (lucide) | ADMIN | SUPER_ADMIN |
| --- | --- | --- | --- |
| Tableau de bord | `LayoutDashboard` | oui | oui |
| Statistiques | `BarChart3` | oui | oui |
| Structures (annuaire) | `Building2` | oui | oui |
| Demandes SAEI | `UserCheck` | oui | oui |
| Utilisateurs | `Users` | oui (entrepreneurs et SAEI) | oui (tous) |
| Import / export Excel | `FileSpreadsheet` | oui | oui |
| Administrateurs | `ShieldCheck` | non | oui |
| Paramètres et journal d'activité | `Settings` | non | oui |

Le menu est construit depuis le rôle dans le jeton JWT (`role`). Une route interdite renvoie vers le tableau de bord, jamais vers une page d'erreur brute.

---

## 7. Dashboard : contenu et données

Salutation : « Bonjour, {prénom} ! » ; sous-titre : « Voici l'état de l'écosystème d'accompagnement ».

### 7.1 Filtres (communs)
| Filtre | Valeurs |
| --- | --- |
| Pays | Tous, Bénin, Sénégal, Côte d'Ivoire |
| Type de structure | Toutes, incubateur, accélérateur, recherche et innovation, appui technique, financement, plateforme et réseau |
| Source | Enquêtées, revue documentaire |
| Période | 7 jours, 30 jours, 12 mois, Tout |
Bouton : « Appliquer ».

### 7.2 Cartes chiffres clés

**ADMIN**
| Libellé | Valeur | Pastille | Description |
| --- | --- | --- | --- |
| STRUCTURES | total des structures publiées | normal / à compléter | Fiches dans l'annuaire |
| DEMANDES SAEI | nombre de demandes en attente | à traiter si supérieur à 0 | Comptes à valider |
| ENTREPRENEURS | comptes entrepreneurs | normal | Inscrits sur la plateforme |
| COMPLÉTUDE | pourcentage de fiches complètes | optimal si supérieur à 80 % | Qualité des données |

**SUPER_ADMIN** : les 4 cartes de l'ADMIN, plus une seconde ligne de 4 cartes :
| Libellé | Valeur | Description |
| --- | --- | --- |
| ADMINISTRATEURS | nombre d'ADMIN actifs | Comptes de gestion |
| IMPORTS | dernier import (date) | Fichiers Excel |
| RECOMMANDATIONS | nombre de recommandations générées | Usage de l'outil |
| TAUX DE VALIDATION | pourcentage de demandes SAEI approuvées | Délai moyen de traitement |

### 7.3 Graphique 1 (anneau) : « Répartition des structures »
- Anneau : structures par pays ou par typologie (selon le filtre), total au centre.
- Légende : 6 segments avec l'échelle `--chart-1` à `--chart-6`.
- Liste d'état « Statut des pays » : Bénin, Sénégal, Côte d'Ivoire avec nombre de structures et point vert si les données sont à jour.

### 7.4 Graphique 2 (courbe) : « Activité de la plateforme »
- Courbe : recommandations générées par jour (ou inscriptions), ligne de seuil en pointillés rouges (objectif).
- 3 indicateurs en tête : moyenne par jour, pic, taux de réussite (résultats cliqués).
- Liste « Analyse » : jour de pic, jour le plus calme, écart.

### 7.5 Blocs supplémentaires (sous les graphiques)
1. **Demandes SAEI en attente** : tableau (nom de la structure, pays, ville, date, boutons Approuver et Refuser).
2. **Besoins non couverts** : barres horizontales (financement adapté, suivi après accompagnement, accès aux marchés, prototypage, coordination).
3. **Couverture géographique** : carte ou classement des villes ; mettre en évidence les zones peu couvertes.
4. **Stades couverts** : idéation, incubation, accélération, développement.
5. **SUPER_ADMIN seulement** : tableau des administrateurs (créer, désactiver) et journal d'activité (qui a approuvé, importé, supprimé).

### 7.6 API à appeler
| Endpoint | Rôle |
| --- | --- |
| `GET /api/admin/dashboard/?pays=&typologie=&source=&periode=` | Chiffres clés et séries pour les graphiques |
| `GET /api/admin/saei-requests/?status=PENDING` | Demandes en attente |
| `POST /api/admin/saei-requests/{id}/approve/` et `/reject/` | Validation |
| `GET /api/admin/admins/` (SUPER_ADMIN) | Liste des administrateurs |
| `GET /api/admin/audit-log/` (SUPER_ADMIN) | Journal d'activité |

---

## 8. Accessibilité et qualité
- Contrastes WCAG AA minimum, focus visible (anneau 2 px `--green-accent`), navigation au clavier, `aria-label` sur les boutons d'icône.
- Toutes les valeurs ont une alternative texte ; ne jamais coder un état uniquement par la couleur (ajouter un texte ou une icône).
- Squelettes de chargement gris-vert sur les cartes, message clair en cas d'erreur ou de liste vide.
- Textes en français, dans un fichier de traduction séparé.

---

## 9. Consigne à copier dans OpenCode

```text
Construis le frontend React (Vite + Tailwind + Recharts + lucide-react) en respectant à la lettre le fichier CHARTE_GRAPHIQUE_IIH_Orientation.md.
1. Mets les jetons des sections 2 et 3 dans tailwind.config.js et src/styles/tokens.css. N'écris aucune couleur en dur dans les composants.
2. Crée la mise en page de la section 4 : Sidebar flottante, PageHeader, FilterBar, StatCard, DonutCard, LineCard, StatusList.
3. Construis la page Dashboard pour les rôles ADMIN et SUPER_ADMIN selon la section 7, avec le menu de la section 6 construit depuis le rôle du jeton JWT.
4. Branche les composants sur l'API de la section 7.6 ; tant que l'API n'existe pas, utilise un fichier mock src/mocks/dashboard.json avec les mêmes champs.
5. Rends la page responsive (mobile 360 px, tablette, ordinateur) et accessible (section 8).
6. À la fin, lance le build et montre une capture de chaque taille d'écran.
```