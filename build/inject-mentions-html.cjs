const fs = require('fs');
const path = require('path');

const MENTIONS_EMAIL_LINK = 'js-mentions-email';

function lireConstExport(fichier, nom) {
  const src = fs.readFileSync(fichier, 'utf8');
  const re = new RegExp(`export const ${nom} = '([^']*)'`);
  const match = src.match(re);
  return match ? match[1] : '';
}

function lireEmailB64(contactPath) {
  const src = fs.readFileSync(contactPath, 'utf8');
  const match = src.match(/EMAIL_B64:\s*'([^']+)'/);
  return match ? match[1] : '';
}

function decoderEmailB64(b64) {
  if (!b64) return '';
  return Buffer.from(b64, 'base64').toString('utf8');
}

function echapperTexte(texte) {
  return texte
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function paragrapheHtml(texte) {
  return `<p>${texte}</p>`;
}

function listeHtml(items) {
  const lignes = items.map((item) => `<li>${item}</li>`).join('');
  return `<ul>${lignes}</ul>`;
}

function blocEditeur(personName, email) {
  const nom = echapperTexte(personName);
  let contact;
  if (email) {
    const mail = echapperTexte(email);
    contact = `<a id="${MENTIONS_EMAIL_LINK}" href="mailto:${mail}">${mail}</a>`;
  } else {
    contact = `<a id="${MENTIONS_EMAIL_LINK}" href="#" hidden></a>`;
  }
  return `<p><strong>${nom}</strong> — site personnel (portfolio).<br>Contact : ${contact}</p>`;
}

function genererSommaire(sections) {
  const liens = sections
    .map(({ id, title }) => `<li><a href="#${echapperTexte(id)}">${echapperTexte(title)}</a></li>`)
    .join('');
  return `<nav class="mentions-sommaire" aria-label="Sommaire des mentions légales"><ul class="mentions-sommaire__liste">${liens}</ul></nav>`;
}

function genererSections(data, personName, email) {
  return data.sections
    .map((sectionCfg) => {
      const idAttr = sectionCfg.id ? ` id="${echapperTexte(sectionCfg.id)}"` : '';
      let contenu = `<h2>${echapperTexte(sectionCfg.title)}</h2>`;

      if (sectionCfg.intro) {
        contenu += paragrapheHtml(sectionCfg.intro);
      }

      sectionCfg.paragraphs?.forEach((texte) => {
        contenu += paragrapheHtml(texte);
      });

      sectionCfg.blocks?.forEach((block) => {
        if (block.type === 'editor') {
          contenu += blocEditeur(personName, email);
        }
      });

      sectionCfg.subsections?.forEach((sub) => {
        let sousBloc = `<h3>${echapperTexte(sub.title)}</h3>`;
        sub.paragraphs?.forEach((texte) => {
          sousBloc += paragrapheHtml(texte);
        });
        if (sub.list?.length) {
          sousBloc += listeHtml(sub.list);
        }
        contenu += `<div class="mentions-sous-bloc">${sousBloc}</div>`;
      });

      return `<article class="mentions-bloc"${idAttr}>${contenu}</article>`;
    })
    .join('');
}

function injectMentionsHtml(html, root) {
  const legalPath = path.join(root, 'js', 'config', 'legal.json');
  if (!fs.existsSync(legalPath)) return html;

  const data = JSON.parse(fs.readFileSync(legalPath, 'utf8'));
  const defaultsPath = path.join(root, 'js', 'config', 'defaults.js');
  const contactPath = path.join(root, 'js', 'config', 'contact.js');
  const personName = lireConstExport(defaultsPath, 'PERSON_NAME') || 'Joris Martinez';
  const email = decoderEmailB64(lireEmailB64(contactPath));

  const sommaire = genererSommaire(data.sections);
  const sections = genererSections(data, personName, email);

  let out = html;
  out = out.replace(
    /<div id="js-mentions-sommaire"><\/div>/,
    `<div id="js-mentions-sommaire">${sommaire}</div>`
  );
  out = out.replace(
    /<div id="js-mentions-sections" aria-live="polite"><\/div>/,
    `<div id="js-mentions-sections" aria-live="polite">${sections}</div>`
  );
  return out;
}

module.exports = {
  injectMentionsHtml,
  genererSommaire,
  genererSections,
};
