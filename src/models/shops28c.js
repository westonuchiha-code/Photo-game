// Shops from the city photos (28c). All names, prices, phone numbers and the mascot are made up.
//   makeShutterShop()  closed-up radio/TV shop: corrugated metal upper storey with a barred window,
//                      faded sign band ("HIKARI RADIO & TV" + made-up phone), four yellow roll shutters
//                      with a green lower band, an original painted mascot (a little radio robot),
//                      planters along the front
//   makeVendingMachine() white cup-noodle vending machine with lit cup samples (made-up brand
//                      "NOODLE TIME"), price buttons, coin slot, food photo panel, pickup flap
//   makeJunkShop()     walk-in second-hand electronics shop: glass front with a door, fluorescent
//                      ceiling, wood floor, grey steel shelving full of CRT TVs and beige retro
//                      computers + keyboards, blue crates of records and CDs, price tags, a green
//                      wall poster; returns colliders + an interior walk area
// Faces +z, origin at the front-centre at ground level.
import * as THREE from 'three';
import { fitText } from '../fonts.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

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
function corrugated(w, h) {
  return canvasTex(256, 256, (c, cw, ch) => {
    for (let x = 0; x < cw; x += 16) { const g = c.createLinearGradient(x, 0, x + 16, 0); g.addColorStop(0, '#9a9ea2'); g.addColorStop(0.5, '#d4d7da'); g.addColorStop(1, '#8a8e92'); c.fillStyle = g; c.fillRect(x, 0, 16, ch); }
    const r = rng(2); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(110,80,50,${r() * 0.2})`; c.fillRect(r() * cw, r() * ch, 2, 10 + r() * 40); }
  });
}

// ---------------------------------------------------------------- yellow shutter shop
function drawMascot(c, x, y, s) {
  // original mascot: a little robot with a radio-dial face, waving
  c.save(); c.translate(x, y); c.scale(s, s);
  c.lineWidth = 4; c.strokeStyle = '#2a3a3a';
  c.fillStyle = '#f2efe6'; c.beginPath(); c.roundRect(-40, -150, 80, 70, 14); c.fill(); c.stroke();     // head
  c.fillStyle = '#d84a3a'; c.fillRect(-40, -150, 80, 16); c.strokeRect(-40, -150, 80, 16);             // red cap band
  c.fillStyle = '#2a3a3a'; c.beginPath(); c.arc(-14, -112, 7, 0, 7); c.arc(14, -112, 7, 0, 7); c.fill(); // eyes
  c.beginPath(); c.arc(0, -98, 10, 0.2, Math.PI - 0.2); c.stroke();                                      // smile
  c.beginPath(); c.moveTo(0, -150); c.lineTo(0, -178); c.stroke(); c.beginPath(); c.arc(0, -182, 6, 0, 7); c.fill(); // antenna
  c.fillStyle = '#3f7a5a'; c.beginPath(); c.roundRect(-34, -78, 68, 74, 10); c.fill(); c.stroke();       // body
  c.fillStyle = '#f2c23a'; c.beginPath(); c.arc(0, -42, 16, 0, 7); c.fill(); c.stroke();                 // dial
  c.strokeStyle = '#2a3a3a'; c.lineWidth = 8;
  c.beginPath(); c.moveTo(-34, -64); c.lineTo(-70, -40); c.stroke();
  c.beginPath(); c.moveTo(34, -64); c.lineTo(76, -96); c.stroke();                                        // waving arm
  c.fillStyle = '#f2efe6'; c.beginPath(); c.arc(82, -100, 12, 0, 7); c.fill(); c.lineWidth = 4; c.stroke();
  c.lineWidth = 8; c.beginPath(); c.moveTo(-16, -4); c.lineTo(-24, 50); c.stroke(); c.beginPath(); c.moveTo(16, -4); c.lineTo(30, 48); c.stroke();
  c.restore();
}
export function makeShutterShop(W = 11) {
  const g = new THREE.Group();
  const H1 = 3.0, H = 6.4, D = 7;
  const metal = corrugated();
  metal.repeat.set(W / 1.6, 1);
  const mm = std({ map: metal, metalness: 0.4, roughness: 0.5 });
  g.add(box(W, H - H1 - 0.8, D, mm, 0, H1 + 0.8 + (H - H1 - 0.8) / 2, -D / 2));
  // barred upstairs window
  g.add(box(1.8, 0.9, 0.05, std({ color: '#1a1c1e' }), -0.8, H1 + 2.2, 0.01));
  for (let i = 0; i < 9; i++) g.add(box(0.02, 0.95, 0.04, std({ color: '#d8d8d4', metalness: 0.6 }), -1.6 + i * 0.2, H1 + 2.2, 0.06));
  // sign band
  // sign band (aspect matched to the board so lettering isn't stretched): COLOR TV panel | shop name | phone strip
  const SBW = W * 0.62, SBH = 0.75;
  const sign = canvasTex(2048, Math.round(2048 * SBH / SBW), (c, w, h) => {
    c.fillStyle = '#f2f0e8'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#d8323a'; c.fillRect(0, 0, w, 16);
    const bandY = h - 52;
    c.fillStyle = '#e8d24a'; c.fillRect(0, bandY, w, 52);
    const split = w * 0.3;
    c.fillStyle = '#d8d6cc'; c.fillRect(split - 3, 26, 6, bandY - 36);
    // multicoloured letters like the old painted panel
    const word = 'COLOR TV', cols = ['#2a4aa8', '#2a8a9a', '#d8323a', '#e88a2a', '#2a4aa8', '#2a4aa8', '#2a4aa8', '#2a4aa8'];
    c.font = '96px "Righteous"';
    let tw = 0; for (const ch of word) tw += c.measureText(ch).width;
    const sc = Math.min(1, (split - 80) / tw);
    c.font = `${Math.floor(96 * sc)}px "Righteous"`; c.textBaseline = 'middle'; c.textAlign = 'left';
    let x = (split - tw * sc) / 2;
    [...word].forEach((ch, i) => { c.fillStyle = cols[i]; c.fillText(ch, x, (16 + bandY) / 2 + 4); x += c.measureText(ch).width; });
    c.fillStyle = '#1a1a1a';
    fitText(c, 'HIKARI RADIO & TV', split + (w - split) / 2, (16 + bandY) / 2 + 4, w - split - 120, 120, '"Righteous"', { spacing: 4 });
    fitText(c, 'TEL  0123 - 45 - 6789', w - 260, bandY + 27, 440, 34, '"Oswald"', { weight: '600', spacing: 3 });
    c.fillStyle = 'rgba(120,100,60,0.12)'; for (let i = 0; i < 90; i++) c.fillRect(Math.random() * w, Math.random() * h, 40, 3);
  });
  const frameM = std({ color: '#b8b6ae', metalness: 0.4, roughness: 0.5 });
  const sbx = -W / 2 + 0.25 + SBW / 2;                     // flush with the left end, like the photo
  g.add(box(SBW, SBH, 0.12, [frameM, frameM, frameM, frameM, std({ map: sign, roughness: 0.6 }), frameM], sbx, H1 + 0.45, 0.08));
  for (const dy of [-SBH / 2, SBH / 2]) g.add(box(SBW + 0.04, 0.04, 0.14, frameM, sbx, H1 + 0.45 + dy, 0.08));
  for (const dx of [-SBW / 2, SBW / 2]) g.add(box(0.04, SBH + 0.04, 0.14, frameM, sbx + dx, H1 + 0.45, 0.08));
  g.add(box(W, 0.8, 0.06, mm, 0, H1 + 0.4, 0.0));
  // four roll shutters, yellow with a green band; mascot + shop name painted on
  const bays = [[-W / 2 + 0.15, -W / 2 + 2.85], [-W / 2 + 3.0, -W / 2 + 5.7], [-W / 2 + 5.85, -W / 2 + 8.4], [-W / 2 + 8.6, W / 2 - 0.15]];
  bays.forEach(([x0, x1], i) => {
    const bw = x1 - x0;
    const t = canvasTex(512, 576, (c, w, h) => {
      c.fillStyle = '#d8b84a'; c.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 12) { c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, y, w, 3); c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(0, y + 4, w, 2); }
      c.fillStyle = '#3f6a5a'; c.fillRect(0, h * 0.8, w, h * 0.2); c.fillStyle = '#e8e6dc'; c.fillRect(0, h * 0.78, w, 10);
      if (i === 3) { c.fillStyle = '#e8e6dc'; c.fillRect(0, h * 0.82, w, h * 0.18); for (let y = h * 0.82; y < h; y += 10) { c.fillStyle = '#b8b8b0'; c.fillRect(0, y, w, 2); } }
      c.fillStyle = 'rgba(0,0,0,0.04)'; for (let k = 0; k < 200; k++) c.fillRect(Math.random() * w, Math.random() * h, 20, 1);
      c.fillStyle = '#2a4a3a'; c.font = '46px "Righteous"';
      if (i === 0) drawMascot(c, 210, 420, 1.3);
      if (i === 1) fitText(c, 'HIKARI RADIO', w / 2, 400, w - 120, 46, '"Righteous"', { spacing: 6 });
      if (i === 3) fitText(c, 'HIKARI RADIO', w / 2, 300, w - 160, 46, '"Righteous"', { spacing: 6 });
      if (i === 2) { c.save(); c.globalAlpha = 0.6; drawMascot(c, 220, 220, 0.6); c.restore(); }
    });
    g.add(box(bw, H1 - 0.1, 0.06, std({ map: t, roughness: 0.55, metalness: 0.2 }), (x0 + x1) / 2, (H1 - 0.1) / 2, 0.02));
    g.add(box(bw, 0.25, 0.25, std({ color: '#c9c4b0' }), (x0 + x1) / 2, H1 - 0.05, 0.08));
  });
  for (const x of [-W / 2 + 2.92, -W / 2 + 5.77, -W / 2 + 8.5]) g.add(box(0.12, H1, 0.12, std({ color: '#d8d6cc' }), x, H1 / 2, 0.06));
  // planters with flowers
  const r = rng(5);
  for (const x of [-W / 2 + 1.0, -W / 2 + 1.9, -W / 2 + 6.8]) {
    g.add(box(0.6, 0.22, 0.3, std({ color: '#e8e4da' }), x, 0.11, 0.4));
    for (let k = 0; k < 6; k++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), std({ color: ['#d84a8a', '#e86aa8', '#4a8a3a'][k % 3] })); f.position.set(x + (r() - 0.5) * 0.45, 0.26 + r() * 0.08, 0.4 + (r() - 0.5) * 0.15); g.add(f); }
  }
  g.add(box(W, 0.1, 0.8, std({ color: '#a8a59c' }), 0, 0.05, 0.4));
  const l = new THREE.PointLight('#e8f0ff', 4, 8, 1.5); l.position.set(-2, 3.8, 1.8); g.add(l);
  g.userData.collider = [-W / 2, W / 2, -D, 0.15];
  return g;
}

// ---------------------------------------------------------------- vending machine
// Laid out from the photo: proportions are fractions of the machine's width / height measured off it.
function cupLabel(top, band, text, sub) {
  return canvasTex(256, 128, (c, w, h) => {
    c.fillStyle = '#f7f5ef'; c.fillRect(0, 0, w, h);
    c.fillStyle = top; c.fillRect(0, 0, w, 18);                     // printed rim band
    c.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = 0; x < w; x += 6) c.fillRect(x, 4, 2, 10);
    c.fillStyle = band; c.beginPath(); c.moveTo(0, 46); c.lineTo(w, 40); c.lineTo(w, 98); c.lineTo(0, 104); c.fill();
    c.fillStyle = '#fff'; c.font = '27px "Archivo Black"'; c.textAlign = 'center'; c.fillText(text, w / 2, 82);
    c.fillStyle = '#d8323a'; c.font = '600 16px "Oswald"'; c.fillText(sub, w / 2, 32);
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.font = '11px "Roboto Condensed"'; c.fillText('NOODLE TIME  •  77g', w / 2, 120);
  });
}
const CUPS = [['#d8323a', '#2f8a3a', 'SPICY', 'TOMATO'], ['#d8323a', '#c8202a', 'TOMATO', 'CHILI'], ['#d8323a', '#f2f0e8', 'CLASSIC', 'ORIGINAL'],
  ['#2f8a3a', '#3f9a3a', 'LEEK SALT', 'SHIO'], ['#2f8a3a', '#e8c23a', 'CURRY', 'MILD'], ['#2a5aa8', '#2a5aa8', 'SEAFOOD', 'OCEAN'], ['#e8a01a', '#e8a01a', 'MISO', 'RICH']];
function noodleCup(i) {
  const [top, band, text, sub] = CUPS[i % CUPS.length];
  const g = new THREE.Group();
  const lab = cupLabel(top, band, text, sub);
  lab.wrapS = THREE.RepeatWrapping; lab.repeat.set(2, 1);
  const prof = [[0, 0], [0.034, 0], [0.036, 0.004], [0.046, 0.108], [0.048, 0.112], [0, 0.112]].map(([a, b]) => new THREE.Vector2(a, b));
  const lg = new THREE.LatheGeometry(prof, 28);
  { const uv = lg.attributes.uv, ps = lg.attributes.position; for (let i = 0; i < uv.count; i++) uv.setY(i, Math.min(1, Math.max(0, ps.getY(i) / 0.112))); }   // label spans the side wall
  const body = new THREE.Mesh(lg, new THREE.MeshStandardMaterial({ map: lab, roughness: 0.5 }));
  body.castShadow = true; g.add(body);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.004, 28), new THREE.MeshStandardMaterial({ color: '#e8e4da', roughness: 0.35, metalness: 0.3 }));
  lid.position.y = 0.114; g.add(lid);
  const tab = box(0.03, 0.002, 0.02, new THREE.MeshStandardMaterial({ color: '#d8d4ca' }), 0.052, 0.114, 0); g.add(tab);
  return g;
}
function ramenPicture() {
  return canvasTex(512, 384, (c, w, h) => {
    const bg = c.createRadialGradient(w * 0.5, h * 0.25, 20, w * 0.5, h * 0.4, w * 0.75);
    bg.addColorStop(0, '#e86a4a'); bg.addColorStop(0.6, '#b8281e'); bg.addColorStop(1, '#6a1410');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.08)';                                  // steam
    for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(140 + i * 50, 60 + (i % 2) * 20, 30, 70, 0.3, 0, 7); c.fill(); }
    // cup: white with a striped band at the bottom, seen from slightly above
    c.fillStyle = '#f4f1ea'; c.beginPath(); c.moveTo(70, 160); c.lineTo(w - 70, 160); c.lineTo(w - 110, h); c.lineTo(110, h); c.fill();
    c.fillStyle = '#e8e2d6'; for (let x = 120; x < w - 120; x += 14) c.fillRect(x, 330, 6, 54);
    c.fillStyle = '#fbfaf6'; c.beginPath(); c.ellipse(w / 2, 165, 195, 62, 0, 0, 7); c.fill();
    const br = c.createRadialGradient(w / 2, 170, 10, w / 2, 170, 180); br.addColorStop(0, '#c86a2a'); br.addColorStop(1, '#8a3a14');
    c.fillStyle = br; c.beginPath(); c.ellipse(w / 2, 170, 178, 52, 0, 0, 7); c.fill();
    c.strokeStyle = '#e8c890'; c.lineWidth = 3;                               // noodles
    for (let i = 0; i < 26; i++) { c.beginPath(); const x = 110 + i * 11; c.moveTo(x, 185); c.bezierCurveTo(x + 10, 160, x - 10, 150, x + 6, 135); c.stroke(); }
    const r = rng(9);
    const blob = (x, y, rx, ry, col, hi) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, r() * 3, 0, 7); c.fill(); c.fillStyle = hi; c.beginPath(); c.ellipse(x - rx * 0.3, y - ry * 0.35, rx * 0.4, ry * 0.3, 0, 0, 7); c.fill(); };
    for (let i = 0; i < 9; i++) { const x = 120 + r() * 270, y = 140 + r() * 55; c.strokeStyle = '#f08a5a'; c.lineWidth = 12; c.beginPath(); c.arc(x, y, 14, 0.4, 4.2); c.stroke(); c.strokeStyle = '#ffd0b0'; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 14, 0.8, 3.0); c.stroke(); }   // shrimp
    for (let i = 0; i < 12; i++) blob(115 + r() * 280, 140 + r() * 60, 13, 11, '#6a3a24', '#9a6040');      // meat
    for (let i = 0; i < 12; i++) blob(115 + r() * 280, 138 + r() * 62, 9, 8, '#f2d040', '#fff2a0');        // corn
    for (let i = 0; i < 16; i++) blob(115 + r() * 280, 138 + r() * 62, 7, 4, '#3f9a3a', '#8fd06a');        // green onion
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(0, 0, w, 6);
  });
}
function stickerTex(lines, head, headCol, w = 256, h = 128) {
  return canvasTex(w, h, (c, cw, ch) => {
    c.fillStyle = '#f6f5f0'; c.fillRect(0, 0, cw, ch);
    c.strokeStyle = '#8a8a86'; c.lineWidth = 2; c.strokeRect(1, 1, cw - 2, ch - 2);
    if (head) { c.fillStyle = headCol; c.fillRect(0, 0, cw, 24); c.fillStyle = '#fff'; c.font = '600 15px "Oswald"'; c.fillText(head, 8, 17); }
    c.fillStyle = '#333'; c.font = '14px "Roboto Condensed"'; lines.forEach((t, i) => c.fillText(t, 8, (head ? 42 : 20) + i * 17));
  });
}
export function makeVendingMachine() {
  const g = new THREE.Group();
  const W = 0.74, D = 0.72, HM = 1.94;
  const X = (f) => (f - 0.5) * W, Y = (f) => (1 - f) * HM;          // photo fractions -> metres
  const white = new THREE.MeshStandardMaterial({ color: '#efeee8', roughness: 0.32, metalness: 0.05 });
  const offWhite = new THREE.MeshStandardMaterial({ color: '#f6f5f0', roughness: 0.3 });
  const black = new THREE.MeshStandardMaterial({ color: '#141516', roughness: 0.35 });
  const chrome = new THREE.MeshStandardMaterial({ color: '#d0d3d6', metalness: 0.9, roughness: 0.18 });
  const BASE = 0.075;
  // cabinet with rounded edges + plinth with levelling feet
  const FD = 0.18;                                                     // front door thickness (window cubbies are cut through it)
  const cab = new THREE.Mesh(new RoundedBoxGeometry(W, HM - BASE, D - FD, 4, 0.025), white);
  cab.position.set(0, BASE + (HM - BASE) / 2, -FD - (D - FD) / 2); cab.castShadow = cab.receiveShadow = true; g.add(cab);
  g.add(box(W + 0.01, BASE - 0.02, D - 0.02, white, 0, 0.02 + (BASE - 0.02) / 2, -D / 2 + 0.01));
  for (const sx of [-1, 1]) for (const sz of [0.06, D - 0.06]) {
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.02, 10), chrome); f.position.set(sx * (W / 2 - 0.05), 0.01, -sz); g.add(f);
    g.add(box(0.08, 0.004, 0.06, chrome, sx * (W / 2 - 0.05), 0.022, -sz));
  }
  // door seam: a thin dark gap round the front door panel
  const seam = new THREE.MeshStandardMaterial({ color: '#b8b6ae', roughness: 0.6 });
  g.add(box(W - 0.03, 0.004, 0.006, seam, 0, Y(0.965), 0.001), box(W - 0.03, 0.004, 0.006, seam, 0, Y(0.015), 0.001));
  for (const sx of [-1, 1]) g.add(box(0.004, Y(0.015) - Y(0.965), 0.006, seam, sx * (W / 2 - 0.015), (Y(0.015) + Y(0.965)) / 2, 0.001));

  // ---- upper display panel: raised plate with a chamfered lower-right corner and two window openings
  const px0 = X(0.07), px1 = X(0.95), py0 = Y(0.49), py1 = Y(0.04), ch = 0.07;
  const win = [[0.13, 0.70, 0.20, 0.29, 3], [0.13, 0.70, 0.355, 0.436, 3], [0.73, 0.91, 0.174, 0.263, 1], [0.73, 0.91, 0.325, 0.405, 1]];
  const shape = new THREE.Shape();
  shape.moveTo(px0, py0); shape.lineTo(px1 - ch, py0); shape.lineTo(px1, py0 + ch * 1.3); shape.lineTo(px1, py1); shape.lineTo(px0, py1); shape.lineTo(px0, py0);
  for (const [a, b, t, bt] of win) { const hp = new THREE.Path(); hp.moveTo(X(a), Y(bt)); hp.lineTo(X(b), Y(bt)); hp.lineTo(X(b), Y(t)); hp.lineTo(X(a), Y(t)); hp.lineTo(X(a), Y(bt)); shape.holes.push(hp); }
  const door = new THREE.Shape();
  door.moveTo(-W / 2 + 0.004, BASE); door.lineTo(W / 2 - 0.004, BASE); door.lineTo(W / 2 - 0.004, HM - 0.004); door.lineTo(-W / 2 + 0.004, HM - 0.004); door.lineTo(-W / 2 + 0.004, BASE);
  for (const [a, b, t, bt] of win) { const hp = new THREE.Path(); hp.moveTo(X(a), Y(bt)); hp.lineTo(X(b), Y(bt)); hp.lineTo(X(b), Y(t)); hp.lineTo(X(a), Y(t)); hp.lineTo(X(a), Y(bt)); door.holes.push(hp); }
  const dm = new THREE.Mesh(new THREE.ExtrudeGeometry(door, { depth: FD - 0.002, bevelEnabled: false }), white);
  dm.position.z = -FD; dm.castShadow = dm.receiveShadow = true; g.add(dm);
  const plateTex = canvasTex(512, 640, (c, w, h) => {
    c.fillStyle = '#f7f6f1'; c.fillRect(0, 0, w, h);
    // logo: red outlined bubble lettering + pill sub-band (made-up brand)
    c.textAlign = 'center'; c.lineJoin = 'round';
    c.font = '60px "Shrikhand"'; c.lineWidth = 12; c.strokeStyle = '#d8323a'; c.fillStyle = '#fff';
    for (const [t, y] of [['NOODLE', 70], ['TIME', 132]]) fitText(c, t, w * 0.4, y, w * 0.66, 64, '"Shrikhand"', { stroke: 1 });
    c.fillStyle = '#d8323a'; c.beginPath(); c.roundRect(w * 0.4 - 105, 160, 210, 30, 15); c.fill();
    c.fillStyle = '#fff'; c.font = '600 19px "Oswald"'; c.fillText('INSTANT RAMEN', w * 0.4, 181);
    // corner badge
    c.fillStyle = '#d8323a'; c.beginPath(); c.moveTo(w - 110, 40); c.lineTo(w - 20, 40); c.lineTo(w - 30, 72); c.quadraticCurveTo(w - 65, 92, w - 100, 72); c.fill();
    c.fillStyle = '#fff'; c.font = '22px "Archivo Black"'; c.fillText('NT', w - 65, 68);
    c.fillStyle = '#222'; c.font = '600 19px "Oswald"'; c.fillText('NT FOODS', w - 65, 112);
  });
  const pg = new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: false });
  const pu = pg.attributes.uv, pp = pg.attributes.position;
  for (let i = 0; i < pu.count; i++) pu.setXY(i, (pp.getX(i) - px0) / (px1 - px0), (pp.getY(i) - py0) / (py1 - py0));
  const plate = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.3 })); plate.position.z = 0.001; g.add(plate);
  // raised lip round the plate
  const lip = new THREE.MeshStandardMaterial({ color: '#e2e0d8', roughness: 0.35 });
  g.add(box(px1 - px0 + 0.012, 0.008, 0.016, lip, (px0 + px1) / 2, py1, 0.004));
  g.add(box(0.008, py1 - py0, 0.016, lip, px0, (py0 + py1) / 2, 0.004));
  // window cubbies: recessed, warm-lit, with a shelf, cups, a glass front, a price tab + chrome button under each cup
  const glass = new THREE.MeshStandardMaterial({ color: '#dfe8ec', transparent: true, opacity: 0.12, roughness: 0.02, metalness: 0.4, depthWrite: false });
  const inner = new THREE.MeshStandardMaterial({ color: '#d8d4ca', emissive: '#3a3020', emissiveIntensity: 0.35, roughness: 0.8, side: THREE.BackSide });
  let cupI = 0;
  for (const [a, b, t, bt, n] of win) {
    const x0 = X(a), x1 = X(b), yTop = Y(t), yBot = Y(bt), dep = FD - 0.004;
    const cub = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, yTop - yBot, dep), inner);
    cub.position.set((x0 + x1) / 2, (yTop + yBot) / 2, -dep / 2 - 0.002); cub.scale.set(0.995, 0.99, 1); g.add(cub);
    g.add(box(x1 - x0 - 0.004, 0.012, dep, offWhite, (x0 + x1) / 2, yBot + 0.006, -dep / 2));   // shelf
    const spot = new THREE.Mesh(new THREE.CircleGeometry(0.014, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 1.25, 1.1), toneMapped: false }));
    spot.rotation.x = Math.PI / 2; spot.position.set((x0 + x1) / 2, yTop - 0.002, -dep * 0.4); g.add(spot);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, yTop - yBot), glass); gl.position.set((x0 + x1) / 2, (yTop + yBot) / 2, 0.004); g.add(gl);
    for (let i = 0; i < n; i++) {
      const cx = x0 + (i + 0.5) * (x1 - x0) / n;
      const cup = noodleCup(cupI++); cup.position.set(cx, yBot + 0.012, -0.09); cup.rotation.y = -Math.PI / 2 + (i - 1) * 0.06; g.add(cup);
      // price tab + button below the window
      const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.016), new THREE.MeshStandardMaterial({ map: canvasTex(96, 32, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#222'; c.font = '28px "Bebas Neue"'; c.textAlign = 'center'; c.fillText('250', w / 2, 24); }) }));
      tag.position.set(cx, yBot - 0.022, 0.0095); g.add(tag);
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.008, 20), black); ring.rotation.x = Math.PI / 2; ring.position.set(cx, yBot - 0.058, 0.012); g.add(ring);
      const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.012, 0.01, 20), chrome); btn.rotation.x = Math.PI / 2; btn.position.set(cx, yBot - 0.058, 0.017); g.add(btn);
      const led = new THREE.Mesh(new THREE.CircleGeometry(0.003, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 2.2, 0.6), toneMapped: false })); led.position.set(cx + 0.024, yBot - 0.058, 0.0135); g.add(led);
      g.add(box(0.03, 0.01, 0.006, offWhite, cx, yBot - 0.022, 0.006));
    }
  }
  const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 16), chrome); lock.rotation.x = Math.PI / 2; lock.position.set(X(0.9), Y(0.47), 0.006); g.add(lock);

  // ---- money section: bill acceptor, LED display, coin unit with an orange return lever
  const bill = box(X(0.36) - X(0.2), Y(0.52) - Y(0.57), 0.03, black, (X(0.2) + X(0.36)) / 2, (Y(0.52) + Y(0.57)) / 2, 0.012); g.add(bill);
  g.add(box((X(0.36) - X(0.2)) * 0.75, 0.018, 0.004, new THREE.MeshStandardMaterial({ map: canvasTex(128, 32, (c, w, h) => { c.fillStyle = '#e8902a'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = '600 19px "Oswald"'; c.textAlign = 'center'; c.fillText('1000 NOTE', w / 2, 23); }) }), (X(0.2) + X(0.36)) / 2, (Y(0.52) + Y(0.57)) / 2 + 0.006, 0.029));
  g.add(box((X(0.36) - X(0.2)) * 0.7, 0.004, 0.006, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 1.8, 0.5), toneMapped: false }), (X(0.2) + X(0.36)) / 2, (Y(0.52) + Y(0.57)) / 2 - 0.016, 0.028));
  const disp = box(X(0.59) - X(0.42), Y(0.52) - Y(0.545), 0.012, [black, black, black, black, new THREE.MeshBasicMaterial({ map: canvasTex(128, 32, (c, w, h) => { c.fillStyle = '#0a0a0a'; c.fillRect(0, 0, w, h); c.fillStyle = '#ff5a2a'; c.font = '30px "VT323"'; c.textAlign = 'right'; c.fillText('READY', w - 6, 24); }), color: new THREE.Color(1.3, 1.3, 1.3), toneMapped: false }), black], (X(0.42) + X(0.59)) / 2, (Y(0.52) + Y(0.545)) / 2, 0.006);
  g.add(disp);
  const cw = X(0.93) - X(0.66), chh = Y(0.51) - Y(0.57);
  const coin = new THREE.Mesh(new RoundedBoxGeometry(cw, chh, 0.03, 3, 0.02), black); coin.position.set((X(0.66) + X(0.93)) / 2, (Y(0.51) + Y(0.57)) / 2, 0.01); g.add(coin);
  const cring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 8, 24), new THREE.MeshStandardMaterial({ color: '#e8902a', roughness: 0.4 })); cring.position.set(X(0.86), (Y(0.51) + Y(0.57)) / 2 + 0.005, 0.027); g.add(cring);
  const slot = box(0.006, 0.026, 0.004, chrome, X(0.86), (Y(0.51) + Y(0.57)) / 2 + 0.005, 0.027); g.add(slot);
  const lever = box(0.06, 0.016, 0.012, new THREE.MeshStandardMaterial({ color: '#f0a02a', roughness: 0.4 }), X(0.73), (Y(0.51) + Y(0.57)) / 2 - 0.01, 0.03); lever.rotation.z = 0.25; g.add(lever);
  const lknob = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.014, 12), new THREE.MeshStandardMaterial({ color: '#f0a02a' })); lknob.rotation.x = Math.PI / 2; lknob.position.set(X(0.69), (Y(0.51) + Y(0.57)) / 2 - 0.017, 0.031); g.add(lknob);

  // ---- food picture in a recessed frame
  const fx0 = X(0.2), fx1 = X(0.82), fy0 = Y(0.755), fy1 = Y(0.59);
  g.add(box(fx1 - fx0 + 0.02, fy1 - fy0 + 0.02, 0.006, lip, (fx0 + fx1) / 2, (fy0 + fy1) / 2, 0.002));
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(fx1 - fx0, fy1 - fy0), new THREE.MeshStandardMaterial({ map: ramenPicture(), roughness: 0.15, emissive: '#ffffff', emissiveMap: ramenPicture(), emissiveIntensity: 0.18 }));
  pic.position.set((fx0 + fx1) / 2, (fy0 + fy1) / 2, 0.0055); g.add(pic);

  // ---- stickers (made-up text), coin return, pickup door
  const st1 = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.075), new THREE.MeshStandardMaterial({ map: stickerTex(['If something goes wrong', 'call the service desk', 'MACHINE  3 0 6 4 1 7', '0800-000-000'], 'SERVICE CENTER', '#2a3a8a') }));
  st1.position.set(X(0.27), Y(0.78), 0.002); g.add(st1);
  const st2 = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.04), new THREE.MeshStandardMaterial({ map: stickerTex(['Chopsticks are inside the', 'pickup door. One per cup.'], null, null, 256, 52) }));
  st2.position.set(X(0.56), Y(0.815), 0.002); g.add(st2);
  const st3 = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.05), new THREE.MeshStandardMaterial({ map: stickerTex(['Do not climb or', 'rock the machine.'], 'CAUTION', '#c8202a', 160, 72) }));
  st3.position.set(X(0.2), Y(0.9), 0.002); g.add(st3);
  const plateM = new THREE.MeshStandardMaterial({ color: '#b8bab8', metalness: 0.2, roughness: 0.45 });
  g.add(box(0.1, 0.05, 0.002, plateM, X(0.2), Y(0.945), 0.002));
  const cr = new THREE.Mesh(new RoundedBoxGeometry(X(0.91) - X(0.77), Y(0.765) - Y(0.81), 0.04, 3, 0.012), new THREE.MeshStandardMaterial({ color: '#e8902a', roughness: 0.35 }));
  cr.position.set((X(0.77) + X(0.91)) / 2, (Y(0.765) + Y(0.81)) / 2, 0.0); g.add(cr);
  g.add(box((X(0.91) - X(0.77)) * 0.8, 0.03, 0.01, new THREE.MeshStandardMaterial({ color: '#b8601a' }), (X(0.77) + X(0.91)) / 2, (Y(0.765) + Y(0.81)) / 2 - 0.005, 0.016));
  // pickup door: proud oval frame, smoked glass, dark chute behind
  const ocx = X(0.55), ocy = (Y(0.84) + Y(0.91)) / 2, orx = (X(0.755) - X(0.4)) / 2, ory = (Y(0.84) - Y(0.91)) / 2;
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.11, 10, 40), offWhite); ring2.scale.set(orx, ory, 0.12); ring2.position.set(ocx, ocy, 0.008); g.add(ring2);
  const chute = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshStandardMaterial({ color: '#2a1e18', roughness: 0.6 })); chute.scale.set(orx * 0.92, ory * 0.92, 1); chute.position.set(ocx, ocy, -0.02); g.add(chute);
  const smoke = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshStandardMaterial({ color: '#30353a', transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.5 })); smoke.scale.set(orx * 0.92, ory * 0.92, 1); smoke.position.set(ocx, ocy, 0.006); g.add(smoke);
  const glint = new THREE.Mesh(new THREE.PlaneGeometry(orx * 0.6, 0.006), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35 })); glint.position.set(ocx, ocy + ory * 0.6, 0.008); g.add(glint);

  // ---- chopstick / fork holder on the left side
  const holder = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.06), new THREE.MeshStandardMaterial({ color: '#e8ecee', transparent: true, opacity: 0.4, roughness: 0.1 }));
  holder.position.set(-W / 2 - 0.03, Y(0.68), -0.08); g.add(holder);
  for (let i = 0; i < 8; i++) { const st = box(0.006, 0.14, 0.004, new THREE.MeshStandardMaterial({ color: i % 2 ? '#f2e2c8' : '#e8d0a8' }), -W / 2 - 0.042 + (i % 4) * 0.008, Y(0.66), -0.1 + Math.floor(i / 4) * 0.02); st.rotation.z = (i - 4) * 0.02; g.add(st); }

  const l = new THREE.PointLight('#fff4e0', 1.2, 3, 2); l.position.set(0, 1.6, 0.7); g.add(l);
  
  g.userData.collider = [-W / 2 - 0.08, W / 2, -D, 0.05];
  return g;
}

// ---------------------------------------------------------------- junk shop
function crt(beige, s, seed) {
  const r = rng(seed);
  const g = new THREE.Group();
  const shell = std({ color: beige ? '#d8cfb4' : '#26272a', roughness: 0.5 });
  const w = 0.55 * s, h = 0.48 * s, d = 0.5 * s;
  g.add(box(w, h, d * 0.55, shell, 0, h / 2, -d * 0.27));
  const back = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.3, w * 0.45, d * 0.5, 4), shell);
  back.rotation.x = -Math.PI / 2; back.rotation.y = Math.PI / 4; back.position.set(0, h * 0.5, -d * 0.72); g.add(back);
  const scr = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8, -0.5, 1.0, Math.PI / 2 - 0.4, 0.8), std({ color: '#2a3034', roughness: 0.15, metalness: 0.4 }));
  scr.scale.set(w * 0.85, h * 0.8, 0.1); scr.position.set(0, h * 0.52, -0.08); g.add(scr);
  g.add(box(w * 0.86, h * 0.72, 0.01, std({ color: '#1e2428', roughness: 0.1, metalness: 0.5, emissive: r() < 0.3 ? '#14242a' : '#000' }), 0, h * 0.53, 0.005));
  // price tag (made-up price)
  const pt = canvasTex(96, 48, (c, cw, ch) => { c.fillStyle = '#fff'; c.fillRect(0, 0, cw, ch); c.fillStyle = '#d82a2a'; c.fillRect(0, 0, cw, 12); c.font = '30px "Bebas Neue"'; c.fillText('¥' + (2 + Math.floor(r() * 18)) + ',800', 4, 38); });
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.06), std({ map: pt })); tag.position.set(w * 0.3, h * 0.12, 0.012); g.add(tag);
  return g;
}
function keyboardComp(seed) {
  const r = rng(seed);
  const g = new THREE.Group();
  const beige = std({ color: ['#d8cfb4', '#cfc8b8', '#3a3a3c'][Math.floor(r() * 3)], roughness: 0.5 });
  g.add(box(0.48, 0.07, 0.24, beige, 0, 0.035, 0));
  const keys = canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#c8c0a8'; c.fillRect(0, 0, w, h); for (let y = 4; y < h - 4; y += 11) for (let x = 4; x < w - 4; x += 9) { c.fillStyle = (x + y) % 5 ? '#ebe5d4' : '#9a9484'; c.fillRect(x, y, 7, 9); } });
  const k = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.15), std({ map: keys })); k.rotation.x = -Math.PI / 2 + 0.12; k.position.set(0, 0.075, 0.02); g.add(k);
  return g;
}
export function makeJunkShop(W = 9, D = 12) {
  const g = new THREE.Group();
  const H = 3.6;
  const colliders = [];
  const solid = (a, b, c, d) => colliders.push([a, b, c, d]);
  const wall = std({ color: '#ece9e0', roughness: 0.9, side: THREE.DoubleSide });
  const floorT = canvasTex(256, 256, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = ['#b88a5a', '#c4966a', '#a87a4a', '#bf9060'][i % 4]; c.fillRect(0, i * 32, w, 31); } c.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 8; i++) c.fillRect(((i * 97) % w), i * 32, 2, 32); });
  floorT.repeat.set(W / 2, D / 2);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ map: floorT, roughness: 0.5 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.01, -D / 2); g.add(fl);
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ color: '#f2f0ea', emissive: '#3a3a36' })); ce.rotation.x = Math.PI / 2; ce.position.set(0, H, -D / 2); g.add(ce);
  for (const x of [-W / 4, W / 4]) for (let z = -1.5; z > -D; z -= 3) g.add(box(0.15, 0.05, 2.2, glow(1.6, 1.65, 1.7), x, H - 0.04, z));
  for (const [z, x] of [[-3, 0], [-8.5, 0]]) { const l = new THREE.PointLight('#f2f6ff', 6, 10, 1.5); l.position.set(x, H - 0.4, z); g.add(l); }
  // shell: back + sides, front glass with a centre door gap
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wall); back.position.set(0, H / 2, -D); g.add(back);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wall); p.position.set(s * W / 2, H / 2, -D / 2); p.rotation.y = -s * Math.PI / 2; g.add(p); }
  const outer = std({ color: '#c9c6bc', roughness: 0.85 });
  g.add(box(W + 0.3, 1.4, D + 0.3, outer, 0, H + 0.7, -D / 2));
  for (const s of [-1, 1]) g.add(box(0.15, H, D, outer, s * (W / 2 + 0.08), H / 2, -D / 2));
  g.add(box(W + 0.3, 0.15, 0.15, outer, 0, H / 2, -D - 0.08).translateY(0));
  g.add(box(W + 0.3, H, 0.15, outer, 0, H / 2, -D - 0.08));
  const glass = new THREE.MeshStandardMaterial({ color: '#a8c0c8', transparent: true, opacity: 0.25, roughness: 0.05, metalness: 0.3 });
  const DW = 1.6;
  for (const s of [-1, 1]) {
    const gw = W / 2 - DW / 2;
    const gp = new THREE.Mesh(new THREE.PlaneGeometry(gw, H - 0.6), glass); gp.position.set(s * (DW / 2 + gw / 2), 0.35 + (H - 0.6) / 2, 0); g.add(gp);
    g.add(box(gw, 0.35, 0.12, std({ color: '#2a2b2e' }), s * (DW / 2 + gw / 2), 0.175, 0));
    for (let k = 0; k <= 2; k++) g.add(box(0.06, H - 0.25, 0.1, std({ color: '#2a2b2e' }), s * (DW / 2 + k * gw / 2), (H - 0.25) / 2 + 0.25, 0));
    solid(s < 0 ? -W / 2 : DW / 2, s < 0 ? -DW / 2 : W / 2, -0.12, 0.12);
  }
  g.add(box(W, 0.25, 0.14, std({ color: '#2a2b2e' }), 0, H - 0.12, 0));
  // shop sign over the front (made up)
  const sg = canvasTex(1024, 160, (c, w, h) => {
    c.fillStyle = '#f6c21a'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1a'; c.fillRect(0, h - 14, w, 6); fitText(c, 'JUNK & RETRO', (w - 160) / 2 + 20, h / 2 + 4, w - 260, 100, '"Bungee"', { spacing: 2 });
    c.fillStyle = '#d82a2a'; c.beginPath(); c.arc(w - 100, h / 2, 62, 0, 7); c.fill(); c.fillStyle = '#fff'; fitText(c, 'USED', w - 100, h / 2 + 3, 96, 34, '"Bungee"');
  });
  g.add(box(W * 0.9, 0.9, 0.1, [outer, outer, outer, outer, new THREE.MeshBasicMaterial({ map: sg, color: new THREE.Color(1.1, 1.1, 1.1), toneMapped: false }), outer], 0, H + 0.6, 0.12));
  solid(-W / 2 - 0.2, -W / 2, -D, 0); solid(W / 2, W / 2 + 0.2, -D, 0); solid(-W / 2, W / 2, -D - 0.2, -D);
  // steel shelving units (grey uprights, 4 shelves)
  const steel = std({ color: '#7d8186', metalness: 0.5, roughness: 0.45 });
  const shelfUnit = (len, depth, x, z, ry, fill, seed) => {
    const u = new THREE.Group();
    const r = rng(seed);
    for (const sx of [-len / 2, len / 2]) for (const sz of [-depth / 2, depth / 2]) u.add(box(0.04, 2.0, 0.04, steel, sx, 1.0, sz));
    for (const y of [0.12, 0.62, 1.12, 1.62]) {
      u.add(box(len, 0.03, depth, steel, 0, y, 0));
      fill(u, y + 0.015, len, depth, r);
    }
    u.position.set(x, 0, z); u.rotation.y = ry; g.add(u);
  };
  const tvs = (u, y, len, depth, r) => { let x = -len / 2 + 0.05; while (x < len / 2 - 0.4) { const s = 0.6 + r() * 0.6; const t = crt(r() < 0.55, s, Math.floor(r() * 99)); t.position.set(x + 0.28 * s, y, 0.1); t.rotation.y = (r() - 0.5) * 0.15; u.add(t); x += 0.58 * s + 0.04; } };
  const comps = (u, y, len, depth, r) => { let x = -len / 2 + 0.05; while (x < len / 2 - 0.5) { if (r() < 0.5) { const k = keyboardComp(Math.floor(r() * 99)); k.position.set(x + 0.25, y, 0.08); k.rotation.y = (r() - 0.5) * 0.1; u.add(k); x += 0.52; } else { const t = crt(true, 0.65, Math.floor(r() * 99)); t.position.set(x + 0.2, y, 0.12); u.add(t); x += 0.42; } } };
  shelfUnit(5.2, 0.6, -W / 2 + 0.35, -6.5, Math.PI / 2, (u, y, len, depth, r) => (y > 1 ? tvs : comps)(u, y, len, depth, r), 3);
  solid(-W / 2, -W / 2 + 0.7, -9.2, -3.8);
  shelfUnit(5.2, 0.6, W / 2 - 0.35, -6.5, -Math.PI / 2, tvs, 7);
  solid(W / 2 - 0.7, W / 2, -9.2, -3.8);
  shelfUnit(4.0, 0.6, 0, -D + 0.4, 0, comps, 11);
  solid(-2.1, 2.1, -D, -D + 0.75);
  // centre counter of blue crates with records/CDs, big TVs on top
  const crateM = std({ color: '#2a5ad8', roughness: 0.5 });
  const discs = canvasTex(256, 64, (c, w, h) => { const r = rng(4); for (let x = 0; x < w; x += 4) { c.fillStyle = ['#1a1a1a', '#e8e2d0', '#c8202a', '#2a4a8a', '#e8c23a', '#3a7a4a', '#8a5aa8'][Math.floor(r() * 7)]; c.fillRect(x, 0, 3, h); } });
  const counter = new THREE.Group();
  counter.add(box(1.6, 0.9, 3.6, steel, 0, 0.45, 0));
  counter.add(box(1.65, 0.04, 3.65, std({ color: '#9ca0a4', metalness: 0.6, roughness: 0.3 }), 0, 0.92, 0));
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const cz = -1.35 + i * 0.9;
    counter.add(box(0.36, 0.3, 0.8, crateM, s * 0.98, 0.55, cz));
    counter.add(box(0.3, 0.22, 0.74, std({ map: discs }), s * 0.98, 0.7, cz));
  }
  const big = crt(false, 1.4, 5); big.position.set(0.1, 0.94, 0.8); big.rotation.y = 0.1; counter.add(big);
  const mid = crt(false, 0.95, 8); mid.position.set(-0.2, 0.94, -0.7); mid.rotation.y = -0.2; counter.add(mid);
  const sm = crt(true, 0.7, 9); sm.position.set(0.3, 0.94, -1.4); counter.add(sm);
  counter.position.set(0, 0, -6.2); g.add(counter);
  solid(-1.25, 1.25, -8.1, -4.3);
  // green poster on the back wall (made up)
  const pst = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#2f8a4a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 8; c.beginPath(); c.arc(w / 2, 120, 70, 0, 7); c.stroke(); c.fillStyle = '#fff'; c.font = '34px "Archivo Black"'; c.textAlign = 'center'; c.fillText('RECYCLE', w / 2, 128); c.font = '600 22px "Oswald"'; c.fillText('WE BUY OLD TECH', w / 2, 230); });
  const ps = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), std({ map: pst })); ps.position.set(2.8, 2.6, -D + 0.02); g.add(ps);
  g.userData.colliders = colliders;
  g.userData.area = { x0: -W / 2 + 0.2, x1: W / 2 - 0.2, z0: -D + 0.2, z1: 0.4 };
  return g;
}
