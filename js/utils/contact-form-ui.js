import { honeypotEstRempli, peutSoumettre } from './contact-form-helpers.js';

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

export function marquerChampsInvalides(elements, jouerBip) {
  jouerBip(150, 120, 'sawtooth');
  elements.forEach((el) => {
    if (el) {
      el.style.borderColor = 'var(--couleur-erreur)';
      setTimeout(() => {
        el.style.borderColor = '';
      }, 1500);
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

export function honeypotRempli(formulaire, honeypotEl, honeypotName) {
  const hp = honeypotEl || formulaire.querySelector(`[name="${honeypotName}"]`);
  return honeypotEstRempli(hp?.value);
}
