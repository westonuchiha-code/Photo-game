// staged driving scenes with screenshots: node drshots.js <url>
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 412, height: 800 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  await p.goto(process.argv[2], { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(1000);
  const shot = async (n) => { await p.waitForTimeout(700); await p.screenshot({ path: `shots_tmp/${n}.jpg`, type: 'jpeg', quality: 85, timeout: 300000 }); };
  const ev = (f, a) => p.evaluate(f, a);
  await ev(() => { const S = window.__scene, D = S.drive; window.put = (name, x, z, h) => { const c = D.cars.find((q) => q.userData.driveName === name); if (D.car) D.exit(); c.position.set(x, 0, z); c.rotation.set(0, h, 0); c.userData.hp = c.userData.hd.hpMax; D.syncCols(c); D.enter(c); S.setMode('drive'); return c; }; window.kmh = () => Math.hypot(D.state.vx, D.state.vz) * 3.6; });
  // 1. cruising: HUD + touch controls
  await ev(() => { window.put('blue coupe', 75, -80, 0); window.__scene.drive.sim(2.2, { gas: 1 }); }); await shot('1_cruise');
  // 2. handbrake slide
  await ev(() => { window.__scene.drive.sim(0.55, { steer: 1, hand: true }); }); await shot('2_handbrake');
  // 3. crash damage: three hard hits into the end barrier
  console.log('damage', JSON.stringify(await ev(() => { const S = window.__scene, D = S.drive, c = window.put('cab', 161, 40, 0), hp = []; for (let i = 0; i < 3; i++) { D.state.x = 161; D.state.z = 60; D.state.h = 0; D.state.vx = 0; D.state.vz = 0; let g = 0; while (window.kmh() < 85 && g++ < 300) D.sim(0.05, { gas: 1 }); D.sim(1.2, { gas: 1 }); hp.push(Math.round(c.userData.hp)); } D.state.x = 161; D.state.z = 40; D.state.h = 2.4; D.state.vx = D.state.vz = 0; D.sim(0.2, {}); return { hp, max: c.userData.hd.hpMax }; }))); await shot('3_damaged');
  // 4. fire -> explosion -> wreck
  console.log('fire', JSON.stringify(await ev(() => { const S = window.__scene, D = S.drive, c = D.car; c.userData.hp = c.userData.hd.hpMax * 0.09; D.sim(1.5, {}); return { hp: Math.round(c.userData.hp), wreck: !!c.userData.wreck }; }))); await shot('4_fire');
  console.log('boom', JSON.stringify(await ev(() => { const S = window.__scene, D = S.drive, c = D.car; c.userData.hp = 2; D.sim(0.4, {}); return { wreck: !!c.userData.wreck, mode: document.body.dataset.mode }; }))); await shot('5_explosion'); await p.waitForTimeout(1500);
  console.log('after', JSON.stringify(await ev(() => ({ mode: document.body.dataset.mode, driving: !!window.__scene.drive.car })))); await shot('6_wreck');
  // 5. roll-over: the kei car flicked hard at speed
  console.log('roll', JSON.stringify(await ev(() => { const S = window.__scene, D = S.drive; window.put('dusty kei car', 75, -88, 0); let g = 0; while (window.kmh() < 88 && D.state.z < 20 && g++ < 400) D.sim(0.05, { gas: 1 }); D.sim(0.8, { steer: 1, gas: 0.4 }); return { mode: D.state.mode, phi: +D.state.phi.toFixed(2) }; }))); await shot('7_rolling');
  console.log('settled', JSON.stringify(await ev(() => { const D = window.__scene.drive; D.sim(4, {}); return { mode: D.state.mode, phi: +D.state.phi.toFixed(2), stuck: +D.state.stuckT.toFixed(1), hp: Math.round(D.car.userData.hp), flipBtn: !document.querySelector('#drivehud .flip').hidden }; }))); await shot('8_on_side');
  console.log('flipped', JSON.stringify(await ev(() => { const D = window.__scene.drive; D.flip(); D.sim(1.5, {}); return { mode: D.state.mode }; })));
  // 6. pedestrians: drive along the sidewalk at speed
  console.log('peds', JSON.stringify(await ev(() => { const S = window.__scene, D = S.drive, P = S.people.list; window.put('red hatch', 81.2, -70, 0); let dives = 0, hits = 0, dead = 0; const seen = new Set(); for (let t = 0; t < 9; t += 0.05) { for (let k = 0; k < 3; k++) { D.sim(1 / 60, { gas: t < 3 ? 1 : 0.5 }); S.peopleTick(1 / 60); } D.state.x += (81.2 - D.state.x) * 0.2; for (const q of P) { if (q.st === 'dive' && !seen.has(q)) { seen.add(q); dives++; } if (q.st === 'fly' && !q._c) { q._c = 1; hits++; } if (q.st === 'dead' && !q._d) { q._d = 1; dead++; } } } return { dives, hits, dead, states: P.filter((q) => q.active).map((q) => q.st).join(','), hp: Math.round(D.car.userData.hp) }; }))); await shot('9_after_sidewalk');
  console.log('errors', errs.length, errs.slice(0, 4).join(' || ')); await b.close(); })();
