/* Contact — orchestration formulaire (validation, reCAPTCHA, envoi) */

import { CONFIGURATION } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { effacerEtatsInvalides } from '../utils/contact-form-ui.js';
import { optionsRecaptchaContact, planifierRecaptchaAuFocus } from './contact-form-recaptcha.js';
import { initialiserEcouteurSoumission } from './contact-form-handler.js';
import { initialiserScrollChampClavier } from '../utils/visual-viewport.js';

export async function initialiserFormulaireContact() {
  const formulaire = parId(CONFIGURATION.SELECTEURS.FORMULAIRE);
  if (!formulaire) return;

  const endpoint = CONFIGURATION.CONTACT.FORMSPREE_ENDPOINT?.trim();
  const recaptchaKey = CONFIGURATION.CONTACT.RECAPTCHA_SITE_KEY?.trim();
  const mount = parId(CONFIGURATION.SELECTEURS.MONTE_RECAPTCHA);
  const paramsRecaptcha = {
    endpoint,
    recaptchaKey,
    mount,
    optionsRecaptcha: optionsRecaptchaContact(),
  };
  const assurerRecaptcha = planifierRecaptchaAuFocus(formulaire, paramsRecaptcha);

  initialiserScrollChampClavier(formulaire);

  formulaire.addEventListener('input', (evt) => {
    if (evt.target.matches('.champ-input')) {
      effacerEtatsInvalides([evt.target]);
    }
  });

  initialiserEcouteurSoumission(formulaire, {
    endpoint,
    assurerRecaptcha,
    optionsRecaptcha: optionsRecaptchaContact(),
  });

  formulaire.dataset.ready = '1';
}
