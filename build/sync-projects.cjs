const fs = require('fs');
const path = require('path');

const CHAMPS_REQUIS = [
  'titre',
  'desc',
  'descCarte',
  'num',
  'etoiles',
  'completion',
  'tech',
  'apercu',
  'lien',
  'ariaLabel',
];

function validerProjet(id, projet) {
  if (!projet || typeof projet !== 'object') {
    throw new Error(`projects.json : projet "${id}" invalide`);
  }

  CHAMPS_REQUIS.forEach((champ) => {
    const valeur = projet[champ];
    if (valeur == null || valeur === '') {
      throw new Error(`projects.json : "${id}".${champ} manquant`);
    }
  });

  if (!/^(PRJ|STG)-\d+$/.test(projet.num)) {
    throw new Error(`projects.json : "${id}".num invalide (${projet.num})`);
  }

  const etoiles = Number(projet.etoiles);
  if (!Number.isFinite(etoiles) || etoiles < 1 || etoiles > 3) {
    throw new Error(`projects.json : "${id}".etoiles hors plage 1–3`);
  }

  const completion = Number(projet.completion);
  if (!Number.isFinite(completion) || completion < 0 || completion > 100) {
    throw new Error(`projects.json : "${id}".completion hors plage 0–100`);
  }

  if (!Array.isArray(projet.tech) || projet.tech.length === 0) {
    throw new Error(`projects.json : "${id}".tech doit être un tableau non vide`);
  }

  if (!/^assets\/previews\/.+\.png$/.test(projet.apercu)) {
    throw new Error(`projects.json : "${id}".apercu invalide`);
  }

  if (!/^https:\/\//.test(projet.lien)) {
    throw new Error(`projects.json : "${id}".lien doit être une URL https`);
  }
}

function validerProjectsJson(data) {
  const { order, projets } = data;

  if (!Array.isArray(order) || order.length === 0) {
    throw new Error('projects.json : order doit être un tableau non vide');
  }
  if (!projets || typeof projets !== 'object') {
    throw new Error('projects.json : projets manquant');
  }

  order.forEach((id) => {
    if (!projets[id]) {
      throw new Error(`projects.json : projet "${id}" absent de projets`);
    }
    validerProjet(id, projets[id]);
  });

  const cles = Object.keys(projets).sort();
  const ordreTrie = [...order].sort();
  if (cles.join(',') !== ordreTrie.join(',')) {
    throw new Error('projects.json : order et clés projets incohérents');
  }
}

function syncProjects(root = path.join(__dirname, '..')) {
  const source = path.join(root, 'js', 'config', 'projects.json');
  const target = path.join(root, 'js', 'config', 'projects-data.js');
  const data = JSON.parse(fs.readFileSync(source, 'utf8'));

  validerProjectsJson(data);

  const content = `/* Généré par build/sync-projects.cjs — ne pas éditer à la main. */
export const PROJETS_ORDER = ${JSON.stringify(data.order, null, 2)};

export const PROJETS = ${JSON.stringify(data.projets, null, 2)};
`;
  fs.writeFileSync(target, content, 'utf8');
}

module.exports = { syncProjects, validerProjectsJson, validerProjet };

if (require.main === module) {
  syncProjects();
}
