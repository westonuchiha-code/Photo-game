const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 640, height: 400 } });
  p.on('pageerror', (e) => console.log('error:', e.message, (e.stack || '').split('\n')[1])); p.on('console', (m) => { if (/street services|interiors/.test(m.text()) || m.type() === 'error') console.log(m.text().slice(0, 200)); });
  await p.goto('http://localhost:8123/', { waitUntil: 'commit', timeout: 400000 });
  await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 400000, polling: 2000 });
  await p.waitForTimeout(3000); await p.evaluate(() => document.querySelectorAll('.hud').forEach((h) => (h.style.display = 'none')));
  const shots = JSON.parse(process.argv[2]);
  for (const [name, px, py, pz, tx, ty, tz] of shots) { await p.evaluate(async ([px, py, pz, tx, ty, tz]) => { const S = window.__scene; S.setMode('orbit', 'room'); S.camera.position.set(px, py, pz); S.camera.lookAt(tx, ty, tz); window.__lock = true; const fr = (n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }); S.refresh(); await fr(2); S.camera.position.set(px, py, pz); S.camera.lookAt(tx, ty, tz); S.refresh(); await fr(3); }, [px, py, pz, tx, ty, tz]); await p.screenshot({ path: `${name}.jpg`, type: 'jpeg', quality: 85 }); }
  await b.close(); })();
