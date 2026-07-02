import { LEGAL, LEGAL_ANCHOR_LABELS } from '../config/legal.js';
import { decodeBase64Utf8 } from '../utils/pii.js';
import { CONFIG } from '../config/index.js';
import { appendRichHtml, paragrapheRichHtml } from '../utils/rich-text.js';

function listeHtml(items) {
  const ul = document.createElement('ul');
  items.forEach((item) => {
    const li = document.createElement('li');
    appendRichHtml(li, item);
    ul.appendChild(li);
  });
  return ul;
}

function blocEditeur() {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = CONFIG.PERSON_NAME;
  p.appendChild(strong);
  p.appendChild(document.createTextNode(' — site personnel (portfolio).'));
  p.appendChild(document.createElement('br'));
  p.appendChild(document.createTextNode('Contact : '));

  const lien = document.createElement('a');
  lien.id = CONFIG.SELECTORS.MENTIONS_EMAIL_LINK;
  lien.href = '#';
  lien.hidden = true;
  lien.textContent = 'Chargement…';
  p.appendChild(lien);

  const noscript = document.createElement('noscript');
  const fallback = document.createElement('a');
  const email = decodeBase64Utf8(CONFIG.CONTACT.EMAIL_B64);
  fallback.href = email ? `mailto:${email}` : '#';
  fallback.textContent = email || 'contact@example.com';
  noscript.appendChild(fallback);
  p.appendChild(noscript);

  return p;
}

function remplirBlocEditeur(conteneur) {
  const email = decodeBase64Utf8(CONFIG.CONTACT.EMAIL_B64);
  if (!email) return;

  const lien = conteneur.querySelector(`#${CONFIG.SELECTORS.MENTIONS_EMAIL_LINK}`);
  if (lien) {
    lien.href = `mailto:${email}`;
    lien.textContent = email;
    lien.removeAttribute('hidden');
  }
}

function remplirSection(sectionCfg, conteneur) {
  const article = document.createElement('article');
  article.className = 'mentions-bloc';
  if (sectionCfg.id) article.id = sectionCfg.id;

  const h2 = document.createElement('h2');
  h2.textContent = sectionCfg.title;
  article.appendChild(h2);

  if (sectionCfg.intro) {
    article.appendChild(paragrapheRichHtml(sectionCfg.intro));
  }

  sectionCfg.paragraphs?.forEach((texte) => {
    article.appendChild(paragrapheRichHtml(texte));
  });

  sectionCfg.blocks?.forEach((block) => {
    if (block.type === 'editor') {
      const editeur = blocEditeur();
      article.appendChild(editeur);
      remplirBlocEditeur(article);
    }
  });

  sectionCfg.subsections?.forEach((sub) => {
    const div = document.createElement('div');
    div.className = 'mentions-sous-bloc';

    const h3 = document.createElement('h3');
    h3.textContent = sub.title;
    div.appendChild(h3);

    sub.paragraphs?.forEach((texte) => {
      div.appendChild(paragrapheRichHtml(texte));
    });

    if (sub.list?.length) {
      div.appendChild(listeHtml(sub.list));
    }

    article.appendChild(div);
  });

  conteneur.appendChild(article);
}

function remplirSommaire(conteneur) {
  const nav = document.createElement('nav');
  nav.className = 'mentions-sommaire';
  nav.setAttribute('aria-label', 'Sommaire des mentions légales');

  const liste = document.createElement('ul');
  liste.className = 'mentions-sommaire__liste';

  LEGAL_ANCHOR_LABELS.forEach(({ id, label }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${id}`;
    a.textContent = label;
    li.appendChild(a);
    liste.appendChild(li);
  });

  nav.appendChild(liste);
  conteneur.appendChild(nav);
}

export function initMentionsLegales() {
  const intro = document.getElementById('js-mentions-intro');
  if (intro) intro.textContent = LEGAL.intro;

  const sommaire = document.getElementById('js-mentions-sommaire');
  if (sommaire) {
    sommaire.replaceChildren();
    remplirSommaire(sommaire);
  }

  const sections = document.getElementById('js-mentions-sections');
  if (!sections) return;

  sections.replaceChildren();
  LEGAL.sections.forEach((cfg) => remplirSection(cfg, sections));
}
