// Misc 3 (queue item 67, photos/misc3/). Modelled; surfaces from the canal photo (tools/tex_67.py: mossy gravel path,
// ribbed channel wall, shallow water). Made-up names, text, items and prices.
//   makeStorySign()     park story sign: a purple wood-grain panel between two speckled stone posts, a steel title
//                       plate, an original drawn illustration under acrylic on four standoff bolts, an engraved steel
//                       text plate
//   makeCanalPark()     a dry canal walkway 24 x 24 m (x -12..12 along the canal, z -12..12, street at +z): mossy gravel
//                       walk with red brick edging, grass verge, a shallow channel with ribbed concrete walls and a
//                       little water, a wooden plank footbridge, the far bank path, a concrete flood wall with a
//                       railing, an elevated road deck overhead on round piers, the story sign
//   makeReceipt(kind)   'mart' | 'dollar': a curled thermal-paper receipt
//   makeRiceballPack()  a frozen grilled rice-ball pack (2 pieces) with a made-up name
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.7, ...o }); }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function flat(w, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }

// ---- story sign -------------------------------------------------------------------------------------------------
export function makeStorySign() {
  const g = new THREE.Group(); g.name = 'story_sign';
  const W = 1.5, H = 2.1;
  const purple = canvasT(256, 512, (x, w, h) => { x.fillStyle = '#7a2a6a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { x.strokeStyle = `rgba(${Math.random() < 0.5 ? '40,10,40' : '170,90,160'},${0.15 + Math.random() * 0.25})`; x.lineWidth = 1 + Math.random() * 3; x.beginPath(); const px = Math.random() * w; x.moveTo(px, 0); x.bezierCurveTo(px + 10, h * 0.3, px - 10, h * 0.6, px + 4, h); x.stroke(); } });
  const speck = canvasT(128, 128, (x, w, h) => { x.fillStyle = '#c8c4bc'; x.fillRect(0, 0, w, h); for (let i = 0; i < 600; i++) { x.fillStyle = ['#5a5650', '#8a8478', '#e8e4dc', '#3a3632'][i % 4]; x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2.5, 1 + Math.random() * 2.5); } });
  speck.wrapS = speck.wrapT = THREE.RepeatWrapping; speck.repeat.set(1, 4);
  const stone = std({ map: speck, roughness: 0.85 });
  for (const s of [-1, 1]) { box(0.2, H + 0.3, 0.2, stone, s * (W / 2 + 0.1), (H + 0.3) / 2, 0, g); box(0.24, 0.06, 0.24, stone, s * (W / 2 + 0.1), H + 0.33, 0, g); }
  box(W, H - 0.25, 0.06, std({ map: purple, roughness: 0.6 }), 0, 0.25 + (H - 0.25) / 2, 0, g);
  const steel = std({ color: '#c8ccd0', metalness: 0.7, roughness: 0.35 });
  // title plate
  const title = canvasT(768, 96, (x, w, h) => { x.fillStyle = '#e8eaec'; x.fillRect(0, 0, w, h); x.fillStyle = '#1a1a1a'; fitText(x, 'THE STONE OF THE WAVE-CALMING BRIDE', w / 2, 52, w - 40, 44, F.engraved, { spacing: 2 }); });
  box(W - 0.1, 0.13, 0.015, steel, 0, H - 0.12, 0.04, g); plane(W - 0.12, 0.11, std({ map: title, metalness: 0.4, roughness: 0.35 }), 0, H - 0.12, 0.0485, 0, g);
  // illustration under acrylic on standoff bolts: an original drawing of a storm wave over a small boat
  const art = canvasT(800, 560, (x, w, h) => {
    x.fillStyle = '#f2ecd8'; x.fillRect(0, 0, w, h);
    const sky = x.createLinearGradient(0, 0, 0, h * 0.5); sky.addColorStop(0, '#d8d2c0'); sky.addColorStop(1, '#efe8d4'); x.fillStyle = sky; x.fillRect(0, 0, w, h * 0.5);
    // the great wave: layered blue curls with white foam claws
    for (let k = 0; k < 4; k++) { x.fillStyle = ['#1e4a8a', '#2a6ab8', '#4a8ad0', '#8ab8e0'][k]; x.beginPath(); x.moveTo(0, h * (0.42 + k * 0.08)); for (let i = 0; i <= 20; i++) { const px = i / 20 * w; x.lineTo(px, h * (0.42 + k * 0.08) - Math.sin(i / 20 * Math.PI * 1.2 + k) * (110 - k * 20) - (i < 8 ? i * 12 : 96 - (i - 8) * 6)); } x.lineTo(w, h); x.lineTo(0, h); x.fill(); }
    x.strokeStyle = '#ffffff'; x.lineWidth = 4; for (let i = 0; i < 40; i++) { const px = 60 + i * 14, py = h * 0.22 + Math.sin(i * 0.5) * 30; x.beginPath(); x.arc(px, py, 10 + (i % 3) * 3, Math.PI, Math.PI * 1.8); x.stroke(); }
    // the boat: a long wooden hull, five tiny drawn figures, one at the bow reaching out
    x.fillStyle = '#c89a5a'; x.beginPath(); x.moveTo(330, 390); x.lineTo(690, 330); x.lineTo(660, 380); x.lineTo(360, 430); x.closePath(); x.fill(); x.strokeStyle = '#5a3a1a'; x.lineWidth = 3; x.stroke();
    const people = [[400, 382, '#c81e28'], [460, 372, '#2a6a3a'], [520, 362, '#d8b040'], [580, 350, '#1a3a8a'], [640, 330, '#f2f2ec']];
    people.forEach(([px, py, c]) => { x.fillStyle = c; x.beginPath(); x.moveTo(px - 12, py); x.lineTo(px + 12, py); x.lineTo(px + 6, py - 34); x.lineTo(px - 6, py - 34); x.fill(); x.fillStyle = '#f0d8b8'; x.beginPath(); x.arc(px, py - 42, 9, 0, 7); x.fill(); x.fillStyle = '#1a1a1a'; x.beginPath(); x.arc(px, py - 46, 9, Math.PI, 0); x.fill(); });
    x.strokeStyle = '#f2f2ec'; x.lineWidth = 6; x.beginPath(); x.moveTo(640, 310); x.lineTo(700, 280); x.stroke();
    x.strokeStyle = '#5a4a3a'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6);
  });
  plane(1.04, 0.73, std({ map: art, roughness: 0.6 }), 0, 1.45, 0.034, 0, g);
  box(1.12, 0.81, 0.012, new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.12, roughness: 0.03, clearcoat: 1, depthWrite: false }), 0, 1.45, 0.06, g);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const b = cyl(0.016, 0.016, 0.035, steel, sx * 0.53, 1.45 + sy * 0.38, 0.05, g, 16); b.rotation.x = Math.PI / 2; }
  // engraved text plate
  const txt = canvasT(640, 420, (x, w, h) => { x.fillStyle = '#d8dadc'; x.fillRect(0, 0, w, h); x.fillStyle = '#1a1a1a'; fitText(x, 'ORIGIN', 60, 34, 120, 26, F.engraved);
    const lines = ['Long ago a prince and his company crossed this bay', 'by boat when a terrible storm rose. The waves', 'grew higher than the mast. To calm the sea his', 'bride stepped into the water, and the storm', 'passed. The boat came safely to shore.', 'Her comb washed up on this beach, and the', 'people raised a stone mound to keep it.', 'The mound is said to stand on this very spot.'];
    x.font = `20px ${F.small}`; x.textAlign = 'left'; lines.forEach((l, i) => x.fillText(l, 40, 90 + i * 36));
    x.strokeStyle = '#555'; x.lineWidth = 2; x.strokeRect(6, 6, w - 12, h - 12); });
  box(0.78, 0.52, 0.01, steel, 0, 0.68, 0.035, g); plane(0.76, 0.5, std({ map: txt, metalness: 0.45, roughness: 0.35 }), 0, 0.68, 0.0405, 0, g);
  g.userData.collider = [-W / 2 - 0.22, W / 2 + 0.22, -0.13, 0.13];
  return g;
}

// ---- canal park -------------------------------------------------------------------------------------------------
export function makeCanalPark() {
  const g = new THREE.Group(); g.name = 'canal_park';
  const L = 24, CZ0 = -2.2, CZ1 = 0.6, DEP = 0.75;   // channel between z CZ0..CZ1, depth DEP
  const pathM = std({ map: tex('cn_path', L / 2.2, 1), roughness: 0.95 });
  const grass = canvasT(128, 128, (x, w, h) => { x.fillStyle = '#5a7a2a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { x.fillStyle = ['#6a8a32', '#4a6a22', '#7a9a3a', '#8a8a3a'][i % 4]; x.fillRect(Math.random() * w, Math.random() * h, 1, 3 + Math.random() * 4); } }); grass.wrapS = grass.wrapT = THREE.RepeatWrapping; grass.repeat.set(L / 1.5, 2);
  const grassM = std({ map: grass, roughness: 1 });
  // near bank (street side): path z 1.0..8, a grass verge to the street railing
  const p1 = flat(L, 7, pathM, 0, 0.02, 4.5, g); p1.material = std({ map: tex('cn_path', L / 2.2, 7 / 2.2), roughness: 0.95 });
  flat(L, 3.6, grassM, 0, 0.018, 9.8, g);
  // red brick edging along the channel lip (individual bricks, slightly uneven)
  const brickM = std({ color: '#b8584a', roughness: 0.85 }), r = rng(67);
  const bricks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.21, 0.07, 0.1), brickM, Math.ceil(L / 0.22) * 2);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), C = new THREE.Color(); let n = 0;
  for (const z of [CZ1 + 0.06, CZ0 - 0.06]) for (let x = -L / 2 + 0.11; x < L / 2; x += 0.22) { Q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (r() - 0.5) * 0.03); M.compose(new THREE.Vector3(x, 0.03 + r() * 0.01, z), Q, new THREE.Vector3(1, 1, 1)); bricks.setMatrixAt(n, M); bricks.setColorAt(n, C.setHSL(0.03, 0.32, 0.45 + r() * 0.12)); n++; }
  bricks.count = n; bricks.receiveShadow = true; g.add(bricks);
  // channel: ribbed concrete walls, silty floor with a sheet of water
  const wallM = std({ map: tex('cn_wall', L / 2.5, 1), roughness: 0.9 });
  plane(L, DEP, wallM, 0, -DEP / 2, CZ1, Math.PI, g); plane(L, DEP, wallM, 0, -DEP / 2, CZ0, 0, g);
  flat(L, CZ1 - CZ0, std({ color: '#3a3830', roughness: 1 }), 0, -DEP, (CZ0 + CZ1) / 2, g);
  const water = flat(L, CZ1 - CZ0, new THREE.MeshPhysicalMaterial({ map: tex('cn_water', L / 3, 1), roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.85 }), 0, -DEP + 0.06, (CZ0 + CZ1) / 2, g); void water;
  // far bank: grass + a mossy path to the flood wall
  flat(L, 2.8, grassM, 0, 0.018, CZ0 - 1.5, g);
  flat(L, 3.5, std({ map: tex('cn_path', L / 2.2, 1.6), roughness: 0.95, color: '#c8d0a0' }), 0, 0.02, CZ0 - 4.6, g);
  // flood wall (concrete, 2.6 m) with a dark railing on top, a drain pipe outlet
  const conc = std({ map: tex('lot_concrete', L / 3, 1), color: '#c8c6c0', roughness: 0.9 });
  box(L, 2.6, 0.4, conc, 0, 1.3, -6.8, g);
  const rail = std({ color: '#3a3430', metalness: 0.5, roughness: 0.5 });
  box(L, 0.05, 0.05, rail, 0, 3.6, -6.7, g); box(L, 0.04, 0.04, rail, 0, 3.05, -6.7, g);
  for (let x = -L / 2; x <= L / 2; x += 0.15) box(0.02, 1.0, 0.02, rail, x, 3.1, -6.7, g);
  cyl(0.15, 0.15, 0.4, std({ color: '#5a5a58' }), 4, 0.6, -6.5, g, 16).rotation.x = Math.PI / 2;
  // wooden plank footbridge across the channel, with a low kerb rail
  const plank = std({ color: '#6a5444', roughness: 0.9 }), bridge = new THREE.Group(); bridge.position.set(-4, 0.06, (CZ0 + CZ1) / 2); bridge.rotation.y = 0.12; g.add(bridge);
  for (let i = 0; i < 14; i++) box(0.17, 0.05, 3.6, std({ color: new THREE.Color().setHSL(0.07, 0.18, 0.28 + r() * 0.08), roughness: 0.9 }), -1.15 + i * 0.178, 0, 0, bridge);
  for (const s of [-1, 1]) { box(0.08, 0.1, 3.6, plank, s * 1.25, 0.04, 0, bridge); box(2.6, 0.2, 0.12, std({ color: '#4a4440', metalness: 0.4 }), 0, -0.13, s * 1.1, bridge); }
  // elevated road overhead: a concrete deck on round piers, a railing and street lamps on it
  const deckM = std({ color: '#b8b6b0', roughness: 0.85 });
  box(L + 8, 1.0, 9, deckM, 0, 10.5, -3.0, g); box(L + 8, 1.2, 0.3, deckM, 0, 11.6, 1.35, g); box(L + 8, 1.2, 0.3, deckM, 0, 11.6, -7.35, g);
  for (const x of [-9, 9]) { cyl(0.8, 0.8, 10, deckM, x, 5, -9.0, g, 28); box(3.0, 0.9, 1.6, deckM, x, 9.6, -9.0, g); }
  box(L + 8, 0.6, 1.0, deckM, 0, 9.8, -9.0, g);
  for (const x of [-10, 2, 14]) { cyl(0.06, 0.06, 4, rail, x - 2, 13.8, 1.2, g, 8); }
  // street-side railing with an opening for the path, and the story sign on the path
  for (const [a, b] of [[-12, -1.5], [1.5, 12]]) { box(b - a, 0.05, 0.05, rail, (a + b) / 2, 1.1, 11.6, g); box(b - a, 0.04, 0.04, rail, (a + b) / 2, 0.55, 11.6, g); for (let x = a; x <= b + 0.01; x += 2) box(0.06, 1.1, 0.06, rail, x, 0.55, 11.6, g); }
  const sign = makeStorySign(); sign.position.set(6.5, 0, 7.6); sign.rotation.y = -0.15; g.add(sign);
  // the park sits on a raised bank (0.75 m): stone-faced retaining walls on the street side and both ends, steps
  // up from the sidewalk at the path opening (the channel needs the height to sink into)
  const ret = std({ map: tex('tx_stone', 6, 0.5), roughness: 0.9 });
  box(L - 3.0, 0.78, 0.3, ret, -L / 2 + (L / 2 - 1.5) / 2 + 0 - 0.0, -0.39, 11.85, g).geometry.translate(0, 0, 0);
  g.children[g.children.length - 1].scale.x = (L / 2 - 1.5) / (L - 3.0); g.children[g.children.length - 1].position.x = -L / 2 + (L / 2 - 1.5) / 2;
  const rw2 = box(L / 2 - 1.5, 0.78, 0.3, ret, L / 2 - (L / 2 - 1.5) / 2, -0.39, 11.85, g); void rw2;
  for (const x of [-L / 2, L / 2]) box(0.3, 0.78, 18.6, ret, x, -0.39, 2.6, g);
  for (let k = 0; k < 4; k++) box(3.0, 0.19 * (k + 1), 0.4, std({ map: tex('lot_concrete', 1, 0.3), color: '#c8c6c0' }), 0, -0.75 + 0.095 * (k + 1), 13.6 - k * 0.4, g);
  // some dry reeds on the banks
  const reedM = std({ color: '#b8a070', side: THREE.DoubleSide }), reed = new THREE.PlaneGeometry(0.03, 0.9); reed.translate(0, 0.45, 0);
  const rd = new THREE.InstancedMesh(reed, reedM, 160); for (let i = 0; i < 160; i++) { const cx = -L / 2 + r() * L, cz = (r() < 0.5 ? CZ1 + 0.25 + r() * 0.5 : CZ0 - 0.25 - r() * 0.8); Q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.5, r() * 6, (r() - 0.5) * 0.5)); M.compose(new THREE.Vector3(cx, 0, cz), Q, new THREE.Vector3(1, 0.6 + r() * 0.7, 1)); rd.setMatrixAt(i, M); } g.add(rd);
  g.userData.colliders = [[-L / 2, L / 2, CZ0 - 0.1, CZ1 + 0.1].map((v, i) => v), [-12, -1.5, 11.5, 11.7], [1.5, 12, 11.5, 11.7], [-L / 2, L / 2, -7.0, -6.6], [8.65, 10.35, -9.8, -8.2], [-10.35, -8.65, -9.8, -8.2], [6.5 - 0.9, 6.5 + 0.9, 7.45, 7.75]];
  // the channel collider has a gap at the bridge: split it
  g.userData.colliders[0] = [-L / 2, -5.3, CZ0 - 0.1, CZ1 + 0.1]; g.userData.colliders.push([-2.7, L / 2, CZ0 - 0.1, CZ1 + 0.1]);
  g.userData.area = { minX: -L / 2 + 0.2, maxX: L / 2 - 0.2, minZ: -6.4, maxZ: 11.9 };
  return g;
}

// ---- paper props ------------------------------------------------------------------------------------------------
export function makeReceipt(kind = 'mart') {
  const t = canvasT(256, 720, (x, w, h) => {
    x.fillStyle = '#f8f8f4'; x.fillRect(0, 0, w, h); x.fillStyle = '#222'; x.textAlign = 'left';
    const line = (s, y, sz = 15, al = 'left') => { x.font = `${sz}px ${F.small}`; x.textAlign = al; x.fillText(s, al === 'center' ? w / 2 : al === 'right' ? w - 16 : 16, y); };
    if (kind === 'mart') {
      fitText(x, 'CORNER MART 24', w / 2, 40, w - 30, 30, F.heavy); line('Cedar Ave branch · (555) 016-2400', 66, 12, 'center');
      line('11/17  15:08          reg #1', 100); fitText(x, 'RECEIPT', w / 2, 140, 120, 24, F.label);
      [['Bacon spaghetti', '3.70'], ['Ice cubes 1 kg', '1.38'], ['Grilled rice balls', '2.18'], ['Bag (small)', '0.03']].forEach(([a, b], i) => { line(a, 190 + i * 26); line('$' + b, 190 + i * 26, 15, 'right'); });
      x.fillRect(16, 300, w - 32, 1); line('Subtotal', 330); line('$7.29', 330, 15, 'right'); line('Tax', 354); line('$0.61', 354, 15, 'right');
      x.font = `bold 22px ${F.small}`; x.textAlign = 'left'; x.fillText('TOTAL', 16, 394); x.textAlign = 'right'; x.fillText('$7.90', w - 16, 394);
      line('Cash', 430); line('$10.00', 430, 15, 'right'); line('Change', 456); line('$2.10', 456, 15, 'right');
      line('Thank you for shopping!', 520, 13, 'center');
    } else {
      fitText(x, 'ALL $1 PLUS', w / 2, 44, w - 40, 34, F.heavy); line('Kameo St. store · (555) 018-7731', 72, 12, 'center');
      line('11/17  10:27   reg 0001', 108); fitText(x, 'RECEIPT', w / 2, 146, 120, 24, F.label);
      line('Cozy face mask', 196); line('$2.20', 196, 15, 'right'); line('  ($1.10 x 2)', 220, 13);
      x.fillRect(16, 240, w - 32, 1); line('Subtotal  2 items', 268); line('$2.20', 268, 15, 'right');
      x.font = `bold 22px ${F.small}`; x.textAlign = 'left'; x.fillText('TOTAL', 16, 306); x.textAlign = 'right'; x.fillText('$2.20', w - 16, 306);
      line('Cash', 340); line('$100.00', 340, 15, 'right'); x.font = `bold 20px ${F.small}`; x.textAlign = 'left'; x.fillText('Change', 16, 372); x.textAlign = 'right'; x.fillText('$97.80', w - 16, 372);
      // a made-up 50th-anniversary badge and a decorative square code, a barcode
      x.strokeStyle = '#222'; x.lineWidth = 4; x.beginPath(); x.arc(70, 460, 40, 0, 7); x.stroke(); fitText(x, '50', 70, 462, 50, 34, F.heavy);
      for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) if ((i * 7 + j * 3 + i * j) % 3 === 0) x.fillRect(150 + i * 6, 420 + j * 6, 6, 6);
      for (let i = 0; i < 60; i++) x.fillRect(20 + i * 3.6, 560, (i % 4 === 0 ? 2.5 : 1.2), 50);
    }
  });
  const geo = new THREE.PlaneGeometry(0.075, 0.21, 2, 16); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, 0.012 * Math.max(0, (y / 0.105)) ** 2 + 0.006 * Math.sin(y * 40)); }
  geo.computeVertexNormals(); geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, std({ map: t, roughness: 0.6, side: THREE.DoubleSide })); m.name = 'receipt_' + kind; m.position.y = 0.002; return m;
}
export function makeRiceballPack() {
  const t = canvasT(320, 500, (x, w, h) => {
    const bg = x.createLinearGradient(0, 0, w, 0); bg.addColorStop(0, '#d82a1a'); bg.addColorStop(0.5, '#f2a020'); bg.addColorStop(1, '#f2d020'); x.fillStyle = bg; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) { x.fillStyle = ['#c81e28', '#2a8a4a', '#f2c21a', '#1a3a8a'][i % 4]; x.fillRect(i * 20, 0, 20, 14); x.fillRect(i * 20, h - 14, 20, 14); }
    x.fillStyle = '#2a1a10'; x.fillRect(60, 40, 200, 180); x.strokeStyle = '#e8c050'; x.lineWidth = 4; x.strokeRect(68, 48, 184, 164);
    x.fillStyle = '#f2e6b8'; fitText(x, 'GRILLED', 160, 88, 160, 36, F.brush); fitText(x, 'RICE BALLS', 160, 134, 170, 34, F.brush); x.fillStyle = '#e8c050'; fitText(x, 'spicy bibim style', 160, 182, 160, 20, F.label);
    // the rice balls: triangles with browned grains
    for (const [cx, cy, s] of [[160, 330, 90], [200, 420, 60]]) { x.fillStyle = '#b8682a'; x.beginPath(); x.moveTo(cx, cy - s); x.quadraticCurveTo(cx + s * 1.1, cy + s * 0.6, cx, cy + s * 0.7); x.quadraticCurveTo(cx - s * 1.1, cy + s * 0.6, cx, cy - s); x.fill(); for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(${200 + Math.random() * 55},${120 + Math.random() * 60},${50},0.8)`; x.beginPath(); x.ellipse(cx + (Math.random() - 0.5) * s * 1.2, cy + (Math.random() - 0.3) * s * 1.1, 3, 1.5, Math.random() * 3, 0, 7); x.fill(); } }
    x.fillStyle = '#fff'; x.fillRect(w - 60, h - 70, 46, 30); x.fillStyle = '#222'; fitText(x, '2 pcs', w - 37, h - 54, 40, 14, F.label);
  });
  // a flat pillow pack with crimped ends
  const geo = new THREE.PlaneGeometry(0.13, 0.2, 12, 16); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const u = p.getX(i) / 0.065, v = p.getY(i) / 0.1; const seal = Math.abs(v) > 0.88; p.setZ(i, seal ? 0 : 0.012 * Math.cos(u * Math.PI / 2) * Math.cos(v * Math.PI / 2)); }
  geo.computeVertexNormals(); geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, std({ map: t, roughness: 0.3, metalness: 0.2 })); m.name = 'riceball_pack'; m.castShadow = true; m.position.y = 0.001; return m;
}
