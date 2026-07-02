const { person } = require('./config-defaults.cjs');

const name = person.name;

// Textes description / Open Graph / Twitter — un jeu par fichier HTML.
const PAGE_META = {
  'index.html': {
    ogTitle: `${name} · Développeur Web`,
    twitterTitle: `${name} · Développeur Web`,
    description: `Portfolio de ${name}, développeur web junior — reconversion, projets LSF et Floppy Bird, stage client. La Jarne · La Rochelle · premier poste.`,
    ogDescription:
      'Développeur web junior — projets concrets, parcours de reconversion, disponible pour un premier poste.',
    twitterDescription: `Portfolio arcade de ${name} — développeur web junior, La Rochelle.`,
  },
  'projets.html': {
    ogTitle: `Projets · ${name}`,
    twitterTitle: `Projets · ${name}`,
    description:
      'Projets web : LSF (Express/MongoDB), Floppy Bird (PWA), Dernière Ligne (Tetris narratif), GameHub, site WordPress HubTraining, Pixel Quest.',
    ogDescription:
      'WORK — projets développeur web : full-stack, jeu Phaser, client réel WordPress.',
    twitterDescription: `Sélection de projets web — portfolio ${name}.`,
  },
  'competences.html': {
    ogTitle: `Compétences · ${name}`,
    twitterTitle: `Compétences · ${name}`,
    description:
      'Stack technique : HTML/CSS/JS, Node/Express, Phaser, WordPress, SQL, Angular et Java en cours.',
    ogDescription: 'STATS — niveaux par techno et soft skills.',
    twitterDescription: `Compétences développeur web — ${name}.`,
  },
  'parcours.html': {
    ogTitle: `Parcours · ${name}`,
    twitterTitle: `Parcours · ${name}`,
    description:
      'Parcours agro → dev web : master sciences du végétal, BIOTEK/UNILET, TP, stage HubTraining, formation continue.',
    ogDescription: 'STORY — timeline de reconversion vers le développement web.',
    twitterDescription: `Parcours professionnel — ${name}.`,
  },
  'contact.html': {
    ogTitle: `Contact · ${name}`,
    twitterTitle: `Contact · ${name}`,
    description: `Contact et CV — ${name}, développeur web junior, La Jarne (17220), disponible pour opportunités.`,
    ogDescription: 'CONTACT — formulaire, téléchargement du CV, premier poste recherché.',
    twitterDescription: `Contacter ${name} — développeur web.`,
  },
  'dojo.html': {
    ogTitle: `Dojo · ${name}`,
    twitterTitle: `Dojo · ${name}`,
    description:
      'Dojo — exercices et boss techniques : DOM, Express, EJS, SQL, stack web, Angular et Java en cours.',
    ogDescription: 'Entraînements et mini-projets hors portfolio principal.',
    twitterDescription: `Boss rush technique — portfolio ${name}.`,
  },
  'mentions-legales.html': {
    ogTitle: `Mentions légales · ${name}`,
    twitterTitle: `Mentions légales · ${name}`,
    description: `Mentions légales du portfolio ${name} — éditeur, hébergement, données personnelles.`,
    ogDescription: 'Éditeur, hébergement, propriété intellectuelle, RGPD et cookies.',
    twitterDescription: `Mentions légales & confidentialité — portfolio ${name}.`,
  },
};

module.exports = { PAGE_META };
