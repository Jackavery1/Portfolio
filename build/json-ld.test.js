import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildJsonLd } = require('./json-ld.cjs');

describe('build json-ld', () => {
  const siteBase = 'https://example.com';
  const meta = {
    ogTitle: 'Contact · Joris Martinez',
    description: 'Contact — Joris Martinez, développeur web junior.',
  };

  it('index — graph Person + WebSite + WebPage', () => {
    const payload = buildJsonLd(
      'index.html',
      siteBase,
      {
        ogTitle: 'Joris Martinez · Développeur Web',
        description: 'Portfolio développeur web.',
      },
      `${siteBase}/`
    );

    expect(payload['@graph']).toHaveLength(3);
    const person = payload['@graph'][0];
    expect(person['@type']).toBe('Person');
    expect(person['@id']).toBe(`${siteBase}/#person`);
    expect(person.name).toBeTruthy();
    expect(person.jobTitle).toBeTruthy();
    expect(payload['@graph'][1]['@type']).toBe('WebSite');
    expect(payload['@graph'][2]['@type']).toBe('WebPage');
    expect(payload['@graph'][2].url).toBe(`${siteBase}/`);
  });

  it('page interne — graph avec author lié à Person', () => {
    const payload = buildJsonLd('contact.html', siteBase, meta, `${siteBase}/contact.html`);

    expect(payload['@graph']).toHaveLength(3);
    const page = payload['@graph'].find((n) => n['@type'] === 'WebPage');
    expect(page.author).toEqual({ '@id': `${siteBase}/#person` });
    expect(page.mainEntity).toEqual({ '@id': `${siteBase}/#person` });
  });

  it('retourne null sans ogTitle', () => {
    expect(buildJsonLd('contact.html', siteBase, {}, `${siteBase}/contact.html`)).toBeNull();
  });
});
