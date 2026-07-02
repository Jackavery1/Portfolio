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
node build/sync-source.cjs   # ou npm run pretest — génère style.css, defaults.js, partials…
npx serve .                  # sources (partials en fetch)
npm run watch             # rebuild auto
npx serve .dist-staging   # après build, comme en prod
```

Ne pas ouvrir les HTML en `file://` : les partials et modules ES ne fonctionneront pas.

La **CSP** et le **service worker** ne sont injectés qu’après `npm run build` — tester Formspree, reCAPTCHA et PWA sur `.dist-staging/`.

## Configuration

Copier `.env.example` → `.env.local` pour surcharger :

| Variable | Rôle |
|----------|------|
| `PORTFOLIO_SITE_URL` | URL canonique / Open Graph / manifest |
| `PORTFOLIO_FORMSPREE_ENDPOINT` | Endpoint Formspree |
| `PORTFOLIO_RECAPTCHA_SITE_KEY` | Clé site reCAPTCHA v3 |

Valeurs par défaut : `build/config-defaults.cjs` → synchronisées au build dans `js/config/defaults.js`, `manifest.webmanifest` et métadonnées SEO.

Fichiers générés (non versionnés, recréés par `npm test` / `npm run build`) : `js/config/defaults.js`, `js/config/partials.js`, `style.css`, `partials/parcours-arbre.html`, `sw.js`, `manifest.webmanifest` — **uniquement dans `.dist-staging/`** (plus à la racine après build). Source unique partials : `build/partials-list.cjs`. Arbre parcours : fragments dans `partials/parcours-arbre/` (assemblés en `parcours-arbre.html`, validés via `partials/*.html` — pas les fragments SVG isolés).

Métadonnées SEO par page : `build/page-meta.cjs` → injectées au build dans le dist (`build/html.cjs`). Pour mettre à jour les blocs `PAGE_META` dans les HTML sources : `npm run sync:page-meta` (évite de modifier les sources à chaque build).

`npm run validate:html` exécute `prevalidate:html` (sync des fichiers générés requis en CI avant les tests).

Réseaux sociaux (GitHub, LinkedIn optionnel) : même fichier `config-defaults.cjs`.

Ne jamais committer de secrets (clé secrète reCAPTCHA, tokens privés). Voir [SECURITY.md](SECURITY.md).

## PWA & hors ligne

- `manifest.webmanifest` — généré au build depuis `build/manifest.cjs`
- `sw.js` — généré au build (`build/sw.cjs`) : precache des pages/CSS/JS principaux, fallback `offline.html` en navigation hors ligne
- Enregistrement SW : `js/modules/service-worker-register.js` (après `data-app-ready`)

## Dépannage

### npm / build

| Problème | Solution |
|----------|----------|
| `UNABLE_TO_VERIFY_LEAF_SIGNATURE` | Proxy / certificat entreprise : `npm config set strict-ssl false` (réseau de confiance) ou certificat racine CA |
| Dépendance manquante au build | `npm ci` puis relancer `npm run build` |
| `dist/` verrouillé sous Windows | Fermer l’explorateur ou le serveur ; le build utilise `.dist-staging/` en secours |

### Playwright (e2e)

| Problème | Solution |
|----------|----------|
| Navigateur absent (`Executable doesn't exist`) | `npm run test:e2e:install` ou `npx playwright install --with-deps chromium` |
| Téléchargement bloqué (certificat SSL) | Même correctif que npm ci-dessus, puis relancer l’install ; sous PowerShell : `$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npx playwright install chromium` (temporaire, réseau de confiance uniquement) |
| E2e lent / timeout CI | La CI exécute desktop **et** mobile (Pixel 5) — timeout job e2e : 25 min |

### Site / UX

| Problème | Solution |
|----------|----------|
| Nav / footer vides | Serveur HTTP (`npx serve`), pas `file://` |
| Formulaire 403 | Domaines reCAPTCHA + Formspree autorisés pour votre URL |
| Favicon absente | Hard refresh ; vérifier `assets/favicon.png` après build |
| Page blanche hors ligne | Visiter une fois en ligne pour remplir le cache ; sinon `offline.html` s’affiche |

## Breakpoints CSS

| Seuil | Usage |
|-------|--------|
| `max-width: 960px` | Mobile / tablette (nav, layout, footer, pages, contact) |
| `min-width: 961px` | Desktop (grilles 2 cols parcours, compétences) |
| `min-width: 700px` | Grille projets 2 colonnes (tablette large) |
| `600px – 960px` | Accueil tablette, stats latérales compétences |
| `max-width: 480px` | Footer une colonne, nav compacte (score masqué) |

Référence technique : `build/breakpoints.cjs`, `styles/tokens.css`. Listes CSS synchronisées via `build/page-styles.cjs` → `style.css`.

Pages hors navigation clavier (`dojo.html`, `mentions-legales.html`) : accessibles via liens footer ou projets.

## Tests

- **Unitaires** : `npm test` (Vitest) — utils, config, modules, build
- **Couverture** : `npm run test:coverage` (seuils 65 % lignes / 58 % branches sur `js/`)
- **HTML** : `npm run validate:html` (sources) et `npm run validate:html:dist` (après build)
- **E2E** : `npm run test:e2e` — projets Playwright `desktop-chrome` + `mobile-chrome` (build `.dist-staging` servi automatiquement)
- **Lighthouse** : `npm run test:lhci` (profil mobile, seuils perf/a11y/SEO en CI)

## Style de code

- ESLint + Prettier (config racine)
- CSS : tokens dans `styles/tokens.css`, composants vs pages
- JS : modules ES, config centralisée dans `js/config/`
