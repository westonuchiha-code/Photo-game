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

export function makeCornDog() {
  const g = new THREE.Group();
  g.name = 'corn_dog';
  // paper boat
  const boat = new THREE.Group();
  const paper = std({ color: '#f1efe8', roughness: 0.9, side: THREE.DoubleSide });
  const base = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.24), paper);
  base.rotation.x = -Math.PI / 2;
  base.position.y = 0.002;
  boat.add(base);
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.045), paper);
    side.rotation.set(0, Math.PI / 2, s * 0.4);
    side.position.set(s * 0.062, 0.02, 0);
    boat.add(side);
    const end = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.045), paper);
    end.rotation.x = s * 0.4;
    end.position.set(0, 0.02, s * 0.122);
    boat.add(end);
  }
  g.add(boat);
  // breaded dog: capsule with the photo crust wrapped around it
  const t = tex('food_corndog');
  const dog = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.13, 6, 16), std({ map: t, roughness: 0.85 }));
  dog.rotation.x = Math.PI / 2;
  dog.position.set(0.012, 0.026, -0.01);
  dog.castShadow = true;
  g.add(dog);
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.16, 6), std({ color: '#d9c49a' }));
  stick.rotation.x = Math.PI / 2;
  stick.position.set(0.012, 0.026, -0.15);
  g.add(stick);
  // dip sauce puddle
  const dip = new THREE.Mesh(new THREE.CircleGeometry(0.03, 24), std({ map: tex('food_dip_sauce'), roughness: 0.2 }));
  dip.rotation.x = -Math.PI / 2;
  dip.position.set(-0.025, 0.005, 0.07);
  g.add(dip);
  return g;
}

export function makePorkBun() {
  const g = new THREE.Group();
  g.name = 'pork_bun';
  // flattened golden pastry dome with a bitten-open front showing the filling
  const crust = std({ color: '#d79a52', roughness: 0.7 });
  const geo = new THREE.SphereGeometry(0.06, 24, 16);
  geo.scale(1.25, 0.6, 1);
  const bun = new THREE.Mesh(geo, crust);
  bun.position.y = 0.035;
  bun.castShadow = true;
  g.add(bun);
  // sesame seeds
  const seed = new THREE.Mesh(new THREE.SphereGeometry(0.0025, 6, 4), std({ color: '#f4e7c8' }));
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2, rr = Math.random() * 0.055;
    const s2 = seed.clone();
    s2.position.set(Math.cos(a) * rr * 1.25, 0.035 + 0.036 * Math.sqrt(1 - (rr / 0.06) ** 2), Math.sin(a) * rr);
    g.add(s2);
  }
  const bite = new THREE.Mesh(new THREE.CircleGeometry(0.035, 24), std({ map: tex('food_porkbun_bite'), roughness: 0.6 }));
  bite.position.set(0, 0.034, 0.061);
  g.add(bite);
  // paper wrapper underneath
  const wrap = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.18), std({ color: '#f3f1ea', roughness: 0.9, side: THREE.DoubleSide }));
  wrap.rotation.x = -Math.PI / 2;
  wrap.position.y = 0.002;
  g.add(wrap);
  return g;
}
