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

// Pedestrian crossing pole (walk-button / ped-signal photos): dark grey round
// pole on a cast base, a push-button sign with a chrome dome button, and a
// signal head that cycles between the orange hand and the white walking person.
// Local axes: the button + signal face +z (toward the waiting pedestrian).
export function makeWalkSignalPole() {
  const g = new THREE.Group();
  g.name = 'walk_signal_pole';
  const grey = new THREE.MeshStandardMaterial({ color: '#3a3d40', roughness: 0.55, metalness: 0.5 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 3.4, 24), grey);
  pole.position.y = 1.7;
  pole.castShadow = true;
  g.add(pole);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.55, 8), grey);
  base.position.y = 0.275;
  g.add(base);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), grey);
  cap.position.y = 3.4;
  g.add(cap);

  // push-button sign + button housing
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.23, 0.345), new THREE.MeshStandardMaterial({ map: tex('walk_button_sign.png'), roughness: 0.5 }));
  sign.position.set(0, 1.42, 0.105);
  g.add(sign);
  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.07, 24), new THREE.MeshStandardMaterial({ color: '#202224', roughness: 0.5, metalness: 0.4 }));
  housing.rotation.x = Math.PI / 2;
  housing.position.set(0, 1.1, 0.13);
  g.add(housing);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: '#d8dadc', roughness: 0.15, metalness: 1 }));
  dome.rotation.x = Math.PI / 2;
  dome.position.set(0, 1.1, 0.165);
  g.add(dome);

  // signal head on a short arm near the top
  const head = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.22), new THREE.MeshStandardMaterial({ color: '#1b1c1e', roughness: 0.6 }));
  head.add(body);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.02, 0.16), body.material);
  visor.position.set(0, 0.22, 0.17);
  head.add(visor);
  const handMat = new THREE.MeshBasicMaterial({ map: tex('ped_hand_face.png'), color: new THREE.Color(2.0, 0.36, 0.0), toneMapped: false });
  const walkMat = new THREE.MeshBasicMaterial({ map: tex('ped_walk_face.png'), color: new THREE.Color(1.8, 1.85, 1.9), toneMapped: false });
  const offMat = new THREE.MeshBasicMaterial({ color: '#0b0b0c' });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.36), handMat);
  face.position.z = 0.111;
  head.add(face);
  const light = new THREE.PointLight('#ff8a2a', 1.2, 4, 2);
  light.position.z = 0.4;
  head.add(light);
  head.position.set(0, 2.85, 0.32);
  g.add(head);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.22), grey);
  arm.position.set(0, 2.85, 0.15);
  g.add(arm);

  // 12 s cycle: walk 6 s, flashing hand 4 s, solid hand 2 s (offset per pole)
  g.userData.update = (t, offset = 0) => {
    const c = (t + offset) % 12;
    if (c < 6) { face.material = walkMat; light.color.set('#e8eeff'); light.intensity = 1.0; }
    else if (c < 10) {
      const on = Math.floor(c * 2) % 2 === 0;
      face.material = on ? handMat : offMat; light.color.set('#ff8a2a'); light.intensity = on ? 1.2 : 0;
    } else { face.material = handMat; light.color.set('#ff8a2a'); light.intensity = 1.2; }
  };
  g.userData.radius = 0.22;
  return g;
}
