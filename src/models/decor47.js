// Decor / shelf clutter (queue item 47, photos/decor/). Real game titles, console brands and characters are
// replaced with original ones (cartridges and boxes reuse the PIXEL ARK set from item 37).
//   makePachinko()   vintage vertical pinball cabinet: the photo's playfield, chrome frame, yellow front and
//                    ball tray straight from the photo on the face; wooden cabinet sides, glass, a few steel
//                    balls in the tray, a coin slot knob.
//   makeGalaxyPC()   tower PC airbrushed with a galaxy (the photo's panel), a window showing its insides
//                    (cooler tubes, red-lit fan) with a faint red glow, front mesh, a little drive box on top.
//   makeRetroShelf() low wooden bookcase: rows of original cartridges (grey, black, red, green, gold), boxed
//                    games lying on their spines, two small consoles, a round plush critter, figurines.
import * as THREE from 'three';
import { F, fitText } from '../fonts.js';
import { makeCartridge, makeGameBox } from './electronics37.js';

const _L = new THREE.TextureLoader();
function tex(name) { const t = _L.load(`assets/textures/${name}.png`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function std(o) { return new THREE.MeshStandardMaterial({ roughness: 0.5, ...o }); }
function box(w, h, d, mat, x, y, z, p) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function makePachinko() {
  const g = new THREE.Group(); g.name = 'pachinko';
  const W = 0.5, H = 0.88, D = 0.22, Y = 0.75;            // stands on a small table/stool height
  const wood = std({ color: '#c8a050', roughness: 0.7 }), yel = std({ color: '#d8b860', roughness: 0.6 });
  box(W, H, D, wood, 0, Y + H / 2, -D / 2, g);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(W, H), std({ map: tex('dc_pachinko'), roughness: 0.45 })); face.position.set(0, Y + H / 2, 0.002); g.add(face);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.84, H * 0.6), new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.12, roughness: 0.02, depthWrite: false })); gl.position.set(-0.01, Y + H * 0.66, 0.02); g.add(gl);
  const chrome = std({ color: '#c8ccd0', metalness: 0.5, roughness: 0.3 });
  // the ball tray juts out at the bottom, steel balls in it, the knob
  box(W * 0.84, 0.05, 0.08, chrome, 0, Y + 0.09, 0.04, g);
  for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 10, 8), chrome); b.position.set(-0.15 + i * 0.016 + (i % 2) * 0.004, Y + 0.12, 0.05 + (i % 3) * 0.008); g.add(b); }
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 16), chrome); knob.rotation.x = Math.PI / 2; knob.position.set(0.14, Y + 0.14, 0.02); g.add(knob);
  // a little table under it
  box(0.6, 0.04, 0.4, std({ color: '#6a4a30' }), 0, Y - 0.02, -0.12, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.04, Y - 0.04, 0.04, std({ color: '#5a3a24' }), sx * 0.26, (Y - 0.04) / 2, -0.12 + sz * 0.16, g);
  void yel; return g;
}

export function makeGalaxyPC() {
  const g = new THREE.Group(); g.name = 'galaxy_pc';
  const L = 0.52, H = 0.46, W = 0.23;                       // side faces +z, front at +x
  const dark = std({ color: '#1e1f22', roughness: 0.45, metalness: 0.3 });
  box(L, H, W, dark, 0, H / 2 + 0.02, 0, g);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(L, H), std({ map: tex('dc_galaxy'), roughness: 0.35, metalness: 0.15 })); side.position.set(0, H / 2 + 0.02, W / 2 + 0.002); g.add(side);
  // window: the inside a little recessed, glass on top, red glow from the fan
  const ins = new THREE.Mesh(new THREE.PlaneGeometry(L * 0.52, H * 0.6), new THREE.MeshBasicMaterial({ map: tex('dc_pcinside') })); ins.position.set(-L * 0.12, H * 0.6, W / 2 - 0.03); g.add(ins);
  const fan = new THREE.PointLight('#ff4a3a', 0.08, 0.6, 2); fan.position.set(-L * 0.3, H * 0.75, W / 2 + 0.05); g.add(fan);
  // front: mesh vents + power button
  const mesh = std({ color: '#2a2b2e', roughness: 0.7, metalness: 0.4 });
  for (let i = 0; i < 20; i++) box(0.004, H - 0.08, 0.012, mesh, L / 2 + 0.003, H / 2 + 0.02, -W / 2 + 0.02 + i * 0.01, g);
  const pb = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 12), std({ color: '#c8ccd0', emissive: '#4a8aff', emissiveIntensity: 0.6 })); pb.rotation.z = Math.PI / 2; pb.position.set(L / 2 + 0.005, H - 0.03, 0.06); g.add(pb);
  for (const [x, z] of [[-L / 2 + 0.04, -W / 2 + 0.03], [L / 2 - 0.04, -W / 2 + 0.03], [-L / 2 + 0.04, W / 2 - 0.03], [L / 2 - 0.04, W / 2 - 0.03]]) box(0.03, 0.02, 0.03, std({ color: '#111' }), x, 0.01, z, g);
  box(0.15, 0.04, 0.1, std({ color: '#3a3c40', metalness: 0.7, roughness: 0.25 }), 0.08, H + 0.04, 0, g);    // the external drive on top
  return g;
}

export function makeRetroShelf() {
  const g = new THREE.Group(); g.name = 'retro_shelf';
  const W = 1.0, H = 1.2, D = 0.32;
  const wood = std({ color: '#7a5434', roughness: 0.7 }), black = std({ color: '#141414', roughness: 0.6 });
  for (const x of [-W / 2, W / 2]) box(0.025, H, D, wood, x, H / 2, 0, g);
  box(W, 0.025, D, wood, 0, H, 0, g); box(W, 0.012, 0.012, wood, 0, H / 2, -D / 2, g);
  const shelves = [0.03, 0.42, 0.8];
  shelves.forEach((y) => box(W, 0.025, D, wood, 0, y, 0, g));
  box(W, H, 0.01, std({ color: '#5a3c24' }), 0, H / 2, -D / 2, g);
  const r = rng(47);
  // shelf 1: a row of standing cartridges in assorted shells (original titles)
  const titles = [['STAR PUFF', '#3a3a3c', '#f070b0'], ['MOLE MINER', '#c8c8c4', '#40a060'], ['KITE WARS', '#202022', '#e0a020'], ['TIDE RUNNER', '#c81e28', '#2a8ad0'], ['BRICK OWL', '#2a6a3a', '#8a4ad0'], ['SKY LANCE', '#c8a040', '#2ab0c0'], ['NOODLE CHEF', '#e8e6e0', '#e0a020'], ['GHOST POST', '#202022', '#7050c0'], ['ROBO DOJO', '#c8c8c4', '#d04030'], ['PIE SUMO', '#3a3a3c', '#e08040'], ['NEON RALLY', '#202022', '#e040a0'], ['BIT TOWER', '#c81e28', '#4060d0']];
  titles.forEach(([t, sh, a], i) => { const c = makeCartridge(t, sh, a, 0.06, 0.09); c.position.set(-W / 2 + 0.06 + i * 0.074, shelves[0] + 0.013, 0.02); c.rotation.y = (r() - 0.5) * 0.08; g.add(c); });
  // shelf 2: boxed games standing like books
  for (let i = 0; i < 9; i++) { const b = makeGameBox(titles[i][0], titles[i][2]); b.position.set(-W / 2 + 0.07 + i * 0.1, shelves[1] + 0.013, -0.04 + (i % 2) * 0.03); b.rotation.y = (r() - 0.5) * 0.15; b.scale.set(1.25, 1.5, 1.25); g.add(b); }
  // shelf 3 (top surface): two small consoles, a plush critter, figurines
  const con = (x, col) => { const c = new THREE.Group(); c.position.set(x, shelves[2] + 0.013, 0); g.add(c); box(0.2, 0.06, 0.16, std({ color: col, roughness: 0.4 }), 0, 0.03, 0, c); box(0.05, 0.012, 0.08, black, -0.04, 0.066, 0, c); const led = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 6), new THREE.MeshBasicMaterial({ color: '#40ff60' })); led.position.set(0.09, 0.04, 0.081); c.add(led); return c; };
  con(-0.33, '#d8d4c8'); con(0.32, '#2a2a2e');
  const plush = new THREE.Group(); plush.position.set(0, shelves[2] + 0.013, 0.02); g.add(plush);
  const fur = std({ color: '#f2a23a', roughness: 1 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 14), fur); body.scale.set(1, 0.9, 0.9); body.position.y = 0.09; plush.add(body);
  for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), fur); ear.scale.set(1, 0.5, 1); ear.position.set(s * 0.06, 0.17, 0); plush.add(ear); const ft = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), std({ color: '#6a3a1a', roughness: 0.9 })); ft.scale.set(1, 0.6, 1.2); ft.position.set(s * 0.05, 0.02, 0.04); plush.add(ft); }
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.04, 10), std({ color: '#f2d23a' })); beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.105, 0.095); plush.add(beak);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 10), std({ color: '#f2e2c8', roughness: 1 })); belly.scale.set(1, 0.9, 0.5); belly.position.set(0, 0.08, 0.055); plush.add(belly);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), black); e.position.set(s * 0.03, 0.12, 0.08); plush.add(e); }
  for (let i = 0; i < 3; i++) { const fig = new THREE.Group(); fig.position.set(-0.15 + i * 0.1 + (i > 0 ? 0.2 : 0), shelves[2] + 0.013, 0.1); g.add(fig); const col = ['#f2c21a', '#e05a2a', '#7ac04a'][i]; const b2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.03, 4, 8), std({ color: col })); b2.position.y = 0.035; fig.add(b2); const h = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), std({ color: col })); h.position.y = 0.075; fig.add(h); box(0.04, 0.008, 0.04, black, 0, 0.004, 0, fig); }
  return g;
}
