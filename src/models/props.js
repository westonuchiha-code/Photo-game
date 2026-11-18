// Small props seen in the photos.
import * as THREE from 'three';
import { box, canvasTexture } from '../world/util.js';

// Napkin dispenser on the bar counter (bar photo): black body, chrome top,
// red ad card on the side, napkins poking out the top.
export function makeNapkinDispenser(mats) {
  const g = new THREE.Group();
  g.name = 'napkin_dispenser';
  g.add(box(0.13, 0.16, 0.16, mats.black, 0, 0.08, 0));
  g.add(box(0.135, 0.02, 0.165, mats.chrome, 0, 0.165, 0));
  g.add(box(0.1, 0.04, 0.03, mats.white ?? new THREE.MeshStandardMaterial({ color: '#f4f2ee' }), 0, 0.19, 0));
  const card = canvasTexture(128, 160, (c, w, h) => {
    c.fillStyle = '#c8382b'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#f4ead8'; c.fillRect(10, 10, w - 20, h - 20);
    c.fillStyle = '#c8382b'; c.fillRect(18, 18, w - 36, 52);
    c.fillStyle = '#e8b93a'; c.beginPath(); c.ellipse(w / 2, 110, 36, 20, 0, 0, Math.PI * 2); c.fill();
  });
  const cardMat = new THREE.MeshStandardMaterial({ map: card, roughness: 0.4 });
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.12), cardMat);
    p.position.set(s * 0.067, 0.08, 0);
    p.rotation.y = s * Math.PI / 2;
    g.add(p);
  }
  return g;
}

// Black-framed poster on the tile wall (bar photo). Faces +z.
export function makePoster(mats, { w = 0.42, h = 1.05 } = {}) {
  const g = new THREE.Group();
  g.name = 'framed_poster';
  const f = 0.03;
  g.add(box(w + 2 * f, h + 2 * f, 0.025, mats.black, 0, 0, 0.0125));
  const art = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mats.poster);
  art.position.z = 0.026;
  g.add(art);
  return g;
}

// Teal "OPEN!" sign above the entrance doors (top of the entrance photo). Faces +z.
export function makeOpenPlaque(mats) {
  const t = canvasTexture(512, 192, (c, w, h) => {
    c.fillStyle = '#5aa6ab'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#ffffff'; c.lineWidth = 10; c.strokeRect(14, 14, w - 28, h - 28);
    c.fillStyle = '#ffffff';
    c.font = '140px "Bungee"';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('OPEN!', w / 2, h / 2 + 8);
  });
  const g = new THREE.Group();
  g.name = 'open_plaque';
  g.add(box(0.8, 0.3, 0.02, mats.white ?? mats.kick, 0, 0, 0.01));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.3), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 }));
  face.position.z = 0.021;
  g.add(face);
  return g;
}

// Outdoor wall light seen through the window in the neon photo: a white
// half-globe under a dark cap. Faces +z.
export function makeWallGlobe(mats) {
  const g = new THREE.Group();
  g.name = 'wall_globe_light';
  const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.65, 1.7), toneMapped: false });
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 10, 0, Math.PI, 0, Math.PI / 2), mats.black);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.155, 24, 10, 0, Math.PI, Math.PI / 2, Math.PI / 2), glow);
  g.add(cap, bulb);
  return g;
}

// Stretched canvas painting (gallery wrap: the image continues around the
// edges). Faces +z, hangs with its centre at the origin.
export function makeCanvas(file, w, h, depth = 0.04) {
  const loader = new THREE.TextureLoader();
  const t = loader.load(`assets/textures/${file}`);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  const face = new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color(0.35, 0.33, 0.3), roughness: 0.75 }); // gallery-lit
  const edge = new THREE.MeshStandardMaterial({ map: t, roughness: 0.85, color: '#9a9a9a' });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), [edge, edge, edge, edge, face, edge]);
  m.position.z = depth / 2;
  m.castShadow = true;
  const g = new THREE.Group();
  g.name = `canvas_${file.replace('.png', '')}`;
  g.add(m);
  return g;
}

// Painted mural on an outside wall, with a small brass plaque (generic text).
export function makeMural(file, w, h) {
  const loader = new THREE.TextureLoader();
  const t = loader.load(`assets/textures/${file}`);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  const g = new THREE.Group();
  g.name = 'mural';
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color(0.55, 0.5, 0.45), roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2 }));
  p.position.z = 0.01;
  g.add(p);
  const plaque = canvasTexture(256, 96, (c, cw, ch) => {
    c.fillStyle = '#b08a3e'; c.fillRect(0, 0, cw, ch);
    c.fillStyle = '#2a2014'; c.font = '700 26px "Cinzel"'; c.textAlign = 'center';
    c.fillText('"NIGHT FACES"', cw / 2, 42); c.font = '700 24px "Caveat"'; c.fillText('community mural', cw / 2, 74);
  });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.15), new THREE.MeshStandardMaterial({ map: plaque, roughness: 0.3, metalness: 0.6 }));
  pl.position.set(w / 2 - 0.3, -h / 2 + 0.3, 0.02);
  g.add(pl);
  // wall-washer fixture above (the glow is in the material, so no extra light on phones)
  const fx = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.08, 0.18), new THREE.MeshStandardMaterial({ color: '#1b1c1e', metalness: 0.6, roughness: 0.4 }));
  fx.position.set(0, h / 2 + 0.25, 0.12);
  const lens = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.78, 0.06), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.7, 1.5), toneMapped: false }));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, h / 2 + 0.205, 0.12);
  g.add(fx, lens);
  return g;
}

// Stock pot of lentil soup (soup photos): brushed aluminium pot with a rolled
// rim stained orange, two riveted handles, a glossy lentil-soup surface, a
// ladle resting in it, and a little rising steam. Faces +z, base at y = 0.
export function makeSoupPot({ soup = 'soup_lentil', r = 0.2, h = 0.24 } = {}) {
  const loader = new THREE.TextureLoader();
  const tx = (n, color = true) => { const t = loader.load(`assets/textures/${n}`); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (color) t.colorSpace = THREE.SRGBColorSpace; return t; };
  const g = new THREE.Group();
  g.name = 'soup_pot';
  const alu = new THREE.MeshStandardMaterial({ color: '#b9bdc0', metalness: 0.3, roughness: 0.4, emissive: '#2a2c2e', side: THREE.DoubleSide }); // no env map: keep metalness low so it reads silver
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.97, h, 40, 1, true), alu);
  body.position.y = h / 2;
  g.add(body);
  const base = new THREE.Mesh(new THREE.CircleGeometry(r * 0.97, 40), alu);
  base.rotation.x = -Math.PI / 2;
  base.position.y = 0.004;
  g.add(base);
  // stained rolled rim (texture wraps once around)
  const rimTex = tx('pot_rim_stain.png');
  rimTex.repeat.set(2, 1);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 8, 48), new THREE.MeshStandardMaterial({ map: rimTex, metalness: 0.2, roughness: 0.45 }));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = h;
  g.add(rim);
  // orange splash stains on the inner wall above the soup line
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.002, r - 0.002, h * 0.22, 40, 1, true),
    new THREE.MeshStandardMaterial({ map: rimTex, roughness: 0.6, metalness: 0.2, side: THREE.BackSide }));
  inner.position.y = h * 0.89;
  g.add(inner);
  // soup surface
  const soupMat = new THREE.MeshStandardMaterial({ map: tx(`${soup}.png`), normalMap: tx(`${soup}_normal.png`, false), normalScale: new THREE.Vector2(0.8, 0.8), roughness: 0.25, emissive: '#3a1408' });
  soupMat.map.repeat.set(1.2, 1.2);
  const surf = new THREE.Mesh(new THREE.CircleGeometry(r - 0.004, 40), soupMat);
  surf.rotation.x = -Math.PI / 2;
  surf.position.y = h * 0.78;
  g.add(surf);
  // riveted loop handles
  for (const s of [-1, 1]) {
    const hnd = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.007, 8, 16, Math.PI), alu);
    hnd.rotation.set(0, s > 0 ? Math.PI / 2 : -Math.PI / 2, 0);
    hnd.position.set(s * (r + 0.004), h * 0.86, 0);
    hnd.rotation.z = Math.PI / 2;
    g.add(hnd);
  }
  // ladle
  const steel = new THREE.MeshStandardMaterial({ color: '#d7d9db', metalness: 0.3, roughness: 0.3, emissive: '#2a2c2e' });
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.36, 8), steel);
  handle.position.set(r * 0.35, h * 0.95, 0);
  handle.rotation.z = -0.75;
  g.add(handle);
  // steam: a few soft white sprites drifting up
  const sc = document.createElement('canvas'); sc.width = sc.height = 64;
  const cx = sc.getContext('2d');
  const grd = cx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grd.addColorStop(0, 'rgba(255,255,255,0.5)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  cx.fillStyle = grd; cx.fillRect(0, 0, 64, 64);
  const steamTex = new THREE.CanvasTexture(sc);
  const puffs = [];
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0.35 }));
    p.userData.phase = i / 6;
    g.add(p);
    puffs.push(p);
  }
  g.userData.update = (t) => {
    puffs.forEach((p, i) => {
      const k = (t * 0.25 + p.userData.phase) % 1;
      p.position.set(Math.sin(t * 0.7 + i) * 0.04 * k, h * 0.8 + k * 0.45, Math.cos(t * 0.5 + i * 2) * 0.04 * k);
      p.scale.setScalar(0.06 + k * 0.18);
      p.material.opacity = 0.32 * Math.sin(Math.PI * k);
    });
  };
  return g;
}
