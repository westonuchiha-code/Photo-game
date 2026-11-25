// staged hits: walls (fast / slow / at an angle / in reverse), poles and trees, people (forward and reverse)
const { chromium } = require('playwright');
(async () => { const [, , url] = process.argv; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 400, height: 300 } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message + (e.stack || '').split('\n')[1]));
  await p.goto(url, { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(800);
  const r = await p.evaluate(() => { window.__loadingHold = true; const S = window.__scene, D = S.drive, st = D.state, areas = D.areas, out = { walls: [], poles: [], peds: [] };
    const inA = (x, z) => areas.some((a) => a.y0 === undefined && x >= a.minX - 0.06 && x <= a.maxX + 0.06 && z >= a.minZ - 0.06 && z <= a.maxZ + 0.06);
    const put = (name, x, z, h) => { const c = D.cars.find((q) => q.userData.driveName === name); if (D.car) D.exit(); c.position.set(x, 0, z); c.rotation.set(0, h, 0); c.userData.hp = c.userData.hd.hpMax; c.userData.wreck && 0; D.syncCols(c); D.enter(c); S.setMode('drive'); for (let k = 0; k < 130; k++) D.update(1 / 60); st.x = x; st.z = z; st.h = h; st.vx = st.vz = st.r = 0; st.mode = 'wheels'; return c; };
    const run = (secs, inp) => { let maxOut = 0, top = 0; for (let f = 0; f < secs * 60; f++) { D.force = inp; D.update(1 / 60); D.force = null; S.peopleTick(1 / 60); top = Math.max(top, Math.hypot(st.vx, st.vz) * 3.6); const u = D.car && D.car.userData; if (!u) break; const s = Math.sin(st.h), c = Math.cos(st.h); for (const [lx, lz] of [[u.half.x, u.half.zF], [-u.half.x, u.half.zF], [u.half.x, u.half.zR], [-u.half.x, u.half.zR]]) { const x = st.x + lx * c + lz * s, z = st.z - lx * s + lz * c; if (!inA(x, z)) maxOut = Math.max(maxOut, 1); } } return { maxOut, top: Math.round(top) }; };
    // walls: the street x = 161.x runs north-south; a building line is east of it. Aim at it from the road.
    for (const [name, speedSecs, ang, rev] of [['cab', 1.2, 90, 0], ['cab', 3.5, 90, 0], ['cab', 3.5, 45, 0], ['cab', 3.5, 15, 0], ['cab', 2.5, 90, 1], ['pickup', 3.5, 90, 0], ['mint kei car', 3.5, 60, 0], ['blue coupe', 4.5, 90, 0], ['blue coupe', 3, 30, 1]]) {
      const h = (ang * Math.PI / 180) + (rev ? Math.PI : 0), c = put(name, 150, 20, 0); st.h = h; const hp0 = c.userData.hp; const a = run(speedSecs + 2.5, rev ? { brake: 1 } : { gas: 1 }); const b2 = run(1.5, {});
      out.walls.push({ car: name, ang, rev, top: a.top, hpLost: Math.round(hp0 - c.userData.hp), endKmh: Math.round(Math.hypot(st.vx, st.vz) * 3.6), through: a.maxOut || b2.maxOut, mode: st.mode, x: +st.x.toFixed(1), z: +st.z.toFixed(1) }); }
    // poles and trees: thin round things near the road
    const thin = D.colliders.filter((k) => k.type === 'circle' && !k.car && k.r < 0.6 && k.active !== false && inA(k.x, k.z)); out.thin = thin.length;
    let n = 0; for (const k of thin) { if (n >= 6) break; let best = null; for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { let ok = true; for (let t = 3; t <= 22; t += 1) if (!inA(k.x + d[0] * t, k.z + d[1] * t)) { ok = false; break; } if (ok) { best = d; break; } } if (!best) continue;
      const kmhT = [25, 60, 100][n % 3], x = k.x + best[0] * 20, z = k.z + best[1] * 20, h = Math.atan2(-best[0], -best[1]); const c = put(['cab', 'pickup', 'mint kei car'][n % 3], x, z, h); const hp0 = c.userData.hp; st.vx = Math.sin(h) * kmhT / 3.6; st.vz = Math.cos(h) * kmhT / 3.6; const a = run(2.2, { gas: 0.3 });
      const past = (st.x - k.x) * Math.sin(h) + (st.z - k.z) * Math.cos(h); out.poles.push({ r: +k.r.toFixed(2), kmh: kmhT, hpLost: Math.round(hp0 - c.userData.hp), pastBy: +past.toFixed(1), side: +(((st.x - k.x) * Math.cos(h) - (st.z - k.z) * Math.sin(h))).toFixed(1), endKmh: Math.round(Math.hypot(st.vx, st.vz) * 3.6), mode: st.mode }); n++; }
    // people: forward and in reverse, slow and fast
    const P = S.people.list;
    for (const [kmh, rev] of [[12, 0], [40, 0], [80, 0], [12, 1], [35, 1]]) { let tried = 0, dive = 0, hit = 0, dead = 0, shoved = 0;
      for (let i = 0; i < 6; i++) { const q = P.find((q) => q.active && q.st === 'walk' && !q._used); if (!q) break; q._used = 1; tried++; const m = q.mesh.position, hh = q.h, fx = Math.sin(hh), fz = Math.cos(hh); const h = rev ? hh + Math.PI : hh; const c = put('red hatch', m.x - fx * 14, m.z - fz * 14, h); st.vx = fx * kmh / 3.6; st.vz = fz * kmh / 3.6; let d0 = 0, f0 = 0; const x0 = m.x, z0 = m.z;
        for (let f = 0; f < 200; f++) { D.force = rev ? { brake: 0.6 } : { gas: 0.5 }; D.update(1 / 60); D.force = null; S.peopleTick(1 / 60); st.x += ((m.x - fx * 0) - st.x) * 0; if (q.st === 'dive') d0 = 1; if (q.st === 'fly') f0 = 1; }
        dive += d0; hit += f0; if (q.st === 'dead' || q.dead && f0) dead++; if (!d0 && !f0 && Math.hypot(m.x - x0, m.z - z0) > 0.5) shoved++; }
      out.peds.push({ kmh, rev, tried, dive, hit, dead, moved: shoved }); }
    return out; });
  for (const k of Object.keys(r)) { if (Array.isArray(r[k])) { console.log(k); for (const row of r[k]) console.log('  ', JSON.stringify(row)); } else console.log(k, r[k]); }
  console.log('errors', errs.length, errs.slice(0, 3).join(' | ')); await b.close(); })();
