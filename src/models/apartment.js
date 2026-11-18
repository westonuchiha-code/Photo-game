// Three-storey red-brick walk-up from the apartment photos (name made up:
// "Elmwood Apartments"): garden level, raised entry floor, top floor, six apartments per floor
// (three each side of the hallway), every apartment with real windows front/back and on the side.
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
  F0: -1.6,     // garden-level (basement) floor
  F1: 1.4,      // raised entry floor (stoop height)
  F2: 4.4,      // top floor
  FH: 3.0,
  hall: { x0: -1.8, x1: 1.8 },        // hallway, centred on the building
  stair: { x0: -0.55, x1: 0.55, z0: -2.6, z1: 2.4 }, // centre stairwell: up-flight climbs toward -z, down-flight under it toward +z
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
  const { W, D, F0, F1, F2, FH, hall, stair } = APT;
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
    mat: std({ color: '#1d1e20', roughness: 1 }),
    rail: std({ color: '#f0eee8', roughness: 0.5 }),
    light: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.7, 1.72, 1.75), toneMapped: false }),
    warm: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 1.75, 1.3), toneMapped: false }),
    mailbox: std({ map: tex('mailboxes.png'), roughness: 0.4, metalness: 0.5 }),
    dark: std({ color: '#121315' }),
  };
  const g = new THREE.Group();
  g.name = 'elmwood_apartments';
  const zf = D / 2, zb = -D / 2, H = F2 + FH + 0.6;
  const FLOORS = [F0, F1, F2];
  const colliders = [];   // [x0, x1, z0, z1, y0?, y1?]
  const solid = (...r) => colliders.push(r);
  const doorW = 1.1, doorH = 2.3;
  const dx0 = -doorW / 2, dx1 = doorW / 2;
  const I = { x0: hall.x0, x1: hall.x1, z0: zb + 0.2, z1: zf - 0.25 };
  // three apartments per side: z ranges + where their side window and hall door go
  const ZS = [[1.57, I.z1], [-1.62, 1.57], [I.z0, -1.62]];
  const SIDE_C = [2.35, 0.0, -3.2], DOOR_Z = [3.1, 0.0, -3.2];

  // ------------------------------------------------ exterior shell with real window openings
  const WALLS = {
    front: { pos: [0, 0, zf], ry: 0, len: W, u: (c) => c, T: zf - I.z1 },
    back: { pos: [0, 0, zb], ry: Math.PI, len: W, u: (c) => -c, T: I.z0 - zb },
    west: { pos: [-W / 2, 0, 0], ry: -Math.PI / 2, len: D, u: (c) => c, T: 0.2 },
    east: { pos: [W / 2, 0, 0], ry: Math.PI / 2, len: D, u: (c) => -c, T: 0.2 },
  };
  const WIN = [];
  const ACS = new Set(['west|0|' + F1, 'east|2.35|' + F2, 'east|-3.2|' + F1, 'west|-3.2|' + F2, 'east|0|' + F2]);
  for (const F of FLOORS) {
    const garden = F === F0;
    const yc = garden ? 0.55 : F + 1.5, h = garden ? 0.8 : 1.5;
    const add = (side, c, w, hh = h, y = yc, hallWin = false) => WIN.push({ side, c, F, w, h: hh, yc: y, ac: !garden && ACS.has(`${side}|${c}|${F}`), hallWin });
    for (const c of [-5.3, -3.4, 3.4, 5.3]) { add('front', c, 1.2); add('back', c, 1.2); }
    for (const c of SIDE_C) { add('west', c, 1.0); add('east', c, 1.0); }
    add('back', 0, 1.0, garden ? 0.8 : 1.4, garden ? 0.55 : F + 1.6, true);           // end of each hallway
    if (F === F2) add('front', 0, 1.0, 1.4, F + 1.6, true);                          // the window straight above the entry
  }
  for (const [side, wl] of Object.entries(WALLS)) {
    const mine = WIN.filter((o) => o.side === side);
    const holes = mine.map((o) => ({ u0: wl.u(o.c) - o.w / 2, u1: wl.u(o.c) + o.w / 2, y0: o.yc - o.h / 2, y1: o.yc + o.h / 2 }));
    if (side === 'front') holes.push({ u0: dx0, u1: dx1, y0: F1, y1: F1 + doorH, arch: true });
    const frame = new THREE.Group(); frame.position.set(...wl.pos); frame.rotation.y = wl.ry;
    const wall = holeyWall(wl.len, H, holes, M.brick, 0.86, 0.61); wall.castShadow = true; frame.add(wall);
    for (const o of mine) {
      frame.add(extWindow({ u: wl.u(o.c), yc: o.yc, w: o.w, h: o.h, T: wl.T, stone: M.stone, raised: o.ac ? 0.44 : 0 }));
      if (o.ac) frame.add(makeAC({ u: wl.u(o.c), ySill: o.yc - o.h / 2 + 0.04, T: wl.T, winW: o.w }));
      // top-floor front windows get the arched brick heads from the photo
      if (side === 'front' && o.F === F2) {
        const r0 = o.w / 2;
        const arch = new THREE.Mesh(new THREE.CircleGeometry(r0, 24, 0, Math.PI), M.dark); arch.position.set(wl.u(o.c), o.yc + o.h / 2, 0.012); frame.add(arch);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r0 + 0.05, 0.05, 6, 24, Math.PI), M.stone); ring.position.set(wl.u(o.c), o.yc + o.h / 2, 0.04); frame.add(ring);
      }
    }
    g.add(frame);
  }
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ color: '#2e2f31' }));
  roof.rotation.x = -Math.PI / 2; roof.position.y = H - 0.5; g.add(roof);
  solid(-W / 2, dx0, zf - 0.25, zf + 0.05); solid(dx1, W / 2, zf - 0.25, zf + 0.05);
  solid(-W / 2, W / 2, zb - 0.05, zb + 0.2);
  solid(-W / 2 - 0.05, -W / 2 + 0.2, zb, zf); solid(W / 2 - 0.2, W / 2 + 0.05, zb, zf);
  // stone band + stepped parapet with diamond accents (front photo)
  g.add(box(W + 0.1, 0.18, 0.12, M.stone, 0, F2 - 0.15, zf + 0.05));
  g.add(box(W + 0.12, 0.12, 0.2, M.stone, 0, H + 0.06, zf - 0.05));
  g.add(box(4.2, 0.9, 0.3, M.brick, 0, H + 0.45, zf - 0.1));
  g.add(box(4.3, 0.1, 0.36, M.stone, 0, H + 0.95, zf - 0.1));
  for (const x of [-5.5, -3.0, 3.0, 5.5]) { const d = box(0.28, 0.28, 0.04, M.stone, x, H - 0.3, zf + 0.02); d.rotation.z = Math.PI / 4; g.add(d); }
  // name stone beside the door, arched transom (lit), wall lamp
  const ns = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.45), std({ map: tex('apt_name_stone.png') }));
  ns.position.set(dx1 + 1.25, F1 + 1.55, zf + 0.02); ns.scale.setScalar(0.62); g.add(ns);
  const tr = new THREE.Mesh(new THREE.CircleGeometry(doorW / 2, 24, 0, Math.PI), M.warm);
  tr.position.set(0, F1 + doorH + 0.02, zf - 0.04); g.add(tr);
  g.add(box(0.14, 0.24, 0.1, M.warm, dx1 + 0.35, F1 + 2.2, zf + 0.06, { shadow: false }));
  const el = new THREE.PointLight('#ffe2b5', 4, 8, 2); el.position.set(0, F1 + 2.4, zf + 1.4); g.add(el);

  // ------------------------------------------------ brick stoop (front photos)
  const steps = 8, rise = F1 / steps, run = 0.32;
  const sw = 1.9, scx = 0;
  const landD = 1.1;
  const stepMat = std({ map: tex('sidewalk.png'), color: '#a7a49e', roughness: 0.95 });
  g.add(box(sw, F1, landD, stepMat, scx, F1 / 2, zf + landD / 2));
  for (let i = 0; i < steps; i++) {
    const h = rise * (steps - i);
    const zz = zf + landD + i * run + run / 2;
    g.add(box(sw, h, run, stepMat, scx, h / 2, zz));
    g.add(box(sw + 0.02, 0.025, 0.04, std({ color: '#7d7b77' }), scx, h - 0.012, zz + run / 2 - 0.02, { shadow: false }));
  }
  const stoopEnd = zf + landD + steps * run;
  const T = 0.42;
  for (const s of [-1, 1]) {
    const xc = scx + s * (sw / 2 + T / 2);
    const top = (z) => (z <= zf + landD ? F1 + 0.9 : Math.max(0.8, F1 + 0.9 - (z - zf - landD) * (rise / run)));
    const pts = [[zf, 0], [stoopEnd, 0], [stoopEnd, top(stoopEnd)], [zf + landD, F1 + 0.9], [zf, F1 + 0.9]];
    const shape = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(z, y)));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false });
    geo.rotateY(-Math.PI / 2);
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 0.86, uv.getY(i) / 0.61);
    const wall = new THREE.Mesh(geo, M.brick);
    wall.position.x = xc + T / 2; wall.castShadow = wall.receiveShadow = true; g.add(wall);
    g.add(box(T + 0.08, 0.07, landD, M.stone, xc, F1 + 0.935, zf + landD / 2));
    const slopeLen = Math.hypot(stoopEnd - zf - landD, F1 + 0.9 - top(stoopEnd));
    const cap = box(T + 0.08, 0.07, slopeLen, M.stone, xc, (F1 + 0.9 + top(stoopEnd)) / 2 + 0.035, (zf + landD + stoopEnd) / 2);
    cap.rotation.x = Math.atan2(F1 + 0.9 - top(stoopEnd), stoopEnd - zf - landD); g.add(cap);
    const P = 0.56, PH = top(stoopEnd) + 0.35;
    const pier = box(P, PH, P, M.brick, xc, PH / 2, stoopEnd + P / 2 - 0.08); g.add(pier);
    g.add(box(P + 0.08, 0.08, P + 0.08, M.stone, xc, PH + 0.04, pier.position.z));
    solid(xc - T / 2, xc + T / 2, zf, stoopEnd);
    solid(xc - P / 2, xc + P / 2, pier.position.z - P / 2, pier.position.z + P / 2);
  }

  // ------------------------------------------------ hallways (one per floor, same layout: walk-through photos)
  const innerW = I.x1 - I.x0, innerD = I.z1 - I.z0, cxI = (I.x0 + I.x1) / 2;
  const DW = 0.9;
  const unitDoors = [];
  const LETTER = { [F0]: 'G', [F1]: '1', [F2]: '2' };
  const floorPiece = (fy, x0, x1, z0, z1) => { const p = plane(M.floor, x1 - x0, z1 - z0, 1.0, 2.0); p.rotation.x = -Math.PI / 2; p.position.set((x0 + x1) / 2, fy + 0.005, (z0 + z1) / 2); g.add(p); };
  const ceil = (y, x0, x1, z0, z1) => { const c = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), M.ceiling); c.rotation.x = Math.PI / 2; c.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); g.add(c); };
  const aroundWell = (fn, a, b) => { fn(a, b, I.x0, stair.x0, I.z0, I.z1); fn(a, b, stair.x1, I.x1, I.z0, I.z1); fn(a, b, stair.x0, stair.x1, I.z0, stair.z0); fn(a, b, stair.x0, stair.x1, stair.z1, I.z1); };
  for (const fy of FLOORS) {
    const hasWellBelow = fy !== F0, hasWellAbove = fy !== F2;
    // floor: the entry and top floors have the stairwell opening
    if (hasWellBelow) aroundWell((a, b, x0, x1, z0, z1) => floorPiece(fy, x0, x1, z0, z1));
    else floorPiece(fy, I.x0, I.x1, I.z0, I.z1);
    if (hasWellAbove) aroundWell((a, b, x0, x1, z0, z1) => ceil(fy + FH - 0.02, x0, x1, z0, z1));
    else ceil(fy + FH - 0.02, I.x0, I.x1, I.z0, I.z1);
    for (const z of [3.6, -3.8]) g.add(box(0.55, 0.02, 1.1, M.light, 0, fy + FH - 0.035, z, { shadow: false }));
    const hl = new THREE.PointLight('#f4f6ff', 3, 9, 1.8); hl.position.set(0, fy + FH - 0.4, 0.4); g.add(hl);
    // beadboard side walls, three doorways each
    for (const [side, x, ry] of [['west', I.x0, Math.PI / 2], ['east', I.x1, -Math.PI / 2]]) {
      const zc = (I.z0 + I.z1) / 2;
      const uOf = (z) => (ry > 0 ? -(z - zc) : z - zc);
      const holes = DOOR_Z.map((z) => ({ u0: uOf(z) - DW / 2, u1: uOf(z) + DW / 2, y0: 0, y1: 2.08 }));
      const frame = new THREE.Group(); frame.position.set(x, fy, zc); frame.rotation.y = ry;
      frame.add(holeyWall(innerD, FH, holes, M.bead, 0.8, FH)); g.add(frame);
      let a0 = -innerD / 2;
      for (const h of [...holes].sort((p, q) => p.u0 - q.u0)) { frame.add(box(h.u0 - 0.08 - a0, 0.1, 0.02, M.trim, (a0 + h.u0 - 0.08) / 2, 0.05, 0.01)); a0 = h.u1 + 0.08; }
      frame.add(box(innerD / 2 - a0, 0.1, 0.02, M.trim, (a0 + innerD / 2) / 2, 0.05, 0.01));
      DOOR_Z.forEach((z, i) => {
        const cs = doorCasing(DW, 2.08, M.trim); cs.position.x = uOf(z); frame.add(cs);
        const hand = side === 'west' ? 1 : -1;
        const pivot = new THREE.Group();
        pivot.position.set(x + (side === 'west' ? 0.02 : -0.02), fy, z + DW / 2 - 0.02);
        const num = LETTER[fy] + (side === 'west' ? 'ABC' : 'DEF')[i];
        const leaf = makeUnitDoor({ w: DW - 0.04, h: 2.04, hand, number: num });
        leaf.rotation.y = side === 'west' ? Math.PI / 2 : -Math.PI / 2;
        leaf.position.z = -(DW - 0.04) / 2;
        pivot.add(leaf); g.add(pivot);
        g.add(box(0.5, 0.012, 0.8, M.mat, x + (side === 'west' ? 0.35 : -0.35), fy + 0.006, z, { shadow: false }));
        const sgn = side === 'west' ? 1 : -1;
        unitDoors.push({ setOpen: (t) => { pivot.rotation.y = sgn * t * 1.45; }, at: [x, z], gap: [x - 0.12, x + 0.12, z - DW / 2, z + DW / 2], y: fy });
      });
      let zs = [[I.z0, I.z1]];
      for (const z of DOOR_Z) zs = zs.flatMap(([p, q]) => (z + DW / 2 <= p || z - DW / 2 >= q ? [[p, q]] : [[p, z - DW / 2], [z + DW / 2, q]]));
      for (const [p, q] of zs) colliders.push(side === 'west' ? [x - 0.2, x, p, q, fy, fy + 1] : [x, x + 0.2, p, q, fy, fy + 1]);
    }
    // back wall: hallway window
    const hw = WIN.filter((o) => o.hallWin && o.F === fy);
    const back = hw.filter((o) => o.side === 'back').map((o) => ({ u0: -o.w / 2 - cxI, u1: o.w / 2 - cxI, y0: o.yc - fy - o.h / 2, y1: o.yc - fy + o.h / 2 }));
    const bwm = holeyWall(innerW, FH, back, M.bead, 0.8, FH); bwm.position.set(cxI, fy, I.z0); g.add(bwm);
    colliders.push([I.x0, I.x1, I.z0 - 0.2, I.z0, fy, fy + 1]);
    // front wall: entry door (entry floor), window over the entry (top floor), solid below the stoop (garden)
    const fh = fy === F1 ? [{ u0: dx0, u1: dx1, y0: 0, y1: doorH, arch: true }]
      : hw.filter((o) => o.side === 'front').map((o) => ({ u0: -o.w / 2, u1: o.w / 2, y0: o.yc - fy - o.h / 2, y1: o.yc - fy + o.h / 2 }));
    const fwm = holeyWall(innerW, FH, fh.map((h2) => ({ ...h2, u0: cxI - h2.u1, u1: cxI - h2.u0 })), M.bead, 0.8, FH);
    fwm.position.set(cxI, fy, I.z1); fwm.rotation.y = Math.PI; g.add(fwm);
    if (fy === F1) {
      g.add(box(0.03, doorH, zf - I.z1, M.trim, dx0, F1 + doorH / 2, (zf + I.z1) / 2), box(0.03, doorH, zf - I.z1, M.trim, dx1, F1 + doorH / 2, (zf + I.z1) / 2));
      colliders.push([I.x0, dx0, I.z1 - 0.05, zf, F1, F1 + 1], [dx1, I.x1, I.z1 - 0.05, zf, F1, F1 + 1]);
    } else colliders.push([I.x0, I.x1, I.z1 - 0.2, I.z1, fy, fy + 1]);
    for (const o of hw) {
      const zz = o.side === 'front' ? I.z1 - 0.012 : I.z0 + 0.012, sg = o.side === 'front' ? -1 : 1;
      for (const s2 of [-1, 1]) g.add(box(0.07, o.h + 0.07, 0.02, M.trim, s2 * (o.w / 2 + 0.035), o.yc, zz));
      g.add(box(o.w + 0.14, 0.07, 0.02, M.trim, 0, o.yc + o.h / 2 + 0.035, zz));
      g.add(box(o.w + 0.18, 0.035, 0.12, M.trim, 0, o.yc - o.h / 2 - 0.017, zz + sg * 0.05));
    }
    // mats
    g.add(box(0.9, 0.012, 1.2, M.mat, 0, fy + 0.006, fy === F1 ? I.z1 - 0.9 : stair.z0 - 0.8, { shadow: false }));
  }
  // mailboxes in the entry vestibule
  const mb = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.55), M.mailbox);
  mb.position.set(I.x0 + 0.034, F1 + 1.35, 4.2); mb.rotation.y = Math.PI / 2; g.add(mb);
  g.add(box(0.03, 0.65, 0.95, M.trim, I.x0 + 0.015, F1 + 1.35, 4.2));

  // ------------------------------------------------ centre stairwell: up-flight entry->top, down-flight entry->garden under it
  const n = Math.round(FH / 0.176), r2 = FH / n, t2 = (stair.z1 - stair.z0) / n;
  const sx = (stair.x0 + stair.x1) / 2, swd = stair.x1 - stair.x0;
  for (let i = 0; i < n; i++) {
    // up: bottom at z1 (entry floor) rising toward z0
    const zTop = stair.z1 - i * t2, y = F1 + (i + 1) * r2;
    g.add(box(swd, 0.03, t2, M.tread, sx, y - 0.015, zTop - t2 / 2));
    g.add(box(swd, r2, 0.02, M.riser, sx, y - r2 / 2, zTop, { shadow: false }));
    // down: top at z0 (entry floor) descending toward z1
    const zd = stair.z0 + i * t2, yd = F1 - (i + 1) * r2;
    g.add(box(swd, 0.03, t2, M.tread, sx, yd - 0.015, zd + t2 / 2));
    g.add(box(swd, r2, 0.02, M.riser, sx, yd + r2 / 2, zd, { shadow: false }));
  }
  // sloped soffit under the up-flight (white), stringers
  const slope = Math.atan2(FH, stair.z1 - stair.z0), slen = Math.hypot(FH, stair.z1 - stair.z0);
  const sof = box(swd, 0.02, slen, M.ceiling, sx, F1 + FH / 2 - 0.12, (stair.z0 + stair.z1) / 2); sof.rotation.x = -slope; g.add(sof);
  // entry floor: half walls along both sides of the well, open at the back so you can go down
  for (const x of [stair.x0 - 0.06, stair.x1 + 0.06]) {
    g.add(box(0.12, 1.0, stair.z1 - stair.z0, M.bead, x, F1 + 0.5, (stair.z0 + stair.z1) / 2));
    g.add(box(0.16, 0.05, stair.z1 - stair.z0, M.trim, x, F1 + 1.02, (stair.z0 + stair.z1) / 2));
    // and down in the garden level, walls either side of the down-flight
    g.add(box(0.12, FH, stair.z1 - stair.z0, M.bead, x, F0 + FH / 2, (stair.z0 + stair.z1) / 2));
  }
  colliders.push([stair.x0 - 0.12, stair.x0, stair.z0, stair.z1, F1, F1 + 1], [stair.x1, stair.x1 + 0.12, stair.z0, stair.z1, F1, F1 + 1]);
  colliders.push([stair.x0 - 0.12, stair.x0, stair.z0, stair.z1, F0, F0 + 1], [stair.x1, stair.x1 + 0.12, stair.z0, stair.z1, F0, F0 + 1]);
  colliders.push([stair.x0, stair.x1, stair.z0, stair.z1 - 1.4, F0, F0 + 1]);   // no walking under the low end of the down-flight
  // top floor: railing round the opening, open at the back where you arrive
  const railY = F2 + 0.95;
  for (const x of [stair.x0 - 0.03, stair.x1 + 0.03]) {
    g.add(box(0.06, 0.06, stair.z1 - stair.z0, M.rail, x, railY, (stair.z0 + stair.z1) / 2));
    for (let z = stair.z0 + 0.12; z < stair.z1; z += 0.12) g.add(box(0.03, 0.95, 0.03, M.rail, x, F2 + 0.475, z, { shadow: false }));
  }
  g.add(box(swd + 0.06, 0.06, 0.06, M.rail, sx, railY, stair.z1));
  for (let x = stair.x0 + 0.12; x < stair.x1; x += 0.12) g.add(box(0.03, 0.95, 0.03, M.rail, x, F2 + 0.475, stair.z1, { shadow: false }));
  colliders.push([stair.x0 - 0.08, stair.x0 + 0.02, stair.z0, stair.z1, F2, F2 + 1], [stair.x1 - 0.02, stair.x1 + 0.08, stair.z0, stair.z1, F2, F2 + 1]);
  colliders.push([stair.x0, stair.x1, stair.z1 - 0.02, stair.z1 + 0.08, F2, F2 + 1]);

  // ------------------------------------------------ eighteen apartments (1A is the furnished living room)
  const ux = { w0: -W / 2 + 0.2, w1: I.x0 - 0.02, e0: I.x1 + 0.02, e1: W / 2 - 0.2 };
  const unitWins = (x0, x1, z0, z1, F) => WIN.filter((o) => o.F === F && !o.hallWin && (
    ((o.side === 'front' && z1 > I.z1 - 0.01) || (o.side === 'back' && z0 < I.z0 + 0.01)) && o.c > x0 && o.c < x1
    || (o.side === 'west' && x0 < -W / 2 + 0.3 && o.c > z0 && o.c < z1) || (o.side === 'east' && x1 > W / 2 - 0.3 && o.c > z0 && o.c < z1)));
  const KINDS = ['studio', 'bedroom', 'kitchen', 'bedroom2', 'kitchen', 'studio'];
  const PAINT = ['#e8e0cc', '#dfe6e2', '#e6dcd8', '#dce2ea', '#ece6d6', '#e2e8d8', '#e8e2d2', '#ebe4da', '#dcdfe8'];
  let k = 0;
  for (const F of FLOORS) {
    for (const [side, x0, x1] of [['west', ux.w0, ux.w1], ['east', ux.e0, ux.e1]]) {
      ZS.forEach(([z0, z1], i) => {
        const wins = unitWins(x0, x1, z0, z1, F);
        if (F === F1 && side === 'west' && i === 0) {
          const sideWin = wins.find((o) => o.side === 'west');
          const living = makeLivingRoom({ F1, FH, x0, x1, z0, z1, doorZ: DOOR_Z[0], doorW: DW, sideWin });
          g.add(living); colliders.push(...living.userData.colliders);
          return;
        }
        const facing = i === 2 ? 'front' : 'back';
        const u = makeUnit({ x0, x1, z0, z1, F, FH, door: { side: side === 'west' ? 'east' : 'west', z: DOOR_Z[i], w: DW }, windows: wins, kind: KINDS[(k + i) % 6], seed: 3 + k * 3 + i, paint: PAINT[(k + i) % PAINT.length], facing });
        g.add(u); colliders.push(...u.userData.colliders);
      });
      k++;
    }
  }

  // ------------------------------------------------ entry door (opens inward)
  const pivot = new THREE.Group();
  const leaf = makeUnitDoor({ w: doorW - 0.06, h: doorH - 0.04, hand: 1, lite: true });
  leaf.position.x = (doorW - 0.06) / 2;
  pivot.add(leaf);
  pivot.position.set(dx0 + 0.03, F1, zf - 0.12);
  g.add(pivot);

  // ------------------------------------------------ walking heights
  const sx0 = scx - sw / 2, sx1 = scx + sw / 2;
  const up = (z) => F1 + Math.max(0, Math.min(1, (stair.z1 - z) / (stair.z1 - stair.z0))) * FH;
  const down = (z) => F1 - Math.max(0, Math.min(1, (z - stair.z0) / (stair.z1 - stair.z0))) * FH;
  g.userData.floorY = (x, z, prevY) => {
    if (x > sx0 && x < sx1 && z > zf && z < stoopEnd + 0.2) {                         // outdoor stoop
      if (z < zf + landD) return F1;
      return Math.max(0, rise * (steps - Math.floor((z - zf - landD) / run)));
    }
    if (x < -W / 2 + 0.1 || x > W / 2 - 0.1 || z < zb + 0.1 || z > zf + 0.1) return null;   // not inside
    if (x > stair.x0 && x < stair.x1 && z > stair.z0 - 0.05 && z < stair.z1 + 0.05) {
      const a = up(z), b = down(z);
      return Math.abs(prevY - a) <= Math.abs(prevY - b) ? a : b;                        // stay on the flight you're on
    }
    let best = F1;
    for (const f of FLOORS) if (Math.abs(prevY - f) < Math.abs(prevY - best)) best = f;
    return best;
  };
  g.userData.colliders = colliders;
  g.userData.unitDoors = unitDoors;
  g.userData.door = {
    setOpen: (t) => { pivot.rotation.y = t * 1.5; },
    at: [0, zf], gap: [dx0, dx1, zf - 0.25, zf + 0.05], y: F1,
  };
  g.userData.interior = { x0: -W / 2, x1: W / 2, z0: zb, z1: zf + 0.3 };
  g.userData.stoop = { x0: sx0, x1: sx1, z0: zf, z1: stoopEnd + 0.4 };
  return g;
}
