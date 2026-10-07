// AI Lab (projectType 'ai'): the brain on its own (Node), then the app: chooser, teach, train, test, code, save/reopen.
import { ok, done, serve, browser, openApp, ROOT } from './lib.mjs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

// ---- the brain, in Node (no browser)
const M = await import(pathToFileURL(join(ROOT, 'ai/ai-model.js')).href);
{
  const labels = M.sampleLabels('shapes', 10);
  const a = M.train(labels), b = M.train(labels);
  let right = 0, n = 0;
  for (let s = 500; s < 530; s++) for (const name of ['circle', 'square', 'triangle']) { n++; if (M.guess(a, M.sampleDrawing(name, s)).label === name) right++; }
  ok(right / n >= 0.9, `the brain recognises new shapes it never saw (${right}/${n})`);
  ok(a.check && a.check.total === 6, 'it checks itself on 1 in 4 drawings it did not practise with');
  ok(JSON.stringify(M.guess(a, M.sampleDrawing('circle', 7))) === JSON.stringify(M.guess(b, M.sampleDrawing('circle', 7))), 'the same examples always train the same brain');
  ok(M.canTrain([{ name: 'a', ex: [] }, { name: 'b', ex: [] }]).includes('at least 3'), 'it needs at least 3 drawings of each label');
  const dirty = M.cleanLabels([{ name: '<b>cat</b>', color: 'red', ex: [[[1, 2, 'x', 4, 300, -5]], 'junk'] }, { name: 'cat', ex: [] }, ...Array(9).fill({ name: 'x' })]);
  ok(dirty.length === M.MAX_LABELS && dirty[0].name === 'bcat/b' && /^#[0-9a-f]{6}$/.test(dirty[0].color) && dirty[0].ex.length === 1 && dirty[0].ex[0][0].every(v => v >= 0 && v <= 255) && dirty[1].name !== dirty[0].name,
    'a saved project is checked: names, colours, numbers and sizes');
  const circ = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2; circ.push(Math.round(128 + 80 * Math.cos(a)), Math.round(128 + 80 * Math.sin(a))); }
  ok(M.simplifyStroke(circ).length >= 20, 'a shape that ends where it began (a circle in one go) keeps its points when saved');
  const weather = M.train(M.sampleLabels('weather'), { kind: 'text' });
  ok(['it is so hot and sunny', 'take an umbrella it is raining', 'icy roads and deep snow'].map(t => M.guess(weather, t).label).join() === 'sunny,rainy,snowy', 'a words AI learns from sentences (sunny, rainy, snowy)');
  ok(weather.check && weather.check.matrix.length === 3 && weather.check.matrix.flat().reduce((a, b) => a + b, 0) === weather.check.total, 'the check also counts the mix-ups');
  ok(M.keyWords(weather, M.sampleLabels('weather'))[2].some(w => /snow/.test(w.word)), 'it can show the words that matter most for each label');
  ok(M.cleanLabels([{ name: 'a', ex: ['  hello   <b>there ', 42, [[1, 2]]] }], 'text')[0].ex.join('|') === 'hello bthere', 'saved words are checked too (tidied, no HTML, no drawings)');
  ok(M.averages(M.sampleLabels('shapes', 4)).length === 3, 'it can show the average drawing of each label');
  const faces = M.train(M.sampleLabels('faces', 10));
  ok(M.guess(faces, M.sampleDrawing('happy', 321)).label === 'happy' && M.guess(faces, M.sampleDrawing('sad', 321)).label === 'sad', 'it can tell happy faces from sad ones');
}

// ---- the app
const site = await serve(), br = await browser(), errors = [];
const N = n => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const T = t => ({ shadow: { type: 'text', fields: { TEXT: t } } });
try {
  const { page } = await openApp(br, site.url, { errors });
  await page.evaluate(() => { _pendingKs = 'ks1'; document.getElementById('ks-modal').classList.remove('hide'); });
  await page.click('#ks-modal .ks-opt >> nth=0');
  ok(await page.evaluate(() => document.querySelector('#pt-modal .ks-opt[data-pt="ai"]').style.display === 'none'), 'AI Lab is hidden for Key Stage 1');
  await page.click('#pt-cancel'); await page.click('#ks-modal .ks-opt >> nth=1');
  await page.click('#pt-modal .ks-opt[data-pt="ai"]');
  await page.waitForFunction(() => aiApp && aiApp._ws(), null, { timeout: 30000 });
  ok(await page.evaluate(() => projectType === 'ai' && document.body.classList.contains('ai-mode') && aiApp._labels().length === 2), 'it opens as an AI Lab project with two empty labels');
  ok(await page.evaluate(() => document.getElementById('alTrain').disabled), 'Train is off until there are enough drawings');

  // teach by drawing on the pad with the mouse
  await page.fill('.al-label >> nth=0 >> .al-lname', 'zigzag'); await page.press('.al-label >> nth=0 >> .al-lname', 'Enter');
  await page.click('.al-label >> nth=0 >> .al-exs');
  const box = await page.locator('#alTeachPad').boundingBox();
  for (let i = 0; i < 3; i++) {
    await page.mouse.move(box.x + 30, box.y + 40 + i * 10); await page.mouse.down();
    for (let k = 1; k <= 6; k++) await page.mouse.move(box.x + 30 + k * 40, box.y + (k % 2 ? 160 : 40) + i * 10, { steps: 3 });
    await page.mouse.up(); await page.click('#alAddEx');
  }
  ok(await page.evaluate(() => aiApp._labels()[0].name === 'zigzag' && aiApp._labels()[0].ex.length === 3), 'drawing on the pad and pressing Add teaches an example (and labels can be renamed)');

  // ready-made examples, train, test
  page.once('dialog', d => d.accept());
  await page.evaluate(() => { const s = document.getElementById('alSamples'); s.value = 'shapes'; s.dispatchEvent(new Event('change')); });
  await page.click('#cj-dialog button:has-text("Yes")').catch(() => {});
  await page.waitForFunction(() => aiApp._labels().length === 3 && aiApp._labels()[0].name === 'circle');
  ok(true, 'the ready-made Shapes examples load');
  await page.click('#alTabTrain'); await page.click('#alTrain');
  await page.waitForFunction(() => aiApp._brain() && !aiApp._training(), null, { timeout: 30000 });
  ok(await page.evaluate(() => /out of 6/.test(document.getElementById('alResult').textContent) && !document.getElementById('alChart').hidden), 'training shows the learning chart and the fair check');
  await page.evaluate(async () => { const M = await import(aiBase() + 'ai-model.js'); aiApp._pads.test.set(M.sampleDrawing('triangle', 404)); aiApp._testGuess(); });
  const tg = await page.evaluate(() => document.getElementById('alGuess').textContent);
  ok(/triangle/.test(tg) && (await page.locator('.al-barrow').count()) === 3 && (await page.locator('.al-like canvas').count()) === 3, 'testing shows its guess, a bar for every label and the most similar examples');

  // code it: a game that scores when the AI sees a square
  const prog = { blocks: { languageVersion: 0, blocks: [
    { type: 'ai_when_run', x: 20, y: 20, next: { block: { type: 'ai_set_score', inputs: { N: N(0) }, next: { block: { type: 'ai_say', inputs: { TEXT: T('Draw a square') } } } } } },
    { type: 'ai_when_thinks', x: 20, y: 200, fields: { LABEL: 'square' }, next: { block: { type: 'ai_change_score', inputs: { N: N(1) }, next: { block: { type: 'ai_colour', fields: { COL: '#00ff00' }, next: { block: { type: 'ai_clear' } } } } } } },
    { type: 'ai_when_guess', x: 20, y: 400, next: { block: { type: 'ai_say', inputs: { TEXT: { block: { type: 'text_join', extraState: { itemCount: 2 }, inputs: { ADD0: T('I see a '), ADD1: { block: { type: 'ai_guess' } } } } } } } } }
  ] } };
  await page.evaluate(p => { const P = aiApp.getProject(); P.blocks = p; aiApp.setProject(P); }, prog);
  await page.waitForFunction(() => aiApp._brain() && !aiApp._training(), null, { timeout: 30000 });
  ok(await page.evaluate(() => !document.querySelector('[data-view="code"]').hidden), 'a trained project reopens on the Code it step, and trains itself again');
  ok(await page.evaluate(() => aiApp._ws().getTopBlocks().find(b => b.type === 'ai_when_thinks').getFieldValue('LABEL') === 'square'), 'label dropdowns show the project’s own labels');
  await page.click('#alRun');
  await page.waitForFunction(() => document.getElementById('alBubble').textContent === 'Draw a square');
  await page.evaluate(async () => { const M = await import(aiBase() + 'ai-model.js'); aiApp._pads.play.set(M.sampleDrawing('square', 77)); });
  await page.click('#alDone');
  await page.waitForFunction(() => document.getElementById('alScore').textContent === 'Score: 1' && document.getElementById('alBubble').textContent === 'I see a square', null, { timeout: 10000 });
  ok(await page.evaluate(() => aiApp._pads.play.empty()), 'when the AI thinks it’s a square: the score goes up, the pad changes colour and clears');
  await page.evaluate(async () => { const M = await import(aiBase() + 'ai-model.js'); aiApp._pads.play.set(M.sampleDrawing('circle', 78)); });
  await page.click('#alDone');
  await page.waitForFunction(() => document.getElementById('alBubble').textContent === 'I see a circle');
  ok(await page.evaluate(() => document.getElementById('alScore').textContent === 'Score: 1'), 'a circle doesn’t score');

  // renaming a label renames it in the blocks too
  await page.click('#alTabTeach');
  await page.fill('.al-label >> nth=1 >> .al-lname', 'box'); await page.press('.al-label >> nth=1 >> .al-lname', 'Tab');
  ok(await page.evaluate(() => aiApp._ws().getTopBlocks().find(b => b.type === 'ai_when_thinks').getFieldValue('LABEL') === 'box' && aiApp._brain().names[1] === 'box'), 'renaming a label updates the blocks and the brain (no new training needed)');

  // save and reopen
  const saved = await page.evaluate(() => JSON.stringify(buildPayload()));
  const p = JSON.parse(saved);
  ok(p.projectType === 'ai' && p.ai.labels.length === 3 && p.ai.labels[0].ex.length === 10 && p.ai.trained === true && p.ai.blocks.blocks.blocks.length === 3, 'the project saves its labels, drawings, blocks and that it was trained');
  ok(saved.length < 60000, `the save is small (${saved.length} characters)`);
  await page.evaluate(() => { startNewProject('ks2'); document.getElementById('tutorial').classList.add('hide'); });
  ok(await page.evaluate(() => !document.body.classList.contains('ai-mode')), 'leaving goes back to a normal project');
  await page.evaluate(j => applyPayload(JSON.parse(j)), saved);
  await page.waitForFunction(() => aiApp._labels()[1].name === 'box' && aiApp._brain() && !aiApp._training(), null, { timeout: 30000 });
  ok(true, 'reopening brings everything back and the AI is ready again');
  // ---- see inside (drawings): the teaching pad shows what the computer sees, training shows averages and mix-ups
  await page.click('#alTabTeach');
  await page.evaluate(async () => { const M = await import(aiBase() + 'ai-model.js'); aiApp._pads.teach.set(M.sampleDrawing('circle', 3)); });
  const tb = await page.locator('#alTeachPad').boundingBox();
  await page.mouse.move(tb.x + 20, tb.y + 20); await page.mouse.down(); await page.mouse.move(tb.x + 30, tb.y + 30, { steps: 3 }); await page.mouse.up();
  ok(await page.evaluate(() => !document.getElementById('alTeachSees').hidden && !!document.querySelector('#alTeachSees canvas.al-grid')), 'teaching shows what the computer sees (a 20 × 20 grid)');
  await page.click('#alTabTrain');
  ok(await page.evaluate(() => document.querySelectorAll('.al-avg canvas').length === 3 && !!document.querySelector('.al-mix')), 'Look inside shows the average of each label and the mix-ups table');

  // ---- a words AI
  await page.click('#alTabTeach');
  await page.evaluate(() => { const s = document.getElementById('alSamples'); s.value = 'weather'; s.dispatchEvent(new Event('change')); });
  await page.click('#cj-dialog button:has-text("Yes")').catch(() => {});
  await page.waitForFunction(() => aiApp._labels()[0].name === 'sunny' && document.querySelector('.ailab').classList.contains('k-text'));
  ok(await page.evaluate(() => getComputedStyle(document.getElementById('alTeachText')).display !== 'none' && getComputedStyle(document.getElementById('alTeachPad')).display === 'none'), 'Words mode swaps the drawing pad for a typing box');
  await page.click('.al-label >> nth=2 >> .al-count');
  await page.fill('#alTeachText', 'hail and sleet, so cold'); await page.press('#alTeachText', 'Enter');
  ok(await page.evaluate(() => aiApp._labels()[2].ex.includes('hail and sleet, so cold') && document.getElementById('alTeachText').value === ''), 'typing an example and pressing Enter teaches it');
  await page.click('#alTabTrain'); await page.click('#alTrain');
  await page.waitForFunction(() => aiApp._brain() && aiApp._brain().kind === 'text' && !aiApp._training(), null, { timeout: 30000 });
  await page.fill('#alTestText', 'the snow is so deep');
  await page.waitForFunction(() => /snowy/.test(document.getElementById('alGuess').textContent));
  ok(await page.evaluate(() => document.querySelectorAll('.al-kwrow').length === 3), 'testing a words AI: it guesses as you type, and shows its key words');
  await page.fill('#alTestText', 'snow zorblax');
  await page.waitForFunction(() => /never seen/.test(document.getElementById('alGuess').textContent));
  ok(true, 'it points out words it has never seen');
  await page.click('#alTabCode'); await page.click('#alRun');
  await page.fill('#alPlayText', 'bring your umbrella, it is pouring'); await page.press('#alPlayText', 'Enter');
  await page.waitForFunction(() => document.getElementById('alBubble').textContent === 'I see a rainy', null, { timeout: 10000 });
  ok(true, 'Code it: typing and pressing Enter makes the AI guess and runs the program');
  const tsaved = await page.evaluate(() => JSON.stringify(buildPayload()));
  await page.evaluate(() => { startNewProject('ks2'); document.getElementById('tutorial').classList.add('hide'); });
  await page.evaluate(j => applyPayload(JSON.parse(j)), tsaved);
  await page.waitForFunction(() => aiApp._brain() && aiApp._brain().kind === 'text' && !aiApp._training(), null, { timeout: 30000 });
  ok(await page.evaluate(() => JSON.parse(JSON.stringify(aiApp.getProject())).kind === 'text' && aiApp._labels()[2].ex.length === 15), 'a words AI saves and reopens as words');
  await page.evaluate(() => openShareModal());
  ok(await page.evaluate(() => document.getElementById('sh-collab').style.display === 'none'), 'Collaborate needs you to be signed in');
  ok(errors.length === 0, 'no errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await br.close(); site.close(); }
done();
