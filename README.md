# Portfolio Arcade — Joris Martinez

**→ [Voir le site en ligne](https://jackavery1.github.io/Portfolio/)**

Portfolio développeur web (thème arcade CRT) : projets, parcours, compétences, contact, score session et easter eggs.

Stack : HTML / CSS / JavaScript vanilla, build Node, déploiement GitHub Pages.

---

## Démarrage rapide

```bash
npm ci
npm run build
npx serve .dist-staging
```

Sources brutes (partials en `fetch`, dont contact et dojo) : `npx serve .` — lancer `node build/sync-source.cjs` si les partials assemblés manquent. La CSP et le service worker ne sont actifs qu’après build.

Node **18+** (`.nvmrc`).

---

## Commandes

| Commande           | Description                   |
| ------------------ | ----------------------------- |
| `npm run build`    | Production → `.dist-staging/` |
| `npm run watch`    | Rebuild automatique           |
| `npm test`         | Tests unitaires (Vitest)      |
| `npm run test:e2e` | Playwright (build requis)     |
| `npm run lint`     | ESLint                        |

Détails (couverture, Lighthouse, validation HTML, `.env`, dépannage) : **[CONTRIBUTING.md](CONTRIBUTING.md)**.

---

## Architecture (résumé)

```
*.html + partials/     Pages et fragments (inlinés au build)
styles/                Tokens, layout, composants, pages
js/main.js             Entrée ; modules lazy par data-section-id
build/                 HTML, CSS, JS minify, PWA (manifest + SW)
e2e/                   Smoke, a11y, responsive, navigation
```

Push sur `main` → CI (lint, tests desktop + mobile, Lighthouse) → déploiement GitHub Pages (artefact `.dist-staging/`).

**GitHub Pages (une fois)** : _Settings → Pages → Build and deployment → Source_ = **GitHub Actions** (pas la branche `main`). Si la source pointe sur `main`, le site sert les HTML sources sans CSS (`style.css` est généré au build, pas versionné).

---

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) — contribuer, config, tests, dépannage
- [CHANGELOG.md](CHANGELOG.md) — versions
- [SECURITY.md](SECURITY.md) — vulnérabilités
