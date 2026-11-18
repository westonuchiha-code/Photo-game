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
    c.font = 'bold 132px "Arial Black", Impact, sans-serif';
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
