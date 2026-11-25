const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 412, height: 800 } }); p.on('pageerror', (e) => console.log('ERR', e.message));
  for (const ss of process.argv.slice(4)) { await p.goto(process.argv[2] + '?area=' + process.argv[3] + '&ss=' + ss, { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(1500);
    const out = []; for (const [x, z] of [[20, 3], [26, -8], [40, -5], [50, -20], [30, -30], [46, -40], [55, 5], [14, 8.5]]) { let worst = 0, wt = 0; for (const yaw of [0, 1.57, 3.14, 4.71]) { const r = await p.evaluate(async ([x, z, yaw]) => { const S = window.__scene; S.walk.position.set(x, 0, z); S.walk.yaw = yaw; S.walk.pitch = 0; S.walk.apply(); await new Promise((r) => setTimeout(r, 1500)); const st = S.stats(); return [st.calls, Math.round(st.tris / 1000)]; }, [x, z, yaw]); if (r[0] > worst) { worst = r[0]; wt = r[1]; } } out.push(`${x},${z}:${worst}d/${wt}k`); }
    console.log('scale', ss, out.join('  ')); }
  await b.close(); })();
