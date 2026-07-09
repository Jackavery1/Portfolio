/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

function injecterCspProd() {
  const meta = document.createElement('meta');
  meta.setAttribute('http-equiv', 'Content-Security-Policy');
  meta.setAttribute('content', "default-src 'self'");
  document.head.appendChild(meta);
}

describe('service-worker-register', () => {
  const register = vi.fn();
  const registrationParDefaut = {
    waiting: null,
    update: vi.fn().mockResolvedValue(undefined),
    addEventListener: vi.fn(),
  };

  beforeEach(() => {
    vi.resetModules();
    register.mockReset();
    register.mockResolvedValue(registrationParDefaut);
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    vi.stubGlobal('navigator', {
      serviceWorker: {
        register,
        controller: null,
        addEventListener: vi.fn(),
      },
    });
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
    await vi.waitFor(() => {
      expect(debug).toHaveBeenCalledWith('[sw] enregistrement échoué', erreur);
    });
    debug.mockRestore();
  });

  it('journalise sur 127.0.0.1', async () => {
    injecterCspProd();
    const erreur = new Error('sw fail');
    register.mockRejectedValueOnce(erreur);
    vi.stubGlobal('location', { hostname: '127.0.0.1', search: '' });
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    window.dispatchEvent(new Event('load'));
    await vi.waitFor(() => {
      expect(debug).toHaveBeenCalledWith('[sw] enregistrement échoué', erreur);
    });
    debug.mockRestore();
  });

  it('journalise avec le paramètre ?dev', async () => {
    injecterCspProd();
    const erreur = new Error('sw fail');
    register.mockRejectedValueOnce(erreur);
    vi.stubGlobal('location', { hostname: 'example.com', search: '?dev=1' });
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
    const registration = {
      waiting,
      update: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
    };
    register.mockResolvedValueOnce(registration);
    vi.stubGlobal('navigator', {
      serviceWorker: {
        register,
        controller: {},
        addEventListener: vi.fn(),
      },
    });

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
    const registration = {
      waiting: { postMessage: vi.fn() },
      update: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
    };
    register.mockResolvedValueOnce(registration);
    vi.stubGlobal('navigator', {
      serviceWorker: {
        register,
        controller: {},
        addEventListener: vi.fn(),
      },
    });

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    const toast = document.getElementById('js-sw-toast');
    toast.querySelector('.sw-toast__fermer').click();
    expect(toast.hidden).toBe(true);
  });
});
