// The launch video's backing track, made from scratch in code (so there is no licence to worry about).
// 120 beats a minute, C – G – Am – F, one chord per 2-second bar: a soft start, the beat from bar 3, a held last chord.
// Soft sounds only (marimba, bells, a warm pad, a round bass, brushed drums) with a little room echo. No buzzy square waves.
import { writeFileSync } from 'node:fs';

export function makeMusic(file, length = 34) {
  const SR = 44100, N = Math.round(length * SR), Lb = new Float32Array(N), Rb = new Float32Array(N);
  const BEAT = 0.5, BAR = 2, TAU = Math.PI * 2, hz = m => 440 * Math.pow(2, (m - 69) / 12);
  let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
  const add = (t0, dur, fn, pan = 0) => { // fn(seconds since the note began) → sample
    const a = Math.max(0, Math.round(t0 * SR)), b = Math.min(N, Math.round((t0 + dur) * SR)), l = Math.cos((pan + 1) * Math.PI / 4), r = Math.sin((pan + 1) * Math.PI / 4);
    for (let i = a; i < b; i++) { const v = fn((i - a) / SR); Lb[i] += v * l; Rb[i] += v * r; }
  };
  const on = (t, a = .004) => Math.min(1, t / a);
  // wooden bar: the note, plus a quick bright knock that dies at once
  const marimba = (t0, m, vol = .16, pan = 0) => { const f = hz(m); add(t0, .9, t => (Math.sin(TAU * f * t) * Math.exp(-t / .22) + Math.sin(TAU * f * 4 * t) * .22 * Math.exp(-t / .035) + Math.sin(TAU * f * 2 * t) * .08 * Math.exp(-t / .1)) * vol * on(t), pan); };
  const bell = (t0, m, vol = .09, pan = .2) => { const f = hz(m); add(t0, 1.6, t => (Math.sin(TAU * f * t) * Math.exp(-t / .45) + Math.sin(TAU * f * 3.01 * t) * .18 * Math.exp(-t / .18) + Math.sin(TAU * f * 5.4 * t) * .05 * Math.exp(-t / .06)) * vol * on(t, .002), pan); };
  const bass = (t0, m, len, vol = .30) => { const f = hz(m); add(t0, len + .08, t => (Math.sin(TAU * f * t) + Math.sin(TAU * f * 2 * t) * .18) * vol * on(t, .012) * (t < len ? 1 : Math.exp(-(t - len) / .03)) * (.6 + .4 * Math.exp(-t / .25))); };
  const pad = (t0, notes, len, vol = .028) => notes.forEach((m, i) => { const f = hz(m); add(t0, len + .5, t => (Math.sin(TAU * f * 1.003 * t) + Math.sin(TAU * f * .997 * t) + Math.sin(TAU * f * 2 * t) * .12) * vol * on(t, .35) * (t < len ? 1 : Math.exp(-(t - len) / .2)), (i - 1) * .5); });
  const kick = (t0, vol = .5) => add(t0, .3, t => Math.sin(TAU * (46 * t + 55 * .05 * (1 - Math.exp(-t / .05)))) * vol * Math.exp(-t / .13) * on(t, .002));
  const snap = (t0, vol = .09) => { let lp = 0, hp = 0; add(t0, .16, t => { const n = rnd(); lp += (n - lp) * .35; hp = lp - (hp + (lp - hp) * .08); return (lp - hp * .2) * vol * Math.exp(-t / .045) * on(t, .001); }, -.15); };
  const shaker = (t0, vol = .018) => { let p = 0; add(t0, .09, t => { const n = rnd(), v = n - p; p = n; return v * vol * Math.sin(Math.min(1, t / .03) * Math.PI / 2) * Math.exp(-t / .03); }, .35); };

  const CH = [[36, 60, 64, 67, 72], [43, 59, 62, 67, 71], [45, 57, 60, 64, 69], [41, 57, 60, 65, 69]]; // bass note, then the chord low to high
  const RIFF = [[0, 1], [1, 3], [1.5, 2], [2.5, 4], [3, 2], [3.5, 3]]; // [beat, which chord note] – a bouncy off-beat pattern
  const TUNE = [ // [beat in the bar, note, ] for each bar of the 4-bar tune (bells)
    [[0, 76], [1, 79], [2, 84], [3.5, 79]],
    [[0, 83], [1.5, 79], [2, 74]],
    [[0, 72], [1, 76], [2, 81], [3.5, 76]],
    [[0, 77], [1, 81], [2, 79], [3, 74]],
  ];
  const bars = Math.floor(length / BAR) - 1; // the last bar is the held chord
  for (let b = 0; b < bars; b++) {
    const t = b * BAR, c = CH[b % 4], full = b >= 2;
    pad(t, [c[1], c[2], c[3]], BAR);
    for (const [at, k] of RIFF) marimba(t + at * BEAT, c[k], full ? .15 : .17, k % 2 ? .35 : -.35);
    if (!full) { marimba(t, c[1] - 12, .12); if (b === 1) for (let k = 0; k < 4; k++) shaker(t + 1 + k * .25, .02 + k * .008); continue; }
    bass(t, c[0], .42); bass(t + 1.5 * BEAT, c[0], .2, .24); bass(t + 2 * BEAT, c[0], .42); bass(t + 3.5 * BEAT, c[0] + 7, .2, .2);
    kick(t); kick(t + 2 * BEAT); kick(t + 2.5 * BEAT, .3); snap(t + BEAT); snap(t + 3 * BEAT);
    for (let k = 0; k < 8; k++) shaker(t + k * BEAT / 2, k % 2 ? .022 : .012);
    if (b >= 4 || b % 4 > 1) for (const [at, m] of TUNE[b % 4]) bell(t + at * BEAT, m);
    if (b % 4 === 3) { snap(t + 3.5 * BEAT, .06); snap(t + 3.75 * BEAT, .08); } // a little lift into the next four bars
  }
  const te = bars * BAR; kick(te, .5); bass(te, 36, 1.4, .3); pad(te, [60, 64, 67], 1.2, .035);
  [60, 64, 67, 72, 76].forEach((m, i) => marimba(te + i * .045, m, .15, (i - 2) / 3)); bell(te + .25, 84, .08); bell(te + .3, 79, .06, -.2);

  // a small room: a few echoes fed back on themselves, mixed in quietly
  const room = (x, taps) => { const y = new Float32Array(N); for (const [d, g] of taps) { const D = Math.round(d * SR), buf = new Float32Array(N); for (let i = D; i < N; i++) { buf[i] = x[i - D] + buf[i - D] * g; y[i] += buf[i] * .25; } } let lp = 0; for (let i = 0; i < N; i++) { lp += (y[i] - lp) * .25; y[i] = lp; } return y; };
  const wl = room(Lb, [[.0297, .72], [.0371, .70], [.0411, .68], [.0437, .66]]), wr = room(Rb, [[.0307, .72], [.0359, .70], [.0421, .68], [.0449, .66]]);

  const buf = Buffer.alloc(44 + N * 4); let a = 0, c = 0;
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  const soft = x => x / (1 + Math.abs(x) * .6); // rounds off the loudest peaks without any buzz
  for (let i = 0; i < N; i++) {
    a += (Lb[i] + wl[i] * .5 - a) * .6; c += (Rb[i] + wr[i] * .5 - c) * .6;
    const g = Math.min(1, i / (SR * .01), (N - i) / (SR * .5)) * 1.7;
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, soft(a * g))) * 30000), 44 + i * 4); buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, soft(c * g))) * 30000), 46 + i * 4);
  }
  writeFileSync(file, buf);
}
