/** Façade I/O + staging — API stable pour le reste du pipeline build. */
const io = require('./fs-utils-io.cjs');
const staging = require('./fs-utils-staging.cjs');

module.exports = {
  ...io,
  ...staging,
};
