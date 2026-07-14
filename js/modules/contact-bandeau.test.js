import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    CONTACT: {
      CV_HREF: 'assets/cv-test.pdf',
      CV_DOWNLOAD: 'CV-test.pdf',
    },
    SELECTEURS: {
      CONTACT_BANDEAU_DISPO: 'js-bandeau-dispo',
      CONTACT_BANDEAU_CV: 'js-bandeau-cv',
    },
  },
}));

vi.mock('./audio.js', () => ({
  jouerBip: vi.fn(),
}));

import { initialiserBandeauContact } from './contact-bandeau.js';

describe('contact-bandeau', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button type="button" id="js-bandeau-dispo">Afficher</button>
      <div id="js-bandeau-cv-bloc" hidden>
        <a id="js-bandeau-cv" href="#">CV</a>
        <button type="button" id="js-bandeau-retour">Retour</button>
      </div>
    `;
  });

  it('bascule entre statut et téléchargement du CV', () => {
    initialiserBandeauContact();

    const dispo = document.getElementById('js-bandeau-dispo');
    const cvBloc = document.getElementById('js-bandeau-cv-bloc');
    const cv = document.getElementById('js-bandeau-cv');

    expect(cv.getAttribute('href')).toBe('assets/cv-test.pdf');
    expect(cv.getAttribute('download')).toBe('CV-test.pdf');

    dispo.click();
    expect(dispo.hidden).toBe(true);
    expect(cvBloc.hidden).toBe(false);

    document.getElementById('js-bandeau-retour').click();
    expect(dispo.hidden).toBe(false);
    expect(cvBloc.hidden).toBe(true);
  });

  it('ignore les éléments manquants', () => {
    document.body.innerHTML = '';
    expect(() => initialiserBandeauContact()).not.toThrow();
  });
});
