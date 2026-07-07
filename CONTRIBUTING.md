# Contribuer

Merci de votre intérêt pour ce portfolio. Projet solo, mais les retours et PR sont les bienvenus.

## Avant une pull request

```bash
npm ci
npm run lint
npm run validate:html
npm run format:check
npm test
npm run test:coverage
npm run build
npm run validate:html:dist
npm run test:e2e
```

Commits au format **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, etc.) — vérifié en CI sur les PR.

Les mises à jour de dépendances sont proposées via [Dependabot](.github/dependabot.yml).

## Développement local

```bash
npm start                    # sync + serve sources (partials en fetch)
npm run watch                # rebuild auto
npm run build && npm run start:prod   # comme en prod
```

Ne pas ouvrir les HTML en `file://` ni via Live Server : les partials et modules ES requièrent un serveur HTTP (`npm start` ou `npx serve .` après sync).

La **CSP** et le **service worker** ne sont injectés qu’après `npm run build` — tester Formspree, reCAPTCHA et PWA sur `.dist-staging/` (`npm run start:prod`).

## Navigation (squelette vs partial runtime)

Deux sources complémentaires — ne pas les confondre :

| Fichier                       | Rôle                                         | Quand                                                                               |
| ----------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------- |
| `partials/nav-squelette.html` | Nav minimale (first paint, landmarks, liens) | Inlinée dans les HTML sources via `build/sync-nav-squelette.cjs`                    |
| `partials/nav.html`           | Nav complète (score, burger, annonce AT)     | Fetch runtime (`js/modules/partials.js`) ; inlinée au build prod (`build/html.cjs`) |

**Workflow** : modifier le squelette → `node build/sync-nav-squelette.cjs` (ou `npm run pretest`). Modifier la nav interactive → `partials/nav.html` uniquement. Les deux doivent rester alignés sur les liens et le seuil burger (960/961 px).

## Contact (modules)

Point d’entrée unique : `js/modules/contact.js` (`initialiserPageContact`). Sous-modules spécialisés : bandeau, coordonnées, formulaire, reCAPTCHA, soumission Formspree — à modifier via la facade, pas depuis `main.js`.

## Design & thème

### Identité visuelle

Thème **sombre arcade CRT** — choix intentionnel, pas de variante claire (light mode). `prefers-color-scheme` n’est **pas utilisé** ; le design ignore la préférence utilisateur et assume dark-only.

**Pourquoi light-only :**

- Identité neon arcade assume (cyberpunk, pixel art, rétro 80s)
- Palette 3-couleurs optimisée pour dark (#000008 fond, #4a6fff bleu, #ffcc44 jaune)
- Contrastes AA+ mesurés sur fond dark uniquement
- Expérience utilisateur unifiée = pas de friction choix thème

**Limitation et acceptation :**

- Utilisateurs en mode light préfèrent dark : expérience potentiellement inconfortable
- Cette décision doit être communiquée dans l’UX (clarifier que dark-only est volontaire, pas un bug)

### Responsive design (surfaces mobiles)

Le bloc `@media (max-width: 960px)` dans `styles/tokens.css` **assombrit/éclaircit légèrement les surfaces** pour la lisibilité mobile, sans changer l’intention visuelle arcade. Les couleurs restent dark ; seul le contraste des surfaces (--couleur-fond, --couleur-separateur) s’ajuste.

## Configuration

Copier `.env.example` → `.env.local` pour surcharger :

| Variable                       | Rôle                                  |
| ------------------------------ | ------------------------------------- |
| `PORTFOLIO_SITE_URL`           | URL canonique / Open Graph / manifest |
| `PORTFOLIO_FORMSPREE_ENDPOINT` | Endpoint Formspree                    |
| `PORTFOLIO_RECAPTCHA_SITE_KEY` | Clé site reCAPTCHA v3                 |

Valeurs par défaut : `build/config-defaults.cjs` → synchronisées au build dans `js/config/defaults.js`, `manifest.webmanifest` et métadonnées SEO.

Fichiers générés (non versionnés, recréés par `npm test` / `npm run build`) : `js/config/defaults.js`, `js/config/legal-data.js`, `js/config/projects-data.js`, `js/config/partials.js`, `style.css`, `partials/parcours-arbre.html`, `partials/dojo-boss-rush.html`, `partials/competences-stats.html`, `partials/accueil-hero.html`, `sw.js` — et `manifest.webmanifest` **à la racine** (dev local, URLs relatives via `sync-source`) **ou dans `.dist-staging/`** (build prod). Contenu mentions légales : `js/config/legal.json` (source éditable) → `build/sync-legal.cjs` → `js/config/legal-data.js`. Métadonnées projets : `js/config/projects.json` (source éditable, **à versionner**) → `build/sync-projects.cjs` → `js/config/projects-data.js` ; icônes SVG : `js/config/project-icons.js`. Source unique partials : `build/partials-list.cjs`. Fragments assemblés : `partials/parcours-arbre/` → `parcours-arbre.html`, `partials/dojo-boss/` → `dojo-boss-rush.html`, `partials/competences/` → `competences-stats.html`, `partials/accueil/` → `accueil-hero.html`. Partials contact : `partials/contact/*.html` (chargés uniquement sur `contact.html`). Seuils CSS : `build/breakpoints.cjs` → `styles/tokens.css` via `build/sync-breakpoints.cjs`.

Métadonnées SEO par page : `build/page-meta.cjs` → injectées au build dans le dist (`build/html.cjs`). Pour mettre à jour les blocs `PAGE_META` dans les HTML sources : `npm run sync:page-meta` (évite de modifier les sources à chaque build). `npm run check:page-meta` vérifie l’alignement (exécuté avant les tests).

`npm run validate:html` exécute `prevalidate:html` (sync des fichiers générés requis en CI avant les tests).

Réseaux sociaux (GitHub, LinkedIn optionnel) : même fichier `config-defaults.cjs`.

Ne jamais committer de secrets (clé secrète reCAPTCHA, tokens privés). Voir [SECURITY.md](SECURITY.md).

## PWA & hors ligne

- `manifest.webmanifest` — généré par `sync-source` à la racine (dev) et au build dans `.dist-staging/` depuis `build/manifest.cjs`
- `sw.js` — généré au build (`build/sw.cjs`) : precache des pages/CSS/JS principaux, fallback `offline.html` en navigation hors ligne
- Enregistrement SW : `js/modules/service-worker-register.js` (après `data-app-ready`)

## Dépannage

### npm / build

| Problème                          | Solution                                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `UNABLE_TO_VERIFY_LEAF_SIGNATURE` | Proxy / certificat entreprise : `npm config set strict-ssl false` (réseau de confiance) ou certificat racine CA |
| Dépendance manquante au build     | `npm ci` puis relancer `npm run build`                                                                          |
| `dist/` verrouillé sous Windows   | Fermer l’explorateur ou le serveur ; le build utilise `.dist-staging/` en secours                               |

### Playwright (e2e)

| Problème                                       | Solution                                                                                                                                                                                                             |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigateur absent (`Executable doesn't exist`) | `npm run test:e2e:install` ou `npx playwright install --with-deps chromium webkit`                                                                                                                                   |
| Téléchargement bloqué (certificat SSL)         | Même correctif que npm ci-dessus, puis relancer l’install ; sous PowerShell : `$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npx playwright install chromium webkit` (temporaire, réseau de confiance uniquement)           |
| E2e lent / timeout CI                          | CI : Chromium + WebKit (`responsive-mobile-portrait`, `responsive-mobile-landscape`, `responsive-tablet`, `responsive-webkit`, `desktop-chrome`). Safari local : `npm run test:e2e:webkit`. Timeout job e2e : 25 min |

### Site / UX

| Problème                                        | Solution                                                                                                                                                                                                                                              |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nav / footer vides                              | Serveur HTTP (`npm start`), pas `file://` ni Live Server                                                                                                                                                                                              |
| Formulaire 403                                  | Domaines reCAPTCHA + Formspree autorisés pour votre URL                                                                                                                                                                                               |
| Favicon absente                                 | Hard refresh ; vérifier `assets/favicon.png` après build                                                                                                                                                                                              |
| Page blanche hors ligne                         | Visiter une fois en ligne pour remplir le cache ; sinon `offline.html` s’affiche                                                                                                                                                                      |
| **Prod sans styles** (HTML brut, blob SVG noir) | GitHub Pages sert probablement la branche `main` au lieu du build. _Settings → Pages → Source_ = **GitHub Actions**. Vérifier que le job `deploy` de la CI a réussi après le push. Tester localement : `npm run build` puis `npx serve .dist-staging` |
| **404** sur `jackavery1.github.io/Portfolio/`   | Le job `deploy` n’a pas tourné : `validate` a échoué (souvent `format:check`). _Actions → CI_ : corriger `validate`, repousser ; le deploy suit en ~1 min si `validate` est vert.                                                                     |

## Breakpoints CSS

| Seuil              | Usage                                                   |
| ------------------ | ------------------------------------------------------- |
| `max-width: 960px` | Mobile / tablette (nav burger, layout, footer, pages)   |
| `min-width: 961px` | Desktop (nav horizontale, grilles 2 cols parcours)      |
| **960 / 961 px**   | Seuil nav : burger ≤960 px, liens horizontaux ≥961 px   |
| `min-width: 700px` | Grille projets 2 colonnes (tablette large)              |
| `600px – 960px`    | Accueil tablette, stats latérales compétences           |
| `max-width: 480px` | Footer une colonne, nav compacte (score masqué)         |
| `max-width: 320px` | Contact / dojo très petits écrans (bandeau, boss cards) |

Référence technique : `build/breakpoints.cjs`, `styles/tokens.css`. Listes CSS synchronisées via `build/page-styles.cjs` → `style.css`.

Pages hors navigation clavier (`dojo.html`, `mentions-legales.html`) : accessibles via liens footer ou projets.

## Tests

- **Unitaires** : `npm test` (Vitest) — utils, config, modules, build
- **Couverture** : `npm run test:coverage` (seuils Vitest : 40 % lignes / 20 % branches globaux ; ~90 % lignes / ~73 % branches en pratique sur `js/`)
- **HTML** : `npm run validate:html` (sources) et `npm run validate:html:dist` (après build)
- **E2E** : `npm run test:e2e` — projets `responsive-mobile-portrait`, `responsive-mobile-landscape`, `responsive-tablet`, `responsive-webkit` (iPhone 13, WebKit), `desktop-chrome` ; **CI** exécute Chromium + WebKit (4 projets responsive + `desktop-chrome`). PWA : `e2e/pwa.spec.js` (desktop uniquement). WebKit en local : `npm run test:e2e:webkit`. Matrice viewports allégée (coquille accueil × 4 viewports, autres pages en mobile-compact). Fixtures pages : `e2e/fixtures/pages.js`.
- **Lighthouse** : `npm run test:lhci` (profil mobile, seuils perf/a11y/SEO en CI)

### Avant release (PWA / prod)

1. `npm test` et `npm run test:e2e`
2. `npm run build && npm run start:prod` — vérifier offline, formulaire, partials inlinés
3. Push sur `main` uniquement si la CI est verte (deploy Pages automatique)

## Style de code

- ESLint + Prettier (config racine)
- **Libellés visibles** : shell arcade en anglais (nav, titres) ; contenu métier en français
- **Accessibilité** : `aria-label`, `aria-describedby` et annonces AT en français (`lang="fr"`) ; le texte visible peut rester en anglais arcade
- CSS : tokens dans `styles/tokens.css`, composants vs pages ; accueil en modules `styles/pages/accueil/` ; boutons pixel (`bouton-pixel.css`) — états `:disabled` via `--couleur-texte-disabled`
- JS : modules ES, config centralisée dans `js/config/` ; bonus score via `CONFIGURATION.BONUS_SCORE` ; identifiants exportés en **français** (`parId`, `initialiser*`, `echapperHtml`…)
