function estBuildProd() {
  return Boolean(document.querySelector('meta[http-equiv="Content-Security-Policy"]'));
}

export function enregistrerServiceWorker() {
  if (!('serviceWorker' in navigator) || !estBuildProd()) return;

  const enregistrer = () => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('sw.js').catch((err) => {
      const dev =
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1' ||
        new URLSearchParams(location.search).has('dev');
      if (dev) {
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
