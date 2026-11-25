// driving numbers per car: node drv.js <url>
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 640, height: 400 } }); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  await p.goto(process.argv[2], { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(1000);
  const res = await p.evaluate(() => { const S = window.__scene, D = S.drive, st = D.state, out = [], G = 9.81;
    const put = (c, x, z, h) => { if (D.car) D.exit(); c.position.set(x, 0, z); c.rotation.set(0, h, 0); c.userData.hp = c.userData.hd.hpMax; if (c.userData.dyn) { c.userData.dyn.vx = c.userData.dyn.vz = c.userData.dyn.w = 0; } D.syncCols(c); D.enter(c); S.setMode('drive'); };
    const kmh = () => Math.hypot(st.vx, st.vz) * 3.6, upTo = (v, zLim = 60) => { let g = 0; while (kmh() < v && st.z < zLim && g++ < 600) D.sim(0.05, { gas: 1 }); };
    // hold an input for `secs`, sampling: peak yaw rate (deg/s), peak sideways g, peak rear slip (deg), heading change, mode
    const hold = (secs, inp) => { const h0 = st.h; let r = 0, g = 0, sl = 0; for (let t = 0; t < secs; t += 0.05) { D.sim(0.05, inp); r = Math.max(r, Math.abs(st.r)); g = Math.max(g, Math.abs(st.aLat) / G); sl = Math.max(sl, st.slip); } return { yaw: Math.round(r * 57.3), g: +g.toFixed(2), slip: Math.round(sl * 57.3), dh: Math.round((st.h - h0) * 57.3), v: Math.round(kmh()), mode: st.mode }; };
    for (const c of D.cars.slice(0, 6)) { const r = { car: c.userData.driveName, cls: c.userData.hd.cls + '/' + c.userData.hd.drive };
      put(c, 75, -88, 0); let t = 0, t100 = null, t60 = null; while (t < 14 && st.z < 70) { D.sim(0.1, { gas: 1 }); t += 0.1; if (t60 === null && kmh() >= 60) t60 = +t.toFixed(1); if (t100 === null && kmh() >= 100) t100 = +t.toFixed(1); } r.t60 = t60; r.t100 = t100; r.top = Math.round(c.userData.hd.vmax * 3.6);
      put(c, 75, -88, 0); upTo(60); const zb = st.z; let tb = 0; while (kmh() > 1 && tb < 6) { D.sim(0.05, { brake: 1 }); tb += 0.05; } r.brake60 = +(st.z - zb).toFixed(1) + 'm';
      put(c, 75, -88, 0); upTo(30); r.turn30 = hold(0.7, { gas: 0.4, steer: 1 });
      put(c, 75, -88, 0); upTo(60); r.turn60 = hold(0.7, { gas: 0.4, steer: 1 });
      put(c, 75, -88, 0); upTo(90, 10); r.turn90 = hold(0.6, { gas: 0.4, steer: 1 });
      put(c, 75, -88, 0); upTo(60); r.hand60 = hold(0.9, { steer: 1, hand: true });
      put(c, 75, -88, 0); upTo(20); r.power20 = hold(1.2, { gas: 1, steer: 1 });
      put(c, 75, -88, 0); upTo(70, 60); const hp0 = c.userData.hp; { let g = 0; while (st.z < 100 && kmh() > 20 && g++ < 200) D.sim(0.05, { gas: 1 }); } D.sim(0.5, {}); r.crash = Math.round(hp0 - c.userData.hp) + ' of ' + c.userData.hd.hpMax + ' at z ' + Math.round(st.z);
      out.push(r); c.userData.hp = c.userData.hd.hpMax; }
    D.exit(); S.setMode('walk'); return out; });
  for (const r of res) console.log(JSON.stringify(r).replace(/"/g, '')); console.log('errors', errs.length, errs.slice(0, 3).join(' || ')); await b.close(); })();
