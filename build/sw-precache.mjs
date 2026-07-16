/** Optionnels ou réseau-dépendants — hors precache SW pour navigation offline. */
export const JS_PRECACH_EXCLUS = new Set([
  'js/config/musique-themes.json',
  'js/modules/musique.js',
  'js/modules/musique-audio.js',
  'js/modules/musique-sequencuer.js',
  'js/modules/musique-bouton.js',
  'js/modules/contact-form-submit.js',
  'js/modules/recaptcha.js',
  'js/modules/recaptcha-chargement.js',
]);
