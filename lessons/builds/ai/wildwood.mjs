// WILDWOOD SPOTTERS — the AI Lab's lesson unit (lessons/units/ai.js). For every lesson: the starter project (what pupils
// open), the answer (what the lesson's steps lead to) and a play script (what the tests draw or type while it runs).
// Starters are made by lessons/make-starters.mjs from lessons/builds/ai-<n>-<word>.mjs; tests/unit-ai.test.mjs proves that
// every answer ticks every goal and no starter does. Projects carry `goals` (ai/ai-goals.js), shown as a checklist.
import { COLOURS } from '../../../ai/ai-model.js';
import { draws } from './draw.mjs';
import { BOOK, DOG_BOOK, DOG_FIX } from './words.mjs';

// ── data
const lab = (names, n, seed, make) => names.map((name, i) => ({ name, color: COLOURS[i], ex: make(name, n, seed + i * 97) }));
export const tracks = (n = 6, seed = 31) => lab(['deer', 'fox', 'duck'], n, seed, draws);
export const signs = (n = 6, seed = 57) => lab(['left', 'right', 'closed'], n, seed, draws);
export const book = (o, n) => Object.keys(o).map((name, i) => ({ name, color: COLOURS[i], ex: o[name].slice(0, n) }));

// ── blocks, as Blockly JSON
const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const T = t => ({ shadow: { type: 'text', fields: { TEXT: t } } });
const val = x => (typeof x === 'string' ? T(x) : typeof x === 'number' ? N(x) : { block: x });
function chain(list) { let first = null, prev = null; for (const b of list.filter(Boolean)) { if (prev) prev.next = { block: b }; else first = b; prev = b; } return first; }
const body = list => ({ block: chain(list) });
const hat = (type, x, y, list, fields) => Object.assign({ type, x, y, ...(fields ? { fields } : {}) }, list.length ? { next: body(list) } : {});
const onRun = (list, y = 20) => hat('ai_when_run', 20, y, list);
const onGuess = (list, y = 200) => hat('ai_when_guess', 20, y, list);
const onThinks = (label, list, y) => hat('ai_when_thinks', 20, y, list, { LABEL: label });
const onMsg = (msg, list, y) => hat('ai_when_message', 20, y, list, { MSG: msg });
const show = x => ({ type: 'ai_say', inputs: { TEXT: val(x) } });
const showFor = (x, s) => ({ type: 'ai_say_for', inputs: { TEXT: val(x), S: N(s) } });
const wait = s => ({ type: 'ai_wait', inputs: { S: N(s) } });
const waitGuess = () => ({ type: 'ai_wait_drawing' });
const clear = () => ({ type: 'ai_clear' });
const sound = s => ({ type: 'ai_sound', fields: { S: s } });
const colour = c => ({ type: 'ai_colour', fields: { COL: c } });
const send = m => ({ type: 'ai_send', fields: { MSG: m } });
const setScore = n => ({ type: 'ai_set_score', inputs: { N: N(n) } });
const addScore = n => ({ type: 'ai_change_score', inputs: { N: N(n) } });
const score = () => ({ type: 'ai_score' });
const guess = () => ({ type: 'ai_guess' });
const sure = () => ({ type: 'ai_confidence' });
const thinks = label => ({ type: 'ai_thinks', fields: { LABEL: label } });
const randomLabel = () => ({ type: 'ai_random_label' });
const join = (...xs) => ({ type: 'text_join', extraState: { itemCount: xs.length }, inputs: Object.fromEntries(xs.map((x, i) => ['ADD' + i, val(x)])) });
const cmp = (op, a, b) => ({ type: 'logic_compare', fields: { OP: op }, inputs: { A: val(a), B: val(b) } });
const both = (op, a, b) => ({ type: 'logic_operation', fields: { OP: op }, inputs: { A: { block: a }, B: { block: b } } });
const iff = (cond, yes) => ({ type: 'controls_if', inputs: { IF0: { block: cond }, DO0: body(yes) } });
const ifElse = (cond, yes, no) => ({ type: 'controls_if', extraState: { hasElse: true }, inputs: { IF0: { block: cond }, DO0: body(yes), ELSE: body(no) } });
const repeat = (n, list) => ({ type: 'controls_repeat_ext', inputs: { TIMES: N(n), DO: body(list) } });
const until = (cond, list) => ({ type: 'controls_whileUntil', fields: { MODE: 'UNTIL' }, inputs: { BOOL: { block: cond }, DO: body(list) } });
const V = name => ({ name, id: 'v_' + name });
const setVar = (name, x) => ({ type: 'variables_set', fields: { VAR: { id: 'v_' + name } }, inputs: { VALUE: val(x) } });
const getVar = name => ({ type: 'variables_get', fields: { VAR: { id: 'v_' + name } } });
const changeVar = (name, n) => ({ type: 'math_change', fields: { VAR: { id: 'v_' + name } }, inputs: { DELTA: N(n) } });
const prog = (blocks, vars) => ({ blocks: { languageVersion: 0, blocks }, ...(vars && vars.length ? { variables: vars.map(V) } : {}) });
const goals = (title, list) => ({ title, list });

// ── the lessons. Each: starter() → project, answer() → project, play: what to draw (d: drawing name, s: seed) or type (t),
// or draw whatever the program asked for (target: variable name). A project = { kind, labels, blocks, trained, goals }.
const DRAW_PROJECT = { kind: 'draw' };
const surveyStep = () => [show('Draw a track'), waitGuess(), show(join('That’s a ', guess())), wait(1), addScore(1), clear()];
const L = {};

// Block 1 · Lesson 2 — Whose footprints? Build an AI from nothing by following the algorithm: labels, examples, train, test.
L['ai-2-tracks'] = {
  goals: goals('Whose footprints?', [
    { type: 'labels', n: 3, names: ['deer', 'fox', 'duck'], text: 'Three labels: deer, fox and duck' },
    { type: 'examples', n: 5, text: 'At least 5 drawings of each track' },
    { type: 'trained', text: 'Train Hoot on your drawings' },
    { type: 'tested', n: 3, text: 'Test it with 3 new drawings' }
  ]),
  starter() { return { ...DRAW_PROJECT, labels: [{ name: 'thing 1', color: COLOURS[0], ex: [] }, { name: 'thing 2', color: COLOURS[1], ex: [] }], goals: this.goals }; },
  answer() { return { ...DRAW_PROJECT, labels: tracks(5), goals: this.goals }; },
  test: [{ d: 'fox', s: 901 }, { d: 'deer', s: 902 }, { d: 'duck', s: 903 }]
};

// Block 1 · Lesson 3 — Hoot says what it sees: one event ("when the AI thinks it's …") for each track.
L['ai-3-events'] = {
  goals: goals('Hoot says what it sees', [
    { type: 'thinks', n: 3, text: 'A “when the AI thinks it’s …” script for deer, fox and duck' },
    { type: 'said', match: 'fox', text: 'Draw a fox track: Hoot says something about a fox' },
    { type: 'said', match: 'duck', text: 'Draw a duck track: Hoot says something about a duck' },
    { type: 'guesses', n: 3, text: 'Test all three tracks in one run' }
  ]),
  starter() {
    return { ...DRAW_PROJECT, labels: tracks(), trained: true, goals: this.goals, blocks: prog([
      onRun([show('Draw a footprint and I’ll tell you who made it!')]),
      onThinks('deer', [show('A deer walked here!'), sound('magic')], 160)]) };
  },
  answer() {
    const p = this.starter(); p.blocks.blocks.blocks.push(
      onThinks('fox', [show('A fox trotted past!'), sound('pop')], 300),
      onThinks('duck', [show('A duck waddled by!'), sound('splash')], 440));
    return p;
  },
  play: [{ d: 'fox', s: 301 }, { d: 'duck', s: 302 }, { d: 'deer', s: 303 }]
};

// Block 1 · Lesson 4 — The track survey: the same steps written out twice become one repeat 5 loop.
L['ai-4-survey'] = {
  goals: goals('The track survey', [
    { type: 'uses', blocks: ['controls_repeat_ext'], has: ['ai_wait_drawing'], text: 'A repeat loop around the survey steps' },
    { type: 'score', n: 5, text: 'Survey 5 tracks: the score reaches 5' },
    { type: 'said', match: 'survey done', text: 'At the end, Hoot shows “Survey done!”' }
  ]),
  starter() {
    return { ...DRAW_PROJECT, labels: tracks(), trained: true, goals: this.goals, blocks: prog([
      onRun([show('Track survey!'), setScore(0), wait(1), ...surveyStep(), ...surveyStep()])]) };
  },
  answer() {
    return { ...this.starter(), blocks: prog([onRun([show('Track survey!'), setScore(0), wait(1), repeat(5, surveyStep()), show('Survey done!')])]) };
  },
  play: [{ d: 'deer', s: 401 }, { d: 'fox', s: 402 }, { d: 'duck', s: 403 }, { d: 'fox', s: 404 }, { d: 'deer', s: 405 }]
};

// Block 1 · Lesson 5 — Hoot's muddle: three bugs (repeat count, a block outside the loop, a wrong label in an event).
L['ai-5-muddle'] = {
  goals: goals('Fix Hoot’s muddle', [
    { type: 'thinks', n: 3, text: 'Every track has its own “when the AI thinks it’s …” script' },
    { type: 'uses', blocks: ['ai_change_score'], inside: ['controls_repeat_ext'], text: '“change score by 1” is inside the loop' },
    { type: 'score', n: 5, text: 'The score counts all 5 tracks' },
    { type: 'said', match: 'survey done', text: 'Hoot shows “Survey done!” at the end' }
  ]),
  program(fixed) {
    const step = [show('Draw a track'), waitGuess(), wait(1.5), fixed ? addScore(1) : null, clear()];
    return prog([
      onRun([show('Track survey!'), setScore(0), wait(1), repeat(fixed ? 5 : 3, step), fixed ? null : addScore(1), show('Survey done!')]),
      onThinks('deer', [show('A deer walked here!')], 260),
      onThinks(fixed ? 'fox' : 'duck', [show('A fox trotted past!')], 380),
      onThinks('duck', [show('A duck waddled by!')], 500)]);
  },
  starter() { return { ...DRAW_PROJECT, labels: tracks(), trained: true, goals: this.goals, blocks: this.program(false) }; },
  answer() { return { ...this.starter(), blocks: this.program(true) }; },
  play: [{ d: 'deer', s: 501 }, { d: 'fox', s: 502 }, { d: 'duck', s: 503 }, { d: 'fox', s: 504 }, { d: 'duck', s: 505 }]
};

// Block 1 · Lesson 6 — Project: a spotter's guide of the pupils' own (three labels, events, a repeat).
L['ai-6-guide'] = {
  project: true,
  goals: goals('My spotter’s guide', [
    { type: 'labels', n: 3, text: 'Three labels of your own' },
    { type: 'examples', n: 6, text: 'At least 6 drawings of each' },
    { type: 'trained', text: 'Train Hoot' },
    { type: 'tested', n: 3, text: 'Test it with 3 new drawings' },
    { type: 'thinks', n: 3, text: 'A “when the AI thinks it’s …” script for each label' },
    { type: 'uses', blocks: ['controls_repeat_ext'], text: 'A repeat loop' }
  ]),
  starter() {
    return { ...DRAW_PROJECT, goals: this.goals, labels: ['thing 1', 'thing 2', 'thing 3'].map((name, i) => ({ name, color: COLOURS[i], ex: [] })),
      blocks: prog([onRun([show('Welcome to my spotter’s guide! Draw something you might see in Wildwood.')])]) };
  },
  answer() { // one pupil's guide: the reserve's trail signs, an event for each and a 3-go quiz
    return { ...DRAW_PROJECT, goals: this.goals, labels: signs(6, 61), blocks: prog([
      onRun([repeat(3, [show('Draw a trail sign'), waitGuess(), wait(1.5), clear()]), show('Thanks for spotting!')]),
      onThinks('left', [show('This way to the pond!')], 240), onThinks('right', [show('This way to the bird hide!')], 340),
      onThinks('closed', [show('Path closed: go back!')], 440)]) };
  },
  test: [{ d: 'left', s: 601 }, { d: 'closed', s: 602 }, { d: 'right', s: 603 }]
};

// Block 2 · Lesson 7 — Is Hoot sure? if … else on how sure the AI is.
L['ai-7-sure'] = {
  goals: goals('Is Hoot sure?', [
    { type: 'uses', blocks: ['controls_if_else'], has: ['ai_confidence'], text: 'An if … else that checks how sure the AI is' },
    { type: 'said', match: 'not sure', text: 'Draw a quick scribble: Hoot says it’s not sure' },
    { type: 'said', match: 'it’s a', text: 'Draw a clear track: Hoot still names it' }
  ]),
  starter() {
    return { ...DRAW_PROJECT, labels: tracks(), trained: true, goals: this.goals, blocks: prog([
      onRun([show('Draw a track!')]),
      onGuess([show(join('It’s a ', guess(), '!')), wait(1.5), clear()], 140)]) };
  },
  answer() {
    return { ...this.starter(), blocks: prog([onRun([show('Draw a track!')]),
      onGuess([ifElse(cmp('GT', sure(), 80), [show(join('It’s a ', guess(), '!'))], [show('Hmm, I’m not sure. Draw it again!')]), wait(1.5), clear()], 140)]) };
  },
  play: [{ d: 'fox', s: 701 }, { raw: [[128, 128, 130, 130]] }] // a dot: Hoot is only about 40% sure
};

// Block 2 · Lesson 8 — Which way, ranger? One script decides between three trail signs (if … else inside else).
L['ai-8-signs'] = {
  goals: goals('Which way, ranger?', [
    { type: 'uses', blocks: ['ai_thinks'], n: 2, inside: ['controls_if'], text: 'Two decisions that ask “AI thinks it’s … ?”' },
    { type: 'uses', blocks: ['controls_if_else'], text: 'An if … else for the last choice' },
    { type: 'said', match: 'left', text: 'A left arrow: Hoot says turn left' },
    { type: 'said', match: 'right', text: 'A right arrow: Hoot says turn right' },
    { type: 'said', match: 'closed', text: 'A no-entry sign: Hoot says the path is closed' }
  ]),
  starter() {
    return { ...DRAW_PROJECT, labels: signs(), trained: true, goals: this.goals, blocks: prog([
      onRun([show('Draw a trail sign and I’ll tell you which way to go.')]),
      onGuess([iff(thinks('left'), [show('Turn left at the old oak tree.')]), wait(1.5), clear()], 150)]) };
  },
  answer() {
    return { ...this.starter(), blocks: prog([onRun([show('Draw a trail sign and I’ll tell you which way to go.')]),
      onGuess([ifElse(thinks('left'), [show('Turn left at the old oak tree.')], [ifElse(thinks('right'), [show('Turn right to the pond.')], [show('This path is closed. Go back!')])]),
        wait(1.5), clear()], 150)]) };
  },
  play: [{ d: 'left', s: 801 }, { d: 'right', s: 802 }, { d: 'closed', s: 803 }]
};

// Block 2 · Lesson 9 — Mammal or bird? "or" joins two conditions; "and" only logs a fox when Hoot is sure.
L['ai-9-clues'] = {
  goals: goals('Mammal or bird?', [
    { type: 'uses', blocks: ['logic_operation'], fields: { OP: 'OR' }, text: 'An “or” block: deer or fox' },
    { type: 'said', match: 'mammal', text: 'A deer or a fox: Hoot says mammal' },
    { type: 'said', match: 'bird', text: 'A duck: Hoot says bird' },
    { type: 'uses', blocks: ['logic_operation'], fields: { OP: 'AND' }, text: 'An “and” block: a fox and Hoot is sure' },
    { type: 'score', n: 1, text: 'A sure fox sighting adds 1 to the score' }
  ]),
  starter() {
    return { ...DRAW_PROJECT, labels: tracks(), trained: true, goals: this.goals, blocks: prog([
      onRun([setScore(0), show('Draw a track: is it a mammal or a bird?')]),
      onGuess([iff(thinks('deer'), [show('A mammal! It has fur.')]), iff(thinks('fox'), [show('A mammal! It has fur.')]), wait(1.5), clear()], 150)]) };
  },
  answer() {
    return { ...this.starter(), blocks: prog([onRun([setScore(0), show('Draw a track: is it a mammal or a bird?')]),
      onGuess([ifElse(both('OR', thinks('deer'), thinks('fox')), [show('A mammal! It has fur.')], [show('A bird! It has feathers.')]),
        iff(both('AND', thinks('fox'), cmp('GT', sure(), 90)), [addScore(1)]), wait(1.5), clear()], 150)]) };
  },
  play: [{ d: 'deer', s: 901 }, { d: 'duck', s: 902 }, { d: 'fox', s: 903 }]
};

// Block 2 · Lesson 10 — Count the ducks: repeat 3 counts every drawing; repeat until score = 3 keeps going until 3 ducks.
L['ai-10-ducks'] = {
  goals: goals('Count the ducks', [
    { type: 'uses', blocks: ['controls_whileUntil'], has: ['ai_score'], text: 'A loop that repeats until the score is 3' },
    { type: 'score', n: 3, text: 'Three ducks counted' },
    { type: 'said', match: 'well done', text: 'Hoot says “Three ducks! Well done!” at the end' }
  ]),
  program(fixed) {
    const step = [waitGuess(), iff(thinks('duck'), [addScore(1)]), wait(1), clear()];
    return prog([onRun([setScore(0), show('Draw 3 duck tracks! Other tracks don’t count.'), fixed ? until(cmp('EQ', score(), 3), step) : repeat(3, step), show('Three ducks! Well done!')])]);
  },
  starter() { return { ...DRAW_PROJECT, labels: tracks(), trained: true, goals: this.goals, blocks: this.program(false) }; },
  answer() { return { ...this.starter(), blocks: this.program(true) }; },
  play: [{ d: 'duck', s: 1001 }, { d: 'fox', s: 1002 }, { d: 'duck', s: 1003 }, { d: 'duck', s: 1004 }]
};

// Block 2 · Lesson 11 — The night patrol: debug a loop and a condition (wait outside the loop, until the wrong way, < for >).
L['ai-11-patrol'] = {
  goals: goals('Fix the night patrol', [
    { type: 'uses', blocks: ['ai_wait_drawing'], inside: ['controls_whileUntil'], text: 'Hoot waits for each new drawing inside the loop' },
    { type: 'said', match: 'fox spotted', text: 'A clear fox track: Hoot says “Fox spotted!”' },
    { type: 'score', n: 2, text: 'Two foxes counted' },
    { type: 'said', match: 'patrol over', text: 'After the second fox: “Patrol over”' }
  ]),
  program(fixed) {
    const check = ifElse(both('AND', thinks('fox'), cmp(fixed ? 'GT' : 'LT', sure(), 80)), [addScore(1), show('Fox spotted!')], [show('Not a fox. Keep watching.')]);
    return prog([onRun([setScore(0), show('Night patrol: draw the tracks you find.'),
      fixed ? null : waitGuess(),
      until(fixed ? cmp('EQ', score(), 2) : cmp('LT', score(), 2), fixed ? [waitGuess(), check, wait(1.5), clear()] : [check, wait(1.5), clear()]),
      show('Patrol over: 2 foxes seen.')])]);
  },
  starter() { return { ...DRAW_PROJECT, labels: tracks(), trained: true, goals: this.goals, blocks: this.program(false) }; },
  answer() { return { ...this.starter(), blocks: this.program(true) }; },
  play: [{ d: 'fox', s: 1101 }, { d: 'deer', s: 1102 }, { d: 'fox', s: 1103 }]
};

// Block 2 · Lesson 12 — Project: the trail gate (selection, a loop that checks a condition, comparisons).
L['ai-12-gate'] = {
  project: true,
  goals: goals('My trail gate', [
    { type: 'uses', blocks: ['controls_if_else'], text: 'An if … else' },
    { type: 'uses', blocks: ['controls_whileUntil'], text: 'A loop that checks a condition' },
    { type: 'uses', blocks: ['logic_compare', 'logic_operation'], text: 'A comparison, “and” or “or”' },
    { type: 'uses', blocks: ['ai_thinks', 'ai_confidence', 'ai_conf_of'], text: 'Uses what the AI thinks or how sure it is' },
    { type: 'guesses', n: 3, text: 'Test it with 3 drawings in one run' },
    { type: 'said', match: 'gate is open', text: 'The gate opens: Hoot says “The gate is open”' }
  ]),
  starter() {
    return { ...DRAW_PROJECT, labels: signs(), trained: true, goals: this.goals, blocks: prog([onRun([show('The gate is closed. Draw the secret trail signs!')])]) };
  },
  answer() { // one design: draw right, right, right (sure ones only) to open the gate
    return { ...this.starter(), blocks: prog([onRun([setScore(0), show('The gate is closed. Draw 3 right arrows to open it!'),
      until(cmp('EQ', score(), 3), [waitGuess(), ifElse(both('AND', thinks('right'), cmp('GT', sure(), 80)), [addScore(1), show('Click!')], [setScore(0), show('Wrong sign: start again.')]), wait(1), clear()]),
      show('The gate is open. Enjoy your walk!')])]) };
  },
  play: [{ d: 'right', s: 1201 }, { d: 'right', s: 1202 }, { d: 'right', s: 1203 }]
};

// Block 3 · Lesson 14 — Draw what Hoot asks: variables remember the target and count the goes.
L['ai-14-target'] = {
  goals: goals('Draw what Hoot asks', [
    { type: 'var', name: 'target', op: 'text', text: 'A variable called target remembers what Hoot asked for' },
    { type: 'uses', blocks: ['logic_compare'], has: ['variables_get'], text: 'Compare the AI’s guess with target' },
    { type: 'var', name: 'goes', op: '>=', v: 3, text: 'A variable called goes counts every go' },
    { type: 'score', n: 3, text: 'Draw all 3 right: the score reaches 3' }
  ]),
  starter() {
    return { ...DRAW_PROJECT, labels: tracks(), trained: true, goals: this.goals, blocks: prog([
      onRun([show(join('Draw a ', randomLabel(), ' track!'))]),
      onGuess([show(join('I see a ', guess(), '.')), wait(1.5), clear()], 140)]) };
  },
  answer() {
    return { ...this.starter(), blocks: prog([onRun([setScore(0), setVar('goes', 0), repeat(3, [
      setVar('target', randomLabel()), show(join('Draw a ', getVar('target'), ' track!')), waitGuess(), changeVar('goes', 1),
      ifElse(cmp('EQ', guess(), getVar('target')), [addScore(1), show('Yes! Well spotted.')], [show(join('Hmm, that looks like a ', guess(), '.'))]), wait(1.5), clear()]),
    show(join('You got ', score(), ' right in ', getVar('goes'), ' goes.'))])], ['target', 'goes']) };
  },
  play: [{ target: 'target', s: 1401 }, { target: 'target', s: 1402 }, { target: 'target', s: 1403 }]
};

// Block 3 · Lesson 15 — Ranger alert! Messages split the job into scripts; a variable counts the foxes.
L['ai-15-alert'] = {
  goals: goals('Ranger alert!', [
    { type: 'msg', match: 'fox alert', text: 'Seeing a fox sends the message “fox alert”' },
    { type: 'uses', blocks: ['ai_when_message'], n: 2, text: 'Two “when I receive” scripts' },
    { type: 'said', match: 'ranger', text: 'A “when I receive fox alert” script calls the rangers' },
    { type: 'var', name: 'foxes', op: '>=', v: 2, text: 'A variable called foxes counts them: 2 foxes' },
    { type: 'msg', match: 'all clear', text: 'Any other track sends “all clear”' }
  ]),
  starter() {
    return { ...DRAW_PROJECT, labels: tracks(), trained: true, goals: this.goals, blocks: prog([
      onRun([show('Hoot is watching the hen house…')]),
      onThinks('fox', [show('A fox! Quick, somebody do something!')], 140)]) };
  },
  answer() {
    return { ...this.starter(), blocks: prog([onRun([setVar('foxes', 0), show('Hoot is watching the hen house…')]),
      onGuess([ifElse(thinks('fox'), [send('fox alert')], [send('all clear')]), wait(1.5), clear()], 140),
      onMsg('fox alert', [colour('#ffb3b3'), sound('laser'), show('Ranger alert: a fox by the hen house!'), changeVar('foxes', 1)], 320),
      onMsg('all clear', [colour('#c8f7c5'), show('All clear. The hens are safe.')], 480)], ['foxes']) };
  },
  play: [{ d: 'fox', s: 1501 }, { d: 'duck', s: 1502 }, { d: 'fox', s: 1503 }]
};

// Block 3 · Lesson 16 — The visitor book: a words AI; a missing label; more examples; the fair check and key words.
L['ai-16-book'] = {
  goals: goals('Hoot reads the visitor book', [
    { type: 'labels', n: 3, names: ['praise', 'problem', 'question'], text: 'Three labels: praise, problem and question' },
    { type: 'examples', n: 8, text: 'At least 8 messages for each label' },
    { type: 'check', pct: 50, text: 'Train it: the fair check gets at least half right' },
    { type: 'reads', match: 'where is the car park?', label: 'question', text: 'Test: “where is the car park?” is a question' }
  ]),
  starter() { return { kind: 'text', labels: book({ praise: BOOK.praise, problem: BOOK.problem }, 3), goals: this.goals }; },
  answer() { return { kind: 'text', labels: book(BOOK, 8), goals: this.goals }; }
};

// Block 3 · Lesson 17 — Is Hoot fair? Every dog message in the examples was a complaint: find the bias and fix the data.
L['ai-17-fair'] = {
  goals: goals('Make Hoot fair', [
    { type: 'examples', n: 12, text: 'At least 12 messages for each label' },
    { type: 'trained', text: 'Train it again' },
    { type: 'reads', match: 'my dog had a great time', label: 'praise', text: 'Test: “my dog had a great time” is praise' },
    { type: 'reads', match: 'the path by the lake is flooded', label: 'problem', text: 'Test: “the path by the lake is flooded” is still a problem' }
  ]),
  starter() { return { kind: 'text', labels: book(DOG_BOOK, 99), trained: true, goals: this.goals }; },
  answer() { return { kind: 'text', labels: book(DOG_BOOK, 99).map(l => ({ ...l, ex: l.ex.concat(DOG_FIX[l.name]) })), goals: this.goals }; }
};

// Block 3 · Lesson 18 — Project: Hoot's visitor centre (an AI of their own, a variable, a message, an if … else).
L['ai-18-centre'] = {
  project: true,
  goals: goals('Hoot’s visitor centre', [
    { type: 'labels', n: 3, text: 'At least three labels' },
    { type: 'examples', n: 8, text: 'At least 8 examples of each' },
    { type: 'check', pct: 60, text: 'The fair check gets 60% or more right' },
    { type: 'uses', blocks: ['variables_set', 'math_change'], text: 'A variable' },
    { type: 'uses', blocks: ['ai_send'], text: 'A message' },
    { type: 'uses', blocks: ['controls_if_else'], text: 'An if … else' },
    { type: 'guesses', n: 3, text: 'Test it with 3 visitors in one run' }
  ]),
  starter() {
    return { kind: 'text', labels: book(BOOK, 4), goals: this.goals, blocks: prog([onRun([show('Welcome to Wildwood! Type a message for the rangers and press Send.')])]) };
  },
  answer() {
    return { kind: 'text', labels: book(BOOK, 10), goals: this.goals, blocks: prog([
      onRun([setVar('jobs', 0), show('Welcome to Wildwood! Type a message for the rangers and press Send.')]),
      onGuess([ifElse(cmp('GT', sure(), 60), [ifElse(thinks('problem'), [send('new job')], [show(join('Thank you for your ', guess(), '!'))])],
        [show('Sorry, I didn’t understand. Can you say it another way?')]), wait(2), clear()], 150),
      onMsg('new job', [changeVar('jobs', 1), sound('beep'), show(join('Thank you. A ranger will fix it. Jobs today: ', getVar('jobs')))], 360)], ['jobs']) };
  },
  play: [{ t: 'the bin by the gate is overflowing' }, { t: 'we loved the walk, thank you' }, { t: 'where can we see the owls?' }]
};

export const UNIT = L;
export const IDS = Object.keys(L);
// the starter as make-starters needs it
export function args(id) { return { project: L[id].starter() }; }
// runs in the page (make-starters): open a new AI Lab project and load the starter
export const build = async ({ project }) => {
  startNewAI('ks2');
  for (let i = 0; i < 400 && !(aiApp && aiApp._ws && aiApp._ws()); i++) await new Promise(r => setTimeout(r, 50));
  aiApp.setProject(project);
  for (let i = 0; i < 400 && aiApp._training(); i++) await new Promise(r => setTimeout(r, 50));
};
