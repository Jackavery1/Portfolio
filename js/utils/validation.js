/* ============================================
   Validation / parsing (fonctions pures, testables)
   ============================================ */

function retirerCaracteresControle(s) {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31)) continue;
    out += s[i];
  }
  return out;
}

export function nettoyerChamp(texte, maxLen) {
  const t = retirerCaracteresControle(String(texte ?? '').trim());
  return t.length > maxLen ? t.slice(0, maxLen) : t;
}

export function estEmailValide(email, maxLen = 254) {
  if (!email || email.length > maxLen) return false;
  if (email.includes('..')) return false;
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return false;
  const [local, domaine] = email.split('@');
  if (!local || !domaine) return false;
  if (local.startsWith('.') || local.endsWith('.')) return false;
  if (domaine.startsWith('.') || domaine.endsWith('.')) return false;
  return true;
}

export function cleDansScriptRecaptchaV3(script) {
  if (!script?.src) return null;
  const m = script.src.match(/[?&]render=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
