// Street lamps made to look like figures, from the owner's photos (photos/10000268xx.jpg): the post is a body bent at
// the knee and hip, with pale joint caps, an arm reaching up to hold a round sign, a globe lamp for a head. The paint
// on the photographed ones carries real brands; ours is our own patterns. Also the wooden power pole they stand by.
//   makeFigureLamp({ style: 'flowers' | 'stripes' }), makeFigureLampPair, makeWoodPowerPole
import * as THREE from 'three';
import { plain, canvasT, rng } from './kit.js';

const PI = Math.PI;
const B = (w, h, d, m, x, y, z, parent, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); parent.add(o); return o; };
const C = (rt, rb, h, m, x, y, z, parent, seg = 14, rx = 0, rz = 0) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); parent.add(o); return o; };
const tube = (g, a, b, r0, m, r1 = r0, seg = 14) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = new THREE.Vector3().subVectors(Bv, A), o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, d.length(), seg), m); o.position.copy(A).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); if (m.map) { const uv = o.geometry.attributes.uv, k = d.length() / 0.9; for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) * k); }   /* (the paint keeps its size however long the limb) */ g.add(o); return o; };
const text = (x, s, cx, cy, font, col, maxW) => { x.font = font; x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, cx, cy, maxW); };
const shadows = (g) => { g.traverse((o) => { if (o.isMesh && !o.material.transparent) { o.castShadow = true; o.receiveShadow = true; } }); return g; };

// the paint on a limb: drawn once per style, wrapped round each tube
const PAINT = new Map();
function paint(style) { if (PAINT.has(style)) return PAINT.get(style); const r = rng(style.length * 7 + 3); let draw;
  if (style === 'flowers') draw = (x, w, h) => { x.fillStyle = '#3ab8c8'; x.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { const cx = r() * w, cy = r() * h, R = 10 + r() * 16, col = ['#e8d84a', '#b05ad8', '#f08aa8', '#f4f2ea', '#e87a2a'][i % 5]; for (let k = 0; k < 6; k++) { x.fillStyle = col; x.beginPath(); x.arc(cx + Math.cos(k) * R * 0.6, cy + Math.sin(k) * R * 0.6, R * 0.45, 0, 7); x.fill(); } x.fillStyle = '#2a2a6a'; x.beginPath(); x.arc(cx, cy, R * 0.35, 0, 7); x.fill(); }
    for (let i = 0; i < 7; i++) { const cx = r() * w, cy = r() * h; x.fillStyle = '#f4e8d8'; x.beginPath(); x.ellipse(cx, cy, 12, 26, r(), 0, 7); x.fill(); x.fillStyle = '#16161a'; x.beginPath(); x.ellipse(cx, cy - 18, 10, 8, 0, PI, 0); x.fill(); x.strokeStyle = '#16161a'; x.lineWidth = 2; x.stroke(); }
    x.strokeStyle = '#16161a'; x.lineWidth = 2; x.font = 'italic 22px Georgia, serif'; x.strokeText('hello', w * 0.6, h * 0.7); };
  else draw = (x, w, h) => { x.fillStyle = '#16181c'; x.fillRect(0, 0, w, h); x.fillStyle = '#f4f2ea'; for (let i = 0; i < 9; i++) { const y = i * h / 9; x.beginPath(); x.moveTo(0, y); x.lineTo(w * 0.35, y + 18); x.lineTo(w * 0.35, y + 26); x.lineTo(0, y + 8); x.fill(); } x.fillStyle = '#3ad86a'; for (let i = 0; i < 6; i++) x.fillRect(w * 0.55, i * h / 6 + 10, w * 0.12, h / 14); x.fillStyle = '#2a9ad8'; x.fillRect(w * 0.8, 0, w * 0.08, h);
    x.save(); x.translate(w * 0.46, h * 0.5); x.rotate(-PI / 2); text(x, 'NIGHT SHIFT  ·  KEEP MOVING  ·  NIGHT SHIFT', 0, 0, 'bold 26px Arial, sans-serif', '#f4f2ea', h * 0.95); x.restore(); for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(200,200,200,0.35)'; x.fillRect(r() * w, r() * h, 2 + r() * 8, 1 + r() * 4); } };
  const t = canvasT(256, 512, draw); t.wrapS = t.wrapT = THREE.RepeatWrapping; const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.45, metalness: 0.1 }); m.userData.flat = true; PAINT.set(style, m); return m; }
const cap = () => plain('#e2e0d8', { roughness: 0.5 });
const joint = (g, p, dir, r) => { const j = C(r * 1.35, r * 1.35, r * 1.1, cap(), p[0], p[1], p[2], g, 18); j.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize()); C(r * 0.9, r * 0.9, r * 1.12, plain('#c8c6be', { roughness: 0.5 }), 0, 0, 0, j, 12); return j; };

// one figure lamp. Points (in metres, x across, z toward the street): ankle on the ground, knee bent back, hip bent
// forward, a narrow chest, one arm reaching up to hold the round sign by its rim, the other hanging bent; a globe head
export function makeFigureLamp({ style = 'flowers', sign = 'flowers' } = {}) { const g = new THREE.Group(), m = paint(style), R = 0.09;
  const P = { foot: [0, 0, 0], knee: [0.05, 2.4, -0.18], hip: [-0.06, 4.2, 0.08], waist: [-0.02, 4.9, 0.02], chest: [0.04, 6.0, 0.0], neck: [0.04, 6.45, 0.0] };
  C(0.16, 0.2, 0.25, plain('#2a2c30', { roughness: 0.6, metalness: 0.3 }), 0, 0.12, 0, g, 18);
  tube(g, P.foot, P.knee, R, m, R * 0.95); joint(g, P.knee, [1, 0, 0], R); tube(g, P.knee, P.hip, R * 0.95, m, R * 1.05); joint(g, P.hip, [1, 0, 0], R); tube(g, P.hip, P.waist, R * 1.05, m, R * 0.9);
  // a second leg, close beside the first, from the hip to a bent knee that stops short (the photos have it)
  tube(g, [P.hip[0] + 0.05, P.hip[1], P.hip[2] + 0.04], [0.32, 3.4, 0.35], R * 0.75, m, R * 0.8); joint(g, [0.32, 3.4, 0.35], [0, 0, 1], R * 0.75); tube(g, [0.32, 3.4, 0.35], [0.28, 2.6, 0.1], R * 0.7, m, R * 0.75);
  // the chest: a wide tapering tube, shoulders capped
  tube(g, P.waist, P.chest, R * 1.35, m, R * 2.2, 18); const sh = [[-0.22, 5.95, 0], [0.3, 5.95, 0]]; for (const s of sh) joint(g, s, [1, 0, 0], R * 0.85);
  // the arms: the far one hanging, elbow forward; the near one reaching up to the sign
  tube(g, sh[0], [-0.28, 5.2, 0.16], R * 0.7, m); joint(g, [-0.28, 5.2, 0.16], [1, 0, 0], R * 0.7); tube(g, [-0.28, 5.2, 0.16], [-0.18, 4.65, 0.3], R * 0.65, m);
  tube(g, sh[1], [0.75, 5.55, 0.15], R * 0.7, m); joint(g, [0.75, 5.55, 0.15], [0, 1, 0], R * 0.7); tube(g, [0.75, 5.55, 0.15], [0.95, 6.15, 0.1], R * 0.65, m); C(0.07, 0.07, 0.14, m, 0.97, 6.25, 0.1, g, 12);
  // the round sign, held by its rim; lit inside
  const sg = new THREE.Group(); sg.position.set(1.15, 6.55, 0.05); sg.rotation.y = -0.4; g.add(sg); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 10, 32), plain(style === 'flowers' ? '#2a3a2a' : '#5a7a3a', { roughness: 0.4 })); sg.add(rim); C(0.42, 0.42, 0.1, plain('#e8e6de'), 0, 0, -0.03, sg, 32, PI / 2);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), new THREE.MeshBasicMaterial({ map: canvasT(256, 256, (x, w, h) => { x.fillStyle = '#f6f4ec'; x.fillRect(0, 0, w, h); if (sign === 'flowers') { text(x, 'Bloom', w / 2, 112, 'bold 52px Georgia, serif', '#3a3a3a'); text(x, 'street', w / 2, 158, 'italic 34px Georgia, serif', '#c8322a'); x.fillStyle = '#c8322a'; x.beginPath(); x.ellipse(70, 92, 12, 20, 0.6, 0, 7); x.fill(); } else { text(x, 'FLOOR', w / 2, 112, '900 48px Arial, sans-serif', '#2a5a2a'); text(x, 'SIX', w / 2, 160, '900 48px Arial, sans-serif', '#3ad86a'); } }), toneMapped: false })); face.position.z = 0.03; sg.add(face); const back = face.clone(); back.rotation.y = PI; back.position.z = -0.09; sg.add(back);
  // the neck and the head: a globe lamp in a wire cage
  tube(g, P.chest, P.neck, R * 0.6, cap()); C(0.1, 0.14, 0.1, plain('#2a2c30', { metalness: 0.4, roughness: 0.4 }), P.neck[0], 6.55, 0, g, 16); const globe = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.9, 1.7, 1.25), toneMapped: false })); globe.position.set(P.neck[0], 6.88, 0); g.add(globe);
  const wire = plain('#d8d4c8', { roughness: 0.4, metalness: 0.4 }); for (const a of [0, PI / 2]) { const c = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.008, 5, 24, PI * 1.3), wire); c.position.set(P.neck[0], 6.88, 0); c.rotation.set(0, a, PI * 0.85); g.add(c); }
  const pool = new THREE.Mesh(new THREE.CircleGeometry(3.2, 32), new THREE.MeshBasicMaterial({ map: canvasT(128, 128, (x, w, h) => { const gr = x.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, 'rgba(255,226,170,0.32)'); gr.addColorStop(1, 'rgba(255,220,160,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); pool.rotation.x = -PI / 2; pool.position.set(0.2, 0.02, 0.4); g.add(pool);   /* (its light on the ground is painted: a real light would cost every surface near it) */
  g.userData.colliders = [[-0.22, 0.22, -0.22, 0.22]]; return shadows(g); }
export function makeFigureLampPair() { const g = new THREE.Group(), a = makeFigureLamp({ style: 'flowers', sign: 'flowers' }), b = makeFigureLamp({ style: 'stripes', sign: 'floor' }); a.position.x = -2.5; b.position.x = 2.5; b.rotation.y = PI; g.add(a, b); return g; }

// a wooden power pole: cross-arms, insulators, a transformer can, wires dropping away in every direction
export function makeWoodPowerPole({ H = 11 } = {}) { const g = new THREE.Group(), wood = plain('#5a4e44', { roughness: 0.9 }), blk = plain('#1c1c1e', { roughness: 0.7 }), r = rng(5); C(0.13, 0.17, H, wood, 0, H / 2, 0, g, 14);
  for (const [y, w] of [[H - 0.3, 2.2], [H - 0.9, 1.8], [H - 2.2, 1.2]]) { B(w, 0.12, 0.12, wood, 0, y, 0, g); for (let i = 0; i < 4; i++) { const x = -w / 2 + 0.1 + i * (w - 0.2) / 3; C(0.035, 0.05, 0.14, plain('#e8e4d8', { roughness: 0.3 }), x, y + 0.13, 0, g, 10); } tube(g, [-w / 2 + 0.2, y - 0.05, 0], [0, y - 0.6, 0], 0.02, wood); tube(g, [w / 2 - 0.2, y - 0.05, 0], [0, y - 0.6, 0], 0.02, wood); }
  C(0.22, 0.22, 0.8, plain('#c8ccc8', { roughness: 0.5 }), 0.32, H - 3.3, 0, g, 16); C(0.24, 0.24, 0.05, plain('#a8aca8'), 0.32, H - 2.88, 0, g, 16); for (let i = 0; i < 3; i++) C(0.03, 0.03, 0.18, plain('#e8e4d8'), 0.22 + i * 0.1, H - 2.76, 0, g, 8); B(0.1, 0.5, 0.1, plain('#e8e6e0'), -0.2, H - 4.4, 0.1, g); for (let y = 2; y < H - 3; y += 0.45) B(0.18, 0.025, 0.025, plain('#8a8e92', { metalness: 0.5 }), 0, y, (y * 3 % 2 > 1 ? 1 : -1) * 0.16, g);
  for (let k = 0; k < 9; k++) { const a = r() * PI * 2, len = 8 + r() * 10, y0 = H - 0.3 - Math.floor(k / 3) * 0.6, y1 = y0 - 1 - r() * 2; let prev = null; for (let i = 0; i <= 8; i++) { const t = i / 8, p = [Math.cos(a) * len * t, y0 + (y1 - y0) * t - Math.sin(t * PI) * 0.5, Math.sin(a) * len * t]; if (prev) tube(g, prev, p, 0.008, blk, 0.008, 4); prev = p; } }
  g.userData.colliders = [[-0.18, 0.18, -0.18, 0.18]]; return shadows(g); }
