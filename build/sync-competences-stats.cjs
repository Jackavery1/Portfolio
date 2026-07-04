const fs = require('fs');
const path = require('path');

const FRAGMENTS = [
  'partials/competences/_head.html',
  'partials/competences/scores-tableau.html',
  'partials/competences/stats-lateral.html',
  'partials/competences/_foot.html',
];

function syncCompetencesStats(root = path.join(__dirname, '..')) {
  const target = path.join(root, 'partials', 'competences-stats.html');
  const parts = FRAGMENTS.map((rel) => {
    const filePath = path.join(root, rel);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fragment manquant : ${rel}`);
    }
    return fs.readFileSync(filePath, 'utf8').trimEnd();
  });
  fs.writeFileSync(target, `${parts.join('\n')}\n`, 'utf8');
}

module.exports = { syncCompetencesStats, FRAGMENTS };

if (require.main === module) {
  syncCompetencesStats();
}
