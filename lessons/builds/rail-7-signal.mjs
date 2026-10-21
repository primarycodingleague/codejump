// Starter for the "rail-7-signal" lesson (used by lessons/make-starters.mjs): the track, trains, places and blocks from
// lessons/builds/train/brindlewick.mjs (the Brindlewick Railway unit), opened in the Train Lab.
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
export async function makeArgs(ROOT) {
  const L = await import(pathToFileURL(join(ROOT, 'lessons', 'builds', 'train', 'brindlewick.mjs')).href);
  return { train: L.STARTERS['rail-7-signal'] };
}
export const build = async ({ train }) => {
  startNewTrain('ks2');
  for (let i = 0; i < 400 && !(trainApp && trainApp._ws && trainApp._ws()); i++) await new Promise(r => setTimeout(r, 50));
  trainApp.setProject(train);
};
