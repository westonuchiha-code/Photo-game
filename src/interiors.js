// Enterable district buildings. Every generated building has a doorway (district.js) with a door on it; this manager
//   - hangs the doors (one InstancedMesh for the whole town) and swings a door open as you walk up to it
//   - builds a building's interior when you come near its door (one per tick, nearest first), merged by material so it
//     costs a few dozen draw calls, and removes it again when you've gone
//   - gives each interior its walkable area + threshold, a floor height, and colliders for its walls and furniture
//   - moves two shared ceiling lights into whichever interior you're in (so the number of lights never changes and
//     the GPU never has to rebuild shaders)
// What's inside: shops -> a shop floor; tall buildings (5+ floors) -> an office; others -> a flat, or a studio when
// the frontage is narrow (models/interiors91.js). Ground floor only: stairs and back rooms are shut doors.
import * as THREE from 'three';
import { makeInterior } from './models/interiors91.js';
import { DOOR } from './models/district.js';
import { mat } from './models/kit.js';
import { mergeStatic } from './stream.js';
import { makeWallSign } from './models/civic93.js';

export function makeInteriors({ scene, district, colliders, areas }) {
  const SW = district.userData.sidewalkY, FY = SW + 0.02, list = [];
  const DOORCOLS = ['#5a3a26', '#2a4a3a', '#6a2a22', '#2a3a5a', '#3a3a3c', '#7a5a34', '#e4e0d6', '#1c1c1e'];
  const civic = { n: 0, clinic: 0, police: 0, school: 0 };
  for (const b of district.userData.buildings) {
    const [ax, az, bx, bz] = b.front, L = b.L, dx = (bx - ax) / L, dz = (bz - az) / L, dep = (b.face === 'n' || b.face === 's') ? b.z1 - b.z0 : b.x1 - b.x0;
    const IN = b.house ? 0.03 : 0.46;   // (generated buildings: the interior starts behind the recessed shopfront + window reveals)
    const U = Math.min(L - 0.8, 10), V = Math.min(dep - 0.8 - IN, 9); if (U < 4.2 || V < 5) continue;
    const uA = Math.max(0.4, Math.min(b.doorU - U / 2, L - 0.4 - U)), uB = uA + U, doorX = uB - b.doorU; if (doorX < 0.8 || doorX > U - 0.8) continue;
    const th = Math.atan2(dz, -dx), cs = Math.cos(th), sn = Math.sin(th), ox = ax + dx * uB + dz * IN, oz = az + dz * uB - dx * IN;
    const W = (lx, lz) => [ox + lx * cs + lz * sn, oz - lx * sn + lz * cs];
    const rect = (x0, x1, z0, z1) => { const [p0x, p0z] = W(x0, z0), [p1x, p1z] = W(x1, z1); return { minX: Math.min(p0x, p1x), maxX: Math.max(p0x, p1x), minZ: Math.min(p0z, p1z), maxZ: Math.max(p0z, p1z) }; };
    let type = b.shop >= 0 ? 'shop' : b.floors >= 5 ? 'office' : (U >= 8 && V >= 7 ? 'flat' : 'studio');
    // civic buildings: a few of the wide non-shop buildings become clinics, police stations and schools (signed outside)
    if (b.shop < 0 && U >= 9.4 && V >= 8.5) { const k = civic.n++ % 7; if (k === 1 && civic.clinic < 4) { type = 'clinic'; civic.clinic++; } else if (k === 3 && civic.police < 2) { type = 'police'; civic.police++; } else if (k === 5 && civic.school < 3) { type = 'school'; civic.school++; } }
    const e = { b, U, V, doorX, th, W, type, inner: rect(0.22, U - 0.22, 0.2, V - 0.22), door: W(doorX, 0), t: 0, target: 0, group: null, cols: [] };
    areas.push(e.inner, rect(doorX - 0.42, doorX + 0.42, -0.95 - IN, 0.5));
    e.doorCol = { type: 'box', ...rect(doorX - 0.6, doorX + 0.6, -0.12, 0.16), active: true }; colliders.push(e.doorCol);
    list.push(e);
  }
  // doors: a panelled leaf hinged at its edge (the hinge is the instance origin)
  const lw = DOOR.w - 0.02, leaf = new THREE.BoxGeometry(lw, DOOR.h - 0.02, 0.045); leaf.translate(lw / 2, (DOOR.h - 0.02) / 2, 0);
  { const p = leaf.attributes.position, uv = leaf.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 0.9 + (Math.abs(leaf.attributes.normal.getX(i)) > 0.5 ? p.getZ(i) : 0), p.getY(i) / 0.9); }
  const doors = new THREE.InstancedMesh(leaf, mat('wood_floor', { to: '#d8d4cc', rough: 0.55 }), list.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1), c = new THREE.Color();
  const setDoor = (i) => { const e = list[i], [hx, hz] = e.W(e.doorX - lw / 2, 0.04); q.setFromAxisAngle(UP, e.th - e.t * 1.75); m4.compose(new THREE.Vector3(hx, SW + 0.012, hz), q, one); doors.setMatrixAt(i, m4); };
  list.forEach((e, i) => { setDoor(i); doors.setColorAt(i, c.set(DOORCOLS[(e.b.index * 7) % DOORCOLS.length])); });
  doors.name = 'district_doors'; doors.frustumCulled = false; doors.castShadow = false; scene.add(doors);
  // the two shared interior lights (parked far below until you go inside)
  const lamps = [0, 1].map(() => { const l = new THREE.PointLight('#fff0dc', 7, 12, 1.5); l.position.set(0, -200, 0); scene.add(l); return l; });
  let litFor = null;
  // signs over the doors of the civic buildings
  const SIGN = { clinic: ['ELM STREET CLINIC', '#2a6a5a', 'walk-in · open late'], police: ['POLICE', '#16243a', 'Elm County · 555-0110'], school: ['ELM PREP SCHOOL', '#6a2a2a', 'est. 1962'] };
  for (const e of list) if (SIGN[e.type]) { const [t, bg, sub] = SIGN[e.type]; const sg = makeWallSign(t, { w: 3.0, h: 0.6, bg, sub }); const [x, z] = e.W(e.doorX, -0.07); sg.position.set(x, SW + DOOR.h + 0.55, z); sg.rotation.y = e.th + Math.PI; scene.add(sg); }

  function build(e) {
    const g = makeInterior({ U: e.U, V: e.V, doorX: e.doorX, type: e.type, seed: e.b.index + 1 });
    const [ox, oz] = e.W(0, 0); g.position.set(ox, FY, oz); g.rotation.y = e.th; scene.add(g); g.updateMatrixWorld(true);
    for (const [x0, x1, z0, z1] of g.userData.colliders) { const [p0x, p0z] = e.W(x0, z0), [p1x, p1z] = e.W(x1, z1); const col = { type: 'box', minX: Math.min(p0x, p1x), maxX: Math.max(p0x, p1x), minZ: Math.min(p0z, p1z), maxZ: Math.max(p0z, p1z) }; colliders.push(col); e.cols.push(col); }
    e.lights = g.userData.lights.map(([x, y, z]) => { const [wx, wz] = e.W(x, z); return [wx, FY + y, wz]; });
    mergeStatic(g); e.group = g;
  }
  function dispose(e) {
    scene.remove(e.group); e.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); for (const m of [].concat(o.material || [])) if (m && !m.userData.flat) { for (const k of ['map', 'emissiveMap']) if (m[k] && m[k].isCanvasTexture) m[k].dispose(); m.dispose(); } });
    for (const col of e.cols) { const i = colliders.indexOf(col); if (i >= 0) colliders.splice(i, 1); } e.cols = []; e.group = null; if (litFor === e) { litFor = null; for (const l of lamps) l.position.set(0, -200, 0); }
  }
  const inside = (e, x, z) => x > e.inner.minX - 0.3 && x < e.inner.maxX + 0.3 && z > e.inner.minZ - 0.3 && z < e.inner.maxZ + 0.3;
  let scanT = 0, near = [], encl = null;
  function update(pos, dt, canOpen) {
    if ((scanT -= dt) <= 0) { scanT = 0.25; near = []; let want = null, wd = 1e9;
      for (const e of list) { const d = Math.hypot(pos.x - e.door[0], pos.z - e.door[1]); e.d = d; if (d < 30 || e.t > 0) near.push(e);
        if (e.group && d > 44 && !inside(e, pos.x, pos.z)) dispose(e); else if (!e.group && d < 24 && d < wd) { want = e; wd = d; } }
      if (want) build(want);
      // light the interior you're in (or about to enter)
      let best = null; for (const e of near) if (e.group && (inside(e, pos.x, pos.z) || e.d < 5) && (!best || e.d < best.d)) best = e;
      if (best && best !== litFor) { litFor = best; best.lights.forEach((p, i) => lamps[i].position.set(p[0], p[1], p[2])); } }
    let changed = false;
    for (const e of near) { e.target = canOpen && e.group && e.d < 3.2 ? 1 : 0; /* (the door shuts behind you once you're well inside: see `enclosed`) */ if (e.t !== e.target) { e.t += Math.sign(e.target - e.t) * Math.min(Math.abs(e.target - e.t), dt * 2.8); e.doorCol.active = e.t < 0.6; setDoor(list.indexOf(e)); changed = true; } }
    if (changed) doors.instanceMatrix.needsUpdate = true;
    // shut in: inside a built interior with its street door fully closed. Nothing outside can be seen, so main.js stops drawing it.
    encl = null; for (const e of near) if (e.group && e.t === 0 && pos.x > e.inner.minX && pos.x < e.inner.maxX && pos.z > e.inner.minZ && pos.z < e.inner.maxZ) { encl = e; break; }
  }
  const floorY = (x, z) => { for (const e of list) { const r = e.inner; if (x > r.minX - 0.25 && x < r.maxX + 0.25 && z > r.minZ - 0.25 && z < r.maxZ + 0.25) return FY; } return null; };
  return { update, floorY, list, lamps, doors, enclosed: () => encl, stats: () => ({ buildings: list.length, built: list.filter((e) => e.group).length }) };
}
