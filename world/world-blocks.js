/* CodeJump · 3D World — the blocks: definitions, toolbox, the starter program, and the compiler that turns
 * a workspace into the async JavaScript world-runtime.js runs.
 *
 *   defineBlocks(Blockly, gen, Order) // gen, Order = Blockly's javascriptGenerator and its Order
 *   compile(Blockly, gen, workspace)  // -> code string
 *
 * Each hat block becomes a registration call (__start, __onClick, …) and only hats are compiled, so a
 * loose block lying on the workspace does nothing. Every loop gets `await __yield()` (Blockly's loop trap)
 * so loops run one pass per frame and can't freeze the page. Text in fields is always quoted by the
 * generator, so the code can only call the runtime's commands.
 */
import { KEYS } from './world-runtime.js';
import * as LIB from './world-assets.js';
import { SOUNDS, NOTES } from './world-sound.js';

const THUMB = name => new URL('./assets/thumbs/' + name + '.png', import.meta.url).href;
// picture dropdowns for the model library (text for the few models without a picture)
const pics = list => () => list.map(([id, label]) => LIB.THUMBLESS.includes(id) ? [label, id] : [{ src: THUMB(id), width: 44, height: 44, alt: label }, id]);

// blocks that make an object: the edit view links each object back to one of these
export const MAKERS = ['w3_box', 'w3_sphere', 'w3_cylinder', 'w3_cone', 'w3_capsule', 'w3_character', 'w3_object'];

export const HATS = ['w3_when_run', 'w3_when_clicked', 'w3_when_key', 'w3_when_touch', 'w3_when_touch_ground', 'w3_when_receive'];

const C = {
  sound: '#c45fc4', camera: '#5b6abf',
  scene: '#2f9e8f', shapes: '#d1477a', characters: '#b5487f', models: '#7a8f2f', events: '#e6a700', motion: '#4c7fe0', looks: '#8a5fd6',
  physics: '#d0603a', game: '#1597b8', control: '#e08a1e', sensing: '#3aa0c9', ops: '#4caf50'
};

// Default values for every number/colour socket, shared by the toolbox and the starter program.
const DEF = {
  w3_sky: { COLOR: '#87c7f2' }, w3_ground: { COLOR: '#74b85f' }, w3_fog: { AMOUNT: 20 }, w3_brightness: { AMOUNT: 100 },
  w3_gravity: { AMOUNT: 10 },
  w3_box: { COLOR: '#e0457b', W: 1, H: 1, D: 1, X: 0, Y: 0, Z: 0 },
  w3_sphere: { COLOR: '#f2b61d', W: 1, X: 0, Y: 0, Z: 0 },
  w3_cylinder: { COLOR: '#4c7fe0', W: 1, H: 2, X: 0, Y: 0, Z: 0 },
  w3_cone: { COLOR: '#ff7b1f', W: 1, H: 1.5, X: 0, Y: 0, Z: 0 },
  w3_capsule: { COLOR: '#8a5fd6', W: 0.8, H: 2, X: 0, Y: 0, Z: 0 },
  w3_move_by: { X: 0, Y: 0, Z: 1 }, w3_move_to: { X: 0, Y: 0, Z: 0 }, w3_glide_to: { X: 0, Y: 0, Z: 5, SECS: 1 },
  w3_turn_by: { X: 0, Y: 45, Z: 0 }, w3_turn_to: { X: 0, Y: 0, Z: 0 }, w3_resize: { W: 2, H: 2, D: 2 },
  w3_set_colour: { COLOR: '#2dc653' },
  w3_bounce: { AMOUNT: 50 }, w3_push: { X: 0, Y: 5, Z: 0 }, w3_velocity: { X: 0, Y: 0, Z: 3 },
  w3_control: { SPEED: 5 },
  // { text } = a text socket (strings on their own are colours)
  w3_say: { TEXT: { text: 'Hello!' } }, w3_say_for: { TEXT: { text: 'Hello!' }, SECS: 2 }, w3_show_text: { TEXT: { text: 'Score: 0' } },
  w3_speak: { TEXT: { text: 'Hello!' } }, w3_play_note: { SECS: 0.5 }, w3_set_volume: { AMOUNT: 80 },
  w3_camera_zoom: { AMOUNT: 15 }, w3_camera_look: { X: 0, Y: 0, Z: 0 }, w3_grip: { AMOUNT: 60 }, w3_weight: { AMOUNT: 1 },
  w3_character: { SCALE: 1, X: 0, Y: 0, Z: 0 }, w3_object: { SCALE: 1, X: 3, Y: 0, Z: 0 }, w3_char_colour: { COLOR: '#2dc653' },
  w3_wait: { SECS: 1 }, controls_repeat_ext: { TIMES: 10 },
  w3_random: { A: 1, B: 10 }
};

const KEY_OPTS = () => KEYS.map(k => [k === 'space' ? 'space' : k.length > 1 ? k + ' arrow' : k, k]);
const OBJ = (name, def) => ({ type: 'field_variable', name, variable: def || 'box1' });
const NUMIN = name => ({ type: 'input_value', name, check: null });

function def(type, colour, lines, extra) {
  const j = Object.assign({ type, colour, inputsInline: true, tooltip: extra && extra.tooltip || '' }, extra || {});
  lines.forEach((l, i) => {
    let msg = l[0], args = (l[1] || []).slice();
    // a multi-line block wraps after each line (except before a statement input, which starts its own row)
    const nextIsStatement = lines[i + 1] && (lines[i + 1][1] || []).some(a => a.type === 'input_statement');
    if (i < lines.length - 1 && !nextIsStatement) { msg += ' %' + (args.length + 1); args.push({ type: 'input_end_row' }); }
    j['message' + i] = msg; j['args' + i] = args;
  });
  return j;
}
const stmt = { previousStatement: null, nextStatement: null };
const hat = (body) => ({ hat: true, args: body });

function blockDefs() {
  const S = Object.assign;
  return [
    // ── Scene ──
    def('w3_sky', C.scene, [['sky colour %1', [NUMIN('COLOR')]]], S({ tooltip: 'Paint the sky' }, stmt)),
    def('w3_ground', C.scene, [['ground colour %1', [NUMIN('COLOR')]]], S({ tooltip: 'Paint the ground' }, stmt)),
    def('w3_fog', C.scene, [['fog %1', [NUMIN('AMOUNT')]]], S({ tooltip: 'Add fog: 0 = none, 100 = very thick' }, stmt)),
    def('w3_brightness', C.scene, [['brightness %1 %%', [NUMIN('AMOUNT')]]], S({ tooltip: 'How bright the light is (100 = normal)' }, stmt)),
    def('w3_gravity', C.scene, [['gravity %1', [NUMIN('AMOUNT')]]], S({ tooltip: 'How strongly things fall (10 = like Earth, 0 = space)' }, stmt)),

    // ── Shapes (each makes an object and puts it in a variable) ──
    def('w3_box', C.shapes, [['make box %1 colour %2', [OBJ('VAR', 'box1'), NUMIN('COLOR')]], ['width %1 height %2 depth %3', [NUMIN('W'), NUMIN('H'), NUMIN('D')]], ['at x %1 y %2 z %3', [NUMIN('X'), NUMIN('Y'), NUMIN('Z')]]],
      S({ tooltip: 'Make a box. Its name goes in a variable so other blocks can use it.' }, stmt)),
    def('w3_sphere', C.shapes, [['make ball %1 colour %2 size %3', [OBJ('VAR', 'ball1'), NUMIN('COLOR'), NUMIN('W')]], ['at x %1 y %2 z %3', [NUMIN('X'), NUMIN('Y'), NUMIN('Z')]]],
      S({ tooltip: 'Make a ball' }, stmt)),
    def('w3_cylinder', C.shapes, [['make cylinder %1 colour %2', [OBJ('VAR', 'cylinder1'), NUMIN('COLOR')]], ['width %1 height %2', [NUMIN('W'), NUMIN('H')]], ['at x %1 y %2 z %3', [NUMIN('X'), NUMIN('Y'), NUMIN('Z')]]],
      S({ tooltip: 'Make a cylinder' }, stmt)),
    def('w3_cone', C.shapes, [['make cone %1 colour %2', [OBJ('VAR', 'cone1'), NUMIN('COLOR')]], ['width %1 height %2', [NUMIN('W'), NUMIN('H')]], ['at x %1 y %2 z %3', [NUMIN('X'), NUMIN('Y'), NUMIN('Z')]]],
      S({ tooltip: 'Make a cone' }, stmt)),
    def('w3_capsule', C.shapes, [['make capsule %1 colour %2', [OBJ('VAR', 'player'), NUMIN('COLOR')]], ['width %1 height %2', [NUMIN('W'), NUMIN('H')]], ['at x %1 y %2 z %3', [NUMIN('X'), NUMIN('Y'), NUMIN('Z')]]],
      S({ tooltip: 'Make a capsule: a good shape for a player' }, stmt)),

    // ── Characters + models (glTF files from world-assets.js) ──
    def('w3_character', C.characters, [['make character %1 %2', [OBJ('VAR', 'player'), { type: 'field_dropdown', name: 'MODEL', options: 'CHARACTERS' }]], ['size %1 at x %2 y %3 z %4', [NUMIN('SCALE'), NUMIN('X'), NUMIN('Y'), NUMIN('Z')]]],
      S({ tooltip: 'Make a character that can walk, run, dance and wave' }, stmt)),
    def('w3_animate', C.characters, [['%1 %2 %3', [OBJ('VAR', 'player'), { type: 'field_dropdown', name: 'ANIM', options: 'ANIMATIONS' },
      { type: 'field_dropdown', name: 'MODE', options: [['over and over', 'loop'], ['once', 'once'], ['once and wait', 'wait']] }]]],
      S({ tooltip: 'Play an animation on a character' }, stmt)),
    def('w3_stop_anim', C.characters, [['%1 stops animating', [OBJ('VAR', 'player')]]], stmt),
    def('w3_char_colour', C.characters, [['set %1 colour of %2 to %3', [{ type: 'field_dropdown', name: 'PART', options: LIB.CHARACTER_PARTS }, OBJ('VAR', 'player'), NUMIN('COLOR')]]], stmt),
    def('w3_object', C.models, [['make %1 %2', [OBJ('VAR', 'tree1'), { type: 'field_dropdown', name: 'MODEL', options: 'OBJECTS' }]], ['size %1 at x %2 y %3 z %4', [NUMIN('SCALE'), NUMIN('X'), NUMIN('Y'), NUMIN('Z')]]],
      S({ tooltip: 'Add a ready-made model: trees, rocks, huts, gems and more' }, stmt)),

    // ── Events ──
    def('w3_when_run', C.events, [['when Run is clicked', []], ['%1', [{ type: 'input_statement', name: 'DO' }]]], hat(), { tooltip: 'The blocks inside run when you click Run' }),
    def('w3_when_clicked', C.events, [['when %1 is clicked', [OBJ('VAR')]], ['%1', [{ type: 'input_statement', name: 'DO' }]]], hat()),
    def('w3_when_key', C.events, [['when %1 key pressed', [{ type: 'field_dropdown', name: 'KEY', options: [['any', 'any'], ...KEY_OPTS()] }]], ['%1', [{ type: 'input_statement', name: 'DO' }]]], hat()),
    def('w3_when_touch', C.events, [['when %1 touches %2', [OBJ('A', 'player'), OBJ('B')]], ['%1', [{ type: 'input_statement', name: 'DO' }]]], hat(), { tooltip: 'Runs each time the two objects bump into each other' }),
    def('w3_when_touch_ground', C.events, [['when %1 lands on the ground', [OBJ('A', 'player')]], ['%1', [{ type: 'input_statement', name: 'DO' }]]], hat()),
    def('w3_when_receive', C.events, [['when I receive %1', [{ type: 'field_input', name: 'MSG', text: 'go' }]], ['%1', [{ type: 'input_statement', name: 'DO' }]]], hat()),
    def('w3_broadcast', C.events, [['broadcast %1', [{ type: 'field_input', name: 'MSG', text: 'go' }]]], S({ tooltip: 'Send a message to every "when I receive" block' }, stmt)),
    def('w3_broadcast_wait', C.events, [['broadcast %1 and wait', [{ type: 'field_input', name: 'MSG', text: 'go' }]]], stmt),

    // ── Motion ──
    def('w3_move_by', C.motion, [['move %1 by x %2 y %3 z %4', [OBJ('VAR'), NUMIN('X'), NUMIN('Y'), NUMIN('Z')]]], stmt),
    def('w3_move_to', C.motion, [['move %1 to x %2 y %3 z %4', [OBJ('VAR'), NUMIN('X'), NUMIN('Y'), NUMIN('Z')]]], stmt),
    def('w3_glide_to', C.motion, [['glide %1 to x %2 y %3 z %4 in %5 secs', [OBJ('VAR'), NUMIN('X'), NUMIN('Y'), NUMIN('Z'), NUMIN('SECS')]]], stmt),
    def('w3_turn_by', C.motion, [['turn %1 by x %2 y %3 z %4 degrees', [OBJ('VAR'), NUMIN('X'), NUMIN('Y'), NUMIN('Z')]]], S({ tooltip: 'Spin round: y turns left and right' }, stmt)),
    def('w3_turn_to', C.motion, [['point %1 to x %2 y %3 z %4 degrees', [OBJ('VAR'), NUMIN('X'), NUMIN('Y'), NUMIN('Z')]]], stmt),
    def('w3_face', C.motion, [['turn %1 to face %2', [OBJ('VAR'), OBJ('TARGET', 'player')]]], stmt),
    def('w3_resize', C.motion, [['resize %1 to width %2 height %3 depth %4', [OBJ('VAR'), NUMIN('W'), NUMIN('H'), NUMIN('D')]]], stmt),

    // ── Looks ──
    def('w3_set_colour', C.looks, [['set colour of %1 to %2', [OBJ('VAR'), NUMIN('COLOR')]]], stmt),
    def('w3_show', C.looks, [['show %1', [OBJ('VAR')]]], stmt),
    def('w3_hide', C.looks, [['hide %1', [OBJ('VAR')]]], stmt),
    def('w3_say', C.looks, [['%1 says %2', [OBJ('VAR', 'player'), NUMIN('TEXT')]]], S({ tooltip: 'A speech bubble over the object. Say nothing to take it away.' }, stmt)),
    def('w3_say_for', C.looks, [['%1 says %2 for %3 seconds', [OBJ('VAR', 'player'), NUMIN('TEXT'), NUMIN('SECS')]]], stmt),
    def('w3_show_text', C.looks, [['show %1 on the screen', [NUMIN('TEXT')]]], S({ tooltip: 'Show words at the top of the world, like a score. Join text and a variable to show the number.' }, stmt)),
    def('w3_delete', C.looks, [['delete %1', [OBJ('VAR')]]], S({ tooltip: 'Remove the object from the world' }, stmt)),

    // ── Physics ──
    def('w3_physics', C.physics, [['make %1 %2', [OBJ('VAR'), { type: 'field_dropdown', name: 'KIND', options: [['fall and bump', 'dynamic'], ['solid but still', 'static'], ['a ghost (no physics)', 'none']] }]]],
      S({ tooltip: 'Fall and bump: gravity pulls it and it knocks into things. Solid but still: things bump into it but it never moves.' }, stmt)),
    def('w3_bounce', C.physics, [['set bounciness of %1 to %2 %%', [OBJ('VAR'), NUMIN('AMOUNT')]]], stmt),
    def('w3_push', C.physics, [['push %1 by x %2 y %3 z %4', [OBJ('VAR'), NUMIN('X'), NUMIN('Y'), NUMIN('Z')]]], S({ tooltip: 'Give a falling object a shove (it needs "fall and bump")' }, stmt)),
    def('w3_grip', C.physics, [['set grip of %1 to %2 %%', [OBJ('VAR'), NUMIN('AMOUNT')]]], S({ tooltip: '0% = slides like ice, 100% = sticky' }, stmt)),
    def('w3_weight', C.physics, [['set weight of %1 to %2 kg', [OBJ('VAR'), NUMIN('AMOUNT')]]], S({ tooltip: 'Heavy things are harder to push' }, stmt)),
    def('w3_speed_of', C.physics, [['%1 speed of %2', [{ type: 'field_dropdown', name: 'AXIS', options: [['total', 'ALL'], ['x', 'X'], ['y', 'Y'], ['z', 'Z']] }, OBJ('VAR')]]], { output: 'Number' }),
    def('w3_velocity', C.physics, [['set speed of %1 to x %2 y %3 z %4', [OBJ('VAR'), NUMIN('X'), NUMIN('Y'), NUMIN('Z')]]], stmt),

    // ── Game ──
    def('w3_control', C.game, [['control %1 with the arrow keys speed %2', [OBJ('VAR', 'player'), NUMIN('SPEED')]]],
      S({ tooltip: 'Arrow keys or WASD walk, space jumps (it needs "fall and bump" to jump). On a tablet, buttons appear.' }, stmt)),

    // ── Camera ──
    def('w3_follow', C.camera, [['camera follows %1', [OBJ('VAR', 'player')]]], S({ tooltip: 'The camera keeps this object in the middle; you can still drag to look around it' }, stmt)),
    def('w3_camera_view', C.camera, [['camera follows %1 from %2', [OBJ('VAR', 'player'), { type: 'field_dropdown', name: 'VIEW', options: [['behind', 'behind'], ['above', 'above'], ['the side', 'side']] }]]],
      S({ tooltip: 'The camera stays behind, above or beside the object as it turns' }, stmt)),
    def('w3_camera_zoom', C.camera, [['camera distance %1', [NUMIN('AMOUNT')]]], S({ tooltip: 'How far away the camera is (3 = close, 80 = far)' }, stmt)),
    def('w3_camera_look', C.camera, [['point camera at x %1 y %2 z %3', [NUMIN('X'), NUMIN('Y'), NUMIN('Z')]]], stmt),
    def('w3_camera_free', C.camera, [['stop the camera following', []]], stmt),

    // ── Sound ──
    def('w3_play_sound', C.sound, [['play sound %1', [{ type: 'field_dropdown', name: 'SOUND', options: SOUNDS }]]], stmt),
    def('w3_play_sound_wait', C.sound, [['play sound %1 until done', [{ type: 'field_dropdown', name: 'SOUND', options: SOUNDS }]]], stmt),
    def('w3_play_note', C.sound, [['play note %1 for %2 seconds', [{ type: 'field_dropdown', name: 'NOTE', options: NOTES.map(n => [n, n]) }, NUMIN('SECS')]]], stmt),
    def('w3_set_volume', C.sound, [['set volume to %1 %%', [NUMIN('AMOUNT')]]], stmt),
    def('w3_stop_sounds', C.sound, [['stop all sounds', []]], stmt),
    def('w3_speak', C.sound, [['say out loud %1', [NUMIN('TEXT')]]], S({ tooltip: 'The computer reads the words out loud' }, stmt)),

    // ── Control ──
    def('w3_wait', C.control, [['wait %1 seconds', [NUMIN('SECS')]]], stmt),
    def('w3_forever', C.control, [['forever', []], ['%1', [{ type: 'input_statement', name: 'DO' }]]], { previousStatement: null }),
    def('w3_stop', C.control, [['stop everything', []]], { previousStatement: null }),

    // ── Sensing ──
    def('w3_position', C.sensing, [['%1 of %2', [{ type: 'field_dropdown', name: 'AXIS', options: [['x', 'X'], ['y', 'Y'], ['z', 'Z']] }, OBJ('VAR')]]], { output: 'Number' }),
    def('w3_distance', C.sensing, [['distance from %1 to %2', [OBJ('A', 'player'), OBJ('B')]]], { output: 'Number' }),
    def('w3_touching', C.sensing, [['%1 touching %2 ?', [OBJ('A', 'player'), OBJ('B')]]], { output: 'Boolean' }),
    def('w3_on_ground', C.sensing, [['%1 on the ground?', [OBJ('A', 'player')]]], { output: 'Boolean' }),
    def('w3_key_down', C.sensing, [['key %1 pressed?', [{ type: 'field_dropdown', name: 'KEY', options: [['any', 'any'], ...KEY_OPTS()] }]]], { output: 'Boolean' }),
    def('w3_timer', C.sensing, [['timer', []]], { output: 'Number' }),
    def('w3_reset_timer', C.sensing, [['reset timer', []]], stmt),

    // ── Operators (the rest are Blockly's own) ──
    def('w3_random', C.ops, [['pick random %1 to %2', [NUMIN('A'), NUMIN('B')]]], { output: 'Number' })
  ];
}

export function defineBlocks(Blockly, gen, Order) {
  if (Blockly.Blocks.w3_when_run) return;
  const DYN = { CHARACTERS: pics(LIB.CHARACTERS), OBJECTS: pics(LIB.OBJECTS), ANIMATIONS: () => LIB.ANIMATIONS.map(([id, label]) => [label, id]) };
  for (const j of blockDefs()) {
    const isHat = j.hat; delete j.hat;
    // dropdowns named by a string are built here, so the picture URLs are worked out once Blockly is ready
    for (let i = 0; j['args' + i]; i++) for (const a of j['args' + i]) if (a.type === 'field_dropdown' && typeof a.options === 'string') a.options = DYN[a.options]();
    Blockly.Blocks[j.type] = { init() { this.jsonInit(j); if (isHat) this.hat = 'cap'; } };
  }
  defineGenerators(Blockly, gen, Order);
}

function defineGenerators(Blockly, gen, Order) {
  const NONE = Order.NONE, CALL = Order.FUNCTION_CALL;
  gen.INFINITE_LOOP_TRAP = 'await __yield();\n';
  const VARTYPE = Blockly.Names.NameType.VARIABLE;
  const v = (b, f) => gen.nameDB_.getName(b.getFieldValue(f || 'VAR'), VARTYPE);
  const label = (b, f) => { const fl = b.getField(f || 'VAR'); return gen.quote_(fl ? fl.getText() : 'thing'); };
  const val = (b, name) => {
    const d = (DEF[b.type] || {})[name];
    const code = gen.valueToCode(b, name, NONE);
    if (code) return code;
    if (d && typeof d === 'object') return gen.quote_(d.text);
    return typeof d === 'string' ? gen.quote_(d) : String(d == null ? 0 : d);
  };
  const body = b => gen.statementToCode(b, 'DO');
  const F = gen.forBlock;
  const xyz = b => `${val(b, 'X')}, ${val(b, 'Y')}, ${val(b, 'Z')}`;

  F.w3_sky = b => `setSky(${val(b, 'COLOR')});\n`;
  F.w3_ground = b => `setGround(${val(b, 'COLOR')});\n`;
  F.w3_fog = b => `setFog(${val(b, 'AMOUNT')});\n`;
  F.w3_brightness = b => `setBrightness(${val(b, 'AMOUNT')});\n`;
  F.w3_gravity = b => `setGravity(${val(b, 'AMOUNT')});\n`;

  const shape = fn => b => {
    const hasD = !!b.getInput('D'), hasH = !!b.getInput('H');
    const w = val(b, 'W'), h = hasH ? val(b, 'H') : w, d = hasD ? val(b, 'D') : w;
    return `${v(b)} = ${fn}(${label(b)}, { color: ${val(b, 'COLOR')}, w: ${w}, h: ${h}, d: ${d}, x: ${val(b, 'X')}, y: ${val(b, 'Y')}, z: ${val(b, 'Z')}, __b: ${gen.quote_(b.id)} });\n`;
  };
  F.w3_box = shape('createBox'); F.w3_sphere = shape('createSphere'); F.w3_cylinder = shape('createCylinder');
  F.w3_cone = shape('createCone'); F.w3_capsule = shape('createCapsule');

  const model = b => gen.quote_(b.getFieldValue('MODEL'));
  const pos = b => `scale: ${val(b, 'SCALE')}, x: ${val(b, 'X')}, y: ${val(b, 'Y')}, z: ${val(b, 'Z')}, __b: ${gen.quote_(b.id)}`;
  F.w3_character = b => `${v(b)} = await createCharacter(${label(b)}, { model: ${model(b)}, ${pos(b)} });\n`;
  F.w3_object = b => `${v(b)} = await createObject(${label(b)}, { model: ${model(b)}, ${pos(b)} });\n`;
  F.w3_animate = b => `await playAnimation(${v(b)}, ${gen.quote_(b.getFieldValue('ANIM'))}, ${gen.quote_(b.getFieldValue('MODE'))});\n`;
  F.w3_stop_anim = b => `stopAnimation(${v(b)});\n`;
  F.w3_char_colour = b => `setPartColor(${v(b)}, ${gen.quote_(b.getFieldValue('PART'))}, ${val(b, 'COLOR')});\n`;

  F.w3_when_run = b => `__start(async () => {\n${body(b)}});\n`;
  F.w3_when_clicked = b => `__onClick(() => ${v(b)}, async () => {\n${body(b)}});\n`;
  F.w3_when_key = b => `__onKey(${gen.quote_(b.getFieldValue('KEY'))}, async () => {\n${body(b)}});\n`;
  F.w3_when_touch = b => `__onTouch(() => ${v(b, 'A')}, () => ${v(b, 'B')}, async () => {\n${body(b)}});\n`;
  F.w3_when_touch_ground = b => `__onTouch(() => ${v(b, 'A')}, () => '__ground', async () => {\n${body(b)}});\n`;
  F.w3_when_receive = b => `__onMessage(${gen.quote_(b.getFieldValue('MSG'))}, async () => {\n${body(b)}});\n`;
  F.w3_broadcast = b => `broadcast(${gen.quote_(b.getFieldValue('MSG'))});\n`;
  F.w3_broadcast_wait = b => `await broadcastAndWait(${gen.quote_(b.getFieldValue('MSG'))});\n`;

  F.w3_move_by = b => `moveBy(${v(b)}, ${xyz(b)});\n`;
  F.w3_move_to = b => `moveTo(${v(b)}, ${xyz(b)});\n`;
  F.w3_glide_to = b => `await glideTo(${v(b)}, ${xyz(b)}, ${val(b, 'SECS')});\n`;
  F.w3_turn_by = b => `turnBy(${v(b)}, ${xyz(b)});\n`;
  F.w3_turn_to = b => `turnTo(${v(b)}, ${xyz(b)});\n`;
  F.w3_face = b => `face(${v(b)}, ${v(b, 'TARGET')});\n`;
  F.w3_resize = b => `resize(${v(b)}, ${val(b, 'W')}, ${val(b, 'H')}, ${val(b, 'D')});\n`;

  F.w3_set_colour = b => `setColor(${v(b)}, ${val(b, 'COLOR')});\n`;
  F.w3_show = b => `show(${v(b)});\n`;
  F.w3_hide = b => `hide(${v(b)});\n`;
  F.w3_delete = b => `destroy(${v(b)});\n`;

  F.w3_physics = b => `setPhysics(${v(b)}, ${gen.quote_(b.getFieldValue('KIND'))});\n`;
  F.w3_bounce = b => `setBounce(${v(b)}, ${val(b, 'AMOUNT')});\n`;
  F.w3_push = b => `push(${v(b)}, ${xyz(b)});\n`;
  F.w3_velocity = b => `setVelocity(${v(b)}, ${xyz(b)});\n`;

  F.w3_control = b => `control(${v(b)}, ${val(b, 'SPEED')});\n`;
  F.w3_follow = b => `follow(${v(b)});\n`;
  const q = (b, f) => gen.quote_(b.getFieldValue(f));
  F.w3_camera_view = b => `cameraView(${v(b)}, ${q(b, 'VIEW')});\n`;
  F.w3_camera_zoom = b => `cameraZoom(${val(b, 'AMOUNT')});\n`;
  F.w3_camera_look = b => `cameraLookAt(${xyz(b)});\n`;
  F.w3_camera_free = () => 'cameraFree();\n';
  F.w3_play_sound = b => `playSound(${q(b, 'SOUND')});\n`;
  F.w3_play_sound_wait = b => `await playSoundWait(${q(b, 'SOUND')});\n`;
  F.w3_play_note = b => `await playNote(${q(b, 'NOTE')}, ${val(b, 'SECS')});\n`;
  F.w3_set_volume = b => `setVolume(${val(b, 'AMOUNT')});\n`;
  F.w3_stop_sounds = () => 'stopSounds();\n';
  F.w3_speak = b => `speak(${val(b, 'TEXT')});\n`;
  F.w3_say = b => `say(${v(b)}, ${val(b, 'TEXT')});\n`;
  F.w3_say_for = b => `await sayFor(${v(b)}, ${val(b, 'TEXT')}, ${val(b, 'SECS')});\n`;
  F.w3_show_text = b => `showText(${val(b, 'TEXT')});\n`;
  F.w3_grip = b => `setGrip(${v(b)}, ${val(b, 'AMOUNT')});\n`;
  F.w3_weight = b => `setWeight(${v(b)}, ${val(b, 'AMOUNT')});\n`;
  F.w3_speed_of = b => [`getSpeed(${v(b)}, ${q(b, 'AXIS')})`, CALL];

  F.w3_wait = b => `await wait(${val(b, 'SECS')});\n`;
  F.w3_forever = b => `await __forever(async () => {\n${body(b)}});\n`;
  F.w3_stop = () => 'stopAll();\n';

  F.w3_position = b => [`get${b.getFieldValue('AXIS')}(${v(b)})`, CALL];
  F.w3_distance = b => [`distance(${v(b, 'A')}, ${v(b, 'B')})`, CALL];
  F.w3_touching = b => [`touching(${v(b, 'A')}, ${v(b, 'B')})`, CALL];
  F.w3_on_ground = b => [`touching(${v(b, 'A')}, '__ground')`, CALL];
  F.w3_key_down = b => [`keyDown(${gen.quote_(b.getFieldValue('KEY'))})`, CALL];
  F.w3_timer = () => ['timer()', CALL];
  F.w3_reset_timer = () => 'resetTimer();\n';
  F.w3_random = b => [`random(${val(b, 'A')}, ${val(b, 'B')})`, CALL];
}

export function compile(Blockly, gen, ws) {
  gen.init(ws);
  let code = '';
  for (const b of ws.getTopBlocks(true)) {
    if (!HATS.includes(b.type) || !b.isEnabled()) continue;
    code += gen.blockToCode(b);
  }
  code = gen.finish(code);
  gen.nameDB_ && gen.nameDB_.reset && gen.nameDB_.reset();
  return code;
}

// ── toolbox ──
function shadows(type, over) {
  const d = Object.assign({}, DEF[type] || {}, over || {}), inputs = {};
  for (const k in d) {
    const x = d[k];
    inputs[k] = { shadow: x && typeof x === 'object' ? { type: 'text', fields: { TEXT: x.text } }
      : typeof x === 'string' ? { type: 'colour_picker', fields: { COLOUR: x } } : { type: 'math_number', fields: { NUM: x } } };
  }
  return inputs;
}
const tb = (type, over, extra) => Object.assign({ kind: 'block', type, inputs: shadows(type, over) }, extra || {});
const cat = (name, colour, contents) => ({ kind: 'category', name, colour, contents });

export function toolbox() {
  return {
    kind: 'categoryToolbox',
    contents: [
      cat('Scene', C.scene, [tb('w3_sky'), tb('w3_ground'), tb('w3_fog'), tb('w3_brightness'), tb('w3_gravity')]),
      cat('Shapes', C.shapes, [tb('w3_box'), tb('w3_sphere'), tb('w3_cylinder'), tb('w3_cone'), tb('w3_capsule')]),
      cat('Characters', C.characters, [tb('w3_character'),
        tb('w3_animate', null, { fields: { ANIM: 'Wave', MODE: 'wait' } }), tb('w3_animate', null, { fields: { ANIM: 'Dance1', MODE: 'loop' } }),
        tb('w3_stop_anim'), tb('w3_char_colour'), tb('w3_char_colour', { COLOR: '#f2b61d' }, { fields: { PART: 'hair' } })]),
      cat('Models', C.models, [tb('w3_object', null, { fields: { MODEL: 'tree' } }), tb('w3_object', { X: -3 }, { fields: { MODEL: 'hut' } }),
        tb('w3_object', { Y: 1 }, { fields: { MODEL: 'Star' } }), tb('w3_object', { Y: 1 }, { fields: { MODEL: 'Gem2' } })]),
      cat('Events', C.events, [tb('w3_when_run'), tb('w3_when_clicked'), tb('w3_when_key'), tb('w3_when_touch'), tb('w3_when_touch_ground'),
        tb('w3_when_receive'), tb('w3_broadcast'), tb('w3_broadcast_wait')]),
      cat('Motion', C.motion, [tb('w3_move_by'), tb('w3_move_to'), tb('w3_glide_to'), tb('w3_turn_by'), tb('w3_turn_to'), tb('w3_face'), tb('w3_resize')]),
      cat('Looks', C.looks, [tb('w3_set_colour'), { kind: 'block', type: 'w3_set_colour', inputs: { COLOR: { block: { type: 'colour_random' } } } },
        tb('w3_say'), tb('w3_say_for'), tb('w3_show_text'), {
          kind: 'block', type: 'w3_show_text', inputs: { TEXT: { block: { type: 'text_join', extraState: { itemCount: 2 },
            inputs: { ADD0: { block: { type: 'text', fields: { TEXT: 'Score: ' } } }, ADD1: { block: { type: 'math_number', fields: { NUM: 0 } } } } } } }
        },
        tb('w3_show'), tb('w3_hide'), tb('w3_delete')]),
      cat('Sound', C.sound, [tb('w3_play_sound'), tb('w3_play_sound_wait'), tb('w3_play_note'), tb('w3_speak'), tb('w3_set_volume'), tb('w3_stop_sounds')]),
      cat('Physics', C.physics, [tb('w3_physics'), tb('w3_bounce'), tb('w3_grip'), tb('w3_weight'), tb('w3_push'), tb('w3_velocity'), tb('w3_speed_of'), tb('w3_gravity')]),
      cat('Game', C.game, [tb('w3_control')]),
      cat('Camera', C.camera, [tb('w3_follow'), tb('w3_camera_view'), tb('w3_camera_zoom'), tb('w3_camera_look'), tb('w3_camera_free')]),
      cat('Control', C.control, [tb('w3_wait'), tb('controls_repeat_ext'), tb('w3_forever'), { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'controls_if', extraState: { hasElse: true } }, { kind: 'block', type: 'controls_whileUntil' }, tb('w3_stop')]),
      cat('Sensing', C.sensing, [tb('w3_position'), tb('w3_distance'), tb('w3_touching'), tb('w3_on_ground'), tb('w3_key_down'), tb('w3_timer'), tb('w3_reset_timer')]),
      cat('Operators', C.ops, [
        { kind: 'block', type: 'math_arithmetic', inputs: { A: { shadow: { type: 'math_number', fields: { NUM: 1 } } }, B: { shadow: { type: 'math_number', fields: { NUM: 1 } } } } },
        tb('w3_random'),
        { kind: 'block', type: 'logic_compare', inputs: { A: { shadow: { type: 'math_number', fields: { NUM: 0 } } }, B: { shadow: { type: 'math_number', fields: { NUM: 0 } } } } },
        { kind: 'block', type: 'logic_operation' }, { kind: 'block', type: 'logic_negate' }, { kind: 'block', type: 'logic_boolean' },
        { kind: 'block', type: 'math_round', inputs: { NUM: { shadow: { type: 'math_number', fields: { NUM: 3.1 } } } } },
        { kind: 'block', type: 'math_modulo', inputs: { DIVIDEND: { shadow: { type: 'math_number', fields: { NUM: 10 } } }, DIVISOR: { shadow: { type: 'math_number', fields: { NUM: 3 } } } } },
        { kind: 'block', type: 'math_number' }, { kind: 'block', type: 'text' },
        { kind: 'block', type: 'text_join', extraState: { itemCount: 2 } }, { kind: 'block', type: 'colour_picker' }, { kind: 'block', type: 'colour_random' }
      ]),
      { kind: 'category', name: 'Variables', colour: '#ff8c1a', custom: 'VARIABLE' }
    ]
  };
}

// ── the starter program: a little playable scene ──
function pb(type, vars, over, extra) {
  const b = { type, inputs: shadows(type, over) };
  if (vars) { b.fields = {}; for (const k in vars) b.fields[k] = typeof vars[k] === 'object' ? vars[k].value : { id: 'v_' + vars[k] }; }
  return Object.assign(b, extra || {});
}
function chain(list) {
  for (let i = list.length - 2; i >= 0; i--) list[i].next = { block: list[i + 1] };
  return list[0];
}

export function starterProgram() {
  const run = pb('w3_when_run', null, null, { x: 20, y: 20 });
  const sel = (type, vars, model, over) => pb(type, Object.assign({}, vars, { MODEL: { value: model } }), over);
  run.inputs = {
    DO: {
      block: chain([
        pb('w3_sky', null, { COLOR: '#8fd0f7' }),
        sel('w3_character', { VAR: 'player' }, 'Block5', { SCALE: 1, X: 0, Y: 0, Z: 0 }),
        pb('w3_physics', { VAR: 'player', KIND: { value: 'dynamic' } }),
        pb('w3_control', { VAR: 'player' }, { SPEED: 5 }),
        pb('w3_follow', { VAR: 'player' }),
        sel('w3_object', { VAR: 'tree1' }, 'tree4', { SCALE: 1, X: -7, Y: 0, Z: 8 }),
        sel('w3_object', { VAR: 'tree2' }, 'tree', { SCALE: 1, X: 7, Y: 0, Z: 9 }),
        pb('w3_box', { VAR: 'wall' }, { COLOR: '#d1477a', W: 6, H: 1, D: 1, X: 0, Y: 0, Z: 7 }),
        pb('w3_physics', { VAR: 'wall', KIND: { value: 'static' } }),
        pb('w3_sphere', { VAR: 'ball' }, { COLOR: '#f2b61d', W: 1, X: 3, Y: 6, Z: 3 }),
        pb('w3_physics', { VAR: 'ball', KIND: { value: 'dynamic' } }),
        pb('w3_bounce', { VAR: 'ball' }, { AMOUNT: 70 }),
        sel('w3_object', { VAR: 'prize' }, 'Star', { SCALE: 1, X: -4, Y: 1, Z: 4 }),
        (() => {
          const f = pb('w3_forever');
          f.inputs = { DO: { block: pb('w3_turn_by', { VAR: 'prize' }, { X: 0, Y: 3, Z: 0 }) } };
          return f;
        })()
      ])
    }
  };
  const wave = pb('w3_animate', { VAR: 'player', ANIM: { value: 'Wave' }, MODE: { value: 'wait' } });
  const touch = { type: 'w3_when_touch', x: 470, y: 20, fields: { A: { id: 'v_player' }, B: { id: 'v_prize' } },
    inputs: { DO: { block: chain([pb('w3_set_colour', { VAR: 'prize' }, { COLOR: '#2dc653' }), pb('w3_push', { VAR: 'ball' }, { X: 0, Y: 6, Z: 0 }), wave]) } } };
  return {
    blocks: { languageVersion: 0, blocks: [run, touch] },
    variables: ['player', 'tree1', 'tree2', 'wall', 'ball', 'prize'].map(n => ({ name: n, id: 'v_' + n }))
  };
}
