// Neon "OPEN" sign hanging inside an infinity-mirror LED light box, from the
// window photo. The word runs top-to-bottom (rotated 90°) on a clear acrylic
// panel framed by a white and a pale-cyan neon border.
// Local axes: +y up, the light box faces +z (into the room); the sign inside
// it faces the street. Units: metres.
import * as THREE from 'three';
import { roundedPath } from './stool.js';

const glow = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });

// Stroke paths for O P E N in a 1-unit-high em box (x right, y up).
function letterPaths(ch) {
  const arc = (cx, cy, r, a0, a1, n = 16) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const a = a0 + ((a1 - a0) * i) / n;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    });
  switch (ch) {
    case 'O': {
      const pts = Array.from({ length: 49 }, (_, i) => {
        const a = (i / 48) * Math.PI * 2;
        return [0.34 + Math.cos(a) * 0.32, 0.5 + Math.sin(a) * 0.5];
      });
      return [{ pts, smooth: true }];
    }
    case 'P':
      return [{ pts: [[0, 0], [0, 1], [0.32, 1], ...arc(0.32, 0.75, 0.25, Math.PI / 2, -Math.PI / 2).slice(1), [0, 0.5]], smooth: false }];
    case 'E':
      return [{ pts: [[0.55, 1], [0, 1], [0, 0], [0.55, 0]] }, { pts: [[0, 0.5], [0.45, 0.5]] }];
    case 'N':
      return [{ pts: [[0, 0], [0, 1], [0.6, 0], [0.6, 1]] }];
    default:
      return [];
  }
}

function neonTube(pts2d, mat, { scale, radius = 0.007, corner = 0.02, closed = false, smooth = false, z = 0 }) {
  const pts = pts2d.map(([x, y]) => new THREE.Vector3(x * scale, y * scale, z));
  const path = smooth || closed
    ? new THREE.CatmullRomCurve3(pts, closed)
    : roundedPath(pts.map((p) => p.toArray()), corner);
  return new THREE.Mesh(new THREE.TubeGeometry(path, 160, radius, 8, closed), mat);
}

function roundedRectPts(w, h, r, n = 6) {
  const pts = [];
  const corners = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI], [w / 2 - r, -h / 2 + r, -Math.PI / 2]];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  return pts;
}

export function makeNeonSign() {
  const g = new THREE.Group();
  g.name = 'neon_open_sign';
  const amber = glow(2.0, 0.42, 0.0); // linear values: reads as ~#ffaa00 on screen
  const white = glow(1.5, 1.55, 1.6);
  const cyan = glow(0.45, 1.5, 1.5);

  const W = 0.4, H = 0.72;
  // Clear acrylic backing panel.
  const panel = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape(roundedRectPts(W, H, 0.035).map(([x, y]) => new THREE.Vector2(x, y)))),
    new THREE.MeshBasicMaterial({ color: '#9fc4cc', transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }),
  );
  g.add(panel);
  // Border tubes.
  g.add(neonTube(roundedRectPts(W - 0.04, H - 0.04, 0.03), white, { scale: 1, closed: true, z: 0.012 }));
  g.add(neonTube(roundedRectPts(W - 0.09, H - 0.09, 0.025), cyan, { scale: 1, closed: true, z: 0.02, radius: 0.005 }));

  // Letters: "OPEN" laid out horizontally, then turned to read top-to-bottom.
  const word = new THREE.Group();
  const s = 0.19; // letter height
  let x = 0;
  for (const ch of 'OPEN') {
    const lg = new THREE.Group();
    for (const p of letterPaths(ch)) lg.add(neonTube(p.pts, amber, { scale: s, smooth: p.smooth, closed: ch === 'O', corner: 0.012, radius: 0.0095 }));
    lg.position.x = x;
    word.add(lg);
    x += (ch === 'O' ? 0.82 : 0.8) * s;
  }
  word.position.set(-x / 2 + 0.03, -s / 2, 0.028);
  const turn = new THREE.Group();
  turn.add(word);
  turn.rotation.z = -Math.PI / 2;
  g.add(turn);

  // Hanging wires up to the light box ceiling.
  const wireMat = new THREE.MeshBasicMaterial({ color: '#cfcfcf' });
  for (const sx of [-1, 1]) {
    const len = 0.5;
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, len, 4), wireMat);
    w.position.set(sx * (W / 2 - 0.05) * 0.6, H / 2 + len / 2 - 0.02, 0);
    w.rotation.z = sx * 0.35;
    g.add(w);
  }

  const light = new THREE.PointLight('#ffa030', 1.4, 3.5, 2);
  light.position.set(0, 0, -0.6);
  g.add(light);
  return g;
}

// Infinity-mirror light box: LED strip around a mirrored frame, with fading
// reflections that recede into the box.
export function makeInfinityBox(mats, { w = 0.82, h = 1.5, depth = 0.1, layers = 6 } = {}) {
  const g = new THREE.Group();
  g.name = 'infinity_led_box';
  const frameMat = new THREE.MeshStandardMaterial({ color: '#bdb9b0', roughness: 0.35, metalness: 0.7 });
  const t = 0.05;
  const bar = (bw, bh, x, y) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, depth), frameMat);
    m.position.set(x, y, -depth / 2);
    g.add(m);
  };
  bar(w, t, 0, h / 2 - t / 2);
  bar(w, t, 0, -h / 2 + t / 2);
  bar(t, h, -w / 2 + t / 2, 0);
  bar(t, h, w / 2 - t / 2, 0);

  // Smoked-glass back: dark and reflective, but you can still see outside.
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({
    color: '#05070a', roughness: 0.15, metalness: 0.9, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false,
  }));
  back.position.z = -depth;
  g.add(back);

  // LED dots, repeated in shrinking, dimming copies for the infinity effect.
  const dot = new THREE.SphereGeometry(0.007, 6, 4);
  const spacing = 0.03;
  const perimeter = [];
  const iw = w - t * 1.4, ih = h - t * 1.4;
  for (let x = -iw / 2; x <= iw / 2; x += spacing) perimeter.push([x, ih / 2], [x, -ih / 2]);
  for (let y = -ih / 2 + spacing; y < ih / 2; y += spacing) perimeter.push([-iw / 2, y], [iw / 2, y]);
  const m4 = new THREE.Matrix4();
  for (let L = 0; L < layers; L++) {
    const f = Math.pow(0.62, L);
    const sc = 1 - L * 0.035;
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2 * f, 1.8 * f, 1.2 * f), toneMapped: false });
    const inst = new THREE.InstancedMesh(dot, mat, perimeter.length);
    perimeter.forEach(([x, y], i) => {
      m4.makeTranslation(x * sc, y * sc, -0.012 - L * (depth / layers) * 0.9);
      inst.setMatrixAt(i, m4);
    });
    g.add(inst);
  }
  // A few green dots, like the colour glitch along the bottom in the photo.
  const green = new THREE.InstancedMesh(dot, new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 2.2, 0.6), toneMapped: false }), 12);
  for (let i = 0; i < 12; i++) {
    m4.makeTranslation(-iw / 2 + (i + 0.5) * (iw / 12), -ih / 2 * 0.965, -0.03);
    green.setMatrixAt(i, m4);
  }
  g.add(green);

  // Frosted shelf at the bottom of the box (the pale band in the photo).
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(iw, 0.12, 0.01), new THREE.MeshStandardMaterial({ color: '#d9e3da', roughness: 0.6, transparent: true, opacity: 0.6 }));
  shelf.position.set(0, -h / 2 + t + 0.08, -0.01);
  g.add(shelf);

  const sign = makeNeonSign();
  sign.position.set(0, 0.22, -depth * 0.45);
  sign.rotation.y = Math.PI; // the sign faces the street, so from inside it reads mirrored (as in the photo)
  g.add(sign);
  return g;
}
