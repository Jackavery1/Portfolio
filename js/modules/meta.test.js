/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    SITE_ORIGIN: 'https://example.com',
    SELECTEURS: {
      CANONICAL: 'link-canonical',
      OG_URL: 'meta-og-url',
    },
    STOCKAGE: { PREFIXE_PAGE: 'portfolio-page-' },
    BONUS_SCORE: { PAGE: 200, GITHUB: 500 },
  },
}));

vi.mock('../utils/page.js', () => ({
  obtenirFichierPageCourante: () => 'contact.html',
}));

vi.mock('./score.js', () => ({
  ajouterScore: vi.fn(),
}));

import { ajouterScore } from './score.js';
import { initialiserBonusScore, initialiserMetaPartage } from './meta.js';

describe('meta', () => {
  beforeEach(() => {
    document.head.innerHTML = `
      <link rel="canonical" href="" id="link-canonical" />
      <meta id="meta-og-url" property="og:url" content="" />
      <meta property="og:image" content="assets/og.png" />
    `;
  });

  it('remplit canonical et og:url en absolu', () => {
    initialiserMetaPartage();

    expect(document.getElementById('link-canonical').href).toBe('https://example.com/contact.html');
    expect(document.getElementById('meta-og-url').getAttribute('content')).toBe(
      'https://example.com/contact.html'
    );
    expect(document.querySelector('meta[property="og:image"]').getAttribute('content')).toBe(
      'https://example.com/assets/og.png'
    );
  });

  it('initialiserBonusScore crédite la première visite et le lien GitHub', () => {
    sessionStorage.clear();
    document.body.innerHTML = '<a class="lien-github" href="#">GitHub</a>';

    initialiserBonusScore();

    expect(ajouterScore).toHaveBeenCalledWith(200);
    document.querySelector('.lien-github').click();
    expect(ajouterScore).toHaveBeenCalledWith(500);
  });

  it('initialiserBonusScore n’attache pas de bonus aux cartes boss', () => {
    sessionStorage.clear();
    document.body.innerHTML = '<article class="boss-carte"></article>';

    initialiserBonusScore();
    vi.mocked(ajouterScore).mockClear();
    document.querySelector('.boss-carte').click();

    expect(ajouterScore).not.toHaveBeenCalled();
  });

  it('utilise window.location quand SITE_ORIGIN est vide', () => {
    vi.resetModules();
    vi.doMock('../config/index.js', () => ({
      CONFIGURATION: {
        SITE_ORIGIN: '',
        SELECTEURS: {
          CANONICAL: 'link-canonical',
          OG_URL: 'meta-og-url',
        },
      },
    }));
    vi.doMock('../utils/page.js', () => ({
      obtenirFichierPageCourante: () => 'index.html',
    }));

    document.head.innerHTML = `
      <link rel="canonical" href="" id="link-canonical" />
      <meta id="meta-og-url" property="og:url" content="" />
    `;

    return import('./meta.js').then(({ initialiserMetaPartage }) => {
      initialiserMetaPartage();
      expect(document.getElementById('link-canonical').href).toMatch(/\/$/);
    });
  });
});
