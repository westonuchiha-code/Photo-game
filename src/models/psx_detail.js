// Shared detailing kit for the owner's PSX packs (owner: "low poly doesn't have to be no poly"). Two halves:
//   skins  a library texture worked into a base colour, then the real thing's detail drawn on (stencils, stickers,
//          seams, rust runs, scuffs), for 'fit' / 'cyl' UVs from objDress.
//   parts  geometry added onto a face of a settled model (centred on x/z, standing on y = 0): face(g, side, fx, fy)
//          gives a frame (point, normal, right, up) and on(g, frame, mesh, lift) seats a mesh in it, so a knob, a
//          button grid, a screen, a vent, a key bed, a cable or a label can be put anywhere on any side.
import * as THREE from 'three';
import { P, text } from './fill_kit.js';
import { canvasT } from './kit.js';
import { whenImages } from './texmix.js';
export { THREE, P, text };

export let SEED = 1; export const rnd = () => ((SEED = (SEED * 16807) % 2147483647) / 2147483647);
export function skin(base, col, draw, { w = 512, h = 512, rep = 2, rough = 0.6, metal = 0.15, seed = 3, mix = 0.55, scuff = 60, glow = 0 } = {}) {
  let img = null; const go = (x, W, H) => { SEED = seed; x.fillStyle = col; x.fillRect(0, 0, W, H);
    if (img) { x.globalAlpha = mix; x.globalCompositeOperation = 'multiply'; for (let i = 0; i < rep; i++) for (let j = 0; j < rep; j++) x.drawImage(img, i * W / rep, j * H / rep, W / rep, H / rep); x.globalCompositeOperation = 'overlay'; x.globalAlpha = 0.3; for (let i = 0; i < rep; i++) for (let j = 0; j < rep; j++) x.drawImage(img, i * W / rep, j * H / rep, W / rep, H / rep); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }
    draw(x, W, H); if (scuff) scuffs(x, W, H, scuff); };
  const t = canvasT(w, h, go), m = new THREE.MeshStandardMaterial({ map: t, roughness: rough, metalness: metal });
  if (glow) { m.emissiveMap = t; m.emissive = new THREE.Color('#ffffff'); m.emissiveIntensity = glow; }
  if (base) whenImages([base], ([i]) => { img = i; go(t.image.getContext('2d'), w, h); t.needsUpdate = true; }); return m; }
// a drawn panel with no library base (screens, cover art, labels); glow > 0 makes it light up
export const panel = (w, h, draw, glow = 0, o = {}) => skin(null, o.bg || '#000', draw, { w, h, scuff: 0, rough: o.rough ?? 0.4, glow, metal: 0 });
export function scuffs(x, W, H, n) { x.save(); for (let i = 0; i < n; i++) { x.strokeStyle = rnd() < 0.6 ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.14)'; x.lineWidth = 1 + rnd() * 1.5; const sx = rnd() * W, sy = rnd() * H, a = rnd() * Math.PI, l = 6 + rnd() * 30; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l); x.stroke(); } x.restore(); }
export function drips(x, W, y0, n, col = '90,50,24', len = 0.35, H = 512) { x.save(); for (let i = 0; i < n; i++) { const dx = rnd() * W, l = H * len * (0.4 + rnd()), wd = 2 + rnd() * 7, g = x.createLinearGradient(0, y0, 0, y0 + l); g.addColorStop(0, `rgba(${col},0.75)`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.fillRect(dx, y0, wd, l); } x.restore(); }
export function wear(x, x0, y0, w, h, k) { x.save(); for (let i = 0; i < w * h * 0.004 * k; i++) { x.fillStyle = `rgba(80,70,60,${0.25 + rnd() * 0.4})`; x.fillRect(x0 + rnd() * w, y0 + rnd() * h, 1 + rnd() * 3, 1 + rnd() * 2); } x.restore(); }
export function stencil(x, s, cx, cy, size, col = '#e8e2d0', font = 'Arial', st = '900') { text(x, s, cx, cy, `${st} ${size}px ${font}`, col); wear(x, cx - size * s.length * 0.32, cy - size * 0.55, size * s.length * 0.64, size * 1.1, 0.5); }
export function grille(x, x0, y0, w, h, step = 8, r = 2, col = 'rgba(0,0,0,0.6)') { x.fillStyle = col; for (let yy = y0 + step / 2; yy < y0 + h; yy += step) for (let xx = x0 + step / 2; xx < x0 + w; xx += step) { x.beginPath(); x.arc(xx, yy, r, 0, 7); x.fill(); } }
export function slots(x, x0, y0, w, h, n, col = 'rgba(0,0,0,0.65)') { for (let i = 0; i < n; i++) { x.fillStyle = col; x.fillRect(x0, y0 + i * h / n, w, h / n * 0.45); x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(x0, y0 + i * h / n + h / n * 0.45, w, 2); } }
export function noise(x, W, H, n = 4000, a = 0.5) { for (let i = 0; i < n; i++) { const v = Math.floor(rnd() * 255); x.fillStyle = `rgba(${v},${v},${v},${a})`; x.fillRect(rnd() * W, rnd() * H, 2, 2); } }
export function scan(x, W, H) { x.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 0; y < H; y += 4) x.fillRect(0, y, W, 2); const g = x.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
// ---- faces and parts
export const bbox = (g) => new THREE.Box3().setFromObject(g);
export function face(g, side, fx = 0.5, fy = 0.5, b = bbox(g)) { const W = b.max.x - b.min.x, H = b.max.y - b.min.y, D = b.max.z - b.min.z, V = (x, y, z) => new THREE.Vector3(x, y, z);
  switch (side) {
    case '+z': return { p: V(b.min.x + fx * W, b.min.y + fy * H, b.max.z), n: V(0, 0, 1), r: V(1, 0, 0), u: V(0, 1, 0), W, H };
    case '-z': return { p: V(b.max.x - fx * W, b.min.y + fy * H, b.min.z), n: V(0, 0, -1), r: V(-1, 0, 0), u: V(0, 1, 0), W, H };
    case '+x': return { p: V(b.max.x, b.min.y + fy * H, b.max.z - fx * D), n: V(1, 0, 0), r: V(0, 0, -1), u: V(0, 1, 0), W: D, H };
    case '-x': return { p: V(b.min.x, b.min.y + fy * H, b.min.z + fx * D), n: V(-1, 0, 0), r: V(0, 0, 1), u: V(0, 1, 0), W: D, H };
    case '+y': return { p: V(b.min.x + fx * W, b.max.y, b.min.z + fy * D), n: V(0, 1, 0), r: V(1, 0, 0), u: V(0, 0, -1), W, H: D };
    default: return { p: V(b.min.x + fx * W, b.min.y, b.min.z + fy * D), n: V(0, -1, 0), r: V(1, 0, 0), u: V(0, 0, 1), W, H: D }; } }
// seat a mesh built in a local frame (x = right, y = up, z = out of the face) onto a face frame, lifted along the normal
export function on(g, f, mesh, lift = 0) { const m = new THREE.Matrix4().makeBasis(f.r, f.u, f.n); mesh.quaternion.setFromRotationMatrix(m); mesh.position.copy(f.p).addScaledVector(f.n, lift); mesh.castShadow = true; g.add(mesh); return mesh; }
const M_ = (geo, mat) => new THREE.Mesh(geo, mat);
export const at = (g, side, fx, fy, b) => face(g, side, fx, fy, b);
export const plate = (g, f, w, h, mat, lift = 0.003) => on(g, f, M_(new THREE.PlaneGeometry(w, h), mat), lift);
export const block = (g, f, w, h, d, mat) => on(g, f, M_(new THREE.BoxGeometry(w, h, d), mat), d / 2);
export function knob(g, f, r, d, mat, seg = 12) { const geo = new THREE.CylinderGeometry(r, r * 1.05, d, seg); geo.rotateX(Math.PI / 2); return on(g, f, M_(geo, mat), d / 2); }
export const led = (g, f, r, col) => knob(g, f, r, r, new THREE.MeshStandardMaterial({ color: col, emissive: new THREE.Color(col), emissiveIntensity: 2 }), 8);
export function buttons(g, f, cols, rows, w, h, bw, bh, d, mat, gap = 1.4) { const out = []; for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const ff = { ...f, p: f.p.clone().addScaledVector(f.r, (i - (cols - 1) / 2) * w / Math.max(1, cols - 1 || 1) * (cols > 1 ? 1 : 0)).addScaledVector(f.u, (j - (rows - 1) / 2) * h / Math.max(1, rows - 1 || 1) * (rows > 1 ? 1 : 0)) }; out.push(block(g, ff, bw, bh, d, mat)); } return out; }
// many small keys in one draw: an instanced key bed over a w x h area of a face
export function keys(g, f, cols, rows, w, h, d, mat, gap = 0.18) { const kw = w / cols * (1 - gap), kh = h / rows * (1 - gap), im = new THREE.InstancedMesh(new THREE.BoxGeometry(kw, kh, d), mat, cols * rows), m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(f.r, f.u, f.n)); let k = 0;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const p = f.p.clone().addScaledVector(f.r, (i + 0.5) * w / cols - w / 2).addScaledVector(f.u, (j + 0.5) * h / rows - h / 2).addScaledVector(f.n, d / 2); m.compose(p, q, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(k++, m); }
  im.castShadow = true; g.add(im); return im; }
// a screen: a dark bezel frame proud of the face, the picture just inside it (glowing)
export function screen(g, f, w, h, pic, bezel = 0.03, d = 0.012, bezelMat = P('#141416', { roughness: 0.5 })) { for (const [dx, dy, ww, hh] of [[0, h / 2 + bezel / 2, w + bezel * 2, bezel], [0, -h / 2 - bezel / 2, w + bezel * 2, bezel], [w / 2 + bezel / 2, 0, bezel, h], [-w / 2 - bezel / 2, 0, bezel, h]]) block(g, { ...f, p: f.p.clone().addScaledVector(f.r, dx).addScaledVector(f.u, dy) }, ww, hh, d, bezelMat);
  return plate(g, f, w, h, pic, d * 0.4); }
export function cable(g, pts, r = 0.008, mat = P('#1a1a1a', { roughness: 0.7 })) { const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))); const m = M_(new THREE.TubeGeometry(c, Math.max(8, pts.length * 6), r, 5), mat); m.castShadow = true; g.add(m); return m; }
export function rod(g, a, b, r, mat, seg = 6) { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), m = M_(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; g.add(m); return m; }
export function feet(g, h = 0.012, r = 0.015, mat = P('#1a1a1a', { roughness: 0.9 }), inset = 0.12) { const b = bbox(g); for (const c of g.children) c.position.y += h; const W = b.max.x - b.min.x, D = b.max.z - b.min.z; for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const m = M_(new THREE.CylinderGeometry(r, r, h, 8), mat); m.position.set((b.min.x + b.max.x) / 2 + sx * W * (0.5 - inset), h / 2, (b.min.z + b.max.z) / 2 + sz * D * (0.5 - inset)); g.add(m); } return g; }
export const glowMat = (c, k = 2) => new THREE.MeshStandardMaterial({ color: c, emissive: new THREE.Color(c), emissiveIntensity: k });
