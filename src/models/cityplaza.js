// City plaza from the city photos (28a). A paved square with:
//   makeBrickGable()     red-brick warehouse end wall: gable with a grey stone coping carrying an
//                        engraved inscription (made-up text), three tall arched windows with
//                        grey keystone-and-brick arch heads and a stone sill, darker brick courses
//                        near the base (textures from the photo)
//   makeSpiral(flip)     white glossy spiral sculpture lying on the paving
//   makeOvalBuilding()   white three-storey building with rounded-rectangle windows (teal glass,
//                        vertical blinds), a round-arched entrance and a round porthole
//   makePebbleBench()    white pebble-shaped seat on thin legs
//   makeOrnateLamp()     black lamp post with scrolled brackets and a lantern head
//   makePlanter(w, d)    raised planter with a stone rim, shrubs and a small tree
//   makePaverTexture()   tan/beige brick pavers with scattered coloured accents and grey bands
// Everything faces +z, origin at ground level.
import * as THREE from 'three';

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
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.8, ...o });
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
};
function uvPanel(w, h, mat, unitU, unitV) {
  const g = new THREE.PlaneGeometry(w, h);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / unitU, uv.getY(i) * h / unitV);
  const m = new THREE.Mesh(g, mat);
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- paving
export function makePaverTexture() {
  // 1 repeat = 2.4 m square: 0.3 x 0.15 m pavers in a stretcher bond
  return canvasTex(1024, 1024, (c, w, h) => {
    const r = rng(28);
    const bw = w / 8, bh = h / 16;
    const tans = ['#d8c6a6', '#cdb894', '#e2d2b4', '#c9b08a', '#d4bf9c', '#bfa47e'];
    const accents = ['#8a5a4a', '#5f7a74', '#7a6a8a', '#a8483c', '#4f6a8a', '#9a8a5a'];
    for (let row = 0; row < 16; row++) for (let col = -1; col < 9; col++) {
      const x = col * bw + (row % 2) * bw / 2, y = row * bh;
      c.fillStyle = r() < 0.06 ? accents[Math.floor(r() * accents.length)] : tans[Math.floor(r() * tans.length)];
      c.fillRect(x + 2, y + 2, bw - 4, bh - 4);
      c.fillStyle = `rgba(0,0,0,${r() * 0.06})`; c.fillRect(x + 2, y + 2, bw - 4, bh - 4);
    }
    c.fillStyle = 'rgba(80,70,60,0.25)';
    for (let i = 0; i < 2500; i++) c.fillRect(r() * w, r() * h, 1, 1);
  });
}
export function makeGreyBandTexture() {
  return canvasTex(256, 512, (c, w, h) => {
    const r = rng(3);
    for (let row = 0; row < 16; row++) for (let col = 0; col < 4; col++) {
      c.fillStyle = ['#8e8f90', '#9a9a98', '#82858a', '#a3a3a0'][Math.floor(r() * 4)];
      c.fillRect(col * w / 4 + (row % 2) * w / 8 + 2, row * h / 16 + 2, w / 4 - 4, h / 16 - 4);
    }
  });
}

// ---------------------------------------------------------------- brick gable
const INSCRIPTION = 'THIS OLD WAREHOUSE STOOD HERE BEFORE THE RAILWAY CAME AND IT WILL STAND LONG AFTER — THE CITY GREW UP AROUND ITS WALLS — ';
export function makeBrickGable(W = 16, D = 12, H = 5.0, RISE = 4.0) {
  const g = new THREE.Group();
  const brick = std({ map: ptex('cy_brick.png'), roughness: 0.9 });
  const band = std({ map: ptex('cy_brickband.png'), roughness: 0.9 });
  const stone = std({ color: '#7a7c7e', roughness: 0.85 });
  // front wall with the gable as one shape, brick textured (UV in metres / 1.6 m per repeat)
  const sh = new THREE.Shape();
  sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, H); sh.lineTo(0, H + RISE); sh.lineTo(-W / 2, H); sh.lineTo(-W / 2, 0);
  const winX = [-1.3, 0, 1.3], winW = 0.95, winB = H - 0.2, winT = H + 2.0;
  for (const x of winX) {
    const p = new THREE.Path();
    p.moveTo(x - winW / 2, winB); p.lineTo(x + winW / 2, winB); p.lineTo(x + winW / 2, winT - winW / 2);
    p.absarc(x, winT - winW / 2, winW / 2, 0, Math.PI, false); p.lineTo(x - winW / 2, winB);
    sh.holes.push(p);
  }
  const fg = new THREE.ExtrudeGeometry(sh, { depth: 0.4, bevelEnabled: false });
  const uv = fg.attributes.uv, pp = fg.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pp.getX(i) / 1.6, pp.getY(i) / 0.92);
  const front = new THREE.Mesh(fg, brick);
  front.position.z = -0.4; front.castShadow = front.receiveShadow = true;
  g.add(front);
  // darker coursed band near the base (photo)
  const bp = uvPanel(W, 1.3, band, 2.4, 0.86); bp.position.set(0, 0.95, 0.005); g.add(bp);
  // window glazing, muntins, arch heads, sill
  const glass = std({ color: '#9fb6c6', roughness: 0.15, metalness: 0.4, emissive: '#1a2228' });
  const frame = std({ color: '#7d8a8e', roughness: 0.6 });
  for (const x of winX) {
    const gs = new THREE.Shape();
    gs.moveTo(-winW / 2, 0); gs.lineTo(winW / 2, 0); gs.lineTo(winW / 2, winT - winB - winW / 2); gs.absarc(0, winT - winB - winW / 2, winW / 2, 0, Math.PI, false); gs.lineTo(-winW / 2, 0);
    const gm = new THREE.Mesh(new THREE.ShapeGeometry(gs, 24), glass);
    gm.position.set(x, winB, -0.25); g.add(gm);
    for (let k = 1; k < 6; k++) g.add(box(winW, 0.035, 0.04, frame, x, winB + k * (winT - winB - 0.3) / 6, -0.23));
    g.add(box(0.04, winT - winB - 0.1, 0.04, frame, x, winB + (winT - winB - 0.1) / 2, -0.23));
    // arch head: ring of radial bricks + grey triangle keystones between windows
    const arch = new THREE.Mesh(new THREE.TorusGeometry(winW / 2 + 0.12, 0.13, 6, 16, Math.PI), std({ color: '#a8583c', roughness: 0.9 }));
    arch.position.set(x, winT - winW / 2, 0.02); arch.scale.z = 0.4; g.add(arch);
  }
  for (const x of [-1.95, -0.65, 0.65, 1.95]) {
    const k = new THREE.Mesh(new THREE.CylinderGeometry(0.0, 0.36, 0.55, 3), stone);
    k.rotation.z = Math.PI; k.rotation.y = Math.PI / 6; k.position.set(x, winT + 0.0, 0.03); k.scale.z = 0.25; g.add(k);
  }
  g.add(box(4.3, 0.18, 0.3, stone, 0, winB - 0.09, 0.08));
  // stone coping up both rakes, with the engraved inscription (made up)
  const rake = Math.hypot(W / 2, RISE), ang = Math.atan2(RISE, W / 2);
  const insc = canvasTex(2048, 64, (c, w, h) => {
    c.fillStyle = '#6f7275'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#3e4042'; c.font = '700 38px "Cinzel"'; c.textBaseline = 'middle';
    c.fillText(INSCRIPTION + INSCRIPTION, 10, h / 2 + 2);
  });
  for (const s of [-1, 1]) {
    const cg = box(rake + 0.3, 0.42, 0.55, [stone, stone, stone, stone, std({ map: insc, roughness: 0.85 }), stone], s * W / 4, H + RISE / 2 + 0.12, 0.05);
    cg.rotation.z = -s * ang; g.add(cg);
  }
  // rest of the building: side walls, back, roof
  for (const s of [-1, 1]) { const sw = uvPanel(D, H, brick, 1.6, 0.92); sw.position.set(s * W / 2, H / 2, -D / 2); sw.rotation.y = s * Math.PI / 2; g.add(sw); }
  const roofMat = std({ color: '#3c3a38', roughness: 0.9 });
  for (const s of [-1, 1]) {
    const rf = box(rake + 0.2, 0.12, D + 0.2, roofMat, s * W / 4, H + RISE / 2, -D / 2);
    rf.rotation.z = -s * ang; g.add(rf);
  }
  g.userData.collider = [-W / 2, W / 2, -D, 0.2];
  return g;
}

// ---------------------------------------------------------------- spiral sculpture
const white = () => std({ color: '#f2f2ee', roughness: 0.18, metalness: 0.05 });
export function makeSpiral(tall = true) {
  const g = new THREE.Group();
  const pts = [];
  // base blob along the ground, then a stem rising into a curl (like a question mark)
  const stemH = tall ? 1.2 : 0.35;
  pts.push(new THREE.Vector3(-0.55, 0.18, 0), new THREE.Vector3(-0.1, 0.2, 0), new THREE.Vector3(0.25, 0.3, 0), new THREE.Vector3(0.35, stemH * 0.6 + 0.3, 0));
  const cx = 0.15, cy = stemH + 0.5, R0 = 0.42;
  for (let i = 0; i <= 40; i++) {
    const t = i / 40, a = -0.2 + t * Math.PI * 2.4, rr = R0 * (1 - t * 0.75);
    pts.push(new THREE.Vector3(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 0));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const tube = new THREE.TubeGeometry(curve, 160, 1, 16, false);
  // taper the radius along the tube: fat at the base, thin at the curl's centre
  const p = tube.attributes.position, n = 161, ring = 17;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), c = curve.getPointAt(t), rad = 0.2 * (1 - t * 0.7) + 0.03;
    for (let j = 0; j < ring; j++) {
      const k = i * ring + j;
      p.setXYZ(k, c.x + (p.getX(k) - c.x) * rad, c.y + (p.getY(k) - c.y) * rad, c.z + (p.getZ(k) - c.z) * rad);
    }
  }
  tube.computeVertexNormals();
  const m = new THREE.Mesh(tube, white()); m.castShadow = true; g.add(m);
  const blob = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 14), white()); blob.scale.set(1.5, 0.6, 1.0); blob.position.set(-0.55, 0.18, 0); blob.castShadow = true; g.add(blob);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), white()); cap.position.copy(pts[pts.length - 1]); g.add(cap);
  return g;
}

// ---------------------------------------------------------------- white oval-window building
function stadium(w, h) {
  const s = new THREE.Shape(), r = h / 2;
  s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.absarc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(-w / 2 + r, h / 2); s.absarc(-w / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5, false);
  return s;
}
export function makeOvalBuilding(W = 24, D = 14, H = 11) {
  const g = new THREE.Group();
  const plaster = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#e9e8e2'; c.fillRect(0, 0, w, h);
    const r = rng(6); for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${r() * 0.05})`; c.fillRect(r() * w, r() * h, 2, 2); }
    for (let i = 0; i < 12; i++) { c.fillStyle = 'rgba(120,120,110,0.05)'; c.fillRect(r() * w, 0, 3 + r() * 8, h); }   // rain streaks
  });
  const wallMat = std({ map: plaster, roughness: 0.85 });
  const rows = [[3.0, 4], [6.5, 4], [9.6, 4]];
  const ww = 4.2, wh = 2.0;
  const sh = new THREE.Shape(); sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, H); sh.lineTo(-W / 2, H); sh.lineTo(-W / 2, 0);
  const wins = [];
  for (const [y, n] of rows) for (let i = 0; i < n; i++) {
    const x = -W / 2 + W / n * (i + 0.5);
    if (y < 4 && i === 1) continue;           // entrance bay
    wins.push([x, y]);
    const hole = stadium(ww, wh);
    const pth = new THREE.Path(hole.getPoints(24).map((p) => new THREE.Vector2(p.x + x, p.y + y)));
    sh.holes.push(pth);
  }
  // entrance: round-topped opening
  const ex = -W / 2 + W / 4 * 1.5, ew = 3.4;
  const ep = new THREE.Path(); ep.moveTo(ex - ew / 2, 0.01); ep.lineTo(ex + ew / 2, 0.01); ep.lineTo(ex + ew / 2, 2.4); ep.absarc(ex, 2.4, ew / 2, 0, Math.PI, false); ep.lineTo(ex - ew / 2, 0.01);
  sh.holes.push(ep);
  const fg = new THREE.ExtrudeGeometry(sh, { depth: 0.35, bevelEnabled: false, curveSegments: 20 });
  const uv = fg.attributes.uv, pp = fg.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pp.getX(i) / 3, pp.getY(i) / 3);
  const front = new THREE.Mesh(fg, wallMat); front.position.z = -0.35; front.castShadow = front.receiveShadow = true; g.add(front);
  // window glass with vertical blinds + a thick rounded reveal
  const blinds = canvasTex(256, 128, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7ab8c8'); gr.addColorStop(1, '#4f8e9e');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 8) { c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x, 0, 3, h); }
  });
  const glassMat = std({ map: blinds, roughness: 0.15, metalness: 0.3, emissive: '#16302f' });
  for (const [x, y] of wins) {
    const gl = new THREE.Mesh(new THREE.ShapeGeometry(stadium(ww, wh), 24), glassMat);
    const guv = gl.geometry.attributes.uv, gp = gl.geometry.attributes.position;
    for (let i = 0; i < guv.count; i++) guv.setXY(i, gp.getX(i) / ww + 0.5, gp.getY(i) / wh + 0.5);
    gl.position.set(x, y, -0.25); g.add(gl);
    const rim = new THREE.Mesh(new THREE.ExtrudeGeometry(Object.assign(stadium(ww + 0.3, wh + 0.3), { holes: [new THREE.Path(stadium(ww, wh).getPoints(24))] }), { depth: 0.12, bevelEnabled: false, curveSegments: 20 }), std({ color: '#e2e1da', roughness: 0.7 }));
    rim.position.set(x, y, 0); g.add(rim);
  }
  // entrance: glass doors, a lit lobby, a porthole beside it
  const lobby = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.1, 0.95, 0.75) });
  const ls = new THREE.Shape(); ls.moveTo(-ew / 2, 0); ls.lineTo(ew / 2, 0); ls.lineTo(ew / 2, 2.4); ls.absarc(0, 2.4, ew / 2, 0, Math.PI, false); ls.lineTo(-ew / 2, 0);
  const lm = new THREE.Mesh(new THREE.ShapeGeometry(ls, 20), lobby); lm.position.set(ex, 0, -0.9); g.add(lm);
  for (const dx of [-0.85, 0, 0.85]) g.add(box(0.05, 2.3, 0.05, std({ color: '#2a2b2d' }), ex + dx, 1.15, -0.3));
  g.add(box(ew, 0.06, 0.06, std({ color: '#2a2b2d' }), ex, 2.3, -0.3));
  const port = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.16, 10, 32), std({ color: '#e6e5de' })); port.position.set(ex + 3.0, 1.15, 0.1); g.add(port);
  const portIn = new THREE.Mesh(new THREE.CircleGeometry(0.85, 32), std({ color: '#d8d6cc' })); portIn.position.set(ex + 3.0, 1.15, -0.05); g.add(portIn);
  // lobby light spilling out
  const ll = new THREE.PointLight('#ffd9a8', 5, 9, 1.4); ll.position.set(ex, 2.2, 1.0); g.add(ll);
  // shell
  for (const s of [-1, 1]) { const sw = uvPanel(D, H, wallMat, 3, 3); sw.position.set(s * W / 2, H / 2, -D / 2); sw.rotation.y = s * Math.PI / 2; g.add(sw); }
  g.add(box(W, 0.3, D, std({ color: '#cfcec8' }), 0, H + 0.15, -D / 2));
  g.add(box(0.06, 1.2, 0.06, std({ color: '#666' }), -W / 2 + 1.2, H + 0.75, -1.5));      // rooftop antenna
  // hedge along the base
  const hedge = std({ color: '#2f5a2a', roughness: 1 });
  for (const [x0, x1] of [[-W / 2 + 0.3, ex - ew / 2 - 0.3], [ex + ew / 2 + 0.3, W / 2 - 0.3]]) g.add(box(x1 - x0, 0.7, 0.8, hedge, (x0 + x1) / 2, 0.35, 0.5));
  g.userData.collider = [-W / 2, W / 2, -D, 0.9];
  g.userData.door = [ex - ew / 2, ex + ew / 2];
  return g;
}

// ---------------------------------------------------------------- street furniture
export function makePebbleBench() {
  const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 12), white());
  seat.scale.set(1.45, 0.32, 0.95); seat.position.y = 0.42; seat.castShadow = true; g.add(seat);
  const leg = std({ color: '#d8d8d4', metalness: 0.6, roughness: 0.3 });
  for (const [x, z] of [[-0.25, -0.15], [0.25, -0.15], [-0.25, 0.15], [0.25, 0.15]]) {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 6), leg); l.position.set(x, 0.18, z); l.rotation.z = x * 0.3; g.add(l);
  }
  return g;
}
export function makeOrnateLamp() {
  const g = new THREE.Group();
  const blk = std({ color: '#141516', roughness: 0.4, metalness: 0.6 });
  g.add(box(0.36, 0.25, 0.36, blk, 0, 0.125, 0));
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 3.2, 12), blk); pole.position.y = 1.85; pole.castShadow = true; g.add(pole);
  for (let i = 0; i < 6; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1 - i * 0.004, 0.015, 6, 16), blk); ring.rotation.x = Math.PI / 2; ring.position.y = 0.4 + i * 0.05; g.add(ring); }
  // scrolled brackets (pairs of curls each side)
  for (const s of [-1, 1]) {
    for (const [r, y, x] of [[0.16, 3.0, 0.2], [0.09, 2.85, 0.42]]) {
      const curl = new THREE.Mesh(new THREE.TorusGeometry(r, 0.016, 6, 24, Math.PI * 1.6), blk);
      curl.position.set(s * x, y, 0); curl.rotation.z = s > 0 ? 0.3 : Math.PI - 0.3; g.add(curl);
    }
    const arm = box(0.5, 0.025, 0.025, blk, s * 0.3, 3.12, 0); g.add(arm);
  }
  // lantern head
  const lan = new THREE.Group();
  lan.add(box(0.36, 0.05, 0.36, blk, 0, 0, 0));
  const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 1.75, 1.2), toneMapped: false });
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.14, 0.42, 4, 1), glow); glass.rotation.y = Math.PI / 4; glass.position.y = 0.24; lan.add(glass);
  for (const [x, z] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]]) lan.add(box(0.025, 0.46, 0.025, blk, x * (1 + 0.15), 0.24, z * 1.15));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.22, 4), blk); roof.rotation.y = Math.PI / 4; roof.position.y = 0.56; lan.add(roof);
  const fin = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), blk); fin.position.y = 0.7; lan.add(fin);
  lan.position.y = 3.45; g.add(lan);
  g.userData.lightAt = new THREE.Vector3(0, 3.65, 0);
  return g;
}
export function makePlanter(w = 3, d = 2, seed = 1) {
  const g = new THREE.Group();
  const r = rng(seed);
  const rim = std({ color: '#d9c49a', roughness: 0.85 });
  const h = 0.55;
  g.add(box(w, h, 0.18, rim, 0, h / 2, d / 2 - 0.09), box(w, h, 0.18, rim, 0, h / 2, -d / 2 + 0.09));
  g.add(box(0.18, h, d, rim, w / 2 - 0.09, h / 2, 0), box(0.18, h, d, rim, -w / 2 + 0.09, h / 2, 0));
  g.add(box(w + 0.08, 0.06, d + 0.08, std({ color: '#e8dcc0' }), 0, h + 0.03, 0).translateY(0));
  g.children[g.children.length - 1].scale.set(1, 1, 1);
  const soil = std({ color: '#3a2c20', roughness: 1 });
  g.add(box(w - 0.36, 0.02, d - 0.36, soil, 0, h - 0.05, 0));
  const leaf = ['#3f6f34', '#4f7f3a', '#2f5a2a', '#5f8a42'];
  for (let i = 0; i < Math.round(w * d * 2.2); i++) {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18 + r() * 0.16, 1), std({ color: leaf[Math.floor(r() * 4)], roughness: 1, flatShading: true }));
    s.position.set((r() - 0.5) * (w - 0.6), h + 0.08 + r() * 0.1, (r() - 0.5) * (d - 0.6)); s.scale.y = 0.75; g.add(s);
  }
  // small tree
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 2.4, 8), std({ color: '#5a4a3a' })); trunk.position.set(0, h + 1.2, 0); g.add(trunk);
  for (let i = 0; i < 9; i++) {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 + r() * 0.35, 1), std({ color: leaf[Math.floor(r() * 4)], roughness: 1, flatShading: true }));
    c.position.set((r() - 0.5) * 1.6, h + 2.4 + r() * 1.0, (r() - 0.5) * 1.6); g.add(c);
  }
  g.userData.collider = [-w / 2, w / 2, -d / 2, d / 2];
  return g;
}
