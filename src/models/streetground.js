// Street ground pieces from the sidewalk / paver / crack / lid photos:
// herringbone paver sidewalk with stretcher bands, a paver crosswalk with white
// edge lines, curb-ramp tactile plates, crack decals on concrete, utility lids
// with locate-paint marks, a round iron drain cover, a raised traffic island,
// and the dirt lot behind a blue-screened fence.
import * as THREE from 'three';
import { canvasTexture } from '../world/util.js';

const loader = new THREE.TextureLoader();
function tex(name, color = true) {
  const t = loader.load(`assets/textures/${name}`);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Flat ground quad over [x0,x1] x [z0,z1] at height y; texture repeats every `unit` m.
function quad(mat, x0, x1, z0, z1, y, unitU, unitV = unitU, rotate = false) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i) * (x1 - x0), v = uv.getY(i) * (z1 - z0);
    if (rotate) uv.setXY(i, v / unitU, u / unitV); else uv.setXY(i, u / unitU, v / unitV);
  }
  const m = new THREE.Mesh(g, mat);
  m.rotation.x = -Math.PI / 2;
  m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
  m.receiveShadow = true;
  return m;
}

const M = {};
function mats() {
  if (M.herring) return M;
  const surf = (name, extra = {}) => new THREE.MeshStandardMaterial({
    map: tex(`${name}.png`), normalMap: tex(`${name}_normal.png`, false),
    normalScale: new THREE.Vector2(0.7, 0.7), roughness: 0.9, ...extra,
  });
  M.herring = surf('pavers_herringbone');
  M.band = surf('pavers_band');
  M.concrete = new THREE.MeshStandardMaterial({ map: tex('sidewalk.png'), normalMap: tex('sidewalk_normal.png', false), color: new THREE.Color(0.92, 0.94, 1.0), roughness: 0.9 });
  M.white = new THREE.MeshStandardMaterial({ color: '#e8e6df', roughness: 0.7 });
  M.tactile = new THREE.MeshStandardMaterial({ map: tex('tactile_plate.png'), roughness: 0.6, metalness: 0.4 });
  M.curb = new THREE.MeshStandardMaterial({ color: '#a7a49d', roughness: 0.9 });
  M.dirt = new THREE.MeshStandardMaterial({ map: tex('dirt_lot.png'), normalMap: tex('dirt_lot_normal.png', false), roughness: 1 });
  M.lid = new THREE.MeshStandardMaterial({ color: '#8f8e89', roughness: 0.75, metalness: 0.15 });
  M.iron = new THREE.MeshStandardMaterial({ color: '#2a2826', roughness: 0.6, metalness: 0.6 });
  M.cracks = [1, 2, 3].map((i) => new THREE.MeshStandardMaterial({
    map: tex(`crack_${i}.png`), transparent: true, depthWrite: false, roughness: 1,
    polygonOffset: true, polygonOffsetFactor: -2,
  }));
  return M;
}

// Paver sidewalk along x: band next to the curb, herringbone field, band, then a
// concrete strip by the buildings (the layout in the paver photos).
export function makePaverSidewalk(x0, x1, zCurb, zBack) {
  const m = mats();
  const g = new THREE.Group();
  g.name = 'paver_sidewalk';
  const dir = Math.sign(zBack - zCurb);
  const z = (d) => zCurb + dir * d;
  const strip = (mat, d0, d1, unit, rot) => {
    const [a, b] = [z(d0), z(d1)].sort((p, q) => p - q);
    g.add(quad(mat, x0, x1, a, b, 0.006, unit, unit, rot));
  };
  const W = Math.abs(zBack - zCurb);
  strip(m.band, 0.1, 0.5, 0.4);           // 2 brick rows (200 mm each) by the curb
  strip(m.herring, 0.5, W - 1.0, 0.8);
  strip(m.band, W - 1.0, W - 0.6, 0.4);
  strip(m.concrete, W - 0.6, W, 1.5);
  return g;
}

// Round cast-iron drain cover (seen set into the herringbone pavers).
export function makeDrainCover() {
  const t = canvasTexture(256, 256, (c, w, h) => {
    c.fillStyle = '#2b2927'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#4a4642'; c.lineWidth = 6;
    for (let r = 30; r < 128; r += 22) { c.beginPath(); c.arc(128, 128, r, 0, Math.PI * 2); c.stroke(); }
    for (let a = 0; a < 12; a++) {
      c.beginPath(); c.moveTo(128, 128);
      c.lineTo(128 + Math.cos(a * Math.PI / 6) * 120, 128 + Math.sin(a * Math.PI / 6) * 120); c.stroke();
    }
  });
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 32),
    [mats().iron, new THREE.MeshStandardMaterial({ map: t, roughness: 0.55, metalness: 0.6 }), mats().iron]);
  m.position.y = 0.008;
  m.name = 'drain_cover';
  return m;
}

// Paver crosswalk running along z from z0 to z1 at x0..x1, with white edge lines.
export function makePaverCrosswalk(x0, x1, z0, z1) {
  const m = mats();
  const g = new THREE.Group();
  g.name = 'paver_crosswalk';
  g.add(quad(m.herring, x0 + 0.2, x1 - 0.2, z0, z1, 0.007, 0.8));
  g.add(quad(m.band, x0, x0 + 0.2, z0, z1, 0.007, 0.4, 0.4, true));
  g.add(quad(m.band, x1 - 0.2, x1, z0, z1, 0.007, 0.4, 0.4, true));
  for (const x of [x0 - 0.25, x1 + 0.05]) g.add(quad(m.white, x, x + 0.2, z0, z1, 0.008, 1));
  return g;
}

// Rusty truncated-dome warning plate for a curb ramp (0.6 x 1.2 m), long side along x.
export function makeTactilePlate(x, z, rotY = 0) {
  const p = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.012, 0.6), mats().tactile);
  p.geometry.attributes.uv.array.forEach(() => {});
  p.position.set(x, 0.01, z);
  p.rotation.y = rotY;
  p.receiveShadow = true;
  p.name = 'tactile_plate';
  return p;
}

// Crack decals scattered over a concrete area.
export function makeCracks(x0, x1, z0, z1, n, seed = 3) {
  const m = mats();
  const g = new THREE.Group();
  g.name = 'concrete_cracks';
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const w = 0.9 + r() * 0.8;
    const d = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.56), m.cracks[i % 3]);
    d.rotation.set(-Math.PI / 2, 0, r() * Math.PI * 2);
    d.position.set(x0 + r() * (x1 - x0), 0.009, z0 + r() * (z1 - z0));
    d.renderOrder = 2;
    g.add(d);
  }
  return g;
}

// Flush utility lid with orange/red locate-paint marks around it (utility-box photo).
export function makeUtilityLid(x, z, rotY = 0) {
  const g = new THREE.Group();
  g.name = 'utility_lid';
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.02, 0.85), mats().lid);
  lid.position.y = 0.008;
  g.add(lid);
  for (const dz of [-0.3, 0.3]) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.004, 0.025), mats().iron);
    slot.position.set(0.18, 0.019, dz);
    g.add(slot);
  }
  const paint = canvasTexture(256, 256, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.strokeStyle = 'rgba(214,52,38,0.85)'; c.lineWidth = 9; c.lineCap = 'round';
    c.beginPath(); c.moveTo(30, 200); c.lineTo(110, 200); c.lineTo(95, 185); c.moveTo(110, 200); c.lineTo(95, 215); c.stroke();
    c.beginPath(); c.moveTo(200, 30); c.lineTo(200, 120); c.stroke();
    c.fillStyle = 'rgba(214,52,38,0.85)'; c.font = '40px "Permanent Marker"'; c.fillText('W', 150, 225);
  });
  const deco = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4),
    new THREE.MeshStandardMaterial({ map: paint, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }));
  deco.rotation.x = -Math.PI / 2;
  deco.position.set(-0.2, 0.009, 0.1);
  g.add(deco);
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return g;
}

// Raised concrete traffic island with a cut-through for the crosswalk.
export function makeTrafficIsland(x0, x1, z0, z1, cut = null) {
  const g = new THREE.Group();
  g.name = 'traffic_island';
  const piece = (a, b) => {
    const top = new THREE.Mesh(new THREE.BoxGeometry(b - a, 0.15, z1 - z0), mats().curb);
    top.position.set((a + b) / 2, 0.075, (z0 + z1) / 2);
    top.castShadow = top.receiveShadow = true;
    g.add(top);
  };
  if (cut) { piece(x0, cut[0]); piece(cut[1], x1); } else piece(x0, x1);
  return g;
}

// Dirt lot strip with a chain-link fence wrapped in blue screen (dirt-lot photo).
export function makeDirtLot(x0, x1, z0, z1, seed = 9) {
  const m = mats();
  const g = new THREE.Group();
  g.name = 'dirt_lot';
  g.add(quad(m.dirt, x0, x1, z0, z1, 0.005, 1.6));
  const screen = new THREE.MeshStandardMaterial({ color: '#2f5fc4', roughness: 0.85, side: THREE.DoubleSide });
  const post = new THREE.MeshStandardMaterial({ color: '#9ea2a5', roughness: 0.4, metalness: 0.7 });
  const fx = x1 + 0.05, len = z1 - z0;
  const s = new THREE.Mesh(new THREE.PlaneGeometry(len, 1.8), screen);
  s.rotation.y = -Math.PI / 2;
  s.position.set(fx, 0.95, (z0 + z1) / 2);
  g.add(s);
  for (let z = z0; z <= z1 + 0.01; z += 2.5) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 8), post);
    p.position.set(fx, 1.0, z);
    g.add(p);
  }
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, len, 8), post);
  rail.rotation.x = Math.PI / 2;
  rail.position.set(fx, 1.95, (z0 + z1) / 2);
  g.add(rail);
  // debris clods
  const r = rng(seed);
  const clod = new THREE.MeshStandardMaterial({ color: '#5c4a38', roughness: 1 });
  for (let i = 0; i < 40; i++) {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.02 + r() * 0.05, 0), clod);
    c.position.set(x0 + r() * (x1 - x0), 0.01, z0 + r() * (z1 - z0));
    c.scale.y = 0.5;
    g.add(c);
  }
  return g;
}
