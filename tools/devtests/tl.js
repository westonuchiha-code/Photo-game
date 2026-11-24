const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 960, height: 600 } }); const t0 = Date.now();
  p.on('console', (m) => { const t = m.text(); if (/^T |moving parts|playable|packs|quality|merge|stream|loading|start/i.test(t)) console.log(((Date.now() - t0) / 1000).toFixed(1) + 's', t.slice(0, 150)); });
  await p.goto(process.argv[2], { waitUntil: 'commit', timeout: 400000 });
  await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 500000, polling: 500 }); console.log('PLAYABLE', ((Date.now() - t0) / 1000).toFixed(1));
  console.log(JSON.stringify(await p.evaluate(() => { const S = window.__scene; let meshes = 0, vis = 0; S.scene.traverse((o) => { if (o.isMesh) meshes++; }); return { meshes, mem: S.renderer.info.memory, programs: S.renderer.info.programs.length }; })));
  await b.close(); })();
