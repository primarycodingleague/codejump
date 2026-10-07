/* CodeJump · Build Lab — competitions (needs the CodeJump cloud, worker v17+).
 * An organiser (teacher) sets one up and shares the 6-character code; teachers from any school enter teams and pick pupils from
 * their own classes; each team builds (or codes) together live in its own room for a set time; then judging (scorecards, a pupil
 * vote, automatic checks — whichever the organiser chose, mixed by their weights) and the results board.
 * craft-app.js creates this with createComp(app) and calls its hooks. The cloud object comes from the host (build-and-play.html).
 */
import * as M from './craft-maker.js';
import { createWorld, GROUND } from './craft-world.js';
import { createRunner } from './craft-runner.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const svg = p => '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' + p + '</svg>';
const TROPHY = svg('<path d="M7 4h10v4a5 5 0 01-10 0z" fill="#ffc23c"/><path d="M7 6H4a3 3 0 003 4M17 6h3a3 3 0 01-3 4" stroke="#ffc23c" stroke-width="1.8" fill="none"/><path d="M10 13h4v3h-4zM8 19h8v2H8z" fill="#c8973f"/>');
const PHASES = [['lobby', 'Getting ready'], ['building', 'Building'], ['judging', 'Judging'], ['results', 'Results']];
const fmt = ms => { const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

export function createComp(app) {
  const { $, world, player, runner } = app;
  const cloud = () => app.cloud();
  let room = null;      // {code, teamId, teamName, ws, ro, kind, phase, endsAt, skew, seq, members, pending:[], flushT, posT, lastCode}
  let look = null;      // {code, teamId, teamName} — looking at another team's build (judging / voting)
  let current = null;   // the last competition opened in the panel (info)

  // ── the banner over the world while in a competition ──
  $('crView').insertAdjacentHTML('beforeend', '<div class="cr-comp" id="crComp" hidden><span class="cr-cteam" id="crCTeam"></span><span class="cr-cphase" id="crCPhase"></span><span class="cr-cwho" id="crCWho"></span><button type="button" id="crCVote" hidden></button><button type="button" id="crCPanel">Competition</button><button type="button" id="crCLeave">Leave</button></div>');
  $('crMkBtns').insertAdjacentHTML('beforeend', '<button type="button" id="crCompBtn" title="Build competitions and coding contests — with other classes and schools">' + TROPHY + '<span>Compete</span></button>');
  $('crCompBtn').onclick = () => panel();
  $('crCPanel').onclick = () => (room || look) && openComp((room || look).code);
  $('crCLeave').onclick = () => { leave(); app.toast('You’ve left the competition room.'); };

  const api = (path, body) => cloud().api(path, body);
  const now = () => Date.now() + (room ? room.skew : 0);
  function banner() {
    const on = !!(room || look); $('crComp').hidden = !on; if (!on) return; $('crTip').classList.add('gone'); // the key-hint pill would sit under the banner
    if (look) { $('crCTeam').textContent = 'Looking at ' + look.teamName; $('crCPhase').textContent = ''; $('crCWho').textContent = ''; $('crCVote').hidden = !look.canVote; $('crCVote').textContent = look.voted ? 'You voted for ' + look.teamName : 'Vote for ' + look.teamName; $('crCLeave').textContent = 'Back'; return; }
    $('crCLeave').textContent = 'Leave'; $('crCVote').hidden = true;
    $('crCTeam').textContent = (room.ro ? 'Watching ' : '') + room.teamName;
    const ph = room.phase, left = room.endsAt - now();
    $('crCPhase').textContent = ph === 'building' ? (left > 0 ? (room.kind === 'code' ? 'Coding · ' : 'Building · ') + fmt(left) + ' left' : 'Time’s up!') : ph === 'lobby' ? 'Waiting for the start' : ph === 'judging' ? 'Judging — building is closed' : 'Results are in!';
    $('crCPhase').className = 'cr-cphase ' + ph + (ph === 'building' && left > 0 && left < 60000 ? ' low' : '');
    $('crCWho').textContent = room.members.filter(m => !m.ro).map(m => m.name).join(' · ');
  }
  const canBuild = () => !!room && !room.ro && room.kind === 'build' && room.phase === 'building' && now() <= room.endsAt;
  const canCode = () => !!room && !room.ro && room.kind === 'code' && (room.phase === 'lobby' || (room.phase === 'building' && now() <= room.endsAt));

  // ── the live team room ──
  async function join(code, teamId, teamName, ro) {
    leave(true);
    const c = cloud(); if (!c) return;
    let map; try { map = (await api('/comp/map', { code })).map; } catch (e) { app.toast(e.message); return; }
    app.openProject(map || {}, { comp: true });
    room = { code, teamId, teamName, ro: !!ro, kind: 'build', phase: 'lobby', endsAt: 0, skew: 0, seq: 0, members: [], pending: [], ready: false };
    // build contests: changes only in the build time (they go to the team); coding contests: your own runs change only your screen
    world.guards.comp = () => !room || (room.ready && !room.ro && (room.kind === 'code' || canBuild()));
    let ws; try { ws = new WebSocket(c.ws('/comproom/' + encodeURIComponent(code) + '/' + encodeURIComponent(teamId))); } catch (e) { app.toast('Couldn’t connect to the team room.'); leave(true); return; }
    room.ws = ws; const me = room;
    ws.onmessage = ev => { if (room !== me) return; let msg; try { msg = JSON.parse(ev.data); } catch (e) { return; } onMsg(msg); };
    ws.onclose = () => { if (room !== me) return; app.toast('The team room closed. Open the competition to join again.'); leave(true); };
    room.posT = setInterval(sendPos, 400); room.flushT = setInterval(flush, 120);
    banner(); app.log('Joining ' + teamName + '…', 'sys');
  }
  function onMsg(msg) {
    if (msg.type === 'init') {
      room.skew = (msg.now || Date.now()) - Date.now(); room.kind = msg.kind || 'build'; room.phase = msg.phase; room.endsAt = msg.endsAt; room.ro = !!msg.you.ro; room.me = msg.you;
      room.members = msg.members || [];
      world.remote = true; try { if (msg.doc && msg.doc.world) world.load(msg.doc.world); applyLog(msg.log || []); room.seq = Math.max(msg.doc ? msg.doc.seq || 0 : 0, room.seq); } finally { world.remote = false; }
      if (room.kind === 'code' && msg.doc && msg.doc.code) { room.lastCode = msg.doc.code.t; app.loadProgram(msg.doc.code.blocks); }
      room.ready = true; app.compRules(room); mates(); banner();
      app.log(room.ro ? 'You are watching ' + room.teamName + '.' : 'You’re in ' + room.teamName + '! ' + (room.phase === 'building' ? 'Go!' : 'Building opens when the organiser starts.'), 'ok');
    } else if (msg.type === 'sets') {
      world.remote = true; try { for (const s of msg.sets) world.set(s[0], s[1], s[2], s[3]); } finally { world.remote = false; }
      room.seq = Math.max(room.seq, msg.seq);
    } else if (msg.type === 'phase') {
      room.skew = (msg.now || Date.now()) - Date.now(); const was = room.phase; room.phase = msg.phase; room.endsAt = msg.endsAt; app.compRules(room); banner();
      if (msg.phase === 'building' && was !== 'building') app.toast((room.kind === 'code' ? 'Coding' : 'Building') + ' has started — ' + fmt(room.endsAt - now()) + ' on the clock!');
      if (msg.phase === 'judging') { app.toast('Time’s up! Building has closed and judging has started.'); runner.stop(); }
      if (msg.phase === 'results') app.toast('The results are in! Press Competition to see them.');
    } else if (msg.type === 'need-snapshot') {
      try { room.ws.send(JSON.stringify({ type: 'snapshot', world: world.save(), seq: room.seq })); } catch (e) { /* closed */ }
    } else if (msg.type === 'code') {
      if (!msg.code || (room.lastCode && msg.code.t < room.lastCode)) return; room.lastCode = msg.code.t;
      if (app.busyEditing()) { room.codeLater = msg.code; return; }
      app.loadProgram(msg.code.blocks); app.log((msg.code.by || 'A teammate') + ' changed the code.', 'sys');
    } else if (msg.type === 'join') { room.members = room.members.filter(m => m.uid !== msg.member.uid).concat(msg.member); banner(); if (!msg.member.ro) app.log(msg.member.name + ' joined the team room.', 'sys'); }
    else if (msg.type === 'leave') { room.members = room.members.filter(m => m.uid !== msg.uid); banner(); mates(); }
    else if (msg.type === 'pos') { const m = room.members.find(q => q.uid === msg.uid); if (m) { m.pos = msg.p; mates(); } }
    else if (msg.type === 'denied') app.status(msg.why || 'Building is closed now.', 'bad');
    else if (msg.type === 'full') app.toast('That team room is full.');
  }
  function applyLog(log) { for (const op of log) { for (const s of op.sets) world.set(s[0], s[1], s[2], s[3]); room.seq = Math.max(room.seq, op.seq); } }
  function mates() { const v = app.view(); if (!v || !room) return; v.setMates(room.members.filter(m => m.uid !== (room.me && room.me.uid) && m.pos && !m.ro).map(m => ({ uid: m.uid, name: m.name, color: m.color, x: m.pos.x, y: m.pos.y, z: m.pos.z, yaw: m.pos.yaw }))); }
  function sendPos() { if (!room || !room.ws || room.ws.readyState !== 1 || room.ro) return; const p = { x: +player.x.toFixed(2), y: +player.y.toFixed(2), z: +player.z.toFixed(2), yaw: +player.yaw.toFixed(2) }; const k = JSON.stringify(p); if (k === room.lastPos) return; room.lastPos = k; room.ws.send(JSON.stringify({ type: 'pos', p })); }
  function flush() {
    if (!room) return; banner();
    if (room.codeLater && !app.busyEditing()) { app.loadProgram(room.codeLater.blocks); room.codeLater = null; }
    if (!room.pending.length || !room.ws || room.ws.readyState !== 1) return;
    while (room.pending.length) room.ws.send(JSON.stringify({ type: 'sets', sets: room.pending.splice(0, 2000) }));
  }
  // every change made on this screen (by hand or by code) goes to the team
  world.onChange((x, y, z, id, old, remote) => { if (room && room.ready && !remote && x >= 0 && !room.ro && room.kind === 'build') room.pending.push([x, y, z, id]); });
  function codeChanged(blocks) { if (!room || !canCode() || !room.ws || room.ws.readyState !== 1) return; room.lastCode = Date.now(); room.ws.send(JSON.stringify({ type: 'code', blocks, t: room.lastCode })); }
  function leave(quiet) {
    if (room) { clearInterval(room.posT); clearInterval(room.flushT); flush(); const w = room.ws; room = null; try { w && w.close(); } catch (e) { /* gone */ } }
    look = null; delete world.guards.comp; const v = app.view(); if (v) v.setMates([]); app.compRules(null); banner();
    if (!quiet) app.status('');
  }

  // ── looking at another team's build (judging, voting) ──
  async function lookAt(code, team, canVote, voted) {
    let snap, map; try { snap = await api('/comp/snapshot', { code, teamId: team.id }); map = (await api('/comp/map', { code })).map; } catch (e) { app.toast(e.message); return; }
    leave(true); app.openProject(map || {}, { comp: true });
    world.remote = true; try { if (snap.doc && snap.doc.world) world.load(snap.doc.world); for (const op of snap.log || []) for (const s of op.sets) world.set(s[0], s[1], s[2], s[3]); } finally { world.remote = false; }
    if (snap.doc && snap.doc.code) app.loadProgram(snap.doc.code.blocks);
    look = { code, teamId: team.id, teamName: team.name, canVote, voted }; world.guards.comp = () => false; app.compRules({ ro: true, kind: 'build', phase: 'judging' }); banner();
    app.closeModal(); app.toast('This is ' + team.name + '’s ' + (snap.doc && snap.doc.code ? 'code and world' : 'build') + '. Walk round it — you can’t change it.');
  }
  $('crCVote').onclick = async () => { if (!look || look.voted) return; try { await api('/comp/vote', { code: look.code, teamId: look.teamId }); look.voted = true; banner(); app.toast('Thanks — your vote is in!'); } catch (e) { app.toast(e.message); } };

  // ── the competitions panel ──
  async function panel() {
    const c = cloud();
    if (!c || !c.me()) { app.modal('<h3>' + TROPHY + ' Competitions</h3><p>Competitions run through the CodeJump cloud, so teams in different classes and schools can build at the same time. Sign in to take part.</p><div class="cr-mbtns"><button type="button" class="gold" id="cpSign">Sign in</button></div>'); $('cpSign').onclick = () => { app.closeModal(); c && c.signIn(); }; return; }
    const me = c.me();
    app.modal('<h3>' + TROPHY + ' Competitions</h3><p class="cr-fnote">Loading…</p>');
    let mine = []; try { mine = (await api('/comp/mine', {})).comps; } catch (e) { app.modal('<h3>' + TROPHY + ' Competitions</h3><p>' + esc(e.message) + '</p>'); return; }
    const row = x => '<li><span class="cr-tt">' + esc(x.title) + '<small>' + esc(x.code) + ' · ' + (x.kind === 'code' ? 'coding' : 'building') + ' · ' + esc(phaseName(x.phase)) + ' · you are the ' + esc(x.role) + '</small></span><span class="cr-tb"><button type="button" data-open="' + esc(x.code) + '">Open</button></span></li>';
    app.modal('<h3>' + TROPHY + ' Competitions</h3>' +
      (me.teacher ? '<p class="cr-fnote">Set up a competition and share its code with other teachers — or enter your class’s team in someone else’s with their code.</p><div class="cr-mbtns"><button type="button" class="gold" id="cpNew">Set up a competition</button></div>' +
        '<label class="cr-f">Enter a team with a competition code <span class="cr-row"><input id="cpCode" maxlength="6" placeholder="e.g. K7M2QX" style="text-transform:uppercase"><button type="button" id="cpGo">Open</button></span></label>'
        : '<p class="cr-fnote">Your teacher puts you in a team. Your competitions appear here.</p>') +
      '<h4>My competitions</h4><ul class="cr-tlist">' + (mine.map(row).join('') || '<li class="note">None yet.</li>') + '</ul>');
    if (me.teacher) { $('cpNew').onclick = setup; $('cpGo').onclick = () => { const v = $('cpCode').value.trim().toUpperCase(); if (v) openComp(v); }; $('cpCode').onkeydown = e => { if (e.key === 'Enter') $('cpGo').click(); }; }
    $('crModalBody').querySelectorAll('[data-open]').forEach(b => b.onclick = () => openComp(b.dataset.open));
  }
  const phaseName = p => (PHASES.find(x => x[0] === p) || ['', p])[1];

  // organiser: set up a competition
  function setup() {
    const crit = [['Creativity', 10], ['Fits the brief', 10], ['Detail and teamwork', 10]];
    app.modal(`<h3>${TROPHY} Set up a competition</h3>
      <label class="cr-f">Title <input id="csTitle" maxlength="60" value="Castle build-off"></label>
      <label class="cr-f">The brief — what should teams make? <textarea id="csBrief" rows="2" maxlength="600">Build a castle with towers, a gate and a flag.</textarea></label>
      <label class="cr-f">Type <select id="csKind"><option value="build">Build competition — teams build together live</option><option value="code">Coding contest — teams write one program together</option></select></label>
      <label class="cr-f">Map <select id="csMap"><option value="arena">Ready-made build arena (a marked plot)</option><option value="flat">A blank flat world</option><option value="maze">Maze run (for coding contests)</option><option value="current">The world open now — with its tasks for automatic checks</option></select></label>
      <div class="cr-grid2"><label class="cr-f">Most teams <input id="csTeams" type="number" min="2" max="12" value="6"></label><label class="cr-f">Pupils per team <input id="csSize" type="number" min="1" max="6" value="6"></label>
      <label class="cr-f">Teams per school <input id="csPer" type="number" min="1" max="12" value="2"></label><label class="cr-f">Minutes to build <input id="csMin" type="number" min="1" max="180" value="30"></label></div>
      <h4>What the judges look for</h4><div id="csCrit">${crit.map(c => critRow(c[0], c[1])).join('')}</div><div class="cr-mbtns"><button type="button" id="csAddCrit">Add a criterion</button></div>
      <h4>How it’s judged (mix any of them)</h4>
      <label class="cr-chk"><input type="checkbox" id="csJ" checked> Judges’ scorecards (you, and any teachers you add) <input type="number" id="csJW" min="0" max="100" value="60" class="cr-w"> %</label>
      <label class="cr-chk"><input type="checkbox" id="csV"> Pupil vote (pupils tour the other builds and vote, not for their own team) <input type="number" id="csVW" min="0" max="100" value="20" class="cr-w"> %</label>
      <label class="cr-chk"><input type="checkbox" id="csA"> Automatic checks (the map’s tasks; for coding, the code is run on the map) <input type="number" id="csAW" min="0" max="100" value="20" class="cr-w"> %</label>
      <div class="cr-mbtns"><button type="button" class="gold" id="csMake">Make the competition</button><button type="button" id="csBack">Back</button></div>`);
    $('csAddCrit').onclick = () => { if ($('csCrit').children.length < 8) $('csCrit').insertAdjacentHTML('beforeend', critRow('', 10)); };
    $('csCrit').onclick = e => { if (e.target.dataset.rm != null) e.target.closest('.cr-crit').remove(); };
    $('csKind').onchange = () => { if ($('csKind').value === 'code') { $('csMap').value = 'maze'; $('csA').checked = true; } };
    $('csBack').onclick = panel;
    $('csMake').onclick = async () => {
      const mapKind = $('csMap').value;
      const map = mapKind === 'current' ? app.currentProject() : mapKind === 'flat' ? Object.assign(M.exampleProject('arena'), { maker: null, world: (() => { const w = createWorld(); w.reset('flat'); return w.save(); })() }) : M.exampleProject(mapKind === 'maze' ? 'maze' : 'arena');
      const criteria = [...document.querySelectorAll('.cr-crit')].map(r => ({ text: r.querySelector('input[type=text]').value, points: +r.querySelector('input[type=number]').value })).filter(x => x.text.trim());
      const body = { title: $('csTitle').value, brief: $('csBrief').value, kind: $('csKind').value, map, maxTeams: +$('csTeams').value, teamSize: +$('csSize').value, perSchool: +$('csPer').value, minutes: +$('csMin').value, criteria,
        judging: { judges: $('csJ').checked, vote: $('csV').checked, auto: $('csA').checked, weights: { judges: +$('csJW').value, vote: +$('csVW').value, auto: +$('csAW').value } } };
      try { const r = await api('/comp/create', body); openComp(r.code, true); } catch (e) { app.toast(e.message); }
    };
  }
  const critRow = (t, p) => '<div class="cr-crit"><input type="text" maxlength="80" value="' + esc(t) + '" placeholder="e.g. Use of colour"><input type="number" min="1" max="100" value="' + p + '" title="Points"><span>pts</span><button type="button" data-rm>×</button></div>';

  // one competition: what you see depends on your role
  async function openComp(code, fresh) {
    let c; try { c = await api('/comp/info', { code }); } catch (e) { app.toast(e.message); return; }
    current = c; const me = cloud().me(), staff = c.role === 'organiser' || c.role === 'judge';
    const steps = '<ol class="cr-steps">' + PHASES.map(([k, n]) => '<li class="' + (k === c.phase ? 'on' : PHASES.findIndex(x => x[0] === k) < PHASES.findIndex(x => x[0] === c.phase) ? 'done' : '') + '">' + n + '</li>').join('') + '</ol>';
    const timer = c.phase === 'building' ? '<p class="cr-big">' + (c.endsAt > c.now ? fmt(c.endsAt - c.now) + ' left' : 'Time’s up') + '</p>' : '';
    const how = ['judges', 'vote', 'auto'].filter(k => c.judging[k]).map(k => ({ judges: 'judges’ scorecards', vote: 'a pupil vote', auto: 'automatic checks' }[k] + ' (' + c.judging.weights[k] + '%)')).join(' + ');
    let html = '<h3>' + TROPHY + ' ' + esc(c.title) + '</h3>' + (fresh ? '<div class="cr-codebox">Share this code with other teachers:<b>' + esc(c.code) + '</b></div>' : '<p class="cr-fnote">Code <b>' + esc(c.code) + '</b> · organised by ' + esc(c.organiser) + ' · ' + (c.kind === 'code' ? 'coding contest' : 'build competition') + '</p>') +
      steps + timer + (c.brief ? '<p class="cr-brief">' + esc(c.brief) + '</p>' : '') +
      '<p class="cr-fnote">Up to ' + c.maxTeams + ' teams of ' + c.teamSize + ' · ' + c.minutes + ' minutes · judged by ' + esc(how) + '. Criteria: ' + c.criteria.map(x => esc(x.text) + ' (' + x.points + ')').join(', ') + '.</p>';
    // results
    if (c.results && (c.phase === 'results' || c.role === 'organiser')) html += '<h4>' + (c.phase === 'results' ? 'Results' : 'Standings so far (only you can see these)') + '</h4><ol class="cr-board">' + c.results.map(r => '<li class="p' + r.place + '"><b>' + r.place + '</b><span>' + esc(r.name) + (r.school ? '<small>' + esc(r.school) + '</small>' : '') + '</span><em>' + r.score + '</em></li>').join('') + '</ol>';
    // teams
    html += '<h4>Teams (' + c.teams.length + ' of ' + c.maxTeams + ')</h4><ul class="cr-tlist">' + (c.teams.map(t => {
      const btns = [];
      if (t.mine || t.myTeam) btns.push('<button type="button" class="gold" data-join="' + t.id + '">' + (c.phase === 'building' ? 'Go to the team room' : 'Team room') + '</button>');
      if (t.mine && c.phase !== 'results') btns.push('<button type="button" data-pick="' + t.id + '">Pupils</button>');
      if (staff && !t.mine) btns.push('<button type="button" data-watch="' + t.id + '">Watch</button>');
      if ((c.phase === 'judging' || c.phase === 'results') && !t.myTeam && !t.mine) btns.push('<button type="button" data-look="' + t.id + '">Look' + (c.judging.vote && c.phase === 'judging' && c.role === 'pupil' ? (c.myVote === t.id ? ' (your vote)' : ' & vote') : '') + '</button>');
      if (staff && c.judging.judges && c.phase === 'judging') btns.push('<button type="button" data-score="' + t.id + '">' + (c.myScores && c.myScores[t.id] ? 'Scored ✓' : 'Score') + '</button>');
      return '<li><span class="cr-tt">' + esc(t.name) + (t.myTeam ? ' (your team)' : '') + '<small>' + esc(t.school || '') + (t.school ? ' · ' : '') + esc(t.teacherName) + ' · ' + t.size + ' pupil' + (t.size === 1 ? '' : 's') + (t.members ? ': ' + t.members.map(esc).join(', ') : '') + (t.auto != null ? ' · auto ' + t.auto + '%' : '') + '</small></span><span class="cr-tb">' + btns.join('') + '</span></li>';
    }).join('') || '<li class="note">No teams yet.</li>') + '</ul>';
    const btns = [];
    if (me.teacher && c.phase === 'lobby' && c.teams.filter(t => t.mine).length < c.perSchool && c.teams.length < c.maxTeams) btns.push('<button type="button" class="gold" id="cpEnter">Enter a team</button>');
    if (c.role === 'organiser') {
      if (c.phase === 'lobby') btns.push('<button type="button" class="gold" id="cpStart">Start ' + (c.kind === 'code' ? 'coding' : 'building') + ' (' + c.minutes + ' min)</button>');
      if (c.phase === 'building') btns.push('<button type="button" id="cpJudge">End and start judging</button>');
      if (c.phase === 'judging' && c.judging.auto) btns.push('<button type="button" id="cpAuto">Run the automatic checks</button>');
      if (c.phase === 'judging') btns.push('<button type="button" class="gold" id="cpResults">Show the results</button>');
      if (c.phase === 'results') btns.push('<button type="button" id="cpReopen">Back to judging</button>');
      btns.push('<button type="button" id="cpJudges">Add a judge</button><button type="button" class="bad" id="cpDel">Delete</button>');
    }
    btns.push('<button type="button" id="cpBack">All competitions</button><button type="button" id="cpRefresh">Refresh</button>');
    html += '<div class="cr-mbtns">' + btns.join('') + '</div>' + (c.judges && c.judges.length ? '<p class="cr-fnote">Judges: ' + c.judges.map(esc).join(', ') + (c.votesCast != null && c.judging.vote ? ' · ' + c.votesCast + ' pupil votes so far' : '') + '</p>' : '');
    app.modal(html);
    const B = $('crModalBody'), on = (id, fn) => { const e = document.getElementById(id); if (e) e.onclick = fn; };
    B.querySelectorAll('[data-join]').forEach(b => b.onclick = () => { const t = c.teams.find(x => x.id === b.dataset.join); app.closeModal(); join(c.code, t.id, t.name, false); });
    B.querySelectorAll('[data-watch]').forEach(b => b.onclick = () => { const t = c.teams.find(x => x.id === b.dataset.watch); app.closeModal(); join(c.code, t.id, t.name, true); });
    B.querySelectorAll('[data-look]').forEach(b => b.onclick = () => { const t = c.teams.find(x => x.id === b.dataset.look); lookAt(c.code, t, c.judging.vote && c.phase === 'judging' && c.role === 'pupil', c.myVote === t.id); });
    B.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => pickPupils(c, c.teams.find(x => x.id === b.dataset.pick)));
    B.querySelectorAll('[data-score]').forEach(b => b.onclick = () => scorecard(c, c.teams.find(x => x.id === b.dataset.score)));
    on('cpEnter', () => enterTeam(c)); on('cpBack', panel); on('cpRefresh', () => openComp(c.code));
    const phase = async (ph, extra) => { try { await api('/comp/phase', Object.assign({ code: c.code, phase: ph }, extra || {})); openComp(c.code); } catch (e) { app.toast(e.message); } };
    on('cpStart', () => phase('building', { minutes: c.minutes })); on('cpJudge', () => phase('judging')); on('cpResults', () => phase('results')); on('cpReopen', () => phase('judging'));
    on('cpAuto', () => autoCheck(c));
    on('cpJudges', async () => { const n = await app.prompt('Add a judge — type the teacher’s CodeJump display name:', ''); if (!n) return; try { await api('/comp/judges', { code: c.code, displayName: n }); openComp(c.code); } catch (e) { app.toast(e.message); } });
    on('cpDel', async () => { if (!(await app.confirm('Delete this competition for everyone? This can’t be undone.'))) return; try { await api('/comp/delete', { code: c.code }); if (room && room.code === c.code) leave(); panel(); } catch (e) { app.toast(e.message); } });
  }
  async function enterTeam(c) {
    const name = await app.prompt('Your team’s name:', ''); if (name == null) return;
    const school = await app.prompt('Your school’s name (other schools will see it):', ''); if (school == null) return;
    try { const r = await api('/comp/join', { code: c.code, team: name, school }); const t = r.comp.teams.find(x => x.id === r.teamId); await pickPupils(r.comp, t); } catch (e) { app.toast(e.message); }
  }
  async function pickPupils(c, t) {
    const me = cloud().me(), pupils = [];
    for (const cl of me.classes || []) { try { const r = await api('/class/roster', { code: cl.code || cl }); for (const p of r.pupils) if (!pupils.some(x => x.uid === p.uid)) pupils.push(Object.assign({ cls: r.name }, p)); } catch (e) { /* not your class */ } }
    const now = new Set(t.members || []);
    app.modal(`<h3>${TROPHY} Pupils for ${esc(t.name)}</h3><p class="cr-fnote">Pick up to ${c.teamSize}. They’ll get a message, and find it under Compete. Other schools only see your team name and their display names.</p>
      <div class="cr-pick2">${pupils.map(p => '<label class="cr-chk"><input type="checkbox" value="' + esc(p.uid) + '"' + (now.has(p.displayName) ? ' checked' : '') + '> <b>' + esc(p.displayName) + '</b> <span class="cr-fnote">' + esc(p.realName) + ' · ' + esc(p.cls) + '</span></label>').join('') || '<p>No pupils in your classes yet.</p>'}</div>
      <label class="cr-f">Team name <input id="cpTName" maxlength="30" value="${esc(t.name)}"></label>
      <div class="cr-mbtns"><button type="button" class="gold" id="cpTSave">Save the team</button><button type="button" class="bad" id="cpTDrop">Leave the competition</button><button type="button" id="cpTBack">Back</button></div>`);
    const boxes = [...document.querySelectorAll('.cr-pick2 input')];
    boxes.forEach(b => b.onchange = () => { if (boxes.filter(x => x.checked).length > c.teamSize) { b.checked = false; app.toast('A team can have ' + c.teamSize + ' pupils.'); } });
    $('cpTBack').onclick = () => openComp(c.code);
    $('cpTSave').onclick = async () => { try { await api('/comp/team', { code: c.code, teamId: t.id, name: $('cpTName').value, members: boxes.filter(x => x.checked).map(x => x.value) }); app.toast('Team saved.'); openComp(c.code); } catch (e) { app.toast(e.message); } };
    $('cpTDrop').onclick = async () => { if (!(await app.confirm('Take ' + t.name + ' out of this competition?'))) return; try { await api('/comp/team', { code: c.code, teamId: t.id, remove: true }); openComp(c.code); } catch (e) { app.toast(e.message); } };
  }
  function scorecard(c, t) {
    const prev = (c.myScores && c.myScores[t.id]) || [];
    app.modal(`<h3>${TROPHY} Score ${esc(t.name)}</h3><p class="cr-fnote">Tip: press Look first to walk round their build.</p>
      ${c.criteria.map((x, i) => '<label class="cr-f">' + esc(x.text) + ' (out of ' + x.points + ') <input type="number" min="0" max="' + x.points + '" data-i="' + i + '" value="' + (prev[i] != null ? prev[i] : '') + '"></label>').join('')}
      <div class="cr-mbtns"><button type="button" class="gold" id="cpSSave">Save the scores</button><button type="button" id="cpSLook">Look at the build</button><button type="button" id="cpSBack">Back</button></div>`);
    $('cpSBack').onclick = () => openComp(c.code); $('cpSLook').onclick = () => lookAt(c.code, t, false, false);
    $('cpSSave').onclick = async () => { const scores = [...document.querySelectorAll('[data-i]')].map(i => +i.value || 0); try { await api('/comp/score', { code: c.code, teamId: t.id, scores }); app.toast('Scores saved.'); openComp(c.code); } catch (e) { app.toast(e.message); } };
  }
  // automatic checks: rebuild each team's world from its room (and, for coding contests, run its code on the map), then score the map's tasks
  async function autoCheck(c) {
    app.modal('<h3>' + TROPHY + ' Automatic checks</h3><p class="cr-fnote" id="cpAutoMsg">Checking the teams…</p>');
    let map; try { map = (await api('/comp/map', { code: c.code })).map; } catch (e) { app.toast(e.message); return; }
    const maker = M.cleanMaker(map && map.maker);
    if (!maker || !maker.tasks.length) { $('cpAutoMsg').textContent = 'This map has no tasks to check. Use a map with World Maker tasks (or score by judges / votes).'; return; }
    const scores = {}, details = {};
    for (const t of c.teams) {
      try {
        const snap = await api('/comp/snapshot', { code: c.code, teamId: t.id });
        const r = await checkTeam(map, maker, snap, c.kind);
        scores[t.id] = r.score; details[t.id] = r.detail;
        $('cpAutoMsg').textContent = 'Checked ' + Object.keys(scores).length + ' of ' + c.teams.length + '…';
      } catch (e) { scores[t.id] = 0; details[t.id] = 'Couldn’t check: ' + e.message; }
    }
    try { await api('/comp/auto', { code: c.code, scores, details }); openComp(c.code); app.toast('Automatic checks done.'); } catch (e) { app.toast(e.message); }
  }
  return {
    active: () => !!(room || look), inRoom: () => room, canBuild, canCode, codeChanged, open: openComp, panel, leave,
    _room: () => room, _join: join, _look: lookAt
  };
}

// score one team without touching the screen: its world (build) or its code run on the map (coding), against the map's tasks
export async function checkTeam(map, maker, snap, kind) {
  const w = createWorld();
  if (map && map.world) w.load(map.world);
  if (kind !== 'code') { if (snap.doc && snap.doc.world) w.load(snap.doc.world); for (const op of snap.log || []) for (const s of op.sets) w.set(s[0], s[1], s[2], s[3]); }
  const chk = M.createChecker(maker), st = maker.start || { x: 32, y: GROUND + 1, z: 40, yaw: 0 };
  const facing = Math.round((((-st.yaw) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI / 2)) % 4;
  const me = { x: st.x, y: st.y, z: st.z, facing };
  let program = null, blocks = 0, secs = 0;
  if (kind === 'code') {
    program = snap.doc && snap.doc.code && snap.doc.code.blocks; blocks = M.programStats(program).blocks;
    const run = createRunner(w, { player: () => me }); if (maker.helper) Object.assign(run.helper, maker.helper);
    if (maker.rules.code === 'helper') run.setAllow(t => !/^cr_b_/.test(t)); else if (maker.rules.code === 'builder') run.setAllow(t => !/^cr_h_/.test(t));
    run.load(program); run.start();
    for (let i = 0; i < 60 * 180 && run.running(); i++) { run.tick(1 / 60); secs += 1 / 60; if (i % 30 === 0) { chk.check({ world: w, player: me, helper: run.helper, program }); if (chk.complete()) break; if (i % 600 === 0) await new Promise(r => setTimeout(r, 0)); } }
    chk.check({ world: w, player: me, helper: run.helper, program });
  } else chk.check({ world: w, player: me, helper: maker.helper || {}, program: null });
  const tasks = maker.tasks.filter(t => !['talk', 'visit', 'chat'].includes(t.type)), done = tasks.filter(t => chk.done.has(t.id)).length;
  let score = tasks.length ? Math.round(100 * done / tasks.length) : 0;
  if (kind === 'code' && tasks.length && done === tasks.length && maker.challenge.par) score = Math.round(80 + 20 * (M.stars(blocks, maker.challenge.par) / 3));
  else if (kind === 'code') score = Math.round(score * 0.8 + (done === tasks.length ? 20 : 0));
  return { score, detail: done + ' of ' + tasks.length + ' tasks' + (kind === 'code' ? ' · ' + blocks + ' blocks · ' + Math.round(secs) + ' s' : '') };
}
