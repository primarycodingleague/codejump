// Starter for the "critter-builders" lesson (used by lessons/make-starters.mjs).
// Critter builders (Years 3–4) starter: a body with ONE pair of Walking legs at the front, put exactly where the app's own
// "tap a limb" puts the first pair (underneath, front: -y at [0.35, 0.35]), so the pupils' tap on Walking leg adds the second
// pair at the back. As it is, the back of the body drags on the ground and it gets 0.0 m in the Sprint.
export function makeArgs(ROOT) { return {}; }

// Runs inside the page (serialised with .toString()): self-contained.
export const build = async () => {
  startNewCritter('ks2');
  for (let i = 0; i < 200 && !critterApp; i++) await new Promise(r => setTimeout(r, 50));
  const Z = await import(critterBase() + 'critter-core.js');
  const z = Z.newCritter('Scoot'), body = z.blocks[0].id;
  Z.attachLimb(z, 'leg2', body, '-y', [0.35, 0.35], { mirror: true });
  critterApp.setCritter(JSON.parse(JSON.stringify(z)));
};
