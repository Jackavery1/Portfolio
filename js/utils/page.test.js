import { describe, expect, it } from 'vitest';
import { obtenirFichierPageCourante, fichierPageDepuisPathname } from './page.js';

describe('utilitaires page', () => {
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

  it('normalise les URLs sans extension (.html)', () => {
    expect(fichierPageDepuisPathname('/projets')).toBe('projets.html');
    expect(fichierPageDepuisPathname('/competences')).toBe('competences.html');
  });

  it('ignore hash et query dans le pathname', () => {
    expect(obtenirFichierPageCourante('/dojo.html#boss')).toBe('dojo.html');
    expect(fichierPageDepuisPathname('/index#accueil')).toBe('index.html');
    expect(fichierPageDepuisPathname('/index')).toBe('index.html');
  });

  it('conserve les fichiers avec extension explicite', () => {
    expect(fichierPageDepuisPathname('/dojo-boss-rush.html')).toBe('dojo-boss-rush.html');
    expect(obtenirFichierPageCourante('/foo/bar.html?x=1#y')).toBe('bar.html');
  });

  it('fonctionne sans window (pathname explicite)', () => {
    expect(obtenirFichierPageCourante('')).toBe('index.html');
    expect(fichierPageDepuisPathname('')).toBe('index.html');
    expect(fichierPageDepuisPathname('/INDEX.HTML')).toBe('index.html');
  });

  it('normalise index et chemins sans extension', () => {
    expect(fichierPageDepuisPathname('/index')).toBe('index.html');
    expect(fichierPageDepuisPathname('/INDEX')).toBe('index.html');
  });

  it('gère les entrées vides', () => {
    expect(fichierPageDepuisPathname('/?')).toBe('index.html');
    expect(obtenirFichierPageCourante('')).toBe('index.html');
    expect(fichierPageDepuisPathname('?x')).toBe('index.html');
    expect(fichierPageDepuisPathname(null)).toBe('index.html');
    expect(fichierPageDepuisPathname(undefined)).toBe('index.html');
  });
});
