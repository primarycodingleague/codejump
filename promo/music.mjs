// The launch video's backing track, made from scratch in code (so there is no licence to worry about).
// 120 beats a minute, C – G – Am – F, one chord per 2-second bar: a soft start, drums from bar 3, a held last chord.
import { writeFileSync } from 'node:fs';

export function makeMusic(file, length = 34) {
  const SR = 44100, N = Math.round(length * SR), Lb = new Float32Array(N), Rb = new Float32Array(N);
  const BEAT = 0.5, BAR = 2, hz = m => 440 * Math.pow(2, (m - 69) / 12);
  let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
  const add = (t0, dur, fn, pan = 0) => { // fn(seconds since the note began) → sample
    const a = Math.max(0, Math.round(t0 * SR)), b = Math.min(N, Math.round((t0 + dur) * SR)), l = Math.cos((pan + 1) * Math.PI / 4), r = Math.sin((pan + 1) * Math.PI / 4);
    for (let i = a; i < b; i++) { const v = fn((i - a) / SR); Lb[i] += v * l; Rb[i] += v * r; }
  };
  const tri = ph => 2 * Math.abs(2 * (ph - Math.floor(ph + .5))) - 1;
  const pulse = (ph, d) => { const x = ph - Math.floor(ph); return x < d ? 1 : -1; };
  const env = (t, a, d) => Math.min(1, t / a) * Math.exp(-t / d);
  const bass = (t0, m, len, vol = .30) => add(t0, len, t => tri(t * hz(m)) * vol * Math.min(1, t / .005) * Math.min(1, (len - t) / .03));
  const pluck = (t0, m, vol = .07, pan = 0, d = .14) => add(t0, .5, t => (pulse(t * hz(m), .25) * .6 + tri(t * hz(m)) * .4) * vol * env(t, .004, d), pan);
  const lead = (t0, m, len, vol = .10) => add(t0, len + .25, t => (tri(t * hz(m) * (1 + .004 * Math.sin(t * 34))) * .8 + pulse(t * hz(m), .5) * .12) * vol * Math.min(1, t / .01) * (t < len ? 1 : Math.exp(-(t - len) / .07)), .15);
  const kick = (t0, vol = .5) => add(t0, .28, t => Math.sin(2 * Math.PI * (48 * t + 70 * .045 * (1 - Math.exp(-t / .045)))) * vol * Math.exp(-t / .11));
  const hat = (t0, vol = .05) => { let p = 0; add(t0, .06, t => { const n = rnd(), v = n - p; p = n; return v * vol * Math.exp(-t / .016); }, .3); };
  const clap = (t0, vol = .13) => { let lp = 0; add(t0, .2, t => { lp += (rnd() - lp) * .45; return lp * vol * Math.exp(-t / .06) * (1 + .6 * Math.sin(t * 900)); }, -.2); };

  const CH = [[48, 60, 64, 67], [43, 59, 62, 67], [45, 60, 64, 69], [41, 60, 65, 69]]; // root for the bass, then the chord
  const TUNE = [ // [beat in the bar, note, beats long] for each bar of the 4-bar tune
    [[0, 76, 1], [1, 79, 1], [2, 84, 1.5], [3.5, 79, .5]],
    [[0, 83, 1], [1, 79, 1], [2, 74, 2]],
    [[0, 72, 1], [1, 76, 1], [2, 81, 1.5], [3.5, 76, .5]],
    [[0, 77, 1], [1, 81, 1], [2, 79, 1], [3, 74, 1]],
  ];
  const bars = Math.floor(length / BAR) - 1; // the last bar is the held chord
  for (let b = 0; b < bars; b++) {
    const t = b * BAR, c = CH[b % 4], full = b >= 2;
    for (let s = 0; s < 16; s++) pluck(t + s * BEAT / 4, c[1 + [0, 1, 2, 1][s % 4]] + (s % 8 >= 4 ? 12 : 0), full ? .06 : .075, s % 2 ? .5 : -.5);
    if (!full) { bass(t, c[0], 1.9, .2); if (b === 1) for (let k = 0; k < 4; k++) clap(t + 1 + k * .25, .05 + k * .03); continue; }
    for (let k = 0; k < 8; k++) bass(t + k * BEAT / 2, c[0] + (k % 2 ? 12 : 0), .22);
    for (let k = 0; k < 4; k++) { kick(t + k * BEAT); hat(t + k * BEAT + BEAT / 2, .07); hat(t + k * BEAT, .03); if (k % 2) clap(t + k * BEAT); }
    for (const [at, m, len] of TUNE[b % 4]) lead(t + at * BEAT, m, len * BEAT * .9);
    if (b % 4 === 3) for (let k = 0; k < 4; k++) clap(t + 1.5 + k * .125, .07); // a little fill into the next four bars
  }
  const te = bars * BAR; kick(te, .6); clap(te, .1); bass(te, 36, 1.8, .3);
  for (const [i, m] of [60, 64, 67, 72, 76, 84].entries()) add(te + i * .03, length - te, t => (tri(t * hz(m)) * .7 + pulse(t * hz(m), .25) * .2) * .075 * Math.min(1, t / .01) * Math.exp(-t / .7), (i - 2.5) / 4);

  // a gentle low-pass, a soft limit, and short fades at both ends
  const buf = Buffer.alloc(44 + N * 4); let a = 0, c = 0;
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) {
    a += (Lb[i] - a) * .55; c += (Rb[i] - c) * .55;
    const g = Math.min(1, i / (SR * .01), (N - i) / (SR * .4)) * 1.5;
    buf.writeInt16LE(Math.round(Math.tanh(a * g) * 30000), 44 + i * 4); buf.writeInt16LE(Math.round(Math.tanh(c * g) * 30000), 46 + i * 4);
  }
  writeFileSync(file, buf);
}
