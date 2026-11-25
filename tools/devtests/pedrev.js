// pedestrians against a car aimed straight at them, at several speeds: node pedtest.js <url>
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 412, height: 800 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  await p.goto(process.argv[2], { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(1500);
  for (const kmh of [8, 15, 35, 60]) { const r = await p.evaluate((kmh) => { const process_rev = true; const S = window.__scene, D = S.drive, P = S.people.list, c = D.cars[0], v = kmh / 3.6; if (!D.car) { D.enter(c); S.setMode('drive'); } const st = D.state; let dive = 0, hit = 0, dead = 0, down = 0, tried = 0, hp0 = c.userData.hp = c.userData.hd.hpMax;
      for (const q of P.filter((q) => q.active && q.st === 'walk').slice(0, 10)) { tried++; const m = q.mesh, tx = m.position.x, tz = m.position.z, h = 1.0; // come at them from 20 m away along a fixed line
        const dx = Math.sin(h), dz = Math.cos(h); let x = tx - dx * 20, z = tz - dz * 20, ev = '';
        for (let t = 0; t < 40 / v + 1; t += 1 / 60) { x += dx * v / 60; z += dz * v / 60; st.x = x; st.z = z; st.h = h + (process_rev ? Math.PI : 0); st.vx = dx * v; st.vz = dz * v; st.mode = 'wheels'; S.peopleTick(1 / 60); if (q.st === 'dive' && !ev) ev = 'dive'; if (q.st === 'fly' && ev !== 'hit') ev = 'hit'; }
        for (let t = 0; t < 2; t += 1 / 60) S.peopleTick(1 / 60);
        if (ev === 'dive') dive++; if (ev === 'hit') { hit++; if (q.st === 'dead' || q.dead) dead++; else down++; } }
      return { kmh, tried, dive, hit, dead, down, carHp: Math.round(hp0 - c.userData.hp), others: P.filter((q) => q.active).map((q) => q.st[0]).join('') }; }, kmh); console.log(JSON.stringify(r)); }

  
  console.log('errors', errs.length, errs.slice(0, 4).join(' || ')); await b.close(); })();
