/* ============================================
   Affichage email / téléphone (hors HTML statique)
   ============================================ */

import { CONFIG } from '../config/index.js';
import { byId } from '../utils/dom.js';
import { decodeBase64Utf8, formatTelephoneFr } from '../utils/pii.js';

export function initContactCoordonnees() {
  const email = decodeBase64Utf8(CONFIG.CONTACT.EMAIL_B64);
  if (!email) return;

  const emailEl = byId(CONFIG.SELECTORS.CONTACT_EMAIL_DISPLAY);
  if (emailEl) {
    const lien = document.createElement('a');
    lien.href = `mailto:${email}`;
    lien.className = 'carte-contact__lien';
    const [local, domaine] = email.split('@');
    if (domaine) {
      lien.append(document.createTextNode(local));
      lien.append(document.createElement('wbr'));
      lien.append(document.createTextNode(`@${domaine}`));
    } else {
      lien.textContent = email;
    }
    emailEl.replaceChildren(lien);
  }

  const phoneEl = byId(CONFIG.SELECTORS.CONTACT_PHONE_DISPLAY);
  if (phoneEl && CONFIG.CONTACT.PHONE_PARTS) {
    const { affichage, tel } = formatTelephoneFr(CONFIG.CONTACT.PHONE_PARTS);
    if (affichage) {
      const lien = document.createElement('a');
      lien.href = `tel:${tel}`;
      lien.className = 'carte-contact__lien';
      lien.textContent = affichage;
      phoneEl.replaceChildren(lien);
    }
  }

  const mentionsLien = byId(CONFIG.SELECTORS.MENTIONS_EMAIL_LINK);
  if (mentionsLien) {
    mentionsLien.href = `mailto:${email}`;
    mentionsLien.textContent = email;
    mentionsLien.removeAttribute('hidden');
  }
}
