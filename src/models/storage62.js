// Self-storage (queue item 62, photos/storage/): a drive-up storage row on lot C downtown. Everything is modelled:
// orange corrugated roll-up doors in silver frames with number plates (made-up numbers) and a brass slide latch with a
// disc padlock (the latch close-up), corrugated silver unit walls (the white-fins texture turned on its side), and two
// open units: one packed like the photo (moving boxes with made-up printing, shipping boxes, white file boxes, the
// user's yellow splatter painting, backpacks, a blanket bundle, a long flat box leaning on the wall), one with a wall of
// stacked soda cans (made-up designs) on a cubby shelf and the gold snack pack on a box.
//   makeRollupDoor(open)   1.22 x 2.13 m door in its frame; open: rolled up into the drum at the top. Front toward +z.
//   makeLatch()            the slide latch + padlock      makeMovingBox(kind, w, h, d)   'small' | 'ship' | 'file'
//   makeBackpack(seed)     makeSodaCan62(design)          makeCanWall()
//   makeStorageRow()       9 units, 18 m wide, doors along z = 0 facing -z; userData colliders + areas (local)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';
import { makeCanvas } from './props.js';
import { makeChipBag } from './snacks43.js';
import { libMat } from './library60.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 16) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ORANGE = () => std({ color: '#ff7418', roughness: 0.42, metalness: 0.05 });
const SILVER = () => std({ color: '#c8ccd0', metalness: 0.6, roughness: 0.32 });

// ---- roll-up door ------------------------------------------------------------------------------------------------
const DW = 1.22, DH = 2.13, PITCH = 0.082;
function corrugated(w, h, mat) {   // a sheet with rounded horizontal ribs (real geometry), front toward +z
  const geo = new THREE.PlaneGeometry(w, h, 1, Math.round(h / PITCH) * 8); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); const ph = ((y / PITCH) % 1 + 1) % 1; p.setZ(i, 0.011 * Math.sin(ph * Math.PI * 2) + 0.004 * Math.sin(ph * Math.PI * 4)); }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m;
}
export function makeLatch() {
  const g = new THREE.Group(); g.name = 'slide_latch';
  const brass = std({ color: '#c8a85a', metalness: 0.85, roughness: 0.3 }), steel = std({ color: '#c8ccd0', metalness: 0.9, roughness: 0.25 });
  // base plate with the slots, bolted at both ends
  const plate = new THREE.Shape(); plate.moveTo(-0.11, -0.03); plate.lineTo(0.11, -0.03); plate.lineTo(0.11, 0.03); plate.lineTo(-0.11, 0.03); plate.closePath();
  for (const x of [-0.07, -0.035]) { const h = new THREE.Path(); h.moveTo(x - 0.012, -0.012); h.lineTo(x + 0.012, -0.012); h.lineTo(x + 0.012, 0.004); h.lineTo(x - 0.012, 0.004); h.closePath(); plate.holes.push(h); }
  const pm = new THREE.Mesh(new THREE.ExtrudeGeometry(plate, { depth: 0.004, bevelEnabled: true, bevelThickness: 0.001, bevelSize: 0.001, bevelSegments: 1 }), brass); g.add(pm);
  for (const x of [-0.095, 0.095]) { const b = cyl(0.007, 0.007, 0.005, steel, x, 0.018, 0.006, g, 12); b.rotation.x = Math.PI / 2; }
  // the sliding bolt bar + its keeper on the frame, the lifting tab
  box(0.17, 0.016, 0.006, brass, -0.02, -0.004, 0.009, g); box(0.03, 0.05, 0.012, brass, 0.13, 0, 0.006, g);
  box(0.016, 0.03, 0.008, brass, 0.0, 0.014, 0.014, g);
  // disc padlock through the hasp
  const lock = new THREE.Group(); lock.position.set(0.025, 0.0, 0.03); g.add(lock);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.022, 28), steel); disc.rotation.x = Math.PI / 2; lock.add(disc);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.02, 20), std({ color: '#2a3a7a', metalness: 0.5, roughness: 0.3 })); face.position.z = 0.0115; lock.add(face);
  const key = cyl(0.006, 0.006, 0.004, steel, 0, 0, 0.0125, lock, 10); key.rotation.x = Math.PI / 2;
  return g;
}
export function makeRollupDoor(open = false, number = '2414') {
  const g = new THREE.Group(); g.name = open ? 'rollup_door_open' : 'rollup_door';
  const sil = SILVER(), org = ORANGE();
  // frame: side tracks, the header box with the drum cover
  for (const s of [-1, 1]) box(0.07, DH + 0.1, 0.07, sil, s * (DW / 2 + 0.035), (DH + 0.1) / 2, 0.0, g);
  box(DW + 0.24, 0.2, 0.18, sil, 0, DH + 0.2, -0.04, g);
  // number plate (made-up) on the header
  const nt = canvasT(256, 96, (x, w, h) => { x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c81e28'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6); x.fillStyle = '#c81e28'; fitText(x, number, w / 2, 50, 200, 66, F.label, { weight: 700 }); });
  const np = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.08), std({ map: nt })); np.position.set(0, DH + 0.2, 0.052); g.add(np);
  if (!open) {
    const sheet = corrugated(DW, DH, org); sheet.position.set(0, DH / 2, 0.0); g.add(sheet);
    box(DW, 0.05, 0.04, std({ color: '#e8601a', metalness: 0.05, roughness: 0.45 }), 0, 0.03, 0.005, g);   // bottom bar
    const l = makeLatch(); l.position.set(-DW / 2 + 0.22, 0.38, 0.02); g.add(l);
    const pull = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 6, 16, Math.PI), sil); pull.rotation.z = Math.PI; pull.position.set(0.2, 0.14, 0.03); g.add(pull);
  } else {
    // rolled up into a drum behind the header; the bottom bar shows under it
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, DW, 32), org); drum.rotation.z = Math.PI / 2; drum.position.set(0, DH + 0.08, -0.12); g.add(drum);
    box(DW, 0.05, 0.05, std({ color: '#d8501a', metalness: 0.3 }), 0, DH - 0.03, 0.0, g);
    const l = makeLatch(); l.position.set(-DW / 2 + 0.22, DH - 0.02, 0.03); l.rotation.x = -0.3; g.add(l);
  }
  return g;
}

// ---- contents ----------------------------------------------------------------------------------------------------
const kraft = '#c69a62';
function boxFace(kind, face, seed) {
  return canvasT(256, 256, (x, w, h) => {
    const r = rng(seed); x.fillStyle = kind === 'file' ? '#f2f0ea' : kraft; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 120; i++) { x.fillStyle = `rgba(${kind === 'file' ? '0,0,0' : '90,60,20'},${r() * 0.05})`; x.fillRect(r() * w, r() * h, 1 + r() * 40, 1); }
    if (kind === 'small' && face === 'side') {   // green band with simple box icons + the size word
      x.fillStyle = '#2a7a4a'; x.fillRect(0, h * 0.72, w, h * 0.1); x.fillStyle = '#f4f2ea'; x.fillRect(0, h * 0.74, w, h * 0.06);
      x.strokeStyle = '#2a6a42'; x.lineWidth = 3; for (let i = 0; i < 4; i++) { const cx = 40 + i * 60; x.strokeRect(cx - 14, h * 0.52, 28, 22); x.beginPath(); x.moveTo(cx - 14, h * 0.52); x.lineTo(cx, h * 0.47); x.lineTo(cx + 14, h * 0.52); x.stroke(); }
      x.fillStyle = '#2a7a4a'; fitText(x, 'SMALL', w / 2, h * 0.3, w - 60, 44, F.heavy, { spacing: 2 }); x.font = `13px ${F.label}`; x.textAlign = 'center'; x.fillText('14" x 14" x 12"  ·  PACK & GO', w / 2, h * 0.92);
    }
    if (kind === 'ship' && face === 'side') {   // plain shipping box: arrows, a shipping label, marker writing
      x.fillStyle = '#222'; x.font = `bold 26px ${F.label}`; x.textAlign = 'center'; x.fillText('↑↑', w * 0.85, h * 0.2);
      x.fillStyle = '#fbfbf8'; x.fillRect(w * 0.5, h * 0.55, w * 0.38, h * 0.26); x.fillStyle = '#333'; for (let i = 0; i < 6; i++) x.fillRect(w * 0.53, h * (0.58 + i * 0.035), w * (0.2 + (i % 3) * 0.05), 3); for (let i = 0; i < 20; i++) x.fillRect(w * 0.53 + i * 4, h * 0.77, 2, 10);
    }
    if (face === 'top') { x.fillStyle = 'rgba(60,40,20,0.35)'; x.fillRect(0, h / 2 - 1, w, 2); if (kind !== 'file') { x.fillStyle = 'rgba(200,175,130,0.7)'; x.fillRect(0, h / 2 - 22, w, 44); x.fillStyle = 'rgba(255,255,255,0.2)'; x.fillRect(0, h / 2 - 22, w, 6); } if (kind === 'ship' && r() < 0.6) { x.fillStyle = '#111'; fitText(x, ['2A6', 'KITCHEN', 'BOOKS', 'MISC'][Math.floor(r() * 4)], w * 0.3, h * 0.25, 120, 34, F.marker); } }
    if (kind === 'file' && face === 'side') { x.fillStyle = '#c81e28'; x.fillRect(0, h * 0.1, w, 8); x.fillStyle = '#2a4aa8'; x.fillRect(0, h * 0.1 + 12, w, 8); x.fillStyle = '#222'; x.beginPath(); x.ellipse(w / 2, h * 0.35, 30, 12, 0, 0, 7); x.fill(); }
  });
}
export function makeMovingBox(kind = 'small', w = 0.36, h = 0.3, d = 0.36, seed = 1) {
  const side = std({ map: boxFace(kind, 'side', seed), roughness: 0.9 }), top = std({ map: boxFace(kind, 'top', seed + 7), roughness: 0.9 }), plain = std({ map: boxFace(kind, 'plain', seed + 3), roughness: 0.9 });
  const geo = new RoundedBoxGeometry(w, h, d, 2, 0.008);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [plain, plain, top, plain, side, side]); m.castShadow = true; m.receiveShadow = true; void geo;
  const g = new THREE.Group(); g.name = 'box_' + kind; m.position.y = h / 2; g.add(m);
  // flap seam ridges on top
  if (kind !== 'file') box(w * 0.98, 0.006, 0.02, std({ color: '#b08850' }), 0, h + 0.003, 0, g);
  else { box(w + 0.01, 0.05, d + 0.01, std({ color: '#f2f0ea', roughness: 0.9 }), 0, h - 0.02, 0, g); }   // file-box lid
  g.userData.size = [w, h, d];
  return g;
}
export function makeBackpack(seed = 1) {
  const g = new THREE.Group(); g.name = 'backpack'; const r = rng(seed);
  const nylon = std({ color: '#141618', roughness: 0.75 }), trim = std({ color: '#2a2c30', roughness: 0.6 });
  rbox(0.32, 0.46, 0.18, 0.07, nylon, 0, 0.23, 0, g);                 // main body
  rbox(0.26, 0.24, 0.07, 0.04, nylon, 0, 0.17, 0.11, g);              // front pocket
  rbox(0.2, 0.1, 0.05, 0.02, nylon, 0, 0.36, 0.1, g);                 // top pocket
  const zip = std({ color: '#3a6ac8', roughness: 0.4 });
  const zp = []; for (let i = 0; i <= 20; i++) { const a = i / 20 * Math.PI; zp.push(V(Math.cos(a) * 0.13, 0.17 + Math.sin(a) * 0.1, 0.147)); }
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(zp), 20, 0.004, 4), r() < 0.5 ? zip : trim));
  const hd = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 6, 14, Math.PI), trim); hd.position.set(0, 0.46, -0.02); g.add(hd);
  for (const s of [-1, 1]) { const st = []; for (let i = 0; i <= 10; i++) { const t = i / 10; st.push(V(s * 0.08, 0.44 - t * 0.4, -0.09 - Math.sin(t * Math.PI) * 0.06)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(st), 12, 0.02, 6), trim)); }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
// folded blanket bundle: a soft stack of layers with a printed pattern (blues, yellow, black)
function makeBlanketBundle() {
  const g = new THREE.Group(); g.name = 'blanket_bundle';
  const t = canvasT(256, 128, (x, w, h) => { x.fillStyle = '#2a4a8a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) { x.fillStyle = ['#f2c21a', '#e8e8e0', '#111', '#5a8ad8', '#c84a2a'][i % 5]; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 8 + Math.random() * 20, 4 + Math.random() * 8, Math.random() * 3, 0, 7); x.fill(); } });
  for (let i = 0; i < 4; i++) { const l = rbox(0.62 - i * 0.03, 0.05, 0.38 - i * 0.02, 0.022, std({ map: t, roughness: 0.95 }), (i % 2 - 0.5) * 0.03, 0.025 + i * 0.048, 0, g); l.rotation.y = (i - 1.5) * 0.06; }
  return g;
}
// soda cans with made-up designs (photos/storage/soda-can-wall: a wall of citrus-soda cans)
const CANS = {
  original: ['#1e9a2a', '#f2f230', '#ffffff', 'VOLT', 'citrus charge'],
  cherry: ['#141414', '#ff2a4a', '#ffffff', 'VOLT', 'cherry blast'],
  gold: ['#e8b02a', '#141414', '#141414', 'VOLT', 'gold rush'],
  white: ['#f2f2ee', '#1e9a2a', '#c81e28', 'VOLT', 'zero sugar'],
};
const _canMat = {};
function canMaterial(design) {
  if (_canMat[design]) return _canMat[design];
  const [bg, acc, ink, name, sub] = CANS[design];
  const t = canvasT(512, 256, (x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h);
    x.fillStyle = acc; x.fillRect(0, h * 0.78, w, h * 0.08); x.fillRect(0, h * 0.1, w, h * 0.05); x.strokeStyle = acc; x.lineWidth = 14; for (let k = 0; k < 2; k++) { const ox = k * w / 2; x.beginPath(); x.moveTo(ox + 40, 30); x.lineTo(ox + 90, 110); x.lineTo(ox + 70, 120); x.lineTo(ox + 130, 220); x.stroke(); }
    for (let k = 0; k < 2; k++) { const ox = k * w / 2 + w / 4; x.save(); x.translate(ox, h * 0.5); x.rotate(-0.25); x.fillStyle = ink; x.strokeStyle = acc; x.lineWidth = 5; x.lineJoin = 'round'; fitText(x, name, 0, -10, 230, 110, F.heavy, { stroke: 1 }); x.fillStyle = acc; fitText(x, sub, 0, 48, 180, 24, F.label); x.restore(); } });
  return (_canMat[design] = [std({ map: t, metalness: 0.12, roughness: 0.32 }), std({ color: '#c8ccd0', metalness: 0.9, roughness: 0.25 }), std({ color: '#b8bcc0', metalness: 0.9, roughness: 0.3 })]);
}
const canGeo = (() => { const prof = [[0, 0], [0.026, 0], [0.031, 0.008], [0.033, 0.016], [0.033, 0.104], [0.029, 0.116], [0.027, 0.122], [0.0, 0.122]].map(([r, y]) => new THREE.Vector2(r, y)); return new THREE.LatheGeometry(prof, 28); })();
export function makeSodaCan62(design = 'original') {
  const g = new THREE.Group(); g.name = 'volt_can';
  const [label, metal] = canMaterial(design);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.0336, 0.0336, 0.086, 28, 1, true), label); body.position.y = 0.06; body.castShadow = true; g.add(body);
  const shell = new THREE.Mesh(canGeo, metal); g.add(shell);
  const tab = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.002, 0.012), metal); tab.position.set(0, 0.123, 0.008); g.add(tab);
  return g;
}
// the can wall: cans stacked in rows on a light-wood cubby shelf, the design varying in runs (as in the photo)
export function makeCanWall(cols = 16, rows = 4) {
  const g = new THREE.Group(); g.name = 'can_wall';
  const wood = std({ color: '#e0cfb0', roughness: 0.7 });
  const W = cols * 0.068 + 0.06;
  box(W, 0.03, 0.4, wood, 0, 0.62, 0, g); box(W, 0.6, 0.02, wood, 0, 0.31, -0.19, g);
  for (const x of [-W / 2, 0, W / 2]) box(0.025, 0.62, 0.4, wood, x, 0.31, 0, g);
  box(W, 0.03, 0.4, wood, 0, 0.015, 0, g);
  const r = rng(62), designs = ['original', 'cherry', 'gold', 'white'];
  // instanced: one InstancedMesh per design (body + shell share transforms)
  const per = {}; designs.forEach((d) => (per[d] = []));
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols - (j % 2); i++) { const d = designs[(Math.floor(i / 3) + j * 2 + (r() < 0.2 ? 1 : 0)) % 4]; per[d].push([-W / 2 + 0.064 + i * 0.068 + (j % 2) * 0.034, 0.635 + j * 0.124, (r() - 0.5) * 0.01, r() * 6]); }
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(1, 1, 1);
  for (const d of designs) {
    const [label, metal] = canMaterial(d), list = per[d];
    const bodyG = new THREE.CylinderGeometry(0.0336, 0.0336, 0.086, 28, 1, true); bodyG.translate(0, 0.06, 0);
    const a = new THREE.InstancedMesh(bodyG, label, list.length), b = new THREE.InstancedMesh(canGeo, metal, list.length);
    list.forEach(([x, y, z, ry], k) => { Q.setFromAxisAngle(V(0, 1, 0), ry); M.compose(V(x, y, z + 0.1), Q, S); a.setMatrixAt(k, M); b.setMatrixAt(k, M); });
    a.castShadow = b.castShadow = true; g.add(a, b);
  }
  g.userData.collider = [-W / 2, W / 2, -0.2, 0.2];
  return g;
}

// ---- the storage row ----------------------------------------------------------------------------------------------
const UW = 2.0, UD = 3.0, UH = 2.6;
function unitShell(p, x0, open) {   // the corrugated silver box of one unit (open units only need the inside)
  if (!open) return;
  const walls = libMat('tx_fins', 1.2, 1.2, { color: '#d8dcdf', metalness: 0.35, roughness: 0.4 });
  walls.map.rotation = walls.normalMap.rotation = Math.PI / 2;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(UW, UH), walls); back.position.set(x0 + UW / 2, UH / 2, UD - 0.02); back.rotation.y = Math.PI; p.add(back);
  for (const [x, ry] of [[x0 + 0.02, Math.PI / 2], [x0 + UW - 0.02, -Math.PI / 2]]) { const s = new THREE.Mesh(new THREE.PlaneGeometry(UD, UH), walls); s.position.set(x, UH / 2, UD / 2); s.rotation.y = ry; s.receiveShadow = true; p.add(s); }
  // vertical posts at the panel joints (the photo's silver uprights)
  for (const x of [x0 + 0.04, x0 + UW - 0.04]) box(0.05, UH, 0.04, SILVER(), x, UH / 2, 1.5, p);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(UW, UD), std({ map: tex('lot_concrete', 1, 1.5), color: '#b8b6b0', roughness: 0.9 })); fl.rotation.x = -Math.PI / 2; fl.position.set(x0 + UW / 2, 0.006, UD / 2); fl.receiveShadow = true; p.add(fl);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(UW, UD), walls); ceil.rotation.x = Math.PI / 2; ceil.position.set(x0 + UW / 2, UH, UD / 2); p.add(ceil);
  const bulb = cyl(0.06, 0.08, 0.06, std({ color: '#fff', emissive: '#fff4dc', emissiveIntensity: 2 }), x0 + UW / 2, UH - 0.03, 1.4, p, 16); bulb.castShadow = false;
  const l = new THREE.PointLight('#fff2d8', 3, 5, 1.6); l.position.set(x0 + UW / 2, UH - 0.25, 1.3); p.add(l);
}
function packUnit(p, x0) {   // as photographed: boxes stacked 3-4 high, art on the left, bags on top, a flat box leaning
  const at = (o, x, y, z, ry = 0) => { o.position.set(x0 + x, y, z); o.rotation.y = ry; p.add(o); return o; };
  let s = 1;
  // right: two columns of SMALL moving boxes 3 high
  for (const [x, z] of [[1.6, 2.5], [1.6, 2.0], [1.15, 2.6]]) for (let k = 0; k < 3; k++) at(makeMovingBox('small', 0.36, 0.3, 0.36, s++), x, k * 0.3, z, (k % 2) * 0.05);
  // middle: shipping boxes in front, a tall stack behind
  at(makeMovingBox('ship', 0.46, 0.34, 0.36, s++), 0.95, 0, 0.75, 0.08); at(makeMovingBox('ship', 0.44, 0.34, 0.34, s++), 0.95, 0.34, 0.78, -0.05); at(makeMovingBox('ship', 0.4, 0.32, 0.32, s++), 1.0, 0.68, 0.9, 0.1);
  for (let k = 0; k < 4; k++) at(makeMovingBox(k % 2 ? 'small' : 'ship', 0.4, 0.32, 0.38, s++), 0.95, k * 0.32, 1.9, (k % 2) * -0.06);
  at(makeMovingBox('ship', 0.42, 0.3, 0.36, s++), 1.45, 0, 1.4, 0.1); at(makeMovingBox('small', 0.36, 0.3, 0.36, s++), 1.45, 0.3, 1.4);
  // left: white file boxes stacked, the splatter painting leaning above, flat panels and a wood box
  for (let k = 0; k < 3; k++) at(makeMovingBox('file', 0.32, 0.27, 0.42, s++), 0.32, k * 0.28, 0.9 + (k % 2) * 0.04, Math.PI / 2);
  for (let k = 0; k < 2; k++) at(makeMovingBox('file', 0.32, 0.27, 0.42, s++), 0.32, k * 0.28, 1.4, Math.PI / 2);
  const art = makeCanvas('canvas_splatter.png', 0.6, 0.76, 0.03); art.position.set(x0 + 0.24, 1.2, 1.15); art.rotation.set(0, Math.PI / 2, 0); art.rotateX(-0.12); p.add(art);
  for (let k = 0; k < 3; k++) { const b = box(0.48, 0.025, 0.6, std({ color: ['#f2f0e8', '#e8d070', '#f2f0e8'][k] }), x0 + 0.38, 0.84 + k * 0.026, 1.95, p); b.rotation.y = k * 0.05; }
  at(makeMovingBox('ship', 0.42, 0.22, 0.34, s++), 0.38, 0.92, 2.0, 0.2);
  // bags + blanket on top of the stacks, a backpack against the back wall
  at(makeBackpack(1), 1.12, 1.28, 1.95, Math.PI + 0.3); at(makeBackpack(2), 1.62, 0.9, 2.4, Math.PI - 0.2);
  at(makeBlanketBundle(), 1.0, 1.0, 0.9, 0.15);
  // the long flat box leaning diagonally against the back wall
  const lf = box(0.22, 1.7, 0.06, std({ map: boxFace('ship', 'side', 99), roughness: 0.9 }), x0 + 1.05, 1.35, 2.92, p); lf.rotation.z = -0.55;
}
function cansUnit(p, x0) {
  const cw = makeCanWall(16, 4); cw.position.set(x0 + 1.0, 0, 2.7); cw.rotation.y = Math.PI; p.add(cw);
  const b1 = makeMovingBox('ship', 0.46, 0.34, 0.36, 41); b1.position.set(x0 + 0.5, 0, 1.4); b1.rotation.y = 0.3; p.add(b1);
  const bag = makeChipBag('peas', 0.15, 0.2, 5); bag.rotation.set(-Math.PI / 2 + 0.05, 0, 0.5); bag.position.set(x0 + 0.5, 0.36, 1.4); p.add(bag);
  for (let k = 0; k < 4; k++) { const c = makeSodaCan62(['original', 'cherry', 'gold', 'original'][k]); c.position.set(x0 + 1.4 + (k % 2) * 0.09, 0, 1.2 + Math.floor(k / 2) * 0.08); p.add(c); }
  const tipped = makeSodaCan62('gold'); tipped.rotation.z = Math.PI / 2; tipped.position.set(x0 + 1.2, 0.033, 0.9); p.add(tipped);
}
export function makeStorageRow() {
  const g = new THREE.Group(); g.name = 'storage_row';
  const N = 9, W = N * UW, wallM = std({ color: '#ecebe6', roughness: 0.85 });
  const OPEN = { 2: 'pack', 6: 'cans' };
  // shell: front wall (between doors), back, ends, roof with a fascia; the doors' openings face -z at z = 0
  const fascia = canvasT(1024, 128, (x, w, h) => { x.fillStyle = '#e8501a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'CEDAR SELF STORAGE', w * 0.36, 66, 600, 70, F.heavy, { spacing: 4 }); fitText(x, '(555) 019-4425', w * 0.84, 66, 230, 34, F.label, { weight: 700 }); });
  { const fm = std({ color: '#e8501a' }); const fb = new THREE.Mesh(new THREE.BoxGeometry(W + 0.4, 0.5, 0.25), [fm, fm, fm, fm, fm, std({ map: fascia })]); fb.position.set(W / 2, UH + 0.55, -0.05); g.add(fb); }
  box(W + 0.4, 0.06, UD * 2 + 0.4, std({ color: '#5a5c60', metalness: 0.4 }), W / 2, UH + 0.82, UD, g);   // roof
  box(W, UH + 0.3, 0.12, wallM, W / 2, (UH + 0.3) / 2, UD * 2, g);
  for (const x of [0, W]) box(0.12, UH + 0.3, UD * 2, wallM, x, (UH + 0.3) / 2, UD, g);
  box(W, UH + 0.3, 0.1, wallM, W / 2, (UH + 0.3) / 2, UD + 0.05, g);   // spine between the front and back rows (closed)
  const cols = [];
  for (let i = 0; i < N; i++) {
    const x0 = i * UW, kind = OPEN[i];
    // wall piers either side of the door and the lintel above it
    const pw = (UW - DW - 0.14) / 2;
    box(pw, UH + 0.3, 0.12, wallM, x0 + pw / 2, (UH + 0.3) / 2, 0, g); box(pw, UH + 0.3, 0.12, wallM, x0 + UW - pw / 2, (UH + 0.3) / 2, 0, g);
    box(UW, UH + 0.3 - DH - 0.32, 0.12, wallM, x0 + UW / 2, DH + 0.32 + (UH + 0.3 - DH - 0.32) / 2, 0, g);
    const d = makeRollupDoor(!!kind, String(2410 + i)); d.position.set(x0 + UW / 2, 0, -0.07); d.rotation.y = Math.PI; g.add(d);
    unitShell(g, x0, !!kind);
    if (kind === 'pack') packUnit(g, x0); if (kind === 'cans') cansUnit(g, x0);
    if (!kind) cols.push([x0, x0 + UW, -0.15, 0.1]); else { cols.push([x0, x0 + 0.08, 0, UD], [x0 + UW - 0.08, x0 + UW, 0, UD]); }
  }
  cols.push([0, W, UD - 0.05, UD + 0.1]);
  // apron: concrete in front of the doors, a bollard at each end
  const ap = new THREE.Mesh(new THREE.PlaneGeometry(W + 2, 4.2), std({ map: tex('lot_concrete', (W + 2) / 3, 1.4), color: '#c8c4bc', roughness: 0.9 })); ap.rotation.x = -Math.PI / 2; ap.position.set(W / 2, 0.012, -2.1); ap.receiveShadow = true; g.add(ap);
  for (const x of [-0.6, W + 0.6]) { cyl(0.11, 0.11, 1.0, std({ color: '#f2c21a', roughness: 0.5 }), x, 0.5, -0.4, g, 18); cols.push([x - 0.15, x + 0.15, -0.55, -0.25]); }
  g.userData.colliders = cols;
  g.userData.areas = [{ minX: -1, maxX: W + 1, minZ: -4.2, maxZ: -0.1 }, ...Object.keys(OPEN).map((i) => ({ minX: i * UW + 0.25, maxX: i * UW + UW - 0.25, minZ: -0.2, maxZ: 0.7 }))];
  return g;
}
