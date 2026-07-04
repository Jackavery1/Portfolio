/**
 * reCAPTCHA Formspree — initialisation widget et obtention du jeton.
 */

import { byId } from '../utils/dom.js';
import {
  chargerScriptV2,
  chargerScriptV3,
  retirerScriptsRecaptcha,
} from './recaptcha-chargement.js';

let idWidget = null;

function viderEtatRecaptcha() {
  retirerScriptsRecaptcha();
  idWidget = null;
}

export async function initialiserRecaptcha({ siteKey, version, mountId }) {
  if (typeof window !== 'undefined' && window.__E2E_RECAPTCHA_TOKEN) {
    return true;
  }

  const key = siteKey?.trim();
  if (!key) return false;

  const mount = mountId ? byId(mountId) : null;
  if (version === 3) {
    if (mount) {
      mount.hidden = false;
      mount.className = 'recaptcha-zone recaptcha-zone--v3';
      mount.setAttribute('role', 'status');
      mount.textContent =
        'Vérification anti-spam (reCAPTCHA v3). Domaines Google : 127.0.0.1 et localhost.';
    }
    await chargerScriptV3(key);
    return true;
  }

  if (!mount) return false;
  mount.hidden = false;
  const g = await chargerScriptV2(key);
  if (idWidget != null && mount.children.length > 0) {
    g.reset(idWidget);
    return true;
  }
  idWidget = null;
  idWidget = g.render(mount, { sitekey: key });
  return true;
}

export async function obtenirTokenRecaptcha({ siteKey, version, action = 'submit' }) {
  const key = siteKey?.trim();
  if (!key) return null;
  if (window.__E2E_RECAPTCHA_TOKEN) return window.__E2E_RECAPTCHA_TOKEN;

  if (version === 3) {
    const g = await chargerScriptV3(key);
    try {
      return await g.execute(key, { action });
    } catch (err) {
      const detail = err?.message || '';
      if (/invalid site key|not loaded in api/i.test(detail)) {
        viderEtatRecaptcha();
        throw new Error(
          `${detail} — Rechargez la page (Ctrl+F5) après avoir changé PORTFOLIO_RECAPTCHA_SITE_KEY dans .env.local, et vérifiez 127.0.0.1 + localhost dans Google reCAPTCHA.`
        );
      }
      throw new Error(
        detail ? `Jeton reCAPTCHA : ${detail}` : 'Impossible de générer le jeton reCAPTCHA'
      );
    }
  }

  const g = await chargerScriptV2(key);
  if (idWidget == null) return null;
  return g.getResponse(idWidget) || null;
}

export function reinitialiserWidgetRecaptcha() {
  if (idWidget != null && window.grecaptcha) {
    window.grecaptcha.reset(idWidget);
  }
}
