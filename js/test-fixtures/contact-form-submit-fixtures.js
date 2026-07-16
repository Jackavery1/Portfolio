export function preparerDomEnvoi() {
  document.body.innerHTML = `
      <form id="js-formulaire">
        <input id="contact-nom" class="champ-input" name="nom" />
        <input id="contact-email" class="champ-input" name="email" type="email" />
        <select id="contact-sujet" class="champ-input" name="sujet">
          <option>Projet</option>
        </select>
        <textarea id="contact-message" class="champ-input" name="message"></textarea>
        <button id="btn" type="submit">Envoyer</button>
      </form>
      <p id="confirm" hidden>OK</p>
    `;
  return {
    btn: document.getElementById('btn'),
    confirmation: document.getElementById('confirm'),
    formulaire: document.getElementById('js-formulaire'),
  };
}

export function configurationFormspree(surcharges = {}) {
  const { CONTACT: contactSurcharges, ...reste } = surcharges;
  return {
    ...reste,
    CONTACT: {
      RECAPTCHA_SITE_KEY: 'key',
      FORMSPREE_ENDPOINT: 'https://formspree.io/f/test',
      RECAPTCHA_VERSION: 3,
      ...contactSurcharges,
    },
  };
}

export const champsContactDemo = {
  nom: 'Joris',
  email: 'a@b.c',
  message: 'Hi',
};
