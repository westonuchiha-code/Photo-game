// Striding moss creature (queue item 55, photos/character/striding-moss-creature.jpg). The user's little clay
// sculpture blown up to a walking critter: an egg-shaped body caked in crusty moss/bark (the photo's own skin,
// tools/tex_55.py) with one big round tube-mouth at the front, four long thin bent wire legs (dark iron with
// silvery worn patches) that kink outward at the knee and end in a little curl, one curly wire antenna with a
// white-painted bend, standing on a mound of bright model-grass with yellow flower flecks.
//   makeMossCreature()  body ~0.9 m long, about 1.25 m to the top of the body; front (mouth) toward +z, feet y = 0.
//     userData.update(t)             stilt-walks in place (for the viewer)
//     userData.brain({nodes, links, home, ground, player})  returns update(t): a character that roams the trail,
//       looks around, rests on its mound and turns to watch / backs off from the player
//   makeMossMound(r)  the grass mound; userData.height(x, z) gives its surface height (local)
import * as THREE from 'three';

const _L = new THREE.TextureLoader();
function tex(name, rx = 1, ry = 1) { const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t; }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.9, ...o }); }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// dark iron wire with worn silver flecks (the legs in the photo catch the light in streaks)
let _wire = null;
function wireTex() {
  if (_wire) return _wire;
  const c = document.createElement('canvas'); c.width = 64; c.height = 512; const x = c.getContext('2d'); const r = rng(55);
  x.fillStyle = '#2a2b2b'; x.fillRect(0, 0, 64, 512);
  for (let i = 0; i < 260; i++) { const y = r() * 512, l = 2 + r() * 14; x.fillStyle = `rgba(${170 + r() * 60},${170 + r() * 60},${165 + r() * 55},${0.25 + r() * 0.6})`; x.fillRect(r() * 64, y, 2 + r() * 10, l); }
  _wire = new THREE.CanvasTexture(c); _wire.colorSpace = THREE.SRGBColorSpace; _wire.wrapS = _wire.wrapT = THREE.RepeatWrapping; _wire.repeat.set(1, 3);
  return _wire;
}

export function makeMossCreature() {
  const g = new THREE.Group(); g.name = 'moss_creature';
  const body = new THREE.Group(); g.add(body);
  const BY = 1.0;   // body centre height at rest
  // ---- the egg: wide at the mouth end, tapering to the back and up; lumpy crust
  const moss = tex('mc_moss', 2, 1.5);
  const skin = std({ map: moss, bumpMap: moss, bumpScale: 2.5, color: '#e2ddca', roughness: 0.95 });
  const MC = V(-0.02, -0.1, 0.43), MA = V(0, -Math.sin(0.32), Math.cos(0.32));   // mouth centre + axis (matches the mouth group below)
  const eg = new THREE.SphereGeometry(0.42, 64, 48); const p = eg.attributes.position; const r = rng(7);
  const bumps = Array.from({ length: 60 }, () => [V(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), 0.012 + r() * 0.025, 0.15 + r() * 0.2]);
  for (let i = 0; i < p.count; i++) {
    const v = V(p.getX(i), p.getY(i), p.getZ(i)), n = v.clone().normalize();
    // egg: long axis z, fatter toward the front (+z), back end narrower and lifted a touch
    const k = 1 + 0.16 * n.z; v.x *= 0.88 * k; v.y *= 0.92 * k; v.z *= 1.08; if (n.z < 0) v.y += 0.06 * n.z * n.z;
    let d = 0; for (const [c, a, w] of bumps) d += a * Math.max(0, 1 - n.distanceTo(c) / w);
    d += 0.006 * Math.sin(n.x * 37) * Math.sin(n.y * 29 + n.z * 31);
    v.addScaledVector(n, d);
    // press the front in where the tube mouth sits, so the clay never pokes through the hole
    const rel = v.clone().sub(MC), al = rel.dot(MA), rad = rel.addScaledVector(MA, -al).length();
    if (rad < 0.27 && al > -0.07) v.addScaledVector(MA, -(al + 0.07));
    p.setXYZ(i, v.x, v.y, v.z);
  }
  eg.computeVertexNormals();
  const egg = new THREE.Mesh(eg, skin); egg.castShadow = true; egg.receiveShadow = true; body.add(egg);
  // ---- tube mouth: a short thick clay pipe set into the front, tipped down, with a black throat
  const mouth = new THREE.Group(); mouth.position.set(-0.02, -0.1, 0.43); mouth.rotation.x = 0.32; body.add(mouth);
  const lipT = tex('mc_moss', 2.5, 2.5), tubeT = tex('mc_moss', 3, 0.45);
  const lipM = std({ map: lipT, bumpMap: lipT, bumpScale: 1.2, color: '#b4b8a4', roughness: 0.92 }), tubeM = std({ map: tubeT, bumpMap: tubeT, bumpScale: 1.5, color: '#b8b6a6', roughness: 0.92 });
  const RO = 0.235, RI = 0.18, LEN = 0.2;
  const outer = new THREE.Mesh(new THREE.CylinderGeometry(RO, RO * 1.1, LEN, 40, 1, true), tubeM); outer.rotation.x = Math.PI / 2; outer.position.z = LEN / 2 - 0.12; outer.castShadow = true; mouth.add(outer);
  const lipShape = new THREE.Shape(); lipShape.absarc(0, 0, RO, 0, Math.PI * 2); const hole = new THREE.Path(); hole.absarc(0, 0, RI, 0, Math.PI * 2, true); lipShape.holes.push(hole);
  const lip = new THREE.Mesh(new THREE.ExtrudeGeometry(lipShape, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 3, curveSegments: 40 }), lipM); lip.position.z = LEN - 0.14; mouth.add(lip);
  const throatM = new THREE.MeshStandardMaterial({ color: '#070706', roughness: 1, side: THREE.BackSide });
  const throat = new THREE.Mesh(new THREE.CylinderGeometry(RI, RI * 0.9, 0.5, 32, 1, true), throatM); throat.rotation.x = Math.PI / 2; throat.position.z = -0.17; mouth.add(throat);
  const cap = new THREE.Mesh(new THREE.CircleGeometry(RI, 32), new THREE.MeshBasicMaterial({ color: '#030303' })); cap.position.z = -0.04; mouth.add(cap);   // the egg's own surface sits behind this, so the hole reads as deep and black
  // ---- the curly antenna from the top-left: rises out to the left, arcs over, hooks down; the bend is white
  const wire = std({ map: wireTex(), metalness: 0.55, roughness: 0.55 });
  const ant = new THREE.CatmullRomCurve3([V(-0.2, 0.3, 0.12), V(-0.36, 0.55, 0.16), V(-0.56, 0.78, 0.2), V(-0.76, 0.86, 0.22), V(-0.9, 0.76, 0.22), V(-0.96, 0.52, 0.2), V(-1.0, 0.36, 0.18), V(-0.94, 0.3, 0.2)]);
  const antenna = new THREE.Group(); antenna.position.set(0, 0, 0); body.add(antenna);
  antenna.add(new THREE.Mesh(new THREE.TubeGeometry(ant, 60, 0.011, 6), wire));
  const tipPts = []; for (let i = 0; i <= 12; i++) tipPts.push(ant.getPoint(0.5 + i / 12 * 0.16));
  antenna.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tipPts), 16, 0.014, 6), std({ color: '#e8e6dc', roughness: 0.6 })));
  antenna.children.forEach((m) => { m.castShadow = true; });
  // ---- legs: hip on the body's flank, knee kinked outward and up, a long bowed shin, a curled foot
  const LEGS = [
    { hip: V(-0.3, -0.08, 0.14), foot: V(-0.62, 0, 0.55), ph: 0 },     // front left
    { hip: V(0.33, -0.02, 0.12), foot: V(0.5, 0, 0.75), ph: 0.5 },      // front right (the long one reaching forward)
    { hip: V(-0.3, -0.12, -0.18), foot: V(-0.72, 0, -0.5), ph: 0.5 },   // rear left
    { hip: V(0.34, -0.1, -0.2), foot: V(0.66, 0, -0.42), ph: 0 },       // rear right
  ];
  const legMeshes = LEGS.map(() => { const m = new THREE.Mesh(new THREE.BufferGeometry(), wire); m.castShadow = true; g.add(m); return m; });
  const T = 2.0;   // gait period (s); diagonal pairs swap every half
  function legCurve(L, hip, foot) {
    const s = Math.sign(L.hip.x), out = V(s, 0, 0);
    const mid = hip.clone().lerp(foot, 0.3); const knee = mid.addScaledVector(out, 0.32); knee.y = hip.y + 0.12;
    const shin = knee.clone().lerp(foot, 0.55).addScaledVector(out, 0.08); shin.y += 0.04;
    const ankle = foot.clone(); ankle.y += 0.09; ankle.z -= 0.02;
    const c1 = foot.clone().add(V(-s * 0.02, 0, 0.05)), c2 = foot.clone().add(V(-s * 0.07, 0.008, 0.07)), c3 = foot.clone().add(V(-s * 0.1, 0.03, 0.04));
    return new THREE.CatmullRomCurve3([hip.clone().addScaledVector(out, -0.04), hip.clone().addScaledVector(out, 0.1).add(V(0, 0.07, 0)), knee, shin, ankle, foot.clone().add(V(0, 0.006, 0)), c1, c2, c3]);
  }
  // pose: gc = gait clock (advances only while stepping), stride (m), footY(x, z) local ground, lk = how high the
  // feet lift (0 = standing still), tr = real time (breathing, antenna), st = mood {sit, look, yaw, perk, hop}
  const mood = { sit: 0, look: 0, yaw: 0, perk: 0, hop: 0 };
  function pose(gc, stride, footY = () => 0, lk = 1, tr = gc) {
    const walkBob = 0.035 * Math.sin(gc / T * Math.PI * 4) * lk, breathe = 0.012 * Math.sin(tr * 1.9);
    body.position.set(0, BY - 0.3 * mood.sit + walkBob + breathe + mood.hop, 0);
    body.rotation.set(-0.06 + 0.04 * Math.cos(gc / T * Math.PI * 4) * lk + mood.look, mood.yaw, 0.04 * Math.sin(gc / T * Math.PI * 2) * lk, 'YXZ');
    egg.scale.setScalar(1 + 0.012 * Math.sin(tr * 1.9));
    mouth.scale.setScalar(1 + 0.035 * Math.sin(tr * 1.9 + 0.6));
    // antenna: idle sway plus little nervous flicks; it stands up straighter when something has its attention
    const flick = Math.max(0, Math.sin(tr * 0.9) * Math.sin(tr * 2.3 + 1)) ** 6;
    antenna.rotation.z = 0.06 * Math.sin(tr * 2.3) - 0.22 * mood.perk + 0.25 * flick * Math.sin(tr * 31);
    antenna.rotation.x = 0.05 * Math.sin(tr * 1.7) - 0.1 * mood.perk;
    LEGS.forEach((L, i) => {
      const ph = ((gc / T + L.ph) % 1 + 1) % 1; let dz, lift;
      if (ph < 0.5) { dz = stride * (0.5 - ph * 2); lift = 0; }                       // planted: slides back as the body moves on
      else { const k = (ph - 0.5) * 2; dz = stride * (k - 0.5); lift = 0.16 * Math.sin(k * Math.PI) * lk; }   // swing: high stilt step
      const foot = L.foot.clone(); foot.x *= 1 + 0.12 * mood.sit; foot.z += dz; foot.y = footY(foot.x, foot.z) + lift;
      const hip = L.hip.clone().applyEuler(body.rotation).add(body.position);
      const m = legMeshes[i]; m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(legCurve(L, hip, foot), 48, 0.012, 6);
    });
  }
  pose(0, 0);
  // viewer: strides in place
  g.userData.update = (t) => pose(t, 0.28, undefined, 1, t);
  // in the world: a little character with a routine. It roams a graph of points (the trail), stops now and then to
  // look around, goes home to its mound to sit and rest, and when the player walks up it stops, turns to face them,
  // tips its mouth up at them with its antenna raised; it startles if they come on fast and backs off if crowded.
  //   nodes [[x, z]], links [[i, ...]] (neighbours of each node), home = node index of its mound,
  //   ground(x, z) -> y, player() -> {x, z} or null.  Returns update(t).
  g.userData.brain = ({ nodes, links, home, ground = () => 0, player = () => null }) => {
    const SPEED = 0.38, TURN = 1.1;
    let cur = home, tgt = home, prev = -1, state = 'rest', timer = 4, gc = 0, lk = 0, sk = 0, lastT = null, backed = 0, startle = 0, glance = 0;
    g.position.set(nodes[home][0], 0, nodes[home][1]);
    const rnd = rng(555);
    const pick = () => { const ns = links[cur].filter((n) => n !== prev); const opts = ns.length ? ns : links[cur]; prev = cur; tgt = opts[Math.floor(rnd() * opts.length)]; state = 'walk'; };
    const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    const ease = (v, to, k, dt) => v + (to - v) * Math.min(1, k * dt);
    const fw = V(0, 0, 0); let lastD = 0;
    g.userData.state = () => ({ state, d: lastD, tgt });
    return (g.userData.tick = (t) => {
      const dt = lastT === null ? 0 : Math.min(0.05, Math.max(0, t - lastT)); lastT = t;
      const pl = player(), d = pl ? Math.hypot(pl.x - g.position.x, pl.z - g.position.z) : Infinity;
      lastD = d;
      let want = 0, face = null, sit = 0, look = 0, yaw = 0, perk = 0;
      if (state !== 'watch' && d < 8) { state = 'watch'; startle = d < 4 ? 0.5 : 0; backed = 0; }
      if (state === 'watch') {
        if (d > 11) { state = 'pause'; timer = 2 + rnd() * 2; }
        face = Math.atan2(pl.x - g.position.x, pl.z - g.position.z); look = -0.22 - 0.1 * Math.max(0, 1 - d / 4); perk = 1;
        yaw = 0.18 * Math.sin(t * 0.8);                                                  // little curious head tilts
        if (d < 2.2 && backed < 1.6) want = -0.3;                                        // crowded: back away a bit
      } else if (state === 'rest') {
        sit = 1; timer -= dt; yaw = 0.25 * Math.sin(t * 0.3); look = 0.05;
        if (timer <= 0) pick();
      } else if (state === 'pause') {
        timer -= dt; glance += dt;
        yaw = 0.55 * Math.sin(glance * 0.9) * Math.min(1, glance); look = -0.08 * Math.sin(glance * 0.6);   // looking around
        if (timer <= 0) { glance = 0; pick(); }
      } else {
        const dx = nodes[tgt][0] - g.position.x, dz = nodes[tgt][1] - g.position.z, dist = Math.hypot(dx, dz);
        face = Math.atan2(dx, dz);
        const align = Math.cos(wrap(face - g.rotation.y));
        want = SPEED * Math.max(0, align) ** 3 * Math.min(1, dist / 0.6 + 0.3);
        if (dist < 0.25) { cur = tgt; if (cur === home) { state = 'rest'; timer = 10 + rnd() * 12; } else if (rnd() < 0.5) { state = 'pause'; timer = 2.5 + rnd() * 4; } else pick(); }
      }
      // turning (steps in place while it turns)
      let turning = 0;
      if (face !== null) { const dr = wrap(face - g.rotation.y), step = Math.max(-TURN * dt, Math.min(TURN * dt, dr)); g.rotation.y += step; turning = Math.min(1, Math.abs(dr) * 3); }
      g.position.x += Math.sin(g.rotation.y) * want * dt; g.position.z += Math.cos(g.rotation.y) * want * dt;
      if (want < 0) backed += -want * dt;
      // gait: the clock runs (backwards when reversing) only while it's moving or turning; feet settle when it stops
      const moving = Math.abs(want) / SPEED;
      lk = ease(lk, Math.max(moving, turning * 0.7), 4, dt); sk = ease(sk, moving * Math.sign(want || 1), 4, dt);
      gc += dt * (Math.abs(want) > 0.01 ? Math.sign(want) : 1) * Math.max(lk, 0) * (lk > 0.05 ? 1 : 0);
      startle = Math.max(0, startle - dt);
      mood.sit = ease(mood.sit, sit, 1.5, dt); mood.look = ease(mood.look, look, 3, dt); mood.yaw = ease(mood.yaw, yaw, 3, dt); mood.perk = ease(mood.perk, perk, 4, dt);
      mood.hop = 0.14 * Math.sin(Math.min(1, (0.5 - startle) / 0.5) * Math.PI) * (startle > 0 ? 1 : 0);
      const gy = ground(g.position.x, g.position.z); g.position.y = gy;
      const c = Math.cos(g.rotation.y), sn = Math.sin(g.rotation.y);
      pose(gc, SPEED * T / 2 * Math.abs(sk), (fx, fz) => { fw.set(g.position.x + fx * c + fz * sn, 0, g.position.z - fx * sn + fz * c); return ground(fw.x, fw.z) - gy; }, lk, t);
    });
  };
  return g;
}

export function makeMossMound(R = 2.4, H = 0.55) {
  const g = new THREE.Group(); g.name = 'moss_mound';
  const r = rng(31); const lumps = Array.from({ length: 7 }, () => [(r() - 0.5) * R, (r() - 0.5) * R, 0.4 + r() * 0.6, 0.08 + r() * 0.12]);
  const height = (x, z) => { const q = Math.hypot(x, z) / R; if (q >= 1) return 0; let h = H * Math.pow(Math.cos(q * Math.PI / 2), 1.6); for (const [lx, lz, w, a] of lumps) h += a * Math.exp(-((x - lx) ** 2 + (z - lz) ** 2) / (w * w)) * (1 - q); return h; };
  const geo = new THREE.CircleGeometry(R * 1.02, 96, 0, Math.PI * 2); geo.rotateX(-Math.PI / 2);
  // add rings of interior vertices so the hill has shape: rebuild as a polar grid
  // the grass thins out at the foot of the mound: darker and fading into the leaf litter, with a ragged edge
  const pos = [], uv = [], col = [], idx = [], NR = 28, NA = 96;
  for (let i = 0; i <= NR; i++) for (let j = 0; j <= NA; j++) {
    const rag = 1 + 0.08 * Math.sin(j * 0.7) * Math.sin(j * 1.9 + 1) + 0.05 * Math.sin(j * 3.3);
    const rr = i / NR * R * 1.03 * rag, a = j / NA * Math.PI * 2, x = Math.cos(a) * rr, z = Math.sin(a) * rr, q = i / NR;
    pos.push(x, Math.max(height(x, z), 0.012) - (i === NR ? 0.006 : 0), z); uv.push(x / 1.2, z / 1.2);
    const f = Math.min(1, Math.max(0, (1 - q) / 0.3)), shade = 0.55 + 0.45 * Math.min(1, (1 - q) / 0.45);
    col.push(shade, shade, shade * 0.95, f * f * (3 - 2 * f));
  }
  for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + NA + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
  geo.dispose(); const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); mg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); mg.setAttribute('color', new THREE.Float32BufferAttribute(col, 4)); mg.setIndex(idx); mg.computeVertexNormals();
  const grass = tex('mc_mound', 1, 1);
  const m = new THREE.Mesh(mg, std({ map: grass, bumpMap: grass, bumpScale: 3, vertexColors: true, transparent: true, depthWrite: true })); m.receiveShadow = true; g.add(m);
  // a few pale stones poking out of the grass (the white bits in the photo's model ground)
  const stone = std({ color: '#c4c2b6', roughness: 0.95 });
  for (let i = 0; i < 5; i++) { const a = r() * 6.28, rr = R * (0.55 + r() * 0.35), x = Math.cos(a) * rr, z = Math.sin(a) * rr; const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06 + r() * 0.08, 1), stone); s.scale.y = 0.35; s.position.set(x, height(x, z) - 0.01, z); s.rotation.y = r() * 3; g.add(s); }
  g.userData.height = height;
  return g;
}
