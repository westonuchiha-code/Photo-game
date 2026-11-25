// a person between the car and a wall: drive at them toward the building line, slow and fast, forward and reversing
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 400, height: 300 } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message + (e.stack || '').split('\n')[1]));
  await p.goto(process.argv[2], { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(800);
  const r = await p.evaluate(() => { window.__loadingHold = true; const S = window.__scene, D = S.drive, st = D.state, areas = D.areas, P = S.people.list, out = [];
    const inA = (x, z, e = 0.06) => areas.some((a) => a.y0 === undefined && x >= a.minX - e && x <= a.maxX + e && z >= a.minZ - e && z <= a.maxZ + e);
    for (const [kmh, rev, name] of [[10, 0, 'cab'], [30, 0, 'cab'], [60, 0, 'cab'], [100, 0, 'blue coupe'], [10, 1, 'pickup'], [35, 1, 'pickup'], [60, 0, 'pickup'], [100, 0, 'cab']]) { let tried = 0, carOut = 0, pedOut = 0, carOutMax = 0, pfMax = 0;
      for (const q of P.filter((q) => q.active).slice(0, 8)) { q.st = 'walk'; q.t = 0; q.y = 0; const m = q.mesh.position;
        // which way is the nearest wall from this person? step outwards until the ground stops
        let dir = null, dist = 9; for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let t = 0.5; t < dist; t += 0.25) if (!inA(m.x + d[0] * t, m.z + d[1] * t, 0)) { dist = t; dir = d; break; }
        if (!dir) continue; let run = 0; for (let t = 1; t <= 16; t += 0.5) { if (!inA(m.x - dir[0] * t, m.z - dir[1] * t, 0)) break; run = t; } if (run < 6) continue; tried++;
        const c = D.cars.find((k) => k.userData.driveName === name); if (D.car) D.exit(); const h = Math.atan2(dir[0], dir[1]) + (rev ? Math.PI : 0), x = m.x - dir[0] * (run - 2.6), z = m.z - dir[1] * (run - 2.6); c.position.set(x, 0, z); c.rotation.set(0, h, 0); c.userData.hp = c.userData.hd.hpMax; c.userData.wreck = false; D.syncCols(c); D.enter(c); S.setMode('drive'); for (let k = 0; k < 130; k++) D.update(1 / 60);
        st.x = x; st.z = z; st.h = h; st.vx = dir[0] * kmh / 3.6; st.vz = dir[1] * kmh / 3.6; st.mode = 'wheels'; st.r = 0; let co = 0, po = 0, pf = 0;
        for (let f = 0; f < 240; f++) { D.force = rev ? { brake: 1 } : { gas: 1 }; D.update(1 / 60); D.force = null; S.peopleTick(1 / 60); if (!D.car) break; const u = D.car.userData, s = Math.sin(st.h), cc = Math.cos(st.h);
          for (const [lx, lz] of [[u.half.x, u.half.zF], [-u.half.x, u.half.zF], [u.half.x, u.half.zR], [-u.half.x, u.half.zR], [0, 0]]) { const X = st.x + lx * cc + lz * s, Z = st.z - lx * s + lz * cc; if (!inA(X, Z, 0.3)) { co = 1; let bd = 1e9; for (const a of areas) bd = Math.min(bd, Math.hypot(X - Math.max(a.minX, Math.min(a.maxX, X)), Z - Math.max(a.minZ, Math.min(a.maxZ, Z)))); carOutMax = Math.max(carOutMax, bd); } }
          if (!inA(m.x, m.z, 0.15)) pf++; }
        po = pf > 3 ? 1 : 0; pfMax = Math.max(pfMax, pf); carOut += co; pedOut += po; }
      out.push({ kmh, rev, car: name, tried, carThroughWall: carOut, carOutMax: +carOutMax.toFixed(2), personThroughWall: pedOut, framesOut: pfMax }); }
    return out; });
  for (const row of r) console.log(JSON.stringify(row)); console.log('errors', errs.length, errs.slice(0, 3).join(' | ')); await b.close(); })();
