// Food models from the food photos. Round dishes use the photographed top
// as a disc texture on a shallow mound inside the dish. Units: metres.
import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = new Map();
function tex(name) {
  if (cache.has(name)) return cache.get(name);
  const t = loader.load(`assets/textures/${name}.png`);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(name, t);
  return t;
}
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.6, ...o });
const white = std({ color: '#f4f3ef', roughness: 0.25 });
const black = std({ color: '#151515', roughness: 0.3 });

// a disc of food (photo top) bulging slightly upward
function foodTop(name, r, bulge = 0.01, roughness = 0.55) {
  const g = new THREE.CircleGeometry(r, 48, 0, Math.PI * 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const d = Math.hypot(p.getX(i), p.getY(i)) / r;
    p.setZ(i, bulge * (1 - d * d));
  }
  g.computeVertexNormals();
  g.rotateX(-Math.PI / 2);
  return new THREE.Mesh(g, std({ map: tex(name), transparent: true, alphaTest: 0.3, roughness }));
}

// plate: a lathe profile (flat centre, raised lip)
function plate(r, mat = white, deep = 0.018) {
  const pts = [[0, 0.004], [r * 0.62, 0.004], [r * 0.8, deep * 0.6], [r, deep], [r * 1.0, deep + 0.004], [r * 0.97, deep + 0.004], [r * 0.78, deep * 0.6 + 0.004], [r * 0.6, 0.008], [0, 0.008]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}
function bowl(r, h, mat) {
  const pts = [];
  for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(new THREE.Vector2(r * (0.45 + 0.55 * Math.sin(t * Math.PI / 2)), h * t)); }
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), std({ ...mat, side: THREE.DoubleSide }));
  m.castShadow = true;
  return m;
}
function tray(w, d) {
  const g = new THREE.Group();
  const m = std({ color: '#1d1e20', roughness: 0.5 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.01, d), m);
  base.position.y = 0.005;
  g.add(base);
  for (const [x, z, sx, sz] of [[0, d / 2, w, 0.015], [0, -d / 2, w, 0.015], [w / 2, 0, 0.015, d], [-w / 2, 0, 0.015, d]]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.025, sz), m);
    e.position.set(x, 0.0125, z);
    g.add(e);
  }
  return g;
}

export function makePizza(kind = 'mushroom') {
  const g = new THREE.Group();
  g.name = `pizza_${kind}`;
  const r = 0.16;
  const crustCol = kind === 'mushroom' ? '#c98a4f' : '#e2b268';
  const crust = new THREE.Mesh(new THREE.TorusGeometry(r - 0.012, 0.014, 10, 48), std({ color: crustCol, roughness: 0.8 }));
  crust.rotation.x = Math.PI / 2;
  crust.position.y = 0.014;
  crust.scale.z = 0.7;
  g.add(crust);
  const top = foodTop(kind === 'mushroom' ? 'food_pizza_mushroom' : 'food_pizza_corn', r - 0.004, 0.004);
  top.position.y = 0.012;
  g.add(top);
  if (kind === 'mushroom') {
    // wooden peel board underneath
    const board = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.03, r + 0.03, 0.012, 40), std({ color: '#8a6a45', roughness: 0.7 }));
    board.position.y = 0.006;
    g.add(board);
    g.children.forEach((c) => { if (c !== board) c.position.y += 0.012; });
  } else {
    // black takeout tray with a clear lid edge
    const t = bowl(r + 0.01, 0.025, { color: '#111', roughness: 0.4 });
    g.add(t);
  }
  return g;
}

export function makeRamenTray() {
  const g = tray(0.42, 0.32);
  g.name = 'ramen_tray';
  const b = bowl(0.11, 0.075, { color: '#141414', roughness: 0.25 });
  b.position.set(-0.07, 0.01, 0);
  g.add(b);
  const top = foodTop('food_ramen_top', 0.096, 0.003, 0.2);
  top.position.set(-0.07, 0.072, 0);
  g.add(top);
  // aluminium cup of water + chopsticks
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.034, 0.13, 24), std({ color: '#c8cbcd', metalness: 0.3, roughness: 0.35 }));
  cup.position.set(0.12, 0.075, -0.05);
  g.add(cup);
  for (const dz of [-0.008, 0.008]) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.006, 0.23), black);
    c.position.set(0.06, 0.014, 0.03 + dz);
    g.add(c);
  }
  return g;
}

export function makeSpaghettiTray() {
  const g = tray(0.46, 0.34);
  g.name = 'spaghetti_tray';
  const p = plate(0.14);
  p.scale.set(1.15, 1, 0.9);   // oval plate
  p.position.set(-0.03, 0.01, 0);
  g.add(p);
  const top = foodTop('food_spaghetti', 0.09, 0.025);
  top.scale.set(1.15, 1, 0.9);
  top.position.set(-0.03, 0.02, 0);
  g.add(top);
  const steel = std({ color: '#d0d3d6', metalness: 0.3, roughness: 0.3 });
  for (const dx of [0.17, 0.195]) {
    const u = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.004, 0.19), steel);
    u.position.set(dx, 0.014, 0);
    g.add(u);
  }
  return g;
}

export function makeCurryPlate() {
  const g = new THREE.Group();
  g.name = 'curry_rice';
  g.add(plate(0.15));
  const top = foodTop('food_curry_rice', 0.115, 0.025);
  top.position.y = 0.01;
  g.add(top);
  return g;
}

// Korean-style corn dog in a white paper boat (corndog photo): a thick log
// coated in coarse golden crumbs, a skewer out of the top, a short exposed
// sausage end, and a puddle of pink sauce beside it in the boat.
export function makeCornDog() {
  const g = new THREE.Group();
  g.name = 'corn_dog';
  // paper boat: flat base + four outward-sloping walls (a real trapezoid boat)
  const paper = std({ color: '#f6f5f0', roughness: 0.85, side: THREE.DoubleSide });
  const L = 0.2, W = 0.1, Hb = 0.035, flare = 0.02;
  const boat = new THREE.Group();
  const base = new THREE.Mesh(new THREE.PlaneGeometry(W, L), paper);
  base.rotation.x = -Math.PI / 2;
  base.position.y = 0.002;
  boat.add(base);
  const wall = (x0, z0, x1, z1, ox, oz) => {
    const geo = new THREE.BufferGeometry();
    const v = [x0, 0.002, z0, x1, 0.002, z1, x1 + ox, Hb, z1 + oz, x0 + ox, Hb, z0 + oz];
    geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    geo.computeVertexNormals();
    boat.add(new THREE.Mesh(geo, paper));
  };
  wall(-W / 2, -L / 2, -W / 2, L / 2, -flare, 0);
  wall(W / 2, -L / 2, W / 2, L / 2, flare, 0);
  wall(-W / 2, -L / 2, W / 2, -L / 2, 0, -flare);
  wall(-W / 2, L / 2, W / 2, L / 2, 0, flare);
  g.add(boat);
  // the corn dog: lumpy capsule, crumb texture tiled around it, crumb bump map
  const crumb = loader.load('assets/textures/food_crumb.png');
  crumb.colorSpace = THREE.SRGBColorSpace;
  crumb.wrapS = crumb.wrapT = THREE.RepeatWrapping;
  crumb.repeat.set(4, 5);   // ~3.7 cm of crumb per tile, like the photo
  const crumbN = loader.load('assets/textures/food_crumb_normal.png');
  crumbN.wrapS = crumbN.wrapT = THREE.RepeatWrapping;
  crumbN.repeat.set(4, 5);
  let geo = new THREE.CapsuleGeometry(0.026, 0.14, 24, 48);
  geo.deleteAttribute('normal');
  const uvKeep = geo.attributes.uv;
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {   // coarse crumbs: random push per vertex + gentle waviness
    v.fromBufferAttribute(p, i);
    const r = Math.hypot(v.x, v.z) || 1;
    const h = Math.sin(v.x * 900 + v.y * 1300) * Math.sin(v.z * 1100 - v.y * 700);
    const k = 1 + 0.055 * h * h * Math.sign(h) + 0.05 * Math.sin(v.y * 60);
    p.setXYZ(i, v.x * k, v.y, v.z * k);
  }
  geo.computeVertexNormals();
  const dog = new THREE.Mesh(geo, std({ map: crumb, normalMap: crumbN, normalScale: new THREE.Vector2(2.5, 2.5), roughness: 0.95, color: '#ffd9a0' }));
  dog.rotation.x = Math.PI / 2 - 0.12;  // resting on the boat floor, top end on the rim
  dog.rotation.z = 0.12;
  dog.position.set(0.012, 0.03, 0.0);
  dog.castShadow = true;
  g.add(dog);
  // sausage end peeking out at the bottom of the dog
  const end = new THREE.Mesh(new THREE.CircleGeometry(0.014, 16), std({ color: '#9b3a2c', roughness: 0.5 }));
  end.position.set(0.021, 0.02, 0.098);
  end.rotation.x = -0.12;
  g.add(end);
  // skewer out the top end, over the boat edge
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.17, 6), std({ color: '#d8c193' }));
  stick.rotation.x = Math.PI / 2 - 0.15;
  stick.rotation.z = 0.12;
  stick.position.set(0.001, 0.05, -0.165);
  g.add(stick);
  // pink sauce puddle (photo texture), slightly raised
  const dipGeo = new THREE.CircleGeometry(0.028, 24);
  dipGeo.scale(1, 1.5, 1);
  const dip = new THREE.Mesh(dipGeo, std({ map: tex('food_dip_sauce'), roughness: 0.15 }));
  dip.rotation.x = -Math.PI / 2;
  dip.position.set(-0.026, 0.006, 0.04);
  g.add(dip);
  return g;
}

// Baked pork bun (pork-bun photo): a golden, flaky half-moon pastry, sesame on
// top, torn open at one end with the meat filling showing; on crinkled paper.
export function makePorkBun() {
  const g = new THREE.Group();
  g.name = 'pork_bun';
  // baked crust: golden with browned patches and darker flake edges
  const cc = document.createElement('canvas'); cc.width = cc.height = 256;
  const cx = cc.getContext('2d');
  cx.fillStyle = '#d9974a'; cx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 120; i++) {
    cx.fillStyle = `rgba(${120 + Math.random() * 40},${60 + Math.random() * 30},${20},${0.15 + Math.random() * 0.25})`;
    cx.beginPath(); cx.ellipse(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 18, 2 + Math.random() * 8, Math.random() * 3, 0, 7); cx.fill();
  }
  for (let i = 0; i < 60; i++) {
    cx.strokeStyle = 'rgba(245,205,140,0.5)'; cx.lineWidth = 1.5;
    cx.beginPath(); const x0 = Math.random() * 256, y0 = Math.random() * 256; cx.arc(x0, y0, 6 + Math.random() * 14, 0, 2); cx.stroke();
  }
  const crustTex = new THREE.CanvasTexture(cc);
  crustTex.colorSpace = THREE.SRGBColorSpace;
  crustTex.wrapS = crustTex.wrapT = THREE.RepeatWrapping;
  crustTex.repeat.set(3, 2);
  const crust = std({ map: crustTex, roughness: 0.5 });
  // half-moon: a squashed sphere stretched long, with a flat bottom
  const geo = new THREE.SphereGeometry(0.06, 128, 80);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    x *= 1.55; y = Math.max(y, -0.012) * 0.75; z *= 0.95;
    // layered, flaky bumps on the surface
    const r0 = Math.hypot(x / 1.55, z / 0.95);
    const k = 1 + 0.05 * Math.abs(Math.sin(r0 * 260)) + 0.03 * Math.sin(x * 210 + z * 90) * Math.sin(z * 230);  // flaky rings + crackle
    p.setXYZ(i, x * k, y * k, z * k);
  }
  geo.computeVertexNormals();
  // cut the front end open: drop the triangles past x = 0.07
  const idx = [];
  const ia = geo.index.array;
  for (let t = 0; t < ia.length; t += 3) {
    const xs = [ia[t], ia[t + 1], ia[t + 2]].map((v) => p.getX(v));
    if (Math.max(...xs) < 0.072) idx.push(ia[t], ia[t + 1], ia[t + 2]);
  }
  geo.setIndex(idx);
  const bun = new THREE.Mesh(geo, crust);
  bun.position.y = 0.01;
  bun.castShadow = true;
  g.add(bun);
  // the bitten face: photo of the filling, set into the open end
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.045, 24), std({ map: tex('food_porkbun_filling'), roughness: 0.6 }));
  face.scale.set(1, 0.75, 1);
  face.rotation.y = Math.PI / 2;
  face.position.set(0.071, 0.028, 0);
  g.add(face);
  // a ring of pale inner dough around the bite
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.044, 0.006, 6, 24), std({ color: '#f1d5a6', roughness: 0.8 }));
  ring.scale.set(1, 0.75, 1);
  ring.rotation.y = Math.PI / 2;
  ring.position.copy(face.position);
  g.add(ring);
  // sesame seeds across the top
  const seed = new THREE.SphereGeometry(0.0026, 6, 4);
  seed.scale(1.6, 0.6, 1);
  const seedMat = std({ color: '#e8d2a2', roughness: 0.6 });
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * 0.85;
    const x = Math.cos(a) * rr * 0.06 * 1.55, z = Math.sin(a) * rr * 0.06 * 0.95;
    if (x > 0.06) continue;
    const s2 = new THREE.Mesh(seed, seedMat);
    s2.position.set(x, 0.01 + 0.06 * 0.75 * Math.sqrt(Math.max(0, 1 - rr * rr)) * 1.04 + 0.002, z);
    s2.rotation.y = Math.random() * 3;
    g.add(s2);
  }
  // crinkled paper underneath
  const pg = new THREE.PlaneGeometry(0.22, 0.2, 10, 10);
  const pp = pg.attributes.position;
  for (let i = 0; i < pp.count; i++) pp.setZ(i, Math.random() * 0.006);
  pg.computeVertexNormals();
  const wrap = new THREE.Mesh(pg, std({ color: '#f3f1ea', roughness: 0.9, side: THREE.DoubleSide }));
  wrap.rotation.x = -Math.PI / 2;
  wrap.position.y = 0.002;
  g.add(wrap);
  return g;
}
