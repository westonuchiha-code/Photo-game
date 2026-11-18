// Underground shopping mall (28f, from photos/city/underground-mall-shutters.jpg). All shop names,
// notices and wayfinding text are made up.
//   makeUndergroundMall()  a long hall under the street, reached by a glass stair kiosk:
//     west side   six boutiques closed behind white roll-up shutters (slatted, with housings,
//                 guide rails and bottom bars), white marble pilasters between them, a white ledge
//                 with an LED line over each shutter, slatted wall cladding above, a lightbox sign
//                 per shop (name + a dark band with the mall wing), one shutter left half open
//                 with the shop lit inside
//     centre      polished granite floor in 600 x 300 mm running-bond tiles (texture from the photo)
//                 with brown inlay lines, a row of mirror-polished chrome pillars with a dark ring
//                 and a flared cap (they reflect the mall through an environment map main.js
//                 captures once), open-cell lattice ceiling with the dark plenum, ducts and trays
//                 behind it, long LED strips, dome cameras, smoke heads, a hanging wayfinding sign
//     east side   a deli front of carved walnut panels with a lit glass door and a projecting
//                 lightbox, a staff door with a big exit number, a fire-hose cabinet, a glass-front
//                 café, a closed shutter, a "now open" poster easel, benches, a steel bin
//     ends        a fire shutter closing the south end; the north end opens onto a granite stair
//                 (24 steps, nosings, three steel handrails, tiled walls) up to a glass kiosk on
//                 the street with a lit fascia and a totem sign
// Local frame: origin at street level over the middle of the hall, hall along z, stair rises to +z.
// userData: floorY(x, z, prevY), colliders [[x0,x1,z0,z1,y0,y1]], areas [{minX..,y0,y1}],
//           envMats (materials that want the captured reflection), envProbe (local capture point),
//           hideForCapture (objects hidden while capturing)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
function ptex(name, rx = 1, ry = 1, srgb = true) {
  const t = _L.load(`assets/textures/${name}`);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8;
  return t;
}
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.7, ...o });
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};
const glow = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function tube(a, b, r, mat, seg = 10) {
  const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return m;
}
// a plane with a texture whose repeat is in metres
function quad(w, h, mat) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); }
function withRepeat(mat, rx, ry) {
  const m = mat.clone();
  for (const k of ['map', 'normalMap', 'roughnessMap']) if (m[k]) { m[k] = m[k].clone(); m[k].repeat.set(rx, ry); m[k].needsUpdate = true; }
  return m;
}

// ------------------------------------------------------------------ textures
function slatCladTex() { // off-white horizontal wall panels, 150 mm, with a shadow groove (1 m square)
  return canvasTex(512, 512, (c, w, h) => {
    const r = rng(3);
    const n = 512 / 77;
    for (let i = 0; i < 7; i++) {
      const y0 = Math.round(i * 512 / 6.67);
      const t = 228 + Math.floor(r() * 8);
      const g = c.createLinearGradient(0, y0, 0, y0 + 77);
      g.addColorStop(0, `rgb(${t + 6},${t + 6},${t + 3})`); g.addColorStop(1, `rgb(${t - 10},${t - 10},${t - 12})`);
      c.fillStyle = g; c.fillRect(0, y0, w, 77);
      c.fillStyle = 'rgba(70,68,64,0.55)'; c.fillRect(0, y0, w, 3);
      c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(0, y0 + 3, w, 1);
    }
    void n;
  });
}
function shutterTex() { // white roll shutter slats, 75 mm pitch (1 m square)
  return canvasTex(512, 512, (c, w) => {
    const pitch = 512 / 13.33;
    for (let i = 0; i < 14; i++) {
      const y = i * pitch;
      const g = c.createLinearGradient(0, y, 0, y + pitch);
      g.addColorStop(0, '#d9dad8'); g.addColorStop(0.18, '#f4f4f2'); g.addColorStop(0.55, '#e9eae8'); g.addColorStop(0.9, '#c9cac8'); g.addColorStop(1, '#9fa09e');
      c.fillStyle = g; c.fillRect(0, y, w, pitch + 1);
    }
    // faint vertical wear streaks
    const r = rng(8);
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(120,118,110,${0.02 + r() * 0.03})`; c.fillRect(r() * w, 0, 1 + r() * 3, 512); }
  });
}
function shutterNormal() {
  return canvasTex(64, 512, (c, w) => {
    const pitch = 512 / 13.33;
    for (let i = 0; i < 14; i++) {
      const y = i * pitch;
      const g = c.createLinearGradient(0, y, 0, y + pitch);
      g.addColorStop(0, 'rgb(128,40,200)'); g.addColorStop(0.25, 'rgb(128,110,250)'); g.addColorStop(0.75, 'rgb(128,150,250)'); g.addColorStop(1, 'rgb(128,220,200)');
      c.fillStyle = g; c.fillRect(0, y, w, pitch + 1);
    }
  }, false);
}
function latticeTex() { // open-cell ceiling: tan bars, 100 x 150 mm cells (0.6 m square)
  return canvasTex(256, 256, (c) => {
    c.clearRect(0, 0, 256, 256);
    c.fillStyle = '#c9b9a2';
    for (let i = 0; i < 6; i++) c.fillRect(Math.round(i * 256 / 6), 0, 6, 256);
    c.fillStyle = '#d6c7b0';
    for (let j = 0; j < 4; j++) c.fillRect(0, Math.round(j * 64), 256, 6);
    c.fillStyle = 'rgba(60,50,40,0.5)';
    for (let j = 0; j < 4; j++) c.fillRect(0, Math.round(j * 64) + 6, 256, 2);
  });
}
function tileWallTex() { // white glazed wall tiles 200 x 100 mm, stack bond (1 m square)
  return canvasTex(512, 512, (c) => {
    const r = rng(5);
    c.fillStyle = '#9a9894'; c.fillRect(0, 0, 512, 512);
    for (let j = 0; j < 10; j++) for (let i = 0; i < 5; i++) {
      const t = 222 + Math.floor(r() * 12);
      const g = c.createLinearGradient(0, j * 51.2, 0, j * 51.2 + 51);
      g.addColorStop(0, `rgb(${t + 8},${t + 8},${t + 6})`); g.addColorStop(1, `rgb(${t - 6},${t - 6},${t - 8})`);
      c.fillStyle = g; c.fillRect(i * 102.4 + 2, j * 51.2 + 2, 99, 48);
    }
  });
}
function walnutTex() { // carved walnut panel for the deli: frame, grain, a small leaf-and-arrow motif
  return canvasTex(256, 512, (c, w, h) => {
    const r = rng(11);
    c.fillStyle = '#7a4a28'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      c.strokeStyle = `rgba(${40 + r() * 40},${20 + r() * 20},10,${0.12 + r() * 0.2})`;
      c.lineWidth = 1 + r() * 2; c.beginPath();
      const x = r() * w; c.moveTo(x, 0);
      for (let y = 0; y <= h; y += 32) c.lineTo(x + Math.sin(y * 0.02 + i) * 6, y);
      c.stroke();
    }
    // frame + inner bevel
    c.strokeStyle = '#4a2a14'; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10);
    c.strokeStyle = 'rgba(255,210,160,0.25)'; c.lineWidth = 3; c.strokeRect(18, 18, w - 36, h - 36);
    c.strokeStyle = 'rgba(30,15,5,0.5)'; c.lineWidth = 2; c.strokeRect(22, 22, w - 44, h - 44);
    // carved motif: a little tree / arrow in a cream inlay
    c.strokeStyle = '#e8d6b0'; c.lineWidth = 6; c.lineCap = 'round';
    const cx = w / 2, cy = h * 0.5;
    c.beginPath(); c.moveTo(cx, cy + 50); c.lineTo(cx, cy - 40); c.stroke();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx, cy - 40); c.lineTo(cx + s * 26, cy - 14); c.stroke(); c.beginPath(); c.moveTo(cx, cy - 8); c.lineTo(cx + s * 22, cy + 14); c.stroke(); }
    c.beginPath(); c.arc(cx, cy + 62, 9, 0, Math.PI * 2); c.stroke();
  });
}

// lightbox sign over a shop: white face with the name, dark band on top with the wing name
function shopSignTex(name, sub, font, ink, wing) {
  return canvasTex(768, 384, (c, w, h) => {
    c.fillStyle = '#2d3a4e'; c.fillRect(0, 0, w, 80);
    c.fillStyle = '#c7cfdc'; fitText(c, wing, w / 2, 42, w - 120, 30, F.wayfind, { spacing: 6 });
    const g = c.createLinearGradient(0, 80, 0, h);
    g.addColorStop(0, '#f6f3ec'); g.addColorStop(1, '#ebe6dc');
    c.fillStyle = g; c.fillRect(0, 80, w, h - 80);
    c.strokeStyle = '#c9c1b2'; c.lineWidth = 4; c.strokeRect(26, 104, w - 52, h - 128);
    c.fillStyle = ink;
    fitText(c, name, w / 2, 210, w - 140, 104, font, { spacing: font === F.roman || font === F.wayfind ? 14 : 2 });
    c.fillStyle = '#6d665c';
    fitText(c, sub, w / 2, 300, w - 260, 34, F.wayfind, { spacing: 10 });
  });
}

// ------------------------------------------------------------------ model
export function makeUndergroundMall() {
  const g = new THREE.Group();
  g.name = 'underground_mall';
  const FY = -4.2, CY = -1.1, HX = 7, HZ = 14;         // floor, ceiling, half width, half length
  const colliders = [], envMats = [], hide = [];
  const col = (x0, x1, z0, z1, y0 = -4.6, y1 = -1.6) => colliders.push([x0, x1, z0, z1, y0, y1]);

  // materials
  const granite = std({ map: ptex('um_floor.png', 1, 1), normalMap: ptex('um_floor_n.png', 1, 1, false), roughness: 0.16, color: '#f2f0ec', envMapIntensity: 0.55 });
  granite.normalScale.set(0.6, 0.6);
  envMats.push(granite);
  const marble = std({ map: ptex('um_marble.png', 1, 1), roughness: 0.22, envMapIntensity: 0.4 });
  envMats.push(marble);
  const clad = std({ map: slatCladTex(), roughness: 0.55 });
  const shutM = std({ map: shutterTex(), normalMap: shutterNormal(), roughness: 0.45, metalness: 0.15 });
  shutM.normalScale.set(0.8, 0.8);
  const white = std({ color: '#efeeea', roughness: 0.4 });
  const steel = std({ color: '#b9bcc0', metalness: 0.75, roughness: 0.28, envMapIntensity: 1 });
  envMats.push(steel);
  const chrome = std({ color: '#f4f6f8', metalness: 1, roughness: 0.04, envMapIntensity: 1.3 });
  envMats.push(chrome);
  const darkRing = std({ color: '#2b2e33', metalness: 0.6, roughness: 0.35 });
  const skirting = std({ color: '#5a5c5e', roughness: 0.5 });
  const plenum = std({ color: '#4a4239', roughness: 0.95, emissive: '#3a3128', emissiveIntensity: 1 });
  const duct = std({ color: '#55585c', metalness: 0.5, roughness: 0.55 });
  const led = glow(2.4, 2.45, 2.5);
  const ledWarm = glow(2.2, 1.95, 1.6);
  const tile = std({ map: tileWallTex(), roughness: 0.25, envMapIntensity: 0.4 });
  envMats.push(tile);

  // ---------------------------------------------------------------- floor, inlays, ceiling, plenum
  {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(HX * 2, HZ * 2), withRepeat(granite, HX * 2 / 1.2, HZ * 2 / 1.2));
    envMats.push(f.material);
    f.rotation.x = -Math.PI / 2; f.position.y = FY; f.receiveShadow = true; g.add(f);
    // brown inlay lines in the east aisle (the photo's darker stripes), slightly proud of the floor
    const inlay = std({ color: '#6b4a34', roughness: 0.25, envMapIntensity: 0.4 });
    envMats.push(inlay);
    for (let i = 0; i < 9; i++) {
      const z = -12.6 + i * 3.15, len = 2.4 + (i % 3) * 0.9;
      const s = quad(len, 0.05, inlay); s.rotation.x = -Math.PI / 2; s.position.set(4.6 + (i % 2) * 0.9, FY + 0.002, z); g.add(s);
    }
    // ceiling lattice + dark plenum above it with ducts and trays
    const lt = latticeTex(); lt.repeat.set(HX * 2 / 0.6, HZ * 2 / 0.6);
    const lat = new THREE.Mesh(new THREE.PlaneGeometry(HX * 2, HZ * 2), std({ map: lt, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 }));
    lat.rotation.x = Math.PI / 2; lat.position.y = CY; g.add(lat);
    const pl = quad(HX * 2, HZ * 2, plenum); pl.rotation.x = Math.PI / 2; pl.position.y = CY + 0.75; g.add(pl);
    for (const x of [-4.2, 2.2]) { const d = box(0.9, 0.45, HZ * 2, duct, x, CY + 0.42, 0); d.castShadow = false; g.add(d); }
    for (const x of [-1.2, 5.2]) { const t = box(0.4, 0.06, HZ * 2, darkRing, x, CY + 0.3, 0); t.castShadow = false; g.add(t); }
    for (let z = -12; z <= 12; z += 3) g.add(tube(V(-HX, CY + 0.55, z), V(HX, CY + 0.55, z + 0.2), 0.05, duct, 8));
    // LED strips across the hall (two staggered lines like the photo) + short ones over the shops
    for (let i = 0; i < 12; i++) {
      const z = -13 + i * 2.4;
      const a = box(i % 2 ? 6.0 : 5.2, 0.03, 0.09, led, i % 2 ? -1.6 : -2.8, CY - 0.02, z); a.castShadow = false; g.add(a);
      const b = box(3.2, 0.03, 0.09, led, 4.6, CY - 0.02, z + 0.6); b.castShadow = false; g.add(b);
      g.add(box(6.2, 0.05, 0.14, white, i % 2 ? -1.6 : -2.8, CY - 0.005, z));
    }
    // dome cameras + smoke heads + sprinklers
    const domeM = std({ color: '#151618', roughness: 0.1, metalness: 0.2 });
    for (const [x, z] of [[-1.5, 9], [3.0, -6], [-2.5, -10]]) {
      g.add(box(0.03, 0.25, 0.03, white, x, CY - 0.13, z));
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 20), white); base.position.set(x, CY - 0.27, z); g.add(base);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), domeM); dome.position.set(x, CY - 0.29, z); g.add(dome);
    }
    for (let z = -11; z <= 11; z += 5.5) for (const x of [-4.5, 1.2]) {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16), white); s.position.set(x, CY - 0.02, z); g.add(s);
      g.add(box(0.012, 0.006, 0.012, glow(2, 0.2, 0.1), x + 0.04, CY - 0.045, z));
      const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, 0.05, 10), steel); sp.position.set(x + 1.6, CY - 0.03, z + 1.4); g.add(sp);
    }
  }

  // ---------------------------------------------------------------- west: six shuttered boutiques
  const shops = [
    ['Veranne', 'COUTURE', F.couture, '#2a2722'],
    ['MAISON LIRAC', 'ATELIER  ·  PARIS STYLE', F.roman, '#3b3226'],
    ['OSTRA', 'LEATHER GOODS', F.roman, '#2b2b2b'],
    ['Belle Hollis', 'BRIDAL & EVENING', F.couture, '#5a3b42'],
    ['NORDE', 'OPTIQUE', F.wayfind, '#1d2b3a'],
    ['Pearl & Tide', 'FINE JEWELLERY', F.couture, '#2f3b44'],
  ];
  const PITCH = 4.5, SH = 2.55, WX = -HX;               // shutter height, west front plane
  for (let i = 0; i < 6; i++) {
    const zc = -11.25 + i * PITCH, z0 = zc - PITCH / 2;
    // pilaster at the south edge of this shop (and one more after the last)
    const pils = i === 5 ? [z0, z0 + PITCH] : [z0];
    for (const pz of pils) {
      const p = box(0.16, 3.1, 0.52, withRepeat(marble, 0.5, 1.6), WX + 0.08, FY + 1.55, pz); g.add(p); envMats.push(p.material);
      g.add(box(0.2, 0.08, 0.56, skirting, WX + 0.09, FY + 0.04, pz));
    }
    const ow = PITCH - 0.52;                           // shutter opening
    const half = i === 2;                               // OSTRA is half open, lit inside
    const lift = half ? 1.0 : 0;
    // the shutter curtain
    const sm = withRepeat(shutM, ow, SH - lift);
    const sh = quad(ow, SH - lift, sm); sh.rotation.y = Math.PI / 2; sh.position.set(WX - 0.06, FY + lift + (SH - lift) / 2, zc); g.add(sh);
    g.add(box(0.06, 0.06, ow, steel, WX - 0.04, FY + lift + 0.03, zc));                  // bottom bar
    g.add(box(0.03, 0.04, 0.12, darkRing, WX - 0.015, FY + lift + 0.08, zc));            // handle / lock
    for (const s of [-1, 1]) g.add(box(0.06, SH, 0.06, steel, WX - 0.04, FY + SH / 2, zc + s * (ow / 2 - 0.03))); // guide rails
    g.add(box(0.26, 0.32, ow, white, WX + 0.02, FY + SH + 0.16, zc));                    // housing
    // ledge with an LED line under it, then the slatted cladding up to the ceiling
    g.add(box(0.34, 0.07, PITCH, white, WX + 0.06, FY + SH + 0.36, zc));
    g.add(box(0.02, 0.012, PITCH - 0.6, ledWarm, WX + 0.2, FY + SH + 0.32, zc));
    const cl = quad(PITCH, CY - (FY + SH + 0.39), withRepeat(clad, PITCH, CY - (FY + SH + 0.39)));
    cl.rotation.y = Math.PI / 2; cl.position.set(WX - 0.1, (CY + FY + SH + 0.39) / 2, zc); g.add(cl);
    // lightbox sign
    const [nm, sub, font, ink] = shops[i];
    const sg = new THREE.Group();
    const face = std({ map: shopSignTex(nm, sub, font, ink, 'WEST GALLERY  ·  B1'), roughness: 0.4, emissive: '#ffffff', emissiveIntensity: 0.28 });
    face.emissiveMap = face.map;
    sg.add(box(0.2, 0.56, 1.14, white, 0, 0, 0));
    const fm = quad(1.1, 0.55, face); fm.position.x = 0.101; fm.rotation.y = Math.PI / 2; sg.add(fm);
    sg.add(box(0.22, 0.02, 1.16, steel, 0, 0.29, 0));
    sg.position.set(WX + 0.1, FY + SH + 0.75, zc); g.add(sg);
    // behind the shutter: a shallow shop box (lit for the half-open one)
    const back = box(0.1, 3.0, PITCH, white, WX - 3.2, FY + 1.5, zc); g.add(back);
    if (half) {
      const inFloor = quad(3.1, ow, std({ color: '#d8cbb3', roughness: 0.6 })); inFloor.rotation.x = -Math.PI / 2; inFloor.rotation.z = Math.PI / 2; inFloor.position.set(WX - 1.6, FY + 0.001, zc); g.add(inFloor);
      for (const s of [-1, 1]) g.add(box(3.1, 3.0, 0.08, std({ color: '#efe6d6' }), WX - 1.6, FY + 1.5, zc + s * ow / 2));
      const ceil = quad(3.1, ow, glow(1.6, 1.5, 1.3)); ceil.rotation.x = Math.PI / 2; ceil.position.set(WX - 1.6, FY + 2.9, zc); g.add(ceil);
      // display tables with folded leather goods
      const wood = std({ color: '#3e2a1c', roughness: 0.5 });
      for (const dz of [-1, 1]) {
        g.add(box(0.9, 0.72, 1.1, wood, WX - 1.5, FY + 0.36, zc + dz * 0.95));
        for (let k = 0; k < 3; k++) g.add(box(0.28, 0.12, 0.2, std({ color: ['#6b3b1f', '#1c1c1c', '#8a6a44'][k], roughness: 0.55 }), WX - 1.5 + (k - 1) * 0.28, FY + 0.78, zc + dz * 0.95 + (k - 1) * 0.12));
      }
      const il = new THREE.PointLight('#ffe6c4', 4, 6, 1.6); il.position.set(WX - 1.4, FY + 2.2, zc); g.add(il);
      // light spilling out under the shutter
      const spill = quad(1.2, ow, new THREE.MeshBasicMaterial({ color: '#ffdcae', transparent: true, opacity: 0.12, depthWrite: false }));
      spill.rotation.x = -Math.PI / 2; spill.rotation.z = Math.PI / 2; spill.position.set(WX + 0.6, FY + 0.003, zc); g.add(spill);
      // a small "OPEN 11-20" card hung on the shutter's bottom bar
      const card = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#f7f3ea'; c.fillRect(0, 0, w, h); c.fillStyle = '#2b2b2b'; fitText(c, 'OPENING SOON', w / 2, 46, w - 30, 40, F.wayfind, { spacing: 3 }); c.fillStyle = '#7a6a55'; fitText(c, 'please come back at 11', w / 2, 94, w - 40, 26, F.couture); });
      const cm = quad(0.32, 0.16, std({ map: card })); cm.rotation.y = Math.PI / 2; cm.position.set(WX - 0.005, FY + lift - 0.1, zc + 0.6); g.add(cm);
      g.add(tube(V(WX - 0.01, FY + lift, zc + 0.5), V(WX - 0.01, FY + lift - 0.03, zc + 0.6), 0.002, darkRing, 4));
    }
    col(WX - 0.4, WX + 0.25, z0, z0 + PITCH);
  }
  // ---------------------------------------------------------------- chrome pillars
  const pillars = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const z = -12 + i * 4, x = 2.6;
    const H = CY - FY;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, H - 0.5, 48, 1, true), chrome);
    body.position.set(x, FY + (H - 0.5) / 2, z); pillars.add(body);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.515, 0.515, 0.07, 48), darkRing); ring.position.set(x, CY - 0.48, z); pillars.add(ring);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.5, 0.44, 48, 1, true), chrome); cap.position.set(x, CY - 0.22, z); pillars.add(cap);
    const kick = new THREE.Mesh(new THREE.CylinderGeometry(0.505, 0.505, 0.1, 48), steel); kick.position.set(x, FY + 0.05, z); pillars.add(kick);
    colliders.push([x - 0.55, x + 0.55, z - 0.55, z + 0.55, -4.6, -1.6]);
    // poster frame on one pillar (the photo has one), made-up opening notice
    if (i === 4) {
      const pt = canvasTex(256, 512, (c, w, h) => {
        c.fillStyle = '#f4eee4'; c.fillRect(0, 0, w, h);
        c.fillStyle = '#e9c9a8'; c.beginPath(); c.ellipse(w / 2, 200, 90, 70, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#c0705a'; c.beginPath(); c.ellipse(w / 2, 170, 70, 30, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fff6f0'; for (let k = 0; k < 7; k++) { c.beginPath(); c.arc(w / 2 - 54 + k * 18, 150, 6, 0, Math.PI * 2); c.fill(); }
        c.fillStyle = '#3a2a22'; fitText(c, 'Lune Pâtisserie', w / 2, 330, w - 30, 40, F.couture);
        c.fillStyle = '#b25b45'; fitText(c, 'NOW OPEN 5.12', w / 2, 400, w - 40, 44, F.wayfind, { spacing: 2 });
        c.fillStyle = '#6c625a'; fitText(c, 'EAST GALLERY · B1', w / 2, 450, w - 60, 22, F.wayfind, { spacing: 4 });
      });
      const pf = new THREE.Group();
      pf.add(box(0.46, 0.86, 0.03, steel));
      const pm = quad(0.42, 0.82, std({ map: pt, roughness: 0.3 })); pm.position.z = 0.017; pf.add(pm);
      pf.position.set(x + 0.36, FY + 1.5, z + 0.36); pf.rotation.y = Math.PI / 4; g.add(pf);
    }
  }
  g.add(pillars);
  hide.push(pillars);

  // ---------------------------------------------------------------- east side shops (front at x = HX)
  const EX = HX;
  // slatted cladding along the whole east front above 2.7 m and as the wall between fronts
  {
    const h = CY - FY, top = 2.62;
    const cl = quad(HZ * 2, h - top, withRepeat(clad, HZ * 2, h - top)); cl.rotation.y = -Math.PI / 2; cl.position.set(EX + 0.02, FY + top + (h - top) / 2, 0); g.add(cl);
    // below the fascias: cladding only between the open fronts (café z -5.3..-1.7, deli z 6.45..10.05)
    for (const [a, b] of [[-HZ, -5.3], [-1.7, 6.45], [10.05, HZ]]) {
      const p = quad(b - a, top, withRepeat(clad, b - a, top)); p.rotation.y = -Math.PI / 2; p.position.set(EX + 0.02, FY + top / 2, (a + b) / 2); g.add(p);
    }
    g.add(box(0.05, 0.1, HZ * 2, skirting, EX - 0.02, FY + 0.05, 0));
    col(EX - 0.1, EX + 0.3, -HZ, HZ);
  }
  // 1. deli: walnut panels, lit glass door, projecting lightbox
  {
    const zc = 8.5;
    const wal = std({ map: walnutTex(), roughness: 0.45 });
    for (let k = 0; k < 6; k++) {
      if (k === 2 || k === 3) continue;
      const p = box(0.08, 2.5, 0.56, wal, EX - 0.04, FY + 1.25, zc - 1.75 + k * 0.6); g.add(p);
    }
    // glass doors with the lit deli inside
    const glass = new THREE.MeshStandardMaterial({ color: '#cfe0e6', transparent: true, opacity: 0.25, roughness: 0.05, metalness: 0.1 });
    for (const s of [-1, 1]) {
      g.add(box(0.04, 2.3, 0.04, steel, EX - 0.05, FY + 1.15, zc - 0.3 + s * 0.6));
      const d = box(0.02, 2.2, 0.58, glass, EX - 0.05, FY + 1.12, zc - 0.3 + s * 0.3); d.castShadow = false; g.add(d);
      g.add(box(0.06, 0.4, 0.03, steel, EX - 0.1, FY + 1.1, zc - 0.3 + s * 0.05));
    }
    // the deli room behind the panels: warm walls, a lit back wall
    for (const s2 of [-1, 1]) { const w = quad(1.6, 2.62, std({ color: '#6a4a30' })); w.rotation.y = s2 > 0 ? Math.PI : 0; w.position.set(EX + 0.8, FY + 1.31, zc - 0.3 + s2 * 1.75); g.add(w); }
    const dceil = quad(1.6, 3.5, std({ color: '#3a2a1c' })); dceil.rotation.x = Math.PI / 2; dceil.position.set(EX + 0.8, FY + 2.62, zc - 0.3); g.add(dceil);
    const dfl = quad(1.6, 3.5, std({ color: '#7a5a3a' })); dfl.rotation.x = -Math.PI / 2; dfl.position.set(EX + 0.8, FY + 0.002, zc - 0.3); g.add(dfl);
    const inside = quad(1.2, 2.3, glow(1.25, 1.05, 0.8)); inside.rotation.y = -Math.PI / 2; inside.position.set(EX + 1.2, FY + 1.15, zc - 0.3); g.add(inside);
    // counter + shelves seen through the door
    g.add(box(0.6, 1.0, 1.2, std({ color: '#5a3a24' }), EX + 0.7, FY + 0.5, zc - 0.3));
    for (let k = 0; k < 5; k++) g.add(box(0.12, 0.14, 0.1, std({ color: ['#c8402c', '#e8c040', '#3a7a3a', '#f0e8d8', '#9a5a2a'][k] }), EX + 0.6, FY + 1.07, zc - 0.7 + k * 0.2));
    g.add(box(0.05, 2.0, 1.2, std({ color: '#2a2018' }), EX + 1.15, FY + 1.0, zc - 0.3));
    // overhead fascia with name
    const ft = canvasTex(1024, 160, (c, w, h) => {
      c.fillStyle = '#3a2614'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#e8d6b0'; fitText(c, 'Corner Deli & Daily Bread', w / 2, h / 2 + 4, w - 120, 84, F.couture);
      c.strokeStyle = '#a07c50'; c.lineWidth = 3; c.strokeRect(12, 12, w - 24, h - 24);
    });
    const fa = quad(3.6, 0.42, std({ map: ft, roughness: 0.5, emissive: '#ffe0b0', emissiveIntensity: 0.15, emissiveMap: ft })); fa.rotation.y = -Math.PI / 2; fa.position.set(EX - 0.06, FY + 2.75, zc - 0.25); g.add(fa);
    // projecting lightbox (round green icon + DELI)
    const lb = canvasTex(512, 160, (c, w, h) => {
      c.fillStyle = '#f7f7f4'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#2f8a5a'; c.beginPath(); c.arc(80, h / 2, 50, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff'; fitText(c, 'D', 80, h / 2 + 3, 60, 70, F.wayfind);
      c.fillStyle = '#1e3a2c'; fitText(c, 'DELI', 300, h / 2 + 4, 300, 100, F.wayfind, { spacing: 12 });
    });
    const blade = new THREE.Group();
    blade.add(box(0.7, 0.24, 0.1, white));
    for (const s of [-1, 1]) { const m = quad(0.66, 0.2, std({ map: lb, emissive: '#ffffff', emissiveIntensity: 0.35, emissiveMap: lb })); m.position.z = s * 0.051; if (s < 0) m.rotation.y = Math.PI; blade.add(m); }
    blade.add(box(0.06, 0.04, 0.04, steel, 0.37, 0.06, 0));
    blade.rotation.y = 0; blade.position.set(EX - 0.4, FY + 2.95, zc - 2.3); blade.rotation.y = Math.PI / 2;
    g.add(blade);
  }
  // 2. staff door with a big exit number and a fire-hose cabinet
  {
    const zc = 2.5;
    const doorM = std({ color: '#d9d8d4', roughness: 0.45, metalness: 0.2 });
    g.add(box(0.06, 2.2, 1.0, doorM, EX - 0.03, FY + 1.1, zc));
    g.add(box(0.08, 2.28, 0.06, steel, EX - 0.04, FY + 1.14, zc - 0.53)); g.add(box(0.08, 2.28, 0.06, steel, EX - 0.04, FY + 1.14, zc + 0.53));
    g.add(box(0.08, 0.06, 1.12, steel, EX - 0.04, FY + 2.25, zc));
    g.add(box(0.06, 0.03, 0.3, steel, EX - 0.08, FY + 1.05, zc + 0.3));
    const nt = canvasTex(256, 384, (c, w, h) => { c.fillStyle = '#9ea2a6'; fitText(c, '2', w / 2, h / 2 + 10, w, 360, F.wayfind); });
    const nm = quad(0.7, 1.05, std({ map: nt, transparent: true, roughness: 0.4 })); nm.rotation.y = -Math.PI / 2; nm.position.set(EX - 0.005, FY + 2.45, zc - 1.2); g.add(nm);
    const st = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = '#2d3a4e'; fitText(c, 'STAFF ONLY · NO ENTRY', w / 2, h / 2, w - 40, 46, F.wayfind, { spacing: 4 }); });
    const sm = quad(0.5, 0.125, std({ map: st })); sm.rotation.y = -Math.PI / 2; sm.position.set(EX - 0.07, FY + 1.65, zc); g.add(sm);
    // fire-hose cabinet (red, recessed look)
    const red = std({ color: '#b3231e', roughness: 0.4 });
    g.add(box(0.14, 0.9, 0.7, red, EX - 0.07, FY + 0.95, zc + 1.4));
    const ht = canvasTex(256, 320, (c, w, h) => { c.fillStyle = '#b3231e'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; fitText(c, 'FIRE HOSE', w / 2, 70, w - 40, 44, F.wayfind, { spacing: 3 }); c.strokeStyle = '#fff'; c.lineWidth = 8; c.beginPath(); c.arc(w / 2, 190, 60, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.arc(w / 2, 190, 30, 0, Math.PI * 2); c.stroke(); });
    const hm = quad(0.6, 0.75, std({ map: ht, roughness: 0.4 })); hm.rotation.y = -Math.PI / 2; hm.position.set(EX - 0.141, FY + 0.95, zc + 1.4); g.add(hm);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), glow(2.5, 0.25, 0.15)); lamp.position.set(EX - 0.15, FY + 1.5, zc + 1.4); g.add(lamp);
  }
  // 3. glass-front café, lit, with tables inside
  {
    const zc = -3.5, W = 3.6;
    const glass = new THREE.MeshStandardMaterial({ color: '#d6e6ea', transparent: true, opacity: 0.18, roughness: 0.04 });
    const gl = box(0.02, 2.4, W, glass, EX - 0.04, FY + 1.2, zc); gl.castShadow = false; g.add(gl);
    for (let k = 0; k <= 4; k++) g.add(box(0.05, 2.45, 0.05, steel, EX - 0.04, FY + 1.22, zc - W / 2 + k * W / 4));
    g.add(box(0.06, 0.05, W, steel, EX - 0.04, FY + 2.42, zc));
    // interior room
    const IW = 3.0;
    const fl = quad(IW, W, std({ color: '#8a6a4a', roughness: 0.5 })); fl.rotation.x = -Math.PI / 2; fl.rotation.z = Math.PI / 2; fl.position.set(EX + IW / 2, FY + 0.002, zc); g.add(fl);
    const bw = quad(W, 2.9, std({ color: '#e9dfcf' })); bw.rotation.y = -Math.PI / 2; bw.position.set(EX + IW, FY + 1.45, zc); g.add(bw);
    for (const s of [-1, 1]) { const w = quad(IW, 2.9, std({ color: '#d4c4aa' })); w.rotation.y = s > 0 ? Math.PI : 0; w.position.set(EX + IW / 2, FY + 1.45, zc + s * W / 2); g.add(w); }
    const cc = quad(IW, W, glow(0.9, 0.82, 0.7)); cc.rotation.x = Math.PI / 2; cc.rotation.z = Math.PI / 2; cc.position.set(EX + IW / 2, FY + 2.9, zc); g.add(cc);
    const wood = std({ color: '#4a3020', roughness: 0.5 });
    for (const [dx, dz] of [[0.9, -0.9], [0.9, 0.8], [2.1, 0]]) {
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.04, 24), std({ color: '#efe9e0', roughness: 0.3 })); top.position.set(EX + dx, FY + 0.74, zc + dz); g.add(top);
      g.add(box(0.05, 0.72, 0.05, steel, EX + dx, FY + 0.36, zc + dz));
      for (const a of [0, Math.PI]) { const ch = box(0.4, 0.45, 0.4, wood, EX + dx + Math.cos(a) * 0.55, FY + 0.225, zc + dz + Math.sin(a) * 0.1); g.add(ch); g.add(box(0.04, 0.45, 0.4, wood, EX + dx + Math.cos(a) * 0.75, FY + 0.65, zc + dz + Math.sin(a) * 0.1)); }
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.08, 12), std({ color: '#fff' })); cup.position.set(EX + dx + 0.1, FY + 0.8, zc + dz); g.add(cup);
    }
    // pendant lights
    for (const dz of [-1, 0, 1]) {
      const sh = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.18, 20, 1, true), std({ color: '#2a2a2a', side: THREE.DoubleSide }));
      sh.position.set(EX + 1.5, FY + 2.3, zc + dz); g.add(sh);
      g.add(tube(V(EX + 1.5, FY + 2.39, zc + dz), V(EX + 1.5, FY + 2.9, zc + dz), 0.006, darkRing, 4));
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), glow(2.4, 2.0, 1.4)); b.position.set(EX + 1.5, FY + 2.22, zc + dz); g.add(b);
    }
    const cl = new THREE.PointLight('#ffd9a8', 5, 7, 1.6); cl.position.set(EX + 1.5, FY + 2.0, zc); g.add(cl);
    // name in gold script on the glass + fascia
    const ft = canvasTex(1024, 160, (c, w, h) => { c.fillStyle = '#1f2a2a'; c.fillRect(0, 0, w, h); c.fillStyle = '#e7c983'; fitText(c, 'Kettle & Crumb', w / 2 - 80, h / 2 + 6, w - 380, 92, F.script); c.fillStyle = '#c9d6d4'; fitText(c, 'CAFÉ · B1', w - 170, h / 2 + 4, 230, 42, F.wayfind, { spacing: 6 }); });
    const fa = quad(W, 0.42, std({ map: ft, emissive: '#fff0d0', emissiveIntensity: 0.2, emissiveMap: ft })); fa.rotation.y = -Math.PI / 2; fa.position.set(EX - 0.06, FY + 2.75, zc); g.add(fa);
    const hrs = canvasTex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.85)'; fitText(c, 'OPEN', w / 2, 60, w - 40, 54, F.wayfind, { spacing: 8 }); fitText(c, '7:30 — 21:00', w / 2, 130, w - 40, 34, F.wayfind); fitText(c, 'coffee · tea · cakes', w / 2, 190, w - 40, 34, F.couture); });
    const hm = quad(0.42, 0.42, new THREE.MeshBasicMaterial({ map: hrs, transparent: true })); hm.rotation.y = -Math.PI / 2; hm.position.set(EX - 0.06, FY + 1.55, zc + 1.2); g.add(hm);
  }
  // 4. closed shutter at the south end of the east side
  {
    const zc = -10, ow = 3.8;
    const sh = quad(ow, SH, withRepeat(shutM, ow, SH)); sh.rotation.y = -Math.PI / 2; sh.position.set(EX - 0.02, FY + SH / 2, zc); g.add(sh);
    g.add(box(0.06, 0.06, ow, steel, EX - 0.05, FY + 0.03, zc));
    for (const s of [-1, 1]) g.add(box(0.06, SH, 0.06, steel, EX - 0.05, FY + SH / 2, zc + s * ow / 2));
    g.add(box(0.26, 0.32, ow + 0.1, white, EX - 0.1, FY + SH + 0.16, zc));
    const face = std({ map: shopSignTex('LIMEHOUSE', 'TAILORING & ALTERATIONS', F.roman, '#24323a', 'EAST GALLERY  ·  B1'), emissive: '#ffffff', emissiveIntensity: 0.28 });
    face.emissiveMap = face.map;
    const fm = quad(1.1, 0.55, face); fm.rotation.y = -Math.PI / 2; fm.position.set(EX - 0.11, FY + SH + 0.75, zc); g.add(fm);
    g.add(box(0.2, 0.56, 1.14, white, EX - 0.0, FY + SH + 0.75, zc));
  }

  // ---------------------------------------------------------------- hanging wayfinding sign + furniture
  {
    const wt = canvasTex(1024, 160, (c, w, h) => {
      c.fillStyle = '#22314a'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#ffffff';
      fitText(c, '↑  Elmwood Station  ·  Street', 300, h / 2, 520, 50, F.wayfind, { spacing: 2 });
      c.fillStyle = '#f2c230'; c.beginPath(); c.arc(700, h / 2, 34, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#22314a'; fitText(c, '2', 700, h / 2 + 3, 40, 46, F.wayfind);
      c.fillStyle = '#ffffff'; fitText(c, 'Exit  →', 860, h / 2, 200, 50, F.wayfind, { spacing: 2 });
    });
    const sg = new THREE.Group();
    sg.add(box(3.2, 0.5, 0.14, std({ color: '#22314a' })));
    for (const s of [-1, 1]) { const m = quad(3.16, 0.48, std({ map: wt, emissive: '#ffffff', emissiveIntensity: 0.45, emissiveMap: wt })); m.position.z = s * 0.071; if (s < 0) m.rotation.y = Math.PI; sg.add(m); }
    for (const s of [-1, 1]) sg.add(tube(V(s * 1.3, 0.25, 0), V(s * 1.3, CY - (FY + 2.7), 0), 0.01, steel, 6));
    sg.position.set(-2.3, FY + 2.7, 3.2); g.add(sg);
    // benches (granite block + wood slats) and a steel bin along the pillar line
    const wood = std({ color: '#8a6040', roughness: 0.55 });
    for (const z of [-10, -2, 6]) {
      const b = new THREE.Group();
      b.add(box(0.5, 0.36, 1.6, withRepeat(marble, 0.5, 1.2), 0, 0.18, 0));
      for (let k = 0; k < 5; k++) b.add(box(0.08, 0.04, 1.7, wood, -0.2 + k * 0.1, 0.38, 0));
      b.position.set(2.6, FY, z); g.add(b);
      colliders.push([2.3, 2.9, z - 0.85, z + 0.85, -4.6, -1.6]);
    }
    const bin = new THREE.Group();
    const bc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.85, 28), steel); bc.position.y = 0.425; bin.add(bc);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 28), darkRing); lid.position.y = 0.87; bin.add(lid);
    const slot = box(0.2, 0.06, 0.02, std({ color: '#0d0d0d' }), 0, 0.8, 0.22); bin.add(slot);
    bin.position.set(2.6, FY, 10.0); g.add(bin);
    colliders.push([2.35, 2.85, 9.75, 10.25, -4.6, -1.6]);
    // directory board near the stair
    const dt = canvasTex(512, 768, (c, w, h) => {
      c.fillStyle = '#22314a'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#fff'; fitText(c, 'FLOOR GUIDE  B1', w / 2, 50, w - 40, 40, F.wayfind, { spacing: 4 });
      c.fillStyle = '#e9edf2'; c.fillRect(30, 90, w - 60, 470);
      const blocks = [['#d9c7e8', 'Veranne'], ['#c7d9e8', 'Maison Lirac'], ['#e8d9c7', 'Ostra'], ['#e8c7cf', 'Belle Hollis'], ['#c7e8d6', 'Norde'], ['#e8e4c7', 'Pearl & Tide']];
      blocks.forEach(([col_, n], k) => { c.fillStyle = col_; c.fillRect(50, 110 + k * 72, 150, 62); c.fillStyle = '#2a2a2a'; fitText(c, n, 125, 141 + k * 72, 140, 22, F.wayfind); });
      c.fillStyle = '#cfd6de'; c.fillRect(220, 110, 70, 430);
      [['#f0d8b8', 'Deli'], ['#d8d8d8', '2'], ['#c8e0d8', 'Café'], ['#d0d8e8', 'Limehouse']].forEach(([col_, n], k) => { c.fillStyle = col_; c.fillRect(310, 110 + k * 108, 150, 96); c.fillStyle = '#2a2a2a'; fitText(c, n, 385, 158 + k * 108, 140, 26, F.wayfind); });
      c.fillStyle = '#e04030'; c.beginPath(); c.arc(255, 150, 12, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff'; fitText(c, 'You are here', w / 2, 600, w - 60, 30, F.wayfind);
      fitText(c, 'Stairs ↑ to Elmwood Station and the street', w / 2, 650, w - 60, 24, F.wayfind);
      fitText(c, 'Open daily 10:00 — 21:00', w / 2, 700, w - 60, 24, F.wayfind);
    });
    const db = new THREE.Group();
    db.add(box(0.8, 1.7, 0.12, std({ color: '#1a2436', roughness: 0.4 }), 0, 0.85 + 0.1, 0));
    const dm = quad(0.72, 1.08, std({ map: dt, emissive: '#ffffff', emissiveIntensity: 0.3, emissiveMap: dt })); dm.position.set(0, 1.15, 0.061); db.add(dm);
    db.add(box(0.9, 0.1, 0.3, steel, 0, 0.05, 0));
    db.position.set(-4.2, FY, 11.6); db.rotation.y = 0.5; g.add(db);
    colliders.push([-4.75, -3.65, 11.3, 11.95, -4.6, -1.6]);
  }

  // ---------------------------------------------------------------- south end: fire shutter + wall
  {
    const h = CY - FY;
    const sh = quad(HX * 2, h, withRepeat(shutM, HX * 2, h)); sh.position.set(0, FY + h / 2, -HZ); g.add(sh);
    g.add(box(HX * 2, 0.3, 0.3, white, 0, CY - 0.15, -HZ + 0.15));
    const sig = canvasTex(512, 96, (c, w, h2) => { c.fillStyle = '#f2f2ee'; c.fillRect(0, 0, w, h2); c.fillStyle = '#b3231e'; fitText(c, 'FIRE SHUTTER · KEEP CLEAR', w / 2, h2 / 2, w - 30, 44, F.wayfind, { spacing: 3 }); });
    const sm = quad(1.2, 0.22, std({ map: sig })); sm.position.set(-2, FY + 2.2, -HZ + 0.01); g.add(sm);
    col(-HX, HX, -HZ - 0.3, -HZ + 0.1);
  }

  // ---------------------------------------------------------------- north end wall with the stair opening
  const SW = 1.6;                                          // stair half width
  const RUN = 24 * 0.32, RISE = -FY;                       // 7.68 m run, 4.2 m rise
  const SZ0 = HZ, SZ1 = HZ + RUN;
  {
    const h = CY - FY;
    for (const s of [-1, 1]) {
      const w = HX - SW;
      const p = quad(w, h + 0.75, withRepeat(clad, w, h + 0.75)); p.rotation.y = Math.PI; p.position.set(s * (SW + w / 2), FY + (h + 0.75) / 2, HZ); g.add(p);
      col(s > 0 ? SW : -HX, s > 0 ? HX : -SW, HZ - 0.1, HZ + 0.3);
    }
    // stainless frame around the opening
    for (const s of [-1, 1]) g.add(box(0.1, h, 0.25, steel, s * (SW + 0.05), FY + h / 2, HZ));
    g.add(box(SW * 2 + 0.2, 0.12, 0.25, steel, 0, CY - 0.06, HZ));
    // header between the mall ceiling and the street slab over the stair mouth
    g.add(box(SW * 2 + 0.3, -CY, 0.3, std({ color: '#7d7f82', roughness: 0.9 }), 0, CY / 2, HZ + 0.15));
    // sign over the opening
    const st = canvasTex(1024, 128, (c, w, h2) => { c.fillStyle = '#22314a'; c.fillRect(0, 0, w, h2); c.fillStyle = '#fff'; fitText(c, '↑  Street  ·  Elmwood Station  ·  Bus', w / 2, h2 / 2, w - 60, 56, F.wayfind, { spacing: 3 }); });
    const sm = quad(3.0, 0.38, std({ map: st, emissive: '#ffffff', emissiveIntensity: 0.4, emissiveMap: st })); sm.rotation.y = Math.PI; sm.position.set(0, CY - 0.35, HZ - 0.14); g.add(sm);
    g.add(box(3.04, 0.42, 0.06, std({ color: '#22314a' }), 0, CY - 0.35, HZ - 0.1));
  }

  // ---------------------------------------------------------------- the stair
  {
    const tread = withRepeat(granite, 2 * SW / 1.2, 0.32 / 1.2);
    envMats.push(tread);
    const nose = std({ color: '#3b3c3e', roughness: 0.6 });
    const riserM = std({ color: '#c9c6c0', roughness: 0.4 });
    for (let i = 0; i < 24; i++) {
      const y = FY + (i + 1) * 0.175, z = SZ0 + i * 0.32;
      const t = box(SW * 2, 0.03, 0.32, tread, 0, y - 0.015, z + 0.16); t.castShadow = false; g.add(t);
      const r = quad(SW * 2, 0.145, riserM); r.rotation.y = Math.PI; r.position.set(0, y - 0.03 - 0.0725, z); g.add(r);
      g.add(box(SW * 2 - 0.1, 0.012, 0.05, nose, 0, y + 0.001, z + 0.03));
    }
    // solid mass under the flight (fills the side view)
    const under = new THREE.Mesh(new THREE.BoxGeometry(SW * 2, 0.2, Math.hypot(RUN, RISE)), std({ color: '#55575a' }));
    under.position.set(0, FY + RISE / 2 - 0.25, SZ0 + RUN / 2); under.rotation.x = -Math.atan2(RISE, RUN); g.add(under);
    // tiled side walls of the well (floor of the mall up to the street)
    for (const s of [-1, 1]) {
      const w = quad(RUN + 0.6, RISE, withRepeat(tile, RUN + 0.6, RISE)); w.rotation.y = -s * Math.PI / 2; w.position.set(s * SW, FY + RISE / 2, SZ0 + (RUN + 0.6) / 2); g.add(w);
      // stainless handrail on brackets, following the pitch
      const a = V(s * (SW - 0.06), FY + 0.9, SZ0 - 0.3), b = V(s * (SW - 0.06), 0.9, SZ1 + 0.3);
      g.add(tube(a, b, 0.022, steel, 12));
      for (let k = 0; k <= 4; k++) { const p = a.clone().lerp(b, k / 4); g.add(box(0.06, 0.02, 0.02, steel, p.x + s * 0.03, p.y - 0.04, p.z)); }
      // anti-slip yellow edge strip along the wall base
      // yellow anti-slip edge strip along the wall base, following the pitch
      const ya = V(s * (SW - 0.01), FY + 0.2, SZ0), yb = V(s * (SW - 0.01), 0.2, SZ1);
      const ys = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.06, ya.distanceTo(yb)), std({ color: '#c9a02a', roughness: 0.6 }));
      ys.position.copy(ya).lerp(yb, 0.5); ys.lookAt(yb); g.add(ys);
      colliders.push([s > 0 ? SW : -SW - 0.2, s > 0 ? SW + 0.2 : -SW, SZ0 - 0.2, SZ1 + 0.4, -4.6, 3.2]);
    }
    // granite coping over the tops of the well walls (closes the gap up to the kiosk curbs)
    for (const s of [-1, 1]) g.add(box(0.34, 0.1, RUN + 0.5, std({ map: ptex('um_floor.png', 0.3, 7), color: '#c8c6c2', roughness: 0.35 }), s * (SW + 0.15), -0.04, SZ0 + RUN / 2 + 0.05));
    // centre rail on posts
    const ca = V(0, FY + 0.9, SZ0 + 0.3), cb = V(0, 0.9, SZ1 - 0.1);
    g.add(tube(ca, cb, 0.024, steel, 12));
    for (let k = 0; k <= 5; k++) { const p = ca.clone().lerp(cb, k / 5); g.add(tube(V(0, p.y - 0.9, p.z), p, 0.02, steel, 8)); }
    colliders.push([-0.06, 0.06, SZ0 + 0.3, SZ1 - 0.1, -4.6, 0.6]);
    // lights in the well ceiling (the kiosk roof) are added with the kiosk
  }

  // ---------------------------------------------------------------- the street kiosk over the stair
  {
    const k = new THREE.Group();
    const KW = SW + 0.25, K0 = SZ0 - 0.2, K1 = SZ1 + 0.7, KH = 2.9;
    const stoneM = std({ map: ptex('um_floor.png', 1, 1), color: '#c8c6c2', roughness: 0.35 });
    const glass = new THREE.MeshStandardMaterial({ color: '#cfe0e8', transparent: true, opacity: 0.22, roughness: 0.04, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false });
    const frame = std({ color: '#3a3f46', metalness: 0.55, roughness: 0.4 });
    // granite curbs along both sides and the back
    for (const s of [-1, 1]) k.add(box(0.3, 0.32, K1 - K0, stoneM, s * KW, 0.16, (K0 + K1) / 2));
    k.add(box(KW * 2 + 0.3, 0.32, 0.3, stoneM, 0, 0.16, K0));
    // glass walls on steel posts
    for (const s of [-1, 1]) {
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(K1 - K0, KH - 0.4), glass); gl.rotation.y = Math.PI / 2; gl.position.set(s * KW, 0.32 + (KH - 0.4) / 2, (K0 + K1) / 2); k.add(gl);
      for (let i = 0; i <= 4; i++) k.add(box(0.08, KH - 0.3, 0.08, frame, s * KW, 0.32 + (KH - 0.3) / 2, K0 + i * (K1 - K0) / 4));
      k.add(box(0.1, 0.1, K1 - K0, frame, s * KW, 1.1, (K0 + K1) / 2));
    }
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(KW * 2, KH - 0.4), glass); bg.position.set(0, 0.32 + (KH - 0.4) / 2, K0); k.add(bg);
    // roof: steel frame, white soffit, glass top, fascia with the name
    const roofY = KH + 0.1;
    k.add(box(KW * 2 + 0.5, 0.06, K1 - K0 + 0.6, std({ color: '#f0f0ec', roughness: 0.5 }), 0, roofY - 0.08, (K0 + K1) / 2 + 0.1));
    const top = box(KW * 2 + 0.5, 0.04, K1 - K0 + 0.6, new THREE.MeshStandardMaterial({ color: '#9fb6c2', transparent: true, opacity: 0.55, roughness: 0.1, metalness: 0.2 }), 0, roofY + 0.18, (K0 + K1) / 2 + 0.1);
    top.rotation.x = 0.04; k.add(top);
    for (const s of [-1, 1]) k.add(box(0.12, 0.3, K1 - K0 + 0.6, frame, s * (KW + 0.25), roofY + 0.06, (K0 + K1) / 2 + 0.1));
    // downlights in the soffit
    for (let i = 0; i < 4; i++) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), glow(2.3, 2.2, 2.0)); d.rotation.x = Math.PI / 2; d.position.set(0, roofY - 0.115, K0 + 1 + i * 2.1); k.add(d); }
    const fasc = canvasTex(1024, 192, (c, w, h) => {
      c.fillStyle = '#22314a'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#f2c230'; c.fillRect(0, h - 14, w, 14);
      c.fillStyle = '#ffffff'; fitText(c, 'ELMWOOD UNDERGROUND', w / 2 + 60, 78, w - 300, 70, F.wayfind, { spacing: 8 });
      c.fillStyle = '#b9c6da'; fitText(c, 'SHOPS · CAFÉ · STATION LINK', w / 2 + 60, 140, w - 360, 34, F.wayfind, { spacing: 8 });
      c.fillStyle = '#f2c230'; c.fillRect(40, 36, 120, 120); c.fillStyle = '#22314a'; fitText(c, 'B1', 100, 100, 100, 74, F.wayfind);
    });
    const fm = quad(KW * 2 + 0.5, 0.48, std({ map: fasc, emissive: '#ffffff', emissiveIntensity: 0.55, emissiveMap: fasc })); fm.position.set(0, roofY + 0.0, K1 + 0.41); k.add(fm);
    k.add(box(KW * 2 + 0.5, 0.5, 0.06, frame, 0, roofY, K1 + 0.37));
    // totem sign beside the mouth
    const tt = canvasTex(256, 1024, (c, w, h) => {
      c.fillStyle = '#22314a'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#f2c230'; c.fillRect(40, 40, w - 80, w - 80); c.fillStyle = '#22314a'; fitText(c, 'B1', w / 2, 40 + (w - 80) / 2 + 6, w - 120, 120, F.wayfind);
      c.fillStyle = '#ffffff'; c.save(); c.translate(w / 2, 600); c.rotate(-Math.PI / 2); fitText(c, 'UNDERGROUND MALL', 0, 0, 560, 70, F.wayfind, { spacing: 6 }); c.restore();
      c.strokeStyle = '#fff'; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.moveTo(w / 2, 870); c.lineTo(w / 2, 970); c.moveTo(w / 2 - 40, 930); c.lineTo(w / 2, 970); c.lineTo(w / 2 + 40, 930); c.stroke();
    });
    const tg = new THREE.Group();
    tg.add(box(0.42, 2.6, 0.2, std({ color: '#22314a', roughness: 0.4 }), 0, 1.3, 0));
    for (const s of [-1, 1]) { const m = quad(0.38, 2.4, std({ map: tt, emissive: '#ffffff', emissiveIntensity: 0.4, emissiveMap: tt })); m.position.set(0, 1.35, s * 0.101); if (s < 0) m.rotation.y = Math.PI; tg.add(m); }
    tg.add(box(0.5, 0.12, 0.28, frame, 0, 0.06, 0));
    tg.position.set(KW + 0.9, 0, K1 + 0.2); tg.rotation.y = 0; k.add(tg);
    colliders.push([KW + 0.6, KW + 1.2, K1 + 0.0, K1 + 0.4, -0.6, 3.2]);
    // kiosk walls (street level) — the open mouth is at +z
    colliders.push([-KW - 0.2, KW + 0.2, K0 - 0.2, K0 + 0.2, -0.6, 3.2]);
    for (const s of [-1, 1]) colliders.push([s > 0 ? KW - 0.15 : -KW - 0.2, s > 0 ? KW + 0.2 : -KW + 0.15, K0, K1, -0.6, 3.2]);
    g.add(k);
    const kl = new THREE.PointLight('#f4f6ff', 6, 10, 1.5); kl.position.set(0, roofY - 0.5, SZ1 - 1.5); g.add(kl);
    const sl = new THREE.PointLight('#f4f6ff', 5, 9, 1.5); sl.position.set(0, -2.0, SZ0 + 2.5); g.add(sl);
  }

  // ---------------------------------------------------------------- lights in the hall (kept to a few)
  for (const [x, z] of [[-3, -10.5], [-3, -3.5], [-3, 3.5], [-3, 10.5], [5, -6], [5, 6]]) {
    const l = new THREE.PointLight('#f4f6ff', 9, 13, 1.3); l.position.set(x, CY - 0.4, z); g.add(l);
  }
  // shell behind everything so nothing outside shows through gaps
  {
    const shell = std({ color: '#2a2a2c', roughness: 1, side: THREE.BackSide });
    // (no +z face: the stair opening is in that end)
    const sb = new THREE.Mesh(new THREE.BoxGeometry(HX * 2 + 7, -FY + 0.1, HZ * 2 + 0.8), [shell, shell, shell, shell, new THREE.MeshBasicMaterial({ visible: false }), shell]);
    sb.position.set(-1.5, (FY - 0.4) / 2 - 0.15, 0); g.add(sb);
  }

  g.traverse((o) => { if (o.isMesh && o.material && o.material.transparent) o.castShadow = false; });
  g.userData.colliders = colliders;
  g.userData.envMats = envMats;
  g.userData.envProbe = V(-1, FY + 1.6, 0);
  g.userData.hideForCapture = hide;
  g.userData.FY = FY;
  // walkable regions: the hall (below), the stair, the kiosk mouth at street level
  g.userData.areas = [
    { minX: -HX + 0.3, maxX: HX - 0.3, minZ: -HZ + 0.4, maxZ: HZ - 0.2, y0: -4.5, y1: -3.5 },
    { minX: -SW + 0.2, maxX: SW - 0.2, minZ: SZ0 - 0.5, maxZ: SZ1 + 1.2, y0: -4.5, y1: 0.5 },
  ];
  g.userData.floorY = (x, z, prevY) => {
    if (Math.abs(x) < SW + 0.3 && z > SZ0 && z < SZ1 + 0.01 && prevY > FY - 0.5 && prevY < 0.6) {
      return FY + Math.min(RISE, Math.max(0, (z - SZ0) / RUN * RISE));
    }
    if (Math.abs(x) < HX && z > -HZ && z <= SZ0 + 0.01 && prevY < -2) return FY;
    return null;
  };
  return g;
}
