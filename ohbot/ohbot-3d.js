/* CodeJump · the on-screen Ohbot, drawn in 3D.
 * Our own model (built here from simple shapes, not Ohbot's artwork or their Unity simulator): laser-cut acrylic plates,
 * ping-pong eyeballs with lids, a strip nose, bent-wire lips on servo arms, a neck servo and an oval base. Each motor
 * (0–10, like the real robot) moves the matching joint. Lazy-loaded by build-and-play.html the first time a sprite
 * wears the Ohbot costume; until then (or offline) the Stage draws the old flat picture.
 *
 * createOhbotRenderer() → { draw(ctx, ob, plateColour, x, y, w, h) } renders the robot posed from `ob` (the sprite's motor
 * state: HeadTurn, HeadNod, HeadRoll, EyeTurn, EyeTilt, TopLip, BottomLip, Lid, color = eye LED colour or null) into a
 * cached 2D canvas and draws it into ctx. One WebGL context is shared by every Ohbot sprite.
 */
import * as THREE from '../critter/vendor/three-0.186.1-critter.min.js';

const SIZE = 400;                 // render size (square), drawn scaled into the sprite box
const DEF = { HeadTurn: 5, HeadNod: 5, HeadRoll: 5, EyeTurn: 5, EyeTilt: 5, TopLip: 5, BottomLip: 5, Lid: 0 };
const D2R = Math.PI / 180;
const v = (ob, k) => { const n = ob && ob[k]; return n == null || !isFinite(n) ? DEF[k] : Math.max(0, Math.min(10, +n)); };

// a rounded rectangle (a stadium when r = half the width), optionally with rectangular slots cut out
function rounded(w, h, r, holes = []) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  for (const [hx, hy, hw, hh] of holes) {
    const p = new THREE.Path(); p.moveTo(hx - hw / 2, hy - hh / 2); p.lineTo(hx - hw / 2, hy + hh / 2);
    p.lineTo(hx + hw / 2, hy + hh / 2); p.lineTo(hx + hw / 2, hy - hh / 2); p.lineTo(hx - hw / 2, hy - hh / 2); s.holes.push(p);
  }
  return s;
}
const plate = (shape, t) => { const g = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1, curveSegments: 18 }); g.translate(0, 0, -t / 2); return g; };

function build() {
  const acrylic = new THREE.MeshStandardMaterial({ color: 0x1f3fbf, roughness: 0.28, metalness: 0.05 });
  const black = new THREE.MeshStandardMaterial({ color: 0x18191c, roughness: 0.6 });
  const wire = new THREE.MeshStandardMaterial({ color: 0xc9ccd2, roughness: 0.25, metalness: 0.85 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf6f6f2, roughness: 0.35, emissive: 0x000000 });
  const iris = new THREE.MeshStandardMaterial({ color: 0x3f9a5b, roughness: 0.4 });
  const pupil = new THREE.MeshBasicMaterial({ color: 0x0d0d0d });
  const nose = new THREE.MeshStandardMaterial({ color: 0xd9d9de, roughness: 0.3, metalness: 0.2 });
  const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };

  const robot = new THREE.Group();
  // base: an oval acrylic plate, and the open frame the neck servo sits on
  const base = mesh(plate(new THREE.Shape().absellipse(0, 0, 10.5, 6.2, 0, Math.PI * 2), 0.5), acrylic, 0, 0.25, 0);
  base.rotation.x = -Math.PI / 2; robot.add(base);
  for (const sx of [-3.4, 3.4]) robot.add(mesh(new THREE.BoxGeometry(0.35, 3.6, 4.6), acrylic, sx, 2.3, -0.6));
  robot.add(mesh(new THREE.BoxGeometry(7.2, 0.35, 4.8), acrylic, 0, 4.2, -0.6));
  robot.add(mesh(new THREE.BoxGeometry(7.2, 1.2, 0.35), acrylic, 0, 1.1, 1.6));
  robot.add(mesh(new THREE.BoxGeometry(2.4, 2.2, 2.2), black, 0, 5.45, -0.6));           // neck servo
  robot.add(mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 20), black, 0, 6.7, -0.6));    // servo horn

  // the head turns, nods and rolls about the neck
  const neck = new THREE.Group(); neck.position.set(0, 6.9, -0.6); robot.add(neck);
  const head = new THREE.Group(); neck.add(head);
  head.add(mesh(new THREE.BoxGeometry(2.2, 2.4, 1.6), black, 0, 1.6, 0));                // lower bracket
  const side = plate(rounded(5.8, 11.6, 2.9, [[0.6, 2.2, 2.2, 0.35], [0.6, 1.4, 2.2, 0.35], [-1.2, -2.6, 0.7, 1.6], [1.5, 4.4, 0.35, 0.35], [1.5, -4.2, 0.35, 0.35]]), 0.35);
  for (const sx of [-6.3, 6.3]) { const p = mesh(side, acrylic, sx, 7.4, 0.2); p.rotation.y = Math.PI / 2; head.add(p); }
  const shelf = plate(rounded(12.3, 5.4, 0.8, [[-3.6, -0.4, 1.4, 0.35], [3.6, -0.4, 1.4, 0.35]]), 0.3);
  for (const sy of [3.1, 10.6]) { const p = mesh(shelf, acrylic, 0, sy, 0.6); p.rotation.x = -Math.PI / 2; head.add(p); }
  head.add(mesh(new THREE.BoxGeometry(12.3, 0.9, 0.3), acrylic, 0, 13.1, -1.6));           // brow bar
  head.add(mesh(new THREE.BoxGeometry(0.3, 7.6, 0.3), acrylic, -2.2, 6.9, -2.0));
  head.add(mesh(new THREE.BoxGeometry(0.3, 7.6, 0.3), acrylic, 2.2, 6.9, -2.0));
  head.add(mesh(new THREE.BoxGeometry(2.6, 1.7, 1.4), black, 0, 4.4, -1.2));               // lip servo

  // eyes: ping-pong balls with an iris and pupil; the eyelids are shells that swing down over them
  const eyes = [], lids = [], eyeR = 1.85;
  for (const sx of [-2.8, 2.8]) {
    const pivot = new THREE.Group(); pivot.position.set(sx, 12.6, 1.4); head.add(pivot);
    const eye = new THREE.Group(); pivot.add(eye);
    eye.add(mesh(new THREE.SphereGeometry(eyeR, 32, 24), white));
    eye.add(mesh(new THREE.CircleGeometry(0.9, 28), iris, 0, 0, eyeR - 0.02));
    eye.add(mesh(new THREE.CircleGeometry(0.42, 20), pupil, 0, 0, eyeR + 0.005));
    const lid = new THREE.Mesh(new THREE.SphereGeometry(eyeR + 0.14, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshStandardMaterial({ color: 0x1f3fbf, roughness: 0.28, side: THREE.DoubleSide }));
    pivot.add(lid); eyes.push(eye); lids.push(lid);
  }
  // the nose: a thin bent strip
  const n1 = mesh(new THREE.BoxGeometry(0.75, 3.6, 0.12), nose, 0, 9.2, 2.6); n1.rotation.x = -0.32; head.add(n1);
  const n2 = mesh(new THREE.BoxGeometry(0.75, 0.9, 0.12), nose, 0, 7.45, 3.05); n2.rotation.x = 0.9; head.add(n2);

  // lips: two loops of wire each, on arms that pivot at the back of the mouth
  const loop = new THREE.CatmullRomCurve3([[-3.3, 0, -0.6], [-3.2, 0, 1.6], [-2.0, 0, 3.1], [0, 0, 3.5], [2.0, 0, 3.1], [3.2, 0, 1.6], [3.3, 0, -0.6]].map(p => new THREE.Vector3(...p)));
  const tube = new THREE.TubeGeometry(loop, 48, 0.14, 8, false);
  const lip = (y, dy) => { const g = new THREE.Group(); g.position.set(0, y, -0.4); g.add(mesh(tube, wire)); g.add(mesh(tube, wire, 0, dy, -0.15)); head.add(g); return g; };
  const topLip = lip(5.15, 0.36), botLip = lip(4.25, -0.36);

  return { robot, neck, eyes, lids, topLip, botLip, acrylic, lidMats: lids.map(l => l.material), white, iris };
}

export function createOhbotRenderer() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = SIZE;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(SIZE, SIZE, false); renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x445066, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(12, 22, 26); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb8ff, 1.0); rim.position.set(-18, 10, -14); scene.add(rim);
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 200); camera.position.set(10, 14, 50); camera.lookAt(0, 10.8, 0);
  const R = build(); scene.add(R.robot);
  const cache = new Map(); // pose key → canvas (a few dozen entries, oldest dropped)

  function pose(ob, plateColour) {
    R.neck.rotation.set(-(v(ob, 'HeadNod') - 5) * 5 * D2R, (v(ob, 'HeadTurn') - 5) * 8 * D2R, -(v(ob, 'HeadRoll') - 5) * 4 * D2R, 'YXZ');
    for (const e of R.eyes) e.rotation.set(-(v(ob, 'EyeTilt') - 5) * 6 * D2R, (v(ob, 'EyeTurn') - 5) * 7 * D2R, 0, 'YXZ');
    const shut = v(ob, 'Lid') / 10;                     // 0 = wide open, 10 = closed
    for (const l of R.lids) l.rotation.x = -0.75 + shut * 2.15;
    R.topLip.rotation.x = -(v(ob, 'TopLip') - 5) * 0.05;
    R.botLip.rotation.x = (v(ob, 'BottomLip') - 5) * 0.07;
    const pc = new THREE.Color(plateColour || '#1f3fbf'); R.acrylic.color.copy(pc); R.lidMats.forEach(m => m.color.copy(pc));
    if (ob && ob.color) { const c = new THREE.Color(ob.color); R.white.emissive.copy(c).multiplyScalar(0.55); R.iris.color.copy(c); }
    else { R.white.emissive.setRGB(0, 0, 0); R.iris.color.setHex(0x3f9a5b); }
  }
  function frame(ob, plateColour) {
    const k = [plateColour, ob && ob.color, ...Object.keys(DEF).map(m => v(ob, m).toFixed(2))].join('|');
    let c = cache.get(k);
    if (!c) {
      pose(ob, plateColour); renderer.render(scene, camera);
      c = document.createElement('canvas'); c.width = c.height = SIZE; c.getContext('2d').drawImage(canvas, 0, 0);
      cache.set(k, c); if (cache.size > 60) cache.delete(cache.keys().next().value);
    }
    return c;
  }
  return {
    draw(ctx, ob, plateColour, x = -50, y = -50, w = 100, h = 100) { ctx.drawImage(frame(ob, plateColour), x, y, w, h); },
    frame,
    dispose() { renderer.dispose(); cache.clear(); }
  };
}
