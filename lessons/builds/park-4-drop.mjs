// Starter for the "park-4-drop" lesson (used by lessons/make-starters.mjs): the Park Designers world from world/world-park.js
// (its blocks and its goals checklist), opened in the 3D World.
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
export async function makeArgs(ROOT) {
  const P = await import(pathToFileURL(join(ROOT, 'world', 'world-park.js')).href);
  return { project: P.parkProject('park-4-drop') };
}
export const build = async ({ project }) => {
  startNew3D('ks2');
  for (let i = 0; i < 400 && !(worldApp && worldApp._world && worldApp._world()); i++) await new Promise(r => setTimeout(r, 50));
  worldApp.setProject(project);
  for (let i = 0; i < 400 && !worldApp._world().editing(); i++) await new Promise(r => setTimeout(r, 50));
};
