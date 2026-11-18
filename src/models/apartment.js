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
    ceiling: std({ color: '#efeee9', emissive: '#2a2925' }),
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
  const fL = brick(dx0 + W / 2, H); fL.position.set((-W / 2 + dx0) / 2, H / 2, zf); g.add(fL);
  const fR = brick(W / 2 - dx1, H); fR.position.set((dx1 + W / 2) / 2, H / 2, zf); g.add(fR);
  const fB = brick(doorW, F1); fB.position.set((dx0 + dx1) / 2, F1 / 2, zf); g.add(fB);
  const fT = brick(doorW, H - F1 - doorH - 0.6); fT.position.set((dx0 + dx1) / 2, (F1 + doorH + 0.6 + H) / 2, zf); g.add(fT);
  const back = brick(W, H); back.position.set(0, H / 2, zb); back.rotation.y = Math.PI; g.add(back);
  for (const s of [-1, 1]) { const p = brick(D, H); p.position.set(s * W / 2, H / 2, 0); p.rotation.y = s * Math.PI / 2; g.add(p); }
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

  // windows: 3 columns each side of the entry bay; top floor arched
  const cols = [-5.3, -3.4, 3.4, 5.3];  // symmetric about the centred entry
  for (let f = 0; f < 3; f++) {
    for (const x of cols) {
      const y = F1 + f * FH + 1.5;
      const win = makeWindow(1.2, 1.5, (f * 7 + Math.round(x * 3)) % 3 === 0);
      win.position.set(x, y, zf + 0.01);
      g.add(win);
      g.add(box(1.4, 0.08, 0.22, M.stone, x, y - 0.8, zf + 0.08));
      if (f === 2) {
        const arch = new THREE.Mesh(new THREE.CircleGeometry(0.6, 24, 0, Math.PI), M.dark);
        arch.position.set(x, y + 0.75, zf + 0.012);
        g.add(arch);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.05, 6, 24, Math.PI), M.stone);
        ring.position.set(x, y + 0.75, zf + 0.04);
        g.add(ring);
      }
    }
  }
  // garden-level windows with AC units
  for (const x of [-4.35, 4.35]) {
    const w = makeWindow(1.6, 0.7, false);
    w.position.set(x, 0.55, zf + 0.01);
    g.add(w);
    if (x > 0) {
      const ac = box(0.7, 0.4, 0.5, M.doorWhite, x + 0.3, 0.45, zf + 0.25);
      g.add(ac);
    }
  }
  // name stone over the entry
  const ns = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.45), std({ map: tex('apt_name_stone.png') }));
  ns.position.set((dx0 + dx1) / 2, F1 + doorH + 1.0, zf + 0.02);
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
  const I = { x0: hall.x0, x1: stair.x1 + 0.02, z0: zb + 0.2, z1: zf - 0.25 };
  const UZ = 0.8, UW = 0.9;            // living-room unit door
  const unitPivot = new THREE.Group();
  const innerW = I.x1 - I.x0, innerD = I.z1 - I.z0;
  for (const [fy, isTop] of [[F1, false], [F2, true]]) {
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
    // ceiling with light panels
    const c = new THREE.Mesh(new THREE.PlaneGeometry(innerW, innerD), M.ceiling);
    c.rotation.x = Math.PI / 2;
    c.position.set((I.x0 + I.x1) / 2, fy + FH - 0.02, (I.z0 + I.z1) / 2);
    if (!isTop) { c.scale.set(1, 1, 1); }
    g.add(c);
    for (const z of [-3, 0.5, 3.5]) g.add(box(0.55, 0.02, 1.1, M.light, (hall.x0 + hall.x1) / 2, fy + FH - 0.035, z, { shadow: false }));
    // beadboard walls (left = west side, right = east side)
    for (const [x, ry] of [[I.x0, Math.PI / 2], [I.x1, -Math.PI / 2]]) {
      if (!isTop && x === I.x0) {
        // west wall on the first floor has the living-room unit doorway (z UZ +- UW/2)
        const za = UZ - UW / 2, zb2 = UZ + UW / 2;
        for (const [a2, b2] of [[I.z0, za], [zb2, I.z1]]) {
          const w = plane(M.bead, b2 - a2, FH, 0.8, FH); w.position.set(x, fy + FH / 2, (a2 + b2) / 2); w.rotation.y = ry; g.add(w);
        }
        const hd = plane(M.bead, UW, FH - 2.06, 0.8, FH); hd.position.set(x, fy + 2.06 + (FH - 2.06) / 2, UZ); hd.rotation.y = ry; g.add(hd);
        for (const z of [za - 0.04, zb2 + 0.04]) g.add(box(0.03, 2.1, 0.08, M.trim, x + 0.015, fy + 1.05, z));
        g.add(box(0.03, 0.08, UW + 0.16, M.trim, x + 0.015, fy + 2.1, UZ));
        g.add(box(0.02, 0.1, za - I.z0, M.trim, x + 0.01, fy + 0.05, (I.z0 + za) / 2));
        g.add(box(0.02, 0.1, I.z1 - zb2, M.trim, x + 0.01, fy + 0.05, (zb2 + I.z1) / 2));
        continue;
      }
      const w = plane(M.bead, innerD, FH, 0.8, FH);
      w.position.set(x, fy + FH / 2, (I.z0 + I.z1) / 2);
      w.rotation.y = ry;
      g.add(w);
      g.add(box(0.02, 0.1, innerD, M.trim, x + (ry > 0 ? 0.01 : -0.01), fy + 0.05, (I.z0 + I.z1) / 2)); // baseboard
    }
    const bw = plane(M.bead, innerW, FH, 0.8, FH);
    bw.position.set((I.x0 + I.x1) / 2, fy + FH / 2, I.z0);
    g.add(bw);
    // unit doors on the west wall, with mats
    for (const z of [-3.2, 0.8]) {
      if (!isTop && z === UZ) {      // this one opens into the living room
        unitPivot.position.set(I.x0 + 0.02, fy, UZ + UW / 2 - 0.02);
        const leaf = sixPanelDoor(M, UW - 0.04);
        leaf.rotation.y = Math.PI / 2;
        leaf.position.z = -(UW - 0.04) / 2;
        unitPivot.add(leaf);
        g.add(unitPivot);
        g.add(box(0.5, 0.012, 0.8, M.mat, I.x0 + 0.35, fy + 0.006, z, { shadow: false }));
        continue;
      }
      const d = sixPanelDoor(M);
      d.position.set(I.x0 + 0.01, fy, z);
      d.rotation.y = Math.PI / 2;
      g.add(d);
      g.add(box(0.5, 0.012, 0.8, M.mat, I.x0 + 0.35, fy + 0.006, z, { shadow: false }));
    }
    // end-of-hall unit door
    const ed = sixPanelDoor(M);
    ed.position.set((hall.x0 + hall.x1) / 2, fy, I.z0 + 0.01);
    g.add(ed);
  }
  colliders.push([I.x0 - 0.2, I.x0, I.z0, UZ - UW / 2, F1, F2]);
  colliders.push([I.x0 - 0.2, I.x0, UZ + UW / 2, I.z1, F1, F2]);
  colliders.push([I.x0 - 0.2, I.x0, I.z0, I.z1, F2, F2 + FH]);
  // ------------------------------------------------ living room behind the unit door (interior photos)
  const LR = { x0: -W / 2 + 0.2, x1: I.x0 - 0.02, z0: -0.6, z1: I.z1 };
  const living = makeLivingRoom({ F1, FH, x0: LR.x0, x1: LR.x1, z0: LR.z0, z1: LR.z1, doorZ: UZ, doorW: UW });
  g.add(living);
  colliders.push(...living.userData.colliders);
  colliders.push([LR.x0, LR.x1, LR.z0 - 0.2, LR.z0, F1, F2]);
  colliders.push([I.x1, I.x1 + 0.2, I.z0, I.z1, F1, F2]);
  colliders.push([I.x0, I.x1, I.z0 - 0.2, I.z0, F1, F2]);
  colliders.push([stair.x0, stair.x1, stair.z0 - 0.25, stair.z0, F1, F1]); // can't walk into the top of the stair from below
  // first-floor front: inside face of the front wall + vestibule mailboxes
  const fi = plane(M.bead, innerW, FH, 0.8, FH);
  fi.position.set((I.x0 + I.x1) / 2, F1 + FH / 2, I.z1);
  fi.rotation.y = Math.PI;
  g.add(fi);
  const mb = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.55), M.mailbox);
  mb.position.set(I.x0 + 0.02, F1 + 1.35, I.z1 - 1.0);
  mb.rotation.y = Math.PI / 2;
  g.add(mb);
  g.add(box(0.03, 0.65, 1.42, M.trim, I.x0 + 0.015, F1 + 1.35, I.z1 - 1.0));
  // upstairs front: window at the end of the landing (landing photo)
  const upWin = makeWindow(1.0, 1.2, true);
  upWin.position.set((hall.x0 + hall.x1) / 2, F2 + 1.5, I.z1 - 0.01);
  upWin.rotation.y = Math.PI;
  g.add(upWin);
  g.add(box(innerW, FH, 0.02, M.bead, (I.x0 + I.x1) / 2, F2 + FH / 2, I.z1 + 0.01).translateX(0));
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
  const leaf = sixPanelDoor(M, doorW - 0.06, doorH - 0.04);
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
    if (x > LR.x0 - 0.1 && x < I.x0 && z > LR.z0 - 0.1 && z < LR.z1 + 0.1 && prevY > F1 - 0.7) return F1;   // living room
    if (x < I.x0 - 0.1 || x > I.x1 + 0.1 || z < I.z0 - 0.1 || z > zf + 0.1) return null; // not inside
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
  g.userData.unitDoor = {
    setOpen: (t) => { unitPivot.rotation.y = t * 1.45; },
    at: [I.x0, UZ], gap: [I.x0 - 0.12, I.x0 + 0.06, UZ - UW / 2, UZ + UW / 2], y: F1,
  };
  g.userData.door = {
    setOpen: (t) => { pivot.rotation.y = t * 1.5; },
    at: [(dx0 + dx1) / 2, zf], gap: [dx0, dx1, zf - 0.25, zf + 0.05], y: F1,
  };
  g.userData.interior = { x0: I.x0, x1: I.x1, z0: I.z0, z1: zf + 0.3 };
  g.userData.stoop = { x0: sx0, x1: sx1, z0: zf, z1: stoopEnd + 0.4 };
  return g;
}
