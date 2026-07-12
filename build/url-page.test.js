import { describe, expect, it } from 'vitest';
import { urlPageProd } from './url-page.mjs';

describe('url-page', () => {
  it('génère l’URL canonique prod', () => {
    expect(urlPageProd('index.html', 'https://exemple.dev')).toBe('https://exemple.dev/');
    expect(urlPageProd('projets.html', 'https://exemple.dev')).toBe(
      'https://exemple.dev/projets.html'
    );
  });
});
