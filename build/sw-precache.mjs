/**
 * Optionnels ou réseau-dépendants — hors precache SW.
 * `musique-audio` / `musique-bouton` restent precachés (deps de `audio.js` + `musique-loader.js`).
 */
export const JS_PRECACH_EXCLUS = new Set([
  'js/config/musique-themes.json',
  'js/modules/musique.js',
  'js/modules/musique-voix.js',
  'js/modules/musique-sequencuer.js',
  'js/modules/musique-sequencuer-plan.js',
  'js/modules/musique-sequencuer-store.js',
  'js/modules/contact-form-submit.js',
  'js/modules/contact-form-recaptcha.js',
  'js/modules/recaptcha.js',
  'js/modules/recaptcha-chargement.js',
]);
