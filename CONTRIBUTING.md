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
npm run test:e2e
```

Commits au format **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, etc.) — vérifié en CI sur les PR.

Les mises à jour de dépendances sont proposées via [Dependabot](.github/dependabot.yml).

## Développement local

```bash
npx serve .          # sources (partials en fetch)
npm run watch        # rebuild auto
npx serve .dist-staging   # après build, comme en prod
```

Ne pas ouvrir les HTML en `file://` : les partials et modules ES ne fonctionneront pas.

## Dépannage npm

| Problème | Solution |
|----------|----------|
| `UNABLE_TO_VERIFY_LEAF_SIGNATURE` | Proxy / certificat entreprise : `npm config set strict-ssl false` (réseau de confiance) ou certificat racine CA |
| Dépendance manquante au build | `npm ci` puis relancer `npm run build` |
| `dist/` verrouillé sous Windows | Fermer l’explorateur ou le serveur qui lit `dist/` ; le build utilise `.dist-staging/` en secours |

## Breakpoints CSS

| Seuil | Usage |
|-------|--------|
| `max-width: 960px` | Mobile / tablette (nav, layout, footer, pages, contact) |
| `min-width: 961px` | Desktop (grilles 2 cols projets, parcours, compétences) |
| `600px – 960px` | Accueil tablette, stats latérales compétences |
| `max-width: 480px` | Footer une colonne |
| `max-width: 400px` | Nav compacte (score masqué) |

Référence technique : `build/breakpoints.cjs`, `styles/tokens.css`. Règles accueil : `styles/pages/accueil.css`.

Pages hors navigation clavier (`dojo.html`, `mentions-legales.html`) : accessibles via liens footer ou projets.

## Configuration

Copier `.env.example` → `.env.local` pour surcharger l’URL du site, Formspree ou reCAPTCHA. Ne jamais committer de secrets (clé secrète reCAPTCHA, tokens privés).

Voir [SECURITY.md](SECURITY.md) pour signaler une vulnérabilité.

## Tests

- **Unitaires** : `npm test` (Vitest) — utils, config, modules, build
- **Couverture** : `npm run test:coverage` (seuils 65 % lignes / 58 % branches sur `js/`)
- **HTML** : `npm run validate:html`
- **E2E** : `npm run test:e2e` (Playwright sur `.dist-staging` après build)
- **Lighthouse** : `npm run test:lhci` (seuils perf/a11y/SEO en CI)

## Style de code

- ESLint + Prettier (config racine)
- CSS : tokens dans `styles/tokens.css`, composants vs pages
- JS : modules ES, config centralisée dans `js/config/`
