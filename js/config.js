/* ============================================
   Configuration globale et constantes
   ============================================ */

export const CONFIG = {
  SITE_ORIGIN: "https://jackavery1.github.io/Portfolio",

  STORAGE: {
    SCORE_KEY: "jm_portfolio_score",
    PAGE_PREFIX: "jm_page_",
    HS_POPUP_VU: "hs_popup_vu",
    CONTACT_LAST_SUBMIT: "jm_contact_last_submit",
  },

  CONTACT: {
    EMAIL_B64: "am9yaXNkYXZpZC5tYXJ0aW5lei5wcm9AZ21haWwuY29t",
    PHONE_PARTS: [6, 74, 52, 24, 96],
    FORMSPREE_ENDPOINT: "https://formspree.io/f/mlgzkqbz",
    /* Clé SITE Google reCAPTCHA */
    RECAPTCHA_SITE_KEY: "6Lc3f_csAAAAABC3ubiYwYolwRlS4XEolAMLnlqw",
    RECAPTCHA_VERSION: 3,
    HONEYPOT_NAME: "_gotcha",
    RATE_LIMIT_MS: 60_000,
    LIMITS: { nom: 120, email: 254, message: 5000 },
  },

  SELECTORS: {
    SCORE: "js-score",
    MODAL: "js-modal",
    MODAL_TITRE: "js-modal-titre",
    MODAL_IMG: "js-modal-img",
    MODAL_DESC: "js-modal-desc",
    MODAL_TECH: "js-modal-tech",
    MODAL_FERMER: "js-modal-fermer",
    BURGER: "js-burger",
    MENU: "js-menu",
    FORMULAIRE: "js-formulaire",
    BTN_ENVOYER: "js-btn-envoyer",
    CONFIRMATION: "js-confirmation",
    POPUP_HS: "js-popup-hs",
    POPUP_HS_FERMER: "js-popup-hs-fermer",
    CONTACT_NOM: "contact-nom",
    CONTACT_EMAIL: "contact-email",
    CONTACT_MESSAGE: "contact-message",
    CONTACT_SUJET: "contact-sujet",
    CONTACT_HONEYPOT: "contact-website",
    RECAPTCHA_MOUNT: "js-recaptcha-mount",
    CONTACT_ERREUR: "js-formulaire-erreur",
    CONTACT_EMAIL_DISPLAY: "js-contact-email",
    CONTACT_PHONE_DISPLAY: "js-contact-phone",
    MENTIONS_EMAIL_LINK: "js-mentions-email",
    CANONICAL: "link-canonical",
    OG_URL: "meta-og-url",
    MODAL_LIEN: "js-modal-lien",
  },

  NAVIGATION: {
    ORDER: [
      "index.html",
      "projets.html",
      "competences.html",
      "parcours.html",
      "contact.html",
    ],
  },

  KONAMI: {
    SEQUENCE: [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ],
  },

  PARTIALS: [
    { id: "partial-nav", fichier: "partials/nav.html" },
    { id: "partial-footer", fichier: "partials/footer.html" },
    { id: "partial-marquee", fichier: "partials/marquee.html" },
    { id: "partial-crt", fichier: "partials/crt.html" },
    { id: "partial-popup-hs", fichier: "partials/popup-highscore.html" },
  ],

  PROJETS: {
    lsf: {
      titre: "PROJET LSF",
      desc: "Application web d'apprentissage de la Langue des Signes Française. Dictionnaire visuel, quiz, ressources. Projet fil rouge TP Dev Web — l'un des plus aboutis côté stack full-stack (Express, MongoDB, auth). De nombreuses fonctionnalités encore à venir (60%).",
      tech: ["Express", "Mongoose", "Tailwind", "bcrypt"],
      apercu: "assets/previews/lsf.png",
      lien: "https://github.com/Jackavery1/ProjetLSF",
    },
    floppybird: {
      titre: "FLOPPY BIRD",
      desc: "Clone arcade type Flappy Bird — Phaser 3, scores locaux, trois difficultés, audio Web Audio. PWA installable, tests Vitest, déployé sur GitHub Pages. Projet personnel mené à terme (100%).",
      tech: ["Phaser 3", "JavaScript", "PWA", "Vitest"],
      apercu: "assets/previews/floppybird.png",
      lien: "https://github.com/Jackavery1/Floppy-Bird",
      lienLabel: "▶ Voir le dépôt GitHub",
    },
    gamehub: {
      titre: "GAMEHUB RETRO",
      desc: "Hub de jeux rétro — catalogue de jeux, gestion de compte utilisateur, interface d'émulation. Les émulateurs sont en cours d'intégation (70%).",
      tech: ["Node.js", "MongoDB", "EJS", "Tailwind CSS"],
      apercu: "assets/previews/gamehub.png",
      lien: "https://github.com/Jackavery1/GameHub.-retro",
    },
    hub: {
      titre: "HUBTRAINING",
      desc: "Site WordPress pour un client réel (HubTraining). Intégration Gutenberg, optimisation SEO, sécurité renforcée, UX/UI, formulaire de réservation. Quasi finalisé (98%).",
      tech: ["WordPress", "Gutenberg", "SEO", "ACF"],
      apercu: "assets/previews/hub.png",
      lien: "https://h-training.fr/",
      lienLabel: "▶ Voir le site client",
    },
    pixelquest: {
      titre: "PIXEL QUEST",
      desc: "Plateforme 2D dans le navigateur — moteur ECS léger, physique AABB, rendu Canvas 2D et audio Web Audio. Niveaux, arène boss, progression sauvegardée. Démo originale inspirée des jeux 8 bits, sans dépendance npm.",
      tech: ["JavaScript", "Canvas 2D", "ECS", "Web Audio"],
      apercu: "assets/previews/pixelquest.png",
      lien: "https://github.com/Jackavery1/Pixel-quest",
    },
  },
};
