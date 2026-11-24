const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 640, height: 400 } });
  p.on('pageerror', (e) => console.log('error:', e.message, (e.stack || '').split('\n')[1]));
  await p.goto('http://localhost:8123/', { waitUntil: 'commit', timeout: 400000 });
  await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 400000, polling: 2000 });
  await p.waitForTimeout(3000); await p.evaluate(() => { document.querySelectorAll('.hud').forEach((h) => (h.style.display = 'none')); const S = window.__scene; S.setMode('orbit', 'room'); window.__lock = true; S.renderer.info.autoReset = false; });
  const at = async (name, idx, lx, lz, tx, tz, wait) => { const r = await p.evaluate(async ([idx, lx, lz, tx, tz, wait]) => { const S = window.__scene, e = S.interiors.list[idx]; const [x, z] = e.W(lx < 0 ? e.doorX : lx * e.U, lz), [ax, az] = e.W(tx < 0 ? e.doorX : tx * e.U, tz); S.camera.position.set(x, 1.75, z); S.camera.lookAt(ax, 1.5, az);
      await new Promise((r) => setTimeout(r, wait)); S.camera.position.set(x, 1.75, z); S.camera.lookAt(ax, 1.5, az); S.renderer.info.reset(); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); const i = S.renderer.info.render; return { calls: i.calls, tris: i.triangles, ...S.shutState(), built: !!e.group, t: e.t }; }, [idx, lx, lz, tx, tz, wait]);
    console.log(name, JSON.stringify(r)); await p.screenshot({ path: `shots_tmp/${name}.jpg`, type: 'jpeg', quality: 85, timeout: 300000 }); };
  const ids = await p.evaluate(() => { const L = window.__scene.interiors.list; return [L.findIndex((e) => e.type === 'shop'), L.findIndex((e) => e.type === 'flat'), L.findIndex((e) => e.b.house)]; });
  for (const [k, id] of ids.entries()) { const n = ['shop', 'flat', 'house'][k]; if (id < 0) continue;
    await at(n + '_outside', id, -1, -6, -1, 2, 9000); await at(n + '_inside', id, 0.5, 5.5, 0.5, 0.5, 9000); await at(n + '_atdoor', id, -1, 1.6, -1, -6, 6000); await at(n + '_backout', id, -1, -6, -1, 2, 5000); }
  await b.close(); })();
