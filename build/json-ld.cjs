/** JSON-LD Person / WebSite / WebPage injecté au build. */
const { person, social } = require('./config-defaults.cjs');

function sameAsProfiles() {
  return [social.github, social.linkedin].filter(Boolean);
}

function personNode(siteBase) {
  return {
    '@type': 'Person',
    '@id': `${siteBase}/#person`,
    name: person.name,
    jobTitle: person.jobTitle,
    url: `${siteBase}/`,
    image: `${siteBase}/assets/og.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: person.locality,
      postalCode: person.postalCode,
      addressCountry: person.country,
    },
    sameAs: sameAsProfiles(),
  };
}

function webSiteNode(siteBase) {
  return {
    '@type': 'WebSite',
    '@id': `${siteBase}/#website`,
    name: person.siteName,
    url: `${siteBase}/`,
    inLanguage: 'fr-FR',
    author: { '@id': `${siteBase}/#person` },
  };
}

function webPageNode(htmlFile, siteBase, meta, pageUrl) {
  const page = {
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    name: meta.ogTitle,
    url: pageUrl,
    description: meta.description,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${siteBase}/#website` },
    about: { '@id': `${siteBase}/#person` },
    author: { '@id': `${siteBase}/#person` },
  };

  if (htmlFile === 'contact.html') {
    page.mainEntity = { '@id': `${siteBase}/#person` };
  }

  return page;
}

function buildJsonLd(htmlFile, siteBase, meta, pageUrl) {
  if (!meta?.ogTitle) return null;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      personNode(siteBase),
      webSiteNode(siteBase),
      webPageNode(htmlFile, siteBase, meta, pageUrl),
    ],
  };
}

function jsonLdScriptTag(payload) {
  return `<script type="application/ld+json">\n${JSON.stringify(payload, null, 2)}\n    </script>`;
}

module.exports = { buildJsonLd, jsonLdScriptTag };
