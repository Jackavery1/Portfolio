const TAGS_AUTORISES = new Set(['STRONG', 'CODE', 'A', 'BR']);

function copierAttributsAutorises(source, cible) {
  if (source.tagName === 'A') {
    const href = source.getAttribute('href');
    if (href && !/^javascript:/i.test(href)) {
      cible.setAttribute('href', href);
    }
    const rel = source.getAttribute('rel');
    if (rel) cible.setAttribute('rel', rel);
    const target = source.getAttribute('target');
    if (target) cible.setAttribute('target', target);
  }
}

function clonerNoeudAutorise(noeud) {
  if (noeud.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(noeud.textContent);
  }

  if (noeud.nodeType !== Node.ELEMENT_NODE) return null;

  const tag = noeud.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE') return null;

  if (!TAGS_AUTORISES.has(tag)) {
    const fragment = document.createDocumentFragment();
    noeud.childNodes.forEach((enfant) => {
      const clone = clonerNoeudAutorise(enfant);
      if (clone) fragment.appendChild(clone);
    });
    return fragment;
  }

  const el = document.createElement(tag.toLowerCase());
  copierAttributsAutorises(noeud, el);
  noeud.childNodes.forEach((enfant) => {
    const clone = clonerNoeudAutorise(enfant);
    if (clone) el.appendChild(clone);
  });
  return el;
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function appendRichHtml(conteneur, html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.body.childNodes.forEach((noeud) => {
    const clone = clonerNoeudAutorise(noeud);
    if (clone) conteneur.appendChild(clone);
  });
}

export function paragrapheRichHtml(html) {
  const p = document.createElement('p');
  appendRichHtml(p, html);
  return p;
}
