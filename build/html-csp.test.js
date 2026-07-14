import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { injectCspMeta, CSP_META } = require('./html-csp.cjs');

describe('html-csp', () => {
  it('injecte la CSP après le viewport si absente', () => {
    const html =
      '<head><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" /></head>';
    const out = injectCspMeta(html);
    expect(out).toContain('http-equiv="Content-Security-Policy"');
    expect(out).toContain(CSP_META.trim().slice(0, 40));
  });

  it('ne duplique pas la CSP si déjà présente', () => {
    const html = `<head><meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${CSP_META}</head>`;
    const out = injectCspMeta(html);
    expect(out.match(/Content-Security-Policy/g)).toHaveLength(1);
  });
});
