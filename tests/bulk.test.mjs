// Teacher → a class → Add pupils: the list is read however a spreadsheet saved it (old Mac line endings, a byte-order mark,
// UTF-16, semicolons, a tab-separated paste, any header or none, first + last name columns, names only) and every pupil it
// sends passes the cloud's rules (display name 3–20 letters/numbers/-/_, password 4+). In the app: a file is picked up, a
// spreadsheet file gets a clear message, taken display names can be retried with new ones. The cloud is a stand-in here.
import { serve, browser, openApp, ok, done } from './lib.mjs';

const site = await serve();
const b = await browser();
const errors = [];
const valid = h => /^[a-z0-9][a-z0-9_-]{2,19}$/.test(String(h).toLowerCase());
const sent = [];
const cloud = async (path, method, body) => {
  if (path === '/class/bulk') {
    const req = JSON.parse(body); sent.push(req.students);
    const results = req.students.map(s => ({ displayName: s.displayName, status: !s.realName || !valid(s.displayName) || s.password.length < 4 ? 'skipped' : s.displayName === 'PriyaP' ? 'exists' : 'created' }));
    return { json: { created: results.filter(r => r.status === 'created').length, exists: results.filter(r => r.status === 'exists').length, skipped: results.filter(r => r.status === 'skipped').length, results } };
  }
  return { status: 404, json: { error: 'not in this test' } };
};
try {
  const { page } = await openApp(b, site.url, { errors, cloud });
  const P = t => page.evaluate(t => { const r = parseStudentCSV(t); return { n: r.students.length, h: r.header, s: r.students, skipped: r.skipped.length }; }, t);
  const allOk = r => r.s.every(s => valid(s.displayName) && s.password.length >= 4 && s.realName);

  let r = await P('Name,Display name,Password\rSam Jones,SamJ,tiger42\rAli Khan,AliK,lion77\r');
  ok(r.n === 2 && r.h && r.s[1].displayName === 'AliK' && r.s[1].password === 'lion77', 'old Mac line endings (Excel for Mac “CSV”): both pupils, header skipped');
  r = await P('﻿Name;Username;Password\r\nSam Smith;sam1;abcd\r\n');
  ok(r.n === 1 && r.s[0].realName === 'Sam Smith' && r.s[0].displayName === 'sam1', 'byte-order mark + semicolons (European Excel)');
  r = await P('Sam Jones\tSam J\tab\nPriya Patel\n');
  ok(r.n === 2 && r.s[0].displayName === 'SamJ' && r.s[0].was === 'Sam J' && r.s[0].made.pass && r.s[1].made.disp && r.s[1].made.pass && allOk(r),
    'a tab-separated paste: a display name with a space is tidied, a short password and missing ones are made');
  r = await P('First name,Surname\nSam,Jones\nAli,Khan\n');
  ok(r.n === 2 && r.s[0].realName === 'Sam Jones' && /^SamJ\d+$/.test(r.s[0].displayName) && allOk(r), 'First name + Surname columns are joined; display names made from them');
  r = await P('Sam Jones\nAli Khan\nSam Jones\n');
  ok(r.n === 3 && !r.h && new Set(r.s.map(s => s.displayName.toLowerCase())).size === 3 && allOk(r), 'names only, no header: every pupil gets a different display name');
  r = await P('"Jones, Sam",samj,pass1\n');
  ok(r.n === 1 && r.s[0].realName === 'Jones, Sam' && r.s[0].displayName === 'samj', 'a quoted name with a comma');
  r = await P('Pupil,Password,Login\nZoë Brontë,secret,zoe_b\n');
  ok(r.n === 1 && r.s[0].realName === 'Zoë Brontë' && r.s[0].displayName === 'zoe_b' && r.s[0].password === 'secret', 'header columns in any order');
  r = await P('Name,Display name,Password\nZoë Brontë,Zoë,\n');
  ok(r.n === 1 && r.s[0].displayName === 'Zoe' && allOk(r), 'accents in a display name are taken off');
  r = await P(',,\n\n  \n');
  ok(r.n === 0, 'an empty sheet finds nobody');
  const u16 = await page.evaluate(() => { const t = '﻿Name\tDisplay name\tPassword\r\nSam Jones\tSamJ\ttiger42\r\n'; const u = new Uint8Array(t.length * 2); for (let i = 0; i < t.length; i++) { u[2 * i] = t.charCodeAt(i) & 255; u[2 * i + 1] = t.charCodeAt(i) >> 8; } const r = parseStudentCSV(_bulkDecode(u.buffer)); return r.students.map(s => s.displayName).join(); });
  ok(u16 === 'SamJ', 'UTF-16 “Unicode text” from Excel is read');

  // ---- the app: pick a file, see the list, create, retry the taken one
  await page.evaluate(() => { cloudToken = 'test'; document.getElementById('cloud-modal').classList.remove('hide'); teacherBulkCSV('ABCD'); });
  await page.setInputFiles('#bk-input', { name: 'Year 4.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from('PK') });
  ok(/spreadsheet file, not a CSV/.test(await page.textContent('#bk-msg')), 'an Excel file gets a clear message (save as CSV, or paste)');
  await page.setInputFiles('#bk-input', { name: 'class.csv', mimeType: 'text/csv', buffer: Buffer.from('Name,Display name,Password\rSam Jones,Sam J,tiger42\rPriya Patel,PriyaP,lion77\rAli Khan,,\r') });
  await page.waitForSelector('#bk-go', { timeout: 5000 });
  const prev = await page.textContent('#cloud-body');
  ok(/Add 3 pupils/.test(prev) && /@SamJ/.test(prev) && /was “Sam J”/.test(prev), 'a chosen CSV file is picked up and shown before anything is made: ' + prev.slice(0, 80));
  await page.click('#bk-go');
  await page.waitForSelector('#bk-back', { timeout: 5000 });
  ok(sent[0].length === 3 && sent[0].every(s => valid(s.displayName) && s.password.length >= 4), 'everything sent passes the cloud’s rules');
  ok(/2<\/b> accounts made/.test(await page.innerHTML('#cloud-body')) && await page.$('#bk-retry'), 'a taken display name is reported with a button to try new ones');
  await page.click('#bk-retry');
  await page.waitForSelector('#bk-back', { timeout: 5000 });
  ok(sent[1].length === 1 && sent[1][0].realName === 'Priya Patel' && sent[1][0].displayName !== 'PriyaP' && /3<\/b> accounts made/.test(await page.innerHTML('#cloud-body')) && await page.$('#bk-cards'),
    'try again: only that pupil is sent, with a new display name, and all 3 are made');
  // pasting from a spreadsheet
  await page.evaluate(() => teacherBulkCSV('ABCD'));
  await page.fill('#bk-paste', 'Sam Jones\tSamJ\ttiger42\nAli Khan\tAliK\tlion77');
  await page.click('#bk-check');
  ok(/Add 2 pupils/.test(await page.textContent('#cloud-body')), 'rows pasted from a spreadsheet work too');
  await page.evaluate(() => teacherBulkCSV('ABCD'));
  await page.fill('#bk-paste', '   ');
  await page.click('#bk-check');
  ok(/Choose a file or paste/.test(await page.textContent('#bk-msg')), 'nothing to read: says what to do');
  ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} finally { await b.close(); site.close(); }
done();
