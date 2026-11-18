// Street objects and a small block from the "objects and locations" photos:
//   red news box, "no trespassing" parking sign block, underground parking
//   ramp + lit tunnel + roll-up garage door, a teal storefront with french
//   doors, and the white rabbit cut-out sculpture on a concrete planter.
// All text is made up.
import * as THREE from 'three';
import { box, canvasTexture } from '../world/util.js';
import { wallPlane } from './buildings.js';

const loader = new THREE.TextureLoader();
function tex(name, color = true) {
  const t = loader.load(`assets/textures/${name}`);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.8, ...o });
const concrete = std({ color: '#bdb8ae', roughness: 0.95 });
const concreteDark = std({ color: '#8f8b84', roughness: 0.95 });
const glow = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });

// ---------------------------------------------------------------- news box
export function makeNewsBox() {
  const g = new THREE.Group();
  g.name = 'news_box';
  const red = std({ color: '#c42a22', roughness: 0.45, metalness: 0.3 });
  const front = canvasTexture(256, 512, (c, w, h) => {
    c.fillStyle = '#c42a22'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#fff'; c.fillRect(18, 20, w - 36, 120);
    c.fillStyle = '#c42a22'; c.font = 'bold 52px Arial'; c.textAlign = 'center';
    c.fillText('CITY', w / 2, 74); c.fillText('WEEKLY', w / 2, 126);
    c.fillStyle = '#fff'; c.font = 'bold 40px Arial'; c.fillText('FREE', w / 2, 190);
    // window with the paper inside
    c.fillStyle = '#20262b'; c.fillRect(28, 220, w - 56, 200);
    c.fillStyle = '#e9e5da'; c.fillRect(44, 240, w - 88, 170);
    c.fillStyle = '#333'; for (let i = 0; i < 9; i++) c.fillRect(56, 288 + i * 13, (w - 112) * (0.5 + 0.5 * ((i * 7) % 5) / 4), 5);
    c.fillStyle = '#c42a22'; c.fillRect(56, 252, w - 112, 26);
    c.fillStyle = '#9a1d17'; c.fillRect(90, 440, w - 180, 18); // handle
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.62, 0.38),
    [red, red, red, red, std({ map: front, roughness: 0.4, metalness: 0.2 }), red]);
  body.position.y = 0.55;
  body.castShadow = true;
  g.add(body);
  g.add(box(0.44, 0.04, 0.4, red, 0, 0.88, 0));
  g.add(box(0.12, 0.08, 0.06, std({ color: '#aaa', metalness: 0.8, roughness: 0.3 }), 0.1, 0.8, 0.2)); // coin slot
  for (const [x, z] of [[-0.17, -0.15], [0.17, -0.15], [-0.17, 0.15], [0.17, 0.15]]) g.add(box(0.03, 0.24, 0.03, red, x, 0.12, z));
  g.userData.radius = 0.3;
  return g;
}

// ---------------------------------------------------------------- parking sign block
export function makeParkingSignBlock() {
  const g = new THREE.Group();
  g.name = 'parking_sign_block';
  g.add(box(0.85, 1.05, 0.4, concrete, 0, 0.525, 0));
  const t = canvasTexture(320, 300, (c, w, h) => {
    c.fillStyle = '#f4f2ec'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#222'; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12);
    c.fillStyle = '#c4271f'; c.fillRect(14, 14, w - 28, 44);
    c.fillStyle = '#fff'; c.font = 'bold 30px Arial'; c.textAlign = 'center'; c.fillText('NO TRESPASSING', w / 2, 47);
    c.fillStyle = '#111'; c.font = 'bold 32px Arial';
    ['TENANT', '-PARKING ONLY-', 'OTHERS WILL BE', 'TOWED AWAY'].forEach((l, i) => c.fillText(l, w / 2, 104 + i * 50));
  });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.58), std({ map: t, roughness: 0.5 }));
  sign.position.set(0, 0.62, 0.201);
  g.add(sign);
  g.userData.radius = 0.45;
  return g;
}

// ---------------------------------------------------------------- parking ramp
// Ramp along -z from z0 (ground, y 0) to z1 (y = -depth), then a flat tunnel
// to zDoor with a ceiling, lights and a white roll-up garage door.
// Returns the group and a height function for walking.
export function makeParkingRamp({ x0 = -2, x1 = 2, z0 = 0, z1 = -10, zDoor = -14, depth = 2.8 } = {}) {
  const g = new THREE.Group();
  g.name = 'parking_ramp';
  const W = x1 - x0, cx = (x0 + x1) / 2;
  const floorY = (z) => (z >= z0 ? 0 : z <= z1 ? -depth : ((z - z0) / (z1 - z0)) * -depth);
  const wallMat = std({ color: '#d9d2c7', roughness: 0.9, side: THREE.DoubleSide });
  // ramp floor (sloped) + tunnel floor
  const rampLen = Math.hypot(z0 - z1, depth);
  const ramp = new THREE.Mesh(new THREE.PlaneGeometry(W, rampLen), std({ map: tex('sidewalk.png'), color: '#b7b4ae', roughness: 0.95 }));
  ramp.material.map.repeat.set(W / 1.5, rampLen / 1.5);
  ramp.rotation.x = -Math.PI / 2 + Math.atan2(depth, z0 - z1);
  ramp.position.set(cx, -depth / 2, (z0 + z1) / 2);
  ramp.receiveShadow = true;
  g.add(ramp);
  const tf = new THREE.Mesh(new THREE.PlaneGeometry(W, z1 - zDoor), concreteDark);
  tf.rotation.x = -Math.PI / 2;
  tf.position.set(cx, -depth + 0.002, (z1 + zDoor) / 2);
  g.add(tf);
  // side walls: from the floor up to a 0.9 m parapet above street level
  const top = 0.9;
  const wallGeo = () => {
    const pts = [[z0, 0], [z1, -depth], [zDoor, -depth], [zDoor, top], [z0, top]];
    const sh = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(z, y)));
    const geo = new THREE.ShapeGeometry(sh);
    geo.rotateY(Math.PI / 2);    // shape x -> world z (negated), shape y -> y
    return geo;
  };
  for (const x of [x0, x1]) {
    const w = new THREE.Mesh(wallGeo(), wallMat);
    w.scale.z = -1;               // undo the negation so shape z maps to world z
    w.position.x = x;
    w.receiveShadow = true;
    g.add(w);
    g.add(box(0.25, 0.08, z0 - zDoor, concrete, x + (x === x0 ? -0.1 : 0.1), top + 0.04, (z0 + zDoor) / 2)); // cap
  }
  // curb ledges along the ramp walls (ramp photo)
  for (const [x, s] of [[x0 + 0.2, 1], [x1 - 0.2, -1]]) {
    const len = rampLen;
    const c = box(0.4, 0.18, len, concrete, x, -depth / 2 + 0.09, (z0 + z1) / 2);
    c.rotation.x = Math.atan2(depth, z0 - z1);
    g.add(c);
  }
  // tunnel ceiling, beam with clearance sign, lights
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, z1 - zDoor), std({ color: '#cfccc5', side: THREE.DoubleSide }));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(cx, -0.25, (z1 + zDoor) / 2);
  g.add(ceil);
  g.add(box(W + 0.5, 0.35, 0.4, concrete, cx, -0.125, z1));
  const clear = canvasTexture(512, 96, (c, w, h) => {
    c.fillStyle = '#f1efe8'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1b3f8f'; c.font = 'bold 54px Arial'; c.textAlign = 'center'; c.fillText("CLEARANCE 6'8\"", w / 2, 66);
  });
  const cs = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.34), std({ map: clear }));
  cs.position.set(cx, -0.5, z1 + 0.25);
  g.add(cs);
  for (const s of [-1, 1]) g.add(box(0.02, 0.3, 0.02, concreteDark, cx + s * 0.8, -0.32, z1 + 0.25));
  const tube = glow(1.6, 1.62, 1.55);
  for (const z of [z1 - 1, zDoor + 1]) {
    g.add(box(1.2, 0.04, 0.12, tube, cx, -0.27, z, { shadow: false }));
    const l = new THREE.PointLight('#f4f2ea', 3.5, 7, 2);
    l.position.set(cx, -0.7, z);
    g.add(l);
  }
  // roll-up garage door with wall lights either side (garage-door photos)
  const slats = canvasTexture(256, 256, (c, w, h) => {
    c.fillStyle = '#efeeea'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) { c.fillStyle = '#c9c7c1'; c.fillRect(0, y, w, 2); c.fillStyle = '#fbfbf8'; c.fillRect(0, y + 2, w, 3); }
  });
  slats.wrapT = THREE.RepeatWrapping;
  slats.repeat.set(1, 3);
  const doorH = depth - 0.4;
  const door = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.6, doorH), std({ map: slats, emissive: '#4a4945', roughness: 0.5, metalness: 0.2 }));
  door.position.set(cx, -depth + doorH / 2, zDoor + 0.01);
  g.add(door);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, depth + top), wallMat);
  back.position.set(cx, (top - depth) / 2, zDoor);
  g.add(back);
  for (const s of [-1, 1]) {
    const lamp = box(0.18, 0.12, 0.1, glow(2, 1.95, 1.8), cx + s * (W / 2 - 0.15), -depth + doorH - 0.1, zDoor + 0.06, { shadow: false });
    g.add(lamp);
  }
  const dl = new THREE.PointLight('#ffffff', 4, 8, 2);
  dl.position.set(cx, -depth + doorH, zDoor + 1.2);
  g.add(dl);
  g.userData.floorY = (x, z) => (x > x0 && x < x1 && z < z0 && z > zDoor ? floorY(z) : 0);
  g.userData.walk = { minX: x0 + 0.3, maxX: x1 - 0.3, minZ: zDoor + 0.3, maxZ: z0 + 0.5 };
  g.userData.hole = { x0, x1, z0, z1: zDoor };
  return g;
}

// ---------------------------------------------------------------- teal storefront
// Teal stucco shop: recessed white french doors under a teal soffit with a
// downlight, a lit display window, and a made-up unit number. Faces +z.
export function makeTealStorefront({ w = 8, d = 10, h = 4.4, number = '714' } = {}) {
  const g = new THREE.Group();
  g.name = 'teal_storefront';
  const zf = d / 2;
  // brighter stucco than the street row: this shop sits alone in a dark lot
  const tealWall = std({ map: tex('wall_teal_stucco.png'), normalMap: tex('wall_teal_stucco_normal.png', false), color: '#c6fff6', emissive: '#16302c', roughness: 0.9 });
  const wallPlane2 = (w2, h2) => wallPlane('teal_stucco', w2, h2, tealWall);
  const teal = std({ map: tex('wall_teal_stucco.png'), normalMap: tex('wall_teal_stucco_normal.png', false), color: '#9fe0d8', roughness: 0.9 });
  const white = std({ color: '#f2f1ec', roughness: 0.5 });
  // side/back walls
  const back = wallPlane2(w, h); back.position.set(0, h / 2, -zf); back.rotation.y = Math.PI; g.add(back);
  for (const s of [-1, 1]) { const p = wallPlane2(d, h); p.position.set(s * w / 2, h / 2, 0); p.rotation.y = s * Math.PI / 2; g.add(p); }
  // front face built around a recess (x 0.6..3.0, 1.2 deep) and a window (x -3.2..-0.4)
  const R = { a: 0.6, b: 3.0, depth: 1.2, top: 3.0 };
  const W = { a: -3.2, b: -0.4, y0: 0.7, y1: 2.6 };
  const part = (x0, x1, y0, y1) => {
    const p = wallPlane2(x1 - x0, y1 - y0);
    p.position.set((x0 + x1) / 2, (y0 + y1) / 2, zf);
    g.add(p);
  };
  part(-w / 2, W.a, 0, h); part(W.a, W.b, 0, W.y0); part(W.a, W.b, W.y1, h);
  part(W.b, R.a, 0, h); part(R.a, R.b, R.top, h); part(R.b, w / 2, 0, h);
  // recess: side walls, ceiling with downlight, back wall with french doors
  for (const x of [R.a, R.b]) {
    const p = wallPlane2(R.depth, R.top);
    p.position.set(x, R.top / 2, zf - R.depth / 2);
    p.rotation.y = x === R.a ? Math.PI / 2 : -Math.PI / 2;
    g.add(p);
  }
  const rc = new THREE.Mesh(new THREE.PlaneGeometry(R.b - R.a, R.depth), std({ color: '#7fc3bd' }));
  rc.rotation.x = Math.PI / 2;
  rc.position.set((R.a + R.b) / 2, R.top, zf - R.depth / 2);
  g.add(rc);
  const can = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16), glow(2, 1.95, 1.8));
  can.rotation.x = Math.PI / 2;
  can.position.set((R.a + R.b) / 2, R.top - 0.005, zf - R.depth / 2);
  g.add(can);
  const dl = new THREE.PointLight('#fff2dc', 3, 6, 2);
  dl.position.set((R.a + R.b) / 2, R.top - 0.3, zf - R.depth / 2 + 0.3);
  g.add(dl);
  const zd = zf - R.depth;
  const dw = R.b - R.a;
  const backPart = (x0, x1, y0, y1) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), white); p.position.set((x0 + x1) / 2, (y0 + y1) / 2, zd); g.add(p); };
  backPart(R.a, R.a + 0.3, 0, R.top); backPart(R.b - 0.3, R.b, 0, R.top); backPart(R.a, R.b, 2.35, R.top);
  const frosted = std({ color: '#e7ece9', roughness: 0.25, emissive: '#3b3a35' });
  for (const s of [-1, 1]) {
    const cxl = (R.a + R.b) / 2 + s * (dw - 0.6) / 4;
    const lw = (dw - 0.6) / 2;
    g.add(box(lw, 2.35, 0.05, white, cxl, 1.175, zd));
    g.add(box(lw - 0.2, 1.95, 0.06, frosted, cxl, 1.2, zd + 0.005));
    g.add(box(0.03, 0.32, 0.05, std({ color: '#222', metalness: 0.7 }), cxl - s * (lw / 2 - 0.12), 1.05, zd + 0.06)); // handles
  }
  const num = canvasTexture(256, 96, (c, w2, h2) => {
    c.fillStyle = '#f2f1ec'; c.fillRect(0, 0, w2, h2);
    c.fillStyle = '#222'; c.font = 'bold 64px Georgia'; c.textAlign = 'center'; c.fillText(number, w2 / 2, 70);
  });
  const np = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.15), std({ map: num }));
  np.position.set((R.a + R.b) / 2 + 0.6, R.top + 0.2, zf + 0.01);
  g.add(np);
  // teal soffit band across the front
  g.add(box(w + 0.1, 0.5, 0.4, teal, 0, R.top + 0.6, zf + 0.2));
  // display window: white frame, muntins, warm-lit shelves behind
  const ww = W.b - W.a, wh = W.y1 - W.y0, wx = (W.a + W.b) / 2, wy = (W.y0 + W.y1) / 2;
  const shelfTex = canvasTexture(256, 192, (c, w2, h2) => {
    c.fillStyle = '#e8d6b4'; c.fillRect(0, 0, w2, h2);
    const cols = ['#c94a3a', '#3f7fb5', '#e8b84a', '#5aa36a', '#9b5fb0', '#f0ede4'];
    for (let r = 0; r < 3; r++) {
      c.fillStyle = '#8a6b4a'; c.fillRect(0, 56 + r * 62, w2, 6);
      for (let i = 0; i < 12; i++) { c.fillStyle = cols[(i * 5 + r * 3) % cols.length]; c.fillRect(8 + i * 20, 14 + r * 62, 14, 42); }
    }
  });
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), new THREE.MeshBasicMaterial({ map: shelfTex, color: new THREE.Color(1.1, 1.0, 0.85) }));
  sh.position.set(wx, wy, zf - 0.3);
  g.add(sh);
  g.add(box(ww, 0.08, 0.3, white, wx, W.y0, zf - 0.15));
  for (const s of [-1, 1]) g.add(box(0.08, wh, 0.3, white, wx + s * ww / 2, wy, zf - 0.15));
  g.add(box(ww, 0.08, 0.3, white, wx, W.y1, zf - 0.15));
  for (let i = 1; i < 4; i++) g.add(box(0.025, wh, 0.03, white, W.a + (ww * i) / 4, wy, zf - 0.04));
  for (let i = 1; i < 4; i++) g.add(box(ww, 0.025, 0.03, white, wx, W.y0 + (wh * i) / 4, zf - 0.04));
  // dark door mat on the sidewalk + roof/parapet
  g.add(box(1.4, 0.012, 0.9, std({ color: '#1f1f21', roughness: 1 }), (R.a + R.b) / 2, 0.006, zf + 0.5));
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(w, d), std({ color: '#2f3033' }));
  roof.rotation.x = -Math.PI / 2;
  roof.position.y = h - 0.4;
  g.add(roof);
  g.add(box(w + 0.1, 0.12, d + 0.1, std({ color: '#b7b2a8' }), 0, h + 0.06, 0, { shadow: false }).translateY(0)); // cap
  g.children[g.children.length - 1].scale.set(1, 1, 1);
  g.userData.size = { w, d };
  return g;
}

// ---------------------------------------------------------------- rabbit sculpture
// The white cut-out rabbit (photo silhouette) standing on a granite planter.
// Thickness: a stack of alpha-tested layers, so the side reads as solid.
export function makeRabbitSculpture() {
  const g = new THREE.Group();
  g.name = 'rabbit_sculpture';
  const planter = std({ color: '#a8a39b', roughness: 0.95, map: tex('sidewalk.png') });
  g.add(box(0.95, 0.75, 0.95, planter, 0, 0.375, 0));
  const soil = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), std({ map: tex('mulch.png'), color: '#6a5a4c' }));
  soil.rotation.x = -Math.PI / 2;
  soil.position.y = 0.73;
  g.add(soil);
  const t = tex('rabbit_cut.png');
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  const H = 1.8, W = H * 545 / 1469;
  const mat = std({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6 });
  const edge = std({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, color: '#9c9a94' });
  for (let i = 0; i <= 8; i++) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(W, H), i === 0 || i === 8 ? mat : edge);
    p.position.set(0, 0.75 + H / 2, -0.025 + i * 0.00625);
    p.castShadow = true;
    g.add(p);
  }
  g.userData.radius = 0.6;
  return g;
}
