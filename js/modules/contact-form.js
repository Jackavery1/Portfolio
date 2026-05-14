/* ============================================
   Formulaire contact (Formspree ou mailto)
   ============================================ */

import { CONFIG } from '../config.js';
import { byId } from '../utils/dom.js';
import { jouerBip } from './audio.js';
import { ajouterScore } from './score.js';

function messageErreurFormspree(payload, res) {
  if (!payload || typeof payload !== 'object') {
    return `Envoi refusé (${res.status})`;
  }
  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error.trim();
  }
  const errs = payload.errors;
  if (errs && typeof errs === 'object') {
    const parts = Object.entries(errs).flatMap(([key, val]) => {
      if (typeof val === 'string') return [`${key}: ${val}`];
      if (Array.isArray(val)) return val.map((v) => `${key}: ${v}`);
      return [];
    });
    if (parts.length) return parts.join(' — ');
  }
  return `Envoi refusé (${res.status})`;
}

export function initContactForm() {
  const formulaire = byId(CONFIG.SELECTORS.FORMULAIRE);
  if (!formulaire) return;

  formulaire.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const nom = byId(CONFIG.SELECTORS.CONTACT_NOM)?.value.trim();
    const email = byId(CONFIG.SELECTORS.CONTACT_EMAIL)?.value.trim();
    const message = byId(CONFIG.SELECTORS.CONTACT_MESSAGE)?.value.trim();

    if (!nom || !email || !message) {
      jouerBip(150, 120, 'sawtooth');
      [
        byId(CONFIG.SELECTORS.CONTACT_NOM),
        byId(CONFIG.SELECTORS.CONTACT_EMAIL),
        byId(CONFIG.SELECTORS.CONTACT_MESSAGE),
      ].forEach((el) => {
        if (el && !el.value.trim()) {
          el.style.borderColor = 'var(--couleur-erreur)';
          setTimeout(() => {
            el.style.borderColor = '';
          }, 1500);
        }
      });
      formulaire.reportValidity();
      return;
    }

    const endpoint = formulaire.dataset.formspree?.trim();
    const btnEnvoyer = byId(CONFIG.SELECTORS.BTN_ENVOYER);
    const confirmation = byId(CONFIG.SELECTORS.CONFIRMATION);
    if (!btnEnvoyer) return;

    if (endpoint) {
      const labelEnvoyer = btnEnvoyer.textContent;
      btnEnvoyer.disabled = true;
      btnEnvoyer.removeAttribute('title');
      try {
        const fd = new FormData(formulaire);
        const res = await fetch(endpoint, {
          method: 'POST',
          body: fd,
          headers: { Accept: 'application/json' },
        });
        let payload = null;
        try {
          payload = await res.json();
        } catch {
          /* corps non JSON (rare) */
        }

        if (res.ok) {
          if (confirmation) confirmation.hidden = false;
          jouerBip(660, 80, 'sine');
          ajouterScore(500);
          btnEnvoyer.textContent = '✓ ENVOYÉ';
        } else {
          jouerBip(150, 120, 'sawtooth');
          btnEnvoyer.disabled = false;
          btnEnvoyer.textContent = labelEnvoyer;
          btnEnvoyer.setAttribute('title', messageErreurFormspree(payload, res));
        }
      } catch {
        jouerBip(150, 120, 'sawtooth');
        btnEnvoyer.disabled = false;
        btnEnvoyer.textContent = labelEnvoyer;
        btnEnvoyer.setAttribute('title', 'Erreur réseau ou blocage');
      }
      return;
    }

    const sujetSelect = byId(CONFIG.SELECTORS.CONTACT_SUJET);
    const sujetLabel = sujetSelect?.options[sujetSelect.selectedIndex]?.text?.trim() || '';
    const sujetUtile = sujetLabel && !/^—/.test(sujetLabel) ? sujetLabel : '';
    const subject = `[Portfolio] ${sujetUtile ? `${sujetUtile} — ` : ''}${nom}`;
    const body = `De : ${nom} <${email}>\n\n${message}`;
    window.location.href = `mailto:${CONFIG.CONTACT.EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (confirmation) confirmation.hidden = false;
    jouerBip(660, 80, 'sine');
    ajouterScore(500);
    btnEnvoyer.disabled = true;
    btnEnvoyer.textContent = '✓ ENVOYÉ';
  });
}
