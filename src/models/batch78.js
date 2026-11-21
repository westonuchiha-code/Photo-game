// Batch 78 (photos/batch78/): the two pillar bricks as tiling materials (tools/tex_78.py builds them brick by brick
// from the photos) + a brick pillar model and a pocket-park gateway that uses them.
//   brickMat(kind, w, h), makeBrickPillar(kind), makeParkGateway()
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader(); const _T = {};
function tex(name, rx, ry, srgb = true) { const k = name + rx + '|' + ry; if (_T[k]) return _T[k]; const t = _L.load(`assets/textures/${name}.png`); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return (_T[k] = t); }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (document.fonts) document.fonts.ready.then(() => { draw(x, w, h); t.needsUpdate = true; }); return t; }
// one texture tile = 8 courses (0.6 m) tall; tan = 4 bricks (0.92 m) wide, white = 6 shorter bricks (0.78 m) wide
const TILE = { tan: [0.92, 0.6, 'bk_tan'], white: [0.78, 0.6, 'bk_white'] };
export function brickMat(kind, w, h) { const [tw, th, n] = TILE[kind]; return std({ map: tex(n, w / tw, h / th), normalMap: tex(n + '_n', w / tw, h / th, false), normalScale: new THREE.Vector2(0.9, 0.9), roughness: 0.88 }); }
// a box whose faces each get the brick at the right scale (sides by their own width)
function brickBox(kind, w, h, d, x, y, z, p) { const mx = brickMat(kind, d, h), mz = brickMat(kind, w, h), top = std({ color: kind === 'white' ? '#e4e4e0' : '#9a8a70' }); return box(w, h, d, [mx, mx, top, top, mz, mz], x, y, z, p); }
export function makeBrickPillar(kind = 'white', H = 2.4, S = 0.6) {
  const g = new THREE.Group(); g.name = 'brick_pillar_' + kind;
  const conc = std({ map: tex('lot_concrete', 0.5, 0.3), color: '#b8b4ac', roughness: 0.9 });
  box(S + 0.08, 0.3, S + 0.08, conc, 0, 0.15, 0, g);                          // concrete plinth
  brickBox(kind, S, H - 0.42, S, 0, 0.3 + (H - 0.42) / 2, 0, g);
  if (kind === 'white') { // the photo's white pillar: a soldier course (bricks on end) running down both edges
    const sol = brickMat('white', 0.12, H - 0.42); sol.map.rotation = sol.normalMap.rotation = Math.PI / 2;
    for (const s of [-1, 1]) box(0.1, H - 0.42, S + 0.012, sol, s * (S / 2 - 0.05), 0.3 + (H - 0.42) / 2, 0, g); }
  box(S + 0.12, 0.12, S + 0.12, std({ color: '#c8c4bc', roughness: 0.8 }), 0, H - 0.06, 0, g);   // cap stone
  g.userData.collider = [-S / 2 - 0.05, S / 2 + 0.05, -S / 2 - 0.05, S / 2 + 0.05];
  return g;
}
// two white brick posts with a steel arch + name sign (front faces -z, toward the street on the park's south side)
export function makeParkGateway(name = 'MIDORI POCKET PARK') {
  const g = new THREE.Group(); g.name = 'park_gateway'; const span = 3.6;
  for (const s of [-1, 1]) { const p = makeBrickPillar('white', 2.4, 0.6); p.position.x = s * span / 2; g.add(p); }
  const steel = std({ color: '#2a3a2a', metalness: 0.6, roughness: 0.4 });
  const arc = new THREE.Mesh(new THREE.TorusGeometry(span / 2, 0.04, 8, 32, Math.PI), steel); arc.position.y = 2.4; g.add(arc);
  box(span, 0.05, 0.05, steel, 0, 2.42, 0, g);
  const t = canvasT(1024, 160, (x, w, h) => { x.fillStyle = '#2a3a2a'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2ead0'; fitText(x, name, w / 2, 86, w - 80, 90, F.roman, { spacing: 6 }); });
  const sm = std({ map: t, side: THREE.DoubleSide }); const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.4), sm); sg.position.set(0, 2.75, 0); sg.rotation.y = Math.PI; g.add(sg);   // reads from the street side (-z)
  g.userData.colliders = [[-span / 2 - 0.35, -span / 2 + 0.35, -0.35, 0.35], [span / 2 - 0.35, span / 2 + 0.35, -0.35, 0.35]];
  return g;
}
