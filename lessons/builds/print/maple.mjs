// Maple Street Makers — the Print Lab's lesson unit (lessons/units/print.js): the starter design for each new lesson and
// the answer a pupil makes by following the Lesson card. Starters run in Node (make-starters.mjs, via lessons/builds/
// print-*.mjs) and in the tests; answers take the model (createModel) so they can Group exactly like the app does.
// Every starter carries its brief (the design challenge whose rules tick themselves, print-model.js RULES).
const PM = await import(new URL('../../../print/print-model.js', import.meta.url).href);

const C = { red: '#e8453c', orange: '#f59f18', yellow: '#f5d63c', green: '#5cb85c', teal: '#2fb7a8', blue: '#3b7fc4', purple: '#7c5cff', pink: '#e45fa5', white: '#ffffff', grey: '#9aa3ad', dark: '#3a3f47', brown: '#8b5a2b' };
export const COL = C;

// The brief (challenge) for each new lesson.
export const BRIEFS = {
  'print-1-stand': { title: 'A table number for the café', text: 'Rosa at the Corner Café needs a number to stand on each table. Follow the plan exactly: a base 60 mm wide, a back 40 mm tall, and the table number on the front.', rules: [{ k: 'minw', v: 55 }, { k: 'maxw', v: 65 }, { k: 'minh', v: 35 }, { k: 'maxh', v: 45 }, { k: 'text' }, { k: 'ready' }] },
  'print-3-birdbox': { title: 'A bird box for Leaf & Root', text: 'Mr Adeyemi at the Leaf & Root garden centre wants a little bird box to sell. Break it into parts first: a base, a box, a roof, a round door and a perch.', rules: [{ k: 'shapes', v: 4 }, { k: 'uses', v: 'roof' }, { k: 'hole' }, { k: 'maxh', v: 90 }, { k: 'ready' }] },
  'print-4-pencils': { title: 'A pencil block for the Book Nook', text: 'The Book Nook wants a block that holds 5 pencils in a row. Every hole is the same size and the same distance from the next one.', rules: [{ k: 'holes', v: 5 }, { k: 'repeat', v: 5 }, { k: 'maxw', v: 100 }, { k: 'ready' }] },
  'print-5-boat': { title: 'Fix the toy boat', text: 'The Toy Box sent this boat back: it won’t print. Find every bug with Check & print and fix them one at a time.', rules: [{ k: 'shapes', v: 3 }, { k: 'hole' }, { k: 'maxw', v: 100 }, { k: 'ready' }] },
  'print-6-gift': { title: 'A gift for a Maple Street shop', text: 'Choose a shop on Maple Street and design something it could sell. Plan it in steps, break it into parts, and repeat at least one part.', rules: [{ k: 'shapes', v: 4 }, { k: 'repeat', v: 3 }, { k: 'maxw', v: 100 }, { k: 'maxd', v: 100 }, { k: 'maxh', v: 60 }, { k: 'ready' }] },
  'print-7-bookmark': { title: 'A bookmark for the Book Nook', text: 'Long enough to stick out of a book (140 to 160 mm), thin enough to close the book on (3 mm or less), with a word on it and a hole for a ribbon.', rules: [{ k: 'minw', v: 140 }, { k: 'maxw', v: 160 }, { k: 'maxd', v: 35 }, { k: 'maxh', v: 3 }, { k: 'text' }, { k: 'hole' }, { k: 'ready' }] },
  'print-8-trophy': { title: 'A sports day trophy', text: 'Maple Street School needs a trophy between 80 and 100 mm tall and between 40 and 60 mm wide, with a star on top, in at least two colours.', rules: [{ k: 'minh', v: 80 }, { k: 'maxh', v: 100 }, { k: 'minw', v: 40 }, { k: 'maxw', v: 60 }, { k: 'uses', v: 'star' }, { k: 'colours', v: 2 }, { k: 'ready' }] },
  'print-9-fit': { title: 'A fit test card', text: 'Printers aren’t perfectly exact. Measure a pencil, then make a card with 5 holes that start at that size and get 0.4 mm wider each time. Print it and see which hole fits.', rules: [{ k: 'holes', v: 5 }, { k: 'maxw', v: 100 }, { k: 'maxh', v: 5 }, { k: 'text' }, { k: 'ready' }] },
  'print-10-pot': { title: 'A plant pot for Leaf & Root', text: 'At least 60 mm tall, no wider than 80 mm, with strong walls (2 mm or more) and a hole in the bottom so the water drains out.', rules: [{ k: 'minh', v: 60 }, { k: 'maxw', v: 80 }, { k: 'wall', v: 2 }, { k: 'holes', v: 2 }, { k: 'ready' }] },
  'print-11-tag': { title: 'A pet tag for Pip’s Pet Parlour', text: 'A tag for a dog’s collar: no wider than 35 mm, no taller than 4 mm, with the pet’s name on it and a hole for the ring.', rules: [{ k: 'maxw', v: 3 }, { k: 'minh', v: 4 }, { k: 'text' }, { k: 'hole' }, { k: 'ready' }] },
  'print-13-box': { title: 'A trinket box for Gem & Thread', text: 'A box 50 mm wide, 40 mm deep and 30 mm tall, with walls and a floor exactly 3 mm thick. Work out the size of the hole before you make it.', rules: [{ k: 'wall', v: 3 }, { k: 'hole' }, { k: 'maxw', v: 60 }, { k: 'minh', v: 25 }, { k: 'ready' }] },
  'print-14-knobs': { title: 'Drawer knobs for Ollie’s Workbench', text: 'Ollie makes cupboards in three sizes. Make one knob, group it, then use the same knob three times: small, medium and large.', rules: [{ k: 'parts', v: 3 }, { k: 'maxw', v: 170 }, { k: 'ready' }] },
  'print-16-medals': { title: '30 medals for sports day', text: 'The school needs 30 medals and has one 250 g reel of plastic. Each medal needs some writing and a hole for a ribbon, and must use no more than 6 g.', rules: [{ k: 'maxg', v: 6 }, { k: 'maxh', v: 5 }, { k: 'text' }, { k: 'hole' }, { k: 'ready' }] },
  'print-17-gears': { title: 'A gear set for the Toy Box', text: 'Three gears that turn each other. Gears only mesh when their teeth are the same size: width ÷ teeth must be the same for every gear.', rules: [{ k: 'mesh' }, { k: 'uses', v: 'gear' }, { k: 'maxw', v: 170 }, { k: 'ready' }] },
  'print-18-fair': { title: 'The Maple Street Fair', text: 'Design a product range for the fair: one part you group and use at two or more sizes, walls at least 2 mm thick, and no more than 40 g of plastic for the whole range.', rules: [{ k: 'parts', v: 2 }, { k: 'wall', v: 2 }, { k: 'maxg', v: 40 }, { k: 'ready' }] }
};

let n = 0;
const mk = (kind, o) => { const ob = PM.makeObj(kind, { ...o, id: o.id || 'o' + (++n) }); for (const f of ['wall', 'flip', 'teeth', 'round', 'hole', 'text']) if (o[f] != null) ob[f] = o[f]; return ob; };
// a group whose solid parts fill w × d × h (children in the group's own space: bottom middle at 0, 0, 0)
const grp = (children, w, d, h, color, o = {}) => ({ id: 'o' + (++n), kind: 'group', hole: false, color, x: o.x || 0, y: o.y || 0, z: 0, w, d, h, bw: w, bd: d, bh: h, rx: 0, ry: 0, rz: 0, flip: 0, children });
function start(id, title, objs = []) {
  const p = PM.newProject(); p.title = title; p.objs = objs;
  if (BRIEFS[id]) p.brief = PM.cleanBrief(BRIEFS[id]);
  return p;
}
const byId = (p, id) => p.objs.find(o => o.id === id);

// ───────────── starters (what a pupil opens) ─────────────
export const STARTERS = {
  'print-1-stand': () => { n = 0; return start('print-1-stand', 'Table number', [mk('box', { w: 60, d: 20, h: 5, color: C.white })]); },
  'print-3-birdbox': () => { n = 0; return start('print-3-birdbox', 'Bird box', [mk('box', { w: 60, d: 60, h: 4, color: C.green })]); },
  'print-4-pencils': () => { n = 0; return start('print-4-pencils', 'Pencil block', [mk('box', { w: 90, d: 30, h: 25, color: C.teal }), mk('cylinder', { x: -30, w: 9, d: 9, h: 30, z: 5, hole: true })]); },
  'print-5-boat': () => {
    n = 0;
    return start('print-5-boat', 'Toy boat', [
      mk('box', { w: 80, d: 30, h: 10, z: -3, color: C.blue }),                    // bug: the hull goes under the plate
      mk('box', { x: -5, w: 30, d: 20, h: 16, z: 14, color: C.white }),            // bug: the cabin floats above the deck
      mk('cylinder', { x: 25, w: 0.5, d: 0.5, h: 40, z: 7, color: C.brown }),      // bug: the mast is too thin to print
      mk('cylinder', { x: -5, y: -10, w: 6, d: 6, h: 8, rx: 90, z: 22, hole: true }) // bug: the porthole isn't grouped, so it cuts nothing
    ]);
  },
  'print-6-gift': () => { n = 0; return start('print-6-gift', 'My gift'); },
  'print-7-bookmark': () => { n = 0; return start('print-7-bookmark', 'Bookmark', [mk('box', { w: 100, d: 30, h: 5, color: C.purple })]); },
  'print-8-trophy': () => { n = 0; return start('print-8-trophy', 'Trophy', [mk('box', { w: 50, d: 50, h: 10, color: C.yellow }), mk('cylinder', { w: 30, d: 30, h: 110, z: 10, color: C.yellow })]); },
  'print-9-fit': () => { n = 0; return start('print-9-fit', 'Fit test card', [mk('box', { w: 96, d: 22, h: 3, color: C.orange }), mk('cylinder', { x: -36, w: 7, d: 7, h: 6, z: -1, hole: true })]); },
  'print-10-pot': () => { n = 0; return start('print-10-pot', 'Plant pot', [grp([mk('cylinder', { w: 90, d: 90, h: 50, color: C.red }), mk('cylinder', { w: 88, d: 88, h: 50, z: 1, hole: true })], 90, 90, 50, C.red)]); },
  'print-11-tag': () => { n = 0; return start('print-11-tag', 'Pet tag', [mk('cylinder', { w: 30, d: 30, h: 2, color: C.pink }), mk('text', { text: 'REX', w: 18, d: 8, h: 1, z: 2, y: -3, color: C.white })]); },
  'print-12-order': () => { n = 0; return start('print-12-order', 'My order'); },
  'print-13-box': () => { n = 0; return start('print-13-box', 'Trinket box', [mk('box', { w: 50, d: 40, h: 30, color: C.purple }), mk('box', { x: 70, w: 48, d: 38, h: 30, z: 1, hole: true })]); },
  'print-14-knobs': () => { n = 0; return start('print-14-knobs', 'Drawer knobs', [mk('cylinder', { w: 12, d: 12, h: 15, color: C.brown }), mk('dome', { w: 24, d: 24, h: 10, z: 15, color: C.brown }), mk('cylinder', { w: 4, d: 4, h: 10, z: -1, hole: true })]); },
  'print-16-medals': () => { n = 0; return start('print-16-medals', 'Medal', [mk('cylinder', { w: 60, d: 60, h: 6, color: C.yellow }), mk('text', { text: '1st', w: 24, d: 14, h: 1, z: 6, color: C.red })]); },
  'print-17-gears': () => { n = 0; return start('print-17-gears', 'Gear set', [mk('gear', { x: -40, w: 30, d: 30, h: 5, teeth: 12, color: C.grey }), mk('gear', { x: 10, w: 40, d: 40, h: 5, teeth: 24, color: C.orange })]); },
  'print-18-fair': () => { n = 0; return start('print-18-fair', 'Fair range'); }
};

// ───────────── answers (what a pupil makes by following the Lesson card) ─────────────
// Each takes the model and the starter project and returns the finished project.
export const ANSWERS = {
  'print-1-stand': (md, p) => {
    p.objs.push(mk('box', { id: 'o2', y: 8, w: 60, d: 4, h: 40, color: C.white }), mk('text', { id: 'o3', text: '7', y: -4, w: 7, d: 10, h: 2, z: 5, color: C.red }));
    return p;
  },
  'print-3-birdbox': (md, p) => {
    p.objs.push(mk('box', { id: 'o2', w: 50, d: 50, h: 60, z: 4, color: C.brown }), mk('roof', { id: 'o3', w: 60, d: 60, h: 20, z: 64, color: C.red }),
      mk('cylinder', { id: 'o4', y: -25, w: 25, d: 25, h: 12, rx: 90, z: 32, hole: true }), mk('cylinder', { id: 'o5', y: -29, w: 6, d: 6, h: 10, rx: 90, z: 22, color: C.yellow }));
    md.group(p, ['o2', 'o4']);
    return p;
  },
  'print-4-pencils': (md, p) => {
    for (const x of [-15, 0, 15, 30]) p.objs.push(mk('cylinder', { id: 'h' + (x + 100), x, w: 9, d: 9, h: 30, z: 5, hole: true }));
    md.group(p, p.objs.map(o => o.id));
    return p;
  },
  'print-5-boat': (md, p) => {
    const [hull, cabin, mast, port] = p.objs;
    hull.z = 0; cabin.z = 10; mast.w = mast.d = 3;
    md.group(p, [cabin.id, port.id]);
    return p;
  },
  'print-6-gift': (md, p) => { // an example: a little picket fence planter for Leaf & Root
    p.objs.push(mk('box', { id: 'b', w: 80, d: 30, h: 5, color: C.green }));
    [-30, -10, 10, 30].forEach((x, i) => p.objs.push(mk('box', { id: 'p' + i, x, y: -12, w: 6, d: 4, h: 30, z: 5, color: C.white })));
    p.objs.push(mk('box', { id: 'r', y: -12, w: 70, d: 3, h: 4, z: 22, color: C.white }));
    return p;
  },
  'print-7-bookmark': (md, p) => {
    const b = p.objs[0]; b.w = 150; b.h = 2;
    p.objs.push(mk('text', { id: 'o2', text: 'READ', w: Math.round(12 * md.textRatio('READ') * 10) / 10, d: 12, h: 1, z: 2, x: 10, color: C.white }),
      mk('cylinder', { id: 'o3', x: -66, w: 5, d: 5, h: 6, z: -1, hole: true }));
    md.group(p, ['o1', 'o3']);
    return p;
  },
  'print-8-trophy': (md, p) => {
    const col = p.objs[1]; col.h = 70; p.objs[0].color = C.blue;
    p.objs.push(mk('star', { id: 'o3', w: 40, d: 40, h: 5, z: 80, color: C.yellow }));
    return p;
  },
  'print-9-fit': (md, p) => {
    [7.4, 7.8, 8.2, 8.6].forEach((w, i) => p.objs.push(mk('cylinder', { id: 'h' + i, x: -36 + 17 * (i + 1), w, d: w, h: 6, z: -1, hole: true })));
    md.group(p, p.objs.map(o => o.id));
    p.objs.push(mk('text', { id: 't', text: 'PENCIL', w: Math.round(5 * md.textRatio('PENCIL') * 10) / 10, d: 5, h: 1, z: 3, y: -7, color: C.white }));
    return p;
  },
  'print-10-pot': (md, p) => {
    const kids = md.ungroup(p, p.objs[0].id), [pot, inside] = kids;
    pot.w = pot.d = 76; pot.h = 65; inside.w = inside.d = 70; inside.h = 65; inside.z = 3;
    p.objs.push(mk('cylinder', { id: 'drain', w: 8, d: 8, h: 10, z: -1, hole: true }));
    md.group(p, p.objs.map(o => o.id));
    return p;
  },
  'print-11-tag': (md, p) => {
    p.brief.rules[0] = { k: 'maxw', v: 35 }; p.brief.rules[1] = { k: 'maxh', v: 4 };
    p.objs.push(mk('cylinder', { id: 'o3', y: 10, w: 4, d: 4, h: 4, z: -1, hole: true }));
    md.group(p, ['o1', 'o3']);
    return p;
  },
  'print-12-order': (md, p) => { // an example: a pupil’s own order — a ring holder for Gem & Thread
    p.brief = PM.cleanBrief({ title: 'A ring holder for Gem & Thread', text: 'A stand for one ring: 30 to 40 mm tall, no wider than 40 mm, with a hole in the base for a pin badge.', rules: [{ k: 'minh', v: 30 }, { k: 'maxh', v: 40 }, { k: 'maxw', v: 40 }, { k: 'hole' }, { k: 'ready' }] });
    p.objs.push(mk('cylinder', { id: 'a', w: 36, d: 36, h: 5, color: C.teal }), mk('cone', { id: 'b', w: 14, d: 14, h: 30, z: 5, color: C.teal }), mk('cylinder', { id: 'c', x: 12, w: 3, d: 3, h: 7, z: -1, hole: true }));
    md.group(p, ['a', 'c']);
    return p;
  },
  'print-13-box': (md, p) => {
    const hole = p.objs[1], wall = 3; // hole = box − 2 × wall; the floor = wall
    Object.assign(hole, { x: 0, w: 50 - 2 * wall, d: 40 - 2 * wall, z: wall });
    md.group(p, ['o1', 'o2']);
    return p;
  },
  'print-14-knobs': (md, p) => {
    const g = md.group(p, p.objs.map(o => o.id));
    const copy = (k, x) => { const c = JSON.parse(JSON.stringify(g)); let i = 0; const re = o => { o.id = 'k' + k + '_' + (i++); (o.children || []).forEach(re); }; re(c); c.w *= k; c.d *= k; c.h *= k; c.x = x; return c; };
    g.x = -50; p.objs.push(copy(1.5, -10), copy(2, 45));
    return p;
  },
  'print-16-medals': (md, p) => {
    const [disc, txt] = p.objs; disc.w = disc.d = 45; disc.h = 3; txt.z = 3; txt.w = 20; txt.d = 11; txt.y = -3;
    p.objs.push(mk('cylinder', { id: 'o3', y: 16, w: 5, d: 5, h: 5, z: -1, hole: true }));
    md.group(p, ['o1', 'o3']);
    return p;
  },
  'print-17-gears': (md, p) => {
    const tooth = 30 / 12; // width ÷ teeth of the first gear = 2.5 mm
    const g2 = p.objs[1]; g2.w = g2.d = 24 * tooth; // 60 mm
    g2.x = -40 + (30 + 60) / 2 - tooth / 2;
    p.objs.push(mk('gear', { id: 'o3', w: 18 * tooth, d: 18 * tooth, h: 5, teeth: 18, x: g2.x + (60 + 45) / 2 - tooth / 2, color: C.teal }));
    return p;
  },
  'print-18-fair': (md, p) => { // an example: a little pot and a big pot from one recipe
    p.objs.push(mk('cylinder', { id: 'a', w: 30, d: 30, h: 30, color: C.green }), mk('cylinder', { id: 'b', w: 24, d: 24, h: 30, z: 3, hole: true }));
    const g = md.group(p, ['a', 'b']); g.x = -30;
    const c = JSON.parse(JSON.stringify(g)); c.id = 'big'; c.children.forEach((k, i) => { k.id = 'big' + i; }); c.w *= 1.5; c.d *= 1.5; c.h *= 1.5; c.x = 25;
    p.objs.push(c);
    return p;
  }
};

export { PM, byId };
