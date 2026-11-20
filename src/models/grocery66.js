// Grocery 2 (queue item 66, photos/grocery2/): everything modelled, made-up labels and prices.
//   makeNigiri(kind)     one piece: hand-shaped rice block + a draped topping ('tuna', 'salmon', 'tamago', 'shrimp',
//                        'squid', 'roe')
//   makeSushiTray(n, seed)  a takeaway tray: black base with a red/gold patterned rim, nigiri in rows, green grass
//                        divider, pink ginger, a soy-fish packet, a clear domed lid, a price label
//   makeSushiCase()      open refrigerated case: vented steel base, three sloped black shelves of trays, a lit canopy
//   makeGingerBag(seed)  a twist-tied clear bag of shredded red pickled ginger with a white printed label
//   makePizzaBag()       a clear bag of five stacked mini pizzas with a green label   makeEInkTag(name, price)
//   makeGroceryEndcap()  end-cap: a clear bin of ginger bags with a price strip, a shelf of pizza bags with an e-ink tag
//   makeCounterThings()  round wood-grain glasses on a croc-embossed wallet and a small sake carton with a straw
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';

function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.5, ...o }); }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clear = () => new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.22, roughness: 0.08, metalness: 0, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide });

// ---- sushi ----------------------------------------------------------------------------------------------------
let _rice = null;
function riceTex() { if (_rice) return _rice; _rice = canvasT(128, 128, (x, w, h) => { x.fillStyle = '#f4f2ea'; x.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(${200 + Math.random() * 40},${195 + Math.random() * 40},${180 + Math.random() * 40},0.9)`; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 5, 2.5, Math.random() * 3, 0, 7); x.fill(); } }); _rice.wrapS = _rice.wrapT = THREE.RepeatWrapping; return _rice; }
const TOP = {
  tuna: (x, w, h) => { x.fillStyle = '#c8202e'; x.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { x.strokeStyle = 'rgba(255,150,160,0.25)'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, i * 22); x.lineTo(w, i * 22 + 30); x.stroke(); } },
  salmon: (x, w, h) => { x.fillStyle = '#f2783a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#fbe0c8'; x.lineWidth = 5; for (let i = -2; i < 9; i++) { x.beginPath(); x.moveTo(i * 18, 0); x.lineTo(i * 18 + 40, h); x.stroke(); } },
  tamago: (x, w, h) => { x.fillStyle = '#f2c83a'; x.fillRect(0, 0, w, h); x.fillStyle = '#d8a02a'; x.fillRect(0, 0, w, 8); x.fillStyle = '#141814'; x.fillRect(w * 0.4, 0, w * 0.2, h); },
  shrimp: (x, w, h) => { x.fillStyle = '#f8f2ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#f0603a'; for (let i = 0; i < 6; i++) x.fillRect(0, i * 22 + 4, w, 9); },
  squid: (x, w, h) => { x.fillStyle = '#f2f0ea'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(200,200,200,0.6)'; for (let i = 0; i < 12; i++) { x.beginPath(); x.moveTo(i * 12, 0); x.lineTo(i * 12 - 10, h); x.stroke(); } x.fillStyle = '#3aa03a'; x.beginPath(); x.arc(w / 2, h / 2, 10, 0, 7); x.fill(); },
  roe: (x, w, h) => { x.fillStyle = '#e8601a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(255,${120 + Math.random() * 60},40,0.9)`; x.beginPath(); x.arc(Math.random() * w, Math.random() * h, 7, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,0.5)'; x.beginPath(); x.arc(Math.random() * w, Math.random() * h, 2, 0, 7); x.fill(); } },
};
const _topT = {};
export function makeNigiri(kind = 'tuna') {
  const g = new THREE.Group(); g.name = 'nigiri_' + kind;
  if (!_topT[kind]) _topT[kind] = canvasT(128, 128, TOP[kind]);
  const riceM = std({ map: riceTex(), roughness: 0.85 });
  if (kind === 'roe') {   // gunkan: an oval of rice wrapped in a nori band, roe heaped on top inside it
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.016, 20), riceM); r.scale.set(1.5, 1, 1); r.position.y = 0.008; g.add(r);
    const n = new THREE.Mesh(new THREE.CylinderGeometry(0.0138, 0.0138, 0.026, 24, 1, true), std({ color: '#141814', roughness: 0.6, side: THREE.DoubleSide })); n.scale.set(1.5, 1, 1); n.position.y = 0.013; g.add(n);
    const roe = new THREE.Mesh(new THREE.SphereGeometry(0.013, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), std({ map: _topT[kind], roughness: 0.15 })); roe.scale.set(1.5, 0.45, 1); roe.position.y = 0.019; g.add(roe);
    return g;
  }
  rbox(0.045, 0.018, 0.022, 0.009, riceM, 0, 0.009, 0, g);
  // topping: a thin slice draped over the rice (a bent plane with thickness)
  const geo = new THREE.BoxGeometry(0.052, 0.006, 0.026, 10, 1, 4); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, p.getY(i) + 0.019 - 0.6 * x * x - 1.2 * z * z); }
  geo.computeVertexNormals();
  const top = new THREE.Mesh(geo, std({ map: _topT[kind], roughness: kind === 'tamago' ? 0.7 : 0.3 })); top.castShadow = true; g.add(top);
  if (kind === 'roe') { const n = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.024, 16, 1, true), std({ color: '#141814', side: THREE.DoubleSide })); n.scale.set(1.6, 1, 1); n.position.y = 0.014; g.add(n); }
  return g;
}
const RIM = ['#b8141e', '#141416'];
let _rim = null;
function rimTex() { if (_rim) return _rim; _rim = canvasT(256, 64, (x, w, h) => { x.fillStyle = '#b8141e'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e8c050'; x.lineWidth = 2; for (let i = 0; i < 16; i++) { x.beginPath(); x.arc(i * 16 + 8, h / 2, 6, 0, 7); x.stroke(); x.beginPath(); x.moveTo(i * 16, 6); x.lineTo(i * 16 + 16, 6); x.stroke(); } }); _rim.wrapS = THREE.RepeatWrapping; return _rim; }
export function makeSushiTray(n = 8, seed = 1) {
  const g = new THREE.Group(); g.name = 'sushi_tray'; const r = rng(seed);
  const cols = n > 8 ? 6 : 4, rows = Math.ceil(n / cols), W = cols * 0.03 + 0.05, D = rows * 0.055 + 0.05;
  box(W, 0.008, D, std({ color: '#141416', roughness: 0.3 }), 0, 0.004, 0, g);
  const rim = std({ map: rimTex(), roughness: 0.35 }); rim.map.repeat.set(W * 6, 1);
  for (const [w, d, x, z] of [[W, 0.006, 0, D / 2], [W, 0.006, 0, -D / 2], [0.006, D, W / 2, 0], [0.006, D, -W / 2, 0]]) box(w, 0.018, d, rim, x, 0.012, z, g);
  const kinds = ['tamago', 'tuna', 'tuna', 'salmon', 'salmon', 'shrimp', 'squid', 'roe', 'tuna', 'salmon', 'tamago', 'squid'];
  for (let i = 0; i < n; i++) { const c = i % cols, rr = Math.floor(i / cols); const s = makeNigiri(kinds[(i + Math.floor(r() * 3)) % kinds.length]); s.position.set(-W / 2 + 0.035 + c * 0.03, 0.008, -D / 2 + 0.035 + rr * 0.055); s.rotation.y = Math.PI / 2 + (r() - 0.5) * 0.1; g.add(s); }
  // grass divider + pink ginger + a fish-shaped soy packet in the free corner
  const grass = canvasT(64, 64, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#2a9a3a'; x.beginPath(); for (let i = 0; i <= 8; i++) { x.lineTo(i * 8, i % 2 ? 10 : 30); } x.lineTo(w, h); x.lineTo(0, h); x.fill(); });
  plane(W - 0.02, 0.025, std({ map: grass, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }), 0, 0.02, D / 2 - 0.01, 0, g);
  const ging = new THREE.Mesh(new THREE.IcosahedronGeometry(0.012, 1), std({ color: '#f2a0a8', flatShading: true })); ging.scale.set(1.4, 0.5, 1); ging.position.set(W / 2 - 0.02, 0.012, D / 2 - 0.02); g.add(ging);
  const soy = new THREE.Mesh(new THREE.CapsuleGeometry(0.004, 0.02, 4, 8), std({ color: '#3a1a10', transparent: true, opacity: 0.8 })); soy.rotation.z = Math.PI / 2; soy.position.set(W / 2 - 0.045, 0.01, D / 2 - 0.02); g.add(soy);
  // domed clear lid + label
  const lid = new THREE.Mesh(new RoundedBoxGeometry(W + 0.004, 0.045, D + 0.004, 4, 0.012), clear()); lid.position.y = 0.024; lid.renderOrder = 2; g.add(lid);
  const price = [7.8, 9.8, 12.8, 5.8, 14.8][Math.floor(r() * 5)];
  const lbl = canvasT(160, 100, (x, w, h) => { x.fillStyle = '#fbfbf6'; x.fillRect(0, 0, w, h); x.fillStyle = '#222'; fitText(x, n > 8 ? 'DELUXE NIGIRI' : 'NIGIRI SET', w / 2, 18, w - 10, 16, F.label, { weight: 700 }); x.fillStyle = '#888'; for (let i = 0; i < 3; i++) x.fillRect(10, 34 + i * 9, w - 20, 3); x.fillStyle = '#c81e28'; fitText(x, `$${price.toFixed(2)}`, w / 2, 80, w - 20, 26, F.heavy); });
  const l = new THREE.Mesh(new THREE.PlaneGeometry(0.045, 0.028), std({ map: lbl })); l.rotation.x = -Math.PI / 2; l.position.set(W / 4, 0.0475, 0); g.add(l);
  g.userData.size = [W, D];
  return g;
}
export function makeSushiCase() {
  const g = new THREE.Group(); g.name = 'sushi_case';
  const L = 2.4, steel = std({ color: '#b8bcc0', metalness: 0.75, roughness: 0.3 }), black = std({ color: '#141416', roughness: 0.35 });
  const vent = canvasT(256, 64, (x, w, h) => { x.fillStyle = '#c8ccd0'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a2c30'; for (let i = 4; i < w; i += 10) x.fillRect(i, 10, 5, h - 20); });
  vent.wrapS = THREE.RepeatWrapping; vent.repeat.set(L * 3, 1);
  const base = box(L, 0.7, 0.85, steel, 0, 0.35, 0, g); base.material = [steel, steel, steel, steel, std({ map: vent, metalness: 0.6, roughness: 0.35 }), steel];
  box(L, 0.08, 0.06, steel, 0, 0.74, 0.42, g);   // front rail
  // three tiers: a deep sloped well at the front and two stepped shelves behind
  const tiers = [[0.78, 0.24, 0.45, 0.12], [1.08, -0.08, 0.32, 0.18], [1.38, -0.3, 0.28, 0.22]];
  const r = rng(66);
  tiers.forEach(([y, z, d, tilt], k) => {
    const sh = new THREE.Group(); sh.position.set(0, y, z); sh.rotation.x = tilt; g.add(sh);
    box(L - 0.04, 0.02, d, black, 0, 0, 0, sh); box(L - 0.04, 0.035, 0.012, std({ color: '#d8dade', metalness: 0.6 }), 0, 0.01, d / 2, sh);
    let x = -L / 2 + 0.06;
    while (x < L / 2 - 0.2) { const t = makeSushiTray(k === 0 && r() < 0.35 ? 12 : 8, Math.floor(r() * 1000)); const [tw, td] = t.userData.size; if (x + tw > L / 2 - 0.04) break; t.position.set(x + tw / 2, 0.01, d / 2 - td / 2 - 0.02); t.rotation.y = (r() - 0.5) * 0.08; sh.add(t); if (k === 0 && r() < 0.5) { const t2 = makeSushiTray(8, Math.floor(r() * 1000)); t2.position.set(x + tw / 2, 0.01, d / 2 - td * 1.5 - 0.04); sh.add(t2); } x += tw + 0.02; }
  });
  // back panel + canopy with a light strip, end panels
  box(L, 1.4, 0.04, black, 0, 1.25, -0.44, g);
  box(L, 0.08, 0.5, black, 0, 1.92, -0.2, g);
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.1, 0.05), std({ color: '#fff', emissive: '#f4f8ff', emissiveIntensity: 2 })); strip.rotation.x = Math.PI / 2; strip.position.set(0, 1.875, -0.05); g.add(strip);
  const l = new THREE.PointLight('#f4f8ff', 2.5, 3, 1.6); l.position.set(0, 1.7, 0.1); g.add(l);
  for (const s of [-1, 1]) box(0.04, 1.2, 0.85, std({ color: '#c8ccd0', metalness: 0.5 }), s * L / 2, 1.3, 0, g);
  const sign = canvasT(256, 64, (x, w, h) => { x.fillStyle = '#c81e28'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'FRESH SUSHI', w / 2, 33, w - 20, 38, F.heavy, { spacing: 3 }); });
  plane(0.5, 0.12, std({ map: sign }), 0.6, 1.85, 0.06, 0, g);
  g.userData.collider = [-L / 2, L / 2, -0.46, 0.45];
  return g;
}

// ---- bags -------------------------------------------------------------------------------------------------------
function shredTex(color) { return canvasT(128, 128, (x, w, h) => { x.fillStyle = color; x.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { x.strokeStyle = `rgba(${255},${60 + Math.random() * 90},${40 + Math.random() * 40},0.8)`; x.lineWidth = 1 + Math.random() * 2; const a = Math.random() * 6, l = 10 + Math.random() * 30, px = Math.random() * w, py = Math.random() * h; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * l * 0.5 + 6, py + Math.sin(a) * l * 0.5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); } }); }
let _shred = null;
export function makeGingerBag(seed = 1) {
  const g = new THREE.Group(); g.name = 'ginger_bag'; const r = rng(seed);
  // a teardrop of shreds (lumpy) inside a slightly larger clear bag, gathered to a twist at the top
  if (!_shred) _shred = shredTex('#c81808');
  const prof = [[0, 0], [0.05, 0.005], [0.075, 0.04], [0.078, 0.1], [0.06, 0.16], [0.025, 0.2], [0.008, 0.22]].map(([a, b]) => new THREE.Vector2(a, b));
  const inner = new THREE.LatheGeometry(prof, 20); const ip = inner.attributes.position;
  for (let i = 0; i < ip.count; i++) { const k = 1 + 0.06 * Math.sin(ip.getY(i) * 70 + Math.atan2(ip.getZ(i), ip.getX(i)) * 5 + seed); ip.setX(i, ip.getX(i) * k * 1.15); ip.setZ(i, ip.getZ(i) * k * 0.62); }
  inner.computeVertexNormals();
  g.add(new THREE.Mesh(inner, std({ map: _shred, roughness: 0.45 })));
  const outer = new THREE.LatheGeometry(prof.map((v) => new THREE.Vector2(v.x * 1.06 + 0.003, v.y * 1.02)), 20); outer.scale(1.15, 1, 0.66);
  const bag = new THREE.Mesh(outer, clear()); bag.renderOrder = 2; g.add(bag);
  // the twisted neck + a red tie, the excess film above it
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.01, 0.03, 8), clear()); neck.position.y = 0.235; g.add(neck);
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.002, 4, 10), std({ color: '#d81e1e' })); tie.rotation.x = Math.PI / 2; tie.position.y = 0.232; g.add(tie);
  const ruff = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.05, 8, 1, true), clear()); ruff.rotation.x = Math.PI; ruff.position.y = 0.27; ruff.rotation.z = (r() - 0.5) * 0.4; g.add(ruff);
  // white printed label on the front
  const lbl = canvasT(200, 240, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(w / 2, h / 2, w / 2 - 4, h / 2 - 4, 0, 0, 7); x.fill(); x.fillStyle = '#d81e1e'; fitText(x, 'SHREDDED', w / 2, 90, w - 40, 30, F.brush); fitText(x, 'GINGER', w / 2, 140, w - 50, 44, F.brush); x.fillStyle = '#f2c21a'; x.beginPath(); x.arc(w * 0.75, 50, 22, 0, 7); x.fill(); x.fillStyle = '#fff'; fitText(x, 'red', w * 0.75, 51, 34, 14, F.label); });
  const lm = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.1), std({ map: lbl, transparent: true, alphaTest: 0.3 })); lm.position.set(0, 0.1, 0.057); g.add(lm);
  return g;
}
let _pz = null;
function pizzaTopTex() { if (_pz) return _pz; const t = new THREE.TextureLoader().load('assets/textures/food_pizza_corn.png'); t.colorSpace = THREE.SRGBColorSpace; return (_pz = t); }
export function makePizzaBag() {
  const g = new THREE.Group(); g.name = 'pizza_bag';
  // five mini pizzas lying in a slightly fanned stack, a clear pillow bag around them, a green label at the top
  const crust = std({ color: '#d89a5a', roughness: 0.8 }), top = std({ map: pizzaTopTex(), roughness: 0.7 });
  for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.062, 0.008, 28), [crust, top, crust]); p.position.set(0.012 * (i - 2), 0.006 + i * 0.009, 0.006 * Math.sin(i)); p.rotation.y = i; g.add(p); }
  const bag = new THREE.Mesh(new RoundedBoxGeometry(0.17, 0.065, 0.16, 4, 0.03), clear()); bag.position.y = 0.03; bag.renderOrder = 2; g.add(bag);
  const lbl = canvasT(256, 160, (x, w, h) => { x.fillStyle = '#123a22'; x.beginPath(); x.roundRect(0, 0, w, h, 18); x.fill(); x.strokeStyle = '#d8b84a'; x.lineWidth = 4; x.strokeRect(10, 10, w - 20, h - 20); x.fillStyle = '#f2e6b8'; fitText(x, 'MINI PIZZA', w / 2, 58, w - 40, 40, F.heavy); x.fillStyle = '#d8b84a'; fitText(x, 'bacon & corn · 5 pack', w / 2, 106, w - 40, 22, F.label); });
  const lm = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.05), std({ map: lbl })); lm.rotation.x = -Math.PI / 2; lm.position.set(-0.035, 0.0655, -0.03); lm.rotation.z = 0.25; g.add(lm);
  return g;
}
export function makeEInkTag(name = 'MINI PIZZA MIX', price = '$3.10') {
  const g = new THREE.Group(); g.name = 'eink_tag';
  const t = canvasT(320, 160, (x, w, h) => { x.fillStyle = '#dcdcd4'; x.fillRect(0, 0, w, h); x.fillStyle = '#222'; fitText(x, name, w / 2, 26, w - 30, 22, F.label); x.fillRect(16, 46, w - 32, 2); fitText(x, price, w * 0.6, 100, w * 0.6, 64, F.heavy); x.font = `12px ${F.small}`; x.fillText('per pack · tax incl.', 18, 140); for (let i = 0; i < 26; i++) x.fillRect(w - 110 + i * 3, 128, i % 3 ? 1 : 2, 20); });
  rbox(0.105, 0.055, 0.012, 0.005, std({ color: '#f2f2ee', roughness: 0.4 }), 0, 0, 0, g);
  plane(0.09, 0.045, std({ map: t, roughness: 0.8 }), 0, 0, 0.0065, 0, g);
  box(0.03, 0.02, 0.02, clear(), 0, 0.035, -0.01, g);
  return g;
}
export function makeGroceryEndcap() {
  const g = new THREE.Group(); g.name = 'grocery_endcap';
  const W = 1.2, white = std({ color: '#ecece8' }), metal = std({ color: '#c8ccd0', metalness: 0.6, roughness: 0.35 });
  box(W, 1.5, 0.5, white, 0, 0.75, -0.25, g); box(W, 0.1, 0.55, std({ color: '#2a2c30' }), 0, 0.05, -0.02, g);
  // lower shelf: a clear acrylic bin of ginger bags with a price strip
  box(W - 0.04, 0.02, 0.5, metal, 0, 0.35, 0.02, g);
  for (const [w, h, d, x, y, z] of [[W - 0.06, 0.24, 0.005, 0, 0.47, 0.27], [0.005, 0.24, 0.48, -W / 2 + 0.03, 0.47, 0.03], [0.005, 0.24, 0.48, W / 2 - 0.03, 0.47, 0.03]]) box(w, h, d, clear(), x, y, z, g);
  const r = rng(7);
  for (let i = 0; i < 9; i++) { const b = makeGingerBag(i + 1); b.position.set(-W / 2 + 0.13 + (i % 5) * 0.23 + (r() - 0.5) * 0.04, 0.36 + Math.floor(i / 5) * 0.03, -0.12 + Math.floor(i / 5) * 0.2); b.rotation.set(0.15 * (r() - 0.5) - 0.25, r() * 0.6, 0.2 * (r() - 0.5)); g.add(b); }
  const strip = canvasT(512, 96, (x, w, h) => { x.fillStyle = '#f8f8f4'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, 'SHREDDED GINGER', w * 0.32, 34, w * 0.55, 34, F.heavy); x.font = `13px ${F.small}`; x.fillStyle = '#555'; x.fillText('80 g · tax incl. $1.03', 24, 74); x.fillStyle = '#d81e1e'; fitText(x, '95¢', w * 0.82, 52, 150, 70, F.heavy); });
  plane(0.42, 0.08, std({ map: strip }), 0, 0.31, 0.275, 0, g);
  // upper shelf: pizza bags stood up on edge leaning back, e-ink tag on the rail
  box(W - 0.04, 0.02, 0.45, metal, 0, 0.95, -0.02, g); box(W - 0.04, 0.05, 0.015, clear(), 0, 1.0, 0.21, g);
  for (let i = 0; i < 6; i++) for (let k = 0; k < 2; k++) { const p = makePizzaBag(); p.rotation.set(0, (r() - 0.5) * 0.3, 0); p.position.set(-W / 2 + 0.13 + (i % 3) * 0.19 + Math.floor(i / 3) * 0.56, 0.965 + k * 0.066, -0.06 + (i % 2) * 0.12); g.add(p); }
  const tag = makeEInkTag(); tag.position.set(0.3, 0.92, 0.22); g.add(tag);
  const hdr = canvasT(512, 96, (x, w, h) => { x.fillStyle = '#2a7a3a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'PICKLES & FROZEN SNACKS', w / 2, 50, w - 40, 44, F.heavy); });
  plane(W, 0.22, std({ map: hdr }), 0, 1.62, 0.005, 0, g);
  g.userData.collider = [-W / 2, W / 2, -0.5, 0.3];
  return g;
}

// ---- counter things -----------------------------------------------------------------------------------------------
export function makeCounterThings() {
  const g = new THREE.Group(); g.name = 'counter_things';
  // croc-embossed wallet: a long folded wallet, dark oxblood, scale pattern as bump
  const croc = canvasT(256, 128, (x, w, h) => { x.fillStyle = '#5a2a22'; x.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(${40 + Math.random() * 30},${18},${14},0.8)`; x.beginPath(); x.roundRect(Math.random() * w, Math.random() * h, 10 + Math.random() * 18, 8 + Math.random() * 12, 4); x.fill(); } x.strokeStyle = 'rgba(20,8,6,0.8)'; x.lineWidth = 2; for (let i = 0; i < 40; i++) { x.beginPath(); x.moveTo(Math.random() * w, Math.random() * h); x.lineTo(Math.random() * w, Math.random() * h); x.stroke(); } });
  const w = rbox(0.19, 0.022, 0.1, 0.008, std({ map: croc, bumpMap: croc, bumpScale: 2, roughness: 0.4 }), 0, 0.011, 0, g); w.rotation.y = 0.15;
  box(0.18, 0.004, 0.02, std({ color: '#4a2018' }), 0.005, 0.023, 0.035, g).rotation.y = 0.15;
  // round glasses with wood-grain rims folded on top of it
  const wood = canvasT(256, 32, (x, wd, h) => { x.fillStyle = '#6a4a2a'; x.fillRect(0, 0, wd, h); for (let i = 0; i < 30; i++) { x.strokeStyle = `rgba(${30 + Math.random() * 40},20,10,0.6)`; x.lineWidth = 1 + Math.random() * 2; x.beginPath(); x.moveTo(0, Math.random() * h); x.lineTo(wd, Math.random() * h); x.stroke(); } });
  wood.wrapS = THREE.RepeatWrapping; wood.repeat.set(2, 1);
  const wm = std({ map: wood, roughness: 0.4 }), lens = new THREE.MeshPhysicalMaterial({ color: '#e8f0f4', transparent: true, opacity: 0.2, roughness: 0.02, depthWrite: false });
  const gl = new THREE.Group(); gl.position.set(0.01, 0.026, -0.01); gl.rotation.set(-1.45, 0, 0.12); g.add(gl);
  for (const s of [-1, 1]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.0035, 8, 28), wm); rim.position.x = s * 0.027; gl.add(rim); const l = new THREE.Mesh(new THREE.CircleGeometry(0.021, 24), lens); l.position.x = s * 0.027; gl.add(l);
    const tp = []; for (let i = 0; i <= 10; i++) { const t = i / 10; tp.push(V(s * (0.049 - t * 0.012), 0.004, -0.004 - t * 0.012)); } gl.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tp), 10, 0.0018, 5), wm)); }
  const br = new THREE.Mesh(new THREE.TorusGeometry(0.006, 0.0025, 6, 10, Math.PI), wm); br.position.y = 0.006; gl.add(br);
  // a small sake carton (made-up brand) with a straw
  const cart = canvasT(256, 384, (x, wd, h) => { x.fillStyle = '#f4f2ec'; x.fillRect(0, 0, wd, h); x.fillStyle = '#c81e28'; x.fillRect(0, 0, wd, 60); x.fillStyle = '#fff'; fitText(x, 'DRY', wd / 2, 32, 120, 40, F.heavy); x.fillStyle = '#141414'; fitText(x, 'MOUNTAIN', wd / 2, 130, wd - 40, 46, F.brush); fitText(x, 'ONI', wd / 2, 210, wd - 60, 100, F.brush); x.fillStyle = '#c81e28'; x.beginPath(); x.arc(60, 300, 26, 0, 7); x.fill(); x.fillStyle = '#fff'; fitText(x, 'sake', 60, 301, 40, 16, F.label); x.fillStyle = '#333'; fitText(x, '180 ml', wd - 60, 340, 100, 22, F.label); });
  const cm = std({ map: cart, roughness: 0.5 }), plain = std({ color: '#f4f2ec' });
  const c = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.04), [plain, plain, plain, plain, cm, cm]); c.position.set(0.17, 0.045, 0.02); c.rotation.y = -0.3; c.castShadow = true; g.add(c);
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.06, 6), std({ color: '#f2f2f0' })); straw.position.set(0.18, 0.115, 0.02); straw.rotation.z = 0.15; g.add(straw);
  return g;
}
