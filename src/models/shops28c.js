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
  const sign = canvasTex(1024, 128, (c, w, h) => {
    c.fillStyle = '#f2f0e8'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#d8323a'; c.fillRect(0, 0, w, 10);
    c.fillStyle = '#2a4aa8'; c.font = 'bold 54px Arial'; c.fillText('COLOR TV', 30, 72);
    c.fillStyle = '#1a1a1a'; c.font = 'bold 64px Arial'; c.fillText('HIKARI RADIO & TV', 380, 74);
    c.fillStyle = '#e8d24a'; c.fillRect(0, h - 30, w, 30);
    c.fillStyle = '#1a1a1a'; c.font = 'bold 22px Arial'; c.fillText('TEL 0123-45-6789', 740, h - 8);
    c.fillStyle = 'rgba(120,100,60,0.15)'; for (let i = 0; i < 60; i++) c.fillRect(Math.random() * w, Math.random() * h, 30, 2);
  });
  g.add(box(W * 0.62, 0.75, 0.12, [std({ color: '#ccc' }), std({ color: '#ccc' }), std({ color: '#ccc' }), std({ color: '#ccc' }), std({ map: sign, roughness: 0.6 }), std({ color: '#ccc' })], -W * 0.18, H1 + 0.45, 0.08));
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
      c.fillStyle = '#2a4a3a'; c.font = 'bold 40px Arial';
      if (i === 0) drawMascot(c, 210, 420, 1.3);
      if (i === 1) c.fillText('HIKARI RADIO', 110, 420);
      if (i === 3) c.fillText('HIKARI  RADIO', 90, 300);
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
export function makeVendingMachine() {
  const g = new THREE.Group();
  const white = std({ color: '#f2f1ec', roughness: 0.35 });
  g.add(box(0.75, 1.95, 0.7, white, 0, 0.975, -0.35));
  const face = canvasTex(384, 1000, (c, w, h) => {
    c.fillStyle = '#f6f5f0'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#e03a2a'; c.font = 'bold 54px Arial Black, Arial'; c.textAlign = 'center';
    c.font = 'bold 42px Arial Black, Arial'; c.fillText('NOODLE TIME', w / 2 - 28, 78);
    c.fillStyle = '#e03a2a'; c.beginPath(); c.arc(w - 32, 64, 22, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.font = 'bold 16px Arial'; c.fillText('NT', w - 32, 70);
    // food photo panel
    const gr = c.createLinearGradient(0, 640, 0, 800); gr.addColorStop(0, '#e86a3a'); gr.addColorStop(1, '#a8321e');
    c.fillStyle = gr; c.fillRect(30, 630, w - 60, 170);
    c.fillStyle = '#f6efe0'; c.beginPath(); c.ellipse(w / 2, 740, 120, 50, 0, 0, 7); c.fill();
    c.fillStyle = '#d8a050'; c.beginPath(); c.ellipse(w / 2, 720, 105, 34, 0, 0, 7); c.fill();
    const r = rng(3); for (let i = 0; i < 40; i++) { c.fillStyle = ['#e8c23a', '#c84a2a', '#5a8a3a', '#7a4a2a'][i % 4]; c.beginPath(); c.arc(w / 2 + (r() - 0.5) * 180, 720 + (r() - 0.5) * 40, 8, 0, 7); c.fill(); }
    // coin + note slots, pickup flap
    c.fillStyle = '#222'; c.fillRect(40, 560, 60, 40); c.fillStyle = '#e8762a'; c.fillRect(w - 90, 840, 40, 50);
    c.fillStyle = '#d82a2a'; c.font = 'bold 20px monospace'; c.fillText('888', 170, 588);
    c.fillStyle = '#3a3a3a'; c.beginPath(); c.ellipse(w / 2, 930, 80, 34, 0, 0, 7); c.fill();
    c.fillStyle = '#555'; c.font = '13px Arial'; c.textAlign = 'left'; c.fillText('HOT WATER INSIDE  •  250', 40, 830);
  });
  g.add(box(0.72, 1.85, 0.02, std({ map: face, roughness: 0.35 }), 0, 0.98, 0.005));
  // two lit sample windows with cups
  const cupCols = [['#e03a2a', '#fff'], ['#2a8a3a', '#fff'], ['#e8c23a', '#c8202a'], ['#2a5aa8', '#fff'], ['#f2f0e8', '#e03a2a']];
  for (const [y, n] of [[1.55, 4], [1.2, 3]]) {
    g.add(box(0.6, 0.28, 0.02, glow(1.4, 1.35, 1.2), -0.02, y, 0.008));
    for (let i = 0; i < n; i++) {
      const [a, b] = cupCols[(i + n) % cupCols.length];
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.11, 14), [std({ map: canvasTex(64, 32, (c) => { c.fillStyle = a; c.fillRect(0, 0, 64, 32); c.fillStyle = b; c.fillRect(0, 12, 64, 8); }) }), std({ color: '#eee' }), std({ color: '#eee' })]);
      cup.position.set(-0.24 + i * 0.15, y - 0.03, 0.05); g.add(cup);
      g.add(box(0.06, 0.03, 0.02, std({ color: '#ddd' }), -0.24 + i * 0.15, y - 0.13, 0.03));
    }
  }
  const l = new THREE.PointLight('#fff4e0', 1.5, 3, 2); l.position.set(0, 1.4, 0.5); g.add(l);
  g.userData.collider = [-0.4, 0.4, -0.72, 0.05];
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
  const pt = canvasTex(96, 48, (c, cw, ch) => { c.fillStyle = '#fff'; c.fillRect(0, 0, cw, ch); c.fillStyle = '#d82a2a'; c.fillRect(0, 0, cw, 12); c.font = 'bold 20px Arial'; c.fillText('¥' + (2 + Math.floor(r() * 18)) + ',800', 4, 38); });
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
    c.fillStyle = '#f6c21a'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1a'; c.font = 'bold 96px Arial Black, Arial'; c.textAlign = 'center'; c.fillText('JUNK & RETRO', w / 2 - 80, 112);
    c.fillStyle = '#d82a2a'; c.beginPath(); c.arc(w - 110, 80, 60, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = 'bold 40px Arial'; c.fillText('USED', w - 110, 94);
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
  const pst = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#2f8a4a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 8; c.beginPath(); c.arc(w / 2, 120, 70, 0, 7); c.stroke(); c.fillStyle = '#fff'; c.font = 'bold 30px Arial'; c.textAlign = 'center'; c.fillText('RECYCLE', w / 2, 128); c.font = 'bold 22px Arial'; c.fillText('WE BUY OLD TECH', w / 2, 230); });
  const ps = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), std({ map: pst })); ps.position.set(2.8, 2.6, -D + 0.02); g.add(ps);
  g.userData.colliders = colliders;
  g.userData.area = { x0: -W / 2 + 0.2, x1: W / 2 - 0.2, z0: -D + 0.2, z1: 0.4 };
  return g;
}
