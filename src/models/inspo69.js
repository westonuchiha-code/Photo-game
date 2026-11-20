// Inspiration 4 (queue item 69, photos/inspo4/). Everything modelled, made-up brands/prices; photo surfaces where they
// are surfaces (tools/tex_69.py). The pieces live in a warehouse-club store, "BULK BARN", 40 x 30 m.
//   makeSodaBottle(c)     a long-neck glass bottle of blue soda with a purple label + cap
//   makeDonutBox()        a 6-donut window box with pixel-arcade decorations and six modelled donuts
//   makeBrochureHolder()  a smoked-acrylic wall pocket with "TAKE ONE" and leaflets inside
//   makeConsoleSetup()    a tall white two-tone console standing on its end with a little figure sitting on top, a
//                         hybrid handheld in its dock, a blue handheld, cables
//   makeMiniPie() / makeTortillaPizza() / makeNoodleCup() / makeCurryRice()   food (photo tops)
//   makeEggBox()          an open shipping box of yellow egg cartons with red bands ("HAPPY HEN")
//   makeTVBox(design)     'blue' | 'red' | 'teal': a big printed TV carton (made-up brand, screen on the box)
//   makeNogCooler()       a 3-door glass cooler of egg-nog jugs and cartons
//   makePalletBay()       orange pallet racking with a plywood back, wire decks, blue pallets with cases of cans
//   makeSlatBin()         a round slatted steel litter bin
//   makeWarehouseStore()  the store building: two-tone brick (photo) with a downpipe and the slatted bin outside,
//                         a roll-up dock door, the interior aisles with all of the above, a break table with food
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 24) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const glassM = () => new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.18, roughness: 0.03, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide });
// a box with separate front art and plain sides
function printedBox(w, h, d, front, side, p) { const s = std({ map: side, roughness: 0.7 }), f = std({ map: front, roughness: 0.6 }); const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [s, s, std({ color: '#d8c8a8' }), std({ color: '#d8c8a8' }), f, f]); m.castShadow = true; m.receiveShadow = true; if (p) p.add(m); return m; }

// ---- soda ---------------------------------------------------------------------------------------------------------
let _sodaLabel = null;
export function makeSodaBottle(color = '#2a8ae0') {
  const g = new THREE.Group(); g.name = 'soda_bottle';
  if (!_sodaLabel) _sodaLabel = canvasT(512, 160, (x, w, h) => { x.fillStyle = '#5a2a9a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { x.fillStyle = '#f2e04a'; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } x.fillStyle = '#f2c21a'; x.strokeStyle = '#2a0a5a'; x.lineWidth = 6; x.lineJoin = 'round'; for (const ox of [0, w / 2]) { fitText(x, 'COSMIC', ox + w / 4, 62, w / 2 - 40, 48, F.retro, { stroke: 1 }); x.fillStyle = '#ffffff'; fitText(x, 'blue fizz', ox + w / 4, 118, w / 2 - 80, 26, F.script); x.fillStyle = '#f2c21a'; } });
  const prof = [[0, 0], [0.031, 0], [0.033, 0.01], [0.033, 0.14], [0.03, 0.17], [0.014, 0.21], [0.012, 0.25], [0.014, 0.252], [0.014, 0.256], [0, 0.256]].map(([a, b]) => new THREE.Vector2(a, b));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 24), new THREE.MeshPhysicalMaterial({ color, transparent: true, opacity: 0.85, roughness: 0.05, clearcoat: 1, transmission: 0 })));
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.0335, 0.0335, 0.075, 24, 1, true), std({ map: _sodaLabel, roughness: 0.4 })); lab.position.y = 0.08; g.add(lab);
  cyl(0.0145, 0.0145, 0.012, std({ color: '#5a2a9a', metalness: 0.6, roughness: 0.3 }), 0, 0.258, 0, g, 16);
  return g;
}
// ---- donut box ------------------------------------------------------------------------------------------------------
function donut(glaze, seed) {
  const g = new THREE.Group(); const r = rng(seed);
  const d = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.017, 12, 24), std({ color: '#c8843a', roughness: 0.8 })); d.rotation.x = Math.PI / 2; d.scale.z = 0.85; g.add(d);
  if (glaze) { const gl = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.0172, 12, 24, Math.PI * 2), std({ color: glaze, roughness: 0.25 })); gl.rotation.x = Math.PI / 2; gl.scale.set(1.01, 1.01, 0.6); gl.position.y = 0.006; g.add(gl);
    for (let i = 0; i < 14; i++) { const a = r() * 6.28, rr = 0.022 + r() * 0.018; const s = new THREE.Mesh(new THREE.CapsuleGeometry(0.0014, 0.005, 2, 4), std({ color: ['#f24a4a', '#4ac8f2', '#f2f24a', '#ffffff'][i % 4] })); s.position.set(Math.cos(a) * rr, 0.017, Math.sin(a) * rr); s.rotation.set(Math.PI / 2, 0, r() * 3); g.add(s); } }
  return g;
}
export function makeDonutBox() {
  const g = new THREE.Group(); g.name = 'donut_box';
  const W = 0.27, D = 0.4, H = 0.08;
  const art = canvasT(512, 768, (x, w, h) => {
    x.fillStyle = '#0a0a1a'; x.fillRect(0, 0, w, h); x.fillStyle = '#1e3aa8'; for (let i = 0; i < w; i += 30) x.fillRect(i, 0, 3, h);
    const pix = (px, py, s, c, pat) => { x.fillStyle = c; pat.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') x.fillRect(px + i * s, py + j * s, s, s); })); };
    const ghost = ['..####..', '.######.', '##.##.##', '########', '########', '#.#..#.#'];
    pix(30, 40, 8, '#e83a3a', ghost); pix(400, 640, 8, '#3ac8e8', ghost); pix(410, 60, 8, '#f2a0d0', ghost);
    x.fillStyle = '#f2e04a'; x.beginPath(); x.moveTo(60, 680); x.arc(60, 680, 34, 0.5, Math.PI * 2 - 0.5); x.closePath(); x.fill();
    x.fillStyle = '#f2f2f2'; for (let i = 0; i < 10; i++) { x.beginPath(); x.arc(120 + i * 28, 690, 5, 0, 7); x.fill(); }
    // window (cut out in the lid geometry) area, logo panel on the side
    x.fillStyle = '#ffffff'; x.save(); x.translate(60, 384); x.rotate(-Math.PI / 2); fitText(x, 'ARCADE DOZEN  ·  made fresh daily', 0, 0, 600, 28, F.retro); x.restore();
    x.fillStyle = '#e8402a'; x.font = `bold 40px ${F.heavy}`; x.textAlign = 'center'; x.fillText('6', w - 40, 50);
  });
  const lidM = std({ map: art, roughness: 0.6 }), card = std({ color: '#0a0a1a', roughness: 0.7 });
  box(W, 0.004, D, card, 0, 0.002, 0, g);
  for (const [w, d, x, z] of [[W, 0.004, 0, D / 2], [W, 0.004, 0, -D / 2], [0.004, D, W / 2, 0], [0.004, D, -W / 2, 0]]) box(w, H, d, card, x, H / 2, z, g);
  // lid with a window: a frame of printed card + a clear film
  const lid = new THREE.Group(); lid.position.y = H; g.add(lid);
  const fr = new THREE.Shape(); fr.moveTo(-W / 2, -D / 2); fr.lineTo(W / 2, -D / 2); fr.lineTo(W / 2, D / 2); fr.lineTo(-W / 2, D / 2); fr.closePath();
  const hole = new THREE.Path(); hole.moveTo(-W / 2 + 0.06, -D / 2 + 0.05); hole.lineTo(W / 2 - 0.03, -D / 2 + 0.05); hole.lineTo(W / 2 - 0.03, D / 2 - 0.05); hole.lineTo(-W / 2 + 0.06, D / 2 - 0.05); hole.closePath(); fr.holes.push(hole);
  const lg = new THREE.ShapeGeometry(fr); const uv = lg.attributes.uv, lp = lg.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, lp.getX(i) / W + 0.5, lp.getY(i) / D + 0.5);
  const lm = new THREE.Mesh(lg, lidM); lm.rotation.x = -Math.PI / 2; lm.position.y = 0.002; lid.add(lm);
  const film = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.09, D - 0.1), glassM()); film.rotation.x = -Math.PI / 2; film.position.set(0.015, 0.0015, 0); lid.add(film);
  ['#3a2010', '#f2d23a', '#ffffff', null, '#e86aa0', '#3a2010'].forEach((c, i) => { const d = donut(c, i); d.position.set(-0.05 + (i % 2) * 0.1 + 0.015, 0.012, -0.12 + Math.floor(i / 2) * 0.12); g.add(d); });
  return g;
}
// ---- brochure holder --------------------------------------------------------------------------------------------
export function makeBrochureHolder() {
  const g = new THREE.Group(); g.name = 'brochure_holder';
  const smoke = new THREE.MeshPhysicalMaterial({ color: '#2a2c30', transparent: true, opacity: 0.55, roughness: 0.05, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
  box(0.26, 0.34, 0.01, std({ color: '#141416' }), 0, 0, -0.06, g);
  for (const s of [-1, 1]) box(0.005, 0.32, 0.12, smoke, s * 0.13, 0, 0, g);
  box(0.26, 0.005, 0.12, smoke, 0, -0.17, 0, g); const fr = box(0.26, 0.3, 0.005, smoke, 0, -0.01, 0.06, g); void fr;
  box(0.26, 0.03, 0.08, std({ color: '#141416' }), 0, 0.165, -0.02, g);
  const tk = canvasT(256, 64, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#d83a3a'; fitText(x, 'TAKE ONE', w / 2, 34, w - 30, 40, F.label, { weight: 700 }); });
  plane(0.18, 0.045, std({ map: tk, transparent: true, depthWrite: false }), 0, 0.02, 0.064, 0, g);
  const lf = canvasT(128, 160, (x, w, h) => { x.fillStyle = '#f2f2ee'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a6ab8'; x.fillRect(0, 0, w, 40); x.fillStyle = '#888'; for (let i = 0; i < 8; i++) x.fillRect(10, 52 + i * 12, w - 20, 4); });
  for (let i = 0; i < 4; i++) { const l = plane(0.2, 0.26, std({ map: lf }), (i - 1.5) * 0.004, -0.03 - i * 0.004, -0.045 + i * 0.022, 0, g); l.rotation.x = -0.08; }
  return g;
}
// ---- console setup ----------------------------------------------------------------------------------------------
export function makeConsoleSetup() {
  const g = new THREE.Group(); g.name = 'console_setup';
  const white = std({ color: '#f4f4f2', roughness: 0.3 }), black = std({ color: '#141416', roughness: 0.35 });
  // the console stood on end: black core with curved white side panels flaring at top and bottom
  const tower = new THREE.Group(); tower.position.set(0, 0, 0); g.add(tower);
  box(0.09, 0.39, 0.25, black, 0, 0.22, 0, tower);
  for (const s of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(-0.13, 0); sh.quadraticCurveTo(-0.15, 0.2, -0.12, 0.42); sh.lineTo(0.12, 0.44); sh.quadraticCurveTo(0.15, 0.22, 0.13, 0.0); sh.closePath();
    const p = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2 }), white); p.rotation.y = Math.PI / 2; p.position.set(s * 0.05, 0.02, 0); p.castShadow = true; tower.add(p); }
  box(0.1, 0.03, 0.2, black, 0, 0.015, 0, tower);   // stand
  const led = plane(0.002, 0.2, std({ color: '#fff', emissive: '#6aa8ff', emissiveIntensity: 1.5 }), 0, 0.3, 0.126, 0, tower); void led;
  // a small figure sitting on top (a made-up character: pink bob, black dress, white stockings), legs hanging over
  const fig = new THREE.Group(); fig.position.set(0, 0.47, 0.06); g.add(fig); const skin = std({ color: '#f2dcc8', roughness: 0.5 }), dress = std({ color: '#1a1a1e', roughness: 0.4 });
  cyl(0.012, 0.02, 0.05, dress, 0, 0.02, 0, fig, 12); const head = new THREE.Mesh(new THREE.SphereGeometry(0.016, 16, 12), skin); head.position.y = 0.065; fig.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.0185, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), std({ color: '#e8a0c8', roughness: 0.5 })); hair.position.y = 0.068; fig.add(hair);
  for (const s of [-1, 1]) { const leg = cyl(0.004, 0.0035, 0.05, std({ color: '#f2f2f0' }), s * 0.007, -0.005, 0.02, fig, 8); leg.rotation.x = 1.2; const sh = box(0.008, 0.006, 0.014, black, s * 0.007, -0.016, 0.045, fig); void sh; const arm = cyl(0.003, 0.003, 0.035, skin, s * 0.016, 0.03, 0.006, fig, 8); arm.rotation.z = s * 0.4; }
  // the hybrid handheld in its dock, a blue handheld in front, a cable
  const dock = new THREE.Group(); dock.position.set(0.32, 0, 0.0); g.add(dock);
  box(0.17, 0.1, 0.05, std({ color: '#2a2a2c', roughness: 0.4 }), 0, 0.05, 0, dock);
  box(0.17, 0.1, 0.012, black, 0, 0.11, 0.015, dock); plane(0.14, 0.078, std({ color: '#141418', emissive: '#2a3a5a', emissiveIntensity: 0.4, roughness: 0.1 }), 0, 0.11, 0.0215, 0, dock);
  for (const s of [-1, 1]) box(0.03, 0.1, 0.014, std({ color: '#3a3c40' }), s * 0.1, 0.11, 0.015, dock);
  const hh = new THREE.Group(); hh.position.set(0.32, 0, 0.16); g.add(hh);
  rbox(0.18, 0.016, 0.075, 0.012, std({ color: '#1e4ab8', roughness: 0.3 }), 0, 0.008, 0, hh); plane(0.1, 0.055, std({ color: '#0a0a0c', roughness: 0.05 }), 0, 0.0165, 0, 0, hh).rotation.x = -Math.PI / 2;
  for (const s of [-1, 1]) cyl(0.008, 0.008, 0.006, black, s * 0.07, 0.019, -0.01, hh, 10);
  const cbl = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0, 0.2, -0.13), V(0.05, 0.1, -0.2), V(0.25, 0.01, -0.15), V(0.32, 0.02, -0.03)]), 30, 0.004, 6), black); g.add(cbl);
  return g;
}
// ---- food -------------------------------------------------------------------------------------------------------
export function makeMiniPie() {
  const g = new THREE.Group(); g.name = 'mini_pie';
  const foil = std({ color: '#c8ccd0', metalness: 0.8, roughness: 0.35 });
  const prof = []; for (let i = 0; i <= 16; i++) { const t = i / 16; prof.push(new THREE.Vector2(0.06 + 0.02 * t + 0.002 * Math.sin(i * 3), 0.03 * t)); }
  const tin = new THREE.Mesh(new THREE.LatheGeometry(prof, 32), std({ ...foil, side: THREE.DoubleSide })); g.add(tin);
  const top = new THREE.SphereGeometry(0.078, 32, 10, 0, Math.PI * 2, 0, Math.PI / 2); top.scale(1, 0.18, 1);
  const tp = new THREE.Mesh(top, std({ map: tex('i4_pie'), roughness: 0.8 })); tp.position.y = 0.028; g.add(tp);
  return g;
}
export function makeTortillaPizza() {
  const g = new THREE.Group(); g.name = 'tortilla_pizza';
  const foil = new THREE.PlaneGeometry(0.4, 0.34, 16, 16); const fp = foil.attributes.position; for (let i = 0; i < fp.count; i++) fp.setZ(i, 0.004 * Math.sin(fp.getX(i) * 60) * Math.cos(fp.getY(i) * 50) + (Math.abs(fp.getX(i)) > 0.17 ? 0.02 : 0)); foil.computeVertexNormals();
  const fm = new THREE.Mesh(foil, std({ color: '#d8dce0', metalness: 0.85, roughness: 0.3, side: THREE.DoubleSide })); fm.rotation.x = -Math.PI / 2; g.add(fm);
  const crust = std({ color: '#c8904a', roughness: 0.7 });
  const pz = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.012, 40), [crust, std({ map: tex('i4_pizza'), roughness: 0.5 }), crust]); pz.position.y = 0.01; g.add(pz);
  return g;
}
export function makeNoodleCup() {
  const g = new THREE.Group(); g.name = 'noodle_cup';
  const lab = canvasT(512, 256, (x, w, h) => { x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, w, h); for (const ox of [0, w / 2]) { x.fillStyle = '#8a1a2a'; fitText(x, 'QUICK', ox + w / 4, 60, w / 2 - 50, 48, F.bubbly); x.fillStyle = '#e88a2a'; fitText(x, 'Lunch Cup', ox + w / 4, 120, w / 2 - 50, 48, F.bubbly); } x.fillStyle = '#e88a2a'; x.fillRect(0, 180, w, 14); x.fillStyle = '#8a1a2a'; x.fillRect(0, 200, w, 14); });
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.036, 0.09, 32, 1, true), std({ map: lab, roughness: 0.6, side: THREE.DoubleSide })); cup.position.y = 0.045; g.add(cup);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.003, 6, 32), std({ color: '#f4f4f0' })); rim.rotation.x = Math.PI / 2; rim.position.y = 0.09; g.add(rim);
  const broth = new THREE.Mesh(new THREE.CircleGeometry(0.046, 32), std({ map: tex('i4_broth'), roughness: 0.15 })); broth.rotation.x = -Math.PI / 2; broth.position.y = 0.078; g.add(broth);
  cyl(0.036, 0.036, 0.003, std({ color: '#f4f4f0' }), 0, 0.0015, 0, g, 24);
  return g;
}
export function makeCurryRice() {
  const g = new THREE.Group(); g.name = 'curry_rice';
  cyl(0.13, 0.11, 0.025, std({ color: '#2a2c30', roughness: 0.4 }), 0, 0.0125, 0, g, 40);
  const rice = new THREE.SphereGeometry(0.07, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2); rice.scale(1.1, 0.5, 0.9);
  const rm = new THREE.Mesh(rice, std({ map: tex('i4_rice', 2, 2), bumpMap: tex('i4_rice', 2, 2), bumpScale: 2, roughness: 0.8 })); rm.position.set(0.035, 0.025, 0.02); g.add(rm);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(0.075, 32), std({ map: tex('i4_curry', 2, 2), roughness: 0.2 })); pool.rotation.x = -Math.PI / 2; pool.scale.set(1.2, 1, 1); pool.position.set(-0.035, 0.027, -0.02); g.add(pool);
  const sp = new THREE.Group(); sp.position.set(0.04, 0.035, -0.05); sp.rotation.y = 0.6; g.add(sp); const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: '#c8ccd0', metalness: 0.9, roughness: 0.2, side: THREE.DoubleSide })); bowl.scale.set(1, 0.3, 0.7); bowl.rotation.x = Math.PI; sp.add(bowl); box(0.12, 0.003, 0.01, std({ color: '#c8ccd0', metalness: 0.9 }), 0.07, 0.005, 0, sp);
  return g;
}
// ---- eggs ----------------------------------------------------------------------------------------------------------
export function makeEggBox() {
  const g = new THREE.Group(); g.name = 'egg_box';
  const card = std({ map: tex('cardboard', 1, 1), color: '#c8a070', roughness: 0.9 });
  box(0.62, 0.02, 0.32, card, 0, 0.01, 0, g); for (const [w, d, x, z] of [[0.62, 0.01, 0, 0.16], [0.62, 0.01, 0, -0.16], [0.01, 0.32, 0.31, 0], [0.01, 0.32, -0.31, 0]]) box(w, 0.3, d, card, x, 0.15, z, g);
  for (const [s, rot] of [[-1, 0.9], [1, -0.7]]) { const f = box(0.62, 0.01, 0.16, card, 0, 0.3, s * 0.24, g); f.rotation.x = s * rot; f.position.z = s * (0.16 + 0.07); f.position.y = 0.33; }
  const band = canvasT(512, 128, (x, w, h) => { x.fillStyle = '#f2f0e8'; x.fillRect(0, 0, w, h); x.fillStyle = '#c81e28'; x.fillRect(0, 30, w, 70); x.fillStyle = '#fff'; fitText(x, 'FREE RANGE', w * 0.3, 66, w * 0.5, 50, F.heavy); x.fillStyle = '#f2f0e8'; x.beginPath(); x.ellipse(w * 0.8, 64, 70, 46, 0, 0, 7); x.fill(); x.fillStyle = '#c81e28'; fitText(x, 'happy hen', w * 0.8, 66, 120, 30, F.script); });
  const top = std({ color: '#f2c83a', roughness: 0.7 });
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new RoundedBoxGeometry(0.29, 0.07, 0.11, 2, 0.015), [top, top, top, top, std({ map: band }), top]); c.position.set(-0.15 + (i % 2) * 0.3, 0.06 + Math.floor(i / 2) * 0.075, (i % 3 - 1) * 0.005); c.castShadow = true; g.add(c); }
  const lid = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.1), std({ map: band })); lid.rotation.x = -Math.PI / 2; lid.position.set(-0.15, 0.248, 0); g.add(lid);
  return g;
}
// ---- TV boxes -----------------------------------------------------------------------------------------------------
const TVS = { blue: ['#1e5ad8', 'NOVA', '43"', '4K smart TV'], red: ['#d81e1e', 'REDLINE', '55"', '4K UHD smart TV'], teal: ['#2ab8c8', 'CLEARWAVE', '50"', 'UHD 4K'] };
export function makeTVBox(design = 'blue') {
  const [bg, name, size, sub] = TVS[design];
  const front = canvasT(1024, 640, (x, w, h) => {
    x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,0.08)'; x.beginPath(); x.moveTo(0, h); x.lineTo(w * 0.5, 0); x.lineTo(w * 0.7, 0); x.lineTo(w * 0.2, h); x.fill();
    x.fillStyle = '#fff'; fitText(x, name, 180, 70, 300, 70, F.heavy, { spacing: 4 }); fitText(x, sub, 180, 130, 300, 30, F.label); x.font = `bold 84px ${F.heavy}`; x.textAlign = 'right'; x.fillText(size, w - 40, 110);
    // the TV on the box showing a made-up home screen
    x.fillStyle = '#111'; x.fillRect(330, 170, 620, 360); const sc = x.createLinearGradient(340, 180, 940, 520); sc.addColorStop(0, '#1a2a4a'); sc.addColorStop(1, '#4a2a5a'); x.fillStyle = sc; x.fillRect(340, 180, 600, 340);
    x.fillStyle = '#fff'; fitText(x, 'STARFALL  season 2', 480, 240, 260, 34, F.heavy); x.fillStyle = '#f2c21a'; x.fillRect(380, 270, 90, 26); x.fillStyle = '#111'; fitText(x, 'WATCH', 425, 284, 80, 18, F.label);
    for (let i = 0; i < 7; i++) { x.fillStyle = ['#e8402a', '#2a8ad0', '#3ab84a', '#f2c21a', '#9a4ad0', '#f08a2a', '#ffffff'][i]; x.fillRect(360 + i * 82, 440, 70, 44); }
    x.fillStyle = '#e8e8e8'; x.font = `16px ${F.small}`; x.textAlign = 'left'; ['• 4K ultra HD', '• smart streaming built in', '• voice remote', '• 3 HDMI ports'].forEach((t, i) => x.fillText(t, 40, 220 + i * 30));
    x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(320, 532, 640, 10);
  });
  const side = canvasT(256, 640, (x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.save(); x.translate(w / 2, h / 2); x.rotate(-Math.PI / 2); fitText(x, `${name}  ${size}`, 0, 0, h - 60, 70, F.heavy); x.restore(); });
  const sz = { blue: [1.1, 0.68, 0.14], red: [1.4, 0.88, 0.16], teal: [1.25, 0.8, 0.15] }[design];
  const g = new THREE.Group(); g.name = 'tv_box_' + design;
  const b = printedBox(sz[0], sz[1], sz[2], front, side, g); b.position.y = sz[1] / 2;
  for (const y of [0.25, 0.75]) box(sz[0] + 0.004, 0.02, sz[2] + 0.004, std({ color: '#e8e8e4', roughness: 0.5 }), 0, sz[1] * y, 0, g);   // strapping
  const hd = rbox(0.1, 0.03, 0.03, 0.01, std({ color: '#222' }), 0, sz[1] + 0.01, 0, g); void hd;
  g.userData.size = sz;
  return g;
}
// ---- egg-nog cooler -------------------------------------------------------------------------------------------------
export function makeNogCooler() {
  const g = new THREE.Group(); g.name = 'nog_cooler';
  const W = 2.4, H = 2.2, D = 0.85, blk = std({ color: '#1a1c1e', roughness: 0.4 });
  box(W, H, D, blk, 0, H / 2, -D / 2, g);
  const inside = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.1, H - 0.3), std({ color: '#f4f6f8', emissive: '#ffffff', emissiveIntensity: 0.25 })); inside.position.set(0, H / 2 + 0.05, -0.02); g.add(inside);
  const jug = canvasT(128, 160, (x, w, h) => { x.fillStyle = '#f2e6c0'; x.fillRect(0, 0, w, h); x.fillStyle = '#c81e28'; x.fillRect(0, 40, w, 60); x.fillStyle = '#fff'; fitText(x, 'NOG', w / 2, 72, w - 20, 40, F.heavy); x.fillStyle = '#2a7a3a'; fitText(x, 'holiday', w / 2, 120, w - 30, 20, F.script); });
  const crt = canvasT(128, 200, (x, w, h) => { x.fillStyle = '#f8f6ee'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a6a3a'; x.fillRect(0, 70, w, 70); x.fillStyle = '#fff'; fitText(x, 'EGG NOG', w / 2, 106, w - 16, 28, F.heavy); x.fillStyle = '#c81e28'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(20 + i * 22, 40, 7, 0, 7); x.fill(); } });
  const jm = std({ map: jug, roughness: 0.4 }), cm = std({ map: crt, roughness: 0.5 }), cap = std({ color: '#c81e28' });
  for (let row = 0; row < 4; row++) {
    const y = 0.25 + row * 0.48; box(W - 0.12, 0.02, D - 0.1, std({ color: '#c8ccd0', metalness: 0.6 }), 0, y - 0.01, -D / 2, g);
    for (let i = 0; i < 18; i++) { const x = -W / 2 + 0.15 + i * 0.125; if (row < 2) { const j = rbox(0.11, 0.2, 0.11, 0.025, jm, x, y + 0.1, -0.2, g); void j; cyl(0.02, 0.02, 0.03, cap, x, y + 0.215, -0.2, g, 10); } else { const c = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.08), cm); c.position.set(x, y + 0.1, -0.15); g.add(c); const tp = new THREE.Mesh(new THREE.ConeGeometry(0.057, 0.04, 4), cm); tp.rotation.y = Math.PI / 4; tp.position.set(x, y + 0.22, -0.15); g.add(tp); } }
  }
  // three glass doors with steel frames + handles, a lit header
  for (let i = 0; i < 3; i++) { const x = -W / 2 + (i + 0.5) * W / 3; plane(W / 3 - 0.06, H - 0.3, glassM(), x, H / 2 + 0.05, 0.03, 0, g); for (const s of [-1, 1]) box(0.04, H - 0.25, 0.05, std({ color: '#b8bcc0', metalness: 0.7 }), x + s * (W / 6 - 0.02), H / 2 + 0.05, 0.03, g); box(0.03, 0.5, 0.05, std({ color: '#d8dce0', metalness: 0.8 }), x + W / 6 - 0.12, 1.1, 0.07, g); }
  box(W, 0.2, 0.1, std({ color: '#222', emissive: '#ffffff', emissiveIntensity: 0.2 }), 0, H - 0.05, 0.02, g);
  g.userData.collider = [-W / 2, W / 2, -D, 0.1];
  return g;
}
// ---- pallet racking bay ------------------------------------------------------------------------------------------
export function makePalletBay() {
  const g = new THREE.Group(); g.name = 'pallet_bay';
  const W = 3.0, D = 1.2, H = 4.2, orange = std({ color: '#e8601a', roughness: 0.45, metalness: 0.3 }), blue = std({ color: '#2a5ad8', roughness: 0.4 });
  const holes = canvasT(32, 256, (x, w, h) => { x.fillStyle = '#3a8ad8'; x.fillRect(0, 0, w, h); x.fillStyle = '#123a6a'; for (let y = 6; y < h; y += 14) x.fillRect(12, y, 8, 6); }); holes.wrapS = holes.wrapT = THREE.RepeatWrapping; holes.repeat.set(1, 6);
  const upright = std({ map: holes, roughness: 0.4, metalness: 0.3 });
  for (const x of [-W / 2, W / 2]) for (const z of [-D / 2, D / 2]) box(0.08, H, 0.08, upright, x, H / 2, z, g);
  for (const x of [-W / 2, W / 2]) for (let k = 0; k < 6; k++) { const br = box(0.03, 0.03, D * 1.2, upright, x, 0.4 + k * 0.65, 0, g); br.rotation.x = k % 2 ? 0.5 : -0.5; }
  for (const y of [2.1, 3.9]) for (const z of [-D / 2, D / 2]) box(W, 0.12, 0.06, orange, 0, y, z, g);
  const wire = canvasT(64, 64, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#b8bcc0'; x.lineWidth = 3; for (let i = 0; i < 64; i += 12) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } }); wire.wrapS = wire.wrapT = THREE.RepeatWrapping; wire.repeat.set(W * 6, D * 6);
  for (const y of [2.17, 3.97]) { const deck = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ map: wire, transparent: true, alphaTest: 0.4, metalness: 0.6, side: THREE.DoubleSide })); deck.rotation.x = -Math.PI / 2; deck.position.y = y; g.add(deck); }
  plane(W, H, std({ map: tex('i4_ply', W / 1.6, H / 1.0), roughness: 0.8 }), 0, H / 2, -D / 2 - 0.05, 0, g);
  // floor level: two blue pallets with cases of cans + a stack of plain boxes
  const pallet = (x, z) => { const p = new THREE.Group(); p.position.set(x, 0, z); g.add(p); for (let i = 0; i < 7; i++) box(0.12, 0.02, 1.0, blue, -0.5 + i * 0.167, 0.13, 0, p); for (const zz of [-0.45, 0, 0.45]) box(1.1, 0.1, 0.1, blue, 0, 0.06, zz, p); return p; };
  const cs = canvasT(256, 128, (x, w, h) => { x.fillStyle = '#f2f2ee'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8402a'; x.fillRect(0, 0, w, 30); x.fillStyle = '#222'; fitText(x, 'SPARKLING WATER  ·  24 CANS', w / 2, 70, w - 20, 22, F.label); x.fillStyle = '#2a8ad0'; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(30 + i * 40, 106, 13, 0, 7); x.fill(); } });
  const caseM = std({ map: cs, roughness: 0.7 });
  const p1 = pallet(-0.7, 0.05); for (let i = 0; i < 12; i++) box(0.4, 0.14, 0.27, caseM, -0.3 + (i % 2) * 0.42, 0.21 + Math.floor(i / 4) * 0.145, -0.35 + (Math.floor(i / 2) % 2) * 0.3 + (i % 4 > 1 ? 0.0 : 0), p1);
  const p2 = pallet(0.65, 0.05); const pb = std({ map: tex('cardboard', 1, 1), color: '#c8a070', roughness: 0.9 }); for (let i = 0; i < 5; i++) box(0.35, 0.28, 0.4, pb, -0.25 + (i % 2) * 0.4, 0.28 + Math.floor(i / 2) * 0.29, -0.2, p2);
  const water = std({ color: '#2a6ad8', transparent: true, opacity: 0.85, roughness: 0.1 }); for (let i = 0; i < 4; i++) cyl(0.13, 0.13, 0.48, water, 0.35 + (i % 2) * 0.28, 0.38, 0.25 + Math.floor(i / 2) * 0.0, p2, 16);
  g.userData.collider = [-W / 2 - 0.05, W / 2 + 0.05, -D / 2 - 0.1, D / 2 + 0.05];
  return g;
}
export function makeSlatBin() {
  const g = new THREE.Group(); g.name = 'slat_bin'; const m = std({ color: '#2a2422', metalness: 0.5, roughness: 0.5 });
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; box(0.05, 0.85, 0.012, m, Math.cos(a) * 0.3, 0.45, Math.sin(a) * 0.3, g).rotation.y = -a + Math.PI / 2; }
  for (const y of [0.1, 0.5, 0.86]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.305, 0.015, 6, 32), m); r.rotation.x = Math.PI / 2; r.position.y = y; g.add(r); }
  const lid = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2), m); lid.scale.y = 0.25; lid.position.y = 0.88; g.add(lid);
  cyl(0.28, 0.28, 0.04, m, 0, 0.02, 0, g, 24);
  g.userData.collider = [-0.33, 0.33, -0.33, 0.33];
  return g;
}

// ---- the store ----------------------------------------------------------------------------------------------------
export function makeWarehouseStore() {
  const g = new THREE.Group(); g.name = 'warehouse_store';
  const W = 40, D = 30, H = 7.5, X0 = -W / 2, X1 = W / 2, Z0 = -D / 2, Z1 = D / 2;
  const red = std({ map: tex('i4_brick_red', W / 2.2, (H - 2) / 1.6), roughness: 0.9 }), tan = std({ map: tex('i4_brick_tan', W / 2.2, 1), roughness: 0.9 });
  const cols = [];
  // shell: front (+z) with the entrance; tan brick base band + red brick above, a cap; sides + back
  const wall = (len, x, z, ry) => { const w1 = new THREE.Group(); w1.position.set(x, 0, z); w1.rotation.y = ry; g.add(w1); box(len, 2.0, 0.35, tan, 0, 1.0, 0, w1).material = [tan, tan, tan, tan, std({ map: tex('i4_brick_tan', len / 2.2, 1) }), std({ map: tex('i4_brick_tan', len / 2.2, 1) })]; const up = box(len, H - 2.0, 0.35, red, 0, 2.0 + (H - 2.0) / 2, 0, w1); up.material = std({ map: tex('i4_brick_red', len / 2.2, (H - 2) / 1.6), roughness: 0.9 }); box(len + 0.1, 0.25, 0.5, std({ color: '#b8b4aa' }), 0, H + 0.12, 0, w1); return w1; };
  wall(W, 0, Z0, 0); wall(D, X0, 0, Math.PI / 2); wall(D, X1, 0, Math.PI / 2);
  wall(14, X0 + 7, Z1, 0); wall(14, X1 - 7, Z1, 0);
  box(12, H - 3.2, 0.35, red, 0, 3.2 + (H - 3.2) / 2, Z1, g);
  cols.push([X0 - 0.2, X1 + 0.2, Z0 - 0.2, Z0 + 0.2], [X0 - 0.2, X0 + 0.2, Z0, Z1], [X1 - 0.2, X1 + 0.2, Z0, Z1], [X0, -6, Z1 - 0.2, Z1 + 0.2], [6, X1, Z1 - 0.2, Z1 + 0.2]);
  // entrance: glass sliding doors under a steel canopy, the sign
  const gl = new THREE.MeshPhysicalMaterial({ color: '#c8d8e0', transparent: true, opacity: 0.2, roughness: 0.03, depthWrite: false, side: THREE.DoubleSide });
  plane(12, 3.2, gl, 0, 1.6, Z1, 0, g); for (const x of [-6, -3, 0, 3, 6]) box(0.08, 3.2, 0.12, std({ color: '#3a3c40', metalness: 0.6 }), x, 1.6, Z1, g);
  box(14, 0.3, 2.5, std({ color: '#3a3c40', metalness: 0.5 }), 0, 3.35, Z1 + 1.2, g);
  const sg = canvasT(1024, 256, (x, w, h) => { x.fillStyle = '#1e4ab8'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2c21a'; fitText(x, 'BULK BARN', w / 2, 110, w - 120, 150, F.heavy, { spacing: 8 }); x.fillStyle = '#fff'; fitText(x, 'members warehouse · groceries · electronics', w / 2, 210, w - 200, 34, F.label); });
  box(12, 2.6, 0.2, std({ map: sg, emissive: '#ffffff', emissiveMap: sg, emissiveIntensity: 0.5 }), 0, 5.2, Z1 + 0.25, g);
  // outside: a downpipe on the facade, the slatted bin next to it, a few pallets
  const dp = std({ color: '#a8b0b8', metalness: 0.5 }); box(0.12, H - 0.2, 0.1, dp, 8.0, H / 2, Z1 + 0.24, g); box(0.4, 0.12, 0.3, dp, 8.0, 0.12, Z1 + 0.4, g);
  const bin = makeSlatBin(); bin.position.set(9.0, 0, Z1 + 0.8); g.add(bin); cols.push([8.65, 9.35, Z1 + 0.45, Z1 + 1.15]);
  // interior floor, ceiling, lights
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ map: tex('lot_concrete', W / 4, D / 4), color: '#b8b6b0', roughness: 0.35 })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.01; fl.receiveShadow = true; g.add(fl);
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ color: '#3a3c40', metalness: 0.4 })); cl.rotation.x = Math.PI / 2; cl.position.y = H; g.add(cl);
  const lamp = std({ color: '#fff', emissive: '#f4f8ff', emissiveIntensity: 2 });
  for (let i = -3; i <= 3; i++) for (let j = -2; j <= 2; j++) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.3), lamp); l.position.set(i * 5.5, H - 0.4, j * 5.5); g.add(l); }
  for (const [x, z] of [[-10, -6], [10, -6], [-10, 6], [10, 6], [0, 0]]) { const p = new THREE.PointLight('#f4f8ff', 25, 22, 1.4); p.position.set(x, H - 1, z); g.add(p); }
  const put = (o, x, z, ry = 0) => { o.position.set(x, 0, z); o.rotation.y = ry; g.add(o); const c = o.userData.collider; if (c) { const q = Math.round(ry / (Math.PI / 2)) & 3; const [a, b, c0, c1] = c; let r; if (q === 0) r = [a, b, c0, c1]; else if (q === 2) r = [-b, -a, -c1, -c0]; else if (q === 1) r = [c0, c1, -b, -a]; else r = [-c1, -c0, a, b]; cols.push([x + r[0], x + r[1], z + r[2], z + r[3]]); } return o; };
  // back wall: a row of pallet bays
  for (let i = 0; i < 9; i++) put(makePalletBay(), X0 + 3 + i * 3.4, Z0 + 0.9);
  // right wall: egg-nog coolers
  put(makeNogCooler(), X1 - 0.5, -6, -Math.PI / 2); put(makeNogCooler(), X1 - 0.5, -3.5, -Math.PI / 2);
  // electronics corner (left): TV boxes on low steel shelving / a pallet, the console display table
  const shelf = std({ color: '#d8dade', metalness: 0.5, roughness: 0.4 });
  box(4.2, 0.08, 1.0, shelf, X0 + 3, 0.35, -2, g); for (const x of [-2, 2]) box(0.06, 0.35, 1.0, shelf, X0 + 3 + x, 0.175, -2, g); cols.push([X0 + 0.9, X0 + 5.1, -2.5, -1.5]);
  const tb = makeTVBox('blue'); tb.position.set(X0 + 1.9, 0.39, -2.1); g.add(tb); const tt = makeTVBox('teal'); tt.position.set(X0 + 4.2, 0.39, -2.1); g.add(tt);
  const pal = new THREE.Group(); pal.position.set(X0 + 3, 0, 1.5); g.add(pal); for (let i = 0; i < 7; i++) box(0.16, 0.02, 1.2, std({ color: '#2a2c30' }), -0.6 + i * 0.2, 0.13, 0, pal); for (const zz of [-0.5, 0, 0.5]) box(1.4, 0.1, 0.12, std({ color: '#2a2c30' }), 0, 0.06, zz, pal);
  const tr = makeTVBox('red'); tr.position.set(X0 + 3, 0.14, 1.5); g.add(tr); cols.push([X0 + 2.2, X0 + 3.8, 0.9, 2.1]);
  const ctab = new THREE.Group(); ctab.position.set(X0 + 3, 0, 5); g.add(ctab); box(1.6, 0.04, 0.8, std({ color: '#1a1a1c' }), 0, 0.9, 0, ctab); for (const s of [-1, 1]) box(0.05, 0.9, 0.7, std({ color: '#1a1a1c' }), s * 0.75, 0.45, 0, ctab);
  const cs = makeConsoleSetup(); cs.position.set(-0.2, 0.92, 0); ctab.add(cs); cols.push([X0 + 2.2, X0 + 3.8, 4.6, 5.4]);
  // soda shelf: a gondola of blue soda bottles with sale tags
  const gond = new THREE.Group(); gond.position.set(-6, 0, 2); g.add(gond); box(3.6, 1.6, 0.6, std({ color: '#e8e8e4' }), 0, 0.8, -0.3, gond);
  for (let k = 0; k < 3; k++) { box(3.5, 0.03, 0.5, shelf, 0, 0.45 + k * 0.45, 0.0, gond); for (let i = 0; i < 26; i++) { const b = makeSodaBottle(k === 1 && i % 5 === 0 ? '#f2c21a' : '#2a8ae0'); b.position.set(-1.65 + i * 0.13, 0.465 + k * 0.45, 0.05 + (i % 2) * 0.12); gond.add(b); } }
  const sale = canvasT(128, 128, (x, w, h) => { x.fillStyle = '#f2d21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#c81e28'; fitText(x, '2 / $3.00', w / 2, 52, w - 16, 34, F.heavy); x.fillRect(0, 90, w, 38); x.fillStyle = '#fff'; fitText(x, 'SALE', w / 2, 109, 90, 26, F.heavy); });
  for (const x of [-1, 0.5]) plane(0.1, 0.1, std({ map: sale }), x, 0.4, 0.26, 0, gond);
  cols.push([-7.85, -4.15, 1.4, 2.3]);
  // eggs: open boxes of cartons on a low pallet
  for (let i = 0; i < 3; i++) put(makeEggBox(), 2 + i * 0.7, -2.2, 0);
  // entrance wall: brochure holders by the door
  for (let i = 0; i < 2; i++) { const b = makeBrochureHolder(); b.position.set(-7 + i * 0.5, 1.4 - i * 0.45, Z1 - 0.25); b.rotation.y = Math.PI; g.add(b); }
  // long runs of steel warehouse shelving stocked with cases (bulk goods with made-up printing)
  const goods = (seed) => canvasT(512, 256, (x, w, h) => { const r = rng(seed); x.fillStyle = '#e8e6e0'; x.fillRect(0, 0, w, h);
    for (let row = 0; row < 2; row++) { let px = 4; while (px < w - 10) { const bw = 50 + r() * 70, bh = 60 + r() * 50, c = ['#c8a070', '#e8402a', '#2a8ad0', '#f2c21a', '#3ab84a', '#ffffff', '#7a4ad0', '#f08a2a'][Math.floor(r() * 8)]; x.fillStyle = c; x.fillRect(px, row * 128 + 124 - bh, bw - 4, bh); if (c !== '#c8a070') { x.fillStyle = 'rgba(255,255,255,0.7)'; x.fillRect(px + 6, row * 128 + 130 - bh, bw - 16, 10); } else { x.fillStyle = 'rgba(60,40,20,0.5)'; x.fillRect(px, row * 128 + 124 - bh / 2, bw - 4, 4); } px += bw; } } });
  for (const [z, seed] of [[-8.5, 1], [-5.0, 2], [6.0, 3], [9.5, 4]]) {
    const run = new THREE.Group(); run.position.set(-3, 0, z); g.add(run); const L = 16;
    for (let k = 0; k < 4; k++) { box(L, 0.04, 1.1, shelf, 0, 0.15 + k * 0.62, 0, run); const gm = std({ map: goods(seed * 10 + k), roughness: 0.7 }); gm.map.wrapS = THREE.RepeatWrapping; gm.map.repeat.set(L / 3, 1); if (k < 3) for (const sd of [-1, 1]) { const f = plane(L - 0.1, 0.56, gm, 0, 0.45 + k * 0.62, sd * 0.4, sd > 0 ? 0 : Math.PI, run); void f; } }
    for (let x = -L / 2; x <= L / 2 + 0.01; x += L / 4) for (const sd of [-1, 1]) box(0.06, 2.6, 0.06, std({ color: '#2a5ad8', metalness: 0.3 }), x, 1.3, sd * 0.53, run);
    box(0.1, 1.9, 0.9, std({ color: '#c8a070', roughness: 0.9 }), 0, 0.95, 0, run);   // centre spine of stacked cases
    cols.push([-3 - L / 2 - 0.1, -3 + L / 2 + 0.1, z - 0.6, z + 0.6]);
    const aisle = canvasT(256, 128, (x, w, h) => { x.fillStyle = '#1e4ab8'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2c21a'; fitText(x, `AISLE ${seed}`, w / 2, 44, w - 30, 46, F.heavy); x.fillStyle = '#fff'; fitText(x, ['paper · cleaning', 'snacks · drinks', 'pantry · canned', 'home · seasonal'][seed - 1], w / 2, 98, w - 30, 26, F.label); });
    const hs = plane(1.4, 0.7, std({ map: aisle, side: THREE.DoubleSide }), -3 + L / 2 + 0.2, 4.2, z, Math.PI / 2, g); void hs;
  }
  // break table near the entrance with the food from this batch
  const brk = new THREE.Group(); brk.position.set(10, 0, 9); g.add(brk);
  box(1.8, 0.05, 0.9, std({ color: '#e8e4dc' }), 0, 0.74, 0, brk); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.05, 0.74, 0.05, std({ color: '#5a5c60', metalness: 0.5 }), sx * 0.82, 0.37, sz * 0.38, brk);
  const food = [[makeDonutBox(), -0.55, 0.05, 0.3], [makeMiniPie(), 0.05, -0.2, 0], [makeMiniPie(), 0.25, -0.12, 0], [makeTortillaPizza(), 0.25, 0.18, 0.2], [makeNoodleCup(), -0.15, 0.25, 0], [makeCurryRice(), 0.65, -0.15, 0]];
  food.forEach(([o, x, z, ry]) => { o.position.set(x, 0.765, z); o.rotation.y = ry; brk.add(o); });
  cols.push([9.05, 10.95, 8.5, 9.5]);
  g.userData.colliders = cols;
  g.userData.areas = [{ minX: X0 + 0.3, maxX: X1 - 0.3, minZ: Z0 + 0.3, maxZ: Z1 - 0.25 }, { minX: -5.9, maxX: 5.9, minZ: Z1 - 0.4, maxZ: Z1 + 2.5 }];
  return g;
}
