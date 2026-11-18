// Three-storey red-brick walk-up from the apartment photos (name made up:
// "Elmwood Apartments").
// Outside: brick front with arched top-floor windows, stone sills and band,
// stepped parapet, garden-level windows with AC units, and a brick stoop with
// flared cheek walls up to a raised entry with an arched transom and lamp.
// Inside (walkable): vestibule with mailboxes, laminate-floored hallway with
// white beadboard walls, tan trim, six-panel unit doors with brass knobs and
// dark mats, ceiling light panels; a straight stair with rubber treads and a
// glow strip up to the second-floor hallway with a white railing and window.
// Local axes: front faces +z, centre of the footprint at x = 0, z = 0.
import * as THREE from 'three';
import { box, canvasTexture } from '../world/util.js';
import { makeWindow } from './buildings.js';
import { makeLivingRoom } from './livingroom.js';
import { holeyWall, extWindow, makeAC, makeUnitDoor, doorCasing, makeUnit } from './units.js';

const loader = new THREE.TextureLoader();
function tex(name, rx = 1, ry = 1, color = true) {
  const t = loader.load(`assets/textures/${name}`);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, ...o });

// A plane whose texture repeats every `unit` metres.
function plane(mat, w, h, unitU, unitV = unitU) {
  const g = new THREE.PlaneGeometry(w, h);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / unitU, uv.getY(i) * h / unitV);
  const m = new THREE.Mesh(g, mat);
  m.receiveShadow = true;
  return m;
}

export const APT = {
  W: 14, D: 10,
  F1: 1.4,      // raised first floor (stoop height)
  F2: 4.4,      // second floor
  FH: 3.0,
  hall: { x0: -0.95, x1: 0.95 },     // hallway strip, centred on the building
  stair: { x0: 1.05, x1: 2.05, z0: -2.6, z1: 2.4 }, // climbs toward -z
};

function sixPanelDoor(M, w = 0.86, h = 2.03) {
  const g = new THREE.Group();
  g.add(box(w, h, 0.045, M.doorWhite, 0, h / 2, 0));
  const pw = (w - 0.3) / 2;
  for (const sx of [-1, 1]) {
    for (const [y, ph] of [[1.68, 0.4], [1.08, 0.62], [0.4, 0.55]]) g.add(box(pw, ph, 0.012, M.doorPanel, sx * (pw / 2 + 0.05), y, 0.027, { shadow: false }));
  }
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), M.brass);
  knob.position.set(w / 2 - 0.08, 0.95, 0.05);
  const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 16), M.brass);
  bolt.rotation.x = Math.PI / 2;
  bolt.position.set(w / 2 - 0.08, 1.12, 0.035);
  g.add(knob, bolt);
  // tan casing
  g.add(box(0.07, h + 0.07, 0.03, M.trim, -w / 2 - 0.035, (h + 0.07) / 2, 0.02));
  g.add(box(0.07, h + 0.07, 0.03, M.trim, w / 2 + 0.035, (h + 0.07) / 2, 0.02));
  g.add(box(w + 0.14, 0.07, 0.03, M.trim, 0, h + 0.035, 0.02));
  return g;
}

export function makeApartment() {
  const { W, D, F1, F2, FH, hall, stair } = APT;
  const M = {
    brick: std({ map: tex('wall_red_brick.png'), normalMap: tex('wall_red_brick_normal.png', 1, 1, false), color: '#f0d8cc', roughness: 0.9 }),
    stone: std({ color: '#cfc5b2', roughness: 0.9 }),
    bead: std({ map: tex('beadboard.png'), color: '#f2f1ec', side: THREE.DoubleSide }),
    trim: std({ color: '#c9b48c', roughness: 0.6 }),
    floor: std({ map: tex('laminate_oak.png'), roughness: 0.35 }),
    tread: std({ map: tex('stair_tread.png'), roughness: 0.6 }),
    riser: std({ color: '#d8d6d0' }),
    ceiling: std({ color: '#efeee9', emissive: '#6a6860' }),
    doorWhite: std({ color: '#f3f2ee', roughness: 0.5 }),
    doorPanel: std({ color: '#e8e7e2', roughness: 0.5 }),
    brass: std({ color: '#b08a3e', metalness: 0.9, roughness: 0.3 }),
    mat: std({ color: '#1d1e20', roughness: 1 }),
    concrete: std({ map: tex('sidewalk.png'), color: '#c9c6bf', roughness: 0.95 }),
    rail: std({ color: '#f0eee8', roughness: 0.5 }),
    light: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.7, 1.72, 1.75), toneMapped: false }),
    warm: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 1.75, 1.3), toneMapped: false }),
    mailbox: std({ map: tex('mailboxes.png'), roughness: 0.4, metalness: 0.5 }),
    dark: std({ color: '#121315' }),
  };
  M.floor.map.repeat.set(1, 1);
  const g = new THREE.Group();
  g.name = 'elmwood_apartments';
  const zf = D / 2, zb = -D / 2, H = F1 + 3 * FH + 0.6;
  const colliders = [];   // [x0, x1, z0, z1, y0?, y1?]
  const solid = (...r) => colliders.push(r);

  // ------------------------------------------------ exterior shell
  const brick = (w, h) => plane(M.brick, w, h, 0.86, 0.61);
  const doorW = 1.1, doorH = 2.3;
  // front wall with an opening for the entry door (x -0.95..0.15 = hallway centre)
  const dx0 = (hall.x0 + hall.x1) / 2 - doorW / 2, dx1 = dx0 + doorW;
  // Every window on the two lived-in floors is a real opening matched to the room behind it.
  // side/wall frames: local +z out of the building, u along the wall
  const I = { x0: hall.x0, x1: stair.x1 + 0.02, z0: zb + 0.2, z1: zf - 0.25 };
  const WALLS = {
    front: { pos: [0, 0, zf], ry: 0, len: W, u: (c) => c, T: zf - I.z1 },
    back: { pos: [0, 0, zb], ry: Math.PI, len: W, u: (c) => -c, T: I.z0 - zb },
    west: { pos: [-W / 2, 0, 0], ry: -Math.PI / 2, len: D, u: (c) => c, T: 0.2 },
    east: { pos: [W / 2, 0, 0], ry: Math.PI / 2, len: D, u: (c) => -c, T: 0.2 },
  };
  const WIN = [];
  const win = (side, c, F, ac = false, w = 1.2, h = 1.5, yo = 1.5) => WIN.push({ side, c, F, w, h, yc: F + yo, ac });
  for (const F of [F1, F2]) {
    win('back', -5.3, F); win('back', -3.4, F); win('back', 3.4, F); win('back', 5.3, F);
    win('front', 3.4, F); win('front', 5.3, F);
    win('back', 0, F, false, 1.0, 1.4, 1.6);                       // hallway end windows
  }
  win('front', -5.3, F1); win('front', -3.4, F1); win('front', -5.3, F2); win('front', -3.4, F2);
  win('front', 0, F2, false, 1.0, 1.4, 1.6);                         // over the entry: upstairs hall window
  win('west', -2.7, F1, true); win('west', -2.7, F2); win('west', 2.0, F2);
  win('east', 2.0, F1, true); win('east', 2.0, F2); win('east', -2.7, F1); win('east', -2.7, F2, true);
  for (const [side, wl] of Object.entries(WALLS)) {
    const holes = WIN.filter((o) => o.side === side).map((o) => ({ u0: wl.u(o.c) - o.w / 2, u1: wl.u(o.c) + o.w / 2, y0: o.yc - o.h / 2, y1: o.yc + o.h / 2 }));
    if (side === 'front') holes.push({ u0: dx0, u1: dx1, y0: F1, y1: F1 + doorH, arch: true });
    const frame = new THREE.Group(); frame.position.set(...wl.pos); frame.rotation.y = wl.ry;
    const wall = holeyWall(wl.len, H, holes, M.brick, 0.86, 0.61); wall.castShadow = true; frame.add(wall);
    for (const o of WIN.filter((q) => q.side === side)) {
      frame.add(extWindow({ u: wl.u(o.c), yc: o.yc, w: o.w, h: o.h, T: wl.T, stone: M.stone, raised: o.ac ? 0.44 : 0 }));
      if (o.ac) frame.add(makeAC({ u: wl.u(o.c), ySill: o.yc - o.h / 2 + 0.04, T: wl.T, winW: o.w }));
    }
    // third floor (no interior): curtained windows on the solid wall, arched on the front
    const top = side === 'front' ? [-5.3, -3.4, 0, 3.4, 5.3] : side === 'back' ? [-5.3, -3.4, 3.4, 5.3] : [-2.7, 2.0];
    for (const c of top) {
      const y = F1 + 2 * FH + 1.5, u = wl.u(c);
      const wm = makeWindow(c === 0 ? 1.0 : 1.2, 1.5, (Math.round(c * 3) + side.length) % 3 === 0); wm.position.set(u, y, 0.01); frame.add(wm);
      frame.add(box(1.4, 0.08, 0.22, M.stone, u, y - 0.8, 0.08));
      if (side === 'front') {
        const r0 = c === 0 ? 0.5 : 0.6;
        const arch = new THREE.Mesh(new THREE.CircleGeometry(r0, 24, 0, Math.PI), M.dark); arch.position.set(u, y + 0.75, 0.012); frame.add(arch);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r0 + 0.04, 0.05, 6, 24, Math.PI), M.stone); ring.position.set(u, y + 0.75, 0.04); frame.add(ring);
      }
    }
    g.add(frame);
  }
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ color: '#2e2f31' }));
  roof.rotation.x = -Math.PI / 2;
  roof.position.y = H - 0.5;
  g.add(roof);
  solid(-W / 2, dx0, zf - 0.25, zf + 0.05); solid(dx1, W / 2, zf - 0.25, zf + 0.05);
  solid(-W / 2, W / 2, zb - 0.05, zb + 0.2);
  solid(-W / 2 - 0.05, -W / 2 + 0.2, zb, zf); solid(W / 2 - 0.2, W / 2 + 0.05, zb, zf);

  // stone band + stepped parapet with diamond accents (front photo)
  g.add(box(W + 0.1, 0.18, 0.12, M.stone, 0, F1 + 2 * FH - 0.2, zf + 0.05));
  g.add(box(W + 0.12, 0.12, 0.2, M.stone, 0, H + 0.06, zf - 0.05));
  g.add(box(4.2, 0.9, 0.3, M.brick, 0, H + 0.45, zf - 0.1));
  g.add(box(4.3, 0.1, 0.36, M.stone, 0, H + 0.95, zf - 0.1));
  for (const x of [-5.5, -3.0, 3.0, 5.5]) {
    const d = box(0.28, 0.28, 0.04, M.stone, x, H - 0.45, zf + 0.02);
    d.rotation.z = Math.PI / 4;
    g.add(d);
  }

  // garden-level windows (basement)
  for (const x of [-4.35, 4.35]) {
    const w = makeWindow(1.6, 0.7, false);
    w.position.set(x, 0.55, zf + 0.01);
    g.add(w);
  }
  // name stone over the entry
  const ns = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.45), std({ map: tex('apt_name_stone.png') }));
  ns.position.set(dx1 + 1.25, F1 + 1.55, zf + 0.02); ns.scale.setScalar(0.62);   // beside the door, like the photo
  g.add(ns);
  // entry: arched transom (lit), wall lamp, door
  const tr = new THREE.Mesh(new THREE.CircleGeometry(doorW / 2, 24, 0, Math.PI), M.warm);
  tr.position.set((dx0 + dx1) / 2, F1 + doorH + 0.02, zf - 0.04);
  g.add(tr);
  const lamp = box(0.14, 0.24, 0.1, M.warm, dx1 + 0.35, F1 + 2.2, zf + 0.06, { shadow: false });
  g.add(lamp);
  const el = new THREE.PointLight('#ffe2b5', 4, 8, 2);
  el.position.set((dx0 + dx1) / 2, F1 + 2.4, zf + 1.4);
  g.add(el);

  // ------------------------------------------------ brick stoop (front photos)
  // Grey concrete steps between thick brick cheek walls; each wall slopes down with
  // the stair and ends in a square brick pier with a stone cap.
  const steps = 8, rise = F1 / steps, run = 0.32;
  const sw = 1.9, scx = (dx0 + dx1) / 2;
  const landD = 1.1;
  const stepMat = std({ map: tex('sidewalk.png'), color: '#a7a49e', roughness: 0.95 });
  g.add(box(sw, F1, landD, stepMat, scx, F1 / 2, zf + landD / 2));
  for (let i = 0; i < steps; i++) {
    const h = rise * (steps - i);                    // i = 0 is the top step next to the landing
    const zz = zf + landD + i * run + run / 2;
    g.add(box(sw, h, run, stepMat, scx, h / 2, zz));
    g.add(box(sw + 0.02, 0.025, 0.04, std({ color: '#7d7b77' }), scx, h - 0.012, zz + run / 2 - 0.02, { shadow: false })); // nosing
  }
  const stoopEnd = zf + landD + steps * run;
  const T = 0.42;                                    // wall thickness
  const brickSide = (len, hgt) => plane(M.brick, len, hgt, 0.86, 0.61);
  for (const s of [-1, 1]) {
    const xc = scx + s * (sw / 2 + T / 2);
    // profile in (z, y): level beside the landing, then sloping down with the steps
    const top = (z) => (z <= zf + landD ? F1 + 0.9 : Math.max(0.8, F1 + 0.9 - (z - zf - landD) * (rise / run)));
    const pts = [[zf, 0], [stoopEnd, 0], [stoopEnd, top(stoopEnd)], [zf + landD, F1 + 0.9], [zf, F1 + 0.9]];
    const shape = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(z, y)));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false });
    geo.rotateY(-Math.PI / 2);                       // shape x -> world z, extrusion -> world -x
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 0.86, uv.getY(i) / 0.61);
    const wall = new THREE.Mesh(geo, M.brick);
    wall.position.x = xc + T / 2;
    wall.castShadow = wall.receiveShadow = true;
    g.add(wall);
    // stone cap following the top: level part + sloped part
    g.add(box(T + 0.08, 0.07, landD, M.stone, xc, F1 + 0.935, zf + landD / 2));
    const slopeLen = Math.hypot(stoopEnd - zf - landD, F1 + 0.9 - top(stoopEnd));
    const cap = box(T + 0.08, 0.07, slopeLen, M.stone, xc, (F1 + 0.9 + top(stoopEnd)) / 2 + 0.035, (zf + landD + stoopEnd) / 2);
    cap.rotation.x = Math.atan2(F1 + 0.9 - top(stoopEnd), stoopEnd - zf - landD);
    g.add(cap);
    // the wall ends in a square brick pier with a stone cap (front photos)
    const P = 0.56;
    // pier rises above the end of the sloped wall, so the slope dies into its side
    const PH = top(stoopEnd) + 0.35;
    const pier = box(P, PH, P, M.brick, xc, PH / 2, stoopEnd + P / 2 - 0.08);
    g.add(pier);
    g.add(box(P + 0.08, 0.08, P + 0.08, M.stone, xc, PH + 0.04, pier.position.z));
    solid(xc - T / 2, xc + T / 2, zf, stoopEnd);
    solid(xc - P / 2, xc + P / 2, pier.position.z - P / 2, pier.position.z + P / 2);
  }

  // ------------------------------------------------ interior
  const innerW = I.x1 - I.x0, innerD = I.z1 - I.z0;
  // unit doors off the hallway: [side of the hall, z, number]
  const DOORS = [['west', 0.8, '1A'], ['west', -3.2, '1B'], ['east', 3.6, '1C'], ['east', -3.8, '1D']];
  const DW = 0.9;
  const unitDoors = [];
  const hallWin = WIN.filter((o) => o.c === 0);
  for (const [fy, isTop] of [[F1, false], [F2, true]]) {
    const fl = isTop ? '2' : '1';
    // floor (upstairs has the stair opening)
    const floorPiece = (x0, x1, z0, z1) => {
      const p = plane(M.floor, x1 - x0, z1 - z0, 1.0, 2.0);
      p.rotation.x = -Math.PI / 2;
      p.position.set((x0 + x1) / 2, fy + 0.005, (z0 + z1) / 2);
      g.add(p);
    };
    if (isTop) {
      floorPiece(I.x0, stair.x0, I.z0, I.z1);
      floorPiece(stair.x0, I.x1, I.z0, stair.z0);
      floorPiece(stair.x0, I.x1, stair.z1, I.z1);
    } else floorPiece(I.x0, I.x1, I.z0, I.z1);
    // ceiling: first-floor ceiling stops at the stair so it doesn't cap the stairwell
    const ceil = (x0, x1, z0, z1) => { const c = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), M.ceiling); c.rotation.x = Math.PI / 2; c.position.set((x0 + x1) / 2, fy + FH - 0.02, (z0 + z1) / 2); g.add(c); };
    if (isTop) ceil(I.x0, I.x1, I.z0, I.z1);
    else { ceil(I.x0, stair.x0 - 0.12, I.z0, I.z1); ceil(stair.x0 - 0.12, I.x1, I.z0, stair.z0); ceil(stair.x0 - 0.12, I.x1, stair.z1, I.z1); }
    for (const z of [-3.6, 3.5]) g.add(box(0.55, 0.02, 1.1, M.light, (hall.x0 + hall.x1) / 2, fy + FH - 0.035, z, { shadow: false }));
    // beadboard side walls with the unit doorways
    for (const [side, x, ry] of [['west', I.x0, Math.PI / 2], ['east', I.x1, -Math.PI / 2]]) {
      const ds = DOORS.filter((d) => d[0] === side);
      const uOf = (z) => (ry > 0 ? -(z - (I.z0 + I.z1) / 2) : z - (I.z0 + I.z1) / 2);
      const holes = ds.map(([, z]) => ({ u0: uOf(z) - DW / 2, u1: uOf(z) + DW / 2, y0: 0, y1: 2.08 }));
      const wm = holeyWall(innerD, FH, holes, M.bead, 0.8, FH);
      const frame = new THREE.Group(); frame.position.set(x, fy, (I.z0 + I.z1) / 2); frame.rotation.y = ry; frame.add(wm); g.add(frame);
      // baseboard segments, tan casings, door leaves, mats
      let a0 = -innerD / 2;
      for (const h of [...holes].sort((p, q) => p.u0 - q.u0)) { frame.add(box(h.u0 - 0.08 - a0, 0.1, 0.02, M.trim, (a0 + h.u0 - 0.08) / 2, 0.05, 0.01)); a0 = h.u1 + 0.08; }
      frame.add(box(innerD / 2 - a0, 0.1, 0.02, M.trim, (a0 + innerD / 2) / 2, 0.05, 0.01));
      for (const [, z, num] of ds) {
        const cs = doorCasing(DW, 2.08, M.trim); cs.position.x = uOf(z); frame.add(cs);
        const hand = side === 'west' ? 1 : -1;
        const pivot = new THREE.Group();
        pivot.position.set(x + (side === 'west' ? 0.02 : -0.02), fy, z + DW / 2 - 0.02);
        const leaf = makeUnitDoor({ w: DW - 0.04, h: 2.04, hand, number: num.replace('1', fl) });
        leaf.rotation.y = side === 'west' ? Math.PI / 2 : -Math.PI / 2;
        leaf.position.z = -(DW - 0.04) / 2;
        pivot.add(leaf); g.add(pivot);
        g.add(box(0.5, 0.012, 0.8, M.mat, x + (side === 'west' ? 0.35 : -0.35), fy + 0.006, z, { shadow: false }));
        const sgn = side === 'west' ? 1 : -1;
        unitDoors.push({
          setOpen: (t) => { pivot.rotation.y = sgn * t * 1.45; },
          at: [x, z], gap: [x - 0.12, x + 0.12, z - DW / 2, z + DW / 2], y: fy,
        });
      }
      // wall colliders for this floor, leaving the doorways open
      let zs = [[I.z0, I.z1]];
      for (const [, z] of ds) zs = zs.flatMap(([p, q]) => (z + DW / 2 <= p || z - DW / 2 >= q ? [[p, q]] : [[p, z - DW / 2], [z + DW / 2, q]]));
      for (const [p, q] of zs) colliders.push(side === 'west' ? [x - 0.2, x, p, q, fy, fy + 1] : [x, x + 0.2, p, q, fy, fy + 1]);
    }
    // back (end of hall) wall with the hallway window
    const bwHoles = hallWin.filter((o) => o.side === 'back' && o.F === fy).map((o) => ({ u0: -o.w / 2 + 0.0, u1: o.w / 2, y0: o.yc - fy - o.h / 2, y1: o.yc - fy + o.h / 2 }));
    const bwm = holeyWall(innerW, FH, bwHoles.map((h2) => ({ ...h2, u0: h2.u0 - (I.x0 + I.x1) / 2, u1: h2.u1 - (I.x0 + I.x1) / 2 })), M.bead, 0.8, FH);
    bwm.position.set((I.x0 + I.x1) / 2, fy, I.z0); g.add(bwm);
    colliders.push([I.x0, I.x1, I.z0 - 0.2, I.z0, fy, fy + 1]);
    // front wall: entry door on the first floor, hall window over the entry upstairs
    const fh = isTop ? hallWin.filter((o) => o.side === 'front').map((o) => ({ u0: -o.w / 2, u1: o.w / 2, y0: o.yc - fy - o.h / 2, y1: o.yc - fy + o.h / 2 }))
      : [{ u0: dx0, u1: dx1, y0: 0, y1: doorH, arch: true }];
    const cxI = (I.x0 + I.x1) / 2;
    const fwm = holeyWall(innerW, FH, fh.map((h2) => ({ ...h2, u0: cxI - h2.u1, u1: cxI - h2.u0 })), M.bead, 0.8, FH);
    fwm.position.set(cxI, fy, I.z1); fwm.rotation.y = Math.PI; g.add(fwm);
    if (!isTop) {
      // entry reveal through the wall thickness + transom glow
      g.add(box(0.03, doorH, zf - I.z1, M.trim, dx0, F1 + doorH / 2, (zf + I.z1) / 2), box(0.03, doorH, zf - I.z1, M.trim, dx1, F1 + doorH / 2, (zf + I.z1) / 2));
    }
    for (const o of hallWin.filter((q) => q.F === fy)) {
      // interior trim + stool on hall windows
      const zz = o.side === 'front' ? I.z1 - 0.012 : I.z0 + 0.012, sg = o.side === 'front' ? -1 : 1;
      for (const s2 of [-1, 1]) g.add(box(0.07, o.h + 0.07, 0.02, M.trim, s2 * (o.w / 2 + 0.035), o.yc, zz));
      g.add(box(o.w + 0.14, 0.07, 0.02, M.trim, 0, o.yc + o.h / 2 + 0.035, zz));
      g.add(box(o.w + 0.18, 0.035, 0.12, M.trim, 0, o.yc - o.h / 2 - 0.017, zz + sg * 0.05));
    }
  }
  // the entry wall colliders either side of the door
  colliders.push([I.x0, dx0, I.z1 - 0.05, zf, F1, F1 + 1], [dx1, I.x1, I.z1 - 0.05, zf, F1, F1 + 1]);
  colliders.push([I.x0, I.x1, I.z1 - 0.2, I.z1, F2, F2 + 1]);
  colliders.push([stair.x0, stair.x1, stair.z0 - 0.25, stair.z0, F1, F1]); // can't walk into the top of the stair from below
  // ------------------------------------------------ the eight units (living room = 1A)
  const ux = { w0: -W / 2 + 0.2, w1: I.x0 - 0.02, e0: I.x1 + 0.03, e1: W / 2 - 0.2 }, zMid = -0.6;
  const unitWins = (x0, x1, z0, z1, F) => WIN.filter((o) => o.F === F && o.c !== 0 && (
    (o.side === 'front' && z1 > I.z1 - 0.01 && o.c > x0 && o.c < x1) || (o.side === 'back' && z0 < I.z0 + 0.01 && o.c > x0 && o.c < x1)
    || (o.side === 'west' && x0 < -W / 2 + 0.3 && o.c > z0 && o.c < z1) || (o.side === 'east' && x1 > W / 2 - 0.3 && o.c > z0 && o.c < z1)));
  const LR = { x0: ux.w0, x1: ux.w1, z0: zMid, z1: I.z1 };
  const living = makeLivingRoom({ F1, FH, x0: LR.x0, x1: LR.x1, z0: LR.z0, z1: LR.z1, doorZ: 0.8, doorW: DW });
  g.add(living);
  colliders.push(...living.userData.colliders);
  const UNITS = [
    [F1, ux.w0, ux.w1, I.z0, zMid, 'east', -3.2, 'kitchen', 3, 'front', '#e8e0cc'],
    [F1, ux.e0, ux.e1, zMid, I.z1, 'west', 3.6, 'studio', 5, 'back', '#dfe6e2'],
    [F1, ux.e0, ux.e1, I.z0, zMid, 'west', -3.8, 'bedroom', 7, 'front', '#e6dcd8'],
    [F2, ux.w0, ux.w1, zMid, I.z1, 'east', 0.8, 'bedroom', 2, 'back', '#dce2ea'],
    [F2, ux.w0, ux.w1, I.z0, zMid, 'east', -3.2, 'studio', 4, 'front', '#ece6d6'],
    [F2, ux.e0, ux.e1, zMid, I.z1, 'west', 3.6, 'kitchen', 6, 'back', '#e2e8d8'],
    [F2, ux.e0, ux.e1, I.z0, zMid, 'west', -3.8, 'bedroom2', 8, 'front', '#e8e2d2'],
  ];
  for (const [F, x0, x1, z0, z1, dside, dz, kind, seed, facing, paint] of UNITS) {
    const u = makeUnit({ x0, x1, z0, z1, F, FH, door: { side: dside, z: dz, w: DW }, windows: unitWins(x0, x1, z0, z1, F), kind, seed, paint, facing });
    g.add(u);
    colliders.push(...u.userData.colliders);
  }
  // first-floor vestibule mailboxes
  const mb = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.55), M.mailbox);
  mb.position.set(I.x0 + 0.034, F1 + 1.35, I.z1 - 1.6);
  mb.rotation.y = Math.PI / 2;
  g.add(mb);
  g.add(box(0.03, 0.65, 1.42, M.trim, I.x0 + 0.015, F1 + 1.35, I.z1 - 1.6));
  // mats at the entry and at the top of the stairs
  g.add(box(0.9, 0.012, 1.4, M.mat, (hall.x0 + hall.x1) / 2, F1 + 0.006, I.z1 - 0.9, { shadow: false }));
  g.add(box(0.9, 0.012, 1.2, M.mat, (stair.x0 + stair.x1) / 2, F2 + 0.006, stair.z0 - 0.8, { shadow: false }));
  // interior lights (the light budget keeps only the nearest few on)
  for (const [y, z] of [[F1, 0.5], [F2, -1.5]]) {
    const l = new THREE.PointLight('#f4f6ff', 3, 8, 2);
    l.position.set((I.x0 + I.x1) / 2, y + FH - 0.4, z);
    g.add(l);
  }

  // stair: treads with glow strip, white risers, half wall + handrail
  const n = Math.round((F2 - F1) / 0.176);
  const r2 = (F2 - F1) / n, t2 = (stair.z1 - stair.z0) / n;
  for (let i = 0; i < n; i++) {
    const zTop = stair.z1 - i * t2;
    const y = F1 + (i + 1) * r2;
    const tr2 = new THREE.Mesh(new THREE.BoxGeometry(stair.x1 - stair.x0, 0.03, t2), M.tread);
    tr2.position.set((stair.x0 + stair.x1) / 2, y - 0.015, zTop - t2 / 2);
    g.add(tr2);
    g.add(box(stair.x1 - stair.x0, r2, 0.02, M.riser, (stair.x0 + stair.x1) / 2, y - r2 / 2, zTop, { shadow: false }));
  }
  // half wall between hall and stair (first floor) and railing around the opening (second floor)
  g.add(box(0.12, 1.0, stair.z1 - stair.z0 + 0.6, M.bead, stair.x0 - 0.06, F1 + 0.5, (stair.z0 + stair.z1) / 2 + 0.3));
  g.add(box(0.16, 0.05, stair.z1 - stair.z0 + 0.6, M.trim, stair.x0 - 0.06, F1 + 1.02, (stair.z0 + stair.z1) / 2 + 0.3));
  colliders.push([stair.x0 - 0.12, stair.x0, stair.z0, stair.z1 + 0.6, F1, F2]);
  const railY = F2 + 0.95;
  g.add(box(0.06, 0.06, stair.z1 - stair.z0, M.rail, stair.x0 - 0.03, railY, (stair.z0 + stair.z1) / 2));
  g.add(box(stair.x1 - stair.x0, 0.06, 0.06, M.rail, (stair.x0 + stair.x1) / 2, railY, stair.z1));
  for (let z = stair.z0 + 0.12; z < stair.z1; z += 0.12) g.add(box(0.03, 0.95, 0.03, M.rail, stair.x0 - 0.03, F2 + 0.475, z, { shadow: false }));
  for (let x = stair.x0 + 0.12; x < stair.x1; x += 0.12) g.add(box(0.03, 0.95, 0.03, M.rail, x, F2 + 0.475, stair.z1, { shadow: false }));
  colliders.push([stair.x0 - 0.08, stair.x0 + 0.02, stair.z0, stair.z1, F2, F2]);
  colliders.push([stair.x0, stair.x1, stair.z1 - 0.02, stair.z1 + 0.08, F2, F2]);
  // ceiling over the first-floor stair opening is the second floor's underside: add it except over the stair
  const und = plane(M.ceiling, I.x1 - I.x0, 0.01, 1, 1); und.visible = false; g.add(und);

  // ------------------------------------------------ entry door (opens inward)
  const pivot = new THREE.Group();
  const leaf = makeUnitDoor({ w: doorW - 0.06, h: doorH - 0.04, hand: 1, lite: true });
  leaf.position.x = (doorW - 0.06) / 2;
  pivot.add(leaf);
  pivot.position.set(dx0 + 0.03, F1, zf - 0.12);
  g.add(pivot);

  // ------------------------------------------------ walking heights
  const sx0 = scx - sw / 2, sx1 = scx + sw / 2;
  g.userData.floorY = (x, z, prevY) => {
    // outdoor stoop
    if (x > sx0 && x < sx1 && z > zf && z < stoopEnd + 0.2) {
      if (z < zf + landD) return F1;
      return Math.max(0, rise * (steps - Math.floor((z - zf - landD) / run)));
    }
    if (x < -W / 2 + 0.1 || x > W / 2 - 0.1 || z < zb + 0.1 || z > zf + 0.1) return null; // not inside
    if (prevY < F1 - 0.7) return null;      // still outside / below the raised floor
    const inStair = x > stair.x0 && x < stair.x1 && z > stair.z0 - 0.05 && z < stair.z1 + 0.05;
    if (inStair) {
      const t = (stair.z1 - z) / (stair.z1 - stair.z0);
      const sy = F1 + Math.max(0, Math.min(1, t)) * (F2 - F1);
      return sy;
    }
    // choose the floor nearest to where you were (so walking past the stair keeps your level)
    return Math.abs(prevY - F2) < Math.abs(prevY - F1) ? F2 : F1;
  };
  g.userData.colliders = colliders;
  g.userData.unitDoors = unitDoors;
  g.userData.door = {
    setOpen: (t) => { pivot.rotation.y = t * 1.5; },
    at: [(dx0 + dx1) / 2, zf], gap: [dx0, dx1, zf - 0.25, zf + 0.05], y: F1,
  };
  g.userData.interior = { x0: I.x0, x1: I.x1, z0: I.z0, z1: zf + 0.3 };
  g.userData.stoop = { x0: sx0, x1: sx1, z0: zf, z1: stoopEnd + 0.4 };
  return g;
}
