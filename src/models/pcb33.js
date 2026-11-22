// Circuit board + braided elastic cords (queue item 33, photos/grime/).
//   makeCircuitBoard()  the back of a drive-controller board: olive-green solder mask (colour sampled from the
//     photo) over copper traces (slightly raised, lighter where the mask covers copper), round test pads with
//     tin centres, white silkscreen reference marks (E1.., P3, R12, TV9.. generic), vias, a notched outline, a
//     shiny star-head (Torx) screw in each corner, a black connector along one edge, a few small parts.
//   makeCordBundle()    a bundle of round braided elastic cords (black, purple, blue, green, yellow, white) laid
//     side by side and drooping over an edge, braid weave from the photo, plus one loose coil
// Units metres.
import * as THREE from 'three';
import { afterStart } from '../defer.js';
import { F } from '../fonts.js';

const _L = new THREE.TextureLoader();
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function boardTextures(W, H) {
  const S = 2048, ppm = S / W, CH = Math.round(H * ppm);
  const col = document.createElement('canvas'); col.width = S; col.height = CH; const c = col.getContext('2d');
  const hgt = document.createElement('canvas'); hgt.width = S; hgt.height = CH; const h = hgt.getContext('2d');
  const r = rng(33);
  // mask base with slight mottling
  c.fillStyle = '#4b5230'; c.fillRect(0, 0, S, CH);
  for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '30,40,15' : '120,130,80'},0.05)`; c.fillRect(r() * S, r() * CH, 3 + r() * 10, 3 + r() * 10); }
  h.fillStyle = '#404040'; h.fillRect(0, 0, S, CH);
  // traces: Manhattan routes with 45-degree jogs, in bundles
  const trace = (pts, w) => {
    for (const [ctx, style] of [[c, '#5f6a38'], [h, '#a0a0a0']]) { ctx.strokeStyle = style; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
    c.strokeStyle = 'rgba(160,170,110,0.25)'; c.lineWidth = Math.max(1, w * 0.3); c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x - 1, y - 1) : c.moveTo(x - 1, y - 1))); c.stroke();
  };
  for (let b = 0; b < 9; b++) {
    const x0 = r() * S, y0 = r() * CH, n = 3 + Math.floor(r() * 5), dx = r() < 0.5 ? 1 : -1, dy = r() < 0.5 ? 1 : -1;
    const L1 = 100 + r() * 400, L2 = 100 + r() * 500;
    for (let k = 0; k < n; k++) { const o = k * 14; trace([[x0 + o, y0], [x0 + o, y0 + dy * L1], [x0 + o + dx * 60, y0 + dy * (L1 + 60)], [x0 + o + dx * 60, y0 + dy * (L1 + 60 + L2)]], 5); }
  }
  // test pads with labels
  const pads = [];
  for (let i = 0; i < 90; i++) {
    const x = 80 + r() * (S - 160), y = 80 + r() * (CH - 160);
    if (pads.some(([px, py]) => Math.hypot(px - x, py - y) < 60)) continue;
    pads.push([x, y]);
    const rr = 9 + r() * 6;
    c.fillStyle = '#c8c8be'; c.beginPath(); c.arc(x, y, rr, 0, 7); c.fill();
    c.strokeStyle = '#ecece4'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, rr + 6, 0, 7); c.stroke();
    h.fillStyle = '#e0e0e0'; h.beginPath(); h.arc(x, y, rr, 0, 7); h.fill();
    c.save(); c.translate(x + (r() < 0.5 ? 22 : -22), y); c.rotate(-Math.PI / 2); c.fillStyle = '#e9e9e2'; c.font = `22px ${F.small}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(['E', 'E', 'E', 'P', 'TV'][Math.floor(r() * 5)] + (1 + Math.floor(r() * 90)), 0, 0); c.restore();
  }
  // vias
  for (let i = 0; i < 260; i++) { const x = r() * S, y = r() * CH; c.fillStyle = '#7a7c58'; c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); c.fillStyle = '#20240f'; c.beginPath(); c.arc(x, y, 2.2, 0, 7); c.fill(); }
  // component outlines (R12, R37 style) + board legend (made up)
  c.strokeStyle = '#e9e9e2'; c.lineWidth = 3;
  for (let i = 0; i < 8; i++) { const x = r() * S, y = r() * CH; c.strokeRect(x, y, 26, 54); c.fillStyle = '#e9e9e2'; c.font = `20px ${F.small}`; c.fillText('R' + (10 + Math.floor(r() * 40)), x + 34, y + 30); }
  c.save(); c.translate(S * 0.78, CH * 0.3); c.rotate(-Math.PI / 2); c.fillStyle = '#e9e9e2'; c.font = `30px ${F.small}`; c.textAlign = 'center';
  c.fillText('NORTHGATE  CTRL-4  REV B', 0, 0); c.font = `24px ${F.small}`; c.fillText('94V-0  ·  KX 2207', 0, 34); c.restore();
  // board edge line
  c.strokeStyle = '#e9e9e2'; c.lineWidth = 4; c.strokeRect(20, 20, S - 40, CH - 40);
  const t = new THREE.CanvasTexture(col); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  // normal map from the height canvas: 2 megapixels of per-pixel maths, done after the world is on screen
  const nc = document.createElement('canvas'); nc.width = S; nc.height = CH; { const x = nc.getContext('2d'); x.fillStyle = 'rgb(128,128,255)'; x.fillRect(0, 0, S, CH); }
  const n = new THREE.CanvasTexture(nc);
  afterStart(() => {
    const hd = h.getImageData(0, 0, S, CH).data, nm = c.createImageData(S, CH), nd = nm.data;
    for (let y = 0; y < CH; y++) { const ym = Math.max(0, y - 1) * S, yp = Math.min(CH - 1, y + 1) * S, yy = y * S;
      for (let x = 0; x < S; x++) { const xm = x > 0 ? x - 1 : 0, xp = x < S - 1 ? x + 1 : x;
        const dx = (hd[(yy + xp) * 4] - hd[(yy + xm) * 4]) / 255 * 2.5, dy = (hd[(yp + x) * 4] - hd[(ym + x) * 4]) / 255 * 2.5, l = Math.sqrt(dx * dx + dy * dy + 1), i = (yy + x) * 4;
        nd[i] = (-dx / l * 0.5 + 0.5) * 255; nd[i + 1] = (dy / l * 0.5 + 0.5) * 255; nd[i + 2] = (1 / l * 0.5 + 0.5) * 255; nd[i + 3] = 255; } }
    nc.getContext('2d').putImageData(nm, 0, 0); n.needsUpdate = true;
  });
  return { t, n };
}

function torxScrew(r = 0.0045) {
  const g = new THREE.Group();
  const head = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.05, r * 0.5, 28), new THREE.MeshStandardMaterial({ color: '#d8d6cc', metalness: 0.9, roughness: 0.25, emissive: '#3a3830', emissiveIntensity: 0.4 }));
  head.position.y = r * 0.25; g.add(head);
  const washer = new THREE.Mesh(new THREE.RingGeometry(r, r * 1.5, 28), new THREE.MeshStandardMaterial({ color: '#b07a4a', metalness: 0.7, roughness: 0.4 })); washer.rotation.x = -Math.PI / 2; washer.position.y = 0.0002; g.add(washer);
  const sh = new THREE.Shape();
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, rr = i % 2 ? r * 0.28 : r * 0.5; i ? sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  const star = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: '#2a2822' })); star.rotation.x = -Math.PI / 2; star.position.y = r * 0.51; g.add(star);
  return g;
}

export function makeCircuitBoard() {
  const g = new THREE.Group(); g.name = 'circuit_board';
  const W = 0.1, H = 0.07, T = 0.0016;
  // outline with a cut corner + a notch, extruded
  const sh = new THREE.Shape();
  sh.moveTo(0, 0); sh.lineTo(W - 0.012, 0); sh.lineTo(W, 0.012); sh.lineTo(W, H); sh.lineTo(0.06, H); sh.lineTo(0.06, H - 0.006); sh.lineTo(0.04, H - 0.006); sh.lineTo(0.04, H); sh.lineTo(0, H); sh.lineTo(0, 0);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: false });
  // map UVs to the board's extents (front cap)
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / W, p.getY(i) / H);
  const { t, n } = boardTextures(W, H);
  const top = new THREE.MeshStandardMaterial({ map: t, normalMap: n, roughness: 0.35, metalness: 0.05 });
  const edge = new THREE.MeshStandardMaterial({ color: '#6a6440', roughness: 0.6 });
  const board = new THREE.Mesh(geo, [top, edge]); board.rotation.x = -Math.PI / 2; board.position.set(-W / 2, 0.004, H / 2); board.castShadow = board.receiveShadow = true; g.add(board);
  // standoff feet under the corners so it sits off the table
  for (const [x, z] of [[-W / 2 + 0.006, H / 2 - 0.006], [W / 2 - 0.006, H / 2 - 0.006], [-W / 2 + 0.006, -H / 2 + 0.006], [W / 2 - 0.016, -H / 2 + 0.006]]) {
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.004, 12), new THREE.MeshStandardMaterial({ color: '#888', metalness: 0.6, roughness: 0.4 })); f.position.set(x, 0.002, z); g.add(f);
    const s = torxScrew(); s.position.set(x, 0.004 + T, z); g.add(s);
  }
  // black connector along the near edge, with gold pins
  const conn = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.006, 0.008), new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.5 })); conn.position.set(-0.01, 0.004 + T + 0.003, H / 2 - 0.004); g.add(conn);
  for (let i = 0; i < 12; i++) { const pin = new THREE.Mesh(new THREE.BoxGeometry(0.0008, 0.0008, 0.002), new THREE.MeshStandardMaterial({ color: '#d8b050', metalness: 0.9, roughness: 0.3 })); pin.position.set(-0.024 + i * 0.0025, 0.004 + T + 0.0025, H / 2 + 0.0002); g.add(pin); }
  // a few SMD parts + a crystal
  const r = rng(5);
  for (let i = 0; i < 12; i++) { const pc = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.0008, 0.0012), new THREE.MeshStandardMaterial({ color: r() < 0.5 ? '#2a2a2a' : '#8a7050', roughness: 0.5 })); pc.position.set((r() - 0.5) * W * 0.8, 0.004 + T + 0.0004, (r() - 0.5) * H * 0.8); pc.rotation.y = r() < 0.5 ? 0 : Math.PI / 2; g.add(pc); }
  const xt = new THREE.Mesh(new THREE.CapsuleGeometry(0.0018, 0.006, 4, 12), new THREE.MeshStandardMaterial({ color: '#c8cacc', metalness: 0.9, roughness: 0.25 })); xt.rotation.z = Math.PI / 2; xt.position.set(0.02, 0.004 + T + 0.0018, -0.012); g.add(xt);
  return g;
}

export function makeCordBundle() {
  const g = new THREE.Group(); g.name = 'braided_cords';
  const braid = _L.load('assets/textures/cord_braid.png'); braid.colorSpace = THREE.SRGBColorSpace; braid.wrapS = braid.wrapT = THREE.RepeatWrapping; braid.anisotropy = 8;
  const braidN = _L.load('assets/textures/cord_braid_n.png'); braidN.wrapS = braidN.wrapT = THREE.RepeatWrapping;
  const cols = ['#1a1a1c', '#1a1a1c', '#7a3ad0', '#7a3ad0', '#7a3ad0', '#1e9ae8', '#1e9ae8', '#2fa83a', '#2fa83a', '#2fa83a', '#f0e030', '#f0e030', '#f4f4ee'];
  const R = 0.0028, L = 0.3;
  const mat = (c) => { const m = new THREE.MeshStandardMaterial({ color: c, map: braid.clone(), normalMap: braidN.clone(), roughness: 0.85 }); m.map.repeat.set(L / 0.02, 1); m.normalMap.repeat.set(L / 0.02, 1); m.normalScale.set(1.2, 1.2); return m; };
  // laid side by side across a box edge (z = 0 edge, y = 0.06 top), draping down the front
  const r = rng(9);
  cols.forEach((c, i) => {
    const z = -0.04 + i * 0.0062, sag = 0.002 + r() * 0.002;
    const pts = [new THREE.Vector3(-0.16, 0.06 + R, z), new THREE.Vector3(-0.05, 0.06 + R + sag, z + (r() - 0.5) * 0.002), new THREE.Vector3(0.06, 0.06 + R, z), new THREE.Vector3(0.1, 0.054, z + 0.003), new THREE.Vector3(0.108, 0.025, z + 0.005), new THREE.Vector3(0.12 + r() * 0.01, R + 0.001, z + 0.008), new THREE.Vector3(0.15 + r() * 0.03, R, z + 0.012 + (r() - 0.5) * 0.01)];
    const cu = new THREE.CatmullRomCurve3(pts);
    const m = new THREE.Mesh(new THREE.TubeGeometry(cu, 120, R, 12), mat(c)); m.castShadow = true; g.add(m);
  });
  // the box they lie on: white plastic organiser tray
  const tray = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.11), new THREE.MeshStandardMaterial({ color: '#efefea', roughness: 0.4 })); tray.position.set(-0.03, 0.03, 0.0); tray.receiveShadow = true; g.add(tray);
  // a loose coil of purple cord on the table
  const pts = []; for (let i = 0; i <= 160; i++) { const t = i / 160, a = t * Math.PI * 6, rr = 0.03 + 0.004 * Math.sin(a * 0.7); pts.push(new THREE.Vector3(0.18 + Math.cos(a) * rr, R + 0.0055 * t + 0.0015 * Math.sin(a * 3), 0.05 + Math.sin(a) * rr)); }
  const coil = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 300, R, 10), mat('#2fa83a')); coil.castShadow = true; g.add(coil);
  return g;
}
