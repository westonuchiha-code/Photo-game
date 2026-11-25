// walk the links between the areas and poke the moving things in Old Town South
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 412, height: 800 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  await p.goto(process.argv[2], { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(1000);
  const ev = (f, a) => p.evaluate(f, a); const go = async (x, z, want) => { await ev(([x, z]) => { const S = window.__scene; S.walk.position.set(x, 0, z); S.walk.apply(); }, [x, z]); await p.waitForFunction((w) => window.__scene.area === w && !window.__scene.busy, want, { timeout: 120000, polling: 300 }); await p.waitForTimeout(800); const r = await ev(() => { const S = window.__scene; return { area: S.area, at: [+S.walk.position.x.toFixed(1), +S.walk.position.z.toFixed(1)], npcs: S.npcs.length }; }); console.log(JSON.stringify(r)); };
  await go(55.5, 2, 'south');          // Midtown -> the lot
  for (const [x, z, what] of [[26, -10.5, 'tire shop doors'], [24, -34.5, 'grocery doors'], [50.6, 5.6, 'scooter'], [52, -1, 'apartments']]) { await ev(([x, z]) => { const S = window.__scene; S.walk.position.set(x, 0, z); S.walk.apply(); }, [x, z]); await p.waitForTimeout(1500); console.log(what, 'ok, errors', errs.length); }
  // talk to someone standing in the lot
  console.log('talk', JSON.stringify(await ev(async () => { const S = window.__scene, q = S.npcs[0]; S.talk.open(q.who, S.area); document.querySelector('#talk .topics button:nth-child(2)').click(); const t = document.querySelector('#talk .log').textContent; S.talk.close(); return { name: q.who.name, said: t.slice(0, 150) }; })));
  await go(8.5, 8.5, 'old');           // the lot -> the square
  console.log('talk', JSON.stringify(await ev(async () => { const S = window.__scene, q = S.npcs[1]; S.talk.open(q.who, S.area); document.querySelector('#talk .topics button:nth-child(3)').click(); const t = document.querySelector('#talk .log').textContent; S.talk.close(); return { name: q.who.name, said: t.slice(0, 150) }; })));
  await go(8.9, 8.5, 'south');         // back
  await go(65.6, 2, 'west');           // and on to Midtown
  console.log('errors', errs.length, errs.slice(0, 4).join(' || ')); await b.close(); })();
