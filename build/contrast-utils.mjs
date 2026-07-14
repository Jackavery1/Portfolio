function parseHex(couleur) {
  const hex = couleur.trim().replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return { r, g, b };
}

function luminanceRelative({ r, g, b }) {
  const canal = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function ratioContrasteCouleurs(premierPlan, arrierePlan) {
  const lumClaire = Math.max(
    luminanceRelative(premierPlan),
    luminanceRelative(arrierePlan)
  );
  const lumFoncee = Math.min(
    luminanceRelative(premierPlan),
    luminanceRelative(arrierePlan)
  );
  return (lumClaire + 0.05) / (lumFoncee + 0.05);
}

export function ratioContrasteHex(fgHex, bgHex) {
  return ratioContrasteCouleurs(parseHex(fgHex), parseHex(bgHex));
}

/** Sérialisable dans page.evaluate — aucune dépendance externe. */
export function ratioContrasteElementDom(el) {
  function parseRgbLocal(couleur) {
    const match = couleur.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;
    return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };
  }

  function luminanceRelativeLocal({ r, g, b }) {
    const canal = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
  }

  function fondEffectifLocal(node) {
    let courant = node;
    while (courant) {
      const style = getComputedStyle(courant);
      const couleur = parseRgbLocal(style.backgroundColor);
      if (couleur && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        return couleur;
      }
      courant = courant.parentElement;
    }
    return parseRgbLocal(getComputedStyle(document.body).backgroundColor) ?? { r: 0, g: 0, b: 0 };
  }

  const premierPlan = parseRgbLocal(getComputedStyle(el).color);
  const arrierePlan = fondEffectifLocal(el);
  if (!premierPlan || !arrierePlan) return 0;

  const lumClaire = Math.max(
    luminanceRelativeLocal(premierPlan),
    luminanceRelativeLocal(arrierePlan)
  );
  const lumFoncee = Math.min(
    luminanceRelativeLocal(premierPlan),
    luminanceRelativeLocal(arrierePlan)
  );
  return (lumClaire + 0.05) / (lumFoncee + 0.05);
}
