/* CodeJump · Build Lab — the language: every command once (API), then
 *   · Blockly block definitions + the toolbox + the starter program   (defineBlocks, toolbox, starterProgram)
 *   · blocks → Python                                                  (toPython(state))
 *   · Python → blocks                                                  (fromPython(text) → {state} | {error:{line,msg}})
 * Both directions work on Blockly's JSON save format, so this file needs no Blockly and no DOM (Node tests use it).
 * The runner (craft-runner.js) runs the same JSON.
 *
 * Positions pupils type are (right, up, ahead) from where the player stands, so code builds in front of them.
 */
import { BLOCKS, DIRS } from './craft-world.js';

export const COLOURS = { events: '#ffbf00', helper: '#20b2aa', builder: '#9966ff', player: '#4c97ff', world: '#5cb1d6', control: '#ffab19', ops: '#59c059', vars: '#ff8c1a' };
const BLOCK_NAMES = BLOCKS.map(b => b[1]);
export const ENUMS = {
  block: BLOCKS.filter(b => b[0] > 0).map(b => [b[2], b[1]]),
  blockAir: BLOCKS.map(b => [b[2], b[1]]),
  dir: [['forward', 'FORWARD'], ['back', 'BACK'], ['left', 'LEFT'], ['right', 'RIGHT'], ['up', 'UP'], ['down', 'DOWN']],
  turn: [['left', 'LEFT'], ['right', 'RIGHT']],
  mode: [['solid', 'SOLID'], ['hollow (empty inside)', 'HOLLOW'], ['outline (keep inside)', 'OUTLINE']],
  mode2: [['solid', 'SOLID'], ['hollow', 'HOLLOW']],
  time: [['day', 'DAY'], ['sunset', 'SUNSET'], ['night', 'NIGHT']]
};
export const CONSTANTS = new Set([...BLOCK_NAMES, ...DIRS, 'SOLID', 'HOLLOW', 'OUTLINE', 'DAY', 'SUNSET', 'NIGHT']);

// type, category, Python name, block text (%NAME = an argument), args [name, kind, default], returns ('' = a command)
// kinds: num/text/bool = value sockets; block/blockAir/dir/turn/mode/mode2/time = dropdowns
export const API = [
  ['cr_h_move', 'helper', 'helper.move', 'helper move %DIR %N', [['DIR', 'dir', 'FORWARD'], ['N', 'num', 1]], ''],
  ['cr_h_turn', 'helper', 'helper.turn', 'helper turn %D', [['D', 'turn', 'LEFT']], ''],
  ['cr_h_place', 'helper', 'helper.place', 'helper place %B %DIR', [['B', 'block', 'STONE'], ['DIR', 'dir', 'DOWN']], ''],
  ['cr_h_dig', 'helper', 'helper.dig', 'helper dig %DIR', [['DIR', 'dir', 'FORWARD']], ''],
  ['cr_h_trail', 'helper', 'helper.trail', 'helper leave a trail of %B', [['B', 'blockAir', 'PLANKS']], ''],
  ['cr_h_detect', 'helper', 'helper.detect', 'helper sees a block %DIR ?', [['DIR', 'dir', 'FORWARD']], 'bool'],
  ['cr_h_inspect', 'helper', 'helper.inspect', 'block the helper sees %DIR', [['DIR', 'dir', 'DOWN']], 'value'],
  ['cr_h_come', 'helper', 'helper.come_here', 'helper come to me', [], ''],
  ['cr_h_say', 'helper', 'helper.say', 'helper say %T', [['T', 'text', 'Hello!']], ''],
  ['cr_b_place', 'builder', 'builder.place', 'place %B at right %X up %Y ahead %Z', [['B', 'blockAir', 'GOLD'], ['X', 'num', 0], ['Y', 'num', 0], ['Z', 'num', 2]], ''],
  ['cr_b_fill', 'builder', 'builder.fill', 'fill with %B %M | from right %X1 up %Y1 ahead %Z1 | to right %X2 up %Y2 ahead %Z2', [['B', 'blockAir', 'BRICKS'], ['X1', 'num', -2], ['Y1', 'num', 0], ['Z1', 'num', 3], ['X2', 'num', 2], ['Y2', 'num', 3], ['Z2', 'num', 7], ['M', 'mode', 'HOLLOW']], ''],
  ['cr_b_line', 'builder', 'builder.line', 'line of %B | from right %X1 up %Y1 ahead %Z1 | to right %X2 up %Y2 ahead %Z2', [['B', 'blockAir', 'GOLD'], ['X1', 'num', 0], ['Y1', 'num', 0], ['Z1', 'num', 2], ['X2', 'num', 0], ['Y2', 'num', 5], ['Z2', 'num', 2]], ''],
  ['cr_b_ball', 'builder', 'builder.ball', 'ball of %B %M radius %R | at right %X up %Y ahead %Z', [['B', 'blockAir', 'GLASS'], ['R', 'num', 3], ['X', 'num', 0], ['Y', 'num', 3], ['Z', 'num', 6], ['M', 'mode2', 'HOLLOW']], ''],
  ['cr_p_say', 'player', 'player.say', 'say %T', [['T', 'text', 'Hello!']], ''],
  ['cr_p_tp', 'player', 'player.teleport', 'move me to right %X up %Y ahead %Z', [['X', 'num', 0], ['Y', 'num', 5], ['Z', 'num', 0]], ''],
  ['cr_w_block', 'world', 'world.block_at', 'block at right %X up %Y ahead %Z', [['X', 'num', 0], ['Y', 'num', -1], ['Z', 'num', 0]], 'value'],
  ['cr_w_time', 'world', 'world.time', 'make it %T', [['T', 'time', 'NIGHT']], ''],
  ['cr_wait', 'control', 'wait', 'wait %S seconds', [['S', 'num', 1]], '']
];
export const API_BY_TYPE = Object.fromEntries(API.map(a => [a[0], a]));
export const API_BY_PY = Object.fromEntries(API.map(a => [a[2], a]));
const ENUM_KINDS = new Set(['block', 'blockAir', 'dir', 'turn', 'mode', 'mode2', 'time']);
const enumValues = kind => ENUMS[kind].map(o => o[1]);

// ── Blockly ──────────────────────────────────────────────────────────────────
const TIPS = {
  cr_on_run: 'Runs when you press Run.',
  cr_on_chat: 'Runs when you type this word in the chat. Type a number after the word (like "tower 5") and it goes into the variable.',
  cr_h_move: 'Moves the robot helper. It stops if a block is in the way.', cr_h_turn: 'Turns the helper a quarter turn.',
  cr_h_place: 'The helper puts a block next to itself.', cr_h_dig: 'The helper digs out the block next to it.',
  cr_h_trail: 'From now on the helper leaves this block behind wherever it goes. Choose air to stop.',
  cr_h_detect: 'True if there is a block next to the helper in that direction.', cr_h_inspect: 'The name of the block next to the helper (like STONE).',
  cr_h_come: 'The helper flies to just in front of you.', cr_h_say: 'The helper says something in the chat.',
  cr_b_place: 'Puts one block. Right, up and ahead count from where you stand and which way you face.',
  cr_b_fill: 'Fills a box between two corners. Hollow leaves air inside (a room!). Outline keeps what is inside.',
  cr_b_line: 'A straight line of blocks between two points.', cr_b_ball: 'A ball of blocks. Hollow makes a bubble.',
  cr_p_say: 'Puts a message in the chat.', cr_p_tp: 'Moves you. Right, up and ahead count from where you are now.',
  cr_w_block: 'The name of the block at that place.', cr_w_time: 'Day, sunset or night.', cr_wait: 'Waits before the next block.',
  cr_forever: 'Does the blocks inside again and again until you press Stop.', cr_block: 'A kind of block, to compare with.'
};
export function defineBlocks(Blockly) {
  const defs = [];
  defs.push({ type: 'cr_on_run', message0: 'when Run is clicked', nextStatement: null, colour: COLOURS.events, tooltip: TIPS.cr_on_run, hat: 'cap' });
  defs.push({ type: 'cr_on_chat', message0: 'when I type %1 in the chat %2', args0: [{ type: 'field_input', name: 'WORD', text: 'house' }, { type: 'field_variable', name: 'VAR', variable: 'n' }],
    nextStatement: null, colour: COLOURS.events, tooltip: TIPS.cr_on_chat });
  defs.push({ type: 'cr_forever', message0: 'forever %1 %2', args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }], previousStatement: null, colour: COLOURS.control, tooltip: TIPS.cr_forever });
  defs.push({ type: 'cr_block', message0: '%1', args0: [{ type: 'field_dropdown', name: 'B', options: ENUMS.blockAir }], output: null, colour: COLOURS.world, tooltip: TIPS.cr_block });
  for (const [type, cat, , text, args, ret] of API) {
    const args0 = []; let i = 0;
    const message0 = text.replace(/%([A-Z0-9]+)|\s*\|/g, (m, name) => {
      i++;
      if (!name) { args0.push({ type: 'input_end_row' }); return ' %' + i; } // "|" = carry on, on the next row
      const a = args.find(x => x[0] === name);
      if (ENUM_KINDS.has(a[1])) args0.push({ type: 'field_dropdown', name, options: ENUMS[a[1]] });
      else args0.push({ type: 'input_value', name });
      return '%' + i;
    });
    const d = { type, message0, args0, colour: COLOURS[cat], tooltip: TIPS[type] || '', inputsInline: true };
    if (ret) d.output = ret === 'bool' ? 'Boolean' : null; else { d.previousStatement = null; d.nextStatement = null; }
    if (args.length > 5) d.inputsInline = true;
    defs.push(d);
  }
  Blockly.defineBlocksWithJsonArray(defs);
}
const sh = (kind, v) => kind === 'text' ? { shadow: { type: 'text', fields: { TEXT: String(v) } } } : { shadow: { type: 'math_number', fields: { NUM: Number(v) || 0 } } };
function apiBlockXml(a) { // toolbox entry with default shadows
  const b = { kind: 'block', type: a[0], inputs: {}, fields: {} };
  for (const [name, kind, def] of a[4]) { if (ENUM_KINDS.has(kind)) b.fields[name] = def; else if (kind !== 'bool') b.inputs[name] = sh(kind, def); }
  return b;
}
export function toolbox(code = 'all') { // code: 'all' | 'helper' (no builder commands) | 'builder' (no helper) — set by a World Maker world
  const cat = (name, colour, contents) => ({ kind: 'category', name, colour, contents });
  const api = c => API.filter(a => a[1] === c && a[0] !== 'cr_wait').map(apiBlockXml);
  const num = v => ({ shadow: { type: 'math_number', fields: { NUM: v } } });
  return { kind: 'categoryToolbox', contents: [
    cat('Events', COLOURS.events, [{ kind: 'block', type: 'cr_on_run' }, { kind: 'block', type: 'cr_on_chat' }]),
    code === 'builder' ? null : cat('Helper', COLOURS.helper, api('helper')),
    code === 'helper' ? null : cat('Builder', COLOURS.builder, api('builder')),
    cat('Player', COLOURS.player, api('player')),
    cat('World', COLOURS.world, [...api('world'), { kind: 'block', type: 'cr_block' },
      { kind: 'block', type: 'logic_compare', inputs: { A: { block: apiBlockXml(API_BY_TYPE.cr_h_inspect) }, B: { block: { type: 'cr_block', fields: { B: 'WATER' } } } } }]),
    cat('Loops', COLOURS.control, [
      { kind: 'block', type: 'controls_repeat_ext', inputs: { TIMES: num(4) } },
      { kind: 'block', type: 'controls_for', inputs: { FROM: num(1), TO: num(5), BY: num(1) } },
      { kind: 'block', type: 'controls_whileUntil' }, { kind: 'block', type: 'cr_forever' }, apiBlockXml(API_BY_TYPE.cr_wait)]),
    cat('Logic', COLOURS.control, [{ kind: 'block', type: 'controls_if' }, { kind: 'block', type: 'controls_if', extraState: { hasElse: true } },
      { kind: 'block', type: 'logic_compare' }, { kind: 'block', type: 'logic_operation' }, { kind: 'block', type: 'logic_negate' }, { kind: 'block', type: 'logic_boolean' }]),
    cat('Maths', COLOURS.ops, [{ kind: 'block', type: 'math_number' }, { kind: 'block', type: 'math_arithmetic', inputs: { A: num(1), B: num(1) } },
      { kind: 'block', type: 'math_random_int', inputs: { FROM: num(1), TO: num(10) } }, { kind: 'block', type: 'math_modulo', inputs: { DIVIDEND: num(10), DIVISOR: num(3) } },
      { kind: 'block', type: 'text' }, { kind: 'block', type: 'text_join' }]),
    { kind: 'category', name: 'Variables', colour: COLOURS.vars, custom: 'VARIABLE' }
  ].filter(Boolean) };
}
// "type tower 5 in the chat": a tower of gold as tall as the number, and Run builds a little house
export function starterProgram() {
  return fromPython(STARTER_PY).state;
}
export const STARTER_PY = `# Press Run, or type a word in the chat, like: tower 6

# Build a little house in front of me
builder.fill(PLANKS, -3, 0, 5, 3, 4, 11, HOLLOW)
builder.fill(AIR, 0, 0, 5, 0, 1, 5, SOLID)
builder.place(GLASS, -2, 2, 5)
builder.place(GLASS, 2, 2, 5)
player.say("Here is your house!")

@on_chat("tower")
def tower(n):
    helper.come_here()
    for i in range(n):
        helper.place(GOLD, DOWN)
        helper.move(UP, 1)
    helper.say("Tower done!")
`;

// ── blocks → Python ──────────────────────────────────────────────────────────
const PREC = { or: 1, and: 2, not: 3, cmp: 4, add: 5, mul: 6, unary: 7, pow: 8, atom: 9 };
export function toPython(state) {
  const tops = ((state && state.blocks && state.blocks.blocks) || []).slice().sort((a, b) => (a.y || 0) - (b.y || 0));
  const varName = {}; for (const v of (state && state.variables) || []) varName[v.id] = safeName(v.name);
  const vname = f => (f && (varName[f.id] || (f.name && safeName(f.name)))) || 'x';
  const IND = '    ';
  const input = (b, n) => b && b.inputs && b.inputs[n] && (b.inputs[n].block || b.inputs[n].shadow);
  const field = (b, n) => b && b.fields ? b.fields[n] : undefined;
  function expr(b) {
    if (!b) return ['0', PREC.atom];
    const A = n => expr(input(b, n)), wrap = (e, p) => (e[1] < p ? '(' + e[0] + ')' : e[0]);
    switch (b.type) {
      case 'math_number': { const n = Number(field(b, 'NUM')); return [String(isFinite(n) ? n : 0), n < 0 ? PREC.unary : PREC.atom]; }
      case 'text': return [JSON.stringify(String(field(b, 'TEXT') ?? '')), PREC.atom];
      case 'logic_boolean': return [field(b, 'BOOL') === 'FALSE' ? 'False' : 'True', PREC.atom];
      case 'variables_get': return [vname(field(b, 'VAR')), PREC.atom];
      case 'cr_block': return [String(field(b, 'B') || 'STONE'), PREC.atom];
      case 'math_arithmetic': {
        const op = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/', POWER: '**' }[field(b, 'OP')] || '+';
        const p = op === '**' ? PREC.pow : (op === '*' || op === '/') ? PREC.mul : PREC.add;
        if (op === '+') { // joining words: Python wants str() round a number
          const ia = input(b, 'A'), ib = input(b, 'B'), isT = x => x && (x.type === 'text' || x.type === 'text_join' || (x.type === 'math_arithmetic' && field(x, 'OP') === 'ADD' && (isT(input(x, 'A')) || isT(input(x, 'B')))));
          if (isT(ia) || isT(ib)) { const side = (x, q) => isT(x) ? wrap(expr(x), q) : 'str(' + expr(x)[0] + ')'; return [side(ia, p) + ' + ' + side(ib, p + 1), p]; }
        }
        return [wrap(A('A'), p) + ' ' + op + ' ' + wrap(A('B'), p + 1), p];
      }
      case 'math_modulo': return [wrap(A('DIVIDEND'), PREC.mul) + ' % ' + wrap(A('DIVISOR'), PREC.mul + 1), PREC.mul];
      case 'math_random_int': return ['random(' + A('FROM')[0] + ', ' + A('TO')[0] + ')', PREC.atom];
      case 'logic_compare': {
        const op = { EQ: '==', NEQ: '!=', LT: '<', LTE: '<=', GT: '>', GTE: '>=' }[field(b, 'OP')] || '==';
        return [wrap(A('A'), PREC.cmp + 1) + ' ' + op + ' ' + wrap(A('B'), PREC.cmp + 1), PREC.cmp];
      }
      case 'logic_operation': { const op = field(b, 'OP') === 'OR' ? 'or' : 'and', p = op === 'or' ? PREC.or : PREC.and; return [wrap(A('A'), p) + ' ' + op + ' ' + wrap(A('B'), p + 1), p]; }
      case 'logic_negate': return ['not ' + wrap(A('BOOL'), PREC.not), PREC.not];
      case 'text_join': {
        const n = (b.extraState && b.extraState.itemCount) != null ? b.extraState.itemCount : 2, parts = [];
        for (let i = 0; i < n; i++) { const it = input(b, 'ADD' + i); if (!it) continue; const e = expr(it); parts.push(it.type === 'text' ? e[0] : 'str(' + e[0] + ')'); }
        return [parts.length ? parts.join(' + ') : '""', PREC.add];
      }
    }
    const a = API_BY_TYPE[b.type];
    if (a) return [callText(a, b), PREC.atom];
    return ['0', PREC.atom];
  }
  function callText(a, b) {
    const out = a[4].map(([name, kind, def]) => ENUM_KINDS.has(kind) ? String(field(b, name) || def) : expr(input(b, name))[0]);
    return a[2] + '(' + out.join(', ') + ')';
  }
  function stmts(b, ind) {
    const lines = [];
    for (; b; b = b.next && b.next.block) lines.push(...stmt(b, ind));
    return lines;
  }
  function body(b, n, ind) { const l = stmts(input(b, n), ind + IND); return l.length ? l : [ind + IND + 'pass']; }
  function stmt(b, ind) {
    switch (b.type) {
      case 'controls_repeat_ext': return [ind + 'for _ in range(' + expr(input(b, 'TIMES'))[0] + '):', ...body(b, 'DO', ind)];
      case 'controls_for': {
        const v = vname(field(b, 'VAR')), from = expr(input(b, 'FROM'))[0], toB = input(b, 'TO'), by = expr(input(b, 'BY'))[0];
        const up = !(Number(by) < 0);
        let to;
        if (toB && toB.type === 'math_number') to = String(Number(field(toB, 'NUM')) + (up ? 1 : -1));
        else if (toB && toB.type === 'math_arithmetic' && field(toB, 'OP') === (up ? 'MINUS' : 'ADD') && input(toB, 'B') && input(toB, 'B').type === 'math_number' && Number(field(input(toB, 'B'), 'NUM')) === 1) to = expr(input(toB, 'A'))[0];
        else { const e = expr(toB); to = (e[1] < PREC.add ? '(' + e[0] + ')' : e[0]) + (up ? ' + 1' : ' - 1'); }
        const range = by === '1' && from === '0' ? to : from + ', ' + to + (by === '1' ? '' : ', ' + by);
        return [ind + 'for ' + v + ' in range(' + range + '):', ...body(b, 'DO', ind)];
      }
      case 'controls_whileUntil': {
        const c = expr(input(b, 'BOOL'));
        return [ind + 'while ' + (field(b, 'MODE') === 'UNTIL' ? 'not ' + (c[1] < PREC.not ? '(' + c[0] + ')' : c[0]) : c[0]) + ':', ...body(b, 'DO', ind)];
      }
      case 'cr_forever': return [ind + 'while True:', ...body(b, 'DO', ind)];
      case 'controls_if': {
        const es = b.extraState || {}, n = es.elseIfCount || 0, out = [];
        for (let i = 0; i <= n; i++) out.push(ind + (i ? 'elif ' : 'if ') + expr(input(b, 'IF' + i))[0] + ':', ...body(b, 'DO' + i, ind));
        if (es.hasElse) out.push(ind + 'else:', ...body(b, 'ELSE', ind));
        return out;
      }
      case 'variables_set': return [ind + vname(field(b, 'VAR')) + ' = ' + expr(input(b, 'VALUE'))[0]];
      case 'math_change': return [ind + vname(field(b, 'VAR')) + ' += ' + expr(input(b, 'DELTA'))[0]];
    }
    const a = API_BY_TYPE[b.type];
    if (a) return [ind + callText(a, b)];
    if (b.type in { math_number: 1, text: 1 }) return [];
    return [ind + '# (a block that has no Python yet: ' + b.type + ')'];
  }
  const out = [], run = [], used = new Set();
  for (const t of tops) {
    if (t.type === 'cr_on_chat') {
      const w = String(field(t, 'WORD') || 'go').trim().split(/\s+/)[0].toLowerCase() || 'go';
      let fn = safeName(w); if (used.has(fn)) { let k = 2; while (used.has(fn + k)) k++; fn = fn + k; } used.add(fn);
      out.push('@on_chat(' + JSON.stringify(w) + ')', 'def ' + fn + '(' + vname(field(t, 'VAR')) + '):', ...((l => l.length ? l : [IND + 'pass'])(stmts(t.next && t.next.block, IND))), '');
    } else if (t.type === 'cr_on_run') run.push(...stmts(t.next && t.next.block, ''));
  }
  const head = run.length ? ['# When Run is clicked', ...run, ''] : [];
  return [...head, ...out].join('\n').replace(/\n+$/, '\n');
}
const PY_WORDS = new Set(['and', 'or', 'not', 'if', 'elif', 'else', 'for', 'while', 'in', 'def', 'return', 'pass', 'True', 'False', 'None', 'import', 'from', 'class', 'break', 'continue', 'lambda', 'with', 'as', 'is', 'global', 'try', 'except', 'finally', 'raise', 'yield', 'del', 'assert', 'nonlocal', 'range', 'print', 'str', 'random', 'wait']);
function safeName(n) { let s = String(n || 'x').replace(/[^A-Za-z0-9_]/g, '_'); if (!/^[A-Za-z_]/.test(s)) s = '_' + s; if (PY_WORDS.has(s) || CONSTANTS.has(s)) s += '_'; return s; }

// ── Python → blocks ──────────────────────────────────────────────────────────
class PyErr extends Error { constructor(line, msg) { super(msg); this.line = line; } }
function tokenize(src) {
  const toks = [], lines = String(src).replace(/\t/g, '    ').split('\n'), indents = [0]; let depth = 0;
  const push = (t, v, line) => toks.push({ t, v, line });
  for (let li = 0; li < lines.length; li++) {
    const raw = lines[li], line = li + 1; let i = 0;
    if (depth === 0) {
      const m = /^ */.exec(raw)[0].length, rest = raw.slice(m);
      if (!rest.trim() || rest.trim()[0] === '#') continue;
      if (m > indents[indents.length - 1]) { indents.push(m); push('INDENT', null, line); }
      while (m < indents[indents.length - 1]) { indents.pop(); push('DEDENT', null, line); }
      if (m !== indents[indents.length - 1]) throw new PyErr(line, 'The spaces at the start of this line don’t line up with the lines above.');
      i = m;
    }
    while (i < raw.length) {
      const c = raw[i];
      if (c === ' ') { i++; continue; }
      if (c === '#') break;
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(raw[i + 1]))) { const m = /^[0-9]*\.?[0-9]+/.exec(raw.slice(i)); push('NUM', Number(m[0]), line); i += m[0].length; continue; }
      if (/[A-Za-z_]/.test(c)) { const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(raw.slice(i)); push('NAME', m[0], line); i += m[0].length; continue; }
      if (c === '"' || c === "'") {
        let j = i + 1, s = '';
        while (j < raw.length && raw[j] !== c) { if (raw[j] === '\\' && j + 1 < raw.length) { const e = raw[j + 1]; s += e === 'n' ? ' ' : e; j += 2; } else s += raw[j++]; }
        if (j >= raw.length) throw new PyErr(line, 'This text has no closing ' + c + ' quote mark.');
        push('STR', s, line); i = j + 1; continue;
      }
      const two = raw.slice(i, i + 2);
      if (['==', '!=', '<=', '>=', '+=', '-=', '*=', '**', '//'].includes(two)) { push('OP', two, line); i += 2; continue; }
      if ('()[],:.+-*/%<>=@'.includes(c)) { if ('([' .includes(c)) depth++; if (')]'.includes(c)) depth = Math.max(0, depth - 1); push('OP', c, line); i++; continue; }
      throw new PyErr(line, 'I don’t understand the character “' + c + '”.');
    }
    if (depth === 0) push('NL', null, line);
  }
  while (indents.length > 1) { indents.pop(); push('DEDENT', null, lines.length); }
  push('EOF', null, lines.length);
  return toks;
}
export function fromPython(src) {
  let toks; try { toks = tokenize(src); } catch (e) { return { error: { line: e.line || 1, msg: e.message } }; }
  let p = 0, n = 0;
  const vars = new Map(); // name → id
  const vid = name => { if (!vars.has(name)) vars.set(name, 'v_' + name); return { id: vars.get(name) }; };
  const peek = () => toks[p], next = () => toks[p++];
  const is = (t, v) => toks[p].t === t && (v === undefined || toks[p].v === v);
  const want = (t, v, msg) => { if (!is(t, v)) throw new PyErr(toks[p].line, msg || ('I expected “' + (v || t) + '” here.')); return next(); };
  const id = () => 'py' + (++n);
  const numB = v => ({ type: 'math_number', id: id(), fields: { NUM: v } });
  const sock = (b, kind) => kind === 'text'
    ? (b.type === 'text' ? { shadow: Object.assign({}, b) } : { block: b, shadow: { type: 'text', id: id(), fields: { TEXT: '' } } })
    : (b.type === 'math_number' ? { shadow: Object.assign({}, b) } : { block: b, shadow: { type: 'math_number', id: id(), fields: { NUM: 0 } } });

  function block(line) { // NL INDENT stmts DEDENT
    want('OP', ':', 'This line needs a “:” at the end.'); want('NL', undefined, 'Put the code for this on the next lines, moved in by 4 spaces.');
    if (!is('INDENT')) throw new PyErr(toks[p].line, 'The lines inside need to be moved in by 4 spaces.');
    next(); const list = [];
    while (!is('DEDENT') && !is('EOF')) list.push(...statement());
    if (is('DEDENT')) next();
    return chain(list);
  }
  function chain(list) { for (let i = 0; i < list.length - 1; i++) list[i].next = { block: list[i + 1] }; return list[0] || null; }
  const inp = b => b ? { block: b } : undefined;
  function statement() {
    const t = peek(), line = t.line;
    if (t.t === 'NAME' && t.v === 'pass') { next(); endLine(); return []; }
    if (t.t === 'NAME' && t.v === 'for') {
      next(); const v = want('NAME', undefined, 'Write a name after “for”, like: for i in range(5):').v;
      want('NAME', 'in', 'Write “in” after the name, like: for i in range(5):'); const r = want('NAME', undefined, 'Use range(…) after “in”.');
      if (r.v !== 'range') throw new PyErr(line, 'Loops here use range, like: for i in range(5):');
      want('OP', '('); const a = [expr()]; while (is('OP', ',')) { next(); a.push(expr()); } want('OP', ')', 'This range( needs a closing bracket.');
      const DO = block(line);
      if (a.length === 1 && v === '_') return [{ type: 'controls_repeat_ext', id: id(), inputs: { TIMES: sock(a[0]), DO: inp(DO) } }];
      let from = numB(0), to = a[0], by = numB(1);
      if (a.length >= 2) { from = a[0]; to = a[1]; } if (a.length >= 3) by = a[2];
      const step = by.type === 'math_number' ? Number(by.fields.NUM) : 1;
      const toIncl = to.type === 'math_number' ? numB(Number(to.fields.NUM) - (step < 0 ? -1 : 1)) : { type: 'math_arithmetic', id: id(), fields: { OP: step < 0 ? 'ADD' : 'MINUS' }, inputs: { A: sock(to), B: sock(numB(1)) } };
      return [{ type: 'controls_for', id: id(), fields: { VAR: vid(v) }, inputs: { FROM: sock(from), TO: sock(toIncl), BY: sock(by), DO: inp(DO) } }];
    }
    if (t.t === 'NAME' && t.v === 'while') {
      next(); const c = expr(); const DO = block(line);
      if (c.type === 'logic_boolean' && c.fields.BOOL === 'TRUE') return [{ type: 'cr_forever', id: id(), inputs: { DO: inp(DO) } }];
      if (c.type === 'logic_negate') return [{ type: 'controls_whileUntil', id: id(), fields: { MODE: 'UNTIL' }, inputs: { BOOL: inp(c.inputs.BOOL && c.inputs.BOOL.block), DO: inp(DO) } }];
      return [{ type: 'controls_whileUntil', id: id(), fields: { MODE: 'WHILE' }, inputs: { BOOL: inp(c), DO: inp(DO) } }];
    }
    if (t.t === 'NAME' && t.v === 'if') {
      next(); const b = { type: 'controls_if', id: id(), inputs: {} }; let k = 0;
      b.inputs.IF0 = inp(expr()); b.inputs.DO0 = inp(block(line));
      while (is('NAME', 'elif')) { next(); k++; b.inputs['IF' + k] = inp(expr()); b.inputs['DO' + k] = inp(block(line)); }
      let hasElse = false; if (is('NAME', 'else')) { next(); hasElse = true; b.inputs.ELSE = inp(block(line)); }
      if (k || hasElse) b.extraState = Object.assign({}, k ? { elseIfCount: k } : {}, hasElse ? { hasElse: true } : {});
      for (const key of Object.keys(b.inputs)) if (!b.inputs[key]) delete b.inputs[key];
      return [b];
    }
    if (t.t === 'OP' && t.v === '@') throw new PyErr(line, 'Put @on_chat(…) functions at the start of a line, not inside other code.');
    if (t.t === 'NAME' && t.v === 'def') throw new PyErr(line, 'Functions need @on_chat("word") on the line above, so the chat can start them.');
    if (t.t === 'NAME' && ['import', 'class', 'return', 'break', 'continue', 'lambda', 'try', 'with', 'global'].includes(t.v)) throw new PyErr(line, '“' + t.v + '” isn’t part of Build Lab Python yet.');
    if (t.t === 'NAME' && toks[p + 1].t === 'OP' && ['=', '+=', '-='].includes(toks[p + 1].v)) {
      const name = next().v, op = next().v;
      if (CONSTANTS.has(name) || name === 'helper' || name === 'builder' || name === 'player' || name === 'world') throw new PyErr(line, '“' + name + '” is a Build Lab word, so it can’t be a variable name.');
      const e = expr(); endLine();
      if (op === '=') return [{ type: 'variables_set', id: id(), fields: { VAR: vid(name) }, inputs: { VALUE: inp(e) } }];
      const delta = op === '+=' ? e : (e.type === 'math_number' ? numB(-Number(e.fields.NUM)) : { type: 'math_arithmetic', id: id(), fields: { OP: 'MINUS' }, inputs: { A: sock(numB(0)), B: sock(e) } });
      return [{ type: 'math_change', id: id(), fields: { VAR: vid(name) }, inputs: { DELTA: sock(delta) } }];
    }
    const e = expr(); endLine();
    if (!e.__stmt) throw new PyErr(line, 'This line doesn’t do anything. Try a command like helper.move(FORWARD, 1).');
    delete e.__stmt; return [e];
  }
  function endLine() { if (!is('NL') && !is('EOF') && !is('DEDENT')) throw new PyErr(toks[p].line, 'Put each command on its own line.'); if (is('NL')) next(); }
  // expressions
  function expr() { return orE(); }
  function bin(type, op, a, b) { const k = type === 'logic_operation' || type === 'logic_compare' ? ['A', 'B'] : ['A', 'B']; const o = { type, id: id(), fields: { OP: op }, inputs: {} }; o.inputs[k[0]] = type === 'math_arithmetic' ? sock(a) : inp(a); o.inputs[k[1]] = type === 'math_arithmetic' ? sock(b) : inp(b); return o; }
  function orE() { let a = andE(); while (is('NAME', 'or')) { next(); a = bin('logic_operation', 'OR', a, andE()); } return a; }
  function andE() { let a = notE(); while (is('NAME', 'and')) { next(); a = bin('logic_operation', 'AND', a, notE()); } return a; }
  function notE() { if (is('NAME', 'not')) { next(); return { type: 'logic_negate', id: id(), inputs: { BOOL: inp(notE()) } }; } return cmpE(); }
  function cmpE() {
    const a = addE(); const OPS = { '==': 'EQ', '!=': 'NEQ', '<': 'LT', '<=': 'LTE', '>': 'GT', '>=': 'GTE' };
    if (is('OP') && OPS[peek().v]) { const op = OPS[next().v]; const b = addE(); return bin('logic_compare', op, a, b); }
    if (is('OP', '=')) throw new PyErr(peek().line, 'To check if two things are the same, use == (two equals signs).');
    return a;
  }
  function addE() { let a = mulE(); while (is('OP', '+') || is('OP', '-')) { const op = next().v === '+' ? 'ADD' : 'MINUS'; a = bin('math_arithmetic', op, a, mulE()); } return a; }
  function mulE() {
    let a = unE();
    while (is('OP', '*') || is('OP', '/') || is('OP', '%') || is('OP', '//')) {
      const op = next().v, b = unE();
      if (op === '%') a = { type: 'math_modulo', id: id(), inputs: { DIVIDEND: sock(a), DIVISOR: sock(b) } };
      else a = bin('math_arithmetic', op === '*' ? 'MULTIPLY' : 'DIVIDE', a, b);
    }
    return a;
  }
  function unE() {
    if (is('OP', '-')) { next(); const e = unE(); if (e.type === 'math_number') return numB(-Number(e.fields.NUM)); return bin('math_arithmetic', 'MINUS', numB(0), e); }
    if (is('OP', '+')) { next(); return unE(); }
    return powE();
  }
  function powE() { const a = atom(); if (is('OP', '**')) { next(); return bin('math_arithmetic', 'POWER', a, unE()); } return a; }
  function args() { want('OP', '('); const a = []; if (!is('OP', ')')) { a.push(expr()); while (is('OP', ',')) { next(); a.push(expr()); } } want('OP', ')', 'This bracket ( needs a closing bracket ).'); return a; }
  function atom() {
    const t = peek(), line = t.line;
    if (t.t === 'NUM') { next(); return numB(t.v); }
    if (t.t === 'STR') { next(); return { type: 'text', id: id(), fields: { TEXT: t.v } }; }
    if (t.t === 'OP' && t.v === '(') { next(); const e = expr(); want('OP', ')', 'This bracket ( needs a closing bracket ).'); return e; }
    if (t.t !== 'NAME') throw new PyErr(line, t.t === 'NL' || t.t === 'EOF' ? 'This line stops too soon.' : 'I didn’t expect “' + t.v + '” here.');
    next(); let name = t.v;
    if (name === 'True' || name === 'False') return { type: 'logic_boolean', id: id(), fields: { BOOL: name === 'True' ? 'TRUE' : 'FALSE' } };
    while (is('OP', '.')) { next(); name += '.' + want('NAME', undefined, 'Write a command name after the dot.').v; }
    if (is('OP', '(')) {
      const a = args();
      if (name === 'random' || name === 'randint' || name === 'random.randint') { if (a.length !== 2) throw new PyErr(line, 'random needs two numbers, like random(1, 6).'); const r = { type: 'math_random_int', id: id(), inputs: { FROM: sock(a[0]), TO: sock(a[1]) } }; return r; }
      if (name === 'str' || name === 'int') { if (a.length !== 1) throw new PyErr(line, name + '( ) needs one thing inside the brackets.'); return a[0]; }
      if (name === 'print') name = 'player.say';
      const api = API_BY_PY[name];
      if (!api) {
        const near = Object.keys(API_BY_PY).filter(k => k.split('.')[0] === name.split('.')[0]).map(k => k + '()');
        throw new PyErr(line, 'I don’t know the command ' + name + '().' + (near.length ? ' Try: ' + near.slice(0, 6).join(', ') : ' Commands start with helper., builder., player. or world.'));
      }
      const spec = api[4];
      if (a.length !== spec.length) throw new PyErr(line, name + '() needs ' + spec.length + ' thing' + (spec.length === 1 ? '' : 's') + ' in the brackets: ' + spec.map(s => s[0].toLowerCase()).join(', ') + '.');
      const b = { type: api[0], id: id(), fields: {}, inputs: {} };
      spec.forEach(([fname, kind], i) => {
        const v = a[i];
        if (ENUM_KINDS.has(kind)) {
          const val = v.type === 'cr_block' ? v.fields.B : null;
          const ok = enumValues(kind);
          if (!val || !ok.includes(val)) throw new PyErr(line, 'In ' + name + '(), use one of: ' + ok.slice(0, 8).join(', ') + (ok.length > 8 ? '…' : '') + '.');
          b.fields[fname] = val;
        } else b.inputs[fname] = sock(v, kind);
      });
      if (!api[5]) b.__stmt = true;
      return b;
    }
    if (name.includes('.')) throw new PyErr(line, name + ' needs brackets after it, like ' + name + '().');
    if (CONSTANTS.has(name)) return { type: 'cr_block', id: id(), fields: { B: name } }; // the runner treats every constant as its word
    if (/^[A-Z][A-Z_]+$/.test(name)) throw new PyErr(line, 'I don’t know ' + name + '. Block names are like STONE, PLANKS, GLASS; directions are FORWARD, BACK, LEFT, RIGHT, UP, DOWN.');
    return { type: 'variables_get', id: id(), fields: { VAR: vid(name) } };
  }
  // the program: @on_chat functions and top-level code (= when Run is clicked)
  const hats = [], run = [];
  try {
    while (!is('EOF')) {
      if (is('NL')) { next(); continue; }
      if (is('OP', '@')) {
        const line = next().line; const dn = want('NAME', undefined, 'Write on_chat after @.').v;
        if (dn !== 'on_chat') throw new PyErr(line, 'Only @on_chat("word") works here.');
        want('OP', '('); const w = want('STR', undefined, 'Put the chat word in quotes, like @on_chat("house").').v; want('OP', ')');
        want('NL', undefined, 'Put def on the next line.');
        want('NAME', 'def', 'The line after @on_chat needs to start with def.'); want('NAME', undefined, 'Give the function a name.');
        want('OP', '('); let param = null; if (is('NAME')) param = next().v; if (is('OP', ',')) throw new PyErr(line, 'A chat function can have one name in its brackets (the number typed after the word).');
        want('OP', ')');
        const body = block(line);
        const word = String(w).trim().split(/\s+/)[0].toLowerCase() || 'go';
        hats.push({ type: 'cr_on_chat', id: id(), fields: { WORD: word, VAR: vid(param || 'n') }, next: body ? { block: body } : undefined });
        continue;
      }
      if (is('INDENT')) throw new PyErr(peek().line, 'This line is moved in, but it isn’t inside anything. Take away the spaces at the start.');
      run.push(...statement());
    }
  } catch (e) { if (e instanceof PyErr) return { error: { line: e.line, msg: e.message } }; throw e; }
  const tops = [];
  if (run.length) tops.push({ type: 'cr_on_run', id: id(), next: { block: chain(run) } });
  tops.push(...hats);
  let y = 20; for (const h of tops) { h.x = 20; h.y = y; y += 70 + 46 * countBlocks(h); }
  return { state: JSON.parse(JSON.stringify({ blocks: { languageVersion: 0, blocks: tops }, variables: [...vars].map(([name, vid]) => ({ name, id: vid })) })) }; // drops empty inputs
}
function countBlocks(b) { let c = 0; const walk = x => { for (; x; x = x.next && x.next.block) { c++; for (const k in x.inputs || {}) if (/^(DO|ELSE)/.test(k) && x.inputs[k] && x.inputs[k].block) walk(x.inputs[k].block); } }; walk(b.next && b.next.block); return c; }
