// Burl walnut veneer (queue item 46, photos/grime/burl-veneer*). The texture is the photo's burl, four-way
// bookmatched the way burl veneer is actually laid (tools/tex_46.py), with a normal map from its figure lines.
//   burlMaterial(rx, ry)  lacquered burl veneer (glossy clear coat)
//   makeBurlKiosk()  a luxury watch + jewellery island for the underground mall: an oval counter wrapped in
//     burl veneer between polished brass bands, a glass vitrine top with watches on cream pillows and rings
//     on a tray, a burl-veneered totem with a made-up maison name ("MAISON OREILLE") and a brass clock,
//     a stool. ~2.4 x 1.4 m footprint, origin at the floor centre.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
export function burlMaterial(rx = 1, ry = 1) {
  const m = _L.load('assets/textures/burl.png'); m.colorSpace = THREE.SRGBColorSpace; m.wrapS = m.wrapT = THREE.RepeatWrapping; m.repeat.set(rx, ry); m.anisotropy = 8;
  const n = _L.load('assets/textures/burl_n.png'); n.wrapS = n.wrapT = THREE.RepeatWrapping; n.repeat.set(rx, ry);
  return new THREE.MeshPhysicalMaterial({ map: m, normalMap: n, normalScale: new THREE.Vector2(0.35, 0.35), roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 });
}
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.4, ...o }); }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

export function makeBurlKiosk() {
  const g = new THREE.Group(); g.name = 'burl_kiosk';
  const brass = std({ color: '#c8a050', metalness: 0.9, roughness: 0.22 });
  const RX = 1.2, RZ = 0.65, H = 0.95;
  // oval counter: burl wall between a plinth and brass bands
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, H - 0.12, 64, 1, true), burlMaterial(4, 1)); wall.scale.set(RX, 1, RZ); wall.position.y = 0.06 + (H - 0.12) / 2; wall.castShadow = true; g.add(wall);
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.06, 64), std({ color: '#1a1614', roughness: 0.5 })); plinth.scale.set(RX - 0.04, 1, RZ - 0.04); plinth.position.y = 0.03; g.add(plinth);
  for (const y of [0.08, H - 0.08]) { const band = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 96), brass); band.rotation.x = Math.PI / 2; band.scale.set(RX + 0.004, RZ + 0.004, 1); band.position.y = y; g.add(band); }
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.04, 64), burlMaterial(2.4, 1.3)); top.scale.set(RX + 0.03, 1, RZ + 0.03); top.position.y = H - 0.02; g.add(top);
  // glass vitrine on top: cream felt bed, watches on pillows, a ring tray, a little card
  const bed = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.02, 48), std({ color: '#e8dcc4', roughness: 0.9 })); bed.scale.set(RX - 0.18, 1, RZ - 0.14); bed.position.y = H + 0.01; g.add(bed);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.22, 48, 1, false), new THREE.MeshPhysicalMaterial({ color: '#e8f2f4', transparent: true, opacity: 0.15, roughness: 0.02, transmission: 0.2, depthWrite: false })); glass.scale.set(RX - 0.12, 1, RZ - 0.1); glass.position.y = H + 0.11; g.add(glass);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.008, 6, 64), brass); ring.rotation.x = Math.PI / 2; ring.scale.set(RX - 0.12, RZ - 0.1, 1); ring.position.y = H + 0.22; g.add(ring);
  const pillow = std({ color: '#f2ead8', roughness: 0.85 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, px = Math.cos(a) * (RX - 0.42), pz = Math.sin(a) * (RZ - 0.3);
    const p = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.06, 4, 12), pillow); p.rotation.z = Math.PI / 2; p.position.set(px, H + 0.045, pz); p.rotation.y = -a; g.add(p);
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.008, 6, 20), std({ color: ['#3a2418', '#c8ccd0', '#1a1a1a'][i % 3], metalness: i % 3 === 1 ? 0.8 : 0.1, roughness: 0.4 })); strap.position.set(px, H + 0.045, pz); strap.rotation.y = -a; g.add(strap);
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 24), [brass, std({ color: i % 2 ? '#1a2a4a' : '#f2f0ea', roughness: 0.15 }), brass]); face.position.set(px, H + 0.08, pz); g.add(face);
  }
  const tray = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.16), std({ color: '#1a1614' })); tray.position.set(0, H + 0.03, 0); g.add(tray);
  for (let i = 0; i < 8; i++) { const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.01, 0.003, 6, 16), std({ color: i % 3 ? '#e8c060' : '#e8eaec', metalness: 0.9, roughness: 0.15 })); r2.position.set(-0.11 + (i % 4) * 0.07, H + 0.045, -0.04 + Math.floor(i / 4) * 0.08); g.add(r2); const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.005), std({ color: ['#e8f4ff', '#c81e48', '#2a6ad8'][i % 3], roughness: 0.05 })); gem.position.set(r2.position.x, H + 0.057, r2.position.z); g.add(gem); }
  // the totem: a burl-veneered column with the maison name and a brass clock, at the back of the counter
  const tot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.3, 0.3), [burlMaterial(0.6, 2), burlMaterial(0.6, 2), std({ color: '#1a1614' }), std({ color: '#1a1614' }), burlMaterial(0.8, 2.6), burlMaterial(0.8, 2.6)]);
  tot.position.set(0, 1.15, -RZ - 0.25); tot.castShadow = true; g.add(tot);
  for (const y of [0.04, 2.28]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.03, 0.32), brass); b.position.set(0, y, -RZ - 0.25); g.add(b); }
  const name = canvasT(256, 512, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#e8c878'; x.save(); x.translate(w / 2, h / 2); x.rotate(-Math.PI / 2); fitText(x, 'MAISON OREILLE', 0, 0, h - 40, 60, F.couture, { spacing: 10 }); x.restore(); });
  const nm = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1.1), std({ map: name, transparent: true, metalness: 0.6, roughness: 0.25 })); nm.position.set(0, 1.0, -RZ - 0.25 + 0.152); g.add(nm);
  const clock = new THREE.Group(); clock.position.set(0, 1.85, -RZ - 0.25 + 0.16); g.add(clock);
  const cf = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 40), [brass, std({ map: canvasT(256, 256, (x) => { x.fillStyle = '#f2ead8'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#2a2018'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.fillRect(128 + Math.cos(a) * 100 - 3, 128 + Math.sin(a) * 100 - 8, 6, 16); } x.save(); x.translate(128, 128); x.rotate(0.6); x.fillRect(-4, -70, 8, 70); x.rotate(2.1); x.fillRect(-3, -95, 6, 95); x.restore(); }), roughness: 0.3 }), brass]);
  cf.rotation.x = Math.PI / 2; clock.add(cf);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 8, 40), brass); clock.add(bezel);
  // a stool at the customer side
  const st = new THREE.Group(); st.position.set(0.6, 0, RZ + 0.45); g.add(st);
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 32), std({ color: '#3a2418', roughness: 0.6 })); seat.position.y = 0.66; st.add(seat);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.63, 12), brass); leg.position.y = 0.32; st.add(leg);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.02, 32), brass); base.position.y = 0.01; st.add(base);
  // a warm spotlight glow over it
  const l = new THREE.PointLight('#ffe8c8', 1.6, 4, 2); l.position.set(0, 2.6, 0); g.add(l);
  g.userData.collider = [-RX - 0.05, RX + 0.05, -RZ - 0.45, RZ + 0.05];
  return g;
}
