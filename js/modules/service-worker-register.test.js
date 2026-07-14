import { beforeEach, describe, expect, it, vi } from 'vitest';
import { injecterCspProd } from '../test-fixtures/csp-prod.js';
import {
  creerNavigatorServiceWorker,
  creerRegistrationAvecWaiting,
  creerRegistrationUpdateFound,
} from '../test-fixtures/service-worker-mock.js';

describe('service-worker-register', () => {
  let register;

  beforeEach(() => {
    vi.resetModules();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    const nav = creerNavigatorServiceWorker();
    register = nav.register;
    vi.stubGlobal('navigator', nav.navigator);
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
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    window.dispatchEvent(new Event('load'));
    await vi.waitFor(() => {
      expect(debug).toHaveBeenCalledWith('[sw] enregistrement échoué', erreur);
    });
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

  it('affiche le toast si un worker attend une mise à jour', async () => {
    injecterCspProd();
    const waiting = { postMessage: vi.fn() };
    const { navigator } = creerRegistrationAvecWaiting({ waiting });
    vi.stubGlobal('navigator', navigator);

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    const toast = document.getElementById('js-sw-toast');
    expect(toast).not.toBeNull();
    expect(toast.hidden).toBe(false);
    toast.querySelector('.sw-toast__bouton').click();
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });

  it('masque le toast au clic sur fermer', async () => {
    injecterCspProd();
    const { navigator } = creerRegistrationAvecWaiting({
      waiting: { postMessage: vi.fn() },
    });
    vi.stubGlobal('navigator', navigator);

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    const toast = document.getElementById('js-sw-toast');
    toast.querySelector('.sw-toast__fermer').click();
    expect(toast.hidden).toBe(true);
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

  it('affiche le toast après updatefound + statechange installed', async () => {
    injecterCspProd();
    const { navigator, registration, handlers, worker } = creerRegistrationUpdateFound();
    vi.stubGlobal('navigator', navigator);

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    registration.waiting = { postMessage: vi.fn() };
    handlers.updatefound?.();
    worker.state = 'installed';
    handlers.statechange?.();

    const toast = document.getElementById('js-sw-toast');
    expect(toast).not.toBeNull();
    expect(toast.hidden).toBe(false);
  });

  it('recharge la page après controllerchange si mise à jour demandée', async () => {
    injecterCspProd();
    let onControllerChange;
    const waiting = { postMessage: vi.fn() };
    const { navigator } = creerRegistrationAvecWaiting({
      waiting,
      onControllerChange: (fn) => {
        onControllerChange = fn;
      },
    });
    vi.stubGlobal('navigator', navigator);
    const reload = vi.fn();
    vi.stubGlobal('location', { hostname: 'localhost', search: '', reload });

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    document.getElementById('js-sw-toast').querySelector('.sw-toast__bouton').click();
    onControllerChange();

    expect(reload).toHaveBeenCalled();
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });

  it('n’injecte qu’un seul élément toast dans le DOM', async () => {
    injecterCspProd();
    const { navigator } = creerRegistrationAvecWaiting({
      waiting: { postMessage: vi.fn() },
    });
    vi.stubGlobal('navigator', navigator);

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    expect(document.querySelectorAll('#js-sw-toast')).toHaveLength(1);
  });

  it('n’affiche pas le toast si waiting sans controller actif', async () => {
    injecterCspProd();
    const { navigator } = creerRegistrationAvecWaiting({
      waiting: { postMessage: vi.fn() },
      controller: null,
    });
    vi.stubGlobal('navigator', navigator);

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    expect(document.getElementById('js-sw-toast')).toBeNull();
  });
});
