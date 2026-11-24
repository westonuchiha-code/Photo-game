const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 640, height: 400 } });
  p.on('pageerror', (e) => console.log('error:', e.message, (e.stack || '').split('\n')[1]));
  await p.goto('http://localhost:8123/', { waitUntil: 'commit', timeout: 400000 });
  await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 400000, polling: 2000 });
  await p.waitForTimeout(2000); await p.evaluate(() => { document.querySelectorAll('.hud').forEach((h) => (h.style.display = 'none')); });
  const shot = async (n) => { await p.waitForTimeout(600); await p.screenshot({ path: `shots_tmp/${n}.jpg`, type: 'jpeg', quality: 85, timeout: 300000 }); };
  const fr = 0; await p.evaluate(() => { window.__fr = (n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }); });
  for (const v of ['apthall', 'aptunit']) { await p.evaluate(async ([v]) => { const fr = window.__fr; const S = window.__scene; S.setMode('orbit', v); for (const it of S.interactables) { it.target = 0; it.t = 0; } S.refresh(); await fr(4); }, [v, fr]); await shot(v + '_closed');
    console.log(v, await p.evaluate(async () => { const fr = window.__fr; const S = window.__scene; let n = 0; for (const it of S.interactables) { it.target = 1; it.t = 1; n++; } await fr(4); return n; }, fr)); await shot(v + '_open'); }
  // drive: get in the first car, drive forward 3 s steering, screenshot; report it moved
  console.log('drive', JSON.stringify(await p.evaluate(async () => { const fr = window.__fr; const S = window.__scene, car = S.drive.cars[0]; const x0 = car.position.x, z0 = car.position.z; S.enterCar(car); await fr(3); S.drive.sim(2.5, { gas: 1, steer: 0.4 }); await fr(3); let meshes = 0; car.traverse((o) => { if (o.isMesh) meshes++; }); return { name: car.name, meshes, moved: Math.hypot(car.position.x - x0, car.position.z - z0).toFixed(1), roll: car.userData.body.rotation.z.toFixed(3), spin: car.userData.wheels[0].spin.rotation.x.toFixed(1), steer: car.userData.wheels[0].pivot.rotation.y.toFixed(2) }; }, fr))); await shot('drive');
  await b.close(); })();
