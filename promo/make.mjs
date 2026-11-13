// Make the CodeJump launch video for social media, in three shapes:
//   node promo/make.mjs            → promo/codejump-launch-vertical.mp4 (9:16), -square.mp4 (1:1), -wide.mp4 (16:9)
//   node promo/make.mjs vertical   → just one;   add "still 12.5" to save one frame as a picture instead (for checking)
// The pictures of the labs are real clips from the Teacher Guide (guide/media, made by guide/tools from the real app).
// Words and timings are in SPEC below; composer.html draws each frame; music.mjs makes the backing track.
// Needs ffmpeg and Playwright's Chromium (the one the tests use).
import { mkdirSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { makeMusic } from './music.mjs';

const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, '..'), OUT = join(HERE, 'out'), FPS = 25;
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require(join(ROOT, 'tests/node_modules/playwright'))); } catch { ({ chromium } = require('playwright')); }

const PER = 2; // seconds a lab is on screen (one bar of the music)
// [id, clip in guide/media (or a still picture), start in the clip, title, line, colour, which part to keep when cropped (0 left – 1 right), zoom, which part to keep up and down]
const LABS = [
  ['platformer', 'platformer/step5.mp4', 0.2, 'Platformer Lab', 'Design your own game, then play it', '#4fc3f7', .5],
  ['stage', 'stage/step4.mp4', 0.3, 'Stage Lab', 'Bring stories to life with code blocks', '#ffb347', .75],
  ['critter', 'critter/step5.mp4', 1.6, 'Critter Lab', 'Build a creature. Then race it!', '#ff8a5c', .5],
  ['world3d', 'world3d/step6.mp4', 2.6, '3D World', 'Code your own 3D world', '#7ed957', .8],
  ['build', 'build/step6.mp4', 0.0, 'Build Lab', 'Blocks or Python in a world of blocks', '#c9a227', .85],
  ['robot', 'robot/step5.mp4', 2.6, 'Robot Lab', 'Program a talking robot', '#ffd23f', .8],
  ['ai', 'ai/step3.mp4', 2.6, 'AI Lab', 'Teach a computer to spot your drawings', '#b388ff', .5],
  ['train', 'train/step2.mp4', 1.8, 'Train Lab', 'Run a railway with code', '#3ddc97', 1, 1.4, .25],
  ['turtle', 'turtle/step5.mp4', 0.6, 'Turtle Lab', 'Draw patterns with typed code', '#ff6b81', .9],
  ['web', '../../lessons/pics/web-18-festival.jpg', 0, 'Web Lab', 'Build a real website', '#5bc0eb', .5],
];
const N_LESSONS = readdirSync(join(ROOT, 'lessons/pics')).filter(f => f.endsWith('.jpg')).length;
const L0 = 4 + LABS.length * PER;
const TIMES = { labs: 4, collab: L0, teach: L0 + 4, safe: L0 + 8, where: L0 + 12, end: L0 + 14 };
const LENGTH = TIMES.end + 4;
const SHAPES = { vertical: ['v', 1080, 1920], square: ['s', 1080, 1080], wide: ['w', 1920, 1080] };

// 1. the clips as frames (Playwright's Chromium can't play H.264, and frames keep every render the same)
function frames() {
  const n = {};
  for (const [id, src, at] of [...LABS, ['collab', 'collab/step6.mp4', 1]]) {
    const dir = join(OUT, 'frames', id); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
    const file = join(ROOT, 'guide/media', src);
    if (src.endsWith('.jpg')) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', file, '-q:v', '2', join(dir, '001.jpg')]);
    else execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(at), '-i', file, '-t', String((id === 'collab' ? 4 : PER) + .1), '-r', String(FPS), '-q:v', '2', join(dir, '%03d.jpg')]);
    n[id] = readdirSync(dir).length;
  }
  return n;
}

function spec(mode, n) {
  const pics = readdirSync(join(ROOT, 'lessons/pics')).filter(f => f.endsWith('.jpg'));
  const pick = Array.from({ length: 48 }, (_, i) => 'file://' + join(ROOT, 'lessons/pics', pics[(i * 37 + 5) % pics.length])); // a spread across the labs
  return {
    mode, length: LENGTH, per: PER, times: TIMES, collab: n.collab, pics: pick,
    labs: LABS.map(([id, src, , title, sub, col, fx, zoom, fy]) => ({ id, title, sub, col, fx, zoom, fy, frames: n[id], still: src.endsWith('.jpg') })),
    together: { id: 'collab', title: 'Build it together', sub: 'Up to 6 classmates on one project, live', col: '#ae853e', fx: .6 },
    safe: ['No public forums or galleries', 'No strangers: teamwork is invite-only', 'Teachers see their own class’s work'],
    teach: [`${N_LESSONS} ready-made lessons`, 'Plans, slides and starter projects', 'Classes, hand-in and live teamwork'],
    where: ['Laptops', 'Chromebooks', 'iPads', 'Ages 5–14', 'Free. Always.'],
  };
}

function encoder(file, wav) {
  const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', wav,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', file],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => p.on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res()));
  return { write: buf => new Promise(r => p.stdin.write(buf) ? r() : p.stdin.once('drain', r)), end: () => { p.stdin.end(); return done; } };
}

const args = process.argv.slice(2), si = args.indexOf('still'), stills = si >= 0 ? args.slice(si + 1).map(Number) : null;
const want = args.filter((a, i) => SHAPES[a] && (si < 0 || i < si)); const shapes = want.length ? want : Object.keys(SHAPES);
mkdirSync(OUT, { recursive: true });
const n = frames(), wav = join(OUT, 'music.wav'); makeMusic(wav, LENGTH);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
for (const name of shapes) {
  const [mode, w, h] = SHAPES[name];
  const page = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('page error:', e.message));
  await page.goto('file://' + join(HERE, 'composer.html'));
  await page.evaluate(([sp, base]) => window.load(sp, base), [spec(mode, n), 'file://' + OUT + '/']);
  if (stills) { for (const t of stills) { await page.evaluate(t => render(t), t); writeFileSync(join(OUT, `${name}-${t}.jpg`), await page.screenshot({ type: 'jpeg', quality: 85 })); } await page.close(); continue; }
  const file = join(HERE, `codejump-launch-${name}.mp4`), enc = encoder(file, wav);
  for (let f = 0; f < LENGTH * FPS; f++) { await page.evaluate(t => render(t), f / FPS); await enc.write(await page.screenshot({ type: 'jpeg', quality: 95 })); }
  await enc.end(); await page.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', file, '-an', '-c:v', 'copy', '-movflags', '+faststart', file.replace(/\.mp4$/, '-silent.mp4')]); // for adding a track in the social app
  console.log(file, LENGTH + ' s');
}
await b.close();
