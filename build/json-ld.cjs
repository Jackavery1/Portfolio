/** JSON-LD Person / WebSite / WebPage injecté au build. */
const PERSON = {
  name: 'Joris Martinez',
  jobTitle: 'Développeur web junior',
  github: 'https://github.com/Jackavery1',
  locality: 'La Jarne',
  postalCode: '17220',
  country: 'FR',
  siteName: 'Joris Martinez · Portfolio',
};

function personNode(siteBase) {
  return {
    '@type': 'Person',
    '@id': `${siteBase}/#person`,
    name: PERSON.name,
    jobTitle: PERSON.jobTitle,
    url: `${siteBase}/`,
    image: `${siteBase}/assets/og.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: PERSON.locality,
      postalCode: PERSON.postalCode,
      addressCountry: PERSON.country,
    },
    sameAs: [PERSON.github],
  };
}

function webSiteNode(siteBase) {
  return {
    '@type': 'WebSite',
    '@id': `${siteBase}/#website`,
    name: PERSON.siteName,
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

module.exports = { buildJsonLd, jsonLdScriptTag, personNode, webSiteNode, webPageNode };
