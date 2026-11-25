const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [];
  for (const [w, h, n] of [[412, 800, 'p'], [800, 412, 'l']]) { const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(process.argv[2], { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(1000);
  await p.evaluate(() => { const S = window.__scene, D = S.drive, c = D.cars.find((q) => q.userData.driveName === 'blue coupe'); c.position.set(75, 0, -60); c.rotation.set(0, 0, 0); D.syncCols(c); D.enter(c); S.setMode('drive'); });
  const hold = async (sel, ms) => { const el = await p.$(sel); await el.dispatchEvent('touchstart'); await p.waitForTimeout(ms); const r = await p.evaluate(() => { const s = window.__scene.drive.state; return +(s.vF * 3.6).toFixed(1); }); await el.dispatchEvent('touchend'); return r; };
  await p.waitForTimeout(500); await p.screenshot({ path: `cm/ctl_${n}.jpg`, type: 'jpeg', quality: 88 });
  console.log(n, 'A', await hold('#drivehud .a', 2500), 'X(brake)', await hold('#drivehud .x', 2500), 'X(reverse)', await hold('#drivehud .x', 2500));
  const el = await p.$('#drivehud [data-k=left]'); await el.dispatchEvent('touchstart'); console.log('steer', await p.evaluate(() => window.__scene.drive.input?.().steer)); await el.dispatchEvent('touchend');
  await (await p.$('#drivehud .y')).dispatchEvent('touchstart'); await p.waitForTimeout(300); console.log('mode after Y', await p.evaluate(() => document.body.dataset.mode)); await ctx.close(); }
  console.log('errors', errs.length, errs.slice(0, 3).join(' | ')); await b.close(); })();
