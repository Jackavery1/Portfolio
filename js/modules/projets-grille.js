import { CONFIG } from '../config/index.js';
import { PROJETS_ORDER } from '../config/projects.js';
import { PROJECT_ICONS } from '../config/project-icons.js';

function libelleEtoiles(n) {
  const count = Math.max(0, Math.min(3, Number(n) || 0));
  return `${'★'.repeat(count)}${'☆'.repeat(3 - count)}`;
}

function etiquettesHtml(tech) {
  return tech.map((t) => `<li>${t}</li>`).join('');
}

function creerCarte(id, data) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'carte-projet';
  btn.id = `carte-projet-${id}`;
  btn.dataset.projet = id;
  btn.setAttribute('aria-label', data.ariaLabel || `Ouvrir le projet ${data.titre}`);

  const icone = PROJECT_ICONS[id] || '';

  btn.innerHTML = `
    <div class="carte-projet__entete">
      <span class="carte-projet__num">${data.num}</span>
      <div class="carte-projet__icone" aria-hidden="true">${icone}</div>
      <span class="carte-projet__diff" aria-label="${data.etoiles} étoiles">${libelleEtoiles(data.etoiles)}</span>
    </div>
    <span class="carte-projet__nom">${data.titre}</span>
    <p class="carte-projet__desc">${data.descCarte}</p>
    <ul class="etiquettes-tech">${etiquettesHtml(data.tech)}</ul>
    <div class="barre-completion">
      <div class="barre-completion__fond">
        <div class="barre-completion__fill" style="--cible: ${data.completion}%"></div>
      </div>
      <span class="barre-completion__val">${data.completion}%</span>
    </div>
    <p class="carte-projet__clic-hint" aria-hidden="true">↩ cliquer pour aperçu</p>
  `;

  return btn;
}

export function initProjetsGrille() {
  const grille = document.getElementById('js-grille-projets');
  const sommaire = document.getElementById('js-projets-sommaire');
  if (!grille) return;

  grille.replaceChildren();
  const liste = document.createElement('ul');
  liste.className = 'projets-sommaire__liste';

  PROJETS_ORDER.forEach((id) => {
    const data = CONFIG.PROJETS[id];
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

  grille.removeAttribute('aria-busy');
}
