/* CodeJump · 3D World — the runtime: a Babylon.js scene with Havok physics, the commands a pupil's
 * program can call, and the runner. No DOM of its own (the canvas and keyboard come from world-app.js),
 * so it also runs headlessly in Node on a NullEngine for tests.
 *
 *   const world = createWorld(B, { canvas, havok });   // B = vendor/babylon-world.min.js
 *   await world.run(code)   // code = compiled blocks (world-blocks.js compile())
 *   world.stop() · world.key(name, down) · world.tick(dt) · world.dispose()
 *
 * Objects are passed around as TEXT IDS, never as Babylon meshes: `box1 = createBox("box1", {...})`
 * gives box1 the id "box1" (or "box1_2" if that name is taken), and every command looks the object up
 * by id. A command given an id that doesn't exist (deleted, never made) quietly does nothing.
 *
 * Positions are where an object's BOTTOM-CENTRE sits, so y = 0 stands it on the ground. Angles are
 * degrees. Time is scene time: a hidden or paused world doesn't count down waits.
 *
 * Characters and objects (world-assets.js) are glTF files fetched with opts.loadAsset(path) -> ArrayBuffer,
 * loaded once into an AssetContainer and copied for each object. Each one sits inside an invisible box
 * "collider" mesh, which is what moves, collides and gets picked, so every command treats it like a shape.
 * All characters share one skeleton, so an animation file is retargeted onto any character by bone name.
 */

import * as LIB from './world-assets.js';

export const MAX_OBJECTS = 1500;
const DEG = Math.PI / 180;
const STOP = Symbol('w3stop');

export const KEYS = ['space', 'up', 'down', 'left', 'right', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

// KeyboardEvent.key -> our key name
export function keyName(k) {
  if (k === ' ' || k === 'Spacebar') return 'space';
  const m = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[k];
  if (m) return m;
  return typeof k === 'string' && k.length === 1 ? k.toLowerCase() : null;
}

function num(v, d) { v = Number(v); return Number.isFinite(v) ? v : d; }
function clampN(v, lo, hi, d) { return Math.min(hi, Math.max(lo, num(v, d))); }
function hexToRgb(c) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(c || '').trim());
  if (!m) return [0.6, 0.4, 0.8];
  const n = parseInt(m[1], 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}
function safeName(s) {
  s = String(s == null ? '' : s).replace(/[^\w -]/g, '').trim().slice(0, 30);
  return s || 'thing';
}

export function createWorld(B, opts) {
  opts = opts || {};
  const headless = !opts.canvas;
  const engine = opts.engine || (headless ? new B.NullEngine() : new B.Engine(opts.canvas, true, { preserveDrawingBuffer: true, stencil: true }));
  const scene = new B.Scene(engine);
  const onError = opts.onError || (() => {});
  const onPad = opts.onPad || (() => {});
  const fixedStep = !!opts.fixedStep || headless;
  const loadAsset = opts.loadAsset || null;
  // animations blend smoothly into each other (stand still -> walk -> run)
  if (B.AnimationPropertiesOverride) {
    scene.animationPropertiesOverride = new B.AnimationPropertiesOverride();
    scene.animationPropertiesOverride.enableBlending = true;
    scene.animationPropertiesOverride.blendingSpeed = 0.08;
  }

  // ── camera, light, sky, ground ──
  const camera = new B.ArcRotateCamera('cam', -Math.PI / 2, 1.1, 22, new B.Vector3(0, 1, 0), scene);
  camera.lowerRadiusLimit = 3; camera.upperRadiusLimit = 80; camera.upperBetaLimit = Math.PI / 2 - 0.05;
  camera.wheelDeltaPercentage = 0.02; camera.panningSensibility = 0;
  try { camera.inputs.removeByType('ArcRotateCameraKeyboardMoveInput'); } catch (e) { /* arrow keys drive the player, not the camera */ }
  if (opts.canvas) camera.attachControl(opts.canvas, true);
  const hemi = new B.HemisphericLight('hemi', new B.Vector3(0.3, 1, 0.2), scene);
  hemi.intensity = 0.75; hemi.groundColor = new B.Color3(0.35, 0.35, 0.42);
  const sun = new B.DirectionalLight('sun', new B.Vector3(-0.5, -1, -0.35), scene);
  sun.position = new B.Vector3(20, 40, 14); sun.intensity = 0.75;
  let shadows = null;
  if (!headless) {
    // cheap soft shadows (a blurred 2048 map was 6x slower once a few models were in the scene)
    try { shadows = new B.ShadowGenerator(1024, sun); shadows.usePoissonSampling = true; shadows.darkness = 0.35; shadows.bias = 0.0008; } catch (e) { shadows = null; }
  }

  let ground = null, groundAgg = null, groundMat = null;
  function makeGround() {
    ground = B.MeshBuilder.CreateGround('ground', { width: 80, height: 80, subdivisions: 2 }, scene);
    ground.metadata = { w3id: null };
    if (B.GridMaterial && !headless) {
      groundMat = new B.GridMaterial('groundMat', scene);
      groundMat.majorUnitFrequency = 5; groundMat.gridRatio = 1; groundMat.opacity = 0.99;
      groundMat.mainColor = new B.Color3(0.45, 0.72, 0.38); groundMat.lineColor = new B.Color3(0.37, 0.62, 0.31);
    } else {
      groundMat = new B.StandardMaterial('groundMat', scene); groundMat.diffuseColor = new B.Color3(0.45, 0.72, 0.38);
      groundMat.specularColor = new B.Color3(0, 0, 0);
    }
    ground.material = groundMat; ground.receiveShadows = true;
  }
  makeGround();

  // ── physics ──
  let physicsOn = false;
  if (opts.havok) {
    try {
      scene.enablePhysics(new B.Vector3(0, -9.81, 0), new B.HavokPlugin(!fixedStep, opts.havok));
      if (fixedStep) scene.getPhysicsEngine().setTimeStep(1 / 60);
      groundAgg = new B.PhysicsAggregate(ground, B.PhysicsShapeType.BOX, { mass: 0, friction: 0.8, restitution: 0.1 }, scene);
      physicsOn = true;
    } catch (e) { physicsOn = false; }
  }

  // ── run state (all of it is thrown away by stop()) ──
  const objs = new Map();          // id -> {id, name, mesh, kind, size:{w,h,d}, color, phys:'none'|'dynamic'|'static', agg, bounce}
  let run = null;                  // {token, hats:{start,click,key,touch,msg}, frameWaiters, timeWaiters, ...}
  let token = 0, time = 0, timerBase = 0, created = 0, tooMany = false;
  const keysDown = new Set();
  const padKeys = new Set();       // on-screen pad presses
  let follow = null, control = null;

  function isDown(k) { return keysDown.has(k) || padKeys.has(k); }

  function reset() {
    for (const o of objs.values()) disposeObj(o);
    objs.clear();
    scene.clearColor = new B.Color4(0.53, 0.78, 0.95, 1);
    scene.fogMode = B.Scene.FOGMODE_NONE;
    hemi.intensity = 0.75; sun.intensity = 0.75;
    if (groundMat.mainColor) groundMat.mainColor = new B.Color3(0.45, 0.72, 0.38); else groundMat.diffuseColor = new B.Color3(0.45, 0.72, 0.38);
    if (groundMat.lineColor) groundMat.lineColor = new B.Color3(0.37, 0.62, 0.31);
    ground.setEnabled(true);
    if (physicsOn) scene.getPhysicsEngine().setGravity(new B.Vector3(0, -9.81, 0));
    camera.setTarget(new B.Vector3(0, 1, 0)); camera.alpha = -Math.PI / 2; camera.beta = 1.1; camera.radius = 22;
    follow = null; control = null; onPad(false);
    time = 0; timerBase = 0; created = 0; tooMany = false;
  }

  function disposeObj(o) {
    o.gone = true;
    if (!o.mesh) return; // still loading: createModel throws it away when it arrives
    if (o.agg) { try { o.agg.dispose(); } catch (e) { /* already gone */ } o.agg = null; }
    if (shadows) { try { shadows.removeShadowCaster(o.mesh, true); } catch (e) { /* not a caster */ } }
    if (o.inst) {
      for (const k in o.anims) o.anims[k].dispose();
      o.inst.animationGroups.forEach(g => g.dispose());
      o.inst.skeletons.forEach(sk => sk.dispose());
      const mats = new Set(); o.mesh.getChildMeshes(false).forEach(m => { if (m.material) mats.add(m.material); });
      mats.forEach(m => m.dispose()); // the copy's own materials (cloned per object); textures are shared
    }
    try { if (o.mesh.material) o.mesh.material.dispose(); } catch (e) { /* shared */ }
    o.mesh.dispose();
  }

  // ── helpers the commands share ──
  function get(id) { const o = objs.get(String(id)); return o && !o.gone && o.mesh ? o : null; }
  function reserve(name) {
    const base = safeName(name);
    if (!objs.has(base)) return base;
    for (let i = 2; ; i++) if (!objs.has(base + '_' + i)) return base + '_' + i;
  }
  function bounds(o) {
    o.mesh.computeWorldMatrix(true);
    const b = o.mesh.getBoundingInfo().boundingBox;
    return { min: b.minimumWorld, max: b.maximumWorld };
  }
  function touching(a, b, pad) {
    pad = pad == null ? 0.05 : pad;
    const A = bounds(a), Bb = bounds(b);
    return A.min.x - pad < Bb.max.x && A.max.x + pad > Bb.min.x && A.min.y - pad < Bb.max.y && A.max.y + pad > Bb.min.y &&
      A.min.z - pad < Bb.max.z && A.max.z + pad > Bb.min.z;
  }
  function material(color) {
    const m = new B.StandardMaterial('m', scene);
    const [r, g, b] = hexToRgb(color);
    m.diffuseColor = new B.Color3(r, g, b); m.specularColor = new B.Color3(0.12, 0.12, 0.12);
    return m;
  }
  function physShape(o) {
    const T = B.PhysicsShapeType;
    return o.kind === 'sphere' ? T.SPHERE : o.kind === 'capsule' || o.kind === 'character' ? T.CAPSULE : o.kind === 'cylinder' ? T.CYLINDER :
      o.kind === 'cone' ? T.CONVEX_HULL : T.BOX;
  }
  function applyPhysics(o) {
    if (o.agg) { try { o.agg.dispose(); } catch (e) { /* gone */ } o.agg = null; }
    if (!physicsOn || o.phys === 'none' || !o.mesh.isEnabled()) return;
    const mass = o.phys === 'dynamic' ? 1 : 0;
    o.agg = new B.PhysicsAggregate(o.mesh, physShape(o), { mass, friction: 0.6, restitution: o.bounce }, scene);
    if (o === control || o.kind === 'character') uprightBody(o); // characters never topple over
  }
  function uprightBody(o) {
    if (!o.agg) return;
    try { o.agg.body.setMassProperties({ inertia: new B.Vector3(0, 0, 0) }); } catch (e) { /* older plugin */ }
    o.agg.body.disablePreStep = false; // the body follows the mesh when the player turns it
  }
  // after moving/turning a physics object by hand, let the body jump to the mesh for one step
  function syncBody(o) {
    if (!o.agg) return;
    o.agg.body.disablePreStep = false;
    if (o !== control) o._resync = true;
  }
  function quat(o) {
    if (!o.mesh.rotationQuaternion) o.mesh.rotationQuaternion = B.Quaternion.FromEulerAngles(o.mesh.rotation.x, o.mesh.rotation.y, o.mesh.rotation.z);
    return o.mesh.rotationQuaternion;
  }

  function create(kind, name, p) {
    if (objs.size >= MAX_OBJECTS) {
      if (!tooMany) { tooMany = true; onError('That’s a lot of objects! A world can hold ' + MAX_OBJECTS + ' at once.'); }
      return null;
    }
    const id = reserve(name);
    const w = clampN(p.w, 0.05, 100, 1), h = clampN(p.h, 0.05, 100, 1), d = clampN(p.d, 0.05, 100, 1);
    let mesh;
    const M = B.MeshBuilder;
    if (kind === 'sphere') mesh = M.CreateSphere(id, { diameterX: w, diameterY: h, diameterZ: d, segments: 24 }, scene);
    else if (kind === 'cylinder') mesh = M.CreateCylinder(id, { height: h, diameter: w, tessellation: 32 }, scene);
    else if (kind === 'cone') mesh = M.CreateCylinder(id, { height: h, diameterTop: 0, diameterBottom: w, tessellation: 32 }, scene);
    else if (kind === 'capsule') mesh = M.CreateCapsule(id, { height: Math.max(h, w), radius: w / 2, tessellation: 24 }, scene);
    else { kind = 'box'; mesh = M.CreateBox(id, { width: w, height: h, depth: d }, scene); }
    // bottom-centre pivot: y = 0 stands on the ground
    const hh = kind === 'capsule' ? Math.max(h, w) / 2 : h / 2;
    mesh.bakeTransformIntoVertices(B.Matrix.Translation(0, hh, 0));
    mesh.position.set(num(p.x, 0), num(p.y, 0), num(p.z, 0));
    mesh.rotationQuaternion = B.Quaternion.Identity();
    mesh.material = material(p.color);
    mesh.metadata = { w3id: id };
    if (shadows) shadows.addShadowCaster(mesh);
    mesh.receiveShadows = true;
    const o = { id, name: safeName(name), mesh, kind, size: { w, h, d }, color: p.color, phys: 'none', agg: null, bounce: 0.2 };
    objs.set(id, o);
    created++;
    return id;
  }

  // ── characters and objects ──
  const containers = new Map(); // file -> Promise<AssetContainer>, kept for the whole session
  let pending = 0;
  function loading(d) { pending += d; if (opts.onLoading) opts.onLoading(pending); }
  function container(file) {
    if (!containers.has(file)) {
      const pr = (async () => {
        if (!loadAsset) throw new Error('no asset loader');
        loading(1);
        try {
          const buf = await loadAsset(file);
          return await B.LoadAssetContainerAsync(new Uint8Array(buf), scene, { pluginExtension: '.glb', pluginOptions: { gltf: { animationStartMode: 0 } } });
        } finally { loading(-1); }
      })();
      pr.catch(() => containers.delete(file)); // try again next time (e.g. back online)
      containers.set(file, pr);
    }
    return containers.get(file);
  }

  async function createModel(r, kind, model, name, p) {
    const lib = kind === 'character' ? LIB.CHARACTERS : LIB.OBJECTS;
    if (!lib.some(c => c[0] === model)) model = lib[0][0];
    if (objs.size >= MAX_OBJECTS) return create('box', name, p);
    const id = reserve(name);
    const o = { id, name: safeName(name), mesh: null, kind, model, size: null, color: null, phys: 'none', agg: null, bounce: 0.2, anims: {}, nodes: null };
    objs.set(id, o); // holds the name while the file loads; get() ignores it until o.mesh is set
    let cont;
    try { cont = await container(kind === 'character' ? LIB.characterFile(model) : LIB.objectFile(model)); } catch (e) {
      objs.delete(id);
      if (r.stopped || r !== run) throw STOP;
      onError('Couldn’t load the ' + model + ' model (are you online?), so it’s a box for now.');
      return create('box', name, p);
    }
    if (r.stopped || r !== run || o.gone) { objs.delete(id); throw STOP; }
    const inst = cont.instantiateModelsToScene(n => n, true, { doNotInstantiate: true });
    inst.skeletons.forEach(sk => { sk.useTextureToStoreBoneMatrices = true; }); // 155 bones: too many for vertex uniforms on some tablets
    const root = inst.rootNodes[0];
    const holder = new B.TransformNode(id + '_model', scene);
    for (const n of inst.rootNodes) n.parent = holder;
    const sc = clampN(p.scale, 0.05, 20, 1);
    holder.scaling.set(sc, sc, sc);
    holder.computeWorldMatrix(true);
    const bb = holder.getHierarchyBoundingVectors(true);
    const h = Math.max(0.05, bb.max.y - bb.min.y);
    // characters are measured in their T-pose, so give them a body-sized box instead of the arm span
    const w = kind === 'character' ? h * 0.32 : Math.max(0.05, bb.max.x - bb.min.x);
    const d = kind === 'character' ? h * 0.32 : Math.max(0.05, bb.max.z - bb.min.z);
    const mesh = B.MeshBuilder.CreateBox(id, { width: w, height: h, depth: d }, scene);
    mesh.bakeTransformIntoVertices(B.Matrix.Translation(0, h / 2, 0));
    mesh.isVisible = false;
    mesh.rotationQuaternion = B.Quaternion.Identity();
    mesh.metadata = { w3id: id };
    holder.parent = mesh;
    holder.position.set(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
    if (kind === 'character') holder.position.x = holder.position.z = 0; // keep the feet on the box's centre
    mesh.position.set(num(p.x, 0), num(p.y, 0), num(p.z, 0));
    holder.getChildMeshes(false).forEach(m => { m.isPickable = true; m.receiveShadows = true; });
    if (shadows) holder.getChildMeshes(false).forEach(m => shadows.addShadowCaster(m, false)); // meshes only: a TransformNode breaks the shadow pass
    Object.assign(o, { mesh, inst, root, holder, size: { w, h, d } });
    if (kind === 'character') {
      o.nodes = {}; for (const n of holder.getDescendants(false)) if (!o.nodes[n.name]) o.nodes[n.name] = n;
      if (p.colors) for (const part in p.colors) setPart(o, part, p.colors[part]);
      playAnim(o, 'Idle', 'loop').catch(() => {});
    }
    created++;
    return id;
  }

  function materials(o, part) {
    const mats = new Set();
    o.holder.getChildMeshes(false).forEach(m => { if (m.material && (!part || LIB.partOfMaterial(m.material.name) === part)) mats.add(m.material); });
    return mats;
  }
  function paint(mat, c) {
    const [x, y, z] = hexToRgb(c), col = new B.Color3(x, y, z);
    if ('albedoColor' in mat) { mat.albedoColor = col; mat.albedoTexture = null; } else { mat.diffuseColor = col; mat.diffuseTexture = null; }
  }
  function setPart(o, part, c) { if (o.holder && c) materials(o, part).forEach(m => paint(m, c)); }

  async function playAnim(o, name, mode) {
    if (!o.nodes || !LIB.isAnimation(name)) return;
    let g = o.anims[name];
    if (!g) {
      const cont = await container(LIB.animationFile(name));
      if (o.gone) return;
      g = o.anims[name];
      if (!g) {
        const src = cont.animationGroups[0];
        g = new B.AnimationGroup(o.id + '.' + name, scene);
        if (src) for (const ta of src.targetedAnimations) {
          const t = o.nodes[ta.target && ta.target.name];
          if (t && ta.animation.targetProperty !== 'scaling') g.addTargetedAnimation(ta.animation, t);
        }
        o.anims[name] = g;
      }
    }
    if (o.gone) return;
    if (o.cur && o.cur !== g) o.cur.stop();
    o.cur = g; o.curName = name;
    g.stop(); g.start(mode === 'loop', 1);
    if (mode === 'loop') return;
    // a one-off animation goes back to standing still when it finishes (unless something else has started)
    await new Promise(res => g.onAnimationGroupEndObservable.addOnce(() => res()));
    if (!o.gone && o.cur === g && name !== 'Idle') { o.autoName = 'Idle'; playAnim(o, 'Idle', 'loop').catch(() => {}); }
  }

  // ── frame clock ──
  function nextFrame() {
    const r = run;
    return new Promise(res => { if (r && !r.stopped) r.frameWaiters.push(res); });
  }
  function after(secs) {
    const r = run;
    const at = time + Math.max(0, num(secs, 0));
    return new Promise(res => { if (r && !r.stopped) r.timeWaiters.push({ at, res }); });
  }
  function alive(r) { if (!r || r.stopped || r !== run) throw STOP; }

  // run a pupil's handler, reporting mistakes without stopping the rest of the world
  async function guarded(r, fn, ...args) {
    try { await fn(...args); } catch (e) {
      if (e === STOP || r.stopped) return;
      r.errors++;
      if (r.errors <= 3) onError(friendly(e));
    }
  }
  function friendly(e) {
    const m = String((e && e.message) || e || '');
    if (/is not defined/.test(m)) return 'Something in your blocks is missing a value: ' + m;
    return 'Oops — a block went wrong: ' + m;
  }

  // ── the commands a pupil's program can call (the generated code calls these by name) ──
  function makeApi(r) {
    const A = {};
    const obj = id => (r.stopped ? null : get(id));

    // scene
    A.setSky = c => { const [x, y, z] = hexToRgb(c); scene.clearColor = new B.Color4(x, y, z, 1); if (scene.fogMode) scene.fogColor = new B.Color3(x, y, z); };
    A.setGround = c => {
      const [x, y, z] = hexToRgb(c);
      if (groundMat.mainColor) { groundMat.mainColor = new B.Color3(x, y, z); groundMat.lineColor = new B.Color3(x * 0.85, y * 0.85, z * 0.85); } else groundMat.diffuseColor = new B.Color3(x, y, z);
    };
    A.setFog = amount => {
      amount = clampN(amount, 0, 100, 0);
      if (!amount) { scene.fogMode = B.Scene.FOGMODE_NONE; return; }
      scene.fogMode = B.Scene.FOGMODE_EXP2; scene.fogDensity = amount / 1500;
      const c = scene.clearColor; scene.fogColor = new B.Color3(c.r, c.g, c.b);
    };
    A.setBrightness = amount => { const k = clampN(amount, 0, 200, 100) / 100; hemi.intensity = 0.75 * k; sun.intensity = 0.75 * k; };
    A.setGravity = g => { if (physicsOn) scene.getPhysicsEngine().setGravity(new B.Vector3(0, -clampN(g, 0, 50, 9.81), 0)); };

    // making things
    A.createBox = (name, p) => create('box', name, p || {});
    A.createSphere = (name, p) => create('sphere', name, p || {});
    A.createCylinder = (name, p) => create('cylinder', name, p || {});
    A.createCone = (name, p) => create('cone', name, p || {});
    A.createCapsule = (name, p) => create('capsule', name, p || {});
    A.createCharacter = async (name, p) => { alive(r); const id = await createModel(r, 'character', p && p.model, name, p || {}); alive(r); return id; };
    A.createObject = async (name, p) => { alive(r); const id = await createModel(r, 'object', p && p.model, name, p || {}); alive(r); return id; };
    A.playAnimation = async (id, name, mode) => {
      const o = obj(id); if (!o || o.kind !== 'character') return;
      o.userAnim = true; o.autoName = null;
      const m = mode === 'wait' ? 'wait' : mode === 'once' ? 'once' : 'loop';
      try {
        const done = playAnim(o, String(name), m);
        if (m === 'once') { done.catch(() => {}); return; } // starts it without waiting for the end
        await done;
      } catch (e) { onError('Couldn’t load the ' + name + ' animation (are you online?)'); }
      alive(r);
    };
    A.stopAnimation = id => { const o = obj(id); if (o && o.cur) { o.cur.stop(); o.cur = null; o.curName = null; o.userAnim = true; } };
    A.setPartColor = (id, part, c) => { const o = obj(id); if (o && o.kind === 'character') setPart(o, String(part), c); };
    A.destroy = id => { const o = obj(id); if (!o) return; if (control === o) { control = null; onPad(false); } if (follow === o) follow = null; disposeObj(o); objs.delete(o.id); };

    // moving
    A.moveBy = (id, x, y, z) => { const o = obj(id); if (!o) return; o.mesh.position.addInPlaceFromFloats(num(x, 0), num(y, 0), num(z, 0)); syncBody(o); };
    A.moveTo = (id, x, y, z) => {
      const o = obj(id); if (!o) return;
      o.mesh.position.set(num(x, 0), num(y, 0), num(z, 0));
      if (o.agg && o.phys === 'dynamic') { o.agg.body.setLinearVelocity(B.Vector3.Zero()); o.agg.body.setAngularVelocity(B.Vector3.Zero()); }
      syncBody(o);
    };
    A.glideTo = async (id, x, y, z, secs) => {
      const o = obj(id); if (!o) return;
      const from = o.mesh.position.clone(), to = new B.Vector3(num(x, 0), num(y, 0), num(z, 0));
      const dur = clampN(secs, 0, 600, 1), t0 = time;
      if (o.agg && o.phys === 'dynamic') o.agg.body.setMotionType(B.PhysicsMotionType.ANIMATED);
      while (true) {
        alive(r);
        if (o.gone) return;
        const t = dur ? Math.min(1, (time - t0) / dur) : 1;
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        B.Vector3.LerpToRef(from, to, e, o.mesh.position); syncBody(o);
        if (t >= 1) break;
        await nextFrame();
      }
      if (o.agg && o.phys === 'dynamic') o.agg.body.setMotionType(B.PhysicsMotionType.DYNAMIC);
    };
    A.turnBy = (id, x, y, z) => {
      const o = obj(id); if (!o) return;
      const q = B.Quaternion.FromEulerAngles(num(x, 0) * DEG, num(y, 0) * DEG, num(z, 0) * DEG);
      o.mesh.rotationQuaternion = q.multiply(quat(o)); syncBody(o);
    };
    A.turnTo = (id, x, y, z) => { const o = obj(id); if (!o) return; o.mesh.rotationQuaternion = B.Quaternion.FromEulerAngles(num(x, 0) * DEG, num(y, 0) * DEG, num(z, 0) * DEG); syncBody(o); };
    A.face = (id, other) => {
      const o = obj(id), t = obj(other); if (!o || !t || o === t) return;
      const d = t.mesh.position.subtract(o.mesh.position);
      o.mesh.rotationQuaternion = B.Quaternion.FromEulerAngles(0, Math.atan2(d.x, d.z), 0); syncBody(o);
    };
    A.resize = (id, w, h, d) => {
      const o = obj(id); if (!o) return;
      const nw = clampN(w, 0.05, 100, o.size.w), nh = clampN(h, 0.05, 100, o.size.h), nd = clampN(d, 0.05, 100, o.size.d);
      o.mesh.scaling.set(nw / o.size.w, nh / o.size.h, nd / o.size.d);
      if (o.agg) applyPhysics(o);
    };

    // looks
    A.setColor = (id, c) => {
      const o = obj(id); if (!o) return;
      o.color = c;
      if (o.kind === 'character') return setPart(o, 'tshirt', c);
      if (o.holder) return materials(o).forEach(m => paint(m, c));
      const [x, y, z] = hexToRgb(c); o.mesh.material.diffuseColor = new B.Color3(x, y, z);
    };
    A.show = id => { const o = obj(id); if (!o || o.mesh.isEnabled()) return; o.mesh.setEnabled(true); if (o.phys !== 'none') applyPhysics(o); };
    A.hide = id => { const o = obj(id); if (!o) return; o.mesh.setEnabled(false); if (o.agg) { o.agg.dispose(); o.agg = null; } };

    // physics
    A.setPhysics = (id, kind) => {
      const o = obj(id); if (!o) return;
      o.phys = kind === 'dynamic' || kind === 'static' ? kind : 'none';
      applyPhysics(o);
    };
    A.setBounce = (id, amount) => { const o = obj(id); if (!o) return; o.bounce = clampN(amount, 0, 100, 20) / 100; if (o.agg) o.agg.shape.material = { friction: 0.6, restitution: o.bounce }; };
    A.push = (id, x, y, z) => {
      const o = obj(id); if (!o || !o.agg || o.phys !== 'dynamic') return;
      o.agg.body.applyImpulse(new B.Vector3(num(x, 0), num(y, 0), num(z, 0)), o.mesh.getAbsolutePosition());
    };
    A.setVelocity = (id, x, y, z) => { const o = obj(id); if (!o || !o.agg || o.phys !== 'dynamic') return; o.agg.body.setLinearVelocity(new B.Vector3(num(x, 0), num(y, 0), num(z, 0))); };

    // game controls + camera
    A.control = (id, speed) => {
      const o = obj(id); if (!o) return;
      control = o; o.speed = clampN(speed, 0, 50, 5); uprightBody(o); onPad(true);
    };
    A.follow = id => { const o = obj(id); if (o) follow = o; };

    // events (hats) — handlers are kept for this run only
    A.__start = fn => r.hats.start.push(fn);
    A.__forever = async fn => { while (true) { alive(r); await fn(); alive(r); await nextFrame(); } };
    A.__onClick = (getId, fn) => r.hats.click.push({ getId, fn, busy: false });
    A.__onKey = (key, fn) => r.hats.key.push({ key: String(key), fn, busy: false });
    A.__onTouch = (getA, getB, fn) => r.hats.touch.push({ getA, getB, fn, busy: false, was: false });
    A.__onMessage = (msg, fn) => r.hats.msg.push({ msg: String(msg).trim().toLowerCase(), fn });
    A.broadcast = msg => { fireMessage(r, msg); };
    A.broadcastAndWait = async msg => { await Promise.all(fireMessage(r, msg)); };
    A.stopAll = () => { stop(); throw STOP; };

    // control
    A.wait = async secs => { alive(r); await after(secs); alive(r); };
    A.__yield = async () => { alive(r); await nextFrame(); alive(r); };

    // sensing
    A.getX = id => { const o = obj(id); return o ? round(o.mesh.position.x) : 0; };
    A.getY = id => { const o = obj(id); return o ? round(o.mesh.position.y) : 0; };
    A.getZ = id => { const o = obj(id); return o ? round(o.mesh.position.z) : 0; };
    A.distance = (a, b) => { const p = obj(a), q = obj(b); return p && q ? round(B.Vector3.Distance(p.mesh.position, q.mesh.position)) : 0; };
    A.touching = (a, b) => {
      const p = obj(a); if (!p || !p.mesh.isEnabled()) return false;
      if (b === '__ground') return bounds(p).min.y <= 0.06;
      const q = obj(b); return !!(q && q !== p && q.mesh.isEnabled() && touching(p, q));
    };
    A.keyDown = k => (k === 'any' ? keysDown.size + padKeys.size > 0 : isDown(String(k)));
    A.timer = () => round(time - timerBase);
    A.resetTimer = () => { timerBase = time; };
    A.random = (a, b) => {
      a = num(a, 0); b = num(b, 0); if (a > b) [a, b] = [b, a];
      return Number.isInteger(a) && Number.isInteger(b) ? Math.floor(Math.random() * (b - a + 1)) + a : Math.random() * (b - a) + a;
    };
    return A;
  }
  function round(v) { return Math.round(v * 100) / 100; }

  function fireMessage(r, msg) {
    const m = String(msg).trim().toLowerCase(), out = [];
    for (const h of r.hats.msg) if (h.msg === m) out.push(guarded(r, h.fn));
    return out;
  }

  // ── running a program ──
  // The code is compiled from blocks (world-blocks.js), whose generators quote every piece of text, so it
  // can only call the commands above. It still runs in strict mode with the page's globals hidden.
  const HIDDEN = ['window', 'self', 'globalThis', 'document', 'parent', 'top', 'frames', 'opener', 'location', 'navigator',
    'fetch', 'XMLHttpRequest', 'WebSocket', 'localStorage', 'sessionStorage', 'indexedDB', 'Function',
    'importScripts', 'Worker', 'setTimeout', 'setInterval'];

  async function runCode(code) {
    stop();
    reset();
    const r = run = { token: ++token, stopped: false, errors: 0, hats: { start: [], click: [], key: [], touch: [], msg: [] }, frameWaiters: [], timeWaiters: [] };
    const api = makeApi(r);
    const names = Object.keys(api);
    let fn;
    try {
      const AsyncFunction = Object.getPrototypeOf(async function () { /* */ }).constructor;
      fn = new AsyncFunction(...names, ...HIDDEN, '"use strict";\n' + code);
    } catch (e) {
      onError('Your program couldn’t start: ' + e.message);
      return false;
    }
    await guarded(r, () => fn(...names.map(n => api[n])));
    if (r.stopped) return false;
    for (const h of r.hats.start) guarded(r, h);
    return true;
  }

  function stop() {
    if (!run) return;
    run.stopped = true;
    run.frameWaiters.length = 0; run.timeWaiters.length = 0; // their awaits never resume; the closures are let go
    run = null;
    control = null; onPad(false);
    keysDown.clear(); padKeys.clear();
  }

  // ── each frame ──
  const fwd = new B.Vector3(), right = new B.Vector3(), FORWARD = new B.Vector3(0, 0, 1);
  function beforeFrame(dt) {
    time += dt;
    const r = run;
    if (r && !r.stopped) {
      // timers then frame waits
      if (r.timeWaiters.length) {
        const due = r.timeWaiters.filter(w => w.at <= time + 1e-9);
        if (due.length) { r.timeWaiters = r.timeWaiters.filter(w => w.at > time + 1e-9); due.forEach(w => w.res()); }
      }
      const fw = r.frameWaiters; r.frameWaiters = []; fw.forEach(f => f());
      // touches (edge-triggered: fires once each time two things come together)
      for (const h of r.hats.touch) {
        let now = false;
        try {
          const a = get(h.getA()), bId = h.getB();
          if (a && a.mesh.isEnabled()) {
            if (bId === '__ground') now = bounds(a).min.y <= 0.06;
            else { const b = get(bId); now = !!(b && b !== a && b.mesh.isEnabled() && touching(a, b)); }
          }
        } catch (e) { now = false; }
        if (now && !h.was && !h.busy) { h.busy = true; guarded(r, h.fn).then(() => { h.busy = false; }); }
        h.was = now;
      }
    }
    // player control
    if (control && !control.gone) {
      const o = control, sp = o.speed;
      let ix = 0, iz = 0;
      if (isDown('up') || isDown('w')) iz += 1;
      if (isDown('down') || isDown('s')) iz -= 1;
      if (isDown('left') || isDown('a')) ix -= 1;
      if (isDown('right') || isDown('d')) ix += 1;
      camera.getDirectionToRef(FORWARD, fwd); fwd.y = 0; fwd.normalize();
      right.set(fwd.z, 0, -fwd.x);
      let vx = (fwd.x * iz + right.x * ix) * sp, vz = (fwd.z * iz + right.z * ix) * sp;
      if (ix && iz) { vx *= Math.SQRT1_2; vz *= Math.SQRT1_2; }
      if (ix || iz) o.mesh.rotationQuaternion = B.Quaternion.FromEulerAngles(0, Math.atan2(vx, vz), 0);
      if (o.kind === 'character') autoAnimate(o, ix || iz, sp);
      if (o.agg && o.phys === 'dynamic') {
        const v = o.agg.body.getLinearVelocity();
        let vy = v.y;
        if (isDown('space') && grounded(o)) vy = Math.sqrt(2 * 9.81 * 1.6);
        o.agg.body.setLinearVelocity(new B.Vector3(vx, vy, vz));
        o.agg.body.setAngularVelocity(B.Vector3.Zero());
      } else {
        o.mesh.position.x += vx * dt; o.mesh.position.z += vz * dt;
        if (o.agg) o.agg.body.disablePreStep = false;
      }
    }
    if (follow && !follow.gone) {
      const p = follow.mesh.position, t = camera.target;
      camera.setTarget(new B.Vector3(t.x + (p.x - t.x) * 0.12, t.y + (p.y + 1 - t.y) * 0.12, t.z + (p.z - t.z) * 0.12));
    }
  }
  // a controlled character walks, runs, stands and floats by itself, until the program plays its own animation
  function autoAnimate(o, moving, speed) {
    if (moving) o.userAnim = false;
    if (o.userAnim) return;
    let air = false;
    if (o.agg && o.phys === 'dynamic') air = Math.abs(o.agg.body.getLinearVelocity().y) > 1.2 && !grounded(o);
    const want = air ? 'JumpIdle' : moving ? (speed >= 7 ? 'Run' : 'Walk') : 'Idle';
    if (want !== o.autoName) { o.autoName = want; playAnim(o, want, 'loop').catch(() => {}); }
  }
  function afterFrame() {
    for (const o of objs.values()) if (o._resync && o.agg) { o._resync = false; o.agg.body.disablePreStep = true; }
  }
  function grounded(o) {
    const b = bounds(o);
    if (b.min.y <= 0.08) return true;
    const ray = new B.Ray(new B.Vector3(o.mesh.position.x, b.min.y + 0.05, o.mesh.position.z), new B.Vector3(0, -1, 0), 0.2);
    const hit = scene.pickWithRay(ray, m => m !== o.mesh && m.isEnabled() && m.isPickable && !(o.holder && m.isDescendantOf(o.holder)));
    return !!(hit && hit.hit);
  }

  function frame(dt) {
    beforeFrame(dt);
    scene.render();
    afterFrame();
  }

  // ── input from the app ──
  function key(name, down) {
    if (!name) return;
    if (down) {
      if (keysDown.has(name)) return;
      keysDown.add(name);
      const r = run; if (!r) return;
      for (const h of r.hats.key) if ((h.key === name || h.key === 'any') && !h.busy) { h.busy = true; guarded(r, h.fn).then(() => { h.busy = false; }); }
    } else keysDown.delete(name);
  }
  function pad(name, down) { if (down) { padKeys.add(name); key(name, true); keysDown.delete(name); } else padKeys.delete(name); }
  function click(id) {
    const r = run; if (!r || id == null) return;
    for (const h of r.hats.click) {
      let target; try { target = h.getId(); } catch (e) { target = null; }
      if (target === id && !h.busy) { h.busy = true; guarded(r, h.fn).then(() => { h.busy = false; }); }
    }
  }
  if (!headless) {
    scene.onPointerObservable.add(pi => {
      if (pi.type !== B.PointerEventTypes.POINTERPICK) return;
      let m = pi.pickInfo && pi.pickInfo.pickedMesh;
      while (m && !(m.metadata && m.metadata.w3id) && m.parent) m = m.parent;
      if (m && m.metadata && m.metadata.w3id) click(m.metadata.w3id);
    });
  }

  // ── render loop (browser) ──
  let looping = false, last = 0;
  function startLoop() {
    if (looping || headless) return;
    looping = true; last = 0;
    engine.runRenderLoop(() => {
      const now = performance.now();
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
      last = now;
      frame(dt);
    });
  }
  function pauseLoop() { if (!looping) return; looping = false; engine.stopRenderLoop(); }

  reset();

  return {
    scene, engine, camera, B,
    run: runCode, stop, reset, key, pad, click,
    tick: (dt) => frame(dt == null ? 1 / 60 : dt),
    start: startLoop, pause: pauseLoop,
    resize: () => { try { engine.resize(); } catch (e) { /* hidden */ } },
    running: () => !!run,
    objects: () => [...objs.values()].filter(o => o.mesh).map(o => ({ id: o.id, kind: o.kind, x: round(o.mesh.position.x), y: round(o.mesh.position.y), z: round(o.mesh.position.z), phys: o.phys, visible: o.mesh.isEnabled() })),
    dispose: () => { stop(); pauseLoop(); scene.dispose(); engine.dispose(); }
  };
}
