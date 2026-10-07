// Starter for the "world-builders" lesson (used by lessons/make-starters.mjs).
// World builders: the starter world. Built by hand (same JSON shape as world-blocks.js's _make helpers), so makeArgs needs no imports.
// "when Run is clicked": sky · a gold box (box1) · a red ball off to the side (ball1) · a tree (tree1) · a star floating over the box (star)
// · "set across to -6", ready for the pupils' repeat loop. The variable list ends with "across", so the Variables flyout's
// "change … by 1" block shows across.
const num = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const col = c => ({ shadow: { type: 'colour_picker', fields: { COLOUR: c } } });
function blk(type, fields, inputs, extra) { return Object.assign({ type, fields: fields || {}, inputs: inputs || {} }, extra || {}); }
function chain(list) { for (let i = list.length - 2; i >= 0; i--) list[i].next = { block: list[i + 1] }; return list[0]; }
const V = n => ({ id: 'v_' + n });

export function makeArgs() {
  const run = blk('w3_when_run', null, null, { x: 20, y: 20 });
  run.inputs = { DO: { block: chain([
    blk('w3_sky', null, { COLOR: col('#8fd0f7') }),
    blk('w3_box', { VAR: V('box1') }, { COLOR: col('#f2b61d'), W: num(2), H: num(1), D: num(2), X: num(0), Y: num(0), Z: num(0) }),
    blk('w3_sphere', { VAR: V('ball1') }, { COLOR: col('#e03131'), W: num(1), X: num(4), Y: num(0), Z: num(0) }),
    blk('w3_object', { VAR: V('tree1'), MODEL: 'tree' }, { SCALE: num(1), X: num(-7), Y: num(0), Z: num(2) }),
    blk('w3_object', { VAR: V('star'), MODEL: 'Star' }, { SCALE: num(1), X: num(0), Y: num(3), Z: num(0) }),
    blk('variables_set', { VAR: V('across') }, { VALUE: { block: { type: 'math_number', fields: { NUM: -6 } } } })
  ]) } };
  const world = { blocks: { languageVersion: 0, blocks: [run] }, variables: ['box1', 'ball1', 'tree1', 'star', 'cone1', 'across'].map(n => ({ name: n, id: 'v_' + n })) };
  return { world };
}

export const build = async ({ world }) => {
  startNew3D('ks2');
  for (let i = 0; i < 400 && !(worldApp && worldApp._world && worldApp._world()); i++) await new Promise(r => setTimeout(r, 50));
  worldApp.setProject({ blocks: world });
};
