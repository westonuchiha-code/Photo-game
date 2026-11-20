// Pawn & sport shop (queue item 41, photos/shop/). Props only: nothing here can be picked up or used.
// Made-up shop "RIDGELINE PAWN & SPORT"; every label, price card and box print is invented.
//   makeGunShop()  8 x 9 m brick shop, door on the -x side (local), checker floor from the photo's tile colours.
//   - a long lit glass display case down the middle: handguns lying on felt on tagged price cards,
//     a worn bolt-action rifle with a leather sling lying on top of the glass
//   - beside the till: a stack of weathered cardboard ammo boxes (cardboard from the photo) with printed
//     label panels, next to a stack of blue boxes
//   - back wall: a rack of long guns, a pegboard of holsters/slings, a "NO LOADED FIREARMS" sign
// Origin at the front-door threshold; the shop extends toward +x. userData: colliders, area.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
function tex(name, rx = 1, ry = 1) { const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t; }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.7, ...o }); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function extr(shape, depth, mat) { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 1 }); g.translate(0, 0, -depth / 2); const m = new THREE.Mesh(g, mat); m.castShadow = true; return m; }

// generic handgun silhouette (side profile, extruded), lying flat
function handgun(col, r) {
  const s = new THREE.Shape(); const L = 0.18 + r() * 0.03;
  s.moveTo(0, 0); s.lineTo(L, 0); s.lineTo(L, 0.03); s.lineTo(0.06, 0.03); s.lineTo(0.055, 0.035);
  s.lineTo(0.03, -0.09); s.lineTo(0.0, -0.09); s.lineTo(0.015, -0.02); s.lineTo(0, -0.01); s.closePath();
  const tg = new THREE.Path(); tg.moveTo(0.055, -0.005); tg.lineTo(0.085, -0.005); tg.quadraticCurveTo(0.08, -0.03, 0.06, -0.03); tg.closePath(); s.holes.push(tg);
  const m = extr(s, 0.024, std({ color: col, roughness: 0.45, metalness: 0.4 })); m.rotation.x = -Math.PI / 2; return m;
}
// generic bolt-action rifle with a sling, lying flat (wood stock from the photo's walnut tone)
function rifle() {
  const g = new THREE.Group();
  const wood = std({ color: '#5a3018', roughness: 0.55 }), steel = std({ color: '#2a2a2c', metalness: 0.6, roughness: 0.4 });
  const st = new THREE.Shape(); st.moveTo(0, 0); st.lineTo(0.75, 0.02); st.lineTo(0.75, 0.055); st.lineTo(0.3, 0.06); st.lineTo(0.22, 0.055); st.lineTo(0.12, 0.03); st.lineTo(0.0, 0.13); st.lineTo(-0.02, 0.13); st.lineTo(-0.02, 0.0); st.closePath();
  const stock = extr(st, 0.04, wood); g.add(stock);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.55, 12), steel); bar.rotation.z = Math.PI / 2; bar.position.set(1.02, 0.045, 0); g.add(bar);
  const rec = box(0.18, 0.03, 0.03, steel, 0.4, 0.075, 0, g); void rec;
  const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.06, 8), steel); bolt.position.set(0.34, 0.085, 0.03); bolt.rotation.x = Math.PI / 2; g.add(bolt);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 6), steel); knob.position.set(0.34, 0.085, 0.06); g.add(knob);
  const sling = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.05, 0.0, 0.025), new THREE.Vector3(0.3, -0.06, 0.09), new THREE.Vector3(0.6, -0.05, 0.1), new THREE.Vector3(0.78, 0.0, 0.03)]), 24, 0.006, 4), std({ color: '#2a1a10' })); sling.scale.z = 0.4; g.add(sling);
  g.rotation.x = -Math.PI / 2; return g;
}
function priceCard(price, line, r) {
  return canvasT(128, 96, (x) => { x.fillStyle = '#fbfbf4'; x.fillRect(0, 0, 128, 96); x.fillStyle = '#c81e28'; fitText(x, price, 64, 38, 116, 40, F.condensed); x.fillStyle = '#333'; fitText(x, line, 64, 74, 116, 16, F.small); x.fillStyle = '#888'; x.fillRect(100 + r() * 10, 6, 14, 3); });
}
// cardboard ammo box with a printed label panel (made-up), and a blue retail box
function ammoBox(kind, r) {
  const card = std({ map: tex('gs_card', 0.6, 0.6), roughness: 0.95 });
  const lab = canvasT(256, 128, (x) => {
    x.drawImage((() => { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const y = c.getContext('2d'); y.fillStyle = '#e8dcc4'; y.fillRect(0, 0, 256, 128); return c; })(), 0, 0);
    x.strokeStyle = '#2a2420'; x.lineWidth = 3; x.strokeRect(14, 12, 228, 104);
    x.fillStyle = '#2a2420'; x.font = `16px ${F.small}`; x.textAlign = 'center';
    ['20 ROUNDS', 'TARGET LOAD  ·  STEEL CASE', 'LOT 38-12', 'KEEP DRY'].forEach((t, i) => x.fillText(t, 128, 36 + i * 22));
    x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 4 : 9; x.lineTo(128 + Math.cos(a) * rr, 102 + Math.sin(a) * rr); } x.fill();
    for (let i = 0; i < 200; i++) { x.fillStyle = `rgba(90,70,40,${r() * 0.12})`; x.fillRect(r() * 256, r() * 128, 3, 3); }
  });
  const blue = canvasT(256, 128, (x) => { x.fillStyle = '#1d3f8f'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#fff'; fitText(x, 'PEAKLINE', 128, 44, 220, 46, F.heavy, { spacing: 4 }); x.fillStyle = '#f2c21a'; fitText(x, '50 RDS · PRACTICE', 128, 96, 220, 26, F.label, { spacing: 2 }); });
  if (kind === 'blue') { const s = std({ color: '#1d3f8f', roughness: 0.5 }); return new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.06, 0.11), [s, s, s, s, std({ map: blue, roughness: 0.5 }), s]); }
  return new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.075, 0.12), [card, card, card, card, std({ map: lab, roughness: 0.9 }), card]);
}

function glass2() { return new THREE.MeshStandardMaterial({ color: '#a8c0c8', transparent: true, opacity: 0.3, roughness: 0.05, side: THREE.DoubleSide }); }
export function makeGunShop() {
  const g = new THREE.Group(); g.name = 'gun_shop';
  const W = 8, D = 9, H = 3.3, cols = [], col = (a, b, c, d) => cols.push([a, b, c, d]);
  const r = rng(41);
  // ---- shell: brick outside, painted drywall inside, door gap on the front (x = 0) wall
  const brick = canvasT(256, 256, (x) => { x.fillStyle = '#d8cfc0'; x.fillRect(0, 0, 256, 256); for (let row = 0; row < 16; row++) for (let i = -1; i < 5; i++) { const v = 0.85 + Math.random() * 0.3; x.fillStyle = `rgb(${150 * v},${78 * v},${58 * v})`; x.fillRect(i * 64 + (row % 2) * 32 + 2, row * 16 + 2, 60, 12); } });
  brick.wrapS = brick.wrapT = THREE.RepeatWrapping; brick.repeat.set(5, 3);
  const outer = std({ map: brick, roughness: 0.9 }), inner = std({ color: '#ece6da', roughness: 0.9, side: THREE.DoubleSide });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ map: tex('gs_floor', W / 0.6, D / 0.6), roughness: 0.4 })); fl.rotation.x = -Math.PI / 2; fl.position.set(W / 2, 0.01, 0); fl.receiveShadow = true; g.add(fl);
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ color: '#f2f0ea', emissive: '#2a2a28' })); ce.rotation.x = Math.PI / 2; ce.position.set(W / 2, H - 0.02, 0); g.add(ce);
  box(W + 0.3, 0.6, D + 0.3, outer, W / 2, H + 0.3, 0, g);
  for (const s of [-1, 1]) { box(W + 0.3, H, 0.15, outer, W / 2, H / 2, s * (D / 2 + 0.075), g); col(0, W, s > 0 ? D / 2 : -D / 2 - 0.15, s > 0 ? D / 2 + 0.15 : -D / 2); }
  box(0.15, H, D + 0.3, outer, W + 0.075, H / 2, 0, g); col(W, W + 0.15, -D / 2, D / 2);
  // front wall with a glass door + display window
  const DW = 1.1;
  for (const [z0, z1] of [[-D / 2, -DW / 2], [DW / 2, 1.1], [3.7, D / 2]]) { box(0.15, H, z1 - z0, outer, -0.075, H / 2, (z0 + z1) / 2, g); col(-0.15, 0, z0, z1); }
  box(0.15, 0.8, 2.6, outer, -0.075, 0.4, 2.4, g); box(0.15, H - 2.2, 2.6, outer, -0.075, 2.2 + (H - 2.2) / 2, 2.4, g); col(-0.15, 0, 1.1, 3.7);
  box(0.15, H - 2.2, DW, outer, -0.075, 2.2 + (H - 2.2) / 2, 0, g);                       // over the door
  const door = new THREE.Mesh(new THREE.PlaneGeometry(DW - 0.1, 2.15), glass2()); door.rotation.y = -Math.PI / 2; door.position.set(-0.12, 1.08, -0.42); door.rotation.y = -Math.PI / 2 - 1.2; door.position.set(-0.05, 1.08, -DW / 2 + 0.02 + 0.45 * Math.sin(1.2)); g.add(door);
  const glass = new THREE.MeshStandardMaterial({ color: '#a8c0c8', transparent: true, opacity: 0.25, roughness: 0.05 });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.4), glass); win.rotation.y = -Math.PI / 2; win.position.set(-0.075, 1.5, 2.4); g.add(win);
  box(0.06, 0.06, 2.7, std({ color: '#222' }), -0.17, 0.8, 2.4, g); box(0.06, 0.06, 2.7, std({ color: '#222' }), -0.17, 2.2, 2.4, g);
  { const p = new THREE.Mesh(new THREE.PlaneGeometry(D, H), inner); p.rotation.y = -Math.PI / 2; p.position.set(W - 0.01, H / 2, 0); g.add(p); }
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(W, H), inner); p.position.set(W / 2, H / 2, s * (D / 2 - 0.01)); g.add(p); }
  // made-up sign over the door + window lettering
  const sign = canvasT(1024, 192, (x) => { x.fillStyle = '#1a2a1a'; x.fillRect(0, 0, 1024, 192); x.strokeStyle = '#d8b04a'; x.lineWidth = 8; x.strokeRect(12, 12, 1000, 168); x.fillStyle = '#f0e2b8'; fitText(x, 'RIDGELINE', 512, 78, 900, 84, F.slab, { spacing: 10 }); x.fillStyle = '#d8b04a'; fitText(x, 'PAWN  ·  SPORT  ·  BUY / SELL / TRADE', 512, 148, 900, 38, F.label, { spacing: 4 }); });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.86), std({ map: sign, emissive: '#ffffff', emissiveMap: sign, emissiveIntensity: 0.25 })); sg.rotation.y = -Math.PI / 2; sg.position.set(-0.17, H + 0.3, 0); g.add(sg);
  const wl = canvasT(512, 128, (x) => { x.clearRect(0, 0, 512, 128); x.fillStyle = '#f2f2ee'; fitText(x, 'WE BUY GOLD · TOOLS · GUITARS', 256, 64, 490, 40, F.condensed, { spacing: 3 }); });
  const wlm = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: wl, transparent: true })); wlm.rotation.y = -Math.PI / 2; wlm.position.set(-0.17, 1.9, 2.4); g.add(wlm);
  // ---- lights
  for (const z of [-2.5, 0, 2.5]) { box(1.2, 0.05, 0.25, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.5, 1.45) }), W / 2, H - 0.03, z, g); }
  for (const z of [-2, 2]) { const l = new THREE.PointLight('#fff4e4', 5, 9, 1.5); l.position.set(W / 2, H - 0.4, z); g.add(l); }
  // ---- the long lit glass display case down the middle
  const CX = 3.6, CL = 4.6, CW = 0.62, CH = 0.95;
  const caseG = new THREE.Group(); caseG.position.set(CX, 0, -0.2); g.add(caseG);
  box(CW, 0.5, CL, std({ color: '#2a2b2e', roughness: 0.5 }), 0, 0.25, 0, caseG);
  box(CW - 0.04, 0.02, CL - 0.04, std({ color: '#2a3a2a', roughness: 1 }), 0, 0.51, 0, caseG);                     // green felt deck
  const cg = box(CW, CH - 0.5, CL, new THREE.MeshStandardMaterial({ color: '#cfe4ea', transparent: true, opacity: 0.18, roughness: 0.03, depthWrite: false }), 0, 0.5 + (CH - 0.5) / 2, 0, caseG); cg.castShadow = false;
  const alu = std({ color: '#c8ccd0', metalness: 0.6, roughness: 0.3 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.025, CH - 0.5, 0.025, alu, sx * (CW / 2 - 0.012), 0.5 + (CH - 0.5) / 2, sz * (CL / 2 - 0.012), caseG);
  for (const sx of [-1, 1]) box(0.025, 0.025, CL, alu, sx * (CW / 2 - 0.012), CH, 0, caseG);
  box(0.03, 0.01, CL - 0.1, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.5) }), 0, CH - 0.02, 0, caseG);       // light strip inside
  const cl = new THREE.PointLight('#f4f8ff', 1.2, 2.5, 2); cl.position.set(0, 0.85, 0); caseG.add(cl);
  const gcols = ['#1c1c1e', '#2a2a2c', '#3a3a38', '#b8a888', '#1c1c1e', '#5a5a58'];
  for (let i = 0; i < 12; i++) {
    const z = -CL / 2 + 0.25 + i * (CL - 0.5) / 11, side = i % 2 ? 1 : -1;
    const hg = handgun(gcols[i % gcols.length], r); hg.position.set(-0.12 + side * 0.06, 0.53, z); hg.rotation.z = 0; hg.rotation.y = (side > 0 ? 0.25 : -0.2); caseG.add(hg);
    const pc = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.05), std({ map: priceCard(['$389', '$425', '$299', '$549', '$475', '$350'][i % 6], ['USED · GOOD', 'CONSIGNMENT', 'LIKE NEW', 'NEW IN BOX'][i % 4], r) }));
    pc.rotation.x = -Math.PI / 2; pc.position.set(0.17, 0.523, z + 0.02); pc.rotation.z = (r() - 0.5) * 0.3; caseG.add(pc);
  }
  const rf = rifle(); rf.position.set(0.05, CH + 0.025, -0.9); rf.rotation.z = Math.PI / 2 + 0.06; caseG.add(rf);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.05), std({ map: priceCard('$695', 'BOLT ACTION · AS IS', r) })); tag.rotation.x = -Math.PI / 2; tag.position.set(0.18, CH + 0.015, -0.2); caseG.add(tag);
  col(CX - CW / 2 - 0.05, CX + CW / 2 + 0.05, -0.2 - CL / 2, -0.2 + CL / 2);
  // ---- till counter at the back with the ammo box stacks beside it
  box(0.7, 1.0, 2.2, std({ color: '#3a2c22', roughness: 0.6 }), W - 1.5, 0.5, 2.8, g); col(W - 1.85, W - 1.15, 1.7, 3.9);
  box(0.74, 0.04, 2.24, std({ color: '#c8c2b4', roughness: 0.4 }), W - 1.5, 1.02, 2.8, g);
  const till = box(0.36, 0.22, 0.3, std({ color: '#222', roughness: 0.4 }), W - 1.5, 1.15, 3.4, g); void till;
  // cardboard stack (straight-ish, weathered) and a stack of blue boxes, on the counter
  for (let i = 0; i < 6; i++) { const b = ammoBox('card', r); b.position.set(W - 1.55 + (r() - 0.5) * 0.02, 1.08 + i * 0.077, 2.1); b.rotation.y = -Math.PI / 2 + (r() - 0.5) * 0.08; g.add(b); }
  for (let i = 0; i < 5; i++) { const b = ammoBox('blue', r); b.position.set(W - 1.55 + (r() - 0.5) * 0.02, 1.07 + i * 0.062, 2.42); b.rotation.y = -Math.PI / 2 + (r() - 0.5) * 0.1; g.add(b); }
  // ---- back wall: long-gun rack, pegboard with slings and holsters, notice
  const rack = new THREE.Group(); rack.position.set(W - 0.15, 0, -1.5); g.add(rack);
  box(0.12, 1.8, 3.2, std({ color: '#4a3424', roughness: 0.7 }), 0, 1.1, 0, rack);
  box(0.25, 0.08, 3.2, std({ color: '#4a3424' }), -0.1, 0.25, 0, rack);
  for (let i = 0; i < 9; i++) { const lg = rifle(); lg.rotation.set(0, Math.PI / 2, Math.PI / 2 - 0.08); lg.scale.setScalar(0.95); lg.position.set(-0.12, 0.3, -1.4 + i * 0.35); rack.add(lg); }
  const peg = canvasT(256, 256, (x) => { x.fillStyle = '#c8a878'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#6a5034'; for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { x.beginPath(); x.arc(8 + i * 16, 8 + j * 16, 2.5, 0, 7); x.fill(); } });
  const pb = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.4), std({ map: peg })); pb.rotation.y = Math.PI; pb.position.set(W / 2, 1.7, D / 2 - 0.03); g.add(pb);
  for (let i = 0; i < 8; i++) { const h2 = box(0.12, 0.2 + r() * 0.1, 0.04, std({ color: ['#2a1a10', '#5a3a20', '#1c1c1c'][i % 3] }), W / 2 - 1.0 + i * 0.28, 1.6 + (i % 2) * 0.35, D / 2 - 0.08, g); h2.castShadow = false; }
  const note = canvasT(256, 320, (x) => { x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 320); x.fillStyle = '#c81e28'; x.fillRect(0, 0, 256, 70); x.fillStyle = '#fff'; fitText(x, 'NOTICE', 128, 38, 220, 46, F.heavy, { spacing: 6 }); x.fillStyle = '#222'; x.font = `20px ${F.small}`; x.textAlign = 'center'; ['NO LOADED FIREARMS', 'IN THE STORE.', '', 'ASK STAFF TO', 'OPEN ANY CASE.', '', 'ALL SALES SUBJECT', 'TO CHECKS & ID.'].forEach((t, i) => x.fillText(t, 128, 110 + i * 26)); });
  const nm = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.5), std({ map: note })); nm.rotation.y = -Math.PI / 2; nm.position.set(W - 0.03, 1.7, 1.2); g.add(nm);
  col(W - 0.45, W, -3.2, 0.2);
  // a guitar on a stand and a tool chest by the window (pawn stock)
  const tc = box(0.6, 0.9, 0.45, std({ color: '#b81a1a', metalness: 0.4, roughness: 0.4 }), 0.6, 0.45, 3.6, g); void tc;
  for (let i = 0; i < 5; i++) box(0.58, 0.01, 0.02, std({ color: '#c8ccd0', metalness: 0.7 }), 0.6, 0.15 + i * 0.16, 3.84, g);
  col(0.25, 0.95, 3.35, 3.85);
  const gtr = new THREE.Group(); gtr.position.set(1.4, 0, 3.9); gtr.rotation.y = -0.5; g.add(gtr);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 10), std({ color: '#c8782a', roughness: 0.35 })); body.scale.set(1, 1.25, 0.25); body.position.y = 0.45; gtr.add(body);
  box(0.05, 0.6, 0.03, std({ color: '#3a2414' }), 0, 0.95, 0, gtr);
  g.userData.colliders = cols;
  g.userData.area = { minX: 0, maxX: W - 0.3, minZ: -D / 2 + 0.3, maxZ: D / 2 - 0.3 };
  return g;
}
