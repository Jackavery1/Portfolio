# Contribuer

Merci de votre intérêt pour ce portfolio. Projet solo, mais les retours et PR sont les bienvenus.

## Avant une pull request

```bash
npm ci
npm run lint
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

## Breakpoints CSS (référence)

| Seuil | Usage |
|-------|--------|
| `max-width: 960px` | Mobile / tablette (nav burger, layout, footer, pages) |
| `min-width: 961px` | Desktop (grilles 2 cols projets, parcours, compétences) |
| `601px – 960px` | Accueil tablette, stats latérales compétences |
| `768px / 767px` | Contact (grille profil) |
| `768px` (tokens) | Palette couleurs mobile |
| `1024px` | Contact desktop large |

Détails accueil : en-tête de `styles/pages/accueil.css`.

## Configuration

Copier `.env.example` → `.env.local` pour surcharger l’URL du site, Formspree ou reCAPTCHA. Ne jamais committer de secrets (clé secrète reCAPTCHA, tokens privés).

Voir [SECURITY.md](SECURITY.md) pour signaler une vulnérabilité.

## Tests

- **Unitaires** : `npm test` (Vitest) — utils, config, modules clés, build
- **Couverture** : `npm run test:coverage` (seuils 70 % sur `js/utils/` + `js/config/`)
- **E2E** : `npm run test:e2e` (Playwright sur `.dist-staging` après build)
- **Lighthouse** : `npm run test:lhci` (seuils perf/a11y/SEO en CI)

## Style de code

- ESLint + Prettier (config racine)
- CSS : tokens dans `styles/tokens.css`, composants vs pages
- JS : modules ES, config centralisée dans `js/config/`
