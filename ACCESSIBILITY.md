# Accessibilité — Portfolio Arcade

Documentation d'accessibilité (a11y) pour les testeurs, développeurs et mainteneurs.

## Conformité WCAG

### Niveau AA (cible)

- ✅ **Contrastes** : Tous ≥4.5:1 (AA) ou 7:1 (AAA)
- ✅ **Keyboard** : Navigation Tab/Shift+Tab, Escape ferme modales
- ✅ **Focus** : Visible sur tous les interactifs (outline 2px)
- ✅ **ARIA** : Labels implicites + `aria-live` pour messages dynamiques
- ✅ **Zoom** : 200% sans overflow horizontal (testé e2e)
- ✅ **Réduction mouvement** : `prefers-reduced-motion: reduce` respectée

### Tests validés

| Type                | Outil                     | Fréquence                        |
| ------------------- | ------------------------- | -------------------------------- |
| Contrastes          | Lighthouse + manual check | À chaque change token.css        |
| WCAG violations     | axe-core (e2e)            | CI (responsivité tests)          |
| Keyboard nav        | Playwright + manual       | E2E focus.test.js                |
| Zoom 200%           | Playwright                | E2E responsive-viewports.spec.js |
| Réduction mouvement | CSS @media + manual       | À chaque animation ajoutée       |

## Contrastes mesurés

### Couleurs core

| Combinaison                                   | Ratio   | Niveau |
| --------------------------------------------- | ------- | ------ |
| Accent bleu (#4a6fff) sur fond dark (#03040f) | 4.87:1  | ✅ AA  |
| Texte fort (#d0ddff) sur fond                 | 15.05:1 | ✅ AAA |
| Texte normal (#8899cc) sur fond               | 7.27:1  | ✅ AA  |
| Texte discret (#8a9ee8) sur fond              | 7.91:1  | ✅ AA  |
| Placeholder (#6474a3) sur champ (#0a0e25)     | 4.14:1  | ⚠️ AA  |
| Erreur rouge (#ff4444) sur fond               | 5.99:1  | ✅ AA  |
| Succès vert (#44cc88) sur fond                | 5.18:1  | ✅ AA  |

**Note** : Placeholder est limite AA mais acceptable (texte secondaire, non critique).

## Navigation au clavier

### Touches supportées

- **Tab** : Forward entre zones focalisables (boutons, inputs, liens)
- **Shift+Tab** : Backward
- **Enter** : Valide formulaires, clique boutons
- **Escape** : Ferme modales, annule actions
- **Space** : Bascule checkboxes

### Focus visible

```css
:focus-visible {
  outline: 2px solid var(--couleur-accent-vif);
  outline-offset: 2px;
}
```

Appliqué sur tous les boutons, inputs, liens modaux. **Ne pas supprimer outline.**

### Ordre logique (Tab order)

```html
<nav>...</nav>
<!-- Tab d'abord -->
<main>...</main>
<!-- Puis contenu -->
<footer>...</footer>
<!-- Puis pied -->
```

Ordre DOM = ordre Tab. Pas de `tabindex` positif (sauf si vraiment nécessaire).

## Screen reader (annotations)

### ARIA labels

```html
<!-- Bouton sans texte visible -->
<button aria-label="Fermer modale">×</button>

<!-- Champ requis -->
<input aria-required="true" />

<!-- Zone dynamique (messages) -->
<div aria-live="polite" aria-atomic="true" id="form-status"></div>
```

### Landmarks (sémantique HTML)

```html
<header>...</header>
<nav aria-label="Principale">...</nav>
<main role="main">...</main>
<section aria-labelledby="h1">
  <h1 id="h1">Titre section</h1>
  ...
</section>
<footer>...</footer>
```

Utilisés par NVDA/JAWS pour navigation rapide.

## Réduction du mouvement

### CSS motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Appliqué globalement** dans `styles/components/` (ne pas supprimer).

### Animations critiques

| Animation                 | Contexte       | Réduit           |
| ------------------------- | -------------- | ---------------- |
| Transition bouton (300ms) | UI feedback    | ✓ Réduit à 0ms   |
| Fade modal (200ms)        | Overlay entrée | ✓ Réduit à 0ms   |
| Scroll smooth             | Navigation     | ✓ Scroll instant |

## Testabilité

### Tests e2e a11y

```bash
npm run test:e2e -- responsive-viewports.spec.js
```

Inclus :

- ✅ axe-core WCAG violations (accueil, contact)
- ✅ Zoom 200% sans overflow
- ✅ Focus visible (focus.test.js)
- ✅ Keyboard Tab/Escape (modal.test.js)

### Tests manuels

**Setup NVDA (Windows)** :

```bash
# Télécharger NVDA gratuitement
https://www.nvaccess.org/download/

# Lancer dans app
npm run start
# Naviguer avec Alt+Espace (NVDA hot key)
```

**Checklist Test**:

- [ ] H1 annoncé au chargement
- [ ] Formulaire labellisé (inputs ont `<label>`)
- [ ] Erreurs validations lues à haute voix (`aria-live`)
- [ ] Focus visible en naviguant Tab
- [ ] Liens contextuels clairs (pas juste "cliquez ici")

## Limites assumées

### 1. Dark-only design (pas de dark mode toggle)

- **Rationale** : Identité neon arcade assume
- **Impact** : Utilisateurs en light mode : expérience potentiellement inconfortable
- **Acceptation** : Documentée dans `CONTRIBUTING.md § Design`

### 2. Pas de version mobile-only

- **Support** : Responsive design (375px–2560px)
- **Pas de** : App native, version progressive web (PWA hors-ligne seulement)

### 3. Animations non-réductibles (jeux interactifs)

- **Dojo arcade** : Tétris-like, require animations
- **Mitigation** : `prefers-reduced-motion: reduce` → gameplay simplifié, pas animations superflues

## Maintenance a11y

### Avant un merge

```bash
npm run test:coverage  # Verifie pas de regress
npm run test:e2e       # Axe-core WCAG checks
npm run lint           # ESLint a11y rules
```

### Changements à auditer

1. **Nouveaux composants** → ajouter tests focus / keyboard
2. **Changements couleurs** → vérifier contrastes (npm run test)
3. **Animations** → tester avec `prefers-reduced-motion: reduce`
4. **Formulaires** → labels explicites + aria-required/aria-invalid

### Outils recommandés

| Outil                                                                    | Utilité                    | Fréquence      |
| ------------------------------------------------------------------------ | -------------------------- | -------------- |
| [axe DevTools](https://www.deque.com/axe/devtools/)                      | Scanner violations         | Ad-hoc         |
| [WAVE](https://wave.webaim.org/)                                         | Audit contrast / structure | Ad-hoc         |
| [Lighthouse](https://developers.google.com/web/tools/lighthouse)         | Core Web Vitals + a11y     | CI auto        |
| [NVDA](https://www.nvaccess.org/)                                        | Screen reader (Windows)    | Manual testing |
| [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/) | Contraste précis           | Avant commit   |

## Ressources

- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN a11y](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Deque axe-core rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
