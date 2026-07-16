# Portfolio Arcade — Joris Martinez

**→ [Voir le site en ligne](https://jackavery1.github.io/Portfolio/)**

Portfolio développeur web (thème arcade CRT) : projets, parcours, compétences, contact, score session et easter eggs.

Stack : HTML / CSS / JavaScript vanilla, build Node, déploiement GitHub Pages.

---

## Démarrage rapide

```bash
npm ci
npm run build
npm run start:prod
```

Sources brutes (partials en `fetch`, dont contact et dojo) : `npm start` — synchronise les fichiers générés puis sert la racine. La CSP, le service worker et le mode hors ligne ne sont actifs qu’après build (`npm run start:prod`).

Pour tester le comportement mobile/PWA réel (safe-area, offline, precache) : build prod obligatoire — le dev `npm start` ne reflète pas la PWA. Le hors ligne couvre le shell (HTML, CSS, JS de page precachés) ; musique, reCAPTCHA et envoi Formspree restent réseau-dépendants — voir [CONTRIBUTING.md § PWA & hors ligne](CONTRIBUTING.md#pwa--hors-ligne).

Node **≥ 20.19** (`.nvmrc`, requis par Vitest 3).

---

## Commandes

| Commande                   | Description                                        |
| -------------------------- | -------------------------------------------------- |
| `npm start`                | Dev local (sources + sync)                         |
| `npm run start:prod`       | Preview build prod                                 |
| `npm run build`            | Production → `.dist-staging/`                      |
| `npm run watch`            | Rebuild automatique                                |
| `npm test`                 | Tests unitaires (Vitest)                           |
| `npm run test:e2e`         | Playwright (build requis)                          |
| `npm run test:e2e:install` | Installe **Chromium** seul (base locale)           |
| `npm run test:e2e:webkit`  | Installe **WebKit** puis lance les specs iPhone 13 |
| `npm run lint`             | ESLint                                             |

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

Push sur `main` → CI (`validate`, e2e, Lighthouse) → déploiement GitHub Pages si tous les jobs passent.

**GitHub Pages (une fois)** : source = **GitHub Actions** (pas la branche `main`) — voir [CONTRIBUTING.md § Dépannage](CONTRIBUTING.md#dépannage) si la prod s’affiche sans styles.

---

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) — contribuer, config, tests, accessibilité, dépannage
- [ARCHITECTURE.md](ARCHITECTURE.md) — structure, patterns, décisions
- [CHANGELOG.md](CHANGELOG.md) — versions
- [SECURITY.md](SECURITY.md) — vulnérabilités
