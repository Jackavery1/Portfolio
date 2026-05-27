# Contribuer au Portfolio Arcade

Merci de votre intérêt pour ce projet. Ce dépôt est un site statique (HTML/CSS/JS) avec build Node et déploiement GitHub Pages.

## Prérequis

- **Node.js 18** (voir `.nvmrc`)
- `npm ci` puis `npm run build`
- Python 3 optionnel pour `npm run serve` (servir `.dist-staging/`)

## Workflow Git

1. Créer une branche depuis `main` :
   - `fix/*` — correctifs
   - `feature/*` — nouvelles fonctionnalités
   - `chore/*` — outillage, dépendances, docs
2. Utiliser le format **Conventional Commits** pour chaque commit.
3. Ouvrir une **pull request** vers `main`.
4. Vérifier que la **CI** est verte avant merge.

### Format de commit obligatoire

- `feat(scope): description`
- `fix(scope): description`
- `chore(scope): description`
- `docs(scope): description`
- `refactor(scope): description`
- `test(scope): description`
- `ci(scope): description`
- `build(scope): description`

Exemples:

- `feat(contact): ajoute validation du sujet`
- `fix(build): corrige publication de .dist-staging`

## Checks obligatoires avant PR

```bash
npm ci
npm run lint
npm run format:check
npm test
npm run build
npm run test:e2e
```

Les tests E2E mockent Formspree et reCAPTCHA ; ils nécessitent Chromium (`npx playwright install chromium`).

## Conventions de code

- **JavaScript** : modules ES (`import` / `export`), pas de bundler runtime.
- **CSS** : fichiers dans `styles/`, importés via `style.css`.
- **HTML** : partials dans `partials/`, inlinés au build.
- Respecter ESLint et Prettier (`npm run format` pour corriger).

## Structure utile

| Dossier / fichier | Rôle |
|-------------------|------|
| `js/main.js` | Point d’entrée, init par page |
| `js/config/index.js` | Agrégation de la configuration |
| `js/modules/` | Fonctionnalités par domaine |
| `build.js` | Build production → `.dist-staging/` |
| `docs/PLAN_CORRECTION.md` | Roadmap qualité, déploiement et releases |
| `build/config-defaults.cjs` | URL site, Formspree, reCAPTCHA (source unique) |

## Revue de code

- PR focalisée (un sujet par PR si possible).
- Décrire le **pourquoi** et les pages impactées.
- Joindre une capture si changement visuel.
- Le mainteneur peut demander des ajustements avant merge.

## PR Dependabot

- Merger les PR groupées `deps` / `ci` après CI verte.
- Ne pas utiliser `npm audit fix --force` sans revue : risque de modifications majeures non maîtrisées.
- Les `overrides` dans `package.json` sont intentionnels ; ne pas les retirer sans `npm audit`.

## Signaler un problème de sécurité

Ne pas ouvrir d’issue publique pour une vulnérabilité. Voir [SECURITY.md](SECURITY.md).
