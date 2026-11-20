// City places from the city photos (28e). All names and notices are made up.
//   makeStationGate()  station plaza gateway: two huge plant-covered pillars + lintel (living wall
//       texture from the photo, leaf clumps, round planter pods), raised white name letters,
//       white canopy with a glass skylight on green steel "tree" columns, a draped vine curtain,
//       a yellow banner, the glass station hall behind with a lit concourse, ticket gates and
//       signs, tactile paving strip, shrub beds at the pillar feet
//   makeLotusPond(w, d) night pond: dark reflective water with light streaks, hundreds of lotus
//       pads (flat, curled, yellowing, a few stems), a band of dry reeds (photo texture cards),
//       a stone edge with railing, a temple hall with a green hip roof across the water, distant
//       lit towers on the skyline, lamp glows reflected in the water
//   makeRockDoor()     fake-rock bar door: sculpted rock facade (jagged slabs on a displaced
//       surface, rock texture from the photo), an arch of rounded stones, roll shutter with
//       made-up notices, red raised numbers, round stone step, wire grille with umbrellas,
//       grey pipe, black wall lamp, a dark plaque, a sandwich board
// Each faces +z, origin at ground level.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
function ptex(name, rx = 1, ry = 1) {
  const t = _L.load(`assets/textures/${name}`);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8;
  return t;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
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
  m.castShadow = true;
  return m;
}
// box whose faces bulge outward with noise (for planted / rock surfaces); UVs in metres / unit
function lumpyBox(w, h, d, mat, amp, seed, unit = 1.2, seg = 0.25) {
  const geo = new THREE.BoxGeometry(w, h, d, Math.max(2, Math.round(w / seg)), Math.max(2, Math.round(h / seg)), Math.max(2, Math.round(d / seg)));
  const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv, r = rng(seed);
  const key = new Map();
  for (let i = 0; i < p.count; i++) {
    const k = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    let o = key.get(k); if (o === undefined) { o = r() * amp; key.set(k, o); }
    p.setXYZ(i, p.getX(i) + n.getX(i) * o, p.getY(i) + n.getY(i) * o, p.getZ(i) + n.getZ(i) * o);
    const ax = Math.abs(n.getX(i)), az = Math.abs(n.getZ(i));
    const u = ax > 0.5 ? p.getZ(i) : p.getX(i), v = ax > 0.5 || az > 0.5 ? p.getY(i) : p.getZ(i);
    uv.setXY(i, u / unit, v / unit);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- station gateway
export function makeStationGate() {
  const g = new THREE.Group();
  const ivy = std({ map: ptex('st_ivy.png'), roughness: 0.95, color: '#e8ffd8', emissive: '#16240e' });
  const leafM = std({ color: '#5a8a3a', roughness: 0.9, emissive: '#0e1a08' });
  const PW = 3.2, PD = 2.4, PH = 9.0, SPAN = 12.0, LH = 3.0;
  // pillars + lintel (planted surfaces bulge a little), base kerbs
  for (const s of [-1, 1]) {
    const p = lumpyBox(PW, PH, PD, ivy, 0.08, 3 + s, 1.6, 0.4); p.position.set(s * (SPAN / 2 + PW / 2), PH / 2, 0); g.add(p);
    g.add(box(PW + 0.5, 0.35, PD + 0.5, std({ color: '#9a9690', roughness: 0.9 }), s * (SPAN / 2 + PW / 2), 0.175, 0));
  }
  const lin = lumpyBox(SPAN + PW * 2, LH, PD, ivy, 0.08, 9, 1.6, 0.4); lin.position.set(0, PH + LH / 2 - 0.2, 0); g.add(lin);
  // leaf clumps + round planter pods + hanging tendrils over the green surfaces
  const r = rng(11);
  const clump = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.16, 0), leafM, 520);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3();
  let k = 0;
  const addClump = (x, y, z) => { if (k >= 520) return; q.setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)); const s = 0.6 + r() * 0.9; sc.set(s, s * 0.6, s); clump.setMatrixAt(k++, m4.compose(pos.set(x, y, z), q, sc)); };
  for (let i = 0; i < 160; i++) for (const s of [-1, 1]) { const x = s * (SPAN / 2 + PW / 2) + (r() - 0.5) * PW, y = 0.4 + r() * PH; addClump(x, y, PD / 2 + 0.06); }
  for (let i = 0; i < 180; i++) addClump((r() - 0.5) * (SPAN + PW * 2), PH - 0.2 + r() * LH, PD / 2 + 0.06);
  clump.count = k; g.add(clump);
  const podM = std({ color: '#5a7a6a', roughness: 0.6, metalness: 0.2 });
  for (let i = 0; i < 26; i++) {
    const side = i % 3; const x = side === 2 ? (r() - 0.5) * (SPAN + PW) : (side ? 1 : -1) * (SPAN / 2 + PW / 2) + (r() - 0.5) * (PW - 0.6);
    const y = side === 2 ? PH + 0.3 + r() * (LH - 0.8) : 1 + r() * (PH - 1.5);
    const pod = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), podM); pod.rotation.x = Math.PI / 2; pod.position.set(x, y, PD / 2 + 0.1); g.add(pod);
  }
  // raised white name letters on the lintel (made-up station name)
  const names = ['E', 'L', 'M', 'W', 'O', 'O', 'D'];
  names.forEach((ch, i) => {
    const t = canvasTex(128, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#f6f6f2'; fitText(c, ch, w / 2, h / 2 + 4, 110, 120, '"Cinzel"', { weight: '700' }); });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), std({ map: t, transparent: true, alphaTest: 0.4, roughness: 0.4, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.25 }));
    plate.position.set(-5.0 + i * 1.65, PH + 1.4, PD / 2 + 0.2); g.add(plate);
    const sh = plate.clone(); sh.material = new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.4, color: '#000000', opacity: 0.4 }); sh.position.z -= 0.05; sh.position.x += 0.03; sh.position.y -= 0.03; g.add(sh);
  });
  // canopy: white sloped slab with glass skylight + fascia, on green steel tree columns
  const white = std({ color: '#f2f2ee', roughness: 0.5 });
  const CY = 5.6, CW = SPAN - 0.4, CD = 6.0;
  g.add(box(CW, 0.35, CD, white, 0, CY, 0.6));
  g.add(box(CW + 0.2, 0.6, 0.2, white, 0, CY - 0.1, 0.6 + CD / 2));
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(CW - 2, CD - 2), std({ color: '#cfe0e8', roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.6 }));
  sky.rotation.x = Math.PI / 2; sky.position.set(0, CY - 0.18, 0.6); g.add(sky);
  for (let i = -4; i <= 4; i++) g.add(box(0.06, 0.08, CD - 2, std({ color: '#d8d8d4' }), i * 1.0, CY - 0.2, 0.6));
  const green = std({ color: '#3a5a3a', metalness: 0.5, roughness: 0.4 });
  for (const x of [-3.0, 3.0]) {
    g.add(tube(V(x, 0, 1.5), V(x, CY - 1.6, 1.5), 0.18, green, 16));
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.3, 0.25, 20), green); ring.position.set(x, CY - 1.55, 1.5); g.add(ring);
    for (let a = 0; a < 4; a++) { const ang = a * Math.PI / 2 + 0.6; g.add(tube(V(x, CY - 1.5, 1.5), V(x + Math.cos(ang) * 1.8, CY - 0.2, 1.5 + Math.sin(ang) * 1.8), 0.07, green)); }
    g.add(box(0.7, 0.35, 0.7, std({ color: '#9a9690' }), x, 0.17, 1.5));
  }
  // vine curtain hanging under the canopy edge
  const vine = canvasTex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); const rr = rng(4); for (let i = 0; i < 90; i++) { const x = rr() * w, l = 60 + rr() * 190; c.strokeStyle = 'rgba(40,80,30,0.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (rr() - 0.5) * 10, l); c.stroke(); for (let y = 6; y < l; y += 9) { c.fillStyle = ['#3f7a2a', '#4f8a32', '#2f6a24'][Math.floor(rr() * 3)]; c.beginPath(); c.ellipse(x + (rr() - 0.5) * 12, y, 6, 4, rr() * 3, 0, 7); c.fill(); } } });
  const vm = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.6), std({ map: vine, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.9 }));
  vm.position.set(0, CY - 1.0, -2.0); g.add(vm);
  // yellow banner strung between the tree columns (made-up safety slogan)
  const ban = canvasTex(1024, 192, (c, w, h) => {
    c.fillStyle = '#f6d21a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1a1a1a'; c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12);
    c.fillStyle = '#1a1a1a'; fitText(c, 'WATCH YOUR WALLET', w / 2 + 60, 70, w - 260, 90, '"Archivo Black"', { spacing: 2 });
    c.fillStyle = '#c8202a'; fitText(c, 'Report anything suspicious to the station office', w / 2 + 60, 150, w - 260, 40, '"Oswald"', { weight: '600' });
    c.fillStyle = '#e8762a'; c.beginPath(); c.arc(100, h / 2, 60, 0, 7); c.fill(); c.fillStyle = '#fff'; fitText(c, '!', 100, h / 2 + 4, 60, 90, '"Archivo Black"');
  });
  const bm = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.8, 12, 1), std({ map: ban, side: THREE.DoubleSide, roughness: 0.8 }));
  { const p = bm.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) / 2.1; p.setY(i, p.getY(i) - (1 - x * x) * 0.12); p.setZ(i, Math.sin(x * 3) * 0.04); } bm.geometry.computeVertexNormals(); }
  bm.position.set(0, CY - 0.85, 1.55); g.add(bm);
  // station hall behind: glass curtain wall with mullions, lit concourse, ticket gates, signs
  const HZ = -6, HW = 26, HH = 10;
  const glass = std({ color: '#7a98a8', roughness: 0.1, metalness: 0.5, emissive: '#1a2a34' });
  g.add(box(HW, HH, 0.2, glass, 0, HH / 2, HZ - 4));
  for (let x = -HW / 2; x <= HW / 2; x += 1.6) g.add(box(0.08, HH, 0.25, std({ color: '#c8cacc', metalness: 0.5 }), x, HH / 2, HZ - 3.9));
  for (let y = 2.5; y < HH; y += 2.5) g.add(box(HW, 0.1, 0.25, std({ color: '#c8cacc', metalness: 0.5 }), 0, y, HZ - 3.9));
  g.add(box(HW, 0.25, 8, std({ color: '#e8e6e0', emissive: '#4a4840' }), 0, 4.0, HZ));      // concourse ceiling
  g.add(box(9, 4, 0.2, std({ color: '#d8d4c8', emissive: '#2a2820' }), 0, 2.0, HZ - 3.8));
  const conc = std({ color: '#c8c4bc' }); g.add(box(HW, 0.05, 8, conc, 0, 0.025, HZ));
  for (let x = -3; x <= 3; x += 1.0) {
    g.add(new THREE.Mesh(new RoundedBoxGeometry(0.25, 1.0, 1.6, 2, 0.04), std({ color: '#d8dade', metalness: 0.4, roughness: 0.3 })).translateX(x).translateY(0.5).translateZ(HZ - 1));
    g.add(box(0.15, 0.03, 0.05, glow(0.4, 1.8, 0.6), x + 0.05, 1.01, HZ - 0.3));
  }
  for (let i = 0; i < 6; i++) { const l = box(1.5, 0.05, 0.25, glow(1.8, 1.8, 1.7), -6 + i * 2.4, 3.85, HZ); g.add(l); }
  const sign = canvasTex(1024, 128, (c, w, h) => { c.fillStyle = '#1a2a4a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; fitText(c, 'TICKET GATES  ·  PLATFORMS 1 – 4  →', w / 2, h / 2 + 3, w - 60, 70, '"Oswald"', { weight: '600', spacing: 2 }); });
  g.add(box(6, 0.5, 0.1, [std({ color: '#1a2a4a' }), std({ color: '#1a2a4a' }), std({ color: '#1a2a4a' }), std({ color: '#1a2a4a' }), new THREE.MeshBasicMaterial({ map: sign, toneMapped: false }), std({ color: '#1a2a4a' })], 0, 3.4, HZ + 2.5));
  const hl = new THREE.PointLight('#f2f4ff', 12, 16, 1.4); hl.position.set(0, 3.4, HZ); g.add(hl);
  const cl = new THREE.PointLight('#f2f4ff', 8, 12, 1.4); cl.position.set(0, CY - 0.8, 1.5); g.add(cl);
  // ground uplights washing the green pillars
  for (const s of [-1, 1]) { const ul = new THREE.PointLight('#e8ffd0', 9, 12, 1.4); ul.position.set(s * (SPAN / 2 + PW / 2), 1.0, PD / 2 + 2.2); g.add(ul); g.add(box(0.4, 0.15, 0.3, glow(1.6, 1.7, 1.4), s * (SPAN / 2 + PW / 2), 0.08, PD / 2 + 1.4)); }
  // tactile paving strip + shrub beds
  const tact = canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#e8c21a'; c.fillRect(0, 0, w, h); c.fillStyle = '#c8a20a'; for (let x = 4; x < w; x += 16) c.fillRect(x, 0, 6, h); });
  tact.repeat.set(1, 30);
  const tm = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 18), std({ map: tact, roughness: 0.6 })); tm.rotation.x = -Math.PI / 2; tm.position.set(0, 0.012, 3); g.add(tm);
  for (const s of [-1, 1]) for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35 + r() * 0.2, 1), std({ color: ['#3f6a2a', '#4f7a32', '#2f5a24'][i % 3], roughness: 1, flatShading: true })); b.position.set(s * (SPAN / 2 + PW / 2) + (r() - 0.5) * (PW + 1), 0.3, PD / 2 + 0.5 + r() * 0.5); b.scale.y = 0.7; g.add(b); }
  g.userData.colliders = [[-SPAN / 2 - PW - 0.25, -SPAN / 2 + 0.25, -PD / 2 - 0.25, PD / 2 + 0.25], [SPAN / 2 - 0.25, SPAN / 2 + PW + 0.25, -PD / 2 - 0.25, PD / 2 + 0.25], [-3.4, -2.6, 1.1, 1.9], [2.6, 3.4, 1.1, 1.9], [-HW / 2, HW / 2, HZ - 4.2, HZ - 3.8], [-3.2, 3.2, HZ - 1.9, HZ - 0.1]];
  return g;
}

// ---------------------------------------------------------------- night lotus pond
export function makeLotusPond(W = 26, D = 30) {
  const g = new THREE.Group();
  const r = rng(21);
  // water: dark, glossy, with vertical light streaks (reflections of the far towers and lamps)
  const wt = canvasTex(1024, 1024, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1e1f22'); gr.addColorStop(1, '#141517'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { const x = r() * w, ww = 4 + r() * 16; const col = r() < 0.3 ? '255,120,120' : '255,220,170'; const g2 = c.createLinearGradient(0, 0, 0, h); g2.addColorStop(0, `rgba(${col},${0.25 + r() * 0.3})`); g2.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g2; for (let y = 0; y < h * (0.3 + r() * 0.5); y += 6) c.fillRect(x + Math.sin(y * 0.08) * 3, y, ww * (1 - y / h), 3); }
    c.strokeStyle = 'rgba(255,255,255,0.03)'; for (let i = 0; i < 300; i++) { c.beginPath(); const y = r() * h; c.moveTo(r() * w, y); c.lineTo(r() * w, y + (r() - 0.5) * 4); c.stroke(); }
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: wt, roughness: 0.08, metalness: 0.4, color: '#d8d8d8', emissive: '#ffffff', emissiveMap: wt, emissiveIntensity: 0.6 }));
  water.rotation.x = -Math.PI / 2; water.position.set(0, -0.25, -D / 2); g.add(water);
  // stone edge + low iron railing along the near side and both sides
  const stone = std({ color: '#8a8780', roughness: 0.95 });
  g.add(box(W + 1, 0.4, 0.5, stone, 0, -0.05, 0.25));
  for (const s of [-1, 1]) g.add(box(0.5, 0.4, D, stone, s * (W / 2 + 0.25), -0.05, -D / 2));
  const iron = std({ color: '#2a2c2e', metalness: 0.5, roughness: 0.4 });
  g.add(box(W, 0.04, 0.04, iron, 0, 0.75, 0.35), box(W, 0.03, 0.03, iron, 0, 0.45, 0.35));
  for (let x = -W / 2; x <= W / 2; x += 1.5) g.add(box(0.05, 0.6, 0.05, iron, x, 0.45, 0.35));
  // lotus pads: instanced discs with a notch, mixed green / yellow / brown, some curled up, a few stems
  const padTex = canvasTex(128, 128, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    const gr = c.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, '#9ab84a'); gr.addColorStop(1, '#5a7a2a');
    c.fillStyle = gr; c.beginPath(); c.moveTo(64, 64); c.arc(64, 64, 62, 0.2, Math.PI * 2 - 0.05); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(220,230,170,0.5)'; c.lineWidth = 2; for (let a = 0; a < 16; a++) { c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + Math.cos(a / 16 * 6.28) * 58, 64 + Math.sin(a / 16 * 6.28) * 58); c.stroke(); }
  });
  const padM = new THREE.MeshStandardMaterial({ map: padTex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.5, emissive: '#0c1006' });
  const padGeo = new THREE.CircleGeometry(0.5, 24);
  { const p = padGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), d = Math.hypot(x, y); p.setZ(i, d * d * 0.35); } padGeo.computeVertexNormals(); }   // cupped up at the rim
  const N = 900;
  const pads = new THREE.InstancedMesh(padGeo, padM, N);
  const col = new THREE.Color();
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    const x = (r() - 0.5) * (W - 1), z = -0.8 - Math.pow(r(), 0.8) * (D - 6);
    const s = 0.25 + r() * 0.45;
    q.setFromEuler(new THREE.Euler(-Math.PI / 2 + (r() - 0.5) * (r() < 0.15 ? 1.4 : 0.15), 0, r() * 6.28));
    pads.setMatrixAt(i, m4.compose(ps.set(x, -0.22 + (r() < 0.12 ? 0.15 : 0), z), q, sc.set(s, s, s)));
    const t = r(); col.set(t < 0.4 ? '#b8d080' : t < 0.75 ? '#d8c870' : t < 0.93 ? '#c89a5a' : '#8a6a4a'); col.multiplyScalar(0.75 + r() * 0.4);
    pads.setColorAt(i, col);
  }
  g.add(pads);
  const stemM = std({ color: '#6a7a3a' }), podM2 = std({ color: '#7a6a3a', roughness: 0.8 });
  for (let i = 0; i < 40; i++) {      // dry seed-pod stalks poking out of the water
    const x = (r() - 0.5) * W * 0.9, z = -1 - r() * (D - 8), h = 0.3 + r() * 0.6;
    g.add(tube(V(x, -0.25, z), V(x + (r() - 0.5) * 0.15, -0.25 + h, z), 0.008, stemM));
    if (r() < 0.6) { const pd = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.025, 0.05, 10), podM2); pd.position.set(x, -0.22 + h, z); pd.rotation.z = (r() - 0.5) * 0.8; g.add(pd); }
  }
  // dry reed band across the far side: rows of photo-textured cards
  const reedT = ptex('pd_reeds.png', 3, 1);
  const reedM = new THREE.MeshStandardMaterial({ map: reedT, transparent: true, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 1, color: '#d8c8a8', emissive: '#2a2010' });
  for (let row = 0; row < 5; row++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(W + 2, 1.5 + row * 0.15), reedM);
    m.position.set((r() - 0.5) * 0.6, 0.5 + row * 0.05, -D + 4.5 - row * 0.7); g.add(m);
  }
  // far shore: dark trees, the temple hall, lamp glows, skyline towers with lit windows
  const treeM = std({ color: '#1a2a1e', roughness: 1 });
  for (let i = 0; i < 26; i++) { const t = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4 + r() * 1.4, 1), treeM); t.position.set(-W / 2 - 2 + i * (W + 4) / 26, 1.6 + r() * 1.2, -D - 1 - r() * 2); t.scale.y = 1.2; g.add(t); }
  // temple hall: raised base, red posts, white walls, two-tier green hip roof with a finial
  const hall = new THREE.Group();
  hall.add(box(5, 0.6, 4, std({ color: '#6a6660' }), 0, 0.3, 0));
  for (const x of [-2.1, -0.7, 0.7, 2.1]) for (const z of [-1.6, 1.6]) hall.add(box(0.18, 2.4, 0.18, std({ color: '#8a2a1e', roughness: 0.6 }), x, 1.8, z));
  hall.add(box(4.2, 2.2, 3.2, std({ color: '#e8dcc0', emissive: '#4a3a20' }), 0, 1.75, 0));
  for (const x of [-1.4, 0, 1.4]) hall.add(box(0.9, 1.4, 0.05, glow(1.6, 1.2, 0.7), x, 1.7, 1.62));
  const roofM = std({ color: '#3a6a5a', roughness: 0.5, metalness: 0.2 });
  const roof1 = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 3.6, 1.0, 4, 1), roofM); roof1.rotation.y = Math.PI / 4; roof1.position.y = 3.4; roof1.scale.z = 0.85; hall.add(roof1);
  hall.add(box(2.6, 0.6, 2.2, std({ color: '#8a2a1e' }), 0, 4.15, 0));
  const roof2 = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.4, 4), roofM); roof2.rotation.y = Math.PI / 4; roof2.position.y = 5.1; roof2.scale.z = 0.85; hall.add(roof2);
  const fin = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), std({ color: '#c8a050', metalness: 0.7 })); fin.position.y = 5.9; hall.add(fin);
  hall.add(tube(V(0, 5.7, 0), V(0, 6.3, 0), 0.03, std({ color: '#c8a050', metalness: 0.7 })));
  hall.position.set(W * 0.18, 0, -D - 1.5); hall.scale.setScalar(1.5); g.add(hall);
  const hlL = new THREE.PointLight('#ffc888', 18, 24, 1.3); hlL.position.set(W * 0.18, 4.0, -D + 2.5); g.add(hlL);
  const wl = new THREE.PointLight('#ffe8c8', 10, 22, 1.3); wl.position.set(0, 3.5, -4); g.add(wl);
  for (const x of [-W * 0.3, -W * 0.05, W * 0.38]) { g.add(box(0.12, 3, 0.12, std({ color: '#222' }), x, 1.5, -D)); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 8), glow(2.2, 2.0, 1.6)).translateX(x).translateY(3.1).translateZ(-D)); }
  // skyline: tall towers far behind with lit window grids and red beacons
  const towerTex = (seed) => canvasTex(128, 512, (c, w, h) => { c.fillStyle = '#2a2d33'; c.fillRect(0, 0, w, h); const rr = rng(seed); for (let y = 6; y < h; y += 10) for (let x = 6; x < w - 4; x += 10) { if (rr() < 0.38) { c.fillStyle = rr() < 0.8 ? '#e8c890' : '#cfe0f0'; c.fillRect(x, y, 6, 6); } else { c.fillStyle = '#3a3e46'; c.fillRect(x, y, 6, 6); } } });
  [[-W * 0.45, 46, 7, 1], [-W * 0.3, 34, 6, 2], [-W * 0.12, 52, 7.5, 3], [W * 0.05, 26, 6, 4], [W * 0.3, 30, 7, 5], [-W * 0.6, 40, 6, 6]].forEach(([x, h, w, sd]) => {
    const t = towerTex(sd); t.repeat.set(1, 1.7); t.repeat.set(1, 1);
    // (pushed far back behind the nature trail, and scaled up so they still read over the trees)
    const tz = -D - 230 - sd * 12; h *= 1.9; w *= 1.8;
    const tw = box(w, h, w, std({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.55, roughness: 0.6 }), x * 3.2, h / 2 - 1, tz);
    g.add(tw);
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), glow(2.5, 0.3, 0.3)).translateX(x * 3.2).translateY(h - 0.6).translateZ(tz));
  });
  g.userData.colliders = [[-W / 2 - 0.5, W / 2 + 0.5, 0.2, 0.5], [-W / 2 - 0.5, -W / 2, -D, 0.5], [W / 2, W / 2 + 0.5, -D, 0.5], [-W / 2, W / 2, -D, 0.2]];
  return g;
}

// ---------------------------------------------------------------- fake-rock bar door
export function makeRockDoor() {
  const g = new THREE.Group();
  const W = 2.2, H = W * 1650 / 760;            // facade size taken from the photo's proportions
  const T = 0.3;
  // sculpted facade: a dense grid displaced by the relief map baked from the photo (lit stone faces
  // stand proud, cracks sink), coloured by the photo itself; the shutter area is recessed and flat
  const SX = 150, SY = 320;
  const geo = new THREE.PlaneGeometry(W, H, SX, SY);
  const faceT = ptex('fr_face.png'); faceT.wrapS = faceT.wrapT = THREE.ClampToEdgeWrapping;
  const faceM = new THREE.MeshStandardMaterial({ map: faceT, alphaTest: 0.5, roughness: 0.75, color: '#f4f4f4', emissive: '#141414', side: THREE.DoubleSide });
  const face = new THREE.Mesh(geo, faceM);
  face.position.set(0, H / 2, 0); face.castShadow = face.receiveShadow = true;
  g.add(face);
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, img.width, img.height).data;
    const at = (u, v) => { const px = Math.min(img.width - 1, Math.max(0, Math.round(u * (img.width - 1)))), py = Math.min(img.height - 1, Math.max(0, Math.round((1 - v) * (img.height - 1)))); const i = (py * img.width + px) * 4; return [d[i] / 255, d[i + 1] / 255]; };
    const p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      // average a small neighbourhood so the relief is smooth, not noisy
      let h = 0, m = 0; const u = uv.getX(i), v = uv.getY(i);
      const N = [[0, 0], [0.006, 0], [-0.006, 0], [0, 0.003], [0, -0.003], [0.004, 0.002], [-0.004, -0.002], [0.004, -0.002], [-0.004, 0.002]];
      for (const [du, dv] of N) { const [a, b] = at(u + du, v + dv); h += a; m += b; }
      h /= N.length; m /= N.length;
      const rockZ = 0.03 + h * 0.11;
      p.setZ(i, m > 0.5 ? rockZ : -0.1);
    }
    geo.computeVertexNormals();
    p.needsUpdate = true;
  };
  img.src = 'assets/textures/fr_height.png';
  // body behind the facade so the sides read solid, plus a dark void behind the shutter edges
  g.add(box(W - 0.1, H - 0.25, T, std({ color: '#2a2a2c', roughness: 0.9 }), 0, (H - 0.25) / 2, -T / 2 - 0.13));
  // made-up raised red number: a stack of layers so it has real thickness
  const numT = canvasTex(256, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#c41e22'; fitText(c, '808', w / 2, h / 2 + 6, w - 30, 112, '"Alfa Slab One"'); });
  const numSide = canvasTex(256, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#7a1214'; fitText(c, '808', w / 2, h / 2 + 6, w - 30, 112, '"Alfa Slab One"'); });
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.31), new THREE.MeshStandardMaterial({ map: i === 5 ? numT : numSide, transparent: true, alphaTest: 0.5, roughness: 0.35 }));
    m.position.set(0.02, H * (1 - 190 / 825), 0.11 + i * 0.008); m.castShadow = i === 0; g.add(m);
  }
  // made-up notices taped to the shutter (on the recessed plane)
  const notice = (x, y, head, lines, col) => {
    const t = canvasTex(160, 220, (c, w, h) => { c.fillStyle = '#f6f6f2'; c.fillRect(0, 0, w, h); c.fillStyle = col; c.fillRect(0, 0, w, 30); c.fillStyle = '#fff'; fitText(c, head, w / 2, 16, w - 16, 22, '"Oswald"', { weight: '600' }); c.fillStyle = '#222'; lines.forEach((l, i) => fitText(c, l, w / 2, 60 + i * 30, w - 20, 22, '"Roboto Condensed"')); c.fillStyle = 'rgba(220,220,200,0.8)'; c.fillRect(w / 2 - 20, 0, 40, 8); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.41), std({ map: t, roughness: 0.8 })); m.position.set(x, y, -0.092); m.rotation.z = (x > 0 ? 0.02 : -0.015); g.add(m);
  };
  notice(-0.2, H * (1 - 427 / 825), 'NO PARKING', ['Keep the door', 'clear at all', 'times — thanks'], '#c8202a');
  notice(0.17, H * (1 - 427 / 825), 'GROTTO BAR', ['Open late', 'Wed – Sun', '8 PM till dawn'], '#2a4a8a');
  // small carved name down the right jamb (made-up), painted red like the photo's
  const vt = canvasTex(64, 320, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(190,40,30,0.9)'; ['G', 'R', 'O', 'T', 'T', 'O'].forEach((ch, i) => fitText(c, ch, w / 2, 30 + i * 50, 50, 44, '"Alfa Slab One"')); });
  const vm = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.65), std({ map: vt, transparent: true, alphaTest: 0.3 })); vm.position.set(0.81, H * (1 - 470 / 825), 0.13); g.add(vm);
  // shutter bottom bar + a padlock, the round stone step (photo texture on top)
  g.add(box(1.36, 0.06, 0.06, std({ color: '#3a3836', metalness: 0.5 }), 0.0, 0.06, -0.07));
  const lockB = box(0.06, 0.07, 0.03, std({ color: '#b8923a', metalness: 0.7, roughness: 0.3 }), 0.25, 0.12, -0.03); g.add(lockB);
  const stepTop = ptex('fr_step.png'); stepTop.wrapS = stepTop.wrapT = THREE.ClampToEdgeWrapping;
  const step = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.7, 0.16, 36), [std({ map: ptex('fr_rock.png', 3, 0.3), color: '#9a9a9a', roughness: 0.9 }), std({ map: stepTop, color: '#8a8a8a', roughness: 0.85 }), std({ color: '#3a3836' })]);
  step.scale.z = 0.55; step.position.set(0, 0.08, 0.4); step.castShadow = step.receiveShadow = true; g.add(step);
  // pebbles at the foot like the photo
  const rr = rng(13);
  for (let i = 0; i < 30; i++) { const pb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.02 + rr() * 0.03, 0), std({ color: ['#c8c4bc', '#8a8680', '#e0dcd4'][i % 3] })); pb.position.set((rr() < 0.5 ? -1 : 1) * (0.6 + rr() * 0.4), 0.02, 0.15 + rr() * 0.3); g.add(pb); }
  const ll2 = new THREE.PointLight('#ffe0b8', 4, 5, 1.5); ll2.position.set(0, 2.2, 1.3); g.add(ll2);
  // right: grey stucco wall, wire grille with umbrellas, grey pipe, black lamp, dark plaque
  const stucco = std({ color: '#d8d6d0', roughness: 0.95 });
  g.add(box(2.4, H + 0.6, 0.2, stucco, W / 2 + 1.2, (H + 0.6) / 2, -0.2));
  const wire = std({ color: '#c8cacc', metalness: 0.6, roughness: 0.3 });
  const GX = W / 2 + 0.55;
  for (let i = 0; i <= 6; i++) g.add(box(0.012, 1.6, 0.012, wire, GX - 0.3 + i * 0.1, 0.8, 0.25));
  for (let i = 0; i <= 10; i++) g.add(box(0.62, 0.012, 0.012, wire, GX, 0.05 + i * 0.155, 0.25));
  const umb = std({ color: '#e8ecee', transparent: true, opacity: 0.6, roughness: 0.3 });
  for (let i = 0; i < 3; i++) { const u = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.9, 8, 1, true), umb); u.rotation.z = Math.PI; u.position.set(GX - 0.15 + i * 0.12, 0.85, 0.12); g.add(u); g.add(tube(V(GX - 0.15 + i * 0.12, 1.3, 0.12), V(GX - 0.15 + i * 0.12, 1.45, 0.12), 0.012, std({ color: '#c8a050' }))); }
  const pipe = std({ color: '#c8c6c0', roughness: 0.5 });
  g.add(tube(V(W / 2 + 0.2, 1.7, 0.0), V(W / 2 + 2.2, 1.7, 0.0), 0.05, pipe), tube(V(W / 2 + 2.2, 1.7, 0.0), V(W / 2 + 2.2, 0, 0.0), 0.05, pipe));
  const lampB = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.12, 0.2, 2, 0.03), std({ color: '#141414' })); lampB.position.set(W / 2 + 1.8, 3.2, 0.0); g.add(lampB);
  g.add(box(0.04, 0.04, 0.12, std({ color: '#141414' }), W / 2 + 1.8, 3.2, -0.12));
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.05, 14), glow(2.0, 1.8, 1.4)); lens.position.set(W / 2 + 1.8, 3.2, 0.101); g.add(lens);
  const ll = new THREE.PointLight('#ffd8a0', 6, 7, 1.4); ll.position.set(W / 2 + 0.6, 3.0, 1.0); g.add(ll);
  const plq = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#2a1e16'; c.fillRect(0, 0, w, h); c.strokeStyle = '#7a5a30'; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#e8c870'; fitText(c, 'GROTTO', w / 2, 90, w - 50, 54, '"Cinzel"', { weight: '700' }); fitText(c, 'BASEMENT BAR', w / 2, 150, w - 50, 30, '"Cinzel"', { weight: '700' }); fitText(c, 'since 1987', w / 2, 200, w - 70, 24, '"Caveat"', { weight: '700' }); });
  g.add(box(0.6, 0.6, 0.04, [std({ color: '#2a1e16' }), std({ color: '#2a1e16' }), std({ color: '#2a1e16' }), std({ color: '#2a1e16' }), std({ map: plq, roughness: 0.4 }), std({ color: '#2a1e16' })], W / 2 + 1.5, 2.2, -0.08));
  // wooden sandwich board on the left (made-up)
  const sb = new THREE.Group();
  const bw = std({ color: '#c89a62', roughness: 0.8 });
  const bt = canvasTex(96, 384, (c, w, h) => { c.fillStyle = '#d8a870'; c.fillRect(0, 0, w, h); const rr = rng(4); for (let i = 0; i < 30; i++) { c.strokeStyle = 'rgba(120,70,30,0.25)'; c.beginPath(); const x = rr() * w; c.moveTo(x, 0); c.lineTo(x + (rr() - 0.5) * 8, h); c.stroke(); } c.fillStyle = '#2a1a0a'; ['ドリンク', 'BEER', 'SAKE', '¥500'].forEach((t, i) => fitText(c, t, w / 2, 70 + i * 80, w - 16, 42, i ? '"Bebas Neue"' : '"Zen Antique"')); });
  for (const s of [-1, 1]) { const pnl = box(0.36, 1.25, 0.03, [bw, bw, bw, bw, std({ map: bt }), std({ map: bt })], 0, 0.62, s * 0.12); pnl.rotation.x = s * 0.18; sb.add(pnl); }
  sb.position.set(-W / 2 - 0.7, 0, 0.6); sb.rotation.y = 0.35; g.add(sb);
  // left neighbour wall (orange timber shop front, just the edge)
  g.add(box(1.8, H + 0.4, 0.2, std({ color: '#c8783a', roughness: 0.7 }), -W / 2 - 0.9, (H + 0.4) / 2, -0.25));
  g.userData.colliders = [[-W / 2, W / 2, -T, 0.25], [-0.7, 0.7, 0.2, 0.62], [W / 2, W / 2 + 2.4, -0.3, 0.35], [-W / 2 - 1.8, -W / 2, -0.35, -0.1]];
  return g;
}
