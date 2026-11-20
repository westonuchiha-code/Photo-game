// Random street batch (queue item 64, photos/random/). Everything modelled; surfaces from the photos where they are
// surfaces (tools/tex_64.py: the store's grey square tiles, the aircraft's weathered skin).
//   makeCornerStore()     a corner convenience store (made-up "CORNER MART 24") in the ground floor of a dark tiled
//                         5-storey block: tiled corner pier with a red alarm bell, glass fronts on both streets with a
//                         sliding door, the lit white/blue fascia band wrapping the corner, a bright interior (shelves of
//                         products, drink coolers, counter + register, magazine rack), blue crates, an umbrella stand,
//                         wet glossy pavement. 16 x 10 m, corner at local (-8, +5), fronts toward +z and -x.
//   makePoliceSedan()     a black-and-white police sedan on real full-size-sedan dimensions (4.9 x 1.8 x 1.47 m,
//                         2.85 m wheelbase): white upper body + roof, black lower doors, red roof light bar, POLICE on
//                         the doors and boot (generic wording), made-up plate. Front toward +x.
//   makeAircraftCarport() an old aircraft nose section (glazed nose, framed canopy, number "07") strapped on a steel
//                         frame above a carport, a low brick wall and a sliding steel gate with a made-up number.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';
import { makeSushiCase, makeGroceryEndcap, makeCounterThings } from './grocery66.js';
import { makeReceipt, makeRiceballPack } from './misc67.js';
import { makeChipTower } from './inspo68.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx = 1, ry = 1) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function phys(o) { return new THREE.MeshPhysicalMaterial({ roughness: 0.3, ...o }); }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 16) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; }
function rod(a, b, r, mat, p, seg = 8) { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
// box with UVs in metres on every face, so a tile texture keeps its real size
function tileBox(w, h, d, mat, x, y, z, p, tile = 0.42) {
  const g = new THREE.BoxGeometry(w, h, d); const uv = g.attributes.uv; const sc = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * sc[f][0] / tile, uv.getY(i) * sc[f][1] / tile); }
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m;
}

// ---- corner store ------------------------------------------------------------------------------------------------
function productTex(seed) {   // a shelf face: rows of small packages in bright colours with price strips
  return canvasT(512, 256, (x, w, h) => {
    const r = rng(seed); x.fillStyle = '#e8e8e4'; x.fillRect(0, 0, w, h);
    for (let row = 0; row < 4; row++) {
      const y0 = row * 64; x.fillStyle = '#c8ccd0'; x.fillRect(0, y0 + 56, w, 8); x.fillStyle = '#f2f2ee'; for (let k = 0; k < 12; k++) x.fillRect(k * 44 + 6, y0 + 57, 20, 6);
      let px = 2; while (px < w) { const pw = 14 + r() * 26, ph = 26 + r() * 26; const c = ['#e8402a', '#2a8ad0', '#f2c21a', '#3ab84a', '#f08a2a', '#e86aa0', '#7a4ad0', '#ffffff', '#1a1a1a', '#c8a050'][Math.floor(r() * 10)];
        x.fillStyle = c; x.fillRect(px, y0 + 56 - ph, pw - 2, ph); x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(px + 2, y0 + 56 - ph + 4, (pw - 6) * 0.6, 4); px += pw; }
    }
  });
}
function coolerTex() {   // drink cooler doors: lit shelves of bottles behind glass
  return canvasT(256, 512, (x, w, h) => {
    const r = rng(3); x.fillStyle = '#f4f8ff'; x.fillRect(0, 0, w, h);
    for (let row = 0; row < 6; row++) { const y0 = 20 + row * 80; x.fillStyle = '#b8c0c8'; x.fillRect(0, y0 + 70, w, 6);
      for (let k = 0; k < 9; k++) { const c = ['#e8402a', '#2a8ad0', '#3ab84a', '#f2c21a', '#ffffff', '#f08a2a', '#1a3a8a'][Math.floor(r() * 7)]; x.fillStyle = c; x.fillRect(8 + k * 27, y0 + 18, 20, 52); x.fillStyle = 'rgba(255,255,255,0.5)'; x.fillRect(10 + k * 27, y0 + 20, 4, 46); x.fillStyle = '#ddd'; x.fillRect(12 + k * 27, y0 + 10, 12, 10); } }
    x.fillStyle = '#9aa0a8'; x.fillRect(w / 2 - 3, 0, 6, h);
  });
}
export function makeCornerStore() {
  const g = new THREE.Group(); g.name = 'corner_store';
  const W = 16, D = 10, X0 = -W / 2, X1 = W / 2, Z0 = -D / 2, Z1 = D / 2, GH = 3.6, FL = 4, FH = 3.1;
  const tile = std({ map: tex('rs_tile'), roughness: 0.35, metalness: 0.05 }), dark = std({ map: tex('rs_tile'), color: '#6a6c70', roughness: 0.4 });
  const frameM = std({ color: '#c8ccd0', metalness: 0.7, roughness: 0.3 }), glassM = phys({ color: '#d8e8f0', transparent: true, opacity: 0.12, roughness: 0.02, depthWrite: false, side: THREE.DoubleSide });
  // upper floors: dark tiled block with recessed windows (a few lit) and balcony slabs on the side street
  const top = GH + FL * FH;
  tileBox(W, top - GH - 0.9, D, dark, 0, GH + 0.9 + (top - GH - 0.9) / 2, 0, g);
  const wl = canvasT(128, 128, (x) => { const gr = x.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#ffd8a0'); gr.addColorStop(1, '#c88a50'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); x.fillStyle = 'rgba(90,60,40,0.55)'; x.fillRect(0, 0, 30, 128); x.fillRect(98, 0, 30, 128); x.fillStyle = 'rgba(60,40,30,0.4)'; x.fillRect(40, 70, 40, 58); });
  const wd = std({ color: '#1a1c20', roughness: 0.1, metalness: 0.4 }), wlit = std({ map: wl, emissive: '#ffffff', emissiveMap: wl, emissiveIntensity: 0.55, roughness: 0.15 });
  const winFrame = std({ color: '#3a3c40', metalness: 0.5, roughness: 0.4 });
  const r = rng(64);
  for (let f = 0; f < FL; f++) {
    const y = GH + 0.9 + f * FH + 1.5;
    for (let i = 0; i < 4; i++) { const x = X0 + 2.2 + i * 3.8; plane(1.6, 1.4, r() < 0.3 ? wlit : wd, x, y, Z1 + 0.006, 0, g); box(1.72, 0.06, 0.12, winFrame, x, y + 0.73, Z1 + 0.04, g); box(1.72, 0.06, 0.16, winFrame, x, y - 0.73, Z1 + 0.05, g); for (const s2 of [-1, 1]) box(0.06, 1.46, 0.12, winFrame, x + s2 * 0.83, y, Z1 + 0.04, g); box(0.04, 1.4, 0.04, winFrame, x, y, Z1 + 0.03, g); }
    for (let i = 0; i < 2; i++) { const z = Z0 + 2.5 + i * 4.5; plane(1.6, 1.4, r() < 0.3 ? wlit : wd, X0 - 0.006, y, z, -Math.PI / 2, g); box(0.12, 0.06, 1.72, winFrame, X0 - 0.04, y + 0.73, z, g); box(0.16, 0.06, 1.72, winFrame, X0 - 0.05, y - 0.73, z, g); for (const s2 of [-1, 1]) box(0.12, 1.46, 0.06, winFrame, X0 - 0.04, y, z + s2 * 0.83, g); }
    box(W + 0.2, 0.12, 0.25, dark, 0, y - 0.95, Z1 + 0.12, g);
  }
  box(W + 0.3, 0.3, D + 0.3, std({ color: '#2a2c30' }), 0, top + 0.15, 0, g);
  // ground floor: tiled corner pier, piers at the far ends, tiled base under the glass
  tileBox(1.7, GH + 0.9, 1.7, tile, X0 + 0.85, (GH + 0.9) / 2, Z1 - 0.85, g);
  tileBox(0.8, GH + 0.9, 0.8, tile, X1 - 0.4, (GH + 0.9) / 2, Z1 - 0.4, g);
  tileBox(0.8, GH + 0.9, 0.8, tile, X0 + 0.4, (GH + 0.9) / 2, Z0 + 0.4, g);
  tileBox(W - 2.5, 0.42, 0.25, tile, 0.45, 0.21, Z1 - 0.12, g); tileBox(0.25, 0.42, D - 2.5, tile, X0 + 0.12, 0.21, -0.45, g);
  box(W, GH + 0.9, 0.2, dark, 0, (GH + 0.9) / 2, Z0, g); box(0.2, GH + 0.9, D, dark, X1, (GH + 0.9) / 2, 0, g);   // back + right walls
  // red alarm bell on the pier with its conduit
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: '#d81e1e', roughness: 0.35 })); bell.rotation.x = Math.PI / 2; bell.position.set(X0 + 1.1, 2.9, Z1 + 0.05); g.add(bell);
  rod(V(X0 + 1.1, 2.8, Z1 + 0.02), V(X0 + 1.1, 1.6, Z1 + 0.02), 0.012, std({ color: '#c8c8c4' }), g);
  // glass fronts: front (+z) from the pier to the right pier, side (-x) from the pier back; mullions, a sliding door
  const front = (x0, x1) => { for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / Math.round((x1 - x0) / 1.6)) box(0.07, GH - 0.42, 0.1, frameM, x, 0.42 + (GH - 0.42) / 2, Z1 - 0.1, g); const gl = plane(x1 - x0, GH - 0.42, glassM, (x0 + x1) / 2, 0.42 + (GH - 0.42) / 2, Z1 - 0.1, 0, g); void gl; };
  front(X0 + 1.7, X1 - 0.8);
  for (let z = Z0 + 0.8; z <= Z1 - 1.7 + 0.01; z += (D - 2.5) / 4) box(0.1, GH - 0.42, 0.07, frameM, X0 + 0.1, 0.42 + (GH - 0.42) / 2, z, g);
  plane(D - 2.5, GH - 0.42, glassM, X0 + 0.1, 0.42 + (GH - 0.42) / 2, -0.45, -Math.PI / 2, g);
  box(1.9, 0.06, 0.12, frameM, X0 + 3.2, 2.45, Z1 - 0.1, g);   // door header (the sliding door sits in the first bay, floor-level)
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.0), std({ color: '#2a2c30', roughness: 0.95 })); mat.rotation.x = -Math.PI / 2; mat.position.set(X0 + 3.2, 0.012, Z1 + 0.4); g.add(mat);
  // fascia band wrapping the corner: white, lit, with blue panels between the name boards and a thin red line
  const band = (len) => canvasT(Math.round(len * 128), 128, (x, w, h) => {
    x.fillStyle = '#f8fbff'; x.fillRect(0, 0, w, h); x.fillStyle = '#d83a5a'; x.fillRect(0, h * 0.86, w, 4);
    const n = Math.round(len / 2.6); for (let i = 0; i < n; i++) { const cx = (i + 0.5) * w / n; if (i === Math.floor(n / 2)) { x.fillStyle = '#1e4ab8'; fitText(x, 'CORNER MART 24', cx, h * 0.48, w / n * 2.2, 62, F.roman, { spacing: 4 }); continue; } if (Math.abs(i - Math.floor(n / 2)) === 1) continue; x.fillStyle = '#2a6ae0'; x.fillRect(cx - w / n * 0.38, h * 0.18, w / n * 0.76, h * 0.56); }
  });
  const bandM = (len) => { const t = band(len); return std({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 1.1, roughness: 0.3 }); };
  box(W + 0.15, 0.9, 0.35, bandM(W), 0.07, GH + 0.45, Z1 + 0.05, g).material = [std({ color: '#f2f6fa' }), std({ color: '#f2f6fa' }), std({ color: '#f2f6fa' }), std({ color: '#f2f6fa' }), bandM(W), std({ color: '#f2f6fa' })];
  const sb = box(0.35, 0.9, D + 0.15, std({ color: '#f2f6fa' }), X0 - 0.05, GH + 0.45, -0.07, g);
  sb.material = [std({ color: '#f2f6fa' }), bandM(D), std({ color: '#f2f6fa' }), std({ color: '#f2f6fa' }), std({ color: '#f2f6fa' }), std({ color: '#f2f6fa' })];
  // interior: white floor, bright ceiling panels, gondola shelves, coolers on the back wall, counter + register
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.4, D - 0.4), std({ color: '#e8e8e2', roughness: 0.25 })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.01; fl.receiveShadow = true; g.add(fl);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.4, D - 0.4), std({ color: '#f4f4f0' })); ceil.rotation.x = Math.PI / 2; ceil.position.y = GH - 0.05; g.add(ceil);
  const panelM = std({ color: '#ffffff', emissive: '#f4f8ff', emissiveIntensity: 2.2 });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.35), panelM); p.rotation.x = Math.PI / 2; p.position.set(X0 + 2.5 + i * 3.6, GH - 0.07, -2 + j * 3.6); g.add(p); }
  for (const [x, z] of [[-4, 1], [3, 1], [-1, -2.5]]) { const l = new THREE.PointLight('#f4f8ff', 8, 12, 1.4); l.position.set(x, GH - 0.4, z); g.add(l); }
  const shelfM = (s) => [std({ color: '#d8dadc' }), std({ color: '#d8dadc' }), std({ color: '#e8e8e8' }), std({ color: '#d8dadc' }), std({ map: productTex(s) }), std({ map: productTex(s + 50) })];
  for (let i = 0; i < 3; i++) { const sh = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.5, 0.7), shelfM(i)); sh.position.set(X0 + 4.2 + i * 0.0 + (i % 2) * 4.6, 0.75, -1.2 + Math.floor(i / 2) * 0); sh.position.x = [-2.6, 2.4, -2.6][i]; sh.position.z = [-1.5, -1.5, 1.4][i]; sh.castShadow = true; g.add(sh); }
  const cool = coolerTex(); for (let i = 0; i < 6; i++) { box(1.0, 2.2, 0.6, std({ color: '#2a2c30' }), X0 + 3 + i * 1.05, 1.1, Z0 + 0.45, g); plane(0.92, 2.0, std({ map: cool, emissive: '#ffffff', emissiveMap: cool, emissiveIntensity: 0.7, roughness: 0.1 }), X0 + 3 + i * 1.05, 1.1, Z0 + 0.76, 0, g); }
  const counter = rbox(3.4, 1.0, 0.75, 0.03, std({ color: '#f2f2ee' }), X1 - 2.6, 0.5, 2.6, g); void counter;
  box(3.42, 0.04, 0.8, std({ color: '#8a6a4a' }), X1 - 2.6, 1.02, 2.6, g);
  const reg = new THREE.Group(); reg.position.set(X1 - 3.2, 1.04, 2.5); g.add(reg); box(0.38, 0.12, 0.34, std({ color: '#222' }), 0, 0.06, 0, reg); const scr = box(0.32, 0.22, 0.03, std({ color: '#111', emissive: '#4a8ad8', emissiveIntensity: 0.6 }), 0, 0.26, -0.05, reg); scr.rotation.x = -0.3;
  box(0.6, 1.6, 0.9, std({ color: '#3a3c40' }), X1 - 0.8, 0.8, 2.6, g);   // hot-food case (dark body)
  const hot = plane(0.55, 0.5, std({ color: '#ffd8a0', emissive: '#ffb860', emissiveIntensity: 0.9 }), X1 - 0.8, 1.2, 3.06, 0, g); void hot;
  // magazine rack along the side glass
  const mags = canvasT(512, 128, (x, w, h) => { const rr = rng(9); for (let i = 0; i < 16; i++) { x.fillStyle = ['#e8402a', '#2a8ad0', '#f2c21a', '#111', '#e86aa0', '#3ab84a'][i % 6]; x.fillRect(i * 32, 0, 30, h); x.fillStyle = '#fff'; x.fillRect(i * 32 + 4, 10, 22, 12 + rr() * 10); } });
  const rack = box(0.4, 1.0, D - 3, std({ color: '#c8ccd0' }), X0 + 0.55, 0.5, -0.6, g); rack.material = [std({ map: mags }), std({ map: mags }), std({ color: '#c8ccd0' }), std({ color: '#c8ccd0' }), std({ color: '#c8ccd0' }), std({ color: '#c8ccd0' })];
  // outside: stacked blue crates by the side wall, an umbrella stand, the glossy wet pavement
  const crateM = std({ map: tex('crate_blue'), roughness: 0.6 });
  for (let k = 0; k < 5; k++) box(0.55, 0.3, 0.38, crateM, X0 - 0.5, 0.15 + k * 0.3, Z0 + 1.0, g);
  const us = new THREE.Group(); us.position.set(X0 + 2.0, 0, Z1 + 0.5); g.add(us); cyl(0.14, 0.12, 0.45, std({ color: '#5a5c60', metalness: 0.6 }), 0, 0.225, 0, us, 16);
  for (let k = 0; k < 3; k++) { const u = rod(V(0, 0.1, 0), V((k - 1) * 0.06, 0.95, 0.05), 0.02, std({ color: ['#c81e28', '#1a1a1a', '#e8e8e8'][k] }), us); void u; }
  const wet = new THREE.Mesh(new THREE.PlaneGeometry(W + 6, 4), phys({ color: '#4a4c50', roughness: 0.08, metalness: 0.2, clearcoat: 1, transparent: true, opacity: 0.55 })); wet.rotation.x = -Math.PI / 2; wet.position.set(-1, 0.02, Z1 + 2); g.add(wet);
  const wet2 = wet.clone(); wet2.scale.set((D + 4) / (W + 6), 1, 1); wet2.rotation.z = Math.PI / 2; wet2.position.set(X0 - 2, 0.021, -1); g.add(wet2);
  // a red glow spilling from the band onto the pavement (the store's light pool)
  const pc = document.createElement('canvas'); pc.width = pc.height = 128; const px = pc.getContext('2d'); const gr = px.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(230,240,255,0.5)'); gr.addColorStop(1, 'rgba(230,240,255,0)'); px.fillStyle = gr; px.fillRect(0, 0, 128, 128);
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(W, 6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.03, Z1 + 2.2); g.add(pool);
  const spill = new THREE.PointLight('#e8f0ff', 3.5, 10, 1.6); spill.position.set(0, 2.0, Z1 + 1.2); g.add(spill);
  // grocery 2 (item 66): open sushi case on the right wall, a ginger + pizza end-cap, someone's glasses, wallet and
  // sake carton left on the counter
  const sc = makeSushiCase(); sc.position.set(X1 - 0.55, 0, -2.4); sc.rotation.y = -Math.PI / 2; g.add(sc);
  const ec = makeGroceryEndcap(); ec.position.set(5.4, 0, -1.55); g.add(ec);
  { const r1 = makeReceipt('mart'); r1.position.set(X1 - 2.4, 1.042, 2.45); r1.rotation.y = 0.4; g.add(r1); const r2 = makeReceipt('dollar'); r2.position.set(X1 - 2.2, 1.044, 2.6); r2.rotation.y = -0.3; g.add(r2);
    const rb = makeRiceballPack(); rb.position.set(X1 - 1.75, 1.043, 2.5); rb.rotation.y = 1.3; g.add(rb); }
  const chips = makeChipTower(); chips.position.set(1.4, 0, 3.4); chips.rotation.y = 0.15; g.add(chips);
  const ct = makeCounterThings(); ct.position.set(X1 - 3.6, 1.04, 2.5); ct.rotation.y = 0.2; g.add(ct);
  g.userData.colliders = [[X0, X0 + 1.7, Z1 - 1.7, Z1], [X1 - 0.8, X1 + 0.1, Z1 - 0.8, Z1], [X0 + 1.7, X0 + 2.3, Z1 - 0.2, Z1], [X0 + 4.1, X1 - 0.8, Z1 - 0.2, Z1], [X0, X0 + 0.2, Z0, Z1 - 1.7], [X0, X1, Z0 - 0.1, Z0 + 0.8], [X1 - 0.1, X1 + 0.1, Z0, Z1], [-4.7, -0.5, -1.85, -1.15], [0.3, 4.5, -1.85, -1.15], [-4.7, -0.5, 1.05, 1.75], [X1 - 4.3, X1, 2.2, 3.05], [X0 + 0.35, X0 + 0.75, -4, 2.8], [X0 - 0.8, X0 - 0.2, Z0 + 0.8, Z0 + 1.2], [X1 - 1.05, X1, -3.6, -1.2], [4.8, 6.0, -2.05, -1.25], [1.05, 1.75, 3.15, 3.65]];
  g.userData.areas = [{ minX: X0 + 0.4, maxX: X1 - 0.3, minZ: Z0 + 0.9, maxZ: Z1 - 0.25 }, { minX: X0 + 2.35, maxX: X0 + 4.05, minZ: Z1 - 0.4, maxZ: Z1 + 0.6 }];
  return g;
}

// ---- police sedan -----------------------------------------------------------------------------------------------
const SL = 4.9, SXR = 0.98, SXF = 3.83, SWR = 0.33;
function prof(pts) { const c = new THREE.CatmullRomCurve3(pts.map(([x, y]) => V(x, y, 0)), false, 'centripetal'); const s = c.getPoints(500); return (x) => { if (x <= s[0].x) return s[0].y; for (let i = 1; i < s.length; i++) if (s[i].x >= x) { const a = s[i - 1], b = s[i], t = (x - a.x) / (b.x - a.x || 1); return a.y + (b.y - a.y) * t; } return s[s.length - 1].y; }; }
const STOP = prof([[0, 0.8], [0.05, 0.92], [0.3, 0.98], [0.9, 1.0], [1.15, 1.06], [1.55, 1.38], [1.9, 1.465], [2.75, 1.47], [3.15, 1.32], [3.45, 1.08], [3.75, 1.0], [4.4, 0.92], [4.82, 0.84], [4.9, 0.74]]);
const SBOT = prof([[0, 0.36], [0.12, 0.24], [0.5, 0.2], [4.4, 0.2], [4.8, 0.26], [4.9, 0.36]]);
const SBELT = prof([[0, 0.92], [1.2, 0.98], [3.4, 0.98], [4.9, 0.86]]);
const SHW = prof([[0, 0.74], [0.1, 0.84], [0.5, 0.895], [2.4, 0.9], [4.3, 0.885], [4.75, 0.84], [4.9, 0.74]]);
const SRW = prof([[1.0, 0.7], [1.6, 0.68], [2.6, 0.68], [3.4, 0.74]]);
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function ssection(x) {
  const yt = STOP(x), belt = SBELT(x), hw = SHW(x); let yb = SBOT(x);
  for (const xa of [SXR, SXF]) { const d = Math.abs(x - xa), R = 0.39; if (d < R) yb = Math.max(yb, SWR + Math.sqrt(R * R - d * d) * 0.97); }
  const gh = sm(0.0, 0.1, yt - belt), yS = gh > 0 ? belt * gh + (yt - 0.05) * (1 - gh) : yt - 0.05, rw = SRW(x), gw = hw * 0.85;
  const deck = [[0.62 * hw, yt], [0.95 * hw, yt - 0.035]], green = [[rw, yt - 0.025], [gw, yS + 0.05]];   // flat hood/boot with crisp shoulders
  const c6 = [deck[1][0] * (1 - gh) + green[1][0] * gh, deck[1][1] * (1 - gh) + green[1][1] * gh], c7 = [deck[0][0] * (1 - gh) + green[0][0] * gh, deck[0][1] * (1 - gh) + green[0][1] * gh];
  const ctrl = [[0, yb], [0.8 * hw, yb], [0.98 * hw, yb + 0.03], [hw, yb + 0.35 * (yS - yb)], [hw * 1.003, yb + 0.75 * (yS - yb)], [0.99 * hw, yS], c6, c7, [0, yt]];
  return new THREE.CatmullRomCurve3(ctrl.map(([z, y]) => V(0, y, z)), false, 'centripetal').getPoints(22).map((p) => [p.z, p.y]);
}
function sedanBody() {
  const NS = 160, pos = [], idx = [], H = 22, kOf = (k) => (k <= H ? k : 2 * H - k); let N = 0; const glassQ = [];
  const rings = []; for (let i = 0; i <= NS; i++) { const x = SL * i / NS, h = ssection(x), full = [...h, ...h.slice(1, -1).reverse().map(([z, y]) => [-z, y])]; N = full.length; rings.push(full.map(([z, y]) => [x, y, z])); }
  rings.forEach((r) => r.forEach((p) => pos.push(...p)));
  const isGlass = (x, k) => STOP(x) - SBELT(x) > 0.08 && k > 14.6 && ((x > 2.78 && x < 3.4 && k > 15.4) || (k < 18.0 && x > 1.3 && x < 3.05 && Math.abs(x - 2.1) > 0.05) || (x > 1.15 && x < 1.52 && k > 16.0));
  for (let i = 0; i < NS; i++) for (let k = 0; k < N; k++) { const a = i * N + k, b = i * N + (k + 1) % N, c = (i + 1) * N + k, d = (i + 1) * N + (k + 1) % N; const gl = isGlass(SL * (i + 0.5) / NS, (kOf(k) + kOf((k + 1) % N)) / 2); (gl ? glassQ : idx).push(a, c, b, b, c, d); }
  for (const [i, flip] of [[0, true], [NS, false]]) { const r = rings[i]; const cy = r.reduce((s, p) => s + p[1], 0) / N; const ci = pos.length / 3; pos.push(r[0][0] + (flip ? -0.01 : 0.01), cy, 0); for (let k = 0; k < N; k++) { const a = i * N + k, b = i * N + (k + 1) % N; flip ? idx.push(ci, a, b) : idx.push(ci, b, a); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex([...idx, ...glassQ]); g.addGroup(0, idx.length, 0); g.addGroup(idx.length, glassQ.length, 1); g.computeVertexNormals(); return g;
}
function policePaint(mat) {   // black lower doors / sides, white everywhere else (roof, upper body, nose, tail)
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLoc;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLoc = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vLoc;').replace('#include <color_fragment>', `#include <color_fragment>
      float side = smoothstep(0.62, 0.66, abs(vLoc.z));
      float lowY = 1.0 - smoothstep(0.885, 0.895, vLoc.y);
      float mid = smoothstep(0.55, 0.6, vLoc.x) * (1.0 - smoothstep(4.25, 4.3, vLoc.x));
      float blk = side * lowY * mid;
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.012), blk);`);
  };
  mat.customProgramCacheKey = () => 'police-paint';
}
function sedanWheel(s) {
  const g = new THREE.Group();
  const prof2 = []; for (let k = 0; k <= 16; k++) { const a = -Math.PI / 2 + k / 16 * Math.PI; prof2.push(new THREE.Vector2(SWR - 0.03 + Math.cos(a) * 0.03, Math.sin(a) * 0.105)); }
  prof2.unshift(new THREE.Vector2(0.2, -0.1)); prof2.push(new THREE.Vector2(0.2, 0.1));
  const t = new THREE.Mesh(new THREE.LatheGeometry(prof2, 36), std({ color: '#1a1a1a', roughness: 0.85 })); t.rotation.x = Math.PI / 2; g.add(t);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 32), std({ color: '#c8ccd0', metalness: 0.85, roughness: 0.25 })); cap.rotation.x = Math.PI / 2; cap.position.z = s * 0.09; g.add(cap);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; const sl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.01), std({ color: '#3a3c40' })); sl.position.set(Math.cos(a) * 0.13, Math.sin(a) * 0.13, s * 0.106); sl.rotation.z = a + Math.PI / 2; g.add(sl); }
  return g;
}
// a plain sedan in a solid paint (same body as the police car, no markings): parked cars around town
export function makeSedan(color = '#2a2c30', seed = 1) {
  const g = new THREE.Group(); g.name = 'sedan';
  const car = new THREE.Group(); car.position.x = -(SXR + SXF) / 2; g.add(car);
  const paint = phys({ color, roughness: 0.22, clearcoat: 1, metalness: 0.35 });
  const glass = phys({ color: '#141a20', roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.7 });
  const body = new THREE.Mesh(sedanBody(), [paint, glass]); body.castShadow = true; body.receiveShadow = true; car.add(body);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.06, 1.5), std({ color: '#0c0c0c' })); floor.position.set(2.45, 0.22, 0); car.add(floor);
  for (const xa of [SXR, SXF]) for (const s of [-1, 1]) { const w = sedanWheel(s); w.position.set(xa, SWR, s * 0.77); car.add(w); const well = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.3, 24, 1, true, Math.PI / 2, Math.PI), std({ color: '#0a0a0a', side: THREE.DoubleSide })); well.rotation.x = Math.PI / 2; well.position.set(xa, SWR, s * 0.7); car.add(well); }
  for (const s of [-1, 1]) {
    const hl = rbox(0.06, 0.1, 0.36, 0.02, phys({ color: '#f4f8fa', emissive: '#ffffff', emissiveIntensity: 0.3, roughness: 0.05 }), SL - 0.1, 0.76, s * 0.6, car); hl.rotation.y = s * 0.3;
    rbox(0.05, 0.12, 0.42, 0.02, phys({ color: '#c8101a', emissive: '#6a0008', emissiveIntensity: 0.5, roughness: 0.1 }), 0.03, 0.82, s * 0.6, car);
    rbox(0.12, 0.09, 0.16, 0.03, std({ color }), 3.32, 1.0, s * 0.96, car);
    box(0.12, 0.025, 0.02, std({ color: '#c8ccd0', metalness: 0.8 }), 2.55, 0.92, s * (SHW(2.55) + 0.005), car); box(0.12, 0.025, 0.02, std({ color: '#c8ccd0', metalness: 0.8 }), 1.55, 0.93, s * (SHW(1.55) + 0.005), car);
  }
  // a chrome-banded black grille, a made-up plate front + back
  plane(0.95, 0.18, std({ color: '#141414', metalness: 0.5, roughness: 0.3 }), SL - 0.05, 0.6, 0, Math.PI / 2, car); box(0.02, 0.03, 0.95, std({ color: '#d8dce0', metalness: 0.9, roughness: 0.2 }), SL - 0.04, 0.64, 0, car);
  const num = ['KTR 2210', 'BLV 4417', 'MPL 0952'][seed % 3];
  const plateT = canvasT(330, 165, (x, w, h) => { x.fillStyle = '#f4f2ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#1a3a8a'; fitText(x, 'ELM COUNTY', w / 2, 24, 220, 20, F.label, { spacing: 3 }); fitText(x, num, w / 2, 96, 290, 76, F.label, { weight: 700 }); });
  plane(0.33, 0.165, std({ map: plateT }), SL + 0.005, 0.42, 0, Math.PI / 2, car); plane(0.33, 0.165, std({ map: plateT }), -0.005, 0.5, 0, -Math.PI / 2, car);
  for (const s of [-1, 1]) box(0.5, 0.65, 0.48, std({ color: '#2a2a2c' }), 2.35, 0.75, s * 0.38, car);
  g.userData.collider = [-SL / 2 - 0.1, SL / 2 + 0.1, -0.95, 0.95];
  return g;
}
export function makePoliceSedan() {
  const g = new THREE.Group(); g.name = 'police_sedan';
  const car = new THREE.Group(); car.position.x = -(SXR + SXF) / 2; g.add(car);
  const paint = phys({ color: '#f4f4f2', roughness: 0.25, clearcoat: 0.9 }); policePaint(paint);
  const glass = phys({ color: '#141a20', roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.7 });
  const body = new THREE.Mesh(sedanBody(), [paint, glass]); body.castShadow = true; body.receiveShadow = true; car.add(body);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.06, 1.5), std({ color: '#0c0c0c' })); floor.position.set(2.45, 0.22, 0); car.add(floor);
  for (const xa of [SXR, SXF]) for (const s of [-1, 1]) { const w = sedanWheel(s); w.position.set(xa, SWR, s * 0.77); car.add(w); const well = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.3, 24, 1, true, Math.PI / 2, Math.PI), std({ color: '#0a0a0a', side: THREE.DoubleSide })); well.rotation.x = Math.PI / 2; well.position.set(xa, SWR, s * 0.7); car.add(well); }
  // light bar: long red lens on a chrome base across the roof, a white centre block
  const lb = new THREE.Group(); lb.position.set(2.3, STOP(2.3) + 0.02, 0); car.add(lb);
  box(0.36, 0.06, 1.25, std({ color: '#c8ccd0', metalness: 0.8, roughness: 0.25 }), 0, 0.03, 0, lb);
  const red = phys({ color: '#e0141e', emissive: '#a00008', emissiveIntensity: 1.4, transparent: true, opacity: 0.9, roughness: 0.1 });
  rbox(0.3, 0.13, 1.2, 0.05, red, 0, 0.12, 0, lb); box(0.31, 0.14, 0.18, std({ color: '#f2f2ee' }), 0, 0.12, 0, lb);
  const bar = new THREE.PointLight('#ff2020', 2.5, 7, 1.6); bar.position.set(0, 0.3, 0); lb.add(bar);
  // POLICE on both front doors and the boot (generic wording), a small crest-free stripe
  const word = canvasT(512, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#ffffff'; fitText(x, 'POLICE', w / 2, h * 0.55, w - 40, 96, F.heavy, { spacing: 10 }); });
  const wm = std({ map: word, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  for (const s of [-1, 1]) { const p = plane(1.05, 0.26, wm, 2.6, 0.62, s * (SHW(2.6) + 0.004), s > 0 ? 0 : Math.PI, car); p.rotation.y = s > 0 ? 0 : Math.PI; }
  const bootWord = canvasT(512, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#111111'; fitText(x, 'POLICE', w / 2, h * 0.55, w - 40, 96, F.heavy, { spacing: 10 }); });
  const bw = plane(0.7, 0.17, std({ map: bootWord, transparent: true, depthWrite: false }), -0.012, 0.66, 0, -Math.PI / 2, car); void bw;
  // lamps: headlights, tail lights, made-up plates front + back
  for (const s of [-1, 1]) {
    const hl = rbox(0.06, 0.12, 0.34, 0.02, phys({ color: '#f4f8fa', emissive: '#ffffff', emissiveIntensity: 0.4, roughness: 0.05 }), SL - 0.1, 0.74, s * 0.6, car); hl.rotation.y = s * 0.25;
    const tl = rbox(0.05, 0.14, 0.4, 0.02, phys({ color: '#c8101a', emissive: '#6a0008', emissiveIntensity: 0.7, roughness: 0.1 }), 0.03, 0.8, s * 0.6, car); void tl;
  }
  const plateT = canvasT(330, 165, (x, w, h) => { x.fillStyle = '#f4f2ea'; x.fillRect(0, 0, w, h); x.strokeStyle = '#1e5a2a'; x.lineWidth = 6; x.strokeRect(4, 4, w - 8, h - 8); x.fillStyle = '#1e5a2a'; fitText(x, 'ELM 300', w / 2, 44, 200, 34, F.label); fitText(x, '8-14', w / 2, 112, 280, 84, F.label, { weight: 700 }); });
  plane(0.33, 0.165, std({ map: plateT }), SL + 0.005, 0.42, 0, Math.PI / 2, car); plane(0.33, 0.165, std({ map: plateT }), -0.005, 0.5, 0, -Math.PI / 2, car);
  // mirrors, door handles, antenna, a dark grille
  for (const s of [-1, 1]) { const m = rbox(0.12, 0.09, 0.16, 0.03, std({ color: '#111' }), 3.32, 1.0, s * 0.96, car); void m; box(0.12, 0.025, 0.02, std({ color: '#c8ccd0', metalness: 0.8 }), 2.55, 0.92, s * (SHW(2.55) + 0.005), car); box(0.12, 0.025, 0.02, std({ color: '#c8ccd0', metalness: 0.8 }), 1.55, 0.93, s * (SHW(1.55) + 0.005), car); }
  rod(V(0.6, 1.0, 0.3), V(0.45, 1.6, 0.3), 0.004, std({ color: '#111' }), car);
  plane(0.9, 0.16, std({ color: '#141414', metalness: 0.5, roughness: 0.3 }), SL - 0.05, 0.6, 0, Math.PI / 2, car);
  // interior silhouettes behind the tint
  for (const s of [-1, 1]) { box(0.5, 0.65, 0.48, std({ color: '#2a2a2c' }), 2.35, 0.75, s * 0.38, car); }
  g.userData.collider = [-SL / 2 - 0.1, SL / 2 + 0.1, -0.95, 0.95];
  return g;
}

// ---- aircraft nose on a carport ------------------------------------------------------------------------------------
function noseFuselage() {
  // a loft along x: radius profile (tapering nose), slightly flattened sides; x = 0 at the cut-off rear, +x forward
  const L = 7.2, R = prof([[0, 0.78], [3.2, 0.78], [4.6, 0.75], [5.6, 0.66], [6.4, 0.5], [6.95, 0.3], [7.2, 0.02]]);
  const geo = new THREE.LatheGeometry(Array.from({ length: 41 }, (_, i) => { const x = L * i / 40; return new THREE.Vector2(Math.max(0.001, R(x)), x); }), 40);
  geo.rotateZ(-Math.PI / 2);   // lathe axis y -> +x
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), z = p.getZ(i); p.setY(i, y * (y < 0 ? 0.95 : 1.0)); p.setZ(i, z * 0.96); }
  geo.computeVertexNormals(); return { geo, L, R };
}
export function makeAircraftCarport() {
  const g = new THREE.Group(); g.name = 'aircraft_carport';
  const steel = std({ color: '#b8bcc0', metalness: 0.55, roughness: 0.45 }), skin = std({ map: tex('rs_skin', 2, 1), roughness: 0.75, metalness: 0.35, color: '#a8acb0' });
  const W = 6.5, D = 6.0, HC = 2.4, HP = 3.1;
  // frame: four posts (square tube), the carport beams + a corrugated roof, the upper platform beams
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.15, HP, 0.15, steel, sx * (W / 2 - 0.1), HP / 2, sz * (D / 2 - 0.1), g);
  for (const sz of [-1, 1]) { box(W, 0.2, 0.15, steel, 0, HC, sz * (D / 2 - 0.1), g); box(W + 0.3, 0.25, 0.18, steel, 0, HP, sz * (D / 2 - 0.1), g); }
  for (const sx of [-1, 1]) { box(0.15, 0.2, D, steel, sx * (W / 2 - 0.1), HC, 0, g); box(0.18, 0.25, D, steel, sx * (W / 2 - 0.1), HP, 0, g); }
  const corr = new THREE.PlaneGeometry(W, D, 60, 1); const cp = corr.attributes.position; for (let i = 0; i < cp.count; i++) cp.setZ(i, 0.025 * Math.sin(cp.getX(i) * 20)); corr.computeVertexNormals();
  const roof = new THREE.Mesh(corr, std({ color: '#7a7e80', metalness: 0.5, roughness: 0.5, side: THREE.DoubleSide })); roof.rotation.x = -Math.PI / 2; roof.position.y = HC + 0.12; g.add(roof);
  for (let i = -2; i <= 2; i++) box(0.12, 0.15, D, steel, i * 1.4, HP + 0.2, 0, g);   // cradle beams on the platform
  // the nose section: weathered skin, cut-off rear plate, glazed nose, framed canopy, number 07
  const { geo, L, R } = noseFuselage();
  const nose = new THREE.Group(); nose.position.set(-3.6, HP + 0.25 + 0.76, 0); g.add(nose);
  const fus = new THREE.Mesh(geo, skin); fus.castShadow = true; nose.add(fus);
  const cap = new THREE.Mesh(new THREE.CircleGeometry(0.9, 40), std({ color: '#4a4c50', metalness: 0.4 })); cap.rotation.y = -Math.PI / 2; cap.scale.set(0.96, 0.87, 1); nose.add(cap);
  // glazed bomb-aimer nose: a glass shell over the front 1.1 m with frame rings and ribs
  const glassG = new THREE.LatheGeometry(Array.from({ length: 13 }, (_, i) => { const x = 5.9 + 1.3 * i / 12; return new THREE.Vector2(Math.max(0.001, R(x) + 0.01), x); }), 32); glassG.rotateZ(-Math.PI / 2);
  nose.add(new THREE.Mesh(glassG, phys({ color: '#2a3238', roughness: 0.06, metalness: 0.3, transparent: true, opacity: 0.75 })));
  const fr = std({ color: '#3a3c40', metalness: 0.5 });
  for (const x of [5.95, 6.4, 6.85]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(R(x) + 0.012, 0.012, 6, 32), fr); ring.rotation.y = Math.PI / 2; ring.position.x = x; nose.add(ring); }
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; const pts = []; for (let i = 0; i <= 10; i++) { const x = 5.9 + 1.28 * i / 10, rr = R(x) + 0.012; pts.push(V(x, Math.cos(a) * rr, Math.sin(a) * rr)); } nose.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.01, 4), fr)); }
  // canopy on top: a raised framed greenhouse with three panes a side
  const can = new THREE.Group(); can.position.set(4.4, 0.66, 0); nose.add(can);
  const canG = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2); canG.scale(1.1, 0.4, 0.5);
  can.add(new THREE.Mesh(canG, phys({ color: '#2a3238', roughness: 0.06, metalness: 0.3, transparent: true, opacity: 0.8 })));
  for (const x of [-0.6, -0.15, 0.3, 0.7]) { const arc = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 4, 24, Math.PI), fr); arc.scale.set(0.55 * Math.sqrt(1 - x * x), 0.42 * Math.sqrt(1 - x * x), 1); arc.rotation.y = Math.PI / 2; arc.position.x = x; can.add(arc); }
  // side window, the gun blister, number 07 on both sides, a hatch outline
  const num = canvasT(256, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#e8e8e2'; fitText(x, '0 7', w / 2, h * 0.55, 200, 110, F.label, { weight: 500 }); });
  const nm = std({ map: num, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  for (const s of [-1, 1]) {
    const p = plane(0.62, 0.31, nm, 5.0, 0.0, s * 0.735, s > 0 ? 0 : Math.PI, nose); void p;
    const win = plane(0.5, 0.32, phys({ color: '#1a2228', roughness: 0.05, metalness: 0.4 }), 5.6, 0.3, s * 0.6, s > 0 ? 0.35 : Math.PI - 0.35, nose); void win;
    const bl = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), skin); bl.scale.set(0.45, 0.12, 0.14); bl.position.set(4.6, 0.36, s * 0.72); nose.add(bl);
  }
  // tie-down cables from the fuselage to the frame
  const cab = std({ color: '#2a2c2e' });
  for (const [x, s] of [[-1.6, 1], [-1.6, -1], [1.2, 1], [1.2, -1]]) rod(V(x, HP + 1.4, s * 0.6), V(x + 0.4, HP + 0.25, s * (D / 2 - 0.1)), 0.01, cab, g);
  // a concrete pad under it all and a lamp on a bracket lighting the aircraft
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(W + 3, D + 3), std({ map: tex('lot_concrete', 3, 3), color: '#a8a49c', roughness: 0.9 })); pad.rotation.x = -Math.PI / 2; pad.position.y = 0.01; pad.receiveShadow = true; g.add(pad);
  rod(V(-W / 2 + 0.1, HP, D / 2 - 0.1), V(-W / 2 + 0.8, HP + 2.4, D / 2 - 0.1), 0.04, steel, g); box(0.4, 0.12, 0.25, std({ color: '#2a2c2e' }), -W / 2 + 0.9, HP + 2.42, D / 2 - 0.1, g);
  const lamp = new THREE.SpotLight('#ffe8c0', 40, 14, 0.7, 0.5, 1.5); lamp.position.set(-W / 2 + 0.9, HP + 2.35, D / 2 - 0.1); lamp.target.position.set(0.5, HP + 1, 0); g.add(lamp, lamp.target);
  // the wall + sliding gate along the front, a car-width opening; the gate number plate
  const brick = std({ map: tex('hs_brick', 4, 0.8), roughness: 0.9 });
  box(2.4, 1.1, 0.25, brick, -W / 2 + 1.0, 0.55, D / 2 + 0.4, g); box(0.25, 1.1, D, brick, -W / 2 - 0.2, 0.55, 0, g);
  const gate = new THREE.Group(); gate.position.set(1.0, 0, D / 2 + 0.4); g.add(gate);
  box(4.0, 0.06, 0.06, steel, 0, 1.2, 0, gate); box(4.0, 0.06, 0.06, steel, 0, 0.12, 0, gate);
  for (let i = 0; i <= 40; i++) box(0.025, 1.08, 0.025, steel, -2 + i * 0.1, 0.66, 0, gate);
  for (const x of [-1.95, 1.95]) cyl(0.04, 0.04, 0.06, std({ color: '#2a2a2a' }), x, 0.04, 0, gate, 12).rotation.x = Math.PI / 2;
  const np = canvasT(256, 96, (x, w, h) => { x.fillStyle = '#f2f2ee'; x.fillRect(0, 0, w, h); x.fillStyle = '#222'; fitText(x, '2-41-7', w / 2, 50, 220, 60, F.label, { weight: 700 }); });
  plane(0.3, 0.11, std({ map: np }), -W / 2 + 1.0, 0.85, D / 2 + 0.53, 0, g);
  g.userData.colliders = [[-W / 2 - 0.35, -W / 2 + 2.2, D / 2 + 0.25, D / 2 + 0.55], [-W / 2 - 0.35, -W / 2 - 0.05, -D / 2, D / 2], [-1.0, 3.0, D / 2 + 0.3, D / 2 + 0.5], ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz]) => [sx * (W / 2 - 0.1) - 0.1, sx * (W / 2 - 0.1) + 0.1, sz * (D / 2 - 0.1) - 0.1, sz * (D / 2 - 0.1) + 0.1])];
  return g;
}
