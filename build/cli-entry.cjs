function estEntreeDirecte(requireMain, moduleRef) {
  return requireMain === moduleRef;
}

function executerSiEntreeDirecte(requireMain, moduleRef, fn) {
  if (!estEntreeDirecte(requireMain, moduleRef)) return;
  fn();
}

module.exports = { estEntreeDirecte, executerSiEntreeDirecte };
