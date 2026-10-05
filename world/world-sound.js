/* CodeJump · 3D World — sound: a small Web Audio synth (no sound files) and read-aloud speech.
 * world-app.js passes createSound() to the runtime as opts.sound; the runtime only calls these methods, so it
 * stays free of browser APIs and runs headlessly without sound.
 *
 *   const snd = createSound();
 *   snd.play('coin') -> seconds it lasts · snd.note('C4', secs) · snd.volume(0..100) · snd.speak(text) · snd.stop()
 */

export const SOUNDS = [['pop', 'pop'], ['beep', 'beep'], ['coin', 'coin'], ['jump', 'jump'], ['boing', 'boing'], ['laser', 'laser'],
  ['magic', 'magic'], ['drum', 'drum'], ['splash', 'splash'], ['win', 'win'], ['lose', 'lose'], ['click', 'click']];

export const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'];
const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function noteFreq(n) {
  const m = /^([A-G])(\d)$/.exec(String(n));
  if (!m) return 440;
  return 440 * Math.pow(2, (SEMI[m[1]] + (Number(m[2]) + 1) * 12 - 69) / 12);
}

// each sound: a list of [startSecs, durationSecs, wave, fromHz, toHz, gain] tones, or 'noise' bursts
const RECIPES = {
  pop: [[0, 0.08, 'sine', 600, 200, 0.6]],
  beep: [[0, 0.18, 'square', 880, 880, 0.25]],
  coin: [[0, 0.08, 'square', 988, 988, 0.25], [0.08, 0.22, 'square', 1319, 1319, 0.25]],
  jump: [[0, 0.25, 'square', 300, 900, 0.22]],
  boing: [[0, 0.45, 'sine', 140, 420, 0.6], [0.05, 0.4, 'triangle', 280, 160, 0.3]],
  laser: [[0, 0.3, 'sawtooth', 1600, 200, 0.18]],
  magic: [[0, 0.12, 'sine', 784, 784, 0.3], [0.1, 0.12, 'sine', 988, 988, 0.3], [0.2, 0.12, 'sine', 1175, 1175, 0.3], [0.3, 0.3, 'sine', 1568, 1568, 0.3]],
  drum: [['noise', 0, 0.12, 0.6], [0, 0.15, 'sine', 160, 50, 0.8]],
  splash: [['noise', 0, 0.5, 0.45]],
  win: [[0, 0.12, 'triangle', 523, 523, 0.4], [0.12, 0.12, 'triangle', 659, 659, 0.4], [0.24, 0.12, 'triangle', 784, 784, 0.4], [0.36, 0.35, 'triangle', 1047, 1047, 0.4]],
  lose: [[0, 0.2, 'triangle', 392, 392, 0.4], [0.2, 0.2, 'triangle', 330, 330, 0.4], [0.4, 0.45, 'triangle', 262, 200, 0.4]],
  click: [[0, 0.03, 'square', 1500, 1500, 0.2]]
};
export function soundLength(name) {
  const r = RECIPES[name]; if (!r) return 0;
  return Math.max(...r.map(t => (t[0] === 'noise' ? t[1] + t[2] : t[0] + t[1])));
}

export function createSound() {
  let ctx = null, master = null, vol = 0.8, noiseBuf = null, unlocked = false;
  const live = new Set();
  function audio() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return ctx; }
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return null;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = vol; master.connect(ctx.destination);
    return ctx;
  }
  function tone(at, dur, wave, f0, f1, g) {
    const c = ctx, o = c.createOscillator(), e = c.createGain();
    o.type = wave; o.frequency.setValueAtTime(f0, at); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), at + dur);
    e.gain.setValueAtTime(0.0001, at); e.gain.exponentialRampToValueAtTime(g, at + 0.01); e.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(e); e.connect(master); o.start(at); o.stop(at + dur + 0.02);
    live.add(o); o.onended = () => live.delete(o);
  }
  function noise(at, dur, g) {
    const c = ctx;
    if (!noiseBuf) { noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = c.createBufferSource(), e = c.createGain();
    s.buffer = noiseBuf; e.gain.setValueAtTime(g, at); e.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    s.connect(e); e.connect(master); s.start(at); s.stop(at + dur + 0.02);
    live.add(s); s.onended = () => live.delete(s);
  }
  return {
    play(name) {
      const r = RECIPES[name]; if (!r || !audio()) return soundLength(name);
      const t = ctx.currentTime + 0.01;
      for (const p of r) { if (p[0] === 'noise') noise(t + p[1], p[2], p[3]); else tone(t + p[0], p[1], p[2], p[3], p[4], p[5]); }
      return soundLength(name);
    },
    note(n, secs) {
      if (!audio()) return;
      const d = Math.max(0.05, Math.min(10, secs)), t = ctx.currentTime + 0.01;
      tone(t, d, 'triangle', noteFreq(n), noteFreq(n), 0.35);
    },
    volume(v) { vol = Math.max(0, Math.min(100, v)) / 100; if (master) master.gain.value = vol; },
    speak(text) {
      try {
        if (typeof speechSynthesis === 'undefined' || !text) return;
        const u = new SpeechSynthesisUtterance(String(text).slice(0, 200)); u.volume = vol; u.lang = 'en-GB';
        speechSynthesis.resume(); speechSynthesis.speak(u);
      } catch (e) { /* no speech on this device */ }
    },
    // iPads/iPhones only let a page speak after speech has been started straight from a tap: call this from Run
    unlock() {
      try { audio(); } catch (e) { /* no Web Audio */ }
      try {
        if (unlocked || typeof speechSynthesis === 'undefined') return;
        const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.resume(); speechSynthesis.speak(u); unlocked = true;
      } catch (e) { /* no speech on this device */ }
    },
    stop() {
      for (const s of live) { try { s.stop(); } catch (e) { /* already stopped */ } }
      live.clear();
      try { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); } catch (e) { /* none */ }
    }
  };
}
