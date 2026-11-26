// walkers and the things on the pavement: walk every block's ring at several lanes, with and without side-stepping,
// and count the steps on which a walker's body (0.22 m) is inside something that stands there
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 412, height: 800 } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  for (const area of ['west', 'east']) { await p.goto(process.argv[2] + '?area=' + area, { waitUntil: 'commit', timeout: 300000 }); await p.waitForFunction(() => window.__scene && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 }); await p.waitForTimeout(800);
    console.log(area, JSON.stringify(await p.evaluate((area) => { window.__loadingHold = true; const S = window.__scene, xs = area === 'west' ? [75, 161, 245] : [245, 329, 413], zs = [-84, 0, 84]; S.sidestep(100, 0, 0); const O = S.obstacles, R = 0.22;
      const inside = (x, z) => O.some((k) => (k.r !== undefined ? Math.hypot(k.x - x, k.z - z) < k.r + R : Math.abs(k.x - x) < k.hx + R && Math.abs(k.z - z) < k.hz + R));
      const dist = (x, z) => Math.min(...xs.map((v) => Math.abs(x - v)), ...zs.map((v) => Math.abs(z - v)));
      const out = { obstacles: O.length, steps: 0, hitPlain: 0, hitSteer: 0, offPavement: 0, maxSide: 0 }, stepLen = 0.05, dt = stepLen / 1.3;
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (const lane of [0, 0.3, 0.6]) for (const dir of [1, -1]) { const o = 6.05 + lane, x0 = xs[i] + o, x1 = xs[i + 1] - o, z0 = zs[j] + o, z1 = zs[j + 1] - o, w = x1 - x0, d = z1 - z0, per = 2 * (w + d); let sx = 0;
        for (let n = 0; n < per / stepLen; n++) { const u = dir > 0 ? n * stepLen : per - n * stepLen; let x, z, h; if (u < w) { x = x0 + u; z = z0; h = Math.PI / 2; } else if (u < w + d) { x = x1; z = z0 + (u - w); h = 0; } else if (u < 2 * w + d) { x = x1 - (u - w - d); z = z1; h = -Math.PI / 2; } else { x = x0; z = z1 - (u - 2 * w - d); h = Math.PI; } if (dir < 0) h += Math.PI;
          out.steps++; if (inside(x, z)) out.hitPlain++; const want = S.sidestep(x, z, h); sx += (want - sx) * Math.min(1, dt * 2.6); const px = x + Math.cos(h) * sx, pz = z - Math.sin(h) * sx; if (inside(px, pz)) out.hitSteer++; const dd = dist(px, pz); if (dd < 5.05 || dd > 6.95) out.offPavement++; out.maxSide = Math.max(out.maxSide, Math.abs(sx)); } }
      out.maxSide = +out.maxSide.toFixed(2); return out; }, area))); }
  console.log('errors', errs.length, errs.slice(0, 3).join(' | ')); await b.close(); })();
