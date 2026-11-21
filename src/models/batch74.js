// Batch 74 (photos/batch74/): small street details, all redrawn with made-up names (no real apps, brands, wards,
// characters or working QR codes; the "codes" are decorative pixel mosaics).
//   makeQueueCard, makeEnergyCan74, makeAppAdPost, makeStickerPole, makeStickerPillar
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';

function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function phys(o) { return new THREE.MeshPhysicalMaterial({ roughness: 0.3, ...o }); }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rbox(w, h, d, r, mat, x, y, z, p) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, x, y, z, p, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function plane(w, h, mat, x, y, z, ry, p) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
const decal = (t, o = {}) => std({ map: t, transparent: true, alphaTest: 0.05, polygonOffset: true, polygonOffsetFactor: -2, roughness: 0.45, ...o });
// a decorative pixel mosaic standing in for a scan code (deliberately not a real code: no finder squares)
function mosaic(x, x0, y0, s, seed, colors = ['#111']) { const r = rng(seed); const n = 14, c = s / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (r() < 0.5) { x.fillStyle = colors[Math.floor(r() * colors.length)]; x.fillRect(x0 + i * c, y0 + j * c, c, c); } }

export function makeQueueCard(n = 2) {
  const g = new THREE.Group(); g.name = 'queue_card';
  const t = canvasT(320, 448, (x, w, h) => {
    x.fillStyle = '#f4f6fa'; x.fillRect(0, 0, w, h); const gr = x.createLinearGradient(0, 0, 0, 260); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#c8d8f4'); x.fillStyle = gr; x.fillRect(10, 10, w - 20, 250);
    x.strokeStyle = '#1e3a9a'; x.lineWidth = 14; x.beginPath(); x.arc(w / 2, 140, 100, 0, 7); x.stroke(); x.strokeStyle = '#8aa8e8'; x.lineWidth = 5; x.beginPath(); x.arc(w / 2, 140, 82, 0, 7); x.stroke();
    x.fillStyle = '#1e3a9a'; x.strokeStyle = '#ffffff'; x.lineWidth = 10; x.font = `bold italic 170px ${F.heavy}`; x.textAlign = 'center'; x.strokeText(String(n), w / 2 - 6, 205); x.fillText(String(n), w / 2 - 6, 205);
    x.font = `40px ${F.antique}`; x.fillText('番', w / 2 + 88, 230); x.fillStyle = '#8aa8e8'; for (const [sx, sy] of [[44, 60], [270, 250], [60, 230]]) { x.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? 4 : 12; x.lineTo(sx + Math.cos(k * Math.PI / 4) * rr, sy + Math.sin(k * Math.PI / 4) * rr); } x.fill(); }
    x.fillStyle = '#1e3a9a'; x.fillRect(10, 280, w - 20, 158); x.fillStyle = '#fff'; fitText(x, 'もうしばらくお待ち下さい。', w / 2, 306, w - 40, 26, F.rounded, { weight: 700 }); x.fillStyle = '#e8eefa'; ['順番がきましたら番号を', 'お呼びいたします。この札を', 'フロントへお渡し下さい。'].forEach((l, i) => fitText(x, l, w / 2, 350 + i * 32, w - 40, 22, F.antique)); });
  rbox(0.064, 0.09, 0.0025, 0.004, phys({ map: t, roughness: 0.15, clearcoat: 1 }), 0, 0.00125, 0, g).rotation.x = -Math.PI / 2;
  g.children[0].position.y = 0.00125; return g;
}
// 250 ml slim can, black with a gold cartoon surfer in an old crested helmet (original)
export function makeEnergyCan74() {
  const t = canvasT(512, 512, (x, w, h) => { x.fillStyle = '#121214'; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,255,255,0.07)'; x.lineWidth = 3; for (let i = -10; i < 30; i++) { x.beginPath(); for (let k = 0; k <= w; k += 16) x.lineTo(k, i * 26 + Math.sin(k / 40 + i) * 8); x.stroke(); }
    const gold = '#f2d23a';
    // the surfer: board, body, helmet with a tall crescent crest, a lightning splash
    x.fillStyle = gold; x.save(); x.translate(w * 0.42, h * 0.42); x.rotate(-0.25); x.beginPath(); x.ellipse(0, 70, 120, 18, 0, 0, 7); x.fill(); x.restore();
    x.fillStyle = '#fff8e0'; x.beginPath(); x.ellipse(w * 0.42, h * 0.3, 40, 52, 0, 0, 7); x.fill(); x.fillStyle = gold; x.beginPath(); x.ellipse(w * 0.42, h * 0.17, 46, 26, 0, Math.PI, 0); x.fill();
    x.strokeStyle = gold; x.lineWidth = 12; x.beginPath(); x.arc(w * 0.42, h * 0.08, 46, Math.PI * 1.1, Math.PI * 1.9); x.stroke();
    x.fillStyle = '#111'; x.fillRect(w * 0.4, h * 0.29, 8, 4); x.fillRect(w * 0.45, h * 0.29, 8, 4); x.beginPath(); x.arc(w * 0.43, h * 0.33, 8, 0, Math.PI); x.fill();
    x.strokeStyle = '#fff8e0'; x.lineWidth = 16; x.beginPath(); x.moveTo(w * 0.36, h * 0.36); x.lineTo(w * 0.28, h * 0.45); x.moveTo(w * 0.48, h * 0.36); x.lineTo(w * 0.58, h * 0.28); x.stroke();
    x.fillStyle = gold; x.beginPath(); x.moveTo(w * 0.15, h * 0.5); x.lineTo(w * 0.3, h * 0.48); x.lineTo(w * 0.22, h * 0.56); x.lineTo(w * 0.36, h * 0.55); x.lineTo(w * 0.12, h * 0.64); x.lineTo(w * 0.2, h * 0.56); x.closePath(); x.fill();
    x.fillStyle = gold; x.strokeStyle = '#111'; x.lineWidth = 6; ['KAIGAN', 'GOLD', 'ENERGY'].forEach((l, i) => fitText(x, l, w * 0.42, h * 0.7 + i * 54, 240, 58, F.heavy, { stroke: '#111' }));
    x.fillStyle = '#fff'; fitText(x, 'エナジードリンク · 炭酸飲料', w * 0.42, h * 0.95, 240, 18, F.antique);
    x.fillStyle = '#e8e4d8'; fitText(x, 'NUTRITION · 250 ml · caffeine 80 mg', w * 0.85, h * 0.5, 120, 14, F.small); });
  const g = new THREE.Group(); g.name = 'energy_can_kaigan';
  const lp = [new THREE.Vector2(0.0, 0), new THREE.Vector2(0.024, 0.0), new THREE.Vector2(0.0265, 0.006), new THREE.Vector2(0.0265, 0.124), new THREE.Vector2(0.024, 0.132), new THREE.Vector2(0.022, 0.134), new THREE.Vector2(0.0, 0.134)];
  const body = new THREE.Mesh(new THREE.LatheGeometry(lp, 32), std({ color: '#c8ccd0', metalness: 0.9, roughness: 0.25 })); g.add(body);
  const wrap = new THREE.Mesh(new THREE.CylinderGeometry(0.0267, 0.0267, 0.116, 40, 1, true), std({ map: t, metalness: 0.6, roughness: 0.3 })); wrap.position.y = 0.065; g.add(wrap);
  const tab = new THREE.Mesh(new THREE.TorusGeometry(0.006, 0.0015, 6, 12), std({ color: '#c8ccd0', metalness: 0.9 })); tab.rotation.x = Math.PI / 2; tab.position.set(0.006, 0.135, 0); g.add(tab);
  return g;
}
// a weathered ad panel in a bolted steel frame on a post (an English-study app, made up: "Wordly")
export function makeAppAdPost() {
  const g = new THREE.Group(); g.name = 'app_ad_post';
  cyl(0.05, 0.055, 2.6, std({ color: '#6a6c70', metalness: 0.6, roughness: 0.4 }), 0, 1.3, 0, g, 14);
  const t = canvasT(512, 960, (x, w, h) => { const r = rng(74);
    x.fillStyle = '#f2e8c8'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(160,120,60,0.18)'; for (let i = 0; i < 30; i++) { x.font = `22px ${F.hand}`; x.fillText('learn · listen · speak · repeat', r() * 100, 40 + i * 32); }
    x.fillStyle = '#2a4a8a'; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, 0); x.lineTo(w, 140); x.bezierCurveTo(w * 0.6, 200, w * 0.3, 90, 0, 170); x.fill(); x.fillStyle = '#fff'; fitText(x, 'WORDLY', w * 0.3, 70, 260, 70, F.retro);
    // two phone mock-ups
    const phone = (px, py, ph, dark) => { x.fillStyle = dark ? '#141414' : '#f4f4f0'; x.beginPath(); x.roundRect(px, py, 200, ph, 24); x.fill(); x.fillStyle = dark ? '#2a2a30' : '#ffffff'; x.fillRect(px + 12, py + 44, 176, ph - 90);
      x.fillStyle = '#e8402a'; x.fillRect(px + 12, py + 44, 176, 30); x.fillStyle = '#fff'; fitText(x, dark ? 'LISTEN' : 'QUEST START', px + 100, py + 60, 160, 18, F.label);
      if (dark) { x.fillStyle = '#8ad8f2'; x.fillRect(px + 20, py + 84, 160, 90); x.fillStyle = '#f4f2ea'; ['work', "don't", 'me', 'Please', 'while', 'disturb'].forEach((wd, i) => { x.fillStyle = '#f4f2ea'; x.fillRect(px + 20 + (i % 3) * 54, py + 200 + Math.floor(i / 3) * 40, 48, 30); x.fillStyle = '#111'; fitText(x, wd, px + 44 + (i % 3) * 54, py + 216 + Math.floor(i / 3) * 40, 44, 14, F.small); }); }
      else { x.fillStyle = '#333'; for (let i = 0; i < 10; i++) x.fillRect(px + 22, py + 86 + i * 22, 100 + r() * 50, 8); x.fillStyle = '#e8402a'; fitText(x, 'get · take · go', px + 100, py + ph - 70, 170, 20, F.label); } };
    phone(40, 200, 420, false); phone(270, 220, 400, true);
    x.fillStyle = '#2a2a2a'; fitText(x, 'リスニングを磨きながら', w / 2, 680, w - 60, 34, F.antique); fitText(x, '単語や頻出表現も!', w / 2, 722, w - 60, 34, F.antique);
    // the mascot: an owl in glasses on a blue square tile (original)
    x.fillStyle = '#3a6ad8'; x.beginPath(); x.roundRect(40, 770, 150, 150, 26); x.fill(); x.fillStyle = '#f2c88a'; x.beginPath(); x.ellipse(115, 860, 50, 56, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; for (const s of [-1, 1]) { x.beginPath(); x.arc(115 + s * 22, 835, 20, 0, 7); x.fill(); } x.fillStyle = '#111'; for (const s of [-1, 1]) { x.beginPath(); x.arc(115 + s * 22, 838, 8, 0, 7); x.fill(); } x.strokeStyle = '#111'; x.lineWidth = 4; for (const s of [-1, 1]) { x.beginPath(); x.arc(115 + s * 22, 835, 22, 0, 7); x.stroke(); } x.fillStyle = '#e8a02a'; x.beginPath(); x.moveTo(108, 856); x.lineTo(122, 856); x.lineTo(115, 870); x.fill();
    x.fillStyle = '#fff'; x.fillRect(240, 770, 150, 150); mosaic(x, 248, 778, 134, 9); x.fillStyle = '#111'; x.beginPath(); x.roundRect(410, 800, 90, 90, 14); x.fill(); x.fillStyle = '#fff'; fitText(x, 'free', 455, 845, 70, 26, F.label);
    // weathering: sun-faded patches, scratches, a tear at the corner
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,250,235,${r() * 0.25})`; x.fillRect(r() * w, r() * h, 20 + r() * 80, 2 + r() * 10); } x.fillStyle = '#c8c0a8'; x.beginPath(); x.moveTo(w, h); x.lineTo(w - 60, h); x.lineTo(w, h - 40); x.fill(); });
  const fr = std({ color: '#8a8c90', metalness: 0.7, roughness: 0.35 });
  const panel = new THREE.Group(); panel.position.set(0, 1.5, 0.07); g.add(panel);
  box(0.58, 1.06, 0.03, fr, 0, 0, 0, panel); plane(0.52, 0.98, std({ map: t, roughness: 0.55 }), 0, 0, 0.016, 0, panel);
  plane(0.52, 0.98, phys({ color: '#fff', transparent: true, opacity: 0.08, roughness: 0.05, depthWrite: false }), 0, 0, 0.021, 0, panel);
  for (const [bx, by] of [[-0.26, 0.46], [0.26, 0.46], [-0.26, -0.46], [0.26, -0.46], [-0.26, 0], [0.26, 0]]) { const b = cyl(0.008, 0.008, 0.012, std({ color: '#d8dce0', metalness: 0.9 }), bx, by, 0.02, panel, 10); b.rotation.x = Math.PI / 2; }
  for (const y of [-0.3, 0.3]) box(0.14, 0.04, 0.08, fr, 0, y, -0.04, panel);
  g.userData.collider = [-0.3, 0.3, -0.08, 0.12];
  return g;
}
// a sticker covered on a cylinder: an open cylinder segment just proud of the pole surface
function wrapSticker(p, r, t, y, h, a0, al) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24, 1, true, a0, al), decal(t)); m.position.y = y; p.add(m); return m; }
export function makeStickerPole() {
  const g = new THREE.Group(); g.name = 'sticker_pole';
  const R = 0.11; cyl(R, R, 4.2, std({ color: '#b8bcc0', metalness: 0.2, roughness: 0.5 }), 0, 2.1, 0, g, 28);
  const noSym = canvasT(256, 256, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#fff'; x.beginPath(); x.arc(128, 128, 124, 0, 7); x.fill(); x.fillStyle = '#111'; x.beginPath(); x.ellipse(128, 128, 64, 80, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(104, 120, 20, 12, 0.5, 0, 7); x.ellipse(152, 120, 20, 12, -0.5, 0, 7); x.fill(); x.strokeStyle = '#d81e1e'; x.lineWidth = 26; x.beginPath(); x.arc(128, 128, 108, 0, 7); x.stroke(); x.beginPath(); x.moveTo(52, 52); x.lineTo(204, 204); x.stroke(); });
  wrapSticker(g, R + 0.002, noSym, 1.65, 0.26, -0.9, 1.8);
  const tape = canvasT(512, 48, (x, w, h) => { x.fillStyle = '#f2d21a'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; fitText(x, '#だれも置き去りにしない街へ', w / 2, 26, w - 20, 30, F.antique); });
  const tp = wrapSticker(g, R + 0.004, tape, 1.65, 0.035, -1.2, 2.4); tp.rotation.x = 0.35;
  const pix = canvasT(256, 256, (x, w, h) => { x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, w, h); mosaic(x, 16, 16, 224, 31, ['#e8402a', '#2a6ad8', '#f2c21a', '#3ab84a', '#c83ab8', '#111', '#8ad8f2']); x.fillStyle = '#111'; fitText(x, 'pixelated', w / 2, 246, 120, 14, F.small); });
  wrapSticker(g, R + 0.002, pix, 1.2, 0.2, -0.6, 1.4);
  const letters = canvasT(128, 512, (x, w, h) => { x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, w, h); x.fillStyle = '#111'; ['N', 'O', 'P', 'E'].forEach((c, i) => fitText(x, c, w / 2, 70 + i * 122, w - 10, 120, F.heavy)); });
  wrapSticker(g, R + 0.002, letters, 1.7, 0.7, 1.4, 0.9);
  const small = canvasT(128, 128, (x, w, h) => { x.fillStyle = '#f2a8c8'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.fillStyle = '#111'; fitText(x, 'hi!', 64, 70, 90, 44, F.marker); });
  wrapSticker(g, R + 0.002, small, 2.05, 0.1, -0.2, 0.9); wrapSticker(g, R + 0.002, letters, 0.85, 0.5, 2.6, 0.7);
  g.userData.collider = [-R, R, -R, R];
  return g;
}
// a square brushed-steel pillar plastered with stickers and a yellow no-smoking-street notice (made-up ward)
export function makeStickerPillar() {
  const g = new THREE.Group(); g.name = 'sticker_pillar';
  const brushed = canvasT(256, 512, (x, w, h) => { x.fillStyle = '#b8bcc0'; x.fillRect(0, 0, w, h); const r = rng(2); for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${r() < 0.5 ? 255 : 60},${r() < 0.5 ? 255 : 60},${r() < 0.5 ? 255 : 60},0.08)`; x.fillRect(r() * w, r() * h, 1, 20 + r() * 80); } });
  const W = 0.42; box(W, 3.4, W, std({ map: brushed, color: '#e8ecf0', metalness: 0.35, roughness: 0.35 }), 0, 1.7, 0, g);
  const face = (t, w, h, x, y, rz = 0) => { const p = plane(w, h, decal(t), x, y, W / 2 + 0.002, 0, g); p.rotation.z = rz; return p; };
  face(canvasT(256, 512, (x, w, h) => { x.fillStyle = '#f2d21a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#111'; x.lineWidth = 6; x.strokeRect(6, 6, w - 12, h - 12); x.fillStyle = '#111'; fitText(x, 'ここは', w / 2, 50, w - 40, 34, F.antique); x.fillStyle = '#c81e1e'; '路上禁煙'.split('').forEach((c, i) => fitText(x, c, w / 2, 120 + i * 74, 100, 70, F.antique)); x.fillStyle = '#111'; fitText(x, '地区です', w / 2, 440, w - 40, 34, F.antique); fitText(x, '楡町区', w / 2, 488, w - 60, 28, F.antique); }), 0.2, 0.4, 0, 2.6);
  face(canvasT(256, 128, (x, w, h) => { x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, w, h); x.strokeStyle = '#111'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); for (let i = 0; i < 6; i++) { x.moveTo(20 + i * 38, 100); x.bezierCurveTo(40 + i * 38, 10, 10 + i * 38, 30, 50 + i * 38, 90); } x.stroke(); }), 0.22, 0.11, 0, 2.15, 0.05);
  face(canvasT(192, 256, (x, w, h) => { x.fillStyle = '#2a2a2a'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8e8e8'; x.beginPath(); x.moveTo(40, 40); x.lineTo(150, 20); x.lineTo(160, 120); x.lineTo(60, 130); x.fill(); x.fillStyle = '#f2c21a'; x.beginPath(); x.arc(100, 150, 50, 0, 7); x.fill(); x.fillStyle = '#111'; x.fillRect(80, 140, 10, 10); x.fillRect(110, 140, 10, 10); x.fillStyle = '#fff'; fitText(x, 'COSMIC KEN', w / 2, 232, w - 20, 22, F.heavy); }), 0.12, 0.16, -0.12, 1.75, -0.04);
  face(canvasT(160, 160, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#f28ab8'; x.beginPath(); x.arc(80, 60, 40, 0, 7); x.fill(); x.fillStyle = '#111'; fitText(x, '↑公告', 80, 130, 120, 30, F.antique); }), 0.1, 0.1, 0.1, 1.75, 0.03);
  face(canvasT(128, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#f2c21a'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.fillStyle = '#c81e1e'; fitText(x, 'YAY', 64, 70, 90, 40, F.heavy); }), 0.06, 0.06, -0.12, 1.5, 0);
  face(canvasT(256, 160, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c81e1e'; x.lineWidth = 10; x.strokeRect(10, 10, w - 20, h - 20); x.fillStyle = '#ccc'; x.fillRect(60, 40, 140, 70); x.fillStyle = '#111'; x.fillRect(40, 120, 60, 6); }), 0.16, 0.1, 0.06, 1.48, 0.02);
  face(canvasT(256, 192, (x, w, h) => { x.fillStyle = '#e8f0fa'; x.fillRect(0, 0, w, h); x.fillStyle = '#1e3a8a'; x.fillRect(0, 0, w, 34); x.fillStyle = '#fff'; fitText(x, 'PRIORITY · LABEL 228', w / 2, 18, w - 20, 18, F.label); x.fillStyle = '#8ad8f2'; x.beginPath(); x.moveTo(30, 190); x.bezierCurveTo(20, 60, 120, 40, 140, 190); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(110, 120, 46, 40, 0, 0, 7); x.fill(); x.fillStyle = '#111'; x.beginPath(); x.ellipse(96, 116, 6, 10, 0, 0, 7); x.ellipse(126, 116, 6, 10, 0, 0, 7); x.fill(); x.strokeStyle = '#111'; x.lineWidth = 3; x.beginPath(); x.arc(110, 135, 10, 0.2, Math.PI - 0.2); x.stroke(); x.fillStyle = '#333'; for (let i = 0; i < 5; i++) x.fillRect(170, 60 + i * 20, 70, 6); }), 0.2, 0.15, 0, 1.2, -0.03);
  // torn sticker residue
  face(canvasT(128, 64, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(240,240,232,0.8)'; x.beginPath(); x.moveTo(5, 10); x.lineTo(120, 4); x.lineTo(110, 40); x.lineTo(70, 30); x.lineTo(40, 58); x.lineTo(8, 50); x.fill(); }), 0.12, 0.06, 0.08, 2.0, 0.1);
  g.userData.collider = [-W / 2, W / 2, -W / 2, W / 2];
  return g;
}
