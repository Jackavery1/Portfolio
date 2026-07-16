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

Trio config : `sections-manifest.js` (ids) → `sections-registry.js` (charges `import()`) → `sections.js` (`initialiserSection`) ; `main.js` appelle `initialiserSection(sid)`.

```javascript
// js/config/sections-registry.js — CHARGES_SECTION[sid] → modules + init
// js/config/sections.js — import dynamique puis initialiser*
```

Sections dynamiques : `projets`, `accueil`, `dojo`, `contact`, `mentions`. Musique via `musique-loader.js` (voir stack ci-dessous). Réduit le JS critique au démarrage (~35–40 % après minification build).

### Stack musique

| Module                        | Rôle                                                        |
| ----------------------------- | ----------------------------------------------------------- |
| `musique-loader.js`           | Import dynamique, point d’entrée `main.js`                  |
| `musique.js`                  | Bouton, préférences localStorage, jingles                   |
| `musique-bouton.js`           | Préférence + état visuel du bouton                          |
| `musique-sequencuer.js`       | Lookahead, démarrage / arrêt, résolution section → thème    |
| `musique-sequencuer-plan.js`  | Planification d’un pas de grille (motifs)                   |
| `musique-sequencuer-store.js` | État mutable isolé du séquenceur                            |
| `musique-audio.js`            | Contexte Web Audio, gain maître                             |
| `musique-voix.js`             | Oscillateurs et percussions                                 |
| `musique-donnees.json`        | Source éditable → sync → `musique-themes.json` (fetch lazy) |

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

Approche **test-per-module** : Vitest + Playwright e2e (voir `npm test` / `npm run test:e2e`). Trois projects Vitest (`vitest.config.js`) : `js-dom` (jsdom), `js-node`, `build` (node) ; `vi.mock` pour config et I/O externes.

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

| Couche            | Format                                 | Rôle                                                                                                                                                                                                                                                                                               |
| ----------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `js/`             | **ESM** (`import` / `export`)          | Modules chargés par le navigateur (`type="module"`)                                                                                                                                                                                                                                                |
| `build/`          | **CJS** (`require` / `module.exports`) | Scripts Node I/O (sync, minify, SW) — modules I/O lourds                                                                                                                                                                                                                                           |
| `build/*.mjs`     | **ESM** (données pures)                | `config-defaults.mjs`, `page-meta.mjs`, `page-meta-tags.mjs`, `page-styles.mjs`, `json-ld.mjs`, `url-page.mjs`, `breakpoints.mjs`, `partials-list.mjs`, `html-files.mjs`, `html-csp.mjs`, `html-seo.mjs`, `cli-entry.mjs`, `fonts-data.mjs`, `sw-precache.mjs` — `require()` depuis CJS (Node ≥20) |
| `build.mjs`       | **ESM** (entrée build)                 | Orchestration via `build/cjs-bridge.mjs` → `loadBuild()`                                                                                                                                                                                                                                           |
| `build/*.test.js` | ESM                                    | `loadBuild()` via `build/cjs-bridge.mjs` ou `createRequire` ciblé                                                                                                                                                                                                                                  |

**Pont** : `build/cjs-bridge.mjs` expose `loadBuild('env.cjs')` — point d’entrée ESM unique sans migrer tout le pipeline CJS (CLI `require.main`, I/O synchrone). **Choix figé** : pas de migration CJS→ESM massive du dossier `build/` (voir `AUDIT-EXCLUSIONS.md`).

#### Build HTML prod (`build/html*.cjs`)

Orchestrateur : `build/html.cjs` (`copyHTML`). Modules dédiés :

| Module                     | Rôle                                     |
| -------------------------- | ---------------------------------------- |
| `html-files.mjs`           | Liste des pages (`HTML_FILES`)           |
| `html-seo.mjs`             | Meta page, canonical, OG absolu, JSON-LD |
| `html-head.cjs`            | `head-common`, polices async, CSS prod   |
| `html-partials-inline.cjs` | Inlining des placeholders partials       |
| `html-csp.mjs`             | Injection CSP après viewport             |

Ordre d’injection dans le `<head>` :

1. Preload **Press Start 2P** (`fetchpriority="high"`) et **VT323** (`partials/fonts-async.html`) — LCP titres pixel + corps CRT ; Rajdhani via `@font-face` à la demande (`styles/fonts-local.css`).
2. Preload + stylesheet `style-base.css` puis `style-page-*.css`.
3. JS non critique (`konami`, bonus score, section dojo, `animations`, `service-worker-register`) chargé / planifié en `import()` / `requestIdleCallback` après peinture (pages denses).

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
- Contrôle total des perfs (~35–40 % JS minification vs overhead framework)
- CSP stricte, service worker custom : framework ajouterait friction

### ✅ Pourquoi JSDOM pour les tests DOM ?

- Project Vitest **`js-dom`** (jsdom) pour modules / utils DOM ; **`js-node`** et **`build`** restent en node (`vitest.config.js`)
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

### Appels directs (score, highscore)

```javascript
// js/modules/score-session.js + popup-highscore.js (barrel score.js)
afficherScore(score) → MAJ DOM
lireScore() → getter localStorage

// js/modules/popup-highscore.js
if (score >= PLAFOND) afficherPopupMeilleurScore()
```

Pas d’événements `storage` cross-onglets : appels synchrones + `localStorage` / `sessionStorage` pour persistance.

### Command pattern (contact form)

```javascript
// js/modules/contact-form-handler.js — orchestration submit + feedback UI
// js/modules/contact-form-submit.js — réseau (Formspree, mailto) → { ok } | { ok:false, msg }
// js/modules/contact-form-submit-ui.js — état bouton envoi / confirmation
async envoyerViaFormspree({ ... })
  → reCAPTCHA (recaptcha.js)
  → fetch Formspree
  → résultat ; feedback UI via handler → contact-form-submit-ui.js
```

Séparation orchestration (`contact-form-handler.js`) vs réseau (`contact-form-submit.js`) vs UI bouton (`contact-form-submit-ui.js`).

### Init modale (clavier + clics)

```javascript
// js/modules/modal.js — les deux inits sont toujours chargés ensemble (sections-registry projets)
initialiserClavierModale(); // Escape, piège Tab
initialiserClicsModale(); // cartes, overlay, bouton fermer
```

Idempotents via `dataset.modalClavier` / `dataset.modalClics` (évite double `addEventListener`).

## Testabilité

### Couverture

Voir `CONTRIBUTING.md` § Tests (seuils Vitest ≥ 85 % lignes / ≥ 84 % branches, e2e multi-navigateurs). Scripts build CLI exportés et testés (`run-serve-staging.cjs`, `validate-dist-html.cjs`) ; I/O fichiers dans `fs-utils-io.cjs`, staging/dist dans `fs-utils-staging.cjs` (façade `fs-utils.cjs`) — repli Windows (EPERM, staging verrouillé, sync partielle, prune orphelins).

### Mocking strategy

- **`vi.mock`** pour config, reCAPTCHA, score, audio
- **localStorage / sessionStorage** : edge cases testés (indisponible, rate limit)
- **API mocking** : Formspree via `fetch` mocké dans les tests contact
- **E2E** : Playwright (Chromium, WebKit, Firefox) sur le build staging

## Performance

### Bundle

- **JS** : minifié au build (`build/js-minify.cjs`, ~35–40 % de réduction)
- **CSS** : `style.css` monolithique en dev + `style-base.css` / `style-page-*.css` en prod
- **Assets** : WebP (previews), SVG inline (icons), polices locales subset **latin** (accents FR)
- **Mesure** : `npm run build && npm run measure` — voir `CONTRIBUTING.md` § Mesure bundle

### Runtime

- **Service worker** : precache shell ; musique / reCAPTCHA / Formspree exclus — détail offline dans `CONTRIBUTING.md` § PWA

## Maintenance

Sources versionnées : `js/config/legal.json`, `js/config/projects.json`, `js/config/musique-donnees.json`. Artefact prod : seul `musique-themes.json` est embarqué.

Artefacts générés, phases `sync-source`, lint/coverage : **`CONTRIBUTING.md`**.

État mutable runtime : `audio-context-store.js`, `musique-sequencuer-store.js`.

## Ressources

- **CONTRIBUTING.md** : setup local, debugging, conventions
- **vitest.config.js** : coverage thresholds, test env
- **playwright.config.js** : e2e multi-viewports, CI setup
- **build/** : pipeline détaillé (sync, minify, optimize, sw, seo)
