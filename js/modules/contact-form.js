/* ============================================
   Formulaire contact (Formspree ou mailto)
   ============================================ */

import { CONFIG } from '../config/index.js';
import { byId } from '../utils/dom.js';
import {
  construireFormDataFormspree,
  honeypotEstRempli,
  libellerSujetSelect,
  messageErreurCatch,
  messageErreurFormspree,
  peutSoumettre,
} from '../utils/contact-form-helpers.js';
import { decodeBase64Utf8 } from '../utils/pii.js';
import { estEmailValide, nettoyerChamp } from '../utils/validation.js';
import { jouerBip } from './audio.js';
import { ajouterScore } from './score.js';
import { initRecaptcha, obtenirTokenRecaptcha, resetRecaptcha } from './recaptcha.js';

function afficherErreurFormulaire(texte) {
  const zone = byId(CONFIG.SELECTORS.CONTACT_ERREUR);
  if (!zone) return;
  if (texte) {
    zone.hidden = false;
    zone.textContent = texte;
  } else {
    zone.hidden = true;
    zone.textContent = '';
  }
}

function honeypotRempli(formulaire) {
  const hp =
    byId(CONFIG.SELECTORS.CONTACT_HONEYPOT) ||
    formulaire.querySelector(`[name="${CONFIG.CONTACT.HONEYPOT_NAME}"]`);
  return honeypotEstRempli(hp?.value);
}

function peutSoumettreFormulaire() {
  try {
    const last = sessionStorage.getItem(CONFIG.STORAGE.CONTACT_LAST_SUBMIT);
    return peutSoumettre({
      dernierEnvoi: last,
      rateLimitMs: CONFIG.CONTACT.RATE_LIMIT_MS,
    });
  } catch {
    return true;
  }
}

function enregistrerSoumission() {
  try {
    sessionStorage.setItem(CONFIG.STORAGE.CONTACT_LAST_SUBMIT, String(Date.now()));
  } catch {
    /* quota privé */
  }
}

function marquerChampsInvalides(elements) {
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

function optionsRecaptcha() {
  return {
    siteKey: CONFIG.CONTACT.RECAPTCHA_SITE_KEY,
    version: CONFIG.CONTACT.RECAPTCHA_VERSION === 3 ? 3 : 2,
    mountId: CONFIG.SELECTORS.RECAPTCHA_MOUNT,
    action: 'submit',
  };
}

function lireSujetUtile() {
  const sujetSelect = byId(CONFIG.SELECTORS.CONTACT_SUJET);
  return libellerSujetSelect(sujetSelect?.options[sujetSelect.selectedIndex]?.text);
}

export async function initContactForm() {
  const formulaire = byId(CONFIG.SELECTORS.FORMULAIRE);
  if (!formulaire) return;

  const endpoint = CONFIG.CONTACT.FORMSPREE_ENDPOINT?.trim();
  const recaptchaKey = CONFIG.CONTACT.RECAPTCHA_SITE_KEY?.trim();
  const mount = byId(CONFIG.SELECTORS.RECAPTCHA_MOUNT);

  if (endpoint && recaptchaKey) {
    try {
      await initRecaptcha(optionsRecaptcha());
    } catch {
      if (mount) {
        mount.hidden = false;
        mount.className = 'recaptcha-zone recaptcha-zone--erreur';
        mount.textContent =
          'Vérification anti-spam indisponible. Rechargez la page ou vérifiez localhost dans Google reCAPTCHA.';
      }
    }
  } else if (endpoint && mount) {
    mount.hidden = false;
    mount.className = 'recaptcha-zone recaptcha-zone--config';
    mount.setAttribute('role', 'alert');
    mount.textContent =
      'reCAPTCHA non configuré : ajoutez RECAPTCHA_SITE_KEY dans js/config/contact.js.';
  }

  formulaire.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    afficherErreurFormulaire('');

    if (honeypotRempli(formulaire)) {
      return;
    }

    if (!peutSoumettreFormulaire()) {
      jouerBip(150, 120, 'sawtooth');
      const btn = byId(CONFIG.SELECTORS.BTN_ENVOYER);
      if (btn) {
        btn.setAttribute('title', 'Veuillez patienter avant un nouvel envoi.');
      }
      return;
    }

    const { LIMITS } = CONFIG.CONTACT;
    const nom = nettoyerChamp(byId(CONFIG.SELECTORS.CONTACT_NOM)?.value, LIMITS.nom);
    const email = nettoyerChamp(byId(CONFIG.SELECTORS.CONTACT_EMAIL)?.value, LIMITS.email);
    const message = nettoyerChamp(
      byId(CONFIG.SELECTORS.CONTACT_MESSAGE)?.value,
      LIMITS.message
    );

    const champs = [
      byId(CONFIG.SELECTORS.CONTACT_NOM),
      byId(CONFIG.SELECTORS.CONTACT_EMAIL),
      byId(CONFIG.SELECTORS.CONTACT_MESSAGE),
    ];

    if (!nom || !email || !message || !estEmailValide(email, CONFIG.CONTACT.LIMITS.email)) {
      marquerChampsInvalides(champs);
      formulaire.reportValidity();
      return;
    }

    const btnEnvoyer = byId(CONFIG.SELECTORS.BTN_ENVOYER);
    const confirmation = byId(CONFIG.SELECTORS.CONFIRMATION);
    if (!btnEnvoyer) return;

    if (endpoint) {
      if (!recaptchaKey) {
        jouerBip(150, 120, 'sawtooth');
        btnEnvoyer.setAttribute(
          'title',
          'Renseignez RECAPTCHA_SITE_KEY dans js/config/contact.js pour envoyer via Formspree.'
        );
        if (mount) mount.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      const labelEnvoyer = btnEnvoyer.textContent;
      btnEnvoyer.disabled = true;
      btnEnvoyer.removeAttribute('title');
      let recaptchaToken = null;
      try {
        if (recaptchaKey) {
          recaptchaToken = await obtenirTokenRecaptcha(optionsRecaptcha());
        }
      } catch (err) {
        jouerBip(150, 120, 'sawtooth');
        btnEnvoyer.disabled = false;
        const msg = messageErreurCatch(err);
        btnEnvoyer.setAttribute('title', msg);
        afficherErreurFormulaire(msg);
        return;
      }

      if (recaptchaKey && !recaptchaToken) {
        jouerBip(150, 120, 'sawtooth');
        btnEnvoyer.disabled = false;
        const msg =
          CONFIG.CONTACT.RECAPTCHA_VERSION === 3
            ? 'Vérification anti-spam en cours… réessayez.'
            : 'Cochez la case « Je ne suis pas un robot ».';
        btnEnvoyer.setAttribute('title', msg);
        afficherErreurFormulaire(msg);
        return;
      }

      const sujetUtile = lireSujetUtile();

      const fd = construireFormDataFormspree({
        nom,
        email,
        message,
        sujetLabel: sujetUtile,
        recaptchaToken,
      });

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: fd,
          headers: { Accept: 'application/json' },
        });
        let payload = null;
        try {
          payload = await res.json();
        } catch {
          /* corps non JSON */
        }

        if (res.ok) {
          enregistrerSoumission();
          resetRecaptcha();
          if (confirmation) confirmation.hidden = false;
          jouerBip(660, 80, 'sine');
          ajouterScore(500);
          btnEnvoyer.textContent = '✓ ENVOYÉ';
        } else {
          jouerBip(150, 120, 'sawtooth');
          btnEnvoyer.disabled = false;
          btnEnvoyer.textContent = labelEnvoyer;
          resetRecaptcha();
          const msg = messageErreurFormspree(payload, res);
          btnEnvoyer.setAttribute('title', msg);
          afficherErreurFormulaire(msg);
        }
      } catch (err) {
        jouerBip(150, 120, 'sawtooth');
        btnEnvoyer.disabled = false;
        btnEnvoyer.textContent = labelEnvoyer;
        resetRecaptcha();
        const msg = messageErreurCatch(err);
        btnEnvoyer.setAttribute('title', msg);
        afficherErreurFormulaire(msg);
      }
      return;
    }

    const emailDest = decodeBase64Utf8(CONFIG.CONTACT.EMAIL_B64);
    if (!emailDest) return;

    const sujetUtile = lireSujetUtile();
    const subject = `[Portfolio] ${sujetUtile ? `${sujetUtile} — ` : ''}${nom}`;
    const body = `De : ${nom} <${email}>\n\n${message}`;
    window.location.href = `mailto:${emailDest}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    enregistrerSoumission();
    if (confirmation) confirmation.hidden = false;
    jouerBip(660, 80, 'sine');
    ajouterScore(500);
    btnEnvoyer.disabled = true;
    btnEnvoyer.textContent = '✓ ENVOYÉ';
  });
}
