// Your own hands and sleeves, seen in first person. There is no body: two forearms hang off the camera and come into
// view only when you do something (take a thing off a shelf, push a door, reach for a car door, eat, hold a torch or an
// umbrella). The sleeve is whatever you are wearing.
//   makeHands(camera) -> { dress({ coat, shirt }), play('reach' | 'push' | 'eat', itemName?), torch(on), umbrella(up),
//                          update(dt, moving), light: SpotLight, busy }
import * as THREE from 'three';
import { makeGood } from '../shop/goods.js';

const SKIN = '#c49a7c';
const SLEEVES = {   // [sleeve, cuff, sleeve radius at the wrist, at the elbow]
  none:   ['#6a6d72', '#5c5f64', 0.040, 0.052],   // a grey sweatshirt
  shirt:  ['#f2f0ea', '#dcdad2', 0.036, 0.046],
  jacket: ['#27324a', '#1c2436', 0.046, 0.060],
};
// poses: [x, y, z, pitch (up), yaw (inward), roll, finger curl]
const POSE = {
  away:  [0.30, -0.80, -0.20, 0.5, 0.0, 0.0, 0.3],
  reach: [0.17, -0.26, -0.34, 0.30, 0.22, 0.5, 0.15],
  push:  [0.15, -0.22, -0.30, 0.85, 0.15, 0.2, 0.0],
  eat:   [0.10, -0.30, -0.20, 1.15, 0.30, 0.9, 0.9],
  hold:  [0.25, -0.33, -0.28, 0.12, 0.05, 1.2, 1.25],
  brolly: [0.26, -0.52, -0.40, 1.25, 0.0, 1.35, 1.25],
};
const lerp = (a, b, k) => a + (b - a) * k;

function makeArm(side) {   // side: 1 right, -1 left. Origin at the elbow; the forearm runs along -z to the hand.
  const g = new THREE.Group(), L = 0.30;
  const sleeveM = new THREE.MeshStandardMaterial({ color: SLEEVES.none[0], roughness: 0.92 }), cuffM = new THREE.MeshStandardMaterial({ color: SLEEVES.none[1], roughness: 0.9 }), skinM = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.75 });
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, L, 14, 1, true), sleeveM); sleeve.rotation.x = Math.PI / 2; sleeve.position.z = -L / 2 + 0.02; g.add(sleeve);
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.035, 14), cuffM); cuff.rotation.x = Math.PI / 2; cuff.position.z = -L + 0.02; g.add(cuff);
  const hand = new THREE.Group(); hand.position.z = -L; g.add(hand);
  const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.05, 10), skinM); wrist.rotation.x = Math.PI / 2; wrist.position.z = -0.01; hand.add(wrist);
  const palm = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.028, 0.09), skinM); palm.position.set(0, 0, -0.075); hand.add(palm);
  const fingers = [];
  for (let i = 0; i < 4; i++) { const f = new THREE.Group(); f.position.set(-0.031 + i * 0.0207, 0, -0.12); hand.add(f); const len = [0.07, 0.08, 0.075, 0.06][side > 0 ? i : 3 - i];
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.02, len * 0.55), skinM); a.position.z = -len * 0.275; f.add(a); const tip = new THREE.Group(); tip.position.z = -len * 0.55; f.add(tip); const b = new THREE.Mesh(new THREE.BoxGeometry(0.017, 0.018, len * 0.45), skinM); b.position.z = -len * 0.225; tip.add(b); fingers.push([f, tip]); }
  const thumb = new THREE.Group(); thumb.position.set(-side * 0.041, -0.004, -0.05); thumb.rotation.y = side * 0.75; hand.add(thumb); { const a = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.06), skinM); a.position.z = -0.03; thumb.add(a); }
  const grip = new THREE.Group(); grip.position.set(0, -0.03, -0.09); hand.add(grip);   // (what the hand holds hangs here)
  g.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.frustumCulled = false; } });
  const curl = (c) => { for (const [f, tip] of fingers) { f.rotation.x = -c * 0.9; tip.rotation.x = -c * 1.0; } thumb.rotation.z = side * c * 0.5; };
  const dress = (kind) => { const [s, c, r0, r1] = SLEEVES[kind] || SLEEVES.none; sleeveM.color.set(s); cuffM.color.set(c); const p = sleeve.geometry.attributes.position; if (!sleeve.userData.base) sleeve.userData.base = p.array.slice(); const b = sleeve.userData.base; for (let i = 0; i < p.count; i++) { const r = b[i * 3 + 1] > 0 ? r0 : r1; p.setXYZ(i, b[i * 3] * r, b[i * 3 + 1], b[i * 3 + 2] * r); } p.needsUpdate = true; sleeve.geometry.computeVertexNormals(); cuff.scale.set(r0 + 0.004, 1, r0 + 0.004); };
  dress('none'); g.scale.x = 1; return { g, hand, grip, curl, dress, side, cur: POSE.away.slice() };
}

export function makeHands(camera) {
  const R = makeArm(1), Lf = makeArm(-1); camera.add(R.g, Lf.g); R.g.visible = Lf.g.visible = false;
  // the torch: a lamp that is always there (so nothing has to be rebuilt when it is switched on), dark until it is
  const light = new THREE.SpotLight('#fff0cc', 0, 45, 0.4, 0.6, 1.3); light.position.set(0.08, -0.2, -0.85); light.target.position.set(0.02, -0.08, -6); light.castShadow = false; camera.add(light, light.target);
  const torch = makeGood('Flashlight'); torch.rotation.y = Math.PI; torch.position.set(0, -0.012, 0.1); torch.visible = false; R.grip.add(torch); torch.frustumCulled = false;
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.025, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.1, 1.7), toneMapped: false })); lens.rotation.y = Math.PI; lens.position.set(0, 0.018, -0.073); lens.visible = false; R.grip.add(lens); lens.frustumCulled = false;
  // the umbrella: a shaft in the left fist and a canopy over your head
  let canopy = null; const brolly = new THREE.Group(); brolly.visible = false; Lf.grip.add(brolly); { const dark = new THREE.MeshStandardMaterial({ color: '#17181c', roughness: 0.8, side: THREE.DoubleSide }), metal = new THREE.MeshStandardMaterial({ color: '#b8b8b8', roughness: 0.35, metalness: 0.7 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.86, 8), metal); shaft.rotation.x = Math.PI / 2; shaft.position.z = -0.33; brolly.add(shaft);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.14, 8), new THREE.MeshStandardMaterial({ color: '#7a5a34', roughness: 0.5 })); handle.rotation.x = Math.PI / 2; handle.position.z = 0.03; brolly.add(handle);
    canopy = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 3, 0, Math.PI * 2, 0, 1.0), new THREE.MeshStandardMaterial({ color: '#17181c', roughness: 0.8, side: THREE.DoubleSide, flatShading: true })); canopy.position.set(-0.04, -0.02, -0.12); canopy.visible = false; canopy.frustumCulled = false; canopy.castShadow = false; camera.add(canopy);   /* (over your head, not in the fist: it must not swing with the arm) */
    brolly.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.frustumCulled = false; } }); }
  let torchOn = false, brollyUp = false, anim = null, held = null, bob = 0;
  const target = (arm) => { if (arm === R) { if (anim) { const k = anim.t / anim.len, P = POSE[anim.kind]; const w = anim.kind === 'eat' ? Math.min(1, Math.sin(Math.min(1, k) * Math.PI) * 1.6) : Math.sin(Math.min(1, k) * Math.PI); const base = torchOn ? POSE.hold : POSE.away; return base.map((v, i) => lerp(v, P[i], w)); } return torchOn ? POSE.hold : POSE.away; } return brollyUp ? POSE.brolly : POSE.away; };
  const place = (arm, dt) => { const T = target(arm), c = arm.cur, k = Math.min(1, dt * 11); for (let i = 0; i < 7; i++) c[i] = lerp(c[i], T[i], k); const s = arm.side; arm.g.position.set(s * c[0] * Math.max(0.42, Math.min(1, camera.aspect / 1.3)), c[1] + Math.sin(bob) * 0.006, c[2]); arm.g.rotation.set(c[3], s * c[4], -s * c[5], 'YXZ'); arm.curl(c[6]); arm.g.visible = !api.hidden && c[1] > -0.74; };
  const api = { light, hidden: false, get busy() { return !!anim; }, get torchOn() { return torchOn; }, get umbrellaUp() { return brollyUp; },
    dress({ coat = false, shirt = false } = {}) { const k = coat ? 'jacket' : shirt ? 'shirt' : 'none'; R.dress(k); Lf.dress(k); },
    play(kind, item = null) { if (held) { R.grip.remove(held); held = null; } anim = { kind, t: 0, len: kind === 'eat' ? 1.5 : kind === 'push' ? 0.6 : 0.55 }; if (item && !torchOn) { held = makeGood(item); if (held) { held.frustumCulled = false; held.position.set(0, 0.0, 0.0); held.rotation.x = kind === 'eat' ? -0.6 : 0; R.grip.add(held); held.visible = kind === 'eat'; } } },
    torch(on) { torchOn = on; torch.visible = lens.visible = on; light.intensity = on ? 46 : 0; }, umbrella(up) { brollyUp = up; brolly.visible = up; },
    update(dt, moving) { if (moving) bob += dt * 9; if (anim) { anim.t += dt; if (held && anim.kind === 'reach') held.visible = anim.t > anim.len * 0.5; if (anim.t >= anim.len) { anim = null; if (held) { R.grip.remove(held); held = null; } } } place(R, dt); place(Lf, dt); light.intensity = torchOn && !api.hidden ? 130 : 0; canopy.visible = brollyUp && !api.hidden; } };
  return api;
}
