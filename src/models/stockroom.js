// Grocery back stockroom from the warehouse-pallet photos. Built in the grocery's local
// coordinates: room x 0..9, z -14..-6, entered through a doorway in the store's back wall
// (x 5.3..7.1). Plywood-sheathed walls, sealed concrete floor, teal pallet racking with
// orange beams, and pallets on the floor stacked with cases: cake-mix boxes, shrink-wrapped
// flour bags, soda can trays, water packs, juice bottles, crates, totes and a yellow dolly.
// All brand names are made up.
import * as THREE from 'three';
import { makeBlueCrate } from './grime39.js';

const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.7, ...o });
const _L = new THREE.TextureLoader();
function ptex(name, rx = 1, ry = 1) {
  const t = _L.load(`assets/textures/${name}`);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8;
  return t;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};
function plane(w, h, mat, x, y, z, ry = 0, rx = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, 0);
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- materials
let M = null;
function mats() {
  if (M) return M;
  M = {};
  M.ply = std({ map: ptex('wh_ply.png'), roughness: 0.85, emissive: '#5a2e10', emissiveIntensity: 0.55 });
  M.floor = std({ map: ptex('wh_floor.png', 4, 4), color: '#cfcfcf', roughness: 0.7, metalness: 0.05 });
  M.cardboard = std({ map: ptex('store_cardboard.png'), roughness: 0.9 });
  M.card2 = std({ color: '#b8915f', roughness: 0.9 });
  M.teal = std({ map: uprightTex(), roughness: 0.5, metalness: 0.3 });
  M.orange = std({ color: '#ec6a22', roughness: 0.55, metalness: 0.1, emissive: '#3a1404' });
  M.palletWood = std({ map: palletTex(false), roughness: 0.9 });
  M.palletBlue = std({ map: palletTex(true), roughness: 0.9 });
  M.plastic = std({ color: '#202124', roughness: 0.55 });
  M.wrap = new THREE.MeshStandardMaterial({ color: '#eef3f6', transparent: true, opacity: 0.22, roughness: 0.15, metalness: 0.1, depthWrite: false });
  M.water = std({ map: ptex('wh_water.png'), roughness: 0.25 });
  M.waterTop = std({ map: capsTex('#e8eef2', '#3e6fcf'), roughness: 0.3 });
  M.cans = std({ map: ptex('wh_cans.png'), roughness: 0.35, metalness: 0.3 });
  M.canSide = std({ map: canvasTex(128, 64, (x, w, h) => {
    for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#c7232c' : '#b11d25'; x.fillRect(i * 16, 0, 16, h); x.fillStyle = '#e8e8e8'; x.fillRect(i * 16, 0, 16, 6); }
  }), roughness: 0.35, metalness: 0.3 });
  M.blueCrate = std({ map: crateTex('#2e6be0'), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5 });
  M.blackCrate = std({ map: crateTex('#1b1c1f'), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5 });
  M.yellow = std({ color: '#f1c21b', roughness: 0.55 });
  return M;
}

function uprightTex() {      // teal-green upright with the punched teardrop slots
  return canvasTex(32, 256, (x, w, h) => {
    x.fillStyle = '#5a9487'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#18221f';
    for (let y = 6; y < h; y += 16) { x.fillRect(9, y, 4, 9); x.fillRect(20, y, 4, 9); }
    x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(0, 0, 3, h);
  });
}
function palletTex(blue) {   // pale pine deck boards, some painted blue like the photo
  return canvasTex(256, 256, (x, w, h) => {
    const r = rng(blue ? 3 : 7);
    x.fillStyle = '#cdb48a'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      x.strokeStyle = `rgba(${120 + r() * 40},${90 + r() * 30},${50 + r() * 20},${0.15 + r() * 0.2})`;
      x.beginPath(); const y = r() * h; x.moveTo(0, y); x.bezierCurveTo(w * 0.3, y + (r() - 0.5) * 8, w * 0.6, y + (r() - 0.5) * 8, w, y + (r() - 0.5) * 6); x.stroke();
    }
    if (blue) { x.fillStyle = 'rgba(46,110,200,0.85)'; x.fillRect(0, 0, w, h * 0.45); x.fillStyle = 'rgba(46,110,200,0.5)'; for (let i = 0; i < 30; i++) x.fillRect(r() * w, h * 0.45 + r() * 30, 10 + r() * 30, 4 + r() * 8); }
    x.fillStyle = '#4a3a28'; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(20 + (i % 3) * 108, 30 + Math.floor(i / 3) * 190, 3, 0, 7); x.fill(); }
  });
}
function crateTex(col) {
  return canvasTex(128, 128, (x, w, h) => {
    x.fillStyle = col; x.fillRect(0, 0, w, h);
    x.clearRect(0, 0, 0, 0);
    x.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { x.beginPath(); x.ellipse(14 + i * 20, 36 + j * 28, 6, 9, Math.PI / 4, 0, 7); x.fill(); }
    x.fillRect(40, 10, 48, 12);    // hand hole
  });
}
function capsTex(bottle, cap) {
  return canvasTex(128, 128, (x, w, h) => {
    x.fillStyle = '#b9c4cc'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      x.fillStyle = bottle; x.beginPath(); x.arc(16 + i * 32, 16 + j * 32, 14, 0, 7); x.fill();
      x.fillStyle = cap; x.beginPath(); x.arc(16 + i * 32, 16 + j * 32, 6, 0, 7); x.fill();
    }
  });
}

// made-up product case faces in the colours of the photo
const caseMats = {};
function caseMat(kind) {
  if (caseMats[kind]) return caseMats[kind];
  const spec = {
    cake: ['#f2c417', '#d8262e', 'SUNNY BAKE', 'CAKE MIX'],
    pink: ['#e9506a', '#ffffff', 'SUNNY BAKE', 'FROSTING'],
    cookie: ['#c9242c', '#ffffff', 'GRANDMA JO', 'COOKIES'],
    aloe: ['#e8dcc4', '#7b5a2a', 'ALOE CO.', 'COCONUT DRINK'],
    juice: ['#2f9a4a', '#f4f1e3', 'ORCHARD', 'GRAPE JUICE'],
    sparkle: ['#d9d3ea', '#7a4ea8', 'BUBBLY', 'SPARKLING'],
    hydro: ['#f08a2a', '#ffffff', 'ROAR', 'HYDRATION'],
  }[kind];
  const side = canvasTex(256, 160, (x, w, h) => {
    x.fillStyle = spec[0]; x.fillRect(0, 0, w, h);
    x.fillStyle = spec[1]; x.fillRect(0, h * 0.62, w, h * 0.12);
    x.font = '34px "Archivo Black"'; x.textAlign = 'center'; x.fillText(spec[2], w / 2, 52);
    x.font = '600 24px "Oswald"'; x.fillText(spec[3], w / 2, 88);
    x.fillStyle = 'rgba(0,0,0,0.6)'; x.font = '13px "Roboto Condensed"'; x.fillText('12 / 15.25 OZ', w / 2, h - 12);
    x.fillStyle = '#fff'; x.fillRect(w - 52, 8, 44, 22); x.fillStyle = '#111'; for (let i = 0; i < 18; i++) x.fillRect(w - 50 + i * 2.3, 10, 1 + (i % 3 === 0), 16);
  });
  const top = std({ color: spec[0], roughness: 0.75 });
  const s = std({ map: side, roughness: 0.75 });
  caseMats[kind] = [s, s, top, top, s, s];
  return caseMats[kind];
}
const bagMats = {};
function flourMat(band) {       // paper flour bag, made-up GOLDEN MILL
  if (bagMats[band]) return bagMats[band];
  bagMats[band] = std({ roughness: 0.9, map: canvasTex(128, 96, (x, w, h) => {
    x.fillStyle = '#f3efe6'; x.fillRect(0, 0, w, h);
    x.fillStyle = band; x.fillRect(0, h * 0.55, w, h * 0.3);
    x.fillStyle = '#c23a3a'; x.beginPath(); x.arc(w / 2, h * 0.3, 16, 0, 7); x.fill();
    x.fillStyle = '#fff'; x.font = '11px "Alfa Slab One"'; x.textAlign = 'center'; x.fillText('GOLDEN', w / 2, h * 0.28); x.fillText('MILL', w / 2, h * 0.38);
    x.fillStyle = '#fff'; x.font = '600 15px "Oswald"'; x.fillText('FLOUR', w / 2, h * 0.75);
  }) });
  return bagMats[band];
}

// ---------------------------------------------------------------- pieces
function pallet(mat, plastic = false) {
  const g = new THREE.Group();
  if (plastic) {
    g.add(box(1.2, 0.03, 1.0, M.plastic, 0, 0.135, 0));
    for (const x of [-0.5, 0, 0.5]) for (const z of [-0.4, 0, 0.4]) g.add(box(0.14, 0.12, 0.14, M.plastic, x, 0.06, z));
    for (let i = 0; i < 8; i++) g.add(box(0.02, 0.005, 0.9, std({ color: '#0d0d0e' }), -0.52 + i * 0.15, 0.152, 0));
    return g;
  }
  for (let i = 0; i < 7; i++) g.add(box(1.2, 0.022, 0.1, mat, 0, 0.133, -0.45 + i * 0.15));     // deck boards
  for (const z of [-0.45, 0, 0.45]) g.add(box(1.2, 0.022, 0.1, mat, 0, 0.011, z));                 // bottom boards
  for (const x of [-0.55, 0, 0.55]) for (const z of [-0.45, 0, 0.45]) g.add(box(0.1, 0.09, 0.1, mat, x, 0.067, z));  // blocks
  return g;
}
function wrapAround(g, w, h, d, x, y, z) {      // shrink wrap film
  const m = box(w + 0.02, h + 0.01, d + 0.02, M.wrap, x, y + h / 2, z);
  m.castShadow = false;
  g.add(m);
}
function crate(mat, x, y, z, ry = 0) {
  const g = new THREE.Group();
  const w = 0.33, h = 0.28;
  for (const [px, pz, r] of [[0, w / 2, 0], [0, -w / 2, 0], [w / 2, 0, Math.PI / 2], [-w / 2, 0, Math.PI / 2]]) g.add(plane(w, h, mat, px, h / 2, pz, r));
  g.add(box(w, 0.02, w, mat === M.blueCrate ? std({ color: '#2e6be0' }) : M.plastic, 0, 0.01, 0));
  g.position.set(x, y, z);
  g.rotation.y = ry;
  return g;
}
// lathe bottles as instanced clusters (juice, oil, sparkling)
function bottleCluster(n, m, col, capCol, h = 0.28, r = 0.04) {
  const pts = [[0, 0], [r, 0], [r, h * 0.62], [r * 0.45, h * 0.82], [r * 0.32, h * 0.97], [0, h]].map(([a, b]) => new THREE.Vector2(a, b));
  const geo = new THREE.LatheGeometry(pts, 10);
  const mat = std({ color: col, roughness: 0.25, transparent: true, opacity: 0.85 });
  const inst = new THREE.InstancedMesh(geo, mat, n * m);
  const capI = new THREE.InstancedMesh(new THREE.CylinderGeometry(r * 0.36, r * 0.36, 0.02, 8), std({ color: capCol }), n * m);
  const q = new THREE.Matrix4();
  let k = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
    const x = (i - (n - 1) / 2) * r * 2.1, z = (j - (m - 1) / 2) * r * 2.1;
    q.makeTranslation(x, 0, z); inst.setMatrixAt(k, q);
    q.makeTranslation(x, h + 0.005, z); capI.setMatrixAt(k, q);
    k++;
  }
  const g = new THREE.Group();
  g.add(inst, capI);
  g.userData.size = [n * r * 2.1, h, m * r * 2.1];
  return g;
}
const rackLoad = [];
function rackBay(x0, x1, z0, z1, r) {
  // one bay of pallet racking: uprights at both ends, two orange beam levels, deck of loads
  const g = new THREE.Group();
  for (const x of [x0, x1]) {
    for (const z of [z0 + 0.05, z1 - 0.05]) {
      g.add(box(0.08, 3.7, 0.07, M.teal, x, 1.85, z));
      g.add(box(0.14, 0.3, 0.14, M.orange, x, 0.15, z));      // orange post protector (photo)
    }
    for (let y = 0.4; y < 3.6; y += 0.6) {                    // bracing
      const b = box(0.03, 0.03, Math.hypot(z1 - z0, 0.6), M.teal, x, y + 0.3, (z0 + z1) / 2);
      b.rotation.x = Math.atan2(0.6, z1 - z0) * (Math.round(y / 0.6) % 2 ? 1 : -1);
      g.add(b);
    }
  }
  for (const y of [1.9, 3.4]) {
    for (const z of [z0 + 0.05, z1 - 0.05]) g.add(box(x1 - x0, 0.12, 0.05, M.orange, (x0 + x1) / 2, y, z));
    for (let x = x0 + 0.3; x < x1 - 0.1; x += 0.5) g.add(box(0.03, 0.03, z1 - z0, std({ color: '#8a8d8c', metalness: 0.5 }), x, y + 0.06, (z0 + z1) / 2));
    // loads on the beams: big brown cases + water packs
    let x = x0 + 0.1;
    while (x < x1 - 0.5) {
      const w = 0.5 + r() * 0.35, h = 0.35 + r() * 0.5, d = (z1 - z0) - 0.15;
      if (r() < 0.3) {
        const b = box(w, 0.3, d, [M.water, M.water, M.waterTop, M.waterTop, M.water, M.water], x + w / 2, y + 0.07 + 0.15, (z0 + z1) / 2);
        g.add(b);
        if (r() < 0.6) g.add(box(w, 0.3, d, [M.water, M.water, M.waterTop, M.waterTop, M.water, M.water], x + w / 2, y + 0.37 + 0.15, (z0 + z1) / 2));
      } else {
        g.add(box(w, h, d, r() < 0.5 ? M.cardboard : M.card2, x + w / 2, y + 0.07 + h / 2, (z0 + z1) / 2 + (r() - 0.5) * 0.08));
      }
      x += w + 0.04 + r() * 0.1;
    }
  }
  return g;
}

// ---------------------------------------------------------------- floor loads
function cakeStack(r) {              // photo 1: yellow cake-mix cases + pink frosting + cardboard + crates
  const g = new THREE.Group();
  g.add(pallet(M.palletBlue));
  const y0 = 0.145;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const n = 2 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) {
      const kind = (i + k) % 3 === 2 ? 'pink' : 'cake';
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.4), caseMat(kind));
      b.position.set(-0.38 + i * 0.38 + (r() - 0.5) * 0.04, y0 + 0.11 + k * 0.22, -0.22 + j * 0.44);
      b.rotation.y = (r() - 0.5) * 0.12;
      b.castShadow = true;
      g.add(b);
    }
  }
  g.add(box(0.42, 0.5, 0.36, M.cardboard, 0.4, y0 + 0.9, -0.2));
  g.add(crate(M.blueCrate, -0.9, 0, 0.1, 0.2));
  g.add(crate(M.blueCrate, -0.9, 0.29, 0.1, 0.1));
  return g;
}
function flourStack(r) {             // photo 4: shrink-wrapped flour bag bundles + black tote on top
  const g = new THREE.Group();
  g.add(pallet(M.palletWood));
  const y0 = 0.145, bands = ['#e6707f', '#4f8fe0', '#e6707f', '#f2f0ea'];
  for (let lv = 0; lv < 3; lv++) {
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const band = bands[(lv + i + j * 2) % 4];
      const bundle = new THREE.Group();
      for (let b = 0; b < 5; b++) {
        const bag = box(0.11, 0.24, 0.42, flourMat(band), -0.22 + b * 0.11, 0.12, 0);
        bag.scale.set(1, 0.95 + r() * 0.08, 1);
        bundle.add(bag);
      }
      wrapAround(bundle, 0.56, 0.25, 0.43, 0, 0, 0);
      bundle.position.set(-0.29 + i * 0.58, y0 + lv * 0.27, -0.23 + j * 0.46);
      bundle.rotation.y = (r() - 0.5) * 0.08;
      g.add(bundle);
    }
  }
  // black lidded tote, made-up "STORE USE ONLY"
  const tote = new THREE.Group();
  tote.add(box(0.6, 0.38, 0.4, std({ color: '#1a1b1d', roughness: 0.5 }), 0, 0.19, 0));
  tote.add(box(0.64, 0.04, 0.44, std({ color: '#121314', roughness: 0.5 }), 0, 0.4, 0));
  tote.add(plane(0.3, 0.1, std({ map: canvasTex(128, 48, (x, w, h) => { x.fillStyle = '#1a1b1d'; x.fillRect(0, 0, w, h); x.fillStyle = '#eee'; x.font = '15px "Black Ops One"'; x.textAlign = 'center'; x.fillText('STORE USE', w / 2, 20); x.fillText('ONLY', w / 2, 40); }) }), 0, 0.15, 0.201));
  tote.position.set(0.05, y0 + 0.82, 0.05);
  tote.rotation.y = 0.15;
  g.add(tote);
  return g;
}
function drinkStack(r) {             // photo 3: aloe cases, soda can trays, water packs, juice, crate of bottles
  const g = new THREE.Group();
  g.add(pallet(M.palletWood));
  const y0 = 0.145;
  // soda can trays (photo top), 2 layers
  for (let lv = 0; lv < 2; lv++) g.add(box(0.5, 0.13, 0.36, [M.canSide, M.canSide, M.cans, M.cans, M.canSide, M.canSide], 0.3, y0 + 0.065 + lv * 0.13, 0.25));
  wrapAround(g, 0.5, 0.26, 0.36, 0.3, y0, 0.25);
  // aloe drink cases
  for (let k = 0; k < 2; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.4), caseMat('aloe')); b.position.set(0.3, y0 + 0.1 + k * 0.2, -0.22); g.add(b); }
  // water packs (photo side texture)
  for (let k = 0; k < 3; k++) g.add(box(0.5, 0.24, 0.38, [M.water, M.water, M.waterTop, M.waterTop, M.water, M.water], -0.3, y0 + 0.12 + k * 0.24, -0.2));
  // juice bottle bundle + grape juice cases
  const jb = bottleCluster(3, 4, '#c9b25a', '#2a7d3c', 0.26, 0.04);
  jb.position.set(-0.3, y0, 0.25);
  g.add(jb);
  wrapAround(g, 0.27, 0.27, 0.35, -0.3, y0, 0.25);
  const cr = crate(M.blueCrate, -0.3, y0 + 0.72, -0.2, 0.05);
  g.add(cr);
  const wine = bottleCluster(2, 2, '#d8d0a0', '#d9c26a', 0.32, 0.035);
  wine.position.set(-0.3, y0 + 0.74, -0.2);
  g.add(wine);
  for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.3), caseMat('juice')); b.position.set(0.32, y0 + 0.5 + k * 0.2, -0.22); b.rotation.y = (r() - 0.5) * 0.1; g.add(b); }
  return g;
}
function mixedStack(r) {             // photo 6: black plastic pallet, folding black crates, orange hydration case
  const g = new THREE.Group();
  g.add(pallet(null, true));
  const y0 = 0.155;
  g.add(box(0.6, 0.55, 0.45, M.cardboard, 0.28, y0 + 0.275, -0.22));
  g.add(box(0.55, 0.4, 0.42, M.card2, 0.3, y0 + 0.75, -0.2));
  for (let k = 0; k < 2; k++) g.add(crate(M.blackCrate, 0.3, y0 + 0.95 + k * 0.29, -0.2, 0.1));
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.25, 0.3), caseMat('hydro')); h.position.set(-0.3, y0 + 0.125, 0.2); g.add(h);
  const sp = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.3, 0.28), caseMat('sparkle')); sp.position.set(-0.3, y0 + 0.4, 0.2); g.add(sp);
  const sp2 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.3, 0.28), caseMat('sparkle')); sp2.position.set(-0.28, y0 + 0.7, 0.18); sp2.rotation.y = 0.2; g.add(sp2);
  const yb = bottleCluster(3, 2, '#f1efe6', '#d43a2a', 0.2, 0.035);
  yb.position.set(-0.3, y0, -0.25);
  g.add(yb);
  wrapAround(g, 0.24, 0.21, 0.16, -0.3, y0, -0.25);
  return g;
}
function openPallet(r) {             // photo 2: bare blue-painted pallet with two oil bottles, a few cases
  const g = new THREE.Group();
  g.add(pallet(M.palletBlue));
  const y0 = 0.145;
  const oil = bottleCluster(2, 1, '#f0c52a', '#2a9d8f', 0.3, 0.045);
  oil.position.set(0.1, y0, 0.3);
  g.add(oil);
  for (let k = 0; k < 2; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.3), caseMat('cookie')); b.position.set(-0.3, y0 + 0.09 + k * 0.18, -0.2); g.add(b); }
  const w = bottleCluster(3, 2, '#dfe8ee', '#3e6fcf', 0.22, 0.035);
  w.position.set(0.25, y0, -0.2);
  g.add(w);
  wrapAround(g, 0.24, 0.23, 0.16, 0.25, y0, -0.2);
  return g;
}
function dolly() {                   // yellow plastic flat dolly from photo 1
  const g = new THREE.Group();
  g.add(box(0.75, 0.05, 0.5, M.yellow, 0, 0.12, 0));
  g.add(box(0.6, 0.051, 0.35, std({ color: '#2a3a30' }), 0, 0.121, 0));
  for (const x of [-0.32, 0.32]) for (const z of [-0.2, 0.2]) {
    g.add(box(0.06, 0.05, 0.06, std({ color: '#777', metalness: 0.6 }), x, 0.075, z));
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 12), M.plastic);
    w.rotation.z = Math.PI / 2; w.position.set(x, 0.035, z); g.add(w);
  }
  return g;
}

// ---------------------------------------------------------------- the room
export function makeStockroom() {
  mats();
  const g = new THREE.Group();
  const X0 = 0, X1 = 9, Z0 = -14, Z1 = -6, H = 4.2, DX0 = 5.3, DX1 = 7.1;
  const colliders = [];
  const solid = (a, b, c, d) => colliders.push([a, b, c, d]);
  const r = rng(23);

  // floor + walls (plywood sheathing, 1.22 x 2.44 sheets)
  g.add(plane(X1 - X0, Z1 - Z0, M.floor, (X0 + X1) / 2, 0.012, (Z0 + Z1) / 2, 0, -Math.PI / 2));
  const wall = (len, x, z, ry) => {
    const mat = M.ply.clone();
    mat.map = M.ply.map.clone(); mat.map.needsUpdate = true; mat.map.repeat.set(len / 1.6, H / 0.84);
    g.add(plane(len, H, mat, x, H / 2, z, ry));
    for (let s = 1.22; s < len - 0.1; s += 1.22) {        // dark seams between sheets
      const seam = box(0.012, H, 0.01, std({ color: '#3d2412' }), 0, H / 2, 0);
      seam.position.set(x + Math.cos(ry) * (s - len / 2), H / 2, z - Math.sin(ry) * (s - len / 2));
      seam.rotation.y = ry;
      g.add(seam);
    }
    const seamH = box(len, 0.012, 0.01, std({ color: '#3d2412' }), x, 2.44, z); seamH.rotation.y = ry; g.add(seamH);
  };
  wall(X1 - X0, (X0 + X1) / 2, Z0 + 0.01, 0);
  wall(Z1 - Z0, X0 + 0.01, (Z0 + Z1) / 2, Math.PI / 2);
  wall(Z1 - Z0, X1 - 0.01, (Z0 + Z1) / 2, -Math.PI / 2);
  // door wall (back of the store), plywood on this side, with the opening
  wall(DX0 - X0, (X0 + DX0) / 2, Z1 - 0.02, Math.PI);
  wall(X1 - DX1, (DX1 + X1) / 2, Z1 - 0.02, Math.PI);
  g.add(box(DX1 - DX0, H - 2.4, 0.05, M.ply, (DX0 + DX1) / 2, 2.4 + (H - 2.4) / 2, Z1 - 0.08));
  // outside skin (matches the store's exterior wall) + roof
  const skin = std({ color: '#b9b2a6', roughness: 0.9 });
  g.add(plane(X1 - X0 + 0.04, H, skin, (X0 + X1) / 2, H / 2, Z0 - 0.02, Math.PI));
  g.add(plane(Z1 - Z0, H, skin, X0 - 0.02, H / 2, (Z0 + Z1) / 2, -Math.PI / 2));
  g.add(plane(Z1 - Z0, H, skin, X1 + 0.02, H / 2, (Z0 + Z1) / 2, Math.PI / 2));
  g.add(plane(X1 - X0 + 0.04, Z1 - Z0 + 0.04, std({ color: '#2f3033' }), (X0 + X1) / 2, H + 0.002, (Z0 + Z1) / 2, 0, -Math.PI / 2));
  // yellow safety stripe along the base of the walls (photo 6)
  g.add(box(X1 - X0, 0.08, 0.02, M.yellow, (X0 + X1) / 2, 0.04, Z0 + 0.03));
  g.add(plane(X1 - X0, Z1 - Z0, std({ color: '#6a6c6e', emissive: '#202224' }), (X0 + X1) / 2, H, (Z0 + Z1) / 2, 0, Math.PI / 2));
  solid(X0 - 0.2, X1 + 0.2, Z0 - 0.2, Z0 + 0.05);
  solid(X0 - 0.2, X0 + 0.05, Z0, Z1);
  solid(X1 - 0.05, X1 + 0.2, Z0, Z1);

  // lights: two fluorescent strips + point lights
  for (const x of [2.5, 6.5]) {
    g.add(box(0.2, 0.06, 2.4, std({ color: '#ddd' }), x, H - 0.08, -10));
    g.add(box(0.12, 0.02, 2.3, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.4, 1.3), toneMapped: false }), x, H - 0.12, -10));
    const l = new THREE.PointLight('#fff4e0', 14, 14, 1.2); l.position.set(x, H - 0.4, -10); g.add(l);
  }

  // pallet racking along the back wall (2 bays) and left wall (2 bays)
  g.add(rackBay(0.2, 2.9, Z0 + 0.1, Z0 + 1.2, r));
  g.add(rackBay(2.9, 5.6, Z0 + 0.1, Z0 + 1.2, r));
  g.add(rackBay(5.6, 8.8, Z0 + 0.1, Z0 + 1.2, r));
  const side = new THREE.Group();
  side.add(rackBay(0, 2.7, 0, 1.1, r), rackBay(2.7, 5.4, 0, 1.1, r));
  side.rotation.y = Math.PI / 2;
  side.position.set(X0 + 0.1, 0, Z1 - 0.9);    // runs along x=0 wall toward the back
  g.add(side);

  // floor loads under / in front of the racks (like the photos: everything on pallets on the floor)
  const place = (o, x, z, ry, w = 0.65, d = 0.6) => { o.position.set(x, 0, z); o.rotation.y = ry; g.add(o); solid(x - w, x + w, z - d, z + d); };
  place(cakeStack(r), 1.5, Z0 + 0.75, 0.04);
  place(flourStack(r), 4.2, Z0 + 0.75, -0.03);
  place(drinkStack(r), 7.2, Z0 + 0.75, 0.05);
  place(mixedStack(r), X0 + 0.75, -9.5, Math.PI / 2 + 0.06, 0.6, 0.65);
  place(openPallet(r), X0 + 0.75, -11.0, Math.PI / 2 - 0.04, 0.6, 0.65);
  place(flourStack(rng(77)), 8.1, -10.8, -Math.PI / 2 + 0.05, 0.6, 0.65);
  // tall stacked boxes by the door + an empty tray of shrink wrap
  for (let k = 0; k < 3; k++) g.add(box(0.55, 0.45, 0.45, k % 2 ? M.card2 : M.cardboard, 8.3 + (r() - 0.5) * 0.05, 0.225 + k * 0.45, -8.2));
  const cy = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.3, 0.3), caseMat('cake')); cy.position.set(8.3, 1.5, -8.2); cy.rotation.y = 0.3; g.add(cy);
  solid(7.95, 8.65, -8.5, -7.9);
  const d = dolly(); d.position.set(3.0, 0, -10.6); d.rotation.y = 0.4; g.add(d);
  const tray = box(0.5, 0.08, 0.4, M.cardboard, 5.0, 0.04, -11.0); tray.rotation.y = -0.3; g.add(tray);
  wrapAround(g, 0.5, 0.12, 0.4, 5.0, 0, -11.0);
  // a stack of blue crates of pulled stock with torn labels (item 39)
  [[1.95, 0, -11.75, 0.05, 'DISCONTINUED', '#ff2bb8'], [1.95, 0.3, -11.75, -0.04, 'CLEARANCE', '#ff7a1a'], [1.95, 0.6, -11.72, 0.08, null], [2.0, 0, -11.25, 0.1, 'SALE', '#ffe01a']].forEach(([cx, cy, cz, ry, lb, lc], i) => {
    const c = makeBlueCrate({ label: lb, labelCol: lc, seed: i }); c.position.set(cx, cy, cz); c.rotation.y = Math.PI / 2 + ry; g.add(c); });
  solid(1.7, 2.25, -12.1, -10.9);
  // gallon water jug on the floor
  const jug = bottleCluster(1, 1, '#eef2f4', '#e9e9e9', 0.3, 0.075);
  jug.position.set(6.4, 0, -12.4);
  g.add(jug);

  // doorway trim + made-up EMPLOYEES ONLY sign on the store side
  const trim = std({ color: '#5a5d60', metalness: 0.4 });
  for (const x of [DX0, DX1]) g.add(box(0.08, 2.4, 0.22, trim, x, 1.2, Z1));
  g.add(box(DX1 - DX0 + 0.08, 0.08, 0.22, trim, (DX0 + DX1) / 2, 2.4, Z1));
  const sign = plane(0.9, 0.22, std({ map: canvasTex(256, 64, (x, w, h) => { x.fillStyle = '#c8232c'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = '600 28px "Oswald"'; x.textAlign = 'center'; x.fillText('EMPLOYEES ONLY', w / 2, 43); }) }), (DX0 + DX1) / 2, 2.7, Z1 + 0.12);
  g.add(sign);
  // swinging stockroom doors held open (grey, with kick plates + windows)
  for (const s of [-1, 1]) {
    const dg = new THREE.Group();
    const w = (DX1 - DX0) / 2;
    dg.add(box(w, 2.3, 0.05, std({ color: '#a9adb0', roughness: 0.5 }), -s * w / 2, 1.15, 0));
    dg.add(box(w * 0.9, 0.35, 0.06, std({ color: '#b9bcbe', metalness: 0.7, roughness: 0.3 }), -s * w / 2, 0.2, 0));
    dg.add(box(0.2, 0.3, 0.06, std({ color: '#223', roughness: 0.1 }), -s * w / 2, 1.6, 0));
    dg.position.set(s < 0 ? DX0 + 0.02 : DX1 - 0.02, 0, Z1 - 0.05);
    dg.rotation.y = -s * 1.52;      // propped open into the stockroom
    g.add(dg);
  }
  // door wall colliders (either side of the opening)
  solid(X0, DX0, Z1 - 0.15, Z1 + 0.15);
  solid(DX1, X1, Z1 - 0.15, Z1 + 0.15);

  g.userData.colliders = colliders;
  return g;
}
