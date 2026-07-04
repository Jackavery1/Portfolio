/* Affichage email / téléphone sur la page contact (hors HTML statique) */

import { CONFIG } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { decoderBase64Utf8, formaterTelephoneFr } from '../utils/pii.js';

export function initialiserCoordonneesContact() {
  const email = decoderBase64Utf8(CONFIG.CONTACT.EMAIL_B64);
  if (!email) return;

  const emailEl = parId(CONFIG.SELECTORS.CONTACT_EMAIL_DISPLAY);
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

  const phoneEl = parId(CONFIG.SELECTORS.CONTACT_PHONE_DISPLAY);
  if (phoneEl && CONFIG.CONTACT.PHONE_PARTS) {
    const { affichage, tel } = formaterTelephoneFr(CONFIG.CONTACT.PHONE_PARTS);
    if (affichage) {
      const lien = document.createElement('a');
      lien.href = `tel:${tel}`;
      lien.className = 'carte-contact__lien';
      lien.textContent = affichage;
      phoneEl.replaceChildren(lien);
    }
  }
}
