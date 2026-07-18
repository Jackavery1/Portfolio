/* @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { estBuildProd, estEnvironnementDevLocal } from './dev-mode.js';

describe('dev-mode', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    vi.unstubAllGlobals();
  });

  it('détecte la CSP comme build prod', () => {
    expect(estBuildProd()).toBe(false);
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'";
    document.head.appendChild(meta);
    expect(estBuildProd()).toBe(true);
  });

  it('détecte localhost comme env local', () => {
    vi.stubGlobal('location', {
      hostname: 'localhost',
      search: '',
    });
    expect(estEnvironnementDevLocal()).toBe(true);
  });

  it('détecte le paramètre ?dev', () => {
    vi.stubGlobal('location', {
      hostname: 'example.com',
      search: '?dev=1',
    });
    expect(estEnvironnementDevLocal()).toBe(true);
  });
});
