/* ============================================
   Configuration globale et constantes
   ============================================ */

export const CONFIG = {
  STORAGE: {
    SCORE_KEY: 'jm_portfolio_score',
    PAGE_PREFIX: 'jm_page_',
    HS_POPUP_VU: 'hs_popup_vu',
  },

  CONTACT: {
    EMAIL: 'jorisdavid.martinez.pro@gmail.com',
  },

  SELECTORS: {
    SCORE: 'js-score',
    MODAL: 'js-modal',
    MODAL_TITRE: 'js-modal-titre',
    MODAL_IMG: 'js-modal-img',
    MODAL_DESC: 'js-modal-desc',
    MODAL_TECH: 'js-modal-tech',
    MODAL_FERMER: 'js-modal-fermer',
    BURGER: 'js-burger',
    MENU: 'js-menu',
    FORMULAIRE: 'js-formulaire',
    BTN_ENVOYER: 'js-btn-envoyer',
    CONFIRMATION: 'js-confirmation',
    POPUP_HS: 'js-popup-hs',
    POPUP_HS_FERMER: 'js-popup-hs-fermer',
    CONTACT_NOM: 'contact-nom',
    CONTACT_EMAIL: 'contact-email',
    CONTACT_MESSAGE: 'contact-message',
    CONTACT_SUJET: 'contact-sujet',
    CANONICAL: 'link-canonical',
  },

  NAVIGATION: {
    ORDER: ['index.html', 'projets.html', 'competences.html', 'parcours.html', 'contact.html'],
  },

  KONAMI: {
    SEQUENCE: [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ],
  },

  PARTIALS: [
    { id: 'partial-nav', fichier: 'partials/nav.html' },
    { id: 'partial-footer', fichier: 'partials/footer.html' },
    { id: 'partial-marquee', fichier: 'partials/marquee.html' },
    { id: 'partial-crt', fichier: 'partials/crt.html' },
    { id: 'partial-popup-hs', fichier: 'partials/popup-highscore.html' },
  ],

  PROJETS: {
    gamehub: {
      titre: 'GAMEHUB RETRO',
      desc:
        "Hub de jeux rétro — catalogue de jeux, gestion de compte utilisateur, interface d'émulation. Les émulateurs sont en cours d'intégration (70%).",
      tech: ['Node.js', 'MongoDB', 'EJS', 'Tailwind CSS'],
      img: 'v5_home',
    },
    lsf: {
      titre: 'PROJET LSF',
      desc:
        "Application web d'apprentissage de la Langue des Signes Française. Dictionnaire visuel, quiz, ressources. Projet fil rouge TP Dev Web. De nombreuses fonctionnalités encore à venir (60%).",
      tech: ['Express', 'Mongoose', 'Tailwind', 'bcrypt'],
      img: 'v5_home',
    },
    hub: {
      titre: 'HUBTRAINING',
      desc:
        'Site WordPress pour un client réel (HubTraining). Intégration Gutenberg, optimisation SEO, sécurité renforcée, UX/UI, formulaire de réservation. Quasi finalisé (98%).',
      tech: ['WordPress', 'Gutenberg', 'SEO', 'ACF'],
      img: 'work',
    },
    renter: {
      titre: 'RENTER-CAR',
      desc:
        "Interface de location de voitures. Catalogue filtrable et trié dynamiquement. Bootstrap responsive, manipulation du DOM en JavaScript pur. Projet d'évaluation.",
      tech: ['HTML', 'CSS', 'Bootstrap', 'JavaScript DOM'],
      img: 'work',
    },
    idees: {
      titre: 'BOÎTE À IDÉES',
      desc:
        'Application inclusive permettant de soumettre des idées, les liker, commenter. Authentification JWT, système de rôles, accessibilité ARIA. (80%)',
      tech: ['Express', 'MongoDB', 'Tailwind 4', 'JWT'],
      img: 'work',
    },
  },
};
