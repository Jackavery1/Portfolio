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

```javascript
// main.js
if (sid === 'projets') {
  const { initialiserGrilleProjets } = await import('./modules/projets-grille.js');
  initialiserGrilleProjets();
}
```

Sections dynamiques : `projets`, `accueil`, `dojo`, `contact`, `mentions`. Réduit le bundle initial (~36% minification).

### 3. Modules découplés

Chaque module exporte une fonction d'initialisation (`initialiser*`) :

- `js/modules/contact.js` → `initialiserPageContact()`
- `js/modules/navigation.js` → `initialiserNavigationArcade()`
- `js/modules/score.js` → `afficherScore()` / `lireScore()`

Pas d'état partagé global ; data via localStorage ou paramètres de fonction.

### 4. Tests colocalisés

```
js/modules/contact-form.js
js/modules/contact-form.test.js  ← même dossier
```

Approche **test-per-module** : ~240 tests Vitest, environnement `node` avec `/* @vitest-environment jsdom */` sur les modules DOM ; `vi.mock` pour config et I/O externes.

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

## Décisions architecturales clés

### ✅ Pourquoi pas de framework front ?

- Portfolio statique : vanille JS suffit
- Contrôle total des perfs (36% JS minification vs React overhead)
- CSP stricte, service worker custom : framework ajouterait friction

### ✅ Pourquoi JSDOM pour les tests DOM ?

- Environnement Vitest `node` par défaut ; jsdom activé fichier par fichier
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
async soumettreFormulaireContact(data)
  → valider (js/utils/validation.js)
  → formspree API
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

- **~240 tests passants** (Vitest + Playwright)
- **≥ 85 % lignes / ≥ 80 % branches** sur `js/` (seuils CI dans `vitest.config.js`)
- Scripts `build/*.cjs` : seuils dédiés plus bas (I/O fichier, pipeline)

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

- **JS** : 90.8KB → 57.7KB minified (-36.4%)
- **CSS** : 67KB monolithique (fallback) + par-page optim
- **Assets** : WebP (previews), SVG inline (icons), fonts local

### Runtime

- **LCP < 2.5s** (Lighthouse 90+)
- **No layout thrashing** : DOM reads batched
- **Animations 60fps** : `transform` / `will-change` only
- **Service worker** : Precache 92 entrées (pages + CSS + JS core)

## Maintenance

### Sync générés (ne pas committer)

```
js/config/defaults.js          ← build/config-defaults.cjs
js/config/legal-data.js        ← build/sync-legal.cjs (source: js/config/legal.json)
js/config/projects-data.js     ← build/sync-projects.cjs (source: js/config/projects.json)
partials/parcours-arbre.html   ← build/sync-parcours-arbre.cjs (source: partials/parcours-arbre/)
```

Workflw : modifiez source → `npm run pretest` → fichiers générés.

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
