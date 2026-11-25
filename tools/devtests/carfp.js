const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 800, height: 412 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message + (e.stack || '').split('\n')[1]));
  await p.goto(process.argv[2], { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(1000);
  const ev = (f, a) => p.evaluate(f, a); let n = 0; const shot = () => p.screenshot({ path: `cm/fp_${n++}.jpg`, type: 'jpeg', quality: 88 });
  await ev(() => { const S = window.__scene, D = S.drive, c = D.cars.find((q) => q.userData.driveName === 'red hatch'); c.position.set(75, 0, -60); c.rotation.set(0, 0, 0); D.syncCols(c); S.walk.position.set(75 + 2.2, 0, -60 - 0.6); S.walk.yaw = Math.atan2(2.2, -0.9); S.walk.pitch = -0.15; S.walk.apply(); window.car = c; });
  await p.waitForTimeout(1500); await ev(() => { window.__loadingHold = true; const S = window.__scene; S.renderer.render(S.scene, S.camera); }); await shot();
  await ev(() => { const S = window.__scene; S.use(); });
  const stepR = (t) => ev((t) => { const S = window.__scene; for (let k = 0; k < Math.round(t * 60); k++) S.drive.update(1 / 60); S.renderer.render(S.scene, S.camera); }, t);
  for (const t of [0.3, 0.3, 0.25, 0.25, 0.35, 0.5, 0.6]) { await stepR(t); await shot(); }
  console.log('horn', JSON.stringify(await ev(async () => { const D = window.__scene.drive; for (const k of ['left', 'right']) document.querySelector(`#drivehud [data-k=${k}]`).dispatchEvent(new Event('touchstart', { cancelable: true })); const r = { buttons: document.querySelectorAll('#drivehud .pads button').length, steer: D.input().steer }; for (const k of ['left', 'right']) document.querySelector(`#drivehud [data-k=${k}]`).dispatchEvent(new Event('touchend')); return r; })));
  await stepR(1); await ev(() => window.__scene.use()); for (const t of [0.45, 0.3, 0.25, 0.18]) { await stepR(t); await shot(); } await stepR(0.2);
  // now on foot: step the walker's rise by hand
  console.log('mode', await ev(() => document.body.dataset.mode)); await ev(() => { window.__loadingHold = false; }); await p.waitForTimeout(1800); await shot();
  console.log('errors', errs.length, errs.slice(0, 3).join(' | ')); await b.close(); })();
