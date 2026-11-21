// Driving: third-person, arcade-sim. The car feels heavy (mass, weight transfer, slow-building steering, body roll on
// springs) but forgiving: grip is generous, the handbrake/drift button kicks the tail out and holding a drift charges a
// mini-turbo (blue -> orange -> pink) that fires when you let go, kart-style. A small hop starts each drift.
//   const drive = makeDriver({ scene, camera, areas, colliders, ground })
//   drive.addCar(carGroup, { name })    register a drivable car (a carbody.js car)
//   drive.nearest(pos)                   -> car within reach of a walker, or null
//   drive.enter(car) / drive.exit() -> { x, z, yaw }    drive.update(dt)    drive.active
import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export function makeDriver({ scene, camera, areas, colliders, ground }) {
  const cars = []; let car = null;           // the car being driven
  const keys = new Set();
  addEventListener('keydown', (e) => { keys.add(e.code); if (api.active && ['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault(); });
  addEventListener('keyup', (e) => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());

  // ---- collider grid (built once, 8 m cells) so the car only tests what's nearby
  const CELL = 8, grid = new Map();
  const cellKey = (i, j) => i * 100003 + j;
  for (const c of colliders) {
    if (c.y0 !== undefined && c.y0 > 1.0) continue;    // upper floors
    const [x0, x1, z0, z1] = c.type === 'circle' ? [c.x - c.r, c.x + c.r, c.z - c.r, c.z + c.r] : [c.minX, c.maxX, c.minZ, c.maxZ];
    if (x1 - x0 > 400 || z1 - z0 > 400) continue;
    for (let i = Math.floor(x0 / CELL); i <= Math.floor(x1 / CELL); i++) for (let j = Math.floor(z0 / CELL); j <= Math.floor(z1 / CELL); j++) {
      const k = cellKey(i, j); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(c);
    }
  }
  const nearCols = (x, z) => { const out = new Set(); const i0 = Math.floor(x / CELL), j0 = Math.floor(z / CELL); for (let i = i0 - 1; i <= i0 + 1; i++) for (let j = j0 - 1; j <= j0 + 1; j++) { const l = grid.get(cellKey(i, j)); if (l) for (const c of l) out.add(c); } return out; };
  const inArea = (x, z) => areas.some((a) => a.y0 === undefined && x >= a.minX && x <= a.maxX && z >= a.minZ && z <= a.maxZ);

  // ---- HUD + touch controls
  const hud = document.createElement('div'); hud.id = 'drivehud';
  hud.innerHTML = `<div class="spd"><b>0</b><i>km/h</i></div><div class="charge"><i></i></div><div class="tip help-mouse"><b>W/S</b> gas / brake · <b>A/D</b> steer · <b>Space</b> drift (hold + let go to boost) · <b>E</b> get out · hold <b>C</b> look back</div>
    <div class="pads"><button data-k="left">◀</button><button data-k="right">▶</button><span></span><button data-k="drift">DRIFT</button><button data-k="brake">BRAKE</button><button data-k="gas">GAS</button></div>`;
  const css = document.createElement('style');
  css.textContent = `#drivehud{position:fixed;inset:0;pointer-events:none;display:none;font-family:system-ui,sans-serif;color:#fff}
  body[data-mode=drive] #drivehud{display:block} body[data-mode=drive] .hud .card,body[data-mode=drive] .hud .views{display:none}
  #drivehud .spd{position:absolute;right:22px;bottom:calc(26px + env(safe-area-inset-bottom,0px));text-align:right;text-shadow:0 2px 6px #000a}
  #drivehud .spd b{font:800 46px/1 system-ui;letter-spacing:-1px;font-variant-numeric:tabular-nums} #drivehud .spd i{font-style:normal;opacity:.8;margin-left:4px}
  #drivehud .charge{position:absolute;right:22px;bottom:calc(84px + env(safe-area-inset-bottom,0px));width:120px;height:7px;border-radius:4px;background:#0006;overflow:hidden;opacity:0;transition:opacity .2s}
  #drivehud .charge i{display:block;height:100%;width:0;background:#4ab0ff}
  #drivehud .tip{position:absolute;left:50%;transform:translateX(-50%);top:64px;background:#0008;padding:8px 12px;border-radius:10px;font-size:13px;max-width:60vw}
  #drivehud .pads{display:none} @media (pointer:coarse){#drivehud .tip{display:none}
  #drivehud .pads{display:grid;position:absolute;left:12px;right:12px;bottom:calc(16px + env(safe-area-inset-bottom,0px));grid-template-columns:72px 72px 1fr 72px 72px 84px;gap:10px;align-items:end}
  #drivehud .pads button{pointer-events:auto;height:72px;border-radius:16px;background:#0007;color:#fff;font-weight:700;font-size:15px;border:2px solid #fff4;touch-action:none}
  #drivehud .pads button.on{background:#fff4} #drivehud .pads [data-k=gas]{height:96px} #drivehud .spd{bottom:calc(120px + env(safe-area-inset-bottom,0px))} #drivehud .charge{bottom:calc(178px + env(safe-area-inset-bottom,0px))}}`;
  document.head.appendChild(css); document.body.appendChild(hud);
  const touch = { left: 0, right: 0, gas: 0, brake: 0, drift: 0 };
  hud.querySelectorAll('.pads button').forEach((b) => {
    const k = b.dataset.k; const on = (v) => (e) => { touch[k] = v; b.classList.toggle('on', !!v); e.preventDefault(); };
    b.addEventListener('touchstart', on(1), { passive: false }); b.addEventListener('touchend', on(0)); b.addEventListener('touchcancel', on(0));
    b.addEventListener('mousedown', on(1)); b.addEventListener('mouseup', on(0)); b.addEventListener('mouseleave', on(0));
  });
  const spdEl = hud.querySelector('.spd b'), chEl = hud.querySelector('.charge'), chBar = chEl.querySelector('i');

  // ---- engine sound: two detuned saws through a lowpass, pitch follows rpm; tyre squeal = filtered noise
  let au = null;
  function audio() {
    if (au) return au; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    const ctx = new AC(); const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; lp.connect(master);
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(); o1.type = 'sawtooth'; o2.type = 'square'; o1.connect(lp); const g2 = ctx.createGain(); g2.gain.value = 0.35; o2.connect(g2); g2.connect(lp); o1.start(); o2.start();
    const nb = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 3; const sq = ctx.createGain(); sq.gain.value = 0; ns.connect(bp); bp.connect(sq); sq.connect(ctx.destination); ns.start();
    return (au = { ctx, master, lp, o1, o2, sq });
  }

  // ---- skid marks: a pool of dark quads laid behind the rear wheels while sliding
  const SK = 600, skGeo = new THREE.PlaneGeometry(0.22, 1); skGeo.rotateX(-Math.PI / 2);
  const skMat = new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.62, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
  const skids = new THREE.InstancedMesh(skGeo, skMat, SK); skids.count = 0; skids.frustumCulled = false; scene.add(skids); let skI = 0;
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1), _p = new THREE.Vector3();
  const lastSk = [null, null];
  function skid(i, x, z, y) { const l = lastSk[i]; lastSk[i] = [x, z]; if (!l) return; const dx = x - l[0], dz = z - l[1], len = Math.hypot(dx, dz); if (len < 0.02 || len > 4) return; _q.setFromAxisAngle(UP, Math.atan2(dx, dz)); _p.set((x + l[0]) / 2, y + 0.016, (z + l[1]) / 2); _s.set(1, 1, len + 0.05); _m.compose(_p, _q, _s); skids.setMatrixAt(skI, _m); skI = (skI + 1) % SK; skids.count = Math.max(skids.count, skI); skids.instanceMatrix.needsUpdate = true; }
  // ---- boost flames / drift sparks: small additive sprites at the exhaust + rear tyres
  const glow = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, '#fff'); g.addColorStop(0.25, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const sparkMat = new THREE.SpriteMaterial({ map: glow, color: '#4ab0ff', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const sparks = []; for (let i = 0; i < 24; i++) { const s = new THREE.Sprite(sparkMat.clone()); s.visible = false; s.scale.setScalar(0.18); scene.add(s); sparks.push({ s, life: 0, v: new THREE.Vector3() }); }
  let spI = 0;
  function spark(p, color, v) { const o = sparks[spI]; spI = (spI + 1) % sparks.length; o.s.position.copy(p); o.s.material.color.set(color); o.s.visible = true; o.life = 0.25 + Math.random() * 0.15; o.v.copy(v); }

  // ---- driver state
  const S = { x: 0, z: 0, h: 0, vx: 0, vz: 0, r: 0, steer: 0, y: 0, roll: 0, rollV: 0, pitch: 0, pitchV: 0, hop: 0, hopV: 0,
    drift: 0, driftDir: 0, charge: 0, boost: 0, spin: 0, camH: 0, camD: 6.4, camMode: 0, shake: 0, aLong: 0, aLat: 0, gear: 1 };
  let headLight = null;

  function corners(x, z, h, sp) { const { half } = sp; const s = Math.sin(h), c = Math.cos(h); const pts = []; for (const [lx, lz] of [[half.x, half.zF], [-half.x, half.zF], [half.x, half.zR], [-half.x, half.zR], [half.x, 0], [-half.x, 0]]) pts.push([x + lx * c + lz * s, z - lx * s + lz * c]); return pts; }
  // push the car (as 3 circles along its axis) out of colliders; returns the deepest contact normal or null
  function collide() {
    const sp = car.userData; const W = sp.half.x * 0.98; const s = Math.sin(S.h), c = Math.cos(S.h); let hit = null;
    const cols = nearCols(S.x, S.z);
    for (const lz of [sp.half.zF - W, (sp.half.zF + sp.half.zR) / 2, sp.half.zR + W]) {
      const px = S.x + lz * s, pz = S.z + lz * c;
      for (const col of cols) {
        if (col.active === false || col.car === car) continue;
        let nx, nz, d, m;
        if (col.type === 'circle') { nx = px - col.x; nz = pz - col.z; d = Math.hypot(nx, nz); m = col.r + W; }
        else { const cx = clamp(px, col.minX, col.maxX), cz = clamp(pz, col.minZ, col.maxZ); nx = px - cx; nz = pz - cz; d = Math.hypot(nx, nz); m = W; if (d < 1e-5) { nx = 0; nz = 1; d = 0; } }
        if (d < m) { if (d > 1e-5) { nx /= d; nz /= d; } const pen = m - d; S.x += nx * pen; S.z += nz * pen; if (!hit || pen > hit.pen) hit = { nx, nz, pen }; }
      }
    }
    return hit;
  }
  function bump(nx, nz, hard) {
    const vn = S.vx * nx + S.vz * nz; if (vn >= 0) return;
    const e = 0.32; S.vx -= (1 + e) * vn * nx; S.vz -= (1 + e) * vn * nz; S.vx *= 0.82; S.vz *= 0.82;
    S.r += (Math.random() - 0.5) * Math.min(2, -vn * 0.12); S.shake = Math.min(1, S.shake + -vn * 0.06); S.drift = 0; S.charge = 0;
    if (hard && au) { const t = au.ctx.currentTime; au.master.gain.setTargetAtTime(0.02, t, 0.01); }
  }

  function input() {
    if (api.force) return { gas: 0, brake: 0, steer: 0, drift: false, ...api.force };
    const k = keys; const a = (...c) => c.some((q) => k.has(q));
    return {
      gas: Math.max(a('KeyW', 'ArrowUp') ? 1 : 0, touch.gas), brake: Math.max(a('KeyS', 'ArrowDown') ? 1 : 0, touch.brake),
      steer: (a('KeyA', 'ArrowLeft') || touch.left ? 1 : 0) - (a('KeyD', 'ArrowRight') || touch.right ? 1 : 0),
      drift: a('Space', 'ShiftLeft', 'ShiftRight') || !!touch.drift,
    };
  }

  function step(dt, inp) {
    const sp = car.userData.spec; const m = sp.mass;
    const fx = Math.sin(S.h), fz = Math.cos(S.h), lx = Math.cos(S.h), lz = -Math.sin(S.h);   // forward + left
    let vF = S.vx * fx + S.vz * fz, vL = S.vx * lx + S.vz * lz; const spd = Math.hypot(S.vx, S.vz);
    // power: P / v caps acceleration at speed (a heavy car pulls hard from rest, then fades), boost adds a shove
    const vmax = (sp.vmax || (20 + sp.power * 0.16)) * (S.boost > 0 ? 1.25 : 1);
    const aEng = Math.min(sp.grip0 || 5.2, (sp.power * 1000 * 0.85) / (m * Math.max(4, Math.abs(vF)))) * (1 - clamp(vF / vmax, 0, 1) ** 2);
    let aF = 0;
    if (inp.gas) { if (vF < -0.5) aF += 9 * inp.gas; else aF += aEng * inp.gas; }
    if (inp.brake) { if (vF > 0.5) aF -= 9.5 * inp.brake; else aF -= Math.min(4, aEng) * inp.brake * (vF > -9 ? 1 : 0); }
    if (S.boost > 0) { aF += 7; S.boost -= dt; }
    aF -= (0.0045 * vF * Math.abs(vF)) + (Math.abs(vF) > 0.05 ? Math.sign(vF) * 0.25 : 0);    // drag + rolling
    if (!inp.gas && !inp.brake && Math.abs(vF) < 0.4) vF *= 0.9;
    if (inp.drift && S.drift === 0 && Math.abs(vF) < 6) aF -= Math.sign(vF) * 4;            // handbrake at low speed just stops
    vF += aF * dt;
    // steering builds slowly and shrinks with speed (heavy at speed, nimble when parking)
    const maxSt = 0.58 / (1 + spd * 0.055);
    const stT = inp.steer * maxSt * (S.drift ? 1.25 : 1);
    S.steer = damp(S.steer, stT, inp.steer ? 5.5 : 8, dt);
    // drift: start on drift + steer at speed (with a hop), hold to charge, release to boost
    if (inp.drift && S.drift === 0 && vF > 9 && Math.abs(inp.steer) > 0) { S.drift = 1; S.driftDir = Math.sign(inp.steer); S.hopV = 2.4; S.charge = 0; }
    if (S.drift && (!inp.drift || vF < 5)) {
      if (S.charge > 0.8 && vF > 5) { S.boost = S.charge > 2.4 ? 1.6 : S.charge > 1.5 ? 1.1 : 0.7; S.shake = 0.3; }
      S.drift = 0; S.charge = 0;
    }
    const WB = sp.WB;
    let rT = (vF * Math.tan(S.steer)) / WB;                // the yaw rate the tyres ask for
    if (S.drift) { const lean = S.driftDir * (0.6 + 0.4 * (inp.steer * S.driftDir)); rT = S.driftDir * Math.max(0.55, Math.abs(rT)) * (0.75 + lean * 0.45) * Math.min(1, vF / 12) * 1.15; S.charge += dt * (1 + 0.6 * Math.max(0, inp.steer * S.driftDir)); }
    // grip limit: the tyres can only give ~0.95 g sideways; past that the car pushes wide
    const gLim = 9.3 * (sp.gripK || 1);
    const lim = (S.drift ? gLim * 2.6 : gLim) / Math.max(1, Math.abs(vF)); rT = clamp(rT, -lim, lim);
    S.r = damp(S.r, rT, S.drift ? 3.2 : 6.5, dt);
    S.h += S.r * dt;
    // lateral: tyres scrub sideways speed away (lots of grip normally, little in a drift) -> the slide angle
    const latK = S.drift ? 1.6 : (inp.drift ? 2.2 : 9);
    vL *= Math.exp(-latK * dt);
    // rotate velocity frame with the heading change so momentum carries (the slide)
    const fx2 = Math.sin(S.h), fz2 = Math.cos(S.h), lx2 = Math.cos(S.h), lz2 = -Math.sin(S.h);
    // keep the old world velocity, re-split it in the new frame, then apply the forward change + lateral scrub
    const wvx = fx * vF + lx * vL, wvz = fz * vF + lz * vL;
    let nF = wvx * fx2 + wvz * fz2, nL = wvx * lx2 + wvz * lz2;
    // forward tyres also pull the velocity round toward the heading (most of it when gripping)
    const pull = S.drift ? 0.9 : 6;
    const tot = Math.hypot(nF, nL); const ang = Math.atan2(nL, nF); const na = ang * Math.exp(-pull * dt);
    if (nF > -0.5) { nF = Math.cos(na) * tot; nL = Math.sin(na) * tot; }
    S.vx = fx2 * nF + lx2 * nL; S.vz = fz2 * nF + lz2 * nL;
    S.aLong = aF; S.aLat = vF * S.r;
    S.slip = Math.abs(nL) + (inp.brake && vF > 8 ? 2 : 0) + (inp.gas && vF < 6 && aEng > 4.5 ? 1.5 : 0);
    // move + collide (sub-stepped by the caller)
    const ox = S.x, oz = S.z;
    S.x += S.vx * dt; S.z += S.vz * dt;
    const hit = collide(); if (hit) bump(hit.nx, hit.nz, hit.pen > 0.05);
    // stay on the streets: every corner must stand on a drivable area; otherwise slide or bounce off the edge
    const ok = (x, z) => corners(x, z, S.h, car.userData).every(([a, b]) => inArea(a, b));
    if (!ok(S.x, S.z)) {
      if (ok(S.x, oz)) { S.z = oz; bump(0, Math.sign(S.vz) * -1, true); }
      else if (ok(ox, S.z)) { S.x = ox; bump(Math.sign(S.vx) * -1, 0, true); }
      else { S.x = ox; S.z = oz; S.h -= S.r * dt; S.r *= -0.3; S.vx *= -0.3; S.vz *= -0.3; S.shake = Math.min(1, S.shake + 0.3); S.drift = 0; }
    }
  }

  function pose(dt) {
    const u = car.userData, sp = u.spec;
    // suspension: each wheel finds its ground; the root sits at their mean, the body pitches/rolls from the
    // height difference plus the spring response to braking / cornering
    const s = Math.sin(S.h), c = Math.cos(S.h); const gh = u.wheels.map((w) => { const p = w.pivot.position; const lx = p.x, lz = p.z; return ground(S.x + lx * c + lz * s, S.z - lx * s + lz * c); });
    const yF = (gh[0] + gh[1]) / 2, yR = (gh[2] + gh[3]) / 2, yLft = (gh[1] + gh[3]) / 2, yRgt = (gh[0] + gh[2]) / 2;
    const yT = (yF + yR) / 2; S.y = damp(S.y, yT, 18, dt);
    const tp = Math.atan2(yR - yF, u.axF - u.axR), tr = Math.atan2(yLft - yRgt, 2 * Math.abs(u.wheels[0].pivot.position.x));
    // springs (critically-ish damped): pitch from longitudinal accel, roll from lateral
    const k = 60, d = 9;
    const pT = clamp(-S.aLong * 0.006, -0.05, 0.05), rT = clamp(S.aLat * 0.0055 * (sp.rollK || 1), -0.07, 0.07);
    S.pitchV += (k * (pT - S.pitch) - d * S.pitchV) * dt; S.pitch += S.pitchV * dt;
    S.rollV += (k * (rT - S.roll) - d * S.rollV) * dt; S.roll += S.rollV * dt;
    S.hopV -= 14 * dt; S.hop = Math.max(0, S.hop + S.hopV * dt); if (S.hop === 0) S.hopV = Math.max(0, S.hopV);
    car.position.set(S.x, S.y + S.hop, S.z); car.rotation.set(0, S.h, 0);
    u.body.rotation.set(tp + S.pitch, 0, tr + S.roll, 'YXZ');
    u.body.position.y = -Math.abs(S.roll) * 0.2;
    // wheels: steer the fronts, spin all by distance travelled, follow the ground
    const vF = S.vx * Math.sin(S.h) + S.vz * Math.cos(S.h);
    S.spin += (vF / sp.R) * dt * (S.drift ? 1.15 : 1);
    u.wheels.forEach((w, i) => { w.pivot.rotation.y = w.front ? S.steer * (S.drift ? 1.3 : 1) : 0; w.spin.rotation.x = S.spin; w.pivot.position.y = u.axY + clamp(gh[i] - S.y, -0.08, 0.12); });
    // lamps: brakes glow
    const braking = input().brake > 0;
    for (const t of u.lamps.tail) t.material.emissiveIntensity = braking ? 3.2 : 0.8;
    if (u.body.userData.siren) { const ph = (performance.now() / 260) | 0; u.body.userData.siren[0].material.emissiveIntensity = ph % 2 ? 3 : 0.3; u.body.userData.siren[1].material.emissiveIntensity = ph % 2 ? 0.3 : 3; }
  }

  const _cam = new THREE.Vector3(), _look = new THREE.Vector3();
  function chase(dt, snap) {
    const spd = Math.hypot(S.vx, S.vz);
    // the camera trails the direction of travel a little in drifts (so you see the slide), else the heading
    const vh = spd > 3 ? Math.atan2(S.vx, S.vz) : S.h;
    const want = S.camMode === 1 ? S.h + Math.PI : (S.drift ? S.h + wrapA(vh - S.h) * 0.55 : S.h);
    S.camH = snap ? want : S.camH + wrapA(want - S.camH) * (1 - Math.exp(-(S.drift ? 3.0 : 4.2) * dt));
    const u = car.userData.spec; const dist = (u.L * 0.75 + 3.4) + spd * 0.045 + (S.boost > 0 ? 0.8 : 0); const hgt = u.H + 1.05 + spd * 0.012;
    S.camD = snap ? dist : damp(S.camD, dist, 2.5, dt);
    _cam.set(S.x - Math.sin(S.camH) * S.camD, S.y + hgt, S.z - Math.cos(S.camH) * S.camD);
    if (snap) camera.position.copy(_cam); else camera.position.lerp(_cam, 1 - Math.exp(-10 * dt));
    if (S.shake > 0) { camera.position.x += (Math.random() - 0.5) * S.shake * 0.25; camera.position.y += (Math.random() - 0.5) * S.shake * 0.18; S.shake = Math.max(0, S.shake - dt * 2.5); }
    _look.set(S.x + Math.sin(S.h) * 2.2, S.y + u.H * 0.75, S.z + Math.cos(S.h) * 2.2);
    camera.lookAt(_look);
    const fov = 62 + Math.min(14, spd * 0.32) + (S.boost > 0 ? 6 : 0);
    if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = damp(camera.fov, fov, 3, dt); camera.updateProjectionMatrix(); }
  }

  function fx(dt) {
    const u = car.userData, s = Math.sin(S.h), c = Math.cos(S.h);
    const rear = u.wheels.filter((w) => !w.front);
    if (S.slip > 2.2 || S.drift) rear.forEach((w, i) => { const p = w.pivot.position; skid(i, S.x + p.x * c + p.z * s, S.z - p.x * s + p.z * c, S.y); }); else lastSk[0] = lastSk[1] = null;
    const col = S.charge > 2.4 ? '#ff5ad2' : S.charge > 1.5 ? '#ffa030' : '#4ab0ff';
    if (S.drift && S.charge > 0.8) for (const w of rear) { const p = w.pivot.position; _p.set(S.x + (p.x * 1.05) * c + (p.z - 0.3) * s, S.y + 0.1, S.z - (p.x * 1.05) * s + (p.z - 0.3) * c); spark(_p, col, new THREE.Vector3((Math.random() - 0.5) * 2, 1.5 + Math.random(), (Math.random() - 0.5) * 2)); }
    if (S.boost > 0) { const zR = u.half.zR; _p.set(S.x + (-u.half.x * 0.6) * c + (zR - 0.1) * s, S.y + u.spec.clr + 0.06, S.z - (-u.half.x * 0.6) * s + (zR - 0.1) * c); spark(_p, '#ffb040', new THREE.Vector3(-s * 3, 0.3, -c * 3)); }
    for (const o of sparks) if (o.s.visible) { o.life -= dt; o.s.position.addScaledVector(o.v, dt); o.v.y -= 6 * dt; o.s.material.opacity = Math.max(0, o.life * 3); if (o.life <= 0) o.s.visible = false; }
    chEl.style.opacity = S.drift ? 1 : 0; chBar.style.width = Math.min(100, (S.charge / 2.4) * 100) + '%'; chBar.style.background = col;
    const kmh = Math.round(Math.hypot(S.vx, S.vz) * 3.6); spdEl.textContent = kmh;
    if (au) { const t = au.ctx.currentTime; const vF = Math.abs(S.vx * s + S.vz * c); // fake 5-speed gearbox for the engine note
      const gears = [0, 9, 17, 26, 36, 60]; let g = 1; while (g < 5 && vF > gears[g]) g++; const lo = gears[g - 1], hi = gears[g]; const rpm = 0.25 + 0.75 * clamp((vF - lo) / (hi - lo), 0, 1);
      const thr = input().gas; const f = 38 + rpm * 95 + (S.boost > 0 ? 20 : 0);
      au.o1.frequency.setTargetAtTime(f, t, 0.05); au.o2.frequency.setTargetAtTime(f * 0.5, t, 0.05); au.lp.frequency.setTargetAtTime(300 + rpm * 900 + thr * 600, t, 0.08);
      au.master.gain.setTargetAtTime(0.05 + thr * 0.05, t, 0.1); au.sq.gain.setTargetAtTime(S.slip > 2.5 || S.drift ? 0.03 : 0, t, 0.05); }
  }

  const api = {
    active: false, cars, state: S,
    addCar(g, { name = 'car' } = {}) { g.userData.driveName = name; cars.push(g); const col = { type: 'circle', x: 0, z: 0, r: 0, car: g, active: true }; g.userData.cols = [];
      // parked: the car blocks the walker (and other cars) with 3 circles kept in sync with its pose
      for (let i = 0; i < 3; i++) { const c = { type: 'circle', x: 0, z: 0, r: g.userData.half.x * 0.96, car: g, active: true }; colliders.push(c); g.userData.cols.push(c); }
      api.syncCols(g); return g; },
    syncCols(g) { const u = g.userData, s = Math.sin(g.rotation.y), c = Math.cos(g.rotation.y); const W = u.half.x * 0.96; [u.half.zF - W, (u.half.zF + u.half.zR) / 2, u.half.zR + W].forEach((lz, i) => { const k = u.cols[i]; k.x = g.position.x + lz * s; k.z = g.position.z + lz * c; });
      // re-file in the grid
      for (const k of u.cols) { for (const l of grid.values()) { const j = l.indexOf(k); if (j >= 0) l.splice(j, 1); } const key = cellKey(Math.floor(k.x / CELL), Math.floor(k.z / CELL)); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const kk = cellKey(Math.floor(k.x / CELL) + i, Math.floor(k.z / CELL) + j); if (!grid.has(kk)) grid.set(kk, []); grid.get(kk).push(k); } } },
    nearest(p) { let best = null, bd = 3.6; for (const g of cars) { const d = Math.hypot(p.x - g.position.x, p.z - g.position.z) - g.userData.half.x; if (d < bd) { bd = d; best = g; } } return best; },
    enter(g) {
      car = g; api.active = true; S.x = g.position.x; S.z = g.position.z; S.h = g.rotation.y; S.vx = S.vz = S.r = S.steer = 0; S.y = g.position.y; S.drift = S.boost = S.charge = 0; S.camMode = 0;
      for (const k of g.userData.cols) k.active = false;
      g.userData.lamps.head.forEach((h) => (h.material.emissiveIntensity = 2.4));
      if (!headLight) { headLight = new THREE.SpotLight('#fff4e0', 40, 45, 0.55, 0.5, 1.6); headLight.userData.drive = true; }
      g.userData.body.add(headLight); headLight.position.set(0, g.userData.spec.nose + 0.05, g.userData.half.zF + 0.6); g.userData.body.add(headLight.target); headLight.target.position.set(0, 0, g.userData.half.zF + 14);
      const a = audio(); a?.ctx.resume?.();
      chase(0, true);
    },
    exit() {
      const g = car; if (!g) return null; api.active = false;
      const u = g.userData, s = Math.sin(S.h), c = Math.cos(S.h);
      S.vx = S.vz = 0; pose(0.016); api.syncCols(g); for (const k of u.cols) k.active = true;
      if (headLight) { g.userData.body.remove(headLight); g.userData.body.remove(headLight.target); }
      if (au) au.master.gain.setTargetAtTime(0, au.ctx.currentTime, 0.1), au.sq.gain.setTargetAtTime(0, au.ctx.currentTime, 0.05);
      chEl.style.opacity = 0; camera.fov = 62; camera.updateProjectionMatrix();
      car = null;
      // step out on the driver's side (left, +x), else the passenger's, else behind
      for (const [lx, lz] of [[u.half.x + 0.7, 0.3], [-u.half.x - 0.7, 0.3], [0, u.half.zR - 1.0], [0, u.half.zF + 1.0]]) {
        const x = S.x + lx * c + lz * s, z = S.z - lx * s + lz * c; if (inArea(x, z)) return { x, z, yaw: S.h + Math.PI };
      }
      return { x: S.x + (u.half.x + 0.7) * c, z: S.z - (u.half.x + 0.7) * s, yaw: S.h + Math.PI };
    },
    update(dt) {
      if (!car) return;
      const inp = input(); const n = 4;
      for (let i = 0; i < n; i++) step(dt / n, inp);
      pose(dt); chase(dt, false); fx(dt);
    },
    // tests: run the sim at a fixed 60 Hz with forced input, independent of the frame rate
    sim(secs, force) { api.force = force; for (let i = 0; i < secs * 60; i++) api.update(1 / 60); api.force = null; },
    toggleCam() { S.camMode = 1 - S.camMode; },
    get car() { return car; },
  };
  // hold C to look back
  addEventListener('keydown', (e) => { if (api.active && e.code === 'KeyC' && !e.repeat) S.camMode = 1; });
  addEventListener('keyup', (e) => { if (e.code === 'KeyC') S.camMode = 0; });
  return api;
}
