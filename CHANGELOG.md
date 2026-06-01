# Changelog

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

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
