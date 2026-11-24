// layout checks for the phone area: nothing standing in a roadway; every alley opens into a back court; speed
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 900, height: 600 } }); p.on('pageerror', (e) => console.log('PAGEERR', e.message));
  await p.goto(process.argv[2], { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 });
  console.log(JSON.stringify(await p.evaluate(() => { const S = window.__scene, D = S.district.userData, xs = [75, 161, 245], zs = [-84, 0, 84], RH = 5;
    const inRoad = (x, z) => xs.some((q) => Math.abs(x - q) < RH - 0.2) || zs.some((q) => Math.abs(z - q) < RH - 0.2);
    const A = S.walk.areas, courts = A.filter((a) => a.maxX - a.minX > 34 && a.maxX - a.minX < 44 && a.maxZ - a.minZ > 34 && a.maxZ - a.minZ < 44);
    const alleys = A.filter((a) => { const w = Math.min(a.maxX - a.minX, a.maxZ - a.minZ), l = Math.max(a.maxX - a.minX, a.maxZ - a.minZ); return w < 4.2 && l > 16.5 && l < 18; });
    const touches = (a, c) => a.minX < c.maxX && a.maxX > c.minX && a.minZ < c.maxZ && a.maxZ > c.minZ;
    // an alley must not run through any building footprint
    const blocked = alleys.filter((a) => D.buildings.some((f) => a.minX < f.x1 - 0.05 && a.maxX > f.x0 + 0.05 && a.minZ < f.z1 - 0.05 && a.maxZ > f.z0 + 0.05));
    return { lampsInRoad: D.lampPosts.filter(([x, z]) => inRoad(x, z)).length, treesInRoad: D.treePosts.filter(([x, z]) => inRoad(x, z)).length, lamps: D.lampPosts.length, trees: D.treePosts.length, alleys: alleys.length, alleysNotReachingCourt: alleys.filter((a) => !courts.some((c) => touches(a, c))).length, which: alleys.filter((a) => !courts.some((c) => touches(a, c))).map((a) => [a.minX, a.maxX, a.minZ, a.maxZ].map((v) => +v.toFixed(1))), courtRects: courts.map((a) => [a.minX, a.maxX, a.minZ, a.maxZ].map((v) => +v.toFixed(1))), alleysBlockedByBuilding: blocked.length, courts: courts.length, walkSpeed: S.walk.speed, buildings: D.buildings.length }; })));
  await b.close(); })();
