// People (96/97): pedestrians built on the two base bodies of body97.js (one skinned mesh each, one atlas "skin" per
// look), walking the district's sidewalks around the player.
//   makePerson(seed, { worker })  -> Group (feet at y = 0, facing +z); userData.pose(phase, amount) walks the skeleton
//   makePeople({ scene, grid, sidewalkY, count })  -> { group, update(pos, dt, car, onFoot), count }
// The skins here are painted stand-ins (paintSkin): photo skins + face maps replace them.
import * as THREE from 'three';
import { rng } from './kit.js';
import { makeBody, paintSkin, addHair, addBeard, addHood } from './body97.js';

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

// A named character with a photo face (tools/make_face.py made the maps). `who`: { sex, face, back, hat, skin, top, bottom, shoe, sleeves }
export function makeCharacter(who) { const m = new THREE.MeshStandardMaterial({ map: paintSkin(who.sex || 'm', { seed: 7, legs: 'long', sleeves: 'long', ...who }), roughness: 0.82 }); m.userData.flat = true; const hm = m.clone(); hm.side = THREE.DoubleSide; hm.userData.flat = true;
  const g = makeBody(who.sex || 'm', m, who.shape || null); addHair(g, who.hat || who.hairStyle || 'short', hm); if (who.beard) addBeard(g, hm, who.beard); if (who.hoodie) addHood(g, hm);
  // shape: the body's build (see specFor in body97.js); head: head size; height: overall scale
  const h = who.height || 1, hd = who.head || 1; g.scale.setScalar(h); g.userData.bones.head.scale.setScalar(hd);
  // a soft dark patch on the ground under the feet (nothing in this area casts real shadows, so a standing figure looked afloat)
  { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 2, 32, 32, 32); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); sh.material.userData.flat = true; sh.rotation.x = -Math.PI / 2; sh.position.y = 0.012; sh.scale.set(1, 0.8, 1); g.add(sh); }
  return g; }
export const CHARACTERS = {   // made-up names
  // prototype: the first photo-mapped face (photos/npc-face-a-*.jpg)
  hank: { sex: 'm', face: 'np_face_a', back: 'np_back_a', hat: 'beanie', skin: '#e4c0b0', top: '#15171d', bottom: '#2a2f3a', shoe: '#1c1814', sleeves: 'long', collar: 'high', hoodie: true, height: 0.98, head: 1.12, beard: 0.06, shape: { chest: 1.27, waist: 1.55, hips: 1.3, arm: 1.42, leg: 1.34, neck: 1.4 } },
};
export function makePerson(seed = 1, { worker = false } = {}) { const r = rng(seed * 104729 + 7), sex = r() < 0.5 ? 'f' : 'm', L = look(sex, worker ? seed : seed % 9, worker), g = makeBody(sex, L.m); addHair(g, L.style, L.hm);
  const sc = 0.95 + r() * 0.1; g.scale.set(sc * (0.96 + r() * 0.1), sc, sc * (0.96 + r() * 0.1)); return g; }

export function makePeople({ scene, grid, sidewalkY = 0.14, count = 40 }) {
  const group = new THREE.Group(); group.name = 'people'; scene.add(group); const { xs, zs } = grid, r = rng(9601), P = [];
  const poolM = new THREE.MeshBasicMaterial({ color: '#3a0a0c', transparent: true, opacity: 0.7, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }), poolG = new THREE.CircleGeometry(0.55, 14); poolG.rotateX(-Math.PI / 2);
  for (let i = 0; i < count; i++) { const mesh = makePerson(i + 1); mesh.visible = false; group.add(mesh); const pool = new THREE.Mesh(poolG, poolM); pool.visible = false; group.add(pool);
    P.push({ mesh, pool, seed: i + 1, active: false, u: 0, dir: 1, sp: 1.3, v: 0, ph: r() * 6, h: 0, ox: 0, oz: 0, lane: 0, blk: null, st: 'walk', t: 0, vx: 0, vz: 0, vy: 0, y: 0, tum: 0, nerve: 0.6 + r() * 0.4, seen: 0 }); }
  // a block's sidewalk ring, walked as a rounded rectangle: u metres along it -> position + heading
  const ring = (p) => { const [i, j] = p.blk, o = 6.05 + p.lane, x0 = xs[i] + o, x1 = xs[i + 1] - o, z0 = zs[j] + o, z1 = zs[j + 1] - o, w = x1 - x0, d = z1 - z0, per = 2 * (w + d); let u = ((p.u % per) + per) % per, x, z, h;
    if (u < w) { x = x0 + u; z = z0; h = Math.PI / 2; } else if (u < w + d) { x = x1; z = z0 + (u - w); h = 0; } else if (u < 2 * w + d) { x = x1 - (u - w - d); z = z1; h = -Math.PI / 2; } else { x = x0; z = z1 - (u - 2 * w - d); h = Math.PI; }
    return [x, z, p.dir > 0 ? h : h + Math.PI, per]; };
  const stand = (p) => { p.st = 'walk'; p.t = 0; p.y = 0; p.tum = 0; p.mesh.rotation.set(0, p.h, 0); p.pool.visible = false; const b = p.mesh.userData.bones; if (b) { b.L.a.rotation.z = 0; b.R.a.rotation.z = 0; } };
  const spawn = (p, cx, cz, near) => { for (let t = 0; t < 6; t++) { const i = Math.floor(r() * (xs.length - 1)), j = Math.floor(r() * (zs.length - 1)); if (Math.abs((xs[i] + xs[i + 1]) / 2 - cx) > 150 || Math.abs((zs[j] + zs[j + 1]) / 2 - cz) > 150) continue;
      p.blk = [i, j]; p.lane = r() * 0.6; p.u = r() * 400; p.dir = r() < 0.5 ? 1 : -1; const [x, z, h] = ring(p), dd = Math.hypot(x - cx, z - cz); if (dd < near || dd > 72) continue;
      p.active = true; p.sp = 1.05 + r() * 0.6; p.v = p.sp; p.h = h; p.ox = p.oz = 0; stand(p); p.mesh.position.set(x, sidewalkY, z); p.mesh.rotation.y = h; return true; } return false; };
  // thrown by a car or a blast: (vx, vz) the push, `dead` whether they get up again
  const strike = (p, vx, vz, vy, dead) => { p.st = 'fly'; p.t = 0; p.vx = vx; p.vz = vz; p.vy = vy; p.dead = dead; p.tum = (r() - 0.5) * 14; };
  const scare = (p, fx, fz, secs = 5) => { if (p.st !== 'walk' && p.st !== 'flee') return; const [x, z, h] = ring(p); if (Math.sin(h) * (x - fx) + Math.cos(h) * (z - fz) < 0) p.dir = -p.dir; p.st = 'flee'; p.t = secs; };   // run along the sidewalk, away from it
  let first = true;
  // car: null, or the car being driven { x, z, vx, vz, h, half: { x, zF, zR }, onHit(speed, dead) }. Without `half`
  // (the big town's driver) people only stop and step clear, as before.
  function update(pos, dt, car, onFoot) { const cx = pos.x, cz = pos.z; let budget = first ? count : 2;
    const ks = car ? Math.hypot(car.vx || 0, car.vz || 0) : 0, live = car && car.half, sh = live ? Math.sin(car.h) : 0, ch = live ? Math.cos(car.h) : 0;
    for (const p of P) { const m = p.mesh;
      if (p.active && Math.hypot(m.position.x - cx, m.position.z - cz) > 84) { p.active = false; m.visible = false; p.pool.visible = false; }
      if (!p.active) { if (budget > 0) { budget--; spawn(p, cx, cz, first ? 8 : 34); } if (!p.active) continue; }
      let [x, z, h] = ring(p); x += p.ox; z += p.oz; const dd = Math.hypot(x - cx, z - cz); m.visible = true;
      // ---- off their feet: flying, lying, getting up
      if (p.st === 'fly') { p.t += dt; p.vy -= 16 * dt; p.y += p.vy * dt; p.ox += p.vx * dt; p.oz += p.vz * dt; m.rotation.x += p.tum * dt; m.rotation.z += p.tum * 0.4 * dt;
        if (p.y <= 0 && p.vy < 0) { p.y = 0; if (Math.abs(p.vy) > 3) { p.vy *= -0.3; p.vx *= 0.6; p.vz *= 0.6; p.tum *= 0.5; } else { p.st = p.dead ? 'dead' : 'down'; p.t = 0; m.rotation.set(-Math.PI / 2, p.h + (r() - 0.5), 0); const b = m.userData.bones; if (b) { b.L.a.rotation.z = -0.9; b.R.a.rotation.z = 1.0; } m.userData.pose(1.1, 0.5); if (p.dead) { p.pool.position.set(x, sidewalkY + 0.012, z); p.pool.scale.setScalar(0.3); p.pool.visible = true; } } }
        m.position.set(x, sidewalkY + p.y + (p.st === 'fly' ? 0.5 : 0.14), z); continue; }
      if (p.st === 'dead') { p.t += dt; p.pool.scale.setScalar(Math.min(1.2, 0.3 + p.t * 0.25)); if (p.t > 25) { p.active = false; m.visible = false; p.pool.visible = false; } continue; }
      if (p.st === 'down') { p.t += dt; if (p.t > 2.6) { stand(p); p.st = 'flee'; p.t = 6; if (car) scare(p, car.x, car.z, 6); } continue; }
      // ---- on their feet
      let target = p.st === 'flee' ? 4.4 : p.sp, look = null;
      if (p.st === 'flee' && (p.t -= dt) <= 0) p.st = 'walk';
      if (p.st === 'talk') { target = 0; look = Math.atan2(cx - x, cz - z); }   /* in conversation: stands and faces you */
      if (p.st === 'dive') { p.t -= dt; p.ox += p.vx * dt; p.oz += p.vz * dt; m.position.set(x, sidewalkY + Math.max(0, Math.sin((1 - p.t / 0.42) * Math.PI)) * 0.35, z); m.rotation.set(0.55, Math.atan2(p.vx, p.vz), 0); m.userData.pose(p.ph += dt * 14, 1.2); if (p.t <= 0) { stand(p); p.st = 'flee'; p.t = 4; p.h = m.rotation.y; } continue; }
      if (onFoot && p.st === 'walk' && dd < 1.5) { const ax = Math.sin(h), az = Math.cos(h); if ((cx - x) * ax + (cz - z) * az > -0.2) { target = 0; look = Math.atan2(cx - x, cz - z); } }
      if (car) { const kx = x - car.x, kz = z - car.z, kd = Math.hypot(kx, kz);
        if (live) {
          // struck: inside the car's outline while it is moving. Slow, it shoulders them aside; faster, it throws them.
          const al = kx * sh + kz * ch, sd = kx * ch - kz * sh, inside = Math.abs(sd) < car.half.x + 0.3 && al > car.half.zR - 0.3 && al < car.half.zF + 0.3;
          if (inside && ks > 2.4) { const dead = ks > 7.5 || r() < 0.25; strike(p, car.vx * 0.85 + ch * Math.sign(sd || 1) * 1.6, car.vz * 0.85 - sh * Math.sign(sd || 1) * 1.6, 2.4 + ks * 0.2, dead); if (car.onHit) car.onHit(ks, dead, x, z); for (const q of P) if (q !== p && q.active && Math.hypot(q.mesh.position.x - x, q.mesh.position.z - z) < 22) scare(q, car.x, car.z, 6); continue; }
          if (inside) { const push = 3 * dt + ks * dt; p.ox += ch * Math.sign(sd || 1) * push; p.oz -= sh * Math.sign(sd || 1) * push; }
          // a car coming at them: most see it and throw themselves clear; the faster it comes, the fewer manage
          if (ks > 4.5 && p.st !== 'dive') { const vx = car.vx / ks, vz = car.vz / ks, along = kx * vx + kz * vz, miss = kx * vz - kz * vx, tt = along / ks;
            if (along > 0 && tt < 1.15 && Math.abs(miss) < car.half.x + 1.0) { if (p.seen <= 0) { p.seen = 1.4; if (r() < Math.min(0.97, Math.max(0.2, (1.15 - ks / 34)) * p.nerve + 0.25)) { const sgn = Math.abs(miss) < 0.15 ? (r() < 0.5 ? 1 : -1) : Math.sign(miss); p.st = 'dive'; p.t = 0.42; p.vx = vz * sgn * 6.8; p.vz = -vx * sgn * 6.8; } else { target = 0; look = Math.atan2(-kx, -kz); } } }
            else if (kd < 14 && Math.abs(miss) < 5 && along > -2) scare(p, car.x, car.z, 3.5); }
          p.seen = Math.max(0, p.seen - dt);
        } else { if (kd < 6 && ks > 1.5) { target = 0; look = Math.atan2(-kx, -kz); } if (kd < 2.0 && kd > 0.01) { const push = (2.0 - kd) * 6 * dt + ks * dt * 0.8; p.ox += kx / kd * push; p.oz += kz / kd * push; } } }
      const back = Math.exp(-dt * (target > 0 ? 0.7 : 0)); p.ox *= back; p.oz *= back;
      p.v += (target - p.v) * Math.min(1, dt * 5); p.u += p.dir * p.v * dt; p.ph += p.v * dt * (p.st === 'flee' ? 3.1 : 4.3);
      let dh = (look ?? h) - p.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); p.h += dh * Math.min(1, dt * 6);
      m.position.set(x, sidewalkY, z); m.rotation.set(p.st === 'flee' ? 0.18 : 0, p.h, 0); if (dd < 70) m.userData.pose(p.ph, Math.min(p.st === 'flee' ? 1.45 : 1, p.v / 1.2)); }
    first = false; }
  // an explosion: people close by are thrown, the rest of the street runs
  function blast(bx, bz, rad) { for (const p of P) { if (!p.active) continue; const dx = p.mesh.position.x - bx, dz = p.mesh.position.z - bz, d = Math.hypot(dx, dz) || 1; if (d < rad && p.st !== 'dead') strike(p, dx / d * 8 * (1 - d / rad) + (r() - 0.5), dz / d * 8 * (1 - d / rad) + (r() - 0.5), 4 + 3 * (1 - d / rad), d < rad * 0.7); else if (d < 45) scare(p, bx, bz, 8); } }
  return { group, update, blast, count, list: P };
}
