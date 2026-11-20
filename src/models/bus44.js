// Short yellow school bus (queue item 44, photos/vehicles/short-school-bus-rear1..3). 7.0 m x 2.35 m x 2.85 m.
// The photos show the rear and the right side from behind, so: the rounded rear (domed roof falling into the
// back, three windows — two wide in the back, a narrow one wrapping the corner — black rub rails, twin round
// red tail lamps each side, a roof marker lamp), the window band of the passenger box, mud flaps and the paint
// colour are from the photos; the cab (a cutaway-van front with hood, grille, headlights, wipers), the left
// side and the made-up "DISTRICT 6" lettering are invented to match. The window writing and campaign banners
// in the photos are replaced by a hand-painted "GO TIGERS!" and a generic "SCHOOL BUS / STOP" on the back.
// No plates. Nose toward +x, ground y = 0.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.45, ...o }); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(r, h, mat, p, seg = 20) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat); m.castShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
const YEL = '#e5a737';

export function makeSchoolBus() {
  const g = new THREE.Group(); g.name = 'school_bus';
  const W = 2.35, hw = W / 2, R = 0.42;
  const BX0 = -3.5, BX1 = 1.6;             // passenger box (rear at BX0)
  const yb = 0.62, yt = 2.85, rr = 0.42;   // box bottom / top, roof edge radius
  const paint = std({ color: YEL, roughness: 0.4 });
  const black = std({ color: '#151515', roughness: 0.6 });
  // ---- passenger box: rounded-roof cross-section extruded along x; the rear end is domed (a scaled half
  // capsule in plan) so the roof rolls down into the back like the photo
  const sec = new THREE.Shape();
  sec.moveTo(-hw, yb); sec.lineTo(hw, yb); sec.lineTo(hw, yt - rr); sec.quadraticCurveTo(hw, yt, hw - rr, yt); sec.lineTo(-hw + rr, yt); sec.quadraticCurveTo(-hw, yt, -hw, yt - rr); sec.closePath();
  const L = BX1 - BX0;
  const bg = new THREE.ExtrudeGeometry(sec, { depth: L, bevelEnabled: false, curveSegments: 10 }); bg.rotateY(Math.PI / 2); bg.translate(BX0, 0, 0);
  const body = new THREE.Mesh(bg, paint); body.castShadow = true; body.receiveShadow = true; g.add(body);
  // rear: the section swept round a quarter-circle in plan (depth 0.35) — the domed back
  const rpos = [], ridx = [], N = 12, sp = sec.getPoints(10);
  for (let i = 0; i <= N; i++) { const a = (i / N) * Math.PI / 2, d = 0.35 * Math.sin(a), s = Math.cos(a);
    for (const p of sp) { const yy = yb + (p.y - yb) * (0.92 + 0.08 * s) - (1 - s) * Math.max(0, p.y - (yt - 0.8)) * 0.35; rpos.push(BX0 - d, yy, p.x * (0.9 + 0.1 * s)); } }
  const M = sp.length; for (let i = 0; i < N; i++) for (let j = 0; j < M - 1; j++) { const a = i * M + j, b = a + M; ridx.push(a, a + 1, b, b, a + 1, b + 1); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(rpos, 3)); rg.setIndex(ridx); rg.computeVertexNormals();
  const rear = new THREE.Mesh(rg, std({ color: YEL, roughness: 0.4, side: THREE.DoubleSide })); rear.castShadow = true; g.add(rear);
  // rear face (flat panel inside the dome rim): the back windows, emergency door split, lamps, lettering
  const back = canvasT(512, 512, (x, w, h) => {
    x.fillStyle = YEL; x.fillRect(0, 0, w, h);
    const glass = (x0, y0, ww, hh, rad) => { x.fillStyle = '#111'; x.beginPath(); x.roundRect(x0 - 8, y0 - 8, ww + 16, hh + 16, rad + 6); x.fill(); const gg = x.createLinearGradient(0, y0, 0, y0 + hh); gg.addColorStop(0, '#7a8a98'); gg.addColorStop(1, '#2a3036'); x.fillStyle = gg; x.beginPath(); x.roundRect(x0, y0, ww, hh, rad); x.fill(); };
    glass(40, 60, 200, 120, 40); glass(272, 60, 200, 120, 18);
    x.fillStyle = '#7ad0f0'; x.font = `44px ${F.marker}`; x.textAlign = 'center'; x.fillText('GO', 140, 110); x.fillText('TIGERS!', 140, 160); x.fillText('HAVE A', 372, 110); x.fillText('NICE DAY', 372, 160);
    x.strokeStyle = 'rgba(0,0,0,0.5)'; x.lineWidth = 3; x.strokeRect(255, 30, 2, 470);                                                   // emergency door split
    x.fillStyle = '#111'; x.fillRect(0, 222, w, 22); x.fillRect(0, 404, w, 26);                                                          // rub rails
    x.fillStyle = '#111'; fitText(x, 'SCHOOL BUS', 256, 280, 360, 44, F.heavy, { spacing: 4 });
    x.fillStyle = '#e8e2d0'; x.fillRect(196, 316, 120, 64); x.strokeStyle = '#111'; x.strokeRect(196, 316, 120, 64);   // blank plate holder
    x.fillStyle = '#111'; x.fillRect(376, 330, 50, 10);                                                                                   // door handle
    for (const s of [0, 1]) for (const k of [0, 1]) { const cx = s ? 430 + k * 44 : 38 + k * 44; const gr = x.createRadialGradient(cx - 6, 300, 2, cx, 304, 20); gr.addColorStop(0, '#ff8a7a'); gr.addColorStop(0.6, '#b8141a'); gr.addColorStop(1, '#5a0408'); x.fillStyle = '#222'; x.beginPath(); x.arc(cx, 304, 23, 0, 7); x.fill(); x.fillStyle = gr; x.beginPath(); x.arc(cx, 304, 19, 0, 7); x.fill(); }
    x.fillStyle = '#111'; fitText(x, 'STOP WHEN RED LIGHTS FLASH', 256, 470, 400, 22, F.label, { spacing: 2 });
  });
  const bp = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.9 - 0.1, yt - yb - 0.5), std({ map: back, roughness: 0.4 })); bp.rotation.y = -Math.PI / 2; bp.position.set(BX0 - 0.345, yb + (yt - yb - 0.5) / 2, 0); g.add(bp);
  const marker = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), std({ color: '#c81e28', emissive: '#400000' })); marker.position.set(BX0 - 0.2, yt - 0.18, 0); g.add(marker);
  // ---- sides: window band (the photo's square windows with black surrounds), rub rails, lettering
  const side = (flip) => canvasT(1024, 512, (x, w, h) => {
    x.fillStyle = YEL; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) { const x0 = 40 + i * 162; x.fillStyle = '#111'; x.beginPath(); x.roundRect(x0 - 6, 70, 150, 150, 14); x.fill(); const gg = x.createLinearGradient(0, 76, 0, 214); gg.addColorStop(0, '#8a9aa8'); gg.addColorStop(1, '#2a3036'); x.fillStyle = gg; x.beginPath(); x.roundRect(x0, 76, 138, 138, 10); x.fill(); x.fillStyle = '#111'; x.fillRect(x0, 140, 138, 6); }
    x.fillStyle = '#111'; for (const y of [250, 340, 470]) x.fillRect(0, y, w, 16);
    x.save();
    x.fillStyle = '#111'; fitText(x, 'UNIFIED SCHOOL DISTRICT 6', w / 2, 300, w - 200, 52, F.heavy, { spacing: 4 }); x.restore();
    if (flip) { x.fillStyle = '#7ad0f0'; x.font = `40px ${F.marker}`; x.textAlign = 'center'; x.fillText('GO', w - 112, 130); x.fillText('TIGERS!', w - 112, 172); }
  });
  for (const s of [-1, 1]) { const sp2 = new THREE.Mesh(new THREE.PlaneGeometry(L, yt - rr - yb), std({ map: side(s > 0), roughness: 0.4 })); sp2.position.set((BX0 + BX1) / 2, yb + (yt - rr - yb) / 2, s * (hw + 0.004)); if (s < 0) sp2.rotation.y = Math.PI; g.add(sp2); }
  // ---- cab: cutaway-van front: lower, narrower, hood sloping to a grille
  const cab = new THREE.Shape(); cab.moveTo(BX1, yb); cab.lineTo(BX1 + 1.25 - 0.5, yb); cab.absarc(BX1 + 1.25, R, 0.5, Math.PI - 0.5, 0.5, true); cab.lineTo(BX1 + 1.9, yb); cab.lineTo(BX1 + 1.9, 1.15); cab.quadraticCurveTo(BX1 + 1.88, 1.35, BX1 + 1.55, 1.42); cab.lineTo(BX1 + 0.9, 1.55); cab.lineTo(BX1 + 0.35, 2.45); cab.lineTo(BX1, 2.6); cab.closePath();
  const cg = new THREE.ExtrudeGeometry(cab, { depth: W - 0.16, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4, curveSegments: 8 }); cg.translate(0, 0, -(W - 0.16) / 2);
  const cabM = new THREE.Mesh(cg, std({ color: YEL, roughness: 0.4 })); cabM.castShadow = true; g.add(cabM);
  const glassM = std({ color: '#2a3238', roughness: 0.1, metalness: 0.4 });
  { const a = [BX1 + 0.9 + 0.075, 1.6], b = [BX1 + 0.35 + 0.075, 2.5], zz = hw - 0.14;
    const q = new THREE.BufferGeometry(); q.setAttribute('position', new THREE.Float32BufferAttribute([a[0], a[1], -zz, a[0], a[1], zz, b[0], b[1], -zz, b[0], b[1], zz], 3)); q.setIndex([0, 1, 2, 1, 3, 2]); q.computeVertexNormals();
    g.add(new THREE.Mesh(q, std({ color: '#2a3238', roughness: 0.1, metalness: 0.4, side: THREE.DoubleSide }))); }
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.55), glassM); sw.position.set(BX1 + 0.32, 2.0, s * (hw - 0.08 + 0.065)); if (s < 0) sw.rotation.y = Math.PI; g.add(sw); }
  const grille = canvasT(512, 256, (x, w, h) => { x.fillStyle = '#d8dadc'; x.fillRect(0, 0, w, h); x.fillStyle = '#1a1a1a'; x.fillRect(130, 60, 252, 120); x.fillStyle = '#9a9ca0'; for (let i = 0; i < 8; i++) x.fillRect(130, 66 + i * 15, 252, 4);
    for (const cx of [60, 452]) { const gg = x.createRadialGradient(cx - 8, 110, 4, cx, 118, 46); gg.addColorStop(0, '#fffbe8'); gg.addColorStop(1, '#8a8a80'); x.fillStyle = '#222'; x.beginPath(); x.arc(cx, 118, 50, 0, 7); x.fill(); x.fillStyle = gg; x.beginPath(); x.arc(cx, 118, 42, 0, 7); x.fill(); } });
  const gp = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.2, 0.52), std({ map: grille, roughness: 0.3, metalness: 0.3 })); gp.rotation.y = Math.PI / 2; gp.position.set(BX1 + 1.965, 0.9, 0); g.add(gp);
  box(0.18, 0.22, W + 0.06, black, BX1 + 1.98, yb + 0.02, 0, g);                       // front bumper
  box(0.16, 0.2, W + 0.02, black, BX0 - 0.37, yb + 0.02, 0, g);                         // rear bumper
  for (const z of [-0.4, 0.35]) box(0.02, 0.015, 0.55, black, BX1 + 0.92, 1.57, z, g).rotation.y = 0.2;
  // mirrors on long arms, stop-arm on the left, amber + red warning lamps on the front cap
  for (const s of [-1, 1]) { box(0.05, 0.05, 0.4, black, BX1 + 0.6, 1.9, s * (hw + 0.2), g); box(0.08, 0.32, 0.18, black, BX1 + 0.62, 1.8, s * (hw + 0.42), g); }
  const stopArm = canvasT(256, 256, (x) => { x.fillStyle = '#c81e28'; x.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; x.lineTo(128 + Math.cos(a) * 120, 128 + Math.sin(a) * 120); } x.fill(); x.fillStyle = '#fff'; fitText(x, 'STOP', 128, 132, 200, 80, F.heavy); });
  const sa = new THREE.Mesh(new THREE.CircleGeometry(0.22, 8), std({ map: stopArm, side: THREE.DoubleSide })); sa.position.set(BX1 - 0.2, 1.7, -hw - 0.03); sa.rotation.y = Math.PI; g.add(sa);
  for (const s of [-1, 1]) for (const [dz, c] of [[0.85, '#f08a10'], [0.6, '#c81e28']]) { const l = cyl(0.07, 0.04, std({ color: c, emissive: c, emissiveIntensity: 0.15 }), g, 16); l.rotation.z = Math.PI / 2; l.position.set(BX1 + 0.02, 2.48, s * dz); }
  // ---- wheels (duals at the back), mud flaps, skirt
  const tyre = std({ color: '#161616', roughness: 0.9 }), rim = std({ color: '#c8ccd0', metalness: 0.6, roughness: 0.35 });
  for (const [ax, tw] of [[BX1 + 1.25, 0.24], [BX0 + 1.2, 0.48]]) for (const s of [-1, 1]) {
    const t = cyl(R, tw, tyre, g, 28); t.rotation.x = Math.PI / 2; t.position.set(ax, R, s * (hw - tw / 2 - 0.02));
    const rm = new THREE.Mesh(new THREE.CircleGeometry(R * 0.6, 24), rim); rm.position.set(ax, R, s * (hw - 0.019)); if (s < 0) rm.rotation.y = Math.PI; g.add(rm);
  }
  for (const s of [-1, 1]) { box(0.02, 0.36, 0.3, black, BX0 + 0.55, 0.32, s * (hw - 0.2), g); const wl = new THREE.Mesh(new THREE.CircleGeometry(0.52, 24, 0, Math.PI), black); wl.position.set(BX0 + 1.2, yb - 0.08, s * (hw + 0.006)); if (s < 0) wl.rotation.y = Math.PI; g.add(wl); }
  box(L + 1.8, 0.3, W - 0.3, std({ color: '#1e1e1e' }), (BX0 + BX1 + 1.8) / 2, 0.52, 0, g);
  return g;
}
