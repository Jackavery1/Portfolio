/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./contact-bandeau.js', () => ({
  initContactBandeau: vi.fn(),
}));

vi.mock('./contact-form.js', () => ({
  initContactForm: vi.fn().mockResolvedValue(undefined),
}));

import { initContactBandeau } from './contact-bandeau.js';
import { initContactForm } from './contact-form.js';
import { initContactPage } from './contact.js';

describe('contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initialise bandeau puis formulaire', async () => {
    const ordre = [];
    vi.mocked(initContactBandeau).mockImplementation(() => {
      ordre.push('bandeau');
    });
    vi.mocked(initContactForm).mockImplementation(async () => {
      ordre.push('formulaire');
    });

    await initContactPage();

    expect(ordre).toEqual(['bandeau', 'formulaire']);
  });
});
