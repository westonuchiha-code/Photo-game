// Ground-floor living room in the Elmwood Apartments, from the interior photos.
// Built in the apartment's local coordinates (front wall at z = +5, the unit door in the
// hallway's west wall at x = -0.95, z = 0.8). Yellow walls with white crown molding, dark
// wood floor; a wide built-in white bookshelf in the corner, a narrow one between the two
// front windows; a window seat with cabinet doors and a striped cushion under a floral roman
// shade; a wood side table with the painted ceramic lamp and photo frames, a framed painting
// above, a blue-and-white vase on the floor. Books get made-up titles; shelves hold small
// figurines, a bowl and a floral box. All titles and pictures in frames are made up.
import * as THREE from 'three';
import { holeyWall } from './units.js';

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
  t.anisotropy = 8;
  return t;
}
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.8, ...o });
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};
function plane(w, h, mat, x, y, z, ry = 0, rx = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.set(rx, ry, 0);
  m.receiveShadow = true;
  return m;
}
function uvPlane(w, h, mat, unitU, unitV) {   // texture repeats every unit metres
  const g = new THREE.PlaneGeometry(w, h);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / unitU, uv.getY(i) * h / unitV);
  const m = new THREE.Mesh(g, mat);
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- book spines atlas (made-up titles)
const TITLES = ['RIVER MAPS', 'FLAGS', 'THE QUIET HOUSE', 'DICTIONARY', 'OLD HARBORS', 'COLOR THEORY', 'GARDEN NOTES', 'A SHORT HISTORY OF CHAIRS',
  'NORTH WIND', 'THE BLUE ROOM', 'STREET PHOTOGRAPHS', 'COOKING WITH BEANS', 'LETTERS', 'MOUNTAIN TOWNS', 'POEMS', 'THE LONG SUMMER',
  'ATLAS', 'BIRDS OF THE COAST', 'MODERN ARCHITECTURE', 'SPANISH GRAMMAR', 'TWENTY STORIES', 'ON PAINTING', 'THE LIGHTHOUSE KEEPER', 'FOLK ART',
  'CITY OF STAIRS', 'TRAVEL JOURNALS', 'THE ORCHARD', 'MASKS & MYTHS', 'TIDE TABLES', 'SILENT FILMS', 'THE GLASS HOUSE', 'ESSAYS'];
const SPINE_COLS = ['#7a1f24', '#c9b48a', '#1f3550', '#e6dfcf', '#2e2f33', '#b5562e', '#d8cfa8', '#5a2e3a', '#28503f', '#e2a43a', '#8a8f96', '#efe9dc',
  '#3b2a20', '#a8323a', '#d36a3c', '#f1ece0', '#4a5f7d', '#6b4a2a', '#c4c0b2', '#1b1b1e', '#d9c27a', '#9b2f4f', '#f3efe4', '#355e7a',
  '#e9e2cf', '#7d6a4a', '#b13a2e', '#2a4a7a', '#e8d8b0', '#5b5f3a', '#cf8f5a', '#202a3a'];
const SLOTS = 32, SW = 64, SH = 512;
let spineMat = null;
function spineMaterial() {
  if (spineMat) return spineMat;
  const t = canvasTex(SW * SLOTS, SH, (x, w, h) => {
    for (let i = 0; i < SLOTS; i++) {
      const c = SPINE_COLS[i];
      x.fillStyle = c; x.fillRect(i * SW, 0, SW, h);
      const light = parseInt(c.slice(1, 3), 16) + parseInt(c.slice(3, 5), 16) + parseInt(c.slice(5, 7), 16) > 420;
      x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(i * SW, 0, 4, h); x.fillRect(i * SW + SW - 4, 0, 4, h);
      // bands
      if (i % 3 === 0) { x.fillStyle = light ? '#7a1f24' : '#d9c27a'; x.fillRect(i * SW + 4, 30, SW - 8, 10); x.fillRect(i * SW + 4, h - 50, SW - 8, 10); }
      // title, rotated to run up the spine
      x.save();
      x.translate(i * SW + SW / 2, h / 2);
      x.rotate(-Math.PI / 2);
      x.fillStyle = light ? '#1d1d1f' : '#efe7d2';
      const t2 = TITLES[i];
      x.font = (i % 2 ? `700 ${t2.length > 16 ? 20 : 26}px "Cinzel"` : `600 ${t2.length > 16 ? 24 : 30}px "Oswald"`);
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(t2, 20, 0, h - 120);
      x.font = '16px "Roboto Condensed"';
      x.fillText(['B. ALVAREZ', 'M. CHEN', 'R. OKAFOR', 'L. MARTIN'][i % 4], -h / 2 + 70, 0);
      x.restore();
    }
  });
  spineMat = std({ map: t, roughness: 0.75 });
  return spineMat;
}
const pageMat = std({ color: '#efe8d6', roughness: 0.9 });
function book(w, h, d, slot) {
  // BoxGeometry face groups: +x, -x, +y, -y, +z(spine), -z
  const geo = new THREE.BoxGeometry(w, h, d);
  const uv = geo.attributes.uv;
  const u0 = slot / SLOTS + 0.002, u1 = (slot + 1) / SLOTS - 0.002;
  const vs = Math.min(1, h / 0.32);
  const v0 = 0.5 - vs / 2, v1 = 0.5 + vs / 2;
  for (let i = 16; i < 20; i++) uv.setXY(i, uv.getX(i) ? u1 : u0, uv.getY(i) ? v1 : v0);
  const cover = std({ color: SPINE_COLS[slot], roughness: 0.75 });
  const m = new THREE.Mesh(geo, [cover, cover, pageMat, pageMat, spineMaterial(), cover]);
  m.castShadow = true;
  return m;
}

// ---------------------------------------------------------------- built-in bookshelf
function bookshelf(w, h, d, seed, extras) {
  // front at +z, back at -z, base at y = 0. extras(level, g, y, xLeft, xRight) may place objects.
  const g = new THREE.Group();
  const white = std({ color: '#f2f0ea', roughness: 0.55 });
  const T = 0.03;
  g.add(box(T, h, d, white, -w / 2 + T / 2, h / 2, 0), box(T, h, d, white, w / 2 - T / 2, h / 2, 0));
  g.add(box(w, T, d, white, 0, h - T / 2, 0));
  g.add(box(w, 0.1, d, white, 0, 0.05, 0));                 // kick base
  g.add(box(w - 2 * T, h, 0.01, white, 0, h / 2, -d / 2 + 0.005));
  g.add(box(w + 0.06, 0.08, 0.04, white, 0, h - 0.04, d / 2 + 0.01));   // face frame top
  for (const sx of [-1, 1]) g.add(box(0.05, h, 0.02, white, sx * (w / 2 - 0.025), h / 2, d / 2 + 0.005));
  // shelf-pin strips (photo: dotted metal strips)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.008, h - 0.2, 0.004, std({ color: '#9a9c9c', metalness: 0.5 }), sx * (w / 2 - T - 0.005), h / 2, sz * (d / 2 - 0.05)));
  const r = rng(seed);
  const levels = Math.round((h - 0.1) / 0.36);
  const step = (h - 0.13) / levels;
  for (let L = 0; L < levels; L++) {
    const y = 0.1 + L * step;
    if (L > 0) g.add(box(w - 2 * T, 0.02, d - 0.01, white, 0, y, 0.005));
    const top = y + step - 0.03;
    let x = -w / 2 + T + 0.01;
    const xr = w / 2 - T - 0.01;
    const used = extras ? extras(L, g, y + 0.01, x, xr, r) : null;     // returns x range taken
    let blockA = used ? used[0] : xr, blockB = used ? used[1] : xr;
    const fill = (xa, xb) => {
      let x = xa;
      while (x < xb - 0.02) {
        if (r() < 0.12 && xb - x > 0.2) {                    // a lying stack
          const n = 2 + Math.floor(r() * 4); let yy = y + 0.01;
          const ww = 0.17 + r() * 0.07;
          for (let k = 0; k < n; k++) {
            const bh = 0.025 + r() * 0.025;
            const bb = box(ww, bh, d * 0.8, std({ color: SPINE_COLS[Math.floor(r() * SLOTS)] }), x + ww / 2, yy + bh / 2, 0);
            g.add(bb); yy += bh;
            if (yy > top - 0.05) break;
          }
          x += ww + 0.01;
          continue;
        }
        const bw = 0.022 + r() * 0.03;
        if (x + bw > xb) break;
        const bh = Math.min(top - y - 0.02, 0.2 + r() * 0.12);
        const b = book(bw, bh, d * (0.7 + r() * 0.18), Math.floor(r() * SLOTS));
        b.position.set(x + bw / 2, y + 0.01 + bh / 2, d / 2 - b.geometry.parameters.depth / 2 - 0.02);
        if (r() < 0.06) { b.rotation.z = -0.15; b.position.x += 0.02; }
        g.add(b);
        x += bw + 0.002;
      }
    };
    fill(x, blockA);
    if (blockB < xr) fill(blockB, xr);
  }
  return g;
}

// ---------------------------------------------------------------- small things
function figurine(col, h, seed) {
  const r = rng(seed);
  const pts = [[0, 0], [0.025, 0], [0.028, h * 0.1], [0.02, h * 0.5], [0.024, h * 0.7], [0.012, h * 0.82], [0.018, h * 0.9], [0.012, h], [0, h]].map(([a, b]) => new THREE.Vector2(a * (0.9 + r() * 0.3), b));
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 10), std({ color: col, roughness: 0.4, metalness: 0.2 }));
  m.castShadow = true;
  return m;
}
function photoFrame(round, seed) {
  // generic picture (no real photo): soft landscape
  const g = new THREE.Group();
  const pic = canvasTex(64, 64, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, ['#9cc3e8', '#f2c49a'][seed % 2]); gr.addColorStop(1, '#5d8a5a');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = '#3f6a44'; x.beginPath(); x.moveTo(0, 44); x.quadraticCurveTo(30, 30, 64, 46); x.lineTo(64, 64); x.lineTo(0, 64); x.fill();
  });
  if (round) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.008, 6, 24), std({ color: '#c9ccd2', metalness: 0.8, roughness: 0.3 }));
    g.add(ring);
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.05, 24), std({ map: pic })); p.position.z = 0.002; g.add(p);
  } else {
    g.add(box(0.11, 0.14, 0.012, std({ color: '#9a9c9e', metalness: 0.7, roughness: 0.35 })));
    const p = plane(0.08, 0.1, std({ map: pic }), 0, 0, 0.007); g.add(p);
  }
  return g;
}

// ---------------------------------------------------------------- the room
export function makeLivingRoom({ F1, FH, x0, x1, z0, z1, doorZ, doorW, sideWin = null }) {
  const g = new THREE.Group();
  const colliders = [];
  const solid = (a, b, c, d) => colliders.push([a, b, c, d, F1, F1 + FH]);
  const H = FH;
  const wallMat = std({ color: '#ecd27e', roughness: 0.92, emissive: '#2a2210' });
  const white = std({ color: '#f3f1ea', roughness: 0.55 });
  const floorMat = std({ map: ptex('liv_floor.png', 1, 1), color: '#f0c8a8', roughness: 0.5 });
  const W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;

  // floor + ceiling
  const fl = uvPlane(W, D, floorMat, 1.2, 0.6); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, F1 + 0.006, cz); g.add(fl);
  const ce = plane(W, D, std({ color: '#f6f3ea', emissive: '#2a2820' }), cx, F1 + H - 0.01, cz, 0, Math.PI / 2); g.add(ce);
  // walls (yellow), with the unit door gap on the east wall
  const wall = (len, x, z, ry) => { const p = uvPlane(len, H, wallMat, 0.9, 1.8); p.position.set(x, F1 + H / 2, z); p.rotation.y = ry; g.add(p); };
  wall(W, cx, z0 + 0.005, 0);                          // back partition (faces +z)
  if (!sideWin) wall(D, x0 + 0.005, cz, Math.PI / 2);   // west
  else {
    // west wall with the side window (matches the outside), white trim + stool + half-drawn blind
    const u = -(sideWin.c - cz), y0 = sideWin.yc - F1 - sideWin.h / 2, y1 = sideWin.yc - F1 + sideWin.h / 2;
    const ww = holeyWall(D, H, [{ u0: u - sideWin.w / 2, u1: u + sideWin.w / 2, y0, y1 }], wallMat, 0.9, 1.8);
    const fr = new THREE.Group(); fr.position.set(x0 + 0.005, F1, cz); fr.rotation.y = Math.PI / 2; fr.add(ww); g.add(fr);
    for (const sx of [-1, 1]) fr.add(box(0.07, y1 - y0 + 0.07, 0.02, white, u + sx * (sideWin.w / 2 + 0.035), (y0 + y1) / 2, 0.01));
    fr.add(box(sideWin.w + 0.14, 0.07, 0.02, white, u, y1 + 0.035, 0.01), box(sideWin.w + 0.18, 0.035, 0.12, white, u, y0 - 0.017, 0.05));
    const shade = std({ map: ptex('liv_shade.png', sideWin.w / 0.5, 1.2), color: '#fff4f0', side: THREE.DoubleSide, roughness: 0.95, emissive: '#2a2024' });
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(sideWin.w + 0.04, 0.55), shade); sp.position.set(u, y1 - 0.3, -0.06); fr.add(sp);
    fr.add(box(sideWin.w + 0.08, 0.05, 0.06, std({ color: '#efe9dc' }), u, y1 + 0.02, -0.06));
  }
  const dA = doorZ - doorW / 2, dB = doorZ + doorW / 2, DH = 2.06;
  wall(dA - z0, x1 - 0.005, (z0 + dA) / 2, -Math.PI / 2);
  wall(z1 - dB, x1 - 0.005, (dB + z1) / 2, -Math.PI / 2);
  { const p = uvPlane(doorW, H - DH, wallMat, 0.9, 1.8); p.position.set(x1 - 0.005, F1 + DH + (H - DH) / 2, doorZ); p.rotation.y = -Math.PI / 2; g.add(p); }
  // front wall with two window openings
  const WINS = [[-5.3, 1.2], [-3.4, 1.2]], SILL = 0.75, WTOP = 2.25;
  {
    const xs = [x0, ...WINS.flatMap(([c, w]) => [c - w / 2, c + w / 2]), x1];
    for (let i = 0; i < xs.length; i += 2) { const len = xs[i + 1] - xs[i]; if (len > 0.01) { const p = uvPlane(len, H, wallMat, 0.9, 1.8); p.position.set((xs[i] + xs[i + 1]) / 2, F1 + H / 2, z1 - 0.005); p.rotation.y = Math.PI; g.add(p); } }
    for (const [c, w] of WINS) {
      const lo = uvPlane(w, SILL, wallMat, 0.9, 1.8); lo.position.set(c, F1 + SILL / 2, z1 - 0.005); lo.rotation.y = Math.PI; g.add(lo);
      const hi = uvPlane(w, H - WTOP, wallMat, 0.9, 1.8); hi.position.set(c, F1 + WTOP + (H - WTOP) / 2, z1 - 0.005); hi.rotation.y = Math.PI; g.add(hi);
    }
  }
  // crown molding + baseboards
  for (const [len, x, z, ry] of [[W, cx, z0, 0], [W, cx, z1, Math.PI], [D, x0, cz, Math.PI / 2], [D, x1, cz, -Math.PI / 2]]) {
    const cr = new THREE.Group();
    cr.add(box(len, 0.1, 0.03, white, 0, -0.05, 0.015), box(len, 0.03, 0.09, white, 0, -0.015, 0.045), box(len, 0.05, 0.05, white, 0, -0.06, 0.04));
    cr.children[2].rotation.x = 0.7;
    cr.position.set(x, F1 + H, z); cr.rotation.y = ry; g.add(cr);
    const bb = box(len, 0.12, 0.018, white, 0, 0, 0);
    const bg = new THREE.Group(); bg.add(bb); bb.position.set(0, 0.06, 0.009); bg.position.set(x, F1, z); bg.rotation.y = ry; g.add(bg);
  }
  // door casing on the room side
  for (const z of [dA - 0.04, dB + 0.04]) g.add(box(0.02, DH + 0.05, 0.08, white, x1 - 0.015, F1 + DH / 2, z));
  g.add(box(0.02, 0.09, doorW + 0.16, white, x1 - 0.015, F1 + DH + 0.045, doorZ));

  // windows: white frames, sash bars, night city view, deep sills
  const view = canvasTex(256, 256, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0d1424'); gr.addColorStop(1, '#2a3346');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    const r = rng(17);
    for (let b = 0; b < 6; b++) {
      const bx = b * 46 - 10 + r() * 10, bw = 40 + r() * 20, bt = 40 + r() * 120;
      x.fillStyle = ['#151821', '#1b1f2a', '#121520'][b % 3]; x.fillRect(bx, bt, bw, h - bt);
      for (let wy = bt + 8; wy < h - 6; wy += 14) for (let wx = bx + 5; wx < bx + bw - 6; wx += 10) if (r() < 0.35) { x.fillStyle = r() < 0.7 ? '#f3d58a' : '#cfe0f5'; x.fillRect(wx, wy, 5, 7); }
    }
  });
  const viewMat = new THREE.MeshBasicMaterial({ map: view, color: new THREE.Color(0.8, 0.8, 0.8) });
  for (const [c, w] of WINS) {
    const frame = std({ color: '#f4f2ec', roughness: 0.45 });
    for (const sx of [-1, 1]) g.add(box(0.07, WTOP - SILL + 0.1, 0.12, frame, c + sx * (w / 2 - 0.03), F1 + (SILL + WTOP) / 2, z1 - 0.02));
    g.add(box(w, 0.07, 0.12, frame, c, F1 + WTOP - 0.03, z1 - 0.02));
    g.add(box(w - 0.06, 0.05, 0.05, frame, c, F1 + (SILL + WTOP) / 2, z1 + 0.03));     // meeting rail
    g.add(box(0.03, WTOP - SILL, 0.04, frame, c, F1 + (SILL + WTOP) / 2, z1 + 0.035));
    g.add(box(w + 0.12, 0.04, 0.24, frame, c, F1 + SILL - 0.02, z1 - 0.08));          // stool / sill
    // floral roman shade, part-way down, folds
    const shade = std({ map: ptex('liv_shade.png', w / 0.5, 1.2), color: '#fff4f0', side: THREE.DoubleSide, roughness: 0.95, emissive: '#2a2024' });
    // pulled part-way down: a fabric panel with soft horizontal folds bellying into the room
    const SHH = 0.62;
    const sg = new THREE.PlaneGeometry(w + 0.06, SHH, 1, 40);
    const sp = sg.attributes.position;
    for (let i = 0; i < sp.count; i++) { const y = sp.getY(i); const t = (SHH / 2 - y) / SHH; sp.setZ(i, 0.035 * Math.pow(Math.abs(Math.sin(t * Math.PI * 3.5)), 0.7) * (0.4 + t)); }
    sg.computeVertexNormals();
    const sm = new THREE.Mesh(sg, shade);
    sm.position.set(c, F1 + WTOP - SHH / 2 + 0.02, z1 - 0.1); sm.rotation.y = Math.PI;
    g.add(sm);
    g.add(box(w + 0.08, 0.05, 0.06, std({ color: '#efe9dc' }), c, F1 + WTOP + 0.02, z1 - 0.1));   // headrail
  }

  // window seat under the left window: cabinet doors + striped cushion (photo)
  const seatX0 = x0 + 0.38, seatX1 = WINS[0][0] + WINS[0][1] / 2 + 0.05, seatD = 0.5, seatH = 0.46;
  {
    const sw = seatX1 - seatX0, sc = (seatX0 + seatX1) / 2, sz = z1 - seatD / 2;
    g.add(box(sw, seatH, seatD, white, sc, F1 + seatH / 2, sz));
    const nDoors = 2;
    for (let i = 0; i < nDoors; i++) {
      const dw = sw / nDoors - 0.03, dxc = seatX0 + (i + 0.5) * sw / nDoors;
      const d = new THREE.Group();
      d.add(box(dw, seatH - 0.1, 0.015, white, 0, 0, 0));
      for (const [w2, h2, ox, oy] of [[dw - 0.12, 0.02, 0, (seatH - 0.24) / 2], [dw - 0.12, 0.02, 0, -(seatH - 0.24) / 2], [0.02, seatH - 0.26, (dw - 0.14) / 2, 0], [0.02, seatH - 0.26, -(dw - 0.14) / 2, 0]]) d.add(box(w2, h2, 0.01, std({ color: '#e4e2da' }), ox, oy, 0.011));
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), std({ color: '#e8e6df' })); knob.position.set(i ? -dw / 2 + 0.06 : dw / 2 - 0.06, 0.05, 0.02); d.add(knob);
      d.position.set(dxc, F1 + seatH / 2 + 0.01, z1 - seatD - 0.008);
      g.add(d);
    }
    const stripes = canvasTex(512, 64, (x, w, h) => {
      const seq = ['#efe3c4', '#d98a8f', '#efe3c4', '#b8323f', '#f4ecd8', '#c96a78', '#efe3c4', '#e2b8b0', '#efe3c4', '#9d2c3a', '#f4ecd8', '#d98a8f'];
      let xx = 0, i = 0; const r = rng(4);
      while (xx < w) { const sw2 = 6 + r() * 22; x.fillStyle = seq[i++ % seq.length]; x.fillRect(xx, 0, sw2, h); xx += sw2; }
    });
    stripes.wrapS = THREE.RepeatWrapping; stripes.repeat.set(sw / 0.8, 1);
    const cushMat = std({ map: stripes, roughness: 0.95 });
    const cg = new THREE.BoxGeometry(sw - 0.02, 0.1, seatD - 0.02, 8, 2, 4);
    const cp = cg.attributes.position;
    for (let i = 0; i < cp.count; i++) { const y = cp.getY(i); if (y > 0) { const nx = cp.getX(i) / (sw / 2), nz = cp.getZ(i) / (seatD / 2); cp.setY(i, y + 0.02 * (1 - nx * nx) * (1 - nz * nz)); } }
    cg.computeVertexNormals();
    const cu = new THREE.Mesh(cg, cushMat); cu.position.set(sc, F1 + seatH + 0.05, sz); cu.castShadow = true; g.add(cu);
    const piping = std({ color: '#b8323f' });
    g.add(box(sw - 0.02, 0.012, 0.012, piping, sc, F1 + seatH + 0.1, z1 - seatD + 0.01));
    solid(seatX0, seatX1, z1 - seatD, z1);
  }

  // wide built-in bookshelf in the corner (photo 2 / room photo), against the west wall
  const shelfExtras2 = (L, g2, y, xl, xr, r) => {
    if (L === 2) {                                   // figurines on the middle shelf
      const cols = ['#2f5b5a', '#5d4a2c', '#3a6a6a', '#c9a24a', '#30282a'];
      for (let i = 0; i < 5; i++) { const f = figurine(cols[i], 0.11 + r() * 0.07, i + 3); f.position.set(xl + 0.06 + i * 0.07, y, 0.02 + (i % 2) * 0.04); g2.add(f); }
      return [xl, xl + 0.4];
    }
    if (L === 1) {                                   // teal bowl beside the books
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), std({ color: '#b8814f', roughness: 0.7, side: THREE.DoubleSide }));
      bowl.rotation.x = Math.PI; bowl.position.set(xr - 0.1, y + 0.075, 0.03); bowl.scale.y = 0.6; g2.add(bowl);
      const glaze = new THREE.Mesh(new THREE.CircleGeometry(0.068, 18), std({ color: '#1e4d4f', roughness: 0.3 })); glaze.rotation.x = -Math.PI / 2; glaze.position.set(xr - 0.1, y + 0.035, 0.03); g2.add(glaze);
      return [xr - 0.2, xr];
    }
    if (L === 0) {                                   // floral box on the bottom shelf
      const fm = std({ map: ptex('liv_floralbox.png'), roughness: 0.6 });
      const fb = box(0.42, 0.12, 0.28, [fm, fm, fm, fm, fm, fm], xl + 0.23, y + 0.06, 0.0); g2.add(fb);
      return [xl, xl + 0.46];
    }
    return null;
  };
  const shelf2 = bookshelf(1.1, 2.62, 0.36, 5, shelfExtras2);
  shelf2.position.set(x0 + 0.18, F1, z1 - 0.95); shelf2.rotation.y = Math.PI / 2;
  g.add(shelf2);
  solid(x0, x0 + 0.38, z1 - 1.5, z1 - 0.4);
  // narrow built-in between the windows (photo 1)
  const nx0 = WINS[0][0] + WINS[0][1] / 2 + 0.02, nx1 = WINS[1][0] - WINS[1][1] / 2 - 0.02;
  const shelf1 = bookshelf(nx1 - nx0, 2.62, 0.32, 9, (L, g2, y, xl, xr, r) => {
    if (L === 4) { for (let i = 0; i < 2; i++) { const f = figurine(['#7a6a52', '#2f5b5a'][i], 0.1, 20 + i); f.position.set(xr - 0.06 - i * 0.07, y, 0.02); g2.add(f); } return [xr - 0.16, xr]; }
    return null;
  });
  shelf1.position.set((nx0 + nx1) / 2, F1, z1 - 0.17); shelf1.rotation.y = Math.PI;
  g.add(shelf1);
  solid(nx0, nx1, z1 - 0.34, z1);

  // side table + ceramic lamp + photo frames, painting above, vase on the floor (room photo)
  const tz = z1 - 2.2;
  {
    // built against the west wall, then turned onto the back (partition) wall so the side window stays clear
    const gAll = g;
    const tg = new THREE.Group();
    const solidT = [];
    { const g = tg; const solid = (a2, b2, c2, d2) => solidT.push([a2, b2, c2, d2]);
    const wood = std({ map: ptex('liv_wood.png'), color: '#a27058', roughness: 0.45 });
    const t = new THREE.Group();
    t.add(box(0.5, 0.03, 0.62, wood, 0, 0.66, 0));
    t.add(box(0.46, 0.12, 0.58, wood, 0, 0.58, 0));
    t.add(box(0.44, 0.02, 0.56, wood, 0, 0.2, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.add(box(0.035, 0.66, 0.035, wood, sx * 0.21, 0.33, sz * 0.27));
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), std({ color: '#b08a4a', metalness: 0.8 })); knob.position.set(0.235, 0.58, 0); t.add(knob);
    t.position.set(x0 + 0.3, F1, tz);
    g.add(t);
    // ginger-jar lamp: body textured from the photo
    const lampBody = new THREE.LatheGeometry([[0, 0], [0.07, 0], [0.075, 0.03], [0.1, 0.12], [0.11, 0.22], [0.095, 0.3], [0.06, 0.34], [0.03, 0.36], [0, 0.36]].map(([a, b]) => new THREE.Vector2(a, b)), 28);
    const lb = new THREE.Mesh(lampBody, std({ map: ptex('liv_lamp.png', 2, 1), roughness: 0.3, side: THREE.DoubleSide }));
    lb.position.set(x0 + 0.3, F1 + 0.68, tz - 0.08); lb.rotation.y = -Math.PI / 2; lb.castShadow = true; g.add(lb);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.09, 0.03, 24), std({ color: '#5a2a1e', roughness: 0.4 })); base.position.set(x0 + 0.3, F1 + 0.69, tz - 0.08); g.add(base);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 8), std({ color: '#c9a24a', metalness: 0.8, roughness: 0.3 })); stem.position.set(x0 + 0.3, F1 + 1.15, tz - 0.08); g.add(stem);
    const shadeM = new THREE.MeshStandardMaterial({ color: '#f6efd8', emissive: '#d8b878', emissiveIntensity: 0.55, side: THREE.DoubleSide, roughness: 0.9 });
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 0.26, 32, 1, true), shadeM); sh.position.set(x0 + 0.3, F1 + 1.3, tz - 0.08); g.add(sh);
    const lampLight = new THREE.PointLight('#ffd9a0', 4.5, 7, 1.4); lampLight.position.set(x0 + 0.45, F1 + 1.25, tz - 0.08); g.add(lampLight);
    // photo frames
    const f1 = photoFrame(true, 0); f1.position.set(x0 + 0.32, F1 + 0.74, tz + 0.18); f1.rotation.set(-0.15, Math.PI / 2 - 0.4, 0); g.add(f1);
    const f2 = photoFrame(false, 1); f2.position.set(x0 + 0.2, F1 + 0.76, tz + 0.24); f2.rotation.set(-0.12, Math.PI / 2 - 0.2, 0); g.add(f2);
    solid(x0, x0 + 0.56, tz - 0.32, tz + 0.32);
    // framed painting above (photo) in a gold frame with a linen mat
    const pg = new THREE.Group();
    const gold = std({ color: '#b8923a', metalness: 0.6, roughness: 0.35 });
    pg.add(box(0.98, 0.72, 0.05, gold));
    pg.add(box(0.86, 0.6, 0.052, std({ color: '#d9cfb8', roughness: 0.9 })));
    pg.add(plane(0.76, 0.5, std({ map: ptex('liv_painting.png'), roughness: 0.7 }), 0, 0, 0.028));
    const lip = std({ color: '#d8b456', metalness: 0.6, roughness: 0.3 });
    for (const [w2, h2, ox, oy] of [[0.98, 0.03, 0, 0.345], [0.98, 0.03, 0, -0.345], [0.03, 0.72, 0.475, 0], [0.03, 0.72, -0.475, 0]]) pg.add(box(w2, h2, 0.07, lip, ox, oy, 0.01));
    pg.position.set(x0 + 0.03, F1 + 1.95, tz); pg.rotation.y = Math.PI / 2;
    g.add(pg);
    // blue-and-white vase on the floor beside the table
    const vpts = [[0, 0], [0.09, 0], [0.13, 0.08], [0.15, 0.2], [0.13, 0.32], [0.06, 0.42], [0.045, 0.46], [0.06, 0.5], [0.05, 0.5], [0.035, 0.46], [0, 0.46]].map(([a, b]) => new THREE.Vector2(a, b));
    const vase = new THREE.Mesh(new THREE.LatheGeometry(vpts, 28), std({ map: ptex('liv_vase.png', 3, 1), roughness: 0.25, side: THREE.DoubleSide }));
    vase.position.set(x0 + 0.25, F1, tz + 0.55); vase.castShadow = true; g.add(vase);
    solid(x0, x0 + 0.42, tz + 0.38, tz + 0.72);
    }
    // local (x, z) -> world: rotate -90 deg so x0-wall -> z0-wall
    tg.rotation.y = -Math.PI / 2;
    tg.position.set(x0 + 1.5 + tz, 0, z0 - x0);
    gAll.add(tg);
    for (const [a2, b2, c2, d2] of solidT) {
      const pts = [[a2, c2], [b2, c2], [a2, d2], [b2, d2]].map(([x, z]) => [-z + tg.position.x, x + tg.position.z]);
      solid(Math.min(...pts.map((q) => q[0])), Math.max(...pts.map((q) => q[0])), Math.min(...pts.map((q) => q[1])), Math.max(...pts.map((q) => q[1])));
    }
  }

  // soft ceiling light so the room reads at night
  const cl = new THREE.PointLight('#fff1d6', 2.2, 9, 1.6); cl.position.set(cx + 0.5, F1 + H - 0.3, cz + 0.6); g.add(cl);

  g.userData.colliders = colliders;
  return g;
}
