// App Lab blocks for the editor: Blockly definitions, the toolbox and the theme (CodeJump's colours: Robot Lab events,
// Stage looks/sound/operators/variables, the Stage pen colour for screens). app-run.js runs the same blocks from JSON.
import { CAN, SOUNDS, PICTURES, PICTURE_KEYS, allParts } from './app-model.js';

export const C = { events: '#d9a43a', looks: '#9966ff', sound: '#cf63cf', control: '#e8a33c', ops: '#59c059', vars: '#ff8c1a', screens: '#0fbd8c' };
export const HAT_TYPES = ['app_when_starts', 'app_when_pressed', 'app_when_opens', 'app_when_changed'];
let defined = false, theme = null;

// part and screen dropdowns list what is really in the app; a part that has gone still shows (as "deleted") so nothing is lost
export function defineBlocks(Blockly, getProject) {
  if (defined) return; defined = true;
  const opts = (kind, cur) => {
    const p = getProject(); let o;
    if (kind === 'screen') o = p.app.order.map(id => [p['s' + id].name, id]);
    else { const want = CAN[kind]; o = allParts(p).filter(x => !want || want.includes(x.t)).map(x => [x.name, x.id]); }
    if (cur && cur !== 'none' && !o.some(x => x[1] === cur)) o.push([kind === 'screen' ? '(deleted screen)' : '(deleted part)', cur]);
    if (!o.length) o.push([kind === 'screen' ? 'Screen 1' : '(no part yet)', 'none']);
    return o;
  };
  class FieldPart extends Blockly.FieldDropdown {
    constructor(kind) { super(function () { return opts(kind, this.getValue && this.getValue()); }); this.partKind = kind; }
    static fromJson(o) { return new FieldPart(o.kind); }
    doClassValidation_(v) { return typeof v === 'string' && v ? v : null; } // keep values from other screens / partners
  }
  Blockly.fieldRegistry.register('field_part', FieldPart);
  const part = (kind, name) => ({ type: 'field_part', name: name || 'PART', kind });
  const val = (name, check) => Object.assign({ type: 'input_value', name }, check ? { check } : {});
  const S = o => Object.assign({ previousStatement: null, nextStatement: null }, o);
  const pics = PICTURE_KEYS.map(k => [PICTURES[k][0], k]);
  Blockly.common.defineBlocksWithJsonArray([
    { type: 'app_when_starts', message0: 'when the app starts', nextStatement: null, colour: C.events, tooltip: 'Runs once when your app opens.' },
    { type: 'app_when_pressed', message0: 'when %1 is pressed', args0: [part()], nextStatement: null, colour: C.events, tooltip: 'Runs when someone presses this part.' },
    { type: 'app_when_opens', message0: 'when %1 opens', args0: [part('screen', 'SCREEN')], nextStatement: null, colour: C.events, tooltip: 'Runs each time this screen appears. Loops started here stop when you leave the screen.' },
    { type: 'app_when_changed', message0: 'when %1 is changed', args0: [part('changed')], nextStatement: null, colour: C.events, tooltip: 'Runs when someone types in a text box, moves a slider or flicks a switch.' },
    S({ type: 'app_set_text', message0: 'set %1 text to %2', args0: [part('text'), val('TEXT')], inputsInline: true, colour: C.looks, tooltip: 'Changes the words on a part.' }),
    S({ type: 'app_set_colour', message0: 'set %1 %2 to %3', args0: [part('colour'), { type: 'field_dropdown', name: 'WHAT', options: [['colour', 'color'], ['background', 'bg']] }, { type: 'field_colour', name: 'COL', colour: '#e8618c' }], colour: C.looks, tooltip: 'Changes the colour of a part’s words, or its background.' }),
    S({ type: 'app_show', message0: 'show %1', args0: [part()], colour: C.looks, tooltip: 'Makes a part appear.' }),
    S({ type: 'app_hide', message0: 'hide %1', args0: [part()], colour: C.looks, tooltip: 'Makes a part disappear.' }),
    S({ type: 'app_move', message0: 'move %1 to x %2 y %3', args0: [part(), val('X', 'Number'), val('Y', 'Number')], inputsInline: true, colour: C.looks, tooltip: 'Moves a part. x is across (0 to 360), y is down (0 to 640).' }),
    S({ type: 'app_set_picture', message0: 'set %1 picture to %2', args0: [part('image'), { type: 'field_dropdown', name: 'PIC', options: pics }], colour: C.looks, tooltip: 'Shows a different picture.' }),
    S({ type: 'app_set_value', message0: 'set %1 to %2', args0: [part('slider'), val('VALUE', 'Number')], inputsInline: true, colour: C.looks, tooltip: 'Moves a slider.' }),
    S({ type: 'app_set_switch', message0: 'turn %1 %2', args0: [part('switch'), { type: 'field_dropdown', name: 'ON', options: [['on', 'on'], ['off', 'off']] }], colour: C.looks, tooltip: 'Turns a switch on or off.' }),
    S({ type: 'app_list_add', message0: 'add %1 to %2', args0: [val('TEXT'), part('list')], inputsInline: true, colour: C.looks, tooltip: 'Adds a line to the bottom of a list.' }),
    S({ type: 'app_list_clear', message0: 'empty %1', args0: [part('list')], colour: C.looks, tooltip: 'Takes every line out of a list.' }),
    { type: 'app_text_of', message0: 'text of %1', args0: [part('text')], output: null, colour: C.looks, tooltip: 'The words on a part, or what someone typed in a text box.' },
    { type: 'app_slider_value', message0: '%1 value', args0: [part('slider')], output: 'Number', colour: C.looks, tooltip: 'Where the slider is.' },
    { type: 'app_switch_on', message0: '%1 is on', args0: [part('switch')], output: 'Boolean', colour: C.looks, tooltip: 'True when the switch is on.' },
    { type: 'app_list_count', message0: 'number of lines in %1', args0: [part('list')], output: 'Number', colour: C.looks, tooltip: 'How many lines the list has.' },
    S({ type: 'app_every', message0: 'every %1 seconds %2 %3', args0: [val('SECS', 'Number'), { type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }], inputsInline: true, colour: C.control, tooltip: 'Runs the blocks inside again and again, with a wait in between.' }),
    S({ type: 'app_wait', message0: 'wait %1 seconds', args0: [val('SECS', 'Number')], inputsInline: true, colour: C.control, tooltip: 'Pauses this script.' }),
    S({ type: 'app_remember', message0: 'remember %1', args0: [{ type: 'field_variable', name: 'VAR', variable: 'score' }], colour: C.vars, tooltip: 'Saves this variable on the phone, so it is still there next time the app opens.' }),
    { type: 'app_remembered', message0: 'remembered %1', args0: [{ type: 'field_variable', name: 'VAR', variable: 'score' }], output: null, colour: C.vars, tooltip: 'The value saved on the phone (0 if nothing is saved yet).' },
    S({ type: 'app_play_sound', message0: 'play sound %1', args0: [{ type: 'field_dropdown', name: 'SOUND', options: SOUNDS.map(s => [s, s]) }], colour: C.sound, tooltip: 'Plays a sound.' }),
    S({ type: 'app_say', message0: 'say %1', args0: [val('TEXT')], inputsInline: true, colour: C.sound, tooltip: 'The phone says the words out loud (and shows them).' }),
    S({ type: 'app_goto', message0: 'go to %1', args0: [part('screen', 'SCREEN')], colour: C.screens, tooltip: 'Shows a different screen.' }),
    S({ type: 'app_message', message0: 'show message %1', args0: [val('TEXT')], inputsInline: true, colour: C.screens, tooltip: 'Pops up a message at the bottom of the screen for a moment.' })
  ]);
  for (const t of HAT_TYPES) { const def = Blockly.Blocks[t], init = def.init; def.init = function () { init.call(this); this.hat = 'cap'; }; }
  Blockly.Msg.MATH_RANDOM_INT_TITLE = 'random %1 to %2';
  Blockly.Msg.MATH_CHANGE_TITLE = 'change %1 by %2';
  Blockly.Msg.VARIABLES_SET = 'set %1 to %2';
  Blockly.Msg.CONTROLS_REPEAT_TITLE = 'repeat %1 times';
}

const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const TX = t => ({ shadow: { type: 'text', fields: { TEXT: t } } });
const bk = (type, inputs, fields, extra) => Object.assign({ kind: 'block', type }, inputs ? { inputs } : {}, fields ? { fields } : {}, extra || {});
export function toolbox() {
  return { kind: 'categoryToolbox', contents: [
    { kind: 'category', name: 'Events', colour: C.events, contents: [bk('app_when_pressed'), bk('app_when_starts'), bk('app_when_opens'), bk('app_when_changed')] },
    { kind: 'category', name: 'Parts', colour: C.looks, contents: [bk('app_set_text', { TEXT: TX('Hello!') }), bk('app_text_of'), bk('app_set_colour'), bk('app_show'), bk('app_hide'),
      bk('app_move', { X: N(100), Y: N(200) }), bk('app_set_picture'), bk('app_set_value', { VALUE: N(5) }), bk('app_slider_value'), bk('app_set_switch'), bk('app_switch_on'),
      bk('app_list_add', { TEXT: TX('New line') }), bk('app_list_clear'), bk('app_list_count')] },
    { kind: 'category', name: 'Control', colour: C.control, contents: [bk('controls_if'), bk('controls_if', null, null, { extraState: { hasElse: true } }), bk('app_every', { SECS: N(1) }),
      bk('app_wait', { SECS: N(1) }), bk('controls_repeat_ext', { TIMES: N(10) }), bk('controls_whileUntil')] },
    { kind: 'category', name: 'Operators', colour: C.ops, contents: [bk('math_random_int', { FROM: N(1), TO: N(6) }), bk('logic_compare', { A: N(0), B: N(10) }),
      bk('math_arithmetic', { A: N(1), B: N(1) }), bk('logic_operation'), bk('logic_negate'), bk('logic_boolean'), bk('math_round', { NUM: N(3.5) }), bk('math_modulo', { DIVIDEND: N(10), DIVISOR: N(3) }),
      bk('math_number'), bk('text'), bk('text_join'), bk('text_length', { VALUE: TX('hello') })] },
    { kind: 'category', name: 'Variables', colour: C.vars, custom: 'APP_VARS' },
    { kind: 'category', name: 'Sound', colour: C.sound, contents: [bk('app_play_sound'), bk('app_say', { TEXT: TX('Hello!') })] },
    { kind: 'category', name: 'Screens', colour: C.screens, contents: [bk('app_goto'), bk('app_message', { TEXT: TX('Well done!') })] }
  ] };
}
// Blockly's own variables, plus remember / remembered for the first variable
export function varsFlyout(Blockly, ws) {
  const out = Blockly.Variables.flyoutCategory(ws), v = ws.getVariablesOfType('')[0];
  if (v) for (const t of ['app_remember', 'app_remembered']) { const x = Blockly.utils.xml.createElement('block'); x.setAttribute('type', t); const f = Blockly.utils.xml.createElement('field'); f.setAttribute('name', 'VAR'); f.setAttribute('id', v.getId()); f.textContent = v.name; x.appendChild(f); out.push(x); }
  return out;
}
export function appTheme(Blockly) {
  if (theme) return theme;
  const st = (p, s, t) => ({ colourPrimary: p, colourSecondary: s, colourTertiary: t });
  theme = Blockly.Theme.defineTheme('codejumpApp', {
    base: Blockly.Themes.Zelos || Blockly.Themes.Classic,
    fontStyle: { family: "'Montserrat', sans-serif", weight: '600', size: 11 },
    blockStyles: { logic_blocks: st('#59c059', '#46b946', '#389438'), math_blocks: st('#59c059', '#46b946', '#389438'), text_blocks: st('#59c059', '#46b946', '#389438'),
      variable_blocks: st('#ff8c1a', '#ff8000', '#db6e00'), variable_dynamic_blocks: st('#ff8c1a', '#ff8000', '#db6e00'), loop_blocks: st('#ffab19', '#ec9c13', '#cf8b17') },
    componentStyles: { workspaceBackgroundColour: '#1e1e1e', toolboxBackgroundColour: '#2a2a2a', toolboxForegroundColour: '#fff', flyoutBackgroundColour: '#252526',
      flyoutForegroundColour: '#ccc', flyoutOpacity: 1, scrollbarColour: '#797979', insertionMarkerColour: '#fff', insertionMarkerOpacity: 0.3, scrollbarOpacity: 0.4, cursorColour: '#d0d0d0' }
  });
  return theme;
}
