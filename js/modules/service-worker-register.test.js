/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

function injecterCspProd() {
  const meta = document.createElement('meta');
  meta.setAttribute('http-equiv', 'Content-Security-Policy');
  meta.setAttribute('content', "default-src 'self'");
  document.head.appendChild(meta);
}

describe('service-worker-register', () => {
  const register = vi.fn(() => Promise.resolve({}));

  beforeEach(() => {
    vi.resetModules();
    register.mockClear();
    document.head.innerHTML = '';
    vi.stubGlobal('navigator', { serviceWorker: { register } });
  });

  it('enregistre sw.js au chargement de la page (build prod)', async () => {
    injecterCspProd();
    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    window.dispatchEvent(new Event('load'));

    expect(register).toHaveBeenCalledWith('sw.js');
  });

  it('enregistre immédiatement si le document est déjà chargé', async () => {
    injecterCspProd();
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();

    expect(register).toHaveBeenCalledWith('sw.js');
  });

  it('ne fait rien en mode sources (sans CSP build)', async () => {
    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    window.dispatchEvent(new Event('load'));

    expect(register).not.toHaveBeenCalled();
  });

  it('ne fait rien si serviceWorker est indisponible', async () => {
    injecterCspProd();
    vi.stubGlobal('navigator', {});
    const { enregistrerServiceWorker } = await import('./service-worker-register.js');

    expect(() => enregistrerServiceWorker()).not.toThrow();
    window.dispatchEvent(new Event('load'));

    expect(register).not.toHaveBeenCalled();
  });

  it('journalise en dev si l’enregistrement échoue', async () => {
    injecterCspProd();
    const erreur = new Error('sw fail');
    register.mockRejectedValueOnce(erreur);
    vi.stubGlobal('location', { hostname: 'localhost', search: '' });
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    window.dispatchEvent(new Event('load'));
    await Promise.resolve();

    expect(debug).toHaveBeenCalledWith('[sw] enregistrement échoué', erreur);
    debug.mockRestore();
  });
});
