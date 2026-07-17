/* Enregistrement service worker et notification de mise à jour */

import { estBuildProd, estEnvironnementDevLocal } from '../utils/dev-mode.js';

let toastAffiche = false;
let rechargementPlanifie = false;
let hintDevSansSwAffiche = false;

function signalerModeDevSansSw() {
  if (hintDevSansSwAffiche || estBuildProd()) return;
  hintDevSansSwAffiche = true;
  if (estEnvironnementDevLocal()) {
    console.debug(
      '[sw] Service worker inactif en dev (npm start). PWA / offline : npm run build && npm run start:prod'
    );
  }
}

function injecterToast() {
  if (document.getElementById('js-sw-toast')) return;

  const toast = document.createElement('div');
  toast.id = 'js-sw-toast';
  toast.className = 'sw-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.hidden = true;
  toast.innerHTML = `
    <p class="sw-toast__texte">Nouvelle version disponible.</p>
    <div class="sw-toast__actions">
      <button type="button" class="sw-toast__bouton bouton-arcade">Actualiser</button>
      <button type="button" class="sw-toast__fermer" aria-label="Fermer la notification">×</button>
    </div>
  `;
  document.body.appendChild(toast);
}

function masquerToast() {
  const toast = document.getElementById('js-sw-toast');
  if (toast) toast.hidden = true;
}

function afficherToastMiseAJour(registration) {
  if (toastAffiche || !registration.waiting) return;
  toastAffiche = true;
  injecterToast();

  const toast = document.getElementById('js-sw-toast');
  const boutonActualiser = toast.querySelector('.sw-toast__bouton');
  const boutonFermer = toast.querySelector('.sw-toast__fermer');

  toast.hidden = false;

  boutonActualiser.addEventListener('click', () => {
    rechargementPlanifie = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  });

  boutonFermer.addEventListener('click', () => {
    toastAffiche = false;
    masquerToast();
  });
}

function ecouterMiseAJour(registration) {
  if (registration.waiting && navigator.serviceWorker.controller) {
    afficherToastMiseAJour(registration);
  }

  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    if (!worker) return;

    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) {
        afficherToastMiseAJour(registration);
      }
    });
  });
}

function brancherRechargementApresMiseAJour() {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (rechargementPlanifie) {
      window.location.reload();
    }
  });
}

export function enregistrerServiceWorker() {
  if (!('serviceWorker' in navigator) || !estBuildProd()) {
    signalerModeDevSansSw();
    return;
  }

  brancherRechargementApresMiseAJour();

  const enregistrer = () => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('sw.js')
      .then((registration) => {
        ecouterMiseAJour(registration);
        registration.update().catch((err) => {
          if (estEnvironnementDevLocal()) {
            console.debug('[sw] update échoué', err);
          }
        });
      })
      .catch((err) => {
        if (estEnvironnementDevLocal()) {
          console.debug('[sw] enregistrement échoué', err);
        }
      });
  };

  if (document.readyState === 'complete') {
    enregistrer();
  } else {
    window.addEventListener('load', enregistrer, { once: true });
  }
}
