// Robot vending machine (queue item 53, photos/vending/robot-vending1..3). A yellow drink machine dressed as a
// boxy robot. The front (drinks behind glass with price tags, the gear-filled panel, coin/bill slots, pickup
// flap, stickers) and the head's speaker "eye" are the photo itself; the real name is painted out and a
// made-up "ROBO-POP" lettered on. Faded peeling paint, a taped patch, shoulder pods, chunky arms with blocky
// hands, foot plates. Next to it an ordinary blue and a red vending machine with made-up drinks.
//   makeRobotVending()  ~1.0 m wide body, 2.3 m to the top of the head; front toward +z, ground y = 0
//   makePlainVending(color)  an ordinary drink machine (blue / red)
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';

const _L = new THREE.TextureLoader();
function tex(name) { const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.6, ...o }); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function canvasT(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

// faded yellow paint with chips and grime, for the sides and robot parts
let _paint = null;
function paintTex() {
  if (_paint) return _paint;
  _paint = canvasT(256, 256, (x) => { x.fillStyle = '#e2b434'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '255,240,200' : '120,90,30'},${Math.random() * 0.08})`; x.fillRect(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 12, 2 + Math.random() * 6); }
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(${200 + Math.random() * 40},${170 + Math.random() * 40},${140 + Math.random() * 30},0.9)`; x.beginPath(); x.ellipse(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 8, 1 + Math.random() * 5, Math.random() * 3, 0, 7); x.fill(); }
    const g = x.createLinearGradient(0, 180, 0, 256); g.addColorStop(0, 'rgba(60,40,20,0)'); g.addColorStop(1, 'rgba(60,40,20,0.35)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); });
  _paint.wrapS = _paint.wrapT = THREE.RepeatWrapping; return _paint;
}
export function makeRobotVending() {
  const g = new THREE.Group(); g.name = 'robot_vending';
  const W = 1.0, H = 1.73, D = 0.75, FOOT = 0.14;
  const yel = std({ map: paintTex(), roughness: 0.65 }), pale = std({ map: paintTex(), color: '#f2d8a8', roughness: 0.7 });
  // body
  box(W, H, D, yel, 0, FOOT + H / 2, 0, g);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.04, H - 0.04), std({ map: tex('rv_front'), roughness: 0.4 })); front.position.set(0, FOOT + H / 2, D / 2 + 0.002); g.add(front);
  const name = canvasT(512, 128, (x) => { x.clearRect(0, 0, 512, 128); x.fillStyle = '#f6f2e6'; fitText(x, 'ROBO-POP', 256, 66, 470, 104, F.heavy, { spacing: 6 }); });
  const nm = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.2), std({ map: name, transparent: true })); nm.position.set(0, FOOT + 0.16, D / 2 + 0.004); g.add(nm);
  // a taped patch + a couple of stickers on the side
  const tape = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.08), std({ color: '#d8d0b0', roughness: 0.8, transparent: true, opacity: 0.9 })); tape.rotation.y = Math.PI / 2; tape.rotation.x = 0.2; tape.position.set(W / 2 + 0.003, 0.9, 0.1); g.add(tape);
  const stk = canvasT(256, 256, (x) => { x.clearRect(0, 0, 256, 256); x.fillStyle = '#fff'; x.beginPath(); x.roundRect(10, 10, 110, 70, 10); x.fill(); x.fillStyle = '#c81e28'; fitText(x, 'BZZT!', 65, 46, 96, 40, F.marker); x.strokeStyle = '#111'; x.lineWidth = 5; x.beginPath(); x.moveTo(140, 140); x.bezierCurveTo(180, 100, 220, 200, 250, 150); x.stroke(); fitText(x, 'zap', 190, 210, 100, 40, F.marker); });
  const sm = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), std({ map: stk, transparent: true })); sm.rotation.y = -Math.PI / 2; sm.position.set(-W / 2 - 0.003, 0.7, 0.05); g.add(sm);
  // head: a box sitting forward on top, the photo's speaker face, a little antenna
  const HY = FOOT + H, hw = 0.5, hh = 0.62, hd = 0.5;
  box(hw, hh, hd, pale, 0.18, HY + hh / 2 - 0.05, 0.2, g);
  const hf = new THREE.Mesh(new THREE.PlaneGeometry(hw, hh * 0.98), std({ map: tex('rv_head'), roughness: 0.6 })); hf.position.set(0.18, HY + hh / 2 - 0.05, 0.2 + hd / 2 + 0.002); g.add(hf);
  box(0.03, 0.2, 0.03, pale, 0.3, HY + hh + 0.03, 0.15, g);
  // shoulder pods + chunky arms + blocky hands, foot plates
  for (const s of [-1, 1]) {
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 20), pale); sh.rotation.z = Math.PI / 2; sh.position.set(s * (W / 2 + 0.11), FOOT + H - 0.22, 0); sh.castShadow = true; g.add(sh);
    box(0.2, 0.55, 0.26, yel, s * (W / 2 + 0.12), FOOT + H - 0.62, 0.02, g);
    box(0.18, 0.5, 0.22, pale, s * (W / 2 + 0.12), FOOT + H - 1.12, 0.06, g);
    const hand = box(0.22, 0.2, 0.26, yel, s * (W / 2 + 0.12), FOOT + H - 1.47, 0.08, g);
    for (let i = 0; i < 3; i++) box(0.05, 0.08, 0.05, pale, s * (W / 2 + 0.12) + (i - 1) * 0.06, FOOT + H - 1.6, 0.18, g);
    void hand;
    box(0.42, FOOT, 0.95, yel, s * 0.28, FOOT / 2, 0.08, g);
    box(0.1, 0.08, 0.1, std({ color: '#2a2a2a' }), s * 0.28, FOOT + 0.04, 0.5, g);
  }
  g.userData.collider = [-W / 2 - 0.25, W / 2 + 0.25, -D / 2, D / 2 + 0.25];
  return g;
}
export function makePlainVending(color = '#1d4aa8') {
  const g = new THREE.Group(); g.name = 'plain_vending';
  const W = 1.0, H = 1.83, D = 0.72;
  const body = std({ color, roughness: 0.45, metalness: 0.2 });
  box(W, H, D, body, 0, H / 2 + 0.05, 0, g);
  const face = canvasT(512, 940, (x, w, h) => {
    x.fillStyle = color; x.fillRect(0, 0, w, h);
    x.fillStyle = '#f2f4f6'; x.fillRect(20, 30, w - 40, 470);
    const cols = ['#c81e28', '#2a8ad0', '#f2c21a', '#3aa04a', '#e05a9a', '#6a3a1a', '#f08a2a'];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) { const cx = 46 + c * 65, cy = 60 + r * 112; x.fillStyle = cols[(r * 3 + c) % cols.length]; x.beginPath(); x.roundRect(cx - 18, cy, 36, 70, 8); x.fill(); x.fillStyle = '#fff'; x.fillRect(cx - 14, cy + 20, 28, 14); x.fillStyle = '#111'; x.font = `14px ${F.small}`; x.textAlign = 'center'; x.fillText(`${110 + ((r + c) % 5) * 10}`, cx, cy + 92); x.fillStyle = '#3a8ad8'; x.fillRect(cx - 6, cy + 98, 12, 6); }
    x.fillStyle = '#fff'; fitText(x, color === '#1d4aa8' ? 'COOL STOP' : 'FIZZ TOWN', w / 2, 560, w - 60, 70, F.retro, { spacing: 4 });
    x.fillStyle = '#111'; x.fillRect(60, 760, w - 120, 110); x.fillStyle = '#c8ccd0'; x.fillRect(w - 110, 620, 50, 90);
  });
  const fm = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.04, H - 0.06), std({ map: face, emissive: '#ffffff', emissiveMap: face, emissiveIntensity: 0.25, roughness: 0.3 })); fm.position.set(0, H / 2 + 0.05, D / 2 + 0.002); g.add(fm);
  g.userData.collider = [-W / 2, W / 2, -D / 2, D / 2];
  return g;
}
