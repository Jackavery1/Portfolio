/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  afficherErreurZone,
  enregistrerSoumissionSession,
  honeypotRempli,
  marquerChampsInvalides,
  peutSoumettreAvecSession,
} from './contact-form-ui.js';

describe('contact-form-ui', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="js-formulaire-erreur" hidden></div>
      <form id="f">
        <input name="website" value="" />
      </form>
      <input id="champ-a" />
    `;
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  it('affiche et masque la zone erreur', () => {
    const zone = document.getElementById('js-formulaire-erreur');
    afficherErreurZone(zone, 'Erreur test');
    expect(zone.hidden).toBe(false);
    expect(zone.textContent).toBe('Erreur test');

    afficherErreurZone(zone, '');
    expect(zone.hidden).toBe(true);
    expect(zone.textContent).toBe('');
  });

  it('marque les champs invalides temporairement', () => {
    const champ = document.getElementById('champ-a');
    const jouerBip = vi.fn();
    marquerChampsInvalides([champ], jouerBip);
    expect(jouerBip).toHaveBeenCalledWith(150, 120, 'sawtooth');
    expect(champ.style.borderColor).toBe('var(--couleur-erreur)');
    vi.advanceTimersByTime(1500);
    expect(champ.style.borderColor).toBe('');
  });

  it('vérifie le rate limit via sessionStorage', () => {
    const key = 'test-last';
    expect(peutSoumettreAvecSession(key, 60_000)).toBe(true);
    sessionStorage.setItem(key, String(Date.now()));
    expect(peutSoumettreAvecSession(key, 60_000)).toBe(false);
  });

  it('enregistre le timestamp de soumission', () => {
    enregistrerSoumissionSession('test-submit');
    expect(sessionStorage.getItem('test-submit')).toBeTruthy();
  });

  it('détecte le honeypot rempli', () => {
    const form = document.getElementById('f');
    const hp = form.querySelector('[name="website"]');
    expect(honeypotRempli(form, hp, 'website')).toBe(false);
    hp.value = 'spam';
    expect(honeypotRempli(form, hp, 'website')).toBe(true);
  });
});
