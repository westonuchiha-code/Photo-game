const { chromium } = require('playwright');
(async () => { const q = process.argv[2] || ''; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 640, height: 400 } }); const t0 = Date.now();
  p.on('pageerror', (e) => console.log('error:', e.message, (e.stack || '').split('\n')[1])); p.on('console', (m) => { const t = m.text(); if (/^T (oldtown|streamer|shaders)|quality|lamp pools|deferred/.test(t)) console.log(((Date.now() - t0) / 1000).toFixed(1) + 's', t.slice(0, 110)); });
  await p.goto('http://localhost:8123/?' + q, { waitUntil: 'commit', timeout: 400000 });
  await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 400000, polling: 1000 });
  console.log('playable', ((Date.now() - t0) / 1000).toFixed(1)); await p.waitForTimeout(15000);
  for (const v of ['oldtown', 'alleyprops', 'monkey']) { await p.evaluate(async (v) => { const S = window.__scene; S.setMode('orbit', v); document.querySelectorAll('.hud').forEach((h) => (h.style.display = 'none')); const fr = (n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }); S.refresh(); await fr(2); S.refresh(); await fr(2); }, v); await p.screenshot({ path: `Q${q.replace(/\W/g, '')}_${v}.jpg`, type: 'jpeg', quality: 85 }); }
  console.log('level', await p.evaluate(() => window.__quality.level + ' ' + window.__quality.gpu.slice(0, 50)));
  await b.close(); })();
