// Starter for the "academy-16-huts" lesson (used by lessons/make-starters.mjs): the Robot Helper Academy world from
// craft/craft-academy.js, opened in the Build Lab.
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
export async function makeArgs(ROOT) {
  const A = await import(pathToFileURL(join(ROOT, 'craft', 'craft-academy.js')).href);
  return { project: A.academyProject('academy-16-huts') };
}
export const build = async ({ project }) => {
  startNewCraft('ks2');
  for (let i = 0; i < 400 && !(craftApp && craftApp._ws && craftApp._ws() && craftApp._world()); i++) await new Promise(r => setTimeout(r, 50));
  craftApp.setProject(project);
  await new Promise(r => setTimeout(r, 400));
};
