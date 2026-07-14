import { potDeMielEstRempli, peutSoumettre } from './contact-form-helpers.js';

/** Paramètres du bip d’erreur validation formulaire contact */
export const PARAMETRES_BIP_ERREUR_VALIDATION = [150, 120, 'sawtooth'];

export function afficherErreurZone(zone, texte) {
  if (!zone) return;
  if (texte) {
    zone.hidden = false;
    zone.textContent = texte;
  } else {
    zone.hidden = true;
    zone.textContent = '';
  }
}

function effacerEtatInvalideChamp(el) {
  if (!el) return;
  el.removeAttribute('aria-invalid');
  const erreurId = el.getAttribute('aria-errormessage');
  if (!erreurId) return;
  const zone = document.getElementById(erreurId);
  if (zone) {
    zone.hidden = true;
    zone.textContent = '';
  }
}

export function effacerEtatsInvalides(elements) {
  elements.forEach(effacerEtatInvalideChamp);
}

export function marquerChampsInvalides(erreurs, jouerBip) {
  jouerBip(...PARAMETRES_BIP_ERREUR_VALIDATION);
  erreurs.forEach(({ el, message }) => {
    if (!el) return;
    el.setAttribute('aria-invalid', 'true');
    const erreurId = el.getAttribute('aria-errormessage');
    if (erreurId) {
      const zone = document.getElementById(erreurId);
      if (zone) {
        zone.textContent = message;
        zone.hidden = false;
      }
    }
  });
}

export function peutSoumettreAvecSession(storageKey, rateLimitMs) {
  try {
    const last = sessionStorage.getItem(storageKey);
    return peutSoumettre({ dernierEnvoi: last, rateLimitMs });
  } catch {
    return true;
  }
}

export function enregistrerSoumissionSession(storageKey) {
  try {
    sessionStorage.setItem(storageKey, String(Date.now()));
  } catch {
    /* quota privé */
  }
}

export function potDeMielRempli(formulaire, honeypotEl, honeypotName) {
  const hp = honeypotEl || formulaire.querySelector(`[name="${honeypotName}"]`);
  return potDeMielEstRempli(hp?.value);
}
