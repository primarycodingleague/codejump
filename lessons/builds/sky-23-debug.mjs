// Starter for "Sky Isles Explorers · Block 4 · Lesson 5: Fix the storm game" (Years 5–6, Platformer Lab).
// Debugging variables and functions. Captain Wren's storm game should make storm go up by 1 every second, report it with
// the function report(level), calm it by 3 for every sun gem and end the game when storm reaches 10. Three bugs:
// "set storm to 0" instead of "change storm by 1" (it never grows); report shows the number 1 instead of its input
// level; and the game-over check uses score instead of storm (one gem ends the game). ANSWER = the fixed program.
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
  const P = ground(newPage(), [9]);
  put(P, G - 1, 1, 'START'); put(P, G - 1, 18, 'GOAL'); hrow(P, G - 2, 11, 13); put(P, G - 3, 12, 'GEM'); put(P, G - 1, 4, 'GEM'); put(P, G - 1, 6, 'GEM'); put(P, G - 1, 15, 'GEM');
  sign(P, G - 1, 2, 'The storm grows every second. Each sun gem calms it by 3. If it reaches 10, the storm wins!');
  put(P, 1, 5, 'CLOUD'); put(P, 1, 10, 'CLOUD'); put(P, 2, 15, 'CLOUD');
  const storm = vget('storm'), level = vget('level');
  const prog = fixed => xml(['storm', 'level'], CONTROLS, hat('when_game_starts', 20, 130, seq(...RULES(), vset('storm', num(0)))),
    every(1, 430, 130, seq(fixed ? vchg('storm', N(1)) : vset('storm', num(0)), call('report', ['level'], storm),
      iff(cmp('GTE', fixed ? storm : B('get_score'), num(10)), B('game_over')))),
    def('report', ['level'], 20, 420, say(join('Storm: ', blk(fixed ? level : num(1)))), iff(cmp('GTE', level, num(7)), snd('zap'))),
    hat('when_collect_gem', 430, 380, seq(vchg('storm', N(-3)), msg('The storm calms down.'))));
  return { PAGES: [P], GEMS: [[4, G - 1], [6, G - 1], [12, G - 3], [15, G - 1]], XML: prog(false), ANSWER: prog(true) };
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
