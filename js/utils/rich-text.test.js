/* @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { ajouterHtmlEnrichi, echapperHtml, paragrapheHtmlEnrichi } from './rich-text.js';

describe('rich-text', () => {
  it('conserve strong, code et liens sûrs', () => {
    const p = paragrapheHtmlEnrichi(
      'Texte <strong>gras</strong> et <code>LICENSE</code> — <a href="contact.html">contact</a>.'
    );

    expect(p.querySelector('strong')?.textContent).toBe('gras');
    expect(p.querySelector('code')?.textContent).toBe('LICENSE');
    expect(p.querySelector('a')?.getAttribute('href')).toBe('contact.html');
  });

  it('ignore les balises non autorisées', () => {
    const div = document.createElement('div');
    ajouterHtmlEnrichi(div, 'Avant<script>alert(1)</script><img src=x onerror=alert(1)>Après');

    expect(div.textContent).toBe('AvantAprès');
    expect(div.querySelector('script')).toBeNull();
    expect(div.querySelector('img')).toBeNull();
  });

  it('rejette les liens javascript:', () => {
    const p = paragrapheHtmlEnrichi('<a href="javascript:alert(1)">x</a>');
    const lien = p.querySelector('a');
    expect(lien?.getAttribute('href')).toBeNull();
  });

  it('échappe le HTML brut', () => {
    expect(echapperHtml('<img onerror=alert(1)>')).toBe('&lt;img onerror=alert(1)&gt;');
  });
});
