/* CodeJump · Train Lab — the blocks (tr_*), the toolbox and the starter program.
 * Uses the page's Blockly 10 (passed in). Loops, if, maths, text and variables are Blockly's own standard blocks;
 * train-runner.js runs them all. Each train has its own scripts.
 */
import { SNAP_KEYS } from './train-model.js';

const C = { events: '#d9a43a', drive: '#4c97ff', lights: '#9966ff', sound: '#cf63cf', sensing: '#4cb0d4', control: '#e8a33c', ops: '#59c059', vars: '#ff8c1a' };
const COLOUR_OPTS = SNAP_KEYS.map(k => [k, k]);
export const TRAIN_SOUNDS = [['horn', 'horn'], ['whistle', 'whistle'], ['bell', 'bell'], ['chuff', 'chuff'], ['beep', 'beep'], ['ding dong', 'dingdong']];
const KEYS = [['space', 'space'], ['up arrow', 'up'], ['down arrow', 'down'], ['left arrow', 'left'], ['right arrow', 'right'],
  ...'abcdefghijklmnopqrstuvwxyz0123456789'.split('').map(k => [k, k])];
const COMMAND_OPTS = [['any command', 'any'], ['slow', 'slow'], ['medium', 'medium'], ['fast', 'fast'], ['stop 2 seconds', 'stop 2 seconds'], ['stop 5 seconds', 'stop 5 seconds'],
  ['stop 10 seconds', 'stop 10 seconds'], ['reverse', 'reverse'], ['end route', 'end route'], ['drop off wagon', 'drop off wagon'], ['stop and drop off wagon', 'stop and drop off wagon'],
  ['reverse drop off wagon', 'reverse drop off wagon'], ...['red', 'green', 'blue', 'yellow', 'cyan', 'white', 'magenta'].map(c => ['custom (white magenta ' + c + ')', 'custom ' + c])];
const SPEED_OPTS = [['slow', 'slow'], ['medium', 'medium'], ['fast', 'fast']];
const WAY_OPTS = [['left', 'left'], ['straight on', 'straight'], ['right', 'right'], ['a random way', 'random']];

const num = name => ({ type: 'input_value', name, check: null });
const dd = (name, options) => ({ type: 'field_dropdown', name, options });
const stmt = { previousStatement: null, nextStatement: null };

export const BLOCKS = [
  // ── Events
  { type: 'tr_when_run', message0: 'when Run is clicked', nextStatement: null, colour: C.events, tooltip: 'Starts this script when you press Run.' },
  { type: 'tr_when_colour', message0: 'when I see %1', args0: [dd('COL', [['any colour', 'any'], ...COLOUR_OPTS])], nextStatement: null, colour: C.events, tooltip: 'Starts this script when this train drives over a colour snap.' },
  { type: 'tr_when_command', message0: 'when I read the snap command %1', args0: [dd('CMD', COMMAND_OPTS)], nextStatement: null, colour: C.events, tooltip: 'Starts this script when this train reads a snap command (a row of snaps starting with white).' },
  { type: 'tr_when_split', message0: 'when I go through a split', nextStatement: null, colour: C.events, tooltip: 'Starts this script each time this train goes through a split (where the track divides).' },
  { type: 'tr_when_end', message0: 'when I reach the end of the track', nextStatement: null, colour: C.events, tooltip: 'Starts this script when this train stops at a buffer stop or where the track runs out.' },
  { type: 'tr_when_bump', message0: 'when I bump into a train', nextStatement: null, colour: C.events, tooltip: 'Starts this script when this train bumps into another train. Both trains stop.' },
  { type: 'tr_when_tapped', message0: 'when this train is tapped', nextStatement: null, colour: C.events, tooltip: 'Starts this script when someone taps or clicks this train (while the program runs).' },
  { type: 'tr_when_key', message0: 'when %1 key pressed', args0: [dd('KEY', KEYS)], nextStatement: null, colour: C.events, tooltip: 'Starts this script when that key is pressed (while the program runs).' },
  { type: 'tr_when_message', message0: 'when I receive %1', args0: [{ type: 'field_input', name: 'MSG', text: 'go' }], nextStatement: null, colour: C.events, tooltip: 'Starts this script when a message with this name is sent by any train.' },
  { type: 'tr_send', message0: 'send message %1', args0: [{ type: 'field_input', name: 'MSG', text: 'go' }], ...stmt, colour: C.events, tooltip: 'Starts every “when I receive” script with this name, on every train.' },
  // ── Drive
  { type: 'tr_drive', message0: 'drive at %1 speed', args0: [dd('SPEED', SPEED_OPTS)], ...stmt, colour: C.drive, tooltip: 'Starts the train moving (or changes its speed) and goes straight on to the next block. Press Run and every train already sets off at medium speed, like pressing its button.' },
  { type: 'tr_set_speed', message0: 'set speed to %1 %%', args0: [num('N')], inputsInline: true, ...stmt, colour: C.drive, tooltip: 'Sets the speed from 0 (stopped) to 100 (as fast as it goes).' },
  { type: 'tr_drive_pieces', message0: 'drive %1 track pieces at %2 speed', args0: [num('N'), dd('SPEED', SPEED_OPTS)], inputsInline: true, ...stmt, colour: C.drive, tooltip: 'Drives this far, then stops, and waits until it has stopped.' },
  { type: 'tr_stop', message0: 'stop', ...stmt, colour: C.drive, tooltip: 'Brakes until the train has stopped.' },
  { type: 'tr_stop_for', message0: 'stop for %1 seconds', args0: [num('S')], inputsInline: true, ...stmt, colour: C.drive, tooltip: 'Stops, waits, then sets off again at the same speed. Good for stations!' },
  { type: 'tr_turn_around', message0: 'turn around', ...stmt, colour: C.drive, tooltip: 'Stops, then goes back the way it came at the same speed.' },
  { type: 'tr_next_split', message0: 'at the next split go %1', args0: [dd('WAY', WAY_OPTS)], ...stmt, colour: C.drive, tooltip: 'Chooses the way at the next split this train comes to, whatever snap is in the split. After that it goes back to its usual way.' },
  { type: 'tr_snaps', message0: 'turn snap commands %1', args0: [dd('ON', [['on', 'on'], ['off', 'off']])], ...stmt, colour: C.drive, tooltip: 'With snap commands on (as the train starts), it obeys rows of snaps like white-red (stop) by itself. Turn them off to drive it only with your blocks.' },
  { type: 'tr_every_split', message0: 'at every split go %1', args0: [dd('WAY', WAY_OPTS)], ...stmt, colour: C.drive, tooltip: 'The way this train goes at a split that has no snap in its slot (to start with it picks a random way, like the real train).' },
  // ── Lights
  { type: 'tr_headlight', message0: 'set headlight to %1', args0: [{ type: 'field_colour', name: 'COL', colour: '#ffffff' }], ...stmt, colour: C.lights, tooltip: 'Changes the colour of the light at the front.' },
  { type: 'tr_toplight', message0: 'set roof light to %1', args0: [{ type: 'field_colour', name: 'COL', colour: '#29c46a' }], ...stmt, colour: C.lights, tooltip: 'Changes the colour of the light on the roof.' },
  { type: 'tr_lights_off', message0: 'turn %1 off', args0: [dd('WHICH', [['both lights', 'both'], ['the headlight', 'head'], ['the roof light', 'top']])], ...stmt, colour: C.lights, tooltip: 'Switches lights off.' },
  // ── Sound
  { type: 'tr_sound', message0: 'play %1', args0: [dd('SND', TRAIN_SOUNDS)], ...stmt, colour: C.sound, tooltip: 'Plays a sound and goes straight on.' },
  { type: 'tr_sound_wait', message0: 'play %1 until done', args0: [dd('SND', TRAIN_SOUNDS)], ...stmt, colour: C.sound, tooltip: 'Plays a sound and waits until it ends.' },
  // ── Sensing
  { type: 'tr_last_colour', message0: 'last colour seen', output: null, colour: C.sensing, tooltip: 'The colour of the last snap this train drove over (empty before it has seen one).' },
  { type: 'tr_last_command', message0: 'last snap command', output: null, colour: C.sensing, tooltip: 'The last snap command this train read, like “slow” or “stop 2 seconds”.' },
  { type: 'tr_saw', message0: 'last colour was %1?', args0: [dd('COL', COLOUR_OPTS)], output: 'Boolean', colour: C.sensing, tooltip: 'True if the last snap this train drove over was this colour.' },
  { type: 'tr_speed', message0: 'speed', output: 'Number', colour: C.sensing, tooltip: 'How fast this train is going now, from 0 to 100.' },
  { type: 'tr_moving', message0: 'moving?', output: 'Boolean', colour: C.sensing, tooltip: 'True while this train is moving.' },
  { type: 'tr_distance', message0: 'track pieces driven', output: 'Number', colour: C.sensing, tooltip: 'How far this train has gone since Run, in track pieces.' },
  { type: 'tr_key_pressed', message0: 'key %1 pressed?', args0: [dd('KEY', KEYS)], output: 'Boolean', colour: C.sensing, tooltip: 'True while that key is held down.' },
  { type: 'tr_timer', message0: 'timer', output: 'Number', colour: C.sensing, tooltip: 'Seconds since Run (or since the timer was reset).' },
  { type: 'tr_reset_timer', message0: 'reset timer', ...stmt, colour: C.sensing, tooltip: 'Starts the timer again from 0.' },
  // ── Control
  { type: 'tr_wait', message0: 'wait %1 seconds', args0: [num('S')], inputsInline: true, ...stmt, colour: C.control, tooltip: 'Pauses this script. The train keeps going while it waits.' },
  { type: 'tr_forever', message0: 'forever %1 %2', args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }], previousStatement: null, colour: C.control, tooltip: 'Repeats the blocks inside until you press Stop.' },
  { type: 'tr_wait_until', message0: 'wait until %1', args0: [num('COND')], ...stmt, colour: C.control, tooltip: 'Waits until something is true.' },
  { type: 'tr_stop_all', message0: 'stop everything', previousStatement: null, colour: C.control, tooltip: 'Stops every train and every script, like the Stop button.' },
  { type: 'tr_random', message0: 'pick random %1 to %2', args0: [num('A'), num('B')], inputsInline: true, output: 'Number', colour: C.ops, tooltip: 'A random whole number between the two numbers.' }
];

export const HATS = ['tr_when_run', 'tr_when_colour', 'tr_when_command', 'tr_when_split', 'tr_when_end', 'tr_when_bump', 'tr_when_tapped', 'tr_when_key', 'tr_when_message'];

export function defineBlocks(Blockly) {
  Blockly.common.defineBlocksWithJsonArray(BLOCKS);
  for (const t of HATS) { // the rounded "cap" top, like Scratch's hats
    const def = Blockly.Blocks[t], init = def.init;
    def.init = function () { init.call(this); this.hat = 'cap'; };
  }
}

const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const blk = (type, inputs, fields) => ({ kind: 'block', type, ...(inputs ? { inputs } : {}), ...(fields ? { fields } : {}) });

export function toolbox() {
  return {
    kind: 'categoryToolbox',
    contents: [
      { kind: 'category', name: 'Events', colour: C.events, contents: [blk('tr_when_run'), blk('tr_when_colour', null, { COL: 'red' }), blk('tr_when_command', null, { CMD: 'any' }), blk('tr_when_split'), blk('tr_when_end'),
        blk('tr_when_bump'), blk('tr_when_tapped'), blk('tr_when_key'), blk('tr_when_message'), blk('tr_send')] },
      { kind: 'category', name: 'Drive', colour: C.drive, contents: [blk('tr_drive', null, { SPEED: 'medium' }), blk('tr_set_speed', { N: N(50) }), blk('tr_drive_pieces', { N: N(3) }, { SPEED: 'medium' }),
        blk('tr_stop'), blk('tr_stop_for', { S: N(2) }), blk('tr_turn_around'), blk('tr_next_split', null, { WAY: 'right' }), blk('tr_every_split', null, { WAY: 'left' }), blk('tr_snaps')] },
      { kind: 'category', name: 'Lights', colour: C.lights, contents: [blk('tr_headlight'), blk('tr_toplight'), blk('tr_lights_off')] },
      { kind: 'category', name: 'Sound', colour: C.sound, contents: [blk('tr_sound'), blk('tr_sound_wait')] },
      { kind: 'category', name: 'Sensing', colour: C.sensing, contents: [blk('tr_last_colour'), blk('tr_last_command'), blk('tr_saw'), blk('tr_speed'), blk('tr_moving'), blk('tr_distance'),
        blk('tr_key_pressed'), blk('tr_timer'), blk('tr_reset_timer')] },
      { kind: 'category', name: 'Control', colour: C.control, contents: [blk('tr_wait', { S: N(1) }), blk('controls_repeat_ext', { TIMES: N(3) }), blk('tr_forever'),
        blk('controls_if'), { kind: 'block', type: 'controls_if', extraState: { hasElse: true } }, blk('tr_wait_until'), blk('controls_whileUntil'), blk('tr_stop_all')] },
      { kind: 'category', name: 'Operators', colour: C.ops, contents: [blk('math_number'), blk('math_arithmetic', { A: N(1), B: N(1) }), blk('tr_random', { A: N(1), B: N(10) }),
        blk('logic_compare', { A: N(0), B: N(5) }), blk('logic_operation'), blk('logic_negate'), blk('logic_boolean'), blk('text'), blk('text_join'),
        blk('math_round'), blk('math_modulo', { DIVIDEND: N(10), DIVISOR: N(3) })] },
      { kind: 'category', name: 'Variables', colour: C.vars, custom: 'VARIABLE' }
    ]
  };
}

const chain = list => { let first = null, prev = null; for (const b of list) { if (prev) prev.next = { block: b }; else first = b; prev = b; } return first; };
const script = (hat, x, y, list) => ({ ...hat, x, y, next: { block: chain(list) } });

// a new project's train starts with no blocks at all: like the real train, it already drives and obeys the snaps
export function starterProgram() { return { blocks: { languageVersion: 0, blocks: [] } }; }
// a train added later starts with no blocks too
export function newTrainProgram() { return starterProgram(); }
