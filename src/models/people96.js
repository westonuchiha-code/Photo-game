// People (96): a low-poly character builder (PS1-style: jointed limbs, a drawn face, clothes from the fabric textures
// recoloured) and a pool of pedestrians who walk the district's sidewalks around the player.
//   makePerson(seed, { worker })  -> Group (feet at y = 0, facing +z); userData.pose(phase, amount) swings the limbs
//   makePeople({ scene, grid, sidewalkY, count })  -> { group, update(pos, dt, car, onFoot), count }
import * as THREE from 'three';
import { mat, plain, canvasT, rng } from './kit.js';

const SKIN = ['#f0c8a4', '#e0ac80', '#c68a5c', '#a06a40', '#70482a', '#4a2e1c', '#f4d4b8'];
const HAIR = ['#1a1410', '#2e1e12', '#5a3a1c', '#8a5a28', '#c8a050', '#8a8a88', '#d8d4cc', '#7a2a18'];
const TOPS = [['b82_chenille', '#7a2a2a'], ['b82_chenille', '#2a4a6a'], ['b82_chenille', '#3a5a3a'], ['b82_chenille', '#2a2a2e'], ['b82_chenille', '#e4e0d4'], ['b82_chenille', '#d8b848'], ['b82_chenille', '#c87a8a'], ['b82_chenille', '#8ab0c8'],
  ['fb_plaid_red', '#a83a30'], ['fb_plaid_navy', '#3a4a7a'], ['fb_plaid_navy', '#4a6a4a'], ['b82_canvasgrey', '#6a4a7a'], ['b82_chenille', '#c86a28'], ['b82_canvasgrey', '#8a8c8e'], ['b82_canvasgrey', '#b8a888'], ['b82_chenille', '#f0eee8']];
const BOTTOMS = [['b82_canvasblue', '#34507e'], ['b82_canvasblue', '#5a7aa4'], ['b82_canvasgrey', '#2a2c34'], ['b82_canvasgrey', '#7a7054'], ['b82_canvasgrey', '#4a4a4e'], ['b82_canvasgrey', '#9a8a68'], ['b82_canvasgrey', '#5a5c62'], ['b82_canvasblue', '#6a6e7a']];
const SHOES = ['#1c1814', '#3a2a1c', '#e8e6e0', '#6a2a22', '#2a2a30'];
const cloth = ([t, c]) => mat(t, { to: c, rough: 0.95, normal: 0.4 });
const skinM = (c) => plain(c, { roughness: 0.75 });

// faces: drawn once per variant on a clear canvas, worn on a patch just in front of the head
const _faces = [];
function face(k) { if (_faces[k]) return _faces[k]; const t = canvasT(64, 64, (x) => { x.clearRect(0, 0, 64, 64); const ey = 26, dx = 13, bw = k % 2 ? 1.5 : 2.5;
  for (const s of [-1, 1]) { x.fillStyle = '#f4f0e8'; x.beginPath(); x.ellipse(32 + s * dx, ey, 5, 3.2, 0, 0, 7); x.fill(); x.fillStyle = ['#2a1c10', '#1c2a3a', '#2a3a1c', '#101010'][k % 4]; x.beginPath(); x.arc(32 + s * dx, ey, 2.6, 0, 7); x.fill(); x.strokeStyle = 'rgba(30,18,10,0.85)'; x.lineWidth = bw; x.beginPath(); x.moveTo(32 + s * (dx - 6), ey - 7 - (k % 3)); x.lineTo(32 + s * (dx + 6), ey - 6); x.stroke(); }
  x.strokeStyle = 'rgba(60,30,20,0.35)'; x.lineWidth = 2; x.beginPath(); x.moveTo(32, 30); x.lineTo(30, 40); x.lineTo(34, 40); x.stroke();
  x.strokeStyle = k % 2 ? 'rgba(150,50,50,0.9)' : 'rgba(110,50,40,0.85)'; x.lineWidth = k % 2 ? 3 : 2; x.beginPath(); x.moveTo(25, 49); x.quadraticCurveTo(32, 49 + [3, 0, 4, 1][k % 4], 39, 49); x.stroke(); });
  const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0.92 }); m.userData.flat = true; return (_faces[k] = m); }

const _G = new Map();
const G = (key, make) => { if (!_G.has(key)) _G.set(key, make()); return _G.get(key); };
// a tapered limb hanging down from its pivot (the origin), oval in section
const limb = (rt, rb, len, zs = 0.85) => G(`l${rt}|${rb}|${len}|${zs}`, () => { const g = new THREE.CylinderGeometry(rt, rb, len, 6); g.translate(0, -len / 2, 0); g.scale(1, 1, zs); return g; });
const boxG = (w, h, d, x = 0, y = 0, z = 0) => G(`b${w}|${h}|${d}|${x}|${y}|${z}`, () => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); return g; });
const ballG = (r, sy = 1, a = Math.PI) => G(`s${r}|${sy}|${a}`, () => { const g = new THREE.SphereGeometry(r, 9, 7, 0, Math.PI * 2, 0, a); g.scale(1, sy, 1); return g; });

export function makePerson(seed = 1, { worker = false } = {}) {
  const g = new THREE.Group(), r = rng(seed * 7919 + 13), pick = (a) => a[Math.floor(r() * a.length)], add = (geo, m, parent, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); parent.add(o); return o; };
  const fem = r() < 0.5, skin = skinM(pick(SKIN)), hairC = plain(pick(HAIR), { roughness: 0.9 }), top = cloth(worker ? ['b82_chenille', '#e8c818'] : pick(TOPS)), bot = cloth(worker ? ['b82_canvasblue', '#34507e'] : pick(BOTTOMS)), shoe = plain(pick(SHOES), { roughness: 0.6 });
  const style = worker ? 0 : Math.floor(r() * 6);   // 0 long sleeves + trousers, 1 tee + trousers, 2 tee + shorts, 3 skirt, 4 jacket (open, second colour under), 5 long coat
  const shortSl = style === 1 || style === 2 || (style === 3 && r() < 0.6), shorts = style === 2, skirt = style === 3 && fem, coat = style === 5;
  const sw = fem ? 0.17 : 0.2, hipW = fem ? 0.165 : 0.155, HIP = 0.94, body = new THREE.Group(); body.position.y = HIP; g.add(body);
  // pelvis + torso (an oval taper), neck, head, a face, hair
  add(G('pelvis' + hipW, () => { const p = new THREE.CylinderGeometry(hipW, hipW * 0.92, 0.2, 8); p.scale(1, 1, 0.62); return p; }), skirt || coat ? top : bot, body, 0, 0.04, 0);
  add(G('torso' + sw + fem, () => { const p = new THREE.CylinderGeometry(sw + 0.01, hipW * (fem ? 0.82 : 0.95), 0.44, 8); p.scale(1, 1, 0.6); return p; }), top, body, 0, 0.35, 0);
  add(G('sh' + sw, () => { const p = new THREE.SphereGeometry(sw + 0.012, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2); p.scale(1, 0.3, 0.6); return p; }), top, body, 0, 0.57, 0);
  if (style === 4) add(boxG(0.1, 0.4, 0.02), cloth(pick(TOPS)), body, 0, 0.36, sw * 0.6 - 0.002);
  if (skirt) add(G('skirt' + hipW, () => { const p = new THREE.CylinderGeometry(hipW * 0.95, hipW * 1.45, 0.42, 8, 1, true); p.scale(1, 1, 0.75); return p; }), top, body, 0, -0.2, 0).material.side = THREE.DoubleSide;
  if (coat) add(G('coat' + hipW, () => { const p = new THREE.CylinderGeometry(hipW * 1.0, hipW * 1.2, 0.5, 8, 1, true); p.scale(1, 1, 0.72); return p; }), top, body, 0, -0.22, 0).material.side = THREE.DoubleSide;
  add(limb(0.045, 0.05, 0.09, 1), skin, body, 0, 0.67, 0);
  const head = new THREE.Group(); head.position.set(0, 0.77, 0.005); body.add(head); add(ballG(0.108, 1.18), skin, head);
  add(G('facep', () => new THREE.SphereGeometry(0.1095, 8, 6, Math.PI / 2 - 0.8, 1.6, 0.85, 1.35).scale(1, 1.18, 1)), face(Math.floor(r() * 8)), head);
  add(boxG(0.02, 0.05, 0.03), skin, head, -0.108, -0.005, 0); add(boxG(0.02, 0.05, 0.03), skin, head, 0.108, -0.005, 0);
  const hs = worker ? 9 : Math.floor(r() * (fem ? 5 : 6)) + (fem ? 1 : 0);   // 0 bald, 1 short, 2 short + fringe, 3 long, 4 bun, 5 cap, 9 hard hat
  if (hs >= 1 && hs <= 4) { const cap = add(ballG(0.116, 1.15, Math.PI * 0.5), hairC, head, 0, 0.012, -0.012); cap.rotation.x = -0.28; if (hs === 2) add(boxG(0.19, 0.035, 0.03), hairC, head, 0, 0.085, 0.085);
    if (hs === 3) add(G('long', () => { const p = new THREE.CylinderGeometry(0.115, 0.125, 0.24, 8, 1, true, Math.PI * 0.5, Math.PI); p.scale(1, 1, 0.95); return p; }), hairC, head, 0, -0.1, -0.012).material.side = THREE.DoubleSide; if (hs === 4) add(ballG(0.05), hairC, head, 0, 0.1, -0.1); }
  if (hs === 5 || hs === 9) { const hm = hs === 9 ? plain('#e8c818', { roughness: 0.4 }) : cloth(pick(TOPS)); add(ballG(0.118, 1.0, Math.PI * 0.5), hm, head, 0, 0.035, 0); add(boxG(0.17, 0.012, 0.1), hm, head, 0, 0.04, 0.14); }
  if (hs === 0 && !fem && r() < 0.5) add(boxG(0.14, 0.05, 0.02), hairC, head, 0, -0.085, 0.092);   // a beard
  // arms: upper arm (sleeve), forearm (sleeve or skin) with the hand on its end
  const arm = (s) => { const up = new THREE.Group(); up.position.set(s * (sw + 0.035), 0.56, 0); body.add(up); add(limb(0.05, 0.042, 0.29), top, up); const fo = new THREE.Group(); fo.position.y = -0.28; up.add(fo); add(limb(0.04, 0.032, 0.25), shortSl ? skin : top, fo); add(boxG(0.045, 0.085, 0.07, 0, -0.29, 0.005), skin, fo); return [up, fo]; };
  // legs: thigh, shin, shoe
  const leg = (s) => { const th = new THREE.Group(); th.position.set(s * hipW * 0.55, 0, 0); body.add(th); add(limb(0.078, 0.058, 0.45), shorts || skirt ? (shorts ? bot : skin) : bot, th); const sh = new THREE.Group(); sh.position.y = -0.44; th.add(sh); add(limb(0.055, 0.04, 0.44), shorts || skirt ? skin : bot, sh); add(boxG(0.085, 0.07, 0.24, 0, -0.455, 0.05), shoe, sh); return [th, sh]; };
  const [aL, fL] = arm(-1), [aR, fR] = arm(1), [tL, sL] = leg(-1), [tR, sR] = leg(1), sc = 0.92 + r() * 0.16; g.scale.set(sc * (0.95 + r() * 0.12), sc, sc * (0.95 + r() * 0.12));
  const sway = s => s;
  g.userData.pose = (ph, k = 1) => { const sn = Math.sin(ph), cs = Math.cos(ph);   // k: 0 standing .. 1 full stride
    tL.rotation.x = -sn * 0.55 * k; tR.rotation.x = sn * 0.55 * k; sL.rotation.x = Math.max(0, cs) * 0.95 * k + 0.04; sR.rotation.x = Math.max(0, -cs) * 0.95 * k + 0.04;
    aL.rotation.x = sn * 0.45 * k; aR.rotation.x = -sn * 0.45 * k; aL.rotation.z = -0.07; aR.rotation.z = 0.07; fL.rotation.x = -0.18 - Math.max(0, sn) * 0.35 * k; fR.rotation.x = -0.18 - Math.max(0, -sn) * 0.35 * k;
    body.position.y = HIP + Math.abs(cs) * 0.025 * k - 0.02 * k; body.rotation.y = sway(sn) * 0.07 * k; head.rotation.y = -sn * 0.05 * k; };
  g.userData.head = head; g.userData.pose(0, 0); g.userData.noFinish = true;
  g.traverse((o) => { if (o.isMesh) o.castShadow = false; });
  return g;
}

export function makePeople({ scene, grid, sidewalkY = 0.14, count = 40 }) {
  const group = new THREE.Group(); group.name = 'people'; scene.add(group); const { xs, zs } = grid, r = rng(9601), P = [];
  for (let i = 0; i < count; i++) { const mesh = makePerson(i + 1); mesh.visible = false; group.add(mesh); P.push({ mesh, active: false, u: 0, dir: 1, sp: 1.3, v: 0, ph: r() * 6, h: 0, ox: 0, oz: 0, lane: 0, blk: null, wait: 0 }); }
  // a block's sidewalk ring, walked as a rounded rectangle: u metres along it -> position + heading
  const ring = (p) => { const [i, j] = p.blk, o = 6.05 + p.lane, x0 = xs[i] + o, x1 = xs[i + 1] - o, z0 = zs[j] + o, z1 = zs[j + 1] - o, w = x1 - x0, d = z1 - z0, per = 2 * (w + d); let u = ((p.u % per) + per) % per, x, z, h;
    if (u < w) { x = x0 + u; z = z0; h = Math.PI / 2; } else if (u < w + d) { x = x1; z = z0 + (u - w); h = 0; } else if (u < 2 * w + d) { x = x1 - (u - w - d); z = z1; h = -Math.PI / 2; } else { x = x0; z = z1 - (u - 2 * w - d); h = Math.PI; }
    return [x, z, p.dir > 0 ? h : h + Math.PI, per]; };
  const spawn = (p, cx, cz, near) => { for (let t = 0; t < 6; t++) { const i = Math.floor(r() * (xs.length - 1)), j = Math.floor(r() * (zs.length - 1)); if (Math.abs((xs[i] + xs[i + 1]) / 2 - cx) > 150 || Math.abs((zs[j] + zs[j + 1]) / 2 - cz) > 150) continue;
      p.blk = [i, j]; p.lane = r() * 0.6; p.u = r() * 400; p.dir = r() < 0.5 ? 1 : -1; const [x, z, h] = ring(p), dd = Math.hypot(x - cx, z - cz); if (dd < near || dd > 72) continue;
      p.active = true; p.sp = 1.05 + r() * 0.6; p.v = p.sp; p.h = h; p.ox = p.oz = 0; p.mesh.position.set(x, sidewalkY, z); p.mesh.rotation.y = h; return true; } return false; };
  let first = true;
  function update(pos, dt, car, onFoot) { const cx = pos.x, cz = pos.z; let budget = first ? count : 2;
    for (const p of P) { const m = p.mesh;
      if (p.active && Math.hypot(m.position.x - cx, m.position.z - cz) > 84) { p.active = false; m.visible = false; }
      if (!p.active) { if (budget > 0) { budget--; spawn(p, cx, cz, first ? 8 : 34); } if (!p.active) continue; }
      let [x, z, h] = ring(p); x += p.ox; z += p.oz; const dd = Math.hypot(x - cx, z - cz); m.visible = true;
      // manners: stop for the player in the way, wait for a car close by, step clear of one that's on top of them
      let target = p.sp, look = null;
      if (onFoot && dd < 1.5) { const ax = Math.sin(h), az = Math.cos(h); if ((cx - x) * ax + (cz - z) * az > -0.2) { target = 0; look = Math.atan2(cx - x, cz - z); } }
      if (car) { const kx = x - car.x, kz = z - car.z, kd = Math.hypot(kx, kz), ks = Math.hypot(car.vx || 0, car.vz || 0); if (kd < 6 && ks > 1.5) { target = 0; look = Math.atan2(-kx, -kz); } if (kd < 2.0 && kd > 0.01) { const push = (2.0 - kd) * 6 * dt + ks * dt * 0.8; p.ox += kx / kd * push; p.oz += kz / kd * push; } }
      const back = Math.exp(-dt * (target > 0 ? 0.7 : 0)); p.ox *= back; p.oz *= back;
      p.v += (target - p.v) * Math.min(1, dt * 5); p.u += p.dir * p.v * dt; p.ph += p.v * dt * 4.3;
      let dh = (look ?? h) - p.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); p.h += dh * Math.min(1, dt * 6);
      m.position.set(x, sidewalkY, z); m.rotation.y = p.h; if (dd < 70) m.userData.pose(p.ph, Math.min(1, p.v / 1.2)); }
    first = false; }
  return { group, update, count, list: P };
}
