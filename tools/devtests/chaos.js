// chaos run: random hard driving in an area, checking every frame that the car is where a car can be
const { chromium } = require('playwright');
(async () => { const [, , url, area = 'west', secs = '240', seed = '1'] = process.argv; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 400, height: 300 } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message + (e.stack || '').split('\n')[1]));
  await p.goto(url + (url.includes('?') ? '&' : '?') + 'area=' + area, { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(800);
  const r = await p.evaluate(([secs, seed]) => { window.__loadingHold = true; window.__oldEdge = location.search.includes('old=1'); const S = window.__scene, D = S.drive, st = D.state; let sd = seed * 7919 + 1; const rnd = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
    const areas = D.areas, inA = (x, z) => areas.some((a) => a.y0 === undefined && x >= a.minX - 0.06 && x <= a.maxX + 0.06 && z >= a.minZ - 0.06 && z <= a.maxZ + 0.06);
    const out = { frames: 0, outside: 0, outsideMax: 0, inWall: 0, nan: 0, wrecks: 0, tumbles: 0, pedsHit: 0, pedsDived: 0, samples: [], byCar: {}, topKmh: 0, stuck: 0 };
    const cols = D.colliders; let stillT = 0;
    const cars = D.cars.filter((c) => !c.userData.wreck); let ci = 0, car = null, inp = {}, tIn = 0, tCar = 0;
    const next = () => { if (D.car) D.exit(); const live = D.cars.filter((c) => !c.userData.wreck); if (!live.length) return false; car = live[ci++ % live.length]; car.userData.hp = car.userData.hd.hpMax; D.enter(car); S.setMode('drive'); for (let k = 0; k < 130; k++) D.update(1 / 60); tCar = 0; return true; };
    if (!next()) return out;
    for (let f = 0; f < secs * 60; f++) {
      if (tIn <= 0) { const m = rnd(); inp = m < 0.5 ? { gas: 1, steer: (rnd() - 0.5) * (rnd() < 0.6 ? 0.15 : 2) } : m < 0.65 ? { brake: 1, steer: (rnd() - 0.5) * 2 } : m < 0.78 ? { gas: 1, hand: true, steer: rnd() < 0.5 ? 1 : -1 } : m < 0.9 ? { gas: 1 } : { brake: 1 }; inp.steer = Math.max(-1, Math.min(1, inp.steer || 0)); tIn = 0.4 + rnd() * 2.6; }
      tIn -= 1 / 60; tCar += 1 / 60; D.force = inp; D.update(1 / 60); D.force = null; S.peopleTick(1 / 60); out.frames++;
      if (!D.car) { if (!next()) break; continue; }
      const u = D.car.userData; if (![st.x, st.z, st.h, st.vx, st.vz].every(Number.isFinite)) { out.nan++; break; }
      const kmh = Math.hypot(st.vx, st.vz) * 3.6; out.topKmh = Math.max(out.topKmh, kmh); if (st.mode === 'tumble') out.tumbles++;
      const s = Math.sin(st.h), c = Math.cos(st.h); let worst = 0;
      for (const [lx, lz] of [[u.half.x, u.half.zF], [-u.half.x, u.half.zF], [u.half.x, u.half.zR], [-u.half.x, u.half.zR], [0, 0]]) { const x = st.x + lx * c + lz * s, z = st.z - lx * s + lz * c; if (!inA(x, z)) { let bd = 1e9; for (const a of areas) { if (a.y0 !== undefined) continue; const dx = x - Math.max(a.minX, Math.min(a.maxX, x)), dz = z - Math.max(a.minZ, Math.min(a.maxZ, z)); bd = Math.min(bd, Math.hypot(dx, dz)); } worst = Math.max(worst, bd); } }
      if (worst > 0.25) { out.outside++; out.outsideMax = Math.max(out.outsideMax, worst); if (out.samples.length < 8 && (f % 30 === 0 || worst > 1)) out.samples.push({ t: +(f / 60).toFixed(1), car: u.driveName, x: +st.x.toFixed(1), z: +st.z.toFixed(1), h: +st.h.toFixed(2), out: +worst.toFixed(2), mode: st.mode, kmh: Math.round(kmh) }); }
      // centre inside a solid collider?
      for (const k of cols) { if (k.active === false || k.car || (k.y0 !== undefined && k.y0 > 1)) continue; const ins = k.type === 'circle' ? Math.hypot(st.x - k.x, st.z - k.z) < k.r * 0.5 : st.x > k.minX + 0.3 && st.x < k.maxX - 0.3 && st.z > k.minZ + 0.3 && st.z < k.maxZ - 0.3; if (ins) { out.inWall++; break; } }
      if (u.wreck || tCar > 45) { if (u.wreck) out.wrecks++; out.byCar[u.driveName] = (out.byCar[u.driveName] || 0) + 1; if (!next()) break; }
      stillT = kmh < 1 && inp.gas && !inp.brake && !inp.hand ? stillT + 1 / 60 : 0; if (stillT > 4) { out.stuck++; stillT = 0; const x0 = st.x, z0 = st.z; for (let k = 0; k < 150; k++) { D.force = { brake: 1 }; D.update(1 / 60); } D.force = null; if (Math.hypot(st.x - x0, st.z - z0) < 0.8 && st.mode === 'wheels' && !u.wreck) { out.trapped = (out.trapped || 0) + 1; if (out.samples.length < 8) out.samples.push({ trapped: 1, car: u.driveName, x: +st.x.toFixed(1), z: +st.z.toFixed(1), h: +st.h.toFixed(2) }); } tIn = 0; }
    }
    const P = S.people ? S.people.list : []; out.peds = P.filter((q) => q.active).map((q) => q.st[0]).join('');
    return out; }, [+secs, +seed]);
  console.log(area, JSON.stringify(r)); console.log('errors', errs.length, errs.slice(0, 3).join(' | ')); await b.close(); })();
