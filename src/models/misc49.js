// Misc batch 2 (queue item 49, photos/misc2/). Brand names made up.
//   makeFoldingEbike()  black 20" folding e-bike (folding-ebike-rack.jpg): fat 20 x 3 tyres on black spoked
//     rims, disc brakes, the big oval downtube with the battery and hinge, a tall folding stem and riser bars,
//     sprung seatpost + wide saddle, a rear rack, mudguards, kickstand, headlight; made-up "VOLTFOLD" decal.
//   makeWaveRack()      the wave-shaped steel bike rack it's locked to (three loops, bolted feet).
//   makePourGrid()      the user's eight pour-painted canvases hung as a 2 x 4 grid (the photo is of all eight).
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';
import { makeCanvas } from './props.js';

function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.5, ...o }); }
function tube(pts, r, mat, p, seg = 24, closed = false) { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed), seg, r, 10, closed), mat); m.castShadow = true; p.add(m); return m; }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; }
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);

function wheel(g, x, R, blk, alu) {
  const w = new THREE.Group(); w.position.set(x, R, 0); g.add(w);
  const tyre = new THREE.Mesh(new THREE.TorusGeometry(R - 0.04, 0.04, 14, 40), std({ color: '#141414', roughness: 0.9 })); w.add(tyre);
  const stripe = new THREE.Mesh(new THREE.TorusGeometry(R - 0.06, 0.004, 6, 40), std({ color: '#c8ccd0' })); stripe.position.z = 0.035; w.add(stripe);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R - 0.085, 0.012, 8, 40), blk); w.add(rim);
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, s = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, R - 0.11, 4), alu); s.position.set(Math.cos(a) * (R - 0.11) / 2, Math.sin(a) * (R - 0.11) / 2, (i % 2 ? 1 : -1) * 0.01); s.rotation.z = a - Math.PI / 2; w.add(s); }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 16), blk); hub.rotation.x = Math.PI / 2; w.add(hub);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.003, 28), std({ color: '#b8bcc0', metalness: 0.85, roughness: 0.3 })); disc.rotation.x = Math.PI / 2; disc.position.z = -0.045; w.add(disc);
  return w;
}
export function makeFoldingEbike() {
  const g = new THREE.Group(); g.name = 'folding_ebike';
  const blk = std({ color: '#151517', roughness: 0.35, metalness: 0.3 }), alu = std({ color: '#9a9ea2', metalness: 0.8, roughness: 0.3 });
  const R = 0.255, xF = 0.52, xR = -0.5;
  wheel(g, xF, R, blk, alu); wheel(g, xR, R, blk, alu);
  // the big oval downtube with the battery inside, the fold hinge in the middle, decal
  const dt = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.52, 6, 14), blk); dt.scale.set(1, 1, 0.75); dt.rotation.z = Math.PI / 2 - 0.12; dt.position.set(0.05, 0.47, 0); dt.castShadow = true; g.add(dt);
  box(0.05, 0.1, 0.1, alu, 0.06, 0.47, 0, g);
  const dec = document.createElement('canvas'); dec.width = 512; dec.height = 96; const x = dec.getContext('2d'); x.clearRect(0, 0, 512, 96); x.fillStyle = '#5a5c60'; fitText(x, 'VOLTFOLD', 256, 50, 440, 64, F.wayfind, { spacing: 18 });
  const dtx = new THREE.CanvasTexture(dec); dtx.colorSpace = THREE.SRGBColorSpace;
  for (const s of [-1, 1]) { const d = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.06), std({ map: dtx, transparent: true })); d.position.set(-0.05, 0.475, s * 0.035); d.rotation.z = -0.12; if (s < 0) d.rotation.y = Math.PI; g.add(d); }
  // head tube + tall folding stem + riser bar, grips, display, brake levers, headlight
  tube([V(xF - 0.06, 0.52), V(xF - 0.09, 0.66)], 0.028, blk, g, 4);
  tube([V(xF - 0.09, 0.66), V(xF - 0.11, 1.0)], 0.02, blk, g, 4);
  box(0.03, 0.05, 0.06, alu, xF - 0.1, 0.8, 0, g);
  tube([V(xF - 0.11, 1.0, -0.3), V(xF - 0.12, 1.02, 0), V(xF - 0.11, 1.0, 0.3)], 0.012, blk, g, 12);
  for (const s of [-1, 1]) { const gp = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.12, 12), std({ color: '#222', roughness: 0.9 })); gp.rotation.x = Math.PI / 2; gp.position.set(xF - 0.11, 1.0, s * 0.26); g.add(gp); tube([V(xF - 0.1, 1.0, s * 0.2), V(xF - 0.03, 0.98, s * 0.25)], 0.005, blk, g, 3); }
  box(0.05, 0.04, 0.07, std({ color: '#111', emissive: '#203a20', emissiveIntensity: 0.4 }), xF - 0.09, 1.04, -0.08, g);
  const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.05, 16), blk); hl.rotation.z = Math.PI / 2; hl.position.set(xF - 0.02, 0.64, 0); g.add(hl);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), std({ color: '#e8eef2', emissive: '#404040' })); lens.rotation.y = Math.PI / 2; lens.position.set(xF + 0.006, 0.64, 0); g.add(lens);
  // fork, chainstay/seatstay, seat tube, sprung post, saddle
  for (const s of [-1, 1]) tube([V(xF - 0.06, 0.52, s * 0.05), V(xF, R, s * 0.05)], 0.014, blk, g, 3);
  tube([V(-0.17, 0.45), V(-0.23, 0.78)], 0.026, blk, g, 3);
  for (const s of [-1, 1]) { tube([V(-0.17, 0.3, s * 0.045), V(xR, R, s * 0.045)], 0.012, blk, g, 3); tube([V(-0.2, 0.55, s * 0.04), V(xR, R, s * 0.045)], 0.01, blk, g, 3); }
  tube([V(-0.23, 0.78), V(-0.25, 0.88)], 0.016, alu, g, 3);
  const spring = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.004, 6, 12), alu); spring.rotation.x = Math.PI / 2; spring.position.set(-0.235, 0.82, 0); g.add(spring);
  const saddle = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), std({ color: '#121212', roughness: 0.7 })); saddle.scale.set(0.15, 0.04, 0.11); saddle.position.set(-0.24, 0.91, 0); saddle.castShadow = true; g.add(saddle);
  // crank, chainring, pedals, chain
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.01, 28), blk); ring.rotation.x = Math.PI / 2; ring.position.set(-0.13, 0.3, 0.06); g.add(ring);
  for (const s of [-1, 1]) { box(0.02, 0.16, 0.015, blk, -0.13, 0.3 - s * 0.07, s * 0.08, g); box(0.1, 0.02, 0.06, blk, -0.13, 0.3 - s * 0.15, s * 0.11, g); }
  tube([V(-0.13, 0.39, 0.06), V(xR, R + 0.04, 0.06)], 0.004, std({ color: '#333' }), g, 3); tube([V(-0.13, 0.21, 0.06), V(xR, R - 0.04, 0.06)], 0.004, std({ color: '#333' }), g, 3);
  // rear rack + mudguards + kickstand
  for (const s of [-1, 1]) { tube([V(-0.2, 0.6, s * 0.08), V(-0.65, 0.6, s * 0.08)], 0.008, blk, g, 3); tube([V(-0.6, 0.6, s * 0.08), V(xR, R, s * 0.06)], 0.007, blk, g, 3); }
  for (let i = 0; i < 4; i++) tube([V(-0.25 - i * 0.12, 0.6, -0.08), V(-0.25 - i * 0.12, 0.6, 0.08)], 0.006, blk, g, 2);
  for (const [xc, a0, a1] of [[xF, 0.15, 1.9], [xR, 1.2, 2.9]]) { const pts = []; for (let i = 0; i <= 14; i++) { const a = a0 + (a1 - a0) * i / 14; pts.push(V(xc + Math.cos(a) * (R + 0.04), R + Math.sin(a) * (R + 0.04))); } const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.035, 6), blk); m.scale.z = 1.3; g.add(m); }
  tube([V(-0.3, 0.27, -0.06), V(-0.42, 0.0, -0.14)], 0.008, blk, g, 3);
  g.rotation.x = 0.07;
  return g;
}
export function makeWaveRack() {
  const g = new THREE.Group(); g.name = 'wave_rack';
  const m = std({ color: '#1a1716', roughness: 0.45, metalness: 0.5 });
  const pts = [V(0, 0)]; for (let i = 0; i <= 60; i++) { const t = i / 60, xx = t * 1.1; pts.push(V(xx, 0.08 + 0.75 * Math.abs(Math.sin(t * Math.PI * 2.5)) ** 0.6)); } pts.push(V(1.1, 0));
  tube(pts, 0.024, m, g, 160);
  for (const xx of [0, 1.1]) { const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 16), std({ color: '#5a3a2a', roughness: 0.8 })); foot.position.set(xx, 0.005, 0); g.add(foot); }
  return g;
}
export function makePourGrid() {
  const g = new THREE.Group(); g.name = 'pour_grid';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) { const cv = makeCanvas(`canvas_pour_${r * 2 + c + 1}.png`, 0.4, 0.2, 0.03); cv.position.set((c - 0.5) * 0.43, (1.5 - r) * 0.23, 0); g.add(cv); }
  return g;
}
