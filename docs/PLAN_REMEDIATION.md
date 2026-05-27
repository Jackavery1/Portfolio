# Plan de remédiation — Portfolio (PR par PR)

Document issu de l’audit technique (mai 2026). Chaque PR est **indépendante dans sa priorité**, mais l’ordre numéroté limite les conflits et maximise le gain rapide.

**Légende effort :** S = quelques heures · M = 0,5–1 jour · L = 2–5 jours

---

## Vue d’ensemble

| PR   | Priorité | Titre court                         | Effort | Bloque |
|------|----------|-------------------------------------|--------|--------|
| PR-01 | P0      | Correctif reCAPTCHA                 | S      | —      |
| PR-02 | P0      | Lockfile + `npm ci`                 | S      | —      |
| PR-03 | P0      | Workflow CI validation (PR + main)  | S      | PR-02  |
| PR-04 | P1      | Dependabot                          | S      | —      |
| PR-05 | P1      | Épinglage actions GitHub (SHA)      | S      | PR-03  |
| PR-06 | P1      | CONTRIBUTING + SECURITY             | S      | —      |
| PR-07 | P1      | ESLint + Prettier                   | M      | PR-03  |
| PR-08 | P1      | Tests smoke (Vitest)                | M      | PR-07  |
| PR-09 | P2      | Nettoyage code mort + doublon CSS   | S      | —      |
| PR-10 | P2      | Découpage `js/config.js`            | M      | PR-08  |
| PR-11 | P2      | Factorisation `<head>` au build      | M      | PR-03  |
| PR-12 | P2      | Config multi-env au build             | M      | PR-10  |
| PR-13 | P3      | Playwright e2e (3 scénarios)          | M      | PR-08  |
| PR-14 | P3      | Lighthouse / a11y en CI               | M      | PR-03  |
| PR-15 | P3      | Runbook déploiement + releases        | S      | PR-06  |

---

## PR-01 — Correctif reCAPTCHA (P0)

**Branche :** `fix/recaptcha-existent-typo`  
**Objectif :** Éviter `ReferenceError` qui empêche le chargement du script reCAPTCHA v3.

### Fichiers

- `js/modules/recaptcha.js` (lignes 31 et 39 : `existent` → `existant`)

### Étapes

1. Remplacer les deux occurrences de `existent` par `existant`.
2. Ouvrir `contact.html` en local, soumettre le formulaire (mode test Formspree si besoin).
3. Vérifier dans la console : aucune erreur `ReferenceError: existent is not defined`.

### Checklist de validation

- [ ] `npm run build` termine sans erreur
- [ ] Page contact : script `data-recaptcha-v3` injecté une seule fois
- [ ] Envoi formulaire : token `g-recaptcha-response` présent dans la requête réseau (onglet Network)
- [ ] Changement de clé site (simulation) : pas de scripts reCAPTCHA dupliqués après rechargement
- [ ] Aucune régression sur les autres pages (smoke : accueil, projets)

### Critère de merge

Correctif minimal, une seule responsabilité, revue en &lt; 5 min.

---

## PR-02 — Lockfile + reproductibilité npm (P0)

**Branche :** `chore/lockfile-npm-ci`  
**Objectif :** Builds locaux et CI identiques dans le temps.

### Fichiers

- `.gitignore` — retirer la ligne `package-lock.json` (garder `yarn.lock` ignoré si souhaité)
- `package-lock.json` — générer et committer
- Optionnel : `.nvmrc` avec `18` (aligné sur le workflow)

### Étapes

1. Retirer `package-lock.json` de `.gitignore`.
2. `rm -rf node_modules` puis `npm install` (Node 18).
3. Committer `package-lock.json`.
4. Ajouter `.nvmrc` contenant `18` (recommandé).

### Checklist de validation

- [ ] Clone frais + `npm ci` + `npm run build` OK
- [ ] `package-lock.json` présent et versionné
- [ ] Taille du lockfile raisonnable (pas de dépendances fantômes ajoutées à la main)

### Critère de merge

Ne pas mélanger avec d’autres changements fonctionnels.

---

## PR-03 — Workflow CI validation (P0)

**Branche :** `ci/quality-gates`  
**Dépend de :** PR-02  
**Objectif :** Ne plus déployer que du code qui build ; valider les PR avant merge.

### Fichiers

- `.github/workflows/ci.yml` (nouveau)
- `.github/workflows/deploy.yml` (modifier : `npm ci`, déclencher après succès ou garder séparé)

### Contenu suggéré `ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
      - run: npm ci
      - run: npm run build
```

### Modifications `deploy.yml`

- Remplacer `npm install` par `npm ci`
- Ajouter `cache: npm` sur `setup-node`
- Option A : garder deploy uniquement sur `push main` (build déjà validé par CI sur la même ref)
- Option B : `workflow_run` après succès de CI (plus strict)

### Checklist de validation

- [ ] PR ouverte : workflow CI vert
- [ ] PR avec erreur volontaire dans `build.js` : CI rouge
- [ ] Push `main` : CI vert puis deploy vert
- [ ] `dist/` généré en CI contient HTML + assets attendus

### Critère de merge

Documenter dans le README : « toute PR doit passer CI avant merge ».

---

## PR-04 — Dependabot (P1)

**Branche :** `chore/dependabot`  
**Objectif :** Mises à jour automatiques npm + GitHub Actions.

### Fichiers

- `.github/dependabot.yml` (nouveau)

### Exemple

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
  - package-ecosystem: github-actions
    directory: "/"
    schedule:
      interval: monthly
```

### Checklist de validation

- [ ] Fichier YAML valide (pas d’erreur syntaxe)
- [ ] Première PR Dependabot apparaît sous 24–48 h (ou déclencher manuellement selon config org)

### Critère de merge

Aucun changement de code applicatif.

---

## PR-05 — Épinglage actions GitHub (P1)

**Branche :** `ci/pin-actions-sha`  
**Dépend de :** PR-03  
**Objectif :** Réduire le risque supply-chain sur les actions tierces.

### Fichiers

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

### Étapes

1. Pour chaque `uses: org/action@tag`, remplacer par `@<commit-sha> # vX.Y.Z` (commentaire version lisible).
2. Sources : https://github.com/actions/checkout/releases , setup-node, peaceiris/actions-gh-pages.

### Checklist de validation

- [ ] Workflows déclenchés et verts sur une PR test
- [ ] SHA documentés en commentaire à côté de chaque `uses`

### Critère de merge

Mettre à jour les SHA via Dependabot (PR-04) ensuite.

---

## PR-06 — CONTRIBUTING + SECURITY (P1)

**Branche :** `docs/governance`  
**Objectif :** Onboarding et signalement vulnérabilités.

### Fichiers

- `CONTRIBUTING.md` (nouveau)
- `SECURITY.md` (nouveau)
- `README.md` — liens vers ces fichiers

### Contenu minimal CONTRIBUTING

- Prérequis : Node 18, `npm ci`, `npm run build`
- Branches : `feature/*`, `fix/*`, `chore/*`
- Commits : impératif court ou Conventional Commits léger
- PR : description, checklist CI, capture si UX
- Revue : au moins self-review + CI verte

### Contenu minimal SECURITY

- Ne pas ouvrir d’issue publique pour une faille
- Contact : email du portfolio (déjà public)
- Périmètre : site statique, Formspree, reCAPTCHA (clés site publiques OK ; jamais clé secrète reCAPTCHA)

### Checklist de validation

- [ ] Liens README fonctionnels
- [ ] Instructions reproductibles par un tiers

---

## PR-07 — ESLint + Prettier (P1)

**Branche :** `chore/lint-format`  
**Dépend de :** PR-03  
**Objectif :** Style et erreurs JS détectés avant merge.

### Fichiers

- `package.json` — scripts `lint`, `format`, `format:check` ; devDependencies
- `eslint.config.js` (flat config ESLint 9+) ou `.eslintrc.cjs`
- `.prettierrc` + `.prettierignore`
- `.github/workflows/ci.yml` — étape `npm run lint`

### Config suggérée

- ESLint : `eslint:recommended` + règles ES modules browser
- Ignorer : `dist/`, `node_modules/`
- Prettier : aligné sur le style existant (guillemets simples, 2 espaces si majoritaire)

### Checklist de validation

- [ ] `npm run lint` passe sur tout le dépôt (ou fix auto dans la même PR)
- [ ] `npm run format:check` passe en CI
- [ ] Aucun changement fonctionnel involontaire (diff principalement formatting)

### Critère de merge

Si trop de bruit : activer d’abord `warn` puis `error` en PR suivante.

---

## PR-08 — Tests smoke Vitest (P1)

**Branche :** `test/vitest-smoke`  
**Dépend de :** PR-07 (optionnel mais recommandé)  
**Objectif :** Filet minimal sur utilitaires et logique pure.

### Fichiers

- `package.json` — `vitest`, script `test`
- `vitest.config.js`
- `js/utils/dom.test.js` — `byId` avec jsdom
- `js/modules/contact-form.test.js` — validation email/message (extraire fonctions pures si besoin)
- `.github/workflows/ci.yml` — `npm test`

### Cas de test prioritaires

1. `cleDansScriptV3` / logique clé reCAPTCHA (extraire en pure function si nécessaire)
2. Sanitization / validation champs contact (fonctions exportées)
3. `build.js` : smoke « le script démarre » (optionnel, test léger import)

### Checklist de validation

- [ ] `npm test` local et CI verts
- [ ] Échec volontaire d’un test fait échouer la CI
- [ ] Couverture non bloquante au début (seuil 0 %, objectif 40 % en PR ultérieure)

---

## PR-09 — Nettoyage code mort + doublon CSS (P2)

**Branche :** `chore/dead-code-cleanup`  
**Objectif :** Réduire la dette sans refactor lourd.

### Fichiers candidats

- `js/modules/contact-bandeau.js` — `js-bandeau-aide` absent du HTML : supprimer le hook ou ajouter l’élément
- `styles/pages/dojo.css` vs `styles\pages\dojo.css` — un seul fichier, supprimer le doublon path Windows
- Recherche globale : `grep` imports non utilisés, fonctions jamais appelées

### Étapes

1. `rg "js-bandeau-aide"` — décider supprimer ou implémenter
2. Lister les deux `dojo.css` : garder `styles/pages/dojo.css`
3. `npm run build` + navigation manuelle dojo

### Checklist de validation

- [ ] Build OK
- [ ] Page dojo visuellement identique
- [ ] Aucune référence cassée dans `style.css` imports

---

## PR-10 — Découpage `js/config.js` (P2)

**Branche :** `refactor/split-config`  
**Dépend de :** PR-08 (tests protègent les imports)  
**Objectif :** Réduire le couplage du hub de configuration.

### Structure cible

```
js/config/
  index.js          # réexport CONFIG agrégé (compat)
  site.js           # SITE_ORIGIN, meta
  contact.js        # Formspree, reCAPTCHA, email
  projects.js       # données projets
  selectors.js      # sélecteurs DOM
```

### Étapes

1. Créer sous-modules sans changer les clés publiques de `CONFIG`.
2. Mettre à jour imports : `from '../config.js'` → inchangé si `index.js` réexporte.
3. Ajouter tests sur structure minimale (`CONFIG.CONTACT`, `CONFIG.PROJECTS`).

### Checklist de validation

- [ ] Toutes les pages chargent sans erreur console
- [ ] Modale projets : données correctes
- [ ] Contact : endpoint et clé reCAPTCHA inchangés
- [ ] `npm test` + `npm run build` verts

---

## PR-11 — Factorisation `<head>` au build (P2)

**Branche :** `refactor/head-template-build`  
**Dépend de :** PR-03  
**Objectif :** Une seule source pour meta OG, fonts, favicon.

### Fichiers

- `partials/head-common.html` (nouveau)
- `build.js` — fonction `injectHeadCommon(html)` ou remplacement placeholder `<!-- HEAD_COMMON -->`
- Chaque `*.html` — retirer duplication, garder uniquement meta spécifiques page

### Checklist de validation

- [ ] Comparer `dist/index.html` et `dist/contact.html` : bloc commun identique
- [ ] SEO : title/description/canonical par page toujours corrects
- [ ] Open Graph / Twitter cards présents sur pages concernées
- [ ] Lighthouse SEO score stable ou amélioré

---

## PR-12 — Config multi-environnement au build (P2)

**Branche :** `feat/build-env-config`  
**Dépend de :** PR-10  
**Objectif :** Préparer staging / preview sans éditer `config.js` à la main.

### Fichiers

- `.env.example` — `SITE_ORIGIN`, `FORMSPREE_ENDPOINT`, `RECAPTCHA_SITE_KEY`
- `build.js` — lecture `process.env` avec fallbacks documentés
- `README.md` — section environnements
- `.gitignore` — déjà `.env` (OK)

### Checklist de validation

- [ ] Build sans `.env` : comportement prod actuel inchangé
- [ ] Build avec `.env.local` : valeurs injectées dans bundle/dist
- [ ] Aucun secret serveur reCAPTCHA dans le repo

---

## PR-13 — Playwright e2e (P3)

**Branche :** `test/playwright-e2e`  
**Dépend de :** PR-08  
**Objectif :** Parcours utilisateur critiques bout en bout.

### Scénarios

1. **Navigation** : accueil → projets → ouverture modale → Escape ferme
2. **Contact** : remplir champs valides → submit (mock Formspree ou `route` intercept)
3. **Dojo** : page charge, pas d’erreur console bloquante

### Fichiers

- `playwright.config.js`
- `e2e/navigation.spec.js`, `e2e/contact.spec.js`
- CI : job séparé ou step après `npm run build` + `npx serve dist`

### Checklist de validation

- [ ] Tests passent en local headless
- [ ] CI exécute e2e sur PR (peut être `continue-on-error` la première semaine)

---

## PR-14 — Lighthouse / accessibilité CI (P3)

**Branche :** `ci/lighthouse-a11y`  
**Dépend de :** PR-03  
**Objectif :** Détecter régressions perf/a11y.

### Outils possibles

- `treosh/lighthouse-ci-action` sur `dist/` après build
- ou `@axe-core/cli` sur URLs servies localement

### Seuils initiaux (souples)

- Performance ≥ 85 (mobile)
- Accessibility ≥ 90
- Pas de régression &gt; 5 points vs baseline enregistrée

### Checklist de validation

- [ ] Baseline commitée (`.lighthouserc.json` ou artefact)
- [ ] PR qui casse le focus trap modale : a11y score baisse (test manuel de validation du outil)

---

## PR-15 — Runbook déploiement + releases (P3)

**Branche :** `docs/deploy-runbook`  
**Dépend de :** PR-06  
**Objectif :** Procédures incident et versioning produit.

### Fichiers

- `docs/RUNBOOK_DEPLOIEMENT.md`
- `README.md` — lien runbook
- Optionnel : tags Git `v1.0.1` + GitHub Release notes template

### Contenu runbook

- Déclenchement : push `main` → CI → deploy `gh-pages`
- Rollback : revert commit sur `main` ou reset `gh-pages` au SHA précédent
- Vérification post-deploy : URL prod, formulaire, CSP dans `dist`
- CNAME / domaine personnalisé

### Checklist de validation

- [ ] Un tiers peut suivre le runbook pour rollback sur une branche de test
- [ ] Première release taguée documentée

---

## Ordre d’exécution recommandé (sprint)

### Semaine 1 — Stabilisation (P0)

```
PR-01 → PR-02 → PR-03
```

Parallélisable après merge PR-02 : **PR-04**, **PR-06**

### Semaine 2 — Qualité (P1)

```
PR-05 → PR-07 → PR-08
```

### Semaines 3–4 — Structure (P2)

```
PR-09 → PR-10 → PR-11 → PR-12
```

### Mois 2 — Durcissement (P3)

```
PR-13 → PR-14 → PR-15
```

---

## Modèle de description PR (copier-coller)

```markdown
## Contexte
[Lien audit / issue — ex. PR-01 correctif reCAPTCHA]

## Changements
- …

## Checklist auteur
- [ ] `npm ci && npm run build`
- [ ] [ ] `npm run lint` / `npm test` si applicable
- [ ] Test manuel : [pages concernées]

## Checklist relecteur
- [ ] Diff focalisé, pas de hors-scope
- [ ] CI verte
- [ ] Critères de validation du PLAN_REMEDIATION.md PR-XX cochés
```

---

## Suivi des métriques (optionnel)

| Métrique              | Avant audit | Cible J+30 | Cible J+90 |
|-----------------------|-------------|------------|------------|
| Score audit global    | 11/20       | 13/20      | 15/20      |
| Tests automatisés     | 0           | smoke Vitest | + e2e    |
| CI sur PR             | non         | oui        | lint+test+a11y |
| Lockfile versionné    | non         | oui        | oui        |
| Couverture (approx.)  | 0 %         | 25 %       | 40 %       |

---

## Notes

- **Ne pas** committer de clé secrète reCAPTCHA (seule la clé *site* est publique).
- Les PR P0 peuvent être mergées en **1 jour** si priorité production.
- Après PR-03, toute nouvelle fonctionnalité doit passer par une PR (plus de push direct `main` si possible).

*Dernière mise à jour : mai 2026 — aligné sur l’état du dépôt (bug `existent` confirmé dans `js/modules/recaptcha.js`).*
