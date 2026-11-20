// Street graffiti (queue item 45, photos/grime/sticker-bomb-galvanized-box, doodle-on-moldy-sign).
// Galvanized steel and the mildew speckle are from the photos; every sticker and doodle is an original design.
//   makeStickerBox()  galvanized utility box on a steel stand, flex conduit + a pipe running down into the
//     ground; sticker-bombed: a big peeling cartoon sticker (half its yellow print torn away to white backing),
//     torn round stickers, small square and word stickers, a scrap of tape.
//   makeMoldySign()   white plastic no-parking notice (generic text) speckled with mildew, a marker-drawn
//     cartoon doodle over it, on a post. Both face +z; origin at ground level.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
function tex(name, rx = 1, ry = 1) { const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t; }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.5, ...o }); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function decal(t, w, h, x, y, z, p, rz = 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), std({ map: t, transparent: true, alphaTest: 0.2, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 })); m.position.set(x, y, z); m.rotation.z = rz; p.add(m); return m; }
// ragged torn edge: erase bites out of a canvas outline
function tearEdges(x, w, h, r, n = 40, big = 18) { x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < n; i++) { const side = Math.floor(r() * 4), t = r(); const px = side < 2 ? t * w : (side === 2 ? 0 : w), py = side >= 2 ? t * h : (side === 0 ? 0 : h); x.beginPath(); x.arc(px, py, 3 + r() * big, 0, 7); x.fill(); } x.globalCompositeOperation = 'source-over'; }

// the big peeling sticker: an original round-eared bolt-shaped critter ("Volty") in yellow, the left half torn
// off leaving the white backing with grey ghost lines of the print
function peelSticker(r) {
  return canvasT(512, 640, (x, w, h) => {
    const path = () => { x.beginPath(); x.arc(170, 120, 70, 0, 7); x.moveTo(412, 120); x.arc(342, 120, 70, 0, 7); x.moveTo(256, 160); x.ellipse(256, 300, 170, 150, 0, 0, 7); x.moveTo(256, 420); x.ellipse(256, 520, 120, 100, 0, 0, 7); };
    x.fillStyle = '#111'; x.save(); x.translate(0, 0); x.lineWidth = 26; x.strokeStyle = '#111'; path(); x.stroke(); x.restore();
    x.fillStyle = '#f2c21a'; path(); x.fill();
    // face + bolt mark + belly
    x.fillStyle = '#111'; x.beginPath(); x.ellipse(205, 290, 22, 34, 0, 0, 7); x.ellipse(305, 290, 22, 34, 0, 0, 7); x.fill();
    x.lineWidth = 10; x.beginPath(); x.arc(256, 340, 46, 0.3, Math.PI - 0.3); x.stroke();
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(270, 450); x.lineTo(220, 530); x.lineTo(258, 530); x.lineTo(238, 600); x.lineTo(300, 505); x.lineTo(262, 505); x.closePath(); x.fill(); x.stroke();
    // tear the left half: white backing with faint ghost print, torn boundary down the middle
    const bound = []; for (let y = 0; y <= h; y += 16) bound.push([248 + (r() - 0.5) * 30, y]);
    x.save(); x.beginPath(); x.moveTo(0, 0); bound.forEach(([bx, by]) => x.lineTo(bx, by)); x.lineTo(0, h); x.closePath(); x.clip();
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(240,238,232,0.96)'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 120; i++) { x.fillStyle = `rgba(150,150,145,${r() * 0.3})`; x.fillRect(r() * 256, r() * h, 2 + r() * 8, 2); }
    for (let i = 0; i < 25; i++) { x.fillStyle = `rgba(242,194,26,${0.5 + r() * 0.5})`; x.beginPath(); x.arc(200 + r() * 60, r() * h, 3 + r() * 8, 0, 7); x.fill(); }   // yellow scraps clinging to the tear
    x.restore();
    tearEdges(x, w, h, r, 14, 10);
  });
}
const roundTorn = (r, col, txt) => canvasT(256, 256, (x) => { x.fillStyle = '#f2f0ea'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill(); x.fillStyle = col; x.beginPath(); x.arc(128, 128, 104, 0, 7); x.fill(); x.fillStyle = '#fff'; fitText(x, txt, 128, 132, 180, 46, F.heavy); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(236,234,226,0.97)'; x.beginPath(); x.moveTo(0, 0); x.lineTo(256, 0); x.lineTo(256, 70 + r() * 40); x.bezierCurveTo(170, 120, 90, 60, 0, 130); x.fill(); x.globalCompositeOperation = 'source-over'; tearEdges(x, 256, 256, r, 20, 12); });
const wordSticker = (txt, bg, ink, font) => canvasT(256, 96, (x) => { x.fillStyle = bg; x.fillRect(0, 0, 256, 96); x.strokeStyle = ink; x.lineWidth = 6; x.strokeRect(6, 6, 244, 84); x.fillStyle = ink; fitText(x, txt, 128, 50, 220, 60, font); });
const squareSticker = () => canvasT(128, 160, (x) => { x.fillStyle = '#111'; x.fillRect(0, 0, 128, 160); x.fillStyle = '#fff'; fitText(x, '迷子', 64, 60, 110, 60, F.brush); x.font = `16px ${F.small}`; x.textAlign = 'center'; x.fillText('LOST & FOUND', 64, 120); x.fillText('CREW', 64, 140); });

export function makeStickerBox() {
  const g = new THREE.Group(); g.name = 'sticker_box';
  const r = rng(45);
  const galv = std({ map: tex('gf_galv', 1.5, 1.2), color: '#e8ecf0', metalness: 0.55, roughness: 0.5 });
  const steel = std({ color: '#7a7e82', metalness: 0.6, roughness: 0.45 });
  const W = 1.3, H = 1.0, D = 0.5, Y = 1.1;
  box(W, H, D, galv, 0, Y + H / 2, 0, g);
  // seams + the hinge edge + the lid lip (galvanized boxes are folded sheet panels)
  for (const y of [Y + 0.34, Y + 0.68]) box(W + 0.01, 0.012, D + 0.01, galv, 0, y, 0, g);
  box(W + 0.04, 0.05, D + 0.06, galv, 0, Y + H + 0.02, 0, g);
  box(0.03, H - 0.1, 0.03, steel, -W / 2 + 0.03, Y + H / 2, D / 2 + 0.015, g);
  // stand: angle-iron legs and a cross frame
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.06, Y, 0.06, steel, sx * (W / 2 - 0.08), Y / 2, sz * (D / 2 - 0.06), g);
  box(W - 0.1, 0.06, 0.06, steel, 0, 0.35, D / 2 - 0.06, g);
  // flex conduit looping from the side down into the ground, and a grey pipe
  const cond = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-W / 2, Y + 0.25, 0.05), new THREE.Vector3(-W / 2 - 0.25, Y + 0.05, 0.1), new THREE.Vector3(-W / 2 - 0.3, 0.6, 0.1), new THREE.Vector3(-W / 2 - 0.25, 0.0, 0.05)]), 40, 0.035, 10), std({ color: '#4a4c4e', roughness: 0.6, metalness: 0.3 })); cond.castShadow = true; g.add(cond);
  const rib = new THREE.Mesh(new THREE.TubeGeometry(cond.geometry.parameters.path, 120, 0.04, 6), std({ color: '#3a3c3e', wireframe: true })); g.add(rib);
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, Y + 0.1, 16), std({ color: '#a8acae', roughness: 0.5 })); pipe.position.set(-W / 2 - 0.55, (Y + 0.1) / 2, -0.05); g.add(pipe);
  const elbow = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.06, 10, 16, Math.PI / 2), pipe.material); elbow.rotation.z = 0; elbow.position.set(-W / 2 - 0.4, Y + 0.1, -0.05); g.add(elbow);
  // stickers on the front face (+z)
  const fz = D / 2 + 0.002;
  decal(peelSticker(r), 0.42, 0.52, 0.12, Y + 0.45, fz, g, 0.04);
  decal(roundTorn(r, '#2a6ad8', 'HOP!'), 0.2, 0.2, 0.47, Y + 0.72, fz, g, 0.3);
  decal(roundTorn(rng(9), '#c81e28', 'zzz'), 0.18, 0.18, 0.44, Y + 0.25, fz, g, -0.6);
  decal(squareSticker(), 0.09, 0.11, -0.36, Y + 0.62, fz, g, 0.02);
  decal(wordSticker('SLOW NOODLE', '#fff', '#111', F.heavy), 0.18, 0.068, 0.6, Y + 0.55, fz, g, -0.05);
  decal(wordSticker('OKAYISH', '#fff', '#111', F.condensed), 0.16, 0.06, -0.4, Y + 0.2, fz, g, 0.03);
  decal(canvasT(128, 48, (x) => { x.fillStyle = 'rgba(230,226,200,0.85)'; x.fillRect(0, 0, 128, 48); tearEdges(x, 128, 48, rng(3), 10, 6); }), 0.12, 0.04, -0.15, Y + 0.9, fz, g, 0.5);
  g.userData.collider = [-W / 2 - 0.7, W / 2, -D / 2 - 0.05, D / 2 + 0.05];
  return g;
}
export function makeMoldySign() {
  const g = new THREE.Group(); g.name = 'moldy_sign';
  const r = rng(7);
  const face = canvasT(512, 680, (x, w, h) => {
    x.fillStyle = '#f2f0ea'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#e8508a'; fitText(x, '駐車禁止', w / 2, 90, w - 30, 110, F.antique, { spacing: 10 });
    x.fillStyle = '#222'; x.font = `30px ${F.antique}`; x.textAlign = 'left';
    ['ここは駐車禁止です。', 'お客様の荷物の積み下ろし', 'のための場所です。', '', '無断駐車はご遠慮ください。', 'ご協力をお願いします。'].forEach((t, i) => x.fillText(t, 30, 200 + i * 52));
    x.textAlign = 'right'; x.font = `24px ${F.antique}`; x.fillText('管理事務所', w - 30, h - 40);
    // the marker doodle: an original grinning cloud-blob with stubby arms waving, signed with a squiggle
    x.strokeStyle = '#111'; x.lineWidth = 9; x.lineCap = 'round'; x.lineJoin = 'round';
    const wob = (pts, closed) => { x.beginPath(); pts.forEach(([px, py], i) => { const q = [px + (r() - 0.5) * 6, py + (r() - 0.5) * 6]; if (!i) x.moveTo(...q); else { const [ox, oy] = pts[i - 1]; x.quadraticCurveTo((ox + px) / 2 + (r() - 0.5) * 14, (oy + py) / 2 + (r() - 0.5) * 14, ...q); } }); if (closed) x.closePath(); x.stroke(); };
    // head: a lumpy cloud
    const head = []; for (let i = 0; i <= 14; i++) { const a2 = i / 14 * Math.PI * 2, rr2 = 110 + (i % 2 ? 18 : -6) + (r() - 0.5) * 10; head.push([270 + Math.cos(a2) * rr2 * 1.05, 380 + Math.sin(a2) * rr2 * 0.9]); }
    wob(head, true); wob(head.map(([px, py]) => [px + 3, py + 2]), true);
    x.lineWidth = 6; wob([[205, 372], [228, 356], [252, 370], [228, 386], [208, 374]], true); wob([[290, 370], [314, 356], [338, 372], [314, 388], [292, 372]], true);
    x.fillStyle = '#111'; x.beginPath(); x.arc(232, 372, 6, 0, 7); x.arc(318, 374, 6, 0, 7); x.fill();
    wob([[225, 425], [250, 448], [282, 452], [312, 440], [330, 418]]); wob([[262, 452], [268, 470], [280, 452]]);
    x.lineWidth = 8; wob([[180, 460], [140, 520], [118, 560], [140, 580], [160, 560]]); wob([[360, 460], [400, 515], [432, 548], [412, 572], [392, 552]]);
    x.lineWidth = 5; wob([[200, 610], [228, 580], [250, 620], [282, 590], [300, 618], [330, 595]]);
    // mildew from the photo, two overlapping placements + rot along the bottom edge
    x.strokeStyle = 'rgba(0,0,0,0)';
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), std({ map: face, roughness: 0.4 })); m.position.set(0, 1.55, 0.026); g.add(m);
  const mil = tex('gf_mildew', 1, 1.3);
  const mm = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), std({ map: mil, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); mm.position.set(0, 1.55, 0.027); g.add(mm);
  const drip = canvasT(64, 256, (x) => { x.clearRect(0, 0, 64, 256); for (let i = 0; i < 4; i++) { x.strokeStyle = `rgba(40,42,34,${0.25 + Math.random() * 0.3})`; x.lineWidth = 2 + Math.random() * 3; x.beginPath(); let px = 12 + Math.random() * 40; x.moveTo(px, 0); for (let y = 0; y < 60 + Math.random() * 190; y += 12) { px += (Math.random() - 0.5) * 3; x.lineTo(px, y); } x.stroke(); } });
  const dm = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.4), std({ map: drip, transparent: true, depthWrite: false })); dm.position.set(0.12, 1.2, 0.028); g.add(dm);
  const edge = canvasT(512, 680, (x) => { const gg = x.createLinearGradient(0, 680, 0, 380); gg.addColorStop(0, 'rgba(50,52,40,0.55)'); gg.addColorStop(1, 'rgba(50,52,40,0)'); x.fillStyle = gg; x.fillRect(0, 0, 512, 680); for (let i = 0; i < 1600; i++) { x.fillStyle = `rgba(30,32,26,${Math.random() * 0.7})`; const y = 680 - Math.pow(Math.random(), 2.2) * 420; x.beginPath(); x.arc(Math.random() * 512, y, 0.6 + Math.random() * 2.2, 0, 7); x.fill(); } });
  const em = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), std({ map: edge, transparent: true, depthWrite: false })); em.position.set(0, 1.55, 0.0275); g.add(em);
  box(0.62, 0.82, 0.04, std({ color: '#e8e6e0', roughness: 0.5 }), 0, 1.55, 0, g);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.95, 12), std({ color: '#8a8e90', metalness: 0.5 })); post.position.set(0, 0.975, -0.04); post.castShadow = true; g.add(post);
  g.userData.collider = [-0.1, 0.1, -0.1, 0.05];
  return g;
}
