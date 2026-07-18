/** Détection build prod vs dev local (CSP injectée au build). */

export function estBuildProd() {
  return Boolean(document.querySelector('meta[http-equiv="Content-Security-Policy"]'));
}

export function estEnvironnementDevLocal() {
  return (
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    new URLSearchParams(location.search).has('dev')
  );
}
