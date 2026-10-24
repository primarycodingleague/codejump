// Teacher Guide · Live collaboration: screenshots of the real app (sample pupils, stubbed cloud) → guide/tools/out/collab/
import { join } from 'node:path';
import { openPage, stubCloud, shot, saveShots, PUPILS, HERE } from './lib.mjs';
const DIR = join(HERE, 'out', 'collab');
const [ray, fox] = PUPILS;
const DATA = {
  '/class/mine': { classes: [{ code: 'ROB5', name: 'Year 5 Robins', members: PUPILS.map(p => ({ ...p, isMe: p.uid === ray.uid })) }] },
  '/collab/start': { roomId: 'room-sample' },
  '/collab/invite': { name: 'lava-leap' },
  '/collab/info': { members: ['rocket-ray', 'pixel-fox', 'jump-ace', 'code-comet', 'star-byte'] },
  '/collab/list': { collabs: [{ roomId: 'room-sample', title: 'Lava League game', role: 'member', owner: 'rocket-ray' }, { roomId: 'room-old', title: 'Space jump practice', role: 'owner', owner: 'pixel-fox' }] }
};
const { page, errors, close } = await openPage();
const S = {};
try {
  await page.evaluate(() => document.querySelector('[data-demo=forest]').click());
  await page.waitForFunction(() => document.getElementById('home').classList.contains('hide') || getComputedStyle(document.getElementById('home')).display === 'none');
  await page.waitForTimeout(800);
  await page.evaluate(() => { if (typeof switchMode === 'function') switchMode('build'); cloudProjectTitle = 'Lava League game'; });
  // step 1: sign in (signed out first)
  await stubCloud(page, ray, DATA);
  await page.evaluate(() => { cloudToken = null; cloudMe = null; try { updateAccountChips(); } catch (e) {} document.getElementById('t-cloud').style.display = ''; });
  S.s1a = await shot(page, DIR, 's1a', '#t-cloud');
  await page.evaluate(() => openCloud());
  S.s1b = await shot(page, DIR, 's1b', '#c-login');
  await page.evaluate(() => cloudLoginView());
  await page.fill('#li-u', 'rocket-ray'); await page.fill('#li-p', 'tiger42');
  S.s1c = await shot(page, DIR, 's1c', '#li-go');
  await stubCloud(page, ray, DATA);
  await page.evaluate(() => cloudMyHome());
  S.s1d = await shot(page, DIR, 's1d', '#c-save');
  // step 2: Share
  await page.evaluate(() => closeCloud());
  S.s2 = await shot(page, DIR, 's2', '#t-share');
  // step 3: Collaborate (live!) — only shown when signed in
  await page.evaluate(() => openShareModal());
  S.s3 = await shot(page, DIR, 's3', '#sh-collab');
  // step 4: tick teammates, Start collaboration, invite more by display name
  await page.evaluate(() => collabStart());
  await page.waitForSelector('#cp-rows .cp-row');
  S.s4a = await shot(page, DIR, 's4a', '#cp-rows .cp-row');
  for (const uid of ['u2', 'u3', 'u4', 'u5']) await page.click(`#cp-rows .cp-row[data-uid=${uid}] input`);
  S.s4b = await shot(page, DIR, 's4b', '#cp-go');
  await page.evaluate(() => collabStartWith(['u2', 'u3', 'u4', 'u5']));
  await page.waitForSelector('#ci-name'); await page.waitForTimeout(500);
  await page.fill('#ci-name', 'lava-leap');
  S.s4c = await shot(page, DIR, 's4c', '#ci-go');
  // step 5: a teammate (pixel-fox) joins from Cloud → Collaborations
  await page.evaluate(() => closeCloud());
  await stubCloud(page, fox, DATA);
  await page.evaluate(() => openCloud());
  S.s5a = await shot(page, DIR, 's5a', '#c-collab');
  await page.evaluate(() => cloudCollabList());
  await page.waitForSelector('.ci-main');
  S.s5b = await shot(page, DIR, 's5b', '.ci-main');
  // step 6: building together: the Live bar with everyone, coloured cursors on the grid
  await page.evaluate(() => {
    closeCloud();
    const col = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
    const names = ['rocket-ray', 'pixel-fox', 'jump-ace', 'code-comet', 'star-byte', 'lava-leap'];
    collabActive = true; collabMembers = {};
    names.forEach((n, i) => collabMembers['u' + (i + 1)] = { uid: 'u' + (i + 1), name: n, color: col[i] });
    collabRemoteCursors = { u1: { name: 'rocket-ray', color: col[0], cell: { lvl: curLevel, r: 6, c: 5 } }, u3: { name: 'jump-ace', color: col[2], cell: { lvl: curLevel, r: 4, c: 12 } }, u4: { name: 'code-comet', color: col[3], cell: { lvl: curLevel, r: 8, c: 16 } } };
    updateCollabBar();
  });
  await page.waitForTimeout(400);
  S.s6a = await shot(page, DIR, 's6a', '#collab-bar');
  S.s6b = await shot(page, DIR, 's6b', '#cb-leave');
  saveShots(DIR, S);
  console.log('shots', Object.keys(S).length, 'errors', errors);
} finally { await close(); }
