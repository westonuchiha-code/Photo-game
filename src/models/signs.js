// Street signs from the two sign photos. Faces are the straightened photos.
// Local axes: +y up, the sign face points +z. Units: metres.
import * as THREE from 'three';
import { box, cyl } from '../world/util.js';

const loader = new THREE.TextureLoader();
function faceTex(name) {
  const t = loader.load(`assets/textures/${name}`);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// LIQUOR: a backlit box sign on two round poles. The front pole (black) is
// bolted to a concrete pad with a gusset; the left pole (dark green) sits on
// a round concrete footing. A concrete wheel stop lies beside the pad.
export function makeLiquorSign(mats) {
  const g = new THREE.Group();
  g.name = 'liquor_pole_sign';
  const W = 3.6, Hs = 1.4, D = 0.35, bottom = 2.8;
  const y = bottom + Hs / 2;
  const frameMat = new THREE.MeshStandardMaterial({ color: '#24221f', roughness: 0.6, metalness: 0.3 });
  // cabinet: frame sides + top/bottom, faces inset
  g.add(box(W + 0.12, 0.08, D, frameMat, 0, bottom - 0.04, 0));
  g.add(box(W + 0.12, 0.08, D, frameMat, 0, bottom + Hs + 0.04, 0));
  for (const s of [-1, 1]) g.add(box(0.08, Hs + 0.16, D, frameMat, s * (W / 2 + 0.02), y, 0));
  const tex = faceTex('liquor_face.png');
  const faceMat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color(0.62, 0.56, 0.5), roughness: 0.6 });
  for (const s of [1, -1]) { // double-faced, like most pole signs
    const face = new THREE.Mesh(new THREE.PlaneGeometry(W, Hs), faceMat);
    face.position.set(0, y, s * (D / 2 - 0.01));
    if (s < 0) face.rotation.y = Math.PI;
    g.add(face);
  }
  // warm light spilling from the face onto the ground, as in the photo
  const spill = new THREE.PointLight('#ffcf9a', 3, 8, 2);
  spill.position.set(0, 1.2, 1.6);
  g.add(spill);

  // front pole: black steel, base plate + gusset on a concrete pad
  const black = new THREE.MeshStandardMaterial({ color: '#1e2220', roughness: 0.55, metalness: 0.4 });
  const concrete = mats.sidewalk;
  const px = 0.35;
  g.add(cyl(0.11, bottom, black, px, bottom / 2, 0, 20));
  g.add(box(0.7, 0.12, 0.95, concrete, px, 0.06, 0.05, { unit: 0.5 }));
  g.add(box(0.36, 0.02, 0.36, black, px, 0.13, 0));
  const gusset = box(0.02, 0.25, 0.22, black, px - 0.13, 0.25, 0);
  gusset.rotation.z = 0.5;
  g.add(gusset);
  for (const [bx, bz] of [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]]) g.add(cyl(0.015, 0.04, black, px + bx, 0.15, bz, 8));
  // concrete wheel stop beside the pad
  const stop = box(1.9, 0.14, 0.28, concrete, px + 1.35, 0.07, 0.25, { unit: 0.5 });
  stop.rotation.y = 0.25;
  g.add(stop);

  // left pole: dark green, round footing
  const green = new THREE.MeshStandardMaterial({ color: '#1d3b30', roughness: 0.55, metalness: 0.35 });
  const lx = -1.2;
  g.add(cyl(0.085, bottom, green, lx, bottom / 2, 0, 18));
  g.add(cyl(0.28, 0.14, concrete, lx, 0.07, 0, 24));

  g.userData.poles = [[px, 0, 0.3], [lx, 0, 0.3]];
  return g;
}

// Rental sign (Two Rivers photo; text made up): a white panel sign in a grey box frame on a single grey pole.
export function makeTwoRiversSign() {
  const g = new THREE.Group();
  g.name = 'two_rivers_pole_sign';
  const W = 1.4, Hs = 1.26, D = 0.2, bottom = 2.3;
  const y = bottom + Hs / 2;
  const frameMat = new THREE.MeshStandardMaterial({ color: '#c9ccc4', roughness: 0.6, metalness: 0.2 });
  g.add(box(W + 0.1, 0.06, D, frameMat, 0, bottom - 0.03, 0));
  g.add(box(W + 0.1, 0.06, D, frameMat, 0, bottom + Hs + 0.03, 0));
  for (const s of [-1, 1]) g.add(box(0.05, Hs + 0.12, D, frameMat, s * (W / 2 + 0.025), y, 0));
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex('rental_sign_face.png'), roughness: 0.7 });
  for (const s of [1, -1]) {
    const face = new THREE.Mesh(new THREE.PlaneGeometry(W, Hs), faceMat);
    face.position.set(0, y, s * (D / 2 - 0.005));
    if (s < 0) face.rotation.y = Math.PI;
    g.add(face);
  }
  const pole = new THREE.MeshStandardMaterial({ color: '#8e968f', roughness: 0.5, metalness: 0.5 });
  g.add(cyl(0.06, bottom, pole, 0, bottom / 2, 0, 16));
  g.userData.poles = [[0, 0, 0.2]];
  return g;
}
