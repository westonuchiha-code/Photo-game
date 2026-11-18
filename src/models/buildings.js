// Generic street buildings dressed with the wall-texture photos.
// Local axes: front faces +z, ground y = 0, centred on the footprint. Units: metres.
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

// Each wall texture with the real-world size (m) one tile covers.
export const WALLS = {
  red_brick: { file: 'wall_red_brick', size: [0.86, 0.61] },
  red_sandstone: { file: 'wall_red_sandstone', size: [1.6, 2.0] },
  gray_brick: { file: 'wall_gray_brick', size: [0.67, 1.2] },
  gray_tile: { file: 'wall_gray_tile', size: [0.8, 0.94] },
  olive_stucco: { file: 'wall_olive_stucco', size: [1.5, 1.5] },
  teal_stucco: { file: 'wall_teal_stucco', size: [1.5, 1.5] },
};

const wallMats = new Map();
function wallMat(kind) {
  if (wallMats.has(kind)) return wallMats.get(kind);
  const { file } = WALLS[kind];
  const m = new THREE.MeshStandardMaterial({
    map: tex(`${file}.png`), normalMap: tex(`${file}_normal.png`, false),
    normalScale: new THREE.Vector2(0.7, 0.7), roughness: 0.9,
  });
  wallMats.set(kind, m);
  return m;
}

// A wall plane w x h whose UVs give the texture its real size.
export function wallPlane(kind, w, h, mat = null) {
  const g = new THREE.PlaneGeometry(w, h);
  const [sw, sh] = WALLS[kind].size;
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / sw, uv.getY(i) * h / sh);
  const m = new THREE.Mesh(g, mat || wallMat(kind));
  m.receiveShadow = true;
  return m;
}

const shared = {
  frame: new THREE.MeshStandardMaterial({ color: '#e9e7e1', roughness: 0.55 }),
  dark: new THREE.MeshStandardMaterial({ color: '#16181b', roughness: 0.7 }),
  roof: new THREE.MeshStandardMaterial({ color: '#2f3033', roughness: 0.95 }),
  cap: new THREE.MeshStandardMaterial({ color: '#b7b2a8', roughness: 0.8 }),
  glass: new THREE.MeshPhysicalMaterial({ color: '#7e9294', roughness: 0.05, transparent: true, opacity: 0.25, depthWrite: false }),
  door: new THREE.MeshStandardMaterial({ color: '#3b3d40', roughness: 0.6, metalness: 0.3 }),
};
let blindsOff, blindsLit;
function blinds(lit) {
  if (!blindsOff) {
    blindsOff = new THREE.MeshStandardMaterial({ map: tex('blinds.png'), color: '#9b978e', roughness: 0.8 });
    blindsLit = new THREE.MeshStandardMaterial({ map: tex('blinds.png'), emissiveMap: tex('blinds.png'), emissive: new THREE.Color(1.0, 0.78, 0.5), roughness: 0.8 });
  }
  return lit ? blindsLit : blindsOff;
}

// Window: white frame, sill, blinds behind glass. Faces +z.
export function makeWindow(w, h, lit) {
  const g = new THREE.Group();
  const t = 0.07;
  g.add(box(w + 0.02, h + 0.02, 0.06, shared.dark, 0, 0, -0.02, { shadow: false }));
  const bl = new THREE.Mesh(new THREE.PlaneGeometry(w - 2 * t, h - 2 * t), blinds(lit));
  const uv = bl.geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 0.9, uv.getY(i) * h / 0.9);
  bl.position.z = 0.015;
  g.add(bl);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(w - 2 * t, h - 2 * t), shared.glass);
  gl.position.z = 0.04;
  g.add(gl);
  for (const s of [-1, 1]) g.add(box(t, h, 0.08, shared.frame, s * (w / 2 - t / 2), 0, 0.03));
  g.add(box(w, t, 0.08, shared.frame, 0, h / 2 - t / 2, 0.03));
  g.add(box(w, t, 0.08, shared.frame, 0, 0, 0.03)); // meeting rail
  g.add(box(w + 0.12, 0.06, 0.16, shared.cap, 0, -h / 2 - 0.03, 0.06)); // sill
  return g;
}

// Street building: `floors` storeys of 3.2 m, a row of windows per floor,
// ground floor with a door, parapet with a cap. Lit windows chosen by `seed`.
export function makeStreetBuilding({ wall = 'red_brick', w = 7, d = 10, floors = 2, seed = 1 } = {}) {
  const g = new THREE.Group();
  g.name = `building_${wall}`;
  const FH = 3.2, H = floors * FH + 0.9;
  let r = seed * 9301 + 49297;
  const rand = () => ((r = (r * 9301 + 49297) % 233280) / 233280);

  // walls
  const front = wallPlane(wall, w, H); front.position.set(0, H / 2, d / 2); g.add(front);
  const back = wallPlane(wall, w, H); back.position.set(0, H / 2, -d / 2); back.rotation.y = Math.PI; g.add(back);
  for (const s of [-1, 1]) {
    const side = wallPlane(wall, d, H);
    side.position.set(s * w / 2, H / 2, 0);
    side.rotation.y = s * Math.PI / 2;
    g.add(side);
  }
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(w, d), shared.roof);
  roof.rotation.x = -Math.PI / 2;
  roof.position.y = H - 0.6;
  g.add(roof);
  // parapet cap
  g.add(box(w + 0.1, 0.1, 0.3, shared.cap, 0, H + 0.05, d / 2 - 0.1));
  g.add(box(w + 0.1, 0.1, 0.3, shared.cap, 0, H + 0.05, -d / 2 + 0.1));
  for (const s of [-1, 1]) g.add(box(0.3, 0.1, d, shared.cap, s * (w / 2 - 0.1), H + 0.05, 0));

  // windows on every floor; the ground floor gets a door in place of one window
  const n = Math.max(2, Math.floor(w / 1.9));
  const doorAt = Math.floor(n / 2);
  for (let f = 0; f < floors; f++) {
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + (i + 0.5) * (w / n);
      if (f === 0 && i === doorAt) {
        const door = new THREE.Group();
        door.add(box(1.0, 2.2, 0.06, shared.door, 0, 1.1, 0));
        door.add(box(1.16, 0.08, 0.1, shared.frame, 0, 2.24, 0.02));
        for (const s of [-1, 1]) door.add(box(0.08, 2.28, 0.1, shared.frame, s * 0.54, 1.14, 0.02));
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), shared.cap);
        knob.position.set(0.36, 1.05, 0.05);
        door.add(knob);
        door.add(box(1.3, 0.12, 0.35, shared.cap, 0, 0.06, 0.2)); // step
        door.position.set(x, 0, d / 2 + 0.01);
        g.add(door);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.6, 1.2), toneMapped: false }));
        lamp.position.set(x + 0.75, 2.4, d / 2 + 0.1);
        g.add(lamp);
        continue;
      }
      const win = makeWindow(1.1, 1.45, rand() < 0.35);
      win.position.set(x, f * FH + 1.65, d / 2 + 0.01);
      g.add(win);
    }
  }
  // one warm light at the door so each facade reads at night
  const l = new THREE.PointLight('#ffd9a8', 3, 6, 2);
  l.position.set(-w / 2 + (doorAt + 0.5) * (w / n), 2.6, d / 2 + 1.2);
  g.add(l);
  g.userData.size = { w, d };
  return g;
}
