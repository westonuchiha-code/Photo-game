// Cleaning robot (queue item 54, photos/vending/cleaning-robot.jpg). A small floor-scrubber robot: white rounded
// body (its front is the photo: the cartoon eyes and the green/yellow beginner-driver sticker; maker's logo
// painted out), black top deck with a black handle loop, red stop button, a camera slot, a yellow label strip
// with a made-up name, a blue light strip that pulses, black bumper base with a squeegee.
//   makeCleanBot()  0.55 x 0.5 x 0.55 m, front toward +z, ground y = 0.
//   userData.patrol(points)  returns update(t) that drives it back and forth along the given [x, z] points
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { F, fitText } from '../fonts.js';

function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.4, ...o }); }
export function makeCleanBot() {
  const g = new THREE.Group(); g.name = 'clean_bot';
  const bot = new THREE.Group(); g.add(bot);
  const black = std({ color: '#1a1b1d', roughness: 0.55 }), white = std({ color: '#f2f2ee', roughness: 0.35 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.17, 0.56, 3, 0.025), black); base.position.y = 0.1; base.castShadow = true; bot.add(base);
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.24, 0.5, 3, 0.03), white); body.position.y = 0.3; body.castShadow = true; bot.add(body);
  const ft = new THREE.TextureLoader().load('assets/textures/cb_face.png'); ft.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.2), std({ map: ft, roughness: 0.35 })); face.position.set(0, 0.3, 0.2515); bot.add(face);
  const ledM = new THREE.MeshBasicMaterial({ color: '#3aa0ff' });
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.012, 0.01), ledM); led.position.set(0, 0.42, 0.252); bot.add(led);
  const deck = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.06, 0.48, 3, 0.02), black); deck.position.y = 0.45; bot.add(deck);
  const pod = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.09, 0.2, 3, 0.03), black); pod.position.set(0, 0.52, 0.04); bot.add(pod);
  const cam = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.07), std({ color: '#3a3c40', roughness: 0.1, metalness: 0.5 })); cam.position.set(0, 0.52, 0.141); bot.add(cam);
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 20), std({ color: '#d81e1e', roughness: 0.3 })); btn.position.set(0, 0.58, 0.02); bot.add(btn);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 6, 20), std({ color: '#f2c21a' })); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.567, 0.02); bot.add(ring);
  const lab = document.createElement('canvas'); lab.width = 256; lab.height = 32; const x = lab.getContext('2d'); x.fillStyle = '#f2d21a'; x.fillRect(0, 0, 256, 32); x.fillStyle = '#111'; fitText(x, 'TIDYBOT · CLEANING', 128, 17, 240, 22, F.label, { spacing: 2 });
  const lt = new THREE.CanvasTexture(lab); lt.colorSpace = THREE.SRGBColorSpace;
  const lm = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.025), std({ map: lt })); lm.position.set(0, 0.547, 0.142); bot.add(lm);
  // handle loop over the back
  const hp = []; for (let i = 0; i <= 20; i++) { const a = i / 20 * Math.PI; hp.push(new THREE.Vector3(Math.cos(a) * 0.24, 0.5 + Math.sin(a) * 0.04, -0.14 + Math.sin(a) * 0.02)); }
  const handle = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hp), 24, 0.018, 8), black); bot.add(handle);
  for (const s of [-1, 1]) { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.32), black); arm.position.set(s * 0.24, 0.5, 0.0); bot.add(arm); }
  const sq = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.04), std({ color: '#2a2a2a' })); sq.position.set(0, 0.015, -0.27); bot.add(sq);
  const t0 = Math.random() * 10;
  g.userData.patrol = (pts, speed = 0.35) => {
    const seg = []; let total = 0;
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push([a, b, l]); total += l; }
    return (t) => {
      let d = ((t + t0) * speed) % total;
      for (const [a, b, l] of seg) { if (d <= l) { const k = d / l; g.position.x = a[0] + (b[0] - a[0]) * k; g.position.z = a[1] + (b[1] - a[1]) * k; g.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); break; } d -= l; }
      ledM.color.setHSL(0.58, 1, 0.45 + 0.15 * Math.sin(t * 3));
    };
  };
  return g;
}
