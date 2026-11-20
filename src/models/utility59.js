// Utility + parking (queue item 59, photos/utility/util01..15). Surfaces from the photos (tools/tex_59.py): split-face
// block wall, stacked-stone veneer, fresh black asphalt, sandy dirt, and the two fallen leaves (yellow-green catalpa,
// dry tan curl). Everything else is modelled.
//   makePadTransformer()   green pad-mount transformer: cabinet with a sloped lid, front double doors with a padlock
//                          hasp + recessed handle, a cooling-fin radiator on the back, made-up ID + warning stickers,
//                          on a concrete pad. Front toward +z.
//   makeWallCabinets()     grey + galvanized electrical cabinets on a wall, white PVC conduits on strut straps, side
//                          disconnect handle, a meter, a gravel strip. Wall at z = 0, cabinets toward +z.
//   makeTelecomPedestal()  pale-green ribbed telecom pedestal with a cap
//   makeSprinklerFDC()     fire-department sprinkler connection: red ring plate, chrome two-way inlet with caps, drip valve
//   makeAccessibleSign(onPost, van)  the standard blue handicapped-parking sign, on a U-channel post or for a wall;
//                          van adds the VAN ACCESSIBLE plate under it
//   makeLeafScatter(n, w, d, seed)  instanced curled leaves (both kinds) over a w x d area
//   makeUtilityLot()       the whole lot: 22 x 20 m (x -11..11, z -10..10), back wall (block + stone column) at x = +11
//                          facing -x, parking stalls along it, an accessible stall + striped aisle, a drive aisle, a
//                          sand/grass strip at the front (x -11..-7) with the transformer and the pedestal
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';
import { libMat, makeStuccoWall, makeMulchPlanter } from './library60.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = `${name}|${rx}|${ry}`; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 16) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const galv = () => std({ color: '#c0c4c4', metalness: 0.35, roughness: 0.45 });

// weathered paint: a flat colour with faint streaks + dust toward the bottom
function paintTex(base, seed = 1) {
  return canvasT(256, 256, (x, w, h) => { const r = rng(seed); x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '0,0,0'},${0.02 + r() * 0.04})`; x.fillRect(r() * w, r() * h, 1 + r() * 3, 10 + r() * 60); }
    const gr = x.createLinearGradient(0, h * 0.7, 0, h); gr.addColorStop(0, 'rgba(120,100,70,0)'); gr.addColorStop(1, 'rgba(120,100,70,0.25)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); });
}
function sticker(w, h, draw) { const t = canvasT(w, h, draw); return std({ map: t, roughness: 0.5 }); }

// ---- pad-mount transformer ---------------------------------------------------------------------------------------
export function makePadTransformer() {
  const g = new THREE.Group(); g.name = 'pad_transformer';
  const W = 1.8, H = 1.55, D = 1.45, Y0 = 0.15;
  const green = std({ map: paintTex('#6f8a78', 3), roughness: 0.55, metalness: 0.25 }), dark = std({ color: '#55705f', roughness: 0.6, metalness: 0.25 });
  const pad = std({ map: tex('lot_concrete', 1, 1), color: '#b8b4a8', roughness: 0.95 });
  box(W + 0.5, Y0, D + 0.5, pad, 0, Y0 / 2, 0, g);                                             // concrete pad
  // the cabinet, the sill flange, a lid that overhangs and slopes to the front
  box(W, H, D, green, 0, Y0 + H / 2, 0, g);
  box(W + 0.04, 0.05, D + 0.04, dark, 0, Y0 + 0.025, 0, g);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(W + 0.08, 0.06, D + 0.1), green); lid.position.set(0, Y0 + H + 0.04, 0.02); lid.rotation.x = 0.03; lid.castShadow = true; g.add(lid);
  // front double doors: proud panels with a centre seam, a three-point bar, the hinge knuckles at the outer edges
  const FZ = D / 2;
  for (const s of [-1, 1]) {
    box(W / 2 - 0.04, H - 0.12, 0.02, green, s * (W / 4), Y0 + H / 2, FZ + 0.01, g);
    for (const y of [0.35, 0.8, 1.25]) cyl(0.016, 0.016, 0.08, dark, s * (W / 2 - 0.02), Y0 + y, FZ + 0.012, g, 10);
  }
  box(0.012, H - 0.12, 0.03, std({ color: '#2e3a32' }), 0, Y0 + H / 2, FZ + 0.015, g);           // door seam
  // padlock hasp + recessed pentahead bolt + handle (as in util01)
  const blk = std({ color: '#1a1c1c', roughness: 0.4, metalness: 0.5 });
  box(0.14, 0.2, 0.035, dark, 0.09, Y0 + 0.82, FZ + 0.03, g);
  const hasp = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.007, 8, 16, Math.PI), blk); hasp.position.set(0.09, Y0 + 0.92, FZ + 0.06); g.add(hasp);
  const lock = rbox(0.05, 0.06, 0.025, 0.008, std({ color: '#a8a8a4', metalness: 0.8, roughness: 0.3 }), 0.09, Y0 + 0.87, FZ + 0.065, g); void lock;
  const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.004, 6, 14, Math.PI), std({ color: '#c8ccd0', metalness: 0.9, roughness: 0.2 })); shackle.position.set(0.09, Y0 + 0.9, FZ + 0.065); g.add(shackle);
  const hdl = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.01, 8, 16, Math.PI), blk); hdl.rotation.z = Math.PI; hdl.position.set(-0.09, Y0 + 0.8, FZ + 0.05); g.add(hdl);
  cyl(0.014, 0.014, 0.03, blk, -0.09, Y0 + 0.62, FZ + 0.03, g, 5).rotation.x = Math.PI / 2;
  // side lifting lug (the black bracket on util01's right side)
  for (const s of [-1, 1]) { box(0.04, 0.1, 0.18, blk, s * (W / 2 + 0.02), Y0 + H - 0.2, 0.3, g); }
  // stickers: made-up ID on the corner, an equipment tag, a warning sign, a small white tag
  const id = sticker(128, 96, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#e8c21a'; fitText(x, 'XF', w / 2, 30, 100, 36, F.heavy); fitText(x, '4417', w / 2, 72, 110, 36, F.heavy); });
  id.transparent = true; plane(0.16, 0.12, id, -W / 2 + 0.14, Y0 + H - 0.14, FZ + 0.022, 0, g);
  const warn = sticker(256, 160, (x, w, h) => { x.fillStyle = '#fbfbf6'; x.fillRect(0, 0, w, h); x.fillStyle = '#c81e28'; x.fillRect(0, 0, w, 44); x.fillStyle = '#fff'; fitText(x, 'DANGER', w / 2, 23, 200, 32, F.heavy, { spacing: 4 }); x.fillStyle = '#111'; fitText(x, 'HIGH VOLTAGE', w / 2, 74, 220, 26, F.label); fitText(x, 'KEEP OUT', w / 2, 106, 220, 26, F.label); fitText(x, 'call (555) 012-7731 before digging', w / 2, 140, 230, 14, F.label); });
  plane(0.28, 0.175, warn, 0.32, Y0 + H - 0.42, FZ + 0.022, 0, g);
  const tag = sticker(128, 64, (x, w, h) => { x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, w, h); x.fillStyle = '#222'; fitText(x, 'PAD 22-B', w / 2, 22, 110, 18, F.label); fitText(x, '150 kVA', w / 2, 46, 110, 18, F.label); });
  plane(0.14, 0.07, tag, 0.32, Y0 + H - 0.62, FZ + 0.022, 0, g);
  plane(0.1, 0.1, std({ color: '#fbfbf8' }), W / 2 - 0.14, Y0 + H - 0.14, FZ + 0.022, 0, g);
  const scratch = sticker(256, 256, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = 'rgba(210,215,205,0.5)'; x.lineWidth = 2; for (let i = 0; i < 14; i++) { x.beginPath(); x.ellipse(128, 128, 30 + i * 6, 40 + i * 5, i * 0.2, 0, 4); x.stroke(); } });
  scratch.transparent = true; plane(0.35, 0.4, scratch, -0.3, Y0 + H - 0.48, FZ + 0.022, 0, g);   // the scuffed patch on the left door
  // cooling-fin radiator on the back (util02): a header box and a row of thin vertical fins
  const BZ = -D / 2;
  box(0.9, 0.08, 0.36, dark, 0, Y0 + 1.25, BZ - 0.18, g); box(0.9, 0.08, 0.36, dark, 0, Y0 + 0.28, BZ - 0.18, g);
  for (let i = 0; i < 9; i++) box(0.022, 1.0, 0.34, green, -0.4 + i * 0.1, Y0 + 0.77, BZ - 0.18, g);
  // nameplate + bushings well on the back
  plane(0.12, 0.2, sticker(64, 108, (x, w, h) => { x.fillStyle = '#f4f2ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#c81e28'; x.fillRect(0, 0, w, 20); x.fillStyle = '#333'; for (let i = 0; i < 7; i++) x.fillRect(6, 28 + i * 11, w - 12, 4); }), 0.65, Y0 + 1.15, BZ - 0.003, Math.PI, g);
  g.userData.collider = [-W / 2 - 0.25, W / 2 + 0.25, -D / 2 - 0.4, D / 2 + 0.25];
  return g;
}

// ---- wall cabinets with conduits ---------------------------------------------------------------------------------
export function makeWallCabinets() {
  const g = new THREE.Group(); g.name = 'wall_cabinets';
  const grey = std({ map: paintTex('#8f9592', 5), roughness: 0.5, metalness: 0.3 }), gv = galv(), pvc = std({ color: '#e6e8e4', roughness: 0.45 });
  // left: grey pull box with a hinged cover; right: tall galvanized cabinet with a door + disconnect handle
  const cab = (w, h, d, mat, x, y) => {
    box(w, h, d, mat, x, y, d / 2, g);
    box(w - 0.03, h - 0.03, 0.015, mat, x, y, d + 0.007, g);                                   // cover lip
    for (const yy of [-h / 2 + 0.12, h / 2 - 0.12]) cyl(0.012, 0.012, 0.05, std({ color: '#5a5e60', metalness: 0.6 }), x - w / 2 - 0.006, y + yy, d - 0.01, g, 8);
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) cyl(0.008, 0.008, 0.01, std({ color: '#7a7e80', metalness: 0.7 }), x + sx * (w / 2 - 0.04), y + sy * (h / 2 - 0.04), d + 0.016, g, 6).rotation.x = Math.PI / 2;
  };
  cab(0.78, 0.9, 0.28, grey, -0.55, 1.75);
  cab(0.8, 1.38, 0.32, gv, 0.45, 1.55);
  box(0.06, 0.32, 0.1, gv, 0.88, 1.6, 0.18, g); box(0.03, 0.18, 0.05, std({ color: '#2a2c2e' }), 0.92, 1.62, 0.2, g);   // disconnect handle housing + lever
  const lbl = sticker(64, 64, (x, w, h) => { x.fillStyle = '#2a6ac8'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'B2', w / 2, 34, 50, 30, F.heavy); });
  plane(0.05, 0.05, lbl, 0.45, 2.16, 0.33, 0, g);
  const fit = std({ color: '#5a5e60', metalness: 0.6, roughness: 0.4 });
  for (const y of [1.9, 1.75]) cyl(0.03, 0.03, 0.08, fit, -0.12, y, 0.12, g, 14).rotation.z = Math.PI / 2;   // fittings between the boxes
  // conduits: four under each box down to grade, on two strut-channel straps (left) / straight into the gravel (right)
  const conduit = (x, y0, y1) => { cyl(0.032, 0.032, y1 - y0, pvc, x, (y0 + y1) / 2, 0.06, g, 14); cyl(0.038, 0.038, 0.06, pvc, x, y1 - 0.03, 0.06, g, 14); cyl(0.038, 0.038, 0.05, pvc, x, y0 + 0.4, 0.06, g, 14); };
  for (let i = 0; i < 4; i++) { conduit(-0.82 + i * 0.18, 0.0, 1.3); conduit(0.18 + i * 0.18, 0.0, 0.86); }
  const strut = (x0, x1, y) => { box(x1 - x0, 0.042, 0.042, gv, (x0 + x1) / 2, y, 0.025, g); for (let x = x0 + 0.09; x < x1; x += 0.18) { const c = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.006, 6, 16, Math.PI), gv); c.position.set(x, y, 0.06); c.rotation.z = Math.PI / 2; c.rotation.y = Math.PI / 2; g.add(c); } };
  strut(-0.93, -0.2, 0.75); strut(-0.93, -0.2, 0.22);
  // a meter on a socket to the right
  const m = new THREE.Group(); m.position.set(1.25, 1.45, 0); g.add(m);
  rbox(0.3, 0.42, 0.12, 0.02, gv, 0, 0, 0.06, m); cyl(0.11, 0.11, 0.05, gv, 0, 0.02, 0.14, m, 24).rotation.x = Math.PI / 2;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 12, 0, 6.283, 0, Math.PI / 2), std({ color: '#e8f0f2', transparent: true, opacity: 0.35, roughness: 0.05 })); dome.rotation.x = Math.PI / 2; dome.position.set(0, 0.02, 0.165); m.add(dome);
  plane(0.13, 0.13, sticker(128, 128, (x, w, h) => { x.fillStyle = '#f2f2ee'; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); x.fillStyle = '#111'; x.fillRect(30, 40, 68, 22); x.fillStyle = '#9aff9a'; fitText(x, '04417', 64, 52, 60, 16, F.label); x.fillStyle = '#555'; fitText(x, 'kWh', 64, 84, 40, 14, F.label); }), 0, 0.02, 0.168, 0, m);
  cyl(0.032, 0.032, 1.25, pvc, 1.25, 0.62, 0.06, g, 14);
  // river-rock gravel strip along the wall base
  const r = rng(59), rock = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.04, 0), std({ color: '#a89a88', roughness: 0.9 }), 260);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler();
  for (let i = 0; i < 260; i++) { const s = 0.5 + r() * 0.9; Q.setFromEuler(E.set(r() * 3, r() * 3, r() * 3)); M.compose(new THREE.Vector3(-1.3 + r() * 2.9, 0.015, 0.03 + r() * 0.35), Q, new THREE.Vector3(s * 1.3, s * 0.6, s)); rock.setMatrixAt(i, M); const c = new THREE.Color().setHSL(0.08, 0.15, 0.45 + r() * 0.25); rock.setColorAt(i, c); }
  rock.receiveShadow = true; g.add(rock);
  g.userData.collider = [-1.4, 1.6, 0, 0.45];
  return g;
}

// ---- ribbed telecom pedestal ----------------------------------------------------------------------------------
export function makeTelecomPedestal() {
  const g = new THREE.Group(); g.name = 'telecom_pedestal';
  const mat = std({ map: paintTex('#a9c4a6', 7), roughness: 0.55 });
  // cross-section: a rounded square with shallow vertical ribs all round
  const S = 0.17, sh = new THREE.Shape(), N = 64;
  for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); const sq = 1 / Math.pow(Math.pow(Math.abs(c), 4) + Math.pow(Math.abs(s), 4), 0.25); const rib = 1 + 0.035 * Math.max(0, Math.cos(a * 16)); const r = S * sq * rib; i ? sh.lineTo(c * r, s * r) : sh.moveTo(c * r, s * r); }
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.82, bevelEnabled: false, curveSegments: 2 }), mat); body.rotation.x = -Math.PI / 2; body.castShadow = true; g.add(body);
  // cap: a slightly bigger ribbed band + a pyramid top with rounded edges
  const capBand = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.16, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 2 }), mat); capBand.rotation.x = -Math.PI / 2; capBand.scale.set(1.06, 1.06, 1); capBand.position.y = 0.8; g.add(capBand);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.09, 4, 1), mat); top.rotation.y = Math.PI / 4; top.position.y = 1.015; g.add(top);
  rbox(0.07, 0.04, 0.03, 0.01, std({ color: '#3a3e3c', metalness: 0.5 }), 0, 0.7, 0.19, g);   // lock tab
  plane(0.1, 0.06, sticker(128, 76, (x, w, h) => { x.fillStyle = '#f2f0e8'; x.fillRect(0, 0, w, h); x.fillStyle = '#c81e28'; fitText(x, 'CAUTION', w / 2, 18, 110, 16, F.heavy); x.fillStyle = '#222'; fitText(x, 'buried cable', w / 2, 42, 110, 14, F.label); fitText(x, '(555) 014-0090', w / 2, 62, 110, 12, F.label); }), 0, 0.6, 0.183, 0, g);
  g.userData.collider = [-0.22, 0.22, -0.22, 0.22];
  return g;
}

// ---- fire-department sprinkler connection (util05) -------------------------------------------------------------
export function makeSprinklerFDC() {
  const g = new THREE.Group(); g.name = 'sprinkler_fdc';
  const chr = std({ color: '#d4d8da', metalness: 0.45, roughness: 0.22 }), red = std({ color: '#c41e24', roughness: 0.4 });
  const ring = canvasT(256, 256, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#c41e24'; x.beginPath(); x.arc(128, 128, 126, 0, 7); x.fill(); x.fillStyle = '#e8e8e4'; x.beginPath(); x.arc(128, 128, 62, 0, 7); x.fill();
    x.fillStyle = '#fff'; x.font = `bold 30px ${F.heavy}`; x.textAlign = 'center'; const arc = (t, r, a0, a1, flip) => { const n = t.length; for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * (i + 0.5) / n; x.save(); x.translate(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); x.rotate(a + (flip ? -Math.PI / 2 : Math.PI / 2)); x.fillText(t[i], 0, 10); x.restore(); } };
    arc('AUTO. SPKR.', 92, -Math.PI * 0.85, -Math.PI * 0.15, false); x.font = `bold 15px ${F.label}`; arc('FIRE DEPT CONNECTION', 76, -Math.PI * 0.78, -Math.PI * 0.22, false); });
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.012, 40), [red, std({ map: ring, transparent: true, roughness: 0.4 }), red]); plate.rotation.x = Math.PI / 2; plate.position.z = 0.006; g.add(plate);
  // body: a short pipe out of the wall into a two-way siamese, each inlet with a rocker-lug cap on a chain
  const bodyP = cyl(0.06, 0.06, 0.12, chr, 0, 0, 0.07, g, 24); bodyP.rotation.x = Math.PI / 2;
  const tee = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), chr); tee.scale.set(1.5, 1, 1); tee.position.z = 0.15; g.add(tee);
  for (const s of [-1, 1]) {
    const inl = new THREE.Group(); inl.position.set(s * 0.07, 0, 0.16); inl.rotation.y = s * 0.5; g.add(inl);
    const bore = cyl(0.05, 0.05, 0.1, chr, 0, 0, 0.06, inl, 24); bore.rotation.x = Math.PI / 2;
    const cap = cyl(0.058, 0.058, 0.05, chr, 0, 0, 0.13, inl, 24); cap.rotation.x = Math.PI / 2;
    for (let k = 0; k < 3; k++) { const a = k / 3 * 6.283; box(0.018, 0.03, 0.04, chr, Math.cos(a) * 0.062, Math.sin(a) * 0.062, 0.13, inl).rotation.z = a; }
    const ch = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.004, 4, 20, Math.PI * 0.8), chr); ch.position.set(0, -0.05, 0.1); ch.rotation.x = Math.PI / 2; inl.add(ch);
  }
  // ball drip valve below
  const dr = cyl(0.016, 0.016, 0.08, chr, 0, -0.26, 0.04, g, 12); dr.rotation.x = Math.PI / 2;
  cyl(0.03, 0.026, 0.05, chr, 0, -0.27, 0.09, g, 16).rotation.x = Math.PI / 2;
  return g;
}

// ---- accessible parking sign (redrawn; generic wording) -----------------------------------------------------------
// the international wheelchair symbol, as on the photo's sign: head, upright torso, arm and seat bars to the right,
// the leg down to a footrest, and the big wheel as an open ring around the lower left. Drawn in a 100-unit box
// centred on (cx, cy), scale s (units -> px).
function isa(x, cx, cy, s, col) {
  x.save(); x.translate(cx - 50 * s, cy - 50 * s); x.scale(s, s); x.fillStyle = col; x.strokeStyle = col; x.lineCap = 'butt'; x.lineJoin = 'miter';
  x.beginPath(); x.arc(40, 12, 9.5, 0, 7); x.fill();                                 // head
  x.beginPath(); x.roundRect(33, 25, 13, 40, 6); x.fill();                           // torso
  x.fillRect(44, 37, 26, 9);                                                         // arm
  x.fillRect(33, 56, 38, 9);                                                         // seat
  x.lineWidth = 9; x.beginPath(); x.moveTo(66, 60); x.lineTo(80, 84); x.lineTo(92, 80); x.stroke();   // leg + footrest
  x.lineWidth = 8; x.beginPath(); x.arc(42, 66, 25, 0.62, 4.2); x.stroke();        // wheel, open at the upper right
  x.restore();
}
export function makeAccessibleSign(onPost = true, van = false) {
  const g = new THREE.Group(); g.name = 'accessible_sign';
  const SW = 0.3, SH = 0.45, RAD = 0.022;
  const t = canvasT(400, 600, (x, w, h) => {
    x.fillStyle = '#f4f4ef'; x.fillRect(0, 0, w, h);                                 // white reflective rim
    x.fillStyle = '#1f3f9e'; x.beginPath(); x.roundRect(9, 9, w - 18, h - 18, 22); x.fill();
    // faint sheeting texture
    for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`; x.fillRect(9 + Math.random() * (w - 18), 9 + Math.random() * (h - 18), 2, 18); }
    x.strokeStyle = '#f4f4ef'; x.lineWidth = 7; x.beginPath(); x.roundRect(78, 72, 244, 214, 12); x.stroke();   // the symbol's frame
    isa(x, 205, 182, 1.9, '#f4f4ef');
    x.fillStyle = '#f4f4ef'; fitText(x, 'HANDICAPPED', w / 2, 390, w - 64, 60, F.label, { weight: 600 }); fitText(x, 'PARKING', w / 2, 470, w - 150, 64, F.label, { weight: 600 });
    x.fillStyle = 'rgba(244,244,239,0.6)'; fitText(x, 'R7-8', w - 60, h - 26, 60, 12, F.label);
  });
  // the plate: a rounded-rectangle aluminum blank, the printed face on the front
  const shp = new THREE.Shape(); shp.moveTo(-SW / 2 + RAD, -SH / 2); shp.lineTo(SW / 2 - RAD, -SH / 2); shp.quadraticCurveTo(SW / 2, -SH / 2, SW / 2, -SH / 2 + RAD); shp.lineTo(SW / 2, SH / 2 - RAD); shp.quadraticCurveTo(SW / 2, SH / 2, SW / 2 - RAD, SH / 2); shp.lineTo(-SW / 2 + RAD, SH / 2); shp.quadraticCurveTo(-SW / 2, SH / 2, -SW / 2, SH / 2 - RAD); shp.lineTo(-SW / 2, -SH / 2 + RAD); shp.quadraticCurveTo(-SW / 2, -SH / 2, -SW / 2 + RAD, -SH / 2);
  const alu = std({ color: '#c4c8ca', metalness: 0.5, roughness: 0.4 });
  const plate = new THREE.Mesh(new THREE.ExtrudeGeometry(shp, { depth: 0.003, bevelEnabled: false, curveSegments: 6 }), alu); plate.position.z = -0.003; plate.castShadow = true;
  const fg = new THREE.ShapeGeometry(shp, 6); const uv = fg.attributes.uv, fp = fg.attributes.position; for (let k = 0; k < uv.count; k++) uv.setXY(k, fp.getX(k) / SW + 0.5, fp.getY(k) / SH + 0.5);
  const face = new THREE.Mesh(fg, std({ map: t, roughness: 0.3, metalness: 0.05 })); face.position.z = 0.0005;
  const sign = new THREE.Group(); sign.add(plate, face); g.add(sign);
  // two bolts with silver washers through the top and bottom
  const steel = std({ color: '#d0d4d6', metalness: 0.6, roughness: 0.3 });
  for (const y of [SH / 2 - 0.035, -SH / 2 + 0.035]) { const w = cyl(0.016, 0.016, 0.003, steel, 0, y, 0.002, sign, 18); w.rotation.x = Math.PI / 2; const b = cyl(0.007, 0.008, 0.006, steel, 0, y, 0.005, sign, 6); b.rotation.x = Math.PI / 2; }
  if (onPost) {
    sign.position.y = van ? 2.06 : 1.85;
    if (van) {   // "VAN ACCESSIBLE" plate under the main sign, bottom edge 1.6 m up
      const vt = canvasT(400, 200, (x, w, h) => { x.fillStyle = '#f4f4ef'; x.fillRect(0, 0, w, h); x.fillStyle = '#1f3f9e'; x.beginPath(); x.roundRect(9, 9, w - 18, h - 18, 16); x.fill(); x.fillStyle = '#f4f4ef'; fitText(x, 'VAN', w / 2, 62, w - 80, 70, F.label, { weight: 600 }); fitText(x, 'ACCESSIBLE', w / 2, 142, w - 50, 62, F.label, { weight: 600 }); });
      const vp = new THREE.Group(); vp.position.y = 1.75; g.add(vp);
      box(0.3, 0.15, 0.003, std({ color: '#c4c8ca', metalness: 0.5, roughness: 0.4 }), 0, 0, -0.0015, vp); plane(0.3, 0.15, std({ map: vt, roughness: 0.3 }), 0, 0, 0.0005, 0, vp);
      for (const xx of [-0.11, 0.11]) cyl(0.012, 0.012, 0.003, std({ color: '#d0d4d6', metalness: 0.6, roughness: 0.3 }), xx, 0, 0.002, vp, 14).rotation.x = Math.PI / 2;
    }
    // galvanized U-channel post with its row of holes
    const holes = canvasT(32, 256, (x, w, h) => { x.fillStyle = '#b8bcbe'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a2a2a'; for (let y = 6; y < h; y += 12) { x.beginPath(); x.arc(16, y, 3, 0, 7); x.fill(); } });
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.1, 0.012), std({ map: holes, metalness: 0.4, roughness: 0.45 })); post.position.set(0, 1.05, -0.012); post.castShadow = true; g.add(post);
    for (const s of [-1, 1]) box(0.008, 2.1, 0.035, galv(), s * 0.026, 1.05, -0.03, g);
    g.userData.collider = [-0.15, 0.15, -0.08, 0.05];
  }
  return g;
}

// ---- fallen leaves: real curled leaves (the photo cutouts on bent, cupped geometry), instanced -------------------
export function makeLeafScatter(n = 80, w = 8, d = 8, seed = 4) {
  const g = new THREE.Group(); g.name = 'leaf_scatter';
  const leafGeo = (len, wid, curl, cup) => { const geo = new THREE.PlaneGeometry(wid, len, 6, 10); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, curl * (z / len + 0.5) ** 2 + cup * (x / wid * 2) ** 2 + 0.006); } geo.computeVertexNormals(); return geo; };
  const kinds = [
    [leafGeo(0.24, 0.2, 0.02, 0.018), std({ map: tex('pk_leaf_y'), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6 })],
    [leafGeo(0.16, 0.2, 0.05, 0.03), std({ map: tex('pk_leaf_t'), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 })],
  ];
  const r = rng(seed), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler();
  kinds.forEach(([geo, mat], k) => {
    const cnt = Math.round(n * (k ? 0.6 : 0.4)), im = new THREE.InstancedMesh(geo, mat, cnt);
    for (let i = 0; i < cnt; i++) { const s = 0.6 + r() * 0.6; Q.setFromEuler(E.set((r() - 0.5) * 0.3, r() * 6.28, (r() - 0.5) * 0.3)); M.compose(new THREE.Vector3((r() - 0.5) * w, 0, (r() - 0.5) * d), Q, new THREE.Vector3(s, s, s)); im.setMatrixAt(i, M); }
    im.castShadow = true; im.receiveShadow = true; g.add(im);
  });
  return g;
}

// ---- the lot ------------------------------------------------------------------------------------------------------
export function makeUtilityLot() {
  const g = new THREE.Group(); g.name = 'utility_lot';
  const X0 = -11, X1 = 11, Z0 = -10, Z1 = 10, SX = -7;   // SX: front edge of the asphalt (sand/grass strip in front)
  // asphalt with painted lines baked into one canvas over the photo asphalt tile
  const asph = new THREE.Mesh(new THREE.PlaneGeometry(X1 - SX, Z1 - Z0), std({ map: tex('pk_asphalt', (X1 - SX) / 0.55, (Z1 - Z0) / 0.55), roughness: 0.9 }));
  asph.rotation.x = -Math.PI / 2; asph.position.set((X1 + SX) / 2, 0.025, 0); asph.receiveShadow = true; g.add(asph);
  // paint: worn white stall lines, a blue accessible stall with the symbol, a striped access aisle (canvas decal)
  const PW = X1 - SX, PD = Z1 - Z0, PPM = 40;   // pixels per metre
  const paint = canvasT(PW * PPM, PD * PPM, (x, w, h) => {
    x.clearRect(0, 0, w, h); const r = rng(9); const m = (v) => v * PPM;
    const line = (x0, y0, x1, y1) => { x.fillRect(Math.min(x0, x1), Math.min(y0, y1), Math.max(Math.abs(x1 - x0), m(0.1)), Math.max(Math.abs(y1 - y0), m(0.1))); };
    // canvas u = lot x from SX, v = lot z from Z0. Stalls: 5.5 m deep against the back wall (x 5.5..11), 2.7 m wide
    const SD = 5.5, xa = m(PW - SD);
    const stalls = [-10, -7.3, -4.6, -1.9, 0.8, 3.5, 6.2, 8.9];
    x.fillStyle = '#f2f2ec';
    for (const z of stalls) line(xa, m(z - Z0), w, m(z - Z0) + m(0.1));
    // two accessible stalls (z -4.6..-1.9 and 0.8..3.5) sharing one hatched access aisle (z -1.9..0.8), as US
    // accessible parking is marked: each stall gets the painted symbol (util08: a light-blue square with a thick white
    // border, the symbol upright as seen from the drive aisle, its top toward the wall) and its own sign at its head
    for (const z0 of [-4.6, 0.8]) { const bx = xa + m(1.7), bz = m(z0 - Z0) + m(0.45), BS = m(1.8);
      x.fillStyle = '#f2f2ec'; x.fillRect(bx, bz, BS, BS); x.fillStyle = '#3f8ed8'; x.fillRect(bx + m(0.13), bz + m(0.13), BS - m(0.26), BS - m(0.26));
      x.save(); x.translate(bx + BS / 2, bz + BS / 2); x.rotate(Math.PI / 2); isa(x, 4, -2, m(1.4) / 100, '#f2f2ec'); x.restore(); }
    x.fillStyle = '#f2f2ec'; x.save(); x.beginPath(); x.rect(xa, m(-1.9 - Z0), m(SD), m(2.7)); x.clip(); x.lineWidth = m(0.1); x.strokeStyle = '#f2f2ec';
    for (let k = -6; k < 10; k++) { x.beginPath(); x.moveTo(xa + k * m(0.9), m(-1.9 - Z0)); x.lineTo(xa + k * m(0.9) + m(2.7), m(0.8 - Z0)); x.stroke(); } x.restore();
    // "NO PARKING" across the aisle at its open end, reading from the drive aisle (a clear band cut in the hatching)
    x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(xa + m(0.35), m(-1.9 - Z0) + m(0.12), m(1.15), m(2.46)); x.restore();
    x.save(); x.translate(xa + m(0.92), m(-0.55 - Z0)); x.rotate(Math.PI / 2); x.fillStyle = '#f2f2ec'; fitText(x, 'NO', 0, -m(0.27), m(1.2), m(0.42), F.label, { weight: 700 }); fitText(x, 'PARKING', 0, m(0.25), m(2.3), m(0.42), F.label, { weight: 700 }); x.restore();
    x.strokeRect(xa, m(-1.9 - Z0), m(SD), m(2.7));
    // drive-aisle arrow
    x.fillStyle = '#f2f2ec'; x.beginPath(); const ax = m(5), ay = m(6 - Z0); x.moveTo(ax, ay - m(1.2)); x.lineTo(ax + m(0.5), ay - m(0.3)); x.lineTo(ax + m(0.15), ay - m(0.3)); x.lineTo(ax + m(0.15), ay + m(1.0)); x.lineTo(ax - m(0.15), ay + m(1.0)); x.lineTo(ax - m(0.15), ay - m(0.3)); x.lineTo(ax - m(0.5), ay - m(0.3)); x.fill();
    // wear: knock speckles out of the paint
    x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 5000; i++) { x.fillStyle = `rgba(0,0,0,${0.1 + r() * 0.3})`; x.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); } x.globalCompositeOperation = 'source-over';
  });
  const pm = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), std({ map: paint, transparent: true, depthWrite: false, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2 }));
  pm.rotation.x = -Math.PI / 2; pm.position.set((X1 + SX) / 2, 0.03, 0); pm.receiveShadow = true; g.add(pm);
  // concrete wheel stops at each stall
  const stopM = std({ map: tex('lot_concrete', 1, 0.2), color: '#c8c4b8', roughness: 0.9 });
  for (const z of [-8.65, -5.95, -3.25, -0.55, 2.15, 4.85, 7.55]) { if (z === -0.55) continue; const s = rbox(0.18, 0.12, 1.8, 0.03, stopM, X1 - 0.9, 0.085, z, g); void s; }
  // the sand/grass strip at the front, a curb between it and the asphalt
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(SX - X0, Z1 - Z0), std({ map: tex('pk_sand', (SX - X0) / 0.7, (Z1 - Z0) / 0.7), roughness: 1 })); sand.rotation.x = -Math.PI / 2; sand.position.set((X0 + SX) / 2, 0.03, 0); sand.receiveShadow = true; g.add(sand);
  box(0.15, 0.15, Z1 - Z0, std({ color: '#b8b4aa', roughness: 0.9 }), SX, 0.075, 0, g);
  // the dry-grass patch (texture library, item 60) and a mulch planter with flowering shrubs at the front corner
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 6), libMat('tx_drygrass', 1.6, 1.6, { roughness: 1, color: '#e0cca8' })); grass.geometry.attributes.uv.array.forEach((v, k, arr) => { arr[k] = v * (k % 2 ? 6 : 2.6); }); grass.rotation.x = -Math.PI / 2; grass.position.set(X0 + 1.5, 0.032, 0.4); grass.receiveShadow = true; g.add(grass);
  const planter = makeMulchPlanter(5.6, 2.6, 3, 7); planter.position.set(X0 + 1.9, 0.03, 6.7); planter.rotation.y = Math.PI / 2; g.add(planter);
  // a low tan-stucco screen wall with the stacked-stone band + cap along the sidewalk, a gap for the driveway
  const wA = makeStuccoWall(6.6); wA.position.set(X0 + 0.2, 0.03, -6.6); wA.rotation.y = Math.PI / 2; g.add(wA);
  const wB = makeStuccoWall(2.8); wB.position.set(X0 + 0.2, 0.03, 8.5); wB.rotation.y = Math.PI / 2; g.add(wB);
  // the back wall: split-face block with a stacked-stone column (the sign + the sprinkler connection) and a cap
  const WH = 6.5;
  const blockW = new THREE.Mesh(new THREE.PlaneGeometry(Z1 - Z0, WH), std({ map: tex('pk_block', (Z1 - Z0) / 3.2, WH / 1.6), roughness: 0.92 }));
  blockW.rotation.y = -Math.PI / 2; blockW.position.set(X1, WH / 2, 0); blockW.receiveShadow = true; g.add(blockW);
  const stone = box(0.18, 2.6, 2.9, std({ map: tex('pk_stone', 2.9 / 1.4, 2.6 / 1.4), roughness: 0.95 }), X1 - 0.09, 1.3, -3.25, g);
  stone.material.map = tex('pk_stone', 2.9 / 1.4, 2.6 / 1.4);
  box(0.24, 0.08, 3.0, std({ color: '#b8b0a0', roughness: 0.85 }), X1 - 0.11, 2.64, -3.25, g);   // stone cap
  box(0.3, 0.25, Z1 - Z0, std({ color: '#c8c0b0', roughness: 0.85 }), X1 + 0.05, WH, 0, g);       // parapet cap
  // windows high on the wall (as behind the transformer in util01)
  for (const z of [3.5, 7.5]) { const wn = new THREE.Group(); wn.position.set(X1 - 0.02, 4.3, z); wn.rotation.y = -Math.PI / 2; g.add(wn); box(1.6, 1.3, 0.06, std({ color: '#e8e8e4' }), 0, 0, 0, wn); plane(1.44, 1.14, std({ color: '#5a7a8a', roughness: 0.05, metalness: 0.4, emissive: '#1a2a3a', emissiveIntensity: 0.4 }), 0, 0, 0.032, 0, wn); box(0.04, 1.14, 0.03, std({ color: '#e8e8e4' }), 0, 0, 0.04, wn); }
  // wall-pack lights over the stalls (dark bronze boxes with a glowing lens) light the wall and its equipment
  for (const z of [-6.0, -0.55, 6.5]) { box(0.28, 0.32, 0.4, std({ color: '#3a3430', metalness: 0.4 }), X1 - 0.2, 3.3, z, g); plane(0.3, 0.2, std({ color: '#fff4dc', emissive: '#ffe8c0', emissiveIntensity: 2.2 }), X1 - 0.41, 3.24, z, -Math.PI / 2, g); const wl = new THREE.PointLight('#ffe8c8', 7, 13, 1.5); wl.position.set(X1 - 0.8, 3.1, z); g.add(wl); }
  const sign = makeAccessibleSign(false); sign.position.set(X1 - 0.185, 1.8, -3.25); sign.rotation.y = -Math.PI / 2; g.add(sign);   // centred on its stall, bottom edge 1.57 m up (min 1.52 m)
  const fdc = makeSprinklerFDC(); fdc.position.set(X1 - 0.18, 0.95, -4.2); fdc.rotation.y = -Math.PI / 2; g.add(fdc);
  const cabs = makeWallCabinets(); cabs.position.set(X1, 0.03, 4.5); cabs.rotation.y = -Math.PI / 2; g.add(cabs);
  // a second accessible sign on a post at the head of the stall
  const ps = makeAccessibleSign(true, true); ps.position.set(X1 - 0.35, 0.03, 2.15); ps.rotation.y = -Math.PI / 2; g.add(ps);   // the van-accessible stall's sign, centred at its head
  // the transformer on its pad in the strip (doors toward the drive), the telecom pedestal beside it
  const tf = makePadTransformer(); tf.position.set(-9.2, 0.03, -6.0); tf.rotation.y = Math.PI / 2; g.add(tf);
  const ped = makeTelecomPedestal(); ped.position.set(-9.6, 0.03, -2.6); g.add(ped);
  // fallen leaves: drifts against the curb + the wall, a scatter over the asphalt
  const lv1 = makeLeafScatter(90, 3.8, 19, 3); lv1.position.set(-9, 0.03, 0); g.add(lv1);
  const lv2 = makeLeafScatter(70, 1.2, 19, 5); lv2.position.set(X1 - 0.6, 0.03, 0); g.add(lv2);
  const lv3 = makeLeafScatter(60, 17, 19, 8); lv3.position.set(2, 0.03, 0); g.add(lv3);
  // a lot light on a pole
  const pole = cyl(0.08, 0.1, 7, std({ color: '#3a3c3e', metalness: 0.5 }), -6.6, 3.5, 8.6, g, 12); void pole;
  box(0.9, 0.18, 0.4, std({ color: '#3a3c3e', metalness: 0.5 }), -6.3, 7.0, 8.6, g); plane(0.8, 0.3, std({ color: '#fff4d8', emissive: '#ffe8b0', emissiveIntensity: 2 }), -6.3, 6.905, 8.6, 0, g).rotation.x = Math.PI / 2;
  const lamp = new THREE.PointLight('#ffe8c0', 14, 22, 1.6); lamp.position.set(-6.3, 6.6, 8.6); g.add(lamp);
  // colliders (local rects) + the walkable area
  const T = (o, c) => { const [a, b, c0, c1] = c, q = Math.round(o.rotation.y / (Math.PI / 2)) & 3; let r; if (q === 0) r = [a, b, c0, c1]; else if (q === 2) r = [-b, -a, -c1, -c0]; else if (q === 1) r = [c0, c1, -b, -a]; else r = [-c1, -c0, a, b]; return [o.position.x + r[0], o.position.x + r[1], o.position.z + r[2], o.position.z + r[3]]; };
  g.userData.colliders = [T(wA, wA.userData.collider), T(wB, wB.userData.collider), T(planter, planter.userData.collider), T(tf, tf.userData.collider), T(ped, ped.userData.collider), T(cabs, cabs.userData.collider), T(ps, ps.userData.collider), [X1 - 0.2, X1 + 0.3, Z0, Z1], [-6.75, -6.45, 8.45, 8.75]];
  g.userData.area = { minX: X0 + 0.2, maxX: X1 - 0.25, minZ: Z0 + 0.2, maxZ: Z1 - 0.2 };
  return g;
}
