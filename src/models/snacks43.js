// Snacks (queue item 43, photos/food/snack-pile-chevron-blanket, shelf-clearance-tag, coconut-drink-can-candy).
// Every brand, character and price is invented; the blanket's weave is the photo's own.
//   makeChipBag(design)   crinkly pillow bag (sealed crimps top + bottom, puffed body, random crinkles)
//   makeSnackBox(kind)    'curry' roux box, 'wafer' bar, 'sticks' shelf box
//   makeSodaCan(kind)     'fruit' 355 ml can, 'coco' tall slim coconut-jelly can with spoon art
//   makeCandyPouch()      red fruit-candy pouch with a cartoon fruit band
//   makeSnackPile()       the blanket with the pile on it (like the photo)
//   makeShelfEdge(len)    store shelf front: a grey rail with a blue label strip, a yellow clearance tag,
//                         snack boxes standing above and bags hanging on peg hooks below
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
function tex(name, rx = 1, ry = 1) { const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t; }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.5, ...o }); }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const outline = (x, t, cx, cy, mw, sz, font, fill, stroke, lw, o = {}) => { x.lineJoin = 'round'; x.strokeStyle = stroke; x.lineWidth = lw; x.fillStyle = fill; fitText(x, t, cx, cy, mw, sz, font, { ...o, stroke: 1 }); };

// ---- bag art (front, back shares the colour field)
const BAGS = {
  // gold foil airline-style snack pack (photos/storage/snack-pack-gold): ornate damask on gold, a bowl of peas,
  // crackers and puffs, the made-up name in navy
  peas: (x, w, h) => { const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#c89a2a'); g.addColorStop(0.5, '#e8c45a'); g.addColorStop(1, '#a8781a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(120,80,10,0.35)'; x.lineWidth = 3; for (let i = 0; i < 7; i++) for (let j = 0; j < 9; j++) { const cx = 30 + i * 60, cy = 30 + j * 70; x.beginPath(); x.ellipse(cx, cy, 18, 26, 0, 0, 7); x.stroke(); x.beginPath(); x.moveTo(cx - 18, cy); x.quadraticCurveTo(cx, cy - 40, cx + 18, cy); x.stroke(); }
    x.fillStyle = 'rgba(255,240,200,0.5)'; x.beginPath(); x.ellipse(200, 220, 150, 70, 0, 0, 7); x.fill();
    [['#e8a02a', 120, 210, 34], ['#f2c84a', 170, 190, 30], ['#7ab83a', 215, 225, 18], ['#8ac84a', 240, 205, 16], ['#e8b85a', 270, 190, 28], ['#d8702a', 300, 220, 26], ['#f0d890', 160, 240, 22], ['#7ab83a', 200, 250, 15]].forEach(([c, cx, cy, rr]) => { x.fillStyle = c; x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,0.35)'; x.beginPath(); x.arc(cx - rr * 0.3, cy - rr * 0.3, rr * 0.3, 0, 7); x.fill(); });
    x.fillStyle = '#1e2a6a'; fitText(x, 'PEAS &', w / 2, 360, w - 60, 70, F.heavy); fitText(x, 'CRISPS', w / 2, 430, w - 50, 80, F.heavy);
    x.fillStyle = '#1e2a6a'; x.beginPath(); x.moveTo(w - 70, h - 110); x.quadraticCurveTo(w - 30, h - 140, w - 40, h - 80); x.quadraticCurveTo(w - 60, h - 100, w - 70, h - 110); x.fill(); },
  pizza: (x, w, h) => { x.fillStyle = '#f2c21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#c81e28'; x.fillRect(0, 0, w, 70); x.fillStyle = '#fff'; fitText(x, 'POTATO CHIPS', w / 2, 36, w - 40, 32, F.label, { spacing: 4 }); outline(x, 'ピザポテ', w / 2, 150, w - 30, 92, F.antique, '#c81e28', '#fff', 10);
    for (let i = 0; i < 9; i++) { x.fillStyle = '#e8b04a'; x.beginPath(); x.ellipse(70 + (i % 3) * 110, 290 + Math.floor(i / 3) * 80, 52, 34, i, 0, 7); x.fill(); x.fillStyle = '#c84a2a'; x.beginPath(); x.arc(70 + (i % 3) * 110, 290 + Math.floor(i / 3) * 80, 9, 0, 7); x.fill(); }
    x.fillStyle = '#c81e28'; fitText(x, 'PIZZA FLAVOUR', w / 2, h - 40, w - 60, 34, F.heavy); },
  bbq: (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1d3a9a'); g.addColorStop(1, '#2a6ad8'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#fff'; x.beginPath(); x.arc(w / 2, 120, 80, 0, 7); x.fill(); x.fillStyle = '#c81e28'; x.beginPath(); x.arc(w / 2, 120, 70, 0, 7); x.fill();
    x.fillStyle = '#f6d0a8'; x.beginPath(); x.arc(w / 2, 130, 40, 0, 7); x.fill(); x.fillStyle = '#111'; x.fillRect(w / 2 - 50, 80, 100, 16); x.fillRect(w / 2 - 30, 60, 60, 24); x.beginPath(); x.arc(w / 2 - 14, 128, 5, 0, 7); x.arc(w / 2 + 14, 128, 5, 0, 7); x.fill();
    x.fillStyle = '#ffe03a'; x.fillRect(0, 230, w, 170); outline(x, 'BBQ', w / 2, 280, w - 60, 90, F.slab, '#2a1a10', '#ffe03a', 4); outline(x, 'TWISTS', w / 2, 360, w - 60, 80, F.slab, '#2a1a10', '#ffe03a', 4);
    x.fillStyle = '#fff'; fitText(x, 'CORN & POTATO SNACK', w / 2, 440, w - 40, 28, F.label, { spacing: 2 }); x.fillStyle = '#e8b04a'; for (let i = 0; i < 6; i++) { x.beginPath(); x.ellipse(60 + i * 60, 520, 12, 40, 0.6, 0, 7); x.fill(); } },
  takoyaki: (x, w, h) => { x.fillStyle = '#2a4ad8'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffe03a'; fitText(x, 'Tako Balls', w / 2, 80, w - 40, 72, F.bubbly);
    for (let i = 0; i < 7; i++) { const g = x.createRadialGradient(100 + (i % 3) * 100 - 12, 230 + Math.floor(i / 3) * 90 - 12, 4, 100 + (i % 3) * 100, 230 + Math.floor(i / 3) * 90, 46); g.addColorStop(0, '#f6c870'); g.addColorStop(1, '#a8682a'); x.fillStyle = g; x.beginPath(); x.arc(100 + (i % 3) * 100, 230 + Math.floor(i / 3) * 90, 44, 0, 7); x.fill(); x.fillStyle = '#5a2a10'; x.fillRect(80 + (i % 3) * 100, 215 + Math.floor(i / 3) * 90, 40, 6); }
    x.fillStyle = '#fff'; fitText(x, 'SAUCE & MAYO FLAVOUR', w / 2, h - 50, w - 40, 30, F.label); },
  choco: (x, w, h) => { x.fillStyle = '#f2c21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#5a2a10'; fitText(x, 'COCOA', w / 2, 80, w - 40, 70, F.heavy, { spacing: 4 }); fitText(x, 'BITES', w / 2, 150, w - 40, 60, F.heavy, { spacing: 4 });
    for (let i = 0; i < 5; i++) { x.fillStyle = '#6a3a1a'; x.beginPath(); x.roundRect(40 + i * 66, 240, 56, 56, 10); x.fill(); x.fillStyle = '#8a5a2a'; x.fillRect(48 + i * 66, 248, 40, 8); } },
};
let _crinkle = null;
function crinkleNormal() {
  if (_crinkle) return _crinkle;
  _crinkle = canvasT(256, 256, (x) => { x.fillStyle = 'rgb(128,128,255)'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 140; i++) { const a = Math.random() * Math.PI, l = 20 + Math.random() * 70, cx = Math.random() * 256, cy = Math.random() * 256; x.strokeStyle = `rgb(${128 + Math.cos(a + 1.57) * 90},${128 + Math.sin(a + 1.57) * 90},230)`; x.lineWidth = 2 + Math.random() * 3; x.beginPath(); x.moveTo(cx - Math.cos(a) * l, cy - Math.sin(a) * l); x.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l); x.stroke(); } });
  _crinkle.colorSpace = THREE.NoColorSpace; return _crinkle;
}
export function makeChipBag(design = 'bbq', w = 0.2, h = 0.28, seed = 1) {
  const r = rng(seed * 97 + 3);
  const geo = new THREE.PlaneGeometry(w, h, 20, 28), p = geo.attributes.position;
  const front = [], pos = [], uv = [], idx = [];
  // puffed pillow: two sheets joined at the edges, thickness peaks in the middle, flat crimped seals top + bottom
  for (const side of [1, -1]) for (let i = 0; i < p.count; i++) {
    const u = Math.min(1, Math.max(0, p.getX(i) / w + 0.5)), v = Math.min(1, Math.max(0, p.getY(i) / h + 0.5));
    const seal = v < 0.07 || v > 0.93;
    const puff = seal ? 0 : Math.max(0, Math.sin(Math.PI * u)) ** 0.6 * Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (v - 0.07) / 0.86)))) ** 0.5;
    const cr = 0.004 * Math.sin(u * 37 + side * 2 + r() * 0.5) * Math.cos(v * 29);
    const pinch = seal ? 0 : 1 - 0.12 * Math.sin(Math.PI * u) * (Math.abs(v - 0.5) * 2);
    pos.push(p.getX(i) * pinch, p.getY(i), side * (puff * w * 0.18 + cr * puff)); uv.push(side > 0 ? u : 1 - u, v);
  }
  const n = p.count, ix = geo.index.array;
  for (let k = 0; k < ix.length; k += 3) { idx.push(ix[k], ix[k + 1], ix[k + 2]); idx.push(n + ix[k], n + ix[k + 2], n + ix[k + 1]); }
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); bg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); bg.setIndex(idx); bg.computeVertexNormals();
  const art = canvasT(400, 600, (x, W, H) => { BAGS[design](x, W, H); x.fillStyle = 'rgba(255,255,255,0.18)'; for (let i = 0; i < 8; i++) x.fillRect(0, i * 4, W, 2); for (let i = 0; i < 8; i++) x.fillRect(0, H - i * 4, W, 2); });
  const m = new THREE.Mesh(bg, std({ map: art, normalMap: crinkleNormal(), normalScale: new THREE.Vector2(0.5, 0.5), roughness: 0.25, metalness: 0.35, side: THREE.DoubleSide }));
  m.castShadow = true; void front; return m;
}
export function makeSnackBox(kind = 'curry') {
  const S = { curry: [0.17, 0.11, 0.035], wafer: [0.04, 0.2, 0.025], sticks: [0.2, 0.24, 0.08] }[kind];
  const art = canvasT(512, 512, (x, w, h) => {
    if (kind === 'curry') { x.fillStyle = '#c81e28'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; x.fillRect(0, 0, w, 80); x.fillStyle = '#f2c21a'; fitText(x, 'GOLDEN SPOON', w / 2, 200, w - 60, 90, F.slab, { spacing: 2 }); fitText(x, 'CURRY', w / 2, 300, w - 120, 110, F.slab, { spacing: 6 }); x.fillStyle = '#fff'; fitText(x, 'JAPANESE CURRY SAUCE MIX · MEDIUM HOT', w / 2, 420, w - 40, 30, F.label); x.fillStyle = '#f2c21a'; x.beginPath(); x.arc(70, 40, 26, 0, 7); x.fill(); }
    else if (kind === 'wafer') { x.fillStyle = '#2a6ad8'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.save(); x.translate(w / 2, h / 2); x.rotate(-Math.PI / 2); fitText(x, 'WAFER', 0, -60, h - 60, 120, F.retro, { spacing: 6 }); x.fillStyle = '#f2c21a'; fitText(x, 'vanilla crème', 0, 70, h - 120, 60, F.script); x.restore(); for (let i = 0; i < 12; i++) { x.fillStyle = i % 2 ? '#e8c890' : '#d8a860'; x.fillRect(380, i * 42, 120, 38); } }
    else { const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#6a2aa8'); g.addColorStop(1, '#3a1a6a'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = '#ff5a1a'; x.beginPath(); x.moveTo(w / 2, 40); x.lineTo(w / 2 + 120, 200); x.lineTo(w / 2 - 120, 200); x.fill(); outline(x, 'CRUNCHERS', w / 2, 260, w - 40, 80, F.heavy, '#fff', '#c81e28', 8); x.fillStyle = '#fff'; fitText(x, 'SWEET CHILI', w / 2, 350, w - 80, 56, F.heavy); x.fillStyle = '#c81e28'; x.fillRect(0, h - 90, w, 90); x.fillStyle = '#fff'; fitText(x, 'MEAT STICKS', w / 2, h - 45, w - 60, 52, F.heavy, { spacing: 4 }); }
  });
  const side = std({ color: kind === 'curry' ? '#a8141e' : kind === 'wafer' ? '#2a6ad8' : '#4a1a8a', roughness: 0.4 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(...S), [side, side, side, side, std({ map: art, roughness: 0.4 }), side]); m.castShadow = true; m.name = 'snack_box_' + kind; return m;
}
export function makeSodaCan(kind = 'fruit') {
  const tall = kind === 'coco', R = tall ? 0.027 : 0.033, H = tall ? 0.15 : 0.122;
  const art = canvasT(512, 512, (x, w, h) => {
    if (tall) { x.fillStyle = '#3ac0e8'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; for (let i = 0; i < 20; i++) x.fillRect(Math.random() * w, Math.random() * 240, 14, 14);
      outline(x, '코코젤리', w / 4, 120, w / 2 - 20, 90, F.heavy, '#ff8a2a', '#fff', 8); x.fillStyle = '#6a3a1a'; x.beginPath(); x.arc(w / 4, 340, 90, 0, Math.PI); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(w / 4, 340, 90, 30, 0, 0, 7); x.fill(); x.strokeStyle = '#c8a070'; x.lineWidth = 10; x.beginPath(); x.moveTo(w / 4 + 40, 320); x.lineTo(w / 4 + 140, 220); x.stroke();
      x.fillStyle = '#1d6a9a'; fitText(x, 'COCONUT JELLY DRINK', w / 4, 460, w / 2 - 20, 24, F.label); x.drawImage(x.canvas, 0, 0, w / 2, h, w / 2, 0, w / 2, h); }
    else { x.fillStyle = '#c81e28'; x.fillRect(0, 0, w, h); for (let i = 0; i < 18; i++) { x.fillStyle = ['#ff5a8a', '#ffb02a', '#7a1a5a'][i % 3]; x.beginPath(); x.arc(Math.random() * w, Math.random() * h, 14 + Math.random() * 20, 0, 7); x.fill(); } outline(x, 'Fizzy', w / 4, h / 2, w / 2 - 30, 90, F.script, '#fff', '#7a0a14', 8); outline(x, 'Fizzy', w * 0.75, h / 2, w / 2 - 30, 90, F.script, '#fff', '#7a0a14', 8); x.fillStyle = '#fff'; fitText(x, 'MIXED BERRY SODA', w / 2, h - 40, w - 40, 26, F.label); }
  });
  const g = new THREE.Group(); g.name = 'can_' + kind;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H - 0.012, 32, 1, true), std({ map: art, metalness: 0.4, roughness: 0.3 })); body.position.y = H / 2; body.castShadow = true; g.add(body);
  const al = std({ color: '#c8ccd0', metalness: 0.85, roughness: 0.3 });
  const top = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.86, R, 0.008, 32), al); top.position.y = H - 0.004; g.add(top);
  const bot = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.86, 0.006, 32), al); bot.position.y = 0.003; g.add(bot);
  const tab = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.001, 0.02), al); tab.position.set(0, H + 0.0005, -0.004); g.add(tab);
  return g;
}
export function makeCandyPouch() {
  const art = canvasT(300, 500, (x, w, h) => { x.fillStyle = '#e81e2a'; x.fillRect(0, 0, w, h);
    x.save(); x.translate(w / 2, h / 2); x.rotate(-0.3); x.fillStyle = '#ffd040'; x.strokeStyle = '#6a0a10'; x.lineWidth = 8; fitText(x, 'FRUTI', 0, -30, w - 20, 110, F.retro, { stroke: 1 }); fitText(x, 'POPS', 0, 80, w - 40, 100, F.retro, { stroke: 1 }); x.restore();
    const fr = [['#ff8a2a', 70, 70], ['#8ad02a', 210, 60], ['#c82a8a', 230, 430], ['#ffd02a', 60, 440]];
    for (const [c, fx, fy] of fr) { x.fillStyle = c; x.beginPath(); x.arc(fx, fy, 36, 0, 7); x.fill(); x.fillStyle = '#111'; x.beginPath(); x.arc(fx - 10, fy - 4, 5, 0, 7); x.arc(fx + 10, fy - 4, 5, 0, 7); x.fill(); x.strokeStyle = '#111'; x.lineWidth = 3; x.beginPath(); x.arc(fx, fy + 6, 10, 0.2, Math.PI - 0.2); x.stroke(); } });
  const m = makeChipBag('bbq', 0.11, 0.19, 9); m.material = std({ map: art, normalMap: crinkleNormal(), normalScale: new THREE.Vector2(0.4, 0.4), roughness: 0.25, metalness: 0.35, side: THREE.DoubleSide }); m.scale.z = 0.5; m.name = 'candy_pouch'; return m;
}
export function makeSnackPile() {
  const g = new THREE.Group(); g.name = 'snack_pile';
  // the woven blanket, draped with soft folds
  const bl = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9, 30, 24), std({ map: tex('sn_chevron', 3, 1.6), roughness: 0.9 }));
  const bp = bl.geometry.attributes.position; for (let i = 0; i < bp.count; i++) bp.setZ(i, 0.015 * Math.sin(bp.getX(i) * 8) * Math.cos(bp.getY(i) * 6) + 0.02 * Math.max(0, Math.abs(bp.getX(i)) - 0.45) * 8);
  bl.geometry.computeVertexNormals(); bl.rotation.x = -Math.PI / 2; bl.position.y = 0.01; bl.receiveShadow = true; g.add(bl);
  const lay = (o, x, y, z, rx, ry, rz) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); g.add(o); };
  lay(makeChipBag('pizza', 0.22, 0.3, 1), -0.12, 0.05, -0.25, -1.45, 0.2, 0.3);
  lay(makeChipBag('bbq', 0.2, 0.28, 2), -0.02, 0.08, -0.05, -1.3, 0.1, -0.15);
  lay(makeChipBag('takoyaki', 0.19, 0.27, 3), 0.15, 0.06, -0.1, -1.4, -0.2, 0.25);
  lay(makeChipBag('choco', 0.15, 0.13, 4), 0.12, 0.04, 0.12, -1.55, 0, 0.1);
  const cb = makeSnackBox('curry'); lay(cb, -0.25, 0.02, 0.0, -Math.PI / 2, 0, 0.15);
  const wf1 = makeSnackBox('wafer'); lay(wf1, -0.18, 0.015, 0.2, -Math.PI / 2, 0, 0.6);
  const wf2 = makeSnackBox('wafer'); lay(wf2, -0.08, 0.02, 0.22, -Math.PI / 2, 0, 0.4);
  const can = makeSodaCan('fruit'); can.rotation.z = Math.PI / 2; can.rotation.y = 0.4; can.position.set(0.0, 0.035, 0.24); g.add(can);
  return g;
}
export function makeShelfEdge(len = 1.2) {
  const g = new THREE.Group(); g.name = 'shelf_edge';
  const grey = std({ color: '#c8ccd0', metalness: 0.4, roughness: 0.4 });
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(len, 0.03, 0.45), std({ color: '#e8eaec', roughness: 0.5 })); shelf.position.set(0, 0, -0.22); g.add(shelf);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.045, 0.02), grey); rail.position.set(0, -0.005, 0.01); g.add(rail);
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.036), std({ color: '#3a8ad8', roughness: 0.4 })); strip.position.set(0, -0.005, 0.021); g.add(strip);
  // the yellow clearance tag (made-up layout + store mark)
  const tag = canvasT(512, 160, (x, w, h) => {
    x.fillStyle = '#ffe23a'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2a21a'; x.fillRect(0, 0, 70, h);
    x.save(); x.translate(35, h / 2); x.rotate(-Math.PI / 2); x.fillStyle = '#1d4a9a'; fitText(x, 'Clearance', 0, 0, h - 20, 26, F.label); x.restore();
    x.fillStyle = '#f2a21a'; x.fillRect(80, 10, 120, 80); x.fillStyle = '#111'; fitText(x, 'UNIT PRICE', 140, 22, 110, 14, F.small); fitText(x, '$7.48', 140, 56, 110, 40, F.condensed); fitText(x, 'PER LB', 140, 82, 100, 14, F.small);
    x.fillStyle = '#111'; fitText(x, 'WAS', 110, 108, 60, 18, F.small); fitText(x, '$1.37', 140, 136, 110, 32, F.condensed);
    fitText(x, 'SALE PRICE', 330, 22, 160, 16, F.small); fitText(x, '50¢', 320, 80, 200, 96, F.condensed);
    x.font = `14px ${F.small}`; x.textAlign = 'left'; x.fillText('MEAT STX 3CT CHILI', 230, 128);
    for (let i = 0; i < 60; i++) x.fillRect(230 + i * 4, 136, i % 3 ? 2 : 3, 18);
  });
  const tg = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.0625), std({ map: tag, roughness: 0.6 })); tg.position.set(0.05, -0.008, 0.022); g.add(tg);
  // boxes standing on the shelf, bags hanging on peg hooks below
  for (let i = 0; i < 3; i++) { const b = makeSnackBox('sticks'); b.position.set(-0.4 + i * 0.32, 0.135, -0.12); g.add(b); }
  for (let i = 0; i < 5; i++) {
    const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.2, 6), grey); hook.rotation.x = Math.PI / 2; hook.position.set(-0.45 + i * 0.22, -0.06, -0.08); g.add(hook);
    for (let k = 0; k < 3; k++) { const bag = makeChipBag(k % 2 ? 'choco' : 'pizza', 0.13, 0.18, i * 5 + k); bag.position.set(-0.45 + i * 0.22, -0.16, -0.02 - k * 0.05); bag.scale.z = 0.4; g.add(bag); }
  }
  return g;
}
