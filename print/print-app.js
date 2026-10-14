/* CodeJump · Print Lab — the app: design something to 3D print from ready-made shapes on a build plate.
 * Lazy-loaded by CodeJump (build-and-play.html: loadPrintLab) only when a Print Lab project opens, and mounted into
 * #print3d-ui. CodeJump owns saving and sharing: getProject() goes into the payload (payload.print3d) and onChange()
 * marks the project dirty.
 *
 *   const app = (await import('./print/print-app.js')).mount(rootEl, { project, onChange, toast, confirm });
 *   app.getProject() · app.setProject(p) · app.resume() · app.pause() · app.destroy()
 *
 * The shape maths is print-model.js (Manifold, WebAssembly); the view is the Three.js bundle the Critter Lab ships.
 * Coordinates: millimetres, Z up (print-model.js). The Three.js scene is Y up, so every design object sits under
 * `world`, which is turned −90° about X: print (x, y, z) shows at Three (x, z, −y).
 */
import * as THREE from '../critter/vendor/three-0.186.1-critter.min.js';
import * as PM from './print-model.js';

const CSS_URL = new URL('./print-app.css', import.meta.url).href;
const VENDOR = new URL('./vendor/', import.meta.url).href;
const ic = id => '<svg class="ic"><use href="#' + id + '"></use></svg>';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const r1 = v => Math.round(v * 10) / 10;
const SNAPS = [['0.1', 0.1], ['0.5', 0.5], ['1', 1], ['2', 2], ['5', 5], ['10', 10]];
const KEYS = [
  ['Delete', 'Delete the selected shapes'], ['Ctrl + D', 'Duplicate'], ['Ctrl + C / V', 'Copy and paste'], ['Ctrl + G', 'Group'],
  ['Ctrl + Shift + G', 'Ungroup'], ['Ctrl + Z / Y', 'Undo / redo'], ['Arrow keys', 'Move (Shift = 10 times as far)'],
  ['Page Up / Down', 'Lift up / down'], ['H', 'Make it a hole'], ['S', 'Make it solid'], ['D', 'Drop it onto the plate'],
  ['Ctrl + A', 'Select everything'], ['M', 'Measure between two points'], ['Esc', 'Select nothing'], ['F', 'Look at the selection (or everything)']
];

const TEMPLATE = `
<div class="pl">
  <aside class="pl-shapes" aria-label="Shapes">
    <h3>Shapes</h3>
    <p class="pl-hint">Drag one onto the plate, or tap it.</p>
    <div class="pl-grid" id="plGrid"></div>
    <button type="button" class="pl-drawbtn" id="plDraw" title="Draw an outline and turn it into a 3D shape">${ic('i-pen')} Draw a shape</button>
    <h3>Holes</h3>
    <div class="pl-grid" id="plHoles"></div>
    <h3>Parts</h3>
    <div class="pl-grid" id="plParts"></div>
    <h3>Challenges</h3>
    <div class="pl-ex" id="plBriefs"></div>
    <h3>Examples</h3>
    <div class="pl-ex" id="plEx"></div>
  </aside>
  <section class="pl-main">
    <div class="pl-bar">
      <input id="plTitle" class="pl-title" maxlength="60" placeholder="Name your design" aria-label="Design name" autocomplete="off">
      <span class="pl-sep"></span>
      <button type="button" id="plUndo" title="Undo (Ctrl+Z)">${ic('i-undo')}<span>Undo</span></button>
      <button type="button" id="plRedo" title="Redo (Ctrl+Y)">${ic('i-redo')}<span>Redo</span></button>
      <span class="pl-sep"></span>
      <button type="button" id="plDup" title="Duplicate (Ctrl+D)">Duplicate</button>
      <button type="button" id="plDel" title="Delete (Delete key)">${ic('i-trash')}<span>Delete</span></button>
      <button type="button" id="plGroup" title="Group: holes cut the shapes they're grouped with (Ctrl+G)">Group</button>
      <button type="button" id="plUngroup" title="Take a group apart again (Ctrl+Shift+G)">Ungroup</button>
      <button type="button" id="plDrop" title="Drop onto the plate (D)">Drop to plate</button>
      <span class="pl-sep"></span>
      <label class="pl-snap" title="Shapes move and size in steps of this many millimetres">Snap <select id="plSnap"></select> mm</label>
      <button type="button" id="plMeasure" title="Measure: click two points to see how far apart they are (M)">${ic('i-ruler')}<span>Measure</span></button>
      <button type="button" id="plKeys" title="Keyboard shortcuts">Keys</button>
      <button type="button" class="pl-go" id="plPrintBtn" title="Check your design and download it for the 3D printer">${ic('i-save')}<span>Check &amp; print</span></button>
    </div>
    <div class="pl-stage" id="plStage">
      <canvas id="plCanvas" tabindex="0" aria-label="The build plate. Drag a shape to move it; drag the white handles to size it, the arrow to lift it and the curved arrows to turn it. Drag empty space to look around, scroll or pinch to zoom."></canvas>
      <div class="pl-loading" id="plLoading">Getting the Print Lab ready…</div>
      <div class="pl-empty" id="plEmpty" hidden>Drag a shape onto the build plate to start.</div>
      <div class="pl-tip" id="plTip" hidden></div>
      <div class="pl-mlabel" id="plMLabel" hidden></div>
      <div class="pl-brief" id="plBrief" hidden></div>
      <div class="pl-views" role="group" aria-label="Camera">
        <button type="button" data-view="home" title="Look from the front corner">Home</button>
        <button type="button" data-view="top" title="Look from above">Top</button>
        <button type="button" data-view="front" title="Look from the front">Front</button>
        <button type="button" data-view="side" title="Look from the side">Side</button>
        <button type="button" data-view="fit" title="Fit the selection (or everything) in view (F)">Fit</button>
      </div>
      <div class="pl-size" id="plSize"></div>
    </div>
  </section>
  <aside class="pl-insp" id="plInsp" aria-label="The selected shape"></aside>
  <div class="pl-modal" id="plModal" hidden><div class="pl-card" role="dialog" aria-modal="true" aria-labelledby="plMTitle"><button type="button" class="pl-x" id="plMClose" aria-label="Close">${ic('i-x')}</button><div id="plMBody"></div></div></div>
</div>`;

export function mount(root, host) {
  host = host || {};
  if (!document.querySelector('link[data-print-css]')) {
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = CSS_URL; link.setAttribute('data-print-css', '');
    document.head.appendChild(link);
  }
  root.innerHTML = TEMPLATE;
  const $ = id => root.querySelector('#' + id);
  const ask = async msg => (host.confirm ? !!(await host.confirm(msg)) : window.confirm(msg));
  const toast = (m, c) => { if (host.toast) host.toast(m, c); };

  let proj = PM.cleanProject(host.project || null);
  let model = null, alive = true, raf = 0, needs = true, changeTimer = 0;
  let sel = [];                      // selected top-level ids
  let snap = 1, undo = [], redo = [], clip = null;
  const views = new Map();           // id → {key, grp}
  const changed = () => { clearTimeout(changeTimer); changeTimer = setTimeout(() => { if (alive && host.onChange) host.onChange(); }, 250); };

  /* ------------------------------------------------------------ three.js */
  const canvas = $('plCanvas'), stage = $('plStage');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1b2230');
  const camera = new THREE.PerspectiveCamera(38, 1, 1, 5000);
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  controls.maxPolarAngle = Math.PI * 0.495; controls.minDistance = 20; controls.maxDistance = 1500;
  controls.addEventListener('change', () => { needs = true; });
  scene.add(new THREE.HemisphereLight('#ffffff', '#8090a8', 1.6));
  const sun = new THREE.DirectionalLight('#ffffff', 1.9); sun.position.set(-120, 300, 180); scene.add(sun);
  const sun2 = new THREE.DirectionalLight('#cfe0ff', 0.6); sun2.position.set(200, 120, -200); scene.add(sun2);
  const world = new THREE.Group(); world.rotation.x = -Math.PI / 2; scene.add(world);
  const plateGrp = new THREE.Group(); world.add(plateGrp);
  const objGrp = new THREE.Group(); world.add(objGrp);
  const selGrp = new THREE.Group(); world.add(selGrp);
  const hGrp = new THREE.Group(); world.add(hGrp);
  // print (x, y, z) ↔ three (x, z, −y)
  const toT = v => new THREE.Vector3(v[0], v[2], -v[1]);
  const fromT = V => [V.x, -V.z, V.y];

  const holeMat = new THREE.MeshStandardMaterial({ color: '#9fb0c4', transparent: true, opacity: 0.38, depthWrite: false, roughness: 0.6, flatShading: true, side: THREE.DoubleSide });
  const mats = new Map();
  const matOf = col => { if (!mats.has(col)) mats.set(col, new THREE.MeshStandardMaterial({ color: col, roughness: 0.55, metalness: 0.02, flatShading: true })); return mats.get(col); };
  const edgeMat = new THREE.LineBasicMaterial({ color: '#0b1220', transparent: true, opacity: 0.35 });
  const selMat = new THREE.LineBasicMaterial({ color: '#4fb3ff' });
  const holeEdgeMat = new THREE.LineBasicMaterial({ color: '#e8eef6', transparent: true, opacity: 0.7 });

  function buildPlate() {
    plateGrp.clear();
    const W = proj.plate.w, D = proj.plate.d;
    const base = new THREE.Mesh(new THREE.BoxGeometry(W + 6, D + 6, 2), new THREE.MeshStandardMaterial({ color: '#2d6fb8', roughness: 0.8 }));
    base.position.set(0, 0, -2.2); plateGrp.add(base);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: '#e9eff7', roughness: 0.9 }));
    top.position.z = -0.05; top.userData.plate = true; plateGrp.add(top);
    const minor = [], major = [];
    for (let x = -Math.floor(W / 2 / 10) * 10; x <= W / 2; x += 10) (x % 50 ? minor : major).push(x, -D / 2, 0, x, D / 2, 0);
    for (let y = -Math.floor(D / 2 / 10) * 10; y <= D / 2; y += 10) (y % 50 ? minor : major).push(-W / 2, y, 0, W / 2, y, 0);
    const lines = (arr, col, op) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: op })); l.position.z = 0.04; return l; };
    plateGrp.add(lines(minor, '#9db4cf', 0.55), lines(major, '#5f82ad', 0.8));
    needs = true;
  }

  /* ------------------------------------------------------------ objects → meshes */
  function geomOf(mesh) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(mesh.positions, 3));
    g.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
    g.computeVertexNormals();
    return g;
  }
  function disposeGrp(g) { g.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  function buildObj(o) {
    const grp = new THREE.Group(); grp.userData.id = o.id;
    for (const p of model.pieces(o)) {
      const geo = geomOf(model.meshOf(p.m));
      const mesh = new THREE.Mesh(geo, o.hole ? holeMat : matOf(p.color)); mesh.userData.id = o.id;
      if (o.hole) mesh.renderOrder = 2;
      grp.add(mesh);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 28), o.hole ? holeEdgeMat : edgeMat); edges.userData.skip = true;
      grp.add(edges);
    }
    return grp;
  }
  function sync() {
    if (!model) return;
    const seen = new Set();
    for (const o of proj.objs) {
      seen.add(o.id);
      const key = JSON.stringify(o), v = views.get(o.id);
      if (v && v.key === key) continue;
      if (v) { objGrp.remove(v.grp); disposeGrp(v.grp); }
      let grp;
      try { grp = buildObj(o); } catch (e) { console.warn(e); grp = new THREE.Group(); }
      objGrp.add(grp); views.set(o.id, { key, grp });
    }
    for (const [id, v] of views) if (!seen.has(id)) { objGrp.remove(v.grp); disposeGrp(v.grp); views.delete(id); }
    sel = sel.filter(id => seen.has(id));
    $('plEmpty').hidden = proj.objs.length > 0;
    drawSel(); inspector(); sizeLine(); buttons(); renderBrief();
    needs = true;
  }
  const byId = id => proj.objs.find(o => o.id === id);

  /* ------------------------------------------------------------ selection box + handles */
  function frameOf(o) { // centre and local axes (print coords)
    const R = PM.rotMatrix(o.rx, o.ry, o.rz);
    return { C: [o.x, o.y, o.z + o.h / 2], ax: [R[0][0], R[1][0], R[2][0]], ay: [R[0][1], R[1][1], R[2][1]], az: [R[0][2], R[1][2], R[2][2]], R };
  }
  const at = (F, u, v, w) => [0, 1, 2].map(i => F.C[i] + F.ax[i] * u + F.ay[i] * v + F.az[i] * w);
  function m4(F, pos) { const m = new THREE.Matrix4(); const R = F.R; m.set(R[0][0], R[0][1], R[0][2], pos[0], R[1][0], R[1][1], R[1][2], pos[1], R[2][0], R[2][1], R[2][2], pos[2], 0, 0, 0, 1); return m; }
  const hMat = new THREE.MeshBasicMaterial({ color: '#ffffff', depthTest: false }), hMatEdge = new THREE.MeshBasicMaterial({ color: '#4fb3ff', depthTest: false });
  const liftMat = new THREE.MeshBasicMaterial({ color: '#2b2b2b', depthTest: false }), rotMat = new THREE.MeshBasicMaterial({ color: '#f5a623', depthTest: false, side: THREE.DoubleSide });
  const G = {
    sq: new THREE.BoxGeometry(1.6, 1.6, 1.6), lift: new THREE.ConeGeometry(1.3, 3, 20).rotateX(Math.PI / 2),
    rz: new THREE.TorusGeometry(3.2, 0.5, 8, 24, Math.PI * 0.75).rotateZ(Math.PI * 0.62)
  };
  G.rx = G.rz.clone().rotateY(Math.PI / 2); G.ry = G.rz.clone().rotateX(Math.PI / 2);
  G.dz = new THREE.CircleGeometry(4, 20); G.dx = G.dz.clone().rotateY(Math.PI / 2); G.dy = G.dz.clone().rotateX(Math.PI / 2);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });
  let handles = [];
  function boxLines(o) {
    const w = o.w / 2, d = o.d / 2, h = o.h / 2, F = frameOf(o), pts = [];
    const c = [[-w, -d, -h], [w, -d, -h], [w, d, -h], [-w, d, -h], [-w, -d, h], [w, -d, h], [w, d, h], [-w, d, h]].map(p => at(F, ...p));
    for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) pts.push(...c[a], ...c[b]);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const l = new THREE.LineSegments(g, selMat); l.renderOrder = 5; return l;
  }
  function drawSel() {
    selGrp.children.forEach(c => c.geometry && c.geometry.dispose()); selGrp.clear(); hGrp.clear(); handles = [];
    for (const id of sel) { const o = byId(id); if (o) selGrp.add(boxLines(o)); }
    if (sel.length !== 1 || !byId(sel[0])) return;
    const o = byId(sel[0]), F = frameOf(o), w = o.w / 2, d = o.d / 2, h = o.h / 2;
    const add = (geo, mat, kind, local, extra) => {
      // a curved arrow is grabbed anywhere inside its circle (an invisible disc), so it's easy to hit
      const m = kind === 'rot' ? new THREE.Mesh(G['d' + extra.axis], hitMat) : new THREE.Mesh(geo, mat);
      if (kind === 'rot') { const v = new THREE.Mesh(geo, mat); v.renderOrder = 10; m.add(v); }
      m.renderOrder = 10; m.userData.h = { kind, local, ...extra }; hGrp.add(m); handles.push(m); return m;
    };
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) add(G.sq, hMat, 'corner', [sx * w, sy * d, -h], { sx, sy });
    for (const [sx, sy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) add(G.sq, hMatEdge, 'edge', [sx * w, sy * d, -h], { sx, sy });
    add(G.sq, hMat, 'top', [0, 0, h]);
    add(G.lift, liftMat, 'lift', [0, 0, h], { up: 1 });
    add(G.rz, rotMat, 'rot', [-w, -d, -h], { axis: 'z', push: [-1, -1, 0] });
    add(G.rx, rotMat, 'rot', [w, 0, 0], { axis: 'x', push: [1, 0, 0] });
    add(G.ry, rotMat, 'rot', [0, -d, 0], { axis: 'y', push: [0, -1, 0] });
    placeHandles();
  }
  // Handles stay the same size on screen, so they're placed again every time the camera moves.
  function placeHandles() {
    if (!handles.length) return;
    const o = byId(sel[0]); if (!o) return;
    const F = frameOf(o);
    for (const m of handles) {
      const u = m.userData.h, base = at(F, ...u.local);
      const k = camera.position.distanceTo(toT(base)) * 0.0068;
      let p = base;
      if (u.kind === 'lift') p = [base[0], base[1], base[2] + 7 * k];
      if (u.kind === 'rot') { const q = u.push; p = at(F, u.local[0] + q[0] * 6 * k, u.local[1] + q[1] * 6 * k, u.local[2] + q[2] * 6 * k); }
      const M = u.kind === 'lift' ? new THREE.Matrix4().makeTranslation(p[0], p[1], p[2]) : m4(F, p);
      M.multiply(new THREE.Matrix4().makeScale(k, k, k));
      m.matrixAutoUpdate = false; m.matrix.copy(M); m.matrixWorldNeedsUpdate = true;
    }
  }

  /* ------------------------------------------------------------ camera */
  function resize() {
    const r = stage.getBoundingClientRect(); if (r.width < 10 || r.height < 10) return;
    renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); needs = true;
  }
  function boundsOf(ids) {
    const b = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    for (const id of ids) { const o = byId(id); const q = o && model && model.bounds(o); if (q) for (let i = 0; i < 3; i++) { b.min[i] = Math.min(b.min[i], q.min[i]); b.max[i] = Math.max(b.max[i], q.max[i]); } }
    return Number.isFinite(b.min[0]) ? b : null;
  }
  function setView(v) {
    let b = boundsOf(v === 'fit' && sel.length ? sel : proj.objs.map(o => o.id));
    if (!b || v !== 'fit') b = b && v === 'fit' ? b : { min: [-proj.plate.w / 2, -proj.plate.d / 2, 0], max: [proj.plate.w / 2, proj.plate.d / 2, b ? Math.max(20, b.max[2]) : 20] };
    const c = [(b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, (b.min[2] + b.max[2]) / 2];
    const r = Math.max(15, Math.hypot(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]) / 2);
    const dist = r / Math.sin(camera.fov * Math.PI / 360) * (v === 'fit' ? 1.35 : 1.0);
    const dir = v === 'top' ? [0, -0.0001, 1] : v === 'front' ? [0, -1, 0.12] : v === 'side' ? [1, 0, 0.12] : [-0.55, -1, 0.85];
    const L = Math.hypot(...dir), T = toT(c);
    controls.target.copy(T);
    camera.position.copy(toT([c[0] + dir[0] / L * dist, c[1] + dir[1] / L * dist, c[2] + dir[2] / L * dist]));
    camera.near = Math.max(1, dist / 40); camera.far = dist * 20; camera.updateProjectionMatrix();
    controls.update(); needs = true;
  }

  /* ------------------------------------------------------------ editing */
  function snapshot() { undo.push(JSON.stringify(proj)); if (undo.length > 80) undo.shift(); redo = []; }
  function commit() { sync(); changed(); }
  function doUndo() { if (!undo.length) return; redo.push(JSON.stringify(proj)); proj = JSON.parse(undo.pop()); afterLoad(); changed(); }
  function doRedo() { if (!redo.length) return; undo.push(JSON.stringify(proj)); proj = JSON.parse(redo.pop()); afterLoad(); changed(); }
  function afterLoad() { $('plTitle').value = proj.title || ''; buildPlate(); sync(); }
  const snapV = v => Math.round(v / snap) * snap;
  const fix = v => Math.round(v * 100) / 100;

  function freeSpot(o) { // somewhere on the plate that isn't already used (for a tapped shape)
    const others = proj.objs.map(x => model.bounds(x)).filter(Boolean);
    const hit = (x, y) => others.some(b => x + o.w / 2 > b.min[0] - 2 && x - o.w / 2 < b.max[0] + 2 && y + o.d / 2 > b.min[1] - 2 && y - o.d / 2 < b.max[1] + 2);
    for (let ring = 0; ring < 12; ring++) for (let i = -ring; i <= ring; i++) for (const [x, y] of [[i, -ring], [i, ring], [-ring, i], [ring, i]]) {
      const px = x * Math.max(10, o.w + 5), py = y * Math.max(10, o.d + 5);
      if (Math.abs(px) + o.w / 2 <= proj.plate.w / 2 && Math.abs(py) + o.d / 2 <= proj.plate.d / 2 && !hit(px, py)) return [snapV(px), snapV(py)];
    }
    return [0, 0];
  }
  function addShape(kind, hole, at) {
    if (!model) return null;
    if (proj.objs.length >= PM.LIMITS.objs) { toast('That’s as many shapes as one design can have. Try grouping some.'); return null; }
    snapshot();
    const last = proj.objs.filter(o => !o.hole).slice(-1)[0];
    const o = PM.makeObj(kind, { id: PM.newId(proj), hole, color: last ? last.color : PM.COLOURS[0] });
    if (kind === 'text') { o.w = r1(o.d * model.textRatio(o.text)); }
    if (at) { o.x = snapV(at[0]); o.y = snapV(at[1]); o.z = fix(at[2] || 0); } else { const s = freeSpot(o); o.x = s[0]; o.y = s[1]; }
    proj.objs.push(o); sel = [o.id];
    commit();
    return o;
  }
  function addPart(id, at) {
    if (!model) return null;
    let objs = PM.partObjs(id, proj, 0, 0);
    if (!objs.length || proj.objs.length + objs.length > PM.LIMITS.objs) return null;
    snapshot();
    let b = null; for (const o of objs) { const q = model.bounds(o); if (q) { if (!b) b = { min: q.min.slice(), max: q.max.slice() }; else for (let i = 0; i < 3; i++) { b.min[i] = Math.min(b.min[i], q.min[i]); b.max[i] = Math.max(b.max[i], q.max[i]); } } }
    let to = at;
    if (!to) { const s = freeSpot({ w: b.max[0] - b.min[0], d: b.max[1] - b.min[1] }); to = [s[0], s[1], 0]; }
    for (const o of objs) { o.x = fix(o.x + snapV(to[0])); o.y = fix(o.y + snapV(to[1])); o.z = fix(o.z + (to[2] || 0)); }
    proj.objs.push(...objs); sel = objs.map(o => o.id); commit();
    const tipText = (PM.PARTS.find(p => p[0] === id) || [])[2]; if (tipText) toast(tipText);
    return objs;
  }
  function setField(ids, f, v) {
    snapshot();
    for (const id of ids) { const o = byId(id); if (!o) continue; o[f] = v; }
    commit();
  }
  function del() { if (!sel.length) return; snapshot(); proj.objs = proj.objs.filter(o => !sel.includes(o.id)); sel = []; commit(); }
  function duplicate() {
    if (!sel.length) return; snapshot();
    const copies = sel.map(byId).filter(Boolean).map(o => reId(clone(o)));
    for (const c of copies) { c.x = fix(c.x + 10); c.y = fix(c.y - 10); }
    proj.objs.push(...copies); sel = copies.map(c => c.id); commit();
  }
  function reId(o) { const ids = PM.allIds(proj.objs); const walk = x => { let n = ids.size + 1; while (ids.has('o' + n)) n++; x.id = 'o' + n; ids.add(x.id); if (x.children) x.children.forEach(walk); }; walk(o); return o; }
  function copy() { if (!sel.length) return; clip = sel.map(byId).filter(Boolean).map(clone); try { localStorage.setItem('cj-print-clipboard', JSON.stringify(clip)); } catch (e) { /* private window */ } toast('Copied — press Ctrl+V to paste.'); }
  function paste() {
    let c = clip; try { c = JSON.parse(localStorage.getItem('cj-print-clipboard')) || clip; } catch (e) { /* keep */ }
    if (!Array.isArray(c) || !c.length) return;
    const clean = PM.cleanProject({ objs: c }).objs; if (!clean.length) return;
    snapshot(); const copies = clean.map(o => reId(o)); for (const o of copies) { o.x = fix(o.x + 10); o.y = fix(o.y - 10); }
    proj.objs.push(...copies); sel = copies.map(o => o.id); commit();
  }
  function group() {
    if (sel.length < 2) { toast('Pick two or more shapes to group (Shift-click to pick more than one).'); return; }
    snapshot(); const g = model.group(proj, sel.slice()); if (!g) { undo.pop(); return; }
    sel = [g.id]; commit();
    const cut = g.children.some(c => c.hole);
    toast(cut ? 'Grouped — the hole cuts the shapes now.' : 'Grouped. They move and size together now.');
  }
  function ungroup() {
    const o = sel.length === 1 && byId(sel[0]); if (!o || o.kind !== 'group') return;
    snapshot(); const kids = model.ungroup(proj, o.id); sel = kids.map(k => k.id); commit();
  }
  function dropToPlate() {
    if (!sel.length) return; snapshot();
    for (const id of sel) { const o = byId(id), b = o && model.bounds(o); if (b) o.z = fix(o.z - b.min[2]); }
    commit();
  }
  function mirror(axis) { if (!sel.length) return; snapshot(); for (const id of sel) { const o = byId(id); if (o) o.flip ^= axis; } commit(); }
  function nudge(dx, dy, dz) {
    if (!sel.length) return; snapshot();
    for (const id of sel) { const o = byId(id); if (o) { o.x = fix(o.x + dx); o.y = fix(o.y + dy); o.z = fix(o.z + dz); } }
    commit();
  }
  function select(ids) { sel = ids.filter(id => byId(id)); drawSel(); inspector(); buttons(); needs = true; }

  /* ------------------------------------------------------------ shapes panel */
  function shapePics() {
    // Each shape drawn once with its real geometry, as a little picture for the panel.
    const pr = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    pr.setSize(72, 72); pr.setPixelRatio(1); pr.outputColorSpace = THREE.SRGBColorSpace;
    const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight('#fff', '#8090a8', 1.7)); const l = new THREE.DirectionalLight('#fff', 1.8); l.position.set(-1, 3, 2); sc.add(l);
    const cam = new THREE.PerspectiveCamera(30, 1, 1, 1000); const wg = new THREE.Group(); wg.rotation.x = -Math.PI / 2; sc.add(wg);
    const pics = {};
    const draw = (os, key) => {
      wg.clear(); if (!Array.isArray(os)) os = [os];
      const b = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
      for (const o of os) {
        for (const p of model.pieces(o)) { const g = geomOf(model.meshOf(p.m)); wg.add(new THREE.Mesh(g, o.hole ? new THREE.MeshStandardMaterial({ color: '#c8d3e0', transparent: true, opacity: 0.6, flatShading: true }) : matOf(p.color))); }
        const q = model.bounds(o); if (q) for (let i = 0; i < 3; i++) { b.min[i] = Math.min(b.min[i], q.min[i]); b.max[i] = Math.max(b.max[i], q.max[i]); }
      }
      const c = [(b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, (b.min[2] + b.max[2]) / 2];
      const r = Math.hypot(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]) / 2;
      const d = r / Math.sin(15 * Math.PI / 180) * 1.02, dir = [-0.55, -1, 0.75], L = Math.hypot(...dir);
      cam.position.copy(toT([c[0] + dir[0] / L * d, c[1] + dir[1] / L * d, c[2] + dir[2] / L * d])); cam.lookAt(toT(c));
      pr.render(sc, cam); pics[key] = pr.domElement.toDataURL('image/png');
      wg.children.forEach(m => m.geometry.dispose());
    };
    const COL = { box: '#e8453c', cylinder: '#f59f18', sphere: '#3b7fc4', cone: '#7c5cff', pyramid: '#f5d63c', roof: '#e45fa5', ramp: '#2fb7a8', dome: '#5cb85c', tube: '#3b7fc4', ring: '#f59f18', hexagon: '#7c5cff', star: '#f5d63c', heart: '#e8453c', text: '#2fb7a8', rounded: '#5cb85c', halfcyl: '#e45fa5', arrow: '#e8453c', plus: '#3b7fc4' };
    for (const k of PM.SHAPE_KINDS) { try { draw(PM.makeObj(k, { color: COL[k], text: 'Abc' }), k); } catch (e) { /* no picture */ } }
    for (const k of ['box', 'cylinder']) { try { draw(PM.makeObj(k, { hole: true }), 'hole-' + k); } catch (e) { /* no picture */ } }
    for (const [id] of PM.PARTS) { try { draw(PM.partObjs(id, PM.newProject()), 'part-' + id); } catch (e) { /* no picture */ } }
    pr.dispose(); try { pr.forceContextLoss(); } catch (e) { /* fine */ }
    return pics;
  }
  function shapePanel() {
    let pics = {}; try { pics = shapePics(); } catch (e) { /* pictures are a nicety */ }
    const tile = (kind, label, hole) => `<button type="button" class="pl-tile${hole ? ' hole' : ''}" data-kind="${kind}"${hole ? ' data-hole="1"' : ''} title="${esc(label)}"><img alt="" src="${pics[(hole ? 'hole-' : '') + kind] || ''}"><span>${esc(label)}</span></button>`;
    $('plGrid').innerHTML = PM.SHAPE_KINDS.map(k => tile(k, PM.KIND[k][1], false)).join('');
    $('plHoles').innerHTML = tile('box', 'Hole box', true) + tile('cylinder', 'Hole cylinder', true);
    $('plParts').innerHTML = PM.PARTS.map(([id, label, tipText]) => `<button type="button" class="pl-tile" data-part="${id}" title="${esc(tipText)}"><img alt="" src="${pics['part-' + id] || ''}"><span>${esc(label)}</span></button>`).join('');
    $('plBriefs').innerHTML = PM.BRIEFS.map(b => `<button type="button" data-brief="${b.id}" title="${esc(b.text)}">${esc(b.title)}</button>`).join('') + `<button type="button" class="pl-mkbrief" id="plMakeBrief" title="Write your own challenge (teachers: set it, then give the project to your class)">Make a challenge…</button>`;
    root.querySelectorAll('[data-brief]').forEach(b => b.onclick = () => openBrief(b.dataset.brief));
    $('plMakeBrief').onclick = editBrief;
    $('plEx').innerHTML = PM.EXAMPLES.map(e => `<button type="button" data-ex="${e[0]}" title="${esc(e[2])}">${esc(e[1])}</button>`).join('');
    root.querySelectorAll('.pl-tile').forEach(b => b.addEventListener('pointerdown', ev => tileDown(ev, b)));
    root.querySelectorAll('[data-ex]').forEach(b => b.onclick = () => openExample(b.dataset.ex));
  }
  let ghost = null;
  function tileDown(ev, b) {
    if (ev.button !== 0 && ev.pointerType === 'mouse') return;
    ev.preventDefault();
    const kind = b.dataset.kind, part = b.dataset.part, hole = !!b.dataset.hole, x0 = ev.clientX, y0 = ev.clientY; let moved = false;
    const move = e => {
      if (!moved && Math.hypot(e.clientX - x0, e.clientY - y0) < 6) return;
      if (!moved) { moved = true; ghost = document.createElement('div'); ghost.className = 'pl-ghost'; ghost.innerHTML = b.innerHTML; document.body.appendChild(ghost); }
      ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px';
    };
    const up = e => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      if (ghost) { ghost.remove(); ghost = null; }
      if (!moved) { if (part) addPart(part); else addShape(kind, hole); return; }
      const r = canvas.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      const spot = dropSpot(e.clientX, e.clientY); if (spot) { if (part) addPart(part, spot); else addShape(kind, hole, spot); }
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  }
  // Where a shape dropped at this screen point lands: on top of a shape it's over, else on the plate.
  function dropSpot(cx, cy) {
    const hit = pickObj(cx, cy);
    if (hit && hit.face) { const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld); if (n.y > 0.7) { const p = fromT(hit.point); return [p[0], p[1], p[2]]; } }
    const q = rayPlaneZ(cx, cy, 0); return q ? [q[0], q[1], 0] : null;
  }
  async function openExample(id) {
    if (proj.objs.length && !(await ask('Open the example? It replaces what’s on your build plate (you can press Undo to get it back).'))) return;
    const p = PM.exampleProject(id); if (!p) return;
    snapshot(); p.plate = proj.plate; proj = PM.cleanProject(p); sel = []; afterLoad(); setView('home'); changed();
  }

  /* ------------------------------------------------------------ picking + dragging */
  const ray = new THREE.Raycaster();
  function setRay(cx, cy) { const r = canvas.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera); }
  function printRay(cx, cy) { setRay(cx, cy); return { o: fromT(ray.ray.origin), d: fromT(ray.ray.direction) }; }
  function pickObj(cx, cy) {
    setRay(cx, cy);
    const meshes = []; objGrp.traverse(m => { if (m.isMesh) meshes.push(m); });
    const hits = ray.intersectObjects(meshes, false);
    // solid shapes first: a see-through hole shouldn't hide the shape behind it… unless that's all there is
    return hits[0] || null;
  }
  function pickHandle(cx, cy) { if (!handles.length) return null; setRay(cx, cy); const h = ray.intersectObjects(handles, false); return h[0] ? h[0].object : null; }
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  function rayPlane(cx, cy, P0, n) { const r = printRay(cx, cy), den = dot(r.d, n); if (Math.abs(den) < 1e-6) return null; const t = dot(sub(P0, r.o), n) / den; return t > 0 ? [r.o[0] + r.d[0] * t, r.o[1] + r.d[1] * t, r.o[2] + r.d[2] * t] : null; }
  const rayPlaneZ = (cx, cy, z) => rayPlane(cx, cy, [0, 0, z], [0, 0, 1]);
  function rayLine(cx, cy, P0, A) { // parameter t of the point on the line P0 + tA closest to the pointer's ray
    const r = printRay(cx, cy), w0 = sub(P0, r.o), a = dot(A, A), b = dot(A, r.d), c = dot(r.d, r.d), d = dot(A, w0), e = dot(r.d, w0), den = a * c - b * b;
    if (Math.abs(den) < 1e-6) return null; return (b * e - c * d) / den;
  }

  let drag = null;
  const tipEl = $('plTip');
  function tip(text, cx, cy) { if (!text) { tipEl.hidden = true; return; } const r = stage.getBoundingClientRect(); tipEl.hidden = false; tipEl.textContent = text; tipEl.style.left = (cx - r.left + 16) + 'px'; tipEl.style.top = (cy - r.top + 14) + 'px'; }
  const mm = v => (Math.round(v * 10) / 10) + '';

  canvas.addEventListener('pointerdown', ev => {
    if (!model || drag) { if (drag) endDrag(true); return; }
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    if (measure) { controls.enabled = true; drag = { kind: 'empty', x0: ev.clientX, y0: ev.clientY, moved: false, measure: true }; return; }
    const h = !(ev.shiftKey || ev.ctrlKey || ev.metaKey) && pickHandle(ev.clientX, ev.clientY); // Shift-click is for picking shapes
    if (h) { controls.enabled = false; startHandle(ev, h); return; }
    const hit = pickObj(ev.clientX, ev.clientY);
    if (hit) {
      controls.enabled = false;
      const id = hit.object.userData.id;
      if (ev.shiftKey || ev.ctrlKey || ev.metaKey) { select(sel.includes(id) ? sel.filter(x => x !== id) : sel.concat(id)); return; }
      if (!sel.includes(id)) select([id]);
      const p = fromT(hit.point);
      drag = { kind: 'move', x0: ev.clientX, y0: ev.clientY, z: p[2], P0: p, start: sel.map(i => { const o = byId(i); return [i, o.x, o.y]; }), moved: false };
      canvas.setPointerCapture(ev.pointerId);
      return;
    }
    controls.enabled = true;
    drag = { kind: 'empty', x0: ev.clientX, y0: ev.clientY, moved: false };
  }, { capture: true });
  canvas.addEventListener('pointermove', ev => {
    if (!drag) { hover(ev); return; }
    if (!drag.moved && Math.hypot(ev.clientX - drag.x0, ev.clientY - drag.y0) < 4) return;
    if (!drag.moved) { drag.moved = true; if (drag.kind !== 'empty') snapshot(); }
    if (drag.kind === 'move') dragMove(ev);
    else if (drag.kind === 'handle') dragHandle(ev);
  });
  const up = ev => { if (drag) endDrag(false, ev); };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', () => drag && endDrag(true));
  let hoverT = 0;
  function hover(ev) {
    if (!model || hoverT > performance.now() - 40) return; hoverT = performance.now();
    canvas.style.cursor = pickHandle(ev.clientX, ev.clientY) ? 'pointer' : pickObj(ev.clientX, ev.clientY) ? 'grab' : '';
  }
  function endDrag(cancel, ev) {
    const d = drag; drag = null; controls.enabled = true; tip(null);
    if (d.kind === 'empty') { if (d.measure) { if (!d.moved && ev) measurePoint(ev.clientX, ev.clientY); return; } if (!d.moved && !(ev && (ev.shiftKey || ev.ctrlKey))) select([]); return; }
    if (!d.moved) return;
    if (cancel) { doUndo(); redo.pop(); return; }
    for (const v of views.values()) v.grp.position.set(0, 0, 0);
    commit();
  }
  function dragMove(ev) {
    const q = rayPlaneZ(ev.clientX, ev.clientY, drag.z); if (!q) return;
    let dx = q[0] - drag.P0[0], dy = q[1] - drag.P0[1];
    const lead = drag.start[0];
    const nx = snapV(lead[1] + dx), ny = snapV(lead[2] + dy); dx = nx - lead[1]; dy = ny - lead[2];
    for (const [id, x, y] of drag.start) { const o = byId(id); o.x = fix(x + dx); o.y = fix(y + dy); const v = views.get(id); if (v) v.grp.position.set(o.x - x, o.y - y, 0); }
    drawSel(); inspector(); needs = true;
    tip('X ' + mm(byId(lead[0]).x) + '   Y ' + mm(byId(lead[0]).y) + ' mm', ev.clientX, ev.clientY);
  }

  function startHandle(ev, h) {
    const o = byId(sel[0]), u = h.userData.h, F = frameOf(o);
    drag = { kind: 'handle', u, x0: ev.clientX, y0: ev.clientY, moved: false, o0: clone(o), F };
    if (u.kind === 'corner' || u.kind === 'edge') { drag.P0 = at(F, ...u.local); drag.q0 = rayPlane(ev.clientX, ev.clientY, drag.P0, F.az); }
    else if (u.kind === 'top') { drag.P0 = at(F, ...u.local); drag.t0 = rayLine(ev.clientX, ev.clientY, drag.P0, F.az); }
    else if (u.kind === 'lift') { drag.P0 = at(F, ...u.local); drag.t0 = rayLine(ev.clientX, ev.clientY, drag.P0, [0, 0, 1]); }
    else if (u.kind === 'rot') {
      const Rz = PM.rotMatrix(0, 0, o.rz), Ryz = PM.rotMatrix(0, o.ry, o.rz);
      drag.axis = u.axis === 'z' ? [0, 0, 1] : u.axis === 'y' ? [Rz[0][1], Rz[1][1], Rz[2][1]] : [Ryz[0][0], Ryz[1][0], Ryz[2][0]];
      drag.C = F.C; drag.a0 = angleAt(ev.clientX, ev.clientY);
      drag.f = 'r' + u.axis;
    }
    canvas.setPointerCapture(ev.pointerId);
  }
  function angleAt(cx, cy) {
    const q = rayPlane(cx, cy, drag.C, drag.axis); if (!q) return null;
    const v = sub(q, drag.C), ref = Math.abs(drag.axis[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const e1 = cross(drag.axis, ref), L1 = Math.hypot(...e1); const a = e1.map(x => x / L1), b = cross(drag.axis, a);
    return Math.atan2(dot(v, b), dot(v, a)) * 180 / Math.PI;
  }
  function dragHandle(ev) {
    const o = byId(sel[0]); if (!o) return;
    const o0 = drag.o0, F = drag.F, u = drag.u, MIN = 0.2;
    Object.assign(o, clone(o0));
    if (u.kind === 'corner' || u.kind === 'edge') {
      const q = rayPlane(ev.clientX, ev.clientY, drag.P0, F.az); if (!q || !drag.q0) return;
      const off = sub(q, drag.q0), du = dot(off, F.ax), dv = dot(off, F.ay);
      let w = u.sx ? Math.max(MIN, snapV(o0.w + u.sx * du)) : o0.w, d = u.sy ? Math.max(MIN, snapV(o0.d + u.sy * dv)) : o0.d, h = o0.h;
      if (ev.shiftKey || o0.kind === 'text' && u.kind === 'corner') { // keep its shape
        const f = Math.max(u.sx ? w / o0.w : 0, u.sy ? d / o0.d : 0);
        w = Math.max(MIN, fix(o0.w * f)); d = Math.max(MIN, fix(o0.d * f)); if (ev.shiftKey) h = Math.max(MIN, fix(o0.h * f));
      }
      const C = [0, 1, 2].map(i => F.C[i] + F.ax[i] * (u.sx || 0) * (w - o0.w) / 2 + F.ay[i] * (u.sy || 0) * (d - o0.d) / 2 + F.az[i] * (h - o0.h) / 2);
      o.w = fix(w); o.d = fix(d); o.h = fix(h); o.x = fix(C[0]); o.y = fix(C[1]); o.z = fix(C[2] - h / 2);
      tip('W ' + mm(o.w) + ' × D ' + mm(o.d) + (ev.shiftKey ? ' × H ' + mm(o.h) : '') + ' mm', ev.clientX, ev.clientY);
    } else if (u.kind === 'top') {
      const t = rayLine(ev.clientX, ev.clientY, drag.P0, F.az); if (t == null || drag.t0 == null) return;
      const h = Math.max(MIN, snapV(o0.h + t - drag.t0));
      const C = [0, 1, 2].map(i => F.C[i] + F.az[i] * (h - o0.h) / 2);
      o.h = fix(h); o.x = fix(C[0]); o.y = fix(C[1]); o.z = fix(C[2] - h / 2);
      tip('Height ' + mm(o.h) + ' mm', ev.clientX, ev.clientY);
    } else if (u.kind === 'lift') {
      const t = rayLine(ev.clientX, ev.clientY, drag.P0, [0, 0, 1]); if (t == null || drag.t0 == null) return;
      o.z = fix(snapV(o0.z + t - drag.t0));
      tip('Lifted ' + mm(o.z) + ' mm', ev.clientX, ev.clientY);
    } else if (u.kind === 'rot') {
      const a = angleAt(ev.clientX, ev.clientY); if (a == null || drag.a0 == null) return;
      let da = a - drag.a0; da = ((da + 540) % 360) - 180;
      const step = ev.shiftKey ? 1 : 15;
      let v = Math.round((o0[drag.f] + da) / step) * step; v = ((v + 540) % 360) - 180; if (v === -180) v = 180;
      o[drag.f] = v;
      tip('Turned ' + v + '°', ev.clientX, ev.clientY);
    }
    sync();
  }

  /* ------------------------------------------------------------ keys */
  function onKey(e) {
    if (!alive || !root.isConnected || root.offsetParent === null) return;
    const t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if (typing || document.querySelector('#cj-dialog:not(.hide)')) return;
    if (!$('plModal').hidden) { if (e.key === 'Escape') closeModal(); return; }
    const k = e.key, ctrl = e.ctrlKey || e.metaKey;
    const step = e.shiftKey ? snap * 10 : snap;
    let done = true;
    if (ctrl && k.toLowerCase() === 'z' && !e.shiftKey) doUndo();
    else if (ctrl && (k.toLowerCase() === 'y' || (k.toLowerCase() === 'z' && e.shiftKey))) doRedo();
    else if (ctrl && k.toLowerCase() === 'd') duplicate();
    else if (ctrl && k.toLowerCase() === 'c') copy();
    else if (ctrl && k.toLowerCase() === 'v') paste();
    else if (ctrl && k.toLowerCase() === 'g') { if (e.shiftKey) ungroup(); else group(); }
    else if (ctrl && k.toLowerCase() === 'a') select(proj.objs.map(o => o.id));
    else if (ctrl) done = false;
    else if (k === 'Delete' || k === 'Backspace') del();
    else if (k === 'Escape') { if (measure) setMeasure(false); else select([]); }
    else if (k === 'm' || k === 'M') setMeasure(!measure);
    else if (k === 'ArrowLeft') nudge(-step, 0, 0); else if (k === 'ArrowRight') nudge(step, 0, 0);
    else if (k === 'ArrowUp') nudge(0, step, 0); else if (k === 'ArrowDown') nudge(0, -step, 0);
    else if (k === 'PageUp') nudge(0, 0, step); else if (k === 'PageDown') nudge(0, 0, -step);
    else if (k === 'h' || k === 'H') { if (sel.length) setField(sel, 'hole', true); }
    else if (k === 's' || k === 'S') { if (sel.length) setField(sel, 'hole', false); }
    else if (k === 'd' || k === 'D') dropToPlate();
    else if (k === 'f' || k === 'F') setView('fit');
    else done = false;
    if (done) e.preventDefault();
  }
  document.addEventListener('keydown', onKey);

  /* ------------------------------------------------------------ inspector + bar */
  function buttons() {
    const one = sel.length === 1 && byId(sel[0]);
    $('plUndo').disabled = !undo.length; $('plRedo').disabled = !redo.length;
    for (const id of ['plDup', 'plDel', 'plDrop']) $(id).disabled = !sel.length;
    $('plGroup').disabled = sel.length < 2; $('plUngroup').disabled = !(one && one.kind === 'group');
  }
  function sizeLine() {
    const b = model && boundsOf(proj.objs.filter(o => !o.hole).map(o => o.id));
    $('plSize').textContent = b ? 'Whole design: ' + mm(b.max[0] - b.min[0]) + ' × ' + mm(b.max[1] - b.min[1]) + ' × ' + mm(b.max[2] - Math.min(0, b.min[2])) + ' mm' : '';
  }
  const NUMS = [['x', 'X'], ['y', 'Y'], ['z', 'Up'], ['w', 'Width'], ['d', 'Depth'], ['h', 'Height'], ['rx', 'Tip'], ['ry', 'Roll'], ['rz', 'Turn']];
  function inspector() {
    const box = $('plInsp');
    if (!sel.length) {
      box.innerHTML = `<h3>Nothing selected</h3><p class="pl-hint">Tap a shape to change it. Shift-click to pick more than one.</p>
        <label class="pl-row">Build plate <select id="plPlate">${PM.PLATES.map(p => `<option value="${p[0]}"${proj.plate.w === p[2] ? ' selected' : ''}>${esc(p[1])}</option>`).join('')}${PM.PLATES.some(p => p[2] === proj.plate.w) ? '' : `<option selected>${proj.plate.w} × ${proj.plate.d} mm</option>`}</select></label>
        <div class="pl-learn"><b>How it works</b><ul><li>Everything is measured in <b>millimetres</b> (10 mm = 1 cm). Each square on the plate is 10 mm.</li><li>Make a shape a <b>hole</b>, put it where you want a gap, then select both and press <b>Group</b> — the hole cuts it out.</li><li>The printer builds from the plate up, so everything needs to rest on the plate or on another part.</li></ul></div>`;
      $('plPlate').onchange = e => { const p = PM.PLATES.find(x => x[0] === e.target.value); if (!p) return; snapshot(); proj.plate = { w: p[2], d: p[3] }; buildPlate(); commit(); };
      return;
    }
    const objs = sel.map(byId).filter(Boolean), o = objs[0], one = objs.length === 1;
    const label = one ? (o.kind === 'group' ? 'Group' : (PM.KIND[o.kind] || [0, 'Shape'])[1]) : objs.length + ' shapes';
    const allHole = objs.every(x => x.hole), allSolid = objs.every(x => !x.hole);
    let h = `<h3>${esc(label)}${one && o.hole ? ' <span class="pl-tag">hole</span>' : ''}</h3>
      <div class="pl-seg" role="group" aria-label="Solid or hole"><button type="button" data-hole="0" class="${allSolid ? 'on' : ''}">Solid</button><button type="button" data-hole="1" class="${allHole ? 'on' : ''}">Hole</button></div>`;
    if (!allHole) h += `<div class="pl-cols">${PM.COLOURS.map(c => `<button type="button" class="pl-col${objs.every(x => x.color === c) ? ' on' : ''}" data-col="${c}" style="--c:${c}" title="${c}" aria-label="Colour ${c}"></button>`).join('')}<label class="pl-colpick" title="Any colour"><input type="color" id="plColour" value="${o.color}"></label></div>`;
    if (one) {
      if (o.kind === 'text') h += `<label class="pl-row pl-text">Text <input id="plText" maxlength="${PM.LIMITS.text}" value="${esc(o.text || '')}" autocomplete="off"></label>`;
      if (o.kind === 'tube') h += `<label class="pl-row">Wall (mm) <input type="number" id="plWall" step="0.5" min="0.4" value="${o.wall}"></label>`;
      if (o.kind === 'rounded') h += `<label class="pl-row">Roundness (mm) <input type="number" id="plRound" step="0.5" min="0" value="${o.round}"></label>`;
      if (o.kind === 'gear') h += `<label class="pl-row">Teeth <input type="number" id="plTeeth" step="1" min="6" max="60" value="${o.teeth}"></label><p class="pl-hint">Two gears mesh when their teeth are the same size: keep width ÷ teeth the same (e.g. 30 mm with 12 teeth and 60 mm with 24).</p>`;
      if (o.kind === 'hinge') h += `<p class="pl-hint">This hinge prints already joined. Keep the gaps: don’t make it much smaller than 30 × 15 × 5 mm.</p>`;
      if (o.kind === 'sketch') h += `<div class="pl-acts"><button type="button" id="plEditDraw">${ic('i-pen')} Change the drawing</button></div>`;
      h += '<div class="pl-nums">' + NUMS.map(([f, l], i) => (i % 3 === 0 ? `<div class="pl-numh">${['Position (mm)', 'Size (mm)', 'Turn (degrees)'][i / 3]}</div>` : '') +
        `<label>${l}<input type="number" data-f="${f}" step="${f[0] === 'r' ? 15 : snap}" value="${r1(o[f])}"></label>`).join('') + '</div>';
      h += `<label class="pl-check"><input type="checkbox" id="plKeep"> Keep its shape when I change the size</label>`;
    }
    h += `<div class="pl-acts"><button type="button" data-act="mx" title="Flip left to right">Flip ↔</button><button type="button" data-act="my" title="Flip front to back">Flip ↕</button><button type="button" data-act="mz" title="Turn upside down">Upside down</button></div>`;
    if (one && o.kind === 'group') h += `<p class="pl-hint">Holes in a group cut the shapes. To change one part, press <b>Ungroup</b>.</p>`;
    if (one && o.hole) h += `<p class="pl-hint">A hole on its own isn’t printed. Put it where you want the gap, select it and the shape, then press <b>Group</b>.</p>`;
    if (!one) {
      h += `<div class="pl-numh">Line them up</div><div class="pl-align">${[['0', 'min', 'Left'], ['0', 'mid', 'Centre'], ['0', 'max', 'Right'], ['1', 'min', 'Front'], ['1', 'mid', 'Middle'], ['1', 'max', 'Back'], ['2', 'min', 'Bottom'], ['2', 'mid', 'Halfway'], ['2', 'max', 'Top']].map(([a, w, l]) => `<button type="button" data-al="${a}${w}" title="Line up their ${l.toLowerCase()} edges">${l}</button>`).join('')}</div>`;
      h += `<p class="pl-hint">Press <b>Group</b> to join them into one — any holes cut the shapes.</p>`;
    }
    box.innerHTML = h;
    box.querySelectorAll('[data-hole]').forEach(b => b.onclick = () => setField(sel, 'hole', b.dataset.hole === '1'));
    box.querySelectorAll('[data-col]').forEach(b => b.onclick = () => colour(b.dataset.col));
    const cp = $('plColour'); if (cp) cp.onchange = () => colour(cp.value);
    box.querySelectorAll('[data-act]').forEach(b => b.onclick = () => mirror({ mx: 1, my: 2, mz: 4 }[b.dataset.act]));
    const tx = $('plText'); if (tx) tx.onchange = () => {
      const v = tx.value.slice(0, PM.LIMITS.text); if (!v.trim()) { tx.value = o.text; return; }
      snapshot(); o.text = v; o.w = Math.max(0.2, r1(o.d * model.textRatio(v))); commit();
    };
    const rd = $('plRound'); if (rd) rd.onchange = () => { const v = Number(rd.value); if (v >= 0) setField([o.id], 'round', Math.min(100, v)); };
    const te = $('plTeeth'); if (te) te.onchange = () => { const v = Math.round(Number(te.value)); if (v >= 6 && v <= 60) setField([o.id], 'teeth', v); else te.value = o.teeth; };
    const ed = $('plEditDraw'); if (ed) ed.onclick = () => openDraw(o);
    box.querySelectorAll('[data-al]').forEach(b => b.onclick = () => { snapshot(); if (model.align(proj, sel, +b.dataset.al[0], b.dataset.al.slice(1))) commit(); else undo.pop(); });
    const wl = $('plWall'); if (wl) wl.onchange = () => { const v = Number(wl.value); if (v >= 0.4) setField([o.id], 'wall', v); };
    box.querySelectorAll('[data-f]').forEach(inp => inp.onchange = () => {
      let v = Number(inp.value); const f = inp.dataset.f; if (!Number.isFinite(v)) { inp.value = r1(o[f]); return; }
      if ('wdh'.includes(f)) v = Math.max(0.2, v);
      if (f[0] === 'r') v = ((v + 540) % 360) - 180;
      snapshot();
      if ('wdh'.includes(f) && $('plKeep') && $('plKeep').checked) { const k = v / o[f]; o.w = fix(o.w * k); o.d = fix(o.d * k); o.h = fix(o.h * k); }
      else o[f] = fix(v);
      commit();
    });
  }
  function colour(c) {
    snapshot();
    const paint = o => { o.color = c; if (o.children) o.children.forEach(k => { if (!k.hole) paint(k); }); };
    for (const id of sel) { const o = byId(id); if (o) paint(o); }
    commit();
  }

  /* ------------------------------------------------------------ measure */
  let measure = null; // {pts:[[x,y,z]…]} while the Measure tool is on
  const mLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#ff4fa3', depthTest: false })); mLine.renderOrder = 20; world.add(mLine);
  const mDots = new THREE.Group(); world.add(mDots);
  function setMeasure(on) {
    measure = on ? { pts: [] } : null;
    $('plMeasure').classList.toggle('on', !!on); canvas.style.cursor = on ? 'crosshair' : '';
    drawMeasure();
    if (on) toast('Click two points on your design or the plate to measure between them.');
  }
  function measurePoint(cx, cy) {
    const hit = pickObj(cx, cy); const p = hit ? fromT(hit.point) : rayPlaneZ(cx, cy, 0);
    if (!p) return;
    if (measure.pts.length >= 2) measure.pts = [];
    measure.pts.push(p.map(v => Math.round(v * 10) / 10)); drawMeasure();
  }
  function drawMeasure() {
    const pts = measure ? measure.pts : [];
    mLine.geometry.dispose(); mLine.geometry = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(...p)));
    mDots.clear(); for (const p of pts) { const d = new THREE.Mesh(G.sq, new THREE.MeshBasicMaterial({ color: '#ff4fa3', depthTest: false })); d.renderOrder = 21; d.position.set(...p); d.scale.setScalar(camera.position.distanceTo(toT(p)) * 0.005); mDots.add(d); }
    const L = $('plMLabel');
    if (pts.length === 2) {
      const [a, b] = pts, d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      L.innerHTML = `<b>${mm(Math.hypot(...d))} mm</b><small>across ${mm(Math.abs(d[0]))} · back ${mm(Math.abs(d[1]))} · up ${mm(Math.abs(d[2]))}</small>`;
      L.hidden = false; L.dataset.at = JSON.stringify([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
    } else L.hidden = true;
    needs = true;
  }
  function placeMeasureLabel() {
    const L = $('plMLabel'); if (L.hidden) return;
    const at = JSON.parse(L.dataset.at || '[0,0,0]'), v = toT(at).project(camera), r = stage.getBoundingClientRect();
    L.style.left = ((v.x + 1) / 2 * r.width) + 'px'; L.style.top = ((1 - v.y) / 2 * r.height) + 'px';
    for (const d of mDots.children) d.scale.setScalar(camera.position.distanceTo(toT([d.position.x, d.position.y, d.position.z])) * 0.005);
  }

  /* ------------------------------------------------------------ draw your own shape */
  function openDraw(edit) {
    const D = { mode: edit ? edit.mode : 'up', tool: 'points', pts: edit ? edit.pts.map(p => p.slice()) : [], snapOn: true, drag: -1, free: null };
    modal(`<h2 id="plMTitle">Draw a shape</h2>
      <div class="pl-drawbar">
        <div class="pl-seg pl-segsm" role="group" aria-label="What to make"><button type="button" data-dm="up">Stand it up</button><button type="button" data-dm="spin">Spin it round</button></div>
        <div class="pl-seg pl-segsm" role="group" aria-label="How to draw"><button type="button" data-dt="points">Click points</button><button type="button" data-dt="free">Draw freehand</button></div>
      </div>
      <p class="pl-hint" id="plDrawHint"></p>
      <div class="pl-drawwrap"><canvas id="plDrawCv" width="440" height="440" aria-label="Drawing grid"></canvas></div>
      <div class="pl-drawbar"><label class="pl-check"><input type="checkbox" id="plDrawSnap" checked> Snap to the grid</label><span class="pl-sp"></span>
        <button type="button" id="plDrawUndo">Undo point</button><button type="button" id="plDrawClear">Clear</button><button type="button" class="pl-go" id="plDrawOk">${edit ? 'Change it' : 'Make it'}</button></div>
      <p class="pl-hint pl-bad" id="plDrawMsg"></p>`);
    $('plModal').querySelector('.pl-card').classList.add('wide');
    const cv = $('plDrawCv'), cx = cv.getContext('2d'), N = 440, M = 20;
    // drawing units 0–1000 → canvas; in spin mode the drawing is the right half (the left edge is the middle of the shape)
    const sx = x => D.mode === 'spin' ? N / 2 + x / 1000 * (N / 2 - M) : M + x / 1000 * (N - 2 * M);
    const sy = y => N - M - y / 1000 * (N - 2 * M);
    const ux = px => D.mode === 'spin' ? (px - N / 2) / (N / 2 - M) * 1000 : (px - M) / (N - 2 * M) * 1000;
    const uy = py => (N - M - py) / (N - 2 * M) * 1000;
    const clampU = v => Math.max(0, Math.min(1000, Math.round(v)));
    const snapU = v => D.snapOn ? Math.round(v / 50) * 50 : v;
    function paint() {
      cx.clearRect(0, 0, N, N); cx.fillStyle = '#f4f7fb'; cx.fillRect(0, 0, N, N);
      cx.strokeStyle = '#d9e2ee'; cx.lineWidth = 1;
      for (let i = 0; i <= 20; i++) { const a = M + i * (N - 2 * M) / 20; cx.beginPath(); cx.moveTo(a, M); cx.lineTo(a, N - M); cx.stroke(); cx.beginPath(); cx.moveTo(M, a); cx.lineTo(N - M, a); cx.stroke(); }
      if (D.mode === 'spin') { cx.strokeStyle = '#e45fa5'; cx.setLineDash([6, 5]); cx.lineWidth = 2; cx.beginPath(); cx.moveTo(N / 2, M - 6); cx.lineTo(N / 2, N - M + 6); cx.stroke(); cx.setLineDash([]); }
      const P = D.pts;
      if (P.length) {
        const path = (mirror) => { cx.beginPath(); P.forEach(([x, y], i) => { const X = mirror ? N - sx(x) : sx(x); i ? cx.lineTo(X, sy(y)) : cx.moveTo(X, sy(y)); }); if (P.length > 2) cx.closePath(); };
        if (D.mode === 'spin') { path(true); cx.fillStyle = 'rgba(59,127,196,.12)'; cx.fill(); }
        path(false); cx.fillStyle = 'rgba(59,127,196,.35)'; if (P.length > 2) cx.fill(); cx.strokeStyle = '#2d6fb8'; cx.lineWidth = 2.5; cx.stroke();
        if (D.tool === 'points' || P.length < 60) P.forEach(([x, y], i) => { cx.fillStyle = i === 0 ? '#e8453c' : '#fff'; cx.strokeStyle = '#2d6fb8'; cx.lineWidth = 2; cx.beginPath(); cx.arc(sx(x), sy(y), 6, 0, Math.PI * 2); cx.fill(); cx.stroke(); });
      }
      if (D.free) { cx.strokeStyle = '#e8453c'; cx.lineWidth = 2; cx.beginPath(); D.free.forEach(([x, y], i) => i ? cx.lineTo(sx(x), sy(y)) : cx.moveTo(sx(x), sy(y))); cx.stroke(); }
      root.querySelectorAll('[data-dm]').forEach(b => b.classList.toggle('on', b.dataset.dm === D.mode));
      root.querySelectorAll('[data-dt]').forEach(b => b.classList.toggle('on', b.dataset.dt === D.tool));
      $('plDrawHint').textContent = (D.mode === 'spin' ? 'Draw half the outline, from the pink middle line outwards — like half a vase or a chess piece. It spins round the line. ' : 'Draw the outline seen from above; it stands up into a solid shape. ')
        + (D.tool === 'points' ? 'Click to add points; drag a point to move it.' : 'Press and draw round the outline in one go.');
      $('plDrawMsg').textContent = '';
    }
    const at = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * N / r.width, (e.clientY - r.top) * N / r.height]; };
    cv.onpointerdown = e => {
      e.preventDefault(); cv.setPointerCapture(e.pointerId);
      const [px, py] = at(e);
      if (D.tool === 'free') { D.free = [[clampU(ux(px)), clampU(uy(py))]]; paint(); return; }
      const near = D.pts.findIndex(([x, y]) => Math.hypot(sx(x) - px, sy(y) - py) < 10);
      if (near >= 0) { D.drag = near; return; }
      D.pts.push([clampU(snapU(ux(px))), clampU(snapU(uy(py)))]); D.drag = D.pts.length - 1; paint();
    };
    cv.onpointermove = e => {
      const [px, py] = at(e);
      if (D.free) { const q = [clampU(ux(px)), clampU(uy(py))], l = D.free[D.free.length - 1]; if (Math.hypot(q[0] - l[0], q[1] - l[1]) > 6) { D.free.push(q); paint(); } return; }
      if (D.drag >= 0 && e.buttons) { D.pts[D.drag] = [clampU(snapU(ux(px))), clampU(snapU(uy(py)))]; paint(); }
    };
    cv.onpointerup = () => {
      if (D.free) { const s2 = simplify(D.free, 9); D.pts = s2.length >= 3 ? s2 : D.pts; D.free = null; paint(); }
      D.drag = -1;
    };
    root.querySelectorAll('[data-dm]').forEach(b => b.onclick = () => { D.mode = b.dataset.dm; paint(); });
    root.querySelectorAll('[data-dt]').forEach(b => b.onclick = () => { D.tool = b.dataset.dt; paint(); });
    $('plDrawSnap').onchange = e => { D.snapOn = e.target.checked; };
    $('plDrawUndo').onclick = () => { D.pts.pop(); paint(); };
    $('plDrawClear').onclick = () => { D.pts = []; paint(); };
    $('plDrawOk').onclick = () => {
      const pts = PM.cleanPts(D.pts);
      if (!pts) { $('plDrawMsg').textContent = 'Add at least 3 points first.'; return; }
      const test = Object.assign(PM.makeObj('sketch', { pts, mode: D.mode }), edit ? { w: edit.w, d: edit.d, h: edit.h } : {});
      const w = model.whole(test); const okShape = w && w.volume() > 0.5; if (w) model.free(w);
      if (!okShape) { $('plDrawMsg').textContent = D.mode === 'spin' ? 'That doesn’t make a shape — start on the pink line and draw out to the right.' : 'That outline is too thin or crosses itself — try again.'; return; }
      closeModal();
      if (edit) { const o = byId(edit.id); if (o) { snapshot(); o.pts = pts; o.mode = D.mode; commit(); } return; }
      const o = addShape('sketch', false); if (!o) return;
      o.pts = pts; o.mode = D.mode; if (D.mode === 'spin') { o.h = 40; o.w = o.d = 30; } commit();
    };
    paint();
  }
  // Ramer–Douglas–Peucker: fewer points along the same outline.
  function simplify(pts, eps) {
    if (pts.length < 3) return pts;
    const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
    const st = [[0, pts.length - 1]];
    while (st.length) {
      const [a, b] = st.pop(); let best = -1, bd = eps;
      const [x1, y1] = pts[a], [x2, y2] = pts[b], L = Math.hypot(x2 - x1, y2 - y1) || 1;
      for (let i = a + 1; i < b; i++) { const d = Math.abs((x2 - x1) * (y1 - pts[i][1]) - (x1 - pts[i][0]) * (y2 - y1)) / L; if (d > bd) { bd = d; best = i; } }
      if (best > 0) { keep[best] = 1; st.push([a, best], [best, b]); }
    }
    return pts.filter((p, i) => keep[i]).slice(0, 300);
  }

  /* ------------------------------------------------------------ design challenges (briefs) */
  let briefTimer = 0, briefDone = false;
  function renderBrief() {
    clearTimeout(briefTimer);
    briefTimer = setTimeout(() => {
      const el = $('plBrief'), b = proj.brief;
      if (!b || !model) { el.hidden = true; return; }
      const res = PM.briefCheck(model, proj, b), all = res.length && res.every(r => r.ok);
      el.hidden = false;
      el.innerHTML = `<div class="pl-bhead"><b>${esc(b.title || 'Design challenge')}</b><button type="button" id="plBriefMin" title="Fold away">−</button></div>
        <div class="pl-bbody">${b.text ? `<p>${esc(b.text)}</p>` : ''}<ul>${res.map(r => `<li class="${r.ok ? 'ok' : ''}"><span>${r.ok ? '✓' : ''}</span>${esc(r.text)}</li>`).join('')}</ul>
        ${all ? '<p class="pl-bwin">Challenge complete! Download it with Check &amp; print.</p>' : ''}
        <div class="pl-bacts"><button type="button" id="plBriefEdit">Change</button><button type="button" id="plBriefOff">Remove</button></div></div>`;
      $('plBriefMin').onclick = () => el.classList.toggle('min');
      $('plBriefEdit').onclick = editBrief;
      $('plBriefOff').onclick = async () => { if (await ask('Take the challenge off this design?')) { snapshot(); delete proj.brief; commit(); } };
      if (all && !briefDone) toast('Challenge complete — well designed!', '#3fae5e');
      briefDone = all;
    }, 250);
  }
  async function openBrief(id) {
    const b = PM.BRIEFS.find(x => x.id === id); if (!b) return;
    if (proj.objs.length && !(await ask('Start “' + b.title + '” on a clear build plate? Choose No to keep your design and add the challenge to it.'))) { snapshot(); proj.brief = PM.cleanBrief(b); briefDone = false; commit(); return; }
    snapshot(); const p = PM.briefProject(id); p.plate = proj.plate; proj = p; sel = []; briefDone = false; afterLoad(); setView('home'); changed();
  }
  function editBrief() {
    const b = proj.brief ? clone(proj.brief) : { title: '', text: '', rules: [{ k: 'ready' }] };
    const KINDS_OPT = PM.KINDS.map(k => `<option value="${k[0]}">${esc(k[1])}</option>`).join('');
    const ruleRow = (r, i) => `<div class="pl-rrow" data-i="${i}"><select data-rk>${Object.keys(PM.RULES).map(k => `<option value="${k}"${r.k === k ? ' selected' : ''}>${esc(PM.ruleText({ k, v: k === 'uses' ? 'box' : 'N' }).replace(' N ', ' … '))}</option>`).join('')}</select>
      ${['hole', 'text', 'ready'].includes(r.k) ? '<span></span>' : r.k === 'uses' ? `<select data-rv>${KINDS_OPT.replace(`value="${r.v}"`, `value="${r.v}" selected`)}</select>` : `<input type="number" data-rv min="1" max="1000" value="${r.v || 50}">`}
      <button type="button" data-rdel title="Take this rule away" aria-label="Take this rule away">${ic('i-x')}</button></div>`;
    const draw = () => {
      modal(`<h2 id="plMTitle">${proj.brief ? 'Change the challenge' : 'Make a challenge'}</h2>
        <p class="pl-hint">Write a design brief and the rules a design must meet. The rules tick themselves while pupils design. Teachers: save the project and give it to your class.</p>
        <label class="pl-frow">Title <input id="plBTitle" maxlength="60" value="${esc(b.title)}" placeholder="e.g. A bird feeder"></label>
        <label class="pl-frow">What to make <textarea id="plBText" maxlength="400" rows="3" placeholder="Who is it for? What does it need to do?">${esc(b.text)}</textarea></label>
        <div class="pl-rules">${b.rules.map(ruleRow).join('')}</div>
        <div class="pl-dl"><button type="button" id="plBAdd">Add a rule</button><span class="pl-sp"></span><button type="button" class="pl-go" id="plBSave">Save the challenge</button></div>`);
      const read = () => { b.title = $('plBTitle').value; b.text = $('plBText').value; root.querySelectorAll('.pl-rrow').forEach(row => { const r = b.rules[+row.dataset.i], k = row.querySelector('[data-rk]').value, v = row.querySelector('[data-rv]'); r.k = k; if (v) r.v = k === 'uses' ? v.value : Number(v.value); }); };
      root.querySelectorAll('.pl-rrow [data-rk]').forEach(sel2 => sel2.onchange = () => { read(); const r = b.rules[+sel2.closest('.pl-rrow').dataset.i]; if (r.k === 'uses') r.v = 'box'; else if (typeof r.v !== 'number') r.v = 50; draw(); });
      root.querySelectorAll('[data-rdel]').forEach(x => x.onclick = () => { read(); b.rules.splice(+x.closest('.pl-rrow').dataset.i, 1); draw(); });
      $('plBAdd').onclick = () => { read(); if (b.rules.length < 12) b.rules.push({ k: 'maxw', v: 60 }); draw(); };
      $('plBSave').onclick = () => { read(); const c = PM.cleanBrief(b); snapshot(); if (c) proj.brief = c; else delete proj.brief; briefDone = false; closeModal(); commit(); };
    };
    draw();
  }

  /* ------------------------------------------------------------ check & print */
  function closeModal() { $('plModal').hidden = true; canvas.focus(); }
  function modal(html) { $('plMBody').innerHTML = html; $('plModal').hidden = false; const f = $('plModal').querySelector('button:not(.pl-x), a'); if (f) f.focus(); }
  function openPrint() {
    if (!model) return;
    let checks; try { checks = model.check(proj); } catch (e) { checks = [{ level: 'stop', text: 'Something went wrong checking this design.', ids: [] }]; }
    const stop = checks.some(c => c.level === 'stop');
    const whole = stop ? null : model.exportWhole(proj);
    const b = whole && whole.box, size = b ? mm(b.max[0] - b.min[0]) + ' × ' + mm(b.max[1] - b.min[1]) + ' × ' + mm(b.max[2] - Math.min(0, b.min[2])) + ' mm' : '';
    let h = `<h2 id="plMTitle">Check &amp; print</h2><ul class="pl-checks">${checks.map((c, i) => `<li class="${c.level}"><span>${c.level === 'ok' ? '✓' : c.level === 'tip' ? 'i' : '!'}</span><div>${esc(c.text)}${c.ids.length ? ` <button type="button" class="pl-show" data-i="${i}">Show me</button>` : ''}</div></li>`).join('')}</ul>`;
    if (whole) {
      const est = PM.estimateFrom(whole.volume, whole.area);
      h += `<div class="pl-facts"><div><b>${size}</b><small>size</small></div><div><b>about ${est.grams} g</b><small>of plastic</small></div><div><b>${PM.timeText(est.minutes)}</b><small>to print (it depends on the printer)</small></div></div>
        <div class="pl-dl"><button type="button" class="pl-go" id="plSTL">${ic('i-save')} Download for printing (.stl)</button><button type="button" id="pl3MF">${ic('i-save')} Download with colours (.3mf)</button></div>
        <p class="pl-hint">Open the file in your 3D printer’s slicer app (for example Cura, PrusaSlicer or Bambu Studio). It turns your design into layers and tells you how long it will take. Ask a grown-up to start the printer.</p>`;
    }
    modal(h);
    root.querySelectorAll('.pl-show').forEach(btn => btn.onclick = () => { const c = checks[+btn.dataset.i]; closeModal(); select(c.ids.filter(id => byId(id))); setView('fit'); });
    const name = (proj.title || 'my-design').replace(/[^a-z0-9 _-]+/gi, '').trim().replace(/\s+/g, '-').toLowerCase() || 'my-design';
    const dl = (data, ext, type) => { const blob = new Blob([data], { type }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.' + ext; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('Downloaded ' + name + '.' + ext); };
    if (whole) {
      $('plSTL').onclick = () => dl(PM.toSTL([whole]), 'stl', 'model/stl');
      $('pl3MF').onclick = () => dl(PM.to3MF(model.exportParts(proj), proj.title || 'My design'), '3mf', 'model/3mf');
    }
  }
  function showKeys() { modal(`<h2 id="plMTitle">Keyboard shortcuts</h2><table class="pl-keys">${KEYS.map(k => `<tr><td><kbd>${esc(k[0])}</kbd></td><td>${esc(k[1])}</td></tr>`).join('')}</table><p class="pl-hint">Mouse: drag empty space to look around, right-drag to slide the view, scroll to zoom. Touch: one finger looks around, two fingers zoom and slide.</p>`); }

  /* ------------------------------------------------------------ wiring */
  $('plSnap').innerHTML = SNAPS.map(s => `<option value="${s[1]}"${s[1] === snap ? ' selected' : ''}>${s[0]}</option>`).join('');
  $('plSnap').onchange = e => { snap = Number(e.target.value) || 1; inspector(); };
  $('plUndo').onclick = doUndo; $('plRedo').onclick = doRedo; $('plDup').onclick = duplicate; $('plDel').onclick = del;
  $('plGroup').onclick = group; $('plUngroup').onclick = ungroup; $('plDrop').onclick = dropToPlate;
  $('plMeasure').onclick = () => setMeasure(!measure); $('plDraw').onclick = () => model && openDraw(null);
  $('plPrintBtn').onclick = openPrint; $('plKeys').onclick = showKeys; $('plMClose').onclick = closeModal;
  $('plModal').addEventListener('pointerdown', e => { if (e.target === $('plModal')) closeModal(); });
  $('plTitle').onchange = () => { snapshot(); proj.title = $('plTitle').value.slice(0, 60); changed(); };
  root.querySelectorAll('[data-view]').forEach(b => b.onclick = () => setView(b.dataset.view));
  const ro = new ResizeObserver(resize); ro.observe(stage);

  function tick() {
    raf = requestAnimationFrame(tick);
    if (!needs) return; needs = false;
    const dist = camera.position.distanceTo(controls.target); // depth range follows the zoom (no flicker, no clipping)
    camera.near = Math.max(0.5, dist / 60); camera.far = dist * 30 + 2000; camera.updateProjectionMatrix();
    placeHandles(); placeMeasureLabel();
    renderer.render(scene, camera);
  }

  // Start Manifold (WebAssembly) and the font, then show the plate.
  const ready = (async () => {
    const [{ default: Module }, ot, fontBuf] = await Promise.all([
      import(VENDOR + 'manifold.js'), import(VENDOR + 'opentype-2.0.0.min.mjs'),
      fetch(VENDOR + 'Outfit-Bold.ttf').then(r => r.ok ? r.arrayBuffer() : null).catch(() => null)
    ]);
    const M = await Module({ locateFile: f => VENDOR + f }); M.setup();
    let font = null; try { if (fontBuf) font = ot.parse(fontBuf); } catch (e) { /* no text shapes */ }
    if (!alive) return;
    model = PM.createModel(M, { font });
    $('plLoading').hidden = true;
    shapePanel(); afterLoad(); resize(); setView('home');
  })();
  ready.catch(e => { console.warn(e); $('plLoading').textContent = 'The Print Lab needs the internet the first time it opens. Check your connection and try again.'; });
  $('plTitle').value = proj.title || '';
  raf = requestAnimationFrame(tick);

  return {
    getProject() { return clone(proj); },
    setProject(p) {
      proj = PM.cleanProject(p || null); undo = []; redo = []; sel = []; briefDone = false; if (measure) setMeasure(false);
      if (model) { afterLoad(); setView('home'); } else $('plTitle').value = proj.title || '';
      if (!raf) raf = requestAnimationFrame(tick);
    },
    resume() { resize(); needs = true; if (!raf) raf = requestAnimationFrame(tick); },
    pause() { cancelAnimationFrame(raf); raf = 0; if (drag) endDrag(true); },
    destroy() {
      alive = false; cancelAnimationFrame(raf); raf = 0; ro.disconnect(); document.removeEventListener('keydown', onKey);
      for (const v of views.values()) disposeGrp(v.grp); views.clear(); if (model) model.clear();
      controls.dispose(); renderer.dispose(); root.innerHTML = '';
    },
    // test hooks
    _draw: openDraw, _measure: setMeasure, _measurePts: () => measure && measure.pts.slice(), _brief: openBrief, _editBrief: editBrief, _addPart: addPart,
    ready, _pick: (x, y) => { const h = pickHandle(x, y); if (h) return 'handle:' + h.userData.h.kind; const o = pickObj(x, y); return o ? o.object.userData.id : null; }, _proj: () => proj, _model: () => model, _sel: () => sel.slice(), _select: select, _add: addShape, _group: group, _ungroup: ungroup,
    _setView: setView, _open: openPrint, _drop: dropToPlate, _undo: doUndo, _redo: doRedo,
    _screen(p) { const v = toT(p).project(camera), r = canvas.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; },
    _handles: () => handles.map(m => { const e = m.matrix.elements; return { kind: m.userData.h.kind, axis: m.userData.h.axis, sx: m.userData.h.sx, sy: m.userData.h.sy, p: [e[12], e[13], e[14]] }; })
  };
}
