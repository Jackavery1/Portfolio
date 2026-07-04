import { describe, expect, it } from 'vitest';
import { getCurrentPageFile, pageFileFromPathname } from './page.js';

describe('page utils', () => {
  it('extrait le fichier depuis un pathname', () => {
    expect(getCurrentPageFile('/Portfolio/projets.html')).toBe('projets.html');
    expect(getCurrentPageFile('/Portfolio/')).toBe('index.html');
  });

  it('normalise en minuscules sans query', () => {
    expect(pageFileFromPathname('/Contact.HTML?foo=1')).toBe('contact.html');
  });

  it('gère index par défaut', () => {
    expect(pageFileFromPathname('/')).toBe('index.html');
    expect(pageFileFromPathname('/Portfolio/index.html')).toBe('index.html');
  });
});
