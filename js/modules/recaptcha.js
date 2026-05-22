/* ============================================
   reCAPTCHA (Formspree : champ g-recaptcha-response)
   ============================================ */

import { byId } from '../utils/dom.js';

let scriptPromise = null;
let widgetId = null;

function chargerScriptV3(siteKey) {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existant = document.querySelector('script[data-recaptcha-v3]');
    if (existant) {
      window.grecaptcha?.ready(() => resolve(window.grecaptcha));
      return;
    }
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    s.async = true;
    s.dataset.recaptchaV3 = '1';
    s.onload = () => {
      if (!window.grecaptcha) {
        reject(new Error('reCAPTCHA indisponible'));
        return;
      }
      window.grecaptcha.ready(() => resolve(window.grecaptcha));
    };
    s.onerror = () => reject(new Error('Chargement reCAPTCHA impossible'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

function chargerScriptV2() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existant = document.querySelector('script[data-recaptcha-v2]');
    if (existant) {
      window.grecaptcha?.ready(() => resolve(window.grecaptcha));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js';
    s.async = true;
    s.defer = true;
    s.dataset.recaptchaV2 = '1';
    s.onload = () => {
      if (!window.grecaptcha) {
        reject(new Error('reCAPTCHA indisponible'));
        return;
      }
      window.grecaptcha.ready(() => resolve(window.grecaptcha));
    };
    s.onerror = () => reject(new Error('Chargement reCAPTCHA impossible'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export async function initRecaptcha({ siteKey, version, mountId }) {
  const key = siteKey?.trim();
  if (!key) return false;

  const mount = mountId ? byId(mountId) : null;
  if (version === 3) {
    if (mount) {
      mount.hidden = false;
      mount.className = 'recaptcha-zone recaptcha-zone--v3';
      mount.setAttribute('role', 'status');
      mount.textContent =
        'Vérification anti-spam active (reCAPTCHA v3) — aucune action requise avant envoi.';
    }
    await chargerScriptV3(key);
    return true;
  }

  if (!mount) return false;
  mount.hidden = false;
  const g = await chargerScriptV2();
  if (widgetId != null) {
    g.reset(widgetId);
    return true;
  }
  widgetId = g.render(mount, { sitekey: key });
  return true;
}

export async function obtenirTokenRecaptcha({ siteKey, version, action = 'submit' }) {
  const key = siteKey?.trim();
  if (!key) return null;

  if (version === 3) {
    const g = await chargerScriptV3(key);
    return g.execute(key, { action });
  }

  const g = await chargerScriptV2();
  if (widgetId == null) return null;
  const token = g.getResponse(widgetId);
  return token || null;
}

export function resetRecaptcha() {
  if (widgetId != null && window.grecaptcha) {
    window.grecaptcha.reset(widgetId);
  }
}
