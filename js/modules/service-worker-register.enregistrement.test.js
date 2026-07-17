import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { injecterCspProd } from '../test-fixtures/csp-prod.js';
import { preparerEnvironnementSw } from '../test-fixtures/service-worker-register-setup.js';

describe('service-worker-register — enregistrement', () => {
  let register;

  beforeEach(() => {
    const nav = preparerEnvironnementSw();
    register = nav.register;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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

  it.each([
    ['localhost', { hostname: 'localhost', search: '' }],
    ['127.0.0.1', { hostname: '127.0.0.1', search: '' }],
    ['?dev', { hostname: 'example.com', search: '?dev=1' }],
  ])('journalise en dev si l’enregistrement échoue (%s)', async (_label, location) => {
    injecterCspProd();
    const erreur = new Error('sw fail');
    register.mockRejectedValueOnce(erreur);
    vi.stubGlobal('location', location);
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await expect(register.mock.results[0].value).rejects.toBe(erreur);

    expect(debug).toHaveBeenCalledWith('[sw] enregistrement échoué', erreur);
    debug.mockRestore();
  });

  it('reste silencieux en prod si l’enregistrement échoue', async () => {
    injecterCspProd();
    register.mockRejectedValueOnce(new Error('sw fail'));
    vi.stubGlobal('location', { hostname: 'portfolio.example', search: '' });
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    window.dispatchEvent(new Event('load'));
    await Promise.resolve();

    expect(debug).not.toHaveBeenCalled();
    debug.mockRestore();
  });

  it('signale le mode dev sans service worker', async () => {
    vi.stubGlobal('location', { hostname: 'localhost', search: '' });
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    enregistrerServiceWorker();

    expect(debug).toHaveBeenCalledTimes(1);
    expect(debug.mock.calls[0][0]).toContain('[sw] Service worker inactif en dev');
    debug.mockRestore();
  });

  it('attend l’événement load si le document n’est pas encore complete', async () => {
    injecterCspProd();
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    expect(register).not.toHaveBeenCalled();

    window.dispatchEvent(new Event('load'));
    expect(register).toHaveBeenCalledWith('sw.js');
  });

  it('tolère un rejet de registration.update()', async () => {
    injecterCspProd();
    const erreur = new Error('update fail');
    const registration = {
      waiting: null,
      update: vi.fn().mockRejectedValue(erreur),
      addEventListener: vi.fn(),
    };
    register.mockResolvedValueOnce(registration);
    vi.stubGlobal('location', { hostname: 'localhost', search: '' });
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    expect(() => enregistrerServiceWorker()).not.toThrow();
    await expect(register.mock.results[0].value).resolves.toBe(registration);
    await expect(registration.update.mock.results[0].value).rejects.toBe(erreur);
    expect(debug).toHaveBeenCalledWith('[sw] update échoué', erreur);
    debug.mockRestore();
  });
});
