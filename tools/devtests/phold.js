// the old town area in the built file: arrive from Midtown on foot, walk about (incl. down into the mall), go back
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 412, height: 800 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const errs = [], fails = new Set();
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); if (/^travel |^area /.test(m.text())) console.log('   ', m.text()); }); p.on('requestfailed', (r) => fails.add(r.url().split('/').pop().slice(0, 50)));
  await p.goto('file://' + path.resolve(process.argv[2]), { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(1500);
  const settle = async () => { await p.waitForFunction(() => !window.__scene.busy, null, { timeout: 200000, polling: 300 }); await p.waitForTimeout(2500); };
  const at = async (x, z, yaw, gy) => p.evaluate(([x, z, yaw, gy]) => { const S = window.__scene; S.walk.position.set(x, 0, z); S.walk.yaw = yaw; if (gy !== undefined) S.walk.gy = gy; S.walk.apply(); return { area: S.area, y: +S.camera.position.y.toFixed(2) }; }, [x, z, yaw, gy]);
  await at(55, 0, Math.PI / 2); await p.waitForTimeout(1200); await settle(); console.log('arrived', JSON.stringify(await p.evaluate(() => { const S = window.__scene; return { ...S.stats(), x: +S.walk.position.x.toFixed(1), z: +S.walk.position.z.toFixed(1) }; })));
  await p.screenshot({ path: 'ph/old_arrive.jpg', type: 'jpeg', quality: 85, timeout: 300000 });
  console.log('mall hall', JSON.stringify(await at(2, 36, 0, -4)), 'plaza', JSON.stringify(await at(-25, 0, 0, 0)), 'street', JSON.stringify(await at(-26.5, 30, Math.PI, 0)));
  await p.waitForTimeout(2500); await p.screenshot({ path: 'ph/old_street.jpg', type: 'jpeg', quality: 85, timeout: 300000 });
  await at(8.8, 8.6, -Math.PI / 2, 0); await p.waitForTimeout(1200); await settle(); console.log('back', JSON.stringify(await p.evaluate(() => { const S = window.__scene; return { ...S.stats(), x: +S.walk.position.x.toFixed(1) }; })));
  console.log('errors', errs.length, errs.slice(0, 4).join(' || ')); console.log('failed requests', fails.size, [...fails].slice(0, 8).join(' ')); await b.close(); })();
