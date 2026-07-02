/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIG: {
    SITE_ORIGIN: 'https://example.com',
    SELECTORS: {
      CANONICAL: 'link-canonical',
      OG_URL: 'meta-og-url',
    },
    STORAGE: { PAGE_PREFIX: 'portfolio-page-' },
  },
}));

vi.mock('../utils/page.js', () => ({
  getCurrentPageFile: () => 'contact.html',
}));

vi.mock('./score.js', () => ({
  ajouterScore: vi.fn(),
}));

import { ajouterScore } from './score.js';
import { initBonusScore, initMetaPartage } from './meta.js';

describe('meta', () => {
  beforeEach(() => {
    document.head.innerHTML = `
      <link rel="canonical" href="" id="link-canonical" />
      <meta id="meta-og-url" property="og:url" content="" />
      <meta property="og:image" content="assets/og.png" />
    `;
  });

  it('remplit canonical et og:url en absolu', () => {
    initMetaPartage();

    expect(document.getElementById('link-canonical').href).toBe('https://example.com/contact.html');
    expect(document.getElementById('meta-og-url').getAttribute('content')).toBe(
      'https://example.com/contact.html'
    );
    expect(document.querySelector('meta[property="og:image"]').getAttribute('content')).toBe(
      'https://example.com/assets/og.png'
    );
  });

  it('initBonusScore crédite la première visite et le lien GitHub', () => {
    sessionStorage.clear();
    document.body.innerHTML = '<a class="lien-github" href="#">GitHub</a>';

    initBonusScore();

    expect(ajouterScore).toHaveBeenCalledWith(200);
    document.querySelector('.lien-github').click();
    expect(ajouterScore).toHaveBeenCalledWith(500);
  });

  it('initBonusScore n’attache pas de bonus aux cartes boss', () => {
    sessionStorage.clear();
    document.body.innerHTML = '<article class="boss-carte"></article>';

    initBonusScore();
    vi.mocked(ajouterScore).mockClear();
    document.querySelector('.boss-carte').click();

    expect(ajouterScore).not.toHaveBeenCalled();
  });
});
