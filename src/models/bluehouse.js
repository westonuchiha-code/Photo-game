// Boarded-up blue house + stray cats, from the cats-blue-house-vent and kittens-boarded-wall
// photos. Faces +z (local), origin at the front-centre at ground level.
// Front: left half is the boarded section from the kitten photo (peeling navy base, cracked
// white painted panel with a broken-out hole a kitten peeks through, OSB nailed over the
// window above); right half is peeling blue lap siding over a blue stucco foundation with an
// open basement window in a weathered white frame (cat photo). A pile of cat kibble on the
// walk. Two cats outside: a tortoiseshell lying down, a grey tabby kitten sitting beside it.
import * as THREE from 'three';

const _L = new THREE.TextureLoader();
const cache = {};
function ptex(name) {
  if (!cache[name]) {
    const t = _L.load(`assets/textures/${name}`);
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    cache[name] = t;
  }
  return cache[name];
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.9, ...o });
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};
function panel(w, h, tex, unitU, unitV, x, y, z, ry = 0, color = '#ffffff') {
  const g = new THREE.PlaneGeometry(w, h);
  if (unitU) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / unitU, uv.getY(i) * h / unitV); }
  const m = new THREE.Mesh(g, std({ map: ptex(tex), color }));
  m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- cats
function furTex(kind) {
  return canvasTex(256, 128, (c, w, h) => {
    const r = rng(kind === 'tortie' ? 3 : 8);
    if (kind === 'tortie') {
      c.fillStyle = '#1c1714'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) { c.fillStyle = ['#7a4520', '#a8642c', '#3a2a1e', '#5a3420'][i % 4]; c.beginPath(); c.ellipse(r() * w, r() * h, 6 + r() * 16, 3 + r() * 8, r() * 3, 0, 7); c.fill(); }
    } else {
      c.fillStyle = '#8f877c'; c.fillRect(0, 0, w, h);
      // mackerel stripes run around the body (constant v), broken + wavy
      for (let y = 4; y < h; y += 11) { c.fillStyle = '#3d3833'; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 16) c.lineTo(x, y + Math.sin(x * 0.08 + y) * 3 + (r() - 0.5) * 2); for (let x = w; x >= 0; x -= 16) c.lineTo(x, y + 4 + Math.sin(x * 0.08 + y) * 3); c.fill(); }
      c.fillStyle = 'rgba(230,224,212,0.55)'; c.fillRect(w * 0.42, 0, w * 0.16, h);
    }
    c.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 600; i++) c.fillRect(r() * w, r() * h, 1, 3);
  });
}
export function makeCat(kind = 'tabby', pose = 'sit', scale = 1) {
  const g = new THREE.Group();
  const fur = std({ map: furTex(kind), roughness: 1 });
  const dark = std({ color: kind === 'tortie' ? '#141110' : '#3d3833', roughness: 1 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.2, 6, 12), fur);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 10), fur);
  head.scale.set(1.05, 0.92, 0.95);
  if (pose === 'lie') {
    body.rotation.z = Math.PI / 2; body.position.set(0, 0.075, 0); body.scale.set(0.85, 1.0, 1.3);
    head.position.set(0.2, 0.15, 0.0); head.scale.multiplyScalar(1.15);
    for (const z of [-0.04, 0.05]) { const paw = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.09, 4, 8), fur); paw.rotation.z = Math.PI / 2; paw.position.set(0.22, 0.03, z); g.add(paw); }
    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.022, 6, 16, Math.PI * 0.9), dark); tail.rotation.x = -Math.PI / 2; tail.position.set(-0.16, 0.03, 0.04); g.add(tail);
  } else {   // sitting
    body.position.set(0, 0.13, 0); body.rotation.z = 0.45; body.scale.set(1, 0.9, 1);
    head.position.set(0.07, 0.31, 0);
    for (const z of [-0.035, 0.035]) { const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.12, 4, 8), fur); leg.position.set(0.075, 0.07, z); g.add(leg); }
    const hip = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), fur); hip.position.set(-0.05, 0.07, 0); hip.scale.set(1.1, 0.8, 1); g.add(hip);
    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.018, 6, 16, Math.PI * 0.8), dark); tail.rotation.x = -Math.PI / 2; tail.rotation.z = 0.6; tail.position.set(-0.04, 0.02, 0.06); g.add(tail);
  }
  g.add(body, head);
  // ears, eyes, muzzle
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.065, 4), fur);
    ear.position.set(head.position.x - 0.01, head.position.y + 0.06, s * 0.035); ear.rotation.x = s * -0.25; g.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), new THREE.MeshStandardMaterial({ color: kind === 'tortie' ? '#c9a826' : '#8fae4a', emissive: kind === 'tortie' ? '#4a3a08' : '#2a3a10', roughness: 0.2 }));
    eye.position.set(head.position.x + 0.058, head.position.y + 0.012, s * 0.026); g.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), fur); nose.position.set(head.position.x + 0.055, head.position.y - 0.02, 0); nose.scale.set(1, 0.7, 1.2); g.add(nose);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  g.scale.setScalar(scale);
  return g;
}

// ---------------------------------------------------------------- house
export function makeBlueHouse() {
  const g = new THREE.Group();
  const W = 5.6, D = 4.2, H = 3.3;
  const colliders = [[-W / 2, W / 2, -D, 0.05]];
  const blue = '#ffffff';
  const split = -0.2;                      // x where the boarded section meets the siding
  // ---- boarded section (left): navy base, white panel band, OSB over the window
  const lw = split + W / 2, lc = (-W / 2 + split) / 2;
  g.add(panel(lw, 0.55, 'ab_navybase.png', 2.2, 0.55, lc, 0.275, 0.02));
  // white panel band, with the broken hole at ~ 1/4 across
  const bandY0 = 0.55, bandH = 0.95;
  const holeX = -W / 2 + 0.75, holeW = 0.2, holeH = 0.36, holeY = bandY0 + 0.28;
  const pm = std({ map: ptex('ab_panel.png'), roughness: 0.85 });
  const bandShape = new THREE.Shape();
  bandShape.moveTo(-lw / 2, 0); bandShape.lineTo(lw / 2, 0); bandShape.lineTo(lw / 2, bandH); bandShape.lineTo(-lw / 2, bandH); bandShape.lineTo(-lw / 2, 0);
  const hx = holeX - lc, hy = holeY - bandY0;
  const hole = new THREE.Path(); hole.moveTo(hx - holeW / 2, hy); hole.lineTo(hx - holeW / 2, hy + holeH * 0.85); hole.lineTo(hx - holeW / 4, hy + holeH); hole.lineTo(hx + holeW / 2, hy + holeH * 0.95); hole.lineTo(hx + holeW / 2, hy); hole.lineTo(hx - holeW / 2, hy);
  bandShape.holes.push(hole);
  const bg = new THREE.ShapeGeometry(bandShape);
  const uv = bg.attributes.uv, bp = bg.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (bp.getX(i) + lw / 2) / 1.5, bp.getY(i) / bandH);
  pm.map = ptex('ab_panel.png');
  const band = new THREE.Mesh(bg, pm); band.position.set(lc, bandY0, 0.05); g.add(band);
  g.add(box(lw, 0.06, 0.1, std({ color: '#d9d2c2' }), lc, bandY0 + bandH, 0.06));          // sill rail
  g.add(box(lw, 0.05, 0.12, std({ color: '#cfc6b4' }), lc, bandY0 + 0.02, 0.06));
  const holeBack = box(holeW + 0.1, holeH + 0.1, 0.02, std({ color: '#050505' }), holeX, holeY + holeH / 2, -0.2); g.add(holeBack);
  // OSB nailed over the window, slightly proud of the wall
  const osb = panel(lw - 0.1, H - bandY0 - bandH - 0.15, 'ab_osb.png', 2.4, 0.6, lc, bandY0 + bandH + (H - bandY0 - bandH - 0.15) / 2 + 0.03, 0.07);
  g.add(osb);
  g.add(box(0.1, H, 0.12, std({ color: '#e6e1d6' }), split, H / 2, 0.06));                // white corner board
  // a boarded door too
  // ---- siding section (right): blue lap siding over blue stucco foundation, open basement window
  const rw = W / 2 - split, rc = (split + W / 2) / 2;
  g.add(panel(rw, H - 0.6, 'ab_bluesiding.png', 2.0, 0.38, rc, 0.6 + (H - 0.6) / 2, 0.02));
  // stucco foundation with the window opening (two pieces + header)
  const winX0 = split + 0.35, winX1 = winX0 + 1.0, winTop = 0.58, winBot = 0.12;
  g.add(panel(winX0 - split, 0.6, 'ab_stucco.png', 0.8, 0.8, (split + winX0) / 2, 0.3, 0.02));
  g.add(panel(W / 2 - winX1, 0.6, 'ab_stucco.png', 0.8, 0.8, (winX1 + W / 2) / 2, 0.3, 0.02));
  g.add(panel(winX1 - winX0, winBot, 'ab_stucco.png', 0.8, 0.8, (winX0 + winX1) / 2, winBot / 2, 0.02));
  const wf = std({ color: '#e8e2d4', roughness: 0.85 });
  // weathered white frame + the hinged sash propped open inward, dark basement behind
  g.add(box(winX1 - winX0 + 0.12, 0.07, 0.14, wf, (winX0 + winX1) / 2, winTop + 0.035, 0.03));
  g.add(box(winX1 - winX0 + 0.12, 0.05, 0.2, wf, (winX0 + winX1) / 2, winBot - 0.02, 0.06));
  for (const x of [winX0 - 0.03, winX1 + 0.03]) g.add(box(0.06, winTop - winBot + 0.1, 0.14, wf, x, (winTop + winBot) / 2, 0.03));
  g.add(box(winX1 - winX0, winTop - winBot, 0.02, std({ color: '#060606' }), (winX0 + winX1) / 2, (winTop + winBot) / 2, -0.25));
  const sash = new THREE.Group();
  sash.add(box(winX1 - winX0 - 0.25, 0.05, 0.03, wf, 0, 0, 0), box(winX1 - winX0 - 0.25, 0.05, 0.03, wf, 0, -0.32, 0));
  for (const x of [-(winX1 - winX0 - 0.25) / 2, (winX1 - winX0 - 0.25) / 2]) sash.add(box(0.05, 0.32, 0.03, wf, x, -0.16, 0));
  sash.position.set((winX0 + winX1) / 2 - 0.1, winTop - 0.03, -0.05); sash.rotation.x = -1.1;
  g.add(sash);
  g.add(box(0.28, winTop - winBot - 0.04, 0.03, std({ color: '#ddd5c4' }), winX1 - 0.18, (winTop + winBot) / 2, -0.02));   // board stuck in the corner
  // peeled paint flakes curling off the siding
  const r = rng(12);
  for (let i = 0; i < 14; i++) {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.04 + r() * 0.08, 0.015 + r() * 0.02), std({ color: r() < 0.5 ? '#8fb2d8' : '#e2d8c8', side: THREE.DoubleSide }));
    f.position.set(split + 0.2 + r() * (rw - 0.4), 0.7 + r() * (H - 1.0), 0.04 + r() * 0.02); f.rotation.set(r() * 0.8, 0, r() - 0.5); g.add(f);
  }
  // ---- shell: sides + back in blue siding, gable roof with an old gutter
  for (const s of [-1, 1]) {
    const p = panel(D, H, 'ab_bluesiding.png', 2.0, 0.38, s * W / 2, H / 2, -D / 2, s * Math.PI / 2); g.add(p);
    const f = panel(D, 0.6, 'ab_stucco.png', 0.8, 0.8, s * (W / 2 + 0.005), 0.3, -D / 2, s * Math.PI / 2); g.add(f);
  }
  g.add(panel(W, H, 'ab_bluesiding.png', 2.0, 0.38, 0, H / 2, -D, Math.PI));
  const roofMat = std({ color: '#4a4744', roughness: 0.95 });
  const rise = 1.4, half = D / 2 + 0.3, sl = Math.hypot(rise, half);
  for (const s of [-1, 1]) { const rr = box(W + 0.4, 0.06, sl, roofMat, 0, H + rise / 2, -D / 2 + s * half / 2); rr.rotation.x = s * Math.atan2(rise, half); g.add(rr); }
  for (const s of [-1, 1]) {
    const sh = new THREE.Shape(); sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(0, rise); sh.lineTo(-D / 2, 0);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), std({ map: ptex('ab_bluesiding.png'), side: THREE.DoubleSide }));
    m.rotation.y = Math.PI / 2; m.position.set(s * W / 2, H, -D / 2); g.add(m);
  }
  const gutter = box(W * 0.7, 0.08, 0.1, std({ color: '#cfcac0', metalness: 0.3 }), -0.6, H - 0.05, 0.32); gutter.rotation.z = 0.04; g.add(gutter);   // sagging
  g.add(box(W + 0.4, 0.14, 0.04, std({ color: '#e6e1d6' }), 0, H - 0.04, 0.3));
  // ---- concrete walk along the front + kibble pile
  g.add(box(W + 0.4, 0.03, 0.8, std({ color: '#b2aea4', roughness: 1 }), 0, 0.015, 0.45));
  const kib = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.008, 0), std({ color: '#b5622a', roughness: 0.8 }), 160);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 160; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.16; m4.makeTranslation(1.6 + Math.cos(a) * d * 1.6, 0.035 + r() * 0.012 * (1 - d * 5), 0.35 + Math.sin(a) * d * 0.6); kib.setMatrixAt(i, m4); }
  g.add(kib);
  // ---- cats: kitten peeking from the hole, tortie lying + tabby kitten sitting outside the window
  const peek = makeCat('tabby', 'sit', 0.75); peek.position.set(holeX + 0.02, holeY - 0.1, -0.06); peek.rotation.y = -Math.PI / 2; g.add(peek);
  const tortie = makeCat('tortie', 'lie', 1.0); tortie.position.set(winX0 + 0.35, 0.03, 0.85); tortie.rotation.y = 0.15; g.add(tortie);
  const kit = makeCat('tabby', 'sit', 0.7); kit.position.set(winX0 + 0.95, 0.03, 0.8); kit.rotation.y = 2.6; g.add(kit);
  g.userData.cats = [tortie, kit, peek];
  colliders.push([winX0 - 0.1, winX0 + 1.2, 0.55, 1.05]);
  g.userData.colliders = colliders;
  // tail / head idle motion
  let t = 0;
  g.userData.update = (dt) => {
    t += dt;
    peek.position.y = holeY - 0.1 + Math.max(0, Math.sin(t * 0.5)) * 0.03;
    kit.rotation.y = 2.6 + Math.sin(t * 0.7) * 0.25;
  };
  return g;
}
