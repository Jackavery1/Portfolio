import { retirerScriptsRecaptcha } from '../modules/recaptcha-chargement.js';

export async function chargerModuleRecaptcha() {
  return import('../modules/recaptcha.js');
}

export function preparerDomRecaptcha() {
  document.body.innerHTML = '<div id="js-recaptcha-mount" hidden></div>';
  document.head.innerHTML = '';
  delete window.grecaptcha;
  delete window.__E2E_RECAPTCHA_TOKEN;
  retirerScriptsRecaptcha();
}

export function declencherOnloadScriptV2() {
  document.querySelector('script[data-recaptcha-v2]')?.onload?.();
}

export function declencherOnloadScriptV3() {
  document.querySelector('script[data-recaptcha-v3]')?.onload?.();
}

export function declencherErreurScriptV3() {
  document.querySelector('script[data-recaptcha-v3]')?.onerror?.();
}
