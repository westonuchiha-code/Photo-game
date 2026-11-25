const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 800, height: 412 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(process.argv[2], { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(1000);
  await p.evaluate(() => { const S = window.__scene, D = S.drive, c = D.cars.find((q) => q.userData.driveName === 'blue coupe'); c.position.set(75, 0, -60); c.rotation.set(0, 0, 0); D.syncCols(c); D.enter(c); S.setMode('drive'); D.sim(1.5, { gas: 1 }); });
  let i = 0; for (const [yaw, pitch] of [[0, 0.5], [1.3, 0.35], [2.6, 0.2]]) { await p.evaluate(([y, pi]) => { const s = window.__scene.drive.state; s.lookYaw = y; s.lookPitch = pi; s.lookT = 99; }, [yaw, pitch]); await p.waitForTimeout(1500); await p.screenshot({ path: `cm/beam_${i++}.jpg`, type: 'jpeg', quality: 90 }); }
  console.log('errors', errs.length); await b.close(); })();
