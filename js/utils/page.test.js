import { describe, expect, it } from 'vitest';
import { obtenirFichierPageCourante, fichierPageDepuisPathname } from './page.js';

describe('page utils', () => {
  it('extrait le fichier depuis un pathname', () => {
    expect(obtenirFichierPageCourante('/Portfolio/projets.html')).toBe('projets.html');
    expect(obtenirFichierPageCourante('/Portfolio/')).toBe('index.html');
  });

  it('normalise en minuscules sans query', () => {
    expect(fichierPageDepuisPathname('/Contact.HTML?foo=1')).toBe('contact.html');
  });

  it('gère index par défaut', () => {
    expect(fichierPageDepuisPathname('/')).toBe('index.html');
    expect(fichierPageDepuisPathname('/Portfolio/index.html')).toBe('index.html');
  });
});
