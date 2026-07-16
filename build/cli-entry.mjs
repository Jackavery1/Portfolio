export function estEntreeDirecte(requireMain, moduleRef) {
  return requireMain === moduleRef;
}

export function executerSiEntreeDirecte(requireMain, moduleRef, fn) {
  if (!estEntreeDirecte(requireMain, moduleRef)) return;
  fn();
}
