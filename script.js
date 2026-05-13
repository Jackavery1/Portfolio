/* ================================================================
   PORTFOLIO ARCADE CRT v6 — script.js
   Multi-pages, burger, score, barres animées, modal projets, dojo
================================================================ */
'use strict';

async function chargerPartials() {
  const partials = [
    { id: 'partial-nav',       fichier: 'partials/nav.html' },
    { id: 'partial-footer',    fichier: 'partials/footer.html' },
    { id: 'partial-marquee',   fichier: 'partials/marquee.html' },
    { id: 'partial-crt',       fichier: 'partials/crt.html' },
    { id: 'partial-popup-hs',  fichier: 'partials/popup-highscore.html' },
  ];

  await Promise.all(partials.map(async ({ id, fichier }) => {
    const conteneur = document.getElementById(id);
    if (!conteneur) return;
    try {
      const reponse = await fetch(fichier);
      const html    = await reponse.text();
      conteneur.outerHTML = html;
    } catch (e) {
      console.warn(`Partial non chargé : ${fichier}`, e);
    }
  }));

  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__bouton').forEach(lien => {
    if (lien.getAttribute('href') === page) {
      lien.classList.add('actif');
      lien.setAttribute('aria-current', 'page');
    }
  });
}

let ctxAudio = null;

function obtenirContexteAudio() {
  try {
    if (!ctxAudio) ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
    if (ctxAudio.state === 'suspended') ctxAudio.resume().catch(() => {});
    return ctxAudio;
  } catch (_) {
    return null;
  }
}

function jouerBip(frequence = 440, duree = 60, type = 'square') {
  const ctx = obtenirContexteAudio();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequence, ctx.currentTime);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duree / 1000);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duree / 1000);
  } catch (_) {}
}

const SCORE_KEY = 'jm_portfolio_score';

function lireScore() {
  try {
    const raw = sessionStorage.getItem(SCORE_KEY);
    if (raw == null || raw === '') return 0;
    const n = parseInt(String(raw).trim(), 10);
    if (!Number.isFinite(n) || n < 0) {
      sauvegarderScore(0);
      return 0;
    }
    if (n > 9999) {
      sauvegarderScore(9999);
      return 9999;
    }
    return n;
  } catch (_) {
    return 0;
  }
}

function sauvegarderScore(valeur) {
  try {
    const n = Math.max(0, Math.min(Number(valeur) || 0, 9999));
    sessionStorage.setItem(SCORE_KEY, String(n));
  } catch (_) {}
}

function afficherScore(valeur) {
  const n = Math.max(0, Math.min(Number(valeur) || 0, 9999));
  const el = document.getElementById('js-score');
  if (el) el.textContent = String(n).padStart(6, '0');
}

function ajouterScore(pts) {
  const avant = lireScore();
  if (avant >= 9999) return;
  const apres = Math.min(avant + pts, 9999);
  sauvegarderScore(apres);
  afficherScore(apres);
  if (apres >= 9999) {
    setTimeout(afficherPopupHighScore, 600);
  }
}

function afficherPopupHighScore() {
  const popup = document.getElementById('js-popup-hs');
  if (!popup) return;
  const sc = popup.querySelector('.popup-highscore__score');
  if (sc) sc.textContent = String(Math.min(lireScore(), 9999)).padStart(6, '0');
  popup.hidden = false;
  sessionStorage.setItem('hs_popup_vu', '1');
  jouerBip(523, 150, 'square');
  setTimeout(() => jouerBip(659, 150, 'square'), 160);
  setTimeout(() => jouerBip(784, 150, 'square'), 320);
  setTimeout(() => jouerBip(1047, 300, 'square'), 480);
}

function initPopupHighScoreFermer() {
  const btnFermerHS = document.getElementById('js-popup-hs-fermer');
  if (!btnFermerHS || btnFermerHS.dataset.ecouteurHs) return;
  btnFermerHS.dataset.ecouteurHs = '1';
  btnFermerHS.addEventListener('click', () => {
    const pu = document.getElementById('js-popup-hs');
    if (pu) pu.hidden = true;
  });
}

const sectionsAnimees = new Set();

function animerBarresSection(id) {
  if (sectionsAnimees.has(id)) return;
  sectionsAnimees.add(id);
  const section = document.getElementById(id);
  if (!section) return;

  const selecteurs = [
    '.barre-completion__fill',
    '.score-barre',
    '.langue-item__barre',
  ];

  selecteurs.forEach(sel => {
    section.querySelectorAll(sel).forEach(barre => {
      const cible = barre.style.getPropertyValue('--cible') || '0%';
      barre.style.width = '0%';
      requestAnimationFrame(() => requestAnimationFrame(() => { barre.style.width = cible; }));
    });
  });
}

function fermerMenuBurger() {
  const burger = document.getElementById('js-burger');
  const menuNav = document.getElementById('js-menu');
  if (!burger) return;
  burger.setAttribute('aria-expanded', 'false');
  if (menuNav) menuNav.classList.remove('ouvert');
}

function initNavigationArcade() {
  const burger = document.getElementById('js-burger');
  const menuNav = document.getElementById('js-menu');
  if (!burger || !menuNav) return;

  burger.addEventListener('click', () => {
    const estOuvert = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!estOuvert));
    menuNav.classList.toggle('ouvert', !estOuvert);
    jouerBip(estOuvert ? 220 : 330, 40);
  });

  document.addEventListener('click', evt => {
    if (!burger.contains(evt.target) && !menuNav.contains(evt.target)) fermerMenuBurger();
  });

  document.addEventListener('keydown', evt => {
    if (evt.key === 'Escape' && menuNav.classList.contains('ouvert')) {
      fermerMenuBurger();
      burger.focus();
    }
  });
}

const NAV_ORDRE = ['index.html', 'projets.html', 'competences.html', 'parcours.html', 'contact.html'];

function indexNavigationClavier() {
  const file = (window.location.pathname.split('/').pop() || 'index.html').split('?')[0].toLowerCase();
  return NAV_ORDRE.indexOf(file);
}

const modalOverlay = document.getElementById('js-modal');
const modalTitre   = document.getElementById('js-modal-titre');
const modalImg     = document.getElementById('js-modal-img');
const modalDesc    = document.getElementById('js-modal-desc');
const modalTech    = document.getElementById('js-modal-tech');
const btnFermer    = document.getElementById('js-modal-fermer');

document.addEventListener('keydown', evt => {
  if (modalOverlay && !modalOverlay.hidden) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
  if (document.getElementById('js-menu')?.classList.contains('ouvert')) return;
  const idx = indexNavigationClavier();
  if (idx < 0) return;
  if (evt.key === 'ArrowRight' && idx < NAV_ORDRE.length - 1) {
    jouerBip(440, 40);
    window.location.href = NAV_ORDRE[idx + 1];
  }
  if (evt.key === 'ArrowLeft' && idx > 0) {
    jouerBip(330, 40);
    window.location.href = NAV_ORDRE[idx - 1];
  }
});

const PROJETS_DATA = {
  gamehub: {
    titre: 'GAMEHUB RETRO',
    desc:  'Hub de jeux rétro — catalogue de jeux, gestion de compte utilisateur, interface d\'émulation. Les émulateurs sont en cours d\'intégration (70%).',
    tech:  ['Node.js', 'MongoDB', 'EJS', 'Tailwind CSS'],
    img:   'v5_home',
  },
  lsf: {
    titre: 'PROJET LSF',
    desc:  'Application web d\'apprentissage de la Langue des Signes Française. Dictionnaire visuel, quiz, ressources. Projet fil rouge TP Dev Web. De nombreuses fonctionnalités encore à venir (60%).',
    tech:  ['Express', 'Mongoose', 'Tailwind', 'bcrypt'],
    img:   'v5_home',
  },
  hub: {
    titre: 'HUBTRAINING',
    desc:  'Site WordPress pour un client réel (HubTraining). Intégration Gutenberg, optimisation SEO, sécurité renforcée, UX/UI, formulaire de réservation. Quasi finalisé (98%).',
    tech:  ['WordPress', 'Gutenberg', 'SEO', 'ACF'],
    img:   'work',
  },
  renter: {
    titre: 'RENTER-CAR',
    desc:  'Interface de location de voitures. Catalogue filtrable et trié dynamiquement. Bootstrap responsive, manipulation du DOM en JavaScript pur. Projet d\'évaluation.',
    tech:  ['HTML', 'CSS', 'Bootstrap', 'JavaScript DOM'],
    img:   'work',
  },
  idees: {
    titre: 'BOÎTE À IDÉES',
    desc:  'Application inclusive permettant de soumettre des idées, les liker, commenter. Authentification JWT, système de rôles, accessibilité ARIA. (80%)',
    tech:  ['Express', 'MongoDB', 'Tailwind 4', 'JWT'],
    img:   'work',
  },
};

let elementFocusAvantModal = null;

function focusablesModal(container) {
  return [...container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
}

function ouvrirModal(projetKey) {
  const data = PROJETS_DATA[projetKey];
  if (!data || !modalOverlay || !modalTitre || !modalDesc || !modalTech || !modalImg || !btnFermer) return;

  elementFocusAvantModal = document.activeElement;

  modalTitre.textContent = data.titre;
  modalDesc.textContent  = data.desc;

  if (typeof IMG !== 'undefined' && IMG[data.img]) {
    modalImg.src = IMG[data.img];
    modalImg.style.display = 'block';
  } else {
    modalImg.style.display = 'none';
  }

  modalTech.innerHTML = '';
  data.tech.forEach(t => {
    const li = document.createElement('span');
    li.textContent = t;
    li.style.cssText = 'font-family:var(--police-crt);font-size:1rem;color:var(--couleur-accent);border:1px solid var(--couleur-bordure);padding:.1rem .45rem;letter-spacing:1px;';
    modalTech.appendChild(li);
  });

  modalOverlay.hidden = false;
  jouerBip(440, 60, 'sine');
  ajouterScore(50);
  btnFermer.focus();
}

function fermerModal() {
  if (!modalOverlay) return;
  modalOverlay.hidden = true;
  jouerBip(220, 40);
  const prev = elementFocusAvantModal;
  elementFocusAvantModal = null;
  if (prev && typeof prev.focus === 'function') requestAnimationFrame(() => prev.focus());
}

document.addEventListener('keydown', evt => {
  if (!modalOverlay || modalOverlay.hidden) return;
  if (evt.key === 'Escape') {
    evt.preventDefault();
    fermerModal();
    return;
  }
  if (evt.key !== 'Tab') return;
  const list = focusablesModal(modalOverlay);
  if (list.length === 0) return;
  if (list.length === 1) {
    evt.preventDefault();
    list[0].focus();
    return;
  }
  const first = list[0];
  const last = list[list.length - 1];
  if (evt.shiftKey) {
    if (document.activeElement === first) {
      evt.preventDefault();
      last.focus();
    }
  } else if (document.activeElement === last) {
    evt.preventDefault();
    first.focus();
  }
});

document.querySelectorAll('.carte-projet[data-projet]').forEach(carte => {
  carte.addEventListener('click',  () => ouvrirModal(carte.dataset.projet));
  carte.addEventListener('keydown', evt => { if (evt.key === 'Enter' || evt.key === ' ') { evt.preventDefault(); ouvrirModal(carte.dataset.projet); } });
});

if (btnFermer) btnFermer.addEventListener('click', fermerModal);
if (modalOverlay) {
  modalOverlay.addEventListener('click', evt => { if (evt.target === modalOverlay) fermerModal(); });
}

const formulaire = document.getElementById('js-formulaire');
const EMAIL_CONTACT = 'jorisdavid.martinez.pro@gmail.com';

if (formulaire) {
  formulaire.addEventListener('submit', async evt => {
    evt.preventDefault();
    const nom     = document.getElementById('contact-nom')?.value.trim();
    const email   = document.getElementById('contact-email')?.value.trim();
    const message = document.getElementById('contact-message')?.value.trim();

    if (!nom || !email || !message) {
      jouerBip(150, 120, 'sawtooth');
      [document.getElementById('contact-nom'), document.getElementById('contact-email'), document.getElementById('contact-message')].forEach(el => {
        if (el && !el.value.trim()) {
          el.style.borderColor = '#ff4444';
          setTimeout(() => { el.style.borderColor = ''; }, 1500);
        }
      });
      formulaire.reportValidity();
      return;
    }

    const endpoint = formulaire.dataset.formspree?.trim();
    const btnEnvoyer = document.getElementById('js-btn-envoyer');
    const confirmation = document.getElementById('js-confirmation');

    if (endpoint) {
      btnEnvoyer.disabled = true;
      try {
        const fd = new FormData(formulaire);
        const res = await fetch(endpoint, {
          method: 'POST',
          body: fd,
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          if (confirmation) confirmation.hidden = false;
          jouerBip(660, 80, 'sine');
          ajouterScore(500);
          btnEnvoyer.textContent = '✓ ENVOYÉ';
        } else {
          jouerBip(150, 120, 'sawtooth');
          btnEnvoyer.disabled = false;
        }
      } catch (_) {
        jouerBip(150, 120, 'sawtooth');
        btnEnvoyer.disabled = false;
      }
      return;
    }

    const sujetSelect = document.getElementById('contact-sujet');
    const sujetLabel = sujetSelect?.options[sujetSelect.selectedIndex]?.text?.trim() || '';
    const sujetUtile = sujetLabel && !/^—/.test(sujetLabel) ? sujetLabel : '';
    const subject = `[Portfolio] ${sujetUtile ? sujetUtile + ' — ' : ''}${nom}`;
    const body = `De : ${nom} <${email}>\n\n${message}`;
    window.location.href = `mailto:${EMAIL_CONTACT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (confirmation) confirmation.hidden = false;
    jouerBip(660, 80, 'sine');
    ajouterScore(500);
    btnEnvoyer.disabled = true;
    btnEnvoyer.textContent = '✓ ENVOYÉ';
  });
}

const KONAMI_SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let saisieKonami = [];

document.addEventListener('keydown', evt => {
  if (modalOverlay && !modalOverlay.hidden) return;
  const ae = document.activeElement;
  const tag = ae?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (ae?.isContentEditable) return;

  saisieKonami.push(evt.key);
  if (saisieKonami.length > KONAMI_SEQ.length) saisieKonami.shift();
  if (saisieKonami.join(',') === KONAMI_SEQ.join(',')) {
    document.body.classList.toggle('konami-actif');
    [523,659,784,1047].forEach((f,i) => setTimeout(() => jouerBip(f,120,'square'), i*130));
    const k = lireScore();
    if (k < 9999) {
      sauvegarderScore(9999);
      afficherScore(9999);
      setTimeout(afficherPopupHighScore, 600);
    }
  }
});

function initMetaPartage() {
  const pageUrl = window.location.href.split('#')[0];
  const canon = document.getElementById('link-canonical');
  if (canon) canon.href = pageUrl;

  document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach(meta => {
    const raw = meta.getAttribute('content') || '';
    if (raw && !/^https?:\/\//i.test(raw)) {
      meta.setAttribute('content', new URL(raw, window.location.href).href);
    }
  });

  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.setAttribute('content', pageUrl);
}

function initBonusScore() {
  const PAGE_KEY = 'jm_page_' + window.location.pathname;
  if (!sessionStorage.getItem(PAGE_KEY)) {
    sessionStorage.setItem(PAGE_KEY, '1');
    ajouterScore(200);
  }

  document.querySelectorAll('.carte-projet').forEach(carte => {
    carte.addEventListener('click', () => ajouterScore(300));
  });

  document.querySelectorAll('.carte-dojo').forEach(carte => {
    carte.addEventListener('click', () => ajouterScore(150));
  });

  const lienGithub = document.querySelector('.lien-github');
  if (lienGithub) {
    lienGithub.addEventListener('click', () => ajouterScore(500));
  }

  document.querySelectorAll('.carte-projet').forEach(carte => {
    let dejaSurvole = false;
    carte.addEventListener('mouseenter', () => {
      if (!dejaSurvole) {
        ajouterScore(100);
        dejaSurvole = true;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const etaitDejaAuMax = lireScore() >= 9999;
  await chargerPartials();
  const popupHs = document.getElementById('js-popup-hs');
  if (popupHs) popupHs.hidden = true;
  initPopupHighScoreFermer();
  initBonusScore();
  afficherScore(lireScore());
  initMetaPartage();
  initNavigationArcade();
  const sid = document.body.dataset.sectionId || 'accueil';
  setTimeout(() => animerBarresSection(sid), 300);

  if (etaitDejaAuMax && !sessionStorage.getItem('hs_popup_vu')) {
    setTimeout(afficherPopupHighScore, 1000);
  }
});
