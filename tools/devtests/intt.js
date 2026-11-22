// find one building of each interior type, stand inside it, screenshot; plus an outside view of a door
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 640, height: 400 } });
  p.on('pageerror', (e) => console.log('error:', e.message, (e.stack || '').split('\n')[1])); p.on('console', (m) => { if (/interiors|deferred/.test(m.text()) || m.type() === 'error') console.log(m.text().slice(0, 160)); });
  await p.goto('http://localhost:8123/', { waitUntil: 'commit', timeout: 400000 });
  await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 400000, polling: 2000 });
  await p.waitForTimeout(3000); await p.evaluate(() => document.querySelectorAll('.hud').forEach((h) => (h.style.display = 'none')));
  const types = await p.evaluate(() => { const L = window.__scene.interiors.list, out = {}; for (const t of ['clinic', 'police', 'school']) out[t] = L.findIndex((e) => e.type === t); out.counts = ['flat', 'studio', 'office', 'shop', 'clinic', 'police', 'school'].map((t) => t + ':' + L.filter((e) => e.type === t).length).join(' '); return out; });
  console.log(JSON.stringify(types));
  const fr = (n) => p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
  for (const t of ['clinic', 'police', 'school']) { if (types[t] < 0) continue;
    for (const [tag, lx, lz, tx, tz] of [['out', null, -5.5, null, 2], ['in', null, 0.9, 0.5, 0.7], ['in2', 0.82, 0.86, 0.2, 0.2]]) {
      const info = await p.evaluate(async ([i, lx, lz, tx, tz]) => { const S = window.__scene, e = S.interiors.list[i]; S.setMode('walk'); const px = lx === null ? e.doorX : lx * e.U, pz = lz <= 1 && lz > 0 && lx !== null ? lz * e.V : lz; const [wx, wz] = e.W(px, pz); S.walk.position.set(wx, 0, wz); const [ax, az] = e.W(tx === null ? e.doorX : tx * e.U, tz <= 1 ? tz * e.V : tz); S.walk.yaw = Math.atan2(-(ax - wx), -(az - wz)); S.walk.pitch = -0.12; S.walk.apply(); return `${e.type} U=${e.U.toFixed(1)} V=${e.V.toFixed(1)} door=${e.doorX.toFixed(1)}`; }, [types[t], lx, lz, tx, tz]);
      await fr(3); await p.waitForTimeout(700); await p.evaluate(() => window.__scene.refresh()); await fr(4); if (tag === 'out') console.log(info, JSON.stringify(await p.evaluate(() => window.__scene.interiors.stats())));
      await p.screenshot({ path: `IN_${t}_${tag}.jpg`, type: 'jpeg', quality: 85 }); } }
  await b.close(); })();
