const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 640, height: 400 } });
  await p.goto('http://localhost:8123/', { waitUntil: 'commit', timeout: 400000 });
  await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 400000, polling: 2000 });
  const r = await p.evaluate(() => { const S = window.__scene, by = {}; let tot = 0, n = 0; S.scene.traverse((o) => { if (!o.isInstancedMesh) return; const g = o.geometry, t = (g.index ? g.index.count : g.attributes.position.count) / 3 * o.count; let nm = []; for (let q = o; q && q !== S.scene; q = q.parent) if (q.name) nm.push(q.name); const k = nm.slice(0, 3).join('<') || '?'; if (!o.boundingSphere) o.computeBoundingSphere(); by[k] = by[k] || { meshes: 0, inst: 0, tris: 0, rad: 0, fc: o.frustumCulled }; by[k].meshes++; by[k].inst += o.count; by[k].tris += Math.round(t); by[k].rad = Math.max(by[k].rad, Math.round(o.boundingSphere.radius)); tot += t; n++; });
    return { n, tot: Math.round(tot), top: Object.entries(by).sort((a, b) => b[1].tris - a[1].tris).slice(0, 28).map(([k, v]) => `${k} | meshes ${v.meshes} inst ${v.inst} tris ${v.tris} rad ${v.rad} fc ${v.fc}`) }; });
  console.log(r.n, r.tot); console.log(r.top.join('\n')); await b.close(); })();
