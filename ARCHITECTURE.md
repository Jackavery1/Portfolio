# Architecture — Portfolio Arcade

Documentation de la structure, patterns, et décisions architecturales du projet.

## Vue d'ensemble

Architecture en **3 couches** : configuration → utilitaires → modules métier.

```
index.html / pages/*.html (coquille statique)
    ↓
js/main.js (orchestrateur)
    ↓
    ├── js/config/ (données : projets, legal, selectors, storage)
    ├── js/utils/ (fonctions pures : dom, focus, validation, contact-form)
    └── js/modules/ (logique métier : contact, navigation, score, modal, dojo)
```

## Principes de design

### 1. Séparation claire domaine / UI / I/O

- **Domaine** : `js/config/` (données), `js/utils/` (logique)
- **UI** : `js/modules/` (orchestration, événements)
- **I/O** : reCAPTCHA, Formspree, storage, service worker

**Bénéfice** : testabilité isolée, refactor sans friction.

### 2. Lazy-loading par section

Registry centralisée dans `js/config/sections.js` ; `main.js` appelle `initialiserSection(sid)`.

```javascript
// js/config/sections.js — INITIALISEURS_SECTION[sid] → import dynamique + initialiser*
```

Sections dynamiques : `projets`, `accueil`, `dojo`, `contact`, `mentions`. Musique via `musique-loader.js` → `musique.js` (UI) → `musique-sequencuer.js` (scheduler) → `musique-audio.js` (Web Audio) ; grilles compilées dans `musique-themes.json` (fetch). Réduit le bundle initial (~50% minification).

### Stack musique

| Module                  | Rôle                                                                       |
| ----------------------- | -------------------------------------------------------------------------- |
| `musique-loader.js`     | Import dynamique, point d'entrée `main.js`                                 |
| `musique.js`            | Bouton, préférences localStorage, jingles                                  |
| `musique-sequencuer.js` | Planification lookahead, grilles et résolution section → thème             |
| `musique-audio.js`      | Oscillateurs, percussions Web Audio                                        |
| `musique-donnees.json`  | Source éditable → `build/sync-musique-donnees.cjs` → `musique-themes.json` |

### 3. Modules découplés

Chaque module exporte une fonction d'initialisation (`initialiser*`) :

- `js/modules/contact.js` → `initialiserPageContact()`
- `js/modules/navigation.js` → `initialiserNavigationArcade()`
- `js/modules/score.js` → barrel `score-session.js` + `popup-highscore.js`

Pas d'état partagé global ; data via localStorage ou paramètres de fonction.

### 4. Tests colocalisés

```
js/modules/contact-form.js
js/modules/contact-form.test.js  ← même dossier
```

Approche **test-per-module** : Vitest + Playwright e2e (voir `npm test` / `npm run test:e2e`), environnement `node` avec jsdom via `environmentMatchGlobs` (`vitest.config.js`) ; `vi.mock` pour config et I/O externes.

## Structure fichiers

| Chemin        | Rôle                              | Exemple                                                            |
| ------------- | --------------------------------- | ------------------------------------------------------------------ |
| `js/config/`  | Données centralisées (read-only)  | `projects.json` → `projects-data.js` (généré)                      |
| `js/utils/`   | Fonctions pures                   | `dom.js` (querySelector), `validation.js` (email)                  |
| `js/modules/` | Logique métier + UI               | `contact.js` (API orchestration)                                   |
| `styles/`     | Design tokens + components        | `tokens.css` (couleurs, typo), `components/` (réutilisables)       |
| `partials/`   | Fragments HTML générés            | `parcours-arbre.html` (assemblé depuis `partials/parcours-arbre/`) |
| `build/`      | Pipeline : sync, minify, optimize | `build/sync-source.cjs`, `build/html.cjs`, `build/sw.cjs`          |
| `e2e/`        | Tests end-to-end Playwright       | `responsive-*.spec.js`, `fixtures/`                                |

### Dualité ESM (runtime) / CJS (build)

| Couche            | Format                                 | Rôle                                                                                       |
| ----------------- | -------------------------------------- | ------------------------------------------------------------------------------------------ |
| `js/`             | **ESM** (`import` / `export`)          | Modules chargés par le navigateur (`type="module"`)                                        |
| `build/`          | **CJS** (`require` / `module.exports`) | Scripts Node I/O (sync, minify, SW) — modules I/O lourds                                   |
| `build/*.mjs`     | **ESM** (données pures)                | `config-defaults.mjs`, `page-meta.mjs`, `page-meta-tags.mjs`, `page-styles.mjs`, `json-ld.mjs`, `url-page.mjs`, `breakpoints.mjs`, `partials-list.mjs` — `require()` depuis CJS (Node ≥20) |
| `build.mjs`       | **ESM** (entrée build)                 | Orchestration via `build/cjs-bridge.mjs` → `loadBuild()`                                   |
| `build/*.test.js` | ESM                                    | `loadBuild()` via `build/cjs-bridge.mjs` ou `createRequire` ciblé                          |

**Pont** : `build/cjs-bridge.mjs` expose `loadBuild('env.cjs')` — point d’entrée ESM unique sans migrer tout le pipeline CJS (CLI `require.main`, I/O synchrone).

#### Build HTML prod (`build/html*.cjs`)

Orchestrateur : `build/html.cjs` (`copyHTML`). Modules dédiés :

| Module | Rôle |
| ------ | ---- |
| `html-files.cjs` | Liste des pages (`HTML_FILES`) |
| `html-seo.cjs` | Meta page, canonical, OG absolu, JSON-LD |
| `html-head.cjs` | `head-common`, polices async, CSS prod |
| `html-partials-inline.cjs` | Inlining des placeholders partials |
| `html-csp.cjs` | Injection CSP après viewport |

Ordre d’injection dans le `<head>` :

1. Preload police **VT323** uniquement (`partials/fonts-async.html`) — corps CRT au LCP ; Press Start 2P et Rajdhani via `@font-face` à la demande.
2. Preload + stylesheet `style-base.css` puis `style-page-*.css`.
3. Polices : preload **Press Start 2P** (LCP hero) via `partials/fonts-async.html` ; VT323 et Rajdhani à la demande.
4. JS non critique (`konami`, `animations`, `service-worker-register`) chargé en `import()` après `data-app-ready` / `requestIdleCallback`.

### Pipeline `sync-source`

Orchestrateur : `build/sync-source.cjs` — phases ordonnées exportées via `getSyncPhases()` / `IDS_PHASES_SYNC` :

1. `defaults` → `style-css` → `partials` → `nav-squelette`
2. Partials HTML : `parcours-arbre`, `dojo-boss` (3 lots), `competences-stats`, `accueil-hero`
3. `breakpoints` → `legal` → `projects` → `musique-donnees` → `manifest-dev`
4. Optionnel (`--page-meta`) : `sync-page-meta.cjs`

L’ordre est couplé (ex. `legal` avant `manifest-dev`, partials avant injection nav). Ne pas réordonner sans vérifier les dépendances.

## Décisions architecturales clés

### ✅ Pourquoi pas de framework front ?

- Portfolio statique : vanille JS suffit
- Contrôle total des perfs (36% JS minification vs React overhead)
- CSP stricte, service worker custom : framework ajouterait friction

### ✅ Pourquoi JSDOM pour les tests DOM ?

- Environnement Vitest `node` par défaut ; **jsdom** activé via `environmentMatchGlobs` dans `vitest.config.js` (`js/modules/**`, `js/main.test.js`, utils DOM)
- Performance : suite complète en quelques dizaines de secondes
- Isolation : reset DOM par test via `beforeEach`

### ✅ Pourquoi partials générés (HTML assemblage) ?

- SEO : contenu HTML statique, crawlable
- Performance : 0 JS pour fetch partials en prod (inlinés au build)
- Maintenance : source unique (`partials/contact/_head.html`, etc.)

### ✅ Pourquoi dark-only (pas dark mode toggle) ?

- Identité arcade neon assume : pas de variante claire
- Contrastes AA+ mesurés sur dark uniquement
- UX unifié : pas de friction choix thème (voir `CONTRIBUTING.md § Design`)

### ✅ Pourquoi lazy-load par section (pas route-based) ?

- Granularité : contrôle exact du quoi charger quand
- No router library : `data-section-id` sur body suffit
- Taille : `dojo-boss.js` (~130 L) chargé seulement sur `/dojo.html`

## Patterns utilisés

### Observer pattern (score, highscore)

```javascript
// js/modules/score-session.js + popup-highscore.js (barrel score.js)
afficherScore(score) → MAJ DOM
lireScore() → getter localStorage

// js/modules/popup-highscore.js
if (score >= PLAFOND) afficherPopupMeilleurScore()
```

Pas de dependency injection ; découplage via événements localStorage.

### Command pattern (contact form)

```javascript
// js/modules/contact-form-submit.js
async envoyerViaFormspree({ formulaire, ... })
  → valider (contact-form-validation.js)
  → reCAPTCHA (contact-form-recaptcha.js)
  → Formspree API
  → feedback UI
```

Séparation orchestration (contact.js) vs exécution (contact-form-submit.js).

### Strategy pattern (modal interactions)

```javascript
// js/modules/modal.js
initialiserClavierModale(); // Tab, Escape
initialiserClicsModale(); // click handlers
```

Deux stratégies importer séparément selon context.

## Testabilité

### Couverture

Voir `CONTRIBUTING.md` § Tests (seuils Vitest ≥ 85 % lignes / ≥ 84 % branches, e2e multi-navigateurs).

### Mocking strategy

- **`vi.mock`** pour config, reCAPTCHA, score, audio
- **localStorage / sessionStorage** : edge cases testés (indisponible, rate limit)
- **API mocking** : Formspree via `fetch` mocké dans les tests contact
- **E2E** : Playwright (Chromium, WebKit, Firefox) sur le build staging

### Edge cases couverts

```javascript
// score.js : Score maxé
lireScore() >= SCORE_PLAFOND → afficherPopupMeilleurScore()

// contact-form.js : Champ vide
validate(email) → /^.+@.+$/ check

// visual-viewport.js : Notch détection
if (visualViewport) adjustPaddingSafeArea()
```

## Performance

### Bundle

- **JS** : minifié au build (`build/js-minify.cjs`, ~35–40 % de réduction)
- **CSS** : `style.css` monolithique en dev + `style-base.css` / `style-page-*.css` en prod
- **Assets** : WebP (previews), SVG inline (icons), polices locales latin + latin-ext
- **Mesure** : `npm run build && npm run measure` — artefact le plus frais (`.dist-staging-build/` ou `.dist-staging/`) ; snapshot local `scripts/bundle-baseline.json` (gitignoré)

### Runtime

- **LCP < 2.5s** (Lighthouse 90+)
- **No layout thrashing** : DOM reads batched
- **Animations 60fps** : `transform` / `will-change` only
- **Service worker** : Precache shell (HTML, CSS pages, JS core, polices) ; modules lazy exclus — voir `CONTRIBUTING.md` § PWA pour le détail offline

## Maintenance

### Sync générés (ne pas committer)

Sources versionnées : `js/config/legal.json`, `js/config/projects.json`, `js/config/musique-donnees.json`.

Liste complète des artefacts générés, commandes sync et workflow : **`CONTRIBUTING.md` § Configuration**.

#### Phases `sync-source.cjs` (ordre et dépendances)

| Phase               | Dépend de   | Rôle                                    |
| ------------------- | ----------- | --------------------------------------- |
| `defaults`          | —           | `js/config/defaults.js`, `partials.js`  |
| `style-css`         | `defaults`  | Agrège `style.css`                      |
| `partials`          | `style-css` | Fragments HTML (`partials/*.html`)      |
| `nav-squelette`     | `partials`  | Injecte le squelette nav dans les pages |
| `parcours-arbre`    | `partials`  | Arbre parcours assemblé                 |
| `dojo-boss`         | `partials`  | Lots boss rush (a/b/c)                  |
| `competences-stats` | `partials`  | Tableau scores compétences              |
| `accueil-hero`      | `partials`  | Hero accueil                            |
| `breakpoints`       | `style-css` | Constantes breakpoints partagées        |
| `legal`             | —           | `legal-data.js`                         |
| `projects`          | —           | `projects-data.js`                      |
| `musique-donnees`   | —           | `musique-themes.json`                   |
| `manifest-dev`      | `legal`     | `manifest.webmanifest` dev              |

`sync-page-meta.cjs` est optionnel (`--page-meta`) et s’exécute après la boucle principale.

#### État mutable isolé (runtime)

| Module                        | Rôle                        |
| ----------------------------- | --------------------------- |
| `audio-context-store.js`      | Contexte Web Audio unique   |
| `musique-sequencuer-store.js` | État planification chiptune |

### Code mort : détection

```bash
npm run lint           # ESLint : no-unused-vars + recommends
npm run test:coverage  # Vitest coverage : rapports HTML/JSON
```

Aucun TODO/FIXME. Si un fichier est marqué "unused" → supprimer directement.

## Ressources

- **CONTRIBUTING.md** : setup local, debugging, conventions
- **vitest.config.js** : coverage thresholds, test env
- **playwright.config.js** : e2e multi-viewports, CI setup
- **build/** : pipeline détaillé (sync, minify, optimize, sw, seo)
