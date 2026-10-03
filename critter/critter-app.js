/* CodeJump · Critter project type — the app: 3D builder (Three.js) with blobs, limbs and an IK-point
 * path editor, the body's Motion tab, beat chart, and the contest arena (Rapier physics via
 * critter-core.js). Lazy-loaded by CodeJump (build-and-play.html: loadCritterEngine) only when a Critter project
 * opens, and mounted into #critter-ui. CodeJump owns saving/sharing: getCritter() goes into the payload
 * (payload.critter) and onChange() marks the project dirty.
 *
 *   const app = (await import('./critter/critter-app.js')).mount(rootEl, { critter, onChange, toast });
 *   app.getCritter() · app.setCritter(z) · app.pause() · app.destroy()
 */
import * as THREE from './vendor/three-0.186.1-critter.min.js';
import * as Z from './critter-core.js';

// lucide-style names used below -> CodeJump's own SVG icon symbols (#i-…)
var ICONS = { wrench: 'i-build', flag: 'i-flag', 'undo-2': 'i-undo', 'redo-2': 'i-redo', sparkles: 'i-spark', 'trash-2': 'i-trash',
  x: 'i-x', play: 'i-play', square: 'i-stop', 'rotate-ccw': 'i-reset', zap: 'i-dash', mountain: 'i-jump2', box: 'i-crate',
  'arrow-up-from-line': 'i-arr-u', keyboard: 'i-key', users: 'i-people', swords: 'i-bump', crosshair: 'i-target' };
function ic(name) { return '<svg class="ic"><use href="#' + (ICONS[name] || 'i-spark') + '"></use></svg>'; }

var CSS_URL = new URL('./critter-app.css', import.meta.url).href;

var TEMPLATE = `
<div class="zk">
  <div class="zl-bar">
    <label class="zl-name"><span class="zk-sr">Critter name</span><input id="zName" type="text" maxlength="40" value="My Critter" aria-label="Critter name"></label>
    <div class="zl-modes" role="tablist" aria-label="Mode">
      <button type="button" role="tab" class="zl-mode active" data-mode="build" aria-selected="true">${ic('wrench')} Build</button>
      <button type="button" role="tab" class="zl-mode" data-mode="test" aria-selected="false">${ic('flag')} Test it!</button>
      <button type="button" role="tab" class="zl-mode" data-mode="showdown" aria-selected="false" id="zSdTab" hidden>${ic('users')} Showdown</button>
    </div>
    <div class="zl-tools">
      <button type="button" class="zl-icon" id="zUndo" title="Undo (Ctrl+Z)" aria-label="Undo">${ic('undo-2')}</button>
      <button type="button" class="zl-icon" id="zRedo" title="Redo (Ctrl+Y)" aria-label="Redo">${ic('redo-2')}</button>
      <button type="button" class="zl-tool" id="zKeys" title="Keyboard shortcuts (?)">${ic('keyboard')} Keys</button>
      <button type="button" class="zl-tool" id="zGuides" title="Short videos: build a Critter that walks">${ic('play')} Guides</button>
      <button type="button" class="zl-tool" id="zStarters">${ic('sparkles')} Starter Critters</button>
      <button type="button" class="zl-tool" id="zShowdown" title="Race your Critters against each other with your class">${ic('users')} Showdown</button>
    </div>
  </div>

  <div class="zl-stage" id="buildStage">
    <aside class="zl-palette" aria-label="Parts">
      <h2>Blobs</h2>
      <p class="zl-hint">Drag a part onto your Critter. It sticks where it touches.</p>
      <div class="zl-parts" id="zParts"></div>
      <h2 style="margin-top:14px;">Limbs</h2>
      <div class="zl-parts" id="zLimbs"></div>
      <label class="zl-check"><input type="checkbox" id="zMirror" checked> Add in pairs (mirror)</label>
      <label class="zl-check"><input type="checkbox" id="zPreview" checked> Wiggle preview</label>
    </aside>
    <div class="zl-canvas-wrap">
      <canvas id="buildCanvas" aria-label="Your Critter in 3D. Drag to look around, tap a part to choose it."></canvas>
      <div class="zl-canvas-msg" id="buildMsg" hidden></div>
      <div class="zl-canvas-tip" id="buildTip">Drag a part to move it · drag the background to look around · press ? for keyboard shortcuts</div>
    </div>
    <aside class="zl-inspector" id="zInspector" aria-live="polite"></aside>
  </div>

  <div class="zl-beats" id="beatsWrap">
    <div class="zl-beats-head"><h2>Beat chart</h2><span class="zl-hint">Three seconds of every swing and every foot loop (up = forwards). Legs on opposite beats take turns.</span></div>
    <canvas id="beatCanvas" aria-label="Beat chart of every joint"></canvas>
  </div>

  <div class="zl-arena" id="testStage" hidden>
    <div class="zl-contests" id="zContests" role="radiogroup" aria-label="Contest"></div>
    <div class="zl-arena-bar">
      <p class="zl-about-contest" id="zAbout"></p>
      <label class="zl-opp" id="zOppWrap" hidden>Against <select id="zOpp"></select></label>
      <button type="button" class="zl-go" id="zGo">${ic('play')} Go!</button>
      <label class="zl-check"><input type="checkbox" id="zTurbo"> Turbo</label>
    </div>
    <div class="zl-canvas-wrap arena">
      <canvas id="arenaCanvas" aria-label="The arena in 3D. Drag to look around."></canvas>
      <div class="zl-hud" id="zHud"><div class="lbl" id="hudLabel">Sprint</div><div class="dist" id="hudDist">0.0 m</div><div class="row"><span id="hudTime">15.0 s left</span><span id="hudBest"></span></div><div class="bar"><i id="hudBar"></i></div></div>
      <div class="zl-canvas-msg" id="arenaMsg" hidden></div>
      <div class="zl-result" id="zResult" hidden></div>
    </div>
  </div>

  <div class="zl-sd" id="sdStage" hidden>
    <aside class="zl-sd-side" id="sdSide" aria-live="polite"></aside>
    <div class="zl-canvas-wrap arena">
      <canvas id="sdCanvas" aria-label="The Showdown arena in 3D. Drag to look around."></canvas>
      <div class="zl-hud" id="sdHud" hidden><div class="lbl" id="sdHudLabel">Sprint</div><div class="row"><span id="sdHudTime"></span></div><div class="bar"><i id="sdHudBar"></i></div></div>
      <ol class="zl-sd-board" id="sdBoard" hidden></ol>
      <div class="zl-canvas-msg" id="sdMsg" hidden></div>
      <div class="zl-result" id="sdResult" hidden></div>
    </div>
  </div>

  <dialog class="zl-dialog" id="zDialog"></dialog>
  <div class="zl-toast" id="zToast" role="status"></div>
</div>`;

/* Mount the Critter app into `root`. host = { critter, onChange(), toast(msg, colour) }. */
export function mount(root, host) {
host = host || {};
if (!document.querySelector('link[data-critter-css]')) {
  var link = document.createElement('link'); link.rel = 'stylesheet'; link.href = CSS_URL; link.setAttribute('data-critter-css', '');
  document.head.appendChild(link);
}
root.innerHTML = TEMPLATE;

var COLOURS = ['#38b6ff', '#f59f18', '#ff751f', '#00bf63', '#ff66c4', '#ae853e', '#e10000', '#8a63d2', '#585555', '#ffffff'];
var GRIPS = [['slippy', 'Slippy'], ['normal', 'Normal'], ['grippy', 'Grippy']];
var HINGE_LABELS = [['swing', 'Swing'], ['sweep', 'Sweep'], ['twist', 'Twist']];
var MOVES = [['still', 'Still'], ['swing', 'Swing'], ['path', 'Motion path']];
var DEG = Z.DEG, M = 0.01; // the 3D scenes are in metres, the Critter in centimetres

var $ = function (id) { return document.getElementById(id); };
var state = {
  critter: null, selected: null, tab: 'shape', pathPoint: null, mode: 'build', history: [], future: [], sliding: false,
  contest: 'sprint', opponent: 'self', t: 0, lastFrame: 0, drag: null, sim: null, running: false, acc: 0, ctrl: null
};
var R = null; // Rapier, once loaded

/* ------------------------------------------------------------------ storage + toast */

// CodeJump owns saving (device, cloud, share links): tell it whenever the Critter changes.
function saveCurrent() { if (host.onChange) host.onChange(); }

function toast(msg) {
  if (host.toast) { host.toast(msg, '#ae853e'); return; }
  var t = $('zToast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(function () { t.classList.remove('show'); }, 2800);
}
function icons() { /* icons are inline SVG from CodeJump's icon set */ }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

/* ------------------------------------------------------------------ history */

function remember() {
  state.history.push(JSON.stringify(state.critter));
  if (state.history.length > 80) state.history.shift();
  state.future = [];
  updateUndo();
}
function undo() {
  if (!state.history.length) return;
  state.future.push(JSON.stringify(state.critter));
  state.critter = JSON.parse(state.history.pop());
  changed({ inspector: true });
}
function redo() {
  if (!state.future.length) return;
  state.history.push(JSON.stringify(state.critter));
  state.critter = JSON.parse(state.future.pop());
  changed({ inspector: true });
}
function updateUndo() { $('zUndo').disabled = !state.history.length; $('zRedo').disabled = !state.future.length; }

// Light refresh while a control is being dragged: new motion controller, redraw.
function live() { state.ctrl = Z.controller(state.critter); saveCurrent(); builder.sync(); drawBeats(); }

// After any edit: save, redraw. opts.inspector rebuilds the side panel, opts.fit re-frames the camera.
function changed(opts) {
  opts = opts || {};
  if (state.selected && !Z.block(state.critter, state.selected)) { state.selected = null; state.pathPoint = null; }
  state.ctrl = Z.controller(state.critter);
  saveCurrent();
  builder.sync(opts.fit);
  if (opts.inspector) renderInspector();
  $('zName').value = state.critter.name;
  drawBeats();
  updateUndo();
  if (state.mode === 'test') resetRun();
}

function setCritter(z) {
  state.critter = Z.normalise(z);
  state.selected = null; state.pathPoint = null;
  changed({ fit: true, inspector: true });
}

function partNames(z) {
  var count = {}, out = {};
  z.blocks.forEach(function (b, i) {
    if (i === 0) { out[b.id] = 'Body'; return; }
    var label = (Z.PARTS[b.kind] || Z.PARTS.leg).label;
    count[label] = (count[label] || 0) + 1;
    out[b.id] = label + ' ' + count[label];
  });
  return out;
}

// The block whose motion path is being shown: the selected block's own, or the path that drives it.
function pathTip() {
  var z = state.critter, b = Z.block(z, state.selected);
  if (!b) return null;
  if (b.path) return b;
  var d = Z.drivenBy(z, b.id);
  return d ? Z.block(z, d) : null;
}

/* ------------------------------------------------------------------ 3D pieces shared by builder, arena, thumbnails */

var dotsTexture = (function () {
  var tex = null;
  return function () {
    if (tex) return tex;
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#6b6b6b';
    [[16, 16], [48, 16], [32, 40], [0, 40], [64, 40], [16, 64], [48, 64], [16, 0], [48, 0]].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 6, 0, Math.PI * 2); g.fill(); });
    tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
})();

function blockMaterial(b, opts) {
  opts = opts || {};
  var grippy = b.friction >= Z.FRICTION.grippy - 0.01, slippy = b.friction <= Z.FRICTION.slippy + 0.01;
  var mat = new THREE.MeshStandardMaterial({ color: b.colour, roughness: slippy ? 0.12 : grippy ? 0.95 : 0.5, metalness: slippy ? 0.15 : 0 });
  if (grippy) { mat.map = dotsTexture().clone(); mat.map.needsUpdate = true; mat.map.repeat.set(Math.max(1, b.size[0] / 10), 4); }
  if (opts.ghost) { mat.transparent = true; mat.opacity = 0.5; mat.depthWrite = false; }
  if (opts.selected) mat.emissive = new THREE.Color(0x3a3a3a);
  return mat;
}

// A blob's surface as a mesh (metres), straight from the core's shape maths.
function blobGeometry(b) {
  var nLat = 20, nLon = 28, rows = Z.blobGrid(b, nLat, nLon), pos = [], uv = [], idx = [];
  rows.forEach(function (row, i) { row.forEach(function (p, j) { pos.push(p[0] * M, p[1] * M, p[2] * M); uv.push(i / nLat, j / nLon); }); });
  for (var i = 0; i < nLat; i++) for (var j = 0; j < nLon; j++) {
    var a = i * nLon + j, b2 = i * nLon + (j + 1) % nLon, c = (i + 1) * nLon + j, d = (i + 1) * nLon + (j + 1) % nLon;
    idx.push(a, c, b2, b2, c, d);
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

var eyeMats = null, eyeGeos = {};
function blockMesh(b, opts) {
  opts = opts || {};
  var mesh = new THREE.Mesh(blobGeometry(b), blockMaterial(b, opts));
  mesh.castShadow = !opts.ghost; mesh.receiveShadow = true;
  mesh.userData.id = b.id;
  if (b.eyes && !opts.ghost) {
    var er = Math.max(0.022, Math.min(b.size[1], b.size[2]) * M * 0.17);
    [-1, 1].forEach(function (side) {
      var sp = Z.surfaceAt(b, '+x', [0.22, side * 0.2]);
      var eye = new THREE.Mesh(new THREE.SphereGeometry(er, 18, 12), eyeMats[0]);
      eye.position.set(sp[0] * M - er * 0.3, sp[1] * M, sp[2] * M);
      var pupil = new THREE.Mesh(new THREE.SphereGeometry(er * 0.5, 12, 8), eyeMats[1]);
      pupil.position.set(er * 0.72, 0, 0);
      eye.add(pupil); eye.castShadow = true;
      mesh.add(eye);
    });
  }
  return mesh;
}

function place(obj, p, q, unit) {
  obj.position.set(p[0] * unit, p[1] * unit, p[2] * unit);
  obj.quaternion.set(q[0], q[1], q[2], q[3]);
}

// Empty a group, freeing GPU memory for everything not marked as shared (userData.keep).
function disposeTree(group) {
  while (group.children.length) {
    var o = group.children.pop();
    o.traverse(function (c) {
      if (c.geometry && !c.geometry.userData.keep) c.geometry.dispose();
      if (c.material && !c.material.userData.keep) { if (c.material.map) c.material.map.dispose(); c.material.dispose(); }
    });
  }
}

function lights(scene, shadowSize) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x7d8a99, 1.5));
  var sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(2.5, 5, 3.5); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  var c = sun.shadow.camera; c.left = -shadowSize; c.right = shadowSize; c.top = shadowSize; c.bottom = -shadowSize; c.near = 0.5; c.far = 20;
  sun.shadow.bias = -0.0005;
  scene.add(sun); scene.add(sun.target);
  return sun;
}

function makeRenderer(canvas, opts) {
  var r = new THREE.WebGLRenderer(Object.assign({ canvas: canvas, antialias: true }, opts || {}));
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
  return r;
}

function fitRenderer(renderer, camera, canvas) {
  var w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  var size = renderer.getSize(new THREE.Vector2());
  if (size.x !== w || size.y !== h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
}

function keepMat(m) { m.userData.keep = true; return m; }
function keepGeo(g) { g.userData.keep = true; return g; }

/* ------------------------------------------------------------------ builder (3D) */

var builder = (function () {
  var canvas = $('buildCanvas');
  var renderer = makeRenderer(canvas);
  var scene = new THREE.Scene();
  scene.background = new THREE.Color('#eaf6ff');
  var camera = new THREE.PerspectiveCamera(38, 1.5, 0.05, 60);
  camera.position.set(1.7, 1.2, 2.4);
  var controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.12;
  controls.minDistance = 0.5; controls.maxDistance = 7; controls.maxPolarAngle = Math.PI * 0.49;
  lights(scene, 2.5);

  var floor = new THREE.Mesh(new THREE.CircleGeometry(3, 48), new THREE.MeshStandardMaterial({ color: '#cfe8c8', roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  var grid = new THREE.GridHelper(6, 30, 0x9fc79a, 0xb7d8b2); scene.add(grid);
  var arrow = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 20), new THREE.MeshStandardMaterial({ color: '#00bf63' }));
  arrow.rotation.z = -Math.PI / 2; scene.add(arrow); // points the way the eyes face (+x)

  var critterGroup = new THREE.Group(); scene.add(critterGroup);
  var ghostGroup = new THREE.Group(); scene.add(ghostGroup);
  var pathGroup = new THREE.Group(); scene.add(pathGroup);
  var meshes = {}, jointDots = {}, gizmo = null, signature = '', stillBounds = null;
  var jointGeo = keepGeo(new THREE.SphereGeometry(0.022, 16, 12));
  var jointLive = keepMat(new THREE.MeshStandardMaterial({ color: '#e10000', roughness: 0.4 })), jointStill = keepMat(new THREE.MeshStandardMaterial({ color: '#8a8786', roughness: 0.4 }));
  var jointPath = keepMat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 }));
  var ptGeo = keepGeo(new THREE.SphereGeometry(0.03, 18, 12)), startGeo = keepGeo(new THREE.BoxGeometry(0.055, 0.055, 0.055)), plusGeo = keepGeo(new THREE.SphereGeometry(0.018, 12, 8));
  var ptMat = keepMat(new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  var ptSel = keepMat(new THREE.MeshBasicMaterial({ color: '#f59f18' }));
  var plusMat = keepMat(new THREE.MeshStandardMaterial({ color: '#38b6ff', roughness: 0.3, transparent: true, opacity: 0.85 }));
  var lineMat = keepMat(new THREE.LineBasicMaterial({ color: '#ffffff' })), arrowMat = keepMat(new THREE.MeshStandardMaterial({ color: '#ffffff' }));
  var arrowGeo = keepGeo(new THREE.ConeGeometry(0.02, 0.05, 12));
  // the path editor draws on top of everything, so loops under the floor or behind a leg stay visible
  [ptMat, ptSel, plusMat, lineMat, arrowMat].forEach(function (m) { m.depthTest = false; m.transparent = true; });
  lineMat.color.set('#111111'); arrowMat.color.set('#111111');

  function rebuild() {
    disposeTree(critterGroup); meshes = {}; jointDots = {};
    var z = state.critter, driven = {};
    z.blocks.forEach(function (b) { if (b.path) Z.chainOf(z, b.id).blocks.forEach(function (id) { driven[id] = true; }); });
    var sel = state.selected, selB = sel && Z.block(z, sel), twin = selB && selB.twin;
    z.blocks.forEach(function (b) { var m = blockMesh(b, { selected: b.id === sel || b.id === twin }); meshes[b.id] = m; critterGroup.add(m); });
    z.joints.forEach(function (j) {
      var d = new THREE.Mesh(jointGeo, driven[j.blockB] ? jointPath : j.motion.amplitude ? jointLive : jointStill);
      d.userData.id = j.blockB; jointDots[j.id] = d; critterGroup.add(d);
    });
    gizmo = null;
    var j = selB && Z.jointFor(z, selB.id);
    if (j && !Z.drivenBy(z, selB.id)) { gizmo = hingeGizmo(selB, j); critterGroup.add(gizmo); }
    stillBounds = Z.bounds(z);
  }

  // A see-through fan around the selected joint's hinge: the plane it swings in and how far.
  function hingeGizmo(b, j) {
    var g = new THREE.Group(), radius = Math.max(0.12, b.size[0] * M * 0.7), amp = Math.max(3, j.motion.amplitude) * DEG;
    g.add(new THREE.Mesh(new THREE.RingGeometry(radius * 0.96, radius, 48), new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })));
    g.add(new THREE.Mesh(new THREE.CircleGeometry(radius, 32, -amp, amp * 2), new THREE.MeshBasicMaterial({ color: '#f59f18', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })));
    g.userData.joint = j.id;
    return g;
  }

  function sync(refit) {
    var z = state.critter;
    var sig = JSON.stringify([z.blocks.map(function (b) { return [b.id, b.size, b.square, b.point, b.colour, b.friction, b.eyes, !!b.path, b.mount && b.mount.hinge]; }),
      z.joints.map(function (j) { return [j.id, j.motion.amplitude]; }), state.selected]);
    if (sig !== signature) { signature = sig; rebuild(); }
    else stillBounds = Z.bounds(z);
    drawPath();
    if (refit) fit();
  }

  function fit() {
    var bb = stillBounds || Z.bounds(state.critter);
    var c = new THREE.Vector3((bb.min[0] + bb.max[0]) / 2 * M, (bb.min[1] + bb.max[1]) / 2 * M, (bb.min[2] + bb.max[2]) / 2 * M);
    var size = Math.max(bb.max[0] - bb.min[0], bb.max[1] - bb.min[1], bb.max[2] - bb.min[2]) * M;
    controls.target.copy(c);
    camera.position.copy(c).addScaledVector(new THREE.Vector3(0.55, 0.42, 0.75).normalize(), Math.max(1.2, size * 2.6));
    controls.update();
  }

  // The IK motion path of the selected limb: white points (square = start), a loop with arrows, and
  // little blue "+" dots between points to add more.
  var pathInfo = null;
  function drawPath() {
    disposeTree(pathGroup); pathInfo = null;
    var tip = pathTip();
    if (!tip) return;
    var z = state.critter, f = Z.pathFrame(z, tip.id), still = Z.pose(z), base = still.blocks[f.chain.base];
    var toWorld = function (uv) {
      var local = Z.add(Z.add(f.origin, Z.scale(f.U, uv[0])), Z.scale(f.V, uv[1]));
      var w = Z.add(base.p, Z.qRot(base.q, local));
      return new THREE.Vector3(w[0] * M, w[1] * M, w[2] * M);
    };
    var world = tip.path.points.map(toWorld);
    pathGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(world), lineMat));
    world.forEach(function (w, i) {
      var m = new THREE.Mesh(i === 0 ? startGeo : ptGeo, i === state.pathPoint ? ptSel : ptMat);
      m.position.copy(w); m.userData.point = i; pathGroup.add(m);
      var next = world[(i + 1) % world.length], mid = w.clone().add(next).multiplyScalar(0.5);
      var plus = new THREE.Mesh(plusGeo, plusMat); plus.position.copy(mid); plus.userData.insert = i + 1; pathGroup.add(plus);
      var dir = next.clone().sub(w);
      if (dir.lengthSq() > 1e-8) { var a = new THREE.Mesh(arrowGeo, arrowMat); a.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()); a.position.copy(w.clone().lerp(next, 0.72)); pathGroup.add(a); }
    });
    pathGroup.children.forEach(function (c) { c.renderOrder = 10; });
    var normal = Z.qRot(base.q, f.axis), o = toWorld([0, 0]);
    pathInfo = { tip: tip, frame: f, base: base, plane: new THREE.Plane().setFromNormalAndCoplanarPoint(new THREE.Vector3(normal[0], normal[1], normal[2]), o) };
  }

  // Draw the Critter at pose p (built, or mid-motion for the preview).
  function apply(p) {
    var z = state.critter, bb = stillBounds || Z.bounds(z), groundY = bb.min[1] * M - 0.003;
    floor.position.y = groundY; grid.position.y = groundY + 0.001;
    arrow.position.set(bb.max[0] * M + 0.35, groundY + 0.03, 0);
    floor.position.x = grid.position.x = (bb.min[0] + bb.max[0]) / 2 * M;
    z.blocks.forEach(function (b) { var q = p.blocks[b.id], m = meshes[b.id]; if (q && m) place(m, q.p, q.q, M); });
    z.joints.forEach(function (j) { var d = jointDots[j.id], a = p.anchors[j.id]; if (d && a) d.position.set(a[0] * M, a[1] * M, a[2] * M); });
    if (gizmo) {
      var still = Z.pose(z), jid = gizmo.userData.joint, b = Z.block(z, state.selected);
      var anchor = still.anchors[jid], axis = new THREE.Vector3().fromArray(still.axes[jid]);
      var X = new THREE.Vector3().fromArray(Z.qRot(still.blocks[b.id].q, b.mount.hinge === 'twist' ? [0, 1, 0] : [1, 0, 0]));
      var Y = new THREE.Vector3().crossVectors(axis, X).normalize();
      X.crossVectors(Y, axis).normalize();
      gizmo.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, axis));
      gizmo.position.set(anchor[0] * M, anchor[1] * M, anchor[2] * M);
    }
  }

  var raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function ray(e) {
    var r = canvas.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
  }
  function list(o) { return Object.keys(o).map(function (k) { return o[k]; }); }
  function pick(e) {
    ray(e);
    var hit = raycaster.intersectObjects(list(jointDots).concat(list(meshes)), false)[0];
    return hit ? hit.object.userData.id : null;
  }
  function pickPath(e) {
    if (!pathInfo) return null;
    ray(e);
    var hit = raycaster.intersectObjects(pathGroup.children.filter(function (c) { return c.userData.point != null || c.userData.insert != null; }), false)[0];
    return hit ? hit.object.userData : null;
  }
  function inside(e) { var r = canvas.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; }

  // Where would a part dropped at this pointer position stick? (uses the built pose)
  function snapAt(e, skip) {
    if (!inside(e)) return null;
    apply(Z.pose(state.critter));
    critterGroup.updateMatrixWorld(true);
    ray(e);
    var hit = raycaster.intersectObjects(Object.keys(meshes).filter(function (k) { return !(skip && skip[k]); }).map(function (k) { return meshes[k]; }), false)[0];
    if (!hit) return null;
    var b = Z.block(state.critter, hit.object.userData.id), q = Z.pose(state.critter).blocks[b.id];
    var local = Z.qRot(Z.qConj(q.q), [hit.point.x / M - q.p[0], hit.point.y / M - q.p[1], hit.point.z / M - q.p[2]]);
    var f = Z.faceAt(b.size, local);
    return { parent: b.id, face: f.face, at: f.at };
  }

  // Show a see-through copy of the part or limb (and its twin) where it would stick.
  var ghostKey = '';
  function ghost(kind, snap) {
    var key = snap ? [kind, snap.parent, snap.face, snap.at.join(','), $('zMirror').checked].join('|') : '';
    if (key === ghostKey) return;
    ghostKey = key; disposeTree(ghostGroup);
    if (!snap) return;
    var copy = JSON.parse(JSON.stringify(state.critter)), before = {};
    copy.blocks.forEach(function (b) { before[b.id] = true; });
    if (!Z.attachLimb(copy, kind, snap.parent, snap.face, snap.at, { mirror: $('zMirror').checked })) return;
    var p = Z.pose(copy);
    copy.blocks.filter(function (b) { return !before[b.id]; }).forEach(function (b) {
      var m = blockMesh(b, { ghost: true }); place(m, p.blocks[b.id].p, p.blocks[b.id].q, M); ghostGroup.add(m);
    });
  }

  // Pointer: drag a path point (on its plane), tap a "+" to add a point, press on a part to select it
  // and drag it somewhere else on the Critter, drag the background (or the body) to orbit.
  var down = null;
  canvas.addEventListener('pointerdown', function (e) {
    down = { x: e.clientX, y: e.clientY, path: pickPath(e) };
    if (down.path && down.path.point != null) {
      controls.enabled = false; canvas.setPointerCapture(e.pointerId); state.held = true;
      state.pathPoint = down.path.point; down.remembered = false; renderInspector(); drawPath();
      return;
    }
    if (down.path) return;
    var id = pick(e), b = id && Z.block(state.critter, id);
    if (b && b.mount) {
      controls.enabled = false; canvas.setPointerCapture(e.pointerId); state.held = true; // freeze the wiggle while it's held
      down.part = id; down.remembered = false; down.key = ''; down.hadTwin = !!b.twin;
      if (id !== state.selected) { state.selected = id; state.pathPoint = null; sync(); renderInspector(); drawBeats(); }
    }
  });
  canvas.addEventListener('pointermove', function (e) {
    if (down && down.part) {
      if (!state.moving && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) return;
      state.moving = true; canvas.style.cursor = 'grabbing';
      var z = state.critter, b = Z.block(z, down.part);
      if (!b) return;
      var skip = Z.subtree(z, b.id);
      if (b.twin) Object.assign(skip, Z.subtree(z, b.twin));
      var snap = snapAt(e, skip);
      $('buildMsg').hidden = !!snap; $('buildMsg').textContent = 'Slide it onto another part of your Critter';
      if (!snap) return;
      var key = snap.parent + snap.face + snap.at.join(',');
      if (key === down.key) return;
      var before = JSON.stringify(z);
      if (Z.move(z, b.id, snap.parent, snap.face, snap.at)) {
        down.key = key;
        if (!down.remembered) { state.history.push(before); state.future = []; updateUndo(); down.remembered = true; }
        live(); apply(Z.pose(z));
      }
      return;
    }
    if (down && down.path && down.path.point != null && pathInfo) {
      ray(e);
      var hit = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(pathInfo.plane, hit)) return;
      var f = pathInfo.frame, base = pathInfo.base;
      var local = Z.qRot(Z.qConj(base.q), Z.sub([hit.x / M, hit.y / M, hit.z / M], base.p));
      var rel = Z.sub(local, f.origin), uv = [Math.round(Z.dot(rel, f.U)), Math.round(Z.dot(rel, f.V))];
      var pts = pathInfo.tip.path.points, i = down.path.point;
      if (pts[i][0] === uv[0] && pts[i][1] === uv[1]) return;
      if (!down.remembered) { remember(); down.remembered = true; }
      pts[i] = uv; Z.syncTwin(state.critter, pathInfo.tip); live();
      return;
    }
    if (e.buttons || state.drag) return;
    canvas.style.cursor = pickPath(e) ? 'move' : pick(e) ? 'pointer' : 'grab';
  });
  canvas.addEventListener('pointercancel', function () { state.held = false; if (down && down.part) { state.moving = false; $('buildMsg').hidden = true; if (down.remembered) changed({ inspector: true }); } down = null; controls.enabled = true; });
  canvas.addEventListener('pointerup', function (e) {
    var d = down; down = null; controls.enabled = true; state.held = false;
    if (!d || state.drag) return;
    if (d.part) {
      var moved = state.moving; state.moving = false; $('buildMsg').hidden = true; canvas.style.cursor = '';
      if (d.remembered) { changed({ inspector: true }); if (moved && Z.block(state.critter, d.part) && !Z.block(state.critter, d.part).twin && d.hadTwin) toast('It\u2019s in the middle now, so its twin was taken off.'); }
      return;
    }
    if (d.path && d.path.point != null) { if (d.remembered) changed(); return; }
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) return;
    if (d.path && d.path.insert != null && pathInfo) { insertPoint(pathInfo.tip, d.path.insert); return; }
    var id = pick(e);
    if (id !== state.selected) { state.selected = id; state.pathPoint = null; sync(); renderInspector(); drawBeats(); }
  });

  function render() {
    fitRenderer(renderer, camera, canvas);
    controls.update();
    renderer.render(scene, camera);
  }

  function tint(ids, hex) { ids.forEach(function (id) { var m = meshes[id]; if (m) m.material.color.set(hex); }); }

  return { sync: sync, fit: fit, apply: apply, render: render, snapAt: snapAt, ghost: ghost, controls: controls, tint: tint };
})();

function insertPoint(tip, at) {
  var pts = tip.path.points;
  if (pts.length >= 12) { toast('That loop has plenty of points (12).'); return; }
  remember();
  var a = pts[(at - 1 + pts.length) % pts.length], b = pts[at % pts.length];
  pts.splice(at, 0, [Math.round((a[0] + b[0]) / 2), Math.round((a[1] + b[1]) / 2)]);
  state.pathPoint = at; Z.syncTwin(state.critter, tip);
  changed({ inspector: true });
}

/* ------------------------------------------------------------------ palette */

function renderPalette() {
  function tile(box, key, label, draw) {
    var el = document.createElement('div');
    el.className = 'zl-part'; el.tabIndex = 0; el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Add ' + label.toLowerCase());
    var c = document.createElement('canvas'); c.width = 104; c.height = 60; c.style.width = '52px'; c.style.height = '30px';
    el.appendChild(c); el.appendChild(document.createTextNode(label));
    box.appendChild(el);
    var g = c.getContext('2d'); g.scale(2, 2); draw(g);
    el.addEventListener('pointerdown', function (e) { startPartDrag(key, e, el); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); quickAdd(key); } });
  }
  Object.keys(Z.PARTS).forEach(function (kind) {
    var p = Z.PARTS[kind];
    tile($('zParts'), kind, p.label, function (g) { blobIcon(g, p, 26, 15, 0, Math.min(44 / p.size[0], 24 / p.size[1], 0.6)); });
  });
  Object.keys(Z.LIMBS).forEach(function (k) {
    var L = Z.LIMBS[k];
    tile($('zLimbs'), k, L.label, function (g) {
      var x = k === 'tail' ? 6 : 14, y = k === 'neck' ? 24 : 4, ang = k === 'tail' ? 0.15 : k === 'neck' ? -0.9 : 1.2;
      L.parts.forEach(function (kind, i) {
        var p = Z.PARTS[kind], sc = 15 / Math.max(45, p.size[0]) * (k === 'neck' && i === 1 ? 0.9 : 1), half = p.size[0] * sc / 2;
        blobIcon(g, p, x + Math.cos(ang) * half, y + Math.sin(ang) * half, ang, sc);
        x += Math.cos(ang) * half * 1.8; y += Math.sin(ang) * half * 1.8;
        ang += k === 'tail' ? 0.25 : k === 'neck' ? 0.9 : -1.0;
      });
    });
  });
}

// Side view of a blob for the palette icons.
function blobIcon(g, p, cx, cy, ang, sc) {
  var rows = Z.blobGrid(p, 16, 16);
  g.save(); g.translate(cx, cy); g.rotate(ang);
  g.beginPath();
  rows.forEach(function (row, i) { var q = row[4]; if (i) g.lineTo(q[0] * sc, -q[1] * sc); else g.moveTo(q[0] * sc, -q[1] * sc); });
  rows.slice().reverse().forEach(function (row) { var q = row[12]; g.lineTo(q[0] * sc, -q[1] * sc); });
  g.closePath(); g.fillStyle = p.colour; g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,0.45)'; g.stroke();
  g.restore();
}

function startPartDrag(kind, e, el) {
  e.preventDefault();
  var icon = el.querySelector('canvas'), ghost = icon.cloneNode(false);
  ghost.getContext('2d').drawImage(icon, 0, 0);
  ghost.style.cssText = 'position:fixed;pointer-events:none;z-index:90;width:52px;height:30px;opacity:.9;transform:translate(-50%,-50%) scale(1.4);';
  document.body.appendChild(ghost);
  state.drag = { kind: kind, id: e.pointerId, x0: e.clientX, y0: e.clientY, ghost: ghost, snap: null, over: false, moved: false };
  builder.controls.enabled = false;
  movePartDrag(e);
}
function movePartDrag(e) {
  var d = state.drag;
  if (!d || e.pointerId !== d.id) return;
  if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 6) d.moved = true;
  var r = $('buildCanvas').getBoundingClientRect();
  d.over = d.moved && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  d.snap = d.over ? builder.snapAt(e) : null;
  builder.ghost(d.kind, d.snap);
  d.ghost.style.left = e.clientX + 'px'; d.ghost.style.top = e.clientY + 'px';
  d.ghost.style.display = d.snap ? 'none' : 'block';
  $('buildMsg').hidden = !(d.over && !d.snap);
  $('buildMsg').textContent = 'Drop it on your Critter';
}
function endDrag() {
  var d = state.drag;
  d.ghost.remove(); state.drag = null;
  builder.ghost(null, null); builder.controls.enabled = true; $('buildMsg').hidden = true;
  return d;
}
window.addEventListener('pointermove', movePartDrag);
window.addEventListener('pointerup', function (e) {
  if (!state.drag || e.pointerId !== state.drag.id) return;
  var d = endDrag();
  if (!d.moved) { quickAdd(d.kind); return; }
  if (d.snap) addPart(d.kind, d.snap.parent, d.snap.face, d.snap.at);
  else if (d.over) toast('Parts need to touch your Critter. Drop it on one of its sides.');
});
window.addEventListener('pointercancel', function (e) { if (state.drag && e.pointerId === state.drag.id) endDrag(); });

function addPart(kind, parentId, face, at) {
  var z = state.critter, before = JSON.stringify(z), count = z.blocks.length;
  var b = Z.attachLimb(z, kind, parentId, face, at, { mirror: $('zMirror').checked });
  if (!b) { toast('There isn’t room for that (' + Z.MAX_BLOCKS + ' parts max). Remove something, or switch off "Add in pairs".'); return; }
  state.history.push(before); state.future = [];
  var tip = z.blocks.slice(count).filter(function (x) { return x.path; })[0];
  state.selected = tip ? tip.id : b.id; state.pathPoint = null;
  if (tip) state.tab = 'motion';
  // re-frame the camera if the Critter has grown a lot
  var b0 = Z.bounds(JSON.parse(before)), b1 = Z.bounds(z);
  var span = function (bb) { return Math.max(bb.max[0] - bb.min[0], bb.max[1] - bb.min[1], bb.max[2] - bb.min[2]); };
  changed({ inspector: true, fit: span(b1) > span(b0) * 1.15 });
  toast(tip ? 'Added a walking leg' + (b.twin ? ' pair' : '') + '. Drag its white points to change how it steps.' : b.twin ? 'Added a pair. Its twin on the other side copies your changes.' : 'Added.');
}

// Tap (or Enter) on a part: hang it from the chosen part (or under the body) at the next free spot.
function quickAdd(kind) {
  var z = state.critter, parent = Z.block(z, state.selected) || z.blocks[0];
  var used = Z.children(z, parent.id).map(function (b) { return b.mount.face + b.mount.at.join(','); });
  var spots = parent.mount ? [['+x', [0, 0]]]
    : [['-y', [0.35, 0.35]], ['-y', [-0.35, 0.35]], ['-y', [0, 0.35]], ['+x', [0, 0]], ['-x', [0, 0]], ['+y', [0, 0]]];
  var spot = spots.filter(function (s) { return used.indexOf(s[0] + s[1].join(',')) < 0 && used.indexOf(s[0] + [s[1][0], -s[1][1]].join(',')) < 0; })[0] || spots[0];
  addPart(kind, parent.id, spot[0], spot[1]);
}

/* ------------------------------------------------------------------ copy, cut, paste, duplicate */

// The clipboard holds a part (and everything on it). Kept in this browser so it can go between Critters.
var CLIP_KEY = 'cj-critter-clipboard', clip = null;
try { clip = JSON.parse(localStorage.getItem(CLIP_KEY) || 'null'); } catch (e) { clip = null; }
function setClip(snip) { clip = snip; try { localStorage.setItem(CLIP_KEY, JSON.stringify(snip)); } catch (e) { /* storage off: still works this session */ } }

function chosenPart(verb) {
  var b = Z.block(state.critter, state.selected);
  if (!b) { toast('Choose a part to ' + verb + ' first: tap it, or press N.'); return null; }
  if (!b.mount) { toast('The body holds everything together, so it can\u2019t be ' + (verb === 'cut' ? 'cut' : verb === 'copy' ? 'copied' : 'duplicated') + '. Choose a part.'); return null; }
  return b;
}
function copySelected() {
  var b = chosenPart('copy'); if (!b) return false;
  setClip(Z.copyPart(state.critter, b.id));
  toast('Copied ' + partNames(state.critter)[b.id] + (clip.blocks.length > 1 ? ' (and the ' + (clip.blocks.length - 1) + ' part' + (clip.blocks.length > 2 ? 's' : '') + ' on it)' : '') + '. Choose where it goes and press Paste.');
  renderInspector(); return true;
}
function cutSelected() {
  var b = chosenPart('cut'); if (!b) return;
  setClip(Z.copyPart(state.critter, b.id));
  remember();
  Z.remove(state.critter, b.id);
  state.selected = null; state.pathPoint = null;
  changed({ inspector: true });
  toast('Cut. Choose where it goes and press Paste.');
}
// Paste onto the chosen part (or the body). If the chosen part is the copied one's own spot, it goes next to it.
function pasteClip() {
  if (!clip) { toast('Nothing to paste yet. Choose a part and press Copy first.'); return; }
  var z = state.critter, chosen = Z.block(z, state.selected), parent = chosen || z.blocks[0], near = null;
  if (chosen && chosen.mount && chosen.kind === clip.blocks[0].kind && clip.blocks.length === Z.subtreeSize(z, chosen.id)) { parent = Z.block(z, chosen.mount.parent); near = chosen.mount; }
  placeSnippet(clip, parent.id, near, 'Pasted');
}
function duplicateSelected() {
  var b = chosenPart('duplicate'); if (!b) return;
  placeSnippet(Z.copyPart(state.critter, b.id), b.mount.parent, b.mount, 'Duplicated');
}
function placeSnippet(snip, parentId, near, verb) {
  var z = state.critter, before = JSON.stringify(z), spot = Z.freeSpot(z, parentId, near);
  var nb = Z.pastePart(z, snip, parentId, spot.face, spot.at, { mirror: $('zMirror').checked });
  if (!nb) { toast('There isn\u2019t room for that (' + Z.MAX_BLOCKS + ' parts max). Remove something, or switch off "Add in pairs".'); return; }
  state.history.push(before); if (state.history.length > 80) state.history.shift(); state.future = [];
  state.selected = nb.id; state.pathPoint = null;
  changed({ inspector: true });
  toast(verb + (nb.twin ? ' as a pair' : '') + '. Drag it to wherever you want it.');
}

/* ------------------------------------------------------------------ inspector */

function speedFromPeriod(p) { return Math.round(Math.max(1, Math.min(10, 1 + (2.5 - p) / 0.24))); }
function periodFromSpeed(v) { return Math.round((2.5 - (v - 1) * 0.24) * 100) / 100; }
function swingWord(a) { return a === 0 ? 'still' : a < 15 ? 'a little' : a < 35 ? 'medium' : 'big'; }
function phaseWord(ph) { return 'beat ' + (Math.round(ph * 8) % 8 + 1) + ' of 8'; }
function pct(v) { return Math.round(v * 100) + '%'; }

function slider(label, id, min, max, stepv, value, out) {
  return '<div class="zl-row"><label for="' + id + '">' + label + ' <output id="' + id + 'Out">' + out + '</output></label>' +
    '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + stepv + '" value="' + value + '"></div>';
}
function seg(id, options, current) {
  return '<div class="zl-seg" id="' + id + '">' + options.map(function (o) {
    return '<button type="button" data-v="' + o[0] + '" class="' + (o[0] === current ? 'on' : '') + '">' + o[1] + '</button>';
  }).join('') + '</div>';
}
function dial(label, ph) {
  return '<div class="zl-row"><span class="zl-lbl">' + label + ' <output id="iPhaseOut">' + phaseWord(ph) + '</output></span>' +
    '<div class="zl-dial-row"><svg class="zl-dial" id="iDial" viewBox="0 0 100 100" role="slider" tabindex="0" aria-label="' + label + '" aria-valuemin="0" aria-valuemax="7"></svg>' +
    '<div class="zl-dial-btns"><button type="button" id="iFlip">Opposite beat</button></div></div>' +
    '<p class="zl-hint" style="margin-top:6px;">Parts with the dot in the same place move together. Opposite sides take turns.</p></div>';
}

// Wire a slider: the first nudge of a drag is one undo step; the Critter (and its twin) update live.
function bindSlider(id, b, apply) {
  var input = $(id);
  if (!input) return;
  input.addEventListener('input', function () {
    if (!state.sliding) { remember(); state.sliding = true; }
    $(id + 'Out').textContent = apply(Number(input.value));
    if (b) Z.syncTwin(state.critter, b);
    live();
  });
  input.addEventListener('change', function () { state.sliding = false; changed(); });
}
function bindSeg(id, fn) {
  document.querySelectorAll('#' + id + ' button').forEach(function (btn) {
    btn.addEventListener('click', function () { remember(); fn(btn.dataset.v); changed({ inspector: true }); });
  });
}
function on(id, fn) { var el = $(id); if (el) el.addEventListener('click', fn); }

function editRow(b) {
  var part = b && b.mount;
  return '<div class="zl-edit" role="toolbar" aria-label="Copy and paste">' +
    '<button type="button" id="eCopy"' + (part ? '' : ' disabled') + ' title="Copy (Ctrl+C)">Copy</button>' +
    '<button type="button" id="eCut"' + (part ? '' : ' disabled') + ' title="Cut (Ctrl+X)">Cut</button>' +
    '<button type="button" id="ePaste"' + (clip ? '' : ' disabled') + ' title="Paste (Ctrl+V)">Paste</button>' +
    '<button type="button" id="eDup"' + (part ? '' : ' disabled') + ' title="Duplicate (Ctrl+D)">Duplicate</button></div>';
}
function bindEditRow() { on('eCopy', copySelected); on('eCut', cutSelected); on('ePaste', pasteClip); on('eDup', duplicateSelected); }

function renderInspector() {
  var box = $('zInspector'), z = state.critter, b = Z.block(z, state.selected);
  if (!b) {
    box.innerHTML = '<h2>' + esc(z.name) + '</h2>' + (clip ? editRow(null) : '') + '<p class="zl-empty">' + (z.blocks.length < 2
      ? 'Your Critter is just a body so far. Drag a <strong>Walking leg</strong> onto its underside, or tap one to stick a pair underneath.'
      : 'Tap a part to change its shape and how it moves. Tap the body for the Critter’s cycle speed and turning. Drag the background to look around.') + '</p>' +
      '<p class="zl-empty">' + z.blocks.length + ' of ' + Z.MAX_BLOCKS + ' parts used.</p>' + bestLine(z);
    bindEditRow();
    return;
  }
  var names = partNames(z), j = Z.jointFor(z, b.id), twin = b.twin && Z.block(z, b.twin), tab = state.tab;
  var html = '<h2>' + esc(names[b.id]) + '</h2>' +
    (twin ? '<p class="zl-twin">Mirrored with ' + esc(names[twin.id]) + '. Changes copy across; timing stays its own.</p>' : '') +
    editRow(b) +
    '<div class="zl-tabs" role="tablist"><button type="button" role="tab" data-tab="shape" class="' + (tab === 'shape' ? 'on' : '') + '">Shape</button>' +
    '<button type="button" role="tab" data-tab="motion" class="' + (tab === 'motion' ? 'on' : '') + '">Motion</button></div>';
  html += tab === 'shape' ? shapeTab(b) : b.mount ? motionTab(b, j, names) : bodyMotionTab(z);
  box.innerHTML = html;
  icons();
  box.querySelectorAll('.zl-tabs button').forEach(function (btn) { btn.addEventListener('click', function () { state.tab = btn.dataset.tab; renderInspector(); }); });
  bindEditRow();
  if (tab === 'shape') bindShape(b);
  else if (b.mount) bindMotion(b, j);
  else bindBodyMotion(z);
}

function shapeTab(b) {
  var grip = b.friction >= Z.FRICTION.grippy - 0.01 ? 'grippy' : b.friction <= Z.FRICTION.slippy + 0.01 ? 'slippy' : 'normal';
  return (b.mount ? '' : '<p class="zl-hint">This is the body. Everything hangs off it, and it heads for the red target.</p>') +
    slider('Length', 'iLen', 6, 180, 2, b.size[0], b.size[0] + ' cm') +
    slider('Height', 'iThick', 4, 80, 2, b.size[1], b.size[1] + ' cm') +
    slider('Width', 'iWide', 4, 120, 2, b.size[2], b.size[2] + ' cm') +
    slider('Squareness', 'iSquare', 0, 100, 5, Math.round(b.square * 100), pct(b.square)) +
    slider('Pointiness', 'iPoint', 0, 100, 5, Math.round(b.point * 100), pct(b.point)) +
    '<div class="zl-row"><span class="zl-lbl">Grip</span>' + seg('iGrip', GRIPS, grip) + '</div>' +
    '<div class="zl-row"><span class="zl-lbl">Colour</span><div class="zl-swatches" id="iCol">' +
    COLOURS.map(function (c) { return '<button type="button" aria-label="Colour ' + c + '" data-c="' + c + '" class="' + (c === b.colour ? 'on' : '') + '" style="background:' + c + '"></button>'; }).join('') +
    '</div></div>' +
    '<div class="zl-row zl-wheel-row"><canvas id="iWheel" class="zl-wheel" width="240" height="240" aria-label="Colour wheel: drag around it to pick any colour"></canvas>' +
    '<div class="zl-wheel-side"><label for="iBright" class="zl-lbl">Brightness</label><input type="range" id="iBright" min="15" max="100" step="1" value="' + Math.round(hexToHsv(b.colour).v * 100) + '">' +
    '<div class="zl-wheel-now" id="iNow" style="background:' + b.colour + '"></div><output id="iHex">' + b.colour + '</output></div></div>' +
    '<label class="zl-check" style="margin-top:6px;"><input type="checkbox" id="iEyes"' + (b.eyes ? ' checked' : '') + '> Eyes</label>' +
    (b.mount ? '<button type="button" class="zl-danger" id="iDel">' + ic('trash-2') + ' Remove ' + (b.twin ? 'this pair' : 'this part') + '</button>' : '');
}

function bindShape(b) {
  bindSlider('iLen', b, function (v) { b.size[0] = v; return v + ' cm'; });
  bindSlider('iThick', b, function (v) { b.size[1] = v; return v + ' cm'; });
  bindSlider('iWide', b, function (v) { b.size[2] = v; return v + ' cm'; });
  bindSlider('iSquare', b, function (v) { b.square = v / 100; return v + '%'; });
  bindSlider('iPoint', b, function (v) { b.point = v / 100; return v + '%'; });
  bindSeg('iGrip', function (v) { b.friction = Z.FRICTION[v]; Z.syncTwin(state.critter, b); });
  document.querySelectorAll('#iCol button').forEach(function (btn) {
    btn.addEventListener('click', function () { remember(); b.colour = btn.dataset.c; Z.syncTwin(state.critter, b); changed({ inspector: true }); });
  });
  $('iEyes').addEventListener('change', function () { remember(); b.eyes = this.checked; Z.syncTwin(state.critter, b); changed(); });
  on('iDel', deleteSelected);
  bindWheel(b);
}

/* ---- colour wheel: angle = hue, distance from the middle = how strong the colour is; brightness below ---- */

function hexToHsv(hex) {
  var n = parseInt(String(hex).slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: ((h * 60) + 360) % 360, s: mx ? d / mx : 0, v: mx };
}
function hsvToHex(c) {
  var f = function (n) { var k = (n + c.h / 60) % 6; return c.v - c.v * c.s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return '#' + [f(5), f(3), f(1)].map(function (x) { return ('0' + Math.round(x * 255).toString(16)).slice(-2); }).join('');
}

var wheelBase = null;
function wheelImage(size) {
  if (wheelBase && wheelBase.width === size) return wheelBase;
  wheelBase = document.createElement('canvas'); wheelBase.width = wheelBase.height = size;
  var g = wheelBase.getContext('2d'), img = g.createImageData(size, size), c = size / 2, r = c - 6;
  for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
    var dx = x + 0.5 - c, dy = y + 0.5 - c, d = Math.hypot(dx, dy), i = (y * size + x) * 4;
    if (d > r + 1) continue;
    var hex = hsvToHex({ h: (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360, s: Math.min(1, d / r), v: 1 }), n = parseInt(hex.slice(1), 16);
    img.data[i] = n >> 16 & 255; img.data[i + 1] = n >> 8 & 255; img.data[i + 2] = n & 255; img.data[i + 3] = Math.round(255 * Math.max(0, Math.min(1, r + 1 - d)));
  }
  g.putImageData(img, 0, 0);
  return wheelBase;
}

function bindWheel(b) {
  var cv = $('iWheel'), bright = $('iBright');
  if (!cv) return;
  var g = cv.getContext('2d'), size = cv.width, c = size / 2, r = c - 6, hsv = hexToHsv(b.colour), down = false, remembered = false;
  function draw() {
    g.clearRect(0, 0, size, size);
    g.drawImage(wheelImage(size), 0, 0);
    g.beginPath(); g.arc(c, c, r + 0.5, 0, Math.PI * 2); g.fillStyle = 'rgba(0,0,0,' + (1 - hsv.v) + ')'; g.fill(); // darker = less bright
    var a = hsv.h * Math.PI / 180, mx = c + Math.cos(a) * hsv.s * r, my = c + Math.sin(a) * hsv.s * r;
    g.lineWidth = 4; g.strokeStyle = '#000'; g.beginPath(); g.arc(mx, my, 11, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 3; g.strokeStyle = '#fff'; g.beginPath(); g.arc(mx, my, 11, 0, Math.PI * 2); g.stroke();
  }
  // live: recolour the part (and its twin) straight away; the full redraw happens when you let go
  function apply() {
    var hex = hsvToHex(hsv);
    if (!remembered) { remember(); remembered = true; }
    b.colour = hex; Z.syncTwin(state.critter, b);
    builder.tint([b.id].concat(b.twin ? [b.twin] : []), hex);
    $('iNow').style.background = hex; $('iHex').textContent = hex;
    document.querySelectorAll('#iCol button').forEach(function (s) { s.classList.toggle('on', s.dataset.c === hex); });
    saveCurrent(); draw();
  }
  function finish() { if (remembered) { remembered = false; changed({ inspector: true }); } }
  function pick(e) {
    var rc = cv.getBoundingClientRect(), x = (e.clientX - rc.left) / rc.width * size - c, y = (e.clientY - rc.top) / rc.height * size - c;
    hsv.h = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360; hsv.s = Math.min(1, Math.hypot(x, y) / r);
    if (hsv.v < 0.15) hsv.v = 1; // picking a colour on a black part brings the brightness back up
    bright.value = Math.round(hsv.v * 100);
    apply();
  }
  cv.addEventListener('pointerdown', function (e) { down = true; cv.setPointerCapture(e.pointerId); pick(e); });
  cv.addEventListener('pointermove', function (e) { if (down) pick(e); });
  cv.addEventListener('pointerup', function () { down = false; finish(); });
  cv.addEventListener('pointercancel', function () { down = false; finish(); });
  bright.addEventListener('input', function () { hsv.v = Number(bright.value) / 100; apply(); });
  bright.addEventListener('change', finish);
  draw();
}

function moveMode(b, j) { return b.path ? 'path' : j.motion.amplitude > 0 ? 'swing' : 'still'; }

function motionTab(b, j, names) {
  var z = state.critter, driver = Z.drivenBy(z, b.id);
  if (driver && driver !== b.id) {
    return '<p class="zl-note">This joint is moved by <strong>' + esc(names[driver]) + '</strong>’s motion path (IK): the limb bends itself so its tip follows the white loop. <button type="button" id="iGoTip">Edit that path</button></p>' +
      '<div class="zl-row"><span class="zl-lbl">Hinge</span>' + seg('iHinge', HINGE_LABELS, b.mount.hinge) + '</div>' +
      slider('Lean', 'iLean', -90, 90, 5, b.mount.lean, b.mount.lean + '°') +
      slider('Splay', 'iSplay', -60, 60, 5, b.mount.splay, b.mount.splay + '°');
  }
  var mode = moveMode(b, j), html = '<div class="zl-row"><span class="zl-lbl">How it moves</span>' + seg('iMove', MOVES, mode) + '</div>';
  if (mode === 'path') {
    var pts = b.path.points.length;
    html += '<p class="zl-hint">The tip follows the white loop of IK points, once every cycle. The square point is where the loop starts; the arrows show the way round. Drag points in the 3D view; tap a blue dot to add one.</p>' +
      '<div class="zl-btnrow"><button type="button" id="pWide">Longer steps</button><button type="button" id="pNarrow">Shorter steps</button>' +
      '<button type="button" id="pHigh">Lift higher</button><button type="button" id="pLow">Lift lower</button>' +
      '<button type="button" id="pRev">Reverse</button><button type="button" id="pReset">Reset loop</button>' +
      '<button type="button" id="pDel"' + (state.pathPoint == null || pts <= 2 ? ' disabled' : '') + '>Remove point</button></div>' +
      dial('Movement cycle', b.path.phase);
  } else if (mode === 'swing') {
    html += '<div class="zl-row"><span class="zl-lbl">Hinge</span>' + seg('iHinge', HINGE_LABELS, b.mount.hinge) + '</div>' +
      slider('Swing', 'iAmp', 1, 75, 1, j.motion.amplitude, j.motion.amplitude + '° · ' + swingWord(j.motion.amplitude)) +
      dial('Movement cycle', j.motion.phase);
  } else {
    html += '<p class="zl-hint">This joint holds still (it still gives a little when knocked). Pick Swing to rock it to and fro, or Motion path to make the tip follow a loop.</p>' +
      '<div class="zl-row"><span class="zl-lbl">Hinge</span>' + seg('iHinge', HINGE_LABELS, b.mount.hinge) + '</div>';
  }
  html += slider('Lean', 'iLean', -90, 90, 5, b.mount.lean, b.mount.lean + '°') +
    slider('Splay', 'iSplay', -60, 60, 5, b.mount.splay, b.mount.splay + '°');
  if (mode !== 'path') {
    html += '<div class="zl-sec"><label class="zl-check" style="margin-top:0;"><input type="checkbox" id="iAim"' + (j.aim.on ? ' checked' : '') + '> Bend towards the target</label>' +
      '<p class="zl-hint">Part targeting: works on joints that turn side to side (Sweep, or a twisted part).</p>' +
      (j.aim.on ? slider('Targeting angle', 'iAimAng', 5, 90, 5, j.aim.angle, j.aim.angle + '°') : '') + '</div>';
  }
  return html;
}

function bindMotion(b, j) {
  var z = state.critter;
  on('iGoTip', function () { state.selected = Z.drivenBy(z, b.id); state.pathPoint = null; builder.sync(); renderInspector(); drawBeats(); });
  bindSeg('iHinge', function (v) { b.mount.hinge = v; Z.syncTwin(z, b); });
  bindSeg('iMove', function (v) {
    [b].concat(b.twin ? [Z.block(z, b.twin)] : []).forEach(function (x, i) {
      var xj = Z.jointFor(z, x.id);
      if (v === 'path') {
        // a path drives the whole limb: clear any other paths further up or down it
        z.blocks.forEach(function (o) { if (o !== x && o.path && (Z.chainOf(z, o.id).blocks.indexOf(x.id) >= 0 || Z.chainOf(z, x.id).blocks.indexOf(o.id) >= 0)) delete o.path; });
        Z.defaultPath(z, x.id, i ? 0.5 : 0);
      } else {
        if (x.path) { Z.chainOf(z, x.id).blocks.forEach(function (id) { var cj = Z.jointFor(z, id); cj.motion.amplitude = 0; Z.fitLimits(cj); }); delete x.path; }
        xj.motion.amplitude = v === 'swing' ? 30 : 0; Z.fitLimits(xj);
      }
    });
    state.pathPoint = null;
  });
  bindSlider('iAmp', b, function (v) { j.motion.amplitude = v; Z.fitLimits(j); return v + '° · ' + swingWord(v); });
  bindSlider('iLean', b, function (v) { b.mount.lean = v; return v + '°'; });
  bindSlider('iSplay', b, function (v) { b.mount.splay = v; return v + '°'; });
  bindSlider('iAimAng', b, function (v) { j.aim.angle = v; return v + '°'; });
  var aim = $('iAim');
  if (aim) aim.addEventListener('change', function () { remember(); j.aim.on = this.checked; Z.syncTwin(z, b); changed({ inspector: true }); });
  var phaseObj = b.path ? b.path : j.motion;
  if ($('iDial')) { drawDial(phaseObj.phase); bindDial(phaseObj); }
  on('iFlip', function () { remember(); phaseObj.phase = (phaseObj.phase + 0.5) % 1; changed({ inspector: true }); });
  if (!b.path) return;
  var pts = b.path.points;
  function edit(fn) { return function () { remember(); fn(); Z.syncTwin(z, b); changed({ inspector: true }); }; }
  function centre() { var c = [0, 0]; pts.forEach(function (p) { c[0] += p[0] / pts.length; c[1] += p[1] / pts.length; }); return c; }
  function low() { return Math.min.apply(null, pts.map(function (p) { return p[1]; })); }
  on('pWide', edit(function () { var c = centre(); pts.forEach(function (p) { p[0] = Math.round(c[0] + (p[0] - c[0]) * 1.25); }); }));
  on('pNarrow', edit(function () { var c = centre(); pts.forEach(function (p) { p[0] = Math.round(c[0] + (p[0] - c[0]) * 0.8); }); }));
  on('pHigh', edit(function () { var l = low(); pts.forEach(function (p) { if (p[1] > l) p[1] = Math.round(l + (p[1] - l) * 1.3 + 1); }); }));
  on('pLow', edit(function () { var l = low(); pts.forEach(function (p) { p[1] = Math.round(l + (p[1] - l) * 0.75); }); }));
  on('pRev', edit(function () { var first = pts.shift(); pts.reverse(); pts.unshift(first); }));
  on('pReset', edit(function () { Z.defaultPath(z, b.id, b.path.phase); state.pathPoint = null; }));
  on('pDel', edit(function () { if (state.pathPoint != null && pts.length > 2) { pts.splice(state.pathPoint, 1); state.pathPoint = null; } }));
}

function bodyMotionTab(z) {
  var m = z.motion;
  return '<p class="zl-hint">These settings are for the whole Critter. Every part takes one cycle to do its move.</p>' +
    slider('Cycle speed', 'mSpeed', 1, 10, 1, speedFromPeriod(m.period), m.period + ' s a cycle') +
    slider('Turning sharpness', 'mSharp', 0, 100, 5, Math.round(m.sharpness * 100), pct(m.sharpness)) +
    '<p class="zl-hint" style="margin-top:-4px;">Low: turns in a wide arc. High: pivots on the spot (inside legs walk backwards).</p>' +
    slider('Turning smoothness', 'mSmooth', 0, 100, 5, Math.round(m.smoothness * 100), pct(m.smoothness)) +
    '<p class="zl-hint" style="margin-top:-4px;">Low: snaps round to face the target. High: eases round gently, without skidding.</p>' +
    slider('Muscle power', 'mPower', 30, 250, 10, Math.round(m.power * 100), pct(m.power)) +
    '<p class="zl-hint" style="margin-top:-4px;">How strongly every joint pushes. More power, more wobble!</p>' + bestLine(z);
}

function bindBodyMotion(z) {
  var m = z.motion;
  bindSlider('mSpeed', null, function (v) { m.period = periodFromSpeed(v); return m.period + ' s a cycle'; });
  bindSlider('mSharp', null, function (v) { m.sharpness = v / 100; return v + '%'; });
  bindSlider('mSmooth', null, function (v) { m.smoothness = v / 100; return v + '%'; });
  bindSlider('mPower', null, function (v) { m.power = v / 100; return v + '%'; });
}

function bestLine(z) {
  var bits = Object.keys(Z.CONTESTS).filter(function (k) { return z.best && z.best[k] != null; }).map(function (k) {
    return Z.CONTESTS[k].label + ': <strong>' + fmtScore(k, z.best[k]) + '</strong>';
  });
  return bits.length ? '<p class="zl-empty">Best so far — ' + bits.join(' · ') + '</p>' : '';
}
function fmtScore(k, v) {
  if (k === 'highjump') return Math.round(v) + ' cm';
  if (k === 'lap') return v >= 8 ? 'full lap' : Math.floor(v) + ' flags';
  if (k === 'roam') return v + ' targets';
  return Math.abs(v).toFixed(1) + ' m';
}

function drawDial(ph) {
  var svg = $('iDial'); if (!svg) return;
  var dots = '';
  for (var i = 0; i < 8; i++) {
    var a = i / 8 * Math.PI * 2 - Math.PI / 2;
    dots += '<circle cx="' + (50 + Math.cos(a) * 36) + '" cy="' + (50 + Math.sin(a) * 36) + '" r="3" fill="#d8d5d2"/>';
  }
  var a2 = ph * Math.PI * 2 - Math.PI / 2;
  svg.innerHTML = '<circle cx="50" cy="50" r="44" fill="#f7f5f1" stroke="#d8d5d2" stroke-width="3"/>' + dots +
    '<line x1="50" y1="50" x2="' + (50 + Math.cos(a2) * 32) + '" y2="' + (50 + Math.sin(a2) * 32) + '" stroke="#000" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="' + (50 + Math.cos(a2) * 36) + '" cy="' + (50 + Math.sin(a2) * 36) + '" r="9" fill="#e10000" stroke="#fff" stroke-width="3"/>' +
    '<circle cx="50" cy="50" r="5" fill="#000"/>';
  svg.setAttribute('aria-valuenow', Math.round(ph * 8) % 8);
  svg.setAttribute('aria-valuetext', phaseWord(ph));
}

// obj is the thing with a .phase: a joint's motion, or a path.
function bindDial(obj) {
  var svg = $('iDial'), down = false, remembered = false;
  function set(e) {
    var r = svg.getBoundingClientRect();
    var a = Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) + Math.PI / 2;
    var ph = (Math.round(((a / (Math.PI * 2)) % 1 + 1) % 1 * 8) % 8) / 8;
    if (ph !== obj.phase) {
      if (!remembered) { remember(); remembered = true; }
      obj.phase = ph; drawDial(ph); $('iPhaseOut').textContent = phaseWord(ph); live();
    }
  }
  svg.addEventListener('pointerdown', function (e) { down = true; remembered = false; svg.setPointerCapture(e.pointerId); set(e); });
  svg.addEventListener('pointermove', function (e) { if (down) set(e); });
  svg.addEventListener('pointerup', function () { down = false; if (remembered) changed(); });
  svg.addEventListener('keydown', function (e) {
    var d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
    if (!d) return;
    e.preventDefault(); remember();
    obj.phase = ((Math.round(obj.phase * 8) + d + 8) % 8) / 8;
    drawDial(obj.phase); $('iPhaseOut').textContent = phaseWord(obj.phase); changed();
  });
}

function deleteSelected() {
  var b = Z.block(state.critter, state.selected);
  if (!b || !b.mount) return;
  remember();
  var gone = Z.remove(state.critter, b.id);
  state.selected = null; state.pathPoint = null;
  changed({ inspector: true });
  toast(gone.length > 1 ? 'Removed ' + gone.length + ' parts.' : 'Part removed.');
}

/* ------------------------------------------------------------------ beat chart */

var beatCanvas = $('beatCanvas');
var BEAT_ROW = 30, BEAT_LABEL = 116, BEAT_SECS = 3;

function sizeCanvas(c) {
  var dpr = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight;
  if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  var ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx: ctx, w: w, h: h };
}

// Rows: every swinging joint (its swing) and every path (its foot's forwards/backwards position).
function beatRows(z) {
  var rows = [];
  z.blocks.forEach(function (b) {
    if (b.path) { rows.push({ id: b.id, path: b }); return; }
    var j = Z.jointFor(z, b.id);
    if (j && !Z.drivenBy(z, b.id)) rows.push({ id: b.id, joint: j });
  });
  return rows;
}

function drawBeats() {
  var z = state.critter, rows = beatRows(z), period = z.motion.period;
  $('beatsWrap').hidden = state.mode !== 'build';
  beatCanvas.style.height = Math.max(1, rows.length) * BEAT_ROW + 8 + 'px';
  var s = sizeCanvas(beatCanvas), ctx = s.ctx, names = partNames(z);
  ctx.clearRect(0, 0, s.w, s.h);
  if (!rows.length) {
    ctx.fillStyle = '#585555'; ctx.font = '600 13px Montserrat, sans-serif';
    ctx.fillText('No joints yet. Every part you add hangs from a joint.', 4, 22); return;
  }
  var gw = s.w - BEAT_LABEL - 8;
  rows.forEach(function (row, i) {
    var y0 = 4 + i * BEAT_ROW, mid = y0 + BEAT_ROW / 2, b = Z.block(z, row.id), sel = state.selected === row.id;
    if (sel) { ctx.fillStyle = 'rgba(56,182,255,0.12)'; ctx.fillRect(0, y0, s.w, BEAT_ROW); }
    ctx.fillStyle = b.colour; ctx.fillRect(4, mid - 6, 12, 12);
    ctx.fillStyle = '#000'; ctx.font = (sel ? '800' : '600') + ' 12.5px Montserrat, sans-serif';
    ctx.fillText(names[b.id] + (row.path ? ' ↻' : ''), 22, mid + 4);
    ctx.strokeStyle = '#efece8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(BEAT_LABEL, mid); ctx.lineTo(BEAT_LABEL + gw, mid); ctx.stroke();
    var pts = row.path && row.path.path.points, us = pts && pts.map(function (p) { return p[0]; });
    var umin = us && Math.min.apply(null, us), umax = us && Math.max.apply(null, us);
    ctx.strokeStyle = row.joint && !row.joint.motion.amplitude ? '#d8d5d2' : b.colour; ctx.lineWidth = sel ? 3 : 2; ctx.beginPath();
    for (var x = 0; x <= gw; x += 2) {
      var t = x / gw * BEAT_SECS, v;
      if (row.path) { var uv = Z.pathAt(pts, t / period + row.path.path.phase); v = umax > umin ? ((uv[0] - umin) / (umax - umin) * 2 - 1) : 0; }
      else v = row.joint.motion.amplitude * Math.sin(2 * Math.PI * (t / period + row.joint.motion.phase)) / 75;
      v *= BEAT_ROW / 2 - 3;
      if (x === 0) ctx.moveTo(BEAT_LABEL + x, mid - v); else ctx.lineTo(BEAT_LABEL + x, mid - v);
    }
    ctx.stroke();
  });
  if ($('zPreview').checked) {
    var px = BEAT_LABEL + (state.t % BEAT_SECS) / BEAT_SECS * gw;
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, 2); ctx.lineTo(px, s.h - 2); ctx.stroke();
  }
}
beatCanvas.addEventListener('click', function (e) {
  var r = beatCanvas.getBoundingClientRect(), i = Math.floor((e.clientY - r.top - 4) / BEAT_ROW), row = beatRows(state.critter)[i];
  if (row) { state.selected = row.id; state.tab = 'motion'; state.pathPoint = null; builder.sync(); renderInspector(); drawBeats(); }
});

/* ------------------------------------------------------------------ arena (3D) */

// One arena per canvas: the Test it! arena and the Showdown arena.
function makeArena(canvas) {
  var renderer = null, scene, camera, controls, sun, courseGroup, critterGroup, propGroup, markerGroup, tagGroup, trail, trailPts;
  var meshes = [], props = [], markers = [], tags = [];

  function init() {
    renderer = makeRenderer(canvas);
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#bfe6ff');
    scene.fog = new THREE.Fog('#d7efff', 16, 50);
    camera = new THREE.PerspectiveCamera(42, 2, 0.05, 140);
    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true; controls.dampingFactor = 0.1; controls.enablePan = false;
    controls.minDistance = 1; controls.maxDistance = 16; controls.maxPolarAngle = Math.PI * 0.48;
    sun = lights(scene, 5);
    courseGroup = new THREE.Group(); scene.add(courseGroup);
    propGroup = new THREE.Group(); scene.add(propGroup);
    critterGroup = new THREE.Group(); scene.add(critterGroup);
    markerGroup = new THREE.Group(); scene.add(markerGroup);
    tagGroup = new THREE.Group(); scene.add(tagGroup);
    trailPts = new Float32Array(3 * 2000);
    var tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(trailPts, 3)); tg.setDrawRange(0, 0);
    trail = new THREE.Line(tg, new THREE.LineBasicMaterial({ color: '#e10000' })); trail.frustumCulled = false; scene.add(trail);
    // tap the ground (free roam) to move the red target
    var down = null, raycaster = new THREE.Raycaster();
    canvas.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; });
    canvas.addEventListener('pointerup', function (e) {
      if (!down || canvas.id !== 'arenaCanvas' || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6 || !state.sim || state.sim.contest !== 'roam') { down = null; return; }
      down = null;
      var r = canvas.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), camera);
      var hit = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit)) {
        state.sim.setTarget([hit.x, 0, hit.z]); $('arenaMsg').hidden = true;
        if (!state.running) go();
      }
    });
  }

  function textSprite(text, colour, scaleBy) {
    var c = document.createElement('canvas'), g = c.getContext('2d'), font = '900 56px Montserrat, sans-serif';
    g.font = font;
    var w = Math.max(256, Math.ceil(g.measureText(text).width) + 40);
    c.width = w; c.height = 96;
    g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 10; g.strokeStyle = 'rgba(0,0,0,0.35)'; g.strokeText(text, w / 2, 48);
    g.fillStyle = colour; g.fillText(text, w / 2, 48);
    var tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, depthTest: false }));
    s.renderOrder = 20;
    s.scale.set(0.8 * (scaleBy || 1) * w / 256, 0.3 * (scaleBy || 1), 1);
    return s;
  }

  function mat(colour, rough) { return new THREE.MeshStandardMaterial({ color: colour, roughness: rough == null ? 1 : rough }); }

  function buildCourse(sim) {
    disposeTree(courseGroup);
    sim.course.forEach(function (s) {
      var m;
      if (s.type === 'floor') {
        m = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat(sim.contest === 'sumo' ? '#5d7f56' : '#8fd47e'));
        m.rotation.x = -Math.PI / 2; m.position.y = s.y; m.receiveShadow = true; courseGroup.add(m);
      } else if (s.type === 'track') {
        m = new THREE.Mesh(new THREE.PlaneGeometry(s.to - s.from, s.width), mat('#c99a62'));
        m.rotation.x = -Math.PI / 2; m.position.set((s.from + s.to) / 2, 0.002, s.z); m.receiveShadow = true; courseGroup.add(m);
        for (var x = Math.ceil(s.from); x <= s.to; x++) {
          var bar = new THREE.Mesh(new THREE.PlaneGeometry(x === 0 ? 0.08 : 0.03, s.width), new THREE.MeshBasicMaterial({ color: x === 0 ? '#e10000' : '#ffffff' }));
          bar.rotation.x = -Math.PI / 2; bar.position.set(x, 0.004, s.z); courseGroup.add(bar);
          if (x >= 0 && s.z <= 0) { var label = textSprite(x === 0 ? 'START' : x + ' m', x === 0 ? '#e10000' : '#ffffff'); label.position.set(x, 0.18, s.z - s.width / 2 - 0.25); courseGroup.add(label); }
        }
      } else if (s.type === 'prism') {
        var shape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(s.length / 2, s.height), new THREE.Vector2(s.length, 0)]);
        m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: s.width, bevelEnabled: false }), mat('#7cc46b'));
        m.position.set(s.x0, 0, -s.width / 2); m.castShadow = m.receiveShadow = true; courseGroup.add(m);
      } else if (s.type === 'platform') {
        m = new THREE.Mesh(new THREE.CylinderGeometry(s.r, s.r, s.h, 64), mat('#e6d3b3'));
        m.position.y = -s.h / 2; m.receiveShadow = true; courseGroup.add(m);
        var edge = new THREE.Mesh(new THREE.RingGeometry(s.r - 0.12, s.r, 64), new THREE.MeshBasicMaterial({ color: '#e10000' }));
        edge.rotation.x = -Math.PI / 2; edge.position.y = 0.003; courseGroup.add(edge);
      } else if (s.type === 'ring') {
        m = new THREE.Mesh(new THREE.RingGeometry(s.r - s.width / 2, s.r + s.width / 2, 96), mat('#c99a62'));
        m.rotation.x = -Math.PI / 2; m.position.set(s.c[0], 0.002, s.c[2]); m.receiveShadow = true; courseGroup.add(m);
      } else if (s.type === 'pole') {
        var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 12), mat('#ffffff', 0.4));
        pole.position.set(s.x, 1.1, s.z); courseGroup.add(pole);
        for (var hgt = 25; hgt <= 200; hgt += 25) {
          var tick = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: hgt % 100 ? '#585555' : '#e10000' }));
          tick.position.set(s.x, hgt / 100, s.z); courseGroup.add(tick);
          if (hgt % 50 === 0) { var lab = textSprite(hgt + ' cm', '#ffffff', 0.7); lab.position.set(s.x, hgt / 100, s.z - 0.35); courseGroup.add(lab); }
        }
      }
    });
  }

  // opts.tags = [{ text, colour }] puts a name over each Critter (Showdown)
  function load(sim, opts) {
    if (!renderer) init();
    buildCourse(sim);
    disposeTree(critterGroup); disposeTree(propGroup); disposeTree(tagGroup);
    tags = ((opts && opts.tags) || []).map(function (t) { var sp = textSprite(t.text, t.colour, 1.25); tagGroup.add(sp); return sp; });
    meshes = sim.critters.map(function (zs) {
      var out = {};
      zs.critter.blocks.forEach(function (b) { var m = blockMesh(b); out[b.id] = m; critterGroup.add(m); });
      return out;
    });
    props = sim.props.map(function (p) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(p.half[0] * 2, p.half[1] * 2, p.half[2] * 2), mat(p.colour, 0.7));
      m.castShadow = m.receiveShadow = true; propGroup.add(m); return m;
    });
    var c = sim.com(0), mid = focus(sim);
    controls.target.set(mid.x, Math.max(0.3, c.y), mid.z);
    var n = sim.critters.length, wide = sim.showdown ? Math.max(0, n - 2) * 1.6 : 0;
    var back = sim.showdown ? (sim.contest === 'lap' ? [0, 8.5, 9.5] : sim.contest === 'sumo' ? [0, 5, 7.2] : [-2.2, 2.8 + wide * 0.5, 6.5 + wide]) :
      sim.contest === 'lap' || sim.contest === 'roam' ? [-3, 4, 5] : sim.contest === 'sumo' ? [0, 4, 6] : sim.contest === 'race' ? [-0.6, 2, 6] : [-0.6, 1.4, 3.8];
    if (sim.showdown) c = { y: 0.3 };
    camera.position.set(mid.x + back[0], c.y + back[1], mid.z + back[2]);
    trail.geometry.setDrawRange(0, 0); trail.userData.n = 0;
    draw(sim);
  }

  function focus(sim) {
    if (sim.contest === 'sumo') return { x: 0, z: 0 };
    if (sim.showdown) {
      if (sim.contest === 'lap') return { x: 0, z: -4 };
      var xs = sim.critters.map(function (zs, i) { return sim.com(i).x; }).filter(isFinite);
      return { x: xs.length ? xs.reduce(function (a, b) { return a + b; }, 0) / xs.length : 0, z: 0 };
    }
    if (sim.contest === 'race' && sim.critters[1]) { var a = sim.com(0), b = sim.com(1); return { x: (a.x + b.x) / 2, z: 0 }; }
    var c = sim.com(0); return { x: c.x, z: c.z };
  }

  // Red target balls (bobbing, with a pulsing ring) and flags round the lap.
  var targetGeo = null, ringGeo = null;
  function drawMarkers(sim) {
    var list = sim.markers(), t = sim.t;
    if (!targetGeo) { targetGeo = keepGeo(new THREE.SphereGeometry(0.16, 24, 16)); ringGeo = keepGeo(new THREE.RingGeometry(0.28, 0.36, 40)); }
    while (markers.length < list.length) {
      var g = new THREE.Group(), ball = new THREE.Mesh(targetGeo, new THREE.MeshStandardMaterial({ color: '#e10000', emissive: new THREE.Color('#7a0000'), roughness: 0.3 }));
      var ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: '#e10000', transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01;
      var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8), mat('#ffffff', 0.5)); pole.position.y = 0.6;
      var flag = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.26), new THREE.MeshStandardMaterial({ color: '#f59f18', side: THREE.DoubleSide })); flag.position.set(0.2, 1.05, 0);
      g.add(ball); g.add(ring); g.add(pole); g.add(flag); g.userData = { ball: ball, ring: ring, pole: pole, flag: flag };
      markerGroup.add(g); markers.push(g);
    }
    markers.forEach(function (g, i) {
      var m = list[i];
      g.visible = !!m;
      if (!m) return;
      var isTarget = m.kind === 'target', isFlag = sim.contest === 'lap';
      g.position.set(m.p[0], 0, m.p[2]);
      g.userData.ball.visible = isTarget; g.userData.ring.visible = isTarget;
      g.userData.ball.position.y = 0.32 + Math.sin(t * 4) * 0.06;
      g.userData.ring.scale.setScalar(1 + (t * 1.5 % 1) * 0.6);
      g.userData.pole.visible = g.userData.flag.visible = isFlag;
      g.userData.flag.material.color.set(m.kind === 'done' ? '#00bf63' : isTarget ? '#e10000' : '#f59f18');
    });
  }

  function draw(sim) {
    sim.critters.forEach(function (zs, i) {
      var ts = Z.transforms(sim, i);
      if (!ts.length || !isFinite(ts[0].p[0])) { Object.keys(meshes[i]).forEach(function (id) { meshes[i][id].visible = false; }); if (tags[i]) tags[i].visible = false; return; }
      ts.forEach(function (t) { var m = meshes[i][t.id]; if (m) place(m, t.p, t.q, 1); });
      if (tags[i]) { var cc = sim.com(i); tags[i].position.set(cc.x, Math.max(cc.y, 0) + 0.75, cc.z); }
    });
    sim.props.forEach(function (p, i) { var t = p.body.translation(), r = p.body.rotation(); props[i].position.set(t.x, t.y, t.z); props[i].quaternion.set(r.x, r.y, r.z, r.w); });
    drawMarkers(sim);
    var c = sim.com(0), f = focus(sim);
    if (sim.showdown) c = { x: f.x, y: 0.4, z: f.z };
    if (isFinite(c.x)) {
      // follow the action, keeping whatever angle the viewer has orbited to
      var target = new THREE.Vector3(f.x, Math.max(0.25, Math.min(c.y, 1.5)), f.z), delta = target.sub(controls.target).multiplyScalar($('zTurbo').checked ? 0.4 : 0.15);
      controls.target.add(delta); camera.position.add(delta);
      sun.position.set(f.x + 2.5, 6, f.z + 3.5); sun.target.position.set(f.x, 0, f.z);
      var n = trail.userData.n || 0;
      if (!sim.showdown && n < 2000 && (n === 0 || Math.hypot(trailPts[(n - 1) * 3] - c.x, trailPts[(n - 1) * 3 + 2] - c.z) > 0.03)) {
        trailPts[n * 3] = c.x; trailPts[n * 3 + 1] = 0.012; trailPts[n * 3 + 2] = c.z;
        trail.userData.n = n + 1; trail.geometry.setDrawRange(0, n + 1); trail.geometry.attributes.position.needsUpdate = true;
      }
    }
  }

  function render() {
    if (!renderer) return;
    fitRenderer(renderer, camera, canvas);
    controls.update();
    renderer.render(scene, camera);
  }

  return { load: load, draw: draw, render: render };
}
var arena = makeArena($('arenaCanvas')), sdArena = null;

/* ------------------------------------------------------------------ contests */

function renderContests() {
  var box = $('zContests');
  box.innerHTML = Object.keys(Z.CONTESTS).map(function (k) {
    var C = Z.CONTESTS[k];
    return '<button type="button" role="radio" class="zl-contest' + (k === state.contest ? ' on' : '') + '" data-c="' + k + '" aria-checked="' + (k === state.contest) + '">' +
      ic(C.icon) + '<strong>' + C.label + '</strong><span>' + (C.seconds ? C.seconds + ' s' : 'no time limit') + (C.two ? ' · 2 Critters' : '') + '</span></button>';
  }).join('');
  icons();
  box.querySelectorAll('button').forEach(function (b) {
    b.addEventListener('click', function () { state.contest = b.dataset.c; renderContests(); resetRun(); });
  });
  var C = Z.CONTESTS[state.contest];
  $('zAbout').textContent = C.about;
  $('zOppWrap').hidden = !C.two;
  if (C.two) renderOpponents();
}

function renderOpponents() {
  var sel = $('zOpp');
  var opts = [['self', 'Itself (mirror match)']].concat(Object.keys(Z.STARTERS).map(function (k) { return ['starter:' + k, Z.STARTERS[k].label]; }));
  sel.innerHTML = opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === state.opponent ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('');
}

function opponentCritter() {
  var v = state.opponent || 'self';
  if (v.indexOf('starter:') === 0 && Z.STARTERS[v.slice(8)]) return Z.STARTERS[v.slice(8)].make();
  return JSON.parse(JSON.stringify(state.critter));
}

var physicsReady = null;
function loadPhysics() {
  if (!physicsReady) physicsReady = import('./vendor/rapier3d-compat-0.21.0.min.js').then(function (mod) {
    var r = mod.default || mod;
    return Promise.resolve(r.init()).then(function () { R = r; return r; });
  });
  return physicsReady;
}

function resetRun() {
  var msg = $('arenaMsg');
  if (!R) {
    msg.hidden = false; msg.classList.remove('low'); msg.textContent = 'Getting the physics ready…';
    loadPhysics().then(function () { msg.hidden = true; if (state.mode === 'test') { resetRun(); if (state.autoGo) go(); } })
      .catch(function () { msg.textContent = 'The physics engine didn’t load. Check your connection and refresh the page.'; });
    return;
  }
  if (state.sim) state.sim.free();
  var C = Z.CONTESTS[state.contest];
  state.sim = Z.createSim(R, state.contest, C.two ? [state.critter, opponentCritter()] : [state.critter]);
  state.running = false; state.acc = 0;
  arena.load(state.sim);
  $('zResult').hidden = true;
  msg.hidden = state.contest !== 'roam'; msg.classList.add('low');
  msg.textContent = 'Tap the ground to move the red target. Your Critter will head for it.';
  setGo('Go!', 'play');
  hud();
}

function setGo(label, icon) { $('zGo').innerHTML = ic(icon) + ' ' + label; icons(); }

function go() {
  if (!R) { state.autoGo = true; return; }
  state.autoGo = false;
  if (state.running) { state.running = false; setGo('Go!', 'play'); if (state.contest !== 'roam') resetRun(); return; }
  if (!state.sim || (state.sim.t > 0 && state.contest !== 'roam')) resetRun();
  state.running = true; state.acc = 0;
  setGo('Stop', 'square');
}

function hud() {
  var sim = state.sim; if (!sim) return;
  var C = Z.CONTESTS[state.contest], r = sim.result(), best = state.critter.best && state.critter.best[state.contest];
  $('hudLabel').textContent = C.label;
  $('hudDist').textContent = state.contest === 'sumo' ? (sim.critters[0].out ? 'Out!' : sim.critters[1] && sim.critters[1].out ? 'They’re out!' : 'Push!') : r.text;
  $('hudTime').textContent = sim.seconds === Infinity ? sim.t.toFixed(0) + ' s' : Math.max(0, sim.seconds - sim.t).toFixed(1) + ' s left';
  $('hudBest').textContent = best != null && !C.two ? 'Best ' + fmtScore(state.contest, best) : '';
  $('hudBar').style.width = sim.seconds === Infinity ? '0' : Math.min(100, sim.t / sim.seconds * 100) + '%';
}

function finishRun() {
  var sim = state.sim, z = state.critter, r = sim.result(), C = Z.CONTESTS[state.contest];
  state.running = false;
  setGo('Go again', 'rotate-ccw');
  var prev = z.best && z.best[state.contest];
  var keep = !C.two && state.contest !== 'roam' && !sim.broken;
  var isBest = keep && (prev == null || r.score > prev + 0.005);
  if (isBest) { z.best = z.best || {}; z.best[state.contest] = Math.round(r.score * 100) / 100; saveCurrent(); }
  var big, msg, badge = isBest ? 'New best!' : C.label;
  if (sim.broken) { big = 'Oops!'; msg = 'Whoa, it came apart! Try smaller swings, slower cycles or less power.'; }
  else if (state.contest === 'sumo') { big = r.win === true ? 'You win!' : r.win === false ? 'You lose' : 'Draw'; msg = r.text + '.'; }
  else if (state.contest === 'race') { big = r.win ? 'You win!' : 'You lose'; msg = 'Your Critter: ' + r.score.toFixed(1) + ' m. Opponent: ' + r.other.toFixed(1) + ' m.'; }
  else {
    big = fmtScore(state.contest, r.score);
    msg = r.text + '. ' + (state.contest === 'lap' && r.score < 2 ? 'Steering is the trick here: try the body’s turning sharpness, or legs on each side that can change their stride.'
      : state.contest === 'highjump' ? 'Bigger swings, more power and all legs on the same beat make a springier Critter.'
      : state.contest === 'blockpush' ? 'A wide, heavy front end shoves more blocks.'
      : r.score < 0 ? 'It went backwards! Try reversing its foot loops, or flipping some beats.'
      : r.score < 0.5 ? 'It hardly moved. Try grippy feet, longer steps, or legs on opposite beats.' : 'Can you tweak it to do even better?');
  }
  var box = $('zResult');
  box.innerHTML = '<div class="zl-card"><div class="zl-badge' + (isBest || r.win ? ' win' : '') + '">' + esc(badge) + '</div>' +
    '<div class="big">' + esc(big) + '</div><p class="zl-muted" style="margin:8px 0 0;">' + esc(msg) + '</p>' +
    '<div class="actions"><button type="button" class="zl-go" id="rAgain">' + ic('rotate-ccw') + ' Go again</button>' +
    '<button type="button" class="zl-tool" id="rBuild">' + ic('wrench') + ' Tweak it</button></div></div>';
  box.hidden = false;
  icons();
  $('rAgain').addEventListener('click', function () { resetRun(); go(); });
  $('rBuild').addEventListener('click', function () { setMode('build'); });
}

/* ------------------------------------------------------------------ modes + loop */

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.zl-mode').forEach(function (b) {
    var onb = b.dataset.mode === mode; b.classList.toggle('active', onb); b.setAttribute('aria-selected', onb ? 'true' : 'false');
  });
  $('buildStage').hidden = mode !== 'build';
  $('beatsWrap').hidden = mode !== 'build';
  $('testStage').hidden = mode !== 'test';
  $('sdStage').hidden = mode !== 'showdown';
  if (mode === 'showdown') { sdShow(); return; }
  if (mode === 'test') { renderContests(); state.autoGo = state.contest !== 'roam'; resetRun(); if (R && state.autoGo) go(); }
  else { state.running = false; requestAnimationFrame(drawBeats); }
}

function visible() { return root.offsetParent !== null && !document.hidden; }

function frame(now) {
  if (destroyed) return;
  if (!visible()) { state.lastFrame = 0; state.running = state.running && state.mode === 'test'; requestAnimationFrame(frame); return; }
  var dt = Math.min(0.1, (now - (state.lastFrame || now)) / 1000);
  state.lastFrame = now;
  if (state.mode === 'build') {
    var wiggle = $('zPreview').checked && !state.drag && !state.moving;
    if (wiggle && !state.held) state.t += dt; // a pressed part stays exactly where it is until you let go
    if (!state.drag && !state.moving) builder.apply(Z.pose(state.critter, wiggle && state.ctrl ? state.ctrl.angles(state.t, null) : null));
    builder.render();
    if (wiggle) drawBeats();
  } else if (state.mode === 'showdown') {
    sdFrame(dt);
  } else if (state.sim) {
    if (state.running) {
      state.acc += dt * ($('zTurbo').checked ? 3 : 1);
      var n = 0;
      while (state.acc >= Z.STEP && n < 12 && !state.sim.done()) { state.sim.step(); state.acc -= Z.STEP; n++; }
      if (state.acc > Z.STEP * 12) state.acc = 0; // a slow device runs in slow motion rather than skipping
      hud();
      if (state.sim.done()) finishRun();
    }
    arena.draw(state.sim);
    arena.render();
  }
  requestAnimationFrame(frame);
}

/* ------------------------------------------------------------------ dialogs: starters, my critters, share */

var dialog = $('zDialog');
function openDialog(title, bodyHtml) {
  dialog.innerHTML = '<div class="head"><h3>' + esc(title) + '</h3><button type="button" class="zl-icon" id="dClose" aria-label="Close">' + ic('x') + '</button></div><div class="body">' + bodyHtml + '</div>';
  icons();
  $('dClose').addEventListener('click', function () { dialog.close(); });
  if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
}

function fresh(z) { var c = JSON.parse(JSON.stringify(z)); c.id = Z.uid('critter'); c.best = {}; return c; }

// Pictures of Critters for the galleries, from one small offscreen renderer.
var thumbs = (function () {
  var r = null, scene, camera, group;
  return function (z) {
    try {
      if (!r) {
        var c = document.createElement('canvas'); c.width = 380; c.height = 240;
        r = makeRenderer(c, { preserveDrawingBuffer: true, alpha: true }); r.setPixelRatio(1); r.setSize(380, 240, false);
        scene = new THREE.Scene(); lights(scene, 2); camera = new THREE.PerspectiveCamera(34, 380 / 240, 0.05, 40);
        group = new THREE.Group(); scene.add(group);
      }
      disposeTree(group);
      var p = Z.pose(z), bb = Z.bounds(z, p);
      z.blocks.forEach(function (b) { var m = blockMesh(b); place(m, p.blocks[b.id].p, p.blocks[b.id].q, M); group.add(m); });
      var c2 = new THREE.Vector3((bb.min[0] + bb.max[0]) / 2 * M, (bb.min[1] + bb.max[1]) / 2 * M, (bb.min[2] + bb.max[2]) / 2 * M);
      var size = Math.max(bb.max[0] - bb.min[0], bb.max[1] - bb.min[1], bb.max[2] - bb.min[2]) * M;
      camera.position.copy(c2).addScaledVector(new THREE.Vector3(0.55, 0.42, 0.75).normalize(), size * 2.3 + 0.3); camera.lookAt(c2);
      r.render(scene, camera);
      return r.domElement.toDataURL('image/png');
    } catch (e) { return ''; }
  };
})();

// Video guides (critter/guides/*.mp4, recorded from the real app; see CLAUDE.md "Video guides").
var GUIDES = [
  { file: 'g1-build-your-first-critter', title: '1 · Build your first walking Critter', about: 'Give a body two pairs of walking legs, then test it in the Sprint.' },
  { file: 'g2-fix-the-wobble-with-beats', title: '2 · Fix the wobble with beats', about: 'Use the beat chart and Opposite beat to make it trot. Nearly three times as far!' },
  { file: 'g3-lift-higher-for-hurdles', title: '3 · Lift higher for Hurdles', about: 'Make the white foot loops taller so it clears the humps.' }
];
function guideUrl(f) { return new URL('./guides/' + f, import.meta.url).href; }
function showGuides() {
  openDialog('Video guides: make a Critter that walks', '<p class="zl-muted" style="margin-top:0;">Three short videos (about a minute and a half each, with captions, no sound needed). Watch one, then try it yourself.</p><div class="zl-videos">' +
    GUIDES.map(function (g) {
      return '<figure><video controls preload="none" playsinline poster="' + guideUrl(g.file + '.jpg') + '" src="' + guideUrl(g.file + '.mp4') + '"></video>' +
        '<figcaption><strong>' + esc(g.title) + '</strong><span>' + esc(g.about) + '</span></figcaption></figure>';
    }).join('') + '</div>');
  // only one plays at a time
  var vids = dialog.querySelectorAll('video');
  vids.forEach(function (v) { v.addEventListener('play', function () { vids.forEach(function (o) { if (o !== v) o.pause(); }); }); });
  dialog.addEventListener('close', function stop() { vids.forEach(function (v) { v.pause(); }); dialog.removeEventListener('close', stop); });
}

function showStarters() {
  var keys = Object.keys(Z.STARTERS);
  openDialog('Start from a ready-made Critter', '<p class="zl-muted" style="margin-top:0;">Each of these really moves. Open one, test it, then change it and see what happens.</p><div class="zl-gallery">' +
    keys.map(function (k) {
      var s = Z.STARTERS[k];
      return '<div class="zl-tile"><img alt="' + s.label + '" src="' + thumbs(s.make()) + '"><div class="meta"><strong>' + s.label + '</strong><span>' + s.blurb + '</span></div>' +
        '<div class="acts"><button type="button" class="zl-go small" data-open="' + k + '">Use this one</button></div></div>';
    }).join('') + '</div>');
  dialog.querySelectorAll('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () {
      remember(); setCritter(fresh(Z.STARTERS[b.dataset.open].make())); dialog.close(); setMode('build');
      toast('Here’s ' + state.critter.name + '. Press Test it! to watch it go.');
    });
  });
}

/* ------------------------------------------------------------------ Showdown: a teacher races up to four pupils' Critters
 * Runs over CodeJump's live rooms (host.cloud gives api(), wsUrl(), me(), saves(), loadSave(), signIn()). The teacher's
 * screen is in charge: it keeps the room's document (doc) and sends it to everyone; a pupil sends in one Critter
 * (an 'sd_enter' op, which the room stamps with who sent it). When the race starts every screen runs the same
 * contest, so pupils watch it live on their own screens too. */
var SD_TITLE = 'Critter Showdown';
var SD_COLOURS = ['#38b6ff', '#f59f18', '#00bf63', '#ff66c4'];
var sd = null;

function cloud() { return host.cloud || null; }
function isSdTitle(t) { return String(t || '').indexOf(SD_TITLE) === 0; }
function isSdDoc(d) { return !!(d && d.kind === 'critter-showdown' && Array.isArray(d.slots)); }
function placeWord(n) { return n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'); }
function sdCritter(c) {
  try { var z = Z.normalise(c); if (!z.blocks.length || z.blocks.length > Z.MAX_BLOCKS) return null; z.best = {}; return z; } catch (e) { return null; }
}
function contestChip(k, current, disabled) {
  var C = Z.CONTESTS[k];
  return '<button type="button" role="radio" class="zl-contest' + (k === current ? ' on' : '') + '" data-c="' + k + '" aria-checked="' + (k === current) + '"' + (disabled ? ' disabled' : '') + '>' +
    ic(C.icon) + '<strong>' + (k === 'sumo' ? 'Super Sumo' : C.label) + '</strong><span>' + C.seconds + ' s</span></button>';
}

// The Showdown button: sign in, host one (teachers), or join one you've been picked for.
function showdownMenu() {
  var c = cloud(), me = c && c.me();
  if (sd) { setMode('showdown'); return; }
  if (!c) { openDialog(SD_TITLE, '<p class="zl-muted" style="margin-top:0;">Showdowns need CodeJump Cloud.</p>'); return; }
  if (!me) {
    openDialog(SD_TITLE, '<p class="zl-muted" style="margin-top:0;">Sign in to CodeJump Cloud to take part. Your teacher picks up to four of you, you each send in one of your saved Critters, and they race on the big screen.</p><div class="zl-sd-actions"><button type="button" class="zl-go" id="sdSignIn">Sign in</button></div>');
    on('sdSignIn', function () { dialog.close(); c.signIn(); });
    return;
  }
  openDialog(SD_TITLE, '<div id="sdMenu"><p class="zl-muted" style="margin-top:0;">Looking for Showdowns…</p></div>');
  c.api('/collab/list', {}).then(function (d) {
    var list = (d.collabs || []).filter(function (x) { return isSdTitle(x.title); }), h = '';
    if (me.teacher) {
      h += '<h4>Host a new Showdown</h4><p class="zl-muted" style="margin-top:0;">Pick a class, up to four pupils and a contest. They each choose one of their saved Critters, then everyone watches the race.</p>';
      h += me.classes.length ? '<div class="zl-sd-classes">' + me.classes.map(function (cl) { return '<button type="button" class="zl-tool" data-class="' + esc(cl.code) + '" data-name="' + esc(cl.name) + '">' + esc(cl.name) + ' <span class="zl-muted">' + esc(cl.code) + '</span></button>'; }).join('') + '</div>'
        : '<p class="zl-muted">Make a class first: Cloud → Teacher.</p>';
    }
    h += '<h4 style="margin-top:14px;">' + (me.teacher ? 'Your open Showdowns' : 'Showdowns you’re in') + '</h4>';
    if (!list.length) h += '<p class="zl-muted">' + (me.teacher ? 'None open.' : 'None yet. When your teacher picks you for a Showdown, it shows up here.') + '</p>';
    h += list.map(function (x) {
      var mine = x.role === 'owner', name = x.title.slice(SD_TITLE.length).replace(/^\s*·\s*/, '') || SD_TITLE;
      return '<div class="zl-sd-item"><div class="who"><strong>' + esc(name) + '</strong><span>' + (mine ? 'You’re hosting' : 'Hosted by ' + esc(x.owner)) + '</span></div>' +
        '<button type="button" class="zl-go small" data-room="' + esc(x.roomId) + '">' + (mine ? 'Open' : 'Join') + '</button>' +
        (mine ? '<button type="button" class="zl-tool" data-end="' + esc(x.roomId) + '">End</button>' : '') + '</div>';
    }).join('');
    var box = $('sdMenu'); if (!box) return;
    box.innerHTML = h;
    box.querySelectorAll('[data-class]').forEach(function (b) { b.addEventListener('click', function () { sdSetup(b.dataset.class, b.dataset.name); }); });
    box.querySelectorAll('[data-room]').forEach(function (b) { b.addEventListener('click', function () { dialog.close(); sdOpen(b.dataset.room, null); }); });
    box.querySelectorAll('[data-end]').forEach(function (b) {
      b.addEventListener('click', function () { c.api('/collab/remove', { roomId: b.dataset.end }).then(function () { toast('Showdown ended'); showdownMenu(); }).catch(function (e) { toast(e.message); }); });
    });
  }).catch(function (e) { var box = $('sdMenu'); if (box) box.innerHTML = '<p>' + esc(e.message || 'Couldn’t reach CodeJump Cloud.') + '</p>'; });
}

// Teacher: choose who races and the contest, then open the room.
function sdSetup(code, className) {
  var c = cloud();
  openDialog('New Showdown · ' + className, '<p class="zl-muted" style="margin-top:0;">Loading the class…</p>');
  c.api('/class/roster', { code: code }).then(function (d) {
    var pupils = d.pupils || [], pick = [], contest = 'sprint', body = dialog.querySelector('.body');
    function draw() {
      body.innerHTML = '<h4>1. Who’s racing? <span class="zl-muted">Pick up to ' + Z.SHOWDOWN_MAX + '</span></h4>' +
        (pupils.length ? '<div class="zl-sd-pupils">' + pupils.map(function (p) {
          var onp = pick.indexOf(p.uid) >= 0;
          return '<button type="button" class="zl-sd-pupil' + (onp ? ' on' : '') + '" data-uid="' + esc(p.uid) + '"' + (!onp && pick.length >= Z.SHOWDOWN_MAX ? ' disabled' : '') + ' aria-pressed="' + onp + '"><strong>' + esc(p.realName || p.displayName) + '</strong><span>@' + esc(p.displayName) + '</span></button>';
        }).join('') + '</div>' : '<p class="zl-muted">No pupils in this class yet.</p>') +
        '<h4 style="margin-top:14px;">2. Which contest? <span class="zl-muted">You can change it later</span></h4><div class="zl-contests">' + Z.SHOWDOWN.map(function (k) { return contestChip(k, contest); }).join('') + '</div>' +
        '<div class="zl-sd-actions"><button type="button" class="zl-go" id="sdCreate"' + (pick.length ? '' : ' disabled') + '>' + ic('play') + ' Open the Showdown</button></div>';
      body.querySelectorAll('[data-uid]').forEach(function (b) {
        b.addEventListener('click', function () { var i = pick.indexOf(b.dataset.uid); if (i >= 0) pick.splice(i, 1); else if (pick.length < Z.SHOWDOWN_MAX) pick.push(b.dataset.uid); draw(); });
      });
      body.querySelectorAll('[data-c]').forEach(function (b) { b.addEventListener('click', function () { contest = b.dataset.c; draw(); }); });
      on('sdCreate', function () {
        this.disabled = true;
        var chosen = pick.map(function (uid) { return pupils.filter(function (p) { return p.uid === uid; })[0]; }).filter(Boolean);
        sdCreate(className, chosen, contest).catch(function (e) { toast(e.message || 'Couldn’t open the Showdown'); draw(); });
      });
    }
    draw();
  }).catch(function (e) { dialog.querySelector('.body').innerHTML = '<p>' + esc(e.message) + '</p>'; });
}

function sdCreate(className, pupils, contest) {
  var c = cloud(), me = c.me(), roomId;
  return c.api('/collab/start', { title: SD_TITLE + ' · ' + className }).then(function (r) {
    roomId = r.roomId;
    return c.api('/collab/invite', { roomId: roomId, uids: pupils.map(function (p) { return p.uid; }) });
  }).then(function () {
    dialog.close();
    sdOpen(roomId, { kind: 'critter-showdown', v: 1, host: me.uid, hostName: me.realName || me.name, title: className, contest: contest,
      slots: pupils.map(function (p) { return { uid: p.uid, name: p.realName || p.displayName }; }), entries: {}, bots: false, phase: 'lobby', round: 0, race: null, results: null });
  });
}

/* ---- the room connection */
function sdOpen(roomId, newDoc) {
  if (sd) sdClose(true);
  sd = { roomId: roomId, newDoc: newDoc, doc: null, me: null, isHost: !!newDoc, online: {}, ws: null, tries: 0, connected: false,
    pending: null, sentAt: 0, saves: null, choosing: false, sim: null, race: null, running: false, acc: 0, raceRound: 0, shown: null, thumbs: {} };
  sd.timer = setInterval(sdTick, 3000);
  $('zSdTab').hidden = false;
  setMode('showdown');
  sdConnect();
}

function sdConnect() {
  if (!sd) return;
  var me = sd, ws;
  try { ws = new WebSocket(cloud().wsUrl(sd.roomId)); } catch (e) { sdLost(); return; }
  sd.ws = ws;
  ws.onmessage = function (ev) { var m; try { m = JSON.parse(ev.data); } catch (e) { return; } if (sd === me && sd.ws === ws) sdMessage(m); };
  ws.onclose = function () { if (sd === me && sd.ws === ws) { sd.ws = null; sdLost(); } };
}

function sdLost() {
  if (!sd) return;
  sd.connected = false; renderSd();
  clearTimeout(sd.retry);
  if (sd.tries++ < 30) sd.retry = setTimeout(sdConnect, Math.min(10000, 1000 * sd.tries));
}

function sdSend(o) { if (sd && sd.ws && sd.ws.readyState === 1) { try { sd.ws.send(JSON.stringify(o)); return true; } catch (e) { /* closed */ } } return false; }
function sdPublish() { if (sd && sd.isHost && sd.doc) sdSend({ type: 'snapshot', doc: sd.doc }); }

function sdMessage(m) {
  if (m.type === 'init') {
    sd.connected = true; sd.tries = 0; sd.me = m.you && m.you.uid;
    sd.online = {}; (m.members || []).forEach(function (x) { sd.online[x.uid] = true; });
    if (sd.newDoc) { sd.doc = sd.newDoc; sd.newDoc = null; }
    else if (isSdDoc(m.doc) && (!sd.doc || m.doc.host !== sd.me)) sd.doc = m.doc; // the host keeps its own copy over a stale one
    sd.isHost = !!(sd.doc && sd.doc.host === sd.me);
    if (sd.isHost) sdPublish();
    sdAfterDoc();
    sdResend();
  } else if (m.type === 'join') {
    sd.online[m.member.uid] = true;
    if (sd.isHost) sdPublish(); // whatever the newcomer was handed, give them the real thing
    else if (sd.doc && m.member.uid === sd.doc.host) sdResend(true);
    renderSd();
  } else if (m.type === 'leave') {
    delete sd.online[m.uid]; renderSd();
  } else if (m.type === 'snapshot') {
    if (sd.isHost) { if (!isSdDoc(m.doc) || m.doc.host !== sd.me) sdPublish(); return; } // someone else overwrote the room: put it back
    if (isSdDoc(m.doc) && m.doc.host === m.from) { sd.doc = m.doc; sdAfterDoc(); }
  } else if (m.type === 'op') {
    if (sd.isHost) sdHostOp(m.op, m.from);
  } else if (m.type === 'full') {
    toast('That Showdown is full.');
  }
}

function sdHostOp(op, from) {
  var doc = sd.doc;
  if (!op || !doc || doc.phase === 'ended') return;
  var slot = doc.slots.filter(function (s) { return s.uid === from; })[0];
  if (!slot) return;
  if (op.k === 'sd_enter') {
    var z = sdCritter(op.critter);
    if (!z) return;
    var was = doc.entries[from];
    doc.entries[from] = { critter: z, cname: z.name || 'My Critter', n: String(op.n || '').slice(0, 40) };
    if (!was || was.n !== doc.entries[from].n) toast(slot.name + ' sent in ' + z.name + '!');
  } else if (op.k === 'sd_withdraw') {
    delete doc.entries[from];
  } else return;
  sdPublish(); sdAfterDoc();
}

// A pupil's entry goes again until the teacher's screen has it (it might have been away when it was sent).
function sdConfirmed() { var e = sd && sd.doc && sd.me && sd.doc.entries[sd.me]; return !!(e && sd.pending && e.n === sd.pending.n); }
function sdResend(now) {
  if (!sd || sd.isHost || !sd.pending || sdConfirmed() || !sd.doc) return;
  if (!now && Date.now() - sd.sentAt < 2500) return;
  if (sdSend({ type: 'op', op: { k: 'sd_enter', critter: sd.pending.critter, n: sd.pending.n } })) sd.sentAt = Date.now();
}
function sdTick() { if (!sd) return; sdResend(); if (!sd.connected && !sd.ws && !sd.retry) sdConnect(); }

function sdEnter(critter) {
  var z = sdCritter(critter);
  if (!z) { toast('That Critter can’t race. Does it have a body?'); return; }
  sd.pending = { critter: z, n: Z.uid('e') }; sd.choosing = false; sd.sentAt = 0;
  sdResend(true); renderSd();
}
function sdWithdraw() { sd.withdrawn = sd.pending && sd.pending.n; sd.pending = null; sd.choosing = false; sdSend({ type: 'op', op: { k: 'sd_withdraw' } }); renderSd(); }

/* ---- what happens when the document changes */
function sdLanes() {
  var doc = sd.doc, lanes = [];
  doc.slots.forEach(function (s) { var e = doc.entries[s.uid]; if (e) lanes.push({ uid: s.uid, name: s.name, cname: e.cname, critter: e.critter }); });
  if (doc.bots && lanes.length) {
    var keys = Object.keys(Z.STARTERS);
    for (var k = 0; lanes.length < Z.SHOWDOWN_MAX && k < keys.length; k++) lanes.push({ bot: keys[k], name: Z.STARTERS[keys[k]].label, cname: 'Starter Critter' });
  }
  return lanes;
}
function laneCritters(lanes) { return lanes.map(function (l) { return l.bot ? Z.STARTERS[l.bot].make() : l.critter; }); }

function sdAfterDoc() {
  var doc = sd.doc;
  if (!doc) { renderSd(); return; }
  if (doc.phase === 'ended') {
    var who = sd.isHost; sdClose(true);
    if (!who) toast('Your teacher has ended the Showdown.');
    return;
  }
  if (!sd.isHost) {
    var mine = doc.entries[sd.me];
    if (sd.pending) {
      if (mine && mine.n === sd.pending.n) sd.pending.seen = true;
      else if (!mine && sd.pending.seen) sd.pending = null; // the teacher took it out
    } else if (mine && mine.n !== sd.withdrawn) sd.pending = { critter: mine.critter, n: mine.n, seen: true }; // back after a reload
  }
  if (doc.phase === 'racing' && doc.race && doc.race.round !== sd.raceRound) { sd.raceRound = doc.race.round; sdRun(doc.race); }
  else if (doc.phase === 'done' && doc.race && doc.results && !sd.running) sdResults();
  else if (doc.phase === 'lobby' && !sd.running) sdPreview();
  renderSd();
}

/* ---- the race */
function sdShow() {
  state.running = false;
  if (!sdArena) sdArena = makeArena($('sdCanvas'));
  renderSd();
  if (sd && !sd.running && !sd.sim) sdPreview();
}

function sdTags(lanes) { return lanes.map(function (l, i) { return { text: l.name, colour: SD_COLOURS[i % 4] }; }); }

function sdPreview() {
  if (!sd || sd.running || !sd.doc || state.mode !== 'showdown') return;
  var lanes = sdLanes(), msg = $('sdMsg');
  $('sdResult').hidden = true; $('sdHud').hidden = true; $('sdBoard').hidden = true;
  if (!R) { msg.hidden = false; msg.textContent = 'Getting the physics ready…'; loadPhysics().then(function () { sdPreview(); }); return; }
  var key = sd.doc.contest + '|' + lanes.map(function (l) { return (l.uid || l.bot) + ':' + (l.uid && sd.doc.entries[l.uid].n); }).join(',');
  if (sd.sim && sd.previewKey === key) return;
  if (sd.sim) { sd.sim.free(); sd.sim = null; }
  sd.previewKey = key; sd.race = null;
  if (!lanes.length) { msg.hidden = false; msg.textContent = sd.isHost ? 'Waiting for Critters… They appear here as pupils send them in.' : 'Waiting for Critters…'; return; }
  msg.hidden = true;
  sd.sim = Z.createSim(R, sd.doc.contest, laneCritters(lanes), { showdown: true });
  sdArena.load(sd.sim, { tags: sdTags(lanes) });
}

function sdRun(race) {
  if (!R) { loadPhysics().then(function () { if (sd && sd.raceRound === race.round) sdRun(race); }); return; }
  if (sd.sim) sd.sim.free();
  sd.previewKey = null;
  sd.race = race; sd.shown = null;
  sd.sim = Z.createSim(R, race.contest, laneCritters(race.lanes), { showdown: true });
  sd.running = true; sd.acc = 0;
  $('sdResult').hidden = true; $('sdMsg').hidden = true; $('sdHud').hidden = false; $('sdBoard').hidden = false;
  if (state.mode === 'showdown') sdArena.load(sd.sim, { tags: sdTags(race.lanes) });
  else sd.needLoad = true;
  sdBoard(true);
}

function sdStart() {
  var doc = sd.doc, lanes = sdLanes();
  if (!lanes.length || sd.running) return;
  doc.round = (doc.round || 0) + 1; doc.phase = 'racing'; doc.results = null;
  doc.race = { round: doc.round, contest: doc.contest, lanes: lanes.map(function (l) { return l.bot ? { bot: l.bot, name: l.name, cname: l.cname } : l; }) };
  sdPublish();
  sd.raceRound = doc.round; sdRun(doc.race); renderSd();
}

function sdFrame(dt) {
  if (!sdArena) return;
  if (sd && sd.sim) {
    if (sd.needLoad) { sd.needLoad = false; sdArena.load(sd.sim, { tags: sdTags(sd.race ? sd.race.lanes : sdLanes()) }); }
    if (sd.running) {
      sd.acc += dt * ($('sdTurbo') && $('sdTurbo').checked ? 3 : 1);
      var n = 0;
      while (sd.acc >= Z.STEP && n < 12 && !sd.sim.done()) { sd.sim.step(); sd.acc -= Z.STEP; n++; }
      if (sd.acc > Z.STEP * 12) sd.acc = 0;
      sdBoard();
      if (sd.sim.done()) sdFinish();
    }
    sdArena.draw(sd.sim);
  }
  sdArena.render();
}

function sdBoard(force) {
  var sim = sd.sim, race = sd.race;
  if (!sim || !race) return;
  var now = performance.now();
  if (!force && now - (sd.boardAt || 0) < 250) return;
  sd.boardAt = now;
  var C = Z.CONTESTS[race.contest];
  $('sdHudLabel').textContent = (race.contest === 'sumo' ? 'Super Sumo' : C.label) + ' · Showdown';
  $('sdHudTime').textContent = Math.max(0, sim.seconds - sim.t).toFixed(1) + ' s left';
  $('sdHudBar').style.width = Math.min(100, sim.t / sim.seconds * 100) + '%';
  var rows = sim.standings().slice().sort(function (a, b) { return a.place - b.place; });
  $('sdBoard').innerHTML = rows.map(function (r) {
    var l = race.lanes[r.i];
    return '<li><b>' + r.place + '</b><i style="background:' + SD_COLOURS[r.i % 4] + '"></i><span>' + esc(l.name) + (l.uid === sd.me ? ' (you)' : '') + '</span><em>' + esc(r.text) + '</em></li>';
  }).join('');
}

function sdFinish() {
  sd.running = false;
  sdBoard(true);
  if (sd.isHost && sd.doc && sd.doc.race && sd.doc.race.round === sd.raceRound) {
    sd.doc.phase = 'done';
    sd.doc.results = sd.sim.standings().map(function (r) { return { lane: r.i, place: r.place, text: r.text }; });
    sdPublish();
  }
  sdResults();
  renderSd();
}

// The podium. Everyone's screen ran the same race, but the teacher's results are the official ones.
function sdResults() {
  var doc = sd.doc, race = (doc && doc.race && doc.race.round === sd.raceRound && sd.race) ? sd.race : doc && doc.race;
  if (!race) return;
  var rows = doc.results && doc.race && doc.race.round === race.round ? doc.results
    : sd.sim && sd.race === race ? sd.sim.standings().map(function (r) { return { lane: r.i, place: r.place, text: r.text }; }) : null;
  if (!rows) return;
  var key = race.round + ':' + (doc.results ? 'final' : 'local');
  if (sd.shown === key && !$('sdResult').hidden) return;
  sd.shown = key;
  $('sdMsg').hidden = true; $('sdHud').hidden = true;
  var sorted = rows.slice().sort(function (a, b) { return a.place - b.place; }), mine = rows.filter(function (r) { var l = race.lanes[r.lane]; return l && l.uid && l.uid === sd.me; })[0];
  var C = Z.CONTESTS[race.contest], winners = sorted.filter(function (r) { return r.place === 1; }).map(function (r) { return race.lanes[r.lane].name; });
  var big = mine ? (mine.place === 1 ? 'You won!' : 'You came ' + placeWord(mine.place)) : winners.length > 1 ? 'A draw!' : esc(winners[0] || '') + ' wins!';
  var box = $('sdResult');
  box.innerHTML = '<div class="zl-card zl-sd-card"><div class="zl-badge win">' + esc((race.contest === 'sumo' ? 'Super Sumo' : C.label) + ' · Showdown') + '</div>' +
    '<div class="big">' + (mine ? esc(big) : big) + '</div><ol class="zl-podium">' + sorted.map(function (r) {
      var l = race.lanes[r.lane];
      return '<li class="p' + Math.min(r.place, 4) + (l.uid && l.uid === sd.me ? ' me' : '') + '"><b>' + placeWord(r.place) + '</b><i style="background:' + SD_COLOURS[r.lane % 4] + '"></i><span><strong>' + esc(l.name) + '</strong><small>' + esc(l.cname) + '</small></span><em>' + esc(r.text) + '</em></li>';
    }).join('') + '</ol><div class="actions">' +
    (sd.isHost ? '<button type="button" class="zl-go" id="sdAgain">' + ic('rotate-ccw') + ' Race again</button><button type="button" class="zl-tool" id="sdLobby">' + ic('users') + ' Back to the line-up</button>'
      : '<button type="button" class="zl-tool" id="sdLobby">' + ic('x') + ' Close</button>') + '</div></div>';
  box.hidden = false;
  on('sdAgain', function () { sdStart(); });
  on('sdLobby', function () {
    box.hidden = true;
    if (sd.isHost) { sd.doc.phase = 'lobby'; sdPublish(); }
    if (sd.sim) { sd.sim.free(); sd.sim = null; } sd.previewKey = null;
    sdPreview(); renderSd();
  });
}

/* ---- the side panel */
function slotStatus(s, i) {
  var doc = sd.doc, e = doc.entries[s.uid], here = sd.online[s.uid];
  var dot = '<i class="dot" style="background:' + SD_COLOURS[i % 4] + '"></i>';
  var thumb = '';
  if (e) { var tk = s.uid + ':' + e.n; if (!(tk in sd.thumbs)) sd.thumbs[tk] = thumbs(Z.normalise(e.critter)); thumb = sd.thumbs[tk] ? '<img alt="" src="' + sd.thumbs[tk] + '">' : ''; }
  var words = e ? 'Ready with <b>' + esc(e.cname) + '</b>' : here ? 'Choosing a Critter…' : 'Not here yet';
  return '<li class="zl-sd-slot' + (e ? ' ready' : '') + (s.uid === sd.me ? ' me' : '') + '">' + dot + '<div class="who"><strong>' + esc(s.name) + (s.uid === sd.me ? ' (you)' : '') + '</strong><span>' + words + '</span></div>' + thumb +
    (sd.isHost && e && !sd.running ? '<button type="button" class="zl-icon" data-out="' + esc(s.uid) + '" title="Take this Critter out" aria-label="Take ' + esc(s.name) + '’s Critter out">' + ic('x') + '</button>' : '') + '</li>';
}

function renderSd() {
  var side = $('sdSide');
  if (!side || !sd) return;
  var doc = sd.doc, h = '<h2>' + ic('users') + ' ' + SD_TITLE + '</h2>';
  if (!doc) {
    side.innerHTML = h + '<p class="zl-muted">' + (sd.connected ? 'Waiting for your teacher to open this Showdown…' : sd.tries > 1 ? 'Can’t reach the Showdown. Trying again…' : 'Joining…') + '</p>' +
      '<div class="zl-sd-actions"><button type="button" class="zl-tool" id="sdLeave">Leave</button></div>';
    on('sdLeave', function () { sdClose(); });
    return;
  }
  var C = Z.CONTESTS[doc.contest], racing = sd.running || doc.phase === 'racing';
  h += '<p class="zl-muted">' + esc(doc.title) + (sd.isHost ? '' : ' · hosted by ' + esc(doc.hostName || 'your teacher')) +
    ' · <span class="zl-sd-live' + (sd.connected ? '' : ' off') + '">' + (sd.connected ? 'Live' : 'Reconnecting…') + '</span></p>';
  if (sd.isHost) {
    h += '<h4>Contest</h4><div class="zl-contests sd">' + Z.SHOWDOWN.map(function (k) { return contestChip(k, doc.contest, racing); }).join('') + '</div>';
  } else {
    h += '<p class="zl-sd-contest">' + ic(C.icon) + ' <b>' + (doc.contest === 'sumo' ? 'Super Sumo' : C.label) + '</b> <span class="zl-muted">' + esc(C.about) + '</span></p>';
  }
  h += '<h4>Racers</h4><ul class="zl-sd-slots">' + doc.slots.map(slotStatus).join('') + '</ul>';
  if (sd.isHost) {
    var lanes = sdLanes(), entered = Object.keys(doc.entries).length;
    h += '<label class="zl-check"><input type="checkbox" id="sdBots"' + (doc.bots ? ' checked' : '') + (racing ? ' disabled' : '') + '> Fill empty lanes with Starter Critters</label>' +
      '<div class="zl-sd-actions"><button type="button" class="zl-go" id="sdGo"' + (lanes.length && !racing ? '' : ' disabled') + '>' + ic('play') + ' ' +
      (racing ? 'Racing…' : !entered ? 'Waiting for Critters' : doc.round ? 'Race again' : 'Start the race!') + '</button>' +
      '<label class="zl-check"><input type="checkbox" id="sdTurbo"> Turbo</label></div>' +
      '<p class="zl-hint">Pupils open Critter Lab and press <b>Showdown</b> to join and pick one of their saved Critters.</p>' +
      '<div class="zl-sd-actions"><button type="button" class="zl-tool" id="sdEnd">' + ic('x') + ' End Showdown</button><button type="button" class="zl-tool" id="sdBack">' + ic('wrench') + ' Back to building</button></div>';
  } else {
    h += '<h4>Your Critter</h4>' + pupilPick() +
      '<div class="zl-sd-actions"><label class="zl-check"><input type="checkbox" id="sdTurbo"> Turbo</label><button type="button" class="zl-tool" id="sdLeave">Leave</button><button type="button" class="zl-tool" id="sdBack">' + ic('wrench') + ' Back to building</button></div>';
  }
  var turbo = $('sdTurbo') && $('sdTurbo').checked;
  side.innerHTML = h;
  if (turbo && $('sdTurbo')) $('sdTurbo').checked = true;
  side.querySelectorAll('[data-c]').forEach(function (b) { b.addEventListener('click', function () { if (sd.running) return; doc.contest = b.dataset.c; if (doc.phase === 'done') doc.phase = 'lobby'; sdPublish(); sdPreview(); renderSd(); }); });
  side.querySelectorAll('[data-out]').forEach(function (b) { b.addEventListener('click', function () { delete doc.entries[b.dataset.out]; sdPublish(); sdPreview(); renderSd(); }); });
  side.querySelectorAll('[data-save]').forEach(function (b) { b.addEventListener('click', function () { var sv = sd.saves.list[+b.dataset.save]; if (sv) sdEnter(sv.critter); }); });
  var bots = $('sdBots'); if (bots) bots.addEventListener('change', function () { doc.bots = this.checked; sdPublish(); sdPreview(); renderSd(); });
  on('sdGo', sdStart);
  on('sdEnd', sdEnd);
  on('sdLeave', function () { sdClose(); });
  on('sdBack', function () { setMode('build'); });
  on('sdCurrent', function () { sdEnter(state.critter); });
  on('sdChange', function () { sd.choosing = true; renderSd(); });
  on('sdOut', sdWithdraw);
  on('sdKeep', function () { sd.choosing = false; renderSd(); });
}

// A pupil chooses which saved Critter to send in.
function pupilPick() {
  if (sd.pending && !sd.choosing) {
    var ok = sdConfirmed(), z = sd.pending.critter, tk = 'me:' + sd.pending.n;
    if (!(tk in sd.thumbs)) sd.thumbs[tk] = thumbs(Z.normalise(z));
    return '<div class="zl-sd-mine' + (ok ? ' ok' : '') + '">' + (sd.thumbs[tk] ? '<img alt="" src="' + sd.thumbs[tk] + '">' : '') +
      '<div><strong>' + esc(z.name) + '</strong><span>' + (ok ? 'You’re in! Watch the big screen.' : 'Sending it to your teacher’s screen…') + '</span></div></div>' +
      (sd.running || (sd.doc && sd.doc.phase === 'racing') ? '' : '<div class="zl-btnrow"><button type="button" id="sdChange">Pick a different one</button><button type="button" id="sdOut">Take it out</button></div>');
  }
  if (!sd.saves) sdLoadSaves();
  var list = sd.saves.list, h = '<p class="zl-hint">Send in one of your saved Critters. You can change your mind until the race starts.</p><div class="zl-sd-saves">';
  h += '<button type="button" class="zl-sd-save" id="sdCurrent">' + (function () { var t = thumbs(state.critter); return t ? '<img alt="" src="' + t + '">' : ''; })() + '<span><strong>' + esc(state.critter.name) + '</strong><small>The one on my screen now</small></span></button>';
  h += list.map(function (sv, i) { return '<button type="button" class="zl-sd-save" data-save="' + i + '">' + (sv.thumb ? '<img alt="" src="' + sv.thumb + '">' : '') + '<span><strong>' + esc(sv.title) + '</strong><small>' + esc(sv.where) + ' · ' + esc(sv.critter.name) + '</small></span></button>'; }).join('');
  h += '</div>';
  if (sd.saves.loading) h += '<p class="zl-hint">Looking through your saves… (' + sd.saves.checked + ' of ' + sd.saves.total + ')</p>';
  else if (!list.length) h += '<p class="zl-hint">No saved Critters found. Save one first (Save, or Cloud), or send the one on your screen.</p>';
  if (sd.choosing) h += '<div class="zl-btnrow"><button type="button" id="sdKeep">Keep ' + esc(sd.pending ? sd.pending.critter.name : 'it') + '</button></div>';
  return h;
}

function sdLoadSaves() {
  var c = cloud(), box = { list: [], loading: true, checked: 0, total: 0 }, me = sd;
  sd.saves = box;
  Promise.resolve(c.saves()).then(function (items) {
    box.total = items.length;
    var i = 0;
    function next() {
      if (sd !== me) return;
      if (i >= items.length) { box.loading = false; renderSd(); return; }
      var it = items[i++];
      Promise.resolve(c.loadSave(it.key)).then(function (pl) {
        var z = pl && pl.projectType === 'critter' && pl.critter ? sdCritter(pl.critter) : null;
        if (z) box.list.push({ title: it.title || z.name, where: it.where, critter: z, thumb: thumbs(z) });
      }).catch(function () { /* skip it */ }).then(function () { box.checked++; if (sd === me && state.mode === 'showdown') renderSd(); next(); });
    }
    next();
  }).catch(function () { box.loading = false; renderSd(); });
}

function sdEnd() {
  var c = cloud(), roomId = sd.roomId, ask = host.confirm || function (q) { return Promise.resolve(window.confirm(q)); };
  ask('End this Showdown for everyone? Pupils’ Critters stay safe in their own saves.').then(function (yes) { if (yes && sd && sd.roomId === roomId) endIt(); });
  function endIt() {
  if (sd.doc) { sd.doc.phase = 'ended'; sdPublish(); }
  c.api('/collab/remove', { roomId: roomId }).catch(function () { /* already gone */ });
  setTimeout(function () { sdClose(); toast('Showdown ended'); }, 150);
  }
}

function sdClose(keepMode) {
  if (!sd) return;
  var old = sd; sd = null;
  clearInterval(old.timer); clearTimeout(old.retry);
  if (old.ws) { try { old.ws.close(); } catch (e) { /* closed */ } }
  if (old.sim) old.sim.free();
  $('zSdTab').hidden = true;
  $('sdResult').hidden = true;
  if (!keepMode || state.mode === 'showdown') setMode('build');
}

/* ------------------------------------------------------------------ start up */

function boot() {
  eyeMats = [keepMat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 })), keepMat(new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.2 }))];
  renderPalette();
  state.critter = Z.normalise(host.critter || Z.newCritter('My Critter'));
  changed({ inspector: true, fit: true });
  state.history = []; updateUndo();
  loadPhysics().catch(function () { /* reported when the arena opens */ });

  $('zName').addEventListener('input', function () {
    if (!state.sliding) { remember(); state.sliding = true; }
    state.critter.name = this.value.slice(0, 40) || 'My Critter'; saveCurrent();
  });
  $('zName').addEventListener('change', function () { state.sliding = false; changed({ inspector: !state.selected }); });
  root.querySelectorAll('.zl-mode').forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.mode); }); });
  $('zUndo').addEventListener('click', undo);
  $('zRedo').addEventListener('click', redo);
  $('zStarters').addEventListener('click', showStarters);
  $('zKeys').addEventListener('click', showKeys);
  $('zShowdown').addEventListener('click', showdownMenu);
  $('zGuides').addEventListener('click', showGuides);
  $('zGo').addEventListener('click', go);
  $('zOpp').addEventListener('change', function () { state.opponent = this.value; resetRun(); });
  $('zPreview').addEventListener('change', drawBeats);
  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', drawBeats);
  requestAnimationFrame(frame);
}

// Keyboard shortcuts (also listed in the Keys dialog and CodeJump's Help → Keys tab).
var SHORTCUTS = {
  build: [['Ctrl + Z / Ctrl + Y', 'Undo / redo'], ['Ctrl + C / Ctrl + X', 'Copy / cut the chosen part (and everything on it)'],
    ['Ctrl + V', 'Paste onto the chosen part (or the body)'], ['Ctrl + D', 'Duplicate the chosen part next to itself'], ['Delete', 'Remove the chosen part (and its twin)'], ['Esc', 'Stop choosing a part'],
    ['N / Shift + N', 'Choose the next / previous part'], ['P', 'Choose the part it hangs from'],
    ['Arrow keys', 'Slide the chosen part around the side it’s on (hold Shift for big steps)'],
    ['[ and ]', 'Lean the chosen part'], [', and .', 'Splay the chosen part'], ['+ and −', 'Make the chosen part bigger / smaller'],
    ['W', 'Wiggle preview on / off'], ['M', 'Add in pairs (mirror) on / off'], ['F', 'Fit the Critter in the view'],
    ['Enter or T', 'Test it!'], ['?', 'Show these keys']],
  test: [['Space', 'Go / Stop'], ['1 – 8', 'Pick a contest'], ['T', 'Turbo on / off'], ['B or Esc', 'Back to Build'], ['?', 'Show these keys']]
};

function showKeys() {
  var table = function (rows) { return '<table class="zl-keys">' + rows.map(function (r) { return '<tr><th><kbd>' + esc(r[0]) + '</kbd></th><td>' + esc(r[1]) + '</td></tr>'; }).join('') + '</table>'; };
  openDialog('Keyboard shortcuts', '<h4>Building</h4>' + table(SHORTCUTS.build) + '<h4>Testing</h4>' + table(SHORTCUTS.test) +
    '<p class="zl-muted">On a Mac, use ⌘ instead of Ctrl.</p>');
}

// Change the chosen part from the keyboard: one undo step per key press (held keys add to it).
function tweak(e, fn) {
  var b = Z.block(state.critter, state.selected);
  if (!b) { toast('Choose a part first: tap it, or press N.'); return; }
  if (!e.repeat) remember();
  if (fn(b) !== false) { Z.syncTwin(state.critter, b); changed({ inspector: true }); }
}
function clampSize(v, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(v))); }

function onKey(e) {
  if (destroyed || !visible() || dialog.open) return;
  if (document.querySelector('#cj-dialog:not(.hide), [id$="-modal"]:not(.hide)')) return; // a CodeJump popup is open
  var t = e.target, tag = (t.tagName || '').toLowerCase();
  if (tag === 'textarea' || tag === 'select' || t.isContentEditable || (tag === 'input' && t.type !== 'range' && t.type !== 'checkbox')) return; // typing
  var slider = tag === 'input' && t.type === 'range', k = e.key, lk = k.length === 1 ? k.toLowerCase() : k, z = state.critter;
  var cmd = e.ctrlKey || e.metaKey;
  function done() { e.preventDefault(); e.stopPropagation(); }
  if (state.mode === 'showdown') return; // the Showdown screen has no shortcuts

  if (cmd && lk === 'z') { done(); if (e.shiftKey) redo(); else undo(); return; }
  if (cmd && lk === 'y') { done(); redo(); return; }
  if (cmd && state.mode === 'build' && (lk === 'c' || lk === 'x' || lk === 'v' || lk === 'd')) {
    if (lk === 'c' && !state.selected) return; // nothing chosen: let the browser copy any selected text
    done();
    if (lk === 'c') copySelected(); else if (lk === 'x') cutSelected(); else if (lk === 'v') pasteClip(); else duplicateSelected();
    return;
  }
  if (cmd || e.altKey) return; // leave browser shortcuts alone
  if (k === '?') { done(); showKeys(); return; }

  if (state.mode === 'test') {
    if (k === ' ') { done(); go(); }
    else if (lk === 't') { done(); $('zTurbo').checked = !$('zTurbo').checked; }
    else if (lk === 'b' || k === 'Escape') { done(); setMode('build'); }
    else if (/^[1-8]$/.test(k)) { var c = Object.keys(Z.CONTESTS)[Number(k) - 1]; if (c) { done(); state.contest = c; renderContests(); resetRun(); } }
    return;
  }

  if (k === 'Delete' || (k === 'Backspace' && !slider)) { if (state.selected) { done(); deleteSelected(); } return; }
  if (k === 'Escape') { if (state.selected) { done(); state.selected = null; state.pathPoint = null; builder.sync(); renderInspector(); drawBeats(); } return; }
  if (k === 'Enter' || lk === 't') { done(); setMode('test'); return; }
  if (lk === 'n') {
    done();
    var ids = z.blocks.map(function (b) { return b.id; }), i = ids.indexOf(state.selected);
    state.selected = ids[((i < 0 ? (e.shiftKey ? 0 : -1) : i) + (e.shiftKey ? -1 : 1) + ids.length) % ids.length];
    state.pathPoint = null; builder.sync(); renderInspector(); drawBeats(); return;
  }
  if (lk === 'p') { var sb = Z.block(z, state.selected); if (sb && sb.mount) { done(); state.selected = sb.mount.parent; state.pathPoint = null; builder.sync(); renderInspector(); drawBeats(); } return; }
  if (lk === 'w') { done(); $('zPreview').checked = !$('zPreview').checked; drawBeats(); toast('Wiggle preview ' + ($('zPreview').checked ? 'on' : 'off')); return; }
  if (lk === 'm') { done(); $('zMirror').checked = !$('zMirror').checked; toast('Add in pairs ' + ($('zMirror').checked ? 'on' : 'off')); return; }
  if (lk === 'f') { done(); builder.fit(); return; }
  if (slider) return; // arrows and +/- move a focused slider as normal

  var arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
  if (arrows[k]) {
    done();
    var st = e.shiftKey ? 0.15 : 0.05, d = arrows[k];
    tweak(e, function (b) {
      if (!b.mount) { toast('The body is where everything hangs from, so it stays put.'); return false; }
      return Z.move(z, b.id, b.mount.parent, b.mount.face, [b.mount.at[0] + d[0] * st, b.mount.at[1] + d[1] * st]);
    });
    return;
  }
  if (k === '[' || k === ']') { done(); tweak(e, function (b) { if (!b.mount) return false; b.mount.lean = Math.max(-90, Math.min(90, b.mount.lean + (k === ']' ? 5 : -5))); }); return; }
  if (k === ',' || k === '.') { done(); tweak(e, function (b) { if (!b.mount) return false; b.mount.splay = Math.max(-60, Math.min(60, b.mount.splay + (k === '.' ? 5 : -5))); }); return; }
  if (k === '+' || k === '=' || k === '-' || k === '_') {
    done();
    var f = k === '+' || k === '=' ? 1.1 : 1 / 1.1;
    tweak(e, function (b) { b.size = [clampSize(b.size[0] * f, 6, 180), clampSize(b.size[1] * f, 4, 80), clampSize(b.size[2] * f, 4, 120)]; });
  }
}

var destroyed = false;
boot();

// What CodeJump talks to.
return {
  // the Critter as JSON (for buildPayload)
  getCritter: function () { return JSON.parse(JSON.stringify(state.critter)); },
  // load a Critter (from applyPayload / a new project); clears undo history
  setCritter: function (z) { state.running = false; setCritter(z || Z.newCritter('My Critter')); state.history = []; state.future = []; updateUndo(); setMode('build'); },
  // CodeJump is leaving Critter mode
  pause: function () { state.running = false; if (state.mode === 'test') setMode('build'); },
  newCritter: function () { return Z.newCritter('My Critter'); },
  // Showdown: open the menu, open a room by id (from CodeJump's Collaborations list), or start hosting for a class
  showdownMenu: function () { showdownMenu(); },
  openShowdown: function (roomId) { sdOpen(roomId, null); },
  hostShowdown: function (code, name) { sdSetup(code, name); },
  // the video guides dialog
  showGuides: function () { showGuides(); },
  destroy: function () { destroyed = true; if (sd) sdClose(true); document.removeEventListener('keydown', onKey); if (state.sim) state.sim.free(); root.innerHTML = ''; }
};
}
