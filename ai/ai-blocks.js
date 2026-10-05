/* CodeJump · AI Lab — the blocks (ai_*), the toolbox and the starter program ("Guess my drawing").
 * Uses the page's Blockly 10 (passed in). Loops, if, maths, text and variables are Blockly's own standard blocks;
 * ai-runner.js runs them all. The label dropdowns list the project's own labels: the app calls setLabelNames() with
 * the labels (plus any names the saved blocks use, so Blockly never resets a dropdown it can't find a name for).
 */
import { SOUNDS } from '../world/world-sound.js';

const C = { events: '#d9a43a', ai: '#0fa3a3', screen: '#9966ff', sound: '#cf63cf', score: '#e05a8a', control: '#e8a33c', ops: '#59c059', vars: '#ff8c1a' };
let names = ['thing 1', 'thing 2'];
export function setLabelNames(list) { const seen = new Set(), out = []; for (const n of list || []) { const s = String(n || '').trim(); if (s && !seen.has(s)) { seen.add(s); out.push(s); } } names = out.length ? out : ['thing 1']; }
export function labelOptions() { return names.map(n => [n, n]); }

const num = name => ({ type: 'input_value', name, check: null });
const dd = (name, options) => ({ type: 'field_dropdown', name, options });
const LABEL = { type: 'ai_label_field', name: 'LABEL' }; // replaced with a dynamic dropdown in defineBlocks

export const BLOCKS = [
  // ── Events
  { type: 'ai_when_run', message0: 'when Run is clicked', nextStatement: null, colour: C.events, tooltip: 'Starts this script when you press Run.' },
  { type: 'ai_when_guess', message0: 'when the AI makes a guess', nextStatement: null, colour: C.events, tooltip: 'Starts this script each time someone finishes a drawing (or types something and presses Enter) and the AI has guessed what it is.' },
  { type: 'ai_when_thinks', message0: 'when the AI thinks it’s %1', args0: [LABEL], nextStatement: null, colour: C.events, tooltip: 'Starts this script when the AI’s best guess for a drawing is this label.' },
  { type: 'ai_when_message', message0: 'when I receive %1', args0: [{ type: 'field_input', name: 'MSG', text: 'go' }], nextStatement: null, colour: C.events, tooltip: 'Starts this script when a message with this name is sent.' },
  { type: 'ai_send', message0: 'send message %1', args0: [{ type: 'field_input', name: 'MSG', text: 'go' }], previousStatement: null, nextStatement: null, colour: C.events, tooltip: 'Starts every “when I receive” script with this name.' },
  // ── AI
  { type: 'ai_guess', message0: 'AI’s guess', output: null, colour: C.ai, tooltip: 'The label the AI thinks the last drawing (or typed message) is.' },
  { type: 'ai_confidence', message0: 'how sure the AI is (%)', output: 'Number', colour: C.ai, tooltip: 'How sure the AI is about its guess, from 0 to 100.' },
  { type: 'ai_thinks', message0: 'AI thinks it’s %1 ?', args0: [LABEL], output: 'Boolean', colour: C.ai, tooltip: 'True if the AI’s best guess for the last drawing is this label.' },
  { type: 'ai_conf_of', message0: 'how sure it’s %1 (%)', args0: [LABEL], output: 'Number', colour: C.ai, tooltip: 'How sure the AI is that the last drawing is this label, from 0 to 100.' },
  { type: 'ai_random_label', message0: 'a random label', output: null, colour: C.ai, tooltip: 'One of your labels, picked at random. Great for “draw a …!” games.' },
  { type: 'ai_wait_drawing', message0: 'wait for the next guess', previousStatement: null, nextStatement: null, colour: C.ai, tooltip: 'Waits until someone finishes a drawing (or types something) and the AI has guessed it.' },
  { type: 'ai_clear', message0: 'clear the pad', previousStatement: null, nextStatement: null, colour: C.ai, tooltip: 'Wipes the drawing pad (or the typing box) ready for the next one.' },
  // ── Screen
  { type: 'ai_say', message0: 'show %1', args0: [num('TEXT')], previousStatement: null, nextStatement: null, colour: C.screen, tooltip: 'Shows a message in the speech bubble above the pad.' },
  { type: 'ai_say_for', message0: 'show %1 for %2 seconds', args0: [num('TEXT'), num('S')], inputsInline: true, previousStatement: null, nextStatement: null, colour: C.screen, tooltip: 'Shows a message, waits, then hides it.' },
  { type: 'ai_speak', message0: 'say %1 out loud', args0: [num('TEXT')], previousStatement: null, nextStatement: null, colour: C.screen, tooltip: 'Reads the words out loud (and shows them), and waits until it has finished.' },
  { type: 'ai_colour', message0: 'set the pad colour to %1', args0: [{ type: 'field_colour', name: 'COL', colour: '#fff3b0' }], previousStatement: null, nextStatement: null, colour: C.screen, tooltip: 'Changes the colour of the pad (or the typing box).' },
  // ── Sound
  { type: 'ai_sound', message0: 'play sound %1', args0: [dd('S', SOUNDS)], previousStatement: null, nextStatement: null, colour: C.sound, tooltip: 'Plays a sound effect.' },
  // ── Score
  { type: 'ai_change_score', message0: 'change score by %1', args0: [num('N')], inputsInline: true, previousStatement: null, nextStatement: null, colour: C.score, tooltip: 'Adds to the score (shown in the corner of the pad).' },
  { type: 'ai_set_score', message0: 'set score to %1', args0: [num('N')], inputsInline: true, previousStatement: null, nextStatement: null, colour: C.score, tooltip: 'Sets the score.' },
  { type: 'ai_score', message0: 'score', output: 'Number', colour: C.score, tooltip: 'The score.' },
  // ── Control
  { type: 'ai_wait', message0: 'wait %1 seconds', args0: [num('S')], inputsInline: true, previousStatement: null, nextStatement: null, colour: C.control, tooltip: 'Pauses this script.' },
  { type: 'ai_forever', message0: 'forever %1 %2', args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }], previousStatement: null, colour: C.control, tooltip: 'Repeats the blocks inside until you press Stop.' },
  { type: 'ai_wait_until', message0: 'wait until %1', args0: [num('COND')], previousStatement: null, nextStatement: null, colour: C.control, tooltip: 'Waits until something is true.' },
  { type: 'ai_stop', message0: 'stop everything', previousStatement: null, colour: C.control, tooltip: 'Stops every script, like the Stop button.' },
  { type: 'ai_random', message0: 'pick random %1 to %2', args0: [num('A'), num('B')], inputsInline: true, output: 'Number', colour: C.ops, tooltip: 'A random whole number between the two numbers.' }
];
export const HATS = ['ai_when_run', 'ai_when_guess', 'ai_when_thinks', 'ai_when_message'];

export function defineBlocks(Blockly) {
  const defs = BLOCKS.map(b => ({ ...b, args0: b.args0 && b.args0.map(a => (a.type === 'ai_label_field' ? dd('LABEL', [['thing', 'thing']]) : a)) }));
  Blockly.common.defineBlocksWithJsonArray(defs);
  for (const b of BLOCKS) {
    const def = Blockly.Blocks[b.type], init = def.init, hasLabel = (b.args0 || []).some(a => a.type === 'ai_label_field');
    def.init = function () {
      init.call(this);
      if (HATS.includes(b.type)) this.hat = 'cap';
      if (hasLabel) { // the project's own labels
        const input = this.inputList.find(i => i.fieldRow.some(f => f.name === 'LABEL'));
        const at = input.fieldRow.findIndex(f => f.name === 'LABEL');
        input.removeField('LABEL');
        input.insertFieldAt(at, new Blockly.FieldDropdown(labelOptions), 'LABEL');
      }
    };
  }
}

const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const T = t => ({ shadow: { type: 'text', fields: { TEXT: t } } });
const blk = (type, inputs, fields) => ({ kind: 'block', type, ...(inputs ? { inputs } : {}), ...(fields ? { fields } : {}) });

export function toolbox() {
  return {
    kind: 'categoryToolbox',
    contents: [
      { kind: 'category', name: 'Events', colour: C.events, contents: [blk('ai_when_run'), blk('ai_when_guess'), blk('ai_when_thinks'), blk('ai_when_message'), blk('ai_send')] },
      { kind: 'category', name: 'AI', colour: C.ai, contents: [blk('ai_guess'), blk('ai_confidence'), blk('ai_thinks'), blk('ai_conf_of'), blk('ai_random_label'), blk('ai_wait_drawing'), blk('ai_clear')] },
      { kind: 'category', name: 'Screen', colour: C.screen, contents: [blk('ai_say', { TEXT: T('Hello!') }), blk('ai_say_for', { TEXT: T('Hello!'), S: N(2) }), blk('ai_speak', { TEXT: T('Hello!') }), blk('ai_colour')] },
      { kind: 'category', name: 'Sound', colour: C.sound, contents: [blk('ai_sound')] },
      { kind: 'category', name: 'Score', colour: C.score, contents: [blk('ai_change_score', { N: N(1) }), blk('ai_set_score', { N: N(0) }), blk('ai_score')] },
      { kind: 'category', name: 'Control', colour: C.control, contents: [blk('ai_wait', { S: N(1) }), blk('controls_repeat_ext', { TIMES: N(3) }), blk('ai_forever'),
        blk('controls_if'), { kind: 'block', type: 'controls_if', extraState: { hasElse: true } }, blk('ai_wait_until'), blk('controls_whileUntil'), blk('ai_stop')] },
      { kind: 'category', name: 'Operators', colour: C.ops, contents: [blk('math_number'), blk('math_arithmetic', { A: N(1), B: N(1) }), blk('ai_random', { A: N(1), B: N(10) }),
        blk('logic_compare', { A: N(0), B: N(50) }), blk('logic_operation'), blk('logic_negate'), blk('logic_boolean'), blk('text'),
        { kind: 'block', type: 'text_join', extraState: { itemCount: 2 }, inputs: { ADD0: T('I think it’s a '), ADD1: { block: { type: 'ai_guess' } } } }, blk('math_round')] },
      { kind: 'category', name: 'Variables', colour: C.vars, custom: 'VARIABLE' }
    ]
  };
}

// a new project's program: "Guess my drawing"
export function starterProgram(kind = 'draw') {
  const chain = list => { let first = null, prev = null; for (const b of list) { if (prev) prev.next = { block: b }; else first = b; prev = b; } return first; };
  const run = { type: 'ai_when_run', x: 24, y: 24 };
  run.next = { block: chain([{ type: 'ai_say', inputs: { TEXT: T(kind === 'text' ? 'Type something and I’ll guess what it is!' : 'Draw something and I’ll guess what it is!') } }]) };
  const g = { type: 'ai_when_guess', x: 24, y: 150 };
  g.next = { block: chain([
    { type: 'controls_if', extraState: { hasElse: true }, inputs: {
      IF0: { block: { type: 'logic_compare', fields: { OP: 'GT' }, inputs: { A: { block: { type: 'ai_confidence' } }, B: N(60) } } },
      DO0: { block: chain([
        { type: 'ai_speak', inputs: { TEXT: { block: { type: 'text_join', extraState: { itemCount: 2 }, inputs: { ADD0: T('I think it’s a '), ADD1: { block: { type: 'ai_guess' } } } } } } },
        { type: 'ai_sound', fields: { S: 'magic' } }
      ]) },
      ELSE: { block: { type: 'ai_speak', inputs: { TEXT: T('Hmm, I’m not sure. Try again!') } } }
    } },
    { type: 'ai_wait', inputs: { S: N(1) } },
    { type: 'ai_clear' }
  ]) };
  return { blocks: { languageVersion: 0, blocks: [run, g] } };
}
