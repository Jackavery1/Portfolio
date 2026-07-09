# Changelog

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [1.0.5] — 2026-07-09

### Ajouté

- Découpage musique : `musique-audio.js`, `musique-sequencuer.js`, `musique-loader.js`, `musique-bouton.js` ; données dans `musique-donnees.json` versionné.
- Découpage contact : `contact-form-recaptcha.js`, `contact-form-validation.js`.
- `score-stockage.js` — cycle score-session ↔ popup-highscore rompu.
- Toast mise à jour PWA (`service-worker-register.js`, `sw-toast.css`) avec `aria-live`.
- Skeletons `partial-squelette` (compétences, parcours) avec `aria-busy`.
- Tests : musique, partials, dojo-boss, projets-grille, service-worker-register, `contact-form-validation`, `contact-form-recaptcha`, `score-stockage`, barrel `score.js`.
- E2E : PWA (WebKit, Firefox, mobile paysage, tablette), `sw-toast`, `responsive-a11y`, `responsive-keyboard` ; extension touch/safe-area/motion.
- Mention « Thème sombre arcade » dans le footer ; CRT masqué sous `prefers-reduced-motion`.
- OG meta sur `offline.html` ; focus `:focus-visible` sur `.nav__logo`.
- Lighthouse CI sur `.dist-staging` + `offline.html` ; seuil best-practices 0,9.

### Corrigé

- Couverture branches globale ≥ 84 % (seuil CI) ; contrastes tokens étendus.
- Duplication état bouton musique entre `musique-loader.js` et `musique.js`.
- Placeholder formulaire AA (`#7a8fc4`) ; bandeau WIP sémantique (jaune actif).
- Typo pixel décorative ≥ 12 px (`--taille-pixel-decoratif-min`).
- Precache SW : tous les `style-page-*.css` ; stratégie offline documentée dans `CONTRIBUTING.md`.
- `ACCESSIBILITY.md` fusionné dans `CONTRIBUTING.md` § Accessibilité.
- Hero squelette first-paint ; `color-scheme: dark` dans le head commun.

## [1.0.2] — 2026-06-01

### Ajouté

- Lien démo Render pour le projet LSF dans la modale.
- Tests Axe e2e : accueil, compétences, dojo, parcours, mentions, menu burger, modale.
- `CONTRIBUTING.md`, script `npm run test:coverage`, gate couverture en CI.
- Fallback UI si échec chargement partials (nav, footer).
- Fanfare arcade unifiée (`jouerFanfareVictoire` dans `audio.js`).
- Tests unitaires : partials, focus, favicon, liens modale (`liensProjetValides`).

### Corrigé

- Scroll accueil tablette (901–960 px) : desktop sans scroll dès 961 px.
- Email mentions légales hydraté sur toutes les pages.
- Focus clavier visible sur les cartes projets.
- Validation des liens http(s) dans la modale ; rejet `javascript:`.
- `sessionStorage` protégé (score, meta, popup high score).
- Intervalles Dojo nettoyés au `pagehide` ; popup high score `aria-labelledby`.
- Bandeau contact : couleurs via tokens ; typo accueil « les finitions ».
- Responsive : breakpoints harmonisés 960/961 px ; layout mobile accueil et compétences.
- README simplifié ; référence breakpoints dans `CONTRIBUTING.md` ; `coverage/` ignoré par Git.

## [1.0.1] — 2026-05-27

### Ajouté

- Tests unitaires sur score, modale et navigation.
- Constante partagée pour la favicon (`js/config/favicon.js`).
- Checklist qualité et gate Lighthouse avant déploiement.

### Corrigé

- Favicon visible en prod et en localhost (cache-bust + fallback dev).
- Stabilisation E2E (mocks reCAPTCHA/Formspree, exécution séquentielle).
- Contraste a11y sur le bandeau contact et les tags modale.

### Technique

- Build modulaire (`.dist-staging/`), `sharp`, config synchronisée au prebuild.
- CI : Conventional Commits, audit high bloquant, deploy conditionné à validate + e2e + lighthouse.

## [1.0.0] — 2026-05

Version initiale du portfolio arcade (7 pages, score, modales, formulaire contact).
