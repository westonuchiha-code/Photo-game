// Misc batch (queue item 48, photos/decor/). Surfaces from the photos (tools/tex_48.py).
//   makePropPistol()  a rusty-copper prop flintlock-style pistol (decor only): stepped barrel with bands,
//     the boxy lock plate with rivets and a hammer, a trigger, the angular grip wound with twine and a
//     loop at the butt. ~33 cm, lying on its side; origin at the centre of the base.
//   makeDriedRose()   a dried dark-red rose (petal texture from the photo, curled, browning edges) with sprigs
//     of baby's breath, in a narrow glass bud vase. Origin at the vase base.
//   makeWhitePC()     a white tower with a perforated front and side, everything inside glowing blue (fans,
//     LED strips), a blue power ring. Origin at the base centre, front toward +x.
import * as THREE from 'three';

const _L = new THREE.TextureLoader();
function tex(name, rx = 1, ry = 1) { const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t; }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.5, ...o }); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function cyl(rt, rb, h, mat, p, seg = 16) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.castShadow = true; p.add(m); return m; }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function makePropPistol() {
  const g = new THREE.Group(); g.name = 'prop_pistol';
  const cu = std({ map: tex('m48_copper', 1, 1), color: '#e8b890', metalness: 0.55, roughness: 0.55 });
  const dark = std({ color: '#5a3424', metalness: 0.5, roughness: 0.6 });
  const tw = std({ map: tex('m48_twine', 2, 1), roughness: 0.95 });
  const p = new THREE.Group(); g.add(p);                   // built standing (barrel along +x), then laid down
  // barrel: two stacked tubes (the photo's double barrel look) + bands + muzzle ring
  for (const [y, r] of [[0.075, 0.014], [0.048, 0.011]]) { const b = cyl(r, r, 0.17, cu, p); b.rotation.z = Math.PI / 2; b.position.set(0.11, y, 0); }
  for (const x of [0.05, 0.12, 0.19]) { const band = cyl(0.018, 0.018, 0.012, dark, p, 16); band.rotation.z = Math.PI / 2; band.position.set(x, 0.07, 0); band.scale.set(1, 1, 1.15); }
  const muz = new THREE.Mesh(new THREE.TorusGeometry(0.0145, 0.004, 8, 20), cu); muz.rotation.y = Math.PI / 2; muz.position.set(0.195, 0.075, 0); p.add(muz);
  // lock plate (boxy, the photo's cylinder block) with rivets + hammer
  box(0.1, 0.07, 0.04, cu, -0.03, 0.07, 0, p);
  const drum = cyl(0.03, 0.03, 0.05, cu, p, 20); drum.rotation.x = Math.PI / 2; drum.position.set(-0.02, 0.07, 0);
  for (const [x, y] of [[-0.065, 0.095], [0.005, 0.095], [-0.065, 0.045], [0.005, 0.045]]) { const rv = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 6), dark); rv.position.set(x, y, 0.021); p.add(rv); }
  const ham = new THREE.Shape(); ham.moveTo(0, 0); ham.lineTo(0.012, 0); ham.lineTo(0.018, 0.03); ham.lineTo(0.03, 0.04); ham.lineTo(0.02, 0.046); ham.lineTo(0.004, 0.03); ham.closePath();
  const hm = new THREE.Mesh(new THREE.ExtrudeGeometry(ham, { depth: 0.01, bevelEnabled: false }), cu); hm.position.set(-0.08, 0.1, -0.005); p.add(hm);
  // trigger guard + trigger
  const guard = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.0035, 6, 16, Math.PI), cu); guard.rotation.z = Math.PI; guard.position.set(-0.04, 0.032, 0); p.add(guard);
  box(0.004, 0.022, 0.006, dark, -0.04, 0.025, 0, p);
  // grip: angled block, wound in twine, open loop at the butt
  const grip = new THREE.Group(); grip.position.set(-0.085, 0.05, 0); grip.rotation.z = 0.45; p.add(grip);
  box(0.035, 0.11, 0.03, cu, 0, -0.05, 0, grip);
  const wrap = cyl(0.026, 0.026, 0.08, tw, grip, 18); wrap.position.y = -0.045; wrap.scale.set(0.95, 1, 0.75);
  const r = rng(48); for (let i = 0; i < 9; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.004, 6, 18), tw); ring.rotation.x = Math.PI / 2 + (r() - 0.5) * 0.4; ring.scale.set(1, 0.75, 1); ring.position.y = -0.008 - i * 0.009; grip.add(ring); }
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 8, 20), cu); loop.scale.set(0.9, 1.2, 1); loop.position.y = -0.125; grip.add(loop);
  p.rotation.x = -Math.PI / 2; p.position.y = 0.02;
  return g;
}

export function makeDriedRose() {
  const g = new THREE.Group(); g.name = 'dried_rose';
  const r = rng(7);
  // glass bud vase with a little water
  const vp = [[0.0, 0], [0.028, 0], [0.032, 0.01], [0.03, 0.06], [0.014, 0.13], [0.011, 0.17], [0.016, 0.185]].map(([x, y]) => new THREE.Vector2(x, y));
  const vase = new THREE.Mesh(new THREE.LatheGeometry(vp, 28), new THREE.MeshPhysicalMaterial({ color: '#dcecf0', transparent: true, opacity: 0.32, roughness: 0.04, side: THREE.DoubleSide, depthWrite: false })); g.add(vase);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.028, 0.05, 20), new THREE.MeshPhysicalMaterial({ color: '#c8d8c0', transparent: true, opacity: 0.35, roughness: 0.05, depthWrite: false })); water.position.y = 0.03; g.add(water);
  // stem
  const stemM = std({ color: '#5a6a3a', roughness: 0.8 });
  const stem = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.01, 0), new THREE.Vector3(0.005, 0.2, 0.002), new THREE.Vector3(-0.01, 0.34, 0.01), new THREE.Vector3(-0.02, 0.42, 0.02)]), 20, 0.0035, 6), stemM); g.add(stem);
  for (const [y, s] of [[0.25, 1], [0.31, -1]]) { const lf = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 6), std({ color: '#4a5a2a', roughness: 0.85, side: THREE.DoubleSide })); lf.scale.set(1.6, 0.15, 0.8); lf.position.set(s * 0.02, y, 0.005); lf.rotation.z = s * 0.5; g.add(lf); }
  // the bloom: curled, slightly collapsed petals in a spiral, outer ones browning and torn-looking
  const petalM = std({ map: tex('m48_rose', 0.5, 0.5), roughness: 0.75, side: THREE.DoubleSide });
  const petalDry = std({ map: tex('m48_rose', 0.5, 0.5), color: '#9a7a6a', roughness: 0.85, side: THREE.DoubleSide });
  const head = new THREE.Group(); head.position.set(-0.02, 0.43, 0.02); head.rotation.z = 0.25; head.scale.setScalar(1.15); g.add(head);
  // layered cups of petals (each a slice of a sphere around the vertical axis), tighter + darker at the
  // centre, outer ones opening and browning at the edges, the way a dried rose holds its shape
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.009, 12, 8), petalM); core.scale.set(1, 1.3, 1); core.position.y = 0.002; head.add(core);
  for (let k = 0; k < 5; k++) {
    const rad = 0.012 + k * 0.0055, n = 3 + (k > 1 ? 2 : 0);
    for (let i = 0; i < n; i++) {
      const ph = (i / n) * Math.PI * 2 + k * 0.7 + r() * 0.3, len = (Math.PI * 2 / n) * 1.25;
      const ts = Math.PI * (0.22 + k * 0.05), geo = new THREE.SphereGeometry(rad, 10, 8, ph, len, ts, Math.PI * 0.95 - ts);
      geo.scale(1, 1.1 + 0.05 * k, 1);
      const pm = new THREE.Mesh(geo, k >= 3 ? petalDry : petalM); pm.position.y = -k * 0.003; pm.rotation.z = (r() - 0.5) * 0.15; pm.castShadow = true; head.add(pm);
    }
  }
  const sepal = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.018, 8), stemM); sepal.position.y = -0.025; sepal.rotation.x = Math.PI; head.add(sepal);
  // baby's breath: thin forked stems with clouds of tiny white flowers
  const bbM = std({ color: '#f6f6ee', roughness: 0.8 }), bbStem = std({ color: '#7a8a5a', roughness: 0.8 });
  const flower = new THREE.SphereGeometry(0.0022, 6, 4);
  for (let k = 0; k < 4; k++) {
    const ang = k / 4 * Math.PI * 2 + 0.4, top = new THREE.Vector3(Math.cos(ang) * 0.07, 0.36 + r() * 0.08, Math.sin(ang) * 0.07);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.02, 0), new THREE.Vector3(top.x * 0.3, 0.2, top.z * 0.3), top]), 12, 0.0012, 4), bbStem));
    for (let c = 0; c < 6; c++) { const cx = top.x + (r() - 0.5) * 0.06, cy = top.y + (r() - 0.3) * 0.05, cz = top.z + (r() - 0.5) * 0.06; g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([top, new THREE.Vector3(cx, cy, cz)]), 3, 0.0008, 3), bbStem)); for (let i = 0; i < 7; i++) { const f = new THREE.Mesh(flower, bbM); f.position.set(cx + (r() - 0.5) * 0.014, cy + (r() - 0.5) * 0.01, cz + (r() - 0.5) * 0.014); g.add(f); } }
  }
  return g;
}

export function makeWhitePC() {
  const g = new THREE.Group(); g.name = 'white_pc';
  const L = 0.45, H = 0.48, W = 0.22;
  const white = std({ color: '#f2f2ee', roughness: 0.35, metalness: 0.1 });
  // perforated panels: white with a hole grid, the holes glowing blue
  const perf = (w, h) => { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#f2f2ee'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const b = 0.35 + 0.65 * Math.random(); x.fillStyle = '#d8d8d4'; x.fillRect(4 + i * 32, 4 + j * 32, 26, 26); x.fillStyle = `rgb(${20 * b},${70 * b},${255 * b})`; x.fillRect(7 + i * 32, 7 + j * 32, 20, 20); x.fillStyle = 'rgba(10,10,30,0.6)'; x.fillRect(7 + i * 32, 7 + j * 32 + 8, 20, 4); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 0.22, h / 0.22); return t; };
  const sideMap = perf(L, H), frontMap = perf(W, H);
  const mats = [std({ map: frontMap, emissive: '#ffffff', emissiveMap: frontMap, emissiveIntensity: 0.6, roughness: 0.4 }), white, white, white, std({ map: sideMap, emissive: '#ffffff', emissiveMap: sideMap, emissiveIntensity: 0.6, roughness: 0.4 }), white];
  const body = new THREE.Mesh(new THREE.BoxGeometry(L, H, W), mats.map((m, i) => (i === 0 ? mats[0] : i === 4 ? mats[4] : white))); body.position.y = H / 2 + 0.015; body.castShadow = true; g.add(body);
  // a window strip on the side with a blue-lit fan behind it
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.3), new THREE.MeshBasicMaterial({ color: '#0c1a4a' })); win.position.set(-L / 2 + 0.08, H / 2 + 0.02, W / 2 + 0.002); g.add(win);
  const fan = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.05, 24), new THREE.MeshBasicMaterial({ color: '#9ad0ff' })); fan.position.set(-L / 2 + 0.08, H / 2 + 0.06, W / 2 + 0.003); g.add(fan);
  for (const y of [0.15, 0.3]) box(0.008, 0.08, 0.015, std({ color: '#222' }), -L / 2 + 0.16, y, W / 2 + 0.01, g);   // cable clips
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.003, 6, 20), new THREE.MeshBasicMaterial({ color: '#4aa0ff' })); ring.rotation.y = Math.PI / 2; ring.position.set(L / 2 + 0.002, H - 0.04, 0); g.add(ring);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.03, 0.015, 0.03, std({ color: '#ccc' }), x * (L / 2 - 0.04), 0.0075, z * (W / 2 - 0.03), g);
  const glow = new THREE.PointLight('#3a7aff', 0.25, 1.4, 2); glow.position.set(0, H / 2, W / 2 + 0.2); g.add(glow);
  return g;
}
