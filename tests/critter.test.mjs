// Critter Lab engine, headless (Rapier): every Starter Critter is valid and moves in its contests.
import { join } from 'node:path';
import { ROOT, ok, done } from './lib.mjs';

const Z = await import(join(ROOT, 'critter', 'critter-core.js'));
const mod = await import(join(ROOT, 'critter', 'vendor', 'rapier3d-compat-0.21.0.min.js'));
const R = mod.default || mod;
await R.init();

const names = Object.keys(Z.STARTERS);
ok(names.length >= 4, 'there are Starter Critters: ' + names.join(', '));
for (const n of names) {
  const z = Z.normalise(Z.STARTERS[n].make());
  ok(z.blocks.length > 1 && z.joints.every(j => Z.block(z, j.blockB)), n + ' is a valid Critter (' + z.blocks.length + ' parts)');
}
const scuttler = () => Z.normalise(Z.STARTERS.scuttler.make());
const sprint = Z.runHeadless(R, scuttler(), 'sprint');
ok(sprint && sprint.score > 0.3, 'the Scuttler makes progress in the Sprint (' + (sprint && sprint.text) + ')');
const again = Z.runHeadless(R, scuttler(), 'sprint');
ok(again && again.score === sprint.score, 'contests are deterministic (same score twice)');
done();
