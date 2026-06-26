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

import { initMetaPartage } from './meta.js';

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

    expect(document.getElementById('link-canonical').href).toBe(
      'https://example.com/contact.html',
    );
    expect(document.getElementById('meta-og-url').getAttribute('content')).toBe(
      'https://example.com/contact.html',
    );
    expect(
      document.querySelector('meta[property="og:image"]').getAttribute('content'),
    ).toBe('https://example.com/assets/og.png');
  });
});
