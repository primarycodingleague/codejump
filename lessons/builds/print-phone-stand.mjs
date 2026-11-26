// Starter for the "print-phone-stand" lesson (used by lessons/make-starters.mjs): the phone stand design challenge on
// an empty build plate (pupils decompose the stand and build it from boxes).
const PM = await import(new URL('../../print/print-model.js', import.meta.url).href);

export function makeArgs() {
  const p = PM.briefProject('phonestand');
  p.title = 'My phone stand';
  return { proj: p };
}
export const build = async ({ proj }) => {
  startNewPrint3D('ks2');
  for (let i = 0; i < 600 && !(p3dApp && p3dApp._model && p3dApp._model()); i++) await new Promise(r => setTimeout(r, 50));
  p3dApp.setProject(proj);
};
