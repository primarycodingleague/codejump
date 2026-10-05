/* CodeJump · Robot Lab — the robot itself: a 3D robot BUST (head and shoulders on a plinth), our own design.
 * A smooth rounded shell, a dark glossy visor with glowing eyes, eyelids and eyebrows, a glowing mouth that opens from a
 * line to an oval, ear lights, an antenna light, a chest light and a nameplate on the plinth.
 *
 * Eight motors, 0–10 like a real servo robot (MOTORS below). Blocks set a motor's TARGET; every frame each motor moves
 * towards its target at its own speed, so movements are smooth and a program can wait until a motor gets there.
 *
 *   const view = createRobotView(THREE, canvas, { onPick(part), controls: OrbitControls });
 *   view.setTarget('HeadTurn', 8) · view.at('HeadTurn') · view.arrived('HeadTurn') · view.setSpeed('HeadTurn', 4)
 *   view.setLight('eyes' | 'ears' | 'chest' | 'antenna' | 'all', '#ff3355') · view.setBody('#e8eef5') · view.setName('Sparky')
 *   view.setBrowTilt(-1..1) · view.blink() · view.setTalk(0..10 | null) · view.reset() · view.start() · view.dispose()
 */

export const MOTORS = [
  // id, label (what pupils see), default
  ['HeadTurn', 'head turn', 5], ['HeadNod', 'head nod', 5], ['HeadTilt', 'head tilt', 5],
  ['EyesSide', 'eyes left/right', 5], ['EyesUp', 'eyes up/down', 5],
  ['Eyelids', 'eyelids', 0], ['Brows', 'eyebrows', 5], ['Mouth', 'mouth', 0]
];
export const DEFAULTS = Object.fromEntries(MOTORS.map(m => [m[0], m[2]]));
export const LIGHTS = { eyes: '#35d0ff', ears: '#35d0ff', chest: '#35d0ff', antenna: '#ff5a3c' };
const D2R = Math.PI / 180;
const clamp10 = v => Math.max(0, Math.min(10, isFinite(v) ? +v : 0));

export function buildRobot(THREE) {
  const shell = new THREE.MeshPhysicalMaterial({ color: 0xeef2f6, roughness: 0.32, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const accent = new THREE.MeshStandardMaterial({ color: 0x2b6fd8, roughness: 0.4, metalness: 0.15 });
  const visor = new THREE.MeshPhysicalMaterial({ color: 0x141821, roughness: 0.12, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.08 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x5d636e, roughness: 0.35, metalness: 0.8 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x22252c, roughness: 0.55, metalness: 0.2 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xae853e, roughness: 0.3, metalness: 0.85 });
  const glow = c => new THREE.MeshStandardMaterial({ color: 0x111111, emissive: new THREE.Color(c), emissiveIntensity: 1.6, roughness: 0.4 });
  const lights = { eyes: glow(LIGHTS.eyes), ears: glow(LIGHTS.ears), chest: glow(LIGHTS.chest), antenna: glow(LIGHTS.antenna) };
  const mesh = (g, m, x = 0, y = 0, z = 0, part) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); if (part) o.userData.part = part; return o; };

  const robot = new THREE.Group();
  // ── plinth with a gold rim and a nameplate
  robot.add(mesh(new THREE.CylinderGeometry(7.2, 7.8, 2.4, 72), dark, 0, 1.2, 0, 'plinth'));
  const rim = mesh(new THREE.TorusGeometry(7.2, 0.14, 10, 96), gold, 0, 2.4, 0); rim.rotation.x = Math.PI / 2; robot.add(rim);
  const nameCanvas = document.createElement('canvas'); nameCanvas.width = 512; nameCanvas.height = 112;
  const nameTex = new THREE.CanvasTexture(nameCanvas); nameTex.colorSpace = THREE.SRGBColorSpace;
  const plate = mesh(new THREE.BoxGeometry(6.4, 1.4, 0.18), [gold, gold, gold, gold, new THREE.MeshStandardMaterial({ map: nameTex, roughness: 0.4, metalness: 0.5 }), gold], 0, 1.2, 7.55, 'plinth');
  plate.rotation.x = -0.12; robot.add(plate);

  // ── shoulders / chest: a lathe-turned bust, squashed front-to-back
  const prof = [[0, 2.4], [6.5, 2.4], [6.75, 3.1], [6.85, 4.4], [6.55, 5.9], [5.7, 7.1], [4.0, 8.0], [2.3, 8.35], [0, 8.45]].map(([r, y]) => new THREE.Vector2(r, y));
  const torso = mesh(new THREE.LatheGeometry(prof, 72), shell, 0, 0, 0, 'body'); torso.scale.set(1, 1, 0.6); robot.add(torso);
  // shoulder pads in the accent colour
  for (const sx of [-1, 1]) {
    const pad = mesh(new THREE.SphereGeometry(2.1, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2), accent, sx * 5.2, 6.55, 0, 'body');
    pad.scale.set(1.15, 0.55, 0.95); pad.rotation.z = -sx * 0.5; robot.add(pad);
  }
  // chest light: an accent ring with a glowing core
  const chestRing = mesh(new THREE.TorusGeometry(1.25, 0.28, 14, 48), accent, 0, 5.2, 4.12, 'chest'); robot.add(chestRing);
  robot.add(mesh(new THREE.CircleGeometry(1.0, 40), lights.chest, 0, 5.2, 4.16, 'chest'));
  // collar + neck rings
  const collar = mesh(new THREE.CylinderGeometry(2.35, 2.6, 0.7, 48), accent, 0, 8.5, 0, 'body'); robot.add(collar);
  robot.add(mesh(new THREE.CylinderGeometry(1.25, 1.35, 1.9, 32), metal, 0, 9.6, 0));
  for (const y of [9.2, 9.9]) { const r = mesh(new THREE.TorusGeometry(1.32, 0.12, 8, 40), dark, 0, y, 0); r.rotation.x = Math.PI / 2; robot.add(r); }

  // ── the head turns, nods and tilts about the neck
  const neck = new THREE.Group(); neck.position.set(0, 10.2, 0); robot.add(neck);
  const head = new THREE.Group(); neck.add(head);
  const HS = new THREE.Vector3(1, 0.94, 0.9), HR = 4.6, HC = new THREE.Vector3(0, 4.3, 0);
  // a point on the head's surface: theta down from the top, phi around (+z = the front at phi = 90°)
  const surf = (theta, phi, out = 0) => new THREE.Vector3(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta))
    .multiplyScalar(HR + out).multiply(HS).add(HC);
  const cap = (r, ps, pl, ts, tl, m, part) => { const o = mesh(new THREE.SphereGeometry(r, 64, 40, ps, pl, ts, tl), m, HC.x, HC.y, HC.z, part); o.scale.copy(HS); return o; };
  head.add(cap(HR, 0, Math.PI * 2, 0, Math.PI, shell, 'head'));
  head.add(cap(HR + 0.06, Math.PI / 2 - 0.95, 1.9, Math.PI * 0.28, Math.PI * 0.27, visor, 'head'));          // visor
  // mouth: a glowing mouth on a dark glossy panel; it opens from a thin line to a tall oval
  head.add(cap(HR + 0.05, Math.PI / 2 - 0.62, 1.24, Math.PI * 0.615, Math.PI * 0.15, visor, 'head'));
  const mouthLed = mesh(new THREE.CircleGeometry(1, 48), lights.eyes, 0, 0, 0, 'head');
  mouthLed.position.copy(surf(Math.PI * 0.69, Math.PI / 2, 0.12)); mouthLed.lookAt(mouthLed.position.clone().sub(HC).multiply(new THREE.Vector3(1, 0.3, 1)).add(mouthLed.position));
  head.add(mouthLed);
  // ears with light rings, and an antenna
  for (const sx of [-1, 1]) {
    const ear = mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.9, 40), accent, sx * 4.55, 4.3, 0, 'head'); ear.rotation.z = Math.PI / 2; head.add(ear);
    const ring = mesh(new THREE.TorusGeometry(0.75, 0.2, 12, 36), lights.ears, sx * 5.02, 4.3, 0, 'head'); ring.rotation.y = Math.PI / 2; head.add(ring);
  }
  head.add(mesh(new THREE.CylinderGeometry(0.13, 0.16, 1.9, 12), metal, 0.9, 9.0, -0.6));
  head.add(mesh(new THREE.SphereGeometry(0.42, 24, 16), lights.antenna, 0.9, 10.05, -0.6, 'head'));

  // eyes: glowing irises in the visor, with eyelids (shell colour) and eyebrows (accent colour)
  const eyes = [], lids = [], brows = [];
  for (const sx of [-1, 1]) {
    const at = surf(Math.PI * 0.43, Math.PI / 2 - sx * 0.36, -0.45);
    const pivot = new THREE.Group(); pivot.position.copy(at); pivot.rotation.y = sx * -0.36; head.add(pivot);
    const eye = new THREE.Group(); pivot.add(eye);
    eye.add(mesh(new THREE.SphereGeometry(0.98, 32, 24), new THREE.MeshPhysicalMaterial({ color: 0x0c0e12, roughness: 0.1, clearcoat: 1 }), 0, 0, 0, 'head'));
    eye.add(mesh(new THREE.CircleGeometry(0.66, 40), lights.eyes, 0, 0, 0.985, 'head'));
    eye.add(mesh(new THREE.CircleGeometry(0.27, 28), new THREE.MeshBasicMaterial({ color: 0x0a0a0a }), 0, 0, 0.99, 'head'));
    eye.add(mesh(new THREE.CircleGeometry(0.12, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.24, 0.24, 0.995));
    const lid = mesh(new THREE.SphereGeometry(1.14, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshPhysicalMaterial({ color: 0xeef2f6, roughness: 0.32, clearcoat: 0.6, side: THREE.DoubleSide }), 0, 0, 0, 'head');
    pivot.add(lid);
    const brow = new THREE.Group(); brow.position.set(0, 1.55, 0.35); pivot.add(brow);
    brow.add(mesh(new THREE.CapsuleGeometry(0.2, 1.3, 6, 12), accent, 0, 0, 0, 'head')); brow.children[0].rotation.z = Math.PI / 2;
    eyes.push(eye); lids.push(lid); brows.push({ g: brow, side: sx });
  }
  return { robot, neck, head, mouthLed, eyes, lids, brows, shell, accent, lights, nameCanvas, nameTex, lidMats: lids.map(l => l.material) };
}

export function createRobotView(THREE, canvas, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!opts.preserve });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a4256, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(14, 26, 30); scene.add(key);
  const fill = new THREE.DirectionalLight(0xbcd2ff, 0.9); fill.position.set(-20, 8, 18); scene.add(fill);
  const back = new THREE.DirectionalLight(0xffe2b0, 1.2); back.position.set(-6, 18, -24); scene.add(back);
  const camera = new THREE.PerspectiveCamera(32, 1, 1, 400);
  camera.position.set(9, 15, 46);
  const R = buildRobot(THREE); scene.add(R.robot);
  let controls = null;
  if (opts.controls) {
    controls = new opts.controls(camera, canvas);
    controls.target.set(0, 11.2, 0); controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.12;
    controls.minDistance = 26; controls.maxDistance = 80; controls.minPolarAngle = 0.5; controls.maxPolarAngle = 1.75; controls.update();
  } else camera.lookAt(0, 11.2, 0);

  const cur = { ...DEFAULTS }, tgt = { ...DEFAULTS }, speed = Object.fromEntries(MOTORS.map(m => [m[0], 6]));
  let browTilt = 0, browTiltT = 0, blinkT = -1, talk = null, raf = 0, last = 0, t0 = performance.now(), dirty = true;

  function pose(time) {
    const idle = Math.sin(time * 1.3) * 0.6; // a gentle "breathing" bob so the robot looks alive
    R.neck.rotation.set(-(cur.HeadNod - 5) * 4 * D2R + idle * 0.3 * D2R, (cur.HeadTurn - 5) * 9 * D2R, -(cur.HeadTilt - 5) * 3.6 * D2R, 'YXZ');
    for (const e of R.eyes) e.rotation.set(-(cur.EyesUp - 5) * 5 * D2R, (cur.EyesSide - 5) * 6 * D2R, 0, 'YXZ');
    let shut = cur.Eyelids / 10;
    if (blinkT >= 0) { const k = blinkT < 0.09 ? blinkT / 0.09 : Math.max(0, 1 - (blinkT - 0.09) / 0.11); shut = Math.max(shut, k); }
    for (const l of R.lids) l.rotation.x = -1.05 + shut * 2.35;
    for (const b of R.brows) { b.g.position.y = 1.55 + (cur.Brows - 5) * 0.11; b.g.rotation.z = b.side * browTilt * 0.42; }
    const mouth = talk != null ? talk : cur.Mouth;
    R.mouthLed.scale.set(1.25 + mouth * 0.02, 0.09 + mouth * 0.075, 1);
  }
  function step(dt) {
    let moving = false;
    for (const [m] of MOTORS) {
      const d = tgt[m] - cur[m]; if (!d) continue;
      const s = speed[m] * 3 * dt; // speed 1–10 → 3–30 steps per second
      cur[m] = Math.abs(d) <= s ? tgt[m] : cur[m] + Math.sign(d) * s; moving = true;
    }
    browTilt += (browTiltT - browTilt) * Math.min(1, dt * 10);
    if (blinkT >= 0) { blinkT += dt; if (blinkT > 0.2) blinkT = -1; }
    return moving;
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
    step(dt); pose((now - t0) / 1000);
    if (controls) controls.update();
    renderer.render(scene, camera);
  }
  function resize() {
    const w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // keep the whole bust in view on tall/narrow panels
    camera.fov = camera.aspect < 0.9 ? 32 / Math.max(0.55, camera.aspect / 0.9) : 32;
    camera.updateProjectionMatrix();
  }
  function setName(name) {
    const c = R.nameCanvas, x = c.getContext('2d');
    x.fillStyle = '#c99a4a'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#1b1b1f'; x.font = '900 66px Montserrat, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(String(name || 'Robot').slice(0, 14).toUpperCase(), c.width / 2, c.height / 2 + 4, c.width - 30);
    R.nameTex.needsUpdate = true;
  }
  setName(opts.name || 'Sparky');

  // tap (not drag) on the robot → onPick(part)
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let down = null;
  canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { down = null; return; }
    down = null;
    const r = canvas.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObject(R.robot, true).find(h => h.object.userData.part);
    if (hit && opts.onPick) opts.onPick(hit.object.userData.part);
  });

  const api = {
    MOTORS,
    setTarget(m, v) { if (m in tgt) tgt[m] = clamp10(v); },
    jump(m, v) { if (m in tgt) { tgt[m] = cur[m] = clamp10(v); } },
    target: m => tgt[m], at: m => cur[m], arrived: m => cur[m] === tgt[m],
    setSpeed(m, s) { const v = Math.max(1, Math.min(10, +s || 6)); if (m === 'all') MOTORS.forEach(x => { speed[x[0]] = v; }); else if (m in speed) speed[m] = v; },
    setLight(part, colour) {
      const c = new THREE.Color(colour || '#000000');
      for (const p of (part === 'all' ? Object.keys(R.lights) : [part])) if (R.lights[p]) R.lights[p].emissive.copy(c);
    },
    lightsOff(part) { for (const p of (part === 'all' ? Object.keys(R.lights) : [part])) if (R.lights[p]) R.lights[p].emissive.setRGB(0, 0, 0); },
    setBody(colour) { R.shell.color.set(colour || '#eef2f6'); R.lidMats.forEach(m => m.color.set(colour || '#eef2f6')); },
    setAccent(colour) { R.accent.color.set(colour || '#2b6fd8'); },
    setName,
    setBrowTilt(v) { browTiltT = Math.max(-1, Math.min(1, +v || 0)); },
    blink() { blinkT = 0; },
    setTalk(v) { talk = v == null ? null : clamp10(v); },
    reset(instant) {
      for (const [m, , d] of MOTORS) { tgt[m] = d; if (instant) cur[m] = d; speed[m] = 6; }
      browTiltT = 0; if (instant) browTilt = 0; talk = null;
      for (const p in LIGHTS) R.lights[p].emissive.set(LIGHTS[p]);
    },
    state: () => ({ cur: { ...cur }, tgt: { ...tgt } }),
    start() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } },
    stop() { cancelAnimationFrame(raf); raf = 0; },
    renderOnce(time = 0) { step(1); pose(time); renderer.render(scene, camera); },
    resize, camera, scene, renderer, robot: R,
    dispose() { api.stop(); if (controls) controls.dispose(); renderer.dispose(); }
  };
  resize();
  return api;
}
