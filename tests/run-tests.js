/* Push and Undo tests for PRTG Map Studio, run against mock-prtg.py instead of a real PRTG.
   The app is loaded as a normal web page from the stand-in server (not as an installed extension),
   with test-only login values. Run from this folder: node run-tests.js   (see README.md) */
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');

const PORT = Number(process.env.PORT || 8765);
const BASE = 'http://127.0.0.1:' + PORT;
const PYTHON = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const EXT = process.env.EXT_DIR ? path.resolve(process.env.EXT_DIR) : path.resolve(__dirname, '..', 'extension');

const results = [];
function check(name, ok, detail) { results.push({ name, ok: !!ok, detail }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok ? '' : '\n     ' + JSON.stringify(detail))); }
const mock = (p) => fetch(BASE + p).then((r) => r.text());
const calls = (log) => log.filter((l) => /addobjecttomap|deletesubobject|editmapobject/.test(l.path))
  .map((l) => l.path.replace('/api/', '').replace('.htm', '') + (l.q.subid ? '(' + l.q.subid + ')' : '') + (l.q.mapobject_ ? '[' + l.q.mapobject_ + ']' : ''));

async function waitForServer() {
  for (let i = 0; i < 50; i++) { try { await mock('/__state'); return; } catch (e) { await new Promise((r) => setTimeout(r, 100)); } }
  throw new Error('the stand-in PRTG did not start (is Python installed? set PYTHON=...)');
}

(async () => {
  const server = spawn(PYTHON, [path.join(__dirname, 'mock-prtg.py'), EXT, String(PORT)], { stdio: 'inherit' });
  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch();
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e)));
    page.on('dialog', (d) => { pageErrors.push('dialog: ' + d.message()); d.dismiss(); });

    async function start(mapItems) {
      await page.goto(BASE + '/ext/app.html');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await mock('/__reset?next=10&items=' + encodeURIComponent(JSON.stringify(mapItems || {})));
      await mock('/__mode?m={}');
      await page.fill('#pushserver', BASE);
      await page.fill('#pushuser', 'testuser');
      await page.fill('#pushsecret', 'test-passhash');
      await page.evaluate(() => PUSHAPI.connect());
      await page.waitForFunction(() => PUSHAPI.state.maps && PUSHAPI.state.objFile && !document.getElementById('pushconnect').disabled, null, { timeout: 20000 });
      await page.evaluate(() => document.getElementById('mDash').click());
    }
    async function addGauge(file) {
      await page.evaluate((f) => DASHAPI.addObject({ cat: 'Gauges', name: 'Gauge', value: f, target: { id: 3001, name: 'Sensor' } }), file);
      return page.evaluate(() => { const it = DASHAPI.pushItems()[0]; return { id: it.id, uid: DASHAPI.uid(), it }; });
    }
    /* make the canvas item look as if it had been pushed before with another object file, so the next push replaces it */
    async function pretendPushedAs(info, oldFile, oldSub) {
      const it = info.it, items = {};
      items[info.id] = { subid: oldSub, name: 'Gauge', type: it.type, sent: { left: it.left, top: it.top, width: it.width, height: it.height, z: 0, html: it.html || '' }, obj: { value: oldFile, target: 3001 } };
      await page.evaluate(([k, items]) => { const o = {}; o[k] = { at: Date.now(), items }; localStorage.setItem('prtgMapTool.sync', JSON.stringify(o)); }, [BASE + '|2001|' + info.uid, items]);
      const onMap = {}; onMap[oldSub] = { file: oldFile, target: '3001', left: String(it.left), top: String(it.top), width: String(it.width), height: String(it.height) };
      await mock('/__reset?next=10&items=' + encodeURIComponent(JSON.stringify(onMap)));
    }
    async function push() {
      await page.evaluate(() => { PUSHAPI.review(); PUSHAPI.push(); });
      await page.waitForFunction(() => !PUSHAPI.state.busy, null, { timeout: 20000 });
      return page.evaluate(() => ({ msg: document.getElementById('pushstatus').textContent, cls: document.getElementById('pushstatus').className }));
    }
    async function undo() {
      await page.evaluate(() => PUSHAPI.undo());
      await page.waitForFunction(() => !PUSHAPI.state.busy, null, { timeout: 20000 });
      return page.evaluate(() => document.getElementById('pushstatus').textContent);
    }
    const state = async () => JSON.parse(await mock('/__state'));

    /* 1. a plain push adds the item once; pushing again does not add it a second time */
    await start(); await addGauge('a.htm');
    let r = await push();
    let s = await state();
    check('plain push adds one item', /Added 1 item/.test(r.msg) && Object.keys(s.items).length === 1, { r, items: s.items });
    await push();
    s = await state();
    check('pushing again does not duplicate', Object.keys(s.items).length === 1, s.items);

    /* 2. replace: the new item is added first, the old one deleted after (1.5.42) */
    await start(); let info = await addGauge('b.htm'); await pretendPushedAs(info, 'a.htm', '5');
    r = await push(); s = await state();
    check('replace adds before it deletes', JSON.stringify(calls(s.log)) === JSON.stringify(['addobjecttomap[b.htm]', 'editmapobject(10)', 'deletesubobject(5)']), calls(s.log));
    check('replace leaves only the new item', JSON.stringify(Object.keys(s.items)) === '["10"]', s.items);
    const undoMsg = await undo(); const s2 = await state();
    check('Undo after replace removes the new item', Object.keys(s2.items).length === 0 && /removed 1 added item/.test(undoMsg), { undoMsg, items: s2.items });

    await start(); info = await addGauge('b.htm'); await pretendPushedAs(info, 'a.htm', '5');
    await mock('/__mode?m=' + encodeURIComponent('{"addfail":1}'));
    r = await push(); s = await state();
    check('failed add during replace keeps the old item', JSON.stringify(Object.keys(s.items)) === '["5"]' && !calls(s.log).some((c) => /deletesubobject/.test(c)), { r, calls: calls(s.log) });

    await start(); info = await addGauge('b.htm'); await pretendPushedAs(info, 'a.htm', '5');
    await mock('/__mode?m=' + encodeURIComponent('{"delfail":1}'));
    r = await push(); s = await state();
    check('failed delete during replace says which item to delete', /did not delete the old one \(item 5\)/.test(r.msg) && r.cls.includes('err'), r);

    /* 3. Undo is only offered for pushes made to the server you are connected to (1.5.41) */
    async function undoButtons(entries) {
      await page.goto(BASE + '/ext/app.html'); await page.evaluate(() => localStorage.clear());
      await page.evaluate((e) => {
        localStorage.setItem('prtgMapTool.pushes', JSON.stringify(e));
        localStorage.setItem('prtgMapTool.mapEdits', JSON.stringify(e.map((x) => ({ map: x.map, srv: x.srv, name: 'm', at: x.at, updated: [{ subid: '7', before: {}, after: {} }], removed: [] }))));
      }, entries);
      await page.reload();
      await page.fill('#pushserver', BASE); await page.fill('#pushuser', 'testuser'); await page.fill('#pushsecret', 'test-passhash');
      await page.evaluate(() => PUSHAPI.connect());
      await page.waitForFunction(() => PUSHAPI.state.maps && !document.getElementById('pushconnect').disabled, null, { timeout: 20000 });
      return page.evaluate(() => ({ push: !document.getElementById('pushundo').disabled, mapEdit: !document.getElementById('xeundo').disabled }));
    }
    const at = new Date().toISOString();
    let u = await undoButtons([{ map: '2001', srv: 'https://other-prtg.test', name: 'm', at, added: ['7'], updated: [], removed: [] }]);
    check('no Undo for a push to another server with the same map id', !u.push && !u.mapEdit, u);
    u = await undoButtons([{ map: '2001', name: 'm', at, added: ['7'], updated: [], removed: [] }]);
    check('no Undo for history saved before 1.5.41 (no server recorded)', !u.push && !u.mapEdit, u);
    u = await undoButtons([{ map: '2001', srv: BASE, name: 'm', at, added: ['7'], updated: [], removed: [] }]);
    check('Undo offered for a push to this server', u.push && u.mapEdit, u);

    /* 4. a record that cannot be saved is reported (1.5.43) */
    await start(); await addGauge('a.htm');
    await page.evaluate(() => {
      const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) { if (/prtgMapTool\.(sync|pushes)/.test(k)) { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; } return orig.call(this, k, v); };
    });
    r = await push();
    check('full storage gives a red warning', /could not save its record/.test(r.msg) && r.cls.includes('err'), r);

    check('no errors in the page', pageErrors.length === 0, pageErrors);
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
  const failed = results.filter((x) => !x.ok).length;
  console.log('\n' + (results.length - failed) + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('The tests could not run:', e); process.exit(2); });
