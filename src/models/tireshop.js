// Old tire shop / used-car office, from the two tire-shop photos.
// Local axes: long front faces +z, ground y = 0, centred on the footprint.
// Units: metres. Text on the signs is made up (tools/make_signs.py).
//
// Front, left to right (x): two garage bays with blue-glass sectional doors,
// office: ad window, glass door, two ad windows, window AC, white side door,
// boarded panel, small window. White painted panels, chipped blue base band,
// blue stripe under a tall sign band.
//
// Working doors (userData.doors): both garage doors roll up into the ceiling;
// the office door, side door and the inside door to the bays swing open.
import * as THREE from 'three';
import { box } from '../world/util.js';

const loader = new THREE.TextureLoader();
function tex(name, { color = true, repeat = null } = {}) {
  const t = loader.load(`assets/textures/${name}`);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(...repeat);
  t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const TIRE_SHOP = { L: 18, D: 7.5, H: 3.6, BAND: 1.4 };

function materials() {
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.8, ...o });
  return {
    wall: std({ map: tex('tire_wall.png'), normalMap: tex('tire_wall_normal.png', { color: false }), normalScale: new THREE.Vector2(0.5, 0.5) }),
    wallIn: std({ map: tex('tire_wall.png'), color: '#d8d6cf', side: THREE.DoubleSide }),
    base: std({ map: tex('tire_base.png') }),
    blue: std({ color: '#3d5a9a', roughness: 0.6 }),
    white: std({ color: '#ecebe6', roughness: 0.6 }),
    frame: std({ color: '#e6e6e2', roughness: 0.5, metalness: 0.2 }),
    bayGlass: new THREE.MeshPhysicalMaterial({ color: '#1f45c8', roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.75, side: THREE.DoubleSide }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#8fa4a6', roughness: 0.05, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }),
    floor: std({ map: tex('lot_concrete.png'), color: '#b5b2ab', roughness: 0.9 }),
    ceiling: std({ color: '#d9d8d2', emissive: '#55544f', side: THREE.DoubleSide }),
    roof: std({ color: '#3a3b3d', roughness: 0.95 }),
    osb: std({ map: tex('osb.png') }),
    dark: std({ color: '#1d1e20', roughness: 0.6 }),
    alu: std({ color: '#b9bcbf', metalness: 0.7, roughness: 0.35 }),
    light: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.55, 1.6), toneMapped: false }),
    blinds: std({ map: tex('blinds.png'), side: THREE.DoubleSide }),
  };
}

// A flat panel with its texture mapped once (or repeated u x v times).
function panel(w, h, mat, x, y, z, ry = 0, u = 1, v = 1) {
  const g = new THREE.PlaneGeometry(w, h);
  if (u !== 1 || v !== 1) {
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * u, uv.getY(i) * v);
  }
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.receiveShadow = true;
  return m;
}

// Wall section [x0,x1] x [y0,y1] on a plane, textured at 1.2 m per tile.
function wallPiece(M, x0, x1, y0, y1, z, ry = 0, mat = M.wall) {
  const w = x1 - x0, h = y1 - y0;
  return panel(w, h, mat, (x0 + x1) / 2, (y0 + y1) / 2, z, ry, w / 1.2, h / 1.2);
}

// Sectional overhead garage door: 4 sections of 3 x 2 blue glass lites.
// setOpen(t) runs each section along a vertical track then back under the
// ceiling, like the real thing.
function garageDoor(M, w, h, trackY) {
  const g = new THREE.Group();
  const n = 4, sh = h / n;
  const sections = [];
  for (let i = 0; i < n; i++) {
    const s = new THREE.Group();
    s.add(box(w, sh - 0.02, 0.05, M.frame, 0, 0, 0));
    for (let c = 0; c < 3; c++) {
      const lite = panel(w / 3 - 0.14, sh - 0.16, M.bayGlass, -w / 3 + c * (w / 3), 0, 0.027);
      s.add(lite);
      const back = panel(w / 3 - 0.14, sh - 0.16, M.bayGlass, -w / 3 + c * (w / 3), 0, -0.027, Math.PI);
      s.add(back);
    }
    g.add(s);
    sections.push(s);
  }
  // track: vertical up z = 0 to y = trackY, then horizontal toward -z
  const at = (d) => (d <= trackY ? new THREE.Vector3(0, d, 0) : new THREE.Vector3(0, trackY, -(d - trackY)));
  const setOpen = (t) => {
    const lift = t * (h - 0.05);
    sections.forEach((s, i) => {
      const p0 = at(i * sh + lift), p1 = at((i + 1) * sh + lift);
      s.position.copy(p0).add(p1).multiplyScalar(0.5);
      const dir = p1.clone().sub(p0);
      s.rotation.x = -Math.atan2(-dir.z, dir.y); // 0 = vertical, -90deg = flat under ceiling
    });
  };
  setOpen(0);
  // tracks
  for (const sx of [-1, 1]) {
    g.add(box(0.05, trackY, 0.06, M.alu, sx * (w / 2 + 0.04), trackY / 2, -0.05));
    g.add(box(0.05, 0.06, h, M.alu, sx * (w / 2 + 0.04), trackY + 0.03, -h / 2));
  }
  return { group: g, setOpen };
}

// Hinged door leaf, pivot at the hinge edge. side = +1 hinge on the left.
function hingedDoor(M, w, h, { glass = false, side = 1, swing = 1 } = {}) {
  const pivot = new THREE.Group();
  const leaf = new THREE.Group();
  if (glass) {
    const t = 0.09;
    leaf.add(box(w, t, 0.05, M.alu, 0, h - t / 2, 0));
    leaf.add(box(w, 0.25, 0.05, M.alu, 0, 0.125, 0));
    leaf.add(box(t, h, 0.05, M.alu, -w / 2 + t / 2, h / 2, 0));
    leaf.add(box(t, h, 0.05, M.alu, w / 2 - t / 2, h / 2, 0));
    leaf.add(panel(w - 2 * t, h - 0.25 - t, M.glass, 0, 0.25 + (h - 0.25 - t) / 2, 0));
    leaf.add(box(0.03, 0.3, 0.06, M.dark, (w / 2 - 0.12) * side, 1.05, 0.04));
  } else {
    leaf.add(box(w, h, 0.045, M.white, 0, h / 2, 0));
    for (const yy of [0.55, 1.5]) leaf.add(box(w - 0.24, 0.75, 0.01, M.frame, 0, yy, 0.026));
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), M.alu);
    knob.position.set((w / 2 - 0.08) * side, 1.0, 0.05);
    leaf.add(knob);
  }
  leaf.position.x = (w / 2) * side;
  pivot.add(leaf);
  return { group: pivot, setOpen: (t) => { pivot.rotation.y = -side * swing * t * 1.6; } };
}

export function makeTireShop() {
  const M = materials();
  const { L, D, H, BAND } = TIRE_SHOP;
  const g = new THREE.Group();
  g.name = 'tire_shop';
  const x0 = -L / 2, x1 = L / 2, zf = D / 2, zb = -D / 2;
  const T = 0.2; // wall thickness
  const colliders = []; // local rects [minX, maxX, minZ, maxZ]
  const solid = (a, b, c, d) => colliders.push([a, b, c, d]);
  const doors = [];

  // ---------------- front wall openings along x
  const BAY = [[-8.5, -5.5], [-5.0, -2.0]];
  const OFFICE_DOOR = [0.4, 1.4];
  const SIDE_DOOR = [5.9, 6.9];
  const WINDOWS = [[-1.4, 0.2, 'tire_ad_1', 'tire_header_a'], [1.6, 3.4, 'tire_ad_2', 'tire_header_b'], [3.6, 5.4, 'tire_ad_3', 'tire_header_c']];
  const BAY_H = 3.0, DOOR_H = 2.2, SILL = 0.55, WIN_TOP = 2.35;

  // Front face, built from pieces around the openings (outside skin at z = zf).
  const openings = [...BAY.map(([a, b]) => [a, b, 0, BAY_H]), [...OFFICE_DOOR, 0, DOOR_H], [...SIDE_DOOR, 0, DOOR_H],
    ...WINDOWS.map(([a, b]) => [a, b, SILL, WIN_TOP]), [7.95, 8.75, 1.1, 2.1]];
  const front = new THREE.Group();
  // vertical strips between openings, full height up to H
  const xs = [...new Set([x0, x1, ...openings.flatMap(([a, b]) => [a, b])])].sort((a, b) => a - b);
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], b = xs[i + 1];
    const op = openings.find(([oa, ob]) => oa <= a + 1e-6 && ob >= b - 1e-6);
    if (!op) {
      front.add(wallPiece(M, a, b, 0, H, zf));
    } else {
      if (op[2] > 0) front.add(wallPiece(M, a, b, 0, op[2], zf));
      front.add(wallPiece(M, a, b, op[3], H, zf));
    }
  }
  g.add(front);
  // inside skin of the front wall (same openings), facing in
  const frontIn = front.clone();
  frontIn.traverse((o) => { if (o.isMesh) { o.material = M.wallIn; o.position.z = zf - T; } });
  g.add(frontIn);
  // jambs so openings show wall thickness
  for (const [a, b, y0, y1] of openings) {
    for (const x of [a, b]) g.add(box(0.02, y1 - y0, T, M.wallIn, x, (y0 + y1) / 2, zf - T / 2));
    if (y0 > 0) g.add(box(b - a, 0.03, T + 0.04, M.white, (a + b) / 2, y0, zf - T / 2 + 0.02));
    g.add(box(b - a, 0.02, T, M.wallIn, (a + b) / 2, y1, zf - T / 2));
  }
  // front colliders: solid except the four doorways
  const gaps = [...BAY, OFFICE_DOOR, SIDE_DOOR].sort((p, q) => p[0] - q[0]);
  let cx = x0;
  for (const [a, b] of gaps) { solid(cx, a, zf - T, zf); cx = b; }
  solid(cx, x1, zf - T, zf);

  // chipped blue base band along the front + blue stripe + sign band
  const baseH = 0.5;
  let bx = x0;
  for (const [a, b] of gaps) {
    if (a > bx) g.add(panel(a - bx, baseH, M.base, (bx + a) / 2, baseH / 2, zf + 0.012, 0, (a - bx) / 4, 1));
    bx = b;
  }
  g.add(panel(x1 - bx, baseH, M.base, (bx + x1) / 2, baseH / 2, zf + 0.012, 0, (x1 - bx) / 4, 1));
  g.add(box(L + 0.1, 0.16, 0.12, M.blue, 0, H + 0.02, zf + 0.04));
  g.add(box(L + 0.1, BAND, 0.14, M.wall, 0, H + 0.1 + BAND / 2, zf - 0.03));
  g.add(panel(L, BAND, new THREE.MeshStandardMaterial({ map: tex('tire_band_front.png'), roughness: 0.8 }), 0, H + 0.1 + BAND / 2, zf + 0.042));
  g.add(box(L + 0.14, 0.1, 0.22, M.blue, 0, H + 0.15 + BAND, zf - 0.03)); // cap

  // window frames, painted ad glass, header signs
  for (const [a, b, ad, header] of WINDOWS) {
    const w = b - a, h = WIN_TOP - SILL, cxw = (a + b) / 2;
    g.add(panel(w - 0.1, h - 0.1, new THREE.MeshStandardMaterial({ map: tex(`${ad}.png`), roughness: 0.25, side: THREE.DoubleSide }), cxw, SILL + h / 2, zf - 0.06));
    for (const xx of [a + 0.03, b - 0.03]) g.add(box(0.06, h, 0.08, M.frame, xx, SILL + h / 2, zf - 0.05));
    g.add(box(w, 0.06, 0.08, M.frame, cxw, WIN_TOP - 0.03, zf - 0.05));
    g.add(panel(w - 0.1, 0.4, new THREE.MeshStandardMaterial({ map: tex(`${header}.png`), roughness: 0.6 }), cxw, WIN_TOP + 0.32, zf + 0.012));
  }
  // small window by the end, with blinds behind it
  g.add(panel(0.8, 1.0, M.blinds, 8.35, 1.6, zf - 0.08));
  g.add(panel(0.8, 1.0, M.glass, 8.35, 1.6, zf - 0.04));
  // boarded panel and window AC (corner photo)
  g.add(panel(0.6, 2.9, M.osb, 7.4, 1.45 + 0.05, zf + 0.012, 0, 0.5, 2.4));
  const ac = new THREE.Group();
  ac.add(box(0.62, 0.42, 0.55, M.white, 0, 0, 0));
  for (let i = 0; i < 6; i++) ac.add(box(0.5, 0.012, 0.02, M.dark, 0, -0.15 + i * 0.06, 0.28));
  ac.position.set(5.65, 2.75, zf + 0.15);
  g.add(ac);
  // office door frame + transom
  g.add(box(OFFICE_DOOR[1] - OFFICE_DOOR[0] + 0.1, 0.08, 0.12, M.alu, (OFFICE_DOOR[0] + OFFICE_DOOR[1]) / 2, DOOR_H + 0.04, zf - 0.06));

  // ---------------- end walls and back wall (outside + inside skins, with sign band on the ends)
  const sideBand = new THREE.MeshStandardMaterial({ map: tex('tire_band_side.png'), roughness: 0.8 });
  for (const s of [-1, 1]) {
    const x = s * L / 2;
    const ry = s * Math.PI / 2;
    g.add(panel(D, H, M.wall, x, H / 2, 0, ry, D / 1.2, H / 1.2));
    g.add(panel(D, H, M.wallIn, x - s * T, H / 2, 0, -ry, D / 1.2, H / 1.2));
    g.add(panel(D, baseH, M.base, x + s * 0.012, baseH / 2, 0, ry, D / 4, 1));
    g.add(box(0.12, 0.16, D + 0.1, M.blue, x + s * 0.04, H + 0.02, 0));
    g.add(box(0.14, BAND, D, M.wall, x - s * 0.03, H + 0.1 + BAND / 2, 0));
    g.add(panel(D, BAND, sideBand, x + s * 0.042, H + 0.1 + BAND / 2, 0, ry));
    g.add(box(0.22, 0.1, D + 0.14, M.blue, x - s * 0.03, H + 0.15 + BAND, 0));
    solid(Math.min(x, x - s * T), Math.max(x, x - s * T), zb, zf);
  }
  // two windows with blinds on the bay end (front photo)
  for (const z of [-1.6, 1.0]) {
    g.add(panel(1.0, 1.1, M.blinds, x0 + 0.06, 1.75, z, Math.PI / 2));
    g.add(panel(1.0, 1.1, M.glass, x0 - 0.01, 1.75, z, -Math.PI / 2));
    g.add(box(0.06, 1.2, 1.1, M.frame, x0 - 0.01, 1.75, z));
  }
  g.add(panel(L, H, M.wall, 0, H / 2, zb, Math.PI, L / 1.2, H / 1.2));
  g.add(panel(L, H, M.wallIn, 0, H / 2, zb + T, 0, L / 1.2, H / 1.2));
  solid(x0, x1, zb, zb + T);
  // parapet on the back + roof
  g.add(box(L + 0.1, BAND, 0.14, M.wall, 0, H + 0.1 + BAND / 2, zb + 0.03));
  g.add(box(L, 0.15, D, M.roof, 0, H + 0.08, 0));

  // ---------------- interior
  const floor = panel(L - 2 * T, D - 2 * T, M.floor, 0, 0.005, 0, 0, (L - 2 * T) / 3, (D - 2 * T) / 3);
  floor.rotation.x = -Math.PI / 2;
  g.add(floor);
  const ceil = panel(L - 2 * T, D - 2 * T, M.ceiling, 0, H - 0.01, 0);
  ceil.rotation.x = Math.PI / 2;
  g.add(ceil);
  // partition between the bays and the office (plane at x = PX), doorway at z DZ
  const PX = -1.6, DZ = [-1.3, -0.4];
  const zpanel = (z0, z1, y0, y1) => {
    const p = panel(z1 - z0, y1 - y0, M.wallIn, PX, (y0 + y1) / 2, (z0 + z1) / 2, Math.PI / 2, (z1 - z0) / 1.2, (y1 - y0) / 1.2);
    g.add(p);
  };
  zpanel(zb + T, DZ[0], 0, H);
  zpanel(DZ[1], zf - T, 0, H);
  zpanel(DZ[0], DZ[1], 2.1, H);
  solid(PX - 0.08, PX + 0.08, zb, DZ[0]);
  solid(PX - 0.08, PX + 0.08, DZ[1], zf);
  for (const [a, b] of BAY) {
    const stripe = panel(0.08, D - 1.5, new THREE.MeshStandardMaterial({ color: '#d9b938', roughness: 0.8 }), a - 0.2, 0.009, -0.3);
    stripe.rotation.x = -Math.PI / 2;
    g.add(stripe);
  }
  const drain = panel(0.5, 0.5, M.dark, -5.25, 0.01, -0.5);
  drain.rotation.x = -Math.PI / 2;
  g.add(drain);
  // fluorescent fixtures
  for (const [x, z] of [[-7, -1], [-3.5, -1], [1.5, 0], [6, 0]]) {
    g.add(box(1.2, 0.05, 0.3, M.light, x, H - 0.04, z, { shadow: false }));
    const p = new THREE.PointLight('#f2f6ff', 2.2, 7, 2);
    p.position.set(x, H - 0.4, z);
    g.add(p);
  }

  // ---------------- doors
  const trackY = BAY_H + 0.15;
  BAY.forEach(([a, b], i) => {
    const gd = garageDoor(M, b - a, BAY_H, trackY);
    gd.group.position.set((a + b) / 2, 0, zf - T - 0.06);
    g.add(gd.group);
    doors.push({ name: `garage door ${i + 1}`, kind: 'garage', setOpen: gd.setOpen, at: [(a + b) / 2, zf], gap: [a, b, zf - T - 0.12, zf] });
  });
  const od = hingedDoor(M, OFFICE_DOOR[1] - OFFICE_DOOR[0] - 0.02, DOOR_H - 0.02, { glass: true, side: 1 });
  od.group.position.set(OFFICE_DOOR[0] + 0.01, 0, zf - T / 2);
  g.add(od.group);
  doors.push({ name: 'office door', kind: 'door', setOpen: (t) => od.setOpen(-t), at: [(OFFICE_DOOR[0] + OFFICE_DOOR[1]) / 2, zf], gap: [OFFICE_DOOR[0], OFFICE_DOOR[1], zf - T, zf] });
  const sd = hingedDoor(M, SIDE_DOOR[1] - SIDE_DOOR[0] - 0.02, DOOR_H - 0.02, { side: -1 });
  sd.group.position.set(SIDE_DOOR[1] - 0.01, 0, zf - T / 2);
  g.add(sd.group);
  doors.push({ name: 'side door', kind: 'door', setOpen: (t) => sd.setOpen(t), at: [(SIDE_DOOR[0] + SIDE_DOOR[1]) / 2, zf], gap: [SIDE_DOOR[0], SIDE_DOOR[1], zf - T, zf] });
  const id = hingedDoor(M, DZ[1] - DZ[0] - 0.02, 2.08, { side: 1 });
  const idWrap = new THREE.Group();
  idWrap.add(id.group);
  idWrap.position.set(PX, 0, DZ[1] - 0.01);
  idWrap.rotation.y = Math.PI / 2; // leaf runs from DZ[1] toward DZ[0]
  g.add(idWrap);
  doors.push({ name: 'shop door', kind: 'door', setOpen: (t) => id.setOpen(t), at: [PX, (DZ[0] + DZ[1]) / 2], gap: [PX - 0.08, PX + 0.08, DZ[0], DZ[1]] });

  g.userData.colliders = colliders;
  g.userData.doors = doors;
  return g;
}
