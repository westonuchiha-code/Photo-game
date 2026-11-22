// Street services (92), from the texture library via kit.js. Front faces +z (the side people use), ground y = 0.
//   makeBusStop()  makePhoneBooth()  makeMailbox()  makeTrafficLight({ go })  makeATM()  makeStreetBench()
//   makeStreetBin()  makeNewsStand()
//   placeStreetServices({ grid, sidewalkY })  -> { group, colliders }  everything laid out along the district streets,
//     instanced (a few dozen draw calls for several hundred pieces)
import * as THREE from 'three';
import { mat, plain, box, rbox, cyl, flat, bar, canvasT, rng, V, projUV, instanceGroup } from './kit.js';
import { F, fitText } from '../fonts.js';

const steel = (c = '#6a6e74') => mat('gf_galv', { to: c, rough: 0.45, metal: 0.55 });
const glassM = () => { const k = glassM.m || (glassM.m = new THREE.MeshPhysicalMaterial({ color: '#cfe0e4', roughness: 0.08, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false })); k.userData.flat = true; return k; };
const lit = (t) => { const m = new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.6, roughness: 0.5 }); m.userData.flat = true; return m; };

export function makeBusStop() {   // 3.2 m shelter, open toward +z (the kerb)
  const g = new THREE.Group(); g.name = 'bus_stop'; const st = steel('#3a4a44'), W = 3.2, D = 1.25, H = 2.35;
  for (const s of [-1, 1]) for (const z of [-D / 2, D / 2 - 0.1]) bar(V(s * W / 2, 0, z), V(s * W / 2, H, z), 0.06, st, g);
  box(W + 0.3, 0.07, D + 0.35, st, 0, H + 0.035, 0.08, g); box(W + 0.3, 0.012, D + 0.35, plain('#d8e0dc', { roughness: 0.3 }), 0, H + 0.076, 0.08, g);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.1, H - 0.5), glassM()); back.position.set(0, 0.35 + (H - 0.5) / 2, -D / 2); g.add(back); bar(V(-W / 2, 0.33, -D / 2), V(W / 2, 0.33, -D / 2), 0.04, st, g);
  // lit ad panel on one end (made-up ad), a route sign, a slat bench
  const ad = canvasT(256, 384, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f2b01e'); gr.addColorStop(1, '#e8501e'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'FIZZ', w / 2, 110, w - 40, 110, F.heavy); fitText(x, 'TOWN', w / 2, 200, w - 40, 110, F.heavy); x.fillStyle = '#3a1a0a'; fitText(x, 'the soda with a snap', w / 2, 290, w - 50, 26, F.label, { weight: 700 }); });
  { const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.7, D - 0.25), [lit(ad), lit(ad), st, st, st, st]); p.position.set(W / 2, 1.2, -0.05); g.add(p); }
  const rt = canvasT(256, 256, (x, w, h) => { x.fillStyle = '#1d4a8a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'BUS', w / 2, 70, w - 60, 80, F.heavy); x.fillStyle = '#f2c21a'; x.fillRect(30, 120, w - 60, 6); x.fillStyle = '#fff'; fitText(x, '6 · LOOP', w / 2, 170, w - 50, 44, F.label, { weight: 700 }); fitText(x, '14 · STATION', w / 2, 220, w - 50, 36, F.label, { weight: 700 }); });
  bar(V(-W / 2 - 0.5, 0, D / 2 + 0.1), V(-W / 2 - 0.5, 2.7, D / 2 + 0.1), 0.06, st, g); { const s = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.03), [st, st, st, st, lit(rt), lit(rt)]); s.position.set(-W / 2 - 0.5, 2.5, D / 2 + 0.1); g.add(s); }
  const sl = mat('slat_wood', { to: '#9a6a3a', rough: 0.7 }); for (let k = 0; k < 4; k++) box(W - 0.9, 0.03, 0.08, sl, -0.2, 0.46, -D / 2 + 0.2 + k * 0.1, g, 0.8); for (const x of [-1.2, 0.8]) box(0.05, 0.45, 0.4, st, x, 0.225, -D / 2 + 0.35, g);
  g.userData.collider = [-W / 2, W / 2, -D / 2 - 0.05, -D / 2 + 0.6]; return g;
}
export function makePhoneBooth() {
  const g = new THREE.Group(); g.name = 'phone_booth'; const fr = steel('#8a2a22'), S = 0.95, H = 2.3;
  box(S + 0.06, 0.08, S + 0.06, plain('#4a4c50'), 0, 0.04, 0, g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) bar(V(sx * S / 2, 0, sz * S / 2), V(sx * S / 2, H, sz * S / 2), 0.05, fr, g);
  box(S + 0.1, 0.28, S + 0.1, fr, 0, H + 0.14, 0, g); const pt = canvasT(256, 64, (x, w, h) => { x.fillStyle = '#f4f2ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#8a2a22'; fitText(x, 'TELEPHONE', w / 2, 36, w - 24, 40, F.heavy, { spacing: 3 }); });
  for (let k = 0; k < 4; k++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(S - 0.1, 0.2), lit(pt)); p.position.set(Math.sin(k * Math.PI / 2) * (S / 2 + 0.052), H + 0.14, Math.cos(k * Math.PI / 2) * (S / 2 + 0.052)); p.rotation.y = k * Math.PI / 2; g.add(p); }
  for (const [x, z, ry] of [[-S / 2, 0, Math.PI / 2], [S / 2, 0, Math.PI / 2], [0, -S / 2, 0]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(S - 0.06, H - 0.3), glassM()); p.position.set(x, 0.2 + (H - 0.3) / 2, z); p.rotation.y = ry; g.add(p); for (const y of [0.75, 1.45]) { const b = bar(V(-S / 2, y, 0), V(S / 2, y, 0), 0.02, fr, g); b.position.set(x, y, z); b.rotation.set(0, ry, Math.PI / 2); } }
  // the phone: steel body, handset on a hook, keypad, coin slot, a shelf with a directory
  const st = steel('#5a5e64'); box(0.3, 0.42, 0.14, st, 0, 1.4, -S / 2 + 0.1, g); box(0.12, 0.15, 0.01, plain('#d8d8d2'), 0.04, 1.42, -S / 2 + 0.172, g); rbox(0.05, 0.24, 0.05, 0.02, plain('#1a1a1c'), -0.1, 1.42, -S / 2 + 0.2, g); box(0.5, 0.03, 0.26, st, 0, 1.0, -S / 2 + 0.16, g); box(0.2, 0.05, 0.16, plain('#e8d86a', { roughness: 0.9 }), 0.08, 1.04, -S / 2 + 0.16, g);
  g.userData.collider = [-S / 2 - 0.05, S / 2 + 0.05, -S / 2 - 0.05, S / 2 + 0.05]; return g;
}
export function makeMailbox() {
  const g = new THREE.Group(); g.name = 'mailbox'; const bl = plain('#1d3f8a', { roughness: 0.4, metalness: 0.2 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.05, 0.3, 0.05, bl, sx * 0.2, 0.15, sz * 0.18, g); rbox(0.52, 0.75, 0.48, 0.03, bl, 0, 0.67, 0, g);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.52, 20, 1, false, 0, Math.PI), bl); top.rotation.z = Math.PI / 2; top.rotation.y = Math.PI / 2; top.position.set(0, 1.04, 0); g.add(top);
  box(0.4, 0.05, 0.02, plain('#0f2a5a'), 0, 1.0, 0.245, g); const t = canvasT(256, 128, (x, w, h) => { x.fillStyle = '#1d3f8a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'ELM COUNTY MAIL', w / 2, 44, w - 30, 30, F.label, { weight: 700 }); fitText(x, 'collection 9 am · 4 pm', w / 2, 92, w - 40, 22, F.label); });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 })); p.material.userData.flat = true; p.position.set(0, 0.7, 0.242); g.add(p);
  g.userData.collider = [-0.28, 0.28, -0.26, 0.26]; return g;
}
export function makeTrafficLight({ go = true } = {}) {   // pole at the origin, arm reaching +x over the road, lamps face +z
  const g = new THREE.Group(); g.name = 'traffic_light'; const st = steel('#3a3e42');
  cyl(0.09, 0.12, 6.2, st, 0, 3.1, 0, g, 12); cyl(0.16, 0.18, 0.3, st, 0, 0.15, 0, g, 12); bar(V(0, 5.9, 0), V(4.2, 6.1, 0), 0.1, st, g);
  const head = (x, y) => { rbox(0.34, 1.0, 0.26, 0.04, plain('#1e2022', { roughness: 0.6 }), x, y, 0.06, g); [['#ff2a1e', !go], ['#ffb01e', false], ['#2aff5a', go]].forEach(([c, on], i) => { const l = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), on ? new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(2.2), toneMapped: false }) : plain(new THREE.Color(c).multiplyScalar(0.12).getStyle(), { roughness: 0.4 })); l.position.set(x, y + 0.3 - i * 0.3, 0.195); g.add(l); const v = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 12, 1, true, Math.PI / 2, Math.PI), plain('#1e2022', { side: THREE.DoubleSide })); v.rotation.x = Math.PI / 2; v.position.set(x, y + 0.3 - i * 0.3, 0.25); g.add(v); }); };
  head(3.6, 5.5); head(0.3, 3.2);
  // walk signal + push button
  rbox(0.3, 0.3, 0.16, 0.03, plain('#1e2022'), -0.02, 2.5, 0.16, g); { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ color: go ? new THREE.Color(2.2, 0.5, 0.2) : new THREE.Color(0.6, 2.2, 0.8), toneMapped: false })); l.position.set(-0.02, 2.5, 0.245); g.add(l); } box(0.1, 0.16, 0.06, plain('#d8c21a'), 0, 1.15, 0.11, g);
  return g;
}
export function makeATM() {   // wall unit: back flat against a wall at z = 0, faces +z
  const g = new THREE.Group(); g.name = 'atm'; rbox(0.8, 1.5, 0.3, 0.02, steel('#7a7e84'), 0, 1.05, 0.15, g); const sc = canvasT(256, 192, (x, w, h) => { x.fillStyle = '#0a2a5a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'ELM SAVINGS', w / 2, 50, w - 40, 34, F.heavy); x.fillStyle = '#8ad0ff'; fitText(x, 'Insert card to begin', w / 2, 110, w - 50, 24, F.label); x.fillStyle = '#f2c21a'; x.fillRect(40, 140, w - 80, 6); });
  { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.32), new THREE.MeshBasicMaterial({ map: sc, toneMapped: false })); s.position.set(-0.08, 1.4, 0.302); g.add(s); } const kp = box(0.2, 0.02, 0.14, plain('#d8d8d2'), -0.08, 1.02, 0.36, g); kp.rotation.x = 0.4; box(0.44, 0.03, 0.2, steel('#5a5e64'), -0.08, 0.98, 0.36, g); box(0.16, 0.012, 0.01, plain('#111'), 0.24, 1.4, 0.302, g); box(0.22, 0.02, 0.01, plain('#111'), 0.24, 1.15, 0.302, g);
  const hd = canvasT(256, 48, (x, w, h) => { x.fillStyle = '#0a2a5a'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'CASH · 24 HOURS', w / 2, 27, w - 20, 28, F.heavy); }); { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.15), lit(hd)); s.position.set(0, 1.9, 0.302); g.add(s); box(0.8, 0.18, 0.3, steel('#0a2a5a'), 0, 1.9, 0.149, g); }
  return g;
}
export function makeStreetBench() {
  const g = new THREE.Group(); g.name = 'street_bench'; const sl = mat('slat_wood', { to: '#8a5a32', rough: 0.7 }), ir = steel('#2a2e30'), W = 1.6;
  for (let k = 0; k < 4; k++) box(W, 0.03, 0.09, sl, 0, 0.45, -0.14 + k * 0.105, g, 0.8); for (let k = 0; k < 3; k++) { const b = box(W, 0.09, 0.03, sl, 0, 0, 0, g, 0.8); b.position.set(0, 0.6 + k * 0.12, -0.22 - k * 0.03); b.rotation.x = -0.25; }
  for (const s of [-1, 1]) { box(0.05, 0.45, 0.45, ir, s * (W / 2 - 0.12), 0.225, 0, g); bar(V(s * (W / 2 - 0.12), 0.4, -0.2), V(s * (W / 2 - 0.12), 0.92, -0.33), 0.045, ir, g); bar(V(s * (W / 2 - 0.12), 0.65, -0.24), V(s * (W / 2 - 0.12), 0.65, 0.22), 0.04, ir, g); }
  g.userData.collider = [-W / 2, W / 2, -0.3, 0.25]; return g;
}
export function makeStreetBin() {
  const g = new THREE.Group(); g.name = 'street_bin'; const m = steel('#2f4a3a'); m.side = THREE.DoubleSide; const b = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.8, 16, 1, true), m); b.position.y = 0.45; g.add(b); cyl(0.22, 0.22, 0.05, m, 0, 0.05, 0, g, 16);
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; box(0.03, 0.8, 0.012, steel('#3a5a48'), Math.cos(a) * 0.265, 0.45, Math.sin(a) * 0.265, g).rotation.y = -a + Math.PI / 2; } const top = new THREE.Mesh(new THREE.TorusGeometry(0.265, 0.025, 6, 20), m); top.rotation.x = Math.PI / 2; top.position.y = 0.86; g.add(top); cyl(0.2, 0.2, 0.02, plain('#18181a'), 0, 0.7, 0, g, 14);
  return g;
}
export function makeNewsStand() {
  const g = new THREE.Group(); g.name = 'news_stand'; const c = plain('#c8281e', { roughness: 0.45 }); rbox(0.5, 0.75, 0.42, 0.02, c, 0, 0.75, 0, g); for (const s of [-1, 1]) box(0.04, 0.4, 0.04, plain('#2a2a2c'), s * 0.18, 0.2, 0, g); box(0.4, 0.03, 0.34, plain('#2a2a2c'), 0, 0.015, 0, g);
  const pt = canvasT(256, 256, (x, w, h) => { x.fillStyle = '#f4f1e6'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, 'THE ELM LEDGER', w / 2, 34, w - 20, 34, F.heavy); x.fillRect(12, 56, w - 24, 3); fitText(x, 'LIGHTS OVER', w / 2, 96, w - 30, 40, F.heavy); fitText(x, 'THE LOOP', w / 2, 140, w - 30, 40, F.heavy); x.fillStyle = '#888'; x.fillRect(16, 170, 100, 70); x.fillStyle = '#555'; for (let i = 0; i < 6; i++) x.fillRect(128, 172 + i * 12, 110, 4); });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.7 })); p.material.userData.flat = true; p.position.set(0, 0.84, 0.212); g.add(p); { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.44), glassM()); w.position.set(0, 0.84, 0.216); g.add(w); } box(0.1, 0.14, 0.02, plain('#d8d8d2'), 0.16, 1.02, 0.212, g);
  const hd = canvasT(256, 64, (x, w, h) => { x.fillStyle = '#c8281e'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; fitText(x, 'LEDGER 50¢', w / 2, 36, w - 20, 38, F.heavy); }); { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.11), new THREE.MeshStandardMaterial({ map: hd, roughness: 0.5 })); s.material.userData.flat = true; s.position.set(0, 0.47, 0.212); g.add(s); }
  g.userData.collider = [-0.27, 0.27, -0.23, 0.23]; return g;
}

// lay everything out along the district's streets. grid = district GRID ({ xs, zs, road, walk }).
export function placeStreetServices({ grid, sidewalkY = 0.14, atms = [] }) {
  const { xs, zs, road: RH, walk: WH } = grid, group = new THREE.Group(); group.name = 'street_services'; const colliders = [], Y = sidewalkY, PI = Math.PI;
  const T = { tgo: [], tstop: [], bus: [], booth: [], mail: [], bench: [], bin: [], news: [] }, r = rng(92);
  const circle = (x, z, rad) => colliders.push({ type: 'circle', x, z, r: rad }), boxc = (x, z, hx, hz) => colliders.push({ type: 'box', minX: x - hx, maxX: x + hx, minZ: z - hz, maxZ: z + hz });
  // traffic lights: one on the far-right corner of every approach (north-south traffic has the green)
  for (const x of xs) for (const z of zs) { const k = RH + 0.55;
    T.tgo.push({ x: x - k, y: Y, z: z + k + 0.4, ry: 0 }, { x: x + k, y: Y, z: z - k - 0.4, ry: PI });            // facing the N-S approaches (arm over the cross street)
    T.tstop.push({ x: x + k + 0.4, y: Y, z: z + k, ry: PI / 2 }, { x: x - k - 0.4, y: Y, z: z - k, ry: -PI / 2 });
    for (const t of [T.tgo.at(-1), T.tgo.at(-2), T.tstop.at(-1), T.tstop.at(-2)]) circle(t.x, t.z, 0.2); }
  // mid-block furniture on the east-west streets (no trees there): bus stops, benches, bins, booths, mailboxes, news
  for (let j = 0; j < zs.length; j++) for (let i = 0; i < xs.length - 1; i++) { const z = zs[j], xm = (xs[i] + xs[i + 1]) / 2, south = (i + j) % 2 === 0, sz = south ? z + RH + 1.1 : z - RH - 1.1, face = south ? PI : 0, q = (i * 3 + j * 5) % 4;
    if (z !== 0 && q < 2) { T.bus.push({ x: xm, y: Y, z: south ? z + RH + 1.3 : z - RH - 1.3, ry: face }); boxc(xm, south ? z + RH + 1.75 : z - RH - 1.75, 1.6, 0.3); T.news.push({ x: xm + 2.6, y: Y, z: sz + (south ? 0.5 : -0.5), ry: face }); circle(xm + 2.6, sz + (south ? 0.5 : -0.5), 0.3); T.bin.push({ x: xm - 2.4, y: Y, z: sz, ry: 0 }); circle(xm - 2.4, sz, 0.28); }
    else { T.bench.push({ x: xm, y: Y, z: sz + (south ? 0.5 : -0.5), ry: face }); boxc(xm, sz + (south ? 0.5 : -0.5), 0.8, 0.28); T.bin.push({ x: xm + 1.5, y: Y, z: sz + (south ? 0.4 : -0.4), ry: 0 }); circle(xm + 1.5, sz + (south ? 0.4 : -0.4), 0.28); }
    for (const dx of [-22, 22]) { const x = xm + dx, oz = south ? z - RH - 1.2 : z + RH + 1.2, of = south ? 0 : PI;   // across the street
      if ((i + j + (dx > 0 ? 1 : 0)) % 3 === 0) { T.booth.push({ x, y: Y, z: oz + (south ? -0.25 : 0.25), ry: of }); boxc(x, oz + (south ? -0.25 : 0.25), 0.55, 0.55); }
      else if ((i + j + (dx > 0 ? 1 : 0)) % 3 === 1) { T.mail.push({ x, y: Y, z: oz, ry: of }); boxc(x, oz, 0.3, 0.28); }
      else { T.bench.push({ x, y: Y, z: oz + (south ? -0.4 : 0.4), ry: of }); boxc(x, oz + (south ? -0.4 : 0.4), 0.8, 0.28); } } }
  // bins + benches along the north-south streets, between the lamps
  for (const x of xs.slice(1)) for (let j = 0; j < zs.length - 1; j++) { const zm = (zs[j] + zs[j + 1]) / 2 + 6; T.bin.push({ x: x + RH + 1.4, y: Y, z: zm, ry: 0 }); circle(x + RH + 1.4, zm, 0.28); T.bench.push({ x: x - RH - 1.5, y: Y, z: zm + 9, ry: PI / 2 }); boxc(x - RH - 1.5, zm + 9, 0.28, 0.8); }
  group.add(instanceGroup(makeTrafficLight({ go: true }), T.tgo), instanceGroup(makeTrafficLight({ go: false }), T.tstop), instanceGroup(makeBusStop(), T.bus), instanceGroup(makePhoneBooth(), T.booth), instanceGroup(makeMailbox(), T.mail), instanceGroup(makeStreetBench(), T.bench), instanceGroup(makeStreetBin(), T.bin), instanceGroup(makeNewsStand(), T.news));
  if (atms.length) group.add(instanceGroup(makeATM(), atms));
  group.userData.counts = Object.fromEntries(Object.entries(T).map(([k, v]) => [k, v.length]));
  return { group, colliders };
}
