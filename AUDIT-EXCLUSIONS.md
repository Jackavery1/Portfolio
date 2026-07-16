# Exclusions d'audit — Portfolio Arcade

Ce fichier liste les **choix de design assumés** pour ce dépôt. Lors d'un audit architecture (`/architecture`), UI/UX (`/ui-ux`) ou responsivité (`/responsivite`), **ne pas** les mentionner comme points faibles, dette résiduelle ou recommandations.

## Identité & immersion

| Choix                                                 | Justification                                                                |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| Shell navigation EN (HOME, WORK, STATS…) + contenu FR | Immersion arcade rétro volontaire ; tooltips et aria-label en français       |
| Typo Press Start 2P dense sur petits écrans           | Esthétique pixel / CRT ; tokens `--taille-pixel-min` atténuent la lisibilité |
| Thème dark-only (pas de light mode)                   | Cohérence CRT / néon ; pas de variante claire prévue                         |
| Pas de maquettes Figma                                | Projet solo ; design itératif directement en HTML/CSS                        |

## UX mobile & web

| Choix                                                   | Justification                                                            |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| Hint paysage non bloquant (compétences, parcours, dojo) | Portfolio web, pas jeu fullscreen ; l'utilisateur peut rester en paysage |
| Letterbox canvas fixe                                   | N/A — site multi-pages, pas de canvas letterbox                          |
| Test iPhone physique non automatisé                     | E2E Playwright simule insets et WebKit (`iPhone 13`)                     |

## Architecture & technique

| Choix                                             | Justification                                                                                |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Instance unique Web Audio (`audio-context-store`) | Contrainte API navigateur ; état isolé et réinitialisable en tests                           |
| Musique / reCAPTCHA / Formspree hors precache SW  | Fonctions réseau-dépendantes ou optionnelles ; precache limité aux routes offline            |
| Données volumineuses (`musique-themes.json`) lazy | Taille install PWA ; chargement à la demande                                                 |
| Dualité ESM runtime / CJS build (+ pont)          | Navigateur ESM ; Node I/O synchrone CJS ; `cjs-bridge.mjs` — pas de migration massive prévue |
| Breakpoints `--bp-*` hors `@media`                | Limitation CSS : custom properties interdites dans `@media` ; seuils dans `breakpoints.mjs`  |

## Mise à jour

Ajouter ici tout nouveau choix **volontaire** et **non négociable** avant de le considérer comme dette dans un audit.
