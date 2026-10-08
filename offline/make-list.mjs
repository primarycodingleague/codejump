// Makes offline.json: every file CodeJump needs to work with no internet on an iPad that has it on its Home Screen
// (see sw.js and "OFFLINE (iPad)" in build-and-play.html). Each file has a short fingerprint so an iPad only downloads
// what changed. Run after changing any app file:  node offline/make-list.mjs   (tests/files.test.mjs checks it's current)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['home', 'craft', 'critter', 'world', 'robot', 'ai', 'train', 'lessons'];
const FILES = ['index.html', 'app.webmanifest', 'microbit-micropython-v2.hex'];
// left out: the Critter video guides (15 MB; iPad video needs the internet anyway), lesson build scripts, notes
const SKIP = p => /^critter\/guides\//.test(p) || /^lessons\/(builds\/|make-starters)/.test(p) || /\.(md|txt|license)$/i.test(p) || /(^|\/)\./.test(p);
const BL = 'https://unpkg.com/blockly@10.4.3/';
export const EXT = [
  BL + 'blockly_compressed.js', BL + 'blocks_compressed.js', BL + 'msg/en.js',
  ...['sprites.png', 'sprites.svg', '1x1.gif', 'click.mp3', 'delete.mp3', 'disconnect.mp3', 'click.wav', 'delete.wav', 'disconnect.wav',
    'dropdown-arrow.svg', 'handclosed.cur', 'handdelete.cur', 'handopen.cur', 'pilcrow.png', 'quote0.png', 'quote1.png'].map(f => BL + 'media/' + f),
  'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
  'https://cdn.jsdelivr.net/npm/@microbit/microbit-fs@0.9.2/dist/bundles/microbit-fs.umd.min.js',
  'https://cdn.jsdelivr.net/npm/dapjs@2.3.0/dist/dap.umd.min.js',
];

function walk(d, out) {
  for (const f of readdirSync(join(ROOT, d)).sort()) {
    const p = d + '/' + f;
    if (statSync(join(ROOT, p)).isDirectory()) walk(p, out); else if (!SKIP(p)) out.push(p);
  }
}
export function makeList() {
  const paths = [...FILES];
  for (const d of DIRS) walk(d, paths);
  const files = paths.map(p => { const b = readFileSync(join(ROOT, p)); return [p, b.length, createHash('sha256').update(b).digest('hex').slice(0, 16)]; });
  const v = createHash('sha256').update(JSON.stringify([files, EXT])).digest('hex').slice(0, 12);
  return { v, files, ext: EXT };
}
export const text = l => JSON.stringify(l).replace(/\],\[/g, '],\n[') + '\n';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const l = makeList();
  writeFileSync(join(ROOT, 'offline.json'), text(l));
  console.log('offline.json: ' + l.files.length + ' files, ' + (l.files.reduce((a, f) => a + f[1], 0) / 1e6).toFixed(1) + ' MB, version ' + l.v);
}
