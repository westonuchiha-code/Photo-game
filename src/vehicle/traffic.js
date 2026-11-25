// Traffic: cars that drive the street grid by themselves.
//   makeTraffic({ xs, zs, drive, spawn, count, onFoot })  -> { update(dt, player), cars, reset() }
// The streets are the lines x = xs[i] and z = zs[j]; their crossings are the nodes. A car drives from node to node in
// the right-hand lane, picks a way on at each crossing (never straight back unless it has to), and steers at a point a
// few metres ahead on its lane, which rounds the corners for it. It slows for corners, stops for whatever is in front
// of it (other traffic, parked cars pushed into the road, the car you are driving, you on foot), and at a crossing the
// car that got there first goes first.
// Each is an ordinary drivable car (drive.addCar): you can get in one, and one that is hit, wrecked or taken stops
// being traffic and is just a car in the road. A fresh one is then started somewhere out of sight.
//   spawn(i) -> a new car Group (already in the scene) with a name; onFoot() -> { x, z } or null
const LANE = 1.6, CRUISE = 9.5, TURN = 4.6, REACH = 8.5;
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// Police (optional): `police: { spawn(i), want() -> how many should be out, target() -> { x, z, v, foot } or null }`.
// With a target they do not keep to the rules: they take the shortest way through the grid to it, fast, and once close
// drive straight at it: to stop beside you if you are on foot or stopped, to ram you if you are moving. Buildings
// stop them (they keep to ground a car can be on). With no target they drive like anyone, and go when out of sight.
export function makeTraffic({ xs, zs, drive, spawn, count = 5, onFoot = () => null, police = null }) {
  const T = []; let nextId = 0, spawnT = 1.5, made = 0, polT = 2, polMade = 0;
  const onRoad = (x, z) => drive.areas.some((a) => a.y0 === undefined && x >= a.minX && x <= a.maxX && z >= a.minZ && z <= a.maxZ);
  const nearNode = (x, z) => { let b = null, bd = 1e9; for (let i = 0; i < xs.length; i++) for (let j = 0; j < zs.length; j++) { const d = Math.hypot(xs[i] - x, zs[j] - z); if (d < bd) { bd = d; b = [i, j]; } } return b; };
  const hops = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);   // (a full grid: the shortest way is just the steps across and along)
  const P = (n) => [xs[n[0]], zs[n[1]]];
  const nbrs = (n) => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [n[0] + a, n[1] + b]).filter(([a, b]) => a >= 0 && a < xs.length && b >= 0 && b < zs.length);
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  // a point on the right-hand lane of the street from node a to node b, s metres along from a
  const lanePt = (a, b, s) => { const [ax, az] = P(a), [bx, bz] = P(b), L = Math.hypot(bx - ax, bz - az) || 1, dx = (bx - ax) / L, dz = (bz - az) / L; return [ax + dx * s - dz * LANE, az + dz * s + dx * LANE, L, dx, dz]; };
  // (heading h has forward (sin h, cos h) and +x is its left, so the right of a direction (dx, dz) is (-dz, dx))
  const others = (self) => { const out = []; for (const g of drive.cars) { if (g === self.g) continue; out.push({ x: g.position.x, z: g.position.z, r: g.userData.half.zF * 0.75, t: g.userData.trafficRef || null, me: g === drive.car }); } const f = onFoot(); if (f) out.push({ x: f.x, z: f.z, r: 0.2, t: null, foot: true }); return out; };
  function place() { // a node away from you and from every car, facing along a street
    const me = drive.car ? drive.state : onFoot() || { x: 1e9, z: 1e9 };
    for (let k = 0; k < 12; k++) { const a = [Math.floor(Math.random() * xs.length), Math.floor(Math.random() * zs.length)], nb = nbrs(a), b = nb[Math.floor(Math.random() * nb.length)], s = 12 + Math.random() * 30, [x, z, , dx, dz] = lanePt(a, b, s);
      if (Math.hypot(x - me.x, z - me.z) < 55) continue; if (drive.cars.some((g) => Math.hypot(g.position.x - x, g.position.z - z) < 11)) continue; return { a, b, x, z, h: Math.atan2(dx, dz) }; }
    return null; }
  function add(pol = false) { const at = place(); if (!at) return; const g = pol ? police.spawn(polMade++) : spawn(made++); if (!g) return; g.position.set(at.x, 0, at.z); g.rotation.set(0, at.h, 0); const c = { g, id: nextId++, prev: at.a, node: at.b, x: at.x, z: at.z, h: at.h, v: 0, wait: 0, spin: 0, steer: 0, blockedBy: null, police: pol, stuck: 0, noDirect: 0 }; g.userData.trafficRef = c; drive.moving(g, true);
    g.userData.lamps.head.forEach((l) => { l.material.emissiveIntensity = 2.0; }); T.push(c); }
  function release(c) { const i = T.indexOf(c); if (i >= 0) T.splice(i, 1); c.g.userData.trafficRef = null; if (drive.cars.includes(c.g)) drive.moving(c.g, false); if (!c.police) spawnT = 14; }
  function update(dt) {
    const nPol = T.reduce((n, c) => n + (c.police ? 1 : 0), 0), tgt = police ? police.target() : null;
    if (!api.quiet && T.length - nPol < count && drive.cars.length < 26 && (spawnT -= dt) <= 0) { spawnT = 2.5; add(); }
    // a quiet spell: nothing new sets out, and what is on the road is gone once it is well away from you
    if (api.quiet) { const me = drive.car ? drive.state : onFoot(); for (const c of T.slice()) if (!c.police && (!me || Math.hypot(c.x - me.x, c.z - me.z) > 58)) { T.splice(T.indexOf(c), 1); c.g.userData.trafficRef = null; drive.remove(c.g); } }
    if (police && nPol < police.want() && drive.cars.length < 30 && (polT -= dt) <= 0) { polT = 3.5; add(true); }
    // police with nobody to chase leave once you cannot see them
    if (police && !tgt) for (const c of T.slice()) if (c.police) { const me = drive.car ? drive.state : onFoot(); if (!me || Math.hypot(c.x - me.x, c.z - me.z) > 75) { const i = T.indexOf(c); T.splice(i, 1); c.g.userData.trafficRef = null; drive.remove(c.g); } }
    // who is in whose way (first pass), so that two cars facing each other at a crossing do not both wait for ever
    for (const c of T) { const u = c.g.userData, d = u.dyn;
      if (c.police && c.g !== drive.car && !u.wreck && u.hp > u.hd.hpMax * 0.25) { if (d && (d.vx || d.vz || d.w)) { c.v *= 0.55; d.vx = d.vz = d.w = 0; } }   // (a police car shrugs off a knock and comes on)
      else if (c.g === drive.car || u.wreck || (d && Math.hypot(d.vx, d.vz) > 0.35) || u.hp < u.hd.hpMax * 0.55) { release(c); continue; }
      const sh = Math.sin(c.h), ch = Math.cos(c.h), reach = 4.5 + c.v * 1.15 + u.half.zF; let gap = 1e9, by = null;
      for (const o of others(c)) { const dx = o.x - c.x, dz = o.z - c.z, ahead = dx * sh + dz * ch, side = dx * ch - dz * sh; if (ahead > 0.5 && ahead - o.r < reach && Math.abs(side) < u.half.x + 0.95 + (o.foot ? 0.5 : 0)) { const gq = ahead - o.r - u.half.zF; if (gq < gap) { gap = gq; by = o; } } }
      c.gap = gap; c.blockedBy = by;
      // the crossing ahead: how far this car is from it (or -1 once it is through and clear)
      const [jx, jz] = P(c.node); c.jd = Math.hypot(jx - c.x, jz - c.z); c.jx = jx; c.jz = jz; }
    // give way at a crossing: a car coming up to one waits while another is in it or will be there first
    for (const c of T) { c.yield = false; if (c.jd > 19 || c.jd < 7.5) continue; for (const o of T) { if (o === c) continue; const od = Math.hypot(c.jx - o.x, c.jz - o.z); if (od > 17) continue; const sameWay = Math.abs(wrap(o.h - c.h)) < 0.5; if (sameWay) continue;   /* (the car ahead in this lane is the gap rule's business) */
        if (od < 7.5 || od < c.jd - 0.5 || (Math.abs(od - c.jd) <= 0.5 && o.id < c.id)) { if (!(o.yield && o.id > c.id)) c.yield = true; } } }
    for (const c of T) { const u = c.g.userData, sp = u.spec;
      if (u.body.userData.siren) { const on = c.police && tgt, ph = (performance.now() / 240) | 0; u.body.userData.siren[0].material.emissiveIntensity = on ? (ph % 2 ? 3 : 0.3) : 0.4; u.body.userData.siren[1].material.emissiveIntensity = on ? (ph % 2 ? 0.3 : 3) : 0.4; }
      if (c.police && tgt) { chase(c, tgt, dt); continue; }
      // where the lane goes: along the street to the next node; near it, choose the way on and take that street's lane
      let [, , L, dx, dz] = lanePt(c.prev, c.node, 0); const [ax, az] = P(c.prev); let s = (c.x - ax) * dx + (c.z - az) * dz;
      if (s > L - REACH) { const opts = nbrs(c.node).filter((n) => !same(n, c.prev)), nx = opts.length ? opts[Math.floor(Math.random() * opts.length)] : c.prev; c.prev = c.node; c.node = nx; [, , L, dx, dz] = lanePt(c.prev, c.node, 0); const [bx, bz] = P(c.prev); s = (c.x - bx) * dx + (c.z - bz) * dz; }
      const [tx, tz] = lanePt(c.prev, c.node, Math.max(s, -2) + 6.5), want = Math.atan2(tx - c.x, tz - c.z), dh = wrap(want - c.h);
      // speed: cruise, slower through a turn, nothing at all with something in the way (unless it is a car waiting for this one)
      let target = Math.abs(dh) > 0.3 ? TURN : CRUISE; const b = c.blockedBy;
      if (c.yield) target = Math.min(target, Math.max(0, (c.jd - 9.5) * 1.2));
      if (b && !(b.t && b.t.blockedBy && b.t.blockedBy.t === c && b.t.id > c.id)) target = c.gap < 2.2 ? 0 : Math.min(target, Math.max(0, (c.gap - 2.2) * 1.3));
      c.v += Math.max(-9 * dt, Math.min(2.6 * dt, target - c.v)); if (c.v < 0.05 && target === 0) c.v = 0;
      // stuck behind something that is not going to move: after a while, turn round and go another way
      c.wait = c.v < 0.3 ? c.wait + dt : 0; if (c.wait > 9) { c.wait = 0; const t = c.prev; c.prev = c.node; c.node = t; }
      const rate = Math.max(0.35, c.v / 5.2); c.h += Math.max(-rate * dt, Math.min(rate * dt, dh)) * (c.v > 0.2 || c.wait > 1 ? 1 : 0); c.steer += (Math.max(-0.55, Math.min(0.55, dh * 1.4)) - c.steer) * Math.min(1, dt * 6);
      c.x += Math.sin(c.h) * c.v * dt; c.z += Math.cos(c.h) * c.v * dt; c.spin += c.v / sp.R * dt;
      c.g.position.set(c.x, 0, c.z); c.g.rotation.set(0, c.h, 0); drive.follow(c.g);
      for (const w of u.wheels) { w.spin.rotation.x = c.spin; if (w.front) w.pivot.rotation.y = c.steer; }
      const braking = target < c.v - 0.5; for (const t of u.lamps.tail) if (!t.userData.dead) t.material.emissiveIntensity = braking ? 3.0 : 0.8; }
  }
  // ---- a police car after someone
  function chase(c, tgt, dt) { const u = c.g.userData, sp = u.spec, dist = Math.hypot(tgt.x - c.x, tgt.z - c.z); let want, target; c.noDirect = Math.max(0, c.noDirect - dt);
    if (dist < 32 && c.noDirect <= 0) {   // close: straight at them
      want = Math.atan2(tgt.x - c.x, tgt.z - c.z); const slow = tgt.foot || tgt.v < 2.5; target = slow ? (dist < 6.5 ? 0 : Math.min(15, (dist - 5.5) * 1.6)) : Math.min(19, tgt.v + 6.5); c.direct = true;
    } else {   // far: node to node, each time the neighbour nearest to where they are
      c.direct = false; const goal = nearNode(tgt.x, tgt.z); let [, , L, dx, dz] = lanePt(c.prev, c.node, 0); const [ax, az] = P(c.prev); let s = (c.x - ax) * dx + (c.z - az) * dz;
      if (s > L - REACH || same(c.prev, c.node)) { const nb = nbrs(c.node); let best = nb[0], bd = 1e9; for (const n of nb) { const d = hops(n, goal) + (same(n, c.prev) ? 0.5 : 0); if (d < bd) { bd = d; best = n; } } if (!same(c.node, goal) || s > L + 4) { c.prev = c.node; c.node = best; [, , L, dx, dz] = lanePt(c.prev, c.node, 0); const [bx, bz] = P(c.prev); s = (c.x - bx) * dx + (c.z - bz) * dz; } }
      const [tx, tz] = lanePt(c.prev, c.node, Math.max(s, -2) + 7.5); want = Math.atan2(tx - c.x, tz - c.z); target = Math.abs(wrap(want - c.h)) > 0.3 ? 6.5 : 15.5; }
    const dh = wrap(want - c.h), b = c.blockedBy; if (b && !b.me && !(tgt.foot && b.foot)) target = c.gap < 2 ? 0 : Math.min(target, Math.max(0, (c.gap - 2) * 1.6)); if (b && (b.foot || (b.me && tgt.v < 2.5)) && c.gap < 2.5) target = 0;
    c.v += Math.max(-11 * dt, Math.min(4.2 * dt, target - c.v)); if (c.v < 0.05 && target === 0) c.v = 0;
    const rate = Math.max(0.5, c.v / 4.6); c.h += Math.max(-rate * dt, Math.min(rate * dt, dh)) * (c.v > 0.2 || c.stuck > 0.3 ? 1 : 0); c.steer += (Math.max(-0.55, Math.min(0.55, dh * 1.4)) - c.steer) * Math.min(1, dt * 6);
    // walls: only on ground a car can be on. Held up against one for long, it gives up the straight line and goes round by the streets.
    const nx = c.x + Math.sin(c.h) * c.v * dt, nz = c.z + Math.cos(c.h) * c.v * dt, fz = u.half.zF + 0.3, okF = onRoad(nx + Math.sin(c.h) * fz, nz + Math.cos(c.h) * fz) && onRoad(nx, nz);
    if (okF) { c.x = nx; c.z = nz; } else c.v = 0;
    c.stuck = c.v < 0.3 && target > 1 ? c.stuck + dt : 0; if (c.stuck > 2.5 && c.direct) { c.stuck = 0; c.noDirect = 7; const a = nearNode(c.x, c.z); c.prev = a; c.node = a; }
    c.spin += c.v / sp.R * dt; c.g.position.set(c.x, 0, c.z); c.g.rotation.set(0, c.h, 0); drive.follow(c.g); for (const w of u.wheels) { w.spin.rotation.x = c.spin; if (w.front) w.pivot.rotation.y = c.steer; } }
  const api = { quiet: false, update, cars: T, reset() { T.length = 0; spawnT = 1.5; } }; return api;
}
