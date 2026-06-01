const SCORE_MAX = 9999;

export function plafonnerScore(valeur) {
  const n = Number(valeur);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(Math.trunc(n), SCORE_MAX));
}

export function formaterScoreAffichage(valeur) {
  return String(plafonnerScore(valeur)).padStart(6, '0');
}

export { SCORE_MAX };
