import { CONFIGURATION } from '../config/index.js';
import { PROJETS_ORDER, ICONES_PROJETS } from '../config/projects.js';
import { echapperHtml } from '../utils/rich-text.js';

function libelleEtoiles(n) {
  const count = Math.max(0, Math.min(3, Number(n) || 0));
  return `${'★'.repeat(count)}${'☆'.repeat(3 - count)}`;
}

function etiquettesHtml(tech) {
  return tech.map((t) => `<li>${echapperHtml(t)}</li>`).join('');
}

function creerCarte(id, data) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'carte-projet';
  btn.id = `carte-projet-${id}`;
  btn.dataset.projet = id;
  btn.setAttribute('aria-label', data.ariaLabel || `Ouvrir le projet ${data.titre}`);

  const icone = ICONES_PROJETS[id] || '';

  btn.innerHTML = `
    <div class="carte-projet__entete">
      <span class="carte-projet__num">${echapperHtml(data.num)}</span>
      <div class="carte-projet__icone" aria-hidden="true">${icone}</div>
      <span class="carte-projet__diff" aria-hidden="true">${libelleEtoiles(data.etoiles)}</span>
    </div>
    <span class="carte-projet__nom">${echapperHtml(data.titre)}</span>
    <p class="carte-projet__desc">${echapperHtml(data.descCarte)}</p>
    <ul class="etiquettes-tech">${etiquettesHtml(data.tech)}</ul>
    <div class="barre-completion">
      <div class="barre-completion__fond">
        <div class="barre-completion__fill" style="--cible: ${Number(data.completion) || 0}%"></div>
      </div>
      <span class="barre-completion__val">${echapperHtml(data.completion)}%</span>
    </div>
    <p class="carte-projet__clic-hint" aria-hidden="true">↩ cliquer pour aperçu</p>
  `;

  return btn;
}

export function initialiserGrilleProjets() {
  const grille = document.getElementById('js-grille-projets');
  const sommaire = document.getElementById('js-projets-sommaire');
  if (!grille) return;

  grille.replaceChildren();
  const liste = document.createElement('ul');
  liste.className = 'projets-sommaire__liste';

  PROJETS_ORDER.forEach((id) => {
    const data = CONFIGURATION.PROJETS[id];
    if (!data) return;

    grille.appendChild(creerCarte(id, data));

    const li = document.createElement('li');
    const lien = document.createElement('a');
    lien.href = `#carte-projet-${id}`;
    lien.textContent = data.titre;
    li.append(lien);
    liste.append(li);
  });

  if (sommaire) {
    sommaire.replaceChildren(liste);
  }

  const nombre = grille.querySelectorAll('.carte-projet').length;
  grille.removeAttribute('aria-busy');
  grille.setAttribute('aria-label', `${nombre} projets disponibles`);
}
