import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  afficherErreurZone,
  effacerEtatsInvalides,
  enregistrerSoumissionSession,
  potDeMielRempli,
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
      <input id="champ-a" aria-errormessage="champ-a-erreur" />
      <p id="champ-a-erreur" hidden></p>
    `;
    sessionStorage.clear();
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

  it('marque les champs invalides avec aria-invalid et message', () => {
    const champ = document.getElementById('champ-a');
    const erreur = document.getElementById('champ-a-erreur');
    const jouerBip = vi.fn();

    marquerChampsInvalides([{ el: champ, message: 'Champ requis.' }], jouerBip);

    expect(jouerBip).toHaveBeenCalledWith(150, 120, 'sawtooth');
    expect(champ.getAttribute('aria-invalid')).toBe('true');
    expect(erreur.hidden).toBe(false);
    expect(erreur.textContent).toBe('Champ requis.');
  });

  it('efface aria-invalid et le message de champ', () => {
    const champ = document.getElementById('champ-a');
    const erreur = document.getElementById('champ-a-erreur');
    champ.setAttribute('aria-invalid', 'true');
    erreur.hidden = false;
    erreur.textContent = 'Erreur';

    effacerEtatsInvalides([champ]);

    expect(champ.hasAttribute('aria-invalid')).toBe(false);
    expect(erreur.hidden).toBe(true);
    expect(erreur.textContent).toBe('');
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

  it('marque les champs invalides sans zone aria-errormessage', () => {
    document.body.innerHTML += '<input id="champ-sans-erreur" />';
    const champ = document.getElementById('champ-sans-erreur');
    const jouerBip = vi.fn();

    marquerChampsInvalides([{ el: champ, message: 'Requis.' }], jouerBip);

    expect(champ.getAttribute('aria-invalid')).toBe('true');
  });

  it('détecte le honeypot rempli', () => {
    const form = document.getElementById('f');
    const hp = form.querySelector('[name="website"]');
    expect(potDeMielRempli(form, hp, 'website')).toBe(false);
    hp.value = 'spam';
    expect(potDeMielRempli(form, hp, 'website')).toBe(true);
  });

  it('ignore afficherErreurZone sans zone', () => {
    expect(() => afficherErreurZone(null, 'test')).not.toThrow();
  });

  it('tolère sessionStorage indisponible pour le rate limit', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(peutSoumettreAvecSession('cle', 60_000)).toBe(true);
    getItem.mockRestore();
  });

  it('ignore marquerChampsInvalides sans élément', () => {
    const jouerBip = vi.fn();
    expect(() => marquerChampsInvalides([{ el: null, message: 'x' }], jouerBip)).not.toThrow();
    expect(jouerBip).toHaveBeenCalled();
  });
});
