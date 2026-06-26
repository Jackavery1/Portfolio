# Portfolio Arcade — Joris Martinez

**→ [Voir le site en ligne](https://jackavery1.github.io/Portfolio/)**

Portfolio développeur web (thème arcade CRT) : projets, parcours, compétences, contact avec formulaire sécurisé, score session et easter eggs.

Stack : HTML / CSS / JavaScript vanilla, build Node, déploiement GitHub Pages.

---

## Démarrage rapide

```bash
npm ci
npm run build
npx serve .dist-staging
```

En développement sur les sources (partials chargés en `fetch`) :

```bash
npx serve .
```

La **CSP** (meta `Content-Security-Policy`) n’est injectée qu’après `npm run build` — tester Formspree/reCAPTCHA sur `.dist-staging/`.

Node **18+** (`.nvmrc`).

---

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run build` | Production → `.dist-staging/` |
| `npm run watch` | Rebuild automatique |
| `npm test` | Tests unitaires (utils, config, modules clés) |
| `npm run test:coverage` | Couverture Vitest (seuils : `js/utils/`, `js/config/`, `fonts.js`, `contact-bandeau.js`) |
| `npm run test:e2e` | Playwright (nécessite un build) |
| `npm run validate:html` | Validation HTML + règles a11y de base |
| `npm run lint` | ESLint |

Checklist PR : `npm run lint && npm run validate:html && npm run format:check && npm test && npm run test:coverage && npm run build && npm run test:e2e`

---

## Configuration

Fichier `.env.local` (optionnel, voir `.env.example`) :

| Variable | Rôle |
|----------|------|
| `PORTFOLIO_SITE_URL` | URL canonique / Open Graph |
| `PORTFOLIO_FORMSPREE` | Endpoint Formspree |
| `PORTFOLIO_RECAPTCHA_SITE_KEY` | Clé site reCAPTCHA v3 |

Valeurs par défaut : `build/config-defaults.cjs` → synchronisées au `prebuild`.

---

## Architecture (résumé)

```
*.html + partials/     Pages et fragments (inlinés au build)
styles/                Tokens, layout, composants, pages
js/main.js             Entrée ; modules lazy par data-section-id
js/config/             Site, projets, contact, navigation…
build/                 HTML, CSS, JS minify, images WebP
e2e/                   Smoke, a11y (Axe), contact, navigation
```

Push sur `main` → CI (lint, tests, Lighthouse) → GitHub Pages.

---

## Documentation

- [CHANGELOG.md](CHANGELOG.md) — versions
- [CONTRIBUTING.md](CONTRIBUTING.md) — contribuer, tests, conventions
- [SECURITY.md](SECURITY.md) — signalement de vulnérabilités

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Nav / footer vides | Utiliser un serveur HTTP (`npx serve`), pas `file://` |
| Formulaire 403 | Domaines reCAPTCHA + Formspree pour votre URL |
| Favicon absente | Hard refresh ; vérifier `assets/favicon.png` après build |

### Dépannage npm

| Problème | Solution |
|----------|----------|
| `UNABLE_TO_VERIFY_LEAF_SIGNATURE` | Certificat entreprise / proxy TLS : configurer `npm config set strict-ssl false` (réseau de confiance uniquement) ou le certificat racine CA |
| Dépendance manquante au build | `npm ci` puis relancer `npm run build` |
| `dist/` verrouillé sous Windows | Fermer l’explorateur ou le serveur qui lit `dist/` ; le build utilise `.dist-staging/` en secours |
