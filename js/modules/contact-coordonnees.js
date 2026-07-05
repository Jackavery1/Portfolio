/* Affichage email / téléphone sur la page contact (hors HTML statique) */

import { CONFIGURATION } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { decoderBase64Utf8, formaterTelephoneFr } from '../utils/pii.js';

export function initialiserCoordonneesContact() {
  const email = decoderBase64Utf8(CONFIGURATION.CONTACT.EMAIL_B64);
  if (!email) return;

  const emailEl = parId(CONFIGURATION.SELECTEURS.CONTACT_EMAIL_DISPLAY);
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

  const phoneEl = parId(CONFIGURATION.SELECTEURS.CONTACT_PHONE_DISPLAY);
  if (phoneEl && CONFIGURATION.CONTACT.PHONE_PARTS) {
    const { affichage, tel } = formaterTelephoneFr(CONFIGURATION.CONTACT.PHONE_PARTS);
    if (affichage) {
      const lien = document.createElement('a');
      lien.href = `tel:${tel}`;
      lien.className = 'carte-contact__lien';
      lien.textContent = affichage;
      phoneEl.replaceChildren(lien);
    }
  }
}
