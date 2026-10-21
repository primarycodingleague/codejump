// Starter for the "library-9-door" lesson (used by lessons/make-starters.mjs): Sparky's program from lessons/builds/robot/library.mjs
// (the Robot Librarian unit), opened in the Robot Lab.
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
export async function makeArgs(ROOT) {
  const L = await import(pathToFileURL(join(ROOT, 'lessons', 'builds', 'robot', 'library.mjs')).href);
  return { robot: L.STARTERS['library-9-door'] };
}
export const build = async ({ robot }) => {
  startNewRobot('ks2');
  for (let i = 0; i < 400 && !(robotApp && robotApp._ws && robotApp._ws() && robotApp._view()); i++) await new Promise(r => setTimeout(r, 50));
  robotApp.setProject(robot);
};
