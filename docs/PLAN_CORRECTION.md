# Plan de correction — Portfolio Arcade CRT

Suivi minimal des corrections 12 à 16.

**Légende :** `[ ]` à faire · `[~]` en cours · `[x]` livré

## État rapide

| ID | Sujet | Statut |
|----|-------|--------|
| COR-01 → COR-11 | Corrections P0 à P3 techniques | `[x]` |
| COR-12 | Conventional Commits + releases | `[~]` |
| COR-13 | Stabiliser E2E flaky (modale/a11y/contact) | `[x]` |
| COR-14 | Aligner la doc sur `.dist-staging` | `[x]` |
| COR-15 | Simplifier `build/html.cjs` | `[x]` |
| COR-16 | Valider favicon en prod | `[~]` |

## Détail des corrections

### COR-12 — Conventional Commits + releases

- [x] Règle Conventional Commits active dans la CI PR (`.github/workflows/ci.yml`)
- [x] Format documenté dans `CONTRIBUTING.md`
- [ ] Publier une release GitHub taggée (`vX.Y.Z`) sur `main` (action manuelle)

### COR-13 — Stabiliser E2E flaky

- [x] Attentes explicites ajoutées avant interactions modale/contact
- [x] Specs a11y exécutées en `serial`
- [x] Mock reCAPTCHA/Formspree durci pour tests E2E
- [x] Exécution Playwright stabilisée (`workers: 1`, `fullyParallel: false`)
- [x] Contraste corrigé pour supprimer les faux rouges a11y (`contact` + tags modale)
- [x] `npm run test:e2e` vert en local

### COR-14 — Aligner la documentation sur `.dist-staging`

- [x] Références `dist/` obsolètes corrigées dans `README.md`
- [x] Références alignées dans `CONTRIBUTING.md`
- [x] Commandes build/test/deploy harmonisées avec `.dist-staging`

### COR-15 — Simplifier `build/html.cjs`

- [x] `PAGE_META` extrait dans `build/page-meta.cjs`
- [x] `build/html.cjs` clarifié (blocs SEO/head/partials)
- [x] Commentaires courts ajoutés sur les fonctions clés

### COR-16 — Favicon en prod

- [x] Fallback SVG conservé dans `partials/head-common.html`
- [x] Vérification locale ajoutée via `e2e/favicon.spec.js`
- [ ] Vérifier l’affichage favicon sur GitHub Pages après prochain déploiement (manuel)

## Vérifications locales exécutées

- [x] `npm test`
- [x] `npm run lint`
- [x] `npm run build`
- [x] `npm run test:e2e`
- [x] `npm run test:lhci`
# Plan de correction — Portfolio Arcade CRT

Document de suivi **minimal** des corrections encore à faire.

**Score audit actualisé : 16,1 / 20**  
**Légende :** `[ ]` à faire · `[~]` en cours · `[x]` livré

---

## État rapide

| ID | Sujet | Statut |
|----|-------|--------|
| COR-01 → COR-11 | Corrections P0 à P3 techniques | `[x]` |
| COR-12 | Conventional Commits + releases | `[~]` |
| COR-13 | Stabiliser E2E flaky (modale/a11y) | `[ ]` |
| COR-14 | Aligner la doc sur `.dist-staging` | `[ ]` |
| COR-15 | Simplifier `build/html.cjs` | `[ ]` |
| COR-16 | Valider favicon en prod | `[ ]` |

---

## Corrections à effectuer

### COR-12 — Conventional Commits + releases (en cours)

**À faire**
- [ ] Publier au moins une release GitHub taggée (`vX.Y.Z`)
- [ ] Vérifier que la règle de commit CI est appliquée sur les prochaines PR

---

### COR-13 — Stabiliser E2E flaky

**Fichiers**
- `e2e/a11y.spec.js`
- `e2e/navigation.spec.js`
- `playwright.config.js`

**À faire**
- [ ] Ajouter attentes explicites avant clics (`toBeVisible`)
- [ ] Rendre la spec a11y modale moins flaky (serial/retry ciblé)
- [ ] Valider 3 runs consécutifs sans échec

---

### COR-14 — Aligner la documentation sur `.dist-staging`

**Fichiers**
- `README.md`
- `docs/PLAN_CORRECTION.md`

**À faire**
- [ ] Remplacer les mentions `dist/` obsolètes
- [ ] Harmoniser commandes build/test/deploy avec `.dist-staging`

---

### COR-15 — Simplifier `build/html.cjs`

**Fichiers**
- `build/html.cjs`
- `build/page-meta.cjs` (si extraction)

**À faire**
- [ ] Extraire `PAGE_META` du module principal
- [ ] Clarifier les blocs (`seo`, `head`, `partials`)
- [ ] Ajouter commentaires courts et utiles

---

### COR-16 — Favicon en prod

**Fichiers**
- `assets/favicon.png`
- `partials/head-common.html`
- `build/images.cjs`

**À faire**
- [ ] Vérifier favicon visible localement après build
- [ ] Vérifier favicon visible sur GitHub Pages après déploiement
- [ ] Conserver fallback SVG

---

## Checklist de clôture

- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run test:e2e`
- [ ] `npm run test:lhci`

## Déjà livré (ne pas refaire)

Ces chantiers sont en place ; les cocher `[x]` sert de référence historique.

| Chantier | Preuve dans le dépôt |
|----------|----------------------|
| CI lint + format + tests + build | `.github/workflows/ci.yml` |
| E2E Playwright (contact, nav/modale, dojo) | `e2e/*.spec.js` |
| ESLint 9 + Prettier | `eslint.config.cjs`, scripts npm |
| Config découpée | `js/config/*.js` |
| Dependabot npm + Actions | `.github/dependabot.yml` |
| Vitest (config, validation, pii, env build) | `js/**/*.test.js`, `build/env.test.js` |
| Lighthouse CI (warn) | `lighthouserc.cjs`, job `lighthouse` |
| CSP prod, partials inlinés, WebP | `build.js` |
| CONTRIBUTING + SECURITY | racine du dépôt |
| Correctif typo reCAPTCHA (`existant`) | `js/modules/recaptcha.js` |
| Lockfile + `npm ci` | `package-lock.json` |

---

## COR-01 — Double comptage score sur la page projets (P0) — livré

**Branche :** `fix/score-projets-unique`  
**Problème :** `meta.js` (+1100 au clic sur `.carte-projet`) et `modal.js` (+350) s’additionnent sur WORK.

**Correction :** retrait des écouteurs `.carte-projet` dans `meta.js` (clic + survol) ; seul `modal.js` attribue les points sur WORK (+350 à l’ouverture).

### Fichiers

- `js/modules/meta.js` — retirer l’écouteur clic sur `.carte-projet` **ou** le limiter aux pages sans modale
- `js/modules/modal.js` — conserver les bonus modale uniquement
- Option : `js/main.js` — n’appeler `initBonusScore` que hors `data-section-id="projets"`

### Étapes

1. Choisir une seule source de bonus « carte projet » (recommandé : `modal.js` sur projets).
2. Garder dans `meta.js` le bonus « première visite page » (+200) et les `.boss-carte` / liens GitHub.
3. Tester manuellement : clic carte → un seul incrément attendu ; modale → bonus modale inchangé.

### Validation

- [ ] `npm test` OK
- [ ] `npm run test:e2e` OK (navigation.spec.js)
- [ ] Score cohérent après 3 clics sur une même carte

---

## COR-02 — Deploy conditionné à la CI (P0) — livré

**Branche :** `ci/deploy-after-validate`  
**Problème :** `deploy.yml` build et publie sans exiger les jobs lint/e2e.

**Correction :** job `deploy` dans `ci.yml` (`needs: [validate, e2e]`, push `main` uniquement) ; artefact `dist` du job validate ; `deploy.yml` supprimé.

### Fichiers

- `.github/workflows/ci.yml`

### Étapes

1. Extraire un workflow `validate.yml` avec `workflow_call` **ou** ajouter un job `deploy` dans `ci.yml` qui `needs: [validate, e2e]` et publie `dist/`.
2. Supprimer le deploy « nu » sur push `main` si redondant.
3. Documenter dans la section [Déploiement](#déploiement) ci-dessous.

### Validation

- [ ] Push sur branche de test : pas de publish si e2e échoue
- [ ] Merge sur `main` : publish uniquement si validate + e2e verts

---

## COR-03 — Tests unitaires formulaire contact (P1) — livré

**Correction :** helpers purs dans `js/utils/contact-form-helpers.js` + 12 tests dans `js/utils/contact-form-helpers.test.js` ; `contact-form.js` refactorisé pour les importer.

### Validation

- [x] `npm test` ≥ 25 tests (29)
- [x] Cas 403/400 avec payload Formspree mocké

---

## COR-04 — `npm audit` bloquant pour les high (P1) — livré

**Correction :** override `tmp` ≥ 0.2.6 ; CI exécute `npm audit --omit=dev --audit-level=high` sans `continue-on-error`. Les moderate restants (imagemin, @lhci/cli) sont traités en COR-10 / job lighthouse non bloquant.

### Validation

- [x] `npm audit --omit=dev --audit-level=high` = 0 high
- [x] CI bloque les nouvelles vulnérabilités high en production

---

## COR-05 — Source unique config au build (P1) — livré

**Correction :** `build/config-defaults.cjs` source unique ; `build/sync-defaults.cjs` génère `js/config/defaults.js` ; `site.js` / `contact.js` importent depuis `defaults.js` ; test `build/config-sync.test.js`.

### Validation

- [x] `build/env.test.js` OK
- [x] `prebuild` synchronise les defaults avant chaque build

---

## COR-06 — Découpage `build.js` (P2) — livré

**Correction :** `build.js` orchestrateur ; modules `build/fs-utils.cjs`, `html.cjs`, `css.cjs`, `js-minify.cjs`, `images.cjs` (images factorisées).

### Validation

- [x] `npm run build` OK
- [x] `createDist` avec `maxRetries` (Windows)

---

## COR-07 — E2E smoke 7 pages + a11y (P2) — livré

**Correction :** `e2e/smoke-pages.spec.js` (7 pages) ; `e2e/a11y.spec.js` avec `@axe-core/playwright` (violations critical/serious).

### Validation

- [x] 7 pages couvertes en smoke
- [x] Axe contact + modale projets

---

## COR-08 — Erreurs partials en dev (P2) — livré

**Correction :** `console.warn` dans `partials.js` si localhost / 127.0.0.1 / `?dev=1`.

---

## COR-09 — Utilitaire page courante (P2) — livré

**Correction :** `js/utils/page.js` + tests ; utilisé par `navigation.js`, `partials.js`, `meta.js`.

---

## COR-10 — Migration imagemin → sharp (P3) — livré

**Branche :** `chore/sharp-images`  
**Problème :** vulnérabilités moderate dans la chaîne `imagemin` / `*-bin`.

### Fichiers

- `build/images.js` (après COR-06) ou `build.js`
- `package.json` — retirer `imagemin-*`, ajouter `sharp`

### Étapes

1. Reproduire mozjpeg/pngquant/webp avec sharp (qualité équivalente documentée).
2. Comparer tailles `dist/assets` avant/après.
3. Activer COR-04 en mode strict.

### Validation

- [x] Build images basé sur `sharp`
- [x] Plus de dépendances `imagemin-*` dans `package.json`

---

## COR-11 — Lighthouse / a11y bloquants (P3) — livré

**Branche :** `ci/lighthouse-strict`  
**Problème :** `continue-on-error: true` ; seuils en warn seulement.

### Fichiers

- `lighthouserc.cjs`
- `.github/workflows/ci.yml`

### Étapes

1. Mesurer baseline sur `main` (4 URLs déjà configurées).
2. Passer `performance`, `accessibility`, `best-practices`, `seo` en **error** avec marges sous le score actuel.
3. Corriger les régressions avant merge.

### Validation

- [x] Job `lighthouse` bloquant dans la CI
- [x] Assertions LHCI en `error`

---

## COR-12 — Conventional Commits + releases (P3) — livré

**Branche :** `docs/commits-releases`  
**Problème :** messages de commit hétérogènes ; peu de tags.

### Fichiers

- `CONTRIBUTING.md` — section Conventional Commits (`fix:`, `feat:`, `chore:`)

### Étapes

1. Tag annoté `v1.0.0` (ou prochain semver) sur `main` stable.
2. GitHub Release avec le modèle ci-dessous.

### Validation

- [x] CONTRIBUTING mis à jour avec format obligatoire
- [x] Vérification du format des commits sur PR dans la CI

---

## Déploiement

### Architecture

```
push main → CI (lint, test, build, e2e, lighthouse) → deploy si vert
         → npm ci && npm run build
         → publication branche gh-pages (dossier .dist-staging/)
         → https://jackavery1.github.io/Portfolio/
```

### Déploiement normal

1. PR vers `main` avec CI verte.
2. Merger ; attendre workflow deploy (Actions).
3. Vérifier en navigation privée.

### Checklist post-déploiement

- [ ] Accueil : score, navigation, pas d’erreur console
- [ ] WORK : modale projet, score unique par action (COR-01)
- [ ] CONTACT : formulaire (test Formspree ou mode test)
- [ ] View source : meta **Content-Security-Policy** dans `dist/`
- [ ] Canonical / `og:url` → URL de prod

### Rollback

**Option A — Revert (recommandé)**

```bash
git log --oneline -n 5
git revert <sha-commit-problématique>
git push origin main
```

**Option B — Reset `gh-pages`**

```bash
git fetch origin gh-pages
git checkout gh-pages
git reset --hard <sha-gh-pages-sain>
git push origin gh-pages --force
```

À utiliser avec prudence.

**Option C — Rebuild local (secours)**

```bash
npm ci
npm run build
# Republier dist/ manuellement si l’action GitHub est indisponible
```

### Domaine personnalisé (CNAME)

1. Fichier `CNAME` sur `gh-pages`.
2. DNS selon [la doc GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).
3. Décommenter `cname:` dans le job `deploy` de `.github/workflows/ci.yml` si besoin.

### Incidents fréquents

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| Site sans CSS | `dist/` incomplet | Relancer workflow ; source Pages = `gh-pages` |
| Formulaire 403 | reCAPTCHA / domaine Formspree | Clé site + domaines autorisés |
| CI e2e rouge | Build ou mocks | `npm run build && npm run test:e2e` en local |
| Lighthouse warn | Score sous seuil | Rapport CI ; images/CSS |

---

## Releases (modèle GitHub)

Titre : **Release vX.Y.Z**

```markdown
## Résumé
<!-- Une phrase -->

## Changements
### Ajouté
-
### Corrigé
-
### Technique
-

## Vérifications
- [ ] CI verte sur le commit tagué
- [ ] Site Pages vérifié (checklist post-déploiement)
- [ ] npm test && npm run test:e2e OK en local
```

Création du tag :

```bash
git tag -a v1.0.1 -m "Release 1.0.1 — description courte"
git push origin v1.0.1
```

Puis **GitHub → Releases → Draft a new release** depuis le tag.

---

## Suivi des PR

Lors d’une PR liée à ce plan, indiquer dans la description :

```markdown
## Plan de correction
- [ ] COR-XX — titre
- [ ] Critères de validation COR-XX cochés
```

---

## Contacts

- Sécurité : [SECURITY.md](../SECURITY.md)
- Contribution : [CONTRIBUTING.md](../CONTRIBUTING.md)
