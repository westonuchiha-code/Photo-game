// Materials built from the photo-derived textures in assets/textures.
import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = new Map();

export const palette = {
  stool_paint: '#c9a231',
  counter_frame: '#a8aba3',
  post: '#1d1d1f',
  glass_tint: '#9fb8b4',
  wall: '#ece9e2',
};

function tex(name, { repeat = [1, 1], color = true } = {}) {
  const key = `${name}:${repeat}`;
  if (cache.has(key)) return cache.get(key);
  const t = loader.load(`assets/textures/${name}`);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, t);
  return t;
}

export function makeMaterials() {
  return {
    // Mustard-yellow powder-coated steel (colour sampled from the stool legs).
    paint: new THREE.MeshStandardMaterial({ color: palette.stool_paint, roughness: 0.55, metalness: 0.25 }),
    slat: new THREE.MeshStandardMaterial({ map: tex('slat_wood.png'), roughness: 0.6 }),
    bolt: new THREE.MeshStandardMaterial({ color: '#8d8a80', roughness: 0.35, metalness: 0.9 }),
    foot: new THREE.MeshStandardMaterial({ color: '#2b2b2b', roughness: 0.8 }),

    counterTop: new THREE.MeshStandardMaterial({
      map: tex('butcher_block.png'),
      normalMap: tex('butcher_block_normal.png', { color: false }),
      normalScale: new THREE.Vector2(0.4, 0.4),
      roughness: 0.45,
    }),
    counterEdge: new THREE.MeshStandardMaterial({ map: tex('butcher_block_edge.png'), roughness: 0.45 }),
    frame: new THREE.MeshStandardMaterial({ color: palette.counter_frame, roughness: 0.5, metalness: 0.3 }),
    kick: new THREE.MeshStandardMaterial({ color: '#c9cbc4', roughness: 0.7 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: palette.glass_tint, roughness: 0.05, metalness: 0, transparent: true,
      opacity: 0.18, side: THREE.DoubleSide, depthWrite: false,
    }),
    post: new THREE.MeshStandardMaterial({ color: palette.post, roughness: 0.4, metalness: 0.5 }),

    floorWood: (rx, ry) => new THREE.MeshStandardMaterial({
      map: tex('wood_floor.png', { repeat: [rx, ry] }),
      normalMap: tex('wood_floor_normal.png', { repeat: [rx, ry], color: false }),
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughness: 0.55,
    }),
    floorVinyl: (rx, ry) => new THREE.MeshStandardMaterial({
      map: tex('vinyl_green.png', { repeat: [rx, ry] }),
      normalMap: tex('vinyl_green_normal.png', { repeat: [rx, ry], color: false }),
      normalScale: new THREE.Vector2(0.6, 0.6),
      roughness: 0.75,
    }),
    wall: new THREE.MeshStandardMaterial({ color: palette.wall, roughness: 0.9 }),
    ceiling: new THREE.MeshStandardMaterial({ color: '#f4f3ef', emissive: '#9a9893', roughness: 1 }),
  };
}
