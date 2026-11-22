// node cmpenv.js prefix "query" view... : dev build with a query string, screenshot views (shadows frozen for speed)
const { chromium } = require('playwright');
(async () => { const [pre, q, ...views] = process.argv.slice(2); const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 640, height: 400 } });
  p.on('pageerror', (e) => console.log('error:', e.message, (e.stack||'').split('\n')[1]));
  await p.goto('http://localhost:8123/?' + q, { waitUntil: 'commit', timeout: 400000 });
  await p.waitForFunction(() => !document.getElementById('loader') && window.__scene, null, { timeout: 400000, polling: 2000 });
  await p.waitForTimeout(3000); await p.evaluate(() => { document.querySelectorAll('.hud').forEach((h) => (h.style.display = 'none')); });
  for (const v of views) { await p.evaluate(async (v) => { const S = window.__scene; S.setMode('orbit', v); const fr = (n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }); S.refresh(); await fr(2); S.refresh(); await fr(2); }, v); await p.evaluate(() => new Promise((r) => { let n = 0; const f = () => (++n >= 2 ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); })); await p.waitForTimeout(500); await p.screenshot({ path: `${pre}_${v}.jpg`, type: 'jpeg', quality: 85, timeout: 400000 }); }
  await b.close(); })();
