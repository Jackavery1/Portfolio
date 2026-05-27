const fs = require('fs');
const path = require('path');
const CONFIG_DEFAULTS = require('./config-defaults.cjs');

function loadEnvFile(root) {
  const envPath = path.join(root, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  lines.forEach((line) => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const eq = t.indexOf('=');
    if (eq === -1) return;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = val;
  });
}

function resolveBuildEnv(env = process.env) {
  return {
    siteOrigin: (
      env.PORTFOLIO_SITE_URL ||
      env.PORTFOLIO_SITE_ORIGIN ||
      CONFIG_DEFAULTS.siteOrigin
    ).replace(/\/$/, ''),
    formspree:
      env.PORTFOLIO_FORMSPREE_ENDPOINT || CONFIG_DEFAULTS.formspree,
    recaptcha: env.PORTFOLIO_RECAPTCHA_SITE_KEY || CONFIG_DEFAULTS.recaptcha,
  };
}

function applyBuildEnvToJs(source, buildEnv = resolveBuildEnv(), defaults = CONFIG_DEFAULTS) {
  let out = source;
  if (buildEnv.siteOrigin !== defaults.siteOrigin) {
    out = out.split(defaults.siteOrigin).join(buildEnv.siteOrigin);
  }
  if (buildEnv.formspree !== defaults.formspree) {
    out = out.split(defaults.formspree).join(buildEnv.formspree);
  }
  if (buildEnv.recaptcha !== defaults.recaptcha) {
    out = out.split(defaults.recaptcha).join(buildEnv.recaptcha);
  }
  return out;
}

module.exports = {
  CONFIG_DEFAULTS,
  loadEnvFile,
  resolveBuildEnv,
  applyBuildEnvToJs,
};
