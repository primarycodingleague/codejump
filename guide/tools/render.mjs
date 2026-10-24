// Render a Teacher Guide topic's videos from its shots: the full captioned video, a silent loop per step and posters.
//   node guide/tools/render.mjs collab        (after node guide/tools/capture-collab.mjs)
// The spec for each topic is in specs.mjs (which shots make each step, and how long each is on screen).
// Frames are drawn by composer.html (deterministic render(t)), grabbed at 25 fps and piped into ffmpeg.
import { readFileSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { browser } from '../../tests/lib.mjs';
import { HERE, ROOT } from './lib.mjs';
import { SPECS } from './specs.mjs';

const FPS = 25;
const topic = process.argv[2];
if (!SPECS[topic]) { console.log('Topics:', Object.keys(SPECS).join(', ')); process.exit(1); }
const SRC = join(HERE, 'out', topic), OUT = join(ROOT, 'guide', 'media', topic);
mkdirSync(OUT, { recursive: true });
const shots = JSON.parse(readFileSync(join(SRC, 'shots.json'), 'utf8'));

// spec from SPECS: steps: [{n, title, sub, who, beats: [[shotName, dur, opts?]]}]
function spec(captions, w, h, only) {
  const s = SPECS[topic];
  const steps = s.steps.filter(st => !only || st.n === only).map(st => ({
    n: st.n, title: st.title, sub: st.sub, who: st.who,
    beats: st.beats.map(([name, dur, o]) => ({ img: shots[name].img, box: shots[name].box, dur, ...(o || {}) }))
  }));
  return { w, h, captions, title: s.title, sub: s.sub, intro: only ? 0 : s.intro ?? 2.4, outro: only ? 0 : s.outro ?? 2.4, outroText: s.outroText, loop: !!only, steps };
}

function ffmpeg(file, w, h, crf) {
  const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-vf', `scale=${w}:${h}:flags=lanczos`, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', file],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => p.on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res()));
  return { write: buf => new Promise(r => p.stdin.write(buf) ? r() : p.stdin.once('drain', r)), end: () => { p.stdin.end(); return done; } };
}

const b = await browser();
async function render(sp, file, crf, poster) {
  const page = await b.newPage({ viewport: { width: sp.w, height: sp.h } });
  await page.goto('file://' + join(HERE, 'composer.html'));
  const info = await page.evaluate(([sp, base]) => window.load(sp, base), [sp, 'file://' + SRC + '/']);
  const frames = Math.round(info.length * FPS), enc = ffmpeg(file, sp.w, sp.h, crf);
  for (let f = 0; f < frames; f++) {
    await page.evaluate(t => render(t), f / FPS);
    await enc.write(await page.screenshot({ type: 'jpeg', quality: 94 }));
  }
  await enc.end();
  if (poster) { // a still: the moment the ring is on the target (or a given time)
    await page.evaluate(t => render(t), poster(info));
    writeFileSync(file.replace(/\.mp4$/, '.jpg'), await page.screenshot({ type: 'jpeg', quality: 82 }));
  }
  await page.close();
  return info;
}

const S = SPECS[topic];
const full = await render(spec(true, 1280, 720), join(OUT, 'full.mp4'), 20, info => info.starts[0] + 1.6);
console.log('full.mp4', full.length + 's', 'chapters', JSON.stringify(full.starts));
for (const st of S.steps) {
  // loops aim for about 200–450 KB: CRF 26, or a little higher for a busy step
  for (let crf = 26; ; crf += 2) {
    const f = join(OUT, `step${st.n}.mp4`);
    const info = await render(spec(false, 960, 540, st.n), f, crf, info => Math.min(info.length - 0.05, (st.beats[0][1]) * 0.62));
    const kb = Math.round(statSync(f).size / 1000);
    if (kb <= 450 || crf >= 32) { console.log(`step${st.n}.mp4`, info.length + 's', kb + ' KB', 'CRF ' + crf); break; }
  }
}
// captions as a text track too (screen readers, and the words if the picture can't be seen)
const vt = s => { const m = Math.floor(s / 60), x = (s - m * 60).toFixed(3).padStart(6, '0'); return `00:${String(m).padStart(2, '0')}:${x}`; };
const ends = full.starts.slice(1).concat([full.length - (S.outro ?? 2.4)]);
writeFileSync(join(OUT, 'full.vtt'), 'WEBVTT\n\n' + S.steps.map((st, i) => `${vt(full.starts[i])} --> ${vt(ends[i])}\nStep ${st.n}: ${st.title}. ${st.sub}\n`).join('\n'));
writeFileSync(join(OUT, 'timing.json'), JSON.stringify({ length: full.length, starts: full.starts }, null, 1) + '\n');
await b.close();
