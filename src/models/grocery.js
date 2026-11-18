// Grocery store from the store / dairy-cooler photos (name made up: "FRESHWAY
// MARKET"). Local axes: storefront faces +z, footprint x -9..9, z -6..6.
// Inside: glass-door milk coolers along the back (gallon jugs + cartons, lit),
// an open egg/butter case with a green canopy and the blue wave wall band,
// two aisles of shelving, a checkout, and a walk-in cooler (insulated white
// panels, evaporator fans, stacked blue + black milk crates, green U-boat
// carts with boxes) behind a strip curtain. Automatic sliding front doors.
import * as THREE from 'three';
import { makeStockroom } from './stockroom.js';

const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.6, ...o });
const glow = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });
function canvasTex(w, h, draw, rep = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...rep);
  t.anisotropy = 8;
  return t;
}
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
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const _L = new THREE.TextureLoader();
function ptex(name, rx = 1, ry = 1) {
  const t = _L.load(`assets/textures/${name}`);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8;
  return t;
}

// ---------------------------------------------------------------- shared props
const M = {};
function mats() {
  if (M.wall) return M;
  M.wall = std({ color: '#ecebe6', roughness: 0.8, side: THREE.DoubleSide });
  M.panel = std({ map: canvasTex(256, 256, (x, w, h) => {         // insulated cooler panels
    x.fillStyle = '#e9ebe9'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 64) { x.fillStyle = '#c9ccca'; x.fillRect(i, 0, 2, h); }
    for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(140,140,130,${Math.random() * 0.05})`; x.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
  }), roughness: 0.5, side: THREE.DoubleSide });
  M.floor = std({ map: canvasTex(256, 256, (x, w, h) => {         // speckled vinyl tile (0.3 m)
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      x.fillStyle = (i + j) % 2 ? '#d9d7cf' : '#e8e6de'; x.fillRect(i * 128, j * 128, 128, 128);
    }
    for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '120,115,105' : '250,250,245'},0.35)`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    x.strokeStyle = '#bdbab1'; x.lineWidth = 2; x.strokeRect(0, 0, 128, 128); x.strokeRect(128, 128, 128, 128);
  }), roughness: 0.35 });
  M.ceiling = std({ color: '#f1f0ec', roughness: 1, emissive: '#2a2a28', side: THREE.DoubleSide });
  M.light = glow(1.7, 1.75, 1.8);
  M.steel = std({ color: '#c3c6c9', metalness: 0.5, roughness: 0.35 });
  M.dark = std({ color: '#1f2124', roughness: 0.5 });
  M.green = std({ color: '#1f6b4a', roughness: 0.45, metalness: 0.2 });   // U-boat carts + egg-case canopy
  M.cardboard = std({ color: '#b9935f', roughness: 0.9 });
  M.glass = new THREE.MeshPhysicalMaterial({ color: '#cfe2e6', roughness: 0.05, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false });
  M.jug = std({ color: '#f4f4ef', roughness: 0.35, emissive: '#2a2a28' });
  // crate faces cut straight from the walk-in photo (jugs visible through the lattice)
  M.crateBlue = std({ map: ptex('store_crate_blue.png'), roughness: 0.55 });
  M.crateBlack = std({ map: ptex('store_crate_black.png'), roughness: 0.55 });
  M.crateTopBlue = std({ map: crateTop('#3466d0'), roughness: 0.55 });
  M.crateTopBlack = std({ map: crateTop('#1c1d20'), roughness: 0.55 });
  M.cardboard = std({ map: ptex('store_cardboard.png'), roughness: 0.9 });
  M.wpanel = std({ map: ptex('store_panel.png', 4, 2), roughness: 0.5, side: THREE.DoubleSide, emissive: '#1c1d1e' });
  M.wfloor = std({ map: ptex('store_floor.png', 6, 4), roughness: 0.85 });
  M.curb = std({ color: '#2f5fae', map: ptex('store_floor.png', 4, 0.3), roughness: 0.75 });   // blue-painted curb, scuffed
  M.wave = std({ map: ptex('store_swirl.png', 1, 1), roughness: 0.6 });
  M.waveOld = std({ map: canvasTex(1024, 128, (x, w, h) => {          // the blue swirl band over the dairy case
    x.fillStyle = '#5f8fc9'; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(235,242,250,0.85)'; x.lineWidth = 5;
    for (let k = 0; k < 4; k++) {
      x.beginPath();
      for (let i = 0; i <= w; i += 8) x.lineTo(i, 20 + k * 28 + Math.sin(i / 60 + k) * 12);
      x.stroke();
    }
    for (let i = 0; i < 18; i++) { const cx = i * 60 + 20; x.beginPath(); x.arc(cx, 60 + Math.sin(i) * 20, 14, 0, Math.PI * 1.6); x.stroke(); }
  }, [3, 1]), roughness: 0.6 });
  return M;
}
function crateTop(col) {     // looking down into a crate full of jugs: white caps in a grid
  return canvasTex(128, 128, (x, w, h) => {
    x.fillStyle = col; x.fillRect(0, 0, w, h);
    x.fillStyle = '#e9e8e2'; x.fillRect(8, 8, w - 16, h - 16);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      x.fillStyle = '#d5d4cd'; x.fillRect(12 + i * 56, 12 + j * 56, 48, 48);
      x.fillStyle = ['#d42a2a', '#2f5fd0'][(i + j) % 2]; x.beginPath(); x.arc(36 + i * 56, 36 + j * 56, 9, 0, 7); x.fill();
    }
  });
}
function crateTex(col) {
  return canvasTex(128, 128, (x, w, h) => {
    x.fillStyle = col; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      x.beginPath(); x.roundRect(10 + i * 28, 14 + j * 26, 20, 17, 5); x.fill();
    }
    x.globalCompositeOperation = 'source-over';
    x.fillStyle = 'rgba(255,255,255,0.15)'; x.fillRect(0, 0, w, 6);
  });
}

// gallon jug (lathe) + half-gallon carton
let jugGeo, cartonGeo;
function jugGeometry() {
  if (jugGeo) return jugGeo;
  // rounded-square gallon jug: lathe with 16 segments pushed toward a square, plus a hollow handle bulge
  const pts = [[0, 0], [0.07, 0], [0.078, 0.012], [0.078, 0.17], [0.07, 0.2], [0.045, 0.235], [0.02, 0.25], [0.02, 0.268], [0, 0.268]].map(([a, b]) => new THREE.Vector2(a, b));
  const g = new THREE.LatheGeometry(pts, 24);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
    if (r < 1e-5) continue;
    const a = Math.atan2(z, x);
    const sq = 1 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));     // square-ify
    const k = 1 + (Math.min(sq, 1.25) - 1) * 0.85;
    let nx = x * k, nz = z * k;
    const y = p.getY(i);
    if (x < -0.04 && z > 0.02 && y > 0.12 && y < 0.24) nx -= 0.012;             // handle side bulge
    p.setXYZ(i, nx * 0.95, y, nz * 0.95);
  }
  g.computeVertexNormals();
  jugGeo = g;
  return jugGeo;
}
// made-up label wrapped on the front of each jug
const jugLabels = {};
function jugLabel(capCol) {
  if (jugLabels[capCol]) return jugLabels[capCol];
  jugLabels[capCol] = new THREE.MeshStandardMaterial({ roughness: 0.5, map: canvasTex(128, 96, (x, w, h) => {
    x.fillStyle = '#fbfaf5'; x.fillRect(0, 0, w, h);
    x.fillStyle = capCol; x.fillRect(0, h * 0.62, w, h * 0.38);
    x.fillStyle = '#1d4a2a'; x.font = 'bold 20px Georgia'; x.textAlign = 'center'; x.fillText('MEADOW', w / 2, 30); x.fillText('DAIRY', w / 2, 52);
    x.fillStyle = '#fff'; x.font = 'bold 18px Arial'; x.fillText('MILK', w / 2, 86);
  }) });
  return jugLabels[capCol];
}

// ---------------------------------------------------------------- glass-door milk cooler bay (1 m wide), faces +z
function coolerDoor(capCol, kind, seed) {
  const m = mats();
  const g = new THREE.Group();
  // hollow cabinet: sides, top, bottom (front is the glass door)
  for (const sx of [-1, 1]) g.add(box(0.03, 2.1, 0.75, m.dark, sx * 0.485, 1.05, -0.375));
  g.add(box(1.0, 0.05, 0.75, m.dark, 0, 2.08, -0.375));
  g.add(box(1.0, 0.08, 0.75, m.dark, 0, 0.04, -0.375));
  const back = plane(0.92, 1.85, glow(1.25, 1.27, 1.28), 0, 1.1, -0.73); // lit white back panel
  g.add(back);
  const r = rng(seed);
  const jug = new THREE.InstancedMesh(jugGeometry(), m.jug, 30);
  const cap = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 10), std({ color: capCol }), 30);
  const m4 = new THREE.Matrix4();
  let n = 0;
  for (let shelf = 0; shelf < 5; shelf++) {
    const y = 0.18 + shelf * 0.38;
    g.add(box(0.92, 0.02, 0.6, m.steel, 0, y, -0.4));
    g.add(box(0.92, 0.04, 0.01, std({ color: '#f2f2f0' }), 0, y - 0.01, -0.095));   // price-strip
    if (shelf >= 3 && kind === 'carton') {
      for (let i = 0; i < 5; i++) {
        const c = box(0.09, 0.2, 0.09, std({ color: ['#e8e3d6', '#cfe0f2', '#f2d8d0'][Math.floor(r() * 3)] }), -0.36 + i * 0.18, y + 0.11, -0.3);
        g.add(c);
      }
      continue;
    }
    for (let i = 0; i < 6 && n < 30; i++) {
      const x = -0.38 + i * 0.152;
      m4.makeTranslation(x, y + 0.01, -0.3 - r() * 0.05);
      jug.setMatrixAt(n, m4);
      m4.makeTranslation(x, y + 0.285, -0.3);
      cap.setMatrixAt(n, m4);
      n++;
    }
  }
  jug.count = cap.count = n;
  g.add(jug, cap);
  // labels (front of each jug) + yellow price tags on the shelf strips
  const lab = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.11, 0.085), jugLabel(capCol), 30);
  const q = new THREE.Matrix4(), tmp = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    jug.getMatrixAt(i, q); tmp.setFromMatrixPosition(q);
    q.makeTranslation(tmp.x, tmp.y + 0.11, tmp.z + 0.075);
    lab.setMatrixAt(i, q);
  }
  lab.count = n;
  g.add(lab);
  const tag = new THREE.MeshBasicMaterial({ map: canvasTex(96, 48, (x, w, h) => { x.fillStyle = '#f6d43a'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; x.font = 'bold 26px Arial'; x.fillText(['3.49', '2.99', '4.19'][seed % 3], 10, 34); }) });
  for (let shelf = 0; shelf < 5; shelf++) {
    const t2 = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.04), tag);
    t2.position.set(-0.3 + (shelf % 2) * 0.35, 0.17 + shelf * 0.38, -0.088);
    g.add(t2);
  }
  // door: steel frame + glass + handle
  g.add(box(1.0, 0.06, 0.06, m.steel, 0, 2.1, 0));
  g.add(box(1.0, 0.06, 0.06, m.steel, 0, 0.06, 0));
  for (const s of [-1, 1]) g.add(box(0.05, 2.1, 0.06, m.steel, s * 0.475, 1.05, 0));
  g.add(plane(0.9, 1.98, m.glass, 0, 1.08, 0.01));
  g.add(box(0.03, 0.9, 0.05, m.steel, 0.4, 1.2, 0.06));
  return g;
}

// ---------------------------------------------------------------- open egg / butter case, faces +z
function eggCase(len) {
  const m = mats();
  const g = new THREE.Group();
  g.add(box(len, 0.3, 0.9, m.green, 0, 0.15, 0));
  g.add(box(len, 0.05, 0.9, m.steel, 0, 0.32, 0));
  g.add(box(len, 1.3, 0.12, std({ color: '#d8dbd6', emissive: '#55585a' }), 0, 1.5, -0.4));   // lit white back like the photo
  const r = rng(9);
  const egg = std({ color: '#f1ece0', roughness: 0.8 });
  const butter = ['#f3d34a', '#e85b3a', '#3a6fc4', '#f1efe6'];
  // bottom of the case: stacks of egg flats, front faces cut square-on from the photo
  const eggFront = std({ map: ptex('store_eggs.png'), roughness: 0.75, emissive: '#2a2620', emissiveMap: ptex('store_eggs.png') });
  const eggTop = std({ color: '#cdb994', roughness: 0.8 });
  for (let x = -len / 2 + 0.4; x < len / 2 - 0.3; x += 0.72) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.34, 0.3), [eggTop, eggTop, eggTop, eggTop, eggFront, eggTop]);
    st.position.set(x + (r() - 0.5) * 0.05, 0.345 + 0.17, -0.05);
    g.add(st);
  }
  for (let shelf = 0; shelf < 3; shelf++) {
    const y = 0.88 + shelf * 0.38;
    g.add(box(len, 0.02, 0.5 - shelf * 0.06, m.steel, 0, y, -0.12 - shelf * 0.03));
    for (let x = -len / 2 + 0.15; x < len / 2 - 0.1; x += 0.32) {
      if (shelf < 2) {
        g.add(box(0.3, 0.07, 0.12, egg, x, y + 0.045, -0.05 - shelf * 0.03));      // egg cartons (stack of 2)
        g.add(box(0.3, 0.07, 0.12, egg, x, y + 0.115, -0.05 - shelf * 0.03));
      } else {
        g.add(box(0.14, 0.07, 0.1, std({ color: butter[Math.floor(r() * 4)] }), x, y + 0.045, -0.12));
        g.add(box(0.14, 0.07, 0.1, std({ color: butter[Math.floor(r() * 4)] }), x + 0.15, y + 0.045, -0.12));
      }
    }
  }
  // green canopy with lights + the wave band above
  const can = box(len, 0.08, 0.6, m.green, 0, 2.2, -0.12);
  can.rotation.x = 0.12;
  g.add(can);
  g.add(box(len - 0.2, 0.02, 0.08, m.light, 0, 2.15, 0.08));
  g.add(plane(len, 0.6, m.wave, 0, 2.7, -0.39));
  return g;
}

// ---------------------------------------------------------------- shelving gondola (double-sided), long axis x
function gondola(len, seed) {
  const m = mats();
  const g = new THREE.Group();
  g.add(box(len, 1.7, 0.1, std({ color: '#e7e6e1' }), 0, 0.85, 0));
  const r = rng(seed);
  const cols = ['#c94a3a', '#3f7fb5', '#e8b84a', '#5aa36a', '#9b5fb0', '#f0ede4', '#e9862b', '#2d3b8c'];
  for (const s of [-1, 1]) {
    for (let shelf = 0; shelf < 4; shelf++) {
      const y = 0.15 + shelf * 0.42;
      g.add(box(len, 0.03, 0.42, std({ color: '#d9d8d2' }), 0, y, s * 0.26));
      let x = -len / 2 + 0.06;
      while (x < len / 2 - 0.15) {
        const w = 0.1 + r() * 0.14, h = 0.12 + r() * 0.2;
        const c = cols[Math.floor(r() * cols.length)];
        for (let k = 0; k < 2; k++) g.add(box(w, h, 0.16, std({ color: c, roughness: 0.5 }), x + w / 2, y + 0.015 + h / 2, s * (0.14 + k * 0.17)));
        x += w + 0.02;
      }
    }
    g.add(box(len, 0.06, 0.02, std({ color: '#fbfbf8' }), 0, 0.12, s * 0.475));   // price strip
  }
  return g;
}

// ---------------------------------------------------------------- U-boat cart (green), long axis z
function uboat(seed) {
  const m = mats();
  const g = new THREE.Group();
  g.add(box(0.42, 0.04, 1.2, m.green, 0, 0.2, 0));
  for (const z of [-0.6, 0.6]) {
    const path = new THREE.CurvePath();
    path.add(new THREE.LineCurve3(new THREE.Vector3(-0.2, 0.2, z), new THREE.Vector3(-0.2, 1.3, z)));
    path.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.2, 1.3, z), new THREE.Vector3(0, 1.45, z), new THREE.Vector3(0.2, 1.3, z)));
    path.add(new THREE.LineCurve3(new THREE.Vector3(0.2, 1.3, z), new THREE.Vector3(0.2, 0.2, z)));
    const t = new THREE.Mesh(new THREE.TubeGeometry(path, 24, 0.02, 6, false), m.green);
    t.castShadow = true;
    g.add(t);
  }
  for (const [x, z] of [[-0.18, -0.5], [0.18, -0.5], [-0.18, 0.5], [0.18, 0.5]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 12), m.dark);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.08, z);
    g.add(w);
  }
  const r = rng(seed);
  let y = 0.22;
  for (let k = 0; k < 4; k++) {
    const h = 0.18 + r() * 0.2;
    g.add(box(0.38, h, 0.5, mats().cardboard, 0, y + h / 2, -0.25 + (r() - 0.5) * 0.05));
    g.add(box(0.38, h * 0.9, 0.45, m.cardboard, 0, y + h * 0.45, 0.28));
    y += h;
  }
  return g;
}

// crate stack: n crates high
function crateStack(n, black, x, z, ry = 0) {
  const m = mats();
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(0.33, 0.28, 0.33);
  for (let i = 0; i < n; i++) {
    const blk = black ? i % 3 !== 1 : i % 4 === 3;
    const face = blk ? m.crateBlack : m.crateBlue, top = blk ? m.crateTopBlack : m.crateTopBlue;
    const c = new THREE.Mesh(geo, [face, face, top, face, face, face]);
    c.position.set(0, 0.14 + i * 0.285, 0);
    c.rotation.y = (i % 2) * 0.03;
    g.add(c);
  }
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  return g;
}

// ---------------------------------------------------------------- the store
export function makeGrocery() {
  const m = mats();
  const g = new THREE.Group();
  g.name = 'grocery_store';
  const W = 18, D = 12, H = 4.2, x0 = -9, x1 = 9, zb = -6, zf = 6;
  const colliders = [];
  const solid = (a, b, c, d) => colliders.push([a, b, c, d]);

  // floor, ceiling + light panels
  g.add(plane(W, D, m.floor, 0, 0.01, 0, 0, -Math.PI / 2));
  m.floor.map.repeat.set(W / 0.6, D / 0.6);
  g.add(plane(W, D, m.ceiling, 0, 3.4, 0, 0, Math.PI / 2));
  for (let x = -6; x <= 6; x += 3) for (const z of [-2.5, 1.5]) g.add(box(1.2, 0.03, 0.6, m.light, x, 3.38, z));
  for (const [x, z] of [[-3, -1], [4, 0]]) { const l = new THREE.PointLight('#f2f6ff', 4, 12, 1.6); l.position.set(x, 3.1, z); g.add(l); }

  // exterior shell: back + sides solid; front glass storefront with a sign band
  const brick = std({ color: '#b9b2a6', roughness: 0.9, side: THREE.DoubleSide });
  // back wall with the stockroom doorway at x 5.3..7.1
  g.add(plane(5.3 - x0, H, brick, (x0 + 5.3) / 2, H / 2, zb, 0));
  g.add(plane(x1 - 7.1, H, brick, (7.1 + x1) / 2, H / 2, zb, 0));
  g.add(plane(1.8, H - 2.4, brick, 6.2, 2.4 + (H - 2.4) / 2, zb, 0));
  for (const s of [-1, 1]) g.add(plane(D, H, brick, s * W / 2, H / 2, 0, s * Math.PI / 2));
  solid(x0, 5.3, zb - 0.2, zb + 0.1); solid(7.1, x1, zb - 0.2, zb + 0.1); solid(x0 - 0.2, x0 + 0.1, zb, zf); solid(x1 - 0.1, x1 + 0.2, zb, zf);
  const roof = plane(W, D, std({ color: '#2f3033' }), 0, H, 0, 0, -Math.PI / 2);
  g.add(roof);
  // storefront: mullions + glass, opening for doors in the middle
  const DW = 2.4;
  g.add(box(W, 0.6, 0.3, std({ color: '#2a5d3d', roughness: 0.5 }), 0, 3.7, zf));   // green sign band
  const sign = canvasTex(1024, 128, (x, w, h) => {
    x.fillStyle = '#2a5d3d'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#f6f2e4'; x.font = 'bold 88px Arial'; x.textAlign = 'center'; x.fillText('FRESHWAY MARKET', w / 2, 96);
  });
  g.add(plane(10, 1.25, glow(1, 1, 1), 0, 3.7, zf + 0.16));
  g.children[g.children.length - 1].material = new THREE.MeshBasicMaterial({ map: sign, color: new THREE.Color(1.3, 1.3, 1.3), toneMapped: false });
  g.add(box(W, 0.3, 0.3, m.dark, 0, 3.25, zf));
  for (let x = x0; x <= x1 + 0.01; x += 2) if (Math.abs(x) > DW / 2) g.add(box(0.1, 3.4, 0.12, m.dark, x, 1.7, zf));
  g.add(plane(x1 - DW / 2, 3.2, m.glass, (x1 + DW / 2) / 2, 1.6, zf));
  g.add(plane(x1 - DW / 2, 3.2, m.glass, (x0 - DW / 2) / 2, 1.6, zf));
  g.add(box(W, 0.35, 0.15, m.dark, 0, 0.175, zf));
  solid(x0, -DW / 2, zf - 0.15, zf + 0.15); solid(DW / 2, x1, zf - 0.15, zf + 0.15);
  // sliding doors
  const doors = [];
  for (const s of [-1, 1]) {
    const d = new THREE.Group();
    for (const [w, h, x, y] of [[DW / 2, 0.08, 0, 2.36], [DW / 2, 0.12, 0, 0.06], [0.06, 2.4, -DW / 4 + 0.03, 1.2], [0.06, 2.4, DW / 4 - 0.03, 1.2]]) d.add(box(w, h, 0.05, m.dark, x, y, 0));
    d.add(plane(DW / 2 - 0.1, 2.2, m.glass, 0, 1.22, 0.0));
    d.position.set(s * DW / 4, 0, zf - 0.12);
    d.userData.s = s;
    g.add(d);
    doors.push(d);
  }
  g.add(box(DW + 0.2, 0.25, 0.25, m.dark, 0, 2.55, zf - 0.12));
  const doorCol = [-DW / 2, DW / 2, zf - 0.2, zf];
  colliders.push(doorCol);

  // milk cooler wall along the back (right part), 6 doors
  const caps = ['#d42a2a', '#2f5fd0', '#7fb4f0', '#e88fb0', '#d42a2a', '#f2c230'];
  for (let i = 0; i < 6; i++) {
    const d = coolerDoor(caps[i], i % 2 ? 'carton' : 'jug', i + 3);
    d.position.set(-1.5 + i * 1.02, 0, zb + 0.78);
    g.add(d);
  }
  solid(-2.1, 4.7, zb, zb + 0.8);
  // egg / butter case along the right wall
  const ec = eggCase(7);
  ec.position.set(x1 - 0.5, 0, 0.5);
  ec.rotation.y = -Math.PI / 2;
  g.add(ec);
  solid(x1 - 1.0, x1, -3, 4);
  // aisles
  for (const [z, seed] of [[-0.6, 2], [2.2, 5]]) {
    const gd = gondola(6, seed);
    gd.position.set(1.5, 0, z);
    g.add(gd);
    solid(-1.5, 4.5, z - 0.5, z + 0.5);
  }
  // checkout near the front left
  const chk = new THREE.Group();
  chk.add(box(2.2, 0.9, 0.8, std({ color: '#3b3d40' }), 0, 0.45, 0));
  chk.add(box(2.2, 0.04, 0.82, std({ color: '#d8d6cf' }), 0, 0.92, 0));
  chk.add(box(1.2, 0.02, 0.55, std({ color: '#151515' }), -0.3, 0.95, 0));           // belt
  chk.add(box(0.4, 0.3, 0.06, m.dark, 0.7, 1.25, -0.1));                             // screen
  chk.add(plane(0.36, 0.25, glow(0.4, 0.9, 0.6), 0.7, 1.25, -0.065));
  chk.position.set(-5.5, 0, 3.6);
  g.add(chk);
  solid(-6.6, -4.4, 3.2, 4.0);

  // walk-in cooler: back-left room x -9..-3, z -6..-1.4, strip curtain doorway
  const wx0 = x0, wx1 = -2.6, wz1 = -1.4;
  g.add(plane(wx1 - wx0, 3.4, m.panel, (wx0 + wx1) / 2, 1.7, wz1, 0));          // front wall (with doorway gap below)
  g.children[g.children.length - 1].visible = false;
  const front = (a, b) => g.add(plane(b - a, 3.4, m.wpanel, (a + b) / 2, 1.7, wz1, 0));
  front(wx0, -5.4); front(-4.1, wx1);
  g.add(plane(1.3, 1.0, m.wpanel, -4.75, 2.9, wz1, 0));
  g.add(plane(Math.abs(wz1 - zb), 3.4, m.wpanel, wx1, 1.7, (zb + wz1) / 2, -Math.PI / 2));
  g.add(plane(wx1 - wx0, Math.abs(wz1 - zb), m.wpanel, (wx0 + wx1) / 2, 3.39, (zb + wz1) / 2, 0, Math.PI / 2));
  // inside faces of the outer walls + worn concrete floor + blue-painted curb along the walls (photo)
  g.add(plane(wx1 - wx0, 3.4, m.wpanel, (wx0 + wx1) / 2, 1.7, zb + 0.02, 0));
  g.add(plane(Math.abs(wz1 - zb), 3.4, m.wpanel, wx0 + 0.02, 1.7, (zb + wz1) / 2, Math.PI / 2));
  g.add(plane(wx1 - wx0, Math.abs(wz1 - zb), m.wfloor, (wx0 + wx1) / 2, 0.015, (zb + wz1) / 2, 0, -Math.PI / 2));
  const curbN = box(Math.abs(wz1 - zb), 0.18, 0.25, m.curb, wx1 - 0.13, 0.09, (zb + wz1) / 2);
  curbN.rotation.y = Math.PI / 2;
  g.add(curbN);
  // white wire shelving with green tag strips along the inner wall (carts photo), stocked with small cartons
  for (let k = 0; k < 2; k++) {
    const sh = new THREE.Group();
    const white = std({ color: '#f2f3f0', roughness: 0.4 });
    for (const sx of [-0.55, 0.55]) for (const sz of [-0.22, 0.22]) sh.add(box(0.03, 2.0, 0.03, white, sx, 1.0, sz));
    for (let lv = 0; lv < 5; lv++) {
      const y = 0.25 + lv * 0.42;
      sh.add(box(1.14, 0.02, 0.46, white, 0, y, 0));
      sh.add(box(1.14, 0.05, 0.01, std({ color: '#6cc04a' }), 0, y - 0.02, 0.235));
      for (let i = 0; i < 6; i++) sh.add(box(0.13, 0.22, 0.13, std({ color: ['#dbe8f5', '#5b8fd6', '#f2f2ef', '#a9c9ec'][(i + lv + k) % 4] }), -0.45 + i * 0.18, y + 0.12, 0.05));
    }
    sh.position.set(wx1 - 0.35, 0, -5.0 + k * 1.25);
    sh.rotation.y = -Math.PI / 2;
    g.add(sh);
  }
  for (const [a, b] of [[wx0, -5.4], [-4.1, wx1]]) solid(a, b, wz1 - 0.1, wz1 + 0.1);
  solid(wx1 - 0.1, wx1 + 0.1, zb, wz1);
  // strip curtain
  const strip = new THREE.MeshPhysicalMaterial({ color: '#dfeef2', roughness: 0.2, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
  for (let i = 0; i < 6; i++) g.add(plane(0.22, 2.35, strip, -5.3 + i * 0.21, 1.2, wz1 + 0.02 * (i % 2)));
  // inside: cold light, evaporator fan unit, crates, U-boats
  g.add(box(1.4, 0.03, 0.5, m.light, -6, 3.37, -3.6));
  const cl = new THREE.PointLight('#dfeeff', 3, 8, 1.6); cl.position.set(-6, 3.0, -3.6); g.add(cl);
  const evap = box(1.8, 0.55, 0.6, std({ color: '#f0f1ef' }), -6, 3.0, zb + 0.35);
  g.add(evap);
  for (let i = 0; i < 3; i++) {
    const f = new THREE.Mesh(new THREE.CircleGeometry(0.2, 20), std({ color: '#2b5fb8' }));
    f.position.set(-6.55 + i * 0.55, 3.0, zb + 0.66);
    g.add(f);
  }
  for (const [x, z, n, blk] of [[-8.6, -5.6, 6, false], [-8.2, -5.6, 6, true], [-7.8, -5.6, 5, false], [-8.6, -5.2, 6, false], [-8.2, -5.2, 4, true], [-7.4, -5.6, 6, false], [-7.0, -5.6, 3, false], [-8.6, -4.8, 5, true], [-8.6, -4.4, 6, false]]) {
    g.add(crateStack(n, blk, x, z));
  }
  solid(-8.8, -6.8, -5.8, -4.2);
  for (const [x, z, s] of [[-5.6, -4.2, 4], [-4.6, -4.3, 7]]) {
    const u = uboat(s);
    u.position.set(x, 0, z);
    // clipboard sheet hanging on the cart end (photo: order sheets on every cart)
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.42), std({ map: canvasTex(128, 180, (c, w, h) => {
      c.fillStyle = '#f7f6f1'; c.fillRect(0, 0, w, h); c.fillStyle = '#222'; c.font = 'bold 16px Arial'; c.fillText('DAIRY:', 10, 24);
      c.strokeStyle = '#9aa'; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(10, 44 + i * 16); c.lineTo(w - 10, 44 + i * 16); c.stroke(); }
    }), side: THREE.DoubleSide }));
    sheet.position.set(0, 0.95, 0.63);
    u.add(sheet);
    g.add(u);
    solid(x - 0.25, x + 0.25, z - 0.65, z + 0.65);
  }

  // back stockroom (warehouse pallet photos)
  const stock = makeStockroom();
  g.add(stock);
  colliders.push(...stock.userData.colliders);
  g.userData.colliders = colliders;
  g.userData.doorCol = doorCol;
  g.userData.update = (dt, near) => {
    for (const d of doors) {
      const target = near ? d.userData.s * (DW / 4 + DW / 2 - 0.05) : d.userData.s * DW / 4;
      d.position.x += (target - d.position.x) * Math.min(1, dt * 5);
    }
  };
  g.userData.doorsOpen = () => Math.abs(doors[1].position.x) > DW / 2;
  return g;
}
