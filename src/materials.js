// Materials built from the photo-derived textures in assets/textures.
// Colours come from assets/textures/palette.json (sampled from the photos);
// a few are nudged by eye where the photos were underexposed or warm-tinted.
import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = new Map();

export const palette = {
  stool_paint: '#c9a231',
  chair_pink: '#e4a196',
  counter_frame: '#a8aba3',
  post: '#1d1d1f',
  glass_tint: '#9fb8b4',
  wall: '#ece9e2',
  lime_wall: '#a9b545',
  booth_frame: '#b9bdb8',
  door_frame: '#75695b',
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

// A tiling surface material: colour map + optional normal map, repeated rx x ry times.
function surface(name, rx, ry, { normal = true, normalScale = 0.5, ...opts } = {}) {
  return new THREE.MeshStandardMaterial({
    map: tex(`${name}.png`, { repeat: [rx, ry] }),
    ...(normal ? {
      normalMap: tex(`${name}_normal.png`, { repeat: [rx, ry], color: false }),
      normalScale: new THREE.Vector2(normalScale, normalScale),
    } : {}),
    ...opts,
  });
}

export function makeMaterials() {
  return {
    // Mustard-yellow powder-coated steel (colour sampled from the stool legs).
    paint: new THREE.MeshStandardMaterial({ color: palette.stool_paint, roughness: 0.55, metalness: 0.25 }),
    pinkPaint: new THREE.MeshStandardMaterial({ color: palette.chair_pink, roughness: 0.6, metalness: 0.2 }),
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

    // Booth (booth photo).
    boothVinyl: new THREE.MeshStandardMaterial({
      map: tex('booth_vinyl.png'),
      normalMap: tex('booth_vinyl_normal.png', { color: false }),
      normalScale: new THREE.Vector2(0.4, 0.4),
      color: new THREE.Color(1.08, 1.15, 1.08), // nudge toward the lime seen in person
      roughness: 0.42,
    }),
    boothVinylDark: new THREE.MeshStandardMaterial({ color: '#7d8442', roughness: 0.6 }),
    boothFrame: new THREE.MeshStandardMaterial({ color: palette.booth_frame, roughness: 0.6 }),
    terrazzo: new THREE.MeshStandardMaterial({ map: tex('terrazzo.png'), roughness: 0.18, metalness: 0.05 }),

    // Storefront (entrance photo).
    doorFrame: new THREE.MeshStandardMaterial({ color: palette.door_frame, roughness: 0.4, metalness: 0.6 }),
    window: new THREE.MeshPhysicalMaterial({
      color: '#7f9a99', roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.22,
      side: THREE.DoubleSide, depthWrite: false,
    }),
    doorMat: surface('door_mat', 1, 1, { normalScale: 0.8, roughness: 1 }),
    matEdge: new THREE.MeshStandardMaterial({ color: '#1e1d1e', roughness: 0.9 }),

    // Surfaces that tile across the room.
    floorWood: (rx, ry) => surface('wood_floor', rx, ry, { roughness: 0.55 }),
    floorWalnut: (rx, ry) => surface('walnut_floor', rx, ry, { roughness: 0.5 }),
    floorVinyl: (rx, ry) => surface('vinyl_green', rx, ry, { normalScale: 0.6, roughness: 0.75 }),
    floorTriangle: (rx, ry) => surface('triangle_tile', rx, ry, { normalScale: 0.4, roughness: 0.35 }),
    subwayTile: (rx, ry) => surface('subway_tile', rx, ry, { normalScale: 1.0, roughness: 0.15 }),
    wall: new THREE.MeshStandardMaterial({ color: palette.wall, roughness: 0.9 }),
    limeWall: new THREE.MeshStandardMaterial({ color: palette.lime_wall, roughness: 0.85 }),
    ceiling: new THREE.MeshStandardMaterial({ color: '#f4f3ef', emissive: '#5a5855', roughness: 1 }),
  };
}
