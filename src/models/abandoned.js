// Abandoned, boarded-up storefront from the four "abandoned" photos.
// Local axes: facade runs along x, the street side is +z, ground at y = 0.
// Units: metres. Pieces:
//   a) ribbed siding wall with a boarded window          (side photo)
//   b) recessed doorway boarded with OSB + handle hole,
//      flattened cardboard and a plastic bottle           (alcove door photo)
//   c) storefront under a slatted canopy: boarded window,
//      tan brick planter with black paint, boarded door
//      with "1402" transom, OSB strips, grey painted patch (front photo)
//   d) recessed doorway with teal concrete steps          (alcove steps photo)
import * as THREE from 'three';
import { box } from '../world/util.js';

const loader = new THREE.TextureLoader();
const cache = new Map();
function tex(name, color = true) {
  if (cache.has(name)) return cache.get(name);
  const t = loader.load(`assets/textures/${name}`);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  cache.set(name, t);
  return t;
}

function materials() {
  const m = (opts) => new THREE.MeshStandardMaterial({ roughness: 0.85, ...opts });
  return {
    siding: m({ map: tex('siding.png'), normalMap: tex('siding_normal.png', false), normalScale: new THREE.Vector2(0.8, 0.8) }),
    osb: m({ map: tex('osb.png'), normalMap: tex('osb_normal.png', false), normalScale: new THREE.Vector2(0.5, 0.5) }),
    osbAlcoveDoor: m({ map: tex('osb_alcove_door.png') }),
    osbFrontDoor: m({ map: tex('osb_front_door.png') }),
    transom: m({ map: tex('transom_1402.png'), roughness: 0.3, metalness: 0.2 }),
    brick: m({ map: tex('brick_planter.png'), normalMap: tex('brick_planter_normal.png', false), normalScale: new THREE.Vector2(0.6, 0.6) }),
    brickCap: m({ color: '#c9b892' }),
    soil: m({ map: tex('planter_soil.png'), roughness: 1 }),
    cardboard: m({ map: tex('cardboard.png'), side: THREE.DoubleSide }),
    grayPatch: m({ color: '#879191', roughness: 0.7 }),        // painted-over patch (front + steps photos)
    teal: m({ color: '#5f9496', roughness: 0.75 }),            // teal painted steps
    soffit: m({ color: '#cdbfa8', roughness: 0.9 }),           // canopy ceiling, same paint as siding
    alu: m({ color: '#a7a9a6', roughness: 0.4, metalness: 0.6 }),
    dark: m({ color: '#1c1c1c', roughness: 0.6 }),
  };
}

// Box whose texture repeats every `uw` x `uh` metres on each face.
function tbox(w, h, d, mat, x, y, z, uw = 1, uh = uw) {
  const b = box(w, h, d, mat, x, y, z);
  const uv = b.geometry.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) {
    const k = f * 4 + i;
    uv.setXY(k, uv.getX(k) * dims[f][0] / uw, uv.getY(k) * dims[f][1] / uh);
  }
  return b;
}

// A flat panel facing +z (or rotated), texture stretched once or tiled.
function panel(w, h, mat, x, y, z, { ry = 0, uw = null, uh = null } = {}) {
  const geo = new THREE.PlaneGeometry(w, h);
  if (uw) {
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / uw, uv.getY(i) * h / (uh ?? uw));
  }
  const p = new THREE.Mesh(geo, mat);
  p.position.set(x, y, z);
  p.rotation.y = ry;
  p.receiveShadow = true;
  return p;
}

// OSB sheets screwed over an opening: separate sheets with hairline gaps.
function osbSheets(g, M, x0, x1, y0, y1, z, cols, rows) {
  const w = (x1 - x0) / cols, h = (y1 - y0) / rows;
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const p = panel(w - 0.01, h - 0.01, M.osb, x0 + (c + 0.5) * w, y0 + (r + 0.5) * h, z, { uw: 1.2 });
    // shift each sheet's grain so neighbours don't match
    const uv = p.geometry.attributes.uv;
    const du = (c * 0.37 + r * 0.61) % 1, dv = (c * 0.53 + r * 0.29) % 1;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) + du, uv.getY(i) + dv);
    g.add(p);
  }
}

export function makePlasticBottle() {
  const g = new THREE.Group();
  g.name = 'plastic_bottle';
  const clear = new THREE.MeshPhysicalMaterial({ color: '#e8eef0', roughness: 0.15, transparent: true, opacity: 0.45 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.17, 16), clear);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.033, 0.05, 16), clear);
  neck.position.y = 0.11;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 12), new THREE.MeshStandardMaterial({ color: '#d42a1e', roughness: 0.5 }));
  cap.position.y = 0.145;
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.0355, 0.0355, 0.06, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#efe1b0', roughness: 0.6 }));
  label.position.y = -0.01;
  g.add(body, neck, cap, label);
  g.rotation.z = Math.PI / 2; // lying on its side
  g.position.y = 0.035;
  return g;
}

export function makeAbandonedBuilding() {
  const M = materials();
  const g = new THREE.Group();
  g.name = 'abandoned_storefront';
  const H = 4.2, CANOPY = 2.85, SID = [0.9, 2.05]; // siding texture = 0.9 m x 2.05 m

  // Building mass behind the facade (closes the sides and back).
  g.add(tbox(10.3, H, 5.5, M.siding, 0.15, H / 2, -4.25, ...SID));

  // ---- a) siding wall with boarded window, x -5 .. -2.8
  g.add(tbox(2.2, H, 0.2, M.siding, -3.9, H / 2, -0.1, ...SID));
  g.add(box(1.7, 1.75, 0.04, M.dark, -3.9, 1.45, 0.005));
  osbSheets(g, M, -4.75, -3.05, 0.58, 2.32, 0.03, 1, 2);

  // ---- b) recessed doorway, x -2.8 .. -1.5, depth 1.3
  g.add(panel(1.3, 1.65, M.osbAlcoveDoor, -2.15, 0.83, -1.3)); // the board with the handle cut-out
  g.add(tbox(1.3, CANOPY - 1.65, 0.05, M.siding, -2.15, 1.65 + (CANOPY - 1.65) / 2, -1.3, ...SID)); // header
  g.add(panel(1.3, 1.3, M.siding, -2.8, CANOPY / 2, -0.65, { ry: Math.PI / 2, uw: SID[0], uh: SID[1] }));
  g.add(panel(1.3, 1.3, M.siding, -1.5, CANOPY / 2, -0.65, { ry: -Math.PI / 2, uw: SID[0], uh: SID[1] }));
  for (const [x, ry] of [[-2.8, Math.PI / 2], [-1.5, -Math.PI / 2]]) {
    const side = g.children[g.children.length - (x === -2.8 ? 2 : 1)];
    side.scale.y = CANOPY / 1.3;
    side.position.x = x;
    side.rotation.y = ry;
  }
  const ceilB = panel(1.3, 1.3, M.soffit, -2.15, CANOPY, -0.65);
  ceilB.rotation.x = Math.PI / 2;
  g.add(ceilB);
  const card = panel(0.75, 0.34, M.cardboard, -2.3, 0.006, -1.0);
  card.rotation.x = -Math.PI / 2;
  g.add(card);
  const bottle = makePlasticBottle();
  bottle.position.set(-2.65, 0.035, -0.45);
  bottle.rotation.y = 0.6;
  g.add(bottle);

  // pier between b and c
  g.add(tbox(0.2, CANOPY, 1.4, M.siding, -1.4, CANOPY / 2, -0.7, ...SID));

  // ---- c) storefront under the canopy, x -1.3 .. 3.6, set back 1.4
  const zc = -1.4;
  osbSheets(g, M, -1.3, 0.85, 0, CANOPY, zc, 2, 2);                 // big boarded window
  // door with aluminium frame, boarded leaf and "1402" transom
  g.add(box(0.05, CANOPY, 0.08, M.alu, 0.875, CANOPY / 2, zc));
  g.add(box(0.05, CANOPY, 0.08, M.alu, 1.775, CANOPY / 2, zc));
  g.add(box(0.95, 0.05, 0.08, M.alu, 1.325, 2.2, zc));
  g.add(panel(0.85, 2.18, M.osbFrontDoor, 1.325, 1.09, zc + 0.02));
  g.add(panel(0.85, 0.6, M.transom, 1.325, 2.52, zc + 0.01));
  // horizontal OSB strips, then a sheet with the grey painted patch
  for (let i = 0; i < 6; i++) {
    const p = panel(0.68, 0.44, M.osb, 2.15, 0.3 + i * 0.45 + 0.22, zc, { uw: 1.2 });
    g.add(p);
  }
  osbSheets(g, M, 2.5, 3.6, 0.3, CANOPY, zc, 1, 2);
  g.add(panel(0.85, 0.55, M.grayPatch, 3.05, 1.55, zc + 0.012));
  // weathered base trim under the strips (siding boards)
  g.add(tbox(1.8, 0.3, 0.05, M.siding, 2.7, 0.15, zc + 0.03, 0.9, 2.05));
  // canopy ceiling + side returns
  const ceilC = panel(4.9, 1.4, M.soffit, 1.15, CANOPY, -0.7);
  ceilC.rotation.x = Math.PI / 2;
  g.add(ceilC);
  // tan brick planter with soil, in front of the boarded window
  const pw = 2.15, pd = 0.85, ph = 0.62, px = -0.2, pz = zc + 0.45;
  g.add(tbox(pw, ph, pd, M.brick, px, ph / 2, pz, 1.9, 0.55));
  for (const [cx, cz, cw, cd] of [[px, pz + pd / 2 - 0.06, pw, 0.12], [px, pz - pd / 2 + 0.06, pw, 0.12], [px - pw / 2 + 0.06, pz, 0.12, pd], [px + pw / 2 - 0.06, pz, 0.12, pd]]) {
    g.add(box(cw + 0.02, 0.06, cd + 0.02, M.brickCap, cx, ph + 0.03, cz));
  }
  const soil = panel(pw - 0.24, pd - 0.24, M.soil, px, ph - 0.05, pz, { uw: 0.6 });
  soil.rotation.x = -Math.PI / 2;
  g.add(soil);

  // pier between c and d
  g.add(tbox(0.15, CANOPY, 1.4, M.siding, 3.675, CANOPY / 2, -0.7, ...SID));

  // ---- d) recessed doorway with teal steps, x 3.75 .. 5, depth 1.3
  g.add(panel(1.25, CANOPY, M.osb, 4.375, CANOPY / 2, -1.3, { uw: 1.2 }));
  g.add(panel(0.85, 0.75, M.grayPatch, 4.375, 1.5, -1.29));
  const sideD = panel(1.3, CANOPY, M.osb, 5.0, CANOPY / 2, -0.65, { ry: -Math.PI / 2, uw: 1.2 });
  g.add(sideD);
  for (const [i, d] of [[0, 1.3], [1, 0.75]]) { // two teal steps up to the door
    g.add(box(1.25, 0.17, d, M.teal, 4.375, 0.085 + i * 0.17, -1.3 + d / 2));
  }
  const ceilD = panel(1.25, 1.3, M.soffit, 4.375, CANOPY, -0.65);
  ceilD.rotation.x = Math.PI / 2;
  g.add(ceilD);
  g.add(box(0.22, 0.04, 0.22, M.dark, 4.375, CANOPY - 0.02, -0.7)); // ceiling light box

  // end pier
  g.add(tbox(0.3, H, 0.2, M.siding, 5.15, H / 2, -0.1, ...SID));
  // upper wall / canopy fascia across b, c, d (vertical slats = the siding)
  g.add(tbox(7.8, H - CANOPY, 0.25, M.siding, 1.1, CANOPY + (H - CANOPY) / 2, -0.12, ...SID));

  // a warm light under the canopy, like the streetlight wash in the photos
  const l = new THREE.PointLight('#ffd7a8', 2.2, 7, 2);
  l.position.set(1.2, 2.5, 0.6);
  g.add(l);

  // solid areas for walking collisions, in local x/z
  g.userData.colliders = [
    [-5, -2.8, -7, 0], [-1.5, -1.3, -7, 0], [-2.8, -1.5, -7, -1.25],
    [-1.3, 3.6, -7, -1.35], [px - pw / 2, px + pw / 2, pz - pd / 2, pz + pd / 2],
    [3.6, 3.75, -7, 0], [3.75, 5.0, -7, -0.55], [5.0, 5.3, -7, 0],
  ];
  return g;
}

// Red fire hydrant on the curb (side photo).
export function makeFireHydrant() {
  const g = new THREE.Group();
  g.name = 'fire_hydrant';
  const red = new THREE.MeshStandardMaterial({ color: '#c8332a', roughness: 0.55, metalness: 0.2 });
  const add = (geo, y, rx = 0, rz = 0, x = 0, z = 0) => {
    const m = new THREE.Mesh(geo, red);
    m.position.set(x, y, z);
    m.rotation.set(rx, 0, rz);
    m.castShadow = true;
    g.add(m);
  };
  add(new THREE.CylinderGeometry(0.15, 0.16, 0.06, 20), 0.03);
  add(new THREE.CylinderGeometry(0.11, 0.12, 0.5, 20), 0.31);
  add(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 20), 0.58);
  add(new THREE.SphereGeometry(0.11, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0.6);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6), 0.72);
  add(new THREE.CylinderGeometry(0.045, 0.045, 0.32, 12), 0.42, 0, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.055, 0.055, 0.1, 12), 0.42, Math.PI / 2, 0, 0, 0.12);
  return g;
}

// Black ornamental street lamp (side photo, Two Rivers photo).
export function makeStreetLamp() {
  const g = new THREE.Group();
  g.name = 'street_lamp';
  const black = new THREE.MeshStandardMaterial({ color: '#141617', roughness: 0.45, metalness: 0.5 });
  const seg = (rt, rb, h, y, s = 16) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), black);
    m.position.y = y;
    m.castShadow = true;
    g.add(m);
  };
  seg(0.22, 0.26, 0.12, 0.06, 8);   // square-ish foot
  seg(0.16, 0.22, 0.5, 0.37, 8);    // flared base
  seg(0.07, 0.09, 0.3, 0.77);
  seg(0.065, 0.065, 3.0, 2.4, 12);  // pole
  seg(0.1, 0.07, 0.12, 3.95);
  const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.9, 1.8, 1.6), toneMapped: false });
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.12, 0.4, 16), glow);
  lens.position.y = 4.21;
  g.add(lens);
  seg(0.22, 0.17, 0.08, 4.45);
  seg(0.02, 0.06, 0.18, 4.58);
  const light = new THREE.PointLight('#fff4e0', 9, 14, 2);
  light.position.y = 4.0;
  g.add(light);
  return g;
}
