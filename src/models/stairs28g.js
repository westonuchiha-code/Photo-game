// Narrow stair entrance to an upstairs Go club (28g, from photos/city/stairway-sign-entrance.jpg).
// All names and notices are made up; no phone numbers.
//   makeStairEntrance()  a three-storey city building:
//     entrance   1.4 m opening between a left pier of weathered orange brick over charcoal textured
//                brick (both cropped straight from the photo) and a right pier of white glazed tile
//                peeling to old yellow tile over beige tile with rust drips
//     signs      a rust-framed cream lightbox over the opening (big red BADUK, a blue stacked
//                CLUB, opening hours instead of a phone number), a tall lit vertical sign on the
//                right pier with a Go board and stones, a red sign band for the tile shop next door
//                and a blue 2F panel
//     street     a big stainless pole with an address plate, cable bundles strapped to it, layers
//                of torn stickers; a beige meter box on the dark brick wall with cables sagging
//                across; speckled pavers with gum spots, a stained concrete apron
//     stair      22 worn terrazzo steps (texture from the photo) between a rough plaster wall with
//                a grimy dado and a steel rail on brackets, and a wall with a wooden rail; a riser
//                sign, a taped paper notice, a fluorescent tube and a bare bulb; a landing with
//                the club's door (frosted glass, Go-board plate), a mat, a slipper rack, umbrellas
//     neighbours a lit tile shop with sample boards in the window and a wire rack outside; a
//                white nook with a fire-alarm box on the right
//     upstairs   dark brick, aluminium windows (club decals on 2F, blinds on 3F), an AC unit on a
//                bracket, a drain pipe, a parapet
// Faces +z, origin at ground level in the middle of the entrance; the stair rises toward -z.
// userData: colliders [[x0,x1,z0,z1]], floorY(x, z) (null outside the stair), area (stair rect)
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

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
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.75, ...o });
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
function cable(pts, r, mat) {
  const c = new THREE.CatmullRomCurve3(pts.map((p) => V(...p)));
  const m = new THREE.Mesh(new THREE.TubeGeometry(c, Math.max(16, pts.length * 12), r, 6), mat);
  m.castShadow = true;
  return m;
}
// a plane showing a texture
function face(w, h, mat, x, y, z, ry = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true;
  return m;
}
const rep = (name, rx, ry, o = {}) => std({ map: ptex(name, rx, ry), ...o });

// rust streaks + flaking paint on a steel sign frame
function rustFrameTex() {
  return canvasTex(512, 64, (c, w, h) => {
    const r = rng(4);
    c.fillStyle = '#c9c4b8'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      c.fillStyle = `rgba(${120 + r() * 60},${50 + r() * 30},${20 + r() * 15},${0.25 + r() * 0.5})`;
      const x = r() * w; c.fillRect(x, r() * h * 0.5, 2 + r() * 14, 6 + r() * h);
    }
    for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(70,40,20,${0.3 + r() * 0.4})`; c.beginPath(); c.arc(r() * w, r() * h, 1 + r() * 4, 0, 7); c.fill(); }
  });
}

// ------------------------------------------------------------------ signs
function lightboxTex() {
  return canvasTex(1300, 300, (c, w, h) => {
    const r = rng(17);
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#f1ead9'); g.addColorStop(1, '#e4dac4');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    // stacked blue "CLUB" at the left, like the photo's stacked place name
    c.fillStyle = '#26368a';
    ['C', 'L', 'U', 'B'].forEach((ch, i) => fitText(c, ch, 70, 46 + i * 66, 80, 64, F.heavy));
    // big red name
    c.fillStyle = '#d42a3a';
    fitText(c, 'BADUK', 720, 120, 900, 190, F.heavy, { spacing: 30 });
    c.fillStyle = '#26368a';
    fitText(c, 'OPEN 12:00 — 24:00  ·  2F', 760, 250, 760, 56, F.label, { spacing: 4 });
    // grime + rust bleeding down from the top right corner
    for (let i = 0; i < 60; i++) {
      const x = w * (0.55 + r() * 0.45), y0 = r() * 20, len = 40 + r() * 220;
      const gg = c.createLinearGradient(0, y0, 0, y0 + len);
      gg.addColorStop(0, `rgba(150,70,25,${0.25 + r() * 0.35})`); gg.addColorStop(1, 'rgba(150,70,25,0)');
      c.fillStyle = gg; c.fillRect(x, y0, 2 + r() * 8, len);
    }
    for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(60,50,40,${r() * 0.06})`; c.fillRect(r() * w, r() * h, 2 + r() * 10, 2 + r() * 10); }
  });
}
// A proper 19 x 19 Go board drawn in perspective: kaya-wood top with grain, 19 lines each way
// (heavier border line), the nine star points, the board's front edge, and stones sitting exactly
// on intersections in a believable opening (no overlaps). elev = how steeply we look down
// (90 = straight down). Returns a function mapping (col,row) -> screen point, for hands etc.
const GO_POSITION = {
  // [col, row], col 0..18 left->right, row 0..18 far->near. A standard opening with a fight
  // starting in the lower right.
  black: [[15, 3], [16, 15], [9, 15], [3, 15], [14, 13], [13, 16], [2, 9], [15, 9]],
  white: [[3, 3], [3, 16], [14, 16], [15, 13], [12, 14], [16, 6], [5, 2]],
};
function goBoard(c, x, y, w, h, { elev = 45, edge = true } = {}) {
  const el = elev * Math.PI / 180, dist = 3.2;
  const C = [0, Math.sin(el) * dist, Math.cos(el) * dist];          // camera, looking at the board centre
  const fl = Math.hypot(C[1], C[2]), f = [0, -C[1] / fl, -C[2] / fl];
  const up = [0, -f[2], f[1]];
  const proj = (X, Y, Z) => {
    const d = [X - C[0], Y - C[1], Z - C[2]];
    const fd = d[0] * f[0] + d[1] * f[1] + d[2] * f[2];
    return [d[0] / fd, -(d[1] * up[1] + d[2] * up[2]) / fd, fd];
  };
  const S = 0.5, T = 0.09;                                            // half size, board thickness
  const corners = [[-S, 0, -S], [S, 0, -S], [S, 0, S], [-S, 0, S], [-S, -T, S], [S, -T, S]].map((p) => proj(...p));
  const minX = Math.min(...corners.map((p) => p[0])), maxX = Math.max(...corners.map((p) => p[0]));
  const minY = Math.min(...corners.map((p) => p[1])), maxY = Math.max(...corners.map((p) => p[1]));
  const k = Math.min(w / (maxX - minX), h / (maxY - minY));
  const ox = x + (w - (maxX - minX) * k) / 2 - minX * k, oy = y + (h - (maxY - minY) * k) / 2 - minY * k;
  const P = (X, Y, Z) => { const q = proj(X, Y, Z); return [ox + q[0] * k, oy + q[1] * k, q[2]]; };
  const M = 0.045, step = (2 * S - 2 * M) / 18;                       // margin outside the outer lines
  const at = (col, row, Y = 0) => P(-S + M + col * step, Y, -S + M + row * step);
  const poly = (pts) => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); };
  c.save();
  // front edge of the block, then the top with wood grain
  if (edge) { poly([P(-S, 0, S), P(S, 0, S), P(S, -T, S), P(-S, -T, S)]); c.fillStyle = '#b8873e'; c.fill(); }
  poly([P(-S, 0, -S), P(S, 0, -S), P(S, 0, S), P(-S, 0, S)]);
  c.fillStyle = '#e0b866'; c.fill();
  c.save(); c.clip();
  for (let i = 0; i < 40; i++) {
    const X = -S + (i / 40) * 2 * S;
    const a = P(X, 0, -S), b = P(X + 0.02 * Math.sin(i * 1.7), 0, S);
    c.strokeStyle = `rgba(150,100,40,${0.08 + 0.08 * Math.abs(Math.sin(i * 2.3))})`; c.lineWidth = 1 + (i % 3);
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
  }
  c.restore();
  // 19 x 19 lines
  c.strokeStyle = '#2b1d0e';
  for (let i = 0; i < 19; i++) {
    c.lineWidth = i === 0 || i === 18 ? Math.max(1.2, k * 0.004) : Math.max(0.6, k * 0.0022);
    let a = at(i, 0), b = at(i, 18); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
    a = at(0, i); b = at(18, i); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
  }
  c.fillStyle = '#2b1d0e';
  for (const cc of [3, 9, 15]) for (const rr of [3, 9, 15]) {
    const p = at(cc, rr), r = Math.max(1.0, step * 0.11 * k / p[2]);
    c.beginPath(); c.ellipse(p[0], p[1], r, r * Math.sin(el), 0, 0, 7); c.fill();
  }
  // stones: radius just under half the spacing, squashed by the view angle, drawn far-to-near
  const stones = [...GO_POSITION.black.map((s2) => [...s2, 'b']), ...GO_POSITION.white.map((s2) => [...s2, 'w'])].sort((a, b) => a[1] - b[1]);
  for (const [cc, rr, col] of stones) {
    const p = at(cc, rr, 0.008);
    const rx = step * 0.48 * k / p[2], ry = rx * (0.35 + 0.65 * Math.sin(el));
    c.fillStyle = 'rgba(40,25,10,0.35)'; c.beginPath(); c.ellipse(p[0] + rx * 0.12, p[1] + ry * 0.35, rx, ry, 0, 0, 7); c.fill();
    const g = c.createRadialGradient(p[0] - rx * 0.35, p[1] - ry * 0.45, rx * 0.05, p[0], p[1], rx);
    if (col === 'b') { g.addColorStop(0, '#6a6a6a'); g.addColorStop(0.35, '#202020'); g.addColorStop(1, '#0a0a0a'); }
    else { g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#eceae4'); g.addColorStop(1, '#bdb9b0'); }
    c.fillStyle = g; c.beginPath(); c.ellipse(p[0], p[1], rx, ry, 0, 0, 7); c.fill();
  }
  c.restore();
  return { at, step: step * k };
}
// a hand from the upper right holding a black stone between index and middle finger
function goHand(c, px, py, s) {
  c.save(); c.translate(px, py); c.scale(s, s);
  c.fillStyle = '#e8bf9c'; c.strokeStyle = 'rgba(120,70,40,0.6)'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(150, -120); c.quadraticCurveTo(70, -70, 40, -30); c.quadraticCurveTo(20, -8, 6, -6); c.quadraticCurveTo(-6, 4, 4, 12);
  c.quadraticCurveTo(30, 16, 60, 4); c.quadraticCurveTo(110, -10, 190, -40); c.lineTo(190, -120); c.closePath(); c.fill(); c.stroke();
  // index finger below the stone, middle finger on top
  c.beginPath(); c.moveTo(60, 4); c.quadraticCurveTo(28, 26, 2, 22); c.quadraticCurveTo(-10, 16, 0, 10); c.quadraticCurveTo(26, 8, 52, -4); c.fill(); c.stroke();
  c.fillStyle = '#f2d4bc'; c.beginPath(); c.ellipse(4, 16, 7, 4, -0.2, 0, 7); c.fill();          // nail
  c.fillStyle = '#121212'; c.beginPath(); c.ellipse(-6, 6, 15, 8, -0.15, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-10, 3, 5, 2.5, -0.2, 0, 7); c.fill();
  c.fillStyle = '#e8bf9c'; c.beginPath(); c.moveTo(40, -30); c.quadraticCurveTo(14, -10, -4, -2); c.quadraticCurveTo(-12, -8, -2, -14); c.quadraticCurveTo(18, -26, 34, -40); c.fill(); c.stroke();
  c.restore();
}
function verticalSignTex() {
  return canvasTex(400, 800, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#dff0fb'); g.addColorStop(1, '#b6d9ef');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    // board + a hand placing a stone (top), like the photo's picture
    c.fillStyle = '#9ec6e2'; c.fillRect(0, 0, w, 210);
    const bd = goBoard(c, 16, 22, w - 32, 184, { elev: 38 });
    const tp = bd.at(10, 12);                                          // the empty point being played
    goHand(c, tp[0] + 6, tp[1] - 8, 0.9);
    c.fillStyle = '#1e3f9a'; fitText(c, 'GO CLUB', w / 2, 262, w - 60, 72, F.heavy, { spacing: 4 });
    c.fillStyle = '#e1262f';
    fitText(c, 'BA', w / 2, 400, w - 80, 170, F.heavy);
    fitText(c, 'DUK', w / 2, 560, w - 60, 150, F.heavy);
    c.fillStyle = '#1e3f9a'; fitText(c, 'UPSTAIRS · 2F', w / 2, 655, w - 70, 40, F.label, { spacing: 3 });
    goBoard(c, 60, 688, w - 120, 100, { elev: 30 });
  });
}
function stickerTex(seed) { // layered torn flyers on the pole (generic text only)
  return canvasTex(256, 512, (c, w, h) => {
    const r = rng(seed);
    c.fillStyle = '#b8bbbd'; c.fillRect(0, 0, w, h);
    const items = [['ROOM FOR RENT', 'ask inside', '#ffffff', '#c22'], ['PIANO LESSONS', 'all ages', '#fff7c8', '#225'], ['MOVING VAN', 'same day', '#ffe8e0', '#a20'], ['LOST CAT', 'grey tabby', '#ffffff', '#111'], ['KEYS CUT', 'while u wait', '#e8f3ff', '#135']];
    for (let i = 0; i < 9; i++) {
      const [t1, t2, bg, ink] = items[(i * 3 + seed) % items.length];
      const x = r() * 60, y = i * 52 + r() * 10, ww = 150 + r() * 60, hh = 70 + r() * 30;
      c.save(); c.translate(x + ww / 2, y + hh / 2); c.rotate((r() - 0.5) * 0.15);
      c.fillStyle = bg; c.fillRect(-ww / 2, -hh / 2, ww, hh);
      c.fillStyle = ink; fitText(c, t1, 0, -hh / 6, ww - 16, 26, F.label); fitText(c, t2, 0, hh / 5, ww - 30, 18, F.small);
      // torn bottom / ripped corner
      c.fillStyle = '#b8bbbd';
      if (r() < 0.6) { c.beginPath(); c.moveTo(-ww / 2, hh / 2); for (let k = 0; k <= 10; k++) c.lineTo(-ww / 2 + ww * k / 10, hh / 2 - 6 - r() * 18); c.lineTo(ww / 2, hh / 2); c.fill(); }
      c.restore();
    }
    for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(60,50,40,${r() * 0.12})`; c.fillRect(r() * w, r() * h, 1 + r() * 4, 1 + r() * 6); }
  });
}

// ------------------------------------------------------------------ model
export function makeStairEntrance() {
  const g = new THREE.Group();
  g.name = 'stair_entrance';
  const OW = 1.4, HW = OW / 2;                 // opening width
  const BW = 9, BD = 9;                         // building width / depth
  const GH = 3.96;                              // stair top = club floor
  const NS = 22, RISE = GH / NS, RUN = 0.28;
  const Z0 = -0.6, Z1 = Z0 - NS * RUN;          // first / last riser
  const ZL = -8.2;                              // landing end wall
  const colliders = [];

  const darkBrick = (w, h) => rep('sg_darkbrick.png', w / 2.6, h / 0.85, { roughness: 0.85 });
  const steel = std({ color: '#c8cbcd', metalness: 0.3, roughness: 0.32 });
  const blackPaint = std({ color: '#1b1b1c', roughness: 0.7 });
  const cableM = std({ color: '#121212', roughness: 0.6 });
  const greyCable = std({ color: '#6c6e70', roughness: 0.6 });
  const plaster = (w, h) => rep('sg_plaster.png', w / 1.2, h / 1.2, { color: '#d8d6cf' });
  const concrete = std({ color: '#8d8a84', roughness: 0.9 });

  // ---------------------------------------------------------------- ground: pavers + apron
  {
    const pv = face(BW, 3, rep('sg_pave.png', BW / 1.8, 3 / 1.8, { roughness: 0.85 }), 0, 0.012, 1.5); pv.rotation.x = -Math.PI / 2; g.add(pv);
    const ap = canvasTex(512, 128, (c, w, h) => { const r = rng(6); c.fillStyle = '#9a968f'; c.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${40 + r() * 30},${40 + r() * 30},${40 + r() * 30},${0.08 + r() * 0.15})`; c.beginPath(); c.ellipse(r() * w, r() * h, 10 + r() * 60, 5 + r() * 25, r() * 3, 0, 7); c.fill(); } c.strokeStyle = 'rgba(40,40,40,0.4)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 6); c.lineTo(w, 6); c.stroke(); });
    const a = face(3.4, 0.6, std({ map: ap, roughness: 0.9 }), 0.2, 0.016, 0.3); a.rotation.x = -Math.PI / 2; g.add(a);
  }

  // ---------------------------------------------------------------- the entrance piers
  {
    const PX0 = -HW - 0.55;  // left pier x -1.25..-0.7
    // left pier: charcoal brick below, orange brick above, black-painted band to the sign
    g.add(face(0.55, 1.2, std({ map: ptex('sg_grey.png'), roughness: 0.9 }), PX0 + 0.275, 0.6, 0.12));
    g.add(face(0.55, 1.0, std({ map: ptex('sg_red.png'), roughness: 0.9 }), PX0 + 0.275, 1.7, 0.12));
    g.add(box(0.55, 0.4, 0.12, blackPaint, PX0 + 0.275, 2.4, 0.06));
    g.add(box(0.55, 2.2, 0.12, concrete, PX0 + 0.275, 1.1, 0.06 - 0.001));
    // the pier's return into the stair (brick continues ~0.4 m in)
    const rg = face(0.4, 1.2, std({ map: ptex('sg_grey.png', 0.78, 1), roughness: 0.9 }), -HW, 0.6, -0.08, Math.PI / 2); g.add(rg);
    const rr = face(0.4, 1.0, std({ map: ptex('sg_red.png', 0.73, 1), roughness: 0.9 }), -HW, 1.7, -0.08, Math.PI / 2); g.add(rr);
    // right pier: peeling white tile above, beige tile below (sign hangs in front)
    const PX1 = HW + 0.65;
    g.add(face(0.65, 0.5, std({ map: ptex('sg_tiletop.png'), roughness: 0.4 }), HW + 0.325, 2.4, 0.1));
    g.add(face(0.65, 0.93, std({ map: ptex('sg_tilelow.png'), roughness: 0.45 }), HW + 0.325, 0.465, 0.1));
    g.add(face(0.65, 1.22, std({ map: ptex('sg_tilelow.png', 1, 1.3), roughness: 0.45 }), HW + 0.325, 1.54, 0.1));
    g.add(box(0.65, 2.65, 0.1, concrete, HW + 0.325, 1.325, 0.05 - 0.001));
    g.add(face(0.4, 2.55, std({ map: ptex('sg_tilelow.png', 0.6, 2.7), roughness: 0.45 }), HW, 1.275, -0.08, -Math.PI / 2));
    void PX1;
    // stained grey skirting strip at the foot of both piers
    g.add(box(0.57, 0.08, 0.14, std({ color: '#3a3836' }), PX0 + 0.275, 0.04, 0.07));
    g.add(box(0.67, 0.1, 0.12, std({ color: '#2f2d2b' }), HW + 0.325, 0.05, 0.06));
  }

  // ---------------------------------------------------------------- lightbox over the opening
  {
    const lb = new THREE.Group();
    const W = 2.7, H = 0.62, D = 0.32;
    const frameM = std({ map: rustFrameTex(), roughness: 0.8, metalness: 0.2 });
    lb.add(box(W, H, D, frameM));
    const fm = face(W - 0.1, H - 0.1, std({ map: lightboxTex(), emissive: '#fff4dc', emissiveIntensity: 0.55, roughness: 0.5 }), 0, 0, D / 2 + 0.002);
    fm.material.emissiveMap = fm.material.map; lb.add(fm);
    // the box's underside lip + two rusty brackets into the wall
    lb.add(box(W, 0.04, D + 0.04, frameM, 0, -H / 2 - 0.02, 0));
    for (const s of [-1, 1]) lb.add(box(0.06, 0.06, 0.3, frameM, s * 1.0, H / 2 - 0.05, -D / 2 - 0.15));
    lb.position.set(0.05, 2.9, 0.22); g.add(lb);
    const sl = new THREE.PointLight('#ffe9c8', 3, 6, 1.6); sl.position.set(0.05, 2.45, 1.0); g.add(sl);
    // a rusty bracket arm from the photo (sticking out above, left of centre)
    g.add(box(0.05, 0.32, 0.05, frameM, -0.15, 3.32, 0.28));
  }

  // ---------------------------------------------------------------- vertical sign on the right pier
  {
    const vs = new THREE.Group();
    const W = 0.62, H = 1.3;
    vs.add(box(W + 0.04, H + 0.04, 0.12, std({ color: '#d6dbe0', metalness: 0.4, roughness: 0.4 })));
    const m = face(W, H, std({ map: verticalSignTex(), emissive: '#ffffff', emissiveIntensity: 0.45, roughness: 0.4 }), 0, 0, 0.061);
    m.material.emissiveMap = m.material.map; vs.add(m);
    vs.position.set(HW + 0.33, 1.55, 0.2); vs.rotation.y = -0.04; g.add(vs);
  }

  // ---------------------------------------------------------------- stainless pole, plate, cables, stickers
  {
    const PXp = HW + 1.0, PZp = 0.35, PR = 0.17, PH = 4.7;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(PR, PR, PH, 28), std({ color: '#d4d7d9', metalness: 0.3, roughness: 0.3 }));
    pole.position.set(PXp, PH / 2, PZp); pole.castShadow = true; g.add(pole);
    g.add(box(0.42, 0.06, 0.42, std({ color: '#4a4a48' }), PXp, 0.03, PZp));
    // sticker wrap on the street side
    const st = new THREE.Mesh(new THREE.CylinderGeometry(PR + 0.003, PR + 0.003, 1.0, 28, 1, true, -0.9, 1.8), std({ map: stickerTex(3), roughness: 0.7 }));
    st.position.set(PXp, 1.4, PZp); g.add(st);
    // address plate (navy, white number) strapped on
    const at = canvasTex(256, 256, (c, w, h) => {
      c.fillStyle = '#1d2a6b'; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 26); c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.roundRect(14, 14, w - 28, h - 28, 20); c.stroke();
      c.fillStyle = '#fff'; fitText(c, 'Mill St', w / 2, 62, w - 60, 40, F.label); c.fillRect(30, 92, w - 60, 3);
      fitText(c, '27', w / 2, 170, w - 60, 120, F.heavy);
    });
    const ap = new THREE.Mesh(new THREE.CylinderGeometry(PR + 0.012, PR + 0.012, 0.36, 28, 1, true, -0.7, 1.4), std({ map: at, roughness: 0.45, side: THREE.DoubleSide }));
    ap.position.set(PXp, 2.42, PZp); g.add(ap);
    for (const y of [2.25, 2.6]) { const band = new THREE.Mesh(new THREE.TorusGeometry(PR + 0.015, 0.006, 6, 28), steel); band.rotation.x = Math.PI / 2; band.position.set(PXp, y, PZp); g.add(band); }
    // cable bundle strapped down the pole's left side, sweeping across the wall above the sign
    for (let i = 0; i < 4; i++) {
      const ox = -PR - 0.02 - i * 0.025, oz = 0.05 - i * 0.03;
      g.add(tube(V(PXp + ox, 0.25, PZp + oz), V(PXp + ox, 3.6 + i * 0.1, PZp + oz), 0.012 + (i % 2) * 0.006, i === 2 ? greyCable : cableM, 6));
    }
    for (const y of [0.9, 1.9, 2.95]) { const st2 = new THREE.Mesh(new THREE.TorusGeometry(PR + 0.012, 0.007, 6, 28), std({ color: '#d9d9d6' })); st2.rotation.x = Math.PI / 2; st2.position.set(PXp, y, PZp); g.add(st2); }
    g.add(cable([[PXp - PR - 0.04, 3.6, PZp + 0.05], [0.8, 3.9, 0.3], [-0.2, 3.35, 0.12], [-0.9, 3.5, 0.1], [-1.15, 3.95, 0.12]], 0.018, cableM));
    g.add(cable([[PXp - PR - 0.07, 3.7, PZp], [0.6, 3.75, 0.25], [-0.4, 3.3, 0.1], [-1.0, 3.3, 0.1], [-1.05, 3.08, 0.16]], 0.014, greyCable));
    g.add(cable([[PXp - PR - 0.1, 3.8, PZp - 0.05], [1.2, 4.3, 0.25], [2.4, 4.5, 0.2], [4.4, 4.45, 0.15]], 0.012, cableM));
    // thin cable dropping into the pier crack + small junction box low on the pole
    g.add(box(0.1, 0.16, 0.07, std({ color: '#9a9c9e' }), PXp - PR - 0.05, 0.6, PZp + 0.03));
    colliders.push([PXp - 0.3, PXp + 0.3, PZp - 0.3, PZp + 0.3]);
  }

  // ---------------------------------------------------------------- wall above: dark brick, meter box, sign band
  {
    // dark brick from the sign up to the band (whole width)
    g.add(face(BW, 1.15, darkBrick(BW, 1.15), 0, 3.82, 0.001));
    // beige meter box with a little window
    const mb = new THREE.Group();
    mb.add(box(0.36, 0.52, 0.18, std({ color: '#dcd6c6', roughness: 0.55 })));
    mb.add(box(0.2, 0.14, 0.01, std({ color: '#95a6ac', roughness: 0.15, metalness: 0.2 }), 0, 0.12, 0.091));
    mb.add(box(0.08, 0.02, 0.012, glow(1.4, 0.2, 0.15), 0.08, -0.05, 0.091));
    mb.add(box(0.37, 0.06, 0.19, std({ color: '#c9c2b0' }), 0, -0.24, 0));
    mb.position.set(-1.05, 3.6, 0.1); g.add(mb);
    g.add(cable([[-1.05, 3.33, 0.12], [-1.0, 3.1, 0.2], [-0.8, 3.25, 0.25], [-0.4, 3.18, 0.2]], 0.012, cableM));
    // red sign band of the tile shop (left) and blue 2F panel (right), projecting
    const bandT = canvasTex(1600, 160, (c, w, h) => {
      c.fillStyle = '#c94a5a'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#ffffff'; fitText(c, 'BRIGHTWAY  TILE & BATH', w * 0.42, h / 2 + 4, w * 0.7, 96, F.heavy, { spacing: 10 });
      c.fillStyle = '#f7d6db'; fitText(c, 'porcelain · ceramic · fittings', w * 0.86, h / 2 + 2, w * 0.24, 40, F.label);
      c.fillStyle = 'rgba(80,20,20,0.25)'; c.fillRect(0, h - 12, w, 12);
    });
    const band = new THREE.Group();
    band.add(box(6.3, 0.6, 0.3, std({ color: '#b03a48' })));
    const bf = face(6.26, 0.56, std({ map: bandT, emissive: '#ffffff', emissiveIntensity: 0.3, roughness: 0.5 }), 0, 0, 0.152); bf.material.emissiveMap = bf.material.map; band.add(bf);
    band.position.set(-1.35, 4.7, 0.2); g.add(band);
    const blueT = canvasTex(512, 256, (c, w, h) => {
      c.fillStyle = '#2b4a8a'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#ff5a5a'; c.fillRect(30, 26, 120, 18); c.fillRect(30, 54, 120, 18);
      c.fillStyle = '#f5d33a'; fitText(c, '2F GO CLUB', w / 2 + 40, 150, w - 120, 84, F.heavy, { spacing: 4 });
      c.fillStyle = '#cfd8ee'; fitText(c, 'guests welcome', w / 2 + 40, 214, w - 160, 34, F.label, { spacing: 3 });
    });
    const bp = new THREE.Group();
    bp.add(box(2.2, 1.0, 0.25, std({ color: '#203a70' })));
    const bpf = face(2.16, 0.96, std({ map: blueT, emissive: '#ffffff', emissiveIntensity: 0.35, roughness: 0.5 }), 0, 0, 0.127); bpf.material.emissiveMap = bpf.material.map; bp.add(bpf);
    bp.position.set(3.4, 4.9, 0.18); g.add(bp);
  }

  // ---------------------------------------------------------------- upper floors
  {
    const top = 10.3;
    g.add(face(BW, top - 4.4, darkBrick(BW, top - 4.4), 0, 4.4 + (top - 4.4) / 2, 0.0));
    const alu = std({ color: '#b8bcbe', metalness: 0.25, roughness: 0.35 });
    const glass = std({ color: '#2a3238', roughness: 0.1, metalness: 0.3 });
    const decal = canvasTex(512, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.92)'; fitText(c, 'GO CLUB', w / 2, 90, w - 60, 90, F.heavy, { spacing: 10 }); fitText(c, 'BADUK · LESSONS · TOURNAMENTS', w / 2, 180, w - 60, 30, F.label, { spacing: 3 }); });
    const blinds = canvasTex(128, 256, (c, w, h) => { for (let i = 0; i < 32; i++) { c.fillStyle = i % 2 ? '#d9d2c2' : '#bfb7a6'; c.fillRect(0, i * 8, w, 8); } });
    for (const [fy, kind] of [[5.5, 'club'], [8.2, 'blind']]) {
      for (let i = 0; i < 3; i++) {
        const x = -3 + i * 3, W = 2.2, H = 1.45;
        g.add(box(W + 0.12, H + 0.12, 0.08, alu, x, fy, 0.02));
        const gl = face(W, H, kind === 'club' ? glass : std({ map: blinds, roughness: 0.6 }), x, fy, 0.065); g.add(gl);
        if (kind === 'club') {
          const lit = face(W - 0.05, H - 0.05, glow(1.15, 1.0, 0.78), x, fy, 0.04); g.add(lit); gl.material = new THREE.MeshStandardMaterial({ color: '#9fb4bd', transparent: true, opacity: 0.35, roughness: 0.05 });
          if (i !== 1) { const d = face(1.8, 0.9, new THREE.MeshBasicMaterial({ map: decal, transparent: true }), x, fy + 0.1, 0.07); g.add(d); }
        }
        g.add(box(0.03, H, 0.04, alu, x, fy, 0.075));                         // sliding sash meeting rail
        g.add(box(W + 0.2, 0.05, 0.16, std({ color: '#8b8a86' }), x, fy - H / 2 - 0.1, 0.08)); // sill
      }
    }
    // AC unit on a bracket (3F) + condensate pipe
    const ac = new THREE.Group();
    ac.add(box(0.8, 0.55, 0.3, std({ color: '#e4e2dc', roughness: 0.5 })));
    const fan = new THREE.Mesh(new THREE.CircleGeometry(0.2, 24), std({ color: '#3a3c3e' })); fan.position.set(-0.12, 0, 0.151); ac.add(fan);
    for (let k = 0; k < 7; k++) ac.add(box(0.42, 0.012, 0.01, std({ color: '#bdbbb5' }), -0.12, -0.18 + k * 0.06, 0.158));
    ac.add(box(0.85, 0.04, 0.4, steel, 0, -0.3, -0.02));
    ac.position.set(3.4, 7.15, 0.35); g.add(ac);
    g.add(tube(V(3.75, 6.85, 0.3), V(3.75, 4.9, 0.3), 0.012, std({ color: '#e8e8e4' }), 6));
    // drain pipe at the right edge + parapet
    g.add(tube(V(BW / 2 - 0.15, 0.1, 0.12), V(BW / 2 - 0.15, top, 0.12), 0.055, std({ color: '#9aa0a6', roughness: 0.5 }), 12));
    g.add(box(BW + 0.1, 0.35, 0.3, std({ color: '#3a3a3a' }), 0, top + 0.17, -0.1));
    // side + back walls of the building block
    const side = darkBrick(BD, top);
    g.add(face(BD, top, side, -BW / 2, top / 2, -BD / 2, -Math.PI / 2));
    g.add(face(BD, top, side, BW / 2, top / 2, -BD / 2, Math.PI / 2));
    g.add(face(BW, top, side, 0, top / 2, -BD, Math.PI));
    const roof = face(BW, BD, std({ color: '#2c2c2c' }), 0, top, -BD / 2); roof.rotation.x = -Math.PI / 2; g.add(roof);
  }

  // ---------------------------------------------------------------- tile shop (left)
  {
    const X0 = -BW / 2 + 0.1, X1 = -HW - 0.6, W = X1 - X0, xc = (X0 + X1) / 2, H = 3.1;
    const alu = std({ color: '#a9adb0', metalness: 0.25, roughness: 0.35 });
    // window wall: aluminium frame, glass, door
    const gl = face(W, H - 0.1, new THREE.MeshStandardMaterial({ color: '#c6d6dc', transparent: true, opacity: 0.22, roughness: 0.05, depthWrite: false }), xc, (H - 0.1) / 2 + 0.05, 0.02); g.add(gl);
    for (let k = 0; k <= 3; k++) g.add(box(0.06, H, 0.08, alu, X0 + k * W / 3, H / 2, 0.02));
    g.add(box(W, 0.07, 0.08, alu, xc, H, 0.02)); g.add(box(W, 0.1, 0.1, alu, xc, 0.05, 0.02)); g.add(box(W, 0.05, 0.08, alu, xc, 2.3, 0.02));
    const vinyl = canvasTex(1024, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.9)'; fitText(c, 'PORCELAIN  TILE  ·  CERAMIC  ·  STONE', w / 2, h / 2, w - 40, 54, F.label, { spacing: 8 }); });
    g.add(face(W - 0.4, 0.3, new THREE.MeshBasicMaterial({ map: vinyl, transparent: true }), xc, 2.62, 0.03));
    // inside: lit room with tile sample boards
    const D = 3.0;
    const fl = face(W, D, std({ color: '#d7d3cb', roughness: 0.4 }), xc, 0.003, -D / 2); fl.rotation.x = -Math.PI / 2; g.add(fl);
    const cl = face(W, D, glow(1.0, 1.0, 0.95), xc, H, -D / 2); cl.rotation.x = Math.PI / 2; g.add(cl);
    const samples = canvasTex(1024, 512, (c, w, h) => {
      const r = rng(21); c.fillStyle = '#e9e6df'; c.fillRect(0, 0, w, h);
      const pal = ['#d8d4cc', '#a9a49b', '#6f6b66', '#e8e2d2', '#b9c6c8', '#c9b49a', '#8a9aa6', '#f0eee8', '#3a3a3c', '#c7a98a'];
      for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) {
        const x = 30 + i * 165, y = 30 + j * 160; c.fillStyle = '#9a958c'; c.fillRect(x - 4, y - 4, 148, 148);
        const col = pal[Math.floor(r() * pal.length)];
        const n = [1, 2, 3, 4][Math.floor(r() * 4)];
        for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) { c.fillStyle = col; c.fillRect(x + a * 140 / n + 1, y + b * 140 / n + 1, 140 / n - 2, 140 / n - 2); c.fillStyle = `rgba(255,255,255,${r() * 0.15})`; c.fillRect(x + a * 140 / n + 1, y + b * 140 / n + 1, 140 / n - 2, 6); }
      }
    });
    g.add(face(W, 2.4, std({ map: samples, roughness: 0.35 }), xc, 1.5, -D + 0.01));
    for (const s of [-1, 1]) g.add(face(D, H, std({ color: '#ece9e2' }), xc + s * W / 2, H / 2, -D / 2, -s * Math.PI / 2));
    g.add(box(1.2, 0.9, 0.6, std({ color: '#cfcac0' }), xc - 0.4, 0.45, -1.6));
    for (let i = 0; i < 4; i++) g.add(box(0.6, 0.012, 0.6, std({ color: ['#e6e1d6', '#9c978e', '#c7b49c', '#5a5856'][i], roughness: 0.3 }), xc - 0.4, 0.906 + i * 0.012, -1.6));
    // black wire rack with tile samples outside, by the pier
    const rack = new THREE.Group();
    const wire = std({ color: '#141414', metalness: 0.4, roughness: 0.5 });
    for (const [x, z] of [[-0.25, -0.18], [0.25, -0.18], [-0.25, 0.18], [0.25, 0.18]]) rack.add(tube(V(x, 0.05, z), V(x, 1.15, z), 0.008, wire, 6));
    for (let k = 0; k < 4; k++) {
      const y = 0.15 + k * 0.3;
      for (let i = 0; i < 6; i++) rack.add(box(0.5, 0.005, 0.005, wire, 0, y, -0.18 + i * 0.072));
      rack.add(box(0.5, 0.06, 0.005, wire, 0, y + 0.03, 0.18));
      for (let i = 0; i < 2; i++) rack.add(box(0.2, 0.012, 0.2, std({ color: ['#d9d3c6', '#7a7671', '#bfae92', '#e9e7e2'][(k + i) % 4], roughness: 0.3 }), -0.12 + i * 0.24, y + 0.012, 0));
    }
    for (const [x, z] of [[-0.25, -0.18], [0.25, -0.18], [-0.25, 0.18], [0.25, 0.18]]) { const w = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), wire); w.position.set(x, 0.03, z); rack.add(w); }
    rack.position.set(X1 - 0.35, 0, 0.45); rack.rotation.y = 0.12; g.add(rack);
    colliders.push([X1 - 0.65, X1 - 0.05, 0.15, 0.75]);
    colliders.push([-BW / 2, -HW, -BD, 0.12]);
  }

  // ---------------------------------------------------------------- white nook (right)
  {
    const X0 = HW + 0.65, X1 = BW / 2, W = X1 - X0, xc = (X0 + X1) / 2;
    g.add(face(W, 2.65, std({ color: '#ecebe6', roughness: 0.6 }), xc, 1.325, -0.6));
    for (const s of [-1, 1]) g.add(face(0.6, 2.65, std({ color: '#e2e1dc' }), xc + s * W / 2, 1.325, -0.3, -s * Math.PI / 2));
    const sof = face(W, 0.6, std({ color: '#d8d7d2' }), xc, 2.65, -0.3); sof.rotation.x = Math.PI / 2; g.add(sof);
    g.add(box(W, 0.6, 0.6, darkBrick(W, 0.6), xc, 2.95, -0.3));
    g.add(box(W, 0.35, 0.02, std({ color: '#1e1e1e', roughness: 0.3 }), xc, 0.175, -0.59));            // black tile base
    const fl = face(W, 0.6, std({ color: '#7f7d78' }), xc, 0.004, -0.3); fl.rotation.x = -Math.PI / 2; g.add(fl);
    // fire-alarm box: red, with a lamp
    const fa = new THREE.Group();
    fa.add(box(0.3, 0.45, 0.08, std({ color: '#b5221d', roughness: 0.4 })));
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), glow(2.4, 0.2, 0.12)); lamp.position.set(0, 0.12, 0.05); fa.add(lamp);
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16), std({ color: '#efefea' })); btn.rotation.x = Math.PI / 2; btn.position.set(0, -0.07, 0.05); fa.add(btn);
    fa.position.set(xc - 0.5, 1.45, -0.56); g.add(fa);
    // small green exit plate
    const ex = canvasTex(256, 96, (c, w, h) => { c.fillStyle = '#1f8a4c'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; fitText(c, 'EXIT  →', w / 2, h / 2 + 2, w - 30, 54, F.label, { spacing: 4 }); });
    g.add(face(0.4, 0.15, std({ map: ex, emissive: '#ffffff', emissiveIntensity: 0.3, emissiveMap: ex }), xc + 0.6, 2.35, -0.58));
    const nl = new THREE.PointLight('#f4f6ff', 1.1, 4, 1.6); nl.position.set(xc, 2.4, -0.2); g.add(nl);
    colliders.push([HW, BW / 2, -BD, -0.35]);
    colliders.push([HW, HW + 0.7, -BD, 0.12]);
  }

  // ---------------------------------------------------------------- the stair
  {
    const stepM = (rx, ry) => rep('sg_step.png', rx, ry, { roughness: 0.8 });
    // entry floor (concrete, worn) from the street to the first riser
    const ef = face(OW, -Z0, std({ color: '#7d7a74', roughness: 0.9 }), 0, 0.005, Z0 / 2); ef.rotation.x = -Math.PI / 2; g.add(ef);
    const nose = std({ color: '#3a3936', roughness: 0.6 });
    const r = rng(12);
    for (let i = 0; i < NS; i++) {
      const y = (i + 1) * RISE, z = Z0 - i * RUN;
      const t = box(OW, 0.04, RUN + 0.02, stepM(OW / 0.9, RUN / 0.9), 0, y - 0.02, z - RUN / 2);
      t.material.color.setScalar(0.9 + r() * 0.15);
      g.add(t);
      const rs = face(OW, RISE - 0.04, stepM(OW / 0.9, (RISE - 0.04) / 0.9), 0, y - 0.04 - (RISE - 0.04) / 2, z + 0.0); g.add(rs);
      g.add(box(OW - 0.04, 0.015, 0.035, nose, 0, y + 0.002, z - 0.02));
      // grime collected in the corners of each tread
      for (const s of [-1, 1]) g.add(box(0.08, 0.004, RUN, std({ color: '#3d3b37', transparent: true, opacity: 0.6 }), s * (HW - 0.04), y + 0.002, z - RUN / 2));
    }
    // solid mass under the flight
    const len = Math.hypot(NS * RUN, GH);
    const under = new THREE.Mesh(new THREE.BoxGeometry(OW, 0.3, len), concrete);
    under.position.set(0, GH / 2 - 0.25, (Z0 + Z1) / 2); under.rotation.x = Math.atan2(GH, NS * RUN); g.add(under);
    // landing
    const lf = box(OW, 0.06, Z1 - ZL, stepM(OW / 0.9, (Z1 - ZL) / 0.9), 0, GH - 0.03, (Z1 + ZL) / 2); g.add(lf);
    // walls: left = rough plaster with a grimy brown dado following the pitch; right = plain grey plaster
    const WH = GH + 2.6, WL = -ZL;
    g.add(face(WL, WH, plaster(WL, WH), -HW, WH / 2, ZL / 2, Math.PI / 2));
    g.add(face(WL - 0.4, WH, plaster(WL - 0.4, WH), HW, WH / 2, (ZL - 0.4) / 2, -Math.PI / 2));
    const dado = std({ color: '#5a4636', roughness: 0.9 });
    {
      const a = V(-HW + 0.006, 0.45, Z0 + 0.3), b = V(-HW + 0.006, GH + 0.45, Z1);
      const d = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.9, a.distanceTo(b)), dado); d.position.copy(a).lerp(b, 0.5); d.lookAt(b); g.add(d);
      g.add(box(0.01, 0.9, -Z0 + 0.3, dado, -HW + 0.006, 0.45, (Z0 + 0.3) / 2));
    }
    // steel rail on the left (brackets), wooden rail on the right
    const ra = V(-HW + 0.07, 0.9 + RISE, Z0 + 0.1), rb = V(-HW + 0.07, GH + 0.9, Z1 - 0.1);
    g.add(tube(ra, rb, 0.02, steel, 12));
    for (let k = 0; k <= 5; k++) { const p = ra.clone().lerp(rb, k / 5); g.add(box(0.07, 0.02, 0.02, steel, p.x - 0.035, p.y - 0.03, p.z)); }
    g.add(tube(ra, V(-HW + 0.07, 0.75, Z0 + 0.25), 0.02, steel, 10));
    const wood = std({ color: '#9b6a34', roughness: 0.5 });
    const wa = V(HW - 0.06, 0.95 + RISE, Z0 - 0.2), wb = V(HW - 0.06, GH + 0.95, Z1);
    const wr = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, wa.distanceTo(wb)), wood); wr.position.copy(wa).lerp(wb, 0.5); wr.lookAt(wb); g.add(wr);
    // ceiling: flat over the entry, a sloped soffit over the flight, flat over the landing
    const ceilM = std({ color: '#b9b7b1', roughness: 0.9, side: THREE.DoubleSide });
    const c0 = face(OW, -Z0 + 0.2, ceilM, 0, 2.55, Z0 / 2 + 0.1); c0.rotation.x = Math.PI / 2; g.add(c0);
    {
      const a = V(0, 2.55, Z0 + 0.1), b = V(0, GH + 2.5, Z1 - 0.3);
      const s = new THREE.Mesh(new THREE.PlaneGeometry(OW, a.distanceTo(b)), ceilM);
      // plane's local y runs up the slope, its normal faces down into the stairwell
      const yA = b.clone().sub(a).normalize(), xA = V(1, 0, 0), nA = new THREE.Vector3().crossVectors(xA, yA).negate();
      s.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA.clone().negate(), yA, nA));
      s.position.copy(a).lerp(b, 0.5); g.add(s);
    }
    const c2 = face(OW, Z1 - 0.3 - ZL, ceilM, 0, GH + 2.5, (Z1 - 0.3 + ZL) / 2); c2.rotation.x = Math.PI / 2; g.add(c2);
    // fluorescent tube halfway up + bare bulb on the landing
    const mid = V(0, (2.55 + GH + 2.5) / 2 - 0.08, (Z0 + Z1) / 2);
    g.add(box(0.12, 0.05, 1.2, std({ color: '#e8e6e0' }), mid.x, mid.y + 0.03, mid.z));
    g.add(box(0.05, 0.04, 1.1, glow(2.2, 2.3, 2.3), mid.x, mid.y, mid.z));
    const fl = new THREE.PointLight('#eef3ff', 4, 6, 1.6); fl.position.set(0, mid.y - 0.3, mid.z); g.add(fl);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), glow(2.6, 2.1, 1.4)); bulb.position.set(0, GH + 2.3, (Z1 + ZL) / 2); g.add(bulb);
    g.add(tube(V(0, GH + 2.36, (Z1 + ZL) / 2), V(0, GH + 2.5, (Z1 + ZL) / 2), 0.025, std({ color: '#2a2a2a' }), 8));
    const bl = new THREE.PointLight('#ffd9a0', 3, 5, 1.6); bl.position.set(0, GH + 2.1, (Z1 + ZL) / 2); g.add(bl);
    // riser sign halfway up
    const rsT = canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#f6f4ee'; c.fillRect(0, 0, w, h); c.fillStyle = '#202020'; fitText(c, 'GO CLUB', 160, h / 2 + 3, 230, 56, F.heavy, { spacing: 4 }); c.fillStyle = '#d42a3a'; fitText(c, '2F  ↑', 380, h / 2 + 3, 180, 60, F.heavy); });
    const ri = 9;
    g.add(face(0.5, 0.09, std({ map: rsT, roughness: 0.5 }), 0.05, ri * RISE + 0.07, Z0 - ri * RUN + 0.003));
    // taped paper notice sticking out from the right wall near the bottom
    const pn = canvasTex(256, 360, (c, w, h) => { c.fillStyle = '#f8f7f2'; c.fillRect(0, 0, w, h); c.fillStyle = '#222'; fitText(c, 'MEMBERS', w / 2, 70, w - 40, 44, F.label); fitText(c, '& GUESTS', w / 2, 120, w - 40, 44, F.label); fitText(c, 'WELCOME', w / 2, 170, w - 40, 44, F.label); c.fillStyle = '#d42a3a'; fitText(c, 'teaching games sat.', w / 2, 250, w - 30, 30, F.hand); c.fillStyle = 'rgba(210,200,170,0.7)'; c.fillRect(20, 0, 70, 22); c.fillRect(w - 90, 0, 70, 22); });
    const paper = face(0.3, 0.42, std({ map: pn, roughness: 0.8, side: THREE.DoubleSide }), HW - 0.12, 1.35 + RISE * 3, Z0 - 0.6, -Math.PI / 2 + 0.55);
    g.add(paper);
    // the club door on the landing end wall
    {
      const d = new THREE.Group();
      const doorM = std({ color: '#5f6e66', roughness: 0.5, metalness: 0.3 });
      d.add(box(0.9, 2.05, 0.05, doorM, 0, 1.025, 0));
      // reeded frosted glass, lit warm from the club inside (a blurred figure at a board behind it)
      const fg = canvasTex(256, 360, (c, w, h) => {
        const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f3e6c8'); gr.addColorStop(1, '#d9c8a4'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
        c.filter = 'blur(10px)'; c.fillStyle = 'rgba(70,55,40,0.55)'; c.beginPath(); c.ellipse(90, 150, 26, 30, 0, 0, 7); c.fill(); c.fillRect(55, 175, 75, 160);
        c.fillStyle = 'rgba(120,80,30,0.45)'; c.fillRect(140, 250, 100, 30); c.filter = 'none';
        for (let x = 0; x < w; x += 8) { c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(x, 0, 3, h); c.fillStyle = 'rgba(90,70,40,0.12)'; c.fillRect(x + 5, 0, 2, h); }
      });
      d.add(box(0.5, 0.7, 0.01, std({ map: fg, roughness: 0.3, emissive: '#ffffff', emissiveIntensity: 0.55, emissiveMap: fg }), 0, 1.45, 0.03));
      d.add(box(0.54, 0.74, 0.012, std({ color: '#2a2a28' }), 0, 1.45, 0.024));
      for (const s of [-1, 1]) d.add(box(0.06, 2.12, 0.08, std({ color: '#3a3a38' }), s * 0.48, 1.06, 0));
      d.add(box(1.02, 0.06, 0.08, std({ color: '#3a3a38' }), 0, 2.1, 0));
      d.add(box(0.03, 0.18, 0.05, steel, 0.35, 1.0, 0.05));
      const pl = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#20201f'; c.fillRect(0, 0, w, h); goBoard(c, 40, 106, w - 80, 140, { elev: 55 }); c.fillStyle = '#f2e6c8'; fitText(c, 'GO CLUB', w / 2, 50, w - 40, 54, F.heavy, { spacing: 6 }); fitText(c, 'please knock', w / 2, 92, w - 60, 26, F.hand); });
      d.add(face(0.32, 0.32, std({ map: pl, roughness: 0.4 }), 0, 0.85, 0.03));
      d.position.set(0, GH, ZL + 0.03); g.add(d);
      const end = face(OW, WH - GH, plaster(OW, WH - GH), 0, GH + (WH - GH) / 2, ZL); g.add(end);
      // mat, slipper rack, umbrellas
      g.add(box(0.8, 0.012, 0.5, std({ color: '#6a2a24', roughness: 0.95 }), 0, GH + 0.006, ZL + 0.45));
      const shelf = new THREE.Group();
      const rk = std({ color: '#7a5a3a' });
      for (let k = 0; k < 3; k++) shelf.add(box(0.28, 0.02, 0.6, rk, 0, 0.15 + k * 0.25, 0));
      for (const s of [-1, 1]) shelf.add(box(0.28, 0.66, 0.02, rk, 0, 0.33, s * 0.3));
      // pairs of house slippers (soft, rounded) on the shelves
      for (let k = 0; k < 4; k++) {
        const sm = std({ color: ['#2a4a7a', '#7a2a3a', '#4a4a4a', '#6a6a2a'][k], roughness: 0.9 });
        for (const o of [-0.04, 0.04]) {
          const sl = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), sm); sl.scale.set(0.11, 0.022, 0.04);
          sl.position.set(0.0, 0.18 + (k % 2) * 0.25 + 0.022, -0.17 + Math.floor(k / 2) * 0.3 + o); shelf.add(sl);
          const strap = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), sm); strap.scale.set(0.05, 0.03, 0.042);
          strap.position.set(0.05, 0.18 + (k % 2) * 0.25 + 0.03, -0.17 + Math.floor(k / 2) * 0.3 + o); shelf.add(strap);
        }
      }
      shelf.position.set(-HW + 0.16, GH, ZL + 0.75); g.add(shelf);
      // closed umbrellas leaning in the corner: folded canopy tapering to the tip, shaft, hooked handle
      for (const [x, z, c, lean] of [[0.5, ZL + 0.22, '#1d3f6e', 0.12], [0.58, ZL + 0.3, '#222222', 0.18], [0.44, ZL + 0.32, '#7a1c24', 0.08]]) {
        const u = new THREE.Group();
        const can = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.008, 0.62, 8), std({ color: c, roughness: 0.7, flatShading: true })); can.position.y = 0.36; u.add(can);
        const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 6), steel); tip.position.y = 0.03; u.add(tip);
        u.add(tube(V(0, 0.66, 0), V(0, 0.86, 0), 0.007, steel, 6));
        const hk = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 8, 16, Math.PI), std({ color: '#3a2a1a', roughness: 0.5 })); hk.position.set(0.035, 0.86, 0); u.add(hk);
        u.position.set(x, GH, z); u.rotation.z = lean; u.rotation.y = x * 7; g.add(u);
      }
    }
    colliders.push([-HW - 0.2, HW + 0.2, -BD, ZL]);
    colliders.push([0.3, 0.62, ZL, ZL + 0.45]);                // umbrellas
    colliders.push([-HW, -HW + 0.32, ZL + 0.42, ZL + 1.08]);   // slipper rack
  }

  g.traverse((o) => { if (o.isMesh && o.material && o.material.transparent) o.castShadow = false; });
  g.userData.colliders = colliders;
  g.userData.area = { minX: -HW + 0.22, maxX: HW - 0.22, minZ: ZL + 0.3, maxZ: 0.4 };
  g.userData.floorY = (x, z) => {
    if (Math.abs(x) > HW + 0.05 || z > 0.05 || z < ZL - 0.1) return null;
    if (z >= Z0) return 0;
    if (z <= Z1) return GH;
    return Math.min(GH, Math.max(0, (Z0 - z) / (Z0 - Z1) * GH));
  };
  return g;
}
