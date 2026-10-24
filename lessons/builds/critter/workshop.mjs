// Critter Workshop (lessons/units/critter.js): every new lesson's starter Critter, goals and answer, in one place.
// make-starters.mjs builds each starter from lessons/builds/workshop-*.mjs (which call args()/build() below), and
// tests/unit-critter.test.mjs plays every answer in Node with the real physics (critter-core.js runHeadless) and checks the goals.
//
// An answer is a list of steps, each one the same thing a pupil does in the Critter Lab:
//   { say, act(z, H) }  change the Critter (H = the app's own actions, mirrored exactly below)
//   { test, opp? }      run a contest to the end (Test it! → contest → Go!) and log the result, like the app's Results table
import { fileURLToPath } from 'node:url';
const Z = await import(new URL('../../../critter/critter-core.js', import.meta.url).href);
const G = await import(new URL('../../../critter/critter-goals.js', import.meta.url).href);
export { Z, G };

const cp = o => JSON.parse(JSON.stringify(o));

/* ---------------------------------------------------------------- the app's own actions (critter-app.js), copied exactly */
export const H = {
  // tap a limb in the palette with `sel` chosen: it hangs from the chosen part, or under the body at the next free spot
  tapLimb(z, kind, sel) {
    const parent = Z.block(z, sel) || z.blocks[0];
    const used = Z.children(z, parent.id).map(b => b.mount.face + b.mount.at.join(','));
    const spots = parent.mount ? [['+x', [0, 0]]] : [['-y', [0.35, 0.35]], ['-y', [-0.35, 0.35]], ['-y', [0, 0.35]], ['+x', [0, 0]], ['-x', [0, 0]], ['+y', [0, 0]]];
    const spot = spots.filter(s => used.indexOf(s[0] + s[1].join(',')) < 0 && used.indexOf(s[0] + [s[1][0], -s[1][1]].join(',')) < 0)[0] || spots[0];
    return Z.attachLimb(z, kind, parent.id, spot[0], spot[1], { mirror: true });
  },
  // drag a limb onto a face of the body (the front is '+x', the back '-x')
  dropLimb(z, kind, face, at) { return Z.attachLimb(z, kind, z.blocks[0].id, face, at || [0, 0], { mirror: true }); },
  // the foot-loop buttons on a foot's Motion tab (each copies across to its twin)
  path(z, id, which) {
    const b = Z.block(z, id), pts = b.path.points;
    const c = [0, 0]; pts.forEach(p => { c[0] += p[0] / pts.length; c[1] += p[1] / pts.length; });
    const low = Math.min(...pts.map(p => p[1]));
    if (which === 'longer') pts.forEach(p => { p[0] = Math.round(c[0] + (p[0] - c[0]) * 1.25); });
    if (which === 'shorter') pts.forEach(p => { p[0] = Math.round(c[0] + (p[0] - c[0]) * 0.8); });
    if (which === 'higher') pts.forEach(p => { if (p[1] > low) p[1] = Math.round(low + (p[1] - low) * 1.3 + 1); });
    if (which === 'lower') pts.forEach(p => { p[1] = Math.round(low + (p[1] - low) * 0.75); });
    if (which === 'reverse') { const f = pts.shift(); pts.reverse(); pts.unshift(f); }
    Z.syncTwin(z, b);
  },
  grip(z, id, g) { const b = Z.block(z, id); b.friction = Z.FRICTION[g]; Z.syncTwin(z, b); },
  colour(z, id, c) { const b = Z.block(z, id); b.colour = c; Z.syncTwin(z, b); },
  width(z, id, w) { const b = Z.block(z, id); b.size[2] = w; Z.syncTwin(z, b); },
  // the body's Motion tab sliders, as the slider sets them
  speed(z, v) { z.motion.period = Math.round((2.5 - (v - 1) * 0.24) * 100) / 100; },
  sharpness(z, pct) { z.motion.sharpness = pct / 100; },
  smoothness(z, pct) { z.motion.smoothness = pct / 100; },
  power(z, pct) { z.motion.power = pct / 100; },
  remove(z, id) { Z.remove(z, id); },
  // Copy the chosen part, choose the body, Paste
  copyToBody(z, id) { const snip = Z.copyPart(z, id), spot = Z.freeSpot(z, z.blocks[0].id, null); return Z.pastePart(z, snip, z.blocks[0].id, spot.face, spot.at, { mirror: true }); }
};

// The first foot of each mirrored pair (front pair first), and the top part of each limb that hangs from the body.
export function pairFeet(z) { return z.blocks.filter(b => b.path && (!b.twin || z.blocks.indexOf(b) < z.blocks.findIndex(x => x.id === b.twin))); }
export function feet(z) { return z.blocks.filter(b => b.path); }
const tops = (z, kind) => z.blocks.filter(b => b.mount && b.mount.parent === z.blocks[0].id && (!kind || b.kind === kind));

/* ---------------------------------------------------------------- the Critters the unit starts from */
function paint(z, body, legs, feetCol) {
  z.blocks.forEach((b, i) => { b.colour = i === 0 ? body : b.kind === 'foot' || b.path ? feetCol : legs; });
  return z;
}
// A walker with two pairs of Long legs underneath, exactly as two taps on Long leg (with the body chosen) make it.
function longWalker(name) { const z = Z.newCritter(name); H.tapLimb(z, 'leg3', 'b1'); H.tapLimb(z, 'leg3', 'b1'); return z; }
// A sprawling walker: four legs out to the sides on stepping loops (the Scuttler Starter Critter's legs, our colours).
function sprawler(name) { const z = Z.STARTERS.scuttler.make(); z.name = name; return z; }

const goals = (title, list) => ({ title, list });
const text = { sprint: m => `Sprint: ${m} m or more`, hurdles: m => `Hurdles: ${m} m or more`, block: m => `Block Push: ${m} m of blocks or more` };

/* ---------------------------------------------------------------- the lessons */
export const UNIT = {
  // ── Block 1 · Apprentice builders (Years 3–4)
  'workshop-2-loop': {
    starter() {
      const z = paint(longWalker('Trundle'), '#8a63d2', '#f59f18', '#00bf63');
      pairFeet(z).forEach(f => H.path(z, f.id, 'reverse')); // the bug: both foot loops go round the wrong way
      z.goals = goals('Trundle’s walk', [
        { type: 'score', contest: 'sprint', min: 3, text: text.sprint(3) },
        { type: 'tests', contest: 'sprint', n: 2, text: 'Test it before and after your change' }
      ]);
      return z;
    },
    answer: [
      { test: 'sprint' },
      { say: 'Front foot: Motion tab → Reverse', act: z => H.path(z, pairFeet(z)[0].id, 'reverse') },
      { say: 'Back foot: Motion tab → Reverse', act: z => H.path(z, pairFeet(z)[1].id, 'reverse') },
      { test: 'sprint' }
    ]
  },
  'workshop-3-parts': {
    starter() {
      const z = Z.newCritter('Lizzie'); z.blocks[0].colour = '#00bf63';
      z.goals = goals('Lizzie’s parts list', [
        { type: 'feet', n: 4, text: 'Move: four walking feet' },
        { type: 'aim', n: 1, text: 'See: a head that turns to the target' },
        { type: 'score', contest: 'sprint', min: 4, text: text.sprint(4) },
        { type: 'score', contest: 'hurdles', min: 4, text: text.hurdles(4) }
      ]);
      return z;
    },
    answer: [
      { say: 'Click the body, tap Long leg', act: z => H.tapLimb(z, 'leg3', 'b1') },
      { say: 'Click the body, tap Long leg again', act: z => H.tapLimb(z, 'leg3', 'b1') },
      { say: 'Drag Neck & head onto the front of the body', act: z => H.dropLimb(z, 'neck', '+x') },
      { test: 'sprint' }, { test: 'hurdles' }
    ]
  },
  'workshop-4-cycles': {
    starter() {
      const z = paint(sprawler('Dash'), '#e10000', '#ffffff', '#f59f18'); H.speed(z, 4);
      z.goals = goals('Dash’s delivery', [
        { type: 'tests', contest: 'sprint', n: 3, text: 'Test 3 different cycle speeds' },
        { type: 'score', contest: 'sprint', min: 6, text: text.sprint(6) }
      ]);
      return z;
    },
    answer: [
      { test: 'sprint' },
      { say: 'Body → Motion → Cycle speed 6', act: z => H.speed(z, 6) }, { test: 'sprint' },
      { say: 'Cycle speed 9', act: z => H.speed(z, 9) }, { test: 'sprint' }
    ]
  },
  'workshop-5-bugs': {
    starter() {
      const z = paint(longWalker('Bramble'), '#585555', '#ae853e', '#00bf63');
      H.path(z, pairFeet(z)[1].id, 'reverse');                              // bug 1: the back loop goes the wrong way round
      feet(z).forEach(f => { f.friction = Z.FRICTION.slippy; });             // bug 2: slippy feet
      H.power(z, 50);                                                        // bug 3: weak muscles
      z.goals = goals('Fix Bramble', [
        { type: 'grip', grip: 'grippy', n: 4, text: 'Four grippy feet' },
        { type: 'setting', key: 'power', min: 100, text: 'Muscle power 100% or more' },
        { type: 'score', contest: 'sprint', min: 4, text: text.sprint(4) }
      ]);
      return z;
    },
    answer: [
      { test: 'sprint' },
      { say: 'Back foot → Motion → Reverse', act: z => H.path(z, pairFeet(z)[1].id, 'reverse') }, { test: 'sprint' },
      { say: 'Each foot pair → Shape → Grip: Grippy', act: z => pairFeet(z).forEach(f => H.grip(z, f.id, 'grippy')) }, { test: 'sprint' },
      { say: 'Body → Motion → Muscle power 100%', act: z => H.power(z, 100) }, { test: 'sprint' }
    ]
  },
  'workshop-6-post': {
    project: true,
    starter() {
      const z = Z.newCritter('Post Critter'); z.blocks[0].colour = '#e10000';
      z.goals = goals('The post run', [
        { type: 'feet', n: 4, text: 'At least four walking feet' },
        { type: 'score', contest: 'sprint', min: 3, text: text.sprint(3) },
        { type: 'score', contest: 'hurdles', min: 3, text: text.hurdles(3) },
        { type: 'named', not: 'Post Critter', text: 'A name of its own' },
        { type: 'colours', n: 3, text: 'Three colours or more' }
      ]);
      return z;
    },
    // an example that meets the brief (a pupil's own design will be different)
    answer: [
      { act: z => { H.tapLimb(z, 'leg3', 'b1'); H.tapLimb(z, 'leg3', 'b1'); H.dropLimb(z, 'neck', '+x'); } },
      { act: z => { z.name = 'Postie'; H.colour(z, pairFeet(z)[0].id, '#00bf63'); H.colour(z, tops(z, 'long')[0].id, '#f59f18'); } },
      { test: 'sprint' }, { test: 'hurdles' }
    ]
  },

  // ── Block 2 · Critters that sense and decide (Years 4–5)
  'workshop-7-sense': {
    starter() {
      const z = paint(sprawler('Scout'), '#38b6ff', '#ffffff', '#ff751f'); H.speed(z, 9); H.smoothness(z, 0);
      z.goals = goals('Round the duck pond', [
        { type: 'setting', key: 'smoothness', min: 20, text: 'Turning smoothness 20% or more' },
        { type: 'score', contest: 'lap', min: 8, text: 'Lap: all 8 flags' }
      ]);
      return z;
    },
    answer: [
      { test: 'lap' },
      { say: 'Body → Motion → Turning smoothness 50%', act: z => H.smoothness(z, 50) }, { test: 'lap' }
    ]
  },
  'workshop-8-turns': {
    starter() {
      const z = paint(sprawler('Spinner'), '#ff66c4', '#ffffff', '#8a63d2'); H.speed(z, 10); H.smoothness(z, 0); H.sharpness(z, 100);
      z.goals = goals('Stop the spinning', [
        { type: 'tests', contest: 'lap', n: 3, text: 'Test 3 different sharpness settings' },
        { type: 'score', contest: 'lap', min: 6, text: 'Lap: 6 flags or more' }
      ]);
      return z;
    },
    answer: [
      { test: 'lap' },
      { say: 'Turning sharpness 80%', act: z => H.sharpness(z, 80) }, { test: 'lap' },
      { say: 'Turning sharpness 50%', act: z => H.sharpness(z, 50) }, { test: 'lap' }
    ]
  },
  'workshop-9-better': {
    starter() {
      const z = paint(sprawler('Hilda'), '#00bf63', '#ae853e', '#ff751f');
      z.goals = goals('The hill trail', [
        { type: 'tests', contest: 'hurdles', n: 3, text: 'Compare 3 designs in Hurdles' },
        { type: 'score', contest: 'hurdles', min: 9.5, text: text.hurdles(9.5) }
      ]);
      return z;
    },
    answer: [
      { test: 'hurdles' },
      { say: 'Both foot pairs → Lift higher (it gets worse: Undo)', act: z => pairFeet(z).forEach(f => H.path(z, f.id, 'higher')) }, { test: 'hurdles' },
      { say: 'Undo', act: (z, h) => h.undo() },
      { say: 'Both foot pairs → Longer steps', act: z => pairFeet(z).forEach(f => H.path(z, f.id, 'longer')) }, { test: 'hurdles' }
    ]
  },
  'workshop-10-rocks': {
    starter() {
      const z = paint(sprawler('Digger'), '#f59f18', '#585555', '#585555');
      z.goals = goals('Clear the rockfall', [
        { type: 'tests', contest: 'blockpush', n: 3, text: 'Test 3 body widths' },
        { type: 'score', contest: 'blockpush', min: 2, text: text.block(2) }
      ]);
      return z;
    },
    answer: [
      { test: 'blockpush' },
      { say: 'Body → Shape → Width 60', act: z => H.width(z, 'b1', 60) }, { test: 'blockpush' },
      { say: 'Width 64', act: z => H.width(z, 'b1', 64) }, { test: 'blockpush' }
    ]
  },
  'workshop-11-patrol': {
    starter() {
      const z = paint(sprawler('Patrol'), '#38b6ff', '#585555', '#ae853e');
      H.speed(z, 7);                                                   // bug 1: the loop repeats too slowly
      H.sharpness(z, 100); H.smoothness(z, 0);                         // bug 2: the turning rule snaps and spins
      feet(z).forEach(f => { f.friction = Z.FRICTION.slippy; });       // bug 3: slippy feet
      z.goals = goals('Fix the pond patrol', [
        { type: 'grip', grip: 'grippy', n: 4, text: 'Four grippy feet' },
        { type: 'setting', key: 'speed', min: 9, max: 9, text: 'Cycle speed 9' },
        { type: 'score', contest: 'lap', min: 8, text: 'Lap: all 8 flags' }
      ]);
      return z;
    },
    answer: [
      { test: 'lap' },
      { say: 'Cycle speed 9', act: z => H.speed(z, 9) }, { test: 'lap' },
      { say: 'Sharpness 50%, smoothness 80%', act: z => { H.sharpness(z, 50); H.smoothness(z, 80); } }, { test: 'lap' },
      { say: 'Each foot pair → Grip: Grippy', act: z => pairFeet(z).forEach(f => H.grip(z, f.id, 'grippy')) }, { test: 'lap' }
    ]
  },
  'workshop-12-pond': {
    project: true,
    starter() {
      const z = paint(sprawler('Pond Patrol'), '#ffffff', '#585555', '#585555'); H.speed(z, 6); H.sharpness(z, 100); H.smoothness(z, 0);
      z.goals = goals('Pond patrol', [
        { type: 'score', contest: 'lap', min: 8, text: 'Lap: all 8 flags' },
        { type: 'score', contest: 'hurdles', min: 9, text: text.hurdles(9) },
        { type: 'tests', n: 4, text: 'Test 4 different designs' },
        { type: 'named', not: 'Pond Patrol', text: 'A name of its own' },
        { type: 'colours', n: 3, text: 'Three colours or more' }
      ]);
      return z;
    },
    answer: [
      { test: 'lap' },
      { act: z => H.speed(z, 9) }, { test: 'lap' },
      { act: z => { H.sharpness(z, 50); H.smoothness(z, 80); } }, { test: 'lap' },
      { act: z => pairFeet(z).forEach(f => H.path(z, f.id, 'longer')) }, { test: 'lap' }, { test: 'hurdles' },
      { act: z => { z.name = 'Quackers'; H.colour(z, 'b1', '#38b6ff'); H.colour(z, pairFeet(z)[0].id, '#f59f18'); } }
    ]
  },

  // ── Block 3 · Critter science (Years 5–6)
  'workshop-14-speeds': {
    starter() {
      const z = paint(longWalker('Strider'), '#38b6ff', '#585555', '#ff66c4'); H.speed(z, 4);
      z.goals = goals('Speed trials', [
        { type: 'tests', contest: 'sprint', n: 6, text: 'Sprint at 6 different cycle speeds' },
        { type: 'score', contest: 'sprint', min: 2.2, text: text.sprint(2.2) }
      ]);
      return z;
    },
    answer: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap(v => [{ say: 'Cycle speed ' + v, act: z => H.speed(z, v) }, { test: 'sprint' }])
  },
  'workshop-15-copy': {
    starter() {
      const z = Z.newCritter('Patch'); H.tapLimb(z, 'leg3', 'b1'); H.tapLimb(z, 'leg2', 'b1');
      paint(z, '#ae853e', '#f59f18', '#00bf63');
      z.goals = goals('One great leg, used twice', [
        { type: 'kind', kind: 'long', n: 4, text: 'Four Long bits (two Long leg pairs)' },
        { type: 'tests', contest: 'sprint', n: 2, text: 'Test it before and after' },
        { type: 'score', contest: 'sprint', min: 4, text: text.sprint(4) }
      ]);
      return z;
    },
    answer: [
      { test: 'sprint' },
      { say: 'Click a back Leg bit → Shape → Remove this pair', act: z => H.remove(z, tops(z, 'leg')[0].id) },
      { say: 'Click a front Long bit → Copy; click the body → Paste', act: z => H.copyToBody(z, tops(z, 'long')[0].id) },
      { test: 'sprint' }
    ]
  },
  'workshop-16-trials': {
    starter() {
      const z = paint(sprawler('Trialist'), '#8a63d2', '#ffffff', '#00bf63');
      z.goals = goals('Job trials', [
        { type: 'contests', n: 4, text: 'Test it in 4 different contests' },
        { type: 'tests', n: 2, text: 'Compare 2 designs' }
      ]);
      return z;
    },
    answer: [
      { test: 'sprint' }, { test: 'hurdles' }, { test: 'blockpush' }, { test: 'highjump' },
      { say: 'Both foot pairs → Longer steps', act: z => pairFeet(z).forEach(f => H.path(z, f.id, 'longer')) }, { test: 'sprint' }, { test: 'hurdles' }
    ]
  },
  'workshop-17-sumo': {
    starter() {
      const z = paint(sprawler('Rumble'), '#e10000', '#585555', '#ae853e');
      z.goals = goals('Super Sumo champion', [
        { type: 'tests', contest: 'sumo', n: 2, text: 'Test 2 designs in Super Sumo' },
        { type: 'wins', contest: 'sumo', n: 4, text: 'One design beats all 4 Starter Critters' }
      ]);
      return z;
    },
    answer: [
      ...['scuttler', 'crab', 'wriggler', 'hopper'].map(o => ({ test: 'sumo', opp: o })),
      { say: 'Body → Shape → Width 70', act: z => H.width(z, 'b1', 70) },
      ...['scuttler', 'crab', 'wriggler', 'hopper'].map(o => ({ test: 'sumo', opp: o }))
    ]
  },
  'workshop-18-games': {
    project: true,
    starter() {
      const z = paint(sprawler('Champion'), '#ae853e', '#585555', '#585555'); H.speed(z, 6); H.sharpness(z, 100); H.smoothness(z, 0);
      z.goals = goals('The Fernhollow Games', [
        { type: 'score', contest: 'sprint', min: 6, text: text.sprint(6) },
        { type: 'score', contest: 'hurdles', min: 8, text: text.hurdles(8) },
        { type: 'score', contest: 'lap', min: 8, text: 'Lap: all 8 flags' },
        { type: 'wins', contest: 'sumo', n: 3, text: 'Super Sumo: one design beats 3 Starter Critters' },
        { type: 'tests', n: 6, text: 'Test 6 different designs' },
        { type: 'named', not: 'Champion', text: 'A name of its own' }
      ]);
      return z;
    },
    answer: [
      { test: 'sprint' },
      { act: z => H.speed(z, 9) }, { test: 'sprint' },
      { act: z => { H.sharpness(z, 50); H.smoothness(z, 80); } }, { test: 'lap' },
      { act: z => pairFeet(z).forEach(f => H.path(z, f.id, 'longer')) }, { test: 'sprint' }, { test: 'hurdles' },
      { act: z => H.width(z, 'b1', 66) }, { test: 'sprint' },
      { act: z => H.width(z, 'b1', 70) }, { test: 'sprint' }, { test: 'hurdles' }, { test: 'lap' },
      ...['scuttler', 'crab', 'wriggler', 'hopper'].map(o => ({ test: 'sumo', opp: o })),
      { act: z => { z.name = 'Thunderfoot'; } }
    ]
  }
};
export const IDS = Object.keys(UNIT);

// The starter as it is saved (normalised, like the app keeps it).
export function starter(id) { return Z.normalise(UNIT[id].starter()); }

/* Play a list of steps on a Critter with Rapier (R): every { test } runs the contest headlessly and logs it, just as the
 * app's Test it! does when a run finishes (critter-goals.js logRow). Undo goes back to before the last change, keeping
 * the log (like the app). Returns the Critter. */
export function play(R, z, steps) {
  z = Z.normalise(cp(z));
  const history = [];
  const h = { undo() { const prev = history.pop(); if (prev) { const log = z.log; z = prev; if (log) z.log = log; } } };
  for (const s of steps || []) {
    if (s.test) {
      const opp = s.opp ? Z.STARTERS[s.opp].make() : undefined;
      const r = Z.runHeadless(R, Z.normalise(cp(z)), s.test, s.test === 'sumo' || s.test === 'race' ? opp || cp(z) : undefined);
      G.addLog(z, G.logRow(z, s.test, r, s.opp ? 'starter:' + s.opp : 'self'));
      (s.results || (s.results = [])).push(r);
    } else if (s.act) {
      if (s.act.length < 2) history.push(Z.normalise(cp(z)));
      s.act(z, h);
      z = Object.assign(Z.normalise(z), { log: z.log });
      if (!z.log) delete z.log;
    }
  }
  return z;
}

// make-starters: args (Node) and build (runs in the page)
export function args(id) { return { critter: starter(id) }; }
export const build = async ({ critter }) => {
  startNewCritter('ks2');
  for (let i = 0; i < 200 && !critterApp; i++) await new Promise(r => setTimeout(r, 50));
  critterApp.setCritter(critter);
};
export const HERE = fileURLToPath(import.meta.url);
