// Starter for the "print-3-birdbox" lesson (Maple Street Makers, the Print Lab's unit; used by lessons/make-starters.mjs).
// The design and its challenge come from lessons/builds/print/maple.mjs (which also holds the lesson's answer).
const S = await import(new URL('./print/maple.mjs', import.meta.url).href);

export function makeArgs() { return { proj: S.PM.cleanProject(S.STARTERS['print-3-birdbox']()) }; }
export const build = async ({ proj }) => {
  startNewPrint3D('ks2');
  for (let i = 0; i < 600 && !(p3dApp && p3dApp._model && p3dApp._model()); i++) await new Promise(r => setTimeout(r, 50));
  p3dApp.setProject(proj);
};
