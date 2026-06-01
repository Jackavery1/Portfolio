# Portfolio Arcade CRT

Portfolio de **Joris Martinez** — thème arcade, score, navigation clavier, modales projets.  
Site statique (HTML/CSS/JS) avec build Node et déploiement GitHub Pages.

**En ligne :** [jackavery1.github.io/Portfolio](https://jackavery1.github.io/Portfolio/)

---

## Prérequis

- Node.js **18+** (voir `.nvmrc`)
- `npm ci`

---

## Commandes

| Commande | Rôle |
|----------|------|
| `npm run build` | Build prod → `.dist-staging/` |
| `npm run watch` | Rebuild auto des sources |
| `npm test` | Tests unitaires (Vitest) |
| `npm run test:e2e` | Tests E2E (Playwright, sur le build) |
| `npm run lint` | ESLint |
| `npm run format:check` | Prettier |

Avant une PR : `npm run lint && npm run format:check && npm test && npm run build && npm run test:e2e`

Commits au format **Conventional Commits** (`feat:`, `fix:`, `chore:`, etc.) — vérifié en CI.

---

## Développement local

**Sources (racine)** — partials chargés en `fetch`, il faut un serveur HTTP :

```bash
npx serve .
```

**Build** — comme en prod :

```bash
npm run build
npx serve .dist-staging
```

En dev, la favicon est injectée par `main.js` si le head de prod n’est pas présent.

---

## Configuration

Valeurs par défaut : `build/config-defaults.cjs` (synchronisées vers `js/config/defaults.js` au build).

Surcharge optionnelle : copier `.env.example` → `.env.local` puis `npm run build`.

| Variable | Usage |
|----------|--------|
| `PORTFOLIO_SITE_URL` | URL canonique / Open Graph |
| `PORTFOLIO_FORMSPREE` | Endpoint formulaire contact |
| `PORTFOLIO_RECAPTCHA_SITE_KEY` | Clé site reCAPTCHA |

Formulaire : `js/config/contact.js` · Projets modale : `js/config/projects.js`

---

## Structure

```
├── *.html, style.css, styles/, partials/
├── js/main.js, js/config/, js/modules/, js/utils/
├── assets/
├── build/          # modules du build
├── build.js
└── e2e/
```

---

## Déploiement

Push sur `main` → CI (lint, tests, build, e2e, Lighthouse) → publication de `.dist-staging/` sur `gh-pages` (workflow `ci.yml`).

---

## Dépannage rapide

| Problème | Piste |
|----------|--------|
| Partials vides | Ne pas ouvrir en `file://` — utiliser `npx serve` |
| `npm install` / certificat TLS | Réseau d’entreprise, proxy, ou `NODE_EXTRA_CA_CERTS` |
| Formspree 403 | reCAPTCHA + domaines autorisés |
| Favicon absente | Hard refresh ; vérifier `assets/favicon.png` après build |

---

## Autres fichiers

- [CHANGELOG.md](CHANGELOG.md) — versions
- [SECURITY.md](SECURITY.md) — signalement vulnérabilités
- [LICENSE](LICENSE) — tous droits réservés
