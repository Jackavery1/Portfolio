const VIEWPORT_META_RE =
  /<meta name="viewport" content="width=device-width, initial-scale=1\.0(?:, viewport-fit=cover)?" \/>/;

const CSP_META = `<meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' https://www.google.com https://www.gstatic.com; style-src 'self'; style-src-attr 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https://www.gstatic.com; frame-src https://www.google.com https://recaptcha.google.com; connect-src 'self' https://formspree.io https://www.google.com https://www.gstatic.com https://recaptcha.google.com; form-action 'self' https://formspree.io; worker-src 'self'; base-uri 'self'; object-src 'none';"
    />`;

function injectCspMeta(html) {
  if (!VIEWPORT_META_RE.test(html) || html.includes('Content-Security-Policy')) {
    return html;
  }
  return html.replace(VIEWPORT_META_RE, (match) => `${match}\n    ${CSP_META}`);
}

module.exports = {
  CSP_META,
  injectCspMeta,
};
