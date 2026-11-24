// Brick Lab blocks for the editor: Blockly definitions, the toolbox, the theme (CodeJump's colours) and the starter program.
// brick-run.js runs the same blocks from JSON.
export const C = { events: '#d9a43a', hub: '#4c97ff', control: '#e8a33c', ops: '#59c059', vars: '#ff8c1a' };
export const HATS = ['br_when_run', 'br_when_tilted', 'br_when_distance'];
let defined = false, theme = null;

export function defineBlocks(Blockly) {
  if (defined) return; defined = true;
  const motor = { type: 'field_dropdown', name: 'MOTOR', options: [['motor', 'all'], ['motor A', 'A'], ['motor B', 'B']] };
  const dirs = (any) => ({ type: 'field_dropdown', name: 'DIR', options: (any ? [['any way', 'any']] : []).concat([['forward', 'forward'], ['back', 'back'], ['left', 'left'], ['right', 'right']]) });
  const val = (name, check) => Object.assign({ type: 'input_value', name }, check ? { check } : {});
  const S = o => Object.assign({ previousStatement: null, nextStatement: null }, o);
  Blockly.common.defineBlocksWithJsonArray([
    { type: 'br_when_run', message0: 'when Run clicked', nextStatement: null, colour: C.events, tooltip: 'Runs when you press Run.' },
    { type: 'br_when_tilted', message0: 'when tilted %1', args0: [dirs(true)], nextStatement: null, colour: C.hub, tooltip: 'Runs when the tilt sensor is tilted this way.' },
    { type: 'br_when_distance', message0: 'when distance < %1', args0: [{ type: 'field_number', name: 'N', value: 50, min: 0, max: 255 }], nextStatement: null, colour: C.hub, tooltip: 'Runs when something comes closer to the distance sensor than this.' },
    S({ type: 'br_motor_for', message0: 'turn %1 on for %2 seconds', args0: [motor, val('SECS', 'Number')], inputsInline: true, colour: C.hub, tooltip: 'Turns the motor on, waits, then turns it off.' }),
    S({ type: 'br_motor_on', message0: 'turn %1 on', args0: [motor], colour: C.hub, tooltip: 'Turns the motor on and leaves it running.' }),
    S({ type: 'br_motor_off', message0: 'turn %1 off', args0: [motor], colour: C.hub, tooltip: 'Turns the motor off.' }),
    S({ type: 'br_motor_power', message0: 'set %1 power to %2', args0: [motor, val('POWER', 'Number')], inputsInline: true, colour: C.hub, tooltip: 'How strongly the motor turns, from 0 to 100.' }),
    S({ type: 'br_motor_dir', message0: 'set %1 direction to %2', args0: [motor, { type: 'field_dropdown', name: 'DIR', options: [['this way', 'this'], ['that way', 'that'], ['reverse', 'reverse']] }], colour: C.hub, tooltip: 'Which way the motor turns. Reverse swaps it.' }),
    S({ type: 'br_light', message0: 'set light colour to %1', args0: [{ type: 'field_colour', name: 'COL', colour: '#ff0000' }], colour: C.hub, tooltip: 'The colour of the light on the hub.' }),
    S({ type: 'br_light_off', message0: 'turn light off', colour: C.hub, tooltip: 'Turns the hub’s light off.' }),
    { type: 'br_tilted', message0: 'tilted %1 ?', args0: [dirs(true)], output: 'Boolean', colour: C.hub, tooltip: 'True when the tilt sensor is tilted this way.' },
    { type: 'br_tilt_angle', message0: 'tilt angle %1', args0: [dirs(false)], output: 'Number', colour: C.hub, tooltip: 'How far the tilt sensor is tilted this way, in degrees.' },
    { type: 'br_distance', message0: 'distance', output: 'Number', colour: C.hub, tooltip: 'How far away things are from the distance sensor (0 = very close).' },
    S({ type: 'br_wait', message0: 'wait %1 seconds', args0: [val('SECS', 'Number')], inputsInline: true, colour: C.control, tooltip: 'Pauses this script.' }),
    S({ type: 'br_wait_until', message0: 'wait until %1', args0: [val('COND', 'Boolean')], inputsInline: true, colour: C.control, tooltip: 'Pauses this script until the answer is true.' }),
    { type: 'br_forever', message0: 'forever %1 %2', args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }], previousStatement: null, colour: C.control, tooltip: 'Runs the blocks inside again and again until you press Stop.' },
    S({ type: 'br_stop', message0: 'stop all motors', colour: C.control, tooltip: 'Turns every motor off.' })
  ]);
  for (const t of HATS) { const def = Blockly.Blocks[t], init = def.init; def.init = function () { init.call(this); this.hat = 'cap'; }; }
  Blockly.Msg.MATH_RANDOM_INT_TITLE = 'random %1 to %2';
  Blockly.Msg.MATH_CHANGE_TITLE = 'change %1 by %2';
  Blockly.Msg.VARIABLES_SET = 'set %1 to %2';
  Blockly.Msg.CONTROLS_REPEAT_TITLE = 'repeat %1 times';
}
const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const bk = (type, inputs, fields, extra) => Object.assign({ kind: 'block', type }, inputs ? { inputs } : {}, fields ? { fields } : {}, extra || {});
export function toolbox() {
  return { kind: 'categoryToolbox', contents: [
    { kind: 'category', name: 'Events', colour: C.events, contents: [bk('br_when_run'), bk('br_when_tilted'), bk('br_when_distance')] },
    { kind: 'category', name: 'WeDo', colour: C.hub, contents: [
      { kind: 'label', text: 'Motor' }, bk('br_motor_for', { SECS: N(1) }), bk('br_motor_on'), bk('br_motor_off'), bk('br_motor_power', { POWER: N(100) }), bk('br_motor_dir'),
      { kind: 'label', text: 'Hub light' }, bk('br_light'), bk('br_light_off'),
      { kind: 'label', text: 'Tilt sensor' }, bk('br_when_tilted'), bk('br_tilted'), bk('br_tilt_angle'),
      { kind: 'label', text: 'Distance sensor' }, bk('br_when_distance'), bk('br_distance')] },
    { kind: 'category', name: 'Control', colour: C.control, contents: [bk('br_wait', { SECS: N(1) }), bk('br_wait_until'), bk('br_forever'), bk('controls_repeat_ext', { TIMES: N(4) }),
      bk('controls_if'), bk('controls_if', null, null, { extraState: { hasElse: true } }), bk('controls_whileUntil'), bk('br_stop')] },
    { kind: 'category', name: 'Operators', colour: C.ops, contents: [bk('logic_compare', { A: N(0), B: N(50) }), bk('math_arithmetic', { A: N(1), B: N(1) }), bk('math_random_int', { FROM: N(1), TO: N(10) }),
      bk('logic_operation'), bk('logic_negate'), bk('logic_boolean'), bk('math_round', { NUM: N(3.5) }), bk('math_number'), bk('text'), bk('text_join')] },
    { kind: 'category', name: 'Variables', colour: C.vars, custom: 'VARIABLE' }
  ] };
}
// a first program: light up, run the motor, and react to the tilt sensor
export function starterProgram() {
  return { blocks: { languageVersion: 0, blocks: [
    { type: 'br_when_run', x: 30, y: 30, next: { block: { type: 'br_light', fields: { COL: '#00cc44' }, next: { block: { type: 'br_motor_for', fields: { MOTOR: 'all' }, inputs: { SECS: N(2) } } } } } },
    { type: 'br_when_tilted', x: 30, y: 230, fields: { DIR: 'any' }, next: { block: { type: 'br_light', fields: { COL: '#ff0000' }, next: { block: { type: 'br_motor_dir', fields: { MOTOR: 'all', DIR: 'reverse' } } } } } }
  ] } };
}
export function appTheme(Blockly) {
  if (theme) return theme;
  const st = (p, s, t) => ({ colourPrimary: p, colourSecondary: s, colourTertiary: t });
  theme = Blockly.Theme.defineTheme('codejumpBrick', {
    base: Blockly.Themes.Zelos || Blockly.Themes.Classic,
    fontStyle: { family: "'Montserrat', sans-serif", weight: '600', size: 11 },
    blockStyles: { logic_blocks: st('#59c059', '#46b946', '#389438'), math_blocks: st('#59c059', '#46b946', '#389438'), text_blocks: st('#59c059', '#46b946', '#389438'),
      variable_blocks: st('#ff8c1a', '#ff8000', '#db6e00'), variable_dynamic_blocks: st('#ff8c1a', '#ff8000', '#db6e00'), loop_blocks: st('#ffab19', '#ec9c13', '#cf8b17') },
    componentStyles: { workspaceBackgroundColour: '#1e1e1e', toolboxBackgroundColour: '#2a2a2a', toolboxForegroundColour: '#fff', flyoutBackgroundColour: '#252526',
      flyoutForegroundColour: '#ccc', flyoutOpacity: 1, scrollbarColour: '#797979', insertionMarkerColour: '#fff', insertionMarkerOpacity: 0.3, scrollbarOpacity: 0.4, cursorColour: '#d0d0d0' }
  });
  return theme;
}
