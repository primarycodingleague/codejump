// Starter for the "print-keyring" lesson (used by lessons/make-starters.mjs): the keyring design challenge on the
// plate, with a blank blue tag to build on (no writing and no hole yet, so those two rules don't tick at the start).
const PM = await import(new URL('../../print/print-model.js', import.meta.url).href);

export function makeArgs() {
  const p = PM.briefProject('keyring');
  p.title = 'My keyring';
  p.objs.push(PM.makeObj('box', { id: 'o1', w: 50, d: 20, h: 3, color: '#3b7fc4' }));
  return { proj: p };
}
export const build = async ({ proj }) => {
  startNewPrint3D('ks2');
  for (let i = 0; i < 600 && !(p3dApp && p3dApp._model && p3dApp._model()); i++) await new Promise(r => setTimeout(r, 50));
  p3dApp.setProject(proj);
};
