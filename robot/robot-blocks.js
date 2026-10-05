/* CodeJump · Robot Lab — the blocks: definitions (rb_*), the toolbox and the starter program.
 * Uses the page's Blockly 10 (passed in). Loops, if, maths, text and variables are Blockly's own standard blocks;
 * robot-runner.js runs them all. Motor and light lists come from robot-model.js so the blocks and the robot agree.
 */
import { MOTORS } from './robot-model.js';

const C = { events: '#d9a43a', moves: '#4c97ff', face: '#9966ff', speech: '#cf63cf', sensing: '#4cb0d4', control: '#e8a33c', ops: '#59c059', vars: '#ff8c1a' };
const MOTOR_OPTS = MOTORS.map(([id, label]) => [label, id]);
const LIGHT_OPTS = [['eyes', 'eyes'], ['ears', 'ears'], ['chest', 'chest'], ['antenna', 'antenna'], ['all', 'all']];
export const FACES = {
  // expression → motor positions + eyebrow tilt (-1 cross … +1 worried)
  happy: { m: { Brows: 7, Eyelids: 1, Mouth: 6, EyesUp: 6 }, tilt: 0 },
  sad: { m: { Brows: 4, Eyelids: 4, Mouth: 1, HeadNod: 3.5, EyesUp: 3 }, tilt: 1 },
  surprised: { m: { Brows: 10, Eyelids: 0, Mouth: 9 }, tilt: 0 },
  angry: { m: { Brows: 3, Eyelids: 4, Mouth: 2 }, tilt: -1 },
  sleepy: { m: { Brows: 4, Eyelids: 8, Mouth: 1, HeadTilt: 6.5, HeadNod: 4 }, tilt: 0.3 },
  thinking: { m: { Brows: 6, Eyelids: 2, Mouth: 0, EyesUp: 8, EyesSide: 7, HeadTilt: 3.5 }, tilt: -0.3 },
  normal: { m: { Brows: 5, Eyelids: 0, Mouth: 0, EyesUp: 5, EyesSide: 5, HeadTilt: 5, HeadNod: 5 }, tilt: 0 }
};
export const LOOKS = { ahead: { HeadTurn: 5, HeadNod: 5, EyesSide: 5, EyesUp: 5 }, left: { HeadTurn: 1.5, EyesSide: 3 }, right: { HeadTurn: 8.5, EyesSide: 7 },
  up: { HeadNod: 8.5, EyesUp: 8 }, down: { HeadNod: 2, EyesUp: 2 } };
export const VOICES = { robot: { pitch: 0.6, rate: 0.95 }, normal: { pitch: 1, rate: 1 }, high: { pitch: 1.7, rate: 1.05 }, low: { pitch: 0.3, rate: 0.9 },
  fast: { pitch: 1, rate: 1.5 }, slow: { pitch: 0.9, rate: 0.7 } };
const KEYS = [['space', 'space'], ['up arrow', 'up'], ['down arrow', 'down'], ['left arrow', 'left'], ['right arrow', 'right'],
  ...'abcdefghijklmnopqrstuvwxyz0123456789'.split('').map(k => [k, k])];

const num = (name, value) => ({ type: 'input_value', name, check: null });
const dd = (name, options) => ({ type: 'field_dropdown', name, options });

export const BLOCKS = [
  // ── Events
  { type: 'rb_when_run', message0: 'when Run is clicked', nextStatement: null, colour: C.events, tooltip: 'Starts this script when you press Run.', hat: 'cap' },
  { type: 'rb_when_tapped', message0: 'when the %1 is tapped', args0: [dd('PART', [['robot', 'any'], ['head', 'head'], ['body', 'body'], ['chest light', 'chest'], ['plinth', 'plinth']])], nextStatement: null, colour: C.events, tooltip: 'Starts this script when someone taps or clicks the robot (while it is running).' },
  { type: 'rb_when_key', message0: 'when %1 key pressed', args0: [dd('KEY', KEYS)], nextStatement: null, colour: C.events, tooltip: 'Starts this script when that key is pressed (while it is running).' },
  { type: 'rb_when_message', message0: 'when I receive %1', args0: [{ type: 'field_input', name: 'MSG', text: 'go' }], nextStatement: null, colour: C.events, tooltip: 'Starts this script when a message with this name is sent.' },
  { type: 'rb_send', message0: 'send message %1', args0: [{ type: 'field_input', name: 'MSG', text: 'go' }], previousStatement: null, nextStatement: null, colour: C.events, tooltip: 'Starts every “when I receive” script with this name.' },
  // ── Moves
  { type: 'rb_move', message0: 'move %1 to %2', args0: [dd('M', MOTOR_OPTS), num('N')], inputsInline: true, previousStatement: null, nextStatement: null, colour: C.moves, tooltip: 'Moves a motor to a position from 0 to 10, and waits until it gets there.' },
  { type: 'rb_start_move', message0: 'start moving %1 to %2', args0: [dd('M', MOTOR_OPTS), num('N')], inputsInline: true, previousStatement: null, nextStatement: null, colour: C.moves, tooltip: 'Starts a motor moving and goes straight on to the next block, so several motors can move at once.' },
  { type: 'rb_change', message0: 'change %1 by %2', args0: [dd('M', MOTOR_OPTS), num('N')], inputsInline: true, previousStatement: null, nextStatement: null, colour: C.moves, tooltip: 'Moves a motor by this much (use a minus number to go back), and waits until it gets there.' },
  { type: 'rb_move_time', message0: 'move %1 to %2 in %3 seconds', args0: [dd('M', MOTOR_OPTS), num('N'), num('S')], inputsInline: true, previousStatement: null, nextStatement: null, colour: C.moves, tooltip: 'Moves a motor smoothly so it takes exactly this long.' },
  { type: 'rb_speed', message0: 'set %1 speed to %2', args0: [dd('M', [['all motors', 'all'], ...MOTOR_OPTS]), num('N')], inputsInline: true, previousStatement: null, nextStatement: null, colour: C.moves, tooltip: 'How fast a motor moves, from 1 (slow) to 10 (fast).' },
  { type: 'rb_look', message0: 'look %1', args0: [dd('DIR', [['ahead', 'ahead'], ['left', 'left'], ['right', 'right'], ['up', 'up'], ['down', 'down']])], previousStatement: null, nextStatement: null, colour: C.moves, tooltip: 'Turns the head and eyes to look this way.' },
  { type: 'rb_reset', message0: 'reset the robot', previousStatement: null, nextStatement: null, colour: C.moves, tooltip: 'Puts every motor and light back to how it started.' },
  // ── Face & lights
  { type: 'rb_face', message0: 'make a %1 face', args0: [dd('FACE', Object.keys(FACES).map(k => [k, k]))], previousStatement: null, nextStatement: null, colour: C.face, tooltip: 'Moves the eyebrows, eyelids, eyes and mouth to show a feeling.' },
  { type: 'rb_blink', message0: 'blink', previousStatement: null, nextStatement: null, colour: C.face, tooltip: 'A quick blink.' },
  { type: 'rb_light', message0: 'set %1 light to %2', args0: [dd('PART', LIGHT_OPTS), { type: 'field_colour', name: 'COL', colour: '#ff3355' }], previousStatement: null, nextStatement: null, colour: C.face, tooltip: 'Changes the colour of a light.' },
  { type: 'rb_light_off', message0: 'turn %1 light off', args0: [dd('PART', LIGHT_OPTS)], previousStatement: null, nextStatement: null, colour: C.face, tooltip: 'Switches a light off.' },
  { type: 'rb_body', message0: 'set %1 colour to %2', args0: [dd('WHAT', [['body', 'body'], ['trim', 'trim']]), { type: 'field_colour', name: 'COL', colour: '#ffd166' }], previousStatement: null, nextStatement: null, colour: C.face, tooltip: 'Repaints the robot. Stop puts its own colours back.' },
  // ── Speech
  { type: 'rb_say', message0: 'say %1', args0: [num('TEXT')], previousStatement: null, nextStatement: null, colour: C.speech, tooltip: 'The robot speaks (its mouth moves) and the program carries straight on.' },
  { type: 'rb_say_wait', message0: 'say %1 until done', args0: [num('TEXT')], previousStatement: null, nextStatement: null, colour: C.speech, tooltip: 'The robot speaks, and the program waits until it has finished.' },
  { type: 'rb_voice', message0: 'set voice to %1', args0: [dd('V', Object.keys(VOICES).map(k => [k, k]))], previousStatement: null, nextStatement: null, colour: C.speech, tooltip: 'Changes how the robot sounds.' },
  { type: 'rb_speaking', message0: 'speaking?', output: 'Boolean', colour: C.speech, tooltip: 'True while the robot is talking.' },
  // ── Sensing
  { type: 'rb_ask', message0: 'ask %1 and wait', args0: [num('TEXT')], previousStatement: null, nextStatement: null, colour: C.sensing, tooltip: 'The robot asks a question out loud, and a box appears for the answer.' },
  { type: 'rb_answer', message0: 'answer', output: null, colour: C.sensing, tooltip: 'What was typed in the last “ask” box.' },
  { type: 'rb_position', message0: '%1 position', args0: [dd('M', MOTOR_OPTS)], output: 'Number', colour: C.sensing, tooltip: 'Where a motor is now, from 0 to 10.' },
  { type: 'rb_key_pressed', message0: 'key %1 pressed?', args0: [dd('KEY', KEYS)], output: 'Boolean', colour: C.sensing, tooltip: 'True while that key is held down.' },
  { type: 'rb_mouse', message0: 'mouse %1', args0: [dd('AX', [['x', 'x'], ['y', 'y']])], output: 'Number', colour: C.sensing, tooltip: 'Where the mouse is over the robot’s picture, from 0 to 10 (left to right, bottom to top). Try: move head turn to mouse x.' },
  { type: 'rb_timer', message0: 'timer', output: 'Number', colour: C.sensing, tooltip: 'Seconds since Run (or since the timer was reset).' },
  { type: 'rb_reset_timer', message0: 'reset timer', previousStatement: null, nextStatement: null, colour: C.sensing, tooltip: 'Starts the timer again from 0.' },
  // ── Control
  { type: 'rb_wait', message0: 'wait %1 seconds', args0: [num('S')], inputsInline: true, previousStatement: null, nextStatement: null, colour: C.control, tooltip: 'Pauses this script.' },
  { type: 'rb_forever', message0: 'forever %1 %2', args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }], previousStatement: null, colour: C.control, tooltip: 'Repeats the blocks inside until you press Stop.' },
  { type: 'rb_wait_until', message0: 'wait until %1', args0: [num('COND')], previousStatement: null, nextStatement: null, colour: C.control, tooltip: 'Waits until something is true.' },
  { type: 'rb_stop', message0: 'stop everything', previousStatement: null, colour: C.control, tooltip: 'Stops every script, like the Stop button.' },
  { type: 'rb_random', message0: 'pick random %1 to %2', args0: [num('A'), num('B')], inputsInline: true, output: 'Number', colour: C.ops, tooltip: 'A random whole number between the two numbers.' }
];

export function defineBlocks(Blockly) {
  Blockly.common.defineBlocksWithJsonArray(BLOCKS.map(b => { const o = { ...b }; delete o.hat; return o; }));
  // hats get the rounded "cap" top like Scratch's
  for (const t of ['rb_when_run', 'rb_when_tapped', 'rb_when_key', 'rb_when_message']) {
    const def = Blockly.Blocks[t], init = def.init;
    def.init = function () { init.call(this); this.hat = 'cap'; };
  }
}

export const HATS = ['rb_when_run', 'rb_when_tapped', 'rb_when_key', 'rb_when_message'];

const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const T = t => ({ shadow: { type: 'text', fields: { TEXT: t } } });
const blk = (type, inputs, fields) => ({ kind: 'block', type, ...(inputs ? { inputs } : {}), ...(fields ? { fields } : {}) });

export function toolbox() {
  return {
    kind: 'categoryToolbox',
    contents: [
      { kind: 'category', name: 'Events', colour: C.events, contents: [blk('rb_when_run'), blk('rb_when_tapped'), blk('rb_when_key'), blk('rb_when_message'), blk('rb_send')] },
      { kind: 'category', name: 'Moves', colour: C.moves, contents: [blk('rb_move', { N: N(8) }, { M: 'HeadTurn' }), blk('rb_start_move', { N: N(8) }, { M: 'HeadTurn' }), blk('rb_change', { N: N(1) }, { M: 'HeadTurn' }),
        blk('rb_move_time', { N: N(2), S: N(1) }, { M: 'HeadNod' }), blk('rb_look'), blk('rb_speed', { N: N(6) }), blk('rb_reset')] },
      { kind: 'category', name: 'Face & lights', colour: C.face, contents: [blk('rb_face'), blk('rb_blink'), blk('rb_light'), blk('rb_light_off'), blk('rb_body')] },
      { kind: 'category', name: 'Speech', colour: C.speech, contents: [blk('rb_say', { TEXT: T('Hello!') }), blk('rb_say_wait', { TEXT: T('Hello!') }), blk('rb_voice'), blk('rb_speaking')] },
      { kind: 'category', name: 'Sensing', colour: C.sensing, contents: [blk('rb_ask', { TEXT: T('What is your name?') }), blk('rb_answer'), blk('rb_position'), blk('rb_key_pressed'), blk('rb_mouse'), blk('rb_timer'), blk('rb_reset_timer')] },
      { kind: 'category', name: 'Control', colour: C.control, contents: [blk('rb_wait', { S: N(1) }), blk('controls_repeat_ext', { TIMES: N(3) }), blk('rb_forever'),
        blk('controls_if'), { kind: 'block', type: 'controls_if', extraState: { hasElse: true } }, blk('rb_wait_until'), blk('controls_whileUntil'), blk('rb_stop')] },
      { kind: 'category', name: 'Operators', colour: C.ops, contents: [blk('math_number'), blk('math_arithmetic', { A: N(1), B: N(1) }), blk('rb_random', { A: N(1), B: N(10) }),
        blk('logic_compare', { A: N(0), B: N(5) }), blk('logic_operation'), blk('logic_negate'), blk('logic_boolean'), blk('text'), blk('text_join'),
        blk('math_round'), blk('math_modulo', { DIVIDEND: N(10), DIVISOR: N(3) })] },
      { kind: 'category', name: 'Variables', colour: C.vars, custom: 'VARIABLE' }
    ]
  };
}

// the program a new Robot Lab project starts with
export function starterProgram(name = 'Sparky') {
  const chain = (list) => { let first = null, prev = null; for (const b of list) { if (prev) prev.next = { block: b }; else first = b; prev = b; } return first; };
  const hat = { type: 'rb_when_run', x: 24, y: 24 };
  hat.next = { block: chain([
    { type: 'rb_face', fields: { FACE: 'happy' } },
    { type: 'rb_say_wait', inputs: { TEXT: { shadow: { type: 'text', fields: { TEXT: 'Hello! I am ' + name + '.' } } } } },
    { type: 'rb_look', fields: { DIR: 'left' } },
    { type: 'rb_look', fields: { DIR: 'right' } },
    { type: 'rb_look', fields: { DIR: 'ahead' } },
    { type: 'rb_blink' },
    { type: 'rb_light', fields: { PART: 'all', COL: '#7cff6b' } },
    { type: 'rb_say_wait', inputs: { TEXT: { shadow: { type: 'text', fields: { TEXT: 'Tap me, or change my blocks!' } } } } }
  ]) };
  const tap = { type: 'rb_when_tapped', x: 24, y: 640, fields: { PART: 'any' } };
  tap.next = { block: chain([
    { type: 'rb_face', fields: { FACE: 'surprised' } },
    { type: 'rb_say_wait', inputs: { TEXT: { shadow: { type: 'text', fields: { TEXT: 'That tickles!' } } } } },
    { type: 'rb_face', fields: { FACE: 'happy' } }
  ]) };
  return { blocks: { languageVersion: 0, blocks: [hat, tap] } };
}
