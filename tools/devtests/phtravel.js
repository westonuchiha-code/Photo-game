// node phtravel.js <url> : cross between the two areas on foot and in a car; report memory each time, screenshots
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 412, height: 800 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const errs = [], fails = new Set();
  p.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => { const t = m.text(); if (m.type() === 'error') errs.push(t.slice(0, 160)); if (/^area |^travel /.test(t)) console.log('   ', t); }); p.on('requestfailed', (r) => fails.add(r.url().split('/').pop().slice(0, 50)));
  await p.goto(process.argv[2], { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(1500);
  const st = async (n) => console.log(n, JSON.stringify(await p.evaluate(() => { const S = window.__scene, s = S.stats(); let meshes = 0; S.scene.traverse((o) => { if (o.isMesh) meshes++; }); return { area: s.area, tex: s.tex, geo: s.geo, meshes, cars: S.drive.cars.length, colliders: S.walk.colliders.length, areas: S.walk.areas.length, programs: S.renderer.info.programs.length, mode: document.body.dataset.mode }; })));
  const settle = async () => { await p.waitForFunction(() => !window.__scene.busy, null, { timeout: 200000, polling: 300 }); await p.waitForTimeout(2500); };
  const shot = (n) => p.screenshot({ path: `shots_tmp/tr_${n}.jpg`, type: 'jpeg', quality: 85, timeout: 300000 });
  await st('start');
  // on foot: walk out of the east end of the main street
  await p.evaluate(() => { const S = window.__scene; S.walk.position.set(263, 0, 0); S.walk.yaw = -Math.PI / 2; S.walk.apply(); }); await p.waitForTimeout(1500); await settle(); await st('after walking east'); await shot('east_arrive');
  for (const [n, x, z, yaw] of [['gallery', 344, 3, Math.PI], ['temple', 393, 2, Math.PI], ['park', 288, -86, 0], ['passage', 259, -86, 0]]) { await p.evaluate(([x, z, yaw]) => { const S = window.__scene; S.walk.position.set(x, 0, z); S.walk.yaw = yaw; S.walk.pitch = 0.05; S.walk.apply(); }, [x, z, yaw]); await p.waitForTimeout(2500); await shot(n); }
  // back west on foot
  await p.evaluate(() => { const S = window.__scene; S.walk.position.set(228, 0, 0); S.walk.yaw = Math.PI / 2; S.walk.apply(); }); await p.waitForTimeout(1500); await settle(); await st('after walking back west'); await shot('west_again');
  // in a car: get in the cab and drive it out east
  await p.evaluate(() => { const S = window.__scene, c = S.drive.cars.find((q) => q.userData.driveName === 'cab'); S.walk.position.set(c.position.x, 0, c.position.z + 2.2); S.walk.apply(); }); await p.waitForTimeout(800); await p.evaluate(() => window.__scene.use()); await p.waitForTimeout(500);
  await p.evaluate(() => { const S = window.__scene, st = S.drive.state; st.x = 258; st.z = -2; st.h = Math.PI / 2; S.drive.sim(3.5, { gas: 1 }); }); await p.waitForTimeout(1500); await settle(); await st('after driving east'); await shot('east_in_car');
  console.log('car', JSON.stringify(await p.evaluate(() => { const S = window.__scene, st = S.drive.state, x0 = st.x; S.drive.sim(2, { gas: 1 }); return { name: S.drive.cars.filter((c) => c.userData.driveName === 'cab').length, movedAfter: +(st.x - x0).toFixed(1), x: +st.x.toFixed(1) }; })));
  for (let i = 0; i < 2; i++) { await p.evaluate((to) => window.__scene.travel(to), i ? 'east' : 'west'); await p.waitForTimeout(800); await settle(); } await st('after two more crossings');
  console.log('errors', errs.length, errs.slice(0, 5).join(' || ')); console.log('failed requests', fails.size, [...fails].slice(0, 8).join(' ')); await b.close(); })();
