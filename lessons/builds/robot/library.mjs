// ROBOT LIBRARIAN — the Robot Lab's lesson unit (lessons/units/robot.js): the starter program for each new lesson, the
// answer that does what the lesson promises, and the play scripts the test uses to try them (tests/unit-robot.test.mjs).
// Sparky is the new robot helper at Willow Lane Library. Programs are Blockly JSON workspace states, written with the small
// helpers below; a project = { blocks, name, body, trim } (what robotApp.setProject takes).
//
// PLAY[id] = list of scenarios: { secs, answers: [typed answers, in order], events: [{ at, tap | key | hold | mouse }] }.
//   tap: part ('head' …) · key: a key name, pressed once · hold: a key name held for 0.5 s · mouse: { x, y } (0–10, stays)

const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const T = t => ({ shadow: { type: 'text', fields: { TEXT: t } } });
const V = x => (typeof x === 'number' ? N(x) : typeof x === 'string' ? T(x) : { block: x });
export const chain = list => { let first = null, prev = null; for (const b of list.filter(Boolean)) { if (prev) prev.next = { block: b }; else first = b; prev = b; } return first; };
const body = list => { const c = chain(list); return c ? { block: c } : undefined; };

// ── statements
const sayW = t => ({ type: 'rb_say_wait', inputs: { TEXT: V(t) } });
const say = t => ({ type: 'rb_say', inputs: { TEXT: V(t) } });
const face = f => ({ type: 'rb_face', fields: { FACE: f } });
const look = d => ({ type: 'rb_look', fields: { DIR: d } });
const move = (m, n) => ({ type: 'rb_move', fields: { M: m }, inputs: { N: N(n) } });
const light = (part, col) => ({ type: 'rb_light', fields: { PART: part, COL: col } });
const lightOff = part => ({ type: 'rb_light_off', fields: { PART: part } });
const blink = () => ({ type: 'rb_blink' });
const wait = s => ({ type: 'rb_wait', inputs: { S: N(s) } });
const ask = q => ({ type: 'rb_ask', inputs: { TEXT: T(q) } });
const send = m => ({ type: 'rb_send', fields: { MSG: m } });
const repeat = (n, list) => ({ type: 'controls_repeat_ext', inputs: { TIMES: V(n), DO: body(list) } });
const forever = list => ({ type: 'rb_forever', inputs: { DO: body(list) } });
const until = (cond, list) => ({ type: 'controls_whileUntil', fields: { MODE: 'UNTIL' }, inputs: { BOOL: { block: cond }, DO: body(list) } });
const waitUntil = cond => ({ type: 'rb_wait_until', inputs: { COND: { block: cond } } });
const iff = (cond, yes) => ({ type: 'controls_if', inputs: { IF0: { block: cond }, DO0: body(yes) } });
const ifElse = (cond, yes, no) => ({ type: 'controls_if', extraState: { hasElse: true }, inputs: { IF0: { block: cond }, DO0: body(yes), ELSE: body(no) } });
const set = (name, x) => ({ type: 'variables_set', fields: { VAR: { id: 'v_' + name } }, inputs: { VALUE: V(x) } });
const change = (name, n) => ({ type: 'math_change', fields: { VAR: { id: 'v_' + name } }, inputs: { DELTA: N(n) } });
// ── values
const answer = () => ({ type: 'rb_answer' });
const cmp = (op, a, b) => ({ type: 'logic_compare', fields: { OP: op }, inputs: { A: V(a), B: V(b) } });
const join = (...parts) => ({ type: 'text_join', extraState: { itemCount: parts.length }, inputs: Object.fromEntries(parts.map((p, i) => ['ADD' + i, V(p)])) });
const get = name => ({ type: 'variables_get', fields: { VAR: { id: 'v_' + name } } });
const mouse = ax => ({ type: 'rb_mouse', fields: { AX: ax } });
const timer = () => ({ type: 'rb_timer' });
const keyDown = k => ({ type: 'rb_key_pressed', fields: { KEY: k } });
// ── scripts
let Y = 0;
const at = (b, y) => Object.assign(b, { x: 24, y });
const whenRun = (list, y = 24) => at({ type: 'rb_when_run', next: body(list) }, y);
const whenTapped = (part, list, y) => at({ type: 'rb_when_tapped', fields: { PART: part }, next: body(list) }, y);
const whenKey = (key, list, y) => at({ type: 'rb_when_key', fields: { KEY: key }, next: body(list) }, y);
const whenMsg = (msg, list, y) => at({ type: 'rb_when_message', fields: { MSG: msg }, next: body(list) }, y);
// My blocks: Blockly's own procedure blocks (params get variable ids 'p_<name>')
const def = (name, params, list, y) => at({ type: 'procedures_defnoreturn', fields: { NAME: name },
  ...(params.length ? { extraState: { params: params.map(p => ({ name: p, id: 'p_' + p })) } } : {}), inputs: { STACK: body(list) } }, y);
const call = (name, args = []) => ({ type: 'procedures_callnoreturn', extraState: { name, ...(args.length ? { params: args.map(a => a[0]) } : {}) },
  ...(args.length ? { inputs: Object.fromEntries(args.map((a, i) => ['ARG' + i, V(a[1])])) } : {}) });
const param = name => ({ type: 'variables_get', fields: { VAR: { id: 'p_' + name } } });

const SPARKY = { name: 'Sparky', body: '#eef2f6', trim: '#2f9e6b' };
const proj = (scripts, vars = [], extra = {}) => ({ blocks: { blocks: { languageVersion: 0, blocks: scripts }, ...(vars.length ? { variables: vars.map(n => ({ name: n, id: 'v_' + n })) } : {}) }, ...SPARKY, ...extra });

// pieces used more than once
const nodYes = () => [move('HeadNod', 8), move('HeadNod', 2), move('HeadNod', 5)];
const shakeNo = () => [move('HeadTurn', 2), move('HeadTurn', 8), move('HeadTurn', 5)];
const flash = n => repeat(n, [light('all', '#ff3355'), wait(0.3), light('all', '#35d0ff'), wait(0.3)]);
const nodOnce = () => [move('HeadNod', 8), move('HeadNod', 2)];

export const STARTERS = {
  // ── Block 1 · Hello, library! (Years 3–4)
  'library-1-welcome': proj([whenRun([lightOff('eyes'), face('sleepy')])]),
  'library-2-tour': proj([whenRun([face('happy'), sayW('Follow me for a tour of the library!'), look('left'), sayW('This is the story corner.')])]),
  'library-4-stretch': proj([whenRun([face('happy'), sayW('Time for a stretch break!'), sayW('Nod your head with me, five times!'), ...nodOnce(), look('ahead'),
    sayW('Now tilt your head side to side, three times!'), move('HeadTilt', 2), move('HeadTilt', 8), move('HeadTilt', 5), sayW('Well done, everyone!')])]),
  'library-5-buttons': proj([whenRun([face('happy'), sayW('Hello! Tap my head, or press B or C on the help desk.')])]),
  'library-6-project': proj([whenRun([face('happy'), sayW('I am Sparky, the library robot!')])]),
  // ── Block 2 · The help desk (Years 4–5)
  'library-7-signin': proj([whenRun([face('happy'), sayW('Welcome! Please sign in.')])]),
  'library-8-shelves': proj([whenRun([face('happy'), ask('Do you like stories or facts?'), sayW('Let me help you find a book.')])]),
  'library-9-door': proj([whenRun([face('happy'), sayW('I will watch the door.'), forever([iff(cmp('LT', mouse('x'), 4), [look('left')])])])]),
  'library-10-closing': proj([whenRun([face('happy'), sayW('The library is open!'), forever([blink(), wait(1)])])]),
  'library-11-returns': proj([whenRun([face('happy'), sayW('The returns desk is open!'), repeat(2, [ask('Is it a story book or a fact book?'),
    ifElse(cmp('EQ', answer(), 'story'), [look('right'), sayW('That goes on the story shelf.')], [look('left'), sayW('That goes on the fact shelf.')]),
    sayW('All done. Thank you!')])])]),
  'library-12-project': proj([whenRun([face('happy'), sayW('Welcome to the help desk!')])]),
  // ── Block 3 · Open day (Years 5–6)
  'library-14-survey': proj([whenRun([face('happy'), sayW('Please help me with the library survey!'), repeat(5, [ask('Do you like stories or facts best?'), sayW('Thank you!')]),
    sayW('The survey is finished.')])]),
  'library-15-lights': proj([whenRun([face('happy'), sayW('Welcome to the open day light show!'), flash(6), move('HeadNod', 2), move('HeadNod', 5), sayW('Thank you!')])]),
  'library-16-myblocks': proj([whenRun([face('happy'), sayW('Let’s play yes or no!'), sayW('Do you like books?'), ...nodYes(), sayW('Are dragons real?'), ...shakeNo(),
    sayW('Is reading fun?'), ...nodYes()])]),
  'library-17-inputs': proj([def('cheer', [], [repeat(3, nodOnce()), move('HeadNod', 5)], 24),
    whenRun([face('happy'), sayW('Welcome to the Willow Lane Book Awards!'), sayW('The Owl Who Read Too Much gets three stars!'), call('cheer'),
      sayW('Space Cats gets two stars!'), call('cheer'), sayW('Fish Facts gets one star!'), call('cheer')], 340)]),
  'library-18-project': proj([whenRun([face('happy'), sayW('Welcome to Open Day at Willow Lane Library!')])])
};

export const ANSWERS = {
  'library-1-welcome': proj([whenRun([lightOff('eyes'), face('sleepy'), light('eyes', '#ffd23f'), face('happy'), sayW('Welcome to Willow Lane Library!'), look('left'), look('right'), look('ahead'), blink()])]),
  'library-2-tour': proj([whenRun([face('happy'), sayW('Follow me for a tour of the library!'), look('left'), sayW('This is the story corner.'),
    look('right'), sayW('Here are the computers.'), look('down'), sayW('The returns box is down here.'), look('ahead'), sayW('Enjoy your visit!')])]),
  // the adopted Robot storyteller: the happy face and the eye light moved up, under "say Zzz… until done"
  'robot-storyteller': proj([whenRun([lightOff('eyes'), face('sleepy'), sayW('Zzz…'), face('happy'), light('eyes', '#ffd23f'), sayW('Good morning! I am Sparky.')])]),
  'library-4-stretch': proj([whenRun([face('happy'), sayW('Time for a stretch break!'), sayW('Nod your head with me, five times!'), repeat(5, nodOnce()), look('ahead'),
    sayW('Now tilt your head side to side, three times!'), repeat(3, [move('HeadTilt', 2), move('HeadTilt', 8)]), move('HeadTilt', 5), sayW('Well done, everyone!')])]),
  'library-5-buttons': proj([whenRun([face('happy'), sayW('Hello! Tap my head, or press B or C on the help desk.')]),
    whenTapped('head', [face('surprised'), sayW('The library is open from 9 till 5.'), face('happy')], 300),
    whenKey('b', [look('left'), sayW('The books are on the left.'), look('ahead')], 480),
    whenKey('c', [look('right'), sayW('The computers are on the right.'), look('ahead')], 640)]),
  'library-6-project': proj([whenRun([light('eyes', '#ffd23f'), face('happy'), sayW('I am Sparky, the library robot!'), sayW('Welcome to Willow Lane Library!'), repeat(3, nodOnce()), look('ahead')]),
    whenTapped('any', [face('surprised'), sayW('Happy reading!'), face('happy')], 420),
    whenKey('space', [face('sleepy'), sayW('Goodnight!'), lightOff('all')], 580)]),
  'library-7-signin': proj([whenRun([face('happy'), sayW('Welcome! Please sign in.'), ask('What is your name?'), sayW(join('Hello, ', answer())),
    ask('What is your favourite book?'), sayW(join(answer(), ' is a great choice!'))])]),
  'library-8-shelves': proj([whenRun([face('happy'), ask('Do you like stories or facts?'),
    ifElse(cmp('EQ', answer(), 'stories'), [look('left'), sayW('Story books are on the left!')], [look('right'), sayW('Fact books are on the right!')])])]),
  'library-9-door': proj([whenRun([face('happy'), sayW('I will watch the door.'), forever([ifElse(cmp('LT', mouse('x'), 4), [look('left')],
    [ifElse(cmp('GT', mouse('x'), 6), [look('right')], [look('ahead')])])])])]),
  'library-10-closing': proj([whenRun([face('happy'), sayW('The library is open!'), until(cmp('GT', timer(), 8), [blink(), wait(1)]),
    sayW('The library closes in five minutes!'), waitUntil(keyDown('space')), face('sleepy'), sayW('Goodbye!')])]),
  'library-11-returns': proj([whenRun([face('happy'), sayW('The returns desk is open!'), repeat(3, [ask('Is it a story book or a fact book?'),
    ifElse(cmp('EQ', answer(), 'story'), [look('left'), sayW('That goes on the story shelf.')], [look('right'), sayW('That goes on the fact shelf.')])]),
    sayW('All done. Thank you!')])]),
  'library-12-project': proj([whenRun([face('happy'), sayW('Welcome to the help desk!'),
    until(cmp('EQ', answer(), 'bye'), [ask('How can I help? Say books, computers, toilets or bye.'),
      ifElse(cmp('EQ', answer(), 'books'), [look('left'), sayW('The books are on the left.')],
        [ifElse(cmp('EQ', answer(), 'computers'), [look('right'), sayW('The computers are on the right.')],
          [ifElse(cmp('EQ', answer(), 'toilets'), [look('down'), sayW('The toilets are down the stairs.')],
            [iff(cmp('NEQ', answer(), 'bye'), [face('thinking'), sayW('Sorry, I can only help with books, computers or toilets.'), face('happy')])])])]), look('ahead')]),
    face('happy'), sayW('Goodbye! Happy reading!')])]),
  'robot-quiz': proj([whenRun([set('score', 0), face('happy'), sayW('Welcome to my quiz!'),
    ask('What is 3 + 4?'), ifElse(cmp('EQ', answer(), 7), [face('happy'), sayW('Correct!'), change('score', 1)], [face('sad'), sayW('Not quite. It is 7.')]),
    ask('How many legs does a spider have?'), ifElse(cmp('EQ', answer(), 8), [face('happy'), sayW('Correct!'), change('score', 1)], [face('sad'), sayW('Not quite. It is 8.')]),
    sayW(join('Your score is ', get('score')))])], ['score'], { name: 'Quizbot', body: '#eef2f6', trim: '#7b3fd8' }),
  'library-14-survey': proj([whenRun([set('stories', 0), set('facts', 0), face('happy'), sayW('Please help me with the library survey!'),
    repeat(5, [ask('Do you like stories or facts best?'), ifElse(cmp('EQ', answer(), 'stories'), [change('stories', 1)], [change('facts', 1)]), sayW('Thank you!')]),
    sayW('The survey is finished.'), sayW(join('Stories: ', get('stories'))), sayW(join('Facts: ', get('facts'))),
    ifElse(cmp('GT', get('stories'), get('facts')), [sayW('Stories win!')], [sayW('Facts win!')])])], ['stories', 'facts']),
  'library-15-lights': proj([whenRun([face('happy'), send('lights'), sayW('Welcome to the open day light show!'), move('HeadNod', 2), move('HeadNod', 5), sayW('Thank you!')]),
    whenMsg('lights', [flash(6)], 400),
    whenTapped('any', [send('lights'), say('Ooh, again!')], 560)]),
  'library-16-myblocks': proj([def('nod yes', [], nodYes(), 24), def('shake no', [], shakeNo(), 230),
    whenRun([face('happy'), sayW('Let’s play yes or no!'), sayW('Do you like books?'), call('nod yes'), sayW('Are dragons real?'), call('shake no'),
      sayW('Is reading fun?'), call('nod yes'), sayW('Can robots read?'), call('nod yes')], 440)]),
  'library-17-inputs': proj([def('cheer', ['stars'], [repeat(param('stars'), nodOnce()), move('HeadNod', 5)], 24),
    whenRun([face('happy'), sayW('Welcome to the Willow Lane Book Awards!'), sayW('The Owl Who Read Too Much gets three stars!'), call('cheer', [['stars', 3]]),
      sayW('Space Cats gets two stars!'), call('cheer', [['stars', 2]]), sayW('Fish Facts gets one star!'), call('cheer', [['stars', 1]])], 340)]),
  'library-18-project': proj([def('bow', [], [move('HeadNod', 2), move('HeadNod', 5)], 860),
    whenRun([set('score', 0), face('happy'), sayW('Welcome to Open Day at Willow Lane Library!'), ask('What is your name?'), sayW(join('Hello, ', answer())),
      until(cmp('EQ', answer(), 'bye'), [ask('Would you like the quiz, the show, or bye?'),
        ifElse(cmp('EQ', answer(), 'quiz'), [ask('What is 6 x 7?'), ifElse(cmp('EQ', answer(), 42), [change('score', 1), call('bow'), sayW('Correct!')], [sayW('Not quite. It is 42.')])],
          [ifElse(cmp('EQ', answer(), 'show'), [send('lights'), sayW('Enjoy the light show!')],
            [iff(cmp('NEQ', answer(), 'bye'), [sayW('Please say quiz, show or bye.')])])])]),
      sayW(join('You scored ', get('score'), '. Goodbye!')), call('bow')]),
    whenMsg('lights', [flash(4)], 700)], ['score'])
};

export const PLAY = {
  'library-1-welcome': [{ secs: 12 }],
  'library-2-tour': [{ secs: 25 }],
  'robot-storyteller': [{ secs: 15 }],
  'library-4-stretch': [{ secs: 30 }],
  'library-5-buttons': [{ secs: 26, events: [{ at: 7, tap: 'head' }, { at: 13, key: 'b' }, { at: 19, key: 'c' }] }],
  'library-6-project': [{ secs: 26, events: [{ at: 14, tap: 'head' }, { at: 20, key: 'space' }] }],
  'library-7-signin': [{ secs: 16, answers: ['Amara', 'The Owl Who Read Too Much'] }],
  'library-8-shelves': [{ secs: 10, answers: ['stories'] }, { secs: 10, answers: ['Facts'] }],
  'library-9-door': [{ secs: 12, events: [{ at: 0, mouse: { x: 5, y: 5 } }, { at: 2.5, mouse: { x: 1, y: 5 } }, { at: 6, mouse: { x: 9, y: 5 } }, { at: 9, mouse: { x: 5, y: 5 } }] }],
  'library-10-closing': [{ secs: 22, events: [{ at: 16, hold: 'space' }] }],
  'library-11-returns': [{ secs: 30, answers: ['story', 'fact', 'Story'] }],
  'library-12-project': [{ secs: 40, answers: ['books', 'computers', 'toilets', 'juggling', 'bye'] }],
  'robot-quiz': [{ secs: 16, answers: ['7', '8'] }, { secs: 16, answers: ['7', '6'] }],
  'library-14-survey': [{ secs: 30, answers: ['stories', 'facts', 'stories', 'Stories', 'facts'] }, { secs: 30, answers: ['facts', 'facts', 'stories', 'facts', 'facts'] }],
  'library-15-lights': [{ secs: 16, events: [{ at: 11, tap: 'head' }] }],
  'library-16-myblocks': [{ secs: 30 }],
  'library-17-inputs': [{ secs: 40 }],
  'library-18-project': [{ secs: 40, answers: ['Amara', 'quiz', '42', 'show', 'bye'] }]
};
