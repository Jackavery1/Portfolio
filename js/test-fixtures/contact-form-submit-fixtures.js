export function preparerDomEnvoi() {
  document.body.innerHTML = `
      <button id="btn">Envoyer</button>
      <p id="confirm" hidden>OK</p>
    `;
  return {
    btn: document.getElementById('btn'),
    confirmation: document.getElementById('confirm'),
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
