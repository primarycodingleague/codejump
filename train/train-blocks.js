/* CodeJump · Train Lab — the blocks, the toolbox and the starter program.
 *
 * The train blocks are the same as the smart train's own Scratch 3 extension (same wording, same dropdowns, same numbers,
 * same order and groups), so what pupils learn here carries straight over to the real trains. Like that extension there
 * is one block category per train ("Train 1", "Train 2", "Train 3"): block types are `t<N>_<opcode>`, e.g. t2_startDriving.
 * The rest is Scratch's own: Events (when Run is clicked, keys, broadcast), Control, Sensing, Operators and Variables.
 * One program drives every train. Uses the page's Blockly 10 (passed in); train-runner.js runs it.
 */
import { MAX_TRAINS } from './train-model.js';

const C = { events: '#ffbf00', control: '#ffab19', sensing: '#5cb1d6', ops: '#59c059', vars: '#ff8c1a', train: '#0fbd8c' };
// the numbers the real train uses
export const DIRECTION = { forward: 1, backward: -1 };
export const MOVEMENT = { forward: 1, backward: 2, stopped: 3, paused: 4 };
export const LED = { top: 1, head: 2, tail: 4 };
export const SPLIT = { left: 1, right: 2, straight: 3, default: 0 };
export const COLOUR_NUM = { black: 0, red: 1, green: 2, yellow: 3, blue: 4, magenta: 5, cyan: 6, white: 7 };
const NUM_COLOUR = Object.fromEntries(Object.entries(COLOUR_NUM).map(([k, v]) => [String(v), k]));
export const colourOfNum = n => NUM_COLOUR[String(n)] || 'black';
export const TRAIN_ICON_COLOURS = ['#21b8e8', '#f0623c', '#f5b31b'];

const DIRECTION_MENU = [['forward', '1'], ['backward', '-1']];
const MOVEMENT_MENU = [['forward', '1'], ['backward', '2'], ['paused', '4'], ['stopped', '3']];
const LED_MENU = [['top LED', '1'], ['headlights', '2'], ['taillights', '4']];
const SPLIT_MENU = [['left', '1'], ['right', '2'], ['straight', '3'], ['default', '0']];
const STARTING_SNAP_MENU = [['cyan (6)', '6'], ['white (7)', '7']];
const SNAP_COLOUR_MENU = [['none (0)', '0'], ['red (1)', '1'], ['green (2)', '2'], ['yellow (3)', '3'], ['blue (4)', '4'], ['magenta (5)', '5']];
const CLASSIFIED_MENU = [['black (0)', '0'], ['red (1)', '1'], ['green (2)', '2'], ['yellow (3)', '3'], ['blue (4)', '4'], ['magenta (5)', '5'], ['cyan (6)', '6'], ['white (7)', '7']];
const ON_OFF_MENU = [['on', '1'], ['off', '0']];
const KEYS = [['space', 'space'], ['up arrow', 'up'], ['down arrow', 'down'], ['left arrow', 'left'], ['right arrow', 'right'],
  ...'abcdefghijklmnopqrstuvwxyz0123456789'.split('').map(k => [k, k])];

const svgUri = s => 'data:image/svg+xml,' + encodeURIComponent(s);
// a little engine in the train's colour, at the start of every block of that train (like the extension's icon)
const engineIcon = col => svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="1" y="5" width="22" height="13" rx="6" fill="#fff" stroke="${col}" stroke-width="1.6"/><path d="M5 6.5h11a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5H5z" fill="${col}"/><rect x="7" y="9" width="7" height="2.4" rx="1" fill="#e9faff"/><rect x="7" y="12.6" width="7" height="2.4" rx="1" fill="#e9faff"/><circle cx="6" cy="20.5" r="1.8" fill="#222"/><circle cx="18" cy="20.5" r="1.8" fill="#222"/></svg>`);
const snapIcon = col => svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 19"><rect x="1.5" y="1.5" width="21" height="16" rx="3" fill="${col}" stroke="#555" stroke-width="1.4"/></svg>`);

const dd = (name, options) => ({ type: 'field_dropdown', name, options });
const num = name => ({ type: 'input_value', name, check: null });
const stmt = { previousStatement: null, nextStatement: null };

// the extension's blocks, in its order; `sep` = a gap in the toolbox after this block (its '---')
const TRAIN_BLOCKS = [
  { op: 'whenMovement', hat: true, msg: 'when movement %1', args: [dd('MOVEMENT', MOVEMENT_MENU)], tip: 'Starts when the train starts going this way, pauses or stops.' },
  { op: 'whenDistance', hat: true, msg: 'when distance >= %1 cm', args: [num('DISTANCE')], tip: 'Starts when the distance the train has driven reaches this many cm.' },
  { op: 'startDriving', msg: 'drive %1 at %2 cm/s', args: [dd('DIRECTION', DIRECTION_MENU), num('SPEED')], tip: 'Starts the train driving forward (front first) or backward at this speed, from 10 to 100 cm/s. 0 stops it.' },
  { op: 'moveFixedDistance', msg: 'drive %1 %2 cm at %3 cm/s', args: [dd('DIRECTION', DIRECTION_MENU), num('DISTANCE'), num('SPEED')], tip: 'Drives this far, then stops, and waits until it has got there.' },
  { op: 'stopDriving', msg: 'stop driving', args: [], tip: 'Stops the train.' },
  { op: 'pauseDriving', msg: 'pause driving for %1 seconds', args: [num('TIME')], sep: true, tip: 'Stops for a while, then carries on at the same speed.' },
  { op: 'getDirection', out: 'Number', msg: 'direction', args: [], tip: '1 when driving forward, -1 backward, 0 when stopped.' },
  { op: 'getSpeedCmps', out: 'Number', msg: 'speed (cm/s)', args: [], tip: 'How fast the train is going.' },
  { op: 'getOdometerCm', out: 'Number', msg: 'distance (cm)', args: [], sep: true, tip: 'How far the train has driven (since Run or "reset distance").' },
  { op: 'resetOdometer', msg: 'reset distance', args: [], sep: true, tip: 'Starts counting the distance from 0 again.' },
  { op: 'decoupleWagon', msg: 'decouple wagon', args: [], sep: true, tip: 'Lets go of a wagon. (No wagons in the Train Lab yet: it just waits a moment, like the real train.)' },
  { op: 'setLedColorPicker', msg: 'set %1 color to %2', args: [dd('LEDGROUP', LED_MENU), { type: 'field_colour', name: 'COLOR', colour: '#00ff00' }], tip: 'Changes the colour of the top LED, the headlights or the taillights.' },
  { op: 'setLedHue', msg: 'set %1 hue to %2', args: [dd('LEDGROUP', LED_MENU), num('HUE')], tip: 'Colour from 0 to 100 around the colour wheel (0 red, 33 green, 67 blue).' },
  { op: 'setLedColor', msg: 'set %1 RGB to %2 %3 %4', args: [dd('LEDGROUP', LED_MENU), num('RED'), num('GREEN'), num('BLUE')], sep: true, tip: 'Mixes red, green and blue light, each from 0 to 255.' },
  { op: 'whenOnSplitTrack', hat: true, msg: 'when on a split track', args: [], tip: 'Starts when the train reads the colours at the start of a split.' },
  { op: 'setNextSplitDecision', msg: 'on next split go %1', args: [dd('SIDE', SPLIT_MENU)], tip: 'Chooses the way at the next split. "default" goes back to the snap in the split (or a random way).' },
  { op: 'getNextSplitDecision', out: 'Number', msg: 'next decision', args: [], tip: 'The way chosen for the next split: 1 left, 2 right, 3 straight, 0 default.' },
  { op: 'getLastSplitDecision', out: 'Number', msg: 'last decision', args: [], tip: 'The way it went at the last split: 1 left, 2 right, 3 straight.' },
  { op: 'splitDecisions', out: 'Number', msg: '%1', args: [dd('SIDE', SPLIT_MENU)], sep: true, tip: 'The number for a way, to compare with next or last decision.' },
  { op: 'whenCustomSnapDetected', hat: true, msg: 'when %1 %2 %3 seen', args: [{ type: 'field_image', src: snapIcon('#ffffff'), width: 24, height: 19, alt: 'white' }, { type: 'field_image', src: snapIcon('#d63fb5'), width: 24, height: 19, alt: 'magenta' }, dd('COLOR', SNAP_COLOUR_MENU)], tip: 'Starts when the train reads a custom command: white, magenta and this colour.' },
  { op: 'clearCustomSnapCommands', msg: 'clear stored custom commands', args: [], sep: true, tip: 'Forgets custom commands saved on the train. (Nothing is stored in the Train Lab, so this does nothing here.)' },
  { op: 'whenSnapDetected', hat: true, msg: 'when %1 %2 %3 %4 seen', args: [dd('COLOR1', STARTING_SNAP_MENU), dd('COLOR2', SNAP_COLOUR_MENU), dd('COLOR3', SNAP_COLOUR_MENU), dd('COLOR4', SNAP_COLOUR_MENU)], tip: 'Starts when the train reads this row of snaps (white …), or a split (cyan …). "none" means no more snaps.' },
  { op: 'setSnapExecution', msg: 'action snap commands %1', args: [dd('STATUS', ON_OFF_MENU)], tip: 'On: the train obeys snap commands by itself. Off: it only reports them to your blocks.' },
  { op: 'setSnapBehaviorFeedback', msg: 'feedback sounds %1 lights %2', args: [dd('SOUNDS', ON_OFF_MENU), dd('LIGHTS', ON_OFF_MENU)], sep: true, tip: 'Whether the train beeps and flashes its top LED when it obeys a snap command.' },
  { op: 'whenColorChanged', hat: true, msg: 'when train sees %1', args: [dd('COLOR', CLASSIFIED_MENU)], tip: 'Starts when the colour under the train’s front sensor changes to this colour (black is the track).' },
  { op: 'getSensorColor', out: 'Number', msg: 'sensor color', args: [], tip: 'The colour under the front sensor, as a number: 0 black (track), 1 red, 2 green, 3 yellow, 4 blue, 5 magenta, 6 cyan, 7 white.' },
  { op: 'classifiedColor', out: 'Number', msg: '%1', args: [dd('COLOR', CLASSIFIED_MENU)], tip: 'The number for a colour, to compare with sensor color.' }
];
export const TRAIN_OPS = TRAIN_BLOCKS.map(b => b.op);
export const TRAIN_HATS = TRAIN_BLOCKS.filter(b => b.hat).map(b => b.op);
// t2_startDriving → { train: 1, op: 'startDriving' }
export function parseType(type) { const m = /^t(\d)_(\w+)$/.exec(type || ''); return m ? { train: Number(m[1]) - 1, op: m[2] } : null; }
export const typeOf = (i, op) => 't' + (i + 1) + '_' + op;

const SCRATCH_BLOCKS = [
  { type: 'tr_when_run', message0: 'when Run is clicked', nextStatement: null, colour: C.events, tooltip: 'Starts this script when you press Run.' },
  { type: 'tr_when_key', message0: 'when %1 key pressed', args0: [dd('KEY', KEYS)], nextStatement: null, colour: C.events, tooltip: 'Starts this script when that key is pressed (while the program runs).' },
  { type: 'tr_when_message', message0: 'when I receive %1', args0: [{ type: 'field_input', name: 'MSG', text: 'message1' }], nextStatement: null, colour: C.events, tooltip: 'Starts this script when this message is broadcast.' },
  { type: 'tr_broadcast', message0: 'broadcast %1', args0: [{ type: 'field_input', name: 'MSG', text: 'message1' }], ...stmt, colour: C.events, tooltip: 'Starts every "when I receive" script with this message.' },
  { type: 'tr_broadcast_wait', message0: 'broadcast %1 and wait', args0: [{ type: 'field_input', name: 'MSG', text: 'message1' }], ...stmt, colour: C.events, tooltip: 'Broadcasts, then waits until those scripts have finished.' },
  { type: 'tr_wait', message0: 'wait %1 seconds', args0: [num('S')], inputsInline: true, ...stmt, colour: C.control, tooltip: 'Pauses this script. The trains keep going.' },
  { type: 'tr_forever', message0: 'forever %1 %2', args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }], previousStatement: null, colour: C.control, tooltip: 'Repeats the blocks inside until you press Stop.' },
  { type: 'tr_wait_until', message0: 'wait until %1', args0: [num('COND')], ...stmt, colour: C.control, tooltip: 'Waits until something is true.' },
  { type: 'tr_stop_all', message0: 'stop all', previousStatement: null, colour: C.control, tooltip: 'Stops every script and every train, like the Stop button.' },
  { type: 'tr_key_pressed', message0: 'key %1 pressed?', args0: [dd('KEY', KEYS)], output: 'Boolean', colour: C.sensing, tooltip: 'True while that key is held down.' },
  { type: 'tr_timer', message0: 'timer', output: 'Number', colour: C.sensing, tooltip: 'Seconds since Run (or since the timer was reset).' },
  { type: 'tr_reset_timer', message0: 'reset timer', ...stmt, colour: C.sensing, tooltip: 'Starts the timer again from 0.' },
  { type: 'tr_random', message0: 'pick random %1 to %2', args0: [num('A'), num('B')], inputsInline: true, output: 'Number', colour: C.ops, tooltip: 'A random whole number between the two numbers.' }
];
export const HATS = ['tr_when_run', 'tr_when_key', 'tr_when_message'];

function trainJson(i) {
  return TRAIN_BLOCKS.map(b => {
    const args = [{ type: 'field_image', src: engineIcon(TRAIN_ICON_COLOURS[i] || C.train), width: 22, height: 22, alt: 'train ' + (i + 1) }, ...b.args];
    const msg = '%1 ' + b.msg.replace(/%(\d)/g, (_, n) => '%' + (Number(n) + 1));
    const o = { type: typeOf(i, b.op), message0: msg, args0: args, colour: C.train, tooltip: b.tip, inputsInline: true };
    if (b.hat) o.nextStatement = null; else if (b.out) o.output = b.out; else Object.assign(o, stmt);
    return o;
  });
}

export function defineBlocks(Blockly) {
  const json = [...SCRATCH_BLOCKS];
  for (let i = 0; i < MAX_TRAINS; i++) json.push(...trainJson(i));
  Blockly.common.defineBlocksWithJsonArray(json);
  const hats = [...HATS]; for (let i = 0; i < MAX_TRAINS; i++) for (const op of TRAIN_HATS) hats.push(typeOf(i, op));
  for (const t of hats) { // the rounded "cap" top, like Scratch's hats
    const def = Blockly.Blocks[t], init = def.init;
    def.init = function () { init.call(this); this.hat = 'cap'; };
  }
}
export function isHat(type) { const p = parseType(type); return HATS.includes(type) || !!(p && TRAIN_HATS.includes(p.op)); }

const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const blk = (type, inputs, fields) => ({ kind: 'block', type, ...(inputs ? { inputs } : {}), ...(fields ? { fields } : {}) });
const TRAIN_INPUTS = { whenDistance: { DISTANCE: N(500) }, startDriving: { SPEED: N(30) }, moveFixedDistance: { DISTANCE: N(10), SPEED: N(30) }, pauseDriving: { TIME: N(2) },
  setLedHue: { HUE: N(50) }, setLedColor: { RED: N(0), GREEN: N(255), BLUE: N(0) } };
const TRAIN_FIELDS = { whenCustomSnapDetected: { COLOR: '1' }, whenSnapDetected: { COLOR1: '7', COLOR2: '1', COLOR3: '0', COLOR4: '0' }, whenColorChanged: { COLOR: '1' },
  classifiedColor: { COLOR: '1' }, setNextSplitDecision: { SIDE: '3' }, splitDecisions: { SIDE: '3' } };

// trains = [{ name }] — one category per train, named after it
export function toolbox(trains) {
  const trainCats = (trains || []).slice(0, MAX_TRAINS).map((tr, i) => ({
    kind: 'category', name: tr.name || 'Train ' + (i + 1), colour: TRAIN_ICON_COLOURS[i] || C.train,
    contents: TRAIN_BLOCKS.flatMap(b => {
      const out = [blk(typeOf(i, b.op), TRAIN_INPUTS[b.op], TRAIN_FIELDS[b.op])];
      if (b.sep) out.push({ kind: 'sep', gap: 28 });
      return out;
    })
  }));
  return {
    kind: 'categoryToolbox',
    contents: [
      { kind: 'category', name: 'Events', colour: C.events, contents: [blk('tr_when_run'), blk('tr_when_key'), blk('tr_when_message'), blk('tr_broadcast'), blk('tr_broadcast_wait')] },
      { kind: 'category', name: 'Control', colour: C.control, contents: [blk('tr_wait', { S: N(1) }), blk('controls_repeat_ext', { TIMES: N(10) }), blk('tr_forever'),
        blk('controls_if'), { kind: 'block', type: 'controls_if', extraState: { hasElse: true } }, blk('tr_wait_until'), blk('controls_whileUntil', null, { MODE: 'UNTIL' }), blk('tr_stop_all')] },
      { kind: 'category', name: 'Sensing', colour: C.sensing, contents: [blk('tr_key_pressed'), blk('tr_timer'), blk('tr_reset_timer')] },
      { kind: 'category', name: 'Operators', colour: C.ops, contents: [blk('math_arithmetic', { A: N(1), B: N(1) }), blk('tr_random', { A: N(1), B: N(10) }),
        blk('logic_compare', { A: N(0), B: N(50) }), blk('logic_operation'), blk('logic_negate'), blk('text_join'), blk('math_round'), blk('math_modulo', { DIVIDEND: N(10), DIVISOR: N(3) })] },
      { kind: 'category', name: 'Variables', colour: C.vars, custom: 'VARIABLE' },
      ...trainCats
    ]
  };
}

// a new project starts with no blocks: like the real train, it drives and obeys the snaps by itself
export function starterProgram() { return { blocks: { languageVersion: 0, blocks: [] } }; }
