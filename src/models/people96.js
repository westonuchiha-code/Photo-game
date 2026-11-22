// People (96/97): pedestrians built on the two base bodies of body97.js (one skinned mesh each, one atlas "skin" per
// look), walking the district's sidewalks around the player.
//   makePerson(seed, { worker })  -> Group (feet at y = 0, facing +z); userData.pose(phase, amount) walks the skeleton
//   makePeople({ scene, grid, sidewalkY, count })  -> { group, update(pos, dt, car, onFoot), count }
// The skins here are painted stand-ins (paintSkin): photo skins + face maps replace them.
import * as THREE from 'three';
import { rng } from './kit.js';
import { makeBody, paintSkin, addHair } from './body97.js';

const SKIN = ['#f0c8a4', '#e0ac80', '#c68a5c', '#a06a40', '#70482a', '#4e3220', '#f2d0b4'];
const HAIR = ['#1a1410', '#2e1e12', '#5a3a1c', '#8a5a28', '#c8a050', '#8a8a88', '#d8d4cc', '#7a2a18'];
const TOPS = ['#8a3030', '#2e527a', '#3e6a44', '#2a2a30', '#e4e0d4', '#d8b848', '#c87a8a', '#8ab0c8', '#6a4a7a', '#c86a28', '#8a8c8e', '#b8a888', '#f0eee8', '#3a6a6a'];
const BOTTOMS = ['#2c3e62', '#4a6690', '#1e2026', '#6e6448', '#3c3c40', '#8a7a5c', '#54565c'];
const SHOES = ['#1c1814', '#3a2a1c', '#d8d6d0', '#6a2a22', '#2a2a30'];
const _looks = new Map();
function look(sex, k, worker) { const key = sex + k + (worker ? 'w' : ''); if (_looks.has(key)) return _looks.get(key); const r = rng(k * 7919 + (sex === 'f' ? 31 : 13)), pick = (a) => a[Math.floor(r() * a.length)];
  const o = worker ? { skin: pick(SKIN), hair: pick(HAIR), top: '#e8c818', bottom: '#2c3e62', shoe: '#3a2a1c', sleeves: 'long', legs: 'long', seed: k } : { skin: pick(SKIN), hair: pick(HAIR), top: pick(TOPS), bottom: pick(BOTTOMS), shoe: pick(SHOES), sleeves: r() < 0.5 ? 'short' : 'long', legs: r() < 0.22 ? 'short' : 'long', seed: k };
  const m = new THREE.MeshStandardMaterial({ map: paintSkin(sex, o), roughness: 0.82 }); m.userData.flat = true; const hm = m.clone(); hm.side = THREE.DoubleSide; hm.userData.flat = true;
  const L = { m, hm, style: sex === 'f' ? pick(['long', 'long', 'bob', 'bob', 'short']) : pick(['short', 'short', 'crop', 'crop', 'bald']) }; _looks.set(key, L); return L; }

export function makePerson(seed = 1, { worker = false } = {}) { const r = rng(seed * 104729 + 7), sex = r() < 0.5 ? 'f' : 'm', L = look(sex, worker ? seed : seed % 9, worker), g = makeBody(sex, L.m); addHair(g, L.style, L.hm);
  const sc = 0.95 + r() * 0.1; g.scale.set(sc * (0.96 + r() * 0.1), sc, sc * (0.96 + r() * 0.1)); return g; }

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
