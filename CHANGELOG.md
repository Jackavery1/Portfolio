# Changelog

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

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
