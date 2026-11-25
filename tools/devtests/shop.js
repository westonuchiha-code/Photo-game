const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 412, height: 800 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message + (e.stack || '').split('\n')[1]));
  await p.goto(process.argv[2], { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(1200);
  const ev = (f, a) => p.evaluate(f, a); let n = 0; const shot = async (name) => { await p.waitForTimeout(1300); await p.screenshot({ path: `cm/s_${n++}_${name}.jpg`, type: 'jpeg', quality: 88 }); };
  console.log('pad', JSON.stringify(await ev(() => { const S = window.__scene; S.talk.reset(); S.talk.wallet.money = 500; S.talk.sync(); return S.shopPad; })));
  // the booth from outside, on foot
  await ev(() => { const S = window.__scene, p = S.shopPad; S.walk.position.set((p[0] + p[1]) / 2 + 5, 0, p[2] - 11); S.walk.yaw = Math.atan2(5, -11); S.walk.pitch = 0.05; S.walk.apply(); }); await shot('booth');
  // crash a cab, then drive it in
  console.log('in', JSON.stringify(await ev(() => { const S = window.__scene, D = S.drive, p = S.shopPad, c = D.cars.find((q) => q.userData.driveName === 'cab'); c.position.set((p[0] + p[1]) / 2, 0, p[2] - 9); c.rotation.set(0, 0, 0); D.syncCols(c); D.enter(c); S.setMode('drive'); D.sim(2.2, {}); D.hurt(c, 420, c.position.x, c.position.z + 2); D.sim(0.2, {}); let t = 0; while (t < 12) { const st = D.state, inside = st.z > p[2] + 1.2; D.sim(0.1, inside ? { brake: 1 } : { gas: 0.5 }); t += 0.1; if (inside && Math.abs(st.vF) < 0.5) { D.sim(0.3, {}); break; } } return { z: +D.state.z.toFixed(1), pad: p.map((v) => +v.toFixed(1)), hp: Math.round(c.userData.hp) }; })));
  await p.waitForFunction(() => window.__scene.shop.active, null, { timeout: 20000 }); await shot('menu_repair');
  await p.click('#bshop .body .row'); console.log('repaired', JSON.stringify(await ev(() => ({ hp: window.__scene.drive.car.userData.hp, money: window.__scene.talk.wallet.money }))));
  await p.click('#bshop .tabs button:nth-child(2)'); await p.click('#bshop .sw button:nth-child(12)'); await shot('paint_pink');
  for (const [tab, row] of [[3, 3], [4, 3], [5, 2], [6, 3], [7, 1], [7, 2]]) { await p.click(`#bshop .tabs button:nth-child(${tab})`); const rows = await p.$$('#bshop .body .row'); await rows[row - 1].click(); }
  await shot('parts'); console.log('fitted', JSON.stringify(await ev(() => ({ opts: window.__scene.drive.car.userData.opts, money: window.__scene.talk.wallet.money }))).slice(0, 400));
  await p.click('#bshop .done'); console.log('out', JSON.stringify(await ev(() => { const S = window.__scene, D = S.drive; D.sim(3.5, { brake: 1 }); return { active: S.shop.active, kmh: +(D.state.vF * 3.6).toFixed(0), lock: D.lock }; }))); await ev(() => { const s = window.__scene.drive.state; s.lookYaw = 2.4; s.lookT = 99; }); await shot('driving_out');
  console.log('errors', errs.length, errs.slice(0, 3).join(' | ')); await b.close(); })();
