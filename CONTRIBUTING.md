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
npm start                    # sync + serve sources (partials en fetch)
npm run watch                # rebuild auto
npm run build && npm run start:prod   # comme en prod
```

Hook pre-commit optionnel (lint + format + tests avant chaque commit) : `npm run hooks:install` (`.githooks` → `node scripts/pre-commit.cjs`).

Ne pas ouvrir les HTML en `file://` ni via Live Server : les partials et modules ES requièrent un serveur HTTP (`npm start` ou `npx serve .` après sync).

La **CSP** et le **service worker** ne sont injectés qu’après `npm run build` — tester Formspree, reCAPTCHA et PWA sur `.dist-staging/` (`npm run start:prod`).

## Navigation (squelette vs partial runtime)

| Fichier                       | Rôle                                                 | Quand                                                                         |
| ----------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| `partials/nav.html`           | **Source unique** (score, burger, liens, annonce SR) | Éditer ici uniquement ; fetch runtime + inline build prod (`build/html.cjs`)  |
| `partials/nav-squelette.html` | Nav minimale first paint (générée)                   | Dérivée par `build/sync-nav-squelette.cjs` puis inlinée dans les HTML sources |

**Workflow** : modifier `partials/nav.html` → `node build/sync-nav-squelette.cjs` (ou `npm run pretest` / `prestart`). Ne plus éditer le squelette à la main.

## Contact (modules)

Point d’entrée unique : `js/modules/contact.js` (`initialiserPageContact`). Sous-modules spécialisés : bandeau, coordonnées, formulaire, reCAPTCHA, soumission Formspree — à modifier via la facade, pas depuis `main.js`.

## Design & thème

### Identité visuelle

Thème **sombre arcade CRT** — dark-only, shell nav EN + contenu FR, Press Start dense : choix assumés, détail et justifications dans `AUDIT-EXCLUSIONS.md` (ne pas les traiter comme dette en audit).

**Intention (5 secondes)** : marque **JORIS MARTINEZ** en hero, sous-titre métier, un CTA **PRESS START**, sprite pixel — le reste (liens, badges) est secondaire hors fold desktop. Trois polices (Press Start 2P / VT323 / Rajdhani) portent l’identité ; la densité pixel mobile est volontaire (voir exclusions).

### Responsive design (surfaces mobiles)

Le bloc `@media (max-width: 960px)` dans `styles/tokens.css` **assombrit/éclaircit légèrement les surfaces** pour la lisibilité mobile, **sans créer un second thème** : même identité dark / néon, seuls les contrastes de surface (`--couleur-fond`, séparateurs) s’ajustent.

**Coquille** : layout fluide centré `max-width: var(--largeur-coquille)` (960px, aligné `--bp-mobile-max`) — pas de letterbox canvas (N/A, voir exclusions).

### Clavier (desktop)

| Touche          | Action                                          |
| --------------- | ----------------------------------------------- |
| `←` / `→`       | Page voisine (cycle nav ; `preventDefault`)     |
| `Escape`        | Ferme burger / modale                           |
| `Tab`           | Focus visible ; piège Tab en modale             |
| `↑↓←→` (Konami) | Easter egg — ne pas réutiliser pour la nav page |

Pages hors cycle clavier : `dojo.html`, `mentions-legales.html` (footer / liens projets).

### Design tokens (`styles/tokens.css`)

Source unique des variables CSS. Ne pas dupliquer de hex dans les composants — réutiliser les tokens.

| Catégorie   | Tokens clés                                                                                                | Usage                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Surfaces    | `--couleur-fond-page`, `--couleur-fond`, `--couleur-fond-carte`, `--couleur-fond-champ`                    | Fonds page, colonne `.ecran`, cartes, champs                     |
| Accent      | `--couleur-accent`, `--couleur-accent-vif`, `--couleur-accent-rgb`                                         | CTA, liens, glow néon                                            |
| Texte       | `--couleur-texte-fort`, `--couleur-texte-normal`, `--couleur-texte-discret`, `--couleur-texte-placeholder` | Hiérarchie typo ; ratios AA documentés dans le fichier           |
| États       | `--couleur-valide`, `--couleur-actif`, `--couleur-erreur`                                                  | Succès, actif jaune arcade, erreurs formulaire                   |
| Typo        | `--police-*`, `--taille-*`, `--interligne-*`, `--tracking-*`                                               | Press Start / VT323 / Rajdhani ; rythme ligne + tracking         |
| Espacement  | `--espacement-2xs` → `--espacement-2xl`, `--largeur-coquille`, `--cible-tactile`                           | Grilles, coquille 960px, cibles ≥44px                            |
| Safe area   | `--safe-area-inset-*`                                                                                      | Encoches ; surchargeables en E2E                                 |
| Breakpoints | `--bp-*` (sync `build/breakpoints.mjs`)                                                                    | Documentation uniquement — **non utilisables dans `@media`**     |
| Ombres      | `--ombre-texte-lisible`, `--ombre-glow-accent`, `--ombre-glow-actif`, `--ombre-glow-valide`                | Halo sombre + glow néon (titres, nav, cartes)                    |
| Boss dojo   | `--couleur-boss-*` (16 tokens)                                                                             | Sprites SVG `partials/dojo-boss/` — test `dojo-boss-svg.test.js` |

**Shell arcade EN / contenu FR** : libellés visibles (nav HOME, WORK…) en anglais pour l’immersion ; contenu métier et annonces AT en français. Tooltips `title` sur chaque lien nav (Accueil, Projets…), tagline footer (`pied-page__tagline-ia`).

**Sections** : lazy-load via `sections-manifest.js` + `sections-registry.js` — détail → [ARCHITECTURE.md § Lazy-loading](ARCHITECTURE.md#2-lazy-loading-par-section).

### Checklist — ajouter une page HTML

1. Créer `ma-page.html` (viewport, `PAGE_META`, `HEAD_COMMON` / `HEAD_DEV_MIN`, landmarks).
2. Enregistrer le fichier dans `build/html-files.mjs` (`HTML_FILES`).
3. Métadonnées SEO : entrée dans `build/page-meta.mjs` puis `npm run sync:page-meta`.
4. Styles : sources dans `build/page-styles.mjs` (`PAGE_STYLE_BY_HTML` + éventuel découpage `styles/pages/…`).
5. Navigation : `js/config/navigation.js` (ordre / libellés) + lien dans `partials/nav.html` → `npm start` (sync nav-squelette).
6. Lazy-load JS : `js/config/sections-manifest.js` + `js/config/sections-registry.js` si la page a un `data-section-id`.
7. E2E : entrée dans `e2e/fixtures/pages.js` (+ smoke / a11y si besoin).
8. Lighthouse : inclus via `HTML_FILES` (`lighthouserc.cjs`) — ajuster le seuil perf si page dense.
9. Valider : `npm test` + `npm run build` + `npm run start:prod`.

**Audits** : choix assumés exclus des points faibles → `AUDIT-EXCLUSIONS.md`.

**Mode dev** : bandeau dismissible bas d’écran (`npm start`) — PWA/offline, CSP et `HEAD_COMMON` (`theme-color`, manifest, méta Apple/OG) uniquement après `npm run build && npm run start:prod`. En `npm start`, le marqueur `<!-- HEAD_COMMON -->` n’est pas remplacé.

**Mobile compact (≤ 480px / 320px)** : `--taille-pixel-min` monte à 13–14px ; nav burger passe en `--police-crt` à ≤320px.

Contraste automatisé : `build/contrast.test.js` (Vitest) sur les paires critiques (nav SCORE, hero accueil, champs formulaire).

### `styles/tokens.css` — restauration

`styles/tokens.css` est la **source éditable** des design tokens (dont `--couleur-boss-*` pour les sprites dojo). En cas de fichier vidé ou corrompu :

```bash
git restore styles/tokens.css
node build/sync-breakpoints.cjs
npm test
```

Ne pas restaurer sans relancer `sync-breakpoints` : le bloc `BREAKPOINTS_SYNC` doit rester aligné avec `build/breakpoints.mjs`. Le test `build/dojo-boss-svg.test.js` vérifie que chaque `var(--couleur-boss-*)` des partials est déclaré dans `tokens.css`.

## Configuration

Copier `.env.example` → `.env.local` pour surcharger :

| Variable                       | Rôle                                  |
| ------------------------------ | ------------------------------------- |
| `PORTFOLIO_SITE_URL`           | URL canonique / Open Graph / manifest |
| `PORTFOLIO_FORMSPREE_ENDPOINT` | Endpoint Formspree                    |
| `PORTFOLIO_RECAPTCHA_SITE_KEY` | Clé site reCAPTCHA v3                 |

Valeurs par défaut : `build/config-defaults.mjs` → synchronisées au build dans `js/config/defaults.js`, `manifest.webmanifest` et métadonnées SEO.

Fichiers générés (non versionnés, recréés par `npm test` / `npm run build`) : `js/config/defaults.js`, `js/config/legal-data.js`, `js/config/projects-data.js`, `js/config/partials.js`, `js/config/musique-themes.json`, `style.css`, `partials/parcours-arbre.html`, `partials/dojo-boss-rush-lot-{a,b,c}.html`, `partials/competences-stats.html`, `partials/accueil-hero.html`, `partials/nav-squelette.html`, `sw.js` — et `manifest.webmanifest` **à la racine** (dev local, URLs relatives via `sync-source`) **ou dans `.dist-staging/`** (build prod). Contenu mentions légales : `js/config/legal.json` (source éditable) → `build/sync-legal.cjs` → `js/config/legal-data.js`. Métadonnées projets : `js/config/projects.json` (source éditable, **à versionner**) → `build/sync-projects.cjs` → `js/config/projects-data.js` ; icônes SVG : `js/config/project-icons.js`. Grilles musicales : `js/config/musique-donnees.json` (source éditable, **à versionner**) → `build/sync-musique-donnees.cjs` → `js/config/musique-themes.json` (chargé à la demande par `musique-sequencuer.js`). Source unique partials : `build/partials-list.mjs`. Fragments assemblés : `partials/parcours-arbre/` → `parcours-arbre.html`, `partials/dojo-boss/` → `dojo-boss-rush.html`, `partials/competences/` → `competences-stats.html`, `partials/accueil/` → `accueil-hero.html`. Partials contact : `partials/contact/*.html` (chargés uniquement sur `contact.html`). Seuils CSS : `build/breakpoints.mjs` → `styles/tokens.css` via `build/sync-breakpoints.cjs`.

Métadonnées SEO par page : `build/page-meta.mjs` → injectées au build dans le dist (`build/html.cjs`). Pour mettre à jour les blocs `PAGE_META` dans les HTML sources : `npm run sync:page-meta` (évite de modifier les sources à chaque build). `npm run check:page-meta` vérifie l’alignement (exécuté avant les tests).

`npm run validate:html` exécute `prevalidate:html` (sync des fichiers générés requis en CI avant les tests).

### Phases `sync-source.cjs` (ordre)

Ne pas réordonner sans vérifier les dépendances — **cartographie complète** (entrées / sorties / `dependDe` / prébuild hors graphe) dans `ARCHITECTURE.md` § Pipeline `sync-source`.

| Phase                                                              | Dépend de   | Artefacts                                                 |
| ------------------------------------------------------------------ | ----------- | --------------------------------------------------------- |
| `defaults`                                                         | —           | `js/config/defaults.js`                                   |
| `style-css`                                                        | `defaults`  | `style.css`                                               |
| `partials`                                                         | `style-css` | `js/config/partials.js`                                   |
| `nav-squelette`                                                    | `partials`  | nav inline + `partials/nav-squelette.html`                |
| `parcours-arbre`, `dojo-boss`, `competences-stats`, `accueil-hero` | `partials`  | partials assemblés                                        |
| `breakpoints`                                                      | `style-css` | `--bp-*` dans `tokens.css`                                |
| `legal`, `projects`, `musique-donnees`                             | —           | sources éditoriales → `*-data.js` / `musique-themes.json` |
| `manifest-dev`                                                     | `legal`     | `manifest.webmanifest` (dev)                              |

Optionnel : `npm run sync:page-meta` après modification de `build/page-meta.mjs`. Prébuild (`sync-fonts`, `sync-pwa-icons`, `icons-optimize`) : hors `getSyncPhases()` — voir `ARCHITECTURE.md`.

Réseaux sociaux (GitHub) : même fichier `config-defaults.mjs`.

Ne jamais committer de secrets (clé secrète reCAPTCHA, tokens privés). Voir [SECURITY.md](SECURITY.md).

## PWA & hors ligne

- `manifest.webmanifest` — généré par `sync-source` à la racine (dev) et au build dans `.dist-staging/` depuis `build/manifest.cjs`
- `sw.js` — généré au build (`build/sw.cjs`) : precache shell + fallback `offline.html`
- Enregistrement SW : `js/modules/service-worker-register.js` (après `data-app-ready`) ; toast « Nouvelle version » si une mise à jour attend `SKIP_WAITING`
- **E2E toast** : `e2e/sw-toast.spec.js` valide la **structure DOM/CSS** accessible du toast (rôle `status`, `aria-live`, zones tactiles, safe-area) via une fixture injectée — pas une simulation complète du cycle `worker.waiting` en prod (couvert par les tests unitaires de `service-worker-register.js`).

### Stratégie offline (precache vs cache runtime)

| Ressource                                                                                                      | Precache install | Cache au 1er visit | Hors ligne sans visite préalable |
| -------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------ | -------------------------------- |
| HTML toutes pages                                                                                              | ✅               | —                  | ✅                               |
| `style-base.css` + tous les `style-page-*.css` (dont `style-page-offline.css`)                                 | ✅               | —                  | ✅                               |
| JS core + modules de page (`main.js`, `navigation.js`, `projets-grille.js`, `dojo-boss.js`, `contact.js`…)     | ✅               | —                  | ✅                               |
| Polices locales (`assets/fonts/*.woff2`)                                                                       | ✅               | —                  | ✅                               |
| Favicon, icônes 192, `offline.html`                                                                            | ✅               | —                  | ✅                               |
| **Musique optionnelle / reCAPTCHA / Formspree** (`musique.js`, séquenceur, voix, thèmes, `recaptcha*`, submit) | ❌               | ✅ fetch SW        | ❌ (réseau-dépendants)           |
| `musique-audio.js` / `musique-bouton.js` (deps shell : bips + loader)                                          | ✅               | —                  | ✅ (sans lecture thèmes)         |
| Previews projet, CV PDF, `icon-512.png`                                                                        | ❌               | optionnel          | ❌                               |

**Comportement attendu :**

1. **Navigation hors ligne** vers une page déjà precachée → HTML + CSS + JS de page disponibles (shell PWA).
2. **Première visite offline** (app installée) → pages et modules precachés OK ; musique, reCAPTCHA et envoi Formspree restent indisponibles sans réseau.
3. **Fallback** : si le HTML de navigation échoue → `offline.html` (stylé via `style-page-offline.css`).

**Recommandation utilisateur** : après installation PWA, une visite en ligne peuplera surtout le cache runtime des assets optionnels (previews, musique).

Liste d’exclusion precache JS : `JS_PRECACH_EXCLUS` dans `build/sw-precache.mjs` (musique optionnelle hors shell, reCAPTCHA/Formspree réseau-dépendants). `musique-audio` / `musique-bouton` restent dans le precache (bips + loader).

### Tester la PWA en local (guide rapide)

Le mode dev (`npm start`) **ne charge pas** le service worker ni la CSP de production. Pour valider offline, toast SW et formulaire comme en prod :

1. `npm ci` (ou `npm install`) — dépendances à jour
2. `npm run build` — génère `.dist-staging/` (HTML minifié, `sw.js`, manifest, assets optimisés)
3. `npm run start:prod` — sert l'artefact build le plus frais (`.dist-staging-build/` ou `.dist-staging/`)
4. Ouvrir `http://localhost:3000` (ou le port affiché) dans Chrome/Edge
5. **Application** → vérifier le service worker actif et le precache
6. Optionnel : une visite en ligne peuplera le cache runtime des assets hors precache (previews, musique)
7. **Réseau** → cocher « Hors ligne » → recharger : navigation et pages precachées doivent rester utilisables
8. Optionnel : installer la PWA (icône dans la barre d’adresse) et rejouer l’étape 7 en mode standalone

Pour les e2e PWA sans rebuild : `PLAYWRIGHT_SKIP_BUILD=1 npm run test:e2e -- e2e/pwa.spec.js` (`.dist-staging/` déjà présent).

## Dépannage

### npm / build

| Problème                          | Solution                                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `UNABLE_TO_VERIFY_LEAF_SIGNATURE` | Proxy / certificat entreprise : `npm config set strict-ssl false` (réseau de confiance) ou certificat racine CA |
| Dépendance manquante au build     | `npm ci` puis relancer `npm run build`                                                                          |
| `dist/` verrouillé sous Windows   | Fermer l’explorateur ou le serveur ; le build utilise `.dist-staging/` en secours                               |

### Playwright (e2e)

| Problème                                       | Solution                                                                                                                                                                                                                     |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigateur absent (`Executable doesn't exist`) | `npm run test:e2e:install` ou `npx playwright install --with-deps chromium webkit`                                                                                                                                           |
| Téléchargement bloqué (certificat SSL)         | Même correctif que npm ci-dessus, puis relancer l’install ; sous PowerShell : `$env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npx playwright install chromium webkit` (temporaire, réseau de confiance uniquement)                   |
| E2e lent / timeout CI                          | CI : Chromium + WebKit + Firefox sur specs **responsive / PWA / sw-toast** ; specs fonctionnelles (a11y, contact, dojo…) sur `desktop-chrome` uniquement. Safari local : `npm run test:e2e:webkit`. Timeout job e2e : 25 min |

### Site / UX

| Problème                                        | Solution                                                                                                                                                                                                                                              |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nav / footer vides                              | Serveur HTTP (`npm start`), pas `file://` ni Live Server                                                                                                                                                                                              |
| Formulaire contact / reCAPTCHA                  | Voir [§ reCAPTCHA & formulaire contact](#recaptcha--formulaire-contact) ci-dessous                                                                                                                                                                    |
| Favicon absente                                 | Hard refresh ; vérifier `assets/favicon.png` après build                                                                                                                                                                                              |
| Page blanche hors ligne                         | Voir [§ PWA & hors ligne](#pwa--hors-ligne) : visiter chaque section une fois en ligne pour le cache runtime ; sinon HTML/CSS seuls                                                                                                                   |
| **Prod sans styles** (HTML brut, blob SVG noir) | GitHub Pages sert probablement la branche `main` au lieu du build. _Settings → Pages → Source_ = **GitHub Actions**. Vérifier que le job `deploy` de la CI a réussi après le push. Tester localement : `npm run build` puis `npx serve .dist-staging` |
| **404** sur `jackavery1.github.io/Portfolio/`   | Le job `deploy` n’a pas tourné : `validate` a échoué (souvent `format:check`). _Actions → CI_ : corriger `validate`, repousser ; le deploy suit en ~1 min si `validate` est vert.                                                                     |

### reCAPTCHA & formulaire contact

#### Comportement normal

- **reCAPTCHA v3 n’affiche pas de widget** : vérification en arrière-plan au moment de l’envoi.
- Le script Google ne se charge qu’au **premier focus** dans le formulaire (nom, email, etc.).
- Après focus, bandeau discret : « Vérification anti-spam (reCAPTCHA v3)… ».
- Si rien n’apparaît et que l’envoi échoue, suivre les étapes ci-dessous.

#### 1. Identifier le message d’erreur

| Message affiché                          | Cause probable                                                   |
| ---------------------------------------- | ---------------------------------------------------------------- |
| « reCAPTCHA non configuré… »             | Clé absente dans la config build                                 |
| « Vérification anti-spam indisponible… » | Script Google bloqué ou domaine non autorisé                     |
| « Envoi refusé (403) »                   | Mismatch clé site / clé secrète / version sur Formspree          |
| « Envoi refusé (400) »                   | Clé secrète incorrecte dans Formspree, ou restriction de domaine |
| « Connexion bloquée… »                   | AdBlock, extension privacy, ou hors ligne                        |

Ouvrir la console (F12 → Console) au moment de l’envoi pour le détail exact.

#### 2. Configurer les 3 briques (obligatoire)

**A. Google reCAPTCHA**

1. [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin) → créer un site **v3**.
2. Domaines autorisés (tous ceux utilisés) :
   - `localhost`
   - `127.0.0.1`
   - `jackavery1.github.io` (prod GitHub Pages)
3. Copier la **clé site** (commence par `6L…`).

**B. Formspree**

1. Dashboard Formspree → formulaire `mlgzkqbz` → _Settings_ → reCAPTCHA.
2. Coller la **clé secrète** reCAPTCHA (pas la clé site).
3. Choisir **reCAPTCHA v3** (le code utilise `RECAPTCHA_VERSION: 3`).
4. _Restrict to Domain_ : laisser vide pour tester en local, puis ajouter le domaine prod.

**C. Fichier `.env.local`** (à la racine du projet)

```env
PORTFOLIO_FORMSPREE_ENDPOINT=https://formspree.io/f/mlgzkqbz
PORTFOLIO_RECAPTCHA_SITE_KEY=ta-cle-site-6L...
```

Puis régénérer la config :

```bash
npm test
# ou
node build/sync-source.cjs
```

Vérifier que `js/config/defaults.js` contient bien la clé site.

#### 3. Tester correctement

- Ne pas ouvrir `contact.html` en `file://` → partials et fetch peuvent échouer.
- Lancer un serveur HTTP : `npm start`
- Aller sur `http://localhost:3000/contact.html` (ou le port affiché par `serve`).
- Désactiver AdBlock sur la page (cause fréquente sur mobile).
- Cliquer dans un champ du formulaire **avant** d’envoyer.
- Hard refresh : Ctrl+F5.
- **Prod** : tester sur `.dist-staging/` après build (`npm run build` puis `npm run start:prod`), car la CSP (qui autorise `google.com` / `gstatic.com`) n’est injectée qu’au build.

#### 4. Checklist rapide

- [ ] Clé site dans `.env.local` + `npm test` relancé
- [ ] Clé secrète dans Formspree (v3)
- [ ] Domaines `localhost`, `127.0.0.1` et domaine prod dans Google reCAPTCHA
- [ ] Test via `npm start`, pas `file://`
- [ ] Pas d’AdBlock / Brave Shields / Firefox Enhanced Tracking
- [ ] Même version v3 partout (Google, Formspree, code)

#### Si ça bloque encore

Indiquer :

1. Le message rouge sous le formulaire (ou dans la zone reCAPTCHA)
2. Si le test est en local ou sur GitHub Pages
3. Une copie des erreurs console (`recaptcha`, `403`, `Failed to fetch`…)

Cela permet de cibler la cause (config Google, Formspree, ou blocage navigateur) plutôt que de tout refaire.

## Breakpoints CSS

| Seuil              | Usage                                                   |
| ------------------ | ------------------------------------------------------- |
| `max-width: 960px` | Mobile / tablette (nav burger, layout, footer, pages)   |
| `min-width: 961px` | Desktop (nav horizontale, grilles 2 cols parcours)      |
| **960 / 961 px**   | Seuil nav : burger ≤960 px, liens horizontaux ≥961 px   |
| `min-width: 700px` | Grille projets 2 colonnes (tablette large)              |
| `600px – 960px`    | Accueil tablette, stats latérales compétences           |
| `max-width: 480px` | Footer une colonne, nav compacte (score masqué)         |
| `max-width: 320px` | Contact / dojo très petits écrans (bandeau, boss cards) |

Référence technique : `build/breakpoints.mjs`, `styles/tokens.css`. Listes CSS synchronisées via `build/page-styles.mjs` → `style.css`.

## Échelle typographique

Tokens dans `styles/tokens.css` (l.107–125) :

| Token                    | Usage                                | Échelle                                 |
| ------------------------ | ------------------------------------ | --------------------------------------- |
| `--police-pixel`         | Nav, titres arcade, badges           | Press Start 2P                          |
| `--police-crt`           | Texte rétro lisible (parcours, dojo) | VT323                                   |
| `--police-lisible`       | Corps, formulaires, intros           | Rajdhani                                |
| `--taille-pixel-min`     | Plancher libellés pixel interactifs  | 0,75rem (12px), monte à 0,875rem @320px |
| `--taille-petit-pixel`   | Petits libellés pixel                | `clamp(min, 1.2vw, 0.8rem)`             |
| `--taille-titre-pixel`   | Titres section pixel                 | `clamp(min, 1.8vw, 0.8rem)`             |
| `--taille-corps-lisible` | Paragraphes                          | `clamp(0.95rem, 2.1vw, 1.1rem)`         |
| `--taille-corps-crt`     | Texte CRT secondaire                 | `clamp(0.85rem, 1.85vw, 1.02rem)`       |
| `--interligne-corps`     | Corps / intros                       | 1,7                                     |
| `--interligne-pixel`     | Titres pixel                         | 1,6                                     |
| `--tracking-pixel`       | Titres / libellés pixel              | 0,12em                                  |

Règle : ne pas fixer de `font-size` en dur pour le pixel art — passer par les tokens ou `clamp()` documentés. Densité Press Start sur mobile = choix assumé (`AUDIT-EXCLUSIONS.md`).

Pages hors navigation clavier (`dojo.html`, `mentions-legales.html`) : accessibles via liens footer ou projets.

## Tests

- **Unitaires** : `npm test` (Vitest) — utils, config, modules, build. Trois projects : `js-dom` (jsdom), `js-node`, `build` (`vitest.config.js`). Tout nouveau test **sans DOM** doit être ajouté à la liste `JS_NODE_TESTS` dans `vitest.config.js`, sinon il tourne sous jsdom.
- **Couverture** : `npm run test:coverage` (seuils Vitest globaux dans `vitest.config.js` : **85 %** lignes / statements, **90 %** fonctions, **84 %** branches sur `js/` + `build/**/*.{cjs,mjs}` ; exclus : générés, `config-defaults.mjs`, `fonts-data.mjs` — voir `coverage.exclude`)

### Profiling Lighthouse (perf mobile)

Seuils CI : `lighthouserc.cjs` (mobile, 412×823, médiane 5 runs). Perf **≥ 0,90** (accueil) ; **≥ 0,85** (projets, contact, pages denses, mentions, offline). Desktop smoke (`lighthouserc.desktop.cjs`, 961×800) : index et projets ≥ 0,85 — retry CI ×3 comme le mobile.

Profil local après build :

```bash
npm run build
npm run start:prod
# ou : node build/run-serve-staging.cjs 9876
npx lighthouse http://127.0.0.1:3000/competences.html --only-categories=performance --form-factor=mobile
```

`start:prod` et Playwright servent `.dist-staging-build/` en priorité s'il existe (build frais non promu), sinon `.dist-staging/` — voir `build/resolve-serve-dir.cjs`.

Leviers perf appliqués : CSS split base/page (`form.css` uniquement sur contact), preload polices critiques (Press Start 2P, VT323), animation section sans fade opacity (LCP), overlay CRT différé (`html.crt-pret`, `requestIdleCallback` sur pages denses), init musique / konami / section / animations barres en idle sur pages denses, JSON-LD compact en fin de `<body>`, `content-visibility` sur sections compétences (évité sur parcours/dojo à cause du CLS).

- **HTML** : `npm run validate:html` (sources) et `npm run validate:html:dist` (après build)

### Playwright — navigateurs locaux

| Besoin                                  | Commande                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| Base locale (Chromium)                  | `npm run test:e2e:install`                                                           |
| Safari / iPhone 13 (WebKit)             | `npm run test:e2e:webkit` _(installe puis lance `responsive-webkit`)_                |
| Install WebKit seul                     | `npx playwright install --with-deps webkit`                                          |
| Parité CI (Chromium + WebKit + Firefox) | `npx playwright install --with-deps chromium webkit firefox` puis `npm run test:e2e` |

`test:e2e:install` n’installe **pas** WebKit. Sous Windows / proxy SSL : voir § Dépannage → Playwright.

- **E2E** : `npm run test:e2e` — projets `responsive-mobile-portrait`, `responsive-mobile-landscape`, `responsive-tablet`, `responsive-webkit`, `responsive-firefox`, `responsive-desktop-chrome`, `desktop-chrome`. Specs responsive / PWA / toast SW : multi-navigateurs. Specs fonctionnelles (`a11y`, `contact`, `dojo`, `navigation`, `smoke-pages`…) : **Chromium desktop uniquement**. Fixtures : `e2e/fixtures/pages.js`, helpers : `e2e/helpers.js`.
- **Lighthouse** : `npm run test:lhci` (profil mobile 412×823, 5 runs médiane ; seuils perf par page via `assertMatrix` dans `lighthouserc.cjs`). Complément desktop : `npm run test:lhci:desktop` (961×800, smoke `index` + `projets`, CI après le run mobile).
- **Mesure bundle** : `npm run build && npm run measure` — tailles de l’artefact le plus frais (`.dist-staging-build/` ou `.dist-staging/` ; JSON stdout : `distKo`, `appJsGzipKo`, `iconsKo`, `jsAssets[]`). Écrit aussi `scripts/bundle-baseline.json` (**gitignoré**, snapshot local). **CI** : `npm run measure:check` après le build, contre `scripts/bundle-ceilings.json`. Modèle local : `scripts/bundle-baseline.example.json`. Icônes PNG : `npm run icons:optimize` en `prebuild` (idempotent). Au build, seul `musique-themes.json` est copié dans dist (sources `legal.json` / `projects.json` / `musique-donnees.json` restent hors artefact).

### Avant release (PWA / prod)

1. `npm test` et `npm run test:e2e`
2. `npm run build && npm run start:prod` — vérifier offline, formulaire, partials inlinés
3. Push sur `main` uniquement si la CI est verte (deploy Pages automatique)

## Accessibilité

Cible **WCAG 2.1 AA** sur thème sombre arcade (dark-only, voir § Design).

### Contrastes (tokens `styles/tokens.css`)

| Combinaison                             | Ratio  | Niveau  |
| --------------------------------------- | ------ | ------- |
| Texte fort `#d0ddff` / fond `#03040f`   | ~15:1  | AAA     |
| Texte normal `#8899cc` / fond           | ~7:1   | AA      |
| Texte discret `#8a9ee8` / fond          | ~8:1   | AA      |
| Placeholder `#7a8fc4` / champ `#0a0e25` | ~4,5:1 | AA      |
| Accent `#4a6fff` / fond                 | ~5:1   | AA (UI) |

Vérification automatisée : `build/contrast.test.js` (exécuté avec `npm test`).

### Clavier et focus

- **Tab / Shift+Tab** : ordre DOM logique ; skip link `.lien-evitement`
- **Escape** : ferme modales et menu burger
- **Flèches gauche/droite** : navigation entre pages (`js/modules/navigation.js`)
- **`:focus-visible`** global (`styles/reset.css`) — ne pas supprimer les outlines

### Tests a11y

| Type                  | Fichier / outil                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------- |
| Violations WCAG       | `e2e/a11y.spec.js` (axe-core, CI desktop-chrome)                                             |
| Clavier               | `e2e/a11y.spec.js`, `e2e/desktop-navigation.spec.js`                                         |
| Focus utilitaires     | `js/utils/focus.test.js`                                                                     |
| Modales (Tab, Escape) | `js/modules/modal.test.js`                                                                   |
| Zoom 200 %            | `e2e/responsive-viewports.spec.js`                                                           |
| Réduction mouvement   | `e2e/responsive-motion.spec.js`, `styles/layout/responsive.css` (`prefers-reduced-motion`)   |
| Contraste renforcé    | `e2e/responsive-contrast.spec.js`, `styles/layout/responsive.css` (`prefers-contrast: more`) |
| Touch ≥ 44 px         | `e2e/responsive-touch.spec.js`                                                               |
| Safe-area / encoches  | `e2e/responsive-safe-area.spec.js`, tokens `--safe-area-inset-*`                             |
| Skeleton first-paint  | `styles/components/partial-squelette.css`, `aria-busy` sur compétences/parcours              |

### Avant merge (checklist)

```bash
npm run lint
npm test
npm run test:e2e -- e2e/a11y.spec.js
```

- Nouveau composant interactif → `:focus-visible`, libellé ou `aria-label` en français
- Changement couleur → relancer `npm test` (contrast tokens)
- Animation → vérifier avec `prefers-reduced-motion: reduce`

Ressources : [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/), [ARIA APG](https://www.w3.org/WAI/ARIA/apg/).

## Style de code

- ESLint + Prettier (config racine)
- **Libellés visibles** : shell arcade en anglais (nav, titres) ; contenu métier en français
- **Accessibilité** : `aria-label`, `aria-describedby` et annonces AT en français (`lang="fr"`) ; le texte visible peut rester en anglais arcade
- CSS : tokens dans `styles/tokens.css`, composants vs pages ; accueil en modules `styles/pages/accueil/` ; boutons pixel (`bouton-pixel.css`) — états `:disabled` via `--couleur-texte-disabled`
- JS : modules ES, config centralisée dans `js/config/` ; bonus score via `CONFIGURATION.BONUS_SCORE` ; identifiants exportés en **français** (`parId`, `initialiser*`, `echapperHtml`…)
