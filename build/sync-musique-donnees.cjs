const fs = require('fs');
const path = require('path');

const MESURES_PAR_BOUCLE = 8;

function resoudreNote(valeur, gammes) {
  if (typeof valeur === 'number') return valeur;
  if (!valeur) return 0;
  const freq = gammes[valeur];
  if (!freq) throw new Error(`Note inconnue: ${valeur}`);
  return freq;
}

function resoudreMesure(ligne, gammes) {
  return ligne.map((cellule) => resoudreNote(cellule, gammes));
}

function resoudreMotif(motif, mesures, gammes) {
  if (!motif) return null;
  if (motif.type === 'sequence') {
    return motif.mesures.map((nom) => resoudreMesure(mesures[nom], gammes));
  }
  if (motif.type === 'repeat8') {
    const mesure = resoudreMesure(mesures[motif.mesure], gammes);
    return Array.from({ length: MESURES_PAR_BOUCLE }, () => [...mesure]);
  }
  if (motif.type === 'notes') {
    return motif.notes.map((note) => resoudreNote(note, gammes));
  }
  throw new Error(`Motif inconnu: ${motif.type}`);
}

function compilerThemes(donnees) {
  const gammes = { ...donnees.gamme, ...donnees.gammePhrygienne };
  const motifsResolus = Object.fromEntries(
    Object.entries(donnees.motifs).map(([cle, motif]) => [
      cle,
      resoudreMotif(motif, donnees.mesures, gammes),
    ])
  );

  const themes = {};
  Object.entries(donnees.themes).forEach(([cle, theme]) => {
    themes[cle] = {
      bpm: theme.bpm,
      facteurTempo: theme.facteurTempo,
      basse: theme.basse ? motifsResolus[theme.basse] : null,
      melodie: theme.melodie ? motifsResolus[theme.melodie] : null,
      arpege: theme.arpege ? motifsResolus[theme.arpege] : null,
      kick: theme.kick ? motifsResolus[theme.kick] : null,
      hat: theme.hat ? motifsResolus[theme.hat] : null,
      snare: theme.snare ? motifsResolus[theme.snare] : null,
      nappe: theme.nappe ? motifsResolus[theme.nappe] : null,
      vibrato: theme.vibrato,
      doubleArpege: theme.doubleArpege,
    };
  });

  return {
    GAMME: donnees.gamme,
    GAMME_PHYRGIENNE: donnees.gammePhrygienne,
    THEMES: themes,
    THEME_PAR_SECTION: donnees.themeParSection,
    THEME_PAR_FICHIER: donnees.themeParFichier,
  };
}

function genererMusiqueThemesJson(compiled) {
  return `${JSON.stringify({
    GAMME: compiled.GAMME,
    GAMME_PHYRGIENNE: compiled.GAMME_PHYRGIENNE,
    THEMES: compiled.THEMES,
    THEME_PAR_SECTION: compiled.THEME_PAR_SECTION,
    THEME_PAR_FICHIER: compiled.THEME_PAR_FICHIER,
  })}\n`;
}

function syncMusiqueDonnees(root = path.join(__dirname, '..')) {
  const jsonPath = path.join(root, 'js', 'config', 'musique-donnees.json');
  const outPath = path.join(root, 'js', 'config', 'musique-themes.json');
  const legacyJs = path.join(root, 'js', 'config', 'musique-themes.js');

  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Source manquante: ${jsonPath}`);
  }

  const donnees = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const compiled = compilerThemes(donnees);
  fs.writeFileSync(outPath, genererMusiqueThemesJson(compiled), 'utf8');

  if (fs.existsSync(legacyJs)) {
    fs.rmSync(legacyJs);
  }
}

module.exports = { syncMusiqueDonnees, compilerThemes };

if (require.main === module) {
  syncMusiqueDonnees();
  console.log('✅ js/config/musique-themes.json synchronisé');
}
