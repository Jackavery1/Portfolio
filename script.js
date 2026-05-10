/* ================================================================
   PORTFOLIO ARCADE CRT v6 — script.js
   Navigation, burger, score, barres animées, modal projets, dojo
================================================================ */
'use strict';

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

/* ---------------------------------------------------------------- SON */
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

/* ---------------------------------------------------------------- SCORE */
let scoreActuel = 0;

function ajouterScore(pts) {
  scoreActuel += pts;
  const el = document.getElementById('js-score');
  if (el) el.textContent = String(scoreActuel).padStart(6, '0');
}

function animerScoreInitial() {
  const cible = 1337; const steps = 30; const delta = Math.ceil(cible / steps);
  let n = 0;
  const iv = setInterval(() => {
    scoreActuel = Math.min(scoreActuel + delta, cible);
    const el = document.getElementById('js-score');
    if (el) el.textContent = String(scoreActuel).padStart(6, '0');
    if (++n >= steps) clearInterval(iv);
  }, 40);
}

/* ---------------------------------------------------------------- BARRES ANIMÉES */
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

/* ---------------------------------------------------------------- NAVIGATION */
const boutons  = document.querySelectorAll('.nav__bouton');
const sections = document.querySelectorAll('.section');

function activerSection(cibleId) {
  boutons.forEach(btn => {
    const actif = btn.dataset.cible === cibleId;
    btn.classList.toggle('actif', actif);
    btn.setAttribute('aria-selected', String(actif));
  });
  sections.forEach(s => {
    const visible = s.id === cibleId;
    s.classList.toggle('actif', visible);
    s.hidden = !visible;
  });
  jouerBip(300, 50, 'square');
  ajouterScore(100);
  animerBarresSection(cibleId);
  fermerMenuBurger();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

boutons.forEach(btn => btn.addEventListener('click', () => activerSection(btn.dataset.cible)));

/* Bouton "PRESS START" */
const btnStart = document.querySelector('.bouton-arcade[data-cible]');
if (btnStart) btnStart.addEventListener('click', () => { jouerBip(440, 80); activerSection(btnStart.dataset.cible); });

/* Bouton DOJO */
const btnDojo = document.getElementById('js-btn-dojo');
if (btnDojo) btnDojo.addEventListener('click', () => { jouerBip(550, 80, 'sine'); activerSection('dojo'); });

/* Bouton retour Work */
document.querySelectorAll('.bouton-retour-work[data-cible]').forEach(btn => {
  btn.addEventListener('click', () => activerSection(btn.dataset.cible));
});

/* ---------------------------------------------------------------- BURGER */
const burger  = document.getElementById('js-burger');
const menuNav = document.getElementById('js-menu');

function fermerMenuBurger() {
  if (!burger) return;
  burger.setAttribute('aria-expanded', 'false');
  menuNav.classList.remove('ouvert');
}

if (burger) {
  burger.addEventListener('click', () => {
    const estOuvert = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!estOuvert));
    menuNav.classList.toggle('ouvert', !estOuvert);
    jouerBip(estOuvert ? 220 : 330, 40);
  });
}

document.addEventListener('click', evt => {
  if (!burger || !menuNav) return;
  if (!burger.contains(evt.target) && !menuNav.contains(evt.target)) fermerMenuBurger();
});

document.addEventListener('keydown', evt => {
  if (evt.key === 'Escape' && menuNav?.classList.contains('ouvert')) { fermerMenuBurger(); burger.focus(); }
});

/* ---------------------------------------------------------------- NAVIGATION CLAVIER FLÈCHES */
const ordreOnglets = ['accueil', 'projets', 'competences', 'parcours', 'contact'];

document.addEventListener('keydown', evt => {
  if (modalOverlay && !modalOverlay.hidden) return;
  if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
  if (menuNav?.classList.contains('ouvert')) return;
  const actuel = document.querySelector('.nav__bouton.actif')?.dataset.cible || 'accueil';
  const idx    = ordreOnglets.indexOf(actuel);
  if (evt.key === 'ArrowRight' && idx < ordreOnglets.length - 1) { jouerBip(440, 40); activerSection(ordreOnglets[idx + 1]); }
  if (evt.key === 'ArrowLeft'  && idx > 0)                        { jouerBip(330, 40); activerSection(ordreOnglets[idx - 1]); }
});

/* ---------------------------------------------------------------- MODAL PROJETS */

/**
 * Données des projets pour la modal
 * Les images proviennent du fichier assets/previews_data.js (base64)
 */
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

const modalOverlay = document.getElementById('js-modal');
const modalTitre   = document.getElementById('js-modal-titre');
const modalImg     = document.getElementById('js-modal-img');
const modalDesc    = document.getElementById('js-modal-desc');
const modalTech    = document.getElementById('js-modal-tech');
const btnFermer    = document.getElementById('js-modal-fermer');

let elementFocusAvantModal = null;

function focusablesModal(container) {
  return [...container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
}

/** Ouvre la modal pour un projet donné */
function ouvrirModal(projetKey) {
  const data = PROJETS_DATA[projetKey];
  if (!data || !modalOverlay) return;

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

/** Ferme la modal */
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

/* Clic sur une carte projet */
document.querySelectorAll('.carte-projet[data-projet]').forEach(carte => {
  carte.addEventListener('click',  () => ouvrirModal(carte.dataset.projet));
  carte.addEventListener('keydown', evt => { if (evt.key === 'Enter' || evt.key === ' ') { evt.preventDefault(); ouvrirModal(carte.dataset.projet); } });
});

/* Fermeture modal */
if (btnFermer) btnFermer.addEventListener('click', fermerModal);
if (modalOverlay) {
  modalOverlay.addEventListener('click', evt => { if (evt.target === modalOverlay) fermerModal(); });
}

/* ---------------------------------------------------------------- FORMULAIRE CONTACT */
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

/* ---------------------------------------------------------------- KONAMI CODE */
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
    ajouterScore(9999);
  }
});

/* ---------------------------------------------------------------- INIT */
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

document.addEventListener('DOMContentLoaded', () => {
  initMetaPartage();
  animerScoreInitial();
  setTimeout(() => animerBarresSection('accueil'), 300);
});
