import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./contact-bandeau.js', () => ({
  initialiserBandeauContact: vi.fn(),
}));

vi.mock('./contact-coordonnees.js', () => ({
  initialiserCoordonneesContact: vi.fn(),
}));

vi.mock('./contact-form.js', () => ({
  initialiserFormulaireContact: vi.fn().mockResolvedValue(undefined),
}));

import { initialiserBandeauContact } from './contact-bandeau.js';
import { initialiserCoordonneesContact } from './contact-coordonnees.js';
import { initialiserFormulaireContact } from './contact-form.js';
import { initialiserPageContact } from './contact.js';

describe('contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initialise bandeau, coordonnées puis formulaire', async () => {
    const ordre = [];
    vi.mocked(initialiserBandeauContact).mockImplementation(() => {
      ordre.push('bandeau');
    });
    vi.mocked(initialiserCoordonneesContact).mockImplementation(() => {
      ordre.push('coordonnees');
    });
    vi.mocked(initialiserFormulaireContact).mockImplementation(async () => {
      ordre.push('formulaire');
    });

    await initialiserPageContact();

    expect(ordre).toEqual(['bandeau', 'coordonnees', 'formulaire']);
  });
});
