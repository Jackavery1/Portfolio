export function injecterCspProd() {
  const meta = document.createElement('meta');
  meta.setAttribute('http-equiv', 'Content-Security-Policy');
  meta.setAttribute('content', "default-src 'self'");
  document.head.appendChild(meta);
}
