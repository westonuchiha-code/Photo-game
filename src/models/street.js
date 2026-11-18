// Street furniture from the street photos.
import * as THREE from 'three';

const loader = new THREE.TextureLoader();
function tex(name, color = true) {
  const t = loader.load(`assets/textures/${name}`);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Light-blue steel pole with paint flaking off to rust (rusty-pole photos).
// A tall round pole with a slight taper, a top cap, and a cast base collar
// on a small concrete footing. The texture wraps once around the pole and
// repeats every 1.2 m up it.
export function makeRustyPole({ height = 7.5 } = {}) {
  const g = new THREE.Group();
  g.name = 'rusty_pole';
  const repeatV = height / 1.2;
  const mk = (name, color = true) => { const t = tex(name, color); t.repeat.set(1, repeatV); return t; };
  const paint = new THREE.MeshStandardMaterial({
    map: mk('rusty_paint.png'),
    normalMap: mk('rusty_paint_normal.png', false),
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughnessMap: mk('rusty_paint_rough.png', false),
    roughness: 1,
    metalness: 0.25,
  });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.105, height, 32, 1, true), paint);
  shaft.position.y = height / 2;
  shaft.castShadow = shaft.receiveShadow = true;
  g.add(shaft);
  const plain = new THREE.MeshStandardMaterial({ color: '#9fb0bb', roughness: 0.7, metalness: 0.3 });
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.088, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2), plain);
  cap.position.y = height;
  g.add(cap);
  const collarMat = paint.clone();
  for (const k of ['map', 'normalMap', 'roughnessMap']) { collarMat[k] = paint[k].clone(); collarMat[k].repeat.set(1.5, 0.3); }
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.35, 32), collarMat);
  collar.position.y = 0.175;
  collar.castShadow = true;
  g.add(collar);
  const footing = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 32), new THREE.MeshStandardMaterial({ color: '#8d8b86', roughness: 0.95 }));
  footing.position.y = 0.03;
  footing.receiveShadow = true;
  g.add(footing);
  g.userData.radius = 0.2;
  return g;
}
