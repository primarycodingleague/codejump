// Starter for "Sky Isles Explorers · Block 3 · Lesson 4: Storm warning" (Years 4–5, Platformer Lab).
// A loop that checks a condition: the game must be won within 60 seconds, but nothing warns you. Pupils add, under the
// rules: repeat until seconds left < 20 { wait 1 }, then show "The storm is coming! Hurry!" and play the zap sound.
// ---- Blockly XML helpers (run in Node by make-starters / the tests; only `build` runs in the page)
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const B = (type, inner = '') => `<block type="${type}">${inner}</block>`;
const F = (n, v) => `<field name="${n}">${esc(v)}</field>`;
const V = (n, b) => `<value name="${n}">${b}</value>`;
const S = (n, b) => `<statement name="${n}">${b}</statement>`;
const N = n => `<shadow type="math_number">${F('NUM', n)}</shadow>`;
const num = n => B('math_number', F('NUM', n));
const txt = t => B('text', F('TEXT', t));
const seq = (...bs) => bs.filter(Boolean).reduceRight((acc, b) => acc ? b.replace(/<\/block>$/, '<next>' + acc + '</next></block>') : b, '');
const hat = (type, x, y, body, fields = '') => `<block type="${type}" x="${x}" y="${y}">${fields}${body ? '<next>' + body + '</next>' : ''}</block>`;
const msg = t => B('show_message', V('MSG', `<shadow type="text">${F('TEXT', t)}</shadow>`));
const say = b => B('show_message', V('MSG', b));
const wait = n => B('wait_seconds', V('N', N(n)));
const snd = s => B('play_sound', F('SND', s));
const score = n => B('change_score', V('N', N(n)));
const scoreB = b => B('change_score', V('N', b));
const lifeUp = n => B('change_lives', V('N', N(n)));
const rep = (n, ...body) => B('controls_repeat_ext', V('TIMES', N(n)) + S('DO', seq(...body)));
const until = (cond, ...body) => B('controls_whileUntil', F('MODE', 'UNTIL') + V('BOOL', cond) + S('DO', seq(...body)));
const iff = (cond, then, els) => B('controls_if', (els ? '<mutation else="1"></mutation>' : '') + V('IF0', cond) + S('DO0', then) + (els ? S('ELSE', els) : ''));
const cmp = (op, a, b) => B('logic_compare', F('OP', op) + V('A', a) + V('B', b));
const and = (a, b) => B('logic_operation', F('OP', 'AND') + V('A', a) + V('B', b));
const minus = (a, b) => B('math_arithmetic', F('OP', 'MINUS') + V('A', a) + V('B', b));
const vf = name => `<field name="VAR" id="v_${name}">${name}</field>`;
const vget = name => B('variables_get', vf(name));
const vset = (name, val) => B('variables_set', vf(name) + V('VALUE', val));
const vchg = (name, val) => B('math_change', vf(name) + V('DELTA', val));
const join = (...parts) => B('text_join', `<mutation items="${parts.length}"></mutation>` + parts.map((p, i) => V('ADD' + i, typeof p === 'string' ? txt(p) : p.b)).join(''));
const blk = b => ({ b }); // a block (not text) inside join(...)
const def = (name, args, x, y, ...body) => `<block type="procedures_defnoreturn" x="${x}" y="${y}"><mutation>${args.map(a => `<arg name="${a}" varid="v_${a}"></arg>`).join('')}</mutation>${F('NAME', name)}${S('STACK', seq(...body))}</block>`;
const call = (name, args, ...vals) => `<block type="procedures_callnoreturn"><mutation name="${name}">${args.map(a => `<arg name="${a}"></arg>`).join('')}</mutation>${vals.map((v, i) => V('ARG' + i, v)).join('')}</block>`;
const xml = (vars, ...tops) => `<xml xmlns="https://developers.google.com/blockly/xml">${vars.length ? '<variables>' + vars.map(v => `<variable id="v_${v}">${v}</variable>`).join('') + '</variables>' : ''}${tops.join('')}</xml>`;
const key = (k, act, x) => hat('when_key_pressed', x, 20, B(act), F('KEY', k));
const CONTROLS = key('left', 'player_move_left', 20) + key('right', 'player_move_right', 230) + key('space', 'player_jump', 440);
// the usual rules under "when game starts", as a list of single blocks to spread into seq(...)
const RULES = (win = B('win_reach_goal')) => [win, B('set_lives', F('LIVES', 3)), B('set_gem_points', F('POINTS', 10)), B('set_music', F('MUSIC', 'adventure'))];
const beat = secs => B('win_beat_timer', F('SECS', String(secs)));
const ifs = (pairs, els) => B('controls_if', `<mutation elseif="${pairs.length - 1}"${els ? ' else="1"' : ''}></mutation>` + pairs.map(([c, d], i) => V('IF' + i, c) + S('DO' + i, d)).join('') + (els ? S('ELSE', els) : ''));
const every = (n, x, y, body) => hat('every_n_seconds', x, y, body, F('N', n));

// ---- the level, as data: pages of [row, col, tile name] cells (the standard 20 × 12 grid; row 11 is the bottom)
const R = 12, C = 20, G = R - 1;
const newPage = () => ({ cells: [], signs: {}, gates: {}, buttons: {} });
const put = (P, r, c, t) => { P.cells.push([r, c, t]); return P; };
const ground = (P, spikes = []) => { for (let c = 0; c < C; c++) put(P, G, c, spikes.includes(c) ? 'SPIKE' : 'GRASS'); return P; };
const hrow = (P, r, c0, c1, t = 'PLATFORM') => { for (let c = c0; c <= c1; c++) put(P, r, c, t); return P; };
const sign = (P, r, c, text) => { put(P, r, c, 'SIGN'); P.signs[r + ',' + c] = text; return P; };
const block = (P, c0, c1, top) => { for (let c = c0; c <= c1; c++) for (let r = top; r < G; r++) put(P, r, c, r === top ? 'GRASS' : 'PLATFORM'); return P; };

export function makeArgs() {
  const P = ground(newPage(), [5, 6, 12, 13]);
  put(P, G - 1, 1, 'START'); put(P, G - 1, 18, 'GOAL'); hrow(P, G - 2, 8, 10); put(P, G - 3, 9, 'GEM'); put(P, G - 1, 15, 'GEM'); put(P, G - 1, 3, 'GEM');
  sign(P, G - 1, 2, 'Captain Wren: a storm is on its way. Reach the lighthouse in time!');
  put(P, 1, 6, 'CLOUD'); put(P, 2, 11, 'CLOUD'); put(P, 1, 16, 'CLOUD');
  return {
    PAGES: [P],
    XML: xml([], CONTROLS, hat('when_game_starts', 20, 130, seq(...RULES(beat(60))))),
    ANSWER: xml([], CONTROLS, hat('when_game_starts', 20, 130, seq(...RULES(beat(60)),
      until(cmp('LT', B('get_timer'), num(20)), wait(1)), msg('The storm is coming! Hurry!'), snd('zap'))))
  };
}

// Runs in the page (make-starters / lessonOpenStarter never see the helpers above): paints each page, then loads the blocks.
export const build = ({ XML, PAGES }) => {
  startNewProject('ks2');
  PAGES.forEach((P, i) => {
    if (i > 0) addLevel();
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { grid[r][c] = T.EMPTY; waterGrid[r][c] = 0; }
    for (const [r, c, t] of P.cells) grid[r][c] = T[t];
    Object.assign(signCfg, Object.fromEntries(Object.entries(P.signs).map(([k, text]) => [k, { text }])));
    Object.assign(gateCfg, JSON.parse(JSON.stringify(P.gates))); Object.assign(buttonCfg, JSON.parse(JSON.stringify(P.buttons)));
    commitLevel();
  });
  if (PAGES.length > 1) gotoLevel(0);
  renderPagesStrip(); clearDirty();
  if (XML) {
    window._pendingXml = XML; // the Code view loads the program from here the first time it opens
    if (blocklyWorkspace) { blocklyWorkspace.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(XML), blocklyWorkspace); window._pendingXml = null; readBlocklyConfig(); }
  }
};
