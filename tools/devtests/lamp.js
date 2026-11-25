const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 800, height: 412 } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message + (e.stack || '').split('\n')[1]));
  await p.goto(process.argv[2], { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => { const S = window.__scene, D = S.drive, st = D.state, out = [];
    const lamps = D.colliders.filter((k) => k.knock && k.r === 0.18), signs = D.colliders.filter((k) => k.knock && k.r === 0.12); out.push({ lamps: lamps.length, signs: signs.length });
    const inA = (x, z) => D.areas.some((a) => x >= a.minX && x <= a.maxX && z >= a.minZ && z <= a.maxZ);
    const go = (k, kmh, name) => { let best = null; for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { let ok = true; for (let t = 1; t <= 14; t++) if (!inA(k.x + d[0] * t, k.z + d[1] * t) || D.colliders.some((q) => q !== k && !q.car && q.type === 'circle' && Math.hypot(q.x - (k.x + d[0] * t), q.z - (k.z + d[1] * t)) < 1.6)) { ok = false; break; } if (ok) { best = d; break; } } if (!best) return null;
      const c = D.cars.find((q) => q.userData.driveName === name); if (D.car) D.exit(); const h = Math.atan2(-best[0], -best[1]), x = k.x + best[0] * 12, z = k.z + best[1] * 12; c.position.set(x, 0, z); c.rotation.set(0, h, 0); c.userData.hp = c.userData.hd.hpMax; D.syncCols(c); D.enter(c); S.setMode('drive'); for (let i = 0; i < 130; i++) D.update(1 / 60);
      st.x = x; st.z = z; st.h = h; st.vx = Math.sin(h) * kmh / 3.6; st.vz = Math.cos(h) * kmh / 3.6; st.r = 0; const hp0 = c.userData.hp; for (let i = 0; i < 90; i++) { D.force = { gas: 0.4 }; D.update(1 / 60); } D.force = null;
      return { kmh, car: name, down: k.active === false, hpLost: Math.round(hp0 - c.userData.hp), endKmh: Math.round(Math.hypot(st.vx, st.vz) * 3.6), past: +(((st.x - k.x) * Math.sin(h) + (st.z - k.z) * Math.cos(h))).toFixed(1) }; };
    let n = 0; for (const k of lamps) { if (n >= 4) break; const r = go(k, [12, 30, 60, 100][n], ['cab', 'cab', 'pickup', 'blue coupe'][n]); if (r) { out.push(r); n++; } }
    if (signs[0]) out.push({ sign: go(signs[0], 40, 'cab') });
    return out; });
  for (const row of r) console.log(JSON.stringify(row)); await p.waitForTimeout(2500);
  await p.evaluate(() => { const S = window.__scene, s = S.drive.state; s.lookYaw = 0; s.lookPitch = 0.3; s.lookT = 99; }); await p.waitForTimeout(1200); await p.screenshot({ path: 'cm/lamp.jpg', type: 'jpeg', quality: 90 });
  console.log('errors', errs.length, errs.slice(0, 3).join(' | ')); await b.close(); })();
