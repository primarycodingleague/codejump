/* CodeJump · Build Lab — World Maker screens: Make mode (characters, areas, tasks, settings, start, test), and playing a made world
 * (welcome card, checklist, talking to characters, area pop-ups, finishing, coding-challenge timer + stars, ready-made worlds).
 * The data and the checks live in craft-maker.js (no DOM). craft-app.js creates this with createMakerUI(app) and calls its hooks.
 */
import * as M from './craft-maker.js';
import { BLOCKS, NBLOCKS, LABEL_OF, BY_NAME, GROUND, BLOCK_ORDER } from './craft-world.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const svg = p => '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' + p + '</svg>';
const IC = {
  person: svg('<circle cx="12" cy="7" r="4" fill="#ffd166"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" fill="#3b8eea"/>'),
  area: svg('<rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="rgba(255,209,102,.25)" stroke="#ffd166" stroke-width="2" stroke-dasharray="4 3"/>'),
  tasks: svg('<rect x="4" y="3" width="16" height="18" rx="3" fill="#2bb673"/><path d="M8 9l2 2 4-4M8 15h8" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>'),
  cog: svg('<circle cx="12" cy="12" r="8" fill="#9aa3ad"/><circle cx="12" cy="12" r="3" fill="#2b2240"/>'),
  flag: svg('<path d="M6 21V3" stroke="#c0c6cc" stroke-width="2"/><path d="M6 4h12l-3 4 3 4H6z" fill="#e8453c"/>'),
  play: svg('<circle cx="12" cy="12" r="9.5" fill="#3fae5e"/><path d="M10 8l6 4-6 4z" fill="#fff"/>'),
  done: svg('<circle cx="12" cy="12" r="9.5" fill="#ae853e"/><path d="M7.5 12.5l3 3 6-6.5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>'),
  globe: svg('<circle cx="12" cy="12" r="9" fill="#3b8eea"/><path d="M5 9h14M5 15h14M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" stroke="#bfe2ff" stroke-width="1.4" fill="none"/>'),
  wand: svg('<path d="M4 20L15 9" stroke="#c08a4b" stroke-width="3" stroke-linecap="round"/><path d="M17 3l1 2.5L20.5 6 18 7l-1 2.5L16 7l-2.5-1L16 5z" fill="#ffd166"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2.5" fill="#ffd166"/><path d="M8 11V8a4 4 0 018 0v3" stroke="#ffd166" stroke-width="2.4" fill="none"/>'),
  redo: svg('<path d="M5 12a7 7 0 1 0 2-5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M3 4l4 3-4 3z" fill="#fff"/>'),
  star: on => '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="' + (on ? '#ffc23c' : 'rgba(255,255,255,.18)') + '" stroke="' + (on ? '#b57b00' : 'rgba(255,255,255,.3)') + '" stroke-width="1"/></svg>'
};
const fnv = s => { let h = 0x811c9dc5; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const fmtTime = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

export function createMakerUI(app) {
  const { $, world, player, runner } = app;
  let maker = null, progress = null, editing = false, testing = null, tool = null, pendingCorner = null, moveNpc = null;
  let compMode = false, checker = null, checkT = 0, inZones = new Set(), talking = null, nearNpc = null, finished = false;
  let chal = null; // {t0, elapsed, running, over}
  const view = () => app.view();

  // ── DOM ──
  const V = $('crView');
  V.insertAdjacentHTML('beforeend', `
    <div class="cr-mkbar" id="crMkBar" hidden role="toolbar" aria-label="Make tools">
      <span class="cr-mkt">${IC.wand} Make</span>
      <button type="button" data-tool="npc" title="Put a character in the world: click the ground">${IC.person}<span>Character</span></button>
      <button type="button" data-tool="zone" title="Mark an area: click two corners on the ground">${IC.area}<span>Area</span></button>
      <button type="button" id="crMkTasks" title="The checklist pupils work through">${IC.tasks}<span>Tasks</span></button>
      <button type="button" id="crMkSet" title="Title, welcome message, rules and challenge">${IC.cog}<span>Settings</span></button>
      <button type="button" id="crMkStart" title="Pupils start where you stand now, with the world as it is now">${IC.flag}<span>Set start</span></button>
      <button type="button" id="crMkTest" title="Try it as a pupil">${IC.play}<span>Test</span></button>
      <button type="button" id="crMkDone" class="gold" title="Finish making">${IC.done}<span>Done</span></button>
      <div class="cr-mkhint" id="crMkHint"></div>
    </div>
    <div class="cr-lesson" id="crLesson" hidden>
      <div class="cr-lhead"><b id="crLTitle"></b><span id="crLTime" class="cr-ltime" hidden></span><button type="button" class="cr-lfold" id="crLFold" title="Fold away">–</button></div>
      <ol class="cr-ltasks" id="crLTasks"></ol>
      <div class="cr-lbtns"><button type="button" id="crLStart" hidden>${IC.play} Start the challenge</button><button type="button" id="crLRestart">${IC.redo} Start again</button><button type="button" id="crLBack" hidden>Back to making</button></div>
    </div>
    <div class="cr-near" id="crNear" hidden></div>
    <div class="cr-talk" id="crTalk" hidden role="dialog" aria-live="polite"><div class="cr-talkn" id="crTalkN"></div><div class="cr-talkt" id="crTalkT"></div><div class="cr-talkb"><button type="button" id="crTalkNext">Next</button></div></div>
    <div class="cr-pop" id="crPop" hidden role="dialog"><div class="cr-popbox" id="crPopBox"></div></div>`);
  const topBtns = $('crMkBtns');
  topBtns.innerHTML = `<button type="button" id="crWorldsBtn" title="Ready-made worlds, and starting a world of your own">${IC.globe}<span>Worlds</span></button><button type="button" id="crMakeBtn" title="Make your own lesson world: characters, areas, tasks">${IC.wand}<span>Make</span></button>`;

  // ── helpers ──
  const attention = () => { const a = new Set(); if (!maker || editing) return a; for (const n of maker.npcs) { if (!talkedOnce.has(n.id) && maker.tasks.some(t => t.type === 'talk' && t.npc === n.id && !checker.done.has(t.id))) a.add(n.id); } return a; };
  const talkedOnce = new Set();
  function markers() {
    const v = view(); if (!v) return;
    if (!maker) { v.setMarkers(null); return; }
    v.setMarkers({ npcs: maker.npcs, zones: maker.zones, editing, labels: editing, start: editing && maker.start, attention: attention() });
  }
  function showPop(html, opts = {}) {
    $('crPopBox').innerHTML = html; $('crPop').hidden = false; $('crPop').classList.toggle('small', !!opts.small);
    clearTimeout(showPop.t); if (opts.auto) showPop.t = setTimeout(hidePop, opts.auto);
    const b = $('crPopBox').querySelector('button'); if (b && !opts.small) setTimeout(() => b.focus(), 30);
  }
  function hidePop() { $('crPop').hidden = true; }
  $('crPop').addEventListener('click', e => { if (e.target === $('crPop') && $('crPop').classList.contains('small')) hidePop(); });
  const blockOptions = (sel, any) => (any ? '<option value="ANY"' + (sel === 'ANY' ? ' selected' : '') + '>any blocks</option>' : '') + BLOCK_ORDER.map(id => BLOCKS[id]).map(b => '<option value="' + b[1] + '"' + (b[1] === sel ? ' selected' : '') + '>' + esc(b[2]) + '</option>').join('');
  const swatches = (cur, name) => '<div class="cr-sw">' + M.NPC_COLOURS.concat(['#ffd166', '#7bd88f']).map(c => '<label style="--c:' + c + '"><input type="radio" name="' + name + '" value="' + c + '"' + (c === cur ? ' checked' : '') + '><span></span></label>').join('') + '</div>';
  const val = id => { const e = document.getElementById(id); return e ? e.value : ''; };
  const chk = id => { const e = document.getElementById(id); return !!(e && e.checked); };
  const radio = name => { const e = document.querySelector('.cr-modalbox input[name="' + name + '"]:checked'); return e ? e.value : ''; };
  function setMaker(m) { maker = m ? M.cleanMaker(m) : null; app.changed(); }
  function ensureMaker() { if (!maker) { maker = M.blankMaker(); } return maker; }

  // ── rules (who may do what in a made world) ──
  function rules() { return maker && !editing ? maker.rules : null; }
  function applyRules() {
    const r = rules(); app.applyRules(r);
    const prot = r && r.protect.length ? maker.zones.filter(z => r.protect.includes(z.id)) : [];
    world.guard = prot.length ? (x, y, z) => !prot.some(q => M.inZone(q, x, y, z)) : null;
    const code = r ? r.code : 'all';
    runner.setAllow(code === 'all' ? null : Object.assign(t => !(code === 'helper' ? /^cr_b_/ : code === 'builder' ? /^cr_h_/ : /^cr_/).test(t) || t === 'cr_on_run' || t === 'cr_on_chat' || t === 'cr_wait' || t === 'cr_forever' || t === 'cr_block',
      { why: code === 'helper' ? 'In this world only the robot helper can build — builder commands are switched off.' : code === 'builder' ? 'In this world the robot helper is switched off — use the builder commands.' : 'Code is switched off in this world.' }));
  }
  function canEdit(kind) { const r = rules(); return !r || (kind === 'break' ? r.break : r.build); }

  // ── playing a made world ──
  function lessonActive() { return !!maker && !editing && (maker.tasks.length > 0 || maker.npcs.length > 0 || !!maker.intro); }
  function renderLesson() {
    const on = lessonActive(); $('crLesson').hidden = !on; $('crTip').hidden = on || editing; $('crMkBar').hidden = !editing;
    $('crMakeBtn').hidden = editing || !!testing || compMode; $('crWorldsBtn').hidden = editing || !!testing || compMode;
    $('crMakeBtn').innerHTML = (maker && maker.lock ? IC.lock : IC.wand) + '<span>Make</span>';
    if (!on) return;
    $('crLTitle').textContent = maker.title;
    const done = checker ? checker.done : new Set();
    $('crLTasks').innerHTML = maker.tasks.map(t => '<li class="' + (done.has(t.id) ? 'ok' : '') + '"><i aria-hidden="true"></i><span>' + esc(t.text) + (t.hint && !done.has(t.id) ? '<small>' + esc(t.hint) + '</small>' : '') + '</span></li>').join('') || '<li class="note"><span>Explore and talk to the characters.</span></li>';
    $('crLStart').hidden = !(maker.challenge.on && !(chal && (chal.running || chal.over)));
    $('crLBack').hidden = !testing; $('crLTime').hidden = !(maker.challenge.on && chal);
    updateTime();
  }
  function updateTime() {
    if (!chal || !maker || !maker.challenge.on) return;
    const t = maker.challenge.time ? Math.max(0, maker.challenge.time - chal.elapsed) : chal.elapsed;
    $('crLTime').textContent = (maker.challenge.time ? 'Time left ' : 'Time ') + fmtTime(t); $('crLTime').classList.toggle('low', !!maker.challenge.time && t < 30);
  }
  $('crLFold').onclick = () => { $('crLesson').classList.toggle('min'); $('crLFold').textContent = $('crLesson').classList.contains('min') ? '+' : '–'; };
  function welcome() {
    if (!lessonActive()) return;
    const c = maker.challenge;
    showPop('<h3>' + esc(maker.title) + '</h3>' + (maker.intro ? '<p class="pre">' + esc(maker.intro) + '</p>' : '') +
      (maker.tasks.length ? '<ul class="cr-poptasks">' + maker.tasks.map(t => '<li>' + esc(t.text) + '</li>').join('') + '</ul>' : '') +
      (c.on ? '<p class="cr-chalnote">' + (c.time ? 'You have <b>' + fmtTime(c.time) + '</b>. ' : '') + (c.par ? 'Use <b>' + c.par + ' blocks or fewer</b> for 3 stars.' : '') + '</p>' : '') +
      '<div class="cr-popbtns"><button type="button" class="gold" id="crGo">' + (c.on ? 'Start the challenge' : 'Let’s go!') + '</button></div>');
    $('crGo').onclick = () => { hidePop(); if (c.on) startChallenge(); app.focus(); };
  }
  function startChallenge(fromRun) {
    if (!maker || !maker.challenge.on) return;
    if (!fromRun) restart(true);
    chal = { elapsed: 0, running: true, over: false }; runner.resetSteps(); renderLesson();
    app.log('The challenge has started — good luck!', 'sys');
  }
  $('crLStart').onclick = () => startChallenge();
  function finish() {
    finished = true;
    let extra = '';
    if (maker.challenge.on && chal) {
      chal.running = false; chal.over = true;
      const st = M.programStats(app.programState() || null), stars = M.stars(st.blocks, maker.challenge.par);
      const best = progress.best; if (!best || stars > best.stars || (stars === best.stars && chal.elapsed < best.time)) progress.best = { time: Math.round(chal.elapsed * 10) / 10, blocks: st.blocks, stars };
      extra = '<div class="cr-stars">' + [1, 2, 3].map(i => IC.star(i <= stars)).join('') + '</div><p class="cr-result"><b>' + fmtTime(chal.elapsed) + '</b> · ' + st.blocks + ' blocks · ' + runner.steps() + ' helper steps</p>' +
        (maker.challenge.par && stars < 3 ? '<p>Can you do it in ' + maker.challenge.par + ' blocks or fewer?</p>' : '');
      renderLesson();
    }
    showPop('<h3>' + (maker.challenge.on ? 'Challenge complete!' : 'You did it!') + '</h3><p>' + esc(maker.title) + ' — every task is done.</p>' + extra +
      '<div class="cr-popbtns"><button type="button" class="gold" id="crFinOk">Keep building</button><button type="button" id="crFinAgain">Start again</button></div>');
    $('crFinOk').onclick = () => { hidePop(); app.focus(); }; $('crFinAgain').onclick = () => { hidePop(); askRestart(); };
    app.changed();
  }
  function timeUp() {
    chal.running = false; chal.over = true; renderLesson();
    const n = maker.tasks.filter(t => checker.done.has(t.id)).length;
    showPop('<h3>Time’s up!</h3><p>You finished ' + n + ' of ' + maker.tasks.length + ' tasks.</p><div class="cr-popbtns"><button type="button" class="gold" id="crTuAgain">Try again</button><button type="button" id="crTuOk">Close</button></div>');
    $('crTuAgain').onclick = () => { hidePop(); startChallenge(); }; $('crTuOk').onclick = hidePop;
  }
  function restart(silent) {
    if (!maker) return;
    runner.stop();
    if (maker.startWorld) world.load(maker.startWorld);
    app.placeAt(maker.start, maker.helper);
    checker.reset(); talkedOnce.clear(); progress.done = []; finished = false; inZones = new Set(); chal = null;
    app.clearUndo(); renderLesson(); markers(); app.changed();
    if (!silent) app.log('Back to the start.', 'sys');
  }
  async function askRestart() { if (await app.confirm('Start this world again from the beginning? Everything built since will go.')) { restart(); if (maker.challenge.on) welcome(); } }
  $('crLRestart').onclick = askRestart;

  // characters
  function talkTo(n) {
    if (!n) return;
    const t = n.task && maker.tasks.find(q => q.id === n.task), doneLines = t && checker.done.has(t.id) && n.done.length;
    const ls = doneLines ? n.done : (n.lines.length ? n.lines : ['Hello!']);
    talking = { n, i: 0, ls };
    talkedOnce.add(n.id); checker.talk(n.id); showLine(); if (view()) view().setAttention(attention());
  }
  function showLine() {
    const T = talking; $('crTalk').hidden = false; $('crTalk').style.setProperty('--c', T.n.colour);
    $('crTalkN').textContent = T.n.name; $('crTalkT').textContent = T.ls[T.i];
    $('crTalkNext').textContent = T.i < T.ls.length - 1 ? 'Next' : 'Close'; setTimeout(() => $('crTalkNext').focus(), 20);
  }
  $('crTalkNext').onclick = () => { if (!talking) return; if (talking.i < talking.ls.length - 1) { talking.i++; showLine(); } else { talking = null; $('crTalk').hidden = true; app.focus(); } };
  function nearest() {
    if (!maker) return null; let best = null, bd = 9;
    for (const n of maker.npcs) { const d = (n.x + 0.5 - player.x) ** 2 + (n.z + 0.5 - player.z) ** 2 + (n.y - player.y) ** 2; if (d < bd) { bd = d; best = n; } }
    return best;
  }

  // ── Make mode ──
  function setTool(t) {
    tool = tool === t ? null : t; pendingCorner = null; moveNpc = null;
    $('crMkBar').querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === tool));
    hint(tool === 'npc' ? 'Click the ground where the character should stand.' : tool === 'zone' ? 'Click the first corner of the area on the ground.' : 'Pick a tool. Click a character to change it; areas are changed in Tasks › Areas.');
  }
  const hint = t => { $('crMkHint').textContent = t || ''; };
  $('crMkBar').querySelectorAll('[data-tool]').forEach(b => b.onclick = () => setTool(b.dataset.tool));
  async function enterMake() {
    if (maker && maker.lock) {
      const word = await app.prompt('This world is locked so pupils can’t change it. Type the unlock word:', '');
      if (word == null) return; if (fnv(word.trim().toLowerCase()) !== maker.lock) { app.toast('That’s not the unlock word.'); return; }
    }
    ensureMaker(); editing = true; chal = null; hidePop(); $('crTalk').hidden = true;
    if (maker.startWorld && lessonDirty()) { /* keep what's built: making happens on the world as it is */ }
    applyRules(); setTool(null); renderLesson(); markers();
    app.log('Make mode: put characters and areas in the world, add tasks, then press Test to try it as a pupil.', 'sys');
  }
  const lessonDirty = () => false;
  $('crMakeBtn').onclick = enterMake;
  function setStart(quiet) {
    ensureMaker(); const h = runner.helper;
    maker.start = { x: +player.x.toFixed(2), y: +player.y.toFixed(2), z: +player.z.toFixed(2), yaw: +player.yaw.toFixed(3) };
    maker.helper = { x: h.x, y: h.y, z: h.z, f: h.f }; maker.startWorld = world.save();
    markers(); app.changed(); if (!quiet) app.toast('Saved the start: pupils begin here, with the world just as it is now.');
  }
  $('crMkStart').onclick = () => setStart();
  function leaveMake() {
    if (!maker) { editing = false; return; }
    if (!maker.start || !maker.startWorld) setStart(true);
    editing = false; tool = null; testing = null;
    if (!maker.npcs.length && !maker.zones.length && !maker.tasks.length && !maker.intro.trim() && !maker.challenge.on) maker = null;
    if (maker) { checker = M.createChecker(maker); progress = { done: [], best: progress && progress.best }; }
    applyRules(); renderLesson(); markers(); app.changed();
  }
  $('crMkDone').onclick = () => { leaveMake(); if (maker) app.toast('Your world is ready. Save it, or give it to your class from Cloud.'); };
  $('crMkTest').onclick = () => {
    if (!maker.start || !maker.startWorld) setStart(true);
    testing = app.snapshot(); editing = false; tool = null; checker = M.createChecker(maker); progress = { done: [], best: null };
    restart(true); applyRules(); renderLesson(); markers(); welcome();
  };
  $('crLBack').onclick = () => {
    const s = testing; testing = null; editing = true; hidePop(); $('crTalk').hidden = true; chal = null;
    if (s) app.restore(s); applyRules(); renderLesson(); markers(); setTool(null);
  };

  // clicks in the world while making
  function onMakeClick(hit, px, py) {
    if (tool === 'npc' || moveNpc) {
      if (!hit) return true;
      const x = hit.x + hit.nx, y = hit.y + hit.ny, z = hit.z + hit.nz;
      if (moveNpc) { Object.assign(moveNpc, { x, y, z }); moveNpc = null; markers(); app.changed(); hint('Moved.'); return true; }
      ensureMaker(); if (maker.npcs.length >= 20) { app.toast('That’s the most characters a world can have (20).'); return true; }
      const f = (player.facing() + 2) % 4; // face the maker
      const n = { id: M.uid('n'), name: 'Guide ' + (maker.npcs.length + 1), x, y, z, f, colour: M.NPC_COLOURS[maker.npcs.length % M.NPC_COLOURS.length], lines: ['Hello! Welcome to my world.'], task: '', done: [] };
      maker.npcs.push(n); maker = M.cleanMaker(maker); markers(); app.changed(); setTool(null); editNpc(maker.npcs[maker.npcs.length - 1].id);
      return true;
    }
    if (tool === 'zone') {
      if (!hit) return true;
      const c = [hit.x + hit.nx, hit.y + hit.ny, hit.z + hit.nz];
      if (!pendingCorner) { pendingCorner = c; hint('Now click the opposite corner.'); return true; }
      ensureMaker(); if (maker.zones.length >= 30) { app.toast('That’s the most areas a world can have (30).'); setTool(null); return true; }
      const y0 = Math.min(pendingCorner[1], c[1]);
      const z = { id: M.uid('z'), name: 'Area ' + (maker.zones.length + 1), a: [pendingCorner[0], y0, pendingCorner[2]], b: [c[0], Math.max(y0 + 3, Math.max(pendingCorner[1], c[1])), c[2]], msg: '', show: true, colour: '#ffd166' };
      maker.zones.push(z); maker = M.cleanMaker(maker); markers(); app.changed(); setTool(null); editZone(z.id);
      return true;
    }
    const np = view() && view().pickNpc(px, py); if (np) { editNpc(np.id); return true; }
    return false;
  }

  // ── editors ──
  function editNpc(id) {
    const n = maker.npcs.find(q => q.id === id); if (!n) return;
    app.modal(`<h3>${IC.person} Character</h3>
      <label class="cr-f">Name <input id="mkNName" maxlength="24" value="${esc(n.name)}"></label>
      <div class="cr-f">Colour ${swatches(n.colour, 'mkNCol')}</div>
      <label class="cr-f">What they say — one line per speech bubble <textarea id="mkNLines" rows="4" maxlength="2900">${esc(n.lines.join('\n'))}</textarea></label>
      <label class="cr-f">Their task (optional) <select id="mkNTask"><option value="">— none —</option>${maker.tasks.map(t => '<option value="' + t.id + '"' + (t.id === n.task ? ' selected' : '') + '>' + esc(t.text) + '</option>').join('')}</select></label>
      <label class="cr-f">What they say once their task is done <textarea id="mkNDone" rows="2" maxlength="1500">${esc(n.done.join('\n'))}</textarea></label>
      <div class="cr-mbtns"><button type="button" class="gold" id="mkNSave">Save</button><button type="button" id="mkNMove">Move</button><button type="button" id="mkNTalkTask">Add a “talk to ${esc(n.name)}” task</button><button type="button" class="bad" id="mkNDel">Delete</button></div>`);
    const save = () => { Object.assign(n, { name: val('mkNName'), colour: radio('mkNCol') || n.colour, lines: val('mkNLines'), task: val('mkNTask'), done: val('mkNDone') }); maker = M.cleanMaker(maker); markers(); app.changed(); };
    $('mkNSave').onclick = () => { save(); app.closeModal(); };
    $('mkNMove').onclick = () => { save(); app.closeModal(); moveNpc = maker.npcs.find(q => q.id === id); hint('Click where ' + moveNpc.name + ' should stand.'); };
    $('mkNTalkTask').onclick = () => { save(); maker.tasks.push({ id: M.uid('t'), type: 'talk', npc: id }); maker = M.cleanMaker(maker); app.changed(); editNpc(id); app.toast('Task added.'); };
    $('mkNDel').onclick = () => { maker.npcs = maker.npcs.filter(q => q.id !== id); maker.tasks = maker.tasks.filter(t => t.npc !== id); maker = M.cleanMaker(maker); markers(); app.changed(); app.closeModal(); };
  }
  function editZone(id) {
    const z = maker.zones.find(q => q.id === id); if (!z) return; const b = M.box(z);
    app.modal(`<h3>${IC.area} Area</h3>
      <label class="cr-f">Name <input id="mkZName" maxlength="30" value="${esc(z.name)}"></label>
      <p class="cr-fnote">${b.x1 - b.x0 + 1} × ${b.z1 - b.z0 + 1} blocks across.</p>
      <label class="cr-f">How tall (blocks) <input id="mkZH" type="number" min="1" max="32" value="${b.y1 - b.y0 + 1}"></label>
      <label class="cr-f">Pop-up message when a pupil walks in (optional) <textarea id="mkZMsg" rows="2" maxlength="400">${esc(z.msg)}</textarea></label>
      <div class="cr-f">Colour ${swatches(z.colour, 'mkZCol')}</div>
      <label class="cr-chk"><input type="checkbox" id="mkZShow" ${z.show ? 'checked' : ''}> Pupils can see this area’s outline</label>
      <label class="cr-chk"><input type="checkbox" id="mkZProt" ${maker.rules.protect.includes(z.id) ? 'checked' : ''}> Protect it: nobody can change the blocks inside</label>
      <div class="cr-mbtns"><button type="button" class="gold" id="mkZSave">Save</button><button type="button" id="mkZMaze">Turn it into a maze</button><button type="button" class="bad" id="mkZDel">Delete</button></div>`);
    const save = () => {
      const h = Math.max(1, Math.min(32, Math.round(Number(val('mkZH')) || 1)));
      Object.assign(z, { name: val('mkZName'), msg: val('mkZMsg'), colour: radio('mkZCol') || z.colour, show: chk('mkZShow'), b: [z.b[0], b.y0 + h - 1, z.b[2]], a: [z.a[0], b.y0, z.a[2]] });
      maker.rules.protect = maker.rules.protect.filter(p => p !== id).concat(chk('mkZProt') ? [id] : []);
      maker = M.cleanMaker(maker); markers(); app.changed();
    };
    $('mkZSave').onclick = () => { save(); app.closeModal(); };
    $('mkZDel').onclick = () => { maker.zones = maker.zones.filter(q => q.id !== id); maker = M.cleanMaker(maker); markers(); app.changed(); app.closeModal(); };
    $('mkZMaze').onclick = async () => {
      save(); app.closeModal();
      if (!(await app.confirm('Build a hedge maze inside “' + z.name + '”? Whatever is in the area now will be replaced.'))) return;
      app.snapshotUndo();
      try {
        const zz = maker.zones.find(q => q.id === id), mz = M.makeMaze(world, { a: zz.a, b: [zz.b[0], zz.a[1] + 1, zz.b[2]] }, { seed: Math.floor(Math.random() * 1e6) });
        world.set(mz.goal[0], mz.goal[1] - 1, mz.goal[2], BY_NAME.GOLD);
        const gid = M.uid('z'); maker.zones.push({ id: gid, name: 'the goal', a: mz.goal, b: mz.goal, msg: '', show: true, colour: '#ffd166' });
        maker.tasks.push({ id: M.uid('t'), type: 'helper', zone: gid, text: 'Get the helper to the goal' });
        if (!maker.rules.protect.includes(id)) maker.rules.protect.push(id);
        maker.helper = { x: mz.start[0], y: mz.start[1], z: mz.start[2], f: 2 }; Object.assign(runner.helper, maker.helper, { from: null, t: 1 });
        maker.rules.code = 'helper'; maker.rules.build = false; maker.rules.break = false;
        maker = M.cleanMaker(maker); markers(); app.changed();
        app.toast('Maze made! The helper starts in one corner and the goal is gold. Set the start, then Test it.');
      } catch (e) { app.toast(e.message); }
    };
  }
  function editTasks() {
    ensureMaker();
    const row = (t, i) => '<li><span class="cr-tt">' + esc(t.text) + '<small>' + esc(M.TASK_TYPES[t.type].label) + '</small></span><span class="cr-tb"><button type="button" data-up="' + i + '" title="Move up"' + (i ? '' : ' disabled') + '>▲</button><button type="button" data-edit="' + t.id + '">Change</button><button type="button" class="bad" data-del="' + t.id + '">Delete</button></span></li>';
    app.modal(`<h3>${IC.tasks} Tasks</h3><p class="cr-fnote">Pupils see these as a checklist. Each one ticks itself off when it’s done.</p>
      <ol class="cr-tlist">${maker.tasks.map(row).join('') || '<li class="note">No tasks yet.</li>'}</ol>
      <div class="cr-mbtns"><select id="mkTType">${Object.entries(M.TASK_TYPES).map(([k, v]) => '<option value="' + k + '">' + esc(v.label) + '</option>').join('')}</select><button type="button" class="gold" id="mkTAdd">Add a task</button></div>
      <h4>Areas</h4><ul class="cr-tlist">${maker.zones.map(z => '<li><span class="cr-tt">' + esc(z.name) + '</span><span class="cr-tb"><button type="button" data-zone="' + z.id + '">Change</button></span></li>').join('') || '<li class="note">No areas yet — use the Area tool.</li>'}</ul>`);
    const body = $('crModalBody');
    body.querySelectorAll('[data-up]').forEach(b => b.onclick = () => { const i = +b.dataset.up; [maker.tasks[i - 1], maker.tasks[i]] = [maker.tasks[i], maker.tasks[i - 1]]; app.changed(); editTasks(); });
    body.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { maker.tasks = maker.tasks.filter(t => t.id !== b.dataset.del); maker = M.cleanMaker(maker); app.changed(); editTasks(); });
    body.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => editTask(maker.tasks.find(t => t.id === b.dataset.edit)));
    body.querySelectorAll('[data-zone]').forEach(b => b.onclick = () => editZone(b.dataset.zone));
    $('mkTAdd').onclick = () => editTask({ id: M.uid('t'), type: val('mkTType'), n: 5 }, true);
  }
  function editTask(t, isNew) {
    const needs = M.TASK_TYPES[t.type].needs;
    if (needs.includes('zone') && !maker.zones.length) { app.toast('Mark an area first, with the Area tool.'); return; }
    if (t.type === 'talk' && !maker.npcs.length) { app.toast('Put a character in the world first.'); return; }
    const f = [];
    if (needs.includes('zone')) f.push('<label class="cr-f">Area <select id="mkTZone">' + maker.zones.map(z => '<option value="' + z.id + '"' + (z.id === t.zone ? ' selected' : '') + '>' + esc(z.name) + '</option>').join('') + '</select></label>');
    if (t.type === 'talk') f.push('<label class="cr-f">Character <select id="mkTNpc">' + maker.npcs.map(n => '<option value="' + n.id + '"' + (n.id === t.npc ? ' selected' : '') + '>' + esc(n.name) + '</option>').join('') + '</select></label>');
    if (needs.includes('block')) f.push('<label class="cr-f">Block <select id="mkTBlock">' + blockOptions(t.block || (t.type === 'count' ? 'ANY' : 'PLANKS'), t.type === 'count') + '</select></label>');
    if (needs.includes('n')) f.push('<label class="cr-f">' + (t.type === 'tower' ? 'How tall' : 'How many') + ' <input id="mkTN" type="number" min="1" max="999" value="' + (t.n || 5) + '"></label>');
    if (t.type === 'chat') f.push('<label class="cr-f">The word <input id="mkTWord" maxlength="20" value="' + esc(t.word || 'go') + '"></label>');
    if (t.type === 'uses') f.push('<label class="cr-f">Must use <select id="mkTFeat">' + Object.entries(M.FEATURES).map(([k, v]) => '<option value="' + k + '"' + (k === t.feature ? ' selected' : '') + '>' + esc(v) + '</option>').join('') + '</select></label>');
    app.modal(`<h3>${IC.tasks} ${esc(M.TASK_TYPES[t.type].label)}</h3>${f.join('')}
      <label class="cr-f">What the checklist says (leave empty for an automatic sentence) <input id="mkTText" maxlength="160" value="${esc(isNew ? '' : t.text)}"></label>
      <label class="cr-f">A hint (optional) <input id="mkTHint" maxlength="240" value="${esc(t.hint || '')}"></label>
      <div class="cr-mbtns"><button type="button" class="gold" id="mkTSave">Save</button><button type="button" id="mkTBack">Back</button></div>`);
    $('mkTBack').onclick = editTasks;
    $('mkTSave').onclick = () => {
      const q = { id: t.id, type: t.type, zone: val('mkTZone') || t.zone, npc: val('mkTNpc') || t.npc, block: val('mkTBlock') || t.block, n: Number(val('mkTN')) || t.n, word: val('mkTWord') || t.word, feature: val('mkTFeat') || t.feature, text: val('mkTText'), hint: val('mkTHint') };
      if (!q.text.trim()) q.text = '';
      const i = maker.tasks.findIndex(x => x.id === t.id); if (i >= 0) maker.tasks[i] = q; else maker.tasks.push(q);
      maker = M.cleanMaker(maker); app.changed(); editTasks();
    };
  }
  function editSettings() {
    ensureMaker(); const r = maker.rules, c = maker.challenge, allowed = new Set(r.blocks || []);
    app.modal(`<h3>${IC.cog} Settings</h3>
      <label class="cr-f">Title <input id="mkSTitle" maxlength="60" value="${esc(maker.title)}"></label>
      <label class="cr-f">Welcome message (shown when a pupil opens the world) <textarea id="mkSIntro" rows="4" maxlength="1200">${esc(maker.intro)}</textarea></label>
      <h4>What pupils can do</h4>
      <label class="cr-chk"><input type="checkbox" id="mkSBuild" ${r.build ? 'checked' : ''}> Build by hand</label>
      <label class="cr-chk"><input type="checkbox" id="mkSBreak" ${r.break ? 'checked' : ''}> Break blocks by hand</label>
      <label class="cr-chk"><input type="checkbox" id="mkSFly" ${r.fly ? 'checked' : ''}> Fly</label>
      <label class="cr-chk"><input type="checkbox" id="mkSPy" ${r.python ? 'checked' : ''}> Use the Python tab</label>
      <label class="cr-f">Code <select id="mkSCode"><option value="all"${r.code === 'all' ? ' selected' : ''}>All the blocks</option><option value="helper"${r.code === 'helper' ? ' selected' : ''}>Robot helper only (no builder commands)</option><option value="builder"${r.code === 'builder' ? ' selected' : ''}>Builder commands only (no helper)</option><option value="none"${r.code === 'none' ? ' selected' : ''}>No code — building by hand only</option></select></label>
      <div class="cr-f">Blocks pupils can build with (none ticked = all of them)<div class="cr-bgrid">${BLOCK_ORDER.map(id => BLOCKS[id]).map(b => '<label><input type="checkbox" data-blk="' + b[0] + '"' + (allowed.has(b[0]) ? ' checked' : '') + '><span>' + esc(b[2]) + '</span></label>').join('')}</div></div>
      <h4>Coding challenge</h4>
      <label class="cr-chk"><input type="checkbox" id="mkSChal" ${c.on ? 'checked' : ''}> Make it a timed challenge (Start button, a clock, stars for short code)</label>
      <label class="cr-f">Time limit in minutes (0 = no limit, just a stopwatch) <input id="mkSTime" type="number" min="0" max="60" value="${Math.round(c.time / 60)}"></label>
      <label class="cr-f">3 stars for this many blocks or fewer (0 = always 3 stars) <input id="mkSPar" type="number" min="0" max="500" value="${c.par}"></label>
      <h4>Lock</h4>
      <label class="cr-f">Unlock word — set one so pupils can’t open Make mode (leave empty for no lock) <input id="mkSLock" maxlength="30" placeholder="${maker.lock ? 'locked — type a new word, or clear it with “unlock”' : 'e.g. bananas'}"></label>
      <div class="cr-mbtns"><button type="button" class="gold" id="mkSSave">Save</button><button type="button" id="mkSFlat">New flat world</button></div>`);
    $('mkSSave').onclick = () => {
      const blks = [...document.querySelectorAll('.cr-bgrid input:checked')].map(i => +i.dataset.blk);
      const lw = val('mkSLock').trim().toLowerCase();
      Object.assign(maker, { title: val('mkSTitle'), intro: val('mkSIntro'),
        rules: { build: chk('mkSBuild'), break: chk('mkSBreak'), fly: chk('mkSFly'), python: chk('mkSPy'), code: val('mkSCode'), blocks: blks.length ? blks : null, protect: r.protect },
        challenge: { on: chk('mkSChal'), time: Math.round(Number(val('mkSTime')) || 0) * 60, par: Math.round(Number(val('mkSPar')) || 0) } });
      if (lw === 'unlock') maker.lock = ''; else if (lw) maker.lock = fnv(lw);
      maker = M.cleanMaker(maker); app.changed(); app.closeModal(); app.toast(lw && lw !== 'unlock' ? 'Saved. The unlock word is “' + lw + '” — write it down!' : 'Saved.');
    };
    $('mkSFlat').onclick = async () => { if (!(await app.confirm('Clear the world to flat grass? Characters and areas stay.'))) return; app.snapshotUndo(); world.reset('flat'); app.closeModal(); };
  }
  $('crMkTasks').onclick = editTasks; $('crMkSet').onclick = editSettings;

  // ── ready-made worlds ──
  function gallery() {
    app.modal(`<h3>${IC.globe} Worlds</h3><p class="cr-fnote">Open a ready-made world to try it, or use one as the start of your own (open it, then press Make).</p>
      <div class="cr-wgrid">${M.EXAMPLES.map(e => '<button type="button" class="cr-wcard" data-ex="' + e.id + '"><b>' + esc(e.title) + '</b><small>' + esc(e.kind) + '</small><span>' + esc(e.text) + '</span></button>').join('')}
      <button type="button" class="cr-wcard" data-ex="flat"><b>A blank flat world</b><small>Make your own</small><span>Just grass, ready for your own lesson, challenge or competition arena.</span></button>
      <button type="button" class="cr-wcard" data-ex="starter"><b>The starter world</b><small>Free building</small><span>The pond, the trees and the example program.</span></button></div>`);
    $('crModalBody').querySelectorAll('[data-ex]').forEach(b => b.onclick = async () => {
      if (!(await app.confirm('Open this world? What you have now will be replaced (save it first if you want to keep it).'))) return;
      app.closeModal(); const id = b.dataset.ex;
      if (id === 'starter') { app.openProject({}); return; }
      if (id === 'flat') { app.openProject({}); world.reset('flat'); enterMake(); return; }
      app.openProject(M.exampleProject(id));
    });
  }
  $('crWorldsBtn').onclick = gallery;

  // ── hooks for craft-app.js ──
  return {
    load(m, p, opts) {
      editing = false; testing = null; tool = null; chal = null; talking = null; finished = false; inZones = new Set(); talkedOnce.clear();
      $('crTalk').hidden = true; hidePop();
      maker = M.cleanMaker(m); progress = M.cleanProgress(p, maker) || { done: [], best: null };
      compMode = !!(opts && opts.comp); if (maker && compMode) { maker.challenge.on = false; maker.intro = ''; } // in a competition the organiser runs the clock
      checker = maker ? M.createChecker(maker) : null; if (checker) { checker.restore(progress.done); finished = checker.complete(); }
      applyRules(); renderLesson(); markers();
      if (lessonActive() && !finished && !(opts && opts.comp)) setTimeout(welcome, 50);
    },
    liveSet(m) { // a live partner changed the World Maker setup: take theirs, keep our own ticks and where we are
      maker = M.cleanMaker(m); const done = checker ? [...checker.done] : [];
      checker = maker ? M.createChecker(maker) : null; if (checker) checker.restore(done.filter(id => maker.tasks.some(t => t.id === id)));
      applyRules(); renderLesson(); markers();
    },
    save() { return { maker: maker ? Object.assign({}, maker) : null, progress: maker ? { done: checker ? [...checker.done] : [], best: progress.best } : null }; },
    viewReady() { markers(); applyRules(); },
    editing: () => editing, active: lessonActive, canEdit,
    click(hit, px, py) {
      if (editing) return onMakeClick(hit, px, py);
      if (maker && view()) { const np = view().pickNpc(px, py); if (np && np.dist < 9) { talkTo(maker.npcs.find(n => n.id === np.id)); return true; } }
      return false;
    },
    key(e) {
      if (e.code === 'Escape') { if (!$('crTalk').hidden) { $('crTalk').hidden = true; talking = null; return true; } if (!$('crPop').hidden) { hidePop(); return true; } if (tool) { setTool(null); return true; } }
      if (e.code === 'KeyE' && !editing && nearNpc) { talkTo(nearNpc); return true; }
      return false;
    },
    onChat(word) { if (checker) checker.chat(word); },
    onRun() { if (maker && maker.challenge.on && !editing && !(chal && (chal.running || chal.over))) startChallenge(true); },
    tick(dt) {
      if (!maker) return;
      if (chal && chal.running) { chal.elapsed += dt; updateTime(); if (maker.challenge.time && chal.elapsed >= maker.challenge.time) timeUp(); }
      if (editing) return;
      // the nearest character
      const n = nearest(); if (n !== nearNpc) { nearNpc = n; $('crNear').hidden = !n || !$('crTalk').hidden; if (n) $('crNear').innerHTML = '<kbd>E</kbd> or click to talk to <b>' + esc(n.name) + '</b>'; }
      if (!$('crTalk').hidden) $('crNear').hidden = true;
      if ((checkT += dt) < 0.25) return; checkT = 0;
      // areas with a pop-up
      const px = Math.floor(player.x), py = Math.floor(player.y), pz = Math.floor(player.z), now = new Set();
      for (const z of maker.zones) if (M.inZone(z, px, py, pz) || M.inZone(z, px, py + 1, pz)) { now.add(z.id); if (!inZones.has(z.id) && z.msg) showPop('<p><b>' + esc(z.name) + '</b><br>' + esc(z.msg) + '</p>', { small: true, auto: 5000 }); }
      inZones = now;
      if (chal && chal.over) return;
      if (maker.challenge.on && !(chal && chal.running)) return; // a challenge only counts once it has started
      const fresh = checker.check({ world, player, helper: runner.helper, program: app.programState(true) });
      if (fresh.length) {
        for (const id of fresh) { const t = maker.tasks.find(q => q.id === id); app.log('✓ ' + t.text, 'ok'); }
        progress.done = [...checker.done]; renderLesson(); if (view()) view().setAttention(attention()); app.changed();
        if (!finished && checker.complete()) finish();
      }
    },
    _maker: () => maker, _checker: () => checker, _chal: () => chal, _enter: enterMake, _leave: leaveMake, _setTool: setTool, _test: () => $('crMkTest').click(), _talk: id => talkTo(maker.npcs.find(n => n.id === id))
  };
}
